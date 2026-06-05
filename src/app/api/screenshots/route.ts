import { NextRequest, NextResponse } from "next/server";
import { getServerRuntime } from "@/server/runtime";
import { randomUUID } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { z } from "zod";
import { env } from "@/server/config/env";
import type { ScreenshotInput } from "@/server/types/screenshot";
import {
  ScreenshotPayloadSchema,
  LocalMetaSchema,
} from "@/server/types/ingestion";

// Validates non-file fields extracted from multipart/form-data for local uploads
const LocalUploadFormSchema = z.object({
  type: z.literal("local").default("local"),
  sourceRef: z.string().optional(),
  originalFileName: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metadata: LocalMetaSchema.optional(),
});

export async function GET() {
  const { repository } = await getServerRuntime();
  const records = await repository.list();
  return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      return await handleLocalUpload(req);
    }

    if (contentType.includes("application/json")) {
      return await handleJsonPayload(req);
    }

    return NextResponse.json(
      {
        error: "Unsupported content-type",
        detail:
          "Use multipart/form-data for local file uploads or application/json for cloud/telegram sources.",
      },
      { status: 415 }
    );
  } catch (err) {
    console.error("[POST /api/screenshots]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function handleLocalUpload(req: NextRequest): Promise<NextResponse> {
  const formData = await req.formData();

  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json(
      { error: "Invalid payload", issues: [{ field: "file", message: "file is required for local uploads" }] },
      { status: 400 }
    );
  }

  const parsed = LocalUploadFormSchema.safeParse({
    type: formData.get("type") ?? "local",
    sourceRef: formData.get("sourceRef") ?? undefined,
    originalFileName: formData.get("originalFileName") ?? undefined,
    description: formData.get("description") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const id = randomUUID();
  const ext = path.extname(file.name) || ".png";
  const fileName = `${id}${ext}`;
  const storagePath = path.join(env.screenshotStorageDir, fileName);

  await mkdir(env.screenshotStorageDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(storagePath, buffer);

  const input: ScreenshotInput = {
    id,
    sourceType: "local",
    sourceRef: parsed.data.sourceRef ?? fileName,
    filePath: storagePath,
    createdAt: new Date().toISOString(),
    metadata: {
      originalFileName: parsed.data.originalFileName ?? file.name,
      description: parsed.data.description,
    },
  };

  const { queue } = await getServerRuntime();
  await queue.enqueue("process-screenshot", input);

  return NextResponse.json({ jobId: id, status: "queued" }, { status: 202 });
}

async function handleJsonPayload(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = ScreenshotPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  if (parsed.data.type === "local") {
    return NextResponse.json(
      { error: "Use multipart/form-data to upload local files" },
      { status: 400 }
    );
  }

  const id = randomUUID();
  const payload = parsed.data;

  const sourceRef =
    payload.type === "cloud"
      ? `gdrive://${payload.fileId}`
      : `telegram://${payload.fileId}`;

  const input: ScreenshotInput = {
    id,
    sourceType: payload.type,
    sourceRef,
    filePath: "",
    createdAt: new Date().toISOString(),
    metadata: {
      originalFileName: payload.metadata?.originalFileName,
      description:
        payload.type === "telegram"
          ? (payload.caption ?? payload.metadata?.description)
          : payload.metadata?.description,
    },
  };

  const { queue } = await getServerRuntime();
  await queue.enqueue("process-screenshot", input);

  return NextResponse.json({ jobId: id, status: "queued" }, { status: 202 });
}

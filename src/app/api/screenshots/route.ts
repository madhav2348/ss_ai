import { NextRequest, NextResponse } from "next/server";
import { getServerRuntime } from "@/server/runtime";
import type { JobStatus } from "@/server/types/queue";
import { randomUUID } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { env } from "@/server/config/env";
import type { ScreenshotInput } from "@/server/types/screenshot";

function parseStatusFilter(url: string): JobStatus[] | undefined {
  const { searchParams } = new URL(url, "http://localhost");
  const raw = searchParams.get("status");
  if (!raw) return undefined;

  const valid: JobStatus[] = ["queued", "processing", "processed", "failed"];
  const parsed = raw
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is JobStatus => valid.includes(s as JobStatus));

  return parsed.length > 0 ? parsed : undefined;
}

export async function GET(req: NextRequest) {
  const { queue } = await getServerRuntime();
  const filter = parseStatusFilter(req.url);
  return NextResponse.json(queue.listViews(filter));
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file             = formData.get("file") as File | null;
    const sourceType       = formData.get("sourceType") as string | null;
    const sourceRef        = formData.get("sourceRef") as string | null;
    const description      = formData.get("description") as string | null;
    const originalFileName = formData.get("originalFileName") as string | null;

    if (!file || !sourceType) {
      return NextResponse.json(
        { error: "file and sourceType are required" },
        { status: 400 },
      );
    }

    const id          = randomUUID();
    const ext         = path.extname(file.name) || ".png";
    const fileName    = `${id}${ext}`;
    const storagePath = path.join(env.screenshotStorageDir, fileName);

    await mkdir(env.screenshotStorageDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(storagePath, buffer);

    const input: ScreenshotInput = {
      id,
      sourceType:  sourceType as ScreenshotInput["sourceType"],
      sourceRef:   sourceRef ?? fileName,
      filePath:    storagePath,
      createdAt:   new Date().toISOString(),
      metadata: {
        originalFileName: originalFileName ?? file.name,
        description:      description ?? undefined,
      },
    };

    const { queue } = await getServerRuntime();
    const job = await queue.enqueue("process-screenshot", input);

    return NextResponse.json(
      { jobId: job.id, status: job.status },
      { status: 202 },
    );
  } catch (err) {
    console.error("[POST /api/screenshots]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { getServerRuntime } from "@/server/runtime";
import { randomUUID, createHash } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { env } from "@/server/config/env";
import type { ScreenshotInput } from "@/server/types/screenshot";

export async function GET() {
  const { repository } = await getServerRuntime();
  const records = await repository.findAll();

  return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const sourceType = formData.get("sourceType") as string | null;
    const sourceRef = formData.get("sourceRef") as string | null;
    const description = formData.get("description") as string | null;
    const originalFileName = formData.get("originalFileName") as string | null;

    if (!file || !sourceType) {
      return NextResponse.json(
        { error: "file and sourceType are required" },
        { status: 400 }
      );
    }

    const id = randomUUID();
    const ext = path.extname(file.name) || ".png";
    const fileName = `${id}${ext}`;
    const storagePath = path.join(env.screenshotStorageDir, fileName);

    await mkdir(env.screenshotStorageDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());

    const fileHash = createHash("sha256")
      .update(buffer)
      .digest("hex");

    console.log("SHA-256 Hash:", fileHash);

    await writeFile(storagePath, buffer);

    const input: ScreenshotInput = {
      id,
      sourceType: sourceType as ScreenshotInput["sourceType"],
      sourceRef: sourceRef ?? fileName,
      filePath: storagePath,
      createdAt: new Date().toISOString(),
      metadata: {
        originalFileName: originalFileName ?? file.name,
        description: description ?? undefined,
      },
    };

    const { queue } = await getServerRuntime();

    await queue.enqueue("process-screenshot", input);

    return NextResponse.json(
      {
        jobId: id,
        status: "queue",
        fileHash,
      },
      { status: 202 }
    );
  } catch (err) {
    console.error("[POST /api/screenshots]", err);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
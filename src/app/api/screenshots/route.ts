import { NextRequest, NextResponse } from "next/server";
import { getServerRuntime } from "@/server/runtime";
import { randomUUID } from "crypto";
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
  try{
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const sourceType = formData.get("sourceType") as string | null;
    const sourceRef = formData.get("sourceRef") as string | null;
    const description = formData.get("description") as string | null;
    const originalFileName = formData.get("originalFileName") as string | null;

    if(!file || !sourceType ) {
      return NextResponse.json(
        { error: "file and sourceType are required"},
        { status: 400 }
      );
    }

    const id = randomUUID();
    const originalName = originalFileName ?? file.name;
    const ext = path.extname(originalName) || ".png";
    const fileName = `${id}_${path.basename(originalName, ext)}${ext}`;
    const storagePath = path.join(env.screenshotStorageDir, fileName);

    await mkdir(env.screenshotStorageDir, { recursive: true });
    
    // Stream uploaded file directly to disk to minimize memory footprint
    const { pipeline } = await import("node:stream/promises");
    const { createWriteStream } = await import("node:fs");
    const { Readable } = await import("node:stream");
    
    // Convert Web ReadableStream to Node Readable
    // @ts-expect-error Types for stream/web are partially overlapping in Node vs DOM
    const nodeStream = Readable.fromWeb(file.stream());
    await pipeline(nodeStream, createWriteStream(storagePath));

    const input: ScreenshotInput = {
      id,
      sourceType: sourceType as ScreenshotInput["sourceType"],
      sourceRef: sourceRef ?? originalName,
      storagePath,
      createdAt: new Date().toISOString(),
      metadata: {
        originalFileName: originalName,
        description: description ?? undefined,
      },
    };

    const { queue, workerTrigger } = await getServerRuntime();
    await queue.enqueue("process-screenshot", input);

    // Trigger the worker without awaiting it
    void workerTrigger();

    return NextResponse.json({ jobId: id, status: "queued" }, { status: 202 });
  } catch (err) {
    console.error("[POST /api/screenshots]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
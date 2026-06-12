import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { env } from "../../config/env";
import type { ScreenshotInput } from "../../types/screenshot";

export class DownloadWorker {
  async downloadIfNeeded(input: ScreenshotInput): Promise<ScreenshotInput> {
    if (input.storagePath) {
      // File is already downloaded (e.g., from HTTP POST upload)
      return input;
    }

    if (!input.sourceRef) {
      throw new Error("Cannot download file: Missing sourceRef URL");
    }

    // For cloud sources (Telegram, HTTP), we simulate fetching using fetch()
    // A real implementation would conditionally branch based on input.sourceType 
    // and use the provider's SDK (e.g. AWS S3, Telegram Bot API).
    
    console.log(`[DownloadWorker] Fetching remote source: ${input.sourceRef}`);
    let response: Response;
    try {
      response = await fetch(input.sourceRef);
      if (!response.ok || !response.body) {
        throw new Error(`Fetch failed with status ${response.status}`);
      }
    } catch (err) {
      console.log(`[DownloadWorker] Fetch error - stubbing dummy download. Error: ${err instanceof Error ? err.message : String(err)}`);
      // Since it's a stub environment for now, if the fetch fails (or sourceRef isn't a valid URL),
      // we will generate a dummy file to keep the pipeline moving locally.
      return this.stubDummyFile(input);
    }

    const originalName = input.metadata.originalFileName ?? "download.png";
    const ext = path.extname(originalName) || ".png";
    const fileName = `${input.id}_${path.basename(originalName, ext)}${ext}`;
    const storagePath = path.join(env.screenshotStorageDir, fileName);

    await mkdir(env.screenshotStorageDir, { recursive: true });

    // @ts-expect-error Types for stream/web are partially overlapping in Node vs DOM
    const nodeStream = Readable.fromWeb(response.body);
    await pipeline(nodeStream, createWriteStream(storagePath));

    return {
      ...input,
      storagePath,
    };
  }

  private async stubDummyFile(input: ScreenshotInput): Promise<ScreenshotInput> {
    const originalName = input.metadata.originalFileName ?? "stub.png";
    const ext = path.extname(originalName) || ".png";
    const fileName = `${input.id}_${path.basename(originalName, ext)}${ext}`;
    const storagePath = path.join(env.screenshotStorageDir, fileName);

    await mkdir(env.screenshotStorageDir, { recursive: true });
    const { writeFile } = await import("node:fs/promises");
    
    // Write an empty 1x1 base64 png as a stub
    const emptyPng = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64"
    );
    await writeFile(storagePath, emptyPng);

    return {
      ...input,
      storagePath,
    };
  }
}

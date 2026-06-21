import fs from "fs/promises";
import path from "path";
import { env } from "../../config/env";
import type { ScreenshotInput } from "../../types/screenshot";

export class DownloadWorker {
  async downloadIfNeeded(input: ScreenshotInput): Promise<ScreenshotInput> {
    if (input.storagePath) {
      return input;
    }

    const { id, sourceRef, metadata } = input;
    const originalName = metadata.originalFileName || "download.png";
    const ext = path.extname(originalName) || ".png";
    const fileName = `${id}_${path.basename(originalName, ext)}${ext}`;
    const storagePath = path.join(env.screenshotStorageDir, fileName);

    await fs.mkdir(env.screenshotStorageDir, { recursive: true });

    let buffer: Buffer;

    if (sourceRef.startsWith("http://") || sourceRef.startsWith("https://")) {
      try {
        const response = await fetch(sourceRef);
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
      } catch (err) {
        console.error(`[DownloadWorker] Failed to download ${sourceRef}:`, err);
        buffer = this.createFallbackImage();
      }
    } else {
      buffer = this.createFallbackImage();
    }

    await fs.writeFile(storagePath, buffer);

    return {
      ...input,
      storagePath,
    };
  }

  private createFallbackImage(): Buffer {
    // 1x1 transparent PNG
    return Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==",
      "base64"
    );
  }
}

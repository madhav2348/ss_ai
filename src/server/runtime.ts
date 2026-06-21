import { SqliteScreenshotRepository } from "./database/SqliteScreenshotRepository";
import { XlsxExporter } from "./exports/xlsxExporter";
import { PaddleOcrClient } from "./services/ai/ocr/paddle";
import { VectorIndex } from "./services/ai/embeddings/vector";
import { VisionAgent } from "./services/ai/vision/visionAgent";
import { ScreenshotPipeline } from "./services/pipeline/screenshotPipeline";
import { InMemoryQueue } from "./services/queue/queue";
import { OcrWorker } from "./services/workers/ocrWorker";
import { SourceWorker } from "./services/workers/sourceWorker";
import { TagWorker } from "./services/workers/tagWorker";
import { VisionWorker } from "./services/workers/visionWorker";
import { DownloadWorker } from "./services/workers/downloadWorker";
import { createQueueWorker } from "./services/workers/queueWorker";
import { FilesystemStorage } from "./storage/filesystem";
import type { ScreenshotInput } from "./types/screenshot";
import { env } from "./config/env";

const repository = new SqliteScreenshotRepository();
const vectorIndex = new VectorIndex();
const queue = new InMemoryQueue<ScreenshotInput>();
const processedStorage = new FilesystemStorage(env.processedStorageDir);

const pipeline = new ScreenshotPipeline(
  new DownloadWorker(),
  new OcrWorker(new PaddleOcrClient()),
  new VisionWorker(new VisionAgent()),
  new SourceWorker(),
  new TagWorker(),
  repository,
  vectorIndex,
  processedStorage,
  new XlsxExporter(),
  queue,
);

const worker = createQueueWorker(queue, pipeline);
const storageReady = processedStorage.ensure();

async function drainQueue(): Promise<void> {
  // Use the worker's trigger to handle processing correctly and avoid concurrency issues
  worker.trigger().catch((err) => {
    console.error("[Runtime] Failed to trigger queue worker:", err);
  });
}

export async function getServerRuntime() {
  await storageReady;
  return {
    pipeline,
    queue,
    repository,
    drainQueue,
  };
}
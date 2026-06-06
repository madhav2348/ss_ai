import { ScreenshotRepository } from "./database/schema";
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
import { createQueueWorker } from "./services/workers/queueWorker";
import { FilesystemStorage } from "./storage/filesystem";
import type { ScreenshotInput } from "./types/screenshot";
import { env } from "./config/env";

const repository = new ScreenshotRepository();
const vectorIndex = new VectorIndex();
const queue = new InMemoryQueue<ScreenshotInput>();
const processedStorage = new FilesystemStorage(env.processedStorageDir);

const pipeline = new ScreenshotPipeline(
  new OcrWorker(new PaddleOcrClient()),
  new VisionWorker(new VisionAgent()),
  new SourceWorker(),
  new TagWorker(),
  repository,
  vectorIndex,
  processedStorage,
  new XlsxExporter(),
);

const worker = createQueueWorker(queue, pipeline);
const storageReady = processedStorage.ensure();

export async function getServerRuntime() {
  await storageReady;

  return {
    pipeline,
    queue,
    repository,
    workerTrigger: worker.trigger,
  };
}

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

const globalForRuntime = globalThis as unknown as {
  repository?: SqliteScreenshotRepository;
  vectorIndex?: VectorIndex;
  queue?: InMemoryQueue<ScreenshotInput>;
  processedStorage?: FilesystemStorage;
  pipeline?: ScreenshotPipeline;
  storageReady?: Promise<void>;
  worker?: ReturnType<typeof createQueueWorker>;
};

const repository = globalForRuntime.repository ?? new SqliteScreenshotRepository();
const vectorIndex = globalForRuntime.vectorIndex ?? new VectorIndex();
const queue = globalForRuntime.queue ?? new InMemoryQueue<ScreenshotInput>();
const processedStorage = globalForRuntime.processedStorage ?? new FilesystemStorage(env.processedStorageDir);

const pipeline = globalForRuntime.pipeline ?? new ScreenshotPipeline(
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

const worker = globalForRuntime.worker ?? createQueueWorker(queue, pipeline);
const storageReady = globalForRuntime.storageReady ?? processedStorage.ensure();

if (env.nodeEnv !== "production") {
  globalForRuntime.repository = repository;
  globalForRuntime.vectorIndex = vectorIndex;
  globalForRuntime.queue = queue;
  globalForRuntime.processedStorage = processedStorage;
  globalForRuntime.pipeline = pipeline;
  globalForRuntime.storageReady = storageReady;
  globalForRuntime.worker = worker;
}

async function drainQueue(): Promise<void> {
  void worker.trigger();
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
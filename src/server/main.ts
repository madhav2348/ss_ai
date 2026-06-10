import { env } from "./config/env";
import { SqliteScreenshotRepository } from "./database/SqliteScreenshotRepository";
import { XlsxExporter } from "./exports/xlsxExporter";
import { FilesystemStorage } from "./storage/filesystem";
import { PaddleOcrClient } from "./services/ai/ocr/paddle";
import { VisionAgent } from "./services/ai/vision/visionAgent";
import { VectorIndex } from "./services/ai/embeddings/vector";
import { DeviceWatcher } from "./services/ingestion/local/deviceWatcher";
import { ScreenshotPipeline } from "./services/pipeline/screenshotPipeline";
import { InMemoryQueue } from "./services/queue/queue";
import { OcrWorker } from "./services/workers/ocrWorker";
import { SourceWorker } from "./services/workers/sourceWorker";
import { TagWorker } from "./services/workers/tagWorker";
import { VisionWorker } from "./services/workers/visionWorker";
import { DownloadWorker } from "./services/workers/downloadWorker";
import { createQueueWorker } from "./services/workers/queueWorker";
import { createApiServer } from "./server/api";
import type { ScreenshotInput } from "./types/screenshot";

async function bootstrap(): Promise<void> {
  const screenshotStorage = new FilesystemStorage(env.screenshotStorageDir);
  const processedStorage = new FilesystemStorage(env.processedStorageDir);
  await screenshotStorage.ensure();
  await processedStorage.ensure();

  const repository = new SqliteScreenshotRepository();
  const vectorIndex = new VectorIndex();
  const queue = new InMemoryQueue<ScreenshotInput>();
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

  const deviceWatcher = new DeviceWatcher();
  await queue.enqueue(
    "screenshot.ingested",
    deviceWatcher.createMockInput(`${env.screenshotStorageDir}/sample.png`),
  );
  await queue.process(async (j) => {
    await pipeline.process(j.payload, j.id);
  });

  const server = createApiServer({ pipeline, repository, queue });
  server.listen(env.port, () => {
    console.log(`SS AI server listening on http://localhost:${env.port}`);
  });
}

void bootstrap();
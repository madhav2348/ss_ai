import type { IScreenshotRepository } from "../../database/IScreenshotRepository";
import { XlsxExporter } from "../../exports/xlsxExporter";
import { FilesystemStorage } from "../../storage/filesystem";
import { VectorIndex } from "../ai/embeddings/vector";
import { OcrWorker } from "../workers/ocrWorker";
import { SourceWorker } from "../workers/sourceWorker";
import { TagWorker } from "../workers/tagWorker";
import { VisionWorker } from "../workers/visionWorker";
import { DownloadWorker } from "../workers/downloadWorker";
import type { ScreenshotAnalysis, ScreenshotInput } from "../../types/screenshot";
import type { InMemoryQueue } from "../queue/queue";

export class ScreenshotPipeline {
  constructor(
    private readonly downloadWorker: DownloadWorker,
    private readonly ocrWorker: OcrWorker,
    private readonly visionWorker: VisionWorker,
    private readonly sourceWorker: SourceWorker,
    private readonly tagWorker: TagWorker,
    private readonly repository: IScreenshotRepository,
    private readonly vectorIndex: VectorIndex,
    private readonly processedStorage: FilesystemStorage,
    private readonly exporter: XlsxExporter,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly queue?: InMemoryQueue<any>,
  ) {}

  async process(
    input: ScreenshotInput,
    jobId?: string,
  ): Promise<ScreenshotAnalysis> {
    const tick = (stage: Parameters<InMemoryQueue<unknown>["updateStatus"]>[2]) => {
      if (jobId && this.queue) {
        this.queue.updateStatus(jobId, "processing", stage);
      }
    };

    try {
      tick("ocr");
      const ocr = await this.ocrWorker.run(input);

      tick("vision");
      const vision = await this.visionWorker.run(input);

      tick("source");
      const source = await this.sourceWorker.findSource(input, ocr, vision);

      tick("tagging");
      const tagging = await this.tagWorker.categorize(ocr, vision);

      tick("storing");
      const analysis: ScreenshotAnalysis = {
        screenshot: input,
        ocr,
        vision,
        source,
        tagging,
        processedAt: new Date().toISOString(),
      };

      await this.repository.save(analysis);
      await this.vectorIndex.upsert(analysis);
      await this.processedStorage.saveJson(`${input.id}.json`, analysis);

      if (jobId && this.queue) {
        this.queue.updateStatus(jobId, "processed", null);
      }

      return analysis;
    } catch (err) {
      if (jobId && this.queue) {
        this.queue.updateStatus(
          jobId,
          "failed",
          null,
          err instanceof Error ? err.message : "Unknown error",
        );
      }
      throw err;
    }
  }

  async exportRecords(): Promise<Buffer> {
    const records = await this.repository.findAll();
    return this.exporter.export(records);
  }
}
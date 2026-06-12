import type { IScreenshotRepository } from "../../database/IScreenshotRepository";
import { XlsxExporter } from "../../exports/xlsxExporter";
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
    private readonly exporter: XlsxExporter,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly queue?: InMemoryQueue<any>,
  ) {}

  async process(
    input: ScreenshotInput,
    jobId?: string,
  ): Promise<ScreenshotAnalysis> {
    const timings: Record<string, number> = {};

    const tick = (
      stage: Parameters<InMemoryQueue<unknown>["updateStatus"]>[2],
    ) => {
      if (jobId && this.queue) {
        this.queue.updateStatus(jobId, "processing", stage);
      }
    };

    const runStage = async <T>(
      name: string,
      fn: () => Promise<T>,
      stageEnum?: Parameters<InMemoryQueue<unknown>["updateStatus"]>[2],
    ): Promise<T> => {
      const start = Date.now();

      if (stageEnum) {
        tick(stageEnum);
      }

      try {
        const result = await fn();
        timings[name] = Date.now() - start;
        console.log(`[Pipeline] ${name}: ${timings[name]}ms`);
        return result;
      } catch (error) {
        const duration = Date.now() - start;
        console.error(
          `[Pipeline] ${name} failed after ${duration}ms:`,
          error,
        );

        throw new Error(
          `Stage '${name}' failed: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    };

    try {
      const downloadedInput = await runStage(
        "Download",
        () => this.downloadWorker.downloadIfNeeded(input),
      );

      const ocr = await runStage(
        "OCR",
        () => this.ocrWorker.run(downloadedInput),
        "ocr",
      );

      const vision = await runStage(
        "Vision",
        () => this.visionWorker.run(downloadedInput),
        "vision",
      );

      const source = await runStage(
        "Source",
        () => this.sourceWorker.findSource(downloadedInput, ocr, vision),
        "source",
      );

      const tagging = await runStage(
        "Tagging",
        () => this.tagWorker.categorize(ocr, vision),
        "tagging",
      );

      const analysis: ScreenshotAnalysis = {
        screenshot: downloadedInput,
        ocr,
        vision,
        source,
        tagging,
        processedAt: new Date().toISOString(),
      };

      tick("storing");

      await runStage(
        "Repository",
        () => this.repository.save(analysis),
      );

      await runStage(
        "Vector Index",
        () => this.vectorIndex.upsert(analysis),
      );

      console.log(
        `[Pipeline] Total processing time: ${
          Object.values(timings).reduce((a, b) => a + b, 0)
        }ms`,
      );

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
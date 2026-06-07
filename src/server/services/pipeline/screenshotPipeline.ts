import { ScreenshotRepository } from "../../database/schema";
import { XlsxExporter } from "../../exports/xlsxExporter";
import { FilesystemStorage } from "../../storage/filesystem";
import { VectorIndex } from "../ai/embeddings/vector";
import { OcrWorker } from "../workers/ocrWorker";
import { SourceWorker } from "../workers/sourceWorker";
import { TagWorker } from "../workers/tagWorker";
import { VisionWorker } from "../workers/visionWorker";
import { DownloadWorker } from "../workers/downloadWorker";
import type { ScreenshotAnalysis, ScreenshotInput } from "../../types/screenshot";

export class ScreenshotPipeline {
  constructor(
    private readonly downloadWorker: DownloadWorker,
    private readonly ocrWorker: OcrWorker,
    private readonly visionWorker: VisionWorker,
    private readonly sourceWorker: SourceWorker,
    private readonly tagWorker: TagWorker,
    private readonly repository: ScreenshotRepository,
    private readonly vectorIndex: VectorIndex,
    private readonly processedStorage: FilesystemStorage,
    private readonly exporter: XlsxExporter,
  ) {}

  async process(input: ScreenshotInput): Promise<ScreenshotAnalysis> {
    const timings: Record<string, number> = {};

    const runStage = async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
      const start = Date.now();
      try {
        const result = await fn();
        timings[name] = Date.now() - start;
        console.log(`[Pipeline] ${name}: ${timings[name]}ms`);
        return result;
      } catch (error) {
        const duration = Date.now() - start;
        console.error(`[Pipeline] ${name} failed after ${duration}ms:`, error);
        throw new Error(`Stage '${name}' failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    const ocr = await runStage("OCR", () => this.ocrWorker.run(input));
    const vision = await runStage("Vision", () => this.visionWorker.run(input));
    const source = await runStage("Source", () => this.sourceWorker.findSource(input, ocr, vision));
    const tagging = await runStage("Tagging", () => this.tagWorker.categorize(ocr, vision));

    const analysis: ScreenshotAnalysis = {
      screenshot: downloadedInput,
      ocr,
      vision,
      source,
      tagging,
      processedAt: new Date().toISOString(),
    };

    await runStage("Repository", async () => {
      await this.repository.save(analysis);
    });
    await runStage("Vector Index", async () => {
      await this.vectorIndex.upsert(analysis);
    });
    await runStage("Processed Storage", async () => {
      await this.processedStorage.saveJson(`${input.id}.json`, analysis);
    });

    console.log(`[Pipeline] Total processing time: ${Object.values(timings).reduce((a, b) => a + b, 0)}ms`);
    return analysis;
  }

  async exportRecords(): Promise<Buffer> {
    const records = await this.repository.findAll();
    return this.exporter.export(records);
  }
}

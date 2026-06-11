import { ScreenshotRepository } from "../../database/schema";
import { XlsxExporter } from "../../exports/xlsxExporter";
import { FilesystemStorage } from "../../storage/filesystem";
import { VectorIndex } from "../ai/embeddings/vector";
import { OcrWorker } from "../workers/ocrWorker";
import { SourceWorker } from "../workers/sourceWorker";
import { TagWorker } from "../workers/tagWorker";
import { VisionWorker } from "../workers/visionWorker";
import type { ScreenshotAnalysis, ScreenshotInput } from "@ss-ai/types";
export class ScreenshotPipeline {
  constructor(
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
    const ocr = await this.ocrWorker.run(input);
    const vision = await this.visionWorker.run(input);
    const source = await this.sourceWorker.findSource(input, ocr, vision);
    const tagging = await this.tagWorker.categorize(ocr, vision);

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

    return analysis;
  }

  async exportRecords(): Promise<Buffer> {
    const records = await this.repository.findAll();
    return this.exporter.export(records);
  }
}

import type { OcrResult, ScreenshotInput, SourceResult, VisionResult } from "@ss-ai/types";

export class SourceWorker {
  async findSource(
    input: ScreenshotInput,
    ocr: OcrResult,
    vision: VisionResult,
  ): Promise<SourceResult> {
    const evidence = [
      ...(input.metadata.description ? [input.metadata.description] : []),
      ...(input.metadata.commentText ? [input.metadata.commentText] : []),
      ocr.text,
      vision.summary,
    ].filter(Boolean);

    return {
      sourceName: input.metadata.sourceHint,
      sourceUrl: undefined,
      evidence,
    };
  }
}

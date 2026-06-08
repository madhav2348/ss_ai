import type { OcrResult, ScreenshotInput, SourceResult, VisionResult } from "../../types/screenshot";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class SourceWorker {
  async findSource(
    input: ScreenshotInput,
    ocr: OcrResult,
    vision: VisionResult,
  ): Promise<SourceResult> {
    await sleep(2000); 
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
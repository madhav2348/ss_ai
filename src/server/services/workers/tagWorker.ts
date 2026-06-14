import type { OcrResult, TaggingResult, VisionResult } from "../../types/screenshot";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class TagWorker {
  async categorize(ocr: OcrResult, vision: VisionResult): Promise<TaggingResult> {
    await sleep(2000); 
    const labels = [ocr.text, vision.summary]
      .map((value) => value.trim())
      .filter(Boolean)
      .slice(0, 2);

    return {
      categories: labels.length > 0 ? ["unclassified"] : [],
      labels,
    };
  }
}
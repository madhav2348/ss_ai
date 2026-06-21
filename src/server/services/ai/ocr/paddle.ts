import type { OcrResult, ScreenshotInput } from "../../../types/screenshot";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class PaddleOcrClient {
  async extract(input: ScreenshotInput): Promise<OcrResult> {
    await sleep(3000); // 3 seconds — long enough for UI to catch "ocr" stage
    return {
      text: `OCR placeholder for ${input.metadata.originalFileName ?? input.id}`,
      confidence: 0.25,
    };
  }
}
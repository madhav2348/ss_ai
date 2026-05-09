import type { OcrResult, ScreenshotInput } from "../../../types/screenshot";

export class PaddleOcrClient {
  async extract(input: ScreenshotInput): Promise<OcrResult> {
    return {
      text: `OCR placeholder for ${input.metadata.originalFileName ?? input.id}`,
      confidence: 0.25,
    };
  }
}

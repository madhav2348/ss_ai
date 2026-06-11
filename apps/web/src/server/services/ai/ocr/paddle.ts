import type { OcrResult, ScreenshotInput } from "@ss-ai/types";

export class PaddleOcrClient {
  async extract(input: ScreenshotInput): Promise<OcrResult> {
    return {
      text: `OCR placeholder for ${input.metadata.originalFileName ?? input.id}`,
      confidence: 0.25,
    };
  }
}

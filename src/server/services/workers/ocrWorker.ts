import { PaddleOcrClient } from "../ai/ocr/paddle";
import type { OcrResult, ScreenshotInput } from "../../types/screenshot";

export class OcrWorker {
  constructor(private readonly ocrClient: PaddleOcrClient) {}

  async run(input: ScreenshotInput): Promise<OcrResult> {
    if (!input.storagePath) {
      throw new Error("storagePath is required for OCR extraction");
    }
    return this.ocrClient.extract(input);
  }
}

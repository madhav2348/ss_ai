import fs from 'fs';
import axios from 'axios';

const OCR_SERVICE_URL = process.env.JAVA_OCR_SERVICE_URL || 'http://localhost:8080/api/ocr';
const TIMEOUT_MS = 3000;

export class OCRWorker {
  async process(stagingPath: string, screenshotId: string): Promise<void> {
    try {
      const imageBuffer = fs.readFileSync(stagingPath);
      const base64Image = imageBuffer.toString('base64');

      const response = await axios.post(
        OCR_SERVICE_URL,
        { imageBase64: base64Image },
        { timeout: TIMEOUT_MS }
      );

      console.log(`[OCRWorker] Screenshot ${screenshotId} processed. Text:`, response.data.text);
    } catch (error) {
      console.error(`[OCRWorker] Failed for ${screenshotId}:`, error);
      throw error;
    }
  }
}

import fs from 'fs';
import Tesseract from 'tesseract.js';

export class OCRWorker {
  async process(stagingPath: string, screenshotId: string): Promise<void> {
    try {
      const imageBuffer = fs.readFileSync(stagingPath);

      const result = await Tesseract.recognize(imageBuffer, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`[OCRWorker] Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      const text = result.data.text.trim();
      const confidence = result.data.confidence;

      console.log(`[OCRWorker] Screenshot ${screenshotId} processed.`);
      console.log(`[OCRWorker] Text length: ${text.length} chars, Confidence: ${confidence}%`);

      // TODO: Update SQLite with extracted text
      // const updateStmt = db.prepare(`
      //   UPDATE screenshots
      //   SET ocr_text = ?, ocr_confidence = ?, status = 'PROCESSED'
      //   WHERE id = ?
      // `);
      // updateStmt.run(text, confidence, screenshotId);
    } catch (error) {
      console.error(`[OCRWorker] Failed for ${screenshotId}:`, error);
      throw error;
    }
  }
}
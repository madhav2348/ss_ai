import type { ScreenshotAnalysis } from "../../../types/screenshot";

export class VectorIndex {
  private readonly documents: ScreenshotAnalysis[] = [];

  async upsert(document: ScreenshotAnalysis): Promise<void> {
    this.documents.push(document);
  }

  list(): ScreenshotAnalysis[] {
    return [...this.documents];
  }
}

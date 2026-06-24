import type { ScreenshotAnalysis } from "../../../types/screenshot";

export class VectorIndex {
  private readonly documents: ScreenshotAnalysis[] = [];

  async upsert(document: ScreenshotAnalysis): Promise<void> {
    const index = this.documents.findIndex(
  (d) => d.screenshot.id === document.screenshot.id
);

if (index >= 0) {
  this.documents[index] = document;
} else {
  this.documents.push(document);
}
  }

  list(): ScreenshotAnalysis[] {
    return [...this.documents];
  }
}

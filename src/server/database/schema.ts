import type { ScreenshotAnalysis } from "../types/screenshot";

export class ScreenshotRepository {
  private readonly records = new Map<string, ScreenshotAnalysis>();

  async save(record: ScreenshotAnalysis): Promise<void> {
    this.records.set(record.screenshot.id, record);
  }

  async list(): Promise<ScreenshotAnalysis[]> {
    return Array.from(this.records.values());
  }
}

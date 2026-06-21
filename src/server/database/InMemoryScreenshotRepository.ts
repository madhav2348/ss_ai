import type { ScreenshotAnalysis } from "../types/screenshot";
import type { IScreenshotRepository, RecordFilters } from "./IScreenshotRepository";

export class InMemoryScreenshotRepository implements IScreenshotRepository {
  private readonly records = new Map<string, ScreenshotAnalysis>();

  async save(record: ScreenshotAnalysis): Promise<void> {
    this.records.set(record.screenshot.id, record);
  }

  async findById(id: string): Promise<ScreenshotAnalysis | null> {
    return this.records.get(id) ?? null;
  }
  async findByHash(hash: string): Promise<ScreenshotAnalysis | null> {
  return null;
}

async findBySourceRef(
  sourceRef: string
): Promise<ScreenshotAnalysis | null> {
  return null;
}

  async findAll(filters?: RecordFilters): Promise<ScreenshotAnalysis[]> {
    let results = Array.from(this.records.values());

    if (filters?.sourceType) {
      results = results.filter(
        (r) => r.screenshot.sourceType === filters.sourceType
      );
    }
    if (filters?.fromDate) {
      results = results.filter((r) => r.processedAt >= filters.fromDate!);
    }
    if (filters?.toDate) {
      results = results.filter((r) => r.processedAt <= filters.toDate!);
    }
    if (filters?.tag) {
      const tag = filters.tag.toLowerCase();
      results = results.filter(
        (r) =>
          r.tagging.labels.some((l) => l.toLowerCase().includes(tag)) ||
          r.tagging.categories.some((c) => c.toLowerCase().includes(tag))
      );
    }

    return results.sort((a, b) =>
      b.processedAt.localeCompare(a.processedAt)
    );
  }

  async delete(id: string): Promise<void> {
    this.records.delete(id);
  }

  clear(): void {
    this.records.clear();
  }
}
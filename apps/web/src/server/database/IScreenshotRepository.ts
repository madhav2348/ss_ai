import type { ScreenshotAnalysis } from "@ss-ai/types";

export interface RecordFilters {
  sourceType?: string;
  tag?: string;
  fromDate?: string;
  toDate?: string;
}

export interface IScreenshotRepository {
  save(record: ScreenshotAnalysis): Promise<void>;
  findById(id: string): Promise<ScreenshotAnalysis | null>;
  findAll(filters?: RecordFilters): Promise<ScreenshotAnalysis[]>;
  delete(id: string): Promise<void>;
}

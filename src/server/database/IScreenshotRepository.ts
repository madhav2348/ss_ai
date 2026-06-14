import type { ScreenshotAnalysis } from "../types/screenshot";

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
  findByHash(hash: string): Promise<ScreenshotAnalysis | null>;
  findBySourceRef(sourceRef: string): Promise<ScreenshotAnalysis | null>;
  delete(id: string): Promise<void>;
}
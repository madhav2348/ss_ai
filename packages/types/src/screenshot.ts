export type ScreenshotSourceType = "telegram" | "local" | "cloud";

export interface ScreenshotMetadata {
  sourceHint?: string;
  description?: string;
  commentText?: string;
  originalFileName?: string;
  tags?: string[];
}

export interface ScreenshotInput {
  id: string;
  sourceType: ScreenshotSourceType;
  sourceRef: string;
  filePath: string;
  createdAt: string;
  metadata: ScreenshotMetadata;
}

export interface OcrResult {
  text: string;
  confidence: number;
}

export interface VisionResult {
  summary: string;
  objects: string[];
  confidence: number;
}

export interface SourceResult {
  sourceName?: string;
  sourceUrl?: string;
  evidence: string[];
}

export interface TaggingResult {
  categories: string[];
  labels: string[];
}

export interface ScreenshotAnalysis {
  screenshot: ScreenshotInput;
  ocr: OcrResult;
  vision: VisionResult;
  source: SourceResult;
  tagging: TaggingResult;
  processedAt: string;
}

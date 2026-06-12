import type { ScreenshotInput } from "./screenshot";

export type JobStatus = "queued" | "processing" | "processed" | "failed";

export type PipelineStage =
  | "ocr"
  | "vision"
  | "source"
  | "tagging"
  | "storing"
  | null;

export interface QueueJob<TPayload> {
  id: string;
  name: string;
  payload: TPayload;
  createdAt: string;
  updatedAt: string;
  status: JobStatus;
  stage: PipelineStage;
  error?: string;
}

export type ScreenshotJob = QueueJob<ScreenshotInput>;
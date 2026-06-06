import type { ScreenshotInput } from "./screenshot";

export type JobStatus = "queued" | "processing" | "processed" | "failed";

export interface QueueJob<TPayload> {
  id: string;
  name: string;
  payload: TPayload;
  createdAt: string;
  updatedAt?: string;
  status: JobStatus;
  error?: string;
}

export type ScreenshotJob = QueueJob<ScreenshotInput>;

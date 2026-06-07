// src/server/types/queue.ts
import type { ScreenshotInput } from "./screenshot";

export type JobStatus = "queued" | "processing" | "processed" | "failed";

export type PipelineStage =
  | "ocr"
  | "vision"
  | "source"
  | "tagging"
  | "storing"
  | null;

const VALID_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  queued:     ["processing"],
  processing: ["processed", "failed"],
  processed:  [],
  failed:     ["queued"],
};

export function isValidTransition(from: JobStatus, to: JobStatus): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}

export interface Job {
  id: string;
  name: string;
  payload: ScreenshotInput;
  status: JobStatus;
  stage: PipelineStage;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  stageErrors: Record<string, string>;
}

export interface JobView {
  id: string;
  name: string;
  status: JobStatus;
  stage: PipelineStage;
  error?: string;
  stageErrors: Record<string, string>;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export function toJobView(job: Job): JobView {
  return {
    id:          job.id,
    name:        job.name,
    status:      job.status,
    stage:       job.stage,
    error:       job.error,
    stageErrors: job.stageErrors,
    createdAt:   job.createdAt.toISOString(),
    startedAt:   job.startedAt?.toISOString(),
    completedAt: job.completedAt?.toISOString(),
  };
}

export interface QueueJob<TPayload> {
  id: string;
  name: string;
  payload: TPayload;
  createdAt: string;
}

export type ScreenshotJob = QueueJob<ScreenshotInput>;
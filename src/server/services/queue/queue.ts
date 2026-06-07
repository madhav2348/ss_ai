import { createId } from "../../utils/id";
import {
  isValidTransition,
  toJobView,
  type Job,
  type JobStatus,
  type JobView,
  type PipelineStage,
} from "../../types/queue";
import type { ScreenshotInput } from "../../types/screenshot";

type JobHandler = (job: Job) => Promise<void>;

export class InMemoryQueue<TPayload extends ScreenshotInput = ScreenshotInput> {
  private readonly store = new Map<string, Job>();
  private readonly order: string[] = [];

  async enqueue(name: string, payload: TPayload): Promise<Job> {
    const job: Job = {
      id:          createId("job"),
      name,
      payload,
      status:      "queued",
      stage:       null,
      createdAt:   new Date(),
      stageErrors: {},
    };

    this.store.set(job.id, job);
    this.order.push(job.id);
    return job;
  }

  updateStatus(
    id: string,
    to: JobStatus,
    stage: PipelineStage = null,
    error?: string,
  ): void {
    const job = this.store.get(id);
    if (!job) return;

    if (!isValidTransition(job.status, to)) {
      console.warn(
        `[Queue] Blocked invalid transition ${job.status} → ${to} for job ${id}`,
      );
      return;
    }

    job.status = to;
    job.stage  = stage;

    if (to === "processing" && !job.startedAt) {
      job.startedAt = new Date();
    }

    if (to === "processed" || to === "failed") {
      job.completedAt = new Date();
    }

    if (error) {
      if (stage) {
        job.stageErrors[stage] = error;
      }
      job.error = error;
    }
  }

  retry(id: string): boolean {
    const job = this.store.get(id);
    if (!job) return false;

    if (!isValidTransition(job.status, "queued")) {
      return false;
    }

    job.status      = "queued";
    job.stage       = null;
    job.error       = undefined;
    job.startedAt   = undefined;
    job.completedAt = undefined;
    job.stageErrors = {};
    this.order.push(id);
    return true;
  }

  async process(handler: JobHandler): Promise<void> {
    while (this.order.length > 0) {
      const id = this.order.shift();
      if (!id) continue;
      const job = this.store.get(id);
      if (!job || job.status === "processed") continue;
      await handler(job);
    }
  }

  getById(id: string): Job | undefined {
    return this.store.get(id);
  }

  list(statusFilter?: JobStatus[]): Job[] {
    const all = Array.from(this.store.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );

    if (statusFilter && statusFilter.length > 0) {
      return all.filter((j) => statusFilter.includes(j.status));
    }

    return all;
  }

  listViews(statusFilter?: JobStatus[]): JobView[] {
    return this.list(statusFilter).map(toJobView);
  }

  size(): number {
    return this.order.length;
  }
}

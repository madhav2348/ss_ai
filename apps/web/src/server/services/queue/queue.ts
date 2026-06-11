import { createId } from "@ss-ai/utils";
import type { QueueJob } from "@ss-ai/types";

type JobHandler<TPayload> = (job: QueueJob<TPayload>) => Promise<void>;

export class InMemoryQueue<TPayload> {
  private readonly jobs: QueueJob<TPayload>[] = [];

  async enqueue(name: string, payload: TPayload): Promise<QueueJob<TPayload>> {
    const job: QueueJob<TPayload> = {
      id: createId("job"),
      name,
      payload,
      createdAt: new Date().toISOString(),
    };

    this.jobs.push(job);
    return job;
  }

  async process(handler: JobHandler<TPayload>): Promise<void> {
    while (this.jobs.length > 0) {
      const job = this.jobs.shift();
      if (!job) {
        return;
      }

      await handler(job);
    }
  }

  size(): number {
    return this.jobs.length;
  }
  getById(id: string): QueueJob<TPayload> | undefined {
  return this.jobs.find((job) => job.id === id);
}
}

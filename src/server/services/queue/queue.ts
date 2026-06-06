import { createId } from "../../utils/id";
import type { QueueJob } from "../../types/queue";

type JobHandler<TPayload> = (job: QueueJob<TPayload>) => Promise<void>;

export class InMemoryQueue<TPayload> {
  private readonly jobs: Map<string, QueueJob<TPayload>> = new Map();
  private readonly queue: string[] = [];

  async enqueue(name: string, payload: TPayload): Promise<QueueJob<TPayload>> {
    const job: QueueJob<TPayload> = {
      id: createId("job"),
      name,
      payload,
      createdAt: new Date().toISOString(),
      status: "queued",
    };

    this.jobs.set(job.id, job);
    this.queue.push(job.id);
    return job;
  }

  async process(handler: JobHandler<TPayload>): Promise<void> {
    while (this.queue.length > 0) {
      const id = this.queue.shift();
      if (!id) {
        return;
      }

      const job = this.jobs.get(id);
      if (!job) {
        continue;
      }

      await handler(job);
    }
  }

  size(): number {
    return this.queue.length;
  }

  getById(id: string): QueueJob<TPayload> | undefined {
    return this.jobs.get(id);
  }

  list(): QueueJob<TPayload>[] {
    return Array.from(this.jobs.values());
  }
}

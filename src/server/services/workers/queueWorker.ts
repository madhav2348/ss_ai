import type { InMemoryQueue } from "../queue/queue";
import type { ScreenshotPipeline } from "../pipeline/screenshotPipeline";
import type { ScreenshotInput } from "../../types/screenshot";

export function createQueueWorker(
  queue: InMemoryQueue<ScreenshotInput>,
  pipeline: ScreenshotPipeline
) {
  let isProcessing = false;

  const trigger = async () => {
    if (isProcessing) {
      return;
    }
    isProcessing = true;

    try {
      await queue.process(async (job) => {
        console.log(`[QueueWorker] Started processing job ${job.id}`);

        try {
          await pipeline.process(job.payload, job.id);
          console.log(`[QueueWorker] Successfully processed job ${job.id}`);
        } catch (error) {
          console.error(`[QueueWorker] Job ${job.id} failed:`, error);
        }
      });
    } finally {
      isProcessing = false;
    }
  };

  return { trigger };
}

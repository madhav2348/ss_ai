import type { ScreenshotInput } from "./screenshot";

export interface QueueJob<TPayload> {
  id: string;
  name: string;
  payload: TPayload;
  createdAt: string;
}

export type ScreenshotJob = QueueJob<ScreenshotInput>;

import { createId } from "@ss-ai/utils";
import type { ScreenshotInput } from "@ss-ai/types";

export class CloudWatcher {
  createMockInput(filePath: string, sourceRef = "s3://bucket/mock"): ScreenshotInput {
    return {
      id: createId("shot"),
      sourceType: "cloud",
      sourceRef,
      filePath,
      createdAt: new Date().toISOString(),
      metadata: {
        originalFileName: filePath.split(/[\\/]/).at(-1),
      },
    };
  }
}

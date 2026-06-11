import { createId } from "@ss-ai/utils";
import type { ScreenshotInput } from "@ss-ai/types";

export class DeviceWatcher {
  createMockInput(filePath: string): ScreenshotInput {
    return {
      id: createId("shot"),
      sourceType: "local",
      sourceRef: "device://screenshots/mock",
      filePath,
      createdAt: new Date().toISOString(),
      metadata: {
        originalFileName: filePath.split(/[\\/]/).at(-1),
      },
    };
  }
}

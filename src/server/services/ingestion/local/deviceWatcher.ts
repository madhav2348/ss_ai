import { createId } from "../../../utils/id";
import type { ScreenshotInput } from "../../../types/screenshot";

export class DeviceWatcher {
  createMockInput(filePath: string): ScreenshotInput {
    return {
      id: createId("shot"),
      sourceType: "local",
      sourceRef: "device://screenshots/mock",
      storagePath: filePath,
      createdAt: new Date().toISOString(),
      metadata: {
        originalFileName: filePath.split(/[\\/]/).at(-1),
      },
    };
  }
}

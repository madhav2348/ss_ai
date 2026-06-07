import { createId } from "../../../utils/id";
import type { ScreenshotInput } from "../../../types/screenshot";

export class TelegramBotIngestion {
  createMockInput(filePath: string, description?: string): ScreenshotInput {
    return {
      id: createId("shot"),
      sourceType: "telegram",
      sourceRef: "telegram://message/mock",
      filePath,
      createdAt: new Date().toISOString(),
      metadata: {
        description,
        originalFileName: filePath.split(/[\\/]/).at(-1),
      },
    };
  }
}

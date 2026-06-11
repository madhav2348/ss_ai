import type { ScreenshotInput, VisionResult } from "@ss-ai/types";

export class VisionAgent {
  async analyze(input: ScreenshotInput): Promise<VisionResult> {
    return {
      summary: `Vision placeholder for ${input.filePath}`,
      objects: [],
      confidence: 0.2,
    };
  }
}

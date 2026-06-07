import type { ScreenshotInput, VisionResult } from "../../../types/screenshot";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class VisionAgent {
  async analyze(input: ScreenshotInput): Promise<VisionResult> {
    await sleep(3000); 
    return {
      summary: `Vision placeholder for ${input.storagePath}`,
      objects: [],
      confidence: 0.2,
    };
  }
}
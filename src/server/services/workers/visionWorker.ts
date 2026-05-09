import { VisionAgent } from "../ai/vision/visionAgent";
import type { ScreenshotInput, VisionResult } from "../../types/screenshot";

export class VisionWorker {
  constructor(private readonly visionAgent: VisionAgent) {}

  async run(input: ScreenshotInput): Promise<VisionResult> {
    return this.visionAgent.analyze(input);
  }
}

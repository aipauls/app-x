import { ImageDetectionResult } from "../types/agents";
import { BaseAgent, AgentContext, LogCallback } from "./base";

export class ImageDetectionAgent extends BaseAgent<ImageDetectionResult> {
  constructor(onLog?: LogCallback) {
    super("image", onLog);
  }

  async execute(
    instruction: string,
    _context: AgentContext,
    imageBase64?: string | null
  ): Promise<ImageDetectionResult | null> {
    if (!imageBase64) {
      this.log("error", "No image provided");
      return null;
    }

    this.log("processing", "Analyzing image...");
    const result = await this.callAgent<ImageDetectionResult>(instruction, imageBase64);

    if (result?.ingredients) {
      this.log("done", `Found ${result.ingredients.length} ingredients`);
    } else {
      this.log("error", "Could not identify ingredients");
    }

    return result;
  }
}

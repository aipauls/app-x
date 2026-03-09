import { LocationResult } from "../types/agents";
import { BaseAgent, AgentContext, LogCallback } from "./base";

export class LocationAgent extends BaseAgent<LocationResult> {
  constructor(onLog?: LogCallback) {
    super("location", onLog);
  }

  async execute(
    instruction: string,
    context: AgentContext
  ): Promise<LocationResult | null> {
    this.log("processing", "Finding nearby stores...");

    const prompt = `${instruction}
User location: ${context.userLocation}`;

    const result = await this.callAgent<LocationResult>(prompt);

    if (result?.stores) {
      this.log("done", `Found ${result.stores.length} stores — Recommended: ${result.best_option?.store || "N/A"}`);
    } else {
      this.log("error", "Could not find stores");
    }

    return result;
  }
}

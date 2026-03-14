import { WasteReductionResult } from "../types/agents";
import { BaseAgent, AgentContext, LogCallback } from "./base";

export class WasteReductionAgent extends BaseAgent<WasteReductionResult> {
  constructor(onLog?: LogCallback) {
    super("waste_reduction", onLog);
  }

  async execute(
    instruction: string,
    context: AgentContext,
  ): Promise<WasteReductionResult | null> {
    this.log("processing", "Scanning pantry for at-risk items...");

    const prompt = `${instruction}
Current pantry (note items marked [EXPIRING SOON]): ${context.pantryDescription}`;

    const result = await this.callAgent<WasteReductionResult>(prompt);

    if (result?.at_risk_items) {
      this.log("done", `Found ${result.at_risk_items.length} at-risk items (score: ${result.waste_score}%)`);
    } else {
      this.log("error", "Could not analyse waste risk");
    }

    return result;
  }
}

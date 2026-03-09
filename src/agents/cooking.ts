import { CookingResult } from "../types/agents";
import { BaseAgent, AgentContext, LogCallback } from "./base";

export class CookingAgent extends BaseAgent<CookingResult> {
  constructor(onLog?: LogCallback) {
    super("cooking", onLog);
  }

  async execute(
    instruction: string,
    context: AgentContext
  ): Promise<CookingResult | null> {
    this.log("processing", "Finding best recipes...");

    const prompt = `${instruction}
Dietary preference: ${context.dietaryPreference}
Available ingredients: ${context.pantryDescription}
${context.extraContext || ""}`;

    const result = await this.callAgent<CookingResult>(prompt);

    if (result?.recipes) {
      this.log("done", `Found ${result.recipes.length} recipes`);
    } else {
      this.log("error", "Could not generate recipes");
    }

    return result;
  }
}

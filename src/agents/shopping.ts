import { ShoppingResult } from "../types/agents";
import { BaseAgent, AgentContext, LogCallback } from "./base";

export class ShoppingAgent extends BaseAgent<ShoppingResult> {
  constructor(onLog?: LogCallback) {
    super("shopping", onLog);
  }

  async execute(
    instruction: string,
    context: AgentContext
  ): Promise<ShoppingResult | null> {
    this.log("processing", "Checking prices...");

    const prompt = `${instruction}
User location: ${context.userLocation}
Current pantry: ${context.pantryDescription}
${context.extraContext || ""}
${context.shoppingListDescription ? `Existing shopping list: ${context.shoppingListDescription}` : ""}`;

    const result = await this.callAgent<ShoppingResult>(prompt);

    if (result?.shopping_list) {
      this.log("done", `Priced ${result.shopping_list.length} items — Total: ${result.total_estimated}`);
    } else {
      this.log("error", "Could not retrieve pricing");
    }

    return result;
  }
}

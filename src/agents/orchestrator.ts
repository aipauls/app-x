import {
  AgentId,
  OrchestratorDecision,
  AgentResult,
  PipelineResult,
} from "../types/agents";
import { BaseAgent, AgentContext, LogCallback } from "./base";
import { ImageDetectionAgent } from "./imageDetection";
import { CookingAgent } from "./cooking";
import { ShoppingAgent } from "./shopping";
import { LocationAgent } from "./location";
import { WasteReductionAgent } from "./wasteReduction";

export class OrchestratorAgent extends BaseAgent<OrchestratorDecision> {
  private imageAgent: ImageDetectionAgent;
  private cookingAgent: CookingAgent;
  private shoppingAgent: ShoppingAgent;
  private locationAgent: LocationAgent;
  private wasteAgent: WasteReductionAgent;

  constructor(onLog?: LogCallback) {
    super("orchestrator", onLog);
    this.imageAgent = new ImageDetectionAgent(onLog);
    this.cookingAgent = new CookingAgent(onLog);
    this.shoppingAgent = new ShoppingAgent(onLog);
    this.locationAgent = new LocationAgent(onLog);
    this.wasteAgent = new WasteReductionAgent(onLog);
  }

  // Local intent matching — avoids Claude API call for common patterns
  private matchLocalIntent(instruction: string, hasImage: boolean): AgentId[] | null {
    if (hasImage) return ["image", "cooking"];
    const msg = instruction.toLowerCase();
    if (/cook|recipe|dinner|meal|eat|what.+make/.test(msg)) return ["cooking"];
    if (/shop|buy|price|cost|cheap|afford/.test(msg)) return ["shopping", "location"];
    if (/store|deliver|collect|nearby|tesco|aldi|sainsbury/.test(msg)) return ["location"];
    if (/expir|waste|use up|going off|leftover/.test(msg)) return ["waste_reduction"];
    return null; // ambiguous — let Claude decide
  }

  async execute(
    instruction: string,
    context: AgentContext,
    imageBase64?: string | null
  ): Promise<OrchestratorDecision | null> {
    this.log("thinking", "Analyzing your request...");

    // Try local routing first to save ~50% of orchestrator API calls
    const localAgents = this.matchLocalIntent(instruction, !!imageBase64);
    if (localAgents) {
      this.log("routed", `Local routing → ${localAgents.join(", ")}`);
      return {
        intent: instruction,
        agents: localAgents,
        parallel: localAgents.length > 1,
        summary_for_user: "On it! Let me help with that.",
        agent_instructions: {},
      };
    }

    const prompt = `User message: "${instruction || "User uploaded a photo of food ingredients"}"
Has image attached: ${!!imageBase64}
User location: ${context.userLocation}
Dietary preference: ${context.dietaryPreference}
Current pantry: ${context.pantryDescription}
${context.shoppingListDescription ? `Current shopping list: ${context.shoppingListDescription}` : ""}`;

    const decision = await this.callAgent<OrchestratorDecision>(prompt);

    if (decision) {
      this.log("routed", `Dispatching to: ${decision.agents.join(", ")}`);
    }

    return decision;
  }

  async runPipeline(
    decision: OrchestratorDecision,
    context: AgentContext,
    imageBase64?: string | null
  ): Promise<PipelineResult> {
    const results: AgentResult[] = [];
    const agentChain: AgentId[] = ["orchestrator"];
    let extraContext = "";

    const agents = decision.agents;

    // Sequential: Image agent first if needed
    if (agents.includes("image") && imageBase64) {
      agentChain.push("image");
      const imageResult = await this.imageAgent.execute(
        decision.agent_instructions?.image || "Identify all visible food ingredients",
        context,
        imageBase64
      );

      if (imageResult) {
        results.push({ type: "image_results", data: imageResult });
        extraContext = `Newly detected ingredients: ${imageResult.ingredients.map((i) => i.name).join(", ")}`;
      }
    }

    // Parallel: Remaining agents
    const remainingAgents = agents.filter((a) => a !== "image");
    const enrichedContext: AgentContext = { ...context, extraContext };
    const parallelTasks: Promise<void>[] = [];

    if (remainingAgents.includes("cooking")) {
      agentChain.push("cooking");
      parallelTasks.push(
        this.cookingAgent
          .execute(decision.agent_instructions?.cooking || "Recommend recipes", enrichedContext)
          .then((r) => { if (r) results.push({ type: "recipes", data: r }); })
      );
    }

    if (remainingAgents.includes("shopping")) {
      agentChain.push("shopping");
      parallelTasks.push(
        this.shoppingAgent
          .execute(decision.agent_instructions?.shopping || "Find prices", enrichedContext)
          .then((r) => { if (r) results.push({ type: "shopping", data: r }); })
      );
    }

    if (remainingAgents.includes("location")) {
      agentChain.push("location");
      parallelTasks.push(
        this.locationAgent
          .execute(decision.agent_instructions?.location || "Find nearby stores", enrichedContext)
          .then((r) => { if (r) results.push({ type: "location", data: r }); })
      );
    }

    if (remainingAgents.includes("waste_reduction")) {
      agentChain.push("waste_reduction");
      parallelTasks.push(
        this.wasteAgent
          .execute(decision.agent_instructions?.waste_reduction || "Identify at-risk items", enrichedContext)
          .then((r) => { if (r) results.push({ type: "waste_reduction", data: r }); })
      );
    }

    await Promise.all(parallelTasks);
    this.log("consolidating", "Building your results...");

    return { agentChain, results };
  }
}

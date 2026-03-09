import { AgentId, AgentLog } from "../types/agents";
import { callClaudeJSON } from "../services/anthropic";
import { SYSTEM_PROMPTS, AgentPromptKey } from "../constants/prompts";

export type LogCallback = (log: AgentLog) => void;

export interface AgentContext {
  pantryDescription: string;
  dietaryPreference: string;
  userLocation: string;
  shoppingListDescription?: string;
  extraContext?: string;
}

export abstract class BaseAgent<TResult> {
  readonly id: AgentId;
  private onLog?: LogCallback;

  constructor(id: AgentId, onLog?: LogCallback) {
    this.id = id;
    this.onLog = onLog;
  }

  protected log(status: AgentLog["status"], detail: string) {
    this.onLog?.({
      agent: this.id,
      status,
      detail,
      timestamp: new Date(),
    });
  }

  protected async callAgent<T>(
    userMessage: string,
    imageBase64?: string | null
  ): Promise<T | null> {
    const promptKey = this.id as AgentPromptKey;
    const systemPrompt = SYSTEM_PROMPTS[promptKey];

    if (!systemPrompt) {
      this.log("error", `No system prompt for agent: ${this.id}`);
      return null;
    }

    try {
      return await callClaudeJSON<T>({ systemPrompt, userMessage, imageBase64 });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.log("error", message);
      return null;
    }
  }

  abstract execute(
    instruction: string,
    context: AgentContext,
    imageBase64?: string | null
  ): Promise<TResult | null>;
}

import { AgentId, AgentResult } from "./agents";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string | null;
  richContent?: AgentResult[] | null;
  agentChain?: AgentId[];
  image?: string;
  isStatus?: boolean;
  timestamp: Date;
}

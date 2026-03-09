import { useState, useCallback, useRef } from "react";
import { OrchestratorAgent, AgentContext } from "../agents";
import { AgentId, AgentLog, AgentResult } from "../types/agents";
import { PantryItem, DietaryPreference } from "../types/pantry";
import { daysFromNow } from "../utils/dates";

interface PipelineHookResult {
  sendMessage: (
    text: string,
    imageBase64?: string | null
  ) => Promise<{
    statusMessage: string;
    results: AgentResult[];
    agentChain: AgentId[];
  } | null>;
  isProcessing: boolean;
  activeAgents: AgentId[];
  agentLogs: AgentLog[];
}

export function useAgentPipeline(
  pantry: PantryItem[],
  dietary: DietaryPreference,
  userLocation: string,
  shoppingListNames: string[] = []
): PipelineHookResult {
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeAgents, setActiveAgents] = useState<AgentId[]>([]);
  const [agentLogs, setAgentLogs] = useState<AgentLog[]>([]);

  const getOrchestrator = useCallback(() => {
    const logCallback = (log: AgentLog) => {
      setAgentLogs((prev) => [...prev, log]);
      if (log.status === "processing" || log.status === "thinking") {
        setActiveAgents((prev) => prev.includes(log.agent) ? prev : [...prev, log.agent]);
      } else if (log.status === "done" || log.status === "error") {
        setActiveAgents((prev) => prev.filter((a) => a !== log.agent));
      }
    };
    return new OrchestratorAgent(logCallback);
  }, []);

  const buildContext = useCallback((): AgentContext => {
    const pantryDescription = pantry
      .map((item) => {
        let desc = `${item.name} (${item.category})`;
        if (item.expiry && daysFromNow(item.expiry) <= 3) desc += " [EXPIRING SOON]";
        return desc;
      })
      .join(", ");

    return {
      pantryDescription,
      dietaryPreference: dietary,
      userLocation,
      shoppingListDescription: shoppingListNames.length > 0 ? shoppingListNames.join(", ") : undefined,
    };
  }, [pantry, dietary, userLocation, shoppingListNames]);

  const sendMessage = useCallback(
    async (text: string, imageBase64?: string | null) => {
      setIsProcessing(true);
      setAgentLogs([]);
      setActiveAgents(["orchestrator"]);

      try {
        const orchestrator = getOrchestrator();
        const context = buildContext();
        const decision = await orchestrator.execute(text, context, imageBase64);

        if (!decision) return null;

        const pipelineResult = await orchestrator.runPipeline(decision, context, imageBase64);

        return {
          statusMessage: decision.summary_for_user,
          results: pipelineResult.results,
          agentChain: pipelineResult.agentChain,
        };
      } catch (error) {
        console.error("Pipeline error:", error);
        return null;
      } finally {
        setIsProcessing(false);
        setActiveAgents([]);
      }
    },
    [getOrchestrator, buildContext]
  );

  return { sendMessage, isProcessing, activeAgents, agentLogs };
}

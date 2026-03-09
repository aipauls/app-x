# Agent Development Standards

## Architecture

App.X uses a multi-agent system where an Orchestrator routes user
requests to specialized sub-agents. All agents extend `BaseAgent<TResult>`
from `src/agents/base.ts`.

Current agents: Orchestrator, Image Detection, Cooking, Shopping, Location.
Planned agents: Waste Reduction, Nutrition/Dietary, Budget.

## Creating a New Agent

Every new agent follows this checklist:

1. Define the response type in `src/types/agents.ts`
2. Add the agent ID to the `AgentId` union type
3. Add the system prompt in `src/constants/prompts.ts`
4. Add agent config in `src/constants/agents.ts`
5. Create the agent file in `src/agents/` extending `BaseAgent`
6. Register in `src/agents/orchestrator.ts` (instantiate + add to pipeline)
7. Update the orchestrator system prompt routing rules
8. Export from `src/agents/index.ts`
9. Add a test file in `__tests__/agents/`

## Agent File Structure

```typescript
import { MyResult } from "../types/agents";
import { BaseAgent, AgentContext, LogCallback } from "./base";

export class MyAgent extends BaseAgent<MyResult> {
  constructor(onLog?: LogCallback) {
    super("my_agent_id", onLog);
  }

  async execute(
    instruction: string,
    context: AgentContext,
    imageBase64?: string | null
  ): Promise<MyResult | null> {
    this.log("processing", "Doing the thing...");

    const prompt = `${instruction}
Relevant context: ${context.pantryDescription}`;

    const result = await this.callAgent<MyResult>(prompt);

    if (result) {
      this.log("done", "Completed successfully");
    } else {
      this.log("error", "Failed to get result");
    }

    return result;
  }
}
```

## System Prompt Rules

- All prompts must enforce JSON-only output (no backticks, no markdown)
- Include the exact JSON schema the agent must return
- Be explicit about rules and priorities (e.g. "Prioritize expiring items")
- Keep prompts under 500 words
- Never include API keys or sensitive data in prompts
- Test prompt changes against at least 5 varied inputs before committing

## Execution Model

- Orchestrator always runs first on every request
- Image agent runs sequentially before Cooking (dependency)
- Shopping and Location always run in parallel
- New agents should declare their dependencies in `src/constants/agents.ts`
  using `AGENT_DEPENDENCIES` and `PARALLEL_GROUPS`
- Use `Promise.all()` for parallel execution, never sequential awaits

## Logging

Every agent must log its lifecycle:
- `"processing"` — when work begins
- `"done"` — with a summary of what was produced
- `"error"` — with a meaningful error message

Logs feed the UI activity bar via the `LogCallback`. Never log sensitive
user data. Keep log messages under 80 characters.

## Error Handling

- Agents must never throw. Return `null` on failure.
- `BaseAgent.callAgent()` wraps API calls in try/catch already.
- The orchestrator handles null results gracefully.
- If an agent fails, other parallel agents continue unaffected.

## Testing Agents

- Mock `callClaudeJSON` in tests, never call the real API
- Test with varied pantry sizes: empty, 3 items, 20+ items
- Test with expiring items to verify prioritization
- Test JSON parsing with malformed responses
- Orchestrator tests should verify correct routing for different intents

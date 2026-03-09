# Prompt Engineering Standards

## Overview

Agent quality depends on system prompts in `src/constants/prompts.ts`.
Treat prompts as production code — review, test, and version them.

## Prompt Structure

Every agent prompt follows this template:

```
1. Role statement    — "You are the [X] Agent for PantryPal."
2. Task description  — What the agent does in one sentence.
3. Output format     — "Respond ONLY with JSON (no backticks):"
4. JSON schema       — Exact structure with realistic example values.
5. Rules/priorities  — Numbered behavioral rules.
```

## Output Format Rules

- Always enforce "Respond ONLY with JSON (no backticks, no markdown)"
- Include complete JSON schema with realistic example values
- Keep schemas flat where possible
- The parser strips backticks as safety net, but prompts should prevent them

## Writing Effective Prompts

- Be specific: "Provide exactly 3 recipes" not "some recipes"
- State priorities: "Prioritize ingredients marked [EXPIRING SOON]"
- Include constraints: "Use realistic UK pricing in GBP"
- State what NOT to do: "Do not include specialist equipment recipes"
- Keep under 500 words

## Context Injection

```typescript
const prompt = `${instruction}
Dietary preference: ${context.dietaryPreference}
Available ingredients: ${context.pantryDescription}
${context.extraContext || ""}`;
```

- Expiring items tagged `[EXPIRING SOON]` in descriptions
- Never inject raw user input into system prompts
- Keep injected context concise

## Orchestrator Routing Tests

Always test routing with these scenarios:
1. "What can I cook?" (cooking only)
2. Photo upload with no text (image then cooking)
3. "Find cheap meals and where to buy" (cooking + shopping + location)
4. "Where is the nearest Tesco?" (location only)
5. "Use up my chicken before it expires" (cooking with expiry focus)
6. Vague: "hungry" (should route to cooking)

## Versioning

Add version comments when making significant changes:

```typescript
// v2 — 2025-03-07: Added budget-awareness to shopping agent
// v1 — 2025-03-01: Initial shopping agent prompt
```

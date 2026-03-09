# TypeScript Standards

## General Rules

- Strict mode is enabled. No `any` types unless absolutely unavoidable
  and accompanied by a comment explaining why.
- Prefer `interface` for object shapes, `type` for unions and intersections.
- Use `unknown` instead of `any` when the type is truly unknown.
- All function parameters and return types must be explicitly typed.
- Prefer `const` over `let`. Never use `var`.

## Naming Conventions

- Files: `camelCase.ts` for utilities, `PascalCase.tsx` for components
- Interfaces/Types: `PascalCase` (e.g. `PantryItem`, `AgentResult`)
- Enums: `PascalCase` with `PascalCase` members
- Functions/variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE` for true constants
- Agent IDs: `snake_case` strings in the `AgentId` union type
- Hooks: `useCamelCase` prefix always

## Type Organization

- All shared types live in `src/types/` grouped by domain
- Agent types: `src/types/agents.ts`
- Pantry/food types: `src/types/pantry.ts`
- Chat/UI types: `src/types/chat.ts`
- Never define types inline in components — extract to `src/types/`
- Export types from their domain file, not from `index.ts` barrels

## Imports

Group imports in this order, separated by blank lines:
1. React / React Native
2. Third-party libraries
3. Internal types
4. Internal modules (agents, services, hooks, utils)
5. Components
6. Constants

## Null Handling

- Use `T | null` for values that may be absent. Avoid `undefined` in
  return types.
- The agent system returns `null` on failure — always check before using.
- Use optional chaining (`?.`) and nullish coalescing (`??`) over
  manual null checks where readable.

## Generics

- `BaseAgent<TResult>` uses generics for typed agent responses.
- `callClaudeJSON<T>` uses generics for typed API parsing.
- Prefer meaningful generic names: `TResult`, `TInput` over `T`, `U`.

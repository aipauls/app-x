# Project Conventions

## Directory Rules

```
src/
  agents/       — One file per agent + base class + index barrel
  screens/      — One file per screen (default exports)
  components/   — One file per component (named exports)
  hooks/        — One file per hook (named exports)
  services/     — One file per external integration
  store/        — One file per store slice + index setup
  types/        — One file per domain (agents, pantry, chat)
  constants/    — Config grouped by concern
  utils/        — Pure functions grouped by concern
```

- No nested subdirectories unless folder exceeds 15 files.
- Folders with 3+ files should have `index.ts` barrel exports.

## File Size Limits

- Components: 150 lines max
- Agents: 100 lines max
- Hooks: 120 lines max
- Utility files: 200 lines max
- System prompts: 500 words max

## Adding New Features

1. Needs its own AI agent? → Follow `skills/agents.md`
2. New screen? → `src/screens/`, add to navigation
3. Shared UI element? → `src/components/` with props interface
4. Shared state? → Appropriate Zustand store in `src/store/`
5. External API? → `src/services/`, add keys to `.env.example`
6. Utility function? → Appropriate file in `src/utils/`

## Dependencies

- Prefer Expo-compatible packages
- Pin exact versions for critical deps
- Document why each dependency was added in PR descriptions

## Documentation

- New agents documented in `skills/agents.md`
- New services documented in `skills/api-and-services.md`
- README updated for new screens, agents, or major features
- Inline comments explain WHY, not WHAT
- JSDoc on all public functions in services and utils

## Code Review Checklist

- [ ] Types in `src/types/`, not inline
- [ ] No `any` without justification
- [ ] Agent follows BaseAgent pattern
- [ ] Prompts enforce JSON-only output
- [ ] Error handling returns null, never throws
- [ ] Styles use StyleSheet.create
- [ ] No API keys in code
- [ ] Tests cover happy path and errors
- [ ] Conventional commit messages
- [ ] No console.log left in production code

# API & Services Standards

## Anthropic API

- All Claude calls go through `src/services/anthropic.ts`.
- Model: `claude-sonnet-4-20250514` defined once in the service file.
- Max tokens: 1024. Increase only with documented justification.
- System prompts live in `src/constants/prompts.ts`, never in agents.

## API Key Security

- Development: `.env` file, never committed to git.
- Production: route through backend proxy. Client never holds the key.
- Never log, expose, or include keys in error messages.

## Service Layer Pattern

```typescript
const BASE_URL = "https://api.example.com";

export async function getData(): Promise<MyType | null> {
  try {
    const response = await fetch(BASE_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Service error:", error);
    return null;
  }
}
```

- Services return `null` on failure, never throw.
- Log errors with service name and status code.
- Set 30-second timeout on all external calls.
- Future retry logic: exponential backoff, max 3, only on 429/5xx.

## Storage (AsyncStorage)

- All operations go through `src/services/storage.ts`.
- Keys prefixed with `@appx_`.
- Wrap reads in try/catch — storage can fail on low-memory devices.

## Response Parsing

- All JSON parsing via `src/utils/parsing.ts`.
- Always validate parsed data shape before using.
- Never trust API response structure blindly.

## Adding New Services

1. Create file in `src/services/`
2. Follow service layer pattern above
3. Add required keys to `.env.example`
4. Document in this skills file
5. Mock in tests — never call real APIs in tests

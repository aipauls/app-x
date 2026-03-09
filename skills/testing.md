# Testing Standards

## Framework

- Jest for unit and integration tests
- React Native Testing Library for component tests
- Tests in `__tests__/` mirroring `src/` structure

## What to Test

Must test:
- All agent `execute()` methods with mocked API responses
- Orchestrator routing logic
- Utility functions (dates, parsing, helpers)
- Custom hooks with varied inputs
- JSON parsing with malformed responses

Should test:
- Component rendering with different props
- Store actions and state transitions
- Navigation flows

Don't test:
- Third-party library internals
- Styling / visual layout
- Direct API calls (mock the service layer)

## Test Structure

```typescript
jest.mock("../../src/services/anthropic");
const mockCall = callClaudeJSON as jest.MockedFunction<typeof callClaudeJSON>;

describe("CookingAgent", () => {
  const agent = new CookingAgent();
  const ctx = {
    pantryDescription: "Eggs (Fridge), Rice (Cupboard)",
    dietaryPreference: "None",
    userLocation: "London, UK",
  };

  beforeEach(() => jest.clearAllMocks());

  it("should return recipes on valid response", async () => {
    mockCall.mockResolvedValue({ recipes: [{ name: "Egg Fried Rice" }] });
    const result = await agent.execute("Recommend recipes", ctx);
    expect(result?.recipes).toHaveLength(1);
  });

  it("should return null on API failure", async () => {
    mockCall.mockResolvedValue(null);
    const result = await agent.execute("Recommend recipes", ctx);
    expect(result).toBeNull();
  });
});
```

## Agent Test Scenarios

Every agent must be tested against:
1. Happy path — valid input, correct response
2. Empty pantry — no ingredients
3. Large pantry — 20+ items
4. Expiring items — verify prioritization
5. API failure — null response
6. Malformed JSON — backticks, extra prose
7. Missing fields — partial JSON

## Coverage Targets

- Agents: 90%+
- Utils: 95%+
- Hooks: 80%+
- Components: 70%+

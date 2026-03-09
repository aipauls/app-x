import { OrchestratorAgent } from "../../src/agents";

describe("OrchestratorAgent", () => {
  it("should be instantiable", () => {
    const agent = new OrchestratorAgent();
    expect(agent.id).toBe("orchestrator");
  });

  // TODO: Add integration tests with mocked API responses
});

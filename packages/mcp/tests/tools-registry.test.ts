import { describe, expect, it } from "vitest";
import { createMockClient, withMcpSession } from "./test-utils.js";

describe("MCP tool registry", () => {
  it("exposes all 32 tools", async () => {
    const mock = createMockClient();
    await withMcpSession(mock, async (c) => {
      const { tools } = await c.listTools();
      expect(tools).toHaveLength(32);
      const names = new Set(tools.map((t) => t.name));
      expect(names.has("list_targets")).toBe(true);
      expect(names.has("get_experiment_quote_pdf")).toBe(true);
      expect(names.has("revoke_token")).toBe(true);
      expect(names.has("submit_feedback")).toBe(true);
    });
  });
});

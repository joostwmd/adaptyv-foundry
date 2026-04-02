import { tokenMockData } from "@adaptyv/foundry-shared/mockdata";
import { FoundryApiError } from "@adaptyv/foundry-sdk";
import { describe, expect, it } from "vitest";
import { createMockClient, withMcpSession } from "./test-utils.js";

describe("MCP tools — tokens", () => {
  it("list_tokens — success", async () => {
    const mock = createMockClient();
    mock.tokens.list.mockResolvedValue(tokenMockData.list.response);
    await withMcpSession(mock, async (c) => {
      const out = await c.callTool({
        name: "list_tokens",
        arguments: { ...tokenMockData.list.query },
      });
      expect(out.content[0].text).toContain("Production API token");
    });
  });

  it("attenuate_token — success", async () => {
    const mock = createMockClient();
    mock.tokens.attenuate.mockResolvedValue(tokenMockData.attenuate.response);
    await withMcpSession(mock, async (c) => {
      await c.callTool({
        name: "attenuate_token",
        arguments: { ...tokenMockData.attenuate.requestBody },
      });
    });
  });

  it("revoke_token — success", async () => {
    const mock = createMockClient();
    mock.tokens.revoke.mockResolvedValue(tokenMockData.revoke.response);
    await withMcpSession(mock, async (c) => {
      const out = await c.callTool({
        name: "revoke_token",
        arguments: {},
      });
      expect(out.content[0].text).toContain("revoked_at");
    });
  });

  it("list_tokens — API error", async () => {
    const mock = createMockClient();
    mock.tokens.list.mockRejectedValue(new FoundryApiError(403, { error: "no" }));
    await withMcpSession(mock, async (c) => {
      const out = await c.callTool({
        name: "list_tokens",
        arguments: {},
      });
      expect(out.isError).toBe(true);
    });
  });

  it("attenuate_token — invalid args", async () => {
    const mock = createMockClient();
    await withMcpSession(mock, async (c) => {
      const out = await c.callTool({
        name: "attenuate_token",
        arguments: { token: "x" },
      });
      expect(out.isError).toBe(true);
      expect(out.content[0].text).toMatch(/name|attenuation/);
    });
  });
});

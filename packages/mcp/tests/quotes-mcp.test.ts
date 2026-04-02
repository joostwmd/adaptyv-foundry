import { quoteMockData } from "@adaptyv/foundry-shared/mockdata";
import { FoundryApiError } from "@adaptyv/foundry-sdk";
import { describe, expect, it } from "vitest";
import { createMockClient, withMcpSession } from "./test-utils.js";

describe("MCP tools — quotes", () => {
  it("list_quotes — success", async () => {
    const mock = createMockClient();
    mock.quotes.list.mockResolvedValue(quoteMockData.list.response);
    await withMcpSession(mock, async (c) => {
      const out = await c.callTool({
        name: "list_quotes",
        arguments: { ...quoteMockData.list.query },
      });
      expect(out.content[0].text).toContain("Q-2026-0001");
    });
  });

  it("get_quote — success", async () => {
    const mock = createMockClient();
    mock.quotes.get.mockResolvedValue(quoteMockData.get.response);
    await withMcpSession(mock, async (c) => {
      await c.callTool({
        name: "get_quote",
        arguments: { ...quoteMockData.get.path },
      });
    });
  });

  it("confirm_quote — success", async () => {
    const mock = createMockClient();
    mock.quotes.confirm.mockResolvedValue(quoteMockData.confirm.response);
    await withMcpSession(mock, async (c) => {
      await c.callTool({
        name: "confirm_quote",
        arguments: { ...quoteMockData.confirm.input },
      });
    });
  });

  it("reject_quote — success", async () => {
    const mock = createMockClient();
    mock.quotes.reject.mockResolvedValue(quoteMockData.reject.response);
    await withMcpSession(mock, async (c) => {
      await c.callTool({
        name: "reject_quote",
        arguments: { ...quoteMockData.reject.input },
      });
    });
  });

  it("get_quote — API error", async () => {
    const mock = createMockClient();
    mock.quotes.get.mockRejectedValue(new FoundryApiError(404, { error: "nf" }));
    await withMcpSession(mock, async (c) => {
      const out = await c.callTool({
        name: "get_quote",
        arguments: { quote_id: "missing" },
      });
      expect(out.isError).toBe(true);
    });
  });

  it("get_quote — invalid args", async () => {
    const mock = createMockClient();
    await withMcpSession(mock, async (c) => {
      const out = await c.callTool({ name: "get_quote", arguments: {} });
      expect(out.isError).toBe(true);
      expect(out.content[0].text).toContain("quote_id");
    });
  });
});

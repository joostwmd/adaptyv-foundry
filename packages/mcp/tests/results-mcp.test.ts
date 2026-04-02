import { resultMockData } from "@adaptyv/foundry-shared/mockdata";
import { FoundryApiError } from "@adaptyv/foundry-sdk";
import { describe, expect, it } from "vitest";
import { createMockClient, withMcpSession } from "./test-utils.js";

describe("MCP tools — results", () => {
  it("list_results — success", async () => {
    const mock = createMockClient();
    mock.results.list.mockResolvedValue(resultMockData.list.response);
    await withMcpSession(mock, async (c) => {
      const out = await c.callTool({
        name: "list_results",
        arguments: { ...resultMockData.list.query },
      });
      expect(out.content[0].text).toContain("KD");
    });
  });

  it("get_result — success", async () => {
    const mock = createMockClient();
    mock.results.get.mockResolvedValue(resultMockData.get.response);
    await withMcpSession(mock, async (c) => {
      await c.callTool({
        name: "get_result",
        arguments: { ...resultMockData.get.path },
      });
    });
  });

  it("list_experiment_results — success", async () => {
    const mock = createMockClient();
    mock.results.listForExperiment.mockResolvedValue(
      resultMockData.listForExperiment.response,
    );
    await withMcpSession(mock, async (c) => {
      await c.callTool({
        name: "list_experiment_results",
        arguments: { ...resultMockData.listForExperiment.input },
      });
    });
  });

  it("get_result — API error", async () => {
    const mock = createMockClient();
    mock.results.get.mockRejectedValue(new FoundryApiError(404, { error: "nf" }));
    await withMcpSession(mock, async (c) => {
      const out = await c.callTool({
        name: "get_result",
        arguments: { result_id: "x" },
      });
      expect(out.isError).toBe(true);
    });
  });

  it("get_result — invalid args", async () => {
    const mock = createMockClient();
    await withMcpSession(mock, async (c) => {
      const out = await c.callTool({ name: "get_result", arguments: {} });
      expect(out.isError).toBe(true);
      expect(out.content[0].text).toContain("result_id");
    });
  });
});

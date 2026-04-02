import { experimentMockData } from "@adaptyv/foundry-shared/mockdata";
import { FoundryApiError } from "@adaptyv/foundry-sdk";
import { describe, expect, it } from "vitest";
import { createMockClient, withMcpSession } from "./test-utils.js";

describe("MCP tools — experiments", () => {
  it("list_experiments — success", async () => {
    const mock = createMockClient();
    mock.experiments.list.mockResolvedValue(experimentMockData.list.response);
    await withMcpSession(mock, async (c) => {
      const out = await c.callTool({
        name: "list_experiments",
        arguments: { ...experimentMockData.list.query },
      });
      expect(out.content[0].text).toContain("EXP-2026-001");
    });
  });

  it("create_experiment — success", async () => {
    const mock = createMockClient();
    mock.experiments.create.mockResolvedValue(experimentMockData.create.response);
    await withMcpSession(mock, async (c) => {
      await c.callTool({
        name: "create_experiment",
        arguments: { ...experimentMockData.create.requestBody },
      });
    });
  });

  it("get_experiment — success", async () => {
    const mock = createMockClient();
    mock.experiments.get.mockResolvedValue(experimentMockData.get.response);
    await withMcpSession(mock, async (c) => {
      const out = await c.callTool({
        name: "get_experiment",
        arguments: { ...experimentMockData.get.path },
      });
      expect(out.content[0].text).toContain("PD-L1 BLI");
    });
  });

  it("update_experiment — success", async () => {
    const mock = createMockClient();
    mock.experiments.update.mockResolvedValue(experimentMockData.update.response);
    await withMcpSession(mock, async (c) => {
      await c.callTool({
        name: "update_experiment",
        arguments: { ...experimentMockData.update.input },
      });
    });
  });

  it("submit_experiment — success", async () => {
    const mock = createMockClient();
    mock.experiments.submit.mockResolvedValue(experimentMockData.submit.response);
    await withMcpSession(mock, async (c) => {
      await c.callTool({
        name: "submit_experiment",
        arguments: { ...experimentMockData.submit.path },
      });
    });
  });

  it("estimate_cost — success", async () => {
    const mock = createMockClient();
    mock.experiments.estimateCost.mockResolvedValue(
      experimentMockData.estimateCost.response,
    );
    await withMcpSession(mock, async (c) => {
      await c.callTool({
        name: "estimate_cost",
        arguments: { ...experimentMockData.estimateCost.requestBody },
      });
    });
  });

  it("get_experiment_invoice — success", async () => {
    const mock = createMockClient();
    mock.experiments.getInvoice.mockResolvedValue(
      experimentMockData.getInvoice.response,
    );
    await withMcpSession(mock, async (c) => {
      await c.callTool({
        name: "get_experiment_invoice",
        arguments: { ...experimentMockData.getInvoice.path },
      });
    });
  });

  it("get_experiment_quote — success", async () => {
    const mock = createMockClient();
    mock.experiments.getQuote.mockResolvedValue(experimentMockData.getQuote.response);
    await withMcpSession(mock, async (c) => {
      await c.callTool({
        name: "get_experiment_quote",
        arguments: { ...experimentMockData.getQuote.path },
      });
    });
  });

  it("confirm_experiment_quote — success", async () => {
    const mock = createMockClient();
    mock.experiments.confirmQuote.mockResolvedValue(
      experimentMockData.confirmQuote.response,
    );
    await withMcpSession(mock, async (c) => {
      await c.callTool({
        name: "confirm_experiment_quote",
        arguments: { ...experimentMockData.confirmQuote.input },
      });
    });
  });

  it("get_experiment_quote_pdf — binary wrapper", async () => {
    const mock = createMockClient();
    const bytes = new Uint8Array([...experimentMockData.getQuotePdf.bytes]).buffer;
    mock.experiments.getQuotePdf.mockResolvedValue(bytes);
    await withMcpSession(mock, async (c) => {
      const out = await c.callTool({
        name: "get_experiment_quote_pdf",
        arguments: { ...experimentMockData.getQuotePdf.path },
      });
      expect(out.content[0].text).toMatch(/base64-encoded PDF/);
    });
  });

  it("create_experiment — API error", async () => {
    const mock = createMockClient();
    mock.experiments.create.mockRejectedValue(
      new FoundryApiError(422, { error: "bad spec" }),
    );
    await withMcpSession(mock, async (c) => {
      const out = await c.callTool({
        name: "create_experiment",
        arguments: {
          name: "x",
          experiment_spec: { experiment_type: "screening" },
        },
      });
      expect(out.isError).toBe(true);
    });
  });

  it("get_experiment — invalid args", async () => {
    const mock = createMockClient();
    await withMcpSession(mock, async (c) => {
      const out = await c.callTool({ name: "get_experiment", arguments: {} });
      expect(out.isError).toBe(true);
      expect(out.content[0].text).toContain("experiment_id");
    });
  });
});

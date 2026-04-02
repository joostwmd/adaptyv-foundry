import { experimentFixtures } from "@adaptyv/foundry-shared/fixtures";
import { FoundryApiError } from "@adaptyv/foundry-sdk";
import { describe, expect, it } from "vitest";
import { createMockClient, withMcpSession } from "./test-utils.js";

describe("MCP tools — experiments", () => {
  it("list_experiments — success", async () => {
    const mock = createMockClient();
    mock.experiments.list.mockResolvedValue(experimentFixtures.list.response);
    await withMcpSession(mock, async (c) => {
      const out = await c.callTool({
        name: "list_experiments",
        arguments: { ...experimentFixtures.list.query },
      });
      expect(out.content[0].text).toContain("EXP-2026-001");
    });
  });

  it("create_experiment — success", async () => {
    const mock = createMockClient();
    mock.experiments.create.mockResolvedValue(experimentFixtures.create.response);
    await withMcpSession(mock, async (c) => {
      await c.callTool({
        name: "create_experiment",
        arguments: { ...experimentFixtures.create.requestBody },
      });
    });
  });

  it("get_experiment — success", async () => {
    const mock = createMockClient();
    mock.experiments.get.mockResolvedValue(experimentFixtures.get.response);
    await withMcpSession(mock, async (c) => {
      const out = await c.callTool({
        name: "get_experiment",
        arguments: { ...experimentFixtures.get.path },
      });
      expect(out.content[0].text).toContain("PD-L1 BLI");
    });
  });

  it("update_experiment — success", async () => {
    const mock = createMockClient();
    mock.experiments.update.mockResolvedValue(experimentFixtures.update.response);
    await withMcpSession(mock, async (c) => {
      await c.callTool({
        name: "update_experiment",
        arguments: { ...experimentFixtures.update.input },
      });
    });
  });

  it("submit_experiment — success", async () => {
    const mock = createMockClient();
    mock.experiments.submit.mockResolvedValue(experimentFixtures.submit.response);
    await withMcpSession(mock, async (c) => {
      await c.callTool({
        name: "submit_experiment",
        arguments: { ...experimentFixtures.submit.path },
      });
    });
  });

  it("estimate_cost — success", async () => {
    const mock = createMockClient();
    mock.experiments.estimateCost.mockResolvedValue(
      experimentFixtures.estimateCost.response,
    );
    await withMcpSession(mock, async (c) => {
      await c.callTool({
        name: "estimate_cost",
        arguments: { ...experimentFixtures.estimateCost.requestBody },
      });
    });
  });

  it("get_experiment_invoice — success", async () => {
    const mock = createMockClient();
    mock.experiments.getInvoice.mockResolvedValue(
      experimentFixtures.getInvoice.response,
    );
    await withMcpSession(mock, async (c) => {
      await c.callTool({
        name: "get_experiment_invoice",
        arguments: { ...experimentFixtures.getInvoice.path },
      });
    });
  });

  it("get_experiment_quote — success", async () => {
    const mock = createMockClient();
    mock.experiments.getQuote.mockResolvedValue(experimentFixtures.getQuote.response);
    await withMcpSession(mock, async (c) => {
      await c.callTool({
        name: "get_experiment_quote",
        arguments: { ...experimentFixtures.getQuote.path },
      });
    });
  });

  it("confirm_experiment_quote — success", async () => {
    const mock = createMockClient();
    mock.experiments.confirmQuote.mockResolvedValue(
      experimentFixtures.confirmQuote.response,
    );
    await withMcpSession(mock, async (c) => {
      await c.callTool({
        name: "confirm_experiment_quote",
        arguments: { ...experimentFixtures.confirmQuote.input },
      });
    });
  });

  it("get_experiment_quote_pdf — binary wrapper", async () => {
    const mock = createMockClient();
    const bytes = new Uint8Array([...experimentFixtures.getQuotePdf.bytes]).buffer;
    mock.experiments.getQuotePdf.mockResolvedValue(bytes);
    await withMcpSession(mock, async (c) => {
      const out = await c.callTool({
        name: "get_experiment_quote_pdf",
        arguments: { ...experimentFixtures.getQuotePdf.path },
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

import { sequenceFixtures } from "@adaptyv/foundry-shared/fixtures";
import { FoundryApiError } from "@adaptyv/foundry-sdk";
import { describe, expect, it } from "vitest";
import { createMockClient, withMcpSession } from "./test-utils.js";

describe("MCP tools — sequences", () => {
  it("list_sequences — success", async () => {
    const mock = createMockClient();
    mock.sequences.list.mockResolvedValue(sequenceFixtures.list.response);
    await withMcpSession(mock, async (c) => {
      const out = await c.callTool({
        name: "list_sequences",
        arguments: { ...sequenceFixtures.list.query },
      });
      expect(out.content[0].text).toContain("mAb1");
    });
  });

  it("get_sequence — success", async () => {
    const mock = createMockClient();
    mock.sequences.get.mockResolvedValue(sequenceFixtures.get.response);
    await withMcpSession(mock, async (c) => {
      await c.callTool({
        name: "get_sequence",
        arguments: { ...sequenceFixtures.get.path },
      });
    });
  });

  it("add_sequences — success", async () => {
    const mock = createMockClient();
    mock.sequences.add.mockResolvedValue(sequenceFixtures.add.response);
    await withMcpSession(mock, async (c) => {
      await c.callTool({
        name: "add_sequences",
        arguments: { ...sequenceFixtures.add.requestBody },
      });
    });
  });

  it("list_experiment_sequences — success", async () => {
    const mock = createMockClient();
    mock.sequences.listForExperiment.mockResolvedValue(
      sequenceFixtures.listForExperiment.response,
    );
    await withMcpSession(mock, async (c) => {
      await c.callTool({
        name: "list_experiment_sequences",
        arguments: { ...sequenceFixtures.listForExperiment.input },
      });
    });
  });

  it("get_sequence — API error", async () => {
    const mock = createMockClient();
    mock.sequences.get.mockRejectedValue(new FoundryApiError(404, { error: "gone" }));
    await withMcpSession(mock, async (c) => {
      const out = await c.callTool({
        name: "get_sequence",
        arguments: { sequence_id: "nope" },
      });
      expect(out.isError).toBe(true);
    });
  });

  it("get_sequence — invalid args", async () => {
    const mock = createMockClient();
    await withMcpSession(mock, async (c) => {
      const out = await c.callTool({ name: "get_sequence", arguments: {} });
      expect(out.isError).toBe(true);
      expect(out.content[0].text).toContain("sequence_id");
    });
  });
});

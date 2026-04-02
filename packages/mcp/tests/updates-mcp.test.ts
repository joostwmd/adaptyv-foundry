import { updateFixtures } from "@adaptyv/foundry-shared/fixtures";
import { FoundryApiError } from "@adaptyv/foundry-sdk";
import { describe, expect, it } from "vitest";
import { createMockClient, withMcpSession } from "./test-utils.js";

describe("MCP tools — updates", () => {
  it("list_updates — success", async () => {
    const mock = createMockClient();
    mock.updates.list.mockResolvedValue(updateFixtures.list.response);
    await withMcpSession(mock, async (c) => {
      const out = await c.callTool({
        name: "list_updates",
        arguments: { ...updateFixtures.list.query },
      });
      expect(out.content[0].text).toContain("Experiment created");
    });
  });

  it("list_experiment_updates — success", async () => {
    const mock = createMockClient();
    mock.updates.listForExperiment.mockResolvedValue(
      updateFixtures.listForExperiment.response,
    );
    await withMcpSession(mock, async (c) => {
      await c.callTool({
        name: "list_experiment_updates",
        arguments: { ...updateFixtures.listForExperiment.input },
      });
    });
  });

  it("list_experiment_updates — API error", async () => {
    const mock = createMockClient();
    mock.updates.listForExperiment.mockRejectedValue(
      new FoundryApiError(403, { error: "denied" }),
    );
    await withMcpSession(mock, async (c) => {
      const out = await c.callTool({
        name: "list_experiment_updates",
        arguments: {
          experiment_id: "019d4a2b-0000-0000-0000-000000000001",
        },
      });
      expect(out.isError).toBe(true);
    });
  });

  it("list_experiment_updates — invalid args", async () => {
    const mock = createMockClient();
    await withMcpSession(mock, async (c) => {
      const out = await c.callTool({
        name: "list_experiment_updates",
        arguments: {},
      });
      expect(out.isError).toBe(true);
      expect(out.content[0].text).toContain("experiment_id");
    });
  });
});

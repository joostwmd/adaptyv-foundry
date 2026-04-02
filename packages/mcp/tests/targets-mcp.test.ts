import { targetFixtures } from "@adaptyv/foundry-shared/fixtures";
import { FoundryApiError } from "@adaptyv/foundry-sdk";
import { describe, expect, it } from "vitest";
import { createMockClient, withMcpSession } from "./test-utils.js";

describe("MCP tools — targets", () => {
  it("list_targets — success", async () => {
    const mock = createMockClient();
    mock.targets.list.mockResolvedValue(targetFixtures.list.response);
    await withMcpSession(mock, async (c) => {
      const out = await c.callTool({
        name: "list_targets",
        arguments: { ...targetFixtures.list.query },
      });
      expect(out.isError).not.toBe(true);
      expect(out.content[0].type).toBe("text");
      expect(out.content[0].text).toContain("EGFR");
      expect(mock.targets.list).toHaveBeenCalledOnce();
    });
  });

  it("get_target — success", async () => {
    const mock = createMockClient();
    mock.targets.get.mockResolvedValue(targetFixtures.get.response);
    await withMcpSession(mock, async (c) => {
      const out = await c.callTool({
        name: "get_target",
        arguments: { ...targetFixtures.get.path },
      });
      expect(out.content[0].text).toContain("PD-L1");
    });
  });

  it("list_custom_target_requests — success", async () => {
    const mock = createMockClient();
    mock.targets.listCustomRequests.mockResolvedValue(
      targetFixtures.listCustomRequests.response,
    );
    await withMcpSession(mock, async (c) => {
      await c.callTool({
        name: "list_custom_target_requests",
        arguments: { ...targetFixtures.listCustomRequests.query },
      });
      expect(mock.targets.listCustomRequests).toHaveBeenCalled();
    });
  });

  it("get_custom_target_request — success", async () => {
    const mock = createMockClient();
    mock.targets.getCustomRequest.mockResolvedValue(
      targetFixtures.getCustomRequest.response,
    );
    await withMcpSession(mock, async (c) => {
      await c.callTool({
        name: "get_custom_target_request",
        arguments: { ...targetFixtures.getCustomRequest.path },
      });
    });
  });

  it("request_custom_target — success", async () => {
    const mock = createMockClient();
    mock.targets.requestCustom.mockResolvedValue(
      targetFixtures.requestCustom.response,
    );
    await withMcpSession(mock, async (c) => {
      await c.callTool({
        name: "request_custom_target",
        arguments: { ...targetFixtures.requestCustom.requestBody },
      });
    });
  });

  it("get_target — FoundryApiError becomes tool error", async () => {
    const mock = createMockClient();
    mock.targets.get.mockRejectedValue(new FoundryApiError(404, { error: "nope" }));
    await withMcpSession(mock, async (c) => {
      const out = await c.callTool({
        name: "get_target",
        arguments: { target_id: "x" },
      });
      expect(out.isError).toBe(true);
      expect(out.content[0].text).toContain("404");
    });
  });

  it("get_target — invalid input returns MCP validation error", async () => {
    const mock = createMockClient();
    await withMcpSession(mock, async (c) => {
      const out = await c.callTool({ name: "get_target", arguments: {} });
      expect(out.isError).toBe(true);
      expect(out.content[0].text).toContain("target_id");
    });
  });
});

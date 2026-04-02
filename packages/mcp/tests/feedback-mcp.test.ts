import { feedbackFixtures } from "@adaptyv/foundry-shared/fixtures";
import { FoundryApiError } from "@adaptyv/foundry-sdk";
import { describe, expect, it } from "vitest";
import { createMockClient, withMcpSession } from "./test-utils.js";

describe("MCP tools — feedback", () => {
  it("submit_feedback — success", async () => {
    const mock = createMockClient();
    mock.feedback.submit.mockResolvedValue(feedbackFixtures.submit.response);
    await withMcpSession(mock, async (c) => {
      const out = await c.callTool({
        name: "submit_feedback",
        arguments: { ...feedbackFixtures.submit.requestBody },
      });
      expect(out.content[0].text).toContain("Feedback recorded");
    });
  });

  it("submit_feedback — API error", async () => {
    const mock = createMockClient();
    mock.feedback.submit.mockRejectedValue(
      new FoundryApiError(500, { error: "server" }),
    );
    await withMcpSession(mock, async (c) => {
      const out = await c.callTool({
        name: "submit_feedback",
        arguments: { ...feedbackFixtures.submit.requestBody },
      });
      expect(out.isError).toBe(true);
    });
  });

  it("submit_feedback — invalid args", async () => {
    const mock = createMockClient();
    await withMcpSession(mock, async (c) => {
      const out = await c.callTool({ name: "submit_feedback", arguments: {} });
      expect(out.isError).toBe(true);
      expect(out.content[0].text).toContain("request_uuid");
    });
  });
});

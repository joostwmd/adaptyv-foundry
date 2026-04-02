import { FoundryApiError } from "@adaptyv/foundry-sdk";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it, vi } from "vitest";
import { handleToolCall } from "../src/server/handle-tool-call.js";

function mockServer(): McpServer {
  return {
    sendLoggingMessage: vi.fn().mockResolvedValue(undefined),
  } as unknown as McpServer;
}

describe("handleToolCall", () => {
  it("serializes successful JSON results", async () => {
    const server = mockServer();
    const out = await handleToolCall(server, async () => ({ ok: true, n: 1 }));
    expect(out.content).toHaveLength(1);
    expect(out.content[0].type).toBe("text");
    expect(out.content[0].text).toContain('"ok": true');
  });

  it("encodes binary ArrayBuffer as base64 text", async () => {
    const server = mockServer();
    const buf = new Uint8Array([1, 2, 3, 4]).buffer;
    const out = await handleToolCall(server, async () => buf, { binary: true });
    expect(out.content[0].text).toMatch(/base64-encoded PDF/);
    expect(out.content[0].text).toContain("AQIDBA==");
  });

  it("returns isError for FoundryApiError and appends hint", async () => {
    const server = mockServer();
    const out = await handleToolCall(
      server,
      async () => {
        throw new FoundryApiError(404, { error: "missing" });
      },
      { hint: "Try list_experiments first." },
    );
    expect(out.isError).toBe(true);
    expect(out.content[0].text).toContain("404");
    expect(out.content[0].text).toContain("missing");
    expect(out.content[0].text).toContain("Try list_experiments first.");
  });

  it("rethrows unexpected errors after logging", async () => {
    const server = mockServer();
    await expect(
      handleToolCall(server, async () => {
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");
  });
});

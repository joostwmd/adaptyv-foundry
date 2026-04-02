#!/usr/bin/env node
/**
 * MCP Inspector only — Streamable HTTP. Start the server separately (`pnpm run start:http`).
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import process from "node:process";

const pkgRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const host = process.env.HOST ?? "127.0.0.1";
const port = String(process.env.PORT ?? "3333");
const mcpUrl = `http://${host}:${port}/mcp`;

const args = [
  "-y",
  "@modelcontextprotocol/inspector",
  "--transport",
  "http",
  "--server-url",
  mcpUrl,
];

const apiKey = process.env.MCP_HTTP_API_KEY?.trim();
if (apiKey) {
  args.push("--header", `Authorization: Bearer ${apiKey}`);
}

const child = spawn("npx", args, {
  cwd: pkgRoot,
  env: process.env,
  stdio: "inherit",
});

child.on("exit", (code) => process.exit(code ?? 0));

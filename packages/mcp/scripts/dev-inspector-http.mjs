#!/usr/bin/env node
/**
 * Starts the Streamable HTTP MCP server, waits for /health, then opens MCP Inspector
 * pointed at /mcp. Kills the server when Inspector exits (or on SIGINT).
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import process from "node:process";
import { applyLocalHttpServerDefaults } from "./local-dev-defaults.mjs";

const pkgRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const host = process.env.HOST ?? "127.0.0.1";
const port = String(process.env.PORT ?? "3333");
const base = `http://${host}:${port}`;
const healthUrl = `${base}/health`;
const mcpUrl = `${base}/mcp`;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForHealth() {
  for (let i = 0; i < 75; i++) {
    try {
      const res = await fetch(healthUrl, { signal: AbortSignal.timeout(2000) });
      if (res.ok) return;
    } catch {
      /* retry */
    }
    await sleep(200);
  }
  throw new Error(`Timed out waiting for ${healthUrl}`);
}

const serverEnv = applyLocalHttpServerDefaults(process.env);
if (serverEnv.FOUNDRY_USE_MOCK === undefined) {
  serverEnv.FOUNDRY_USE_MOCK = "1";
}

const server = spawn("pnpm", ["exec", "tsx", "src/index.ts"], {
  cwd: pkgRoot,
  env: serverEnv,
  stdio: "inherit",
});

let shuttingDown = false;
function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  server.kill("SIGTERM");
  process.exit(code);
}

process.on("SIGINT", () => shutdown(130));
process.on("SIGTERM", () => shutdown(143));

server.on("exit", (code, signal) => {
  if (shuttingDown) return;
  const c = code ?? (signal ? 1 : 0);
  process.stderr.write(
    `[dev-inspector-http] MCP server exited${signal ? ` (${signal})` : ""} with code ${c}\n`,
  );
  process.exit(c);
});

try {
  await waitForHealth();
} catch (e) {
  console.error(e);
  shutdown(1);
}

const inspArgs = [
  "-y",
  "@modelcontextprotocol/inspector",
  "--transport",
  "http",
  "--server-url",
  mcpUrl,
  "--header",
  `Authorization: Bearer ${serverEnv.MCP_HTTP_API_KEY}`,
];

const inspector = spawn("npx", inspArgs, {
  cwd: pkgRoot,
  env: process.env,
  stdio: "inherit",
});

inspector.on("exit", (code) => {
  shutdown(code ?? 0);
});

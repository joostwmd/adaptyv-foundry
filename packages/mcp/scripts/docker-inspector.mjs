#!/usr/bin/env node
/**
 * Build (optional), run the MCP HTTP server in Docker, wait for /health, open MCP Inspector.
 * Run from repo root: pnpm docker:inspector [--no-build]
 *
 * Uses the same dev placeholders as run-http-local.mjs when secrets are unset (mock + local keys).
 */
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { applyLocalHttpServerDefaults } from "./local-dev-defaults.mjs";

const CONTAINER_NAME = "foundry-mcp-dev";
const DEFAULT_IMAGE = "foundry-mcp";

function findRepoRoot() {
  let dir = path.dirname(fileURLToPath(import.meta.url));
  for (;;) {
    if (fs.existsSync(path.join(dir, "pnpm-workspace.yaml"))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      throw new Error(
        "Could not find pnpm-workspace.yaml (run from the monorepo; use pnpm docker:inspector from repo root).",
      );
    }
    dir = parent;
  }
}

function cleanupContainer() {
  spawnSync("docker", ["rm", "-f", CONTAINER_NAME], { stdio: "ignore" });
}

async function waitForHealth(url, timeoutMs, intervalMs) {
  const start = Date.now();
  let lastErr = "not ready";
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        return;
      }
      lastErr = `HTTP ${res.status}`;
    } catch (e) {
      lastErr = e instanceof Error ? e.message : String(e);
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(`Health check failed for ${url} within ${timeoutMs}ms (${lastErr})`);
}

const args = process.argv.slice(2);
const noBuild = args.includes("--no-build");

const repoRoot = findRepoRoot();
const image = (process.env.DOCKER_IMAGE ?? DEFAULT_IMAGE).trim() || DEFAULT_IMAGE;

const baseEnv = applyLocalHttpServerDefaults({ ...process.env });
if (baseEnv.FOUNDRY_USE_MOCK === undefined) {
  baseEnv.FOUNDRY_USE_MOCK = "1";
}

const port = String(baseEnv.PORT ?? "8080").trim() || "8080";

if (!noBuild) {
  const build = spawnSync("docker", ["build", "-t", image, "."], {
    cwd: repoRoot,
    stdio: "inherit",
  });
  if (build.status !== 0) {
    process.exit(build.status ?? 1);
  }
}

cleanupContainer();

const runArgs = [
  "run",
  "-d",
  "--name",
  CONTAINER_NAME,
  "-p",
  `${port}:${port}`,
];

const passthroughKeys = [
  "FOUNDRY_API_TOKEN",
  "FOUNDRY_USE_MOCK",
  "FOUNDRY_API_BASE_URL",
  "ALLOWED_ORIGINS",
  "MCP_HTTP_API_KEY",
];

for (const key of passthroughKeys) {
  const v = baseEnv[key];
  if (v !== undefined && String(v).trim().length > 0) {
    runArgs.push("-e", `${key}=${v}`);
  }
}

runArgs.push(
  "-e",
  "MODE=http",
  "-e",
  "HOST=0.0.0.0",
  "-e",
  `PORT=${port}`,
  image,
);

const run = spawnSync("docker", runArgs, {
  cwd: repoRoot,
  stdio: "inherit",
});
if (run.status !== 0) {
  cleanupContainer();
  process.exit(run.status ?? 1);
}

const healthUrl = `http://127.0.0.1:${port}/health`;
const mcpUrl = `http://127.0.0.1:${port}/mcp`;
const mcpKey = baseEnv.MCP_HTTP_API_KEY?.trim() || "";

try {
  await waitForHealth(healthUrl, 90_000, 400);
} catch (err) {
  console.error(String(err));
  cleanupContainer();
  process.exit(1);
}

console.error(`[docker-inspector] MCP: ${mcpUrl} (Bearer matches MCP_HTTP_API_KEY)`);

let cleaned = false;
function cleanupOnce() {
  if (cleaned) {
    return;
  }
  cleaned = true;
  cleanupContainer();
}

const inspectorArgs = [
  "-y",
  "@modelcontextprotocol/inspector@latest",
  "--transport",
  "http",
  "--server-url",
  mcpUrl,
  "--header",
  `Authorization: Bearer ${mcpKey}`,
];

const child = spawn("npx", inspectorArgs, {
  cwd: repoRoot,
  env: process.env,
  stdio: "inherit",
});

child.on("exit", (code) => {
  cleanupOnce();
  process.exit(code ?? 0);
});

for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, () => {
    child.kill(sig);
  });
}

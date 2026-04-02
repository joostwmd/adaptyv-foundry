#!/usr/bin/env node
/** Local stdio MCP: requires FOUNDRY_API_TOKEN in env; dev placeholder when unset. */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import process from "node:process";
import { LOCAL_DEV_FOUNDRY_TOKEN } from "./local-dev-defaults.mjs";

const pkgRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = { ...process.env };
if (!String(env.FOUNDRY_API_TOKEN ?? "").trim()) {
  env.FOUNDRY_API_TOKEN = LOCAL_DEV_FOUNDRY_TOKEN;
}
if (env.FOUNDRY_USE_MOCK === undefined) {
  env.FOUNDRY_USE_MOCK = "1";
}

const child = spawn("pnpm", ["exec", "tsx", "src/index.ts"], {
  cwd: pkgRoot,
  env,
  stdio: "inherit",
});

child.on("exit", (code) => process.exit(code ?? 0));

#!/usr/bin/env node
/** Local HTTP MCP: same env contract as production; dev scripts fill placeholders when unset. */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import process from "node:process";
import { applyLocalHttpServerDefaults } from "./local-dev-defaults.mjs";

const pkgRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = applyLocalHttpServerDefaults(process.env);
if (env.FOUNDRY_USE_MOCK === undefined) {
  env.FOUNDRY_USE_MOCK = "1";
}

const child = spawn("pnpm", ["exec", "tsx", "src/index.ts"], {
  cwd: pkgRoot,
  env,
  stdio: "inherit",
});

child.on("exit", (code) => process.exit(code ?? 0));

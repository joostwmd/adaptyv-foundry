import { startHttp } from "./server/transports/http.js";
import { startStdio } from "./server/transports/stdio.js";

const mode = (process.env.MODE ?? "stdio").toLowerCase();

async function main(): Promise<void> {
  if (mode === "http") {
    await startHttp();
    return;
  }
  await startStdio();
}

main().catch((err) => {
  console.error("[adaptyv-foundry-mcp] fatal:", err);
  process.exit(1);
});

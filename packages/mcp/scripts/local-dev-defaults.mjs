/**
 * Placeholder values used only by dev scripts when env vars are unset.
 * Production / CI must set real FOUNDRY_API_TOKEN and (for HTTP) MCP_HTTP_API_KEY.
 */
export const LOCAL_DEV_FOUNDRY_TOKEN = "local-dev-foundry-token";
export const LOCAL_DEV_MCP_HTTP_KEY = "local-dev-mcp-http-key";

/** Apply defaults for local Streamable HTTP (inspector:http, start:http). */
export function applyLocalHttpServerDefaults(env) {
  const out = { ...env, MODE: "http" };
  if (!String(out.FOUNDRY_API_TOKEN ?? "").trim()) {
    out.FOUNDRY_API_TOKEN = LOCAL_DEV_FOUNDRY_TOKEN;
  }
  if (!String(out.MCP_HTTP_API_KEY ?? "").trim()) {
    out.MCP_HTTP_API_KEY = LOCAL_DEV_MCP_HTTP_KEY;
  }
  return out;
}

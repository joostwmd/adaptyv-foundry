# adaptyv-foundry-mcp

MCP server for the Adaptyv Foundry API (stdio or Streamable HTTP).

## Environment variables

See [`.env.example`](./.env.example).

| Variable | Required | Role |
|----------|----------|------|
| `FOUNDRY_API_TOKEN` | **Always** | Must be set in every environment. **Mock mode** does not send it to Foundry; **live mode** uses it as the API bearer token. Same contract as production. |
| `FOUNDRY_USE_MOCK` | No | `1` / `true` → in-memory mock client instead of HTTP to Foundry. |
| `MODE` | No | `http` → Streamable HTTP gateway; otherwise stdio. |
| `MCP_HTTP_API_KEY` | **When `MODE=http`** | Clients must send `Authorization: Bearer <same value>` on `/mcp`. `/health` stays open. |
| `PORT` / `HOST` | No | HTTP listen address (defaults `3333` / `127.0.0.1`). |
| `ALLOWED_ORIGINS` | No | Comma-separated `Origin` allowlist for browsers. |

### Local dev scripts (placeholders)

`pnpm start`, `pnpm run start:http`, `pnpm run inspector:http`, and `inspector:stdio` fill **development-only** defaults when variables are unset (see `scripts/local-dev-defaults.mjs`):

- `FOUNDRY_API_TOKEN` → `local-dev-foundry-token`
- `MCP_HTTP_API_KEY` → `local-dev-mcp-http-key` (HTTP only)

**Production** and **`node dist/index.js`** must set real values — the app throws on startup if `FOUNDRY_API_TOKEN` is missing, or if `MODE=http` and `MCP_HTTP_API_KEY` is missing.

### Two auth layers (HTTP)

1. **MCP HTTP** — Wrong or missing `Authorization: Bearer` on `/mcp` → **401** `{"error":"unauthorized"}`.
2. **Foundry** — After MCP auth succeeds, live mode calls Foundry with `FOUNDRY_API_TOKEN`; failures become **tool errors**. Mock mode never calls Foundry.

**Test MCP 401:** `curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3333/mcp` (no Bearer).

**Test Foundry errors:** valid MCP Bearer + `FOUNDRY_USE_MOCK=0` + invalid `FOUNDRY_API_TOKEN`.

## How to test with MCP Inspector

### Stdio

Mock (script passes `FOUNDRY_API_TOKEN=local-dev-foundry-token`):

```bash
cd packages/mcp
pnpm run inspector:stdio
```

Live API:

```bash
cd packages/mcp
export FOUNDRY_API_TOKEN="your-token"
pnpm run inspector:stdio:live
```

`pnpm run inspector` is an alias for `inspector:stdio`.

### HTTP

**One command (server + Inspector):** defaults mock + both placeholder secrets if unset:

```bash
cd packages/mcp
pnpm run inspector:http
```

**Two terminals** (uses same dev placeholders as `start:http` when env is empty):

```bash
# Terminal 1
cd packages/mcp
pnpm run start:http
```

```bash
# Terminal 2
cd packages/mcp
pnpm run inspector:http:connect
```

Override any value via the environment, e.g. real Foundry + real MCP secret:

```bash
export FOUNDRY_USE_MOCK=0
export FOUNDRY_API_TOKEN="real-foundry-token"
export MCP_HTTP_API_KEY="real-mcp-secret"
pnpm run inspector:http
```

**Health check:** `curl -s http://127.0.0.1:3333/health`

## Automated tests

```bash
pnpm --filter adaptyv-foundry-mcp test
```

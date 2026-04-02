# adaptyv-foundry-mcp

MCP server for the Adaptyv Foundry API (stdio or Streamable HTTP).

## Environment variables

See [`.env.example`](./.env.example). Quick reference:

| Variable | When it matters |
|----------|-----------------|
| `FOUNDRY_USE_MOCK` | `1` / `true` → in-memory mock client (good for local testing). |
| `FOUNDRY_API_TOKEN` | Required when mock is off (real Foundry API). |
| `MODE` | Set to `http` to run the Hono gateway instead of stdio. |
| `PORT` / `HOST` | HTTP listen address (default `3333` / `127.0.0.1`). |
| `MCP_HTTP_API_KEY` | If set, `/mcp` requires `Authorization: Bearer …` (Inspector: use the same header). |
| `ALLOWED_ORIGINS` | Optional comma-separated `Origin` allowlist for browser clients. |

You do not need a `.env` file if you export variables in the shell or prefix commands (e.g. `FOUNDRY_USE_MOCK=1 pnpm run …`).

## How to test with MCP Inspector

### Stdio (Inspector spawns the server)

Mock Foundry data:

```bash
cd packages/mcp
pnpm run inspector:stdio
```

Live Foundry API (token required):

```bash
cd packages/mcp
export FOUNDRY_API_TOKEN="your-token"
pnpm run inspector:stdio:live
```

`pnpm run inspector` is an alias for `inspector:stdio` (mock).

### HTTP (Streamable HTTP)

**Option A — one command (server + Inspector):** mock is enabled only if your shell already has `FOUNDRY_USE_MOCK=1` (or add it):

```bash
cd packages/mcp
FOUNDRY_USE_MOCK=1 pnpm run inspector:http
```

If `MCP_HTTP_API_KEY` is set in the environment, the script passes `Authorization: Bearer …` to Inspector automatically.

**Option B — two terminals:** run the server, then connect the UI.

```bash
# Terminal 1
cd packages/mcp
FOUNDRY_USE_MOCK=1 pnpm run start:http
```

```bash
# Terminal 2
cd packages/mcp
FOUNDRY_USE_MOCK=1 pnpm run inspector:http:connect
```

Use the same `MCP_HTTP_API_KEY` (if any) in both terminals.

**Health check:** `curl -s http://127.0.0.1:3333/health`

## Automated tests

```bash
pnpm --filter adaptyv-foundry-mcp test
```

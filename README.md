# adaptyv-foundry

Monorepo: TypeScript SDK for the Adaptyv Foundry API and an MCP server.

- **MCP testing (Inspector, env vars, HTTP vs stdio):** [packages/mcp/README.md](packages/mcp/README.md).
- **Mock MCP / Inspector (stdio):** `cd packages/mcp && pnpm run inspector` (passes `FOUNDRY_USE_MOCK=1` and a dev `FOUNDRY_API_TOKEN` placeholder; see MCP README).
- **HTTP + Inspector in one go:** `cd packages/mcp && pnpm run inspector:http` (starts server, then Inspector on `http://127.0.0.1:3333/mcp`).
- **Live API MCP (stdio):** `FOUNDRY_API_TOKEN=… pnpm run inspector:api` in `packages/mcp` (alias for `inspector:stdio:live`).
- **Stdio MCP with mock:** `pnpm mcp:mock` from repo root (sets dev `FOUNDRY_API_TOKEN` + mock).
- **Stdio MCP live:** `pnpm mcp` requires `FOUNDRY_API_TOKEN` in the environment (no placeholder).

Shared canned data: `@adaptyv/foundry-shared/mockdata`. In-memory client: `createMockFoundryClient` from `@adaptyv/foundry-sdk/mock`.

## HTTP MCP (`MODE=http`)

| Variable | Role |
|----------|------|
| `FOUNDRY_USE_MOCK` | `1` / `true` = mock data; off = real Foundry API. |
| `FOUNDRY_API_TOKEN` | **Always required** (mock does not send it to Foundry; live mode uses it). Server-side only. |
| `MCP_HTTP_API_KEY` | **Required when `MODE=http`.** `/mcp` requires `Authorization: Bearer <key>`. `/health` is not protected. |
| `ALLOWED_ORIGINS` | Comma-separated origins; when non-empty, requests with an `Origin` header must match (browser hardening). |

Responses from `/health` and `/mcp` include `X-Request-Id`. Clients may send `X-Request-Id` (or `x-request-id`) to correlate with server logs; otherwise the server generates a UUID. Tool error logs include the same id when the call runs over HTTP.

Local example: `cd packages/mcp && pnpm run inspector:http`, or run `pnpm run start:http` and in another terminal `pnpm run inspector:http:connect`.

See `packages/mcp/.env.example` and [packages/mcp/README.md](packages/mcp/README.md) for variables and testing steps.

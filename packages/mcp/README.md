# adaptyv-foundry-mcp

MCP server for the [Adaptyv Foundry](https://foundry.adaptyvbio.com) HTTP API. Exposes experiments, targets, sequences, results, quotes, updates, tokens, and feedback as **MCP tools** so assistants (e.g. Cursor) can work with Foundry in natural language. Supports **stdio** (local) and **Streamable HTTP** at **`/mcp`** for remote clients.

The HTTP entrypoint is **`/mcp`** (not the site root). **`GET /health`** is for load checks and is **not** protected by the MCP Bearer.

TypeScript client used internally: [**`@adaptyv/foundry-sdk`**](../sdk/README.md).

## How it works (architecture)

| Layer | Role |
|--------|------|
| **SDK** | [`FoundryClient`](../sdk) from `@adaptyv/foundry-sdk`, or **`createMockFoundryClient`** when mock mode is on. Factory: [`src/foundry-client.ts`](src/foundry-client.ts). |
| **MCP tools** | Wrappers around SDK resource methods with Zod-validated arguments — [`src/tools/`](src/tools/). |
| **Transports** | **stdio** (default): MCP stdio transport in [`src/server/transports/stdio.ts`](src/server/transports/stdio.ts). **HTTP:** Hono + `WebStandardStreamableHTTPServerTransport` on **`/mcp`** in [`src/server/transports/http.ts`](src/server/transports/http.ts). |
| **HTTP gateway** | Bearer auth for `/mcp`, optional `Origin` allowlist, request IDs — [`src/server/http/middleware/`](src/server/http/middleware/). |

## Mock mode vs live (Foundry API)

| | **Mock** | **Live API** |
|--|----------|----------------|
| **Env** | `FOUNDRY_USE_MOCK=1` (or `true` / `yes`) | unset or `0` |
| **Backend** | In-memory **`createMockFoundryClient()`** — data from `@adaptyv/foundry-shared/mockdata`; **no** HTTP to Adaptyv | **`FoundryClient`** → **`https://foundry-api-public.adaptyvbio.com/api/v1`** (override with **`FOUNDRY_API_BASE_URL`**) with **`FOUNDRY_API_TOKEN`** |
| **`FOUNDRY_API_TOKEN`** | Still **required** at startup; **not** sent to Foundry | **Bearer** on every Foundry request |
| **HTTP MCP** | When `MODE=http`, **`MCP_HTTP_API_KEY`** still required; protects **`/mcp`** only | Same |

## Demo host (example)

Example deployment (operator may use mock or live Foundry):

- **Health:** `https://adaptyv-foundry.onrender.com/health`
- **MCP:** `https://adaptyv-foundry.onrender.com/mcp` — send **`Authorization: Bearer <MCP_HTTP_API_KEY>`** matching that deployment’s secret.

For anything serious, deploy your own instance below.

## Deploy your own instance

The repo root [**Dockerfile**](../../Dockerfile) builds this package for **`MODE=http`** (`HOST=0.0.0.0`, `PORT` from the platform).

**Render** — Blueprint [`render.yaml`](../../render.yaml), one-click:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/joostwmd/adaptyv-foundry)

Set **`FOUNDRY_API_TOKEN`** and **`MCP_HTTP_API_KEY`** in the service environment; use **`https://<your-service>.onrender.com/mcp`** in Cursor with the same Bearer.

**Fly.io** — [`fly.toml`](../../fly.toml) · [Deploy to Fly.io](https://fly.io/launch?repo=https://github.com/joostwmd/adaptyv-foundry)

More context: [root README.md](../../README.md).

---

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

**401 `{"error":"unauthorized"}` from Inspector (browser)** — Your server expects **`Authorization: Bearer <MCP_HTTP_API_KEY>`** on every `/mcp` request. The browser UI often connects with **only the URL** (`http://127.0.0.1:3333/mcp`), so the proxy **does not send** the Bearer and Hono correctly returns 401.

Fix one of these:

1. **Inspector UI:** When adding a Streamable HTTP server, open the **headers / authentication / advanced** section (wording depends on Inspector version) and add header **`Authorization`** with value **`Bearer test-mcp-secret`** (or whatever matches `MCP_HTTP_API_KEY`). Then connect again.
2. **CLI (always forwards headers):** stop the browser-only flow and run:
   ```bash
   npx -y @modelcontextprotocol/inspector@latest \
     --transport http \
     --server-url http://127.0.0.1:3333/mcp \
     --header "Authorization: Bearer test-mcp-secret"
   ```
3. **Repo script:** `pnpm run inspector:http:connect` (uses your env or the dev placeholder `local-dev-mcp-http-key` — must match the running server’s `MCP_HTTP_API_KEY`).

Older Inspector releases had bugs passing Bearer on Streamable HTTP; **`@latest`** is recommended.

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

### Docker (production image + Inspector)

From the **monorepo root**, with Docker installed: `pnpm docker:inspector` builds the image (`foundry-mcp`), runs a container named `foundry-mcp-dev` on **port 8080** (override with `PORT=...`), waits for `/health`, then starts MCP Inspector with `Authorization: Bearer` matching `MCP_HTTP_API_KEY` (dev placeholders apply when unset, same as `start:http`). Skip rebuild: `pnpm docker:inspector -- --no-build`. Image tag override: `DOCKER_IMAGE=my-tag pnpm docker:inspector`.

Override any value via the environment, e.g. real Foundry + real MCP secret:

```bash
export FOUNDRY_USE_MOCK=0
export FOUNDRY_API_TOKEN="real-foundry-token"
export MCP_HTTP_API_KEY="real-mcp-secret"
pnpm run inspector:http
```

**Health check:** `curl -s http://127.0.0.1:3333/health`

### Manual checks: bad MCP token vs bad Foundry token

Use **`pnpm exec tsx`** for the server so dev scripts do not inject mock defaults you did not ask for (or export everything explicitly).

**Terminal 1 — server** (pick a known MCP secret; Foundry set to **live** with a **bogus** token):

```bash
cd packages/mcp
export MODE=http
export MCP_HTTP_API_KEY="test-mcp-secret"
export FOUNDRY_USE_MOCK=0
export FOUNDRY_API_TOKEN="not-a-real-foundry-token"
pnpm exec tsx src/index.ts
```

**A — Invalid / missing MCP Bearer** (Hono returns **401** before MCP runs; Foundry token irrelevant):

```bash
# No Authorization header
curl -s -i http://127.0.0.1:3333/mcp | head -n 5

# Wrong Bearer
curl -s -i -H "Authorization: Bearer wrong" http://127.0.0.1:3333/mcp | head -n 5
```

Expect **`401`** and body like `{"error":"unauthorized"}`.

**B — Valid MCP Bearer, invalid Foundry token** (MCP accepts the request; tool calls hit Foundry and fail as **tool errors**):

```bash
cd packages/mcp
npx -y @modelcontextprotocol/inspector \
  --transport http \
  --server-url http://127.0.0.1:3333/mcp \
  --header "Authorization: Bearer test-mcp-secret"
```

In the Inspector UI, run a tool such as **`list_targets`**. Expect a **Foundry API error** in the tool result (e.g. 401/403 from the real API), not an HTTP 401 from `/mcp`.

**C — Both wrong at once:** use **A** first (curl without Bearer) → **401**. With **B**, MCP auth passes and you only see Foundry failures.

## Cursor chat (Streamable HTTP)

Cursor can talk to this server over **HTTP** the same way as MCP Inspector: the app must be **running** (`pnpm run start:http` or `pnpm exec tsx` with `MODE=http`), and the **Bearer must match** `MCP_HTTP_API_KEY`.

**Remote:** use your deploy URL with path **`/mcp`**, e.g. `https://adaptyv-foundry.onrender.com/mcp`.

1. **Merge** a server entry into your MCP config (do not replace the whole file if you already have servers):
   - **Project:** `.cursor/mcp.json` in this repo, or  
   - **Global:** `~/.cursor/mcp.json` on macOS/Linux.

2. Paste the example below into your config (or merge only the `adaptyv-foundry-http` key into `"mcpServers"` if you already have other servers).

   If you use dev defaults from `pnpm run start:http`, the placeholder MCP key is **`local-dev-mcp-http-key`**. If you set `MCP_HTTP_API_KEY=test-mcp-secret` on the server, use **`Bearer test-mcp-secret`** in `headers.Authorization` instead.

```json
{
  "mcpServers": {
    "adaptyv-foundry-http": {
      "url": "http://127.0.0.1:3333/mcp",
      "headers": {
        "Authorization": "Bearer local-dev-mcp-http-key"
      }
    }
  }
}
```

3. **Cursor Settings → MCP:** enable **adaptyv-foundry-http** (or reload MCP).

4. Fully **restart Cursor** if tools do not appear (MCP config is often cached).

**UI path:** *Settings → Tools & MCP → Add MCP server* — choose an HTTP / remote style entry if offered, URL `http://127.0.0.1:3333/mcp` (or your HTTPS `/mcp` URL), and set header **`Authorization`** to **`Bearer <MCP_HTTP_API_KEY>`** (same as Inspector).

**Note:** Stdio (`command` + `args`) is still supported and does not need the HTTP server or `MCP_HTTP_API_KEY`; use HTTP when you want the same path as Inspector / remote clients.

## Automated tests

```bash
pnpm --filter adaptyv-foundry-mcp test
```

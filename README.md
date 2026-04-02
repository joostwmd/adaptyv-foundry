# Adaptyv Foundry — SDK, MCP & client tooling

Monorepo for **developer tooling around [Adaptyv Foundry](https://foundry.adaptyvbio.com)** (protein characterization): a TypeScript SDK, a Model Context Protocol (MCP) server for AI assistants, shared schemas and mock data, and (as part of the same initiative) a **notification / onboarding web app** so clients can connect integrations quickly.

This work is **independent** and **not affiliated with or endorsed by Adaptyv Bio**. It exists to support the mission—making programmatic access to Foundry-style workflows easier for builders and researchers.

## Development note (mock data)

Almost everything here was built **without access to a live Foundry API account**. Types, request/response shapes, and **mock fixtures** are derived from Adaptyv’s **official OpenAPI** specification (`packages/sdk/tests/openapi.json`) and shared Zod schemas. The in-memory **`createMockFoundryClient`** path exercises the same flows end-to-end for tests and local MCP use. When you set a real **`FOUNDRY_API_TOKEN`** and turn mock mode off, the SDK and MCP talk to the **public Foundry API**—behavior then depends on your token and org.

## What’s in this repository

| Area | Location | Description |
|------|----------|-------------|
| **Shared types & mocks** | [`packages/shared`](packages/shared) | Zod schemas and canned **`mockdata`** aligned with the OpenAPI spec. |
| **TypeScript SDK** | [`packages/sdk`](packages/sdk) | **`FoundryClient`** + resource methods; optional **`@adaptyv/foundry-sdk/mock`**. See [packages/sdk/README.md](packages/sdk/README.md). |
| **MCP server** | [`packages/mcp`](packages/mcp) | Stdio or **Streamable HTTP** (`/mcp`) exposing Foundry as MCP tools. See [packages/mcp/README.md](packages/mcp/README.md). |
| **Notification web app** | *Planned* | Small web UI to help clients connect faster (e.g. MCP config, webhooks, experiment alerts). Not checked into `main` yet; may land under `apps/` or similar. |

## Quick start (from repo root)

```bash
pnpm install
pnpm build
```

- **MCP (mock, stdio):** `pnpm mcp:mock`
- **MCP (HTTP + Inspector):** `cd packages/mcp && pnpm run inspector:http`
- **Docker smoke:** `pnpm docker:inspector` (see [packages/mcp/README.md](packages/mcp/README.md))
- **Tests:** `pnpm test` (SDK) · `pnpm test:mcp` (MCP)

## Deploying the MCP server

The root [**Dockerfile**](Dockerfile) builds the MCP HTTP image. After deploy, use **`https://<host>/mcp`** with **`Authorization: Bearer <MCP_HTTP_API_KEY>`**; **`/health`** is unauthenticated.

- **Render (Blueprint):** [render.yaml](render.yaml)
- **Fly.io:** [fly.toml](fly.toml)

**One-click (public repo):**

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/joostwmd/adaptyv-foundry)

[![Deploy to Fly.io](https://fly.io/static/images/landing/deploy-button.svg)](https://fly.io/launch?repo=https://github.com/joostwmd/adaptyv-foundry)

Set secrets on the platform (**`FOUNDRY_API_TOKEN`**, **`MCP_HTTP_API_KEY`**; optional **`FOUNDRY_USE_MOCK`**, **`ALLOWED_ORIGINS`**, **`FOUNDRY_API_BASE_URL`**). Details: [packages/mcp/README.md](packages/mcp/README.md).

## Documentation map

- [packages/sdk/README.md](packages/sdk/README.md) — SDK usage and publishing stance  
- [packages/mcp/README.md](packages/mcp/README.md) — MCP environment variables, Inspector, Cursor, Docker  

## License / naming

Package names use the `@adaptyv/` scope for clarity of *purpose* (Foundry API). That is **not** an indication of official ownership; see the SDK README for the **npm publish** stance.

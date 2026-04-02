# Adaptyv Foundry MCP

A **Model Context Protocol server** that exposes the [Adaptyv Foundry](https://foundry.adaptyvbio.com) protein characterization API as MCP tools — so AI assistants like Claude and Cursor can interact with experiments, targets, sequences, results, and more in natural language.

The server speaks both **stdio** (local process) and **Streamable HTTP** (`/mcp`) for remote deployments.

> **Not affiliated with or endorsed by Adaptyv Bio.** This is an independent project built to make programmatic access to Foundry-style workflows easier for builders and researchers.

---

## Motivation

Adaptyv Foundry offers a powerful API for running protein characterization experiments. There's no official MCP server, which means AI assistants can't query or manage experiments without custom glue code.

This project bridges that gap. Drop the MCP server into Cursor (or any MCP-compatible client), point it at your Foundry token, and start asking questions like *"what's the status of my latest experiment?"* or *"show me the results for experiment X"* — no context switching, no custom scripts.

The server ships with a full **mock mode** backed by the official OpenAPI spec, so you can develop and test without a live Foundry account.

---

## Deploy your own instance

The recommended path is a one-click **Render** deployment using the included [Blueprint](render.yaml).

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/joostwmd/adaptyv-mcp)

During one-click deploy, Render asks for **`FOUNDRY_API_TOKEN`** and **`MCP_HTTP_API_KEY`**: your Adaptyv Foundry API token and the secret clients send as `Authorization: Bearer …` on `/mcp`. You can change either later under **Environment**. Then install the server in your MCP client:

**Cursor** — add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "adaptyv-foundry": {
      "url": "https://<your-service>.onrender.com/mcp",
      "headers": {
        "Authorization": "Bearer <your-MCP_HTTP_API_KEY>"
      }
    }
  }
}
```

**Claude Desktop** — add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "adaptyv-foundry": {
      "url": "https://<your-service>.onrender.com/mcp",
      "headers": {
        "Authorization": "Bearer <your-MCP_HTTP_API_KEY>"
      }
    }
  }
}
```

`GET /health` is always open and unauthenticated — use it to verify the deployment is live.

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `FOUNDRY_API_TOKEN` | Always | Your Adaptyv Foundry API token. Required even in mock mode. |
| `MCP_HTTP_API_KEY` | When `MODE=http` | Clients must send `Authorization: Bearer <value>` to `/mcp`. |
| `FOUNDRY_USE_MOCK` | No | Set to `1` to use in-memory mock data instead of live Foundry. |
| `ALLOWED_ORIGINS` | No | Comma-separated Origin allowlist for browser clients. |

---

## Demo deployment (mock)

A public demo instance runs with mock data — no real Foundry account needed. It's a great way to explore the available tools before deploying your own.

**Cursor:**

```json
{
  "mcpServers": {
    "adaptyv-foundry-demo": {
      "url": "https://adaptyv-foundry.onrender.com/mcp",
      "headers": {
        "Authorization": "Bearer adaptyv-foundry-demo"
      }
    }
  }
}
```

**Claude Desktop:**

```json
{
  "mcpServers": {
    "adaptyv-foundry-demo": {
      "url": "https://adaptyv-foundry.onrender.com/mcp",
      "headers": {
        "Authorization": "Bearer adaptyv-foundry-demo"
      }
    }
  }
}
```

Health check: [`https://adaptyv-foundry.onrender.com/health`](https://adaptyv-foundry.onrender.com/health)

> The demo runs on Render's free tier and may spin down after inactivity — the first request after a cold start can take ~30 seconds.

---

## Roadmap

- [ ] **Fly.io one-click deployment** — `fly.toml` is already in the repo; the goal is a proper deploy button and documented secrets workflow matching the Render experience.
- [ ] **End-to-end tests against the live Foundry API** — current tests run fully against mock data derived from the OpenAPI spec. The next step is an opt-in E2E suite that fires against a real `FOUNDRY_API_TOKEN` to validate the full request/response cycle.
- [ ] **Slack notification delivery** — see the companion project below.

---

## Also built: Adaptyv Notifications

If you want **email alerts** when your Foundry experiments change status, check out the companion project:

**[joostwmd/adaptyv-notifications](https://github.com/joostwmd/adaptyv-notifications)** — receives Foundry experiment webhooks and fans out configurable email notifications, with a small dashboard for managing destinations and delivery history.

---

## Repository structure

| Package | Description |
|---|---|
| [`packages/shared`](packages/shared) | Zod schemas and mock fixtures aligned with the Foundry OpenAPI spec. |
| [`packages/sdk`](packages/sdk) | `FoundryClient` TypeScript SDK with optional mock client. |
| [`packages/mcp`](packages/mcp) | MCP server (stdio + Streamable HTTP). |

## Local development

```bash
pnpm install
pnpm build

# Run MCP server locally with mock data (stdio)
pnpm mcp:mock

# Run with HTTP transport + MCP Inspector
cd packages/mcp && pnpm run inspector:http

# Tests
pnpm test        # SDK
pnpm test:mcp    # MCP server
```

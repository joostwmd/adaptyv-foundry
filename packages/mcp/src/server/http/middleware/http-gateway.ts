import { createHash, timingSafeEqual } from "node:crypto";
import type { MiddlewareHandler } from "hono";
import type { HttpGatewayVariables } from "../request-context.js";

type HttpMw = MiddlewareHandler<{ Variables: HttpGatewayVariables }>;

/** SHA-256 digest compare — avoids short-circuiting on length differences. */
function bearerSecretsEqual(expected: string, received: string): boolean {
  const a = createHash("sha256").update(expected, "utf8").digest();
  const b = createHash("sha256").update(received, "utf8").digest();
  return timingSafeEqual(a, b);
}

function parseBearerToken(authorization: string | undefined): string | null {
  if (!authorization?.trim()) return null;
  const m = authorization.match(/^Bearer\s+(\S+)/i);
  return m?.[1]?.trim() ?? null;
}

/**
 * When `ALLOWED_ORIGINS` is non-empty, reject requests whose `Origin` header
 * is present and not in the allowlist (browser / DNS-rebinding hardening).
 */
export function allowedOriginsMiddleware(allowedOrigins: Set<string>): HttpMw {
  return async (c, next) => {
    const origin = c.req.header("Origin");
    if (origin && allowedOrigins.size > 0 && !allowedOrigins.has(origin)) {
      return c.text("Forbidden", 403);
    }
    await next();
  };
}

/**
 * When `MCP_HTTP_API_KEY` is set, require `Authorization: Bearer <key>` for
 * MCP routes. Skips `OPTIONS` so browsers can preflight. `/health` should not
 * use this middleware (mount only on `/mcp`).
 */
export function mcpHttpBearerAuthMiddleware(): HttpMw {
  const expected = process.env.MCP_HTTP_API_KEY?.trim();
  if (!expected) {
    return async (_c, next) => next();
  }

  return async (c, next) => {
    if (c.req.method === "OPTIONS") {
      await next();
      return;
    }
    const token = parseBearerToken(c.req.header("Authorization"));
    if (!token || !bearerSecretsEqual(expected, token)) {
      return c.json({ error: "unauthorized" }, 401);
    }
    await next();
  };
}

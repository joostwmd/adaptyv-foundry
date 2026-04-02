import { randomUUID } from "node:crypto";
import { createMiddleware } from "hono/factory";
import type { HttpGatewayVariables } from "../request-context.js";

const MAX_LEN = 128;

function acceptIncomingRequestId(raw: string | undefined): string | null {
  if (!raw?.trim()) return null;
  const t = raw.trim();
  if (t.length > MAX_LEN) return null;
  if (/[\r\n\x00-\x1f]/.test(t)) return null;
  return t;
}

/**
 * Sets `requestId` on Hono context: reuses `X-Request-Id` when valid, else
 * generates a UUID. Echo on responses in the HTTP transport.
 */
export const requestIdMiddleware = createMiddleware<{ Variables: HttpGatewayVariables }>(
  async (c, next) => {
    const incoming =
      acceptIncomingRequestId(c.req.header("X-Request-Id")) ??
      acceptIncomingRequestId(c.req.header("x-request-id"));
    const requestId = incoming ?? randomUUID();
    c.set("requestId", requestId);
    await next();
  },
);

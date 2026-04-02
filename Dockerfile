# syntax=docker/dockerfile:1

FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/sdk/package.json packages/sdk/
COPY packages/mcp/package.json packages/mcp/
RUN pnpm install --frozen-lockfile

COPY packages/shared packages/shared
COPY packages/sdk packages/sdk
COPY packages/mcp packages/mcp
RUN pnpm run build

FROM node:22-alpine AS runtime
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate \
  && apk add --no-cache curl
WORKDIR /app

ENV NODE_ENV=production \
  MODE=http \
  HOST=0.0.0.0 \
  PORT=8080

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/sdk/package.json packages/sdk/
COPY packages/mcp/package.json packages/mcp/

COPY --from=builder /app/packages/shared/dist packages/shared/dist
COPY --from=builder /app/packages/sdk/dist packages/sdk/dist
COPY --from=builder /app/packages/mcp/dist packages/mcp/dist

RUN pnpm install --frozen-lockfile --prod

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD sh -c 'curl -sf "http://127.0.0.1:${PORT}/health" > /dev/null || exit 1'

CMD ["node", "packages/mcp/dist/index.js"]

# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS base
WORKDIR /app

# ---- deps: install dependencies (build tools as fallback for better-sqlite3 on
# architectures without a prebuilt binary, e.g. armv7) ----
FROM base AS deps
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder: compile the Next.js app ----
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- runner: minimal production image ----
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# /data is a single persistent-storage convention used across plain Docker,
# docker-compose and the Home Assistant add-on (Supervisor auto-mounts each
# add-on's private storage at /data). Runs as root: HA Supervisor controls
# ownership of its bind-mounted /data on the host, which a fixed non-root
# UID can't reliably match.
ENV DATABASE_PATH=/data/sweepweek.db
# Optional fixed prefix for generic reverse-proxy setups; Home Assistant
# ingress supplies its own dynamic prefix per request instead (see
# server/ingress-proxy.mjs).
ENV EXTERNAL_BASE_PATH=""

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/server ./server

EXPOSE 3000
VOLUME ["/data"]

CMD ["node", "server/ingress-proxy.mjs"]

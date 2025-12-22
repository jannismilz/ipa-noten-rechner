FROM oven/bun:1 AS base

WORKDIR /app

FROM base AS dependencies
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

FROM base AS build
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

FROM base AS production
ENV NODE_ENV=production
COPY package.json bun.lockb* ./
RUN bun install --production --frozen-lockfile
COPY --from=build /app/src ./src

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 bunuser && \
    chown -R bunuser:nodejs /app

USER bunuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun run --eval "fetch('http://localhost:3000/api/health').then(r => r.ok ? process.exit(0) : process.exit(1))" || exit 1

CMD ["bun", "run", "src/index.js"]

FROM oven/bun:1 AS base

WORKDIR /app

# Dependencies
FROM base AS dependencies

COPY package.json bun.lockb* ./

RUN bun install --frozen-lockfile

FROM base AS build

COPY --from=dependencies /app/node_modules ./node_modules

COPY . .

# Production
FROM base AS production

ENV NODE_ENV=production

COPY package.json bun.lockb* ./

RUN bun install --production --frozen-lockfile

COPY --from=build /app/src ./src

EXPOSE 3000

CMD ["bun", "run", "src/index.js"]

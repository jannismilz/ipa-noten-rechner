FROM oven/bun:1 AS build

WORKDIR /app

COPY shared/ ./shared/
COPY backend/ ./backend/
COPY criterias.json ./criterias.json

WORKDIR /app/backend

RUN bun install --frozen-lockfile

FROM oven/bun:1 AS production

ARG APP_VERSION=dev
ENV NODE_ENV=production
ENV APP_VERSION=${APP_VERSION}

WORKDIR /app

COPY --from=build /app/shared ./shared
COPY --from=build /app/backend ./backend
COPY --from=build /app/criterias.json ./criterias.json

WORKDIR /app/backend

EXPOSE 3000

CMD ["bun", "run", "src/index.js"]

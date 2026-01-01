FROM node:24-alpine AS base

FROM base AS dependencies
WORKDIR /repo
COPY . .
WORKDIR /repo/frontend
RUN npm ci

FROM base AS build
WORKDIR /repo
COPY . .
WORKDIR /repo/frontend
COPY --from=dependencies /repo/frontend/node_modules ./node_modules

RUN npm run build

FROM nginx:alpine AS production

COPY --from=build /repo/frontend/dist /usr/share/nginx/html
COPY --from=build /repo/frontend/nginx.conf /etc/nginx/conf.d/default.conf

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 && \
    chown -R nextjs:nodejs /usr/share/nginx/html /var/cache/nginx /var/run /var/log/nginx

RUN touch /var/run/nginx.pid && \
    chown -R nextjs:nodejs /var/run/nginx.pid

USER nextjs

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

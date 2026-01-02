FROM node:24-alpine AS build

# Copy everything to /build
COPY . /build

# Check if we have frontend directory (repo root context) or not (frontend context)
RUN if [ -d "/build/frontend" ]; then \
      echo "Building from repo root"; \
      cp -r /build/shared /build/frontend/; \
      cd /build/frontend && npm ci && npm run build && mv dist /dist && mv nginx.conf /nginx.conf; \
    else \
      echo "Building from frontend directory"; \
      cd /build && npm ci && npm run build && mv dist /dist && mv nginx.conf /nginx.conf; \
    fi

FROM nginx:alpine AS production

COPY --from=build /dist /usr/share/nginx/html
COPY --from=build /nginx.conf /etc/nginx/conf.d/default.conf

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

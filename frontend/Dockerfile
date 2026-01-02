FROM node:24-alpine AS build

WORKDIR /app
# Copy everything to /build
COPY . .

# Check if we have frontend directory (repo root context) or not (frontend context)
# RUN if [ -d "/build/frontend" ]; then \
#       echo "Building from repo root"; \
#       cp -r /build/shared /build/frontend/; \
#       cd /build/frontend && npm ci && npm run build && mv dist /dist && mv nginx.conf /nginx.conf; \
#     else \
#       echo "Building from frontend directory"; \
#       cd /build && npm ci && npm run build && mv dist /dist && mv nginx.conf /nginx.conf; \
#     fi

# FROM nginx:alpine AS production

# COPY --from=build /dist /usr/share/nginx/html
# COPY --from=build /nginx.conf /etc/nginx/conf.d/default.conf

RUN touch /var/run/nginx.pid && \
    chown -R nextjs:nodejs /var/run/nginx.pid

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

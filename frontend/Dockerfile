FROM node:20-alpine AS build

WORKDIR /app

COPY shared/ ./shared/

COPY frontend/package.json frontend/package-lock.json* ./frontend

RUN cd frontend && npm ci

COPY frontend/ ./

RUN cd frontend && npm run build

FROM nginx:alpine AS production

COPY --from=build /app/frontend/dist /usr/share/nginx/html

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

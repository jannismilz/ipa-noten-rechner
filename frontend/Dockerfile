FROM node:20-alpine AS build

WORKDIR /app

COPY shared/ ./shared/

COPY frontend/package.json frontend/package-lock.json* ./frontend/
COPY frontend ./

WORKDIR /app/frontend

RUN npm ci
RUN npm run build

FROM nginx:alpine AS production

COPY --from=build /app/frontend/dist /usr/share/nginx/html
COPY --from=build /app/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

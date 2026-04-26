ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-alpine AS base

RUN npm install -g @angular/cli@17 --no-fund --no-audit

WORKDIR /app

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# --- Development ---
FROM base AS development

COPY . .

EXPOSE 4200
ENTRYPOINT ["entrypoint.sh"]
CMD ["npm", "start", "--", "--host", "0.0.0.0", "--poll", "500", "--disable-host-check"]

# --- Production build ---
FROM base AS builder

COPY . .
RUN npm ci && npm run build -- --configuration production

# --- Production serve ---
FROM nginx:alpine AS production

COPY --from=builder /app/dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

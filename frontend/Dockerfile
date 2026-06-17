# ── Base ───────────────────────────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /app

# ── Dependencies ───────────────────────────────────────────────
FROM base AS deps
COPY package*.json ./
RUN npm ci

# ── Builder ────────────────────────────────────────────────────
FROM base AS builder
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ── Production (Serve with Nginx) ──────────────────────────────
FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

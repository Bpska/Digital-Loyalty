# ── Base ───────────────────────────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache dumb-init openssl

# ── Dependencies ───────────────────────────────────────────────
FROM base AS deps
COPY package*.json ./
RUN npm ci --omit=dev && cp -R node_modules prod_modules
RUN npm ci

# ── Builder / Prisma Client generation ──────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate

# ── Production ─────────────────────────────────────────────────
FROM base AS production
ENV NODE_ENV=production
# Copy production node_modules (no devDependencies)
COPY --from=deps /app/prod_modules ./node_modules
# Copy source files
COPY . .
# Copy generated Prisma Client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Create uploads and logs directories
RUN mkdir -p uploads logs

EXPOSE 4000

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["sh", "-c", "./node_modules/.bin/prisma db push --accept-data-loss && node --experimental-specifier-resolution=node src/server.js"]

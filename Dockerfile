# Stage 1: Install and build
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/backend/package.json packages/backend/
COPY packages/frontend/package.json packages/frontend/
COPY packages/spec/package.json packages/spec/

RUN npm ci

COPY packages/backend/ packages/backend/
COPY packages/frontend/ packages/frontend/
COPY packages/spec/ packages/spec/

RUN npm -w @booking/frontend run build
RUN npm -w @booking/backend run build

# Stage 2: Production runtime
FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/backend/package.json packages/backend/
COPY packages/frontend/package.json packages/frontend/
COPY packages/spec/package.json packages/spec/

RUN npm ci --omit=dev

# Compiled backend
COPY --from=builder /app/packages/backend/dist/ packages/backend/dist/

# Drizzle migrations (needed at runtime)
COPY --from=builder /app/packages/backend/drizzle/ packages/backend/drizzle/

# Built frontend (served by backend via @fastify/static)
COPY --from=builder /app/packages/frontend/dist/ packages/frontend/dist/

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["sh", "-c", "node packages/backend/dist/db/migrate.js && node packages/backend/dist/index.js"]

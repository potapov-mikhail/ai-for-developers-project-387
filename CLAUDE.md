# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A simplified meeting booking service (Cal.com-inspired). Single calendar owner publishes availability; guests pick a slot and book without registration. Product spec is in Russian at `docs/product_idea.md`.

## Monorepo Structure

npm workspaces monorepo (`packages/*`):

- **`packages/spec`** — TypeSpec API definition that compiles to OpenAPI 3.1. Defines the Booking API models (EventType, Booking, Slot, Availability) and endpoints under `/api/v1` with Owner and Public namespaces.
- **`packages/backend`** — Fastify 5 REST API (TypeScript, ESM). SQLite database via Drizzle ORM (`better-sqlite3`). DB file at `packages/backend/data/booking.db`. Routes under `/api/v1/owner` and `/api/v1/public`. Slot availability logic in `src/services/slots.ts`.
- **`packages/frontend`** — React 19 SPA (Vite, TypeScript, Tailwind CSS v4, shadcn/ui base-nova style). Uses React Router v7 with routes: `/` (landing), `/booking` (booking flow), `/events` (upcoming bookings list).

## Common Commands

```bash
# Install all workspace dependencies
npm install

# API spec — compile TypeSpec to OpenAPI
npm -w @booking/spec run generate

# API spec — run Prism mock server (serves the generated OpenAPI spec)
npm -w @booking/spec run start:mock

# Frontend — dev server (port 5173, proxies /api to Prism on 4010)
npm -w @booking/frontend run dev

# Frontend — production build
npm -w @booking/frontend run build

# Frontend — lint
npm -w @booking/frontend run lint

# Backend — dev server (port 3000, watch mode)
npm -w @booking/backend run dev

# Backend — generate Drizzle migration
npm -w @booking/backend run db:generate

# Backend — apply migrations
npm -w @booking/backend run db:migrate

# Backend — seed database
npm -w @booking/backend run seed
```

## Key Architecture Details

- **API contract-first**: The TypeSpec spec (`packages/spec/main.tsp`) is the source of truth for the API. It compiles to `packages/spec/tsp-output/schema/openapi.yaml`. The frontend types in `packages/frontend/src/types.ts` mirror the TypeSpec models.
- **Frontend API client**: `packages/frontend/src/api/client.ts` — thin fetch wrapper; all API calls go through this module against `BASE = '/api/v1'`.
- **Vite proxy**: Dev server proxies `/api` to `http://127.0.0.1:3000` (backend). Start the backend before running the frontend dev server.
- **Path alias**: `@` maps to `packages/frontend/src/` (configured in vite.config.ts and tsconfig).
- **shadcn/ui**: Uses base-nova style with lucide icons. Add components via `npx shadcn@latest add <component>` from the `packages/frontend` directory.
- **Backend DB**: Drizzle ORM with SQLite. Schema in `packages/backend/src/db/schema.ts`, migrations in `packages/backend/drizzle/`. Config in `packages/backend/drizzle.config.ts`.
- **Backend routes**: Fastify plugins registered with prefixes in `src/index.ts`. Owner routes: availability, bookings, event-types. Public routes: event-types, slots, bookings.
- **Business rules**: Working hours 09:00–18:00 daily, slots cannot overlap across event types (conflict → HTTP 409).

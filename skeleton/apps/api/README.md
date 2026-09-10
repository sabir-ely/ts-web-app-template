# API

A [Hono](https://hono.dev) API with [Kysely](https://kysely.dev) over
{{#if sqlite}}SQLite (better-sqlite3){{else}}PostgreSQL{{/if}}{{#if useAuth}}, and
[Auth.js](https://authjs.dev) credentials authentication{{/if}}.

## Getting started

From the repository root:

```bash
pnpm --filter @{{name}}/api db:migrate
pnpm --filter @{{name}}/api dev
```

`apps/api/.env` was created from `.env.example` when the project was
generated.{{#if useAuth}} `AUTH_SECRET` was generated automatically if
`openssl` was available; otherwise fill it in
(`openssl rand -base64 32`).{{/if}}

## Layout

```text
src/
  controllers/   # Hono route handlers, one file per resource
  services/      # Business logic and database access
  middleware/    # Hono middleware
  database/      # Kysely instance, generated types, migrations
{{#if useAuth}}
  auth.ts        # Auth.js configuration
{{/if}}
  index.ts       # App entrypoint and route registration
```

## Database

{{#if sqlite}}
The database file is read from `DATABASE_URL` in `apps/api/.env`.
{{else}}
The connection string is read from `DATABASE_URL` in `apps/api/.env`; the
database must exist and be reachable before running migrations.
{{/if}}
Migrations live in `src/database/migrations`; `src/database/types.ts` is
generated from the live schema and should not be edited by hand.

```bash
pnpm db:migrate        # apply all pending migrations
pnpm db:types          # regenerate types.ts from the current schema
```

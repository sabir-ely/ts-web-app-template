# {{name}}

A [Turborepo](https://turbo.build) monorepo for a TypeScript web application, managed with [pnpm](https://pnpm.io) workspaces.

## Structure

```text
apps/
  client/   # React + Vite frontend (client-rendered)
  api/      # Hono + Kysely backend (SQLite or PostgreSQL)
packages/
  shared/   # Code shared between the client and the API
```

## Requirements

- Node.js
- pnpm 10 (installed via [Corepack](https://github.com/nodejs/corepack) using the version pinned in `package.json`)

## Getting started

```bash
pnpm install
```

The git-ignored `.env` files were created from their `.env.example` templates
when the project was generated — fill in any empty values. The root `.env`
holds the configuration shared by the client and the API (ports and URLs).

Run the initial database migration:

```bash
pnpm --filter @{{name}}/api db:migrate
```

Then start both dev servers:

```bash
pnpm dev
```

This starts both the client (Vite) and the API (Hono) dev servers in parallel via Turborepo.

## Scripts

| Command          | Description                     |
| ---------------- | ------------------------------- |
| `pnpm dev`       | Run all dev servers in parallel |
| `pnpm build`     | Build all packages              |
| `pnpm lint`      | Lint all packages with oxlint   |
| `pnpm typecheck` | Type-check all packages         |
| `pnpm clean`     | Remove build outputs            |

Run a single package with the `--filter` flag:

```bash
pnpm --filter @{{name}}/client dev
pnpm --filter @{{name}}/api dev
```

## API

The API uses Kysely over {{#if sqlite}}SQLite (node-sqlite3-wasm){{else}}PostgreSQL{{/if}}. The
{{#if sqlite}}database file{{else}}connection string{{/if}} is taken from `DATABASE_URL` in
`apps/api/.env` (git-ignored). Migrations live in `apps/api/src/database/migrations`
and are run with `kysely-ctl`:

```bash
pnpm --filter @{{name}}/api db:migrate        # apply all pending migrations
pnpm --filter @{{name}}/api db:types          # regenerate src/database/types.ts
```

## For coding agents

`.agents/CONTEXT.md` describes the project structure, stack, and conventions.

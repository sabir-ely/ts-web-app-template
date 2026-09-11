# Agent context: {{name}}

A TypeScript monorepo web application using Turborepo + pnpm workspaces.

## Stack

**API** (`apps/api/`):
- Hono — lightweight web framework
- Kysely — type-safe SQL query builder
{{#if sqlite}}
- SQLite via @libsql/client + @libsql/kysely-libsql (`DATABASE_URL` uses a `file:` URL)
{{else}}
- PostgreSQL via pg
{{/if}}
{{#if useAuth}}
- Auth.js (@hono/auth-js) — credentials authentication
{{/if}}
- tsx — dev server with watch mode

**Client** (`apps/client/`):
- React 19 with React Compiler
- Vite (rolldown-vite) — bundler
{{#if useTailwind}}
- Tailwind CSS v4 via @tailwindcss/vite
{{/if}}
{{#if useMantine}}
- Mantine — component library
{{/if}}
{{#if useSWR}}
- SWR — data fetching
{{/if}}
{{#if useAuth}}
- Auth.js React integration (@hono/auth-js/react)
{{/if}}

**Shared** (`packages/shared/`):
- Types and utilities shared between client and API

## Layout

```
apps/
  api/
    src/
{{#if useAuth}}
      auth.ts              # Auth.js configuration
      controllers/         # Route handlers
      services/            # Business logic
{{/if}}
      database/
        database.ts        # Kysely instance
        migrations/        # SQL migrations
        types.ts           # Generated DB types (kysely-codegen)
      index.ts             # Server entrypoint
    kysely.config.ts       # Migration CLI config
  client/
    src/
{{#if useAuth}}
      components/          # React components (AuthForm, UserMenu, etc.)
      services/            # API client services
      lib/                 # Utilities (api client, auth helpers)
{{/if}}
      App.tsx              # Root component
      main.tsx             # React entrypoint
    index.html
    vite.config.ts
packages/
  shared/
    src/index.ts           # Shared exports
```

## Configuration

Environment is split across two `.env` files (git-ignored, created from `.env.example`):

**Root `.env`** — shared by client and API:
- `API_PORT` — API server port (default: 3000)
- `VITE_API_URL` — API URL for the client (default: http://localhost:3000)
- `CLIENT_URL` — client URL for CORS (default: http://localhost:5173)

**`apps/api/.env`** — API-only:
- `DATABASE_URL` — {{#if sqlite}}libsql file URL (default: `file:{{name}}.db`){{else}}PostgreSQL connection string{{/if}}
{{#if useAuth}}
- `AUTH_SECRET` — Auth.js secret (generated at project creation)
{{/if}}

The client reads the root `.env` via Vite's `envDir: "../.."` option.

## Common tasks

```bash
pnpm dev              # Start both dev servers (Turborepo)
pnpm build            # Build all packages
pnpm lint             # Lint with oxlint
pnpm typecheck        # Type-check all packages

pnpm db:migrate                        # Run pending migrations
pnpm --filter @{{name}}/api db:types   # Regenerate DB types from schema
```

## Database

Kysely migrations live in `apps/api/src/database/migrations/`. Each migration exports `up` and `down` functions:

```ts
import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("example")
    .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
    .addColumn("name", "text", (col) => col.notNull())
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("example").execute();
}
```

After changing the schema, regenerate types:

```bash
pnpm --filter @{{name}}/api db:types
```
{{#if useAuth}}

## Authentication

Auth.js is configured in `apps/api/src/auth.ts` with credentials provider. The flow:

1. `POST /api/auth/signin` — creates session cookie
2. `POST /api/auth/signout` — clears session
3. `GET /api/auth/session` — returns current user

Protected routes use the `verifyAuth()` middleware. The client uses `useSession()` from `@hono/auth-js/react`.

Users are stored in the `users` table with bcrypt-hashed passwords.
{{/if}}

## Conventions

- API uses `@/` path alias for `src/` imports
- Client uses relative imports
- All packages use ESM (`"type": "module"`)
- TypeScript strict mode enabled
{{#if useTailwind}}
- Tailwind classes for styling; design tokens in CSS variables
{{/if}}

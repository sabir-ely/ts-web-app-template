# app-template

A [Plop](https://plopjs.com) generator that scaffolds a TypeScript monorepo web app.

## Usage

```bash
pnpm dlx github:sabir-ely/ts-web-app-template
```

You'll be prompted for a project name (used as the npm scope, so `my-app` yields
`@my-app/client`, `@my-app/api`, `@my-app/shared`), a destination directory,
and which features to include:

- **Database** (default: SQLite) — SQLite via libsql (@libsql/client) or PostgreSQL via pg
- **Authentication** (default: yes) — Auth.js credentials auth with a `users` table and API
- **Tailwind CSS** (default: yes) — Tailwind v4 via `@tailwindcss/vite`
- **Mantine** (default: no) — `@mantine/core` + `@mantine/hooks` with `MantineProvider`
- **SWR** (default: yes) — data fetching
- **Tabler icons** (default: yes) — `@tabler/icons-react`
- **Fonts** (default: yes) — self-hosted Inter, Space Grotesk, and JetBrains Mono via Fontsource

Then, in the generated project:

```bash
pnpm install
pnpm db:migrate
pnpm dev
```

To generate non-interactively:

```bash
pnpm dlx github:sabir-ely/ts-web-app-template my-app -- --destination=/path/to/parent
pnpm dlx github:sabir-ely/ts-web-app-template my-app -- --useAuth=false --database=postgres
pnpm dlx github:sabir-ely/ts-web-app-template my-app -- --useAuth=false --useTailwind=true --useMantine=false --useSWR=true --useTabler=true --useFonts=true
```

## What it generates

```text
apps/
  client/   # React + Vite frontend
  api/      # Hono + Kysely backend
packages/
  shared/   # Code shared between client and API
```

## For coding agents

`.agents/CONTEXT.md` describes how the generator works, its Handlebars pitfalls, and how to verify changes. `.agents/skills/` contains skills for common tasks.

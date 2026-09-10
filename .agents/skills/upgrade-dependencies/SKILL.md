---
name: upgrade-dependencies
description: Upgrade dependencies across the skeleton's package.json files (client, api, shared, root) to latest compatible versions, keeping the template consistent and verifying generation still works.
---

# Upgrade dependencies

Read `.agents/CONTEXT.md` first for project layout and testing instructions.

## Scope

Dependencies live in these files (all rendered through Handlebars, some deps
inside `{{#if}}` blocks):

- `skeleton/package.json` (turbo, packageManager pin)
- `skeleton/apps/client/package.json`
- `skeleton/apps/api/package.json`
- `skeleton/packages/shared/package.json`
- `package.json` (the generator itself: plop)

## Steps

1. **Check latest versions.** Use the npm registry to look up current
   versions, e.g. `https://registry.npmjs.org/<pkg>/latest` (URL-encode scoped
   packages: `@mantine/core` -> `@mantine%2fcore`). Batch the lookups.

2. **Respect the existing range style:** `^` for everything except TypeScript
   (`~6.0.2` — minor-pinned on purpose). Keep peer-dependency constraints in
   mind: `@hono/auth-js` requires `@auth/core >= 0.35` and react 18/19;
   `@mantine/*` packages must stay on the same version as each other;
   `@tailwindcss/vite` and `tailwindcss` must match; `@types/react` and
   `@types/react-dom` track the react major.

3. **Check for breaking changes on major bumps** before applying one. Sources
   of truth: the package's CHANGELOG/releases page. Things in this template
   that are sensitive to majors:
   - Vite + `@vitejs/plugin-react` (config shape in `vite.config.ts`)
   - Tailwind (v4 uses `@import "tailwindcss"` + `@theme`, no config file)
   - Mantine (provider/props API)
   - Kysely / kysely-ctl / kysely-codegen (config shape in `kysely.config.ts`)
   - `@auth/core` / `@hono/auth-js` (middleware + `/react` client API)
   If a major changes APIs the skeleton uses, update the skeleton code too,
   or hold the bump and tell the user why.

4. **Apply the version bumps** in all affected `package.json` files. Keep
   versions consistent where packages appear in multiple files (e.g.
   `typescript`, `oxlint`, `oxfmt`, `@types/node` appear in several).

5. **Verify generation still works** for the full flag matrix (see
   `.agents/CONTEXT.md` for the exact commands): no unrendered `{{`, all
   `package.json` files parse, no dangling feature references.

6. **Report** a table of old -> new versions, note any held-back majors and
   why, and remind the user that generated projects install fresh on
   `pnpm install`, so no lockfile in the skeleton needs updating (there is
   none — only the generator itself has `pnpm-lock.yaml`; run `pnpm install`
   at the repo root if plop's own version changed).

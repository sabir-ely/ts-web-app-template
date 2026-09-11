# Agent context: ts-web-app-template

This repository is a [Plop](https://plopjs.com) generator that scaffolds a
TypeScript monorepo web app. It contains no runnable app itself — the app
lives in `skeleton/` and is rendered at generation time.

## Directive: keep docs in sync

Any change to the generator's architecture — adding or removing a feature
flag, changing a dependency, altering the scaffold logic, renaming files or
env vars, or updating the generated stack — must be reflected in **all** of
the following before the task is considered done:

- `README.md` (user-facing: feature list, usage examples, generated structure)
- `.agents/CONTEXT.md` (this file: layout, conventions, pitfalls)
- `skeleton/.agents/CONTEXT.md` (generated project context: stack, config,
  common tasks)

If any of these are out of date after a change, update them as part of the
same task.

## Layout

- `plopfile.js` — the entire generator: prompts, the `scaffold()` action that
  walks `skeleton/`, renders text files through Handlebars, copies binary
  assets verbatim, creates `.env` files from `.env.example` templates,
  auto-generates `AUTH_SECRET` via openssl, and runs `git init` in the new
  project directory.
- `skeleton/` — the template project (Turborepo + pnpm workspaces):
  - `apps/client/` — React 19 + Vite (rolldown-vite) with React Compiler + React Router
  - `apps/api/` — Hono + Kysely API (SQLite or PostgreSQL)
  - `packages/shared/` — code shared between client and API
- `README.md` — user-facing docs for the generator. Keep it in sync with any
  behavior change.

## How rendering works

- `plop.renderString` runs every text file through `handlebars.compile`.
  Answers available in templates: `name`, `destination`, `database`,
  `useAuth`, `useTailwind`, `useMantine`, `useSWR`, `useTabler`, `useFonts`,
  plus derived booleans `sqlite` / `postgres` (computed in `scaffold()`).
- Binary extensions (images, fonts) are copied byte-for-byte — see
  `BINARY_EXTENSIONS` in `plopfile.js`.
- Files that exist only when a feature is on are listed in `AUTH_ONLY_FILES`
  (auth is currently the only feature that drops whole files) and are also
  deleted when re-generating over an existing project with the feature off.
  Current auth-only files include the API auth/controllers/services modules
  and the client `AuthForm`, `AuthGuard`, `UserMenu`, `lib/auth`, `services/auth.service`,
  `pages/auth/SignIn`, and `pages/auth/SignUp`.
- After copying, `.env` files are created from `.env.example` with
  `COPYFILE_EXCL` (never overwrites existing secrets), and `AUTH_SECRET` is
  filled in via `openssl rand -base64 32` when auth is on.

## Handlebars pitfalls (learned the hard way)

- **Standalone `{{#if}}` / `{{/if}}` lines consume their own newline.** To get
  exactly one blank line in both branches, put the blank line *inside* the
  block. A blank line outside a false block yields a double blank.
- **`{{` in template code collides with Handlebars.** JSX like
  `style={{ color: "red" }}` or `style={{ ... }}` is parsed as a Handlebars
  expression and fails with `Missing helper` or `Parse error`. Extract inline
  style objects to a `const` (e.g. `style={formStyle}`) in any file that goes
  through the renderer.
- `{{name}}` interpolations are HTML-escaped by Handlebars — fine for current
  uses (package names, titles), but don't use `{{name}}` where escaping would
  corrupt output.
- Files containing `{{#if}}` are intentionally not valid TS/JSON in the
  skeleton; the skeleton is not meant to be run or type-checked directly.

## Testing changes

There is no test suite. Validate by generating projects into `/tmp` and
inspecting the output. **Do the generation and the inspection in a single
terminal command** — `/tmp` is wiped between terminal calls.

```bash
mkdir -p /tmp/gen && node_modules/.bin/plop project myapp --force -- \
  --destination=/tmp/gen --database=sqlite --useAuth=true \
  --useTailwind=true --useMantine=false --useSWR=true --useTabler=true \
  --useFonts=true
```

Then check:

- `grep -rnI '{{' /tmp/gen/myapp` — must find nothing (unrendered templates).
  Use `-I` to skip binary files.
- Parse every generated `package.json` with `JSON.parse`.
- `grep -rniI '<feature>'` on feature-off output — must find no dangling
  references.
- Generate the full matrix of affected flags (at minimum: feature on/off ×
  auth on/off, and each styling variant for client components).

**Non-interactive runs must pass every prompt flag.** Omitting any flag makes
inquirer crash with `ERR_USE_AFTER_CLOSE` (pre-existing Plop 4 behavior, not a
bug in this template). `--force` goes *before* `--`; answers go after.

## Conventions

- Deps are pinned with `^` semver ranges; TypeScript is `~6.0.2`.
- The API uses `@/` path alias for `src/`; the client uses relative imports.
- Client components that render differently per styling option have three
  branches: `useMantine` / `else if useTailwind` / `else` (plain CSS with
  extracted style consts).
- Env config: root `.env` (`API_PORT`, `VITE_API_URL`, `CLIENT_URL`) shared by
  API (dotenv) and client (Vite `envDir: "../.."`); `apps/api/.env` holds
  `DATABASE_URL` and `AUTH_SECRET`.
- `db:migrate` and `db:types` in `apps/api/package.json` include
  `--dialect=libsql` when `sqlite` is selected (via `{{#if sqlite}}`).
- The scaffold runs `git init` in the generated project directory after all
  files are written. Silently skipped if git is not installed.

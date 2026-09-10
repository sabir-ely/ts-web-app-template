# Client

A client-rendered (non-SSR) [React](https://react.dev) app built with
[Vite](https://vite.dev), with the React Compiler enabled.
{{#if useTailwind}}
Styling is done with [Tailwind CSS](https://tailwindcss.com) v4.
{{/if}}
{{#if useMantine}}
UI components come from [Mantine](https://mantine.dev) (the app is wrapped in
`MantineProvider` in `src/main.tsx`).
{{/if}}
{{#if useSWR}}
[SWR](https://swr.vercel.app) is installed for data fetching.
{{/if}}
{{#if useTabler}}
[Tabler Icons](https://tabler.io/icons) (`@tabler/icons-react`) is installed
for icons.
{{/if}}
{{#if useFonts}}
Self-hosted variable fonts (Inter, Space Grotesk, JetBrains Mono via
[Fontsource](https://fontsource.org)) are imported in `src/main.tsx`.
{{/if}}
{{#if useAuth}}
Authentication uses the React client bundled with
[@hono/auth-js](https://github.com/honojs/middleware/tree/main/packages/auth-js):
`src/lib/auth.ts` points it at the API's `/auth` endpoints (cross-origin, with
cookies), `SessionProvider` wraps the app in `src/main.tsx`, and `App.tsx`
gates the page behind `src/components/AuthForm.tsx` (sign-in / sign-up).
`src/services/auth.service.ts` calls the API's `POST /register` endpoint.
{{/if}}

## Getting started

From the repository root:

```bash
pnpm --filter @{{name}}/client dev
```

To build and preview a production bundle:

```bash
pnpm --filter @{{name}}/client build
pnpm --filter @{{name}}/client preview
```

## API client

`src/lib/api.ts` exports a pre-configured [ky](https://github.com/sindresorhus/ky)
instance whose base URL comes from `VITE_API_URL` in the repository root's
`.env` (loaded via `envDir` in `vite.config.ts`), so the client always points
at the API. Cookies are sent cross-origin (`credentials: "include"`).

```ts
import { api } from "./lib/api";

const users = await api.get("api/users").json<User[]>();
```

## Layout

```text
src/
  main.tsx     # React root
  App.tsx      # Top-level component (replace with your app)
  index.css    # Global styles
  lib/         # API client{{#if useAuth}}, auth client setup{{/if}} and other shared client setup
  hooks/       # Shared React hooks
  services/    # API calls and domain logic
  components/  # Reusable components
public/        # Files served verbatim at the site root
```

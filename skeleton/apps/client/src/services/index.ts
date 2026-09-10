// Client-side services (API calls, domain logic) live here. Use the
// pre-configured API client from `src/lib/api.ts`.
{{#if useAuth}}
export { register } from "./auth.service";
{{/if}}

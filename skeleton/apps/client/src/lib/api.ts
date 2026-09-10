import ky from "ky";

/**
 * Pre-configured API client. The base URL comes from `VITE_API_URL` in the
 * repository root's `.env`, so the client always points at the same server
 * the API is listening on.
 *
 * Usage:
 *   const users = await api.get("api/users").json<User[]>();
 */
export const api = ky.create({
  prefixUrl: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
{{#if useAuth}}
  // Send cookies (the Auth.js session) on cross-origin requests.
  credentials: "include",
{{/if}}
});

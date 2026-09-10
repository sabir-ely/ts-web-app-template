import { authConfigManager } from "@hono/auth-js/react";

// The auth endpoints live on the API, not on this origin, so point the
// @hono/auth-js React client at them explicitly. Requests must include
// cookies cross-origin for the session cookie to be sent and set.
authConfigManager.setConfig({
  baseUrl: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
  basePath: "/auth",
  credentials: "include",
});

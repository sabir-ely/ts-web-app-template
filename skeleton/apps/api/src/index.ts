import { serve } from "@hono/node-server";
import dotenv from "dotenv";
import { Hono } from "hono";
import { cors } from "hono/cors";
{{#if useAuth}}
import { verifyAuth } from "@hono/auth-js";
import { authConfig } from "@/auth";

import auth from "./controllers/auth.controller";
import users from "./controllers/users.controller";
{{/if}}

// Load the shared configuration from the repository root's `.env`.
dotenv.config({ path: new URL("../../.env", import.meta.url).pathname });

const app = new Hono();

// Allow the Vite dev server to call the API during development.
app.use(
  "*",
  cors({
    origin: process.env.CLIENT_URL ?? "http://localhost:5173",
    credentials: true,
  }),
);
{{#if useAuth}}

// Installs the Auth.js config on every request so that `verifyAuth()` and any
// route that reads the session can rely on it being present.
app.use("*", authConfig);
app.use("/api/*", verifyAuth());

app.route("/", auth);
app.route("/api/users", users);
{{/if}}

serve(
  {
    fetch: app.fetch,
    port: Number(process.env.API_PORT ?? 3000),
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);

import { Hono } from "hono";
import { authHandler } from "@hono/auth-js";
import { authConfig } from "@/auth";
import { createUser, userExists } from "@/services/users.service";

const app = new Hono();

app.use("*", authConfig);

app.use("/auth/*", authHandler());

// Public: create a new account. Must be registered BEFORE any protected
// route on the same controller so it is not blocked for anonymous users.
app.post("/register", async (c) => {
  const body = await c.req.json().catch(() => null);

  const username = body?.username;
  const password = body?.password;

  if (typeof username !== "string" || username.trim() === "") {
    return c.json({ error: "username is required" }, 400);
  }
  if (typeof password !== "string" || password.length < 8) {
    return c.json({ error: "password must be at least 8 characters" }, 400);
  }

  if (await userExists(username)) {
    return c.json({ error: "username already taken" }, 409);
  }

  await createUser({
    username,
    password,
    metadata: {},
  });

  // Account created. The client should now go through the normal
  // Credentials sign-in flow (POST /api/auth/callback/credentials).
  return c.json({ message: "account created" }, 201);
});

export default app;

import { getUser, getUsers } from "@/services/users.service";
import { Hono } from "hono";

const app = new Hono();

app.get("/", async (c) => {
  const users = await getUsers();

  return c.json({ data: { users } });
});

app.get("/:username", async (c) => {
  const username = c.req.param("username");

  const user = await getUser({ username });

  return c.json({ data: { user } });
});

export default app;

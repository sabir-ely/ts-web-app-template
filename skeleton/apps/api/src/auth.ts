import { verifyPassword } from "@/services/users.service";
import Credentials from "@auth/core/providers/credentials";
import { initAuthConfig } from "@hono/auth-js";
import { skipCSRFCheck } from "@auth/core";

export const authConfig = initAuthConfig(() => ({
  secret: process.env.AUTH_SECRET,
  skipCSRFCheck: skipCSRFCheck,
  providers: [
    Credentials({
      authorize: async ({ username, password }) => {
        const user = await verifyPassword({
          username: typeof username === "string" ? username : "",
          password: typeof password === "string" ? password : "",
        });

        if (!user) return null;

        return {
          id: user.id?.toString(),
          name: user.username,
        };
      },
      credentials: {
        username: {
          type: "text",
          label: "Username",
          placeholder: "user",
        },
        password: {
          type: "password",
          label: "Password",
          placeholder: "********",
        },
      },
    }),
  ],
}));

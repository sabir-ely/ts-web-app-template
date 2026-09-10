import { api } from "../lib/api";

type Credentials = {
  username: string;
  password: string;
};

/**
 * Creates a new account. After registering, sign in with `signIn()` from
 * `@hono/auth-js/react` (see `src/components/AuthForm.tsx`).
 */
export async function register({ username, password }: Credentials) {
  await api.post("register", { json: { username, password } }).json();
}

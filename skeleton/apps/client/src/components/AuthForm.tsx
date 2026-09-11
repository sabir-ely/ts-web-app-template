import { signIn } from "@hono/auth-js/react";
{{#if useMantine}}
import { Button, Paper, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
{{/if}}
import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router";

import { register } from "../services/auth.service";

type AuthFormMode = "sign-in" | "sign-up";

type AuthFormProps = {
  mode: AuthFormMode;
};

/**
 * Combined sign-in / sign-up form for the Credentials provider.
 * Replace with your own design; the auth logic is in the submit handler.
 */
export function AuthForm({ mode }: AuthFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      if (mode === "sign-up") {
        await register({ username, password });
      }

      // redirect: false keeps the SPA in place; the session cookie is set by
      // the API and SessionProvider picks it up via fetchSession.
      const res = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid username or password");
      }
    } catch {
      setError(mode === "sign-up" ? "Could not create account" : "Sign-in failed");
    } finally {
      setPending(false);
    }
  }

{{#if useMantine}}
  return (
    <Paper component="form" onSubmit={onSubmit} withBorder p="xl" w={320}>
      <Stack>
        <Title order={2}>{mode === "sign-in" ? "Sign in" : "Sign up"}</Title>
        <TextInput
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.currentTarget.value)}
          required
        />
        <PasswordInput
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
          required
          minLength={mode === "sign-up" ? 8 : undefined}
        />
        {error && <Text c="red">{error}</Text>}
        <Button type="submit" loading={pending}>
          {mode === "sign-in" ? "Sign in" : "Create account"}
        </Button>
        <Button variant="subtle" component={Link} to={mode === "sign-in" ? "/auth/sign-up" : "/auth/sign-in"}>
          {mode === "sign-in" ? "Need an account? Sign up" : "Have an account? Sign in"}
        </Button>
      </Stack>
    </Paper>
  );
{{else if useTailwind}}
  return (
    <form
      onSubmit={onSubmit}
      className="flex w-80 flex-col gap-4 rounded-xl border border-neutral-200 p-8 dark:border-neutral-800"
    >
      <h2 className="font-display text-xl font-semibold">
        {mode === "sign-in" ? "Sign in" : "Sign up"}
      </h2>
      <input
        className="rounded-md border border-neutral-300 bg-transparent px-3 py-2 dark:border-neutral-700"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        className="rounded-md border border-neutral-300 bg-transparent px-3 py-2 dark:border-neutral-700"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={mode === "sign-up" ? 8 : undefined}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-3 py-2 text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
      >
        {mode === "sign-in" ? "Sign in" : "Create account"}
      </button>
      <Link
        to={mode === "sign-in" ? "/auth/sign-up" : "/auth/sign-in"}
        className="text-sm text-neutral-500 underline"
      >
        {mode === "sign-in" ? "Need an account? Sign up" : "Have an account? Sign in"}
      </Link>
    </form>
  );
{{else}}
  return (
    <form onSubmit={onSubmit} style={formStyle}>
      <h2>{mode === "sign-in" ? "Sign in" : "Sign up"}</h2>
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={mode === "sign-up" ? 8 : undefined}
      />
      {error && <p style={errorStyle}>{error}</p>}
      <button type="submit" disabled={pending}>
        {mode === "sign-in" ? "Sign in" : "Create account"}
      </button>
      <Link to={mode === "sign-in" ? "/auth/sign-up" : "/auth/sign-in"}>
        {mode === "sign-in" ? "Need an account? Sign up" : "Have an account? Sign in"}
      </Link>
    </form>
  );
{{/if}}
}
{{#unless useTailwind}}
{{#unless useMantine}}

const formStyle = {
  display: "flex",
  width: "20rem",
  flexDirection: "column",
  gap: "1rem",
  border: "1px solid currentColor",
  borderRadius: "0.75rem",
  padding: "2rem",
} as const;

const errorStyle = { color: "red" } as const;
{{/unless}}
{{/unless}}

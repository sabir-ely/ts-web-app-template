{{#if useAuth}}
import { useSession } from "@hono/auth-js/react";
{{/if}}
{{#if useMantine}}
import { Center, Stack, Text, Title } from "@mantine/core";
{{/if}}
{{#if useAuth}}
import { AuthForm } from "./components/AuthForm";
import { UserMenu } from "./components/UserMenu";
{{/if}}

function App() {
{{#if useAuth}}
  const { status } = useSession();

  if (status === "loading") return null;

  if (status === "unauthenticated") {
{{#if useMantine}}
    return (
      <Center mih="100vh">
        <AuthForm />
      </Center>
    );
{{else if useTailwind}}
    return (
      <main className="flex min-h-screen items-center justify-center">
        <AuthForm />
      </main>
    );
{{else}}
    return (
      <main style={centerStyle}>
        <AuthForm />
      </main>
    );
{{/if}}
  }
{{/if}}
{{#if useMantine}}
  return (
    <Center mih="100vh">
{{#if useAuth}}
      <UserMenu />
{{/if}}
      <Stack align="center" gap="xs">
        <Title order={1}>{{name}}</Title>
        <Text c="dimmed">
          Edit <code>src/App.tsx</code> to get started.
        </Text>
      </Stack>
    </Center>
  );
{{else if useTailwind}}
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2">
{{#if useAuth}}
      <UserMenu />
{{/if}}
      <h1 className="font-display text-4xl font-semibold tracking-tight">
        {{name}}
      </h1>
      <p className="text-neutral-500">
        Edit <code className="font-mono">src/App.tsx</code> to get started.
      </p>
    </main>
  );
{{else}}
  return (
    <main style={centerStyle}>
{{#if useAuth}}
      <UserMenu />
{{/if}}
      <h1>{{name}}</h1>
      <p>
        Edit <code>src/App.tsx</code> to get started.
      </p>
    </main>
  );
{{/if}}
}
{{#unless useTailwind}}
{{#unless useMantine}}

const centerStyle = {
  display: "flex",
  minHeight: "100vh",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
} as const;
{{/unless}}
{{/unless}}

export default App;

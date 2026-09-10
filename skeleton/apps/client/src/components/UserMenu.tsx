import { signOut, useSession } from "@hono/auth-js/react";
{{#if useMantine}}
import { Button, Group, Text } from "@mantine/core";
{{/if}}

/** Shows the signed-in user and a sign-out button. */
export function UserMenu() {
  const { data: session } = useSession();

  if (!session?.user) return null;

{{#if useMantine}}
  return (
    <Group pos="fixed" top="1rem" right="1rem">
      <Text size="sm">{session.user.name}</Text>
      <Button variant="light" size="xs" onClick={() => signOut({ redirect: false })}>
        Sign out
      </Button>
    </Group>
  );
{{else if useTailwind}}
  return (
    <div className="fixed top-4 right-4 flex items-center gap-3">
      <span className="text-sm">{session.user.name}</span>
      <button
        type="button"
        onClick={() => signOut({ redirect: false })}
        className="rounded-md border border-neutral-300 px-3 py-1 text-sm dark:border-neutral-700"
      >
        Sign out
      </button>
    </div>
  );
{{else}}
  return (
    <div style={menuStyle}>
      <span>{session.user.name}</span>
      <button type="button" onClick={() => signOut({ redirect: false })}>
        Sign out
      </button>
    </div>
  );
{{/if}}
}
{{#unless useTailwind}}
{{#unless useMantine}}

const menuStyle = {
  position: "fixed",
  top: "1rem",
  right: "1rem",
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
} as const;
{{/unless}}
{{/unless}}

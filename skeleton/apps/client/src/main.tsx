import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
{{#if useAuth}}
import { SessionProvider } from "@hono/auth-js/react";
{{/if}}
{{#if useMantine}}
import { MantineProvider } from "@mantine/core";
{{/if}}
import { RouterProvider } from "react-router";
{{#if useFonts}}
import "@fontsource-variable/inter";
import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/jetbrains-mono";
{{/if}}
{{#if useMantine}}
import "@mantine/core/styles.css";
{{/if}}
import "./index.css";
{{#if useAuth}}
import "./lib/auth";
{{/if}}
import { router } from "./router";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
{{#if useMantine}}
    <MantineProvider>
{{#if useAuth}}
      <SessionProvider>
        <Suspense>
          <RouterProvider router={router} />
        </Suspense>
      </SessionProvider>
{{else}}
      <Suspense>
        <RouterProvider router={router} />
      </Suspense>
{{/if}}
    </MantineProvider>
{{else}}
{{#if useAuth}}
    <SessionProvider>
      <Suspense>
        <RouterProvider router={router} />
      </Suspense>
    </SessionProvider>
{{else}}
    <Suspense>
      <RouterProvider router={router} />
    </Suspense>
{{/if}}
{{/if}}
  </StrictMode>,
);

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
{{#if useMantine}}
import { MantineProvider } from "@mantine/core";
{{/if}}
{{#if useAuth}}
import { SessionProvider } from "@hono/auth-js/react";
{{/if}}
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
import App from "./App.tsx";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <BrowserRouter>
{{#if useMantine}}
      <MantineProvider>
{{#if useAuth}}
        <SessionProvider>
          <App />
        </SessionProvider>
{{else}}
        <App />
{{/if}}
      </MantineProvider>
{{else}}
{{#if useAuth}}
      <SessionProvider>
        <App />
      </SessionProvider>
{{else}}
      <App />
{{/if}}
{{/if}}
    </BrowserRouter>
  </StrictMode>,
);

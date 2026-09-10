import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
{{#if useTailwind}}
import tailwindcss from "@tailwindcss/vite";
{{/if}}
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  // Load environment variables (e.g. VITE_API_URL) from the repository
  // root's `.env` so the client and the API share one configuration.
  envDir: "../..",
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
{{#if useTailwind}}
    tailwindcss(),
{{/if}}
  ],
});

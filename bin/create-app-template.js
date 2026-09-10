#!/usr/bin/env node
import { Plop, run } from "plop";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

Plop.prepare(
  {
    cwd: __dirname,
    configPath: resolve(__dirname, "../plopfile.js"),
    completion: false,
  },
  (env) => Plop.execute(env, run),
);

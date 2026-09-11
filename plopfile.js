import {
  copyFile,
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { execFile } from "node:child_process";
import { constants } from "node:fs";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";

const plopfileDir = path.dirname(fileURLToPath(import.meta.url));
const skeletonDir = path.join(plopfileDir, "skeleton");

// Copied byte-for-byte instead of being run through Handlebars. Handlebars
// compiles its input as a string, which would corrupt binary assets.
const BINARY_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".avif",
  ".ico",
  ".pdf",
  ".woff",
  ".woff2",
  ".ttf",
  ".otf",
]);

// Files that exist only to provide authentication and the user accounts it
// depends on. They are omitted when the `useAuth` answer is false. Paths are
// relative to `skeleton/` and use POSIX separators. Everything else in the
// skeleton is included either way, and auth-specific content inside shared
// files is guarded with `{{#if useAuth}}` blocks.
const AUTH_ONLY_FILES = new Set([
  "apps/api/src/auth.ts",
  "apps/api/src/controllers/auth.controller.ts",
  "apps/api/src/controllers/users.controller.ts",
  "apps/api/src/services/users.service.ts",
  "apps/api/src/database/migrations/01_initial.ts",
  "apps/client/src/lib/auth.ts",
  "apps/client/src/services/auth.service.ts",
  "apps/client/src/components/AuthForm.tsx",
  "apps/client/src/components/UserMenu.tsx",
]);

const isAuthOnly = (source) =>
  AUTH_ONLY_FILES.has(
    path.relative(skeletonDir, source).split(path.sep).join("/"),
  );

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

const pathExists = (target) =>
  stat(target).then(
    () => true,
    () => false,
  );

/**
 * Generates a random Auth.js secret with `openssl rand -base64 32`. Returns
 * null when openssl is not installed, so the template can fall back to
 * leaving the placeholder in place.
 */
async function generateAuthSecret() {
  try {
    const { stdout } = await promisify(execFile)("openssl", [
      "rand",
      "-base64",
      "32",
    ]);
    return stdout.trim() || null;
  } catch {
    return null;
  }
}

/**
 * Copies `skeleton/` into `<destination>/<name>`, rendering `{{name}}` and
 * the feature toggles (`useAuth`, `useTailwind`, ...) in text files and
 * copying binary assets verbatim.
 *
 * This is a Plop "function" action: any function in the `actions` array is
 * invoked as `(answers, config, plop)`. Returning a string prints that string
 * and short-circuits the remaining actions.
 *
 * `config.force` is populated by Plop from the CLI `--force` / `-f` flag.
 */
async function scaffold(answers, config, plop) {
  // Convenience flags for templates: `{{#if sqlite}}` / `{{#if postgres}}`.
  // Defaults to sqlite for older non-interactive invocations that don't pass
  // a --database answer.
  answers.sqlite = answers.database !== "postgres";
  answers.postgres = answers.database === "postgres";

  const projectDir = path.resolve(answers.destination, answers.name);
  const existed = await pathExists(projectDir);

  if (existed && !config.force) {
    // Only offer to overwrite when there's a terminal to answer on; a
    // non-interactive run (CI, piped input) should fail closed instead of
    // throwing from the prompt.
    if (!process.stdin.isTTY) {
      return `Refusing to overwrite existing ${projectDir}. Re-run with --force.`;
    }

    const { overwrite } = await plop.inquirer.prompt([
      {
        type: "confirm",
        name: "overwrite",
        message: `${projectDir} already exists. Overwrite matching files?`,
        default: false,
      },
    ]);

    if (!overwrite) return `Aborted, nothing written to ${projectDir}`;
  }

  // Re-running over an existing project with auth disabled must not leave the
  // auth-only modules behind: they import dependencies that are no longer
  // declared, so they would fail `typecheck`/`lint`. Only the exact files this
  // generator owns for auth are removed; anything else is left untouched.
  if (existed && !answers.useAuth) {
    await Promise.all(
      [...AUTH_ONLY_FILES].map((rel) =>
        rm(path.join(projectDir, rel), { force: true }),
      ),
    );
  }

  // Without auth there are no users, so the auth-only files are left out
  // entirely rather than emitted with dangling references.
  const files = (await walk(skeletonDir)).filter(
    (source) => answers.useAuth || !isAuthOnly(source),
  );

  for (const source of files) {
    const target = path.join(projectDir, path.relative(skeletonDir, source));
    await mkdir(path.dirname(target), { recursive: true });

    if (BINARY_EXTENSIONS.has(path.extname(source).toLowerCase())) {
      await writeFile(target, await readFile(source));
    } else {
      const template = await readFile(source, "utf8");
      await writeFile(target, plop.renderString(template, answers));
    }
  }

  // Create the git-ignored `.env` files from their `.env.example` templates.
  // Existing files are left alone, so re-running the generator never
  // clobbers real secrets.
  const envFiles = [".env", "apps/api/.env"];
  await Promise.all(
    envFiles.map((rel) =>
      copyFile(
        path.join(projectDir, `${rel}.example`),
        path.join(projectDir, rel),
        constants.COPYFILE_EXCL,
      ).catch(() => {}),
    ),
  );

  // Fill in AUTH_SECRET with a generated value when openssl is available.
  // Skipped when the file already exists (COPYFILE_EXCL above means an
  // existing .env was kept, and its secret must not be rotated).
  let authSecretGenerated = false;
  if (answers.useAuth) {
    const secret = await generateAuthSecret();
    if (secret) {
      const envPath = path.join(projectDir, "apps/api/.env");
      const env = await readFile(envPath, "utf8");
      if (/^AUTH_SECRET=$/m.test(env)) {
        await writeFile(
          envPath,
          env.replace(/^AUTH_SECRET=$/m, `AUTH_SECRET=${secret}`),
        );
        authSecretGenerated = true;
      }
    }
  }

  // Initialise a git repository. Silently skipped when git is not installed.
  await promisify(execFile)("git", ["init", projectDir]).catch(() => {});

  return [
    `Created ${projectDir} (${files.length} files).`,
    "",
    "Next steps:",
    `  cd ${projectDir}`,
    ...(answers.useAuth && !authSecretGenerated
      ? ["  set AUTH_SECRET in apps/api/.env"]
      : []),
    "  pnpm install",
    `  pnpm --filter @${answers.name}/api db:migrate`,
    "  pnpm dev",
  ].join("\n");
}

export default function (plop) {
  plop.setGenerator("project", {
    description: "Scaffold a new TypeScript monorepo web app",
    prompts: [
      {
        type: "input",
        name: "name",
        message:
          "Project name (also used as the npm scope, e.g. `my-app` -> `@my-app/client`):",
        validate: (value) => {
          if (!value) return "A project name is required";
          if (!/^[a-z][a-z0-9-]*$/.test(value)) {
            return "Use lowercase letters, digits, and dashes (must start with a letter)";
          }
          return true;
        },
      },
      {
        type: "input",
        name: "destination",
        message: "Directory to create the project in:",
        default: process.cwd(),
        filter: (value) =>
          path.resolve(value.replace(/^~(?=$|\/|\\)/, process.env.HOME ?? "~")),
      },
      {
        // An input (not a list) so the answer can be provided
        // non-interactively with `--database=postgres`.
        type: "input",
        name: "database",
        message: "Database for the API (sqlite or postgres):",
        default: "sqlite",
        validate: (value) =>
          ["sqlite", "postgres"].includes(value)
            ? true
            : 'Must be "sqlite" or "postgres"',
      },
      {
        type: "confirm",
        name: "useAuth",
        message:
          "Include authentication (and the user accounts it depends on)?",
        default: true,
      },
      {
        type: "confirm",
        name: "useTailwind",
        message: "Use Tailwind CSS in the client?",
        default: true,
      },
      {
        type: "confirm",
        name: "useMantine",
        message: "Use Mantine components in the client?",
        default: false,
      },
      {
        type: "confirm",
        name: "useSWR",
        message: "Install SWR for data fetching in the client?",
        default: true,
      },
      {
        type: "confirm",
        name: "useTabler",
        message: "Install Tabler icons (@tabler/icons-react) in the client?",
        default: true,
      },
      {
        type: "confirm",
        name: "useFonts",
        message:
          "Pre-install fonts (Inter, Space Grotesk, JetBrains Mono via Fontsource)?",
        default: true,
      },
    ],
    actions: [scaffold],
  });
}

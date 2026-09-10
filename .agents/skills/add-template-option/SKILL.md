---
name: add-template-option
description: Add a new interactively selectable feature/option to the Plop template (e.g. a new library, tool, or integration in the generated project). Covers prompts, Handlebars guards, conditional files, deps, docs, and verification.
---

# Add a template option

Read `.agents/CONTEXT.md` first for how the generator works and its
Handlebars pitfalls.

## Steps

1. **Add the prompt** in `plopfile.js` (`prompts` array). Use `confirm` for
   booleans, named `useX`. For multi-choice options use `input` with a
   `validate` whitelist — NOT `list`, because Plop 4 cannot bypass `list`
   prompts non-interactively. Every prompt must be answerable via
   `-- --useX=false` style flags.

2. **Decide per-file strategy:**
   - Files that exist *only* when the option is on: add their POSIX-relative
     paths to the option's file set in `plopfile.js` (see `AUTH_ONLY_FILES`)
     and filter them in `scaffold()`. If the option can be turned off when
     re-generating over an existing project, also `rm` them there (follow the
     `useAuth` overwrite-guard pattern).
   - Files shared between on/off: wrap the conditional parts in
     `{{#if useX}}` / `{{else}}` / `{{/if}}` blocks. For three-way branches
     use `{{else if}}` (supported by Handlebars).

3. **Dependencies:** add/remove packages in the relevant skeleton
   `package.json` inside `{{#if useX}}` blocks. Keep JSON valid in every
   branch — watch trailing commas; put the comma on the preceding item or
   inline it in the block (`"dep": "^1.0.0"{{#if useX}},{{/if}}` patterns are
   fragile — prefer wrapping whole lines including their comma).

4. **Wire it up** the way the option's docs prescribe (config files, provider
   wrappers in `main.tsx`, CSS imports, etc.), each guarded. Client UI
   components need Mantine / Tailwind / plain-CSS branches — see
   `skeleton/apps/client/src/components/AuthForm.tsx` for the pattern.

5. **Docs:** update `README.md` (generator), `skeleton/README.md`, and the
   affected app's README, with `{{#if useX}}` guards where the text only
   applies when the option is on.

6. **Verify** by generating the affected flag matrix into `/tmp` (generation
   and inspection in ONE terminal command — `/tmp` is wiped between calls):

   ```bash
   mkdir -p /tmp/gen && node_modules/.bin/plop project t --force -- \
     --destination=/tmp/gen --database=sqlite --useAuth=true \
     --useTailwind=true --useMantine=false --useSWR=true --useTabler=true \
     --useFonts=true --useX=true
   ```

   Checks: no `{{` left in output (`grep -rnI '{{'`), all `package.json`
   parse, no dangling references to the feature in the off variant, and the
   on variant contains the expected wiring. Pass every prompt flag — omitting
   one crashes inquirer.

## Pitfalls

- Never write `{{` literal JSX/object syntax in skeleton files (e.g.
  `style={{ ... }}`) — extract to a `const`. It breaks Handlebars parsing.
- Standalone `{{#if}}` lines eat their own newline; put blank lines inside
  blocks to control spacing.
- New binary assets: check the extension is in `BINARY_EXTENSIONS` in
  `plopfile.js`, otherwise it will be corrupted by string rendering.

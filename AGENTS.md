# Do Nots

- do not edit packaged `.vsix` files, generated `out/` files, or generated theme JSON directly when a source change can produce them.
- do not add a secondary theme or another contributed theme entry unless the repository owner explicitly asks for it.
- do not leave TypeScript errors behind after changing `src/generate-theme.ts` or package metadata.
- do not overwrite user changes in this repository; inspect the worktree before making edits and work around unrelated changes.
- do not hard-code versioned `.vsix` filenames in package scripts or install workflows.
- do not introduce visible border colors; borders should be transparent unless the repository owner explicitly asks otherwise.

# Do's

- do start by reading `package.json`, `tsconfig.json`, `src/generate-theme.ts`, and `themes/jacks-theme-color-theme.json` to understand how the extension is generated and contributed.
- do use `npm run generate` when changing theme generation logic so `themes/jacks-theme-color-theme.json` stays in sync with the TypeScript source.
- do run `npx tsc --noEmit` or the repository typecheck path before handing off code changes.
- do commit at meaningful milestones of code, such as after a coherent source change, after generated output has been refreshed, and after verification passes.
- do add user instructions to this file when the user says to remember something.
- do keep palette property names to single words only.

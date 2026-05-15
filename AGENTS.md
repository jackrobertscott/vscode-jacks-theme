# Do Nots

- do not edit packaged `.vsix` files, generated `out/` files, or generated theme JSON directly when a source change can produce them.
- do not add a secondary theme or another contributed theme entry unless the repository owner explicitly asks for it.
- do not leave TypeScript errors behind after changing `src/generate-theme.ts` or package metadata.
- do not overwrite user changes in this repository; inspect the worktree before making edits and work around unrelated changes.
- do not hard-code versioned `.vsix` filenames in package scripts or install workflows.
- do not introduce visible border colors; borders should be transparent unless the repository owner explicitly asks otherwise.
- do not hand edit `package-lock.json`; regenerate it with npm commands such as `npm install`, `npm version --no-git-tag-version`, or another appropriate package-manager command.
- do not add changelog entries that only mention package version bumps.

# Do's

- do start by reading `package.json`, `tsconfig.json`, `src/generate-theme.ts`, and `themes/jacks-theme-color-theme.json` to understand how the extension is generated and contributed.
- do use `npm run generate` when changing theme generation logic so `themes/jacks-theme-color-theme.json` stays in sync with the TypeScript source.
- do validate generated theme warnings with the actual `vscode://schemas/color-theme` behavior, preferably using `vscode-json-languageservice` plus the installed VS Code color registry from `/Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/workbench/workbench.desktop.main.js`; do not rely only on the public theme color reference or a color ID list. Include transparent-color pattern checks for colors registered by VS Code with the transparent-color schema constraint.
- do run `npx tsc --noEmit` or the repository typecheck path before handing off code changes.
- do commit at meaningful milestones of code, such as after a coherent source change, after generated output has been refreshed, and after verification passes.
- do add user instructions to this file when the user says to remember something.
- do bump `package.json` and `package-lock.json` versions for every new extension change or publish prep, and update `CHANGELOG.md` under that same version every time the version changes.
- do keep palette property names to single words only.
- do install the theme into the user's local VS Code after making or preparing changes to the extension.
- do install the newly published theme locally after publishing whenever the user's local VS Code has the theme installed from a local VSIX rather than the Marketplace.

# Jack's Theme

[![Version](https://img.shields.io/badge/version-0.4.5-d8b84d?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=jackrobertscott.jacks-theme)
[![VS Code](https://img.shields.io/badge/VS%20Code-%5E1.90.0-67b9ff?style=flat-square)](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#visual-studio-code-compatibility)
[![License](https://img.shields.io/badge/license-MIT-76c26e?style=flat-square)](https://opensource.org/license/mit)

A quiet dark theme for Visual Studio Code with consistent editor surfaces, warm blackboard-inspired highlighting, and no decorative borders.

Jack's Theme is generated from a TypeScript source palette. The generated theme sets colors only; it does not set token font styles.

## Features

- Dark editor and workbench surfaces tuned to stay visually quiet.
- Warm syntax colors for structure, strings, comments, and language symbols.
- Transparent borders and overlays to keep panels, tabs, and editor chrome unobtrusive.
- Semantic highlighting enabled for language-aware token colors.

## Installation

Install the extension from the Visual Studio Code Marketplace when published, or package and install it locally:

```sh
npm install
npm run generate
npm run package
code --install-extension "$(find . -maxdepth 1 -name '*.vsix' -print | sort | tail -n 1)" --force
```

## Development

Edit `src/generate-theme.ts`, then run:

```sh
npm run generate
npx tsc --noEmit
```

Do not edit `themes/jacks-theme-color-theme.json` directly. It is generated from `src/generate-theme.ts`.

When changing the extension, bump `package.json` and `package-lock.json`, add a matching `CHANGELOG.md` entry under the same version number, then package and install the newest VSIX locally.

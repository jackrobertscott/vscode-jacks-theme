# Jack's Theme

[![Version](https://img.shields.io/badge/version-0.5.29-d8b84d?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=jackrobertscott.jacks-theme)
[![VS Code](https://img.shields.io/badge/VS%20Code-%5E1.90.0-67b9ff?style=flat-square)](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#visual-studio-code-compatibility)
[![License](https://img.shields.io/badge/license-MIT-76c26e?style=flat-square)](https://opensource.org/license/mit)

A quiet theme collection for Visual Studio Code with carbon, graphite, silver, and draft-inspired editor options.

Jack's Theme is generated from a TypeScript source palette. The generated theme sets colors only; it does not set token font styles.

Source code is available at <https://github.com/jackrobertscott/vscode-jacks-theme>.

## Features

- Jack's Carbon Theme uses near-black editor and workbench surfaces with subtle graphite dividers.
- Warm syntax colors for structure, strings, comments, and language symbols.
- Jack's Graphite Theme uses medium graphite surfaces, soft raised chrome, cool slate selections, and bright pastel syntax so it stays dark without feeling black.
- Jack's Silver Theme carries the graphite variant into light mode with mid-level silver-grey surfaces, visible neutral borders, dark syntax accents, and cool slate selections.
- Jack's Draft Theme uses warm paper surfaces, explicit wireframe borders, graphite text, blueprint focus lines, sticky-note highlights, redline diagnostics, and pencil-like guide colors to feel intentionally early-stage without harsh white glare.
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

Do not edit generated files in `themes/` directly. They are generated from `src/generate-theme.ts`.

When changing the extension, bump `package.json` and `package-lock.json`, add a matching `CHANGELOG.md` entry under the same version number, then package and install the newest VSIX locally.

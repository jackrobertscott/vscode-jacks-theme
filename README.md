# Jack's Theme

[![Version](https://img.shields.io/badge/version-0.6.5-d8b84d?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=jackrobertscott.jacks-theme)
[![VS Code](https://img.shields.io/badge/VS%20Code-%5E1.90.0-67b9ff?style=flat-square)](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#visual-studio-code-compatibility)
[![License](https://img.shields.io/badge/license-MIT-76c26e?style=flat-square)](https://opensource.org/license/mit)

A quiet theme collection for Visual Studio Code with carbon, graphite, silver, and draft-inspired editor options.

Jack's Theme is generated from a TypeScript source palette. The generated theme sets colors only; it does not set token font styles.

Source code is available at <https://github.com/jackrobertscott/vscode-jacks-theme>.

## Features

- Jack's Carbon Theme uses near-black editor and workbench surfaces with subtle graphite dividers.
- Warm syntax colors for structure, strings, comments, and language symbols.
- Jack's Graphite Theme uses medium graphite surfaces, softer neutral borders, cool slate selections, and bright pastel syntax so it stays dark without feeling black.
- Jack's Silver Theme carries the graphite variant into light mode with mid-level silver-grey surfaces, visible neutral borders, dark syntax accents, and cool slate selections.
- Jack's Draft Theme uses warm paper surfaces, explicit wireframe borders, graphite text, blueprint focus lines, sticky-note highlights, redline diagnostics, and pencil-like guide colors to feel intentionally early-stage without harsh white glare.
- Semantic highlighting enabled for language-aware token colors.

## Installation

Install the extension from the Visual Studio Code Marketplace when published, or package and install it locally with the finish workflow:

```sh
npm install
npm run finish
```

## Development

Edit the TypeScript sources, then run the finish workflow:

```sh
npm run finish
```

Do not edit generated files in `themes/` directly. They are generated from the TypeScript sources.

`npm run finish` is the repeatable end-of-change workflow: it regenerates themes, typechecks, validates generated theme JSON against the installed VS Code color registry, verifies version metadata, packages a temporary VSIX, and installs it locally. Run `npm run validate:themes` directly only when iterating on generated color IDs or schema checks.

When changing the extension, bump `package.json` and `package-lock.json`, add a matching `CHANGELOG.md` entry under the same version number, then run `npm run finish` to regenerate, typecheck, validate, package, and install the newest VSIX locally. For Marketplace releases, publish with `npm run publish:marketplace -- --pat "$VSCE_PAT"` after the release commit is clean.

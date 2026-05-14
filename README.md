# Jack's Theme

A very dark VS Code theme generated from a TypeScript source palette. Colors are authored in OKLCH, then converted to the hex format that VS Code theme JSON requires.

The palette is built around a zero-chroma near-black graphite surface, with a teal primary axis and a warm gold/coral counterpoint. TypeScript token colors emphasize structural reading: declarations and types are distinct from calls, keywords, strings, constants, JSX, and punctuation without pushing the editor into high-contrast neon.

## Development

```sh
npm install
npm run generate
vsce package --allow-missing-repository
code --install-extension jacks-theme-0.1.2.vsix --force
```

Do not edit `themes/jacks-theme-color-theme.json` directly. Edit `src/generate-theme.ts` and regenerate.

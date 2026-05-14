# Jack's Theme

A quiet VS Code theme generated from a TypeScript source palette.

Jack's Theme is built around a quiet editor surface, green-black panels, chalky text, sage strings/comments, and warm gold/amber/orange structure.

The generated themes only set color values. They do not set token font styles.

## Development

```sh
npm install
npm run generate
vsce package --allow-missing-repository
code --install-extension jacks-theme-0.4.2.vsix --force
```

Do not edit `themes/jacks-theme-color-theme.json` directly. Edit `src/generate-theme.ts` and regenerate.

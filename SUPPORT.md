# Support

Jack's Theme is a color theme extension. For visual issues, include:

- The VS Code version.
- The Jack's Theme version.
- The language or file type where the issue appears.
- A screenshot or a short description of the affected UI area or token.

For local verification, regenerate and reinstall the extension:

```sh
npm run generate
npx tsc --noEmit
npm run package
code --install-extension "$(find . -maxdepth 1 -name '*.vsix' -print | sort | tail -n 1)" --force
```

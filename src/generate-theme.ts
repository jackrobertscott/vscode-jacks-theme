import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createSemanticTokenColors, createTokenColors } from "./tokens.js";
import { mergeFeatureGroups } from "./theme.js";
import { createWorkbenchFeatureGroups } from "./workbench.js";
import type { Theme, ThemeDefinition, ThemeModule } from "./theme.js";
import { assertThemeIntegrity } from "./validation.js";

const createTheme = (definition: ThemeDefinition): Theme => ({
  $schema: "vscode://schemas/color-theme",
  name: definition.name,
  type: definition.type,
  semanticHighlighting: true,
  colors: mergeFeatureGroups(createWorkbenchFeatureGroups(definition.workbench)),
  tokenColors: createTokenColors(definition.fontPalette),
  semanticTokenColors: createSemanticTokenColors(definition.fontPalette),
});

const sourceFileNamePattern = /^[a-z]+(?:-[a-z]+)*\.[a-z]+$/;

const assertSourceFileNameIntegrity = (directory: string) => {
  const invalidFileNames: string[] = [];

  const scan = (currentDirectory: string) => {
    for (const entry of readdirSync(currentDirectory, { withFileTypes: true })) {
      const entryPath = join(currentDirectory, entry.name);

      if (entry.isDirectory()) {
        scan(entryPath);
        continue;
      }

      if (!entry.isFile()) continue;

      if (!sourceFileNamePattern.test(entry.name)) {
        invalidFileNames.push(relative(directory, entryPath));
      }
    }
  };

  scan(directory);

  if (invalidFileNames.length) {
    throw new Error(
      `Source file names must be lowercase hyphen-separated and contain only one period before the extension: ${invalidFileNames.join(", ")}`,
    );
  }
};

const loadThemeDefinitions = async (directory: string) => {
  const themeModules = readdirSync(directory)
    .filter((fileName) => fileName.endsWith("-color-theme.js"))
    .sort();

  const definitions = await Promise.all(
    themeModules.map(async (fileName): Promise<ThemeDefinition | undefined> => {
      const modulePath = pathToFileURL(join(directory, fileName)).href;
      const module = (await import(modulePath)) as Partial<ThemeModule>;
      if (!module.theme) {
        if (fileName === "jacks-color-theme.js") {
          return undefined;
        }
        throw new Error(`${fileName} must export a theme definition`);
      }
      return module.theme;
    }),
  );

  return definitions
    .filter((definition): definition is ThemeDefinition => Boolean(definition))
    .sort((left, right) => left.order - right.order);
};

const __dirname = dirname(fileURLToPath(import.meta.url));
assertSourceFileNameIntegrity(join(__dirname, "..", "src"));
const themes = await loadThemeDefinitions(__dirname);

for (const definition of themes) {
  const theme = createTheme(definition);
  assertThemeIntegrity(
    theme,
    definition.palette,
    definition.fontPalette,
    definition.integrity,
  );
  const outputPath = join(__dirname, "..", "themes", definition.fileName);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, JSON.stringify(theme, null, 2) + "\n");
  console.log(
    `Generated ${outputPath} with ${Object.keys(theme.colors).length} workbench colors`,
  );
}

import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createSemanticTokenColors, createTokenColors } from "./tokens.js";
import { mergeFeatureGroups } from "./theme.js";
import type { Theme, ThemeDefinition, ThemeModule } from "./theme.js";
import { assertThemeIntegrity } from "./validation.js";

const createTheme = (definition: ThemeDefinition): Theme => ({
  $schema: "vscode://schemas/color-theme",
  name: definition.name,
  type: definition.type,
  semanticHighlighting: true,
  colors: mergeFeatureGroups(definition.workbench),
  tokenColors: createTokenColors(definition.fontPalette),
  semanticTokenColors: createSemanticTokenColors(definition.fontPalette),
});

const loadThemeDefinitions = async (directory: string) => {
  const themeModules = readdirSync(directory)
    .filter((fileName) => fileName.endsWith(".theme.js"))
    .sort();

  const definitions = await Promise.all(
    themeModules.map(async (fileName): Promise<ThemeDefinition> => {
      const modulePath = pathToFileURL(join(directory, fileName)).href;
      const module = (await import(modulePath)) as Partial<ThemeModule>;
      if (!module.theme) {
        throw new Error(`${fileName} must export a theme definition`);
      }
      return module.theme;
    }),
  );

  return definitions.sort((left, right) => left.order - right.order);
};

const __dirname = dirname(fileURLToPath(import.meta.url));
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

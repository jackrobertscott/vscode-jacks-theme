#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDirectory, "..");
const vscodeAppRoot =
  process.env.VSCODE_APP_ROOT ??
  "/Applications/Visual Studio Code.app/Contents/Resources/app";
const workbenchPath =
  process.env.VSCODE_WORKBENCH_MAIN ??
  join(vscodeAppRoot, "out/vs/workbench/workbench.desktop.main.js");

const failures = [];
const fail = (message) => failures.push(message);

const readJson = (filePath) => JSON.parse(readFileSync(filePath, "utf8"));

const findCallEnd = (source, openParenIndex) => {
  let depth = 0;
  let quote = null;
  let escaped = false;

  for (let index = openParenIndex; index < source.length; index += 1) {
    const char = source[index];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }

    if (char === "(" || char === "[" || char === "{") {
      depth += 1;
    } else if (char === ")" || char === "]" || char === "}") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }

  return -1;
};

const splitTopLevelArguments = (source) => {
  const parts = [];
  let start = 0;
  let depth = 0;
  let quote = null;
  let escaped = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }

    if (char === "(" || char === "[" || char === "{") {
      depth += 1;
    } else if (char === ")" || char === "]" || char === "}") {
      depth -= 1;
    } else if (char === "," && depth === 0) {
      parts.push(source.slice(start, index).trim());
      start = index + 1;
    }
  }

  parts.push(source.slice(start).trim());
  return parts;
};

const registerColor = (registry, id, options = {}) => {
  registry.set(id, {
    needsTransparency: options.needsTransparency ?? false,
    source: options.source ?? "unknown",
  });
};

const findRegisterColorHelperNames = (workbenchSource) => {
  const helpers = new Set();
  const helperPattern =
    /function\s+([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{\s*return\s+[A-Za-z_$][\w$]*\.registerColor\(/g;

  for (const match of workbenchSource.matchAll(helperPattern)) {
    helpers.add(match[1]);
  }

  return helpers;
};

const addWorkbenchRegistryColors = (registry, workbenchSource) => {
  for (const helperName of findRegisterColorHelperNames(workbenchSource)) {
    const callPrefix = `${helperName}(`;

    for (
      let index = 0;
      (index = workbenchSource.indexOf(callPrefix, index)) !== -1;
      index += callPrefix.length
    ) {
      const previous = workbenchSource[index - 1];
      if (previous && /[\w$]/.test(previous)) continue;

      const openParenIndex = index + helperName.length;
      const end = findCallEnd(workbenchSource, openParenIndex);
      if (end < 0) continue;

      const args = splitTopLevelArguments(
        workbenchSource.slice(openParenIndex + 1, end),
      );
      if (!args[0]?.startsWith('"')) continue;

      let id;
      try {
        id = JSON.parse(args[0]);
      } catch {
        continue;
      }

      if (!/^[\w.-]+$/.test(id)) continue;

      registerColor(registry, id, {
        needsTransparency: args[3] === "!0" || args[3] === "true",
        source: "VS Code workbench registry",
      });
    }
  }
};

const addTerminalAnsiColors = (registry, workbenchSource) => {
  for (const match of workbenchSource.matchAll(
    /"(terminal\.ansi(?:Bright)?(?:Black|Red|Green|Yellow|Blue|Magenta|Cyan|White))"(?=[:,])/g,
  )) {
    registerColor(registry, match[1], {
      source: "VS Code terminal ANSI registry",
    });
  }
};

const addExtensionContributedColors = (registry, extensionsRoot) => {
  if (!existsSync(extensionsRoot)) return;

  for (const entry of readdirSync(extensionsRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;

    const packagePath = join(extensionsRoot, entry.name, "package.json");
    if (!existsSync(packagePath)) continue;

    let packageJson;
    try {
      packageJson = readJson(packagePath);
    } catch {
      continue;
    }

    for (const color of packageJson.contributes?.colors ?? []) {
      if (typeof color?.id === "string") {
        registerColor(registry, color.id, {
          source: `VS Code extension ${entry.name}`,
        });
      }
    }
  }
};

const createVsCodeColorRegistry = () => {
  const registry = new Map();

  if (!existsSync(workbenchPath)) {
    fail(
      `VS Code workbench registry not found at ${workbenchPath}. Set VSCODE_WORKBENCH_MAIN or VSCODE_APP_ROOT if VS Code is installed elsewhere.`,
    );
    return registry;
  }

  const workbenchSource = readFileSync(workbenchPath, "utf8");
  addWorkbenchRegistryColors(registry, workbenchSource);
  addTerminalAnsiColors(registry, workbenchSource);
  addExtensionContributedColors(registry, join(vscodeAppRoot, "extensions"));

  return registry;
};

const validateTheme = (registry, themePath) => {
  const relativeThemePath = themePath.slice(repoRoot.length + 1);
  let theme;
  try {
    theme = readJson(themePath);
  } catch (error) {
    fail(`${relativeThemePath}: could not parse JSON (${error.message})`);
    return { colorCount: 0, unknownCount: 0, transparentConstraintCount: 0 };
  }

  if (theme.$schema !== "vscode://schemas/color-theme") {
    fail(`${relativeThemePath}: $schema must be vscode://schemas/color-theme`);
  }

  if (!theme.colors || typeof theme.colors !== "object") {
    fail(`${relativeThemePath}: colors must be an object`);
    return { colorCount: 0, unknownCount: 0, transparentConstraintCount: 0 };
  }

  const colorEntries = Object.entries(theme.colors);
  const unknown = [];
  const invalidHex = [];
  const transparentConstraint = [];

  const hexPattern = /^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/;
  const transparentPattern =
    /^#(?:(?<rgba>[0-9a-fA-f]{3}[0-9a-eA-E])|(?:[0-9a-fA-F]{6}(?:(?![fF]{2})(?:[0-9a-fA-F]{2}))))?$/;

  for (const [id, value] of colorEntries) {
    const registryEntry = registry.get(id);
    if (!registryEntry) {
      unknown.push(id);
      continue;
    }

    if (typeof value !== "string" || !hexPattern.test(value)) {
      invalidHex.push(`${id}=${value}`);
      continue;
    }

    if (registryEntry.needsTransparency && !transparentPattern.test(value)) {
      transparentConstraint.push(`${id}=${value}`);
    }
  }

  if (unknown.length) {
    fail(`${relativeThemePath}: unknown color ids: ${unknown.join(", ")}`);
  }
  if (invalidHex.length) {
    fail(`${relativeThemePath}: invalid hex colors: ${invalidHex.join(", ")}`);
  }
  if (transparentConstraint.length) {
    fail(
      `${relativeThemePath}: colors registered by VS Code with the transparent-color schema constraint must not be opaque: ${transparentConstraint.join(", ")}`,
    );
  }

  return {
    colorCount: colorEntries.length,
    unknownCount: unknown.length,
    transparentConstraintCount: transparentConstraint.length,
  };
};

const registry = createVsCodeColorRegistry();
const transparentColorCount = [...registry.values()].filter(
  (entry) => entry.needsTransparency,
).length;
console.log(
  `Loaded ${registry.size} VS Code color ids from ${workbenchPath} (${transparentColorCount} require transparent colors).`,
);

const themesDirectory = join(repoRoot, "themes");
const themeFiles = existsSync(themesDirectory)
  ? readdirSync(themesDirectory)
      .filter((fileName) => fileName.endsWith(".json"))
      .sort()
  : [];

if (!themeFiles.length) {
  fail("No generated theme JSON files found in themes/.");
}

for (const themeFile of themeFiles) {
  const result = validateTheme(registry, join(themesDirectory, themeFile));
  console.log(
    `${themeFile}: ${result.colorCount} colors, ${result.unknownCount} unknown ids, ${result.transparentConstraintCount} transparent-color constraint violations.`,
  );
}

if (failures.length) {
  for (const failure of failures) {
    console.error(`error: ${failure}`);
  }
  process.exit(1);
}

console.log("Generated theme JSON matches the installed VS Code color registry constraints.");

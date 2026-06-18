import type { WorkbenchStyles } from "./workbench-styles.js";

export type Hex = `#${string}`;
export type Oklch = `oklch(${number}% ${number} ${number})`;
export type SourceColor = Hex | Oklch;

export type BackgroundColorName =
  | "black"
  | "editor"
  | "panel"
  | "popup"
  | "hover"
  | "active"
  | "guide"
  | "accent"
  | "success"
  | "danger"
  | "info"
  | "ember"
  | "sand"
  | "moss"
  | "sky"
  | "mark"
  | "plum"
  | "clay";

export type FontColorName =
  | "text"
  | "muted"
  | "faint"
  | "ember"
  | "sand"
  | "moss"
  | "sky"
  | "plum"
  | "clay";

export type BorderColorName = "divider";

export type SourceBackgroundPalette = Record<BackgroundColorName, SourceColor>;
export type SourceFontPalette = Record<FontColorName, SourceColor>;
export type SourceBorderPalette = Record<BorderColorName, SourceColor>;

export type BackgroundPalette = Record<BackgroundColorName, Hex> & {
  shadow: Hex;
  minimap: Hex;
  transparent: Hex;
};
export type FontPalette = Record<FontColorName, Hex>;
export type BorderPalette = Record<BorderColorName, Hex>;
export type Palette = {
  background: BackgroundPalette;
  font: FontPalette;
  border: BorderPalette;
};

export type TokenRule = {
  name: string;
  scope: string | string[];
  settings: {
    foreground?: Hex;
    background?: Hex;
  };
};

export type Theme = {
  $schema: string;
  name: string;
  type: "dark" | "light";
  semanticHighlighting: true;
  colors: Record<string, Hex>;
  tokenColors: TokenRule[];
  semanticTokenColors: Record<string, Hex>;
};

export type FeatureGroup = {
  feature: string;
  colors: Theme["colors"];
};

export type ColorPair = readonly [foregroundId: string, backgroundId: string];
export type ColorReference = readonly [id: string, color: Hex];

export type BorderIntegrity =
  | {
      kind: "transparent";
    }
  | {
      kind: "uniform";
      visibleIds: readonly string[];
      color: Hex;
      lighterThan: readonly ColorReference[];
      darkerThan: readonly ColorReference[];
    }
  | {
      kind: "mapped";
      visibleIds: readonly string[];
      requiredVisibleIds?: readonly string[];
    };

export type ThemeIntegrity = {
  borderPolicy: BorderIntegrity;
  workbenchTextPairs?: readonly ColorPair[];
};

export type ThemeDefinition = {
  order: number;
  fileName: string;
  name: string;
  type: Theme["type"];
  palette: Palette;
  fontPalette: FontPalette;
  workbench: WorkbenchStyles;
  integrity: ThemeIntegrity;
};

export type ThemeModule = {
  theme: ThemeDefinition;
};

export const featureGroup = (
  feature: string,
  colors: Theme["colors"],
): FeatureGroup => ({ feature, colors });

export const mergeFeatureGroups = (
  groups: readonly FeatureGroup[],
): Theme["colors"] => Object.assign({}, ...groups.map((group) => group.colors));

export const defineTheme = (definition: ThemeDefinition): ThemeDefinition =>
  definition;

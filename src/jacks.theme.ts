import {
  assertSingleWordPaletteProperties,
  createColorMap,
  createPalette,
} from "./colors.js";
import { defineTheme } from "./theme.js";
import type {
  SourceBackgroundPalette,
  SourceBorderPalette,
  SourceFontPalette,
} from "./theme.js";
import { createWorkbenchFeatureGroups } from "./workbench.js";

export const JACK_BACKGROUND_PALETTE = {
  black: "oklch(0% 0 0)",
  editor: "oklch(17.20% 0 0)",
  panel: "oklch(20.10% 0 0)",
  popup: "oklch(22.10% 0 0)",
  hover: "oklch(25.80% 0 0)",
  active: "oklch(29.40% 0 0)",
  guide: "oklch(35.40% 0 0)",
  accent: "oklch(38.00% 0.0760 78.00)",
  success: "oklch(41.00% 0.0850 148.00)",
  danger: "oklch(39.00% 0.0920 28.00)",
  info: "oklch(37.00% 0.0720 230.00)",
  ember: "oklch(39.00% 0.0960 34.00)",
  sand: "oklch(40.00% 0.0880 96.00)",
  moss: "oklch(38.00% 0.0880 136.00)",
  sky: "oklch(39.00% 0.0820 250.00)",
  mark: "oklch(44.00% 0.0480 318.00)",
  plum: "oklch(38.00% 0.0940 310.00)",
  clay: "oklch(38.50% 0.0960 352.00)",
} as const satisfies SourceBackgroundPalette;

export const JACK_FONT_PALETTE = {
  text: "oklch(88.00% 0 0)",
  muted: "oklch(69.00% 0 0)",
  faint: "oklch(59.00% 0 0)",
  ember: "oklch(76.50% 0.1500 34.00)",
  sand: "oklch(79.00% 0.1300 92.00)",
  moss: "oklch(74.50% 0.1400 142.00)",
  sky: "oklch(76.50% 0.1350 248.00)",
  plum: "oklch(78.00% 0.1250 318.00)",
  clay: "oklch(70.00% 0.1400 350.00)",
} as const satisfies SourceFontPalette;

export const JACK_BORDER_PALETTE = {
  divider: "oklch(24.00% 0 0)",
} as const satisfies SourceBorderPalette;

assertSingleWordPaletteProperties("background", JACK_BACKGROUND_PALETTE);
assertSingleWordPaletteProperties("font", JACK_FONT_PALETTE);
assertSingleWordPaletteProperties("border", JACK_BORDER_PALETTE);

export const JACK_PALETTE = createPalette(
  JACK_BACKGROUND_PALETTE,
  JACK_FONT_PALETTE,
  JACK_BORDER_PALETTE,
);
export const JACK_FONT_COLORS = createColorMap(JACK_FONT_PALETTE);

export const theme = defineTheme({
  order: 10,
  fileName: "jacks-theme-color-theme.json",
  name: "Jack's Theme",
  type: "dark",
  palette: JACK_PALETTE,
  fontPalette: JACK_FONT_COLORS,
  workbench: createWorkbenchFeatureGroups(JACK_PALETTE),
  integrity: {
    borderPolicy: { kind: "transparent" },
  },
});

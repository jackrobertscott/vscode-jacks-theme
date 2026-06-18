import {
  assertSingleWordPaletteProperties,
  createColorMap,
  createPalette,
} from "./colors.js";
import { createJackWorkbenchStyles } from "./jacks-color-theme.js";
import { defineTheme } from "./theme.js";
import type {
  Palette,
  SourceBackgroundPalette,
  SourceBorderPalette,
  SourceFontPalette,
} from "./theme.js";
import { defineWorkbenchStyles } from "./workbench-styles.js";
import type { WorkbenchStyles } from "./workbench-styles.js";
import { workbenchTextPairs } from "./workbench.js";

const GREY_BACKGROUND_PALETTE = {
  black: "#222222",
  editor: "#505050",
  panel: "#494949",
  popup: "#5a5a5a",
  hover: "#646464",
  active: "#707070",
  guide: "#858585",
  accent: "#6f613d",
  success: "#536b50",
  danger: "#765463",
  info: "#4e6579",
  ember: "#775747",
  sand: "#6f653d",
  moss: "#536b50",
  sky: "#4e6579",
  mark: "#99829d",
  plum: "#685a77",
  clay: "#765463",
} as const satisfies SourceBackgroundPalette;

const GREY_FONT_PALETTE = {
  text: "#f5f7fb",
  muted: "oklch(94.00% 0.0150 260.00)",
  faint: "oklch(82.00% 0.0150 240.00)",
  ember: "oklch(91.00% 0.1400 50.00)",
  sand: "oklch(89.00% 0.1800 110.00)",
  moss: "oklch(88.00% 0.1000 145.00)",
  sky: "oklch(89.00% 0.1400 240.00)",
  plum: "oklch(89.00% 0.1200 305.00)",
  clay: "oklch(91.00% 0.1800 15.00)",
} as const satisfies SourceFontPalette;

const GREY_BORDER_PALETTE = {
  divider: "#5d5d5d",
} as const satisfies SourceBorderPalette;

assertSingleWordPaletteProperties("background", GREY_BACKGROUND_PALETTE);
assertSingleWordPaletteProperties("font", GREY_FONT_PALETTE);
assertSingleWordPaletteProperties("border", GREY_BORDER_PALETTE);

const GREY_PALETTE = createPalette(
  GREY_BACKGROUND_PALETTE,
  GREY_FONT_PALETTE,
  GREY_BORDER_PALETTE,
);
const GREY_FONT_COLORS = createColorMap(GREY_FONT_PALETTE);

const createGreyWorkbenchStyles = (palette: Palette): WorkbenchStyles => {
  const styles = createJackWorkbenchStyles(palette);
  const B = palette.background;
  const F = palette.font;

  return defineWorkbenchStyles({
    ...styles,
    surfaces: {
      ...styles.surfaces,
      activity: B.panel,
      sidebar: B.panel,
      sidebarSection: B.popup,
      tabInactive: B.panel,
      panelArea: B.panel,
      statusBar: B.panel,
      titleBar: B.panel,
      titleBarInactive: B.editor,
      commandCenter: B.panel,
      commandCenterActive: B.active,
      notificationHeader: B.panel,
      quickInputTitle: B.panel,
      settingsInput: B.editor,
      menuSelection: B.hover,
      welcomeTile: B.popup,
    },
    controls: {
      ...styles.controls,
      secondaryButton: {
        background: B.hover,
        foreground: F.text,
        hoverBackground: B.active,
      },
      checkbox: {
        background: B.editor,
        foreground: F.sky,
      },
      input: {
        background: B.editor,
        foreground: F.text,
        placeholderForeground: F.faint,
      },
      inputOption: {
        background: B.hover,
        foreground: F.text,
        hoverBackground: B.active,
      },
      badge: { background: B.info, foreground: F.text },
    },
    lists: {
      ...styles.lists,
      activeSelection: { background: B.sky, foreground: F.text },
      focus: { background: B.sky, foreground: F.text },
      inactiveSelection: { background: B.hover, foreground: F.text },
      inactiveFocusBackground: B.hover,
      hoverBackground: B.hover,
      dropBackground: B.info,
    },
    editor: {
      ...styles.editor,
      cursorBackground: B.editor,
      cursorForeground: F.sky,
      selection: { background: B.sky, foreground: F.text },
      bracketMatchBackground: B.hover,
      inlineValues: { background: B.panel, foreground: F.muted },
    },
  });
};

const GREY_WORKBENCH_STYLES = createGreyWorkbenchStyles(GREY_PALETTE);

export const theme = defineTheme({
  order: 10,
  fileName: "jacks-grey-theme-color-theme.json",
  name: "Jack's grey theme",
  type: "dark",
  palette: GREY_PALETTE,
  fontPalette: GREY_FONT_COLORS,
  workbench: GREY_WORKBENCH_STYLES,
  integrity: {
    borderPolicy: { kind: "transparent" },
    workbenchTextPairs,
  },
});

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

const LIGHT_GREY_BACKGROUND_PALETTE = {
  black: "#1f2328",
  editor: "#d7d7d7",
  panel: "#cdcdcd",
  popup: "#e0e0e0",
  hover: "#bdbdbd",
  active: "#aeaeae",
  guide: "#7c7c7c",
  accent: "#bda75d",
  success: "#9fc191",
  danger: "#d39aac",
  info: "#93b8d4",
  ember: "#d6a07d",
  sand: "#c7b46b",
  moss: "#9fc191",
  sky: "#93b8d4",
  mark: "#9a75a8",
  plum: "#b493c3",
  clay: "#d39aac",
} as const satisfies SourceBackgroundPalette;

const LIGHT_GREY_FONT_PALETTE = {
  text: "#242424",
  muted: "#343434",
  faint: "#555555",
  ember: "#8a3b1e",
  sand: "#5c5600",
  moss: "#006b3f",
  sky: "#005a9e",
  plum: "#733b9e",
  clay: "#a5305b",
} as const satisfies SourceFontPalette;

const LIGHT_GREY_BORDER_PALETTE = {
  divider: "#9a9a9a",
} as const satisfies SourceBorderPalette;

assertSingleWordPaletteProperties("background", LIGHT_GREY_BACKGROUND_PALETTE);
assertSingleWordPaletteProperties("font", LIGHT_GREY_FONT_PALETTE);
assertSingleWordPaletteProperties("border", LIGHT_GREY_BORDER_PALETTE);

const LIGHT_GREY_PALETTE = createPalette(
  LIGHT_GREY_BACKGROUND_PALETTE,
  LIGHT_GREY_FONT_PALETTE,
  LIGHT_GREY_BORDER_PALETTE,
);
const LIGHT_GREY_FONT_COLORS = createColorMap(LIGHT_GREY_FONT_PALETTE);

const createLightGreyWorkbenchStyles = (palette: Palette): WorkbenchStyles => {
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

const LIGHT_GREY_WORKBENCH_STYLES =
  createLightGreyWorkbenchStyles(LIGHT_GREY_PALETTE);

export const theme = defineTheme({
  order: 15,
  fileName: "jacks-light-grey-theme-color-theme.json",
  name: "Jack's Light Grey Theme",
  type: "light",
  palette: LIGHT_GREY_PALETTE,
  fontPalette: LIGHT_GREY_FONT_COLORS,
  workbench: LIGHT_GREY_WORKBENCH_STYLES,
  integrity: {
    borderPolicy: { kind: "transparent" },
    workbenchTextPairs,
  },
});

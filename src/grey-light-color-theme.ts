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

const GREY_LIGHT_BACKGROUND_PALETTE = {
  black: "#111111",
  editor: "#969696",
  panel: "#8f8f8f",
  popup: "#9f9f9f",
  hover: "#898989",
  active: "#808080",
  guide: "#666666",
  accent: "#9a854c",
  success: "#78976e",
  danger: "#a37083",
  info: "#7490a6",
  ember: "#a67658",
  sand: "#9a854c",
  moss: "#78976e",
  sky: "#7490a6",
  mark: "#604d66",
  plum: "#81628d",
  clay: "#a37083",
} as const satisfies SourceBackgroundPalette;

const GREY_LIGHT_FONT_PALETTE = {
  text: "#111111",
  muted: "#26008b",
  faint: "#181818",
  ember: "#460001",
  sand: "#442900",
  moss: "#002b00",
  sky: "#000d5a",
  plum: "#2d0036",
  clay: "#5e0241",
} as const satisfies SourceFontPalette;

const GREY_LIGHT_BORDER_PALETTE = {
  divider: "#777777",
} as const satisfies SourceBorderPalette;

assertSingleWordPaletteProperties("background", GREY_LIGHT_BACKGROUND_PALETTE);
assertSingleWordPaletteProperties("font", GREY_LIGHT_FONT_PALETTE);
assertSingleWordPaletteProperties("border", GREY_LIGHT_BORDER_PALETTE);

const GREY_LIGHT_PALETTE = createPalette(
  GREY_LIGHT_BACKGROUND_PALETTE,
  GREY_LIGHT_FONT_PALETTE,
  GREY_LIGHT_BORDER_PALETTE,
);
const GREY_LIGHT_FONT_COLORS = createColorMap(GREY_LIGHT_FONT_PALETTE);

const createGreyLightWorkbenchStyles = (palette: Palette): WorkbenchStyles => {
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
    text: {
      ...styles.text,
      primary: F.text,
      muted: "#202020",
      faint: "#202020",
      disabled: "#202020",
      description: "#202020",
      icon: "#202020",
      link: F.sky,
      onAccent: F.text,
      error: F.clay,
      warning: F.sand,
      info: F.sky,
      success: F.moss,
      ember: F.ember,
      plum: F.plum,
    },
    accents: {
      ...styles.accents,
      debug: B.info,
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

const GREY_LIGHT_WORKBENCH_STYLES =
  createGreyLightWorkbenchStyles(GREY_LIGHT_PALETTE);

export const theme = defineTheme({
  order: 15,
  fileName: "jacks-grey-light-theme-color-theme.json",
  name: "Jack's Grey Light Theme",
  type: "light",
  palette: GREY_LIGHT_PALETTE,
  fontPalette: GREY_LIGHT_FONT_COLORS,
  workbench: GREY_LIGHT_WORKBENCH_STYLES,
  integrity: {
    borderPolicy: { kind: "transparent" },
    workbenchTextPairs,
  },
});

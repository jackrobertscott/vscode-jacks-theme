import {
  assertSingleWordPaletteProperties,
  createColorMap,
  createPalette,
  withAlpha,
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

const TTY_BACKGROUND_PALETTE = {
  black: "#020302",
  editor: "#050805",
  panel: "#071007",
  popup: "#0a160a",
  hover: "#102110",
  active: "#193119",
  guide: "#345234",
  accent: "#3a2c0a",
  success: "#1d4522",
  danger: "#4b2019",
  info: "#173b43",
  ember: "#3b2b0a",
  sand: "#34370e",
  moss: "#1f4d24",
  sky: "#173b43",
  mark: "#2c5d31",
  plum: "#2e263d",
  clay: "#4b2019",
} as const satisfies SourceBackgroundPalette;

const TTY_FONT_PALETTE = {
  text: "#c8f7b5",
  muted: "#8fbd8b",
  faint: "#668a64",
  ember: "#d4a65f",
  sand: "#dfd071",
  moss: "#8ee972",
  sky: "#7dc8d8",
  plum: "#b6a1df",
  clay: "#d77a63",
} as const satisfies SourceFontPalette;

const TTY_BORDER_PALETTE = {
  divider: "#102110",
} as const satisfies SourceBorderPalette;

assertSingleWordPaletteProperties("background", TTY_BACKGROUND_PALETTE);
assertSingleWordPaletteProperties("font", TTY_FONT_PALETTE);
assertSingleWordPaletteProperties("border", TTY_BORDER_PALETTE);

const TTY_PALETTE = createPalette(
  TTY_BACKGROUND_PALETTE,
  TTY_FONT_PALETTE,
  TTY_BORDER_PALETTE,
);
const TTY_FONT_COLORS = createColorMap(TTY_FONT_PALETTE);

const createTtyWorkbenchStyles = (palette: Palette): WorkbenchStyles => {
  const styles = createJackWorkbenchStyles(palette);
  const B = palette.background;
  const F = palette.font;

  return defineWorkbenchStyles({
    ...styles,
    surfaces: {
      ...styles.surfaces,
      activity: B.panel,
      activityActive: B.active,
      sidebar: B.panel,
      sidebarSection: B.popup,
      tabInactive: B.panel,
      panelArea: B.panel,
      statusBar: B.panel,
      titleBar: B.panel,
      titleBarInactive: B.editor,
      commandCenter: B.panel,
      commandCenterActive: B.hover,
      notificationHeader: B.panel,
      quickInputTitle: B.panel,
      settingsInput: B.editor,
      menuSelection: B.hover,
      welcomeTile: B.popup,
    },
    text: {
      ...styles.text,
      primary: F.text,
      muted: F.muted,
      faint: F.faint,
      disabled: F.faint,
      description: F.muted,
      icon: F.muted,
      link: F.sky,
      onAccent: F.text,
      error: F.clay,
      warning: F.ember,
      info: F.sky,
      success: F.moss,
      ember: F.ember,
      plum: F.plum,
    },
    accents: {
      ...styles.accents,
      primary: B.sky,
      selection: B.sky,
      success: B.success,
      danger: B.danger,
      warning: B.accent,
      info: B.info,
      debug: B.plum,
      badge: B.moss,
      toggled: B.active,
      prominent: B.hover,
    },
    overlays: {
      ...styles.overlays,
      selection: withAlpha(B.sky, 0.76),
      searchHighlight: withAlpha(B.mark, 0.72),
      searchMatch: withAlpha(B.mark, 0.82),
      lineHighlight: withAlpha(B.mark, 0.24),
      commandDebugging: withAlpha(B.plum, 0.88),
      scrollbarActive: withAlpha(F.text, 0.84),
      scrollbar: withAlpha(B.guide, 0.62),
      scrollbarHover: withAlpha(F.muted, 0.72),
    },
    controls: {
      ...styles.controls,
      primaryButton: {
        background: B.moss,
        foreground: F.text,
        hoverBackground: B.success,
      },
      secondaryButton: {
        background: B.active,
        foreground: F.text,
        hoverBackground: B.hover,
      },
      checkbox: {
        background: B.editor,
        foreground: F.moss,
      },
      dropdown: {
        background: B.popup,
        foreground: F.text,
        listBackground: B.popup,
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
      validation: {
        error: { background: B.danger, foreground: F.text },
        info: { background: B.info, foreground: F.text },
        warning: { background: B.accent, foreground: F.text },
      },
      badge: { background: B.moss, foreground: F.text },
      progress: F.moss,
    },
    lists: {
      ...styles.lists,
      activeSelection: { background: B.sky, foreground: F.text },
      focus: { background: B.sky, foreground: F.text },
      inactiveSelection: { background: B.hover, foreground: F.text },
      inactiveFocusBackground: B.hover,
      hoverBackground: B.hover,
      dropBackground: B.info,
      highlightForeground: F.sky,
      errorForeground: F.clay,
      warningForeground: F.ember,
      invalidItemForeground: F.clay,
    },
    editor: {
      ...styles.editor,
      cursorBackground: B.editor,
      cursorForeground: F.text,
      selection: { background: B.sky, foreground: F.text },
      whitespaceForeground: B.guide,
      indentGuide: B.guide,
      activeIndentGuide: F.faint,
      rulerForeground: B.guide,
      codeLensForeground: F.faint,
      lightBulbForeground: F.ember,
      lightBulbAutoFixForeground: F.moss,
      bracketMatchBackground: B.active,
      bracketHighlightForeground: F.muted,
      unexpectedBracketForeground: F.clay,
      unicodeHighlightBackground: B.accent,
      inlineValues: { background: B.panel, foreground: F.muted },
    },
  });
};

const TTY_WORKBENCH_STYLES = createTtyWorkbenchStyles(TTY_PALETTE);

export const theme = defineTheme({
  order: 15,
  fileName: "jacks-tty-theme-color-theme.json",
  name: "Jack's TTY Theme",
  type: "dark",
  palette: TTY_PALETTE,
  fontPalette: TTY_FONT_COLORS,
  workbench: TTY_WORKBENCH_STYLES,
  integrity: {
    borderPolicy: {
      kind: "transparent",
    },
    workbenchTextPairs,
  },
});

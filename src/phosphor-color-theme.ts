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

const PHOSPHOR_BACKGROUND_PALETTE = {
  black: "#000400",
  editor: "#020602",
  panel: "#041004",
  popup: "#061806",
  hover: "#0b240b",
  active: "#123612",
  guide: "#315a31",
  accent: "#403006",
  success: "#164c18",
  danger: "#4a1711",
  info: "#073944",
  ember: "#3a2605",
  sand: "#314206",
  moss: "#155114",
  sky: "#07404a",
  mark: "#2c622b",
  plum: "#351a44",
  clay: "#4a1711",
} as const satisfies SourceBackgroundPalette;

const PHOSPHOR_FONT_PALETTE = {
  text: "#b6ff9c",
  muted: "#8fcf86",
  faint: "#4f8a4f",
  ember: "#ffb84d",
  sand: "#d6ff7a",
  moss: "#7cff63",
  sky: "#35d7ff",
  plum: "#d58cff",
  clay: "#ff5f3a",
} as const satisfies SourceFontPalette;

const PHOSPHOR_BORDER_PALETTE = {
  divider: "#0b240b",
} as const satisfies SourceBorderPalette;

assertSingleWordPaletteProperties("background", PHOSPHOR_BACKGROUND_PALETTE);
assertSingleWordPaletteProperties("font", PHOSPHOR_FONT_PALETTE);
assertSingleWordPaletteProperties("border", PHOSPHOR_BORDER_PALETTE);

const PHOSPHOR_PALETTE = createPalette(
  PHOSPHOR_BACKGROUND_PALETTE,
  PHOSPHOR_FONT_PALETTE,
  PHOSPHOR_BORDER_PALETTE,
);
const PHOSPHOR_FONT_COLORS = createColorMap(PHOSPHOR_FONT_PALETTE);

const createPhosphorWorkbenchStyles = (palette: Palette): WorkbenchStyles => {
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

const PHOSPHOR_WORKBENCH_STYLES =
  createPhosphorWorkbenchStyles(PHOSPHOR_PALETTE);

export const theme = defineTheme({
  order: 15,
  fileName: "jacks-phosphor-theme-color-theme.json",
  name: "Jack's Phosphor Theme",
  type: "dark",
  palette: PHOSPHOR_PALETTE,
  fontPalette: PHOSPHOR_FONT_COLORS,
  workbench: PHOSPHOR_WORKBENCH_STYLES,
  integrity: {
    borderPolicy: {
      kind: "transparent",
    },
    workbenchTextPairs,
  },
});

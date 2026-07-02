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

const HACKER_BACKGROUND_PALETTE = {
  black: "#010201",
  editor: "#040904",
  panel: "#071207",
  popup: "#0b190b",
  hover: "#102610",
  active: "#183418",
  guide: "#335133",
  accent: "#32290f",
  success: "#1b3f20",
  danger: "#371817",
  info: "#183736",
  ember: "#36260e",
  sand: "#2c3212",
  moss: "#1f4a24",
  sky: "#183736",
  mark: "#2b5c31",
  plum: "#202840",
  clay: "#371817",
} as const satisfies SourceBackgroundPalette;

const HACKER_FONT_PALETTE = {
  text: "oklch(84.00% 0.0750 136.00)",
  muted: "oklch(67.50% 0.0550 136.00)",
  faint: "oklch(58.00% 0.0450 136.00)",
  ember: "oklch(78.00% 0.1000 70.00)",
  sand: "oklch(86.00% 0.0750 110.00)",
  moss: "oklch(79.00% 0.1150 142.00)",
  sky: "oklch(74.00% 0.0800 190.00)",
  plum: "oklch(70.00% 0.0750 270.00)",
  clay: "oklch(63.00% 0.1200 24.00)",
} as const satisfies SourceFontPalette;

const HACKER_BORDER_PALETTE = {
  divider: "#102610",
} as const satisfies SourceBorderPalette;

assertSingleWordPaletteProperties("background", HACKER_BACKGROUND_PALETTE);
assertSingleWordPaletteProperties("font", HACKER_FONT_PALETTE);
assertSingleWordPaletteProperties("border", HACKER_BORDER_PALETTE);

const HACKER_PALETTE = createPalette(
  HACKER_BACKGROUND_PALETTE,
  HACKER_FONT_PALETTE,
  HACKER_BORDER_PALETTE,
);
const HACKER_FONT_COLORS = createColorMap(HACKER_FONT_PALETTE);

const createHackerWorkbenchStyles = (palette: Palette): WorkbenchStyles => {
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
      primary: B.moss,
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
      cursorForeground: F.moss,
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

const HACKER_WORKBENCH_STYLES = createHackerWorkbenchStyles(HACKER_PALETTE);

export const theme = defineTheme({
  order: 15,
  fileName: "jacks-hacker-theme-color-theme.json",
  name: "Jack's Hacker Theme",
  type: "dark",
  palette: HACKER_PALETTE,
  fontPalette: HACKER_FONT_COLORS,
  workbench: HACKER_WORKBENCH_STYLES,
  integrity: {
    borderPolicy: {
      kind: "transparent",
    },
    workbenchTextPairs,
  },
});

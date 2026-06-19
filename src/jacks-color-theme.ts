import {
  assertSingleWordPaletteProperties,
  createColorMap,
  createPalette,
  withAlpha,
} from "./colors.js";
import type {
  Hex,
  Palette,
  SourceBackgroundPalette,
  SourceBorderPalette,
  SourceFontPalette,
} from "./theme.js";
import {
  defineWorkbenchStyles,
  noBorder,
  visibleBorder,
} from "./workbench-styles.js";
import type {
  WorkbenchBorderStyles,
  WorkbenchStyles,
} from "./workbench-styles.js";

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

export const createJackWorkbenchBorders = (
  palette: Palette,
  visibleDivider?: Hex,
): WorkbenchBorderStyles => {
  const none = noBorder(palette.background.transparent);
  const divider = visibleDivider ? visibleBorder(visibleDivider) : none;

  return {
    editorLineHighlight: none,
    editorRangeHighlight: none,
    editorSelectionHighlight: none,
    editorSymbolHighlight: none,
    editorWordHighlight: none,
    editorWordHighlightStrong: none,
    editorWordHighlightText: none,
    widget: none,
    widgetResize: none,
    window: none,
    contentDivider: divider,
    separator: divider,
    control: none,
    validationError: none,
    validationWarning: none,
    validationInfo: none,
    activityDivider: divider,
    sidebarDivider: divider,
    sidebarSection: divider,
    editorGroup: divider,
    editorGroupHeader: divider,
    tabDivider: divider,
    findMatch: none,
    bracketMatch: none,
    unicodeHighlight: none,
    overviewRuler: none,
    diff: divider,
    panel: divider,
    panelInput: none,
    terminal: divider,
    debugToolbar: divider,
    statusBar: divider,
    titleBar: divider,
    menu: divider,
    commandCenter: none,
    notification: divider,
    picker: divider,
    settingsControl: none,
    settingsSash: divider,
    peek: divider,
    welcomeTile: divider,
    chartLine: none,
  };
};

export const createJackWorkbenchStyles = (
  palette: Palette,
  borders = createJackWorkbenchBorders(palette),
): WorkbenchStyles => {
  const B = palette.background;
  const F = palette.font;

  return defineWorkbenchStyles({
    transparent: B.transparent,
    surfaces: {
      editor: B.editor,
      underlay: B.editor,
      panel: B.panel,
      popup: B.popup,
      hover: B.hover,
      active: B.active,
      guide: B.guide,
      activity: B.editor,
      activityActive: B.hover,
      sidebar: B.editor,
      sidebarSection: B.panel,
      tabActive: B.editor,
      tabInactive: B.editor,
      panelArea: B.editor,
      statusBar: B.editor,
      titleBar: B.editor,
      titleBarInactive: B.editor,
      commandCenter: B.editor,
      commandCenterActive: B.hover,
      notificationHeader: B.panel,
      quickInputTitle: B.panel,
      settingsInput: B.panel,
      menuSelection: B.active,
      welcomeTile: B.panel,
    },
    text: {
      primary: F.text,
      muted: F.muted,
      faint: F.faint,
      disabled: F.faint,
      description: F.muted,
      icon: F.muted,
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
      primary: B.sky,
      selection: B.sky,
      success: B.moss,
      danger: B.clay,
      warning: B.sand,
      info: B.info,
      debug: B.plum,
      badge: B.sky,
      toggled: B.active,
      prominent: B.hover,
    },
    overlays: {
      shadow: B.shadow,
      subtle: withAlpha(B.hover, 0.72),
      medium: withAlpha(B.active, 0.72),
      selection: withAlpha(B.sky, 0.76),
      searchHighlight: withAlpha(B.mark, 0.72),
      searchMatch: withAlpha(B.mark, 0.82),
      lineHighlight: withAlpha(B.mark, 0.24),
      wordHighlight: withAlpha(B.mark, 0.72),
      wordHighlightStrong: withAlpha(B.mark, 0.78),
      wordHighlightText: withAlpha(B.mark, 0.7),
      fold: withAlpha(B.editor, 0.72),
      diffInsertedLine: withAlpha(B.success, 0.44),
      diffInsertedText: withAlpha(B.success, 0.58),
      diffRemovedLine: withAlpha(B.danger, 0.44),
      diffRemovedText: withAlpha(B.danger, 0.58),
      commandDebugging: withAlpha(B.plum, 0.88),
      minimapOpacity: B.minimap,
      scrollbarActive: withAlpha(F.muted, 0.84),
      scrollbar: withAlpha(B.guide, 0.62),
      scrollbarHover: withAlpha(F.faint, 0.72),
    },
    borders,
    controls: {
      primaryButton: {
        background: B.sky,
        foreground: F.text,
        hoverBackground: B.sky,
      },
      secondaryButton: {
        background: B.active,
        foreground: F.text,
        hoverBackground: B.hover,
      },
      checkbox: {
        background: B.panel,
        foreground: F.sky,
      },
      dropdown: {
        background: B.popup,
        foreground: F.text,
        listBackground: B.popup,
      },
      input: {
        background: B.panel,
        foreground: F.text,
        placeholderForeground: F.muted,
      },
      inputOption: {
        background: B.active,
        foreground: F.text,
        hoverBackground: B.hover,
      },
      validation: {
        error: { background: B.danger, foreground: F.text },
        info: { background: B.info, foreground: F.text },
        warning: { background: B.accent, foreground: F.text },
      },
      badge: { background: B.active, foreground: F.text },
      progress: B.sky,
    },
    lists: {
      activeSelection: { background: B.active, foreground: F.text },
      focus: { background: B.active, foreground: F.text },
      inactiveSelection: { background: B.active, foreground: F.text },
      inactiveFocusBackground: B.active,
      hoverBackground: B.hover,
      dropBackground: B.info,
      highlightForeground: F.sky,
      errorForeground: F.clay,
      warningForeground: F.sand,
      invalidItemForeground: F.clay,
    },
    editor: {
      foreground: F.text,
      lineNumber: F.faint,
      activeLineNumber: F.muted,
      dimmedLineNumber: F.faint,
      cursorBackground: B.editor,
      cursorForeground: F.sky,
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
      inlineValues: { background: B.editor, foreground: F.muted },
    },
  });
};

export const JACK_WORKBENCH_STYLES = createJackWorkbenchStyles(JACK_PALETTE);

import {
  assertSingleWordPaletteProperties,
  createColorMap,
  createPalette,
  withAlpha,
} from "./colors.js";
import { defineTheme } from "./theme.js";
import type {
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
import {
  getVisibleWorkbenchBorderColorIds,
  workbenchTextPairs,
} from "./workbench.js";

const MOCKUP_BACKGROUND_PALETTE = {
  black: "#24211c",
  editor: "#e4d7c4",
  panel: "#e2d7c8",
  popup: "#efe2cd",
  hover: "#d1c3b1",
  active: "#c2b4a2",
  guide: "#9c9083",
  accent: "#d7b250",
  success: "#a3c48f",
  danger: "#e1a09b",
  info: "#94bece",
  ember: "#dfa171",
  sand: "#d3b45f",
  moss: "#a3c48f",
  sky: "#94bece",
  mark: "#9f7abf",
  plum: "#b99bce",
  clay: "#e1a09b",
} as const satisfies SourceBackgroundPalette;

const MOCKUP_FONT_PALETTE = {
  text: "#24211c",
  muted: "#45423d",
  faint: "#655e55",
  ember: "#9b3b18",
  sand: "#5c5600",
  moss: "#006b3f",
  sky: "#005a9e",
  plum: "#733b9e",
  clay: "#a5305b",
} as const satisfies SourceFontPalette;

const MOCKUP_BORDER_PALETTE = {
  divider: "#b5a793",
} as const satisfies SourceBorderPalette;

assertSingleWordPaletteProperties("background", MOCKUP_BACKGROUND_PALETTE);
assertSingleWordPaletteProperties("font", MOCKUP_FONT_PALETTE);
assertSingleWordPaletteProperties("border", MOCKUP_BORDER_PALETTE);

const MOCKUP_PALETTE = createPalette(
  MOCKUP_BACKGROUND_PALETTE,
  MOCKUP_FONT_PALETTE,
  MOCKUP_BORDER_PALETTE,
);
const MOCKUP_FONT_COLORS = createColorMap(MOCKUP_FONT_PALETTE);

const createMockupWorkbenchBorders = (
  palette: Palette,
): WorkbenchBorderStyles => {
  const transparent = palette.background.transparent;
  const F = palette.font;
  const paper = visibleBorder(palette.border.divider);
  const blueprint = visibleBorder(F.sky);
  const redline = visibleBorder(F.clay);
  const note = visibleBorder(F.sand);
  const none = noBorder(transparent);

  return {
    editorLineHighlight: none,
    editorRangeHighlight: none,
    editorSelectionHighlight: none,
    editorSymbolHighlight: none,
    editorWordHighlight: none,
    editorWordHighlightStrong: none,
    editorWordHighlightText: none,
    widget: paper,
    widgetResize: paper,
    window: paper,
    contentDivider: paper,
    separator: paper,
    control: paper,
    validationError: redline,
    validationWarning: note,
    validationInfo: blueprint,
    activityDivider: paper,
    sidebarDivider: paper,
    sidebarSection: paper,
    editorGroup: paper,
    editorGroupHeader: paper,
    tabDivider: paper,
    findMatch: blueprint,
    bracketMatch: paper,
    unicodeHighlight: note,
    diff: paper,
    panel: paper,
    panelInput: paper,
    terminal: paper,
    debugToolbar: paper,
    statusBar: paper,
    titleBar: paper,
    menu: paper,
    commandCenter: paper,
    notification: paper,
    picker: paper,
    settingsControl: paper,
    settingsSash: paper,
    peek: paper,
    welcomeTile: paper,
    chartLine: paper,
  };
};

const createMockupWorkbenchStyles = (palette: Palette): WorkbenchStyles => {
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
      activity: B.panel,
      activityActive: B.active,
      sidebar: B.panel,
      sidebarSection: B.active,
      tabActive: B.editor,
      tabInactive: B.panel,
      panelArea: B.panel,
      statusBar: B.panel,
      titleBar: B.panel,
      titleBarInactive: B.editor,
      commandCenter: B.panel,
      commandCenterActive: B.sky,
      notificationHeader: B.panel,
      quickInputTitle: B.panel,
      settingsInput: B.popup,
      menuSelection: B.sky,
      welcomeTile: B.popup,
    },
    text: {
      primary: F.text,
      muted: F.muted,
      faint: F.faint,
      disabled: F.faint,
      description: F.faint,
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
      badge: B.clay,
      toggled: B.sky,
      prominent: B.sky,
    },
    overlays: {
      shadow: B.shadow,
      subtle: withAlpha(B.hover, 0.72),
      medium: withAlpha(B.active, 0.72),
      selection: withAlpha(B.sky, 0.76),
      searchHighlight: withAlpha(B.mark, 0.72),
      searchMatch: withAlpha(B.mark, 0.82),
      lineHighlight: withAlpha(B.sand, 0.28),
      wordHighlight: withAlpha(B.mark, 0.72),
      wordHighlightStrong: withAlpha(B.mark, 0.78),
      wordHighlightText: withAlpha(B.mark, 0.7),
      fold: withAlpha(B.sand, 0.3),
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
    borders: createMockupWorkbenchBorders(palette),
    controls: {
      primaryButton: {
        background: B.sky,
        foreground: F.text,
        hoverBackground: B.info,
      },
      secondaryButton: {
        background: B.sand,
        foreground: F.text,
        hoverBackground: B.hover,
      },
      checkbox: {
        background: B.popup,
        foreground: F.sky,
      },
      dropdown: {
        background: B.popup,
        foreground: F.text,
        listBackground: B.popup,
      },
      input: {
        background: B.popup,
        foreground: F.text,
        placeholderForeground: F.faint,
      },
      inputOption: {
        background: B.sky,
        foreground: F.text,
        hoverBackground: B.hover,
      },
      validation: {
        error: { background: B.danger, foreground: F.text },
        info: { background: B.info, foreground: F.text },
        warning: { background: B.accent, foreground: F.text },
      },
      badge: { background: B.sky, foreground: F.text },
      progress: F.sky,
    },
    lists: {
      activeSelection: { background: B.sky, foreground: F.text },
      focus: { background: B.sky, foreground: F.text },
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
      cursorForeground: F.clay,
      selection: { background: B.sky, foreground: F.text },
      whitespaceForeground: B.guide,
      indentGuide: B.guide,
      activeIndentGuide: F.faint,
      rulerForeground: B.guide,
      codeLensForeground: F.faint,
      lightBulbForeground: F.ember,
      lightBulbAutoFixForeground: F.moss,
      bracketMatchBackground: B.sand,
      bracketHighlightForeground: F.muted,
      unexpectedBracketForeground: F.clay,
      unicodeHighlightBackground: B.accent,
      inlineValues: { background: B.panel, foreground: F.muted },
    },
  });
};

const MOCKUP_WORKBENCH_STYLES = createMockupWorkbenchStyles(MOCKUP_PALETTE);
const mockupVisibleBorderIds = getVisibleWorkbenchBorderColorIds(
  MOCKUP_WORKBENCH_STYLES,
);

export const theme = defineTheme({
  order: 40,
  fileName: "jacks-draft-theme-color-theme.json",
  name: "Jack's Draft Theme",
  type: "light",
  palette: MOCKUP_PALETTE,
  fontPalette: MOCKUP_FONT_COLORS,
  workbench: MOCKUP_WORKBENCH_STYLES,
  integrity: {
    borderPolicy: {
      kind: "mapped",
      visibleIds: mockupVisibleBorderIds,
      requiredVisibleIds: mockupVisibleBorderIds,
    },
    workbenchTextPairs,
  },
});

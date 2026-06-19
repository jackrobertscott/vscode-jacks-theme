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

const GREY_BACKGROUND_PALETTE = {
  black: "#202020",
  editor: "#464646",
  panel: "#404040",
  popup: "#4e4e4e",
  hover: "#5c5c5c",
  active: "#686868",
  guide: "#828282",
  accent: "#6f613d",
  success: "#536b50",
  danger: "#765463",
  info: "#4e6579",
  ember: "#775747",
  sand: "#6f653d",
  moss: "#536b50",
  sky: "#4e6579",
  mark: "#927a96",
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
  divider: "#8a8a8a",
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

export const createGreyWorkbenchBorders = (
  palette: Palette,
): WorkbenchBorderStyles => {
  const none = noBorder(palette.background.transparent);
  const divider = visibleBorder(palette.border.divider);

  return {
    editorLineHighlight: none,
    editorRangeHighlight: none,
    editorSelectionHighlight: none,
    editorSymbolHighlight: none,
    editorWordHighlight: none,
    editorWordHighlightStrong: none,
    editorWordHighlightText: none,
    widget: divider,
    widgetResize: divider,
    window: divider,
    contentDivider: divider,
    separator: divider,
    control: divider,
    validationError: divider,
    validationWarning: divider,
    validationInfo: divider,
    activityDivider: divider,
    sidebarDivider: divider,
    sidebarSection: divider,
    editorGroup: divider,
    editorGroupHeader: divider,
    tabDivider: divider,
    findMatch: divider,
    bracketMatch: divider,
    unicodeHighlight: divider,
    diff: divider,
    panel: divider,
    panelInput: divider,
    terminal: divider,
    debugToolbar: divider,
    statusBar: divider,
    titleBar: divider,
    menu: divider,
    commandCenter: divider,
    notification: divider,
    picker: divider,
    settingsControl: divider,
    settingsSash: divider,
    peek: divider,
    welcomeTile: divider,
    chartLine: divider,
  };
};

const createGreyWorkbenchStyles = (palette: Palette): WorkbenchStyles => {
  const styles = createJackWorkbenchStyles(
    palette,
    createGreyWorkbenchBorders(palette),
  );
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
const greyVisibleBorderIds = getVisibleWorkbenchBorderColorIds(
  GREY_WORKBENCH_STYLES,
);

export const theme = defineTheme({
  order: 20,
  fileName: "jacks-graphite-theme-color-theme.json",
  name: "Jack's Graphite Theme",
  type: "dark",
  palette: GREY_PALETTE,
  fontPalette: GREY_FONT_COLORS,
  workbench: GREY_WORKBENCH_STYLES,
  integrity: {
    borderPolicy: {
      kind: "uniform",
      visibleIds: greyVisibleBorderIds,
      color: GREY_PALETTE.border.divider,
      lighterThan: [
        ["editor background", GREY_PALETTE.background.editor],
        ["popup background", GREY_PALETTE.background.popup],
        ["active background", GREY_PALETTE.background.active],
      ],
      darkerThan: [],
    },
    workbenchTextPairs,
  },
});

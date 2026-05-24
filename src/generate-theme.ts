import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

type Hex = `#${string}`;
type Oklch = `oklch(${number}% ${number} ${number})`;

type TokenRule = {
  name: string;
  scope: string | string[];
  settings: {
    foreground?: Hex;
    background?: Hex;
  };
};

type Theme = {
  $schema: string;
  name: string;
  type: "dark" | "light";
  semanticHighlighting: true;
  colors: Record<string, Hex>;
  tokenColors: TokenRule[];
  semanticTokenColors: Record<string, Hex>;
};

const JACK_BACKGROUND_PALETTE = {
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
  plum: "oklch(38.00% 0.0940 310.00)",
  clay: "oklch(38.50% 0.0960 352.00)",
} as const satisfies Record<string, Oklch>;

const JACK_FONT_PALETTE = {
  text: "oklch(88.00% 0 0)",
  muted: "oklch(69.00% 0 0)",
  faint: "oklch(59.00% 0 0)",
  ember: "oklch(76.50% 0.1500 34.00)",
  sand: "oklch(79.00% 0.1300 92.00)",
  moss: "oklch(74.50% 0.1400 142.00)",
  sky: "oklch(76.50% 0.1350 248.00)",
  plum: "oklch(78.00% 0.1250 318.00)",
  clay: "oklch(70.00% 0.1400 350.00)",
} as const;

const JACK_BORDER_PALETTE = {
  divider: "oklch(24.00% 0 0)",
} as const satisfies Record<string, Oklch>;

type BackgroundPalette = Record<keyof typeof JACK_BACKGROUND_PALETTE, Hex> & {
  shadow: Hex;
  minimap: Hex;
  transparent: Hex;
};
type FontPalette = Record<keyof typeof JACK_FONT_PALETTE, Hex>;
type BorderPalette = Record<keyof typeof JACK_BORDER_PALETTE, Hex>;
type Palette = {
  background: BackgroundPalette;
  font: FontPalette;
  border: BorderPalette;
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const stripHash = (value: Hex) => value.slice(1);
const toByte = (value: number) =>
  Math.round(clamp01(value) * 255)
    .toString(16)
    .padStart(2, "0");
const withAlpha = (value: Hex, opacity: number): Hex =>
  `#${stripHash(value).slice(0, 6)}${toByte(opacity)}`;
const keys = (ids: readonly string[], value: Hex): Record<string, Hex> =>
  Object.fromEntries(ids.map((id) => [id, value]));

const parseOklch = (value: Oklch): { l: number; c: number; h: number } => {
  const match =
    /^oklch\((\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\)$/.exec(
      value,
    );
  if (!match) throw new Error(`Invalid OKLCH color: ${value}`);

  return {
    l: Number(match[1]) / 100,
    c: Number(match[2]),
    h: Number(match[3]),
  };
};

const linearToSrgb = (value: number) =>
  value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055;

const oklchToHex = (value: Oklch): Hex => {
  const { l, c, h } = parseOklch(value);
  const hue = (h * Math.PI) / 180;
  const a = c * Math.cos(hue);
  const b = c * Math.sin(hue);

  const lPrime = l + 0.3963377774 * a + 0.2158037573 * b;
  const mPrime = l - 0.1055613458 * a - 0.0638541728 * b;
  const sPrime = l - 0.0894841775 * a - 1.291485548 * b;

  const lCone = lPrime ** 3;
  const mCone = mPrime ** 3;
  const sCone = sPrime ** 3;

  const red = linearToSrgb(
    4.0767416621 * lCone - 3.3077115913 * mCone + 0.2309699292 * sCone,
  );
  const green = linearToSrgb(
    -1.2684380046 * lCone + 2.6097574011 * mCone - 0.3413193965 * sCone,
  );
  const blue = linearToSrgb(
    -0.0041960863 * lCone - 0.7034186147 * mCone + 1.707614701 * sCone,
  );

  return `#${toByte(red)}${toByte(green)}${toByte(blue)}`;
};

const createColorMap = <T extends Record<string, Oklch>>(
  colors: T,
): Record<keyof T, Hex> =>
  Object.fromEntries(
    Object.entries(colors).map(([id, value]) => [id, oklchToHex(value)]),
  ) as Record<keyof T, Hex>;

const createPalette = (
  backgroundColors: typeof JACK_BACKGROUND_PALETTE,
  fontColors: typeof JACK_FONT_PALETTE,
  borderColors: typeof JACK_BORDER_PALETTE,
): Palette => {
  const background = createColorMap(backgroundColors) as Record<
    keyof typeof JACK_BACKGROUND_PALETTE,
    Hex
  >;
  const font = createColorMap(fontColors);
  const border = createColorMap(borderColors);
  const transparent = withAlpha(background.black, 0);

  return {
    background: {
      ...background,
      shadow: withAlpha(background.black, 0.22),
      minimap: withAlpha(background.black, 0.22),
      transparent,
    },
    font,
    border,
  };
};

const editorSurfaceIds = [
  "editor.background",
  "editorGutter.background",
  "editorGutter.itemBackground",
  "editorOverviewRuler.background",
  "editorStickyScroll.background",
  "editorStickyScrollGutter.background",
  "minimap.background",
  "notebook.cellEditorBackground",
  "notebook.editorBackground",
  "peekViewEditor.background",
  "peekViewEditorGutter.background",
  "peekViewEditorStickyScroll.background",
  "peekViewEditorStickyScrollGutter.background",
  "peekViewResult.background",
  "walkThrough.embeddedEditorBackground",
] as const;

// These surfaces appear below the editor's rendered line layer in VS Code's compositor.
const editorUnderlayIds = [
  "editorGroup.emptyBackground",
  "editorGroupHeader.noTabsBackground",
  "editorGroupHeader.tabsBackground",
  "editorPane.background",
  "multiDiffEditor.background",
  "outputView.background",
  "terminal.background",
  "terminalStickyScroll.background",
  "welcomePage.background",
] as const;

const transparentEditorOverlayIds = [
  "editor.lineHighlightBorder",
  "editor.rangeHighlightBorder",
  "editor.selectionHighlightBorder",
  "editor.symbolHighlightBorder",
  "editor.wordHighlightBorder",
  "editor.wordHighlightStrongBorder",
  "editor.wordHighlightTextBorder",
  "scrollbar.background",
  "scrollbar.shadow",
] as const;

const createWorkbenchColors = (C: Palette): Theme["colors"] => {
  const B = C.background;
  const F = C.font;
  const subtle = withAlpha(B.hover, 0.72);
  const medium = withAlpha(B.active, 0.72);
  const highlight = withAlpha(B.sky, 0.76);
  const diffLineSuccess = withAlpha(B.success, 0.44);
  const diffLineDanger = withAlpha(B.danger, 0.44);
  const diffTextSuccess = withAlpha(B.success, 0.58);
  const diffTextDanger = withAlpha(B.danger, 0.58);

  return {
    ...keys(editorSurfaceIds, B.editor),
    ...keys(editorUnderlayIds, B.editor),
    ...keys(transparentEditorOverlayIds, B.transparent),

    "editor.inactiveLineHighlightBackground": B.editor,
    "editor.lineHighlightBackground": withAlpha(F.sky, 0.16),
    focusBorder: B.transparent,
    foreground: F.text,
    disabledForeground: F.faint,
    descriptionForeground: F.muted,
    errorForeground: F.clay,
    "icon.foreground": F.muted,
    "selection.background": B.sky,
    "sash.hoverBorder": B.transparent,
    "widget.border": B.transparent,
    "widget.shadow": B.shadow,

    "editorWidget.background": B.popup,
    "editorWidget.border": B.transparent,
    "editorWidget.foreground": F.text,
    "editorWidget.resizeBorder": B.transparent,
    "editorHoverWidget.background": B.popup,
    "editorHoverWidget.border": B.transparent,
    "editorHoverWidget.foreground": F.text,
    "editorHoverWidget.statusBarBackground": B.panel,

    "window.activeBorder": B.transparent,
    "window.inactiveBorder": B.transparent,

    "textBlockQuote.background": B.panel,
    "textBlockQuote.border": B.transparent,
    "textCodeBlock.background": B.popup,
    "textLink.activeForeground": F.sky,
    "textLink.foreground": F.sky,
    "textPreformat.background": B.popup,
    "textPreformat.foreground": F.text,
    "textSeparator.foreground": B.transparent,

    "toolbar.hoverBackground": B.hover,
    "toolbar.hoverOutline": B.transparent,
    "toolbar.activeBackground": B.active,

    "button.background": B.sky,
    "button.foreground": F.text,
    "button.hoverBackground": B.sky,
    "button.secondaryBackground": B.active,
    "button.secondaryForeground": F.text,
    "button.secondaryHoverBackground": B.hover,
    "checkbox.background": B.panel,
    "checkbox.border": B.transparent,
    "checkbox.foreground": F.sky,
    "dropdown.background": B.popup,
    "dropdown.border": B.transparent,
    "dropdown.foreground": F.text,
    "dropdown.listBackground": B.popup,
    "input.background": B.panel,
    "input.border": B.transparent,
    "input.foreground": F.text,
    "input.placeholderForeground": F.faint,
    "inputOption.activeBackground": B.active,
    "inputOption.activeBorder": B.transparent,
    "inputOption.activeForeground": F.text,
    "inputOption.hoverBackground": B.hover,
    "inputValidation.errorBackground": B.danger,
    "inputValidation.errorBorder": B.transparent,
    "inputValidation.infoBackground": B.info,
    "inputValidation.infoBorder": B.transparent,
    "inputValidation.warningBackground": B.accent,
    "inputValidation.warningBorder": B.transparent,

    "badge.background": B.active,
    "badge.foreground": F.text,
    "progressBar.background": B.sky,

    "list.activeSelectionBackground": B.active,
    "list.activeSelectionForeground": F.text,
    "list.dropBackground": B.info,
    "list.errorForeground": F.clay,
    "list.focusBackground": B.active,
    "list.focusForeground": F.text,
    "list.highlightForeground": F.sky,
    "list.hoverBackground": B.hover,
    "list.inactiveFocusBackground": B.active,
    "list.inactiveSelectionBackground": B.active,
    "list.invalidItemForeground": F.clay,
    "list.warningForeground": F.sand,

    "activityBar.background": B.editor,
    "activityBar.border": B.transparent,
    "activityBar.foreground": F.text,
    "activityBar.inactiveForeground": F.faint,
    "activityBar.activeBackground": B.hover,
    "activityBar.activeBorder": B.transparent,
    "activityBarBadge.background": B.sky,
    "activityBarBadge.foreground": F.text,
    "activityBarTop.background": B.editor,
    "activityBarTop.foreground": F.text,
    "activityBarTop.inactiveForeground": F.faint,
    "activityBarTop.activeBackground": B.hover,
    "activityBarTop.activeBorder": B.transparent,

    "sideBar.background": B.editor,
    "sideBar.border": B.transparent,
    "sideBar.foreground": F.text,
    "sideBarTitle.background": B.editor,
    "sideBarTitle.foreground": F.text,
    "sideBarSectionHeader.background": B.panel,
    "sideBarSectionHeader.border": B.transparent,
    "sideBarSectionHeader.foreground": F.text,
    "sideBarStickyScroll.background": B.editor,

    "editorGroup.border": B.transparent,
    "editorGroup.dropBackground": B.info,
    "editorGroupHeader.tabsBorder": B.transparent,
    "editorGroupHeader.border": B.transparent,
    "tab.activeBackground": B.editor,
    "tab.activeBorder": B.transparent,
    "tab.activeBorderTop": B.transparent,
    "tab.activeForeground": F.text,
    "tab.border": B.transparent,
    "tab.hoverBackground": B.hover,
    "tab.hoverForeground": F.text,
    "tab.inactiveBackground": B.editor,
    "tab.inactiveForeground": F.faint,
    "tab.unfocusedActiveForeground": F.text,
    "tab.unfocusedInactiveForeground": F.faint,

    "editor.foreground": F.text,
    "editorLineNumber.foreground": F.faint,
    "editorLineNumber.activeForeground": F.muted,
    "editorLineNumber.dimmedForeground": F.faint,
    "editorCursor.background": B.editor,
    "editorCursor.foreground": F.sky,
    "editor.selectionBackground": B.sky,
    "editor.selectionForeground": F.text,
    "editor.selectionHighlightBackground": subtle,
    "editor.inactiveSelectionBackground": subtle,
    "editor.wordHighlightBackground": subtle,
    "editor.wordHighlightStrongBackground": medium,
    "editor.wordHighlightTextBackground": subtle,
    "editor.findMatchBackground": B.sky,
    "editor.findMatchBorder": B.transparent,
    "editor.findMatchHighlightBackground": highlight,
    "editor.findRangeHighlightBackground": medium,
    "editor.hoverHighlightBackground": subtle,
    "editor.linkedEditingBackground": B.active,
    "editor.rangeHighlightBackground": subtle,
    "editor.symbolHighlightBackground": medium,
    "editorWhitespace.foreground": B.guide,
    "editorIndentGuide.background1": B.guide,
    "editorIndentGuide.activeBackground1": F.faint,
    "editorRuler.foreground": B.guide,
    "editorCodeLens.foreground": F.faint,
    "editorLightBulb.foreground": F.ember,
    "editorLightBulbAutoFix.foreground": F.moss,
    "editorBracketMatch.background": B.active,
    "editorBracketMatch.border": B.transparent,
    "editorBracketHighlight.foreground1": F.muted,
    "editorBracketHighlight.foreground2": F.muted,
    "editorBracketHighlight.foreground3": F.muted,
    "editorBracketHighlight.foreground4": F.muted,
    "editorBracketHighlight.foreground5": F.muted,
    "editorBracketHighlight.foreground6": F.muted,
    "editorBracketHighlight.unexpectedBracket.foreground": F.clay,
    "editorBracketPairGuide.background1": B.guide,
    "editorBracketPairGuide.activeBackground1": F.faint,
    "editorUnicodeHighlight.border": B.transparent,
    "editorUnicodeHighlight.background": B.accent,
    "editor.foldBackground": withAlpha(B.editor, 0.72),
    "editor.inlineValuesBackground": B.editor,
    "editor.inlineValuesForeground": F.muted,

    "editorGutter.addedBackground": B.moss,
    "editorGutter.deletedBackground": B.clay,
    "editorGutter.modifiedBackground": B.sky,
    "editorGutter.commentRangeForeground": F.faint,
    "editorOverviewRuler.addedForeground": F.moss,
    "editorOverviewRuler.deletedForeground": F.clay,
    "editorOverviewRuler.modifiedForeground": F.sky,
    "editorOverviewRuler.border": B.transparent,
    "editorOverviewRuler.errorForeground": F.clay,
    "editorOverviewRuler.warningForeground": F.sand,
    "editorOverviewRuler.infoForeground": F.sky,
    "editorOverviewRuler.findMatchForeground": highlight,
    "editorOverviewRuler.rangeHighlightForeground": subtle,
    "editorOverviewRuler.selectionHighlightForeground": highlight,
    "editorOverviewRuler.wordHighlightForeground": subtle,
    "editorOverviewRuler.wordHighlightStrongForeground": medium,
    "editorError.foreground": F.clay,
    "editorError.border": B.transparent,
    "editorError.background": B.transparent,
    "editorWarning.foreground": F.sand,
    "editorWarning.border": B.transparent,
    "editorWarning.background": B.transparent,
    "editorInfo.foreground": F.sky,
    "editorInfo.border": B.transparent,
    "editorInfo.background": B.transparent,
    "editorHint.foreground": F.moss,
    "editorHint.border": B.transparent,
    "problemsErrorIcon.foreground": F.clay,
    "problemsWarningIcon.foreground": F.sand,
    "problemsInfoIcon.foreground": F.sky,

    "diffEditor.insertedTextBackground": diffTextSuccess,
    "diffEditor.insertedLineBackground": diffLineSuccess,
    "diffEditor.removedTextBackground": diffTextDanger,
    "diffEditor.removedLineBackground": diffLineDanger,
    "diffEditorGutter.insertedLineBackground": B.success,
    "diffEditorGutter.removedLineBackground": B.danger,
    "diffEditor.border": B.transparent,
    "diffEditor.diagonalFill": B.guide,
    "diffEditor.unchangedRegionBackground": B.panel,
    "diffEditor.unchangedRegionForeground": F.faint,
    "diffEditor.unchangedCodeBackground": B.editor,

    "panel.background": B.editor,
    "panel.border": B.transparent,
    "panelTitle.activeBorder": B.transparent,
    "panelTitle.activeForeground": F.text,
    "panelTitle.inactiveForeground": F.faint,
    "panelInput.border": B.transparent,

    "terminal.foreground": F.text,
    "terminal.ansiBlack": F.faint,
    "terminal.ansiBlue": F.sky,
    "terminal.ansiBrightBlack": F.faint,
    "terminal.ansiBrightBlue": F.sky,
    "terminal.ansiBrightCyan": F.sky,
    "terminal.ansiBrightGreen": F.moss,
    "terminal.ansiBrightMagenta": F.plum,
    "terminal.ansiBrightRed": F.clay,
    "terminal.ansiBrightWhite": F.text,
    "terminal.ansiBrightYellow": F.sand,
    "terminal.ansiCyan": F.sky,
    "terminal.ansiGreen": F.moss,
    "terminal.ansiMagenta": F.plum,
    "terminal.ansiRed": F.clay,
    "terminal.ansiWhite": F.text,
    "terminal.ansiYellow": F.sand,
    "terminal.border": B.transparent,
    "terminalCursor.background": B.editor,
    "terminalCursor.foreground": F.sky,
    "terminal.selectionBackground": B.sky,

    "debugToolBar.background": B.popup,
    "debugToolBar.border": B.transparent,
    "debugIcon.continueForeground": F.moss,
    "debugIcon.disconnectForeground": F.clay,
    "debugIcon.pauseForeground": F.sand,
    "debugIcon.restartForeground": F.sky,
    "debugIcon.startForeground": F.moss,
    "debugIcon.stepBackForeground": F.sky,
    "debugIcon.stepIntoForeground": F.sky,
    "debugIcon.stepOutForeground": F.sky,
    "debugIcon.stepOverForeground": F.sky,
    "debugIcon.stopForeground": F.clay,

    "statusBar.background": B.editor,
    "statusBar.border": B.transparent,
    "statusBar.foreground": F.muted,
    "statusBar.debuggingBackground": B.plum,
    "statusBar.debuggingForeground": F.text,
    "statusBar.noFolderBackground": B.editor,
    "statusBar.noFolderForeground": F.muted,
    "statusBarItem.activeBackground": B.active,
    "statusBarItem.hoverBackground": B.hover,
    "statusBarItem.prominentBackground": B.hover,
    "statusBarItem.prominentForeground": F.muted,
    "statusBarItem.remoteBackground": B.sky,
    "statusBarItem.remoteForeground": F.text,
    "statusBarItem.errorBackground": B.clay,
    "statusBarItem.errorForeground": F.text,
    "statusBarItem.warningBackground": B.sand,
    "statusBarItem.warningForeground": F.text,

    "titleBar.activeBackground": B.editor,
    "titleBar.activeForeground": F.text,
    "titleBar.border": B.transparent,
    "titleBar.inactiveBackground": B.editor,
    "titleBar.inactiveForeground": F.faint,

    "menu.background": B.popup,
    "menu.border": B.transparent,
    "menu.foreground": F.text,
    "menu.selectionBackground": B.active,
    "menu.selectionBorder": B.transparent,
    "menu.selectionForeground": F.text,
    "menu.separatorBackground": B.transparent,
    "menubar.selectionBackground": B.active,
    "menubar.selectionBorder": B.transparent,
    "menubar.selectionForeground": F.text,

    "commandCenter.foreground": F.muted,
    "commandCenter.activeForeground": F.text,
    "commandCenter.background": B.editor,
    "commandCenter.activeBackground": B.hover,
    "commandCenter.border": B.transparent,
    "commandCenter.inactiveForeground": F.faint,
    "commandCenter.inactiveBorder": B.transparent,
    "commandCenter.activeBorder": B.transparent,
    "commandCenter.debuggingBackground": withAlpha(B.plum, 0.88),

    "notificationCenter.border": B.transparent,
    "notificationCenterHeader.background": B.panel,
    "notificationCenterHeader.foreground": F.text,
    "notificationToast.border": B.transparent,
    "notifications.background": B.popup,
    "notifications.border": B.transparent,
    "notifications.foreground": F.text,
    "notificationsErrorIcon.foreground": F.clay,
    "notificationsInfoIcon.foreground": F.sky,
    "notificationsWarningIcon.foreground": F.sand,

    "quickInput.background": B.popup,
    "quickInput.foreground": F.text,
    "quickInputList.focusBackground": B.active,
    "quickInputList.focusForeground": F.text,
    "quickInputTitle.background": B.panel,
    "pickerGroup.border": B.transparent,
    "pickerGroup.foreground": F.muted,

    "settings.checkboxBackground": B.panel,
    "settings.checkboxBorder": B.transparent,
    "settings.dropdownBackground": B.panel,
    "settings.dropdownBorder": B.transparent,
    "settings.headerForeground": F.text,
    "settings.modifiedItemIndicator": F.sand,
    "settings.numberInputBackground": B.panel,
    "settings.numberInputBorder": B.transparent,
    "settings.rowHoverBackground": B.hover,
    "settings.sashBorder": B.transparent,
    "settings.textInputBackground": B.panel,
    "settings.textInputBorder": B.transparent,

    "breadcrumb.background": B.editor,
    "breadcrumb.focusForeground": F.text,
    "breadcrumb.foreground": F.faint,
    "breadcrumb.activeSelectionForeground": F.text,
    "breadcrumbPicker.background": B.popup,

    "peekView.border": B.transparent,
    "peekViewEditor.matchHighlightBackground": B.sky,
    "peekViewResult.fileForeground": F.text,
    "peekViewResult.lineForeground": F.muted,
    "peekViewResult.matchHighlightBackground": B.sky,
    "peekViewResult.selectionBackground": B.active,
    "peekViewResult.selectionForeground": F.text,
    "peekViewTitle.background": B.popup,
    "peekViewTitleDescription.foreground": F.muted,
    "peekViewTitleLabel.foreground": F.text,

    "gitDecoration.addedResourceForeground": F.moss,
    "gitDecoration.conflictingResourceForeground": F.sand,
    "gitDecoration.deletedResourceForeground": F.clay,
    "gitDecoration.ignoredResourceForeground": F.faint,
    "gitDecoration.modifiedResourceForeground": F.sky,
    "gitDecoration.renamedResourceForeground": F.moss,
    "gitDecoration.stageDeletedResourceForeground": F.clay,
    "gitDecoration.stageModifiedResourceForeground": F.sky,
    "gitDecoration.submoduleResourceForeground": F.sky,
    "gitDecoration.untrackedResourceForeground": F.moss,

    "scmGraph.foreground1": F.sand,
    "scmGraph.foreground2": F.clay,
    "scmGraph.foreground3": F.ember,
    "scmGraph.foreground4": F.moss,
    "scmGraph.foreground5": F.plum,
    "scmGraph.historyItemBaseRefColor": F.ember,
    "scmGraph.historyItemHoverAdditionsForeground": F.moss,
    "scmGraph.historyItemHoverDefaultLabelBackground": B.active,
    "scmGraph.historyItemHoverDefaultLabelForeground": F.text,
    "scmGraph.historyItemHoverDeletionsForeground": F.clay,
    "scmGraph.historyItemHoverLabelForeground": B.editor,
    "scmGraph.historyItemRefColor": F.sky,
    "scmGraph.historyItemRemoteRefColor": F.plum,

    "minimap.findMatchHighlight": highlight,
    "minimap.selectionHighlight": highlight,
    "minimap.errorHighlight": F.clay,
    "minimap.warningHighlight": F.sand,
    "minimap.infoHighlight": F.sky,
    "minimap.foregroundOpacity": B.minimap,
    "minimapGutter.addedBackground": B.moss,
    "minimapGutter.deletedBackground": B.clay,
    "minimapGutter.modifiedBackground": B.sky,
    "minimapSlider.activeBackground": F.muted,
    "minimapSlider.background": B.guide,
    "minimapSlider.hoverBackground": F.faint,

    "scrollbarSlider.activeBackground": withAlpha(F.muted, 0.84),
    "scrollbarSlider.background": withAlpha(B.guide, 0.62),
    "scrollbarSlider.hoverBackground": withAlpha(F.faint, 0.72),

    "charts.blue": F.sky,
    "charts.foreground": F.text,
    "charts.green": F.moss,
    "charts.lines": B.transparent,
    "charts.orange": F.ember,
    "charts.purple": F.plum,
    "charts.red": F.clay,
    "charts.yellow": F.sand,

    "testing.iconErrored": F.clay,
    "testing.iconFailed": F.clay,
    "testing.iconPassed": F.moss,
    "testing.iconQueued": F.muted,
    "testing.iconSkipped": F.faint,
    "testing.iconUnset": F.faint,

    "welcomePage.tileBackground": B.panel,
    "welcomePage.tileHoverBackground": B.hover,
    "welcomePage.tileBorder": B.transparent,
  };
};

const createBorderedWorkbenchColors = (C: Palette): Theme["colors"] => {
  const divider = C.border.divider;

  return {
    ...createWorkbenchColors(C),

    "textBlockQuote.border": divider,
    "textSeparator.foreground": divider,

    "activityBar.border": divider,
    "sideBar.border": divider,
    "sideBarSectionHeader.border": divider,

    "editorGroup.border": divider,
    "editorGroupHeader.tabsBorder": divider,
    "editorGroupHeader.border": divider,
    "tab.border": divider,

    "diffEditor.border": divider,
    "panel.border": divider,
    "terminal.border": divider,
    "debugToolBar.border": divider,

    "statusBar.border": divider,
    "titleBar.border": divider,

    "menu.border": divider,
    "menu.separatorBackground": divider,

    "notificationCenter.border": divider,
    "notificationToast.border": divider,
    "notifications.border": divider,

    "pickerGroup.border": divider,
    "settings.sashBorder": divider,

    "peekView.border": divider,
    "welcomePage.tileBorder": divider,
  };
};

type ThemeConfig = {
  fileName: string;
  name: string;
  type: Theme["type"];
  palette: Palette;
  bordered?: boolean;
};

const token = (
  name: string,
  scope: TokenRule["scope"],
  foreground: Hex,
): TokenRule => ({
  name,
  scope,
  settings: { foreground },
});

const createTokenColors = (F: FontPalette): TokenRule[] => [
  token(
    "Source text",
    ["source", "meta.embedded", "text.html.markdown", "meta.jsx.children"],
    F.text,
  ),
  token("Comments", ["comment", "punctuation.definition.comment"], F.faint),
  token(
    "Documentation comments",
    [
      "comment.block.documentation",
      "storage.type.class.jsdoc",
      "entity.name.type.instance.jsdoc",
    ],
    F.faint,
  ),
  token(
    "Keywords and control flow",
    [
      "keyword",
      "keyword.control",
      "keyword.operator.expression",
      "storage.modifier",
    ],
    F.ember,
  ),
  token(
    "Imports and exports",
    [
      "keyword.control.import",
      "keyword.control.export",
      "storage.modifier.async",
      "keyword.control.from",
    ],
    F.ember,
  ),
  token(
    "Declaration keywords",
    [
      "storage.type",
      "storage.type.function",
      "storage.type.class",
      "storage.type.interface",
      "storage.type.type",
    ],
    F.sand,
  ),
  token(
    "Operators",
    [
      "keyword.operator",
      "punctuation.accessor",
      "punctuation.separator.key-value",
      "keyword.operator.type",
    ],
    F.muted,
  ),
  token("Strings", ["string", "constant.other.symbol"], F.moss),
  token(
    "Template strings",
    ["string.template", "punctuation.definition.template-expression"],
    F.moss,
  ),
  token(
    "Regular expressions",
    ["string.regexp", "constant.character.escape"],
    F.moss,
  ),
  token(
    "Numbers and constants",
    [
      "constant.numeric",
      "constant.language",
      "constant.character",
      "constant.other.enum",
    ],
    F.sand,
  ),
  token(
    "Booleans and nullish values",
    [
      "constant.language.boolean",
      "constant.language.null",
      "constant.language.undefined",
    ],
    F.sand,
  ),
  token(
    "Functions",
    [
      "entity.name.function",
      "support.function",
      "variable.function",
      "support.function.console",
    ],
    F.sky,
  ),
  token(
    "Methods",
    ["entity.name.function.member", "support.function.dom"],
    F.sky,
  ),
  token(
    "Classes and constructors",
    [
      "entity.name.type.class",
      "entity.name.class",
      "support.class",
      "support.type",
    ],
    F.plum,
  ),
  token(
    "Interfaces, aliases, and type parameters",
    [
      "entity.name.type.interface",
      "entity.name.type.alias",
      "entity.name.type",
      "entity.name.type.module",
      "entity.name.type.namespace",
      "support.type.primitive",
    ],
    F.plum,
  ),
  token(
    "Object keys and properties",
    [
      "meta.object-literal.key",
      "support.type.property-name",
      "variable.other.property",
      "variable.other.member",
      "meta.property.object",
      "support.variable.property",
    ],
    F.text,
  ),
  token(
    "Parameters",
    ["variable.parameter", "entity.name.variable.parameter"],
    F.text,
  ),
  token(
    "Variables",
    [
      "variable",
      "variable.other.readwrite",
      "variable.other.constant",
      "entity.name.variable",
      "variable.language.this",
    ],
    F.text,
  ),
  token(
    "Decorators and annotations",
    [
      "meta.decorator",
      "entity.name.function.decorator",
      "punctuation.decorator",
    ],
    F.plum,
  ),
  token(
    "JSX components",
    ["entity.name.tag.tsx", "support.class.component.tsx"],
    F.plum,
  ),
  token("JSX attributes", ["entity.other.attribute-name"], F.sand),
  token(
    "Tag punctuation",
    [
      "punctuation.definition.tag",
      "punctuation.definition.tag.begin",
      "punctuation.definition.tag.end",
    ],
    F.muted,
  ),
  token("HTML and XML tags", ["entity.name.tag"], F.sky),
  token(
    "CSS selectors",
    [
      "entity.other.attribute-name.class.css",
      "entity.other.attribute-name.id.css",
      "entity.name.tag.css",
    ],
    F.moss,
  ),
  token(
    "CSS properties",
    [
      "support.type.property-name.css",
      "support.type.vendored.property-name.css",
    ],
    F.text,
  ),
  token(
    "Markdown headings",
    ["markup.heading", "entity.name.section.markdown"],
    F.ember,
  ),
  token(
    "Markdown links",
    ["markup.underline.link", "string.other.link"],
    F.sky,
  ),
  token("Markup emphasis", ["markup.italic"], F.text),
  token("Markup bold", ["markup.bold"], F.text),
  token(
    "Inserted content",
    ["markup.inserted", "meta.diff.header.to-file"],
    F.moss,
  ),
  token(
    "Deleted content",
    ["markup.deleted", "meta.diff.header.from-file"],
    F.clay,
  ),
  token("Changed content", ["markup.changed"], F.sand),
  token("Invalid", ["invalid", "invalid.illegal"], F.clay),
  token(
    "Punctuation",
    ["punctuation", "meta.brace", "punctuation.definition.block"],
    F.muted,
  ),
];

const createSemanticTokenColors = (
  F: FontPalette,
): Theme["semanticTokenColors"] => ({
  namespace: F.sky,
  type: F.plum,
  class: F.plum,
  enum: F.plum,
  interface: F.plum,
  struct: F.plum,
  typeParameter: F.sand,
  parameter: F.text,
  variable: F.text,
  property: F.text,
  enumMember: F.sand,
  event: F.moss,
  function: F.sky,
  method: F.sky,
  macro: F.sand,
  keyword: F.ember,
  modifier: F.ember,
  comment: F.faint,
  string: F.moss,
  number: F.sand,
  regexp: F.moss,
  operator: F.muted,
  decorator: F.plum,
  "variable.readonly": F.text,
  "variable.declaration": F.text,
  "variable.readonly.declaration": F.text,
  "property.readonly": F.text,
  "property.declaration": F.text,
  "parameter.declaration": F.text,
  "typeParameter.declaration": F.sand,
  "function.declaration": F.sky,
  "method.declaration": F.sky,
  "class.declaration": F.plum,
  "interface.declaration": F.plum,
  "type.declaration": F.plum,
  "enum.declaration": F.plum,
  "*.deprecated": F.faint,
});

const assertHex = (value: string, path: string) => {
  if (!/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(value)) {
    throw new Error(`${path} must be a 6- or 8-digit hex color, got ${value}`);
  }
};

const hexToRgb = (value: Hex): { red: number; green: number; blue: number } => {
  const rgb = stripHash(value).slice(0, 6);

  return {
    red: Number.parseInt(rgb.slice(0, 2), 16) / 255,
    green: Number.parseInt(rgb.slice(2, 4), 16) / 255,
    blue: Number.parseInt(rgb.slice(4, 6), 16) / 255,
  };
};

const srgbToRelativeLuminance = (value: number) =>
  value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;

const relativeLuminance = (value: Hex) => {
  const { red, green, blue } = hexToRgb(value);

  return (
    0.2126 * srgbToRelativeLuminance(red) +
    0.7152 * srgbToRelativeLuminance(green) +
    0.0722 * srgbToRelativeLuminance(blue)
  );
};

const contrastRatio = (foreground: Hex, background: Hex) => {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  const light = Math.max(foregroundLuminance, backgroundLuminance);
  const dark = Math.min(foregroundLuminance, backgroundLuminance);

  return (light + 0.05) / (dark + 0.05);
};

const hexToOklab = (value: Hex): { l: number; a: number; b: number } => {
  const { red, green, blue } = hexToRgb(value);
  const linearRed = srgbToRelativeLuminance(red);
  const linearGreen = srgbToRelativeLuminance(green);
  const linearBlue = srgbToRelativeLuminance(blue);

  const long = Math.cbrt(
    0.4122214708 * linearRed +
      0.5363325363 * linearGreen +
      0.0514459929 * linearBlue,
  );
  const medium = Math.cbrt(
    0.2119034982 * linearRed +
      0.6806995451 * linearGreen +
      0.1073969566 * linearBlue,
  );
  const short = Math.cbrt(
    0.0883024619 * linearRed +
      0.2817188376 * linearGreen +
      0.6299787005 * linearBlue,
  );

  return {
    l: 0.2104542553 * long + 0.793617785 * medium - 0.0040720468 * short,
    a: 1.9779984951 * long - 2.428592205 * medium + 0.4505937099 * short,
    b: 0.0259040371 * long + 0.7827717662 * medium - 0.808675766 * short,
  };
};

const oklabDistance = (left: Hex, right: Hex) => {
  const a = hexToOklab(left);
  const b = hexToOklab(right);

  return Math.hypot(a.l - b.l, a.a - b.a, a.b - b.b);
};

const colorSettingKeys = new Set(["foreground", "background"]);
const visibleAlphaWorkbenchColors = new Set([
  "minimap.foregroundOpacity",
  "scrollbarSlider.activeBackground",
  "scrollbarSlider.background",
  "scrollbarSlider.hoverBackground",
  "widget.shadow",
]);
const transparentWorkbenchColors = new Set([
  "editor.lineHighlightBackground",
  "editor.selectionHighlightBackground",
  "editor.inactiveSelectionBackground",
  "editor.wordHighlightBackground",
  "editor.wordHighlightStrongBackground",
  "editor.wordHighlightTextBackground",
  "editor.findMatchHighlightBackground",
  "editor.findRangeHighlightBackground",
  "editor.hoverHighlightBackground",
  "editor.rangeHighlightBackground",
  "editor.symbolHighlightBackground",
  "editor.foldBackground",
  "editorOverviewRuler.findMatchForeground",
  "editorOverviewRuler.rangeHighlightForeground",
  "editorOverviewRuler.selectionHighlightForeground",
  "editorOverviewRuler.wordHighlightForeground",
  "editorOverviewRuler.wordHighlightStrongForeground",
  "editorError.background",
  "editorWarning.background",
  "editorInfo.background",
  "diffEditor.insertedTextBackground",
  "diffEditor.insertedLineBackground",
  "diffEditor.removedTextBackground",
  "diffEditor.removedLineBackground",
  "commandCenter.debuggingBackground",
  "minimap.findMatchHighlight",
  "minimap.selectionHighlight",
]);
const borderlessWorkbenchColorPattern = /(?:border|separator|^charts\.lines$)/i;
const transparentWorkbenchColorPattern =
  /^#(?:[0-9a-fA-F]{3}[0-9a-eA-E]|[0-9a-fA-F]{6}(?![fF]{2})[0-9a-fA-F]{2})$/;
const borderedWorkbenchColors = new Set([
  "textBlockQuote.border",
  "textSeparator.foreground",
  "activityBar.border",
  "sideBar.border",
  "sideBarSectionHeader.border",
  "editorGroup.border",
  "editorGroupHeader.tabsBorder",
  "editorGroupHeader.border",
  "tab.border",
  "diffEditor.border",
  "panel.border",
  "terminal.border",
  "debugToolBar.border",
  "statusBar.border",
  "titleBar.border",
  "menu.border",
  "menu.separatorBackground",
  "notificationCenter.border",
  "notificationToast.border",
  "notifications.border",
  "pickerGroup.border",
  "settings.sashBorder",
  "peekView.border",
  "welcomePage.tileBorder",
]);
const minimumEditorTextContrast = 4.5;
const minimumBadgeTextContrast = 4.5;
const minimumSyntaxRoleDistance = 0.09;
const decorativeSemanticTokens = new Set(["*.deprecated"]);
const usesVisibleAlpha = (value: Hex) =>
  stripHash(value).length === 8 && !value.endsWith("00");
const isSingleWordPaletteProperty = (value: string) => /^[a-z]+$/.test(value);

const assertSingleWordPaletteProperties = (
  name: string,
  palette: Record<string, unknown>,
) => {
  const invalid = Object.keys(palette).filter(
    (id) => !isSingleWordPaletteProperty(id),
  );
  if (invalid.length) {
    throw new Error(
      `${name} palette properties must be single lowercase words: ${invalid.join(", ")}`,
    );
  }
};

const assertSyntaxColorSeparation = (palette: FontPalette) => {
  const syntaxRoles = {
    comment: palette.faint,
    declaration: palette.sand,
    function: palette.sky,
    invalid: palette.clay,
    keyword: palette.ember,
    operator: palette.muted,
    string: palette.moss,
    type: palette.plum,
  } as const satisfies Record<string, Hex>;
  const entries = Object.entries(syntaxRoles);

  for (const [leftIndex, [leftId, leftColor]] of entries.entries()) {
    for (const [rightId, rightColor] of entries.slice(leftIndex + 1)) {
      const distance = oklabDistance(leftColor, rightColor);
      if (distance < minimumSyntaxRoleDistance) {
        throw new Error(
          `Syntax colors ${leftId} and ${rightId} are too similar: OKLab distance ${distance.toFixed(3)} is below ${minimumSyntaxRoleDistance}`,
        );
      }
    }
  }
};

const assertThemeIntegrity = (
  theme: Theme,
  palette: Palette,
  fontPalette: FontPalette,
  options: { allowBorders: boolean },
) => {
  const B = palette.background;
  assertSyntaxColorSeparation(fontPalette);

  for (const [id, value] of Object.entries(theme.colors)) {
    assertHex(value, `colors.${id}`);
    if (
      borderlessWorkbenchColorPattern.test(id) &&
      !options.allowBorders &&
      value !== B.transparent
    ) {
      throw new Error(
        `colors.${id} must be transparent because visible borders are disabled`,
      );
    }
    if (
      borderlessWorkbenchColorPattern.test(id) &&
      options.allowBorders &&
      value !== B.transparent &&
      !borderedWorkbenchColors.has(id)
    ) {
      throw new Error(
        `colors.${id} has a visible border color but is not in the bordered theme allow-list`,
      );
    }
    if (
      transparentWorkbenchColors.has(id) &&
      value !== B.transparent &&
      !transparentWorkbenchColorPattern.test(value)
    ) {
      throw new Error(
        `colors.${id} must be transparent because VS Code's color theme schema requires it`,
      );
    }
    if (
      usesVisibleAlpha(value) &&
      !visibleAlphaWorkbenchColors.has(id) &&
      !transparentWorkbenchColors.has(id)
    ) {
      throw new Error(
        `colors.${id} uses visible alpha without being allow-listed`,
      );
    }
  }
  if (options.allowBorders) {
    const divider = palette.border.divider;
    const visibleBorderColors = new Set(
      Object.entries(theme.colors)
        .filter(
          ([id, value]) =>
            borderedWorkbenchColors.has(id) && value !== B.transparent,
        )
        .map(([, value]) => value),
    );

    if (visibleBorderColors.size !== 1 || !visibleBorderColors.has(divider)) {
      throw new Error(
        `Bordered theme must use only the divider border color ${divider}`,
      );
    }
    if (relativeLuminance(divider) <= relativeLuminance(B.editor)) {
      throw new Error(
        `Border divider ${divider} must be lighter than editor background ${B.editor}`,
      );
    }
    if (relativeLuminance(divider) <= relativeLuminance(B.popup)) {
      throw new Error(
        `Border divider ${divider} must be visibly lighter than popup background ${B.popup}`,
      );
    }
    if (relativeLuminance(divider) >= relativeLuminance(B.hover)) {
      throw new Error(
        `Border divider ${divider} must stay subtler than hover background ${B.hover}`,
      );
    }
  }
  theme.tokenColors.forEach((rule, index) => {
    for (const key of Object.keys(rule.settings)) {
      if (!colorSettingKeys.has(key)) {
        throw new Error(
          `tokenColors[${index}].settings.${key} is not a color setting`,
        );
      }
    }
    if (rule.settings.foreground)
      assertHex(rule.settings.foreground, `tokenColors[${index}].foreground`);
    if (rule.settings.background)
      assertHex(rule.settings.background, `tokenColors[${index}].background`);
    if (rule.settings.foreground) {
      const ratio = contrastRatio(rule.settings.foreground, B.editor);
      if (ratio < minimumEditorTextContrast) {
        throw new Error(
          `tokenColors[${index}] "${rule.name}" contrast ${ratio.toFixed(2)} is below ${minimumEditorTextContrast}`,
        );
      }
    }
  });
  for (const [id, value] of Object.entries(theme.semanticTokenColors)) {
    assertHex(value, `semanticTokenColors.${id}`);
    if (decorativeSemanticTokens.has(id)) continue;

    const ratio = contrastRatio(value, B.editor);
    if (ratio < minimumEditorTextContrast) {
      throw new Error(
        `semanticTokenColors.${id} contrast ${ratio.toFixed(2)} is below ${minimumEditorTextContrast}`,
      );
    }
  }

  const editorSurfaceDrift = editorSurfaceIds.filter(
    (id) => theme.colors[id] !== B.editor,
  );
  const editorUnderlayDrift = editorUnderlayIds.filter(
    (id) => theme.colors[id] !== B.editor,
  );
  if (editorSurfaceDrift.length || editorUnderlayDrift.length) {
    throw new Error(
      `Editor surface drift. Painted: ${editorSurfaceDrift.join(", ") || "none"}. Underlay: ${editorUnderlayDrift.join(", ") || "none"}.`,
    );
  }

  const scmGraphBadgeForeground =
    theme.colors["scmGraph.historyItemHoverLabelForeground"];
  const scmGraphBadgeBackgroundIds = [
    "scmGraph.foreground1",
    "scmGraph.foreground2",
    "scmGraph.foreground3",
    "scmGraph.foreground4",
    "scmGraph.foreground5",
    "scmGraph.historyItemBaseRefColor",
    "scmGraph.historyItemRefColor",
    "scmGraph.historyItemRemoteRefColor",
  ] as const;
  for (const id of scmGraphBadgeBackgroundIds) {
    const ratio = contrastRatio(scmGraphBadgeForeground, theme.colors[id]);
    if (ratio < minimumBadgeTextContrast) {
      throw new Error(
        `SCM graph badge foreground contrast against ${id} is ${ratio.toFixed(2)}, below ${minimumBadgeTextContrast}`,
      );
    }
  }
};

const createTheme = (
  name: string,
  type: Theme["type"],
  palette: Palette,
  fontPalette: FontPalette,
  bordered = false,
): Theme => ({
  $schema: "vscode://schemas/color-theme",
  name,
  type,
  semanticHighlighting: true,
  colors: bordered
    ? createBorderedWorkbenchColors(palette)
    : createWorkbenchColors(palette),
  tokenColors: createTokenColors(fontPalette),
  semanticTokenColors: createSemanticTokenColors(fontPalette),
});

const __dirname = dirname(fileURLToPath(import.meta.url));
assertSingleWordPaletteProperties("background", JACK_BACKGROUND_PALETTE);
assertSingleWordPaletteProperties("font", JACK_FONT_PALETTE);
assertSingleWordPaletteProperties("border", JACK_BORDER_PALETTE);
const JACK_PALETTE = createPalette(
  JACK_BACKGROUND_PALETTE,
  JACK_FONT_PALETTE,
  JACK_BORDER_PALETTE,
);
const JACK_FONT_COLORS = createColorMap(JACK_FONT_PALETTE);
const themes = [
  {
    fileName: "jacks-theme-color-theme.json",
    name: "Jack's Theme",
    type: "dark",
    palette: JACK_PALETTE,
    bordered: false,
  },
  {
    fileName: "jacks-theme-bordered-color-theme.json",
    name: "Jack's Theme Bordered",
    type: "dark",
    palette: JACK_PALETTE,
    bordered: true,
  },
] as const satisfies readonly ThemeConfig[];

for (const { fileName, name, type, palette, bordered = false } of themes) {
  const theme = createTheme(name, type, palette, JACK_FONT_COLORS, bordered);
  assertThemeIntegrity(theme, palette, JACK_FONT_COLORS, {
    allowBorders: bordered,
  });
  const outputPath = join(__dirname, "..", "themes", fileName);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, JSON.stringify(theme, null, 2) + "\n");
  console.log(
    `Generated ${outputPath} with ${Object.keys(theme.colors).length} workbench colors`,
  );
}

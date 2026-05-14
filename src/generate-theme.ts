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

const JACK_COLOR_PALETTE = {
  editor: "oklch(13.98% 0 0)",
  panel: "oklch(15.40% 0 0)",
  popup: "oklch(15.40% 0 0)",
  hover: "oklch(18.80% 0 0)",
  active: "oklch(20.60% 0 0)",
  black: "oklch(0% 0 0)",

  textBright: "oklch(95.51% 0 0)",
  text: "oklch(83.28% 0 0)",
  textMuted: "oklch(64.01% 0 0)",
  textFaint: "oklch(48.55% 0 0)",

  amber: "oklch(78.20% 0.1150 72.00)",
  gold: "oklch(78.20% 0.1150 72.00)",
  sage: "oklch(75.60% 0.0820 148.00)",
  smokeBlue: "oklch(66.80% 0.0400 250.00)",
  aqua: "oklch(74.60% 0.0750 225.00)",
  blue: "oklch(74.60% 0.0750 225.00)",
  violet: "oklch(74.60% 0.0750 225.00)",
  rose: "oklch(67.80% 0.1600 24.00)",
  red: "oklch(67.80% 0.1600 24.00)",
  coral: "oklch(78.20% 0.1150 72.00)"
} as const satisfies Record<string, Oklch>;

const JACK_ALPHA_PALETTE = {
  a00: 0,
  a04: 0.03,
  a08: 0.05,
  a12: 0.07,
  a16: 0.1,
  a24: 0.16,
  a32: 0.22,
  a48: 0.36,
  a84: 0.7
} as const;

type AlphaPalette = typeof JACK_ALPHA_PALETTE;
type Alpha = AlphaPalette[keyof AlphaPalette];
type Palette = Record<keyof typeof JACK_COLOR_PALETTE, Hex> & {
  border: Hex;
  borderStrong: Hex;
  transparent: Hex;
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const stripHash = (value: Hex) => value.slice(1);
const toByte = (value: number) => Math.round(clamp01(value) * 255)
  .toString(16)
  .padStart(2, "0");
const withAlpha = (value: Hex, opacity: Alpha): Hex => `#${stripHash(value).slice(0, 6)}${toByte(opacity)}`;
const keys = (ids: readonly string[], value: Hex): Record<string, Hex> => Object.fromEntries(ids.map((id) => [id, value]));

const parseOklch = (value: Oklch): { l: number; c: number; h: number } => {
  const match = /^oklch\((\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\)$/.exec(value);
  if (!match) throw new Error(`Invalid OKLCH color: ${value}`);

  return {
    l: Number(match[1]) / 100,
    c: Number(match[2]),
    h: Number(match[3])
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

  const red = linearToSrgb(4.0767416621 * lCone - 3.3077115913 * mCone + 0.2309699292 * sCone);
  const green = linearToSrgb(-1.2684380046 * lCone + 2.6097574011 * mCone - 0.3413193965 * sCone);
  const blue = linearToSrgb(-0.0041960863 * lCone - 0.7034186147 * mCone + 1.707614701 * sCone);

  return `#${toByte(red)}${toByte(green)}${toByte(blue)}`;
};

const createPalette = (colors: typeof JACK_COLOR_PALETTE, alphas: AlphaPalette): Palette => {
  const converted = Object.fromEntries(
    Object.entries(colors).map(([id, value]) => [id, oklchToHex(value)])
  ) as Record<keyof typeof JACK_COLOR_PALETTE, Hex>;
  const transparent = withAlpha(converted.black, alphas.a00);

  return {
    ...converted,
    border: transparent,
    borderStrong: transparent,
    transparent
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
  "walkThrough.embeddedEditorBackground"
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
  "welcomePage.background"
] as const;

const transparentEditorOverlayIds = [
  "editor.inactiveLineHighlightBackground",
  "editor.lineHighlightBackground",
  "editor.lineHighlightBorder",
  "editor.rangeHighlightBorder",
  "editor.selectionHighlightBorder",
  "editor.symbolHighlightBorder",
  "editor.wordHighlightBorder",
  "editor.wordHighlightStrongBorder",
  "editor.wordHighlightTextBorder",
  "scrollbar.background",
  "scrollbar.shadow"
] as const;

const createWorkbenchColors = (C: Palette, A: AlphaPalette): Theme["colors"] => ({
  ...keys(editorSurfaceIds, C.editor),
  ...keys(editorUnderlayIds, C.editor),
  ...keys(transparentEditorOverlayIds, C.transparent),

  focusBorder: C.transparent,
  foreground: C.text,
  disabledForeground: withAlpha(C.textMuted, A.a48),
  descriptionForeground: C.textMuted,
  errorForeground: C.red,
  "icon.foreground": C.textMuted,
  "selection.background": withAlpha(C.amber, A.a16),
  "sash.hoverBorder": C.transparent,
  "widget.shadow": withAlpha(C.black, A.a32),

  "window.activeBorder": C.transparent,
  "window.inactiveBorder": C.transparent,

  "textBlockQuote.background": C.panel,
  "textBlockQuote.border": C.transparent,
  "textCodeBlock.background": C.popup,
  "textLink.activeForeground": C.gold,
  "textLink.foreground": C.amber,
  "textPreformat.background": C.popup,
  "textPreformat.foreground": C.text,
  "textSeparator.foreground": C.borderStrong,

  "toolbar.hoverBackground": withAlpha(C.textBright, A.a04),
  "toolbar.hoverOutline": C.transparent,
  "toolbar.activeBackground": withAlpha(C.textBright, A.a08),

  "button.background": C.amber,
  "button.foreground": C.editor,
  "button.hoverBackground": C.amber,
  "button.secondaryBackground": C.active,
  "button.secondaryForeground": C.textBright,
  "button.secondaryHoverBackground": C.hover,
  "checkbox.background": C.panel,
  "checkbox.border": C.borderStrong,
  "checkbox.foreground": C.amber,
  "dropdown.background": C.popup,
  "dropdown.border": C.borderStrong,
  "dropdown.foreground": C.text,
  "dropdown.listBackground": C.popup,
  "input.background": C.panel,
  "input.border": C.borderStrong,
  "input.foreground": C.textBright,
  "input.placeholderForeground": C.textFaint,
  "inputOption.activeBackground": withAlpha(C.textBright, A.a08),
  "inputOption.activeBorder": C.transparent,
  "inputOption.activeForeground": C.textBright,
  "inputOption.hoverBackground": withAlpha(C.textBright, A.a04),
  "inputValidation.errorBackground": withAlpha(C.red, A.a08),
  "inputValidation.errorBorder": C.red,
  "inputValidation.infoBackground": withAlpha(C.blue, A.a08),
  "inputValidation.infoBorder": C.blue,
  "inputValidation.warningBackground": withAlpha(C.gold, A.a08),
  "inputValidation.warningBorder": C.gold,

  "badge.background": C.active,
  "badge.foreground": C.textBright,
  "progressBar.background": C.amber,

  "list.activeSelectionBackground": withAlpha(C.textBright, A.a08),
  "list.activeSelectionForeground": C.textBright,
  "list.dropBackground": withAlpha(C.textBright, A.a08),
  "list.errorForeground": C.red,
  "list.focusBackground": withAlpha(C.textBright, A.a08),
  "list.focusForeground": C.textBright,
  "list.highlightForeground": C.amber,
  "list.hoverBackground": withAlpha(C.textBright, A.a04),
  "list.inactiveFocusBackground": withAlpha(C.textBright, A.a08),
  "list.inactiveSelectionBackground": withAlpha(C.textBright, A.a08),
  "list.invalidItemForeground": C.coral,
  "list.warningForeground": C.gold,

  "activityBar.background": C.editor,
  "activityBar.border": C.border,
  "activityBar.foreground": C.text,
  "activityBar.inactiveForeground": C.textFaint,
  "activityBar.activeBackground": withAlpha(C.textBright, A.a04),
  "activityBar.activeBorder": C.transparent,
  "activityBarBadge.background": C.amber,
  "activityBarBadge.foreground": C.editor,
  "activityBarTop.background": C.editor,
  "activityBarTop.foreground": C.text,
  "activityBarTop.inactiveForeground": C.textFaint,
  "activityBarTop.activeBackground": withAlpha(C.textBright, A.a04),
  "activityBarTop.activeBorder": C.transparent,

  "sideBar.background": C.editor,
  "sideBar.border": C.border,
  "sideBar.foreground": C.text,
  "sideBarTitle.background": C.editor,
  "sideBarTitle.foreground": C.textBright,
  "sideBarSectionHeader.background": C.editor,
  "sideBarSectionHeader.border": C.border,
  "sideBarSectionHeader.foreground": C.text,
  "sideBarStickyScroll.background": C.editor,

  "editorGroup.border": C.border,
  "editorGroup.dropBackground": withAlpha(C.textBright, A.a08),
  "editorGroupHeader.tabsBorder": C.border,
  "editorGroupHeader.border": C.border,
  "tab.activeBackground": C.editor,
  "tab.activeBorder": C.transparent,
  "tab.activeBorderTop": C.transparent,
  "tab.activeForeground": C.textBright,
  "tab.border": C.border,
  "tab.hoverBackground": withAlpha(C.textBright, A.a04),
  "tab.hoverForeground": C.textBright,
  "tab.inactiveBackground": C.editor,
  "tab.inactiveForeground": C.textFaint,
  "tab.unfocusedActiveForeground": C.text,
  "tab.unfocusedInactiveForeground": C.textFaint,

  "editor.foreground": C.text,
  "editorLineNumber.foreground": C.textFaint,
  "editorLineNumber.activeForeground": C.textMuted,
  "editorLineNumber.dimmedForeground": C.textFaint,
  "editorCursor.background": C.editor,
  "editorCursor.foreground": C.amber,
  "editor.selectionBackground": withAlpha(C.amber, A.a16),
  "editor.selectionForeground": C.textBright,
  "editor.selectionHighlightBackground": withAlpha(C.textBright, A.a08),
  "editor.inactiveSelectionBackground": withAlpha(C.textBright, A.a08),
  "editor.wordHighlightBackground": withAlpha(C.textBright, A.a08),
  "editor.wordHighlightStrongBackground": withAlpha(C.textBright, A.a12),
  "editor.wordHighlightTextBackground": withAlpha(C.textBright, A.a08),
  "editor.findMatchBackground": withAlpha(C.gold, A.a32),
  "editor.findMatchBorder": C.transparent,
  "editor.findMatchHighlightBackground": withAlpha(C.gold, A.a12),
  "editor.findRangeHighlightBackground": withAlpha(C.textBright, A.a08),
  "editor.hoverHighlightBackground": withAlpha(C.textBright, A.a04),
  "editor.linkedEditingBackground": withAlpha(C.textBright, A.a08),
  "editor.rangeHighlightBackground": withAlpha(C.textBright, A.a04),
  "editor.symbolHighlightBackground": withAlpha(C.textBright, A.a08),
  "editorWhitespace.foreground": withAlpha(C.textFaint, A.a24),
  "editorIndentGuide.background1": withAlpha(C.textFaint, A.a16),
  "editorIndentGuide.activeBackground1": withAlpha(C.textMuted, A.a32),
  "editorRuler.foreground": withAlpha(C.textFaint, A.a16),
  "editorCodeLens.foreground": C.textFaint,
  "editorLightBulb.foreground": C.gold,
  "editorLightBulbAutoFix.foreground": C.sage,
  "editorBracketMatch.background": withAlpha(C.textBright, A.a08),
  "editorBracketMatch.border": C.textMuted,
  "editorBracketHighlight.foreground1": C.textMuted,
  "editorBracketHighlight.foreground2": C.textMuted,
  "editorBracketHighlight.foreground3": C.textMuted,
  "editorBracketHighlight.foreground4": C.textMuted,
  "editorBracketHighlight.foreground5": C.textMuted,
  "editorBracketHighlight.foreground6": C.textMuted,
  "editorBracketHighlight.unexpectedBracket.foreground": C.red,
  "editorBracketPairGuide.background1": withAlpha(C.textFaint, A.a08),
  "editorBracketPairGuide.activeBackground1": withAlpha(C.textMuted, A.a24),
  "editorUnicodeHighlight.border": C.gold,
  "editorUnicodeHighlight.background": withAlpha(C.gold, A.a08),
  "editor.foldBackground": C.editor,
  "editor.inlineValuesBackground": C.editor,
  "editor.inlineValuesForeground": C.textMuted,

  "editorGutter.addedBackground": C.sage,
  "editorGutter.deletedBackground": C.red,
  "editorGutter.modifiedBackground": C.blue,
  "editorGutter.commentRangeForeground": C.smokeBlue,
  "editorOverviewRuler.addedForeground": withAlpha(C.sage, A.a84),
  "editorOverviewRuler.deletedForeground": withAlpha(C.red, A.a84),
  "editorOverviewRuler.modifiedForeground": withAlpha(C.blue, A.a84),
  "editorOverviewRuler.border": C.border,
  "editorOverviewRuler.errorForeground": C.red,
  "editorOverviewRuler.warningForeground": C.gold,
  "editorOverviewRuler.infoForeground": C.blue,
  "editorOverviewRuler.findMatchForeground": C.gold,
  "editorOverviewRuler.rangeHighlightForeground": withAlpha(C.textBright, A.a16),
  "editorOverviewRuler.selectionHighlightForeground": withAlpha(C.amber, A.a32),
  "editorOverviewRuler.wordHighlightForeground": withAlpha(C.textBright, A.a16),
  "editorOverviewRuler.wordHighlightStrongForeground": withAlpha(C.textBright, A.a24),
  "editorError.foreground": C.red,
  "editorError.border": withAlpha(C.red, A.a16),
  "editorError.background": C.transparent,
  "editorWarning.foreground": C.gold,
  "editorWarning.border": withAlpha(C.gold, A.a16),
  "editorWarning.background": C.transparent,
  "editorInfo.foreground": C.blue,
  "editorInfo.border": withAlpha(C.blue, A.a16),
  "editorInfo.background": C.transparent,
  "editorHint.foreground": C.sage,
  "editorHint.border": withAlpha(C.sage, A.a16),
  "problemsErrorIcon.foreground": C.red,
  "problemsWarningIcon.foreground": C.gold,
  "problemsInfoIcon.foreground": C.blue,

  "diffEditor.insertedTextBackground": withAlpha(C.sage, A.a08),
  "diffEditor.insertedLineBackground": C.transparent,
  "diffEditor.removedTextBackground": withAlpha(C.red, A.a08),
  "diffEditor.removedLineBackground": C.transparent,
  "diffEditor.border": C.border,
  "diffEditor.diagonalFill": withAlpha(C.textFaint, A.a16),
  "diffEditor.unchangedRegionBackground": C.panel,
  "diffEditor.unchangedRegionForeground": C.textFaint,
  "diffEditor.unchangedCodeBackground": C.editor,

  "panel.background": C.editor,
  "panel.border": C.border,
  "panelTitle.activeBorder": C.transparent,
  "panelTitle.activeForeground": C.textBright,
  "panelTitle.inactiveForeground": C.textFaint,
  "panelInput.border": C.borderStrong,

  "terminal.foreground": C.text,
  "terminal.ansiBlack": C.editor,
  "terminal.ansiBlue": C.blue,
  "terminal.ansiBrightBlack": C.textFaint,
  "terminal.ansiBrightBlue": C.blue,
  "terminal.ansiBrightCyan": C.aqua,
  "terminal.ansiBrightGreen": C.sage,
  "terminal.ansiBrightMagenta": C.violet,
  "terminal.ansiBrightRed": C.coral,
  "terminal.ansiBrightWhite": C.textBright,
  "terminal.ansiBrightYellow": C.gold,
  "terminal.ansiCyan": C.aqua,
  "terminal.ansiGreen": C.sage,
  "terminal.ansiMagenta": C.violet,
  "terminal.ansiRed": C.red,
  "terminal.ansiWhite": C.text,
  "terminal.ansiYellow": C.amber,
  "terminal.border": C.border,
  "terminalCursor.background": C.editor,
  "terminalCursor.foreground": C.amber,
  "terminal.selectionBackground": withAlpha(C.amber, A.a16),

  "statusBar.background": C.editor,
  "statusBar.border": C.border,
  "statusBar.foreground": C.text,
  "statusBar.debuggingBackground": C.amber,
  "statusBar.debuggingForeground": C.editor,
  "statusBar.noFolderBackground": C.editor,
  "statusBar.noFolderForeground": C.text,
  "statusBarItem.activeBackground": withAlpha(C.textBright, A.a12),
  "statusBarItem.hoverBackground": withAlpha(C.textBright, A.a08),
  "statusBarItem.prominentBackground": withAlpha(C.textBright, A.a08),
  "statusBarItem.prominentForeground": C.textBright,
  "statusBarItem.remoteBackground": C.amber,
  "statusBarItem.remoteForeground": C.editor,
  "statusBarItem.errorBackground": C.red,
  "statusBarItem.errorForeground": C.editor,
  "statusBarItem.warningBackground": C.gold,
  "statusBarItem.warningForeground": C.editor,

  "titleBar.activeBackground": C.editor,
  "titleBar.activeForeground": C.textBright,
  "titleBar.border": C.border,
  "titleBar.inactiveBackground": C.editor,
  "titleBar.inactiveForeground": C.textFaint,

  "menu.background": C.popup,
  "menu.border": C.borderStrong,
  "menu.foreground": C.text,
  "menu.selectionBackground": withAlpha(C.textBright, A.a08),
  "menu.selectionBorder": C.transparent,
  "menu.selectionForeground": C.textBright,
  "menu.separatorBackground": C.borderStrong,
  "menubar.selectionBackground": withAlpha(C.textBright, A.a08),
  "menubar.selectionBorder": C.transparent,
  "menubar.selectionForeground": C.textBright,

  "commandCenter.foreground": C.textMuted,
  "commandCenter.activeForeground": C.textBright,
  "commandCenter.background": C.editor,
  "commandCenter.activeBackground": withAlpha(C.textBright, A.a04),
  "commandCenter.border": C.transparent,
  "commandCenter.inactiveForeground": C.textFaint,
  "commandCenter.inactiveBorder": C.transparent,
  "commandCenter.activeBorder": C.transparent,
  "commandCenter.debuggingBackground": C.editor,

  "notificationCenter.border": C.borderStrong,
  "notificationCenterHeader.background": C.panel,
  "notificationCenterHeader.foreground": C.textBright,
  "notificationToast.border": C.borderStrong,
  "notifications.background": C.popup,
  "notifications.border": C.borderStrong,
  "notifications.foreground": C.text,
  "notificationsErrorIcon.foreground": C.red,
  "notificationsInfoIcon.foreground": C.blue,
  "notificationsWarningIcon.foreground": C.gold,

  "quickInput.background": C.popup,
  "quickInput.foreground": C.text,
  "quickInputList.focusBackground": withAlpha(C.textBright, A.a08),
  "quickInputList.focusForeground": C.textBright,
  "quickInputTitle.background": C.panel,
  "pickerGroup.border": C.borderStrong,
  "pickerGroup.foreground": C.textMuted,

  "settings.checkboxBackground": C.panel,
  "settings.checkboxBorder": C.borderStrong,
  "settings.dropdownBackground": C.panel,
  "settings.dropdownBorder": C.borderStrong,
  "settings.headerForeground": C.textBright,
  "settings.modifiedItemIndicator": C.amber,
  "settings.numberInputBackground": C.panel,
  "settings.numberInputBorder": C.borderStrong,
  "settings.rowHoverBackground": withAlpha(C.textBright, A.a04),
  "settings.sashBorder": C.border,
  "settings.textInputBackground": C.panel,
  "settings.textInputBorder": C.borderStrong,

  "breadcrumb.background": C.editor,
  "breadcrumb.focusForeground": C.textBright,
  "breadcrumb.foreground": C.textFaint,
  "breadcrumb.activeSelectionForeground": C.textBright,
  "breadcrumbPicker.background": C.popup,

  "peekView.border": C.transparent,
  "peekViewEditor.matchHighlightBackground": withAlpha(C.gold, A.a16),
  "peekViewResult.fileForeground": C.textBright,
  "peekViewResult.lineForeground": C.textMuted,
  "peekViewResult.matchHighlightBackground": withAlpha(C.gold, A.a12),
  "peekViewResult.selectionBackground": withAlpha(C.textBright, A.a08),
  "peekViewResult.selectionForeground": C.textBright,
  "peekViewTitle.background": C.popup,
  "peekViewTitleDescription.foreground": C.textMuted,
  "peekViewTitleLabel.foreground": C.textBright,

  "gitDecoration.addedResourceForeground": C.sage,
  "gitDecoration.conflictingResourceForeground": C.amber,
  "gitDecoration.deletedResourceForeground": C.red,
  "gitDecoration.ignoredResourceForeground": C.textFaint,
  "gitDecoration.modifiedResourceForeground": C.blue,
  "gitDecoration.renamedResourceForeground": C.sage,
  "gitDecoration.stageDeletedResourceForeground": C.red,
  "gitDecoration.stageModifiedResourceForeground": C.blue,
  "gitDecoration.submoduleResourceForeground": C.blue,
  "gitDecoration.untrackedResourceForeground": C.sage,

  "minimap.findMatchHighlight": C.gold,
  "minimap.selectionHighlight": withAlpha(C.amber, A.a32),
  "minimap.errorHighlight": C.red,
  "minimap.warningHighlight": C.gold,
  "minimap.infoHighlight": C.blue,
  "minimap.foregroundOpacity": withAlpha(C.black, A.a32),
  "minimapGutter.addedBackground": C.sage,
  "minimapGutter.deletedBackground": C.red,
  "minimapGutter.modifiedBackground": C.blue,
  "minimapSlider.activeBackground": withAlpha(C.textBright, A.a16),
  "minimapSlider.background": withAlpha(C.textBright, A.a08),
  "minimapSlider.hoverBackground": withAlpha(C.textBright, A.a08),

  "scrollbarSlider.activeBackground": withAlpha(C.textMuted, A.a24),
  "scrollbarSlider.background": withAlpha(C.textMuted, A.a12),
  "scrollbarSlider.hoverBackground": withAlpha(C.textMuted, A.a16),

  "charts.blue": C.blue,
  "charts.foreground": C.text,
  "charts.green": C.sage,
  "charts.lines": C.borderStrong,
  "charts.orange": C.amber,
  "charts.purple": C.violet,
  "charts.red": C.red,
  "charts.yellow": C.gold,

  "testing.iconErrored": C.red,
  "testing.iconFailed": C.red,
  "testing.iconPassed": C.sage,
  "testing.iconQueued": C.textMuted,
  "testing.iconSkipped": C.textFaint,
  "testing.iconUnset": C.textFaint,

  "welcomePage.buttonBackground": C.panel,
  "welcomePage.buttonHoverBackground": C.hover
});

type ThemeConfig = {
  fileName: string;
  name: string;
  type: Theme["type"];
  palette: Palette;
  alphaPalette: AlphaPalette;
};

const token = (name: string, scope: TokenRule["scope"], foreground: Hex): TokenRule => ({
  name,
  scope,
  settings: { foreground }
});

const createTokenColors = (C: Palette): TokenRule[] => [
  token("Source text", ["source", "meta.embedded", "text.html.markdown"], C.text),
  token("Comments", ["comment", "punctuation.definition.comment"], C.smokeBlue),
  token("Documentation comments", ["comment.block.documentation", "storage.type.class.jsdoc", "entity.name.type.instance.jsdoc"], C.smokeBlue),
  token("Keywords and control flow", ["keyword", "keyword.control", "keyword.operator.expression", "storage.modifier"], C.amber),
  token("Imports and exports", ["keyword.control.import", "keyword.control.export", "storage.modifier.async", "keyword.control.from"], C.amber),
  token("Storage and declarations", ["storage.type", "storage.type.function", "storage.type.class", "storage.type.interface", "storage.type.type"], C.amber),
  token("Operators", ["keyword.operator", "punctuation.accessor", "punctuation.separator.key-value", "keyword.operator.type"], C.textMuted),
  token("Strings", ["string", "constant.other.symbol"], C.sage),
  token("Template strings", ["string.template", "punctuation.definition.template-expression"], C.sage),
  token("Regular expressions", ["string.regexp", "constant.character.escape"], C.sage),
  token("Numbers and constants", ["constant.numeric", "constant.language", "constant.character", "variable.other.constant", "constant.other.enum"], C.amber),
  token("Booleans and nullish values", ["constant.language.boolean", "constant.language.null", "constant.language.undefined"], C.amber),
  token("Functions", ["entity.name.function", "support.function", "meta.function-call", "variable.function", "support.function.console"], C.blue),
  token("Methods", ["entity.name.function.member", "support.function.dom", "meta.method-call"], C.blue),
  token("Classes and constructors", ["entity.name.type.class", "entity.name.class", "support.class", "support.type"], C.blue),
  token("Interfaces, aliases, and type parameters", [
    "entity.name.type.interface",
    "entity.name.type.alias",
    "entity.name.type",
    "entity.name.type.module",
    "entity.name.type.namespace",
    "support.type.primitive",
    "meta.type.parameters",
    "meta.type.annotation"
  ], C.blue),
  token("Object keys and properties", [
    "meta.object-literal.key",
    "support.type.property-name",
    "variable.other.property",
    "variable.other.member",
    "meta.property.object",
    "support.variable.property"
  ], C.text),
  token("Parameters", ["variable.parameter", "meta.parameters", "entity.name.variable.parameter"], C.text),
  token("Variables", ["variable", "variable.other.readwrite", "entity.name.variable", "variable.language.this"], C.text),
  token("Decorators and annotations", ["meta.decorator", "entity.name.function.decorator", "punctuation.decorator"], C.amber),
  token("JSX components", ["entity.name.tag.tsx", "support.class.component.tsx"], C.blue),
  token("JSX attributes", ["entity.other.attribute-name"], C.text),
  token("Tag punctuation", ["punctuation.definition.tag", "punctuation.definition.tag.begin", "punctuation.definition.tag.end"], C.textMuted),
  token("HTML and XML tags", ["entity.name.tag", "meta.tag"], C.blue),
  token("CSS selectors", ["entity.other.attribute-name.class.css", "entity.other.attribute-name.id.css", "entity.name.tag.css"], C.blue),
  token("CSS properties", ["support.type.property-name.css", "support.type.vendored.property-name.css"], C.text),
  token("Markdown headings", ["markup.heading", "entity.name.section.markdown"], C.amber),
  token("Markdown links", ["markup.underline.link", "string.other.link"], C.blue),
  token("Markup emphasis", ["markup.italic"], C.text),
  token("Markup bold", ["markup.bold"], C.textBright),
  token("Inserted content", ["markup.inserted", "meta.diff.header.to-file"], C.sage),
  token("Deleted content", ["markup.deleted", "meta.diff.header.from-file"], C.red),
  token("Changed content", ["markup.changed"], C.amber),
  token("Invalid", ["invalid", "invalid.illegal"], C.red),
  token("Punctuation", ["punctuation", "meta.brace", "punctuation.definition.block"], C.textMuted)
];

const createSemanticTokenColors = (C: Palette): Theme["semanticTokenColors"] => ({
  namespace: C.blue,
  type: C.blue,
  class: C.blue,
  enum: C.blue,
  interface: C.blue,
  struct: C.blue,
  typeParameter: C.blue,
  parameter: C.text,
  variable: C.text,
  property: C.text,
  enumMember: C.amber,
  event: C.text,
  function: C.blue,
  method: C.blue,
  macro: C.amber,
  keyword: C.amber,
  modifier: C.amber,
  comment: C.smokeBlue,
  string: C.sage,
  number: C.amber,
  regexp: C.sage,
  operator: C.textMuted,
  decorator: C.amber,
  "variable.readonly": C.amber,
  "property.readonly": C.amber,
  "property.declaration": C.text,
  "parameter.declaration": C.text,
  "function.declaration": C.blue,
  "method.declaration": C.blue,
  "class.declaration": C.blue,
  "interface.declaration": C.blue,
  "type.declaration": C.blue,
  "enum.declaration": C.blue,
  "*.deprecated": C.textFaint
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
    blue: Number.parseInt(rgb.slice(4, 6), 16) / 255
  };
};

const srgbToRelativeLuminance = (value: number) =>
  value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;

const relativeLuminance = (value: Hex) => {
  const { red, green, blue } = hexToRgb(value);

  return 0.2126 * srgbToRelativeLuminance(red)
    + 0.7152 * srgbToRelativeLuminance(green)
    + 0.0722 * srgbToRelativeLuminance(blue);
};

const contrastRatio = (foreground: Hex, background: Hex) => {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  const light = Math.max(foregroundLuminance, backgroundLuminance);
  const dark = Math.min(foregroundLuminance, backgroundLuminance);

  return (light + 0.05) / (dark + 0.05);
};

const colorSettingKeys = new Set(["foreground", "background"]);
const minimumEditorTextContrast = 4.5;
const decorativeSemanticTokens = new Set(["*.deprecated"]);

const assertThemeIntegrity = (theme: Theme, palette: Palette) => {
  for (const [id, value] of Object.entries(theme.colors)) assertHex(value, `colors.${id}`);
  theme.tokenColors.forEach((rule, index) => {
    for (const key of Object.keys(rule.settings)) {
      if (!colorSettingKeys.has(key)) {
        throw new Error(`tokenColors[${index}].settings.${key} is not a color setting`);
      }
    }
    if (rule.settings.foreground) assertHex(rule.settings.foreground, `tokenColors[${index}].foreground`);
    if (rule.settings.background) assertHex(rule.settings.background, `tokenColors[${index}].background`);
    if (rule.settings.foreground) {
      const ratio = contrastRatio(rule.settings.foreground, palette.editor);
      if (ratio < minimumEditorTextContrast) {
        throw new Error(`tokenColors[${index}] "${rule.name}" contrast ${ratio.toFixed(2)} is below ${minimumEditorTextContrast}`);
      }
    }
  });
  for (const [id, value] of Object.entries(theme.semanticTokenColors)) {
    assertHex(value, `semanticTokenColors.${id}`);
    if (decorativeSemanticTokens.has(id)) continue;

    const ratio = contrastRatio(value, palette.editor);
    if (ratio < minimumEditorTextContrast) {
      throw new Error(`semanticTokenColors.${id} contrast ${ratio.toFixed(2)} is below ${minimumEditorTextContrast}`);
    }
  }

  const editorSurfaceDrift = editorSurfaceIds.filter((id) => theme.colors[id] !== palette.editor);
  const editorUnderlayDrift = editorUnderlayIds.filter((id) => theme.colors[id] !== palette.editor);
  if (editorSurfaceDrift.length || editorUnderlayDrift.length) {
    throw new Error(
      `Editor surface drift. Painted: ${editorSurfaceDrift.join(", ") || "none"}. Underlay: ${editorUnderlayDrift.join(", ") || "none"}.`
    );
  }
};

const createTheme = (name: string, type: Theme["type"], palette: Palette, alphaPalette: AlphaPalette): Theme => ({
  $schema: "vscode://schemas/color-theme",
  name,
  type,
  semanticHighlighting: true,
  colors: createWorkbenchColors(palette, alphaPalette),
  tokenColors: createTokenColors(palette),
  semanticTokenColors: createSemanticTokenColors(palette)
});

const __dirname = dirname(fileURLToPath(import.meta.url));
const JACK_PALETTE = createPalette(JACK_COLOR_PALETTE, JACK_ALPHA_PALETTE);
const themes = [
  {
    fileName: "jacks-theme-color-theme.json",
    name: "Jack's Theme",
    type: "dark",
    palette: JACK_PALETTE,
    alphaPalette: JACK_ALPHA_PALETTE
  }
] as const satisfies readonly ThemeConfig[];

for (const { fileName, name, type, palette, alphaPalette } of themes) {
  const theme = createTheme(name, type, palette, alphaPalette);
  assertThemeIntegrity(theme, palette);
  const outputPath = join(__dirname, "..", "themes", fileName);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, JSON.stringify(theme, null, 2) + "\n");
  console.log(`Generated ${outputPath} with ${Object.keys(theme.colors).length} workbench colors`);
}

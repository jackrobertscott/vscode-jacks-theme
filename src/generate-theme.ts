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
  accent: "oklch(35.40% 0.0600 74.00)",
  success: "oklch(28.80% 0.0480 145.00)",
  danger: "oklch(28.50% 0.0560 30.00)",
  info: "oklch(27.20% 0.0400 238.00)",
} as const satisfies Record<string, Oklch>;

const JACK_FONT_PALETTE = {
  bright: "oklch(98.00% 0.0100 95.00)",
  text: "oklch(90.40% 0.0120 95.00)",
  muted: "oklch(64.50% 0.0350 260.00)",
  faint: "oklch(56.80% 0.0260 260.00)",

  ember: "oklch(84.20% 0.1450 38.00)",
  sand: "oklch(87.00% 0.1100 92.00)",
  moss: "oklch(82.80% 0.1150 158.00)",
  ash: "oklch(77.00% 0.0500 185.00)",
  sky: "oklch(84.60% 0.1100 225.00)",
  plum: "oklch(84.40% 0.1200 300.00)",
  clay: "oklch(76.00% 0.1700 8.00)",
} as const satisfies Record<string, Oklch>;

const JACK_ALPHA_PALETTE = {
  none: 0,
  shadow: 0.22,
  minimap: 0.22,
} as const;

type AlphaPalette = typeof JACK_ALPHA_PALETTE;
type ColorPalette = typeof JACK_BACKGROUND_PALETTE & typeof JACK_FONT_PALETTE;
type Palette = Record<keyof ColorPalette, Hex> & {
  shadow: Hex;
  minimap: Hex;
  transparent: Hex;
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

const createPalette = (colors: ColorPalette, alphas: AlphaPalette): Palette => {
  const converted = Object.fromEntries(
    Object.entries(colors).map(([id, value]) => [id, oklchToHex(value)]),
  ) as Record<keyof ColorPalette, Hex>;
  const transparent = withAlpha(converted.black, alphas.none);

  return {
    ...converted,
    shadow: withAlpha(converted.black, alphas.shadow),
    minimap: withAlpha(converted.black, alphas.minimap),
    transparent,
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
  "scrollbar.shadow",
] as const;

const createWorkbenchColors = (C: Palette): Theme["colors"] => {
  const subtle = withAlpha(C.hover, 0.72);
  const medium = withAlpha(C.active, 0.72);
  const accent = withAlpha(C.accent, 0.76);
  const ember = withAlpha(C.ember, 0.76);
  const success = withAlpha(C.success, 0.74);
  const danger = withAlpha(C.danger, 0.74);

  return {
    ...keys(editorSurfaceIds, C.editor),
    ...keys(editorUnderlayIds, C.editor),
    ...keys(transparentEditorOverlayIds, C.transparent),

    focusBorder: C.transparent,
    foreground: C.text,
    disabledForeground: C.faint,
    descriptionForeground: C.muted,
    errorForeground: C.clay,
    "icon.foreground": C.muted,
    "selection.background": C.accent,
    "sash.hoverBorder": C.transparent,
    "widget.shadow": C.shadow,

    "window.activeBorder": C.transparent,
    "window.inactiveBorder": C.transparent,

    "textBlockQuote.background": C.panel,
    "textBlockQuote.border": C.transparent,
    "textCodeBlock.background": C.popup,
    "textLink.activeForeground": C.sky,
    "textLink.foreground": C.sky,
    "textPreformat.background": C.popup,
    "textPreformat.foreground": C.text,
    "textSeparator.foreground": C.transparent,

    "toolbar.hoverBackground": C.hover,
    "toolbar.hoverOutline": C.transparent,
    "toolbar.activeBackground": C.active,

    "button.background": C.sky,
    "button.foreground": C.editor,
    "button.hoverBackground": C.sky,
    "button.secondaryBackground": C.active,
    "button.secondaryForeground": C.bright,
    "button.secondaryHoverBackground": C.hover,
    "checkbox.background": C.panel,
    "checkbox.border": C.transparent,
    "checkbox.foreground": C.sky,
    "dropdown.background": C.popup,
    "dropdown.border": C.transparent,
    "dropdown.foreground": C.text,
    "dropdown.listBackground": C.popup,
    "input.background": C.panel,
    "input.border": C.transparent,
    "input.foreground": C.bright,
    "input.placeholderForeground": C.faint,
    "inputOption.activeBackground": C.active,
    "inputOption.activeBorder": C.transparent,
    "inputOption.activeForeground": C.bright,
    "inputOption.hoverBackground": C.hover,
    "inputValidation.errorBackground": C.danger,
    "inputValidation.errorBorder": C.transparent,
    "inputValidation.infoBackground": C.info,
    "inputValidation.infoBorder": C.transparent,
    "inputValidation.warningBackground": C.accent,
    "inputValidation.warningBorder": C.transparent,

    "badge.background": C.active,
    "badge.foreground": C.bright,
    "progressBar.background": C.sky,

    "list.activeSelectionBackground": C.active,
    "list.activeSelectionForeground": C.bright,
    "list.dropBackground": C.info,
    "list.errorForeground": C.clay,
    "list.focusBackground": C.active,
    "list.focusForeground": C.bright,
    "list.highlightForeground": C.sky,
    "list.hoverBackground": C.hover,
    "list.inactiveFocusBackground": C.active,
    "list.inactiveSelectionBackground": C.active,
    "list.invalidItemForeground": C.clay,
    "list.warningForeground": C.sand,

    "activityBar.background": C.editor,
    "activityBar.border": C.transparent,
    "activityBar.foreground": C.text,
    "activityBar.inactiveForeground": C.faint,
    "activityBar.activeBackground": C.hover,
    "activityBar.activeBorder": C.transparent,
    "activityBarBadge.background": C.sky,
    "activityBarBadge.foreground": C.editor,
    "activityBarTop.background": C.editor,
    "activityBarTop.foreground": C.text,
    "activityBarTop.inactiveForeground": C.faint,
    "activityBarTop.activeBackground": C.hover,
    "activityBarTop.activeBorder": C.transparent,

    "sideBar.background": C.editor,
    "sideBar.border": C.transparent,
    "sideBar.foreground": C.text,
    "sideBarTitle.background": C.editor,
    "sideBarTitle.foreground": C.bright,
    "sideBarSectionHeader.background": C.panel,
    "sideBarSectionHeader.border": C.transparent,
    "sideBarSectionHeader.foreground": C.text,
    "sideBarStickyScroll.background": C.editor,

    "editorGroup.border": C.transparent,
    "editorGroup.dropBackground": C.info,
    "editorGroupHeader.tabsBorder": C.transparent,
    "editorGroupHeader.border": C.transparent,
    "tab.activeBackground": C.editor,
    "tab.activeBorder": C.transparent,
    "tab.activeBorderTop": C.transparent,
    "tab.activeForeground": C.bright,
    "tab.border": C.transparent,
    "tab.hoverBackground": C.hover,
    "tab.hoverForeground": C.bright,
    "tab.inactiveBackground": C.editor,
    "tab.inactiveForeground": C.faint,
    "tab.unfocusedActiveForeground": C.text,
    "tab.unfocusedInactiveForeground": C.faint,

    "editor.foreground": C.text,
    "editorLineNumber.foreground": C.faint,
    "editorLineNumber.activeForeground": C.muted,
    "editorLineNumber.dimmedForeground": C.faint,
    "editorCursor.background": C.editor,
    "editorCursor.foreground": C.sky,
    "editor.selectionBackground": C.accent,
    "editor.selectionForeground": C.bright,
    "editor.selectionHighlightBackground": subtle,
    "editor.inactiveSelectionBackground": subtle,
    "editor.wordHighlightBackground": subtle,
    "editor.wordHighlightStrongBackground": medium,
    "editor.wordHighlightTextBackground": subtle,
    "editor.findMatchBackground": C.accent,
    "editor.findMatchBorder": C.transparent,
    "editor.findMatchHighlightBackground": accent,
    "editor.findRangeHighlightBackground": medium,
    "editor.hoverHighlightBackground": subtle,
    "editor.linkedEditingBackground": C.active,
    "editor.rangeHighlightBackground": subtle,
    "editor.symbolHighlightBackground": medium,
    "editorWhitespace.foreground": C.guide,
    "editorIndentGuide.background1": C.guide,
    "editorIndentGuide.activeBackground1": C.faint,
    "editorRuler.foreground": C.guide,
    "editorCodeLens.foreground": C.faint,
    "editorLightBulb.foreground": C.ember,
    "editorLightBulbAutoFix.foreground": C.moss,
    "editorBracketMatch.background": C.active,
    "editorBracketMatch.border": C.transparent,
    "editorBracketHighlight.foreground1": C.muted,
    "editorBracketHighlight.foreground2": C.muted,
    "editorBracketHighlight.foreground3": C.muted,
    "editorBracketHighlight.foreground4": C.muted,
    "editorBracketHighlight.foreground5": C.muted,
    "editorBracketHighlight.foreground6": C.muted,
    "editorBracketHighlight.unexpectedBracket.foreground": C.clay,
    "editorBracketPairGuide.background1": C.guide,
    "editorBracketPairGuide.activeBackground1": C.faint,
    "editorUnicodeHighlight.border": C.transparent,
    "editorUnicodeHighlight.background": C.accent,
    "editor.foldBackground": withAlpha(C.editor, 0.72),
    "editor.inlineValuesBackground": C.editor,
    "editor.inlineValuesForeground": C.muted,

    "editorGutter.addedBackground": C.moss,
    "editorGutter.deletedBackground": C.clay,
    "editorGutter.modifiedBackground": C.sky,
    "editorGutter.commentRangeForeground": C.ash,
    "editorOverviewRuler.addedForeground": C.moss,
    "editorOverviewRuler.deletedForeground": C.clay,
    "editorOverviewRuler.modifiedForeground": C.sky,
    "editorOverviewRuler.border": C.transparent,
    "editorOverviewRuler.errorForeground": C.clay,
    "editorOverviewRuler.warningForeground": C.sand,
    "editorOverviewRuler.infoForeground": C.sky,
    "editorOverviewRuler.findMatchForeground": ember,
    "editorOverviewRuler.rangeHighlightForeground": subtle,
    "editorOverviewRuler.selectionHighlightForeground": accent,
    "editorOverviewRuler.wordHighlightForeground": subtle,
    "editorOverviewRuler.wordHighlightStrongForeground": medium,
    "editorError.foreground": C.clay,
    "editorError.border": C.transparent,
    "editorError.background": C.transparent,
    "editorWarning.foreground": C.sand,
    "editorWarning.border": C.transparent,
    "editorWarning.background": C.transparent,
    "editorInfo.foreground": C.sky,
    "editorInfo.border": C.transparent,
    "editorInfo.background": C.transparent,
    "editorHint.foreground": C.moss,
    "editorHint.border": C.transparent,
    "problemsErrorIcon.foreground": C.clay,
    "problemsWarningIcon.foreground": C.sand,
    "problemsInfoIcon.foreground": C.sky,

    "diffEditor.insertedTextBackground": success,
    "diffEditor.insertedLineBackground": success,
    "diffEditor.removedTextBackground": danger,
    "diffEditor.removedLineBackground": danger,
    "diffEditorGutter.insertedLineBackground": C.success,
    "diffEditorGutter.removedLineBackground": C.danger,
    "diffEditor.border": C.transparent,
    "diffEditor.diagonalFill": C.guide,
    "diffEditor.unchangedRegionBackground": C.panel,
    "diffEditor.unchangedRegionForeground": C.faint,
    "diffEditor.unchangedCodeBackground": C.editor,

    "panel.background": C.editor,
    "panel.border": C.transparent,
    "panelTitle.activeBorder": C.transparent,
    "panelTitle.activeForeground": C.bright,
    "panelTitle.inactiveForeground": C.faint,
    "panelInput.border": C.transparent,

    "terminal.foreground": C.text,
    "terminal.ansiBlack": C.editor,
    "terminal.ansiBlue": C.sky,
    "terminal.ansiBrightBlack": C.faint,
    "terminal.ansiBrightBlue": C.sky,
    "terminal.ansiBrightCyan": C.sky,
    "terminal.ansiBrightGreen": C.moss,
    "terminal.ansiBrightMagenta": C.plum,
    "terminal.ansiBrightRed": C.clay,
    "terminal.ansiBrightWhite": C.bright,
    "terminal.ansiBrightYellow": C.sand,
    "terminal.ansiCyan": C.sky,
    "terminal.ansiGreen": C.moss,
    "terminal.ansiMagenta": C.plum,
    "terminal.ansiRed": C.clay,
    "terminal.ansiWhite": C.text,
    "terminal.ansiYellow": C.sand,
    "terminal.border": C.transparent,
    "terminalCursor.background": C.editor,
    "terminalCursor.foreground": C.sky,
    "terminal.selectionBackground": C.accent,

    "statusBar.background": C.editor,
    "statusBar.border": C.transparent,
    "statusBar.foreground": C.text,
    "statusBar.debuggingBackground": C.plum,
    "statusBar.debuggingForeground": C.editor,
    "statusBar.noFolderBackground": C.editor,
    "statusBar.noFolderForeground": C.text,
    "statusBarItem.activeBackground": C.active,
    "statusBarItem.hoverBackground": C.hover,
    "statusBarItem.prominentBackground": C.hover,
    "statusBarItem.prominentForeground": C.bright,
    "statusBarItem.remoteBackground": C.sky,
    "statusBarItem.remoteForeground": C.editor,
    "statusBarItem.errorBackground": C.clay,
    "statusBarItem.errorForeground": C.editor,
    "statusBarItem.warningBackground": C.sand,
    "statusBarItem.warningForeground": C.editor,

    "titleBar.activeBackground": C.editor,
    "titleBar.activeForeground": C.bright,
    "titleBar.border": C.transparent,
    "titleBar.inactiveBackground": C.editor,
    "titleBar.inactiveForeground": C.faint,

    "menu.background": C.popup,
    "menu.border": C.transparent,
    "menu.foreground": C.text,
    "menu.selectionBackground": C.active,
    "menu.selectionBorder": C.transparent,
    "menu.selectionForeground": C.bright,
    "menu.separatorBackground": C.transparent,
    "menubar.selectionBackground": C.active,
    "menubar.selectionBorder": C.transparent,
    "menubar.selectionForeground": C.bright,

    "commandCenter.foreground": C.muted,
    "commandCenter.activeForeground": C.bright,
    "commandCenter.background": C.editor,
    "commandCenter.activeBackground": C.hover,
    "commandCenter.border": C.transparent,
    "commandCenter.inactiveForeground": C.faint,
    "commandCenter.inactiveBorder": C.transparent,
    "commandCenter.activeBorder": C.transparent,
    "commandCenter.debuggingBackground": withAlpha(C.editor, 0.96),

    "notificationCenter.border": C.transparent,
    "notificationCenterHeader.background": C.panel,
    "notificationCenterHeader.foreground": C.bright,
    "notificationToast.border": C.transparent,
    "notifications.background": C.popup,
    "notifications.border": C.transparent,
    "notifications.foreground": C.text,
    "notificationsErrorIcon.foreground": C.clay,
    "notificationsInfoIcon.foreground": C.sky,
    "notificationsWarningIcon.foreground": C.sand,

    "quickInput.background": C.popup,
    "quickInput.foreground": C.text,
    "quickInputList.focusBackground": C.active,
    "quickInputList.focusForeground": C.bright,
    "quickInputTitle.background": C.panel,
    "pickerGroup.border": C.transparent,
    "pickerGroup.foreground": C.muted,

    "settings.checkboxBackground": C.panel,
    "settings.checkboxBorder": C.transparent,
    "settings.dropdownBackground": C.panel,
    "settings.dropdownBorder": C.transparent,
    "settings.headerForeground": C.bright,
    "settings.modifiedItemIndicator": C.sand,
    "settings.numberInputBackground": C.panel,
    "settings.numberInputBorder": C.transparent,
    "settings.rowHoverBackground": C.hover,
    "settings.sashBorder": C.transparent,
    "settings.textInputBackground": C.panel,
    "settings.textInputBorder": C.transparent,

    "breadcrumb.background": C.editor,
    "breadcrumb.focusForeground": C.bright,
    "breadcrumb.foreground": C.faint,
    "breadcrumb.activeSelectionForeground": C.bright,
    "breadcrumbPicker.background": C.popup,

    "peekView.border": C.transparent,
    "peekViewEditor.matchHighlightBackground": C.accent,
    "peekViewResult.fileForeground": C.bright,
    "peekViewResult.lineForeground": C.muted,
    "peekViewResult.matchHighlightBackground": C.accent,
    "peekViewResult.selectionBackground": C.active,
    "peekViewResult.selectionForeground": C.bright,
    "peekViewTitle.background": C.popup,
    "peekViewTitleDescription.foreground": C.muted,
    "peekViewTitleLabel.foreground": C.bright,

    "gitDecoration.addedResourceForeground": C.moss,
    "gitDecoration.conflictingResourceForeground": C.sand,
    "gitDecoration.deletedResourceForeground": C.clay,
    "gitDecoration.ignoredResourceForeground": C.faint,
    "gitDecoration.modifiedResourceForeground": C.sky,
    "gitDecoration.renamedResourceForeground": C.moss,
    "gitDecoration.stageDeletedResourceForeground": C.clay,
    "gitDecoration.stageModifiedResourceForeground": C.sky,
    "gitDecoration.submoduleResourceForeground": C.sky,
    "gitDecoration.untrackedResourceForeground": C.moss,

    "minimap.findMatchHighlight": ember,
    "minimap.selectionHighlight": accent,
    "minimap.errorHighlight": C.clay,
    "minimap.warningHighlight": C.sand,
    "minimap.infoHighlight": C.sky,
    "minimap.foregroundOpacity": C.minimap,
    "minimapGutter.addedBackground": C.moss,
    "minimapGutter.deletedBackground": C.clay,
    "minimapGutter.modifiedBackground": C.sky,
    "minimapSlider.activeBackground": C.muted,
    "minimapSlider.background": C.guide,
    "minimapSlider.hoverBackground": C.faint,

    "scrollbarSlider.activeBackground": C.muted,
    "scrollbarSlider.background": C.guide,
    "scrollbarSlider.hoverBackground": C.faint,

    "charts.blue": C.sky,
    "charts.foreground": C.text,
    "charts.green": C.moss,
    "charts.lines": C.transparent,
    "charts.orange": C.ember,
    "charts.purple": C.plum,
    "charts.red": C.clay,
    "charts.yellow": C.sand,

    "testing.iconErrored": C.clay,
    "testing.iconFailed": C.clay,
    "testing.iconPassed": C.moss,
    "testing.iconQueued": C.muted,
    "testing.iconSkipped": C.faint,
    "testing.iconUnset": C.faint,

    "welcomePage.tileBackground": C.panel,
    "welcomePage.tileHoverBackground": C.hover,
    "welcomePage.tileBorder": C.transparent,
  };
};

type ThemeConfig = {
  fileName: string;
  name: string;
  type: Theme["type"];
  palette: Palette;
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

const createTokenColors = (C: Palette): TokenRule[] => [
  token(
    "Source text",
    ["source", "meta.embedded", "text.html.markdown"],
    C.text,
  ),
  token("Comments", ["comment", "punctuation.definition.comment"], C.ash),
  token(
    "Documentation comments",
    [
      "comment.block.documentation",
      "storage.type.class.jsdoc",
      "entity.name.type.instance.jsdoc",
    ],
    C.ash,
  ),
  token(
    "Keywords and control flow",
    [
      "keyword",
      "keyword.control",
      "keyword.operator.expression",
      "storage.modifier",
    ],
    C.ember,
  ),
  token(
    "Imports and exports",
    [
      "keyword.control.import",
      "keyword.control.export",
      "storage.modifier.async",
      "keyword.control.from",
    ],
    C.ember,
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
    C.sand,
  ),
  token(
    "Operators",
    [
      "keyword.operator",
      "punctuation.accessor",
      "punctuation.separator.key-value",
      "keyword.operator.type",
    ],
    C.muted,
  ),
  token("Strings", ["string", "constant.other.symbol"], C.moss),
  token(
    "Template strings",
    ["string.template", "punctuation.definition.template-expression"],
    C.moss,
  ),
  token(
    "Regular expressions",
    ["string.regexp", "constant.character.escape"],
    C.moss,
  ),
  token(
    "Numbers and constants",
    [
      "constant.numeric",
      "constant.language",
      "constant.character",
      "constant.other.enum",
    ],
    C.sand,
  ),
  token(
    "Booleans and nullish values",
    [
      "constant.language.boolean",
      "constant.language.null",
      "constant.language.undefined",
    ],
    C.sand,
  ),
  token(
    "Functions",
    [
      "entity.name.function",
      "support.function",
      "variable.function",
      "support.function.console",
    ],
    C.sky,
  ),
  token(
    "Methods",
    ["entity.name.function.member", "support.function.dom"],
    C.sky,
  ),
  token(
    "Classes and constructors",
    [
      "entity.name.type.class",
      "entity.name.class",
      "support.class",
      "support.type",
    ],
    C.plum,
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
    C.plum,
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
    C.text,
  ),
  token(
    "Parameters",
    ["variable.parameter", "entity.name.variable.parameter"],
    C.text,
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
    C.text,
  ),
  token(
    "Decorators and annotations",
    [
      "meta.decorator",
      "entity.name.function.decorator",
      "punctuation.decorator",
    ],
    C.plum,
  ),
  token(
    "JSX components",
    ["entity.name.tag.tsx", "support.class.component.tsx"],
    C.plum,
  ),
  token("JSX attributes", ["entity.other.attribute-name"], C.sand),
  token(
    "Tag punctuation",
    [
      "punctuation.definition.tag",
      "punctuation.definition.tag.begin",
      "punctuation.definition.tag.end",
    ],
    C.muted,
  ),
  token("HTML and XML tags", ["entity.name.tag", "meta.tag"], C.sky),
  token(
    "CSS selectors",
    [
      "entity.other.attribute-name.class.css",
      "entity.other.attribute-name.id.css",
      "entity.name.tag.css",
    ],
    C.moss,
  ),
  token(
    "CSS properties",
    [
      "support.type.property-name.css",
      "support.type.vendored.property-name.css",
    ],
    C.text,
  ),
  token(
    "Markdown headings",
    ["markup.heading", "entity.name.section.markdown"],
    C.ember,
  ),
  token(
    "Markdown links",
    ["markup.underline.link", "string.other.link"],
    C.sky,
  ),
  token("Markup emphasis", ["markup.italic"], C.text),
  token("Markup bold", ["markup.bold"], C.bright),
  token(
    "Inserted content",
    ["markup.inserted", "meta.diff.header.to-file"],
    C.moss,
  ),
  token(
    "Deleted content",
    ["markup.deleted", "meta.diff.header.from-file"],
    C.clay,
  ),
  token("Changed content", ["markup.changed"], C.sand),
  token("Invalid", ["invalid", "invalid.illegal"], C.clay),
  token(
    "Punctuation",
    ["punctuation", "meta.brace", "punctuation.definition.block"],
    C.muted,
  ),
];

const createSemanticTokenColors = (
  C: Palette,
): Theme["semanticTokenColors"] => ({
  namespace: C.sky,
  type: C.plum,
  class: C.plum,
  enum: C.plum,
  interface: C.plum,
  struct: C.plum,
  typeParameter: C.sand,
  parameter: C.text,
  variable: C.text,
  property: C.text,
  enumMember: C.sand,
  event: C.moss,
  function: C.sky,
  method: C.sky,
  macro: C.sand,
  keyword: C.ember,
  modifier: C.ember,
  comment: C.ash,
  string: C.moss,
  number: C.sand,
  regexp: C.moss,
  operator: C.muted,
  decorator: C.plum,
  "variable.readonly": C.text,
  "variable.declaration": C.text,
  "variable.readonly.declaration": C.text,
  "property.readonly": C.text,
  "property.declaration": C.text,
  "parameter.declaration": C.text,
  "typeParameter.declaration": C.sand,
  "function.declaration": C.sky,
  "method.declaration": C.sky,
  "class.declaration": C.plum,
  "interface.declaration": C.plum,
  "type.declaration": C.plum,
  "enum.declaration": C.plum,
  "*.deprecated": C.faint,
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

const colorSettingKeys = new Set(["foreground", "background"]);
const visibleAlphaWorkbenchColors = new Set([
  "minimap.foregroundOpacity",
  "widget.shadow",
]);
const transparentWorkbenchColors = new Set([
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
const minimumEditorTextContrast = 4.5;
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

const assertThemeIntegrity = (theme: Theme, palette: Palette) => {
  for (const [id, value] of Object.entries(theme.colors)) {
    assertHex(value, `colors.${id}`);
    if (
      borderlessWorkbenchColorPattern.test(id) &&
      value !== palette.transparent
    ) {
      throw new Error(
        `colors.${id} must be transparent because visible borders are disabled`,
      );
    }
    if (
      transparentWorkbenchColors.has(id) &&
      value !== palette.transparent &&
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
      const ratio = contrastRatio(rule.settings.foreground, palette.editor);
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

    const ratio = contrastRatio(value, palette.editor);
    if (ratio < minimumEditorTextContrast) {
      throw new Error(
        `semanticTokenColors.${id} contrast ${ratio.toFixed(2)} is below ${minimumEditorTextContrast}`,
      );
    }
  }

  const editorSurfaceDrift = editorSurfaceIds.filter(
    (id) => theme.colors[id] !== palette.editor,
  );
  const editorUnderlayDrift = editorUnderlayIds.filter(
    (id) => theme.colors[id] !== palette.editor,
  );
  if (editorSurfaceDrift.length || editorUnderlayDrift.length) {
    throw new Error(
      `Editor surface drift. Painted: ${editorSurfaceDrift.join(", ") || "none"}. Underlay: ${editorUnderlayDrift.join(", ") || "none"}.`,
    );
  }
};

const createTheme = (
  name: string,
  type: Theme["type"],
  palette: Palette,
): Theme => ({
  $schema: "vscode://schemas/color-theme",
  name,
  type,
  semanticHighlighting: true,
  colors: createWorkbenchColors(palette),
  tokenColors: createTokenColors(palette),
  semanticTokenColors: createSemanticTokenColors(palette),
});

const __dirname = dirname(fileURLToPath(import.meta.url));
assertSingleWordPaletteProperties("background", JACK_BACKGROUND_PALETTE);
assertSingleWordPaletteProperties("font", JACK_FONT_PALETTE);
assertSingleWordPaletteProperties("alpha", JACK_ALPHA_PALETTE);
const JACK_PALETTE = createPalette(
  { ...JACK_BACKGROUND_PALETTE, ...JACK_FONT_PALETTE },
  JACK_ALPHA_PALETTE,
);
const themes = [
  {
    fileName: "jacks-theme-color-theme.json",
    name: "Jack's Theme",
    type: "dark",
    palette: JACK_PALETTE,
  },
] as const satisfies readonly ThemeConfig[];

for (const { fileName, name, type, palette } of themes) {
  const theme = createTheme(name, type, palette);
  assertThemeIntegrity(theme, palette);
  const outputPath = join(__dirname, "..", "themes", fileName);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, JSON.stringify(theme, null, 2) + "\n");
  console.log(
    `Generated ${outputPath} with ${Object.keys(theme.colors).length} workbench colors`,
  );
}

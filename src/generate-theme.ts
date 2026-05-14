import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

type Hex = `#${string}`;

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

const JACK_PALETTE = {
  editor: "#090909",
  editorUnderlay: "#0b0b0b",
  panel: "#101010",
  popup: "#151515",
  hover: "#1e1e1e",
  active: "#262626",
  border: "#00000000",
  borderStrong: "#00000000",
  transparent: "#00000000",

  textBright: "#f0f0f0",
  text: "#c8c8c8",
  textMuted: "#8c8c8c",
  textFaint: "#5f5f5f",

  amber: "#ff9f35",
  gold: "#e7cf63",
  sage: "#9fbd72",
  sageMuted: "#7fa378",
  red: "#f05b5f",
  coral: "#ff7f4f",
  blue: "#69b8cf",
  violet: "#c49be5"
} as const satisfies Record<string, Hex>;

type Palette = Record<keyof typeof JACK_PALETTE, Hex>;

const stripHash = (value: Hex) => value.slice(1);
const toByte = (value: number) => Math.round(Math.max(0, Math.min(1, value)) * 255)
  .toString(16)
  .padStart(2, "0");
const alpha = (value: Hex, opacity: number): Hex => `#${stripHash(value).slice(0, 6)}${toByte(opacity)}`;
const keys = (ids: readonly string[], value: Hex): Record<string, Hex> => Object.fromEntries(ids.map((id) => [id, value]));

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

// This is the surface that appears below the editor's rendered line layer when scrollBeyondLastLine is active.
// It needs a tiny lift to visually match the painted editor layer in VS Code's compositor.
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

const createWorkbenchColors = (C: Palette): Theme["colors"] => ({
  ...keys(editorSurfaceIds, C.editor),
  ...keys(editorUnderlayIds, C.editorUnderlay),
  ...keys(transparentEditorOverlayIds, C.transparent),

  focusBorder: C.transparent,
  foreground: C.text,
  disabledForeground: alpha(C.textMuted, 0.55),
  descriptionForeground: C.textMuted,
  errorForeground: C.red,
  "icon.foreground": C.textMuted,
  "selection.background": alpha(C.amber, 0.24),
  "sash.hoverBorder": C.transparent,
  "widget.shadow": alpha("#000000", 0.45),

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

  "button.background": C.amber,
  "button.foreground": C.editor,
  "button.hoverBackground": C.gold,
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
  "inputOption.activeBackground": alpha(C.amber, 0.18),
  "inputOption.activeBorder": C.transparent,
  "inputValidation.errorBackground": alpha(C.red, 0.16),
  "inputValidation.errorBorder": C.red,
  "inputValidation.infoBackground": alpha(C.blue, 0.14),
  "inputValidation.infoBorder": C.blue,
  "inputValidation.warningBackground": alpha(C.gold, 0.14),
  "inputValidation.warningBorder": C.gold,

  "badge.background": alpha(C.amber, 0.22),
  "badge.foreground": C.gold,
  "progressBar.background": C.amber,

  "list.activeSelectionBackground": alpha(C.amber, 0.18),
  "list.activeSelectionForeground": C.textBright,
  "list.dropBackground": alpha(C.sage, 0.18),
  "list.errorForeground": C.red,
  "list.focusBackground": alpha(C.amber, 0.14),
  "list.focusForeground": C.textBright,
  "list.highlightForeground": C.amber,
  "list.hoverBackground": alpha(C.textBright, 0.045),
  "list.inactiveFocusBackground": alpha(C.textBright, 0.06),
  "list.inactiveSelectionBackground": alpha(C.textBright, 0.08),
  "list.invalidItemForeground": C.coral,
  "list.warningForeground": C.gold,

  "activityBar.background": C.editor,
  "activityBar.border": C.border,
  "activityBar.foreground": C.text,
  "activityBar.inactiveForeground": C.textFaint,
  "activityBar.activeBackground": alpha(C.amber, 0.08),
  "activityBar.activeBorder": C.transparent,
  "activityBarBadge.background": C.amber,
  "activityBarBadge.foreground": C.editor,
  "activityBarTop.background": C.editor,
  "activityBarTop.foreground": C.text,
  "activityBarTop.inactiveForeground": C.textFaint,
  "activityBarTop.activeBackground": alpha(C.amber, 0.08),
  "activityBarTop.activeBorder": C.transparent,

  "sideBar.background": C.editor,
  "sideBar.border": C.border,
  "sideBar.foreground": C.text,
  "sideBarTitle.background": C.editor,
  "sideBarTitle.foreground": C.textBright,
  "sideBarSectionHeader.background": C.panel,
  "sideBarSectionHeader.border": C.border,
  "sideBarSectionHeader.foreground": C.text,
  "sideBarStickyScroll.background": C.editor,

  "editorGroup.border": C.border,
  "editorGroup.dropBackground": alpha(C.amber, 0.12),
  "editorGroupHeader.tabsBorder": C.border,
  "editorGroupHeader.border": C.border,
  "tab.activeBackground": C.panel,
  "tab.activeBorder": C.transparent,
  "tab.activeBorderTop": C.transparent,
  "tab.activeForeground": C.textBright,
  "tab.border": C.border,
  "tab.hoverBackground": alpha(C.textBright, 0.04),
  "tab.hoverForeground": C.textBright,
  "tab.inactiveBackground": C.editor,
  "tab.inactiveForeground": C.textFaint,
  "tab.unfocusedActiveForeground": C.text,
  "tab.unfocusedInactiveForeground": C.textFaint,

  "editor.foreground": C.text,
  "editorLineNumber.foreground": C.textFaint,
  "editorLineNumber.activeForeground": C.amber,
  "editorLineNumber.dimmedForeground": C.textFaint,
  "editorCursor.background": C.editor,
  "editorCursor.foreground": C.amber,
  "editor.selectionBackground": alpha(C.amber, 0.26),
  "editor.selectionForeground": C.textBright,
  "editor.selectionHighlightBackground": alpha(C.amber, 0.12),
  "editor.inactiveSelectionBackground": alpha(C.textBright, 0.1),
  "editor.wordHighlightBackground": alpha(C.gold, 0.12),
  "editor.wordHighlightStrongBackground": alpha(C.amber, 0.18),
  "editor.wordHighlightTextBackground": alpha(C.gold, 0.1),
  "editor.findMatchBackground": alpha(C.gold, 0.34),
  "editor.findMatchBorder": C.transparent,
  "editor.findMatchHighlightBackground": alpha(C.gold, 0.16),
  "editor.findRangeHighlightBackground": alpha(C.amber, 0.1),
  "editor.hoverHighlightBackground": alpha(C.amber, 0.08),
  "editor.linkedEditingBackground": alpha(C.blue, 0.16),
  "editor.rangeHighlightBackground": alpha(C.amber, 0.075),
  "editor.symbolHighlightBackground": alpha(C.amber, 0.12),
  "editorWhitespace.foreground": alpha(C.textFaint, 0.34),
  "editorIndentGuide.background1": alpha(C.textFaint, 0.2),
  "editorIndentGuide.activeBackground1": alpha(C.amber, 0.55),
  "editorRuler.foreground": alpha(C.textFaint, 0.24),
  "editorCodeLens.foreground": C.textFaint,
  "editorLightBulb.foreground": C.gold,
  "editorLightBulbAutoFix.foreground": C.sage,
  "editorBracketMatch.background": alpha(C.amber, 0.12),
  "editorBracketMatch.border": C.amber,
  "editorBracketHighlight.foreground1": C.amber,
  "editorBracketHighlight.foreground2": C.gold,
  "editorBracketHighlight.foreground3": C.sage,
  "editorBracketHighlight.foreground4": C.blue,
  "editorBracketHighlight.foreground5": C.violet,
  "editorBracketHighlight.foreground6": C.coral,
  "editorBracketHighlight.unexpectedBracket.foreground": C.red,
  "editorBracketPairGuide.background1": alpha(C.textFaint, 0.18),
  "editorBracketPairGuide.activeBackground1": alpha(C.amber, 0.45),
  "editorUnicodeHighlight.border": C.gold,
  "editorUnicodeHighlight.background": alpha(C.gold, 0.14),
  "editor.foldBackground": C.editor,
  "editor.inlineValuesBackground": C.editor,
  "editor.inlineValuesForeground": C.textMuted,

  "editorGutter.addedBackground": C.sage,
  "editorGutter.deletedBackground": C.red,
  "editorGutter.modifiedBackground": C.blue,
  "editorGutter.commentRangeForeground": C.sageMuted,
  "editorOverviewRuler.addedForeground": alpha(C.sage, 0.85),
  "editorOverviewRuler.deletedForeground": alpha(C.red, 0.85),
  "editorOverviewRuler.modifiedForeground": alpha(C.blue, 0.85),
  "editorOverviewRuler.border": C.border,
  "editorOverviewRuler.errorForeground": C.red,
  "editorOverviewRuler.warningForeground": C.gold,
  "editorOverviewRuler.infoForeground": C.blue,
  "editorOverviewRuler.findMatchForeground": C.gold,
  "editorOverviewRuler.rangeHighlightForeground": alpha(C.amber, 0.32),
  "editorOverviewRuler.selectionHighlightForeground": alpha(C.amber, 0.48),
  "editorOverviewRuler.wordHighlightForeground": alpha(C.gold, 0.4),
  "editorOverviewRuler.wordHighlightStrongForeground": alpha(C.amber, 0.5),
  "editorError.foreground": C.red,
  "editorError.border": alpha(C.red, 0.25),
  "editorError.background": alpha(C.red, 0.12),
  "editorWarning.foreground": C.gold,
  "editorWarning.border": alpha(C.gold, 0.24),
  "editorWarning.background": alpha(C.gold, 0.1),
  "editorInfo.foreground": C.blue,
  "editorInfo.border": alpha(C.blue, 0.24),
  "editorInfo.background": alpha(C.blue, 0.1),
  "editorHint.foreground": C.sage,
  "editorHint.border": alpha(C.sage, 0.24),
  "problemsErrorIcon.foreground": C.red,
  "problemsWarningIcon.foreground": C.gold,
  "problemsInfoIcon.foreground": C.blue,

  "diffEditor.insertedTextBackground": alpha(C.sage, 0.14),
  "diffEditor.insertedLineBackground": alpha(C.sage, 0.08),
  "diffEditor.removedTextBackground": alpha(C.red, 0.16),
  "diffEditor.removedLineBackground": alpha(C.red, 0.08),
  "diffEditor.border": C.border,
  "diffEditor.diagonalFill": alpha(C.textFaint, 0.18),
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
  "terminal.ansiBlack": C.active,
  "terminal.ansiBlue": C.blue,
  "terminal.ansiBrightBlack": C.textFaint,
  "terminal.ansiBrightBlue": C.blue,
  "terminal.ansiBrightCyan": C.sage,
  "terminal.ansiBrightGreen": C.sage,
  "terminal.ansiBrightMagenta": C.violet,
  "terminal.ansiBrightRed": C.coral,
  "terminal.ansiBrightWhite": C.textBright,
  "terminal.ansiBrightYellow": C.gold,
  "terminal.ansiCyan": C.blue,
  "terminal.ansiGreen": C.sage,
  "terminal.ansiMagenta": C.violet,
  "terminal.ansiRed": C.red,
  "terminal.ansiWhite": C.text,
  "terminal.ansiYellow": C.amber,
  "terminal.border": C.border,
  "terminalCursor.background": C.editor,
  "terminalCursor.foreground": C.amber,
  "terminal.selectionBackground": alpha(C.amber, 0.26),

  "statusBar.background": C.panel,
  "statusBar.border": C.border,
  "statusBar.foreground": C.text,
  "statusBar.debuggingBackground": C.amber,
  "statusBar.debuggingForeground": C.editor,
  "statusBar.noFolderBackground": C.panel,
  "statusBar.noFolderForeground": C.text,
  "statusBarItem.activeBackground": alpha(C.textBright, 0.1),
  "statusBarItem.hoverBackground": alpha(C.textBright, 0.07),
  "statusBarItem.prominentBackground": alpha(C.amber, 0.18),
  "statusBarItem.prominentForeground": C.amber,
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
  "menu.selectionBackground": alpha(C.amber, 0.14),
  "menu.selectionForeground": C.textBright,
  "menu.separatorBackground": C.borderStrong,
  "menubar.selectionBackground": alpha(C.textBright, 0.06),
  "menubar.selectionForeground": C.textBright,

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
  "quickInputList.focusBackground": alpha(C.amber, 0.14),
  "quickInputList.focusForeground": C.textBright,
  "quickInputTitle.background": C.panel,
  "pickerGroup.border": C.borderStrong,
  "pickerGroup.foreground": C.amber,

  "settings.checkboxBackground": C.panel,
  "settings.checkboxBorder": C.borderStrong,
  "settings.dropdownBackground": C.panel,
  "settings.dropdownBorder": C.borderStrong,
  "settings.headerForeground": C.textBright,
  "settings.modifiedItemIndicator": C.amber,
  "settings.numberInputBackground": C.panel,
  "settings.numberInputBorder": C.borderStrong,
  "settings.rowHoverBackground": alpha(C.textBright, 0.04),
  "settings.sashBorder": C.border,
  "settings.textInputBackground": C.panel,
  "settings.textInputBorder": C.borderStrong,

  "breadcrumb.background": C.editor,
  "breadcrumb.focusForeground": C.textBright,
  "breadcrumb.foreground": C.textFaint,
  "breadcrumb.activeSelectionForeground": C.amber,
  "breadcrumbPicker.background": C.popup,

  "peekView.border": C.transparent,
  "peekViewEditor.matchHighlightBackground": alpha(C.gold, 0.28),
  "peekViewResult.fileForeground": C.textBright,
  "peekViewResult.lineForeground": C.textMuted,
  "peekViewResult.matchHighlightBackground": alpha(C.gold, 0.22),
  "peekViewResult.selectionBackground": alpha(C.amber, 0.14),
  "peekViewResult.selectionForeground": C.textBright,
  "peekViewTitle.background": C.popup,
  "peekViewTitleDescription.foreground": C.textMuted,
  "peekViewTitleLabel.foreground": C.textBright,

  "gitDecoration.addedResourceForeground": C.sage,
  "gitDecoration.conflictingResourceForeground": C.coral,
  "gitDecoration.deletedResourceForeground": C.red,
  "gitDecoration.ignoredResourceForeground": C.textFaint,
  "gitDecoration.modifiedResourceForeground": C.blue,
  "gitDecoration.renamedResourceForeground": C.sage,
  "gitDecoration.stageDeletedResourceForeground": C.red,
  "gitDecoration.stageModifiedResourceForeground": C.blue,
  "gitDecoration.submoduleResourceForeground": C.violet,
  "gitDecoration.untrackedResourceForeground": C.sage,

  "minimap.findMatchHighlight": C.gold,
  "minimap.selectionHighlight": alpha(C.amber, 0.48),
  "minimap.errorHighlight": C.red,
  "minimap.warningHighlight": C.gold,
  "minimap.infoHighlight": C.blue,
  "minimap.foregroundOpacity": alpha("#000000", 0.35),
  "minimapGutter.addedBackground": C.sage,
  "minimapGutter.deletedBackground": C.red,
  "minimapGutter.modifiedBackground": C.blue,
  "minimapSlider.activeBackground": alpha(C.textBright, 0.2),
  "minimapSlider.background": alpha(C.textBright, 0.08),
  "minimapSlider.hoverBackground": alpha(C.textBright, 0.14),

  "scrollbarSlider.activeBackground": alpha(C.textMuted, 0.34),
  "scrollbarSlider.background": alpha(C.textMuted, 0.16),
  "scrollbarSlider.hoverBackground": alpha(C.textMuted, 0.25),

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
};

const token = (name: string, scope: TokenRule["scope"], foreground: Hex): TokenRule => ({
  name,
  scope,
  settings: { foreground }
});

const createTokenColors = (C: Palette): TokenRule[] => [
  token("Source text", ["source", "meta.embedded", "text.html.markdown"], C.text),
  token("Comments", ["comment", "punctuation.definition.comment"], C.sageMuted),
  token("Documentation comments", ["comment.block.documentation", "storage.type.class.jsdoc", "entity.name.type.instance.jsdoc"], C.sageMuted),
  token("Keywords and control flow", ["keyword", "keyword.control", "keyword.operator.expression", "storage.modifier"], C.amber),
  token("Imports and exports", ["keyword.control.import", "keyword.control.export", "storage.modifier.async", "keyword.control.from"], C.amber),
  token("Storage and declarations", ["storage.type", "storage.type.function", "storage.type.class", "storage.type.interface", "storage.type.type"], C.gold),
  token("Operators", ["keyword.operator", "punctuation.accessor", "punctuation.separator.key-value", "keyword.operator.type"], C.amber),
  token("Strings", ["string", "constant.other.symbol"], C.sage),
  token("Template strings", ["string.template", "punctuation.definition.template-expression"], C.sage),
  token("Regular expressions", ["string.regexp", "constant.character.escape"], C.sage),
  token("Numbers and constants", ["constant.numeric", "constant.language", "constant.character", "variable.other.constant", "constant.other.enum"], C.coral),
  token("Booleans and nullish values", ["constant.language.boolean", "constant.language.null", "constant.language.undefined"], C.coral),
  token("Functions", ["entity.name.function", "support.function", "meta.function-call", "variable.function", "support.function.console"], C.textBright),
  token("Methods", ["entity.name.function.member", "support.function.dom", "meta.method-call"], C.blue),
  token("Classes and constructors", ["entity.name.type.class", "entity.name.class", "support.class", "support.type"], C.gold),
  token("Interfaces, aliases, and type parameters", [
    "entity.name.type.interface",
    "entity.name.type.alias",
    "entity.name.type",
    "entity.name.type.module",
    "entity.name.type.namespace",
    "support.type.primitive",
    "meta.type.parameters",
    "meta.type.annotation"
  ], C.amber),
  token("Object keys and properties", [
    "meta.object-literal.key",
    "support.type.property-name",
    "variable.other.property",
    "variable.other.member",
    "meta.property.object",
    "support.variable.property"
  ], C.blue),
  token("Parameters", ["variable.parameter", "meta.parameters", "entity.name.variable.parameter"], C.violet),
  token("Variables", ["variable", "variable.other.readwrite", "entity.name.variable", "variable.language.this"], C.text),
  token("Decorators and annotations", ["meta.decorator", "entity.name.function.decorator", "punctuation.decorator"], C.gold),
  token("JSX components", ["entity.name.tag.tsx", "support.class.component.tsx"], C.gold),
  token("JSX attributes", ["entity.other.attribute-name"], C.amber),
  token("Tag punctuation", ["punctuation.definition.tag", "punctuation.definition.tag.begin", "punctuation.definition.tag.end"], C.textMuted),
  token("HTML and XML tags", ["entity.name.tag", "meta.tag"], C.gold),
  token("CSS selectors", ["entity.other.attribute-name.class.css", "entity.other.attribute-name.id.css", "entity.name.tag.css"], C.gold),
  token("CSS properties", ["support.type.property-name.css", "support.type.vendored.property-name.css"], C.text),
  token("Markdown headings", ["markup.heading", "entity.name.section.markdown"], C.amber),
  token("Markdown links", ["markup.underline.link", "string.other.link"], C.amber),
  token("Markup emphasis", ["markup.italic"], C.text),
  token("Markup bold", ["markup.bold"], C.gold),
  token("Inserted content", ["markup.inserted", "meta.diff.header.to-file"], C.sage),
  token("Deleted content", ["markup.deleted", "meta.diff.header.from-file"], C.red),
  token("Changed content", ["markup.changed"], C.gold),
  token("Invalid", ["invalid", "invalid.illegal"], C.red),
  token("Punctuation", ["punctuation", "meta.brace", "punctuation.definition.block"], C.textMuted)
];

const createSemanticTokenColors = (C: Palette): Theme["semanticTokenColors"] => ({
  namespace: C.amber,
  type: C.amber,
  class: C.gold,
  enum: C.gold,
  interface: C.amber,
  struct: C.gold,
  typeParameter: C.amber,
  parameter: C.violet,
  variable: C.text,
  property: C.blue,
  enumMember: C.coral,
  event: C.violet,
  function: C.textBright,
  method: C.blue,
  macro: C.gold,
  keyword: C.amber,
  modifier: C.amber,
  comment: C.sageMuted,
  string: C.sage,
  number: C.coral,
  regexp: C.sage,
  operator: C.amber,
  decorator: C.gold,
  "variable.readonly": C.amber,
  "property.readonly": C.amber,
  "property.declaration": C.blue,
  "parameter.declaration": C.violet,
  "function.declaration": C.textBright,
  "method.declaration": C.blue,
  "class.declaration": C.gold,
  "interface.declaration": C.amber,
  "type.declaration": C.amber,
  "enum.declaration": C.gold,
  "*.deprecated": C.textFaint
});

const assertHex = (value: string, path: string) => {
  if (!/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(value)) {
    throw new Error(`${path} must be a 6- or 8-digit hex color, got ${value}`);
  }
};

const colorSettingKeys = new Set(["foreground", "background"]);

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
  });
  for (const [id, value] of Object.entries(theme.semanticTokenColors)) assertHex(value, `semanticTokenColors.${id}`);

  const editorSurfaceDrift = editorSurfaceIds.filter((id) => theme.colors[id] !== palette.editor);
  const editorUnderlayDrift = editorUnderlayIds.filter((id) => theme.colors[id] !== palette.editorUnderlay);
  if (editorSurfaceDrift.length || editorUnderlayDrift.length) {
    throw new Error(
      `Editor surface drift. Painted: ${editorSurfaceDrift.join(", ") || "none"}. Underlay: ${editorUnderlayDrift.join(", ") || "none"}.`
    );
  }
};

const createTheme = (name: string, type: Theme["type"], palette: Palette): Theme => ({
  $schema: "vscode://schemas/color-theme",
  name,
  type,
  semanticHighlighting: true,
  colors: createWorkbenchColors(palette),
  tokenColors: createTokenColors(palette),
  semanticTokenColors: createSemanticTokenColors(palette)
});

const __dirname = dirname(fileURLToPath(import.meta.url));
const themes = [
  {
    fileName: "jacks-theme-color-theme.json",
    name: "Jack's Theme",
    type: "dark",
    palette: JACK_PALETTE
  }
] as const satisfies readonly ThemeConfig[];

for (const { fileName, name, type, palette } of themes) {
  const theme = createTheme(name, type, palette);
  assertThemeIntegrity(theme, palette);
  const outputPath = join(__dirname, "..", "themes", fileName);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, JSON.stringify(theme, null, 2) + "\n");
  console.log(`Generated ${outputPath} with ${Object.keys(theme.colors).length} workbench colors`);
}

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

type Oklch = {
  l: number;
  c: number;
  h: number;
  a?: number;
};

type FontStyle = "italic" | "bold" | "underline" | "";

type TokenRule = {
  name: string;
  scope: string | string[];
  settings: {
    foreground?: string;
    background?: string;
    fontStyle?: FontStyle;
  };
};

type Theme = {
  $schema: string;
  name: string;
  type: "dark";
  semanticHighlighting: true;
  colors: Record<string, string>;
  tokenColors: TokenRule[];
  semanticTokenColors: Record<string, string | { foreground: string; fontStyle?: FontStyle }>;
};

const oklch = (l: number, c: number, h: number, a = 1): Oklch => ({ l, c, h, a });

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const srgbChannel = (linear: number) => {
  const clamped = clamp(linear);
  const corrected = clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
  return Math.round(clamp(corrected) * 255);
};

const toHexByte = (value: number) => value.toString(16).padStart(2, "0");

const hex = ({ l, c, h, a = 1 }: Oklch) => {
  const hue = (h * Math.PI) / 180;
  const labA = Math.cos(hue) * c;
  const labB = Math.sin(hue) * c;

  const lPrime = l + 0.3963377774 * labA + 0.2158037573 * labB;
  const mPrime = l - 0.1055613458 * labA - 0.0638541728 * labB;
  const sPrime = l - 0.0894841775 * labA - 1.291485548 * labB;

  const lCube = lPrime ** 3;
  const mCube = mPrime ** 3;
  const sCube = sPrime ** 3;

  const red = srgbChannel(4.0767416621 * lCube - 3.3077115913 * mCube + 0.2309699292 * sCube);
  const green = srgbChannel(-1.2684380046 * lCube + 2.6097574011 * mCube - 0.3413193965 * sCube);
  const blue = srgbChannel(-0.0041960863 * lCube - 0.7034186147 * mCube + 1.707614701 * sCube);

  const alpha = a < 1 ? toHexByte(Math.round(clamp(a) * 255)) : "";
  return `#${toHexByte(red)}${toHexByte(green)}${toHexByte(blue)}${alpha}`;
};

const alpha = (color: Oklch, opacity: number) => hex({ ...color, a: opacity });

const palette = {
  // A near-neutral graphite ramp: very dark, not pure black, and deliberately low-chroma.
  ink0: oklch(0.138, 0.004, 260),
  ink1: oklch(0.174, 0.005, 260),
  ink2: oklch(0.216, 0.006, 260),
  ink3: oklch(0.268, 0.007, 260),
  ink4: oklch(0.332, 0.008, 260),
  ink5: oklch(0.415, 0.009, 260),
  ink6: oklch(0.505, 0.01, 260),
  text: oklch(0.91, 0.012, 86),
  textSoft: oklch(0.805, 0.014, 86),
  textMuted: oklch(0.655, 0.014, 86),
  textFaint: oklch(0.505, 0.012, 86),
  comment: oklch(0.63, 0.042, 152),
  cyan: oklch(0.785, 0.096, 198),
  teal: oklch(0.755, 0.105, 174),
  mint: oklch(0.79, 0.105, 151),
  green: oklch(0.735, 0.098, 135),
  blue: oklch(0.75, 0.088, 255),
  violet: oklch(0.76, 0.108, 292),
  purple: oklch(0.72, 0.112, 316),
  rose: oklch(0.74, 0.112, 354),
  coral: oklch(0.745, 0.122, 29),
  amber: oklch(0.825, 0.112, 78),
  gold: oklch(0.79, 0.096, 94),
  red: oklch(0.685, 0.142, 23),
  orange: oklch(0.765, 0.118, 52),
  shadow: oklch(0.035, 0.004, 260),
  white: oklch(0.985, 0.003, 86)
} as const;

const p = Object.fromEntries(Object.entries(palette).map(([key, value]) => [key, hex(value)])) as Record<
  keyof typeof palette,
  string
>;

const withAlpha = Object.fromEntries(
  Object.entries(palette).map(([key, value]) => [key, (opacity: number) => alpha(value, opacity)])
) as Record<keyof typeof palette, (opacity: number) => string>;

const colors: Theme["colors"] = {
  focusBorder: withAlpha.cyan(0.62),
  foreground: p.textSoft,
  disabledForeground: withAlpha.textMuted(0.55),
  "widget.shadow": withAlpha.shadow(0.55),
  "selection.background": withAlpha.blue(0.24),
  descriptionForeground: p.textMuted,
  errorForeground: p.red,
  "icon.foreground": p.textMuted,
  "sash.hoverBorder": withAlpha.cyan(0.65),

  "window.activeBorder": withAlpha.cyan(0.28),
  "window.inactiveBorder": withAlpha.ink5(0.2),

  "textBlockQuote.background": p.ink1,
  "textBlockQuote.border": withAlpha.teal(0.45),
  "textCodeBlock.background": p.ink1,
  "textLink.activeForeground": p.mint,
  "textLink.foreground": p.cyan,
  "textPreformat.foreground": p.textSoft,
  "textSeparator.foreground": withAlpha.ink6(0.55),

  "button.background": p.teal,
  "button.foreground": p.ink0,
  "button.hoverBackground": p.cyan,
  "button.secondaryBackground": p.ink3,
  "button.secondaryForeground": p.text,
  "button.secondaryHoverBackground": p.ink4,
  "checkbox.background": p.ink1,
  "checkbox.border": p.ink5,
  "checkbox.foreground": p.cyan,
  "dropdown.background": p.ink1,
  "dropdown.border": p.ink4,
  "dropdown.foreground": p.textSoft,
  "input.background": p.ink1,
  "input.border": p.ink4,
  "input.foreground": p.text,
  "input.placeholderForeground": p.textFaint,
  "inputOption.activeBackground": withAlpha.cyan(0.18),
  "inputOption.activeBorder": p.cyan,
  "inputValidation.errorBackground": withAlpha.red(0.16),
  "inputValidation.errorBorder": p.red,
  "inputValidation.infoBackground": withAlpha.blue(0.14),
  "inputValidation.infoBorder": p.blue,
  "inputValidation.warningBackground": withAlpha.amber(0.14),
  "inputValidation.warningBorder": p.amber,

  "badge.background": withAlpha.teal(0.22),
  "badge.foreground": p.mint,
  "progressBar.background": p.cyan,

  "list.activeSelectionBackground": withAlpha.cyan(0.16),
  "list.activeSelectionForeground": p.text,
  "list.dropBackground": withAlpha.teal(0.18),
  "list.errorForeground": p.red,
  "list.focusBackground": withAlpha.blue(0.13),
  "list.focusForeground": p.text,
  "list.highlightForeground": p.cyan,
  "list.hoverBackground": withAlpha.white(0.045),
  "list.inactiveFocusBackground": withAlpha.blue(0.1),
  "list.inactiveSelectionBackground": withAlpha.blue(0.11),
  "list.invalidItemForeground": p.rose,
  "list.warningForeground": p.amber,

  "activityBar.background": p.ink0,
  "activityBar.border": p.ink2,
  "activityBar.foreground": p.text,
  "activityBar.inactiveForeground": p.textFaint,
  "activityBar.activeBorder": p.cyan,
  "activityBar.activeBackground": withAlpha.cyan(0.08),
  "activityBarBadge.background": p.coral,
  "activityBarBadge.foreground": p.ink0,
  "activityBarTop.foreground": p.text,
  "activityBarTop.inactiveForeground": p.textFaint,
  "activityBarTop.activeBorder": p.cyan,

  "sideBar.background": p.ink0,
  "sideBar.border": p.ink2,
  "sideBar.foreground": p.textSoft,
  "sideBarTitle.foreground": p.text,
  "sideBarSectionHeader.background": p.ink1,
  "sideBarSectionHeader.border": p.ink2,
  "sideBarSectionHeader.foreground": p.textSoft,

  "editorGroup.border": p.ink2,
  "editorGroup.dropBackground": withAlpha.cyan(0.12),
  "editorGroupHeader.tabsBackground": p.ink0,
  "editorGroupHeader.tabsBorder": p.ink2,
  "editorGroupHeader.noTabsBackground": p.ink0,
  "editorGroupHeader.border": p.ink2,

  "tab.activeBackground": p.ink1,
  "tab.activeBorder": withAlpha.cyan(0.35),
  "tab.activeBorderTop": p.cyan,
  "tab.activeForeground": p.text,
  "tab.border": p.ink2,
  "tab.hoverBackground": withAlpha.white(0.04),
  "tab.hoverForeground": p.text,
  "tab.inactiveBackground": p.ink0,
  "tab.inactiveForeground": p.textFaint,
  "tab.unfocusedActiveForeground": p.textSoft,
  "tab.unfocusedInactiveForeground": p.textFaint,

  "editor.background": p.ink0,
  "editor.foreground": p.textSoft,
  "editorLineNumber.foreground": p.ink6,
  "editorLineNumber.activeForeground": p.cyan,
  "editorCursor.foreground": p.cyan,
  "editor.selectionBackground": withAlpha.blue(0.27),
  "editor.selectionHighlightBackground": withAlpha.blue(0.13),
  "editor.inactiveSelectionBackground": withAlpha.blue(0.15),
  "editor.wordHighlightBackground": withAlpha.amber(0.12),
  "editor.wordHighlightStrongBackground": withAlpha.coral(0.18),
  "editor.findMatchBackground": withAlpha.amber(0.34),
  "editor.findMatchBorder": p.amber,
  "editor.findMatchHighlightBackground": withAlpha.amber(0.16),
  "editor.findRangeHighlightBackground": withAlpha.cyan(0.1),
  "editor.hoverHighlightBackground": withAlpha.cyan(0.09),
  "editor.lineHighlightBackground": withAlpha.white(0.035),
  "editor.lineHighlightBorder": withAlpha.white(0),
  "editorLink.activeForeground": p.mint,
  "editor.rangeHighlightBackground": withAlpha.cyan(0.075),
  "editorWhitespace.foreground": withAlpha.textFaint(0.35),
  "editorIndentGuide.background1": withAlpha.textFaint(0.19),
  "editorIndentGuide.activeBackground1": withAlpha.cyan(0.55),
  "editorRuler.foreground": withAlpha.textFaint(0.24),
  "editorCodeLens.foreground": p.textFaint,
  "editorLightBulb.foreground": p.amber,
  "editorLightBulbAutoFix.foreground": p.mint,
  "editorBracketMatch.background": withAlpha.cyan(0.12),
  "editorBracketMatch.border": p.cyan,
  "editorBracketHighlight.foreground1": p.cyan,
  "editorBracketHighlight.foreground2": p.violet,
  "editorBracketHighlight.foreground3": p.amber,
  "editorBracketHighlight.foreground4": p.mint,
  "editorBracketHighlight.foreground5": p.rose,
  "editorBracketHighlight.foreground6": p.blue,
  "editorBracketHighlight.unexpectedBracket.foreground": p.red,
  "editorUnicodeHighlight.border": p.amber,
  "editorUnicodeHighlight.background": withAlpha.amber(0.14),

  "editorGutter.background": p.ink0,
  "editorGutter.addedBackground": p.green,
  "editorGutter.deletedBackground": p.red,
  "editorGutter.modifiedBackground": p.blue,
  "editorGutter.commentRangeForeground": p.comment,
  "editorOverviewRuler.addedForeground": withAlpha.green(0.85),
  "editorOverviewRuler.deletedForeground": withAlpha.red(0.85),
  "editorOverviewRuler.modifiedForeground": withAlpha.blue(0.85),
  "editorOverviewRuler.border": withAlpha.ink6(0.2),
  "editorOverviewRuler.errorForeground": p.red,
  "editorOverviewRuler.warningForeground": p.amber,
  "editorOverviewRuler.infoForeground": p.blue,
  "editorOverviewRuler.findMatchForeground": p.amber,
  "editorOverviewRuler.rangeHighlightForeground": withAlpha.cyan(0.32),
  "editorOverviewRuler.selectionHighlightForeground": withAlpha.blue(0.48),
  "editorOverviewRuler.wordHighlightForeground": withAlpha.amber(0.4),
  "editorOverviewRuler.wordHighlightStrongForeground": withAlpha.coral(0.5),
  "editorError.foreground": p.red,
  "editorError.border": withAlpha.red(0.25),
  "editorWarning.foreground": p.amber,
  "editorWarning.border": withAlpha.amber(0.24),
  "editorInfo.foreground": p.blue,
  "editorInfo.border": withAlpha.blue(0.24),
  "editorHint.foreground": p.mint,
  "problemsErrorIcon.foreground": p.red,
  "problemsWarningIcon.foreground": p.amber,
  "problemsInfoIcon.foreground": p.blue,

  "diffEditor.insertedTextBackground": withAlpha.green(0.14),
  "diffEditor.insertedLineBackground": withAlpha.green(0.08),
  "diffEditor.removedTextBackground": withAlpha.red(0.16),
  "diffEditor.removedLineBackground": withAlpha.red(0.08),
  "diffEditor.border": p.ink3,
  "diffEditor.diagonalFill": withAlpha.textFaint(0.18),
  "diffEditor.unchangedRegionBackground": p.ink1,
  "diffEditor.unchangedRegionForeground": p.textFaint,
  "diffEditor.unchangedCodeBackground": p.ink0,

  "panel.background": p.ink0,
  "panel.border": p.ink2,
  "panelTitle.activeBorder": p.cyan,
  "panelTitle.activeForeground": p.text,
  "panelTitle.inactiveForeground": p.textFaint,
  "panelInput.border": p.ink4,

  "terminal.background": p.ink0,
  "terminal.foreground": p.textSoft,
  "terminal.ansiBlack": p.ink3,
  "terminal.ansiBlue": p.blue,
  "terminal.ansiBrightBlack": p.ink6,
  "terminal.ansiBrightBlue": p.cyan,
  "terminal.ansiBrightCyan": p.teal,
  "terminal.ansiBrightGreen": p.mint,
  "terminal.ansiBrightMagenta": p.violet,
  "terminal.ansiBrightRed": p.coral,
  "terminal.ansiBrightWhite": p.white,
  "terminal.ansiBrightYellow": p.amber,
  "terminal.ansiCyan": p.cyan,
  "terminal.ansiGreen": p.green,
  "terminal.ansiMagenta": p.purple,
  "terminal.ansiRed": p.red,
  "terminal.ansiWhite": p.text,
  "terminal.ansiYellow": p.gold,
  "terminal.border": p.ink2,
  "terminalCursor.background": p.ink0,
  "terminalCursor.foreground": p.cyan,
  "terminal.selectionBackground": withAlpha.blue(0.27),

  "statusBar.background": p.ink1,
  "statusBar.border": p.ink2,
  "statusBar.foreground": p.textSoft,
  "statusBar.debuggingBackground": withAlpha.coral(0.72),
  "statusBar.debuggingForeground": p.ink0,
  "statusBar.noFolderBackground": p.ink1,
  "statusBar.noFolderForeground": p.textSoft,
  "statusBarItem.activeBackground": withAlpha.white(0.1),
  "statusBarItem.hoverBackground": withAlpha.white(0.07),
  "statusBarItem.prominentBackground": withAlpha.cyan(0.18),
  "statusBarItem.prominentForeground": p.cyan,
  "statusBarItem.remoteBackground": p.teal,
  "statusBarItem.remoteForeground": p.ink0,
  "statusBarItem.errorBackground": p.red,
  "statusBarItem.errorForeground": p.ink0,
  "statusBarItem.warningBackground": p.amber,
  "statusBarItem.warningForeground": p.ink0,

  "titleBar.activeBackground": p.ink0,
  "titleBar.activeForeground": p.text,
  "titleBar.border": p.ink2,
  "titleBar.inactiveBackground": p.ink0,
  "titleBar.inactiveForeground": p.textFaint,

  "menu.background": p.ink1,
  "menu.border": p.ink3,
  "menu.foreground": p.textSoft,
  "menu.selectionBackground": withAlpha.cyan(0.14),
  "menu.selectionForeground": p.text,
  "menu.separatorBackground": p.ink3,
  "menubar.selectionBackground": withAlpha.white(0.06),
  "menubar.selectionForeground": p.text,

  "notificationCenter.border": p.ink3,
  "notificationCenterHeader.background": p.ink1,
  "notificationCenterHeader.foreground": p.text,
  "notificationToast.border": p.ink3,
  "notifications.background": p.ink1,
  "notifications.border": p.ink3,
  "notifications.foreground": p.textSoft,
  "notificationsErrorIcon.foreground": p.red,
  "notificationsInfoIcon.foreground": p.blue,
  "notificationsWarningIcon.foreground": p.amber,

  "quickInput.background": p.ink1,
  "quickInput.foreground": p.textSoft,
  "quickInputList.focusBackground": withAlpha.cyan(0.14),
  "quickInputList.focusForeground": p.text,
  "quickInputTitle.background": p.ink2,
  "pickerGroup.border": p.ink3,
  "pickerGroup.foreground": p.cyan,

  "settings.checkboxBackground": p.ink1,
  "settings.checkboxBorder": p.ink5,
  "settings.dropdownBackground": p.ink1,
  "settings.dropdownBorder": p.ink5,
  "settings.headerForeground": p.text,
  "settings.modifiedItemIndicator": p.cyan,
  "settings.numberInputBackground": p.ink1,
  "settings.numberInputBorder": p.ink5,
  "settings.rowHoverBackground": withAlpha.white(0.04),
  "settings.sashBorder": p.ink2,
  "settings.textInputBackground": p.ink1,
  "settings.textInputBorder": p.ink5,

  "breadcrumb.background": p.ink0,
  "breadcrumb.focusForeground": p.text,
  "breadcrumb.foreground": p.textFaint,
  "breadcrumb.activeSelectionForeground": p.cyan,
  "breadcrumbPicker.background": p.ink1,

  "peekView.border": p.cyan,
  "peekViewEditor.background": p.ink1,
  "peekViewEditor.matchHighlightBackground": withAlpha.amber(0.28),
  "peekViewResult.background": p.ink0,
  "peekViewResult.fileForeground": p.text,
  "peekViewResult.lineForeground": p.textMuted,
  "peekViewResult.matchHighlightBackground": withAlpha.amber(0.22),
  "peekViewResult.selectionBackground": withAlpha.cyan(0.14),
  "peekViewResult.selectionForeground": p.text,
  "peekViewTitle.background": p.ink1,
  "peekViewTitleDescription.foreground": p.textMuted,
  "peekViewTitleLabel.foreground": p.text,

  "gitDecoration.addedResourceForeground": p.green,
  "gitDecoration.conflictingResourceForeground": p.coral,
  "gitDecoration.deletedResourceForeground": p.red,
  "gitDecoration.ignoredResourceForeground": p.textFaint,
  "gitDecoration.modifiedResourceForeground": p.blue,
  "gitDecoration.renamedResourceForeground": p.mint,
  "gitDecoration.stageDeletedResourceForeground": p.red,
  "gitDecoration.stageModifiedResourceForeground": p.blue,
  "gitDecoration.submoduleResourceForeground": p.violet,
  "gitDecoration.untrackedResourceForeground": p.green,

  "minimap.background": p.ink0,
  "minimap.findMatchHighlight": p.amber,
  "minimap.selectionHighlight": withAlpha.blue(0.48),
  "minimap.errorHighlight": p.red,
  "minimap.warningHighlight": p.amber,
  "minimapGutter.addedBackground": p.green,
  "minimapGutter.deletedBackground": p.red,
  "minimapGutter.modifiedBackground": p.blue,
  "minimapSlider.activeBackground": withAlpha.white(0.2),
  "minimapSlider.background": withAlpha.white(0.08),
  "minimapSlider.hoverBackground": withAlpha.white(0.14),

  "scrollbar.shadow": withAlpha.shadow(0.6),
  "scrollbarSlider.activeBackground": withAlpha.textMuted(0.34),
  "scrollbarSlider.background": withAlpha.textMuted(0.16),
  "scrollbarSlider.hoverBackground": withAlpha.textMuted(0.25),

  "charts.blue": p.blue,
  "charts.foreground": p.textSoft,
  "charts.green": p.green,
  "charts.lines": p.ink5,
  "charts.orange": p.orange,
  "charts.purple": p.violet,
  "charts.red": p.red,
  "charts.yellow": p.amber,

  "testing.iconErrored": p.red,
  "testing.iconFailed": p.red,
  "testing.iconPassed": p.green,
  "testing.iconQueued": p.textMuted,
  "testing.iconSkipped": p.textFaint,
  "testing.iconUnset": p.textFaint,

  "welcomePage.background": p.ink0,
  "welcomePage.buttonBackground": p.ink2,
  "welcomePage.buttonHoverBackground": p.ink3,
  "walkThrough.embeddedEditorBackground": p.ink1
};

const tokenColors: TokenRule[] = [
  {
    name: "Source text",
    scope: ["source", "meta.embedded", "text.html.markdown"],
    settings: { foreground: p.textSoft }
  },
  {
    name: "Comments",
    scope: ["comment", "punctuation.definition.comment"],
    settings: { foreground: p.comment, fontStyle: "italic" }
  },
  {
    name: "Documentation comments",
    scope: ["comment.block.documentation", "storage.type.class.jsdoc", "entity.name.type.instance.jsdoc"],
    settings: { foreground: p.textMuted, fontStyle: "italic" }
  },
  {
    name: "Keywords and control flow",
    scope: ["keyword", "keyword.control", "keyword.operator.expression", "storage.modifier"],
    settings: { foreground: p.violet }
  },
  {
    name: "TypeScript imports and exports",
    scope: ["keyword.control.import", "keyword.control.export", "storage.modifier.async"],
    settings: { foreground: p.purple }
  },
  {
    name: "Storage and declarations",
    scope: ["storage.type", "storage.type.function", "storage.type.class", "storage.type.interface"],
    settings: { foreground: p.violet }
  },
  {
    name: "Operators",
    scope: ["keyword.operator", "punctuation.accessor", "punctuation.separator.key-value"],
    settings: { foreground: p.cyan }
  },
  {
    name: "Strings",
    scope: ["string", "constant.other.symbol"],
    settings: { foreground: p.green }
  },
  {
    name: "Template strings",
    scope: ["string.template", "punctuation.definition.template-expression"],
    settings: { foreground: p.mint }
  },
  {
    name: "Regular expressions",
    scope: ["string.regexp", "constant.character.escape"],
    settings: { foreground: p.teal }
  },
  {
    name: "Numbers and constants",
    scope: ["constant.numeric", "constant.language", "constant.character", "variable.other.constant"],
    settings: { foreground: p.coral }
  },
  {
    name: "Booleans and nullish values",
    scope: ["constant.language.boolean", "constant.language.null", "constant.language.undefined"],
    settings: { foreground: p.orange }
  },
  {
    name: "Functions",
    scope: ["entity.name.function", "support.function", "meta.function-call", "variable.function"],
    settings: { foreground: p.cyan }
  },
  {
    name: "Methods",
    scope: ["entity.name.function.member", "support.function.dom", "meta.method-call", "variable.other.object.property"],
    settings: { foreground: p.blue }
  },
  {
    name: "Classes and constructors",
    scope: ["entity.name.type.class", "entity.name.class", "support.class", "support.type"],
    settings: { foreground: p.amber }
  },
  {
    name: "Interfaces, aliases, and type parameters",
    scope: [
      "entity.name.type.interface",
      "entity.name.type.alias",
      "entity.name.type",
      "entity.name.type.module",
      "support.type.primitive",
      "meta.type.parameters"
    ],
    settings: { foreground: p.gold }
  },
  {
    name: "Object keys and properties",
    scope: [
      "meta.object-literal.key",
      "support.type.property-name",
      "variable.other.property",
      "variable.other.member",
      "meta.property.object"
    ],
    settings: { foreground: p.text }
  },
  {
    name: "Parameters",
    scope: ["variable.parameter", "meta.parameters", "entity.name.variable.parameter"],
    settings: { foreground: p.rose }
  },
  {
    name: "Variables",
    scope: ["variable", "variable.other.readwrite", "entity.name.variable"],
    settings: { foreground: p.textSoft }
  },
  {
    name: "Decorators and annotations",
    scope: ["meta.decorator", "entity.name.function.decorator", "punctuation.decorator"],
    settings: { foreground: p.rose }
  },
  {
    name: "JSX components",
    scope: ["entity.name.tag.tsx", "support.class.component.tsx", "entity.other.attribute-name"],
    settings: { foreground: p.amber }
  },
  {
    name: "JSX punctuation and attributes",
    scope: ["punctuation.definition.tag", "punctuation.definition.tag.begin", "punctuation.definition.tag.end"],
    settings: { foreground: p.teal }
  },
  {
    name: "HTML and XML tags",
    scope: ["entity.name.tag", "meta.tag"],
    settings: { foreground: p.cyan }
  },
  {
    name: "CSS selectors",
    scope: ["entity.other.attribute-name.class.css", "entity.other.attribute-name.id.css", "entity.name.tag.css"],
    settings: { foreground: p.amber }
  },
  {
    name: "CSS properties",
    scope: ["support.type.property-name.css", "support.type.vendored.property-name.css"],
    settings: { foreground: p.blue }
  },
  {
    name: "Markdown headings",
    scope: ["markup.heading", "entity.name.section.markdown"],
    settings: { foreground: p.cyan, fontStyle: "bold" }
  },
  {
    name: "Markdown links",
    scope: ["markup.underline.link", "string.other.link"],
    settings: { foreground: p.mint }
  },
  {
    name: "Markup emphasis",
    scope: ["markup.italic"],
    settings: { foreground: p.violet, fontStyle: "italic" }
  },
  {
    name: "Markup bold",
    scope: ["markup.bold"],
    settings: { foreground: p.amber, fontStyle: "bold" }
  },
  {
    name: "Inserted content",
    scope: ["markup.inserted", "meta.diff.header.to-file"],
    settings: { foreground: p.green }
  },
  {
    name: "Deleted content",
    scope: ["markup.deleted", "meta.diff.header.from-file"],
    settings: { foreground: p.red }
  },
  {
    name: "Changed content",
    scope: ["markup.changed"],
    settings: { foreground: p.blue }
  },
  {
    name: "Invalid",
    scope: ["invalid", "invalid.illegal"],
    settings: { foreground: p.red }
  },
  {
    name: "Punctuation",
    scope: ["punctuation", "meta.brace", "punctuation.definition.block"],
    settings: { foreground: p.textMuted }
  }
];

const semanticTokenColors: Theme["semanticTokenColors"] = {
  namespace: p.teal,
  type: p.gold,
  class: p.amber,
  enum: p.amber,
  interface: p.gold,
  struct: p.amber,
  typeParameter: p.violet,
  parameter: p.rose,
  variable: p.textSoft,
  property: p.text,
  enumMember: p.coral,
  event: p.rose,
  function: p.cyan,
  method: p.blue,
  macro: p.violet,
  keyword: p.violet,
  modifier: p.purple,
  comment: { foreground: p.comment, fontStyle: "italic" },
  string: p.green,
  number: p.coral,
  regexp: p.teal,
  operator: p.cyan,
  decorator: p.rose,
  "variable.readonly": p.orange,
  "property.readonly": p.gold,
  "parameter.declaration": p.rose,
  "function.declaration": p.cyan,
  "method.declaration": p.blue,
  "class.declaration": { foreground: p.amber, fontStyle: "bold" },
  "interface.declaration": { foreground: p.gold, fontStyle: "bold" },
  "type.declaration": { foreground: p.gold, fontStyle: "bold" },
  "enum.declaration": { foreground: p.amber, fontStyle: "bold" },
  "*.deprecated": { foreground: p.textFaint, fontStyle: "underline" }
};

const theme: Theme = {
  $schema: "vscode://schemas/color-theme",
  name: "Jack's Theme",
  type: "dark",
  semanticHighlighting: true,
  colors,
  tokenColors,
  semanticTokenColors
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = join(__dirname, "..", "themes", "jacks-theme-color-theme.json");

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(theme, null, 2)}\n`);
console.log(`Generated ${outputPath}`);

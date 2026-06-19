import type { Hex } from "./theme.js";

// Theme files stop at this semantic layer. They provide complete values for
// every style group below, and workbench.ts is the only module that translates
// these roles to concrete VS Code color IDs. Use noBorder(...) instead of
// omitting an absent border so an intentional non-value is explicit in source.

export type BorderStyle = Readonly<
  | {
      kind: "none";
      color: Hex;
      reason: string;
    }
  | {
      kind: "visible";
      color: Hex;
    }
>;

export const noBorder = (
  transparent: Hex,
  reason = "This semantic border role is intentionally not drawn.",
): BorderStyle => ({ kind: "none", color: transparent, reason });

export const visibleBorder = (color: Hex): BorderStyle => ({
  kind: "visible",
  color,
});

export const borderColor = (border: BorderStyle): Hex => border.color;

export type WorkbenchSurfaceStyles = {
  editor: Hex;
  underlay: Hex;
  panel: Hex;
  popup: Hex;
  hover: Hex;
  active: Hex;
  guide: Hex;
  activity: Hex;
  activityActive: Hex;
  sidebar: Hex;
  sidebarSection: Hex;
  tabActive: Hex;
  tabInactive: Hex;
  panelArea: Hex;
  statusBar: Hex;
  titleBar: Hex;
  titleBarInactive: Hex;
  commandCenter: Hex;
  commandCenterActive: Hex;
  notificationHeader: Hex;
  quickInputTitle: Hex;
  settingsInput: Hex;
  menuSelection: Hex;
  welcomeTile: Hex;
};

export type WorkbenchTextStyles = {
  primary: Hex;
  muted: Hex;
  faint: Hex;
  disabled: Hex;
  description: Hex;
  icon: Hex;
  link: Hex;
  onAccent: Hex;
  error: Hex;
  warning: Hex;
  info: Hex;
  success: Hex;
  ember: Hex;
  plum: Hex;
};

export type WorkbenchAccentStyles = {
  primary: Hex;
  selection: Hex;
  success: Hex;
  danger: Hex;
  warning: Hex;
  info: Hex;
  debug: Hex;
  badge: Hex;
  toggled: Hex;
  prominent: Hex;
};

export type WorkbenchOverlayStyles = {
  shadow: Hex;
  subtle: Hex;
  medium: Hex;
  selection: Hex;
  searchHighlight: Hex;
  searchMatch: Hex;
  lineHighlight: Hex;
  wordHighlight: Hex;
  wordHighlightStrong: Hex;
  wordHighlightText: Hex;
  fold: Hex;
  diffInsertedLine: Hex;
  diffInsertedText: Hex;
  diffRemovedLine: Hex;
  diffRemovedText: Hex;
  commandDebugging: Hex;
  minimapOpacity: Hex;
  scrollbarActive: Hex;
  scrollbar: Hex;
  scrollbarHover: Hex;
};

export type WorkbenchBorderStyles = {
  editorLineHighlight: BorderStyle;
  editorRangeHighlight: BorderStyle;
  editorSelectionHighlight: BorderStyle;
  editorSymbolHighlight: BorderStyle;
  editorWordHighlight: BorderStyle;
  editorWordHighlightStrong: BorderStyle;
  editorWordHighlightText: BorderStyle;
  widget: BorderStyle;
  widgetResize: BorderStyle;
  window: BorderStyle;
  contentDivider: BorderStyle;
  separator: BorderStyle;
  control: BorderStyle;
  validationError: BorderStyle;
  validationWarning: BorderStyle;
  validationInfo: BorderStyle;
  activityDivider: BorderStyle;
  sidebarDivider: BorderStyle;
  sidebarSection: BorderStyle;
  editorGroup: BorderStyle;
  editorGroupHeader: BorderStyle;
  tabDivider: BorderStyle;
  findMatch: BorderStyle;
  bracketMatch: BorderStyle;
  unicodeHighlight: BorderStyle;
  overviewRuler: BorderStyle;
  diff: BorderStyle;
  panel: BorderStyle;
  panelInput: BorderStyle;
  terminal: BorderStyle;
  debugToolbar: BorderStyle;
  statusBar: BorderStyle;
  titleBar: BorderStyle;
  menu: BorderStyle;
  commandCenter: BorderStyle;
  notification: BorderStyle;
  picker: BorderStyle;
  settingsControl: BorderStyle;
  settingsSash: BorderStyle;
  peek: BorderStyle;
  welcomeTile: BorderStyle;
  chartLine: BorderStyle;
};

export type WorkbenchColorPair = {
  background: Hex;
  foreground: Hex;
};

export type WorkbenchHoverColorPair = WorkbenchColorPair & {
  hoverBackground: Hex;
};

export type WorkbenchControlsStyles = {
  primaryButton: WorkbenchHoverColorPair;
  secondaryButton: WorkbenchHoverColorPair;
  checkbox: WorkbenchColorPair;
  dropdown: WorkbenchColorPair & { listBackground: Hex };
  input: WorkbenchColorPair & { placeholderForeground: Hex };
  inputOption: WorkbenchColorPair & { hoverBackground: Hex };
  validation: {
    error: WorkbenchColorPair;
    info: WorkbenchColorPair;
    warning: WorkbenchColorPair;
  };
  badge: WorkbenchColorPair;
  progress: Hex;
};

export type WorkbenchListStyles = {
  activeSelection: WorkbenchColorPair;
  focus: WorkbenchColorPair;
  inactiveSelection: WorkbenchColorPair;
  inactiveFocusBackground: Hex;
  hoverBackground: Hex;
  dropBackground: Hex;
  highlightForeground: Hex;
  errorForeground: Hex;
  warningForeground: Hex;
  invalidItemForeground: Hex;
};

export type WorkbenchEditorStyles = {
  foreground: Hex;
  lineNumber: Hex;
  activeLineNumber: Hex;
  dimmedLineNumber: Hex;
  cursorBackground: Hex;
  cursorForeground: Hex;
  selection: WorkbenchColorPair;
  whitespaceForeground: Hex;
  indentGuide: Hex;
  activeIndentGuide: Hex;
  rulerForeground: Hex;
  codeLensForeground: Hex;
  lightBulbForeground: Hex;
  lightBulbAutoFixForeground: Hex;
  bracketMatchBackground: Hex;
  bracketHighlightForeground: Hex;
  unexpectedBracketForeground: Hex;
  unicodeHighlightBackground: Hex;
  inlineValues: WorkbenchColorPair;
};

export type WorkbenchStyles = {
  transparent: Hex;
  surfaces: WorkbenchSurfaceStyles;
  text: WorkbenchTextStyles;
  accents: WorkbenchAccentStyles;
  overlays: WorkbenchOverlayStyles;
  borders: WorkbenchBorderStyles;
  controls: WorkbenchControlsStyles;
  lists: WorkbenchListStyles;
  editor: WorkbenchEditorStyles;
};

export const defineWorkbenchStyles = (
  styles: WorkbenchStyles,
): WorkbenchStyles => styles;

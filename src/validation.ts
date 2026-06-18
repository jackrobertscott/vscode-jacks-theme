import {
  assertHex,
  compositeOver,
  contrastRatio,
  oklabDistance,
  relativeLuminance,
  stripHash,
} from "./colors.js";
import type {
  BorderIntegrity,
  FontPalette,
  Hex,
  Palette,
  Theme,
  ThemeIntegrity,
} from "./theme.js";
import { editorSurfaceIds, editorUnderlayIds } from "./workbench.js";

const colorSettingKeys = new Set(["foreground", "background"]);

const visibleAlphaWorkbenchColors = new Set([
  "editor.findMatchBackground",
  "peekViewEditor.matchHighlightBackground",
  "peekViewResult.matchHighlightBackground",
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
const minimumEditorTextContrast = 4.5;
const minimumBadgeTextContrast = 4.5;
const minimumWorkbenchTextContrast = 4.5;
const minimumSyntaxRoleDistance = 0.09;
const minimumWordHighlightContrast = 1.75;
const maximumWordHighlightContrast = 2.15;
const decorativeSemanticTokens = new Set(["*.deprecated"]);

const usesVisibleAlpha = (value: Hex) =>
  stripHash(value).length === 8 && !value.endsWith("00");

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

const visibleBorderIds = (policy: BorderIntegrity): ReadonlySet<string> =>
  policy.kind === "transparent" ? new Set() : new Set(policy.visibleIds);

const assertBorderPolicy = (
  id: string,
  value: Hex,
  transparent: Hex,
  policy: BorderIntegrity,
) => {
  if (!borderlessWorkbenchColorPattern.test(id)) return;

  if (policy.kind === "transparent") {
    if (value !== transparent) {
      throw new Error(
        `colors.${id} must be transparent because visible borders are disabled`,
      );
    }
    return;
  }

  if (value !== transparent && !visibleBorderIds(policy).has(id)) {
    throw new Error(
      `colors.${id} has a visible border color but is not in this theme's border allow-list`,
    );
  }
};

const assertUniformBorders = (theme: Theme, palette: Palette, policy: BorderIntegrity) => {
  if (policy.kind !== "uniform") return;

  const visibleColors = new Set(
    Object.entries(theme.colors)
      .filter(
        ([id, value]) =>
          policy.visibleIds.includes(id) && value !== palette.background.transparent,
      )
      .map(([, value]) => value),
  );

  if (visibleColors.size !== 1 || !visibleColors.has(policy.color)) {
    throw new Error(
      `Theme must use only the configured border color ${policy.color}`,
    );
  }

  for (const [id, color] of policy.lighterThan) {
    if (relativeLuminance(policy.color) <= relativeLuminance(color)) {
      throw new Error(
        `Border color ${policy.color} must be lighter than ${id} ${color}`,
      );
    }
  }

  for (const [id, color] of policy.darkerThan) {
    if (relativeLuminance(policy.color) >= relativeLuminance(color)) {
      throw new Error(
        `Border color ${policy.color} must stay subtler than ${id} ${color}`,
      );
    }
  }
};

const assertRequiredMappedBorders = (
  theme: Theme,
  palette: Palette,
  policy: BorderIntegrity,
) => {
  if (policy.kind !== "mapped" || !policy.requiredVisibleIds) return;

  const missing = policy.requiredVisibleIds.filter(
    (id) =>
      theme.colors[id] !== undefined &&
      theme.colors[id] === palette.background.transparent,
  );

  if (missing.length) {
    throw new Error(
      `Theme must keep visible mapped borders for: ${missing.join(", ")}`,
    );
  }
};

export const assertThemeIntegrity = (
  theme: Theme,
  palette: Palette,
  fontPalette: FontPalette,
  options: ThemeIntegrity,
) => {
  const B = palette.background;
  assertSyntaxColorSeparation(fontPalette);

  for (const [id, value] of Object.entries(theme.colors)) {
    assertHex(value, `colors.${id}`);
    assertBorderPolicy(id, value, B.transparent, options.borderPolicy);
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

  assertUniformBorders(theme, palette, options.borderPolicy);
  assertRequiredMappedBorders(theme, palette, options.borderPolicy);

  for (const [foregroundId, backgroundId] of options.workbenchTextPairs ?? []) {
    const foreground = theme.colors[foregroundId];
    const background = theme.colors[backgroundId];
    if (!foreground || !background) {
      throw new Error(
        `Workbench text contrast pair ${foregroundId} on ${backgroundId} references a missing color`,
      );
    }
    const ratio = contrastRatio(foreground, background);
    if (ratio < minimumWorkbenchTextContrast) {
      throw new Error(
        `Workbench pair ${foregroundId} on ${backgroundId} contrast ${ratio.toFixed(2)} is below ${minimumWorkbenchTextContrast}`,
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

  const wordHighlightIds = [
    "editor.wordHighlightBackground",
    "editor.wordHighlightStrongBackground",
    "editor.wordHighlightTextBackground",
  ] as const;
  for (const id of wordHighlightIds) {
    const effectiveColor = compositeOver(theme.colors[id], B.editor);
    const ratio = contrastRatio(effectiveColor, B.editor);
    if (ratio < minimumWordHighlightContrast) {
      throw new Error(
        `colors.${id} effective contrast ${ratio.toFixed(2)} is below ${minimumWordHighlightContrast}`,
      );
    }
    if (ratio > maximumWordHighlightContrast) {
      throw new Error(
        `colors.${id} effective contrast ${ratio.toFixed(2)} is above ${maximumWordHighlightContrast}`,
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

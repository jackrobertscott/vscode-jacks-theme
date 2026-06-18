import { keys } from "./colors.js";
import { JACK_FONT_COLORS, JACK_PALETTE } from "./jacks-color-theme.js";
import { defineTheme, featureGroup } from "./theme.js";
import { createWorkbenchFeatureGroups } from "./workbench.js";

const dividerBorderIds = [
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
] as const;

const workbench = [
  ...createWorkbenchFeatureGroups(JACK_PALETTE),
  featureGroup(
    "wireframe.dividers",
    keys(dividerBorderIds, JACK_PALETTE.border.divider),
  ),
];

export const theme = defineTheme({
  order: 20,
  fileName: "jacks-theme-bordered-color-theme.json",
  name: "Jack's Theme Bordered",
  type: "dark",
  palette: JACK_PALETTE,
  fontPalette: JACK_FONT_COLORS,
  workbench,
  integrity: {
    borderPolicy: {
      kind: "uniform",
      visibleIds: dividerBorderIds,
      color: JACK_PALETTE.border.divider,
      lighterThan: [
        ["editor background", JACK_PALETTE.background.editor],
        ["popup background", JACK_PALETTE.background.popup],
      ],
      darkerThan: [["hover background", JACK_PALETTE.background.hover]],
    },
  },
});

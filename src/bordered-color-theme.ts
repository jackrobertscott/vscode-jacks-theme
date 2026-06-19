import {
  createJackWorkbenchBorders,
  createJackWorkbenchStyles,
  JACK_FONT_COLORS,
  JACK_PALETTE,
} from "./jacks-color-theme.js";
import { defineTheme } from "./theme.js";
import {
  getVisibleWorkbenchBorderColorIds,
  workbenchTextPairs,
} from "./workbench.js";

const CARBON_WORKBENCH_STYLES = createJackWorkbenchStyles(
  JACK_PALETTE,
  createJackWorkbenchBorders(JACK_PALETTE, JACK_PALETTE.border.divider),
);
const carbonVisibleBorderIds = getVisibleWorkbenchBorderColorIds(
  CARBON_WORKBENCH_STYLES,
);

export const theme = defineTheme({
  order: 10,
  fileName: "jacks-carbon-theme-color-theme.json",
  name: "Jack's Carbon Theme",
  type: "dark",
  palette: JACK_PALETTE,
  fontPalette: JACK_FONT_COLORS,
  workbench: CARBON_WORKBENCH_STYLES,
  integrity: {
    borderPolicy: {
      kind: "uniform",
      visibleIds: carbonVisibleBorderIds,
      color: JACK_PALETTE.border.divider,
      lighterThan: [
        ["editor background", JACK_PALETTE.background.editor],
        ["popup background", JACK_PALETTE.background.popup],
      ],
      darkerThan: [["hover background", JACK_PALETTE.background.hover]],
    },
    workbenchTextPairs,
  },
});

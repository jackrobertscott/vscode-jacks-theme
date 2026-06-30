# Changelog

All notable changes to Jack's Theme are tracked here. Version headings match the extension version in `package.json`.

## 0.6.9 - 2026-06-30

### Changed

- Muted Jack's Draft Theme neutral borders to a low-contrast paper-edge color so dividers no longer read as dark ink lines.

## 0.6.8 - 2026-06-30

### Changed

- Softened Jack's Draft Theme structural borders with a warmer taupe rule so the light paper UI feels drafted rather than heavily inked.
- Kept generated theme validation compatible with the current VS Code workbench color registry bundle.

## 0.6.7 - 2026-06-22

### Changed

- Darkened Jack's Graphite Theme editor and code surfaces below the surrounding chrome, then retuned the graphite ramp, guide colour, and highlight wash so focused tabs, sidebars, panels, and editor overlays keep premium low-contrast separation.

## 0.6.6 - 2026-06-22

### Changed

- Recut Jack's Graphite Theme borders as a darker graphite shadow line so dividers and control outlines feel quieter against the medium-grey surfaces.

## 0.6.5 - 2026-06-19

### Added

- Added a reusable generated-theme schema validation script and wired it into the finish workflow so VS Code color registry and transparent-color checks run through `npm run finish`.

### Changed

- Documented that standard end-of-work checklists should be encoded in reusable scripts before future agents run them.

## 0.6.4 - 2026-06-19

### Changed

- Softened Jack's Graphite Theme border color so dividers and control outlines read less strongly against the medium graphite surfaces.

## 0.6.3 - 2026-06-19

### Added

- Added reusable finish-work and Marketplace publish scripts so generation, typechecking, version metadata checks, packaging, local installation, and release publishing can run from npm commands.

## 0.6.2 - 2026-06-19

### Changed

- Made the editor overview ruler border transparent across all themes so the vertical scrollbar edge no longer doubles up with the header border while horizontal scrollbars remain borderless.

## 0.6.1 - 2026-06-19

### Changed

- Forced focus, hover-outline, and active/selection border indicators transparent across all themes so structural dividers remain the only settable UI borders.

## 0.6.0 - 2026-06-19

### Changed

- Published the Carbon, Graphite, Silver, and Draft theme lineup as the 0.6.0 Marketplace release.

## 0.5.29 - 2026-06-19

### Changed

- Removed the borderless dark theme variant and renamed the remaining variants to Jack's Carbon Theme, Jack's Graphite Theme, Jack's Silver Theme, and Jack's Draft Theme.

## 0.5.28 - 2026-06-18

### Changed

- Darkened Jack's Grey Light Theme borders so they read more strongly against all neutral grey surfaces.

## 0.5.27 - 2026-06-18

### Changed

- Matched Jack's Grey Light Theme to Jack's Grey Theme's visible neutral border roles while keeping the light-mode borders darker than the mid-grey surfaces.

## 0.5.26 - 2026-06-18

### Changed

- Reworked the light-mode grey variant into Jack's Grey Light Theme with mid-level grey surfaces instead of pale light-grey surfaces.

## 0.5.25 - 2026-06-18

### Added

- Added Jack's Light Grey Theme, a light mode companion to Jack's Grey Theme with muted concrete surfaces, dark syntax accents, cool slate selections, and transparent borders.

## 0.5.24 - 2026-06-18

### Changed

- Title-cased contributed theme labels and generated theme names.

## 0.5.23 - 2026-06-18

### Changed

- Strengthened Jack's Grey Theme with visible neutral workbench borders and a darker editor/code surface for higher syntax contrast.

## 0.5.22 - 2026-06-18

### Added

- Added Jack's Grey Theme, a medium-grey dark theme with graphite surfaces, soft raised chrome, cool slate selections, and bright pastel syntax accents.

### Changed

- Renamed contributed theme labels to Jack's Grey Theme, Jack's Bordered Theme, Jack's Theme, and Jack's Mockup Theme.

## 0.5.21 - 2026-06-18

### Changed

- Refactored generated workbench colors behind a shared semantic style layer so all three themes provide the same grouped style values before VS Code color IDs are emitted.
- Added explicit semantic no-border values and shared workbench contrast checks across the dark, bordered, and mockup themes.

## 0.5.20 - 2026-06-18

### Changed

- Renamed source theme modules to lowercase hyphenated filenames and added generation-time source filename integrity checks.

## 0.5.19 - 2026-06-18

### Changed

- Split the theme generator into flat TypeScript modules with per-theme definition files and feature-grouped workbench styling.

## 0.5.18 - 2026-06-18

### Changed

- Softened Jack's Theme Mockup with dimmer parchment surfaces and toned-down blueprint, sticky-note, and redline fills for easier viewing.

## 0.5.17 - 2026-06-18

### Changed

- Reworked Jack's Theme Mockup with visible wireframe-style borders across workbench frames, panels, tabs, controls, menus, notifications, and validation states.

## 0.5.16 - 2026-06-18

### Changed

- Removed Jack's Theme Retro and replaced it with Jack's Theme Mockup, a warm light theme with paper surfaces, graphite text, blueprint selections, sticky-note highlights, and redline diagnostics.

## 0.5.15 - 2026-06-18

### Changed

- Restored visible commit/action button surfaces in Jack's Theme Retro with distinct filled button backgrounds and hard black button borders.

## 0.5.14 - 2026-06-16

### Changed

- Renamed the retro variant to Jack's Theme Retro for consistent theme naming and contribution metadata.

## 0.5.13 - 2026-06-16

### Changed

- Softened Jack's Theme Retro with slightly darker classic PC greys, muted steel-blue selected states, and cohesive blue-grey editor highlights.

## 0.5.12 - 2026-06-16

### Changed

- Lightened Jack's Theme Retro top bar and command center active state so title-bar text and controls remain readable.

## 0.5.11 - 2026-06-16

### Changed

- Refined Jack's Theme Retro with warmer classic PC greys, cohesive VGA-style accents, and enforced retro UI contrast pairs.

## 0.5.10 - 2026-06-16

### Changed

- Reworked Jack's Theme Retro into a light classic PC theme with Windows-era greys, dark text, hard black borders, and navy selected states.

## 0.5.9 - 2026-06-16

### Changed

- Redesigned Jack's Theme Retro around darker classic PC greys, blue selection surfaces, and brighter VGA-style syntax accents.

## 0.5.8 - 2026-06-16

### Added

- Added Jack's Theme Retro, a medium grey old-PC inspired theme option with clean retro syntax accents.

## 0.5.7 - 2026-05-31

### Changed

- Softened the plum marker highlights and added a subtle plum tint to the active editor line.

## 0.5.6 - 2026-05-31

### Changed

- Matched editor find and Vim search highlights to the soft plum marker palette.

## 0.5.5 - 2026-05-31

### Changed

- Replaced the blue line highlight and yellow word-match marker with a neutral active line and soft plum word-match palette.

## 0.5.4 - 2026-05-31

### Changed

- Changed editor word-match highlights from muted blue to a restrained yellow-ochre marker hue.

## 0.5.3 - 2026-05-31

### Changed

- Rebalanced editor word-match highlights to a more muted analogous blue with bounded contrast.

## 0.5.2 - 2026-05-31

### Changed

- Increased editor word-match highlight contrast while keeping VS Code-required transparent highlight colors.

## 0.5.1 - 2026-05-29

### Changed

- Removed colored diff editor gutter backgrounds so merge result lines do not show a deletion strip beside insertion backgrounds.

## 0.5.0 - 2026-05-25

### Changed

- Released the SCM graph hover popup and branch badge contrast fixes.

## 0.4.24 - 2026-05-25

### Changed

- Changed SCM graph branch badge text to dark foregrounds for readable contrast on colored badges.

## 0.4.23 - 2026-05-25

### Changed

- Matched built-in SCM graph commit hover popups and labels to the theme popup palette.

## 0.4.22 - 2026-05-24

### Changed

- Kept JSX child text neutral by limiting blue tag coloring to actual tag names.

## 0.4.21 - 2026-05-20

### Changed

- Softened diff editor red and green backgrounds so text selections remain visible on changed lines.

## 0.4.20 - 2026-05-18

### Changed

- Increased the bordered theme divider contrast while keeping it on the neutral surface ladder.

## 0.4.19 - 2026-05-18

### Changed

- Changed the bordered theme divider to a slightly lighter neutral step above the editor background.

## 0.4.18 - 2026-05-18

### Changed

- Lightened the bordered theme divider color while keeping it darker than the editor background.

## 0.4.17 - 2026-05-18

### Changed

- Changed Jack's Theme Bordered to use one darker divider border color only for content separation.
- Removed visible active, focus, and selected-control borders from the bordered theme.

## 0.4.16 - 2026-05-18

### Changed

- Softened the regular status bar text and icon foreground color.

## 0.4.15 - 2026-05-15

### Changed

- Changed editor, terminal, peek, and minimap highlights to use the cursor-matched blue color family.

## 0.4.14 - 2026-05-15

### Changed

- Changed Jack's Theme Bordered to use only grayscale border colors.
- Matched the active editor line highlight to the cursor color family.

## 0.4.13 - 2026-05-15

### Added

- Added Jack's Theme Bordered, a second generated theme variant with subtle workbench UI borders.

## 0.4.12 - 2026-05-15

### Changed

- Added public GitHub repository metadata for `jackrobertscott/vscode-jacks-theme`.

## 0.4.11 - 2026-05-15

### Changed

- Removed chroma from neutral foreground palette colors so default text, muted text, faint text, and comments render as true grayscale.

## 0.4.10 - 2026-05-15

### Changed

- Restored the scrollbar track to full transparency and softened the scrollbar thumb with transparent theme-matched states.

## 0.4.9 - 2026-05-15

### Changed

- Replaced non-constrained transparent background colors with opaque theme-matched surfaces.

## 0.4.8 - 2026-05-15

### Changed

- Added theme-matched debug control icon colors for the floating debug toolbar.

## 0.4.7 - 2026-05-15

### Changed

- Matched the floating debug toolbar background to the theme's dark popup surface.

## 0.4.6 - 2026-05-15

### Changed

- Brightened and separated semantic background palette colors for clearer git diff, gutter, and status treatments.
- Set explicit debugging command bar colors to avoid the default grey toolbar.

## 0.4.5 - 2026-05-15

### Added

- Added a blocky theme icon based on the palette colors.

## 0.4.4 - 2026-05-15

### Added

- Added Marketplace-safe badges for the extension version, VS Code engine range, and MIT license.
- Added `CHANGELOG.md` and `SUPPORT.md` for Marketplace extension metadata.
- Added package keywords for theme discovery.

### Changed

- Rewrote the README for Marketplace presentation, local installation, and development workflow.

## 0.4.3 - 2026-05-15

### Changed

- Prepared the theme package for Marketplace publishing.

## Earlier History

Earlier repository history was not tagged by release version. The changelog below is reconstructed from git commit subjects.

- Restored neutral variable coloring.
- Refactored the theme palettes.
- Limited warm palette treatment to editor tokens.
- Updated the warm font palette.
- Separated syntax palette roles and increased syntax color separation.
- Aligned TypeScript symbol colors.
- Lightened and rebalanced the theme font and syntax palettes.
- Added and refined theme color roles, including reef, purple type, and OKLCH source colors.
- Fixed generated theme schema warnings.
- Recorded local VS Code install and schema validation instructions.
- Removed the secondary theme and packaged artifacts from source history.

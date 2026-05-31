# Changelog

All notable changes to Jack's Theme are tracked here. Version headings match the extension version in `package.json`.

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

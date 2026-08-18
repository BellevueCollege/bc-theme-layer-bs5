# Changelog

All notable changes to `bc-theme-layer-bs5` are documented here.

## Unreleased

### Added

- Shared theme JS: `ComponentBase`, `WindowState`, `AnimationBase`, `AccessibleMenu`, `ButtonToggle`, `HeaderState`, and `Slider`
- `UntilFoundCollapse` / `UntilFoundTab` plus `_hidden-until-found.scss` (included by `_minimal` and `_full` presets)
- `inViewport` utility (legacy fallback for `AnimationBase`)
- `events`, `focus-trap`, and `swiper` dependencies (relative imports use `.js` extensions for ESM)

## [1.1.0] - 2026-07-01

### Changed

- Restructured `scss/config/` → `scss/bootstrap/` with three layers:
  - `_tokens.scss` — BC variable overrides (`!default`)
  - `_vars.scss` — Sass variables/mixins only (no CSS output)
  - `_config.scss` — `_vars` plus Bootstrap `root`, `helpers`, `utilities/api`
- Renamed `css-variables/_generate.scss` → `css-variables/_css-variables.scss`
- Renamed `editor/_scope.scss` → `editor/_editor-scope.scss`
- Unified heading CSS variable prefix via `$css-var-prefix` in `bootstrap/_tokens.scss`
- Renamed CSS variable generator parameters:
  - `$theme-colors` → `$utility-colors`
  - `$prefix-theme-colors` → `$prefixed-utility-colors`
  - `$prefix-spacing` → `$prefixed-container-spacing`
  - `$prefix-headings` → `$prefixed-heading-sizes`
  - `$generate-heading-vars` → `$generate-heading-size-vars`
- Added `package.json` `exports` map for reliable `bc-theme-layer-bs5/js` imports
- Added `files` field to `package.json`
- Expanded inline Sassdoc/JSDoc across all package SCSS and JS files
- Rewrote README with folder layout, naming reference, and import decision tree

### Removed

- `scss/_index.scss` (misleading stub)
- `presets/_tabs.scss` (unused; use `presets/_nav` for tab styling)

### Migration

Themes must update import paths:

| Old | New |
|-----|-----|
| `scss/config/_tokens` | `scss/bootstrap/_tokens` |
| `scss/config/_bootstrap-config` | `scss/bootstrap/_config` or `scss/bootstrap/_vars` |
| `scss/css-variables/_generate` | `scss/css-variables/_css-variables` |
| `scss/editor/_scope` | `scss/editor/_editor-scope` |

Bellevue must set `$css-var-prefix: 'b22-';` **before** importing `bootstrap/_tokens`.

## [1.0.1] - Initial release

- Shared Bootstrap 5 SCSS tokens, config, presets, CSS variable generator, and JS helpers

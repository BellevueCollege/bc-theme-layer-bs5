# bc-theme-layer-bs5

Shared Bootstrap 5 SCSS and theme JavaScript for Bellevue College WordPress themes. Single source of truth for Bootstrap tokens, the Sass config stack, component presets, CSS variable generation, editor scoping, JS init helpers, and shared UI modules.

## Installation

```json
"bc-theme-layer-bs5": "github:BellevueCollege/bc-theme-layer-bs5#v1.1.0"
```

Then run `npm install`.

### Local development (`npm link`)

Before `v1.1.0` is tagged, link this repo into consuming themes so builds use your working copy:

```bash
# In bc-theme-layer-bs5
npm link

# In bellevue-2022 or bc-sitka-spruce-department-theme
npm link bc-theme-layer-bs5
```

Themes keep `github:BellevueCollege/bc-theme-layer-bs5#v1.0.1` in `package.json` for CI and fresh installs; `npm link` overrides `node_modules/bc-theme-layer-bs5` locally. Re-run `npm link bc-theme-layer-bs5` after `npm install` if the symlink is removed.

To unlink: `npm unlink bc-theme-layer-bs5` in the theme, then `npm install`.


```
bc-theme-layer-bs5/
├── js/
│   ├── index.js          # Bootstrap helpers + module re-exports
│   ├── core/             # ComponentBase, WindowState, AnimationBase
│   ├── modules/          # AccessibleMenu, ButtonToggle, HeaderState, Slider, until-found
│   └── utils/            # inViewport (used by AnimationBase)
└── scss/
    ├── bootstrap/
    │   ├── _tokens.scss      # BC variable overrides (!default)
    │   ├── _vars.scss        # Sass only — no CSS output
    │   ├── _config.scss      # _vars + root/helpers/utilities/api
    │   └── _hidden-until-found.scss
    ├── css-variables/
    │   └── _css-variables.scss
    ├── editor/
    │   └── _editor-scope.scss
    └── presets/
        ├── _minimal.scss
        ├── _full.scss
        ├── _alert.scss
        ├── _forms.scss
        ├── _nav.scss
        └── _tables.scss
```

## Import decision tree

| Import when… | File |
|--------------|------|
| Theme `_variables.scss` needs shared BC tokens | `bootstrap/_tokens` |
| Theme needs Sass variables/mixins only (`main.scss`, `editor.scss`, block-styles) | `bootstrap/_vars` |
| Theme needs CSS output + components (`bootstrap.scss`, `bootstrap-editor.scss`) | `bootstrap/_config` |
| Theme generates `:root` custom properties | `css-variables/_css-variables` |
| Theme scopes editor Bootstrap | `editor/_editor-scope` + `@include editor-scope` |

## Naming reference

- **`$brand-colors`** — BC official brand palette (keys include `bc-` prefix)
- **`$utility-colors`** — Shared utility/theme colors (used in tokens and CSS var generator)
- **`$css-var-prefix`** — Prefix for generated custom properties (`sitka-` default; Bellevue uses `b22-`)
- **`get_color()` / `css_color()`** — Sass helpers for map lookups and `var(--name)` references

Set `$css-var-prefix` **before** importing `bootstrap/_tokens` if overriding the default.

## Usage

### Bootstrap CSS bundle (`bootstrap.scss`)

```scss
@import 'variables';
@import 'bc-theme-layer-bs5/scss/bootstrap/_config';
@import 'bc-theme-layer-bs5/scss/presets/_minimal'; // or _full
```

### Theme styles (`main.scss`) — vars only, no duplicate CSS

```scss
@import 'variables';
@import 'variables/css';
@import 'bc-theme-layer-bs5/scss/bootstrap/_vars';
// ... theme layers
```

### Editor Bootstrap (`bootstrap-editor.scss`)

```scss
@import 'variables';
@import 'bc-theme-layer-bs5/scss/bootstrap/_config';
@import 'bc-theme-layer-bs5/scss/editor/_editor-scope';

@include editor-scope {
  @import 'bc-theme-layer-bs5/scss/presets/_minimal';
  @import 'bc-theme-layer-bs5/scss/presets/_nav';
}
```

Import config **outside** `@include editor-scope` so `:root` rules are not nested invalidly.

### CSS variable generation

```scss
@use 'bc-theme-layer-bs5/scss/css-variables/_css-variables' with (
  $css-var-prefix: 'sitka-',
  $prefixed-utility-colors: false,
  $prefixed-container-spacing: true,
  $prefixed-heading-sizes: true,
  $generate-heading-size-vars: true,
  $generate-container-spacing: true,
  $heading-sizes: $heading-sizes,
  $brand-colors: $brand-colors,
  $utility-colors: $utility-colors,
  $grid-breakpoints: $grid-breakpoints
);
```

**Never pass `$grid-breakpoints: null`** when heading size vars are enabled.

### JavaScript helpers

```javascript
import {
  bootstrap,
  initTooltips,
  initPopovers,
  setWindowBootstrap,
  AccessibleMenu,
  ButtonToggle,
  HeaderState,
  UntilFoundCollapse,
  UntilFoundTab,
} from 'bc-theme-layer-bs5/js';
```

- `initTooltips()` — Sitka
- `initPopovers()` — Bellevue (popovers used as tooltips)
- `setWindowBootstrap()` — exposes `window.bootstrap` for legacy scripts
- `ComponentBase`, `WindowState`, `AnimationBase` — shared component framework
- `AccessibleMenu`, `ButtonToggle`, `HeaderState`, `Slider` — shared UI modules
- `UntilFoundCollapse`, `UntilFoundTab` — find-in-page for collapsed accordion panels and inactive tab panes

`Slider` depends on `swiper` from this package. `ButtonToggle` optional focus trapping uses `focus-trap`. Find-in-page SCSS ships with `_minimal` and `_full` presets.

## Presets

| Preset | Contents |
|--------|----------|
| `_full` | All Bootstrap components |
| `_minimal` | Core components; commented lines are an opt-in menu |
| `_forms` | forms, dropdown, button-group |
| `_nav` | nav, navbar (use for tabs) |
| `_alert` | alert |
| `_tables` | tables |

**Contract:** Presets import Bootstrap components only — never config or tokens.

## Preset contract

Import config once per bundle, then presets. Prevents duplicate CSS and unpredictable ordering.

## Roadmap

- Bellevue migration from `_full` → `_minimal` + block-level presets (Sitka pattern)
- Sass `@import` → `@use` when Bootstrap 6 supports it

## License

GPL-3.0-or-later

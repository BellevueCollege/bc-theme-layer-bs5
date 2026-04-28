# bc-theme-layer-bs5

Shared Bootstrap 5 SCSS configuration for Bellevue College WordPress themes. This package eliminates Bootstrap 5 configuration drift between themes by providing a single source of truth for Bootstrap SCSS, variable overrides, component presets, and editor scoping.

## Installation

Add this package as a git-based dependency in your theme's `package.json`:

```json
"bc-theme-layer-bs5": "github:BellevueCollege/bc-theme-layer-bs5#v1.0.0"
```

Then run `npm install`.

## Usage

### Basic Setup

Import the Bootstrap config layer first, then import presets as needed:

```scss
// Import Bootstrap configuration
@import 'bc-theme-layer-bs5/scss/config/_bootstrap-config';

// Import component presets
@import 'bc-theme-layer-bs5/scss/presets/_minimal';
```

### Available Presets

- **_full.scss**: All Bootstrap components (complete Bootstrap import)
- **_minimal.scss**: Core components (reboot, type, images, containers, grid, buttons, transitions, card, accordion, badge, modal, tooltip, placeholders)
- **_forms.scss**: Forms, dropdown, button-group
- **_nav.scss**: Nav, navbar
- **_tabs.scss**: Nav only (for tab components)
- **_alert.scss**: Alert
- **_tables.scss**: Tables

### Editor Scoping

Import the editor scoping mixin and use it to wrap styles for the Gutenberg editor:

```scss
@import 'bc-theme-layer-bs5/scss/editor/_scope';

@include editor-scope {
  @import 'bc-theme-layer-bs5/scss/presets/_minimal';
}
```

### CSS Variable Generation

Import the CSS variable generation module to generate responsive CSS variables:

```scss
@import 'bc-theme-layer-bs5/scss/css-variables/_generate' with (
  $css-var-prefix: 'sitka-',
  $generate-heading-vars: true,
  $generate-container-spacing: true,
  $heading-sizes: $your-heading-sizes-map,
  $brand-colors: $your-brand-colors-map,
  $theme-colors: $your-theme-colors-map,
  $grid-breakpoints: $your-grid-breakpoints-map
);
```

#### Expected Data Structures

- **$brand-colors**: Map with keys like `'bc-brutus-blue'` (includes bc- prefix in key)
- **$theme-colors**: Map with keys like `'white'`, `'black'` (no prefix in key)
- **$heading-sizes**: Nested map structure: `h1: (xs: (font-size: 2rem, line-height: 1.2), md: (...), lg: (...))`
- **$grid-breakpoints**: Map like `(xs: 0, sm: 641px, md: 769px, lg: 1025px, xl: 1281px, xxl: 1441px)`

### JavaScript Helpers

Import Bootstrap initialization helpers:

```javascript
import { initTooltips, initPopovers, setWindowBootstrap } from 'bc-theme-layer-bs5/js';

// Initialize tooltips
initTooltips();

// Initialize popovers
initPopovers();

// Set bootstrap on window for legacy compatibility
setWindowBootstrap();
```

## Configuration

### Tokens Layer

The shared package uses bc-sitka-spruce-department-theme values as the standard for Bootstrap variable overrides. Themes can override these values in their local variable files before importing the shared config.

### Color Values

The shared package defines standard BC color maps (`$brand-colors` and `$utility-colors`) with named colors that are used throughout the Bootstrap configuration. Themes can override these values in their local variable files before importing the shared config, or use the provided `css_color()` function to reference CSS variables.

### Dependencies

This package includes Bootstrap and @popperjs/core as regular dependencies:

```json
"dependencies": {
  "bootstrap": "^5.3.3",
  "@popperjs/core": "^2.11.8"
}
```

These are installed automatically when you install this package.

## Preset Contract

**Important**: Presets import ONLY Bootstrap components, NOT config. Themes must import config once, then import presets. This prevents duplicate CSS and unpredictable ordering.

## Versioning

This package uses semantic versioning and git tags. Use exact version tags in package.json for reproducibility:

```json
"bc-theme-layer-bs5": "github:BellevueCollege/bc-theme-layer-bs5#v1.0.0"
```

## License

GPL-3.0-or-later

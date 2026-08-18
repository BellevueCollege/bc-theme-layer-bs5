/**
 * Shared Bootstrap helpers and theme JS modules for Bellevue College WordPress themes.
 * @module bc-theme-layer-bs5/js
 */

import * as bootstrap from 'bootstrap';

export { default as ComponentBase } from './core/component-base.js';
export { default as WindowState } from './core/window-state.js';
export { default as AnimationBase } from './core/animation-base.js';
export { default as AccessibleMenu } from './modules/accessible-menu.js';
export { default as ButtonToggle } from './modules/button-toggle.js';
export { default as HeaderState } from './modules/header-state.js';
export { default as Slider } from './modules/slider.js';
export { UntilFoundCollapse, UntilFoundTab } from './modules/until-found-reveal.js';

/**
 * Bootstrap namespace for Tab, Collapse, Tooltip, and third-party integrations.
 * @type {typeof import('bootstrap')}
 */
export { bootstrap };

/**
 * Initialize all `[data-bs-toggle="tooltip"]` elements. Used by Sitka Spruce.
 * @returns {import('bootstrap').Tooltip[]} Initialized tooltip instances
 */
export function initTooltips() {
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
  return tooltipList;
}

/**
 * Initialize all `[data-bs-toggle="popover"]` elements. Used by Bellevue 2022 (popovers as tooltips).
 * @returns {import('bootstrap').Popover[]} Initialized popover instances
 */
export function initPopovers() {
  const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
  const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));
  return popoverList;
}

/**
 * Expose Bootstrap on `window` for legacy scripts (e.g. Sitka a11y-warnings).
 * @returns {void}
 */
export function setWindowBootstrap() {
  window.bootstrap = bootstrap;
}

////
/// Bootstrap Initialization Helpers
/// Export common Bootstrap initialization helpers based on patterns found in both themes
////

import * as bootstrap from 'bootstrap';

// Export bootstrap for use in other modules
export { bootstrap };

// Initialize tooltips (Sitka pattern)
export function initTooltips() {
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
  return tooltipList;
}

// Initialize popovers (Bellevue 2022 pattern - used as tooltips)
export function initPopovers() {
  const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
  const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));
  return popoverList;
}

// Set bootstrap on window (Sitka pattern for legacy compatibility)
export function setWindowBootstrap() {
  window.bootstrap = bootstrap;
}

/**
 * @file
 * In Viewport functions.
 */

/**
 * Test if any part element is in the current viewport.
 *
 * @param {Element} element
 *   The element to determine if is in the viewport.
 * @return {boolean}
 *   True if it is, false if it's not.
 */
export function inViewport(element) {
  const bounds = element.getBoundingClientRect();
  const inViewportTop = bounds.top - window.innerHeight < 0;
  const inViewportBottom = bounds.bottom > 0;
  return inViewportTop && inViewportBottom;
}

/**
 * Test if the center of an element is in the current viewport.
 *
 * @param {Element} element
 *   The element to determine if the center is in the viewport.
 * @return {boolean}
 *   True if it is, false if it's not.
 */
export function centerInViewport(element) {
  const bounds = element.getBoundingClientRect();
  const inViewportCenterY =
    bounds.top + bounds.height / 2 - window.innerHeight < 0;
  return inViewportCenterY;
}

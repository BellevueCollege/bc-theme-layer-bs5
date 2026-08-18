/**
 * @file
 * WindowState class.
 */

import EventEmitter from 'events';

/**
 * The WindowState class provides enhanced window change events: load, scroll,
 * and resize. Along with providing an class to watch for these events, it adds
 * some additional useful data about the window state, as well as limiting the
 * events fired to those initiated by requestAnimationFrame().
 *
 * @fires WindowState#all
 * @fires WindowState#resize
 * @fires WindowState#scroll
 */
class WindowState extends EventEmitter {
  /**
   * Set the object's initial state and add event listeners.
   *
   * @constructor
   */
  constructor() {
    super();
    this.animate = true;
    this.lastSize = 0;
    this.lastScrollPosition = 0;
    this.setMaxListeners(15);
    window.addEventListener('load', (event) => this.update(event));
    window.addEventListener('scroll', (event) => this.request(event));
    window.addEventListener('resize', (event) => this.request(event));
  }

  /**
   * Update the object's state and call the emitters.
   *
   * @param {Object} event
   *   The calling event; either load, resize, or scroll.
   */
  update(event) {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.maxHeight = document.documentElement.scrollHeight - this.height;
    this.setCurrentScrollPosition();
    this.setCurrentSize();
    this.setScrollDirection();

    // Check if the window state has changed, and if not then retry the update
    // on the next animation frame and stop early.
    if (!this.windowStateChanged()) {
      window.requestAnimationFrame(() => {
        this.update(event);
      });
      this.animate = false;
      return;
    }

    if (['load', 'resize', 'scroll'].indexOf(event.type) > -1) {
      /**
       * Emit an 'all' event on all window state changes.
       *
       * @event WindowState#all
       * @type {Object}
       * @property {int} width
       *   The current window width.
       * @property {int} height
       *   The current window height.
       * @property {int} currentScrollPosition
       *   The current scroll position.
       * @property {int} maxHeight
       *   The maximum scrollable height of the document.
       * @property {string} scrollDirection
       *   The last scroll direction, up or down.
       */
      this.emit('all', {
        event,
        width: this.width,
        height: this.height,
        currentScrollPosition: this.currentScrollPosition,
        maxHeight: this.maxHeight,
        scrollDirection: this.scrollDirection,
      });
    }

    if (['load', 'resize'].indexOf(event.type) > -1) {
      /**
       * Emit a 'resize' event when the window size is changed or on load.
       *
       * @event WindowState#resize
       * @type {Object}
       * @property {int} width
       *   The current window width.
       * @property {int} height
       *   The current window height.
       * @property {int} maxHeight
       *   The maximum scrollable height of the document.
       */
      this.emit('resize', {
        width: this.width,
        height: this.height,
        maxHeight: this.maxHeight,
      });
    }

    if (['load', 'scroll'].indexOf(event.type) > -1) {
      /**
       * Emit a 'scroll' event when the window is scrolled or on load.
       *
       * @event WindowState#scroll
       * @type {Object}
       * @property {int} currentScrollPosition
       *   The current scroll position.
       * @property {int} maxHeight
       *   The maximum scrollable height of the document.
       * @property {string} scrollDirection
       *   The last scroll direction, up or down.
       */
      this.emit('scroll', {
        currentScrollPosition: this.currentScrollPosition,
        maxHeight: this.maxHeight,
        scrollDirection: this.scrollDirection,
      });
    }

    // Update the last states.
    this.lastScrollPosition = this.currentScrollPosition;
    this.lastSize = this.currentSize;
    this.animate = true;
  }

  /**
   * Request that the object's state be updated, if it hasn't been updated
   * recently.
   *
   * @param {Object} event
   *   The calling event; either load, resize, or scroll.
   */
  request(event) {
    if (this.animate) {
      window.requestAnimationFrame(() => {
        this.update(event);
      });
      this.animate = false;
    }
  }

  /**
   * Set the current scroll position.
   *
   * Constrains the scroll position between 0 and the window height. This
   * prevents browsers that allow for a "bounce" behavior beyond the document
   * from calling scroll events with odd values during the bounce and
   * incorrectly triggering an up or down scroll event when beyond the page
   * bounds (mostly Safari).
   */
  setCurrentScrollPosition() {
    this.currentScrollPosition = Math.min(
      Math.max(0, window.pageYOffset),
      this.maxHeight,
    );
  }

  /**
   * Set the current window size.
   *
   * Window size is a concatenated string of width and height, so we can track
   * changes to all dimensions with one variable.
   */
  setCurrentSize() {
    this.currentSize = this.width.toString() + this.height.toString();
  }

  /**
   * Set the scroll direction.
   */
  setScrollDirection() {
    if (this.currentScrollPosition > this.lastScrollPosition) {
      this.scrollDirection = 'down';
    } else if (this.currentScrollPosition < this.lastScrollPosition) {
      this.scrollDirection = 'up';
    } else {
      this.scrollDirection = 'none';
    }
  }

  /**
   * Check if the window state has changed, either a scroll or size change.
   *
   * @return {bool}
   *   True if the window state has changed, false if not.
   */
  windowStateChanged() {
    return (
      this.lastSize !== this.currentSize ||
      this.lastScrollPosition !== this.currentScrollPosition
    );
  }
}

/**
 * Create only one instance of WindowState and export that instance each time.
 */
const windowState = new WindowState();
export default windowState;

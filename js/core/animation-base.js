/**
 * @file
 * AnimationBase class.
 */

import ComponentBase from './component-base';
import WindowState from './window-state';
import { inViewport } from '../utils/in-viewport';

/**
 * The AnimationBase class is a simple way to toggle animate classes on single
 * elements when the element center is in the viewport.
 */
export default class AnimationBase extends ComponentBase {
  /**
   * Set the object's initial state.
   *
   * @constructor
   */
  constructor() {
    super('animation');
    /**
     * Create the options from supplied options and defaults. Options can be
     * specificed on object creation by passing an object, or inline as data
     * attributes on the button DOM element. Data attribute options are
     * kebab-cased versions of the options below, prefixed with data-button.
     *
     * @property {Object} intersectionObserver
     *   Options to pass to the IntersectionObserver on creation.
     *   @see https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/IntersectionObserver

     * @property {Object} shouldAnimate
     *   Options to pass to the IntersectionObserver which defines when the animation should fire.
     */
    this.options = {
      intersectionObserver: {
        root: null,
        rootMargin: '-25% 0%',
        thresholds: [0, 0.25, 0.5, 0.75, 1],
      },
      shouldAnimate: {
        initialIntersection: true,
        scrollDirection: null,
        scrollEnter: false,
        scrollLeave: false,
        fullyVisible: false,
      },
    };
    /**
     * @property {string} readyClass
     *   The class to add to animatable elements when they are ready to be
     *   animated. This addition of this class sets the initial animate state
     *   on an element, and it's removal triggers the animation.
     */
    this.readyClass = 'oho-animate--ready';
    this.animateRunningClass = 'oho-animate--running';
    this.animateInClass = 'oho-animate--in';
    this.animateOutClass = 'oho-animate--out';
    /**
     * The IntersectionObserver, if the browser supports the feature.
     *
     * @type {IntersectionObserver|null}
     */
    this.intersectionObserver = null;
  }

  /**
   * Add elements to animate, setup options, and add the initial class as well.
   *
   * @param {string} selector
   *   The selector of elements to add, in a format querySelectorAll() can use.
   * @param {HTMLDocument|HTMLElement} [context=document] context
   *   An optional context to search within. If no context is passed, the entire
   *   document is searched.
   * @return {AnimateSingle}
   *   The current object, for method chaining.
   */
  add(selector, context = document) {
    super.add(selector, context);
    this.items.forEach((item) => {
      item.classList.add(this.readyClass);
    });
    return this;
  }

  /**
   * Run the behaviors on each added item.
   *
   * @return {ComponentBase}
   *   Returns the current object.
   */
  run() {
    this.init();

    // Legacy implementation for browsers that do not support the
    // IntersectionObserver API, using WindowState to throttle updates.
    if (
      !('IntersectionObserver' in window) &&
      !('IntersectionObserverEntry' in window) &&
      !('IntersectionRatio' in window.IntersectionObserverEntry.prototype)
    ) {
      WindowState.on('all', () => {
        this.items.forEach((item) => {
          this.redraw(item);
        });
      });
      return this;
    }

    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        // these vars are used to inform us target position
        let previousY = 0;
        let previousRatio = 0;

        // track positions
        const currentY = entry.boundingClientRect.y;
        const currentRatio = entry.intersectionRatio;
        const { isIntersecting } = entry;

        // Setup intersection states to track
        entry.target.intersectionState = {
          initialIntersection: false,
          scrollDirection: null,
          scrollEnter: false,
          scrollLeave: false,
          fullyVisible: false,
        };

        // Check to see if an initial intersection has already been made.
        if (
          entry.target.intersectionState.initialIntersection == false &&
          isIntersecting
        ) {
          entry.target.intersectionState.initialIntersection = true;
          this.options.shouldAnimate.initialIntersection == true &&
          !entry.target.animated == true
            ? this.redraw(entry.target)
            : false;
        }

        // Listen for Scroll Directions
        if (currentY < previousY) {
          entry.target.intersectionState.scrollDirection = 'down';
          this.options.shouldAnimate.initialIntersection == 'down' &&
          !entry.target.animated == true
            ? this.redraw(entry.target)
            : false;
        } else if (currentY > previousY && isIntersecting) {
          entry.target.intersectionState.scrollDirection = 'up';
          this.options.shouldAnimate.scrollDirection == 'up' &&
          !entry.target.animated == true
            ? this.redraw(entry.target)
            : false;
        }
        if (currentRatio > previousRatio && isIntersecting) {
          entry.target.intersectionState.scrollEnter = true;
          this.options.shouldAnimate.scrollEnter == true &&
          !entry.target.animated == true
            ? this.redraw(entry.target)
            : false;
        } else {
          this.options.shouldAnimate.scrollLeave == true &&
          !entry.target.animated == true
            ? this.redraw(entry.target)
            : false;
          entry.target.intersectionState.scrollLeave = true;
        }

        // If the intersectionRatio is 1, the entry is fully in view
        if (entry.currentRatio == 1) {
          this.options.shouldAnimate.fullyVisible == true &&
          !entry.target.animated == true
            ? this.redraw(entry.target)
            : false;
          entry.target.intersectionState.fullyVisible = true;
        }

        // update positioning so we can detect scroll direction
        previousY = currentY;
        previousRatio = currentRatio;
        return entry;
      });
    }, this.options.intersectionObserver);
    this.items.forEach((item) => {
      this.intersectionObserver.observe(item);
    });
    return this;
  }

  /**
   * Redraws an item.
   *
   * The redraw method depends on whether the IntersectionObserver API is used.
   *
   * @param {Element} item
   *   The element to be animated.
   *
   * @return {AnimationBase}
   *   Returns the current object.
   */
  redraw(item) {
    if (item.classList.contains(this.readyClass)) {
      if (this.intersectionObserver === null) {
        if (this.legacyShouldAnimate(item)) {
          this.animate(item);
        }
      } else {
        this.animate(item);
      }
    }
    return this;
  }

  /**
   * Animation logic for each item. This method should be overridden.
   *
   * @param {Element} item
   */
  // eslint-disable-next-line class-methods-use-this
  animate(item) {}

  /**
   * Viewport check for browsers not using the IntersectionObserver API.
   *
   * @param {Element} item
   *   The element to check for animation status.
   *
   * @return {Boolean}
   *   True if the item should animate.
   */
  // eslint-disable-next-line class-methods-use-this
  legacyShouldAnimate(item) {
    return inViewport(item);
  }
}

/**
 * @file
 * HeaderState class.
 */
import ComponentBase from '../core/component-base';
import WindowState from '../core/window-state';

export default class HeaderState extends ComponentBase {
  /**
   * Set the object's initial state.
   *
   * @constructor
   * @param {Object} options
   *   HeaderState options. See object definition in the constructor below.
   */
  constructor(options = {}) {
    super('header');

    /**
     * Create the options from supplied options and defaults. Options can be
     * specificed on object creation by passing an object, or inline as data
     * attributes on the button DOM element. Data attribute options are
     * kebab-cased versions of the options below, prefixed with data-button.
     *
     * @property {int} startAt
     *   The screen width at which to enable the header behavior. Set 0 to
     *   always enable. Defaults to 0, or the value of the
     *   [data-header-start-at] attribute.
     * @property {int} startThreshold
     *   The scroll distance from the top after which the beyondThreshold
     *   classes are added to the body and elements. Set to -1 to use the
     *   calclated height of the calling element. Defaults to -1, or the value
     *   of the [data-header-start-threshold] attribute.
     * @property {string} scrollUp
     *   The class to add when scrolling up.
     * @property {string} scrollDown
     *   The class to add when scrolling down.
     * @property {string} atTop
     *   The class to add when scrolled to the page top.
     * @property {string} atBottom
     *   The class to add when scrolled to the page bottom.
     * @property {string} beyondThreshold
     *   The class to add when scrolled beyond the scroll threshold.
     * @property {string} beyondThresholdAnimate
     *   The animation class to add when scrolled beyond the scroll threshold.
     *   This class is added on a short delay, and is intended for adding any
     *   animation CSS rules after main display rules, so there is no transition
     *   artifacts or oddnesss.
     * @property {string} beyondThresholdBody
     *   The class to add to the body when scrolled beyond the scroll
     *   threshold.
     *
     * Emitted Events
     *
     * @type {Object} state
     * @property {Boolean} headerUpdate
     *   Emits all scrolling states for use in other components:
     *   beyondThreshold,
     *   direction,
     *   atTop,
     *   atBottom,
     */

    this.options = {
      ...{
        startAt: 0,
        startThreshold: -1,
        classes: {
          scrollUp: 'site-header--scroll-up',
          scrollDown: 'site-header--scroll-down',
          atTop: 'site-header--at-top',
          atBottom: 'site-header--at-bottom',
          beyondThreshold: 'site-header--beyond-threshold',
          beyondThresholdAnimate: 'site-header--beyond-threshold-animate',
          beyondThresholdBody: 'site-header-beyond-threshold',
        },
      },
      ...options,
    };
  }

  /**
   * @inheritdoc
   */
  resize() {
    WindowState.on('all', (all) => {
      this.items.forEach((header) => {
        // Set state variables to strack and emit
        const state = {
          beyondThreshold: null,
          direction: null,
          atTop: null,
          atBottom: null,
        };

        // If the start threshold is -1, set the threshold to the current header
        // height.
        if (header.startThreshold === -1) {
					// Thanks to https://usefulangle.com/post/179/jquery-offset-vanilla-javascript for this!
					let offsetTop = header.getBoundingClientRect().top + window.scrollY;

          header.startThreshold = header.offsetHeight + offsetTop;
        }

        // If we're below the breakpoint, remove classes.
        if (all.event.type === 'resize' && all.width < header.startAt) {
          header.classList.remove(header.classes.scrollUp);
          header.classList.remove(header.classes.scrollDown);
          header.classList.remove(header.classes.atTop);
          header.classList.remove(header.classes.atBottom);
          header.classList.remove(header.classes.beyondThreshold);
          header.classList.remove(header.classes.beyondThresholdAnimate);
        }

        // At or above the breakpoint, add all the classes.
        if (
          ['load', 'scroll'].indexOf(all.event.type) !== -1 &&
          all.width >= header.startAt
        ) {
          // Add the beyond threshold class if beyond the threshold.
          if (all.currentScrollPosition >= header.startThreshold) {
            state.beyondThreshold = true;
            document.body.classList.add(header.classes.beyondThresholdBody);
            header.classList.add(header.classes.beyondThreshold);
            setTimeout(
              () => header.classList.add(header.classes.beyondThresholdAnimate),
              10,
            );
          } else if (all.currentScrollPosition < header.startThreshold) {
            state.beyondThreshold = false;
            document.body.classList.remove(header.classes.beyondThresholdBody);
            header.classList.remove(header.classes.beyondThreshold);
            header.classList.remove(header.classes.beyondThresholdAnimate);
          }

          // Add the scroll direction classes.
          if (all.scrollDirection === 'up') {
            state.direction = 'up';
            header.classList.add(header.classes.scrollUp);
            header.classList.remove(header.classes.scrollDown);
          } else if (all.scrollDirection === 'down') {
            state.direction = 'down';
            header.classList.remove(header.classes.scrollUp);
            header.classList.add(header.classes.scrollDown);
          }

          // Add and remove the top class.
          if (all.currentScrollPosition === 0) {
            state.atTop = true;
            header.classList.add(header.classes.atTop);
          } else {
            state.atTop = false;
            header.classList.remove(header.classes.atTop);
          }

          // Add and remove the bottom class.
          if (all.currentScrollPosition === all.maxHeight) {
            state.atBottom = true;
            header.classList.add(header.classes.atBottom);
          } else {
            state.atBottom = false;
            header.classList.remove(header.classes.atBottom);
          }

          /**
           * Emit an event when scrolled.
           *
           * @type {Object} state
           * @property {Boolean} headerUpdate
           *   Emit all scrolling states
           */
          this.emit('headerUpdate', { state });
        }
      });
    });
  }
}

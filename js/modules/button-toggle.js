/**
 * @file
 * ButtonToggle class.
 */
import ComponentBase from '../core/component-base';
import WindowState from '../core/window-state';
import * as focusTrap from 'focus-trap';
/**
 * The ButtonToggle class provides an easy way to add a toggleable button. The
 * class toggles a class on <body>, updates the button label based on state,
 * takes care of enabling or disabling based on screen width, and provides an
 * event which can be used to trigger more advanced behaviors.
 *
 * @fires ButtonToggle#toggle
 */
export default class ButtonToggle extends ComponentBase {
  /**
   * Set the object's initial state.
   *
   * @constructor
   * @param {Object} options
   *   ButtonToggle options. See object definition in the constructor below.
   */
  constructor(options = {}) {
    super('button');
    /**
     * Create the options from supplied options and defaults. Options can be
     * specificed on object creation by passing an object, or inline as data
     * attributes on the button DOM element. Data attribute options are
     * kebab-cased versions of the options below, prefixed with data-button.
     *
     * @property {Number} enableAt
     *   The screen width at which to enable the button behaviors. Set 0 to
     *   always enable. Defaults to 0, or the value of the
     *   [data-button-enable-at] attribute.
     * @property {Number} disableAt
     *   The screen width at which to disable the button behaviors. Set -1 to
     *   never disable. Defaults to -1, or the value of the
     *   [data-button-disable-at] attribute.
     * @property {String} openClass
     *   Class to add to <body> when the button is clicked. Defaults to '', or
     *   the value of the [data-button-open-class] attribute.
     * @property {String} openClassElement
     *   The closest parent element to add the open class to. Defaults to
     *   'body', or the value of the [data-button-open-class-element] attribute.
     *   If the element is not found in the parent tree, this reverts to body.
     * @property {Number} duration
     *   The duration of the toggle animations, in ms. Defaults to 400, or the
     *   value of the [data-button-duration] attribute.
     * @property {Boolean} escapable
     *   Whether or not the button should be closeable with an escape key press.
     *   Defaults to true, or the value of the [data-menu-escapable]
     *   attribute.
		 * @property {Boolean|String} focusTrap
		 *   If false, none. If a string, the id of the element to trap focus within.
		 *   Defaults to false, or the value of the [data-button-focus-trap] attribute.
     */
    this.options = {
      ...{
        enableAt: 0,
        disableAt: -1,
        openClass: '',
        openClassElement: 'body',
        duration: 400,
        escapable: 1,
				focusTrap: false,
      },
      ...options,
    };
  }

  /**
   * Add the button behaviors.
   */
  init() {
    this.items.forEach((button) => {
      button.init = true;
      // Track the current state, clicked unclicked.
      button.isToggled = false;
      // Track if the button has been clicked once.
      button.isClicked = false;
      // Add a click event listener to the button.


			// If a focus trap is set, create the focus trap
			const focusTrapElement = button.focusTrap ? document.getElementById(button.focusTrap) : null;
			button.trap = button.focusTrap ? focusTrap.createFocusTrap( `#${button.focusTrap}`, {
				onActivate: () => focusTrapElement.classList.add('is-active'),
				onDeactivate: () => focusTrapElement.classList.remove('is-active'),
			} ) : null;

      button.addEventListener('click', () => {
        button.toggleButton(null, true, true);
      });
      // Check if escapable is set to true
      if (button.escapable) {
        document.addEventListener('keydown', (event) => {
          // If escape has been clicked, and the button is toggled
          if (event.key === 'Escape' && button.isToggled) {
            button.toggleButton(false, true, false);
          }
        });
      }



      /**
       * Toggle a button.
       * @param {Boolean|null} state
       *   The state to toggle, true corresponds to a clicked state.
       * @param {Boolean} setFocus
       *   Whether to refocus The User Cursor when the button is active, defaults to true
       *   setFocus is set to false when we set activeTrail, and accordion states.
       * @param {Boolean} userInitiated
       *   Whether the toggle event is initiated by a direct user action.set activeTrail, and accordion states.
       */
      button.toggleButton = (
        state = null,
        setFocus = true,
        userInitiated = false,
      ) => {
        // Only if the button is not disabled.
        if (!button.hasAttribute('disabled')) {
          // Update the state.
          // console.log(state);
          // console.log(state !== null ? state : !button.isToggled);

          button.isToggled = state !== null ? state : !button.isToggled;
          // Set to clicked on initial click or manual toggle.
          button.isClicked = state !== false;
          // Update the text.
          // The element which the open class is added defaults to body.
          let classElement = document.body;
          // If a selector is specified, and is not body, get the closest parent
          // of that selector and use it, or body if there is no parent found.
          if (
            button.openClassElement.length &&
            button.openClassElement !== 'body'
          ) {
            classElement = button.closest(button.openClassElement)
              ? button.closest(button.openClassElement)
              : document.body;
          }
          // Toggle the class when an open class is configured.
          if (button.openClass) {
            if (button.isToggled) {
              classElement.classList.add(button.openClass);
            } else {
              classElement.classList.remove(button.openClass);
            }
          }

					// If a focus trap is set, activate or deactivate
					if (button.trap) {
						if (button.trap.active) {
							button.trap.deactivate();
						} else {
							button.trap.activate();
						}
					}

          // Update expanded aria attributes based on toggle type
          if (button.getAttribute('aria-expanded') != null) {
            button.setAttribute('aria-expanded', button.isToggled);
          }
          if (button.getAttribute('aria-pressed') != null) {
            button.setAttribute('aria-pressed', button.isToggled);
          }
          // Refocus the user cursor
          const focusTarget = document.getElementById(
            button.getAttribute('aria-controls'),
          );
          const controlType = button.getAttribute('data-toggle-type');
          // Check to make sure the button is toggled, and the button has a focus target
          if (setFocus == true) {
            if (button.isToggled) {
              if (button.getAttribute('aria-controls') == 'header-menus') {
                let buttonClicked = false;
                $('.main-content').click(function () {
                  if (buttonClicked) {
                    return;
                  }
                  buttonClicked = true;
                  button.toggleButton(false);
                });
              };
              if (focusTarget != null) {
                /**
                 * W3 states if aria-haspopup is true, screenreaders identify this as a menu button.
                 * If its present W3 shows an example of refocusing the user onto the first menu open
                 */
                if (controlType == 'menu') {
                  const ft2  = focusTarget.querySelectorAll('a');
                  ft2[0].focus();
                } else if (controlType != 'toggle') {
                  focusTarget.setAttribute('tabindex', '0');
                  focusTarget.focus();
                  focusTarget.removeAttribute('tabindex');
                }
              }
            }
          }
          /**
           * Emit an 'toggle' event on clicks.
           *
           * @type {Object}
           * @property event
           *   The triggering toggle event.
           * @property {HTMLElement} button
           *   The button that triggered the event.
           */
          this.emit('toggle', { button, userInitiated });
        }
      };
    });
  }

  /**
   * Update each button on resize, disabling the button if appropriate.
   */
  resize() {
    WindowState.on('resize', (resize) => {
      this.items.forEach((button) => {
        // Determine the max breakpoint. If disableAt is -1, choose an
        // unrealistically high number.
        const maxBreakpoint = button.disableAt == -1 ? 99999 : button.disableAt;
        const disabled = !(
          button.enableAt <= resize.width && resize.width < maxBreakpoint
        );
        if (disabled) {
					if (button.isToggled) {
						button.toggleButton(false);
					}
          button.setAttribute('disabled', 'disabled');
        } else {
          button.removeAttribute('disabled');
        }
      });
    });
  }
}

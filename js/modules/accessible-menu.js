/**
 * @file
 * AccessibleMenu class.
 */

import ButtonToggle from './button-toggle';
import ComponentBase from '../core/component-base';

/**
 * The AccessibleMenu class makes any menu tree accessible by keyboard
 * navigation. The class adds buttons with descriptive labels inside menu items
 * with children, and toggles classes on the button parent.
 */
export default class AccessibleMenu extends ComponentBase {
  /**
   * Set the object's initial state.
   *
   * @constructor
   * @param {Object} options
   *   Menu options. See object definition in the constructor below.
   */
  constructor(options = {}) {
    super('menu');

    /**
     * Create the options from supplied options and defaults. Options can be
     * specificed on object creation by passing an object, or inline as data
     * attributes on the menu DOM element. Data attribute options are
     * kebab-cased versions of the options below, prefixed with data-menu.
     *
     * @property {String} buttonClass
     *   The class added to the inserted button. Defaults to
     *   'menu-item__button', or the value of the [data-menu-button-class]
     *   attribute.
     * @property {String} hasItemsSelector
     *   The selectors of menu items which have children. Defaults to
     *   '.menu-item--expanded > a, .menu-item--expanded > span', or the value
     *   of the [data-menu-has-items-selector] attribute.
     * @property {String} openClass
     *   The class to add to open menu items, specified by hasItemsSelector.
     *   Defaults to 'menu-item--open', or the value of the
     *   [data-menu-open-class] attribute.
     * @property {RegExp} regex
     *   The regex search string to look for in the close and open text.
     *   Defaults to /%s/, or the value of the [data-menu-regex] attribute.
     * @property {String} label
     *   The text pattern for the aria-label button attribute. Can use the regex string for
     *   replacement. Defaults to 'Toggle the %s menu', or the value of the
     *   [data-menu-toggle-text] attribute.
     * @property {Boolean} escapable
     *   Whether or not the menu items should be closeable with an escape key
     *   press. Defaults to true, or the value of the [data-menu-escapable]
     *   attribute.
     * @property {Boolean} expandActiveTrail
     *   Expand the menu active trail items on load. Defaults to false, or the
     *   value of the [data-expand-active-trail] attribute.
     * @property {String} activeTrailSelector
     *   The active trail menu item selector, used to determine the active trail
     *   if expandActiveTrail is set to true. Defaults to
     *   '.menu-item--active-trail', or the value of the
     *   [data-menu-active-trail-selector] attribute.
     */
    this.options = {
      ...{
        buttonClass: 'menu-item__button',
        hasItemsSelector:
          '.menu-item--expanded > a, .menu-item--expanded > span',
        openClass: 'menu-item--open',
        regex: /%s/,
        label: 'Toggle the %s menu',
        escapable: 1,
        expandActiveTrail: 0,
        activeTrailSelector: '.menu-item--active-trail',
      },
      ...options,
    };
  }

  /**
   * Add the accessible menu behaviors for each menu.
   */
  init() {
    this.items.forEach((menu) => {
      const menuLinksWithChildren = menu.querySelectorAll(
        menu.hasItemsSelector,
      );

      menuLinksWithChildren.forEach((menuLink) => {
        // Create the aria-label text for each button from the link text.
        const label = menu.label.replace(menu.regex, menuLink.innerHTML);
        const ulMachineLabel = `${label
          .split(' ')
          .join('-')
          .toLowerCase()
          .replace(' ', '-')}--ul`;
        const buttonMachineLabel = `${label
          .split(' ')
          .join('-')
          .toLowerCase()}--button`;

        // The menu item's ul.
        const ul = menuLink.parentElement.querySelector('ul');

        // If there are no child items, then exit.
        if (!ul) {
          console.warn('No Child Items in Menu', menuLink);
          return;
        }
        ul.setAttribute('id', ulMachineLabel);
        ul.setAttribute('aria-labelledby', buttonMachineLabel);

        // Create the button.
        const button = AccessibleMenu.createButton(menu, label, ulMachineLabel);

        // Add the button before the ul.
        menuLink.parentElement.insertBefore(button, ul);
      });

      // Run button toggle if buttons were added.
      if (menuLinksWithChildren.length) {
        this.accessibleMenuButtons = new ButtonToggle();
        this.accessibleMenuButtons.add(`.${menu.buttonClass}`, menu).run();

        // Listen for Toggle event on any button, and close any other open menus.
        this.accessibleMenuButtons.on('toggle', (event) => {
          if (event.button.isToggled) {
            menu.querySelectorAll(`.${menu.buttonClass}`).forEach((button) => {
              if (button !== event.button) {
                button.toggleButton(false);
              }
            });
          }
        });

        // Tabbing forwards and backwards after focusing closes the dropdown menus
        document.addEventListener('keydown', (e) => {
          menu.querySelectorAll(`li .${menu.buttonClass}`).forEach((button) => {
            // Check if the tab key is being pressed, the button is toggled open

            if (
              e.key == 'Tab' &&
              button.isToggled == true &&
              menu.expandActiveTrail == 0
            ) {
              // activeElement checks the focused element
              // at the time of the click, by adding a slight delay
              // we can get the next activeElement

              window.setTimeout(() => {
                if (!document.activeElement.closest(`.${menu.openClass}`)) {
                  button.toggleButton(false);
                }
              }, 1);
            }
          });
        });
      }

      // If the active trail should be expanded, then toggle the buttons in the
      // menu's active trail.
      if (menu.expandActiveTrail && menuLinksWithChildren.length) {
        const activeTrail = menu.querySelectorAll(
          `${menu.activeTrailSelector} > button`,
        );
        activeTrail.forEach((button) => {
          button.toggleButton(true, false);
        });
      }
    });
  }

  /**
   * Create the button to insert.
   *
   * @param {HTMLElement} menu
   *   The menu in which the button is being added.
   * @param {String} label
   *   The aria-label text of the button.
   * @return {HTMLElement}
   *   The button element.
   */
  static createButton(menu, label, controlsId) {
    const button = document.createElement('button');

    // Setup Toggle
    button.classList.add(menu.buttonClass);
    button.setAttribute('data-button-open-class', menu.openClass);
    button.setAttribute('data-button-open-class-element', 'li');
    button.setAttribute('data-button-escapable', menu.escapable);
    // aria lables
    button.setAttribute('aria-live', 'polite');
    button.setAttribute('aria-label', label);
    button.setAttribute(
      'id',
      `${label.split(' ').join('-').toLowerCase()}--button`,
    );
    button.setAttribute('aria-haspopup', 'true');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', controlsId);
    button.setAttribute('data-toggle-type', 'menu');

    return button;
  }
}

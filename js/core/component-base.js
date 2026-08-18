/**
 * @file
 * ComponentBase class.
 */

import EventEmitter from 'events';

/**
 * The ComponentBase class provides component methods to easily extend and add
 * more complicated components. The class adds DOM objects from selectors,
 * provides options parsing from data attributes on the selectors, and provides
 * a basic run() method which calls both init() and resize(). These methods
 * should be defined in any classes which inherit from ComponentBase.
 *
 * Subclasses should override init() and resize() as needed.
 */
export default class ComponentBase extends EventEmitter {
  /**
   * Set the object's initial state.
   *
   * @constructor
   * @param {string} componentName
   *   The component name used in the component's inline data attribute options.
   */
  constructor(componentName = 'component-base') {
    super();
    this.name = componentName;
    this.items = [];
    this.options = [];
  }

  /**
   * Add elements.
   *
   * @param {string} selector
   *   The selector of elements to add, in a format querySelectorAll() can use.
   * @param {HTMLDocument|HTMLElement} [context=document] context
   *   An optional context to search within. If no context is passed, the entire
   *   document is searched.
   * @return {ComponentBase}
   *   The current object, for method chaining.
   */
  add(selector, context = document) {
    // Get the elements from the context. If the context contains the selector,
    // use that. If not, query the context for the selector pattern.
    const elements =
      !(context instanceof Document) && context.matches(selector)
        ? [context]
        : context.querySelectorAll(selector);
    elements.forEach((element) => {
      this.getOptions(element);
      this.items.push(element);
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
    this.resize();
    return this;
  }

  /**
   * Behaviors to run on initial load. This method should be overridden.
   *
   * @return {ComponentBase}
   *   Returns the current object.
   */
  init() {
    return this;
  }

  /**
   * Behaviors to run on resize. This method should be overridden.
   *
   * @return {ComponentBase}
   *   Returns the current object.
   */
  resize() {
    return this;
  }

  /**
   * Get items which match a selector pattern.
   *
   * @param {String} selector
   *   The selector string representing the selector to match.
   * @return {HTMLElement[]}
   *   All added items matching the selector.
   */
  getItems(selector) {
    return this.items.filter((item) => {
      return item.matches(selector);
    });
  }

  /**
   * Get the first item which matches a selector pattern.
   *
   * @param {String} selector
   *   The selector string representing the selector to match.
   * @return {HTMLElement|null}
   *   The first item matching the selector.
   */
  getItem(selector) {
    return this.items.find((item) => {
      return item.matches(selector);
    });
  }

  /**
   * Get the options for each item and attach them to the item object.
   *
   * @param {HTMLElement} item
   *   The item to make options for.
   */
  getOptions(item) {
    // Get the options passed on object creation and loop over them.
    const options = Object.entries(this.options);
    options.forEach((option) => {
      const [key, value] = option;
      // Create the corresponding data attributes from the options name.
      const dataKey = `data-${this.name}-${ComponentBase.camelToKebab(key)}`;
      // If there is an option data attribute on the item, use that. If
      // not, use the default instead.
      const optionValue = item.hasAttribute(dataKey)
        ? item.getAttribute(dataKey)
        : value;
      // Add the option to the item.
      item[key] = optionValue;
    });
  }

  /**
   * Convert a string from camelCase to a kebab-case.
   *
   * Only works with alphabetic strings.
   *
   * @param {string} string
   *   The camelCased string to convert.
   * @return {string}
   *   A kebab-cased string or the original string if length is not long enough
   *   or has no camelCasing.
   */
  static camelToKebab(string) {
    // The string isn't long enough to split, return the original.
    if (string.length < 2) {
      return string;
    }
    // Matching with a repeated regex, because you can't capture a capture group
    // multiple times.
    let matches = string.match(
      /([a-z]+)([A-Z][a-z]+)([A-Z][a-z]+)*([A-Z][a-z]+)*([A-Z][a-z]+)*/,
    );
    // There are no camelCased pieces, return the original.
    if (matches === null || matches.length < 2) {
      return string;
    }
    // Remove the first full match.
    matches.shift();
    // Filter out undefined matches.
    matches = matches.filter((el) => {
      return typeof el === 'string';
    });
    return matches.join('-').toLowerCase();
  }
}

/**
 * @file
 * Let browser find-in-page search hidden collapse panels and inactive tab panes
 * via hidden=until-found.
 */
import * as bootstrap from 'bootstrap';
import ComponentBase from '../core/component-base.js';
import WindowState from '../core/window-state.js';

// Panels that remain visible at certain breakpoints without .show (e.g. nav sidebar, tabcordion).
const RESPONSIVE_BLOCK_SELECTOR =
	'.d-sm-block, .d-md-block, .d-lg-block, .d-xl-block, .d-xxl-block';

/** Returns true if the browser supports hidden=until-found (via the beforematch event). */
const supportsUntilFound = () => 'onbeforematch' in document.body;

/**
 * Set or clear hidden=until-found on an element.
 *
 * @param {HTMLElement} element
 * @param {boolean} shouldHideUntilFound
 */
function setUntilFoundState(element, shouldHideUntilFound) {
	if (shouldHideUntilFound && element.getAttribute('hidden') !== 'until-found') {
		element.setAttribute('hidden', 'until-found');
	} else if (!shouldHideUntilFound && element.hasAttribute('hidden')) {
		element.removeAttribute('hidden');
	}
}

/**
 * Returns true when a collapse panel should receive hidden=until-found.
 *
 * @param {HTMLElement} panel
 * @return {boolean}
 */
function isCollapseHidden(panel) {
	// Panel is open or mid-close animation — don't treat as hidden.
	if (panel.classList.contains('show') || panel.classList.contains('collapsing')) return false;

	// hidden=until-found forces display:block, so computed style won't reflect the hidden state —
	// check the attribute directly instead.
	if (panel.getAttribute('hidden') === 'until-found') return true;

	// Responsive panels are visible at larger breakpoints without .show;
	// use computed style to detect when they're hidden at the current breakpoint.
	if (panel.matches(RESPONSIVE_BLOCK_SELECTOR)) return window.getComputedStyle(panel).display === 'none';

	return true;
}

/**
 * Returns true when a tab pane should receive hidden=until-found.
 *
 * Inactive panes use display:none, so until-found must go on the pane itself —
 * a parent with display:none blocks child search entirely. In tabcordion mobile
 * layout, panes are visible and content lives in collapse panels, so active panes
 * and those in mobile layout return false.
 *
 * @param {HTMLElement} tabPane
 * @return {boolean}
 */
function isTabPaneHidden(tabPane) {
	if (tabPane.classList.contains('active')) return false;
	if (tabPane.getAttribute('hidden') === 'until-found') return true;
	return window.getComputedStyle(tabPane).display === 'none';
}

/**
 * Find the tab trigger that controls a given pane.
 *
 * @param {HTMLElement} tabPane
 * @return {HTMLElement|null}
 */
function getTabTrigger(tabPane) {
	const labelledBy = tabPane.getAttribute('aria-labelledby');
	if (labelledBy) {
		const trigger = document.getElementById(labelledBy);
		if (trigger) return trigger;
	}

	if (!tabPane.id) return null;

	return (
		document.querySelector(`[data-bs-target="#${tabPane.id}"]`) ??
		document.querySelector(`[href="#${tabPane.id}"]`)
	);
}

/**
 * Wires hidden=until-found so find-in-page can search collapsed collapse panels,
 * then opens the matching panel before the browser reveals the match.
 */
export class UntilFoundCollapse extends ComponentBase {
	constructor() {
		super('until-found-collapse');
	}

	/** @inheritdoc */
	init() {
		if (!supportsUntilFound()) return this;

		this.items.forEach((panel) => {
			const collapse = bootstrap.Collapse.getOrCreateInstance(panel, { toggle: false });

			// Open the panel when find-in-page matches content inside it.
			panel.addEventListener('beforematch', () => collapse.show());

			// Remove until-found as soon as the panel starts opening.
			// (.show isn't on the element yet at show.bs.collapse.)
			panel.addEventListener('show.bs.collapse', () => setUntilFoundState(panel, false));
			panel.addEventListener('shown.bs.collapse', () => this.syncPanel(panel));
			panel.addEventListener('hidden.bs.collapse', () => this.syncPanel(panel));

			this.syncPanel(panel);
		});

		// Re-sync at breakpoints — tabcordion switches between tabs and accordion layout.
		WindowState.on('resize', () => this.syncAll());

		return this;
	}

	/**
	 * Sync hidden=until-found state on a single collapse panel.
	 *
	 * @param {HTMLElement} panel
	 */
	syncPanel(panel) {
		setUntilFoundState(panel, isCollapseHidden(panel));
	}

	/** Re-sync hidden=until-found on all bound collapse panels. */
	syncAll() {
		this.items.forEach((panel) => this.syncPanel(panel));
	}
}

/**
 * Wires hidden=until-found so find-in-page can search inactive tab panes,
 * then activates the matching tab before the browser reveals the match.
 */
export class UntilFoundTab extends ComponentBase {
	constructor() {
		super('until-found-tab');
	}

	/** @inheritdoc */
	init() {
		if (!supportsUntilFound()) return this;

		this.items.forEach((tabPane) => {
			// Activate the tab when find-in-page matches content inside it.
			tabPane.addEventListener('beforematch', () => {
				const trigger = getTabTrigger(tabPane);
				if (trigger) bootstrap.Tab.getOrCreateInstance(trigger).show();
			});

			this.syncPane(tabPane);
		});

		// After a tab switch, update until-found for all panes in that tab group.
		document.addEventListener('shown.bs.tab', (event) => {
			const targetSelector =
				event.target.getAttribute('data-bs-target') ??
				event.target.getAttribute('href');

			if (!targetSelector?.startsWith('#')) return;

			const tabContent = document.querySelector(targetSelector)?.closest('.tab-content');
			if (!tabContent) return;

			this.items
				.filter((pane) => tabContent.contains(pane))
				.forEach((pane) => this.syncPane(pane));
		});

		WindowState.on('resize', () => this.syncAll());

		return this;
	}

	/**
	 * Sync hidden=until-found state on a single tab pane.
	 *
	 * @param {HTMLElement} tabPane
	 */
	syncPane(tabPane) {
		setUntilFoundState(tabPane, isTabPaneHidden(tabPane));
	}

	/** Re-sync hidden=until-found on all bound tab panes. */
	syncAll() {
		this.items.forEach((tabPane) => this.syncPane(tabPane));
	}
}

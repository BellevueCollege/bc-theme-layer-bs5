import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import ComponentBase from '../core/component-base';
import WindowState from '../core/window-state';

/**
 * This class works in between app.js and swiper so custom functionality can be
 * added. Swiper has a robust API.
 *
 * @see https://swiperjs.com/swiper-api
 *
 * @param {object} destroyAt
 *  The breakpoint at which to destroy the slider.
 * @param {object} options
 *  The options object.
 *  	int slidesPerView
 *  		The number of slides per view.
 *  	bool watchSlidesProgress
 *  	int spaceBetween
 *  		The space between slides.
 *  	bool centeredSlides
 *  		Slides should be centered.
 *  	bool loop
 *  		Loop through slides.
 *  	object navigation
 *  		nextEl and prevEl selectors
 *  	object breakpoints
 *  		These are the breakpoints.
 *
 */
export default class Slider extends ComponentBase {
	constructor(options = {}) {
		super('slider');

		const sliderNavOptions = {
			...{
				nextEl: '.swiper-button-next',
				prevEl: '.swiper-button-prev',
			},
			...(options?.sliderOpts?.navigation ?? {}),
		};
		const sliderOptions = {
			...{
				slidesPerView: 'auto',
				watchSlidesVisibility: true,
				spaceBetween: 20,
				centeredSlides: false,
				loop: true,
				navigation: sliderNavOptions,
			},
			...(options?.sliderOpts ?? {}),
		};
		delete options.sliderOpts;

		/**
		 * Create the options from supplied options and defaults. Options can be
		 * specified on object creation by passing an object, or inline as data
		 * attributes on the tab DOM element. Data attribute options are
		 * kebab-cased versions of the options below, prefixed with data-slider.
		 *
		 * @property {string} target
		 *   Target DOM element that contains the sides to be used to init. Per
		 *   swiper docs, defaults to .swiper-container
		 * @property {destroyAt}
		 * @property {Object} sliderOpts
		 *   These are the options you want to supply to swiper.
		 */
		this.options = {
			...{
				target: '.swiper-container',
				destroyAt: undefined,
				sliderOpts: sliderOptions,
			},
			...options,
		};
	}

	/**
	 * Initialize each Slider.
	 */
	init() {
		Swiper.use([Navigation, Pagination]);

		this.items.forEach((slider) => {
			slider.swiper = {};
			slider.initialized = false;

			// Check destroyAt (mobile first) if we are below, init swiper.
			if (
				window.innerWidth < slider.destroyAt ||
				(slider.destroyAt === undefined && !slider.initialized)
			) {
				slider.swiper = new Swiper(
					slider.querySelector(slider.target),
					slider.sliderOpts
				);
				slider.initialized = true;

				// Decide what slide should be tabbable.
				Slider.tabindexAccessibility(slider);

				// Cherry-pick events for when to set tabbable.
				slider.swiper.onAny(function (event) {
					if (event === 'update' || event === 'slideChange') {
						Slider.tabindexAccessibility(slider);
					}
				});
			}

			// On window resize check if swiper init and destroyAt.
			if (slider.destroyAt !== undefined) {
				WindowState.on('resize', () => {
					// If swiper is init, and we resize above the destroyAt size, destroy
					// Swiper.
					if (
						slider.initialized &&
						window.innerWidth > slider.destroyAt
					) {
						slider.swiper.destroy(true, true);
						slider.initialized = false;
					}
					// If swiper is not init, and we resize below the destroyAt size, init
					// Swiper.
					if (
						!slider.initialized &&
						window.innerWidth < slider.destroyAt
					) {
						slider.swiper = new Swiper(
							slider.querySelector(slider.target),
							slider.sliderOpts
						);
						slider.initialized = true;
					}
				});
			}
		});
	}

	/**
	 * Set the tabindex attributes correctly for accessibility.
	 *
	 * The Swiper option watchSlidesVisibility must be set to true.
	 *
	 * @param {HTMLElement} slider
	 *   The slider to set tabindexes on.
	 */
	static tabindexAccessibility(slider) {
		// Collect an array of focusable elements inside a slide should not be able to tab to
		const tabbableElements = [
			'a[href]',
			'link[href]',
			'button',
			'input:not([type="hidden"])',
			'select',
			'textarea',
			'[draggable]',
			'audio[controls]',
			'video[controls]',
			'[tabindex]:not([tabindex="-1"])',
		];
		const slides = slider.querySelectorAll(
			`.${slider.swiper.params.slideClass}`
		);

		slides.forEach((slide) => {
			if (
				slide.classList.contains(slider.swiper.params.slideVisibleClass)
			) {
				slide.setAttribute('aria-hidden', 'false');
				slide.removeAttribute('tabindex');
				slide
					.querySelectorAll(tabbableElements)
					.forEach((tabbableElement) => {
						tabbableElement.removeAttribute('tabindex');
					});
			} else {
				slide.setAttribute('aria-hidden', 'true');
				slide.setAttribute('tabindex', '-1');
				slide
					.querySelectorAll(tabbableElements)
					.forEach((tabbableElement) => {
						tabbableElement.setAttribute('tabindex', '-1');
					});
			}
		});
	}
}

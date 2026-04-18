import { animate } from 'motion';

type FadeSlideOptions = {
	delay?: number;
	axis?: 'x' | 'y';
	from?: number;
};

const defaultOptions: Required<FadeSlideOptions> = {
	delay: 0,
	axis: 'y',
	from: 24
};

export function fadeSlide(node: HTMLElement, options: FadeSlideOptions = {}) {
	const opts = { ...defaultOptions, ...options } as Required<FadeSlideOptions>;
	let hasAnimated = false;
	let animation: ReturnType<typeof animate> | null = null;
	const reduceMotion =
		typeof window !== 'undefined'
			? window.matchMedia('(prefers-reduced-motion: reduce)').matches
			: false;

	const initialTransform =
		opts.axis === 'x' ? `translate3d(${opts.from}px, 0, 0)` : `translate3d(0, ${opts.from}px, 0)`;

	node.style.opacity = hasAnimated ? '1' : '0';
	node.style.transform = initialTransform;
	node.style.backfaceVisibility = 'hidden';

	const observer = new IntersectionObserver(
		(entries) => {
			const [entry] = entries;
			if (!entry?.isIntersecting || hasAnimated) return;
			hasAnimated = true;

			if (reduceMotion) {
				node.style.opacity = '1';
				node.style.transform = 'translate3d(0, 0, 0)';
				observer.disconnect();
				return;
			}

			node.style.willChange = 'transform, opacity';

			animation = animate(
				node,
				{ opacity: [0, 1], transform: [initialTransform, 'translate3d(0, 0, 0)'] },
				{
					delay: opts.delay,
					duration: 0.24,
					easing: 'cubic-bezier(0.22, 1, 0.36, 1)'
				}
			);

			animation.finished.finally(() => {
				node.style.willChange = '';
				node.style.backfaceVisibility = '';
				observer.disconnect();
			});
		},
		{ threshold: 0.18, rootMargin: '0px 0px -6% 0px' }
	);

	observer.observe(node);

	return {
		destroy() {
			observer.disconnect();
			animation?.cancel();
			node.style.willChange = '';
			node.style.backfaceVisibility = '';
		}
	};
}

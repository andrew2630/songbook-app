import { animate } from 'motion';

export function listTransition(node: HTMLElement, index = 0) {
	const reduceMotion =
		typeof window !== 'undefined'
			? window.matchMedia('(prefers-reduced-motion: reduce)').matches
			: false;

	if (reduceMotion) {
		node.style.opacity = '1';
		node.style.transform = 'translate3d(0, 0, 0)';
		return {
			destroy() {}
		};
	}

	node.style.opacity = '0';
	node.style.transform = 'translate3d(0, 12px, 0)';
	node.style.willChange = 'transform, opacity';
	node.style.backfaceVisibility = 'hidden';

	const animation = animate(
		node,
		{ opacity: [0, 1], transform: ['translate3d(0, 12px, 0)', 'translate3d(0, 0, 0)'] },
		{
			duration: 0.18,
			delay: Math.min(index, 5) * 0.018,
			easing: 'cubic-bezier(0.22, 1, 0.36, 1)'
		}
	);

	animation.finished.finally(() => {
		node.style.willChange = '';
		node.style.backfaceVisibility = '';
	});

	return {
		destroy() {
			animation.cancel();
			node.style.willChange = '';
			node.style.backfaceVisibility = '';
		}
	};
}

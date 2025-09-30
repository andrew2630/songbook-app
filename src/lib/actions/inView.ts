interface InViewOptions extends IntersectionObserverInit {
	once?: boolean;
}

export function inView(node: HTMLElement, options: InViewOptions = {}) {
	const { once = true, root = null, rootMargin = '0px', threshold = 0.15 } = options;

	const observer = new IntersectionObserver(
		(entries) => {
			const [entry] = entries;
			if (!entry) return;

			if (entry.isIntersecting) {
				node.dispatchEvent(new CustomEvent('enterViewport', { detail: entry }));
				if (once) {
					observer.disconnect();
				}
			} else if (!once) {
				node.dispatchEvent(new CustomEvent('exitViewport', { detail: entry }));
			}
		},
		{ root, rootMargin, threshold }
	);

	observer.observe(node);

	return {
		destroy() {
			observer.disconnect();
		}
	};
}

import { animate } from 'motion';

type FadeSlideOptions = {
  delay?: number;
  axis?: 'x' | 'y';
  from?: number;
  stiffness?: number;
  damping?: number;
};

const defaultOptions: Required<FadeSlideOptions> = {
  delay: 0,
  axis: 'y',
  from: 32,
  stiffness: 0.32,
  damping: 0.85
};

export function fadeSlide(node: HTMLElement, options: FadeSlideOptions = {}) {
  const opts = { ...defaultOptions, ...options } as Required<FadeSlideOptions>;
  let hasAnimated = false;

  const axisProperty = opts.axis === 'x' ? 'translateX' : 'translateY';

  const observer = new IntersectionObserver((entries) => {
    const entry = entries[0];
    if (entry?.isIntersecting && !hasAnimated) {
      hasAnimated = true;
      animate(
        node,
        { opacity: [0, 1], transform: [`${axisProperty}(${opts.from}px)`, `${axisProperty}(0px)`] } as Record<string, unknown>,
        {
          delay: opts.delay,
          duration: 0.55,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
        }
      );
    }
  }, { threshold: 0.2 });

  observer.observe(node);

  return {
    destroy() {
      observer.disconnect();
    }
  };
}

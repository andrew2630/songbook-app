import { animate } from 'motion';

export function listTransition(node: HTMLElement, index = 0) {
  const animation = animate(
    node,
    { opacity: [0, 1], transform: ['translateY(16px)', 'translateY(0)'] } as Record<string, unknown>,
    {
      duration: 0.45,
      delay: index * 0.05,
      ease: 'easeOut'
    }
  );

  return {
    destroy() {
      animation.cancel();
    }
  };
}

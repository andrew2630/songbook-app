import { browser } from '$app/environment';

interface LenisController {
  destroy(): void;
}

export async function initLenis(): Promise<LenisController | null> {
  if (!browser) return null;

  const { default: Lenis } = await import('lenis');
  const lenis = new Lenis({
    duration: 1.1
  });

  const root = document.documentElement;
  const body = document.body;

  body.classList.add('is-lenis');
  root.dataset.lenis = 'active';

  let rafId: number;
  const raf = (time: number) => {
    lenis.raf(time);
    rafId = requestAnimationFrame(raf);
  };

  rafId = requestAnimationFrame(raf);

  const resizeObserver = new ResizeObserver(() => lenis.resize());
  resizeObserver.observe(document.body);

  return {
    destroy() {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      body.classList.remove('is-lenis');
      delete root.dataset.lenis;
      lenis.destroy();
    }
  };
}

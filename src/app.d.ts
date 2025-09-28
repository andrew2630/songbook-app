// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
        namespace App {
                // interface Error {}
                // interface Locals {}
                // interface PageData {}
                // interface PageState {}
                // interface Platform {}
        }

        namespace svelteHTML {
                interface HTMLAttributes<T> {
                        'on:enterViewport'?: (event: CustomEvent<IntersectionObserverEntry>) => void;
                        'on:exitViewport'?: (event: CustomEvent<IntersectionObserverEntry>) => void;
                }
        }
}

declare module 'lenis' {
        interface LenisOptions {
                duration?: number;
                easing?: (t: number) => number;
                smoothWheel?: boolean;
                smoothTouch?: boolean;
        }

        export default class Lenis {
                constructor(options?: LenisOptions);
                raf(time: number): void;
                stop(): void;
                start(): void;
                resize(): void;
                destroy(): void;
        }
}

export {};

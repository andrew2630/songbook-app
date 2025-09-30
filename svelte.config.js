import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const normalizedBasePath = (() => {
        const raw = process.env.BASE_PATH?.trim();
        if (!raw) return '';

        const withoutTrailing = raw.replace(/\/+$/, '');
        const withoutLeading = withoutTrailing.replace(/^\/+/, '');

        return withoutLeading ? `/${withoutLeading}` : '';
})();

/** @type {import('@sveltejs/kit').Config} */
const config = {
        // Consult https://svelte.dev/docs/kit/integrations
        // for more information about preprocessors
        preprocess: [vitePreprocess({ postcss: true })],

        kit: {
                adapter: adapter({
                        fallback: '200.html'
                }),
                paths: {
                        base: normalizedBasePath,
                        assets: normalizedBasePath
                }
        }
};

export default config;

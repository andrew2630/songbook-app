import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { loadEnv } from 'vite';

const env = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '');

const normalizedBasePath = (() => {
	const raw = (process.env.BASE_PATH ?? env.BASE_PATH)?.trim();
	if (!raw) return '';

	const withoutTrailing = raw.replace(/\/+$/, '');
	const withoutLeading = withoutTrailing.replace(/^\/+/, '');

	return withoutLeading ? `/${withoutLeading}` : '';
})();

const normalizedAssetsPath = (() => {
	const raw = (process.env.ASSETS_PATH ?? env.ASSETS_PATH)?.trim();
	if (!raw) return undefined;

	const withoutTrailing = raw.replace(/\/+$/, '');

	if (/^(?:[a-zA-Z][a-zA-Z\d+.-]*:)?\/\//.test(withoutTrailing)) {
		return withoutTrailing;
	}

	console.warn(
		`Ignoring invalid ASSETS_PATH value "${raw}". The assets path must be an absolute URL.`
	);

	return undefined;
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
			...(normalizedAssetsPath ? { assets: normalizedAssetsPath } : {})
		}
	}
};

export default config;

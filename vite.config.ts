import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import devtoolsJson from 'vite-plugin-devtools-json';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit(), SvelteKitPWA(), devtoolsJson()]
});

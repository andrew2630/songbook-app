import devtoolsJson from 'vite-plugin-devtools-json';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

const optimizeDepsExclude = [
	'svelte-i18n',
	'lucide-svelte',
	'idb',
	'motion',
	'@supabase/supabase-js'
];

export default defineConfig({
	plugins: [sveltekit(), devtoolsJson()],
	optimizeDeps: {
		exclude: optimizeDepsExclude
	},
	test: {
		environment: 'node',
		include: ['src/**/*.test.ts']
	}
});

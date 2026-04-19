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
		include: ['src/**/*.test.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json-summary'],
			include: [
				'src/lib/db/songs.ts',
				'src/lib/stores/preferences.ts',
				'src/lib/stores/pwa.ts',
				'src/lib/stores/ui.ts',
				'src/lib/utils/lenis.ts',
				'src/lib/utils/pageIndex.ts',
				'src/lib/utils/songContent.ts',
				'src/lib/utils/songNavigation.ts',
				'src/lib/utils/songTextScale.ts',
				'src/lib/utils/sourceLabel.ts'
			]
		}
	}
});

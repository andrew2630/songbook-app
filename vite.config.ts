import devtoolsJson from 'vite-plugin-devtools-json';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const optimizeDepsExclude = [
        'svelte-i18n',
        '@melt-ui/svelte',
        'lucide-svelte',
        'idb',
        'motion',
        '@supabase/supabase-js'
];

export default defineConfig({
        plugins: [sveltekit(), devtoolsJson()],
        optimizeDeps: {
                exclude: optimizeDepsExclude
        }
});

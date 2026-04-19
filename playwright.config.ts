import { defineConfig, devices } from '@playwright/test';

const nodeExec =
	process.platform === 'win32'
		? '"C:\\Users\\andrz\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\bin\\node.exe"'
		: 'node';
const viteExec = '"node_modules/vite/bin/vite.js"';

export default defineConfig({
	testDir: './playwright',
	timeout: 30_000,
	expect: {
		timeout: 10_000
	},
	use: {
		baseURL: 'http://127.0.0.1:4173',
		trace: 'on-first-retry'
	},
	webServer: {
		command: `${nodeExec} ${viteExec} build && ${nodeExec} ${viteExec} preview --host 127.0.0.1 --port 4173`,
		url: 'http://127.0.0.1:4173',
		env: {
			BASE_PATH: '',
			PUBLIC_DISABLE_SERVICE_WORKER: 'true'
		},
		reuseExistingServer: !process.env.CI,
		timeout: 240_000
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		},
		{
			name: 'mobile-chrome',
			use: { ...devices['Pixel 7'] }
		}
	]
});

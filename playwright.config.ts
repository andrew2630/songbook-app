import { defineConfig, devices } from '@playwright/test';

const npmRun =
	process.platform === 'win32' ? '"C:\\Program Files\\nodejs\\npm.cmd" run' : 'npm run';

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
		command: `${npmRun} build && ${npmRun} preview -- --host 127.0.0.1 --port 4173`,
		url: 'http://127.0.0.1:4173',
		env: {
			BASE_PATH: ''
		},
		reuseExistingServer: !process.env.CI,
		timeout: 120_000
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

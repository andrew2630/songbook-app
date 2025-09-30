import skeleton from '@skeletonlabs/tw-plugin';

const baseThemeProperties = {
	'--theme-font-family-base':
		'Inter, "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
	'--theme-font-family-heading':
		'Inter, "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
	'--theme-font-color-base': '14 23 42',
	'--theme-font-color-dark': '237 242 255',
	'--theme-rounded-base': '1.75rem',
	'--theme-rounded-container': '2rem',
	'--theme-border-base': '1px',
	'--on-primary': '244 246 255',
	'--on-secondary': '12 17 32',
	'--on-tertiary': '12 17 32',
	'--on-success': '12 17 32',
	'--on-warning': '12 17 32',
	'--on-error': '244 246 255',
	'--on-surface': '14 23 42'
};

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontSize: {
				xs: ['0.75rem', { lineHeight: '1rem' }],
				sm: ['0.875rem', { lineHeight: '1.25rem' }],
				base: ['1rem', { lineHeight: '1.5rem' }],
				lg: ['1.125rem', { lineHeight: '1.75rem' }],
				xl: ['1.25rem', { lineHeight: '1.75rem' }],
				'2xl': ['1.5rem', { lineHeight: '2rem' }],
				'3xl': ['1.875rem', { lineHeight: '2.25rem' }],
				'4xl': ['2.25rem', { lineHeight: '2.5rem' }],
				'5xl': ['3rem', { lineHeight: '1' }],
				'6xl': ['3.75rem', { lineHeight: '1' }],
				'7xl': ['4.5rem', { lineHeight: '1' }],
				'8xl': ['6rem', { lineHeight: '1' }],
				'9xl': ['8rem', { lineHeight: '1' }]
			},
			boxShadow: {
				glow: '0 40px 160px -60px rgba(99, 102, 241, 0.45)'
			}
		}
	},
	plugins: [
		skeleton({
			themes: {
				preset: ['skeleton', 'modern'],
				custom: [
                                        {
                                                name: 'songbook-dawn',
                                                properties: {
                                                        ...baseThemeProperties,
                                                        '--color-primary-50': '255 247 237',
                                                        '--color-primary-100': '255 237 213',
                                                        '--color-primary-200': '254 215 170',
                                                        '--color-primary-300': '253 186 116',
                                                        '--color-primary-400': '251 146 60',
                                                        '--color-primary-500': '249 115 22',
                                                        '--color-primary-600': '234 88 12',
                                                        '--color-primary-700': '194 65 12',
                                                        '--color-primary-800': '154 52 18',
                                                        '--color-primary-900': '124 45 18',
                                                        '--color-secondary-50': '253 244 255',
                                                        '--color-secondary-100': '250 232 255',
                                                        '--color-secondary-200': '245 208 254',
                                                        '--color-secondary-300': '240 171 252',
                                                        '--color-secondary-400': '232 121 249',
                                                        '--color-secondary-500': '217 70 239',
                                                        '--color-secondary-600': '192 38 211',
                                                        '--color-secondary-700': '162 28 175',
                                                        '--color-secondary-800': '134 25 143',
                                                        '--color-secondary-900': '112 26 117',
                                                        '--color-surface-50': '255 248 244',
                                                        '--color-surface-100': '255 239 226',
                                                        '--color-surface-200': '254 223 200',
                                                        '--color-surface-300': '253 206 170',
                                                        '--color-surface-400': '251 182 140',
                                                        '--color-surface-500': '246 150 104',
                                                        '--color-surface-600': '229 125 82',
                                                        '--color-surface-700': '201 96 62',
                                                        '--color-surface-800': '163 72 47',
                                                        '--color-surface-900': '120 52 34'
                                                }
                                        }
                                ]
			}
		})
	]
};

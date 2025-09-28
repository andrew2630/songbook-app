import skeleton from '@skeletonlabs/tw-plugin';

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
            name: 'songbook-modern',
            properties: {
              '--theme-font-family-base': 'Inter, "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              '--theme-font-family-heading': 'Inter, "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
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
              '--on-surface': '14 23 42',
              '--color-primary-50': '238 242 255',
              '--color-primary-100': '224 231 255',
              '--color-primary-200': '199 210 254',
              '--color-primary-300': '165 180 252',
              '--color-primary-400': '129 140 248',
              '--color-primary-500': '99 102 241',
              '--color-primary-600': '79 70 229',
              '--color-primary-700': '67 56 202',
              '--color-primary-800': '55 48 163',
              '--color-primary-900': '49 46 129',
              '--color-secondary-50': '236 254 255',
              '--color-secondary-100': '207 250 254',
              '--color-secondary-200': '165 243 252',
              '--color-secondary-300': '103 232 249',
              '--color-secondary-400': '34 211 238',
              '--color-secondary-500': '14 165 233',
              '--color-secondary-600': '8 145 178',
              '--color-secondary-700': '14 116 144',
              '--color-secondary-800': '21 94 117',
              '--color-secondary-900': '22 78 99',
              '--color-surface-50': '244 247 255',
              '--color-surface-100': '235 240 255',
              '--color-surface-200': '221 229 254',
              '--color-surface-300': '196 210 252',
              '--color-surface-400': '165 180 252',
              '--color-surface-500': '129 140 248',
              '--color-surface-600': '99 102 241',
              '--color-surface-700': '79 70 229',
              '--color-surface-800': '67 56 202',
              '--color-surface-900': '55 48 163'
            }
          }
        ]
      }
    })
  ]
};

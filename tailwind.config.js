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
            name: 'songbook-modern',
            properties: {
              ...baseThemeProperties,
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
          },
          {
            name: 'songbook-forest',
            properties: {
              ...baseThemeProperties,
              '--theme-font-color-base': '17 45 30',
              '--on-secondary': '24 54 40',
              '--on-surface': '17 45 30',
              '--color-primary-50': '240 253 244',
              '--color-primary-100': '220 252 231',
              '--color-primary-200': '187 247 208',
              '--color-primary-300': '134 239 172',
              '--color-primary-400': '74 222 128',
              '--color-primary-500': '34 197 94',
              '--color-primary-600': '22 163 74',
              '--color-primary-700': '21 128 61',
              '--color-primary-800': '22 101 52',
              '--color-primary-900': '20 83 45',
              '--color-secondary-50': '255 251 235',
              '--color-secondary-100': '254 243 199',
              '--color-secondary-200': '253 230 138',
              '--color-secondary-300': '252 211 77',
              '--color-secondary-400': '251 191 36',
              '--color-secondary-500': '245 158 11',
              '--color-secondary-600': '217 119 6',
              '--color-secondary-700': '180 83 9',
              '--color-secondary-800': '146 64 14',
              '--color-secondary-900': '120 53 15',
              '--color-surface-50': '236 252 244',
              '--color-surface-100': '214 245 225',
              '--color-surface-200': '186 230 203',
              '--color-surface-300': '152 211 174',
              '--color-surface-400': '120 184 148',
              '--color-surface-500': '91 154 121',
              '--color-surface-600': '66 122 95',
              '--color-surface-700': '47 94 73',
              '--color-surface-800': '33 69 53',
              '--color-surface-900': '24 54 40'
            }
          },
          {
            name: 'songbook-sunrise',
            properties: {
              ...baseThemeProperties,
              '--theme-font-color-base': '80 21 36',
              '--on-secondary': '80 21 36',
              '--on-surface': '80 21 36',
              '--color-primary-50': '255 241 242',
              '--color-primary-100': '255 228 230',
              '--color-primary-200': '254 205 211',
              '--color-primary-300': '253 164 175',
              '--color-primary-400': '251 113 133',
              '--color-primary-500': '244 63 94',
              '--color-primary-600': '225 29 72',
              '--color-primary-700': '190 18 60',
              '--color-primary-800': '159 18 57',
              '--color-primary-900': '136 19 55',
              '--color-secondary-50': '255 247 237',
              '--color-secondary-100': '255 237 213',
              '--color-secondary-200': '254 215 170',
              '--color-secondary-300': '253 186 116',
              '--color-secondary-400': '251 146 60',
              '--color-secondary-500': '249 115 22',
              '--color-secondary-600': '234 88 12',
              '--color-secondary-700': '194 65 12',
              '--color-secondary-800': '154 52 18',
              '--color-secondary-900': '124 45 18',
              '--color-surface-50': '255 246 240',
              '--color-surface-100': '255 237 226',
              '--color-surface-200': '254 215 204',
              '--color-surface-300': '252 196 185',
              '--color-surface-400': '248 169 159',
              '--color-surface-500': '240 139 131',
              '--color-surface-600': '226 113 120',
              '--color-surface-700': '201 94 105',
              '--color-surface-800': '161 71 82',
              '--color-surface-900': '116 44 59'
            }
          }
        ]
      }
    })
  ]
};

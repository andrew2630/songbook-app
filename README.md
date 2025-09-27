# Songbook App

A modern, bilingual worship songbook for the Bretheren Fellowship. The app ships with an offline-first experience, polished gold-and-navy branding, and installable PWA support for phones, tablets, and desktops.

## Features

- ✨ **Responsive worship library** – adaptive layout keeps search, filters, and song cards easy to use from small phones to large displays.
- 🌍 **Bilingual experience** – quick language switcher (PL/EN) with updated copy that reinforces the global community message.
- 📲 **Installable PWA** – updated manifest, SVG icons, and theme colour so the app can be installed to home screens on iOS, Android, and desktop.
- 🔄 **Smart sync status** – real-time syncing banner and offline-ready messaging to keep teams informed.
- 🎨 **Brand-aligned UI** – gold-accent palette, globe cross mark, and refined chip/heading treatments inspired by the provided logo.

## Tech stack

- [SvelteKit](https://kit.svelte.dev/) with TypeScript
- Tailwind CSS v4 for utility styling
- Supabase for data sync
- Melt UI components, Motion, and i18n helpers
- Progressive Web App (PWA) service worker and offline caching

## Getting started

```bash
npm install
npm run dev
```

The dev server runs on [`http://localhost:5173`](http://localhost:5173). Enable HTTPS if you want to test PWA installation prompts locally.

If you see a TypeScript error about a missing `.svelte-kit/tsconfig.json`, run:

```bash
npm run prepare
```

## Build & preview

```bash
npm run build
npm run preview
```

`npm run preview` serves the production build so you can verify manifest and service worker behaviour before deployment.

## Progressive Web App checklist

1. Build the project: `npm run build`
2. Serve the output with `npm run preview` or your preferred static host
3. Open Chrome/Edge DevTools → Application → Manifest to confirm the new icons, theme colour, and installability status
4. On iOS Safari, use the share sheet → “Add to Home Screen”

## Branding assets

- `static/logo.svg`: Primary vector globe-cross brand mark (also referenced by the PWA manifest)
- `static/favicon.svg`: Scalable favicon and mask icon used across browsers

Feel free to adapt the colours or typography in `src/app.css` if your design system evolves.

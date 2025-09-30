# Śpiewnik Wspólnoty Biblijnej KWCh

A modern, bilingual worship songbook for the KWCh Bible Fellowship. The app ships with an offline-first experience, polished gold-and-navy branding, and installable PWA support for phones, tablets, and desktops.

## Features

- ✨ **Responsive worship library** – adaptive layout keeps search, filters, and song cards easy to use from small phones to large displays.
- 🌍 **Bilingual experience** – compact language switcher (PL/EN) with updated copy that reinforces the global community message.
- 📲 **Installable PWA** – install button and updated manifest/icons let the app live on home screens for iOS, Android, and desktop.
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

### Deploying to a subdirectory

Set the `BASE_PATH` environment variable to the public directory you will host under (for example `BASE_PATH=songbook`) before running `npm run build`. The generated site will include the correct paths for routing, service worker registration, and static assets when served from `https://kwch.wroclaw.pl/songbook/` or another subdirectory.

## Install as a standalone app

- **Desktop (Chrome/Edge)** – open the site, click the “Install app” pill in the hero, or use the browser’s install icon in the address bar.
- **Android** – open the site in Chrome, accept the install prompt, or use the overflow menu → _Install app_.
- **iOS/iPadOS** – open the site in Safari, tap the share icon → _Add to Home Screen_.

When testing locally, run `npm run preview` so the service worker and install prompt are available.

## Branding assets

- `static/logo.png`: Primary logo asset used for install icons, Apple touch icons, and larger surfaces. Replace with your own branding.
- `static/favicon.ico`: Legacy favicon for browsers that prefer `.ico` files. Add your copy to `static/` to override the default.
- `static/favicon.png`: Modern favicon used across browsers alongside the `.ico` fallback.

Feel free to adapt the colours or typography in `src/app.css` if your design system evolves.

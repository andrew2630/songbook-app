/// <reference lib="webworker" />
import { build, files, version } from '$service-worker';

const ASSETS = ['/', ...build, ...files];
const ASSET_URLS = ASSETS.map((path) => new URL(path, self.location.origin).toString());
const ASSET_SET = new Set(ASSET_URLS);
const CACHE = `songbook-cache-${version}`;
const APP_SHELL = new URL('/', self.location.origin).toString();

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(ASSET_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.map((key) => (key === CACHE ? Promise.resolve() : caches.delete(key))))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const serialized = url.toString();

  if (request.mode === 'navigate') {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const cachedPage = await cache.match(request);
        if (cachedPage) {
          return cachedPage;
        }

        try {
          const response = await fetch(request);
          cache.put(request, response.clone());
          return response;
        } catch (error) {
          const fallback = await cache.match(APP_SHELL);
          if (fallback) return fallback;
          throw error;
        }
      })
    );
    return;
  }

  if (ASSET_SET.has(serialized)) {
    event.respondWith(caches.match(request));
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) {
          return cached;
        }

        try {
          const response = await fetch(request);
          cache.put(request, response.clone());
          return response;
        } catch (error) {
          return cached ?? Response.error();
        }
      })
    );
  }
});

/// <reference lib="webworker" />
import { build, files, version } from '$service-worker';

const scopeUrl = new URL(self.registration?.scope ?? self.location.href);
const basePath = scopeUrl.pathname.replace(/\/$/, '');

const resolvePath = (path: string) => {
	if (path === '/') {
		return basePath || '/';
	}

	const normalized = path.startsWith('/') ? path : `/${path}`;
	return `${basePath}${normalized}`;
};

const assetPaths = [resolvePath('/'), ...build.map(resolvePath), ...files.map(resolvePath)];
const ASSET_URLS = assetPaths.map((path) => new URL(path, scopeUrl.origin).toString());
const ASSET_SET = new Set(ASSET_URLS);
const CACHE = `songbook-cache-${version}`;
const DATA_CACHE = `songbook-data-${version}`;
const APP_SHELL = new URL(resolvePath('/'), scopeUrl.origin).toString();
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? '';

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
				Promise.all(
					keys.map((key) =>
						key === CACHE || key === DATA_CACHE ? Promise.resolve() : caches.delete(key)
					)
				)
			)
			.then(() => self.clients.claim())
	);
});

self.addEventListener('fetch', (event) => {
	const request = event.request;
	if (request.method !== 'GET') return;

	const url = new URL(request.url);
	const serialized = url.toString();

	if (SUPABASE_URL && serialized.startsWith(SUPABASE_URL)) {
		event.respondWith(
			caches.open(DATA_CACHE).then(async (cache) => {
				try {
					const response = await fetch(request);
					cache.put(request, response.clone());
					return response;
				} catch (error) {
					const cachedResponse = await cache.match(request);
					if (cachedResponse) {
						return cachedResponse;
					}
					throw error;
				}
			})
		);
		return;
	}

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

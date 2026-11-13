'use strict';
const CACHE_PREFIX = 'miau-bit-pwa-';
const CACHE_NAME = 'miau-bit-pwa-a7ce1443f2b6';
const APP_FILES = [
  "./",
  "app.js",
  "journey.js",
  "journey.css",
  "episodes.css",
  "luma.css",
  "assets/episodio-luma.jpg",
  "assets/episodio-sanduiche.jpg",
  "assets/episodio-foto.jpg",
  "assets/dm-sans-400.woff",
  "assets/dm-sans-500.woff",
  "assets/dm-sans-600.woff",
  "assets/dm-sans-700.woff",
  "assets/icons/favicon-16-v2.png",
  "assets/icons/favicon-32-v2.png",
  "assets/icons/apple-touch-icon-v2.png",
  "assets/icons/miau-bit-192-v2.png",
  "assets/icons/miau-bit-512-v2.png",
  "assets/icons/miau-bit-maskable-512-v2.png",
  "assets/nunito-400.woff",
  "assets/nunito-600.woff",
  "assets/nunito-700.woff",
  "assets/nunito-800.woff",
  "assets/nunito-900.woff",
  "assets/quintal.webp",
  "assets/symbols.woff",
  "awareness.css",
  "awareness.js",
  "index.html",
  "manifest.webmanifest",
  "pwa.css",
  "pwa.js",
  "styles.css"
];
const BASE_URL = new URL('./', self.location.href);
const SHELL_URL = new URL('index.html', BASE_URL).href;
const KNOWN_URLS = new Set(APP_FILES.map(path => new URL(path, BASE_URL).href));

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      await cache.addAll(APP_FILES.map(path => new Request(new URL(path, BASE_URL), {cache: 'reload'})));
    } catch (error) {
      await caches.delete(CACHE_NAME);
      throw error;
    }
    // Activate only after the whole offline bundle is ready. Open games do not reload.
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
      .map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== BASE_URL.origin) return;
  const canonicalURL = new URL(url.pathname, BASE_URL.origin).href;
  const isAppNavigation = request.mode === 'navigate' &&
    (url.pathname === BASE_URL.pathname || canonicalURL === SHELL_URL);
  if (!isAppNavigation && !KNOWN_URLS.has(canonicalURL)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(isAppNavigation ? SHELL_URL : canonicalURL);
    if (cached) return cached;
    try { return await fetch(request); }
    catch (_) {
      if (isAppNavigation) {
        return new Response('<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Miau &amp; Bit</title><body style="font-family:system-ui;background:#fbf8ee;color:#243e36;padding:2rem"><h1>O quintal espera por você!</h1><p>Conecte este aparelho à internet e abra novamente para guardar as aventuras.</p></body></html>', {status: 503, headers: {'Content-Type': 'text/html; charset=utf-8'}});
      }
      return Response.error();
    }
  })());
});

/* 超级小兔2.1 — Service Worker
 * 策略：页面(navigation) 走网络优先，保证一上线就是新版本；静态资源走缓存优先，断网也能打开。
 * 更新：改这里的 VERSION 即可让所有设备下次打开时换新缓存。
 */
const VERSION = 'sr-v1.0.0';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    await Promise.allSettled(
      ASSETS.map((url) => cache.add(new Request(url, { cache: 'reload' })))
    );
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter((k) => k.startsWith('sr-') && k !== VERSION).map((k) => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch { return; }
  if (url.origin !== self.location.origin) return;

  /* 页面导航：网络优先，断了再回缓存 */
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(VERSION);
      try {
        const fresh = await fetch(req);
        if (fresh && fresh.ok) {
          cache.put('./index.html', fresh.clone()).catch(() => {});
        }
        return fresh;
      } catch {
        return (await cache.match('./index.html')) ||
               (await cache.match('./')) ||
               new Response('<h1>离线</h1><p>本机没有缓存副本，请联网后再打开一次。</p>',
                 { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      }
    })());
    return;
  }

  /* 静态资源：缓存优先 */
  event.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    try {
      const res = await fetch(req);
      if (res && res.ok) cache.put(req, res.clone()).catch(() => {});
      return res;
    } catch {
      return new Response('', { status: 504, statusText: 'Offline' });
    }
  })());
});

const cacheName = 'ispent.money-v1'
const appShellFiles = [
  './',
  './index.html',
  './index.js',
  './style.css',
  './favicon.ico',
  './res/android-chrome-192x192.png',
  './res/android-chrome-512x512.png',
  './res/apple-touch-icon.png',
  './res/favicon-16x16.png',
  './res/favicon-32x32.png',
]

self.addEventListener('install', e => {
  console.log('[Service Worker] Install')
  e.waitUntil((async () => {
    const cache = await caches.open(cacheName)
    console.log('[Service Worker] Caching all: app shell and content')
    await cache.addAll(contentToCache)
  })())
})

self.addEventListener('fetch', e => {
  e.respondWith((async () => {
    const r = await caches.match(e.request)
    console.log(`[Service Worker] Fetching resource: ${e.request.url}`)
    if (r) return r
    const response = await fetch(e.request)
    const cache = await caches.open(cacheName)
    console.log(`[Service Worker] Caching new resoource: ${e.request.url}`)
    cache.put(e.request, response.clone())
    return response
  })())
})
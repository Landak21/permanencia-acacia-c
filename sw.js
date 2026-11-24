/*
 * SIS-MEDIA-PERMANENCIA-APP · sw.js · V1.0 · 24 de noviembre de 2026
 * Permite abrir la app sin señal. Solo guarda los archivos de la app (nunca datos ni respuestas del servidor).
 * La página se pide primero a la red: así una versión nueva llega sola la siguiente vez que se abre con señal.
 * Al publicar una versión nueva de la app, suba VERSION aquí también.
 */
const VERSION = 'permanencia-1.0.0';
const ARCHIVOS = ['./', './index.html', './manifest.webmanifest', './escudo.png', './icono-192.png', './icono-512.png',
  './icono-maskable-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(claves => Promise.all(claves.filter(k => k.startsWith('permanencia-') && k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;   // el servidor de Google nunca pasa por aquí
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => {
      const copia = r.clone();
      caches.open(VERSION).then(c => c.put('./index.html', copia));
      return r;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(r => r || fetch(req)));
});

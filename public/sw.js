/* Service worker des applications Westaf Records (client) et Westaf Admin.
 * - Pages : réseau d'abord, page d'accueil en cache si hors connexion.
 * - Fichiers du site (/assets, icônes, polices) : cache d'abord (noms versionnés par le build).
 * - Les appels à l'API ne sont jamais mis en cache (données toujours à jour).
 * - Notifications push : affichées sur l'écran du téléphone, ouverture de la bonne page au clic.
 */
const VERSION = 'westaf-v1';
const SHELL = ['/', '/index.html', '/logo.jpg', '/icons/client-192.png', '/icons/admin-192.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Navigation : réseau, sinon page en cache (application utilisable hors connexion)
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put('/index.html', copy));
        return res;
      }).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Fichiers statiques du site et polices : cache d'abord
  const isStatic = url.origin === self.location.origin && (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/icons/') || /\.(png|jpe?g|webp|svg|ico|woff2?)$/.test(url.pathname));
  const isFont = url.hostname === 'fonts.gstatic.com' || url.hostname === 'fonts.googleapis.com';
  if (isStatic || isFont) {
    event.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
        return res;
      }))
    );
  }
  // Tout le reste (API, PayTech…) : réseau uniquement
});

// --- Notifications push ---
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = { title: 'Westaf Records', body: event.data ? event.data.text() : '' }; }
  const isAdmin = (data.url || '').startsWith('/admin') || (data.url || '').startsWith('/ingenieur');
  event.waitUntil(self.registration.showNotification(data.title || 'Westaf Records', {
    body: data.body || '',
    icon: isAdmin ? '/icons/admin-192.png' : '/icons/client-192.png',
    badge: isAdmin ? '/icons/admin-192.png' : '/icons/client-192.png',
    tag: data.tag ? `${data.tag}-${Date.now()}` : undefined,
    data: { url: data.url || '/' },
    vibrate: [120, 60, 120]
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || '/', self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
      const win = wins.find((w) => new URL(w.url).origin === self.location.origin);
      if (win) return win.focus().then(() => win.navigate(target));
      return self.clients.openWindow(target);
    })
  );
});

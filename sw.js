// Hand Casino service worker — shows message notifications and opens the chat when one is tapped.
// Keep this file next to index.html (same folder). It does no caching, so it can never show stale pages.
const ICON = 'apple-touch-icon.png';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) { data = { body: event.data ? event.data.text() : '' }; }
  event.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    // Already looking at the site? The live chat shows it — skip the pop-up (Apple browsers insist every push is shown).
    const apple = /iPhone|iPad|iPod|Macintosh/.test((self.navigator && self.navigator.userAgent) || '');
    if (!apple && wins.some((w) => w.visibilityState === 'visible' && w.focused)) return;
    await self.registration.showNotification(data.title || 'Hand Casino', {
      body: data.body || 'You have a new message',
      tag: data.tag || 'chat',
      renotify: true,
      icon: new URL(ICON, self.registration.scope).href,
      data: { scope: data.scope || '' },
    });
  })());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const scope = (event.notification.data && event.notification.data.scope) || '';
  event.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const w of wins) {
      if ('focus' in w) { await w.focus(); w.postMessage({ type: 'open-chat', scope }); return; }
    }
    await self.clients.openWindow(new URL('./' + (scope ? '?chat=' + encodeURIComponent(scope) : ''), self.registration.scope).href);
  })());
});

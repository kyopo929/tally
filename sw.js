// Offline cache for the app shell. Bump VERSION when files change.
const VERSION = 'tally-v82';
const FILES = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './vendor/supabase.js', './config.js'];
const PUSH_LOG = 'tally-push-log'; // reminders already shown by a push, so the app doesn't show them again
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION && k !== PUSH_LOG && k !== 'tally-share').map(k => caches.delete(k))))); self.clients.claim(); });
// Photos/PDFs shared from another app on the phone: keep them for the app to pick up
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'POST' || u.origin !== location.origin || !u.pathname.endsWith('/share-in')) return;
  e.respondWith((async () => {
    try {
      const f = await e.request.formData(), c = await caches.open('tally-share');
      const files = f.getAll('files').filter(x => x && typeof x !== 'string' && x.size);
      for (let i = 0; i < files.length; i++) await c.put('/__share/' + i, new Response(files[i], { headers: { 'Content-Type': files[i].type || 'application/octet-stream', 'X-Name': encodeURIComponent(files[i].name || 'file') } }));
      await c.put('/__share/meta', new Response(JSON.stringify({ n: files.length, title: f.get('title') || '', text: f.get('text') || '', url: f.get('url') || '' })));
    } catch (x) { }
    return Response.redirect('./?share=1', 303);
  })());
});
// Network first so updates show up. On a weak signal, wait at most 3 seconds, then open the saved copy
// (the download carries on in the background, so the next start has the newest version). Offline: the saved copy.
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || u.pathname.startsWith('/api/') || u.pathname.startsWith('/feed/')) return;
  const cached = () => caches.match(e.request, { ignoreSearch: u.pathname === '/' || u.pathname.endsWith('/index.html') });
  const net = fetch(e.request).then(r => { if (r.ok) { const copy = r.clone(); const w = caches.open(VERSION).then(c => c.put(e.request, copy)); try { e.waitUntil(w); } catch (x) { } } return r; });
  e.respondWith(new Promise(resolve => {
    let done = false;
    const give = r => { if (!done && r) { done = true; resolve(r); } };
    const timer = setTimeout(() => cached().then(give), 3000);
    net.then(r => { clearTimeout(timer); give(r); }, () => { clearTimeout(timer); cached().then(r => r ? give(r) : give(Response.error())); });
  }));
});

// Reminders sent by the server while Tally is closed
async function logPushed(key) {
  try {
    const c = await caches.open(PUSH_LOG), r = await c.match('/__pushed');
    const list = r ? await r.json() : [];
    if (!list.includes(key)) list.push(key);
    await c.put('/__pushed', new Response(JSON.stringify(list.slice(-300)), { headers: { 'Content-Type': 'application/json' } }));
  } catch (e) { }
}
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = { title: e.data ? e.data.text() : 'Reminder' }; }
  e.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    // Dealt with on another device: take it away here too
    if (d.clear) {
      const ns = await self.registration.getNotifications({ tag: d.clear });
      ns.forEach(n => n.close());
      if (d.at) await logPushed(d.clear + '|' + d.at);
      wins.forEach(w => w.postMessage({ tallyClear: d.clear }));
      return;
    }
    // Tally is open and on screen: it shows its own reminder, so don't double up
    if (wins.some(w => w.visibilityState === 'visible')) return;
    if (d.id && d.at) await logPushed(d.id + '|' + d.at);
    await self.registration.showNotification(d.title || 'Reminder', {
      body: d.body || '', tag: d.id || undefined, renotify: true,
      icon: 'icons/icon-192.png?v=2', badge: 'icons/badge-96.png',
      data: { id: d.id || null, at: d.at || null }, timestamp: Date.now(),
      actions: d.id ? (d.event ? [] : [{ action: 'done', title: 'Done' }]).concat([{ action: 'snooze', title: 'Snooze 1 hour' }]) : []
    });
  })());
});

// Tell the server this device dealt with a reminder, so it's cleared on your other devices
async function reportDismiss(n) {
  const id = n && n.data && n.data.id;
  if (!id) return;
  try {
    const sub = await self.registration.pushManager.getSubscription();
    if (!sub) return;
    await fetch('/api/push', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dismiss: { id, endpoint: sub.endpoint } }) });
  } catch (e) { }
}
self.addEventListener('notificationclose', e => {
  const id = e.notification.data && e.notification.data.id;
  e.waitUntil(Promise.all([reportDismiss(e.notification), self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(ws => { if (id) ws.forEach(w => w.postMessage({ tallyClear: id })); })]));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const id = e.notification.data && e.notification.data.id;
  const rep = reportDismiss(e.notification);
  e.waitUntil(Promise.all([rep, (async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    // Done / Snooze buttons on the notification: Tally does it (opening if needed) and shows Undo
    const act = e.action === 'done' || e.action === 'snooze' ? e.action : '';
    if (wins.length) { const w = wins[0]; try { await w.focus(); } catch (x) { } if (id) w.postMessage(act ? { tallyAct: act, id } : { tallyOpen: id }); return; }
    await self.clients.openWindow('./' + (id ? '?' + (act ? 'act=' + act + '&' : '') + 'open=' + encodeURIComponent(id) : ''));
  })()]));
});

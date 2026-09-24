// 離線用：登入頁、圖示用快取；報表（report.enc）先抓網路，抓不到就用上次存下來的
const C = 'limitup-v1';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (u.origin !== location.origin || e.request.method !== 'GET') return;   // GitHub API（查詢）不經過這裡
  const key = u.pathname.endsWith('/') ? u.pathname + 'index.html' : u.pathname;   // 忽略 ?t= 之類的參數
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.ok) { const cp = r.clone(); caches.open(C).then(c => c.put(key, cp)); }
      return r;
    }).catch(() => caches.open(C).then(c => c.match(key)).then(r => r || caches.match(e.request, {ignoreSearch: true})))
  );
});

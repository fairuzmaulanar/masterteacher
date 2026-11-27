// Service Worker Master Teacher Planner
// - Kerangka aplikasi (HTML/CSS/JS/ikon) disimpan di cache → aplikasi terbuka instan & bisa offline.
// - Permintaan ke Google Apps Script TIDAK PERNAH di-cache (data selalu lewat IndexedDB + sinkron).
const VERSI = 'mtp-v2.0.2';
const SHELL = [
  './', './index.html', './manifest.webmanifest', './favicon.svg', './css/app.css', './js/config.js', './js/app.js',
  './js/core/util.js', './js/core/icons.js', './js/core/store.js', './js/core/state.js', './js/core/api.js', './js/core/sync.js',
  './js/core/router.js', './js/core/ui.js', './js/core/kurikulum.js', './js/core/generator.js', './js/core/ai.js', './js/core/dokumen.js',
  './js/core/qr.js', './js/core/demo.js', './js/core/hitung.js', './js/core/form.js',
  './js/pages/masuk.js', './js/pages/mulai.js', './js/pages/hariini.js', './js/pages/rencana.js', './js/pages/rpp.js', './js/pages/materi.js',
  './js/pages/soal.js', './js/pages/asesmen.js', './js/pages/kelas.js', './js/pages/nilai.js', './js/pages/tugas.js', './js/pages/jadwal.js',
  './js/pages/ai.js', './js/pages/aialat.js', './js/pages/komunikasi.js', './js/pages/pengaturan.js', './js/pages/sekolah.js',
  './js/pages/telaah.js', './js/pages/verifikasi.js', './js/pages/lainnya.js',
  './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSI).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSI && k.startsWith('mtp-')).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Backend GAS & layanan Google lain: selalu langsung ke jaringan
  if (/(^|\.)script\.google(usercontent)?\.com$/.test(url.hostname) || /accounts\.google\.com$/.test(url.hostname) || (url.hostname.endsWith('googleapis.com') && !url.hostname.startsWith('fonts.'))) return;
  // Font Google: cache saat dipakai (stale-while-revalidate)
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open(VERSI + '-font').then(async (c) => {
      const hit = await c.match(req);
      const net = fetch(req).then((r) => { if (r.ok || r.type === 'opaque') c.put(req, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    }));
    return;
  }
  if (url.origin !== self.location.origin) return;
  // config.js: jaringan dulu (agar perubahan GAS_URL langsung terpakai), cadangan cache
  if (url.pathname.endsWith('/js/config.js')) {
    e.respondWith(fetch(req).then((r) => { const salin = r.clone(); caches.open(VERSI).then((c) => c.put(req, salin)); return r; }).catch(() => caches.match(req)));
    return;
  }
  // Navigasi halaman → index.html dari cache (SPA hash)
  if (req.mode === 'navigate') {
    e.respondWith(caches.match('./index.html').then((hit) => hit || fetch(req)).catch(() => caches.match('./index.html')));
    return;
  }
  // Aset statis: cache dulu, perbarui di latar belakang
  e.respondWith(caches.match(req).then((hit) => {
    const net = fetch(req).then((r) => { if (r.ok) { const salin = r.clone(); caches.open(VERSI).then((c) => c.put(req, salin)); } return r; }).catch(() => hit);
    return hit || net;
  }));
});

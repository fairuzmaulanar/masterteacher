# Master Teacher Planner v2.0

Ruang kerja guru Indonesia: RPP Pembelajaran Mendalam (Permendikdasmen No. 1/2026), presensi satu ketukan, bank soal & asesmen, buku nilai per TP dengan deskripsi rapor otomatis, jadwal & jurnal, komunikasi wali via WhatsApp, Co-Pilot AI, dan portal supervisi kepala sekolah dengan tanda tangan elektronik ber-QR.

**Panduan pemasangan langkah demi langkah:** lihat [`PANDUAN-INSTALASI.md`](PANDUAN-INSTALASI.md).

## Arsitektur

```
Browser (PWA, GitHub Pages)                 Google Apps Script (Web App /exec)        Google Sheets
┌───────────────────────────────┐  fetch   ┌───────────────────────────────┐        ┌──────────────┐
│ index.html · css · js (ESM)   │ ───────▶ │ doGet/doPost → router JSON    │ ─────▶ │ 14 tabel guru│
│ IndexedDB + antrean outbox    │  text/   │ Sesi HMAC · LockService       │        │ + Users,     │
│ Sinkron delta 1 panggilan     │  plain   │ CacheX berversi · antrean WA  │        │ Sekolah, DE_*│
│ Service worker (offline)      │ ◀─────── │ Script Properties (rahasia)   │        │ AntrianNotif │
└───────────────────────────────┘          └───────────────────────────────┘        └──────────────┘
```

- **Offline-first:** setiap ketukan langsung tersimpan di IndexedDB lalu dikirim di latar belakang. Satu panggilan `sync` mengirim antrean dan menarik perubahan sejak kursor terakhir; bila tidak ada perubahan, server tidak membaca Sheets sama sekali.
- **Navigasi instan:** SPA berbasis hash dengan tampilan tersimpan di memori — pindah menu ±30–50 ms, tanpa menunggu server.
- **Keamanan:** `js/config.js` hanya berisi `GAS_URL`. Semua rahasia (kunci sesi, API key AI, token Fonnte, PIN tanda tangan, sandi darurat) hanya di Script Properties server. Token sesi dikirim di badan POST, tidak pernah di URL.
- **Privasi (UU PDP 27/2022):** data siswa hanya milik guru (dan kepala sekolahnya untuk rekap), nama siswa disamarkan sebelum dikirim ke AI, halaman verifikasi QR tidak memuat data siswa.

## Struktur berkas

```
index.html            kerangka aplikasi
manifest.webmanifest  identitas PWA
sw.js                 service worker (ubah VERSI saat rilis)
css/app.css           sistem desain (DESIGN.md)
js/config.js          SATU-SATUNYA konfigurasi: GAS_URL
js/app.js             titik masuk: sesi, router, PWA
js/core/              store (IndexedDB), sync, api, router, ui, dokumen (cetak/Word/Excel/QR), generator templat, kurikulum
js/pages/             satu modul per halaman (dimuat saat dibutuhkan)
icons/                ikon aplikasi
```

## Mode Demo

Tanpa `GAS_URL` (atau tombol **Coba Mode Demo**), aplikasi berjalan sepenuhnya di perangkat sebagai akun guru dengan data contoh lengkap (2 kelas, 55 siswa, RPP, bank soal, nilai, presensi, jurnal, kalender, komunikasi wali, dan dokumen ber-QR). Telaah RPP oleh kepala sekolah disimulasikan otomatis beberapa detik setelah RPP diajukan.

## Rilis pembaruan

1. Ubah `VERSI` di baris atas `sw.js` (mis. `mtp-v2.0.1`).
2. `git add .` → `git commit -m "…"` → `git push` dari folder yang berisi `index.html`.

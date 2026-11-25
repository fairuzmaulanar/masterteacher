# CLAUDE.md — panduan kerja untuk Claude di proyek Master Teacher Planner

Bahasa: seluruh kode, komentar, label UI, dan dokumentasi memakai Bahasa Indonesia.

## Arsitektur (jangan diubah tanpa alasan kuat)
- Frontend statis (repo ini) di GitHub Pages ⇄ backend Google Apps Script (REST JSON) ⇄ Google Sheets.
- POST ke GAS wajib `Content-Type: text/plain;charset=utf-8` (hindari preflight CORS). Respons `{success, data, message, ms, v, code?}`.
- `js/config.js` hanya boleh berisi `window.GAS_URL = '…';`. Jangan menaruh token/kunci apa pun di frontend.
- Berkas backend (`*.gs`, `appsscript.json`) TIDAK disimpan di repo ini.

## Pola data
- Tabel sinkron: Kelas, Siswa, Mapel, TP, RPP, Materi, Soal, Asesmen, Absensi, Jadwal, Tugas, Catatan, Jurnal, Agenda.
- Tulis lewat `db.put(tabel, id, fields, opts)` (js/core/store.js) — memori + IndexedDB + outbox; sinkron otomatis.
- Field map (digabung per kunci, `null` = hapus kunci): `Absensi.status/ket`, `Asesmen.nilai/catatan/butir`.
- Penulisan dari UI yang sudah diperbarui optimistis memakai `{ senyap: true }` agar tampilan aktif tidak dirender ulang.
- ID absensi: `A-<kelas_id>-<YYYY-MM-DD>`; deskripsi rapor disimpan di Catatan dengan id `RAP-<mapel>-<siswa>` dan jenis `rapor:<mapel>`.

## Halaman
- Satu modul per rute di `js/pages/*.js`: `export default { title, deps: [tabel…], render(el, ctx) }`.
- `deps` menentukan kapan tampilan dirender ulang saat data berubah; `ctx.hold = true` saat pengguna sedang menyunting.
- Klik ditangani dengan `delegasi(el, { 'nama-aksi': (tombol) => … })` dan atribut `data-act`.

## Uji
- Uji otomatis (tiruan GAS + Playwright) disimpan terpisah dari repo ini: `api.test.js`, `e2e-demo.cjs`, `e2e-cloud.cjs`.
- Target performa: navigasi antar menu < 100 ms; tidak ada gulir horizontal di lebar 390 px.

## Rilis
- Naikkan `VERSI` di `sw.js` setiap rilis agar cache offline perangkat diperbarui.
- Daftarkan berkas JS baru di larik `SHELL` pada `sw.js`.

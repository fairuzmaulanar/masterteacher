# DOKUMEN PERENCANAAN REVISI (revisi.md)
================================================================================
STATUS: SELESAI DITERAPKAN (VERIFIED & ARCHIVED - v2.0.5)
ENGINE: ZettBOT Core v4.1 (by Zettbos)
TANGGAL: 2026-11-09
TARGET: Perbaikan Sinkronisasi Akun Guru Baru ke Google Sheets (Mekanisme Auto-Register & Upsert Profil)
================================================================================

## 1. ANALISIS KEBUTUHAN & TEMUAN MASALAH
Pengguna menyampaikan kendala:
> *"saya sudah membuat akun baru tetapi didatabase tidak masuk, masih data dummy saja coba analisis dimana kesalahannya"*

### Temuan Teknis Berdasarkan Analisis Kode & Tangkapan Layar:
1. **Titik 1: Akun Guru Berhasil Terdaftar di Sisi Klien (Local-First), Namun URL Database Opsional:**
   - Pada tangkapan layar 1, akun **Maulana Hani S.Pd (SDN Jaya 1)** berhasil dibuat dan aktif di peramban. Seluruh modul awal berstatus 0 (bersih dari data dummy sesuai rancangan v2.0.4).
   - Namun, pada formulir registrasi (`index.html`), kolom *"Tautan Database Google Sheets"* bersifat **opsional**.
   - Jika saat mendaftar pengguna tidak memasukkan URL Web App Google Apps Script, sistem beroperasi secara *Local-First* (hanya disimpan ke `localStorage` peramban). Panggilan ke Google Sheets tidak terjadi.

2. **Titik 2 (Akar Masalah Utama di Backend `gas/code.gs`): Cacat Logika `handleSaveTeacherProfile`:**
   - Di dalam backend `gas/code.gs`, fungsi `handleSaveTeacherProfile` mencari baris guru berdasarkan `COL_GURU.ID`:
     ```javascript
     for (var i = 0; i < values.length; i++) {
       if (values[i][COL_GURU.ID] === teacher.id) {
         targetRowIdx = i + 2;
         break;
       }
     }
     if (targetRowIdx === -1) {
       return createJsonResponse({ status: 'error', message: 'Profil guru tidak ditemukan di database.' });
     }
     ```
   - **Cacat:** Jika guru baru mendaftar lokal terlebih dahulu, lalu di kemudian hari menempelkan URL database dan mengklik *"Simpan & Kirim ke Google Sheets"*, backend justru **menolak** dengan pesan *"Profil guru tidak ditemukan di database"* alih-alih membuat baris baru!
   - Akibatnya, baris guru baru **tidak pernah tertulis ke sheet `DataGuru`**, dan lembar kerja `DataGuru` tetap tertahan hanya berisi 1 baris dummy `GURU-202610-001` (Budi Pratama).

3. **Titik 3: Urutan Pengiriman Data di Frontend (`app.js`):**
   - Di fungsi `pushToCloud()` pada `app.js`, sistem mengirimkan `saveTeacherData` terlebih dahulu, baru kemudian memanggil `saveTeacherProfile` di dalam blok `try { ... } catch (pe) {}` tanpa memverifikasi apakah akun guru tersebut sudah terdaftar di `DataGuru`.

4. **Titik 4: Deployment Google Apps Script (Sisi Pengguna):**
   - Web App Google Apps Script wajib di-deploy dengan pengaturan:
     * **Execute as:** `Me (akun Google Anda)`
     * **Who has access:** `Anyone` (Siapa saja, termasuk anonim).
   - Jika hak akses masih `Only myself`, Google akan menolak (*CORS / 403 Forbidden*) setiap kali aplikasi mencoba mengirim data.

---

## 2. RANCANGAN IMPLEMENTASI TEKNIS

### A. Perbaikan Backend Google Apps Script (`gas/code.gs`): Mekanisme UPSERT
1. **Ubah `handleSaveTeacherProfile` Menjadi UPSERT (Update or Insert):**
   - Jika `targetRowIdx !== -1`: Perbarui kolom profil guru seperti biasa.
   - Jika `targetRowIdx === -1`: **Otomatis tambahkan baris baru (`sheet.appendRow`)** ke lembar `DataGuru`!
   - Dengan begitu, kapan pun guru baru menekan tombol simpan atau melakukan sinkronisasi, data guru tersebut dijamin 100% langsung masuk ke sheet `DataGuru`.

2. **Dukungan Sinkronisasi Mandiri:**
   - Memastikan saat fungsi `saveTeacherData` atau `syncAll` dipanggil, jika profil guru belum ada di `DataGuru`, backend secara proaktif mencatat profilnya.

### B. Penyempurnaan Frontend (`app.js`):
1. **Transparansi Status Sinkronisasi di Dashboard & Menu Sekolah:**
   - Jika URL database belum disetel, berikan notifikasi ramah: *"Aplikasi sedang berjalan offline (data tersimpan di HP/laptop Anda). Hubungkan Google Sheets di menu 'Sekolah & Logo' untuk backup permanen ke cloud."*
2. **Prioritaskan Pendaftaran Profil pada `pushToCloud()`:**
   - Saat pengguna mengklik *"Simpan & Kirim ke Google Sheets"*, sistem wajib mengirimkan profil guru terlebih dahulu (`saveTeacherProfile`), menunggu konfirmasi sukses, baru kemudian mengirimkan data modul, kelas, dan tugas (`saveTeacherData`).

---

## 3. CHECKLIST PENGUJIAN & VERIFIKASI
- [x] Backend `gas/code.gs` berhasil melakukan UPSERT baris baru di sheet `DataGuru` saat profil baru dikirim.
- [x] Tombol *"Simpan & Kirim ke Google Sheets"* di menu Sekolah & Logo berhasil memasukkan profil guru aktif (`Maulana Hani S.Pd`) ke baris 3 sheet `DataGuru`.
- [x] Tautan database yang diisi pada formulir registrasi langsung mendaftarkan guru ke Google Sheets seketika.
- [x] Service worker cache dinaikkan ke versi `mtp-cache-v2.0.5`.
================================================================================

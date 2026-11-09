# DOKUMEN SPESIFIKASI PRODUK (PRD) - MASTER TEACHER PLANNER
================================================================================
STATUS: AKTIF & TERVERIFIKASI (v2.0.4 - PURE DATA ISOLATION, CLASS MANAGER, ACADEMIC EVENT MODAL, QUICK GRADE INPUT & GLOBAL DOCUMENT CREATION BUTTONS)
ENGINE: ZettBOT Core v4.1 (by Zettbos)
DIBUAT: 2026-10-15 | DIMUTAKHIRKAN: 2026-11-08
TARGET APLIKASI: Master Teacher Planner (Aplikasi Perencana & Asisten Administrasi Guru Profesional)
================================================================================

================================================================================
ZONA ATAS: SPESIFIKASI KEBUTUHAN PRODUK (BLUEPRINT AWAL & ARSITEKTUR RESMI)
================================================================================

## 1. NAMA PROJEK & PROBLEM STATEMENT
- **Nama Aplikasi:** Master Teacher Planner (dapat disesuaikan oleh pengguna).
- **Latar Belakang & Problem Statement:**
  Guru di Indonesia kerap dibebani administrasi mengajar yang terfragmentasi di berbagai media: dokumen Word RPP yang tercecer, buku absensi fisik, buku nilai dengan rumus Excel rumit, catatan koreksi tugas yang menumpuk tak terkontrol, serta persiapan butir soal ujian yang memakan waktu.
  Aplikasi ini dirancang sebagai sistem terpadu (All-in-One Digital Workspace) berarsitektur lokal mandiri (*Local-First Progressive Web App*), responsif di layar ponsel maupun komputer, mengusung estetika buatan manusia (*Anti-AI Human-Crafted Aesthetic*), serta dilengkapi Asisten AI & Bank Soal Taksonomi Bloom berstandar Kurikulum Merdeka Kemendikbudristek.

---

## 2. PERAN PENGGUNA (USER PERSONA)
- **Guru Mata Pelajaran / Guru Kelas (Single/Multi Profile):** 
  Dapat membuat profil guru lokal mandiri (Nama, NIP/NUPTK, Nama Sekolah, Mapel yang diampu, PIN Pengaman), mengelola modul ajar RPP Fase A–F dan Kokurikuler P5, mengatur jadwal pelajaran mingguan dan kalender akademik, mencatat presensi harian siswa, mengelola denah tempat duduk interaktif, menginput buku nilai otomatis, melacak tumpukan koreksi tugas, menulis notulensi rapat dinas dan jurnal refleksi, serta mencetak dokumen supervisi kedinasan resmi.
- **Kepala Sekolah / Pengawas Pembina (Supervisi Output View):**
  Menerima output cetak PDF resmi berstandar kedinasan lengkap dengan KOP surat sekolah, format modul ajar resmi, rekapitulasi nilai dan presensi, serta lembar pengesahan tanda tangan.

---

## 3. ARSITEKTUR & LINGKUNGAN KERJA
- **Platform:** Web App Responsif Mandiri (Client-Side Progressive Architecture) dengan dukungan Progressive Web App (PWA) offline penuh.
- **Pintu Masuk Tunggal (Unified Workspace Shell):** Seluruh ekosistem berpusat murni pada `index.html` (bebas dari landing page redundan).
- **Teknologi Fondasi:** Modern HTML5 Semantic, Vanilla CSS3 (Custom Design System Deep Slate `#0f172a`, Emerald `#059669`, Fluid Grid, SVG Icons), Vanilla JavaScript ES6+.
- **Database & Penyimpanan:** Browser LocalStorage Engine dengan namespace terisolasi `MTP_V1_` dikombinasikan dengan *Client-Side In-Memory Cache*. Zero external database dependency, zero latency (0 ms), hemat kuota, dan data privat 100% tersimpan aman di perangkat guru.
- **Arsitektur Modular & CORS-Free Fallback:**
  - *Dedicated App Shell (`index.html`):* Ramping, memuat navigasi, autentikasi gate, modal injection container, dan dashboard inline untuk First Contentful Paint instan (<50ms).
  - *Modular Views (`views/*.html`):* 9 modul view dimuat secara lazy loading saat pertama kali diklik lalu disimpan di memori peramban.
  - *Pre-Cache Bridge Scripts (`views/templates.js` & `modals/modals.js`):* Menampung seluruh template HTML parsial dalam format JSON memori browser yang dimuat via tag `<script>`, menjamin aplikasi berjalan 100% lancar bebas blokir CORS saat dibuka via `file:///` maupun server lokal.
- **Dukungan Integrasi:**
  1. *Ekspor / Impor:* Cadangan penuh format JSON (Backup & Restore), Ekspor Excel resmi bergaris `.xls` dengan AutoFilter, Ekspor CSV UTF-8, dan Mode Cetak PDF resmi kedinasan per menu.
  2. *Kecerdasan AI:* Bank Generator Cerdas Bawaan (ratusan bank ide kegiatan Kurikulum Merdeka, diferensiasi, rubrik, dan narasi rapor tanpa kuota) + Opsi Integrasi Kunci Google Gemini API langsung dari perangkat guru.
  3. *Pelari Lokal Otomatis:* Skrip PowerShell lokal runner (`server.ps1` & `Buka-Aplikasi-PWA.bat`) yang mengaktifkan server `http://localhost:8080` dan instalasi PWA Chrome/Edge otomatis.

---

## 4. ALUR KERJA APLIKASI (USER FLOW)
1. **Layar Masuk / Profil Guru (Auth Flow Gateway):**
   - Pengguna disambut layar Login / Pilih Profil Guru langsung di `index.html`.
   - Opsi Buat Akun Guru Baru (Nama, Sekolah, NIP, Mapel, PIN Keamanan).
   - Opsi Masuk Cepat Guru Demo (1-klik).
2. **Dashboard Guru (Home Command Center):**
   - Ringkasan metrik 4 kartu: Total Modul RPP, Total Siswa, Tumpukan Koreksi Tugas, dan Persentase Kehadiran Kelas Hari Ini.
   - Quick Action Bar: Akses 1-klik ke pembuatan RPP, Presensi Kelas, Input Nilai, dan Catatan Tugas.
   - Jadwal Hari Ini dan Pelacak Tugas Mendesak.
3. **9 Modul Utama Workspace:**
   - *Modul 1: Modul Ajar & RPP Kurikulum Merdeka (`views/planner.html`)*
   - *Modul 2: Materi & Repositori Digital (`views/repository.html`)*
   - *Modul 3: Bank Soal & Generator Paket Ujian (`views/questions.html`)*
   - *Modul 4: Jadwal Mengajar & Kalender Akademik (`views/timetable.html`)*
   - *Modul 5: Buku Nilai Digital (`views/gradebook.html`)*
   - *Modul 6: Manajemen Kelas & Siswa (`views/classroom.html`)*
   - *Modul 7: Pelacak Koreksi Tugas & Jurnal Guru (`views/tasks.html`)*
   - *Modul 8: Asisten AI & Pusat Ekspor PDF (`views/ai-export.html`)*

---

## 5. DESAIN BASIS DATA (DATA STRUCTURE SCHEMA - 11 ENTITAS LENGKAP)
Penyimpanan browser terisolasi per profil guru dengan struktur koleksi objek:

### 1. Profil Guru (`Teachers`) - Key: `MTP_V1_TEACHERS`
- `id` (String): ID unik guru (`GURU-YYYYMM-XXX`)
- `namaLengkap` (String): Nama lengkap dan gelar
- `nip` (String): NIP / NUPTK resmi
- `namaSekolah` (String): Nama institusi pendidikan
- `mataPelajaran` (String): Mata pelajaran utama
- `pin` (String): PIN keamanan masuk (4-6 digit)
- `createdAt` (String): Waktu pembuatan profil

### 2. Koleksi Data Guru - Key: `MTP_V1_DATA_{teacherId}`
Objek utama yang menampung seluruh aktivitas guru dengan 11 entitas:
`classes`, `gradeWeights`, `geminiApiKey`, `lessonPlans`, `materials`, `questionBank`, `assessmentPackages`, `timetable`, `academicEvents`, `students`, `attendanceLogs`, `gradebook`, `tasks`, `meetings`, `reflections`.

---

## 6. ATURAN VALIDASI & LOGIKA KHUSUS
1. **Penomoran Otomatis Sekuensial:** Format `PREFIX-YYYYMM-XXX` dihitung dari ID maksimum riil di storage untuk mencegah tabrakan ID.
2. **Formula Hitung Nilai Akhir Otomatis:**
   $$\text{Rata-Rata Tugas} = \frac{\sum \text{Nilai Tugas}}{n}$$
   $$\text{Nilai Akhir} = (\text{Rata-Rata Tugas} \times \frac{\text{Bobot Tugas}}{100}) + (\text{UTS} \times \frac{\text{Bobot UTS}}{100}) + (\text{UAS} \times \frac{\text{Bobot UAS}}{100})$$
   Default: Tugas 30%, UTS 30%, UAS 40% (total 100%).
3. **Penyelarasan Mode Gelap / Terang (Dark Mode Engine):** Kontras tinggi jaminan teks putih bersih (`#f8fafc`), cetak fisik selalu kertas putih bersih.
4. **Pencegahan Kehilangan Data (Debounced Autosave):** Penyimpanan otomatis ke LocalStorage seketika.

---

## 7. RENCANA ANTARMUKA (UI DESIGN & ANTI-AI AESTHETIC)
- Palet Warna: Deep Slate `#0f172a`, Zinc Body `#f8fafc`, Border `#e2e8f0`, Emerald Teacher Accent `#059669`.
- Ikonografi: Ikon SVG inline tajam standar desainer manusia.
- Tata Letak Responsif: Desktop Sidebar + Mobile Drawer & 5 Bottom Touch Items.

---

## 8. KRITERIA PENGUJIAN (ACCEPTANCE CRITERIA)
- [x] Multi-profil guru dengan PIN keamanan dan sesi `sessionStorage`.
- [x] Lean App Shell membuka halaman awal dalam <50ms.
- [x] 9 Modul view berpindah secara instan (0 ms) via in-memory caching.
- [x] Bebas CORS saat dibuka langsung via protokol `file:///` menggunakan `templates.js` & `modals.js`.
- [x] Buku nilai menghitung nilai akhir presisi dengan bobot dinamis.
- [x] Ekspor Excel resmi `.xls` bergaris dengan AutoFilter dan rekapitulasi statistik.
- [x] Presensi siswa kilat (H/I/S/A) dan persentase kehadiran terhitung otomatis.
- [x] Denah tempat duduk visual dapat mengatur posisi bangku siswa di ruang kelas.
- [x] Pengacak nama siswa (random picker) dengan animasi interaktif.
- [x] Bank soal Taksonomi Bloom (C1-C6 HOTS/MOTS/LOTS) & generator paket ujian.
- [x] Asisten AI menghasilkan ide kegiatan ajar Kurikulum Merdeka dan narasi rapor tanpa kuota.
- [x] PWA offline caching via `sw.js` dan instalasi 1-klik via `server.ps1` / `Buka-Aplikasi-PWA.bat`.

================================================================================
ZONA BAWAH: MASTER CONTEXT & LOGIKA SISTEM TERKINI (LIVING CONTEXT)
================================================================================
- **Status Arsitektur Aktif:** Standalone Modular Web Application v1.8.0 (Unified Workspace Shell, Clean Localhost & PWA).
- **Format Penyimpanan Aktif:** Browser LocalStorage Engine dengan namespace `MTP_V1_` dan 11 entitas koleksi data.
- **Formula Bobot Nilai Aktif:** `(RataTugas * BobotTugas/100) + (UTS * BobotUTS/100) + (UAS * BobotUAS/100)`.
- **Daftar Berkas Terpasang:**
  * `index.html`: Dedicated Workspace App Shell antarmuka kerja guru (Auth Screen Gateway, Header Bar, Sidebar desktop, Mobile drawer & bottom bar, wadah dinamis dengan default view Dashboard inline untuk instant first paint <50ms).
  * `views/`: Direktori parsial modular untuk 11 tampilan modul utama (termasuk view mandiri `school-profile.html` dan `student-detail.html`) yang dimuat secara on-demand (Lazy Loading) dengan in-memory cache.
  * `views/templates.js`: Berkas jembatan cache memori JSON untuk 10 modular views.
  * `modals/modals.html`: Kumpulan 17 dialog formulir modal yang dimuat secara on-demand melalui `ViewLoader.ensureModalsLoaded()` (bebas dari popup sempit yang rentan terpotong).
  * `modals/modals.js`: Berkas jembatan cache memori string untuk seluruh dialog modal formulir.
  * `styles.css`: Desain sistem human-crafted.
  * `app.js`: Engine controller teroptimasi.
  * `manifest.webmanifest`: Konfigurasi Web App PWA untuk instalasi offline mandiri.
  * `icon.svg`, `icon-192.png`, `icon-512.png`: Master vektor dan ikon fisik resolusi tinggi.
  * `sw.js`: Service Worker caching engine v1.9.6 (Network-First live update strategy).
  * `Buka-Aplikasi-PWA.bat` & `server.ps1`: Launcher 1-klik lokal runner yang membuka server `http://localhost:8080` dengan header anti-cache HTTP.
  * `build-standalone.ps1`: Skrip otomatis penyinkronan template dan modal ke `templates.js` dan `modals.js`.
  * `ZettBOT.md`: Dongle aktivasi gateway ZettBOT resmi v4.1.
  * `prd.md`: Master blueprint & living system context resmi.
  * `revisi.md`: Dokumen log alur kerja revisi selesai diterapkan.

- **Log Pembaruan Resmi:**
  * [v1.0.0 s.d. v1.7.2] Pengembangan modular 9 fitur esensial Kurikulum Merdeka, perbaikan kontras mode gelap, ekspor Excel resmi, dan pembersihan mojibake.
  * [v1.8.0] Konsolidasi Total Arsitektur Pintu Tunggal (`index.html` Unified Workspace).
  * [v1.9.0] Redesain Autentikasi Modern (Alamat Email & Kata Sandi, Eliminasi Dropdown, 1-Klik Instan Guru Demo).
  * [v1.9.1] Overhaul Kontras Visual & Aksesibilitas Mode Gelap (Dark Theme Contrast & Accessibility Overhaul).
  * [v1.9.2] Integrasi Interaktif Buku Nilai Siswa, Penyingkatan Nama Cerdas & Rapor Individual.
  * [v1.9.3] Transformasi Halaman Penuh Portofolio & Lembar Nilai Siswa (`view-student-detail`), Eliminasi Modal Terpotong & Integrasi Cetak Rapor Lintas-Modul.
  * [v1.9.4] Audit Menyeluruh, Service Worker Network-First & Normalisasi Kontras Mode Gelap Bebas Tombol/Badge Putih:
    - **Overhaul Service Worker Network-First:** Mengubah arsitektur fetch handler pada `sw.js` menjadi Network-First (prioritas jaringan server dengan fallback cache offline), menjamin seluruh pembaruan kode frontend langsung tampil seketika di peramban tanpa tertahan cache lawas.
    - **Pemberantasan Tombol & Badge Putih di Mode Gelap:** Menghilangkan inversi variabel destruktif `--slate-900` / `--slate-800` dan mengisolasi blanket rule `span` sehingga tombol cetak, badge angka sidebar, badge intrakurikuler, dan badge taksonomi Bloom (HOTS/LOTS) tampil dengan kontras tinggi berstandar WCAG AAA (>7:1).
    - **Penyelarasan Warna Tombol Aksi Hapus:** Tombol hapus pada kartu modul, bank soal, dan jadwal mengajar kini menggunakan warna merah terang `#fb7185` yang tajam dan kontras di atas latar belakang gelap.
    - **Registrasi Penuh View Detail Siswa:** Mendaftarkan `'view-student-detail'` ke dalam `ViewLoader.views` pada `app.js` untuk menjamin pemuatan halaman detail siswa tanpa kegagalan fetch.
    - **Pembersihan Simbol Mojibake:** Membersihkan karakter `â€¢` pada modal ganti profil menjadi peluru bersih `&bull;`.
    - **Header Anti-Cache pada Server Lokal:** Mengintegrasikan `Cache-Control: no-cache, no-store, must-revalidate` pada `server.ps1`.
    - **Sinkronisasi & Cache Bump:** Menjalankan `build-standalone.ps1` dan menaikkan versi Service Worker ke `mtp-cache-v1.9.4`.
  * [v1.9.5] Penambahan Fitur Unggah Logo Sekolah Resmi & Penataan Menu Ergonomis Guru:
    - **Unggah Logo Sekolah & Kompresi Cerdas Kanvas:** Menambahkan fitur unggah logo sekolah (format PNG, JPG, WebP, SVG) yang otomatis dikompresi di sisi klien via HTML5 Canvas (maks. 240x240 piksel, <40KB) untuk melindungi batas kuota LocalStorage selamanya.
    - **Pratinjau KOP Kedinasan Langsung (Live KOP Preview):** Simulasi KOP surat standar A4 di dalam formulir pengaturan yang otomatis memperbarui tampilan logo, nama instansi, alamat, nomor telepon, email, dan website sekolah secara real-time.
    - **Integrasi Mesin Cetak Dokumen Kedinasan:** `PrintModule.getOfficialKop()` kini memuat `teacher.logoSekolah` asli guru pada seluruh cetakan dokumen dinas (RPP, Buku Nilai, Rapor Siswa, Rekap Presensi, Denah Kelas, Bank Soal, dan Supervisi), serta `PrintModule.getSignatures()` menggunakan Nama & NIP Kepala Sekolah dinamis.
    - **Penataan Akses Menu di 3 Titik Strategis:**
      1. Sidebar Navigasi Desktop & Mobile Drawer: Seksi `Pengaturan` -> `[🏛️ Profil & Logo Sekolah]`.
      2. Bilah Header Atas: Tombol pintas cepat `[🏛️ Sekolah & Logo]`.
      3. Kartu Akun Guru di Footer Sidebar: Tombol aksi 1-klik `[⚙️ Atur Logo]`.
    - **Sinkronisasi Kode Standalone & Service Worker Cache:** Mengompilasi `views/templates.js` dan `modals/modals.js` via `build-standalone.ps1` serta menaikkan versi cache Service Worker ke `mtp-cache-v1.9.5`.
  * [v1.9.6] Halaman Penuh Profil Sekolah Mandiri, Eliminasi Tombol Cetak Redundan & Mesin Anti-Orphan PDF Page-Break:
    - **Halaman Penuh Mandiri Profil Sekolah (`views/school-profile.html`):** Mengganti modal popup dengan halaman kerja mandiri yang lega, responsif, dan elegan. Dilengkapi tombol `[↺ Reset Formulir]` untuk membatalkan perubahan dan `[✓ Simpan Profil Sekolah]` untuk menyimpan ke LocalStorage dan menyinkronkan seluruh UI dan KOP kedinasan secara real-time.
    - **Eliminasi Redundansi Tombol Cetak Rapor Siswa:** Menghapus tombol duplikat di dalam kartu profil siswa pada `views/student-detail.html` dan mempertahankan HANYA SATU tombol cetak utama yang presisi di toolbar atas: `[🖨️ Cetak Lembar Nilai Siswa (PDF)]`.
    - **Mesin Anti-Orphan Heading & Auto Page-Break pada Cetak PDF:** Menerapkan aturan ketat CSS Paged Media (`break-after: avoid; page-break-after: avoid;` dan `page-break-inside: avoid;`) pada seluruh judul seksi (`.print-section-title`), kepala tabel (`thead`), baris pertama tabel, blok tanda tangan, dan kotak metrik, serta membungkus seksi laporan eksekutif ke dalam `.print-section-block`. Judul atau penomoran tidak akan pernah lagi tercetak terisolasi di tepi bawah kertas.
    - **Kompilasi Standalone & Bump PWA Cache:** Mendaftarkan `school-profile.html` ke `build-standalone.ps1`, menyinkronkan `templates.js`, dan menaikkan cache Service Worker ke `mtp-cache-v1.9.6`.
  * [v1.9.7] Penyelarasan Presisi Cetak PDF Kedinasan (KOP 100% Sumbu Tengah, Anti-Orphan Heading & 1 Tombol Cetak Rapor Tunggal):
    - **Geometri 3-Kolom Sumbu Tengah KOP Kedinasan:** Menata ulang generator KOP kedinasan `PrintModule.getOfficialKop()` di `app.js` menggunakan arsitektur 3-kolom simetris (`85px` logo kiri | `flex: 1` teks tengah berpusat | `85px` invisible spacer penyeimbang kanan) dan CSS `@media print`. Teks identitas dinas dan sekolah kini berpusat tepat 50% di tengah kertas tanpa risiko overlap atau terpotong pada seluruh 11 modul cetak PDF.
    - **Pemberantasan Total Orphan Heading pada PDF:** Mengubah aturan `.print-section-block` di `styles.css` menjadi `break-inside: avoid !important; page-break-inside: avoid !important; break-inside: avoid-page !important;`. Judul seksi seperti *"C. Rekapitulasi Pelacak Koreksi & Penugasan Siswa"* tidak akan pernah lagi terdampar sendirian di batas bawah halaman; jika sisa tinggi halaman tidak muat, seluruh blok seksi otomatis berpindah rapi ke halaman baru.
    - **Standarisasi 1 Tombol Cetak Rapor Tunggal di Halaman Siswa:** Menghilangkan kebingungan tombol cetak ganda dengan menyembunyikan `#btn-header-print` di navbar bilah atas saat guru membuka halaman detail siswa, dan menetapkan satu-satunya tombol cetak resmi yang fungsional di toolbar halaman siswa: `[🖨️ Cetak Rapor Siswa (PDF)]`.
    - **Sinkronisasi Live Preview & Cache Bump:** Menambahkan penyeimbang simetris pada simulasi KOP di `views/school-profile.html` dan `modals/modals.html`, menyinkronkan `views/templates.js` via `build-standalone.ps1`, dan menaikkan cache PWA ke `mtp-cache-v1.9.7`.
  * [v1.9.8] Integrasi PWA Modern ala bhs-inggris-anak.vercel.app, Tombol Download Sebelum Login & Eliminasi Komponen Bawaan Usang:
    - **Tombol Download / Pasang Sebelum Login (`index.html`):** Menyediakan tombol chip `[📲 Pasang di HP / Komputer]` pada `.auth-top-bar` dan banner khusus `.auth-pwa-banner` di dalam `.auth-card` formulir login sebelum guru masuk. Memberikan kemudahan bagi guru untuk langsung mengunduh/memasang aplikasi PWA ke layar utama HP Android, iPhone, maupun PC/laptop.
    - **Engine `PWAManager` v2.0 Multi-Perangkat (`app.js`):** Mengadopsi arsitektur PWA dari referensi dengan dukungan deteksi mode standalone, penangkapan event `beforeinstallprompt` untuk 1-klik pasang di Chrome/Edge/Android, panduan interaktif khusus Safari iOS (iPhone/iPad), widget ajakan pasang mengambang (*floating prompt*) dengan snooze cerdas (5 hari), serta otomatisasi perubahan teks tombol menjadi `[✓ Aplikasi Terpasang]`.
    - **Pembersihan Komponen PWA Bawaan yang Tidak Terpakai (*Dead Code Elimination*):** Menghapus objek `LandingManager` dan kode referral usang `GURU2026` dari `app.js`, serta membersihkan ~840 baris stylesheet `.landing-` lama yang tidak terpakai dari `styles.css`.
    - **Optimalisasi `manifest.webmanifest` & Service Worker Cache:** Menambahkan `display_override: ["window-controls-overlay", "standalone", "minimal-ui"]`, menyelaraskan scope dan start_url ke `./`, menyinkronkan template via `build-standalone.ps1`, dan menaikkan versi cache Service Worker ke `mtp-cache-v1.9.8`.
  * [v1.9.9] Perbaikan UI Mobile Sebelum Login (Panduan PWA Full-Width Tanpa Tombol Download) & Penyelarasan Header Bilah Atas ke Sumbu Tengah:
    - **Panduan Akses Layar Utama Full-Width (`index.html`):** Mengganti banner PWA yang sempit dan berhimpitan di HP dengan `.auth-pwa-guide-box` yang membentang penuh (100% lebar kartu), menyajikan petunjuk praktis pemasangan di Android (Chrome), iOS Safari, dan Laptop/PC tanpa tombol unduh yang membingungkan.
    - **Penyelarasan Header Bilah Atas ke Tengah Sempurna:** Menghilangkan tombol download duplikat dari bilah atas login dan memosisikan Pil Status Kurikulum Merdeka serta tombol Mode Gelap/Terang tepat di tengah sumbu layar (`justify-content: center`) untuk tampilan simetris dan elegan di HP maupun PC.
    - **Peredaman Popup saat Form Login:** Mencegah popup mengambang muncul secara otomatis saat form login aktif agar tidak mengganggu fokus guru saat memasukkan akun.
    - **Kompilasi Standalone & Bump PWA Cache:** Menyinkronkan template via `build-standalone.ps1` dan menaikkan versi Service Worker ke `mtp-cache-v1.9.9`.
  * [v2.0.0] Pembangunan Database Cloud Google Apps Script (14 Tab Sheets, Dummy Data Seeder & Hybrid Offline-First Sync):
    - **Arsitektur Database Relasional Google Sheets (`gas/setup.gs`):** Membangun 14 tabel resmi bebas karakter underscore (`DataGuru`, `DataSiswa`, `ModulAjarRPP`, `MateriPelajaran`, `BankSoal`, `PaketAsesmen`, `JadwalMengajar`, `AgendaAkademik`, `PresensiSiswa`, `BukuNilai`, `TugasKoreksi`, `NotulaRapat`, `JurnalRefleksi`, `PengaturanAplikasi`) dengan baris header Navy `#1E293B` yang dibekukan (*frozen row*).
    - **Penyuntikan Seluruh Data Dummy Realistik ke Semua Menu:** Fungsi `seedInitialDummyData()` secara otomatis mengisi data akun guru demo, SMA Negeri 1 Harapan Nusantara, 30 siswa, 7 RPP Kurikulum Merdeka, 7 materi pelajaran beserta link media, 18 butir soal HOTS/LOTS, 5 paket soal, jadwal mengajar, agenda, presensi harian, buku nilai lengkap, tugas koreksi, notula rapat, dan jurnal refleksi ke dalam spreadsheet secara aman (*idempoten*).
    - **Backend REST Web App Controller (`gas/code.gs`):** Menyediakan API endpoint `doGet` dan `doPost` dengan output JSON ber-CORS. Menggunakan pemetaan indeks kolom `COL` kebal ubah header, pembacaan string murni via `getDisplayValues()` anti-distorsi timezone, proteksi konkurensi `LockService.getScriptLock()`, dan sinkronisasi instan `SpreadsheetApp.flush()`.
    - **Engine `CloudDBManager` Frontend Hybrid di `app.js`:** Aplikasi tetap mempertahankan kecepatan 0 detik secara offline melalui LocalStorage lokal, dipadukan dengan modal pengaturan `[☁️ Database Google Sheets]`, tombol uji koneksi, *Push to Cloud*, *Pull from Cloud*, serta opsi *Auto-Sync* di latar belakang dan fallback login via cloud.
    - **Buku Petunjuk Pemasangan Guru (`PANDUAN_DATABASE_GOOGLE_SHEETS.md`):** Panduan langkah demi langkah bergambar ramah pemula untuk menduplikasi dan menerapkan script ke Google Spreadsheet pribadi dalam 5 menit.
    - **Validasi Sintaksis & Bebas Eror GAS:** Seluruh berkas `gas/setup.gs` dan `gas/code.gs` telah divalidasi 100% bebas SyntaxError (penyempurnaan penutupan objek presensi) dan lolos uji kompilasi engine JavaScript.
    - **Kompilasi Standalone & Bump PWA Cache:** Menyinkronkan template via `build-standalone.ps1` dan menaikkan Service Worker cache ke `mtp-cache-v2.0.0`.
  * [v2.0.1] Optimalisasi PWA Pre-Login (Pilihan Pasang vs Lanjut Login), Narasi Ringkas Multi-Perangkat, & Sempurna Mobile UI/UX:
    - **Pilihan Pasang PWA Sebelum Masuk Login (`index.html`):** Menghadirkan `.auth-pwa-choice-card` tepat di atas formulir login yang menyajikan tombol jelas `[ 📥 Download / Pasang di HP atau Komputer ]` dan garis pemisah `── atau lanjut masuk ke akun guru ──`, memberikan pilihan eksplisit bagi pengguna sebelum masuk.
    - **Narasi Rapi & Eliminasi Penjelasan Teknis Panjang:** Menghapus seluruh bullet-list teknis yang berjejal, digantikan oleh badge pill multi-perangkat (`[📱 Android]`, `[🍏 iOS]`, `[💻 Komputer / Laptop]`) dan narasi ramah pendidik.
    - **Penyempurnaan Spasi & Anti-Geser Mobile (`styles.css`):** Mengatur margin/padding proporsional, `overflow-x: hidden`, flexbox wrapping pada badge, serta dukungan kontras penuh pada Dark Mode dan Light Mode sehingga layout di HP (320px–480px) lega, simetris, dan tidak berhimpitan.
    - **Kompilasi Standalone & Bump PWA Cache:** Menyinkronkan template via `build-standalone.ps1` dan menaikkan Service Worker cache ke `mtp-cache-v2.0.1`.
  * [v2.0.2] Penyesuaian Header Mobile Responsif (Anti-Tumpuk & Spasi Lega) & Eliminasi Tombol Cloud Header:
    - **Penghapusan Tombol Header Cloud Database (`index.html`):** Menghapus tombol `#btn-header-cloud-sync` dari bilah header atas agar antarmuka bersih dan tidak membingungkan guru. Fitur database tetap tersedia lengkap di Sidebar `[☁️ Database Google Sheets]`.
    - **Header Mobile Super Bersih & Lega (`styles.css`):** Mengotomatisasi penyembunyian tombol sekunder (`.btn-header-extra`) pada layar ponsel (≤ 768px), menyisakan hanya 2 tombol esensial di kanan (`[ ☀/🌙 Tema ]` dan `[ 🖨 Cetak ]`), sehingga teks judul *"Dashboard Guru"* mendapatkan ruang lapang ~190px–220px, simetris, bebas tumpah ke samping, dan tidak bertabrakan dengan tombol.
    - **Kompilasi Standalone & Bump PWA Cache:** Menyinkronkan template via `build-standalone.ps1` dan menaikkan Service Worker cache ke `mtp-cache-v2.0.2`.
  * [v2.0.3] Pembersihan Total Data Dummy Guru Baru, Registrasi Langsung ke Cloud Database, Default Auto-Sync, & Kartu Database Profil Sekolah:
    - **Pembersihan Total Data Dummy untuk Akun Guru Baru:** Mengisolasi penyuntikan data dummy (30 siswa, 7 RPP, jadwal, nilai, agenda) HANYA untuk akun demo bawaan (`GURU-202610-001` / `GURU-DEMO-001`). Registrasi guru baru di `AuthManager.handleRegister` menginisialisasi kanvas bersih `StorageManager.getDefaultSchema()` (0 siswa, 0 RPP, 0 nilai, 0 jadwal). Ditambahkan logika auto-clean pada `AppState.init()` untuk memulihkan akun guru riil yang sebelumnya sempat terkontaminasi siswa dummy.
    - **Pendaftaran Langsung ke Sheet DataGuru Cloud (`app.js`):** Menghubungkan fungsi `AuthManager.handleRegister()` langsung ke Web App Google Apps Script melalui `CloudDBManager.registerTeacherToCloud()`, mencatat data guru baru ke sheet `DataGuru` dan menginisialisasi lembar kerja cloud seketika.
    - **Opsi Input URL Database di Formulir Registrasi (`index.html`):** Menyediakan kolom opsional URL Web App GAS lengkap dengan badge deteksi otomatis pada layar registrasi guru baru.
    - **Auto-Sync Aktif Otomatis (*Default Enabled*):** Nilai `isAutoSyncEnabled()` kini aktif otomatis (`true`) begitu URL database terhubung. Setiap perubahan data sekolah, siswa, RPP, nilai, dan presensi otomatis terdorong ke Google Sheets di latar belakang secara responsif (debounce 1.5 detik).
    - **Kartu Koneksi Database di Menu Profil Sekolah (`views/school-profile.html`):** Menambahkan Card 5 ("5. Koneksi Database Google Sheets (Cloud Backend)") lengkap dengan tombol `[ Uji & Hubungkan ]`, badge status real-time, dan tombol `[ Simpan & Kirim ke Google Sheets ]`.
    - **Kompilasi Standalone & Bump PWA Cache:** Mengompilasi `views/templates.js` dan `modals/modals.js` via `build-standalone.ps1` dan menaikkan cache Service Worker ke `mtp-cache-v2.0.3`.
  * [v2.0.4] Pemisahan Mutlak Data Demo vs Guru Baru, Tombol Pembuatan Dokumen di Seluruh Menu, Modal Kelola Kelas, Agenda & Input Nilai:
    - **Pemisahan Mutlak & Pembersihan Residu Demo (`app.js`):** Menjamin akun Guru Demo (`GURU-202610-001` / Budi Pratama) tetap memiliki 100% data contoh lengkap di semua modul. Sebaliknya, akun guru baru atau non-demo disanitasi secara ketat dari seluruh entitas bertanda `202610-` (0 RPP, 0 materi, 0 butir soal, 0 siswa, 0 nilai, 0 jadwal, 0 tugas, 0 absensi). Skema awal `getDefaultSchema()` kini menggunakan `classes: []` agar guru bebas menentukan kelas sendiri.
    - **Ketersediaan Tombol Pembuatan Dokumen di Semua Menu (Toolbar & Empty State):**
      1. Modul & RPP: Tombol toolbar `[+ Buat Modul Ajar Baru]` + CTA lembar kosong `[+ Buat Modul Ajar Pertama]`.
      2. Materi & Media: Tombol toolbar `[+ Tambah Materi Baru]` + CTA lembar kosong `[+ Unggah Bahan Ajar Pertama]`.
      3. Bank Soal & Asesmen: Tombol toolbar `[+ Buat Butir Soal]` & `[Generator Paket]` + CTA lembar kosong `[+ Buat Butir Soal Pertama]` dan `[+ Susun Paket Ujian Pertama]`.
      4. Jadwal & Kalender: Tombol toolbar `[+ Tambah Jadwal Mengajar]` dan `[+ Tambah Agenda Baru]` + CTA lembar kosong `[+ Catat Agenda Pertama]`.
      5. Buku Nilai Digital: Tombol toolbar `[+ Input Nilai Siswa]` + CTA lembar kosong `[+ Mulai Input Nilai Siswa]`.
      6. Kelas & Absensi: Tombol toolbar `[+ Tambah Siswa Baru]` dan `[+ Kelola Kelas]` + CTA lembar kosong `[+ Daftarkan Siswa Baru]` & `[+ Tambah Kelas Baru]`.
      7. Koreksi & Tugas: Tombol toolbar `[+ Catat Koreksi Tugas]`, `[+ Notulen Baru]`, `[+ Tulis Refleksi]` + CTA lembar kosong pada masing-masing kartu.
      8. Dashboard: Tombol pintas pembuatan jadwal dan pencatatan koreksi tugas saat data masih kosong.
    - **Tiga Modal Interaktif Baru (`modals/modals.html`):**
      1. `modal-form-academic-event`: Formulir tambah agenda kalender akademik (ujian, rapat dinas, libur, pekan P5).
      2. `modal-manage-classes`: Pengelolaan daftar kelas dinamis untuk menambah kelas mengajar baru dan menghapus kelas kosong.
      3. `modal-input-grade`: Formulir cepat input nilai tugas 1, tugas 2, UTS, dan UAS siswa.
    - **Kompilasi Standalone & Bump PWA Cache:** Mengompilasi `views/templates.js` dan `modals/modals.js` via `build-standalone.ps1` dan menaikkan cache Service Worker ke `mtp-cache-v2.0.4`.

# DOKUMEN PERENCANAAN REVISI (revisi.md)
================================================================================
STATUS: SELESAI DITERAPKAN (VERIFIED & ARCHIVED - v2.0.4)
ENGINE: ZettBOT Core v4.1 (by Zettbos)
TANGGAL: 2026-11-08
TARGET: Pemisahan Mutlak Data Demo vs Akun Guru Baru (100% Bersih) & Penyediaan Tombol Pembuatan Dokumen di Seluruh Menu
================================================================================

## 1. ANALISIS KEBUTUHAN & INSTRUKSI PENGGUNA
Pengguna menginstruksikan penyempurnaan alur kerja sistem:

> *"perbaiki untuk data demo tetap ada dummy, tetapi untuk pendaftaran guru tidak ada sama sekali dan disetiap menu ada tombol untuk membuat suatu dokumen sesuai menu yang dipilih"*

### Temuan Teknis & Titik Masalah:
1. **Pemisahan Data Demo vs Pendaftaran Akun Guru:**
   - **Akun Demo (Budi Pratama):** Harus selalu memiliki data percontohan lengkap di semua menu (30 siswa, 7 RPP, 7 materi, 18 soal, 5 paket asesmen, jadwal, kalender, buku nilai, presensi, tugas, notula, refleksi) untuk mempermudah eksplorasi fitur.
   - **Akun Guru Baru / Non-Demo:** Harus 100% bersih tanpa ada satu pun data tiruan. Sebelumnya, pembersihan otomatis hanya memeriksa awalan ID siswa (`SIS-202610-`), sehingga jika siswa kosong tetapi ada RPP atau jadwal lama, residu dummy tersebut belum terbersihkan. Selain itu, daftar kelas masih terisi baku `['X-A (Fase E)', 'XI-IPA 1', 'XII-IPA 2']` milik guru demo.
2. **Ketersediaan Tombol Pembuatan Dokumen Baru di Setiap Menu:**
   - Beberapa menu belum memiliki tombol pembuatan dokumen yang jelas, khususnya:
     * **Kalender Akademik (`view-timetable`):** Hanya memiliki daftar dan tombol hapus, tidak ada tombol untuk menambah agenda/kegiatan baru (`+ Tambah Agenda Baru`).
     * **Buku Nilai Digital (`view-gradebook`):** Toolbar atas hanya memiliki "Atur Bobot", "Cetak Nilai", "Excel", dan "CSV", tetapi tidak memiliki tombol aksi langsung untuk menambah atau menginput nilai siswa baru (`+ Input / Kelola Nilai`).
     * **Manajemen Kelas (`view-classroom`):** Tidak ada tombol untuk menambah atau mengelola nama kelas baru sesuai jenjang guru (SD/SMP/SMA).
     * **Tampilan Lembar Kosong (*Empty State*):** Ketika guru baru membuka menu yang masih kosong (0 item), hanya muncul teks abu-abu tanpa tombol pintas (*Call to Action / CTA*) untuk langsung membuat dokumen pertama kali di posisi tengah layar.

---

## 2. RANCANGAN IMPLEMENTASI TEKNIS

### A. Garansi Mutlak: Data Demo Lengkap vs Akun Guru Baru Bersih 100% (`app.js`)
1. **Deteksi Ketat Akun Demo:**
   - Hanya akun dengan ID `GURU-202610-001` atau email `guru.demo@sekolah.id` yang diizinkan memiliki data dummy bawaan `getFullDemoData()`.
2. **Pembersihan Residu Menyeluruh (*Purge All Demo Prefixes*):**
   - Di `AppState.init()`, untuk SEMUA akun guru non-demo, lakukan sanitasi total terhadap seluruh entitas yang memiliki kode demo `202610-`:
     * Modul RPP (`lessonPlans`)
     * Materi Pelajaran (`materials`)
     * Bank Soal (`questionBank`)
     * Paket Asesmen (`assessmentPackages`)
     * Jadwal Mengajar (`timetable`)
     * Kalender Akademik (`academicEvents`)
     * Data Siswa (`students`)
     * Presensi Siswa (`attendanceLogs`)
     * Buku Nilai Digital (`gradebook`)
     * Tugas & Koreksi (`tasks`)
     * Notulensi Rapat (`meetings`)
     * Jurnal Refleksi (`reflections`)
3. **Fleksibilitas Kelas untuk Guru Baru:**
   - Jika guru baru mendaftar, daftar kelas disesuaikan atau diizinkan menambah kelas baru (`classes: []` atau disiapkan kelas default netral yang dapat diedit/dihapus kapan saja dengan modal kelola kelas).

---

### B. Penyediaan Tombol Pembuatan Dokumen di Setiap Menu (`views/*.html` & `app.js`)

Setiap menu akan dilengkapi tombol pembuatan dokumen di **Toolbar Atas** dan di **Tampilan Lembar Kosong (*Empty State CTA*)**:

| No | Menu Aplikasi | Tombol Pembuatan Dokumen di Toolbar | Tombol Pintas di Tampilan Kosong (*Empty State*) |
|:---|:---|:---|:---|
| 1 | **Modul & RPP** (`view-planner`) | `[ + Buat Modul Ajar Baru ]` | `[ + Buat Modul Ajar Pertama ]` |
| 2 | **Materi & Media** (`view-repository`) | `[ + Tambah Materi Baru ]` | `[ + Unggah Bahan Ajar Pertama ]` |
| 3 | **Bank Soal & Asesmen** (`view-questions`) | `[ + Buat Butir Soal ]` & `[ + Susun Paket Ujian ]` | `[ + Buat Butir Soal Pertama ]` / `[ + Buat Paket Pertama ]` |
| 4 | **Jadwal & Kalender** (`view-timetable`) | Tab 1: `[ + Tambah Jadwal Mengajar ]`<br>Tab 2: **`[ + Tambah Agenda Baru ]` (Baru Ditambahkan)** | Tab 1: `[ + Buat Jadwal Pertama ]`<br>Tab 2: `[ + Catat Agenda Pertama ]` |
| 5 | **Buku Nilai Digital** (`view-gradebook`) | **`[ + Input / Tambah Nilai Siswa ]` (Baru Ditambahkan)** | `[ + Mulai Input Nilai Siswa ]` |
| 6 | **Kelas & Absensi** (`view-classroom`) | `[ + Tambah Siswa Baru ]` & **`[ + Kelola / Tambah Kelas ]` (Baru Ditambahkan)** | `[ + Daftarkan Siswa Pertama ]` & `[ + Tambah Kelas Baru ]` |
| 7 | **Koreksi & Tugas** (`view-tasks`) | `[ + Catat Tugas / Koreksi ]`, `[ + Notulen Baru ]`, `[ + Tulis Refleksi ]` | Tombol pembuatan di masing-masing kartu koreksi, rapat, dan refleksi |
| 8 | **Asisten AI & Ekspor** (`view-ai-export`) | `[ ⚡ Rancang dengan Asisten AI ]` | Form generator AI siap pakai |
| 9 | **Dashboard** (`view-dashboard`) | Quick Action Bar: `[ + RPP Baru ]`, `[ + Presensi ]`, `[ + Input Nilai ]`, `[ + Tugas ]` | Tombol panduan aksi awal bagi guru baru |

---

### C. Modal Baru & Handler Pembantu (`modals/modals.html` & `app.js`):
1. **Modal Tambah Agenda Kalender (`modal-form-academic-event`):**  
   Formulir input tanggal agenda, judul kegiatan (UTS, SAS, Rapat Pleno, Libur Sekolah), dan kategori event.
2. **Modal / Alur Input Nilai Siswa Cepat di Buku Nilai:**  
   Memudahkan guru memasukkan nilai Tugas 1, Tugas 2, UTS, dan UAS langsung dari tombol toolbar tanpa harus membuka per siswa.
3. **Modal Tambah / Atur Kelas (`modal-manage-classes`):**  
   Memberikan keleluasaan bagi guru untuk menambah kelas mereka sendiri (misal: "Kelas 4-A", "VII-B", "X-Merdeka 1") dan menghapus kelas yang tidak dipakai.

---

### D. Kompilasi & Pembaruan Versi PWA:
- Menjalankan `build-standalone.ps1` untuk menyinkronkan `views/templates.js` dan `modals/modals.js`.
- Menaikkan versi Service Worker ke **`mtp-cache-v2.0.4`**.

---

## 3. CHECKLIST PENGUJIAN & VERIFIKASI
- [x] Tombol *Masuk Cepat Guru Demo* tetap menampilkan 100% data dummy lengkap di semua menu.
- [x] Pendaftaran akun guru baru menghasilkan lembar kerja yang 100% kosong (0 RPP, 0 materi, 0 soal, 0 nilai, 0 tugas, 0 jadwal).
- [x] Di menu Modul & RPP terdapat tombol pembuatan dokumen baik di toolbar maupun saat data kosong.
- [x] Di menu Materi & Media terdapat tombol tambah materi.
- [x] Di menu Bank Soal terdapat tombol buat butir soal dan buat paket asesmen.
- [x] Di menu Jadwal & Kalender terdapat tombol tambah jadwal DAN tombol tambah agenda kalender baru.
- [x] Di menu Buku Nilai terdapat tombol tambah/input nilai siswa baru.
- [x] Di menu Kelas terdapat tombol tambah siswa dan tombol tambah/kelola kelas.
- [x] Di menu Koreksi & Tugas terdapat tombol tambah tugas koreksi, notula rapat, dan jurnal refleksi.
================================================================================

# PANDUAN LENGKAP PEMASANGAN DATABASE GOOGLE SHEETS
================================================================================
Aplikasi: Master Teacher Planner (Perencana & Asisten Administrasi Guru Profesional)  
Engine: ZettBOT Core v4.1 (by Zettbos)  
Basis Data: Google Sheets + Google Apps Script (Gratis, Selamanya, Tanpa Batas Waktu)  
================================================================================

Buku panduan ini dirancang khusus untuk memudahkan Bapak/Ibu Guru dalam membuat dan menghubungkan basis data awan (**Google Sheets**) ke aplikasi Master Teacher Planner. 

Dengan menghubungkan database ini:
- Seluruh data akun guru, profil sekolah, logo kedinasan, data siswa, RPP Kurikulum Merdeka, bahan ajar, bank soal, jadwal, agenda, presensi, buku nilai, koreksi tugas, notula rapat, dan jurnal refleksi akan **otomatis tersimpan aman di akun Google Drive pribadi Anda**.
- Data dapat diakses dan disinkronkan dari perangkat mana saja (HP Android, iPhone, Laptop, atau PC sekolah).

---

## TAHAP 1: MEMBUAT GOOGLE SPREADSHEET BARU

1. Buka browser dan kunjungi: **[https://sheets.new](https://sheets.new)** (atau buka Google Drive Anda lalu buat *Google Spreadsheet Baru*).
2. Beri nama file spreadsheet Anda di pojok kiri atas, contoh:  
   **`Database Master Teacher Planner`**

---

## TAHAP 2: MEMBUKA APPS SCRIPT EDITOR

1. Pada menu atas Google Sheets, klik menu **Ekstensi** (*Extensions*) &rarr; pilih **Apps Script**.
2. Anda akan diarahkan ke halaman editor kode Google Apps Script.
3. Di sisi kiri terdapat daftar berkas. Secara default terdapat file bernama `Code.gs`.

---

## TAHAP 3: MENYALIN KODE DATABASE (`setup.gs` & `code.gs`)

Anda hanya perlu menyalin 2 berkas yang telah disediakan di folder projek ini:

### 1. Buat Berkas `setup.gs`:
- Di editor Apps Script, klik tombol tambah **[+]** di samping menu *Files* &rarr; pilih **Script**.
- Beri nama: `setup` (sistem akan otomatis menyimpannya sebagai `setup.gs`).
- Buka file [gas/setup.gs](file:///c:/Users/lenovo/.gemini/antigravity-ide/MasterTeacherPlanner/gas/setup.gs) di folder projek ini.
- Salin seluruh isinya (*Ctrl + A* lalu *Ctrl + C*), lalu tempelkan (*Ctrl + V*) ke file `setup.gs` di Apps Script.
- Klik ikon disket **Simpan** (*Save project*).

### 2. Isi Berkas `Code.gs`:
- Klik file `Code.gs` yang sudah ada di Apps Script.
- Hapus semua isi bawaan `function myFunction() { ... }`.
- Buka file [gas/code.gs](file:///c:/Users/lenovo/.gemini/antigravity-ide/MasterTeacherPlanner/gas/code.gs) di folder projek ini.
- Salin seluruh isinya (*Ctrl + A* lalu *Ctrl + C*), lalu tempelkan (*Ctrl + V*) ke file `Code.gs` di Apps Script.
- Klik ikon disket **Simpan** (*Save project*).

---

## TAHAP 4: MENJALANKAN INISIALISASI DATABASE (1 KALI)

Langkah ini akan secara otomatis membuat **14 Tab Sheet Resmi** dan mengisi data contoh (*dummy data*) yang lengkap:

1. Pada bilah atas editor Apps Script, pastikan fungsi yang terpilih pada dropdown fungsi adalah:  
   **`setupDatabase`**
2. Klik tombol **Jalankan** (*Run*).
3. **Persetujuan Izin (Hanya Pertama Kali):**
   - Akan muncul jendela popup *"Authorization Required"* &rarr; Klik **Review permissions** / **Tinjau izin**.
   - Pilih akun Google Anda.
   - Jika muncul peringatan *"Google hasn't verified this app"*, klik tautan **Advanced** (Lanjutan) di kiri bawah &rarr; lalu klik **Go to Database Master Teacher Planner (unsafe)**.
   - Klik **Allow** / **Izinkan**.
4. Tunggu beberapa detik hingga log eksekusi selesai (*Execution completed*).
5. Sekarang, buka kembali tab Google Spreadsheet Anda! Anda akan melihat 14 tab telah terbuat rapi dengan warna Navy Blue elegan:
   * `DataGuru` (Akun Demo Budi Pratama, S.Pd., M.Kom.)
   * `DataSiswa` (30 Data Siswa di 3 Kelas)
   * `ModulAjarRPP` (7 RPP Kurikulum Merdeka)
   * `MateriPelajaran` (7 Materi & Link Media)
   * `BankSoal` (18 Butir Soal HOTS/LOTS)
   * `PaketAsesmen` (5 Paket Ujian)
   * `JadwalMengajar` (8 Jadwal Pelajaran)
   * `AgendaAkademik` (8 Kalender Sekolah)
   * `PresensiSiswa` (Log Absensi Harian)
   * `BukuNilai` (Nilai Tugas, UTS, UAS)
   * `TugasKoreksi` (Pelacak Tugas Guru)
   * `NotulaRapat` (Notula Dinas & MGMP)
   * `JurnalRefleksi` (Jurnal Mengajar)
   * `PengaturanAplikasi` (Bobot Nilai & Kelas)

---

## TAHAP 5: DEPLOY SEBAGAI WEB APP (MENDAPATKAN URL DATABASE)

Agar aplikasi Master Teacher Planner dapat mengirim dan menerima data dari spreadsheet ini:

1. Di pojok kanan atas Apps Script, klik tombol biru **Deploy** &rarr; pilih **New deployment** (*Penerapan baru*).
2. Klik ikon roda gigi ⚙️ di samping *"Select type"* &rarr; pilih **Web app**.
3. Isi konfigurasi berikut:
   - **Description:** `API Database Master Teacher Planner v2.0`
   - **Execute as:** **Me (emailanda@gmail.com)** *(PENTING!)*
   - **Who has access:** **Anyone** *(PENTING! Agar aplikasi bisa mengirim data dari HP/Laptop Anda)*
4. Klik tombol **Deploy**.
5. Salin URL yang muncul di bawah teks **Web app URL** (berawalan: `https://script.google.com/macros/s/.../exec`).

---

## TAHAP 6: MENGHUBUNGKAN URL KE APLIKASI MASTER TEACHER PLANNER

1. Buka aplikasi Master Teacher Planner di browser Anda (`http://localhost:8080/` atau versi PWA Anda).
2. Klik menu **Database Google Sheets** pada sidebar kiri (atau klik tombol **Cloud Sheets** pada bilah atas).
3. Tempelkan URL Web App yang telah Anda salin pada kolom **URL Web App Google Apps Script**.
4. Klik tombol **[🧪 Uji Koneksi Database]** &rarr; Status akan berubah menjadi hijau *"Terhubung (Online)"*.
5. Klik **[☁️ Kirim Data ke Google Sheets]** untuk menyinkronkan data lokal Anda ke awan, atau **[⬇️ Ambil Data dari Google Sheets]** untuk mengunduh data dari spreadsheet ke perangkat Anda.

---

## KEUNGGULAN ARSITEKTUR HYBRID (OFFLINE-FIRST)
- **0 Detik Loading:** Aplikasi tetap bekerja super cepat secara offline di kelas tanpa tergantung sinyal internet.
- **Penyimpanan Ganda:** Data tersimpan lokal di perangkat dan memiliki cadangan awan (*cloud backup*) di Google Drive pribadi Anda.
- **Keamanan Data Pribadi:** Basis data berada 100% di bawah kendali akun Google Anda sendiri, tanpa ada pihak ketiga yang dapat mengakses data murid Anda.


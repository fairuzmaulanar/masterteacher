# Panduan Instalasi Master Teacher Planner v2.0

Panduan ini untuk Bapak/Ibu yang **belum pernah** memakai Google Apps Script maupun GitHub. Ikuti urutannya; tiap tahap ada tanda keberhasilan supaya tahu kapan boleh lanjut.

Aplikasi terdiri dari dua bagian:

| Bagian | Isi | Tempat |
|---|---|---|
| **Backend** (server & database) | 13 berkas `.gs` + `appsscript.json` | Google Apps Script di akun Google Anda (data tersimpan di Google Sheets milik Anda) |
| **Frontend** (tampilan aplikasi) | Isi ZIP `master-teacher-planner.zip` | GitHub Pages (gratis) |

> Tanpa backend pun aplikasi bisa dicoba: buka frontend lalu pilih **Coba Mode Demo**.

---

## Tahap 1 — Pasang backend di Google Apps Script (±15 menit)

1. Masuk ke akun Google yang akan menjadi **pemilik data** (sebaiknya akun sekolah/admin, bukan akun pribadi siswa).
2. Buka **https://script.google.com** → klik **Proyek baru**. Ganti nama proyek (kiri atas) menjadi `Master Teacher Planner`.
3. **Tampilkan berkas manifes:** klik ikon roda gigi **Setelan proyek** (kiri) → centang **Tampilkan file manifes "appsscript.json" di editor**.
4. Kembali ke **Editor** (ikon `< >`). Buat berkas-berkas berikut dengan tombol **＋ → Skrip**. Ketik namanya **persis** tanpa `.gs` (editor menambahkannya sendiri):

   `Kode`, `Rahasia`, `DB`, `Auth`, `Sync`, `Sekolah`, `DocEngine`, `QR`, `AI`, `Notifikasi`, `Migrasi`, `Setup`, `DataContoh`

   Berkas `Kode.gs` sudah ada sejak awal — cukup ganti isinya.
5. Buka setiap berkas, **hapus seluruh isinya**, lalu salin-tempel isi berkas dengan nama yang sama yang Anda terima. Lakukan juga untuk `appsscript.json`.
6. Klik **Simpan** (ikon disket) atau tekan `Ctrl + S`.
7. Di bilah atas, pilih fungsi **`setupAppEnvironment`** pada daftar fungsi, lalu klik **Jalankan**.
   - Google meminta izin → **Tinjau izin** → pilih akun Anda → **Lanjutan** → **Buka Master Teacher Planner (tidak aman)** → **Izinkan**. Peringatan "tidak aman" muncul karena aplikasi ini buatan Anda sendiri dan belum diverifikasi Google — itu normal.
   - ✅ **Tanda berhasil:** di **Log eksekusi** muncul `✅ Setup selesai` beserta alamat spreadsheet database.
8. **Catat akun darurat.** Di log yang sama tercantum `Username : darurat` dan sebuah `Password` acak. Simpan di tempat aman — hanya tampil **sekali**. Dipakai bila login email bermasalah (menu *Akses darurat admin* di halaman masuk). Lupa? Jalankan fungsi `resetAksesDarurat` untuk membuat yang baru.
9. **Terbitkan sebagai Web App:** klik **Terapkan → Deployment baru** → ikon roda gigi → **Aplikasi web**.
   - Deskripsi: `v2.0`
   - Jalankan sebagai: **Saya**
   - Siapa yang memiliki akses: **Siapa saja**
   - Klik **Terapkan**, lalu **salin URL Aplikasi web** yang berakhiran **`/exec`**.
   - ✅ **Uji:** tempel URL itu di tab baru dan tambahkan `?action=ping` di ujungnya. Jika muncul teks berawalan `{"success":true`, backend siap.

> 🔐 Semua rahasia (kunci sesi, sandi darurat, API key AI, token WhatsApp, PIN tanda tangan) tersimpan di **Script Properties**, bukan di spreadsheet atau kode. Jangan bagikan akses *Editor* proyek Apps Script kepada orang lain.

---

## Tahap 2 — Siapkan berkas frontend (±3 menit)

1. Ekstrak `master-teacher-planner.zip`. Hasilnya folder **`master-teacher-planner`** yang **langsung** berisi `index.html`, folder `css`, `js`, `icons`, dan berkas lain.
2. Buka `js/config.js` dengan Notepad (Windows) atau TextEdit (Mac). Isinya satu baris:
   ```js
   window.GAS_URL = '';
   ```
   Tempel URL `/exec` dari Tahap 1 di antara tanda kutip:
   ```js
   window.GAS_URL = 'https://script.google.com/macros/s/AKfy.../exec';
   ```
   Simpan. **Hanya itu** yang boleh ada di berkas ini — jangan menaruh token atau sandi apa pun.

---

## Tahap 3 — Unggah frontend ke GitHub Pages lewat terminal (±20 menit, sekali saja)

> ⚠️ **Jangan** memakai tombol *Add file → Upload files* di situs GitHub. Cara itu meratakan semua berkas ke satu folder sehingga tampilan rusak (CSS/JS tidak ditemukan). Gunakan langkah terminal di bawah.

### 3.1 Pasang Git (sekali seumur komputer)
- **Windows:** unduh dari https://git-scm.com/download/win, pasang dengan pilihan bawaan. Buka **PowerShell** dari menu Start.
- **Mac:** buka **Terminal**, ketik `git --version` — macOS menawarkan pemasangan otomatis bila belum ada.

Periksa: `git --version` → muncul nomor versi.

### 3.2 Kenalkan diri ke Git (sekali saja)
```bash
git config --global user.name "Nama Anda"
git config --global user.email "email-akun-github@contoh.com"
```

### 3.3 Buat akun & repository GitHub
1. Daftar di https://github.com (nama pengguna akan menjadi bagian alamat aplikasi: `namapengguna.github.io`).
2. Klik **＋ → New repository** → nama: `master-teacher` → pilih **Public** → **jangan** centang README/.gitignore/license → **Create repository**. Biarkan halaman berikutnya terbuka.

### 3.4 Masuk ke folder yang BENAR — langkah paling penting
Folder kerja Anda adalah **folder hasil ekstrak `master-teacher-planner`** — folder yang di dalamnya **langsung** ada `index.html`. Bukan folder di atasnya, bukan folder di dalamnya.

Cara cepat (Windows): buka folder `master-teacher-planner` di File Explorer → klik bilah alamat → ketik `powershell` → Enter.

Lalu periksa isinya:
```powershell
dir
```
(Mac: `ls`)

✅ Harus terlihat: `index.html`, `manifest.webmanifest`, `sw.js`, folder `css`, `js`, `icons`.
❌ Jika yang terlihat justru satu folder bernama `master-teacher-planner`, Anda satu tingkat terlalu atas: ketik `cd master-teacher-planner` lalu `dir` lagi. **Jangan lanjut sebelum `index.html` terlihat.**

### 3.5 Kirim ke GitHub — ketik satu per satu
```bash
git init
git add .
git commit -m "Master Teacher Planner v2.0"
git branch -M main
git remote add origin https://github.com/NAMAPENGGUNA/master-teacher.git
git push -u origin main
```
- Perhatikan **titik** di akhir `git add .`
- Ganti `NAMAPENGGUNA` dengan nama pengguna GitHub Anda.
- Saat `git push` meminta **Password**, yang dimasukkan adalah **Personal Access Token**, bukan sandi akun. Saat menempel token, **layar tetap kosong — itu normal**, langsung tekan Enter.

**Membuat token** (bila diminta): buka https://github.com/settings/tokens → **Generate new token (classic)** → Note: `git-push` → Expiration: 90 hari → centang **repo** → **Generate** → salin token `ghp_…` (hanya tampil sekali) → jalankan lagi `git push -u origin main` dan tempel token sebagai password.

✅ **Tanda berhasil:** muncul `Writing objects: 100%` dan `* [new branch] main -> main`.

Kesulitan dengan token? Alternatif visual: **GitHub Desktop** (https://desktop.github.com) → *Add Local Repository* → pilih folder `master-teacher-planner` → *Publish repository* (hilangkan centang *Keep this code private*).

### 3.6 Aktifkan GitHub Pages
Di halaman repository: **Settings → Pages** →
- Source: **Deploy from a branch**
- Branch: **main** / **(root)** → **Save**
- Centang **Enforce HTTPS** (wajib — aplikasi offline/PWA membutuhkan HTTPS).

Tunggu 1–2 menit lalu muat ulang halaman Settings → Pages. Muncul: **Your site is live at `https://NAMAPENGGUNA.github.io/master-teacher/`**.

✅ Buka alamat itu → halaman **Masuk** tampil.

---

## Tahap 4 — Penggunaan pertama & pengaturan admin

1. Buka aplikasi → masukkan email → cek email untuk **6 digit kode** (lihat juga folder Spam/Promosi) → masuk.
   **Pengguna pertama otomatis menjadi Admin.** Sebaiknya kepala sekolah/operator yang login pertama.
2. Ikuti panduan 3 langkah (profil → sekolah → kelas pertama). Kepala sekolah memilih **Buat profil sekolah** dan mencentang **Saya kepala sekolah** → mendapat **kode undangan** untuk dibagikan ke guru.
3. Buka **Pengaturan → Admin**:
   - **Alamat frontend (APP_URL):** isi `https://NAMAPENGGUNA.github.io/master-teacher/` (dipakai pada tautan di email/WA).
   - **Kredensial (tersimpan di Script Properties):**
     - **AI (opsional):** pilih penyedia (Gemini / OpenAI / Anthropic) dan tempel API key. Tanpa ini, semua alat Co-Pilot tetap jalan memakai templat bawaan.
     - **Token Fonnte (opsional):** untuk notifikasi WhatsApp ke wali. Lalu ubah **Notifikasi WA aktif** menjadi **YA**.
     - **Google Client ID (opsional):** untuk tombol *Masuk dengan Google* (lihat Tahap 6).
   - Kolom kredensial yang dikosongkan **tidak mengubah** nilai lama; ketik `__HAPUS__` untuk menghapus.
4. Kepala sekolah: **Pengaturan → Keamanan → PIN tanda tangan** (6 digit) — dipakai saat menyetujui RPP.
5. Guru lain: login dengan email masing-masing → pada langkah *Sekolah* masukkan **kode undangan**.
6. **Pasang di HP:** buka alamat aplikasi di Chrome HP → menu ⋮ → **Tambahkan ke layar utama / Instal aplikasi** (iPhone: Safari → Bagikan → *Tambah ke Layar Utama*). Setelah dibuka sekali, aplikasi tetap bisa dipakai tanpa internet.
7. **(Opsional) Isi database dengan data contoh** — agar semua menu langsung terisi seperti akun yang sudah dipakai berbulan-bulan (2 kelas, 55 siswa, RPP, bank soal, nilai, presensi 40 hari, jurnal, agenda, kontak wali, riwayat pesan, dokumen ber-QR, serta kepala sekolah & 2 guru contoh):
   - Pastikan Anda **sudah login sekali** ke aplikasi dengan email Anda (langkah 1).
   - Di editor Apps Script, pilih fungsi **`isiDataContoh`** → **Jalankan**. Tunggu ±1 menit sampai log menampilkan `✅ Data contoh terpasang…` beserta jumlah baris tiap sheet.
   - Buka aplikasi lalu muat ulang (F5 / tarik layar ke bawah). Data contoh masuk ke akun **admin pertama**; untuk akun lain, isi email di baris `const EMAIL_DATA_CONTOH = '';` di berkas `DataContoh.gs` sebelum menjalankan.
   - Aman dijalankan ulang (data diperbarui, tidak dobel). Tidak ada WA/email yang terkirim: nomor wali contoh berawalan `0800` dan riwayat antrean sudah berstatus *Terkirim*.
   - **Sebelum dipakai sungguhan**, jalankan **`hapusDataContoh`** untuk mengosongkan kembali semua data contoh (data asli Anda tidak tersentuh).

---

## Tahap 5 — Memperbarui aplikasi di kemudian hari

**Backend:** tempel kode baru → Simpan → **Terapkan → Kelola deployment** → ikon pensil → Versi: **Versi baru** → **Terapkan**. URL `/exec` tetap sama, jadi `config.js` tidak perlu diubah.

**Frontend:** salin berkas baru ke folder `master-teacher-planner` (folder yang berisi `index.html`) lalu jalankan dari folder itu:
```bash
git add .
git commit -m "Pembaruan"
git push
```
Tunggu 1–2 menit. Masih tampil versi lama? Tekan `Ctrl + Shift + R`. Untuk memaksa semua perangkat memperbarui cache offline, ubah nilai `VERSI` di baris atas `sw.js` (mis. `mtp-v2.0.1`) sebelum `git push`.

---

## Tahap 6 (opsional) — Tombol "Masuk dengan Google"

1. Buka https://console.cloud.google.com → buat proyek → **APIs & Services → OAuth consent screen** → External → isi nama aplikasi & email → simpan.
2. **Credentials → Create credentials → OAuth client ID** → *Web application* → **Authorized JavaScript origins:** `https://NAMAPENGGUNA.github.io` (tanpa garis miring di akhir) → Create.
3. Salin **Client ID** (berakhiran `.apps.googleusercontent.com`) → tempel di **Pengaturan → Admin → Google OAuth Client ID**.

---

## Tahap 7 (opsional) — Memindahkan data dari Master Teacher versi lama

- **Dari spreadsheet lama:** login sebagai Admin → **Pengaturan → Admin → Migrasi** → tempel URL spreadsheet lama (harus di **akun Google yang sama** dengan backend) → pilih sheet & tabel tujuan → **Pindai (simulasi)** → periksa pemetaan kolom → **Jalankan impor**. Spreadsheet lama hanya dibaca, tidak diubah. Aman diulang: baris yang sama tidak menjadi ganda — cocok untuk sinkron ulang tepat sebelum beralih.
- **Dari cadangan JSON v1.x:** **Pengaturan → Data & Sinkron → Pulihkan / impor cadangan**.
- **Daftar siswa dari Excel/Dapodik:** menu **Kelas → Data Siswa → Impor** → salin kolom nama (dan NISN, HP wali bila ada) → tempel.

---

## Pemecahan masalah

| Gejala | Penyebab & solusi |
|---|---|
| Situs GitHub menampilkan **404** | `git init` dijalankan di folder yang salah. Buka repository di GitHub: jika yang terlihat folder (bukan `index.html`), masuk ke folder yang berisi `index.html` lalu jalankan `git init`, `git add .`, `git commit -m "Perbaikan"`, `git branch -M main`, `git remote add origin …`, `git push -u origin main --force` (`--force` menimpa isi lama yang salah). |
| Tampilan polos tanpa warna | Berkas diunggah lewat web GitHub sehingga folder `css/` dan `js/` hilang. Unggah ulang lewat terminal (Tahap 3). |
| "Server belum dikonfigurasi" / hanya Mode Demo | `GAS_URL` di `js/config.js` masih kosong atau salah ketik. Pastikan berakhiran `/exec`. |
| "Tidak dapat menghubungi server" | Deployment belum diatur *Siapa saja*, atau backend diubah tanpa membuat **Versi baru**. |
| Kode OTP tidak datang | Cek Spam/Promosi. Kuota email Google ±100/hari (akun biasa). Gunakan akses darurat admin bila perlu. |
| `Password authentication is not supported` | Gunakan Personal Access Token sebagai password (Tahap 3.5). |
| `remote origin already exists` | Lewati perintah itu, langsung `git push`. |
| Notifikasi WA tidak terkirim | Isi token Fonnte, set **Notifikasi WA aktif = YA**, dan pastikan nomor wali benar (Komunikasi → Kontak → *Cek nomor WA*). Pengiriman berjalan bertahap setiap menit. |
| Ingin cek kesehatan sistem | Di editor Apps Script jalankan `cekKesehatan` → lihat log. |
| Ingin menjadikan seseorang admin | Jalankan `jadikanAdmin` setelah mengganti email di dalam fungsinya, atau isi **ADMIN_EMAILS** di Pengaturan → Admin. |
| Curiga sesi bocor | Jalankan `rotasiSecretSesi` di editor — semua perangkat otomatis keluar. |

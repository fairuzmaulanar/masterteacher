# PANDUAN LENGKAP: UPLOAD KE GITHUB & DEPLOY GRATIS KE VERCEL
================================================================================
Aplikasi: Master Teacher Planner (PWA Offline-First)
Target: Hosting Publik Cepat, Gratis Selamanya, & Otomatis HTTPS (Wajib untuk PWA)
Engine: ZettBOT Core v4.1 (by Zettbos)
================================================================================

Dengan mengunggah aplikasi ke **GitHub** dan menghubungkannya ke **Vercel**:
1. Anda mendapatkan **URL Publik Gratis** (contoh: `https://master-teacher-planner.vercel.app`).
2. Otomatis dilengkapi sertifikat keamanan **HTTPS** (syarat mutlak agar fitur install PWA di HP Android & iPhone aktif).
3. Setiap kali Anda memperbarui kode di GitHub, Vercel otomatis melakukan deploy ulang tanpa perlu repot!

---

## 🚀 BAGIAN 1: UPLOAD KODE KE GITHUB

Anda dapat memilih salah satu dari 2 cara termudah di bawah ini:

### CARA A: Lewat Web Browser (Paling Mudah, Tanpa Install Apapun)
Cocok untuk guru yang belum pernah menginstal Git di komputernya.

1. Buka situs [https://github.com](https://github.com) dan login (atau daftar akun gratis jika belum punya).
2. Di pojok kanan atas, klik tombol **[ + ]** lalu pilih **"New repository"**.
3. Isi data repository:
   - **Repository name:** `MasterTeacherPlanner` (atau nama lain yang Anda sukai).
   - **Visibility:** Pilih **Public** (agar bisa dideploy gratis ke Vercel).
   - *Jangan centang "Add a README file" (biarkan kosong).*
4. Klik tombol hijau **"Create repository"**.
5. Pada halaman kosong yang muncul, cari tulisan:  
   👉 *"uploading an existing file"* (klik tautan tersebut).
6. Buka File Explorer di komputer Anda, masuk ke folder projek:  
   `c:\Users\lenovo\.gemini\antigravity-ide\MasterTeacherPlanner`
7. Tarik (*drag and drop*) seluruh berkas dan folder projek ke kotak upload di halaman GitHub:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `sw.js`
   - `manifest.webmanifest`
   - `vercel.json`
   - `.gitignore`
   - `icon.svg`, `icon-192.png`, `icon-512.png`
   - Folder `views/`
   - Folder `modals/`
   - Folder `gas/` (berisi `code.gs` dan `setup.gs`)
8. Tunggu proses upload selesai, lalu di bagian bawah klik tombol hijau **"Commit changes"**.
9. Selesai! Seluruh kode aplikasi Anda kini telah aman tersimpan di GitHub.

---

### CARA B: Lewat Git Terminal / Git Bash (Bagi yang Memiliki Git)
Jika di komputer Anda sudah terpasang Git:

1. Buka Terminal / PowerShell / Git Bash di folder projek ini.
2. Jalankan perintah berikut secara berurutan:
   ```bash
   git init
   git add .
   git commit -m "feat: inisialisasi Master Teacher Planner v2.0.2"
   git branch -M main
   git remote add origin https://github.com/USERNAME_ANDA/MasterTeacherPlanner.git
   git push -u origin main
   ```
   *(Ganti `USERNAME_ANDA` dengan username akun GitHub Anda).*

---

## ⚡ BAGIAN 2: DEPLOY APLIKASI KE VERCEL (1-KLIK)

1. Buka situs [https://vercel.com](https://vercel.com) di peramban Anda.
2. Klik tombol **"Sign Up"** atau **"Log In"**, lalu pilih **"Continue with GitHub"**.  
   *(Login dengan akun GitHub Anda agar Vercel otomatis tersambung).*
3. Setelah masuk ke Dashboard Vercel, klik tombol **"Add New..."** di pojok kanan atas &rarr; pilih **"Project"**.
4. Di daftar repository yang muncul, Anda akan melihat repository **`MasterTeacherPlanner`**.  
   Klik tombol **"Import"** di sebelah kanannya.
5. Pada halaman konfigurasi deploy:
   - **Project Name:** Biarkan default atau sesuaikan nama subdomain yang Anda inginkan (misal: `master-teacher-planner`).
   - **Framework Preset:** Pilih **"Other"** (karena aplikasi ini adalah HTML/JS murni).
   - **Root Directory:** `./` (biarkan default).
   - *Build and Output Settings tidak perlu diubah karena sudah diatur otomatis oleh berkas `vercel.json`.*
6. Klik tombol biru besar **"Deploy"**!
7. Tunggu sekitar 20–40 detik hingga muncul animasi kembang api (*Congratulations!*).
8. Klik tombol **"Continue to Dashboard"** atau klik pratinjau situs untuk mendapatkan URL resmi aplikasi Anda (contoh: `https://master-teacher-planner.vercel.app`).

---

## 📲 BAGIAN 3: CARA INSTALL APLIKASI DI HP DARI LINK VERCEL

Kini aplikasi Anda sudah online di internet dengan sertifikat HTTPS resmi! Anda dan guru-guru lain dapat langsung memasangnya ke layar utama HP:

### Di HP Android (Google Chrome):
1. Buka link Vercel Anda di Chrome HP (contoh: `https://master-teacher-planner.vercel.app`).
2. Di layar login, ketuk tombol hijau:  
   👉 **[ 📥 Download / Pasang di HP atau Komputer ]**
3. Atau ketuk menu titik tiga (⋮) di pojok kanan atas Chrome &rarr; pilih **"Pasang Aplikasi"** (*Install App*) atau **"Tambahkan ke Layar Utama"**.
4. Ikon Master Teacher Planner akan langsung muncul di layar HP Anda seperti aplikasi dari Play Store!

### Di iPhone / iPad (Safari):
1. Buka link Vercel Anda di peramban **Safari**.
2. Ketuk tombol **Bagikan (*Share*)** (ikon kotak dengan panah ke atas 📤) di bilah navigasi bawah Safari.
3. Gulir ke bawah dan pilih **"Tambah ke Layar Utama"** (*Add to Home Screen*).
4. Ketuk **"Tambah"** di sudut kanan atas. Selesai!

---

## ☁️ BAGIAN 4: MENGHUBUNGKAN DATABASE GOOGLE SHEETS DI VERCEL

Agar data profil, siswa, nilai, dan RPP tersinkronisasi ke Google Sheets saat diakses dari link Vercel:
1. Buka aplikasi Anda di link Vercel.
2. Masuk ke akun guru Anda.
3. Buka menu samping (Sidebar) &rarr; klik **[ ☁️ Database Google Sheets ]**.
4. Masukkan URL Web App Google Apps Script Anda (yang didapat dari deploy `code.gs`).
5. Centang **"Aktifkan Sinkronisasi Otomatis"**, lalu klik **[ ☁️ Kirim Data ke Google Sheets ]** atau **[ ⬇️ Ambil Data dari Google Sheets ]**.
6. Kini aplikasi Anda yang berjalan di Vercel telah terhubung langsung ke basis data Google Spreadsheet Anda!


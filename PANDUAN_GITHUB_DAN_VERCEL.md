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

Pilih cara yang paling Anda sukai:

### CARA 1 (Rekomendasi Utama: 1-Klik Otomatis Lewat File Batch)
Ini adalah cara tercepat dan **menjamin seluruh struktur folder (`gas/`, `modals/`, `views/`) masuk dengan rapi 100%**:

1. Buka File Explorer di komputer Anda dan masuk ke folder projek:  
   `c:\Users\lenovo\.gemini\antigravity-ide\MasterTeacherPlanner`
2. **Klik ganda (double-click)** pada berkas:  
   👉 **`Upload-Ke-GitHub.bat`**
3. Jendela hitam terminal akan berjalan otomatis. Jika jendela browser pop-up muncul, silakan klik **"Sign In with your browser"** / **"Authorize"** untuk memberi izin ke akun GitHub Anda.
4. Selesai! Skrip akan otomatis menimpa file yang berantakan di GitHub dan menyusunnya menjadi folder yang rapi dan terstruktur.

---

### CARA 2: Lewat Terminal Antigravity / PowerShell
Jika Anda lebih suka menjalankan perintah di terminal:

1. Buka Terminal di Antigravity / PowerShell di folder projek ini.
2. Jalankan satu perintah berikut:
   ```bash
   git push -u origin main --force
   ```
3. Jika diminta login GitHub di peramban, klik **Authorize**. Selesai!

---

### Mengapa Lewat Web Browser GitHub Sering Berantakan?
Jika Anda mengunggah lewat tombol *"Upload files"* di situs web GitHub:
- Browser web tidak dapat mempertahankan folder jika file ditarik satu per satu.
- Akibatnya file seperti `code.gs`, `templates.js`, dan `modals.js` tumpah ke luar tanpa folder induknya (`gas/`, `views/`, `modals/`).
- Jika struktur folder hilang, aplikasi akan macet atau layar putih saat dibuka di Vercel karena `index.html` mencari berkas komponen di dalam foldernya masing-masing.
- **Solusinya:** Cukup gunakan **`Upload-Ke-GitHub.bat`** di atas, maka Git akan otomatis membereskan dan menyusun seluruh folder dengan sempurna!

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


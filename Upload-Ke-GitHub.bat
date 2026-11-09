@echo off
chcp 65001 >nul
title Master Teacher Planner - Sinkronisasi ke GitHub
echo =====================================================================
echo    MASTER TEACHER PLANNER - PENGIRIMAN OTOMATIS KE GITHUB
echo =====================================================================
echo.
echo Sedang memeriksa berkas dan menyiapkan struktur folder...
git add .
git commit -m "feat: perbaiki dan sinkronkan seluruh folder ke GitHub" 2>nul
echo.
echo Sedang mengunggah berkas ke https://github.com/fairuzmaulanar/masterteacher ...
echo (Jika jendela peramban/browser muncul, silakan login atau klik "Authorize" untuk memberi izin ke GitHub)
echo.
git push -u origin main --force
echo.
if %ERRORLEVEL% equ 0 (
    echo =====================================================================
    echo [SUKSES] Semua berkas dan folder berhasil diunggah ke GitHub!
    echo Silakan buka: https://github.com/fairuzmaulanar/masterteacher
    echo Sekarang seluruh folder (gas, modals, views) sudah tersusun rapi!
    echo =====================================================================
) else (
    echo =====================================================================
    echo [PERHATIAN] Pengunggahan belum selesai.
    echo Pastikan Anda sudah login ke akun GitHub Anda jika diminta peramban.
    echo =====================================================================
)
echo.
pause


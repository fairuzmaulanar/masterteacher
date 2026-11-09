@echo off
chcp 65001 >nul
title Master Teacher Planner - PWA Offline Runner
echo =====================================================================
echo    MASTER TEACHER PLANNER - MEMBUKA PWA & LOCAL SERVER
echo =====================================================================
echo.
echo Sedang menyiapkan server PWA lokal...
echo Layar browser Chrome / Edge akan terbuka di http://localhost:8080
echo.
echo Tips: Setelah terbuka, Anda dapat mengklik icon "Install" di URL bar
echo       atau tombol "Install Aplikasi ke Perangkat (PWA)".
echo.
echo (JANGAN TUTUP JENDELA HITAM INI SELAMA APLIKASI DIGUNAKAN)
echo =====================================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"

pause

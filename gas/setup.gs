/**
 * ============================================================================
 * DATABASE SETUP & DUMMY DATA SEEDER - MASTER TEACHER PLANNER
 * ============================================================================
 * Engine: ZettBOT Core v4.1 (by Zettbos)
 * Target: Google Sheets Database Backend (Google Apps Script)
 * Standar:
 *   - Nama sheet wajib PascalCase TANPA UNDERSCORE (_)
 *   - Idempoten & Safe Migration (tidak menghapus data riil yang ada)
 *   - Baris 1 dibekukan (frozen header) dengan warna Navy #1E293B
 *   - Penyuntikan data dummy hanya jika sheet masih kosong (getLastRow() <= 1)
 *   - Pemanggilan SpreadsheetApp.flush() di akhir proses
 * ============================================================================
 */

/**
 * Fungsi Utama: Jalankan fungsi ini satu kali di Apps Script Editor
 * untuk menginisialisasi seluruh struktur tabel dan mengisi data dummy awal.
 */
function setupDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error('Spreadsheet aktif tidak ditemukan. Pastikan script ini terikat (bound) pada Google Sheets.');
  }

  Logger.log('>>> Memulai inisialisasi Database Master Teacher Planner...');

  // 1. Inisialisasi 14 Tabel / Sheet Resmi
  var tables = getTableDefinitions();
  for (var i = 0; i < tables.length; i++) {
    var def = tables[i];
    createOrUpdateSheet(ss, def.name, def.headers);
  }

  // 2. Hapus sheet bawaan "Sheet1" atau "Sheet 1" jika kosong dan bukan bagian dari sistem
  cleanupDefaultSheet(ss);

  // 3. Masukkan Seluruh Data Dummy Realistik ke Semua Menu
  seedInitialDummyData(ss);

  SpreadsheetApp.flush();
  Logger.log('>>> SUKSES: Seluruh 14 tabel dan data dummy berhasil dipasang di Google Sheets!');
  return { status: 'success', message: 'Database Master Teacher Planner berhasil diinisialisasi!' };
}

/**
 * Definisi 14 Tabel Resmi & Header Baku (Index Kolom 0-Based)
 */
function getTableDefinitions() {
  return [
    {
      name: 'DataGuru',
      headers: [
        'IDGuru', 'NamaLengkap', 'Email', 'Password', 'NIP', 'MataPelajaran',
        'NamaSekolah', 'AlamatSekolah', 'TeleponSekolah', 'EmailSekolah', 'WebsiteSekolah',
        'NamaKepalaSekolah', 'NipKepalaSekolah', 'LogoSekolah', 'CreatedAt'
      ]
    },
    {
      name: 'DataSiswa',
      headers: [
        'IDSiswa', 'IDGuru', 'Kelas', 'NISN', 'NamaLengkap', 'JenisKelamin',
        'DeskRow', 'DeskCol', 'CatatanAnekdot'
      ]
    },
    {
      name: 'ModulAjarRPP',
      headers: [
        'IDRPP', 'IDGuru', 'MateriPokok', 'Kelas', 'MataPelajaran', 'AlokasiWaktu',
        'Semester', 'TahunAjaran', 'Fase', 'Komponen', 'P5Tema', 'P5Dimensi',
        'TujuanPembelajaran', 'KegiatanPembuka', 'KegiatanInti', 'KegiatanPenutup',
        'Asesmen', 'TautanMateriJSON'
      ]
    },
    {
      name: 'MateriPelajaran',
      headers: [
        'IDMateri', 'IDGuru', 'Judul', 'MataPelajaran', 'Kelas', 'Topik',
        'AlokasiWaktu', 'TingkatKesulitan', 'ModelPembelajaran', 'CPTP',
        'Ringkasan', 'MediaLinksJSON', 'AssignedScheduleID'
      ]
    },
    {
      name: 'BankSoal',
      headers: [
        'IDSoal', 'IDGuru', 'IDMateri', 'TipeSoal', 'BloomTaxonomy', 'TingkatKognitif',
        'BobotSkor', 'Stimulus', 'Pertanyaan', 'OpsiJawabanJSON', 'KunciJawaban', 'Pembahasan'
      ]
    },
    {
      name: 'PaketAsesmen',
      headers: [
        'IDPaket', 'IDGuru', 'JudulPaket', 'Kelas', 'MataPelajaran', 'WaktuMenit',
        'TanggalUjian', 'DaftarSoalIDsJSON'
      ]
    },
    {
      name: 'JadwalMengajar',
      headers: [
        'IDJadwal', 'IDGuru', 'Hari', 'JamMulai', 'JamSelesai', 'Kelas',
        'MataPelajaran', 'Ruangan', 'WarnaLabel'
      ]
    },
    {
      name: 'AgendaAkademik',
      headers: [
        'IDAgenda', 'IDGuru', 'Tanggal', 'JudulAgenda', 'Kategori', 'Keterangan'
      ]
    },
    {
      name: 'PresensiSiswa',
      headers: [
        'IDPresensi', 'IDGuru', 'Kelas', 'Tanggal', 'TotalHadir', 'TotalSakit',
        'TotalIzin', 'TotalAlpa', 'RecordsJSON'
      ]
    },
    {
      name: 'BukuNilai',
      headers: [
        'IDGuru', 'IDSiswa', 'Kelas', 'TugasJSON', 'NilaiUTS', 'NilaiUAS', 'NilaiAkhir'
      ]
    },
    {
      name: 'TugasKoreksi',
      headers: [
        'IDTugas', 'IDGuru', 'JudulTugas', 'KelasMapel', 'TotalKoreksi',
        'SelesaiKoreksi', 'Deadline', 'Status'
      ]
    },
    {
      name: 'NotulaRapat',
      headers: [
        'IDRapat', 'IDGuru', 'Tanggal', 'JudulRapat', 'HasilNotula'
      ]
    },
    {
      name: 'JurnalRefleksi',
      headers: [
        'IDRefleksi', 'IDGuru', 'Tanggal', 'Kelas', 'Materi', 'IsiRefleksi'
      ]
    },
    {
      name: 'PengaturanAplikasi',
      headers: [
        'IDGuru', 'ClassesJSON', 'GradeWeightsJSON', 'GeminiApiKey', 'LastSyncedAt'
      ]
    }
  ];
}

/**
 * Membuat sheet jika belum ada dan menyelaraskan header tanpa merusak data lama.
 */
function createOrUpdateSheet(ss, sheetName, expectedHeaders) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    Logger.log('+ Tab sheet dibuat: ' + sheetName);
  }

  // Jika sheet benar-benar baru atau baris 1 kosong
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(expectedHeaders);
    formatHeaderRow(sheet, expectedHeaders.length);
    return;
  }

  // Safe Migration: Tambahkan header baru di kolom paling kanan jika ada revisi
  var currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var missing = [];
  for (var i = 0; i < expectedHeaders.length; i++) {
    if (currentHeaders.indexOf(expectedHeaders[i]) === -1) {
      missing.push(expectedHeaders[i]);
    }
  }

  if (missing.length > 0) {
    for (var m = 0; m < missing.length; m++) {
      var nextCol = sheet.getLastColumn() + 1;
      sheet.getRange(1, nextCol).setValue(missing[m]);
    }
    formatHeaderRow(sheet, sheet.getLastColumn());
    Logger.log('~ Migrasi kolom baru pada ' + sheetName + ': ' + missing.join(', '));
  }
}

/**
 * Format baris header profesional: Latar Navy #1E293B, Teks Putih Tebal, Freeze Baris 1
 */
function formatHeaderRow(sheet, numCols) {
  var headerRange = sheet.getRange(1, 1, 1, numCols);
  headerRange.setBackground('#1E293B');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setFontWeight('bold');
  headerRange.setFontSize(10);
  headerRange.setHorizontalAlignment('center');
  headerRange.setVerticalAlignment('middle');
  headerRange.setWrap(false);
  sheet.setRowHeight(1, 32);
  sheet.setFrozenRows(1);
}

/**
 * Hapus Sheet1 bawaan spreadsheet jika masih kosong
 */
function cleanupDefaultSheet(ss) {
  var defSheet = ss.getSheetByName('Sheet1') || ss.getSheetByName('Sheet 1');
  if (defSheet && ss.getSheets().length > 1) {
    if (defSheet.getLastRow() <= 1 && defSheet.getLastColumn() <= 1) {
      try {
        ss.deleteSheet(defSheet);
        Logger.log('- Sheet bawaan kosong dihapus.');
      } catch (e) {}
    }
  }
}

/**
 * ============================================================================
 * SEEDER DATA DUMMY LENGKAP SEMUA MENU (REALISTIS & SESUAI APLIKASI)
 * ============================================================================
 */
function seedInitialDummyData(ss) {
  var teacherId = 'GURU-202610-001';

  // 1. DataGuru (Profil Demo Budi Pratama)
  var sheetGuru = ss.getSheetByName('DataGuru');
  if (sheetGuru && sheetGuru.getLastRow() <= 1) {
    sheetGuru.appendRow([
      teacherId,
      'Budi Pratama, S.Pd., M.Kom.',
      'guru.demo@sekolah.id',
      '1234',
      '19880512 201201 1 003',
      'Informatika & Pemrograman',
      'SMA Negeri 1 Harapan Nusantara',
      'Jl. Pendidikan Karakter Bangsa No. 45',
      '(021) 7890123',
      'tatausaha@sekolah.sch.id',
      'www.sman1harapannusantara.sch.id',
      'Dr. H. Bambang Sudarsono, M.Pd.',
      '19760415 200212 1 003',
      '',
      new Date().toISOString()
    ]);
    Logger.log('+ Data Guru Demo Budi Pratama dimasukkan.');
  }

  // 2. DataSiswa (30 Siswa: X-A, XI-IPA 1, XII-IPA 2)
  var sheetSiswa = ss.getSheetByName('DataSiswa');
  if (sheetSiswa && sheetSiswa.getLastRow() <= 1) {
    var rawStudents = getDummyStudents(teacherId);
    for (var s = 0; s < rawStudents.length; s++) {
      sheetSiswa.appendRow(rawStudents[s]);
    }
    Logger.log('+ 30 Data Siswa dimasukkan.');
  }

  // 3. ModulAjarRPP (7 RPP Kurikulum Merdeka)
  var sheetRPP = ss.getSheetByName('ModulAjarRPP');
  if (sheetRPP && sheetRPP.getLastRow() <= 1) {
    var rawRPP = getDummyLessonPlans(teacherId);
    for (var r = 0; r < rawRPP.length; r++) {
      sheetRPP.appendRow(rawRPP[r]);
    }
    Logger.log('+ 7 RPP Modul Ajar dimasukkan.');
  }

  // 4. MateriPelajaran (7 Materi & Media)
  var sheetMateri = ss.getSheetByName('MateriPelajaran');
  if (sheetMateri && sheetMateri.getLastRow() <= 1) {
    var rawMaterials = getDummyMaterials(teacherId);
    for (var m = 0; m < rawMaterials.length; m++) {
      sheetMateri.appendRow(rawMaterials[m]);
    }
    Logger.log('+ 7 Materi Pelajaran dimasukkan.');
  }

  // 5. BankSoal (18 Butir Soal HOTS/LOTS)
  var sheetSoal = ss.getSheetByName('BankSoal');
  if (sheetSoal && sheetSoal.getLastRow() <= 1) {
    var rawQuestions = getDummyQuestions(teacherId);
    for (var q = 0; q < rawQuestions.length; q++) {
      sheetSoal.appendRow(rawQuestions[q]);
    }
    Logger.log('+ 18 Butir Bank Soal dimasukkan.');
  }

  // 6. PaketAsesmen (5 Paket Ujian)
  var sheetPaket = ss.getSheetByName('PaketAsesmen');
  if (sheetPaket && sheetPaket.getLastRow() <= 1) {
    var rawPackages = getDummyAssessmentPackages(teacherId);
    for (var p = 0; p < rawPackages.length; p++) {
      sheetPaket.appendRow(rawPackages[p]);
    }
    Logger.log('+ 5 Paket Asesmen dimasukkan.');
  }

  // 7. JadwalMengajar (8 Jadwal Mengajar Mingguan)
  var sheetJadwal = ss.getSheetByName('JadwalMengajar');
  if (sheetJadwal && sheetJadwal.getLastRow() <= 1) {
    var rawSchedules = getDummyTimetable(teacherId);
    for (var j = 0; j < rawSchedules.length; j++) {
      sheetJadwal.appendRow(rawSchedules[j]);
    }
    Logger.log('+ 8 Jadwal Mengajar dimasukkan.');
  }

  // 8. AgendaAkademik (8 Agenda Sekolah)
  var sheetAgenda = ss.getSheetByName('AgendaAkademik');
  if (sheetAgenda && sheetAgenda.getLastRow() <= 1) {
    var rawEvents = getDummyAcademicEvents(teacherId);
    for (var e = 0; e < rawEvents.length; e++) {
      sheetAgenda.appendRow(rawEvents[e]);
    }
    Logger.log('+ 8 Agenda Akademik dimasukkan.');
  }

  // 9. PresensiSiswa (6 Log Presensi Harian)
  var sheetPresensi = ss.getSheetByName('PresensiSiswa');
  if (sheetPresensi && sheetPresensi.getLastRow() <= 1) {
    var rawAttendance = getDummyAttendance(teacherId);
    for (var a = 0; a < rawAttendance.length; a++) {
      sheetPresensi.appendRow(rawAttendance[a]);
    }
    Logger.log('+ 6 Log Presensi Siswa dimasukkan.');
  }

  // 10. BukuNilai (30 Rekap Nilai Siswa)
  var sheetNilai = ss.getSheetByName('BukuNilai');
  if (sheetNilai && sheetNilai.getLastRow() <= 1) {
    var rawGrades = getDummyGradebook(teacherId);
    for (var g = 0; g < rawGrades.length; g++) {
      sheetNilai.appendRow(rawGrades[g]);
    }
    Logger.log('+ 30 Baris Buku Nilai dimasukkan.');
  }

  // 11. TugasKoreksi (6 Pelacak Koreksi Guru)
  var sheetKoreksi = ss.getSheetByName('TugasKoreksi');
  if (sheetKoreksi && sheetKoreksi.getLastRow() <= 1) {
    var rawTasks = getDummyTasks(teacherId);
    for (var t = 0; t < rawTasks.length; t++) {
      sheetKoreksi.appendRow(rawTasks[t]);
    }
    Logger.log('+ 6 Pelacak Tugas & Koreksi dimasukkan.');
  }

  // 12. NotulaRapat (5 Notula Rapat Dinas & MGMP)
  var sheetRapat = ss.getSheetByName('NotulaRapat');
  if (sheetRapat && sheetRapat.getLastRow() <= 1) {
    var rawMeetings = getDummyMeetings(teacherId);
    for (var mt = 0; mt < rawMeetings.length; mt++) {
      sheetRapat.appendRow(rawMeetings[mt]);
    }
    Logger.log('+ 5 Notula Rapat dimasukkan.');
  }

  // 13. JurnalRefleksi (5 Catatan Refleksi Guru)
  var sheetRefleksi = ss.getSheetByName('JurnalRefleksi');
  if (sheetRefleksi && sheetRefleksi.getLastRow() <= 1) {
    var rawReflections = getDummyReflections(teacherId);
    for (var rf = 0; rf < rawReflections.length; rf++) {
      sheetRefleksi.appendRow(rawReflections[rf]);
    }
    Logger.log('+ 5 Jurnal Refleksi dimasukkan.');
  }

  // 14. PengaturanAplikasi (Daftar Kelas & Bobot Nilai)
  var sheetPengaturan = ss.getSheetByName('PengaturanAplikasi');
  if (sheetPengaturan && sheetPengaturan.getLastRow() <= 1) {
    sheetPengaturan.appendRow([
      teacherId,
      JSON.stringify(['X-A (Fase E)', 'XI-IPA 1', 'XII-IPA 2']),
      JSON.stringify({ tugas: 30, uts: 30, uas: 40 }),
      '',
      new Date().toISOString()
    ]);
    Logger.log('+ Pengaturan Aplikasi Guru dimasukkan.');
  }
}

/**
 * ============================================================================
 * DATA SAMPEL ASLI APLIKASI UNTUK SEEDING GOOGLE SHEETS
 * ============================================================================
 */
function getDummyStudents(teacherId) {
  return [
    // X-A (Fase E)
    ['SIS-202610-001', teacherId, 'X-A (Fase E)', '0081234561', 'Aditya Pratama Nugraha', 'L', 1, 1, 'Sangat antusias saat materi pemrograman logika dan sering membantu rekan sebangku.'],
    ['SIS-202610-002', teacherId, 'X-A (Fase E)', '0081234562', 'Annisa Fitri Rahmawati', 'P', 1, 2, 'Teliti dalam pengerjaan LKS dan aktif dalam sesi tanya jawab.'],
    ['SIS-202610-003', teacherId, 'X-A (Fase E)', '0081234563', 'Bagas Satria Wijaya', 'L', 1, 3, 'Memerlukan motivasi tambahan dalam fokus mendengarkan instruksi awal.'],
    ['SIS-202610-004', teacherId, 'X-A (Fase E)', '0081234564', 'Clarissa Maharani Dewi', 'P', 1, 4, 'Kreatif dalam visualisasi diagram alir dan desain presentasi.'],
    ['SIS-202610-005', teacherId, 'X-A (Fase E)', '0081234565', 'Dimas Anggara Putra', 'L', 2, 1, 'Memiliki bakat menonjol dalam pemecahan masalah algoritma.'],
    ['SIS-202610-006', teacherId, 'X-A (Fase E)', '0081234566', 'Eka Lestari Putri', 'P', 2, 2, 'Disiplin dan selalu mengumpulkan tugas tepat waktu.'],
    ['SIS-202610-007', teacherId, 'X-A (Fase E)', '0081234567', 'Farhan Maulana Akbar', 'L', 2, 3, 'Komunikatif dan pandai memimpin diskusi kelompok.'],
    ['SIS-202610-008', teacherId, 'X-A (Fase E)', '0081234568', 'Gita Permatasari', 'P', 2, 4, 'Rajin mencatat rangkuman materi dengan rapi.'],
    ['SIS-202610-009', teacherId, 'X-A (Fase E)', '0081234569', 'Hafidz Nurrohman', 'L', 3, 1, 'Tertarik tinggi pada perakitan komponen mikrokontroler dan robotika P5.'],
    ['SIS-202610-010', teacherId, 'X-A (Fase E)', '0081234570', 'Intan Kusuma Wardani', 'P', 3, 2, 'Sangat mahir dalam menyusun laporan portofolio dan visualisasi data.'],

    // XI-IPA 1
    ['SIS-202610-011', teacherId, 'XI-IPA 1', '0072345671', 'Arya Daniswara', 'L', 1, 1, 'Memiliki pemahaman analitis yang tajam pada materi struktur data larik.'],
    ['SIS-202610-012', teacherId, 'XI-IPA 1', '0072345672', 'Bunga Citra Lestari', 'P', 1, 2, 'Rapi dalam menyusun kode HTML/CSS dan memiliki kepekaan estetis UI.'],
    ['SIS-202610-013', teacherId, 'XI-IPA 1', '0072345673', 'Candra Kusuma', 'L', 1, 3, 'Aktif bertanya pada konsep algoritma percabangan bersarang.'],
    ['SIS-202610-014', teacherId, 'XI-IPA 1', '0072345674', 'Dinda Ayu Permata', 'P', 1, 4, 'Konsisten mengumpulkan tugas tepat waktu dengan hasil di atas KKM.'],
    ['SIS-202610-015', teacherId, 'XI-IPA 1', '0072345675', 'Fajar Hidayatullah', 'L', 2, 1, 'Perlu pendampingan berkala pada latihan perulangan for bersarang.'],
    ['SIS-202610-016', teacherId, 'XI-IPA 1', '0072345676', 'Hana Salsabila', 'P', 2, 2, 'Komunikatif dan menjadi ketua kelompok proyek web yang sangat suportif.'],
    ['SIS-202610-017', teacherId, 'XI-IPA 1', '0072345677', 'Ilham Ramadhan', 'L', 2, 3, 'Bakat menonjol dalam pemecahan masalah logika pemrograman.'],
    ['SIS-202610-018', teacherId, 'XI-IPA 1', '0072345678', 'Jessica Olivia', 'P', 2, 4, 'Teliti dalam mendokumentasikan error sintaks saat praktikum lab.'],
    ['SIS-202610-019', teacherId, 'XI-IPA 1', '0072345679', 'Kevin Sanjaya Putra', 'L', 3, 1, 'Antusias saat sesi tantangan coding kilat di akhir jam pelajaran.'],
    ['SIS-202610-020', teacherId, 'XI-IPA 1', '0072345680', 'Larasati Putri Utami', 'P', 3, 2, 'Disiplin dan aktif membagikan catatan rangkuman di kelompok belajar.'],

    // XII-IPA 2
    ['SIS-202610-021', teacherId, 'XII-IPA 2', '0063456781', 'M. Rizky Pratama', 'L', 1, 1, 'Memimpin proyek normalisasi database perpustakaan dengan sangat baik.'],
    ['SIS-202610-022', teacherId, 'XII-IPA 2', '0063456782', 'Nabila Zahra', 'P', 1, 2, 'Sangat mahir merancang ERD relasional dan penulisan query SQL kompleks.'],
    ['SIS-202610-023', teacherId, 'XII-IPA 2', '0063456783', 'Pandu Wicaksono', 'L', 1, 3, 'Kritis dalam menganalisis keamanan sistem autentikasi data.'],
    ['SIS-202610-024', teacherId, 'XII-IPA 2', '0063456784', 'Qonita Amalia', 'P', 1, 4, 'Memiliki daya nalar tinggi dalam studi kasus etika kecerdasan buatan.'],
    ['SIS-202610-025', teacherId, 'XII-IPA 2', '0063456785', 'Rendy Firmansyah', 'L', 2, 1, 'Kemampuan praktikum sangat baik, perlu penguatan pada uraian teori esai.'],
    ['SIS-202610-026', teacherId, 'XII-IPA 2', '0063456786', 'Siti Nurhaliza', 'P', 2, 2, 'Selalu menyelesaikan tugas mandiri lebih cepat dengan tingkat akurasi tinggi.'],
    ['SIS-202610-027', teacherId, 'XII-IPA 2', '0063456787', 'Taufik Hidayat', 'L', 2, 3, 'Minat mendalam pada arsitektur server jaringan dan rekayasa data.'],
    ['SIS-202610-028', teacherId, 'XII-IPA 2', '0063456788', 'Vania Aurelia', 'P', 2, 4, 'Kreatif dalam visualisasi data dan infografis presentasi akhir semester.'],
    ['SIS-202610-029', teacherId, 'XII-IPA 2', '0063456789', 'Wahyu Setiawan', 'L', 3, 1, 'Tekun dalam menguji coba skenario query JOIN multi-tabel di lab.'],
    ['SIS-202610-030', teacherId, 'XII-IPA 2', '0063456790', 'Zahra Aulia Rahmah', 'P', 3, 2, 'Target perguruan tinggi jurusan Ilmu Komputer, daya serap materi luar biasa.']
  ];
}

function getDummyLessonPlans(teacherId) {
  return [
    [
      'RPP-202610-001', teacherId, 'Algoritma Pemrograman & Berpikir Komputasional', 'X-A (Fase E)', 'Informatika',
      '3 JP x 45 Menit', 1, '2026/2027', 'Fase E', 'Intrakurikuler', '', '',
      'Peserta didik mampu memahami konsep dekomposisi, pengenalan pola, abstraksi, dan merancang algoritma langkah demi langkah untuk menyelesaikan permasalahan sehari-hari.',
      '1. Guru menyapa, berdoa, mengecek kehadiran, dan apersepsi (10 menit).\n2. Ice breaking teka-teki logika untuk memicu daya nalar peserta didik.',
      '1. Diferensiasi Konten: Menayangkan studi kasus rute terpendek dan bagan alur.\n2. Diskusi kelompok: Siswa menyusun flowchart penyelesaian masalah menggunakan kartu logika.\n3. Diferensiasi Produk: Kelompok pemula membuat diagram alur, kelompok mahir menulis pseudocode terstruktur (65 menit).',
      '1. Refleksi bersama siswa mengenai kesulitan yang dialami.\n2. Kesimpulan dan penyampaian topik pertemuan berikutnya (15 menit).',
      'Asesmen Formatif: Lembar observasi diskusi & Rubrik penilaian presentasi algoritma.',
      JSON.stringify([
        { label: 'Slide Presentasi Modul 1 (Drive)', url: 'https://drive.google.com' },
        { label: 'Video Simulasi Flowchart (YouTube)', url: 'https://youtube.com' }
      ])
    ],
    [
      'RPP-202610-002', teacherId, 'Struktur Data Larik (Array 1D & 2D) & Logika Pencarian', 'XI-IPA 1', 'Informatika',
      '2 JP x 45 Menit', 1, '2026/2027', 'Fase F', 'Intrakurikuler', '', '',
      'Peserta didik mampu mengimplementasikan struktur data array 1 dimensi dan 2 dimensi serta menganalisis efisiensi Linear Search vs Binary Search.',
      'Apersepsi dengan permainan tebak angka acak terurut (10 menit).',
      'Praktikum di lab komputer: 1. Penjelasan indeks array berbasis nol. 2. Eksplorasi traversing array perulangan for. 3. Diferensiasi proses: kelompok mandiri menantang kasus array 2 dimensi matriks (60 menit).',
      'Kuis interaktif kilat 3 pertanyaan refleksi dan kesimpulan (20 menit).',
      'Praktikum individu di lab dan rubrik kebenaran logika kode sintaks.',
      JSON.stringify([{ label: 'Modul Praktikum Array (Drive)', url: 'https://docs.google.com' }])
    ],
    [
      'RPP-202610-003', teacherId, 'Desain Basis Data Relasional, ERD & Normalisasi', 'XII-IPA 2', 'Informatika',
      '3 JP x 45 Menit', 1, '2026/2027', 'Fase F', 'Intrakurikuler', '', '',
      'Peserta didik mampu memodelkan data dunia nyata ke dalam Entity Relationship Diagram (ERD), menerapkan aturan normalisasi 1NF hingga 3NF, dan merancang skema tabel relasional.',
      'Review konsep basis data spreadsheet manual dan masalah redundansi data (10 menit).',
      '1. Studi kasus sistem perpustakaan dan toko online.\n2. Praktikum merancang diagram entitas, primary key, dan foreign key.\n3. Uji coba query SQL dasar (SELECT, WHERE, JOIN) (70 menit).',
      'Refleksi kelompok mengenai tantangan menghindari anomali update data (10 menit).',
      'Asesmen Sumatif: Lembar proyek perancangan skema ERD kelompok.',
      JSON.stringify([
        { label: 'Slide ERD & Normalisasi (Drive)', url: 'https://drive.google.com' },
        { label: 'Panduan Praktikum SQL (PDF)', url: 'https://docs.google.com' }
      ])
    ],
    [
      'RPP-202610-004', teacherId, 'Keamanan Siber, Jejak Digital & Kriptografi Simetris', 'X-A (Fase E)', 'Informatika',
      '2 JP x 45 Menit', 1, '2026/2027', 'Fase E', 'Intrakurikuler', '', '',
      'Peserta didik mampu mengidentifikasi risiko keamanan siber (phishing, social engineering), menjaga privasi jejak digital, dan mempraktikkan enkripsi sederhana (Caesar Cipher).',
      'Studi kasus berita kebocoran data dan bahaya pembobolan akun di media sosial (10 menit).',
      '1. Eksplorasi jejak digital di mesin pencari.\n2. Simulasi enkripsi pesan rahasia menggunakan kartu kode Caesar cipher.\n3. Diskusi etika berinternet sehat dan password manager (65 menit).',
      'Penyusunan komitmen bersama "5 Aturan Emas Keamanan Akun Siswa" (15 menit).',
      'Asesmen Formatif: Lembar kerja simulasi enkripsi & kuis interaktif.',
      JSON.stringify([
        { label: 'Modul Keamanan Siber (Drive)', url: 'https://drive.google.com' },
        { label: 'Video Edukasi Jejak Digital (YouTube)', url: 'https://youtube.com' }
      ])
    ],
    [
      'RPP-202610-005', teacherId, 'Pengembangan Web Modern: Tata Letak CSS Grid & Flexbox', 'XI-IPA 1', 'Informatika',
      '3 JP x 45 Menit', 1, '2026/2027', 'Fase F', 'Intrakurikuler', '', '',
      'Peserta didik mampu merancang antarmuka web responsif multi-perangkat menggunakan teknik CSS Flexbox untuk komponen satu dimensi dan CSS Grid untuk layout dua dimensi.',
      'Demonstrasi responsive design web saat dibuka di layar HP vs Laptop (10 menit).',
      'Praktikum di lab: 1. Latihan Flexbox align-items dan justify-content.\n2. Pembuatan kartu produk responsif.\n3. Tantangan layout dashboard 3 kolom dengan CSS Grid (70 menit).',
      'Showcase karya web siswa di proyektor kelas dan umpan balik teman sebaya (10 menit).',
      'Asesmen Kinerja Produk: Rubrik responsivitas web dan kerapian kode CSS.',
      JSON.stringify([
        { label: 'Cheatsheet Flexbox & Grid (Drive)', url: 'https://drive.google.com' },
        { label: 'Demo Interaktif CSS Flexbox (CodePen)', url: 'https://codepen.io' }
      ])
    ],
    [
      'RPP-202610-006', teacherId, 'P5: Rekayasa & Teknologi - Rancang Bangun IoT Smart Classroom', 'X-A (Fase E)', 'Informatika',
      '4 JP x 45 Menit', 1, '2026/2027', 'Fase E', 'Kokurikuler', 'Rekayasa dan Teknologi', 'Bernalar Kritis & Gotong Royong',
      'Peserta didik bergotong royong merekayasa purwarupa otomatisasi kelas pintar (lampu otomatis hemat energi & sensor suhu) untuk melatih daya cipta teknologi ramah lingkungan.',
      'Pemutaran video smart school di berbagai belahan dunia dan orientasi masalah pemborosan energi di sekolah (15 menit).',
      '1. Brainstorming perancangan solusi IoT sederhana.\n2. Pembuatan blok diagram sensor dan mikrokontroler simulator.\n3. Diferensiasi peran: arsitek hardware, perancang logika, dan presenter tim (100 menit).',
      'Refleksi dimensi profil pelajar Pancasila: Bernalar kritis dan gotong royong (15 menit).',
      'Asesmen Projek P5: Lembar observasi dimensi bergotong royong & rubrik purwarupa produk.',
      JSON.stringify([
        { label: 'Panduan Modul P5 Tema Rekayasa (Drive)', url: 'https://drive.google.com' },
        { label: 'Simulator Rangkaian IoT (Tinkercad)', url: 'https://tinkercad.com' }
      ])
    ],
    [
      'RPP-202610-007', teacherId, 'Pengantar Kecerdasan Artifisial & Etika Machine Learning', 'XII-IPA 2', 'Informatika',
      '2 JP x 45 Menit', 1, '2026/2027', 'Fase F', 'Intrakurikuler', '', '',
      'Peserta didik memahami konsep supervised vs unsupervised learning, cara kerja model klasifikasi data sederhana, serta isu etika bias data dan hak cipta pada era generatif AI.',
      'Eksperimen klasifikasi gambar interaktif menggunakan Teachable Machine (10 menit).',
      '1. Diskusi alur kerja pelatihan model (Dataset -> Training -> Testing -> Prediksi).\n2. Analisis studi kasus bias algoritma rekomendasi media sosial.\n3. Debat terarah tentang etika penggunaan AI dalam dunia akademik (65 menit).',
      'Penyusunan kesimpulan dan resume pemahaman kritis terhadap pemanfaatan AI (15 menit).',
      'Asesmen Formatif: Lembar analisis etika AI dan kuis pemahaman konsep.',
      JSON.stringify([
        { label: 'Teachable Machine Google (Web)', url: 'https://teachablemachine.withgoogle.com' },
        { label: 'E-Book Etika AI & Data Science (Drive)', url: 'https://drive.google.com' }
      ])
    ]
  ];
}

function getDummyMaterials(teacherId) {
  return [
    [
      'MAT-202610-001', teacherId, 'Algoritma Pemrograman & Diagram Alur (Flowchart)', 'Informatika', 'X-A (Fase E)',
      'Bab 1 - Berpikir Komputasional', '3 JP x 45 Menit', 'Dasar', 'Project-Based Learning (PBL)',
      'Peserta didik mampu mendesain diagram alur (flowchart) terstruktur dan pseudocode untuk menyelesaikan persoalan percabangan dan perulangan.',
      '1. Konsep dasar algoritma: Urutan langkah logis penyelesaian masalah.\n2. Simbol standar flowchart: Terminator (Mulai/Selesai), Input/Output (Jajar genjang), Proses (Persegi panjang), dan Decision (Belah ketupat).\n3. Kaidah percabangan If-Else dan iterasi perulangan.',
      JSON.stringify([
        { tipe: 'video', label: 'Simulasi Video Flowchart (YouTube)', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
        { tipe: 'doc', label: 'Slide Materi & E-Book Modul 1 (Drive)', url: 'https://drive.google.com' },
        { tipe: 'phet', label: 'Simulasi Logika Interaktif', url: 'https://phet.colorado.edu' }
      ]),
      'SCH-202610-001'
    ],
    [
      'MAT-202610-002', teacherId, 'Struktur Data Larik (Array 1D & 2D)', 'Informatika', 'XI-IPA 1',
      'Bab 2 - Algoritma Pemrograman Lanjut', '2 JP x 45 Menit', 'Menengah', 'Inkuiri Terbimbing',
      'Peserta didik memahami representasi data sejenis dalam memori menggunakan struktur larik dan operasi pencarian (Linear Search).',
      '1. Definisi Array: Kumpulan elemen bertipe data sama dengan indeks numerik berurutan.\n2. Zero-based indexing: Elemen pertama berindeks 0.\n3. Traversing array menggunakan perulangan for loop.',
      JSON.stringify([{ tipe: 'doc', label: 'Modul Praktikum Array & LKS (Drive)', url: 'https://docs.google.com' }]),
      'SCH-202610-002'
    ],
    [
      'MAT-202610-003', teacherId, 'Normalisasi Basis Data & Entity Relationship Diagram', 'Informatika', 'XII-IPA 2',
      'Bab 3 - Rekayasa Basis Data Relasional', '3 JP x 45 Menit', 'Menengah', 'Problem-Based Learning',
      'Peserta didik terampil merancang model konseptual ERD dan menerapkan tahapan normalisasi hingga 3NF.',
      '1. Entitas, Atribut, dan Relasi (1:1, 1:N, N:M).\n2. Aturan 1NF: Nilai atribut bersifat atomik.\n3. Aturan 2NF: Tidak ada ketergantungan parsial.\n4. Aturan 3NF: Tidak ada ketergantungan transitif.',
      JSON.stringify([
        { tipe: 'doc', label: 'Panduan Praktikum ERD & SQL (Drive)', url: 'https://drive.google.com' },
        { tipe: 'video', label: 'Tutorial Video Normalisasi Database (YouTube)', url: 'https://youtube.com' }
      ]),
      'SCH-202610-003'
    ],
    [
      'MAT-202610-004', teacherId, 'Kriptografi Kunci Simetris & Keamanan Akun Media Sosial', 'Informatika', 'X-A (Fase E)',
      'Bab 4 - Keamanan Informasi & Jaringan', '2 JP x 45 Menit', 'Dasar', 'Pembelajaran Kontekstual',
      'Peserta didik memahami prinsip enkripsi dan dekripsi untuk melindungi data pribadi di ruang siber.',
      '1. Perbedaan Plaintext dan Ciphertext.\n2. Algoritma substitusi klasik Caesar Cipher.\n3. Praktik pembuatan sandi kuat dan Two-Factor Authentication (2FA).',
      JSON.stringify([
        { tipe: 'doc', label: 'Lembar Latihan Sandi Kriptografi (Drive)', url: 'https://docs.google.com' },
        { tipe: 'phet', label: 'Simulator Enkripsi Teks Interaktif', url: 'https://cryptii.com' }
      ]),
      'SCH-202610-004'
    ],
    [
      'MAT-202610-005', teacherId, 'Desain Web Responsif dengan CSS Grid & Flexbox', 'Informatika', 'XI-IPA 1',
      'Bab 3 - Pengembangan Web Front-End', '3 JP x 45 Menit', 'Menengah', 'Project-Based Learning',
      'Peserta didik mampu menata tata letak antarmuka web modern yang adaptif di berbagai resolusi layar.',
      '1. Flexbox untuk tata letak linear 1 dimensi (navbar, tombol group).\n2. CSS Grid untuk tata letak 2 dimensi (dashboard, galeri foto).\n3. Media Queries untuk penyesuaian breakpoint layar HP.',
      JSON.stringify([
        { tipe: 'doc', label: 'Modul Praktikum CSS Grid (Drive)', url: 'https://drive.google.com' },
        { tipe: 'video', label: 'Video Panduan Responsive Web (YouTube)', url: 'https://youtube.com' }
      ]),
      'SCH-202610-006'
    ],
    [
      'MAT-202610-006', teacherId, 'Model Jaringan Saraf Tiruan & Etika Kecerdasan Buatan', 'Informatika', 'XII-IPA 2',
      'Bab 5 - Kecerdasan Artifisial & Masyarakat Digital', '2 JP x 45 Menit', 'Pengayaan', 'Diskusi Terbuka & Eksplorasi Mandiri',
      'Peserta didik menganalisis cara kerja dasar perceptron, pelatihan model AI, dan dampak etika otomasi.',
      '1. Struktur dasar Artificial Neural Network (Input, Hidden, Output Layer).\n2. Konsep bobot (weights), bias, dan fungsi aktivasi.\n3. Masalah bias algoritma, privasi data, dan hak cipta generatif AI.',
      JSON.stringify([
        { tipe: 'phet', label: 'Tinkering Model AI (TensorFlow Playground)', url: 'https://playground.tensorflow.org' },
        { tipe: 'doc', label: 'Kajian Akademik Etika AI Masa Depan (Drive)', url: 'https://drive.google.com' }
      ]),
      'SCH-202610-007'
    ],
    [
      'MAT-202610-007', teacherId, 'Kokurikuler P5: Analisis Daur Hidup & E-Waste Digital', 'Informatika', 'X-A (Fase E)',
      'Projek P5 - Rekayasa & Gaya Hidup Berkelanjutan', '4 JP x 45 Menit', 'Dasar', 'Service Learning & Kolaborasi',
      'Peserta didik memetakan bahaya limbah barang elektronik dan merancang kampanye daur ulang di sekolah.',
      '1. Kandungan logam berat pada komponen komputer usang.\n2. Alur daur ulang perangkat teknologi informasi.\n3. Perancangan infografis peduli sampah elektronik sekolah.',
      JSON.stringify([{ tipe: 'doc', label: 'Panduan Observasi E-Waste Sekolah (Drive)', url: 'https://docs.google.com' }]),
      'SCH-202610-005'
    ]
  ];
}

function getDummyQuestions(teacherId) {
  return [
    ['QST-202610-001', teacherId, 'MAT-202610-001', 'Pilihan Ganda', 'C4', 'HOTS', 15, 'Diberikan algoritma perulangan: nilai awal X = 5. Selama X < 20, lakukan X = X + 4 dan cetak nilai X.', 'Berdasarkan algoritma di atas, berapakah nilai akhir X yang tercetak pada layar tepat sebelum perulangan berhenti?', JSON.stringify(['17', '21', '25', '13', '20']), 'B', 'Iterasi 1: X = 5+4 = 9. Iterasi 2: X = 9+4 = 13. Iterasi 3: X = 13+4 = 17. Iterasi 4: X = 17+4 = 21. Karena 21 tidak lagi < 20, perulangan berhenti. Nilai terakhir yang tercetak adalah 21.'],
    ['QST-202610-002', teacherId, 'MAT-202610-001', 'Pilihan Ganda', 'C2', 'LOTS', 10, '', 'Simbol bagan alir (flowchart) yang digunakan untuk menyatakan proses pengambilan keputusan (kondisi percabangan) adalah...', JSON.stringify(['Persegi panjang', 'Jajar genjang', 'Belah ketupat (Diamond)', 'Lingkaran kecil', 'Oval / Kapsul']), 'C', 'Simbol belah ketupat (Decision) melambangkan titik percabangan kondisi True / False.'],
    ['QST-202610-003', teacherId, 'MAT-202610-002', 'Pilihan Ganda', 'C3', 'MOTS', 10, 'Diketahui array nilai = [70, 85, 90, 65, 88].', 'Berapakah nilai dari elemen nilai[2] pada sistem pengindeksan berbasis nol (zero-based index)?', JSON.stringify(['70', '85', '90', '65', '88']), 'C', 'Indeks 0 = 70, indeks 1 = 85, indeks 2 = 90.'],
    ['QST-202610-004', teacherId, 'MAT-202610-002', 'Esai', 'C5', 'HOTS', 25, 'Sebuah sistem basis data perpustakaan menyimpan 10.000 judul buku yang sudah terurut abjad. Guru meminta siswa memilih antara Linear Search atau Binary Search.', 'Analisis efisiensi algoritma: Mengapa Binary Search jauh lebih direkomendasikan dibanding Linear Search untuk kasus tersebut? Jelaskan perbandingan kompleksitas jumlah langkahnya!', '', '', 'Binary Search membagi ruang pencarian menjadi separuh di setiap langkah sehingga kompleksitasnya O(log n), sangat efisien untuk data terurut dibanding Linear Search O(n).'],
    ['QST-202610-005', teacherId, 'MAT-202610-001', 'Benar/Salah', 'C1', 'LOTS', 5, '', 'Konsep Dekomposisi dalam berpikir komputasional berarti memecah masalah kompleks menjadi bagian-bagian yang lebih kecil dan mudah dikelola.', JSON.stringify(['Benar', 'Salah']), 'A', 'Pernyataan tersebut benar sesuai prinsip dekomposisi pada Computational Thinking.'],
    ['QST-202610-006', teacherId, 'MAT-202610-002', 'Pilihan Ganda', 'C4', 'HOTS', 15, 'Potongan kode: total = 0; for(i=0; i<data.length; i++) { if(data[i] % 2 === 0) total += data[i]; } jika data = [2, 5, 8, 3, 10].', 'Berapakah nilai akhir dari variabel total setelah perulangan selesai?', JSON.stringify(['28', '20', '8', '10', '18']), 'B', 'Hanya angka genap yang dijumlahkan: 2 + 8 + 10 = 20.'],
    ['QST-202610-007', teacherId, 'MAT-202610-001', 'Pilihan Ganda', 'C3', 'MOTS', 10, '', 'Manakah penulisan pseudocode yang tepat untuk kondisi: "Jika usia minimal 17 tahun maka boleh membuat SIM, jika tidak maka belum boleh"?', JSON.stringify(['IF usia >= 17 THEN Print "Boleh SIM" ELSE Print "Belum Boleh"', 'WHILE usia >= 17 DO Print "Boleh SIM"', 'FOR usia = 1 TO 17 DO Print "Boleh SIM"', 'IF usia < 17 THEN Print "Boleh SIM" ELSE Print "Belum Boleh"', 'REPEAT Print "Boleh SIM" UNTIL usia >= 17']), 'A', 'Struktur IF-THEN-ELSE dengan kondisi usia >= 17 tepat merepresentasikan aturan tersebut.'],
    ['QST-202610-008', teacherId, 'MAT-202610-002', 'Esai', 'C3', 'MOTS', 20, '', 'Tuliskan algoritma pseudocode sederhana untuk menghitung nilai rata-rata dari tiga variabel masukan: nilaiA, nilaiB, dan nilaiC!', '', '', 'Rumus dasar rata-rata adalah penjumlahan dibagi dengan cacah data (3).'],
    ['QST-202610-009', teacherId, 'MAT-202610-003', 'Pilihan Ganda', 'C2', 'LOTS', 10, 'Dalam perancangan basis data relasional, setiap tabel wajib memiliki atribut yang membedakan satu baris dengan baris lainnya secara unik.', 'Atribut atau kolom yang berfungsi sebagai pengidentifikasi unik pada suatu entitas tabel disebut...', JSON.stringify(['Foreign Key', 'Primary Key', 'Candidate Index', 'Composite Field', 'Secondary Key']), 'B', 'Primary Key (Kunci Utama) adalah atribut yang secara unik mengidentifikasi setiap baris rekaman dalam tabel basis data.'],
    ['QST-202610-010', teacherId, 'MAT-202610-003', 'Pilihan Ganda', 'C4', 'HOTS', 15, 'Tabel Siswa (id_siswa, nama, id_kelas) dan Tabel Kelas (id_kelas, nama_kelas). Guru ingin menampilkan nama siswa beserta nama kelasnya, termasuk siswa yang belum memiliki kelas.', 'Klausa perintah SQL JOIN manakah yang paling tepat digunakan untuk kasus tersebut?', JSON.stringify(['INNER JOIN', 'LEFT OUTER JOIN', 'RIGHT OUTER JOIN', 'CROSS JOIN', 'NATURAL JOIN']), 'B', 'LEFT OUTER JOIN mempertahankan semua baris dari tabel kiri (Siswa) meskipun tidak memiliki pasangan yang cocok di tabel kanan (Kelas).'],
    ['QST-202610-011', teacherId, 'MAT-202610-003', 'Esai', 'C5', 'HOTS', 20, 'Sebuah tabel Transaksi menyimpan data: no_nota, tgl, id_barang, nama_barang, harga, qty, subtotal. Ditemukan anomali ketika harga barang diubah, riwayat nota lama ikut terdistorsi.', 'Jelaskan mengapa desain tabel tersebut melanggar aturan normalisasi bentuk kedua (2NF) dan bagaimanakah cara mendekomposisinya menjadi tabel-tabel yang sehat?', '', '', 'Bentuk normal 2NF mensyaratkan tidak ada atribut non-kunci yang bergantung secara parsial pada primary key.'],
    ['QST-202610-012', teacherId, 'MAT-202610-004', 'Benar/Salah', 'C2', 'LOTS', 5, '', 'Serangan rekayasa sosial (Social Engineering) seperti phishing berfokus pada manipulasi psikologis manusia daripada mengeksploitasi celah teknis perangkat lunak.', JSON.stringify(['Benar', 'Salah']), 'A', 'Pernyataan benar. Social engineering menargetkan kelemahan psikologis manusia untuk membocorkan kredensial rahasia.'],
    ['QST-202610-013', teacherId, 'MAT-202610-004', 'Pilihan Ganda', 'C3', 'MOTS', 10, 'Menggunakan algoritma Caesar Cipher dengan pergeseran kunci K = +3 (huruf A menjadi D, B menjadi E, dst.).', 'Apakah hasil enkripsi (ciphertext) dari kata "KODING"?', JSON.stringify(['NRGLQJ', 'MRFKPI', 'NSHMQJ', 'NRGMQI', 'LQEJOH']), 'A', 'K+3=N, O+3=R, D+3=G, I+3=L, N+3=Q, G+3=J. Hasil ciphertext = NRGLQJ.'],
    ['QST-202610-014', teacherId, 'MAT-202610-005', 'Pilihan Ganda', 'C3', 'MOTS', 10, 'Sebuah container div memiliki aturan CSS: display: flex; justify-content: center; align-items: center;.', 'Bagaimanakah posisi elemen-elemen anak (flex items) di dalam container tersebut?', JSON.stringify(['Rata kiri atas', 'Tepat di tengah-tengah container baik secara horizontal maupun vertikal', 'Menyebar di sisi kanan dan kiri secara merata', 'Menumpuk secara vertikal dari atas ke bawah', 'Rata kanan bawah']), 'B', 'justify-content: center mengatur perataan sumbu utama (horizontal), sedangkan align-items: center mengatur perataan sumbu silang (vertikal).'],
    ['QST-202610-015', teacherId, 'MAT-202610-005', 'Pilihan Ganda', 'C4', 'HOTS', 15, 'Aturan CSS Grid: grid-template-columns: 1fr 2fr 1fr; pada kontainer berlebar total 1200px (tanpa gap).', 'Berapakah lebar kolom kedua (tengah) yang dihasilkan pada layar?', JSON.stringify(['300px', '400px', '600px', '800px', '200px']), 'C', 'Total fraksi = 1 + 2 + 1 = 4fr. Setiap 1fr = 1200 / 4 = 300px. Kolom kedua memiliki nilai 2fr = 2 x 300px = 600px.'],
    ['QST-202610-016', teacherId, 'MAT-202610-007', 'Esai', 'C6', 'HOTS', 25, 'Laboratorium komputer sekolah sering mengalami kenaikan suhu drastis di luar jam pelajaran yang berpotensi merusak server sekolah.', 'Rancanglah diagram blok alur logika sistem IoT sederhana: sebutkan sensor input yang dibutuhkan, mikrokontroler pengolah data, dan aktuator output untuk menyalakan pendingin darurat serta mengirimkan notifikasi!', '', '', 'Desain mencakup 4 pilar arsitektur IoT: Sensor (Data Capture), Microcontroller (Processing), Actuator (Action), dan Connectivity (Telemetry/Alert).'],
    ['QST-202610-017', teacherId, 'MAT-202610-006', 'Benar/Salah', 'C2', 'LOTS', 5, '', 'Dalam paradigma Supervised Learning, model kecerdasan buatan dilatih menggunakan dataset yang telah memiliki label kebenaran (ground truth).', JSON.stringify(['Benar', 'Salah']), 'A', 'Pernyataan benar. Supervised learning (pembelajaran terbimbing) mensyaratkan data input berpasangan dengan label target yang benar.'],
    ['QST-202610-018', teacherId, 'MAT-202610-006', 'Esai', 'C5', 'HOTS', 20, 'Sebuah perusahaan menggunakan sistem AI penyaring resume kerja otomatis yang secara konsisten menolak kandidat perempuan untuk posisi teknis karena dilatih menggunakan data lama yang didominasi laki-laki.', 'Lakukan analisis etika: Fenomena apakah yang terjadi pada sistem AI tersebut? Bagaimanakah cara tim pengembang mengatasi dan mencegah bias data (algorithmic bias) tersebut?', '', '', 'Algoritma machine learning mencerminkan bias yang ada pada data pelatihannya jika tidak dilakukan kurasi etis dan pengujian fairness.']
  ];
}

function getDummyAssessmentPackages(teacherId) {
  var todayStr = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd');
  return [
    ['PKG-202610-001', teacherId, 'Penilaian Formatif Bab 1 - Berpikir Komputasional', 'X-A (Fase E)', 'Informatika', 45, todayStr, JSON.stringify(['QST-202610-001', 'QST-202610-002', 'QST-202610-005', 'QST-202610-007', 'QST-202610-008'])],
    ['PKG-202610-002', teacherId, 'Penilaian Tengah Semester (PTS/STS) Ganjil Informatika', 'X-A (Fase E)', 'Informatika', 90, '2026-11-10', JSON.stringify(['QST-202610-001', 'QST-202610-002', 'QST-202610-004', 'QST-202610-005', 'QST-202610-006', 'QST-202610-007', 'QST-202610-012', 'QST-202610-013'])],
    ['PKG-202610-003', teacherId, 'Asesmen Sumatif Struktur Data & Pemrograman Web', 'XI-IPA 1', 'Informatika', 60, todayStr, JSON.stringify(['QST-202610-003', 'QST-202610-004', 'QST-202610-006', 'QST-202610-008', 'QST-202610-014', 'QST-202610-015'])],
    ['PKG-202610-004', teacherId, 'Try Out Asesmen Sekolah: Basis Data & Algoritma Lanjut', 'XII-IPA 2', 'Informatika', 90, '2026-12-08', JSON.stringify(['QST-202610-004', 'QST-202610-009', 'QST-202610-010', 'QST-202610-011', 'QST-202610-016', 'QST-202610-017', 'QST-202610-018'])],
    ['PKG-202610-005', teacherId, 'Asesmen Diagnostik Kesiapan Belajar Pemrograman Web', 'XI-IPA 1', 'Informatika', 30, todayStr, JSON.stringify(['QST-202610-002', 'QST-202610-003', 'QST-202610-007', 'QST-202610-014'])]
  ];
}

function getDummyTimetable(teacherId) {
  return [
    ['SCH-202610-001', teacherId, 'Senin', '07:30', '09:45', 'X-A (Fase E)', 'Informatika', 'Lab Komputer 1', 'emerald'],
    ['SCH-202610-002', teacherId, 'Senin', '10:15', '11:45', 'XI-IPA 1', 'Informatika', 'R. 204', 'sky'],
    ['SCH-202610-003', teacherId, 'Selasa', '08:15', '10:30', 'XII-IPA 2', 'Informatika', 'Lab Komputer 2', 'indigo'],
    ['SCH-202610-004', teacherId, 'Rabu', '07:30', '09:45', 'X-A (Fase E)', 'Informatika', 'R. 101', 'emerald'],
    ['SCH-202610-005', teacherId, 'Rabu', '10:15', '11:45', 'X-A (Fase E)', 'P5 Rekayasa & Teknologi', 'Ruang Multimedia', 'amber'],
    ['SCH-202610-006', teacherId, 'Kamis', '10:15', '12:30', 'XI-IPA 1', 'Informatika', 'Lab Komputer 1', 'sky'],
    ['SCH-202610-007', teacherId, 'Jumat', '08:00', '09:30', 'XII-IPA 2', 'Informatika', 'Lab Komputer 2', 'indigo'],
    ['SCH-202610-008', teacherId, 'Jumat', '09:45', '11:15', 'XI-IPA 1', 'Praktikum Web & Portofolio', 'Lab Komputer 1', 'rose']
  ];
}

function getDummyAcademicEvents(teacherId) {
  return [
    ['EVT-202610-001', teacherId, '2026-10-20', 'Supervisi Pembelajaran Kepala Sekolah', 'KegiatanSekolah', 'Kesiapan RPP Modul Ajar Fase E & Buku Nilai Digital.'],
    ['EVT-202610-002', teacherId, '2026-10-28', 'Hari Sumpah Pemuda (Upacara Bendera)', 'KegiatanSekolah', 'Upacara peringatan nasional di lapangan utama sekolah.'],
    ['EVT-202610-003', teacherId, '2026-11-10', 'Penilaian Tengah Semester (PTS/STS) Ganjil', 'Ujian', 'Jadwal tes sumatif tengah semester ganjil T.A. 2026/2027.'],
    ['EVT-202610-004', teacherId, '2026-11-20', 'Workshop Kurikulum Merdeka & P5 Mandiri Berbagi', 'KegiatanSekolah', 'Diseminasi praktik baik modul ajar dan pameran karya siswa.'],
    ['EVT-202610-005', teacherId, '2026-12-05', 'Pekan Pengolahan Nilai & Remedial Terpadu', 'Ujian', 'Batas akhir input nilai formatif dan pelaksanaan remedial kelas.'],
    ['EVT-202610-006', teacherId, '2026-12-08', 'Penilaian Akhir Semester (PAS/SAS) Ganjil', 'Ujian', 'Evaluasi sumatif akhir semester serentak seluruh jenjang.'],
    ['EVT-202610-007', teacherId, '2026-12-18', 'Penerimaan Buku Rapor Semester Ganjil', 'KegiatanSekolah', 'Pertemuan pleno evaluasi bersama orang tua / wali murid.'],
    ['EVT-202610-008', teacherId, '2026-12-21', 'Libur Semester Ganjil T.A. 2026/2027', 'KegiatanSekolah', 'Masa libur semester hingga awal Januari 2027.']
  ];
}

function getDummyAttendance(teacherId) {
  var todayStr = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd');
  var prevDate = Utilities.formatDate(new Date(Date.now() - 86400000 * 3), 'Asia/Jakarta', 'yyyy-MM-dd');

  var r1 = { 'SIS-202610-001': 'H', 'SIS-202610-002': 'H', 'SIS-202610-003': 'H', 'SIS-202610-004': 'I', 'SIS-202610-005': 'H', 'SIS-202610-006': 'H', 'SIS-202610-007': 'S', 'SIS-202610-008': 'H', 'SIS-202610-009': 'H', 'SIS-202610-010': 'H' };
  var r2 = { 'SIS-202610-001': 'H', 'SIS-202610-002': 'H', 'SIS-202610-003': 'H', 'SIS-202610-004': 'H', 'SIS-202610-005': 'H', 'SIS-202610-006': 'H', 'SIS-202610-007': 'H', 'SIS-202610-008': 'H', 'SIS-202610-009': 'S', 'SIS-202610-010': 'H' };
  var r3 = { 'SIS-202610-011': 'H', 'SIS-202610-012': 'H', 'SIS-202610-013': 'H', 'SIS-202610-014': 'H', 'SIS-202610-015': 'S', 'SIS-202610-016': 'H', 'SIS-202610-017': 'H', 'SIS-202610-018': 'H', 'SIS-202610-019': 'H', 'SIS-202610-020': 'H' };
  var r4 = { 'SIS-202610-011': 'H', 'SIS-202610-012': 'H', 'SIS-202610-013': 'I', 'SIS-202610-014': 'H', 'SIS-202610-015': 'H', 'SIS-202610-016': 'H', 'SIS-202610-017': 'H', 'SIS-202610-018': 'H', 'SIS-202610-019': 'H', 'SIS-202610-020': 'H' };
  var r5 = { 'SIS-202610-021': 'H', 'SIS-202610-022': 'H', 'SIS-202610-023': 'H', 'SIS-202610-024': 'H', 'SIS-202610-025': 'H', 'SIS-202610-026': 'H', 'SIS-202610-027': 'I', 'SIS-202610-028': 'H', 'SIS-202610-029': 'H', 'SIS-202610-030': 'H' };
  var r6 = { 'SIS-202610-021': 'H', 'SIS-202610-022': 'H', 'SIS-202610-023': 'H', 'SIS-202610-024': 'H', 'SIS-202610-025': 'H', 'SIS-202610-026': 'H', 'SIS-202610-027': 'H', 'SIS-202610-028': 'H', 'SIS-202610-029': 'H', 'SIS-202610-030': 'H' };

  return [
    ['ABS-202610-001', teacherId, 'X-A (Fase E)', todayStr, 8, 1, 1, 0, JSON.stringify(r1)],
    ['ABS-202610-002', teacherId, 'X-A (Fase E)', prevDate, 9, 1, 0, 0, JSON.stringify(r2)],
    ['ABS-202610-003', teacherId, 'XI-IPA 1', todayStr, 9, 1, 0, 0, JSON.stringify(r3)],
    ['ABS-202610-004', teacherId, 'XI-IPA 1', prevDate, 9, 0, 1, 0, JSON.stringify(r4)],
    ['ABS-202610-005', teacherId, 'XII-IPA 2', todayStr, 9, 0, 1, 0, JSON.stringify(r5)],
    ['ABS-202610-006', teacherId, 'XII-IPA 2', prevDate, 10, 0, 0, 0, JSON.stringify(r6)]
  ];
}

function getDummyGradebook(teacherId) {
  return [
    // X-A (Fase E)
    [teacherId, 'SIS-202610-001', 'X-A (Fase E)', JSON.stringify([88, 90]), 92, 88, 89.5],
    [teacherId, 'SIS-202610-002', 'X-A (Fase E)', JSON.stringify([85, 88]), 89, 90, 88.7],
    [teacherId, 'SIS-202610-003', 'X-A (Fase E)', JSON.stringify([75, 78]), 76, 78, 76.9],
    [teacherId, 'SIS-202610-004', 'X-A (Fase E)', JSON.stringify([90, 92]), 94, 92, 92.3],
    [teacherId, 'SIS-202610-005', 'X-A (Fase E)', JSON.stringify([92, 95]), 95, 94, 94.2],
    [teacherId, 'SIS-202610-006', 'X-A (Fase E)', JSON.stringify([82, 85]), 83, 86, 84.4],
    [teacherId, 'SIS-202610-007', 'X-A (Fase E)', JSON.stringify([80, 82]), 80, 82, 81.1],
    [teacherId, 'SIS-202610-008', 'X-A (Fase E)', JSON.stringify([86, 88]), 87, 88, 87.4],
    [teacherId, 'SIS-202610-009', 'X-A (Fase E)', JSON.stringify([78, 80]), 82, 84, 81.9],
    [teacherId, 'SIS-202610-010', 'X-A (Fase E)', JSON.stringify([91, 94]), 92, 95, 93.4],

    // XI-IPA 1
    [teacherId, 'SIS-202610-011', 'XI-IPA 1', JSON.stringify([89, 92]), 90, 93, 91.4],
    [teacherId, 'SIS-202610-012', 'XI-IPA 1', JSON.stringify([94, 96]), 95, 96, 95.4],
    [teacherId, 'SIS-202610-013', 'XI-IPA 1', JSON.stringify([80, 84]), 82, 85, 83.2],
    [teacherId, 'SIS-202610-014', 'XI-IPA 1', JSON.stringify([87, 89]), 88, 90, 88.8],
    [teacherId, 'SIS-202610-015', 'XI-IPA 1', JSON.stringify([68, 70]), 65, 70, 68.2],
    [teacherId, 'SIS-202610-016', 'XI-IPA 1', JSON.stringify([88, 90]), 89, 91, 89.8],
    [teacherId, 'SIS-202610-017', 'XI-IPA 1', JSON.stringify([92, 94]), 93, 95, 93.8],
    [teacherId, 'SIS-202610-018', 'XI-IPA 1', JSON.stringify([85, 87]), 86, 88, 86.8],
    [teacherId, 'SIS-202610-019', 'XI-IPA 1', JSON.stringify([83, 86]), 85, 87, 85.7],
    [teacherId, 'SIS-202610-020', 'XI-IPA 1', JSON.stringify([90, 93]), 91, 94, 92.4],

    // XII-IPA 2
    [teacherId, 'SIS-202610-021', 'XII-IPA 2', JSON.stringify([90, 92]), 94, 95, 93.5],
    [teacherId, 'SIS-202610-022', 'XII-IPA 2', JSON.stringify([95, 98]), 96, 97, 96.6],
    [teacherId, 'SIS-202610-023', 'XII-IPA 2', JSON.stringify([86, 88]), 87, 89, 87.8],
    [teacherId, 'SIS-202610-024', 'XII-IPA 2', JSON.stringify([92, 95]), 93, 94, 93.5],
    [teacherId, 'SIS-202610-025', 'XII-IPA 2', JSON.stringify([78, 80]), 79, 82, 80.2],
    [teacherId, 'SIS-202610-026', 'XII-IPA 2', JSON.stringify([94, 96]), 95, 96, 95.4],
    [teacherId, 'SIS-202610-027', 'XII-IPA 2', JSON.stringify([84, 86]), 85, 88, 86.2],
    [teacherId, 'SIS-202610-028', 'XII-IPA 2', JSON.stringify([89, 91]), 90, 92, 91.1],
    [teacherId, 'SIS-202610-029', 'XII-IPA 2', JSON.stringify([82, 85]), 84, 86, 84.7],
    [teacherId, 'SIS-202610-030', 'XII-IPA 2', JSON.stringify([96, 98]), 97, 99, 97.8]
  ];
}

function getDummyTasks(teacherId) {
  return [
    ['TSK-202610-001', teacherId, 'Koreksi Lembar Kerja Praktikum Logika Algoritma', 'X-A (Fase E)', 32, 24, '2026-10-22', 'Pending'],
    ['TSK-202610-002', teacherId, 'Penilaian Proyek Website HTML & CSS Responsif', 'XI-IPA 1', 30, 30, '2026-10-18', 'Selesai'],
    ['TSK-202610-003', teacherId, 'Koreksi Soal Esai Desain Basis Data & Normalisasi ERD', 'XII-IPA 2', 28, 14, '2026-10-25', 'Pending'],
    ['TSK-202610-004', teacherId, 'Penilaian Portofolio Laporan Analisis Keamanan Jejak Digital', 'X-A (Fase E)', 32, 0, '2026-10-27', 'Pending'],
    ['TSK-202610-005', teacherId, 'Praktikum SQL Query Multi-Tabel & View Relasional', 'XII-IPA 2', 28, 28, '2026-10-15', 'Selesai'],
    ['TSK-202610-006', teacherId, 'Evaluasi Rancangan Purwarupa IoT Kelas Pintar P5', 'X-A (Fase E)', 10, 6, '2026-10-29', 'Pending']
  ];
}

function getDummyMeetings(teacherId) {
  return [
    ['MTG-202610-001', teacherId, '2026-10-14', 'Rapat Koordinasi MGMP Informatika Kota', 'Penyelarasan modul ajar berbasis Kurikulum Merdeka semester ganjil, pemetaan capaian pembelajaran fase E & F, dan penyusunan kisi-kisi PTS bersama.'],
    ['MTG-202610-002', teacherId, '2026-10-08', 'Rapat Dewan Guru & Evaluasi Kedisiplinan Siswa', 'Penguatan penertiban kehadiran siswa di jam pertama, persiapan penilaian kinerja guru oleh pengawas, dan sosialisasi program anti-perundungan.'],
    ['MTG-202610-003', teacherId, '2026-10-02', 'Workshop Pemanfaatan AI Generatif dalam Pembelajaran', 'Pelatihan pembuatan media ajar berdiferensiasi dan etika pemanfaatan kecerdasan buatan bagi pendidik.'],
    ['MTG-202610-004', teacherId, '2026-09-24', 'Rapat Koordinasi Supervisi Akademik Semester Ganjil', 'Penyamaan persepsi rubrik supervisi kepala sekolah, kelengkapan administrasi guru (modul ajar, buku nilai, jurnal refleksi), dan jadwal kunjungan kelas.'],
    ['MTG-202610-005', teacherId, '2026-09-15', 'Evaluasi Awal Pembelajaran & Pemetaan Minat Ekstrakurikuler', 'Pembagian tugas pembimbing olimpiade informatika dan rekapitulasi data sarana prasarana lab komputer.']
  ];
}

function getDummyReflections(teacherId) {
  return [
    ['REF-202610-001', teacherId, '2026-10-15', 'X-A (Fase E)', 'Berpikir Komputasional', 'Siswa sangat aktif saat studi kasus teka-teki logika rute terpendek. Namun perlu alokasi waktu lebih panjang saat penulisan pseudocode agar siswa tidak terburu-buru dan logika terstruktur terbangun baik.'],
    ['REF-202610-002', teacherId, '2026-10-12', 'XI-IPA 1', 'Struktur Data Larik (Array)', 'Metode analogi loker bernomor sangat efektif membantu siswa memahami konsep zero-based indexing. Pada pertemuan berikutnya, perlu latihan mandiri untuk perulangan bersarang pada matriks 2D.'],
    ['REF-202610-003', teacherId, '2026-10-09', 'XII-IPA 2', 'Desain Basis Data Relasional & Normalisasi', 'Mayoritas siswa antusias memodelkan database e-commerce. Kendala muncul saat membedakan 2NF dan 3NF pada ketergantungan transitif. Solusi: berikan contoh tabel struk kasir nyata.'],
    ['REF-202610-004', teacherId, '2026-10-05', 'X-A (Fase E)', 'Keamanan Siber & Enkripsi', 'Simulasi manual kriptografi Caesar Cipher membuat suasana kelas sangat hidup. Siswa saling memecahkan pesan sandi kelompok lain dengan kompetitif dan gembira.'],
    ['REF-202610-005', teacherId, '2026-09-28', 'XI-IPA 1', 'Desain Web CSS Grid', 'Praktikum berjalan lancar. Beberapa siswa kesulitan memahami unit 1fr pada layout grid kompleks. Perlu disediakan kartu contekan visual (cheatsheet) sebelum praktikum dimulai.']
  ];
}


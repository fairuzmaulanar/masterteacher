  /**
  * ============================================================================
  * BACKEND CONTROLLER & REST API WEB APP - MASTER TEACHER PLANNER
  * ============================================================================
  * Engine: ZettBOT Core v4.1 (by Zettbos)
  * Target: Google Apps Script Web App Endpoint (JSON API)
  * Standar:
  *   - Membaca data menggunakan getDisplayValues() (bebas distorsi UTC vs GMT+7)
  *   - Konstanta pemetaan kolom berbasis indeks (COL) kebal modifikasi teks header
  *   - LockService.getScriptLock() untuk integritas data multi-user
  *   - SpreadsheetApp.flush() setelah setiap mutasi data
  *   - Format JSON murni dengan penanganan Cross-Origin Resource Sharing (CORS)
  * ============================================================================
  */

  // Konstanta Pemetaan Kolom (0-Based Index)
  var COL_GURU = {
    ID: 0, NAMA: 1, EMAIL: 2, PASS: 3, NIP: 4, MAPEL: 5,
    SEKOLAH: 6, ALAMAT: 7, TELP: 8, EMAIL_SEK: 9, WEB_SEK: 10,
    KEPSEK: 11, NIP_KEPSEK: 12, LOGO: 13, CREATED_AT: 14
  };

  var COL_SISWA = {
    ID: 0, ID_GURU: 1, KELAS: 2, NISN: 3, NAMA: 4, JK: 5,
    ROW: 6, COL: 7, CATATAN: 8
  };

  var COL_RPP = {
    ID: 0, ID_GURU: 1, MATERI: 2, KELAS: 3, MAPEL: 4, ALOKASI: 5,
    SEMESTER: 6, TAHUN: 7, FASE: 8, KOMPONEN: 9, P5_TEMA: 10, P5_DIMENSI: 11,
    TP: 12, PEMBUKA: 13, INTI: 14, PENUTUP: 15, ASESMEN: 16, LINKS_JSON: 17
  };

  var COL_MATERI = {
    ID: 0, ID_GURU: 1, JUDUL: 2, MAPEL: 3, KELAS: 4, TOPIK: 5,
    ALOKASI: 6, KESULITAN: 7, MODEL: 8, CP_TP: 9, RINGKASAN: 10,
    MEDIA_JSON: 11, SCHEDULE_ID: 12
  };

  var COL_SOAL = {
    ID: 0, ID_GURU: 1, ID_MATERI: 2, TIPE: 3, BLOOM: 4, KOGNITIF: 5,
    SKOR: 6, STIMULUS: 7, PERTANYAAN: 8, OPSI_JSON: 9, KUNCI: 10, PEMBAHASAN: 11
  };

  var COL_PAKET = {
    ID: 0, ID_GURU: 1, JUDUL: 2, KELAS: 3, MAPEL: 4, WAKTU: 5,
    TANGGAL: 6, SOAL_IDS_JSON: 7
  };

  var COL_JADWAL = {
    ID: 0, ID_GURU: 1, HARI: 2, MULAI: 3, SELESAI: 4, KELAS: 5,
    MAPEL: 6, RUANGAN: 7, WARNA: 8
  };

  var COL_AGENDA = {
    ID: 0, ID_GURU: 1, TANGGAL: 2, JUDUL: 3, KATEGORI: 4, KETERANGAN: 5
  };

  var COL_PRESENSI = {
    ID: 0, ID_GURU: 1, KELAS: 2, TANGGAL: 3, HADIR: 4, SAKIT: 5,
    IZIN: 6, ALPA: 7, RECORDS_JSON: 8
  };

  var COL_NILAI = {
    ID_GURU: 0, ID_SISWA: 1, KELAS: 2, TUGAS_JSON: 3, UTS: 4, UAS: 5, AKHIR: 6
  };

  var COL_TUGAS = {
    ID: 0, ID_GURU: 1, JUDUL: 2, KELAS_MAPEL: 3, TOTAL: 4,
    SELESAI: 5, DEADLINE: 6, STATUS: 7
  };

  var COL_RAPAT = {
    ID: 0, ID_GURU: 1, TANGGAL: 2, JUDUL: 3, HASIL: 4
  };

  var COL_REFLEKSI = {
    ID: 0, ID_GURU: 1, TANGGAL: 2, KELAS: 3, MATERI: 4, ISI: 5
  };

  var COL_PENGATURAN = {
    ID_GURU: 0, CLASSES_JSON: 1, WEIGHTS_JSON: 2, AI_KEY: 3, LAST_SYNC: 4
  };

  /**
  * Endpoint Utama GET: Menerima query parameter ?action=...
  */
  function doGet(e) {
    try {
      var params = (e && e.parameter) ? e.parameter : {};
      var action = params.action || 'ping';

      switch (action) {
        case 'ping':
          return handlePing();

        case 'setup':
          var setupRes = setupDatabase();
          return createJsonResponse(setupRes);

        case 'getTeachers':
          return handleGetTeachers();

        case 'getTeacherData':
          var teacherId = params.teacherId;
          if (!teacherId) return createJsonResponse({ status: 'error', message: 'Parameter teacherId wajib diisi.' });
          return handleGetTeacherData(teacherId);

        default:
          return createJsonResponse({
            status: 'error',
            message: 'Aksi GET "' + action + '" tidak dikenali.'
          });
      }
    } catch (err) {
      return createJsonResponse({ status: 'error', message: err.toString(), stack: err.stack });
    }
  }

  /**
  * Endpoint Utama POST: Menerima payload JSON di dalam body
  */
  function doPost(e) {
    var lock = LockService.getScriptLock();
    try {
      // Kunci eksekusi selama maksimal 25 detik agar aman dari race condition multi-user
      lock.waitLock(25000);

      var payload = {};
      if (e && e.postData && e.postData.contents) {
        try {
          payload = JSON.parse(e.postData.contents);
        } catch (pe) {
          payload = e.parameter || {};
        }
      } else if (e && e.parameter) {
        payload = e.parameter;
      }

      var action = payload.action || 'ping';

      switch (action) {
        case 'ping':
          return handlePing();

        case 'setup':
          var setupRes = setupDatabase();
          return createJsonResponse(setupRes);

        case 'login':
          return handleLogin(payload.email, payload.password);

        case 'registerTeacher':
          return handleRegisterTeacher(payload.teacher);

        case 'saveTeacherProfile':
          return handleSaveTeacherProfile(payload.teacher);

        case 'saveTeacherData':
          return handleSaveTeacherData(payload.teacherId, payload.data);

        case 'syncAll':
          return handleSyncAll(payload.teacherId, payload.data);

        default:
          return createJsonResponse({
            status: 'error',
            message: 'Aksi POST "' + action + '" tidak dikenali.'
          });
      }
    } catch (err) {
      return createJsonResponse({ status: 'error', message: err.toString(), stack: err.stack });
    } finally {
      try { lock.releaseLock(); } catch (le) {}
    }
  }

  /**
  * Helper: Format output JSON resmi dengan header CORS
  */
  function createJsonResponse(data) {
    return ContentService.createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
  }

  /**
  * Aksi: Ping status database
  */
  function handlePing() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetGuru = ss.getSheetByName('DataGuru');
    var teacherCount = sheetGuru ? Math.max(0, sheetGuru.getLastRow() - 1) : 0;

    return createJsonResponse({
      status: 'success',
      message: 'Database Master Teacher Planner Cloud Aktif & Siap Digunakan.',
      version: '2.0.0',
      spreadsheetName: ss.getName(),
      spreadsheetId: ss.getId(),
      serverTime: Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss'),
      teacherCount: teacherCount
    });
  }

  /**
  * Aksi: Autentikasi guru via Email & Password/PIN
  */
  function handleLogin(email, password) {
    if (!email || !password) {
      return createJsonResponse({ status: 'error', message: 'Email dan kata sandi wajib diisi.' });
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('DataGuru');
    if (!sheet || sheet.getLastRow() <= 1) {
      return createJsonResponse({ status: 'error', message: 'Belum ada data guru terdaftar di database.' });
    }

    var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getDisplayValues();
    var cleanEmail = email.toString().trim().toLowerCase();
    var cleanPass = password.toString().trim();

    for (var i = 0; i < values.length; i++) {
      var row = values[i];
      var dbEmail = (row[COL_GURU.EMAIL] || '').trim().toLowerCase();
      var dbNip = (row[COL_GURU.NIP] || '').trim();
      var dbPass = (row[COL_GURU.PASS] || '').trim();

      // Cocokkan email atau NIP dengan kata sandi
      if ((dbEmail === cleanEmail || dbNip === cleanEmail) && dbPass === cleanPass) {
        var teacherProfile = mapTeacherRowToProfile(row);
        return createJsonResponse({
          status: 'success',
          message: 'Login berhasil.',
          teacher: teacherProfile
        });
      }
    }

    return createJsonResponse({
      status: 'error',
      message: 'Email atau kata sandi tidak cocok. Silakan periksa kembali.'
    });
  }

  /**
  * Aksi: Mengambil daftar guru publik (untuk modal beralih akun)
  */
  function handleGetTeachers() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('DataGuru');
    if (!sheet || sheet.getLastRow() <= 1) {
      return createJsonResponse({ status: 'success', teachers: [] });
    }

    var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getDisplayValues();
    var teachers = [];
    for (var i = 0; i < values.length; i++) {
      teachers.push(mapTeacherRowToProfile(values[i]));
    }

    return createJsonResponse({ status: 'success', teachers: teachers });
  }

  /**
  * Helper: Mengonversi baris sheet DataGuru ke object profile
  */
  function mapTeacherRowToProfile(row) {
    return {
      id: row[COL_GURU.ID],
      namaLengkap: row[COL_GURU.NAMA],
      email: row[COL_GURU.EMAIL],
      nip: row[COL_GURU.NIP],
      mataPelajaran: row[COL_GURU.MAPEL],
      namaSekolah: row[COL_GURU.SEKOLAH],
      alamatSekolah: row[COL_GURU.ALAMAT],
      teleponSekolah: row[COL_GURU.TELP],
      emailSekolah: row[COL_GURU.EMAIL_SEK],
      websiteSekolah: row[COL_GURU.WEB_SEK],
      namaKepalaSekolah: row[COL_GURU.KEPSEK],
      nipKepalaSekolah: row[COL_GURU.NIP_KEPSEK],
      logoSekolah: row[COL_GURU.LOGO],
      createdAt: row[COL_GURU.CREATED_AT]
    };
  }

  /**
  * Aksi: Pendaftaran Guru Baru
  */
  function handleRegisterTeacher(teacher) {
    if (!teacher || !teacher.email || !teacher.namaLengkap) {
      return createJsonResponse({ status: 'error', message: 'Data pendaftaran guru tidak lengkap.' });
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('DataGuru');
    if (!sheet) {
      setupDatabase();
      sheet = ss.getSheetByName('DataGuru');
    }

    var cleanEmail = (teacher.email || '').trim().toLowerCase();
    var values = sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getDisplayValues() : [];

    // Periksa apakah email sudah terdaftar
    for (var i = 0; i < values.length; i++) {
      if ((values[i][COL_GURU.EMAIL] || '').trim().toLowerCase() === cleanEmail) {
        return createJsonResponse({ status: 'error', message: 'Alamat email sudah terdaftar di sistem.' });
      }
    }

    var teacherId = teacher.id || ('GURU-' + Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyyMM') + '-' + String(values.length + 1).padStart(3, '0'));
    var row = [
      teacherId,
      teacher.namaLengkap,
      cleanEmail,
      teacher.password || '1234',
      teacher.nip || '',
      teacher.mataPelajaran || '',
      teacher.namaSekolah || 'SMA Negeri 1 Harapan Nusantara',
      teacher.alamatSekolah || 'Jl. Pendidikan Karakter Bangsa No. 45',
      teacher.teleponSekolah || '(021) 7890123',
      teacher.emailSekolah || 'tatausaha@sekolah.sch.id',
      teacher.websiteSekolah || '',
      teacher.namaKepalaSekolah || 'Dr. H. Bambang Sudarsono, M.Pd.',
      teacher.nipKepalaSekolah || '19760415 200212 1 003',
      teacher.logoSekolah || '',
      new Date().toISOString()
    ];

    sheet.appendRow(row);
    SpreadsheetApp.flush();

    return createJsonResponse({
      status: 'success',
      message: 'Pendaftaran guru berhasil.',
      teacher: mapTeacherRowToProfile(row)
    });
  }

  /**
  * Aksi: Simpan / Perbarui Profil Sekolah & Guru (Mekanisme UPSERT: Tambah jika belum ada)
  */
  function handleSaveTeacherProfile(teacher) {
    if (!teacher || !teacher.id) {
      return createJsonResponse({ status: 'error', message: 'Data guru tidak valid atau ID guru kosong.' });
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('DataGuru');
    if (!sheet) {
      setupDatabase();
      sheet = ss.getSheetByName('DataGuru');
    }

    var lastRow = sheet.getLastRow();
    var values = lastRow > 1 ? sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getDisplayValues() : [];
    var targetRowIdx = -1;

    for (var i = 0; i < values.length; i++) {
      if (values[i][COL_GURU.ID] === teacher.id) {
        targetRowIdx = i + 2; // +2 karena 1-based dan header di baris 1
        break;
      }
    }

    // MEKANISME UPSERT: Jika profil guru belum terdaftar di DataGuru, otomatis tambahkan baris baru!
    if (targetRowIdx === -1) {
      var newTeacherRow = [
        teacher.id,
        teacher.namaLengkap || 'Guru Pengajar',
        (teacher.email || '').trim().toLowerCase(),
        teacher.password || teacher.pin || '1234',
        teacher.nip || '-',
        teacher.mataPelajaran || 'Guru Mata Pelajaran',
        teacher.namaSekolah || 'Sekolah',
        teacher.alamatSekolah || 'Jl. Pendidikan Karakter Bangsa No. 45',
        teacher.teleponSekolah || '(021) 7890123',
        teacher.emailSekolah || 'tatausaha@sekolah.sch.id',
        teacher.websiteSekolah || '',
        teacher.namaKepalaSekolah || 'Dr. H. Bambang Sudarsono, M.Pd.',
        teacher.nipKepalaSekolah || '19760415 200212 1 003',
        teacher.logoSekolah || '',
        teacher.createdAt || new Date().toISOString()
      ];

      sheet.appendRow(newTeacherRow);
      SpreadsheetApp.flush();

      return createJsonResponse({
        status: 'success',
        message: 'Profil guru baru berhasil didaftarkan ke lembar DataGuru Google Sheets.',
        teacher: mapTeacherRowToProfile(newTeacherRow)
      });
    }

    // Jika guru sudah ada, perbarui kolom-kolom profil
    if (teacher.namaLengkap !== undefined) sheet.getRange(targetRowIdx, COL_GURU.NAMA + 1).setValue(teacher.namaLengkap);
    if (teacher.email !== undefined) sheet.getRange(targetRowIdx, COL_GURU.EMAIL + 1).setValue(teacher.email);
    if (teacher.nip !== undefined) sheet.getRange(targetRowIdx, COL_GURU.NIP + 1).setValue(teacher.nip);
    if (teacher.mataPelajaran !== undefined) sheet.getRange(targetRowIdx, COL_GURU.MAPEL + 1).setValue(teacher.mataPelajaran);
    if (teacher.namaSekolah !== undefined) sheet.getRange(targetRowIdx, COL_GURU.SEKOLAH + 1).setValue(teacher.namaSekolah);
    if (teacher.alamatSekolah !== undefined) sheet.getRange(targetRowIdx, COL_GURU.ALAMAT + 1).setValue(teacher.alamatSekolah);
    if (teacher.teleponSekolah !== undefined) sheet.getRange(targetRowIdx, COL_GURU.TELP + 1).setValue(teacher.teleponSekolah);
    if (teacher.emailSekolah !== undefined) sheet.getRange(targetRowIdx, COL_GURU.EMAIL_SEK + 1).setValue(teacher.emailSekolah);
    if (teacher.websiteSekolah !== undefined) sheet.getRange(targetRowIdx, COL_GURU.WEB_SEK + 1).setValue(teacher.websiteSekolah);
    if (teacher.namaKepalaSekolah !== undefined) sheet.getRange(targetRowIdx, COL_GURU.KEPSEK + 1).setValue(teacher.namaKepalaSekolah);
    if (teacher.nipKepalaSekolah !== undefined) sheet.getRange(targetRowIdx, COL_GURU.NIP_KEPSEK + 1).setValue(teacher.nipKepalaSekolah);
    if (teacher.logoSekolah !== undefined) sheet.getRange(targetRowIdx, COL_GURU.LOGO + 1).setValue(teacher.logoSekolah);

    SpreadsheetApp.flush();

    return createJsonResponse({
      status: 'success',
      message: 'Profil sekolah dan guru berhasil diperbarui di database.'
    });
  }

  /**
  * Aksi: Mengambil seluruh dataset guru spesifik dalam 1 payload terpadu
  */
  function handleGetTeacherData(teacherId) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    var data = {
      classes: ['X-A (Fase E)', 'XI-IPA 1', 'XII-IPA 2'],
      gradeWeights: { tugas: 30, uts: 30, uas: 40 },
      geminiApiKey: '',
      lessonPlans: [],
      materials: [],
      questionBank: [],
      assessmentPackages: [],
      timetable: [],
      academicEvents: [],
      students: [],
      attendanceLogs: [],
      gradebook: [],
      tasks: [],
      meetings: [],
      reflections: []
    };

    // 1. Pengaturan Aplikasi
    var sheetPengaturan = ss.getSheetByName('PengaturanAplikasi');
    if (sheetPengaturan && sheetPengaturan.getLastRow() > 1) {
      var rows = sheetPengaturan.getRange(2, 1, sheetPengaturan.getLastRow() - 1, sheetPengaturan.getLastColumn()).getDisplayValues();
      for (var i = 0; i < rows.length; i++) {
        if (rows[i][COL_PENGATURAN.ID_GURU] === teacherId) {
          try { data.classes = JSON.parse(rows[i][COL_PENGATURAN.CLASSES_JSON]); } catch (e) {}
          try { data.gradeWeights = JSON.parse(rows[i][COL_PENGATURAN.WEIGHTS_JSON]); } catch (e) {}
          data.geminiApiKey = rows[i][COL_PENGATURAN.AI_KEY] || '';
          break;
        }
      }
    }

    // 2. Data Siswa
    var sheetSiswa = ss.getSheetByName('DataSiswa');
    if (sheetSiswa && sheetSiswa.getLastRow() > 1) {
      var rowsSiswa = sheetSiswa.getRange(2, 1, sheetSiswa.getLastRow() - 1, sheetSiswa.getLastColumn()).getDisplayValues();
      for (var s = 0; s < rowsSiswa.length; s++) {
        var rS = rowsSiswa[s];
        if (rS[COL_SISWA.ID_GURU] === teacherId) {
          data.students.push({
            id: rS[COL_SISWA.ID],
            kelas: rS[COL_SISWA.KELAS],
            nisn: rS[COL_SISWA.NISN],
            namaLengkap: rS[COL_SISWA.NAMA],
            jenisKelamin: rS[COL_SISWA.JK],
            deskRow: parseInt(rS[COL_SISWA.ROW], 10) || 1,
            deskCol: parseInt(rS[COL_SISWA.COL], 10) || 1,
            catatanAnekdot: rS[COL_SISWA.CATATAN] || ''
          });
        }
      }
    }

    // 3. Modul Ajar RPP
    var sheetRPP = ss.getSheetByName('ModulAjarRPP');
    if (sheetRPP && sheetRPP.getLastRow() > 1) {
      var rowsRPP = sheetRPP.getRange(2, 1, sheetRPP.getLastRow() - 1, sheetRPP.getLastColumn()).getDisplayValues();
      for (var r = 0; r < rowsRPP.length; r++) {
        var rR = rowsRPP[r];
        if (rR[COL_RPP.ID_GURU] === teacherId) {
          var links = [];
          try { links = JSON.parse(rR[COL_RPP.LINKS_JSON]); } catch (e) {}
          data.lessonPlans.push({
            id: rR[COL_RPP.ID],
            materiPokok: rR[COL_RPP.MATERI],
            kelas: rR[COL_RPP.KELAS],
            mataPelajaran: rR[COL_RPP.MAPEL],
            alokasiWaktu: rR[COL_RPP.ALOKASI],
            semester: parseInt(rR[COL_RPP.SEMESTER], 10) || 1,
            tahunAjaran: rR[COL_RPP.TAHUN],
            fase: rR[COL_RPP.FASE],
            komponen: rR[COL_RPP.KOMPONEN],
            p5Tema: rR[COL_RPP.P5_TEMA] || '',
            p5Dimensi: rR[COL_RPP.P5_DIMENSI] || '',
            tujuanPembelajaran: rR[COL_RPP.TP],
            kegiatanPembuka: rR[COL_RPP.PEMBUKA],
            kegiatanInti: rR[COL_RPP.INTI],
            kegiatanPenutup: rR[COL_RPP.PENUTUP],
            asesmen: rR[COL_RPP.ASESMEN],
            tautanMateri: links
          });
        }
      }
    }

    // 4. Materi Pelajaran
    var sheetMateri = ss.getSheetByName('MateriPelajaran');
    if (sheetMateri && sheetMateri.getLastRow() > 1) {
      var rowsMateri = sheetMateri.getRange(2, 1, sheetMateri.getLastRow() - 1, sheetMateri.getLastColumn()).getDisplayValues();
      for (var m = 0; m < rowsMateri.length; m++) {
        var rM = rowsMateri[m];
        if (rM[COL_MATERI.ID_GURU] === teacherId) {
          var mLinks = [];
          try { mLinks = JSON.parse(rM[COL_MATERI.MEDIA_JSON]); } catch (e) {}
          data.materials.push({
            id: rM[COL_MATERI.ID],
            judul: rM[COL_MATERI.JUDUL],
            mapel: rM[COL_MATERI.MAPEL],
            kelas: rM[COL_MATERI.KELAS],
            topik: rM[COL_MATERI.TOPIK],
            alokasi: rM[COL_MATERI.ALOKASI],
            tingkatKesulitan: rM[COL_MATERI.KESULITAN],
            modelPembelajaran: rM[COL_MATERI.MODEL],
            cpTp: rM[COL_MATERI.CP_TP],
            ringkasan: rM[COL_MATERI.RINGKASAN],
            mediaLinks: mLinks,
            assignedScheduleId: rM[COL_MATERI.SCHEDULE_ID] || ''
          });
        }
      }
    }

    // 5. Bank Soal
    var sheetSoal = ss.getSheetByName('BankSoal');
    if (sheetSoal && sheetSoal.getLastRow() > 1) {
      var rowsSoal = sheetSoal.getRange(2, 1, sheetSoal.getLastRow() - 1, sheetSoal.getLastColumn()).getDisplayValues();
      for (var q = 0; q < rowsSoal.length; q++) {
        var rQ = rowsSoal[q];
        if (rQ[COL_SOAL.ID_GURU] === teacherId) {
          var opsi = [];
          try { opsi = JSON.parse(rQ[COL_SOAL.OPSI_JSON]); } catch (e) {}
          data.questionBank.push({
            id: rQ[COL_SOAL.ID],
            materiId: rQ[COL_SOAL.ID_MATERI],
            tipe: rQ[COL_SOAL.TIPE],
            bloomTaxonomy: rQ[COL_SOAL.BLOOM],
            tingkatKognitif: rQ[COL_SOAL.KOGNITIF],
            bobotSkor: parseInt(rQ[COL_SOAL.SKOR], 10) || 10,
            stimulus: rQ[COL_SOAL.STIMULUS] || '',
            pertanyaan: rQ[COL_SOAL.PERTANYAAN],
            opsiJawaban: opsi,
            kunciJawaban: rQ[COL_SOAL.KUNCI] || '',
            pembahasan: rQ[COL_SOAL.PEMBAHASAN] || ''
          });
        }
      }
    }

    // 6. Paket Asesmen
    var sheetPaket = ss.getSheetByName('PaketAsesmen');
    if (sheetPaket && sheetPaket.getLastRow() > 1) {
      var rowsPaket = sheetPaket.getRange(2, 1, sheetPaket.getLastRow() - 1, sheetPaket.getLastColumn()).getDisplayValues();
      for (var p = 0; p < rowsPaket.length; p++) {
        var rP = rowsPaket[p];
        if (rP[COL_PAKET.ID_GURU] === teacherId) {
          var soalIds = [];
          try { soalIds = JSON.parse(rP[COL_PAKET.SOAL_IDS_JSON]); } catch (e) {}
          data.assessmentPackages.push({
            id: rP[COL_PAKET.ID],
            judulPaket: rP[COL_PAKET.JUDUL],
            kelas: rP[COL_PAKET.KELAS],
            mapel: rP[COL_PAKET.MAPEL],
            waktuMenit: parseInt(rP[COL_PAKET.WAKTU], 10) || 60,
            tanggalUjian: rP[COL_PAKET.TANGGAL],
            daftarSoalIds: soalIds
          });
        }
      }
    }

    // 7. Jadwal Mengajar
    var sheetJadwal = ss.getSheetByName('JadwalMengajar');
    if (sheetJadwal && sheetJadwal.getLastRow() > 1) {
      var rowsJadwal = sheetJadwal.getRange(2, 1, sheetJadwal.getLastRow() - 1, sheetJadwal.getLastColumn()).getDisplayValues();
      for (var j = 0; j < rowsJadwal.length; j++) {
        var rJ = rowsJadwal[j];
        if (rJ[COL_JADWAL.ID_GURU] === teacherId) {
          data.timetable.push({
            id: rJ[COL_JADWAL.ID],
            hari: rJ[COL_JADWAL.HARI],
            jamMulai: rJ[COL_JADWAL.MULAI],
            jamSelesai: rJ[COL_JADWAL.SELESAI],
            kelas: rJ[COL_JADWAL.KELAS],
            mapel: rJ[COL_JADWAL.MAPEL],
            ruangan: rJ[COL_JADWAL.RUANGAN],
            color: rJ[COL_JADWAL.WARNA] || 'emerald'
          });
        }
      }
    }

    // 8. Agenda Akademik
    var sheetAgenda = ss.getSheetByName('AgendaAkademik');
    if (sheetAgenda && sheetAgenda.getLastRow() > 1) {
      var rowsAgenda = sheetAgenda.getRange(2, 1, sheetAgenda.getLastRow() - 1, sheetAgenda.getLastColumn()).getDisplayValues();
      for (var a = 0; a < rowsAgenda.length; a++) {
        var rA = rowsAgenda[a];
        if (rA[COL_AGENDA.ID_GURU] === teacherId) {
          data.academicEvents.push({
            id: rA[COL_AGENDA.ID],
            tanggal: rA[COL_AGENDA.TANGGAL],
            judul: rA[COL_AGENDA.JUDUL],
            kategori: rA[COL_AGENDA.KATEGORI],
            keterangan: rA[COL_AGENDA.KETERANGAN] || ''
          });
        }
      }
    }

    // 9. Presensi Siswa
    var sheetPresensi = ss.getSheetByName('PresensiSiswa');
    if (sheetPresensi && sheetPresensi.getLastRow() > 1) {
      var rowsPresensi = sheetPresensi.getRange(2, 1, sheetPresensi.getLastRow() - 1, sheetPresensi.getLastColumn()).getDisplayValues();
      for (var pr = 0; pr < rowsPresensi.length; pr++) {
        var rPr = rowsPresensi[pr];
        if (rPr[COL_PRESENSI.ID_GURU] === teacherId) {
          var recs = {};
          try { recs = JSON.parse(rPr[COL_PRESENSI.RECORDS_JSON]); } catch (e) {}
          data.attendanceLogs.push({
            id: rPr[COL_PRESENSI.ID],
            kelas: rPr[COL_PRESENSI.KELAS],
            tanggal: rPr[COL_PRESENSI.TANGGAL],
            records: recs
          });
        }
      }
    }

    // 10. Buku Nilai
    var sheetNilai = ss.getSheetByName('BukuNilai');
    if (sheetNilai && sheetNilai.getLastRow() > 1) {
      var rowsNilai = sheetNilai.getRange(2, 1, sheetNilai.getLastRow() - 1, sheetNilai.getLastColumn()).getDisplayValues();
      for (var n = 0; n < rowsNilai.length; n++) {
        var rN = rowsNilai[n];
        if (rN[COL_NILAI.ID_GURU] === teacherId) {
          var tg = [];
          try { tg = JSON.parse(rN[COL_NILAI.TUGAS_JSON]); } catch (e) {}
          data.gradebook.push({
            studentId: rN[COL_NILAI.ID_SISWA],
            kelas: rN[COL_NILAI.KELAS],
            tugas: tg,
            uts: parseFloat(rN[COL_NILAI.UTS]) || 0,
            uas: parseFloat(rN[COL_NILAI.UAS]) || 0
          });
        }
      }
    }

    // 11. Tugas Koreksi
    var sheetKoreksi = ss.getSheetByName('TugasKoreksi');
    if (sheetKoreksi && sheetKoreksi.getLastRow() > 1) {
      var rowsKoreksi = sheetKoreksi.getRange(2, 1, sheetKoreksi.getLastRow() - 1, sheetKoreksi.getLastColumn()).getDisplayValues();
      for (var t = 0; t < rowsKoreksi.length; t++) {
        var rT = rowsKoreksi[t];
        if (rT[COL_TUGAS.ID_GURU] === teacherId) {
          data.tasks.push({
            id: rT[COL_TUGAS.ID],
            judul: rT[COL_TUGAS.JUDUL],
            kelasMapel: rT[COL_TUGAS.KELAS_MAPEL],
            totalKoreksi: parseInt(rT[COL_TUGAS.TOTAL], 10) || 0,
            selesaiKoreksi: parseInt(rT[COL_TUGAS.SELESAI], 10) || 0,
            deadline: rT[COL_TUGAS.DEADLINE],
            status: rT[COL_TUGAS.STATUS]
          });
        }
      }
    }

    // 12. Notula Rapat
    var sheetRapat = ss.getSheetByName('NotulaRapat');
    if (sheetRapat && sheetRapat.getLastRow() > 1) {
      var rowsRapat = sheetRapat.getRange(2, 1, sheetRapat.getLastRow() - 1, sheetRapat.getLastColumn()).getDisplayValues();
      for (var rp = 0; rp < rowsRapat.length; rp++) {
        var rRp = rowsRapat[rp];
        if (rRp[COL_RAPAT.ID_GURU] === teacherId) {
          data.meetings.push({
            id: rRp[COL_RAPAT.ID],
            tanggal: rRp[COL_RAPAT.TANGGAL],
            judul: rRp[COL_RAPAT.JUDUL],
            hasil: rRp[COL_RAPAT.HASIL]
          });
        }
      }
    }

    // 13. Jurnal Refleksi
    var sheetRefleksi = ss.getSheetByName('JurnalRefleksi');
    if (sheetRefleksi && sheetRefleksi.getLastRow() > 1) {
      var rowsRefleksi = sheetRefleksi.getRange(2, 1, sheetRefleksi.getLastRow() - 1, sheetRefleksi.getLastColumn()).getDisplayValues();
      for (var rf = 0; rf < rowsRefleksi.length; rf++) {
        var rRf = rowsRefleksi[rf];
        if (rRf[COL_REFLEKSI.ID_GURU] === teacherId) {
          data.reflections.push({
            id: rRf[COL_REFLEKSI.ID],
            tanggal: rRf[COL_REFLEKSI.TANGGAL],
            kelas: rRf[COL_REFLEKSI.KELAS],
            materi: rRf[COL_REFLEKSI.MATERI],
            refleksi: rRf[COL_REFLEKSI.ISI]
          });
        }
      }
    }

    return createJsonResponse({
      status: 'success',
      teacherId: teacherId,
      data: data
    });
  }

  /**
  * Aksi: Menyimpan seluruh dataset guru ke Google Sheets
  */
  function handleSaveTeacherData(teacherId, data) {
    if (!teacherId || !data) {
      return createJsonResponse({ status: 'error', message: 'Parameter teacherId dan data wajib disertakan.' });
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // Helper untuk membersihkan dan menulis baris milik guru tertentu
    replaceTeacherRows(ss, 'DataSiswa', COL_SISWA.ID_GURU, teacherId, buildSiswaRows(teacherId, data.students || []));
    replaceTeacherRows(ss, 'ModulAjarRPP', COL_RPP.ID_GURU, teacherId, buildRPPRows(teacherId, data.lessonPlans || []));
    replaceTeacherRows(ss, 'MateriPelajaran', COL_MATERI.ID_GURU, teacherId, buildMateriRows(teacherId, data.materials || []));
    replaceTeacherRows(ss, 'BankSoal', COL_SOAL.ID_GURU, teacherId, buildSoalRows(teacherId, data.questionBank || []));
    replaceTeacherRows(ss, 'PaketAsesmen', COL_PAKET.ID_GURU, teacherId, buildPaketRows(teacherId, data.assessmentPackages || []));
    replaceTeacherRows(ss, 'JadwalMengajar', COL_JADWAL.ID_GURU, teacherId, buildJadwalRows(teacherId, data.timetable || []));
    replaceTeacherRows(ss, 'AgendaAkademik', COL_AGENDA.ID_GURU, teacherId, buildAgendaRows(teacherId, data.academicEvents || []));
    replaceTeacherRows(ss, 'PresensiSiswa', COL_PRESENSI.ID_GURU, teacherId, buildPresensiRows(teacherId, data.attendanceLogs || []));
    replaceTeacherRows(ss, 'BukuNilai', COL_NILAI.ID_GURU, teacherId, buildNilaiRows(teacherId, data.gradebook || []));
    replaceTeacherRows(ss, 'TugasKoreksi', COL_TUGAS.ID_GURU, teacherId, buildTugasRows(teacherId, data.tasks || []));
    replaceTeacherRows(ss, 'NotulaRapat', COL_RAPAT.ID_GURU, teacherId, buildRapatRows(teacherId, data.meetings || []));
    replaceTeacherRows(ss, 'JurnalRefleksi', COL_REFLEKSI.ID_GURU, teacherId, buildRefleksiRows(teacherId, data.reflections || []));

    // Pengaturan Aplikasi
    var sheetPengaturan = ss.getSheetByName('PengaturanAplikasi');
    if (sheetPengaturan) {
      replaceTeacherRows(ss, 'PengaturanAplikasi', COL_PENGATURAN.ID_GURU, teacherId, [
        [
          teacherId,
          JSON.stringify(data.classes || ['X-A (Fase E)', 'XI-IPA 1', 'XII-IPA 2']),
          JSON.stringify(data.gradeWeights || { tugas: 30, uts: 30, uas: 40 }),
          data.geminiApiKey || '',
          new Date().toISOString()
        ]
      ]);
    }

    SpreadsheetApp.flush();

    return createJsonResponse({
      status: 'success',
      message: 'Seluruh data guru berhasil disimpan ke database Google Sheets.',
      timestamp: new Date().toISOString()
    });
  }

  /**
  * Aksi: Sinkronisasi Dua Arah
  */
  function handleSyncAll(teacherId, localData) {
    if (!teacherId) {
      return createJsonResponse({ status: 'error', message: 'Parameter teacherId wajib diisi.' });
    }

    // Jika klien mengirimkan data lokal, simpan ke cloud
    if (localData) {
      handleSaveTeacherData(teacherId, localData);
    }

    // Kembalikan data mutakhir dari cloud ke klien
    return handleGetTeacherData(teacherId);
  }

  /**
  * ============================================================================
  * HELPER PENYUSUNAN BARIS DATA UNTUK BULK WRITE
  * ============================================================================
  */
  function replaceTeacherRows(ss, sheetName, teacherColIdx, teacherId, newRows) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) return;

    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      var numCols = sheet.getLastColumn();
      var values = sheet.getRange(2, 1, lastRow - 1, numCols).getValues();
      var preservedRows = [];

      for (var i = 0; i < values.length; i++) {
        if (values[i][teacherColIdx] !== teacherId) {
          preservedRows.push(values[i]);
        }
      }

      // Bersihkan isi sheet (kecuali baris header 1)
      sheet.getRange(2, 1, lastRow - 1, numCols).clearContent();

      // Tulis kembali baris guru lain
      if (preservedRows.length > 0) {
        sheet.getRange(2, 1, preservedRows.length, numCols).setValues(preservedRows);
      }
    }

    // Tulis baris baru guru
    if (newRows && newRows.length > 0) {
      var startRow = sheet.getLastRow() + 1;
      sheet.getRange(startRow, 1, newRows.length, newRows[0].length).setValues(newRows);
    }
  }

  function buildSiswaRows(teacherId, items) {
    var rows = [];
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      rows.push([
        it.id || '', teacherId, it.kelas || '', it.nisn || '', it.namaLengkap || '',
        it.jenisKelamin || 'L', it.deskRow || 1, it.deskCol || 1, it.catatanAnekdot || ''
      ]);
    }
    return rows;
  }

  function buildRPPRows(teacherId, items) {
    var rows = [];
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      rows.push([
        it.id || '', teacherId, it.materiPokok || '', it.kelas || '', it.mataPelajaran || '',
        it.alokasiWaktu || '', it.semester || 1, it.tahunAjaran || '2026/2027', it.fase || '',
        it.komponen || 'Intrakurikuler', it.p5Tema || '', it.p5Dimensi || '',
        it.tujuanPembelajaran || '', it.kegiatanPembuka || '', it.kegiatanInti || '',
        it.kegiatanPenutup || '', it.asesmen || '', JSON.stringify(it.tautanMateri || [])
      ]);
    }
    return rows;
  }

  function buildMateriRows(teacherId, items) {
    var rows = [];
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      rows.push([
        it.id || '', teacherId, it.judul || '', it.mapel || '', it.kelas || '', it.topik || '',
        it.alokasi || '', it.tingkatKesulitan || 'Dasar', it.modelPembelajaran || '',
        it.cpTp || '', it.ringkasan || '', JSON.stringify(it.mediaLinks || []), it.assignedScheduleId || ''
      ]);
    }
    return rows;
  }

  function buildSoalRows(teacherId, items) {
    var rows = [];
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      rows.push([
        it.id || '', teacherId, it.materiId || '', it.tipe || 'Pilihan Ganda',
        it.bloomTaxonomy || 'C2', it.tingkatKognitif || 'LOTS', it.bobotSkor || 10,
        it.stimulus || '', it.pertanyaan || '', JSON.stringify(it.opsiJawaban || []),
        it.kunciJawaban || '', it.pembahasan || ''
      ]);
    }
    return rows;
  }

  function buildPaketRows(teacherId, items) {
    var rows = [];
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      rows.push([
        it.id || '', teacherId, it.judulPaket || '', it.kelas || '', it.mapel || '',
        it.waktuMenit || 60, it.tanggalUjian || '', JSON.stringify(it.daftarSoalIds || [])
      ]);
    }
    return rows;
  }

  function buildJadwalRows(teacherId, items) {
    var rows = [];
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      rows.push([
        it.id || '', teacherId, it.hari || '', it.jamMulai || '', it.jamSelesai || '',
        it.kelas || '', it.mapel || '', it.ruangan || '', it.color || 'emerald'
      ]);
    }
    return rows;
  }

  function buildAgendaRows(teacherId, items) {
    var rows = [];
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      rows.push([
        it.id || '', teacherId, it.tanggal || '', it.judul || '', it.kategori || '', it.keterangan || ''
      ]);
    }
    return rows;
  }

  function buildPresensiRows(teacherId, items) {
    var rows = [];
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var recs = it.records || {};
      var hadir = 0, sakit = 0, izin = 0, alpa = 0;
      for (var k in recs) {
        if (recs[k] === 'H') hadir++;
        else if (recs[k] === 'S') sakit++;
        else if (recs[k] === 'I') izin++;
        else if (recs[k] === 'A') alpa++;
      }
      rows.push([
        it.id || '', teacherId, it.kelas || '', it.tanggal || '',
        hadir, sakit, izin, alpa, JSON.stringify(recs)
      ]);
    }
    return rows;
  }

  function buildNilaiRows(teacherId, items) {
    var rows = [];
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var tgs = it.tugas || [];
      var avgTugas = tgs.length > 0 ? (tgs.reduce(function(a, b){ return a + b; }, 0) / tgs.length) : 0;
      var uts = it.uts || 0;
      var uas = it.uas || 0;
      var akhir = Math.round((avgTugas * 0.3 + uts * 0.3 + uas * 0.4) * 10) / 10;

      rows.push([
        teacherId, it.studentId || '', it.kelas || '', JSON.stringify(tgs),
        uts, uas, akhir
      ]);
    }
    return rows;
  }

  function buildTugasRows(teacherId, items) {
    var rows = [];
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      rows.push([
        it.id || '', teacherId, it.judul || '', it.kelasMapel || '',
        it.totalKoreksi || 0, it.selesaiKoreksi || 0, it.deadline || '', it.status || 'Pending'
      ]);
    }
    return rows;
  }

  function buildRapatRows(teacherId, items) {
    var rows = [];
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      rows.push([
        it.id || '', teacherId, it.tanggal || '', it.judul || '', it.hasil || ''
      ]);
    }
    return rows;
  }

  function buildRefleksiRows(teacherId, items) {
    var rows = [];
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      rows.push([
        it.id || '', teacherId, it.tanggal || '', it.kelas || '', it.materi || '', it.refleksi || ''
      ]);
    }
    return rows;
  }


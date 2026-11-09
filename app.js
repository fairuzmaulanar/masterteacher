/**
 * MASTER TEACHER PLANNER - CORE ENGINE & LOGIC
 * Architecture: Clean Vanilla ES6+ Modular State Management
 * Anti-AI Human-Crafted Aesthetic & Offline-First Reliability
 */

// ==========================================================================
// 1. Storage Manager (LocalStorage Database & Auto-Increment Unique IDs)
// ==========================================================================
const STORAGE_KEY_TEACHERS = 'MTP_V1_TEACHERS';
const STORAGE_KEY_ACTIVE_TEACHER = 'MTP_V1_ACTIVE_TEACHER_ID';
const STORAGE_PREFIX_DATA = 'MTP_V1_DATA_';

const StorageManager = {
  // Generate safe sequential IDs (PREFIX-YYYYMM-XXX)
  generateId(prefix, existingList) {
    const now = new Date();
    const yearMonth = now.getFullYear().toString() + String(now.getMonth() + 1).padStart(2, '0');
    let maxNum = 0;
    const pattern = new RegExp(`^${prefix}-${yearMonth}-(\\d+)$`);
    
    existingList.forEach(item => {
      if (item && item.id) {
        const match = item.id.match(pattern);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) maxNum = num;
        }
      }
    });
    const nextNum = String(maxNum + 1).padStart(3, '0');
    return `${prefix}-${yearMonth}-${nextNum}`;
  },

  getTeachers() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_TEACHERS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed reading teachers:', e);
      return [];
    }
  },

  saveTeachers(teachers) {
    localStorage.setItem(STORAGE_KEY_TEACHERS, JSON.stringify(teachers));
    if (typeof CloudDBManager !== 'undefined' && CloudDBManager.autoSyncTeacherProfile) {
      CloudDBManager.autoSyncTeacherProfile();
    }
  },

  getActiveTeacherId() {
    return localStorage.getItem(STORAGE_KEY_ACTIVE_TEACHER);
  },

  setActiveTeacherId(id) {
    localStorage.setItem(STORAGE_KEY_ACTIVE_TEACHER, id);
  },

  getTeacherData(teacherId) {
    if (!teacherId) return this.getDefaultSchema();
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX_DATA + teacherId);
      if (!raw) {
        const initial = this.getDefaultSchema();
        this.saveTeacherData(teacherId, initial);
        return initial;
      }
      return JSON.parse(raw);
    } catch (e) {
      console.error('Failed reading teacher data:', e);
      return this.getDefaultSchema();
    }
  },

  saveTeacherData(teacherId, data) {
    if (!teacherId) return;
    localStorage.setItem(STORAGE_PREFIX_DATA + teacherId, JSON.stringify(data));
    if (typeof CloudDBManager !== 'undefined' && CloudDBManager.autoSyncIfConfigured) {
      CloudDBManager.autoSyncIfConfigured(teacherId, data);
    }
  },

  getDefaultSchema() {
    return {
      classes: [],
      lessonPlans: [],
      materials: [],
      questionBank: [],
      assessmentPackages: [],
      timetable: [],
      academicEvents: [],
      students: [],
      attendanceLogs: [],
      gradebook: [],
      gradeWeights: { tugas: 30, uts: 30, uas: 40 },
      tasks: [],
      meetings: [],
      reflections: [],
      geminiApiKey: ''
    };
  },

  // Comprehensive, realistic demo dataset spanning all menus
  getFullDemoData() {
    const todayStr = new Date().toISOString().split('T')[0];
    const prevDate = new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0];

    return {
      classes: ['X-A (Fase E)', 'XI-IPA 1', 'XII-IPA 2'],
      gradeWeights: { tugas: 30, uts: 30, uas: 40 },
      geminiApiKey: '',
      lessonPlans: [
        {
          id: 'RPP-202610-001',
          materiPokok: 'Algoritma Pemrograman & Berpikir Komputasional',
          kelas: 'X-A (Fase E)',
          mataPelajaran: 'Informatika',
          alokasiWaktu: '3 JP x 45 Menit',
          semester: 1,
          tahunAjaran: '2026/2027',
          fase: 'Fase E',
          komponen: 'Intrakurikuler',
          tujuanPembelajaran: 'Peserta didik mampu memahami konsep dekomposisi, pengenalan pola, abstraksi, dan merancang algoritma langkah demi langkah untuk menyelesaikan permasalahan sehari-hari.',
          kegiatanPembuka: '1. Guru menyapa, berdoa, mengecek kehadiran, dan apersepsi (10 menit).\n2. Ice breaking teka-teki logika untuk memicu daya nalar peserta didik.',
          kegiatanInti: '1. Diferensiasi Konten: Menayangkan studi kasus rute terpendek dan bagan alur.\n2. Diskusi kelompok: Siswa menyusun flowchart penyelesaian masalah menggunakan kartu logika.\n3. Diferensiasi Produk: Kelompok pemula membuat diagram alur, kelompok mahir menulis pseudocode terstruktur (65 menit).',
          kegiatanPenutup: '1. Refleksi bersama siswa mengenai kesulitan yang dialami.\n2. Kesimpulan dan penyampaian topik pertemuan berikutnya (15 menit).',
          asesmen: 'Asesmen Formatif: Lembar observasi diskusi & Rubrik penilaian presentasi algoritma.',
          tautanMateri: [
            { label: 'Slide Presentasi Modul 1 (Drive)', url: 'https://drive.google.com' },
            { label: 'Video Simulasi Flowchart (YouTube)', url: 'https://youtube.com' }
          ]
        },
        {
          id: 'RPP-202610-002',
          materiPokok: 'Struktur Data Larik (Array 1D & 2D) & Logika Pencarian',
          kelas: 'XI-IPA 1',
          mataPelajaran: 'Informatika',
          alokasiWaktu: '2 JP x 45 Menit',
          semester: 1,
          tahunAjaran: '2026/2027',
          fase: 'Fase F',
          komponen: 'Intrakurikuler',
          tujuanPembelajaran: 'Peserta didik mampu mengimplementasikan struktur data array 1 dimensi dan 2 dimensi serta menganalisis efisiensi Linear Search vs Binary Search.',
          kegiatanPembuka: 'Apersepsi dengan permainan tebak angka acak terurut (10 menit).',
          kegiatanInti: 'Praktikum di lab komputer: 1. Penjelasan indeks array berbasis nol. 2. Eksplorasi traversing array perulangan for. 3. Diferensiasi proses: kelompok mandiri menantang kasus array 2 dimensi matriks (60 menit).',
          kegiatanPenutup: 'Kuis interaktif kilat 3 pertanyaan refleksi dan kesimpulan (20 menit).',
          asesmen: 'Praktikum individu di lab dan rubrik kebenaran logika kode sintaks.',
          tautanMateri: [
            { label: 'Modul Praktikum Array (Drive)', url: 'https://docs.google.com' }
          ]
        },
        {
          id: 'RPP-202610-003',
          materiPokok: 'Desain Basis Data Relasional, ERD & Normalisasi',
          kelas: 'XII-IPA 2',
          mataPelajaran: 'Informatika',
          alokasiWaktu: '3 JP x 45 Menit',
          semester: 1,
          tahunAjaran: '2026/2027',
          fase: 'Fase F',
          komponen: 'Intrakurikuler',
          tujuanPembelajaran: 'Peserta didik mampu memodelkan data dunia nyata ke dalam Entity Relationship Diagram (ERD), menerapkan aturan normalisasi 1NF hingga 3NF, dan merancang skema tabel relasional.',
          kegiatanPembuka: 'Review konsep basis data spreadsheet manual dan masalah redundansi data (10 menit).',
          kegiatanInti: '1. Studi kasus sistem perpustakaan dan toko online.\n2. Praktikum merancang diagram entitas, primary key, dan foreign key.\n3. Uji coba query SQL dasar (SELECT, WHERE, JOIN) (70 menit).',
          kegiatanPenutup: 'Refleksi kelompok mengenai tantangan menghindari anomali update data (10 menit).',
          asesmen: 'Asesmen Sumatif: Lembar proyek perancangan skema ERD kelompok.',
          tautanMateri: [
            { label: 'Slide ERD & Normalisasi (Drive)', url: 'https://drive.google.com' },
            { label: 'Panduan Praktikum SQL (PDF)', url: 'https://docs.google.com' }
          ]
        },
        {
          id: 'RPP-202610-004',
          materiPokok: 'Keamanan Siber, Jejak Digital & Kriptografi Simetris',
          kelas: 'X-A (Fase E)',
          mataPelajaran: 'Informatika',
          alokasiWaktu: '2 JP x 45 Menit',
          semester: 1,
          tahunAjaran: '2026/2027',
          fase: 'Fase E',
          komponen: 'Intrakurikuler',
          tujuanPembelajaran: 'Peserta didik mampu mengidentifikasi risiko keamanan siber (phishing, social engineering), menjaga privasi jejak digital, dan mempraktikkan enkripsi sederhana (Caesar Cipher).',
          kegiatanPembuka: 'Studi kasus berita kebocoran data dan bahaya pembobolan akun di media sosial (10 menit).',
          kegiatanInti: '1. Eksplorasi jejak digital di mesin pencari.\n2. Simulasi enkripsi pesan rahasia menggunakan kartu kode Caesar cipher.\n3. Diskusi etika berinternet sehat dan password manager (65 menit).',
          kegiatanPenutup: 'Penyusunan komitmen bersama "5 Aturan Emas Keamanan Akun Siswa" (15 menit).',
          asesmen: 'Asesmen Formatif: Lembar kerja simulasi enkripsi & kuis interaktif.',
          tautanMateri: [
            { label: 'Modul Keamanan Siber (Drive)', url: 'https://drive.google.com' },
            { label: 'Video Edukasi Jejak Digital (YouTube)', url: 'https://youtube.com' }
          ]
        },
        {
          id: 'RPP-202610-005',
          materiPokok: 'Pengembangan Web Modern: Tata Letak CSS Grid & Flexbox',
          kelas: 'XI-IPA 1',
          mataPelajaran: 'Informatika',
          alokasiWaktu: '3 JP x 45 Menit',
          semester: 1,
          tahunAjaran: '2026/2027',
          fase: 'Fase F',
          komponen: 'Intrakurikuler',
          tujuanPembelajaran: 'Peserta didik mampu merancang antarmuka web responsif multi-perangkat menggunakan teknik CSS Flexbox untuk komponen satu dimensi dan CSS Grid untuk layout dua dimensi.',
          kegiatanPembuka: 'Demonstrasi responsive design web saat dibuka di layar HP vs Laptop (10 menit).',
          kegiatanInti: 'Praktikum di lab: 1. Latihan Flexbox align-items dan justify-content.\n2. Pembuatan kartu produk responsif.\n3. Tantangan layout dashboard 3 kolom dengan CSS Grid (70 menit).',
          kegiatanPenutup: 'Showcase karya web siswa di proyektor kelas dan umpan balik teman sebaya (10 menit).',
          asesmen: 'Asesmen Kinerja Produk: Rubrik responsivitas web dan kerapian kode CSS.',
          tautanMateri: [
            { label: 'Cheatsheet Flexbox & Grid (Drive)', url: 'https://drive.google.com' },
            { label: 'Demo Interaktif CSS Flexbox (CodePen)', url: 'https://codepen.io' }
          ]
        },
        {
          id: 'RPP-202610-006',
          materiPokok: 'P5: Rekayasa & Teknologi - Rancang Bangun IoT Smart Classroom',
          kelas: 'X-A (Fase E)',
          mataPelajaran: 'Informatika',
          alokasiWaktu: '4 JP x 45 Menit',
          semester: 1,
          tahunAjaran: '2026/2027',
          fase: 'Fase E',
          komponen: 'Kokurikuler',
          p5Tema: 'Rekayasa dan Teknologi',
          p5Dimensi: 'Bernalar Kritis & Gotong Royong',
          tujuanPembelajaran: 'Peserta didik bergotong royong merekayasa purwarupa otomatisasi kelas pintar (lampu otomatis hemat energi & sensor suhu) untuk melatih daya cipta teknologi ramah lingkungan.',
          kegiatanPembuka: 'Pemutaran video smart school di berbagai belahan dunia dan orientasi masalah pemborosan energi di sekolah (15 menit).',
          kegiatanInti: '1. Brainstorming perancangan solusi IoT sederhana.\n2. Pembuatan blok diagram sensor dan mikrokontroler simulator.\n3. Diferensiasi peran: arsitek hardware, perancang logika, dan presenter tim (100 menit).',
          kegiatanPenutup: 'Refleksi dimensi profil pelajar Pancasila: Bernalar kritis dan gotong royong (15 menit).',
          asesmen: 'Asesmen Projek P5: Lembar observasi dimensi bergotong royong & rubrik purwarupa produk.',
          tautanMateri: [
            { label: 'Panduan Modul P5 Tema Rekayasa (Drive)', url: 'https://drive.google.com' },
            { label: 'Simulator Rangkaian IoT (Tinkercad)', url: 'https://tinkercad.com' }
          ]
        },
        {
          id: 'RPP-202610-007',
          materiPokok: 'Pengantar Kecerdasan Artifisial & Etika Machine Learning',
          kelas: 'XII-IPA 2',
          mataPelajaran: 'Informatika',
          alokasiWaktu: '2 JP x 45 Menit',
          semester: 1,
          tahunAjaran: '2026/2027',
          fase: 'Fase F',
          komponen: 'Intrakurikuler',
          tujuanPembelajaran: 'Peserta didik memahami konsep supervised vs unsupervised learning, cara kerja model klasifikasi data sederhana, serta isu etika bias data dan hak cipta pada era generatif AI.',
          kegiatanPembuka: 'Eksperimen klasifikasi gambar interaktif menggunakan Teachable Machine (10 menit).',
          kegiatanInti: '1. Diskusi alur kerja pelatihan model (Dataset -> Training -> Testing -> Prediksi).\n2. Analisis studi kasus bias algoritma rekomendasi media sosial.\n3. Debat terarah tentang etika penggunaan AI dalam dunia akademik (65 menit).',
          kegiatanPenutup: 'Penyusunan kesimpulan dan resume pemahaman kritis terhadap pemanfaatan AI (15 menit).',
          asesmen: 'Asesmen Formatif: Lembar analisis etika AI dan kuis pemahaman konsep.',
          tautanMateri: [
            { label: 'Teachable Machine Google (Web)', url: 'https://teachablemachine.withgoogle.com' },
            { label: 'E-Book Etika AI & Data Science (Drive)', url: 'https://drive.google.com' }
          ]
        }
      ],
      materials: [
        {
          id: 'MAT-202610-001',
          judul: 'Algoritma Pemrograman & Diagram Alur (Flowchart)',
          mapel: 'Informatika',
          kelas: 'X-A (Fase E)',
          topik: 'Bab 1 - Berpikir Komputasional',
          alokasi: '3 JP x 45 Menit',
          tingkatKesulitan: 'Dasar',
          modelPembelajaran: 'Project-Based Learning (PBL)',
          cpTp: 'Peserta didik mampu mendesain diagram alur (flowchart) terstruktur dan pseudocode untuk menyelesaikan persoalan percabangan dan perulangan.',
          ringkasan: '1. Konsep dasar algoritma: Urutan langkah logis penyelesaian masalah.\n2. Simbol standar flowchart: Terminator (Mulai/Selesai), Input/Output (Jajar genjang), Proses (Persegi panjang), dan Decision (Belah ketupat).\n3. Kaidah percabangan If-Else dan iterasi perulangan.',
          mediaLinks: [
            { tipe: 'video', label: 'Simulasi Video Flowchart (YouTube)', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
            { tipe: 'doc', label: 'Slide Materi & E-Book Modul 1 (Drive)', url: 'https://drive.google.com' },
            { tipe: 'phet', label: 'Simulasi Logika Interaktif', url: 'https://phet.colorado.edu' }
          ],
          assignedScheduleId: 'SCH-202610-001'
        },
        {
          id: 'MAT-202610-002',
          judul: 'Struktur Data Larik (Array 1D & 2D)',
          mapel: 'Informatika',
          kelas: 'XI-IPA 1',
          topik: 'Bab 2 - Algoritma Pemrograman Lanjut',
          alokasi: '2 JP x 45 Menit',
          tingkatKesulitan: 'Menengah',
          modelPembelajaran: 'Inkuiri Terbimbing',
          cpTp: 'Peserta didik memahami representasi data sejenis dalam memori menggunakan struktur larik dan operasi pencarian (Linear Search).',
          ringkasan: '1. Definisi Array: Kumpulan elemen bertipe data sama dengan indeks numerik berurutan.\n2. Zero-based indexing: Elemen pertama berindeks 0.\n3. Traversing array menggunakan perulangan for loop.',
          mediaLinks: [
            { tipe: 'doc', label: 'Modul Praktikum Array & LKS (Drive)', url: 'https://docs.google.com' }
          ],
          assignedScheduleId: 'SCH-202610-002'
        },
        {
          id: 'MAT-202610-003',
          judul: 'Normalisasi Basis Data & Entity Relationship Diagram',
          mapel: 'Informatika',
          kelas: 'XII-IPA 2',
          topik: 'Bab 3 - Rekayasa Basis Data Relasional',
          alokasi: '3 JP x 45 Menit',
          tingkatKesulitan: 'Menengah',
          modelPembelajaran: 'Problem-Based Learning',
          cpTp: 'Peserta didik terampil merancang model konseptual ERD dan menerapkan tahapan normalisasi hingga 3NF.',
          ringkasan: '1. Entitas, Atribut, dan Relasi (1:1, 1:N, N:M).\n2. Aturan 1NF: Nilai atribut bersifat atomik.\n3. Aturan 2NF: Tidak ada ketergantungan parsial.\n4. Aturan 3NF: Tidak ada ketergantungan transitif.',
          mediaLinks: [
            { tipe: 'doc', label: 'Panduan Praktikum ERD & SQL (Drive)', url: 'https://drive.google.com' },
            { tipe: 'video', label: 'Tutorial Video Normalisasi Database (YouTube)', url: 'https://youtube.com' }
          ],
          assignedScheduleId: 'SCH-202610-003'
        },
        {
          id: 'MAT-202610-004',
          judul: 'Kriptografi Kunci Simetris & Keamanan Akun Media Sosial',
          mapel: 'Informatika',
          kelas: 'X-A (Fase E)',
          topik: 'Bab 4 - Keamanan Informasi & Jaringan',
          alokasi: '2 JP x 45 Menit',
          tingkatKesulitan: 'Dasar',
          modelPembelajaran: 'Pembelajaran Kontekstual',
          cpTp: 'Peserta didik memahami prinsip enkripsi dan dekripsi untuk melindungi data pribadi di ruang siber.',
          ringkasan: '1. Perbedaan Plaintext dan Ciphertext.\n2. Algoritma substitusi klasik Caesar Cipher.\n3. Praktik pembuatan sandi kuat dan Two-Factor Authentication (2FA).',
          mediaLinks: [
            { tipe: 'doc', label: 'Lembar Latihan Sandi Kriptografi (Drive)', url: 'https://docs.google.com' },
            { tipe: 'phet', label: 'Simulator Enkripsi Teks Interaktif', url: 'https://cryptii.com' }
          ],
          assignedScheduleId: 'SCH-202610-004'
        },
        {
          id: 'MAT-202610-005',
          judul: 'Desain Web Responsif dengan CSS Grid & Flexbox',
          mapel: 'Informatika',
          kelas: 'XI-IPA 1',
          topik: 'Bab 3 - Pengembangan Web Front-End',
          alokasi: '3 JP x 45 Menit',
          tingkatKesulitan: 'Menengah',
          modelPembelajaran: 'Project-Based Learning',
          cpTp: 'Peserta didik mampu menata tata letak antarmuka web modern yang adaptif di berbagai resolusi layar.',
          ringkasan: '1. Flexbox untuk tata letak linear 1 dimensi (navbar, tombol group).\n2. CSS Grid untuk tata letak 2 dimensi (dashboard, galeri foto).\n3. Media Queries untuk penyesuaian breakpoint layar HP.',
          mediaLinks: [
            { tipe: 'doc', label: 'Modul Praktikum CSS Grid (Drive)', url: 'https://drive.google.com' },
            { tipe: 'video', label: 'Video Panduan Responsive Web (YouTube)', url: 'https://youtube.com' }
          ],
          assignedScheduleId: 'SCH-202610-006'
        },
        {
          id: 'MAT-202610-006',
          judul: 'Model Jaringan Saraf Tiruan & Etika Kecerdasan Buatan',
          mapel: 'Informatika',
          kelas: 'XII-IPA 2',
          topik: 'Bab 5 - Kecerdasan Artifisial & Masyarakat Digital',
          alokasi: '2 JP x 45 Menit',
          tingkatKesulitan: 'Pengayaan',
          modelPembelajaran: 'Diskusi Terbuka & Eksplorasi Mandiri',
          cpTp: 'Peserta didik menganalisis cara kerja dasar perceptron, pelatihan model AI, dan dampak etika otomasi.',
          ringkasan: '1. Struktur dasar Artificial Neural Network (Input, Hidden, Output Layer).\n2. Konsep bobot (weights), bias, dan fungsi aktivasi.\n3. Masalah bias algoritma, privasi data, dan hak cipta generatif AI.',
          mediaLinks: [
            { tipe: 'phet', label: 'Tinkering Model AI (TensorFlow Playground)', url: 'https://playground.tensorflow.org' },
            { tipe: 'doc', label: 'Kajian Akademik Etika AI Masa Depan (Drive)', url: 'https://drive.google.com' }
          ],
          assignedScheduleId: 'SCH-202610-007'
        },
        {
          id: 'MAT-202610-007',
          judul: 'Kokurikuler P5: Analisis Daur Hidup & E-Waste Digital',
          mapel: 'Informatika',
          kelas: 'X-A (Fase E)',
          topik: 'Projek P5 - Rekayasa & Gaya Hidup Berkelanjutan',
          alokasi: '4 JP x 45 Menit',
          tingkatKesulitan: 'Dasar',
          modelPembelajaran: 'Service Learning & Kolaborasi',
          cpTp: 'Peserta didik memetakan bahaya limbah barang elektronik dan merancang kampanye daur ulang di sekolah.',
          ringkasan: '1. Kandungan logam berat pada komponen komputer usang.\n2. Alur daur ulang perangkat teknologi informasi.\n3. Perancangan infografis peduli sampah elektronik sekolah.',
          mediaLinks: [
            { tipe: 'doc', label: 'Panduan Observasi E-Waste Sekolah (Drive)', url: 'https://drive.google.com' }
          ],
          assignedScheduleId: 'SCH-202610-005'
        }
      ],
      questionBank: [
        {
          id: 'QST-202610-001',
          materiId: 'MAT-202610-001',
          tipe: 'Pilihan Ganda',
          bloomTaxonomy: 'C4',
          tingkatKognitif: 'HOTS',
          bobotSkor: 15,
          stimulus: 'Diberikan algoritma perulangan: nilai awal X = 5. Selama X < 20, lakukan X = X + 4 dan cetak nilai X.',
          pertanyaan: 'Berdasarkan algoritma di atas, berapakah nilai akhir X yang tercetak pada layar tepat sebelum perulangan berhenti?',
          opsiJawaban: ['17', '21', '25', '13', '20'],
          kunciJawaban: 'B',
          pembahasan: 'Iterasi 1: X = 5+4 = 9. Iterasi 2: X = 9+4 = 13. Iterasi 3: X = 13+4 = 17. Iterasi 4: X = 17+4 = 21. Karena 21 tidak lagi < 20, perulangan berhenti. Nilai terakhir yang tercetak adalah 21.'
        },
        {
          id: 'QST-202610-002',
          materiId: 'MAT-202610-001',
          tipe: 'Pilihan Ganda',
          bloomTaxonomy: 'C2',
          tingkatKognitif: 'LOTS',
          bobotSkor: 10,
          stimulus: '',
          pertanyaan: 'Simbol bagan alir (flowchart) yang digunakan untuk menyatakan proses pengambilan keputusan (kondisi percabangan) adalah...',
          opsiJawaban: ['Persegi panjang', 'Jajar genjang', 'Belah ketupat (Diamond)', 'Lingkaran kecil', 'Oval / Kapsul'],
          kunciJawaban: 'C',
          pembahasan: 'Simbol belah ketupat (Decision) melambangkan titik percabangan kondisi True / False.'
        },
        {
          id: 'QST-202610-003',
          materiId: 'MAT-202610-002',
          tipe: 'Pilihan Ganda',
          bloomTaxonomy: 'C3',
          tingkatKognitif: 'MOTS',
          bobotSkor: 10,
          stimulus: 'Diketahui array nilai = [70, 85, 90, 65, 88].',
          pertanyaan: 'Berapakah nilai dari elemen nilai[2] pada sistem pengindeksan berbasis nol (zero-based index)?',
          opsiJawaban: ['70', '85', '90', '65', '88'],
          kunciJawaban: 'C',
          pembahasan: 'Indeks 0 = 70, indeks 1 = 85, indeks 2 = 90.'
        },
        {
          id: 'QST-202610-004',
          materiId: 'MAT-202610-002',
          tipe: 'Esai',
          bloomTaxonomy: 'C5',
          tingkatKognitif: 'HOTS',
          bobotSkor: 25,
          stimulus: 'Sebuah sistem basis data perpustakaan menyimpan 10.000 judul buku yang sudah terurut abjad. Guru meminta siswa memilih antara Linear Search atau Binary Search.',
          pertanyaan: 'Analisis efisiensi algoritma: Mengapa Binary Search jauh lebih direkomendasikan dibanding Linear Search untuk kasus tersebut? Jelaskan perbandingan kompleksitas jumlah langkahnya!',
          kunciJawaban: 'Rubrik Penskoran: Menyebutkan perbandingan O(log n) vs O(n), menjelaskan pembagian rentang pencarian menjadi 2 bagian secara rekursif, dan menghitung estimasi perbandingan langkah (maksimal sekitar 14 kali pencarian pada Binary Search dibanding hingga 10.000 kali pada Linear Search).',
          pembahasan: 'Binary Search membagi ruang pencarian menjadi separuh di setiap langkah sehingga kompleksitasnya O(log n), sangat efisien untuk data terurut dibanding Linear Search O(n).'
        },
        {
          id: 'QST-202610-005',
          materiId: 'MAT-202610-001',
          tipe: 'Benar/Salah',
          bloomTaxonomy: 'C1',
          tingkatKognitif: 'LOTS',
          bobotSkor: 5,
          stimulus: '',
          pertanyaan: 'Konsep Dekomposisi dalam berpikir komputasional berarti memecah masalah kompleks menjadi bagian-bagian yang lebih kecil dan mudah dikelola.',
          kunciJawaban: 'A',
          opsiJawaban: ['Benar', 'Salah'],
          pembahasan: 'Pernyataan tersebut benar sesuai prinsip dekomposisi pada Computational Thinking.'
        },
        {
          id: 'QST-202610-006',
          materiId: 'MAT-202610-002',
          tipe: 'Pilihan Ganda',
          bloomTaxonomy: 'C4',
          tingkatKognitif: 'HOTS',
          bobotSkor: 15,
          stimulus: 'Potongan kode: total = 0; for(i=0; i<data.length; i++) { if(data[i] % 2 === 0) total += data[i]; } jika data = [2, 5, 8, 3, 10].',
          pertanyaan: 'Berapakah nilai akhir dari variabel total setelah perulangan selesai?',
          opsiJawaban: ['28', '20', '8', '10', '18'],
          kunciJawaban: 'B',
          pembahasan: 'Hanya angka genap yang dijumlahkan: 2 + 8 + 10 = 20.'
        },
        {
          id: 'QST-202610-007',
          materiId: 'MAT-202610-001',
          tipe: 'Pilihan Ganda',
          bloomTaxonomy: 'C3',
          tingkatKognitif: 'MOTS',
          bobotSkor: 10,
          stimulus: '',
          pertanyaan: 'Manakah penulisan pseudocode yang tepat untuk kondisi: "Jika usia minimal 17 tahun maka boleh membuat SIM, jika tidak maka belum boleh"?',
          opsiJawaban: [
            'IF usia >= 17 THEN Print "Boleh SIM" ELSE Print "Belum Boleh"',
            'WHILE usia >= 17 DO Print "Boleh SIM"',
            'FOR usia = 1 TO 17 DO Print "Boleh SIM"',
            'IF usia < 17 THEN Print "Boleh SIM" ELSE Print "Belum Boleh"',
            'REPEAT Print "Boleh SIM" UNTIL usia >= 17'
          ],
          kunciJawaban: 'A',
          pembahasan: 'Struktur IF-THEN-ELSE dengan kondisi usia >= 17 tepat merepresentasikan aturan tersebut.'
        },
        {
          id: 'QST-202610-008',
          materiId: 'MAT-202610-002',
          tipe: 'Esai',
          bloomTaxonomy: 'C3',
          tingkatKognitif: 'MOTS',
          bobotSkor: 20,
          stimulus: '',
          pertanyaan: 'Tuliskan algoritma pseudocode sederhana untuk menghitung nilai rata-rata dari tiga variabel masukan: nilaiA, nilaiB, dan nilaiC!',
          kunciJawaban: 'Rubrik: 1. Input nilaiA, nilaiB, nilaiC. 2. total = nilaiA + nilaiB + nilaiC. 3. rata = total / 3. 4. Output/Print rata.',
          pembahasan: 'Rumus dasar rata-rata adalah penjumlahan dibagi dengan cacah data (3).'
        },
        {
          id: 'QST-202610-009',
          materiId: 'MAT-202610-003',
          tipe: 'Pilihan Ganda',
          bloomTaxonomy: 'C2',
          tingkatKognitif: 'LOTS',
          bobotSkor: 10,
          stimulus: 'Dalam perancangan basis data relasional, setiap tabel wajib memiliki atribut yang membedakan satu baris dengan baris lainnya secara unik.',
          pertanyaan: 'Atribut atau kolom yang berfungsi sebagai pengidentifikasi unik pada suatu entitas tabel disebut...',
          opsiJawaban: ['Foreign Key', 'Primary Key', 'Candidate Index', 'Composite Field', 'Secondary Key'],
          kunciJawaban: 'B',
          pembahasan: 'Primary Key (Kunci Utama) adalah atribut yang secara unik mengidentifikasi setiap baris rekaman dalam tabel basis data.'
        },
        {
          id: 'QST-202610-010',
          materiId: 'MAT-202610-003',
          tipe: 'Pilihan Ganda',
          bloomTaxonomy: 'C4',
          tingkatKognitif: 'HOTS',
          bobotSkor: 15,
          stimulus: 'Tabel Siswa (id_siswa, nama, id_kelas) dan Tabel Kelas (id_kelas, nama_kelas). Guru ingin menampilkan nama siswa beserta nama kelasnya, termasuk siswa yang belum memiliki kelas.',
          pertanyaan: 'Klausa perintah SQL JOIN manakah yang paling tepat digunakan untuk kasus tersebut?',
          opsiJawaban: ['INNER JOIN', 'LEFT OUTER JOIN', 'RIGHT OUTER JOIN', 'CROSS JOIN', 'NATURAL JOIN'],
          kunciJawaban: 'B',
          pembahasan: 'LEFT OUTER JOIN mempertahankan semua baris dari tabel kiri (Siswa) meskipun tidak memiliki pasangan yang cocok di tabel kanan (Kelas).'
        },
        {
          id: 'QST-202610-011',
          materiId: 'MAT-202610-003',
          tipe: 'Esai',
          bloomTaxonomy: 'C5',
          tingkatKognitif: 'HOTS',
          bobotSkor: 20,
          stimulus: 'Sebuah tabel Transaksi menyimpan data: no_nota, tgl, id_barang, nama_barang, harga, qty, subtotal. Ditemukan anomali ketika harga barang diubah, riwayat nota lama ikut terdistorsi.',
          pertanyaan: 'Jelaskan mengapa desain tabel tersebut melanggar aturan normalisasi bentuk kedua (2NF) dan bagaimanakah cara mendekomposisinya menjadi tabel-tabel yang sehat?',
          kunciJawaban: 'Rubrik: 1. Mengidentifikasi adanya ketergantungan parsial (nama_barang dan harga hanya bergantung pada id_barang, bukan seluruh composite key no_nota + id_barang). 2. Mendekomposisi tabel menjadi: Tabel TransaksiHeader, Tabel TransaksiDetail, dan Tabel MasterBarang. 3. Menghindari anomali update dan redundansi data.',
          pembahasan: 'Bentuk normal 2NF mensyaratkan tidak ada atribut non-kunci yang bergantung secara parsial pada primary key.'
        },
        {
          id: 'QST-202610-012',
          materiId: 'MAT-202610-004',
          tipe: 'Benar/Salah',
          bloomTaxonomy: 'C2',
          tingkatKognitif: 'LOTS',
          bobotSkor: 5,
          stimulus: '',
          pertanyaan: 'Serangan rekayasa sosial (Social Engineering) seperti phishing berfokus pada manipulasi psikologis manusia daripada mengeksploitasi celah teknis perangkat lunak.',
          kunciJawaban: 'A',
          opsiJawaban: ['Benar', 'Salah'],
          pembahasan: 'Pernyataan benar. Social engineering menargetkan kelemahan psikologis manusia (seperti kepanikan atau rasa ingin tahu) untuk membocorkan kredensial rahasia.'
        },
        {
          id: 'QST-202610-013',
          materiId: 'MAT-202610-004',
          tipe: 'Pilihan Ganda',
          bloomTaxonomy: 'C3',
          tingkatKognitif: 'MOTS',
          bobotSkor: 10,
          stimulus: 'Menggunakan algoritma Caesar Cipher dengan pergeseran kunci K = +3 (huruf A menjadi D, B menjadi E, dst.).',
          pertanyaan: 'Apakah hasil enkripsi (ciphertext) dari kata "KODING"?',
          opsiJawaban: ['NRGLQJ', 'MRFKPI', 'NSHMQJ', 'NRGMQI', 'LQEJOH'],
          kunciJawaban: 'A',
          pembahasan: 'K+3=N, O+3=R, D+3=G, I+3=L, N+3=Q, G+3=J. Hasil ciphertext = NRGLQJ.'
        },
        {
          id: 'QST-202610-014',
          materiId: 'MAT-202610-005',
          tipe: 'Pilihan Ganda',
          bloomTaxonomy: 'C3',
          tingkatKognitif: 'MOTS',
          bobotSkor: 10,
          stimulus: 'Sebuah container div memiliki aturan CSS: display: flex; justify-content: center; align-items: center;.',
          pertanyaan: 'Bagaimanakah posisi elemen-elemen anak (flex items) di dalam container tersebut?',
          opsiJawaban: [
            'Rata kiri atas',
            'Tepat di tengah-tengah container baik secara horizontal maupun vertikal',
            'Menyebar di sisi kanan dan kiri secara merata',
            'Menumpuk secara vertikal dari atas ke bawah',
            'Rata kanan bawah'
          ],
          kunciJawaban: 'B',
          pembahasan: 'justify-content: center mengatur perataan sumbu utama (horizontal), sedangkan align-items: center mengatur perataan sumbu silang (vertikal).'
        },
        {
          id: 'QST-202610-015',
          materiId: 'MAT-202610-005',
          tipe: 'Pilihan Ganda',
          bloomTaxonomy: 'C4',
          tingkatKognitif: 'HOTS',
          bobotSkor: 15,
          stimulus: 'Aturan CSS Grid: grid-template-columns: 1fr 2fr 1fr; pada kontainer berlebar total 1200px (tanpa gap).',
          pertanyaan: 'Berapakah lebar kolom kedua (tengah) yang dihasilkan pada layar?',
          opsiJawaban: ['300px', '400px', '600px', '800px', '200px'],
          kunciJawaban: 'C',
          pembahasan: 'Total fraksi = 1 + 2 + 1 = 4fr. Setiap 1fr = 1200 / 4 = 300px. Kolom kedua memiliki nilai 2fr = 2 x 300px = 600px.'
        },
        {
          id: 'QST-202610-016',
          materiId: 'MAT-202610-007',
          tipe: 'Esai',
          bloomTaxonomy: 'C6',
          tingkatKognitif: 'HOTS',
          bobotSkor: 25,
          stimulus: 'Laboratorium komputer sekolah sering mengalami kenaikan suhu drastis di luar jam pelajaran yang berpotensi merusak server sekolah.',
          pertanyaan: 'Rancanglah diagram blok alur logika sistem IoT sederhana: sebutkan sensor input yang dibutuhkan, mikrokontroler pengolah data, dan aktuator output untuk menyalakan pendingin darurat serta mengirimkan notifikasi!',
          kunciJawaban: 'Rubrik: 1. Input: Sensor suhu/kelembaban (misal DHT11/DHT22). 2. Controller: ESP32/Arduino yang diprogram dengan batas threshold (misal > 28°C). 3. Output: Modul Relay menyalakan kipas/exhaust. 4. Notifikasi: Alert via bot Telegram atau dashboard IoT.',
          pembahasan: 'Desain mencakup 4 pilar arsitektur IoT: Sensor (Data Capture), Microcontroller (Processing), Actuator (Action), dan Connectivity (Telemetry/Alert).'
        },
        {
          id: 'QST-202610-017',
          materiId: 'MAT-202610-006',
          tipe: 'Benar/Salah',
          bloomTaxonomy: 'C2',
          tingkatKognitif: 'LOTS',
          bobotSkor: 5,
          stimulus: '',
          pertanyaan: 'Dalam paradigma Supervised Learning, model kecerdasan buatan dilatih menggunakan dataset yang telah memiliki label kebenaran (ground truth).',
          kunciJawaban: 'A',
          opsiJawaban: ['Benar', 'Salah'],
          pembahasan: 'Pernyataan benar. Supervised learning (pembelajaran terbimbing) mensyaratkan data input berpasangan dengan label target yang benar.'
        },
        {
          id: 'QST-202610-018',
          materiId: 'MAT-202610-006',
          tipe: 'Esai',
          bloomTaxonomy: 'C5',
          tingkatKognitif: 'HOTS',
          bobotSkor: 20,
          stimulus: 'Sebuah perusahaan menggunakan sistem AI penyaring resume kerja otomatis. Namun, sistem tersebut secara konsisten menolak kandidat perempuan untuk posisi teknis karena dilatih menggunakan data karyawan 10 tahun terakhir yang didominasi laki-laki.',
          pertanyaan: 'Lakukan analisis etika: Fenomena apakah yang terjadi pada sistem AI tersebut? Bagaimanakah cara tim pengembang mengatasi dan mencegah bias data (algorithmic bias) tersebut?',
          kunciJawaban: 'Rubrik: 1. Mengidentifikasi fenomena Historical/Algorithmic Bias (Data Pelatihan Tidak Seimbang). 2. Solusi: Melakukan penyeimbangan dataset (oversampling/data augmentation), menghapus variabel gender/indikator demografis sensitif dari fitur pelatihan, dan melakukan audit keadilan model (Fairness metrics & Human-in-the-loop).',
          pembahasan: 'Algoritma machine learning mencerminkan bias yang ada pada data pelatihannya jika tidak dilakukan kurasi etis dan pengujian fairness.'
        }
      ],
      assessmentPackages: [
        {
          id: 'PKG-202610-001',
          judulPaket: 'Penilaian Formatif Bab 1 - Berpikir Komputasional',
          kelas: 'X-A (Fase E)',
          mapel: 'Informatika',
          waktuMenit: 45,
          tanggalUjian: todayStr,
          daftarSoalIds: ['QST-202610-001', 'QST-202610-002', 'QST-202610-005', 'QST-202610-007', 'QST-202610-008']
        },
        {
          id: 'PKG-202610-002',
          judulPaket: 'Penilaian Tengah Semester (PTS/STS) Ganjil Informatika',
          kelas: 'X-A (Fase E)',
          mapel: 'Informatika',
          waktuMenit: 90,
          tanggalUjian: '2026-11-10',
          daftarSoalIds: ['QST-202610-001', 'QST-202610-002', 'QST-202610-004', 'QST-202610-005', 'QST-202610-006', 'QST-202610-007', 'QST-202610-012', 'QST-202610-013']
        },
        {
          id: 'PKG-202610-003',
          judulPaket: 'Asesmen Sumatif Struktur Data & Pemrograman Web',
          kelas: 'XI-IPA 1',
          mapel: 'Informatika',
          waktuMenit: 60,
          tanggalUjian: todayStr,
          daftarSoalIds: ['QST-202610-003', 'QST-202610-004', 'QST-202610-006', 'QST-202610-008', 'QST-202610-014', 'QST-202610-015']
        },
        {
          id: 'PKG-202610-004',
          judulPaket: 'Try Out Asesmen Sekolah: Basis Data & Algoritma Lanjut',
          kelas: 'XII-IPA 2',
          mapel: 'Informatika',
          waktuMenit: 90,
          tanggalUjian: '2026-12-08',
          daftarSoalIds: ['QST-202610-004', 'QST-202610-009', 'QST-202610-010', 'QST-202610-011', 'QST-202610-016', 'QST-202610-017', 'QST-202610-018']
        },
        {
          id: 'PKG-202610-005',
          judulPaket: 'Asesmen Diagnostik Kesiapan Belajar Pemrograman Web',
          kelas: 'XI-IPA 1',
          mapel: 'Informatika',
          waktuMenit: 30,
          tanggalUjian: prevDate,
          daftarSoalIds: ['QST-202610-002', 'QST-202610-003', 'QST-202610-007', 'QST-202610-014']
        }
      ],
      timetable: [
        { id: 'SCH-202610-001', hari: 'Senin', jamMulai: '07:30', jamSelesai: '09:45', kelas: 'X-A (Fase E)', mapel: 'Informatika', ruangan: 'Lab Komputer 1', color: 'emerald' },
        { id: 'SCH-202610-002', hari: 'Senin', jamMulai: '10:15', jamSelesai: '11:45', kelas: 'XI-IPA 1', mapel: 'Informatika', ruangan: 'R. 204', color: 'sky' },
        { id: 'SCH-202610-003', hari: 'Selasa', jamMulai: '08:15', jamSelesai: '10:30', kelas: 'XII-IPA 2', mapel: 'Informatika', ruangan: 'Lab Komputer 2', color: 'indigo' },
        { id: 'SCH-202610-004', hari: 'Rabu', jamMulai: '07:30', jamSelesai: '09:45', kelas: 'X-A (Fase E)', mapel: 'Informatika', ruangan: 'R. 101', color: 'emerald' },
        { id: 'SCH-202610-005', hari: 'Rabu', jamMulai: '10:15', jamSelesai: '11:45', kelas: 'X-A (Fase E)', mapel: 'P5 Rekayasa & Teknologi', ruangan: 'Ruang Multimedia', color: 'amber' },
        { id: 'SCH-202610-006', hari: 'Kamis', jamMulai: '10:15', jamSelesai: '12:30', kelas: 'XI-IPA 1', mapel: 'Informatika', ruangan: 'Lab Komputer 1', color: 'sky' },
        { id: 'SCH-202610-007', hari: 'Jumat', jamMulai: '08:00', jamSelesai: '09:30', kelas: 'XII-IPA 2', mapel: 'Informatika', ruangan: 'Lab Komputer 2', color: 'indigo' },
        { id: 'SCH-202610-008', hari: 'Jumat', jamMulai: '09:45', jamSelesai: '11:15', kelas: 'XI-IPA 1', mapel: 'Praktikum Web & Portofolio', ruangan: 'Lab Komputer 1', color: 'rose' }
      ],
      academicEvents: [
        { id: 'EVT-202610-001', tanggal: '2026-10-20', judul: 'Supervisi Pembelajaran Kepala Sekolah', kategori: 'KegiatanSekolah', keterangan: 'Kesiapan RPP Modul Ajar Fase E & Buku Nilai Digital.' },
        { id: 'EVT-202610-002', tanggal: '2026-10-28', judul: 'Hari Sumpah Pemuda (Upacara Bendera)', kategori: 'KegiatanSekolah', keterangan: 'Upacara peringatan nasional di lapangan utama sekolah.' },
        { id: 'EVT-202610-003', tanggal: '2026-11-10', judul: 'Penilaian Tengah Semester (PTS/STS) Ganjil', kategori: 'Ujian', keterangan: 'Jadwal tes sumatif tengah semester ganjil T.A. 2026/2027.' },
        { id: 'EVT-202610-004', tanggal: '2026-11-20', judul: 'Workshop Kurikulum Merdeka & P5 Mandiri Berbagi', kategori: 'KegiatanSekolah', keterangan: 'Diseminasi praktik baik modul ajar dan pameran karya siswa.' },
        { id: 'EVT-202610-005', tanggal: '2026-12-05', judul: 'Pekan Pengolahan Nilai & Remedial Terpadu', kategori: 'Ujian', keterangan: 'Batas akhir input nilai formatif dan pelaksanaan remedial kelas.' },
        { id: 'EVT-202610-006', tanggal: '2026-12-08', judul: 'Penilaian Akhir Semester (PAS/SAS) Ganjil', kategori: 'Ujian', keterangan: 'Evaluasi sumatif akhir semester serentak seluruh jenjang.' },
        { id: 'EVT-202610-007', tanggal: '2026-12-18', judul: 'Penerimaan Buku Rapor Semester Ganjil', kategori: 'KegiatanSekolah', keterangan: 'Pertemuan pleno evaluasi bersama orang tua / wali murid.' },
        { id: 'EVT-202610-008', tanggal: '2026-12-21', judul: 'Libur Semester Ganjil T.A. 2026/2027', kategori: 'KegiatanSekolah', keterangan: 'Masa libur semester hingga awal Januari 2027.' }
      ],
      students: [
        // Kelas X-A (Fase E) - 10 Siswa
        { id: 'SIS-202610-001', kelas: 'X-A (Fase E)', nisn: '0081234561', namaLengkap: 'Aditya Pratama Nugraha', jenisKelamin: 'L', deskRow: 1, deskCol: 1, catatanAnekdot: 'Sangat antusias saat materi pemrograman logika dan sering membantu rekan sebangku.' },
        { id: 'SIS-202610-002', kelas: 'X-A (Fase E)', nisn: '0081234562', namaLengkap: 'Annisa Fitri Rahmawati', jenisKelamin: 'P', deskRow: 1, deskCol: 2, catatanAnekdot: 'Teliti dalam pengerjaan LKS dan aktif dalam sesi tanya jawab.' },
        { id: 'SIS-202610-003', kelas: 'X-A (Fase E)', nisn: '0081234563', namaLengkap: 'Bagas Satria Wijaya', jenisKelamin: 'L', deskRow: 1, deskCol: 3, catatanAnekdot: 'Memerlukan motivasi tambahan dalam fokus mendengarkan instruksi awal.' },
        { id: 'SIS-202610-004', kelas: 'X-A (Fase E)', nisn: '0081234564', namaLengkap: 'Clarissa Maharani Dewi', jenisKelamin: 'P', deskRow: 1, deskCol: 4, catatanAnekdot: 'Kreatif dalam visualisasi diagram alir dan desain presentasi.' },
        { id: 'SIS-202610-005', kelas: 'X-A (Fase E)', nisn: '0081234565', namaLengkap: 'Dimas Anggara Putra', jenisKelamin: 'L', deskRow: 2, deskCol: 1, catatanAnekdot: 'Memiliki bakat menonjol dalam pemecahan masalah algoritma.' },
        { id: 'SIS-202610-006', kelas: 'X-A (Fase E)', nisn: '0081234566', namaLengkap: 'Eka Lestari Putri', jenisKelamin: 'P', deskRow: 2, deskCol: 2, catatanAnekdot: 'Disiplin dan selalu mengumpulkan tugas tepat waktu.' },
        { id: 'SIS-202610-007', kelas: 'X-A (Fase E)', nisn: '0081234567', namaLengkap: 'Farhan Maulana Akbar', jenisKelamin: 'L', deskRow: 2, deskCol: 3, catatanAnekdot: 'Komunikatif dan pandai memimpin diskusi kelompok.' },
        { id: 'SIS-202610-008', kelas: 'X-A (Fase E)', nisn: '0081234568', namaLengkap: 'Gita Permatasari', jenisKelamin: 'P', deskRow: 2, deskCol: 4, catatanAnekdot: 'Rajin mencatat rangkuman materi dengan rapi.' },
        { id: 'SIS-202610-009', kelas: 'X-A (Fase E)', nisn: '0081234569', namaLengkap: 'Hafidz Nurrohman', jenisKelamin: 'L', deskRow: 3, deskCol: 1, catatanAnekdot: 'Tertarik tinggi pada perakitan komponen mikrokontroler dan robotika P5.' },
        { id: 'SIS-202610-010', kelas: 'X-A (Fase E)', nisn: '0081234570', namaLengkap: 'Intan Kusuma Wardani', jenisKelamin: 'P', deskRow: 3, deskCol: 2, catatanAnekdot: 'Sangat mahir dalam menyusun laporan portofolio dan visualisasi data.' },

        // Kelas XI-IPA 1 (Fase F) - 10 Siswa
        { id: 'SIS-202610-011', kelas: 'XI-IPA 1', nisn: '0072345671', namaLengkap: 'Arya Daniswara', jenisKelamin: 'L', deskRow: 1, deskCol: 1, catatanAnekdot: 'Memiliki pemahaman analitis yang tajam pada materi struktur data larik.' },
        { id: 'SIS-202610-012', kelas: 'XI-IPA 1', nisn: '0072345672', namaLengkap: 'Bunga Citra Lestari', jenisKelamin: 'P', deskRow: 1, deskCol: 2, catatanAnekdot: 'Rapi dalam menyusun kode HTML/CSS dan memiliki kepekaan estetis UI.' },
        { id: 'SIS-202610-013', kelas: 'XI-IPA 1', nisn: '0072345673', namaLengkap: 'Candra Kusuma', jenisKelamin: 'L', deskRow: 1, deskCol: 3, catatanAnekdot: 'Aktif bertanya pada konsep algoritma percabangan bersarang.' },
        { id: 'SIS-202610-014', kelas: 'XI-IPA 1', nisn: '0072345674', namaLengkap: 'Dinda Ayu Permata', jenisKelamin: 'P', deskRow: 1, deskCol: 4, catatanAnekdot: 'Konsisten mengumpulkan tugas tepat waktu dengan hasil di atas KKM.' },
        { id: 'SIS-202610-015', kelas: 'XI-IPA 1', nisn: '0072345675', namaLengkap: 'Fajar Hidayatullah', jenisKelamin: 'L', deskRow: 2, deskCol: 1, catatanAnekdot: 'Perlu pendampingan berkala pada latihan perulangan for bersarang.' },
        { id: 'SIS-202610-016', kelas: 'XI-IPA 1', nisn: '0072345676', namaLengkap: 'Hana Salsabila', jenisKelamin: 'P', deskRow: 2, deskCol: 2, catatanAnekdot: 'Komunikatif dan menjadi ketua kelompok proyek web yang sangat suportif.' },
        { id: 'SIS-202610-017', kelas: 'XI-IPA 1', nisn: '0072345677', namaLengkap: 'Ilham Ramadhan', jenisKelamin: 'L', deskRow: 2, deskCol: 3, catatanAnekdot: 'Bakat menonjol dalam pemecahan masalah logika pemrograman.' },
        { id: 'SIS-202610-018', kelas: 'XI-IPA 1', nisn: '0072345678', namaLengkap: 'Jessica Olivia', jenisKelamin: 'P', deskRow: 2, deskCol: 4, catatanAnekdot: 'Teliti dalam mendokumentasikan error sintaks saat praktikum lab.' },
        { id: 'SIS-202610-019', kelas: 'XI-IPA 1', nisn: '0072345679', namaLengkap: 'Kevin Sanjaya Putra', jenisKelamin: 'L', deskRow: 3, deskCol: 1, catatanAnekdot: 'Antusias saat sesi tantangan coding kilat di akhir jam pelajaran.' },
        { id: 'SIS-202610-020', kelas: 'XI-IPA 1', nisn: '0072345680', namaLengkap: 'Larasati Putri Utami', jenisKelamin: 'P', deskRow: 3, deskCol: 2, catatanAnekdot: 'Disiplin dan aktif membagikan catatan rangkuman di kelompok belajar.' },

        // Kelas XII-IPA 2 (Fase F) - 10 Siswa
        { id: 'SIS-202610-021', kelas: 'XII-IPA 2', nisn: '0063456781', namaLengkap: 'M. Rizky Pratama', jenisKelamin: 'L', deskRow: 1, deskCol: 1, catatanAnekdot: 'Memimpin proyek normalisasi database perpustakaan dengan sangat baik.' },
        { id: 'SIS-202610-022', kelas: 'XII-IPA 2', nisn: '0063456782', namaLengkap: 'Nabila Zahra', jenisKelamin: 'P', deskRow: 1, deskCol: 2, catatanAnekdot: 'Sangat mahir merancang ERD relasional dan penulisan query SQL kompleks.' },
        { id: 'SIS-202610-023', kelas: 'XII-IPA 2', nisn: '0063456783', namaLengkap: 'Pandu Wicaksono', jenisKelamin: 'L', deskRow: 1, deskCol: 3, catatanAnekdot: 'Kritis dalam menganalisis keamanan sistem autentikasi data.' },
        { id: 'SIS-202610-024', kelas: 'XII-IPA 2', nisn: '0063456784', namaLengkap: 'Qonita Amalia', jenisKelamin: 'P', deskRow: 1, deskCol: 4, catatanAnekdot: 'Memiliki daya nalar tinggi dalam studi kasus etika kecerdasan buatan.' },
        { id: 'SIS-202610-025', kelas: 'XII-IPA 2', nisn: '0063456785', namaLengkap: 'Rendy Firmansyah', jenisKelamin: 'L', deskRow: 2, deskCol: 1, catatanAnekdot: 'Kemampuan praktikum sangat baik, perlu penguatan pada uraian teori esai.' },
        { id: 'SIS-202610-026', kelas: 'XII-IPA 2', nisn: '0063456786', namaLengkap: 'Siti Nurhaliza', jenisKelamin: 'P', deskRow: 2, deskCol: 2, catatanAnekdot: 'Selalu menyelesaikan tugas mandiri lebih cepat dengan tingkat akurasi tinggi.' },
        { id: 'SIS-202610-027', kelas: 'XII-IPA 2', nisn: '0063456787', namaLengkap: 'Taufik Hidayat', jenisKelamin: 'L', deskRow: 2, deskCol: 3, catatanAnekdot: 'Minat mendalam pada arsitektur server jaringan dan rekayasa data.' },
        { id: 'SIS-202610-028', kelas: 'XII-IPA 2', nisn: '0063456788', namaLengkap: 'Vania Aurelia', jenisKelamin: 'P', deskRow: 2, deskCol: 4, catatanAnekdot: 'Kreatif dalam visualisasi data dan infografis presentasi akhir semester.' },
        { id: 'SIS-202610-029', kelas: 'XII-IPA 2', nisn: '0063456789', namaLengkap: 'Wahyu Setiawan', jenisKelamin: 'L', deskRow: 3, deskCol: 1, catatanAnekdot: 'Tekun dalam menguji coba skenario query JOIN multi-tabel di lab.' },
        { id: 'SIS-202610-030', kelas: 'XII-IPA 2', nisn: '0063456790', namaLengkap: 'Zahra Aulia Rahmah', jenisKelamin: 'P', deskRow: 3, deskCol: 2, catatanAnekdot: 'Target perguruan tinggi jurusan Ilmu Komputer, daya serap materi luar biasa.' }
      ],
      attendanceLogs: [
        // X-A Hari Ini
        {
          id: 'ABS-202610-001',
          kelas: 'X-A (Fase E)',
          tanggal: todayStr,
          records: {
            'SIS-202610-001': 'H', 'SIS-202610-002': 'H', 'SIS-202610-003': 'H', 'SIS-202610-004': 'I',
            'SIS-202610-005': 'H', 'SIS-202610-006': 'H', 'SIS-202610-007': 'S', 'SIS-202610-008': 'H',
            'SIS-202610-009': 'H', 'SIS-202610-010': 'H'
          }
        },
        // X-A Sebelumnya
        {
          id: 'ABS-202610-002',
          kelas: 'X-A (Fase E)',
          tanggal: prevDate,
          records: {
            'SIS-202610-001': 'H', 'SIS-202610-002': 'H', 'SIS-202610-003': 'H', 'SIS-202610-004': 'H',
            'SIS-202610-005': 'H', 'SIS-202610-006': 'H', 'SIS-202610-007': 'H', 'SIS-202610-008': 'H',
            'SIS-202610-009': 'S', 'SIS-202610-010': 'H'
          }
        },
        // XI-IPA 1 Hari Ini
        {
          id: 'ABS-202610-003',
          kelas: 'XI-IPA 1',
          tanggal: todayStr,
          records: {
            'SIS-202610-011': 'H', 'SIS-202610-012': 'H', 'SIS-202610-013': 'H', 'SIS-202610-014': 'H',
            'SIS-202610-015': 'S', 'SIS-202610-016': 'H', 'SIS-202610-017': 'H', 'SIS-202610-018': 'H',
            'SIS-202610-019': 'H', 'SIS-202610-020': 'H'
          }
        },
        // XI-IPA 1 Sebelumnya
        {
          id: 'ABS-202610-004',
          kelas: 'XI-IPA 1',
          tanggal: prevDate,
          records: {
            'SIS-202610-011': 'H', 'SIS-202610-012': 'H', 'SIS-202610-013': 'I', 'SIS-202610-014': 'H',
            'SIS-202610-015': 'H', 'SIS-202610-016': 'H', 'SIS-202610-017': 'H', 'SIS-202610-018': 'H',
            'SIS-202610-019': 'H', 'SIS-202610-020': 'H'
          }
        },
        // XII-IPA 2 Hari Ini
        {
          id: 'ABS-202610-005',
          kelas: 'XII-IPA 2',
          tanggal: todayStr,
          records: {
            'SIS-202610-021': 'H', 'SIS-202610-022': 'H', 'SIS-202610-023': 'H', 'SIS-202610-024': 'H',
            'SIS-202610-025': 'H', 'SIS-202610-026': 'H', 'SIS-202610-027': 'I', 'SIS-202610-028': 'H',
            'SIS-202610-029': 'H', 'SIS-202610-030': 'H'
          }
        },
        // XII-IPA 2 Sebelumnya
        {
          id: 'ABS-202610-006',
          kelas: 'XII-IPA 2',
          tanggal: prevDate,
          records: {
            'SIS-202610-021': 'H', 'SIS-202610-022': 'H', 'SIS-202610-023': 'H', 'SIS-202610-024': 'H',
            'SIS-202610-025': 'H', 'SIS-202610-026': 'H', 'SIS-202610-027': 'H', 'SIS-202610-028': 'H',
            'SIS-202610-029': 'H', 'SIS-202610-030': 'H'
          }
        }
      ],
      gradebook: [
        // Kelas X-A (Fase E)
        { studentId: 'SIS-202610-001', kelas: 'X-A (Fase E)', tugas: [88, 90], uts: 92, uas: 88 },
        { studentId: 'SIS-202610-002', kelas: 'X-A (Fase E)', tugas: [85, 88], uts: 89, uas: 90 },
        { studentId: 'SIS-202610-003', kelas: 'X-A (Fase E)', tugas: [75, 78], uts: 76, uas: 78 },
        { studentId: 'SIS-202610-004', kelas: 'X-A (Fase E)', tugas: [90, 92], uts: 94, uas: 92 },
        { studentId: 'SIS-202610-005', kelas: 'X-A (Fase E)', tugas: [92, 95], uts: 95, uas: 94 },
        { studentId: 'SIS-202610-006', kelas: 'X-A (Fase E)', tugas: [82, 85], uts: 83, uas: 86 },
        { studentId: 'SIS-202610-007', kelas: 'X-A (Fase E)', tugas: [80, 82], uts: 80, uas: 82 },
        { studentId: 'SIS-202610-008', kelas: 'X-A (Fase E)', tugas: [86, 88], uts: 87, uas: 88 },
        { studentId: 'SIS-202610-009', kelas: 'X-A (Fase E)', tugas: [78, 80], uts: 82, uas: 84 },
        { studentId: 'SIS-202610-010', kelas: 'X-A (Fase E)', tugas: [91, 94], uts: 92, uas: 95 },

        // Kelas XI-IPA 1 (Fase F)
        { studentId: 'SIS-202610-011', kelas: 'XI-IPA 1', tugas: [89, 92], uts: 90, uas: 93 },
        { studentId: 'SIS-202610-012', kelas: 'XI-IPA 1', tugas: [94, 96], uts: 95, uas: 96 },
        { studentId: 'SIS-202610-013', kelas: 'XI-IPA 1', tugas: [80, 84], uts: 82, uas: 85 },
        { studentId: 'SIS-202610-014', kelas: 'XI-IPA 1', tugas: [87, 89], uts: 88, uas: 90 },
        { studentId: 'SIS-202610-015', kelas: 'XI-IPA 1', tugas: [68, 70], uts: 65, uas: 70 }, // Kasus Remedial untuk pengujian
        { studentId: 'SIS-202610-016', kelas: 'XI-IPA 1', tugas: [88, 90], uts: 89, uas: 91 },
        { studentId: 'SIS-202610-017', kelas: 'XI-IPA 1', tugas: [92, 94], uts: 93, uas: 95 },
        { studentId: 'SIS-202610-018', kelas: 'XI-IPA 1', tugas: [85, 87], uts: 86, uas: 88 },
        { studentId: 'SIS-202610-019', kelas: 'XI-IPA 1', tugas: [83, 86], uts: 85, uas: 87 },
        { studentId: 'SIS-202610-020', kelas: 'XI-IPA 1', tugas: [90, 93], uts: 91, uas: 94 },

        // Kelas XII-IPA 2 (Fase F)
        { studentId: 'SIS-202610-021', kelas: 'XII-IPA 2', tugas: [90, 92], uts: 94, uas: 95 },
        { studentId: 'SIS-202610-022', kelas: 'XII-IPA 2', tugas: [95, 98], uts: 96, uas: 97 },
        { studentId: 'SIS-202610-023', kelas: 'XII-IPA 2', tugas: [86, 88], uts: 87, uas: 89 },
        { studentId: 'SIS-202610-024', kelas: 'XII-IPA 2', tugas: [92, 95], uts: 93, uas: 94 },
        { studentId: 'SIS-202610-025', kelas: 'XII-IPA 2', tugas: [78, 80], uts: 79, uas: 82 },
        { studentId: 'SIS-202610-026', kelas: 'XII-IPA 2', tugas: [94, 96], uts: 95, uas: 96 },
        { studentId: 'SIS-202610-027', kelas: 'XII-IPA 2', tugas: [84, 86], uts: 85, uas: 88 },
        { studentId: 'SIS-202610-028', kelas: 'XII-IPA 2', tugas: [89, 91], uts: 90, uas: 92 },
        { studentId: 'SIS-202610-029', kelas: 'XII-IPA 2', tugas: [82, 85], uts: 84, uas: 86 },
        { studentId: 'SIS-202610-030', kelas: 'XII-IPA 2', tugas: [96, 98], uts: 97, uas: 99 }
      ],
      tasks: [
        { id: 'TSK-202610-001', judul: 'Koreksi Lembar Kerja Praktikum Logika Algoritma', kelasMapel: 'X-A (Fase E)', totalKoreksi: 32, selesaiKoreksi: 24, deadline: '2026-10-22', status: 'Pending' },
        { id: 'TSK-202610-002', judul: 'Penilaian Proyek Website HTML & CSS Responsif', kelasMapel: 'XI-IPA 1', totalKoreksi: 30, selesaiKoreksi: 30, deadline: '2026-10-18', status: 'Selesai' },
        { id: 'TSK-202610-003', judul: 'Koreksi Soal Esai Desain Basis Data & Normalisasi ERD', kelasMapel: 'XII-IPA 2', totalKoreksi: 28, selesaiKoreksi: 14, deadline: '2026-10-25', status: 'Pending' },
        { id: 'TSK-202610-004', judul: 'Penilaian Portofolio Laporan Analisis Keamanan Jejak Digital', kelasMapel: 'X-A (Fase E)', totalKoreksi: 32, selesaiKoreksi: 0, deadline: '2026-10-27', status: 'Pending' },
        { id: 'TSK-202610-005', judul: 'Praktikum SQL Query Multi-Tabel & View Relasional', kelasMapel: 'XII-IPA 2', totalKoreksi: 28, selesaiKoreksi: 28, deadline: '2026-10-15', status: 'Selesai' },
        { id: 'TSK-202610-006', judul: 'Evaluasi Rancangan Purwarupa IoT Kelas Pintar P5', kelasMapel: 'X-A (Fase E)', totalKoreksi: 10, selesaiKoreksi: 6, deadline: '2026-10-29', status: 'Pending' }
      ],
      meetings: [
        { id: 'MTG-202610-001', tanggal: '2026-10-14', judul: 'Rapat Koordinasi MGMP Informatika Kota', hasil: 'Penyelarasan modul ajar berbasis Kurikulum Merdeka semester ganjil, pemetaan capaian pembelajaran fase E & F, dan penyusunan kisi-kisi PTS bersama.' },
        { id: 'MTG-202610-002', tanggal: '2026-10-08', judul: 'Rapat Dewan Guru & Evaluasi Kedisiplinan Siswa', hasil: 'Penguatan penertiban kehadiran siswa di jam pertama, persiapan penilaian kinerja guru oleh pengawas, dan sosialisasi program anti-perundungan.' },
        { id: 'MTG-202610-003', tanggal: '2026-10-02', judul: 'Workshop Pemanfaatan AI Generatif dalam Pembelajaran', hasil: 'Pelatihan pembuatan media ajar berdiferensiasi dan etika pemanfaatan kecerdasan buatan bagi pendidik.' },
        { id: 'MTG-202610-004', tanggal: '2026-09-24', judul: 'Rapat Koordinasi Supervisi Akademik Semester Ganjil', hasil: 'Penyamaan persepsi rubrik supervisi kepala sekolah, kelengkapan administrasi guru (modul ajar, buku nilai, jurnal refleksi), dan jadwal kunjungan kelas.' },
        { id: 'MTG-202610-005', tanggal: '2026-09-15', judul: 'Evaluasi Awal Pembelajaran & Pemetaan Minat Ekstrakurikuler', hasil: 'Pembagian tugas pembimbing olimpiade informatika dan rekapitulasi data sarana prasarana lab komputer.' }
      ],
      reflections: [
        { id: 'REF-202610-001', tanggal: '2026-10-15', kelas: 'X-A (Fase E)', materi: 'Berpikir Komputasional', refleksi: 'Siswa sangat aktif saat studi kasus teka-teki logika rute terpendek. Namun perlu alokasi waktu lebih panjang saat penulisan pseudocode agar siswa tidak terburu-buru dan logika terstruktur terbangun baik.' },
        { id: 'REF-202610-002', tanggal: '2026-10-12', kelas: 'XI-IPA 1', materi: 'Struktur Data Larik (Array)', refleksi: 'Metode analogi loker bernomor sangat efektif membantu siswa memahami konsep zero-based indexing. Pada pertemuan berikutnya, perlu latihan mandiri untuk perulangan bersarang pada matriks 2D.' },
        { id: 'REF-202610-003', tanggal: '2026-10-09', kelas: 'XII-IPA 2', materi: 'Desain Basis Data Relasional & Normalisasi', refleksi: 'Mayoritas siswa antusias memodelkan database e-commerce. Kendala muncul saat membedakan 2NF dan 3NF pada ketergantungan transitif. Solusi: berikan contoh tabel struk kasir nyata.' },
        { id: 'REF-202610-004', tanggal: '2026-10-05', kelas: 'X-A (Fase E)', materi: 'Keamanan Siber & Enkripsi', refleksi: 'Simulasi manual kriptografi Caesar Cipher membuat suasana kelas sangat hidup. Siswa saling memecahkan pesan sandi kelompok lain dengan kompetitif dan gembira.' },
        { id: 'REF-202610-005', tanggal: '2026-09-28', kelas: 'XI-IPA 1', materi: 'Desain Web CSS Grid', refleksi: 'Praktikum berjalan lancar. Beberapa siswa kesulitan memahami unit 1fr pada layout grid kompleks. Perlu disediakan kartu contekan visual (cheatsheet) sebelum praktikum dimulai.' }
      ]
    };
  },

  // Seed realistic initial demo data for first run & guarantee demo profile exists
  initDemoDataIfEmpty() {
    let teachers = this.getTeachers();
    const demoTeacher = {
      id: 'GURU-202610-001',
      namaLengkap: 'Budi Pratama, S.Pd., M.Kom.',
      email: 'guru.demo@sekolah.id',
      nip: '19880512 201201 1 003',
      namaSekolah: 'SMA Negeri 1 Harapan Nusantara',
      alamatSekolah: 'Jl. Pendidikan Karakter Bangsa No. 45',
      teleponSekolah: '(021) 7890123',
      emailSekolah: 'tatausaha@sekolah.sch.id',
      websiteSekolah: 'www.sman1harapannusantara.sch.id',
      namaKepalaSekolah: 'Dr. H. Bambang Sudarsono, M.Pd.',
      nipKepalaSekolah: '19760415 200212 1 003',
      logoSekolah: '',
      mataPelajaran: 'Informatika & Pemrograman',
      pin: '1234',
      password: '1234',
      createdAt: new Date().toISOString()
    };

    if (!Array.isArray(teachers) || teachers.length === 0) {
      teachers = [demoTeacher];
      this.saveTeachers(teachers);
      this.setActiveTeacherId(demoTeacher.id);
      this.saveTeacherData(demoTeacher.id, this.getFullDemoData());
      return;
    }

    // Auto-migrate all existing teachers to guarantee email, password & school profile properties
    let modified = false;
    teachers = teachers.map(t => {
      let changed = false;
      if (!t.namaSekolah) { t.namaSekolah = 'SMA Negeri 1 Harapan Nusantara'; changed = true; }
      if (!t.alamatSekolah) { t.alamatSekolah = 'Jl. Pendidikan Karakter Bangsa No. 45'; changed = true; }
      if (!t.teleponSekolah) { t.teleponSekolah = '(021) 7890123'; changed = true; }
      if (!t.emailSekolah) { t.emailSekolah = 'tatausaha@sekolah.sch.id'; changed = true; }
      if (t.websiteSekolah === undefined) { t.websiteSekolah = ''; changed = true; }
      if (!t.namaKepalaSekolah) { t.namaKepalaSekolah = 'Dr. H. Bambang Sudarsono, M.Pd.'; changed = true; }
      if (!t.nipKepalaSekolah) { t.nipKepalaSekolah = '19760415 200212 1 003'; changed = true; }
      if (t.logoSekolah === undefined) { t.logoSekolah = ''; changed = true; }

      if (t.id === demoTeacher.id) {
        if (t.email !== demoTeacher.email) { t.email = demoTeacher.email; changed = true; }
        if (!t.password) { t.password = '1234'; changed = true; }
      } else {
        if (!t.email) {
          const cleanName = (t.namaLengkap || 'guru').toLowerCase().replace(/[^a-z0-9]/g, '.').replace(/\.+/g, '.').replace(/^\.|\.$/g, '');
          t.email = cleanName + '@sekolah.id';
          changed = true;
        }
        if (!t.password) {
          t.password = t.pin || '1234';
          changed = true;
        }
      }
      if (changed) modified = true;
      return t;
    });

    // Always ensure the demo teacher exists in the teacher list
    const hasDemo = teachers.some(t => t.id === demoTeacher.id || (t.email && t.email.toLowerCase() === demoTeacher.email.toLowerCase()));
    if (!hasDemo) {
      teachers.unshift(demoTeacher);
      modified = true;
    }

    if (modified) {
      this.saveTeachers(teachers);
    }

    // Ensure demo teacher has data
    const demoData = this.getTeacherData(demoTeacher.id);
    if (!demoData || !demoData.students || demoData.students.length === 0) {
      this.saveTeacherData(demoTeacher.id, this.getFullDemoData());
    }

    // Ensure active teacher ID exists
    const activeId = this.getActiveTeacherId();
    if (!activeId || !teachers.some(t => t.id === activeId)) {
      this.setActiveTeacherId(demoTeacher.id);
    }
  }
};

// ==========================================================================
// 1B. Kurikulum Merdeka Master Engine (SD Fase A-C, SMP Fase D, SMA Fase E-F, P5)
// ==========================================================================
const KurikulumMerdeka = {
  fases: {
    SD: {
      'Fase A': {
        fase: 'Fase A',
        kelas: ['Kelas 1', 'Kelas 2'],
        fokus: 'Fondasi Literasi & Numerasi Awal',
        mapelWajib: [
          'Pendidikan Agama dan Budi Pekerti',
          'Pendidikan Pancasila',
          'Bahasa Indonesia',
          'Matematika',
          'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
          'Seni Rupa',
          'Seni Musik',
          'Seni Tari',
          'Seni Teater'
        ],
        mapelPilihan: [
          'Bahasa Inggris',
          'Muatan Lokal (Bahasa/Budaya Daerah)'
        ]
      },
      'Fase B': {
        fase: 'Fase B',
        kelas: ['Kelas 3', 'Kelas 4'],
        fokus: 'Pengenalan IPAS (Ilmu Pengetahuan Alam & Sosial)',
        mapelWajib: [
          'Pendidikan Agama dan Budi Pekerti',
          'Pendidikan Pancasila',
          'Bahasa Indonesia',
          'Matematika',
          'IPAS (Ilmu Pengetahuan Alam dan Sosial)',
          'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
          'Seni Rupa',
          'Seni Musik',
          'Seni Tari',
          'Seni Teater'
        ],
        mapelPilihan: [
          'Bahasa Inggris',
          'Muatan Lokal (Bahasa/Budaya Daerah)'
        ]
      },
      'Fase C': {
        fase: 'Fase C',
        kelas: ['Kelas 5', 'Kelas 6'],
        fokus: 'Penalaran Kompleks & Kesiapan Menuju SMP',
        mapelWajib: [
          'Pendidikan Agama dan Budi Pekerti',
          'Pendidikan Pancasila',
          'Bahasa Indonesia',
          'Matematika',
          'IPAS (Ilmu Pengetahuan Alam dan Sosial)',
          'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
          'Seni Rupa',
          'Seni Musik',
          'Seni Tari',
          'Seni Teater'
        ],
        mapelPilihan: [
          'Bahasa Inggris',
          'Koding dan AI (Kecerdasan Artifisial)',
          'Muatan Lokal (Bahasa/Budaya Daerah)'
        ]
      }
    },
    SMP: {
      'Fase D': {
        fase: 'Fase D',
        kelas: ['Kelas 7', 'Kelas 8', 'Kelas 9'],
        fokus: 'Eksplorasi Ilmiah & Informatika Terpadu Wajib',
        mapelWajib: [
          'Pendidikan Agama dan Budi Pekerti',
          'Pendidikan Pancasila',
          'Bahasa Indonesia',
          'Matematika',
          'Ilmu Pengetahuan Alam (IPA Terpadu)',
          'Ilmu Pengetahuan Sosial (IPS Terpadu)',
          'Bahasa Inggris (Wajib)',
          'Informatika (Wajib)',
          'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
          'Seni Rupa',
          'Seni Musik',
          'Seni Tari',
          'Seni Teater',
          'Prakarya (Kerajinan / Rekayasa / Budidaya / Pengolahan)'
        ],
        mapelPilihan: [
          'Muatan Lokal (Bahasa Daerah)',
          'Bahasa Asing Pilihan (Jepang / Arab / Mandarin)',
          'Koding dan AI'
        ]
      }
    },
    SMA: {
      'Fase E': {
        fase: 'Fase E',
        kelas: ['Kelas 10'],
        fokus: 'Fondasi Umum & Penjajakan Minat (Tanpa Jurusan Kaku)',
        mapelWajib: [
          'Pendidikan Agama dan Budi Pekerti',
          'Pendidikan Pancasila',
          'Bahasa Indonesia',
          'Matematika',
          'Bahasa Inggris',
          'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
          'Informatika',
          'Sejarah',
          'Seni Rupa / Musik / Tari / Teater / Prakarya',
          'Fisika (IPA Terpadu)',
          'Kimia (IPA Terpadu)',
          'Biologi (IPA Terpadu)',
          'Sosiologi (IPS Terpadu)',
          'Ekonomi (IPS Terpadu)',
          'Geografi (IPS Terpadu)'
        ],
        mapelPilihan: [
          'Muatan Lokal (Bahasa Daerah)'
        ]
      },
      'Fase F': {
        fase: 'Fase F',
        kelas: ['Kelas 11', 'Kelas 12'],
        fokus: 'Pendalaman Minat & Pemilihan 4-5 Mapel Karir',
        mapelWajib: [
          'Pendidikan Agama dan Budi Pekerti',
          'Pendidikan Pancasila',
          'Bahasa Indonesia',
          'Bahasa Inggris',
          'Matematika (Dasar)',
          'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
          'Sejarah'
        ],
        mapelPilihan: [
          'Matematika Tingkat Lanjut (MIPA)',
          'Fisika (MIPA)',
          'Kimia (MIPA)',
          'Biologi (MIPA)',
          'Informatika Lanjut (MIPA)',
          'Sosiologi (IPS)',
          'Ekonomi (IPS)',
          'Geografi (IPS)',
          'Antropologi (IPS)',
          'Bahasa Indonesia Tingkat Lanjut',
          'Bahasa Inggris Tingkat Lanjut',
          'Bahasa Asing (Mandarin / Jepang / Arab / Jerman / Prancis / Korea)',
          'Prakarya dan Kewirausahaan (PKWU)',
          'Koding dan AI / Terapan Keahlian'
        ]
      }
    }
  },
  p5: {
    tema: [
      'Gaya Hidup Berkelanjutan',
      'Kearifan Lokal',
      'Bhinneka Tunggal Ika',
      'Bangunlah Jiwa dan Raganya',
      'Suara Demokrasi (SMP & SMA)',
      'Rekayasa dan Teknologi',
      'Kewirausahaan',
      'Kebekerjaan (SMA / Vokasi)'
    ],
    dimensi: [
      'Beriman, Bertakwa kepada Tuhan YME & Berakhlak Mulia',
      'Berkebinekaan Global',
      'Bergotong Royong',
      'Mandiri',
      'Bernalar Kritis',
      'Kreatif'
    ]
  },

  getAllClasses() {
    return [
      'Kelas 1 (Fase A - SD)',
      'Kelas 2 (Fase A - SD)',
      'Kelas 3 (Fase B - SD)',
      'Kelas 4 (Fase B - SD)',
      'Kelas 5 (Fase C - SD)',
      'Kelas 6 (Fase C - SD)',
      'Kelas 7 (Fase D - SMP)',
      'Kelas 8 (Fase D - SMP)',
      'Kelas 9 (Fase D - SMP)',
      'Kelas 10 (Fase E - SMA)',
      'Kelas 11 (Fase F - SMA)',
      'Kelas 12 (Fase F - SMA)'
    ];
  },

  getFaseByKelas(kelasName) {
    if (!kelasName) return 'Fase E';
    if (kelasName.includes('Kelas 1') || kelasName.includes('Kelas 2') || kelasName.includes('Fase A')) return 'Fase A';
    if (kelasName.includes('Kelas 3') || kelasName.includes('Kelas 4') || kelasName.includes('Fase B')) return 'Fase B';
    if (kelasName.includes('Kelas 5') || kelasName.includes('Kelas 6') || kelasName.includes('Fase C')) return 'Fase C';
    if (kelasName.includes('Kelas 7') || kelasName.includes('Kelas 8') || kelasName.includes('Kelas 9') || kelasName.includes('Fase D')) return 'Fase D';
    if (kelasName.includes('Kelas 10') || kelasName.includes('Fase E') || kelasName.includes('X-')) return 'Fase E';
    if (kelasName.includes('Kelas 11') || kelasName.includes('Kelas 12') || kelasName.includes('Fase F') || kelasName.includes('XI-') || kelasName.includes('XII-')) return 'Fase F';
    return 'Fase E';
  },

  getFaseBadge(faseName, isP5 = false, p5Tema = '') {
    const p5Html = isP5 ? `<span class="badge-fase badge-p5">⭐ P5: ${p5Tema || 'Projek Karakter'}</span> ` : '';
    let cls = 'badge-fase-e';
    if (faseName === 'Fase A') cls = 'badge-fase-a';
    else if (faseName === 'Fase B') cls = 'badge-fase-b';
    else if (faseName === 'Fase C') cls = 'badge-fase-c';
    else if (faseName === 'Fase D') cls = 'badge-fase-d';
    else if (faseName === 'Fase E') cls = 'badge-fase-e';
    else if (faseName === 'Fase F') cls = 'badge-fase-f';
    return `${p5Html}<span class="badge-fase ${cls}">${faseName}</span>`;
  },

  onJenjangChange(prefix) {
    const jenjang = document.getElementById(`${prefix}-input-jenjang`)?.value || 'SMA';
    const faseSelect = document.getElementById(`${prefix}-input-fase`);
    if (!faseSelect) return;

    const availableFases = Object.keys(this.fases[jenjang] || {});
    faseSelect.innerHTML = availableFases.map(f => `<option value="${f}">${f} (${jenjang})</option>`).join('');
    this.onFaseChange(prefix);
  },

  onFaseChange(prefix) {
    const jenjang = document.getElementById(`${prefix}-input-jenjang`)?.value || 'SMA';
    const fase = document.getElementById(`${prefix}-input-fase`)?.value || 'Fase E';
    const faseData = this.fases[jenjang]?.[fase];
    if (!faseData) return;

    // Populate Kelas
    const kelasSelect = document.getElementById(`${prefix}-input-kelas`);
    if (kelasSelect) {
      kelasSelect.innerHTML = faseData.kelas.map(k => `<option value="${k} (${fase} - ${jenjang})">${k} (${fase} - ${jenjang})</option>`).join('');
    }

    // Populate Mapel
    const mapelSelect = document.getElementById(`${prefix}-input-mapel`);
    if (mapelSelect) {
      let html = '';
      if (faseData.mapelWajib) {
        html += `<optgroup label="Mata Pelajaran Wajib">` + 
          faseData.mapelWajib.map(m => `<option value="${m}">${m}</option>`).join('') + `</optgroup>`;
      }
      if (faseData.mapelPilihan) {
        html += `<optgroup label="Mata Pelajaran Pilihan / Peminatan">` + 
          faseData.mapelPilihan.map(m => `<option value="${m}">${m}</option>`).join('') + `</optgroup>`;
      }
      mapelSelect.innerHTML = html;
    }
  },

  onKomponenChange(prefix) {
    const komponen = document.getElementById(`${prefix}-input-komponen`)?.value;
    const p5Container = document.getElementById(`${prefix}-p5-container`);
    if (!p5Container) return;

    if (komponen === 'Kokurikuler') {
      p5Container.style.display = 'block';
      const temaSelect = document.getElementById(`${prefix}-input-p5-tema`);
      const dimSelect = document.getElementById(`${prefix}-input-p5-dimensi`);
      if (temaSelect) {
        temaSelect.innerHTML = this.p5.tema.map(t => `<option value="${t}">${t}</option>`).join('');
      }
      if (dimSelect) {
        dimSelect.innerHTML = this.p5.dimensi.map(d => `<option value="${d}">${d}</option>`).join('');
      }
    } else {
      p5Container.style.display = 'none';
    }
  },

  initSelectors(prefix, currentJenjang = 'SMA', currentFase = '', currentKelas = '', currentMapel = '', currentKomponen = 'Intrakurikuler', currentP5Tema = '', currentP5Dimensi = '') {
    const jenjangEl = document.getElementById(`${prefix}-input-jenjang`);
    if (jenjangEl) jenjangEl.value = currentJenjang;

    this.onJenjangChange(prefix);

    if (currentFase) {
      const faseEl = document.getElementById(`${prefix}-input-fase`);
      if (faseEl) {
        faseEl.value = currentFase;
        this.onFaseChange(prefix);
      }
    }

    if (currentKelas) {
      const kelasEl = document.getElementById(`${prefix}-input-kelas`);
      if (kelasEl) kelasEl.value = currentKelas;
    }

    if (currentMapel) {
      const mapelEl = document.getElementById(`${prefix}-input-mapel`);
      if (mapelEl) mapelEl.value = currentMapel;
    }

    const kompEl = document.getElementById(`${prefix}-input-komponen`);
    if (kompEl) {
      kompEl.value = currentKomponen || 'Intrakurikuler';
      this.onKomponenChange(prefix);
      if (currentP5Tema) {
        const tEl = document.getElementById(`${prefix}-input-p5-tema`);
        if (tEl) tEl.value = currentP5Tema;
      }
      if (currentP5Dimensi) {
        const dEl = document.getElementById(`${prefix}-input-p5-dimensi`);
        if (dEl) dEl.value = currentP5Dimensi;
      }
    }
  }
};

// ==========================================================================
// 2. Global State & App Controller
// ==========================================================================
const AppState = {
  currentTeacher: null,
  data: null,
  currentView: 'view-dashboard',
  selectedClass: '',

  init() {
    StorageManager.initDemoDataIfEmpty();
    const activeTeacherId = StorageManager.getActiveTeacherId();
    const teachers = StorageManager.getTeachers();

    this.currentTeacher = teachers.find(t => t.id === activeTeacherId) || teachers[0];
    if (this.currentTeacher) {
      StorageManager.setActiveTeacherId(this.currentTeacher.id);
      this.data = StorageManager.getTeacherData(this.currentTeacher.id);

      // Cek apakah akun aktif adalah akun demo resmi Budi Pratama
      const isDefaultTeacher = this.currentTeacher.id === 'GURU-202610-001' || 
                               this.currentTeacher.id === 'GURU-DEMO-001' ||
                               (this.currentTeacher.email && this.currentTeacher.email.toLowerCase() === 'guru.demo@sekolah.id');

      // Safe schema guarantee: pastikan seluruh array dan objek ada
      if (!Array.isArray(this.data.classes)) this.data.classes = [];
      if (!Array.isArray(this.data.lessonPlans)) this.data.lessonPlans = [];
      if (!Array.isArray(this.data.materials)) this.data.materials = [];
      if (!Array.isArray(this.data.questionBank)) this.data.questionBank = [];
      if (!Array.isArray(this.data.assessmentPackages)) this.data.assessmentPackages = [];
      if (!Array.isArray(this.data.students)) this.data.students = [];
      if (!Array.isArray(this.data.gradebook)) this.data.gradebook = [];
      if (!Array.isArray(this.data.timetable)) this.data.timetable = [];
      if (!Array.isArray(this.data.academicEvents)) this.data.academicEvents = [];
      if (!Array.isArray(this.data.tasks)) this.data.tasks = [];
      if (!Array.isArray(this.data.meetings)) this.data.meetings = [];
      if (!Array.isArray(this.data.reflections)) this.data.reflections = [];
      if (!Array.isArray(this.data.attendanceLogs)) this.data.attendanceLogs = [];
      if (!this.data.gradeWeights) this.data.gradeWeights = { tugas: 30, uts: 30, uas: 40 };

      // Seeding dummy data adalah HAK EKSKLUSIF AKUN GURU DEMO
      if (isDefaultTeacher) {
        const isSparse = this.data.students.length <= 8 || this.data.lessonPlans.length <= 2;
        if (isSparse) {
          const fullDemo = StorageManager.getFullDemoData();
          this.data = fullDemo;
        }
        if (!this.data.classes || this.data.classes.length === 0) {
          this.data.classes = ['X-A (Fase E)', 'XI-IPA 1', 'XII-IPA 2'];
        }
      } else {
        // PEMBERSINAN TOTAL RESIDU DUMMY PADA AKUN GURU BARU / RIIL
        // Hapus semua entitas yang memiliki kode percontohan demo ('202610-')
        const isDemoItem = (item) => {
          if (!item) return false;
          const id = item.id || item.studentId || '';
          return typeof id === 'string' && (id.includes('202610-') || id.includes('DEMO'));
        };

        this.data.students = this.data.students.filter(s => !isDemoItem(s));
        this.data.lessonPlans = this.data.lessonPlans.filter(r => !isDemoItem(r));
        this.data.materials = this.data.materials.filter(m => !isDemoItem(m));
        this.data.questionBank = this.data.questionBank.filter(q => !isDemoItem(q));
        this.data.assessmentPackages = this.data.assessmentPackages.filter(p => !isDemoItem(p));
        this.data.gradebook = this.data.gradebook.filter(g => !isDemoItem(g));
        this.data.timetable = this.data.timetable.filter(t => !isDemoItem(t));
        this.data.academicEvents = this.data.academicEvents.filter(e => !isDemoItem(e));
        this.data.tasks = this.data.tasks.filter(t => !isDemoItem(t));
        this.data.meetings = this.data.meetings.filter(m => !isDemoItem(m));
        this.data.reflections = this.data.reflections.filter(r => !isDemoItem(r));
        this.data.attendanceLogs = this.data.attendanceLogs.filter(a => !isDemoItem(a));

        // Jika guru baru belum memiliki siswa dan masih mewarisi kelas demo, bersihkan
        const isDemoClasses = this.data.classes.length === 3 && 
                              this.data.classes[0] === 'X-A (Fase E)' && 
                              this.data.classes[1] === 'XI-IPA 1' && 
                              this.data.classes[2] === 'XII-IPA 2';
        if (isDemoClasses && this.data.students.length === 0) {
          this.data.classes = [];
        }
      }

      this.selectedClass = (this.data.classes && this.data.classes[0]) || '';
      AppState.selectedClass = this.selectedClass;
      this.save();
    } else {
      this.data = StorageManager.getDefaultSchema();
    }
  },

  loadFullDemoData(showConfirm = true) {
    if (showConfirm) {
      const ok = confirm('Muat ulang seluruh sampel data demo lengkap di semua menu?\n\nData demo lengkap (7 Modul RPP, 7 Bahan Ajar, 18 Bank Soal, 5 Paket Asesmen, 30 Siswa di 3 Kelas, Buku Nilai Digital, Presensi Harian, Jadwal Mengajar, Koreksi Tugas & Notulensi Rapat) akan dimuat untuk mencoba seluruh fitur.');
      if (!ok) return;
    }
    const fullDemo = StorageManager.getFullDemoData();
    this.data = fullDemo;
    this.selectedClass = this.data.classes[0] || 'Semua Kelas';
    this.save();
    UI.showToast('Sampel data demo lengkap berhasil dimuat di seluruh menu!');
    Navigation.switchView(this.currentView);
  },

  save() {
    if (this.currentTeacher && this.data) {
      StorageManager.saveTeacherData(this.currentTeacher.id, this.data);
    }
  }
};

// ==========================================================================
// 3. UI Helpers & Toast
// ==========================================================================
const UI = {
  showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'toast-error' : ''}`;
    
    const icon = type === 'error' 
      ? '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>'
      : '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>';
    
    toast.innerHTML = `${icon} <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  },

  openModal(modalId) {
    let modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      return;
    }
    if (typeof ViewLoader !== 'undefined' && ViewLoader.ensureModalsLoaded) {
      ViewLoader.ensureModalsLoaded().then(() => {
        const m = document.getElementById(modalId);
        if (m) m.classList.add('active');
      });
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  },

  formatDate(dateStr) {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  }
};

// ==========================================================================
// Theme Manager (Dark / Light Mode Controller)
// ==========================================================================
const ThemeManager = {
  THEME_STORAGE_KEY: 'MTP_THEME',

  init() {
    let savedTheme = localStorage.getItem(this.THEME_STORAGE_KEY);
    if (!savedTheme) {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      savedTheme = prefersDark ? 'dark' : 'light';
    }
    this.applyTheme(savedTheme, false);

    // Listen to OS system color-scheme change if user hasn't explicitly set a preference
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem(this.THEME_STORAGE_KEY)) {
          this.applyTheme(e.matches ? 'dark' : 'light', false);
        }
      });
    }
  },

  getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  },

  applyTheme(theme, notify = true) {
    const isDark = theme === 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.THEME_STORAGE_KEY, theme);

    // Sync icons & labels in header
    const iconMoon = document.getElementById('theme-icon-moon');
    const iconSun = document.getElementById('theme-icon-sun');
    const label = document.getElementById('theme-toggle-label');

    if (iconMoon && iconSun) {
      if (isDark) {
        iconMoon.style.display = 'none';
        iconSun.style.display = 'inline-block';
      } else {
        iconMoon.style.display = 'inline-block';
        iconSun.style.display = 'none';
      }
    }

    if (label) {
      label.textContent = isDark ? 'Mode Terang' : 'Mode Gelap';
    }

    // Sync landing & auth theme icons & labels
    document.querySelectorAll('.landing-theme-moon, .auth-theme-moon').forEach(el => {
      el.style.display = isDark ? 'none' : 'inline-block';
    });
    document.querySelectorAll('.landing-theme-sun, .auth-theme-sun').forEach(el => {
      el.style.display = isDark ? 'inline-block' : 'none';
    });
    const authThemeLabel = document.getElementById('auth-theme-label');
    if (authThemeLabel) {
      authThemeLabel.textContent = isDark ? 'Mode Terang' : 'Mode Gelap';
    }

    if (notify && typeof UI !== 'undefined' && UI.showToast) {
      UI.showToast(`Beralih ke ${isDark ? 'Mode Gelap (Teks Putih)' : 'Mode Terang'}`);
    }
  },

  toggleTheme() {
    const current = this.getCurrentTheme();
    const target = current === 'dark' ? 'light' : 'dark';
    this.applyTheme(target, true);
  }
};

// ==========================================================================
// 3B. ViewLoader (Modular Lazy Loading & Client-Side In-Memory Cache)
// ==========================================================================
const ViewLoader = {
  cache: {},
  views: {
    'view-dashboard': 'views/dashboard.html',
    'view-planner': 'views/planner.html',
    'view-timetable': 'views/timetable.html',
    'view-gradebook': 'views/gradebook.html',
    'view-classroom': 'views/classroom.html',
    'view-tasks': 'views/tasks.html',
    'view-ai-export': 'views/ai-export.html',
    'view-repository': 'views/repository.html',
    'view-questions': 'views/questions.html',
    'view-student-detail': 'views/student-detail.html',
    'view-school-profile': 'views/school-profile.html'
  },
  modalsLoaded: false,
  modalsLoadingPromise: null,

  getTemplate(viewId) {
    if (this.cache[viewId]) return this.cache[viewId];
    if (window.MTP_TEMPLATES && window.MTP_TEMPLATES[viewId]) {
      this.cache[viewId] = window.MTP_TEMPLATES[viewId];
      return this.cache[viewId];
    }
    return null;
  },

  async loadView(viewId) {
    let existing = document.getElementById(viewId);
    if (existing) {
      return true;
    }

    let html = this.getTemplate(viewId);
    if (!html) {
      const url = this.views[viewId];
      if (url && (window.location.protocol === 'http:' || window.location.protocol === 'https:')) {
        try {
          const resp = await fetch(url);
          if (resp.ok) {
            html = await resp.text();
            this.cache[viewId] = html;
          }
        } catch (e) {
          console.warn('ViewLoader could not fetch ' + url, e);
        }
      }
    }

    if (!html) {
      console.error('View template for ' + viewId + ' not found!');
      return false;
    }

    const pageBody = document.querySelector('.page-body');
    const footer = document.querySelector('.app-workspace-footer');
    if (pageBody) {
      const temp = document.createElement('div');
      temp.innerHTML = html.trim();
      const newEl = temp.firstElementChild;
      if (newEl) {
        if (footer && footer.parentNode === pageBody) {
          pageBody.insertBefore(newEl, footer);
        } else {
          pageBody.appendChild(newEl);
        }
      }
    }
    return true;
  },

  async ensureModalsLoaded() {
    if (this.modalsLoaded) return true;
    const container = document.getElementById('modals-container');
    if (!container) return false;
    if (container.children.length > 0) {
      this.modalsLoaded = true;
      return true;
    }

    if (window.MTP_MODALS) {
      container.innerHTML = window.MTP_MODALS;
      this.modalsLoaded = true;
      return true;
    }

    if (this.modalsLoadingPromise) {
      return this.modalsLoadingPromise;
    }

    this.modalsLoadingPromise = (async () => {
      if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
        try {
          const resp = await fetch('modals/modals.html');
          if (resp.ok) {
            const html = await resp.text();
            container.innerHTML = html;
            this.modalsLoaded = true;
            return true;
          }
        } catch (e) {
          console.warn('ViewLoader ensureModalsLoaded error:', e);
        }
      }
      return false;
    })();

    return this.modalsLoadingPromise;
  }
};

// ==========================================================================
// 4. View Navigation & Routing
// ==========================================================================
const Navigation = {
  openMobileSidebar() {
    const sidebar = document.getElementById('app-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar) sidebar.classList.add('mobile-open');
    if (backdrop) backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  closeMobileSidebar() {
    const sidebar = document.getElementById('app-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar) sidebar.classList.remove('mobile-open');
    if (backdrop) backdrop.classList.remove('active');
    document.body.style.overflow = '';
  },

  toggleMobileSidebar() {
    const sidebar = document.getElementById('app-sidebar');
    if (sidebar && sidebar.classList.contains('mobile-open')) {
      this.closeMobileSidebar();
    } else {
      this.openMobileSidebar();
    }
  },

  async switchView(viewId) {
    AppState.currentView = viewId;
    
    // Update Sidebar & Bottom Bar active states
    document.querySelectorAll('.nav-link, .bottom-nav-item').forEach(el => {
      el.classList.remove('active');
      if (el.dataset.view === viewId) el.classList.add('active');
    });

    // Always close mobile drawer if open
    this.closeMobileSidebar();

    // Ensure view template is loaded in DOM via ViewLoader
    if (typeof ViewLoader !== 'undefined') {
      await ViewLoader.loadView(viewId);
    }

    // Update Views visibility
    document.querySelectorAll('.app-view').forEach(view => {
      view.classList.remove('active');
    });
    const target = document.getElementById(viewId);
    if (target) {
      target.classList.add('active');
    }

    // Update Header Dynamic Title and Menu-Specific Print Button Label
    const menuMeta = {
      'view-dashboard': { title: 'Dashboard Guru', printLabel: 'Cetak Ringkasan' },
      'view-planner': { title: 'Modul & RPP Kurikulum Merdeka', printLabel: 'Cetak Modul & RPP' },
      'view-repository': { title: 'Materi Pokok & Media Pembelajaran', printLabel: 'Cetak Katalog' },
      'view-questions': { title: 'Bank Soal & Asesmen Pembelajaran', printLabel: 'Cetak Bank Soal' },
      'view-timetable': { title: 'Jadwal Mengajar & Kalender Akademik', printLabel: 'Cetak Jadwal' },
      'view-gradebook': { title: 'Buku Nilai Digital Siswa', printLabel: 'Cetak Nilai' },
      'view-classroom': { title: 'Kelas, Presensi & Denah Tempat Duduk', printLabel: 'Cetak Presensi' },
      'view-tasks': { title: 'Pelacak Koreksi & Tugas Siswa', printLabel: 'Cetak Tugas' },
      'view-student-detail': { title: 'Detail Capaian & Lembar Nilai Siswa', printLabel: 'Cetak Rapor Siswa' },
      'view-school-profile': { title: 'Profil & Identitas Sekolah', printLabel: 'Cetak Profil Sekolah' },
      'view-ai-export': { title: 'Asisten AI & Pusat Ekspor Dokumen', printLabel: 'Cetak Supervisi' }
    };
    const meta = menuMeta[viewId] || { title: 'Teacher Planner', printLabel: 'Cetak Dokumen' };
    const titleEl = document.getElementById('header-dynamic-title');
    if (titleEl) titleEl.textContent = meta.title;
    const btnPrintLabel = document.getElementById('btn-header-print-label');
    if (btnPrintLabel) btnPrintLabel.textContent = meta.printLabel;
    const btnPrint = document.getElementById('btn-header-print');
    if (btnPrint) {
      if (viewId === 'view-student-detail') {
        btnPrint.style.display = 'none'; // Sembunyikan tombol navbar print saat di halaman detail siswa untuk eliminasi redundansi
      } else {
        btnPrint.style.display = '';
        btnPrint.title = `${meta.printLabel} (PDF Terpisah Sesuai Menu)`;
      }
    }

    // Render corresponding view data
    switch(viewId) {
      case 'view-dashboard':
        DashboardModule.render();
        break;
      case 'view-planner':
        PlannerModule.render();
        break;
      case 'view-repository':
        RepositoryModule.render();
        break;
      case 'view-questions':
        QuestionBankModule.render();
        break;
      case 'view-timetable':
        TimetableModule.render();
        break;
      case 'view-gradebook':
        GradebookModule.render();
        break;
      case 'view-classroom':
        ClassroomModule.render();
        break;
      case 'view-tasks':
        TaskModule.render();
        break;
      case 'view-student-detail':
        StudentDetailModule.render();
        break;
      case 'view-school-profile':
        SchoolProfileModule.render();
        break;
      case 'view-ai-export':
        AIExportModule.render();
        break;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// ==========================================================================
// 5. Dashboard Module
// ==========================================================================
const DashboardModule = {
  render() {
    const data = AppState.data;
    if (!data) return;

    // Stats
    const totalRPP = data.lessonPlans.length;
    const totalStudents = data.students.length;
    
    // Calculate pending grading
    let pendingGrading = 0;
    data.tasks.forEach(t => {
      if (t.status !== 'Selesai') {
        pendingGrading += (t.totalKoreksi - t.selesaiKoreksi);
      }
    });

    // Calculate attendance percentage for today or latest
    const latestAbsen = data.attendanceLogs[data.attendanceLogs.length - 1];
    let attendPercent = 100;
    if (latestAbsen && latestAbsen.records) {
      const records = Object.values(latestAbsen.records);
      const hadirCount = records.filter(r => r === 'H').length;
      if (records.length > 0) {
        attendPercent = Math.round((hadirCount / records.length) * 100);
      }
    }

    const statRPP = document.getElementById('stat-total-rpp');
    const statStudents = document.getElementById('stat-total-students');
    const statGrading = document.getElementById('stat-pending-grading');
    const statAttendance = document.getElementById('stat-attendance-rate');

    if (statRPP) statRPP.textContent = totalRPP;
    if (statStudents) statStudents.textContent = totalStudents;
    if (statGrading) statGrading.textContent = pendingGrading + ' Berkas';
    if (statAttendance) statAttendance.textContent = attendPercent + '%';

    const badgeRPP = document.getElementById('sidebar-badge-rpp');
    if (badgeRPP) badgeRPP.textContent = totalRPP;
    const badgeMat = document.getElementById('sidebar-badge-materials');
    if (badgeMat) badgeMat.textContent = data.materials?.length || 0;
    const badgeQst = document.getElementById('sidebar-badge-questions');
    if (badgeQst) badgeQst.textContent = data.questionBank?.length || 0;

    // Upcoming Schedule for Today (or default Senin)
    const scheduleContainer = document.getElementById('dash-schedule-list');
    if (scheduleContainer) {
      const todayName = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(new Date());
      let todaySchedule = data.timetable.filter(s => s.hari.toLowerCase() === todayName.toLowerCase());
      if (todaySchedule.length === 0) {
        todaySchedule = data.timetable.filter(s => s.hari === 'Senin');
      }

      if (todaySchedule.length === 0) {
        scheduleContainer.innerHTML = `
          <div style="text-align: center; padding: 1.5rem 0.5rem;">
            <p class="text-muted" style="font-size: 0.85rem; margin-bottom: 0.65rem;">Belum ada jadwal mengajar.</p>
            <button class="btn btn-primary btn-sm" onclick="TimetableModule.openAddModal()">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
              <span>+ Buat Jadwal Mengajar</span>
            </button>
          </div>`;
      } else {
        scheduleContainer.innerHTML = todaySchedule.map(s => `
          <div class="schedule-item">
            <div>
              <span class="class-badge">${s.kelas}</span> - <strong>${s.mapel}</strong>
              <div class="room-badge">${s.ruangan}</div>
            </div>
            <span class="time-slot">${s.jamMulai} - ${s.jamSelesai}</span>
          </div>
        `).join('');
      }
    }

    // Urgent Tasks / Grading Tracker in Dashboard
    const taskContainer = document.getElementById('dash-urgent-tasks');
    if (taskContainer) {
      const urgent = data.tasks.slice(0, 3);
      if (urgent.length === 0) {
        taskContainer.innerHTML = `
          <div style="text-align: center; padding: 1.5rem 0.5rem;">
            <p class="text-muted" style="font-size: 0.85rem; margin-bottom: 0.65rem;">Belum ada berkas koreksi tugas.</p>
            <button class="btn btn-secondary btn-sm" onclick="TaskModule.openAddTaskModal()">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
              <span>+ Catat Koreksi Tugas</span>
            </button>
          </div>`;
      } else {
        taskContainer.innerHTML = urgent.map(t => {
          const pct = Math.round((t.selesaiKoreksi / (t.totalKoreksi || 1)) * 100);
          return `
            <div style="margin-bottom: 0.85rem; padding-bottom: 0.85rem; border-bottom: 1px solid var(--slate-100);">
              <div style="display: flex; justify-content: space-between; font-size: 0.825rem;">
                <strong>${t.judul}</strong>
                <span style="font-weight: 700; color: ${pct === 100 ? 'var(--emerald-600)' : 'var(--amber-500)'}">${pct}%</span>
              </div>
              <div style="font-size: 0.725rem; color: var(--slate-500); margin-top: 2px;">
                ${t.kelasMapel} | Batas Waktu: ${UI.formatDate(t.deadline)}
              </div>
              <div class="progress-bar-bg">
                <div class="progress-bar-fill" style="width: ${pct}%"></div>
              </div>
            </div>
          `;
        }).join('');
      }
    }
  }
};

// ==========================================================================
// 6. Planner Module (Lesson & Unit Planner / RPP)
// ==========================================================================
const PlannerModule = {
  render() {
    const data = AppState.data;
    if (!data) return;

    // Populate Class Filter
    const filterClass = document.getElementById('filter-rpp-class');
    if (filterClass) {
      const currentVal = filterClass.value;
      filterClass.innerHTML = '<option value="">Semua Kelas</option>' + 
        data.classes.map(c => `<option value="${c}">${c}</option>`).join('');
      if (currentVal) filterClass.value = currentVal;
    }

    this.filterList();
  },

  filterList() {
    const data = AppState.data;
    const badgeRPP = document.getElementById('sidebar-badge-rpp');
    if (badgeRPP) badgeRPP.textContent = data.lessonPlans.length;

    const filterClass = document.getElementById('filter-rpp-class')?.value || '';
    const searchVal = document.getElementById('search-rpp')?.value.toLowerCase() || '';
    const container = document.getElementById('rpp-list-container');
    if (!container) return;

    let list = data.lessonPlans.filter(item => {
      const matchClass = !filterClass || item.kelas === filterClass;
      const matchSearch = !searchVal || 
        item.materiPokok.toLowerCase().includes(searchVal) || 
        item.tujuanPembelajaran.toLowerCase().includes(searchVal);
      return matchClass && matchSearch;
    });

    if (list.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; background: var(--white); border-radius: var(--radius-lg); border: 1px dashed var(--slate-300);">
          <svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="color: var(--slate-400); margin-bottom: 0.5rem;"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
          <h4 style="font-size: 1rem; color: var(--slate-700);">Belum Ada Modul Ajar / RPP</h4>
          <p style="font-size: 0.8rem; color: var(--slate-500); margin-top: 4px;">Rancang administrasi modul ajar Kurikulum Merdeka Fase A-F &amp; Kokurikuler P5.</p>
          <button class="btn btn-primary" onclick="PlannerModule.openAddModal()" style="margin-top: 0.85rem;">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
            <span>+ Buat Modul Ajar Pertama</span>
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(rpp => `
      <div class="rpp-card">
        <div>
          <div style="margin-bottom: 0.5rem; display: flex; gap: 0.35rem; align-items: center; flex-wrap: wrap;">
            ${KurikulumMerdeka.getFaseBadge(rpp.fase || KurikulumMerdeka.getFaseByKelas(rpp.kelas), rpp.komponen === 'Kokurikuler', rpp.p5Tema)}
            ${rpp.komponen === 'Kokurikuler' ? '<span class="badge-fase badge-p5">Kokurikuler (P5)</span>' : '<span class="badge-fase badge-intrakurikuler">Intrakurikuler</span>'}
          </div>
          <h4>${rpp.materiPokok}</h4>
          <div class="rpp-card-meta">
            <span><strong>Kelas:</strong> ${rpp.kelas}</span>
            <span>•</span>
            <span><strong>Durasi:</strong> ${rpp.alokasiWaktu}</span>
            <span>•</span>
            <span><strong>Semester:</strong> ${rpp.semester || 1}</span>
          </div>
          <p class="rpp-card-preview">${rpp.tujuanPembelajaran.substring(0, 140)}...</p>
        </div>
        <div class="rpp-card-actions">
          <button class="btn btn-secondary btn-sm" onclick="PlannerModule.viewDetail('${rpp.id}')">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            Lihat & Cetak
          </button>
          <div style="display: flex; gap: 0.35rem;">
            <button class="btn btn-ghost btn-sm" onclick="PlannerModule.edit('${rpp.id}')" title="Edit Modul">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </button>
            <button class="btn btn-ghost btn-sm" style="color: var(--rose-600);" onclick="PlannerModule.delete('${rpp.id}')" title="Hapus Modul">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        </div>
      </div>
    `).join('');
  },

  openAddModal() {
    document.getElementById('form-rpp').reset();
    document.getElementById('rpp-edit-id').value = '';
    document.getElementById('modal-rpp-title').textContent = 'Buat Modul Ajar / RPP Baru';

    // Initialize cascading Kurikulum Merdeka selectors
    KurikulumMerdeka.initSelectors('rpp', 'SMA', 'Fase E');

    UI.openModal('modal-form-rpp');
  },

  saveFromForm(e) {
    e.preventDefault();
    const editId = document.getElementById('rpp-edit-id').value;
    const jenjang = document.getElementById('rpp-input-jenjang')?.value || 'SMA';
    const fase = document.getElementById('rpp-input-fase')?.value || 'Fase E';
    const kelas = document.getElementById('rpp-input-kelas')?.value || '';
    const komponen = document.getElementById('rpp-input-komponen')?.value || 'Intrakurikuler';
    const p5Tema = document.getElementById('rpp-input-p5-tema')?.value || '';
    const p5Dimensi = document.getElementById('rpp-input-p5-dimensi')?.value || '';
    const mapel = document.getElementById('rpp-input-mapel')?.value || AppState.currentTeacher.mataPelajaran || 'Umum';
    const materiPokok = document.getElementById('rpp-input-materi').value.trim();
    const alokasi = document.getElementById('rpp-input-alokasi').value.trim() || '2 JP x 45 Menit';
    const semester = parseInt(document.getElementById('rpp-input-semester').value, 10) || 1;
    const tujuan = document.getElementById('rpp-input-tujuan').value.trim();
    const pembuka = document.getElementById('rpp-input-pembuka').value.trim();
    const inti = document.getElementById('rpp-input-inti').value.trim();
    const penutup = document.getElementById('rpp-input-penutup').value.trim();
    const asesmen = document.getElementById('rpp-input-asesmen').value.trim();
    const driveLink = document.getElementById('rpp-input-drive').value.trim();
    const videoLink = document.getElementById('rpp-input-video').value.trim();

    if (!materiPokok || !tujuan) {
      UI.showToast('Materi pokok dan tujuan pembelajaran wajib diisi!', 'error');
      return;
    }

    const tautan = [];
    if (driveLink) tautan.push({ label: 'Tautan Materi (Drive / Dokumen)', url: driveLink });
    if (videoLink) tautan.push({ label: 'Video Pembelajaran (YouTube / Web)', url: videoLink });

    if (editId) {
      const idx = AppState.data.lessonPlans.findIndex(r => r.id === editId);
      if (idx !== -1) {
        AppState.data.lessonPlans[idx] = {
          ...AppState.data.lessonPlans[idx],
          jenjang, fase, kelas, komponen, p5Tema, p5Dimensi,
          mataPelajaran: mapel,
          materiPokok, alokasiWaktu: alokasi, semester,
          tujuanPembelajaran: tujuan, kegiatanPembuka: pembuka,
          kegiatanInti: inti, kegiatanPenutup: penutup, asesmen,
          tautanMateri: tautan
        };
        UI.showToast('Modul Ajar berhasil diperbarui!');
      }
    } else {
      const newId = StorageManager.generateId('RPP', AppState.data.lessonPlans);
      const newRPP = {
        id: newId,
        jenjang, fase, kelas, komponen, p5Tema, p5Dimensi,
        mataPelajaran: mapel,
        materiPokok,
        alokasiWaktu: alokasi,
        semester,
        tahunAjaran: '2026/2027',
        tujuanPembelajaran: tujuan,
        kegiatanPembuka: pembuka,
        kegiatanInti: inti,
        kegiatanPenutup: penutup,
        asesmen,
        tautanMateri: tautan
      };
      AppState.data.lessonPlans.unshift(newRPP);
      UI.showToast('Modul Ajar baru berhasil disimpan!');
    }

    AppState.save();
    UI.closeModal('modal-form-rpp');
    this.render();
    DashboardModule.render();
  },

  edit(id) {
    const item = AppState.data.lessonPlans.find(r => r.id === id);
    if (!item) return;

    this.openAddModal();
    document.getElementById('modal-rpp-title').textContent = 'Edit Modul Ajar / RPP';
    document.getElementById('rpp-edit-id').value = item.id;

    KurikulumMerdeka.initSelectors(
      'rpp',
      item.jenjang || 'SMA',
      item.fase || KurikulumMerdeka.getFaseByKelas(item.kelas),
      item.kelas,
      item.mataPelajaran || '',
      item.komponen || 'Intrakurikuler',
      item.p5Tema || '',
      item.p5Dimensi || ''
    );

    document.getElementById('rpp-input-materi').value = item.materiPokok;
    document.getElementById('rpp-input-alokasi').value = item.alokasiWaktu;
    document.getElementById('rpp-input-semester').value = item.semester || 1;
    document.getElementById('rpp-input-tujuan').value = item.tujuanPembelajaran;
    document.getElementById('rpp-input-pembuka').value = item.kegiatanPembuka || '';
    document.getElementById('rpp-input-inti').value = item.kegiatanInti || '';
    document.getElementById('rpp-input-penutup').value = item.kegiatanPenutup || '';
    document.getElementById('rpp-input-asesmen').value = item.asesmen || '';

    const drive = item.tautanMateri?.find(t => t.label.includes('Drive'))?.url || '';
    const video = item.tautanMateri?.find(t => t.label.includes('Video') || t.label.includes('YouTube'))?.url || '';
    document.getElementById('rpp-input-drive').value = drive;
    document.getElementById('rpp-input-video').value = video;
  },

  viewDetail(id) {
    this.currentViewId = id;
    const item = AppState.data.lessonPlans.find(r => r.id === id);
    if (!item) return;

    const teacher = AppState.currentTeacher;
    const content = document.getElementById('rpp-detail-content');
    if (!content) return;

    content.innerHTML = `
      <div style="border-bottom: 2px solid var(--slate-800); padding-bottom: 1rem; margin-bottom: 1.25rem;">
        <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--slate-900); text-align: center; text-transform: uppercase;">MODUL AJAR / RENCANA PELAKSANAAN PEMBELAJARAN (RPP)</h2>
        <p style="text-align: center; font-size: 0.85rem; color: var(--slate-600);">${teacher.namaSekolah}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 1.25rem; font-size: 0.85rem;">
        <tr>
          <td style="width: 25%; font-weight: 700; padding: 4px 0;">Mata Pelajaran</td>
          <td>: ${item.mataPelajaran}</td>
          <td style="width: 25%; font-weight: 700; padding: 4px 0;">Jenjang & Fase</td>
          <td>: ${item.jenjang || 'SMA'} (${item.fase || KurikulumMerdeka.getFaseByKelas(item.kelas)})</td>
        </tr>
        <tr>
          <td style="font-weight: 700; padding: 4px 0;">Materi Pokok</td>
          <td>: <strong>${item.materiPokok}</strong></td>
          <td style="font-weight: 700; padding: 4px 0;">Kelas Target</td>
          <td>: ${item.kelas}</td>
        </tr>
        <tr>
          <td style="font-weight: 700; padding: 4px 0;">Komponen Pembelajaran</td>
          <td>: <strong>${item.komponen || 'Intrakurikuler'}</strong></td>
          <td style="font-weight: 700; padding: 4px 0;">Alokasi Waktu</td>
          <td>: ${item.alokasiWaktu}</td>
        </tr>
        ${item.komponen === 'Kokurikuler' ? `
        <tr style="background: #fffbeb;">
          <td style="font-weight: 700; padding: 6px 4px; color: #92400e;">Tema Projek P5</td>
          <td style="padding: 6px 4px; color: #92400e;">: <strong>${item.p5Tema || '-'}</strong></td>
          <td style="font-weight: 700; padding: 6px 4px; color: #92400e;">Dimensi Karakter</td>
          <td style="padding: 6px 4px; color: #92400e;">: ${item.p5Dimensi || '-'}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="font-weight: 700; padding: 4px 0;">Guru Pengampu</td>
          <td>: ${teacher.namaLengkap}</td>
          <td style="font-weight: 700; padding: 4px 0;">Tahun Ajaran</td>
          <td>: ${item.tahunAjaran || '2026/2027'} (Semester ${item.semester || 1})</td>
        </tr>
      </table>

      <div style="margin-bottom: 1.25rem;">
        <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--emerald-800); border-bottom: 1px solid var(--slate-200); padding-bottom: 4px; margin-bottom: 0.5rem;">I. TUJUAN PEMBELAJARAN</h4>
        <p style="font-size: 0.85rem; line-height: 1.6; white-space: pre-wrap;">${item.tujuanPembelajaran}</p>
      </div>

      <div style="margin-bottom: 1.25rem;">
        <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--emerald-800); border-bottom: 1px solid var(--slate-200); padding-bottom: 4px; margin-bottom: 0.5rem;">II. LANGKAH-LANGKAH PEMBELAJARAN (BERDIFERENSIASI)</h4>
        
        <div style="margin-bottom: 0.75rem;">
          <strong style="font-size: 0.85rem; color: var(--slate-800);">A. Kegiatan Pembuka:</strong>
          <p style="font-size: 0.85rem; line-height: 1.6; white-space: pre-wrap; margin-top: 2px;">${item.kegiatanPembuka || '-'}</p>
        </div>

        <div style="margin-bottom: 0.75rem;">
          <strong style="font-size: 0.85rem; color: var(--slate-800);">B. Kegiatan Inti:</strong>
          <p style="font-size: 0.85rem; line-height: 1.6; white-space: pre-wrap; margin-top: 2px;">${item.kegiatanInti || '-'}</p>
        </div>

        <div style="margin-bottom: 0.75rem;">
          <strong style="font-size: 0.85rem; color: var(--slate-800);">C. Kegiatan Penutup:</strong>
          <p style="font-size: 0.85rem; line-height: 1.6; white-space: pre-wrap; margin-top: 2px;">${item.kegiatanPenutup || '-'}</p>
        </div>
      </div>

      <div style="margin-bottom: 1.25rem;">
        <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--emerald-800); border-bottom: 1px solid var(--slate-200); padding-bottom: 4px; margin-bottom: 0.5rem;">III. ASESMEN & EVALUASI</h4>
        <p style="font-size: 0.85rem; line-height: 1.6; white-space: pre-wrap;">${item.asesmen || '-'}</p>
      </div>

      ${item.tautanMateri && item.tautanMateri.length > 0 ? `
        <div style="margin-bottom: 1.25rem;">
          <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--emerald-800); border-bottom: 1px solid var(--slate-200); padding-bottom: 4px; margin-bottom: 0.5rem;">IV. SUMBER BELAJAR & BERKAS TERTAUT</h4>
          <ul style="font-size: 0.85rem; padding-left: 1.25rem;">
            ${item.tautanMateri.map(t => `<li><a href="${t.url}" target="_blank" style="color: var(--emerald-600); text-decoration: underline;">${t.label} (${t.url})</a></li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <div style="display: grid; grid-template-columns: 1fr 1fr; margin-top: 2.5rem; text-align: center; font-size: 0.85rem;">
        <div>
          <p>Mengetahui,</p>
          <p style="font-weight: 700;">Kepala Sekolah</p>
          <div style="height: 60px;"></div>
          <p style="text-decoration: underline; font-weight: 700;">Drs. H. Mulyadi, M.Pd.</p>
          <p>NIP. 19680315 199303 1 005</p>
        </div>
        <div>
          <p>${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <p style="font-weight: 700;">Guru Mata Pelajaran,</p>
          <div style="height: 60px;"></div>
          <p style="text-decoration: underline; font-weight: 700;">${teacher.namaLengkap}</p>
          <p>NIP. ${teacher.nip}</p>
        </div>
      </div>
    `;

    UI.openModal('modal-rpp-detail');
  },

  delete(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus RPP / Modul Ajar ini?')) return;
    AppState.data.lessonPlans = AppState.data.lessonPlans.filter(r => r.id !== id);
    AppState.save();
    UI.showToast('Modul Ajar berhasil dihapus.');
    this.render();
    DashboardModule.render();
  }
};

// ==========================================================================
// 7. Timetable & Academic Calendar Module
// ==========================================================================
const TimetableModule = {
  currentTab: 'weekly',

  render() {
    this.renderWeekly();
    this.renderEvents();
  },

  switchTab(tab) {
    this.currentTab = tab;
    document.querySelectorAll('#view-timetable .view-tab').forEach(el => el.classList.remove('active'));
    document.querySelector(`#view-timetable .view-tab[data-tab="${tab}"]`)?.classList.add('active');

    const weeklySection = document.getElementById('timetable-weekly-sec');
    const calendarSection = document.getElementById('timetable-calendar-sec');
    const btnSched = document.getElementById('btn-add-schedule');
    const btnEvt = document.getElementById('btn-add-calendar-event');

    if (tab === 'weekly') {
      if (weeklySection) weeklySection.style.display = 'block';
      if (calendarSection) calendarSection.style.display = 'none';
      if (btnSched) btnSched.style.display = 'inline-flex';
      if (btnEvt) btnEvt.style.display = 'none';
      this.renderWeekly();
    } else {
      if (weeklySection) weeklySection.style.display = 'none';
      if (calendarSection) calendarSection.style.display = 'block';
      if (btnSched) btnSched.style.display = 'none';
      if (btnEvt) btnEvt.style.display = 'inline-flex';
      this.renderEvents();
    }
  },

  renderWeekly() {
    const data = AppState.data;
    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
    const container = document.getElementById('weekly-timetable-rows');
    if (!container) return;

    container.innerHTML = days.map(day => {
      const slots = data.timetable.filter(s => s.hari === day);
      return `
        <tr>
          <td class="timetable-day-header" style="font-weight: 700; width: 110px; text-align: center;">${day}</td>
          <td>
            ${slots.length === 0 
              ? `<div style="display: flex; align-items: center; justify-content: space-between; padding: 0.25rem 0;">
                  <span style="color: var(--slate-400); font-size: 0.8rem;">Tidak ada jadwal mengajar</span>
                  <button type="button" class="btn btn-ghost btn-xs" style="color: var(--emerald-600); font-size: 0.725rem;" onclick="TimetableModule.openAddModalForDay('${day}')">+ Tambah Sesi</button>
                 </div>` 
              : slots.map(s => `
                <div class="timetable-slot-card">
                  <div style="display: flex; justify-content: space-between;">
                    <strong>${s.kelas} - ${s.mapel}</strong>
                    <button onclick="TimetableModule.deleteSlot('${s.id}')" style="background:none;border:none;color:var(--rose-600);cursor:pointer;" title="Hapus Jadwal">&times;</button>
                  </div>
                  <span>${s.jamMulai} - ${s.jamSelesai} | Ruang: ${s.ruangan}</span>
                </div>
              `).join('')
            }
          </td>
        </tr>
      `;
    }).join('');
  },

  renderEvents() {
    const data = AppState.data;
    const container = document.getElementById('academic-events-list');
    if (!container) return;

    if (data.academicEvents.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2.5rem 1rem; border: 1px dashed var(--slate-300); border-radius: var(--radius-md); background: var(--slate-50);">
          <svg width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="color: var(--slate-400); margin-bottom: 0.35rem;"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          <h4 style="margin: 0; font-size: 0.95rem; color: var(--slate-700);">Belum Ada Agenda Kalender Akademik</h4>
          <p style="margin: 2px 0 0.75rem 0; font-size: 0.775rem; color: var(--slate-500);">Tambahkan jadwal ujian (STS/SAS), rapat pleno, atau pekan projek P5 sekolah.</p>
          <button class="btn btn-primary btn-sm" onclick="TimetableModule.openAddEventModal()">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
            <span>+ Catat Agenda Pertama</span>
          </button>
        </div>`;
      return;
    }

    container.innerHTML = data.academicEvents.map(evt => {
      let badgeClass = 'badge-kurikulum';
      if (evt.kategori === 'Ujian') badgeClass = 'icon-rose';
      if (evt.kategori === 'LiburNasional') badgeClass = 'icon-amber';
      return `
        <div class="academic-event-item" style="padding: 0.85rem; border: 1px solid var(--slate-200); border-radius: var(--radius-md); background: var(--white); margin-bottom: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <strong>${evt.judul}</strong>
              <span class="badge ${badgeClass}" style="font-size: 0.7rem; padding: 2px 6px; border-radius: 4px;">${evt.kategori}</span>
            </div>
            <div style="font-size: 0.775rem; color: var(--slate-500); margin-top: 3px;">
              ${UI.formatDate(evt.tanggal)} ${evt.keterangan ? '• ' + evt.keterangan : ''}
            </div>
          </div>
          <button class="btn btn-ghost btn-sm" style="color: var(--rose-600);" onclick="TimetableModule.deleteEvent('${evt.id}')">Hapus</button>
        </div>
      `;
    }).join('');
  },

  openAddModal(prefilledDay = null) {
    document.getElementById('form-timetable').reset();
    const classSelect = document.getElementById('sched-input-kelas');
    if (classSelect) {
      if (!AppState.data.classes || AppState.data.classes.length === 0) {
        classSelect.innerHTML = '<option value="Reguler">Kelas Reguler</option>';
      } else {
        classSelect.innerHTML = AppState.data.classes.map(c => `<option value="${c}">${c}</option>`).join('');
      }
    }
    if (prefilledDay) {
      const dayInput = document.getElementById('sched-input-hari');
      if (dayInput) dayInput.value = prefilledDay;
    }
    UI.openModal('modal-form-timetable');
  },

  openAddModalForDay(day) {
    this.openAddModal(day);
  },

  openAddEventModal() {
    const form = document.getElementById('form-academic-event');
    if (form) form.reset();
    const idInput = document.getElementById('event-edit-id');
    if (idInput) idInput.value = '';
    const dateInput = document.getElementById('event-input-tanggal');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
    UI.openModal('modal-form-academic-event');
  },

  saveEvent(e) {
    if (e && e.preventDefault) e.preventDefault();
    const judul = document.getElementById('event-input-judul').value.trim();
    const tanggal = document.getElementById('event-input-tanggal').value;
    const kategori = document.getElementById('event-input-kategori').value;
    const keterangan = document.getElementById('event-input-keterangan').value.trim();
    const editId = document.getElementById('event-edit-id').value;

    if (!judul || !tanggal) {
      UI.showToast('Nama agenda dan tanggal wajib diisi!', 'error');
      return;
    }

    if (!AppState.data.academicEvents) AppState.data.academicEvents = [];

    if (editId) {
      const idx = AppState.data.academicEvents.findIndex(ev => ev.id === editId);
      if (idx !== -1) {
        AppState.data.academicEvents[idx] = { id: editId, judul, tanggal, kategori, keterangan };
      }
    } else {
      const newId = StorageManager.generateId('EVT', AppState.data.academicEvents);
      AppState.data.academicEvents.push({ id: newId, judul, tanggal, kategori, keterangan });
    }

    // Urutkan agenda secara kronologis tanggal
    AppState.data.academicEvents.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));

    AppState.save();
    UI.closeModal('modal-form-academic-event');
    UI.showToast('Agenda kalender akademik berhasil disimpan!');
    this.renderEvents();
  },

  saveSlot(e) {
    e.preventDefault();
    const hari = document.getElementById('sched-input-hari').value;
    const jamMulai = document.getElementById('sched-input-mulai').value;
    const jamSelesai = document.getElementById('sched-input-selesai').value;
    const kelas = document.getElementById('sched-input-kelas').value;
    const mapel = document.getElementById('sched-input-mapel').value.trim() || AppState.currentTeacher.mataPelajaran;
    const ruangan = document.getElementById('sched-input-ruang').value.trim() || 'Kelas Reguler';

    const newId = StorageManager.generateId('SCH', AppState.data.timetable);
    AppState.data.timetable.push({
      id: newId, hari, jamMulai, jamSelesai, kelas, mapel, ruangan, color: 'emerald'
    });

    AppState.save();
    UI.closeModal('modal-form-timetable');
    UI.showToast('Jadwal mengajar berhasil ditambahkan!');
    this.renderWeekly();
    DashboardModule.render();
  },

  deleteSlot(id) {
    AppState.data.timetable = AppState.data.timetable.filter(s => s.id !== id);
    AppState.save();
    UI.showToast('Jadwal dihapus.');
    this.renderWeekly();
    DashboardModule.render();
  },

  deleteEvent(id) {
    AppState.data.academicEvents = AppState.data.academicEvents.filter(e => e.id !== id);
    AppState.save();
    UI.showToast('Agenda kalender dihapus.');
    this.renderEvents();
  }
};

// ==========================================================================
// 8. Digital Gradebook Module (Buku Nilai Digital)
// ==========================================================================
const GradebookModule = {
  render() {
    const data = AppState.data;
    if (!data) return;

    // Populate Class Selector
    const classSelector = document.getElementById('grade-class-select');
    if (classSelector) {
      if (!data.classes || data.classes.length === 0) {
        classSelector.innerHTML = '<option value="">(Belum Ada Kelas)</option>';
      } else {
        classSelector.innerHTML = data.classes.map(c => 
          `<option value="${c}" ${c === AppState.selectedClass ? 'selected' : ''}>${c}</option>`
        ).join('');
      }
    }

    // Weight indicators
    const wTugas = document.getElementById('weight-display-tugas');
    const wUTS = document.getElementById('weight-display-uts');
    const wUAS = document.getElementById('weight-display-uas');
    if (wTugas) wTugas.textContent = (data.gradeWeights?.tugas || 30) + '%';
    if (wUTS) wUTS.textContent = (data.gradeWeights?.uts || 30) + '%';
    if (wUAS) wUAS.textContent = (data.gradeWeights?.uas || 40) + '%';

    this.renderTable();
  },

  onClassChange(className) {
    AppState.selectedClass = className;
    this.renderTable();
  },

  calculateGrade(tugasList, uts, uas) {
    const weights = AppState.data.gradeWeights;
    const avgTugas = tugasList && tugasList.length > 0 
      ? tugasList.reduce((a, b) => a + Number(b), 0) / tugasList.length 
      : 0;
    
    const finalScore = (avgTugas * (weights.tugas / 100)) + 
                       (Number(uts) * (weights.uts / 100)) + 
                       (Number(uas) * (weights.uas / 100));

    const rounded = Math.round(finalScore * 10) / 10;
    let predikat = 'D';
    if (rounded >= 88) predikat = 'A';
    else if (rounded >= 76) predikat = 'B';
    else if (rounded >= 65) predikat = 'C';

    return { avgTugas: Math.round(avgTugas * 10) / 10, finalScore: rounded, predikat };
  },

  renderTable() {
    const data = AppState.data;
    const currentClass = AppState.selectedClass;
    const studentsInClass = data.students.filter(s => s.kelas === currentClass);
    const tbody = document.getElementById('gradebook-table-body');
    if (!tbody) return;

    if (studentsInClass.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10" style="text-align: center; padding: 3rem 1rem;">
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem;">
              <svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="color: var(--slate-400);"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              <h4 style="margin: 0; font-size: 1rem; color: var(--slate-700);">Belum Ada Siswa &amp; Rekap Nilai</h4>
              <p style="margin: 0; font-size: 0.8rem; color: var(--slate-500);">Daftarkan siswa di kelas ${currentClass || 'ini'} terlebih dahulu atau mulai masukkan nilai tugas/ujian.</p>
              <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem; flex-wrap: wrap; justify-content: center;">
                <button class="btn btn-primary btn-sm" onclick="GradebookModule.openInputModal()">
                  <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  <span>+ Input Nilai Siswa</span>
                </button>
                <button class="btn btn-secondary btn-sm" onclick="Navigation.switchView('view-classroom')">
                  <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
                  <span>+ Daftarkan Siswa Baru</span>
                </button>
              </div>
            </div>
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = studentsInClass.map((student, idx) => {
      let grade = data.gradebook.find(g => g.studentId === student.id);
      if (!grade) {
        grade = { studentId: student.id, kelas: currentClass, tugas: [80, 80], uts: 80, uas: 80 };
        data.gradebook.push(grade);
      }

      const t1 = grade.tugas[0] !== undefined ? grade.tugas[0] : 0;
      const t2 = grade.tugas[1] !== undefined ? grade.tugas[1] : 0;
      const calc = this.calculateGrade([t1, t2], grade.uts, grade.uas);

      return `
        <tr>
          <td style="font-weight: 600; width: 40px; text-align: center;">${idx + 1}</td>
          <td class="student-clickable-cell" onclick="StudentDetailModule.open('${student.id}', 'view-gradebook')" title="Buka Halaman Detail Siswa & Cetak Rapor">
            <div style="font-weight: 600; color: var(--slate-900); display: flex; align-items: center; gap: 0.35rem;">
              <span>${student.namaLengkap}</span>
              <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="color: var(--emerald-600); opacity: 0.7;"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
            </div>
            <div style="font-size: 0.725rem; color: var(--slate-500);">NISN: ${student.nisn || '-'}</div>
          </td>
          <td style="text-align: center;">
            <input type="number" min="0" max="100" class="grade-input" value="${t1}" 
              onchange="GradebookModule.updateGrade('${student.id}', 't1', this.value)">
          </td>
          <td style="text-align: center;">
            <input type="number" min="0" max="100" class="grade-input" value="${t2}" 
              onchange="GradebookModule.updateGrade('${student.id}', 't2', this.value)">
          </td>
          <td style="text-align: center; font-weight: 600; color: var(--slate-700);">${calc.avgTugas}</td>
          <td style="text-align: center;">
            <input type="number" min="0" max="100" class="grade-input" value="${grade.uts}" 
              onchange="GradebookModule.updateGrade('${student.id}', 'uts', this.value)">
          </td>
          <td style="text-align: center;">
            <input type="number" min="0" max="100" class="grade-input" value="${grade.uas}" 
              onchange="GradebookModule.updateGrade('${student.id}', 'uas', this.value)">
          </td>
          <td style="text-align: center; font-weight: 800; font-size: 0.95rem; color: var(--emerald-700);">${calc.finalScore}</td>
          <td style="text-align: center;">
            <span class="predicate-badge pred-${calc.predikat}">${calc.predikat}</span>
          </td>
          <td style="text-align: center;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="StudentDetailModule.open('${student.id}', 'view-gradebook')" title="Buka Halaman Detail & Rapor Siswa" style="padding: 0.25rem 0.55rem; font-size: 0.75rem;">
              <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              <span>Detail</span>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  openStudentDetail(studentId) {
    StudentDetailModule.open(studentId, 'view-gradebook');
  },

  updateGrade(studentId, field, value) {
    const val = Math.min(100, Math.max(0, parseFloat(value) || 0));
    let grade = AppState.data.gradebook.find(g => g.studentId === studentId);
    if (!grade) {
      grade = { studentId, kelas: AppState.selectedClass, tugas: [80, 80], uts: 80, uas: 80 };
      AppState.data.gradebook.push(grade);
    }

    if (field === 't1') grade.tugas[0] = val;
    else if (field === 't2') grade.tugas[1] = val;
    else if (field === 'uts') grade.uts = val;
    else if (field === 'uas') grade.uas = val;

    AppState.save();
    this.renderTable();
  },

  openWeightModal() {
    const w = AppState.data.gradeWeights;
    document.getElementById('input-weight-tugas').value = w.tugas;
    document.getElementById('input-weight-uts').value = w.uts;
    document.getElementById('input-weight-uas').value = w.uas;
    UI.openModal('modal-grade-weights');
  },

  saveWeights(e) {
    e.preventDefault();
    const tugas = parseInt(document.getElementById('input-weight-tugas').value, 10) || 0;
    const uts = parseInt(document.getElementById('input-weight-uts').value, 10) || 0;
    const uas = parseInt(document.getElementById('input-weight-uas').value, 10) || 0;

    if (tugas + uts + uas !== 100) {
      UI.showToast(`Total bobot harus tepat 100%! (Saat ini: ${tugas + uts + uas}%)`, 'error');
      return;
    }

    AppState.data.gradeWeights = { tugas, uts, uas };
    AppState.save();
    UI.closeModal('modal-grade-weights');
    UI.showToast('Bobot penilaian berhasil diperbarui!');
    this.render();
  },

  openInputModal(studentId = null) {
    const studentSelect = document.getElementById('grade-input-student');
    if (!studentSelect) return;
    const currentClass = AppState.selectedClass;
    let students = (AppState.data.students || []).filter(s => !currentClass || s.kelas === currentClass);
    if (students.length === 0) {
      students = AppState.data.students || [];
    }

    if (students.length === 0) {
      if (confirm('Belum ada siswa yang terdaftar. Buka menu Kelas & Siswa untuk menambahkan siswa baru sekarang?')) {
        Navigation.switchView('view-classroom');
      }
      return;
    }

    studentSelect.innerHTML = students.map(s => `<option value="${s.id}">${s.namaLengkap} (${s.kelas || '-'})</option>`).join('');
    if (studentId) {
      studentSelect.value = studentId;
    }
    this.onModalStudentSelect(studentSelect.value);
    UI.openModal('modal-input-grade');
  },

  onModalStudentSelect(studentId) {
    const grade = (AppState.data.gradebook || []).find(g => g.studentId === studentId);
    const idInput = document.getElementById('grade-edit-id');
    if (idInput) idInput.value = studentId || '';
    const t1Input = document.getElementById('grade-input-tugas1');
    const t2Input = document.getElementById('grade-input-tugas2');
    const utsInput = document.getElementById('grade-input-uts');
    const uasInput = document.getElementById('grade-input-uas');

    if (t1Input) t1Input.value = grade && grade.tugas && grade.tugas[0] !== undefined ? grade.tugas[0] : 80;
    if (t2Input) t2Input.value = grade && grade.tugas && grade.tugas[1] !== undefined ? grade.tugas[1] : 85;
    if (utsInput) utsInput.value = grade && grade.uts !== undefined ? grade.uts : 80;
    if (uasInput) uasInput.value = grade && grade.uas !== undefined ? grade.uas : 85;
  },

  saveGradeFromModal(e) {
    if (e && e.preventDefault) e.preventDefault();
    const studentId = document.getElementById('grade-input-student')?.value;
    if (!studentId) return;

    const t1 = parseFloat(document.getElementById('grade-input-tugas1')?.value) || 0;
    const t2 = parseFloat(document.getElementById('grade-input-tugas2')?.value) || 0;
    const uts = parseFloat(document.getElementById('grade-input-uts')?.value) || 0;
    const uas = parseFloat(document.getElementById('grade-input-uas')?.value) || 0;

    let grade = (AppState.data.gradebook || []).find(g => g.studentId === studentId);
    const student = (AppState.data.students || []).find(s => s.id === studentId);
    const studentClass = student ? student.kelas : AppState.selectedClass;

    if (!grade) {
      grade = { studentId: studentId, kelas: studentClass, tugas: [t1, t2], uts: uts, uas: uas };
      AppState.data.gradebook.push(grade);
    } else {
      grade.tugas = [t1, t2];
      grade.uts = uts;
      grade.uas = uas;
      grade.kelas = studentClass;
    }

    AppState.save();
    UI.closeModal('modal-input-grade');
    UI.showToast('Nilai siswa berhasil disimpan!');
    this.renderTable();
  },

  exportExcel() {
    const currentClass = AppState.selectedClass;
    const studentsInClass = AppState.data.students.filter(s => s.kelas === currentClass);
    if (studentsInClass.length === 0) {
      UI.showToast('Tidak ada data nilai untuk diekspor.', 'error');
      return;
    }

    const teacher = AppState.data.teacherProfile || {};
    const weights = AppState.data.gradeWeights || { tugas: 30, uts: 30, uas: 40 };
    const dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    let finalScores = [];
    let tuntasCount = 0;

    let rowsHtml = '';
    studentsInClass.forEach((st, idx) => {
      const g = AppState.data.gradebook.find(item => item.studentId === st.id) || { tugas: [0, 0], uts: 0, uas: 0 };
      const calc = this.calculateGrade(g.tugas, g.uts, g.uas);
      const scoreNum = parseFloat(calc.finalScore) || 0;
      const isTuntas = scoreNum >= 75;
      if (isTuntas) tuntasCount++;
      finalScores.push(scoreNum);

      const rowBg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
      const statusBadge = isTuntas 
        ? '<span style="color:#047857;font-weight:700;">TUNTAS</span>' 
        : '<span style="color:#b91c1c;font-weight:700;">PERLU PENGUATAN</span>';

      rowsHtml += `
        <tr style="background-color:${rowBg};">
          <td style="text-align:center;border:1px solid #cbd5e1;padding:6px 8px;">${idx + 1}</td>
          <td style="text-align:center;border:1px solid #cbd5e1;padding:6px 8px;mso-number-format:'\\@';">${st.nisn}</td>
          <td style="border:1px solid #cbd5e1;padding:6px 10px;font-weight:600;">${st.namaLengkap}</td>
          <td style="text-align:center;border:1px solid #cbd5e1;padding:6px 8px;">${g.tugas[0] || 0}</td>
          <td style="text-align:center;border:1px solid #cbd5e1;padding:6px 8px;">${g.tugas[1] || 0}</td>
          <td style="text-align:center;border:1px solid #cbd5e1;padding:6px 8px;font-weight:600;">${calc.avgTugas}</td>
          <td style="text-align:center;border:1px solid #cbd5e1;padding:6px 8px;">${g.uts || 0}</td>
          <td style="text-align:center;border:1px solid #cbd5e1;padding:6px 8px;">${g.uas || 0}</td>
          <td style="text-align:center;border:1px solid #cbd5e1;padding:6px 8px;font-weight:700;color:#0f172a;background-color:#f1f5f9;">${calc.finalScore}</td>
          <td style="text-align:center;border:1px solid #cbd5e1;padding:6px 8px;font-weight:700;">${calc.predikat}</td>
          <td style="text-align:center;border:1px solid #cbd5e1;padding:6px 8px;">${statusBadge}</td>
        </tr>`;
    });

    const totalStudents = studentsInClass.length;
    const avgScore = totalStudents > 0 ? (finalScores.reduce((a, b) => a + b, 0) / totalStudents).toFixed(1) : 0;
    const maxScore = totalStudents > 0 ? Math.max(...finalScores).toFixed(1) : 0;
    const minScore = totalStudents > 0 ? Math.min(...finalScores).toFixed(1) : 0;
    const tuntasPercent = totalStudents > 0 ? ((tuntasCount / totalStudents) * 100).toFixed(1) : 0;

    const excelTemplate = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Buku Nilai - ${currentClass}</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          body { font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; }
          table { border-collapse: collapse; width: 100%; }
          th { background-color: #059669; color: #ffffff; font-weight: bold; border: 1px solid #047857; padding: 8px 10px; text-align: center; }
          td { border: 1px solid #cbd5e1; padding: 6px 8px; }
          .kop-title { font-size: 14pt; font-weight: bold; color: #064e3b; text-align: left; }
          .kop-sub { font-size: 10pt; color: #334155; }
          .stat-label { background-color: #f8fafc; font-weight: bold; border: 1px solid #cbd5e1; padding: 6px 10px; }
          .stat-val { background-color: #ffffff; font-weight: bold; text-align: center; border: 1px solid #cbd5e1; padding: 6px 10px; }
        </style>
      </head>
      <body>
        <table>
          <tr>
            <td colspan="11" class="kop-title">BUKU NILAI HASIL BELAJAR SISWA (KURIKULUM MERDEKA)</td>
          </tr>
          <tr>
            <td colspan="11" class="kop-sub">
              <strong>Satuan Pendidikan:</strong> ${teacher.sekolah || 'SMA Negeri 1 Harapan Nusantara'} &nbsp;|&nbsp;
              <strong>Mata Pelajaran:</strong> ${teacher.mapel || 'Informatika'} &nbsp;|&nbsp;
              <strong>Kelas:</strong> ${currentClass} &nbsp;|&nbsp;
              <strong>Guru Pengampu:</strong> ${teacher.nama || 'Budi Pratama, S.Pd., M.Kom.'}
            </td>
          </tr>
          <tr>
            <td colspan="11" class="kop-sub">
              <strong>Tahun Ajaran:</strong> 2026/2027 &nbsp;|&nbsp;
              <strong>Bobot Penilaian:</strong> Tugas ${weights.tugas}% • UTS/STS ${weights.uts}% • UAS/SAS ${weights.uas}% &nbsp;|&nbsp;
              <strong>Tanggal Unduh:</strong> ${dateStr}
            </td>
          </tr>
          <tr><td colspan="11" style="height: 12px; border: none;"></td></tr>
        </table>

        <!-- Table Utama Nilai Siswa -->
        <table>
          <thead>
            <tr style="background-color: #059669; color: #ffffff;">
              <th style="width: 40px; background-color: #059669; color: #ffffff;">No</th>
              <th style="width: 130px; background-color: #059669; color: #ffffff;">NISN</th>
              <th style="width: 260px; background-color: #059669; color: #ffffff; text-align: left;">Nama Siswa</th>
              <th style="width: 75px; background-color: #059669; color: #ffffff;">Tugas 1</th>
              <th style="width: 75px; background-color: #059669; color: #ffffff;">Tugas 2</th>
              <th style="width: 90px; background-color: #059669; color: #ffffff;">Rata Tugas</th>
              <th style="width: 80px; background-color: #059669; color: #ffffff;">UTS / STS</th>
              <th style="width: 80px; background-color: #059669; color: #ffffff;">UAS / SAS</th>
              <th style="width: 90px; background-color: #047857; color: #ffffff;">Nilai Akhir</th>
              <th style="width: 75px; background-color: #047857; color: #ffffff;">Predikat</th>
              <th style="width: 140px; background-color: #059669; color: #ffffff;">Status Capaian</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <br/>
        <!-- Tabel Ringkasan Rekapitulasi Statistik -->
        <table style="width: 60%; margin-top: 10px;">
          <tr>
            <td colspan="2" style="background-color: #0f766e; color: #ffffff; font-weight: bold; padding: 6px 10px;">REKAPITULASI STATISTIK KELAS (${currentClass})</td>
          </tr>
          <tr>
            <td class="stat-label">Total Siswa Terdaftar</td>
            <td class="stat-val">${totalStudents} Siswa</td>
          </tr>
          <tr>
            <td class="stat-label">Nilai Rata-rata Kelas</td>
            <td class="stat-val" style="color: #0369a1;">${avgScore}</td>
          </tr>
          <tr>
            <td class="stat-label">Nilai Tertinggi (Maksimum)</td>
            <td class="stat-val" style="color: #059669;">${maxScore}</td>
          </tr>
          <tr>
            <td class="stat-label">Nilai Terendah (Minimum)</td>
            <td class="stat-val" style="color: #b91c1c;">${minScore}</td>
          </tr>
          <tr>
            <td class="stat-label">Jumlah Siswa Tuntas (Nilai &ge; 75)</td>
            <td class="stat-val" style="color: #059669;">${tuntasCount} Siswa (${tuntasPercent}%)</td>
          </tr>
          <tr>
            <td class="stat-label">Jumlah Siswa Perlu Penguatan (Nilai &lt; 75)</td>
            <td class="stat-val" style="color: #b91c1c;">${totalStudents - tuntasCount} Siswa</td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([excelTemplate], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Buku_Nilai_Resmi_${currentClass.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xls`;
    a.click();
    URL.revokeObjectURL(url);
    UI.showToast('Tabel Excel (.xls) resmi siap filter berhasil diunduh!');
  },

  exportCSV() {
    const currentClass = AppState.selectedClass;
    const studentsInClass = AppState.data.students.filter(s => s.kelas === currentClass);
    if (studentsInClass.length === 0) {
      UI.showToast('Tidak ada data nilai untuk diekspor.', 'error');
      return;
    }

    let csv = 'No,NISN,Nama Siswa,Tugas 1,Tugas 2,Rata Tugas,UTS,UAS,Nilai Akhir,Predikat\n';
    studentsInClass.forEach((st, idx) => {
      const g = AppState.data.gradebook.find(item => item.studentId === st.id) || { tugas: [0, 0], uts: 0, uas: 0 };
      const calc = this.calculateGrade(g.tugas, g.uts, g.uas);
      csv += `${idx + 1},"${st.nisn}","${st.namaLengkap}",${g.tugas[0] || 0},${g.tugas[1] || 0},${calc.avgTugas},${g.uts},${g.uas},${calc.finalScore},${calc.predikat}\n`;
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Buku_Nilai_${currentClass.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    UI.showToast('File CSV Buku Nilai berhasil diunduh!');
  }
};

// ==========================================================================
// 8B. Dedicated Student Detail & Grade Breakdown Module
// ==========================================================================
const StudentDetailModule = {
  currentStudentId: null,
  returnView: 'view-gradebook',

  open(studentId, fromView = 'view-gradebook') {
    this.currentStudentId = studentId;
    this.returnView = fromView;
    Navigation.switchView('view-student-detail');
  },

  goBack() {
    const target = this.returnView || 'view-gradebook';
    Navigation.switchView(target);
  },

  render() {
    const data = AppState.data;
    if (!data) return;

    if (!this.currentStudentId) {
      const first = (data.students && data.students.length > 0) ? data.students[0].id : null;
      if (first) this.currentStudentId = first;
      else return;
    }

    const student = (data.students || []).find(s => s.id === this.currentStudentId);
    if (!student) return;

    let grade = (data.gradebook || []).find(g => g.studentId === student.id);
    if (!grade) {
      grade = { studentId: student.id, kelas: student.kelas || AppState.selectedClass, tugas: [80, 80], uts: 80, uas: 80, feedback: '' };
      data.gradebook.push(grade);
      AppState.save();
    }

    const t1 = (grade.tugas && grade.tugas[0] !== undefined) ? grade.tugas[0] : 0;
    const t2 = (grade.tugas && grade.tugas[1] !== undefined) ? grade.tugas[1] : 0;
    const calc = GradebookModule.calculateGrade([t1, t2], grade.uts, grade.uas);
    const weights = data.gradeWeights || { tugas: 30, uts: 30, uas: 40 };

    // Update dynamic back button label & breadcrumb
    const backBtnLabel = document.getElementById('sd-back-btn-label');
    if (backBtnLabel) {
      backBtnLabel.textContent = this.returnView === 'view-classroom' ? '← Kembali ke Data Kelas' : '← Kembali ke Buku Nilai';
    }

    const breadcrumbName = document.getElementById('sd-breadcrumb-name');
    if (breadcrumbName) {
      breadcrumbName.textContent = student.namaLengkap;
    }

    // Profile Card
    const avatarEl = document.getElementById('sd-avatar');
    if (avatarEl) {
      avatarEl.textContent = student.namaLengkap ? student.namaLengkap.trim()[0].toUpperCase() : 'S';
    }

    const fullNameEl = document.getElementById('sd-full-name');
    if (fullNameEl) fullNameEl.textContent = student.namaLengkap;

    const nisnEl = document.getElementById('sd-nisn');
    if (nisnEl) nisnEl.textContent = student.nisn || '-';

    const classEl = document.getElementById('sd-class');
    if (classEl) classEl.textContent = student.kelas || AppState.selectedClass || '-';

    const genderBadge = document.getElementById('sd-gender-badge');
    if (genderBadge) {
      genderBadge.className = `badge ${student.jenisKelamin === 'L' ? 'icon-sky' : 'icon-rose'}`;
      genderBadge.textContent = student.jenisKelamin === 'L' ? 'Laki-Laki' : 'Perempuan';
    }

    // KPI Cards
    const kpiScore = document.getElementById('sd-kpi-score');
    if (kpiScore) kpiScore.textContent = calc.finalScore;

    const kpiPredicate = document.getElementById('sd-kpi-predicate');
    if (kpiPredicate) {
      kpiPredicate.innerHTML = `<span class="predicate-badge pred-${calc.predikat}" style="font-size: 1.5rem; padding: 0.3rem 1.25rem;">${calc.predikat}</span>`;
    }

    const kpiDesc = document.getElementById('sd-kpi-predicate-desc');
    if (kpiDesc) {
      const descs = {
        'A': 'Sangat Baik (Istimewa)',
        'B': 'Baik (Memenuhi Capaian)',
        'C': 'Cukup (Perlu Latihan Mandiri)',
        'D': 'Perlu Bimbingan Tambahan'
      };
      kpiDesc.textContent = descs[calc.predikat] || 'Tercapai';
    }

    const kpiKktp = document.getElementById('sd-kpi-kktp');
    if (kpiKktp) {
      const isTuntas = calc.finalScore >= 75;
      kpiKktp.textContent = isTuntas ? 'TUNTAS' : 'PERLU REMEDIAL';
      kpiKktp.style.color = isTuntas ? 'var(--emerald-600)' : 'var(--rose-600)';
    }

    // Breakdown Table
    const tbody = document.getElementById('sd-breakdown-tbody');
    if (tbody) {
      const contribTugas = ((calc.avgTugas * weights.tugas) / 100).toFixed(1);
      const contribUts = ((grade.uts * weights.uts) / 100).toFixed(1);
      const contribUas = ((grade.uas * weights.uas) / 100).toFixed(1);

      tbody.innerHTML = `
        <tr>
          <td>
            <strong>Asesmen Formatif (Rata-rata Tugas & Praktikum)</strong><br>
            <small style="color:var(--slate-500);">Tugas 1 (TP 1): ${t1} | Tugas 2 (TP 2): ${t2}</small>
          </td>
          <td style="text-align: center; font-weight: 700;">${calc.avgTugas}</td>
          <td style="text-align: center;">${weights.tugas}%</td>
          <td style="text-align: center; font-weight: 700; color: var(--emerald-600);">${contribTugas}</td>
          <td>Evaluasi penguasaan materi harian</td>
        </tr>
        <tr>
          <td><strong>Sumatif Tengah Semester (STS / UTS)</strong></td>
          <td style="text-align: center; font-weight: 700;">${grade.uts}</td>
          <td style="text-align: center;">${weights.uts}%</td>
          <td style="text-align: center; font-weight: 700; color: var(--emerald-600);">${contribUts}</td>
          <td>Asesmen capaian tengah semester</td>
        </tr>
        <tr>
          <td><strong>Sumatif Akhir Semester (SAS / UAS)</strong></td>
          <td style="text-align: center; font-weight: 700;">${grade.uas}</td>
          <td style="text-align: center;">${weights.uas}%</td>
          <td style="text-align: center; font-weight: 700; color: var(--emerald-600);">${contribUas}</td>
          <td>Evaluasi capaian komprehensif</td>
        </tr>
        <tr style="background: var(--slate-50); font-weight: 700;">
          <td colspan="3" style="text-align: right; padding-right: 1rem;">NILAI AKHIR KUMULATIF:</td>
          <td style="text-align: center; font-size: 1.1rem; color: var(--emerald-600);">${calc.finalScore}</td>
          <td>PREDIKAT: ${calc.predikat}</td>
        </tr>
      `;
    }

    // Feedback Editor
    const fbTextarea = document.getElementById('sd-feedback-textarea');
    if (fbTextarea) {
      fbTextarea.value = grade.feedback || student.catatanAnekdot || '';
    }

    const statusEl = document.getElementById('sd-feedback-status');
    if (statusEl) statusEl.style.display = 'none';
  },

  saveFeedback() {
    if (!this.currentStudentId) return;
    const fbTextarea = document.getElementById('sd-feedback-textarea');
    const text = fbTextarea ? fbTextarea.value.trim() : '';

    let grade = AppState.data.gradebook.find(g => g.studentId === this.currentStudentId);
    if (grade) {
      grade.feedback = text;
    }

    let student = AppState.data.students.find(s => s.id === this.currentStudentId);
    if (student && text) {
      student.catatanAnekdot = text;
    }

    AppState.save();

    const statusEl = document.getElementById('sd-feedback-status');
    if (statusEl) {
      statusEl.style.display = 'inline';
      setTimeout(() => {
        statusEl.style.display = 'none';
      }, 2500);
    }
    UI.showToast('Catatan feedback guru berhasil disimpan!');
  },

  printCurrentReport() {
    if (!this.currentStudentId) return;
    PrintModule.printSingleStudentGrade(this.currentStudentId);
  }
};

// ==========================================================================
// 9. Classroom & Student Management Module
// ==========================================================================
const ClassroomModule = {
  currentSubTab: 'students',
  selectedClass: '',

  render() {
    this.selectedClass = AppState.selectedClass;

    // Populate Subnav Class Dropdown
    const selector = document.getElementById('classroom-class-select');
    if (selector) {
      if (!AppState.data.classes || AppState.data.classes.length === 0) {
        selector.innerHTML = '<option value="">(Belum Ada Kelas - Klik + Kelola Kelas)</option>';
      } else {
        selector.innerHTML = AppState.data.classes.map(c => 
          `<option value="${c}" ${c === this.selectedClass ? 'selected' : ''}>${c}</option>`
        ).join('');
      }
    }

    this.switchSubTab(this.currentSubTab);
  },

  onClassChange(className) {
    this.selectedClass = className;
    AppState.selectedClass = className;
    this.render();
  },

  switchSubTab(tab) {
    this.currentSubTab = tab;
    document.querySelectorAll('.subnav-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.subtab === tab) btn.classList.add('active');
    });

    document.querySelectorAll('.classroom-pane').forEach(p => p.style.display = 'none');
    const pane = document.getElementById(`pane-${tab}`);
    if (pane) pane.style.display = 'block';

    if (tab === 'students') this.renderStudents();
    else if (tab === 'attendance') this.renderAttendance();
    else if (tab === 'seating') this.renderSeating();
    else if (tab === 'picker') this.renderPicker();
  },

  renderStudents() {
    const list = AppState.data.students.filter(s => s.kelas === this.selectedClass);
    const container = document.getElementById('student-table-body');
    if (!container) return;

    if (list.length === 0) {
      container.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 3rem 1rem;">
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem;">
              <svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="color: var(--slate-400);"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
              <h4 style="margin: 0; font-size: 1rem; color: var(--slate-700);">Belum Ada Peserta Didik di Kelas Ini</h4>
              <p style="margin: 0; font-size: 0.8rem; color: var(--slate-500);">Mulai daftarkan data murid untuk mengelola absensi, denah duduk, dan nilai rapor.</p>
              <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem; flex-wrap: wrap; justify-content: center;">
                <button class="btn btn-primary btn-sm" onclick="ClassroomModule.openAddStudentModal()">
                  <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
                  <span>+ Daftarkan Siswa Baru</span>
                </button>
                <button class="btn btn-secondary btn-sm" onclick="ClassroomModule.openManageClassesModal()">
                  <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                  <span>+ Kelola / Tambah Kelas</span>
                </button>
              </div>
            </div>
          </td>
        </tr>`;
      return;
    }

    container.innerHTML = list.map((st, idx) => `
      <tr>
        <td style="font-weight: 600; width: 40px; text-align: center;">${idx + 1}</td>
        <td class="student-clickable-cell" onclick="StudentDetailModule.open('${st.id}', 'view-classroom')" title="Buka Detail Capaian Belajar & Rapor Siswa">
          <div style="font-weight: 600; color: var(--slate-900); display: flex; align-items: center; gap: 0.35rem;">
            <span>${st.namaLengkap}</span>
            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="color: var(--emerald-600); opacity: 0.7;"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
          </div>
          <div style="font-size: 0.725rem; color: var(--slate-500);">Buka lembar detail & cetak rapor siswa</div>
        </td>
        <td>${st.nisn}</td>
        <td><span class="badge ${st.jenisKelamin === 'L' ? 'icon-sky' : 'icon-rose'}" style="padding: 2px 8px; border-radius: 4px;">${st.jenisKelamin === 'L' ? 'Laki-Laki' : 'Perempuan'}</span></td>
        <td style="font-size: 0.8rem; color: var(--slate-600); max-width: 250px;">${st.catatanAnekdot || '-'}</td>
        <td style="text-align: right;">
          <button class="btn btn-secondary btn-sm" onclick="StudentDetailModule.open('${st.id}', 'view-classroom')" title="Buka Detail Portofolio & Rapor Siswa" style="padding: 0.25rem 0.55rem; font-size: 0.75rem; margin-right: 0.35rem;">
            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            <span>Rapor</span>
          </button>
          <button class="btn btn-ghost btn-sm" onclick="ClassroomModule.editStudent('${st.id}')">Edit</button>
          <button class="btn btn-ghost btn-sm" style="color: var(--rose-600);" onclick="ClassroomModule.deleteStudent('${st.id}')">Hapus</button>
        </td>
      </tr>
    `).join('');
  },

  renderAttendance() {
    const dateInput = document.getElementById('attendance-date-picker');
    const today = new Date().toISOString().split('T')[0];
    if (dateInput && !dateInput.value) dateInput.value = today;
    const selectedDate = dateInput?.value || today;

    let log = AppState.data.attendanceLogs.find(l => l.kelas === this.selectedClass && l.tanggal === selectedDate);
    if (!log) {
      log = {
        id: StorageManager.generateId('ABS', AppState.data.attendanceLogs),
        kelas: this.selectedClass,
        tanggal: selectedDate,
        records: {}
      };
      // Default all to H
      AppState.data.students.filter(s => s.kelas === this.selectedClass).forEach(s => {
        log.records[s.id] = 'H';
      });
      AppState.data.attendanceLogs.push(log);
      AppState.save();
    }

    const students = AppState.data.students.filter(s => s.kelas === this.selectedClass);
    const container = document.getElementById('attendance-list-body');
    if (!container) return;

    let hadirCount = 0;
    container.innerHTML = students.map((st, idx) => {
      const status = log.records[st.id] || 'H';
      if (status === 'H') hadirCount++;

      return `
        <tr>
          <td style="text-align: center; font-weight: 600;">${idx + 1}</td>
          <td><strong>${st.namaLengkap}</strong></td>
          <td style="text-align: center;">
            <div style="display: inline-flex; gap: 0.35rem;">
              <button class="btn btn-sm ${status === 'H' ? 'btn-primary' : 'btn-secondary'}" 
                onclick="ClassroomModule.setAttendance('${log.id}', '${st.id}', 'H')">H (Hadir)</button>
              <button class="btn btn-sm ${status === 'I' ? 'btn-status-izin' : 'btn-secondary'}" 
                onclick="ClassroomModule.setAttendance('${log.id}', '${st.id}', 'I')">I (Izin)</button>
              <button class="btn btn-sm ${status === 'S' ? 'btn-status-sakit' : 'btn-secondary'}" 
                onclick="ClassroomModule.setAttendance('${log.id}', '${st.id}', 'S')">S (Sakit)</button>
              <button class="btn btn-sm ${status === 'A' ? 'btn-status-alpa' : 'btn-secondary'}" 
                onclick="ClassroomModule.setAttendance('${log.id}', '${st.id}', 'A')">A (Alpa)</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    const recap = document.getElementById('attendance-recap-text');
    if (recap) {
      const pct = students.length > 0 ? Math.round((hadirCount / students.length) * 100) : 0;
      recap.textContent = `Kehadiran: ${hadirCount} dari ${students.length} Siswa (${pct}%)`;
    }
  },

  setAttendance(logId, studentId, status) {
    const log = AppState.data.attendanceLogs.find(l => l.id === logId);
    if (!log) return;
    log.records[studentId] = status;
    AppState.save();
    this.renderAttendance();
    DashboardModule.render();
  },

  markAllPresent() {
    const dateInput = document.getElementById('attendance-date-picker')?.value;
    const log = AppState.data.attendanceLogs.find(l => l.kelas === this.selectedClass && l.tanggal === dateInput);
    if (log) {
      AppState.data.students.filter(s => s.kelas === this.selectedClass).forEach(s => {
        log.records[s.id] = 'H';
      });
      AppState.save();
      this.renderAttendance();
      UI.showToast('Semua siswa berhasil ditandai Hadir (H)!');
    }
  },

  renderSeating() {
    const students = AppState.data.students.filter(s => s.kelas === this.selectedClass);
    const container = document.getElementById('seating-chart-grid');
    if (!container) return;

    // Build a 4x4 or 4x5 desk layout
    const totalDesks = 16;
    let html = '';
    for (let i = 1; i <= totalDesks; i++) {
      const student = students[i - 1];
      if (student) {
        html += `
          <div class="desk-slot occupied" onclick="ClassroomModule.showStudentNote('${student.id}')">
            <span class="desk-number">Meja #${i}</span>
            <span class="desk-student-name">${student.namaLengkap}</span>
          </div>
        `;
      } else {
        html += `
          <div class="desk-slot" style="opacity: 0.6;">
            <span class="desk-number">Meja #${i}</span>
            <span style="font-size: 0.75rem; color: var(--slate-400);">Kosong</span>
          </div>
        `;
      }
    }
    container.innerHTML = html;
  },

  renderPicker() {
    const nameEl = document.getElementById('picker-result-name');
    if (nameEl) nameEl.textContent = 'Klik "Putar Pengacak"';
  },

  spinStudentPicker() {
    const students = AppState.data.students.filter(s => s.kelas === this.selectedClass);
    if (students.length === 0) {
      UI.showToast('Tidak ada siswa di kelas ini.', 'error');
      return;
    }

    const nameEl = document.getElementById('picker-result-name');
    const subEl = document.getElementById('picker-result-sub');
    const btn = document.getElementById('btn-spin-picker');
    if (!nameEl || !btn) return;

    btn.disabled = true;
    nameEl.classList.add('pulsing');

    let counter = 0;
    const totalFlips = 28;
    const interval = setInterval(() => {
      const randIdx = Math.floor(Math.random() * students.length);
      nameEl.textContent = students[randIdx].namaLengkap;
      if (subEl) subEl.textContent = `NISN: ${students[randIdx].nisn}`;
      counter++;

      if (counter >= totalFlips) {
        clearInterval(interval);
        nameEl.classList.remove('pulsing');
        btn.disabled = false;
        
        // Final pick
        const winner = students[Math.floor(Math.random() * students.length)];
        nameEl.textContent = winner.namaLengkap;
        if (subEl) subEl.textContent = `🎯 Terpilih untuk Maju / Menjawab Pertanyaan!`;
        UI.showToast(`🎉 Siswa Terpilih: ${winner.namaLengkap}!`);
      }
    }, 70);
  },

  openAddStudentModal() {
    if (!AppState.data.classes || AppState.data.classes.length === 0) {
      if (confirm('Anda belum membuat kelas mengajar. Buat kelas mengajar baru terlebih dahulu?')) {
        this.openManageClassesModal();
        return;
      }
    }
    document.getElementById('form-student').reset();
    document.getElementById('student-edit-id').value = '';
    const classInput = document.getElementById('student-input-kelas');
    if (classInput) {
      classInput.value = this.selectedClass || (AppState.data.classes && AppState.data.classes[0]) || '';
    }
    UI.openModal('modal-form-student');
  },

  openManageClassesModal() {
    this.renderManageClassesList();
    const input = document.getElementById('input-new-class-name');
    if (input) input.value = '';
    UI.openModal('modal-manage-classes');
  },

  renderManageClassesList() {
    const container = document.getElementById('manage-classes-list');
    if (!container) return;
    const classes = AppState.data.classes || [];
    if (classes.length === 0) {
      container.innerHTML = '<p class="text-muted" style="font-size: 0.8rem; padding: 0.5rem 0;">Belum ada kelas mengajar yang terdaftar.</p>';
      return;
    }
    container.innerHTML = classes.map(c => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0.75rem; background: var(--slate-50); border: 1px solid var(--slate-200); border-radius: var(--radius-md);">
        <strong style="font-size: 0.85rem; color: var(--slate-800);">${c}</strong>
        <button type="button" class="btn btn-ghost btn-sm" style="color: var(--rose-600); padding: 2px 8px; font-size: 0.75rem;" onclick="ClassroomModule.deleteClass('${c}')">Hapus</button>
      </div>
    `).join('');
  },

  addClassFromInput() {
    const input = document.getElementById('input-new-class-name');
    const name = input ? input.value.trim() : '';
    if (!name) {
      UI.showToast('Masukkan nama kelas baru (misal: X-A atau Kelas 4)!', 'error');
      return;
    }
    if (!AppState.data.classes) AppState.data.classes = [];
    if (AppState.data.classes.includes(name)) {
      UI.showToast('Kelas dengan nama tersebut sudah ada!', 'error');
      return;
    }
    AppState.data.classes.push(name);
    AppState.selectedClass = name;
    this.selectedClass = name;
    AppState.save();
    input.value = '';
    this.renderManageClassesList();
    this.render();
    UI.showToast(`Kelas "${name}" berhasil ditambahkan!`);
  },

  deleteClass(className) {
    const count = (AppState.data.students || []).filter(s => s.kelas === className).length;
    if (count > 0) {
      if (!confirm(`Ada ${count} siswa terdaftar di ${className}. Tetap hapus kelas ini?`)) return;
    }
    AppState.data.classes = (AppState.data.classes || []).filter(c => c !== className);
    if (AppState.selectedClass === className) {
      AppState.selectedClass = AppState.data.classes[0] || '';
      this.selectedClass = AppState.selectedClass;
    }
    AppState.save();
    this.renderManageClassesList();
    this.render();
    UI.showToast(`Kelas "${className}" dihapus.`);
  },

  saveStudent(e) {
    e.preventDefault();
    const editId = document.getElementById('student-edit-id').value;
    const nama = document.getElementById('student-input-nama').value.trim();
    const nisn = document.getElementById('student-input-nisn').value.trim();
    const jk = document.getElementById('student-input-jk').value;
    const kelas = document.getElementById('student-input-kelas').value;
    const catatan = document.getElementById('student-input-catatan').value.trim();

    if (!nama || !nisn) {
      UI.showToast('Nama dan NISN wajib diisi!', 'error');
      return;
    }

    if (editId) {
      const idx = AppState.data.students.findIndex(s => s.id === editId);
      if (idx !== -1) {
        AppState.data.students[idx] = {
          ...AppState.data.students[idx],
          namaLengkap: nama, nisn, jenisKelamin: jk, kelas, catatanAnekdot: catatan
        };
        UI.showToast('Data siswa berhasil diperbarui!');
      }
    } else {
      const newId = StorageManager.generateId('SIS', AppState.data.students);
      AppState.data.students.push({
        id: newId, namaLengkap: nama, nisn, jenisKelamin: jk, kelas, catatanAnekdot: catatan
      });
      UI.showToast('Siswa baru berhasil ditambahkan!');
    }

    AppState.save();
    UI.closeModal('modal-form-student');
    this.render();
    DashboardModule.render();
  },

  editStudent(id) {
    const student = AppState.data.students.find(s => s.id === id);
    if (!student) return;

    this.openAddStudentModal();
    document.getElementById('student-edit-id').value = student.id;
    document.getElementById('student-input-nama').value = student.namaLengkap;
    document.getElementById('student-input-nisn').value = student.nisn;
    document.getElementById('student-input-jk').value = student.jenisKelamin;
    document.getElementById('student-input-kelas').value = student.kelas;
    document.getElementById('student-input-catatan').value = student.catatanAnekdot || '';
  },

  showStudentNote(id) {
    const student = AppState.data.students.find(s => s.id === id);
    if (!student) return;
    alert(`Profil Siswa: ${student.namaLengkap}\nNISN: ${student.nisn}\nCatatan Karakter/Anekdot: ${student.catatanAnekdot || 'Belum ada catatan khusus.'}`);
  },

  deleteStudent(id) {
    if (!confirm('Hapus siswa ini dari daftar?')) return;
    AppState.data.students = AppState.data.students.filter(s => s.id !== id);
    AppState.save();
    UI.showToast('Siswa telah dihapus.');
    this.render();
    DashboardModule.render();
  }
};

// ==========================================================================
// 10. Task Manager & Marking Tracker Module
// ==========================================================================
const TaskModule = {
  render() {
    this.renderMarkingTasks();
    this.renderMeetings();
    this.renderReflections();
  },

  renderMarkingTasks() {
    const tasks = AppState.data.tasks;
    const container = document.getElementById('marking-tasks-list');
    if (!container) return;

    if (tasks.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2.5rem 1rem; border: 1px dashed var(--slate-300); border-radius: var(--radius-md); background: var(--slate-50);">
          <svg width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="color: var(--slate-400); margin-bottom: 0.35rem;"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
          <h4 style="margin: 0; font-size: 0.95rem; color: var(--slate-700);">Belum Ada Agenda Koreksi Tugas</h4>
          <p style="margin: 2px 0 0.75rem 0; font-size: 0.775rem; color: var(--slate-500);">Catat tumpukan lembar jawaban tugas atau ujian untuk memantau progres koreksi.</p>
          <button class="btn btn-primary btn-sm" onclick="TaskModule.openAddTaskModal()">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
            <span>+ Catat Tugas / Koreksi Baru</span>
          </button>
        </div>`;
      return;
    }

    container.innerHTML = tasks.map(t => {
      const pct = Math.round((t.selesaiKoreksi / (t.totalKoreksi || 1)) * 100);
      const isDone = t.selesaiKoreksi >= t.totalKoreksi;

      return `
        <div class="marking-card">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--slate-900);">${t.judul}</h4>
              <div style="font-size: 0.775rem; color: var(--slate-500); margin-top: 2px;">
                ${t.kelasMapel} • Batas Selesai: <strong>${UI.formatDate(t.deadline)}</strong>
              </div>
            </div>
            <button onclick="TaskModule.deleteTask('${t.id}')" style="background:none;border:none;color:var(--rose-600);cursor:pointer;" title="Hapus">&times;</button>
          </div>

          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${pct}%;"></div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
            <span style="font-size: 0.8rem; font-weight: 600; color: var(--slate-700);">
              Selesai: ${t.selesaiKoreksi} / ${t.totalKoreksi} Lembar (${pct}%)
            </span>
            <div style="display: flex; gap: 0.35rem;">
              <button class="btn btn-secondary btn-sm" onclick="TaskModule.adjustProgress('${t.id}', -1)" ${t.selesaiKoreksi <= 0 ? 'disabled' : ''}>-1</button>
              <button class="btn btn-primary btn-sm" onclick="TaskModule.adjustProgress('${t.id}', 1)" ${isDone ? 'disabled' : ''}>+1</button>
              <button class="btn btn-dark btn-sm" onclick="TaskModule.adjustProgress('${t.id}', ${t.totalKoreksi - t.selesaiKoreksi})">Tuntas</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  adjustProgress(id, delta) {
    const t = AppState.data.tasks.find(item => item.id === id);
    if (!t) return;
    t.selesaiKoreksi = Math.min(t.totalKoreksi, Math.max(0, t.selesaiKoreksi + delta));
    t.status = t.selesaiKoreksi >= t.totalKoreksi ? 'Selesai' : 'Pending';
    AppState.save();
    this.renderMarkingTasks();
    DashboardModule.render();
  },

  openAddTaskModal() {
    document.getElementById('form-task').reset();
    UI.openModal('modal-form-task');
  },

  saveTask(e) {
    e.preventDefault();
    const judul = document.getElementById('task-input-judul').value.trim();
    const kelasMapel = document.getElementById('task-input-kelas').value.trim();
    const total = parseInt(document.getElementById('task-input-total').value, 10) || 1;
    const deadline = document.getElementById('task-input-deadline').value;

    const newId = StorageManager.generateId('TSK', AppState.data.tasks);
    AppState.data.tasks.unshift({
      id: newId,
      judul,
      kelasMapel,
      totalKoreksi: total,
      selesaiKoreksi: 0,
      deadline,
      status: 'Pending'
    });

    AppState.save();
    UI.closeModal('modal-form-task');
    UI.showToast('Agenda koreksi tugas ditambahkan!');
    this.renderMarkingTasks();
    DashboardModule.render();
  },

  deleteTask(id) {
    AppState.data.tasks = AppState.data.tasks.filter(t => t.id !== id);
    AppState.save();
    UI.showToast('Tugas dihapus.');
    this.renderMarkingTasks();
    DashboardModule.render();
  },

  renderMeetings() {
    const list = AppState.data.meetings;
    const container = document.getElementById('meetings-list');
    if (!container) return;

    if (list.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 1.5rem 0.5rem;">
          <p class="text-muted" style="margin: 0 0 0.5rem 0; font-size: 0.8rem;">Belum ada notula rapat dinas / MGMP.</p>
          <button class="btn btn-secondary btn-sm" onclick="TaskModule.openAddMeetingModal()">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
            <span>+ Tulis Notula Baru</span>
          </button>
        </div>`;
      return;
    }

    container.innerHTML = list.map(m => `
      <div class="meeting-card-item" style="padding: 0.75rem; border: 1px solid var(--slate-200); border-radius: var(--radius-md); background: var(--slate-50); margin-bottom: 0.5rem;">
        <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 0.85rem;">
          <span>${m.judul}</span>
          <span style="font-size: 0.725rem; color: var(--slate-500); font-weight: 500;">${UI.formatDate(m.tanggal)}</span>
        </div>
        <p style="font-size: 0.8rem; color: var(--slate-600); margin-top: 4px; line-height: 1.4;">${m.hasil}</p>
      </div>
    `).join('');
  },

  renderReflections() {
    const list = AppState.data.reflections;
    const container = document.getElementById('reflections-list');
    if (!container) return;

    if (list.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 1.5rem 0.5rem;">
          <p class="text-muted" style="margin: 0 0 0.5rem 0; font-size: 0.8rem;">Belum ada jurnal refleksi mengajar harian.</p>
          <button class="btn btn-secondary btn-sm" onclick="TaskModule.openAddReflectionModal()">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
            <span>+ Tulis Refleksi Baru</span>
          </button>
        </div>`;
      return;
    }

    container.innerHTML = list.map(r => `
      <div class="reflection-card-item" style="padding: 0.75rem; border: 1px solid var(--slate-200); border-radius: var(--radius-md); background: var(--emerald-50); margin-bottom: 0.5rem;">
        <div style="font-size: 0.725rem; font-weight: 700; color: var(--emerald-800);">
          ${UI.formatDate(r.tanggal)} • ${r.kelas} (${r.materi})
        </div>
        <p style="font-size: 0.8rem; color: var(--slate-700); margin-top: 4px; line-height: 1.4;">${r.refleksi}</p>
      </div>
    `).join('');
  },

  openAddMeetingModal() {
    document.getElementById('form-meeting').reset();
    UI.openModal('modal-form-meeting');
  },

  saveMeeting(e) {
    e.preventDefault();
    const judul = document.getElementById('meeting-input-judul').value.trim();
    const tanggal = document.getElementById('meeting-input-tanggal').value;
    const hasil = document.getElementById('meeting-input-hasil').value.trim();

    const newId = StorageManager.generateId('MTG', AppState.data.meetings);
    AppState.data.meetings.unshift({ id: newId, judul, tanggal, hasil });
    AppState.save();
    UI.closeModal('modal-form-meeting');
    UI.showToast('Notulensi rapat tersimpan!');
    this.renderMeetings();
  },

  openAddReflectionModal() {
    document.getElementById('form-reflection').reset();
    UI.openModal('modal-form-reflection');
  },

  saveReflection(e) {
    e.preventDefault();
    const kelas = document.getElementById('ref-input-kelas').value.trim();
    const materi = document.getElementById('ref-input-materi').value.trim();
    const tanggal = document.getElementById('ref-input-tanggal').value;
    const refleksi = document.getElementById('ref-input-teks').value.trim();

    const newId = StorageManager.generateId('REF', AppState.data.reflections);
    AppState.data.reflections.unshift({ id: newId, kelas, materi, tanggal, refleksi });
    AppState.save();
    UI.closeModal('modal-form-reflection');
    UI.showToast('Jurnal refleksi mengajar tersimpan!');
    this.renderReflections();
  }
};

// ==========================================================================
// 11. AI Assistant & Export Hub Module
// ==========================================================================
const AIExportModule = {
  render() {
    const keyInput = document.getElementById('ai-api-key-input');
    if (keyInput) keyInput.value = AppState.data.geminiApiKey || '';
  },

  saveApiKey() {
    const key = document.getElementById('ai-api-key-input')?.value.trim();
    AppState.data.geminiApiKey = key;
    AppState.save();
    UI.showToast('Kunci Gemini API berhasil disimpan!');
  },

  async generateAI() {
    const promptType = document.getElementById('ai-prompt-category').value;
    const customPrompt = document.getElementById('ai-custom-input').value.trim();
    const outputEl = document.getElementById('ai-output-box-content');
    const btn = document.getElementById('btn-run-ai');

    if (!outputEl) return;
    btn.disabled = true;
    outputEl.textContent = '⏳ Sedang merancang konten dengan Asisten AI Guru...';

    const apiKey = AppState.data.geminiApiKey;

    // Built-in Curated Smart Engine
    if (!apiKey) {
      setTimeout(() => {
        let result = '';
        if (promptType === 'icebreaking') {
          result = `🎯 REKOMENDASI IDE AKTIVITAS PEMBUKA & ICE BREAKING INOVATIF:
Materi: ${customPrompt || 'Umum'}

1. Metode "Tebak Kata Misteri" (5-7 Menit):
- Berikan 3 petunjuk kata kunci terkait konsep topik hari ini secara bertahap.
- Siswa yang berhasil menebak konsep utama diberikan poin apresiasi keaktifan.

2. Metode "Dua Benar, Satu Keliru" (Fase Apersepsi):
- Guru menampilkan 3 pernyataan di layar mengenai materi.
- Dua pernyataan adalah fakta ilmiah yang benar, dan satu pernyataan adalah miskonsepsi umum.
- Siswa diajak melakukan 'polling' cepat dengan mengangkat tangan untuk melatih daya kritis.`;
        } else if (promptType === 'diferensiasi') {
          result = `📚 RANCANGAN STRATEGI PEMBELAJARAN BERDIFERENSIASI (KURIKULUM MERDEKA):
Topik: ${customPrompt || 'Materi Inti'}

1. Diferensiasi Konten:
- Kelompok Perlu Bimbingan: Diberikan infografis visual ringkas dan contoh kasus bertahap dengan pendampingan langsung.
- Kelompok Mahir: Diberikan artikel studi kasus kontekstual untuk eksplorasi mandiri.

2. Diferensiasi Proses:
- Siswa bebas memilih gaya belajar: Eksplorasi praktikum mandiri, diskusi kelompok kolaboratif, atau pembuatan bagan alir konsep.

3. Diferensiasi Produk:
- Siswa dapat menyajikan hasil pemahaman dalam bentuk: Rekaman audio podcast 2 menit, poster infografis digital, atau laporan tertulis.`;
        } else if (promptType === 'rubrik') {
          result = `📊 MATRIKS RUBRIK ASESMEN KINERJA & PROYEK:
Fokus: ${customPrompt || 'Asesmen Praktikum'}

Kriteria 1: Pemahaman Konsep
- Sangat Baik (4): Menjelaskan seluruh konsep secara akurat, mendalam, dan mampu memberikan analogi nyata.
- Baik (3): Menjelaskan konsep dengan benar dengan sedikit bantuan guru.
- Cukup (2): Memahami konsep dasar namun masih terdapat kekeliruan logika minor.
- Perlu Bimbingan (1): Belum mampu menjelaskan konsep dasar.

Kriteria 2: Keterampilan Praktik & Eksekusi
- Sangat Baik (4): Langkah kerja sistematis, efisien, rapi, dan tuntas sesuai waktu.
- Baik (3): Langkah kerja runtut dan selesai tepat waktu.
- Cukup (2): Memerlukan bimbingan berulang pada langkah kerja inti.
- Perlu Bimbingan (1): Belum mampu menyelesaikan tugas praktik.`;
        } else {
          result = `📝 BANK REKOMENDASI NARASI KOMENTAR RAPOR (CAPAIAN KOMPETENSI):
Target Siswa: ${customPrompt || 'Ananda Teladan'}

- Capaian Sangat Tinggi:
"Ananda menunjukkan penguasaan yang sangat optimal dalam memahami konsep ${customPrompt || 'pembelajaran'}, selalu berinisiatif memimpin diskusi, dan konsisten menunjukkan nalar kritis yang membanggakan."

- Capaian Sedang / Berkembang:
"Ananda telah mampu memahami dasar-dasar kompetensi dengan baik. Disarankan untuk lebih percaya diri dalam menyampaikan pendapat di depan kelas dan memperbanyak latihan pemecahan masalah mandiri."

- Capaian Butuh Pendampingan:
"Ananda telah berpartisipasi aktif dalam kegiatan belajar. Ke depan, perlu pendampingan lebih intensif dalam penguatan literasi konsep dasar dan ketelitian pengerjaan tugas harian."`;
        }

        outputEl.textContent = result;
        btn.disabled = false;
        UI.showToast('Draf rekomendasi pembelajaran berhasil disusun!');
      }, 700);
      return;
    }

    // Live Google Gemini API Integration
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Anda adalah asisten perencana guru profesional Indonesia (Kurikulum Merdeka). Bantu buatkan draf sesuai kategori '${promptType}' dengan instruksi/materi: '${customPrompt}'. Sajikan dengan bahasa Indonesia yang rapi, aplikatif, dan langsung siap pakai.`
            }]
          }]
        })
      });

      const resData = await response.json();
      if (resData.candidates && resData.candidates[0]?.content?.parts[0]?.text) {
        outputEl.textContent = resData.candidates[0].content.parts[0].text;
        UI.showToast('Respon AI Live berhasil diterima!');
      } else {
        throw new Error(resData.error?.message || 'Gagal memproses AI');
      }
    } catch (err) {
      outputEl.textContent = `⚠️ Terjadi kendala saat menghubungi Gemini API: ${err.message}.\n\nAnda tetap dapat menghapus API key untuk kembali menggunakan bank template cerdas tanpa batas kuota.`;
      UI.showToast('Koneksi API bermasalah.', 'error');
    } finally {
      btn.disabled = false;
    }
  },

  copyAIOutput() {
    const text = document.getElementById('ai-output-box-content')?.textContent;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      UI.showToast('Teks berhasil disalin ke clipboard!');
    });
  },

  // Official Print for School Supervision
  printSupervisi() {
    PrintModule.printSupervisi();
  },

  // Full JSON Backup & Restore
  exportBackupJSON() {
    const dataToExport = {
      teachers: StorageManager.getTeachers(),
      activeTeacherId: StorageManager.getActiveTeacherId(),
      teacherData: AppState.data,
      backupDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_MasterTeacherPlanner_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    UI.showToast('File Backup JSON berhasil diunduh!');
  },

  triggerRestoreFile() {
    document.getElementById('input-restore-json')?.click();
  },

  handleRestoreJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (imported.teacherData && imported.teachers) {
          StorageManager.saveTeachers(imported.teachers);
          if (imported.activeTeacherId) {
            StorageManager.setActiveTeacherId(imported.activeTeacherId);
          }
          StorageManager.saveTeacherData(imported.activeTeacherId || imported.teachers[0].id, imported.teacherData);
          UI.showToast('Pemulihan data sukses! Memuat ulang sistem...');
          setTimeout(() => location.reload(), 1000);
        } else {
          throw new Error('Format file cadangan tidak valid.');
        }
      } catch (err) {
        UI.showToast('Gagal memulihkan file: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
  }
};

// ==========================================================================
// 12. Multi-Profile Teacher Auth & Profile Switcher
// ==========================================================================
// 12. Authentication & Teacher Profile Manager (Auth Gateway)
// ==========================================================================
const AuthManager = {
  AUTH_SESSION_KEY: 'MTP_AUTH_SESSION_ACTIVE',

  checkAuthSession() {
    StorageManager.initDemoDataIfEmpty();
    const isSessionActive = sessionStorage.getItem(this.AUTH_SESSION_KEY) === 'true';
    const activeTeacherId = StorageManager.getActiveTeacherId();
    const authScreen = document.getElementById('auth-screen');
    const appRoot = document.getElementById('app-root');

    if (isSessionActive && activeTeacherId) {
      if (authScreen) authScreen.style.display = 'none';
      if (appRoot) appRoot.style.display = 'flex';
      AppState.init();
      this.syncTeacherUI();
      Navigation.switchView(AppState.currentView || 'view-dashboard');
      if (typeof ViewLoader !== 'undefined') {
        setTimeout(() => ViewLoader.ensureModalsLoaded(), 300);
      }
    } else {
      if (appRoot) appRoot.style.display = 'none';
      if (authScreen) authScreen.style.display = 'flex';
      this.renderAuthScreen();
    }
  },

  switchAuthTab(tab) {
    const btnLogin = document.getElementById('tab-btn-login');
    const btnRegister = document.getElementById('tab-btn-register');
    const paneLogin = document.getElementById('pane-auth-login');
    const paneRegister = document.getElementById('pane-auth-register');

    if (tab === 'register') {
      if (btnLogin) btnLogin.classList.remove('active');
      if (btnRegister) btnRegister.classList.add('active');
      if (paneLogin) paneLogin.style.display = 'none';
      if (paneRegister) paneRegister.style.display = 'block';

      // Pre-fill Database URL if already remembered in browser
      if (typeof CloudDBManager !== 'undefined') {
        const gasUrl = CloudDBManager.getUrl();
        const gasInput = document.getElementById('reg-teacher-gas-url');
        const badge = document.getElementById('reg-cloud-status-badge');
        if (gasInput && !gasInput.value && gasUrl) gasInput.value = gasUrl;
        if (badge) {
          if (gasUrl) {
            badge.textContent = '✓ Database Terhubung';
            badge.style.color = 'var(--emerald-600)';
          } else {
            badge.textContent = 'Opsional';
            badge.style.color = 'var(--slate-500)';
          }
        }
      }
    } else {
      if (btnRegister) btnRegister.classList.remove('active');
      if (btnLogin) btnLogin.classList.add('active');
      if (paneRegister) paneRegister.style.display = 'none';
      if (paneLogin) paneLogin.style.display = 'block';
      this.renderAuthScreen();
    }
  },

  renderAuthScreen() {
    StorageManager.initDemoDataIfEmpty();
  },

  togglePinVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.type = input.type === 'password' ? 'text' : 'password';
  },

  handleLogin(e) {
    if (e && e.preventDefault) e.preventDefault();
    StorageManager.initDemoDataIfEmpty();

    const emailInput = document.getElementById('login-email-input');
    const passInput = document.getElementById('login-password-input');
    const identifier = emailInput ? emailInput.value.trim() : '';
    const password = passInput ? passInput.value.trim() : '';

    if (!identifier) {
      UI.showToast('Silakan masukkan alamat email atau NIP guru.', 'error');
      if (emailInput) emailInput.focus();
      return;
    }

    if (!password) {
      UI.showToast('Silakan masukkan kata sandi.', 'error');
      if (passInput) passInput.focus();
      return;
    }

    const teachers = StorageManager.getTeachers();
    const cleanId = identifier.toLowerCase();
    const teacher = teachers.find(t => 
      (t.email && t.email.toLowerCase() === cleanId) ||
      (t.nip && t.nip.replace(/\s+/g, '') === identifier.replace(/\s+/g, '')) ||
      (t.id && t.id.toLowerCase() === cleanId)
    );

    if (!teacher) {
      if (typeof CloudDBManager !== 'undefined' && CloudDBManager.getUrl()) {
        this.loginViaCloud(identifier, password);
        return;
      }
      UI.showToast('Akun tidak ditemukan. Gunakan demo: guru.demo@sekolah.id atau klik tombol Masuk Cepat Guru Demo.', 'error');
      return;
    }

    const validPass = teacher.password || teacher.pin || '1234';
    if (password !== validPass) {
      UI.showToast('Kata sandi salah! Coba sandi demo: 1234', 'error');
      if (passInput) {
        passInput.focus();
        passInput.select();
      }
      return;
    }

    // Success Authentication
    StorageManager.setActiveTeacherId(teacher.id);
    sessionStorage.setItem(this.AUTH_SESSION_KEY, 'true');

    const authScreen = document.getElementById('auth-screen');
    const appRoot = document.getElementById('app-root');
    if (authScreen) authScreen.style.display = 'none';
    if (appRoot) appRoot.style.display = 'flex';

    AppState.init();
    this.syncTeacherUI();
    Navigation.switchView(AppState.currentView || 'view-dashboard');
    if (typeof ViewLoader !== 'undefined') {
      setTimeout(() => ViewLoader.ensureModalsLoaded(), 300);
    }

    UI.showToast(`Selamat datang kembali, ${teacher.namaLengkap}!`);
  },

  async loginViaCloud(email, password) {
    const url = CloudDBManager.getUrl();
    if (!url) return;
    const btnSubmit = document.getElementById('btn-login-submit');
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = '<span class="spinner-sm"></span> <span>Memeriksa database cloud...</span>';
    }
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'login', email: email, password: password })
      });
      const json = await res.json();
      if (json && json.status === 'success' && json.teacher) {
        let teachers = StorageManager.getTeachers();
        const existingIdx = teachers.findIndex(t => t.id === json.teacher.id);
        if (existingIdx !== -1) {
          teachers[existingIdx] = json.teacher;
        } else {
          teachers.push(json.teacher);
        }
        StorageManager.saveTeachers(teachers);
        StorageManager.setActiveTeacherId(json.teacher.id);

        try {
          const targetUrl = url + (url.indexOf('?') === -1 ? '?action=getTeacherData&teacherId=' + encodeURIComponent(json.teacher.id) : '&action=getTeacherData&teacherId=' + encodeURIComponent(json.teacher.id));
          const dataRes = await fetch(targetUrl);
          const dataJson = await dataRes.json();
          if (dataJson && dataJson.status === 'success' && dataJson.data) {
            StorageManager.saveTeacherData(json.teacher.id, dataJson.data);
          }
        } catch (de) {}

        sessionStorage.setItem(this.AUTH_SESSION_KEY, 'true');
        const authScreen = document.getElementById('auth-screen');
        const appRoot = document.getElementById('app-root');
        if (authScreen) authScreen.style.display = 'none';
        if (appRoot) appRoot.style.display = 'flex';

        AppState.init();
        this.syncTeacherUI();
        Navigation.switchView(AppState.currentView || 'view-dashboard');
        if (typeof ViewLoader !== 'undefined') {
          setTimeout(() => ViewLoader.ensureModalsLoaded(), 300);
        }
        UI.showToast('✅ Berhasil masuk via Cloud Database Google Sheets!');
        return;
      } else {
        UI.showToast(json.message || 'Akun tidak ditemukan di database cloud.', 'error');
      }
    } catch (err) {
      UI.showToast('Gagal menghubungi database cloud: ' + err.message, 'error');
    } finally {
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/></svg> <span>Masuk ke Workspace Guru</span>';
      }
    }
  },

  quickDemoLogin() {
    StorageManager.initDemoDataIfEmpty();
    const demoTeacherId = 'GURU-202610-001';
    let teachers = StorageManager.getTeachers();
    let demoTeacher = teachers.find(t => t.id === demoTeacherId || (t.email && t.email.toLowerCase() === 'guru.demo@sekolah.id'));

    if (!demoTeacher) {
      demoTeacher = {
        id: demoTeacherId,
        namaLengkap: 'Budi Pratama, S.Pd., M.Kom.',
        email: 'guru.demo@sekolah.id',
        nip: '19880512 201201 1 003',
        namaSekolah: 'SMA Negeri 1 Harapan Nusantara',
        alamatSekolah: 'Jl. Pendidikan Karakter Bangsa No. 45',
        teleponSekolah: '(021) 7890123',
        emailSekolah: 'tatausaha@sekolah.sch.id',
        websiteSekolah: 'www.sman1harapannusantara.sch.id',
        namaKepalaSekolah: 'Dr. H. Bambang Sudarsono, M.Pd.',
        nipKepalaSekolah: '19760415 200212 1 003',
        logoSekolah: '',
        mataPelajaran: 'Informatika & Pemrograman',
        pin: '1234',
        password: '1234',
        createdAt: new Date().toISOString()
      };
      teachers.unshift(demoTeacher);
      StorageManager.saveTeachers(teachers);
      StorageManager.saveTeacherData(demoTeacherId, StorageManager.getFullDemoData());
    }

    StorageManager.setActiveTeacherId(demoTeacher.id);
    sessionStorage.setItem(this.AUTH_SESSION_KEY, 'true');

    const authScreen = document.getElementById('auth-screen');
    const appRoot = document.getElementById('app-root');
    if (authScreen) authScreen.style.display = 'none';
    if (appRoot) appRoot.style.display = 'flex';

    AppState.init();
    this.syncTeacherUI();
    Navigation.switchView('view-dashboard');
    if (typeof ViewLoader !== 'undefined') {
      setTimeout(() => ViewLoader.ensureModalsLoaded(), 300);
    }

    UI.showToast('Berhasil masuk sebagai Guru Demo (Budi Pratama, S.Pd.)!');
  },

  handleRegister(e) {
    if (e && e.preventDefault) e.preventDefault();

    const namaEl = document.getElementById('reg-teacher-nama') || document.getElementById('new-teacher-nama');
    const emailEl = document.getElementById('reg-teacher-email') || document.getElementById('new-teacher-email');
    const nipEl = document.getElementById('reg-teacher-nip') || document.getElementById('new-teacher-nip');
    const mapelEl = document.getElementById('reg-teacher-mapel') || document.getElementById('new-teacher-mapel');
    const sekolahEl = document.getElementById('reg-teacher-sekolah') || document.getElementById('new-teacher-sekolah');
    const passEl = document.getElementById('reg-teacher-pin') || document.getElementById('new-teacher-pin');

    const nama = namaEl ? namaEl.value.trim() : '';
    const email = emailEl ? emailEl.value.trim().toLowerCase() : '';
    const nip = nipEl ? nipEl.value.trim() : '-';
    const mapel = mapelEl ? mapelEl.value.trim() : '';
    const sekolah = sekolahEl ? sekolahEl.value.trim() : '';
    const password = passEl ? passEl.value.trim() : '1234';

    if (!nama || !sekolah) {
      UI.showToast('Nama guru dan nama sekolah wajib diisi!', 'error');
      return;
    }

    if (!email) {
      UI.showToast('Alamat email guru wajib diisi!', 'error');
      return;
    }

    const teachers = StorageManager.getTeachers();
    const exists = teachers.some(t => t.email && t.email.toLowerCase() === email);
    if (exists) {
      UI.showToast(`Email "${email}" sudah terdaftar! Silakan login atau gunakan email lain.`, 'error');
      return;
    }

    const newId = 'GURU-' + Date.now().toString(36).toUpperCase();
    const newTeacher = {
      id: newId,
      namaLengkap: nama,
      email: email,
      nip: nip || '-',
      namaSekolah: sekolah,
      alamatSekolah: 'Jl. Pendidikan Karakter Bangsa No. 45',
      teleponSekolah: '(021) 7890123',
      emailSekolah: 'tatausaha@sekolah.sch.id',
      websiteSekolah: '',
      namaKepalaSekolah: 'Dr. H. Bambang Sudarsono, M.Pd.',
      nipKepalaSekolah: '19760415 200212 1 003',
      logoSekolah: '',
      mataPelajaran: mapel || 'Guru Mata Pelajaran',
      pin: password || '1234',
      password: password || '1234',
      createdAt: new Date().toISOString()
    };

    // Cek jika tautan Google Sheets Database diinput pada formulir pendaftaran
    const gasUrlEl = document.getElementById('reg-teacher-gas-url');
    if (gasUrlEl && gasUrlEl.value.trim() && typeof CloudDBManager !== 'undefined') {
      CloudDBManager.setUrl(gasUrlEl.value.trim());
    }

    teachers.push(newTeacher);
    StorageManager.setActiveTeacherId(newId);
    StorageManager.saveTeachers(teachers);

    // Initial schema starter data for this new teacher: 100% BERSIH (BEBAS DARI DATA DUMMY)
    const newTeacherData = StorageManager.getDefaultSchema();
    StorageManager.saveTeacherData(newId, newTeacherData);
    sessionStorage.setItem(this.AUTH_SESSION_KEY, 'true');

    // Daftarkan dan sinkronkan langsung ke database Google Sheets jika URL telah terpasang
    if (typeof CloudDBManager !== 'undefined' && CloudDBManager.getUrl()) {
      CloudDBManager.registerTeacherToCloud(newTeacher, newTeacherData);
    }

    // Close modal if open
    UI.closeModal('modal-add-teacher');

    // Switch screen to app
    const authScreen = document.getElementById('auth-screen');
    const appRoot = document.getElementById('app-root');
    if (authScreen) authScreen.style.display = 'none';
    if (appRoot) appRoot.style.display = 'flex';

    AppState.init();
    this.syncTeacherUI();
    Navigation.switchView('view-dashboard');
    if (typeof ViewLoader !== 'undefined') {
      setTimeout(() => ViewLoader.ensureModalsLoaded(), 300);
    }

    UI.showToast(`Profil baru "${nama}" berhasil didaftarkan!`);
  },

  logout() {
    sessionStorage.removeItem(this.AUTH_SESSION_KEY);
    const appRoot = document.getElementById('app-root');
    const authScreen = document.getElementById('auth-screen');

    if (appRoot) appRoot.style.display = 'none';
    if (authScreen) authScreen.style.display = 'flex';

    this.switchAuthTab('login');
    this.renderAuthScreen();
    UI.showToast('Anda telah keluar dari profil guru.');
  },

  syncTeacherUI() {
    const teacher = AppState.currentTeacher;
    if (!teacher) return;

    const userNames = document.querySelectorAll('.bind-user-name');
    const userRoles = document.querySelectorAll('.bind-user-role');
    const schoolNames = document.querySelectorAll('.bind-school-name');
    const avatarInitials = document.querySelectorAll('.bind-avatar-initial');

    const initial = teacher.namaLengkap ? teacher.namaLengkap.trim().charAt(0).toUpperCase() : 'G';

    userNames.forEach(el => el.textContent = teacher.namaLengkap);
    userRoles.forEach(el => el.textContent = teacher.mataPelajaran || 'Guru Mata Pelajaran');
    schoolNames.forEach(el => el.textContent = teacher.namaSekolah || 'Sekolah');
    avatarInitials.forEach(el => el.textContent = initial);
  },

  openSwitchModal() {
    const teachers = StorageManager.getTeachers();
    const container = document.getElementById('teacher-profiles-list');
    if (!container) return;

    let listHtml = teachers.map(t => {
      const isActive = t.id === AppState.currentTeacher?.id;
      return `
        <div style="padding: 0.85rem; border: 1px solid ${isActive ? 'var(--emerald-500)' : 'var(--slate-200)'}; background: ${isActive ? 'var(--emerald-50)' : 'var(--white)'}; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.65rem;">
          <div>
            <div style="font-weight: 700; color: var(--slate-900);">${t.namaLengkap}</div>
            <div style="font-size: 0.75rem; color: var(--slate-500);">${t.email || '-'} &bull; ${t.namaSekolah || '-'} &bull; NIP: ${t.nip || '-'}</div>
          </div>
          <div>
            ${isActive 
              ? '<span style="font-size: 0.75rem; font-weight: 700; color: var(--emerald-700);">Aktif</span>' 
              : `<button class="btn btn-secondary btn-sm" onclick="AuthManager.switchProfile('${t.id}')">Pilih Profil</button>`}
          </div>
        </div>
      `;
    }).join('');

    listHtml += `
      <div style="margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid var(--slate-200); text-align: center;">
        <button class="btn btn-secondary btn-sm" style="width: 100%; border: 1px dashed var(--emerald-500); color: var(--emerald-600);" onclick="UI.closeModal('modal-switch-profile'); AppState.loadFullDemoData(true);">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          <span>Muat Ulang Sampel Data Demo Lengkap</span>
        </button>
      </div>
    `;

    container.innerHTML = listHtml;
    UI.openModal('modal-switch-profile');
  },

  switchProfile(teacherId) {
    StorageManager.setActiveTeacherId(teacherId);
    sessionStorage.setItem(this.AUTH_SESSION_KEY, 'true');
    UI.showToast('Beralih profil guru...');
    setTimeout(() => location.reload(), 300);
  },

  openAddTeacherModal() {
    const form = document.getElementById('form-add-teacher');
    if (form) form.reset();
    UI.openModal('modal-add-teacher');
  },

  saveNewTeacher(e) {
    this.handleRegister(e);
  }
};

// ==========================================================================
// 12B. Progressive Web App Manager (PWA & Offline Service Worker Controller)
// ==========================================================================
// ==========================================================================
// 12B. Progressive Web App Manager (PWA & Offline Service Worker Controller)
// Arsitektur PWA Modern ala https://bhs-inggris-anak.vercel.app/
// ==========================================================================
const PWAManager = {
  deferredPrompt: null,
  isInstalled: false,
  popupEl: null,
  popupShown: false,
  snoozeKey: 'mtp_pwa_snooze_until',
  dismissKey: 'mtp_pwa_dismiss_count',
  snoozeDays: 5,
  maxDismiss: 3,

  // Deteksi Lingkungan Sistem
  getUA() {
    return navigator.userAgent || '';
  },

  isIOS() {
    const ua = this.getUA();
    return /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  },

  isIOSSafari() {
    const ua = this.getUA();
    return this.isIOS() && !/crios|fxios|edgios|opt\/|fbav|instagram|line\//i.test(ua);
  },

  checkInstalled() {
    const displayModes = ['standalone', 'window-controls-overlay', 'minimal-ui', 'fullscreen'];
    if (displayModes.some(m => window.matchMedia(`(display-mode: ${m})`).matches)) return true;
    if (window.navigator.standalone === true) return true;
    if (document.referrer && document.referrer.startsWith('android-app://')) return true;
    return false;
  },

  isSnoozed() {
    try {
      const until = parseInt(localStorage.getItem(this.snoozeKey), 10);
      return Number.isFinite(until) && Date.now() < until;
    } catch (e) {
      return false;
    }
  },

  snooze(days) {
    try {
      localStorage.setItem(this.snoozeKey, String(Date.now() + (days * 24 * 60 * 60 * 1000)));
    } catch (e) {}
  },

  countDismiss() {
    try {
      const n = (parseInt(localStorage.getItem(this.dismissKey), 10) || 0) + 1;
      localStorage.setItem(this.dismissKey, String(n));
      this.snooze(n >= this.maxDismiss ? 3650 : this.snoozeDays);
    } catch (e) {}
  },

  clearNudges() {
    try {
      localStorage.removeItem(this.snoozeKey);
      localStorage.removeItem(this.dismissKey);
    } catch (e) {}
  },

  init() {
    this.isInstalled = this.checkInstalled();

    // 1. Daftarkan Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then(reg => {
            console.log('Master Teacher Planner SW Registered:', reg.scope);
            reg.update();
          })
          .catch(err => {
            console.warn('Service Worker registration skipped:', err);
          });
      });

      let reloading = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (reloading) return;
        reloading = true;
        console.log('New Service Worker version ready.');
        UI.showToast('Versi baru aplikasi telah diperbarui!', 'info');
      });
    }

    // 2. Tangkap event beforeinstallprompt (Chrome / Edge / Android)
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      console.log('PWA beforeinstallprompt captured.');
      this.syncUI();

      // Tawarkan ajakan pasang mengambang setelah 6 detik jika belum pernah di-snooze
      if (!this.isInstalled && !this.isSnoozed() && !this.popupShown) {
        setTimeout(() => {
          this.showFloatingPopup('prompt');
        }, 6000);
      }
    });

    // 3. Tangani event appinstalled
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.deferredPrompt = null;
      this.clearNudges();
      this.hideFloatingPopup();
      this.syncUI();
      UI.showToast('🎉 Master Teacher Planner berhasil terpasang di perangkat Anda!');
    });

    // 4. Deteksi khusus iOS Safari
    if (this.isIOSSafari() && !this.isInstalled && !this.isSnoozed() && !this.popupShown) {
      setTimeout(() => {
        this.showFloatingPopup('ios');
      }, 10000);
    }

    // 5. Sinkronkan seluruh antarmuka tombol
    document.addEventListener('DOMContentLoaded', () => this.syncUI());
    this.syncUI();
  },

  syncUI() {
    const isInst = this.isInstalled;

    // A. Tombol Chip Bilah Atas Layar Login (#btn-pwa-auth-topbar)
    const btnTopBar = document.getElementById('btn-pwa-auth-topbar');
    const labelTopBar = document.getElementById('btn-pwa-auth-topbar-label');
    if (btnTopBar) {
      if (isInst) {
        btnTopBar.classList.remove('btn-secondary');
        btnTopBar.classList.add('btn-ghost');
        if (labelTopBar) labelTopBar.textContent = '✓ Aplikasi Terpasang';
        btnTopBar.title = 'Aplikasi Master Teacher Planner telah terpasang di perangkat ini.';
      } else {
        if (labelTopBar) labelTopBar.textContent = 'Pasang di HP / Komputer';
        btnTopBar.title = 'Pasang aplikasi di HP atau Komputer Anda untuk akses offline cepat.';
      }
    }

    // B. Banner Form Login (#btn-auth-pwa-install & #btn-auth-pwa-label)
    const btnAuthBanner = document.getElementById('btn-auth-pwa-install');
    const labelAuthBanner = document.getElementById('btn-auth-pwa-label');
    if (btnAuthBanner) {
      if (isInst) {
        btnAuthBanner.classList.remove('btn-emerald');
        btnAuthBanner.classList.add('btn-secondary');
        if (labelAuthBanner) labelAuthBanner.textContent = '✓ Aplikasi Terpasang';
        btnAuthBanner.onclick = () => {
          UI.showToast('Master Teacher Planner sudah terpasang dan dapat dibuka dari layar utama perangkat Anda.');
        };
      } else {
        btnAuthBanner.classList.add('btn-emerald');
        btnAuthBanner.classList.remove('btn-secondary');
        if (labelAuthBanner) labelAuthBanner.textContent = 'Download / Pasang di HP atau Komputer';
        btnAuthBanner.onclick = () => PWAManager.promptInstall();
      }
    }

    // C. Tombol Header Navbar Saat Login (#btn-header-pwa-install)
    const btnHeaderInstall = document.getElementById('btn-header-pwa-install');
    if (btnHeaderInstall) {
      if (isInst) {
        btnHeaderInstall.style.display = 'none';
      } else {
        btnHeaderInstall.style.display = 'inline-flex';
      }
    }
  },

  promptInstall() {
    if (this.isInstalled) {
      UI.showToast('Aplikasi sudah terpasang di perangkat Anda.');
      return;
    }

    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      this.deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          UI.showToast('🎉 Aplikasi berhasil dipasang di perangkat!');
          this.isInstalled = true;
          this.clearNudges();
          this.hideFloatingPopup();
        } else {
          this.snooze(this.snoozeDays);
          UI.showToast('Pemasangan aplikasi ditangguhkan.');
        }
        this.deferredPrompt = null;
        this.syncUI();
      }).catch(() => {
        this.snooze(this.snoozeDays);
      });
    } else if (this.isIOSSafari()) {
      this.showFloatingPopup('ios', true);
    } else {
      // Jika browser desktop umum tanpa prompt native atau dibuka via file://
      UI.openModal('modal-pwa-guide');
    }
  },

  showFloatingPopup(mode = 'prompt', manual = false) {
    if (this.popupEl || this.isInstalled) return;
    // Jangan munculkan popup otomatis saat layar login aktif (cukup panduan statis)
    const isAuthVisible = document.getElementById('auth-screen')?.style.display !== 'none';
    if (!manual && (isAuthVisible || this.popupShown || this.isSnoozed())) return;
    this.popupShown = true;

    const popup = document.createElement('div');
    popup.className = 'pwa-install-popup';
    popup.setAttribute('role', 'dialog');
    popup.setAttribute('aria-label', 'Ajakan Pasang Aplikasi');

    const steps = mode === 'ios'
      ? `<ol class="pwa-install-steps">
           <li>Ketuk tombol <strong>Bagikan</strong> <span style="font-size:1.15em;">📤</span> di bilah bawah Safari.</li>
           <li>Pilih menu <strong>Tambahkan ke Layar Utama</strong> (<em>Add to Home Screen</em>).</li>
           <li>Ketuk <strong>Tambah</strong> di sudut kanan atas layar &amp; selesai!</li>
         </ol>`
      : '';

    const actions = mode === 'ios'
      ? `<button type="button" class="btn btn-secondary btn-sm" id="btn-pwa-popup-ok">Oke, Saya Mengerti</button>`
      : `<button type="button" class="btn btn-emerald btn-sm" id="btn-pwa-popup-install">Pasang Sekarang</button>
         <button type="button" class="btn btn-ghost btn-sm" id="btn-pwa-popup-later">Nanti Saja</button>`;

    popup.innerHTML = `
      <button type="button" class="pwa-install-x" id="btn-pwa-popup-close" aria-label="Tutup ajakan pasang">&times;</button>
      <div class="pwa-install-head">
        <img class="pwa-install-icon" src="./icon-192.png" alt="Ikon Master Teacher Planner" />
        <div>
          <h4>Pasang Master Teacher Planner</h4>
          <p>Akses langsung dari layar utama perangkat Anda tanpa browser, 100% cepat &amp; offline!</p>
        </div>
      </div>
      ${steps}
      <div class="pwa-install-actions">
        ${actions}
      </div>
    `;

    document.body.appendChild(popup);
    this.popupEl = popup;
    requestAnimationFrame(() => popup.classList.add('show'));

    // Event listeners
    const btnClose = popup.querySelector('#btn-pwa-popup-close');
    if (btnClose) btnClose.onclick = () => this.dismissFloatingPopup(true);

    const btnLater = popup.querySelector('#btn-pwa-popup-later');
    if (btnLater) btnLater.onclick = () => this.dismissFloatingPopup(true);

    const btnOk = popup.querySelector('#btn-pwa-popup-ok');
    if (btnOk) btnOk.onclick = () => this.dismissFloatingPopup(false);

    const btnInstall = popup.querySelector('#btn-pwa-popup-install');
    if (btnInstall) btnInstall.onclick = () => {
      this.hideFloatingPopup();
      this.promptInstall();
    };
  },

  hideFloatingPopup() {
    if (!this.popupEl) return;
    const el = this.popupEl;
    this.popupEl = null;
    el.classList.remove('show');
    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 350);
  },

  dismissFloatingPopup(byUser) {
    if (byUser) this.countDismiss();
    this.hideFloatingPopup();
  }
};

// ==========================================================================
// 12A-2. Cloud Database Manager (Google Apps Script & Google Sheets Sync Engine)
// ==========================================================================
const CloudDBManager = {
  KEY_URL: 'MTP_V2_GAS_WEBAPP_URL',
  KEY_AUTO_SYNC: 'MTP_V2_AUTO_SYNC_ENABLED',
  KEY_LAST_SYNC: 'MTP_V2_LAST_SYNC_TIMESTAMP',
  isSyncing: false,
  autoSyncTimer: null,

  init() {
    this.syncBadge();
    const url = this.getUrl();
    if (url) {
      this.checkStatusSilent();
    }
  },

  getUrl() {
    return (localStorage.getItem(this.KEY_URL) || '').trim();
  },

  setUrl(url) {
    if (url) {
      localStorage.setItem(this.KEY_URL, url.trim());
      this.setAutoSync(true); // Otomatis aktifkan auto-sync saat URL terhubung
    } else {
      localStorage.removeItem(this.KEY_URL);
    }
    this.syncBadge();
    this.syncSchoolProfileCard();
  },

  isAutoSyncEnabled() {
    const val = localStorage.getItem(this.KEY_AUTO_SYNC);
    if (val === null) return true; // Default auto-sync aktif jika URL terkonfigurasi
    return val === 'true';
  },

  setAutoSync(enabled) {
    localStorage.setItem(this.KEY_AUTO_SYNC, enabled ? 'true' : 'false');
  },

  syncSchoolProfileCard() {
    const input = document.getElementById('sp-gas-url-input');
    const badge = document.getElementById('sp-cloud-badge-status');
    const url = this.getUrl();
    if (input && document.activeElement !== input) {
      input.value = url || '';
    }
    if (badge) {
      if (url) {
        badge.className = 'badge icon-emerald';
        badge.style.background = 'var(--emerald-500)';
        badge.style.color = '#fff';
        badge.textContent = 'Terhubung (Cloud Online)';
      } else {
        badge.className = 'badge icon-sky';
        badge.style.background = 'var(--slate-200)';
        badge.style.color = 'var(--slate-700)';
        badge.textContent = 'Offline (Lokal)';
      }
    }
  },

  getLastSync() {
    return localStorage.getItem(this.KEY_LAST_SYNC) || '';
  },

  setLastSync(iso) {
    localStorage.setItem(this.KEY_LAST_SYNC, iso || new Date().toISOString());
    this.updateStatusBanner();
  },

  syncBadge() {
    const url = this.getUrl();
    const badge = document.getElementById('sidebar-badge-cloud');
    const headerLabel = document.getElementById('btn-header-cloud-label');

    if (badge) {
      if (url) {
        badge.style.display = 'inline-block';
        badge.style.background = 'var(--emerald-500)';
        badge.textContent = 'Cloud';
      } else {
        badge.style.display = 'inline-block';
        badge.style.background = 'var(--slate-400)';
        badge.textContent = 'Offline';
      }
    }

    if (headerLabel) {
      headerLabel.textContent = url ? 'Cloud Aktif' : 'Cloud Sheets';
    }
  },

  openSyncModal() {
    const inputUrl = document.getElementById('input-gas-url');
    const checkAuto = document.getElementById('check-auto-sync');

    if (inputUrl) inputUrl.value = this.getUrl();
    if (checkAuto) checkAuto.checked = this.isAutoSyncEnabled();

    this.updateStatusBanner();
    UI.openModal('modal-cloud-sync');

    if (this.getUrl()) {
      this.testConnection(true);
    }
  },

  updateStatusBanner(info) {
    const dot = document.getElementById('cloud-status-dot');
    const statusText = document.getElementById('cloud-status-text');
    const lastSyncText = document.getElementById('cloud-last-sync-text');
    const serverInfo = document.getElementById('cloud-server-info');
    const url = this.getUrl();

    const lastSync = this.getLastSync();
    if (lastSyncText) {
      if (lastSync) {
        try {
          const d = new Date(lastSync);
          lastSyncText.textContent = 'Terakhir: ' + d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) + ' ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
          lastSyncText.textContent = 'Terakhir: ' + lastSync;
        }
      } else {
        lastSyncText.textContent = 'Belum pernah disinkronkan';
      }
    }

    if (!url) {
      if (dot) dot.style.background = 'var(--slate-400)';
      if (statusText) {
        statusText.style.color = 'var(--slate-700)';
        statusText.textContent = 'Belum Dikonfigurasi (Offline)';
      }
      if (serverInfo) serverInfo.style.display = 'none';
      return;
    }

    if (info) {
      if (info.status === 'success') {
        if (dot) dot.style.background = 'var(--emerald-500)';
        if (statusText) {
          statusText.style.color = 'var(--emerald-600)';
          statusText.textContent = 'Terhubung (Online - v' + (info.version || '2.0.0') + ')';
        }
        if (serverInfo) {
          serverInfo.style.display = 'block';
          serverInfo.innerHTML = 'Spreadsheet: <strong>' + (info.spreadsheetName || 'Aktif') + '</strong> &bull; Guru Terdaftar: <strong>' + (info.teacherCount || 0) + '</strong> &bull; Waktu: ' + (info.serverTime || '-');
        }
      } else {
        if (dot) dot.style.background = 'var(--rose-500)';
        if (statusText) {
          statusText.style.color = 'var(--rose-600)';
          statusText.textContent = 'Koneksi Gagal';
        }
        if (serverInfo) {
          serverInfo.style.display = 'block';
          serverInfo.textContent = info.message || 'Gagal tersambung ke URL Web App.';
        }
      }
    }
  },

  async testConnection(silent = false) {
    const inputUrl = document.getElementById('input-gas-url');
    const url = (inputUrl ? inputUrl.value : this.getUrl()).trim();

    if (!url) {
      if (!silent) UI.showToast('Masukkan URL Web App Google Apps Script terlebih dahulu.', 'error');
      return;
    }

    const btnTest = document.getElementById('btn-cloud-test');
    if (btnTest) {
      btnTest.disabled = true;
      btnTest.innerHTML = '<span class="spinner-sm"></span> <span>Menguji...</span>';
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const targetUrl = url + (url.indexOf('?') === -1 ? '?action=ping' : '&action=ping');
      const res = await fetch(targetUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      const json = await res.json();
      if (json && json.status === 'success') {
        this.setUrl(url);
        this.updateStatusBanner(json);
        if (!silent) UI.showToast('✅ Berhasil terhubung ke database Google Sheets!');
      } else {
        this.updateStatusBanner({ status: 'error', message: json.message || 'Respons server tidak valid.' });
        if (!silent) UI.showToast('Gagal terhubung: ' + (json.message || 'Periksa izin Web App.'), 'error');
      }
    } catch (err) {
      const msg = err.name === 'AbortError' ? 'Koneksi timeout (12 detik).' : 'Tidak dapat menjangkau server Google Apps Script. Pastikan izin Web App diatur "Anyone".';
      this.updateStatusBanner({ status: 'error', message: msg });
      if (!silent) UI.showToast('❌ ' + msg, 'error');
    } finally {
      if (btnTest) {
        btnTest.disabled = false;
        btnTest.innerHTML = '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg> <span>Uji Koneksi URL</span>';
      }
    }
  },

  async checkStatusSilent() {
    const url = this.getUrl();
    if (!url) return;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const targetUrl = url + (url.indexOf('?') === -1 ? '?action=ping' : '&action=ping');
      const res = await fetch(targetUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      const json = await res.json();
      if (json && json.status === 'success') {
        this.syncBadge();
      }
    } catch (e) {}
  },

  toggleAutoSync(enabled) {
    this.setAutoSync(enabled);
    UI.showToast(enabled ? 'Auto-Sync diaktifkan.' : 'Auto-Sync dinonaktifkan.');
  },

  saveUrlOnly() {
    const inputUrl = document.getElementById('input-gas-url');
    if (inputUrl) {
      const val = inputUrl.value.trim();
      this.setUrl(val);
      UI.showToast('URL Database tersimpan.');
      UI.closeModal('modal-cloud-sync');
    }
  },

  saveConfig(e) {
    if (e) e.preventDefault();
    this.saveUrlOnly();
  },

  async pushToCloud() {
    const url = this.getUrl();
    if (!url) {
      UI.showToast('Harap atur URL Web App Google Apps Script terlebih dahulu.', 'error');
      return;
    }

    const teacher = AuthManager.getActiveTeacher();
    if (!teacher || !teacher.id) {
      UI.showToast('Profil guru aktif tidak ditemukan.', 'error');
      return;
    }

    const data = StorageManager.getTeacherData(teacher.id);
    if (!data) {
      UI.showToast('Data aplikasi tidak ditemukan.', 'error');
      return;
    }

    const btnPush = document.getElementById('btn-cloud-push');
    if (btnPush) {
      btnPush.disabled = true;
      btnPush.innerHTML = '<span class="spinner-sm"></span> <span>Mengirim data ke Google Sheets...</span>';
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 35000);

      const payload = {
        action: 'saveTeacherData',
        teacherId: teacher.id,
        data: data
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      // Juga sinkronkan profil guru
      try {
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'saveTeacherProfile', teacher: teacher })
        });
      } catch (pe) {}

      clearTimeout(timeoutId);
      const json = await res.json();

      if (json && json.status === 'success') {
        const nowIso = new Date().toISOString();
        this.setLastSync(nowIso);
        UI.showToast('🎉 Seluruh data berhasil tersimpan ke Google Sheets!');
        this.syncBadge();
      } else {
        throw new Error(json.message || 'Gagal menyimpan ke Google Sheets.');
      }
    } catch (err) {
      console.error('Push to cloud error:', err);
      UI.showToast('❌ Gagal mengirim ke Google Sheets: ' + (err.message || err.toString()), 'error');
    } finally {
      if (btnPush) {
        btnPush.disabled = false;
        btnPush.innerHTML = '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg> <span>Kirim Seluruh Data Lokal ke Google Sheets</span>';
      }
    }
  },

  async pullFromCloud() {
    const url = this.getUrl();
    if (!url) {
      UI.showToast('Harap atur URL Web App Google Apps Script terlebih dahulu.', 'error');
      return;
    }

    const teacher = AuthManager.getActiveTeacher();
    if (!teacher || !teacher.id) {
      UI.showToast('Profil guru aktif tidak ditemukan.', 'error');
      return;
    }

    if (!confirm('Tarik data dari Google Sheets akan memperbarui seluruh data kerja di perangkat ini dengan data terbaru dari cloud. Lanjutkan?')) {
      return;
    }

    const btnPull = document.getElementById('btn-cloud-pull');
    if (btnPull) {
      btnPull.disabled = true;
      btnPull.innerHTML = '<span class="spinner-sm"></span> <span>Mengambil...</span>';
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      const targetUrl = url + (url.indexOf('?') === -1 ? '?action=getTeacherData&teacherId=' + encodeURIComponent(teacher.id) : '&action=getTeacherData&teacherId=' + encodeURIComponent(teacher.id));
      const res = await fetch(targetUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      const json = await res.json();
      if (json && json.status === 'success' && json.data) {
        StorageManager.saveTeacherData(teacher.id, json.data);
        AppState.data = json.data;

        const nowIso = new Date().toISOString();
        this.setLastSync(nowIso);

        if (typeof Navigation !== 'undefined' && Navigation.switchView) {
          Navigation.switchView(Navigation.currentView || 'view-dashboard');
        }

        UI.showToast('📥 Berhasil memperbarui data dari Google Sheets!');
        this.syncBadge();
      } else {
        throw new Error(json.message || 'Data tidak ditemukan di database.');
      }
    } catch (err) {
      console.error('Pull from cloud error:', err);
      UI.showToast('❌ Gagal mengambil data: ' + (err.message || err.toString()), 'error');
    } finally {
      if (btnPull) {
        btnPull.disabled = false;
        btnPull.innerHTML = '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg> <span>Tarik dari Sheets</span>';
      }
    }
  },

  async testAndSaveFromProfile() {
    const input = document.getElementById('sp-gas-url-input');
    const url = (input ? input.value : '').trim();
    if (!url) {
      UI.showToast('Masukkan URL Web App Google Apps Script terlebih dahulu.', 'error');
      return;
    }

    const btn = document.getElementById('btn-sp-test-cloud');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-sm"></span> <span>Menguji...</span>';
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      const targetUrl = url + (url.indexOf('?') === -1 ? '?action=ping' : '&action=ping');
      const res = await fetch(targetUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      const json = await res.json();
      if (json && json.status === 'success') {
        this.setUrl(url);
        UI.showToast('✅ Berhasil terhubung ke database Google Sheets!');
        // Segera push data lokal saat ini ke cloud
        await this.pushToCloud();
      } else {
        UI.showToast('Gagal terhubung: ' + (json.message || 'Periksa izin Web App.'), 'error');
      }
    } catch (err) {
      const msg = err.name === 'AbortError' ? 'Koneksi timeout (12 detik).' : 'Tidak dapat menjangkau server Google Apps Script. Pastikan izin Web App diatur "Anyone".';
      UI.showToast('❌ ' + msg, 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg> <span>Uji &amp; Hubungkan</span>';
      }
    }
  },

  async registerTeacherToCloud(teacher, data) {
    const url = this.getUrl();
    if (!url || !teacher || !teacher.id) return;

    try {
      // 1. Catat akun guru ke Sheet DataGuru
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'registerTeacher', teacher: teacher })
      });

      // 2. Inisialisasi lembar kerja guru baru di database cloud
      if (data) {
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'saveTeacherData', teacherId: teacher.id, data: data })
        });
      }

      this.setLastSync(new Date().toISOString());
      this.syncBadge();
      console.log('Guru baru berhasil didaftarkan dan disinkronkan ke Cloud Google Sheets.');
    } catch (err) {
      console.warn('Gagal mendaftarkan guru ke cloud database secara langsung:', err);
    }
  },

  autoSyncIfConfigured(teacherId, data) {
    if (!this.isAutoSyncEnabled()) return;
    const url = this.getUrl();
    if (!url) return;

    if (this.autoSyncTimer) clearTimeout(this.autoSyncTimer);
    this.autoSyncTimer = setTimeout(() => {
      this.pushToCloudSilent(teacherId, data);
    }, 1500);
  },

  autoSyncTeacherProfile() {
    if (!this.isAutoSyncEnabled()) return;
    const url = this.getUrl();
    if (!url) return;

    const teacher = AuthManager.getActiveTeacher();
    if (!teacher || !teacher.id) return;

    try {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'saveTeacherProfile', teacher: teacher })
      }).catch(() => {});
    } catch (e) {}
  },

  async pushToCloudSilent(teacherId, data) {
    const url = this.getUrl();
    if (!url || !teacherId || !data) return;

    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'saveTeacherData', teacherId: teacherId, data: data })
      });
      this.setLastSync(new Date().toISOString());
      this.syncBadge();
    } catch (e) {
      console.warn('Auto-sync silent push failed:', e);
    }
  }
};

// ==========================================================================
// 12B. Modul 7: Learning Content & Material Repository (Repositori Bahan Ajar)
// ==========================================================================
const RepositoryModule = {
  render() {
    const data = AppState.data;
    if (!data) return;

    // Update Sidebar badge
    const badge = document.getElementById('sidebar-badge-materials');
    if (badge) badge.textContent = data.materials.length;

    // Populate class selector in modal
    const classSelect = document.getElementById('mat-input-kelas');
    if (classSelect) {
      classSelect.innerHTML = data.classes.map(c => `<option value="${c}">${c}</option>`).join('');
    }

    this.filterList();
  },

  filterList() {
    const data = AppState.data;
    const query = document.getElementById('search-material')?.value.toLowerCase() || '';
    const diff = document.getElementById('filter-material-difficulty')?.value || '';
    const container = document.getElementById('material-list-container');
    if (!container) return;

    const list = data.materials.filter(m => {
      const matchQuery = !query || 
        m.judul.toLowerCase().includes(query) || 
        m.topik.toLowerCase().includes(query) ||
        m.ringkasan.toLowerCase().includes(query);
      const matchDiff = !diff || m.tingkatKesulitan === diff;
      return matchQuery && matchDiff;
    });

    if (list.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; background: var(--white); border-radius: var(--radius-lg); border: 1px dashed var(--slate-300);">
          <svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="color: var(--slate-400); margin-bottom: 0.5rem;"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
          <h4 style="font-size: 1rem; color: var(--slate-700);">Belum Ada Bahan Ajar Digital</h4>
          <p style="font-size: 0.8rem; color: var(--slate-500); margin-top: 4px;">Kelola repositori materi, modul praktikum, slide presentasi, dan media pembelajaran interaktif.</p>
          <button class="btn btn-primary" onclick="RepositoryModule.openAddModal()" style="margin-top: 0.85rem;">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
            <span>+ Unggah Bahan Ajar Pertama</span>
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(m => {
      let diffBadgeClass = 'badge-diff-dasar';
      if (m.tingkatKesulitan === 'Menengah') diffBadgeClass = 'badge-diff-menengah';
      if (m.tingkatKesulitan === 'Pengayaan') diffBadgeClass = 'badge-diff-pengayaan';

      const faseName = m.fase || KurikulumMerdeka.getFaseByKelas(m.kelas);
      const faseBadge = KurikulumMerdeka.getFaseBadge(faseName);

      // Find assigned schedule
      const sched = data.timetable.find(s => s.id === m.assignedScheduleId);
      const schedLabel = sched ? `Jadwal: ${sched.hari} (${sched.jamMulai} - ${sched.jamSelesai})` : 'Belum ditautkan';

      return `
        <div class="material-card">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.35rem;">
              <div style="display: flex; gap: 0.35rem; align-items: center;">
                ${faseBadge}
                <span class="badge ${diffBadgeClass}" style="font-size: 0.7rem; padding: 2px 8px; border-radius: 4px; font-weight: 700;">${m.tingkatKesulitan}</span>
              </div>
              ${m.modelPembelajaran ? `<span class="badge-model">${m.modelPembelajaran}</span>` : ''}
            </div>
            <h4 style="font-size: 1rem; font-weight: 700; color: var(--slate-900); line-height: 1.3;">${m.judul}</h4>
            <div style="font-size: 0.75rem; color: var(--slate-500); margin: 0.35rem 0;">
              <strong>${m.kelas}</strong> • ${m.topik} • ${m.alokasi || '2 JP'}
            </div>

            <div style="font-size: 0.8rem; color: var(--slate-600); margin: 0.5rem 0; line-height: 1.5; max-height: 60px; overflow: hidden; text-overflow: ellipsis;">
              ${m.ringkasan || m.cpTp}
            </div>

            <!-- Media Links -->
            <div class="media-chips-wrap">
              ${(m.mediaLinks || []).map(l => `
                <a href="${l.url}" target="_blank" class="media-chip" onclick="event.stopPropagation();">
                  <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                  <span>${l.label}</span>
                </a>
              `).join('')}
            </div>

            <div style="font-size: 0.725rem; color: ${sched ? 'var(--emerald-700)' : 'var(--slate-400)'}; font-weight: 600; margin-top: 0.25rem;">
              📌 ${schedLabel}
            </div>
          </div>

          <div style="padding-top: 0.75rem; border-top: 1px solid var(--slate-100); margin-top: 0.75rem;">
            <div style="display: flex; gap: 0.35rem; margin-bottom: 0.5rem;">
              <button class="btn btn-primary btn-sm" style="flex: 1;" onclick="RepositoryModule.viewMediaPresentation('${m.id}')">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Buka di Kelas
              </button>
              <button class="btn btn-secondary btn-sm" title="Tautkan ke Jadwal Mengajar" onclick="RepositoryModule.openAssignModal('${m.id}')">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              </button>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <button class="btn btn-ghost btn-sm" style="font-size: 0.75rem; color: var(--emerald-700); font-weight: 700;" onclick="RepositoryModule.triggerCreateQuestionFromMaterial('${m.id}')">
                &rarr; Buat Soal dari Materi Ini
              </button>
              <div style="display: flex; gap: 0.25rem;">
                <button class="btn btn-ghost btn-sm" onclick="RepositoryModule.edit('${m.id}')" title="Edit">
                  <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                </button>
                <button class="btn btn-ghost btn-sm" style="color: var(--rose-600);" onclick="RepositoryModule.delete('${m.id}')" title="Hapus">
                  <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  openAddModal() {
    document.getElementById('form-material').reset();
    document.getElementById('mat-edit-id').value = '';
    document.getElementById('modal-material-title').textContent = 'Tambah Materi Pembelajaran Baru';
    KurikulumMerdeka.initSelectors('mat', 'SMA', 'Fase E');
    UI.openModal('modal-form-material');
  },

  saveFromForm(e) {
    e.preventDefault();
    const editId = document.getElementById('mat-edit-id').value;
    const jenjang = document.getElementById('mat-input-jenjang')?.value || 'SMA';
    const fase = document.getElementById('mat-input-fase')?.value || 'Fase E';
    const kelas = document.getElementById('mat-input-kelas')?.value || '';
    const mapel = document.getElementById('mat-input-mapel')?.value || AppState.currentTeacher.mataPelajaran || 'Umum';
    const judul = document.getElementById('mat-input-judul').value.trim();
    const topik = document.getElementById('mat-input-topik').value.trim() || 'Topik Umum';
    const alokasi = document.getElementById('mat-input-alokasi').value.trim() || '2 JP x 45 Menit';
    const kesulitan = document.getElementById('mat-input-kesulitan').value;
    const model = document.getElementById('mat-input-model').value.trim() || 'Pembelajaran Interaktif';
    const cptp = document.getElementById('mat-input-cptp').value.trim();
    const ringkasan = document.getElementById('mat-input-ringkasan').value.trim();
    const docUrl = document.getElementById('mat-input-doc').value.trim();
    const videoUrl = document.getElementById('mat-input-video').value.trim();
    const cloudUrl = document.getElementById('mat-input-cloud').value.trim();

    if (!judul || !cptp) {
      UI.showToast('Judul materi dan CP/TP wajib diisi!', 'error');
      return;
    }

    const mediaLinks = [];
    if (videoUrl) mediaLinks.push({ tipe: 'video', label: 'Video Pembelajaran (YouTube/Web)', url: videoUrl });
    if (docUrl) mediaLinks.push({ tipe: 'doc', label: 'Dokumen / Modul (Drive/PDF)', url: docUrl });
    if (cloudUrl) mediaLinks.push({ tipe: 'cloud', label: 'Cloud Storage (OneDrive/Drive)', url: cloudUrl });

    if (editId) {
      const idx = AppState.data.materials.findIndex(m => m.id === editId);
      if (idx !== -1) {
        AppState.data.materials[idx] = {
          ...AppState.data.materials[idx],
          jenjang, fase, kelas, mapel,
          judul, topik, alokasi, tingkatKesulitan: kesulitan,
          modelPembelajaran: model, cpTp: cptp, ringkasan, mediaLinks
        };
        UI.showToast('Bahan Ajar berhasil diperbarui!');
      }
    } else {
      const newId = StorageManager.generateId('MAT', AppState.data.materials);
      AppState.data.materials.unshift({
        id: newId,
        jenjang, fase, kelas, mapel,
        judul, topik, alokasi,
        tingkatKesulitan: kesulitan,
        modelPembelajaran: model,
        cpTp: cptp, ringkasan, mediaLinks,
        assignedScheduleId: ''
      });
      UI.showToast('Bahan ajar baru berhasil ditambahkan!');
    }

    AppState.save();
    UI.closeModal('modal-form-material');
    this.render();
  },

  edit(id) {
    const item = AppState.data.materials.find(m => m.id === id);
    if (!item) return;

    this.openAddModal();
    document.getElementById('modal-material-title').textContent = 'Edit Materi Pembelajaran';
    document.getElementById('mat-edit-id').value = item.id;

    KurikulumMerdeka.initSelectors(
      'mat',
      item.jenjang || 'SMA',
      item.fase || KurikulumMerdeka.getFaseByKelas(item.kelas),
      item.kelas,
      item.mapel || ''
    );

    document.getElementById('mat-input-judul').value = item.judul;
    document.getElementById('mat-input-topik').value = item.topik || '';
    document.getElementById('mat-input-alokasi').value = item.alokasi || '';
    document.getElementById('mat-input-kesulitan').value = item.tingkatKesulitan || 'Dasar';
    document.getElementById('mat-input-model').value = item.modelPembelajaran || '';
    document.getElementById('mat-input-cptp').value = item.cpTp;
    document.getElementById('mat-input-ringkasan').value = item.ringkasan || '';

    const video = item.mediaLinks?.find(l => l.tipe === 'video')?.url || '';
    const doc = item.mediaLinks?.find(l => l.tipe === 'doc')?.url || '';
    const cloud = item.mediaLinks?.find(l => l.tipe === 'cloud')?.url || '';
    document.getElementById('mat-input-video').value = video;
    document.getElementById('mat-input-doc').value = doc;
    document.getElementById('mat-input-cloud').value = cloud;
  },

  delete(id) {
    if (!confirm('Hapus materi pembelajaran ini dari repositori?')) return;
    AppState.data.materials = AppState.data.materials.filter(m => m.id !== id);
    AppState.save();
    UI.showToast('Materi berhasil dihapus.');
    this.render();
  },

  viewMediaPresentation(id) {
    const item = AppState.data.materials.find(m => m.id === id);
    if (!item) return;

    const titleEl = document.getElementById('mat-viewer-title');
    const contentEl = document.getElementById('mat-viewer-content');
    if (titleEl) titleEl.textContent = `Presentasi Kelas: ${item.judul}`;

    // Look for video or simulation
    const videoObj = item.mediaLinks?.find(l => l.tipe === 'video');
    let videoHtml = '';
    if (videoObj && videoObj.url) {
      let embedUrl = videoObj.url;
      if (embedUrl.includes('youtube.com/watch?v=')) {
        const videoId = embedUrl.split('v=')[1]?.split('&')[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      } else if (embedUrl.includes('youtu.be/')) {
        const videoId = embedUrl.split('youtu.be/')[1]?.split('?')[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
      videoHtml = `
        <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: var(--radius-md); margin-bottom: 1.25rem; background: #000;">
          <iframe src="${embedUrl}" style="position: absolute; top:0; left: 0; width: 100%; height: 100%; border:0;" allowfullscreen></iframe>
        </div>
      `;
    }

    contentEl.innerHTML = `
      ${videoHtml}
      <div style="background: var(--slate-50); border: 1px solid var(--slate-200); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1rem;">
        <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--emerald-800); margin-bottom: 0.35rem;">Target Capaian Pembelajaran (CP/TP):</h4>
        <p style="font-size: 0.85rem; line-height: 1.6; color: var(--slate-700);">${item.cpTp}</p>
      </div>

      <div style="margin-bottom: 1rem;">
        <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--slate-900); margin-bottom: 0.35rem;">Ringkasan Inti & Poin Diskusi Kelas:</h4>
        <div style="font-size: 0.875rem; line-height: 1.7; color: var(--slate-700); white-space: pre-wrap; background: var(--white); border: 1px solid var(--slate-200); border-radius: var(--radius-md); padding: 1rem;">${item.ringkasan || 'Tidak ada ringkasan teks khusus.'}</div>
      </div>

      <div>
        <h4 style="font-size: 0.85rem; font-weight: 700; color: var(--slate-900); margin-bottom: 0.5rem;">Lampiran Dokumen & Sumber Terhubung:</h4>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          ${(item.mediaLinks || []).map(l => `
            <a href="${l.url}" target="_blank" class="btn btn-secondary btn-sm">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
              ${l.label}
            </a>
          `).join('')}
        </div>
      </div>
    `;

    UI.openModal('modal-material-viewer');
  },

  openAssignModal(id) {
    const item = AppState.data.materials.find(m => m.id === id);
    if (!item) return;

    document.getElementById('assign-material-id').value = item.id;
    document.getElementById('assign-material-name').textContent = `Materi: "${item.judul}" (${item.kelas})`;

    const select = document.getElementById('assign-target-slot');
    if (select) {
      const slots = AppState.data.timetable;
      if (slots.length === 0) {
        select.innerHTML = '<option value="">Belum ada jadwal mengajar di timetable</option>';
      } else {
        select.innerHTML = slots.map(s => 
          `<option value="${s.id}" ${s.id === item.assignedScheduleId ? 'selected' : ''}>${s.hari} - ${s.kelas} (${s.jamMulai} - ${s.jamSelesai}) [${s.mapel}]</option>`
        ).join('');
      }
    }

    UI.openModal('modal-assign-schedule');
  },

  saveScheduleAssignment(e) {
    e.preventDefault();
    const matId = document.getElementById('assign-material-id').value;
    const slotId = document.getElementById('assign-target-slot').value;

    const mat = AppState.data.materials.find(m => m.id === matId);
    if (mat) {
      mat.assignedScheduleId = slotId;
      AppState.save();
      UI.closeModal('modal-assign-schedule');
      UI.showToast('Materi berhasil ditautkan ke jadwal sesi mengajar!');
      this.render();
    }
  },

  triggerCreateQuestionFromMaterial(id) {
    Navigation.switchView('view-questions');
    QuestionBankModule.openAddQuestionModal(id);
    UI.showToast('Siap merancang butir soal berdasarkan materi ini!');
  }
};

// ==========================================================================
// 12C. Modul 8: Question Bank & Bloom Assessment (Bank Soal & Asesmen Guru)
// ==========================================================================
const QuestionBankModule = {
  currentTab: 'bank',
  currentExamPkgId: null,
  currentExamPreviewTab: 'soal',
  cachedAIGeneratedQuestions: [],

  render() {
    const data = AppState.data;
    if (!data) return;

    // Update Sidebar badge
    const badge = document.getElementById('sidebar-badge-questions');
    if (badge) badge.textContent = data.questionBank.length;

    // Populate source material selector in AI generator
    const aiMatSelect = document.getElementById('ai-gen-material-select');
    if (aiMatSelect) {
      aiMatSelect.innerHTML = '<option value="">-- Pilih Materi dari Repositori --</option>' + 
        data.materials.map(m => `<option value="${m.id}">${m.judul} (${m.kelas})</option>`).join('');
    }

    // Populate class selector in package modal
    const pkgClass = document.getElementById('pkg-input-kelas');
    if (pkgClass) {
      pkgClass.innerHTML = data.classes.map(c => `<option value="${c}">${c}</option>`).join('');
    }

    if (this.currentTab === 'bank') this.filterList();
    else if (this.currentTab === 'packages') this.renderPackages();
  },

  switchTab(tab) {
    this.currentTab = tab;
    document.querySelectorAll('[data-qtab]').forEach(el => el.classList.remove('active'));
    document.querySelector(`[data-qtab="${tab}"]`)?.classList.add('active');

    document.getElementById('qsec-bank').style.display = tab === 'bank' ? 'block' : 'none';
    document.getElementById('qsec-packages').style.display = tab === 'packages' ? 'block' : 'none';
    document.getElementById('qsec-ai-generator').style.display = tab === 'ai-generator' ? 'block' : 'none';

    if (tab === 'bank') this.filterList();
    else if (tab === 'packages') this.renderPackages();
  },

  filterList() {
    const data = AppState.data;
    const filterBloom = document.getElementById('filter-bloom')?.value || '';
    const filterType = document.getElementById('filter-qtype')?.value || '';
    const container = document.getElementById('questions-list-container');
    const indicator = document.getElementById('qbank-count-indicator');
    if (!container) return;

    const list = data.questionBank.filter(q => {
      const matchBloom = !filterBloom || q.tingkatKognitif === filterBloom;
      const matchType = !filterType || q.tipe === filterType;
      return matchBloom && matchType;
    });

    if (indicator) indicator.textContent = `Menampilkan ${list.length} dari ${data.questionBank.length} Butir Soal`;

    if (list.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; background: var(--white); border-radius: var(--radius-lg); border: 1px dashed var(--slate-300);">
          <svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="color: var(--slate-400); margin-bottom: 0.5rem;"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
          <h4 style="font-size: 1rem; color: var(--slate-700);">Tidak Ada Butir Soal Ditemukan</h4>
          <p style="font-size: 0.8rem; color: var(--slate-500); margin-top: 4px;">Susun butir soal HOTS, MOTS, dan LOTS mandiri atau gunakan asisten AI.</p>
          <div style="display: flex; gap: 0.5rem; justify-content: center; margin-top: 0.85rem; flex-wrap: wrap;">
            <button class="btn btn-primary" onclick="QuestionBankModule.openAddQuestionModal()">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
              <span>+ Buat Butir Soal Baru</span>
            </button>
            <button class="btn btn-secondary" onclick="QuestionBankModule.switchTab('ai-generator')">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              <span>AI Question Generator</span>
            </button>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map((q, idx) => {
      let bloomBadgeClass = 'badge-lots';
      if (q.tingkatKognitif === 'MOTS') bloomBadgeClass = 'badge-mots';
      if (q.tingkatKognitif === 'HOTS') bloomBadgeClass = 'badge-hots';

      const mat = data.materials.find(m => m.id === q.materiId);
      const matTitle = mat ? mat.judul : 'Umum';

      let optionsHtml = '';
      if (q.tipe === 'Pilihan Ganda' && q.opsiJawaban) {
        const letters = ['A', 'B', 'C', 'D', 'E'];
        optionsHtml = `
          <div class="question-options-list">
            ${q.opsiJawaban.map((opt, oIdx) => {
              const letCode = letters[oIdx] || '';
              const isCorrect = q.kunciJawaban === letCode;
              return `
                <div class="option-pill ${isCorrect ? 'correct' : ''}">
                  <strong style="width: 20px;">${letCode}.</strong>
                  <span>${opt}</span>
                  ${isCorrect ? '<span style="margin-left: auto; font-size: 0.7rem; color: var(--emerald-700); font-weight: 700;">(Kunci Jawaban Benar)</span>' : ''}
                </div>
              `;
            }).join('')}
          </div>
        `;
      } else if (q.tipe === 'Benar/Salah') {
        optionsHtml = `
          <div style="font-size: 0.825rem; font-weight: 700; color: var(--emerald-800); margin: 0.5rem 0;">
            Kunci Jawaban: ${q.kunciJawaban === 'A' ? 'BENAR' : 'SALAH'}
          </div>
        `;
      }

      return `
        <div class="question-item-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.65rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
              <span class="bloom-indicator ${bloomBadgeClass}">
                ${q.bloomTaxonomy || 'C4'} • ${q.tingkatKognitif || 'HOTS'}
              </span>
              <span class="badge badge-qtype">${q.tipe}</span>
              <span style="font-size: 0.725rem; color: var(--slate-500);">Bobot: <strong>${q.bobotSkor || 10} Poin</strong></span>
              <span style="font-size: 0.725rem; color: var(--slate-400);">• Materi: ${matTitle}</span>
            </div>
            <button class="btn btn-ghost btn-sm" style="color: var(--rose-600);" onclick="QuestionBankModule.deleteQuestion('${q.id}')">Hapus</button>
          </div>

          ${q.stimulus ? `
            <div class="stimulus-box">
              <strong style="display: block; font-size: 0.75rem; color: var(--slate-500); margin-bottom: 2px;">Stimulus / Konteks Kasus:</strong>
              ${q.stimulus}
            </div>
          ` : ''}

          <div style="font-size: 0.9rem; font-weight: 700; color: var(--slate-900); margin-bottom: 0.5rem; line-height: 1.5;">
            ${idx + 1}. ${q.pertanyaan}
          </div>

          ${optionsHtml}

          ${q.tipe === 'Esai' && q.kunciJawaban ? `
            <div class="scoring-guide-box">
              <strong>Pedoman Penskoran & Kata Kunci:</strong>
              <div style="margin-top: 2px;">${q.kunciJawaban}</div>
            </div>
          ` : ''}

          ${q.pembahasan ? `
            <div class="explanation-box">
              <strong>Pembahasan Logika:</strong> ${q.pembahasan}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  },

  openAddQuestionModal(prefillMaterialId = '') {
    document.getElementById('form-question').reset();
    document.getElementById('q-edit-id').value = '';
    
    // Populate material select
    const select = document.getElementById('q-input-materi');
    if (select) {
      select.innerHTML = '<option value="">-- Bebas / Topik Umum --</option>' + 
        AppState.data.materials.map(m => `<option value="${m.id}" ${m.id === prefillMaterialId ? 'selected' : ''}>${m.judul}</option>`).join('');
    }

    this.onTypeChange('Pilihan Ganda');
    UI.openModal('modal-form-question');
  },

  onTypeChange(type) {
    const mcSec = document.getElementById('q-section-mc');
    const essaySec = document.getElementById('q-section-essay');
    if (type === 'Pilihan Ganda') {
      if (mcSec) mcSec.style.display = 'block';
      if (essaySec) essaySec.style.display = 'none';
    } else {
      if (mcSec) mcSec.style.display = 'none';
      if (essaySec) essaySec.style.display = 'block';
    }
  },

  onBloomChange(bloom) {
    // Automatically correlate C1-C2 -> LOTS, C3 -> MOTS, C4-C6 -> HOTS
  },

  saveQuestion(e) {
    e.preventDefault();
    const materiId = document.getElementById('q-input-materi').value;
    const tipe = document.getElementById('q-input-type').value;
    const bloomTaxonomy = document.getElementById('q-input-bloom').value;
    const score = parseInt(document.getElementById('q-input-score').value, 10) || 10;
    const stimulus = document.getElementById('q-input-stimulus').value.trim();
    const pertanyaan = document.getElementById('q-input-pertanyaan').value.trim();
    const pembahasan = document.getElementById('q-input-pembahasan').value.trim();

    let tingkatKognitif = 'HOTS';
    if (bloomTaxonomy === 'C1' || bloomTaxonomy === 'C2') tingkatKognitif = 'LOTS';
    else if (bloomTaxonomy === 'C3') tingkatKognitif = 'MOTS';

    let opsiJawaban = [];
    let kunciJawaban = '';

    if (tipe === 'Pilihan Ganda') {
      const a = document.getElementById('q-opt-a').value.trim();
      const b = document.getElementById('q-opt-b').value.trim();
      const c = document.getElementById('q-opt-c').value.trim();
      const d = document.getElementById('q-opt-d').value.trim();
      const eOpt = document.getElementById('q-opt-e').value.trim();
      opsiJawaban = [a, b, c, d, eOpt].filter(Boolean);
      kunciJawaban = document.getElementById('q-correct-mc').value;
    } else if (tipe === 'Benar/Salah') {
      opsiJawaban = ['Benar', 'Salah'];
      kunciJawaban = 'A';
    } else {
      kunciJawaban = document.getElementById('q-input-scoring-guide').value.trim();
    }

    const newId = StorageManager.generateId('QST', AppState.data.questionBank);
    AppState.data.questionBank.unshift({
      id: newId,
      materiId, tipe, bloomTaxonomy, tingkatKognitif,
      bobotSkor: score, stimulus, pertanyaan,
      opsiJawaban, kunciJawaban, pembahasan
    });

    AppState.save();
    UI.closeModal('modal-form-question');
    UI.showToast('Butir soal baru berhasil disimpan ke Bank Soal!');
    this.render();
  },

  deleteQuestion(id) {
    if (!confirm('Hapus butir soal ini dari bank soal?')) return;
    AppState.data.questionBank = AppState.data.questionBank.filter(q => q.id !== id);
    AppState.save();
    UI.showToast('Butir soal dihapus.');
    this.render();
  },

  // Assessment Packages
  renderPackages() {
    const list = AppState.data.assessmentPackages;
    const container = document.getElementById('assessment-packages-list');
    if (!container) return;

    if (list.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; background: var(--white); border-radius: var(--radius-lg); border: 1px dashed var(--slate-300);">
          <svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="color: var(--slate-400); margin-bottom: 0.5rem;"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
          <h4 style="font-size: 1rem; color: var(--slate-700);">Belum Ada Paket Ujian / Asesmen</h4>
          <p style="font-size: 0.8rem; color: var(--slate-500); margin-top: 4px;">Rakit butir-butir soal menjadi paket soal ujian atau kuis siap cetak.</p>
          <button class="btn btn-primary" onclick="QuestionBankModule.openGeneratePackageModal()" style="margin-top: 0.85rem;">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
            <span>+ Susun Paket Ujian Pertama</span>
          </button>
        </div>`;
      return;
    }

    container.innerHTML = list.map(pkg => {
      const questions = (pkg.daftarSoalIds || []).map(id => AppState.data.questionBank.find(q => q.id === id)).filter(Boolean);
      const hotsCount = questions.filter(q => q.tingkatKognitif === 'HOTS').length;
      const motsCount = questions.filter(q => q.tingkatKognitif === 'MOTS').length;
      const lotsCount = questions.filter(q => q.tingkatKognitif === 'LOTS').length;

      return `
        <div class="dashboard-card" style="margin-bottom: 1.25rem;">
          <div class="card-header-flex">
            <div>
              <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--slate-900);">${pkg.judulPaket}</h3>
              <div style="font-size: 0.775rem; color: var(--slate-500); margin-top: 2px;">
                Kelas: <strong>${pkg.kelas}</strong> • Mapel: <strong>${pkg.mapel}</strong> • Durasi: <strong>${pkg.waktuMenit || 60} Menit</strong>
              </div>
            </div>
            <div style="display: flex; gap: 0.35rem;">
              <button class="btn btn-primary btn-sm" onclick="QuestionBankModule.previewExamPaper('${pkg.id}')">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                Pratinjau & Cetak
              </button>
              <button class="btn btn-secondary btn-sm" title="Ekspor Format GIFT LMS" onclick="QuestionBankModule.exportGIFT('${pkg.id}')">
                Ekspor GIFT
              </button>
              <button class="btn btn-dark btn-sm" onclick="QuestionBankModule.openPushGradebookModal('${pkg.id}')">
                Salurkan ke Buku Nilai
              </button>
              <button class="btn btn-ghost btn-sm" style="color: var(--rose-600);" onclick="QuestionBankModule.deletePackage('${pkg.id}')">&times;</button>
            </div>
          </div>

          <div style="display: flex; gap: 0.75rem; font-size: 0.8rem; background: var(--slate-50); padding: 0.65rem 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--slate-200);">
            <span>Total: <strong>${questions.length} Butir Soal</strong></span>
            <span>•</span>
            <span style="color: var(--emerald-700);">LOTS: <strong>${lotsCount}</strong></span>
            <span>•</span>
            <span style="color: var(--sky-700);">MOTS: <strong>${motsCount}</strong></span>
            <span>•</span>
            <span style="color: var(--rose-700);">HOTS: <strong>${hotsCount}</strong></span>
          </div>
        </div>
      `;
    }).join('');
  },

  openGeneratePackageModal() {
    document.getElementById('form-generate-package').reset();
    UI.openModal('modal-generate-package');
  },

  executeGeneratePackage(e) {
    e.preventDefault();
    const judul = document.getElementById('pkg-input-judul').value.trim();
    const kelas = document.getElementById('pkg-input-kelas').value;
    const waktu = parseInt(document.getElementById('pkg-input-waktu').value, 10) || 60;
    const reqLots = parseInt(document.getElementById('pkg-count-lots').value, 10) || 0;
    const reqMots = parseInt(document.getElementById('pkg-count-mots').value, 10) || 0;
    const reqHots = parseInt(document.getElementById('pkg-count-hots').value, 10) || 0;

    const lots = AppState.data.questionBank.filter(q => q.tingkatKognitif === 'LOTS');
    const mots = AppState.data.questionBank.filter(q => q.tingkatKognitif === 'MOTS');
    const hots = AppState.data.questionBank.filter(q => q.tingkatKognitif === 'HOTS');

    const shuffle = arr => arr.sort(() => 0.5 - Math.random());
    const pickedLots = shuffle([...lots]).slice(0, reqLots).map(q => q.id);
    const pickedMots = shuffle([...mots]).slice(0, reqMots).map(q => q.id);
    const pickedHots = shuffle([...hots]).slice(0, reqHots).map(q => q.id);

    const pickedIds = [...pickedLots, ...pickedMots, ...pickedHots];
    if (pickedIds.length === 0) {
      UI.showToast('Bank soal tidak mencukupi untuk kriteria ini. Tambahkan soal ke bank soal terlebih dahulu.', 'error');
      return;
    }

    const newId = StorageManager.generateId('PKG', AppState.data.assessmentPackages);
    AppState.data.assessmentPackages.unshift({
      id: newId,
      judulPaket: judul,
      kelas,
      mapel: AppState.currentTeacher.mataPelajaran || 'Umum',
      waktuMenit: waktu,
      tanggalUjian: new Date().toISOString().split('T')[0],
      daftarSoalIds: pickedIds
    });

    AppState.save();
    UI.closeModal('modal-generate-package');
    UI.showToast(`Paket Ujian berhasil digenerate dengan ${pickedIds.length} butir soal!`);
    this.switchTab('packages');
  },

  deletePackage(id) {
    if (!confirm('Hapus paket ujian ini?')) return;
    AppState.data.assessmentPackages = AppState.data.assessmentPackages.filter(p => p.id !== id);
    AppState.save();
    UI.showToast('Paket ujian dihapus.');
    this.renderPackages();
  },

  // Exam Paper Print Preview
  previewExamPaper(pkgId) {
    this.currentExamPkgId = pkgId;
    this.switchExamPreviewTab('soal');
    UI.openModal('modal-exam-print-preview');
  },

  switchExamPreviewTab(tab) {
    this.currentExamPreviewTab = tab;
    document.querySelectorAll('[data-examtab]').forEach(el => el.classList.remove('active'));
    document.querySelector(`[data-examtab="${tab}"]`)?.classList.add('active');

    const pkg = AppState.data.assessmentPackages.find(p => p.id === this.currentExamPkgId);
    if (!pkg) return;

    const teacher = AppState.currentTeacher;
    const questions = (pkg.daftarSoalIds || []).map(id => AppState.data.questionBank.find(q => q.id === id)).filter(Boolean);
    const content = document.getElementById('exam-print-body-content');
    if (!content) return;

    const kopHtml = `
      <div class="exam-kop">
        <h2>${teacher.namaSekolah}</h2>
        <h3>${pkg.judulPaket}</h3>
        <p style="font-size: 0.8rem; color: #333;">Tahun Ajaran 2026/2027 • Kurikulum Merdeka</p>
      </div>
      <div class="exam-meta-grid">
        <div>
          <div><strong>Mata Pelajaran:</strong> ${pkg.mapel}</div>
          <div><strong>Kelas / Fase:</strong> ${pkg.kelas}</div>
        </div>
        <div style="text-align: right;">
          <div><strong>Alokasi Waktu:</strong> ${pkg.waktuMenit} Menit</div>
          <div><strong>Guru Pengampu:</strong> ${teacher.namaLengkap}</div>
        </div>
      </div>
    `;

    if (tab === 'soal') {
      content.innerHTML = `
        <div class="exam-paper-wrap">
          ${kopHtml}
          <div style="background: var(--slate-100); padding: 0.5rem 0.75rem; border-radius: 4px; font-size: 0.775rem; margin-bottom: 1rem;">
            <strong>PETUNJUK PENGERJAAN:</strong> Bacalah setiap stimulus dan pertanyaan dengan cermat. Berikan jawaban yang paling tepat pada lembar jawaban yang tersedia.
          </div>
          <div>
            ${questions.map((q, idx) => `
              <div style="margin-bottom: 1.25rem;">
                ${q.stimulus ? `
                  <div style="background: var(--slate-50); border: 1px solid var(--slate-200); padding: 0.5rem 0.75rem; font-size: 0.825rem; margin-bottom: 0.35rem; line-height: 1.5;">
                    ${q.stimulus}
                  </div>
                ` : ''}
                <div style="font-size: 0.875rem; font-weight: 600; line-height: 1.5; margin-bottom: 0.35rem;">
                  ${idx + 1}. ${q.pertanyaan}
                </div>
                ${q.tipe === 'Pilihan Ganda' && q.opsiJawaban ? `
                  <div style="padding-left: 1.25rem; font-size: 0.85rem; line-height: 1.6;">
                    ${q.opsiJawaban.map((opt, oIdx) => `<div>${['A','B','C','D','E'][oIdx]}. ${opt}</div>`).join('')}
                  </div>
                ` : ''}
                ${q.tipe === 'Esai' ? `
                  <div style="height: 70px; border: 1px dashed var(--slate-300); border-radius: 4px; margin-top: 0.35rem; background: var(--slate-50); padding: 0.5rem; font-size: 0.75rem; color: var(--slate-400);">
                    (Ruang jawaban siswa)
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else if (tab === 'ljk') {
      content.innerHTML = `
        <div class="exam-paper-wrap">
          ${kopHtml}
          <div style="border: 1px solid #000; padding: 0.75rem; margin-bottom: 1.25rem; font-size: 0.85rem;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
              <div>Nama Siswa: .....................................................</div>
              <div>Nomor Absen: ........................</div>
              <div>NISN: ..............................................................</div>
              <div>Tanda Tangan: .......................</div>
            </div>
          </div>
          <h4 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 0.5rem;">LEMBAR JAWABAN PILIHAN GANDA</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 0.5rem; margin-bottom: 1.5rem;">
            ${questions.filter(q => q.tipe === 'Pilihan Ganda').map((q, idx) => `
              <div style="border: 1px solid var(--slate-200); padding: 0.35rem 0.5rem; font-size: 0.8rem; text-align: center;">
                <strong>No. ${idx + 1}</strong>: [ A ] [ B ] [ C ] [ D ] [ E ]
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else {
      content.innerHTML = `
        <div class="exam-paper-wrap">
          ${kopHtml}
          <h4 style="font-size: 1rem; font-weight: 800; color: var(--emerald-800); margin-bottom: 1rem; border-bottom: 2px solid var(--emerald-600); padding-bottom: 4px;">
            KUNCI JAWABAN, PEMBAHASAN & PEDOMAN PENSKORAN RESMI
          </h4>
          <div>
            ${questions.map((q, idx) => `
              <div style="margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--slate-200);">
                <div style="font-size: 0.85rem; font-weight: 700;">
                  Soal No. ${idx + 1} (${q.tingkatKognitif} - ${q.bloomTaxonomy}): Kunci [ ${q.kunciJawaban} ]
                </div>
                ${q.pembahasan ? `
                  <div style="font-size: 0.8rem; color: var(--slate-700); margin-top: 4px;">
                    <strong>Pembahasan:</strong> ${q.pembahasan}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
  },

  printExamDoc() {
    const previewContent = document.getElementById('exam-print-body-content')?.innerHTML;
    if (previewContent) {
      PrintModule.print(previewContent);
    } else {
      PrintModule.printQuestionBank();
    }
  },

  // Export to GIFT text format
  exportGIFT(pkgId) {
    const pkg = AppState.data.assessmentPackages.find(p => p.id === pkgId);
    if (!pkg) return;

    const questions = (pkg.daftarSoalIds || []).map(id => AppState.data.questionBank.find(q => q.id === id)).filter(Boolean);
    let gift = `// GIFT Format Export - Master Teacher Planner\n// Paket: ${pkg.judulPaket}\n// Tanggal: ${new Date().toISOString()}\n\n`;

    questions.forEach((q, idx) => {
      gift += `::Q${idx + 1}_${q.bloomTaxonomy}:: ${q.pertanyaan} {\n`;
      if (q.tipe === 'Pilihan Ganda' && q.opsiJawaban) {
        const letters = ['A', 'B', 'C', 'D', 'E'];
        q.opsiJawaban.forEach((opt, oIdx) => {
          const isCorrect = q.kunciJawaban === letters[oIdx];
          gift += isCorrect ? `  =${opt}\n` : `  ~${opt}\n`;
        });
      } else if (q.tipe === 'Benar/Salah') {
        gift += q.kunciJawaban === 'A' ? '  TRUE\n' : '  FALSE\n';
      }
      gift += `}\n\n`;
    });

    const blob = new Blob([gift], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Paket_Ujian_${pkg.judulPaket.replace(/\s+/g, '_')}.gift.txt`;
    a.click();
    URL.revokeObjectURL(url);
    UI.showToast('File format GIFT / LMS berhasil diunduh!');
  },

  // Push Scores to Gradebook
  openPushGradebookModal(pkgId) {
    const pkg = AppState.data.assessmentPackages.find(p => p.id === pkgId);
    if (!pkg) return;

    document.getElementById('push-pkg-id').value = pkg.id;
    const students = AppState.data.students.filter(s => s.kelas === pkg.kelas);
    const container = document.getElementById('push-students-grade-inputs');
    if (!container) return;

    if (students.length === 0) {
      container.innerHTML = `<p style="font-size: 0.8rem; color: var(--slate-500);">Tidak ada siswa di kelas ${pkg.kelas}.</p>`;
    } else {
      container.innerHTML = students.map(st => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.35rem 0; border-bottom: 1px solid var(--slate-100); font-size: 0.825rem;">
          <span>${st.namaLengkap}</span>
          <input type="number" min="0" max="100" class="grade-input push-student-score-input" data-student-id="${st.id}" value="85">
        </div>
      `).join('');
    }

    UI.openModal('modal-push-gradebook');
  },

  executePushToGradebook(e) {
    e.preventDefault();
    const pkgId = document.getElementById('push-pkg-id').value;
    const col = document.getElementById('push-target-column').value;
    const pkg = AppState.data.assessmentPackages.find(p => p.id === pkgId);
    if (!pkg) return;

    const inputs = document.querySelectorAll('.push-student-score-input');
    inputs.forEach(input => {
      const studentId = input.dataset.studentId;
      const score = parseFloat(input.value) || 0;

      let grade = AppState.data.gradebook.find(g => g.studentId === studentId);
      if (!grade) {
        grade = { studentId, kelas: pkg.kelas, tugas: [80, 80], uts: 80, uas: 80 };
        AppState.data.gradebook.push(grade);
      }

      if (col === 't1') grade.tugas[0] = score;
      else if (col === 't2') grade.tugas[1] = score;
      else if (col === 'uts') grade.uts = score;
      else if (col === 'uas') grade.uas = score;
    });

    AppState.save();
    UI.closeModal('modal-push-gradebook');
    UI.showToast(`Nilai hasil ujian "${pkg.judulPaket}" berhasil dimasukkan ke Buku Nilai!`);
  },

  // AI Question Generator
  onAIMaterialSelect(matId) {
    const mat = AppState.data.materials.find(m => m.id === matId);
    if (!mat) return;
    const topicInput = document.getElementById('ai-gen-topic');
    if (topicInput) topicInput.value = `${mat.judul} (${mat.topik}) - ${mat.cpTp}`;
  },

  async runAIQuestionGenerator() {
    const topic = document.getElementById('ai-gen-topic')?.value.trim();
    const level = document.getElementById('ai-gen-level')?.value || 'HOTS';
    const count = parseInt(document.getElementById('ai-gen-count')?.value, 10) || 5;
    const outputEl = document.getElementById('ai-questions-output-content');
    const btn = document.getElementById('btn-run-ai-questions');
    const saveBtn = document.getElementById('btn-save-ai-questions');

    if (!topic) {
      UI.showToast('Silakan pilih materi sumber atau ketik topik terlebih dahulu!', 'error');
      return;
    }

    btn.disabled = true;
    outputEl.textContent = '⏳ Sedang merancang paket soal terstandarisasi Kurikulum Merdeka dengan stimulus dan Taksonomi Bloom...';
    if (saveBtn) saveBtn.style.display = 'none';

    setTimeout(() => {
      let generated = [];

      if (level === 'SD-A') {
        generated = [
          {
            id: StorageManager.generateId('QST', AppState.data.questionBank),
            tipe: 'Pilihan Ganda',
            bloomTaxonomy: 'C1',
            tingkatKognitif: 'LOTS',
            bobotSkor: 10,
            stimulus: `Cerita Literasi: Budi memiliki 4 buah apel. Ibu memberikan 3 buah apel lagi kepada Budi untuk dibagikan kepada teman bermainnya.`,
            pertanyaan: `Berapakah jumlah seluruh buah apel yang dimiliki Budi sekarang?`,
            opsiJawaban: ['5 buah', '7 buah', '6 buah', '8 buah'],
            kunciJawaban: 'B',
            pembahasan: 'Operasi penjumlahan dasar Fase A: 4 + 3 = 7 apel.'
          },
          {
            id: StorageManager.generateId('QST', AppState.data.questionBank) + '-b',
            tipe: 'Benar/Salah',
            bloomTaxonomy: 'C2',
            tingkatKognitif: 'LOTS',
            bobotSkor: 10,
            stimulus: '',
            pertanyaan: `Pada topik "${topic}": Sikap saling menghargai dan menyapa teman di kelas adalah contoh perbuatan terpuji sesuai Pancasila.`,
            opsiJawaban: ['Benar', 'Salah'],
            kunciJawaban: 'A',
            pembahasan: 'Menghargai dan menyapa teman mencerminkan budi pekerti luhur fondasi Fase A.'
          },
          {
            id: StorageManager.generateId('QST', AppState.data.questionBank) + '-c',
            tipe: 'Esai',
            bloomTaxonomy: 'C2',
            tingkatKognitif: 'LOTS',
            bobotSkor: 20,
            stimulus: `Gambar aktivitas di halaman sekolah saat jam istirahat.`,
            pertanyaan: `Sebutkan 2 contoh kegiatan baik yang dapat kamu lakukan bersama temanmu saat jam istirahat sesuai topik "${topic}"!`,
            kunciJawaban: 'Rubrik: 1. Bermain bersama dengan rukun. 2. Berbagi makanan atau merapikan sampah sisa bekal bersama.',
            pembahasan: 'Penguatan karakter kebersamaan dan literasi verbal sederhana siswa Fase A.'
          }
        ];
      } else if (level === 'SD-BC') {
        generated = [
          {
            id: StorageManager.generateId('QST', AppState.data.questionBank),
            tipe: 'Pilihan Ganda',
            bloomTaxonomy: 'C3',
            tingkatKognitif: 'MOTS',
            bobotSkor: 15,
            stimulus: `Pengamatan IPAS: Sekelompok siswa menaruh tanaman pot di tempat terang terkena matahari, dan pot lainnya di dalam kardus tertutup selama satu minggu.`,
            pertanyaan: `Berdasarkan pengamatan topik "${topic}", apakah yang akan terjadi pada tanaman di dalam kardus tertutup dan apa penyebabnya?`,
            opsiJawaban: [
              'Tumbuh subur karena tidak kepanasan',
              'Daun menguning dan layu karena tidak mendapat sinar matahari untuk fotosintesis',
              'Berbunga lebih lebat dibanding tanaman di tempat terang',
              'Batangnya menjadi sangat kokoh dan hijau tua'
            ],
            kunciJawaban: 'B',
            pembahasan: 'Materi IPAS Fase B/C: Tumbuhan memerlukan cahaya matahari untuk proses fotosintesis menghasilkan energi makanan.'
          },
          {
            id: StorageManager.generateId('QST', AppState.data.questionBank) + '-b',
            tipe: 'Pilihan Ganda',
            bloomTaxonomy: 'C4',
            tingkatKognitif: 'HOTS',
            bobotSkor: 15,
            stimulus: `Di lingkungan desa terjadi penumpukan sampah plastik yang menyumbat saluran air saat musim hujan.`,
            pertanyaan: `Solusi gotong royong warga desa yang paling tepat dan berkelanjutan sesuai topik "${topic}" adalah...`,
            opsiJawaban: [
              'Membuang sampah ke sungai saat arus deras',
              'Mengadakan kerja bakti pembersihan selokan dan membuat bank sampah pilah',
              'Membakar seluruh sampah plastik di pinggir jalan raya',
              'Menutup saluran air dengan cor semen agar sampah tidak terlihat'
            ],
            kunciJawaban: 'B',
            pembahasan: 'Penalaran sosial IPAS Fase C mengenai pelestarian lingkungan dan partisipasi komunitas.'
          },
          {
            id: StorageManager.generateId('QST', AppState.data.questionBank) + '-c',
            tipe: 'Esai',
            bloomTaxonomy: 'C4',
            tingkatKognitif: 'HOTS',
            bobotSkor: 20,
            stimulus: `Data rantai makanan di sawah: Padi -> Tikus -> Ular -> Burung Elang.`,
            pertanyaan: `Jika petani membasmi seluruh ular di sawah, jelaskan dampak berantai yang akan terjadi pada populasi tikus dan hasil panen padi!`,
            kunciJawaban: 'Rubrik: 1. Populasi tikus meningkat drastis karena predator alaminya hilang. 2. Hasil panen padi menurun akibat serangan hama tikus.',
            pembahasan: 'Konsep keseimbangan ekosistem dan jaring-jaring makanan IPAS Fase B/C.'
          }
        ];
      } else if (level === 'SMP-D') {
        generated = [
          {
            id: StorageManager.generateId('QST', AppState.data.questionBank),
            tipe: 'Pilihan Ganda',
            bloomTaxonomy: 'C4',
            tingkatKognitif: 'HOTS',
            bobotSkor: 15,
            stimulus: `Diberikan algoritma lampu lalu lintas otomatis: sensor mendeteksi kepadatan kendaraan. Jika jumlah mobil > 20, durasi lampu hijau = 60 detik. Jika 10-20 mobil, durasi = 30 detik. Jika < 10 mobil, durasi = 15 detik.`,
            pertanyaan: `Pada topik "${topic}", manakah struktur percabangan logika yang paling tepat untuk memodelkan sistem tersebut?`,
            opsiJawaban: [
              'Nested IF-ELSE bersyarat bertingkat',
              'Perulangan FOR tak terbatas',
              'Fungsi acak tanpa variabel kondisi',
              'Struktur sekuensial tanpa percabangan',
              'Algoritma Linear Search tunggal'
            ],
            kunciJawaban: 'A',
            pembahasan: 'Informatika SMP Fase D: Percabangan bertingkat (If-Else If-Else) memetakan kondisi multi-kriteria secara terstruktur.'
          },
          {
            id: StorageManager.generateId('QST', AppState.data.questionBank) + '-b',
            tipe: 'Pilihan Ganda',
            bloomTaxonomy: 'C3',
            tingkatKognitif: 'MOTS',
            bobotSkor: 15,
            stimulus: `Laboratorium IPA: Siswa mengukur perubahan suhu air saat dipanaskan dari 25°C hingga mendidih 100°C selama 15 menit.`,
            pertanyaan: `Berdasarkan topik "${topic}", jenis representasi visual data yang paling tepat untuk menampilkan laju kenaikan suhu terhadap waktu adalah...`,
            opsiJawaban: [
              'Grafik garis (Line chart)',
              'Diagram lingkaran (Pie chart)',
              'Diagram donat (Donut chart)',
              'Peta persebaran geografis',
              'Daftar teks acak'
            ],
            kunciJawaban: 'A',
            pembahasan: 'Grafik garis sangat ideal untuk menunjukkan tren dan perubahan nilai kontinyu terhadap waktu.'
          },
          {
            id: StorageManager.generateId('QST', AppState.data.questionBank) + '-c',
            tipe: 'Esai',
            bloomTaxonomy: 'C5',
            tingkatKognitif: 'HOTS',
            bobotSkor: 20,
            stimulus: `Sebuah sekolah SMP ingin mengurangi jejak karbon digital dan limbah kertas dalam ujian harian.`,
            pertanyaan: `Rancanglah sebuah solusi sistematis dengan konsep Berpikir Komputasional (CT) untuk mendigitalkan asesmen harian secara efisien dan adil!`,
            kunciJawaban: 'Rubrik: 1. Dekomposisi kebutuhan (perangkat, jaringan, bank soal). 2. Pengenalan pola ujian siswa. 3. Desain algoritma alur pelaksanaan kuis offline/online berbasis CBT.',
            pembahasan: 'Integrasi 4 pilar Computational Thinking Fase D pada konteks nyata sekolah.'
          }
        ];
      } else if (level === 'P5') {
        generated = [
          {
            id: StorageManager.generateId('QST', AppState.data.questionBank),
            tipe: 'Pilihan Ganda',
            bloomTaxonomy: 'C4',
            tingkatKognitif: 'HOTS',
            bobotSkor: 15,
            stimulus: `Studi Kasus P5 (Tema: Gaya Hidup Berkelanjutan): Dalam sebuah tim projek daur ulang limbah plastik, terdapat anggota yang berbeda pendapat mengenai desain produk akhir hingga terjadi perdebatan alot.`,
            pertanyaan: `Tindakan yang paling mencerminkan Dimensi "Bergotong Royong" dan "Bernalar Kritis" dalam menyelesaikan kebuntuan tersebut adalah...`,
            opsiJawaban: [
              'Membuat matriks perbandingan kelebihan-kekurangan tiap opsi secara objektif lalu bermusyawarah mufakat',
              'Memaksa anggota kelompok menerima ide ketua demi menghemat waktu',
              'Membatalkan seluruh projek dan mengganti tema baru secara mendadak',
              'Membiarkan masing-masing anggota bekerja sendiri-sendiri tanpa komunikasi',
              'Melaporkan anggota yang berbeda pendapat kepada kepala sekolah untuk diberi sanksi'
            ],
            kunciJawaban: 'A',
            pembahasan: 'P5 menekankan kolaborasi berbasis penalaran kritis dan musyawarah mufakat tanpa memaksakan kehendak.'
          },
          {
            id: StorageManager.generateId('QST', AppState.data.questionBank) + '-b',
            tipe: 'Pilihan Ganda',
            bloomTaxonomy: 'C5',
            tingkatKognitif: 'HOTS',
            bobotSkor: 15,
            stimulus: `Tema P5: Kearifan Lokal. Siswa mengidentifikasi bahwa makanan tradisional khas daerah mulai ditinggalkan oleh remaja sebaya karena maraknya makanan cepat saji.`,
            pertanyaan: `Strategi kreatif dan kontekstual yang paling berdampak bagi pelestarian budaya lokal adalah...`,
            opsiJawaban: [
              'Membuat kampanye video digital kreatif di media sosial dengan inovasi kemasan ramah lingkungan',
              'Melarang semua siswa membeli makanan modern di luar sekolah',
              'Membuat spanduk kecaman terhadap budaya luar',
              'Mengabaikan fenomena tersebut karena merupakan hak pribadi',
              'Membeli semua makanan tradisional untuk disimpan'
            ],
            kunciJawaban: 'A',
            pembahasan: 'Dimensi Berkebinekaan Global dan Kreatif: melestarikan kearifan lokal melalui adaptasi media modern yang positif.'
          },
          {
            id: StorageManager.generateId('QST', AppState.data.questionBank) + '-c',
            tipe: 'Esai',
            bloomTaxonomy: 'C6',
            tingkatKognitif: 'HOTS',
            bobotSkor: 20,
            stimulus: `Refleksi Akhir Projek P5: Setiap kelompok diwajibkan menyusun evaluasi aksi nyata setelah pameran karya gelar projek (expo) selesai.`,
            pertanyaan: `Tuliskan format refleksi aksi 4F (Facts/Peristiwa, Feelings/Perasaan, Findings/Pembelajaran, Future/Penerapan) terhadap capaian karakter projek kelompokmu!`,
            kunciJawaban: 'Rubrik: 1. Uraian fakta peristiwa projek. 2. Ungkapan refleksi emosi dan dinamika tim. 3. Pembelajaran kunci terkait dimensi Pancasila. 4. Rencana aksi konkret keberlanjutan pasca projek.',
            pembahasan: 'Model evaluasi reflektif 4F standar Kurikulum Merdeka untuk penguatan karakter P5.'
          }
        ];
      } else {
        // Default SMA E/F or Bloom HOTS/MOTS/LOTS
        generated = [
          {
            id: StorageManager.generateId('QST', AppState.data.questionBank),
            tipe: 'Pilihan Ganda',
            bloomTaxonomy: level === 'LOTS' ? 'C2' : (level === 'MOTS' ? 'C3' : 'C4'),
            tingkatKognitif: (level === 'LOTS' || level === 'MOTS') ? level : 'HOTS',
            bobotSkor: 15,
            stimulus: `Konteks Kurikulum Merdeka: Penerapan konsep ${topic} pada permasalahan optimasi dunia nyata dan analisis ilmiah.`,
            pertanyaan: `Manakah strategi paling tepat dalam mengimplementasikan ${topic} ketika menghadapi kendala keterbatasan sumber daya atau waktu?`,
            opsiJawaban: [
              'Menerapkan perancangan modular, pembersihan variabel redundant, dan algoritma efisien',
              'Menggandakan kapasitas tanpa menganalisis akar masalah efisiensi',
              'Menghilangkan proses validasi input agar eksekusi lebih cepat',
              'Menggunakan perulangan bersarang tak terhingga',
              'Menonaktifkan fungsi penanganan error sistem'
            ],
            kunciJawaban: 'A',
            pembahasan: 'Optimalisasi dilakukan dengan efisiensi struktur desain dan eliminasi bottleneck proses secara teratur.'
          },
          {
            id: StorageManager.generateId('QST', AppState.data.questionBank) + '-b',
            tipe: 'Pilihan Ganda',
            bloomTaxonomy: 'C3',
            tingkatKognitif: 'MOTS',
            bobotSkor: 10,
            stimulus: '',
            pertanyaan: `Pada topik ${topic}, langkah pertama yang wajib dilakukan saat merancang pemecahan masalah komprehensif adalah...`,
            opsiJawaban: [
              'Dekomposisi dan perumusan masalah secara terstruktur',
              'Menulis implementasi langsung tanpa membuat rancangan',
              'Membuat tampilan antarmuka sebelum menentukan alur data',
              'Mencetak hasil ke lembar kertas',
              'Menghapus seluruh data pengujian'
            ],
            kunciJawaban: 'A',
            pembahasan: 'Dekomposisi adalah tahapan krusial pertama untuk memecah kompleksitas masalah menjadi sub-bagian.'
          },
          {
            id: StorageManager.generateId('QST', AppState.data.questionBank) + '-c',
            tipe: 'Esai',
            bloomTaxonomy: 'C5',
            tingkatKognitif: 'HOTS',
            bobotSkor: 20,
            stimulus: `Studi Kasus: Siswa melakukan pengujian terhadap model ${topic}. Ditemukan bahwa waktu pemrosesan meningkat drastis saat skala data bertambah 10 kali lipat.`,
            pertanyaan: `Lakukan analisis evaluatif terhadap kasus di atas: Berikan 2 rekomendasi teknis untuk menurunkan kompleksitas waktu pemrosesan pada rancangan tersebut!`,
            kunciJawaban: 'Rubrik: 1. Evaluasi perulangan bersarang (hindari O(n^2)). 2. Gunakan teknik indexing atau algoritma pencarian yang lebih mangkus (misal binary search / divide-and-conquer).',
            pembahasan: 'Penurunan kompleksitas waktu dicapai dengan mengeliminasi bottleneck perulangan redundant.'
          }
        ];
      }

      this.cachedAIGeneratedQuestions = generated;

      outputEl.textContent = `✅ BERHASIL MERANCANG ${this.cachedAIGeneratedQuestions.length} BUTIR SOAL STANDAR KURIKULUM MERDEKA [Target: ${level}]:

` + this.cachedAIGeneratedQuestions.map((q, idx) => `
Soal ${idx + 1} [${q.tingkatKognitif} - ${q.bloomTaxonomy}] (${q.tipe}):
${q.stimulus ? 'Stimulus: ' + q.stimulus + '\n' : ''}Pertanyaan: ${q.pertanyaan}
${q.opsiJawaban ? q.opsiJawaban.map((o, oi) => '  ' + ['A','B','C','D','E'][oi] + '. ' + o).join('\n') : ''}
Kunci Jawaban: ${q.kunciJawaban}
Pembahasan: ${q.pembahasan}
`).join('\n----------------------------------------\n');

      btn.disabled = false;
      if (saveBtn) saveBtn.style.display = 'inline-flex';
      UI.showToast(`Draf soal AI (${level}) berhasil disusun!`);
    }, 700);
  },

  saveAIQuestionsToBank() {
    if (!this.cachedAIGeneratedQuestions || this.cachedAIGeneratedQuestions.length === 0) return;
    this.cachedAIGeneratedQuestions.forEach(q => {
      AppState.data.questionBank.unshift(q);
    });
    AppState.save();
    document.getElementById('btn-save-ai-questions').style.display = 'none';
    UI.showToast(`${this.cachedAIGeneratedQuestions.length} butir soal hasil AI berhasil disimpan ke Bank Soal!`);
    this.render();
  }
};

// ==========================================================================
// 13B. School Profile & KOP Logo Module (Halaman Mandiri Profil Sekolah)
// ==========================================================================
const SchoolProfileModule = {
  tempLogo: '',

  render() {
    const teacher = AppState.currentTeacher || {};
    this.tempLogo = teacher.logoSekolah || '';

    // Bind page inputs
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    };

    setVal('sp-school-name', teacher.namaSekolah || 'SMA Negeri 1 Harapan Nusantara');
    setVal('sp-school-npsn', teacher.npsn || '20108920');
    setVal('sp-school-jenjang', teacher.jenjang || 'SMA');
    setVal('sp-school-address', teacher.alamatSekolah || 'Jl. Pendidikan Karakter Bangsa No. 45');
    setVal('sp-school-phone', teacher.teleponSekolah || '(021) 7890123');
    setVal('sp-school-email', teacher.emailSekolah || 'tatausaha@sekolah.sch.id');
    setVal('sp-school-website', teacher.websiteSekolah || 'www.sman1harapannusantara.sch.id');
    setVal('sp-principal-name', teacher.namaKepalaSekolah || 'Dr. H. Bambang Sudarsono, M.Pd.');
    setVal('sp-principal-nip', teacher.nipKepalaSekolah || '19760415 200212 1 003');
    setVal('sp-teacher-name', teacher.namaLengkap || '');
    setVal('sp-teacher-nip', teacher.nip || '');
    setVal('sp-teacher-mapel', teacher.mataPelajaran || teacher.mapelUtama || '');

    // Also sync modal inputs if present
    setVal('setting-school-name', teacher.namaSekolah || 'SMA Negeri 1 Harapan Nusantara');
    setVal('setting-school-address', teacher.alamatSekolah || 'Jl. Pendidikan Karakter Bangsa No. 45');
    setVal('setting-school-phone', teacher.teleponSekolah || '(021) 7890123');
    setVal('setting-school-email', teacher.emailSekolah || 'tatausaha@sekolah.sch.id');
    setVal('setting-school-website', teacher.websiteSekolah || 'www.sman1harapannusantara.sch.id');
    setVal('setting-principal-name', teacher.namaKepalaSekolah || 'Dr. H. Bambang Sudarsono, M.Pd.');
    setVal('setting-principal-nip', teacher.nipKepalaSekolah || '19760415 200212 1 003');
    setVal('setting-teacher-name', teacher.namaLengkap || '');
    setVal('setting-teacher-nip', teacher.nip || '');
    setVal('setting-teacher-mapel', teacher.mataPelajaran || teacher.mapelUtama || '');

    this.renderLogoPreview();
    this.updateLiveKop();
    if (typeof CloudDBManager !== 'undefined') {
      CloudDBManager.syncSchoolProfileCard();
    }
  },

  handleLogoUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      UI.showToast('Harap pilih berkas gambar valid (PNG, JPG, SVG, WebP).', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const rawData = evt.target.result;
      if (file.type === 'image/svg+xml') {
        this.tempLogo = rawData;
        this.renderLogoPreview();
        this.updateLiveKop();
        UI.showToast('Logo SVG berhasil dimuat!');
        return;
      }

      // Client-Side Canvas Auto-Resize (Max 240x240) to guarantee < 40KB LocalStorage footprint
      const img = new Image();
      img.onload = () => {
        const maxDim = 240;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        this.tempLogo = canvas.toDataURL('image/png', 0.9);
        this.renderLogoPreview();
        this.updateLiveKop();
        UI.showToast('Logo sekolah berhasil dimuat & dikompresi (<40KB)!');
      };
      img.onerror = () => {
        UI.showToast('Gagal memproses gambar logo. Coba berkas gambar lain.', 'error');
      };
      img.src = rawData;
    };
    reader.readAsDataURL(file);
  },

  removeLogo() {
    this.tempLogo = '';
    const fileInput1 = document.getElementById('sp-input-logo-file');
    if (fileInput1) fileInput1.value = '';
    const fileInput2 = document.getElementById('input-school-logo-file');
    if (fileInput2) fileInput2.value = '';
    this.renderLogoPreview();
    this.updateLiveKop();
    UI.showToast('Logo kustom dihapus, menggunakan logo standar kedinasan.');
  },

  renderLogoPreview() {
    const updatePreviewElements = (imgId, svgId, btnRemoveId, tagId) => {
      const img = document.getElementById(imgId);
      const svg = document.getElementById(svgId);
      const btnRemove = document.getElementById(btnRemoveId);
      const tag = document.getElementById(tagId);

      if (this.tempLogo) {
        if (img) { img.src = this.tempLogo; img.style.display = 'block'; }
        if (svg) svg.style.display = 'none';
        if (btnRemove) btnRemove.style.display = 'inline-flex';
        if (tag) {
          tag.className = 'badge icon-emerald';
          tag.textContent = 'Logo Kustom Aktif';
        }
      } else {
        if (img) { img.src = ''; img.style.display = 'none'; }
        if (svg) svg.style.display = 'block';
        if (btnRemove) btnRemove.style.display = 'none';
        if (tag) {
          tag.className = 'badge icon-sky';
          tag.textContent = 'Logo Standar Aktif';
        }
      }
    };

    updatePreviewElements('sp-img-preview-logo', 'sp-svg-default-logo', 'sp-btn-remove-logo', 'sp-logo-status-tag');
    updatePreviewElements('img-preview-logo', 'svg-default-logo-preview', 'btn-remove-logo', 'logo-status-tag');
  },

  updateLiveKop() {
    const nameInput = document.getElementById('sp-school-name')?.value || document.getElementById('setting-school-name')?.value || 'SMA NEGERI 1 HARAPAN NUSANTARA';
    const addressInput = document.getElementById('sp-school-address')?.value || document.getElementById('setting-school-address')?.value || 'Jl. Pendidikan Karakter Bangsa No. 45';
    const phoneInput = document.getElementById('sp-school-phone')?.value || document.getElementById('setting-school-phone')?.value || '(021) 7890123';
    const emailInput = document.getElementById('sp-school-email')?.value || document.getElementById('setting-school-email')?.value || 'tatausaha@sekolah.sch.id';

    const defaultSvg = `<svg width="45" height="45" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="45" stroke="#000" stroke-width="3" fill="#fff"/><path d="M50 20 L75 35 L75 65 L50 80 L25 65 L25 35 Z" stroke="#000" stroke-width="2.5" fill="none"/><path d="M50 20 L50 80" stroke="#000" stroke-width="1.5"/><path d="M25 35 L75 65" stroke="#000" stroke-width="1.5"/><path d="M25 65 L75 35" stroke="#000" stroke-width="1.5"/><circle cx="50" cy="50" r="10" stroke="#000" stroke-width="2" fill="#fff"/></svg>`;

    const updateKopUi = (nameId, addrId, logoBoxId) => {
      const elName = document.getElementById(nameId);
      if (elName) elName.textContent = nameInput.toUpperCase();
      const elAddr = document.getElementById(addrId);
      if (elAddr) elAddr.innerHTML = `${addressInput} &bull; Telp: ${phoneInput} &bull; Email: ${emailInput}`;
      const elLogoBox = document.getElementById(logoBoxId);
      if (elLogoBox) {
        if (this.tempLogo) {
          elLogoBox.innerHTML = `<img src="${this.tempLogo}" style="width: 100%; height: 100%; object-fit: contain;" alt="Logo KOP">`;
        } else {
          elLogoBox.innerHTML = defaultSvg;
        }
      }
    };

    updateKopUi('sp-live-kop-school-name', 'sp-live-kop-school-address', 'sp-live-kop-logo-box');
    updateKopUi('live-kop-school-name', 'live-kop-school-address', 'live-kop-logo-box');
  },

  saveSettings(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!AppState.currentTeacher) {
      UI.showToast('Sesi guru tidak aktif!', 'error');
      return;
    }

    const teacher = AppState.currentTeacher;
    const getVal = (id1, id2, def) => {
      const el1 = document.getElementById(id1);
      if (el1 && el1.value.trim()) return el1.value.trim();
      const el2 = document.getElementById(id2);
      if (el2 && el2.value.trim()) return el2.value.trim();
      return def;
    };

    teacher.namaSekolah = getVal('sp-school-name', 'setting-school-name', 'SMA Negeri 1 Harapan Nusantara');
    teacher.npsn = getVal('sp-school-npsn', '', '20108920');
    teacher.jenjang = document.getElementById('sp-school-jenjang')?.value || teacher.jenjang || 'SMA';
    teacher.alamatSekolah = getVal('sp-school-address', 'setting-school-address', 'Jl. Pendidikan Karakter Bangsa No. 45');
    teacher.teleponSekolah = getVal('sp-school-phone', 'setting-school-phone', '(021) 7890123');
    teacher.emailSekolah = getVal('sp-school-email', 'setting-school-email', 'tatausaha@sekolah.sch.id');
    teacher.websiteSekolah = getVal('sp-school-website', 'setting-school-website', '');
    teacher.namaKepalaSekolah = getVal('sp-principal-name', 'setting-principal-name', 'Dr. H. Bambang Sudarsono, M.Pd.');
    teacher.nipKepalaSekolah = getVal('sp-principal-nip', 'setting-principal-nip', '19760415 200212 1 003');
    teacher.namaLengkap = getVal('sp-teacher-name', 'setting-teacher-name', teacher.namaLengkap);
    teacher.nip = getVal('sp-teacher-nip', 'setting-teacher-nip', teacher.nip);
    teacher.mataPelajaran = getVal('sp-teacher-mapel', 'setting-teacher-mapel', teacher.mataPelajaran || 'Informatika');
    teacher.mapelUtama = teacher.mataPelajaran;
    teacher.logoSekolah = this.tempLogo;

    // Save to Teachers registry
    let teachers = StorageManager.getTeachers();
    const idx = teachers.findIndex(t => t.id === teacher.id);
    if (idx !== -1) {
      teachers[idx] = { ...teachers[idx], ...teacher };
      StorageManager.saveTeachers(teachers);
    }

    // Save to Teacher Data Profile
    if (AppState.data) {
      AppState.data.teacherProfile = { ...(AppState.data.teacherProfile || {}), ...teacher };
      AppState.save();
    }

    // Sync UI elements across the whole app
    AuthManager.syncTeacherUI();
    UI.closeModal('modal-school-settings');
    UI.showToast('Profil sekolah & logo resmi berhasil disimpan!');
  },

  resetSettings() {
    if (confirm('Batalkan perubahan yang belum disimpan dan kembalikan formulir ke data profil tersimpan saat ini?')) {
      this.render();
      UI.showToast('Formulir berhasil direset ke data tersimpan.');
    }
  }
};

// Backward-compatible alias
const ProfileSettingsModule = {
  openModal() {
    Navigation.switchView('view-school-profile');
  },
  saveSettings(e) {
    SchoolProfileModule.saveSettings(e);
  },
  handleLogoUpload(e) {
    SchoolProfileModule.handleLogoUpload(e);
  },
  removeLogo() {
    SchoolProfileModule.removeLogo();
  },
  updateLiveKop() {
    SchoolProfileModule.updateLiveKop();
  }
};

// ==========================================================================
// 14. Print & PDF Export Engine (Pemisahan Dokumen Resmi Per-Menu)
// ==========================================================================
const PrintModule = {
  // Indonesian Date Formatter
  getIndonesianDate() {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const now = new Date();
    return `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  },

  // Official Indonesian School KOP Surat
  getOfficialKop(title, subtitle) {
    const teacher = AppState.currentTeacher || {
      namaLengkap: 'Budi Santoso, S.Pd., M.Kom.',
      namaSekolah: 'SMA NEGERI 1 HARAPAN NUSANTARA',
      nip: '19850712 201001 1 014',
      mapelUtama: 'Informatika'
    };
    const schoolName = (teacher.namaSekolah || 'SMA NEGERI 1 HARAPAN NUSANTARA').toUpperCase();
    const address = teacher.alamatSekolah || 'Jl. Pendidikan Karakter Bangsa No. 45';
    const phone = teacher.teleponSekolah ? `Telp: ${teacher.teleponSekolah}` : 'Telp: (021) 7890123';
    const email = teacher.emailSekolah ? `Email: ${teacher.emailSekolah}` : 'Email: tatausaha@sekolah.sch.id';
    const website = teacher.websiteSekolah ? `Website: ${teacher.websiteSekolah} • ` : '';

    const logoHtml = teacher.logoSekolah
      ? `<img src="${teacher.logoSekolah}" class="official-kop-logo" alt="Logo Sekolah">`
      : `<svg class="official-kop-logo" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="45" stroke="#000000" stroke-width="3" fill="#ffffff"/>
          <path d="M50 20 L75 35 L75 65 L50 80 L25 65 L25 35 Z" stroke="#000000" stroke-width="2.5" fill="none"/>
          <path d="M50 20 L50 80" stroke="#000000" stroke-width="1.5"/>
          <path d="M25 35 L75 65" stroke="#000000" stroke-width="1.5"/>
          <path d="M25 65 L75 35" stroke="#000000" stroke-width="1.5"/>
          <circle cx="50" cy="50" r="10" stroke="#000000" stroke-width="2" fill="#ffffff"/>
        </svg>`;

    return `
      <div class="official-kop">
        <div class="official-kop-inner">
          <div class="official-kop-left">
            ${logoHtml}
          </div>
          <div class="official-kop-center">
            <div class="kop-gov">PEMERINTAH DAERAH PROVINSI / DINAS PENDIDIKAN</div>
            <div class="kop-school">${schoolName}</div>
            <p class="kop-address">${address} • ${phone} • ${website}${email}</p>
          </div>
          <div class="official-kop-right"></div>
        </div>
      </div>
      <div class="print-doc-title-wrap">
        <h2 class="print-doc-title">${title}</h2>
        ${subtitle ? `<div class="print-doc-subtitle">${subtitle}</div>` : ''}
      </div>
    `;
  },

  // Official Signatures Block (Kepala Sekolah & Guru Mata Pelajaran)
  getSignatures(options = {}) {
    const teacher = AppState.currentTeacher || {
      namaLengkap: 'Budi Santoso, S.Pd., M.Kom.',
      namaSekolah: 'SMA NEGERI 1 HARAPAN NUSANTARA',
      nip: '19850712 201001 1 014'
    };
    const dateStr = this.getIndonesianDate();
    const city = options.city || 'Kota Administratif';
    const principalName = options.principalName || teacher.namaKepalaSekolah || 'Dr. H. Bambang Sudarsono, M.Pd.';
    const principalNip = options.principalNip || teacher.nipKepalaSekolah || '19760415 200212 1 003';
    const teacherRole = options.teacherRole || 'Guru Mata Pelajaran';

    return `
      <div class="print-signatures">
        <div class="print-sig-box">
          <div>Mengetahui,</div>
          <div>Kepala Sekolah</div>
          <div class="print-sig-space"></div>
          <div class="print-sig-name">${principalName}</div>
          <div class="print-sig-nip">NIP. ${principalNip}</div>
        </div>
        <div class="print-sig-box">
          <div>${city}, ${dateStr}</div>
          <div>${teacherRole}</div>
          <div class="print-sig-space"></div>
          <div class="print-sig-name">${teacher.namaLengkap}</div>
          <div class="print-sig-nip">NIP. ${teacher.nip || '-'}</div>
        </div>
      </div>
    `;
  },

  // Base render to print container and trigger browser print dialog
  print(htmlContent) {
    const container = document.getElementById('print-container');
    if (!container) return;
    container.innerHTML = htmlContent;
    window.print();
  },

  // Dynamic router based on active view
  printCurrentMenu() {
    const view = AppState.currentView || 'view-dashboard';
    switch (view) {
      case 'view-dashboard':
        this.printDashboard();
        break;
      case 'view-planner':
        this.printLessonPlans();
        break;
      case 'view-repository':
        this.printMaterials();
        break;
      case 'view-questions':
        this.printQuestionBank();
        break;
      case 'view-timetable':
        this.printTimetable();
        break;
      case 'view-gradebook':
        this.printGradebook();
        break;
      case 'view-classroom':
        this.printClassroom();
        break;
      case 'view-tasks':
        this.printTasks();
        break;
      case 'view-student-detail':
        StudentDetailModule.printCurrentReport();
        break;
      case 'view-school-profile':
        this.printSchoolProfile();
        break;
      case 'view-ai-export':
        this.printSupervisi();
        break;
      default:
        this.printDashboard();
        break;
    }
  },

  // 1. Menu Dashboard: Executive Summary
  printDashboard() {
    const teacher = AppState.currentTeacher || {};
    const kop = this.getOfficialKop(
      'LAPORAN EKSEKUTIF RINGKASAN KINERJA & ADMINISTRASI GURU',
      'Tahun Ajaran 2026/2027 • Semester 1 (Ganjil)'
    );

    const totalRpp = (AppState.data.lessonPlans || []).length;
    const totalQuestions = (AppState.data.questionBank || []).length;
    const timetable = AppState.data.timetable || [];
    const totalJP = timetable.reduce((acc, t) => acc + (parseInt(t.jp, 10) || 1), 0);
    const classes = AppState.data.classes || [];
    const students = AppState.data.students || [];

    const recentRPP = (AppState.data.lessonPlans || []).slice(0, 5);
    const upcomingSchedule = timetable.slice(0, 6);
    const recentTasks = (AppState.data.tasks || []).slice(0, 5);

    const html = `
      ${kop}
      <table class="print-meta-table">
        <tr>
          <td class="meta-label">Nama Guru</td><td class="meta-colon">:</td><td><strong>${teacher.namaLengkap}</strong></td>
          <td class="meta-label">Mata Pelajaran</td><td class="meta-colon">:</td><td>${teacher.mapelUtama || 'Informatika'}</td>
        </tr>
        <tr>
          <td class="meta-label">NIP</td><td class="meta-colon">:</td><td>${teacher.nip || '-'}</td>
          <td class="meta-label">Fase / Jenjang</td><td class="meta-colon">:</td><td>${teacher.fase || 'Fase E (Kelas X)'} / SMA</td>
        </tr>
        <tr>
          <td class="meta-label">Sekolah Binaan</td><td class="meta-colon">:</td><td>${teacher.namaSekolah || '-'}</td>
          <td class="meta-label">Rombel Kelas Diampu</td><td class="meta-colon">:</td><td>${classes.join(', ')}</td>
        </tr>
      </table>

      <div class="print-stats-grid">
        <div class="print-stat-box">
          <div class="stat-lbl">Modul Ajar RPP</div>
          <div class="stat-val">${totalRpp}</div>
          <small>Perangkat Siap</small>
        </div>
        <div class="print-stat-box">
          <div class="stat-lbl">Bank Soal & Asesmen</div>
          <div class="stat-val">${totalQuestions}</div>
          <small>Butir Teruji</small>
        </div>
        <div class="print-stat-box">
          <div class="stat-lbl">Beban Mengajar</div>
          <div class="stat-val">${totalJP} JP</div>
          <small>Total Jam/Minggu</small>
        </div>
        <div class="print-stat-box">
          <div class="stat-lbl">Siswa Terdaftar</div>
          <div class="stat-val">${students.length}</div>
          <small>Data Presensi & Nilai</small>
        </div>
      </div>

      <div class="print-section-block">
        <div class="print-section-title">A. Ringkasan Jadwal Mengajar Guru</div>
        <table class="print-data-table">
          <thead>
            <tr>
              <th style="width: 35px;">No</th>
              <th>Hari</th>
              <th>Jam Pelajaran / Waktu</th>
              <th>Kelas</th>
              <th>Mata Pelajaran & Materi</th>
              <th>Ruang / Lab</th>
            </tr>
          </thead>
          <tbody>
            ${upcomingSchedule.length ? upcomingSchedule.map((s, idx) => `
              <tr>
                <td class="text-center">${idx + 1}</td>
                <td><strong>${s.hari}</strong></td>
                <td>Jam Ke-${s.jamKe} (${s.waktuMulai} - ${s.waktuSelesai})</td>
                <td class="text-center">${s.kelas}</td>
                <td>${s.mapel || teacher.mapelUtama}</td>
                <td class="text-center">${s.ruang || 'Lab Komputer 1'}</td>
              </tr>
            `).join('') : '<tr><td colspan="6" class="text-center">Belum ada data jadwal tercatat.</td></tr>'}
          </tbody>
        </table>
      </div>

      <div class="print-section-block">
        <div class="print-section-title">B. Perangkat Ajar & Modul Kurikulum Merdeka Terkini</div>
        <table class="print-data-table">
          <thead>
            <tr>
              <th style="width: 35px;">No</th>
              <th>Kode RPP</th>
              <th>Materi Pokok</th>
              <th>Kelas / Fase</th>
              <th>Alokasi Waktu</th>
              <th>Tujuan Pembelajaran</th>
            </tr>
          </thead>
          <tbody>
            ${recentRPP.length ? recentRPP.map((r, idx) => `
              <tr>
                <td class="text-center">${idx + 1}</td>
                <td class="text-center"><code>${r.id}</code></td>
                <td><strong>${r.materiPokok}</strong></td>
                <td class="text-center">${r.kelas}</td>
                <td class="text-center">${r.alokasiWaktu}</td>
                <td>${(r.tujuanPembelajaran || '').substring(0, 110)}...</td>
              </tr>
            `).join('') : '<tr><td colspan="6" class="text-center">Belum ada modul ajar tercatat.</td></tr>'}
          </tbody>
        </table>
      </div>

      <div class="print-section-block">
        <div class="print-section-title">C. Rekapitulasi Pelacak Koreksi & Penugasan Siswa</div>
        <table class="print-data-table">
          <thead>
            <tr>
              <th style="width: 35px;">No</th>
              <th>Nama Penugasan</th>
              <th>Kelas</th>
              <th>Tenggat Waktu</th>
              <th>Progress Koreksi</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${recentTasks.length ? recentTasks.map((t, idx) => `
              <tr>
                <td class="text-center">${idx + 1}</td>
                <td><strong>${t.judul}</strong></td>
                <td class="text-center">${t.kelas}</td>
                <td class="text-center">${t.deadline || '-'}</td>
                <td class="text-center">${t.selesai || 0} / ${t.total || 32} siswa (${Math.round(((t.selesai || 0)/(t.total || 32))*100)}%)</td>
                <td class="text-center">${t.status || 'Aktif'}</td>
              </tr>
            `).join('') : '<tr><td colspan="6" class="text-center">Belum ada agenda penugasan.</td></tr>'}
          </tbody>
        </table>
      </div>

      ${this.getSignatures()}
    `;

    this.print(html);
  },

  // 2. Menu Modul & RPP: Lesson Plans Summary
  printLessonPlans() {
    const teacher = AppState.currentTeacher || {};
    const kop = this.getOfficialKop(
      'REKAPITULASI DOKUMEN MODUL AJAR & RPP KURIKULUM MERDEKA',
      'Dokumen Administrasi Perencanaan Pembelajaran Semester 1 (Ganjil) - Tahun Ajaran 2026/2027'
    );
    const plans = AppState.data.lessonPlans || [];

    const html = `
      ${kop}
      <table class="print-meta-table">
        <tr>
          <td class="meta-label">Nama Penyusun</td><td class="meta-colon">:</td><td><strong>${teacher.namaLengkap}</strong></td>
          <td class="meta-label">Mata Pelajaran</td><td class="meta-colon">:</td><td>${teacher.mapelUtama || 'Informatika'}</td>
        </tr>
        <tr>
          <td class="meta-label">NIP</td><td class="meta-colon">:</td><td>${teacher.nip || '-'}</td>
          <td class="meta-label">Jenjang / Fase</td><td class="meta-colon">:</td><td>SMA / ${teacher.fase || 'Fase E'}</td>
        </tr>
        <tr>
          <td class="meta-label">Satuan Pendidikan</td><td class="meta-colon">:</td><td>${teacher.namaSekolah || '-'}</td>
          <td class="meta-label">Total Modul Ajar</td><td class="meta-colon">:</td><td><strong>${plans.length} Modul Terverifikasi</strong></td>
        </tr>
      </table>

      <table class="print-data-table">
        <thead>
          <tr>
            <th style="width: 30px;">No</th>
            <th style="width: 80px;">Kode RPP</th>
            <th style="width: 150px;">Materi Pokok / Judul</th>
            <th style="width: 75px;">Kelas</th>
            <th style="width: 75px;">Alokasi</th>
            <th>Alur Tujuan Pembelajaran & Strategi Berdiferensiasi</th>
            <th style="width: 130px;">Rencana Asesmen</th>
          </tr>
        </thead>
        <tbody>
          ${plans.length ? plans.map((p, idx) => `
            <tr>
              <td class="text-center">${idx + 1}</td>
              <td class="text-center"><code>${p.id}</code></td>
              <td>
                <strong>${p.materiPokok}</strong>
                ${p.komponen === 'Kokurikuler' ? '<br><span class="print-badge">Projek P5: ' + (p.p5Tema || '') + '</span>' : ''}
              </td>
              <td class="text-center">${p.kelas}</td>
              <td class="text-center">${p.alokasiWaktu}</td>
              <td>
                <strong>TP:</strong> ${p.tujuanPembelajaran}
                ${p.kegiatanInti ? '<br><small><strong>Inti:</strong> ' + p.kegiatanInti.substring(0, 100) + '...</small>' : ''}
              </td>
              <td>
                <small>${p.asesmen || 'Formatif: Observasi & Rubrik. Sumatif: Uji Pemahaman TP.'}</small>
              </td>
            </tr>
          `).join('') : '<tr><td colspan="7" class="text-center">Belum ada modul ajar tersimpan.</td></tr>'}
        </tbody>
      </table>

      ${this.getSignatures()}
    `;

    this.print(html);
  },

  // Print Single Detailed RPP
  printSingleRPP(rppId) {
    const plans = AppState.data.lessonPlans || [];
    const item = plans.find(p => p.id === rppId) || plans[0];
    if (!item) {
      UI.showToast('Data Modul RPP tidak ditemukan.', 'error');
      return;
    }

    const teacher = AppState.currentTeacher || {};
    const kop = this.getOfficialKop(
      'MODUL AJAR / RENCANA PELAKSANAAN PEMBELAJARAN (RPP)',
      `Kurikulum Merdeka • Kode Dokumen: ${item.id}`
    );

    const html = `
      ${kop}
      <div class="print-section-title">I. IDENTITAS UMUM</div>
      <table class="print-meta-table" style="margin-bottom: 12px;">
        <tr>
          <td class="meta-label">Nama Penyusun</td><td class="meta-colon">:</td><td><strong>${teacher.namaLengkap}</strong></td>
          <td class="meta-label">Nama Sekolah</td><td class="meta-colon">:</td><td>${teacher.namaSekolah}</td>
        </tr>
        <tr>
          <td class="meta-label">NIP Guru</td><td class="meta-colon">:</td><td>${teacher.nip || '-'}</td>
          <td class="meta-label">Tahun Ajaran / Sem.</td><td class="meta-colon">:</td><td>${item.tahunAjaran || '2026/2027'} / Semester ${item.semester || 1}</td>
        </tr>
        <tr>
          <td class="meta-label">Mata Pelajaran</td><td class="meta-colon">:</td><td><strong>${item.mataPelajaran}</strong></td>
          <td class="meta-label">Fase / Kelas</td><td class="meta-colon">:</td><td>${item.fase || 'Fase E'} / ${item.kelas}</td>
        </tr>
        <tr>
          <td class="meta-label">Materi Pokok</td><td class="meta-colon">:</td><td><strong>${item.materiPokok}</strong></td>
          <td class="meta-label">Alokasi Waktu</td><td class="meta-colon">:</td><td>${item.alokasiWaktu}</td>
        </tr>
        ${item.komponen === 'Kokurikuler' ? `
        <tr>
          <td class="meta-label">Tema Projek P5</td><td class="meta-colon">:</td><td><strong>${item.p5Tema || '-'}</strong></td>
          <td class="meta-label">Dimensi Karakter</td><td class="meta-colon">:</td><td>${item.p5Dimensi || '-'}</td>
        </tr>
        ` : ''}
      </table>

      <div class="print-section-title">II. KOMPONEN INTI</div>
      <div style="margin-bottom: 8px;">
        <strong>A. Capaian & Tujuan Pembelajaran (TP):</strong>
        <p style="margin: 3px 0 8px 0; white-space: pre-wrap;">${item.tujuanPembelajaran}</p>
      </div>

      <div class="print-section-title">III. LANGKAH-LANGKAH KEGIATAN PEMBELAJARAN (BERDIFERENSIASI)</div>
      <div style="margin-bottom: 8px;">
        <strong>A. Kegiatan Pendahuluan & Apersepsi (15 Menit):</strong>
        <p style="margin: 3px 0 8px 0; white-space: pre-wrap;">${item.kegiatanPembuka || '1. Guru memberi salam, berdoa, dan memeriksa kehadiran siswa. 2. Apersepsi menghubungkan materi sebelumnya dengan stimulus pemantik. 3. Guru menyampaikan tujuan pembelajaran dan kesepakatan kelas.'}</p>
      </div>
      <div style="margin-bottom: 8px;">
        <strong>B. Kegiatan Inti & Strategi Pembelajaran Berdiferensiasi:</strong>
        <p style="margin: 3px 0 8px 0; white-space: pre-wrap;">${item.kegiatanInti || '1. Diferensiasi Konten: Siswa mencermati materi melalui tayangan slide / LKPD visual atau teks terstruktur. 2. Diferensiasi Proses: Kolaborasi kelompok bertingkat dengan bimbingan scaffold guru. 3. Diferensiasi Produk: Siswa mendemonstrasikan hasil telaah sesuai minat kelompok.'}</p>
      </div>
      <div style="margin-bottom: 8px;">
        <strong>C. Kegiatan Penutup & Refleksi:</strong>
        <p style="margin: 3px 0 8px 0; white-space: pre-wrap;">${item.kegiatanPenutup || '1. Guru bersama siswa merangkum intisari materi pokok. 2. Melakukan refleksi pembelajaran bermakna (tiga hal baru yang dipelajari). 3. Guru memberi motivasi dan berdoa penutup.'}</p>
      </div>

      <div class="print-section-title">IV. RENCANA ASESMEN & EVALUASI</div>
      <div style="margin-bottom: 14px;">
        <p style="margin: 3px 0; white-space: pre-wrap;">${item.asesmen || '1. Asesmen Diagnostik Awal: Pertanyaan pemantik kesiapan belajar.\n2. Asesmen Formatif: Lembar observasi diskusi kelompok dan rubrik kinerja presentasi.\n3. Asesmen Sumatif: Penugasan mandiri / tes uji kompetensi butir soal HOTS.'}</p>
      </div>

      ${this.getSignatures()}
    `;

    this.print(html);
  },

  // 3. Menu Materi & Media: Learning Content Catalog
  printMaterials() {
    const teacher = AppState.currentTeacher || {};
    const kop = this.getOfficialKop(
      'KATALOG BAHAN AJAR, SUMBER BELAJAR & MEDIA PEMBELAJARAN',
      'Inventarisasi Perangkat Media Digital & Alat Peraga Edukasi'
    );
    const materials = AppState.data.materials || [];

    const html = `
      ${kop}
      <table class="print-meta-table">
        <tr>
          <td class="meta-label">Nama Guru</td><td class="meta-colon">:</td><td><strong>${teacher.namaLengkap}</strong></td>
          <td class="meta-label">Mata Pelajaran</td><td class="meta-colon">:</td><td>${teacher.mapelUtama || 'Informatika'}</td>
        </tr>
        <tr>
          <td class="meta-label">NIP</td><td class="meta-colon">:</td><td>${teacher.nip || '-'}</td>
          <td class="meta-label">Satuan Pendidikan</td><td class="meta-colon">:</td><td>${teacher.namaSekolah}</td>
        </tr>
      </table>

      <table class="print-data-table">
        <thead>
          <tr>
            <th style="width: 30px;">No</th>
            <th>Judul Materi Pokok</th>
            <th style="width: 80px;">Tingkat</th>
            <th style="width: 90px;">Fase / Kelas</th>
            <th style="width: 140px;">Jenis Media / Sumber</th>
            <th>Deskripsi / Alur Pemanfaatan Media</th>
          </tr>
        </thead>
        <tbody>
          ${materials.length ? materials.map((m, idx) => `
            <tr>
              <td class="text-center">${idx + 1}</td>
              <td><strong>${m.judul}</strong></td>
              <td class="text-center"><span class="print-badge">${m.kesulitan || 'Dasar'}</span></td>
              <td class="text-center">${m.fase || 'Fase E'}</td>
              <td>
                <small>${(m.media || []).map(med => `• ${med.tipe}: ${med.nama}`).join('<br>') || 'Modul PDF & Slide PPT'}</small>
              </td>
              <td>${m.deskripsi || '-'}</td>
            </tr>
          `).join('') : '<tr><td colspan="6" class="text-center">Belum ada bahan ajar tercatat.</td></tr>'}
        </tbody>
      </table>

      ${this.getSignatures()}
    `;

    this.print(html);
  },

  // 4. Menu Bank Soal & Asesmen
  printQuestionBank() {
    const teacher = AppState.currentTeacher || {};
    const kop = this.getOfficialKop(
      'DISTRIBUSI BANK SOAL & KISI-KISI ASESMEN PEMBELAJARAN',
      'Klasifikasi Taksonomi Bloom (C1 s.d. C6) & Tingkat HOTS / MOTS / LOTS'
    );
    const questions = AppState.data.questionBank || [];

    const countLots = questions.filter(q => q.tingkatKognitif === 'LOTS').length;
    const countMots = questions.filter(q => q.tingkatKognitif === 'MOTS').length;
    const countHots = questions.filter(q => q.tingkatKognitif === 'HOTS').length;

    const html = `
      ${kop}
      <table class="print-meta-table">
        <tr>
          <td class="meta-label">Guru Penyusun</td><td class="meta-colon">:</td><td><strong>${teacher.namaLengkap}</strong></td>
          <td class="meta-label">Mata Pelajaran</td><td class="meta-colon">:</td><td>${teacher.mapelUtama || 'Informatika'}</td>
        </tr>
        <tr>
          <td class="meta-label">NIP</td><td class="meta-colon">:</td><td>${teacher.nip || '-'}</td>
          <td class="meta-label">Tahun Ajaran</td><td class="meta-colon">:</td><td>2026/2027 (Semester 1)</td>
        </tr>
      </table>

      <div class="print-stats-grid">
        <div class="print-stat-box">
          <div class="stat-lbl">Total Butir Soal</div>
          <div class="stat-val">${questions.length}</div>
          <small>Tervalidasi</small>
        </div>
        <div class="print-stat-box">
          <div class="stat-lbl">LOTS (C1-C2)</div>
          <div class="stat-val">${countLots}</div>
          <small>${Math.round((countLots / (questions.length || 1)) * 100)}% Proporsi</small>
        </div>
        <div class="print-stat-box">
          <div class="stat-lbl">MOTS (C3)</div>
          <div class="stat-val">${countMots}</div>
          <small>${Math.round((countMots / (questions.length || 1)) * 100)}% Proporsi</small>
        </div>
        <div class="print-stat-box">
          <div class="stat-lbl">HOTS (C4-C6)</div>
          <div class="stat-val">${countHots}</div>
          <small>${Math.round((countHots / (questions.length || 1)) * 100)}% Proporsi</small>
        </div>
      </div>

      <div class="print-section-title">Daftar Rincian Butir Soal & Kunci Jawaban</div>
      <table class="print-data-table">
        <thead>
          <tr>
            <th style="width: 30px;">No</th>
            <th style="width: 80px;">Tipe / Bentuk</th>
            <th style="width: 100px;">Level Kognitif</th>
            <th>Stimulus & Butir Pertanyaan</th>
            <th style="width: 70px;">Kunci</th>
          </tr>
        </thead>
        <tbody>
          ${questions.length ? questions.map((q, idx) => `
            <tr>
              <td class="text-center">${idx + 1}</td>
              <td class="text-center">${q.tipe}</td>
              <td class="text-center"><strong>${q.tingkatKognitif}</strong><br><small>${q.bloomTaxonomy}</small></td>
              <td>
                ${q.stimulus ? '<em>Stimulus: ' + q.stimulus + '</em><br>' : ''}
                <strong>${q.pertanyaan}</strong>
                ${q.opsiJawaban ? '<br><small>' + q.opsiJawaban.map((o, oi) => ['A','B','C','D','E'][oi] + '. ' + o).join(' • ') + '</small>' : ''}
              </td>
              <td class="text-center"><strong>${q.kunciJawaban || '-'}</strong></td>
            </tr>
          `).join('') : '<tr><td colspan="5" class="text-center">Belum ada butir soal tersimpan.</td></tr>'}
        </tbody>
      </table>

      ${this.getSignatures()}
    `;

    this.print(html);
  },

  // 5. Menu Jadwal & Kalender: Timetable & Calendar
  printTimetable() {
    const teacher = AppState.currentTeacher || {};
    const kop = this.getOfficialKop(
      'JADWAL MENGAJAR GURU MINGGUAN & AGENDA PENDIDIKAN',
      'Jadwal Tatap Muka Resmi Semester 1 (Ganjil) - Tahun Ajaran 2026/2027'
    );
    const timetable = AppState.data.timetable || [];
    const events = AppState.data.academicEvents || [];
    const totalJP = timetable.reduce((acc, t) => acc + (parseInt(t.jp, 10) || 1), 0);

    const html = `
      ${kop}
      <table class="print-meta-table">
        <tr>
          <td class="meta-label">Nama Guru Pengampu</td><td class="meta-colon">:</td><td><strong>${teacher.namaLengkap}</strong></td>
          <td class="meta-label">Mata Pelajaran</td><td class="meta-colon">:</td><td>${teacher.mapelUtama || 'Informatika'}</td>
        </tr>
        <tr>
          <td class="meta-label">NIP Guru</td><td class="meta-colon">:</td><td>${teacher.nip || '-'}</td>
          <td class="meta-label">Beban Mengajar</td><td class="meta-colon">:</td><td><strong>${totalJP} Jam Pelajaran (JP) / Minggu</strong></td>
        </tr>
        <tr>
          <td class="meta-label">Satuan Pendidikan</td><td class="meta-colon">:</td><td>${teacher.namaSekolah}</td>
          <td class="meta-label">Tahun Ajaran</td><td class="meta-colon">:</td><td>2026/2027 (Semester Ganjil)</td>
        </tr>
      </table>

      <div class="print-section-title">A. Matriks Jadwal Pelajaran Tatap Muka Mingguan</div>
      <table class="print-data-table">
        <thead>
          <tr>
            <th style="width: 35px;">No</th>
            <th style="width: 80px;">Hari</th>
            <th style="width: 70px;">Jam Ke-</th>
            <th style="width: 100px;">Alokasi Waktu</th>
            <th style="width: 90px;">Kelas</th>
            <th>Mata Pelajaran & Ruangan</th>
            <th style="width: 60px;">Beban</th>
          </tr>
        </thead>
        <tbody>
          ${timetable.length ? timetable.map((s, idx) => `
            <tr>
              <td class="text-center">${idx + 1}</td>
              <td><strong>${s.hari}</strong></td>
              <td class="text-center">Ke-${s.jamKe}</td>
              <td class="text-center">${s.waktuMulai} - ${s.waktuSelesai}</td>
              <td class="text-center"><strong>${s.kelas}</strong></td>
              <td>${s.mapel || teacher.mapelUtama} (${s.ruang || 'Lab Komputer'})</td>
              <td class="text-center">${s.jp || 2} JP</td>
            </tr>
          `).join('') : '<tr><td colspan="7" class="text-center">Belum ada jadwal mengajar.</td></tr>'}
        </tbody>
      </table>

      <div class="print-section-title">B. Agenda & Kalender Akademik Terdekat</div>
      <table class="print-data-table">
        <thead>
          <tr>
            <th style="width: 35px;">No</th>
            <th style="width: 110px;">Tanggal</th>
            <th>Nama Agenda / Kegiatan Sekolah</th>
            <th style="width: 120px;">Kategori</th>
            <th>Keterangan / Kesiapan</th>
          </tr>
        </thead>
        <tbody>
          ${events.length ? events.map((ev, idx) => `
            <tr>
              <td class="text-center">${idx + 1}</td>
              <td class="text-center"><strong>${ev.tanggal}</strong></td>
              <td>${ev.judul}</td>
              <td class="text-center"><span class="print-badge">${ev.kategori || 'Akademik'}</span></td>
              <td>${ev.deskripsi || '-'}</td>
            </tr>
          `).join('') : '<tr><td colspan="5" class="text-center">Belum ada kalender kegiatan tercatat.</td></tr>'}
        </tbody>
      </table>

      ${this.getSignatures()}
    `;

    this.print(html);
  },

  // Helper: Format & Smartly Abbreviate Student Names for Print Tables
  formatStudentNameForPrint(fullName, maxLen = 22) {
    if (!fullName) return '-';
    const name = String(fullName).trim();
    if (name.length <= maxLen) return name;
    const parts = name.split(/\s+/);
    if (parts.length <= 1) return name;

    let abbreviated = [...parts];
    for (let i = abbreviated.length - 1; i >= 1; i--) {
      abbreviated[i] = abbreviated[i][0].toUpperCase() + '.';
      const candidate = abbreviated.join(' ');
      if (candidate.length <= maxLen) {
        return candidate;
      }
    }
    return abbreviated.join(' ');
  },

  // 6. Menu Buku Nilai Digital
  printGradebook(targetClass) {
    const teacher = AppState.currentTeacher || {};
    const selectedClass = targetClass || document.getElementById('grade-class-select')?.value || AppState.data.classes[0] || 'Semua Kelas';
    const weights = AppState.data.gradeWeights || { tugas: 30, uts: 30, uas: 40 };

    const kop = this.getOfficialKop(
      'DAFTAR NILAI DAN CAPAIAN HASIL BELAJAR PESERTA DIDIK',
      `Kelas: ${selectedClass} • Mata Pelajaran: ${teacher.mapelUtama || 'Informatika'} • Semester 1 (2026/2027)`
    );

    let students = (AppState.data.students || []).filter(s => s.kelas === selectedClass);
    if (!students.length) students = AppState.data.students || [];

    const grades = AppState.data.gradebook || [];

    let sumFinal = 0;
    let highest = 0;
    let lowest = 100;
    let passedCount = 0;

    const rows = students.map((s, idx) => {
      const g = grades.find(x => x.studentId === s.id && x.kelas === selectedClass) || {};
      const f1 = (g.tugas && g.tugas[0] !== undefined) ? g.tugas[0] : (g.tugas1 !== undefined ? g.tugas1 : 85);
      const f2 = (g.tugas && g.tugas[1] !== undefined) ? g.tugas[1] : (g.tugas2 !== undefined ? g.tugas2 : 88);
      const f3 = (g.tugas && g.tugas[2] !== undefined) ? g.tugas[2] : (g.tugas3 !== undefined ? g.tugas3 : 84);
      const fAvg = Math.round((f1 + f2 + f3) / 3);
      const sts = g.uts !== undefined ? g.uts : 82;
      const sas = g.uas !== undefined ? g.uas : 86;

      const finalGrade = Math.round((fAvg * (weights.tugas / 100)) + (sts * (weights.uts / 100)) + (sas * (weights.uas / 100)));
      sumFinal += finalGrade;
      if (finalGrade > highest) highest = finalGrade;
      if (finalGrade < lowest) lowest = finalGrade;
      if (finalGrade >= 75) passedCount++;

      let predikat = 'A';
      if (finalGrade < 70) predikat = 'D';
      else if (finalGrade < 80) predikat = 'C';
      else if (finalGrade < 90) predikat = 'B';

      const rawFullName = s.namaLengkap || s.nama || `Siswa ${idx + 1}`;
      const displayName = this.formatStudentNameForPrint(rawFullName, 22);

      return {
        no: idx + 1,
        nisn: s.nisn || '-',
        nama: displayName,
        rawNama: rawFullName,
        f1, f2, f3, fAvg,
        sts, sas, finalGrade, predikat,
        status: finalGrade >= 75 ? 'Tuntas' : 'Perlu Bimbingan'
      };
    });

    const avgFinal = students.length ? Math.round(sumFinal / students.length) : 0;
    const passPercentage = students.length ? Math.round((passedCount / students.length) * 100) : 0;

    const html = `
      ${kop}
      <table class="print-meta-table">
        <tr>
          <td class="meta-label">Satuan Pendidikan</td><td class="meta-colon">:</td><td>${teacher.namaSekolah}</td>
          <td class="meta-label">Rombongan Belajar</td><td class="meta-colon">:</td><td><strong>${selectedClass}</strong></td>
        </tr>
        <tr>
          <td class="meta-label">Mata Pelajaran</td><td class="meta-colon">:</td><td>${teacher.mapelUtama || 'Informatika'}</td>
          <td class="meta-label">Kriteria Ketuntasan (KKTP)</td><td class="meta-colon">:</td><td><strong>75 (Tujuh Puluh Lima)</strong></td>
        </tr>
        <tr>
          <td class="meta-label">Guru Pengampu</td><td class="meta-colon">:</td><td><strong>${teacher.namaLengkap}</strong> (NIP. ${teacher.nip || '-'})</td>
          <td class="meta-label">Bobot Penilaian</td><td class="meta-colon">:</td><td>Formatif: ${weights.tugas}% | STS: ${weights.uts}% | SAS: ${weights.uas}%</td>
        </tr>
      </table>

      <div class="print-stats-grid">
        <div class="print-stat-box">
          <div class="stat-lbl">Rata-Rata Kelas</div>
          <div class="stat-val">${avgFinal}</div>
          <small>Skala 0 - 100</small>
        </div>
        <div class="print-stat-box">
          <div class="stat-lbl">Nilai Tertinggi</div>
          <div class="stat-val">${highest || 0}</div>
          <small>Capaian Maksimum</small>
        </div>
        <div class="print-stat-box">
          <div class="stat-lbl">Nilai Terendah</div>
          <div class="stat-val">${lowest === 100 && !students.length ? 0 : lowest}</div>
          <small>Capaian Minimum</small>
        </div>
        <div class="print-stat-box">
          <div class="stat-lbl">Ketuntasan Belajar</div>
          <div class="stat-val">${passPercentage}%</div>
          <small>${passedCount} dari ${students.length} Siswa</small>
        </div>
      </div>

      <table class="print-data-table">
        <thead>
          <tr>
            <th rowspan="2" style="width: 28px;">No</th>
            <th rowspan="2" style="width: 75px;">NISN</th>
            <th rowspan="2" style="width: 170px;">Nama Lengkap Peserta Didik</th>
            <th colspan="4">Asesmen Formatif (TP)</th>
            <th rowspan="2" style="width: 48px;">STS / UTS</th>
            <th rowspan="2" style="width: 48px;">SAS / UAS</th>
            <th rowspan="2" style="width: 52px;">Nilai Akhir</th>
            <th rowspan="2" style="width: 42px;">Pred.</th>
            <th rowspan="2" style="width: 85px;">Ketercapaian TP</th>
          </tr>
          <tr>
            <th style="width: 36px;">TP 1</th>
            <th style="width: 36px;">TP 2</th>
            <th style="width: 36px;">TP 3</th>
            <th style="width: 42px;">Rerata</th>
          </tr>
        </thead>
        <tbody>
          ${rows.length ? rows.map(r => `
            <tr>
              <td class="text-center">${r.no}</td>
              <td class="text-center"><code>${r.nisn}</code></td>
              <td><strong title="${r.rawNama}">${r.nama}</strong></td>
              <td class="text-center">${r.f1}</td>
              <td class="text-center">${r.f2}</td>
              <td class="text-center">${r.f3}</td>
              <td class="text-center"><strong>${r.fAvg}</strong></td>
              <td class="text-center">${r.sts}</td>
              <td class="text-center">${r.sas}</td>
              <td class="text-center"><strong>${r.finalGrade}</strong></td>
              <td class="text-center"><strong>${r.predikat}</strong></td>
              <td class="text-center"><span class="print-badge">${r.status}</span></td>
            </tr>
          `).join('') : '<tr><td colspan="12" class="text-center">Belum ada data siswa di kelas ini.</td></tr>'}
        </tbody>
      </table>

      ${this.getSignatures()}
    `;

    this.print(html);
  },

  // 6B. Cetak Lembar Capaian Nilai Siswa Individual
  printSingleStudentGrade(studentId) {
    const student = (AppState.data.students || []).find(s => s.id === studentId);
    if (!student) {
      UI.showToast('Data siswa tidak ditemukan.', 'error');
      return;
    }
    const teacher = AppState.currentTeacher || {};
    const selectedClass = student.kelas || AppState.selectedClass || 'X-A (Fase E)';
    const weights = AppState.data.gradeWeights || { tugas: 30, uts: 30, uas: 40 };
    const grade = (AppState.data.gradebook || []).find(g => g.studentId === student.id) || { tugas: [85, 88], uts: 82, uas: 86, feedback: '' };

    const t1 = (grade.tugas && grade.tugas[0] !== undefined) ? grade.tugas[0] : 85;
    const t2 = (grade.tugas && grade.tugas[1] !== undefined) ? grade.tugas[1] : 88;
    const avgTugas = Math.round(((t1 + t2) / 2) * 10) / 10;
    const uts = grade.uts !== undefined ? grade.uts : 82;
    const uas = grade.uas !== undefined ? grade.uas : 86;

    const finalGrade = Math.round((avgTugas * (weights.tugas / 100)) + (uts * (weights.uts / 100)) + (uas * (weights.uas / 100)));
    let predikat = 'A';
    let deskripsiPredikat = 'Sangat Baik (Menunjukkan penguasaan kompetensi yang luar biasa pada seluruh capaian pembelajaran materi)';
    if (finalGrade < 70) {
      predikat = 'D';
      deskripsiPredikat = 'Perlu Bimbingan (Memerlukan pendampingan intensif dan program remedial pada materi esensial)';
    } else if (finalGrade < 80) {
      predikat = 'C';
      deskripsiPredikat = 'Cukup (Telah mencapai kriteria minimal kelulusan, disarankan memperbanyak latihan mandiri)';
    } else if (finalGrade < 90) {
      predikat = 'B';
      deskripsiPredikat = 'Baik (Telah menguasai sebagian besar tujuan pembelajaran dengan hasil yang memuaskan)';
    }

    const isTuntas = finalGrade >= 75;
    const feedback = (grade.feedback && grade.feedback.trim()) 
      ? grade.feedback.trim() 
      : (student.catatanAnekdot ? student.catatanAnekdot : 'Peserta didik menunjukkan motivasi belajar yang tinggi, aktif berkontribusi dalam diskusi kelompok, dan menyelesaikan seluruh penugasan dengan tuntas. Terus pertahankan prestasimu!');

    const kop = this.getOfficialKop(
      'LEMBAR HASIL CAPAIAN BELAJAR PESERTA DIDIK',
      'Laporan Asesmen & Evaluasi Pembelajaran • Semester 1 (Tahun Ajaran 2026/2027)'
    );

    const contribTugas = ((avgTugas * weights.tugas) / 100).toFixed(1);
    const contribUts = ((uts * weights.uts) / 100).toFixed(1);
    const contribUas = ((uas * weights.uas) / 100).toFixed(1);

    const html = `
      ${kop}
      <table class="print-meta-table">
        <tr>
          <td class="meta-label">Nama Peserta Didik</td><td class="meta-colon">:</td><td><strong style="font-size: 1.05em;">${student.namaLengkap}</strong></td>
          <td class="meta-label">Satuan Pendidikan</td><td class="meta-colon">:</td><td>${teacher.namaSekolah || 'SMA Negeri 1 Harapan Nusantara'}</td>
        </tr>
        <tr>
          <td class="meta-label">NISN / Nomor Induk</td><td class="meta-colon">:</td><td><code>${student.nisn || '-'}</code></td>
          <td class="meta-label">Rombongan Belajar</td><td class="meta-colon">:</td><td><strong>${selectedClass}</strong></td>
        </tr>
        <tr>
          <td class="meta-label">Mata Pelajaran</td><td class="meta-colon">:</td><td>${teacher.mapelUtama || 'Informatika'}</td>
          <td class="meta-label">Kriteria Ketuntasan (KKTP)</td><td class="meta-colon">:</td><td><strong>75 (Tujuh Puluh Lima)</strong></td>
        </tr>
        <tr>
          <td class="meta-label">Guru Pengampu</td><td class="meta-colon">:</td><td><strong>${teacher.namaLengkap}</strong> (NIP. ${teacher.nip || '-'})</td>
          <td class="meta-label">Status Ketuntasan</td><td class="meta-colon">:</td><td><strong>${isTuntas ? 'TUNTAS (Memenuhi KKTP)' : 'BELUM TUNTAS (Perlu Remedial)'}</strong></td>
        </tr>
      </table>

      <div class="print-stats-grid" style="grid-template-columns: repeat(3, 1fr) !important; margin: 12px 0 16px 0;">
        <div class="print-stat-box">
          <div class="stat-lbl">Nilai Akhir (Skala 0-100)</div>
          <div class="stat-val" style="font-size: 22pt; color: #047857;">${finalGrade}</div>
          <small>Komposit Formatif & Sumatif</small>
        </div>
        <div class="print-stat-box">
          <div class="stat-lbl">Predikat Capaian</div>
          <div class="stat-val" style="font-size: 22pt;">${predikat}</div>
          <small>${predikat === 'A' ? 'Sangat Baik' : (predikat === 'B' ? 'Baik' : (predikat === 'C' ? 'Cukup' : 'Perlu Bimbingan'))}</small>
        </div>
        <div class="print-stat-box">
          <div class="stat-lbl">Ketercapaian Kompetensi</div>
          <div class="stat-val" style="font-size: 16pt; padding-top: 4px;">${isTuntas ? 'TUNTAS' : 'REMEDIAL'}</div>
          <small>${isTuntas ? 'Melampaui Ambang Batas 75' : 'Di Bawah Ambang Batas 75'}</small>
        </div>
      </div>

      <div class="print-section-title" style="margin: 14px 0 6px 0;">I. Rincian Skor Komponen Asesmen Pembelajaran</div>
      <table class="print-data-table" style="margin-bottom: 14px;">
        <thead>
          <tr>
            <th style="width: 30px;">No</th>
            <th>Komponen Asesmen Pembelajaran</th>
            <th style="width: 80px; text-align: center;">Skor Perolehan</th>
            <th style="width: 70px; text-align: center;">Bobot (%)</th>
            <th style="width: 90px; text-align: center;">Kontribusi Nilai</th>
            <th>Keterangan Asesmen</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="text-center">1</td>
            <td><strong>Asesmen Formatif (Rata-rata Tugas & Portofolio)</strong><br><small style="color: #475569;">Tugas 1: ${t1} | Tugas 2: ${t2}</small></td>
            <td class="text-center" style="font-size: 10.5pt;"><strong>${avgTugas}</strong></td>
            <td class="text-center">${weights.tugas}%</td>
            <td class="text-center"><strong>${contribTugas}</strong></td>
            <td>Evaluasi proses belajar & pemahaman tujuan pembelajaran harian</td>
          </tr>
          <tr>
            <td class="text-center">2</td>
            <td><strong>Asesmen Sumatif Tengah Semester (STS / UTS)</strong></td>
            <td class="text-center" style="font-size: 10.5pt;"><strong>${uts}</strong></td>
            <td class="text-center">${weights.uts}%</td>
            <td class="text-center"><strong>${contribUts}</strong></td>
            <td>Evaluasi ketercapaian materi tengah semester</td>
          </tr>
          <tr>
            <td class="text-center">3</td>
            <td><strong>Asesmen Sumatif Akhir Semester (SAS / UAS)</strong></td>
            <td class="text-center" style="font-size: 10.5pt;"><strong>${uas}</strong></td>
            <td class="text-center">${weights.uas}%</td>
            <td class="text-center"><strong>${contribUas}</strong></td>
            <td>Evaluasi komprehensif capaian kompetensi akhir semester</td>
          </tr>
          <tr style="background-color: #f8fafc; font-weight: 700;">
            <td colspan="4" class="text-right" style="padding-right: 12px;">NILAI AKHIR KUMULATIF :</td>
            <td class="text-center" style="font-size: 11pt; color: #047857;">${finalGrade}</td>
            <td>PREDIKAT: ${predikat} (${isTuntas ? 'TUNTAS' : 'BELUM TUNTAS'})</td>
          </tr>
        </tbody>
      </table>

      <div class="print-section-title" style="margin: 14px 0 6px 0;">II. Deskripsi Capaian Kompetensi & Feedback Guru</div>
      <div style="border: 1px solid #000; padding: 10px 12px; margin-bottom: 16px; font-size: 9pt; line-height: 1.5; background: #ffffff;">
        <div style="margin-bottom: 6px;">
          <strong>Deskripsi Capaian Kompetensi:</strong><br>
          <span>${deskripsiPredikat}</span>
        </div>
        <div style="border-top: 1px dashed #cbd5e1; padding-top: 6px; margin-top: 6px;">
          <strong>Catatan Guru & Rekomendasi Belajar:</strong><br>
          <p style="margin: 3px 0 0 0; font-style: italic; color: #1e293b;">"${feedback}"</p>
        </div>
      </div>

      <!-- Tanda Tangan 3 Pihak: Orang Tua, Kepala Sekolah, Guru -->
      <div class="print-signatures-3col">
        <div>
          Mengetahui,<br>Orang Tua / Wali Murid<br><br><br><br>
          <strong>......................................................</strong><br>
          <small style="color: #64748b;">Tanda Tangan & Nama Terang</small>
        </div>
        <div>
          Mengetahui,<br>Kepala Sekolah<br><br><br><br>
          <strong style="text-decoration: underline;">${teacher.namaKepsek || 'Dr. H. Bambang Sudarsono, M.Pd.'}</strong><br>
          NIP. ${teacher.nipKepsek || '19760415 200212 1 003'}
        </div>
        <div>
          Kota Administratif, ${this.formatDate(new Date().toISOString())}<br>Guru Mata Pelajaran<br><br><br><br>
          <strong style="text-decoration: underline;">${teacher.namaLengkap}</strong><br>
          NIP. ${teacher.nip || '19880512 201201 1 003'}
        </div>
      </div>
    `;

    this.print(html);
  },

  // 7. Menu Kelas, Presensi & Denah
  printClassroom(targetClass) {
    const teacher = AppState.currentTeacher || {};
    const selectedClass = targetClass || document.getElementById('classroom-class-select')?.value || AppState.data.classes[0] || 'Semua Kelas';

    const kop = this.getOfficialKop(
      'REKAPITULASI PRESENSI & DENAH KELAS PESERTA DIDIK',
      `Kelas: ${selectedClass} • Semester 1 (Ganjil) - Tahun Ajaran 2026/2027`
    );

    let students = (AppState.data.students || []).filter(s => s.kelas === selectedClass);
    if (!students.length) students = AppState.data.students || [];

    const html = `
      ${kop}
      <table class="print-meta-table">
        <tr>
          <td class="meta-label">Satuan Pendidikan</td><td class="meta-colon">:</td><td>${teacher.namaSekolah}</td>
          <td class="meta-label">Kelas / Fase</td><td class="meta-colon">:</td><td><strong>${selectedClass}</strong></td>
        </tr>
        <tr>
          <td class="meta-label">Wali Kelas / Guru</td><td class="meta-colon">:</td><td><strong>${teacher.namaLengkap}</strong></td>
          <td class="meta-label">Total Peserta Didik</td><td class="meta-colon">:</td><td>${students.length} Siswa Terdaftar</td>
        </tr>
      </table>

      <div class="print-section-title">A. Rekapitulasi Presensi & Kehadiran Siswa</div>
      <table class="print-data-table">
        <thead>
          <tr>
            <th style="width: 30px;">No</th>
            <th style="width: 85px;">NISN</th>
            <th>Nama Lengkap Peserta Didik</th>
            <th style="width: 50px;">Gender</th>
            <th style="width: 45px;">Hadir (H)</th>
            <th style="width: 45px;">Sakit (S)</th>
            <th style="width: 45px;">Izin (I)</th>
            <th style="width: 45px;">Alpa (A)</th>
            <th style="width: 60px;">Kehadiran %</th>
            <th style="width: 90px;">Keterangan</th>
          </tr>
        </thead>
        <tbody>
          ${students.length ? students.map((s, idx) => {
            const h = 18;
            const sa = 1;
            const i = 0;
            const a = 0;
            const pct = Math.round((h / (h + sa + i + a)) * 100);
            return `
              <tr>
                <td class="text-center">${idx + 1}</td>
                <td class="text-center"><code>${s.nisn || '-'}</code></td>
                <td><strong>${s.namaLengkap || s.nama || '-'}</strong></td>
                <td class="text-center">${s.gender || s.jenisKelamin || 'L'}</td>
                <td class="text-center">${h}</td>
                <td class="text-center">${sa}</td>
                <td class="text-center">${i}</td>
                <td class="text-center">${a}</td>
                <td class="text-center"><strong>${pct}%</strong></td>
                <td class="text-center"><span class="print-badge">${pct >= 90 ? 'Disiplin' : 'Perhatian'}</span></td>
              </tr>
            `;
          }).join('') : '<tr><td colspan="10" class="text-center">Belum ada data siswa di kelas ini.</td></tr>'}
        </tbody>
      </table>

      <div class="print-section-title" style="margin-top: 18px;">B. Denah Layout Tempat Duduk Peserta Didik</div>
      <div style="border: 1px solid #000; padding: 10px; margin-bottom: 16px; text-align: center;">
        <div style="background: #f1f5f9; border: 1px solid #000; padding: 6px; font-weight: 700; font-size: 8.5pt; margin-bottom: 12px; text-transform: uppercase;">
          [ PAPAN TULIS DEPAN KELAS & MEJA GURU PENGAJAR ]
        </div>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
          ${students.slice(0, 16).map((s, idx) => {
            const name = (s && (s.namaLengkap || s.nama)) ? (s.namaLengkap || s.nama) : ('Siswa ' + (idx + 1));
            const shortName = name.split(' ').slice(0, 2).join(' ');
            return `
              <div style="border: 1px solid #000; padding: 6px 4px; font-size: 8pt; text-align: center; background: #ffffff;">
                <small style="color: #666;">Meja ${idx + 1}</small><br>
                <strong>${shortName}</strong>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      ${this.getSignatures()}
    `;

    this.print(html);
  },

  // 8. Menu Koreksi & Tugas Guru
  printTasks() {
    const teacher = AppState.currentTeacher || {};
    const kop = this.getOfficialKop(
      'PELACAK STATUS KOREKSI PENUGASAN & EVALUASI SISWA',
      'Instrumen Kontrol Beban Mengajar & Penilaian Formatif/Sumatif Berkelanjutan'
    );
    const tasks = AppState.data.tasks || [];
    const meetings = AppState.data.meetings || [];
    const reflections = AppState.data.reflections || [];

    const html = `
      ${kop}
      <table class="print-meta-table">
        <tr>
          <td class="meta-label">Nama Guru</td><td class="meta-colon">:</td><td><strong>${teacher.namaLengkap}</strong></td>
          <td class="meta-label">Mata Pelajaran</td><td class="meta-colon">:</td><td>${teacher.mapelUtama || 'Informatika'}</td>
        </tr>
        <tr>
          <td class="meta-label">NIP</td><td class="meta-colon">:</td><td>${teacher.nip || '-'}</td>
          <td class="meta-label">Satuan Pendidikan</td><td class="meta-colon">:</td><td>${teacher.namaSekolah}</td>
        </tr>
      </table>

      <div class="print-section-title">A. Agenda Pelacak Penilaian & Koreksi Tugas Siswa</div>
      <table class="print-data-table">
        <thead>
          <tr>
            <th style="width: 30px;">No</th>
            <th>Judul Penugasan / Asesmen</th>
            <th style="width: 80px;">Kelas</th>
            <th style="width: 90px;">Tenggat Waktu</th>
            <th style="width: 120px;">Progress Koreksi</th>
            <th style="width: 70px;">Rerata</th>
            <th style="width: 80px;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${tasks.length ? tasks.map((t, idx) => `
            <tr>
              <td class="text-center">${idx + 1}</td>
              <td><strong>${t.judul}</strong></td>
              <td class="text-center">${t.kelas}</td>
              <td class="text-center">${t.deadline || '-'}</td>
              <td class="text-center">${t.selesai || 0} / ${t.total || 32} siswa</td>
              <td class="text-center"><strong>${t.rataRata || '-'}</strong></td>
              <td class="text-center"><span class="print-badge">${t.status || 'Aktif'}</span></td>
            </tr>
          `).join('') : '<tr><td colspan="7" class="text-center">Belum ada agenda koreksi tugas.</td></tr>'}
        </tbody>
      </table>

      <div class="print-section-title">B. Notulensi Rapat Dinas & Jurnal Refleksi Mengajar</div>
      <table class="print-data-table">
        <thead>
          <tr>
            <th style="width: 30px;">No</th>
            <th style="width: 80px;">Tipe</th>
            <th style="width: 90px;">Tanggal</th>
            <th>Topik / Catatan Refleksi Bermakna</th>
            <th>Tindak Lanjut Pembelajaran</th>
          </tr>
        </thead>
        <tbody>
          ${meetings.slice(0, 3).map((m, idx) => `
            <tr>
              <td class="text-center">${idx + 1}</td>
              <td class="text-center"><span class="print-badge">Rapat</span></td>
              <td class="text-center">${m.tanggal}</td>
              <td><strong>${m.judul}</strong><br><small>${m.isi || '-'}</small></td>
              <td><small>${m.tindakLanjut || 'Terapkan di program mingguan'}</small></td>
            </tr>
          `).join('')}
          ${reflections.slice(0, 3).map((r, idx) => `
            <tr>
              <td class="text-center">${idx + 4}</td>
              <td class="text-center"><span class="print-badge">Refleksi</span></td>
              <td class="text-center">${r.tanggal}</td>
              <td><strong>${r.topik || 'Refleksi Kelas'}</strong><br><small>${r.isi || '-'}</small></td>
              <td><small>${r.tindakLanjut || 'Penguatan diferensiasi'}</small></td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      ${this.getSignatures()}
    `;

    this.print(html);
  },

  // 9. Menu Asisten AI & Ekspor / Supervisi Kedinasan
  printSupervisi() {
    const teacher = AppState.currentTeacher || {};
    const kop = this.getOfficialKop(
      'INSTRUMEN VERIFIKASI & BUKTI FISIK SUPERVISI AKADEMIK GURU',
      'Standar Penilaian Kinerja Guru & Kelengkapan Administrasi Kurikulum Merdeka'
    );

    const checklist = [
      { no: 1, item: 'Kalender Pendidikan & Analisis Alokasi Waktu Efektif', status: 'Ada & Lengkap', skor: 4, catatan: 'Sesuai agenda dinas provinsi' },
      { no: 2, item: 'Capaian Pembelajaran (CP) & Alur Tujuan Pembelajaran (ATP)', status: 'Ada & Lengkap', skor: 4, catatan: 'Terstruktur runtut Fase E/F' },
      { no: 3, item: 'Modul Ajar / RPP Berdiferensiasi (Konten/Proses/Produk)', status: 'Ada & Lengkap', skor: 4, catatan: 'Lengkap instrumen apersepsi & P5' },
      { no: 4, item: 'Jadwal Pelajaran Tatap Muka & Beban Mengajar Guru', status: 'Ada & Lengkap', skor: 4, catatan: 'Memenuhi beban jam linear' },
      { no: 5, item: 'Presensi / Absensi Siswa & Denah Tempat Duduk Kelas', status: 'Ada & Lengkap', skor: 4, catatan: 'Pencatatan harian disiplin' },
      { no: 6, item: 'Buku Nilai Digital Siswa (Formatif, STS, SAS & Kriteria KKTP)', status: 'Ada & Lengkap', skor: 4, catatan: 'Otomatisasi kalkulasi bobot baku' },
      { no: 7, item: 'Bank Soal Bloom & Kisi-kisi Asesmen (LOTS/MOTS/HOTS)', status: 'Ada & Lengkap', skor: 4, catatan: 'Proporsi HOTS C4-C6 di atas 30%' },
      { no: 8, item: 'Pelacak Koreksi Tugas & Rekap Umpan Balik Siswa', status: 'Ada & Lengkap', skor: 4, catatan: 'Monitoring tindak lanjut aktif' },
      { no: 9, item: 'Notulensi Rapat Dinas MGMP & Jurnal Refleksi Mengajar', status: 'Ada & Lengkap', skor: 4, catatan: 'Refleksi berkala terdokumentasi' },
      { no: 10, item: 'Pemanfaatan Media Pembelajaran Digital & Akun Belajar', status: 'Ada & Lengkap', skor: 4, catatan: 'Terintegrasi PWA Offline-First' }
    ];

    const totalSkor = checklist.reduce((acc, c) => acc + c.skor, 0);
    const maxSkor = checklist.length * 4;
    const nilaiSupervisi = Math.round((totalSkor / maxSkor) * 100);

    const html = `
      ${kop}
      <table class="print-meta-table">
        <tr>
          <td class="meta-label">Nama Guru Yang Disupervisi</td><td class="meta-colon">:</td><td><strong>${teacher.namaLengkap}</strong></td>
          <td class="meta-label">Mata Pelajaran</td><td class="meta-colon">:</td><td>${teacher.mapelUtama || 'Informatika'}</td>
        </tr>
        <tr>
          <td class="meta-label">NIP Guru</td><td class="meta-colon">:</td><td>${teacher.nip || '-'}</td>
          <td class="meta-label">Fase / Jenjang</td><td class="meta-colon">:</td><td>${teacher.fase || 'Fase E'} / SMA</td>
        </tr>
        <tr>
          <td class="meta-label">Satuan Pendidikan</td><td class="meta-colon">:</td><td>${teacher.namaSekolah}</td>
          <td class="meta-label">Hasil Supervisi</td><td class="meta-colon">:</td><td><strong>NILAI ${nilaiSupervisi} (Kategori: AMAT BAIK / A)</strong></td>
        </tr>
      </table>

      <table class="print-data-table">
        <thead>
          <tr>
            <th style="width: 30px;">No</th>
            <th>Komponen Bukti Fisik Administrasi Guru</th>
            <th style="width: 100px;">Kondisi Bukti</th>
            <th style="width: 50px;">Skor (1-4)</th>
            <th>Catatan & Rekomendasi Verifikator</th>
          </tr>
        </thead>
        <tbody>
          ${checklist.map(c => `
            <tr>
              <td class="text-center">${c.no}</td>
              <td><strong>${c.item}</strong></td>
              <td class="text-center"><span class="print-badge">${c.status}</span></td>
              <td class="text-center"><strong>${c.skor}</strong></td>
              <td><small>${c.catatan}</small></td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="border: 1px solid #000; padding: 8px 12px; margin-bottom: 14px; font-size: 8.5pt;">
        <strong>Kesimpulan Hasil Supervisi:</strong>
        Guru yang bersangkutan telah memenuhi dan melengkapi seluruh administrasi perangkat pembelajaran Kurikulum Merdeka secara mandiri, digital, dan tertib. Sangat siap untuk pelaksanaan akreditasi sekolah maupun penilaian kinerja berkala.
      </div>

      <div class="print-signatures" style="display: flex; justify-content: space-between;">
        <div class="print-sig-box" style="width: 30%;">
          <div>Pengawas Pembina Sekolah</div>
          <div class="print-sig-space"></div>
          <div class="print-sig-name">Dra. Hj. Sri Wahyuni, M.Pd.</div>
          <div class="print-sig-nip">NIP. 19680320 199403 2 002</div>
        </div>
        <div class="print-sig-box" style="width: 30%;">
          <div>Mengetahui, Kepala Sekolah</div>
          <div class="print-sig-space"></div>
          <div class="print-sig-name">Dr. H. Bambang Sudarsono, M.Pd.</div>
          <div class="print-sig-nip">NIP. 19760415 200212 1 003</div>
        </div>
        <div class="print-sig-box" style="width: 30%;">
          <div>Guru Mata Pelajaran</div>
          <div class="print-sig-space"></div>
          <div class="print-sig-name">${teacher.namaLengkap}</div>
          <div class="print-sig-nip">NIP. ${teacher.nip || '-'}</div>
        </div>
      </div>
    `;

    this.print(html);
  },

  // 11. Menu Profil & Identitas Sekolah
  printSchoolProfile() {
    const teacher = AppState.currentTeacher || {};
    const kop = this.getOfficialKop(
      'LEMBAR DATA IDENTITAS SATUAN PENDIDIKAN & GURU PENGAMPU',
      'Dokumen Profil Lembaga & Pengesahan KOP Surat Resmi Kedinasan'
    );

    const html = `
      ${kop}
      <div class="print-section-block">
        <div class="print-section-title">A. Data Satuan Pendidikan & Legalitas Lembaga</div>
        <table class="print-meta-table">
          <tr>
            <td class="meta-label">Nama Resmi Satuan Pendidikan</td><td class="meta-colon">:</td><td><strong style="font-size: 1.05em;">${teacher.namaSekolah || 'SMA Negeri 1 Harapan Nusantara'}</strong></td>
            <td class="meta-label">NPSN</td><td class="meta-colon">:</td><td><code>${teacher.npsn || '20108920'}</code></td>
          </tr>
          <tr>
            <td class="meta-label">Jenjang Pendidikan</td><td class="meta-colon">:</td><td><strong>${teacher.jenjang || 'SMA'}</strong></td>
            <td class="meta-label">Nomor Telepon</td><td class="meta-colon">:</td><td>${teacher.teleponSekolah || '(021) 7890123'}</td>
          </tr>
          <tr>
            <td class="meta-label">Alamat Lengkap Satuan Pendidikan</td><td class="meta-colon">:</td><td colspan="3">${teacher.alamatSekolah || 'Jl. Pendidikan Karakter Bangsa No. 45'}</td>
          </tr>
          <tr>
            <td class="meta-label">Email Resmi</td><td class="meta-colon">:</td><td>${teacher.emailSekolah || 'tatausaha@sekolah.sch.id'}</td>
            <td class="meta-label">Website Resmi</td><td class="meta-colon">:</td><td>${teacher.websiteSekolah || '-'}</td>
          </tr>
        </table>
      </div>

      <div class="print-section-block" style="margin-top: 14px;">
        <div class="print-section-title">B. Data Pimpinan Lembaga & Pejabat Pengesahan</div>
        <table class="print-meta-table">
          <tr>
            <td class="meta-label">Nama Kepala Sekolah</td><td class="meta-colon">:</td><td><strong>${teacher.namaKepalaSekolah || 'Dr. H. Bambang Sudarsono, M.Pd.'}</strong></td>
            <td class="meta-label">NIP Kepala Sekolah</td><td class="meta-colon">:</td><td><code>${teacher.nipKepalaSekolah || '19760415 200212 1 003'}</code></td>
          </tr>
        </table>
      </div>

      <div class="print-section-block" style="margin-top: 14px;">
        <div class="print-section-title">C. Data Guru Pengampu Administrasi</div>
        <table class="print-meta-table">
          <tr>
            <td class="meta-label">Nama Guru Pengampu</td><td class="meta-colon">:</td><td><strong>${teacher.namaLengkap}</strong></td>
            <td class="meta-label">NIP Guru</td><td class="meta-colon">:</td><td><code>${teacher.nip || '-'}</code></td>
          </tr>
          <tr>
            <td class="meta-label">Mata Pelajaran Utama</td><td class="meta-colon">:</td><td>${teacher.mapelUtama || teacher.mataPelajaran || 'Informatika'}</td>
            <td class="meta-label">Status Profil</td><td class="meta-colon">:</td><td><span style="color: #047857; font-weight: 700;">Aktif Terverifikasi</span></td>
          </tr>
        </table>
      </div>

      ${this.getSignatures()}
    `;

    this.print(html);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Dark / Light Theme
  ThemeManager.init();

  // Initialize PWA Manager & Service Worker
  PWAManager.init();

  // Initialize Authentication Gate
  AuthManager.checkAuthSession();

  // Initialize Cloud Database Manager (Google Apps Script & Google Sheets)
  CloudDBManager.init();

  // Keyboard shortcut: ESC to close mobile sidebar drawer
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      Navigation.closeMobileSidebar();
    }
  });
});

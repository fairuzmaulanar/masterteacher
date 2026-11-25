// Data contoh Mode Demo (akun guru). Disemai ulang setiap kali demo dibuka; tidak pernah dikirim ke server.
// Semua tabel database (Kelas, Siswa, Mapel, TP, RPP, Materi, Soal, Asesmen, Absensi, Jadwal, Tugas, Catatan, Jurnal, Agenda)
// terisi, ditambah simulasi data server untuk Komunikasi Wali dan dokumen ber-QR.
import { db } from './store.js';
import { today, addDays, hariKe, ymd, parseYmd, BULAN } from './util.js';
import { rpp as genRpp, lkpd as genLkpd } from './generator.js';
import { tahunAjaran, semesterSekarang, rentangSemester, LIBUR_TETAP } from './kurikulum.js';
import { lokal } from './state.js';

export const DEMO_USER = { id: 'DEMO', email: 'rina.saraswati@sdn01pagi.sch.id', nama: 'Rina Saraswati, S.Pd.', peran: 'guru', nip: '19880415 201101 2 007', nuptk: '6747766667230082', mapel_utama: 'Guru Kelas', jenjang: 'SD', mode_kbc: '0', onboarded: '1', wa: '081234567890', paket: 'gratis', updated_at: '1' };
const LOGO = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#12245B"/><circle cx="32" cy="32" r="25" fill="none" stroke="#FFC531" stroke-width="2"/><path d="M18 40V24l14 5 14-5v16l-14 5z" fill="#fff"/><path d="M32 29v16" stroke="#12245B" stroke-width="2"/><circle cx="32" cy="17" r="4" fill="#FFC531"/></svg>');
export const DEMO_SEKOLAH = { id: 'SDEMO', nama: 'SD Negeri 01 Pagi', npsn: '20104592', jenjang: 'SD', jenis: 'Negeri', alamat: 'Jl. Percetakan Negara No. 12', kota: 'Jakarta Pusat', provinsi: 'DKI Jakarta', telp: '(021) 4211234', email: 'sdn01pagi@contoh.sch.id', kepsek_nama: 'Drs. H. Bambang Irawan, M.Pd.', kepsek_nip: '19700312 199503 1 004', kop_atas: 'PEMERINTAH PROVINSI DKI JAKARTA\nDINAS PENDIDIKAN', logo: LOGO, kode_undangan: 'DEMO26', bolehKelola: true, updated_at: '1' };

function acak(seed) { let x = seed; return () => { x = (x * 9301 + 49297) % 233280; return x / 233280; }; }
const pad2 = (n) => String(n).padStart(2, '0');

// [nama, L/P, nama wali]
const SISWA_4B = [
  ['Adinda Putri Lestari', 'P', 'Ibu Sri Wahyuni'], ['Ahmad Zaki Ramadhan', 'L', 'Bpk. Hendra Ramadhan'], ['Alya Ramadhani', 'P', 'Ibu Ratna Dewi'], ['Bagas Saputra', 'L', 'Bpk. Agus Saputra'],
  ['Budi Pratama', 'L', 'Bpk. Joko Pratama'], ['Citra Lestari', 'P', 'Ibu Wulan Sari'], ['Dewi Anggraini', 'P', 'Bpk. Slamet Riyadi'], ['Dimas Anggara', 'L', 'Ibu Yuliana Anggara'],
  ['Fajar Nugroho', 'L', 'Bpk. Bambang Nugroho'], ['Fitri Handayani', 'P', 'Ibu Nur Handayani'], ['Galih Pamungkas', 'L', 'Bpk. Teguh Pamungkas'], ['Hana Safitri', 'P', 'Ibu Siti Aminah'],
  ['Indra Wijaya', 'L', 'Bpk. Rudi Wijaya'], ['Intan Permata Sari', 'P', 'Ibu Dian Permata'], ['Joko Susilo', 'L', 'Bpk. Sugeng Susilo'], ['Kirana Ayu Lestari', 'P', 'Ibu Lestari Ningsih'],
  ['Lukman Hakim', 'L', 'Bpk. Abdul Hakim'], ['Maya Sari', 'P', 'Ibu Rahmawati'], ['Nabila Zahra', 'P', 'Bpk. Ilham Zahran'], ['Naufal Rizky', 'L', 'Ibu Fitriani'],
  ['Putri Maharani', 'P', 'Bpk. Dedi Kurniawan'], ['Raka Aditya', 'L', 'Ibu Endang Lestari'], ['Rizki Ananda', 'L', 'Bpk. Hasan Basri'], ['Salsabila Azzahra', 'P', 'Ibu Mariam Ulfa'],
  ['Siti Nurhaliza', 'P', 'Bpk. Rahmat Hidayat'], ['Tegar Prakoso', 'L', 'Bpk. Wahyu Prakoso'], ['Wulan Dari', 'P', 'Ibu Suryani'], ['Yusuf Maulana', 'L', 'Bpk. Imam Maulana']
];
const SISWA_4A = [
  ['Aditya Pratama', 'L', 'Bpk. Yudi Pratama'], ['Aisyah Putri', 'P', 'Ibu Nurlela'], ['Andi Saputra', 'L', 'Bpk. Andi Mulyadi'], ['Anisa Rahma', 'P', 'Ibu Kartika Sari'],
  ['Arif Hidayat', 'L', 'Bpk. Taufik Hidayat'], ['Bella Safira', 'P', 'Ibu Desi Ratnasari'], ['Bima Sakti', 'L', 'Bpk. Gunawan'], ['Cahya Ramadhan', 'L', 'Ibu Linda Kusuma'],
  ['Danu Wijaya', 'L', 'Bpk. Hari Wijaya'], ['Dinda Kurnia', 'P', 'Ibu Nia Kurniasih'], ['Eka Saputri', 'P', 'Bpk. Eko Saputro'], ['Farhan Maulana', 'L', 'Ibu Rina Marlina'],
  ['Gadis Aulia', 'P', 'Bpk. Ahmad Syarif'], ['Hafiz Al-Ghifari', 'L', 'Ibu Halimah'], ['Ilham Akbar', 'L', 'Bpk. Akbar Tanjung'], ['Jihan Aulia', 'P', 'Ibu Mutiara'],
  ['Kayla Safira', 'P', 'Bpk. Fajar Sidik'], ['Laras Ayuningtyas', 'P', 'Ibu Ayu Lestari'], ['Muhammad Rafi', 'L', 'Bpk. Rahman'], ['Nadia Putri', 'P', 'Ibu Sulastri'],
  ['Oktavia Rahmawati', 'P', 'Bpk. Joni Iskandar'], ['Rafael Hutapea', 'L', 'Bpk. Martin Hutapea'], ['Sinta Maharani', 'P', 'Ibu Maharani'], ['Tiara Anjani', 'P', 'Ibu Anjani Putri'],
  ['Umar Faruq', 'L', 'Bpk. Faruq Hasan'], ['Vina Melati', 'P', 'Ibu Melati Suci'], ['Zahra Amalia', 'P', 'Bpk. Amal Saleh']
];

const P = (s) => 'Peserta didik mampu ' + s + '.';
// mapel_id → [kode, rumusan, bab, minggu]
const TP_DATA = {
  M1: [['TP 1.1', P('mengidentifikasi bagian-bagian tumbuhan dan fungsinya'), 'Bab 1: Tumbuhan, Sumber Kehidupan', 1], ['TP 1.2', P('menjelaskan proses fotosintesis secara sederhana'), 'Bab 1: Tumbuhan, Sumber Kehidupan', 3],
    ['TP 2.1', P('membedakan wujud zat padat, cair, dan gas'), 'Bab 2: Wujud Zat dan Perubahannya', 5], ['TP 2.2', P('menjelaskan perubahan wujud zat dalam kehidupan sehari-hari'), 'Bab 2: Wujud Zat dan Perubahannya', 7],
    ['TP 3.1', P('menjelaskan pengaruh gaya terhadap gerak benda melalui percobaan sederhana'), 'Bab 3: Gaya di Sekitar Kita', 9], ['TP 3.2', P('mengidentifikasi jenis-jenis gaya di sekitar'), 'Bab 3: Gaya di Sekitar Kita', 11],
    ['TP 4.1', P('mengidentifikasi komponen biotik dan abiotik dalam ekosistem sawah'), 'Bab 4: Ekosistem & Rantai Makanan', 13], ['TP 4.2', P('menjelaskan peran produsen, konsumen, dan pengurai dalam rantai makanan'), 'Bab 4: Ekosistem & Rantai Makanan', 15],
    ['TP 4.3', P('menyusun jaring-jaring makanan sederhana dari hasil pengamatan'), 'Bab 4: Ekosistem & Rantai Makanan', 16], ['TP 4.4', P('memprediksi dampak hilangnya satu komponen terhadap keseimbangan ekosistem'), 'Bab 4: Ekosistem & Rantai Makanan', 17]],
  M2: [['TP 1.1', P('membaca, menulis, dan membandingkan bilangan cacah sampai 10.000'), 'Bab 1: Bilangan Cacah', 1], ['TP 1.2', P('melakukan penjumlahan dan pengurangan bilangan cacah sampai 10.000'), 'Bab 1: Bilangan Cacah', 3],
    ['TP 2.1', P('menentukan pecahan senilai menggunakan gambar dan garis bilangan'), 'Bab 2: Pecahan', 6], ['TP 2.2', P('membandingkan dan mengurutkan pecahan berpenyebut berbeda'), 'Bab 2: Pecahan', 8],
    ['TP 3.1', P('mengubah pecahan biasa menjadi pecahan desimal'), 'Bab 3: Desimal', 11], ['TP 3.2', P('menentukan nilai tempat bilangan desimal'), 'Bab 3: Desimal', 13],
    ['TP 4.1', P('mengukur panjang dan berat dengan satuan baku'), 'Bab 4: Pengukuran', 15], ['TP 4.2', P('menghitung keliling dan luas bangun datar sederhana'), 'Bab 4: Pengukuran', 17]],
  M3: [['TP 1.1', P('menemukan informasi tersurat dalam teks narasi'), 'Bab 1: Membaca Teks Narasi', 1], ['TP 1.2', P('menentukan gagasan pokok setiap paragraf'), 'Bab 1: Membaca Teks Narasi', 4],
    ['TP 2.1', P('menulis laporan pengamatan sederhana dengan struktur yang tepat'), 'Bab 2: Menulis Laporan', 8], ['TP 2.2', P('menyunting tulisan dengan memperhatikan ejaan dan tanda baca'), 'Bab 2: Menulis Laporan', 10],
    ['TP 3.1', P('menemukan gagasan pokok cerita rakyat melalui membaca intensif'), 'Bab 3: Cerita Rakyat Nusantara', 14], ['TP 3.2', P('menceritakan kembali cerita rakyat dengan kosakata baru'), 'Bab 3: Cerita Rakyat Nusantara', 16]],
  M5: [['TP 1.1', P('menjelaskan makna sila-sila Pancasila dan lambangnya'), 'Bab 1: Aku Cinta Pancasila', 2], ['TP 1.2', P('memberi contoh penerapan nilai Pancasila di rumah dan sekolah'), 'Bab 1: Aku Cinta Pancasila', 6],
    ['TP 2.1', P('mengidentifikasi hak dan kewajiban sebagai warga sekolah'), 'Bab 2: Hak dan Kewajiban', 11], ['TP 2.2', P('menunjukkan sikap menghargai perbedaan di lingkungan sekitar'), 'Bab 2: Hak dan Kewajiban', 15]],
  M4: [['TP 2.1', P('menentukan pecahan senilai menggunakan gambar dan garis bilangan'), 'Bab 2: Pecahan', 6], ['TP 2.2', P('membandingkan dan mengurutkan pecahan berpenyebut berbeda'), 'Bab 2: Pecahan', 8],
    ['TP 3.1', P('mengubah pecahan biasa menjadi pecahan desimal'), 'Bab 3: Desimal', 11], ['TP 3.2', P('menentukan nilai tempat bilangan desimal'), 'Bab 3: Desimal', 13], ['TP 4.1', P('mengukur panjang dan berat dengan satuan baku'), 'Bab 4: Pengukuran', 15]],
  M6: [['TP 1.1', P('mengidentifikasi bagian-bagian tumbuhan dan fungsinya'), 'Bab 1: Tumbuhan, Sumber Kehidupan', 1], ['TP 1.2', P('menjelaskan proses fotosintesis secara sederhana'), 'Bab 1: Tumbuhan, Sumber Kehidupan', 3],
    ['TP 4.1', P('mengidentifikasi komponen biotik dan abiotik dalam ekosistem'), 'Bab 4: Ekosistem & Rantai Makanan', 13], ['TP 4.2', P('menjelaskan peran produsen, konsumen, dan pengurai dalam rantai makanan'), 'Bab 4: Ekosistem & Rantai Makanan', 15]]
};
const tpId = (m, i) => `TP${m}-${i + 1}`;
// Ringkasan Capaian Pembelajaran Fase B per mapel (dipakai di RPP contoh)
const CP_IPAS = 'Pada akhir Fase B, peserta didik mampu mengidentifikasi bagian tumbuhan beserta fungsinya, menjelaskan perubahan wujud zat dan pengaruh gaya terhadap benda, serta menguraikan peran setiap komponen ekosistem dalam rantai makanan di lingkungan sekitar.';
const CP_MTK = 'Pada akhir Fase B, peserta didik dapat membaca, membandingkan, dan mengoperasikan bilangan cacah sampai 10.000, membandingkan dan mengurutkan pecahan, mengenal pecahan desimal beserta nilai tempatnya, serta menyelesaikan masalah pengukuran dengan satuan baku.';
const CP = { M1: CP_IPAS, M6: CP_IPAS, M2: CP_MTK, M4: CP_MTK,
  M3: 'Pada akhir Fase B, peserta didik mampu memahami gagasan pokok teks narasi dan informasi yang dibaca, menceritakan kembali isi teks dengan kosakata baru, serta menulis laporan sederhana dengan struktur, ejaan, dan tanda baca yang tepat.',
  M5: 'Pada akhir Fase B, peserta didik mampu memahami makna sila-sila Pancasila dan lambangnya, menerapkan nilai-nilainya dalam kehidupan sehari-hari, serta mengenali hak dan kewajiban sebagai anggota keluarga dan warga sekolah.' };

// [mapel, tpIndex, tipe, teks, opsi, kunci, bloom, level, skor]
const RUB = 'Skor 4: jawaban benar, lengkap, disertai alasan logis; Skor 3: benar dan cukup lengkap; Skor 2: sebagian benar; Skor 1: menjawab tetapi keliru.';
const SOAL_DATA = [
  ['M1', 6, 'pg', 'Komponen berikut yang termasuk komponen abiotik di sawah adalah ...', ['Air', 'Katak', 'Padi', 'Belalang'], 'A', 'C1', 'LOTS', 1],
  ['M1', 7, 'pg', 'Dalam ekosistem sawah, padi berperan sebagai ...', ['Produsen', 'Konsumen tingkat I', 'Konsumen tingkat II', 'Pengurai'], 'A', 'C2', 'LOTS', 1],
  ['M1', 7, 'pg', 'Urutan rantai makanan yang benar di sawah adalah ...', ['Padi → ular → tikus → elang', 'Padi → tikus → ular → elang', 'Tikus → padi → ular → elang', 'Elang → ular → tikus → padi'], 'B', 'C2', 'LOTS', 1],
  ['M1', 9, 'pg', 'Petani memburu ular sawah secara besar-besaran. Dampak yang paling mungkin terjadi adalah ...', ['Populasi elang bertambah', 'Populasi tikus meningkat dan panen padi menurun', 'Populasi padi meningkat', 'Tidak ada perubahan'], 'B', 'C4', 'HOTS', 1],
  ['M1', 7, 'bs', 'Jamur dan bakteri termasuk pengurai.', ['Benar', 'Salah'], 'Benar', 'C1', 'LOTS', 1],
  ['M1', 8, 'pgk', 'Hewan yang dapat menjadi konsumen tingkat I di sawah adalah ... (pilih semua yang benar)', ['Belalang', 'Tikus', 'Elang', 'Ulat'], 'A,B,D', 'C3', 'MOTS', 1],
  ['M1', 6, 'isian', 'Makhluk hidup yang dapat membuat makanannya sendiri disebut ....', [], 'produsen', 'C2', 'LOTS', 1],
  ['M1', 9, 'uraian', 'Jelaskan apa yang terjadi pada sawah jika burung hantu (pemangsa tikus) hilang! Berikan alasanmu.', [], RUB, 'C5', 'HOTS', 4],
  ['M1', 8, 'uraian', 'Rancanglah jaring-jaring makanan dari minimal 5 makhluk hidup yang kamu temukan di sekitar sekolah!', [], RUB, 'C6', 'HOTS', 4],
  ['M1', 4, 'pg', 'Ketika kita menendang bola, bola bergerak menjauh. Hal ini menunjukkan bahwa gaya dapat ...', ['Menggerakkan benda dan mengubah arahnya', 'Mengubah warna benda', 'Mengubah wujud benda', 'Membuat benda menjadi ringan'], 'A', 'C3', 'MOTS', 1],
  ['M2', 4, 'pg', 'Bentuk desimal dari 3/4 adalah ...', ['0,25', '0,34', '0,75', '3,4'], 'C', 'C3', 'MOTS', 1],
  ['M2', 5, 'isian', 'Nilai tempat angka 5 pada bilangan 2,45 adalah ....', [], 'perseratusan', 'C2', 'LOTS', 1],
  ['M2', 4, 'pg', '7/10 ditulis dalam bentuk desimal menjadi ...', ['0,07', '0,7', '7,0', '70'], 'B', 'C3', 'MOTS', 1],
  ['M2', 2, 'pg', 'Pecahan yang senilai dengan 1/2 adalah ...', ['2/3', '3/6', '2/5', '4/6'], 'B', 'C2', 'LOTS', 1],
  ['M2', 5, 'bs', '0,5 lebih besar daripada 0,45.', ['Benar', 'Salah'], 'Benar', 'C2', 'LOTS', 1],
  ['M2', 4, 'pg', 'Ibu membeli 2,5 kg beras dan 1,75 kg gula. Berat seluruh belanjaan ibu adalah ...', ['3,25 kg', '4,25 kg', '4,5 kg', '3,75 kg'], 'B', 'C4', 'HOTS', 1],
  ['M2', 3, 'uraian', 'Dina makan 2/8 pizza dan Rudi makan 0,5 pizza. Siapa yang makan lebih banyak? Jelaskan caramu!', [], RUB, 'C4', 'HOTS', 4],
  ['M2', 2, 'pg', 'Hasil dari 1/4 + 2/4 adalah ...', ['3/8', '3/4', '2/4', '1/2'], 'B', 'C3', 'MOTS', 1],
  ['M3', 1, 'pg', 'Gagasan pokok sebuah paragraf biasanya terdapat pada ...', ['Kalimat utama', 'Kalimat penjelas', 'Judul bacaan', 'Tanda baca'], 'A', 'C2', 'LOTS', 1],
  ['M3', 4, 'pg', 'Cerita rakyat yang menceritakan asal-usul suatu tempat disebut ...', ['Legenda', 'Fabel', 'Mite', 'Sage'], 'A', 'C2', 'LOTS', 1],
  ['M3', 4, 'isian', 'Tokoh yang memiliki sifat baik dalam cerita disebut tokoh ....', [], 'protagonis', 'C1', 'LOTS', 1],
  ['M3', 5, 'uraian', 'Bacalah cerita "Asal-usul Danau Toba". Tuliskan pesan moral yang dapat kamu ambil dan alasannya!', [], RUB, 'C4', 'HOTS', 4],
  ['M3', 2, 'bs', 'Laporan pengamatan harus ditulis berdasarkan fakta.', ['Benar', 'Salah'], 'Benar', 'C2', 'LOTS', 1],
  ['M5', 0, 'pg', 'Lambang sila ketiga Pancasila adalah ...', ['Pohon beringin', 'Bintang', 'Rantai', 'Kepala banteng'], 'A', 'C1', 'LOTS', 1],
  ['M5', 1, 'pg', 'Contoh sikap sesuai sila kedua di sekolah adalah ...', ['Menolong teman yang jatuh', 'Memilih ketua kelas dengan musyawarah', 'Berdoa sebelum belajar', 'Memakai produk dalam negeri'], 'A', 'C2', 'LOTS', 1],
  ['M5', 2, 'bs', 'Membuang sampah pada tempatnya termasuk kewajiban siswa di sekolah.', ['Benar', 'Salah'], 'Benar', 'C2', 'LOTS', 1],
  ['M5', 2, 'uraian', 'Tuliskan dua hak dan dua kewajibanmu sebagai siswa di sekolah!', [], RUB, 'C3', 'MOTS', 4],
  ['M4', 0, 'pg', 'Pecahan 2/4 senilai dengan ...', ['1/2', '1/4', '2/8', '4/2'], 'A', 'C2', 'LOTS', 1],
  ['M4', 1, 'pg', 'Manakah pecahan yang paling besar?', ['2/5', '3/5', '1/5', '4/5'], 'D', 'C3', 'MOTS', 1],
  ['M4', 2, 'isian', '0,25 jika diubah ke pecahan biasa paling sederhana menjadi ....', [], '1/4', 'C3', 'MOTS', 1],
  ['M4', 1, 'uraian', 'Ayah memotong kue menjadi 8 bagian. Ani mendapat 3 bagian. Tuliskan pecahan bagian Ani dan bagian yang tersisa!', [], RUB, 'C4', 'HOTS', 4],
  ['M6', 2, 'pg', 'Berikut yang termasuk komponen biotik adalah ...', ['Batu', 'Cahaya matahari', 'Cacing', 'Tanah'], 'C', 'C1', 'LOTS', 1],
  ['M6', 0, 'pg', 'Bagian tumbuhan yang berfungsi menyerap air adalah ...', ['Akar', 'Batang', 'Daun', 'Bunga'], 'A', 'C1', 'LOTS', 1],
  ['M6', 1, 'bs', 'Fotosintesis membutuhkan cahaya matahari.', ['Benar', 'Salah'], 'Benar', 'C2', 'LOTS', 1],
  ['M6', 1, 'isian', 'Proses tumbuhan membuat makanannya sendiri disebut ....', [], 'fotosintesis', 'C2', 'LOTS', 1]
];

// [id, kelas, mapel, nama, jenis, hariMundur, tpIndex[], kesulitan, soal_ids]
const ASESMEN_DATA = [
  ['A8', 'K4B', 'M1', 'Formatif: Gaya dan Gerak Benda', 'formatif', 36, [4], 2],
  ['A7', 'K4B', 'M1', 'Sumatif Lingkup Materi Bab 3: Gaya', 'sumatif_lm', 30, [4, 5], 5],
  ['A1', 'K4B', 'M1', 'Formatif: Komponen Ekosistem Sawah', 'formatif', 16, [6], 0],
  ['A2', 'K4B', 'M1', 'Formatif: Peran Produsen-Konsumen', 'formatif', 9, [7], 3],
  ['A3', 'K4B', 'M1', 'Sumatif Lingkup Materi Bab 4: Ekosistem', 'sumatif_lm', 2, [6, 7, 8, 9], 6, ['Q1', 'Q2', 'Q3', 'Q4', 'Q8']],
  ['A9', 'K4B', 'M2', 'Formatif: Pecahan Senilai', 'formatif', 20, [2], 1],
  ['A10', 'K4B', 'M2', 'Sumatif Lingkup Materi Bab 2: Pecahan', 'sumatif_lm', 14, [2, 3], 6],
  ['A4', 'K4B', 'M2', 'Formatif: Pecahan Desimal', 'formatif', 5, [4], 4, ['Q11', 'Q13', 'Q15', 'Q16']],
  ['A11', 'K4B', 'M3', 'Formatif: Gagasan Pokok Paragraf', 'formatif', 18, [1], 0],
  ['A12', 'K4B', 'M3', 'Sumatif Lingkup Materi: Menulis Laporan', 'sumatif_lm', 8, [2, 3], 3],
  ['A13', 'K4B', 'M3', 'Formatif: Membaca Cerita Rakyat', 'formatif', 3, [4], 1],
  ['A14', 'K4B', 'M5', 'Formatif: Makna Sila Pancasila', 'formatif', 15, [0, 1], -2],
  ['A15', 'K4B', 'M5', 'Sumatif Lingkup Materi: Hak dan Kewajiban', 'sumatif_lm', 6, [2, 3], 1],
  ['A17', 'K4A', 'M4', 'Formatif: Membandingkan Pecahan', 'formatif', 19, [1], 3],
  ['A16', 'K4A', 'M4', 'Sumatif Lingkup Materi Bab 2: Pecahan', 'sumatif_lm', 12, [0, 1], 5],
  ['A5', 'K4A', 'M4', 'Formatif: Pecahan Desimal', 'formatif', 3, [2], 2],
  ['A19', 'K4A', 'M6', 'Sumatif Lingkup Materi Bab 1: Tumbuhan', 'sumatif_lm', 25, [0, 1], 2],
  ['A18', 'K4A', 'M6', 'Formatif: Komponen Biotik dan Abiotik', 'formatif', 4, [2], 0]
];

const BACAAN_SAWAH = `Pagi itu, Rani ikut ayahnya ke sawah di pinggir desa. Air jernih mengalir di parit, membasahi petak-petak padi yang mulai menguning. Ayah menjelaskan bahwa padi adalah produsen karena dapat membuat makanannya sendiri dengan bantuan cahaya matahari.

Di sela batang padi, Rani melihat belalang melompat-lompat. Belalang memakan daun padi, sehingga disebut konsumen tingkat pertama. Tidak jauh dari situ, seekor katak diam menunggu belalang lewat. Katak adalah konsumen tingkat kedua.

"Kalau ada ular, katak bisa dimangsa," kata Ayah. Ular kemudian dapat dimangsa elang. Semua makhluk hidup ini saling bergantung. Saat makhluk hidup mati, jamur dan bakteri di tanah menguraikannya menjadi zat yang menyuburkan tanah kembali.

Ayah berpesan agar petani tidak memburu ular dan burung hantu. "Mereka membantu menjaga jumlah tikus tetap sedikit, sehingga panen padi tetap melimpah," ujarnya.`;
const BACAAN_PECAHAN = `Pecahan menunjukkan bagian dari keseluruhan. Pecahan 3/4 artinya 3 bagian dari 4 bagian yang sama besar.

Pecahan dapat diubah menjadi desimal. Caranya, ubah penyebutnya menjadi 10, 100, atau 1.000. Contoh: 3/4 = 75/100 = 0,75. Pecahan 1/2 = 5/10 = 0,5.

Pada bilangan desimal, angka pertama di belakang koma menempati nilai tempat persepuluhan, dan angka kedua menempati nilai tempat perseratusan. Pada bilangan 2,45 angka 4 bernilai 0,4 dan angka 5 bernilai 0,05.

Untuk membandingkan desimal, samakan dulu banyak angka di belakang koma. Contoh: 0,5 = 0,50, sehingga 0,50 lebih besar daripada 0,45.`;
const BACAAN_TOBA = `Ringkasan cerita rakyat Sumatra Utara: Asal-usul Danau Toba.

Dahulu kala hiduplah seorang petani bernama Toba. Suatu hari ia memancing dan mendapat ikan besar yang dapat berbicara. Ikan itu berubah menjadi perempuan cantik. Toba menikahinya dengan satu janji: ia tidak boleh mengungkit asal-usul istrinya sebagai ikan.

Mereka dikaruniai anak bernama Samosir. Suatu hari Samosir lapar dan memakan bekal yang seharusnya diantar untuk ayahnya. Toba marah dan tanpa sadar mengucapkan kata-kata yang melanggar janjinya. Seketika langit gelap, hujan turun sangat deras, dan air memenuhi lembah hingga menjadi danau yang luas. Danau itu dikenal sebagai Danau Toba, dan pulau di tengahnya diberi nama Pulau Samosir.

Pesan cerita: kita harus menepati janji dan dapat mengendalikan amarah.`;
const BACAAN_HAK = `Di sekolah, setiap siswa memiliki hak dan kewajiban. Hak adalah sesuatu yang patut kita terima, misalnya mendapat pelajaran, menggunakan fasilitas sekolah, dan diperlakukan dengan adil.

Kewajiban adalah sesuatu yang harus kita lakukan, misalnya datang tepat waktu, mengerjakan tugas, menjaga kebersihan kelas, dan menghormati guru serta teman.

Hak dan kewajiban harus seimbang. Jika kita ingin kelas yang nyaman, kita juga wajib ikut piket dan tidak membuang sampah sembarangan.`;

// ---------- Simulasi data server (Komunikasi & dokumen) ----------
const sim = { kontak: null, blast: null, antrean: null, atur: null };
const DOK_KEY = 'mtp_demo_dok';
function dokBaca() { try { return JSON.parse(lokal.get(DOK_KEY) || '{}'); } catch (e) { return {}; } }
function dokTulis(m) { lokal.set(DOK_KEY, JSON.stringify(m)); }
const JENIS_DOK = { RPP: ['RPP', 'Rencana Pelaksanaan Pembelajaran'], ABSEN: ['ABS', 'Rekap Kehadiran Peserta Didik'], LEGER: ['LGR', 'Leger / Rekap Nilai'], SOAL: ['ASM', 'Naskah Asesmen'], JURNAL: ['JRN', 'Jurnal Mengajar'], RAPOR: ['DSK', 'Deskripsi Capaian Rapor'], UMUM: ['DOK', 'Dokumen'] };
const ROMAWI = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
function kodeAcak() { const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; const r = new Uint8Array(20); crypto.getRandomValues(r); return Array.from(r, (b) => a[b % a.length]).join(''); }
function nomorDok(jenis, peta, tgl = today()) {
  const [kode] = JENIS_DOK[jenis] || JENIS_DOK.UMUM;
  const urut = Object.values(peta).filter((d) => d.jenis === jenis).length + 1;
  const d = parseYmd(tgl);
  return `${String(urut).padStart(3, '0')}/${kode}/${DEMO_SEKOLAH.npsn}/${ROMAWI[d.getMonth() + 1]}/${d.getFullYear()}`;
}
const ttdKepsek = (waktu) => [{ nama: DEMO_SEKOLAH.kepsek_nama, jabatan: 'Kepala Sekolah', nip: DEMO_SEKOLAH.kepsek_nip, waktu }];

/** Terbitkan dokumen di Mode Demo (nomor & kode verifikasi disimulasikan di perangkat). */
export function demoTerbitkan({ jenis, ref_id, judul, butuh_ttd = false, ringkasan = '', tanggal }) {
  const peta = dokBaca();
  const lama = Object.values(peta).find((d) => d.ref_id === ref_id && d.status !== 'DITARIK');
  if (lama && !butuh_ttd) return lama;
  if (lama) lama.status = 'DITARIK';
  const kode = kodeAcak();
  const waktu = tanggal ? new Date(parseYmd(tanggal).getTime() + 9 * 36e5).toISOString() : new Date().toISOString();
  const d = { id: 'DOK-' + kode.slice(0, 8), ref_id, jenis, jenisLabel: (JENIS_DOK[jenis] || JENIS_DOK.UMUM)[1], judul, nomor: nomorDok(jenis, peta, tanggal), status: butuh_ttd ? 'MENUNGGU_TTD' : 'TERBIT', kode, hash: Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) => b.toString(16).padStart(2, '0')).join(''), sekolah: DEMO_SEKOLAH.nama, penerbit: DEMO_USER.nama, penandatangan: [], dibuat: waktu, terbit: butuh_ttd ? '' : waktu, ringkasan };
  peta[kode] = d; dokTulis(peta);
  return d;
}
export function demoSahkan(ref_id, waktu) {
  const peta = dokBaca();
  const d = Object.values(peta).find((x) => x.ref_id === ref_id && x.status === 'MENUNGGU_TTD');
  if (!d) return null;
  const w = waktu || new Date().toISOString();
  Object.assign(d, { status: 'TERBIT', terbit: w, penandatangan: ttdKepsek(w) });
  dokTulis(peta);
  return d;
}
export const demoDokUntuk = (ref_id) => Object.values(dokBaca()).filter((d) => d.ref_id === ref_id && d.status !== 'DITARIK').pop() || null;
export function demoVerifikasi(kode) { const d = dokBaca()[kode]; if (!d) return null; const p = Object.assign({}, d); delete p.ref_id; p.valid = d.status === 'TERBIT'; return p; }
export const demoDaftarDok = () => Object.values(dokBaca()).sort((a, b) => String(b.dibuat).localeCompare(String(a.dibuat)));

const EVENTS = [
  { kode: 'ABSEN_TIDAK_HADIR', label: 'Siswa tidak hadir hari ini (Sakit/Izin/Alfa) — ke wali', wa: true, email: true, aktifSaya: true, pesan: 'Yth. Bapak/Ibu {nama},\nKami informasikan ananda *{nama_siswa}* ({kelas}) tercatat *{status}* pada {tanggal}.{ket}\nTerima kasih atas perhatiannya.\n— {guru}, {sekolah}' },
  { kode: 'ALFA_BERULANG', label: 'Peringatan alfa ≥ 3 kali dalam 30 hari — ke wali', wa: true, email: true, aktifSaya: true, pesan: 'Yth. Bapak/Ibu {nama},\nAnanda *{nama_siswa}* ({kelas}) tercatat tidak hadir tanpa keterangan sebanyak *{jumlah} kali* dalam 30 hari terakhir. Mohon Bapak/Ibu dapat menghubungi wali kelas.\n— {guru}, {sekolah}' },
  { kode: 'PENGUMUMAN', label: 'Pengumuman / broadcast dari guru', wa: true, email: false, aktifSaya: true, pesan: '{pesan}' },
  { kode: 'RPP_DITELAAH', label: 'Hasil telaah RPP — ke guru', wa: true, email: true, aktifSaya: true, pesan: 'Yth. Bapak/Ibu {nama},\nRPP "{judul}" telah ditelaah oleh {kepsek}: *{status}*.\nCatatan: {catatan}\nBuka: {link}' }
];
function siswaSemua() { return db.all('Siswa', (s) => String(s.aktif) !== '0').map((s) => ({ s, k: db.get('Kelas', s.kelas_id) || {} })); }
function siapkanSim() {
  if (sim.kontak) return;
  const r = acak(77);
  sim.kontak = siswaSemua().map(({ s, k }, i) => ({ KontakID: 'KTK-' + s.id, Nama: s.nama_wali, Email: s.email_wali, NoWA: s.hp_wali, StatusWA: i % 17 === 9 ? 'Tidak Terdaftar' : i % 11 === 5 ? '' : 'Terdaftar', OptOut: i === 14 ? 'YA' : 'TIDAK', JumlahPesan: 2 + Math.floor(r() * 9), Info: { siswa: s.nama, kelas: k.nama } }));
  sim.atur = { events: EVENTS.map((e) => Object.assign({}, e)), global: { wa: true, email: true, fonnte: true } };
  const t = (n, jam = 7) => new Date(parseYmd(addDays(today(), -n)).getTime() + jam * 36e5 + 17 * 6e4).toISOString();
  sim.blast = [
    { BlastID: 'BLW-0003', Judul: 'Undangan Rapat Orang Tua Semester Ganjil', Status: 'Selesai', Total: 54, Terkirim: 52, Gagal: 2, Tanggal: t(6, 14) },
    { BlastID: 'BLW-0002', Judul: 'Pengingat Kunjungan Belajar ke Sawah Desa', Status: 'Selesai', Total: 28, Terkirim: 28, Gagal: 0, Tanggal: t(13, 15) },
    { BlastID: 'BLW-0001', Judul: 'Jadwal Asesmen Sumatif Tengah Semester', Status: 'Selesai', Total: 55, Terkirim: 54, Gagal: 1, Tanggal: t(41, 13) }
  ];
  const q = [];
  db.all('Absensi', (a) => a.tanggal >= addDays(today(), -10)).sort((a, b) => String(b.tanggal).localeCompare(String(a.tanggal))).forEach((a) => {
    Object.entries(a.status || {}).forEach(([sid, st]) => {
      if (st === 'H') return;
      const s = db.get('Siswa', sid); if (!s || !s.hp_wali) return;
      const n = Math.round((parseYmd(today()) - parseYmd(a.tanggal)) / 864e5);
      q.push({ kanal: 'WA', nama: s.nama_wali, tujuan: s.hp_wali.replace(/^0/, '62'), event: 'ABSEN_TIDAK_HADIR', status: n === 0 ? 'Antri' : 'Terkirim', dibuat: t(n, 9), dikirim: n === 0 ? '' : t(n, 9) });
    });
  });
  const budi = db.get('Siswa', 'S4B05');
  if (budi) q.splice(2, 0, { kanal: 'WA', nama: budi.nama_wali, tujuan: budi.hp_wali.replace(/^0/, '62'), event: 'ALFA_BERULANG', status: 'Terkirim', dibuat: t(3, 10), dikirim: t(3, 10) }, { kanal: 'EMAIL', nama: budi.nama_wali, tujuan: budi.email_wali || 'joko.pratama@contoh.id', event: 'ALFA_BERULANG', status: 'Terkirim', dibuat: t(3, 10), dikirim: t(3, 10) });
  q.push({ kanal: 'EMAIL', nama: DEMO_USER.nama, tujuan: DEMO_USER.email, event: 'RPP_DITELAAH', status: 'Terkirim', dibuat: t(1, 13), dikirim: t(1, 13) });
  siswaSemua().slice(0, 12).forEach(({ s }, i) => q.push({ kanal: 'WA', nama: s.nama_wali, tujuan: s.hp_wali.replace(/^0/, '62'), event: 'PENGUMUMAN', status: i === 7 ? 'Gagal' : 'Terkirim', dibuat: t(6, 14), dikirim: t(6, 14) }));
  sim.antrean = q.sort((a, b) => String(b.dibuat).localeCompare(String(a.dibuat))).slice(0, 100);
}
export const demoKom = {
  kontak() {
    siapkanSim();
    const semua = siswaSemua(), ada = new Map(sim.kontak.map((k) => [k.KontakID, k]));
    sim.kontak = semua.map(({ s, k }) => Object.assign(ada.get('KTK-' + s.id) || { KontakID: 'KTK-' + s.id, StatusWA: '', OptOut: 'TIDAK', JumlahPesan: 0 }, { Nama: s.nama_wali || 'Wali ' + s.nama, Email: s.email_wali, NoWA: s.hp_wali, Info: { siswa: s.nama, kelas: k.nama } }));
    return sim.kontak;
  },
  riwayat() { siapkanSim(); return { blast: sim.blast, antrean: sim.antrean }; },
  atur() { siapkanSim(); return sim.atur; },
  optOut(id, v) { siapkanSim(); const k = sim.kontak.find((x) => x.KontakID === id); if (k) k.OptOut = v; },
  cekWa() { this.kontak(); let n = 0; sim.kontak.forEach((k) => { if (!k.StatusWA && k.NoWA) { k.StatusWA = 'Terdaftar'; n++; } }); return n; },
  simpanAtur(d) { siapkanSim(); sim.atur.events.forEach((e) => { if (e.kode in d) e.aktifSaya = !!d[e.kode]; }); },
  kirim({ judul, pesan, kelas_ids }) {
    this.kontak();
    const target = sim.kontak.filter((k) => k.OptOut !== 'YA' && k.NoWA && (!kelas_ids.length || kelas_ids.some((kid) => (db.get('Kelas', kid) || {}).nama === k.Info.kelas)));
    const w = new Date().toISOString();
    sim.blast.unshift({ BlastID: 'BLW-' + String(sim.blast.length + 1).padStart(4, '0'), Judul: judul, Status: 'Selesai', Total: target.length, Terkirim: target.length, Gagal: 0, Tanggal: w });
    target.slice(0, 20).forEach((k) => sim.antrean.unshift({ kanal: 'WA', nama: k.Nama, tujuan: k.NoWA.replace(/^0/, '62'), event: 'PENGUMUMAN', status: 'Terkirim', dibuat: w, dikirim: w, pesan }));
    return target.length;
  }
};

// ---------- Penyemaian ----------
export function semaiDemo() {
  const r = acak(42);
  Object.keys(sim).forEach((k) => { sim[k] = null; });
  dokTulis({});
  const put = (t, id, f) => db.put(t, id, f, { noSync: true });
  const t0 = today();
  const ta = tahunAjaran(), sem = semesterSekarang();

  // Kelas & siswa
  put('Kelas', 'K4B', { nama: '4-B', jenjang: 'SD', fase: 'B', tingkat: 4, tahun_ajaran: ta, semester: sem, wali: DEMO_USER.nama, warna: 'pl', urutan: 1 });
  put('Kelas', 'K4A', { nama: '4-A', jenjang: 'SD', fase: 'B', tingkat: 4, tahun_ajaran: ta, semester: sem, wali: 'Ahmad Fauzi, S.Pd.', warna: 'mt', urutan: 2 });
  const siswa = { K4B: [], K4A: [] };
  const kemampuan = {};
  const KEBUTUHAN = { S4B08: 'Perlu pendampingan fokus saat diskusi', S4B12: 'Alergi debu — duduk jauh dari jendela', S4B15: 'Program pendampingan literasi', S4A11: 'Perlu alat peraga konkret untuk pecahan' };
  [['K4B', '4B', SISWA_4B, 81], ['K4A', '4A', SISWA_4A, 47]].forEach(([kid, kd, daftar, seed]) => {
    daftar.forEach(([nama, jk, wali], i) => {
      const id = `S${kd}${pad2(i + 1)}`;
      siswa[kid].push(id);
      const email = i % 3 === 0 ? wali.replace(/^(Bpk\.|Ibu)\s+/, '').toLowerCase().replace(/[^a-z ]/g, '').trim().replace(/\s+/g, '.') + '@contoh.id' : '';
      put('Siswa', id, { kelas_id: kid, no: i + 1, nama, nisn: '01' + String(31570000 + seed * 100 + i * 7), jk, nama_wali: wali, hp_wali: '08' + ['12', '13', '21', '52', '57', '77', '81', '95'][i % 8] + String(10000000 + ((i + 3) * 7919 * seed) % 89999999).slice(0, 8), email_wali: email, kebutuhan: KEBUTUHAN[id] || '', aktif: 1 });
      kemampuan[id] = 72 + Math.round(r() * 24);
    });
  });
  Object.assign(kemampuan, { S4B03: 95, S4B20: 92, S4B05: 63, S4B08: 66, S4B25: 64, S4B15: 69, S4A11: 65, S4A03: 93 });

  // Mapel
  const BOBOT = { formatif: 40, sumatif_lm: 40, sumatif_as: 20 };
  [['M1', 'K4B', 'IPAS', 5, 'pl'], ['M2', 'K4B', 'Matematika', 6, 'mt'], ['M3', 'K4B', 'Bahasa Indonesia', 6, 'gr'], ['M5', 'K4B', 'Pendidikan Pancasila', 2, 'at'], ['M4', 'K4A', 'Matematika', 6, 'mt'], ['M6', 'K4A', 'IPAS', 5, 'pl']]
    .forEach(([id, k, nama, jp, w]) => put('Mapel', id, { kelas_id: k, nama, jp, kktp: 75, bobot: BOBOT, warna: w }));

  // Tujuan pembelajaran
  Object.entries(TP_DATA).forEach(([m, list]) => list.forEach(([kode, rumusan, bab, minggu], i) => put('TP', tpId(m, i), { mapel_id: m, kode, rumusan, bab, urutan: i + 1, minggu })));

  // Jadwal mingguan (Senin–Sabtu). Hari ini selalu berisi 3 pertemuan agar beranda terisi.
  const J = [[1, 'M1', 'K4B', '07:30', '09:00'], [1, 'M2', 'K4B', '09:30', '11:00'], [1, 'M5', 'K4B', '11:15', '12:25'],
    [2, 'M3', 'K4B', '07:30', '09:00'], [2, 'M4', 'K4A', '09:30', '11:00'], [2, 'M6', 'K4A', '11:15', '12:25'],
    [3, 'M1', 'K4B', '07:30', '09:00'], [3, 'M4', 'K4A', '09:30', '11:00'], [3, 'M3', 'K4B', '11:15', '12:15'],
    [4, 'M2', 'K4B', '07:30', '09:00'], [4, 'M6', 'K4A', '09:30', '11:00'], [4, 'M3', 'K4B', '11:15', '12:15'],
    [5, 'M1', 'K4B', '07:30', '09:00'], [5, 'M3', 'K4B', '09:30', '10:30'], [5, 'M4', 'K4A', '10:45', '12:00'],
    [6, 'M2', 'K4B', '07:30', '09:00'], [6, 'M5', 'K4B', '09:30', '10:40']];
  const h = hariKe(t0) || 6;
  const hariIni = [['M1', 'K4B', '07:30', '09:00'], ['M4', 'K4A', '09:30', '11:00'], ['M3', 'K4B', '11:15', '12:15']];
  const ruang = (k) => 'Ruang Kelas ' + (k === 'K4A' ? '4-A' : '4-B');
  J.filter((x) => x[0] !== h).forEach(([hari, m, k, a, b], i) => put('Jadwal', 'J' + (i + 1), { hari, mapel_id: m, kelas_id: k, mulai: a, selesai: b, ruang: ruang(k) }));
  hariIni.forEach(([m, k, a, b], i) => put('Jadwal', 'JH' + (i + 1), { hari: h, mapel_id: m, kelas_id: k, mulai: a, selesai: b, ruang: ruang(k) }));

  // Bank soal
  SOAL_DATA.forEach(([m, tpi, tipe, teks, opsi, kunci, bloom, level, skor], i) => put('Soal', 'Q' + (i + 1), { mapel_id: m, tp_id: tpId(m, tpi), tipe, teks, opsi, kunci, bloom, level, skor, pembahasan: tipe === 'uraian' ? 'Nilai dengan rubrik; beri umpan balik tertulis.' : '' }));

  // Asesmen + nilai (+ skor per butir untuk asesmen yang memakai bank soal)
  const nilaiTp = {}; // `${sid}|${mapel}|${tp}` → [nilai]
  ASESMEN_DATA.forEach(([id, k, m, nama, jenis, mundur, tps, sulit, soalIds]) => {
    const nilai = {}, butir = {};
    // Setiap asesmen memakai butir dari bank soal (TP yang diukur didahulukan) agar kisi-kisi & analisis butir terisi.
    const bank = SOAL_DATA.map((x, i) => ({ id: 'Q' + (i + 1), m: x[0], tpi: x[1] })).filter((q) => q.m === m);
    const pilih = soalIds || bank.filter((q) => tps.includes(q.tpi)).concat(bank.filter((q) => !tps.includes(q.tpi))).slice(0, jenis === 'formatif' ? 4 : 5).map((q) => q.id);
    const soal = pilih.map((q) => db.get('Soal', q));
    siswa[k].forEach((sid) => {
      const dasar = kemampuan[sid] - sulit / 2 + Math.round((r() - 0.5) * 12);
      if (soal.length) {
        const b = {}; let skor = 0, maks = 0;
        soal.forEach((q) => { const mx = Number(q.skor) || 1; const peluang = Math.min(0.97, Math.max(0.2, (dasar - 15) / 81)); const v = mx === 1 ? (r() < peluang ? 1 : 0) : Math.max(1, Math.min(4, Math.round(peluang * 4 + (r() - 0.5)))); b[q.id] = v; skor += v; maks += mx; });
        butir[sid] = b;
        nilai[sid] = Math.round((skor / maks) * 1000) / 10;
      } else nilai[sid] = Math.max(45, Math.min(100, dasar));
      tps.forEach((ti) => { const key = `${sid}|${m}|${ti}`; (nilaiTp[key] = nilaiTp[key] || []).push(nilai[sid]); });
    });
    put('Asesmen', id, { kelas_id: k, mapel_id: m, nama, jenis, tanggal: addDays(t0, -mundur), tp_ids: tps.map((ti) => tpId(m, ti)), soal_ids: pilih, bobot: 1, nilai, catatan: {}, butir });
  });

  // Deskripsi capaian rapor (disimpan sebagai Catatan jenis rapor:<mapel>)
  const rumus = (m, ti) => TP_DATA[m][ti][1].replace(/^Peserta didik mampu\s*/, '').replace(/\.$/, '');
  [['K4B', ['M1', 'M2', 'M3', 'M5']], ['K4A', ['M4', 'M6']]].forEach(([k, mapel]) => mapel.forEach((m) => siswa[k].forEach((sid) => {
    const per = TP_DATA[m].map((_, ti) => { const v = nilaiTp[`${sid}|${m}|${ti}`]; return v ? [ti, v.reduce((a, x) => a + x, 0) / v.length] : null; }).filter(Boolean).sort((a, b) => b[1] - a[1]);
    if (!per.length) return;
    const tinggi = per[0], rendah = per[per.length - 1];
    let isi = `Menunjukkan penguasaan yang ${tinggi[1] >= 90 ? 'sangat baik' : 'baik'} dalam ${rumus(m, tinggi[0])}.`;
    if (per.length > 1 && rendah[1] < 80) isi += ` Perlu bantuan dalam ${rumus(m, rendah[0])}.`;
    else if (per.length > 1) isi += ` Perlu meningkatkan ketelitian dalam ${rumus(m, rendah[0])}.`;
    put('Catatan', `RAP-${m}-${sid}`, { siswa_id: sid, kelas_id: k, tanggal: addDays(t0, -1), jenis: 'rapor:' + m, isi });
  })));

  // RPP
  const RPP = [
    ['R1', 'K4B', 'M1', 'Ekosistem Sawah & Rantai Makanan', 'Bab 4: Ekosistem & Rantai Makanan', 0, 'final', [7], ['Penalaran Kritis', 'Kreativitas', 'Kolaborasi'], 'Problem Based Learning', 'sawah irigasi di sekitar sekolah', 'ai'],
    ['R2', 'K4A', 'M4', 'Pecahan Desimal & Nilai Tempat', 'Bab 3: Desimal', 0, 'disetujui', [2, 3], ['Penalaran Kritis', 'Kemandirian'], 'Discovery Learning', 'kegiatan jual beli di kantin sekolah', 'ai'],
    ['R3', 'K4B', 'M3', 'Membaca Intensif Cerita Rakyat', 'Bab 3: Cerita Rakyat Nusantara', 0, 'draf', [4], ['Komunikasi', 'Kewargaan'], 'Literasi Terbimbing', 'cerita rakyat daerah asal siswa', 'templat'],
    ['R4', 'K4B', 'M2', 'Mengubah Pecahan ke Desimal', 'Bab 3: Desimal', 4, 'revisi', [4], ['Penalaran Kritis'], 'Discovery Learning', 'resep kue dan takaran bahan', 'ai'],
    ['R5', 'K4B', 'M1', 'Peran Produsen, Konsumen & Pengurai', 'Bab 4: Ekosistem & Rantai Makanan', -7, 'disetujui', [7], ['Penalaran Kritis', 'Kolaborasi'], 'Inquiry Learning', 'kebun sekolah', 'ai'],
    ['R6', 'K4B', 'M1', 'Jaring-jaring Makanan di Sekitar Sekolah', 'Bab 4: Ekosistem & Rantai Makanan', 2, 'diajukan', [8], ['Kreativitas', 'Kolaborasi'], 'Project Based Learning', 'taman dan kebun sekolah', 'ai'],
    ['R7', 'K4B', 'M2', 'Nilai Tempat Bilangan Desimal', 'Bab 3: Desimal', 1, 'final', [5], ['Penalaran Kritis', 'Kemandirian'], 'Pembelajaran Kontekstual (CTL)', 'harga barang di toko sekitar', 'templat'],
    ['R8', 'K4B', 'M3', 'Menulis Laporan Pengamatan', 'Bab 2: Menulis Laporan', -5, 'disetujui', [2, 3], ['Komunikasi', 'Kemandirian'], 'Pembelajaran Berdiferensiasi', 'pengamatan tanaman di kelas', 'ai'],
    ['R9', 'K4B', 'M5', 'Hak dan Kewajiban di Sekolah', 'Bab 2: Hak dan Kewajiban', 3, 'final', [2], ['Kewargaan', 'Kolaborasi'], 'Cooperative Learning', 'kesepakatan kelas', 'templat'],
    ['R10', 'K4A', 'M6', 'Komponen Biotik dan Abiotik', 'Bab 4: Ekosistem & Rantai Makanan', -1, 'final', [2], ['Penalaran Kritis', 'Kesehatan'], 'Inquiry Learning', 'halaman sekolah', 'ai'],
    ['R11', 'K4A', 'M4', 'Membandingkan Pecahan', 'Bab 2: Pecahan', -8, 'disetujui', [1], ['Penalaran Kritis'], 'Discovery Learning', 'membagi kue saat ulang tahun', 'ai'],
    ['R12', 'K4B', 'M1', 'Dampak Hilangnya Predator Sawah', 'Bab 4: Ekosistem & Rantai Makanan', 7, 'draf', [9], ['Penalaran Kritis', 'Kewargaan'], 'Problem Based Learning', 'berita perburuan ular sawah', 'ai']
  ];
  const CATATAN_TELAAH = { disetujui: ['RPP runtut, kontekstual, dan diferensiasinya jelas. Disetujui.', 'Pengalaman belajar sudah mencerminkan prinsip berkesadaran, bermakna, dan menggembirakan. Lanjutkan.', 'Asesmen selaras dengan TP. Pastikan refleksi 10 menit benar-benar dilaksanakan.', 'Pemanfaatan konteks lokal sangat baik. Disetujui.'], revisi: ['Tambahkan diferensiasi untuk kelompok pemula dan rumuskan asesmen formatif yang lebih konkret.'] };
  let ci = 0;
  RPP.forEach(([id, k, m, judul, materi, hari, status, tps, dimensi, model, konteks, ai]) => {
    const n = siswa[k].length; const pemula = Math.round(n * 0.25), cakap = Math.round(n * 0.2);
    const isi = genRpp({ materi: judul.toLowerCase(), jenjang: 'SD', fase: 'B', jp: 2, dimensi, konteks, model, cp: CP[m], tp: tps.map((ti) => TP_DATA[m][ti][1]) });
    isi.identifikasi.kesiapan = `Hasil asesmen diagnostik: ${pemula} peserta didik pemula, ${n - pemula - cakap} berkembang, dan ${cakap} cakap. Sebagian besar sudah mengenal konsep dasar ${judul.toLowerCase()} dari pengalaman sehari-hari di ${konteks}.`;
    const tglR = addDays(t0, hari);
    const f = { kelas_id: k, mapel_id: m, judul, materi, jp: 2, pertemuan: 1, tanggal: tglR, model, dimensi, mode_kbc: '0', status, versi: status === 'revisi' ? 2 : 1, isi: Object.assign({ menit_jp: 35, cp: CP[m] }, isi, { _draf: status === 'draf' ? ai : '' }), tp_ids: tps.map((ti) => tpId(m, ti)), ai };
    const tglT = [addDays(tglR, -2), addDays(t0, -1)].sort()[0];
    const wT = new Date(parseYmd(tglT).getTime() + 13 * 36e5).toISOString();
    if (status === 'disetujui' || status === 'revisi') {
      f.telaah = { keputusan: status, catatan: CATATAN_TELAAH[status][ci++ % CATATAN_TELAAH[status].length], oleh: DEMO_SEKOLAH.kepsek_nama, waktu: wT, skor: status === 'disetujui' ? 93.8 : 68.8 };
    }
    if (status === 'disetujui') { const d = demoTerbitkan({ jenis: 'RPP', ref_id: id, judul, butuh_ttd: true, tanggal: addDays(tglT, -1) }); demoSahkan(id, wT); f.dok_kode = d.kode; }
    if (status === 'diajukan') { const d = demoTerbitkan({ jenis: 'RPP', ref_id: id, judul, butuh_ttd: true }); f.dok_kode = d.kode; }
    put('RPP', id, f);
  });
  // Dokumen terbit lain (rekap presensi bulan lalu)
  const bl = parseYmd(t0); bl.setMonth(bl.getMonth() - 1);
  demoTerbitkan({ jenis: 'ABSEN', ref_id: `ABS-K4B-${ymd(bl).slice(0, 7)}`, judul: `Rekap Presensi Kelas 4-B — ${BULAN[bl.getMonth()]} ${bl.getFullYear()}`, tanggal: addDays(t0, -20) });

  // Materi & media
  const L = genLkpd({ materi: 'jaring-jaring makanan di sekitar sekolah', tp: TP_DATA.M1[8][1] });
  const L2 = genLkpd({ materi: 'pecahan desimal dan nilai tempat', tp: TP_DATA.M2[4][1] });
  [['MT1', 'M1', 'R1', 'video', 'Video: Rantai Makanan di Sawah', 'https://www.youtube.com/results?search_query=rantai+makanan+ekosistem+sawah+kelas+4', ''],
    ['MT2', 'M1', 'R1', 'teks', 'Bacaan: Kehidupan di Petak Sawah', '', BACAAN_SAWAH],
    ['MT3', 'M1', 'R6', 'lkpd', 'LKPD Jaring-jaring Makanan', '', JSON.stringify(L)],
    ['MT4', 'M1', '', 'tautan', 'Rumah Belajar Kemendikdasmen — IPAS', 'https://belajar.kemdikbud.go.id/', ''],
    ['MT5', 'M1', 'R5', 'gambar', 'Galeri foto: jaring-jaring makanan (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/Category:Food_webs', ''],
    ['MT6', 'M2', 'R4', 'teks', 'Ringkasan: Pecahan dan Desimal', '', BACAAN_PECAHAN],
    ['MT7', 'M2', 'R7', 'video', 'Video: Nilai Tempat Bilangan Desimal', 'https://www.youtube.com/results?search_query=nilai+tempat+bilangan+desimal+kelas+4+sd', ''],
    ['MT8', 'M2', 'R7', 'lkpd', 'LKPD Pecahan Desimal', '', JSON.stringify(L2)],
    ['MT9', 'M3', 'R3', 'teks', 'Cerita Rakyat: Asal-usul Danau Toba (ringkasan)', '', BACAAN_TOBA],
    ['MT10', 'M3', '', 'tautan', 'Buku Teks Bahasa Indonesia Kelas 4 (SIBI)', 'https://buku.kemdikbud.go.id/', ''],
    ['MT11', 'M5', 'R9', 'teks', 'Bacaan: Hak dan Kewajiban Siswa di Sekolah', '', BACAAN_HAK],
    ['MT12', 'M4', 'R11', 'tautan', 'Simulasi interaktif pecahan (PhET)', 'https://phet.colorado.edu/en/simulations/fractions-intro', '']]
    .forEach(([id, m, rpp, tipe, judul, url, isi]) => put('Materi', id, { mapel_id: m, rpp_id: rpp, tipe, judul, url, isi }));

  // Absensi 40 hari sekolah terakhir (Senin–Sabtu, kecuali libur nasional)
  const hariSekolah = [];
  for (let d = addDays(t0, -1); hariSekolah.length < 40; d = addDays(d, -1)) if (hariKe(d) !== 0 && !LIBUR_TETAP[d.slice(5)]) hariSekolah.push(d);
  const KET_S = ['Demam', 'Batuk pilek', 'Sakit perut', 'Kontrol ke dokter'], KET_I = ['Acara keluarga', 'Menghadiri pernikahan saudara', 'Keperluan keluarga'];
  hariSekolah.forEach((d, n) => {
    ['K4B', 'K4A'].forEach((k) => {
      const status = {}, ket = {};
      siswa[k].forEach((sid) => {
        const x = r();
        let s = x > 0.975 ? 'S' : x > 0.962 ? 'I' : x > 0.957 ? 'A' : 'H';
        if (sid === 'S4B05' && [1, 4, 9].includes(n)) s = 'A';
        status[sid] = s;
        if (s === 'S') ket[sid] = KET_S[Math.floor(r() * KET_S.length)];
        if (s === 'I') ket[sid] = KET_I[Math.floor(r() * KET_I.length)];
      });
      put('Absensi', `A-${k}-${d}`, { kelas_id: k, tanggal: d, status, ket });
    });
  });
  if (hariKe(t0) !== 0) { // hari ini: kelas 4-A sudah diabsen, 4-B belum (siap dicoba)
    const st = {}; siswa.K4A.forEach((sid) => { st[sid] = 'H'; }); st.S4A02 = 'S';
    put('Absensi', `A-K4A-${t0}`, { kelas_id: 'K4A', tanggal: t0, status: st, ket: { S4A02: 'Surat dokter' } });
  }

  // Tugas & koreksi
  [['T1', 'K4B', 'M1', 'Portofolio Ekosistem Sawah', -1, 'diterima', 28, 22, 16, ''], ['T2', 'K4A', 'M4', 'Latihan Pecahan Desimal', 0, 'dikoreksi', 27, 27, 22, 'A5'],
    ['T3', 'K4B', 'M3', 'Menulis Ringkasan Cerita Rakyat', 1, 'diterima', 28, 26, 24, ''], ['T4', 'K4B', 'M2', 'PR Nilai Tempat Desimal', 3, 'diberikan', 28, 0, 0, ''],
    ['T5', 'K4B', 'M1', 'Poster Jaring-jaring Makanan', -6, 'dikembalikan', 28, 28, 28, ''], ['T6', 'K4A', 'M6', 'Lembar Kerja Komponen Biotik', 2, 'diberikan', 27, 0, 0, ''],
    ['T7', 'K4B', 'M3', 'Laporan Pengamatan Tanaman', -9, 'dikembalikan', 28, 28, 28, 'A12'], ['T8', 'K4B', 'M5', 'Kuis Sila-sila Pancasila', -2, 'dikoreksi', 28, 27, 20, '']]
    .forEach(([id, k, m, judul, dd, status, total, terkumpul, dikoreksi, ases]) => put('Tugas', id, { kelas_id: k, mapel_id: m, judul, tenggat: addDays(t0, dd), status, total, terkumpul, dikoreksi, catatan: '', asesmen_id: ases }));

  // Catatan anekdot
  [['C1', 'S4B08', -2, 'perilaku', 'Penurunan fokus saat diskusi kelompok; dipindahkan duduk dekat guru dan diberi peran pencatat.'],
    ['C2', 'S4B25', -4, 'akademik', 'Nilai formatif Matematika di bawah KKTP; dijadwalkan remedial hari Kamis setelah pulang sekolah.'],
    ['C3', 'S4B03', -6, 'prestasi', 'Juara 2 lomba cerdas cermat IPA tingkat kecamatan.'],
    ['C4', 'S4B05', -3, 'perilaku', 'Tiga kali tidak hadir tanpa keterangan bulan ini; wali sudah dihubungi melalui WhatsApp.'],
    ['C5', 'S4B12', -10, 'kesehatan', 'Alergi debu kambuh saat piket; disarankan memakai masker dan duduk jauh dari jendela.'],
    ['C6', 'S4B20', -8, 'prestasi', 'Aktif bertanya dan membantu teman kelompok saat praktikum rantai makanan.'],
    ['C7', 'S4B15', -11, 'akademik', 'Membaca masih terbata-bata; mengikuti program pendampingan literasi 15 menit setiap pagi.'],
    ['C8', 'S4B22', -14, 'perilaku', 'Beberapa kali terlambat masuk kelas setelah istirahat; sudah dibuat kesepakatan bersama.'],
    ['C9', 'S4A11', -5, 'akademik', 'Kesulitan membandingkan pecahan berpenyebut berbeda; perlu alat peraga konkret.'],
    ['C10', 'S4A03', -7, 'prestasi', 'Membuat alat peraga pecahan dari kardus bekas untuk digunakan teman sekelas.']]
    .forEach(([id, sid, dd, jenis, isi]) => put('Catatan', id, { siswa_id: sid, kelas_id: sid.startsWith('S4A') ? 'K4A' : 'K4B', tanggal: addDays(t0, dd), jenis, isi }));

  // Jurnal mengajar 12 hari sekolah terakhir
  const KENDALA = ['', '', '', 'Proyektor kelas tidak menyala; memakai poster cetak.', '', 'Waktu praktikum kurang 10 menit.', '', '', 'Beberapa siswa belum membawa buku paket.', ''];
  const TL = ['', '', '', 'Siapkan poster cadangan.', '', 'Lanjutkan presentasi kelompok pertemuan berikutnya.', '', '', 'Ingatkan melalui grup WA wali.', ''];
  let jn = 0;
  hariSekolah.slice(0, 12).forEach((d) => {
    db.all('Jadwal', (j) => Number(j.hari) === hariKe(d)).forEach((j) => {
      const tps = TP_DATA[j.mapel_id] || []; const tp = tps[(tps.length - 1 - (jn % 3) + tps.length) % tps.length];
      const a = db.get('Absensi', `A-${j.kelas_id}-${d}`);
      const hadir = a ? Object.values(a.status).filter((x) => x === 'H').length : siswa[j.kelas_id].length;
      const rp = db.all('RPP', (x) => x.mapel_id === j.mapel_id).sort((x, y) => String(y.tanggal).localeCompare(String(x.tanggal))).find((x) => x.tanggal <= d);
      put('Jurnal', 'JR' + (++jn), { tanggal: d, jadwal_id: j.id, kelas_id: j.kelas_id, mapel_id: j.mapel_id, rpp_id: rp ? rp.id : '', topik: rp ? rp.judul : tp[1].replace(/^Peserta didik mampu /, '').replace(/\.$/, ''), kegiatan: ['Apersepsi dengan pertanyaan pemantik, diskusi kelompok, presentasi hasil.', 'Pengamatan langsung, pengisian LKPD, refleksi 3-2-1.', 'Penjelasan konsep dengan alat peraga, latihan terbimbing, kuis singkat.', 'Membaca bersama, tanya jawab, menulis ringkasan.'][jn % 4], hadir, tidak_hadir: siswa[j.kelas_id].length - hadir, kendala: KENDALA[jn % KENDALA.length], tindak_lanjut: TL[jn % TL.length] });
    });
  });

  // Agenda: kegiatan sekolah relatif terhadap hari ini + peringatan nasional di sekitar bulan berjalan
  const rs = rentangSemester();
  [['AG1', addDays(t0, 3), '', 'Rapat KKG Gugus 3', 'rapat', ''], ['AG2', addDays(t0, 9), '', 'Rapat Orang Tua Kelas 4-B', 'rapat', 'K4B'], ['AG3', addDays(t0, 14), '', 'Kunjungan Belajar ke Sawah Desa', 'kegiatan', 'K4B'],
    ['AG4', addDays(t0, 6), '', 'Supervisi Akademik oleh Kepala Sekolah', 'lainnya', ''], ['AG5', addDays(t0, -12), '', 'Rapat Dinas Awal Bulan', 'rapat', ''], ['AG6', addDays(t0, -4), '', 'Jumat Bersih & Penghijauan', 'kegiatan', ''],
    ['AG7', addDays(t0, 1), addDays(t0, 2), 'Pelatihan Pembelajaran Mendalam (guru)', 'kegiatan', ''],
    ['AG8', addDays(rs.selesai, -18), addDays(rs.selesai, -12), 'Asesmen Sumatif Akhir Semester', 'asesmen', ''], ['AG9', addDays(rs.selesai, -10), addDays(rs.selesai, -8), 'Class Meeting', 'kegiatan', ''],
    ['AG10', rs.selesai, '', 'Pembagian Rapor Semester', 'kegiatan', ''], ['AG11', addDays(rs.selesai, 3), addDays(rs.selesai, 16), 'Libur Semester', 'libur', ''],
    ['AG12', addDays(rs.mulai, 42), addDays(rs.mulai, 47), 'Asesmen Sumatif Tengah Semester', 'asesmen', '']]
    .forEach(([id, tanggal, sampai, judul, jenis, kelas_id]) => put('Agenda', id, { tanggal, sampai, judul, jenis, kelas_id }));
  const PERINGATAN = [['04-21', 'Hari Kartini'], ['05-02', 'Hari Pendidikan Nasional'], ['05-20', 'Hari Kebangkitan Nasional'], ['07-23', 'Hari Anak Nasional'], ['08-14', 'Hari Pramuka'], ['10-02', 'Hari Batik Nasional'], ['10-28', 'Hari Sumpah Pemuda'], ['11-10', 'Hari Pahlawan'], ['11-25', 'Hari Guru Nasional'], ['12-22', 'Hari Ibu']];
  const y = parseYmd(t0).getFullYear(); let pi = 0;
  [y - 1, y, y + 1].forEach((th) => PERINGATAN.forEach(([md, judul]) => { const d = `${th}-${md}`; if (d >= addDays(t0, -70) && d <= addDays(t0, 100)) put('Agenda', 'AGP' + (++pi), { tanggal: d, sampai: '', judul: (md === '11-25' ? 'Upacara ' : '') + judul, jenis: 'kegiatan', kelas_id: '' }); }));
  return true;
}
export { ymd };

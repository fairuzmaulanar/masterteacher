// Konstanta kurikulum (dapat diperbarui tanpa mengubah logika aplikasi).
// Acuan: Permendikdasmen No. 1 Tahun 2026 (Standar Proses, RPP Pembelajaran Mendalam),
// Permendikdasmen No. 10 Tahun 2025 (8 dimensi profil lulusan), Panduan Kurikulum Berbasis Cinta (Kemenag).

export const DIMENSI = [
  'Keimanan dan Ketakwaan kepada Tuhan YME', 'Kewargaan', 'Penalaran Kritis', 'Kreativitas',
  'Kolaborasi', 'Kemandirian', 'Kesehatan', 'Komunikasi'
];
export const DIMENSI_PENDEK = {
  'Keimanan dan Ketakwaan kepada Tuhan YME': 'Keimanan & Ketakwaan'
};
export const PRINSIP = ['Berkesadaran', 'Bermakna', 'Menggembirakan'];
export const PENGALAMAN = [
  { k: 'memahami', label: 'Memahami' }, { k: 'mengaplikasi', label: 'Mengaplikasi' }, { k: 'merefleksi', label: 'Merefleksi' }
];
export const KBC = ['Cinta kepada Allah dan Rasul-Nya', 'Cinta ilmu', 'Cinta diri dan sesama', 'Cinta lingkungan', 'Cinta tanah air'];

export const JENJANG = [
  { k: 'SD', label: 'SD / MI', tingkat: [1, 2, 3, 4, 5, 6] },
  { k: 'SMP', label: 'SMP / MTs', tingkat: [7, 8, 9] },
  { k: 'SMA', label: 'SMA / MA / SMK', tingkat: [10, 11, 12] }
];
export function faseDari(tingkat) {
  const t = Number(tingkat);
  if (t <= 2) return 'A'; if (t <= 4) return 'B'; if (t <= 6) return 'C'; if (t <= 9) return 'D'; if (t === 10) return 'E'; return 'F';
}
export const MAPEL = {
  SD: ['Pendidikan Agama dan Budi Pekerti', 'Pendidikan Pancasila', 'Bahasa Indonesia', 'Matematika', 'IPAS', 'Seni dan Budaya', 'PJOK', 'Bahasa Inggris', 'Muatan Lokal', 'Koding dan Kecerdasan Artifisial'],
  SMP: ['Pendidikan Agama dan Budi Pekerti', 'Pendidikan Pancasila', 'Bahasa Indonesia', 'Matematika', 'IPA', 'IPS', 'Bahasa Inggris', 'PJOK', 'Informatika', 'Seni dan Budaya', 'Prakarya', 'Muatan Lokal', 'Koding dan Kecerdasan Artifisial'],
  SMA: ['Pendidikan Agama dan Budi Pekerti', 'Pendidikan Pancasila', 'Bahasa Indonesia', 'Matematika', 'Bahasa Inggris', 'Fisika', 'Kimia', 'Biologi', 'Sosiologi', 'Ekonomi', 'Geografi', 'Sejarah', 'Informatika', 'PJOK', 'Seni dan Budaya', 'Koding dan Kecerdasan Artifisial'],
  MADRASAH: ["Al-Qur'an Hadis", 'Akidah Akhlak', 'Fikih', 'Sejarah Kebudayaan Islam', 'Bahasa Arab']
};
export const MENIT_JP = { SD: 35, SMP: 40, SMA: 45 };

export const BLOOM = [
  { k: 'C1', label: 'Mengingat', level: 'LOTS' }, { k: 'C2', label: 'Memahami', level: 'LOTS' }, { k: 'C3', label: 'Menerapkan', level: 'MOTS' },
  { k: 'C4', label: 'Menganalisis', level: 'HOTS' }, { k: 'C5', label: 'Mengevaluasi', level: 'HOTS' }, { k: 'C6', label: 'Mencipta', level: 'HOTS' }
];
export const levelDariBloom = (b) => (BLOOM.find((x) => x.k === b) || {}).level || 'LOTS';
export const TIPE_SOAL = { pg: 'Pilihan ganda', pgk: 'PG kompleks', bs: 'Benar/Salah', isian: 'Isian singkat', uraian: 'Uraian', jodoh: 'Menjodohkan' };
export const JENIS_ASESMEN = {
  diagnostik: { label: 'Diagnostik', cls: 'b-mt', dinilai: false },
  formatif: { label: 'Formatif', cls: 'b-mt', dinilai: true },
  sumatif_lm: { label: 'Sumatif Lingkup Materi', cls: 'b-qs', dinilai: true },
  sumatif_as: { label: 'Sumatif Akhir Semester', cls: 'b-pl', dinilai: true }
};
export const STATUS_RPP = {
  draf: { label: 'Draf', cls: 'b-draf' }, final: { label: 'Final', cls: 'b-gr' }, diajukan: { label: 'Ditelaah kepsek', cls: 'b-mt' },
  disetujui: { label: 'Disetujui', cls: 'b-gr' }, revisi: { label: 'Perlu revisi', cls: 'b-qs' }
};
export const ABSEN = { H: 'Hadir', S: 'Sakit', I: 'Izin', A: 'Alfa' };
export const HARI_SEKOLAH = [1, 2, 3, 4, 5, 6]; // Senin–Sabtu

/** Hari libur nasional bertanggal tetap. Libur keagamaan (Idulfitri, Iduladha, Nyepi, Waisak, dll.) berubah tiap tahun —
 *  tambahkan di menu Kalender sesuai SKB resmi tahun berjalan. */
export const LIBUR_TETAP = { '01-01': 'Tahun Baru Masehi', '05-01': 'Hari Buruh', '06-01': 'Hari Lahir Pancasila', '08-17': 'Hari Kemerdekaan RI', '12-25': 'Hari Raya Natal' };

export function kategoriNilai(n, kktp = 75) {
  if (n === null || n === undefined || n === '' || isNaN(n)) return { label: '-', cls: 'b-draf' };
  n = Number(n);
  if (n >= 90) return { label: 'Sangat Baik', cls: 'b-gr' };
  if (n >= kktp + 5) return { label: 'Baik', cls: 'b-mt' };
  if (n >= kktp) return { label: 'Cukup', cls: 'b-qs' };
  return { label: 'Perlu Bimbingan', cls: 'b-red' };
}

export function tahunAjaran(d = new Date()) {
  const y = d.getFullYear(), m = d.getMonth() + 1;
  return m >= 7 ? `${y}/${y + 1}` : `${y - 1}/${y}`;
}
export function semesterSekarang(d = new Date()) { const m = d.getMonth() + 1; return m >= 7 ? 1 : 2; }
/** Rentang tanggal semester berjalan (perkiraan; Juli–Desember / Januari–Juni). */
export function rentangSemester(d = new Date()) {
  const y = d.getFullYear();
  return semesterSekarang(d) === 1 ? { mulai: `${y}-07-14`, selesai: `${y}-12-19` } : { mulai: `${y}-01-05`, selesai: `${y}-06-19` };
}

// Data contoh Mode Demo (disemai ulang setiap kali demo dibuka; tidak pernah dikirim ke server).
import { db } from './store.js';
import { today, addDays, hariKe, ymd } from './util.js';
import { rpp as genRpp } from './generator.js';
import { tahunAjaran, semesterSekarang } from './kurikulum.js';

const NAMA = ['Adinda Putri', 'Ahmad Zaki', 'Alya Ramadhani', 'Bagas Saputra', 'Budi Pratama', 'Citra Lestari', 'Dewi Anggraini', 'Dimas Anggara', 'Fajar Nugroho', 'Fitri Handayani',
  'Galih Pamungkas', 'Hana Safitri', 'Indra Wijaya', 'Intan Permata', 'Joko Susilo', 'Kirana Ayu', 'Lukman Hakim', 'Maya Sari', 'Nabila Zahra', 'Naufal Rizky',
  'Putri Maharani', 'Raka Aditya', 'Rizki Ananda', 'Salsabila', 'Siti Nurhaliza', 'Tegar Prakoso', 'Wulan Dari', 'Yusuf Maulana'];

export const DEMO_USER = { id: 'DEMO', email: 'demo@masterteacher.id', nama: 'Rina Saraswati, S.Pd.', peran: 'guru', nip: '19880415 201101 2 007', mapel_utama: 'Guru Kelas', jenjang: 'SD', mode_kbc: '0', onboarded: '1', wa: '081234567890', updated_at: '1' };
export const DEMO_SEKOLAH = { id: 'SDEMO', nama: 'SD Negeri 01 Pagi', npsn: '20104592', jenjang: 'SD', alamat: 'Jl. Percetakan Negara No. 12', kota: 'Jakarta Pusat', provinsi: 'DKI Jakarta', telp: '(021) 4211234', email: 'sdn01pagi@contoh.sch.id', kepsek_nama: 'Drs. H. Bambang Irawan, M.Pd.', kepsek_nip: '19700312 199503 1 004', kop_atas: 'PEMERINTAH PROVINSI DKI JAKARTA\nDINAS PENDIDIKAN', logo: '', kode_undangan: 'DEMO26', bolehKelola: true, updated_at: '1' };

function acak(seed) { let x = seed; return () => { x = (x * 9301 + 49297) % 233280; return x / 233280; }; }

export function semaiDemo() {
  const r = acak(42);
  const put = (t, id, f) => db.put(t, id, f, { noSync: true });
  const ta = tahunAjaran(), sem = semesterSekarang();
  put('Kelas', 'K4B', { nama: '4-B', jenjang: 'SD', fase: 'B', tingkat: 4, tahun_ajaran: ta, semester: sem, wali: DEMO_USER.nama, warna: 'pl', urutan: 1 });
  put('Kelas', 'K4A', { nama: '4-A', jenjang: 'SD', fase: 'B', tingkat: 4, tahun_ajaran: ta, semester: sem, wali: '', warna: 'mt', urutan: 2 });
  const siswa = { K4B: [], K4A: [] };
  NAMA.forEach((n, i) => {
    const id = 'S4B' + String(i + 1).padStart(2, '0');
    siswa.K4B.push(id);
    put('Siswa', id, { kelas_id: 'K4B', no: i + 1, nama: n, nisn: '01' + String(23456700 + i), jk: /Putri|Dinda|Alya|Citra|Dewi|Fitri|Hana|Intan|Kirana|Maya|Nabila|Salsabila|Siti|Wulan/.test(n) ? 'P' : 'L', nama_wali: 'Bpk/Ibu ' + n.split(' ').slice(-1)[0], hp_wali: '0812' + String(3000000 + i * 7919).slice(0, 7), email_wali: '', kebutuhan: i === 7 ? 'Perlu pendampingan fokus' : '', aktif: 1 });
  });
  NAMA.slice(0, 26).forEach((n, i) => {
    const id = 'S4A' + String(i + 1).padStart(2, '0');
    siswa.K4A.push(id);
    put('Siswa', id, { kelas_id: 'K4A', no: i + 1, nama: n.split(' ')[0] + ' ' + ['Kurnia', 'Hidayat', 'Saputri', 'Wibowo', 'Halim'][i % 5], jk: i % 2 ? 'P' : 'L', nama_wali: 'Wali ' + (i + 1), hp_wali: '0813' + String(4000000 + i * 5113).slice(0, 7), aktif: 1 });
  });

  const MAPEL = [['IPAS', 'K4B', 'pl'], ['Matematika', 'K4B', 'mt'], ['Bahasa Indonesia', 'K4B', 'gr'], ['Matematika', 'K4A', 'mt']];
  MAPEL.forEach(([nama, k, w], i) => put('Mapel', 'M' + (i + 1), { kelas_id: k, nama, jp: nama === 'Bahasa Indonesia' ? 6 : 5, kktp: 75, bobot: { formatif: 40, sumatif_lm: 40, sumatif_as: 20 }, warna: w }));
  const TP = [
    ['M1', 'TP 4.1', 'Menganalisis hubungan makhluk hidup dalam rantai makanan di ekosistem sawah.', 'Bab 4'],
    ['M1', 'TP 4.2', 'Menjelaskan peran produsen, konsumen, dan pengurai dalam ekosistem.', 'Bab 4'],
    ['M1', 'TP 4.3', 'Memprediksi dampak hilangnya satu komponen rantai makanan.', 'Bab 4'],
    ['M2', 'TP 3.1', 'Mengubah pecahan biasa menjadi pecahan desimal.', 'Bab 3'],
    ['M2', 'TP 3.2', 'Menentukan nilai tempat bilangan desimal.', 'Bab 3'],
    ['M3', 'TP 5.1', 'Menemukan gagasan pokok cerita rakyat melalui membaca intensif.', 'Bab 5'],
    ['M3', 'TP 5.2', 'Menuliskan kembali cerita rakyat dengan kosakata baru.', 'Bab 5'],
    ['M4', 'TP 3.1', 'Mengubah pecahan biasa menjadi pecahan desimal.', 'Bab 3']
  ];
  TP.forEach(([m, kode, rumusan, bab], i) => put('TP', 'TP' + (i + 1), { mapel_id: m, kode, rumusan, bab, urutan: i + 1, minggu: i + 1 }));

  // Jadwal Senin–Jumat
  const J = [[1, 'M1', 'K4B', '07:30', '09:00'], [1, 'M2', 'K4B', '09:30', '11:00'], [2, 'M3', 'K4B', '07:30', '09:00'], [2, 'M4', 'K4A', '09:30', '11:00'],
    [3, 'M1', 'K4B', '07:30', '09:00'], [3, 'M3', 'K4B', '11:15', '12:15'], [4, 'M2', 'K4B', '07:30', '09:00'], [4, 'M4', 'K4A', '09:30', '11:00'], [4, 'M3', 'K4B', '11:15', '12:15'],
    [5, 'M1', 'K4B', '07:30', '09:00'], [5, 'M3', 'K4B', '09:30', '10:30'], [6, 'M2', 'K4B', '07:30', '09:00']];
  // Pastikan hari ini (jika akhir pekan → Sabtu) memiliki 3 jadwal agar tampilan Hari Ini terisi
  const h = hariKe(today()) || 6;
  const jadwalHariIni = [['M1', 'K4B', '07:30', '09:00', 'Ruang Kelas 4-B'], ['M4', 'K4A', '09:30', '11:00', 'Ruang Kelas 4-A'], ['M3', 'K4B', '11:15', '12:15', 'Ruang Kelas 4-B']];
  J.filter((x) => x[0] !== h).forEach(([hari, m, k, a, b], i) => put('Jadwal', 'J' + (i + 1), { hari, mapel_id: m, kelas_id: k, mulai: a, selesai: b, ruang: 'Ruang Kelas ' + (k === 'K4A' ? '4-A' : '4-B') }));
  jadwalHariIni.forEach(([m, k, a, b, ruang], i) => put('Jadwal', 'JH' + (i + 1), { hari: h, mapel_id: m, kelas_id: k, mulai: a, selesai: b, ruang }));

  // RPP
  const isi1 = genRpp({ materi: 'Ekosistem sawah dan rantai makanan', jenjang: 'SD', fase: 'B', jp: 2, dimensi: ['Penalaran Kritis', 'Kreativitas', 'Kolaborasi'], konteks: 'sawah irigasi di sekitar sekolah', tp: [TP[0][2]] });
  put('RPP', 'R1', { kelas_id: 'K4B', mapel_id: 'M1', judul: 'Ekosistem Sawah & Rantai Makanan', materi: 'Bab 4: Ekosistem & Rantai Makanan', jp: 2, pertemuan: 1, tanggal: today(), model: 'Problem Based Learning', dimensi: ['Penalaran Kritis', 'Kreativitas', 'Kolaborasi'], status: 'final', versi: 2, isi: isi1, tp_ids: ['TP1'], ai: 'templat' });
  put('RPP', 'R2', { kelas_id: 'K4A', mapel_id: 'M4', judul: 'Pecahan Desimal & Nilai Tempat', materi: 'Bab 3: Pecahan Desimal', jp: 2, pertemuan: 2, tanggal: today(), model: 'Discovery Learning', dimensi: ['Penalaran Kritis', 'Kemandirian'], status: 'disetujui', versi: 1, isi: genRpp({ materi: 'pecahan desimal dan nilai tempat', jp: 2, jenjang: 'SD' }), tp_ids: ['TP8'], telaah: { keputusan: 'disetujui', catatan: 'RPP runtut dan kontekstual. Lanjutkan.', oleh: DEMO_SEKOLAH.kepsek_nama, waktu: new Date(Date.now() - 864e5).toISOString() } });
  put('RPP', 'R3', { kelas_id: 'K4B', mapel_id: 'M3', judul: 'Membaca Intensif Cerita Rakyat', materi: 'Bab 5: Cerita Rakyat', jp: 2, pertemuan: 1, tanggal: addDays(today(), 1), model: 'Literasi Terbimbing', dimensi: ['Komunikasi', 'Kewargaan'], status: 'draf', versi: 1, isi: genRpp({ materi: 'membaca intensif cerita rakyat', jp: 2, jenjang: 'SD' }), tp_ids: ['TP6'] });
  put('RPP', 'R4', { kelas_id: 'K4B', mapel_id: 'M2', judul: 'Mengubah Pecahan ke Desimal', materi: 'Bab 3: Pecahan', jp: 2, pertemuan: 1, tanggal: addDays(today(), -2), model: 'Discovery Learning', dimensi: ['Penalaran Kritis'], status: 'revisi', versi: 1, isi: genRpp({ materi: 'mengubah pecahan biasa ke desimal', jp: 2, jenjang: 'SD' }), tp_ids: ['TP4'], telaah: { keputusan: 'revisi', catatan: 'Tambahkan diferensiasi untuk kelompok pemula dan asesmen formatif yang lebih konkret.', oleh: DEMO_SEKOLAH.kepsek_nama, waktu: new Date(Date.now() - 3 * 36e5).toISOString() } });

  // Bank soal
  const SOAL = [
    ['M1', 'TP1', 'pg', 'Dalam ekosistem sawah, padi berperan sebagai ...', ['Produsen', 'Konsumen I', 'Konsumen II', 'Pengurai'], 'A', 'C1', 'LOTS'],
    ['M1', 'TP1', 'pg', 'Urutan rantai makanan yang benar di sawah adalah ...', ['Padi → ular → tikus → elang', 'Padi → tikus → ular → elang', 'Tikus → padi → ular → elang', 'Elang → ular → tikus → padi'], 'B', 'C2', 'LOTS'],
    ['M1', 'TP3', 'pg', 'Petani memburu ular secara besar-besaran. Dampak yang paling mungkin terjadi adalah ...', ['Populasi elang bertambah', 'Populasi tikus meningkat dan panen padi menurun', 'Populasi padi meningkat', 'Tidak ada perubahan'], 'B', 'C4', 'HOTS'],
    ['M1', 'TP2', 'bs', 'Jamur dan bakteri termasuk pengurai.', ['Benar', 'Salah'], 'Benar', 'C1', 'LOTS'],
    ['M1', 'TP3', 'uraian', 'Jelaskan apa yang terjadi pada sawah jika burung hantu (pemangsa tikus) hilang! Berikan alasanmu.', [], 'Skor 4: menyebut tikus bertambah, padi rusak, alasan logis.', 'C5', 'HOTS'],
    ['M2', 'TP4', 'pg', 'Bentuk desimal dari 3/4 adalah ...', ['0,25', '0,34', '0,75', '3,4'], 'C', 'C3', 'MOTS'],
    ['M2', 'TP5', 'isian', 'Nilai tempat angka 5 pada bilangan 2,45 adalah ....', [], 'perseratusan', 'C2', 'LOTS']
  ];
  SOAL.forEach(([m, tp, tipe, teks, opsi, kunci, bloom, level], i) => put('Soal', 'Q' + (i + 1), { mapel_id: m, tp_id: tp, tipe, teks, opsi, kunci, bloom, level, skor: tipe === 'uraian' ? 4 : 1, pembahasan: '' }));

  // Asesmen + nilai
  const ases = [['A1', 'K4B', 'M1', 'Formatif: Rantai Makanan', 'formatif', -9, ['TP1']], ['A2', 'K4B', 'M1', 'Formatif: Peran Produsen-Konsumen', 'formatif', -5, ['TP2']],
    ['A3', 'K4B', 'M1', 'Sumatif Lingkup Materi Bab 4', 'sumatif_lm', -1, ['TP1', 'TP2', 'TP3']], ['A4', 'K4B', 'M2', 'Formatif: Pecahan Desimal', 'formatif', -4, ['TP4']], ['A5', 'K4A', 'M4', 'Formatif: Pecahan Desimal', 'formatif', -3, ['TP8']]];
  ases.forEach(([id, k, m, nama, jenis, dd, tps], ai) => {
    const nilai = {};
    siswa[k].forEach((sid, si) => {
      if (id === 'A3' && si > 22) return; // sebagian belum dinilai
      let v = Math.round(62 + r() * 36 + (si % 7 === 3 ? -14 : 0));
      if (sid === 'S4B25' && m === 'M2') v = 58;
      nilai[sid] = Math.max(40, Math.min(100, v));
    });
    put('Asesmen', id, { kelas_id: k, mapel_id: m, nama, jenis, tanggal: addDays(today(), dd), tp_ids: tps, soal_ids: id === 'A3' ? ['Q1', 'Q2', 'Q3', 'Q4', 'Q5'] : [], bobot: 1, nilai, catatan: {}, butir: {} });
  });

  // Absensi 12 hari sekolah terakhir
  let d = today(), n = 0;
  while (n < 12) {
    d = addDays(d, -1);
    const hk = hariKe(d);
    if (hk === 0) continue;
    n++;
    ['K4B', 'K4A'].forEach((k) => {
      const status = {}, ket = {};
      siswa[k].forEach((sid, si) => {
        const x = r();
        let s = x > 0.95 ? 'S' : x > 0.92 ? 'I' : x > 0.9 ? 'A' : 'H';
        if (sid === 'S4B05' && n <= 6 && n % 2 === 0) s = 'A';
        status[sid] = s;
        if (s === 'S') ket[sid] = 'Demam';
      });
      put('Absensi', `A-${k}-${d}`, { kelas_id: k, tanggal: d, status, ket });
    });
  }
  // Hari ini kelas 4-A sudah diabsen sebagian
  const st = {};
  siswa.K4A.forEach((sid) => { st[sid] = 'H'; });
  st.S4A02 = 'S';
  put('Absensi', `A-K4A-${today()}`, { kelas_id: 'K4A', tanggal: today(), status: st, ket: { S4A02: 'Surat dokter' } });

  // Tugas
  [['T1', 'K4B', 'M1', 'Tugas Portofolio Ekosistem', -1, 'diterima', 28, 22, 16], ['T2', 'K4A', 'M4', 'Latihan Pecahan Desimal', 0, 'dikoreksi', 26, 26, 22],
    ['T3', 'K4B', 'M3', 'Menulis Ringkasan Cerita', 1, 'diterima', 28, 26, 24], ['T4', 'K4B', 'M2', 'PR Nilai Tempat', 3, 'diberikan', 28, 0, 0], ['T5', 'K4B', 'M1', 'Poster Jaring Makanan', -6, 'dikembalikan', 28, 28, 28]]
    .forEach(([id, k, m, judul, dd, status, total, terkumpul, dikoreksi]) => put('Tugas', id, { kelas_id: k, mapel_id: m, judul, tenggat: addDays(today(), dd), status, total, terkumpul, dikoreksi, catatan: '' }));

  // Catatan siswa
  put('Catatan', 'C1', { siswa_id: 'S4B08', kelas_id: 'K4B', tanggal: addDays(today(), -2), jenis: 'perilaku', isi: 'Penurunan fokus saat diskusi kelompok; perlu duduk dekat guru.' });
  put('Catatan', 'C2', { siswa_id: 'S4B25', kelas_id: 'K4B', tanggal: addDays(today(), -4), jenis: 'akademik', isi: 'Nilai formatif Matematika di bawah KKTP; jadwalkan remedial.' });

  // Jurnal & agenda
  put('Jurnal', 'JR1', { tanggal: addDays(today(), -1), kelas_id: 'K4B', mapel_id: 'M1', rpp_id: 'R1', topik: 'Produsen dan konsumen di sawah', kegiatan: 'Pengamatan gambar sawah, diskusi kelompok, presentasi.', hadir: 27, tidak_hadir: 1, kendala: 'Proyektor tidak menyala.', tindak_lanjut: 'Gunakan poster cetak.' });
  put('Agenda', 'AG1', { tanggal: addDays(today(), 7), sampai: addDays(today(), 11), judul: 'Asesmen Sumatif Tengah Semester', jenis: 'asesmen' });
  put('Agenda', 'AG2', { tanggal: addDays(today(), 3), judul: 'Rapat KKG Gugus 3', jenis: 'rapat' });
  put('Agenda', 'AG3', { tanggal: addDays(today(), 14), judul: 'Kunjungan ke sawah desa', jenis: 'kegiatan', kelas_id: 'K4B' });
  return true;
}
export { ymd };

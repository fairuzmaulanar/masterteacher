// Generator templat bawaan (tanpa internet / tanpa AI).
// Keluarannya memakai SKEMA YANG SAMA dengan alat AI di backend, sehingga editor tidak perlu tahu sumbernya.
import { MENIT_JP, DIMENSI } from './kurikulum.js';

const cap = (s) => String(s || '').charAt(0).toUpperCase() + String(s || '').slice(1);
const pilih = (arr, n) => arr.slice(0, n);

function bagiDurasi(total) {
  // awal 10%, memahami 30%, mengaplikasi 35%, merefleksi 15%, penutup 10% (dibulatkan ke 5 menit)
  const r = [0.1, 0.3, 0.35, 0.15, 0.1].map((p) => Math.max(5, Math.round((total * p) / 5) * 5));
  const selisih = total - r.reduce((a, b) => a + b, 0);
  r[2] += selisih;
  return r;
}

export function rpp(i) {
  const materi = i.materi || 'materi pokok';
  const menit = Number(i.menit_jp) || MENIT_JP[i.jenjang] || 35;
  const jp = Number(i.jp) || 2;
  const [d1, d2, d3, d4, d5] = bagiDurasi(jp * menit);
  const dim = (i.dimensi && i.dimensi.length ? i.dimensi : ['Penalaran Kritis', 'Kolaborasi', 'Komunikasi']).slice(0, 3);
  const tp = i.tp && i.tp.length ? i.tp : [`Peserta didik mampu menjelaskan konsep ${materi} dengan bahasa sendiri.`, `Peserta didik mampu menerapkan ${materi} untuk memecahkan masalah sehari-hari.`];
  const konteks = i.konteks || 'lingkungan sekitar sekolah';
  const kbc = String(i.mode_kbc) === '1';
  return {
    judul: `${cap(materi)}`,
    identifikasi: {
      kesiapan: i.kesiapan || `Sebagian besar peserta didik sudah mengenal istilah dasar ${materi} dari pengalaman sehari-hari, namun pemahamannya masih beragam. Hasil asesmen diagnostik awal dipakai untuk membagi kelompok pemula, berkembang, dan cakap.`,
      karakteristik_materi: `${cap(materi)} bersifat konseptual sekaligus aplikatif; mudah dihubungkan dengan konteks ${konteks} sehingga cocok dipelajari lewat pengamatan, diskusi, dan praktik.`,
      dimensi: dim
    },
    desain: {
      cp: i.cp || '',
      tp,
      topik_kontekstual: `${cap(materi)} di ${konteks}`,
      lintas_disiplin: 'Bahasa Indonesia (menyampaikan hasil pengamatan secara lisan dan tertulis) dan Seni (membuat media presentasi sederhana).',
      praktik_pedagogis: i.model || 'Pembelajaran berbasis masalah (Problem Based Learning) dengan kerja kelompok heterogen.',
      kemitraan: 'Orang tua/wali membantu pengamatan di rumah; tokoh/pegiat lokal dapat diundang sebagai narasumber.',
      lingkungan_belajar: 'Ruang kelas ditata berkelompok, pojok baca, dan pemanfaatan lingkungan sekolah sebagai sumber belajar. Budaya belajar saling menghargai dan berani bertanya.',
      pemanfaatan_digital: 'Video pendek/gambar dari internet, kuis interaktif sederhana, dan dokumentasi hasil kerja menggunakan kamera ponsel.'
    },
    pengalaman: {
      awal: { durasi: `${d1} menit`, kegiatan: [
        'Salam, doa, dan pemeriksaan kehadiran; guru menyapa peserta didik dengan hangat (berkesadaran).',
        `Apersepsi: guru menampilkan gambar/peristiwa nyata terkait ${materi} di ${konteks} dan mengajukan pertanyaan pemantik.`,
        'Guru menyampaikan tujuan pembelajaran dan kesepakatan belajar hari ini.'
      ] },
      memahami: { durasi: `${d2} menit`, kegiatan: [
        `Peserta didik mengamati sumber belajar (bacaan/video/benda konkret) tentang ${materi}.`,
        'Dalam kelompok, peserta didik mencatat temuan dan menyusun pertanyaan yang ingin diketahui (bermakna).',
        'Guru memfasilitasi diskusi kelas untuk meluruskan miskonsepsi dan menegaskan konsep kunci.'
      ] },
      mengaplikasi: { durasi: `${d3} menit`, kegiatan: [
        `Kelompok menyelesaikan masalah/proyek mini yang berkaitan dengan ${materi} di ${konteks} menggunakan LKPD.`,
        'Guru berkeliling memberi umpan balik dan perancah (scaffolding) sesuai tingkat kesiapan kelompok.',
        'Setiap kelompok mempresentasikan hasil kerja; kelompok lain memberi tanggapan dengan santun (menggembirakan).'
      ] },
      merefleksi: { durasi: `${d4} menit`, kegiatan: [
        'Peserta didik menuliskan 3-2-1: tiga hal yang dipelajari, dua hal menarik, satu pertanyaan.',
        'Guru dan peserta didik menyimpulkan pembelajaran dan mengaitkannya dengan kehidupan sehari-hari.'
      ] },
      penutup: { durasi: `${d5} menit`, kegiatan: [
        'Asesmen formatif singkat (exit ticket) 2–3 soal.',
        'Guru menyampaikan rencana pertemuan berikutnya dan tugas pengamatan di rumah.',
        'Doa dan salam penutup.'
      ] }
    },
    asesmen: {
      diagnostik: `Pertanyaan lisan/kuis singkat di awal untuk memetakan pemahaman awal tentang ${materi}.`,
      formatif: 'Observasi diskusi kelompok dengan lembar ceklis, penilaian LKPD, dan exit ticket.',
      sumatif: `Tes tertulis/produk di akhir lingkup materi ${materi} dengan rubrik penilaian.`
    },
    diferensiasi: {
      pemula: 'Diberikan contoh konkret, gambar, dan langkah kerja bertahap dengan pendampingan guru.',
      berkembang: 'Mengerjakan LKPD standar dengan sedikit petunjuk; berdiskusi dalam kelompok.',
      cakap: 'Diberi tantangan pengayaan: menganalisis kasus lain dan menjadi tutor sebaya.'
    },
    nilai_kbc: kbc ? `Menumbuhkan cinta kepada Allah melalui rasa syukur atas ciptaan-Nya, cinta ilmu dengan semangat bertanya, cinta sesama melalui kerja sama, dan cinta lingkungan dengan menjaga ${konteks}.` : ''
  };
}

const STEM = [
  (m) => `Perhatikan pernyataan berikut tentang ${m}. Manakah pernyataan yang paling tepat?`,
  (m) => `Contoh penerapan ${m} dalam kehidupan sehari-hari adalah ...`,
  (m) => `Seorang siswa mengamati peristiwa yang berkaitan dengan ${m} di lingkungannya. Apa kesimpulan yang paling tepat dari pengamatannya?`,
  (m) => `Mengapa ${m} penting untuk dipelajari? Pilih alasan yang paling tepat.`,
  (m) => `Jika terjadi perubahan pada salah satu unsur ${m}, apa dampak yang paling mungkin terjadi?`
];
export function soal(i) {
  const m = i.materi || 'materi';
  const n = Math.min(20, Math.max(1, Number(i.jumlah) || 5));
  const tipe = (i.tipe && i.tipe.length ? i.tipe : ['pg']);
  const level = ['LOTS', 'MOTS', 'HOTS'];
  const bloom = ['C2', 'C3', 'C4'];
  const out = [];
  for (let k = 0; k < n; k++) {
    const t = tipe[k % tipe.length];
    const lv = k % 3;
    const base = { tipe: t, bloom: bloom[lv], level: level[lv], indikator: `Disajikan stimulus tentang ${m}, peserta didik dapat ${['menjelaskan', 'menerapkan', 'menganalisis'][lv]} konsep yang terkait.`, pembahasan: 'Sesuaikan pembahasan dengan materi yang telah diajarkan.' };
    if (t === 'pg' || t === 'pgk') out.push(Object.assign(base, { teks: STEM[k % STEM.length](m), opsi: ['(isi opsi A)', '(isi opsi B)', '(isi opsi C)', '(isi opsi D)'], kunci: t === 'pg' ? 'A' : 'A,C' }));
    else if (t === 'bs') out.push(Object.assign(base, { teks: `${cap(m)} hanya dapat ditemukan di lingkungan perkotaan.`, opsi: ['Benar', 'Salah'], kunci: 'Salah' }));
    else if (t === 'isian') out.push(Object.assign(base, { teks: `Istilah yang tepat untuk menyebut ... dalam ${m} adalah ....`, opsi: [], kunci: '(isi kunci)' }));
    else out.push(Object.assign(base, { teks: `Jelaskan dengan contoh dari lingkunganmu bagaimana ${m} memengaruhi kehidupan sehari-hari!`, opsi: [], kunci: 'Skor 4: penjelasan benar + contoh relevan + alasan logis; Skor 3: penjelasan benar + contoh; Skor 2: penjelasan sebagian benar; Skor 1: menjawab tetapi keliru.' }));
  }
  return { soal: out };
}

export function deskripsi_rapor(i) {
  return {
    deskripsi: (i.siswa || []).map((s) => {
      const tinggi = s.tp_tinggi && s.tp_tinggi.length ? s.tp_tinggi.join(', ') : '';
      const rendah = s.tp_rendah && s.tp_rendah.length ? s.tp_rendah.join(', ') : '';
      return {
        kode: s.kode,
        tinggi: tinggi ? `Menunjukkan penguasaan yang baik dalam ${tinggi}.` : `Menunjukkan penguasaan yang baik dalam sebagian besar tujuan pembelajaran ${i.mapel || ''}.`,
        rendah: rendah ? `Perlu bantuan dalam ${rendah}.` : ''
      };
    })
  };
}

export function lkpd(i) {
  const m = i.materi || 'materi';
  return {
    judul: `LKPD ${cap(m)}`,
    tujuan: i.tp || `Peserta didik mampu memahami dan menerapkan konsep ${m}.`,
    petunjuk: ['Tulis nama dan anggota kelompok.', 'Baca petunjuk setiap kegiatan dengan teliti.', 'Diskusikan jawaban bersama kelompok, lalu tulis dengan rapi.', 'Tanyakan kepada guru bila ada yang belum jelas.'],
    kegiatan: [
      { langkah: `Amati gambar/benda/peristiwa tentang ${m} yang disediakan guru.`, pertanyaan: ['Apa saja yang kamu amati?', 'Hal apa yang paling menarik perhatianmu?'] },
      { langkah: `Diskusikan hubungan antara hasil pengamatan dengan konsep ${m}.`, pertanyaan: ['Mengapa hal itu bisa terjadi?', 'Apa buktinya?'] },
      { langkah: `Terapkan pemahamanmu: selesaikan masalah berikut yang berkaitan dengan ${m} di sekitarmu.`, pertanyaan: ['Tuliskan langkah penyelesaianmu.', 'Apa kesimpulan kelompokmu?'] }
    ],
    refleksi: ['Apa hal baru yang kamu pelajari hari ini?', 'Bagian mana yang masih sulit?', 'Bagaimana kerja sama kelompokmu?'],
    rubrik: [
      { kriteria: 'Ketepatan konsep', skor4: 'Semua jawaban tepat dan lengkap', skor3: 'Sebagian besar tepat', skor2: 'Sebagian kecil tepat', skor1: 'Belum tepat' },
      { kriteria: 'Kerja sama', skor4: 'Semua anggota aktif', skor3: 'Sebagian besar aktif', skor2: 'Hanya beberapa yang aktif', skor1: 'Dikerjakan satu orang' },
      { kriteria: 'Presentasi', skor4: 'Jelas, runtut, percaya diri', skor3: 'Jelas dan runtut', skor2: 'Kurang runtut', skor1: 'Tidak jelas' }
    ],
    kunci: ['Jawaban disesuaikan dengan hasil pengamatan peserta didik.']
  };
}

export function atp(i) {
  const n = Math.min(16, Math.max(3, Number(i.jumlah) || 8));
  const p = i.prefix || 'TP';
  const kata = ['mengidentifikasi', 'menjelaskan', 'membandingkan', 'menerapkan', 'menganalisis', 'menyimpulkan', 'mengevaluasi', 'merancang'];
  const out = [];
  for (let k = 0; k < n; k++) out.push({ kode: `${p}.${k + 1}`, rumusan: `Peserta didik mampu ${kata[k % kata.length]} ... (lengkapi konten dari CP ${i.mapel || ''}) melalui ... (variasi kegiatan).`, bab: `Bab ${Math.floor(k / 2) + 1}`, minggu: k * 2 + 1 });
  return { tp: out };
}

export function rubrik(i) {
  const n = Math.min(6, Math.max(2, Number(i.jumlah) || 4));
  const nama = ['Ketepatan isi', 'Kelengkapan', 'Kreativitas', 'Kerapian/penyajian', 'Kerja sama', 'Ketepatan waktu'];
  const bobot = Math.floor(100 / n);
  return {
    judul: `Rubrik ${i.tugas || 'Tugas'}`,
    kriteria: pilih(nama, n).map((x, k) => ({ nama: x, bobot: k === n - 1 ? 100 - bobot * (n - 1) : bobot, level: [
      { skor: 4, deskripsi: `${x} sangat baik, melampaui harapan.` }, { skor: 3, deskripsi: `${x} baik, sesuai harapan.` },
      { skor: 2, deskripsi: `${x} cukup, masih perlu perbaikan.` }, { skor: 1, deskripsi: `${x} belum tampak.` }] }))
  };
}

export function umpan_balik(i) {
  const panjang = String(i.teks || '').trim().split(/\s+/).filter(Boolean).length;
  return {
    kekuatan: ['Kamu sudah berani menuangkan gagasan dalam tulisan.', panjang > 80 ? 'Tulisanmu cukup panjang dan berisi.' : 'Tulisanmu ringkas dan langsung ke inti.'],
    perbaikan: ['Perhatikan ejaan, tanda baca, dan huruf kapital.', 'Tambahkan contoh atau alasan untuk memperkuat gagasan utama.'],
    saran_langkah: ['Baca ulang tulisanmu dengan suara pelan.', 'Tandai kalimat yang terlalu panjang lalu pecah menjadi dua.', 'Tambahkan satu paragraf penutup yang menyimpulkan.'],
    skor_saran: panjang > 150 ? 80 : panjang > 60 ? 72 : 65,
    komentar_singkat: 'Usaha yang baik! Lanjutkan dengan merapikan ejaan dan memperkuat contoh.'
  };
}

export function pesan_wali(i) {
  return { pesan: `Assalamu'alaikum/Salam sejahtera, Bapak/Ibu wali dari ananda {nama_siswa}.\n\nKami ingin menyampaikan ${i.tujuan || 'informasi'}${i.poin ? ': ' + i.poin : ''}.\n\nTerima kasih atas perhatian dan kerja sama Bapak/Ibu.\n\nHormat kami,\nGuru Kelas` };
}

export function ringkasan(i) {
  const kal = String(i.teks || '').replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/).filter((s) => s.length > 20);
  const poin = kal.slice(0, 6).map((s) => s.trim());
  return { ringkasan: kal.slice(0, 3).join(' '), poin, pertanyaan_pemantik: ['Apa gagasan utama bacaan ini?', 'Bagaimana hubungannya dengan pengalamanmu?', 'Apa yang terjadi jika ... ?'] };
}

export function diferensiasi(i) {
  const t = String(i.teks || '').trim();
  const kal = t.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/).filter(Boolean);
  const pendek = kal.map((s) => s.split(/,\s*/)[0].replace(/[.!?]?$/, '.')).join(' ');
  return {
    tingkat: [
      { nama: 'Pemula', teks: pendek, kosakata: [], pertanyaan: ['Apa yang diceritakan dalam teks?', 'Siapa/apa yang dibahas?', 'Sebutkan satu hal yang kamu ingat.'] },
      { nama: 'Berkembang', teks: kal.slice(0, Math.ceil(kal.length * 0.75)).join(' '), kosakata: [], pertanyaan: ['Apa gagasan utama teks?', 'Mengapa hal itu terjadi?', 'Berikan contoh lain.'] },
      { nama: 'Cakap', teks: t, kosakata: [], pertanyaan: ['Bandingkan isi teks dengan pengalamanmu.', 'Apa dampaknya jika ... ?', 'Usulkan solusi dari masalah dalam teks.'] }
    ]
  };
}

export function surat(i) {
  return { perihal: cap(i.jenis || 'Undangan'), isi: `Dengan hormat,\n\nSehubungan dengan ${i.keterangan || 'kegiatan sekolah'}, kami mengharapkan kehadiran/perhatian Bapak/Ibu pada:\n\nHari/tanggal : ...\nWaktu       : ...\nTempat      : ...\nAcara       : ...`, penutup: 'Demikian surat ini kami sampaikan. Atas perhatian dan kerja sama Bapak/Ibu, kami ucapkan terima kasih.' };
}

export function laporan(i) {
  const c = String(i.catatan || '').split(/\n+/).map((s) => s.trim()).filter(Boolean);
  return { judul: cap(i.jenis || 'Laporan Kegiatan'), pendahuluan: 'Laporan ini disusun sebagai pertanggungjawaban pelaksanaan kegiatan.', pelaksanaan: c.slice(0, 3).join(' '), hasil: c.slice(3, 8).length ? c.slice(3, 8) : ['(tuliskan hasil kegiatan)'], tindak_lanjut: ['(tuliskan rencana tindak lanjut)'] };
}

export const GENERATOR = { rpp, soal, deskripsi_rapor, lkpd, atp, rubrik, umpan_balik, pesan_wali, ringkasan, diferensiasi, surat, laporan };
export const SEMUA_DIMENSI = DIMENSI;

// Co-Pilot AI: panggil backend bila tersedia, otomatis jatuh ke templat bawaan bila AI mati/kuota habis/offline.
import { S, isDemo } from './state.js';
import { api } from './api.js';
import { GENERATOR } from './generator.js';

export const ALAT = {
  rpp: { judul: 'Generator RPP Pembelajaran Mendalam', ic: 'book', cls: 't-pl', ket: 'Draf RPP lengkap: identifikasi, desain, pengalaman belajar, asesmen.' },
  atp: { judul: 'Tujuan Pembelajaran & ATP', ic: 'target', cls: 't-pl', ket: 'Turunkan TP berurutan dari Capaian Pembelajaran.' },
  soal: { judul: 'Generator Soal & Kisi-kisi', ic: 'clipboard', cls: 't-qs', ket: 'Soal PG, PG kompleks, B/S, isian, uraian lengkap dengan level kognitif.' },
  lkpd: { judul: 'LKPD Siap Cetak', ic: 'file', cls: 't-mt', ket: 'Lembar kerja peserta didik dengan rubrik.' },
  rubrik: { judul: 'Rubrik Penilaian', ic: 'listcheck', cls: 't-gr', ket: 'Rubrik analitik 4 level untuk tugas/proyek.' },
  deskripsi_rapor: { judul: 'Deskripsi Capaian Rapor', ic: 'award', cls: 't-gr', ket: 'Kalimat capaian tertinggi & terendah per siswa dari nilai per TP.' },
  umpan_balik: { judul: 'Umpan Balik Tulisan Siswa', ic: 'message', cls: 't-at', ket: 'Kekuatan, perbaikan, dan saran langkah konkret.' },
  diferensiasi: { judul: 'Diferensiasi Tingkat Baca', ic: 'layers', cls: 't-mt', ket: 'Satu teks menjadi 3 tingkat keterbacaan.' },
  ringkasan: { judul: 'Ringkasan Materi', ic: 'note', cls: 't-mt', ket: 'Ringkasan, poin penting, dan pertanyaan pemantik.' },
  pesan_wali: { judul: 'Pesan untuk Orang Tua/Wali', ic: 'phone', cls: 't-at', ket: 'Pesan WhatsApp yang santun dan hangat.' },
  surat: { judul: 'Surat & Undangan Resmi', ic: 'mail', cls: 't-ai', ket: 'Isi surat dinas: undangan rapat, pemberitahuan, dll.' },
  laporan: { judul: 'Laporan Kegiatan / Notulen', ic: 'history', cls: 't-ai', ket: 'Susun laporan rapi dari catatan kasar.' }
};

/** → { hasil, sumber: 'ai'|'templat', alasan?, kuota? } */
export async function jalankanAi(alat, input) {
  const offline = () => ({ hasil: GENERATOR[alat](input), sumber: 'templat' });
  if (isDemo() || S.mode !== 'cloud') return Object.assign(offline(), { alasan: 'Mode demo memakai templat bawaan.' });
  if (!S.aiAktif) return Object.assign(offline(), { alasan: 'AI belum diaktifkan admin — memakai templat bawaan.' });
  if (!navigator.onLine) return Object.assign(offline(), { alasan: 'Sedang offline — memakai templat bawaan.' });
  try {
    const r = await api('ai.generate', { alat, input }, { timeout: 90000 });
    const d = r.data;
    if (!d.hasil) return Object.assign(offline(), { alasan: 'Jawaban AI tidak terbaca — memakai templat bawaan.', teks: d.teks });
    return { hasil: d.hasil, sumber: 'ai', kuota: d.kuota };
  } catch (e) {
    return Object.assign(offline(), { alasan: e.message + ' Memakai templat bawaan.' });
  }
}

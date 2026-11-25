// Perhitungan bersama (presensi, nilai, peringatan dini) — semuanya dari data lokal, instan.
import { db } from './store.js';
import { today, addDays, avg, round1, hariKe, parseYmd, ymd } from './util.js';
import { JENIS_ASESMEN } from './kurikulum.js';

export const namaKelas = (id) => (db.get('Kelas', id) || {}).nama || '-';
export const namaMapel = (id) => (db.get('Mapel', id) || {}).nama || '-';
export const kktpMapel = (id) => Number((db.get('Mapel', id) || {}).kktp) || 75;

export function senin(tgl = today()) { const d = parseYmd(tgl); const h = d.getDay() || 7; d.setDate(d.getDate() - h + 1); return ymd(d); }

/** Rekap presensi per siswa pada rentang tanggal. */
export function rekapAbsen(kelasId, dari, sampai) {
  const out = {};
  db.all('Absensi', (a) => a.kelas_id === kelasId && a.tanggal >= dari && a.tanggal <= sampai).forEach((a) => {
    Object.entries(a.status || {}).forEach(([sid, s]) => {
      const o = out[sid] || (out[sid] = { H: 0, S: 0, I: 0, A: 0, n: 0 });
      if (o[s] !== undefined) { o[s]++; o.n++; }
    });
  });
  return out;
}
export function persenHadir(r) { return r && r.n ? round1((r.H / r.n) * 100) : null; }

/** Nilai rata-rata tertimbang per jenis asesmen (bobot mapel; default formatif 40, sumatif LM 40, sumatif AS 20). */
export function nilaiAkhir(siswaId, mapelId, asesmen) {
  const m = db.get('Mapel', mapelId) || {};
  const bobot = Object.assign({ formatif: 40, sumatif_lm: 40, sumatif_as: 20 }, m.bobot || {});
  const list = asesmen || db.all('Asesmen', (a) => a.mapel_id === mapelId);
  const perJenis = {};
  list.forEach((a) => {
    if (!JENIS_ASESMEN[a.jenis] || !JENIS_ASESMEN[a.jenis].dinilai) return;
    const v = (a.nilai || {})[siswaId];
    if (v === undefined || v === null || v === '' || isNaN(v)) return;
    (perJenis[a.jenis] = perJenis[a.jenis] || []).push(Number(v));
  });
  let total = 0, bt = 0;
  Object.entries(perJenis).forEach(([j, arr]) => { const b = Number(bobot[j]) || 0; if (!b) return; total += avg(arr) * b; bt += b; });
  return bt ? round1(total / bt) : null;
}

/** Nilai per TP untuk deskripsi rapor: { tpId: rata-rata } */
export function nilaiPerTp(siswaId, mapelId) {
  const out = {};
  db.all('Asesmen', (a) => a.mapel_id === mapelId).forEach((a) => {
    const v = (a.nilai || {})[siswaId];
    if (v === undefined || v === '' || isNaN(v)) return;
    (a.tp_ids || []).forEach((tp) => { (out[tp] = out[tp] || []).push(Number(v)); });
  });
  Object.keys(out).forEach((k) => { out[k] = round1(avg(out[k])); });
  return out;
}

/** Peringatan dini: alfa berulang, nilai di bawah KKTP, catatan terbaru. */
export function perluPerhatian(batas = 8) {
  const d30 = addDays(today(), -30);
  const siswa = {};
  db.all('Siswa', (s) => String(s.aktif) !== '0').forEach((s) => { siswa[s.id] = s; });
  const hasil = {};
  const tambah = (sid, alasan, bobot) => { if (!siswa[sid]) return; const h = hasil[sid] || (hasil[sid] = { siswa: siswa[sid], alasan: [], skor: 0 }); h.alasan.push(alasan); h.skor += bobot; };
  const alfa = {};
  db.all('Absensi', (a) => a.tanggal >= d30).forEach((a) => Object.entries(a.status || {}).forEach(([sid, s]) => { if (s === 'A') alfa[sid] = (alfa[sid] || 0) + 1; }));
  Object.entries(alfa).forEach(([sid, n]) => { if (n >= 3) tambah(sid, `${n}x tanpa keterangan dalam 30 hari`, n * 2); });
  db.all('Mapel').forEach((m) => {
    const as = db.all('Asesmen', (a) => a.mapel_id === m.id);
    if (!as.length) return;
    db.all('Siswa', (s) => s.kelas_id === m.kelas_id && String(s.aktif) !== '0').forEach((s) => {
      const n = nilaiAkhir(s.id, m.id, as);
      if (n !== null && n < (Number(m.kktp) || 75)) tambah(s.id, `Nilai ${m.nama} ${n} (< KKTP ${m.kktp || 75})`, 3);
    });
  });
  db.all('Catatan', (c) => c.tanggal >= addDays(today(), -14) && (c.jenis === 'perilaku' || c.jenis === 'akademik')).forEach((c) => tambah(c.siswa_id, c.isi, 1));
  return Object.values(hasil).sort((a, b) => b.skor - a.skor).slice(0, batas);
}

export function jadwalHari(tgl = today()) {
  const h = hariKe(tgl);
  return db.all('Jadwal', (j) => Number(j.hari) === h).sort((a, b) => String(a.mulai).localeCompare(String(b.mulai)));
}
/** RPP yang paling cocok untuk satu jadwal pada tanggal tertentu. */
export function rppUntuk(kelasId, mapelId, tgl = today()) {
  const list = db.all('RPP', (r) => r.kelas_id === kelasId && r.mapel_id === mapelId);
  return list.find((r) => r.tanggal === tgl) || list.filter((r) => !r.tanggal || r.tanggal <= addDays(tgl, 7)).sort((a, b) => String(b.tanggal).localeCompare(String(a.tanggal)))[0] || null;
}
export function tumpukanKoreksi() {
  return db.all('Tugas', (t) => t.status !== 'dikembalikan').map((t) => ({ t, sisa: Math.max(0, (Number(t.terkumpul) || 0) - (Number(t.dikoreksi) || 0)) }))
    .filter((x) => x.sisa > 0 || x.t.status === 'diberikan').sort((a, b) => String(a.t.tenggat).localeCompare(String(b.t.tenggat)));
}
export function labelTenggat(tgl) {
  if (!tgl) return { l: 'Tanpa tenggat', c: 'b-draf' };
  const t = today();
  if (tgl < t) return { l: 'Lewat tenggat', c: 'b-red' };
  if (tgl === t) return { l: 'Hari ini', c: 'b-yel' };
  if (tgl === addDays(t, 1)) return { l: 'Besok', c: 'b-mt' };
  return { l: tgl.slice(8) + '/' + tgl.slice(5, 7), c: 'b-draf' };
}

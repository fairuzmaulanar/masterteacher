// Dialog formulir bersama: kelas, mapel, siswa, impor daftar siswa.
import { ic } from './icons.js';
import { esc, modal, toast, uid, konfirmasi, parseCSV, bacaFileTeks } from './util.js';
import { db } from './store.js';
import { S, simpanPrefs } from './state.js';
import { JENJANG, MAPEL, faseDari, tahunAjaran, semesterSekarang } from './kurikulum.js';

const opsi = (arr, v) => arr.map(([k, l]) => `<option value="${esc(k)}" ${String(k) === String(v) ? 'selected' : ''}>${esc(l)}</option>`).join('');

export async function dialogKelas(k = null) {
  const jenjang = (k && k.jenjang) || (S.user && S.user.jenjang) || 'SD';
  const tingkat = JENJANG.flatMap((j) => j.tingkat.map((t) => [t, `Kelas ${t} · ${j.k} · Fase ${faseDari(t)}`]));
  const r = await modal({
    title: k ? 'Ubah kelas' : 'Kelas baru',
    body: `<div class="col gap-l">
      <div class="grid g2"><label class="field"><span>Nama rombel</span><input class="input" name="nama" required value="${esc(k ? k.nama : '')}" placeholder="mis. 4-B"></label>
      <label class="field"><span>Tingkat</span><select class="input" name="tingkat">${opsi(tingkat, k ? k.tingkat : (jenjang === 'SMP' ? 7 : jenjang === 'SMA' ? 10 : 1))}</select></label></div>
      <div class="grid g2"><label class="field"><span>Tahun ajaran</span><input class="input" name="tahun_ajaran" value="${esc(k ? k.tahun_ajaran : tahunAjaran())}"></label>
      <label class="field"><span>Semester</span><select class="input" name="semester">${opsi([[1, 'Ganjil'], [2, 'Genap']], k ? k.semester : semesterSekarang())}</select></label></div>
      <label class="field"><span>Wali kelas</span><input class="input" name="wali" value="${esc(k ? k.wali : (S.user && S.user.nama) || '')}"></label>
      ${k ? '' : `<label class="field"><span>Mata pelajaran (pisahkan koma)</span><input class="input" name="mapel" placeholder="${esc((MAPEL[jenjang] || MAPEL.SD).slice(2, 5).join(', '))}"></label>`}
    </div>`,
    actions: [...(k ? [{ label: 'Hapus kelas', value: 'hapus', cls: 'btn-ghost', submit: true }] : []), { label: 'Batal', value: null, cls: 'btn-ghost' }, { label: 'Simpan', value: 'ok', cls: 'btn-dark' }]
  });
  if (r.value === 'hapus') {
    const n = db.count('Siswa', (s) => s.kelas_id === k.id);
    if (await konfirmasi(`Hapus kelas <b>${esc(k.nama)}</b> beserta ${n} siswa di dalamnya dari daftar? Data dapat dipulihkan admin dari spreadsheet.`, { bahaya: true, ya: 'Hapus' })) {
      db.del('Kelas', k.id);
      db.all('Siswa', (s) => s.kelas_id === k.id).forEach((s) => db.put('Siswa', s.id, { aktif: 0 }));
      toast('Kelas dihapus.');
    }
    return null;
  }
  if (r.value !== 'ok') return null;
  const f = r.form;
  const t = Number(f.tingkat);
  const jj = t <= 6 ? 'SD' : t <= 9 ? 'SMP' : 'SMA';
  const id = k ? k.id : uid('K');
  db.put('Kelas', id, { nama: f.nama.trim(), tingkat: t, jenjang: jj, fase: faseDari(t), tahun_ajaran: f.tahun_ajaran, semester: Number(f.semester), wali: f.wali, urutan: k ? k.urutan : db.count('Kelas') + 1 });
  if (!k) {
    String(f.mapel || '').split(',').map((x) => x.trim()).filter(Boolean).forEach((m) => db.put('Mapel', uid('M'), { kelas_id: id, nama: m, jp: 4, kktp: 75, bobot: { formatif: 40, sumatif_lm: 40, sumatif_as: 20 } }));
    simpanPrefs({ kelas: id });
  }
  toast(k ? 'Kelas diperbarui.' : 'Kelas dibuat.');
  return id;
}

export async function dialogMapel(kelasId, m = null) {
  const k = db.get('Kelas', kelasId) || {};
  const daftar = MAPEL[k.jenjang || 'SD'] || MAPEL.SD;
  const b = Object.assign({ formatif: 40, sumatif_lm: 40, sumatif_as: 20 }, (m && m.bobot) || {});
  const r = await modal({
    title: m ? 'Ubah mata pelajaran' : 'Tambah mata pelajaran',
    body: `<div class="col gap-l">
      <label class="field"><span>Nama mata pelajaran</span><input class="input" name="nama" list="dl-mapel" required value="${esc(m ? m.nama : '')}"><datalist id="dl-mapel">${daftar.concat(String(S.user && S.user.mode_kbc) === '1' ? MAPEL.MADRASAH : []).map((x) => `<option value="${esc(x)}">`).join('')}</datalist></label>
      <div class="grid g2"><label class="field"><span>JP per minggu</span><input class="input" type="number" min="1" max="12" name="jp" value="${esc(m ? m.jp : 4)}"></label>
      <label class="field"><span>KKTP</span><input class="input" type="number" min="0" max="100" name="kktp" value="${esc(m ? m.kktp : 75)}"></label></div>
      <div><span class="label">Bobot nilai akhir (%)</span><div class="grid g3" style="margin-top:.35rem">
        <label class="field"><span class="tiny">Formatif</span><input class="input" type="number" name="bf" value="${b.formatif}"></label>
        <label class="field"><span class="tiny">Sumatif LM</span><input class="input" type="number" name="bl" value="${b.sumatif_lm}"></label>
        <label class="field"><span class="tiny">Sumatif AS</span><input class="input" type="number" name="ba" value="${b.sumatif_as}"></label></div>
        <p class="hint">Formatif dapat diberi bobot 0 bila hanya dipakai untuk umpan balik.</p></div>
    </div>`,
    actions: [...(m ? [{ label: 'Hapus', value: 'hapus', cls: 'btn-ghost' }] : []), { label: 'Batal', value: null, cls: 'btn-ghost' }, { label: 'Simpan', value: 'ok', cls: 'btn-dark' }]
  });
  if (r.value === 'hapus') { if (await konfirmasi(`Hapus mapel <b>${esc(m.nama)}</b>? Nilai yang sudah tercatat tetap tersimpan.`, { bahaya: true, ya: 'Hapus' })) { db.del('Mapel', m.id); toast('Mapel dihapus.'); } return null; }
  if (r.value !== 'ok') return null;
  const id = m ? m.id : uid('M');
  db.put('Mapel', id, { kelas_id: kelasId, nama: r.form.nama.trim(), jp: Number(r.form.jp) || 0, kktp: Number(r.form.kktp) || 75, bobot: { formatif: Number(r.form.bf) || 0, sumatif_lm: Number(r.form.bl) || 0, sumatif_as: Number(r.form.ba) || 0 } });
  toast('Mata pelajaran disimpan.');
  return id;
}

export async function dialogSiswa(kelasId, s = null) {
  const r = await modal({
    title: s ? 'Data siswa' : 'Tambah siswa',
    body: `<div class="col gap-l">
      <div class="grid g2" style="grid-template-columns:90px 1fr"><label class="field"><span>No.</span><input class="input" type="number" name="no" value="${esc(s ? s.no : db.count('Siswa', (x) => x.kelas_id === kelasId && String(x.aktif) !== '0') + 1)}"></label>
      <label class="field"><span>Nama lengkap</span><input class="input" name="nama" required value="${esc(s ? s.nama : '')}"></label></div>
      <div class="grid g2"><label class="field"><span>NISN</span><input class="input" name="nisn" inputmode="numeric" value="${esc(s ? s.nisn : '')}"></label>
      <label class="field"><span>Jenis kelamin</span><select class="input" name="jk">${opsi([['', '-'], ['L', 'Laki-laki'], ['P', 'Perempuan']], s ? s.jk : '')}</select></label></div>
      <div class="grid g2"><label class="field"><span>Nama orang tua/wali</span><input class="input" name="nama_wali" value="${esc(s ? s.nama_wali : '')}"></label>
      <label class="field"><span>No. WA wali</span><input class="input" name="hp_wali" inputmode="tel" value="${esc(s ? s.hp_wali : '')}" placeholder="08xxxxxxxxxx"></label></div>
      <label class="field"><span>Email wali <span class="muted">(opsional)</span></span><input class="input" type="email" name="email_wali" value="${esc(s ? s.email_wali : '')}"></label>
      <label class="field"><span>Kebutuhan khusus / catatan belajar</span><input class="input" name="kebutuhan" value="${esc(s ? s.kebutuhan : '')}" placeholder="mis. perlu duduk di depan"></label>
      <p class="hint">${ic('lock', 'ic-s')} Data siswa hanya terlihat oleh Anda (dan kepala sekolah Anda untuk rekap). Nama siswa disamarkan saat dikirim ke AI.</p>
    </div>`,
    actions: [...(s ? [{ label: 'Nonaktifkan', value: 'off', cls: 'btn-ghost' }] : []), { label: 'Batal', value: null, cls: 'btn-ghost' }, { label: 'Simpan', value: 'ok', cls: 'btn-dark' }]
  });
  if (r.value === 'off') { db.put('Siswa', s.id, { aktif: 0 }); toast(`${s.nama} dinonaktifkan (pindah/lulus).`); return null; }
  if (r.value !== 'ok') return null;
  const f = r.form;
  if (f.hp_wali && !/^(\+?62|0)8\d{7,12}$/.test(f.hp_wali.replace(/[\s-]/g, ''))) { toast('Format nomor WA wali tidak valid (contoh 081234567890).', 'err'); return null; }
  const id = s ? s.id : uid('S');
  db.put('Siswa', id, { kelas_id: kelasId, no: Number(f.no) || '', nama: f.nama.trim(), nisn: f.nisn.trim(), jk: f.jk, nama_wali: f.nama_wali.trim(), hp_wali: f.hp_wali.replace(/[\s-]/g, ''), email_wali: f.email_wali.trim(), kebutuhan: f.kebutuhan.trim(), aktif: 1 });
  toast('Data siswa disimpan.');
  return id;
}

export async function dialogImporSiswa(kelasId) {
  const r = await modal({
    title: 'Impor daftar siswa',
    wide: true,
    body: `<div class="col gap-l">
      <p class="small muted">Tempel dari Excel/Dapodik atau unggah CSV. Kolom yang dikenali (urutan bebas, baris pertama = judul kolom): <b>Nama</b>, NISN, JK/L/P, Nama Wali, HP/WA Wali, Email Wali. Tanpa judul kolom: satu nama per baris.</p>
      <textarea class="input" name="teks" rows="10" placeholder="Nama\tNISN\tJK\tHP Wali\nAdinda Putri\t0123456789\tP\t081234567890"></textarea>
      <label class="btn btn-white btn-sm" style="align-self:flex-start">${ic('upload', 'ic-s')}Pilih berkas CSV<input type="file" accept=".csv,.txt,text/csv" hidden data-file></label>
    </div>`,
    actions: [{ label: 'Batal', value: null, cls: 'btn-ghost' }, { label: 'Impor', value: 'ok', cls: 'btn-dark' }],
    onOpen: (d) => { d.querySelector('[data-file]').onchange = async (e) => { const f = e.target.files[0]; if (f) d.querySelector('[name=teks]').value = await bacaFileTeks(f); }; }
  });
  if (r.value !== 'ok' || !r.form.teks.trim()) return 0;
  const rows = parseCSV(r.form.teks.replace(/\r/g, ''));
  const h = rows[0].map((x) => String(x).toLowerCase());
  const adaHeader = h.some((x) => /nama/.test(x));
  const cari = (re) => h.findIndex((x) => re.test(x));
  const ix = adaHeader ? { nama: cari(/^nama( (siswa|lengkap|peserta))?$|^nama$/) >= 0 ? cari(/^nama( (siswa|lengkap|peserta))?$|^nama$/) : cari(/nama/), nisn: cari(/nisn/), jk: cari(/^(jk|l\/p|jenis)/), wali: cari(/wali|orang ?tua|ortu/), hp: cari(/hp|wa|telp|ponsel/), email: cari(/mail/) } : { nama: 0, nisn: 1, jk: 2, wali: -1, hp: 3, email: -1 };
  if (adaHeader && ix.wali === ix.hp) ix.wali = -1;
  const data = adaHeader ? rows.slice(1) : rows;
  const ada = new Set(db.all('Siswa', (s) => s.kelas_id === kelasId).map((s) => s.nama.toLowerCase()));
  let no = db.count('Siswa', (s) => s.kelas_id === kelasId && String(s.aktif) !== '0');
  let n = 0;
  data.forEach((row) => {
    const nama = String(row[ix.nama] || '').trim();
    if (!nama || ada.has(nama.toLowerCase())) return;
    ada.add(nama.toLowerCase());
    const g = (i) => (i >= 0 ? String(row[i] || '').trim() : '');
    db.put('Siswa', uid('S'), { kelas_id: kelasId, no: ++no, nama, nisn: g(ix.nisn), jk: /^p/i.test(g(ix.jk)) ? 'P' : g(ix.jk) ? 'L' : '', nama_wali: g(ix.wali), hp_wali: g(ix.hp).replace(/[\s-]/g, ''), email_wali: g(ix.email), aktif: 1 });
    n++;
  });
  toast(n ? `${n} siswa ditambahkan.` : 'Tidak ada siswa baru (nama duplikat dilewati).', n ? 'ok' : 'info');
  return n;
}

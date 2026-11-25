// Editor & generator RPP Pembelajaran Mendalam (Permendikdasmen No. 1/2026).
import { ic } from '../core/icons.js';
import { esc, today, fmtTgl, toast, uid, modal, konfirmasi, waktuRelatif, debounce, sha256Hex } from '../core/util.js';
import { S, isDemo, modeKbc, simpanPrefs } from '../core/state.js';
import { db } from '../core/store.js';
import { api } from '../core/api.js';
import { sinkron } from '../core/sync.js';
import { delegasi, kelasList, mapelKelas, emptyState, perluKelas } from '../core/ui.js';
import { DIMENSI, PRINSIP, STATUS_RPP, MENIT_JP, KBC } from '../core/kurikulum.js';
import { jalankanAi } from '../core/ai.js';
import { kopHtml, ttdHtml, cetak, eksporWord, verifHtml, dokUntuk, simpanDokCache, ttdElektronik } from '../core/dokumen.js';
import { pergi } from '../core/router.js';
import { namaKelas, namaMapel } from '../core/hitung.js';
import { demoTerbitkan, demoSahkan } from '../core/demo.js';

export const TAHAP = [['awal', 'Kegiatan Awal', 'Berkesadaran'], ['memahami', 'Memahami', 'Bermakna'], ['mengaplikasi', 'Mengaplikasi', 'Bermakna'], ['merefleksi', 'Merefleksi', 'Berkesadaran'], ['penutup', 'Penutup', 'Menggembirakan']];
// Dukungan contenteditable="plaintext-only" (fallback ke "true" untuk peramban lama)
const CE = (() => { const d = document.createElement('div'); d.setAttribute('contenteditable', 'plaintext-only'); return d.contentEditable === 'plaintext-only' ? 'plaintext-only' : 'true'; })();
const MODEL = ['Problem Based Learning', 'Project Based Learning', 'Discovery Learning', 'Inquiry Learning', 'Cooperative Learning', 'Literasi Terbimbing', 'Pembelajaran Berdiferensiasi', 'Pembelajaran Kontekstual (CTL)'];

export default {
  title: 'Rencana Ajar',
  deps: ['RPP', 'TP', 'Kelas', 'Mapel'],
  async render(el, ctx) {
    const id = ctx.params.id;
    if (id === 'baru') return formBaru(el, ctx);
    const r = db.get('RPP', id);
    if (!r) { el.innerHTML = `<div class="card">${emptyState({ icon: 'book', title: 'RPP tidak ditemukan', text: 'Mungkin sudah dihapus atau belum tersinkron ke perangkat ini.', action: '<a class="btn btn-primary" href="#/rencana">Kembali ke daftar</a>' })}</div>`; return; }
    editor(el, ctx, r);
  }
};

// ======================== FORM RPP BARU ========================
function formBaru(el, ctx) {
  const kelas = kelasList();
  if (!kelas.length) { perluKelas(el); return; }
  const q = ctx.query;
  const kid = q.k && db.get('Kelas', q.k) ? q.k : (db.get('Kelas', S.prefs.kelas) ? S.prefs.kelas : kelas[0].id);
  const st = ctx.stb = ctx.stb || { kelas: kid, mapel: q.m || '', dimensi: ['Penalaran Kritis', 'Kolaborasi'], tp: [] };
  const mapel = mapelKelas(st.kelas);
  if (!mapel.find((m) => m.id === st.mapel)) st.mapel = (mapel[0] || {}).id || '';
  const tp = db.all('TP', (t) => t.mapel_id === st.mapel).sort((a, b) => (Number(a.urutan) || 0) - (Number(b.urutan) || 0));
  const k = db.get('Kelas', st.kelas);
  el.innerHTML = `
    <div class="page-h"><div><div class="crumbs"><a href="#/rencana">Rencana Ajar</a>${ic('chevr', 'ic-s')}<b>RPP baru</b></div><h1>Buat RPP Pembelajaran Mendalam</h1>
      <p class="sub">Isi identitas singkat — Co-Pilot menyusun draf lengkap 4 komponen sesuai Permendikdasmen No. 1/2026. Anda tetap penentu akhirnya.</p></div></div>
    <form class="split-8" novalidate>
      <div class="card col gap-l">
        <div class="grid g2"><label class="field"><span>Kelas</span><select class="input" name="kelas" data-act-change="ganti-kelas">${kelas.map((x) => `<option value="${x.id}" ${x.id === st.kelas ? 'selected' : ''}>Kelas ${esc(x.nama)} (Fase ${esc(x.fase || '-')})</option>`).join('')}</select></label>
        <label class="field"><span>Mata pelajaran</span><select class="input" name="mapel" data-act-change="ganti-mapel">${mapel.map((m) => `<option value="${m.id}" ${m.id === st.mapel ? 'selected' : ''}>${esc(m.nama)}</option>`).join('') || '<option value="">— tambah mapel di menu Kelas —</option>'}</select></label></div>
        <label class="field"><span>Materi / topik</span><input class="input" name="materi" required placeholder="mis. Ekosistem sawah dan rantai makanan" value="${esc(st.materi || '')}"></label>
        <div class="grid g3"><label class="field"><span>Tanggal pelaksanaan</span><input class="input" type="date" name="tanggal" value="${st.tanggal || today()}"></label>
          <label class="field"><span>Alokasi (JP)</span><input class="input" type="number" min="1" max="12" name="jp" value="${st.jp || 2}"></label>
          <label class="field"><span>Menit per JP</span><input class="input" type="number" min="25" max="60" name="menit" value="${st.menit || MENIT_JP[(k && k.jenjang) || 'SD']}"></label></div>
        <label class="field"><span>Model / strategi <span class="muted">(opsional)</span></span><input class="input" name="model" list="dl-model" value="${esc(st.model || '')}" placeholder="biarkan kosong agar Co-Pilot memilih"><datalist id="dl-model">${MODEL.map((m) => `<option value="${m}">`).join('')}</datalist></label>
        <div class="field"><span>Dimensi profil lulusan yang disasar <span class="muted">(pilih 1–3)</span></span><div class="chips" style="flex-wrap:wrap">${DIMENSI.map((d) => `<button type="button" class="chip" data-act="dimensi" data-v="${esc(d)}" aria-pressed="${st.dimensi.includes(d)}">${esc(d.replace(' kepada Tuhan YME', ''))}</button>`).join('')}</div></div>
        <div class="field"><span>Tujuan pembelajaran</span>${tp.length ? `<div class="col" style="max-height:200px;overflow:auto">${tp.map((t) => `<label class="check row" style="align-items:flex-start;gap:.5rem"><input type="checkbox" name="tp" data-multi value="${t.id}" ${st.tp.includes(t.id) ? 'checked' : ''}><span class="small"><b>${esc(t.kode)}</b> ${esc(t.rumusan)}</span></label>`).join('')}</div>` : `<p class="hint">Belum ada TP untuk mapel ini. Co-Pilot akan merumuskan TP; Anda juga bisa menyusun ATP di <a href="#/rencana?tab=tp">TP & ATP</a>.</p>`}</div>
        <label class="field"><span>Capaian Pembelajaran (CP) <span class="muted">(opsional, tempel dari dokumen resmi)</span></span><textarea class="input" name="cp" rows="3">${esc(st.cp || '')}</textarea></label>
        <div class="grid g2"><label class="field"><span>Kondisi / kesiapan kelas</span><input class="input" name="kesiapan" value="${esc(st.kesiapan || '')}" placeholder="mis. 7 pemula, 15 berkembang, 6 cakap"></label>
          <label class="field"><span>Konteks lokal</span><input class="input" name="konteks" value="${esc(st.konteks || '')}" placeholder="mis. sawah irigasi di sekitar sekolah"></label></div>
      </div>
      <aside class="col gap-l">
        <div class="card col gap-l"><div class="row"><span class="icon-box" style="background:var(--ai-bg);color:var(--ai)">${ic('sparkles')}</span><b>Co-Pilot RPP</b></div>
          <p class="small muted">${S.aiAktif && !isDemo() ? 'Draf disusun AI dalam ±10–20 detik. Nama siswa tidak pernah dikirim.' : 'AI belum aktif — draf disusun dari templat bawaan Pembelajaran Mendalam yang dapat Anda sunting.'}</p>
          ${modeKbc() ? `<div class="card-flat small">${ic('heart', 'ic-s')} <b>Mode Madrasah (KBC) aktif</b><br><span class="muted">Nilai Panca Cinta diintegrasikan.</span></div>` : ''}
          <button class="btn btn-primary btn-block" type="submit" value="ai">${ic('wand', 'ic-s')}Susun draf RPP</button>
          <button class="btn btn-white btn-block" type="submit" value="kosong">${ic('file', 'ic-s')}Mulai dari kerangka kosong</button>
        </div>
        <div class="card card-sky small"><b>Struktur RPP (Permendikdasmen 1/2026)</b><ol style="margin:.4rem 0 0;padding-left:1.1rem"><li>Identifikasi: kesiapan murid, karakteristik materi, dimensi profil lulusan</li><li>Desain: CP, TP, topik, praktik pedagogis, kemitraan, lingkungan, digital</li><li>Pengalaman belajar: awal → memahami → mengaplikasi → merefleksi → penutup</li><li>Asesmen: awal, proses, akhir</li></ol></div>
      </aside>
    </form>`;
  const f = el.querySelector('form');
  const ingat = () => Object.assign(st, { materi: f.materi.value, tanggal: f.tanggal.value, jp: f.jp.value, menit: f.menit.value, model: f.model.value, cp: f.cp.value, kesiapan: f.kesiapan.value, konteks: f.konteks.value, tp: Array.from(f.querySelectorAll('[name=tp]:checked')).map((x) => x.value) });
  delegasi(el, {
    'ganti-kelas': (s) => { ingat(); st.kelas = s.value; st.mapel = ''; ctx.rerender(); },
    'ganti-mapel': (s) => { ingat(); st.mapel = s.value; st.tp = []; ctx.rerender(); },
    dimensi: (b) => {
      const v = b.dataset.v;
      if (st.dimensi.includes(v)) st.dimensi = st.dimensi.filter((x) => x !== v);
      else if (st.dimensi.length >= 3) { toast('Pilih paling banyak 3 dimensi agar fokus.', 'info'); return; } else st.dimensi.push(v);
      b.setAttribute('aria-pressed', st.dimensi.includes(v));
    }
  });
  f.onsubmit = async (e) => {
    e.preventDefault();
    ingat();
    if (!st.mapel) { toast('Tambahkan mata pelajaran untuk kelas ini terlebih dahulu.', 'err'); return; }
    if (!st.materi.trim()) { toast('Isi materi/topik terlebih dahulu.', 'err'); f.materi.focus(); return; }
    const b = e.submitter; b.disabled = true; const label = b.innerHTML; b.innerHTML = `${ic('refresh', 'ic-s spin')}Menyusun draf…`;
    const kk = db.get('Kelas', st.kelas), m = db.get('Mapel', st.mapel);
    const tpTeks = st.tp.map((t) => (db.get('TP', t) || {}).rumusan).filter(Boolean);
    const input = { jenjang: kk.jenjang, fase: kk.fase, kelas: kk.nama, mapel: m.nama, materi: st.materi, jp: Number(st.jp), menit_jp: Number(st.menit), cp: st.cp, tp: tpTeks, dimensi: st.dimensi, kesiapan: st.kesiapan, konteks: st.konteks, model: st.model, mode_kbc: modeKbc() ? '1' : '0' };
    let isi, sumber = 'manual';
    if (b.value === 'ai') { const r = await jalankanAi('rpp', input); isi = r.hasil; sumber = r.sumber; if (r.alasan) toast(r.alasan, 'info', 4000); }
    else isi = kerangkaKosong(input);
    const id = uid('R');
    db.put('RPP', id, { kelas_id: st.kelas, mapel_id: st.mapel, judul: (isi && isi.judul) || st.materi, materi: st.materi, jp: Number(st.jp), pertemuan: 1, tanggal: st.tanggal, model: st.model || (isi && isi.desain && isi.desain.praktik_pedagogis) || '', dimensi: (isi && isi.identifikasi && isi.identifikasi.dimensi && isi.identifikasi.dimensi.length ? isi.identifikasi.dimensi : st.dimensi).slice(0, 3), mode_kbc: modeKbc() ? '1' : '0', status: 'draf', versi: 1, isi: Object.assign({ menit_jp: Number(st.menit), cp: st.cp }, isi, { _draf: sumber === 'ai' ? 'ai' : sumber === 'templat' ? 'templat' : '' }), tp_ids: st.tp, ai: sumber });
    simpanPrefs({ kelas: st.kelas, mapel: st.mapel });
    ctx.stb = null;
    pergi('/rencana/' + id);
  };
}
function kerangkaKosong(i) {
  const k = () => ({ durasi: '', kegiatan: [''] });
  return { judul: i.materi, identifikasi: { kesiapan: '', karakteristik_materi: '', dimensi: i.dimensi }, desain: { cp: i.cp || '', tp: i.tp.length ? i.tp : [''], topik_kontekstual: '', lintas_disiplin: '', praktik_pedagogis: i.model || '', kemitraan: '', lingkungan_belajar: '', pemanfaatan_digital: '' }, pengalaman: { awal: k(), memahami: k(), mengaplikasi: k(), merefleksi: k(), penutup: k() }, asesmen: { diagnostik: '', formatif: '', sumatif: '' }, diferensiasi: { pemula: '', berkembang: '', cakap: '' }, nilai_kbc: '' };
}

// ======================== EDITOR ========================
const ambil = (o, path) => path.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
function atur(o, path, v) { const ks = path.split('.'); let c = o; ks.slice(0, -1).forEach((k, i) => { if (c[k] == null) c[k] = /^\d+$/.test(ks[i + 1]) ? [] : {}; c = c[k]; }); c[ks[ks.length - 1]] = v; }
const ed = (path, val, ph = 'Klik untuk mengisi…', tag = 'p') => `<${tag} class="editable" contenteditable="plaintext-only" data-path="${path}" data-ph="${esc(ph)}">${esc(val || '')}</${tag}>`;
function daftarEd(path, arr, ph) {
  const a = Array.isArray(arr) && arr.length ? arr : [''];
  return `<ul data-list="${path}">${a.map((x, i) => `<li class="editable" contenteditable="plaintext-only" data-path="${path}.${i}" data-ph="${esc(ph)}">${esc(x)}</li>`).join('')}</ul><button type="button" class="btn btn-ghost btn-xs no-print" data-act="tambah-item" data-list="${path}">${ic('plus', 'ic-s')}Tambah</button>`;
}
export function skorKepatuhan(r) {
  const i = r.isi || {};
  const cek = [
    ['Identifikasi kesiapan murid', !!(i.identifikasi && i.identifikasi.kesiapan)],
    ['Karakteristik materi', !!(i.identifikasi && i.identifikasi.karakteristik_materi)],
    ['1–3 dimensi profil lulusan', (r.dimensi || []).length >= 1 && (r.dimensi || []).length <= 3],
    ['Tujuan pembelajaran', !!(i.desain && (i.desain.tp || []).filter(Boolean).length)],
    ['Praktik pedagogis & lingkungan belajar', !!(i.desain && i.desain.praktik_pedagogis && i.desain.lingkungan_belajar)],
    ['Kemitraan & pemanfaatan digital', !!(i.desain && i.desain.kemitraan && i.desain.pemanfaatan_digital)],
    ['5 tahap pengalaman belajar', TAHAP.every(([k]) => i.pengalaman && i.pengalaman[k] && (i.pengalaman[k].kegiatan || []).filter(Boolean).length)],
    ['Asesmen awal, proses, akhir', !!(i.asesmen && i.asesmen.diagnostik && i.asesmen.formatif && i.asesmen.sumatif)],
    ['Diferensiasi 3 tingkat kesiapan', !!(i.diferensiasi && i.diferensiasi.pemula && i.diferensiasi.berkembang && i.diferensiasi.cakap)]
  ];
  const total = Number(r.jp || 0) * Number(i.menit_jp || 35);
  const durasi = TAHAP.reduce((a, [k]) => a + (parseInt((i.pengalaman && i.pengalaman[k] && i.pengalaman[k].durasi) || '0', 10) || 0), 0);
  cek.push([`Total durasi = alokasi (${durasi}/${total} menit)`, total > 0 && durasi === total]);
  return { cek, skor: Math.round((cek.filter((c) => c[1]).length / cek.length) * 100) };
}

function editor(el, ctx, r) {
  const i = r.isi || {};
  const k = db.get('Kelas', r.kelas_id) || {};
  const s = S.sekolah || {};
  const status = STATUS_RPP[r.status || 'draf'] || STATUS_RPP.draf;
  const { cek, skor } = skorKepatuhan(r);
  const kunci = r.status === 'diajukan' || r.status === 'disetujui';
  const tpList = (i.desain && i.desain.tp) || [];
  const kbc = String(r.mode_kbc) === '1';
  el.innerHTML = `
  <div class="page-h"><div><div class="crumbs"><a href="#/rencana">Rencana Ajar</a>${ic('chevr', 'ic-s')}<span>Kelas ${esc(k.nama || '-')}</span>${ic('chevr', 'ic-s')}<span>${esc(namaMapel(r.mapel_id))}</span>${ic('chevr', 'ic-s')}<b class="truncate" style="max-width:280px">${esc(r.materi || r.judul)}</b></div>
    <h1 class="editable" contenteditable="${kunci ? 'false' : 'plaintext-only'}" data-field="judul" style="margin-top:.25rem">${esc(r.judul || r.materi)}</h1>
    <div class="row row-wrap small muted" style="margin-top:.35rem"><span class="badge ${status.cls}">${status.label}</span>${i._draf ? `<span class="badge b-ai">${ic('sparkles', 'ic-s')}Draf ${i._draf === 'ai' ? 'AI' : 'templat'} — tinjau</span>` : ''}<span>${ic('cloud', 'ic-s')} Tersimpan otomatis di perangkat</span><span>· Versi ${esc(r.versi || 1)} (diubah ${waktuRelatif(r.updated_at)})</span></div></div>
    <div class="row row-wrap no-print">
      <label class="row switch small" title="Integrasi Kurikulum Berbasis Cinta"><input type="checkbox" data-act-change="kbc" ${kbc ? 'checked' : ''} ${kunci ? 'disabled' : ''}><b>Mode Madrasah (KBC)</b></label>
      <button class="btn btn-white btn-sm" data-act="ekspor">${ic('download', 'ic-s')}Ekspor</button>
      ${r.status === 'disetujui' ? `<button class="btn btn-white btn-sm" data-act="revisi-baru">${ic('copy', 'ic-s')}Buat versi baru</button>` : r.status === 'diajukan' ? `<button class="btn btn-white btn-sm" data-act="tarik">${ic('arrowl', 'ic-s')}Tarik pengajuan</button>` : `<button class="btn btn-dark btn-sm" data-act="ajukan">${ic('send', 'ic-s')}Telaah Kepala Sekolah</button>`}
    </div></div>

  ${i._draf ? `<div class="ai-bar no-print" style="margin-bottom:1rem"><span class="icon-box" style="background:var(--surface);color:var(--at)">${ic('sparkles')}</span><span class="grow"><b>Draf ${i._draf === 'ai' ? 'AI Co-Pilot' : 'templat bawaan'} Master Teacher</b><br><span class="small muted">Disusun berbasis CP Fase ${esc(k.fase || '-')} & standar Permendikdasmen 1/2026. Sunting langsung bagian mana pun, lalu terima.</span></span>
    <button class="btn btn-primary btn-sm" data-act="terima">${ic('check', 'ic-s')}Terima draf</button><button class="btn btn-white btn-sm" data-act="variasi">${ic('refresh', 'ic-s')}Variasi baru</button><button class="btn btn-white btn-sm" data-act="lkpd">${ic('file', 'ic-s')}Ringkas ke LKPD</button></div>` : ''}
  ${r.telaah && r.telaah.catatan ? `<div class="card card-s no-print" style="margin-bottom:1rem;border-left:6px solid ${r.status === 'revisi' ? 'var(--amber)' : 'var(--green)'}"><b>${r.status === 'revisi' ? 'Catatan revisi dari kepala sekolah' : 'Hasil telaah kepala sekolah'}</b> <span class="tiny muted">· ${esc(r.telaah.oleh || '')} · ${r.telaah.waktu ? fmtTgl(r.telaah.waktu, 'pendek') : ''}</span><p class="small" style="margin-top:.25rem">${esc(r.telaah.catatan)}</p></div>` : ''}

  <div class="split-8">
    <article class="paper" id="kertas" data-kunci="${kunci}">
      <div class="row between row-wrap tiny muted no-print" style="margin-bottom:1rem"><span class="badge b-pl">Regulasi Permendikdasmen No. 1 Tahun 2026</span><span>Lembar Perencanaan Guru ${kunci ? '· terkunci (sedang/sudah ditelaah)' : 'Aktif'}</span></div>
      <h2 style="text-align:center;letter-spacing:.02em">RENCANA PELAKSANAAN PEMBELAJARAN (RPP)</h2>
      <p class="small muted" style="text-align:center;margin-bottom:1.25rem">Pendekatan Pembelajaran Mendalam — Berkesadaran, Bermakna, Menggembirakan${kbc ? ' · Terintegrasi Kurikulum Berbasis Cinta' : ''}</p>
      <div class="grid g4" style="gap:.5rem;margin-bottom:1.25rem">
        <div class="meta-box"><div class="tiny">Satuan Pendidikan</div><b class="small">${esc(s.nama || '-')}</b></div>
        <div class="meta-box"><div class="tiny">Fase / Kelas</div><b class="small">Fase ${esc(k.fase || '-')} / ${esc(k.nama || '-')}</b></div>
        <div class="meta-box"><div class="tiny">Alokasi Waktu</div><b class="small">${esc(r.jp || 2)} JP × ${esc(i.menit_jp || 35)} menit</b></div>
        <div class="meta-box"><div class="tiny">Tanggal</div><b class="small">${r.tanggal ? fmtTgl(r.tanggal, 'pendek') : '-'}</b></div>
      </div>

      <h4 class="sec"><span class="sec-n">1</span>Identifikasi Kebutuhan Belajar & Profil Lulusan</h4>
      <div class="col" style="margin:.6rem 0 1.25rem">
        <div><span class="label">Kesiapan peserta didik</span>${ed('identifikasi.kesiapan', ambil(i, 'identifikasi.kesiapan'))}</div>
        <div><span class="label">Karakteristik materi</span>${ed('identifikasi.karakteristik_materi', ambil(i, 'identifikasi.karakteristik_materi'))}</div>
        <div class="grid g3" style="gap:.5rem">${[['pemula', 'Tingkat Pemula', 'var(--qs-bg)'], ['berkembang', 'Tingkat Berkembang', 'var(--mt-bg)'], ['cakap', 'Tingkat Cakap', 'var(--gr-bg)']].map(([kk, l, bg]) => `<div class="stage" style="background:${bg}"><div class="stage-h small">${l}</div>${ed('diferensiasi.' + kk, ambil(i, 'diferensiasi.' + kk), 'Strategi untuk kelompok ini…')}</div>`).join('')}</div>
        <div class="row row-wrap"><span class="label">Dimensi profil lulusan:</span>${(r.dimensi || []).map((d) => `<span class="badge b-pl">${esc(d.replace(' kepada Tuhan YME', ''))}</span>`).join('')}<button class="btn btn-ghost btn-xs no-print" data-act="ubah-dimensi" ${kunci ? 'disabled' : ''}>${ic('edit', 'ic-s')}Ubah</button></div>
        <div class="row row-wrap"><span class="label">Prinsip belajar:</span>${PRINSIP.map((p) => `<span class="badge b-mt">${p}</span>`).join('')}</div>
      </div>

      <h4 class="sec"><span class="sec-n">2</span>Desain Pembelajaran</h4>
      <div class="col" style="margin:.6rem 0 1.25rem">
        <div><span class="label">Capaian Pembelajaran (CP)</span>${ed('desain.cp', ambil(i, 'desain.cp') || i.cp, 'Tempel CP resmi fase ini…')}</div>
        <div><span class="label">Tujuan Pembelajaran (TP)</span>${daftarEd('desain.tp', tpList, 'Peserta didik mampu …')}</div>
        <div class="grid g2" style="gap:.75rem">
          ${[['topik_kontekstual', 'Topik kontekstual & kearifan lokal'], ['lintas_disiplin', 'Lintas disiplin ilmu'], ['praktik_pedagogis', 'Praktik pedagogis (model/strategi)'], ['kemitraan', 'Kemitraan pembelajaran'], ['lingkungan_belajar', 'Lingkungan belajar'], ['pemanfaatan_digital', 'Pemanfaatan digital']].map(([kk, l]) => `<div><span class="label">${l}</span>${ed('desain.' + kk, ambil(i, 'desain.' + kk))}</div>`).join('')}
        </div>
      </div>

      <h4 class="sec"><span class="sec-n">3</span>Pengalaman Belajar</h4>
      <div class="col" style="margin:.6rem 0 1.25rem">${TAHAP.map(([kk, l, p]) => `<div class="stage"><div class="stage-h"><span>${l} <span class="badge ${p === 'Bermakna' ? 'b-mt' : p === 'Menggembirakan' ? 'b-gr' : 'b-at'}">${p}</span></span><span class="small" style="display:flex;gap:.25rem;align-items:center">${ic('clock', 'ic-s')}<span class="editable" contenteditable="plaintext-only" data-path="pengalaman.${kk}.durasi" data-ph="… menit">${esc(ambil(i, `pengalaman.${kk}.durasi`) || '')}</span></span></div>${daftarEd(`pengalaman.${kk}.kegiatan`, ambil(i, `pengalaman.${kk}.kegiatan`), 'Kegiatan…')}</div>`).join('')}</div>

      <h4 class="sec"><span class="sec-n">4</span>Asesmen Pembelajaran</h4>
      <div class="grid g3" style="gap:.5rem;margin:.6rem 0 1.25rem">${[['diagnostik', 'Asesmen awal (diagnostik)'], ['formatif', 'Asesmen proses (formatif)'], ['sumatif', 'Asesmen akhir (sumatif)']].map(([kk, l]) => `<div class="stage"><div class="stage-h small">${l}</div>${ed('asesmen.' + kk, ambil(i, 'asesmen.' + kk))}</div>`).join('')}</div>
      ${kbc ? `<h4 class="sec"><span class="sec-n" style="background:var(--gr-bg);color:var(--gr)">${ic('heart', 'ic-s')}</span>Integrasi Kurikulum Berbasis Cinta</h4><div style="margin:.6rem 0 1.25rem"><div class="row row-wrap" style="margin-bottom:.35rem">${KBC.map((x) => `<span class="badge b-gr">${x}</span>`).join('')}</div>${ed('nilai_kbc', i.nilai_kbc, 'Bagaimana nilai Panca Cinta hadir dalam kegiatan…')}</div>` : ''}
      <p class="tiny muted no-print" style="margin-top:1rem">${ic('info', 'ic-s')} Klik teks mana pun untuk menyunting. Perubahan tersimpan otomatis.</p>
    </article>

    <aside class="col gap-l no-print" style="position:sticky;top:80px">
      <div class="card"><div class="row between"><b>Kepatuhan standar</b><span class="kpi-v" style="font-size:1.5rem;color:${skor >= 90 ? 'var(--gr)' : skor >= 70 ? 'var(--qs)' : 'var(--red)'}">${skor}%</span></div>
        <div class="bar" style="margin:.5rem 0 .75rem"><i style="width:${skor}%;background:${skor >= 90 ? 'var(--green)' : skor >= 70 ? 'var(--amber)' : '#DC2626'}"></i></div>
        <div class="col" style="gap:.3rem">${cek.map(([l, ok]) => `<div class="row small" style="gap:.4rem;align-items:flex-start;color:${ok ? 'var(--text)' : 'var(--muted)'}">${ic(ok ? 'checkc' : 'alert', 'ic-s')}<span>${esc(l)}</span></div>`).join('')}</div></div>
      <div class="card col"><b>Lampiran & tindak lanjut</b>
        <button class="btn btn-white btn-sm btn-block" data-act="lkpd">${ic('file', 'ic-s')}Buat LKPD dari RPP ini</button>
        <a class="btn btn-white btn-sm btn-block" href="#/soal?baru=1&m=${r.mapel_id}&materi=${encodeURIComponent(r.materi || r.judul)}">${ic('clipboard', 'ic-s')}Buat soal asesmen</a>
        <a class="btn btn-white btn-sm btn-block" href="#/materi?rpp=${r.id}">${ic('image', 'ic-s')}Tautkan materi & media</a>
        <button class="btn btn-white btn-sm btn-block" data-act="duplikat">${ic('copy', 'ic-s')}Duplikat untuk kelas lain</button>
        <button class="btn btn-ghost btn-sm btn-block" data-act="hapus" style="color:var(--red)">${ic('trash', 'ic-s')}Hapus RPP</button></div>
      ${r.dok_kode ? `<div class="card card-sky small">${ic('qr', 'ic-s')} <b>Dokumen ber-QR</b><br>Kode verifikasi: <b>${esc(r.dok_kode)}</b><br><a href="#/verifikasi/${esc(r.dok_kode)}">Lihat halaman verifikasi</a></div>` : ''}
    </aside>
  </div>`;

  const kertas = el.querySelector('#kertas');
  if (CE !== 'plaintext-only') el.querySelectorAll('[contenteditable="plaintext-only"]').forEach((x) => x.setAttribute('contenteditable', CE));
  if (kunci) kertas.querySelectorAll('[contenteditable]').forEach((x) => x.setAttribute('contenteditable', 'false'));
  // Simpan suntingan (debounce) — salinan isi dipegang lokal agar tiap ketikan tidak memicu render ulang
  let isi = JSON.parse(JSON.stringify(i));
  const simpan = debounce(() => {
    db.put('RPP', r.id, { isi }, { senyap: true });
  }, 600);
  kertas.addEventListener('input', (e) => {
    const t = e.target.closest('[data-path]');
    if (!t) return;
    atur(isi, t.dataset.path, t.textContent);
    simpan();
  });
  const judul = el.querySelector('[data-field="judul"]');
  judul.addEventListener('blur', () => { const v = judul.textContent.trim(); if (v && v !== r.judul) db.put('RPP', r.id, { judul: v }, { senyap: true }); });
  judul.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); judul.blur(); } });
  kertas.addEventListener('keydown', (e) => {
    const li = e.target.closest('li[data-path]');
    if (li && e.key === 'Enter') { e.preventDefault(); tambahItem(li.closest('ul').dataset.list, li); }
    if (li && e.key === 'Backspace' && !li.textContent && li.parentElement.children.length > 1) { e.preventDefault(); const prev = li.previousElementSibling; hapusItem(li); if (prev) taruhKursor(prev); }
  });
  el.addEventListener('focusin', (e) => { if (e.target.closest('[contenteditable]:not([contenteditable="false"])')) ctx.hold = true; });
  el.addEventListener('focusout', (e) => { if (e.target.closest('[contenteditable]')) { ctx.hold = false; const li = e.target.closest('li[data-path]'); if (li && !li.textContent.trim() && li.parentElement.children.length > 1) hapusItem(li); } });

  const susunUlangList = (ul) => {
    const path = ul.dataset.list;
    const arr = Array.from(ul.children).map((x, n) => { x.dataset.path = `${path}.${n}`; return x.textContent; });
    atur(isi, path, arr); simpan();
  };
  const tambahItem = (path, setelah) => {
    const ul = kertas.querySelector(`ul[data-list="${path}"]`);
    const li = document.createElement('li');
    li.className = 'editable'; li.setAttribute('contenteditable', CE); li.dataset.ph = 'Kegiatan…';
    if (setelah) setelah.after(li); else ul.appendChild(li);
    susunUlangList(ul); li.focus();
  };
  const hapusItem = (li) => { const ul = li.parentElement; li.remove(); susunUlangList(ul); };
  const taruhKursor = (node) => { node.focus(); const rg = document.createRange(); rg.selectNodeContents(node); rg.collapse(false); const sl = getSelection(); sl.removeAllRanges(); sl.addRange(rg); };

  delegasi(el, {
    'tambah-item': (b) => { if (!kunci) tambahItem(b.dataset.list); },
    kbc: (c) => { db.put('RPP', r.id, { mode_kbc: c.checked ? '1' : '0' }); },
    terima: () => { isi._draf = ''; db.put('RPP', r.id, { isi, ai: r.ai || 'diterima' }); toast('Draf diterima. Anda tetap dapat menyunting kapan saja.'); },
    variasi: async (b) => {
      if (!(await konfirmasi('Susun variasi baru? Isi RPP saat ini akan diganti draf baru (versi sebelumnya tidak disimpan).', { ya: 'Susun variasi' }))) return;
      b.disabled = true; b.innerHTML = `${ic('refresh', 'ic-s spin')}Menyusun…`;
      const m = db.get('Mapel', r.mapel_id) || {};
      const res = await jalankanAi('rpp', { jenjang: k.jenjang, fase: k.fase, kelas: k.nama, mapel: m.nama, materi: r.materi, jp: r.jp, menit_jp: i.menit_jp, cp: ambil(isi, 'desain.cp'), tp: (ambil(isi, 'desain.tp') || []).filter(Boolean), dimensi: r.dimensi, model: r.model + ' (variasi berbeda dari sebelumnya)', konteks: ambil(isi, 'desain.topik_kontekstual'), mode_kbc: r.mode_kbc });
      if (res.alasan) toast(res.alasan, 'info');
      db.put('RPP', r.id, { isi: Object.assign({ menit_jp: i.menit_jp }, res.hasil, { _draf: res.sumber }), versi: (Number(r.versi) || 1) + 1 });
    },
    'ubah-dimensi': async () => {
      const pilih = new Set(r.dimensi || []);
      const res = await modal({ title: 'Dimensi profil lulusan (1–3)', body: `<div class="col">${DIMENSI.map((d) => `<label class="check row" style="gap:.5rem"><input type="checkbox" name="d" data-multi value="${esc(d)}" ${pilih.has(d) ? 'checked' : ''}><span>${esc(d)}</span></label>`).join('')}</div>`, actions: [{ label: 'Batal', value: null, cls: 'btn-ghost' }, { label: 'Simpan', value: 'ok', cls: 'btn-dark', validate: (f) => (!f.d || !f.d.length || f.d.length > 3 ? 'Pilih 1 sampai 3 dimensi.' : '') }] });
      if (res.value === 'ok') { isi.identifikasi = Object.assign({}, isi.identifikasi, { dimensi: res.form.d }); db.put('RPP', r.id, { dimensi: res.form.d, isi }); }
    },
    ekspor: () => dialogEkspor(r),
    ajukan: () => ajukan(r, skor),
    tarik: async () => { if (await konfirmasi('Tarik pengajuan telaah? RPP kembali menjadi draf dan dapat disunting.')) db.put('RPP', r.id, { status: 'draf' }); },
    'revisi-baru': async () => { if (!(await konfirmasi('RPP yang sudah disetujui dikunci. Buat salinan versi baru untuk disunting?'))) return; const id = uid('R'); const c = Object.assign({}, r); delete c.id; delete c._local; db.put('RPP', id, Object.assign(c, { status: 'draf', telaah: null, dok_kode: '', versi: (Number(r.versi) || 1) + 1, judul: r.judul })); pergi('/rencana/' + id); },
    duplikat: () => duplikat(r),
    hapus: async () => { if (await konfirmasi(`Hapus RPP <b>${esc(r.judul)}</b>?`, { bahaya: true, ya: 'Hapus' })) { db.del('RPP', r.id); toast('RPP dihapus.'); pergi('/rencana'); } },
    lkpd: (b) => buatLkpd(b, r, isi)
  });
}

// ---------- Ekspor / cetak ----------
function htmlRpp(r, dok) {
  const i = r.isi || {}; const k = db.get('Kelas', r.kelas_id) || {}; const s = S.sekolah || {};
  const ul = (a) => `<ul>${(a || []).filter(Boolean).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
  const v = (p) => esc(ambil(i, p) || '-');
  return `${kopHtml()}<h1>Rencana Pelaksanaan Pembelajaran (RPP)</h1><p class="c">Pembelajaran Mendalam — ${esc(r.judul || r.materi)}${dok && dok.nomor ? `<br>Nomor: ${esc(dok.nomor)}` : ''}</p>
  <table class="plain"><tr><td style="width:32%">Satuan Pendidikan</td><td>: ${esc(s.nama || '-')}</td></tr><tr><td>Mata Pelajaran</td><td>: ${esc(namaMapel(r.mapel_id))}</td></tr><tr><td>Fase / Kelas / Semester</td><td>: ${esc(k.fase || '-')} / ${esc(k.nama || '-')} / ${Number(k.semester) === 2 ? 'Genap' : 'Ganjil'}</td></tr><tr><td>Materi</td><td>: ${esc(r.materi || '-')}</td></tr><tr><td>Alokasi Waktu</td><td>: ${esc(r.jp)} JP × ${esc(i.menit_jp || 35)} menit</td></tr><tr><td>Penyusun</td><td>: ${esc((S.user || {}).nama || '-')}</td></tr></table>
  <h2>A. Identifikasi</h2><h3>Kesiapan peserta didik</h3><p>${v('identifikasi.kesiapan')}</p><h3>Karakteristik materi</h3><p>${v('identifikasi.karakteristik_materi')}</p><h3>Dimensi profil lulusan</h3><p>${esc((r.dimensi || []).join(', '))}</p>
  <h2>B. Desain Pembelajaran</h2><h3>Capaian Pembelajaran</h3><p>${esc(ambil(i, 'desain.cp') || i.cp || '-')}</p><h3>Tujuan Pembelajaran</h3>${ul(ambil(i, 'desain.tp'))}
  <table><tr><th style="width:30%">Komponen</th><th>Uraian</th></tr>${[['topik_kontekstual', 'Topik kontekstual'], ['lintas_disiplin', 'Lintas disiplin'], ['praktik_pedagogis', 'Praktik pedagogis'], ['kemitraan', 'Kemitraan pembelajaran'], ['lingkungan_belajar', 'Lingkungan belajar'], ['pemanfaatan_digital', 'Pemanfaatan digital']].map(([kk, l]) => `<tr><td>${l}</td><td>${v('desain.' + kk)}</td></tr>`).join('')}</table>
  <h2>C. Pengalaman Belajar</h2><table><tr><th style="width:22%">Tahap</th><th>Kegiatan</th><th style="width:14%">Waktu</th></tr>${TAHAP.map(([kk, l, p]) => `<tr><td><b>${l}</b><br><i>${p}</i></td><td>${ul(ambil(i, `pengalaman.${kk}.kegiatan`))}</td><td class="c">${v(`pengalaman.${kk}.durasi`)}</td></tr>`).join('')}</table>
  <h3>Diferensiasi</h3><table><tr><th>Pemula</th><th>Berkembang</th><th>Cakap</th></tr><tr><td>${v('diferensiasi.pemula')}</td><td>${v('diferensiasi.berkembang')}</td><td>${v('diferensiasi.cakap')}</td></tr></table>
  <h2>D. Asesmen</h2><table><tr><th>Awal (diagnostik)</th><th>Proses (formatif)</th><th>Akhir (sumatif)</th></tr><tr><td>${v('asesmen.diagnostik')}</td><td>${v('asesmen.formatif')}</td><td>${v('asesmen.sumatif')}</td></tr></table>
  ${String(r.mode_kbc) === '1' && i.nilai_kbc ? `<h2>E. Integrasi Kurikulum Berbasis Cinta</h2><p>${esc(i.nilai_kbc)}</p>` : ''}
  ${ttdHtml({ tanggal: r.tanggal, ttdKepsek: ttdElektronik(dok) })}${verifHtml(dok)}`;
}
async function dialogEkspor(r) {
  const res = await modal({ title: 'Ekspor RPP', body: `<div class="col gap-l"><div class="field"><span>Ukuran kertas</span><div class="seg"><button type="button" role="tab" data-k="A4" aria-selected="${S.prefs.kertas !== 'F4'}">A4</button><button type="button" role="tab" data-k="F4" aria-selected="${S.prefs.kertas === 'F4'}">F4 / Folio</button></div></div><p class="small muted">RPP yang sudah disetujui kepala sekolah otomatis memuat QR verifikasi & tanda tangan elektronik.</p></div>`,
    actions: [{ label: 'Word (.doc)', value: 'word', cls: 'btn-white' }, { label: 'Cetak / PDF', value: 'cetak', cls: 'btn-dark' }],
    onOpen: (d) => d.querySelectorAll('[data-k]').forEach((b) => { b.onclick = () => { simpanPrefs({ kertas: b.dataset.k }); d.querySelectorAll('[data-k]').forEach((x) => x.setAttribute('aria-selected', x === b)); }; }) });
  if (!res.value) return;
  const dok = r.dok_kode ? await dokUntuk(r.id, { segar: true }) : null;
  const html = htmlRpp(r, dok || (r.dok_kode ? { kode: r.dok_kode } : null));
  const judul = `RPP ${namaMapel(r.mapel_id)} ${namaKelas(r.kelas_id)} - ${r.judul}`;
  if (res.value === 'word') eksporWord(judul, html); else cetak(judul, html);
}
async function ajukan(r, skor) {
  if (isDemo()) {
    const isi = r.isi && r.isi._draf ? Object.assign({}, r.isi, { _draf: '' }) : r.isi;
    const d = demoTerbitkan({ jenis: 'RPP', ref_id: r.id, judul: r.judul, butuh_ttd: true });
    db.put('RPP', r.id, { status: 'diajukan', isi, dok_kode: d.kode });
    toast('RPP diajukan. Kepala sekolah menerima pemberitahuan (mode demo: hasil telaah tiba dalam beberapa detik).', 'info', 5000);
    setTimeout(() => {
      if ((db.get('RPP', r.id) || {}).status !== 'diajukan') return;
      const w = new Date().toISOString();
      demoSahkan(r.id, w);
      db.put('RPP', r.id, { status: 'disetujui', telaah: { keputusan: 'disetujui', catatan: 'RPP lengkap, kontekstual, dan diferensiasinya jelas. Disetujui.', oleh: (S.sekolah || {}).kepsek_nama, waktu: w, skor: Math.max(80, skor) } });
      toast('Kepala sekolah menyetujui RPP Anda. Dokumen kini memuat QR verifikasi & tanda tangan elektronik.', 'ok', 5000);
    }, 4000);
    return;
  }
  if (!S.sekolah || !S.sekolah.id) { toast('Hubungkan akun dengan sekolah terlebih dahulu (Pengaturan → Sekolah).', 'warn', 5000); pergi('/pengaturan?tab=sekolah'); return; }
  if (!navigator.onLine) { toast('Pengajuan telaah membutuhkan internet. RPP tetap tersimpan sebagai draf.', 'warn'); return; }
  if (skor < 70 && !(await konfirmasi(`Kepatuhan standar baru <b>${skor}%</b>. Ajukan tetap?`, { ya: 'Ajukan' }))) return;
  if (r.isi && r.isi._draf) { const isi = Object.assign({}, r.isi, { _draf: '' }); db.put('RPP', r.id, { isi }); }
  db.put('RPP', r.id, { status: 'diajukan' });
  try {
    await sinkron();
    const cur = db.get('RPP', r.id);
    const hash = await sha256Hex(JSON.stringify(cur.isi || {}));
    const res = await api('doc.issue', { jenis: 'RPP', ref_id: r.id, judul: cur.judul, hash, butuh_ttd: true, meta: { ringkasan: `${namaMapel(cur.mapel_id)} · Kelas ${namaKelas(cur.kelas_id)}` } });
    simpanDokCache(res.data);
    db.put('RPP', r.id, { dok_kode: res.data.kode });
    toast('RPP diajukan. Kepala sekolah menerima pemberitahuan.');
  } catch (e) { toast('Status tersimpan, tetapi pemberitahuan gagal: ' + e.message, 'warn', 5000); }
}
async function duplikat(r) {
  const kelas = kelasList();
  const res = await modal({ title: 'Duplikat RPP', body: `<label class="field"><span>Ke kelas</span><select class="input" name="k">${kelas.map((k) => `<option value="${k.id}">Kelas ${esc(k.nama)}</option>`).join('')}</select></label><p class="hint">Mapel dengan nama yang sama dipilih otomatis.</p>`, actions: [{ label: 'Batal', value: null, cls: 'btn-ghost' }, { label: 'Duplikat', value: 'ok', cls: 'btn-dark' }] });
  if (res.value !== 'ok') return;
  const nm = namaMapel(r.mapel_id);
  const m = mapelKelas(res.form.k).find((x) => x.nama === nm) || mapelKelas(res.form.k)[0];
  const id = uid('R'); const c = Object.assign({}, r); delete c.id; delete c._local;
  db.put('RPP', id, Object.assign(c, { kelas_id: res.form.k, mapel_id: m ? m.id : r.mapel_id, status: 'draf', telaah: null, dok_kode: '', versi: 1 }));
  toast('RPP diduplikat.'); pergi('/rencana/' + id);
}
async function buatLkpd(b, r, isi) {
  const lama = b.innerHTML; b.disabled = true; b.innerHTML = `${ic('refresh', 'ic-s spin')}Menyusun LKPD…`;
  const k = db.get('Kelas', r.kelas_id) || {};
  const res = await jalankanAi('lkpd', { mapel: namaMapel(r.mapel_id), kelas: k.nama, materi: r.materi, tp: ((isi.desain && isi.desain.tp) || []).join('; '), bentuk: 'kelompok' });
  b.disabled = false; b.innerHTML = lama;
  const l = res.hasil;
  const html = `${kopHtml()}<h1>${esc(l.judul)}</h1><table class="plain"><tr><td>Nama/Kelompok</td><td>: ..............................................</td></tr><tr><td>Kelas</td><td>: ${esc(k.nama || '')}</td></tr></table>
    <h3>Tujuan</h3><p>${esc(l.tujuan)}</p><h3>Petunjuk</h3><ol>${(l.petunjuk || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ol>
    ${(l.kegiatan || []).map((g, n) => `<h3>Kegiatan ${n + 1}</h3><p>${esc(g.langkah)}</p><ol>${(g.pertanyaan || []).map((x) => `<li>${esc(x)}<br><br>............................................................................................</li>`).join('')}</ol>`).join('')}
    <h3>Refleksi</h3><ol>${(l.refleksi || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ol>
    <h3>Rubrik</h3><table><tr><th>Kriteria</th><th>4</th><th>3</th><th>2</th><th>1</th></tr>${(l.rubrik || []).map((x) => `<tr><td>${esc(x.kriteria)}</td><td>${esc(x.skor4)}</td><td>${esc(x.skor3)}</td><td>${esc(x.skor2)}</td><td>${esc(x.skor1)}</td></tr>`).join('')}</table>`;
  const ok = await modal({ title: l.judul, wide: true, body: `<div class="${res.sumber === 'ai' ? 'ai-draft' : 'card-flat'}" style="max-height:60vh;overflow:auto">${res.alasan ? `<p class="tiny muted">${esc(res.alasan)}</p>` : ''}<h4>Tujuan</h4><p class="small">${esc(l.tujuan)}</p><h4 style="margin-top:.5rem">Kegiatan</h4><ol class="small">${(l.kegiatan || []).map((g) => `<li><b>${esc(g.langkah)}</b><ul>${(g.pertanyaan || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul></li>`).join('')}</ol></div>`,
    actions: [{ label: 'Simpan ke Materi', value: 'simpan', cls: 'btn-white' }, { label: 'Word', value: 'word', cls: 'btn-white' }, { label: 'Cetak', value: 'cetak', cls: 'btn-dark' }] });
  if (ok.value === 'cetak') cetak(l.judul, html);
  if (ok.value === 'word') eksporWord(l.judul, html);
  if (ok.value === 'simpan') { db.put('Materi', uid('MT'), { mapel_id: r.mapel_id, rpp_id: r.id, judul: l.judul, tipe: 'lkpd', isi: JSON.stringify(l), url: '' }); toast('LKPD disimpan di Materi & Media.'); }
}

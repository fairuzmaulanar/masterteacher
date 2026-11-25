// Bank Soal & Asesmen: kelola butir soal ber-level kognitif, generator AI, susun asesmen dari bank.
import { ic } from '../core/icons.js';
import { esc, toast, uid, modal, konfirmasi, debounce, today } from '../core/util.js';
import { S, simpanPrefs } from '../core/state.js';
import { db } from '../core/store.js';
import { delegasi, kelasList, mapelKelas, emptyState, segmen, perluKelas } from '../core/ui.js';
import { BLOOM, TIPE_SOAL, levelDariBloom, JENIS_ASESMEN } from '../core/kurikulum.js';
import { jalankanAi } from '../core/ai.js';
import { namaKelas } from '../core/hitung.js';
import { pergi } from '../core/router.js';

const LV = { LOTS: 'b-mt', MOTS: 'b-qs', HOTS: 'b-pl' };

export default {
  title: 'Bank Soal & Asesmen',
  deps: ['Soal', 'Asesmen', 'Mapel', 'TP', 'Kelas'],
  async render(el, ctx) {
    if (!kelasList().length) { perluKelas(el); return; }
    const all = kelasList().flatMap((k) => mapelKelas(k.id).map((m) => ({ m, k })));
    const q = ctx.query;
    if (q.m && !ctx.qm) { ctx.qm = 1; simpanPrefs({ mapel: q.m }); }
    const pilih = all.find((x) => x.m.id === S.prefs.mapel) || all[0];
    ctx.st = ctx.st || { tab: 'bank', level: 'semua', tipe: 'semua', cari: '' };
    const st = ctx.st;
    if (!pilih) { el.innerHTML = `<div class="card">${emptyState({ icon: 'clipboard', title: 'Belum ada mata pelajaran', action: '<a class="btn btn-primary" href="#/kelas?tab=siswa">Tambah mapel</a>' })}</div>`; return; }
    const m = pilih.m;
    let soal = db.all('Soal', (s) => s.mapel_id === m.id);
    const jumlah = { LOTS: 0, MOTS: 0, HOTS: 0 }; soal.forEach((s) => { jumlah[s.level || levelDariBloom(s.bloom)]++; });
    if (st.level !== 'semua') soal = soal.filter((s) => (s.level || levelDariBloom(s.bloom)) === st.level);
    if (st.tipe !== 'semua') soal = soal.filter((s) => s.tipe === st.tipe);
    const tp = {}; db.all('TP', (t) => t.mapel_id === m.id).forEach((t) => { tp[t.id] = t; });
    const ases = db.all('Asesmen', (a) => a.mapel_id === m.id).sort((a, b) => String(b.tanggal).localeCompare(String(a.tanggal)));

    el.innerHTML = `<div class="page-h"><div><div class="crumbs"><a href="#/hari-ini">Beranda</a>${ic('chevr', 'ic-s')}<b>Bank Soal & Asesmen</b></div><h1>Bank Soal</h1><p class="sub">${esc(m.nama)} · Kelas ${esc(pilih.k.nama)} · ${db.count('Soal', (s) => s.mapel_id === m.id)} butir</p></div>
      <div class="row row-wrap"><select class="input" data-act-change="pilih-mapel" style="width:auto;min-height:44px">${all.map(({ m: x, k }) => `<option value="${x.id}" ${x.id === m.id ? 'selected' : ''}>${esc(x.nama)} — Kelas ${esc(k.nama)}</option>`).join('')}</select>
      <button class="btn btn-white" data-act="soal-baru">${ic('plus', 'ic-s')}Tulis soal</button><button class="btn btn-primary" data-act="gen">${ic('wand', 'ic-s')}Buat soal dengan Co-Pilot</button></div></div>
      <div class="grid g4" style="margin-bottom:1rem">${[['LOTS', 'C1–C2 · mengingat & memahami'], ['MOTS', 'C3 · menerapkan'], ['HOTS', 'C4–C6 · menganalisis–mencipta']].map(([l, t]) => `<button class="card card-s" data-act="f-level" data-v="${l}" style="border:0;text-align:left;cursor:pointer;${st.level === l ? 'box-shadow:inset 0 0 0 2px var(--navy)' : ''}"><span class="badge ${LV[l]}">${l}</span><div class="kpi-v">${jumlah[l]}</div><span class="tiny muted">${t}</span></button>`).join('')}
        <div class="card card-s"><span class="badge">Asesmen</span><div class="kpi-v">${ases.length}</div><span class="tiny muted">tersusun untuk mapel ini</span></div></div>
      <div class="row row-wrap" style="margin-bottom:1rem;gap:.75rem">${segmen([['bank', 'Butir Soal'], ['asesmen', 'Asesmen & Kisi-kisi']], st.tab)}<span class="grow"></span>
        ${st.tab === 'bank' ? `<select class="input" data-act-change="f-tipe" style="width:auto;min-height:40px"><option value="semua">Semua tipe</option>${Object.entries(TIPE_SOAL).map(([k, v]) => `<option value="${k}" ${st.tipe === k ? 'selected' : ''}>${v}</option>`).join('')}</select>${st.level !== 'semua' ? `<button class="chip on" data-act="f-level" data-v="semua">${st.level} ${ic('x', 'ic-s')}</button>` : ''}<div class="search" style="min-width:200px">${ic('search')}<input class="input" type="search" placeholder="Cari soal…" data-cari value="${esc(st.cari)}"></div>` : `<button class="btn btn-dark btn-sm" data-act="ases-susun">${ic('plus', 'ic-s')}Susun asesmen dari bank</button>`}</div>
      <div id="isi"></div>`;
    const isi = el.querySelector('#isi');
    if (st.tab === 'bank') {
      isi.innerHTML = soal.length ? `<div class="col gap-l">${soal.map((s, i) => kartuSoal(s, i, tp)).join('')}</div>` : `<div class="card">${emptyState({ icon: 'clipboard', title: 'Bank soal masih kosong', text: 'Buat soal PG, PG kompleks, benar-salah, isian, dan uraian lengkap dengan level kognitif — tulis sendiri atau minta Co-Pilot.', action: `<button class="btn btn-primary" data-act="gen">${ic('wand', 'ic-s')}Buat soal dengan Co-Pilot</button>` })}</div>`;
      const inp = el.querySelector('[data-cari]');
      if (inp) { inp.oninput = debounce(() => { st.cari = inp.value; const v = inp.value.toLowerCase(); isi.querySelectorAll('[data-teks]').forEach((c) => c.classList.toggle('hide', !c.dataset.teks.includes(v))); }, 150); if (st.cari) inp.oninput(); }
    } else {
      isi.innerHTML = ases.length ? `<div class="grid g2">${ases.map((a) => `<a class="card lift" href="#/asesmen/${a.id}" style="color:inherit;text-decoration:none;display:flex;flex-direction:column;gap:.4rem"><div class="row between"><span class="badge ${JENIS_ASESMEN[a.jenis] ? JENIS_ASESMEN[a.jenis].cls : ''}">${esc(JENIS_ASESMEN[a.jenis] ? JENIS_ASESMEN[a.jenis].label : a.jenis)}</span><span class="tiny muted">Kelas ${esc(namaKelas(a.kelas_id))}</span></div><h3>${esc(a.nama)}</h3><p class="small muted">${(a.soal_ids || []).length} butir soal · ${Object.keys(a.nilai || {}).length} nilai tercatat</p></a>`).join('')}</div>`
        : `<div class="card">${emptyState({ icon: 'clipboard', title: 'Belum ada asesmen', text: 'Pilih butir dari bank soal untuk menyusun asesmen, kisi-kisi, naskah, dan analisis butir.', action: `<button class="btn btn-primary" data-act="ases-susun">Susun asesmen</button>` })}</div>`;
    }

    delegasi(el, {
      'pilih-mapel': (s) => { simpanPrefs({ mapel: s.value }); ctx.rerender(); },
      tab: (b) => { st.tab = b.dataset.tab; ctx.rerender(); },
      'f-level': (b) => { st.level = st.level === b.dataset.v ? 'semua' : b.dataset.v; ctx.rerender(); },
      'f-tipe': (s) => { st.tipe = s.value; ctx.rerender(); },
      'soal-baru': () => dialogSoal(m),
      'ubah-soal': (b) => dialogSoal(m, db.get('Soal', b.dataset.id)),
      gen: () => generator(m, pilih.k, q.materi),
      'ases-susun': () => susunAsesmen(m, pilih.k)
    });
    if (q.baru && !ctx.baru) { ctx.baru = 1; setTimeout(() => generator(m, pilih.k, q.materi), 50); }
  }
};

function kartuSoal(s, i, tp) {
  const lv = s.level || levelDariBloom(s.bloom);
  const opsi = Array.isArray(s.opsi) ? s.opsi : [];
  const kunci = String(s.kunci || '').toUpperCase().split(/\s*,\s*/);
  return `<div class="card card-s" data-teks="${esc(String(s.teks).toLowerCase())}"><div class="row between row-wrap"><div class="row row-wrap"><b class="small muted">#${i + 1}</b><span class="badge">${esc(TIPE_SOAL[s.tipe] || s.tipe)}</span><span class="badge ${LV[lv]}">${lv}</span>${s.bloom ? `<span class="badge">${esc(s.bloom)} · ${esc((BLOOM.find((b) => b.k === s.bloom) || {}).label || '')}</span>` : ''}${s.tp_id && tp[s.tp_id] ? `<span class="badge b-pl">${esc(tp[s.tp_id].kode)}</span>` : ''}</div>
    <button class="btn btn-ghost btn-xs" data-act="ubah-soal" data-id="${s.id}">${ic('edit', 'ic-s')}Ubah</button></div>
    <p style="margin:.5rem 0;white-space:pre-wrap">${esc(s.teks)}</p>
    ${opsi.length ? `<div class="grid g2" style="gap:.35rem">${opsi.map((o, j) => { const h = String.fromCharCode(65 + j); const benar = s.tipe === 'bs' ? String(s.kunci).toLowerCase() === String(o).toLowerCase() : kunci.includes(h); return `<div class="li ${benar ? '' : 'flat'} small" style="${benar ? 'background:var(--gr-bg);color:var(--gr);font-weight:700' : ''}">${s.tipe === 'bs' ? '' : `<b>${h}.</b>`} ${esc(o)} ${benar ? ic('check', 'ic-s') : ''}</div>`; }).join('')}</div>` : `<p class="small"><b>Kunci/pedoman:</b> ${esc(s.kunci || '-')}</p>`}
    ${s.pembahasan ? `<p class="tiny muted" style="margin-top:.4rem">${ic('bulb', 'ic-s')} ${esc(s.pembahasan)}</p>` : ''}</div>`;
}

async function dialogSoal(m, s = null, awal = null) {
  const v = s || awal || { tipe: 'pg', opsi: ['', '', '', ''], bloom: 'C2', skor: 1 };
  const tp = db.all('TP', (t) => t.mapel_id === m.id);
  const opsi = Array.isArray(v.opsi) && v.opsi.length ? v.opsi : ['', '', '', ''];
  const r = await modal({ title: s ? 'Ubah soal' : 'Soal baru', wide: true, body: `<div class="col gap-l">
    <div class="grid g3"><label class="field"><span>Tipe</span><select class="input" name="tipe">${Object.entries(TIPE_SOAL).map(([k, l]) => `<option value="${k}" ${v.tipe === k ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
    <label class="field"><span>Level kognitif (Bloom)</span><select class="input" name="bloom">${BLOOM.map((b) => `<option value="${b.k}" ${v.bloom === b.k ? 'selected' : ''}>${b.k} · ${b.label} (${b.level})</option>`).join('')}</select></label>
    <label class="field"><span>Tujuan pembelajaran</span><select class="input" name="tp_id"><option value="">—</option>${tp.map((t) => `<option value="${t.id}" ${v.tp_id === t.id ? 'selected' : ''}>${esc(t.kode)}</option>`).join('')}</select></label></div>
    <label class="field"><span>Stimulus & pertanyaan</span><textarea class="input" name="teks" rows="4" required>${esc(v.teks || '')}</textarea></label>
    <div class="field"><span>Opsi jawaban <span class="muted">(PG/PG kompleks; satu per baris)</span></span><textarea class="input" name="opsi" rows="4">${esc(opsi.join('\n'))}</textarea></div>
    <div class="grid g2"><label class="field"><span>Kunci jawaban</span><input class="input" name="kunci" value="${esc(v.kunci || '')}" placeholder="PG: A · PGK: A,C · B/S: Benar · uraian: pedoman"></label><label class="field"><span>Skor maksimal</span><input class="input" type="number" name="skor" min="1" max="20" value="${esc(v.skor || 1)}"></label></div>
    <label class="field"><span>Pembahasan <span class="muted">(opsional)</span></span><textarea class="input" name="pembahasan" rows="2">${esc(v.pembahasan || '')}</textarea></label></div>`,
  actions: [...(s ? [{ label: 'Hapus', value: 'hapus', cls: 'btn-ghost' }] : []), { label: 'Batal', value: null, cls: 'btn-ghost' }, { label: 'Simpan', value: 'ok', cls: 'btn-dark' }] });
  if (r.value === 'hapus') { if (await konfirmasi('Hapus soal ini dari bank?', { bahaya: true, ya: 'Hapus' })) db.del('Soal', s.id); return; }
  if (r.value !== 'ok') return;
  const f = r.form;
  db.put('Soal', s ? s.id : uid('Q'), { mapel_id: m.id, tp_id: f.tp_id, tipe: f.tipe, teks: f.teks.trim(), opsi: ['pg', 'pgk', 'bs', 'jodoh'].includes(f.tipe) ? f.opsi.split('\n').map((x) => x.trim()).filter(Boolean) : [], kunci: f.kunci.trim(), bloom: f.bloom, level: levelDariBloom(f.bloom), skor: Number(f.skor) || 1, pembahasan: f.pembahasan.trim() });
  toast('Soal disimpan.');
}

async function generator(m, k, materiAwal = '') {
  const tp = db.all('TP', (t) => t.mapel_id === m.id);
  const r = await modal({ title: 'Buat soal dengan Co-Pilot', body: `<div class="col gap-l">
    <label class="field"><span>Materi</span><input class="input" name="materi" required value="${esc(materiAwal || '')}" placeholder="mis. rantai makanan di sawah"></label>
    <label class="field"><span>Tujuan pembelajaran</span><select class="input" name="tp"><option value="">— pilih (opsional) —</option>${tp.map((t) => `<option value="${t.id}">${esc(t.kode)} ${esc(t.rumusan.slice(0, 70))}</option>`).join('')}</select></label>
    <div class="grid g2"><label class="field"><span>Jumlah</span><input class="input" type="number" name="jumlah" min="1" max="20" value="5"></label>
    <label class="field"><span>Sebaran level</span><select class="input" name="level"><option value="campuran LOTS/MOTS/HOTS">Campuran</option><option value="dominan HOTS dengan stimulus kontekstual">Dominan HOTS</option><option value="LOTS dan MOTS untuk penguatan dasar">Penguatan dasar</option></select></label></div>
    <div class="field"><span>Tipe soal</span><div class="row row-wrap">${Object.entries(TIPE_SOAL).filter(([kk]) => kk !== 'jodoh').map(([kk, l]) => `<label class="check row" style="gap:.4rem"><input type="checkbox" name="tipe" data-multi value="${kk}" ${kk === 'pg' ? 'checked' : ''}><span class="small">${l}</span></label>`).join('')}</div></div></div>`,
  actions: [{ label: 'Batal', value: null, cls: 'btn-ghost' }, { label: 'Buat soal', value: 'ok', cls: 'btn-primary', validate: (f) => (!f.materi.trim() ? 'Isi materi.' : !(f.tipe || []).length ? 'Pilih minimal satu tipe.' : '') }] });
  if (r.value !== 'ok') return;
  toast('Co-Pilot menyusun soal…', 'info', 2500);
  const t = r.form.tp ? db.get('TP', r.form.tp) : null;
  const res = await jalankanAi('soal', { mapel: m.nama, kelas: k.nama, materi: r.form.materi, tp: t ? t.rumusan : '', jumlah: Number(r.form.jumlah) || 5, tipe: r.form.tipe, level: r.form.level });
  const list = (res.hasil && res.hasil.soal) || [];
  const p = await modal({ title: `Draf ${list.length} soal`, wide: true, body: `${res.alasan ? `<p class="small muted" style="margin-bottom:.5rem">${esc(res.alasan)}</p>` : ''}<div class="col gap-l ${res.sumber === 'ai' ? '' : ''}">${list.map((s, i) => `<label class="check row ${res.sumber === 'ai' ? 'ai-draft' : 'card-flat'}" style="gap:.6rem;align-items:flex-start"><input type="checkbox" name="pilih" data-multi value="${i}" checked><span class="small"><span class="badge">${esc(TIPE_SOAL[s.tipe] || s.tipe)}</span> <span class="badge ${LV[s.level] || ''}">${esc(s.level || '')} · ${esc(s.bloom || '')}</span><br>${esc(s.teks)}${(s.opsi || []).length ? `<br><span class="muted">${s.opsi.map((o, j) => String.fromCharCode(65 + j) + '. ' + esc(o)).join(' · ')}</span>` : ''}<br><b>Kunci:</b> ${esc(s.kunci)}</span></label>`).join('')}</div>`,
    actions: [{ label: 'Batal', value: null, cls: 'btn-ghost' }, { label: 'Simpan ke bank soal', value: 'ok', cls: 'btn-dark' }] });
  if (p.value !== 'ok') return;
  (p.form.pilih || []).forEach((i) => { const s = list[Number(i)]; db.put('Soal', uid('Q'), { mapel_id: m.id, tp_id: r.form.tp || '', tipe: s.tipe || 'pg', teks: s.teks, opsi: s.opsi || [], kunci: s.kunci || '', bloom: s.bloom || 'C2', level: s.level || levelDariBloom(s.bloom), skor: s.tipe === 'uraian' ? 4 : 1, pembahasan: [s.indikator ? 'Indikator: ' + s.indikator : '', s.pembahasan || ''].filter(Boolean).join(' · ') }); });
  toast((p.form.pilih || []).length + ' soal masuk bank.');
}

async function susunAsesmen(m, k) {
  const soal = db.all('Soal', (s) => s.mapel_id === m.id);
  if (!soal.length) { toast('Bank soal masih kosong. Tambahkan soal terlebih dahulu.', 'info'); return; }
  const r = await modal({ title: 'Susun asesmen', wide: true, body: `<div class="col gap-l"><div class="grid g3"><label class="field"><span>Nama asesmen</span><input class="input" name="nama" required placeholder="mis. Sumatif Lingkup Materi Bab 4"></label>
    <label class="field"><span>Jenis</span><select class="input" name="jenis">${Object.entries(JENIS_ASESMEN).map(([kk, v]) => `<option value="${kk}" ${kk === 'sumatif_lm' ? 'selected' : ''}>${v.label}</option>`).join('')}</select></label>
    <label class="field"><span>Tanggal</span><input class="input" type="date" name="tanggal" value="${today()}"></label></div>
    <div class="field"><span>Pilih butir soal</span><div class="col" style="max-height:44vh;overflow:auto">${soal.map((s) => `<label class="check row" style="gap:.5rem;align-items:flex-start"><input type="checkbox" name="q" data-multi value="${s.id}"><span class="small"><span class="badge ${LV[s.level] || ''}">${esc(s.level || '')}</span> ${esc(String(s.teks).slice(0, 140))}</span></label>`).join('')}</div></div></div>`,
  actions: [{ label: 'Batal', value: null, cls: 'btn-ghost' }, { label: 'Buat asesmen', value: 'ok', cls: 'btn-dark', validate: (f) => (!(f.q || []).length ? 'Pilih minimal satu soal.' : '') }] });
  if (r.value !== 'ok') return;
  const tpIds = Array.from(new Set(r.form.q.map((id) => (db.get('Soal', id) || {}).tp_id).filter(Boolean)));
  const id = uid('AS');
  db.put('Asesmen', id, { kelas_id: k.id, mapel_id: m.id, nama: r.form.nama.trim(), jenis: r.form.jenis, tanggal: r.form.tanggal, tp_ids: tpIds, soal_ids: r.form.q, bobot: 1, nilai: {}, catatan: {}, butir: {} });
  pergi('/asesmen/' + id);
}

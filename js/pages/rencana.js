// Rencana Ajar: daftar RPP, Tujuan Pembelajaran & ATP, Program Tahunan / Semester.
import { ic } from '../core/icons.js';
import { esc, fmtTgl, toast, uid, modal, konfirmasi, debounce, waktuRelatif } from '../core/util.js';
import { S, simpanPrefs } from '../core/state.js';
import { db } from '../core/store.js';
import { delegasi, kelasList, mapelKelas, emptyState, segmen, perluKelas } from '../core/ui.js';
import { STATUS_RPP, rentangSemester } from '../core/kurikulum.js';
import { namaKelas, namaMapel } from '../core/hitung.js';
import { jalankanAi } from '../core/ai.js';
import { kopHtml, ttdHtml, cetak, eksporXlsx } from '../core/dokumen.js';

export default {
  title: 'Rencana Ajar',
  deps: ['RPP', 'TP', 'Kelas', 'Mapel'],
  render(el, ctx) {
    if (!kelasList().length) { perluKelas(el); return; }
    ctx.st = ctx.st || { tab: ctx.query.tab || 'rpp', kelas: 'semua', status: 'semua', cari: '' };
    const st = ctx.st;
    el.innerHTML = `<div class="page-h"><div><div class="crumbs"><a href="#/hari-ini">Beranda</a>${ic('chevr', 'ic-s')}<b>Rencana Ajar</b></div><h1>Rencana Ajar</h1><p class="sub">RPP Pembelajaran Mendalam, alur tujuan pembelajaran, dan program semester.</p></div>
      <a class="btn btn-primary" href="#/rencana/baru">${ic('plus', 'ic-s')}Buat RPP</a></div>
      <div style="margin-bottom:1rem">${segmen([['rpp', 'RPP / Modul Ajar'], ['tp', 'TP & ATP'], ['prota', 'Prota & Promes']], st.tab)}</div><div id="isi"></div>`;
    const isi = el.querySelector('#isi');
    if (st.tab === 'rpp') tabRpp(isi, st, ctx); else if (st.tab === 'tp') tabTp(isi, st, ctx); else tabProta(isi, st);
    delegasi(el, {
      tab: (b) => { st.tab = b.dataset.tab; ctx.rerender(); },
      'f-kelas': (b) => { st.kelas = b.dataset.id; ctx.rerender(); },
      'f-status': (s) => { st.status = s.value; ctx.rerender(); },
      'pilih-mapel': (s) => { simpanPrefs({ mapel: s.value }); ctx.rerender(); },
      'tp-baru': () => dialogTp(st.mapel),
      'tp-ubah': (b) => dialogTp(st.mapel, db.get('TP', b.dataset.id)),
      'tp-ai': (b) => tpAi(b, st, ctx),
      'prota-cetak': () => cetakProta(st, false),
      'prota-xlsx': () => cetakProta(st, true)
    });
  }
};

function tabRpp(el, st, ctx) {
  const kelas = kelasList();
  let list = db.all('RPP').sort((a, b) => (Number(b.updated_at) || 0) - (Number(a.updated_at) || 0));
  if (st.kelas !== 'semua') list = list.filter((r) => r.kelas_id === st.kelas);
  if (st.status !== 'semua') list = list.filter((r) => (r.status || 'draf') === st.status);
  const q = st.cari.toLowerCase();
  const hitung = (s) => db.count('RPP', (r) => (r.status || 'draf') === s);
  el.innerHTML = `
    <div class="grid g4" style="margin-bottom:1rem">${[['draf', 'Draf', 'b-draf'], ['diajukan', 'Ditelaah', 'b-mt'], ['revisi', 'Perlu revisi', 'b-qs'], ['disetujui', 'Disetujui', 'b-gr']].map(([k, l, c]) => `<div class="card card-s"><span class="badge ${c}">${l}</span><div class="kpi-v">${hitung(k) + (k === 'disetujui' ? hitung('final') : 0)}</div></div>`).join('')}</div>
    <div class="row row-wrap" style="margin-bottom:.75rem;gap:.75rem">
      <div class="chips"><button class="chip ${st.kelas === 'semua' ? 'on' : ''}" data-act="f-kelas" data-id="semua">Semua kelas</button>${kelas.map((k) => `<button class="chip ${st.kelas === k.id ? 'on' : ''}" data-act="f-kelas" data-id="${k.id}">Kelas ${esc(k.nama)}</button>`).join('')}</div>
      <span class="grow"></span>
      <select class="input" style="width:auto;min-height:40px" data-act-change="f-status"><option value="semua">Semua status</option>${Object.entries(STATUS_RPP).map(([k, v]) => `<option value="${k}" ${st.status === k ? 'selected' : ''}>${v.label}</option>`).join('')}</select>
      <div class="search" style="min-width:220px">${ic('search')}<input class="input" type="search" placeholder="Cari RPP…" data-cari value="${esc(st.cari)}"></div>
    </div>
    ${list.length ? `<div class="grid g2" id="daftar">${list.map((r) => { const s = STATUS_RPP[r.status || 'draf'] || STATUS_RPP.draf; return `<a class="card lift" href="#/rencana/${r.id}" data-cari-teks="${esc((r.judul + ' ' + r.materi + ' ' + namaMapel(r.mapel_id)).toLowerCase())}" style="display:flex;flex-direction:column;gap:.5rem;color:inherit;text-decoration:none">
      <div class="row between"><span class="badge b-pl">${esc(namaMapel(r.mapel_id))} · Kelas ${esc(namaKelas(r.kelas_id))}</span><span class="badge ${s.cls}">${s.label}</span></div>
      <h3>${esc(r.judul || r.materi)}</h3><p class="small muted">${esc(r.materi || '')}</p>
      <div class="row row-wrap">${(r.dimensi || []).slice(0, 3).map((d) => `<span class="badge">${esc(d.replace(' kepada Tuhan YME', ''))}</span>`).join('')}</div>
      ${r.status === 'revisi' && r.telaah ? `<p class="small" style="color:var(--qs)">${ic('edit', 'ic-s')} ${esc(r.telaah.catatan)}</p>` : ''}
      <div class="row between tiny muted"><span>${ic('calendar', 'ic-s')} ${r.tanggal ? fmtTgl(r.tanggal, 'pendek') : 'tanpa tanggal'} · ${esc(r.jp || 2)} JP</span><span>diubah ${waktuRelatif(r.updated_at)}</span></div></a>`; }).join('')}</div>`
    : `<div class="card">${emptyState({ icon: 'book', title: 'Belum ada RPP', text: 'Susun RPP Pembelajaran Mendalam pertama Anda dalam kurang dari 5 menit.', action: `<a class="btn btn-primary" href="#/rencana/baru">${ic('wand', 'ic-s')}Buat RPP dengan Co-Pilot</a>` })}</div>`}`;
  const inp = el.querySelector('[data-cari]');
  inp.oninput = debounce(() => { st.cari = inp.value; const v = inp.value.toLowerCase(); el.querySelectorAll('[data-cari-teks]').forEach((c) => c.classList.toggle('hide', !c.dataset.cariTeks.includes(v))); }, 150);
  if (q) inp.oninput();
}

// ---------- TP & ATP ----------
function semuaMapel() { return kelasList().flatMap((k) => mapelKelas(k.id).map((m) => ({ m, k }))); }
function tabTp(el, st) {
  const all = semuaMapel();
  const pilih = all.find((x) => x.m.id === S.prefs.mapel) || all[0];
  if (!pilih) { el.innerHTML = `<div class="card">${emptyState({ icon: 'target', title: 'Belum ada mata pelajaran', action: '<a class="btn btn-primary" href="#/kelas?tab=siswa">Tambah mapel di menu Kelas</a>' })}</div>`; return; }
  st.mapel = pilih.m.id;
  const tp = db.all('TP', (t) => t.mapel_id === pilih.m.id).sort((a, b) => (Number(a.urutan) || 0) - (Number(b.urutan) || 0));
  el.innerHTML = `<div class="split-8"><div class="card">
      <div class="section-h row-wrap"><div class="row"><select class="input" data-act-change="pilih-mapel" style="width:auto;min-height:40px">${all.map(({ m, k }) => `<option value="${m.id}" ${m.id === pilih.m.id ? 'selected' : ''}>${esc(m.nama)} — Kelas ${esc(k.nama)}</option>`).join('')}</select><span class="badge">${tp.length} TP</span></div>
        <button class="btn btn-dark btn-sm" data-act="tp-baru">${ic('plus', 'ic-s')}Tambah TP</button></div>
      ${tp.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Kode</th><th>Rumusan tujuan pembelajaran</th><th>Bab/Lingkup</th><th class="num">Minggu</th><th></th></tr></thead><tbody>${tp.map((t) => `<tr><td><b>${esc(t.kode)}</b></td><td class="small">${esc(t.rumusan)}</td><td class="small">${esc(t.bab || '-')}</td><td class="num">${esc(t.minggu || '-')}</td><td><button class="btn btn-ghost btn-icon btn-xs" data-act="tp-ubah" data-id="${t.id}" aria-label="Ubah TP">${ic('edit', 'ic-s')}</button></td></tr>`).join('')}</tbody></table></div>`
      : emptyState({ icon: 'target', title: 'Belum ada tujuan pembelajaran', text: 'Turunkan TP dari Capaian Pembelajaran dengan Co-Pilot, lalu sesuaikan.' })}
    </div>
    <aside class="card col gap-l"><div class="row"><span class="icon-box" style="background:var(--ai-bg);color:var(--ai)">${ic('sparkles')}</span><b>Turunkan ATP dari CP</b></div>
      <label class="field"><span>Capaian Pembelajaran (tempel dari dokumen resmi)</span><textarea class="input" name="cp" rows="6" placeholder="Pada akhir Fase B, peserta didik …"></textarea></label>
      <div class="grid g2"><label class="field"><span>Jumlah TP</span><input class="input" type="number" name="jumlah" value="8" min="3" max="16"></label><label class="field"><span>Awalan kode</span><input class="input" name="prefix" value="TP"></label></div>
      <button class="btn btn-primary btn-block" data-act="tp-ai">${ic('wand', 'ic-s')}Susun alur TP</button><p class="hint">Hasil berupa draf. TP baru ditambahkan setelah Anda menyetujuinya.</p></aside></div>`;
}
async function dialogTp(mapelId, t = null) {
  const r = await modal({ title: t ? 'Ubah TP' : 'Tujuan pembelajaran baru', body: `<div class="col gap-l"><div class="grid g2" style="grid-template-columns:140px 1fr"><label class="field"><span>Kode</span><input class="input" name="kode" required value="${esc(t ? t.kode : 'TP ' + (db.count('TP', (x) => x.mapel_id === mapelId) + 1))}"></label><label class="field"><span>Bab / lingkup materi</span><input class="input" name="bab" value="${esc(t ? t.bab : '')}"></label></div>
    <label class="field"><span>Rumusan (kompetensi + konten + variasi)</span><textarea class="input" name="rumusan" required rows="3" placeholder="Peserta didik mampu …">${esc(t ? t.rumusan : '')}</textarea></label>
    <label class="field"><span>Rencana minggu ke-</span><input class="input" type="number" name="minggu" min="1" max="20" value="${esc(t ? t.minggu : '')}"></label></div>`,
  actions: [...(t ? [{ label: 'Hapus', value: 'hapus', cls: 'btn-ghost' }] : []), { label: 'Batal', value: null, cls: 'btn-ghost' }, { label: 'Simpan', value: 'ok', cls: 'btn-dark' }] });
  if (r.value === 'hapus') { if (await konfirmasi('Hapus TP ini?', { bahaya: true, ya: 'Hapus' })) db.del('TP', t.id); return; }
  if (r.value !== 'ok') return;
  db.put('TP', t ? t.id : uid('TP'), { mapel_id: mapelId, kode: r.form.kode.trim(), bab: r.form.bab.trim(), rumusan: r.form.rumusan.trim(), minggu: Number(r.form.minggu) || '', urutan: t ? t.urutan : db.count('TP', (x) => x.mapel_id === mapelId) + 1 });
  toast('TP disimpan.');
}
async function tpAi(b, st) {
  const box = b.closest('aside');
  const m = db.get('Mapel', st.mapel), k = db.get('Kelas', m.kelas_id) || {};
  const lama = b.innerHTML; b.disabled = true; b.innerHTML = `${ic('refresh', 'ic-s spin')}Menyusun…`;
  const res = await jalankanAi('atp', { mapel: m.nama, fase: k.fase, kelas: k.nama, semester: k.semester, cp: box.querySelector('[name=cp]').value, jumlah: Number(box.querySelector('[name=jumlah]').value) || 8, prefix: box.querySelector('[name=prefix]').value || 'TP' });
  b.disabled = false; b.innerHTML = lama;
  const list = (res.hasil && res.hasil.tp) || [];
  const r = await modal({ title: 'Draf alur tujuan pembelajaran', wide: true, body: `${res.alasan ? `<p class="small muted" style="margin-bottom:.5rem">${esc(res.alasan)}</p>` : ''}<div class="col">${list.map((t, i) => `<label class="check row" style="gap:.6rem;align-items:flex-start"><input type="checkbox" name="pilih" data-multi value="${i}" checked><span class="small"><b>${esc(t.kode)}</b> ${esc(t.rumusan)} <span class="tiny muted">· ${esc(t.bab || '')} · minggu ${esc(t.minggu || '-')}</span></span></label>`).join('')}</div>`, actions: [{ label: 'Batal', value: null, cls: 'btn-ghost' }, { label: 'Tambahkan yang dipilih', value: 'ok', cls: 'btn-dark' }] });
  if (r.value !== 'ok') return;
  let n = db.count('TP', (x) => x.mapel_id === m.id);
  (r.form.pilih || []).forEach((i) => { const t = list[Number(i)]; db.put('TP', uid('TP'), { mapel_id: m.id, kode: t.kode, rumusan: t.rumusan, bab: t.bab || '', minggu: Number(t.minggu) || '', urutan: ++n }); });
  toast((r.form.pilih || []).length + ' TP ditambahkan.');
}

// ---------- Prota & Promes ----------
function tabProta(el, st) {
  const all = semuaMapel();
  const pilih = all.find((x) => x.m.id === S.prefs.mapel) || all[0];
  if (!pilih) { el.innerHTML = `<div class="card">${emptyState({ icon: 'calendar', title: 'Belum ada mata pelajaran' })}</div>`; return; }
  st.mapel = pilih.m.id;
  const tp = db.all('TP', (t) => t.mapel_id === pilih.m.id).sort((a, b) => (Number(a.urutan) || 0) - (Number(b.urutan) || 0));
  const minggu = 18;
  const jpMinggu = Number(pilih.m.jp) || 4;
  el.innerHTML = `<div class="card"><div class="section-h row-wrap"><div class="row"><select class="input" data-act-change="pilih-mapel" style="width:auto;min-height:40px">${all.map(({ m, k }) => `<option value="${m.id}" ${m.id === pilih.m.id ? 'selected' : ''}>${esc(m.nama)} — Kelas ${esc(k.nama)}</option>`).join('')}</select><span class="badge">${jpMinggu} JP/minggu · ±${jpMinggu * minggu} JP/semester</span></div>
    <div class="row"><button class="btn btn-white btn-sm" data-act="prota-xlsx">${ic('download', 'ic-s')}Excel</button><button class="btn btn-dark btn-sm" data-act="prota-cetak">${ic('print', 'ic-s')}Cetak Promes</button></div></div>
    ${tp.length ? `<div class="tbl-wrap"><table class="tbl heat"><thead><tr><th class="sticky-col">TP</th>${Array.from({ length: minggu }, (_, i) => `<th class="num">${i + 1}</th>`).join('')}</tr></thead><tbody>${tp.map((t) => `<tr><td class="sticky-col small" style="min-width:260px"><b>${esc(t.kode)}</b> ${esc(t.rumusan.slice(0, 80))}${t.rumusan.length > 80 ? '…' : ''}</td>${Array.from({ length: minggu }, (_, i) => `<td class="${Number(t.minggu) === i + 1 || Number(t.minggu) + 1 === i + 1 ? 'h' : ''}">${Number(t.minggu) === i + 1 || Number(t.minggu) + 1 === i + 1 ? '●' : ''}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
      <p class="tiny muted" style="margin-top:.5rem">Setiap TP dijadwalkan 2 minggu mulai dari "minggu ke-" pada daftar TP. Ubah di tab TP & ATP. Rentang semester: ${fmtTgl(rentangSemester().mulai, 'pendek')} – ${fmtTgl(rentangSemester().selesai, 'pendek')}.</p>`
      : emptyState({ icon: 'target', title: 'Susun TP terlebih dahulu', text: 'Program semester dibentuk otomatis dari alur tujuan pembelajaran.' })}</div>`;
}
function cetakProta(st, xlsx) {
  const m = db.get('Mapel', st.mapel), k = db.get('Kelas', m.kelas_id) || {};
  const tp = db.all('TP', (t) => t.mapel_id === m.id).sort((a, b) => (Number(a.urutan) || 0) - (Number(b.urutan) || 0));
  const minggu = 18;
  const tanda = (t, i) => (Number(t.minggu) === i + 1 || Number(t.minggu) + 1 === i + 1 ? '●' : '');
  if (xlsx) { eksporXlsx(`Promes ${m.nama} ${k.nama}`, [{ nama: 'Promes', lebar: [10, 60, 12, ...Array(minggu).fill(4)], baris: [['Kode', 'Tujuan Pembelajaran', 'Bab', ...Array.from({ length: minggu }, (_, i) => i + 1)], ...tp.map((t) => [t.kode, t.rumusan, t.bab || '', ...Array.from({ length: minggu }, (_, i) => tanda(t, i))])] }]); return; }
  const judul = `Program Semester ${m.nama} Kelas ${k.nama}`;
  cetak(judul, `${kopHtml()}<h1>${esc(judul)}</h1><p class="c">Semester ${Number(k.semester) === 2 ? 'Genap' : 'Ganjil'} · Tahun Ajaran ${esc(k.tahun_ajaran || '')} · ${esc(m.jp || 4)} JP/minggu</p><table><thead><tr><th>Kode</th><th>Tujuan Pembelajaran</th>${Array.from({ length: minggu }, (_, i) => `<th>${i + 1}</th>`).join('')}</tr></thead><tbody>${tp.map((t) => `<tr><td>${esc(t.kode)}</td><td>${esc(t.rumusan)}</td>${Array.from({ length: minggu }, (_, i) => `<td class="num">${tanda(t, i)}</td>`).join('')}</tr>`).join('')}</tbody></table>${ttdHtml()}`, { landscape: true });
}

// Materi & Media: pustaka tautan, video, teks bacaan, dan LKPD — tertaut ke RPP.
import { ic } from '../core/icons.js';
import { esc, toast, uid, modal, konfirmasi, debounce } from '../core/util.js';
import { S, simpanPrefs } from '../core/state.js';
import { db } from '../core/store.js';
import { delegasi, kelasList, mapelKelas, emptyState, perluKelas } from '../core/ui.js';
import { namaKelas, namaMapel } from '../core/hitung.js';
import { jalankanAi } from '../core/ai.js';
import { kopHtml, cetak } from '../core/dokumen.js';

const TIPE = { tautan: ['Tautan', 'link', 'b-mt'], video: ['Video', 'video', 'b-pl'], teks: ['Teks bacaan', 'note', 'b-gr'], lkpd: ['LKPD', 'file', 'b-qs'], gambar: ['Gambar', 'image', 'b-at'] };
const aman = (u) => /^https?:\/\//i.test(String(u || '')) ? u : '';

export default {
  title: 'Materi & Media',
  deps: ['Materi', 'Mapel', 'RPP'],
  render(el, ctx) {
    if (!kelasList().length) { perluKelas(el); return; }
    const all = kelasList().flatMap((k) => mapelKelas(k.id).map((m) => ({ m, k })));
    ctx.st = ctx.st || { mapel: 'semua', tipe: 'semua', cari: '' };
    const st = ctx.st;
    const rppQ = ctx.query.rpp ? db.get('RPP', ctx.query.rpp) : null;
    let list = db.all('Materi').sort((a, b) => (Number(b.updated_at) || 0) - (Number(a.updated_at) || 0));
    if (rppQ) list = list.filter((x) => x.rpp_id === rppQ.id || x.mapel_id === rppQ.mapel_id);
    else if (st.mapel !== 'semua') list = list.filter((x) => x.mapel_id === st.mapel);
    if (st.tipe !== 'semua') list = list.filter((x) => x.tipe === st.tipe);
    el.innerHTML = `<div class="page-h"><div><div class="crumbs"><a href="#/hari-ini">Beranda</a>${ic('chevr', 'ic-s')}<b>Materi & Media</b></div><h1>Materi & Media</h1><p class="sub">${rppQ ? `Untuk RPP <b>${esc(rppQ.judul)}</b> · <a href="#/materi">lihat semua</a>` : 'Kumpulkan bahan ajar sekali, pakai berulang di RPP dan kelas mana pun.'}</p></div>
      <button class="btn btn-primary" data-act="baru">${ic('plus', 'ic-s')}Tambah materi</button></div>
      <div class="row row-wrap" style="margin-bottom:1rem;gap:.75rem">
        ${rppQ ? '' : `<select class="input" data-act-change="f-mapel" style="width:auto;min-height:40px"><option value="semua">Semua mapel</option>${all.map(({ m, k }) => `<option value="${m.id}" ${st.mapel === m.id ? 'selected' : ''}>${esc(m.nama)} — ${esc(k.nama)}</option>`).join('')}</select>`}
        <div class="chips"><button class="chip ${st.tipe === 'semua' ? 'on' : ''}" data-act="f-tipe" data-v="semua">Semua</button>${Object.entries(TIPE).map(([k, [l, i]]) => `<button class="chip ${st.tipe === k ? 'on' : ''}" data-act="f-tipe" data-v="${k}">${ic(i, 'ic-s')}${l}</button>`).join('')}</div><span class="grow"></span>
        <div class="search" style="min-width:200px">${ic('search')}<input class="input" type="search" placeholder="Cari materi…" data-cari value="${esc(st.cari)}"></div></div>
      ${list.length ? `<div class="grid g3">${list.map((x) => { const [l, i, c] = TIPE[x.tipe] || TIPE.tautan; return `<article class="card lift col" data-teks="${esc((x.judul + ' ' + (x.isi || '')).toLowerCase().slice(0, 400))}" style="gap:.5rem"><div class="row between"><span class="badge ${c}">${ic(i, 'ic-s')}${l}</span><span class="tiny muted">${esc(namaMapel(x.mapel_id))}</span></div>
        <h3 style="font-size:1rem">${esc(x.judul)}</h3>${x.tipe === 'teks' ? `<p class="small muted" style="display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">${esc(x.isi || '')}</p>` : ''}${x.tingkat ? `<span class="badge">${esc(x.tingkat)}</span>` : ''}
        <div class="row row-wrap" style="margin-top:auto">${aman(x.url) ? `<a class="btn btn-white btn-xs" href="${esc(aman(x.url))}" target="_blank" rel="noopener noreferrer">${ic('arrowne', 'ic-s')}Buka</a>` : ''}${x.tipe === 'teks' ? `<button class="btn btn-white btn-xs" data-act="ringkas" data-id="${x.id}">${ic('sparkles', 'ic-s')}Ringkas</button><button class="btn btn-white btn-xs" data-act="diferensiasi" data-id="${x.id}">${ic('layers', 'ic-s')}3 tingkat baca</button>` : ''}${x.tipe === 'lkpd' || x.tipe === 'teks' ? `<button class="btn btn-white btn-xs" data-act="cetak" data-id="${x.id}">${ic('print', 'ic-s')}Cetak</button>` : ''}<span class="grow"></span><button class="btn btn-ghost btn-icon btn-xs" data-act="ubah" data-id="${x.id}" aria-label="Ubah">${ic('edit', 'ic-s')}</button></div></article>`; }).join('')}</div>`
      : `<div class="card">${emptyState({ icon: 'image', title: 'Belum ada materi', text: 'Simpan tautan video, artikel, teks bacaan, atau LKPD. Teks bacaan bisa diringkas dan dibuat 3 tingkat keterbacaan dengan satu klik.', action: `<button class="btn btn-primary" data-act="baru">${ic('plus', 'ic-s')}Tambah materi</button>` })}</div>`}`;
    const inp = el.querySelector('[data-cari]');
    inp.oninput = debounce(() => { st.cari = inp.value; const v = inp.value.toLowerCase(); el.querySelectorAll('[data-teks]').forEach((c) => c.classList.toggle('hide', !c.dataset.teks.includes(v))); }, 150);
    if (st.cari) inp.oninput();
    delegasi(el, {
      'f-mapel': (s) => { st.mapel = s.value; ctx.rerender(); },
      'f-tipe': (b) => { st.tipe = b.dataset.v; ctx.rerender(); },
      baru: () => dialogMateri(null, rppQ),
      ubah: (b) => dialogMateri(db.get('Materi', b.dataset.id)),
      ringkas: (b) => aiTeks('ringkasan', db.get('Materi', b.dataset.id), b),
      diferensiasi: (b) => aiTeks('diferensiasi', db.get('Materi', b.dataset.id), b),
      cetak: (b) => cetakMateri(db.get('Materi', b.dataset.id))
    });
  }
};

async function dialogMateri(x, rpp) {
  const all = kelasList().flatMap((k) => mapelKelas(k.id).map((m) => ({ m, k })));
  const mid = x ? x.mapel_id : rpp ? rpp.mapel_id : S.prefs.mapel;
  const r = await modal({ title: x ? 'Ubah materi' : 'Materi baru', wide: true, body: `<div class="col gap-l">
    <div class="grid g3"><label class="field"><span>Jenis</span><select class="input" name="tipe">${Object.entries(TIPE).map(([k, [l]]) => `<option value="${k}" ${x && x.tipe === k ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
    <label class="field" style="grid-column:span 2"><span>Mata pelajaran</span><select class="input" name="mapel_id">${all.map(({ m, k }) => `<option value="${m.id}" ${m.id === mid ? 'selected' : ''}>${esc(m.nama)} — Kelas ${esc(k.nama)}</option>`).join('')}</select></label></div>
    <label class="field"><span>Judul</span><input class="input" name="judul" required value="${esc(x ? x.judul : '')}"></label>
    <label class="field"><span>Tautan (URL)</span><input class="input" type="url" name="url" value="${esc(x ? x.url : '')}" placeholder="https://…"></label>
    <label class="field"><span>Isi / teks bacaan <span class="muted">(untuk jenis teks)</span></span><textarea class="input" name="isi" rows="6">${esc(x && x.tipe !== 'lkpd' ? x.isi || '' : '')}</textarea></label></div>`,
  actions: [...(x ? [{ label: 'Hapus', value: 'hapus', cls: 'btn-ghost' }] : []), { label: 'Batal', value: null, cls: 'btn-ghost' }, { label: 'Simpan', value: 'ok', cls: 'btn-dark', validate: (f) => (f.url && !/^https?:\/\//i.test(f.url) ? 'Tautan harus diawali http:// atau https://' : '') }] });
  if (r.value === 'hapus') { if (await konfirmasi('Hapus materi ini?', { bahaya: true, ya: 'Hapus' })) db.del('Materi', x.id); return; }
  if (r.value !== 'ok') return;
  const f = r.form;
  db.put('Materi', x ? x.id : uid('MT'), { tipe: f.tipe, mapel_id: f.mapel_id, judul: f.judul.trim(), url: f.url.trim(), ...(x && x.tipe === 'lkpd' && f.tipe === 'lkpd' ? {} : { isi: f.isi }), rpp_id: x ? x.rpp_id : rpp ? rpp.id : '' });
  toast('Materi disimpan.');
}
async function aiTeks(alat, x, b) {
  const lama = b.innerHTML; b.disabled = true; b.innerHTML = `${ic('refresh', 'ic-s spin')}`;
  const res = await jalankanAi(alat, { teks: x.isi, kelas: namaKelas((db.get('Mapel', x.mapel_id) || {}).kelas_id) });
  b.disabled = false; b.innerHTML = lama;
  const h = res.hasil || {};
  const body = alat === 'ringkasan'
    ? `<h4>Ringkasan</h4><p class="small">${esc(h.ringkasan)}</p><h4 style="margin-top:.5rem">Poin penting</h4><ul class="small">${(h.poin || []).map((p) => `<li>${esc(p)}</li>`).join('')}</ul><h4 style="margin-top:.5rem">Pertanyaan pemantik</h4><ul class="small">${(h.pertanyaan_pemantik || []).map((p) => `<li>${esc(p)}</li>`).join('')}</ul>`
    : (h.tingkat || []).map((t) => `<h4>${esc(t.nama)}</h4><p class="small" style="white-space:pre-wrap">${esc(t.teks)}</p>${(t.kosakata || []).length ? `<p class="tiny"><b>Kosakata:</b> ${t.kosakata.map((k) => `${esc(k.kata)} = ${esc(k.arti)}`).join('; ')}</p>` : ''}<ul class="small">${(t.pertanyaan || []).map((p) => `<li>${esc(p)}</li>`).join('')}</ul>`).join('<div class="divider"></div>');
  const r = await modal({ title: alat === 'ringkasan' ? 'Ringkasan materi' : 'Teks 3 tingkat keterbacaan', wide: true, body: `${res.alasan ? `<p class="tiny muted">${esc(res.alasan)}</p>` : ''}<div class="${res.sumber === 'ai' ? 'ai-draft' : 'card-flat'}" style="max-height:60vh;overflow:auto">${body}</div>`, actions: [{ label: 'Tutup', value: null, cls: 'btn-ghost' }, { label: 'Simpan sebagai materi baru', value: 'ok', cls: 'btn-dark' }] });
  if (r.value !== 'ok') return;
  if (alat === 'ringkasan') db.put('Materi', uid('MT'), { tipe: 'teks', mapel_id: x.mapel_id, rpp_id: x.rpp_id, judul: 'Ringkasan: ' + x.judul, isi: [h.ringkasan, '', ...(h.poin || []).map((p) => '• ' + p)].join('\n') });
  else (h.tingkat || []).forEach((t) => db.put('Materi', uid('MT'), { tipe: 'teks', mapel_id: x.mapel_id, rpp_id: x.rpp_id, judul: `${x.judul} (${t.nama})`, tingkat: t.nama, isi: t.teks + (t.pertanyaan && t.pertanyaan.length ? '\n\nPertanyaan:\n' + t.pertanyaan.map((p, i) => `${i + 1}. ${p}`).join('\n') : '') }));
  toast('Materi baru disimpan.');
}
function cetakMateri(x) {
  if (x.tipe === 'lkpd') {
    let l = {}; try { l = JSON.parse(x.isi || '{}'); } catch (e) { l = {}; }
    cetak(x.judul, `${kopHtml()}<h1>${esc(l.judul || x.judul)}</h1><h3>Tujuan</h3><p>${esc(l.tujuan || '')}</p>${(l.kegiatan || []).map((g, n) => `<h3>Kegiatan ${n + 1}</h3><p>${esc(g.langkah)}</p><ol>${(g.pertanyaan || []).map((p) => `<li>${esc(p)}<br><br>.........................................................................................</li>`).join('')}</ol>`).join('')}<h3>Refleksi</h3><ol>${(l.refleksi || []).map((p) => `<li>${esc(p)}</li>`).join('')}</ol>`);
  } else cetak(x.judul, `${kopHtml()}<h1>${esc(x.judul)}</h1><p style="white-space:pre-wrap">${esc(x.isi || '')}</p>`);
}

// Koreksi & Tugas: papan kanban pelacak tumpukan koreksi.
import { ic } from '../core/icons.js';
import { esc, toast, uid, modal, konfirmasi, today, addDays } from '../core/util.js';
import { db } from '../core/store.js';
import { delegasi, kelasList, mapelKelas, emptyState, perluKelas } from '../core/ui.js';
import { namaKelas, namaMapel, labelTenggat } from '../core/hitung.js';
import { pergi } from '../core/router.js';

const KOLOM = [['diberikan', 'Diberikan', 'var(--mt)'], ['diterima', 'Terkumpul · perlu koreksi', 'var(--qs)'], ['dikoreksi', 'Sedang dikoreksi', 'var(--at)'], ['dikembalikan', 'Dikembalikan', 'var(--gr)']];

export default {
  title: 'Koreksi & Tugas',
  deps: ['Tugas', 'Kelas', 'Mapel', 'Asesmen'],
  render(el, ctx) {
    if (!kelasList().length) { perluKelas(el); return; }
    ctx.st = ctx.st || { kelas: 'semua' };
    const st = ctx.st;
    let tugas = db.all('Tugas');
    if (st.kelas !== 'semua') tugas = tugas.filter((t) => t.kelas_id === st.kelas);
    const sisa = tugas.filter((t) => t.status !== 'dikembalikan').reduce((a, t) => a + Math.max(0, (Number(t.terkumpul) || 0) - (Number(t.dikoreksi) || 0)), 0);
    el.innerHTML = `<div class="page-h"><div><div class="crumbs"><a href="#/hari-ini">Beranda</a>${ic('chevr', 'ic-s')}<b>Koreksi & Tugas</b></div><h1>Pelacak Koreksi</h1><p class="sub">${sisa} berkas belum dikoreksi · seret kartu atau gunakan tombol panah untuk memindah status.</p></div>
      <button class="btn btn-primary" data-act="baru">${ic('plus', 'ic-s')}Tugas baru</button></div>
      <div class="chips" style="margin-bottom:1rem"><button class="chip ${st.kelas === 'semua' ? 'on' : ''}" data-act="f-kelas" data-id="semua">Semua kelas</button>${kelasList().map((k) => `<button class="chip ${st.kelas === k.id ? 'on' : ''}" data-act="f-kelas" data-id="${k.id}">Kelas ${esc(k.nama)}</button>`).join('')}</div>
      ${db.count('Tugas') ? `<div class="kanban">${KOLOM.map(([k, l, w]) => { const isi = tugas.filter((t) => (t.status || 'diberikan') === k).sort((a, b) => String(a.tenggat).localeCompare(String(b.tenggat))); return `<section class="kcol" data-kol="${k}"><div class="row between" style="margin-bottom:.5rem"><b class="small" style="color:${w}">${l}</b><span class="badge">${isi.length}</span></div><div class="col" style="gap:.6rem;min-height:120px">${isi.map(kartu).join('')}</div></section>`; }).join('')}</div>`
      : `<div class="card">${emptyState({ icon: 'pen', title: 'Belum ada tugas', text: 'Catat tugas yang diberikan agar tumpukan koreksi terpantau dan tidak ada yang terlewat.', action: `<button class="btn btn-primary" data-act="baru">${ic('plus', 'ic-s')}Catat tugas</button>` })}</div>`}`;

    // Seret-lepas (desktop)
    el.querySelectorAll('[data-tugas]').forEach((c) => { c.draggable = true; c.ondragstart = (e) => { e.dataTransfer.setData('text/plain', c.dataset.tugas); c.style.opacity = '.5'; }; c.ondragend = () => { c.style.opacity = ''; }; });
    el.querySelectorAll('[data-kol]').forEach((k) => {
      k.ondragover = (e) => { e.preventDefault(); k.style.boxShadow = 'inset 0 0 0 2px var(--navy)'; };
      k.ondragleave = () => { k.style.boxShadow = ''; };
      k.ondrop = (e) => { e.preventDefault(); k.style.boxShadow = ''; pindah(e.dataTransfer.getData('text/plain'), k.dataset.kol); };
    });
    delegasi(el, {
      'f-kelas': (b) => { st.kelas = b.dataset.id; ctx.rerender(); },
      baru: () => dialogTugas(),
      ubah: (b) => dialogTugas(db.get('Tugas', b.dataset.id)),
      maju: (b) => { const t = db.get('Tugas', b.dataset.id); const i = KOLOM.findIndex(([k]) => k === (t.status || 'diberikan')); if (i < KOLOM.length - 1) pindah(t.id, KOLOM[i + 1][0]); },
      'koreksi-plus': (b) => { const t = db.get('Tugas', b.dataset.id); const n = Math.min(Number(t.terkumpul) || 0, (Number(t.dikoreksi) || 0) + Number(b.dataset.n)); db.put('Tugas', t.id, { dikoreksi: Math.max(0, n), status: n >= (Number(t.terkumpul) || 0) && n > 0 ? 'dikoreksi' : t.status === 'diberikan' ? 'diterima' : t.status }); },
      nilai: (b) => keNilai(db.get('Tugas', b.dataset.id))
    });
    if (ctx.query.baru && !ctx.baru) { ctx.baru = 1; setTimeout(() => dialogTugas(), 50); }
  }
};

function kartu(t) {
  const total = Number(t.total) || 0, kumpul = Number(t.terkumpul) || 0, kor = Number(t.dikoreksi) || 0;
  const l = labelTenggat(t.tenggat);
  const pk = kumpul ? Math.round((kor / kumpul) * 100) : 0;
  return `<article class="card card-s" data-tugas="${t.id}" style="cursor:grab"><div class="row between"><span class="badge b-qs">${esc(namaMapel(t.mapel_id))}</span><span class="badge ${t.status === 'dikembalikan' ? 'b-gr' : l.c}">${t.status === 'dikembalikan' ? 'Selesai' : l.l}</span></div>
    <b style="display:block;margin:.4rem 0 .1rem">${esc(t.judul)}</b><span class="tiny muted">Kelas ${esc(namaKelas(t.kelas_id))} · terkumpul ${kumpul}/${total || '?'}</span>
    <div class="bar" style="margin:.5rem 0 .25rem"><i style="width:${pk}%;background:var(--at)"></i></div><span class="tiny muted">${kor}/${kumpul} dikoreksi</span>
    <div class="row" style="margin-top:.5rem;gap:.3rem">${t.status !== 'dikembalikan' ? `<button class="btn btn-white btn-xs" data-act="koreksi-plus" data-id="${t.id}" data-n="1" aria-label="Tambah 1 dikoreksi">+1</button><button class="btn btn-white btn-xs" data-act="koreksi-plus" data-id="${t.id}" data-n="5">+5</button>` : ''}<span class="grow"></span>
      <button class="btn btn-ghost btn-icon btn-xs" data-act="nilai" data-id="${t.id}" title="Catat nilai tugas" aria-label="Catat nilai">${ic('chart', 'ic-s')}</button><button class="btn btn-ghost btn-icon btn-xs" data-act="ubah" data-id="${t.id}" aria-label="Ubah">${ic('edit', 'ic-s')}</button>${t.status !== 'dikembalikan' ? `<button class="btn btn-ghost btn-icon btn-xs" data-act="maju" data-id="${t.id}" aria-label="Pindah ke status berikutnya">${ic('arrowr', 'ic-s')}</button>` : ''}</div></article>`;
}
function pindah(id, status) {
  const t = db.get('Tugas', id); if (!t || t.status === status) return;
  const f = { status };
  if (status === 'dikembalikan') f.dikoreksi = Number(t.terkumpul) || Number(t.total) || 0;
  if (status === 'diterima' && !Number(t.terkumpul)) f.terkumpul = Number(t.total) || 0;
  db.put('Tugas', id, f);
  if (status === 'dikembalikan') toast(`"${t.judul}" selesai dikoreksi & dikembalikan. 🎉`);
}
async function dialogTugas(t = null) {
  const kelas = kelasList();
  const kid = t ? t.kelas_id : kelas[0].id;
  const r = await modal({ title: t ? 'Ubah tugas' : 'Tugas baru', body: `<div class="col gap-l">
    <label class="field"><span>Judul tugas</span><input class="input" name="judul" required value="${esc(t ? t.judul : '')}" placeholder="mis. Portofolio Ekosistem"></label>
    <div class="grid g2"><label class="field"><span>Kelas</span><select class="input" name="kelas_id" data-ganti>${kelas.map((k) => `<option value="${k.id}" ${k.id === kid ? 'selected' : ''}>Kelas ${esc(k.nama)}</option>`).join('')}</select></label>
    <label class="field"><span>Mata pelajaran</span><select class="input" name="mapel_id">${mapelKelas(kid).map((m) => `<option value="${m.id}" ${t && t.mapel_id === m.id ? 'selected' : ''}>${esc(m.nama)}</option>`).join('')}</select></label></div>
    <div class="grid g3"><label class="field"><span>Tenggat</span><input class="input" type="date" name="tenggat" value="${t ? t.tenggat : addDays(today(), 3)}"></label>
    <label class="field"><span>Jumlah siswa</span><input class="input" type="number" name="total" min="0" value="${t ? t.total : db.count('Siswa', (s) => s.kelas_id === kid && String(s.aktif) !== '0')}"></label>
    <label class="field"><span>Terkumpul</span><input class="input" type="number" name="terkumpul" min="0" value="${t ? t.terkumpul : 0}"></label></div>
    <label class="field"><span>Catatan</span><textarea class="input" name="catatan" rows="2">${esc(t ? t.catatan : '')}</textarea></label></div>`,
  actions: [...(t ? [{ label: 'Hapus', value: 'hapus', cls: 'btn-ghost' }] : []), { label: 'Batal', value: null, cls: 'btn-ghost' }, { label: 'Simpan', value: 'ok', cls: 'btn-dark' }],
  onOpen: (d) => { d.querySelector('[data-ganti]').onchange = (e) => { d.querySelector('[name=mapel_id]').innerHTML = mapelKelas(e.target.value).map((m) => `<option value="${m.id}">${esc(m.nama)}</option>`).join(''); d.querySelector('[name=total]').value = db.count('Siswa', (s) => s.kelas_id === e.target.value && String(s.aktif) !== '0'); }; } });
  if (r.value === 'hapus') { if (await konfirmasi('Hapus tugas ini?', { bahaya: true, ya: 'Hapus' })) db.del('Tugas', t.id); return; }
  if (r.value !== 'ok') return;
  const f = r.form;
  db.put('Tugas', t ? t.id : uid('T'), { judul: f.judul.trim(), kelas_id: f.kelas_id, mapel_id: f.mapel_id, tenggat: f.tenggat, total: Number(f.total) || 0, terkumpul: Number(f.terkumpul) || 0, catatan: f.catatan, ...(t ? {} : { status: Number(f.terkumpul) ? 'diterima' : 'diberikan', dikoreksi: 0 }) });
  toast('Tugas disimpan.');
}
function keNilai(t) {
  let id = t.asesmen_id;
  if (!id || !db.get('Asesmen', id)) {
    id = uid('AS');
    db.put('Asesmen', id, { kelas_id: t.kelas_id, mapel_id: t.mapel_id, nama: 'Tugas: ' + t.judul, jenis: 'formatif', tanggal: t.tenggat || today(), tp_ids: [], soal_ids: [], bobot: 1, nilai: {}, catatan: {}, butir: {} });
    db.put('Tugas', t.id, { asesmen_id: id });
  }
  pergi(`/nilai?k=${t.kelas_id}&m=${t.mapel_id}&tab=cepat`);
}

// Nilai & Rapor: buku nilai per asesmen/TP, input cepat (ponsel), deskripsi rapor, remedial-pengayaan, leger.
import { ic } from '../core/icons.js';
import { esc, today, fmtTgl, toast, modal, uid, avg, round1, konfirmasi } from '../core/util.js';
import { S, simpanPrefs } from '../core/state.js';
import { db } from '../core/store.js';
import { delegasi, kelasList, siswaKelas, pilihKelasChips, emptyState, segmen, perluKelas, mapelKelas, avatarWarna } from '../core/ui.js';
import { dialogKelas, dialogMapel } from '../core/form.js';
import { nilaiAkhir, nilaiPerTp, kktpMapel, namaKelas } from '../core/hitung.js';
import { JENIS_ASESMEN, kategoriNilai } from '../core/kurikulum.js';
import { kopHtml, ttdHtml, cetak, eksporXlsx, terbitkan, verifHtml } from '../core/dokumen.js';
import { jalankanAi } from '../core/ai.js';

export default {
  title: 'Nilai & Rapor',
  deps: ['Kelas', 'Siswa', 'Mapel', 'Asesmen', 'TP', 'Catatan'],
  render(el, ctx) {
    const q = ctx.query;
    if (q.k && db.get('Kelas', q.k) && !ctx.qk) { ctx.qk = 1; simpanPrefs({ kelas: q.k }); }
    if (q.m && !ctx.qm) { ctx.qm = 1; simpanPrefs({ mapel: q.m }); }
    if (!kelasList().length) { perluKelas(el); return; }
    const k = db.get('Kelas', S.prefs.kelas) || kelasList()[0];
    const mapel = mapelKelas(k.id);
    // Mapel aktif: pilihan terakhir, atau mapel dengan asesmen terbaru agar langsung siap diisi
    const terbaru = mapel.map((x) => [x, db.all('Asesmen', (a) => a.mapel_id === x.id).reduce((t, a) => (String(a.tanggal) > t ? String(a.tanggal) : t), '')]).sort((a, b) => b[1].localeCompare(a[1]))[0];
    const m = mapel.find((x) => x.id === S.prefs.mapel) || (terbaru && terbaru[1] ? terbaru[0] : mapel[0]) || null;
    ctx.st = ctx.st || { tab: q.tab || (matchMedia('(max-width: 640px)').matches ? 'cepat' : 'buku'), ases: '' };
    const st = ctx.st;
    const siswa = siswaKelas(k.id);
    const ases = m ? db.all('Asesmen', (a) => a.kelas_id === k.id && a.mapel_id === m.id).sort((a, b) => String(a.tanggal).localeCompare(String(b.tanggal))) : [];

    el.innerHTML = `
      <div class="page-h"><div><div class="crumbs"><a href="#/hari-ini">Beranda</a>${ic('chevr', 'ic-s')}<b>Nilai & Rapor</b></div><h1>Buku Nilai</h1>
        <p class="sub">Kelas ${esc(k.nama)} · ${m ? esc(m.nama) + ' · KKTP ' + esc(m.kktp || 75) : 'Belum ada mapel'} · ${siswa.length} siswa</p></div>
        <div class="row row-wrap">${m ? `<button class="btn btn-white btn-sm" data-act="xlsx">${ic('download', 'ic-s')}Excel</button><button class="btn btn-white btn-sm" data-act="bobot">${ic('gear', 'ic-s')}Bobot & KKTP</button><button class="btn btn-primary btn-sm" data-act="ases-baru">${ic('plus', 'ic-s')}Asesmen baru</button>` : ''}</div></div>
      ${pilihKelasChips(k.id)}
      <div class="row row-wrap" style="margin:1rem 0;gap:.75rem">
        <div class="chips">${mapel.map((x) => `<button class="chip ${m && x.id === m.id ? 'on' : ''}" data-act="pilih-mapel" data-id="${x.id}">${esc(x.nama)}</button>`).join('')}<button class="chip" data-act="mapel-baru" aria-label="Tambah mapel">${ic('plus', 'ic-s')}</button></div>
        <span class="grow"></span>${segmen([['buku', 'Buku Nilai'], ['cepat', 'Input Cepat'], ['rapor', 'Deskripsi Rapor'], ['remedial', 'Remedial & Pengayaan'], ['leger', 'Leger']], st.tab)}
      </div>
      <div id="isi"></div>`;
    const isi = el.querySelector('#isi');
    if (!m) isi.innerHTML = `<div class="card">${emptyState({ icon: 'book', title: 'Belum ada mata pelajaran', text: 'Tambahkan mata pelajaran untuk kelas ini terlebih dahulu.', action: `<button class="btn btn-primary" data-act="mapel-baru">${ic('plus', 'ic-s')}Tambah mapel</button>` })}</div>`;
    else if (!siswa.length) isi.innerHTML = `<div class="card">${emptyState({ icon: 'users', title: 'Belum ada siswa', action: `<a class="btn btn-primary" href="#/kelas?tab=siswa&k=${k.id}">Tambah siswa</a>` })}</div>`;
    else if (st.tab === 'buku') tabBuku(isi, k, m, siswa, ases, ctx);
    else if (st.tab === 'cepat') tabCepat(isi, k, m, siswa, ases, st, ctx);
    else if (st.tab === 'rapor') tabRapor(isi, k, m, siswa, ctx);
    else if (st.tab === 'remedial') tabRemedial(isi, k, m, siswa, ases);
    else tabLeger(isi, k, siswa);

    delegasi(el, {
      'pilih-kelas': (b) => { simpanPrefs({ kelas: b.dataset.id, mapel: '' }); ctx.rerender(); },
      'kelas-baru': async () => { if (await dialogKelas()) ctx.rerender(); },
      'pilih-mapel': (b) => { simpanPrefs({ mapel: b.dataset.id }); ctx.rerender(); },
      'mapel-baru': async () => { const id = await dialogMapel(k.id); if (id) { simpanPrefs({ mapel: id }); ctx.rerender(); } },
      bobot: async () => { await dialogMapel(k.id, m); ctx.rerender(); },
      tab: (b) => { st.tab = b.dataset.tab; ctx.rerender(); },
      'ases-baru': async () => { const id = await dialogAsesmen(k, m); if (id) { st.ases = id; ctx.rerender(); } },
      'ubah-ases': async (b) => { await dialogAsesmen(k, m, db.get('Asesmen', b.dataset.id)); ctx.rerender(); },
      'pilih-ases': (b) => { st.ases = b.value; ctx.rerender(); },
      xlsx: () => eksporBuku(k, m, siswa, ases),
      'isi-semua': async () => {
        const a = db.get('Asesmen', st.ases);
        const r = await modal({ title: 'Isi nilai yang masih kosong', body: `<label class="field"><span>Nilai</span><input class="input" type="number" name="v" min="0" max="100" value="80" autofocus></label>`, actions: [{ label: 'Batal', value: null, cls: 'btn-ghost' }, { label: 'Isi', value: 'ok', cls: 'btn-dark' }] });
        if (r.value !== 'ok') return;
        const v = Number(r.form.v); const n = {};
        siswa.forEach((s) => { if ((a.nilai || {})[s.id] === undefined) n[s.id] = v; });
        db.put('Asesmen', a.id, { nilai: n }); toast(Object.keys(n).length + ' nilai diisi.');
      },
      'gen-deskripsi': (b) => genDeskripsi(b, k, m, siswa, ctx),
      'simpan-deskripsi': () => { el.querySelectorAll('[data-desk]').forEach((t) => simpanDeskripsi(m.id, k.id, t.dataset.desk, t.value)); toast('Deskripsi rapor disimpan.'); },
      'buat-remedial': (b) => buatRemedial(k, m, b.dataset.jenis, ctx),
      'leger-xlsx': () => eksporLeger(k, siswa),
      'leger-cetak': () => cetakLeger(k, siswa, null),
      'leger-terbit': async () => { const { judul, tabel } = isiLeger(k, siswa); try { const dok = await terbitkan({ jenis: 'LEGER', ref_id: 'LGR-' + k.id + '-' + k.tahun_ajaran + '-' + k.semester, judul, isiKanonik: judul + tabel, ringkasan: `${siswa.length} siswa` }); cetakLeger(k, siswa, dok); } catch (e) { toast(e.message, 'err'); } }
    });
  }
};

// ---------- Dialog asesmen ----------
export async function dialogAsesmen(k, m, a = null) {
  const tp = db.all('TP', (t) => t.mapel_id === m.id).sort((x, y) => (Number(x.urutan) || 0) - (Number(y.urutan) || 0));
  const pilihTp = new Set(a ? a.tp_ids || [] : []);
  const r = await modal({
    title: a ? 'Ubah asesmen' : 'Asesmen baru',
    body: `<div class="col gap-l">
      <label class="field"><span>Nama asesmen</span><input class="input" name="nama" required value="${esc(a ? a.nama : '')}" placeholder="mis. Formatif: Rantai Makanan"></label>
      <div class="grid g2"><label class="field"><span>Jenis</span><select class="input" name="jenis">${Object.entries(JENIS_ASESMEN).map(([k2, v]) => `<option value="${k2}" ${a && a.jenis === k2 ? 'selected' : !a && k2 === 'formatif' ? 'selected' : ''}>${v.label}</option>`).join('')}</select></label>
      <label class="field"><span>Tanggal</span><input class="input" type="date" name="tanggal" value="${a ? a.tanggal : today()}"></label></div>
      <div class="field"><span>Tujuan pembelajaran yang diukur</span>${tp.length ? `<div class="col" style="max-height:220px;overflow:auto">${tp.map((t) => `<label class="check row" style="align-items:flex-start;gap:.5rem"><input type="checkbox" name="tp_ids" data-multi value="${t.id}" ${pilihTp.has(t.id) ? 'checked' : ''}><span class="small"><b>${esc(t.kode)}</b> ${esc(t.rumusan)}</span></label>`).join('')}</div>` : `<p class="hint">Belum ada TP untuk mapel ini. Tambahkan di <a href="#/rencana?tab=tp">Rencana Ajar → TP & ATP</a> agar deskripsi rapor otomatis lebih tepat.</p>`}</div>
    </div>`,
    actions: [...(a ? [{ label: 'Hapus', value: 'hapus', cls: 'btn-ghost' }] : []), { label: 'Batal', value: null, cls: 'btn-ghost' }, { label: 'Simpan', value: 'ok', cls: 'btn-dark' }]
  });
  if (r.value === 'hapus') { if (await konfirmasi(`Hapus asesmen <b>${esc(a.nama)}</b> beserta nilainya?`, { bahaya: true, ya: 'Hapus' })) { db.del('Asesmen', a.id); toast('Asesmen dihapus.'); } return null; }
  if (r.value !== 'ok') return null;
  const id = a ? a.id : uid('AS');
  db.put('Asesmen', id, { kelas_id: k.id, mapel_id: m.id, nama: r.form.nama.trim(), jenis: r.form.jenis, tanggal: r.form.tanggal, tp_ids: r.form.tp_ids || [], ...(a ? {} : { soal_ids: [], bobot: 1, nilai: {}, catatan: {}, butir: {} }) });
  toast('Asesmen disimpan.');
  return id;
}

// ---------- Buku nilai (desktop) ----------
function sel(v, kktp, sid, aid) {
  const kosong = v === undefined || v === null || v === '';
  return `<input class="cell ${!kosong && Number(v) < kktp ? 'low' : ''}" inputmode="numeric" data-sid="${sid}" data-aid="${aid}" value="${kosong ? '' : esc(v)}" aria-label="Nilai">`;
}
function tabBuku(el, k, m, siswa, ases, ctx) {
  const kktp = Number(m.kktp) || 75;
  const na = siswa.map((s) => nilaiAkhir(s.id, m.id, ases));
  const ada = na.filter((x) => x !== null);
  const tuntas = ada.filter((x) => x >= kktp).length;
  el.innerHTML = `
    <div class="grid g4" style="margin-bottom:1rem">
      <div class="card card-s"><span class="small bold muted">Rata-rata kelas</span><div class="kpi-v" data-kpi="rata">${ada.length ? round1(avg(ada)) : '—'}</div></div>
      <div class="card card-s"><span class="small bold muted">Ketuntasan</span><div class="kpi-v" data-kpi="tuntas">${ada.length ? Math.round((tuntas / ada.length) * 100) + '%' : '—'}</div><div class="bar"><i style="width:${ada.length ? (tuntas / ada.length) * 100 : 0}%"></i></div></div>
      <div class="card card-s"><span class="small bold muted">Di bawah KKTP</span><div class="kpi-v" style="color:var(--red)" data-kpi="bawah">${ada.length - tuntas}</div><span class="tiny muted">siswa perlu remedial</span></div>
      <div class="card card-s"><span class="small bold muted">Asesmen tercatat</span><div class="kpi-v">${ases.length}</div><span class="tiny muted">${ases.filter((a) => a.jenis === 'formatif').length} formatif · ${ases.filter((a) => a.jenis.startsWith('sumatif')).length} sumatif</span></div>
    </div>
    ${ases.length ? `<div class="card" style="padding:.75rem"><div class="tbl-wrap"><table class="tbl" id="buku"><thead><tr><th class="sticky-col">No · Nama</th>
      ${ases.map((a) => `<th class="num"><button class="btn btn-ghost btn-xs" data-act="ubah-ases" data-id="${a.id}" title="${esc(a.nama)} — ${fmtTgl(a.tanggal, 'pendek')}" style="flex-direction:column;height:auto;padding:.2rem .4rem;gap:2px"><span class="badge ${JENIS_ASESMEN[a.jenis].cls}">${esc(JENIS_ASESMEN[a.jenis].label.replace('Sumatif ', 'S. ').replace('Lingkup Materi', 'LM').replace('Akhir Semester', 'AS'))}</span><span class="tiny truncate" style="max-width:110px">${esc(a.nama.replace(/^(Formatif|Sumatif)[^:]*:\s*/, ''))}</span></button></th>`).join('')}
      <th class="num">Nilai Akhir</th><th>Kategori</th></tr></thead><tbody>
      ${siswa.map((s, i) => { const n = na[i]; const kat = kategoriNilai(n, kktp); return `<tr data-row="${s.id}" class="${n !== null && n < kktp ? 'warn' : ''}"><td class="sticky-col" style="white-space:nowrap"><span class="tiny muted">${esc(s.no || i + 1)}</span> <b>${esc(s.nama)}</b></td>
        ${ases.map((a) => `<td class="num">${sel((a.nilai || {})[s.id], kktp, s.id, a.id)}</td>`).join('')}
        <td class="num"><b data-na>${n ?? '—'}</b></td><td><span class="badge ${kat.cls}" data-kat>${kat.label}</span></td></tr>`; }).join('')}
      </tbody><tfoot><tr><td class="sticky-col tiny bold muted">RATA-RATA</td>${ases.map((a) => { const v = siswa.map((s) => (a.nilai || {})[s.id]).filter((x) => x !== undefined && x !== ''); return `<td class="num tiny bold">${v.length ? round1(avg(v)) : '-'}</td>`; }).join('')}<td></td><td></td></tr></tfoot></table></div>
      <p class="tiny muted" style="margin-top:.6rem">${ic('info', 'ic-s')} Ketik angka 0–100, Enter untuk turun ke siswa berikutnya. Tersimpan otomatis. Merah = di bawah KKTP. Nilai akhir = rata-rata tertimbang (formatif ${m.bobot ? m.bobot.formatif : 40}% · sumatif LM ${m.bobot ? m.bobot.sumatif_lm : 40}% · sumatif AS ${m.bobot ? m.bobot.sumatif_as : 20}%).</p></div>`
    : `<div class="card">${emptyState({ icon: 'chart', title: 'Belum ada asesmen', text: 'Buat asesmen formatif atau sumatif, lalu isi nilai langsung di tabel.', action: `<button class="btn btn-primary" data-act="ases-baru">${ic('plus', 'ic-s')}Asesmen baru</button>` })}</div>`}`;
  pasangSel(el, k, m, siswa, ctx);
}
function pasangSel(el, k, m, siswa, ctx) {
  const kktp = Number(m.kktp) || 75;
  const simpan = (inp) => {
    const raw = inp.value.trim().replace(',', '.');
    if (raw !== '' && (isNaN(raw) || Number(raw) < 0 || Number(raw) > 100)) { inp.value = ''; toast('Nilai harus 0–100.', 'err'); return; }
    const v = raw === '' ? null : round1(Number(raw));
    const a = db.get('Asesmen', inp.dataset.aid);
    const lama = (a.nilai || {})[inp.dataset.sid];
    if ((lama ?? null) === v || String(lama) === String(v)) return;
    db.put('Asesmen', inp.dataset.aid, { nilai: { [inp.dataset.sid]: v } }, { senyap: true });
    inp.classList.toggle('low', v !== null && v < kktp);
    const tr = inp.closest('tr[data-row]');
    if (tr) {
      const n = nilaiAkhir(inp.dataset.sid, m.id);
      const kat = kategoriNilai(n, kktp);
      tr.querySelector('[data-na]').textContent = n ?? '—';
      const kb = tr.querySelector('[data-kat]'); kb.className = 'badge ' + kat.cls; kb.textContent = kat.label;
      tr.classList.toggle('warn', n !== null && n < kktp);
    }
    const card = inp.closest('[data-card]');
    if (card) card.querySelector('[data-kat]').innerHTML = v === null ? '' : `<span class="badge ${kategoriNilai(v, kktp).cls}">${kategoriNilai(v, kktp).label}</span>`;
  };
  el.addEventListener('change', (e) => { if (e.target.matches('input.cell, input[data-cepat]')) simpan(e.target); });
  el.addEventListener('keydown', (e) => {
    if (!e.target.matches('input.cell, input[data-cepat]')) return;
    if (e.key === 'Enter' || (e.key === 'ArrowDown' && e.target.matches('input.cell'))) {
      e.preventDefault();
      const semua = Array.from(el.querySelectorAll(`input[data-aid="${e.target.dataset.aid}"]`));
      const nx = semua[semua.indexOf(e.target) + 1];
      simpan(e.target);
      if (nx) { nx.focus(); nx.select(); } else e.target.blur();
    } else if (e.key === 'ArrowUp' && e.target.matches('input.cell')) {
      const semua = Array.from(el.querySelectorAll(`input[data-aid="${e.target.dataset.aid}"]`));
      const pv = semua[semua.indexOf(e.target) - 1]; if (pv) { e.preventDefault(); pv.focus(); pv.select(); }
    }
  });
  el.addEventListener('focusin', (e) => { if (e.target.matches('input.cell, input[data-cepat]')) e.target.select(); });
}

// ---------- Input cepat (ponsel) ----------
function tabCepat(el, k, m, siswa, ases, st, ctx) {
  if (!ases.length) { el.innerHTML = `<div class="card">${emptyState({ icon: 'chart', title: 'Belum ada asesmen', action: `<button class="btn btn-primary" data-act="ases-baru">${ic('plus', 'ic-s')}Asesmen baru</button>` })}</div>`; return; }
  const a = ases.find((x) => x.id === st.ases) || ases[ases.length - 1];
  st.ases = a.id;
  const kktp = Number(m.kktp) || 75;
  const terisi = siswa.filter((s) => (a.nilai || {})[s.id] !== undefined).length;
  el.innerHTML = `<div class="card card-s" style="margin-bottom:.75rem"><div class="row row-wrap">
      <label class="field grow" style="min-width:220px"><span>Asesmen</span><select class="input" data-act-change="pilih-ases">${ases.slice().reverse().map((x) => `<option value="${x.id}" ${x.id === a.id ? 'selected' : ''}>${esc(x.nama)} · ${fmtTgl(x.tanggal, 'pendek')}</option>`).join('')}</select></label>
      <div class="col" style="gap:.2rem"><span class="tiny muted bold">Terisi</span><b>${terisi}/${siswa.length}</b></div>
      <button class="btn btn-white btn-sm" data-act="isi-semua">Isi yang kosong</button></div>
      <div class="bar" style="margin-top:.6rem"><i style="width:${(terisi / siswa.length) * 100}%"></i></div></div>
    <div class="grid g2" style="gap:.6rem">${siswa.map((s, i) => { const v = (a.nilai || {})[s.id]; return `<div class="att-row" data-card style="flex-direction:row;align-items:center">${avatarWarna(s.nama, i)}<span class="grow"><b class="truncate" style="display:block">${esc(s.nama)}</b><span data-kat>${v !== undefined && v !== null ? `<span class="badge ${kategoriNilai(v, kktp).cls}">${kategoriNilai(v, kktp).label}</span>` : ''}</span></span>
      <input class="input" data-cepat data-sid="${s.id}" data-aid="${a.id}" inputmode="decimal" enterkeyhint="next" value="${v ?? ''}" aria-label="Nilai ${esc(s.nama)}" style="width:84px;text-align:center;font-size:1.25rem;font-weight:800"></div>`; }).join('')}</div>`;
  pasangSel(el, k, m, siswa, ctx);
}

// ---------- Deskripsi rapor ----------
const idDesk = (mid, sid) => `RAP-${mid}-${sid}`;
function simpanDeskripsi(mid, kid, sid, isi) {
  const id = idDesk(mid, sid);
  const lama = db.get('Catatan', id);
  if (lama && lama.isi === isi) return;
  db.put('Catatan', id, { siswa_id: sid, kelas_id: kid, tanggal: today(), jenis: 'rapor:' + mid, isi });
}
function tabRapor(el, k, m, siswa) {
  const tp = {}; db.all('TP', (t) => t.mapel_id === m.id).forEach((t) => { tp[t.id] = t; });
  el.innerHTML = `<div class="ai-bar" style="margin-bottom:1rem"><span class="icon-box" style="background:var(--surface);color:var(--at)">${ic('sparkles')}</span><span class="grow"><b>Deskripsi capaian otomatis</b><br><span class="small muted">Disusun dari nilai per tujuan pembelajaran: TP tertinggi → "Menunjukkan penguasaan yang baik dalam…", TP di bawah KKTP → "Perlu bantuan dalam…". Nama siswa tidak dikirim ke AI.</span></span>
      <button class="btn btn-dark btn-sm" data-act="gen-deskripsi">${ic('wand', 'ic-s')}Susun semua deskripsi</button><button class="btn btn-primary btn-sm" data-act="simpan-deskripsi">${ic('check', 'ic-s')}Simpan</button></div>
    <div class="card" style="padding:.75rem"><div class="tbl-wrap"><table class="tbl stack"><thead><tr><th>Nama</th><th class="num">NA</th><th>TP tertinggi / terendah</th><th style="min-width:340px">Deskripsi capaian</th></tr></thead><tbody>
    ${siswa.map((s) => { const n = nilaiAkhir(s.id, m.id); const p = nilaiPerTp(s.id, m.id); const ur = Object.entries(p).sort((a, b) => b[1] - a[1]); const tinggi = ur[0]; const rendah = ur.length > 1 ? ur[ur.length - 1] : null; const d = db.get('Catatan', idDesk(m.id, s.id));
      return `<tr><td><b>${esc(s.nama)}</b></td><td class="num"><b>${n ?? '—'}</b></td><td class="small">${tinggi ? `<span class="badge b-gr">${esc((tp[tinggi[0]] || {}).kode || tinggi[0])} · ${tinggi[1]}</span>` : '-'} ${rendah && rendah[1] < (Number(m.kktp) || 75) ? `<span class="badge b-red">${esc((tp[rendah[0]] || {}).kode || rendah[0])} · ${rendah[1]}</span>` : ''}</td>
        <td><textarea class="input" rows="2" data-desk="${s.id}" style="min-height:64px;font-size:.8125rem">${esc(d ? d.isi : '')}</textarea></td></tr>`; }).join('')}
    </tbody></table></div></div>`;
}
async function genDeskripsi(b, k, m, siswa, ctx) {
  const tp = {}; db.all('TP', (t) => t.mapel_id === m.id).forEach((t) => { tp[t.id] = t; });
  const kktp = Number(m.kktp) || 75;
  const data = siswa.map((s, i) => {
    const p = Object.entries(nilaiPerTp(s.id, m.id)).sort((a, b2) => b2[1] - a[1]);
    const rum = (id) => { const t = tp[id]; return t ? t.rumusan.replace(/^Peserta didik (mampu|dapat)\s*/i, '').replace(/\.$/, '') : id; };
    return { kode: 'S' + (i + 1), tp_tinggi: p.filter((x) => x[1] >= kktp).slice(0, 2).map((x) => rum(x[0])), tp_rendah: p.filter((x) => x[1] < kktp).slice(-2).map((x) => rum(x[0])) };
  });
  b.disabled = true; b.innerHTML = `${ic('refresh', 'ic-s spin')}Menyusun…`;
  const r = await jalankanAi('deskripsi_rapor', { mapel: m.nama, siswa: data });
  b.disabled = false; b.innerHTML = `${ic('wand', 'ic-s')}Susun semua deskripsi`;
  const peta = {}; ((r.hasil && r.hasil.deskripsi) || []).forEach((d) => { peta[d.kode] = [d.tinggi, d.rendah].filter(Boolean).join(' '); });
  const el = b.closest('.view');
  siswa.forEach((s, i) => { const t = el.querySelector(`[data-desk="${s.id}"]`); if (t && peta['S' + (i + 1)]) t.value = peta['S' + (i + 1)]; });
  toast(r.sumber === 'ai' ? 'Draf deskripsi AI siap. Periksa lalu tekan Simpan.' : (r.alasan || 'Draf dari templat bawaan siap.'), r.sumber === 'ai' ? 'ok' : 'info', 4500);
}

// ---------- Remedial & pengayaan ----------
function tabRemedial(el, k, m, siswa, ases) {
  const kktp = Number(m.kktp) || 75;
  const rem = [], kaya = [];
  siswa.forEach((s) => { const n = nilaiAkhir(s.id, m.id, ases); if (n === null) return; if (n < kktp) rem.push([s, n]); else if (n >= 90) kaya.push([s, n]); });
  const kartu = (judul, list, cls, jenis, ket) => `<div class="card"><div class="section-h"><h3>${judul} <span class="badge ${cls}">${list.length}</span></h3>${list.length ? `<button class="btn btn-white btn-sm" data-act="buat-remedial" data-jenis="${jenis}">${ic('plus', 'ic-s')}Buat asesmen ${jenis}</button>` : ''}</div><p class="small muted" style="margin-bottom:.75rem">${ket}</p>
    <div class="list">${list.sort((a, b) => a[1] - b[1]).map(([s, n], i) => `<div class="li flat">${avatarWarna(s.nama, i)}<b class="grow">${esc(s.nama)}</b><span class="badge ${cls}">${n}</span></div>`).join('') || '<p class="small muted">Tidak ada.</p>'}</div></div>`;
  el.innerHTML = `<div class="grid g2">${kartu('Perlu remedial', rem, 'b-red', 'remedial', `Nilai akhir di bawah KKTP ${kktp}. Berikan pembelajaran ulang dengan pendekatan berbeda, lalu asesmen ulang.`)}${kartu('Pengayaan', kaya, 'b-gr', 'pengayaan', 'Nilai akhir ≥ 90. Berikan tantangan pendalaman, proyek, atau peran tutor sebaya.')}</div>`;
}
function buatRemedial(k, m, jenis, ctx) {
  const id = uid('AS');
  db.put('Asesmen', id, { kelas_id: k.id, mapel_id: m.id, nama: `${jenis === 'remedial' ? 'Remedial' : 'Pengayaan'}: ${m.nama}`, jenis: 'formatif', tanggal: today(), tp_ids: [], soal_ids: [], bobot: 1, nilai: {}, catatan: {}, butir: {} });
  ctx.st.tab = 'cepat'; ctx.st.ases = id;
  toast('Asesmen dibuat. Isi nilai siswa yang mengikuti.');
  ctx.rerender();
}

// ---------- Leger ----------
function dataLeger(k, siswa) {
  const mapel = mapelKelas(k.id);
  const baris = siswa.map((s) => ({ s, n: mapel.map((m) => nilaiAkhir(s.id, m.id)) }));
  baris.forEach((b) => { const v = b.n.filter((x) => x !== null); b.jml = v.length ? round1(v.reduce((a, x) => a + x, 0)) : null; b.rata = v.length ? round1(avg(v)) : null; });
  const urut = baris.filter((b) => b.rata !== null).sort((a, b) => b.rata - a.rata);
  urut.forEach((b, i) => { b.rank = i + 1; });
  return { mapel, baris };
}
function tabLeger(el, k, siswa) {
  const { mapel, baris } = dataLeger(k, siswa);
  el.innerHTML = `<div class="card" style="padding:.75rem"><div class="section-h" style="padding:.25rem .5rem"><h3>Leger Nilai Kelas ${esc(k.nama)}</h3><div class="row"><button class="btn btn-white btn-sm" data-act="leger-xlsx">${ic('download', 'ic-s')}Excel</button><button class="btn btn-white btn-sm" data-act="leger-cetak">${ic('print', 'ic-s')}Cetak</button><button class="btn btn-dark btn-sm" data-act="leger-terbit">${ic('qr', 'ic-s')}Terbitkan ber-QR</button></div></div>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th class="sticky-col">Nama</th>${mapel.map((m) => `<th class="num">${esc(m.nama)}</th>`).join('')}<th class="num">Jumlah</th><th class="num">Rata-rata</th><th class="num">Peringkat</th></tr></thead><tbody>
    ${baris.map((b) => `<tr><td class="sticky-col"><b>${esc(b.s.nama)}</b></td>${b.n.map((v, i) => `<td class="num ${v !== null && v < (Number(mapel[i].kktp) || 75) ? 'low' : ''}" style="${v !== null && v < (Number(mapel[i].kktp) || 75) ? 'color:var(--red);font-weight:700' : ''}">${v ?? '-'}</td>`).join('')}<td class="num">${b.jml ?? '-'}</td><td class="num"><b>${b.rata ?? '-'}</b></td><td class="num">${b.rank || '-'}</td></tr>`).join('')}
    </tbody></table></div><p class="tiny muted" style="margin-top:.5rem">Peringkat hanya untuk keperluan internal guru; Kurikulum Merdeka tidak mewajibkan peringkat di rapor.</p></div>`;
}
function isiLeger(k, siswa) {
  const { mapel, baris } = dataLeger(k, siswa);
  const judul = `Leger Nilai Kelas ${k.nama} — Semester ${Number(k.semester) === 2 ? 'Genap' : 'Ganjil'} ${k.tahun_ajaran || ''}`;
  const tabel = `<table><thead><tr><th>No</th><th>Nama</th>${mapel.map((m) => `<th>${esc(m.nama)}</th>`).join('')}<th>Jumlah</th><th>Rata-rata</th></tr></thead><tbody>${baris.map((b, i) => `<tr><td class="num">${i + 1}</td><td>${esc(b.s.nama)}</td>${b.n.map((v) => `<td class="num">${v ?? '-'}</td>`).join('')}<td class="num">${b.jml ?? '-'}</td><td class="num">${b.rata ?? '-'}</td></tr>`).join('')}</tbody></table>`;
  return { judul, tabel };
}
function cetakLeger(k, siswa, dok) { const { judul, tabel } = isiLeger(k, siswa); cetak(judul, `${kopHtml()}<h1>${esc(judul)}</h1>${dok ? `<p class="c">Nomor: ${esc(dok.nomor)}</p>` : ''}${tabel}${ttdHtml()}${verifHtml(dok)}`, { landscape: true }); }
function eksporLeger(k, siswa) {
  const { mapel, baris } = dataLeger(k, siswa);
  eksporXlsx(`Leger ${k.nama} ${k.tahun_ajaran || ''}`, [{ nama: 'Leger', lebar: [5, 28, ...mapel.map(() => 12), 10, 10, 10], baris: [['No', 'Nama', ...mapel.map((m) => m.nama), 'Jumlah', 'Rata-rata', 'Peringkat'], ...baris.map((b, i) => [i + 1, b.s.nama, ...b.n.map((v) => v ?? ''), b.jml ?? '', b.rata ?? '', b.rank || ''])] }]);
}
function eksporBuku(k, m, siswa, ases) {
  eksporXlsx(`Buku Nilai ${k.nama} ${m.nama}`, [{ nama: m.nama, lebar: [5, 28, ...ases.map(() => 14), 12, 16], baris: [['No', 'Nama', ...ases.map((a) => `${a.nama} (${fmtTgl(a.tanggal, 'pendek')})`), 'Nilai Akhir', 'Kategori'], ...siswa.map((s, i) => { const n = nilaiAkhir(s.id, m.id, ases); return [i + 1, s.nama, ...ases.map((a) => { const v = (a.nilai || {})[s.id]; return v === undefined || v === null || v === '' ? '' : Number(v); }), n ?? '', kategoriNilai(n, m.kktp).label]; })] }]);
}

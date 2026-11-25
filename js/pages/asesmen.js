// Detail asesmen: kisi-kisi, naskah soal (cetak), skor per butir → nilai otomatis, analisis butir.
import { ic } from '../core/icons.js';
import { esc, fmtTgl, toast, round1, avg } from '../core/util.js';
import { db } from '../core/store.js';
import { delegasi, siswaKelas, emptyState, segmen } from '../core/ui.js';
import { TIPE_SOAL, JENIS_ASESMEN, levelDariBloom } from '../core/kurikulum.js';
import { namaKelas, namaMapel } from '../core/hitung.js';
import { kopHtml, cetak, eksporWord, terbitkan, verifHtml, ttdHtml } from '../core/dokumen.js';
import { dialogAsesmen } from './nilai.js';

export default {
  title: 'Asesmen',
  deps: ['Asesmen', 'Soal', 'Siswa', 'TP'],
  render(el, ctx) {
    const a = db.get('Asesmen', ctx.params.id);
    if (!a) { el.innerHTML = `<div class="card">${emptyState({ icon: 'clipboard', title: 'Asesmen tidak ditemukan', action: '<a class="btn btn-primary" href="#/soal">Kembali</a>' })}</div>`; return; }
    ctx.st = ctx.st || { tab: 'kisi' };
    const st = ctx.st;
    const soal = (a.soal_ids || []).map((id) => db.get('Soal', id)).filter(Boolean);
    const siswa = siswaKelas(a.kelas_id);
    const tp = {}; db.all('TP', (t) => t.mapel_id === a.mapel_id).forEach((t) => { tp[t.id] = t; });
    el.innerHTML = `<div class="page-h"><div><div class="crumbs"><a href="#/soal">Bank Soal & Asesmen</a>${ic('chevr', 'ic-s')}<b>${esc(a.nama)}</b></div><h1>${esc(a.nama)}</h1>
      <p class="sub"><span class="badge ${(JENIS_ASESMEN[a.jenis] || {}).cls || ''}">${esc((JENIS_ASESMEN[a.jenis] || {}).label || a.jenis)}</span> ${esc(namaMapel(a.mapel_id))} · Kelas ${esc(namaKelas(a.kelas_id))} · ${fmtTgl(a.tanggal, 'pendek')} · ${soal.length} butir</p></div>
      <div class="row row-wrap"><button class="btn btn-white btn-sm" data-act="ubah">${ic('edit', 'ic-s')}Ubah</button><button class="btn btn-white btn-sm" data-act="naskah">${ic('print', 'ic-s')}Naskah soal</button><button class="btn btn-white btn-sm" data-act="kunci">${ic('key', 'ic-s')}Kunci</button><button class="btn btn-dark btn-sm" data-act="terbit">${ic('qr', 'ic-s')}Terbitkan kisi-kisi</button></div></div>
      <div style="margin-bottom:1rem">${segmen([['kisi', 'Kisi-kisi'], ['skor', 'Skor per butir'], ['analisis', 'Analisis butir']], st.tab)}</div><div id="isi"></div>`;
    const isi = el.querySelector('#isi');
    if (!soal.length && st.tab !== 'skor') isi.innerHTML = `<div class="card">${emptyState({ icon: 'clipboard', title: 'Asesmen tanpa butir soal', text: 'Asesmen ini dibuat langsung di buku nilai. Nilai tetap dapat diisi di menu Nilai.', action: '<a class="btn btn-primary" href="#/nilai">Buka buku nilai</a>' })}</div>`;
    else if (st.tab === 'kisi') isi.innerHTML = `<div class="card" style="padding:.75rem"><div class="tbl-wrap">${tabelKisi(soal, tp)}</div></div>`;
    else if (st.tab === 'skor') tabSkor(isi, a, soal, siswa, ctx);
    else tabAnalisis(isi, a, soal, siswa);
    delegasi(el, {
      tab: (b) => { st.tab = b.dataset.tab; ctx.rerender(); },
      ubah: () => dialogAsesmen({ id: a.kelas_id }, db.get('Mapel', a.mapel_id), a),
      naskah: () => cetak(a.nama, naskahHtml(a, soal, false)),
      kunci: () => cetak('Kunci ' + a.nama, naskahHtml(a, soal, true)),
      terbit: async () => { const judul = 'Kisi-kisi ' + a.nama; const t = tabelKisi(soal, tp, true); try { const dok = await terbitkan({ jenis: 'SOAL', ref_id: 'ASM-' + a.id, judul, isiKanonik: judul + t, ringkasan: `${soal.length} butir · ${namaMapel(a.mapel_id)}` }); cetak(judul, `${kopHtml()}<h1>${esc(judul)}</h1>${dok ? `<p class="c">Nomor: ${esc(dok.nomor)}</p>` : ''}<p class="c">${esc(namaMapel(a.mapel_id))} · Kelas ${esc(namaKelas(a.kelas_id))}</p>${t}${ttdHtml()}${verifHtml(dok)}`, { landscape: true }); } catch (e) { toast(e.message, 'err'); } }
    });
  }
};

function tabelKisi(soal, tp, cetakMode = false) {
  return `<table class="${cetakMode ? '' : 'tbl'}"><thead><tr><th>No</th><th>Tujuan pembelajaran</th><th>Indikator / ringkasan soal</th><th>Level</th><th>Bentuk</th><th>Kunci</th><th>Skor</th></tr></thead><tbody>${soal.map((s, i) => { const ind = String(s.pembahasan || '').match(/Indikator: ([^·]+)/); return `<tr><td class="num">${i + 1}</td><td class="small">${esc(tp[s.tp_id] ? tp[s.tp_id].kode + ' ' + tp[s.tp_id].rumusan : '-')}</td><td class="small">${esc(ind ? ind[1].trim() : String(s.teks).slice(0, 120))}</td><td class="num">${esc(s.bloom || '')}<br><span class="tiny">${esc(s.level || levelDariBloom(s.bloom))}</span></td><td class="small">${esc(TIPE_SOAL[s.tipe] || s.tipe)}</td><td class="small">${esc(String(s.kunci || '').slice(0, 40))}</td><td class="num">${esc(s.skor || 1)}</td></tr>`; }).join('')}</tbody></table>`;
}
function naskahHtml(a, soal, kunci) {
  const pg = soal.filter((s) => ['pg', 'pgk', 'bs'].includes(s.tipe)), lain = soal.filter((s) => !['pg', 'pgk', 'bs'].includes(s.tipe));
  const blok = (s, n) => `<div style="page-break-inside:avoid;margin-bottom:8pt"><p><b>${n}.</b> ${esc(s.teks).replace(/\n/g, '<br>')}${s.tipe === 'pgk' ? ' <i>(jawaban benar lebih dari satu)</i>' : ''}</p>${(s.opsi || []).length && s.tipe !== 'bs' ? `<ol type="A" style="margin-left:14pt">${s.opsi.map((o) => `<li>${esc(o)}</li>`).join('')}</ol>` : s.tipe === 'bs' ? '<p style="margin-left:14pt">( ) Benar &nbsp;&nbsp; ( ) Salah</p>' : kunci ? '' : '<p>........................................................................................................<br>........................................................................................................</p>'}${kunci ? `<p style="margin-left:14pt"><b>Kunci:</b> ${esc(s.kunci || '-')}${s.pembahasan ? ' — ' + esc(s.pembahasan) : ''}</p>` : ''}</div>`;
  let n = 0;
  return `${kopHtml()}<h1>${esc(a.nama)}${kunci ? ' — Kunci Jawaban' : ''}</h1><table class="plain"><tr><td>Mata pelajaran</td><td>: ${esc(namaMapel(a.mapel_id))}</td><td>Nama</td><td>: .............................</td></tr><tr><td>Kelas</td><td>: ${esc(namaKelas(a.kelas_id))}</td><td>No. absen</td><td>: .............................</td></tr></table>
    ${pg.length ? `<h3>A. Pilihan ganda / benar-salah</h3>${pg.map((s) => blok(s, ++n)).join('')}` : ''}${lain.length ? `<h3>${pg.length ? 'B' : 'A'}. Isian & uraian</h3>${lain.map((s) => blok(s, ++n)).join('')}` : ''}`;
}

function tabSkor(el, a, soal, siswa, ctx) {
  if (!soal.length) { el.innerHTML = `<div class="card">${emptyState({ icon: 'clipboard', title: 'Tanpa butir soal' })}</div>`; return; }
  const maks = soal.reduce((x, s) => x + (Number(s.skor) || 1), 0);
  el.innerHTML = `<div class="card" style="padding:.75rem"><p class="small muted" style="padding:.25rem .5rem .6rem">Isi skor tiap butir (PG/B-S: 1 benar, 0 salah). Nilai = jumlah skor ÷ ${maks} × 100, otomatis masuk buku nilai.</p><div class="tbl-wrap"><table class="tbl"><thead><tr><th class="sticky-col">Nama</th>${soal.map((s, i) => `<th class="num" title="${esc(String(s.teks).slice(0, 80))}">${i + 1}<br><span class="tiny">/${esc(s.skor || 1)}</span></th>`).join('')}<th class="num">Nilai</th></tr></thead><tbody>
    ${siswa.map((p) => { const b = (a.butir || {})[p.id] || {}; return `<tr data-sid="${p.id}"><td class="sticky-col" style="white-space:nowrap"><b>${esc(p.nama)}</b></td>${soal.map((s) => `<td class="num"><input class="cell" style="width:48px" inputmode="numeric" data-q="${s.id}" data-max="${s.skor || 1}" value="${b[s.id] ?? ''}"></td>`).join('')}<td class="num"><b data-nilai>${(a.nilai || {})[p.id] ?? '—'}</b></td></tr>`; }).join('')}
  </tbody></table></div></div>`;
  el.addEventListener('change', (e) => {
    const inp = e.target.closest('input[data-q]'); if (!inp) return;
    const tr = inp.closest('tr'); const sid = tr.dataset.sid;
    let v = inp.value.trim() === '' ? null : Number(inp.value);
    if (v !== null && (isNaN(v) || v < 0 || v > Number(inp.dataset.max))) { toast(`Skor 0–${inp.dataset.max}.`, 'err'); inp.value = ''; v = null; }
    const cur = Object.assign({}, ((db.get('Asesmen', a.id).butir || {})[sid]) || {});
    if (v === null) delete cur[inp.dataset.q]; else cur[inp.dataset.q] = v;
    const terisi = soal.filter((s) => cur[s.id] !== undefined);
    const nilai = terisi.length === soal.length ? round1((soal.reduce((x, s) => x + (Number(cur[s.id]) || 0), 0) / maks) * 100) : undefined;
    db.put('Asesmen', a.id, { butir: { [sid]: cur }, ...(nilai !== undefined ? { nilai: { [sid]: nilai } } : {}) }, { senyap: true });
    if (nilai !== undefined) tr.querySelector('[data-nilai]').textContent = nilai;
  });
  el.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.matches('input[data-q]')) { e.preventDefault(); const all = Array.from(el.querySelectorAll('input[data-q]')); const nx = all[all.indexOf(e.target) + 1]; if (nx) { nx.focus(); nx.select(); } } });
}
function tabAnalisis(el, a, soal, siswa) {
  const data = siswa.map((p) => ({ p, b: (a.butir || {})[p.id] || {} })).filter((x) => soal.every((s) => x.b[s.id] !== undefined));
  if (data.length < 5) { el.innerHTML = `<div class="card">${emptyState({ icon: 'pie', title: 'Data belum cukup', text: 'Analisis butir membutuhkan skor lengkap minimal 5 siswa di tab "Skor per butir".' })}</div>`; return; }
  data.forEach((x) => { x.total = soal.reduce((t, s) => t + (Number(x.b[s.id]) || 0), 0); });
  data.sort((x, y) => y.total - x.total);
  const n27 = Math.max(1, Math.round(data.length * 0.27));
  const atas = data.slice(0, n27), bawah = data.slice(-n27);
  const baris = soal.map((s, i) => {
    const mx = Number(s.skor) || 1;
    const p = round1(avg(data.map((x) => Number(x.b[s.id]) / mx)));
    const d = round1(avg(atas.map((x) => Number(x.b[s.id]) / mx)) - avg(bawah.map((x) => Number(x.b[s.id]) / mx)));
    const kp = p > 0.7 ? ['Mudah', 'b-gr'] : p >= 0.3 ? ['Sedang', 'b-mt'] : ['Sukar', 'b-red'];
    const kd = d >= 0.4 ? ['Sangat baik', 'b-gr'] : d >= 0.3 ? ['Baik', 'b-mt'] : d >= 0.2 ? ['Cukup — perbaiki', 'b-qs'] : ['Buruk — ganti', 'b-red'];
    return `<tr><td class="num">${i + 1}</td><td class="small">${esc(String(s.teks).slice(0, 90))}</td><td class="num">${p}</td><td><span class="badge ${kp[1]}">${kp[0]}</span></td><td class="num">${d}</td><td><span class="badge ${kd[1]}">${kd[0]}</span></td></tr>`;
  });
  el.innerHTML = `<div class="card" style="padding:.75rem"><p class="small muted" style="padding:.25rem .5rem .6rem">Berdasarkan ${data.length} siswa. Tingkat kesukaran (p) = rata-rata proporsi skor; daya beda (D) = selisih kelompok atas & bawah 27%.</p><div class="tbl-wrap"><table class="tbl stack nomor"><thead><tr><th>No</th><th>Soal</th><th class="num">p</th><th>Kesukaran</th><th class="num">D</th><th>Daya beda</th></tr></thead><tbody>${baris.join('')}</tbody></table></div></div>`;
}

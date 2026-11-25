// Menjalankan satu alat Co-Pilot AI dengan formulir & hasil yang dapat disunting/dicetak.
import { ic } from '../core/icons.js';
import { esc, toast, salin, uid } from '../core/util.js';
import { S } from '../core/state.js';
import { db } from '../core/store.js';
import { ALAT, jalankanAi } from '../core/ai.js';
import { kopHtml, cetak, eksporWord } from '../core/dokumen.js';
import { kelasList, mapelKelas } from '../core/ui.js';
import { pergi } from '../core/router.js';

const BIDANG = {
  lkpd: [['mapel', 'Mata pelajaran', 'mapel'], ['kelas', 'Kelas', 'kelas'], ['materi', 'Materi', 'text'], ['tp', 'Tujuan pembelajaran', 'text'], ['bentuk', 'Bentuk kerja', ['kelompok', 'individu', 'berpasangan']]],
  rubrik: [['tugas', 'Tugas / proyek', 'text'], ['mapel', 'Mata pelajaran', 'mapel'], ['kelas', 'Kelas', 'kelas'], ['jumlah', 'Jumlah kriteria', 'number']],
  umpan_balik: [['tugas', 'Judul tugas', 'text'], ['kelas', 'Kelas', 'kelas'], ['rubrik', 'Rubrik / kriteria (opsional)', 'text'], ['teks', 'Tulisan peserta didik', 'area']],
  diferensiasi: [['kelas', 'Kelas', 'kelas'], ['teks', 'Teks sumber', 'area']],
  ringkasan: [['kelas', 'Kelas', 'kelas'], ['teks', 'Teks materi', 'area']],
  pesan_wali: [['tujuan', 'Tujuan pesan', 'text'], ['poin', 'Poin yang disampaikan', 'area'], ['nada', 'Nada', ['sopan dan hangat', 'formal', 'apresiatif', 'tegas namun santun']]],
  surat: [['jenis', 'Jenis surat', ['undangan rapat orang tua', 'pemberitahuan kegiatan', 'permohonan izin', 'surat tugas', 'surat keterangan']], ['keterangan', 'Keterangan (waktu, tempat, acara)', 'area']],
  laporan: [['jenis', 'Jenis', ['laporan kegiatan', 'notulen rapat', 'laporan supervisi', 'laporan kegiatan ekstrakurikuler']], ['catatan', 'Catatan kasar', 'area']]
};

export default {
  title: 'Co-Pilot AI',
  render(el, ctx) {
    const k = ctx.params.alat;
    const a = ALAT[k];
    if (!a || !BIDANG[k]) { pergi('/ai'); return; }
    const kelas = kelasList();
    const mapel = Array.from(new Set(db.all('Mapel').map((m) => m.nama)));
    const nilai = ctx.isian || {};
    el.innerHTML = `<div class="page-h"><div><div class="crumbs"><a href="#/ai">Co-Pilot AI</a>${ic('chevr', 'ic-s')}<b>${esc(a.judul)}</b></div><h1>${esc(a.judul)}</h1><p class="sub">${esc(a.ket)}</p></div></div>
      <div class="split"><form class="card col gap-l" novalidate>${BIDANG[k].map(([n, l, t]) => {
        const v = nilai[n] || '';
        if (t === 'area') return `<label class="field"><span>${l}</span><textarea class="input" name="${n}" rows="8">${esc(v)}</textarea></label>`;
        if (t === 'kelas') return `<label class="field"><span>${l}</span><input class="input" name="${n}" list="dl-k" value="${esc(v || (kelas[0] ? kelas[0].nama : ''))}"><datalist id="dl-k">${kelas.map((x) => `<option value="${esc(x.nama)}">`).join('')}</datalist></label>`;
        if (t === 'mapel') return `<label class="field"><span>${l}</span><input class="input" name="${n}" list="dl-m" value="${esc(v || mapel[0] || '')}"><datalist id="dl-m">${mapel.map((x) => `<option value="${esc(x)}">`).join('')}</datalist></label>`;
        if (Array.isArray(t)) return `<label class="field"><span>${l}</span><select class="input" name="${n}">${t.map((x) => `<option ${v === x ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select></label>`;
        return `<label class="field"><span>${l}</span><input class="input" ${t === 'number' ? 'type="number" min="2" max="6"' : ''} name="${n}" value="${esc(v || (t === 'number' ? 4 : ''))}"></label>`;
      }).join('')}<button class="btn btn-primary" type="submit">${ic('wand', 'ic-s')}Buat draf</button></form>
      <section id="hasil">${ctx.hasil ? '' : `<div class="card card-flat" style="min-height:240px;display:grid;place-items:center;text-align:center"><div><div class="empty-art" style="margin:0 auto .5rem;width:72px;height:72px;border-radius:50%;background:var(--ai-bg);display:grid;place-items:center;color:var(--ai)">${ic(a.ic, 'ic-xl')}</div><p class="small muted">Hasil akan tampil di sini.</p></div></div>`}</section></div>`;
    const f = el.querySelector('form');
    const tampil = (res) => {
      const box = el.querySelector('#hasil');
      box.innerHTML = `<div class="card col gap-l"><div class="row between row-wrap"><span class="badge ${res.sumber === 'ai' ? 'b-ai' : 'b-draf'}">${res.sumber === 'ai' ? 'Draf AI — periksa sebelum dipakai' : 'Draf templat bawaan'}</span><div class="row"><button class="btn btn-white btn-sm" data-x="salin">${ic('copy', 'ic-s')}Salin</button><button class="btn btn-white btn-sm" data-x="word">${ic('download', 'ic-s')}Word</button><button class="btn btn-dark btn-sm" data-x="cetak">${ic('print', 'ic-s')}Cetak</button></div></div>
        ${res.alasan ? `<p class="tiny muted">${esc(res.alasan)}</p>` : ''}<div class="${res.sumber === 'ai' ? 'ai-draft' : 'card-flat'}" id="isiHasil" contenteditable="true" style="outline:none">${render(k, res.hasil)}</div>
        ${k === 'lkpd' ? `<button class="btn btn-white btn-sm" data-x="simpan" style="align-self:flex-start">${ic('image', 'ic-s')}Simpan ke Materi & Media</button>` : ''}</div>`;
      const isiEl = box.querySelector('#isiHasil');
      box.querySelector('[data-x="salin"]').onclick = () => salin(isiEl.innerText);
      box.querySelector('[data-x="cetak"]').onclick = () => cetak(a.judul, `${['surat', 'laporan', 'lkpd'].includes(k) ? kopHtml() : ''}${isiEl.innerHTML}`);
      box.querySelector('[data-x="word"]').onclick = () => eksporWord(a.judul, `${['surat', 'laporan'].includes(k) ? kopHtml() : ''}${isiEl.innerHTML}`);
      const sp = box.querySelector('[data-x="simpan"]');
      if (sp) sp.onclick = () => { const m = db.all('Mapel').find((x) => x.nama === f.mapel.value) || db.all('Mapel')[0]; db.put('Materi', uid('MT'), { mapel_id: m ? m.id : '', tipe: 'lkpd', judul: res.hasil.judul || 'LKPD', isi: JSON.stringify(res.hasil), url: '' }); toast('LKPD disimpan di Materi & Media.'); };
    };
    if (ctx.hasil) tampil(ctx.hasil);
    f.onsubmit = async (e) => {
      e.preventDefault();
      const input = {}; BIDANG[k].forEach(([n, , t]) => { input[n] = t === 'number' ? Number(f[n].value) : f[n].value; });
      if (input.teks !== undefined && input.teks.trim().length < 20) { toast('Tempel teks minimal beberapa kalimat.', 'err'); return; }
      ctx.isian = input;
      const b = f.querySelector('[type=submit]'); b.disabled = true; b.innerHTML = `${ic('refresh', 'ic-s spin')}Menyusun…`;
      const res = await jalankanAi(k, input);
      b.disabled = false; b.innerHTML = `${ic('wand', 'ic-s')}Buat draf`;
      ctx.hasil = res;
      tampil(res);
    };
  }
};

const ul = (a) => `<ul>${(a || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
function render(k, h) {
  h = h || {};
  if (k === 'lkpd') return `<h2>${esc(h.judul)}</h2><p><b>Tujuan:</b> ${esc(h.tujuan)}</p><h4>Petunjuk</h4>${ul(h.petunjuk)}${(h.kegiatan || []).map((g, i) => `<h4>Kegiatan ${i + 1}</h4><p>${esc(g.langkah)}</p>${ul(g.pertanyaan)}`).join('')}<h4>Refleksi</h4>${ul(h.refleksi)}<h4>Rubrik</h4><table class="tbl"><tr><th>Kriteria</th><th>4</th><th>3</th><th>2</th><th>1</th></tr>${(h.rubrik || []).map((r) => `<tr><td>${esc(r.kriteria)}</td><td>${esc(r.skor4)}</td><td>${esc(r.skor3)}</td><td>${esc(r.skor2)}</td><td>${esc(r.skor1)}</td></tr>`).join('')}</table>`;
  if (k === 'rubrik') return `<h2>${esc(h.judul)}</h2><table class="tbl"><tr><th>Kriteria</th><th>Bobot</th><th>4</th><th>3</th><th>2</th><th>1</th></tr>${(h.kriteria || []).map((c) => `<tr><td><b>${esc(c.nama)}</b></td><td>${esc(c.bobot)}%</td>${[4, 3, 2, 1].map((s) => `<td class="small">${esc(((c.level || []).find((l) => Number(l.skor) === s) || {}).deskripsi || '')}</td>`).join('')}</tr>`).join('')}</table>`;
  if (k === 'umpan_balik') return `<p><b>Saran skor:</b> ${esc(h.skor_saran)}</p><h4>Kekuatan</h4>${ul(h.kekuatan)}<h4>Yang perlu diperbaiki</h4>${ul(h.perbaikan)}<h4>Langkah selanjutnya</h4>${ul(h.saran_langkah)}<p><i>${esc(h.komentar_singkat)}</i></p>`;
  if (k === 'diferensiasi') return (h.tingkat || []).map((t) => `<h3>${esc(t.nama)}</h3><p style="white-space:pre-wrap">${esc(t.teks)}</p>${(t.kosakata || []).length ? `<p class="small"><b>Kosakata:</b> ${t.kosakata.map((x) => `${esc(x.kata)} (${esc(x.arti)})`).join(', ')}</p>` : ''}${ul(t.pertanyaan)}`).join('<hr>');
  if (k === 'ringkasan') return `<h4>Ringkasan</h4><p>${esc(h.ringkasan)}</p><h4>Poin penting</h4>${ul(h.poin)}<h4>Pertanyaan pemantik</h4>${ul(h.pertanyaan_pemantik)}`;
  if (k === 'pesan_wali') return `<p style="white-space:pre-wrap">${esc(h.pesan)}</p>`;
  if (k === 'surat') return `<p><b>Perihal:</b> ${esc(h.perihal)}</p><p style="white-space:pre-wrap">${esc(h.isi)}</p><p>${esc(h.penutup)}</p><br><p style="text-align:right">Hormat kami,<br><br><br><b>${esc((S.user || {}).nama || '')}</b></p>`;
  if (k === 'laporan') return `<h2>${esc(h.judul)}</h2><h4>Pendahuluan</h4><p>${esc(h.pendahuluan)}</p><h4>Pelaksanaan</h4><p>${esc(h.pelaksanaan)}</p><h4>Hasil</h4>${ul(h.hasil)}<h4>Tindak lanjut</h4>${ul(h.tindak_lanjut)}`;
  return `<pre>${esc(JSON.stringify(h, null, 2))}</pre>`;
}

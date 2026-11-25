// Telaah & persetujuan RPP oleh kepala sekolah: pratinjau dokumen, rubrik supervisi, catatan, tanda tangan PIN.
import { ic } from '../core/icons.js';
import { esc, toast, modal, fmtTgl } from '../core/util.js';
import { S, isDemo } from '../core/state.js';
import { db } from '../core/store.js';
import { api } from '../core/api.js';
import { delegasi, emptyState, skeleton, avatarWarna } from '../core/ui.js';
import { PRINSIP } from '../core/kurikulum.js';
import { namaKelas, namaMapel } from '../core/hitung.js';
import { skorKepatuhan, TAHAP } from './rpp.js';
import { pergi } from '../core/router.js';

const RUBRIK = [
  ['identifikasi', 'Identifikasi kesiapan murid, karakteristik materi & dimensi profil lulusan'],
  ['desain', 'Desain: TP terukur, praktik pedagogis, kemitraan, lingkungan & pemanfaatan digital'],
  ['pengalaman', 'Pengalaman belajar berkesadaran, bermakna, menggembirakan (awal–memahami–mengaplikasi–merefleksi–penutup)'],
  ['asesmen', 'Asesmen awal, proses, akhir selaras dengan TP; diferensiasi tersedia']
];
const ambil = (o, p) => p.split('.').reduce((a, k) => (a == null ? a : a[k]), o);

export default {
  title: 'Telaah RPP',
  async render(el, ctx) {
    el.innerHTML = skeleton(3);
    let r;
    try {
      if (isDemo()) { const x = db.get('RPP', ctx.params.id); if (!x) throw new Error('RPP tidak ditemukan.'); r = Object.assign({}, x, { guru: { nama: S.user.nama, nip: S.user.nip }, kelas: namaKelas(x.kelas_id), mapel: namaMapel(x.mapel_id), fase: (db.get('Kelas', x.kelas_id) || {}).fase }); }
      else r = (await api('sekolah.rpp.get', { id: ctx.params.id })).data;
    } catch (e) { el.innerHTML = `<div class="card">${emptyState({ icon: 'alert', title: 'RPP tidak dapat dibuka', text: e.message, action: '<a class="btn btn-primary" href="#/sekolah?tab=telaah">Kembali</a>' })}</div>`; return; }
    const i = r.isi || {};
    const { cek, skor } = skorKepatuhan(r);
    const sudah = r.status === 'disetujui';
    const nilaiAwal = (r.telaah && r.telaah.rubrik) || {};
    const s = S.sekolah || {};
    const ul = (a) => `<ul>${(a || []).filter(Boolean).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
    el.innerHTML = `<div class="page-h"><div><div class="crumbs"><a href="#/sekolah?tab=telaah">Antrean Telaah</a>${ic('chevr', 'ic-s')}<b>${esc(r.guru.nama)}</b></div>
      <h1>Telaah RPP Pembelajaran Mendalam</h1><p class="sub"><span class="badge ${sudah ? 'b-gr' : r.status === 'revisi' ? 'b-qs' : 'b-mt'}">${sudah ? 'Disetujui' : r.status === 'revisi' ? 'Dikembalikan untuk revisi' : 'Draf menunggu persetujuan KS'}</span> Versi ${esc(r.versi || 1)} · diajukan ${fmtTgl(Number(r.updated_at) || Date.now(), 'tanpa-hari')} · ${esc(s.nama || '')}</p></div>
      <div class="row row-wrap"><div class="card card-s row" style="padding:.5rem .9rem"><span class="kpi-v" style="font-size:1.4rem;color:${skor >= 90 ? 'var(--green)' : 'var(--amber)'}">${skor}%</span><span class="tiny muted">Kepatuhan<br>standar</span></div>
      ${sudah ? (r.dok_kode || (r.dokumen && r.dokumen.kode) ? `<a class="btn btn-white" href="#/verifikasi/${esc(r.dok_kode || r.dokumen.kode)}">${ic('qr', 'ic-s')}Lihat verifikasi</a>` : '') : `<button class="btn btn-white" data-act="revisi">${ic('edit', 'ic-s')}Minta revisi</button><button class="btn btn-primary" data-act="setuju">${ic('sign', 'ic-s')}Setujui & TTD digital</button>`}</div></div>
    <div class="split-8"><article class="paper">
      <div class="row between tiny muted" style="margin-bottom:1rem"><span>Lembar kerja guru (A4/F4)</span><span>Permendikdasmen No. 1/2026</span></div>
      <div style="text-align:center;border-bottom:3px double var(--line-2);padding-bottom:.75rem;margin-bottom:1rem">${s.kop_atas ? `<div class="tiny muted" style="white-space:pre-line">${esc(s.kop_atas)}</div>` : ''}<b style="text-transform:uppercase;color:var(--navy)">${esc(s.nama || '')}</b><div class="tiny muted">${esc([s.alamat, s.kota].filter(Boolean).join(', '))}${s.npsn ? ' • NPSN ' + esc(s.npsn) : ''}</div></div>
      <h2 style="text-align:center">${esc(r.judul || r.materi)}</h2><p class="small muted" style="text-align:center;margin-bottom:1rem">${esc(r.mapel)} · Fase ${esc(r.fase || '-')} (Kelas ${esc(r.kelas)}) · ${esc(r.jp)} JP × ${esc(i.menit_jp || 35)} menit</p>
      <div class="grid g3" style="gap:.5rem;margin-bottom:1rem"><div class="meta-box"><div class="tiny">Pendidik</div><b class="small">${esc(r.guru.nama)}</b><div class="tiny muted">NIP ${esc(r.guru.nip || '-')}</div></div><div class="meta-box"><div class="tiny">Model</div><b class="small">${esc(r.model || ambil(i, 'desain.praktik_pedagogis') || '-')}</b></div><div class="meta-box"><div class="tiny">Dimensi</div><b class="small">${esc((r.dimensi || []).join(', '))}</b></div></div>
      <h4 class="sec"><span class="sec-n">1</span>Identifikasi</h4><p class="small" style="margin:.4rem 0">${esc(ambil(i, 'identifikasi.kesiapan') || '-')}</p><p class="small muted">${esc(ambil(i, 'identifikasi.karakteristik_materi') || '')}</p>
      <div class="grid g3" style="gap:.5rem;margin:.6rem 0 1rem">${[['pemula', 'Pemula', 'var(--qs-bg)'], ['berkembang', 'Berkembang', 'var(--mt-bg)'], ['cakap', 'Cakap', 'var(--gr-bg)']].map(([k, l, bg]) => `<div class="stage" style="background:${bg}"><div class="stage-h small">${l}</div><p class="small">${esc(ambil(i, 'diferensiasi.' + k) || '-')}</p></div>`).join('')}</div>
      <div class="row row-wrap" style="margin-bottom:1rem">${PRINSIP.map((p) => `<span class="badge b-mt">${p}</span>`).join('')}</div>
      <h4 class="sec"><span class="sec-n">2</span>Desain pembelajaran</h4><div class="small" style="margin:.4rem 0 1rem"><b>Tujuan pembelajaran</b>${ul(ambil(i, 'desain.tp'))}<p><b>Topik kontekstual:</b> ${esc(ambil(i, 'desain.topik_kontekstual') || '-')}</p><p><b>Kemitraan:</b> ${esc(ambil(i, 'desain.kemitraan') || '-')}</p><p><b>Lingkungan belajar:</b> ${esc(ambil(i, 'desain.lingkungan_belajar') || '-')}</p><p><b>Digital:</b> ${esc(ambil(i, 'desain.pemanfaatan_digital') || '-')}</p></div>
      <h4 class="sec"><span class="sec-n">3</span>Pengalaman belajar</h4><div class="col" style="margin:.4rem 0 1rem">${TAHAP.map(([k, l, p]) => `<div class="stage"><div class="stage-h small"><span>${l} <span class="badge">${p}</span></span><span>${esc(ambil(i, `pengalaman.${k}.durasi`) || '')}</span></div><div class="small">${ul(ambil(i, `pengalaman.${k}.kegiatan`))}</div></div>`).join('')}</div>
      <h4 class="sec"><span class="sec-n">4</span>Asesmen</h4><div class="grid g3" style="gap:.5rem;margin:.4rem 0">${[['diagnostik', 'Awal'], ['formatif', 'Proses'], ['sumatif', 'Akhir']].map(([k, l]) => `<div class="stage"><div class="stage-h small">${l}</div><p class="small">${esc(ambil(i, 'asesmen.' + k) || '-')}</p></div>`).join('')}</div>
      ${String(r.mode_kbc) === '1' && i.nilai_kbc ? `<h4 class="sec" style="margin-top:1rem"><span class="sec-n">${ic('heart', 'ic-s')}</span>Kurikulum Berbasis Cinta</h4><p class="small">${esc(i.nilai_kbc)}</p>` : ''}
    </article>
    <aside class="col gap-l" style="position:sticky;top:80px">
      <div class="card"><div class="row" style="margin-bottom:.5rem">${avatarWarna(r.guru.nama, 0)}<span><b>${esc(r.guru.nama)}</b><br><span class="tiny muted">${esc(r.mapel)} · Kelas ${esc(r.kelas)}</span></span></div>
        <div class="col" style="gap:.25rem">${cek.map(([l, ok]) => `<div class="row tiny" style="gap:.35rem;color:${ok ? 'var(--text)' : 'var(--red)'}">${ic(ok ? 'checkc' : 'alert', 'ic-s')}${esc(l)}</div>`).join('')}</div></div>
      <form class="card col gap-l" data-telaah><div class="row between"><b>Rubrik supervisi dokumen</b><span class="kpi-v" style="font-size:1.5rem" data-total>0</span></div>
        ${RUBRIK.map(([k, l]) => `<div class="field"><span class="small">${esc(l)}</span><div class="seg" data-rubrik="${k}">${[1, 2, 3, 4].map((n) => `<button type="button" role="tab" data-n="${n}" aria-selected="${Number(nilaiAwal[k] || (skor >= 90 ? 4 : skor >= 70 ? 3 : 2)) === n}" ${sudah ? 'disabled' : ''}>${n}</button>`).join('')}</div></div>`).join('')}
        <label class="field"><span>Catatan telaah <span class="muted">(terkirim ke guru)</span></span><textarea class="input" name="catatan" rows="5" maxlength="3000" ${sudah ? 'disabled' : ''} placeholder="Apresiasi dan saran perbaikan yang spesifik…">${esc((r.telaah && r.telaah.catatan) || '')}</textarea></label>
        <p class="tiny muted">Skor 1–4 per indikator → nilai 0–100. Persetujuan memerlukan PIN tanda tangan 6 digit.</p></form>
    </aside></div>`;
    const f = el.querySelector('[data-telaah]');
    const hitung = () => { const v = {}; f.querySelectorAll('[data-rubrik]').forEach((g) => { const b = g.querySelector('[aria-selected="true"]'); v[g.dataset.rubrik] = b ? Number(b.dataset.n) : 0; }); const tot = Math.round((Object.values(v).reduce((a, x) => a + x, 0) / (RUBRIK.length * 4)) * 1000) / 10; f.querySelector('[data-total]').textContent = tot; return { v, tot }; };
    f.addEventListener('click', (e) => { const b = e.target.closest('[data-rubrik] button'); if (!b || b.disabled) return; b.parentElement.querySelectorAll('button').forEach((x) => x.setAttribute('aria-selected', x === b)); hitung(); });
    hitung();
    const kirim = async (keputusan) => {
      const { v, tot } = hitung();
      const catatan = f.catatan.value.trim();
      if (keputusan === 'revisi' && catatan.length < 10) { toast('Tuliskan catatan revisi yang jelas untuk guru.', 'err'); f.catatan.focus(); return; }
      let pin = '';
      if (keputusan === 'setuju' && !isDemo()) {
        const p = await modal({ title: 'Tanda tangan elektronik', body: `<p class="small muted" style="margin-bottom:.75rem">Masukkan PIN 6 digit Anda. Belum punya PIN? Atur di Pengaturan → Keamanan.</p><input class="input" type="password" name="pin" inputmode="numeric" maxlength="6" autocomplete="off" autofocus style="font-size:1.5rem;letter-spacing:.5em;text-align:center">`, actions: [{ label: 'Batal', value: null, cls: 'btn-ghost' }, { label: 'Setujui & tandatangani', value: 'ok', cls: 'btn-primary', validate: (x) => (!/^\d{6}$/.test(x.pin) ? 'PIN harus 6 digit.' : '') }] });
        if (p.value !== 'ok') return;
        pin = p.form.pin;
      }
      try {
        if (isDemo()) db.put('RPP', r.id, { status: keputusan === 'setuju' ? 'disetujui' : 'revisi', telaah: { keputusan: keputusan === 'setuju' ? 'disetujui' : 'revisi', catatan, rubrik: v, skor: tot, oleh: S.user.nama, waktu: new Date().toISOString() } });
        else { const res = await api('sekolah.rpp.review', { id: r.id, keputusan, catatan, rubrik: v, skor: tot, pin }); toast(res.message); }
        if (isDemo()) toast(keputusan === 'setuju' ? 'RPP disetujui (simulasi demo).' : 'Catatan revisi dikirim (simulasi demo).');
        pergi('/sekolah?tab=telaah');
      } catch (e) { toast(e.message, 'err', 5000); }
    };
    delegasi(el, { setuju: () => kirim('setuju'), revisi: () => kirim('revisi') });
  }
};

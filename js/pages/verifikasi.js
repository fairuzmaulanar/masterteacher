// Halaman publik verifikasi keaslian dokumen (dibuka dari pindaian QR).
import { ic } from '../core/icons.js';
import { esc, fmtTgl } from '../core/util.js';
import { adaServer } from '../core/state.js';
import { apiGet } from '../core/api.js';
import { demoVerifikasi } from '../core/demo.js';

export default {
  title: 'Verifikasi Dokumen',
  async render(el, ctx) {
    const kode = String(ctx.params.kode || '').toUpperCase();
    el.innerHTML = `<div class="auth-form" style="min-height:100dvh"><div class="auth-card col gap-l" style="width:min(560px,100%)">
      <div class="row"><span class="brand-logo">${ic('shield', 'ic-l')}</span><div><b style="color:var(--navy);font-size:1.1rem">Verifikasi Dokumen</b><div class="tiny muted">Master Teacher Planner</div></div></div>
      <div class="card" id="hasil"><div class="skel skel-line" style="width:50%"></div><div class="skel skel-line"></div><div class="skel skel-line" style="width:70%"></div></div>
      <a class="btn btn-ghost btn-sm" href="#/masuk" style="align-self:center">Buka aplikasi</a></div></div>`;
    const box = el.querySelector('#hasil');
    const contoh = demoVerifikasi(kode);
    if (contoh) { box.innerHTML = isi(contoh, kode) + `<p class="tiny muted" style="margin-top:.5rem">${ic('info', 'ic-s')} Dokumen contoh yang diterbitkan di Mode Demo pada perangkat ini.</p>`; return; }
    if (!adaServer()) { box.innerHTML = tampil(false, 'Dokumen tidak ditemukan', 'Server verifikasi belum dikonfigurasi pada salinan aplikasi ini.', kode); return; }
    try {
      const r = await apiGet('doc.verify', { kode });
      const d = r.data || {};
      if (!d.id) { box.innerHTML = tampil(false, 'Dokumen tidak ditemukan', r.message || 'Kode tidak terdaftar. Kemungkinan dokumen palsu atau kode salah ketik.', kode); return; }
      box.innerHTML = isi(d, kode);
    } catch (e) {
      box.innerHTML = tampil(false, 'Tidak dapat memeriksa', e.message, kode);
    }
  }
};
function isi(d, kode) {
      const status = d.valid ? 'Dokumen ASLI dan berlaku' : d.status === 'DITARIK' ? 'Dokumen sudah DITARIK / diganti versi baru' : 'Dokumen belum disahkan (menunggu tanda tangan)';
      return tampil(d.valid, status, '', kode) + `<div class="divider"></div>
        <dl class="grid g2" style="margin:0">
          ${baris('Jenis', d.jenisLabel)}${baris('Nomor', d.nomor)}${baris('Judul', d.judul)}${baris('Satuan pendidikan', d.sekolah)}
          ${baris('Diterbitkan oleh', d.penerbit)}${baris('Tanggal terbit', d.terbit ? fmtTgl(d.terbit, 'tanpa-hari') : '-')}
          ${(d.penandatangan || []).map((p) => baris('Ditandatangani', `${p.nama}${p.jabatan ? ' — ' + p.jabatan : ''}<br><span class="tiny muted">${p.waktu ? fmtTgl(p.waktu, 'tanpa-hari') : ''}</span>`, true)).join('')}
          ${d.ditarik ? baris('Ditarik', fmtTgl(d.ditarik, 'tanpa-hari')) : ''}
        </dl>
        <p class="tiny muted" style="margin-top:1rem">Sidik jari isi (SHA-256): <code style="word-break:break-all">${esc(d.hash || '')}</code><br>Halaman ini tidak menampilkan data pribadi peserta didik.</p>`;
}
const baris = (k, v, html = false) => `<div><dt class="tiny muted bold" style="text-transform:uppercase;letter-spacing:.05em">${esc(k)}</dt><dd style="margin:0;font-weight:600">${html ? v : esc(v || '-')}</dd></div>`;
function tampil(ok, judul, ket, kode) {
  return `<div class="row" style="gap:.9rem;align-items:flex-start"><span class="icon-box l" style="background:${ok ? 'var(--gr-bg)' : 'var(--red-bg)'};color:${ok ? 'var(--gr)' : 'var(--red)'}">${ic(ok ? 'checkc' : 'alert', 'ic-l')}</span>
    <div><h3>${esc(judul)}</h3>${ket ? `<p class="small muted">${esc(ket)}</p>` : ''}<p class="tiny muted" style="margin-top:.25rem">Kode: <b>${esc(kode)}</b></p></div></div>`;
}

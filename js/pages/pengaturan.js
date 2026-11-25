// Pengaturan: profil, sekolah & kop, tampilan, data & sinkron (cadangan/migrasi), keamanan & privasi, admin.
import { ic } from '../core/icons.js';
import { esc, toast, modal, konfirmasi, salin, unduh, bacaFileTeks, kecilkanGambar, waktuRelatif, fmtTgl, uid } from '../core/util.js';
import { S, simpanSesi, simpanPrefs, terapkanTema, isDemo, isKepsek, isAdmin, adaServer, APP_VERSION, gasUrl } from '../core/state.js';
import { db, TABLES } from '../core/store.js';
import { api } from '../core/api.js';
import { sinkron, syncState } from '../core/sync.js';
import { delegasi, segmen, emptyState, skeleton } from '../core/ui.js';
import { JENJANG } from '../core/kurikulum.js';

const cloud = () => S.mode === 'cloud' && adaServer();
const profilBerubah = () => { simpanSesi(); document.dispatchEvent(new CustomEvent('mtp:profil')); };

export default {
  title: 'Pengaturan',
  deps: [],
  async render(el, ctx) {
    ctx.st = ctx.st || { tab: ctx.query.tab || 'profil' };
    const st = ctx.st;
    const tabs = [['profil', 'Profil'], ['sekolah', 'Sekolah & Kop'], ['tampilan', 'Tampilan'], ['data', 'Data & Sinkron'], ['keamanan', 'Keamanan & Privasi']];
    if (isAdmin() && cloud()) tabs.push(['admin', 'Admin']);
    el.innerHTML = `<div class="page-h"><div><div class="crumbs"><a href="#/hari-ini">Beranda</a>${ic('chevr', 'ic-s')}<b>Pengaturan</b></div><h1>Pengaturan</h1><p class="sub">${esc((S.user || {}).email || '')} · versi ${APP_VERSION}</p></div>
      <button class="btn btn-white" data-act="keluar">${ic('logout', 'ic-s')}${isDemo() ? 'Keluar demo' : 'Keluar'}</button></div>
      <div style="margin-bottom:1rem">${segmen(tabs, st.tab)}</div><div id="isi"></div>`;
    const isi = el.querySelector('#isi');
    const T = { profil: tabProfil, sekolah: tabSekolah, tampilan: tabTampilan, data: tabData, keamanan: tabKeamanan, admin: tabAdmin };
    delegasi(el, {
      tab: (b) => { st.tab = b.dataset.tab; ctx.rerender(); },
      keluar: () => document.dispatchEvent(new CustomEvent('mtp:logout'))
    });
    try { await (T[st.tab] || tabProfil)(isi, ctx); } catch (e) { isi.innerHTML = `<div class="card">${emptyState({ icon: 'cloudoff', title: 'Tidak dapat memuat', text: e.message })}</div>`; }
  }
};

// ---------- Profil ----------
function tabProfil(el) {
  const u = S.user || {};
  el.innerHTML = `<form class="card col gap-l" style="max-width:760px">
    <div class="grid g2"><label class="field"><span>Nama lengkap & gelar</span><input class="input" name="nama" required value="${esc(u.nama || '')}"></label><label class="field"><span>Email</span><input class="input" value="${esc(u.email || '')}" disabled></label></div>
    <div class="grid g3"><label class="field"><span>NIP</span><input class="input" name="nip" value="${esc(u.nip || '')}"></label><label class="field"><span>NUPTK</span><input class="input" name="nuptk" value="${esc(u.nuptk || '')}"></label><label class="field"><span>No. WhatsApp</span><input class="input" name="wa" inputmode="tel" value="${esc(u.wa || '')}"></label></div>
    <div class="grid g2"><label class="field"><span>Jenjang</span><select class="input" name="jenjang">${JENJANG.map((j) => `<option value="${j.k}" ${u.jenjang === j.k ? 'selected' : ''}>${j.label}</option>`).join('')}</select></label><label class="field"><span>Mapel / peran utama</span><input class="input" name="mapel_utama" value="${esc(u.mapel_utama || '')}"></label></div>
    <label class="li flat switch" style="gap:.75rem"><input type="checkbox" name="mode_kbc" ${String(u.mode_kbc) === '1' ? 'checked' : ''}><span><b>Mode Madrasah — Kurikulum Berbasis Cinta</b><br><span class="small muted">Integrasi Panca Cinta pada RPP & mapel madrasah.</span></span></label>
    <div class="row"><button class="btn btn-dark" type="submit">${ic('check', 'ic-s')}Simpan profil</button><span class="tiny muted">Peran: <b>${esc(u.peran || 'guru')}</b> · Paket: ${esc(u.paket || 'gratis')}</span></div></form>`;
  const f = el.querySelector('form');
  f.onsubmit = async (e) => {
    e.preventDefault();
    const p = { nama: f.nama.value.trim(), nip: f.nip.value.trim(), nuptk: f.nuptk.value.trim(), wa: f.wa.value.trim(), jenjang: f.jenjang.value, mapel_utama: f.mapel_utama.value.trim(), mode_kbc: f.mode_kbc.checked ? '1' : '0' };
    if (!p.nama) { toast('Nama wajib diisi.', 'err'); return; }
    if (cloud()) { try { const r = await api('profil.save', p); S.user = r.data; toast(r.message); } catch (er) { toast(er.message, 'err'); return; } }
    else { Object.assign(S.user, p); toast('Profil disimpan di perangkat.'); }
    profilBerubah();
  };
}

// ---------- Sekolah ----------
function tabSekolah(el, ctx) {
  const s = S.sekolah;
  if (!s || !s.nama) {
    el.innerHTML = `<div class="grid g2"><form class="card col gap-l" data-f="gabung"><h3>Gabung dengan sekolah</h3><p class="small muted">Minta kode undangan dari kepala sekolah.</p><input class="input" name="kode" placeholder="KODE" style="text-transform:uppercase;letter-spacing:.2em;font-weight:800" required><button class="btn btn-dark" type="submit">${ic('link', 'ic-s')}Gabung</button></form>
      <form class="card col gap-l" data-f="buat"><h3>Buat profil sekolah</h3><input class="input" name="nama" placeholder="Nama sekolah" required><label class="li flat switch" style="gap:.6rem"><input type="checkbox" name="sebagai_kepsek"><span class="small">Saya kepala sekolah</span></label><button class="btn btn-white" type="submit">${ic('school', 'ic-s')}Buat</button></form></div>`;
    if (!cloud()) { el.insertAdjacentHTML('afterbegin', `<div class="card card-sky small" style="margin-bottom:1rem">${ic('info', 'ic-s')} Fitur sekolah (telaah RPP oleh kepala sekolah, kode undangan) membutuhkan akun cloud.</div>`); el.querySelectorAll('button').forEach((b) => { b.disabled = true; }); return; }
    el.querySelectorAll('form').forEach((f) => { f.onsubmit = async (e) => { e.preventDefault(); try { const r = f.dataset.f === 'gabung' ? await api('sekolah.join', { kode: f.kode.value.trim() }) : await api('sekolah.save', { nama: f.nama.value.trim(), jenjang: (S.user || {}).jenjang, sebagai_kepsek: f.sebagai_kepsek.checked }); S.sekolah = r.data.sekolah; S.user = r.data.user; toast(r.message); profilBerubah(); } catch (er) { toast(er.message, 'err'); } }; });
    return;
  }
  const boleh = s.bolehKelola || isDemo();
  const F = (n, l, attr = '') => `<label class="field"><span>${l}</span><input class="input" name="${n}" value="${esc(s[n] || '')}" ${boleh ? '' : 'disabled'} ${attr}></label>`;
  el.innerHTML = `<div class="split"><form class="card col gap-l">
    <div class="row between"><h3>${esc(s.nama)}</h3>${boleh ? '' : '<span class="badge">Hanya kepala sekolah yang dapat mengubah</span>'}</div>
    <div class="grid g2">${F('nama', 'Nama sekolah', 'required')}${F('npsn', 'NPSN', 'inputmode="numeric"')}</div>
    <div class="grid g2"><label class="field"><span>Jenjang</span><select class="input" name="jenjang" ${boleh ? '' : 'disabled'}>${JENJANG.map((j) => `<option value="${j.k}" ${s.jenjang === j.k ? 'selected' : ''}>${j.label}</option>`).join('')}</select></label><label class="field"><span>Jenis</span><select class="input" name="jenis" ${boleh ? '' : 'disabled'}>${['Negeri', 'Swasta', 'Madrasah Negeri', 'Madrasah Swasta'].map((x) => `<option ${s.jenis === x ? 'selected' : ''}>${x}</option>`).join('')}</select></label></div>
    ${F('alamat', 'Alamat')}<div class="grid g2">${F('kota', 'Kota/Kabupaten')}${F('provinsi', 'Provinsi')}</div><div class="grid g2">${F('telp', 'Telepon')}${F('email', 'Email sekolah', 'type="email"')}</div>
    <div class="grid g2">${F('kepsek_nama', 'Nama kepala sekolah')}${F('kepsek_nip', 'NIP kepala sekolah')}</div>
    <label class="field"><span>Baris atas kop (instansi induk)</span><textarea class="input" name="kop_atas" rows="2" ${boleh ? '' : 'disabled'} placeholder="PEMERINTAH KABUPATEN …&#10;DINAS PENDIDIKAN">${esc(s.kop_atas || '')}</textarea></label>
    <div class="row row-wrap"><span class="avatar l" style="border-radius:12px;overflow:hidden;background:var(--surface-2)">${s.logo ? `<img src="${esc(s.logo)}" alt="Logo" style="width:100%;height:100%;object-fit:contain">` : ic('image')}</span>${boleh ? `<label class="btn btn-white btn-sm">${ic('upload', 'ic-s')}Unggah logo<input type="file" accept="image/png,image/jpeg,image/webp" hidden data-logo></label>${s.logo ? '<button class="btn btn-ghost btn-sm" type="button" data-hapus-logo>Hapus logo</button>' : ''}` : ''}</div>
    ${boleh ? `<button class="btn btn-dark" type="submit" style="align-self:flex-start">${ic('check', 'ic-s')}Simpan profil sekolah</button>` : ''}</form>
    <aside class="col gap-l">${s.kode_undangan ? `<div class="card col"><b>Kode undangan guru</b><div class="row"><span class="kpi-v" style="letter-spacing:.2em">${esc(s.kode_undangan)}</span><button class="btn btn-white btn-sm" data-salin="${esc(s.kode_undangan)}">${ic('copy', 'ic-s')}Salin</button></div><p class="tiny muted">Bagikan ke guru. Saat login pertama, guru memasukkan kode ini untuk bergabung.</p></div>` : ''}
      <div class="card card-flat small">${ic('file', 'ic-s')} Kop & logo dipakai otomatis pada RPP, rekap presensi, leger, jurnal, dan dokumen ber-QR.</div>
      ${cloud() && !isKepsek() ? `<button class="btn btn-ghost btn-sm" data-keluar-sekolah style="color:var(--red)">Keluar dari sekolah ini</button>` : ''}</aside></div>`;
  const f = el.querySelector('form');
  let logo = s.logo || '';
  const simpan = async (p) => {
    if (cloud()) { try { const r = await api('sekolah.save', p); S.sekolah = r.data.sekolah; S.user = r.data.user; toast(r.message); } catch (er) { toast(er.message, 'err'); return; } }
    else { Object.assign(S.sekolah, p); toast('Profil sekolah disimpan di perangkat.'); }
    profilBerubah();
  };
  f.onsubmit = (e) => { e.preventDefault(); const p = {}; ['nama', 'npsn', 'jenjang', 'jenis', 'alamat', 'kota', 'provinsi', 'telp', 'email', 'kepsek_nama', 'kepsek_nip', 'kop_atas'].forEach((k) => { p[k] = f[k].value.trim(); }); p.logo = logo; simpan(p); };
  const lf = el.querySelector('[data-logo]');
  if (lf) lf.onchange = async (e) => { const fl = e.target.files[0]; if (!fl) return; let d = await kecilkanGambar(fl, 160); if (d.length > 44000) d = await kecilkanGambar(fl, 110); logo = d; simpan({ logo }); };
  const hl = el.querySelector('[data-hapus-logo]'); if (hl) hl.onclick = () => { logo = ''; simpan({ logo: '' }); };
  el.querySelectorAll('[data-salin]').forEach((b) => { b.onclick = () => salin(b.dataset.salin); });
  const ks = el.querySelector('[data-keluar-sekolah]');
  if (ks) ks.onclick = async () => { if (!(await konfirmasi(`Keluar dari <b>${esc(s.nama)}</b>? Kepala sekolah tidak lagi dapat melihat RPP Anda.`, { bahaya: true, ya: 'Keluar' }))) return; try { const r = await api('sekolah.leave', {}); S.sekolah = null; S.user.sekolah_id = ''; toast(r.message); profilBerubah(); } catch (er) { toast(er.message, 'err'); } };
}

// ---------- Tampilan ----------
function tabTampilan(el, ctx) {
  const p = S.prefs;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
  const terpasang = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  el.innerHTML = `<div class="grid g2" style="max-width:980px"><div class="card col gap-l"><h3>Tampilan</h3>
    <div class="field"><span>Tema</span>${segmen([['terang', 'Terang'], ['gelap', 'Gelap'], ['sistem', 'Ikuti sistem']], p.tema, 'tema')}</div>
    <div class="field"><span>Ukuran huruf</span>${segmen([['0.9', 'Kecil'], ['1', 'Normal'], ['1.1', 'Besar'], ['1.2', 'Sangat besar']], String(p.huruf || 1), 'huruf')}</div>
    <div class="field"><span>Kertas cetak bawaan</span>${segmen([['A4', 'A4'], ['F4', 'F4 / Folio']], p.kertas || 'A4', 'kertas')}</div></div>
    <div class="card col gap-l"><h3>Pasang aplikasi</h3><p class="small muted">Pasang Master Teacher di layar utama HP/laptop: terbuka instan seperti aplikasi biasa dan tetap bisa dipakai tanpa internet.</p>
    <div id="pasang">${terpasang ? `<span class="badge b-gr">${ic('checkc', 'ic-s')} Sudah terpasang</span>` : window.__pasang ? `<button class="btn btn-primary" data-pasang>${ic('install', 'ic-s')}Pasang aplikasi</button>` : ios ? '<p class="small">Di iPhone/iPad: ketuk tombol <b>Bagikan</b> di Safari, lalu pilih <b>Tambah ke Layar Utama</b>.</p>' : '<p class="small muted">Tombol pasang muncul otomatis bila peramban mendukung (Chrome/Edge). Atau gunakan menu peramban → "Pasang aplikasi".</p>'}</div></div></div>`;
  delegasi(el, {
    tema: (b) => { simpanPrefs({ tema: b.dataset.tab }); terapkanTema(); ctx.rerender(); },
    huruf: (b) => { simpanPrefs({ huruf: Number(b.dataset.tab) }); terapkanTema(); ctx.rerender(); },
    kertas: (b) => { simpanPrefs({ kertas: b.dataset.tab }); ctx.rerender(); }
  });
  const pb = el.querySelector('[data-pasang]');
  if (pb) pb.onclick = async () => { const e = window.__pasang; if (!e) return; window.__pasang = null; e.prompt(); const { outcome } = await e.userChoice; if (outcome === 'accepted') toast('Memasang aplikasi…'); ctx.rerender(); };
  const dengar = () => ctx.rerender();
  document.addEventListener('mtp:pasang', dengar);
  ctx.cleanup = () => document.removeEventListener('mtp:pasang', dengar);
}

// ---------- Data & sinkron ----------
function tabData(el, ctx) {
  const jml = TABLES.map((t) => [t, db.count(t)]).filter(([, n]) => n);
  el.innerHTML = `<div class="split"><div class="col gap-l"><div class="card col gap-l"><div class="row between"><h3>Sinkronisasi</h3><span class="badge ${isDemo() ? 'b-yel' : syncState.pending ? 'b-mt' : 'b-gr'}">${isDemo() ? 'Mode demo' : syncState.pending ? syncState.pending + ' perubahan antre' : 'Tersinkron'}</span></div>
      <p class="small muted">${isDemo() ? 'Data demo hanya tersimpan di perangkat ini dan tidak dikirim ke server.' : `Semua perubahan disimpan di perangkat lebih dulu (bisa offline), lalu dikirim otomatis. Terakhir sinkron: <b>${waktuRelatif(syncState.last)}</b>.`}</p>
      ${cloud() ? `<div class="row row-wrap"><button class="btn btn-dark btn-sm" data-act="sync">${ic('refresh', 'ic-s')}Sinkron sekarang</button><button class="btn btn-white btn-sm" data-act="sync-penuh">${ic('download', 'ic-s')}Unduh ulang semua data</button></div>` : ''}
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Data di perangkat</th><th class="num">Jumlah</th></tr></thead><tbody>${jml.map(([t, n]) => `<tr><td>${t}</td><td class="num">${n}</td></tr>`).join('') || '<tr><td colspan="2" class="muted">Kosong</td></tr>'}</tbody></table></div></div></div>
    <aside class="col gap-l"><div class="card col gap-l"><h3>Cadangan</h3><p class="small muted">Unduh seluruh data Anda sebagai berkas JSON (hak akses data pribadi). Dapat dipulihkan di perangkat lain.</p>
      <button class="btn btn-white btn-sm" data-act="ekspor">${ic('download', 'ic-s')}Unduh cadangan (.json)</button>
      <label class="btn btn-white btn-sm">${ic('upload', 'ic-s')}Pulihkan / impor cadangan<input type="file" accept=".json,application/json" hidden data-impor></label>
      <p class="tiny muted">Impor juga menerima cadangan dari Master Teacher versi 1.x (kelas, siswa, nilai). Data yang sudah ada tidak terhapus.</p></div></aside></div>`;
  delegasi(el, {
    sync: async () => { await sinkron(); toast(syncState.status === 'ok' ? 'Tersinkron.' : syncState.err || 'Sinkron gagal.', syncState.status === 'ok' ? 'ok' : 'err'); ctx.rerender(); },
    'sync-penuh': async () => { if (!(await konfirmasi('Unduh ulang semua data dari server? Perubahan yang belum terkirim tetap dipertahankan.'))) return; await sinkron({ full: true }); toast('Data diunduh ulang.'); ctx.rerender(); },
    ekspor: () => unduh(new Blob([JSON.stringify(db.exportAll(), null, 1)], { type: 'application/json' }), `master-teacher-cadangan-${new Date().toISOString().slice(0, 10)}.json`)
  });
  el.querySelector('[data-impor]').onchange = async (e) => { const f = e.target.files[0]; if (!f) return; try { const n = imporCadangan(JSON.parse(await bacaFileTeks(f))); toast(`${n} baris data diimpor.`); ctx.rerender(); } catch (er) { toast('Berkas tidak dapat dibaca: ' + er.message, 'err'); } };
}
/** Impor cadangan v2 (format ekspor ini) atau v1.x (heuristik nama kunci umum). */
function imporCadangan(j) {
  let n = 0;
  if (j && j.data && j.app === 'master-teacher-planner') {
    TABLES.forEach((t) => (j.data[t] || []).forEach((r) => { if (!r.id) return; const f = Object.assign({}, r); ['id', 'owner', 'sekolah_id', 'created_at', 'updated_at', '_ft', '_local'].forEach((k) => delete f[k]); db.put(t, r.id, f); n++; }));
    return n;
  }
  // v1.x: cari larik kelas & siswa dengan nama kunci yang umum
  const cari = (o, re) => { for (const k of Object.keys(o || {})) if (re.test(k) && Array.isArray(o[k])) return o[k]; for (const k of Object.keys(o || {})) if (o[k] && typeof o[k] === 'object' && !Array.isArray(o[k])) { const x = cari(o[k], re); if (x) return x; } return null; };
  const kelas = cari(j, /^(kelas|classes|rombel|daftarKelas)$/i) || [];
  const siswa = cari(j, /^(siswa|students|murid|pesertaDidik|daftarSiswa)$/i) || [];
  const peta = {};
  kelas.forEach((k) => { const nama = k.nama || k.name || k.kelas || String(k); const id = 'V1K-' + String(k.id || nama).replace(/[^A-Za-z0-9_-]/g, '').slice(0, 40); peta[k.id || nama] = id; peta[nama] = id; db.put('Kelas', id, { nama, tingkat: Number(k.tingkat || k.level) || '', fase: k.fase || '', jenjang: (S.user || {}).jenjang || 'SD' }); n++; });
  siswa.forEach((s, i) => { const nama = s.nama || s.name || s.namaLengkap; if (!nama) return; let kid = peta[s.kelasId || s.kelas_id || s.kelas || s.classId || s.class]; if (!kid) { const kn = s.kelas || s.class || 'Impor v1'; kid = 'V1K-' + String(kn).replace(/[^A-Za-z0-9_-]/g, '').slice(0, 40); if (!db.get('Kelas', kid)) { db.put('Kelas', kid, { nama: kn }); n++; } peta[kn] = kid; } db.put('Siswa', 'V1S-' + String(s.id || i + '-' + nama).replace(/[^A-Za-z0-9_-]/g, '').slice(0, 50), { kelas_id: kid, nama, nisn: s.nisn || '', jk: s.jk || s.gender || '', hp_wali: s.hp_wali || s.hpOrtu || s.phone || '', no: s.no || i + 1, aktif: 1 }); n++; });
  if (!n) throw new Error('Format cadangan tidak dikenali.');
  return n;
}

// ---------- Keamanan & privasi ----------
function tabKeamanan(el, ctx) {
  el.innerHTML = `<div class="grid g2" style="max-width:1000px">
    ${cloud() ? `<div class="card col gap-l"><h3>Sesi masuk</h3><p class="small muted">Sesi berlaku hingga 30 hari di tiap perangkat. Jika HP hilang atau Anda memakai komputer bersama, keluarkan semua perangkat.</p><button class="btn btn-white btn-sm" data-act="logout-semua" style="align-self:flex-start">${ic('logout', 'ic-s')}Keluar dari semua perangkat</button></div>` : ''}
    ${isKepsek() && cloud() ? `<form class="card col gap-l" data-pin><h3>PIN tanda tangan elektronik</h3><p class="small muted">6 digit, dipakai saat menyetujui RPP & menandatangani dokumen. Disimpan sebagai hash di server — tidak dapat dilihat siapa pun.</p><div class="grid g2"><label class="field"><span>PIN lama (jika ada)</span><input class="input" type="password" name="pin_lama" inputmode="numeric" maxlength="6" autocomplete="off"></label><label class="field"><span>PIN baru</span><input class="input" type="password" name="pin" inputmode="numeric" maxlength="6" required autocomplete="new-password"></label></div><button class="btn btn-dark btn-sm" type="submit" style="align-self:flex-start">${ic('key', 'ic-s')}Simpan PIN</button></form>` : ''}
    <div class="card col gap-l"><h3>Privasi data (UU PDP 27/2022)</h3><ul class="small muted" style="margin:0;padding-left:1.1rem"><li>Data siswa hanya terlihat oleh Anda dan kepala sekolah Anda.</li><li>Nama siswa diganti kode anonim sebelum dikirim ke AI.</li><li>Halaman verifikasi QR tidak menampilkan data pribadi siswa.</li><li>Anda dapat mengunduh atau menghapus seluruh data kapan saja.</li></ul>
      <button class="btn btn-white btn-sm" data-act="unduh-data" style="align-self:flex-start">${ic('download', 'ic-s')}Unduh semua data saya</button></div>
    <div class="card col gap-l" style="border:1.5px solid var(--red-bg)"><h3 style="color:var(--red)">Hapus akun</h3><p class="small muted">Menghapus akun beserta seluruh kelas, siswa, RPP, dan nilai Anda dari server. Tidak dapat dibatalkan.</p><button class="btn btn-danger btn-sm" data-act="hapus-akun" style="align-self:flex-start">${ic('trash', 'ic-s')}Hapus akun saya</button></div></div>`;
  delegasi(el, {
    'logout-semua': async () => { if (await konfirmasi('Keluar dari semua perangkat, termasuk perangkat ini?', { ya: 'Keluar semua' })) document.dispatchEvent(new CustomEvent('mtp:logout', { detail: { semua: true, tanya: false } })); },
    'unduh-data': () => unduh(new Blob([JSON.stringify(db.exportAll(), null, 1)], { type: 'application/json' }), 'data-saya-master-teacher.json'),
    'hapus-akun': async () => {
      const r = await modal({ title: 'Hapus akun permanen', body: `<p class="small" style="margin-bottom:.75rem">Ketik <b>HAPUS AKUN SAYA</b> untuk konfirmasi. Unduh cadangan terlebih dahulu bila diperlukan.</p><input class="input" name="k" autocomplete="off">`, actions: [{ label: 'Batal', value: null, cls: 'btn-ghost' }, { label: 'Hapus permanen', value: 'ok', cls: 'btn-danger', validate: (f) => (f.k !== 'HAPUS AKUN SAYA' ? 'Teks konfirmasi tidak sesuai.' : '') }] });
      if (r.value !== 'ok') return;
      if (isDemo() || !cloud()) { await db.wipe(); document.dispatchEvent(new CustomEvent('mtp:logout', { detail: { tanya: false } })); return; }
      try { await api('privasi.hapus', { konfirmasi: r.form.k }); const ns = db.ns; await db.wipe(ns); toast('Akun dan data Anda telah dihapus.'); document.dispatchEvent(new CustomEvent('mtp:logout', { detail: { tanya: false } })); } catch (e) { toast(e.message, 'err'); }
    }
  });
  const pf = el.querySelector('[data-pin]');
  if (pf) pf.onsubmit = async (e) => { e.preventDefault(); try { const r = await api('doc.pin.set', { pin: pf.pin.value, pin_lama: pf.pin_lama.value }); toast(r.message); pf.reset(); } catch (er) { toast(er.message, 'err'); } };
}

// ---------- Admin ----------
async function tabAdmin(el, ctx) {
  el.innerHTML = skeleton(3);
  const [st, us] = await Promise.all([api('admin.status', {}), api('admin.users', {})]);
  const d = st.data;
  const P = d.pengaturan || {};
  const R = d.rahasia || {};
  const teks = (k, l, hint = '') => `<label class="field"><span>${l}</span><input class="input" name="${k}" value="${esc(P[k] || '')}">${hint ? `<span class="hint">${hint}</span>` : ''}</label>`;
  const yaTidak = (k, l) => `<label class="field"><span>${l}</span><select class="input" name="${k}"><option ${P[k] === 'YA' ? 'selected' : ''}>YA</option><option ${P[k] !== 'YA' ? 'selected' : ''}>TIDAK</option></select></label>`;
  const rahasia = (k, l, hint) => `<label class="field"><span>${l} ${R[k] && R[k].ada ? '<span class="badge b-gr">tersimpan</span>' : '<span class="badge">kosong</span>'}</span><input class="input" name="${k}" placeholder="${esc(R[k] && R[k].ada ? R[k].tampil : 'belum diisi')}" autocomplete="off"><span class="hint">${hint}</span></label>`;
  el.innerHTML = `<div class="grid g4" style="margin-bottom:1rem">${[['Versi backend', d.versi], ['Pengguna', d.statistik.pengguna], ['Sekolah', d.statistik.sekolah], ['Antrean notifikasi', d.statistik.antrianNotif ? 'Ada' : 'Kosong']].map(([l, v]) => `<div class="card card-s"><span class="small bold muted">${l}</span><div class="kpi-v" style="font-size:1.4rem">${esc(v)}</div></div>`).join('')}</div>
  <div class="split"><div class="col gap-l">
    <form class="card col gap-l" data-f="atur"><h3>Pengaturan aplikasi</h3><div class="grid g2">${teks('NAMA_APLIKASI', 'Nama aplikasi')}${teks('APP_URL', 'Alamat frontend (GitHub Pages)', 'Dipakai di tautan notifikasi & QR, mis. https://nama.github.io/master-teacher/')}</div>
      <div class="grid g3">${teks('AI_KUOTA_HARIAN', 'Kuota AI/guru/hari')}${teks('SESI_JAM', 'Masa sesi (jam)')}${yaTidak('PENDAFTARAN_TERBUKA', 'Pendaftaran terbuka')}</div>
      <div class="grid g3">${yaTidak('NOTIF_WA_AKTIF', 'Notifikasi WA aktif')}${yaTidak('NOTIF_EMAIL_AKTIF', 'Notifikasi email aktif')}${teks('DOMAIN_EMAIL_DIIZINKAN', 'Batasi domain email', 'mis. sekolah.sch.id (kosong = semua)')}</div>
      <div class="grid g2">${teks('BLAST_BATCH', 'Ukuran batch blast (10/20/50)')}${teks('BLAST_JEDA_DETIK', 'Jeda antar-batch (detik)')}</div>
      <button class="btn btn-dark btn-sm" type="submit" style="align-self:flex-start">${ic('check', 'ic-s')}Simpan pengaturan</button></form>
    <form class="card col gap-l" data-f="rahasia"><h3>${ic('lock', 'ic-s')} Kredensial (Script Properties)</h3><p class="small muted">Disimpan hanya di Script Properties server, tidak pernah di spreadsheet atau browser. Kosongkan kolom = tidak berubah; ketik <code>__HAPUS__</code> untuk menghapus.</p>
      <div class="grid g2"><label class="field"><span>Penyedia AI</span><select class="input" name="AI_PROVIDER"><option value="">(tidak berubah: ${esc((R.AI_PROVIDER && R.AI_PROVIDER.tampil) || 'gemini')})</option><option value="gemini">Google Gemini</option><option value="openai">OpenAI</option><option value="anthropic">Anthropic Claude</option></select></label>${rahasia('AI_MODEL', 'Model AI (opsional)', 'Kosong = model bawaan penyedia')}</div>
      ${rahasia('AI_API_KEY', 'API key AI', 'Gemini: aistudio.google.com · OpenAI: platform.openai.com · Anthropic: console.anthropic.com')}
      ${rahasia('FONNTE_TOKEN', 'Token WhatsApp Fonnte', 'fonnte.com → Device → Token')}
      <div class="grid g2">${rahasia('GOOGLE_CLIENT_ID', 'Google OAuth Client ID', 'Untuk tombol "Masuk dengan Google"')}${rahasia('ADMIN_EMAILS', 'Email admin (pisah koma)', 'Otomatis menjadi admin saat login')}</div>
      <button class="btn btn-dark btn-sm" type="submit" style="align-self:flex-start">${ic('key', 'ic-s')}Simpan kredensial</button></form>
    ${panelMigrasi()}
  </div>
  <aside class="card"><h3 style="margin-bottom:.75rem">Pengguna (${(us.data || []).length})</h3><div class="list" style="max-height:70vh;overflow:auto">${(us.data || []).map((u) => `<div class="li flat" style="flex-direction:column;align-items:stretch;gap:.35rem"><div class="row between"><b class="truncate">${esc(u.nama || u.email)}</b><span class="badge ${u.status === 'nonaktif' ? 'b-red' : 'b-gr'}">${esc(u.status || 'aktif')}</span></div><span class="tiny muted truncate">${esc(u.email)}${u.sekolah_nama ? ' · ' + esc(u.sekolah_nama) : ''} · login ${u.login_terakhir ? fmtTgl(u.login_terakhir, 'pendek') : '-'}</span>
    <div class="row"><select class="input" data-peran="${esc(u.id)}" style="min-height:34px;padding:.2rem .5rem">${['guru', 'kepsek', 'admin'].map((p) => `<option ${u.peran === p ? 'selected' : ''}>${p}</option>`).join('')}</select><select class="input" data-paket="${esc(u.id)}" style="min-height:34px;padding:.2rem .5rem">${['gratis', 'pro'].map((p) => `<option ${u.paket === p ? 'selected' : ''}>${p}</option>`).join('')}</select><button class="btn btn-ghost btn-xs" data-status="${esc(u.id)}" data-v="${u.status === 'nonaktif' ? 'aktif' : 'nonaktif'}">${u.status === 'nonaktif' ? 'Aktifkan' : 'Nonaktifkan'}</button></div></div>`).join('')}</div>
    <p class="tiny muted" style="margin-top:.75rem">Spreadsheet database: <a href="${esc(d.spreadsheetUrl)}" target="_blank" rel="noopener">buka</a> (hanya untuk pemilik akun Google).</p></aside></div>`;
  el.querySelector('[data-f="atur"]').onsubmit = async (e) => { e.preventDefault(); const f = e.target; const o = {}; Array.from(f.elements).forEach((x) => { if (x.name) o[x.name] = x.value.trim(); }); try { const r = await api('admin.settings.save', o); toast(r.message); } catch (er) { toast(er.message, 'err'); } };
  el.querySelector('[data-f="rahasia"]').onsubmit = async (e) => { e.preventDefault(); const f = e.target; const o = {}; Array.from(f.elements).forEach((x) => { if (x.name && x.value.trim()) o[x.name] = x.value.trim(); }); if (!Object.keys(o).length) { toast('Tidak ada yang diubah.', 'info'); return; } try { const r = await api('admin.secrets.save', o); toast(r.message); if (o.AI_API_KEY) S.aiAktif = o.AI_API_KEY !== '__HAPUS__'; simpanSesi(); ctx.rerender(); } catch (er) { toast(er.message, 'err'); } };
  const ubahUser = async (id, p) => { try { const r = await api('admin.user.update', Object.assign({ id }, p)); toast(r.message); } catch (er) { toast(er.message, 'err'); } };
  el.querySelectorAll('[data-peran]').forEach((s) => { s.onchange = () => ubahUser(s.dataset.peran, { peran: s.value }); });
  el.querySelectorAll('[data-paket]').forEach((s) => { s.onchange = () => ubahUser(s.dataset.paket, { paket: s.value }); });
  el.querySelectorAll('[data-status]').forEach((b) => { b.onclick = async () => { await ubahUser(b.dataset.status, { status: b.dataset.v }); ctx.rerender(); }; });
  pasangMigrasi(el);
}

function panelMigrasi() {
  return `<div class="card col gap-l" id="migrasi"><h3>${ic('database', 'ic-s')} Migrasi dari spreadsheet lama (v1.x)</h3>
    <p class="small muted">Spreadsheet lama hanya <b>dibaca</b>, tidak diubah. Jalankan "Pindai" (simulasi) dulu; impor aman diulang tanpa data ganda — cocok untuk sinkron ulang sebelum peralihan.</p>
    <div class="grid g2"><label class="field"><span>ID / URL spreadsheet lama</span><input class="input" name="source" placeholder="https://docs.google.com/spreadsheets/d/…"></label><label class="field"><span>Email guru pemilik data</span><input class="input" type="email" name="owner_email" placeholder="guru@sekolah.sch.id"></label></div>
    <button class="btn btn-white btn-sm" data-mig="buka" style="align-self:flex-start">${ic('search', 'ic-s')}Buka spreadsheet</button><div data-mig-isi></div></div>`;
}
function pasangMigrasi(root) {
  const box = root.querySelector('#migrasi');
  const isi = box.querySelector('[data-mig-isi]');
  const nilai = (n) => box.querySelector(`[name=${n}]`).value.trim();
  let pemetaan = null;
  box.querySelector('[data-mig="buka"]').onclick = async () => {
    try {
      const r = await api('migrasi.scan', { source: nilai('source') });
      isi.innerHTML = `<p class="small"><b>${esc(r.data.nama)}</b></p><div class="grid g2"><label class="field"><span>Sheet sumber</span><select class="input" name="sheet">${r.data.sheets.map((s) => `<option value="${esc(s.nama)}">${esc(s.nama)} (${s.baris} baris)</option>`).join('')}</select></label><label class="field"><span>Tabel tujuan</span><select class="input" name="target">${r.data.target.map((t) => `<option>${t}</option>`).join('')}</select></label></div><button class="btn btn-white btn-sm" data-mig="pindai">${ic('eye', 'ic-s')}Pindai (simulasi)</button><div data-mig-hasil></div>`;
      isi.querySelector('[data-mig="pindai"]').onclick = pindai;
    } catch (e) { toast(e.message, 'err'); }
  };
  async function pindai() {
    try {
      const r = await api('migrasi.scan', { source: nilai('source'), sheet: isi.querySelector('[name=sheet]').value, target: isi.querySelector('[name=target]').value, owner_email: nilai('owner_email'), pemetaan: pemetaan || undefined });
      const d = r.data; pemetaan = d.pemetaan;
      const h = isi.querySelector('[data-mig-hasil]');
      h.innerHTML = `<div class="tbl-wrap" style="margin-top:.75rem"><table class="tbl"><thead><tr><th>Kolom tujuan</th><th>Kolom sumber</th></tr></thead><tbody>${d.kolomTarget.map((k) => `<tr><td>${esc(k)}</td><td><select class="input" data-map="${esc(k)}" style="min-height:34px"><option value="">—</option>${d.header.map((x) => `<option ${d.pemetaan[k] === x ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select></td></tr>`).join('')}</tbody></table></div>
        <p class="small" style="margin:.5rem 0">Simulasi: <b>${d.hasil.inserted}</b> baru · <b>${d.hasil.updated}</b> diperbarui · <b>${d.hasil.skipped}</b> dilewati dari ${d.hasil.total} baris.</p>
        <div class="row"><button class="btn btn-white btn-sm" data-mig="ulang">Pindai ulang dengan pemetaan ini</button><button class="btn btn-dark btn-sm" data-mig="jalan">${ic('play', 'ic-s')}Jalankan impor</button></div>`;
      const ambilMap = () => { const m = {}; h.querySelectorAll('[data-map]').forEach((s) => { if (s.value) m[s.dataset.map] = s.value; }); return m; };
      h.querySelector('[data-mig="ulang"]').onclick = () => { pemetaan = ambilMap(); pindai(); };
      h.querySelector('[data-mig="jalan"]').onclick = async () => {
        if (!(await konfirmasi('Jalankan impor ke database baru? Spreadsheet lama tidak diubah.', { ya: 'Impor' }))) return;
        try { const x = await api('migrasi.run', { source: nilai('source'), sheet: isi.querySelector('[name=sheet]').value, target: isi.querySelector('[name=target]').value, owner_email: nilai('owner_email'), pemetaan: ambilMap() }); toast(x.message, 'ok', 6000); } catch (e) { toast(e.message, 'err'); }
      };
    } catch (e) { toast(e.message, 'err'); }
  }
}

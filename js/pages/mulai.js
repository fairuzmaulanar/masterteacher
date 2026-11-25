// Onboarding 3 langkah: profil guru → sekolah → kelas pertama. Target selesai < 3 menit.
import { ic } from '../core/icons.js';
import { esc, toast, uid } from '../core/util.js';
import { S, simpanSesi, isDemo, simpanPrefs, sesiTab } from '../core/state.js';
import { api } from '../core/api.js';
import { db } from '../core/store.js';
import { JENJANG, MAPEL, faseDari, tahunAjaran, semesterSekarang } from '../core/kurikulum.js';
import { pergi } from '../core/router.js';

export default {
  title: 'Mulai',
  async render(el) {
    const u = S.user || {};
    const st = { langkah: 1, jenjang: u.jenjang || 'SD', mapel: [] };
    const gambar = () => {
      el.innerHTML = `<div class="auth-form" style="min-height:100dvh;align-items:start;padding-top:4vh"><div class="auth-card col gap-l" style="width:min(620px,100%)">
        <div class="row between"><div class="row"><span class="brand-logo">${ic('sun2', 'ic-l')}</span><b style="color:var(--navy)">Siapkan ruang kerja Anda</b></div><span class="small muted">Langkah ${st.langkah} dari 3</span></div>
        <div class="steps">${[1, 2, 3].map((i) => `<i class="${i <= st.langkah ? 'on' : ''}"></i>`).join('')}</div>
        <div class="card">${[langkah1, langkah2, langkah3][st.langkah - 1](u, st)}</div></div></div>`;
      pasang();
    };
    const pasang = () => {
      const f = el.querySelector('form');
      el.querySelectorAll('[data-jenjang]').forEach((b) => { b.onclick = () => { st.jenjang = b.dataset.jenjang; st.mapel = []; gambar(); }; });
      el.querySelectorAll('[data-mapel]').forEach((b) => { b.onclick = () => { const m = b.dataset.mapel; st.mapel = st.mapel.includes(m) ? st.mapel.filter((x) => x !== m) : st.mapel.concat(m); b.setAttribute('aria-pressed', st.mapel.includes(m)); }; });
      const lewat = el.querySelector('[data-lewati]');
      if (lewat) lewat.onclick = () => { st.langkah++; gambar(); };
      const kembali = el.querySelector('[data-kembali]');
      if (kembali) kembali.onclick = () => { st.langkah--; gambar(); };
      el.querySelectorAll('[data-sek]').forEach((b) => { b.onclick = () => { el.querySelectorAll('[data-sekpanel]').forEach((p) => p.classList.toggle('hide', p.dataset.sekpanel !== b.dataset.sek)); el.querySelectorAll('[data-sek]').forEach((x) => x.setAttribute('aria-selected', x === b)); }; });
      if (!f) return;
      f.onsubmit = async (e) => {
        e.preventDefault();
        const b = e.submitter || f.querySelector('[type=submit]');
        b.disabled = true;
        try {
          if (st.langkah === 1) await simpanProfil(f, st);
          else if (st.langkah === 2) await simpanSekolah(f, b.value);
          else { buatKelas(f, st); await selesai(); return; }
          st.langkah++; gambar();
        } catch (err) { toast(err.message, 'err'); b.disabled = false; }
      };
    };
    gambar();
  }
};

function langkah1(u, st) {
  return `<form class="col gap-l">
    <div><h3>Kenalan dulu, Bapak/Ibu</h3><p class="small muted">Dipakai di kop RPP, tanda tangan dokumen, dan sapaan harian.</p></div>
    <label class="field"><span>Nama lengkap & gelar</span><input class="input" name="nama" value="${esc(u.nama || '')}" required placeholder="Rina Saraswati, S.Pd."></label>
    <div class="grid g2"><label class="field"><span>NIP <span class="muted">(opsional)</span></span><input class="input" name="nip" value="${esc(u.nip || '')}" inputmode="numeric"></label>
    <label class="field"><span>No. WhatsApp <span class="muted">(opsional)</span></span><input class="input" name="wa" value="${esc(u.wa || '')}" inputmode="tel" placeholder="08xxxxxxxxxx"></label></div>
    <div class="field"><span>Jenjang mengajar</span><div class="chips">${JENJANG.map((j) => `<button type="button" class="chip ${st.jenjang === j.k ? 'on' : ''}" data-jenjang="${j.k}">${j.label}</button>`).join('')}</div></div>
    <label class="field"><span>Mata pelajaran / peran utama</span><input class="input" name="mapel_utama" value="${esc(u.mapel_utama || '')}" placeholder="${st.jenjang === 'SD' ? 'Guru Kelas' : 'mis. Matematika'}"></label>
    <label class="row switch" style="gap:.75rem"><input type="checkbox" name="mode_kbc" ${String(u.mode_kbc) === '1' ? 'checked' : ''}><span><b>Saya mengajar di madrasah</b><br><span class="small muted">Aktifkan integrasi Kurikulum Berbasis Cinta (KBC) di RPP.</span></span></label>
    <div class="row between"><span></span><button class="btn btn-primary" type="submit">Lanjut ${ic('arrowr', 'ic-s')}</button></div>
  </form>`;
}
function langkah2() {
  const s = S.sekolah;
  if (s && s.nama) {
    return `<form class="col gap-l"><div><h3>Sekolah Anda</h3><p class="small muted">Akun Anda sudah terhubung dengan sekolah.</p></div>
      <div class="li flat"><span class="icon-box" style="background:var(--surface)">${ic('school')}</span><b class="grow">${esc(s.nama)}</b><span class="badge b-gr">Terhubung</span></div>
      <div class="row between"><button class="btn btn-ghost" type="button" data-kembali>${ic('arrowl', 'ic-s')}Kembali</button><button class="btn btn-primary" type="submit" value="lanjut">Lanjut ${ic('arrowr', 'ic-s')}</button></div></form>`;
  }
  return `<form class="col gap-l" novalidate>
    <div><h3>Hubungkan dengan sekolah</h3><p class="small muted">Kepala sekolah dapat menelaah RPP dan melihat ringkasan sekolah. Anda bisa melewati langkah ini.</p></div>
    <div class="seg" role="tablist"><button type="button" role="tab" data-sek="gabung" aria-selected="true">Punya kode undangan</button><button type="button" role="tab" data-sek="buat" aria-selected="false">Buat profil sekolah</button></div>
    <div data-sekpanel="gabung" class="col gap-l"><label class="field"><span>Kode undangan dari kepala sekolah</span><input class="input" name="kode" placeholder="mis. K7QX2M" style="text-transform:uppercase;letter-spacing:.2em;font-weight:800" maxlength="12"></label>
      <button class="btn btn-dark" type="submit" value="gabung">${ic('link', 'ic-s')}Gabung</button></div>
    <div data-sekpanel="buat" class="col gap-l hide">
      <label class="field"><span>Nama sekolah</span><input class="input" name="nama" placeholder="SD Negeri 01 Pagi"></label>
      <div class="grid g2"><label class="field"><span>NPSN</span><input class="input" name="npsn" inputmode="numeric"></label><label class="field"><span>Kota/Kabupaten</span><input class="input" name="kota"></label></div>
      <label class="field"><span>Alamat</span><input class="input" name="alamat"></label>
      <label class="row switch" style="gap:.75rem"><input type="checkbox" name="sebagai_kepsek"><span><b>Saya kepala sekolah</b><br><span class="small muted">Anda akan mendapat portal supervisi & kode undangan untuk guru.</span></span></label>
      <button class="btn btn-dark" type="submit" value="buat">${ic('school', 'ic-s')}Simpan profil sekolah</button></div>
    <div class="row between"><button class="btn btn-ghost" type="button" data-kembali>${ic('arrowl', 'ic-s')}Kembali</button><button class="btn btn-ghost" type="button" data-lewati>Lewati</button></div>
  </form>`;
}
function langkah3(u, st) {
  const daftar = MAPEL[st.jenjang] || MAPEL.SD;
  const tingkat = (JENJANG.find((j) => j.k === st.jenjang) || JENJANG[0]).tingkat;
  return `<form class="col gap-l">
    <div><h3>Kelas pertama Anda</h3><p class="small muted">Tempel daftar nama siswa — satu nama per baris (bisa salin dari Excel/Dapodik). Bisa diubah kapan saja.</p></div>
    <div class="grid g2"><label class="field"><span>Nama kelas / rombel</span><input class="input" name="kelas" required placeholder="mis. 4-B"></label>
    <label class="field"><span>Tingkat</span><select class="input" name="tingkat">${tingkat.map((t) => `<option value="${t}">Kelas ${t} (Fase ${faseDari(t)})</option>`).join('')}</select></label></div>
    <div class="field"><span>Mata pelajaran yang Anda ajar di kelas ini</span><div class="chips row-wrap" style="flex-wrap:wrap">${daftar.map((m) => `<button type="button" class="chip" data-mapel="${esc(m)}" aria-pressed="false">${esc(m)}</button>`).join('')}</div></div>
    <label class="field"><span>Daftar siswa</span><textarea class="input" name="siswa" rows="7" placeholder="Adinda Putri\nAhmad Zaki\nAlya Ramadhani"></textarea><span class="hint">Format lanjutan: Nama;NISN;L/P;HP wali (pisahkan titik koma).</span></label>
    <div class="row between"><button class="btn btn-ghost" type="button" data-kembali>${ic('arrowl', 'ic-s')}Kembali</button><button class="btn btn-primary" type="submit">${ic('check', 'ic-s')}Selesai & mulai</button></div>
  </form>`;
}

async function simpanProfil(f, st) {
  const p = { nama: f.nama.value.trim(), nip: f.nip.value.trim(), wa: f.wa.value.trim(), jenjang: st.jenjang, mapel_utama: f.mapel_utama.value.trim(), mode_kbc: f.mode_kbc.checked ? '1' : '0' };
  if (!p.nama) throw new Error('Nama wajib diisi.');
  Object.assign(S.user, p);
  simpanSesi();
  if (!isDemo()) { try { const r = await api('profil.save', p); S.user = r.data; simpanSesi(); } catch (e) { if (e.code !== 'NET' && e.code !== 'TIMEOUT') throw e; } }
}
async function simpanSekolah(f, aksi) {
  if (aksi === 'lanjut') return;
  if (aksi === 'gabung') {
    const kode = f.kode.value.trim();
    if (!kode) throw new Error('Isi kode undangan atau pilih "Lewati".');
    const r = await api('sekolah.join', { kode });
    S.sekolah = r.data.sekolah; S.user = r.data.user; simpanSesi(); toast(r.message);
  } else {
    if (!f.nama.value.trim()) throw new Error('Nama sekolah wajib diisi.');
    const r = await api('sekolah.save', { nama: f.nama.value.trim(), npsn: f.npsn.value.trim(), kota: f.kota.value.trim(), alamat: f.alamat.value.trim(), jenjang: S.user.jenjang, sebagai_kepsek: f.sebagai_kepsek.checked });
    S.sekolah = r.data.sekolah; S.user = r.data.user; simpanSesi(); toast(r.message);
  }
}
function buatKelas(f, st) {
  const nama = f.kelas.value.trim();
  if (!nama) throw new Error('Nama kelas wajib diisi.');
  const tingkat = Number(f.tingkat.value);
  const kid = uid('K');
  db.put('Kelas', kid, { nama, jenjang: st.jenjang, fase: faseDari(tingkat), tingkat, tahun_ajaran: tahunAjaran(), semester: semesterSekarang(), wali: S.user.nama, urutan: db.count('Kelas') + 1 });
  (st.mapel.length ? st.mapel : [S.user.mapel_utama && S.user.mapel_utama !== 'Guru Kelas' ? S.user.mapel_utama : 'Matematika']).forEach((m) => db.put('Mapel', uid('M'), { kelas_id: kid, nama: m, jp: 4, kktp: 75, bobot: { formatif: 40, sumatif_lm: 40, sumatif_as: 20 } }));
  f.siswa.value.split(/\r?\n/).map((s) => s.trim()).filter(Boolean).forEach((baris, i) => {
    const [nm, nisn, jk, hp] = baris.split(/[;\t]/).map((x) => (x || '').trim());
    db.put('Siswa', uid('S'), { kelas_id: kid, no: i + 1, nama: nm, nisn: nisn || '', jk: /^p/i.test(jk || '') ? 'P' : jk ? 'L' : '', hp_wali: hp || '', aktif: 1 });
  });
  simpanPrefs({ kelas: kid });
}
async function selesai() {
  S.user.onboarded = '1';
  simpanSesi();
  sesiTab.set('mtp_lewati_mulai', '1');
  if (!isDemo()) { try { const r = await api('profil.save', { onboarded: '1' }); S.user = r.data; simpanSesi(); } catch (e) { /* dicoba lagi saat profil disimpan */ } }
  toast('Ruang kerja siap. Selamat mengajar!');
  document.dispatchEvent(new CustomEvent('mtp:profil'));
  pergi('/hari-ini');
}

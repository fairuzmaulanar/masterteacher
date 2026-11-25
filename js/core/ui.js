// Kerangka aplikasi (sidebar, topbar, navigasi bawah, FAB) + komponen UI bersama.
import { ic } from './icons.js';
import { esc, initials, modal, toast, waktuRelatif, today, fmtTgl } from './util.js';
import { S, isKepsek, isDemo, simpanPrefs, lokal } from './state.js';
import { db } from './store.js';
import { onSync, sinkron, syncState } from './sync.js';
import { tahunAjaran, semesterSekarang } from './kurikulum.js';
import { pergi } from './router.js';

const MENU_GURU = [
  { h: 'Menu Utama' },
  { k: 'hari-ini', href: '#/hari-ini', ic: 'grid', l: 'Hari Ini' },
  { k: 'rencana', href: '#/rencana', ic: 'book', l: 'Rencana Ajar' },
  { k: 'materi', href: '#/materi', ic: 'image', l: 'Materi & Media' },
  { k: 'soal', href: '#/soal', ic: 'clipboard', l: 'Bank Soal & Asesmen' },
  { k: 'nilai', href: '#/nilai', ic: 'chart', l: 'Nilai & Rapor' },
  { k: 'jadwal', href: '#/jadwal', ic: 'calendar', l: 'Jadwal & Jurnal' },
  { h: 'Pengelolaan Kelas' },
  { k: 'kelas', href: '#/kelas', ic: 'usercheck', l: 'Kelas & Presensi' },
  { k: 'tugas', href: '#/tugas', ic: 'pen', l: 'Koreksi & Tugas' },
  { k: 'komunikasi', href: '#/komunikasi', ic: 'message', l: 'Komunikasi Wali' },
  { h: 'Kecerdasan' },
  { k: 'ai', href: '#/ai', ic: 'sparkles', l: 'Co-Pilot AI' }
];
const MENU_KEPSEK = [
  { h: 'Supervisi & Manajemen' },
  { k: 'sekolah', href: '#/sekolah', ic: 'grid', l: 'Ringkasan Sekolah' },
  { k: 'telaah', href: '#/sekolah?tab=telaah', ic: 'clipboard', l: 'Telaah & Persetujuan RPP', cnt: true },
  { k: 'sekolah-guru', href: '#/sekolah?tab=guru', ic: 'users', l: 'Guru & Kode Undangan' },
  { k: 'sekolah-dok', href: '#/sekolah?tab=dokumen', ic: 'qr', l: 'Dokumen Terbit' }
];

let shellEl = null;

function navHtml(menu) {
  return menu.map((m) => m.h
    ? `<div class="nav-h">${esc(m.h)}</div>`
    : `<a href="${m.href}" data-nav="${m.k}">${ic(m.ic)}<span>${esc(m.l)}</span>${m.cnt ? '<span class="cnt hide" data-cnt-telaah></span>' : ''}</a>`).join('');
}

export function renderShell() {
  const app = document.getElementById('app');
  if (shellEl && app.contains(shellEl)) return shellEl.querySelector('#host');
  const kepsek = isKepsek() && S.sekolah;
  const sek = S.sekolah;
  app.innerHTML = `
  <div class="app" id="shell">
    <aside class="sidebar ${kepsek ? 'navy' : ''}" aria-label="Navigasi utama">
      <a class="brand" href="#/hari-ini">
        <span class="brand-logo">${ic('sun2', 'ic-l')}</span>
        <span><b>Master Teacher</b><small>${kepsek ? 'Portal Supervisi & Kepemimpinan' : 'Ruang Kerja Guru'}</small></span>
      </a>
      <nav class="nav">${kepsek ? navHtml(MENU_KEPSEK) + navHtml([{ h: 'Ruang Kerja Guru' }].concat(MENU_GURU.filter((m) => !m.h))) : navHtml(MENU_GURU)}
        <div class="nav-h">Akun</div>
        <a href="#/pengaturan" data-nav="pengaturan">${ic('gear')}<span>Pengaturan</span></a>
      </nav>
      <div class="side-foot">
        <div class="netbox" id="netbox"></div>
        <div class="usercard">
          <span class="avatar" style="background:var(--yellow);color:#12245B">${esc(initials(S.user && S.user.nama))}</span>
          <span class="grow"><b class="truncate" style="display:block;font-size:.8125rem">${esc((S.user && S.user.nama) || '-')}</b><span class="tiny muted truncate" style="display:block">${esc(peranLabel())}${sek ? ' · ' + esc(sek.nama) : ''}</span></span>
          <a class="btn btn-ghost btn-icon btn-sm" href="#/pengaturan" aria-label="Pengaturan">${ic('gear', 'ic-s')}</a>
        </div>
      </div>
    </aside>
    <div class="main">
      <header class="topbar">
        <span class="tb-title" id="tbTitle">Master Teacher</span>
        <button class="syncchip" id="syncChip" type="button" title="Status sinkron — ketuk untuk sinkron sekarang"></button>
        <span class="small muted tb-wide hide-m">Tahun Ajaran ${tahunAjaran()} • Semester ${semesterSekarang() === 1 ? 'Ganjil' : 'Genap'}</span>
        <span class="grow"></span>
        <button class="btn btn-primary btn-sm hide-m" type="button" data-quick>${ic('plus', 'ic-s')}Aksi Cepat</button>
        <button class="btn btn-ghost btn-icon btn-sm" type="button" id="btnBell" aria-label="Pemberitahuan" style="position:relative">${ic('bell')}<span id="bellDot" class="hide" style="position:absolute;top:8px;right:9px;width:8px;height:8px;border-radius:50%;background:#DC2626"></span></button>
        <a class="avatar" href="#/pengaturan" aria-label="Profil" style="background:#12245B;color:#fff">${esc(initials(S.user && S.user.nama))}</a>
      </header>
      <div class="offline-bar hide" id="offbar">${ic('wifioff', 'ic-s')}Anda sedang offline. Semua perubahan tetap tersimpan di perangkat dan akan disinkronkan otomatis.</div>
      ${isDemo() ? `<div class="offline-bar" style="background:var(--yellow-soft);color:var(--demo-ink);flex-wrap:wrap">${ic('info', 'ic-s')}<span class="grow"><b>Mode Demo</b><span class="hide-s"> — data contoh hanya di perangkat ini dan direset setiap kali demo dibuka.</span></span><a href="#/masuk" data-keluar style="font-weight:800">Keluar demo</a></div>` : ''}
      <main class="content" id="host"></main>
    </div>
    <div class="bottomnav"><nav aria-label="Navigasi bawah">
      <a href="#/hari-ini" data-nav="hari-ini">${ic('today')}<span>Hari Ini</span></a>
      <a href="#/rencana" data-nav="rencana">${ic('book')}<span>Rencana</span></a>
      <a href="#/kelas" data-nav="kelas">${ic('usercheck')}<span>Presensi</span></a>
      <a href="#/nilai" data-nav="nilai">${ic('chart')}<span>Nilai</span></a>
      <a href="#/lainnya" data-nav="lainnya">${ic('grid')}<span>Lainnya</span></a>
    </nav></div>
    <button class="fab" type="button" data-quick aria-label="Aksi cepat">${ic('plus', 'ic-l')}</button>
  </div>`;
  shellEl = app.querySelector('#shell');
  shellEl.addEventListener('click', (e) => {
    if (e.target.closest('[data-quick]')) { aksiCepat(); }
    if (e.target.closest('#syncChip')) { sinkron(); }
    if (e.target.closest('#btnBell')) { pemberitahuan(); }
    if (e.target.closest('[data-keluar]')) { e.preventDefault(); document.dispatchEvent(new CustomEvent('mtp:logout')); }
  });
  onSync(renderSync);
  document.addEventListener('mtp:net', renderNet);
  renderNet();
  perbaruiBadge();
  db.on(() => perbaruiBadge());
  return shellEl.querySelector('#host');
}

export function resetShell() { shellEl = null; }

function peranLabel() {
  const p = S.user && S.user.peran;
  return p === 'kepsek' ? 'Kepala Sekolah' : p === 'admin' ? 'Admin' : 'Guru';
}

export function tandaiNav(k, mod) {
  if (!shellEl) return;
  const h = location.hash;
  if (k === 'sekolah') k = /tab=telaah/.test(h) ? 'telaah' : /tab=guru/.test(h) ? 'sekolah-guru' : /tab=dokumen/.test(h) ? 'sekolah-dok' : 'sekolah';
  if (k === 'telaah' && !shellEl.querySelector('[data-nav="telaah"]')) k = 'sekolah';
  shellEl.querySelectorAll('[data-nav]').forEach((a) => {
    const on = a.dataset.nav === k;
    if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  const t = shellEl.querySelector('#tbTitle');
  if (t) t.textContent = (mod && mod.title) || 'Master Teacher';
}

function renderNet() {
  const off = !navigator.onLine;
  const bar = document.getElementById('offbar');
  if (bar) bar.classList.toggle('hide', !off || isDemo());
  const nb = document.getElementById('netbox');
  if (nb) nb.innerHTML = `<div class="row between"><span class="tiny bold muted">Status Jaringan</span><span class="tiny bold" style="color:${off ? 'var(--qs)' : 'var(--gr)'}"><span class="dot"></span> ${off ? 'Offline' : 'Bisa Offline'}</span></div><p class="tiny muted" style="margin-top:2px">${off ? 'Perubahan tersimpan di perangkat.' : 'Perubahan otomatis dicadangkan saat terhubung.'}</p>`;
}

function renderSync(st) {
  const c = document.getElementById('syncChip');
  if (!c) return;
  const p = st.pending;
  let cls = '', txt = '', icn = 'cloud';
  if (isDemo()) { cls = 'demo'; txt = 'Mode demo · tersimpan di perangkat'; icn = 'phone'; }
  else if (st.status === 'busy') { cls = 'busy'; txt = 'Menyinkron…'; icn = 'refresh'; }
  else if (st.status === 'offline' || !navigator.onLine) { cls = 'local'; txt = p ? `Tersimpan di perangkat · ${p} antre` : 'Tersimpan di perangkat'; icn = 'cloudoff'; }
  else if (st.status === 'err') { cls = 'err'; txt = 'Gagal sinkron · Coba lagi'; icn = 'alert'; }
  else if (p) { cls = 'busy'; txt = `${p} perubahan menunggu`; icn = 'refresh'; }
  else { txt = st.last ? 'Tersinkron · ' + waktuRelatif(st.last) : 'Tersinkron'; icn = 'checkc'; }
  c.className = 'syncchip ' + cls;
  c.innerHTML = `${ic(icn, 'ic-s' + (st.status === 'busy' ? ' spin' : ''))}<span>${esc(txt)}</span>`;
  c.title = st.err ? 'Kesalahan: ' + st.err : 'Ketuk untuk sinkron sekarang';
  c.setAttribute('aria-label', txt + (st.err ? ' — ' + st.err : ''));
}

let telaahT = 0;
async function hitungTelaah() {
  const c = shellEl && shellEl.querySelector('[data-cnt-telaah]');
  if (!c) return;
  let n = 0;
  if (isDemo()) n = db.count('RPP', (r) => r.status === 'diajukan');
  else if (S.mode === 'cloud' && navigator.onLine && Date.now() - telaahT > 120000) {
    telaahT = Date.now();
    try { const { api } = await import('./api.js'); n = ((await api('sekolah.rpp.list', { status: 'diajukan' })).data || []).length; c.dataset.n = n; } catch (e) { n = Number(c.dataset.n || 0); }
  } else n = Number(c.dataset.n || 0);
  c.textContent = n ? String(n) : '';
  c.title = n ? n + ' RPP menunggu telaah' : '';
  c.classList.toggle('hide', !n);
}
function perbaruiBadge() {
  if (!shellEl) return;
  hitungTelaah();
  const n = notifikasiLokal().filter((x) => !x.dibaca).length;
  const dot = shellEl.querySelector('#bellDot');
  if (dot) dot.classList.toggle('hide', !n);
}

// ---------- Pemberitahuan (dihitung dari data lokal) ----------
function notifikasiLokal() {
  const out = [];
  const terakhir = Number(lokal.get('mtp_notif_dibaca') || 0);
  db.all('RPP', (r) => r.telaah && r.telaah.waktu && (r.status === 'disetujui' || r.status === 'revisi')).forEach((r) => {
    const t = Date.parse(r.telaah.waktu) || 0;
    out.push({ t, dibaca: t <= terakhir, ic: r.status === 'disetujui' ? 'checkc' : 'edit', judul: `RPP "${r.judul || r.materi}" ${r.status === 'disetujui' ? 'disetujui' : 'perlu revisi'}`, ket: r.telaah.catatan || '', href: '#/rencana/' + r.id });
  });
  const hariIni = today();
  db.all('Tugas', (t) => t.status !== 'dikembalikan' && t.tenggat && t.tenggat < hariIni).forEach((t) => {
    out.push({ t: Date.parse(t.tenggat), dibaca: true, ic: 'clock', judul: `Koreksi "${t.judul}" lewat tenggat`, ket: 'Tenggat ' + fmtTgl(t.tenggat, 'pendek'), href: '#/tugas' });
  });
  return out.sort((a, b) => b.t - a.t).slice(0, 20);
}

async function pemberitahuan() {
  const list = notifikasiLokal();
  lokal.set('mtp_notif_dibaca', String(Date.now()));
  perbaruiBadge();
  await modal({
    title: 'Pemberitahuan',
    body: list.length ? `<div class="list">${list.map((n) => `<a class="li hover" href="${n.href}" data-tutup>${ic(n.ic)}<span class="grow"><b style="display:block">${esc(n.judul)}</b><span class="small muted">${esc(n.ket)}</span></span>${n.dibaca ? '' : '<span class="badge b-yel">Baru</span>'}</a>`).join('')}</div>`
      : emptyState({ icon: 'bell', title: 'Belum ada pemberitahuan', text: 'Hasil telaah RPP dan pengingat koreksi akan muncul di sini.' }),
    onOpen: (d) => d.addEventListener('click', (e) => { if (e.target.closest('[data-tutup]')) d.close(); })
  });
}

// ---------- Aksi cepat ----------
export async function aksiCepat() {
  const items = [
    ['#/rencana/baru', 'book', 'Buat RPP', 'Pembelajaran Mendalam', 't-pl'],
    ['#/kelas', 'usercheck', 'Presensi Kelas', 'Absen 1 ketukan', 't-at'],
    ['#/nilai', 'chart', 'Input Nilai', 'Buku nilai per TP', 't-gr'],
    ['#/tugas?baru=1', 'pen', 'Catat Tugas', 'Pelacak koreksi', 't-qs'],
    ['#/soal?baru=1', 'clipboard', 'Buat Soal', 'Bank soal & kisi-kisi', 't-mt'],
    ['#/ai', 'sparkles', 'Co-Pilot AI', 'Alat AI guru', 't-ai']
  ];
  await modal({
    title: 'Aksi Cepat',
    body: `<div class="grid g2">${items.map(([h, i, l, s, c]) => `<a class="tile ${c}" href="${h}" data-tutup style="min-height:104px"><span class="tile-ic">${ic(i)}</span><span><b style="display:block">${l}</b><span class="small">${s}</span></span></a>`).join('')}</div>`,
    onOpen: (d) => d.addEventListener('click', (e) => { if (e.target.closest('[data-tutup]')) d.close(); })
  });
}

// ---------- Komponen ----------
export function emptyState({ icon = 'sun2', title = '', text = '', action = '' } = {}) {
  return `<div class="empty"><div class="empty-art">${ic(icon, 'ic-xl')}</div><h3>${esc(title)}</h3>${text ? `<p>${esc(text)}</p>` : ''}${action}</div>`;
}
export function skeleton(n = 3) {
  return `<div class="col">${Array.from({ length: n }, () => '<div class="card"><div class="skel skel-line" style="width:40%"></div><div class="skel skel-line"></div><div class="skel skel-line" style="width:70%"></div></div>').join('')}</div>`;
}
export const avatar = (nama, bg = 'var(--surface-3)', fg = 'var(--navy)', cls = '') => `<span class="avatar ${cls}" style="background:${bg};color:${fg}">${esc(initials(nama))}</span>`;
const WARNA_AV = [['var(--pl-bg)', 'var(--pl)'], ['var(--mt-bg)', 'var(--mt)'], ['var(--gr-bg)', 'var(--gr)'], ['var(--at-bg)', 'var(--at)'], ['var(--qs-bg)', 'var(--qs)'], ['var(--ai-bg)', 'var(--ai)']];
export const avatarWarna = (nama, i = 0, cls = '') => { const w = WARNA_AV[i % WARNA_AV.length]; return avatar(nama, w[0], w[1], cls); };

/** Kelas aktif (disimpan di preferensi). */
export function kelasList() { return db.all('Kelas').sort((a, b) => (Number(a.urutan) || 0) - (Number(b.urutan) || 0) || String(a.nama).localeCompare(String(b.nama), 'id', { numeric: true })); }
export function kelasAktif() {
  const all = kelasList();
  let k = all.find((x) => x.id === S.prefs.kelas);
  if (!k && all.length) { k = all[0]; simpanPrefs({ kelas: k.id }); }
  return k || null;
}
export function siswaKelas(kelasId) {
  return db.all('Siswa', (s) => s.kelas_id === kelasId && String(s.aktif) !== '0').sort((a, b) => (Number(a.no) || 999) - (Number(b.no) || 999) || String(a.nama).localeCompare(String(b.nama), 'id'));
}
export function mapelKelas(kelasId) { return db.all('Mapel', (m) => m.kelas_id === kelasId).sort((a, b) => String(a.nama).localeCompare(String(b.nama), 'id')); }
export function mapelAktif(kelasId) {
  const all = mapelKelas(kelasId);
  let m = all.find((x) => x.id === S.prefs.mapel);
  if (!m && all.length) m = all[0];
  return m || null;
}

export function pilihKelasChips(aktifId, { act = 'pilih-kelas', tambah = true } = {}) {
  const all = kelasList();
  return `<div class="chips" role="tablist" aria-label="Pilih kelas">${all.map((k) => {
    const n = db.count('Siswa', (s) => s.kelas_id === k.id && String(s.aktif) !== '0');
    return `<button type="button" class="chip ${k.id === aktifId ? 'on' : ''}" data-act="${act}" data-id="${k.id}" aria-pressed="${k.id === aktifId}">${ic('users', 'ic-s')}Kelas ${esc(k.nama)} <span class="tiny" style="opacity:.75">(${n})</span></button>`;
  }).join('')}${tambah ? `<button type="button" class="chip" data-act="kelas-baru" aria-label="Tambah kelas">${ic('plus', 'ic-s')}</button>` : ''}</div>`;
}

export function selectMapel(kelasId, aktifId, name = 'mapel_id') {
  const all = mapelKelas(kelasId);
  return `<select class="input" name="${name}" data-act-change="pilih-mapel">${all.map((m) => `<option value="${m.id}" ${m.id === aktifId ? 'selected' : ''}>${esc(m.nama)}</option>`).join('')}${all.length ? '' : '<option value="">— belum ada mapel —</option>'}</select>`;
}

/** Delegasi klik: data-act="nama" → handlers.nama(el, event). */
export function delegasi(el, handlers) {
  el.onclick = (e) => {
    const a = e.target.closest('[data-act]');
    if (!a || !el.contains(a)) return;
    const h = handlers[a.dataset.act];
    if (h) { e.preventDefault(); h(a, e); }
  };
  el.onchange = (e) => {
    const a = e.target.closest('[data-act-change]');
    if (!a) return;
    const h = handlers[a.dataset.actChange];
    if (h) h(a, e);
  };
}

export function segmen(tabs, aktif, act = 'tab') {
  return `<div class="seg" role="tablist">${tabs.map(([k, l]) => `<button type="button" role="tab" aria-selected="${k === aktif}" data-act="${act}" data-tab="${k}">${l}</button>`).join('')}</div>`;
}

export function perluKelas(el) {
  el.innerHTML = `<div class="card">${emptyState({ icon: 'users', title: 'Belum ada kelas', text: 'Buat kelas dan daftar siswa terlebih dahulu. Hanya butuh sekitar 3 menit.', action: '<a class="btn btn-primary" href="#/kelas?baru=1">' + ic('plus', 'ic-s') + 'Buat kelas pertama</a>' })}</div>`;
}

export { toast, ic };

// Tabel ber-kelas "stack" tampil sebagai kartu bertumpuk di ponsel: setiap sel diberi label kolom dari thead.
if (typeof MutationObserver !== 'undefined') {
  let antre = false;
  const beriLabel = () => {
    antre = false;
    document.querySelectorAll('table.stack').forEach((t) => {
      const sel = t.querySelectorAll('tbody td:not([data-l])');
      if (!sel.length) return;
      const h = Array.from(t.querySelectorAll('thead th'), (th) => th.textContent.trim());
      sel.forEach((td) => { td.setAttribute('data-l', h[td.cellIndex] || ''); if (td.textContent.trim().length > 36 && !td.querySelector('input,select,button')) td.classList.add('panjang'); });
    });
  };
  new MutationObserver(() => { if (!antre) { antre = true; requestAnimationFrame(beriLabel); } }).observe(document.documentElement, { childList: true, subtree: true });
}

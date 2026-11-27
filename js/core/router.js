// Router hash SPA dengan cache tampilan (navigasi instan tanpa render ulang bila data tidak berubah).
import { db } from './store.js';
import { S, sesiTab } from './state.js';

const ROUTES = [
  { re: /^\/masuk$/, mod: 'masuk', pub: true, shell: false },
  { re: /^\/verifikasi\/([A-Za-z0-9]+)$/, mod: 'verifikasi', pub: true, shell: false, keys: ['kode'] },
  { re: /^\/mulai$/, mod: 'mulai', shell: false },
  { re: /^\/hari-ini$/, mod: 'hariini', nav: 'hari-ini' },
  { re: /^\/rencana$/, mod: 'rencana', nav: 'rencana' },
  { re: /^\/rencana\/([^/]+)$/, mod: 'rpp', nav: 'rencana', keys: ['id'], nocache: true },
  { re: /^\/materi$/, mod: 'materi', nav: 'materi' },
  { re: /^\/soal$/, mod: 'soal', nav: 'soal' },
  { re: /^\/asesmen\/([^/]+)$/, mod: 'asesmen', nav: 'soal', keys: ['id'], nocache: true },
  { re: /^\/kelas$/, mod: 'kelas', nav: 'kelas' },
  { re: /^\/nilai$/, mod: 'nilai', nav: 'nilai' },
  { re: /^\/tugas$/, mod: 'tugas', nav: 'tugas' },
  { re: /^\/jadwal$/, mod: 'jadwal', nav: 'jadwal' },
  { re: /^\/ai$/, mod: 'ai', nav: 'ai' },
  { re: /^\/ai\/([a-z_]+)$/, mod: 'aialat', nav: 'ai', keys: ['alat'], nocache: true },
  { re: /^\/komunikasi$/, mod: 'komunikasi', nav: 'komunikasi' },
  { re: /^\/pengaturan$/, mod: 'pengaturan', nav: 'pengaturan' },
  { re: /^\/sekolah$/, mod: 'sekolah', nav: 'sekolah', roles: ['kepsek', 'admin'] },
  { re: /^\/telaah\/([^/]+)$/, mod: 'telaah', nav: 'telaah', keys: ['id'], roles: ['kepsek', 'admin'], nocache: true },
  { re: /^\/lainnya$/, mod: 'lainnya', nav: 'lainnya' }
];

const modCache = {};
const views = new Map(); // key → { el, mod, ver, at }
const MAKS_VIEW = 6;
let aktif = null;
let hooks = { beforeShell: null, onNav: null };

export function konfigurasiRouter(h) { hooks = Object.assign(hooks, h); }
export const pergi = (hash) => { if (location.hash === '#' + hash) muat(); else location.hash = hash; };
export function rute() {
  const raw = (location.hash || '#/').slice(1);
  const [path, qs] = raw.split('?');
  return { path: path || '/', query: Object.fromEntries(new URLSearchParams(qs || '')), raw };
}

async function ambilModul(nama) {
  if (!modCache[nama]) modCache[nama] = import(`../pages/${nama}.js`).then((m) => m.default);
  return modCache[nama];
}

function verDeps(mod) {
  return (mod.deps || []).map((t) => db.ver[t] || 0).join('.') + '|' + (S.user ? S.user.updated_at : '') + '|' + (S.sekolah ? S.sekolah.updated_at : '');
}

export async function muat() {
  const { path, query, raw } = rute();
  let r = ROUTES.find((x) => x.re.test(path));
  const loggedIn = S.mode === 'demo' || !!S.token;
  if (!r) { pergi(loggedIn ? '/hari-ini' : '/masuk'); return; }
  if (!r.pub && !loggedIn) { sesiTab.set('mtp_lanjut', raw); pergi('/masuk'); return; }
  if (r.mod === 'masuk' && loggedIn) { pergi('/hari-ini'); return; }
  if (r.roles && !(S.user && r.roles.includes(S.user.peran))) { pergi('/hari-ini'); return; }
  if (r.mod === 'mulai' && S.user && String(S.user.onboarded) === '1') { pergi('/hari-ini'); return; } // panduan awal sudah selesai
  if (loggedIn && !r.pub && r.mod !== 'mulai' && S.user && String(S.user.onboarded) !== '1' && S.mode !== 'demo' && S.user.id !== 'darurat' && !sesiTab.get('mtp_lewati_mulai')) { pergi('/mulai'); return; }

  const m = path.match(r.re);
  const params = {};
  (r.keys || []).forEach((k, i) => { params[k] = decodeURIComponent(m[i + 1]); });
  const mod = await ambilModul(r.mod);

  if (r.shell === false) {
    aktif = null;
    views.forEach((v) => v.el.remove()); views.clear();
    const app = document.getElementById('app');
    app.innerHTML = '';
    const el = document.createElement('div');
    app.appendChild(el);
    await mod.render(el, { params, query, raw });
    document.title = (mod.title || 'Master Teacher') + ' — Master Teacher';
    return;
  }

  const host = hooks.beforeShell ? hooks.beforeShell() : null;
  if (!host) return;
  if (hooks.onNav) hooks.onNav(r.nav, mod);
  document.title = (mod.title || 'Master Teacher') + ' — Master Teacher';

  const key = raw;
  let v = views.get(key);
  // Sembunyikan tampilan lain (tetap di memori → kembali instan)
  views.forEach((x, k) => { if (k !== key) { x.el.classList.add('inactive'); x.el.setAttribute('inert', ''); } });
  const ver = verDeps(mod);
  if (v && !r.nocache && v.ver === ver) {
    v.el.classList.remove('inactive'); v.el.removeAttribute('inert');
    v.at = Date.now();
    aktif = { key, v, mod, ctx: v.ctx };
    if (mod.onShow) mod.onShow(v.el, v.ctx);
  } else {
    if (v) { if (v.ctx && v.ctx.cleanup) v.ctx.cleanup(); v.el.remove(); views.delete(key); }
    const el = document.createElement('section');
    el.className = 'view';
    el.tabIndex = -1;
    host.appendChild(el);
    const ctx = { params, query, raw, hold: false, cleanup: null, rerender: () => renderUlang(key) };
    v = { el, mod, ver, at: Date.now(), ctx };
    views.set(key, v);
    aktif = { key, v, mod, ctx };
    try { await mod.render(el, ctx); }
    catch (e) { console.error(e); el.innerHTML = `<div class="card"><h3>Halaman gagal dimuat</h3><p class="muted">${e.message}</p></div>`; }
    v.ver = verDeps(mod);
    // Batasi jumlah tampilan tersimpan (LRU) agar hemat memori di HP
    if (views.size > MAKS_VIEW) {
      const tertua = Array.from(views.entries()).filter(([k]) => k !== key).sort((a, b) => a[1].at - b[1].at)[0];
      if (tertua) { if (tertua[1].ctx && tertua[1].ctx.cleanup) tertua[1].ctx.cleanup(); tertua[1].el.remove(); views.delete(tertua[0]); }
    }
  }
  if (!query.fokus) window.scrollTo({ top: 0 });
  v.el.focus({ preventScroll: true });
}

async function renderUlang(key) {
  const v = views.get(key);
  if (!v) return;
  const y = window.scrollY;
  try { if (v.ctx.cleanup) { v.ctx.cleanup(); v.ctx.cleanup = null; } await v.mod.render(v.el, v.ctx); } catch (e) { console.error(e); }
  v.ver = verDeps(v.mod);
  if (aktif && aktif.key === key) window.scrollTo({ top: y });
}

/** Render ulang tampilan aktif bila tabel yang diandalkannya berubah. */
let tunda = null;
db.on((tabel) => {
  if (!aktif) return;
  const deps = aktif.mod.deps || [];
  if (!deps.some((t) => tabel.has(t))) return;
  if (aktif.ctx.hold) return;
  // Tampilan sudah dirender dengan data versi terbaru (mis. perubahan terjadi tepat sebelum navigasi) → lewati
  if (verDeps(aktif.mod) === aktif.v.ver) return;
  clearTimeout(tunda);
  tunda = setTimeout(() => { if (aktif && !aktif.ctx.hold && verDeps(aktif.mod) !== aktif.v.ver) renderUlang(aktif.key); }, 120);
});

export function invalidasiSemua() { views.forEach((v) => { v.ver = 'x'; }); }
export function bersihkanView() { views.forEach((v) => { if (v.ctx && v.ctx.cleanup) v.ctx.cleanup(); v.el.remove(); }); views.clear(); aktif = null; }
export const viewAktif = () => aktif;

export function mulaiRouter() {
  addEventListener('hashchange', muat);
  muat();
}

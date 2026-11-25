// Status aplikasi global (sesi, profil, preferensi tampilan).
export const APP_VERSION = '2.0.1';

const PREF_KEY = 'mtp_prefs';
const SES_KEY = 'mtp_sesi';

function baca(key, def) { try { return JSON.parse(localStorage.getItem(key)) ?? def; } catch (e) { return def; } }
function tulis(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) { /* mode privat */ } }
/** Akses penyimpanan peramban yang aman (bisa tidak tersedia di mode privat/bingkai tersandbox). */
const aman = (fn, def) => { try { return fn(); } catch (e) { return def; } };
export const lokal = { get: (k) => aman(() => localStorage.getItem(k), null), set: (k, v) => aman(() => localStorage.setItem(k, v)), del: (k) => aman(() => localStorage.removeItem(k)) };
export const sesiTab = { get: (k) => aman(() => sessionStorage.getItem(k), null), set: (k, v) => aman(() => sessionStorage.setItem(k, v)), del: (k) => aman(() => sessionStorage.removeItem(k)) };

export const S = {
  mode: null,          // 'cloud' | 'demo'
  token: null,
  user: null,
  sekolah: null,
  pengaturan: {},
  aiAktif: false,
  googleClientId: '',
  online: navigator.onLine,
  prefs: Object.assign({ tema: 'terang', huruf: 1, kelas: '', mapel: '', kertas: 'A4' }, baca(PREF_KEY, {}))
};

export const gasUrl = () => String(window.GAS_URL || '').trim();
export const adaServer = () => /^https:\/\/script\.google(usercontent)?\.com\//.test(gasUrl()) || /^http:\/\/localhost/.test(gasUrl());

export function simpanPrefs(p) { Object.assign(S.prefs, p); tulis(PREF_KEY, S.prefs); }
export function terapkanTema() {
  const dark = S.prefs.tema === 'gelap' || (S.prefs.tema === 'sistem' && matchMedia('(prefers-color-scheme: dark)').matches);
  if (dark) document.documentElement.dataset.theme = 'dark'; else delete document.documentElement.dataset.theme;
  document.documentElement.style.setProperty('--fs', S.prefs.huruf || 1);
}

export function simpanSesi() {
  tulis(SES_KEY, { mode: S.mode, token: S.token, user: S.user, sekolah: S.sekolah, pengaturan: S.pengaturan, aiAktif: S.aiAktif, googleClientId: S.googleClientId });
}
export function muatSesi() {
  const s = baca(SES_KEY, null);
  if (!s) return false;
  Object.assign(S, s);
  return !!(s.mode === 'demo' || s.token);
}
export function hapusSesi() {
  lokal.del(SES_KEY);
  Object.assign(S, { mode: null, token: null, user: null, sekolah: null });
}

export const isKepsek = () => S.user && (S.user.peran === 'kepsek' || S.user.peran === 'admin');
export const isAdmin = () => S.user && S.user.peran === 'admin';
export const isDemo = () => S.mode === 'demo';
export const modeKbc = () => S.user && String(S.user.mode_kbc) === '1';
export const namaSapaan = () => {
  const n = (S.user && S.user.nama) || 'Bapak/Ibu';
  return n;
};

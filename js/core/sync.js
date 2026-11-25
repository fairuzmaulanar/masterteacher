// Mesin sinkron latar belakang: kirim antrean lokal + tarik perubahan dalam SATU panggilan.
// Polling adaptif: 30 dtk saat aktif, 2 mnt saat diam, berhenti saat tab tersembunyi.
import { db } from './store.js';
import { api } from './api.js';
import { S, simpanSesi } from './state.js';

const subs = new Set();
export const syncState = { status: 'idle', pending: 0, last: 0, err: '' };
let timer = null;
let gagalBeruntun = 0;
let aktifTerakhir = Date.now();
let mulai = false;

function emit() { syncState.pending = db.pending(); subs.forEach((f) => { try { f(syncState); } catch (e) { /* abaikan */ } }); }
export const onSync = (f) => { subs.add(f); f(syncState); return () => subs.delete(f); };

function set(status, err = '') { syncState.status = status; syncState.err = err; emit(); }

export function jadwalkan(ms = 1200) {
  if (S.mode !== 'cloud') return;
  clearTimeout(timer);
  timer = setTimeout(() => sinkron(), ms);
}

function berikutnya() {
  if (S.mode !== 'cloud') return;
  if (document.visibilityState !== 'visible') return;
  const diam = Date.now() - aktifTerakhir > 180000;
  const jeda = gagalBeruntun ? Math.min(120000, 5000 * 2 ** (gagalBeruntun - 1)) : (diam ? 120000 : 30000);
  jadwalkan(jeda);
}

let jalanP = null;
/**
 * Sinkron sekarang. Bila putaran lain sedang berjalan, tunggu selesai lalu jalankan satu putaran baru
 * (agar pemanggil selalu mendapat data terbaru, mis. tombol "Sinkron sekarang").
 */
export async function sinkron(opts = {}) {
  if (S.mode !== 'cloud') { set('demo'); return; }
  if (jalanP) { try { await jalanP; } catch (e) { /* abaikan */ } }
  if (jalanP) return jalanP;
  jalanP = putaran(opts).finally(() => { jalanP = null; berikutnya(); });
  return jalanP;
}

async function putaran({ full = false } = {}) {
  if (!navigator.onLine) { set('offline'); return; }
  clearTimeout(timer);
  set('busy');
  try {
    await db.flush();
    let putaranKe = 0;
    // Kirim berulang bila antrean panjang (maks 5 putaran per siklus)
    do {
      const { push, seqs } = db.takeOutbox(300);
      const since = full ? 0 : Number((await db.meta('cursor')) || 0);
      const r = await api('sync', { push, since, full }, { timeout: 45000 });
      const d = r.data;
      await db.ackOutbox(seqs);
      db.applyServer(d.changes || {});
      await db.meta('cursor', d.cursor || since);
      if (d.rejected && d.rejected.length) console.warn('Perubahan ditolak server:', d.rejected);
      full = false;
      putaranKe++;
    } while (db.pending() > 0 && putaranKe < 5);
    syncState.last = Date.now();
    await db.meta('lastSync', syncState.last);
    gagalBeruntun = 0;
    set('ok');
  } catch (e) {
    gagalBeruntun++;
    if (e.code === 'AUTH') set('err', 'Sesi berakhir');
    else set(navigator.onLine ? 'err' : 'offline', e.message);
  }
}

/** Boot: ambil profil + perubahan sejak kursor (satu panggilan). */
export async function boot() {
  if (jalanP) { try { await jalanP; } catch (e) { /* abaikan */ } }
  const p = bootInti();
  jalanP = p.catch(() => {}).finally(() => { if (jalanP === pBungkus) jalanP = null; });
  const pBungkus = jalanP;
  return p;
}
async function bootInti() {
  const since = Number((await db.meta('cursor')) || 0);
  await db.flush();
  const { push, seqs } = db.takeOutbox(300);
  const r = await api('boot', { since, push }, { timeout: 45000 });
  const d = r.data;
  await db.ackOutbox(seqs);
  db.applyServer(d.changes || {});
  await db.meta('cursor', d.cursor || since);
  S.user = d.user; S.sekolah = d.sekolah; S.pengaturan = d.pengaturan || {}; S.aiAktif = !!d.aiAktif; S.googleClientId = d.googleClientId || '';
  simpanSesi();
  syncState.last = Date.now();
  set('ok');
  return d;
}

export function mulaiSinkron() {
  if (mulai) return;
  mulai = true;
  ['pointerdown', 'keydown'].forEach((ev) => addEventListener(ev, () => { aktifTerakhir = Date.now(); }, { passive: true }));
  addEventListener('online', () => { S.online = true; document.dispatchEvent(new CustomEvent('mtp:net')); sinkron(); });
  addEventListener('offline', () => { S.online = false; set('offline'); document.dispatchEvent(new CustomEvent('mtp:net')); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') sinkron(); });
  document.addEventListener('mtp:outbox', () => { emit(); jadwalkan(1200); });
  db.meta('lastSync').then((v) => { if (v) syncState.last = v; emit(); });
  if (S.mode === 'demo') set('demo'); else berikutnya();
}

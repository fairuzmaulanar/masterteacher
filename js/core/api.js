// Klien REST API ke Google Apps Script.
// ATURAN CORS GAS: POST memakai Content-Type text/plain (tanpa preflight OPTIONS).
import { S, gasUrl } from './state.js';

export class ApiError extends Error {
  constructor(message, code) { super(message); this.code = code; }
}

const inflight = new Map();
let writeEpoch = 0;
const BACA = /^(ping|boot|auth\.me|ai\.quota|notif\.settings|notif\.queue|notif\.blast\.list|crm\.list|doc\.list|doc\.verify|doc\.template\.list|sekolah\.(dashboard|guru|rpp\.list|rpp\.get)|admin\.(status|users)|migrasi\.scan)$/;

async function jalankan(action, data, { timeout = 30000, method = 'POST' } = {}) {
  const url = gasUrl();
  if (!url) throw new ApiError('Server belum dikonfigurasi (GAS_URL kosong).', 'NO_SERVER');
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeout);
  try {
    let res;
    if (method === 'GET') {
      const q = new URLSearchParams(Object.assign({ action }, data || {}));
      res = await fetch(url + (url.includes('?') ? '&' : '?') + q.toString(), { signal: ctrl.signal, redirect: 'follow' });
    } else {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, token: S.token, data: data || {} }),
        signal: ctrl.signal,
        redirect: 'follow'
      });
    }
    if (!res.ok) throw new ApiError('Server menjawab ' + res.status + '.', 'HTTP');
    const j = await res.json();
    if (!j.success) {
      if (j.code === 'AUTH') document.dispatchEvent(new CustomEvent('mtp:auth-expired'));
      throw new ApiError(j.message || 'Permintaan gagal.', j.code || 'FAIL');
    }
    return j;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    if (e.name === 'AbortError') throw new ApiError('Koneksi terlalu lama. Periksa sinyal internet.', 'TIMEOUT');
    throw new ApiError(navigator.onLine ? 'Tidak dapat menghubungi server.' : 'Anda sedang offline.', 'NET');
  } finally {
    clearTimeout(t);
  }
}

/** api('aksi', data) → { data, message, ... }. Permintaan baca yang identik digabung (in-flight dedupe). */
export function api(action, data, opts = {}) {
  if (!BACA.test(action)) {
    writeEpoch++;
    return jalankan(action, data, opts);
  }
  const k = writeEpoch + '|' + action + '|' + JSON.stringify(data || {});
  if (inflight.has(k)) return inflight.get(k);
  const p = jalankan(action, data, opts);
  inflight.set(k, p);
  p.then(() => inflight.delete(k), () => inflight.delete(k));
  return p;
}
export const apiGet = (action, data) => jalankan(action, data, { method: 'GET' });

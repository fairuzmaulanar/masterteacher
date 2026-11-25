// Penyimpanan lokal (offline-first): IndexedDB + salinan di memori.
// Semua bacaan dari memori (instan); setiap tulis → memori + IndexedDB + antrean "outbox" untuk sinkron.

export const MAP_FIELDS = { Absensi: ['status', 'ket'], Asesmen: ['nilai', 'catatan', 'butir'] };
export const TABLES = ['Kelas', 'Siswa', 'Mapel', 'TP', 'RPP', 'Materi', 'Soal', 'Asesmen', 'Absensi', 'Jadwal', 'Tugas', 'Catatan', 'Jurnal', 'Agenda'];

let idb = null;
let ns = null;
const T = {};
const ver = {};
const subs = new Set();
let writeQ = { rows: new Map(), outbox: [] };
let flushT = null;
let changed = new Set();
let emitT = null;
let outboxMem = []; // [{seq, t, id, f, ts}]
let seqMem = 0;
let terbuka = null; // namespace yang sedang terbuka (IndexedDB atau memori)
let metaMem = {};

function reset() { TABLES.forEach((t) => { T[t] = new Map(); ver[t] = 0; }); outboxMem = []; metaMem = {}; }
reset();

function req2p(r) { return new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); }

export const db = {
  lokalSaja: false, // true di Mode Demo: tidak ada antrean sinkron
  get ns() { return ns; },
  T,
  ver,

  async open(namespace) {
    if (terbuka === namespace) return;
    if (idb) idb.close();
    reset();
    ns = namespace;
    // IndexedDB bisa tidak tersedia (mode privat lama / bingkai tersandbox) → lanjut dengan memori saja
    idb = await new Promise((res, rej) => {
      if (!('indexedDB' in window)) { rej(new Error('IndexedDB tidak tersedia')); return; }
      const r = indexedDB.open('mtp2_' + namespace, 1);
      r.onupgradeneeded = () => {
        const d = r.result;
        if (!d.objectStoreNames.contains('rows')) d.createObjectStore('rows', { keyPath: 'k' });
        if (!d.objectStoreNames.contains('outbox')) d.createObjectStore('outbox', { keyPath: 'seq', autoIncrement: true });
        if (!d.objectStoreNames.contains('meta')) d.createObjectStore('meta', { keyPath: 'key' });
      };
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
      r.onblocked = () => rej(new Error('IndexedDB terblokir'));
    }).catch((e) => { console.warn('Penyimpanan perangkat tidak tersedia, memakai memori:', e.message); return null; });
    terbuka = namespace;
    if (!idb) { TABLES.forEach((t) => { ver[t]++; }); return; }
    const tx = idb.transaction(['rows', 'outbox'], 'readonly');
    const [rows, ob] = await Promise.all([req2p(tx.objectStore('rows').getAll()), req2p(tx.objectStore('outbox').getAll())]);
    rows.forEach((r) => { if (T[r.t]) T[r.t].set(r.row.id, r.row); });
    outboxMem = ob;
    TABLES.forEach((t) => { ver[t]++; });
  },

  async meta(key, val) {
    if (!idb) { if (val === undefined) return metaMem[key]; metaMem[key] = val; return val; }
    if (val === undefined) {
      const r = await req2p(idb.transaction('meta').objectStore('meta').get(key));
      return r ? r.v : undefined;
    }
    await req2p(idb.transaction('meta', 'readwrite').objectStore('meta').put({ key, v: val }));
    return val;
  },

  async wipe(namespace) {
    const n = namespace || ns;
    if (n === ns) { if (idb) idb.close(); idb = null; ns = null; terbuka = null; reset(); }
    await new Promise((res) => { try { const r = indexedDB.deleteDatabase('mtp2_' + n); r.onsuccess = r.onerror = r.onblocked = () => res(); } catch (e) { res(); } });
  },

  // ---------- Baca ----------
  get(t, id) { const r = T[t] && T[t].get(id); return r && !r.deleted ? r : null; },
  all(t, fn) {
    const out = [];
    if (!T[t]) return out;
    for (const r of T[t].values()) if (!r.deleted && (!fn || fn(r))) out.push(r);
    return out;
  },
  count(t, fn) { let n = 0; if (T[t]) for (const r of T[t].values()) if (!r.deleted && (!fn || fn(r))) n++; return n; },

  // ---------- Tulis ----------
  /** put('Kelas', id, {nama:'4A'}) — field map (mis. Absensi.status) digabung per kunci. */
  put(t, id, fields, opts = {}) {
    const now = Date.now();
    const maps = MAP_FIELDS[t] || [];
    let row = T[t].get(id);
    const baru = !row;
    if (!row) row = { id, created_at: now, deleted: 0 };
    row = Object.assign({}, row);
    const f = {};
    Object.keys(fields).forEach((k) => {
      const v = fields[k];
      if (maps.includes(k) && v && typeof v === 'object') {
        row[k] = Object.assign({}, row[k] || {});
        Object.keys(v).forEach((sk) => { if (v[sk] === null) delete row[k][sk]; else row[k][sk] = v[sk]; });
        f[k] = Object.assign({}, v);
      } else {
        row[k] = v;
        f[k] = v;
      }
    });
    row.updated_at = now;
    row._local = 1;
    T[t].set(id, row);
    this._persist(t, row);
    if (!opts.noSync && !this.lokalSaja) this._enqueue({ t, id, f, ts: now });
    this._changed(t, opts.senyap);
    return row;
  },
  del(t, id) { return this.put(t, id, { deleted: 1 }); },

  /** Tulis massal (mis. impor siswa) — satu notifikasi perubahan. */
  putMany(t, items) { items.forEach((it) => this.put(t, it.id, it.f)); },

  _persist(t, row) {
    writeQ.rows.set(t + '|' + row.id, { k: t + '|' + row.id, t, row });
    this._scheduleFlush();
  },
  _enqueue(e) {
    writeQ.outbox.push(e);
    this._scheduleFlush();
  },
  _scheduleFlush() {
    if (flushT) return;
    flushT = setTimeout(() => this.flush(), 30);
  },
  async flush() {
    flushT = null;
    if (!idb) {
      // Mode memori: antrean sinkron tetap berjalan, hanya tidak bertahan setelah halaman ditutup
      writeQ.outbox.forEach((e) => { e.seq = ++seqMem; outboxMem.push(e); });
      const ada = writeQ.outbox.length;
      writeQ = { rows: new Map(), outbox: [] };
      if (ada) document.dispatchEvent(new CustomEvent('mtp:outbox'));
      return;
    }
    const q = writeQ;
    writeQ = { rows: new Map(), outbox: [] };
    if (!q.rows.size && !q.outbox.length) return;
    const tx = idb.transaction(['rows', 'outbox'], 'readwrite');
    const rs = tx.objectStore('rows');
    q.rows.forEach((v) => rs.put(v));
    const os = tx.objectStore('outbox');
    q.outbox.forEach((e) => { const r = os.add(e); r.onsuccess = () => { e.seq = r.result; outboxMem.push(e); }; });
    await new Promise((res, rej) => { tx.oncomplete = res; tx.onerror = () => rej(tx.error); });
    document.dispatchEvent(new CustomEvent('mtp:outbox'));
  },

  // ---------- Outbox / sinkron ----------
  pending() { return outboxMem.length + writeQ.outbox.length; },
  /** Ambil antrean & gabungkan per baris (field terbaru menang, map digabung per kunci). */
  takeOutbox(maks = 300) {
    const items = outboxMem.slice(0, 2000);
    const per = new Map();
    const seqs = [];
    for (const e of items) {
      const k = e.t + '|' + e.id;
      if (!per.has(k) && per.size >= maks) break;
      seqs.push(e.seq);
      const cur = per.get(k) || { t: e.t, id: e.id, f: {}, ts: 0 };
      const maps = MAP_FIELDS[e.t] || [];
      Object.keys(e.f).forEach((fk) => {
        if (maps.includes(fk) && e.f[fk] && typeof e.f[fk] === 'object') cur.f[fk] = Object.assign({}, cur.f[fk] || {}, e.f[fk]);
        else cur.f[fk] = e.f[fk];
      });
      cur.ts = Math.max(cur.ts, e.ts);
      per.set(k, cur);
    }
    return { push: Array.from(per.values()), seqs };
  },
  async ackOutbox(seqs) {
    const set = new Set(seqs);
    outboxMem = outboxMem.filter((e) => !set.has(e.seq));
    if (!idb || !seqs.length) return;
    const tx = idb.transaction('outbox', 'readwrite');
    const os = tx.objectStore('outbox');
    seqs.forEach((s) => os.delete(s));
    await new Promise((res) => { tx.oncomplete = res; tx.onerror = res; });
  },
  /** Terapkan baris dari server. Field yang masih antre lokal tetap dipertahankan (tidak tertimpa). */
  applyServer(changes) {
    const pendingByRow = new Map();
    outboxMem.concat(writeQ.outbox).forEach((e) => {
      const k = e.t + '|' + e.id;
      const p = pendingByRow.get(k) || {};
      Object.assign(p, e.f);
      pendingByRow.set(k, p);
    });
    let n = 0;
    Object.keys(changes || {}).forEach((t) => {
      if (!T[t]) return;
      changes[t].forEach((srv) => {
        const k = t + '|' + srv.id;
        let row = Object.assign({}, srv);
        const pend = pendingByRow.get(k);
        if (pend) {
          const cur = T[t].get(srv.id) || {};
          Object.keys(pend).forEach((fk) => {
            if ((MAP_FIELDS[t] || []).includes(fk)) row[fk] = Object.assign({}, row[fk] || {}, (cur[fk] || {}));
            else row[fk] = cur[fk];
          });
          row._local = 1;
        }
        T[t].set(srv.id, row);
        writeQ.rows.set(k, { k, t, row });
        n++;
      });
      this._changed(t);
    });
    if (n) this._scheduleFlush();
    return n;
  },

  // ---------- Langganan perubahan ----------
  on(fn) { subs.add(fn); return () => subs.delete(fn); },
  /** senyap = perubahan dari UI yang sudah diperbarui optimistis → tidak memicu render ulang tampilan aktif. */
  _changed(t, senyap) {
    ver[t] = (ver[t] || 0) + 1;
    if (senyap) return;
    changed.add(t);
    if (emitT) return;
    emitT = requestAnimationFrame(() => {
      emitT = null;
      const set = changed;
      changed = new Set();
      subs.forEach((fn) => { try { fn(set); } catch (e) { console.error(e); } });
    });
  },

  /** Ekspor seluruh data (cadangan / hak akses data UU PDP). */
  exportAll() {
    const o = { app: 'master-teacher-planner', versi: 2, diekspor: new Date().toISOString(), data: {} };
    TABLES.forEach((t) => { o.data[t] = Array.from(T[t].values()).filter((r) => !r.deleted).map((r) => { const c = Object.assign({}, r); delete c._local; return c; }); });
    return o;
  }
};

window.addEventListener('pagehide', () => { if (flushT) { clearTimeout(flushT); db.flush(); } });

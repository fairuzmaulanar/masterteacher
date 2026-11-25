// Utilitas umum: DOM, tanggal Indonesia, ID, toast, dialog, ekspor berkas.
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);
export const nl2br = (s) => esc(s).replace(/\n/g, '<br>');

const ALFA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function uid(prefix = '') {
  const r = new Uint8Array(6);
  crypto.getRandomValues(r);
  return prefix + Date.now().toString(36).toUpperCase() + Array.from(r, (b) => ALFA[b % ALFA.length]).join('');
}

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const round1 = (v) => Math.round(v * 10) / 10;
export const avg = (arr) => { const a = arr.filter((x) => x !== null && x !== '' && !isNaN(x)).map(Number); return a.length ? a.reduce((s, x) => s + x, 0) / a.length : null; };
export const initials = (n) => String(n || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
export const sortBy = (arr, key) => arr.slice().sort((a, b) => (typeof key === 'function' ? key(a) - key(b) : String(a[key] ?? '').localeCompare(String(b[key] ?? ''), 'id', { numeric: true })));
export const groupBy = (arr, fn) => arr.reduce((m, x) => { const k = fn(x); (m[k] = m[k] || []).push(x); return m; }, {});
export const plural = (n, w) => `${n} ${w}`;

// ---------- Tanggal ----------
export const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
export const BLN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
export const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const pad = (n) => String(n).padStart(2, '0');
export const ymd = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const today = () => ymd(new Date());
export const parseYmd = (s) => { const [y, m, d] = String(s).split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1); };
export const addDays = (s, n) => { const d = parseYmd(s); d.setDate(d.getDate() + n); return ymd(d); };
export const jamSekarang = () => { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
export const hariKe = (s) => parseYmd(s).getDay(); // 0 = Minggu
export function fmtTgl(s, gaya = 'panjang') {
  if (!s) return '-';
  const d = typeof s === 'number' ? new Date(s) : (/^\d{4}-\d{2}-\d{2}$/.test(s) ? parseYmd(s) : new Date(s));
  if (isNaN(d)) return String(s);
  if (gaya === 'pendek') return `${d.getDate()} ${BLN[d.getMonth()]} ${d.getFullYear()}`;
  if (gaya === 'hari') return `${HARI[d.getDay()]}, ${d.getDate()} ${BLN[d.getMonth()]}`;
  if (gaya === 'tanpa-hari') return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
  return `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}
export function waktuRelatif(ms) {
  if (!ms) return 'belum pernah';
  const s = Math.round((Date.now() - Number(ms)) / 1000);
  if (s < 45) return 'baru saja';
  if (s < 3600) return `${Math.round(s / 60)} menit lalu`;
  if (s < 86400) return `${Math.round(s / 3600)} jam lalu`;
  return fmtTgl(Number(ms), 'pendek');
}
export function salam() {
  const h = new Date().getHours();
  return h < 11 ? 'Selamat pagi' : h < 15 ? 'Selamat siang' : h < 18 ? 'Selamat sore' : 'Selamat malam';
}
export const menitDari = (hhmm) => { const [h, m] = String(hhmm || '0:0').split(':').map(Number); return (h || 0) * 60 + (m || 0); };

// ---------- Performa ----------
export function debounce(fn, ms = 300) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
export const yieldTask = () => ('scheduler' in window && 'yield' in window.scheduler ? window.scheduler.yield() : new Promise((r) => setTimeout(r, 0)));

// ---------- Kriptografi ----------
export async function sha256Hex(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(str)));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
}

// ---------- Toast ----------
const TOAST_IC = { ok: 'check', err: 'x', info: 'info', warn: 'alert' };
export function toast(msg, type = 'ok', ms = 3200) {
  const box = document.getElementById('toasts');
  if (!box) return;
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span class="t-ic"><svg class="ic ic-s"><use href="#i-${TOAST_IC[type] || 'info'}"/></svg></span><span>${esc(msg)}</span>`;
  box.appendChild(el);
  setTimeout(() => { el.style.transition = 'opacity .25s'; el.style.opacity = '0'; setTimeout(() => el.remove(), 260); }, ms);
}

// ---------- Dialog (elemen <dialog> top-layer) ----------
/**
 * modal({ title, body, actions:[{label, value, cls}], wide }) → Promise<{ value, form, el }>
 * Nilai input di dalam dialog dikembalikan sebagai objek `form`.
 */
export function modal({ title = '', body = '', actions = [{ label: 'Tutup', value: null }], wide = false, onOpen } = {}) {
  return new Promise((resolve) => {
    const d = document.createElement('dialog');
    d.className = 'dlg' + (wide ? ' wide' : '');
    d.innerHTML = `<form method="dialog" novalidate>
      <div class="dlg-h"><h3>${esc(title)}</h3><button type="button" class="btn btn-ghost btn-icon btn-sm" data-x aria-label="Tutup"><svg class="ic"><use href="#i-x"/></svg></button></div>
      <div class="dlg-b">${body}</div>
      <div class="dlg-f">${actions.map((a, i) => `<button type="${a.submit === false ? 'button' : 'submit'}" class="btn ${a.cls || ''}" value="${i}" ${a.id ? `id="${a.id}"` : ''}>${a.label}</button>`).join('')}</div>
    </form>`;
    document.body.appendChild(d);
    const form = d.querySelector('form');
    let hasil = null;
    const tutup = (v) => {
      hasil = v;
      d.close();
    };
    d.querySelector('[data-x]').onclick = () => tutup(null);
    form.addEventListener('submit', (e) => {
      const i = e.submitter ? Number(e.submitter.value) : actions.length - 1;
      const a = actions[i];
      if (a && a.validate) {
        const pesan = a.validate(formToObj(form), form);
        if (pesan) { e.preventDefault(); toast(pesan, 'err'); return; }
      }
      if (a && a.value !== null && a.value !== undefined && !form.checkValidity()) { e.preventDefault(); form.reportValidity(); return; }
      e.preventDefault();
      tutup(a ? a.value : null);
    });
    d.addEventListener('close', () => {
      const v = hasil;
      resolve({ value: v, form: formToObj(form), el: d });
      setTimeout(() => d.remove(), 300);
    });
    d.showModal();
    if (onOpen) onOpen(d);
    const f = d.querySelector('[autofocus], input:not([type=hidden]), textarea, select');
    if (f) setTimeout(() => f.focus(), 30);
  });
}
export async function konfirmasi(pesan, { judul = 'Konfirmasi', ya = 'Ya, lanjutkan', bahaya = false } = {}) {
  const r = await modal({ title: judul, body: `<p>${pesan}</p>`, actions: [{ label: 'Batal', value: null, cls: 'btn-ghost' }, { label: ya, value: true, cls: bahaya ? 'btn-danger' : 'btn-dark' }] });
  return r.value === true;
}
export function formToObj(form) {
  const o = {};
  if (!form) return o;
  for (const el of form.elements) {
    if (!el.name) continue;
    if (el.type === 'checkbox') { if (el.dataset.multi !== undefined) { (o[el.name] = o[el.name] || []); if (el.checked) o[el.name].push(el.value); } else o[el.name] = el.checked; }
    else if (el.type === 'radio') { if (el.checked) o[el.name] = el.value; }
    else if (el.multiple) o[el.name] = Array.from(el.selectedOptions, (x) => x.value);
    else o[el.name] = el.value;
  }
  return o;
}

// ---------- Berkas ----------
export function unduh(blob, nama) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = nama;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
export function parseCSV(text) {
  const rows = [];
  let row = [], cell = '', q = false;
  const sep = (text.split('\n')[0].match(/;/g) || []).length > (text.split('\n')[0].match(/,/g) || []).length ? ';' : ',';
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') q = false; else cell += c; }
    else if (c === '"') q = true;
    else if (c === sep || c === '\t') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
    else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((x) => String(x).trim()));
}
export function bacaFileTeks(file) { return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsText(file); }); }
export function kecilkanGambar(file, maks = 160) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, maks / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      res(c.toDataURL('image/png'));
    };
    img.onerror = rej;
    img.src = URL.createObjectURL(file);
  });
}
export async function salin(teks) {
  try { await navigator.clipboard.writeText(teks); toast('Disalin ke papan klip.'); }
  catch (e) { toast('Gagal menyalin. Pilih teks lalu salin manual.', 'err'); }
}
export const waLink = (hp, pesan) => {
  let n = String(hp || '').replace(/\D/g, '');
  if (n.startsWith('0')) n = '62' + n.slice(1);
  return `https://wa.me/${n}?text=${encodeURIComponent(pesan)}`;
};

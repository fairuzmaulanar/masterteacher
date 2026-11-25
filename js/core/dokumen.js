// Mesin dokumen sisi klien: kop sekolah, cetak A4/F4, ekspor Word (.doc) & Excel (.xlsx),
// serta penerbitan dokumen resmi ber-QR (nomor & kode verifikasi diberikan server).
import { S, isDemo, adaServer } from './state.js';
import { api } from './api.js';
import { esc, sha256Hex, unduh, fmtTgl, toast } from './util.js';
import { qrSvg } from './qr.js';

export const urlVerifikasi = (kode) => `${location.origin}${location.pathname}#/verifikasi/${kode}`;

const CSS_CETAK = `
  @page { size: var(--kertas, A4); margin: 16mm 16mm 18mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Times New Roman', Times, serif; font-size: 11.5pt; color: #000; line-height: 1.45; margin: 0; }
  h1 { font-size: 14pt; text-align: center; margin: 6pt 0 2pt; text-transform: uppercase; }
  h2 { font-size: 12pt; margin: 12pt 0 4pt; text-transform: uppercase; }
  h3 { font-size: 11.5pt; margin: 8pt 0 3pt; }
  p { margin: 3pt 0; } ul, ol { margin: 2pt 0 4pt 0; padding-left: 18pt; } li { margin: 1pt 0; }
  table { width: 100%; border-collapse: collapse; margin: 4pt 0; }
  td, th { border: 1px solid #000; padding: 3pt 5pt; vertical-align: top; font-size: 10.5pt; }
  th { background: #EEE; text-align: center; }
  table.plain td { border: 0; padding: 1pt 4pt; }
  .kop { display: flex; align-items: center; gap: 12pt; border-bottom: 3px double #000; padding-bottom: 6pt; margin-bottom: 10pt; }
  .kop img { width: 64pt; height: 64pt; object-fit: contain; }
  .kop .t { flex: 1; text-align: center; }
  .kop .a { font-size: 10pt; } .kop .n { font-size: 15pt; font-weight: bold; text-transform: uppercase; } .kop .s { font-size: 9.5pt; }
  .c { text-align: center; } .r { text-align: right; } .b { font-weight: bold; } .muted { color: #444; }
  .ttd { display: flex; justify-content: space-between; gap: 24pt; margin-top: 20pt; page-break-inside: avoid; }
  .ttd > div { flex: 1; text-align: center; } .ttd .sp { height: 54pt; display: flex; align-items: center; justify-content: center; }
  .verif { display: flex; gap: 8pt; align-items: center; border: 1px solid #000; padding: 5pt 7pt; margin-top: 14pt; font-size: 8.5pt; page-break-inside: avoid; }
  .verif svg { flex-shrink: 0; }
  .pb { page-break-before: always; }
  .num { text-align: center; } .low { background: #F6D5D5; }
  .landscape { }
`;

/** Kop dokumen dari profil sekolah. */
export function kopHtml() {
  const s = S.sekolah || {};
  if (!s.nama) return '';
  const atas = s.kop_atas ? `<div class="a">${esc(s.kop_atas).replace(/\n/g, '<br>')}</div>` : '';
  const alamat = [s.alamat, s.kota, s.provinsi].filter(Boolean).join(', ');
  const kontak = [s.telp ? 'Telp. ' + s.telp : '', s.email, s.npsn ? 'NPSN ' + s.npsn : ''].filter(Boolean).join(' • ');
  return `<div class="kop">${s.logo ? `<img src="${esc(s.logo)}" alt="">` : ''}<div class="t">${atas}<div class="n">${esc(s.nama)}</div><div class="s">${esc(alamat)}</div>${kontak ? `<div class="s">${esc(kontak)}</div>` : ''}</div>${s.logo ? '<div style="width:64pt"></div>' : ''}</div>`;
}

/** Blok tanda tangan: kiri kepsek (mengetahui), kanan guru. */
export function ttdHtml({ tanggal, kota, ttdKepsek, tampilKepsek = true } = {}) {
  const s = S.sekolah || {};
  const u = S.user || {};
  const tgl = fmtTgl(tanggal || new Date(), 'tanpa-hari');
  const kiri = tampilKepsek ? `<div><p>Mengetahui,</p><p>Kepala ${esc(s.nama || 'Sekolah')}</p><div class="sp">${ttdKepsek || ''}</div><p class="b"><u>${esc(s.kepsek_nama || '................................')}</u></p><p>NIP. ${esc(s.kepsek_nip || '-')}</p></div>` : '<div></div>';
  return `<div class="ttd">${kiri}<div><p>${esc(kota || s.kota || '')}${kota || s.kota ? ', ' : ''}${tgl}</p><p>Guru Mata Pelajaran</p><div class="sp"></div><p class="b"><u>${esc(u.nama || '................................')}</u></p><p>NIP. ${esc(u.nip || '-')}</p></div></div>`;
}

export function verifHtml(dok) {
  if (!dok || !dok.kode) return '';
  const url = urlVerifikasi(dok.kode);
  return `<div class="verif">${qrSvg(url, { ukuran: 76 })}<div><b>Dokumen resmi terverifikasi</b><br>Nomor: ${esc(dok.nomor || '-')} • Kode: <b>${esc(dok.kode)}</b><br>Pindai QR atau buka ${esc(url)} untuk memeriksa keaslian.${dok.status === 'MENUNGGU_TTD' ? '<br><i>Status: menunggu tanda tangan kepala sekolah.</i>' : ''}</div></div>`;
}

export function dokumenHtml(judul, isi, { kertas = S.prefs.kertas || 'A4', landscape = false } = {}) {
  const ukuran = kertas === 'F4' ? (landscape ? '330mm 215mm' : '215mm 330mm') : (landscape ? 'A4 landscape' : 'A4');
  return `<!doctype html><html lang="id"><head><meta charset="utf-8"><title>${esc(judul)}</title><style>${CSS_CETAK.replace('var(--kertas, A4)', ukuran)}</style></head><body>${isi}</body></html>`;
}

/** Cetak lewat iframe tersembunyi (tanpa membuka tab baru). */
export function cetak(judul, isi, opsi) {
  const html = dokumenHtml(judul, isi, opsi);
  const f = document.createElement('iframe');
  f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
  document.body.appendChild(f);
  const doc = f.contentDocument;
  doc.open(); doc.write(html); doc.close();
  const jalan = () => {
    try { f.contentWindow.focus(); f.contentWindow.print(); } catch (e) { toast('Gagal membuka dialog cetak.', 'err'); }
    setTimeout(() => f.remove(), 60000);
  };
  const imgs = Array.from(doc.images);
  if (!imgs.length) setTimeout(jalan, 60);
  else Promise.all(imgs.map((i) => (i.complete ? 1 : new Promise((r) => { i.onload = i.onerror = r; })))).then(() => setTimeout(jalan, 60));
}

/** Ekspor ke Word (HTML berformat .doc — dibuka langsung oleh MS Word / LibreOffice / WPS). */
export function eksporWord(judul, isi, namaFile, opsi) {
  const html = dokumenHtml(judul, isi, opsi).replace('<html lang="id">', '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" lang="id">');
  unduh(new Blob(['﻿', html], { type: 'application/msword' }), (namaFile || judul).replace(/[\\/:*?"<>|]+/g, '-') + '.doc');
}

// ---------- XLSX minimal (tanpa pustaka) ----------
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(b) { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
function zip(files) {
  const enc = new TextEncoder();
  const parts = [], central = [];
  let off = 0;
  files.forEach(({ name, data }) => {
    const nb = enc.encode(name), db = typeof data === 'string' ? enc.encode(data) : data, crc = crc32(db);
    const h = new DataView(new ArrayBuffer(30));
    h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true);
    h.setUint32(14, crc, true); h.setUint32(18, db.length, true); h.setUint32(22, db.length, true); h.setUint16(26, nb.length, true);
    parts.push(new Uint8Array(h.buffer), nb, db);
    const c = new DataView(new ArrayBuffer(46));
    c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true);
    c.setUint32(16, crc, true); c.setUint32(20, db.length, true); c.setUint32(24, db.length, true); c.setUint16(28, nb.length, true); c.setUint32(42, off, true);
    central.push(new Uint8Array(c.buffer), nb);
    off += 30 + nb.length + db.length;
  });
  const cs = central.reduce((a, b) => a + b.length, 0);
  const e = new DataView(new ArrayBuffer(22));
  e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true); e.setUint32(12, cs, true); e.setUint32(16, off, true);
  return new Blob([...parts, ...central, new Uint8Array(e.buffer)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}
const xe = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
function kolom(i) { let s = ''; i++; while (i) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; }

/** sheets: [{ nama, baris: [[...]], lebar: [..] }] — baris pertama dicetak tebal (header). */
export function eksporXlsx(namaFile, sheets) {
  const files = [];
  const nm = sheets.map((s, i) => xe(String(s.nama || 'Sheet' + (i + 1)).replace(/[\\/?*[\]:]/g, ' ').slice(0, 31)));
  files.push({ name: '[Content_Types].xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>` });
  files.push({ name: '_rels/.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>' });
  files.push({ name: 'xl/workbook.xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${nm.map((n, i) => `<sheet name="${n}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets></workbook>` });
  files.push({ name: 'xl/_rels/workbook.xml.rels', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>` });
  files.push({ name: 'xl/styles.xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFE7EEFF"/></patternFill></fill></fills><borders count="2"><border/><border><left style="thin"/><right style="thin"/><top style="thin"/><bottom style="thin"/></border></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="3"><xf/><xf fontId="1" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf borderId="1" applyBorder="1"/></cellXfs></styleSheet>' });
  sheets.forEach((s, i) => {
    const rows = (s.baris || []).map((r, ri) => `<row r="${ri + 1}">${r.map((v, ci) => {
      const ref = kolom(ci) + (ri + 1), st = ri === 0 ? 1 : 2;
      if (typeof v === 'number' && isFinite(v)) return `<c r="${ref}" s="${st}"><v>${v}</v></c>`;
      if (v === null || v === undefined || v === '') return `<c r="${ref}" s="${st}"/>`;
      return `<c r="${ref}" s="${st}" t="inlineStr"><is><t xml:space="preserve">${xe(v)}</t></is></c>`;
    }).join('')}</row>`).join('');
    const cols = s.lebar ? `<cols>${s.lebar.map((w, ci) => `<col min="${ci + 1}" max="${ci + 1}" width="${w}" customWidth="1"/>`).join('')}</cols>` : '';
    files.push({ name: `xl/worksheets/sheet${i + 1}.xml`, data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>${cols}<sheetData>${rows}</sheetData></worksheet>` });
  });
  unduh(zip(files), namaFile.replace(/[\\/:*?"<>|]+/g, '-') + '.xlsx');
}

export function eksporCsv(namaFile, baris) {
  const csv = baris.map((r) => r.map((v) => { const s = String(v ?? ''); return /[",;\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }).join(',')).join('\r\n');
  unduh(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }), namaFile + '.csv');
}

/**
 * Terbitkan dokumen resmi (server memberi nomor & kode verifikasi).
 * jenis: RPP | ABSEN | LEGER | SOAL | JURNAL | RAPOR | UMUM
 * Mengembalikan objek dokumen publik { nomor, kode, status, ... } atau null bila tidak tersedia (demo/offline).
 */
export async function terbitkan({ jenis, ref_id, judul, isiKanonik, ringkasan = '', butuh_ttd = false }) {
  if (isDemo() || !adaServer()) { toast('Penerbitan ber-QR membutuhkan akun cloud. Dokumen tetap bisa dicetak tanpa QR.', 'info', 4200); return null; }
  if (!navigator.onLine) { toast('Penerbitan dokumen membutuhkan internet. Coba lagi saat terhubung.', 'warn'); return null; }
  const hash = await sha256Hex(isiKanonik);
  const r = await api('doc.issue', { jenis, ref_id, judul, hash, butuh_ttd, meta: { ringkasan } });
  toast(r.message || 'Dokumen terbit.');
  return r.data;
}

/** Info dokumen terbit untuk satu referensi (RPP/rekap/leger) — dari cache lokal, diperbarui dari server bila online. */
const DOK_KEY = 'mtp_dok';
function dokCache() { try { return JSON.parse(localStorage.getItem(DOK_KEY) || '{}'); } catch (e) { return {}; } }
export function simpanDokCache(dok) { if (!dok || !dok.ref_id && !dok.refId) return; const c = dokCache(); c[dok.ref_id || dok.refId] = dok; try { localStorage.setItem(DOK_KEY, JSON.stringify(c)); } catch (e) { /* penuh */ } }
export async function dokUntuk(refId, { segar = false } = {}) {
  const c = dokCache();
  if (!segar && c[refId]) return c[refId];
  if (isDemo() || !adaServer() || !navigator.onLine) return c[refId] || null;
  try {
    const r = await api('doc.list', {});
    const baru = {};
    (r.data || []).slice().reverse().forEach((d) => { if (d.status !== 'DITARIK') baru[d.ref_id || ''] = d; });
    Object.assign(c, baru);
    localStorage.setItem(DOK_KEY, JSON.stringify(c));
    return c[refId] || null;
  } catch (e) { return c[refId] || null; }
}
export function ttdElektronik(dok) {
  const p = dok && dok.status === 'TERBIT' && (dok.penandatangan || [])[0];
  return p ? `<div style="font-size:8.5pt;border:1px dashed #000;padding:3pt 6pt">Ditandatangani secara elektronik<br><b>${esc(p.nama)}</b><br>${esc(fmtTgl(p.waktu, 'tanpa-hari'))}</div>` : '';
}

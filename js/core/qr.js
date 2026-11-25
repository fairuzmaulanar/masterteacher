// Pembangkit QR Code mandiri (mode byte UTF-8, koreksi M) — port dari QR.gs (backend).
// Dipakai untuk QR verifikasi dokumen yang dicetak dari perangkat.
const QR_ECC_PER_BLOCK = [
  [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30]
];
const QR_NUM_BLOCKS = [
  [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
  [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
  [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81]
];
const QR_ECL_M = 1;          // indeks tabel (L=0, M=1, Q=2, H=3)
const QR_FORMAT_BITS_M = 0;  // bit format untuk M

function qrRawModules_(ver) {
  let r = (16 * ver + 128) * ver + 64;
  if (ver >= 2) {
    const na = Math.floor(ver / 7) + 2;
    r -= (25 * na - 10) * na - 55;
    if (ver >= 7) r -= 36;
  }
  return r;
}
function qrDataCodewords_(ver) {
  return Math.floor(qrRawModules_(ver) / 8) - QR_ECC_PER_BLOCK[QR_ECL_M][ver] * QR_NUM_BLOCKS[QR_ECL_M][ver];
}
function qrMul_(x, y) {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11D);
    z ^= ((y >>> i) & 1) * x;
  }
  return z & 0xFF;
}
function qrRsDivisor_(deg) {
  const r = [];
  for (let i = 0; i < deg - 1; i++) r.push(0);
  r.push(1);
  let root = 1;
  for (let i = 0; i < deg; i++) {
    for (let j = 0; j < r.length; j++) {
      r[j] = qrMul_(r[j], root);
      if (j + 1 < r.length) r[j] ^= r[j + 1];
    }
    root = qrMul_(root, 0x02);
  }
  return r;
}
function qrRsRemainder_(data, div) {
  const r = div.map(function () { return 0; });
  data.forEach(function (b) {
    const f = b ^ r.shift();
    r.push(0);
    div.forEach(function (c, i) { r[i] ^= qrMul_(c, f); });
  });
  return r;
}

function qrBytesUtf8_(text) {
  return Array.from(new TextEncoder().encode(String(text)));
}

/** Kembalikan matriks boolean [y][x] (true = gelap). */
function qrMatrix_(text) {
  const bytes = qrBytesUtf8_(text);
  let ver = 1;
  for (; ver <= 40; ver++) {
    const cc = ver < 10 ? 8 : 16;
    if (4 + cc + bytes.length * 8 <= qrDataCodewords_(ver) * 8) break;
  }
  if (ver > 40) throw new Error('Teks terlalu panjang untuk QR.');
  const cc = ver < 10 ? 8 : 16;
  const bits = [];
  const push = function (val, len) { for (let i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
  push(4, 4); push(bytes.length, cc);
  bytes.forEach(function (b) { push(b, 8); });
  const cap = qrDataCodewords_(ver) * 8;
  push(0, Math.min(4, cap - bits.length));
  push(0, (8 - bits.length % 8) % 8);
  for (let pad = 0xEC; bits.length < cap; pad ^= 0xEC ^ 0x11) push(pad, 8);
  const data = [];
  for (let i = 0; i < bits.length; i += 8) {
    let v = 0;
    for (let j = 0; j < 8; j++) v = (v << 1) | bits[i + j];
    data.push(v);
  }

  // ECC & interleave
  const nb = QR_NUM_BLOCKS[QR_ECL_M][ver];
  const eccLen = QR_ECC_PER_BLOCK[QR_ECL_M][ver];
  const raw = Math.floor(qrRawModules_(ver) / 8);
  const nShort = nb - raw % nb;
  const shortLen = Math.floor(raw / nb);
  const div = qrRsDivisor_(eccLen);
  const blocks = [];
  for (let i = 0, k = 0; i < nb; i++) {
    const dat = data.slice(k, k + shortLen - eccLen + (i < nShort ? 0 : 1));
    k += dat.length;
    const ecc = qrRsRemainder_(dat, div);
    if (i < nShort) dat.push(0);
    blocks.push(dat.concat(ecc));
  }
  const all = [];
  for (let i = 0; i < blocks[0].length; i++) {
    blocks.forEach(function (b, j) { if (i !== shortLen - eccLen || j >= nShort) all.push(b[i]); });
  }

  const size = ver * 4 + 17;
  const m = [], fn = [];
  for (let y = 0; y < size; y++) { m.push(new Array(size).fill(false)); fn.push(new Array(size).fill(false)); }
  const set = function (x, y, d) { m[y][x] = d; fn[y][x] = true; };

  for (let i = 0; i < size; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
  [[3, 3], [size - 4, 3], [3, size - 4]].forEach(function (p) {
    for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
      const dist = Math.max(Math.abs(dx), Math.abs(dy));
      const xx = p[0] + dx, yy = p[1] + dy;
      if (xx >= 0 && xx < size && yy >= 0 && yy < size) set(xx, yy, dist !== 2 && dist !== 4);
    }
  });
  const al = [];
  if (ver > 1) {
    const na = Math.floor(ver / 7) + 2;
    const step = ver === 32 ? 26 : Math.ceil((ver * 4 + 4) / (na * 2 - 2)) * 2;
    al.push(6);
    for (let pos = size - 7; al.length < na; pos -= step) al.splice(1, 0, pos);
  }
  for (let i = 0; i < al.length; i++) for (let j = 0; j < al.length; j++) {
    if ((i === 0 && j === 0) || (i === 0 && j === al.length - 1) || (i === al.length - 1 && j === 0)) continue;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) set(al[i] + dx, al[j] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
  }
  const drawFormat = function (mask) {
    const d = (QR_FORMAT_BITS_M << 3) | mask;
    let rem = d;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const b = ((d << 10) | rem) ^ 0x5412;
    const g = function (i) { return ((b >>> i) & 1) !== 0; };
    for (let i = 0; i <= 5; i++) set(8, i, g(i));
    set(8, 7, g(6)); set(8, 8, g(7)); set(7, 8, g(8));
    for (let i = 9; i < 15; i++) set(14 - i, 8, g(i));
    for (let i = 0; i < 8; i++) set(size - 1 - i, 8, g(i));
    for (let i = 8; i < 15; i++) set(8, size - 15 + i, g(i));
    set(8, size - 8, true);
  };
  drawFormat(0);
  if (ver >= 7) {
    let rem = ver;
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1F25);
    const b = (ver << 12) | rem;
    for (let i = 0; i < 18; i++) {
      const bit = ((b >>> i) & 1) !== 0;
      const a = size - 11 + i % 3, c = Math.floor(i / 3);
      set(a, c, bit); set(c, a, bit);
    }
  }
  // Tempatkan codeword
  let bi = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let v = 0; v < size; v++) for (let j = 0; j < 2; j++) {
      const x = right - j;
      const up = ((right + 1) & 2) === 0;
      const y = up ? size - 1 - v : v;
      if (!fn[y][x] && bi < all.length * 8) {
        m[y][x] = ((all[bi >>> 3] >>> (7 - (bi & 7))) & 1) !== 0;
        bi++;
      }
    }
  }
  const maskFn = [
    function (x, y) { return (x + y) % 2 === 0; },
    function (x, y) { return y % 2 === 0; },
    function (x) { return x % 3 === 0; },
    function (x, y) { return (x + y) % 3 === 0; },
    function (x, y) { return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; },
    function (x, y) { return x * y % 2 + x * y % 3 === 0; },
    function (x, y) { return (x * y % 2 + x * y % 3) % 2 === 0; },
    function (x, y) { return ((x + y) % 2 + x * y % 3) % 2 === 0; }
  ];
  const applyMask = function (k) {
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!fn[y][x] && maskFn[k](x, y)) m[y][x] = !m[y][x];
  };
  const penalty = function () {
    let p = 0, dark = 0;
    for (let y = 0; y < size; y++) {
      let runX = 1, runY = 1;
      for (let x = 0; x < size; x++) {
        if (m[y][x]) dark++;
        if (x > 0) {
          if (m[y][x] === m[y][x - 1]) { runX++; if (runX === 5) p += 3; else if (runX > 5) p++; } else runX = 1;
          if (m[x][y] === m[x - 1][y]) { runY++; if (runY === 5) p += 3; else if (runY > 5) p++; } else runY = 1;
        }
        if (x > 0 && y > 0 && m[y][x] === m[y][x - 1] && m[y][x] === m[y - 1][x] && m[y][x] === m[y - 1][x - 1]) p += 3;
      }
    }
    const total = size * size;
    p += (Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1) * 10;
    return p;
  };
  let best = 0, bestP = Infinity;
  for (let k = 0; k < 8; k++) {
    applyMask(k); drawFormat(k);
    const p = penalty();
    if (p < bestP) { bestP = p; best = k; }
    applyMask(k);
  }
  applyMask(best); drawFormat(best);
  return m;
}

/** SVG QR (string). opsi: { ukuran:px, tepi:modul, warna } */
export function qrSvg(text, { ukuran = 120, tepi = 2, warna = '#000' } = {}) {
  const m = qrMatrix_(text);
  const n = m.length + tepi * 2;
  let d = '';
  for (let y = 0; y < m.length; y++) {
    for (let x = 0; x < m.length; x++) if (m[y][x]) d += `M${x + tepi},${y + tepi}h1v1h-1z`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n} ${n}" width="${ukuran}" height="${ukuran}" shape-rendering="crispEdges" role="img" aria-label="Kode QR verifikasi"><rect width="${n}" height="${n}" fill="#fff"/><path d="${d}" fill="${warna}"/></svg>`;
}
export const qrMatrix = qrMatrix_;

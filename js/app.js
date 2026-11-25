// Titik masuk aplikasi: sesi, penyimpanan lokal, sinkron latar belakang, router, PWA.
import { pasangSprite } from './core/icons.js';
import { S, muatSesi, simpanSesi, hapusSesi, terapkanTema, adaServer, sesiTab } from './core/state.js';
import { db } from './core/store.js';
import { boot, mulaiSinkron, sinkron } from './core/sync.js';
import { konfigurasiRouter, mulaiRouter, pergi, bersihkanView, invalidasiSemua } from './core/router.js';
import { renderShell, tandaiNav, resetShell } from './core/ui.js';
import { toast, konfirmasi } from './core/util.js';
import { semaiDemo, DEMO_USER, DEMO_SEKOLAH } from './core/demo.js';
import { api } from './core/api.js';

pasangSprite();
terapkanTema();
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', terapkanTema);

// ---------- PWA ----------
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then((reg) => {
      reg.addEventListener('updatefound', () => {
        const w = reg.installing;
        if (!w) return;
        w.addEventListener('statechange', () => {
          if (w.state === 'installed' && navigator.serviceWorker.controller) toast('Versi baru tersedia. Muat ulang halaman untuk memperbarui.', 'info', 8000);
        });
      });
    }).catch(() => { /* PWA opsional */ });
  });
}
window.__pasang = null;
addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); window.__pasang = e; document.dispatchEvent(new CustomEvent('mtp:pasang')); });
addEventListener('appinstalled', () => { window.__pasang = null; document.dispatchEvent(new CustomEvent('mtp:pasang')); toast('Master Teacher terpasang di perangkat Anda.'); });

// ---------- Sesi ----------
export async function masukDemo() {
  await db.wipe('demo');
  await db.open('demo');
  db.lokalSaja = true;
  semaiDemo();
  await db.flush();
  Object.assign(S, { mode: 'demo', token: null, user: Object.assign({}, DEMO_USER), sekolah: Object.assign({}, DEMO_SEKOLAH), aiAktif: false });
  simpanSesi();
  resetShell(); bersihkanView();
  mulaiSinkron();
  pergi('/hari-ini');
}

/** data = respons auth.* { token, user, sekolah } */
export async function masukCloud(data) {
  Object.assign(S, { mode: 'cloud', token: data.token, user: data.user, sekolah: data.sekolah });
  simpanSesi();
  db.lokalSaja = false;
  await db.open('u_' + data.user.id);
  resetShell(); bersihkanView();
  try { await boot(); } catch (e) { toast('Data akan disinkronkan saat koneksi stabil. ' + e.message, 'warn'); }
  mulaiSinkron();
  const lanjut = sesiTab.get('mtp_lanjut');
  sesiTab.del('mtp_lanjut');
  pergi(lanjut && !/masuk/.test(lanjut) ? lanjut : S.user.id === 'darurat' ? '/pengaturan?tab=admin' : (String(S.user.onboarded) === '1' ? '/hari-ini' : '/mulai'));
}

async function keluar({ tanya = true, semua = false } = {}) {
  if (tanya && S.mode === 'cloud' && db.pending() > 0) {
    const ok = await konfirmasi(`Masih ada <b>${db.pending()} perubahan</b> yang belum tersinkron. Jika keluar sekarang, perubahan tetap tersimpan di perangkat ini dan akan dikirim saat Anda masuk lagi dengan akun yang sama.`, { judul: 'Keluar dari akun?', ya: 'Tetap keluar' });
    if (!ok) return;
  }
  if (semua && S.mode === 'cloud') { try { await api('auth.logoutAll', {}); } catch (e) { /* abaikan */ } }
  if (S.mode === 'demo') await db.wipe('demo');
  hapusSesi();
  resetShell(); bersihkanView();
  pergi('/masuk');
}

document.addEventListener('mtp:logout', (e) => keluar(e.detail || {}));
document.addEventListener('mtp:auth-expired', () => {
  if (!S.token) return;
  toast('Sesi Anda berakhir. Silakan masuk kembali — data di perangkat tetap aman.', 'warn', 6000);
  hapusSesi(); resetShell(); bersihkanView(); pergi('/masuk');
});
/** Halaman lain memanggil ini setelah profil/sekolah berubah agar kerangka ikut diperbarui. */
document.addEventListener('mtp:profil', () => { simpanSesi(); resetShell(); bersihkanView(); invalidasiSemua(); dispatchEvent(new HashChangeEvent('hashchange')); });

// ---------- Mulai ----------
async function mulai() {
  konfigurasiRouter({ beforeShell: renderShell, onNav: tandaiNav });
  const ada = muatSesi();
  if (ada && S.mode === 'demo') {
    await db.open('demo');
    db.lokalSaja = true;
    if (!db.count('Kelas')) semaiDemo();
  } else if (ada && S.mode === 'cloud' && S.user) {
    db.lokalSaja = false;
    await db.open('u_' + S.user.id);
    // Tampilkan data lokal segera; perbarui profil & data dari server di latar belakang
    if (adaServer()) {
      const sebelum = JSON.stringify([S.user, S.sekolah]);
      boot().then(() => { if (JSON.stringify([S.user, S.sekolah]) !== sebelum) document.dispatchEvent(new CustomEvent('mtp:profil')); }).catch(() => { /* offline: lanjut dengan data lokal */ });
    }
  } else if (ada) {
    hapusSesi();
  }
  mulaiSinkron();
  mulaiRouter();
}

mulai().catch((e) => {
  console.error(e);
  document.getElementById('app').innerHTML = `<div style="padding:24px;font-family:system-ui"><h2>Aplikasi gagal dimuat</h2><p>${String(e.message || e)}</p><p>Coba muat ulang halaman. Jika browser dalam mode privat, penyimpanan lokal mungkin diblokir.</p></div>`;
});

export { sinkron };

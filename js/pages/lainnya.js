// Menu lengkap untuk ponsel (tab "Lainnya" di navigasi bawah).
import { ic } from '../core/icons.js';
import { esc, initials } from '../core/util.js';
import { S, isDemo, isKepsek } from '../core/state.js';
import { syncState } from '../core/sync.js';

const LABEL_SYNC = { idle: 'tersinkron', busy: 'menyinkron…', offline: 'tersimpan di perangkat (luring)', err: 'gagal, coba lagi' };

export default {
  title: 'Menu',
  render(el, ctx) {
    const u = S.user || {};
    const item = (h, i, l, c) => `<a class="tile ${c}" href="${h}" style="min-height:104px"><span class="tile-ic">${ic(i)}</span><b class="small">${l}</b></a>`;
    el.innerHTML = `<div class="card row" style="margin-bottom:1rem"><span class="avatar l" style="background:var(--yellow);color:#12245B">${esc(initials(u.nama))}</span><span class="grow"><b>${esc(u.nama || '-')}</b><br><span class="tiny muted">${esc(u.email || '')}${S.sekolah ? ' · ' + esc(S.sekolah.nama) : ''}</span></span><a class="btn btn-white btn-sm" href="#/pengaturan">${ic('gear', 'ic-s')}</a></div>
      ${isKepsek() && S.sekolah && !isDemo() ? `<div class="section-h"><h3>Supervisi</h3></div><div class="grid g3" style="grid-template-columns:repeat(3,1fr);margin-bottom:1rem">${item('#/sekolah', 'school', 'Ringkasan Sekolah', 't-ai')}${item('#/sekolah?tab=telaah', 'clipboard', 'Telaah RPP', 't-pl')}${item('#/sekolah?tab=guru', 'users', 'Guru', 't-mt')}</div>` : ''}
      <div class="section-h"><h3>Ruang kerja</h3></div>
      <div class="grid" style="grid-template-columns:repeat(3,1fr);gap:.6rem">
        ${item('#/hari-ini', 'grid', 'Hari Ini', 't-mt')}${item('#/rencana', 'book', 'Rencana Ajar', 't-pl')}${item('#/materi', 'image', 'Materi & Media', 't-mt')}
        ${item('#/soal', 'clipboard', 'Bank Soal', 't-qs')}${item('#/nilai', 'chart', 'Nilai & Rapor', 't-gr')}${item('#/kelas', 'usercheck', 'Kelas & Presensi', 't-at')}
        ${item('#/tugas', 'pen', 'Koreksi & Tugas', 't-qs')}${item('#/jadwal', 'calendar', 'Jadwal & Jurnal', 't-mt')}${item('#/komunikasi', 'message', 'Komunikasi Wali', 't-at')}
        ${item('#/ai', 'sparkles', 'Co-Pilot AI', 't-ai')}${item('#/pengaturan', 'gear', 'Pengaturan', '')}${item('#/pengaturan?tab=data', 'cloud', 'Data & Sinkron', '')}
      </div>
      <div class="row section" style="justify-content:center"><span class="tiny muted">${isDemo() ? 'Mode demo · data tersimpan di perangkat' : `Status sinkron: ${esc(LABEL_SYNC[syncState.status] || syncState.status)}${syncState.pending ? ` · ${syncState.pending} antre` : ''}`}</span></div>
      <button class="btn btn-ghost btn-block" data-keluar>${ic('logout', 'ic-s')}${isDemo() ? 'Keluar demo' : 'Keluar'}</button>`;
    el.querySelector('[data-keluar]').onclick = () => document.dispatchEvent(new CustomEvent('mtp:logout'));
  }
};

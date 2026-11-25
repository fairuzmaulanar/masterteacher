// Co-Pilot AI: katalog alat AI guru.
import { ic } from '../core/icons.js';
import { esc } from '../core/util.js';
import { S, isDemo } from '../core/state.js';
import { api } from '../core/api.js';
import { ALAT } from '../core/ai.js';

const TUJUAN = { rpp: '#/rencana/baru', atp: '#/rencana?tab=tp', soal: '#/soal?baru=1', deskripsi_rapor: '#/nilai?tab=rapor' };
const GRUP = [['Perencanaan', ['rpp', 'atp', 'lkpd', 'diferensiasi', 'ringkasan']], ['Asesmen & Rapor', ['soal', 'rubrik', 'umpan_balik', 'deskripsi_rapor']], ['Komunikasi & Administrasi', ['pesan_wali', 'surat', 'laporan']]];

export default {
  title: 'Co-Pilot AI',
  async render(el) {
    const aktif = S.aiAktif && !isDemo();
    el.innerHTML = `<div class="page-h"><div><div class="crumbs"><a href="#/hari-ini">Beranda</a>${ic('chevr', 'ic-s')}<b>Co-Pilot AI</b></div><h1>Co-Pilot AI Guru</h1><p class="sub">12 alat untuk memangkas pekerjaan administrasi. Semua hasil berupa <b>draf</b> — Anda yang memutuskan.</p></div>
      <span class="badge ${aktif ? 'b-ai' : 'b-draf'}" id="kuota" style="font-size:.8125rem;padding:.4rem .8rem">${aktif ? 'Memeriksa kuota…' : 'Mode templat bawaan (AI belum aktif)'}</span></div>
      ${aktif ? '' : `<div class="card card-sky small" style="margin-bottom:1rem">${ic('info', 'ic-s')} ${isDemo() ? 'Mode demo memakai templat bawaan.' : 'Admin dapat mengaktifkan AI (Gemini, OpenAI, atau Anthropic) di Pengaturan → Admin. API key disimpan aman di Script Properties server.'} Semua alat tetap berfungsi dengan templat Pembelajaran Mendalam bawaan yang dapat disunting.</div>`}
      ${GRUP.map(([g, ks]) => `<div class="section"><div class="section-h"><h3>${esc(g)}</h3></div><div class="grid g3">${ks.map((k) => { const a = ALAT[k]; return `<a class="tile ${a.cls}" href="${TUJUAN[k] || '#/ai/' + k}"><span class="tile-ic">${ic(a.ic)}</span><span><b style="display:block">${esc(a.judul)}</b><span class="small">${esc(a.ket)}</span></span></a>`; }).join('')}</div></div>`).join('')}
      <div class="card card-flat small section">${ic('shield', 'ic-s')} <b>Privasi:</b> nama siswa diganti kode anonim sebelum dikirim ke penyedia AI, dan setiap pemakaian dicatat (tanpa isi) untuk audit.</div>`;
    if (aktif) { try { const r = await api('ai.quota', {}); const q = r.data; el.querySelector('#kuota').textContent = q.tanpaBatas ? 'Kuota AI tanpa batas' : `Sisa kuota AI hari ini: ${q.sisa}/${q.batas}`; } catch (e) { el.querySelector('#kuota').textContent = 'Kuota tidak dapat diperiksa'; } }
  }
};

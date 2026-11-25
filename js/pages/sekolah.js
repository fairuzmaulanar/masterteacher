// Portal Kepala Sekolah: ringkasan sekolah, antrean telaah RPP, guru & kode undangan, dokumen terbit.
import { ic } from '../core/icons.js';
import { esc, toast, fmtTgl, salam, salin, waktuRelatif, today, addDays } from '../core/util.js';
import { S } from '../core/state.js';
import { db } from '../core/store.js';
import { api } from '../core/api.js';
import { delegasi, emptyState, segmen, skeleton, avatarWarna } from '../core/ui.js';
import { DIMENSI, tahunAjaran, semesterSekarang } from '../core/kurikulum.js';
import { namaKelas, namaMapel, kktpMapel } from '../core/hitung.js';
import { skorKepatuhan } from './rpp.js';

// ---------- Sumber data: server ----------
export async function ambilRppSekolah(status) {
  return (await api('sekolah.rpp.list', { status })).data || [];
}

export default {
  title: 'Portal Kepala Sekolah',
  deps: ['RPP'],
  async render(el, ctx) {
    const tab = ctx.query.tab || 'ringkasan';
    const s = S.sekolah || {};
    if (!s.id) { el.innerHTML = `<div class="card">${emptyState({ icon: 'school', title: 'Belum ada profil sekolah', text: 'Buat profil sekolah untuk membuka portal supervisi.', action: '<a class="btn btn-primary" href="#/pengaturan?tab=sekolah">Buat profil sekolah</a>' })}</div>`; return; }
    el.innerHTML = `<div class="page-h"><div><div class="crumbs"><span>${esc(s.nama)}</span>${ic('chevr', 'ic-s')}<b>Portal Kepala Sekolah</b>${s.npsn ? `<span>· NPSN ${esc(s.npsn)}</span>` : ''}</div><h1>${salam()}, ${esc((S.user.nama || '').split(',')[0])}</h1>
      <p class="sub">Pantauan administrasi kurikulum & kesiapan akademik ${esc(s.nama)} · TA ${tahunAjaran()} · Semester ${semesterSekarang() === 1 ? 'Ganjil' : 'Genap'}</p></div>
      <div class="row"><button class="btn btn-white btn-sm" data-act="segar">${ic('refresh', 'ic-s')}Perbarui</button></div></div>
      <div style="margin-bottom:1rem">${segmen([['ringkasan', 'Ringkasan'], ['telaah', 'Telaah RPP'], ['guru', 'Guru & Undangan'], ['dokumen', 'Dokumen Terbit']], tab)}</div><div id="isi">${skeleton(3)}</div>`;
    const isi = el.querySelector('#isi');
    delegasi(el, {
      tab: (b) => { location.hash = '#/sekolah?tab=' + b.dataset.tab; },
      segar: () => { ctx.segar = true; ctx.rerender(); },
      salin: (b) => salin(b.dataset.v)
    });
    try {
      if (tab === 'ringkasan') await ringkasan(isi, ctx);
      else if (tab === 'telaah') await antrean(isi);
      else if (tab === 'guru') await daftarGuru(isi);
      else await dokumen(isi);
    } catch (e) { isi.innerHTML = `<div class="card">${emptyState({ icon: 'cloudoff', title: 'Tidak dapat memuat data sekolah', text: e.message })}</div>`; }
    ctx.segar = false;
  }
};

async function ringkasan(el, ctx) {
  const d = (await api('sekolah.dashboard', { segar: !!ctx.segar })).data;
  const r = d.ringkas;
  const pRpp = r.guru ? Math.round((r.guruPunyaRpp / r.guru) * 1000) / 10 : 0;
  const antri = await ambilRppSekolah('diajukan');
  const maksDim = Math.max(1, ...Object.values(d.dimensi || {}));
  el.innerHTML = `
    <div class="card" style="background:#12245B;color:#fff;margin-bottom:1rem"><div class="row between row-wrap"><div><span class="badge b-yel">Permendikdasmen 1/2026</span><h3 style="color:#fff;margin:.5rem 0 .25rem">Supervisi administrasi pembelajaran</h3><p class="small" style="color:#C9D3F2"><b style="color:#FFDF9D">${r.guruPunyaRpp} dari ${r.guru} guru</b> telah menyusun RPP Pembelajaran Mendalam. ${r.rppMenunggu ? `Terdapat <b style="color:#FFDF9D">${r.rppMenunggu} draf</b> menunggu telaah Anda.` : 'Tidak ada draf yang menunggu telaah.'}</p></div>${r.rppMenunggu ? `<a class="btn btn-primary" href="#/sekolah?tab=telaah">${ic('clipboard', 'ic-s')}Tinjau ${r.rppMenunggu} draf</a>` : ''}</div></div>
    <div class="grid g4">
      <div class="card card-s"><span class="small bold muted">Administrasi RPP</span><div class="kpi-v">${pRpp}%</div><span class="tiny muted">${r.guruPunyaRpp}/${r.guru} guru · ${r.rppDisetujui} RPP disetujui</span><div class="bar" style="margin-top:.4rem"><i style="width:${pRpp}%"></i></div></div>
      <div class="card card-s"><span class="small bold muted">Ketuntasan belajar</span><div class="kpi-v">${r.ketuntasan ?? '—'}${r.ketuntasan !== null ? '%' : ''}</div><span class="tiny muted">rata-rata terhadap KKTP</span></div>
      <div class="card card-s"><span class="small bold muted">Kehadiran siswa hari ini</span><div class="kpi-v">${r.hadirHariIni ?? '—'}${r.hadirHariIni !== null ? '%' : ''}</div><span class="tiny muted">${r.tercatatHariIni} presensi tercatat · ${r.siswa} siswa</span></div>
      <div class="card card-s" style="background:var(--yellow-soft)"><span class="small bold muted">Tugas meja KS</span><div class="kpi-v">${r.rppMenunggu}</div><span class="tiny muted">dokumen menunggu telaah</span></div>
    </div>
    <div class="split section"><div class="col gap-l">
      <div class="card"><div class="section-h"><h3>${ic('clipboard')}Antrean telaah RPP</h3><a class="small bold" href="#/sekolah?tab=telaah">Lihat semua</a></div><div class="list">${antri.slice(0, 4).map((x, i) => `<a class="li flat" href="#/telaah/${x.id}">${avatarWarna(x.guru, i)}<span class="grow"><b class="truncate" style="display:block">${esc(x.judul || x.materi)}</b><span class="tiny muted">${esc(x.guru)} · ${esc(x.mapel)} Kelas ${esc(x.kelas)} · ${waktuRelatif(x.updated_at)}</span></span><span class="badge b-mt">Menunggu</span></a>`).join('') || '<p class="small muted">Tidak ada RPP menunggu telaah. 🎉</p>'}</div></div>
      <div class="card" style="padding:.75rem"><div class="section-h" style="padding:.25rem .5rem"><h3>${ic('users')}Kinerja administrasi guru</h3></div><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Guru</th><th class="num">RPP</th><th class="num">Disetujui</th><th class="num">Kehadiran siswa</th><th class="num">Ketuntasan</th><th class="num">Jurnal 30 hr</th></tr></thead><tbody>${d.guru.map((g) => `<tr><td style="min-width:200px"><b>${esc(g.nama)}</b><br><span class="tiny muted">${esc(g.mapel || g.peran)}${(g.kelas || []).length ? ' · ' + esc(g.kelas.join(', ')) : ''}</span></td><td class="num">${g.rpp.total}</td><td class="num">${g.rpp.disetujui}${g.rpp.revisi ? ` <span class="badge b-qs">${g.rpp.revisi} revisi</span>` : ''}</td><td class="num">${g.persenHadir ?? '-'}${g.persenHadir != null ? '%' : ''}</td><td class="num" style="${g.persenTuntas != null && g.persenTuntas < 75 ? 'color:var(--red);font-weight:700' : ''}">${g.persenTuntas ?? '-'}${g.persenTuntas != null ? '%' : ''}</td><td class="num">${g.jurnal}</td></tr>`).join('')}</tbody></table></div></div>
    </div><aside class="col gap-l">
      <div class="card"><h3 style="margin-bottom:.75rem">${ic('alert')} Radar peringatan dini</h3><div class="list">${(d.radar || []).slice(0, 8).map((x) => x.jenis === 'alfa' ? `<div class="li flat small"><span class="badge b-red">Alfa ${x.jumlah}x</span><span class="grow"><b>${esc(x.siswa)}</b> · Kelas ${esc(x.kelas)}<br><span class="tiny muted">Wali kelas/guru: ${esc(x.guru || '-')}</span></span></div>` : `<div class="li flat small"><span class="badge b-qs">${x.bawah}/${x.total}</span><span class="grow"><b>${esc(x.judul)}</b> · Kelas ${esc(x.kelas)}<br><span class="tiny muted">${esc(x.guru)} — ≥25% siswa di bawah KKTP</span></span></div>`).join('') || '<p class="small muted">Tidak ada peringatan.</p>'}</div></div>
      <div class="card"><h3 style="margin-bottom:.75rem">8 Dimensi Profil Lulusan di RPP</h3><div class="col" style="gap:.45rem">${DIMENSI.map((x) => { const n = (d.dimensi || {})[x] || 0; return `<div><div class="row between tiny"><span>${esc(x.replace(' kepada Tuhan YME', ''))}</span><b>${n}</b></div><div class="bar"><i style="width:${(n / maksDim) * 100}%;background:var(--navy)"></i></div></div>`; }).join('')}</div><p class="tiny muted" style="margin-top:.6rem">Dimensi yang jarang disasar dapat menjadi fokus pembinaan.</p></div>
      <p class="tiny muted">Data dihitung ${waktuRelatif(Date.parse(d.dihitung))}.</p></aside></div>`;
}

async function antrean(el) {
  const list = await ambilRppSekolah('diajukan,revisi,disetujui');
  const grup = { diajukan: [], revisi: [], disetujui: [] };
  list.forEach((x) => { (grup[x.status] || []).push(x); });
  const kartu = (x, i) => { const sk = x._r ? skorKepatuhan(x._r).skor : null; return `<a class="card lift" href="#/telaah/${x.id}" style="color:inherit;text-decoration:none;display:flex;flex-direction:column;gap:.4rem"><div class="row">${avatarWarna(x.guru, i)}<span class="grow"><b>${esc(x.guru)}</b><br><span class="tiny muted">${esc(x.mapel)} · Kelas ${esc(x.kelas)} · ${waktuRelatif(x.updated_at)}</span></span>${sk !== null ? `<span class="badge ${sk >= 90 ? 'b-gr' : 'b-qs'}">${sk}%</span>` : ''}</div><h3 style="font-size:1rem">${esc(x.judul || x.materi)}</h3><div class="row row-wrap">${(x.dimensi || []).map((d) => `<span class="badge">${esc(d.replace(' kepada Tuhan YME', ''))}</span>`).join('')}</div>${x.telaah && x.telaah.catatan ? `<p class="tiny muted">${esc(x.telaah.catatan)}</p>` : ''}</a>`; };
  el.innerHTML = `<div class="section-h"><h3>Menunggu telaah <span class="badge b-mt">${grup.diajukan.length}</span></h3></div>${grup.diajukan.length ? `<div class="grid g2">${grup.diajukan.map(kartu).join('')}</div>` : `<div class="card">${emptyState({ icon: 'checkc', title: 'Antrean kosong', text: 'Semua RPP yang diajukan guru sudah Anda telaah.' })}</div>`}
    <div class="section-h section"><h3>Riwayat telaah</h3></div><div class="grid g3">${grup.revisi.concat(grup.disetujui).sort((a, b) => b.updated_at - a.updated_at).slice(0, 12).map((x, i) => `<a class="li flat" href="#/telaah/${x.id}" style="border-radius:16px">${avatarWarna(x.guru, i)}<span class="grow small"><b class="truncate" style="display:block">${esc(x.judul || x.materi)}</b><span class="tiny muted">${esc(x.guru)}</span></span><span class="badge ${x.status === 'disetujui' ? 'b-gr' : 'b-qs'}">${x.status === 'disetujui' ? 'Disetujui' : 'Revisi'}</span></a>`).join('') || '<p class="small muted">Belum ada riwayat.</p>'}</div>`;
}

async function daftarGuru(el) {
  const s = S.sekolah || {};
  const guru = (await api('sekolah.guru', {})).data;
  el.innerHTML = `<div class="split"><div class="card" style="padding:.75rem"><div class="section-h" style="padding:.25rem .5rem"><h3>Guru terdaftar <span class="badge">${guru.length}</span></h3></div><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Nama</th><th>Email</th><th>Peran</th><th>Login terakhir</th></tr></thead><tbody>${guru.map((g) => `<tr><td><b>${esc(g.nama || '-')}</b><br><span class="tiny muted">${esc(g.mapel_utama || '')}${g.nip ? ' · NIP ' + esc(g.nip) : ''}</span></td><td class="small">${esc(g.email)}</td><td><span class="badge ${g.peran === 'kepsek' ? 'b-navy' : ''}">${esc(g.peran)}</span></td><td class="small">${g.login_terakhir ? fmtTgl(g.login_terakhir, 'pendek') : '-'}</td></tr>`).join('')}</tbody></table></div></div>
    <aside class="card col gap-l"><h3>Undang guru</h3><p class="small muted">Bagikan kode berikut. Guru memasukkannya saat pertama kali masuk (atau di Pengaturan → Sekolah).</p><div class="row"><span class="kpi-v" style="letter-spacing:.25em">${esc(s.kode_undangan || '—')}</span>${s.kode_undangan ? `<button class="btn btn-white btn-sm" data-act="salin" data-v="${esc(s.kode_undangan)}">${ic('copy', 'ic-s')}Salin</button>` : ''}</div>
      ${s.kode_undangan ? `<a class="btn btn-green btn-sm" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(`Bapak/Ibu guru ${s.nama}, silakan bergabung di Master Teacher Planner: ${location.origin + location.pathname} — kode undangan sekolah: ${s.kode_undangan}`)}">${ic('send', 'ic-s')}Bagikan lewat WhatsApp</a>` : ''}</aside></div>`;
}

async function dokumen(el) {
  const r = await api('doc.list', { sekolah: true });
  const list = r.data || [];
  el.innerHTML = list.length ? `<div class="card" style="padding:.75rem"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Nomor</th><th>Jenis</th><th>Judul</th><th>Penerbit</th><th>Status</th><th>Verifikasi</th></tr></thead><tbody>${list.map((d) => `<tr><td class="small"><b>${esc(d.nomor)}</b></td><td class="small">${esc(d.jenisLabel)}</td><td class="small">${esc(d.judul)}</td><td class="small">${esc(d.penerbit)}</td><td><span class="badge ${d.status === 'TERBIT' ? 'b-gr' : d.status === 'DITARIK' ? 'b-red' : 'b-mt'}">${esc(d.status.replace('_', ' '))}</span></td><td><a class="btn btn-ghost btn-xs" href="#/verifikasi/${esc(d.kode)}">${ic('qr', 'ic-s')}${esc(d.kode.slice(0, 6))}…</a></td></tr>`).join('')}</tbody></table></div></div>` : `<div class="card">${emptyState({ icon: 'qr', title: 'Belum ada dokumen terbit' })}</div>`;
}

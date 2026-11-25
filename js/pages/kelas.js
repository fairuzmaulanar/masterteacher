// Kelas & Presensi: presensi satu ketukan, data siswa, rekap bulanan (heatmap), catatan anekdot.
import { ic } from '../core/icons.js';
import { esc, today, fmtTgl, addDays, parseYmd, ymd, BULAN, toast, modal, debounce, waLink, uid, hariKe } from '../core/util.js';
import { S, simpanPrefs, isDemo } from '../core/state.js';
import { db } from '../core/store.js';
import { delegasi, kelasList, siswaKelas, pilihKelasChips, avatarWarna, emptyState, segmen, perluKelas, mapelKelas } from '../core/ui.js';
import { dialogKelas, dialogSiswa, dialogImporSiswa, dialogMapel } from '../core/form.js';
import { rekapAbsen, persenHadir, namaKelas } from '../core/hitung.js';
import { ABSEN, LIBUR_TETAP } from '../core/kurikulum.js';
import { kopHtml, ttdHtml, cetak, eksporXlsx, terbitkan, verifHtml } from '../core/dokumen.js';
import { pergi } from '../core/router.js';

const KET_JENIS = { perilaku: 'Perilaku', akademik: 'Akademik', prestasi: 'Prestasi', kesehatan: 'Kesehatan', lainnya: 'Lainnya' };

export default {
  title: 'Kelas & Presensi',
  deps: ['Kelas', 'Siswa', 'Absensi', 'Catatan', 'Mapel'],
  async render(el, ctx) {
    const q = ctx.query;
    if (q.baru && !ctx.sudahBaru) { ctx.sudahBaru = true; const id = await dialogKelas(); if (id) { pergi('/kelas?tab=siswa&k=' + id); return; } }
    if (q.k && db.get('Kelas', q.k) && S.prefs.kelas !== q.k) simpanPrefs({ kelas: q.k });
    const kelas = kelasList();
    if (!kelas.length) { perluKelas(el); return; }
    const k = db.get('Kelas', S.prefs.kelas) || kelas[0];
    ctx.st = ctx.st || { tab: q.tab || 'presensi', tgl: q.tgl || today(), bulan: today().slice(0, 7), cari: '' };
    if (q.tab && !ctx.tabDipakai) { ctx.st.tab = q.tab; ctx.tabDipakai = true; }
    const st = ctx.st;
    const siswa = siswaKelas(k.id);

    el.innerHTML = `
      <div class="page-h"><div><div class="crumbs"><a href="#/hari-ini">Beranda</a>${ic('chevr', 'ic-s')}<b>Kelas & Presensi</b></div><h1>Kelas ${esc(k.nama)}</h1>
        <p class="sub">Fase ${esc(k.fase || '-')} · ${siswa.length} siswa · Wali kelas: ${esc(k.wali || '-')} · TA ${esc(k.tahun_ajaran || '')}</p></div>
        <div class="row"><button class="btn btn-white btn-sm" data-act="ubah-kelas">${ic('edit', 'ic-s')}Ubah kelas</button></div></div>
      ${pilihKelasChips(k.id)}
      <div class="row between row-wrap" style="margin:1rem 0">${segmen([['presensi', 'Presensi'], ['siswa', 'Data Siswa'], ['rekap', 'Rekap Bulanan'], ['catatan', 'Catatan Anekdot']], st.tab)}</div>
      <div id="isi"></div>`;
    const isi = el.querySelector('#isi');
    if (st.tab === 'presensi') tabPresensi(isi, k, siswa, st, ctx);
    else if (st.tab === 'siswa') tabSiswa(isi, k, siswa, st, ctx);
    else if (st.tab === 'rekap') tabRekap(isi, k, siswa, st);
    else tabCatatan(isi, k, siswa, st);

    delegasi(el, {
      'pilih-kelas': (b) => { simpanPrefs({ kelas: b.dataset.id }); ctx.rerender(); },
      'kelas-baru': async () => { const id = await dialogKelas(); if (id) ctx.rerender(); },
      'ubah-kelas': async () => { await dialogKelas(k); ctx.rerender(); },
      tab: (b) => { st.tab = b.dataset.tab; ctx.rerender(); },
      ...aksiPresensi(el, k, siswa, st, ctx),
      ...aksiSiswa(k, ctx),
      ...aksiRekap(k, siswa, st, ctx),
      ...aksiCatatan(k, ctx)
    });
    if (q.siswa && !ctx.siswaDibuka) { ctx.siswaDibuka = true; const s = db.get('Siswa', q.siswa); if (s) setTimeout(() => profilSiswa(s), 50); }
  }
};

// ================= PRESENSI =================
const idAbsen = (k, t) => `A-${k}-${t}`;
function hitungRingkas(a, siswa) {
  const c = { H: 0, S: 0, I: 0, A: 0, kosong: 0 };
  siswa.forEach((s) => { const v = a && a.status ? a.status[s.id] : null; if (v && c[v] !== undefined) c[v]++; else c.kosong++; });
  return c;
}
function tabPresensi(el, k, siswa, st) {
  if (!siswa.length) { el.innerHTML = `<div class="card">${emptyState({ icon: 'users', title: 'Belum ada siswa', text: 'Tambahkan siswa satu per satu atau impor dari Excel/Dapodik.', action: `<div class="row"><button class="btn btn-primary" data-act="impor">${ic('upload', 'ic-s')}Impor daftar</button><button class="btn btn-white" data-act="siswa-baru">${ic('plus', 'ic-s')}Tambah siswa</button></div>` })}</div>`; return; }
  const a = db.get('Absensi', idAbsen(k.id, st.tgl));
  const c = hitungRingkas(a, siswa);
  const libur = LIBUR_TETAP[st.tgl.slice(5)] || (hariKe(st.tgl) === 0 ? 'Hari Minggu' : '');
  el.innerHTML = `
    <div class="card card-s" style="margin-bottom:1rem"><div class="row between row-wrap">
      <div class="row"><button class="btn btn-ghost btn-icon btn-sm" data-act="tgl-geser" data-n="-1" aria-label="Hari sebelumnya">${ic('chevl')}</button>
        <label class="field" style="gap:0"><span class="sr-only">Tanggal</span><input type="date" class="input" data-act-change="tgl" value="${st.tgl}" max="${today()}" style="min-height:40px;width:auto"></label>
        <button class="btn btn-ghost btn-icon btn-sm" data-act="tgl-geser" data-n="1" aria-label="Hari berikutnya" ${st.tgl >= today() ? 'disabled' : ''}>${ic('chevr')}</button>
        <b class="hide-m">${fmtTgl(st.tgl)}</b>${libur ? `<span class="badge b-red">${esc(libur)}</span>` : ''}</div>
      <div class="row"><button class="btn btn-green btn-sm" data-act="semua-hadir">${ic('checkc', 'ic-s')}Tandai semua hadir</button></div></div>
      <div class="grid g4" style="margin-top:.85rem;gap:.5rem" id="ringkas">${ringkasHtml(c, siswa.length)}</div>
    </div>
    <div class="search" style="margin-bottom:.75rem">${ic('search')}<input class="input" type="search" placeholder="Cari siswa…" data-cari value="${esc(st.cari)}"></div>
    <div class="grid g2" id="daftar" style="gap:.6rem">${siswa.map((s, i) => barisAbsen(s, a, i)).join('')}</div>
    <div class="row row-wrap" style="margin-top:1rem;justify-content:flex-end"><span class="small muted grow">${ic('info', 'ic-s')} Tersimpan otomatis di perangkat setiap ketukan${S.mode === 'cloud' ? ' dan dikirim ke cloud di latar belakang' : ''}.</span>
      ${c.S + c.I + c.A ? `<button class="btn btn-white btn-sm" data-act="kabari-wali">${ic('message', 'ic-s')}Kabari wali (${c.S + c.I + c.A})</button>` : ''}</div>`;
  const inp = el.querySelector('[data-cari]');
  inp.oninput = debounce(() => { st.cari = inp.value; const q = inp.value.toLowerCase(); el.querySelectorAll('[data-sid]').forEach((r) => { r.classList.toggle('hide', !r.dataset.nama.includes(q)); }); }, 150);
  if (st.cari) inp.oninput();
}
function ringkasHtml(c, n) {
  return [['H', 'Hadir', 'var(--gr-bg)', 'var(--gr)'], ['S', 'Sakit', '#DBEAFE', '#1D4ED8'], ['I', 'Izin', 'var(--qs-bg)', 'var(--qs)'], ['A', 'Alfa', 'var(--red-bg)', 'var(--red)']]
    .map(([k, l, bg, fg]) => `<div style="background:${bg};color:${fg};border-radius:14px;padding:.55rem .75rem"><div class="tiny bold">${l}</div><b style="font-size:1.25rem">${c[k]}</b>${k === 'H' ? `<span class="tiny"> / ${n}${c.kosong ? ` · ${c.kosong} belum` : ''}</span>` : ''}</div>`).join('');
}
function barisAbsen(s, a, i) {
  const v = a && a.status ? a.status[s.id] : '';
  const ket = a && a.ket ? a.ket[s.id] || '' : '';
  return `<div class="att-row" data-sid="${s.id}" data-nama="${esc(s.nama.toLowerCase())}">
    <div class="row">${avatarWarna(s.nama, i)}<span class="grow"><b class="truncate" style="display:block">${esc(s.nama)}</b><span class="tiny muted">No. ${esc(s.no || i + 1)}${s.kebutuhan ? ' · ' + esc(s.kebutuhan) : ''}</span></span>
      <button class="btn btn-ghost btn-icon btn-xs" data-act="ket" data-sid="${s.id}" aria-label="Keterangan untuk ${esc(s.nama)}" title="Keterangan">${ic('note', 'ic-s')}</button></div>
    <div class="att-btns" role="group" aria-label="Status kehadiran ${esc(s.nama)}">${Object.keys(ABSEN).map((x) => `<button type="button" data-act="absen" data-s="${x}" data-sid="${s.id}" aria-pressed="${v === x}" title="${ABSEN[x]}">${x}</button>`).join('')}</div>
    ${ket ? `<span class="tiny muted" data-ket>${ic('note', 'ic-s')} ${esc(ket)}</span>` : ''}
  </div>`;
}
function aksiPresensi(el, k, siswa, st, ctx) {
  const tulis = (status, ket) => {
    const f = { kelas_id: k.id, tanggal: st.tgl, status };
    if (ket) f.ket = ket;
    db.put('Absensi', idAbsen(k.id, st.tgl), f, { senyap: true });
    const a = db.get('Absensi', idAbsen(k.id, st.tgl));
    const r = el.querySelector('#ringkas');
    if (r) r.innerHTML = ringkasHtml(hitungRingkas(a, siswa), siswa.length);
  };
  return {
    absen: (b) => {
      const sid = b.dataset.sid, s = b.dataset.s;
      const grup = b.parentElement;
      const sebelum = grup.querySelector('[aria-pressed="true"]');
      const lepas = sebelum === b; // ketuk lagi = batalkan
      grup.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', 'false'));
      if (!lepas) b.setAttribute('aria-pressed', 'true');
      tulis({ [sid]: lepas ? null : s });
      if (navigator.vibrate) navigator.vibrate(8);
    },
    'semua-hadir': () => {
      const a = db.get('Absensi', idAbsen(k.id, st.tgl));
      const status = {};
      siswa.forEach((s) => { if (!a || !a.status || !a.status[s.id]) status[s.id] = 'H'; });
      if (!Object.keys(status).length) { toast('Semua siswa sudah tercatat.', 'info'); return; }
      tulis(status);
      el.querySelectorAll('.att-row').forEach((r) => { if (status[r.dataset.sid]) r.querySelector('[data-s="H"]').setAttribute('aria-pressed', 'true'); });
      toast(`${Object.keys(status).length} siswa ditandai hadir. Ubah yang tidak hadir dengan satu ketukan.`);
    },
    ket: async (b) => {
      const s = db.get('Siswa', b.dataset.sid);
      const a = db.get('Absensi', idAbsen(k.id, st.tgl));
      const r = await modal({ title: 'Keterangan · ' + s.nama, body: `<label class="field"><span>Keterangan (mis. surat dokter, acara keluarga)</span><input class="input" name="ket" value="${esc(a && a.ket ? a.ket[s.id] || '' : '')}" autofocus></label>`, actions: [{ label: 'Batal', value: null, cls: 'btn-ghost' }, { label: 'Simpan', value: 'ok', cls: 'btn-dark' }] });
      if (r.value !== 'ok') return;
      db.put('Absensi', idAbsen(k.id, st.tgl), { kelas_id: k.id, tanggal: st.tgl, ket: { [s.id]: r.form.ket.trim() || null } });
    },
    tgl: (i) => { st.tgl = i.value || today(); ctx.rerender(); },
    'tgl-geser': (b) => { const t = addDays(st.tgl, Number(b.dataset.n)); if (t <= today()) { st.tgl = t; ctx.rerender(); } },
    'kabari-wali': async () => {
      const a = db.get('Absensi', idAbsen(k.id, st.tgl));
      const list = siswa.filter((s) => a && a.status && ['S', 'I', 'A'].includes(a.status[s.id]));
      const auto = S.mode === 'cloud';
      await modal({
        title: 'Kabari orang tua/wali',
        wide: true,
        body: `<p class="small muted" style="margin-bottom:.75rem">${auto ? 'Jika admin mengaktifkan notifikasi WA, pemberitahuan dikirim otomatis dari server setelah sinkron (sesuai pengaturan di menu Komunikasi). Anda juga dapat mengirim manual:' : 'Kirim pesan WhatsApp manual dari perangkat Anda:'}</p>
          <div class="list">${list.map((s) => { const st2 = ABSEN[a.status[s.id]].toLowerCase(); const pesan = `Yth. Bapak/Ibu ${s.nama_wali || 'wali'} ${s.nama},\nKami informasikan ananda ${s.nama} (Kelas ${k.nama}) tercatat ${st2} pada ${fmtTgl(st.tgl)}.${a.ket && a.ket[s.id] ? ' Keterangan: ' + a.ket[s.id] + '.' : ''}\nTerima kasih.\n— ${(S.user || {}).nama || ''}`;
            return `<div class="li flat"><span class="grow"><b>${esc(s.nama)}</b> <span class="badge ${a.status[s.id] === 'A' ? 'b-red' : 'b-mt'}">${ABSEN[a.status[s.id]]}</span><br><span class="tiny muted">${esc(s.hp_wali || 'Nomor WA wali belum diisi')}</span></span>${s.hp_wali ? `<a class="btn btn-green btn-sm" target="_blank" rel="noopener" href="${waLink(s.hp_wali, pesan)}">${ic('send', 'ic-s')}WhatsApp</a>` : ''}</div>`; }).join('')}</div>`
      });
    }
  };
}

// ================= DATA SISWA =================
function tabSiswa(el, k, siswa, st) {
  const mapel = mapelKelas(k.id);
  el.innerHTML = `<div class="split-8">
    <div class="card"><div class="section-h"><h3>${ic('users')}Daftar Siswa <span class="badge">${siswa.length}</span></h3>
      <div class="row"><button class="btn btn-white btn-sm" data-act="impor">${ic('upload', 'ic-s')}Impor</button><button class="btn btn-dark btn-sm" data-act="siswa-baru">${ic('plus', 'ic-s')}Tambah</button></div></div>
      ${siswa.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>No</th><th>Nama</th><th class="hide-m">NISN</th><th>L/P</th><th class="hide-m">Wali</th><th>WA wali</th><th></th></tr></thead><tbody>
      ${siswa.map((s, i) => `<tr><td class="num">${esc(s.no || i + 1)}</td><td><b>${esc(s.nama)}</b>${s.kebutuhan ? `<br><span class="tiny muted">${esc(s.kebutuhan)}</span>` : ''}</td><td class="hide-m">${esc(s.nisn || '-')}</td><td>${esc(s.jk || '-')}</td><td class="hide-m">${esc(s.nama_wali || '-')}</td><td>${s.hp_wali ? esc(s.hp_wali) : '<span class="badge b-qs">kosong</span>'}</td>
        <td style="white-space:nowrap"><button class="btn btn-ghost btn-xs" data-act="profil" data-id="${s.id}">Profil</button><button class="btn btn-ghost btn-xs" data-act="ubah-siswa" data-id="${s.id}" aria-label="Ubah ${esc(s.nama)}">${ic('edit', 'ic-s')}</button></td></tr>`).join('')}
      </tbody></table></div>` : emptyState({ icon: 'users', title: 'Belum ada siswa', text: 'Impor dari Excel/Dapodik: salin kolom nama (dan NISN, HP wali bila ada), lalu tempel.' })}
    </div>
    <div class="col gap-l"><div class="card"><div class="section-h"><h3>${ic('book')}Mata Pelajaran</h3><button class="btn btn-white btn-sm" data-act="mapel-baru">${ic('plus', 'ic-s')}Tambah</button></div>
      <div class="list">${mapel.map((m) => `<button class="li flat hover" style="border:0;cursor:pointer;text-align:left" data-act="ubah-mapel" data-id="${m.id}"><span class="grow"><b>${esc(m.nama)}</b><br><span class="tiny muted">${esc(m.jp || '-')} JP/minggu · KKTP ${esc(m.kktp || 75)}</span></span>${ic('edit', 'ic-s')}</button>`).join('') || '<p class="small muted">Belum ada mata pelajaran.</p>'}</div></div>
      <div class="card card-sky small">${ic('shield', 'ic-s')} <b>Privasi data anak</b><p class="muted" style="margin-top:.25rem">Sesuai UU PDP 27/2022: data siswa hanya untuk keperluan pembelajaran, tidak dibagikan ke pihak lain, dan nama disamarkan sebelum dikirim ke AI.</p></div></div>
  </div>`;
}
function aksiSiswa(k, ctx) {
  return {
    'siswa-baru': async () => { if (await dialogSiswa(k.id)) ctx.rerender(); },
    'ubah-siswa': async (b) => { await dialogSiswa(k.id, db.get('Siswa', b.dataset.id)); ctx.rerender(); },
    impor: async () => { if (await dialogImporSiswa(k.id)) ctx.rerender(); },
    'mapel-baru': async () => { if (await dialogMapel(k.id)) ctx.rerender(); },
    'ubah-mapel': async (b) => { await dialogMapel(k.id, db.get('Mapel', b.dataset.id)); ctx.rerender(); },
    profil: (b) => profilSiswa(db.get('Siswa', b.dataset.id))
  };
}
async function profilSiswa(s) {
  const d30 = addDays(today(), -30);
  const r = rekapAbsen(s.kelas_id, d30, today())[s.id] || { H: 0, S: 0, I: 0, A: 0, n: 0 };
  const nilai = db.all('Asesmen', (a) => a.kelas_id === s.kelas_id && (a.nilai || {})[s.id] !== undefined).sort((a, b) => String(b.tanggal).localeCompare(String(a.tanggal))).slice(0, 8);
  const cat = db.all('Catatan', (c) => c.siswa_id === s.id && !String(c.jenis).startsWith('rapor')).sort((a, b) => String(b.tanggal).localeCompare(String(a.tanggal)));
  const res = await modal({
    title: s.nama, wide: true,
    body: `<div class="grid g4" style="gap:.5rem;margin-bottom:1rem">${[['Hadir', r.H, 'b-gr'], ['Sakit', r.S, 'b-mt'], ['Izin', r.I, 'b-qs'], ['Alfa', r.A, 'b-red']].map(([l, v, c]) => `<div class="card-flat"><span class="badge ${c}">${l}</span><div class="kpi-v" style="font-size:1.4rem">${v}</div><span class="tiny muted">30 hari</span></div>`).join('')}</div>
      <div class="grid g2"><div><h4 style="margin-bottom:.5rem">Nilai terbaru</h4><div class="list">${nilai.map((a) => `<div class="li flat"><span class="grow small"><b>${esc(a.nama)}</b><br><span class="tiny muted">${fmtTgl(a.tanggal, 'pendek')}</span></span><b>${esc(a.nilai[s.id])}</b></div>`).join('') || '<p class="small muted">Belum ada nilai.</p>'}</div></div>
      <div><h4 style="margin-bottom:.5rem">Catatan anekdot</h4><div class="list">${cat.map((c) => `<div class="li flat small"><span class="grow"><span class="badge">${esc(KET_JENIS[c.jenis] || c.jenis)}</span> <span class="tiny muted">${fmtTgl(c.tanggal, 'pendek')}</span><br>${esc(c.isi)}</span></div>`).join('') || '<p class="small muted">Belum ada catatan.</p>'}</div></div></div>
      <div class="divider"></div><p class="small"><b>Wali:</b> ${esc(s.nama_wali || '-')} · ${esc(s.hp_wali || 'WA belum diisi')}${s.kebutuhan ? ` · <b>Kebutuhan:</b> ${esc(s.kebutuhan)}` : ''}</p>`,
    actions: [{ label: 'Tambah catatan', value: 'cat', cls: 'btn-white' }, ...(s.hp_wali ? [{ label: 'WhatsApp wali', value: 'wa', cls: 'btn-green' }] : []), { label: 'Tutup', value: null, cls: 'btn-dark' }]
  });
  if (res.value === 'cat') dialogCatatan(s);
  if (res.value === 'wa') window.open(waLink(s.hp_wali, `Yth. Bapak/Ibu wali ${s.nama}, `), '_blank', 'noopener');
}

// ================= REKAP =================
function hariSekolahBulan(bulan) {
  const [y, m] = bulan.split('-').map(Number);
  const out = [];
  for (let d = new Date(y, m - 1, 1); d.getMonth() === m - 1; d.setDate(d.getDate() + 1)) { const t = ymd(d); if (d.getDay() !== 0 && !LIBUR_TETAP[t.slice(5)]) out.push(t); }
  return out;
}
function tabRekap(el, k, siswa, st) {
  const hari = hariSekolahBulan(st.bulan).filter((t) => t <= today());
  const absen = {};
  db.all('Absensi', (a) => a.kelas_id === k.id && a.tanggal.startsWith(st.bulan)).forEach((a) => { absen[a.tanggal] = a; });
  const terisi = hari.filter((t) => absen[t]);
  const rek = rekapAbsen(k.id, st.bulan + '-01', st.bulan + '-31');
  const [y, m] = st.bulan.split('-').map(Number);
  const tot = Object.values(rek).reduce((a, r) => ({ H: a.H + r.H, n: a.n + r.n }), { H: 0, n: 0 });
  el.innerHTML = `<div class="card">
    <div class="section-h row-wrap"><div class="row"><button class="btn btn-ghost btn-icon btn-sm" data-act="bulan" data-n="-1" aria-label="Bulan sebelumnya">${ic('chevl')}</button><h3>${BULAN[m - 1]} ${y}</h3><button class="btn btn-ghost btn-icon btn-sm" data-act="bulan" data-n="1" aria-label="Bulan berikutnya">${ic('chevr')}</button>
      <span class="badge b-gr">${tot.n ? Math.round((tot.H / tot.n) * 1000) / 10 : 0}% hadir</span><span class="badge">${terisi.length}/${hari.length} hari tercatat</span></div>
      <div class="row"><button class="btn btn-white btn-sm" data-act="rekap-xlsx">${ic('download', 'ic-s')}Excel</button><button class="btn btn-white btn-sm" data-act="rekap-cetak">${ic('print', 'ic-s')}Cetak</button><button class="btn btn-dark btn-sm" data-act="rekap-terbit">${ic('qr', 'ic-s')}Terbitkan ber-QR</button></div></div>
    ${terisi.length ? `<div class="tbl-wrap"><table class="tbl heat"><thead><tr><th class="sticky-col">Nama</th>${terisi.map((t) => `<th class="num" title="${fmtTgl(t)}">${Number(t.slice(8))}</th>`).join('')}<th class="num">H</th><th class="num">S</th><th class="num">I</th><th class="num">A</th><th class="num">%</th></tr></thead><tbody>
      ${siswa.map((s) => { const r = rek[s.id] || { H: 0, S: 0, I: 0, A: 0, n: 0 }; const p = persenHadir(r); return `<tr class="${p !== null && p < 80 ? 'warn' : ''}"><td class="sticky-col" style="white-space:nowrap;font-weight:600">${esc(s.nama)}</td>${terisi.map((t) => { const v = (absen[t].status || {})[s.id] || ''; return `<td class="${v.toLowerCase()}">${v === 'H' ? '•' : v}</td>`; }).join('')}<td class="num">${r.H}</td><td class="num">${r.S}</td><td class="num">${r.I}</td><td class="num">${r.A}</td><td class="num"><b>${p ?? '-'}</b></td></tr>`; }).join('')}
    </tbody></table></div><p class="tiny muted" style="margin-top:.5rem">• = hadir · S = sakit · I = izin · A = alfa. Baris merah: kehadiran di bawah 80%.</p>` : emptyState({ icon: 'calendar', title: 'Belum ada presensi bulan ini', text: 'Rekap muncul otomatis setelah presensi diisi.' })}
  </div>`;
  st._rekap = { hari: terisi, absen, rek };
}
function isiRekap(k, siswa, st) {
  const { hari, absen, rek } = st._rekap;
  const [y, m] = st.bulan.split('-').map(Number);
  const judul = `Rekap Presensi Kelas ${k.nama} — ${BULAN[m - 1]} ${y}`;
  const tabel = `<table><thead><tr><th>No</th><th>Nama</th>${hari.map((t) => `<th>${Number(t.slice(8))}</th>`).join('')}<th>H</th><th>S</th><th>I</th><th>A</th><th>%</th></tr></thead><tbody>${siswa.map((s, i) => { const r = rek[s.id] || { H: 0, S: 0, I: 0, A: 0, n: 0 }; return `<tr><td class="num">${i + 1}</td><td>${esc(s.nama)}</td>${hari.map((t) => `<td class="num">${((absen[t].status || {})[s.id] || '').replace('H', '•')}</td>`).join('')}<td class="num">${r.H}</td><td class="num">${r.S}</td><td class="num">${r.I}</td><td class="num">${r.A}</td><td class="num">${persenHadir(r) ?? '-'}</td></tr>`; }).join('')}</tbody></table>`;
  return { judul, tabel };
}
function aksiRekap(k, siswa, st, ctx) {
  return {
    bulan: (b) => { const [y, m] = st.bulan.split('-').map(Number); const d = new Date(y, m - 1 + Number(b.dataset.n), 1); st.bulan = ymd(d).slice(0, 7); ctx.rerender(); },
    'rekap-xlsx': () => {
      const { hari, absen, rek } = st._rekap;
      eksporXlsx(`Rekap Presensi ${k.nama} ${st.bulan}`, [{ nama: 'Rekap ' + st.bulan, lebar: [5, 28, ...hari.map(() => 4), 5, 5, 5, 5, 7], baris: [['No', 'Nama', ...hari.map((t) => Number(t.slice(8))), 'H', 'S', 'I', 'A', '%'], ...siswa.map((s, i) => { const r = rek[s.id] || { H: 0, S: 0, I: 0, A: 0, n: 0 }; return [i + 1, s.nama, ...hari.map((t) => (absen[t].status || {})[s.id] || ''), r.H, r.S, r.I, r.A, persenHadir(r) ?? '']; })] }]);
    },
    'rekap-cetak': (b, e, dok) => { const { judul, tabel } = isiRekap(k, siswa, st); cetak(judul, `${kopHtml()}<h1>${esc(judul)}</h1><p class="c">Wali kelas: ${esc(k.wali || '-')} · Tahun ajaran ${esc(k.tahun_ajaran || '')}</p>${tabel}${ttdHtml()}${verifHtml(dok)}`, { landscape: true }); },
    'rekap-terbit': async () => {
      const { judul, tabel } = isiRekap(k, siswa, st);
      try {
        const dok = await terbitkan({ jenis: 'ABSEN', ref_id: `ABS-${k.id}-${st.bulan}`, judul, isiKanonik: judul + tabel, ringkasan: `${siswa.length} siswa, ${st._rekap.hari.length} hari efektif` });
        cetak(judul, `${kopHtml()}<h1>${esc(judul)}</h1>${dok ? `<p class="c">Nomor: ${esc(dok.nomor)}</p>` : ''}<p class="c">Wali kelas: ${esc(k.wali || '-')} · Tahun ajaran ${esc(k.tahun_ajaran || '')}</p>${tabel}${ttdHtml()}${verifHtml(dok)}`, { landscape: true });
      } catch (e) { toast(e.message, 'err'); }
    }
  };
}

// ================= CATATAN =================
function tabCatatan(el, k, siswa) {
  const nama = {}; siswa.forEach((s) => { nama[s.id] = s.nama; });
  const list = db.all('Catatan', (c) => c.kelas_id === k.id && !String(c.jenis).startsWith('rapor')).sort((a, b) => String(b.tanggal).localeCompare(String(a.tanggal)));
  el.innerHTML = `<div class="card"><div class="section-h"><h3>${ic('note')}Catatan Anekdot</h3><button class="btn btn-dark btn-sm" data-act="catatan-baru">${ic('plus', 'ic-s')}Catatan baru</button></div>
    <div class="list">${list.map((c) => `<div class="li flat"><span class="badge ${c.jenis === 'prestasi' ? 'b-gr' : c.jenis === 'perilaku' ? 'b-qs' : 'b-mt'}">${esc(KET_JENIS[c.jenis] || c.jenis)}</span><span class="grow"><b>${esc(nama[c.siswa_id] || '-')}</b> <span class="tiny muted">· ${fmtTgl(c.tanggal, 'pendek')}</span><br><span class="small">${esc(c.isi)}</span></span><button class="btn btn-ghost btn-icon btn-xs" data-act="hapus-catatan" data-id="${c.id}" aria-label="Hapus catatan">${ic('trash', 'ic-s')}</button></div>`).join('') || emptyState({ icon: 'note', title: 'Belum ada catatan', text: 'Catat perkembangan perilaku, prestasi, atau kebutuhan belajar siswa untuk bahan rapor dan komunikasi dengan wali.' })}</div></div>`;
}
async function dialogCatatan(s, kelasId) {
  const siswa = s ? [s] : siswaKelas(kelasId);
  const r = await modal({ title: 'Catatan anekdot', body: `<div class="col gap-l">
    <label class="field"><span>Siswa</span><select class="input" name="siswa_id">${siswa.map((x) => `<option value="${x.id}">${esc(x.nama)}</option>`).join('')}</select></label>
    <div class="grid g2"><label class="field"><span>Jenis</span><select class="input" name="jenis">${Object.entries(KET_JENIS).map(([k2, l]) => `<option value="${k2}">${l}</option>`).join('')}</select></label>
    <label class="field"><span>Tanggal</span><input class="input" type="date" name="tanggal" value="${today()}"></label></div>
    <label class="field"><span>Catatan</span><textarea class="input" name="isi" required rows="4" placeholder="Apa yang diamati, konteksnya, dan tindak lanjut."></textarea></label></div>`,
  actions: [{ label: 'Batal', value: null, cls: 'btn-ghost' }, { label: 'Simpan', value: 'ok', cls: 'btn-dark' }] });
  if (r.value !== 'ok') return;
  const sw = db.get('Siswa', r.form.siswa_id);
  db.put('Catatan', uid('C'), { siswa_id: sw.id, kelas_id: sw.kelas_id, tanggal: r.form.tanggal, jenis: r.form.jenis, isi: r.form.isi.trim() });
  toast('Catatan disimpan.');
}
function aksiCatatan(k, ctx) {
  return {
    'catatan-baru': async () => { await dialogCatatan(null, k.id); },
    'hapus-catatan': async (b) => { db.del('Catatan', b.dataset.id); toast('Catatan dihapus.'); }
  };
}
export { idAbsen };

// Beranda "Hari Ini": jadwal mengajar berjalan, aksi cepat, ringkasan presensi/koreksi, peringatan dini.
import { ic } from '../core/icons.js';
import { esc, today, fmtTgl, salam, jamSekarang, menitDari, addDays } from '../core/util.js';
import { S, isKepsek } from '../core/state.js';
import { db } from '../core/store.js';
import { kelasAktif, avatarWarna, emptyState } from '../core/ui.js';
import { namaKelas, namaMapel, jadwalHari, rppUntuk, tumpukanKoreksi, labelTenggat, perluPerhatian, senin } from '../core/hitung.js';
import { tahunAjaran } from '../core/kurikulum.js';

const WARNA = { pl: 't-pl', mt: 't-mt', gr: 't-gr', at: 't-at', qs: 't-qs', ai: 't-ai' };

export default {
  title: 'Hari Ini',
  deps: ['Jadwal', 'RPP', 'Absensi', 'Tugas', 'Siswa', 'Asesmen', 'Catatan', 'Agenda', 'Kelas', 'Mapel'],
  render(el, ctx) {
    const t = today();
    const u = S.user || {};
    const sapaan = (u.nama || 'Bapak/Ibu').split(',')[0];
    const jadwal = jadwalHari(t);
    const now = menitDari(jamSekarang());
    const koreksi = tumpukanKoreksi();
    const totalKoreksi = koreksi.reduce((a, x) => a + x.sisa, 0);
    const perhatian = perluPerhatian(5);

    // Kehadiran hari ini (semua kelas yang sudah diabsen)
    let hadir = 0, catat = 0, izinSakit = 0;
    db.all('Absensi', (a) => a.tanggal === t).forEach((a) => Object.values(a.status || {}).forEach((s) => { catat++; if (s === 'H') hadir++; if (s === 'S' || s === 'I') izinSakit++; }));
    const pHadir = catat ? Math.round((hadir / catat) * 1000) / 10 : null;

    // RPP minggu ini: slot jadwal minggu ini vs RPP bertanggal minggu ini
    const sen = senin(t), ming = addDays(sen, 6);
    const slot = db.count('Jadwal');
    const rppMinggu = db.count('RPP', (r) => r.tanggal >= sen && r.tanggal <= ming);
    const target = Math.max(slot, rppMinggu, 1);
    const pRpp = Math.round((rppMinggu / target) * 100);

    const k = kelasAktif();
    const jumlahKoreksiHariIni = koreksi.filter((x) => x.t.tenggat === t).length;

    el.innerHTML = `
    <div class="page-h">
      <div>
        <div class="row small muted" style="gap:.5rem;margin-bottom:.35rem;align-items:center"><span class="badge b-navy" style="flex-shrink:0">${esc(jamSekarang())} WIB</span><span style="min-width:0">${[S.sekolah ? esc(S.sekolah.nama) : '', k ? 'Kelas ' + esc(k.nama) : '', 'TA ' + tahunAjaran()].filter(Boolean).join(' · ')}</span></div>
        <h1>${salam()}, ${esc(sapaan)}.</h1>
        <p class="sub">${fmtTgl(t)} · Anda memiliki <b>${jadwal.length} jadwal mengajar</b> dan <b>${totalKoreksi} berkas koreksi</b> hari ini.</p>
      </div>
      <div class="row">${isKepsek() && S.sekolah ? `<a class="btn btn-dark" href="#/sekolah">${ic('school', 'ic-s')}Portal Kepala Sekolah</a>` : ''}<a class="btn btn-primary" href="#/rencana/baru">${ic('plus', 'ic-s')}Buat Modul Ajar</a></div>
    </div>

    <div class="grid g4">
      <a class="tile t-pl" href="#/rencana/baru"><span class="tile-ic">${ic('book')}</span><span><b style="display:block">Buat RPP Mendalam</b><span class="small">Pembelajaran Mendalam 2026</span></span></a>
      <a class="tile t-at" href="#/kelas?tab=presensi${k ? '&k=' + k.id : ''}"><span class="tile-ic">${ic('usercheck')}</span><span><b style="display:block">Presensi Cepat</b><span class="small">${k ? 'Absen Kelas ' + esc(k.nama) : 'Absen satu ketukan'}</span></span></a>
      <a class="tile t-gr" href="#/nilai"><span class="tile-ic">${ic('chart')}</span><span><b style="display:block">Asesmen Harian</b><span class="small">Input nilai formatif</span></span></a>
      <a class="tile t-qs" href="#/tugas"><span class="tile-ic">${ic('pen')}</span><span><b style="display:block">Pemeriksaan</b><span class="small">Catat koreksi tugas</span></span></a>
    </div>

    <div class="grid g4 section">
      <div class="card card-s"><div class="row between"><span class="small bold muted">RPP Minggu Ini</span><span class="badge b-gr">${pRpp}% tercapai</span></div>
        <div class="kpi-v" style="margin:.4rem 0">${rppMinggu}<span class="small muted" style="font-weight:600"> / ${target} modul</span></div><div class="bar"><i style="width:${Math.min(100, pRpp)}%"></i></div></div>
      <div class="card card-s"><div class="row between"><span class="small bold muted">Kehadiran Hari Ini</span>${pHadir !== null ? `<span class="badge ${pHadir >= 90 ? 'b-gr' : pHadir >= 80 ? 'b-qs' : 'b-red'}">${pHadir >= 90 ? 'Tinggi' : pHadir >= 80 ? 'Sedang' : 'Rendah'}</span>` : ''}</div>
        <div class="kpi-v" style="margin:.4rem 0">${pHadir !== null ? pHadir + '%' : '—'}</div><p class="tiny muted">${catat ? `${hadir} dari ${catat} siswa hadir${izinSakit ? ` (${izinSakit} izin/sakit)` : ''}` : 'Belum ada presensi hari ini'}</p></div>
      <div class="card card-s"><div class="row between"><span class="small bold muted">Tumpukan Koreksi</span><span class="badge b-qs">Antrean</span></div>
        <div class="kpi-v" style="margin:.4rem 0">${totalKoreksi}<span class="small muted" style="font-weight:600"> berkas</span></div><p class="tiny muted">${jumlahKoreksiHariIni ? jumlahKoreksiHariIni + ' tugas jatuh tempo hari ini' : 'Tidak ada yang jatuh tempo hari ini'}</p></div>
      <div class="card card-s"><div class="row between"><span class="small bold muted">Perlu Perhatian</span><span class="badge ${perhatian.length ? 'b-red' : 'b-gr'}">${perhatian.length ? 'Prioritas' : 'Aman'}</span></div>
        <div class="kpi-v" style="margin:.4rem 0">${perhatian.length}<span class="small muted" style="font-weight:600"> siswa</span></div><p class="tiny muted">Kehadiran berulang & nilai di bawah KKTP</p></div>
    </div>

    <div class="split section">
      <section class="col gap-l">
        <div class="section-h"><h3>${ic('calendar')}Jadwal Mengajar Hari Ini</h3><span class="badge">${jadwal.length} pertemuan</span></div>
        ${jadwal.length ? jadwal.map((j) => kartuJadwal(j, now, t)).join('') : `<div class="card">${emptyState({ icon: 'calendar', title: 'Tidak ada jadwal hari ini', text: 'Atur jadwal mingguan agar presensi dan RPP muncul otomatis di sini.', action: '<a class="btn btn-outline" href="#/jadwal">Atur jadwal</a>' })}</div>`}
        ${rosterRingkas(t)}
      </section>
      <aside class="col gap-l">
        <div class="card"><div class="section-h"><h3>${ic('pen')}Pelacak Koreksi</h3><span class="badge">${koreksi.length} tugas</span></div>
          <div class="list">${koreksi.slice(0, 4).map(({ t: tg, sisa }) => { const l = labelTenggat(tg.tenggat); return `<a class="li flat" href="#/tugas"><span class="icon-box" style="background:var(--qs-bg);color:var(--qs)">${ic('file')}</span><span class="grow"><b class="truncate" style="display:block">${esc(tg.judul)}</b><span class="tiny muted">Kelas ${esc(namaKelas(tg.kelas_id))} · ${sisa} berkas belum dikoreksi</span></span><span class="badge ${l.c}">${l.l}</span></a>`; }).join('') || '<p class="small muted">Semua koreksi beres. 🎉</p>'}</div>
          <a class="btn btn-ghost btn-sm btn-block" href="#/tugas" style="margin-top:.5rem">Buka semua koreksi ${ic('arrowr', 'ic-s')}</a></div>
        <div class="card"><div class="section-h"><h3>${ic('alert')}Siswa Perlu Perhatian</h3><span class="badge ${perhatian.length ? 'b-red' : ''}">${perhatian.length} terdeteksi</span></div>
          <div class="list">${perhatian.map((p, i) => `<a class="li flat" href="#/kelas?tab=siswa&k=${p.siswa.kelas_id}&siswa=${p.siswa.id}">${avatarWarna(p.siswa.nama, i)}<span class="grow"><b class="truncate" style="display:block">${esc(p.siswa.nama)}</b><span class="tiny muted">${esc(p.alasan[0])}${p.alasan.length > 1 ? ` · +${p.alasan.length - 1} catatan` : ''}</span></span>${ic('chevr', 'ic-s')}</a>`).join('') || '<p class="small muted">Tidak ada peringatan. Semua siswa dalam pantauan baik.</p>'}</div></div>
        ${agendaRingkas(t)}
      </aside>
    </div>`;

    // Perbarui penanda "sedang berlangsung" tiap menit tanpa render ulang penuh berat
    const timer = setInterval(() => { if (document.visibilityState === 'visible' && !el.classList.contains('inactive')) ctx.rerender(); }, 60000);
    ctx.cleanup = () => clearInterval(timer);
  },
  onShow(el, ctx) { /* data sudah segar dari cache tampilan */ }
};

function kartuJadwal(j, now, t) {
  const mulai = menitDari(j.mulai), selesai = menitDari(j.selesai);
  const status = now >= mulai && now < selesai ? 'now' : now < mulai ? 'next' : 'done';
  const rpp = rppUntuk(j.kelas_id, j.mapel_id, t);
  const m = db.get('Mapel', j.mapel_id) || {};
  const sudahAbsen = !!db.get('Absensi', `A-${j.kelas_id}-${t}`);
  const label = status === 'now' ? `<span class="badge b-yel"><span class="dot pulse"></span> Sedang berlangsung</span>` : status === 'next' ? '<span class="badge b-mt">Akan datang</span>' : '<span class="badge b-draf">Selesai</span>';
  const sisa = status === 'now' ? ` (${selesai - now} menit lagi)` : status === 'next' && mulai - now < 120 ? ` (mulai ${mulai - now} menit lagi)` : '';
  return `<div class="card timeline-card ${status === 'now' ? 'now' : ''}" style="${status === 'done' ? 'opacity:.85' : ''}">
    <div class="row between row-wrap"><div class="row row-wrap">${label}<span class="small bold" style="color:var(--navy)">${esc(j.mulai)} – ${esc(j.selesai)} WIB${sisa}</span></div><span class="small muted">${ic('school', 'ic-s')} ${esc(j.ruang || 'Kelas ' + namaKelas(j.kelas_id))}</span></div>
    <h3 style="margin:.5rem 0 .2rem">${esc(m.nama || '-')} · Kelas ${esc(namaKelas(j.kelas_id))}</h3>
    <p class="small muted">${rpp ? `Topik: ${esc(rpp.judul || rpp.materi)}` : 'Belum ada RPP untuk pertemuan ini'}</p>
    <div class="row row-wrap" style="margin-top:.8rem">
      <a class="btn ${status === 'now' && !sudahAbsen ? 'btn-primary' : 'btn-white'} btn-sm" href="#/kelas?tab=presensi&k=${j.kelas_id}">${ic(sudahAbsen ? 'checkc' : 'usercheck', 'ic-s')}${sudahAbsen ? 'Presensi tercatat' : 'Absen sekarang'}</a>
      <a class="btn btn-white btn-sm" href="${rpp ? '#/rencana/' + rpp.id : `#/rencana/baru?k=${j.kelas_id}&m=${j.mapel_id}`}">${ic('book', 'ic-s')}${rpp ? 'Buka RPP' : 'Buat RPP'}</a>
      <a class="btn btn-white btn-sm" href="#/nilai?k=${j.kelas_id}&m=${j.mapel_id}">${ic('chart', 'ic-s')}Catat nilai</a>
      <a class="btn btn-ghost btn-sm" href="#/jadwal?tab=jurnal&j=${j.id}">${ic('note', 'ic-s')}Jurnal</a>
    </div></div>`;
}

function rosterRingkas(t) {
  const k = kelasAktif();
  if (!k) return '';
  const a = db.get('Absensi', `A-${k.id}-${t}`);
  const siswa = db.all('Siswa', (s) => s.kelas_id === k.id && String(s.aktif) !== '0');
  if (!a) return `<div class="card card-sky row between row-wrap"><span><b>Roster Kelas ${esc(k.nama)}</b><br><span class="small muted">Presensi hari ini belum diisi · ${siswa.length} siswa</span></span><a class="btn btn-dark btn-sm" href="#/kelas?tab=presensi&k=${k.id}">Buka lembar presensi</a></div>`;
  const tidak = Object.entries(a.status || {}).filter(([, s]) => s !== 'H').map(([sid, s]) => { const x = db.get('Siswa', sid); return x ? `${x.nama} (${({ S: 'sakit', I: 'izin', A: 'alfa' })[s]})` : null; }).filter(Boolean);
  return `<div class="card card-sky row between row-wrap"><span><b>Roster Kelas ${esc(k.nama)} aktif</b><br><span class="small muted">${tidak.length ? esc(tidak.join(', ')) + '; siswa lainnya hadir.' : 'Seluruh siswa tercatat hadir.'}</span></span><a class="btn btn-white btn-sm" href="#/kelas?tab=presensi&k=${k.id}">Buka lembar</a></div>`;
}
function agendaRingkas(t) {
  const list = db.all('Agenda', (a) => (a.sampai || a.tanggal) >= t).sort((a, b) => String(a.tanggal).localeCompare(String(b.tanggal))).slice(0, 4);
  return `<div class="card"><div class="section-h"><h3>${ic('calendar')}Agenda Terdekat</h3><a class="small bold" href="#/jadwal?tab=kalender">Kalender</a></div>
    <div class="list">${list.map((a) => `<div class="li flat"><span class="icon-box" style="background:var(--mt-bg);color:var(--mt)">${ic('calendar')}</span><span class="grow"><b class="truncate" style="display:block">${esc(a.judul)}</b><span class="tiny muted">${fmtTgl(a.tanggal, 'hari')}${a.sampai && a.sampai !== a.tanggal ? ' – ' + fmtTgl(a.sampai, 'hari') : ''}</span></span></div>`).join('') || '<p class="small muted">Belum ada agenda.</p>'}</div></div>`;
}

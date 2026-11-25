// Jadwal & Jurnal: jadwal mingguan, jurnal mengajar harian, kalender akademik.
import { ic } from '../core/icons.js';
import { esc, toast, uid, modal, konfirmasi, today, fmtTgl, HARI, BULAN, ymd, parseYmd, addDays, menitDari, hariKe } from '../core/util.js';
import { db } from '../core/store.js';
import { delegasi, kelasList, mapelKelas, emptyState, segmen, perluKelas } from '../core/ui.js';
import { namaKelas, namaMapel, jadwalHari, rppUntuk } from '../core/hitung.js';
import { LIBUR_TETAP } from '../core/kurikulum.js';
import { kopHtml, ttdHtml, cetak, terbitkan, verifHtml } from '../core/dokumen.js';

const WARNA = { pl: ['var(--pl-bg)', 'var(--pl)'], mt: ['var(--mt-bg)', 'var(--mt)'], gr: ['var(--gr-bg)', 'var(--gr)'], at: ['var(--at-bg)', 'var(--at)'], qs: ['var(--qs-bg)', 'var(--qs)'], ai: ['var(--ai-bg)', 'var(--ai)'] };
const URUT = ['pl', 'mt', 'gr', 'at', 'qs', 'ai'];
function warnaMapel(id) { const m = db.get('Mapel', id) || {}; if (m.warna && WARNA[m.warna]) return WARNA[m.warna]; const all = db.all('Mapel').map((x) => x.id).sort(); return WARNA[URUT[all.indexOf(id) % URUT.length]] || WARNA.mt; }
const JENIS_AGENDA = { libur: 'Libur', asesmen: 'Asesmen', rapat: 'Rapat', kegiatan: 'Kegiatan', lainnya: 'Lainnya' };

export default {
  title: 'Jadwal & Jurnal',
  deps: ['Jadwal', 'Jurnal', 'Agenda', 'Kelas', 'Mapel', 'RPP', 'Absensi'],
  render(el, ctx) {
    if (!kelasList().length) { perluKelas(el); return; }
    ctx.st = ctx.st || { tab: ctx.query.tab || 'minggu', bulan: today().slice(0, 7) };
    const st = ctx.st;
    el.innerHTML = `<div class="page-h"><div><div class="crumbs"><a href="#/hari-ini">Beranda</a>${ic('chevr', 'ic-s')}<b>Jadwal & Jurnal</b></div><h1>Jadwal & Jurnal</h1><p class="sub">Jadwal mingguan memicu pengingat presensi, RPP, dan jurnal di beranda.</p></div>
      <div class="row">${st.tab === 'minggu' ? `<button class="btn btn-primary" data-act="slot-baru">${ic('plus', 'ic-s')}Tambah jadwal</button>` : st.tab === 'jurnal' ? `<button class="btn btn-primary" data-act="jurnal-baru">${ic('plus', 'ic-s')}Isi jurnal</button>` : `<button class="btn btn-primary" data-act="agenda-baru">${ic('plus', 'ic-s')}Agenda</button>`}</div></div>
      <div style="margin-bottom:1rem">${segmen([['minggu', 'Jadwal Mingguan'], ['jurnal', 'Jurnal Mengajar'], ['kalender', 'Kalender']], st.tab)}</div><div id="isi"></div>`;
    const isi = el.querySelector('#isi');
    if (st.tab === 'minggu') tabMinggu(isi); else if (st.tab === 'jurnal') tabJurnal(isi, st); else tabKalender(isi, st);
    delegasi(el, {
      tab: (b) => { st.tab = b.dataset.tab; ctx.rerender(); },
      'slot-baru': (b) => dialogSlot(null, b.dataset.hari),
      slot: (b) => dialogSlot(db.get('Jadwal', b.dataset.id)),
      'jurnal-baru': (b) => dialogJurnal(null, b.dataset.jadwal),
      jurnal: (b) => dialogJurnal(db.get('Jurnal', b.dataset.id)),
      'jurnal-cetak': () => cetakJurnal(st, false),
      'jurnal-terbit': () => cetakJurnal(st, true),
      bulan: (b) => { const [y, m] = st.bulan.split('-').map(Number); st.bulan = ymd(new Date(y, m - 1 + Number(b.dataset.n), 1)).slice(0, 7); ctx.rerender(); },
      'agenda-baru': (b) => dialogAgenda(null, b.dataset.tgl),
      agenda: (b) => dialogAgenda(db.get('Agenda', b.dataset.id))
    });
    if (ctx.query.j && !ctx.qj) { ctx.qj = 1; st.tab = 'jurnal'; setTimeout(() => dialogJurnal(null, ctx.query.j), 50); }
  }
};

function tabMinggu(el) {
  const semua = db.all('Jadwal');
  const h = hariKe(today());
  el.innerHTML = semua.length ? `<div class="week">${[1, 2, 3, 4, 5, 6].map((d) => { const isi = semua.filter((j) => Number(j.hari) === d).sort((a, b) => String(a.mulai).localeCompare(String(b.mulai))); const jp = isi.reduce((a, j) => a + (menitDari(j.selesai) - menitDari(j.mulai)), 0);
    return `<div class="day" style="${d === h ? 'box-shadow:inset 0 0 0 2px var(--yellow)' : ''}"><div class="row between"><b>${HARI[d]}</b><span class="tiny muted">${isi.length ? Math.round(jp / 60 * 10) / 10 + ' jam' : ''}</span></div>
      ${isi.map((j) => { const [bg, fg] = warnaMapel(j.mapel_id); return `<button class="slot" data-act="slot" data-id="${j.id}" style="background:${bg};color:${fg}"><b>${esc(j.mulai)}–${esc(j.selesai)}</b><br>${esc(namaMapel(j.mapel_id))}<br><span style="opacity:.8">Kelas ${esc(namaKelas(j.kelas_id))}${j.ruang ? ' · ' + esc(j.ruang) : ''}</span></button>`; }).join('')}
      <button class="slot" data-act="slot-baru" data-hari="${d}" style="background:transparent;border:1.5px dashed var(--line-2);color:var(--muted);text-align:center">${ic('plus', 'ic-s')}</button></div>`; }).join('')}</div>`
    : `<div class="card">${emptyState({ icon: 'calendar', title: 'Jadwal belum diatur', text: 'Masukkan jadwal mengajar sekali — beranda akan menampilkan kelas yang sedang berlangsung beserta pintasan presensi, RPP, dan nilai.', action: `<button class="btn btn-primary" data-act="slot-baru">${ic('plus', 'ic-s')}Tambah jadwal</button>` })}</div>`;
}
async function dialogSlot(j, hari) {
  const kelas = kelasList();
  const kid = j ? j.kelas_id : kelas[0].id;
  const r = await modal({ title: j ? 'Ubah jadwal' : 'Jadwal baru', body: `<div class="col gap-l">
    <div class="grid g3"><label class="field"><span>Hari</span><select class="input" name="hari">${[1, 2, 3, 4, 5, 6].map((d) => `<option value="${d}" ${Number(j ? j.hari : hari || 1) === d ? 'selected' : ''}>${HARI[d]}</option>`).join('')}</select></label>
    <label class="field"><span>Mulai</span><input class="input" type="time" name="mulai" required value="${j ? j.mulai : '07:30'}"></label><label class="field"><span>Selesai</span><input class="input" type="time" name="selesai" required value="${j ? j.selesai : '09:00'}"></label></div>
    <div class="grid g2"><label class="field"><span>Kelas</span><select class="input" name="kelas_id" data-ganti>${kelas.map((k) => `<option value="${k.id}" ${k.id === kid ? 'selected' : ''}>Kelas ${esc(k.nama)}</option>`).join('')}</select></label>
    <label class="field"><span>Mata pelajaran</span><select class="input" name="mapel_id">${mapelKelas(kid).map((m) => `<option value="${m.id}" ${j && j.mapel_id === m.id ? 'selected' : ''}>${esc(m.nama)}</option>`).join('')}</select></label></div>
    <label class="field"><span>Ruang</span><input class="input" name="ruang" value="${esc(j ? j.ruang : '')}" placeholder="mis. Ruang Kelas 4-B / Lab IPA"></label></div>`,
  actions: [...(j ? [{ label: 'Hapus', value: 'hapus', cls: 'btn-ghost' }] : []), { label: 'Batal', value: null, cls: 'btn-ghost' }, { label: 'Simpan', value: 'ok', cls: 'btn-dark', validate: (f) => (menitDari(f.selesai) <= menitDari(f.mulai) ? 'Jam selesai harus setelah jam mulai.' : !f.mapel_id ? 'Kelas ini belum punya mapel.' : '') }],
  onOpen: (d) => { d.querySelector('[data-ganti]').onchange = (e) => { d.querySelector('[name=mapel_id]').innerHTML = mapelKelas(e.target.value).map((m) => `<option value="${m.id}">${esc(m.nama)}</option>`).join(''); }; } });
  if (r.value === 'hapus') { if (await konfirmasi('Hapus jadwal ini?', { bahaya: true, ya: 'Hapus' })) db.del('Jadwal', j.id); return; }
  if (r.value !== 'ok') return;
  const f = r.form;
  const bentrok = db.all('Jadwal', (x) => (!j || x.id !== j.id) && Number(x.hari) === Number(f.hari) && menitDari(x.mulai) < menitDari(f.selesai) && menitDari(f.mulai) < menitDari(x.selesai));
  if (bentrok.length && !(await konfirmasi(`Bentrok dengan ${esc(namaMapel(bentrok[0].mapel_id))} kelas ${esc(namaKelas(bentrok[0].kelas_id))} (${bentrok[0].mulai}–${bentrok[0].selesai}). Tetap simpan?`, { ya: 'Tetap simpan' }))) return;
  db.put('Jadwal', j ? j.id : uid('J'), { hari: Number(f.hari), mulai: f.mulai, selesai: f.selesai, kelas_id: f.kelas_id, mapel_id: f.mapel_id, ruang: f.ruang.trim() });
  toast('Jadwal disimpan.');
}

function tabJurnal(el, st) {
  const t = today();
  const belum = jadwalHari(t).filter((j) => !db.count('Jurnal', (x) => x.tanggal === t && x.jadwal_id === j.id));
  const list = db.all('Jurnal', (x) => x.tanggal.startsWith(st.bulan)).sort((a, b) => String(b.tanggal).localeCompare(String(a.tanggal)));
  const [y, m] = st.bulan.split('-').map(Number);
  el.innerHTML = `${belum.length ? `<div class="card card-sky" style="margin-bottom:1rem"><b>Jurnal hari ini belum diisi</b><div class="row row-wrap" style="margin-top:.5rem">${belum.map((j) => `<button class="btn btn-white btn-sm" data-act="jurnal-baru" data-jadwal="${j.id}">${ic('note', 'ic-s')}${esc(j.mulai)} · ${esc(namaMapel(j.mapel_id))} ${esc(namaKelas(j.kelas_id))}</button>`).join('')}</div></div>` : ''}
    <div class="card"><div class="section-h row-wrap"><div class="row"><button class="btn btn-ghost btn-icon btn-sm" data-act="bulan" data-n="-1" aria-label="Bulan sebelumnya">${ic('chevl')}</button><h3>${BULAN[m - 1]} ${y}</h3><button class="btn btn-ghost btn-icon btn-sm" data-act="bulan" data-n="1" aria-label="Bulan berikutnya">${ic('chevr')}</button><span class="badge">${list.length} entri</span></div>
      <div class="row"><button class="btn btn-white btn-sm" data-act="jurnal-cetak">${ic('print', 'ic-s')}Cetak</button><button class="btn btn-dark btn-sm" data-act="jurnal-terbit">${ic('qr', 'ic-s')}Terbitkan ber-QR</button></div></div>
    ${list.length ? `<div class="list">${list.map((j) => `<button class="li flat hover" data-act="jurnal" data-id="${j.id}" style="border:0;text-align:left;cursor:pointer;align-items:flex-start"><span class="icon-box" style="background:var(--surface);color:var(--navy)">${ic('note')}</span><span class="grow"><b>${esc(j.topik || '-')}</b> <span class="tiny muted">· ${fmtTgl(j.tanggal, 'hari')} · ${esc(namaMapel(j.mapel_id))} ${esc(namaKelas(j.kelas_id))}</span><br><span class="small muted">${esc(j.kegiatan || '')}</span>${j.kendala ? `<br><span class="tiny" style="color:var(--qs)">Kendala: ${esc(j.kendala)}</span>` : ''}</span><span class="badge b-gr">${esc(j.hadir || 0)} hadir</span></button>`).join('')}</div>` : emptyState({ icon: 'note', title: 'Belum ada jurnal bulan ini', text: 'Jurnal mengajar terisi otomatis dari jadwal, RPP, dan presensi — Anda cukup melengkapi catatan singkat.' })}</div>`;
}
async function dialogJurnal(j, jadwalId) {
  const t = j ? j.tanggal : today();
  const jd = jadwalId ? db.get('Jadwal', jadwalId) : null;
  const kelas_id = j ? j.kelas_id : jd ? jd.kelas_id : kelasList()[0].id;
  const mapel_id = j ? j.mapel_id : jd ? jd.mapel_id : (mapelKelas(kelas_id)[0] || {}).id;
  const rpp = j ? db.get('RPP', j.rpp_id) : rppUntuk(kelas_id, mapel_id, t);
  const a = db.get('Absensi', `A-${kelas_id}-${t}`);
  const hadir = a ? Object.values(a.status || {}).filter((s) => s === 'H').length : '';
  const tidak = a ? Object.values(a.status || {}).filter((s) => s !== 'H').length : '';
  const r = await modal({ title: j ? 'Jurnal mengajar' : 'Isi jurnal mengajar', wide: true, body: `<div class="col gap-l">
    <div class="grid g3"><label class="field"><span>Tanggal</span><input class="input" type="date" name="tanggal" value="${t}"></label><label class="field"><span>Kelas</span><select class="input" name="kelas_id">${kelasList().map((k) => `<option value="${k.id}" ${k.id === kelas_id ? 'selected' : ''}>Kelas ${esc(k.nama)}</option>`).join('')}</select></label>
    <label class="field"><span>Mata pelajaran</span><select class="input" name="mapel_id">${db.all('Mapel').map((m) => `<option value="${m.id}" ${m.id === mapel_id ? 'selected' : ''}>${esc(m.nama)} (${esc(namaKelas(m.kelas_id))})</option>`).join('')}</select></label></div>
    <label class="field"><span>Topik / materi</span><input class="input" name="topik" required value="${esc(j ? j.topik : rpp ? rpp.judul || rpp.materi : '')}"></label>
    <label class="field"><span>Kegiatan pembelajaran</span><textarea class="input" name="kegiatan" rows="3">${esc(j ? j.kegiatan : rpp && rpp.isi && rpp.isi.desain ? 'Sesuai RPP: ' + (rpp.isi.desain.praktik_pedagogis || '') : '')}</textarea></label>
    <div class="grid g2"><label class="field"><span>Hadir</span><input class="input" type="number" name="hadir" value="${esc(j ? j.hadir : hadir)}"></label><label class="field"><span>Tidak hadir</span><input class="input" type="number" name="tidak_hadir" value="${esc(j ? j.tidak_hadir : tidak)}"></label></div>
    <div class="grid g2"><label class="field"><span>Kendala</span><textarea class="input" name="kendala" rows="2">${esc(j ? j.kendala : '')}</textarea></label><label class="field"><span>Tindak lanjut</span><textarea class="input" name="tindak_lanjut" rows="2">${esc(j ? j.tindak_lanjut : '')}</textarea></label></div></div>`,
  actions: [...(j ? [{ label: 'Hapus', value: 'hapus', cls: 'btn-ghost' }] : []), { label: 'Batal', value: null, cls: 'btn-ghost' }, { label: 'Simpan', value: 'ok', cls: 'btn-dark' }] });
  if (r.value === 'hapus') { if (await konfirmasi('Hapus jurnal ini?', { bahaya: true, ya: 'Hapus' })) db.del('Jurnal', j.id); return; }
  if (r.value !== 'ok') return;
  const f = r.form;
  db.put('Jurnal', j ? j.id : uid('JR'), { tanggal: f.tanggal, jadwal_id: j ? j.jadwal_id : jadwalId || '', kelas_id: f.kelas_id, mapel_id: f.mapel_id, rpp_id: rpp ? rpp.id : '', topik: f.topik.trim(), kegiatan: f.kegiatan.trim(), hadir: Number(f.hadir) || 0, tidak_hadir: Number(f.tidak_hadir) || 0, kendala: f.kendala.trim(), tindak_lanjut: f.tindak_lanjut.trim() });
  toast('Jurnal disimpan.');
}
async function cetakJurnal(st, terbit) {
  const list = db.all('Jurnal', (x) => x.tanggal.startsWith(st.bulan)).sort((a, b) => String(a.tanggal).localeCompare(String(b.tanggal)));
  if (!list.length) { toast('Belum ada jurnal bulan ini.', 'info'); return; }
  const [y, m] = st.bulan.split('-').map(Number);
  const judul = `Jurnal Mengajar — ${BULAN[m - 1]} ${y}`;
  const tabel = `<table><thead><tr><th>No</th><th>Hari/Tanggal</th><th>Kelas</th><th>Mapel</th><th>Topik</th><th>Kegiatan</th><th>H/TH</th><th>Kendala & tindak lanjut</th></tr></thead><tbody>${list.map((j, i) => `<tr><td class="num">${i + 1}</td><td>${fmtTgl(j.tanggal, 'hari')}</td><td>${esc(namaKelas(j.kelas_id))}</td><td>${esc(namaMapel(j.mapel_id))}</td><td>${esc(j.topik)}</td><td>${esc(j.kegiatan)}</td><td class="num">${esc(j.hadir)}/${esc(j.tidak_hadir)}</td><td>${esc([j.kendala, j.tindak_lanjut].filter(Boolean).join(' → '))}</td></tr>`).join('')}</tbody></table>`;
  let dok = null;
  if (terbit) { try { dok = await terbitkan({ jenis: 'JURNAL', ref_id: 'JRN-' + st.bulan, judul, isiKanonik: judul + tabel, ringkasan: list.length + ' entri' }); } catch (e) { toast(e.message, 'err'); } }
  cetak(judul, `${kopHtml()}<h1>${esc(judul)}</h1>${dok ? `<p class="c">Nomor: ${esc(dok.nomor)}</p>` : ''}${tabel}${ttdHtml()}${verifHtml(dok)}`, { landscape: true });
}

function tabKalender(el, st) {
  const [y, m] = st.bulan.split('-').map(Number);
  const awal = new Date(y, m - 1, 1);
  const mulai = addDays(ymd(awal), -((awal.getDay() + 6) % 7));
  const t = today();
  const agenda = db.all('Agenda');
  const sel = [];
  for (let i = 0; i < 42; i++) {
    const d = addDays(mulai, i);
    const ev = agenda.filter((a) => d >= a.tanggal && d <= (a.sampai || a.tanggal));
    const lb = LIBUR_TETAP[d.slice(5)] || (hariKe(d) === 0 ? '' : '');
    sel.push(`<div class="cd ${d.slice(0, 7) !== st.bulan ? 'out' : ''} ${lb || ev.some((e) => e.jenis === 'libur') ? 'libur' : ''} ${d === t ? 'today' : ''}" ${d.slice(0, 7) === st.bulan ? `data-act="agenda-baru" data-tgl="${d}" style="cursor:pointer"` : ''}><b style="${hariKe(d) === 0 ? 'color:var(--red)' : ''}">${Number(d.slice(8))}</b>${lb ? `<span class="ev" style="background:transparent;color:var(--red)">${esc(lb)}</span>` : ''}${ev.map((e) => `<span class="ev" data-act="agenda" data-id="${e.id}" title="${esc(e.judul)}">${esc(e.judul)}</span>`).join('')}</div>`);
  }
  const list = agenda.filter((a) => a.tanggal.startsWith(st.bulan) || (a.sampai || '').startsWith(st.bulan)).sort((a, b) => String(a.tanggal).localeCompare(String(b.tanggal)));
  el.innerHTML = `<div class="split-8"><div class="card"><div class="section-h"><div class="row"><button class="btn btn-ghost btn-icon btn-sm" data-act="bulan" data-n="-1" aria-label="Bulan sebelumnya">${ic('chevl')}</button><h3>${BULAN[m - 1]} ${y}</h3><button class="btn btn-ghost btn-icon btn-sm" data-act="bulan" data-n="1" aria-label="Bulan berikutnya">${ic('chevr')}</button></div></div>
    <div class="cal" style="margin-bottom:4px">${['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((h) => `<div class="tiny bold muted" style="text-align:center">${h}</div>`).join('')}</div><div class="cal">${sel.join('')}</div></div>
    <aside class="card"><h3 style="margin-bottom:.75rem">Agenda bulan ini</h3><div class="list">${list.map((a) => `<button class="li flat hover" data-act="agenda" data-id="${a.id}" style="border:0;text-align:left;cursor:pointer"><span class="badge ${a.jenis === 'libur' ? 'b-red' : a.jenis === 'asesmen' ? 'b-qs' : 'b-mt'}">${esc(JENIS_AGENDA[a.jenis] || a.jenis)}</span><span class="grow small"><b>${esc(a.judul)}</b><br><span class="tiny muted">${fmtTgl(a.tanggal, 'hari')}${a.sampai && a.sampai !== a.tanggal ? ' – ' + fmtTgl(a.sampai, 'hari') : ''}</span></span></button>`).join('') || '<p class="small muted">Belum ada agenda.</p>'}</div>
    <p class="tiny muted" style="margin-top:1rem">Libur nasional bertanggal tetap sudah ditandai. Libur keagamaan & cuti bersama berubah tiap tahun — tambahkan sebagai agenda jenis "Libur" sesuai SKB resmi.</p></aside></div>`;
}
async function dialogAgenda(a, tgl) {
  const r = await modal({ title: a ? 'Ubah agenda' : 'Agenda baru', body: `<div class="col gap-l"><label class="field"><span>Judul</span><input class="input" name="judul" required value="${esc(a ? a.judul : '')}"></label>
    <div class="grid g3"><label class="field"><span>Mulai</span><input class="input" type="date" name="tanggal" required value="${a ? a.tanggal : tgl || today()}"></label><label class="field"><span>Sampai</span><input class="input" type="date" name="sampai" value="${a ? a.sampai || '' : ''}"></label>
    <label class="field"><span>Jenis</span><select class="input" name="jenis">${Object.entries(JENIS_AGENDA).map(([k, l]) => `<option value="${k}" ${a && a.jenis === k ? 'selected' : ''}>${l}</option>`).join('')}</select></label></div></div>`,
  actions: [...(a ? [{ label: 'Hapus', value: 'hapus', cls: 'btn-ghost' }] : []), { label: 'Batal', value: null, cls: 'btn-ghost' }, { label: 'Simpan', value: 'ok', cls: 'btn-dark' }] });
  if (r.value === 'hapus') { db.del('Agenda', a.id); return; }
  if (r.value !== 'ok') return;
  db.put('Agenda', a ? a.id : uid('AG'), { judul: r.form.judul.trim(), tanggal: r.form.tanggal, sampai: r.form.sampai && r.form.sampai > r.form.tanggal ? r.form.sampai : '', jenis: r.form.jenis });
  toast('Agenda disimpan.');
}

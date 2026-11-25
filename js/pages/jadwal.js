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
      bulan: (b) => { if (st.tab === 'kalender') geserBulan(st, Number(b.dataset.n), isi); else { const [y, m] = st.bulan.split('-').map(Number); st.bulan = ymd(new Date(y, m - 1 + Number(b.dataset.n), 1)).slice(0, 7); ctx.rerender(); } },
      'bulan-ini': () => { st.bulan = today().slice(0, 7); st.tgl = today(); tabKalender(isi, st); },
      'pilih-tgl': (b) => { const d = b.dataset.tgl; if (d.slice(0, 7) !== st.bulan) st.bulan = d.slice(0, 7); st.tgl = d; tabKalender(isi, st); },
      'agenda-baru': (b) => dialogAgenda(null, b.dataset.tgl || (st.tab === 'kalender' ? st.tgl : '')),
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
      ${isi.map((j) => { const [bg, fg] = warnaMapel(j.mapel_id); return `<button class="slot" data-act="slot" data-id="${j.id}" style="background:${bg};color:${fg}"><b>${esc(j.mulai)}–${esc(j.selesai)}</b><br>${esc(namaMapel(j.mapel_id))}<br><span style="opacity:.92">Kelas ${esc(namaKelas(j.kelas_id))}${j.ruang ? ' · ' + esc(j.ruang) : ''}</span></button>`; }).join('')}
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

// ---------- Kalender (tampilan bulan ala Google Calendar / kalender ponsel) ----------
const WARNA_AGENDA = { libur: 'red', asesmen: 'qs', rapat: 'mt', kegiatan: 'gr', lainnya: 'at', ajar: 'ai' };
const MAKS_BARIS = 3; // baris acara per minggu sebelum "+N lagi" (tampilan lebar)
function acaraKalender(dari, sampai) {
  const ev = db.all('Agenda', (a) => a.tanggal && a.tanggal <= sampai && (a.sampai || a.tanggal) >= dari)
    .map((a) => ({ id: a.id, judul: a.judul, jenis: a.jenis || 'lainnya', mulai: a.tanggal, akhir: a.sampai && a.sampai > a.tanggal ? a.sampai : a.tanggal }));
  const y0 = Number(dari.slice(0, 4)), y1 = Number(sampai.slice(0, 4));
  for (let y = y0; y <= y1; y++) Object.entries(LIBUR_TETAP).forEach(([md, judul]) => { const d = `${y}-${md}`; if (d >= dari && d <= sampai) ev.push({ id: '', judul, jenis: 'libur', mulai: d, akhir: d, nasional: true }); });
  return ev.sort((a, b) => a.mulai.localeCompare(b.mulai) || b.akhir.localeCompare(a.akhir) || a.judul.localeCompare(b.judul));
}
const chipAttr = (e) => (e.id ? `data-act="agenda" data-id="${e.id}"` : `data-act="pilih-tgl" data-tgl="${e.mulai}"`);
function tabKalender(el, st) {
  const [y, m] = st.bulan.split('-').map(Number);
  const awal = ymd(new Date(y, m - 1, 1));
  const akhirBln = ymd(new Date(y, m, 0));
  const mulai = addDays(awal, -((parseYmd(awal).getDay() + 6) % 7));
  const nMinggu = Math.ceil((((parseYmd(awal).getDay() + 6) % 7) + Number(akhirBln.slice(8))) / 7);
  const selesai = addDays(mulai, nMinggu * 7 - 1);
  const t = today();
  if (!st.tgl || st.tgl.slice(0, 7) !== st.bulan) st.tgl = t.slice(0, 7) === st.bulan ? t : awal;
  const semua = acaraKalender(mulai, selesai);
  const libur = (d) => semua.some((e) => e.jenis === 'libur' && d >= e.mulai && d <= e.akhir);
  const minggu = [];
  for (let w = 0; w < nMinggu; w++) {
    const w0 = addDays(mulai, w * 7), w1 = addDays(w0, 6);
    // Bagi acara ke dalam lajur (lane) agar acara beberapa hari tampil sebagai satu batang menerus.
    const lajur = [], tersembunyi = Array(7).fill(0), batang = [];
    semua.filter((e) => e.mulai <= w1 && e.akhir >= w0).forEach((e) => {
      const s = Math.max(0, Math.round((parseYmd(e.mulai) - parseYmd(w0)) / 864e5));
      const f = Math.min(6, Math.round((parseYmd(e.akhir) - parseYmd(w0)) / 864e5));
      let l = lajur.findIndex((akhir) => akhir < s);
      if (l === -1) { l = lajur.length; lajur.push(-1); }
      lajur[l] = f;
      if (l < MAKS_BARIS) batang.push({ e, s, f, l, sambungKiri: e.mulai < w0, sambungKanan: e.akhir > w1 });
      else for (let i = s; i <= f; i++) tersembunyi[i]++;
    });
    const hari = [];
    for (let i = 0; i < 7; i++) {
      const d = addDays(w0, i);
      const ev = semua.filter((e) => d >= e.mulai && d <= e.akhir);
      const kls = ['gcal-d', d.slice(0, 7) !== st.bulan ? 'out' : '', i >= 5 ? 'we' : '', libur(d) ? 'libur' : '', d === t ? 'today' : '', d === st.tgl ? 'sel' : ''].filter(Boolean).join(' ');
      hari.push(`<button type="button" class="${kls}" data-act="pilih-tgl" data-tgl="${d}" aria-label="${fmtTgl(d)}${ev.length ? ', ' + ev.length + ' acara' : ''}" aria-pressed="${d === st.tgl}"><span class="gcal-n">${Number(d.slice(8))}</span>${ev.length ? `<span class="gcal-dots" aria-hidden="true">${ev.slice(0, 3).map((e) => `<i class="dot-${WARNA_AGENDA[e.jenis] || 'at'}"></i>`).join('')}${ev.length > 3 ? '<b>+</b>' : ''}</span>` : ''}</button>`);
    }
    const lagi = tersembunyi.map((n, i) => (n ? `<button type="button" class="gcal-more" style="grid-column:${i + 1};grid-row:${MAKS_BARIS + 1}" data-act="pilih-tgl" data-tgl="${addDays(w0, i)}">+${n} lagi</button>` : '')).join('');
    minggu.push(`<div class="gcal-wk"><div class="gcal-days">${hari.join('')}</div><div class="gcal-evs">${batang.map(({ e, s, f, l, sambungKiri, sambungKanan }) => `<button type="button" class="gcal-ev ev-${WARNA_AGENDA[e.jenis] || 'at'}${sambungKiri ? ' kiri' : ''}${sambungKanan ? ' kanan' : ''}" style="grid-column:${s + 1} / span ${f - s + 1};grid-row:${l + 1}" ${chipAttr(e)} title="${esc(e.judul)}">${esc(e.judul)}</button>`).join('')}${lagi}</div></div>`);
  }
  // Panel hari terpilih: acara + jadwal mengajar (seperti tampilan hari di kalender ponsel)
  const evHari = semua.filter((e) => st.tgl >= e.mulai && st.tgl <= e.akhir);
  const ajar = libur(st.tgl) || hariKe(st.tgl) === 0 ? [] : jadwalHari(st.tgl);
  const rentang = (e) => (e.akhir !== e.mulai ? `${fmtTgl(e.mulai, 'hari')} – ${fmtTgl(e.akhir, 'hari')}` : 'Sepanjang hari');
  const itemAcara = (e) => `<button type="button" class="gcal-item" ${chipAttr(e)}><i class="gcal-bar ev-${WARNA_AGENDA[e.jenis] || 'at'}"></i><span class="grow"><b>${esc(e.judul)}</b><span class="tiny muted">${rentang(e)} · ${e.nasional ? 'Libur nasional' : esc(JENIS_AGENDA[e.jenis] || e.jenis)}</span></span></button>`;
  const bulanIni = semua.filter((e) => e.akhir >= awal && e.mulai <= akhirBln);
  const dT = parseYmd(st.tgl);
  el.innerHTML = `<div class="split-8 gcal-wrap"><div class="card gcal-card">
      <div class="gcal-bar-top"><div class="row" style="gap:.35rem"><button class="btn btn-white btn-sm" data-act="bulan-ini" ${t.slice(0, 7) === st.bulan && st.tgl === t ? 'disabled' : ''}>Hari ini</button><button class="btn btn-ghost btn-icon btn-sm" data-act="bulan" data-n="-1" aria-label="Bulan sebelumnya">${ic('chevl')}</button><button class="btn btn-ghost btn-icon btn-sm" data-act="bulan" data-n="1" aria-label="Bulan berikutnya">${ic('chevr')}</button></div>
        <h3 class="gcal-title">${BULAN[m - 1]} <span>${y}</span></h3>
        <div class="gcal-legend hide-s">${[['rapat', 'Rapat'], ['kegiatan', 'Kegiatan'], ['asesmen', 'Asesmen'], ['libur', 'Libur'], ['lainnya', 'Lainnya']].map(([k, l]) => `<span><i class="dot-${WARNA_AGENDA[k]}"></i>${l}</span>`).join('')}</div></div>
      <div class="gcal" data-swipe>
        <div class="gcal-dow">${['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((h, i) => `<span class="${i === 6 ? 'min' : ''}">${h}</span>`).join('')}</div>
        <div class="gcal-body">${minggu.join('')}</div>
      </div></div>
    <aside class="col gap-l">
      <div class="card gcal-day"><div class="row between" style="align-items:flex-start;gap:.75rem"><div class="row" style="gap:.75rem"><span class="gcal-big${st.tgl === t ? ' today' : ''}"><small>${HARI[dT.getDay()].slice(0, 3)}</small>${dT.getDate()}</span><div><b style="color:var(--navy)">${HARI[dT.getDay()]}</b><div class="tiny muted">${fmtTgl(st.tgl, 'tanpa-hari')}</div></div></div>
        <button class="btn btn-white btn-sm" data-act="agenda-baru" data-tgl="${st.tgl}">${ic('plus', 'ic-s')}Agenda</button></div>
        <div class="list" style="margin-top:.75rem">${evHari.map(itemAcara).join('')}
          ${ajar.map((j) => `<a class="gcal-item" href="#/jadwal?tab=minggu"><i class="gcal-bar ev-ai"></i><span class="grow"><b>${esc(namaMapel(j.mapel_id))} · ${esc(namaKelas(j.kelas_id))}</b><span class="tiny muted">${esc(j.mulai)}–${esc(j.selesai)}${j.ruang ? ' · ' + esc(j.ruang) : ''}</span></span></a>`).join('')}
          ${!evHari.length && !ajar.length ? `<p class="small muted" style="padding:.5rem 0">${hariKe(st.tgl) === 0 ? 'Hari Minggu — tidak ada agenda.' : 'Tidak ada agenda maupun jadwal mengajar.'}</p>` : ''}</div></div>
      <div class="card"><h3 style="margin-bottom:.5rem">Agenda ${BULAN[m - 1]}</h3><div class="list">${bulanIni.map(itemAcara).join('') || '<p class="small muted">Belum ada agenda bulan ini.</p>'}</div>
      <p class="tiny muted" style="margin-top:1rem">Libur nasional bertanggal tetap sudah ditandai. Libur keagamaan & cuti bersama berubah tiap tahun — tambahkan sebagai agenda jenis "Libur" sesuai SKB resmi.</p></div>
    </aside></div>`;
  // Geser kiri/kanan di layar sentuh untuk pindah bulan
  const g = el.querySelector('[data-swipe]');
  let x0 = null, y0s = null;
  g.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; y0s = e.touches[0].clientY; }, { passive: true });
  g.addEventListener('touchend', (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0s; x0 = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) geserBulan(st, dx < 0 ? 1 : -1, el);
  }, { passive: true });
}
function geserBulan(st, n, el) {
  const [y, m] = st.bulan.split('-').map(Number);
  st.bulan = ymd(new Date(y, m - 1 + n, 1)).slice(0, 7);
  st.tgl = '';
  tabKalender(el, st);
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

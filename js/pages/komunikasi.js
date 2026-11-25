// Komunikasi Wali: kontak (CRM), pengumuman/blast WA ber-batch, riwayat kirim, pengaturan notifikasi otomatis.
import { ic } from '../core/icons.js';
import { esc, toast, modal, fmtTgl, waLink, salin, konfirmasi } from '../core/util.js';
import { S, isDemo, adaServer } from '../core/state.js';
import { db } from '../core/store.js';
import { api } from '../core/api.js';
import { sinkron } from '../core/sync.js';
import { delegasi, kelasList, siswaKelas, emptyState, segmen, skeleton } from '../core/ui.js';
import { jalankanAi } from '../core/ai.js';
import { demoKom } from '../core/demo.js';

// Mode Demo memakai simulasi data server (kontak, riwayat, pengaturan) agar semua tab terisi seperti akun sungguhan.
const cloud = () => isDemo() || (S.mode === 'cloud' && adaServer());
const LABEL_EVENT = { ABSEN_TIDAK_HADIR: 'Kabar ketidakhadiran', ALFA_BERULANG: 'Peringatan alfa berulang', PENGUMUMAN: 'Pengumuman', RPP_DIAJUKAN: 'RPP diajukan', RPP_DITELAAH: 'Hasil telaah RPP', TES: 'Uji kirim', TEST: 'Uji kirim' };
const sink = () => (isDemo() ? null : sinkron());
async function srv(action, data) {
  if (!isDemo()) return api(action, data);
  switch (action) {
    case 'crm.list': return { data: demoKom.kontak() };
    case 'crm.validate': { const n = demoKom.cekWa(); return { message: n ? `${n} nomor diperiksa — semuanya terdaftar di WhatsApp.` : 'Semua nomor sudah diperiksa sebelumnya.' }; }
    case 'crm.update': demoKom.optOut(data.KontakID, data.OptOut); return { message: '' };
    case 'notif.blast': { const n = demoKom.kirim(data); return { message: `Pengumuman masuk antrean: ${n} wali menerima pesan secara bertahap.` }; }
    case 'notif.blast.list': return { data: demoKom.riwayat().blast };
    case 'notif.queue': return { data: demoKom.riwayat().antrean };
    case 'notif.blast.stop': return { message: 'Pengiriman dihentikan.' };
    case 'notif.settings': return { data: demoKom.atur() };
    case 'notif.settings.save': demoKom.simpanAtur(data); return { message: 'Pilihan notifikasi disimpan.' };
    case 'notif.test': return { message: data.kanal === 'WA' ? `Pesan uji WhatsApp terkirim ke ${(S.user && S.user.wa) || 'nomor Anda'}.` : `Email uji terkirim ke ${(S.user && S.user.email) || 'email Anda'}.` };
    default: return { data: null, message: '' };
  }
}

export default {
  title: 'Komunikasi Wali',
  deps: [], // data server dimuat sendiri; tidak dirender ulang otomatis agar tidak memanggil server berulang
  async render(el, ctx) {
    ctx.st = ctx.st || { tab: 'kontak', kelas: [] };
    const st = ctx.st;
    el.innerHTML = `<div class="page-h"><div><div class="crumbs"><a href="#/hari-ini">Beranda</a>${ic('chevr', 'ic-s')}<b>Komunikasi Wali</b></div><h1>Komunikasi Orang Tua/Wali</h1><p class="sub">${cloud() ? 'Pesan WhatsApp & email dikirim bertahap dari server (anti-blokir), menghormati pilihan berhenti berlangganan.' : 'Mode lokal: pesan dikirim manual lewat WhatsApp di perangkat Anda.'}</p></div></div>
      <div style="margin-bottom:1rem">${segmen([['kontak', 'Kontak Wali'], ['umum', 'Pengumuman'], ['riwayat', 'Riwayat Kirim'], ['atur', 'Notifikasi Otomatis']], st.tab)}</div><div id="isi">${skeleton(2)}</div>`;
    const isi = el.querySelector('#isi');
    delegasi(el, {
      tab: (b) => { st.tab = b.dataset.tab; ctx.rerender(); },
      'cek-wa': async (b) => { b.disabled = true; try { await sink(); const r = await srv('crm.validate', {}); toast(r.message); ctx.rerender(); } catch (e) { toast(e.message, 'err'); b.disabled = false; } },
      optout: async (b) => { try { await srv('crm.update', { KontakID: b.dataset.id, OptOut: b.dataset.v }); toast(b.dataset.v === 'YA' ? 'Kontak tidak akan menerima pengumuman massal.' : 'Kontak kembali menerima pengumuman.'); ctx.rerender(); } catch (e) { toast(e.message, 'err'); } },
      'pilih-kelas': (b) => { const id = b.dataset.id; st.kelas = st.kelas.includes(id) ? st.kelas.filter((x) => x !== id) : st.kelas.concat(id); b.setAttribute('aria-pressed', st.kelas.includes(id)); },
      'bantu-tulis': (b) => bantuTulis(b, el),
      kirim: () => kirim(el, st, ctx),
      'stop-blast': async (b) => { if (!(await konfirmasi('Hentikan pengiriman pesan yang masih antre?', { bahaya: true, ya: 'Hentikan' }))) return; try { const r = await srv('notif.blast.stop', { blastId: b.dataset.id }); toast(r.message); ctx.rerender(); } catch (e) { toast(e.message, 'err'); } },
      'simpan-atur': () => simpanAtur(el),
      tes: async (b) => { try { const r = await srv('notif.test', { kanal: b.dataset.k }); toast(r.message); } catch (e) { toast(e.message, 'err'); } }
    });
    try {
      if (st.tab === 'kontak') await tabKontak(isi);
      else if (st.tab === 'umum') tabUmum(isi, st);
      else if (st.tab === 'riwayat') await tabRiwayat(isi);
      else await tabAtur(isi);
    } catch (e) { isi.innerHTML = `<div class="card">${emptyState({ icon: 'cloudoff', title: 'Tidak dapat memuat dari server', text: e.message + ' Periksa koneksi lalu coba lagi.' })}</div>`; }
  }
};

async function tabKontak(el) {
  if (!cloud()) {
    const rows = kelasList().flatMap((k) => siswaKelas(k.id).map((s) => ({ s, k })));
    el.innerHTML = rows.length ? `<div class="card" style="padding:.75rem"><div class="tbl-wrap"><table class="tbl stack"><thead><tr><th>Siswa</th><th>Kelas</th><th>Wali</th><th>WhatsApp</th><th></th></tr></thead><tbody>${rows.map(({ s, k }) => `<tr><td><b>${esc(s.nama)}</b></td><td>${esc(k.nama)}</td><td>${esc(s.nama_wali || '-')}</td><td>${esc(s.hp_wali || '-')}</td><td>${s.hp_wali ? `<a class="btn btn-green btn-xs" target="_blank" rel="noopener" href="${waLink(s.hp_wali, `Yth. Bapak/Ibu wali ${s.nama}, `)}">${ic('send', 'ic-s')}Chat</a>` : ''}</td></tr>`).join('')}</tbody></table></div></div>` : `<div class="card">${emptyState({ icon: 'phone', title: 'Belum ada kontak', text: 'Isi nomor WA wali pada data siswa.' })}</div>`;
    return;
  }
  await sink();
  const r = await srv('crm.list', { sinkron: true });
  const list = r.data || [];
  const n = { ok: list.filter((k) => k.StatusWA === 'Terdaftar').length, x: list.filter((k) => k.StatusWA === 'Tidak Terdaftar').length, kosong: list.filter((k) => !k.NoWA).length, off: list.filter((k) => String(k.OptOut).toUpperCase() === 'YA').length };
  el.innerHTML = `<div class="grid g4" style="margin-bottom:1rem">${[['Kontak wali', list.length, ''], ['WA terdaftar', n.ok, 'b-gr'], ['Nomor bermasalah', n.x + n.kosong, 'b-red'], ['Berhenti langganan', n.off, 'b-qs']].map(([l, v, c]) => `<div class="card card-s"><span class="badge ${c}">${l}</span><div class="kpi-v">${v}</div></div>`).join('')}</div>
    <div class="card" style="padding:.75rem"><div class="section-h" style="padding:.25rem .5rem"><h3>Daftar kontak</h3><button class="btn btn-white btn-sm" data-act="cek-wa">${ic('checkc', 'ic-s')}Cek nomor WA (maks 50)</button></div>
    ${list.length ? `<div class="tbl-wrap"><table class="tbl stack"><thead><tr><th>Wali</th><th>Siswa · kelas</th><th>WhatsApp</th><th>Status WA</th><th>Pesan</th><th>Langganan</th></tr></thead><tbody>${list.map((k) => { const off = String(k.OptOut).toUpperCase() === 'YA'; return `<tr><td><b>${esc(k.Nama)}</b>${k.Email ? `<br><span class="tiny muted">${esc(k.Email)}</span>` : ''}</td><td class="small">${esc((k.Info || {}).siswa || '')} · ${esc((k.Info || {}).kelas || '')}</td><td>${esc(k.NoWA || '-')}</td><td>${k.StatusWA ? `<span class="badge ${k.StatusWA === 'Terdaftar' ? 'b-gr' : 'b-red'}">${esc(k.StatusWA)}</span>` : '<span class="tiny muted">belum dicek</span>'}</td><td class="num">${esc(k.JumlahPesan || 0)}</td><td><button class="btn btn-${off ? 'soft-amber' : 'soft-green'} btn-xs" data-act="optout" data-id="${esc(k.KontakID)}" data-v="${off ? 'TIDAK' : 'YA'}">${off ? 'Berhenti' : 'Aktif'}</button></td></tr>`; }).join('')}</tbody></table></div>` : emptyState({ icon: 'phone', title: 'Belum ada kontak wali', text: 'Kontak dibentuk otomatis dari data siswa (nama & HP wali).' })}</div>`;
}

function tabUmum(el, st) {
  el.innerHTML = `<div class="split"><div class="card col gap-l">
    <label class="field"><span>Judul</span><input class="input" name="judul" value="Pengumuman Kelas" maxlength="120"></label>
    <label class="field"><span>Isi pesan</span><textarea class="input" name="pesan" rows="8" maxlength="1500" placeholder="Yth. Bapak/Ibu {nama}, …"></textarea><span class="hint">Penanda otomatis: <code>{nama}</code> nama wali · <code>{nama_siswa}</code> · <code>{kelas}</code>. Maks 1.500 karakter.</span></label>
    <div class="field"><span>Kirim ke kelas <span class="muted">(kosong = semua kelas)</span></span><div class="chips" style="flex-wrap:wrap">${kelasList().map((k) => `<button class="chip" data-act="pilih-kelas" data-id="${k.id}" aria-pressed="${st.kelas.includes(k.id)}">Kelas ${esc(k.nama)}</button>`).join('')}</div></div>
    <div class="row row-wrap"><button class="btn btn-white" data-act="bantu-tulis">${ic('sparkles', 'ic-s')}Bantu tulis</button><span class="grow"></span><button class="btn btn-primary" data-act="kirim">${ic('send', 'ic-s')}${cloud() ? 'Kirim lewat server' : 'Siapkan pesan WhatsApp'}</button></div></div>
    <aside class="card card-sky small col"><b>${ic('shield', 'ic-s')} Pengiriman aman</b><p class="muted">${cloud() ? 'Server mengirim pesan per batch dengan jeda acak agar nomor sekolah tidak diblokir WhatsApp. Wali yang memilih berhenti berlangganan tidak menerima pengumuman massal.' : 'Tanpa server, setiap pesan dibuka di aplikasi WhatsApp Anda satu per satu.'}</p></aside></div>`;
}
async function bantuTulis(b, el) {
  const p = el.querySelector('[name=pesan]');
  const r = await modal({ title: 'Bantu tulis pesan', body: `<div class="col gap-l"><label class="field"><span>Tujuan</span><input class="input" name="tujuan" placeholder="mis. mengundang rapat orang tua" autofocus></label><label class="field"><span>Poin penting</span><textarea class="input" name="poin" rows="3" placeholder="hari Sabtu 09.00, di ruang kelas, membahas program semester">${esc(p.value)}</textarea></label></div>`, actions: [{ label: 'Batal', value: null, cls: 'btn-ghost' }, { label: 'Tulis', value: 'ok', cls: 'btn-dark' }] });
  if (r.value !== 'ok') return;
  b.disabled = true;
  const res = await jalankanAi('pesan_wali', { tujuan: r.form.tujuan, poin: r.form.poin, nada: 'sopan dan hangat' });
  b.disabled = false;
  p.value = String((res.hasil || {}).pesan || '').replace(/\{nama_siswa\}/g, '{nama_siswa}');
  if (res.alasan) toast(res.alasan, 'info');
}
async function kirim(el, st, ctx) {
  const judul = el.querySelector('[name=judul]').value.trim();
  const pesan = el.querySelector('[name=pesan]').value.trim();
  if (pesan.length < 5) { toast('Isi pesan terlalu pendek.', 'err'); return; }
  if (cloud()) {
    if (!(await konfirmasi(`Kirim pengumuman ke wali ${st.kelas.length ? st.kelas.length + ' kelas terpilih' : 'semua kelas'}? Pesan masuk antrean dan terkirim bertahap.`, { ya: 'Kirim' }))) return;
    try { await sink(); const r = await srv('notif.blast', { judul, pesan, kelas_ids: st.kelas }); toast(r.message, 'ok', 5000); st.tab = 'riwayat'; ctx.rerender(); } catch (e) { toast(e.message, 'err', 5000); }
    return;
  }
  const kelas = st.kelas.length ? st.kelas : kelasList().map((k) => k.id);
  const target = kelas.flatMap((kid) => { const k = db.get('Kelas', kid); return siswaKelas(kid).filter((s) => s.hp_wali).map((s) => ({ s, k })); });
  const isi = (s, k) => pesan.replace(/\{nama\}/g, s.nama_wali || 'Bapak/Ibu').replace(/\{nama_siswa\}/g, s.nama).replace(/\{kelas\}/g, k.nama);
  await modal({ title: `${target.length} pesan siap dikirim`, wide: true, body: target.length ? `<p class="small muted" style="margin-bottom:.5rem">Ketuk satu per satu — WhatsApp terbuka dengan pesan terisi.</p><div class="list">${target.map(({ s, k }) => `<div class="li flat"><span class="grow"><b>${esc(s.nama_wali || 'Wali ' + s.nama)}</b> <span class="tiny muted">· ${esc(s.nama)} (${esc(k.nama)})</span></span><a class="btn btn-green btn-xs" target="_blank" rel="noopener" href="${waLink(s.hp_wali, isi(s, k))}">${ic('send', 'ic-s')}Kirim</a></div>`).join('')}</div>` : '<p>Belum ada nomor WA wali pada kelas terpilih.</p>', actions: [{ label: 'Salin teks', value: 'salin', cls: 'btn-white' }, { label: 'Tutup', value: null, cls: 'btn-dark' }] }).then((r) => { if (r.value === 'salin') salin(pesan); });
}

async function tabRiwayat(el) {
  if (!cloud()) { el.innerHTML = `<div class="card">${emptyState({ icon: 'history', title: 'Riwayat hanya tersedia di mode cloud', text: 'Pesan manual dari WhatsApp tidak tercatat di aplikasi.' })}</div>`; return; }
  const [b, q] = await Promise.all([srv('notif.blast.list', {}), srv('notif.queue', {})]);
  el.innerHTML = `<div class="grid g2"><div class="card"><h3 style="margin-bottom:.75rem">Pengumuman massal</h3><div class="list">${(b.data || []).map((x) => { const tot = Number(x.Total) || 0, ok = Number(x.Terkirim) || 0, g = Number(x.Gagal) || 0; return `<div class="li flat" style="flex-direction:column;align-items:stretch"><div class="row between"><b>${esc(x.Judul)}</b><span class="badge ${x.Status === 'Selesai' ? 'b-gr' : x.Status === 'Dihentikan' ? 'b-red' : 'b-mt'}">${esc(x.Status)}</span></div><span class="tiny muted">${fmtTgl(x.Tanggal, 'pendek')} · ${ok}/${tot} terkirim${g ? ` · ${g} gagal` : ''}</span><div class="bar"><i style="width:${tot ? ((ok + g) / tot) * 100 : 0}%"></i></div>${x.Status === 'Berjalan' ? `<button class="btn btn-ghost btn-xs" data-act="stop-blast" data-id="${esc(x.BlastID)}" style="align-self:flex-end;color:var(--red)">Hentikan</button>` : ''}</div>`; }).join('') || '<p class="small muted">Belum ada pengumuman.</p>'}</div></div>
    <div class="card"><h3 style="margin-bottom:.75rem">100 pesan terakhir</h3><div class="list" style="max-height:520px;overflow:auto">${(q.data || []).map((x) => `<div class="li flat small"><span class="badge">${esc(x.kanal)}</span><span class="grow"><b>${esc(x.nama || x.tujuan)}</b> <span class="tiny muted">${esc(x.tujuan)}</span><br><span class="tiny muted">${esc(LABEL_EVENT[x.event] || x.event)} · ${x.dikirim ? fmtTgl(x.dikirim, 'pendek') : x.dibuat ? fmtTgl(x.dibuat, 'pendek') : ''}</span></span><span class="badge ${x.status === 'Terkirim' ? 'b-gr' : x.status === 'Gagal' ? 'b-red' : x.status === 'Batal' ? 'b-draf' : 'b-mt'}">${esc(x.status)}</span></div>`).join('') || '<p class="small muted">Belum ada pesan.</p>'}</div></div></div>`;
}

async function tabAtur(el) {
  if (!cloud()) { el.innerHTML = `<div class="card">${emptyState({ icon: 'bell', title: 'Notifikasi otomatis membutuhkan server', text: 'Hubungkan aplikasi ke Google Apps Script agar wali menerima kabar otomatis saat anak tidak hadir.' })}</div>`; return; }
  const r = await srv('notif.settings', {});
  const g = r.data.global;
  el.innerHTML = `<div class="split"><div class="card col gap-l"><h3>Kejadian yang dikirim otomatis</h3>${r.data.events.map((e) => `<label class="li flat switch" style="align-items:flex-start;gap:.75rem"><input type="checkbox" data-ev="${esc(e.kode)}" ${e.aktifSaya ? 'checked' : ''} ${!e.wa && !e.email ? 'disabled' : ''}><span class="grow"><b>${esc(e.label)}</b><br><span class="tiny muted">${[e.wa ? 'WhatsApp' : '', e.email ? 'Email' : ''].filter(Boolean).join(' + ') || 'dimatikan admin'}</span><details class="tiny" style="margin-top:.25rem"><summary class="muted" style="cursor:pointer">Lihat templat</summary><pre style="white-space:pre-wrap;font-family:inherit">${esc(e.pesan)}</pre></details></span></label>`).join('')}
    <button class="btn btn-dark" data-act="simpan-atur" style="align-self:flex-start">${ic('check', 'ic-s')}Simpan pilihan</button></div>
    <aside class="card col gap-l"><h3>Status kanal</h3>
      <div class="li flat"><span class="grow"><b>WhatsApp (Fonnte)</b><br><span class="tiny muted">${g.fonnte ? 'Token terpasang' : 'Token belum diisi admin'}</span></span><span class="badge ${g.wa ? 'b-gr' : 'b-draf'}">${g.wa ? 'Aktif' : 'Nonaktif'}</span></div>
      <div class="li flat"><span class="grow"><b>Email</b><br><span class="tiny muted">via akun Google sekolah</span></span><span class="badge ${g.email ? 'b-gr' : 'b-draf'}">${g.email ? 'Aktif' : 'Nonaktif'}</span></div>
      <div class="row"><button class="btn btn-white btn-sm" data-act="tes" data-k="WA" ${g.wa ? '' : 'disabled'}>Tes WA ke saya</button><button class="btn btn-white btn-sm" data-act="tes" data-k="EMAIL" ${g.email ? '' : 'disabled'}>Tes email</button></div>
      <p class="tiny muted">Saklar utama kanal diatur admin. Pilihan kejadian otomatis hanya berlaku untuk kelas Anda.</p></aside></div>`;
}
async function simpanAtur(el) {
  const d = {}; el.querySelectorAll('[data-ev]').forEach((c) => { d[c.dataset.ev] = c.checked; });
  try { const r = await srv('notif.settings.save', d); toast(r.message); } catch (e) { toast(e.message, 'err'); }
}

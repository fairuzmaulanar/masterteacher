// Halaman masuk: kode OTP lewat email, Google, akses darurat admin, atau Mode Demo.
import { ic } from '../core/icons.js';
import { esc, toast, modal } from '../core/util.js';
import { adaServer } from '../core/state.js';
import { api, apiGet } from '../core/api.js';
import { masukCloud, masukDemo } from '../app.js';

let googleDimuat = null;
function muatGoogle() {
  if (!googleDimuat) googleDimuat = new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'https://accounts.google.com/gsi/client'; s.async = true; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
  return googleDimuat;
}

export default {
  title: 'Masuk',
  async render(el) {
    const server = adaServer();
    el.innerHTML = `
    <div class="auth">
      <section class="auth-art" aria-hidden="true">
        <div class="row"><span class="brand-logo">${ic('sun2', 'ic-l')}</span><b style="font-size:1.25rem;color:#12245B">Master Teacher</b></div>
        <h1 style="font-size:2.6rem;max-width:560px;line-height:1.15">Rencanakan, ajar, dan nilai — <span class="hl">semua di satu tempat.</span></h1>
        <p class="muted" style="max-width:520px;font-size:1rem">RPP Pembelajaran Mendalam, presensi satu ketukan, bank soal, buku nilai per TP, dan deskripsi rapor otomatis. Tetap jalan tanpa internet.</p>
        <div class="grid g2" style="max-width:560px">
          ${[['book', 't-pl', 'RPP sesuai Permendikdasmen 1/2026'], ['usercheck', 't-at', 'Presensi kelas dalam 30 detik'], ['chart', 't-gr', 'Buku nilai & deskripsi rapor'], ['cloudoff', 't-mt', 'Offline-first, sinkron otomatis']]
            .map(([i, c, t]) => `<div class="li ${c}" style="border-radius:16px"><span class="icon-box" style="background:var(--surface)">${ic(i)}</span><b class="small">${t}</b></div>`).join('')}
        </div>
      </section>
      <section class="auth-form">
        <div class="auth-card col gap-l">
          <div class="row only-m" style="justify-content:center"><span class="brand-logo">${ic('sun2', 'ic-l')}</span><b style="font-size:1.2rem;color:var(--navy)">Master Teacher</b></div>
          <div><h2>Selamat datang, Bapak/Ibu Guru 👋</h2><p class="muted" style="margin-top:.25rem">${server ? 'Masuk dengan email sekolah atau akun Google. Tanpa kata sandi.' : 'Server belum dihubungkan. Anda tetap dapat mencoba seluruh fitur dalam Mode Demo.'}</p></div>
          <div class="card col gap-l" id="kotak">${server ? formEmail() : `<div class="card-sky small">${ic('info', 'ic-s')} Admin: isi <code>GAS_URL</code> di <code>js/config.js</code> dengan URL Web App Apps Script (berakhiran <code>/exec</code>) untuk mengaktifkan akun & sinkron cloud.</div>`}
            <div id="gbox" class="col hide"><div class="row" style="gap:.75rem"><span class="divider grow" style="margin:0"></span><span class="tiny muted">atau</span><span class="divider grow" style="margin:0"></span></div><div id="gbtn" style="display:flex;justify-content:center;min-height:44px"></div></div>
          </div>
          <button class="btn btn-outline btn-block" data-demo type="button">${ic('play', 'ic-s')}Coba Mode Demo (tanpa akun)</button>
          <p class="tiny muted" style="text-align:center">Dengan masuk, Anda menyetujui pemrosesan data sesuai UU No. 27/2022 tentang Pelindungan Data Pribadi. Data siswa hanya dapat diakses oleh Anda${server ? ' dan kepala sekolah Anda' : ''}.</p>
          ${server ? '<button class="btn btn-ghost btn-sm" data-darurat type="button" style="align-self:center">Akses darurat admin</button>' : ''}
        </div>
      </section>
    </div>`;

    el.querySelector('[data-demo]').onclick = async (e) => { e.currentTarget.disabled = true; await masukDemo(); };
    if (!server) return;
    const kotak = el.querySelector('#kotak');
    let email = '';

    const pasangEmail = () => {
      const f = kotak.querySelector('form');
      f.onsubmit = async (e) => {
        e.preventDefault();
        email = f.email.value.trim().toLowerCase();
        const b = f.querySelector('button[type=submit]');
        b.disabled = true; b.innerHTML = `${ic('refresh', 'ic-s spin')}Mengirim kode…`;
        try {
          const r = await api('auth.otp.request', { email });
          toast(r.message || 'Kode dikirim ke email Anda.');
          kotak.querySelector('form').outerHTML = formOtp(email);
          pasangOtp();
        } catch (err) { toast(err.message, 'err'); b.disabled = false; b.innerHTML = 'Kirim kode masuk'; }
      };
    };
    const pasangOtp = () => {
      const f = kotak.querySelector('form');
      const kotakOtp = Array.from(f.querySelectorAll('.otp input'));
      kotakOtp[0].focus();
      kotakOtp.forEach((inp, i) => {
        inp.addEventListener('input', () => {
          const v = inp.value.replace(/\D/g, '');
          if (v.length > 1) { v.split('').slice(0, 6).forEach((c, j) => { if (kotakOtp[j]) kotakOtp[j].value = c; }); kotakOtp[Math.min(5, v.length - 1)].focus(); }
          else { inp.value = v; if (v && kotakOtp[i + 1]) kotakOtp[i + 1].focus(); }
          if (kotakOtp.every((x) => x.value)) f.requestSubmit();
        });
        inp.addEventListener('keydown', (e) => { if (e.key === 'Backspace' && !inp.value && kotakOtp[i - 1]) kotakOtp[i - 1].focus(); });
      });
      f.querySelector('[data-ulang]').onclick = () => { kotak.querySelector('form').outerHTML = formEmail(email); pasangEmail(); };
      f.onsubmit = async (e) => {
        e.preventDefault();
        const kode = kotakOtp.map((x) => x.value).join('');
        if (kode.length !== 6) return;
        const b = f.querySelector('button[type=submit]');
        b.disabled = true; b.innerHTML = `${ic('refresh', 'ic-s spin')}Memeriksa…`;
        try {
          const r = await api('auth.otp.verify', { email, kode, nama: f.nama.value.trim() });
          await masukCloud(r.data);
        } catch (err) {
          toast(err.message, 'err');
          b.disabled = false; b.innerHTML = 'Masuk';
          kotakOtp.forEach((x) => { x.value = ''; }); kotakOtp[0].focus();
        }
      };
    };
    pasangEmail();

    // Google Sign-In (bila admin mengisi GOOGLE_CLIENT_ID)
    try {
      const p = await apiGet('ping');
      const cid = p.data && p.data.googleClientId;
      if (cid) {
        await muatGoogle();
        el.querySelector('#gbox').classList.remove('hide');
        window.google.accounts.id.initialize({
          client_id: cid,
          callback: async (resp) => {
            try { const r = await api('auth.google', { credential: resp.credential }); await masukCloud(r.data); }
            catch (err) { toast(err.message, 'err'); }
          }
        });
        window.google.accounts.id.renderButton(el.querySelector('#gbtn'), { theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with', locale: 'id', width: 320 });
      }
    } catch (e) { /* server belum siap / offline — formulir email tetap tersedia */ }

    el.querySelector('[data-darurat]').onclick = async () => {
      const r = await modal({
        title: 'Akses darurat admin',
        body: `<p class="small muted" style="margin-bottom:.75rem">Hanya untuk admin bila login email/Google bermasalah. Kredensial dibuat oleh <code>setupAppEnvironment()</code> dan tampil sekali di log Apps Script. Terkunci 15 menit setelah 5x salah.</p>
          <div class="col gap-l"><label class="field"><span>Nama pengguna</span><input class="input" name="user" autocomplete="username" required></label>
          <label class="field"><span>Kata sandi</span><input class="input" type="password" name="pass" autocomplete="current-password" required></label></div>`,
        actions: [{ label: 'Batal', value: null, cls: 'btn-ghost' }, { label: 'Masuk', value: 'ok', cls: 'btn-dark' }]
      });
      if (r.value !== 'ok') return;
      try { const x = await api('auth.darurat', { user: r.form.user, pass: r.form.pass }); await masukCloud(x.data); }
      catch (err) { toast(err.message, 'err'); }
    };
  }
};

function formEmail(v = '') {
  return `<form class="col gap-l" novalidate>
    <label class="field"><span>Email</span><input class="input" type="email" name="email" value="${esc(v)}" placeholder="nama@sekolah.sch.id" autocomplete="email" inputmode="email" required autofocus></label>
    <button class="btn btn-primary btn-block" type="submit">Kirim kode masuk</button>
    <p class="hint">Kami mengirim 6 digit kode ke email Anda. Berlaku 10 menit.</p>
  </form>`;
}
function formOtp(email) {
  return `<form class="col gap-l" novalidate>
    <div><b>Masukkan kode</b><p class="small muted">Dikirim ke <b>${esc(email)}</b>. Periksa juga folder Spam/Promosi.</p></div>
    <div class="otp" role="group" aria-label="Kode 6 digit">${Array.from({ length: 6 }, (_, i) => `<input inputmode="numeric" autocomplete="${i ? 'off' : 'one-time-code'}" maxlength="6" aria-label="Digit ${i + 1}">`).join('')}</div>
    <label class="field"><span>Nama lengkap & gelar <span class="muted">(untuk pengguna baru)</span></span><input class="input" name="nama" placeholder="mis. Rina Saraswati, S.Pd." autocomplete="name"></label>
    <button class="btn btn-primary btn-block" type="submit">Masuk</button>
    <button class="btn btn-ghost btn-sm" type="button" data-ulang>Ganti email / kirim ulang</button>
  </form>`;
}

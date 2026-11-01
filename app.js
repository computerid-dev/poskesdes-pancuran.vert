'use strict';

const DB_KEY = 'poskesdes_visits_v1';
const PIN_KEY = 'poskesdes_pin_v1';

const T = (key, label, type = 'text', readonly = false) => ({ key, label, type, readonly });
const HP = T('hp', 'No. WhatsApp (contoh 6281234567890)', 'tel');
const IDENT = [T('nama', 'Nama'), T('umur', 'Umur (tahun)', 'number'), T('alamat', 'Alamat'), HP];
const TAIL = [T('keluhan', 'Keluhan', 'area'), T('obat', 'Obat', 'area'), T('tindakan', 'Tindakan', 'area'), T('kontrol', 'Tanggal kontrol berikutnya', 'date')];

const CATS = {
  hamil: { name: 'Ibu Hamil', fields: [
    T('gravida', 'Kehamilan ke-', 'number'), T('hpht', 'HPHT', 'date'), T('hpl', 'HPL (otomatis)', 'text', true),
    T('usia', 'Usia kehamilan (otomatis)', 'text', true), T('tensi', 'Tensi (mmHg)'), T('bb', 'BB (kg)', 'number'),
    T('tb', 'TB (cm)', 'number'), T('lila', 'LILA (cm)', 'number'), T('tfu', 'TFU (cm)', 'number'),
    T('djj', 'DJJ (x/menit)', 'number'), T('posisi', 'Posisi janin'), T('hb', 'HB (g/dL)', 'number'),
    T('tt', 'Imunisasi TT'), T('fe', 'Tablet Fe') ] },
  kb: { name: 'KB', fields: [
    T('tensi', 'Tensi (mmHg)'), T('bb', 'BB (kg)', 'number'),
    { key: 'jenis', label: 'Jenis KB', type: 'select', options: ['Suntik 1 bulan', 'Suntik 3 bulan', 'Pil', 'Implan', 'IUD', 'Kondom', 'Lainnya'] },
    T('tglkb', 'Tanggal suntik/pasang', 'date') ] },
  salin: { name: 'Persalinan', fields: [
    T('tglsalin', 'Tanggal persalinan', 'date'), T('jam', 'Jam persalinan', 'time'), T('jenissalin', 'Jenis persalinan'),
    T('tensi', 'Tensi ibu (mmHg)'), T('nadi', 'Nadi ibu (x/menit)', 'number'), T('suhu', 'Suhu ibu (°C)', 'number'),
    T('darah', 'Perdarahan (cc)', 'number'), T('jk', 'Jenis kelamin bayi'), T('bbbayi', 'BB bayi (gram)', 'number'),
    T('pbbayi', 'Panjang badan bayi (cm)', 'number'), T('apgar', 'APGAR'), T('imd', 'IMD'), T('kondisi', 'Kondisi ibu dan bayi') ] },
  balita: { name: 'Bayi dan Balita',
    ident: [T('nama', 'Nama'), T('umur', 'Umur (tahun, boleh dikosongkan)', 'number'), T('umurbulan', 'Umur (bulan)', 'number'), T('alamat', 'Alamat'), HP],
    fields: [
    T('lahir', 'Tanggal lahir', 'date'), T('umurauto', 'Umur (otomatis)', 'text', true), T('ortu', 'Nama orang tua'),
    T('suhu', 'Suhu (°C)', 'number'), T('bb', 'BB (kg)', 'number'), T('tb', 'Panjang/tinggi badan (cm)', 'number'),
    T('lk', 'Lingkar kepala (cm)', 'number'), T('lila', 'LILA (cm)', 'number'), T('imun', 'Imunisasi'),
    T('vita', 'Vitamin A'), T('gizi', 'Status gizi') ] },
  lansia: { name: 'Lansia', fields: [
    T('tensi', 'Tensi (mmHg)'), T('nadi', 'Nadi (x/menit)', 'number'), T('suhu', 'Suhu (°C)', 'number'),
    T('bb', 'BB (kg)', 'number'), T('tb', 'TB (cm)', 'number'), T('gula', 'Gula darah (mg/dL)', 'number'),
    T('kolesterol', 'Kolesterol (mg/dL)', 'number'), T('asam', 'Asam urat (mg/dL)', 'number') ] },
  ranap: { name: 'Ranap', fields: [
    T('tglmasuk', 'Tanggal masuk', 'date'), T('jammasuk', 'Jam masuk', 'time'), T('tglkeluar', 'Tanggal keluar (kosongkan jika masih dirawat)', 'date'),
    T('kamar', 'Kamar/tempat tidur'), T('diagnosa', 'Diagnosa'), T('tensi', 'Tensi awal (mmHg)'),
    T('suhu', 'Suhu awal (°C)', 'number'), T('nadi', 'Nadi awal (x/menit)', 'number'),
    T('observasi', 'Catatan observasi (tensi, suhu, nadi tiap hari)', 'area'),
    { key: 'kondisipulang', label: 'Kondisi pasien', type: 'select', options: ['Masih dirawat', 'Membaik', 'Pulang', 'Dirujuk'] },
    T('pj', 'Penanggung jawab/keluarga') ] },
  umum: { name: 'Berobat Umum', fields: [
    T('tensi', 'Tensi (mmHg)'), T('suhu', 'Suhu (°C)', 'number'), T('nadi', 'Nadi (x/menit)', 'number'),
    T('bb', 'BB (kg)', 'number'), T('diagnosa', 'Diagnosa') ] },
  beli: { name: 'Beli Obat', fees: ['obatfee'], ident: [T('nama', 'Nama'), T('alamat', 'Alamat'), HP], fields: [],
    tail: [T('obat', 'Obat yang dibeli', 'area')] },
  lain: { name: 'Lain-lain', fees: ['lainfee'], ident: [T('nama', 'Nama'), HP],
    fields: [T('ket', 'Keterangan', 'area')], tail: [] },
};
const defsFor = (key) => { const c = CATS[key]; return [...(c.ident || IDENT), ...c.fields, ...(c.tail || TAIL)]; };
const FEES = [['jasa', 'Biaya jasa pemeriksaan'], ['tindakanfee', 'Biaya tindakan'], ['obatfee', 'Biaya obat'], ['ranapfee', 'Biaya perawatan Ranap', 'ranap'], ['lainfee', 'Biaya lain-lain', 'lain']];
const feesFor = (c) => FEES.filter(([k, , only]) => (CATS[c].fees ? CATS[c].fees.includes(k) : !only || only === c));
const SPLIT = [['Modal', 50], ['Kebutuhan', 30], ['Tabungan', 20]];

const $ = (sel, root = document) => root.querySelector(sel);
const view = $('#view');
let tab = 'home';
let activeCat = 'hamil';
let editId = null;
let prefill = null;

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rupiah = (n) => 'Rp ' + Math.round(Number(n) || 0).toLocaleString('id-ID');
const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = () => ymd(new Date());
const fmtDate = (s) => (s ? s.split('-').reverse().join('-') : '');

function load() {
  try { const v = JSON.parse(localStorage.getItem(DB_KEY) || '[]'); return Array.isArray(v) ? v : []; }
  catch (e) { return []; }
}
function save(list) {
  try { localStorage.setItem(DB_KEY, JSON.stringify(list)); return true; }
  catch (e) { toast('Data gagal disimpan, penyimpanan HP mungkin penuh.'); return false; }
}
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg; t.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { t.hidden = true; }, 2600);
}
const total = (v) => FEES.reduce((s, [k]) => s + (Number(v.fee && v.fee[k]) || 0), 0);

function greeting() {
  const h = new Date().getHours();
  return h < 11 ? 'Selamat pagi' : h < 15 ? 'Selamat siang' : h < 18 ? 'Selamat sore' : 'Selamat malam';
}

function waLink(v) {
  const hp = String((v.data && v.data.hp) || '').replace(/\D/g, '').replace(/^0/, '62');
  return hp ? `https://wa.me/${hp}` : '';
}

function visitCard(v, withDelete) {
  const cat = CATS[v.cat];
  const defs = defsFor(v.cat);
  const rows = defs.filter((f) => v.data[f.key]).map((f) => `<dt>${esc(f.label.replace(/ \(.*\)/, ''))}</dt><dd>${esc(f.type === 'date' ? fmtDate(v.data[f.key]) : v.data[f.key])}</dd>`).join('');
  const fees = FEES.filter(([k]) => v.fee && v.fee[k]).map(([k, l]) => `<dt>${l}</dt><dd>${rupiah(v.fee[k])}</dd>`).join('');
  const wa = waLink(v);
  return `<details class="item"><summary>
      <div class="row"><b>${esc(v.data.nama)}</b><span class="tag">${esc(cat.name)}</span></div>
      <small>${fmtDate(v.date)} ${esc(v.time)} · ${rupiah(total(v))}</small></summary>
      <dl class="kv">${rows}${fees}<dt>Total biaya</dt><dd><b>${rupiah(total(v))}</b></dd></dl>
      <div class="row">${wa ? `<a class="btn sm alt" href="${wa}">Kirim WhatsApp</a>` : '<span></span>'}
      <span class="actions"><button class="btn sm alt" data-edit="${v.id}">Edit</button>${withDelete ? ` <button class="btn sm del" data-del="${v.id}">Hapus</button>` : ''}</span></div></details>`;
}

function renderHome() {
  const list = load();
  const t = today();
  const todays = list.filter((v) => v.date === t).sort((a, b) => b.time.localeCompare(a.time));
  const month = list.filter((v) => v.date.slice(0, 7) === t.slice(0, 7));
  const tomorrow = ymd(new Date(Date.now() + 864e5));
  const inpatients = list.filter((v) => v.cat === 'ranap' && !v.data.tglkeluar && v.data.kondisipulang !== 'Pulang' && v.data.kondisipulang !== 'Dirujuk');
  const due = list.filter((v) => v.data.kontrol === t || v.data.kontrol === tomorrow);
  view.innerHTML = `
    <div class="card soft"><b>${greeting()}, Bu Bidan.</b><br><span class="muted">Semoga hari ini lancar dan menyenangkan.</span></div>
    <div class="grid2">
      <div class="card stat"><b>${todays.length}</b><span>Pasien hari ini</span></div>
      <div class="card stat"><b>${rupiah(todays.reduce((s, v) => s + total(v), 0))}</b><span>Pendapatan hari ini</span></div>
      <div class="card stat"><b>${month.length}</b><span>Pasien bulan ini</span></div>
      <div class="card stat"><b>${rupiah(month.reduce((s, v) => s + total(v), 0))}</b><span>Pendapatan bulan ini</span></div>
    </div>
    ${due.length ? `<h2>Jadwal kontrol hari ini dan besok</h2><div class="card">${due.map((v) => `<div class="item"><div class="row"><b>${esc(v.data.nama)}</b><span class="tag">${esc(CATS[v.cat].name)}</span></div><small>Kontrol ${fmtDate(v.data.kontrol)}</small>${waLink(v) ? ` · <a href="${waLink(v)}">Ingatkan lewat WhatsApp</a>` : ''}</div>`).join('')}</div>` : ''}
    ${inpatients.length ? `<h2>Pasien Ranap yang masih dirawat</h2><div class="card">${inpatients.map((v) => visitCard(v, false)).join('')}</div>` : ''}
    <h2>Pasien hari ini</h2>
    <div class="card">${todays.length ? todays.map((v) => visitCard(v, false)).join('') : '<div class="empty">Belum ada pasien hari ini.<br>Tekan Tambah untuk mencatat kunjungan pertama.</div>'}</div>`;
}

function fieldHtml(f) {
  const id = `f_${f.key}`;
  const ro = f.readonly ? ' readonly' : '';
  if (f.type === 'area') return `<label for="${id}">${f.label}</label><textarea id="${id}"></textarea>`;
  if (f.type === 'select') return `<label for="${id}">${f.label}</label><select id="${id}"><option value="">Pilih</option>${f.options.map((o) => `<option>${o}</option>`).join('')}</select>`;
  const mode = f.type === 'number' ? ' inputmode="decimal" step="any"' : '';
  return `<label for="${id}">${f.label}</label><input id="${id}" type="${f.type}"${mode}${ro}>`;
}

function renderAdd() {
  const cat = CATS[activeCat];
  const fields = defsFor(activeCat);
  const rec = editId ? load().find((v) => v.id === editId) || null : null;
  view.innerHTML = `
    <div class="chips" id="cats"${rec ? ' hidden' : ''}>${Object.entries(CATS).map(([k, c]) => `<button class="chip${k === activeCat ? ' on' : ''}" data-cat="${k}">${c.name}</button>`).join('')}</div>
    <h2>${rec ? 'Edit kunjungan' : 'Catat kunjungan'}: ${cat.name}</h2>
    <form class="card" id="form" novalidate>
      ${fields.map(fieldHtml).join('')}
      <h2>Biaya</h2>
      ${feesFor(activeCat).map(([k, l]) => `<label for="fee_${k}">${l} (Rp)</label><input id="fee_${k}" type="number" inputmode="numeric" min="0" value="">`).join('')}
      <p class="muted">Total: <b id="totalFee">Rp 0</b></p>
      <button class="btn" type="submit">${rec ? 'Simpan perubahan' : 'Simpan data'}</button>${rec ? '<button class="btn alt" type="button" id="cancelEdit">Batal</button>' : ''}
    </form>`;
  const form = $('#form');
  const sumFee = () => { $('#totalFee').textContent = rupiah(feesFor(activeCat).reduce((s, [k]) => s + (Number($(`#fee_${k}`).value) || 0), 0)); };
  feesFor(activeCat).forEach(([k]) => $(`#fee_${k}`).addEventListener('input', sumFee));
  const hpht = $('#f_hpht');
  if (hpht) hpht.addEventListener('change', () => {
    if (!hpht.value) { $('#f_hpl').value = ''; $('#f_usia').value = ''; return; }
    const d = new Date(hpht.value + 'T00:00:00');
    const hpl = new Date(d); hpl.setDate(hpl.getDate() + 7); hpl.setMonth(hpl.getMonth() + 9);
    $('#f_hpl').value = fmtDate(ymd(hpl));
    const days = Math.floor((new Date(today() + 'T00:00:00') - d) / 864e5);
    $('#f_usia').value = days >= 0 ? `${Math.floor(days / 7)} minggu ${days % 7} hari` : 'HPHT belum sesuai';
  });
  const lahir = $('#f_lahir');
  if (lahir) lahir.addEventListener('change', () => {
    if (!lahir.value) { $('#f_umurauto').value = ''; return; }
    const b = new Date(lahir.value + 'T00:00:00'), n = new Date();
    let m = (n.getFullYear() - b.getFullYear()) * 12 + n.getMonth() - b.getMonth();
    if (n.getDate() < b.getDate()) m -= 1;
    $('#f_umurauto').value = m < 0 ? 'Tanggal lahir belum sesuai' : `${Math.floor(m / 12)} tahun ${m % 12} bulan`;
  });
  if (prefill && !rec) {
    Object.entries(prefill).forEach(([k, val]) => { const el = $(`#f_${k}`); if (el && !el.value) el.value = val; });
  }
  if (rec) {
    fields.forEach((f) => { const el = $(`#f_${f.key}`); if (el && rec.data[f.key] != null) el.value = rec.data[f.key]; });
    feesFor(activeCat).forEach(([k]) => { const el = $(`#fee_${k}`); if (el && rec.fee && rec.fee[k]) el.value = rec.fee[k]; });
    sumFee();
    $('#cancelEdit').onclick = () => { editId = null; setTab('hist'); };
  }
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {};
    fields.forEach((f) => { data[f.key] = $(`#f_${f.key}`).value.trim(); });
    if (!data.nama) { toast('Nama pasien perlu diisi dulu.'); $('#f_nama').focus(); return; }
    const fee = {};
    feesFor(activeCat).forEach(([k]) => { fee[k] = Number($(`#fee_${k}`).value) || 0; });
    const now = new Date();
    const list = load();
    if (rec) {
      const i = list.findIndex((v) => v.id === rec.id);
      if (i < 0) { toast('Data yang diedit tidak ditemukan.'); return; }
      list[i] = { ...list[i], data, fee };
      if (save(list)) { editId = null; toast('Perubahan tersimpan.'); setTab('hist'); }
      return;
    }
    list.push({ id: String(now.getTime()) + Math.floor(Math.random() * 1000), cat: activeCat, date: today(), time: `${pad(now.getHours())}:${pad(now.getMinutes())}`, data, fee });
    if (save(list)) { prefill = null; toast('Data tersimpan. Terima kasih, Bu Bidan.'); setTab('home'); }
  });
}

function renderHist() {
  view.innerHTML = `<label for="q">Cari nama pasien</label><input id="q" type="search" placeholder="Ketik nama"><div id="res"></div>`;
  const draw = () => {
    const q = $('#q').value.trim().toLowerCase();
    const list = load().filter((v) => !q || v.data.nama.toLowerCase().includes(q)).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
    const groups = new Map();
    list.forEach((v) => {
      const key = v.data.nama.trim().toLowerCase();
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(v);
    });
    const cards = [...groups.entries()].slice(0, 50).map(([key, vs]) => `<div class="card">
      <div class="row"><div><b>${esc(vs[0].data.nama.trim())}</b><br><small>${vs.length} kunjungan · terakhir ${fmtDate(vs[0].date)}</small></div>
      <button class="btn sm" data-addfor="${esc(key)}">Tambah kunjungan</button></div>
      ${vs.map((v) => visitCard(v, true)).join('')}</div>`);
    $('#res').innerHTML = cards.length ? cards.join('') : `<div class="card empty">${q ? 'Pasien dengan nama itu belum ditemukan.' : 'Riwayat pasien akan muncul di sini.'}</div>`;
  };
  $('#q').addEventListener('input', draw);
  draw();
}

function renderMoney() {
  const list = load();
  const t = today();
  const sum = (p) => list.filter((v) => v.date.startsWith(p)).reduce((s, v) => s + total(v), 0);
  const cnt = (p) => list.filter((v) => v.date.startsWith(p)).length;
  view.innerHTML = `
    <div class="grid2">
      <div class="card stat"><b>${rupiah(sum(t))}</b><span>Hari ini (${cnt(t)} pasien)</span></div>
      <div class="card stat"><b>${rupiah(sum(t.slice(0, 7)))}</b><span>Bulan ini (${cnt(t.slice(0, 7))} pasien)</span></div>
      <div class="card stat"><b>${rupiah(sum(t.slice(0, 4)))}</b><span>Tahun ini (${cnt(t.slice(0, 4))} pasien)</span></div>
    </div>
    <h2>Pembagian pendapatan</h2>
    <select id="sp"><option value="day">Hari ini</option><option value="month">Bulan ini</option><option value="year">Tahun ini</option></select>
    <div class="card" id="spOut"></div>
    <h2>Per hari</h2>
    <input id="mp" type="month" value="${t.slice(0, 7)}">
    <div class="card" id="daily"></div>
    <h2>Per bulan</h2>
    <input id="yp" type="number" inputmode="numeric" min="2000" max="2100" value="${t.slice(0, 4)}">
    <div class="card" id="monthly"></div>`;
  const table = (rows) => rows.length ? `<table><tr><th>Waktu</th><th>Pasien</th><th>Pendapatan</th></tr>${rows.join('')}</table>` : '<div class="empty">Belum ada pendapatan tercatat.</div>';
  const drawDaily = () => {
    const p = $('#mp').value; const days = {};
    list.filter((v) => v.date.startsWith(p)).forEach((v) => { (days[v.date] = days[v.date] || []).push(v); });
    const rows = Object.keys(days).sort().map((d) => `<tr><td>${fmtDate(d)}</td><td>${days[d].length}</td><td>${rupiah(days[d].reduce((s, v) => s + total(v), 0))}</td></tr>`);
    $('#daily').innerHTML = table(rows) + `<p class="muted">Total bulan: <b>${rupiah(sum(p))}</b></p>`;
  };
  const drawMonthly = () => {
    const y = $('#yp').value; const rows = [];
    for (let m = 1; m <= 12; m++) { const p = `${y}-${pad(m)}`; if (cnt(p)) rows.push(`<tr><td>${pad(m)}-${y}</td><td>${cnt(p)}</td><td>${rupiah(sum(p))}</td></tr>`); }
    $('#monthly').innerHTML = table(rows) + `<p class="muted">Total tahun: <b>${rupiah(sum(String(y)))}</b></p>`;
  };
  const drawSplit = () => {
    const v = $('#sp').value;
    const n = sum(v === 'day' ? t : v === 'month' ? t.slice(0, 7) : t.slice(0, 4));
    let left = n;
    const rows = SPLIT.map(([label, pct], i) => {
      const amount = i === SPLIT.length - 1 ? left : Math.round((n * pct) / 100);
      left -= amount;
      return `<tr><td>${label} (${pct}%)</td><td>${rupiah(amount)}</td></tr>`;
    });
    $('#spOut').innerHTML = `<table>${rows.join('')}</table><p class="muted">Dari total pendapatan <b>${rupiah(n)}</b></p>`;
  };
  $('#sp').addEventListener('change', drawSplit);
  $('#mp').addEventListener('change', drawDaily); $('#yp').addEventListener('input', drawMonthly);
  drawDaily(); drawMonthly(); drawSplit();
}

const hash = (s) => { let h = 5381; for (const c of s) h = ((h * 33) ^ c.charCodeAt(0)) >>> 0; return String(h); };

function renderMore() {
  const hasPin = !!localStorage.getItem(PIN_KEY);
  view.innerHTML = `
    <div class="card"><b>Pengaman PIN</b><p class="muted">${hasPin ? 'PIN aktif. Aplikasi meminta PIN setiap dibuka.' : 'Belum ada PIN. Disarankan dipasang karena ini data pasien.'}</p>
      <input id="newPin" type="password" inputmode="numeric" maxlength="8" placeholder="PIN baru (4 sampai 8 angka)">
      <button class="btn" id="setPin">${hasPin ? 'Ganti PIN' : 'Pasang PIN'}</button>
      ${hasPin ? '<button class="btn alt" id="rmPin">Matikan PIN</button>' : ''}</div>
    <div class="card"><b>Cadangkan data</b><p class="muted">Salin teks cadangan lalu simpan di tempat aman, misalnya kirim ke WhatsApp sendiri.</p>
      <button class="btn" id="exp">Salin data cadangan</button></div>
    <div class="card"><b>Pulihkan data</b><p class="muted">Tempel teks cadangan di bawah. Data yang sudah ada tidak dihapus, hanya ditambah.</p>
      <textarea id="imp" placeholder="Tempel teks cadangan di sini"></textarea>
      <button class="btn alt" id="impBtn">Pulihkan</button></div>`;
  $('#setPin').onclick = () => {
    const p = $('#newPin').value.trim();
    if (!/^\d{4,8}$/.test(p)) { toast('PIN harus 4 sampai 8 angka.'); return; }
    localStorage.setItem(PIN_KEY, hash(p)); toast('PIN tersimpan.'); renderMore();
  };
  if (hasPin) $('#rmPin').onclick = () => { localStorage.removeItem(PIN_KEY); toast('PIN dimatikan.'); renderMore(); };
  $('#exp').onclick = async () => {
    const txt = JSON.stringify(load());
    try { await navigator.clipboard.writeText(txt); toast(`Cadangan tersalin (${load().length} kunjungan).`); }
    catch (e) { $('#imp').value = txt; $('#imp').select(); toast('Salin manual teks di kolom pulihkan.'); }
  };
  $('#impBtn').onclick = () => {
    try {
      const incoming = JSON.parse($('#imp').value.trim());
      if (!Array.isArray(incoming) || incoming.some((v) => !v || !v.id || !CATS[v.cat] || !v.data)) throw new Error('format');
      const list = load(); const ids = new Set(list.map((v) => v.id));
      const fresh = incoming.filter((v) => !ids.has(v.id));
      if (save(list.concat(fresh))) { toast(`${fresh.length} kunjungan dipulihkan.`); $('#imp').value = ''; }
    } catch (e) { toast('Teks cadangan belum sesuai, periksa lagi.'); }
  };
}

function setTab(name) {
  tab = name;
  document.querySelectorAll('#nav button').forEach((b) => b.classList.toggle('on', b.dataset.tab === name));
  ({ home: renderHome, add: renderAdd, hist: renderHist, money: renderMoney, more: renderMore })[name]();
  window.scrollTo(0, 0);
}

document.addEventListener('click', (e) => {
  const nav = e.target.closest('[data-tab]');
  if (nav) { editId = null; prefill = null; return setTab(nav.dataset.tab); }
  const af = e.target.closest('[data-addfor]');
  if (af) {
    const last = load().filter((x) => x.data.nama.trim().toLowerCase() === af.dataset.addfor)
      .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))[0];
    if (last) {
      editId = null; activeCat = last.cat;
      prefill = {};
      ['nama', 'umur', 'umurbulan', 'alamat', 'hp', 'ortu'].forEach((k) => { if (last.data[k]) prefill[k] = last.data[k]; });
      setTab('add');
    }
    return;
  }
  const ed = e.target.closest('[data-edit]');
  if (ed) {
    const v = load().find((x) => x.id === ed.dataset.edit);
    if (v) { editId = v.id; activeCat = v.cat; setTab('add'); }
    return;
  }
  const cat = e.target.closest('[data-cat]');
  if (cat) { activeCat = cat.dataset.cat; return renderAdd(); }
  const del = e.target.closest('[data-del]');
  if (del && confirm('Hapus kunjungan ini? Data tidak bisa dikembalikan.')) {
    save(load().filter((v) => v.id !== del.dataset.del)); toast('Kunjungan dihapus.'); setTab(tab);
  }
});

function start() {
  const stored = localStorage.getItem(PIN_KEY);
  if (!stored) return setTab('home');
  const lock = $('#lock');
  lock.hidden = false;
  const tryOpen = () => {
    if (hash($('#lockPin').value) === stored) { lock.hidden = true; setTab('home'); }
    else { $('#lockErr').hidden = false; }
  };
  $('#lockBtn').onclick = tryOpen;
  $('#lockPin').addEventListener('keydown', (e) => { if (e.key === 'Enter') tryOpen(); });
}
start();

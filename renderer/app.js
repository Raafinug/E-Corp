'use strict';
/* =====================================================================
   E-PPAT Lab — pembangun Form Design tarik-lepas + pratinjau layar order
   ===================================================================== */

/* API penyimpanan: dari Electron bila ada, kalau tidak jatuh ke memori
   supaya berkas ini juga bisa dibuka langsung di browser untuk mengecek. */
const api = window.eppat || (() => {
  let simpanan = null;
  return {
    muat:   async () => simpanan,
    simpan: async (d) => { simpanan = d; return '(memori)'; },
    ekspor: async (d) => { unduhJson(d); return 'unduhan'; },
    impor:  async () => null,
    lokasi: async () => '(memori — jalankan lewat Electron untuk menyimpan ke berkas)',
    onMenu: () => {}
  };
})();

function unduhJson(d){
  const b = new Blob([JSON.stringify(d, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(b); a.download = 'rancangan-form.json';
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
}

const ELEMEN = [
  { tipe:'teks',      nama:'Teks singkat',   ik:'T' },
  { tipe:'panjang',   nama:'Teks panjang',   ik:'¶' },
  { tipe:'angka',     nama:'Angka',          ik:'#' },
  { tipe:'tanggal',   nama:'Tanggal',        ik:'▤' },
  { tipe:'pilihan',   nama:'Pilihan',        ik:'▾' },
  { tipe:'segmented', nama:'Pilihan sejajar',ik:'▣' },
  { tipe:'yatidak',   nama:'Ya / Tidak',     ik:'☑' },
  { tipe:'user',      nama:'Referensi user', ik:'☺' },
  { tipe:'berkas',    nama:'Unggah berkas',  ik:'⇪' },
  { tipe:'judul',     nama:'Judul bagian',   ik:'—' },
  { tipe:'seksi',     nama:'Bagian lipat',   ik:'▾▴' },
  { tipe:'ulang',     nama:'Grup berulang',  ik:'⟳' },
  { tipe:'kbli',      nama:'Pencarian KBLI',  ik:'⌕' }
];
/* elemen yang tidak menghasilkan nilai sendiri */
const TANPA_NILAI = ['judul','seksi','ulang'];
/* elemen yang membuka kelompok baru di formulir */
const PEMBUKA = ['seksi','ulang'];
const SUMBER = [
  ['order','Diisi saat membuat order'],
  ['ktp','Tertarik dari Data KTP user'],
  ['kantor','Tertarik dari Profil Kantor'],
  ['finalisasi','Diisi saat finalisasi'],
  ['turunan','Turunan sistem']
];
const LEBAR = [['penuh','Penuh'],['setengah','Setengah'],['sepertiga','Sepertiga'],['seperempat','Seperempat']];

/* Satu field bertipe Referensi user tidak menghasilkan satu nilai, melainkan satu paket
   variabel. Isinya tetap: data KTP apa adanya, ditambah beberapa turunan sistem. */
const PAKET_ORANG = [
  ['nama',                    'Nama lengkap',                 'ktp'],
  ['nik',                     'NIK',                          'ktp'],
  ['tempat_lahir',            'Tempat lahir',                 'ktp'],
  ['tanggal_lahir',           'Tanggal lahir',                'ktp'],
  ['tanggal_lahir_terbilang', 'Tanggal lahir terbilang',      'turunan'],
  ['jenis_kelamin',           'Jenis kelamin',                'ktp'],
  ['status_kawin',            'Status perkawinan',            'ktp'],
  ['sapaan',                  'Sapaan (Tuan / Nyonya / Nona)','turunan'],
  ['pekerjaan',               'Pekerjaan',                    'ktp'],
  ['kewarganegaraan',         'Kewarganegaraan',              'ktp'],
  ['jalan',                   'Alamat — jalan & nomor',       'ktp'],
  ['rt',                      'RT',                           'ktp'],
  ['rw',                      'RW',                           'ktp'],
  ['label_kelurahan',         'Label Kelurahan / Desa',       'turunan'],
  ['kelurahan',               'Kelurahan / Desa',             'ktp'],
  ['kecamatan',               'Kecamatan',                    'ktp'],
  ['label_kota',              'Label Kota / Kabupaten',       'turunan'],
  ['kota',                    'Kota / Kabupaten',             'ktp'],
  ['provinsi',                'Provinsi',                     'ktp'],
  ['domisili_sementara',      'Domisili sementara',           'ktp'],
  ['telepon',                 'Telepon',                      'ktp'],
  ['email',                   'Email',                        'ktp']
];
const PAKET_SEMUA = PAKET_ORANG.map(x => x[0]);

/* ---------- terbilang ---------- */
const ANGKA_KATA = ['','satu','dua','tiga','empat','lima','enam','tujuh','delapan','sembilan','sepuluh','sebelas'];
function terbilang(n){
  n = Math.floor(Math.abs(Number(n) || 0));
  if (n < 12)   return ANGKA_KATA[n] || 'nol';
  if (n < 20)   return terbilang(n - 10) + ' belas';
  if (n < 100)  return terbilang(Math.floor(n/10)) + ' puluh' + (n%10 ? ' ' + terbilang(n%10) : '');
  if (n < 200)  return 'seratus' + (n%100 ? ' ' + terbilang(n%100) : '');
  if (n < 1000) return terbilang(Math.floor(n/100)) + ' ratus' + (n%100 ? ' ' + terbilang(n%100) : '');
  if (n < 2000) return 'seribu' + (n%1000 ? ' ' + terbilang(n%1000) : '');
  if (n < 1e6)  return terbilang(Math.floor(n/1000)) + ' ribu' + (n%1000 ? ' ' + terbilang(n%1000) : '');
  if (n < 1e9)  return terbilang(Math.floor(n/1e6)) + ' juta' + (n%1e6 ? ' ' + terbilang(n%1e6) : '');
  if (n < 1e12) return terbilang(Math.floor(n/1e9)) + ' miliar' + (n%1e9 ? ' ' + terbilang(n%1e9) : '');
  return terbilang(Math.floor(n/1e12)) + ' triliun' + (n%1e12 ? ' ' + terbilang(n%1e12) : '');
}
const BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const HARI  = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
function terbilangTanggal(iso){
  const d = new Date(iso);
  if (isNaN(d)) return '';
  return terbilang(d.getDate()) + ' ' + BULAN[d.getMonth()] + ' ' + terbilang(d.getFullYear());
}
function namaHari(iso){ const d = new Date(iso); return isNaN(d) ? '' : HARI[d.getDay()]; }
function angkaBertitik(v){
  const bersih = String(v == null ? '' : v).replace(/[^0-9]/g, '');
  return bersih ? bersih.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '';
}
/* pilihan terbilang untuk field angka dan tanggal */
const TERBILANG_ANGKA = [
  ['',        'Tidak ada'],
  ['polos',   'Terbilang saja'],
  ['rupiah',  'Terbilang + rupiah'],
  ['saham',   'Terbilang + saham'],
  ['persen',  'Terbilang + persen'],
  ['lembar',  'Terbilang + lembar'],
  ['meter',   'Terbilang + meter persegi'],
  ['lain',    'Terbilang + satuan lain…']
];
const TERBILANG_TANGGAL = [
  ['',        'Tidak ada'],
  ['tanggal', 'Tanggal terbilang'],
  ['hari',    'Nama hari'],
  ['keduanya','Nama hari + tanggal terbilang']
];
const SATUAN_KATA = { rupiah:'rupiah', saham:'saham', persen:'persen', lembar:'lembar', meter:'meter persegi' };
function satuanDari(f){
  if (f.terbilang === 'lain') return (f.satuan || '').trim();
  return SATUAN_KATA[f.terbilang] || '';
}
/* teks terbilang untuk satu nilai, dipakai di pratinjau order */
function teksTerbilang(f, nilai){
  if (!f.terbilang) return '';
  if (f.tipe === 'tanggal'){
    if (!nilai) return '';
    if (f.terbilang === 'hari')     return namaHari(nilai);
    if (f.terbilang === 'keduanya') return (namaHari(nilai) + ', ' + terbilangTanggal(nilai)).trim();
    return terbilangTanggal(nilai);
  }
  const bersih = String(nilai == null ? '' : nilai).replace(/[^0-9]/g, '');
  if (!bersih) return '';
  const st = satuanDari(f);
  return (terbilang(bersih) + (st ? ' ' + st : '')).trim();
}
/* variabel turunan yang dihasilkan sebuah field ber-terbilang */
function pecahanTerbilang(f){
  if (!f.kode || !f.terbilang) return [];
  if (f.tipe === 'tanggal'){
    const out = [];
    if (f.terbilang === 'tanggal' || f.terbilang === 'keduanya')
      out.push({ kode:f.kode + '_terbilang', label:f.label + ' — terbilang', tipe:'teks', sumber:'turunan', dari:f.kode });
    if (f.terbilang === 'hari' || f.terbilang === 'keduanya')
      out.push({ kode:f.kode + '_hari', label:f.label + ' — nama hari', tipe:'teks', sumber:'turunan', dari:f.kode });
    return out;
  }
  const st = satuanDari(f);
  return [{ kode:f.kode + '_terbilang',
    label:f.label + ' — terbilang' + (st ? ' (' + st + ')' : ''),
    tipe:'teks', sumber:'turunan', dari:f.kode }];
}
/* variabel yang dihasilkan satu field Referensi user, sudah memakai awalannya */
function pecahanUser(f){
  if (f.tipe !== 'user' || !f.kode) return [];
  const pilih = Array.isArray(f.paket) ? f.paket : PAKET_SEMUA;
  const aw = (f.awalan || '').trim();
  return PAKET_ORANG.filter(x => pilih.includes(x[0])).map(x => ({
    kode: (aw ? aw + '.' : '') + x[0], label: x[1], tipe:'teks', sumber: x[2],
    dari: f.kode, paket: f.label || 'Referensi user'
  }));
}

const $  = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;')
  .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const idBaru = () => 'x' + Math.random().toString(36).slice(2,9);
const kodeDari = s => String(s).toLowerCase().trim()
  .replace(/[^a-z0-9\s_]/g,'').replace(/\s+/g,'_').slice(0,48);

let rancangan = null;
let tabAktif = 0;
let pilih = null;          // id field terpilih di kanvas
let pvTab = 0;
let modalProp = null;        // id field yang sedang dibuka di modal properti
let sasaranMenu = null;      // id field yang diklik kanan
let barisPv = {};          // id tab -> daftar baris hasil "Tambah"
let nilaiForm = {};        // id tab formulir -> nilai yang sedang diisi

/* ================= muat & simpan ================= */
let jedaSimpan = null;
function simpanNanti(){
  clearTimeout(jedaSimpan);
  $('#status').textContent = 'menyimpan…';
  jedaSimpan = setTimeout(async () => {
    await api.simpan(rancangan);
    const w = new Date().toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit', second:'2-digit'});
    $('#status').textContent = 'tersimpan ' + w;
  }, 400);
}

/* melengkapi rancangan lama supaya berkas tersimpan versi sebelumnya tetap terbuka */
function pastikanBentuk(r){
  const S = window.SEED;
  if (!r || typeof r !== 'object') r = {};
  if (!Array.isArray(r.tab) || !r.tab.length) r.tab = JSON.parse(JSON.stringify(S.tab));
  if (!Array.isArray(r.potongan)) r.potongan = JSON.parse(JSON.stringify(S.potongan));
  if (!Array.isArray(r.grup))     r.grup     = JSON.parse(JSON.stringify(S.grup));
  if (!Array.isArray(r.bagian) || !r.bagian.length) r.bagian = JSON.parse(JSON.stringify(S.bagian));
  if (!r.halaman || typeof r.halaman !== 'object') r.halaman = JSON.parse(JSON.stringify(S.halaman));
  if (!Array.isArray(r.varDokumen)) r.varDokumen = JSON.parse(JSON.stringify(S.varDokumen || []));
  r.varDokumen.forEach(v => {
    if (typeof v.kode  !== 'string') v.kode = '';
    if (typeof v.label !== 'string') v.label = v.kode;
    if (typeof v.nilai !== 'string') v.nilai = '';
    if (typeof v.otomatis !== 'string') v.otomatis = '';
  });

  r.tab.forEach(t => { if (!Array.isArray(t.field)) t.field = []; });
  r.potongan.forEach(p => {
    p.slot = Array.isArray(p.slot) ? p.slot : [];
    p.syarat = Array.isArray(p.syarat) ? p.syarat : [];
    p.slot.forEach(sl => { sl.syarat = Array.isArray(sl.syarat) ? sl.syarat : []; });
    if (typeof p.tulis !== 'string') p.tulis = 'baris';
    if (typeof p.teks !== 'string') p.teks = '';
    p.teks = naskahKeHtml(p.teks);
    p.slot.forEach(sl => { sl.teks = naskahKeHtml(sl.teks || '', true); });
  });
  r.grup.forEach(g => { if (!Array.isArray(g.anggota)) g.anggota = []; });
  r.bagian.forEach(b => {
    if (b.jenis === 'otomatis'){
      if (!Array.isArray(b.potongan)) b.potongan = [];
      if (typeof b.ulang    !== 'string') b.ulang = '';
      if (typeof b.kelompok !== 'string') b.kelompok = '';
      if (typeof b.nomor    !== 'string') b.nomor = 'tanpa';
      b.nomorUlangKelompok = !!b.nomorUlangKelompok;
    }
    if (b.jenis !== 'otomatis') b.teks = naskahKeHtml(typeof b.teks === 'string' ? b.teks : '');
  });
  /* potongan di dalam bagian yang berputar sendiri tidak boleh mengulang lingkup yang sama */
  r.bagian.forEach(b => {
    if (b.jenis !== 'otomatis' || !b.ulang) return;
    (b.potongan || []).forEach(k => {
      const p = r.potongan.find(x => x.kode === k);
      if (p && p.ulang === b.ulang) p.ulang = '';
    });
  });

  /* buang rujukan potongan yang sudah tidak ada */
  const sah = r.potongan.map(p => p.kode);
  r.bagian.forEach(b => { if (b.potongan) b.potongan = b.potongan.filter(k => sah.includes(k)); });
  r.grup.forEach(g => { g.anggota = g.anggota.filter(k => sah.includes(k)); });
  return r;
}

async function mulai(){
  let tersimpan = null;
  try { tersimpan = await api.muat(); } catch { tersimpan = null; }
  rancangan = pastikanBentuk(tersimpan && tersimpan.tab ? tersimpan : JSON.parse(JSON.stringify(window.SEED)));
  gambarPalet();
  gambarSemua();
  $('#status').textContent = tersimpan ? 'rancangan tersimpan dimuat' : 'rancangan bawaan';
}

/* ================= palet & daftar tab ================= */
function gambarPalet(){
  $('#palet').innerHTML = ELEMEN.map(e =>
    '<div class="el" draggable="true" data-tipe="' + e.tipe + '">' +
      '<span class="ik">' + e.ik + '</span>' + esc(e.nama) + '</div>').join('');

  $$('#palet .el').forEach(el => {
    el.addEventListener('dragstart', ev => {
      ev.dataTransfer.setData('text/plain', 'baru:' + el.dataset.tipe);
      ev.dataTransfer.effectAllowed = 'copy';
    });
    el.addEventListener('click', () => tambahField(el.dataset.tipe, tabIni().field.length));
  });
}

const tabIni = () => rancangan.tab[tabAktif];

function gambarDaftarTab(){
  $('#tab-daftar').innerHTML = rancangan.tab.map((t,i) =>
    '<div class="tab-item' + (i === tabAktif ? ' aktif' : '') + '" data-tab="' + i + '">' +
      esc(t.nama) + '<span class="n">' + t.field.length + '</span></div>').join('');
  $$('#tab-daftar .tab-item').forEach(el => el.addEventListener('click', () => {
    tabAktif = +el.dataset.tab; pilih = null; gambarSemua();
  }));
}

/* ================= kanvas ================= */
function gambarKanvas(){
  const t = tabIni();
  $('#nama-tab').value = t.nama;
  $('#mode-tab').value = t.mode;
  $('#kanvas-sub').textContent = t.mode === 'formulir'
    ? 'Formulir tunggal — field tampil langsung di tab, dengan satu tombol simpan.'
    : 'Daftar + modal — tab menampilkan tabel; field di bawah ini menjadi isi modal tambah.';
  $('#hapus-tab').disabled = rancangan.tab.length <= 1;

  const k = $('#kanvas');
  k.classList.toggle('kosong', t.field.length === 0);
  k.innerHTML = t.field.length
    ? t.field.map(f => kartuMedan(f)).join('')
    : '<div class="kanvas-hampa">Tarik elemen dari kiri ke sini.<br><small>Klik kanan atau klik ganda pada elemen untuk mengatur propertinya.</small></div>';

  k.querySelectorAll('.medan').forEach(el => {
    el.addEventListener('click', ev => {
      if (ev.target.closest('.m-hapus')) return;
      pilih = el.dataset.id; gambarKanvas();
    });
    el.addEventListener('dblclick', () => bukaModalProperti(el.dataset.id));
    el.addEventListener('dragstart', ev => {
      ev.dataTransfer.setData('text/plain', 'pindah:' + el.dataset.id);
      ev.dataTransfer.effectAllowed = 'move';
      setTimeout(() => el.classList.add('seret'), 0);
    });
    el.addEventListener('dragend', () => el.classList.remove('seret'));
    el.addEventListener('contextmenu', ev => {
      ev.preventDefault();
      ev.stopPropagation();
      pilih = el.dataset.id;
      sasaranMenu = el.dataset.id;
      gambarKanvas();
      bukaMenuKonteks(ev.clientX, ev.clientY);
    });
  });
  k.querySelectorAll('.m-hapus').forEach(b => b.addEventListener('click', ev => {
    ev.stopPropagation();
    t.field = t.field.filter(f => f.id !== b.dataset.hapus);
    if (pilih === b.dataset.hapus) pilih = null;
    gambarSemua(); simpanNanti();
  }));
}

function labelField(kode){
  const f = tabIni().field.find(x => x.kode === kode);
  return f ? f.label : kode;
}
function ringkasSyarat(sy){
  return (sy||[]).map(c => labelField(c.field) + ' ' + c.op + (c.op === 'terisi' ? '' : ' ' + c.nilai)).join(' dan ');
}

function kartuMedan(f){
  if (f.tipe === 'kbli'){
    return '<div class="medan kbli lebar-penuh' + (pilih === f.id ? ' terpilih' : '') +
      '" draggable="true" data-id="' + f.id + '">' +
      '<button class="m-hapus" data-hapus="' + f.id + '">×</button>' +
      '<span class="m-jenis">Pencarian KBLI</span>' +
      ((f.tampilBila && f.tampilBila.length)
        ? '<span class="tanda-syarat" title="' + esc(ringkasSyarat(f.tampilBila)) + '">bersyarat</span>' : '') +
      '<div class="m-teks">⌕ ' + esc(f.label || 'KBLI') +
        '<span class="lipat-tanda">{{' + esc(f.kode || '—') + '}}</span></div>' +
      '<div class="m-kontrol">Cari kode atau nama KBLI…</div>' +
      '<div class="seksi-ket">Daftarnya ditarik dari basis data KBLI, bukan dari rancangan ini.</div></div>';
  }
  if (f.tipe === 'ulang'){
    return '<div class="medan ulang lebar-penuh' + (pilih === f.id ? ' terpilih' : '') +
      '" draggable="true" data-id="' + f.id + '">' +
      '<button class="m-hapus" data-hapus="' + f.id + '">×</button>' +
      '<span class="m-jenis">Grup berulang</span>' +
      ((f.tampilBila && f.tampilBila.length)
        ? '<span class="tanda-syarat" title="' + esc(ringkasSyarat(f.tampilBila)) + '">bersyarat</span>' : '') +
      '<div class="m-teks">⟳ ' + esc(f.label || 'Grup berulang') +
        '<span class="lipat-tanda">{{' + esc(f.kode || '—') + '}}</span></div>' +
      '<div class="seksi-ket">' + esc(f.keterangan ||
        'Field di bawahnya bisa ditambah berulang kali sampai bagian berikutnya.') + '</div></div>';
  }
  if (f.tipe === 'seksi'){
    return '<div class="medan seksi lebar-penuh' + (pilih === f.id ? ' terpilih' : '') +
      '" draggable="true" data-id="' + f.id + '">' +
      '<button class="m-hapus" data-hapus="' + f.id + '">×</button>' +
      '<span class="m-jenis">Bagian lipat</span>' +
      ((f.tampilBila && f.tampilBila.length)
        ? '<span class="tanda-syarat" title="' + esc(ringkasSyarat(f.tampilBila)) + '">bersyarat</span>' : '') +
      '<div class="m-teks">' + esc(f.label || 'Bagian') +
        '<span class="lipat-tanda">' + (f.tertutup ? '▸ tertutup' : '▾ terbuka') + '</span></div>' +
      '<div class="seksi-ket">' + esc(f.keterangan ||
        'Field di bawahnya masuk ke bagian ini sampai bagian lipat berikutnya.') + '</div></div>';
  }
  if (f.tipe === 'judul'){
    return '<div class="medan judul lebar-penuh' + (pilih === f.id ? ' terpilih' : '') +
      '" draggable="true" data-id="' + f.id + '">' +
      '<button class="m-hapus" data-hapus="' + f.id + '">×</button>' +
      '<div class="m-teks">' + esc(f.label || 'Judul bagian') +
      ((f.tampilBila && f.tampilBila.length)
        ? '<span class="tanda-syarat" title="' + esc(ringkasSyarat(f.tampilBila)) + '">bersyarat</span>' : '') +
      '</div></div>';
  }
  const jenis = (ELEMEN.find(e => e.tipe === f.tipe) || {}).nama || f.tipe;
  let kontrol = esc(f.contoh || '—');
  if (f.tipe === 'pilihan')   kontrol = esc((f.opsi && f.opsi[0]) || 'pilihan') + '  ▾';
  if (f.tipe === 'segmented') kontrol = esc((f.opsi || []).join('   |   ')) || 'pilihan sejajar';
  if (f.tipe === 'yatidak')   kontrol = '☐ ya / tidak';
  if (f.tipe === 'tanggal')   kontrol = 'dd/mm/yyyy';
  if (f.tipe === 'berkas')    kontrol = 'Belum ada berkas dipilih';
  if (f.tipe === 'user')      kontrol = 'Cari nama / email user klien…';

  return '<div class="medan lebar-' + (f.lebar || 'penuh') + (pilih === f.id ? ' terpilih' : '') +
    '" draggable="true" data-id="' + f.id + '">' +
    '<button class="m-hapus" data-hapus="' + f.id + '">×</button>' +
    '<span class="m-jenis">' + esc(jenis) + '</span>' +
    '<div class="m-label">' + esc(f.label || '(tanpa label)') +
      (f.wajib ? ' <span class="bintang">*</span>' : '') +
      ((f.tampilBila && f.tampilBila.length)
        ? '<span class="tanda-syarat" title="' + esc(ringkasSyarat(f.tampilBila)) + '">bersyarat</span>' : '') +
      '</div>' +
    '<div class="m-kontrol">' + kontrol + '</div></div>';
}

/* ---- menu klik kanan ---- */
function bukaMenuKonteks(x, y){
  const m = $('#menu-konteks');
  m.hidden = false;
  const l = Math.min(x, window.innerWidth  - m.offsetWidth  - 8);
  const t = Math.min(y, window.innerHeight - m.offsetHeight - 8);
  m.style.left = Math.max(8, l) + 'px';
  m.style.top  = Math.max(8, t) + 'px';
}
function tutupMenuKonteks(){ $('#menu-konteks').hidden = true; }

$('#menu-konteks').querySelectorAll('[data-aksi]').forEach(b => b.addEventListener('click', () => {
  const t = tabIni();
  const id = sasaranMenu;
  tutupMenuKonteks();
  if (!id) return;
  if (b.dataset.aksi === 'edit') bukaModalProperti(id);
  if (b.dataset.aksi === 'duplikat'){
    const i = t.field.findIndex(f => f.id === id);
    if (i < 0) return;
    const salinan = JSON.parse(JSON.stringify(t.field[i]));
    salinan.id = idBaru();
    if (salinan.kode) salinan.kode = salinan.kode + '_salinan';
    salinan.label = salinan.label + ' (salinan)';
    salinan.kolom = '';
    t.field.splice(i + 1, 0, salinan);
    pilih = salinan.id;
    gambarSemua(); simpanNanti();
  }
  if (b.dataset.aksi === 'hapus'){
    t.field = t.field.filter(f => f.id !== id);
    if (pilih === id) pilih = null;
    if (modalProp === id) tutupModalProperti();
    gambarSemua(); simpanNanti();
  }
}));

document.addEventListener('click', ev => {
  if (!ev.target.closest('#menu-konteks')) tutupMenuKonteks();
});
document.addEventListener('contextmenu', ev => {
  if (!ev.target.closest('.medan')) tutupMenuKonteks();
});
document.addEventListener('keydown', ev => {
  if (ev.key !== 'Escape') return;
  tutupMenuKonteks();
  if (modalProp) tutupModalProperti();
});
window.addEventListener('resize', tutupMenuKonteks);
$('#kanvas').addEventListener('scroll', tutupMenuKonteks);

/* ---- modal properti elemen ---- */
function bukaModalProperti(id){
  modalProp = id;
  isiModalProperti(id);
  $('#tirai-prop').hidden = false;
}
function isiModalProperti(id){
  const t = tabIni();
  const f = t.field.find(x => x.id === id);
  if (!f){ tutupModalProperti(); return; }
  const jenis = (ELEMEN.find(e => e.tipe === f.tipe) || {}).nama || f.tipe;
  $('#mp-judul').textContent = f.label || 'Properti Elemen';
  $('#mp-sub').textContent = jenis + (f.kode ? '  ·  {{' + f.kode + '}}' : '');
  const box = $('#mp-isi');
  box.innerHTML = htmlProperti(f, t);
  pasangProperti(box, f, t);
}
function tutupModalProperti(){
  modalProp = null;
  $('#tirai-prop').hidden = true;
}
$$('[data-tutup-prop]').forEach(b => b.addEventListener('click', tutupModalProperti));
$('#tirai-prop').addEventListener('mousedown', e => {
  if (e.target === $('#tirai-prop')) tutupModalProperti();
});
$('#mp-hapus').addEventListener('click', () => {
  const t = tabIni();
  t.field = t.field.filter(f => f.id !== modalProp);
  if (pilih === modalProp) pilih = null;
  tutupModalProperti();
  gambarSemua(); simpanNanti();
});

/* ---- tarik-lepas pada kanvas ---- */
function bersihkanSisip(){ $$('#kanvas .sisip').forEach(x => x.remove()); }

function indeksJatuh(ev){
  const anak = [...$('#kanvas').querySelectorAll('.medan')];
  for (let i = 0; i < anak.length; i++){
    const r = anak[i].getBoundingClientRect();
    if (ev.clientY < r.top + r.height / 2) return i;
  }
  return anak.length;
}

$('#kanvas').addEventListener('dragover', ev => {
  ev.preventDefault();
  bersihkanSisip();
  const i = indeksJatuh(ev);
  const anak = [...$('#kanvas').querySelectorAll('.medan')];
  const garis = document.createElement('div');
  garis.className = 'sisip';
  if (anak[i]) $('#kanvas').insertBefore(garis, anak[i]);
  else $('#kanvas').appendChild(garis);
});
$('#kanvas').addEventListener('dragleave', ev => {
  if (!$('#kanvas').contains(ev.relatedTarget)) bersihkanSisip();
});
$('#kanvas').addEventListener('drop', ev => {
  ev.preventDefault();
  const muatan = ev.dataTransfer.getData('text/plain') || '';
  const i = indeksJatuh(ev);
  bersihkanSisip();
  if (muatan.startsWith('baru:')) tambahField(muatan.slice(5), i);
  else if (muatan.startsWith('pindah:')) pindahField(muatan.slice(7), i);
});

function tambahField(tipe, indeks){
  const t = tabIni();
  const el = ELEMEN.find(e => e.tipe === tipe);
  const f = {
    id: idBaru(), tipe,
    label: tipe === 'judul' ? 'Judul bagian' : (tipe === 'seksi' ? 'Bagian baru' : (el ? el.nama : 'Field baru')),
    kode: TANPA_NILAI.includes(tipe) ? '' : kodeDari(el ? el.nama : 'field_baru') + '_' + Math.floor(Math.random()*90+10),
    wajib: false, lebar: 'penuh', sumber: 'order'
  };
  if (tipe === 'pilihan' || tipe === 'segmented') f.opsi = ['Pilihan A','Pilihan B'];
  if (tipe === 'seksi'){ f.keterangan = ''; f.tertutup = false; }
  if (tipe === 'ulang'){
    f.keterangan = ''; f.minBaris = 1; f.maksBaris = 0;
    f.tombolTambah = '+ Tambah baris';
    f.kode = 'grup_' + Math.floor(Math.random()*900+100);
  }
  if (tipe === 'kbli'){
    f.label = 'KBLI';
    f.kode = 'kbli';
    f.keterangan = 'Kegiatan usaha menurut Klasifikasi Baku Lapangan Usaha Indonesia';
    f.sumber = 'KBLI';
    f.ganda = true;
  }
  if (tipe === 'angka') f.terbilang = '';
  t.field.splice(Math.max(0, Math.min(indeks, t.field.length)), 0, f);
  pilih = f.id;
  gambarSemua(); simpanNanti();
}

function pindahField(id, indeks){
  const t = tabIni();
  const dari = t.field.findIndex(f => f.id === id);
  if (dari < 0) return;
  const [f] = t.field.splice(dari, 1);
  let ke = indeks;
  if (dari < indeks) ke -= 1;
  t.field.splice(Math.max(0, Math.min(ke, t.field.length)), 0, f);
  pilih = id;
  gambarSemua(); simpanNanti();
}

/* ================= panel properti ================= */
/* blok "Tampil bila" — dipakai semua jenis elemen, termasuk judul, bagian lipat,
   grup berulang, dan pencarian daftar */
function blokTampilBilaHtml(f, t, kataBenda){
  const kandidat = t.field.filter(x => x.id !== f.id && !TANPA_NILAI.includes(x.tipe) && x.kode);
  const nama = kataBenda || 'Field ini';
  let h = '<div class="f blok-syarat"><label class="j">Tampil bila</label>';
  if (!kandidat.length){
    h += '<p class="hampa" style="margin:0">Belum ada field lain di tab ini yang bisa dijadikan syarat.</p>';
  } else {
    const sy = f.tampilBila || [];
    h += '<p class="hampa" style="margin:0 0 8px">' + (sy.length
      ? nama + ' hanya tampil bila semua baris di bawah terpenuhi.'
      : 'Selalu tampil. Tambahkan baris di bawah untuk menyembunyikannya sampai syaratnya terpenuhi.') + '</p>';
    sy.forEach((c,i) => {
      if (i) h += '<div class="dan">DAN</div>';
      h += '<div class="baris-syarat" data-i="' + i + '">' +
        '<select data-s="field">' + kandidat.map(x =>
          '<option value="' + esc(x.kode) + '"' + (x.kode === c.field ? ' selected' : '') + '>' +
          esc(x.label) + '</option>').join('') + '</select>' +
        '<select data-s="op">' + ['=','≠','terisi'].map(o =>
          '<option' + (o === c.op ? ' selected' : '') + '>' + o + '</option>').join('') + '</select>' +
        (c.op === 'terisi' ? '<span class="tanpa-nilai">tidak perlu nilai</span>' : nilaiSyaratHtml(kandidat, c)) +
        '<button class="btn btn-kecil btn-bahaya" data-s="hapus">×</button></div>';
    });
    h += '<button class="btn btn-kecil lebar" data-s="tambah" style="margin-top:6px">+ Syarat tampil</button>';
  }
  return h + '</div>';
}

function htmlProperti(f, t){
  let h = '';
  h += '<div class="f"><label class="j">Label</label><input type="text" data-p="label" value="' + esc(f.label) + '"></div>';

  if (f.tipe === 'kbli'){
    h += '<div class="f"><label class="j">Kode variabel</label>' +
      '<input type="text" class="kode" data-p="kode" value="' + esc(f.kode || '') + '"></div>';
    h += '<div class="f"><label class="j">Sumber daftar</label>' +
      '<input type="text" data-p="sumber" value="' + esc(f.sumber || 'KBLI') + '" ' +
      'placeholder="nama daftar referensi di basis data"></div>';
    h += '<div class="f"><label class="sakelar"><input type="checkbox" data-p="ganda"' +
      (f.ganda === false ? '' : ' checked') + '> Boleh memilih lebih dari satu</label></div>';
    h += '<div class="f blok-lebar"><label class="j">Keterangan di bawah judul</label>' +
      '<input type="text" data-p="keterangan" value="' + esc(f.keterangan || '') + '"></div>';
    h += '<div class="f blok-lebar"><label class="j">Variabel yang dihasilkan</label>' +
      '<p class="hampa" style="margin:0 0 8px">KBLI yang dipilih berupa daftar, jadi elemen ini menjadi ' +
      'lingkup perulangan sendiri. Di Template Akta pilih <b>Diulang atas → Tiap baris ' +
      esc(f.label || 'KBLI') + '</b>, lalu pakai variabel di bawah ini.</p>' +
      '<div class="pasangan-var">' + pecahanKbli(f).map(x =>
        '<div class="pv-baris"><code>{{' + esc(x.kode) + '}}</code>' +
        '<span class="pv-guna">' + esc(x.label.toLowerCase()) + '</span>' +
        '<span class="pv-contoh">' + esc(x.kode.endsWith('_kode') ? '68111'
          : x.kode.endsWith('_judul') ? 'Real Estat Yang Dimiliki Sendiri atau Disewa' : 'Real Estat') +
        '</span></div>').join('') + '</div>' +
      '<p class="hampa" style="margin:8px 0 0">Daftar pilihannya ditarik dari basis data ' +
      esc(f.sumber || 'KBLI') + ', tidak disimpan di dalam rancangan formulir ini. Ganti sumbernya ' +
      'bila elemen ini dipakai untuk daftar referensi lain.</p></div>';
    h += blokTampilBilaHtml(f, t, 'Bagian pencarian ini');
    return h;
  }

  if (f.tipe === 'ulang'){
    h += '<div class="f"><label class="j">Kode grup</label>' +
      '<input type="text" class="kode" data-p="kode" value="' + esc(f.kode || '') + '"></div>';
    h += '<div class="f"><label class="j">Teks tombol tambah</label>' +
      '<input type="text" data-p="tombolTambah" value="' + esc(f.tombolTambah || '') + '" ' +
      'placeholder="+ Tambah baris"></div>';
    h += '<div class="f"><label class="j">Baris minimal</label>' +
      '<input type="text" data-p="minBaris" value="' + esc(String(f.minBaris == null ? 1 : f.minBaris)) + '"></div>';
    h += '<div class="f"><label class="j">Baris maksimal</label>' +
      '<input type="text" data-p="maksBaris" value="' + esc(String(f.maksBaris || '')) + '" ' +
      'placeholder="kosong = tanpa batas"></div>';
    h += '<div class="f blok-lebar"><label class="j">Keterangan di bawah judul</label>' +
      '<input type="text" data-p="keterangan" value="' + esc(f.keterangan || '') + '"></div>';
    h += '<div class="f blok-lebar"><label class="j">Variabel di dalam grup ini</label>' +
      '<p class="hampa" style="margin:0 0 8px">Field di bawah grup ini terisi sekali untuk tiap baris, ' +
      'jadi variabelnya bernilai berbeda pada tiap baris. Di Template Akta, potongan yang memakainya ' +
      'diberi <b>Diulang atas → Tiap baris ' + esc(f.label || 'grup ini') + '</b>; di dalam perulangan itu ' +
      '<code>{{kode}}</code> selalu berarti baris yang sedang ditulis.</p>' +
      (function(){
        const t2 = tabIni();
        const isi = kelompokField(t2.field).find(x => x.buka && x.buka.id === f.id);
        const dl = (isi ? isi.field : []).filter(x => !TANPA_NILAI.includes(x.tipe) && x.kode);
        return dl.length
          ? '<div class="chips-var">' + dl.map(x => '<button type="button" title="' + esc(x.label) +
              '">{{' + esc(x.kode) + '}}</button>').join('') + '</div>'
          : '<p class="hampa" style="margin:0">Belum ada field di dalam grup ini.</p>';
      })() + '</div>';
    h += blokTampilBilaHtml(f, t, 'Grup ini beserta seluruh barisnya');
    return h;
  }

  if (f.tipe === 'seksi'){
    h += '<div class="f blok-lebar"><label class="j">Keterangan di bawah judul</label>' +
      '<input type="text" data-p="keterangan" value="' + esc(f.keterangan || '') + '" ' +
      'placeholder="boleh memakai variabel, misalnya Modal dasar {{modal_dasar}}">' +
      '<p class="hampa" style="margin:7px 0 0">Bagian ini melipat field-field di bawahnya sampai bertemu ' +
      'bagian lipat berikutnya.</p></div>';
    h += '<div class="f"><label class="sakelar"><input type="checkbox" data-p="tertutup"' +
      (f.tertutup ? ' checked' : '') + '> Tertutup saat order dibuka</label></div>';
    h += blokTampilBilaHtml(f, t, 'Bagian ini beserta seluruh field di dalamnya');
    return h;
  }

  if (f.tipe !== 'judul'){
    h += '<div class="f"><label class="j">Kode variabel</label>' +
      '<input type="text" class="kode" data-p="kode" value="' + esc(f.kode) + '"></div>';
    h += '<div class="f"><label class="sakelar"><input type="checkbox" data-p="wajib"' +
      (f.wajib ? ' checked' : '') + '> Wajib diisi</label></div>';
  }

  if (f.tipe === 'judul'){
    h += blokTampilBilaHtml(f, t, 'Judul ini');
    return h;
  }

  h += '<div class="f"><label class="j">Lebar</label><select data-p="lebar">' +
    LEBAR.map(l => '<option value="' + l[0] + '"' + (f.lebar === l[0] ? ' selected' : '') + '>' + l[1] + '</option>').join('') +
    '</select></div>';

  if (f.tipe === 'pilihan' || f.tipe === 'segmented'){
    h += '<div class="f"><label class="j">Daftar pilihan — satu per baris</label>' +
      '<textarea data-p="opsi">' + esc((f.opsi||[]).join('\n')) + '</textarea></div>';
  }

  if (f.tipe === 'angka' || f.tipe === 'tanggal'){
    const daftar = f.tipe === 'angka' ? TERBILANG_ANGKA : TERBILANG_TANGGAL;
    h += '<div class="f"><label class="j">Terbilang</label><select data-p="terbilang">' +
      daftar.map(x => '<option value="' + x[0] + '"' + ((f.terbilang||'') === x[0] ? ' selected' : '') +
        '>' + x[1] + '</option>').join('') + '</select></div>';
    if (f.tipe === 'angka' && f.terbilang === 'lain'){
      h += '<div class="f"><label class="j">Satuan di belakang terbilang</label>' +
        '<input type="text" data-p="satuan" value="' + esc(f.satuan || '') + '" placeholder="mis. meter persegi"></div>';
    }
    if (f.terbilang){
      const contoh = f.tipe === 'angka' ? teksTerbilang(f, 1250000) : teksTerbilang(f, '2026-08-21');
      const pecah = pecahanTerbilang(f);
      const baris = [['{{' + f.kode + '}}', f.tipe === 'angka' ? 'angkanya' : 'tanggalnya',
                      f.tipe === 'angka' ? '1.250.000' : '21/08/2026']]
        .concat(pecah.map(x => ['{{' + x.kode + '}}',
          /_hari$/.test(x.kode) ? 'nama harinya' : 'terbilangnya',
          /_hari$/.test(x.kode) ? namaHari('2026-08-21')
            : (f.tipe === 'tanggal' ? terbilangTanggal('2026-08-21') : (contoh || '—'))]));
      h += '<div class="f blok-lebar"><label class="j">Variabel yang dihasilkan</label>' +
        '<p class="hampa" style="margin:0 0 8px">Satu elemen ini menghasilkan ' +
        (baris.length === 2 ? 'dua' : baris.length === 3 ? 'tiga' : String(baris.length)) +
        ' variabel — nilainya dan terbilangnya berdiri sendiri, jadi keduanya bisa dipakai di redaksi.</p>' +
        '<div class="pasangan-var">' + baris.map(b =>
          '<div class="pv-baris"><code>' + esc(b[0]) + '</code><span class="pv-guna">' + esc(b[1]) +
          '</span><span class="pv-contoh">' + esc(b[2]) + '</span></div>').join('') + '</div>' +
        '<p class="hampa" style="margin:8px 0 0">Barisnya juga ikut tampil di bawah kotak isian pada order.</p></div>';
    }
  }

  if (f.tipe === 'user'){
    const pilih = Array.isArray(f.paket) ? f.paket : PAKET_SEMUA;
    const aw = (f.awalan || '').trim();
    h += '<div class="f blok-lebar"><label class="j">Awalan variabel</label>' +
      '<input type="text" class="kode" data-p="awalan" value="' + esc(f.awalan || '') + '" ' +
      'placeholder="kosongkan untuk orang utama" style="max-width:320px">' +
      '<p class="hampa" style="margin:7px 0 0">Kosong berarti variabelnya polos — <code>{{nama}}</code>. ' +
      'Isi bila pada satu kalimat ada orang kedua, misalnya <code>pasangan</code> menghasilkan ' +
      '<code>{{pasangan.nama}}</code>.</p></div>';
    h += '<div class="f blok-lebar"><label class="j">Paket variabel yang dihasilkan</label>' +
      '<p class="hampa" style="margin:0 0 8px">Field ini satu isian di order, tapi menghasilkan ' +
      'variabel di bawah ini. Data KTP ditarik dari profil user; turunan dihitung sistem.</p>' +
      '<div class="paket">' + PAKET_ORANG.map(x =>
        '<label class="sakelar pk"><input type="checkbox" data-pk="' + x[0] + '"' +
        (pilih.includes(x[0]) ? ' checked' : '') + '>' +
        '<code>{{' + (aw ? aw + '.' : '') + x[0] + '}}</code>' +
        '<span class="nm">' + esc(x[1]) + '</span>' +
        '<span class="sb">' + (x[2] === 'turunan' ? 'turunan' : 'KTP') + '</span></label>').join('') +
      '</div></div>';
  }

  if (f.tipe !== 'judul'){
    h += '<div class="f"><label class="j">Teks contoh di dalam kotak</label>' +
      '<input type="text" data-p="contoh" value="' + esc(f.contoh || '') + '"></div>';
    h += '<div class="f"><label class="j">Teks bantuan di bawah kotak</label>' +
      '<textarea data-p="bantu" style="min-height:60px">' + esc(f.bantu || '') + '</textarea></div>';
    h += '<div class="f"><label class="j">Sumber pengisian</label><select data-p="sumber">' +
      SUMBER.map(sm => '<option value="' + sm[0] + '"' + (f.sumber === sm[0] ? ' selected' : '') + '>' + sm[1] + '</option>').join('') +
      '</select></div>';

    /* tampil bersyarat */
    h += blokTampilBilaHtml(f, t, 'Field ini');

    if (t.mode === 'daftar'){
      h += '<div class="f"><label class="j">Tampil sebagai kolom tabel</label>' +
        '<input type="text" data-p="kolom" value="' + esc(f.kolom || '') + '" placeholder="kosongkan bila tidak jadi kolom"></div>';
      if (f.kolom){
        h += '<div class="f"><label class="j">Gaya kolom</label><select data-p="gaya">' +
          [['teks','Teks biasa'],['pil','Pil biru'],['chip','Chip hijau']].map(g =>
            '<option value="' + g[0] + '"' + ((f.gaya||'teks') === g[0] ? ' selected' : '') + '>' + g[1] + '</option>').join('') +
          '</select></div>';
      }
    }
  }
  return h;
}

function pasangProperti(box, f, t){
  const gambarUlang = () => {
    gambarKanvas();
    if (modalProp) isiModalProperti(f.id);
    simpanNanti();
  };

  box.querySelectorAll('.baris-syarat').forEach(row => {
    const i = +row.dataset.i;
    const sel = row.querySelector('[data-s="field"]');
    if (sel) sel.addEventListener('change', e => {
      f.tampilBila[i].field = e.target.value;
      const sumberF = t.field.find(x => x.kode === e.target.value);
      f.tampilBila[i].nilai = (sumberF && sumberF.opsi && sumberF.opsi[0]) ||
        (sumberF && sumberF.tipe === 'yatidak' ? 'Ya' : '');
      gambarUlang();
    });
    const op = row.querySelector('[data-s="op"]');
    if (op) op.addEventListener('change', e => { f.tampilBila[i].op = e.target.value; gambarUlang(); });
    const nl = row.querySelector('[data-s="nilai"]');
    if (nl) nl.addEventListener('change', e => { f.tampilBila[i].nilai = e.target.value; gambarUlang(); });
    const hp = row.querySelector('[data-s="hapus"]');
    if (hp) hp.addEventListener('click', () => { f.tampilBila.splice(i,1); gambarUlang(); });
  });

  const tbh = box.querySelector('[data-s="tambah"]');
  if (tbh) tbh.addEventListener('click', () => {
    const kand = t.field.filter(x => x.id !== f.id && !TANPA_NILAI.includes(x.tipe) && x.kode);
    if (!kand.length) return;
    f.tampilBila = f.tampilBila || [];
    const k = kand[0];
    const teksBebas = !(k.opsi && k.opsi.length) && k.tipe !== 'yatidak';
    f.tampilBila.push({
      field: k.kode,
      op: teksBebas ? 'terisi' : '=',
      nilai: (k.opsi && k.opsi[0]) || (k.tipe === 'yatidak' ? 'Ya' : '')
    });
    gambarUlang();
  });

  box.querySelectorAll('[data-pk]').forEach(el => el.addEventListener('change', () => {
    const pilih = box.querySelectorAll('[data-pk]');
    f.paket = [...pilih].filter(x => x.checked).map(x => x.dataset.pk);
    simpanNanti();
  }));

  box.querySelectorAll('[data-p]').forEach(el => {
    const ev = el.type === 'checkbox' ? 'change' : 'input';
    el.addEventListener(ev, e => {
      const k = el.dataset.p;
      let v = el.type === 'checkbox' ? el.checked : el.value;
      if (k === 'opsi') v = String(v).split('\n').map(x => x.trim()).filter(Boolean);
      f[k] = v;
      if (k === 'kode') f.kode = kodeDari(v);
      gambarKanvas();
      if (k === 'label' || k === 'kode'){
        const jenis = (ELEMEN.find(e => e.tipe === f.tipe) || {}).nama || f.tipe;
        $('#mp-judul').textContent = f.label || 'Properti Elemen';
        $('#mp-sub').textContent = jenis + (f.kode ? '  ·  {{' + f.kode + '}}' : '');
      }
      if (k === 'kolom' || k === 'awalan' || k === 'terbilang' || k === 'satuan') isiModalProperti(f.id);
      simpanNanti();
    });
  });
}

function nilaiSyaratHtml(kandidat, c){
  const f = kandidat.find(x => x.kode === c.field);
  if (f && (f.tipe === 'pilihan' || f.tipe === 'segmented'))
    return '<select data-s="nilai">' + (f.opsi||[]).map(o =>
      '<option' + (o === c.nilai ? ' selected' : '') + '>' + esc(o) + '</option>').join('') + '</select>';
  if (f && f.tipe === 'yatidak')
    return '<select data-s="nilai"><option' + (c.nilai==='Ya'?' selected':'') + '>Ya</option>' +
      '<option' + (c.nilai==='Tidak'?' selected':'') + '>Tidak</option></select>';
  return '<input type="text" data-s="nilai" value="' + esc(c.nilai||'') + '">';
}

/* ================= pengaturan tab ================= */
$('#nama-tab').addEventListener('input', e => {
  tabIni().nama = e.target.value; gambarDaftarTab(); simpanNanti();
});
$('#mode-tab').addEventListener('change', e => {
  const t = tabIni();
  t.mode = e.target.value;
  if (t.mode === 'daftar'){
    if (!t.tombolTambah) t.tombolTambah = '+ Tambah ' + t.nama;
    if (!t.judulModal)   t.judulModal   = 'Tambah ' + t.nama;
    if (!t.pesanKosong)  t.pesanKosong  = 'Belum ada data.';
  } else if (!t.tombolSimpan) t.tombolSimpan = 'Simpan ' + t.nama;
  gambarSemua(); simpanNanti();
});
$('#tambah-tab').addEventListener('click', () => {
  rancangan.tab.push({ id: idBaru(), nama:'Tab baru', mode:'formulir',
    tombolSimpan:'Simpan', field: [] });
  tabAktif = rancangan.tab.length - 1; pilih = null;
  gambarSemua(); simpanNanti();
});
$('#hapus-tab').addEventListener('click', () => {
  if (rancangan.tab.length <= 1) return;
  rancangan.tab.splice(tabAktif, 1);
  tabAktif = Math.max(0, tabAktif - 1); pilih = null;
  gambarSemua(); simpanNanti();
});

/* ================= pratinjau layar order ================= */
function gambarPratinjau(){
  $('#pv-tabs').innerHTML = rancangan.tab.map((t,i) =>
    '<button data-pv="' + i + '" aria-selected="' + (i === pvTab) + '">' + esc(t.nama) + '</button>').join('');
  $$('#pv-tabs button').forEach(b => b.addEventListener('click', () => {
    pvTab = +b.dataset.pv; gambarPratinjau();
  }));

  const t = rancangan.tab[pvTab];
  if (!t){ $('#pv-isi').innerHTML = ''; return; }

  $('#pv-isi').innerHTML = t.mode === 'formulir' ? isiFormulir(t) : isiDaftar(t);

  if (t.mode === 'formulir'){
    nilaiForm[t.id] = nilaiForm[t.id] || {};
    const simpananTab = nilaiForm[t.id];
    $('#pv-isi').querySelectorAll('[data-kode]').forEach(el => {
      const k = el.dataset.kode;
      if (el.classList.contains('segmented')){
        if (simpananTab[k] != null)
          el.querySelectorAll('button').forEach(b =>
            b.setAttribute('aria-pressed', String(b.textContent.trim() === simpananTab[k])));
        el.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
          simpananTab[k] = b.textContent.trim();
        }));
        return;
      }
      if (simpananTab[k] != null) el.value = simpananTab[k];
      const rekam = () => { simpananTab[k] = el.value; };
      el.addEventListener('input', rekam);
      el.addEventListener('change', rekam);
    });
  }

  if (t.mode === 'daftar'){
    const b = $('#pv-isi [data-tambah]');
    if (b) b.addEventListener('click', () => bukaModal(t));
    $$('#pv-isi [data-hapusbaris]').forEach(x => x.addEventListener('click', () => {
      barisPv[t.id].splice(+x.dataset.hapusbaris, 1); gambarPratinjau();
    }));
  }
  pasangSegmented($('#pv-isi'));
  pasangSeksi($('#pv-isi'));
  pasangKbli($('#pv-isi'));
  pasangUlang($('#pv-isi'), t);
  pasangTerbilang($('#pv-isi'), t);
  pasangSyarat($('#pv-isi'));
}

/* field dipecah menjadi kelompok: yang sebelum bagian lipat pertama berdiri sendiri */
function kelompokField(field){
  const grup = [];
  let kini = { buka:null, field:[] };
  (field || []).forEach(f => {
    if (PEMBUKA.includes(f.tipe)){
      if (kini.field.length || kini.buka) grup.push(kini);
      kini = { buka:f, field:[] };
    } else kini.field.push(f);
  });
  if (kini.field.length || kini.buka) grup.push(kini);
  return grup;
}
function barisUlangHtml(g, n){
  return '<div class="ul-baris" data-baris><div class="ul-no">' + n + '</div>' +
    '<div class="ul-isi"><div class="grid-form">' + g.field.map(kontrolPv).join('') + '</div></div>' +
    '<button type="button" class="ul-hapus" data-hapusulang title="Hapus baris">×</button></div>';
}
function badanForm(field){
  return kelompokField(field).map(g => {
    const isi = '<div class="grid-form">' + g.field.map(kontrolPv).join('') + '</div>';
    const b = g.buka;
    if (!b) return isi;

    if (b.tipe === 'ulang'){
      const min = Math.max(1, Number(b.minBaris) || 1);
      let baris = '';
      for (let i = 1; i <= min; i++) baris += barisUlangHtml(g, i);
      return '<section class="ulang-blok" data-ulang="' + b.id + '" data-kode-ulang="' + esc(b.kode || '') +
        '" data-syarat="' + esc(JSON.stringify(b.tampilBila || [])) + '">' +
        '<div class="ub-kepala"><span class="ub-ikon">⟳</span>' +
        '<span class="ub-teks"><span class="ub-judul">' + esc(b.label || 'Grup berulang') + '</span>' +
        (b.keterangan ? '<span class="ub-ket">' + esc(b.keterangan) + '</span>' : '') + '</span>' +
        '<span class="ub-lencana">berulang · {{' + esc(b.kode || '—') + '}}</span></div>' +
        '<div class="ub-baris" data-daftar-baris>' + baris + '</div>' +
        '<button type="button" class="btn btn-halus ub-tambah" data-tambahulang>' +
        esc(b.tombolTambah || ('+ Tambah ' + (b.label || 'baris'))) + '</button></section>';
    }

    return '<section class="seksi-lipat' + (b.tertutup ? ' tutup' : '') + '" data-seksi="' + b.id +
      '" data-syarat="' + esc(JSON.stringify(b.tampilBila || [])) + '">' +
      '<button type="button" class="sl-kepala" data-buka="' + b.id + '">' +
      '<span class="sl-tanda">✓</span>' +
      '<span class="sl-teks"><span class="sl-judul">' + esc(b.label || 'Bagian') + '</span>' +
      (b.keterangan ? '<span class="sl-ket">' + esc(b.keterangan) + '</span>' : '') + '</span>' +
      '<span class="sl-panah">⌃</span></button>' +
      '<div class="sl-isi">' + isi + '</div></section>';
  }).join('');
}
function pasangSeksi(akar){
  akar.querySelectorAll('[data-buka]').forEach(b => b.addEventListener('click', () => {
    b.closest('.seksi-lipat').classList.toggle('tutup');
  }));
}
function nomoriBaris(blok){
  blok.querySelectorAll('[data-baris]').forEach((r,i) => {
    r.querySelector('.ul-no').textContent = i + 1;
    const hapus = r.querySelector('[data-hapusulang]');
    if (hapus) hapus.disabled = blok.querySelectorAll('[data-baris]').length <= 1;
  });
}
function pasangUlang(akar, t){
  akar.querySelectorAll('.ulang-blok').forEach(blok => {
    const el = (t.field || []).find(x => x.id === blok.dataset.ulang);
    const g = kelompokField(t.field).find(x => x.buka && x.buka.id === blok.dataset.ulang);
    const pasangBaris = baris => {
      pasangSegmented(baris);
      pasangTerbilang(baris, t);
      pasangSyarat(baris);
      const h = baris.querySelector('[data-hapusulang]');
      if (h) h.addEventListener('click', () => {
        if (blok.querySelectorAll('[data-baris]').length <= 1) return;
        baris.remove(); nomoriBaris(blok);
      });
    };
    blok.querySelectorAll('[data-baris]').forEach(pasangBaris);
    const tambah = blok.querySelector('[data-tambahulang]');
    if (tambah && g) tambah.addEventListener('click', () => {
      const wadah = blok.querySelector('[data-daftar-baris]');
      const n = wadah.querySelectorAll('[data-baris]').length + 1;
      const maks = Number(el && el.maksBaris) || 0;
      if (maks && n > maks) return;
      wadah.insertAdjacentHTML('beforeend', barisUlangHtml(g, n));
      pasangBaris(wadah.lastElementChild);
      nomoriBaris(blok);
    });
    nomoriBaris(blok);
  });
}
function isiFormulir(t){
  return badanForm(t.field) +
    '<div class="aksi-form"><button class="btn btn-utama">' +
    esc(t.tombolSimpan || 'Simpan') + '</button></div>';
}

function isiDaftar(t){
  const kolom = t.field.filter(f => f.kolom);
  const baris = barisPv[t.id] || [];
  let h = '<div class="bar-daftar"><button class="btn btn-utama" data-tambah>' +
    esc(t.tombolTambah || '+ Tambah') + '</button></div>';
  h += '<div class="tabel-bungkus"><table><thead><tr>' +
    (kolom.length ? kolom.map(k => '<th>' + esc(k.kolom) + '</th>').join('') : '<th>Data</th>') +
    '<th></th></tr></thead><tbody>';
  if (!baris.length){
    h += '<tr><td colspan="' + (Math.max(kolom.length,1) + 1) + '" class="kosong-tabel">' +
      esc(t.pesanKosong || 'Belum ada data.') + '</td></tr>';
  } else {
    baris.forEach((r,i) => {
      h += '<tr>';
      if (kolom.length){
        kolom.forEach(k => {
          const v = r[k.kode] || '—';
          const g = k.gaya || 'teks';
          h += '<td class="utama">' +
            (g === 'pil'  ? '<span class="pil">' + esc(String(v).toUpperCase()) + '</span>' :
             g === 'chip' ? '<span class="chip">' + esc(v) + '</span>' : esc(v)) + '</td>';
        });
      } else {
        h += '<td class="utama">' + esc(Object.values(r).filter(Boolean).join(' · ') || '—') + '</td>';
      }
      h += '<td class="kanan"><button class="btn btn-kecil">Ubah</button> ' +
        '<button class="btn btn-kecil btn-bahaya" data-hapusbaris="' + i + '">Hapus</button></td></tr>';
    });
  }
  h += '</tbody></table></div>';
  return h;
}

/* ---------- elemen pencarian KBLI ---------- */
function kbliBarisHtml(x, terpilih){
  return '<div class="kb-baris' + (terpilih ? ' dipilih' : '') + '" data-kode-kbli="' + esc(x.kode) + '">' +
    '<span class="kb-kode">' + esc(x.kode) + '</span>' +
    '<span class="kb-nama"><b>' + esc(x.judul) + '</b>' +
    '<span class="kb-gol">' + esc(x.golongan) + '</span></span>' +
    (terpilih
      ? '<button type="button" class="kb-aksi buang" data-buang-kbli title="Hapus">×</button>'
      : '<button type="button" class="kb-aksi" data-pilih-kbli>Pilih</button>') + '</div>';
}
function kbliSeksiHtml(f){
  return '<section class="kbli-blok lebar-penuh" data-kbli="' + f.id + '" data-ganda="' +
    (f.ganda === false ? '0' : '1') + '" data-syarat="' +
    esc(JSON.stringify(f.tampilBila || [])) + '">' +
    '<div class="kb-kepala"><span class="kb-ikon">⌕</span>' +
    '<span class="kb-teks"><span class="kb-judul">' + esc(f.label || 'KBLI') + '</span>' +
    (f.keterangan ? '<span class="kb-ket">' + esc(f.keterangan) + '</span>' : '') + '</span>' +
    '<span class="kb-lencana">berulang · {{' + esc(f.kode || '—') + '}}</span></div>' +
    '<div class="kb-badan">' +
    '<div class="kb-cari"><span class="kb-lup">⌕</span>' +
    '<input type="text" data-kbli-cari placeholder="Cari kode atau nama kegiatan usaha…"></div>' +
    '<div class="kb-hasil" data-kbli-hasil hidden></div>' +
    '<div class="kb-terpilih" data-kbli-terpilih><div class="kb-kosong">Belum ada KBLI dipilih.</div></div>' +
    '<p class="kb-nota">Daftarnya ditarik dari basis data ' + esc(f.sumber || 'KBLI') + '.</p>' +
    '</div></section>';
}
function pasangKbli(akar){
  akar.querySelectorAll('.kbli-blok').forEach(blok => {
    const cari    = blok.querySelector('[data-kbli-cari]');
    const hasil   = blok.querySelector('[data-kbli-hasil]');
    const terpilih= blok.querySelector('[data-kbli-terpilih]');
    const ganda   = blok.dataset.ganda !== '0';
    const daftar  = window.KBLI_CONTOH || [];
    const sudah   = () => [...terpilih.querySelectorAll('[data-kode-kbli]')].map(x => x.dataset.kodeKbli);

    const gambarTerpilih = () => {
      const kosong = !terpilih.querySelector('[data-kode-kbli]');
      let k = terpilih.querySelector('.kb-kosong');
      if (kosong && !k) terpilih.insertAdjacentHTML('beforeend',
        '<div class="kb-kosong">Belum ada KBLI dipilih.</div>');
      if (!kosong && k) k.remove();
    };
    const pasangBuang = baris => {
      const b = baris.querySelector('[data-buang-kbli]');
      if (b) b.addEventListener('click', () => { baris.remove(); gambarTerpilih(); tampilkanHasil(); });
    };
    const tampilkanHasil = () => {
      const q = (cari.value || '').trim().toLowerCase();
      if (!q){ hasil.hidden = true; hasil.innerHTML = ''; return; }
      const ada = sudah();
      const cocok = daftar.filter(x =>
        x.kode.toLowerCase().includes(q) || x.judul.toLowerCase().includes(q) ||
        (x.golongan || '').toLowerCase().includes(q)).slice(0, 8);
      hasil.hidden = false;
      hasil.innerHTML = cocok.length
        ? cocok.map(x => kbliBarisHtml(x, false).replace('class="kb-baris"',
            'class="kb-baris' + (ada.includes(x.kode) ? ' sudah' : '') + '"')).join('')
        : '<div class="kb-nihil">Tidak ada KBLI yang cocok dengan “' + esc(cari.value) + '”.</div>';
      hasil.querySelectorAll('[data-pilih-kbli]').forEach(b => b.addEventListener('click', () => {
        const baris = b.closest('[data-kode-kbli]');
        const x = daftar.find(y => y.kode === baris.dataset.kodeKbli);
        if (!x) return;
        if (sudah().includes(x.kode)) return;
        if (!ganda) terpilih.querySelectorAll('[data-kode-kbli]').forEach(el => el.remove());
        terpilih.insertAdjacentHTML('beforeend', kbliBarisHtml(x, true));
        pasangBuang(terpilih.lastElementChild);
        gambarTerpilih();
        cari.value = ''; tampilkanHasil();
      }));
    };
    cari.addEventListener('input', tampilkanHasil);
    cari.addEventListener('focus', tampilkanHasil);
    terpilih.querySelectorAll('[data-kode-kbli]').forEach(pasangBuang);
    gambarTerpilih();
  });
}

function kontrolPv(f){
  if (f.tipe === 'kbli')  return kbliSeksiHtml(f);
  if (f.tipe === 'seksi') return '';
  if (f.tipe === 'judul')
    return '<div class="gf-judul" data-syarat="' + esc(JSON.stringify(f.tampilBila || [])) + '">' +
      esc(f.label) + '</div>';
  const lbl = '<label>' + esc(f.label) + (f.wajib ? ' <span class="bintang">*</span>' : '') + '</label>';
  const ph = esc(f.contoh || '');
  let k = '';
  switch (f.tipe){
    case 'panjang':   k = '<textarea placeholder="' + ph + '"></textarea>'; break;
    case 'angka':     k = '<input type="text" inputmode="numeric" data-angka placeholder="' + ph + '">'; break;
    case 'tanggal':   k = '<input type="date">'; break;
    case 'pilihan':   k = '<select data-kode="' + esc(f.kode) + '">' +
                          (f.opsi||[]).map(o => '<option>' + esc(o) + '</option>').join('') + '</select>'; break;
    case 'segmented': k = '<div class="segmented" data-kode="' + esc(f.kode) + '">' +
                          (f.opsi||[]).map((o,i) => '<button type="button" aria-pressed="' + (i===0) + '">' +
                          esc(o) + '</button>').join('') + '</div>'; break;
    case 'yatidak':   k = '<select data-kode="' + esc(f.kode) + '"><option>Tidak</option><option>Ya</option></select>'; break;
    case 'user':      k = '<select data-kode="' + esc(f.kode) + '">' +
                          '<option value="">— pilih user klien —</option>' +
                          (window.USER_CONTOH || []).map(u => '<option value="' + esc(u.id) + '">' +
                            esc(u.nama) + ' · ' + esc(u.kota) + '</option>').join('') +
                          '</select>'; break;
    case 'berkas':    k = '<div class="unggah"><span class="nama">Belum ada berkas dipilih</span>' +
                          '<button type="button" class="btn">Unggah PDF</button>' +
                          '<button type="button" class="btn">Gambar</button></div>'; break;
    default:          k = '<input type="text" data-kode="' + esc(f.kode) + '" placeholder="' + ph + '">';
  }
  if (f.tipe !== 'segmented' && f.tipe !== 'berkas' && !k.includes('data-kode'))
    k = k.replace('<textarea', '<textarea data-kode="' + esc(f.kode) + '"')
         .replace('<input type="text" inputmode="numeric"', '<input type="text" inputmode="numeric" data-kode="' + esc(f.kode) + '"')
         .replace('<input type="date"', '<input type="date" data-kode="' + esc(f.kode) + '"');
  const tb = f.terbilang
    ? '<div class="terbilang" data-terbilang="' + esc(f.kode) + '">' + esc(teksTerbilang(f, '')) + '</div>' : '';
  return '<div class="gf lebar-' + (f.lebar||'penuh') + '" data-medan="' + esc(f.kode||'') +
    '" data-syarat="' + esc(JSON.stringify(f.tampilBila || [])) + '">' + lbl + k + tb +
    (f.bantu ? '<div class="bantu">' + esc(f.bantu) + '</div>' : '') + '</div>';
}

function pasangTerbilang(akar, t){
  const diLuarBaris = el => !el.closest('[data-baris]') || akar.closest('[data-baris]');
  const cari = kode => (t.field || []).find(x => x.kode === kode);
  akar.querySelectorAll('[data-angka]').forEach(el => el.addEventListener('input', () => {
    const p = el.selectionStart, panjangLama = el.value.length;
    el.value = angkaBertitik(el.value);
    const geser = el.value.length - panjangLama;
    try { el.setSelectionRange(p + geser, p + geser); } catch (e) {}
  }));
  akar.querySelectorAll('[data-kode]').forEach(el => {
    const f = cari(el.dataset.kode);
    if (!f || !f.terbilang) return;
    const baris = akar.querySelector('[data-terbilang="' + CSS.escape(f.kode) + '"]');
    if (!baris) return;
    const segar = () => { baris.textContent = teksTerbilang(f, el.value); };
    el.addEventListener('input', segar);
    el.addEventListener('change', segar);
    segar();
  });
}

function pasangSegmented(akar){
  akar.querySelectorAll('.segmented').forEach(seg => {
    seg.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
      seg.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      terapkanSyarat(akar);
    }));
  });
}

/* ---- tampil / sembunyi bersyarat pada pratinjau ---- */
function nilaiSekarang(akar){
  const v = {};
  akar.querySelectorAll('[data-kode]').forEach(el => {
    if (el.classList.contains('segmented')){
      const a = el.querySelector('[aria-pressed="true"]');
      v[el.dataset.kode] = a ? a.textContent.trim() : '';
    } else v[el.dataset.kode] = el.value;
  });
  return v;
}
function lolosSyarat(sy, v){
  return (sy||[]).every(c => {
    const x = v[c.field];
    if (c.op === 'terisi') return !!(x && String(x).trim());
    if (c.op === '≠')      return !!x && x !== c.nilai;
    return x === c.nilai;
  });
}
function terapkanSyarat(akar){
  const v = nilaiSekarang(akar);
  akar.querySelectorAll('[data-syarat]').forEach(el => {
    let sy = [];
    try { sy = JSON.parse(el.dataset.syarat || '[]'); } catch { sy = []; }
    el.hidden = !lolosSyarat(sy, v);
  });
}
function pasangSyarat(akar){
  akar.querySelectorAll('[data-kode]').forEach(el => {
    if (el.classList.contains('segmented')) return;
    el.addEventListener('input', () => terapkanSyarat(akar));
    el.addEventListener('change', () => terapkanSyarat(akar));
  });
  terapkanSyarat(akar);
}

/* ---- modal tambah pada pratinjau ---- */
let tabModal = null;
function bukaModal(t){
  tabModal = t;
  $('#m-judul').textContent = t.judulModal || ('Tambah ' + t.nama);
  $('#m-isi').innerHTML = badanForm(t.field);
  pasangSegmented($('#m-isi'));
  pasangSeksi($('#m-isi'));
  pasangKbli($('#m-isi'));
  pasangUlang($('#m-isi'), t);
  pasangTerbilang($('#m-isi'), t);
  pasangSyarat($('#m-isi'));
  $('#tirai').hidden = false;
}
/* elemen dianggap tersembunyi bila ia sendiri atau salah satu induknya disembunyikan syarat */
function sedangTersembunyi(el){
  let n = el;
  while (n && n.nodeType === 1){
    if (n.hidden) return true;
    n = n.parentElement;
  }
  return false;
}
function bacaMedan(akar){
  const r = {};
  akar.querySelectorAll('[data-kode]').forEach(el => {
    if (sedangTersembunyi(el)) return;
    if (el.classList.contains('segmented')){
      const a = el.querySelector('[aria-pressed="true"]');
      r[el.dataset.kode] = a ? a.textContent.trim() : '';
    } else r[el.dataset.kode] = el.value;
  });
  return r;
}
$('#m-simpan').addEventListener('click', () => {
  const t = tabModal; if (!t) return;
  const r = {};
  /* medan di luar grup berulang */
  $$('#m-isi [data-kode]').forEach(el => {
    if (el.closest('[data-baris]')) return;
    if (sedangTersembunyi(el)) return;
    if (el.classList.contains('segmented')){
      const a = el.querySelector('[aria-pressed="true"]');
      r[el.dataset.kode] = a ? a.textContent.trim() : '';
    } else r[el.dataset.kode] = el.value;
  });
  /* baris grup berulang */
  $$('#m-isi .ulang-blok').forEach(blok => {
    if (blok.hidden) return;
    const el = (t.field || []).find(x => x.id === blok.dataset.ulang);
    if (!el || !el.kode) return;
    r[el.kode] = [...blok.querySelectorAll('[data-baris]')].map(bacaMedan);
  });
  /* KBLI terpilih */
  $$('#m-isi .kbli-blok').forEach(blok => {
    if (blok.hidden) return;
    const el = (t.field || []).find(x => x.id === blok.dataset.kbli);
    if (!el || !el.kode) return;
    r[el.kode] = [...blok.querySelectorAll('[data-kbli-terpilih] [data-kode-kbli]')].map(b => {
      const x = (window.KBLI_CONTOH || []).find(y => y.kode === b.dataset.kodeKbli) || {};
      return { kode:x.kode || '', judul:x.judul || '', golongan:x.golongan || '' };
    });
  });
  barisPv[t.id] = barisPv[t.id] || [];
  barisPv[t.id].push(r);
  $('#tirai').hidden = true;
  gambarPratinjau();
});
$$('[data-tutup]').forEach(b => b.addEventListener('click', () => $('#tirai').hidden = true));
$('#tirai').addEventListener('mousedown', e => { if (e.target === $('#tirai')) $('#tirai').hidden = true; });

/* ================= navigasi ================= */
const KEPALA = {
  rancang:   ['Engine Module › Form Design', 'Form Design',
              'Rancangan isian layar order — field di sini sekaligus menjadi kamus variabel.'],
  kondisi:   ['Engine Module › Template Akta', 'Template Akta Kantor',
              'Template minuta milik kantor per layanan'],
  pratinjau: ['Layanan Engine › Order A', 'Order A', 'Layanan contoh']
};
function pilihMode(mode){
  $$('.m-item[data-mode]').forEach(x => x.setAttribute('aria-current', String(x.dataset.mode === mode)));
  $$('.layar').forEach(l => { l.hidden = l.dataset.layar !== mode; });
  const k = KEPALA[mode] || ['','',''];
  $('#remah').textContent = k[0];
  $('#judul-halaman').textContent = k[1];
  $('#sub-halaman').textContent = k[2];
  if (mode === 'pratinjau') gambarPratinjau();
  if (mode === 'kondisi'){ gambarDaftarBagian(); gambarKanan(); }
  window.scrollTo(0,0);
}
$$('.m-item[data-mode]').forEach(b => b.addEventListener('click', () => pilihMode(b.dataset.mode)));
$('#lipat').addEventListener('click', () => document.querySelector('.cangkang').classList.toggle('lipat'));
$('#tutup-spanduk').addEventListener('click', () => { $('#spanduk').hidden = true; });

/* tab panel kiri & kanan pada Template Akta */
$$('[data-ptab]').forEach(b => b.addEventListener('click', () => {
  $$('[data-ptab]').forEach(x => x.setAttribute('aria-selected', String(x === b)));
  $$('[data-ppane]').forEach(pn => { pn.hidden = pn.dataset.ppane !== b.dataset.ptab; });
}));
$$('[data-ktab]').forEach(b => b.addEventListener('click', () => {
  $$('[data-ktab]').forEach(x => x.setAttribute('aria-selected', String(x === b)));
  $$('[data-kpane]').forEach(pn => { pn.hidden = pn.dataset.kpane !== b.dataset.ktab; });
  gambarKanan();
}));

$('#btn-ekspor').addEventListener('click', async () => {
  const hasil = await api.ekspor(rancangan);
  if (hasil) $('#status').textContent = 'diekspor ke ' + hasil;
});
$('#btn-impor').addEventListener('click', async () => {
  const d = await api.impor();
  if (d && d.tab){
    rancangan = pastikanBentuk(d); tabAktif = 0; pilih = null; barisPv = {};
    gambarSemua(); simpanNanti();
    $('#status').textContent = 'rancangan diimpor';
  }
});
api.onMenu(async aksi => {
  if (aksi === 'baru'){
    rancangan = pastikanBentuk(JSON.parse(JSON.stringify(window.SEED)));
    bagianAktif = null; potAktif = null;
    tabAktif = 0; pilih = null; barisPv = {};
    gambarSemua(); simpanNanti();
  }
  if (aksi === 'ekspor') $('#btn-ekspor').click();
  if (aksi === 'ekspordocx') eksporDocx();
  if (aksi === 'impor-template') imporTemplate();
  if (aksi === 'impor')  $('#btn-impor').click();
});

function gambarSemua(){
  gambarDaftarTab();
  gambarKanvas();
  if (rancangan.bagian && !$('.layar[data-layar="kondisi"]').hidden){ gambarDaftarBagian(); gambarKanan(); }
  if (!$('.layar[data-layar="pratinjau"]').hidden) gambarPratinjau();
}

mulai().then(() => pilihMode('rancang'));

/* =====================================================================
   Template Dokumen — penyusunan kondisi penulisan
   ===================================================================== */
let potAktif = null;
let ujiNilai = {};

/* semua field dari Form Design, dipakai sebagai kamus variabel & pilihan syarat */
/* satu elemen KBLI menghasilkan beberapa variabel, dan ia sendiri menjadi lingkup perulangan
   karena isinya berupa daftar baris KBLI yang dipilih */
const PAKET_KBLI = [
  ['kode',    'Kode KBLI'],
  ['judul',   'Nama kegiatan usaha'],
  ['golongan','Golongan pokok']
];
function pecahanKbli(f){
  if (f.tipe !== 'kbli' || !f.kode) return [];
  return PAKET_KBLI.map(x => ({
    kode: f.kode + '_' + x[0], label: x[1], tipe:'teks', sumber:'order',
    dari: f.kode, paket: f.label || 'KBLI'
  }));
}

/* semua grup berulang di seluruh tab — dipakai sebagai lingkup perulangan redaksi */
function semuaGrupUlang(){
  const out = [];
  rancangan.tab.forEach(t => (t.field || []).forEach(f => {
    if ((f.tipe === 'ulang' || f.tipe === 'kbli') && f.kode)
      out.push({ kode:f.kode, label:f.label || (f.tipe === 'kbli' ? 'KBLI' : 'Grup'), tab:t.nama, tabId:t.id });
  }));
  return out;
}
/* grup berulang yang menaungi sebuah field, bila ada */
function grupUlangDari(t, f){
  let kini = null;
  for (const x of (t.field || [])){
    if (x.tipe === 'ulang'){ kini = x; continue; }
    if (x.tipe === 'seksi'){ kini = null; continue; }
    if (x.id === f.id) return kini;
  }
  return null;
}

function semuaField(){
  const out = [];
  const ada = {};
  const taruh = x => { if (!ada[x.kode]){ ada[x.kode] = 1; out.push(x); } };
  rancangan.tab.forEach(t => t.field.forEach(f => {
    if (TANPA_NILAI.includes(f.tipe) || !f.kode) return;
    const g = grupUlangDari(t, f);
    const tanda = { tab: t.nama, tabId: t.id, grup: g ? (g.label || 'Grup') : '', grupKode: g ? g.kode : '' };
    taruh(Object.assign({}, f, tanda));
    pecahanUser(f).forEach(x => taruh(Object.assign({}, x, tanda, { lebar:'penuh' })));
    pecahanTerbilang(f).forEach(x => taruh(Object.assign({}, x, tanda, { lebar:'penuh' })));
    pecahanKbli(f).forEach(x => taruh(Object.assign({}, x, tanda,
      { lebar:'penuh', grup: f.label || 'KBLI', grupKode: f.kode })));
  }));
  return out;
}
const fieldKode = k => semuaField().find(f => f.kode === k);
const labelKode = k => { const f = fieldKode(k); return f ? f.label : k; };

function ringkasSyarat(sy){
  if (!sy || !sy.length) return 'selalu';
  return sy.map(c => labelKode(c.field) + ' ' + c.op + (c.op === 'terisi' ? '' : ' ' + c.nilai)).join(' dan ');
}

const LABEL_TULIS = { awalKelompok:'awal kelompok', akhirKelompok:'akhir kelompok', sekali:'sekali' };
function kartuPot(p, prioritas){
  const b = bagianIni();
  const tandaTulis = (b && b.jenis === 'otomatis' && b.ulang && LABEL_TULIS[p.tulis])
    ? '<span class="tulisn">' + LABEL_TULIS[p.tulis] + '</span>' : '';
  return '<div class="pot' + (potAktif === p.kode ? ' aktif' : '') + '" data-kode="' + esc(p.kode) + '">' +
    (prioritas ? '<span class="pri">' + prioritas + '</span>' : '') +
    '<span class="nm">' + esc(p.judul) + '</span>' + tandaTulis +
    (p.slot && p.slot.length ? '<span class="slotn">' + p.slot.length + ' slot</span>' : '') +
    '<span class="sy">' + esc(ringkasSyarat(p.syarat)) + '</span></div>';
}

/* ---------- baris syarat ---------- */
function pilihanFieldHtml(terpilih){
  const opsi = f => '<option value="' + esc(f.kode) + '"' + (f.kode === terpilih ? ' selected' : '') + '>' +
    esc(f.label) + '</option>';
  const semua = semuaField();
  const perTab = {};
  const perPaket = {};
  semua.forEach(f => {
    if (f.paket) (perPaket[f.dari] = perPaket[f.dari] || { nama: f.paket, tab: f.tab, isi: [] }).isi.push(f);
    else (perTab[f.tab] = perTab[f.tab] || []).push(f);
  });
  let h = Object.keys(perTab).map(t => '<optgroup label="' + esc(t) + '">' +
    perTab[t].map(opsi).join('') + '</optgroup>').join('');
  h += Object.keys(perPaket).map(k => '<optgroup label="' + esc(perPaket[k].nama) + ' — ' +
    esc(perPaket[k].tab) + '">' + perPaket[k].isi.map(opsi).join('') + '</optgroup>').join('');
  return h;
}
function nilaiSyaratPotHtml(c){
  const f = fieldKode(c.field);
  if (f && (f.tipe === 'pilihan' || f.tipe === 'segmented'))
    return '<select data-s="nilai">' + (f.opsi||[]).map(o =>
      '<option' + (o === c.nilai ? ' selected' : '') + '>' + esc(o) + '</option>').join('') + '</select>';
  if (f && f.tipe === 'yatidak')
    return '<select data-s="nilai"><option' + (c.nilai==='Ya'?' selected':'') + '>Ya</option>' +
      '<option' + (c.nilai==='Tidak'?' selected':'') + '>Tidak</option></select>';
  return '<input type="text" data-s="nilai" value="' + esc(c.nilai||'') + '">';
}
function barisSyaratPot(c, i, induk){
  return '<div class="baris-syarat" data-i="' + i + '" data-induk="' + induk + '">' +
    '<select data-s="field">' + pilihanFieldHtml(c.field) + '</select>' +
    '<select data-s="op">' + ['=','≠','terisi'].map(o =>
      '<option' + (o === c.op ? ' selected' : '') + '>' + o + '</option>').join('') + '</select>' +
    (c.op === 'terisi' ? '<span class="tanpa-nilai">tidak perlu nilai</span>' : nilaiSyaratPotHtml(c)) +
    '<button class="btn btn-kecil btn-bahaya" data-s="hapus">×</button></div>';
}

/* ---------- editor potongan ---------- */
function gambarEditorPot(p, box){
  const grup = (rancangan.grup || []).find(g => g.anggota.includes(p.kode));

  let h = '<div class="ed-kepala" style="border-top:1px solid var(--garis)">' +
    '<input type="text" class="judul-input" data-pj value="' + esc(p.judul) + '" placeholder="Nama potongan">' +
    '<span class="kanan"><button class="btn btn-bahaya btn-kecil" data-hapuspot>Hapus potongan</button></span></div>';

  h += '<div class="ed-badan">';

  /* syarat */
  h += '<div class="f"><label class="j">Syarat tampil</label>';
  h += '<p class="hampa">' + (p.syarat.length
    ? 'Potongan ini tertulis bila semua baris di bawah terpenuhi.'
    : 'Tanpa syarat — potongan ini selalu tertulis.') + '</p>';
  p.syarat.forEach((c,i) => {
    if (i) h += '<div class="dan">DAN</div>';
    h += barisSyaratPot(c, i, 'utama');
  });
  h += '<button class="btn btn-kecil" data-tambahsyarat="utama" style="margin-top:6px">+ Syarat</button></div>';

  /* perulangan & penomoran & grup */
  const indukUlang = bagianIni() && bagianIni().jenis === 'otomatis' ? (bagianIni().ulang || '') : '';
  if (indukUlang){
    const nm = (rancangan.tab.find(t => t.id === indukUlang) || {}).nama ||
               ((semuaGrupUlang().find(g => g.kode === indukUlang) || {}).label) || indukUlang;
    h += '<div class="f"><label class="j">Ditulis</label><select data-tulis>' +
      [['baris','Tiap baris ' + nm],
       ['awalKelompok','Sekali di awal kelompok'],
       ['akhirKelompok','Sekali di akhir kelompok'],
       ['sekali','Sekali saja di bagian ini']]
        .map(o => '<option value="' + o[0] + '"' + ((p.tulis||'baris') === o[0] ? ' selected' : '') +
          '>' + esc(o[1]) + '</option>').join('') + '</select>' +
      '<p class="hampa" style="margin:7px 0 0">Bagian <b>' + esc(bagianIni().judul) + '</b> berputar atas ' +
      esc(nm) + ', jadi potongan ini ikut putaran itu. Nomornya diberikan sekali per baris oleh bagian, ' +
      'bukan oleh potongan.</p></div>';
  }

  h += '<div class="dua-kol">';
  h += '<div class="f"><label class="j">' + (indukUlang ? 'Perulangan bersarang di dalam baris' : 'Diulang atas') +
    '</label><select data-ulang>' +
    '<option value="">' + (indukUlang ? 'Tidak bersarang — ikut baris induk' : 'Tidak diulang — sekali per dokumen') +
    '</option>' +
    rancangan.tab.filter(t => t.id !== indukUlang)
      .map(t => '<option value="' + esc(t.id) + '"' + (p.ulang === t.id ? ' selected' : '') + '>' +
        'Tiap baris ' + esc(t.nama) + '</option>').join('') +
    (function(){
      const g2 = semuaGrupUlang().filter(g => g.kode !== indukUlang);
      return g2.length ? '<optgroup label="Grup berulang di dalam formulir">' +
        g2.map(g => '<option value="' + esc(g.kode) + '"' + (p.ulang === g.kode ? ' selected' : '') +
          '>Tiap baris ' + esc(g.label) + ' (' + esc(g.tab) + ')</option>').join('') + '</optgroup>' : '';
    })() +
    '</select>' +
    (indukUlang ? '<p class="hampa" style="margin:7px 0 0">Isi hanya bila di dalam satu baris induk ' +
      'masih ada daftar yang berulang lagi, misalnya riwayat perubahan di dalam satu pihak.</p>' : '') +
    '</div>';
  h += '<div class="f"><label class="j">Penomoran</label><select data-nomor' + (indukUlang ? ' disabled' : '') + '>' +
    [['tanpa','Tanpa nomor'],['angka','1. 2. 3.'],['romawi','I. II. III.'],['huruf','a. b. c.']].map(o =>
      '<option value="' + o[0] + '"' + (p.nomor === o[0] ? ' selected' : '') + '>' + o[1] + '</option>').join('') +
    '</select>' + (indukUlang ? '<p class="hampa" style="margin:7px 0 0">Diatur di tingkat bagian.</p>' : '') +
    '</div></div>';

  h += '<div class="f"><label class="j">Grup pilih-satu</label><select data-grup>' +
    '<option value="">Berdiri sendiri</option>' +
    (rancangan.grup||[]).map(g => '<option value="' + esc(g.kode) + '"' +
      (grup && grup.kode === g.kode ? ' selected' : '') + '>' + esc(g.judul) + '</option>').join('') +
    '</select>';
  if (grup){
    const urut = grup.anggota.indexOf(p.kode);
    h += '<p class="hampa" style="margin:8px 0 6px">Hanya satu anggota grup yang tertulis; yang diperiksa lebih dulu menang.</p>' +
      '<div style="display:flex;align-items:center;gap:8px">' +
      '<span class="pri">Prioritas ' + (urut+1) + ' dari ' + grup.anggota.length + '</span>' +
      '<button class="btn btn-kecil" data-geser="-1"' + (urut===0?' disabled':'') + '>Naikkan</button>' +
      '<button class="btn btn-kecil" data-geser="1"' + (urut===grup.anggota.length-1?' disabled':'') + '>Turunkan</button></div>';
  }
  h += '</div>';

  /* redaksi */
  h += '<div class="f"><label class="j">Redaksi</label>' + penyuntingHtml('teks', p.teks) +
    '<p class="hampa" style="margin-top:6px">Tulis <code>[[slot:kode]]</code> untuk menandai sisipan bersyarat di tengah kalimat.</p>' +
    peringatanVarHtml(p) + '</div>';

  /* slot */
  h += '<div class="f"><label class="j">Sisipan bersyarat di dalam kalimat</label>';
  if (!p.slot.length) h += '<p class="hampa">Tidak ada. Potongan ini muncul atau hilang utuh.</p>';
  p.slot.forEach((sl,i) => {
    h += '<div class="slot-kartu"><div class="kep"><span class="kode-slot">[[slot:' + esc(sl.kode) + ']]</span>' +
      '<b>' + esc(sl.label) + '</b>' +
      '<span class="kanan"><button class="btn btn-kecil btn-bahaya" data-hapusslot="' + i + '">Hapus sisipan</button></span></div>';
    sl.syarat.forEach((c,j) => {
      if (j) h += '<div class="dan">DAN</div>';
      h += barisSyaratPot(c, j, 'slot:' + i);
    });
    h += '<button class="btn btn-kecil" data-tambahsyarat="slot:' + i + '" style="margin:2px 0 10px">+ Syarat</button>';
    h += penyuntingHtml('slot' + i, sl.teks, { pendek:true }) + '</div>';
  });
  h += '<button class="btn btn-kecil" data-tambahslot>+ Sisipan bersyarat</button></div>';

  h += '</div>';  /* ed-badan */

  /* uji */
  h += ujiHtml(p);

  box.innerHTML = h;
  pasangEditorPot(p, grup, box);
}

/* =====================================================================
   Penyunting naskah — bilah alat lengkap
   ===================================================================== */
const SVG = (d, o) => '<svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" ' +
  'stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"' + (o||'') + '>' + d + '</svg>';
const IK = {
  ul  : SVG('<path d="M6 4h9M6 8h9M6 12h9"/><circle cx="2.6" cy="4" r="1" fill="currentColor" stroke="none"/>' +
            '<circle cx="2.6" cy="8" r="1" fill="currentColor" stroke="none"/>' +
            '<circle cx="2.6" cy="12" r="1" fill="currentColor" stroke="none"/>'),
  ol  : SVG('<path d="M6 4h9M6 8h9M6 12h9"/><text x="0.6" y="5.4" font-size="5" fill="currentColor" stroke="none">1</text>' +
            '<text x="0.6" y="9.4" font-size="5" fill="currentColor" stroke="none">2</text>' +
            '<text x="0.6" y="13.4" font-size="5" fill="currentColor" stroke="none">3</text>'),
  kutip: SVG('<path d="M6 5.5C4.3 5.5 3 6.8 3 8.4c0 1.4 1 2.4 2.3 2.4 1 0 1.7-.6 1.7-1.5S6.4 7.9 5.6 7.9c-.2 0-.4 0-.5.1.2-.8.9-1.3 1.8-1.3zM13 5.5c-1.7 0-3 1.3-3 2.9 0 1.4 1 2.4 2.3 2.4 1 0 1.7-.6 1.7-1.5s-.6-1.4-1.4-1.4c-.2 0-.4 0-.5.1.2-.8.9-1.3 1.8-1.3z" fill="currentColor" stroke="none"/>'),
  tautan: SVG('<path d="M6.6 9.4a2.6 2.6 0 0 0 3.7 0l2-2a2.6 2.6 0 1 0-3.7-3.7l-.8.8"/>' +
              '<path d="M9.4 6.6a2.6 2.6 0 0 0-3.7 0l-2 2a2.6 2.6 0 1 0 3.7 3.7l.8-.8"/>'),
  gambar: SVG('<rect x="1.8" y="3" width="12.4" height="10" rx="1.4"/><circle cx="5.6" cy="6.4" r="1.1"/>' +
              '<path d="M2.4 11.4l3.3-3 2.2 2 2.4-2.6 3.3 3.6"/>'),
  rkiri : SVG('<path d="M2 3.5h12M2 6.8h7.5M2 10.1h12M2 13.4h7.5"/>'),
  rteng : SVG('<path d="M2 3.5h12M4.3 6.8h7.4M2 10.1h12M4.3 13.4h7.4"/>'),
  rkanan: SVG('<path d="M2 3.5h12M6.5 6.8h7.5M2 10.1h12M6.5 13.4h7.5"/>'),
  rpenuh: SVG('<path d="M2 3.5h12M2 6.8h12M2 10.1h12M2 13.4h12"/>'),
  keluar: SVG('<path d="M6.5 3.5h8M6.5 8h8M6.5 12.5h8"/><path d="M4 5.8L1.6 8 4 10.2"/>'),
  masuk : SVG('<path d="M6.5 3.5h8M6.5 8h8M6.5 12.5h8"/><path d="M1.6 5.8L4 8l-2.4 2.2"/>'),
  tabel : SVG('<rect x="1.8" y="3" width="12.4" height="10" rx="1.2"/><path d="M1.8 6.4h12.4M1.8 9.7h12.4M6 3v10M10 3v10"/>'),
  putus : SVG('<path d="M1.6 8h2.6M6.5 8h3M11.8 8h2.6"/><path d="M5.4 4.6L8 2l2.6 2.6"/><path d="M5.4 11.4L8 14l2.6-2.6"/>'),
  garis : SVG('<path d="M1.6 8h12.8"/><path d="M3 4.4h10M3 11.6h10" opacity=".4"/>'),
  urung : SVG('<path d="M3 7.2h6.4a3.4 3.4 0 1 1 0 6.8H7"/><path d="M5.4 4.6L2.8 7.2l2.6 2.6"/>'),
  ulangi: SVG('<path d="M13 7.2H6.6a3.4 3.4 0 1 0 0 6.8H9"/><path d="M10.6 4.6l2.6 2.6-2.6 2.6"/>'),
  kode  : SVG('<path d="M5.6 4.8L2.2 8l3.4 3.2M10.4 4.8L13.8 8l-3.4 3.2"/>'),
  lebar : SVG('<path d="M9.6 2.4h4v4M6.4 13.6h-4v-4"/><path d="M13.6 2.4L9.2 6.8M2.4 13.6l4.4-4.4"/>'),
  bersih: SVG('<text x="0.4" y="12" font-size="10" fill="currentColor" stroke="none">T</text>' +
              '<path d="M8.4 4.6l5.4 7M13.8 4.6l-5.4 7"/>')
};
const WARNA = ['#000000','#333333','#6b7280','#9ca3af','#c62828','#d97706','#2f6b52','#1d4ed8',
               '#7c3aed','#be185d','#0f766e','#4d7c0f','#b45309','#991b1b','#1e3a8a','#ffffff'];
const SOROT = ['#fff3bf','#ffe0e0','#dff3e6','#e0edff','#f3e8ff','#ffe8d1','#e5e7eb','transparent'];

/* naskah lama berupa teks polos diubah sekali jadi HTML */
function naskahKeHtml(t, sebaris){
  const s = (t == null) ? '' : String(t);
  if (!s.trim()) return '';
  if (/<(p|div|ul|ol|h[1-6]|table|blockquote|br|span|hr|img)\b/i.test(s)) return s;
  /* sisipan menyambung di tengah kalimat, jadi tidak boleh jadi blok sendiri */
  if (sebaris) return esc(s).replace(/\n/g, ' ');
  return s.split(/\n{2,}/).map(par => '<p>' + esc(par).replace(/\n/g, '<br>') + '</p>').join('');
}
/* untuk ringkasan satu baris */
function htmlKeTeks(h){
  const d = document.createElement('div');
  d.innerHTML = h || '';
  return (d.textContent || '').trim();
}

let editorKe = 0;
function tbl(aksi, isi, judul, extra){
  return '<button type="button" data-aksi="' + aksi + '" title="' + esc(judul) + '"' +
    (extra || '') + '>' + isi + '</button>';
}
function penyuntingHtml(kunci, nilai, opsi){
  const o = opsi || {};
  const id = 'ed' + (++editorKe);
  let h = '<div class="penyunting" data-ed="' + kunci + '" data-id="' + id + '"><div class="bilah">';

  h += tbl('bold','<span class="cap" style="font-family:serif"><b>B</b></span>','Tebal');
  h += tbl('italic','<span class="cap" style="font-family:serif;font-style:italic">I</span>','Miring');
  h += tbl('underline','<span class="cap" style="text-decoration:underline">U</span>','Garis bawah');
  h += tbl('strikeThrough','<span class="cap" style="text-decoration:line-through">S</span>','Coret');
  h += '<span class="turun"><button type="button" data-laci="huruf" title="Besar kecil huruf">' +
       '<span class="cap">Aa</span><span class="kcl">˅</span></button>' +
       '<div class="laci" data-isi="huruf" hidden>' +
         tbl('huruf:atas','HURUF BESAR','Huruf besar semua') +
         tbl('huruf:bawah','huruf kecil','Huruf kecil semua') +
         tbl('huruf:judul','Huruf Kapital Tiap Kata','Kapital tiap kata') +
       '</div></span>';
  h += tbl('removeFormat', IK.bersih, 'Hapus format');
  h += tbl('insertUnorderedList', IK.ul, 'Daftar titik');
  h += tbl('insertOrderedList', IK.ol, 'Daftar bernomor');
  h += '<span class="sp"></span>';

  h += tbl('blok:H1','<span class="cap">H<span class="kcl">1</span></span>','Judul 1');
  h += tbl('blok:H2','<span class="cap">H<span class="kcl">2</span></span>','Judul 2');
  h += tbl('blok:H3','<span class="cap">H<span class="kcl">3</span></span>','Judul 3');
  h += tbl('blok:BLOCKQUOTE', IK.kutip, 'Kutipan');
  h += '<span class="sp"></span>';

  h += '<span class="turun"><button type="button" class="warna" data-laci="warna" title="Warna teks">' +
       '<span><span class="cap">A</span><span class="bar" style="background:#c62828"></span></span>' +
       '<span class="kcl">˅</span></button><div class="laci" data-isi="warna" hidden><div class="petak">' +
       WARNA.map(w => '<button type="button" data-aksi="warna:' + w + '" title="' + w +
         '" style="background:' + w + '"></button>').join('') + '</div></div></span>';
  h += '<span class="turun"><button type="button" class="warna" data-laci="sorot" title="Warna sorot">' +
       '<span><span class="cap">✎</span><span class="bar" style="background:#fff3bf"></span></span>' +
       '<span class="kcl">˅</span></button><div class="laci" data-isi="sorot" hidden><div class="petak">' +
       SOROT.map(w => '<button type="button" data-aksi="sorot:' + w + '" title="' + w +
         '" style="background:' + (w === 'transparent' ? '#fff' : w) + '"></button>').join('') + '</div></div></span>';
  h += '<select data-ukuran title="Ukuran huruf">' +
       ['10pt','11pt','12pt','14pt','16pt','18pt','24pt','32pt'].map(u =>
         '<option' + (u === '16pt' ? ' selected' : '') + '>' + u + '</option>').join('') + '</select>';
  h += '<span class="sp"></span>';

  h += tbl('tautan', IK.tautan, 'Sisipkan tautan');
  h += tbl('gambar', IK.gambar, 'Sisipkan gambar');
  h += '<span class="sp"></span>';

  h += tbl('justifyLeft', IK.rkiri, 'Rata kiri');
  h += tbl('justifyCenter', IK.rteng, 'Rata tengah');
  h += tbl('justifyRight', IK.rkanan, 'Rata kanan');
  h += tbl('justifyFull', IK.rpenuh, 'Rata kiri-kanan');
  h += '<span class="sp"></span>';

  h += tbl('outdent', IK.keluar, 'Kurangi indentasi');
  h += tbl('indent', IK.masuk, 'Tambah indentasi');
  h += '<select data-spasi title="Spasi baris">' +
       [['','Spasi: bawaan'],['1','Spasi: 1'],['1.5','Spasi: 1,5'],['2','Spasi: 2'],['2.5','Spasi: 2,5']]
         .map(s => '<option value="' + s[0] + '">' + s[1] + '</option>').join('') + '</select>';
  h += '<span class="sp"></span>';

  h += tbl('tabel', IK.tabel, 'Sisipkan tabel 3 × 3');
  h += tbl('pemisah', IK.putus, 'Pemisah halaman');
  h += tbl('insertHorizontalRule', IK.garis, 'Garis pemisah');
  h += '<span class="sp"></span>';

  h += tbl('undo', IK.urung, 'Urungkan');
  h += tbl('redo', IK.ulangi, 'Lakukan lagi');
  h += '<span class="sp"></span>';

  h += tbl('sumber', IK.kode, 'Lihat sumber HTML');
  h += tbl('variabel', '<span class="cap">{ }</span> Variabel', 'Sisipkan variabel', ' class="var"');
  h += tbl('lebar', IK.lebar, 'Perbesar area tulis', ' class="tarik"');
  h += '</div>';

  h += '<div class="editor-isi" contenteditable="true" data-isi-ed' +
       (o.pendek ? ' style="min-height:96px"' : '') + '>' + naskahKeHtml(nilai, !!o.pendek) + '</div>';
  h += '<textarea class="editor-sumber" data-sumber-ed hidden></textarea>';
  h += '<div class="kotak-var" data-vbox="' + kunci + '" hidden>' + daftarVarHtml(kunci) + '</div>';
  h += '</div>';
  return h;
}

/* ---------- pengikat ---------- */
function pasangPenyunting(akar, kunci, simpan){
  const box = akar.querySelector('.penyunting[data-ed="' + kunci + '"]');
  if (!box) return;
  const isi = box.querySelector('[data-isi-ed]');
  const sumber = box.querySelector('[data-sumber-ed]');
  const bilah = box.querySelector('.bilah');
  let simpanan = null;

  const rekam = () => {
    const s = window.getSelection();
    if (s && s.rangeCount && isi.contains(s.anchorNode)) simpanan = s.getRangeAt(0).cloneRange();
  };
  const pulih = () => {
    isi.focus();
    if (!simpanan) return;
    const s = window.getSelection();
    s.removeAllRanges(); s.addRange(simpanan);
  };
  const ubah = () => { simpan(isi.innerHTML); tandaiAktif(); };
  const perintah = (c, v) => { pulih(); document.execCommand(c, false, v == null ? null : v); rekam(); ubah(); };

  isi.addEventListener('input', ubah);
  isi.addEventListener('keyup', rekam);
  isi.addEventListener('mouseup', rekam);
  isi.addEventListener('blur', rekam);
  /* tempel sebagai teks polos supaya gaya dari luar tidak ikut masuk */
  isi.addEventListener('paste', ev => {
    ev.preventDefault();
    const t = (ev.clipboardData || window.clipboardData).getData('text/plain');
    document.execCommand('insertText', false, t);
  });

  function tandaiAktif(){
    [['bold','bold'],['italic','italic'],['underline','underline'],['strikeThrough','strikeThrough'],
     ['insertUnorderedList','insertUnorderedList'],['insertOrderedList','insertOrderedList'],
     ['justifyLeft','justifyLeft'],['justifyCenter','justifyCenter'],
     ['justifyRight','justifyRight'],['justifyFull','justifyFull']].forEach(([aksi, c]) => {
      const b = bilah.querySelector('[data-aksi="' + aksi + '"]');
      if (!b) return;
      let on = false;
      try { on = document.queryCommandState(c); } catch (e) {}
      b.classList.toggle('nyala', on);
    });
  }
  isi.addEventListener('keyup', tandaiAktif);
  isi.addEventListener('mouseup', tandaiAktif);

  /* blok terpilih, untuk spasi baris */
  function blokTerpilih(){
    const s = window.getSelection();
    if (!s || !s.rangeCount) return [];
    let n = s.getRangeAt(0).commonAncestorContainer;
    if (n.nodeType === 3) n = n.parentNode;
    if (n === isi) return Array.from(isi.children);
    while (n && n.parentNode !== isi) n = n.parentNode;
    return n ? [n] : [];
  }
  function ukuranHuruf(pt){
    pulih();
    document.execCommand('fontSize', false, '7');
    isi.querySelectorAll('font[size="7"]').forEach(f => {
      const sp = document.createElement('span');
      sp.style.fontSize = pt;
      sp.innerHTML = f.innerHTML;
      f.replaceWith(sp);
    });
    rekam(); ubah();
  }
  function ubahHuruf(mode){
    pulih();
    const s = window.getSelection();
    if (!s || s.isCollapsed) return;
    const t = s.toString();
    const baru = mode === 'atas' ? t.toUpperCase()
      : mode === 'bawah' ? t.toLowerCase()
      : t.replace(/\S+/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    document.execCommand('insertText', false, baru);
    rekam(); ubah();
  }

  /* tombol tidak boleh merebut fokus dari area tulis */
  bilah.addEventListener('mousedown', ev => { if (ev.target.closest('button,select')) ev.preventDefault(); });

  bilah.addEventListener('click', ev => {
    const laci = ev.target.closest('[data-laci]');
    if (laci){
      const k = laci.dataset.laci;
      box.querySelectorAll('.laci').forEach(l => { if (l.dataset.isi !== k) l.hidden = true; });
      const l = box.querySelector('.laci[data-isi="' + k + '"]');
      l.hidden = !l.hidden;
      return;
    }
    const b = ev.target.closest('[data-aksi]');
    if (!b) return;
    const a = b.dataset.aksi;
    box.querySelectorAll('.laci').forEach(l => l.hidden = true);

    if (a.startsWith('huruf:'))  return ubahHuruf(a.slice(6));
    if (a.startsWith('warna:'))  return perintah('foreColor', a.slice(6));
    if (a.startsWith('sorot:')){
      const w = a.slice(6);
      pulih();
      if (!document.execCommand('hiliteColor', false, w)) document.execCommand('backColor', false, w);
      rekam(); return ubah();
    }
    if (a.startsWith('blok:')){
      const tag = a.slice(5);
      const s = window.getSelection();
      let n = s && s.rangeCount ? s.getRangeAt(0).commonAncestorContainer : null;
      if (n && n.nodeType === 3) n = n.parentNode;
      while (n && n !== isi && !/^(H1|H2|H3|BLOCKQUOTE)$/.test(n.nodeName)) n = n.parentNode;
      return perintah('formatBlock', (n && n.nodeName === tag) ? 'P' : tag);
    }
    if (a === 'tautan'){
      const u = window.prompt('Alamat tautan', 'https://');
      if (u) perintah('createLink', u);
      return;
    }
    if (a === 'gambar'){
      const u = window.prompt('Alamat gambar (URL)', 'https://');
      if (u) perintah('insertImage', u);
      return;
    }
    if (a === 'tabel'){
      let t = '<table>';
      for (let r = 0; r < 3; r++){
        t += '<tr>';
        for (let c = 0; c < 3; c++) t += '<td><br></td>';
        t += '</tr>';
      }
      return perintah('insertHTML', t + '</table><p><br></p>');
    }
    if (a === 'pemisah')
      return perintah('insertHTML', '<div class="pemisah-halaman" contenteditable="false">— pemisah halaman —</div><p><br></p>');
    if (a === 'sumber'){
      const keSumber = sumber.hidden;
      if (keSumber){ sumber.value = isi.innerHTML; sumber.hidden = false; isi.hidden = true; }
      else { isi.innerHTML = sumber.value; sumber.hidden = true; isi.hidden = false; ubah(); }
      b.classList.toggle('nyala', keSumber);
      return;
    }
    if (a === 'variabel'){
      const k = box.querySelector('[data-vbox]');
      k.hidden = !k.hidden;
      b.classList.toggle('nyala', !k.hidden);
      return;
    }
    if (a === 'lebar'){
      box.classList.toggle('luas');
      b.classList.toggle('nyala', box.classList.contains('luas'));
      return;
    }
    perintah(a);
  });

  sumber.addEventListener('input', () => { isi.innerHTML = sumber.value; simpan(sumber.value); });

  const selUk = bilah.querySelector('[data-ukuran]');
  if (selUk) selUk.addEventListener('change', () => ukuranHuruf(selUk.value));
  const selSp = bilah.querySelector('[data-spasi]');
  if (selSp) selSp.addEventListener('change', () => {
    pulih();
    blokTerpilih().forEach(el => { el.style.lineHeight = selSp.value || ''; });
    ubah();
  });

  box.querySelectorAll('[data-sisip]').forEach(x => x.addEventListener('mousedown', ev => ev.preventDefault()));
  box.querySelectorAll('[data-sisip]').forEach(x => x.addEventListener('click', () => {
    perintah('insertText', '{{' + x.dataset.sisip + '}}');
  }));

  document.addEventListener('click', ev => {
    if (!box.contains(ev.target)) box.querySelectorAll('.laci').forEach(l => l.hidden = true);
  });
}

function daftarVarHtml(kunci){
  const chip = f => '<button data-sisip="' + esc(f.kode) + '" data-ke="' + kunci + '" title="' +
    esc(f.label) + '">{{' + esc(f.kode) + '}}</button>';
  const grup = {};
  semuaField().forEach(f => { (grup[f.tab] = grup[f.tab] || []).push(f); });
  return Object.keys(grup).map(t => {
    const sendiri = grup[t].filter(f => !f.dari);
    const anak = {};
    grup[t].filter(f => f.dari).forEach(f => { (anak[f.dari] = anak[f.dari] || []).push(f); });
    let h = '<div class="gv">' + esc(t) + '</div><div class="chips-var">' +
      sendiri.map(chip).join('') + '</div>';
    Object.keys(anak).forEach(k => {
      const nama = (anak[k][0] && anak[k][0].paket) || null;
      h += '<div class="gv anak">' +
        (nama ? esc(nama) + ' <code>{{' + esc(k) + '}}</code>'
              : 'turunan dari <code>{{' + esc(k) + '}}</code>') + '</div>' +
        '<div class="chips-var">' + anak[k].map(chip).join('') + '</div>';
    });
    return h;
  }).join('');
}
function varTakDikenal(p){
  const sah = semuaField().map(f => f.kode)
    .concat((rancangan.varDokumen || []).map(v => v.kode).filter(Boolean));
  const semua = [p.teks].concat(p.slot.map(s => s.teks)).join(' ');
  const pakai = [...new Set((semua.match(/\{\{[^}]+\}\}/g) || []).map(v => v.slice(2,-2).trim()))];
  return pakai.filter(v => !sah.includes(v));
}
function peringatanVarHtml(p){
  const asing = varTakDikenal(p);
  if (!asing.length) return '';
  return '<div class="peringatan-var"><b>Variabel tidak dikenal:</b> ' +
    asing.map(v => '<code>{{' + esc(v) + '}}</code>').join(', ') +
    '. Belum ada fieldnya di Form Design, jadi akan tercetak apa adanya saat drafting.</div>';
}

/* ---------- uji kondisi ---------- */
function fieldDipakaiSyarat(p){
  const semua = p.syarat.concat(...p.slot.map(s => s.syarat));
  return [...new Set(semua.map(c => c.field))];
}
function ujiHtml(p){
  const dipakai = fieldDipakaiSyarat(p);
  let h = '<div class="uji"><span class="j">Uji kondisi</span>';
  if (!dipakai.length){
    h += '<p class="hampa">Potongan ini tanpa syarat, jadi selalu tampil.</p>';
  } else {
    h += '<div class="uji-grid">' + dipakai.map(k => {
      const f = fieldKode(k);
      const nilai = ujiNilai[k] != null ? ujiNilai[k] : '';
      let kontrol;
      if (f && (f.tipe === 'pilihan' || f.tipe === 'segmented'))
        kontrol = '<select data-uji="' + esc(k) + '"><option value="">— belum diisi —</option>' +
          (f.opsi||[]).map(o => '<option' + (o === nilai ? ' selected' : '') + '>' + esc(o) + '</option>').join('') + '</select>';
      else if (f && f.tipe === 'yatidak')
        kontrol = '<select data-uji="' + esc(k) + '"><option value="">— belum diisi —</option>' +
          '<option' + (nilai==='Ya'?' selected':'') + '>Ya</option><option' + (nilai==='Tidak'?' selected':'') + '>Tidak</option></select>';
      else kontrol = '<input type="text" data-uji="' + esc(k) + '" value="' + esc(nilai) + '">';
      return '<div><label>' + esc(f ? f.label : k) + '</label>' + kontrol + '</div>';
    }).join('') + '</div>';
  }
  const lolos = cekSyaratPot(p.syarat);
  h += '<div class="hasil"><span class="tanda-tampil ' + (lolos ? 'tampil-ya' : 'tampil-tidak') + '">' +
    (lolos ? 'Tampil' : 'Tidak tampil') + '</span>' +
    (lolos ? '<div class="naskah-hasil">' + rakitPot(p) + '</div>'
           : '<p class="hampa" style="margin:0">Syarat belum terpenuhi, potongan ini tidak ikut tertulis.</p>') +
    '</div></div>';
  return h;
}
function cekSyaratPot(sy){
  return (sy||[]).every(c => {
    const v = ujiNilai[c.field];
    if (c.op === 'terisi') return !!(v && String(v).trim());
    if (c.op === '≠')      return !!v && v !== c.nilai;
    return v === c.nilai;
  });
}
function tandaiVar(h){ return h.replace(/\{\{[^}]+\}\}/g, m => '<span class="v">' + m + '</span>'); }
function rakitPot(p){
  let bagian = [{t:p.teks, slot:null}];
  p.slot.forEach(sl => {
    const baru = [];
    bagian.forEach(b => {
      if (b.slot){ baru.push(b); return; }
      b.t.split('[[slot:' + sl.kode + ']]').forEach((x,i) => {
        if (i) baru.push({t:null, slot:sl});
        baru.push({t:x, slot:null});
      });
    });
    bagian = baru;
  });
  return bagian.map(b => b.slot
    ? (cekSyaratPot(b.slot.syarat) ? '<span class="sisipan">' + tandaiVar(b.slot.teks || '') + '</span>' : '')
    : tandaiVar(b.t || '')).join('');
}

/* ---------- pengikat editor ---------- */
function pasangEditorPot(p, grup, box){
  const ulang = () => { gambarKanan(); simpanNanti(); };
  const ambilSy = induk => induk === 'utama' ? p.syarat : p.slot[+induk.split(':')[1]].syarat;

  box.querySelector('[data-pj]').addEventListener('input', e => {
    p.judul = e.target.value;
    const kartu = document.querySelector('.pot[data-kode="' + p.kode + '"] .nm');
    if (kartu) kartu.textContent = p.judul;
    simpanNanti();
  });
  box.querySelector('[data-hapuspot]').addEventListener('click', () => {
    rancangan.potongan = rancangan.potongan.filter(x => x.kode !== p.kode);
    (rancangan.grup||[]).forEach(g => { g.anggota = g.anggota.filter(k => k !== p.kode); });
    rancangan.bagian.forEach(b => { if (b.potongan) b.potongan = b.potongan.filter(k => k !== p.kode); });
    const b = bagianIni();
    potAktif = (b && b.potongan && b.potongan.length) ? b.potongan[0] : null;
    ulang();
  });

  box.querySelectorAll('.baris-syarat').forEach(row => {
    const sy = ambilSy(row.dataset.induk), i = +row.dataset.i;
    row.querySelector('[data-s="field"]').addEventListener('change', e => {
      sy[i].field = e.target.value;
      const f = fieldKode(e.target.value);
      const bebas = !(f && f.opsi && f.opsi.length) && !(f && f.tipe === 'yatidak');
      sy[i].op = bebas ? 'terisi' : '=';
      sy[i].nilai = (f && f.opsi && f.opsi[0]) || (f && f.tipe === 'yatidak' ? 'Ya' : '');
      ulang();
    });
    row.querySelector('[data-s="op"]').addEventListener('change', e => { sy[i].op = e.target.value; ulang(); });
    const nl = row.querySelector('[data-s="nilai"]');
    if (nl) nl.addEventListener('change', e => { sy[i].nilai = e.target.value; ulang(); });
    row.querySelector('[data-s="hapus"]').addEventListener('click', () => { sy.splice(i,1); ulang(); });
  });
  box.querySelectorAll('[data-tambahsyarat]').forEach(b => b.addEventListener('click', () => {
    const sy = ambilSy(b.dataset.tambahsyarat);
    const f = semuaField()[0];
    if (!f) return;
    const bebas = !(f.opsi && f.opsi.length) && f.tipe !== 'yatidak';
    sy.push({ field:f.kode, op: bebas ? 'terisi' : '=',
      nilai:(f.opsi && f.opsi[0]) || (f.tipe === 'yatidak' ? 'Ya' : '') });
    ulang();
  }));

  box.querySelector('[data-ulang]').addEventListener('change', e => { p.ulang = e.target.value; simpanNanti(); });
  const selTulis = box.querySelector('[data-tulis]');
  if (selTulis) selTulis.addEventListener('change', e => { p.tulis = e.target.value; gambarKanan(); simpanNanti(); });
  box.querySelector('[data-nomor]').addEventListener('change', e => { p.nomor = e.target.value; simpanNanti(); });
  box.querySelector('[data-grup]').addEventListener('change', e => {
    (rancangan.grup||[]).forEach(g => { g.anggota = g.anggota.filter(k => k !== p.kode); });
    p.grup = e.target.value || null;
    if (p.grup){
      const g = rancangan.grup.find(x => x.kode === p.grup);
      if (g) g.anggota.push(p.kode);
    }
    ulang();
  });
  box.querySelectorAll('[data-geser]').forEach(b => b.addEventListener('click', () => {
    const a = grup.anggota, i = a.indexOf(p.kode), j = i + (+b.dataset.geser);
    [a[i], a[j]] = [a[j], a[i]];
    ulang();
  }));

  pasangPenyunting(box, 'teks', v => { p.teks = v; segarUji(p); simpanNanti(); });
  p.slot.forEach((sl, i) => pasangPenyunting(box, 'slot' + i,
    v => { sl.teks = v; segarUji(p); simpanNanti(); }));
  box.querySelectorAll('[data-hapusslot]').forEach(b => b.addEventListener('click', () => {
    p.slot.splice(+b.dataset.hapusslot, 1); ulang();
  }));
  box.querySelector('[data-tambahslot]').addEventListener('click', () => {
    const n = p.slot.length + 1;
    const kode = 'sisipan' + n;
    p.slot.push({ kode, label:'Sisipan ' + n, syarat:[], teks:'' });
    p.teks += '[[slot:' + kode + ']]';
    ulang();
  });

  box.querySelectorAll('[data-uji]').forEach(el => el.addEventListener('change', e => {
    ujiNilai[el.dataset.uji] = e.target.value; gambarKanan();
  }));
}

function segarUji(p){
  const hasil = $('#editor-satu .hasil .naskah-hasil');
  if (hasil && cekSyaratPot(p.syarat)) hasil.innerHTML = rakitPot(p);
  const ed = $('#editor-satu .penyunting[data-ed="teks"]');
  const induk = ed ? ed.parentElement : null;
  const lama = $('#editor-satu .peringatan-var');
  if (lama) lama.remove();
  const baru = peringatanVarHtml(p);
  if (baru && induk) induk.insertAdjacentHTML('beforeend', baru);
}

/* =====================================================================
   Template Akta — daftar bagian, panel kanan, dan turunannya
   ===================================================================== */
let bagianAktif = null;

function bagianIni(){ return (rancangan.bagian || []).find(b => b.id === bagianAktif) || null; }

function gambarDaftarBagian(){
  if (!Array.isArray(rancangan.bagian)) rancangan.bagian = [];
  if (!bagianAktif && rancangan.bagian.length) bagianAktif = rancangan.bagian[0].id;
  const q = ($('#cari-bagian') && $('#cari-bagian').value || '').trim().toLowerCase();
  let no = 0;
  const kartu = rancangan.bagian.map(b => {
    const nomor = b.jenis === 'pasal' ? String(++no) : (b.jenis === 'otomatis' ? '⚙' : '▤');
    const kelas = b.jenis === 'pasal' ? '' : (b.jenis === 'otomatis' ? ' oto' : ' cat');
    if (q && !b.judul.toLowerCase().includes(q)) return '';
    const sub = b.jenis === 'otomatis'
      ? '<div class="sb">Kondisi · disusun sistem<br>judul disembunyikan</div>' : '';
    const i = rancangan.bagian.indexOf(b);
    return '<div class="bagian-item' + (bagianAktif === b.id ? ' aktif' : '') + '" data-bagian="' + b.id +
      '" draggable="true" title="Seret untuk memindahkan">' +
      '<span class="geser">' +
        '<button type="button" data-geser="naik" title="Naikkan"' + (i === 0 ? ' disabled' : '') + '>↑</button>' +
        '<button type="button" data-geser="turun" title="Turunkan"' +
          (i === rancangan.bagian.length - 1 ? ' disabled' : '') + '>↓</button></span>' +
      '<span class="no' + kelas + '">' + nomor + '</span>' +
      '<span class="tk"><span class="jd">' + esc(b.judul) + '</span>' + sub + '</span>' +
      '<span class="mata">◉</span></div>';
  }).join('');
  $('#daftar-bagian').innerHTML = kartu || '<div class="kosong-panel">Tidak ada bagian yang cocok.</div>';
  $('#n-bagian').textContent = '(' + rancangan.bagian.length + ')';
  $('#n-var').textContent = '(' + semuaField().length + ')';

  $$('#daftar-bagian [data-geser]').forEach(tb => tb.addEventListener('click', ev => {
    ev.stopPropagation();
    pindahBagian(tb.closest('.bagian-item').dataset.bagian, tb.dataset.geser === 'naik' ? -1 : 1);
  }));
  $$('#daftar-bagian .bagian-item').forEach(el => {
    el.addEventListener('dragstart', ev => {
      seretBagian = el.dataset.bagian;
      el.classList.add('diseret');
      ev.dataTransfer.effectAllowed = 'move';
      try { ev.dataTransfer.setData('text/plain', seretBagian); } catch (e) {}
    });
    el.addEventListener('dragend', () => { el.classList.remove('diseret'); bersihSasaran(); seretBagian = null; });
    el.addEventListener('dragover', ev => {
      if (!seretBagian || seretBagian === el.dataset.bagian) return;
      ev.preventDefault();
      ev.dataTransfer.dropEffect = 'move';
      const r = el.getBoundingClientRect();
      bersihSasaran();
      el.classList.add(ev.clientY > r.top + r.height / 2 ? 'sasaran-bawah' : 'sasaran-atas');
    });
    el.addEventListener('dragleave', () => el.classList.remove('sasaran-atas','sasaran-bawah'));
    el.addEventListener('drop', ev => {
      ev.preventDefault();
      if (!seretBagian) return;
      const r = el.getBoundingClientRect();
      const bawah = ev.clientY > r.top + r.height / 2;
      const asal = seretBagian;
      seretBagian = null; bersihSasaran();
      taruhBagian(asal, el.dataset.bagian, bawah);
    });
  });
  $$('#daftar-bagian .bagian-item').forEach(el => el.addEventListener('click', () => {
    bagianAktif = el.dataset.bagian;
    potAktif = null;
    const b = bagianIni();
    if (b && b.jenis === 'otomatis' && (b.potongan || []).length) potAktif = b.potongan[0];
    ujiNilai = {};
    gambarDaftarBagian(); gambarKanan();
  }));
}
if ($('#cari-bagian')) $('#cari-bagian').addEventListener('input', gambarDaftarBagian);

/* ---------- urutan bagian ---------- */
let seretBagian = null;
function bersihSasaran(){
  $$('#daftar-bagian .bagian-item').forEach(x => x.classList.remove('sasaran-atas','sasaran-bawah'));
}
/* judul "Pasal n" dinomori ulang mengikuti urutan; judul yang ditulis sendiri dibiarkan */
function nomorUlangPasal(){
  let n = 0;
  (rancangan.bagian || []).forEach(b => {
    if (b.jenis !== 'pasal') return;
    n++;
    if (/^Pasal\s+\d+$/i.test((b.judul || '').trim())) b.judul = 'Pasal ' + n;
  });
}
function pindahBagian(id, arah){
  const arr = rancangan.bagian;
  const i = arr.findIndex(b => b.id === id);
  if (i < 0) return;
  const j = i + arah;
  if (j < 0 || j >= arr.length) return;
  arr.splice(j, 0, arr.splice(i, 1)[0]);
  bagianAktif = id;
  nomorUlangPasal();
  gambarDaftarBagian(); gambarKanan(); simpanNanti();
}
function taruhBagian(idSeret, idTujuan, bawah){
  const arr = rancangan.bagian;
  if (idSeret === idTujuan) return;
  const i = arr.findIndex(b => b.id === idSeret);
  if (i < 0) return;
  const item = arr.splice(i, 1)[0];
  let j = arr.findIndex(b => b.id === idTujuan);
  if (j < 0) j = arr.length - 1;
  arr.splice(bawah ? j + 1 : j, 0, item);
  bagianAktif = idSeret;
  nomorUlangPasal();
  gambarDaftarBagian(); gambarKanan(); simpanNanti();
}

/* ---------- tambah bagian ---------- */
function tambahBagian(jenis){
  const id = 'b' + Date.now() + Math.floor(Math.random()*90+10);
  let item;
  if (jenis === 'pasal'){
    const n = rancangan.bagian.filter(b => b.jenis === 'pasal').length + 1;
    item = { id, judul:'Pasal ' + n, jenis:'pasal', teks:'' };
  } else if (jenis === 'catatan'){
    item = { id, judul:'Catatan baru', jenis:'catatan', teks:'' };
  } else {
    item = { id, judul:'Bagian Otomatis baru', jenis:'otomatis', potongan: [] };
  }
  rancangan.bagian.push(item);
  bagianAktif = id; potAktif = null;
  nomorUlangPasal();
  gambarDaftarBagian(); gambarKanan(); simpanNanti();
  const el = document.querySelector('#daftar-bagian .bagian-item.aktif');
  if (el && el.scrollIntoView) el.scrollIntoView({ block:'nearest' });
}
$('#tambah-pasal').addEventListener('click',   () => tambahBagian('pasal'));
$('#tambah-catatan').addEventListener('click', () => tambahBagian('catatan'));
$('#tambah-bagian').addEventListener('click',  () => tambahBagian('otomatis'));

/* ---------- panel kanan ---------- */
function tabKananAktif(){
  const b = $$('[data-ktab]').find(x => x.getAttribute('aria-selected') === 'true');
  return b ? b.dataset.ktab : 'bagian';
}
function gambarKanan(){
  const t = tabKananAktif();
  if (t === 'bagian')    return gambarPanelBagian();
  if (t === 'variabel')  return gambarPanelVariabel();
  if (t === 'halaman')   return gambarPanelHalaman();
  if (t === 'pratinjau') return gambarPanelNaskah();
}

function hapusBagian(id){
  const b = (rancangan.bagian || []).find(x => x.id === id);
  if (!b) return;
  if (!window.confirm('Hapus bagian \u201c' + b.judul + '\u201d? Tindakan ini tidak bisa dibatalkan.')) return;
  rancangan.bagian = rancangan.bagian.filter(x => x.id !== id);
  bagianAktif = rancangan.bagian.length ? rancangan.bagian[0].id : null;
  potAktif = null;
  nomorUlangPasal();
  gambarDaftarBagian(); gambarKanan(); simpanNanti();
}

/* pilihan lingkup perulangan: tab dan grup berulang */
function pilihanLingkupHtml(terpilih, labelKosong){
  return '<option value="">' + esc(labelKosong) + '</option>' +
    rancangan.tab.map(t => '<option value="' + esc(t.id) + '"' + (terpilih === t.id ? ' selected' : '') +
      '>Tiap baris ' + esc(t.nama) + '</option>').join('') +
    (semuaGrupUlang().length ? '<optgroup label="Grup berulang di dalam formulir">' +
      semuaGrupUlang().map(g => '<option value="' + esc(g.kode) + '"' + (terpilih === g.kode ? ' selected' : '') +
        '>Tiap baris ' + esc(g.label) + ' (' + esc(g.tab) + ')</option>').join('') + '</optgroup>' : '');
}
/* field yang bisa dipakai sebagai pengelompok di dalam lingkup terpilih */
function fieldLingkup(kode){
  const t = rancangan.tab.find(x => x.id === kode);
  if (t) return semuaField().filter(f => f.tabId === t.id && !f.dari);
  const g = semuaGrupUlang().find(x => x.kode === kode);
  if (!g) return [];
  return semuaField().filter(f => f.tabId === g.tabId && !f.dari);
}
function pengaturUlangBagianHtml(b){
  let h = '<div class="ulang-bagian"><div class="ub-baris-atur">' +
    '<div class="f"><label class="j">Bagian ini diulang atas</label>' +
    '<select data-bulang>' + pilihanLingkupHtml(b.ulang || '', 'Tidak diulang — potongan mengatur sendiri') +
    '</select></div>';
  if (b.ulang){
    h += '<div class="f"><label class="j">Dikelompokkan menurut</label><select data-bkelompok>' +
      '<option value="">Tanpa kelompok</option>' +
      fieldLingkup(b.ulang).map(f => '<option value="' + esc(f.kode) + '"' +
        (b.kelompok === f.kode ? ' selected' : '') + '>' + esc(f.label) + '</option>').join('') +
      '</select></div>' +
      '<div class="f"><label class="j">Penomoran baris</label><select data-bnomor>' +
      [['tanpa','Tanpa nomor'],['angka','1. 2. 3.'],['romawi','I. II. III.'],['huruf','a. b. c.']]
        .map(o => '<option value="' + o[0] + '"' + ((b.nomor||'tanpa') === o[0] ? ' selected' : '') +
          '>' + o[1] + '</option>').join('') + '</select></div>';
  }
  h += '</div>';
  if (b.ulang){
    h += '<label class="sakelar"><input type="checkbox" data-bnomorulang' +
      (b.nomorUlangKelompok ? ' checked' : '') + '> Nomor mulai dari 1 lagi di tiap kelompok</label>' +
      '<p class="hampa" style="margin:8px 0 0">Seluruh potongan di bawah ini ikut satu putaran yang sama, ' +
      'jadi klausa milik satu baris tertulis menempel pada baris itu — bukan menumpuk di belakang.</p>';
  } else {
    h += '<p class="hampa" style="margin:8px 0 0">Tiap potongan berputar sendiri-sendiri. Setel perulangan ' +
      'di sini bila klausa per baris harus menempel pada barisnya.</p>';
  }
  return h + '</div>';
}

function gambarPanelBagian(){
  const box = $('#editor-pot');
  const b = bagianIni();
  if (!b){
    box.innerHTML = '<div class="kosong-kanan"><div class="bulat">▤</div>Klik bagian di panel kiri untuk melihat.</div>';
    return;
  }

  if (b.jenis !== 'otomatis'){
    box.innerHTML = '<div class="ed-kepala">' +
        '<input type="text" class="judul-input" data-bj value="' + esc(b.judul) + '">' +
        '<span class="lencana">' + (b.jenis === 'pasal' ? 'Pasal' : 'Catatan') + '</span>' +
        '<span class="kanan"><button class="btn btn-kecil btn-bahaya" data-hapusbagian>Hapus bagian</button></span></div>' +
      '<div class="ed-badan"><div class="f"><label class="j">Isi</label>' +
        penyuntingHtml('bagian', b.teks || '') +
        '<p class="hampa" style="margin-top:6px">Tidak berkondisi — selalu tertulis apa adanya.</p></div></div>';
    box.querySelector('[data-bj]').addEventListener('input', e => {
      b.judul = e.target.value; gambarDaftarBagian(); simpanNanti();
    });
    box.querySelector('[data-hapusbagian]').addEventListener('click', () => hapusBagian(b.id));
    pasangPenyunting(box, 'bagian', v => { b.teks = v; simpanNanti(); });
    return;
  }

  /* bagian otomatis: daftar potongan + editor */
  b.potongan = b.potongan || [];
  if (!potAktif && b.potongan.length) potAktif = b.potongan[0];
  let h = '<div class="ed-kepala">' +
      '<input type="text" class="judul-input" data-bj value="' + esc(b.judul) + '">' +
      '<span class="lencana">Bagian Otomatis</span>' +
      '<span class="kanan"><button class="btn btn-kecil" data-tambahpot>+ Potongan</button>' +
      '<button class="btn btn-kecil btn-bahaya" data-hapusbagian>Hapus bagian</button></span></div>' +
    '<div class="ed-badan" style="padding-bottom:0">' +
    '<p class="hampa">Struktur dan syaratnya disusun di sini. Di tenant, kantor hanya melihat syaratnya ' +
    'sebagai keterangan terkunci dan menyunting tulisannya saja.</p>' +
    pengaturUlangBagianHtml(b) + daftarPotHtml(b) + '</div>';
  box.innerHTML = h;

  box.querySelector('[data-bj]').addEventListener('input', e => {
    b.judul = e.target.value; gambarDaftarBagian(); simpanNanti();
  });
  box.querySelector('[data-hapusbagian]').addEventListener('click', () => hapusBagian(b.id));
  const selUlang = box.querySelector('[data-bulang]');
  if (selUlang) selUlang.addEventListener('change', e => {
    b.ulang = e.target.value;
    if (!b.ulang){ b.kelompok = ''; }
    gambarKanan(); simpanNanti();
  });
  const selKel = box.querySelector('[data-bkelompok]');
  if (selKel) selKel.addEventListener('change', e => { b.kelompok = e.target.value; gambarKanan(); simpanNanti(); });
  const selNo = box.querySelector('[data-bnomor]');
  if (selNo) selNo.addEventListener('change', e => { b.nomor = e.target.value; simpanNanti(); });
  const cbNo = box.querySelector('[data-bnomorulang]');
  if (cbNo) cbNo.addEventListener('change', e => { b.nomorUlangKelompok = e.target.checked; simpanNanti(); });
  box.querySelector('[data-tambahpot]').addEventListener('click', () => {
    const n = rancangan.potongan.length + 1;
    const kode = 'potongan_' + n + '_' + Math.floor(Math.random()*90+10);
    rancangan.potongan.push({ kode, judul:'Potongan ' + n, grup:null, ulang:'', nomor:'tanpa',
      tulis:'baris', syarat:[], slot:[], teks:'' });
    b.potongan = b.potongan || [];
    b.potongan.push(kode);
    potAktif = kode; ujiNilai = {};
    gambarKanan(); simpanNanti();
  });
  box.querySelectorAll('.pot').forEach(el => el.addEventListener('click', () => {
    potAktif = el.dataset.kode; ujiNilai = {}; gambarKanan();
  }));

  /* editor potongan terpilih */
  const p = rancangan.potongan.find(x => x.kode === potAktif && b.potongan.includes(x.kode));
  const wadah = document.createElement('div');
  wadah.id = 'editor-satu';
  box.appendChild(wadah);
  if (p) gambarEditorPot(p, wadah);
  else wadah.innerHTML = '<div class="kosong-kanan"><div class="bulat">✎</div>Pilih potongan di atas untuk menyunting syarat dan redaksinya.</div>';
}

function daftarPotHtml(b){
  b.potongan = b.potongan || [];
  const lepas = b.potongan.filter(k => {
    const p = rancangan.potongan.find(x => x.kode === k);
    return p && !((rancangan.grup||[]).some(g => g.anggota.includes(k)));
  });
  let h = '<div style="margin-bottom:14px">';
  h += lepas.map(k => kartuPot(rancangan.potongan.find(x => x.kode === k))).join('');
  (rancangan.grup||[]).forEach(g => {
    const anggota = g.anggota.filter(k => b.potongan.includes(k));
    if (!anggota.length) return;
    h += '<div class="grup-pot"><p class="grup-kepala"><span class="tk">◆</span>' + esc(g.judul) +
      ' — pilih satu, menurut prioritas</p>' +
      anggota.map((k,i) => kartuPot(rancangan.potongan.find(x => x.kode === k), i+1)).join('') + '</div>';
  });
  return h + '</div>';
}

/* ---------- tab Variabel ---------- */
/* susunan tabel variabel: variabel biasa, lalu satu blok untuk tiap elemen berpaket */
function susunanVariabel(){
  const semua = semuaField();
  const baris = [];
  const dipakai = {};
  semua.forEach(x => {
    if (x.paket) return;
    baris.push({ jenis:'var', v:x });
    /* turunan terbilang menempel langsung di bawah induknya */
    semua.filter(y => !y.paket && y.dari === x.kode).forEach(y => {
      if (dipakai[y.kode]) return;
      dipakai[y.kode] = 1;
      baris.push({ jenis:'var', v:y, anak:true });
    });
  });
  /* buang turunan terbilang yang sudah ditempel */
  const bersih = [];
  const sudah = {};
  baris.forEach(b => {
    if (b.jenis === 'var'){
      if (sudah[b.v.kode]) return;
      if (!b.anak && b.v.dari && !b.v.paket) return;
      sudah[b.v.kode] = 1;
    }
    bersih.push(b);
  });
  /* blok paket, satu per elemen */
  const paket = {};
  semua.forEach(x => { if (x.paket) (paket[x.dari] = paket[x.dari] || { label:x.paket, tab:x.tab, isi:[] }).isi.push(x); });
  Object.keys(paket).forEach(k => {
    bersih.push({ jenis:'kepala', label:paket[k].label, kode:k, tab:paket[k].tab, jumlah:paket[k].isi.length });
    paket[k].isi.forEach(v => bersih.push({ jenis:'var', v, anak:true }));
  });
  return bersih;
}

function gambarPanelVariabel(){
  const f = semuaField();
  $('#isi-variabel').innerHTML = '<div class="isi-tab">' +
    '<p class="hampa" style="margin-bottom:12px">Seluruh variabel berasal dari Form Design. ' +
    'Menambah field di sana langsung menambah variabel di sini. Field bertipe Referensi user ' +
    'menghasilkan satu paket variabel sekaligus — baris yang menjorok adalah pecahannya.</p>' +
    '<div class="tabel-bungkus"><table class="tabel-var"><thead><tr>' +
    '<th>Variabel</th><th>Label</th><th>Lingkup</th><th>Tipe</th><th>Sumber pengisian</th>' +
    '</tr></thead><tbody>' +
    susunanVariabel().map(b => {
      if (b.jenis === 'kepala')
        return '<tr class="kepala-paket"><td colspan="5">' +
          '<span class="kp-nama">' + esc(b.label) + '</span>' +
          '<span class="kp-kode">{{' + esc(b.kode) + '}}</span>' +
          '<span class="kp-ket">' + esc(b.tab) + ' · ' + b.jumlah + ' variabel dari satu elemen</span></td></tr>';
      const x = b.v;
      return '<tr><td class="k' + (b.anak ? ' turun-var' : '') + '">{{' + esc(x.kode) + '}}</td>' +
        '<td>' + esc(x.label) + '</td>' +
        '<td>' + esc(x.tab) +
        (x.grup ? ' <span class="asal">› ' + esc(x.grup) + ' (berulang)</span>' : '') +
        (x.dari && !x.paket ? ' <span class="asal">dari {{' + esc(x.dari) + '}}</span>' : '') +
        '</td><td>' + esc(x.tipe) + '</td>' +
        '<td>' + esc((SUMBER.find(s => s[0] === x.sumber) || ['','—'])[1]) + '</td></tr>';
    }).join('') +
    '</tbody></table></div></div>';
}

/* ---------- tab Pengaturan Halaman ---------- */
function gambarPanelHalaman(){
  if (!rancangan.halaman) rancangan.halaman = JSON.parse(JSON.stringify(window.SEED.halaman));
  const h = rancangan.halaman;
  const baris = (kunci, label, tipe) =>
    '<div class="f"><label class="j">' + label + '</label>' +
    '<input type="text" data-h="' + kunci + '" value="' + esc(h[kunci] || '') + '"></div>';
  $('#isi-halaman').innerHTML = '<div class="isi-tab ed-badan">' +
    '<p class="hampa">Ukuran kertas, margin, dan font untuk dokumen ini.</p>' +
    '<div class="dua-kol">' + baris('kertas','Ukuran kertas') + baris('orientasi','Orientasi') + '</div>' +
    '<div class="dua-kol">' + baris('mAtas','Margin atas (cm)') + baris('mBawah','Margin bawah (cm)') + '</div>' +
    '<div class="dua-kol">' + baris('mKiri','Margin kiri (cm)') + baris('mKanan','Margin kanan (cm)') + '</div>' +
    '<div class="dua-kol">' + baris('font','Font') + baris('ukuran','Ukuran font (pt)') + '</div>' +
    baris('spasi','Spasi baris') +
    '<p class="hampa" style="margin-top:6px">Footer hanya muncul di PDF minuta &amp; salinan, bukan di pratinjau.</p>' +
    '<div class="dua-kol">' + baris('footerKiri','Footer kiri') + baris('footerTengah','Footer tengah') + '</div>' +
    baris('footerKanan','Footer kanan') +
    '<div class="f" style="margin-top:22px;border-top:1px solid var(--garis);padding-top:18px">' +
    '<label class="j">Variabel dokumen</label>' +
    '<p class="hampa" style="margin:0 0 10px">Variabel yang tidak berasal dari formulir order — ' +
    'identitas penanda tangan, nama kantor, penanggalan. Nilainya diatur di sini, jadi rancangan ini ' +
    'tidak terikat pada satu jenis dokumen.</p>' +
    '<div class="tabel-bungkus"><table class="tabel-vardok"><thead><tr>' +
    '<th>Variabel</th><th>Keterangan</th><th>Isi</th><th></th></tr></thead><tbody>' +
    (rancangan.varDokumen || []).map((v,i) =>
      '<tr><td><input type="text" class="kode" data-vd="kode" data-i="' + i + '" value="' + esc(v.kode) + '"></td>' +
      '<td><input type="text" data-vd="label" data-i="' + i + '" value="' + esc(v.label) + '"></td>' +
      '<td><select data-vd="otomatis" data-i="' + i + '">' +
        OTOMATIS_VAR.map(o => '<option value="' + o[0] + '"' + (v.otomatis === o[0] ? ' selected' : '') +
          '>' + o[1] + '</option>').join('') + '</select>' +
        (v.otomatis ? '' : '<input type="text" data-vd="nilai" data-i="' + i + '" value="' + esc(v.nilai) +
          '" style="margin-top:6px">') + '</td>' +
      '<td><button class="btn btn-kecil btn-bahaya" data-vd-hapus="' + i + '">×</button></td></tr>').join('') +
    '</tbody></table></div>' +
    '<button class="btn btn-kecil" data-vd-tambah style="margin-top:9px">+ Variabel dokumen</button></div>' +
    '</div>';
  $$('#isi-halaman [data-h]').forEach(el => el.addEventListener('input', e => {
    rancangan.halaman[el.dataset.h] = e.target.value; simpanNanti();
  }));
  $$('#isi-halaman [data-vd]').forEach(el => {
    const ev = el.tagName === 'SELECT' ? 'change' : 'input';
    el.addEventListener(ev, () => {
      const v = rancangan.varDokumen[+el.dataset.i];
      if (!v) return;
      v[el.dataset.vd] = el.value;
      if (el.dataset.vd === 'otomatis') gambarPanelHalaman();
      simpanNanti();
    });
  });
  $$('#isi-halaman [data-vd-hapus]').forEach(b => b.addEventListener('click', () => {
    rancangan.varDokumen.splice(+b.dataset.vdHapus, 1);
    gambarPanelHalaman(); simpanNanti();
  }));
  const tbhVd = $('#isi-halaman [data-vd-tambah]');
  if (tbhVd) tbhVd.addEventListener('click', () => {
    rancangan.varDokumen.push({ kode:'variabel_baru', label:'Variabel baru', nilai:'', otomatis:'' });
    gambarPanelHalaman(); simpanNanti();
  });
}

/* ---------- tab Pratinjau naskah ---------- */
function gambarPanelNaskah(){
  let h = '<div class="naskah">';
  (rancangan.bagian || []).forEach(b => {
    h += '<div class="jd">' + esc(b.judul) + (b.jenis === 'otomatis' ? ' · bagian otomatis' : '') + '</div>';
    if (b.jenis !== 'otomatis'){
      h += '<div class="bl">' + tandaiVar(b.teks || '—') + '</div>';
      return;
    }
    (b.potongan || []).forEach(k => {
      const p = rancangan.potongan.find(x => x.kode === k);
      if (!p) return;
      h += '<div class="bl"><small style="display:block;color:var(--tinta-samar);font-size:11px;margin-bottom:3px">' +
        esc(ringkasSyarat(p.syarat)) + '</small>' + tandaiVar(p.teks || '—') + '</div>';
    });
  });
  $('#isi-pratinjau').innerHTML = h + '</div>';
}

/* =====================================================================
   Rakit naskah — menyusun akta jadi dari isian layar Order
   ===================================================================== */
const BULAN_ID = BULAN;
function tglID(iso){
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return String(iso);
  return d.getDate() + ' ' + BULAN_ID[d.getMonth()] + ' ' + d.getFullYear();
}
function sapaanDari(u){
  if (!u) return '';
  if (u.jenis_kelamin === 'Perempuan'){
    if (u.status_kawin === 'Kawin' || u.status_kawin === 'Cerai Hidup') return 'Nyonya';
    if (u.status_kawin === 'Cerai Mati') return 'Nyonya Janda';
    return 'Nona';
  }
  return 'Tuan';
}
function userById(id){ return (window.USER_CONTOH || []).find(u => u.id === id) || null; }
function nilaiPaketOrang(u, k){
  if (!u) return '';
  if (k === 'tanggal_lahir')            return tglID(u.tanggal_lahir);
  if (k === 'tanggal_lahir_terbilang')  return terbilangTanggal(u.tanggal_lahir);
  if (k === 'sapaan')                   return sapaanDari(u);
  return u[k] == null ? '' : String(u[k]);
}
/* nilai satu variabel turunan terbilang, apa pun bentuk pilihannya */
function nilaiTerbilangVar(f, kodeVar, mentah){
  if (!mentah) return '';
  if (f.tipe === 'tanggal')
    return /_hari$/.test(kodeVar) ? namaHari(mentah) : terbilangTanggal(mentah);
  const bersih = String(mentah).replace(/[^0-9]/g, '');
  if (!bersih) return '';
  const st = satuanDari(f);
  return (terbilang(bersih) + (st ? ' ' + st : '')).trim();
}
/* konteks satu baris tab: nilai field + pecahan paket + turunan terbilang */
function konteksBaris(tab, row){
  const c = {};
  (tab.field || []).forEach(f => {
    if (TANPA_NILAI.includes(f.tipe) || !f.kode) return;
    if (f.tipe === 'kbli') return;                       /* ditangani sebagai lingkup berulang */
    const mentah = row[f.kode] == null ? '' : row[f.kode];
    if (f.tipe === 'user'){
      const u = userById(mentah);
      c[f.kode] = u ? u.nama : '';
      const aw = (f.awalan || '').trim();
      const pilih = Array.isArray(f.paket) ? f.paket : PAKET_SEMUA;
      PAKET_ORANG.forEach(x => {
        if (!pilih.includes(x[0])) return;
        c[(aw ? aw + '.' : '') + x[0]] = nilaiPaketOrang(u, x[0]);
      });
      return;
    }
    c[f.kode] = f.tipe === 'angka'   ? angkaBertitik(mentah)
              : f.tipe === 'tanggal' ? tglID(mentah)
              : String(mentah);
    pecahanTerbilang(f).forEach(x => { c[x.kode] = nilaiTerbilangVar(f, x.kode, mentah); });
  });
  return c;
}
/* Variabel yang tidak berasal dari formulir order — nilainya diatur di Pengaturan Dokumen,
   bukan ditanam di dalam kode, supaya rancangan ini bisa dipakai untuk dokumen apa pun. */
const OTOMATIS_VAR = [
  ['',         'Nilai tetap di bawah'],
  ['hari',     'Nama hari saat dokumen dibuat'],
  ['tanggal',  'Tanggal saat dokumen dibuat'],
  ['terbilang','Tanggal terbilang saat dokumen dibuat']
];
function konteksDokumen(){
  const d = new Date();
  const iso = d.toISOString().slice(0,10);
  const c = {};
  (rancangan.varDokumen || []).forEach(v => {
    if (!v.kode) return;
    c[v.kode] = v.otomatis === 'hari'      ? HARI[d.getDay()]
              : v.otomatis === 'tanggal'   ? tglID(iso)
              : v.otomatis === 'terbilang' ? terbilangTanggal(iso)
              : (v.nilai == null ? '' : String(v.nilai));
  });
  return c;
}
/* semua lingkup yang bisa dipakai sebuah potongan */
function konteksUntuk(p, global){
  if (!p.ulang) return [{ ctx: global, kunci: 'tunggal' }];
  return lingkupBaris(p.ulang, global);
}
function lingkupBaris(kodeLingkup, global){
  const tabLangsung = rancangan.tab.find(t => t.id === kodeLingkup);
  if (tabLangsung){
    return (barisPv[tabLangsung.id] || []).map((r, i) => ({
      ctx: Object.assign({}, global, konteksBaris(tabLangsung, r)),
      kunci: tabLangsung.id + ':' + i
    }));
  }
  /* grup berulang atau KBLI: cari elemen pemiliknya */
  let pemilik = null, tabPemilik = null;
  rancangan.tab.forEach(t => (t.field || []).forEach(f => {
    if ((f.tipe === 'ulang' || f.tipe === 'kbli') && f.kode === kodeLingkup){ pemilik = f; tabPemilik = t; }
  }));
  if (!pemilik) return [];

  const keluar = [];
  const barisLuar = tabPemilik.mode === 'daftar'
    ? (barisPv[tabPemilik.id] || [])
    : [nilaiForm[tabPemilik.id] || {}];
  barisLuar.forEach((luar, i) => {
    const ctxLuar = Object.assign({}, global, konteksBaris(tabPemilik, luar));
    const dalam = Array.isArray(luar[pemilik.kode]) ? luar[pemilik.kode] : [];
    dalam.forEach((d, j) => {
      let tambahan;
      if (pemilik.tipe === 'kbli'){
        tambahan = {};
        tambahan[pemilik.kode + '_kode']     = d.kode || '';
        tambahan[pemilik.kode + '_judul']    = d.judul || '';
        tambahan[pemilik.kode + '_golongan'] = d.golongan || '';
      } else {
        const semu = { field: (tabPemilik.field || []).filter(x => {
          const g = grupUlangDari(tabPemilik, x);
          return g && g.id === pemilik.id;
        }) };
        tambahan = konteksBaris(semu, d);
      }
      keluar.push({ ctx: Object.assign({}, ctxLuar, tambahan), kunci: tabPemilik.id + ':' + i + ':' + j });
    });
  });
  return keluar;
}
const ROMAWI = ['','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV'];
function nomorTulis(gaya, n){
  if (gaya === 'angka')  return n + '.';
  if (gaya === 'romawi') return (ROMAWI[n] || n) + '.';
  if (gaya === 'huruf')  return String.fromCharCode(96 + n) + '.';
  return '';
}
function gantiVar(html, ctx){
  return String(html || '').replace(/\{\{([^}]+)\}\}/g, (m, k) => {
    const kunci = k.trim();
    const v = ctx[kunci];
    if (v == null || v === '') return '<span class="rk-hampa" title="' + esc(kunci) + ' belum terisi">⟨' +
      esc(kunci) + '⟩</span>';
    return esc(v);
  });
}
function rakitTeks(p, ctx){
  let bagian = [{ t: p.teks, slot: null }];
  (p.slot || []).forEach(sl => {
    const baru = [];
    bagian.forEach(b => {
      if (b.slot){ baru.push(b); return; }
      String(b.t || '').split('[[slot:' + sl.kode + ']]').forEach((x, i) => {
        if (i) baru.push({ t: null, slot: sl });
        baru.push({ t: x, slot: null });
      });
    });
    bagian = baru;
  });
  return bagian.map(b => b.slot
    ? (lolosSyarat(b.slot.syarat, ctx) ? gantiVar(b.slot.teks, ctx) : '')
    : gantiVar(b.t, ctx)).join('');
}
function itemRk(no, teks, kelas){
  return '<div class="rk-item' + (kelas ? ' ' + kelas : '') + '">' +
    (no ? '<span class="rk-no">' + no + '</span>' : '<span class="rk-no"></span>') +
    '<div class="rk-teks">' + teks + '</div></div>';
}
function grupDariPot(p){
  return (rancangan.grup || []).find(g => (g.anggota || []).includes(p.kode)) || null;
}
/* bagian tanpa perulangan sendiri: tiap potongan berputar menurut setelannya masing-masing */
function rakitBagianBebas(b, global, menang){
  let html = '', jumlah = 0, hampa = 0;
  (b.potongan || []).forEach(kode => {
    const p = (rancangan.potongan || []).find(x => x.kode === kode);
    if (!p) return;
    const grup = grupDariPot(p);
    let n = 0;
    konteksUntuk(p, global).forEach(({ ctx, kunci }) => {
      if (grup){
        menang[grup.kode] = menang[grup.kode] || {};
        if (menang[grup.kode][kunci]) return;
      }
      if (!lolosSyarat(p.syarat, ctx)) return;
      if (grup) menang[grup.kode][kunci] = p.kode;
      n++; jumlah++;
      const teks = rakitTeks(p, ctx);
      hampa += (teks.match(/rk-hampa/g) || []).length;
      html += itemRk(nomorTulis(p.nomor, n), teks);
    });
  });
  return { html, jumlah, hampa };
}
/* bagian yang berputar sendiri: seluruh potongan ikut satu putaran, boleh dikelompokkan */
function rakitBagianBerulang(b, global, menang){
  const baris = lingkupBaris(b.ulang, global);
  const kelompok = [];
  const peta = {};
  baris.forEach(r => {
    const k = b.kelompok ? String(r.ctx[b.kelompok] == null ? '' : r.ctx[b.kelompok]) : '__semua__';
    if (!peta[k]){ peta[k] = { kunci:k, baris:[] }; kelompok.push(peta[k]); }
    peta[k].baris.push(r);
  });

  const pot = (b.potongan || []).map(k => (rancangan.potongan || []).find(x => x.kode === k)).filter(Boolean);
  const perBaris = pot.filter(p => (p.tulis || 'baris') === 'baris');
  const diAwal   = pot.filter(p => p.tulis === 'awalKelompok');
  const diAkhir  = pot.filter(p => p.tulis === 'akhirKelompok');
  const sekali   = pot.filter(p => p.tulis === 'sekali');

  let html = '', jumlah = 0, hampa = 0, n = 0;
  const tulis = (p, ctx, kelas) => {
    if (!lolosSyarat(p.syarat, ctx)) return '';
    jumlah++;
    const t = rakitTeks(p, ctx);
    hampa += (t.match(/rk-hampa/g) || []).length;
    return itemRk('', t, kelas);
  };

  sekali.forEach(p => { html += tulis(p, global); });

  kelompok.forEach(g => {
    if (b.nomorUlangKelompok) n = 0;
    const ctxAwal  = g.baris[0].ctx;
    const ctxAkhir = g.baris[g.baris.length - 1].ctx;
    diAwal.forEach(p => { html += tulis(p, ctxAwal, 'rk-kepala-kel'); });

    g.baris.forEach(r => {
      let teks = '';
      perBaris.forEach(p => {
        const grup = grupDariPot(p);
        if (grup){
          menang[grup.kode] = menang[grup.kode] || {};
          if (menang[grup.kode][r.kunci]) return;
        }
        /* Potongan boleh punya perulangan bersarang di dalam baris ini. Lingkup yang sama
           dengan induknya bukan sarang — itu berarti ikut baris induk. */
        const bersarang = p.ulang && p.ulang !== b.ulang;
        const sub = bersarang
          ? lingkupBaris(p.ulang, global).filter(x => x.kunci.indexOf(r.kunci + ':') === 0)
          : [{ ctx: r.ctx, kunci: r.kunci }];
        sub.forEach(sx => {
          if (!lolosSyarat(p.syarat, sx.ctx)) return;
          if (grup) menang[grup.kode][r.kunci] = p.kode;
          jumlah++;
          const t = rakitTeks(p, sx.ctx);
          hampa += (t.match(/rk-hampa/g) || []).length;
          teks += t;
        });
      });
      if (teks.replace(/<[^>]*>/g, '').trim()){
        n++;
        html += itemRk(nomorTulis(b.nomor, n), teks);
      }
    });

    diAkhir.forEach(p => { html += tulis(p, ctxAkhir, 'rk-tutup-kel'); });
  });
  return { html, jumlah, hampa };
}

function rakitAkta(){
  const global = Object.assign({}, konteksDokumen());
  rancangan.tab.forEach(t => {
    if (t.mode === 'formulir') Object.assign(global, konteksBaris(t, nilaiForm[t.id] || {}));
  });

  const menang = {};
  let html = '', jumlahPotongan = 0, jumlahHampa = 0;

  (rancangan.bagian || []).forEach(b => {
    if (b.jenis !== 'otomatis'){
      html += '<div class="rk-bagian"><div class="rk-judul">' + esc(b.judul) + '</div>' +
        '<div class="rk-teks">' + gantiVar(b.teks || '', global) + '</div></div>';
      return;
    }
    const hasilBagian = b.ulang
      ? rakitBagianBerulang(b, global, menang)
      : rakitBagianBebas(b, global, menang);
    const isi = hasilBagian.html;
    jumlahPotongan += hasilBagian.jumlah;
    jumlahHampa += hasilBagian.hampa;
    html += '<div class="rk-bagian oto">' + (isi ||
      '<div class="rk-lewat">Seluruh potongan pada bagian “' + esc(b.judul) +
      '” tidak memenuhi syarat, jadi bagian ini kosong.</div>') + '</div>';
  });

  return { html, jumlahPotongan, jumlahHampa };
}
function bukaRakit(){
  const hasil = rakitAkta();
  const jumlahBaris = rancangan.tab.map(t => t.mode === 'daftar'
    ? t.nama + ' ' + ((barisPv[t.id] || []).length) : null).filter(Boolean).join(' · ');
  $('#rk-sub').textContent = jumlahBaris || 'Belum ada baris yang diisi';
  $('#rk-isi').innerHTML = '<div class="rk-kertas">' + hasil.html + '</div>';
  $('#rk-catatan').innerHTML = hasil.jumlahPotongan + ' potongan tertulis' +
    (hasil.jumlahHampa ? ' · <b>' + hasil.jumlahHampa + '</b> variabel belum terisi (ditandai ⟨…⟩)' : '');
  $('#tirai-rakit').hidden = false;
}
$('#btn-rakit').addEventListener('click', bukaRakit);
$$('[data-tutup-rakit]').forEach(b => b.addEventListener('click', () => { $('#tirai-rakit').hidden = true; }));
$('#tirai-rakit').addEventListener('mousedown', e => {
  if (e.target === $('#tirai-rakit')) $('#tirai-rakit').hidden = true;
});

/* =====================================================================
   Ekspor rancangan ke Word — ringkasan yang dibaca orang
   ===================================================================== */
function tanpaTag(html){
  const d = document.createElement('div');
  d.innerHTML = String(html || '');
  d.querySelectorAll('p,div,li,tr,br,h1,h2,h3').forEach(el => el.insertAdjacentText('afterend', '\n'));
  return (d.textContent || '').replace(/\n{3,}/g, '\n\n').replace(/[ \t]+\n/g, '\n').trim();
}
function namaLingkup(kode){
  if (!kode) return '';
  const t = rancangan.tab.find(x => x.id === kode);
  if (t) return 'Tiap baris ' + t.nama;
  const g = semuaGrupUlang().find(x => x.kode === kode);
  return g ? 'Tiap baris ' + g.label + ' (' + g.tab + ')' : kode;
}
function spekRancangan(){
  const field = semuaField();
  const d = new Date();
  const tgl = tglID(d.toISOString().slice(0,10));

  const tab = rancangan.tab.map(t => {
    const catatan = [];
    (t.field || []).forEach(f => {
      if (f.tipe === 'seksi')
        catatan.push('Bagian lipat “' + (f.label || '') + '” melipat field di bawahnya' +
          (f.tertutup ? ', tertutup saat order dibuka.' : '.'));
      if (f.tipe === 'ulang')
        catatan.push('Grup berulang “' + (f.label || '') + '” (' + (f.kode || '—') +
          ') — field di bawahnya terisi sekali untuk tiap baris.');
      if (f.tipe === 'kbli')
        catatan.push('Elemen pencarian “' + (f.label || '') + '” menarik daftarnya dari basis data ' +
          (f.sumber || 'KBLI') + '.');
      if (f.tipe === 'user')
        catatan.push('Elemen “' + (f.label || '') + '” menghasilkan ' + pecahanUser(f).length +
          ' variabel identitas sekaligus.');
    });
    return {
      nama: t.nama,
      mode: t.mode === 'daftar' ? 'Daftar + modal tambah' : 'Formulir tunggal',
      catatan,
      field: (t.field || []).map(f => ({
        label: f.label || '(tanpa label)',
        kode: f.kode || '',
        tipe: (ELEMEN.find(e => e.tipe === f.tipe) || {}).nama || f.tipe,
        lebar: (LEBAR.find(l => l[0] === (f.lebar || 'penuh')) || ['','Penuh'])[1],
        sumber: TANPA_NILAI.includes(f.tipe) ? '—'
                : (SUMBER.find(sm => sm[0] === f.sumber) || ['','—'])[1],
        wajib: !!f.wajib,
        syarat: ringkasSyarat(f.tampilBila)
      }))
    };
  });

  const bagian = (rancangan.bagian || []).map(b => {
    if (b.jenis !== 'otomatis')
      return { judul: b.judul, jenis: b.jenis === 'pasal' ? 'Pasal' : 'Catatan',
               otomatis: false, teks: tanpaTag(b.teks), potongan: [] };
    return {
      judul: b.judul, jenis: 'Bagian Otomatis', otomatis: true,
      ulang: namaLingkup(b.ulang),
      kelompok: b.kelompok ? labelKode(b.kelompok) : '',
      nomor: b.nomor === 'angka' ? '1. 2. 3.' : b.nomor === 'romawi' ? 'I. II. III.'
            : b.nomor === 'huruf' ? 'a. b. c.' : '',
      nomorUlangKelompok: !!b.nomorUlangKelompok,
      potongan: (b.potongan || []).map(k => {
        const p = (rancangan.potongan || []).find(x => x.kode === k);
        if (!p) return null;
        const grup = (rancangan.grup || []).find(g => (g.anggota || []).includes(p.kode));
        return {
          judul: p.judul, kode: p.kode,
          syarat: ringkasSyarat(p.syarat),
          tulis: { baris:'Tiap baris', awalKelompok:'Sekali di awal kelompok',
                   akhirKelompok:'Sekali di akhir kelompok', sekali:'Sekali saja' }[p.tulis || 'baris'],
          ulang: namaLingkup(p.ulang),
          nomor: p.nomor === 'angka' ? '1. 2. 3.' : p.nomor === 'romawi' ? 'I. II. III.'
                : p.nomor === 'huruf' ? 'a. b. c.' : '',
          grup: grup ? grup.judul + ' — prioritas ' + (grup.anggota.indexOf(p.kode) + 1) +
                       ' dari ' + grup.anggota.length : '',
          teks: tanpaTag(p.teks),
          slot: (p.slot || []).map(sl => ({
            kode: sl.kode, label: sl.label,
            syarat: ringkasSyarat(sl.syarat), teks: tanpaTag(sl.teks)
          }))
        };
      }).filter(Boolean)
    };
  });

  const h = rancangan.halaman || {};
  return {
    produk: 'ENGINE',
    subjudul: 'Dokumen bacaan yang dihasilkan dari rancangan',
    tanggal: tgl,
    ringkas: [
      ['Tanggal dokumen', tgl],
      ['Jumlah tab', rancangan.tab.length],
      ['Jumlah elemen', rancangan.tab.reduce((a,t) => a + (t.field || []).length, 0)],
      ['Jumlah variabel', field.length],
      ['Jumlah bagian', (rancangan.bagian || []).length],
      ['Jumlah potongan', (rancangan.potongan || []).length],
      ['Grup pilih-satu', (rancangan.grup || []).length]
    ],
    tab,
    variabel: field.map(v => ({
      kode: v.kode, label: v.label,
      lingkup: v.tab + (v.grup ? ' › ' + v.grup + ' (berulang)' : ''),
      sumber: (SUMBER.find(sm => sm[0] === v.sumber) || ['','—'])[1]
    })),
    varDokumen: (rancangan.varDokumen || []).map(v => ({
      kode: v.kode, label: v.label,
      isi: v.otomatis ? (OTOMATIS_VAR.find(o => o[0] === v.otomatis) || ['',''])[1] : (v.nilai || '—')
    })),
    bagian,
    halaman: [
      ['Ukuran kertas', h.kertas], ['Orientasi', h.orientasi],
      ['Margin atas (cm)', h.mAtas], ['Margin bawah (cm)', h.mBawah],
      ['Margin kiri (cm)', h.mKiri], ['Margin kanan (cm)', h.mKanan],
      ['Font', h.font], ['Ukuran font (pt)', h.ukuran], ['Spasi baris', h.spasi],
      ['Footer kiri', h.footerKiri], ['Footer tengah', h.footerTengah], ['Footer kanan', h.footerKanan]
    ]
  };
}
async function eksporDocx(){
  if (!api.eksporDocx){
    $('#status').textContent = 'ekspor Word hanya tersedia di aplikasi';
    return;
  }
  $('#status').textContent = 'menyusun dokumen…';
  try {
    const hasil = await api.eksporDocx(spekRancangan());
    $('#status').textContent = hasil ? 'diekspor ke ' + hasil : 'ekspor dibatalkan';
  } catch (e) {
    $('#status').textContent = 'ekspor Word gagal: ' + (e && e.message ? e.message : e);
  }
}
if ($('#btn-ekspor-docx')) $('#btn-ekspor-docx').addEventListener('click', eksporDocx);

/* =====================================================================
   Impor / ekspor template saja — formulir order tidak ikut tersentuh
   ===================================================================== */
function bagianTemplate(r){
  return {
    jenis: 'template-engine',
    bagian: r.bagian || [],
    potongan: r.potongan || [],
    grup: r.grup || [],
    varDokumen: r.varDokumen || [],
    halaman: r.halaman || null
  };
}
function terapkanTemplate(d){
  if (!d || (!Array.isArray(d.bagian) && !Array.isArray(d.potongan))) return false;
  if (Array.isArray(d.bagian))     rancangan.bagian     = JSON.parse(JSON.stringify(d.bagian));
  if (Array.isArray(d.potongan))   rancangan.potongan   = JSON.parse(JSON.stringify(d.potongan));
  if (Array.isArray(d.grup))       rancangan.grup       = JSON.parse(JSON.stringify(d.grup));
  if (Array.isArray(d.varDokumen) && d.varDokumen.length)
    rancangan.varDokumen = JSON.parse(JSON.stringify(d.varDokumen));
  if (d.halaman && typeof d.halaman === 'object')
    rancangan.halaman = Object.assign({}, rancangan.halaman, d.halaman);
  rancangan = pastikanBentuk(rancangan);
  bagianAktif = null; potAktif = null; ujiNilai = {};
  gambarSemua(); gambarDaftarBagian(); gambarKanan(); simpanNanti();
  return true;
}
/* berapa variabel di template yang belum ada di formulir */
function periksaVarTemplate(){
  const sah = semuaField().map(f => f.kode)
    .concat((rancangan.varDokumen || []).map(v => v.kode).filter(Boolean));
  const asing = {};
  const kumpul = (nama, teks) => {
    [...new Set((String(teks || '').match(/\{\{[^}]+\}\}/g) || []).map(v => v.slice(2,-2).trim()))]
      .filter(v => !sah.includes(v)).forEach(v => { asing[v] = asing[v] || []; if (!asing[v].includes(nama)) asing[v].push(nama); });
  };
  (rancangan.bagian || []).forEach(b => { if (b.jenis !== 'otomatis') kumpul(b.judul, b.teks); });
  (rancangan.potongan || []).forEach(p => {
    kumpul(p.judul, p.teks);
    (p.slot || []).forEach(sl => kumpul(p.judul + ' › ' + sl.kode, sl.teks));
  });
  return asing;
}
async function imporTemplate(){
  if (!api.impor){ $('#status').textContent = 'impor hanya tersedia di aplikasi'; return; }
  const d = await api.impor();
  if (!d) return;
  if (!terapkanTemplate(d)){
    $('#status').textContent = 'berkas itu bukan template — tidak ada bagian atau potongan di dalamnya';
    return;
  }
  const asing = periksaVarTemplate();
  const n = Object.keys(asing).length;
  const pesan = n
    ? 'template dimuat · ' + n + ' variabel belum ada di formulir'
    : 'template dimuat — seluruh variabelnya dikenali';
  /* penyimpanan otomatis menulis statusnya sendiri, jadi pesan ini ditaruh sesudahnya */
  setTimeout(() => { $('#status').textContent = pesan; }, 700);
  if (n) window.alert('Template dimuat. ' + n + ' variabel berikut belum ada di Form Design:\n\n' +
    Object.keys(asing).map(k => '{{' + k + '}}  — dipakai di ' + asing[k].join(', ')).join('\n'));
}
async function eksporTemplate(){
  if (!api.ekspor){ $('#status').textContent = 'ekspor hanya tersedia di aplikasi'; return; }
  const hasil = await api.ekspor(bagianTemplate(rancangan));
  if (hasil) $('#status').textContent = 'template diekspor ke ' + hasil;
}
if ($('#btn-impor-template')) $('#btn-impor-template').addEventListener('click', imporTemplate);
if ($('#btn-ekspor-template')) $('#btn-ekspor-template').addEventListener('click', eksporTemplate);

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
  { tipe:'kbli',      nama:'Pencarian KBLI',  ik:'⌕' },
  { tipe:'tutup',     nama:'Akhir grup',      ik:'⊣' }
];
/* elemen yang tidak menghasilkan nilai sendiri */
const TANPA_NILAI = ['judul','seksi','ulang','kbli','tutup'];
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
  sinkronAktif();
  clearTimeout(jedaSimpan);
  $('#status').textContent = 'menyimpan…';
  jedaSimpan = setTimeout(async () => {
    await api.simpan(rancangan);
    const w = new Date().toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit', second:'2-digit'});
    $('#status').textContent = 'tersimpan ' + w;
  }, 400);
}

/* melengkapi rancangan lama supaya berkas tersimpan versi sebelumnya tetap terbuka */
/* =====================================================================
   Variabel global bawaan — tidak berasal dari formulir order sama sekali.
   Kelompok 'waktu' diatur di Pengaturan Dokumen, kelompok 'kantor' di layar
   Profil Kantor. Keduanya selalu ada; kodenya tidak bisa diubah atau dihapus.
   ===================================================================== */
const VAR_BAWAAN = [
  /* kode, label, otomatis, nilai bawaan, kelompok, dari */
  ['var_hari',             'Nama hari penandatanganan',       'hari',             '', 'waktu', ''],
  ['var_tanggal',          'Tanggal penandatanganan',         'tanggal',          '', 'waktu', ''],
  ['var_terbilang_tanggal','Tanggal penandatanganan terbilang','terbilang',       '', 'waktu', ''],
  ['var_pukul',            'Pukul penandatanganan',           'pukul',            '', 'waktu', ''],
  ['var_terbilang_pukul',  'Pukul penandatanganan terbilang', 'terbilangPukul',   '', 'waktu', ''],
  ['deed_number',          'Nomor dokumen',                   '',                 '', 'waktu', ''],

  ['kantor_label',            'Label kartu kantor',          '',                 'Kantor Notaris & PPAT',     'kantor', ''],
  ['notaris_nama',            'Nama NOTARIS (tanpa gelar)',  '',                 'Mochammad Raafi Dwi Nugraha','kantor', ''],
  ['notaris_gelar',           'Gelar disingkat',             '',                 'S.Tr.Kom.',                 'kantor', ''],
  ['notaris_gelar_panjang',   'Gelar tidak disingkat',       '',                 'Sarjana Terapan Komputer',  'kantor', ''],
  ['notaris_nama_gelar',      'Nama + gelar disingkat',      'namaGelar',        '', 'kantor', ''],
  ['notaris_nama_gelar_panjang','Nama + gelar tidak disingkat','namaGelarPanjang','', 'kantor', ''],
  ['notaris_sk_nomor',        'Nomor SK Pengangkatan',       '',                 '112/KEP-17.3/PPAT/XI/2021', 'kantor', ''],
  ['notaris_sk_tanggal',      'Tanggal SK Pengangkatan',     'tanggalNilai',     '2021-11-08',                'kantor', ''],
  ['notaris_sk_tanggal_terbilang','Tanggal SK terbilang',    'terbilangDari',    '', 'kantor', 'notaris_sk_tanggal'],
  ['notaris_wilayah',         'Wilayah kerja',               '',                 'Kota Bandung',              'kantor', ''],
  ['notaris_telepon',         'Telepon kantor',              '',                 '(022) 86012345',            'kantor', ''],
  ['notaris_email',           'Email kantor',                '',                 'kantor@notaris.id',         'kantor', ''],
  ['notaris_alamat',          'Alamat kantor',               '',                 'Jl. Ir. H. Juanda No. 128', 'kantor', '']
];
const kelompokBawaan = k => { const b = VAR_BAWAAN.find(x => x[0] === k); return b ? b[4] : ''; };

/* =====================================================================
   Peran pengguna. Super Admin menyusun struktur dan syaratnya; PPAT dan
   Asisten hanya menambah Pasal & Catatan dan menyunting tulisan — bagian
   otomatis beserta syaratnya terkunci bagi mereka.
   ===================================================================== */
const PERAN = [
  ['super',   'Admin Default',  'SUPER ADMIN', 'A'],
  ['ppat',    'Notaris / PPAT', 'PPAT',        'P'],
  ['asisten', 'Asisten',        'ASISTEN',     'S']
];
const peranSah = k => PERAN.some(x => x[0] === k) ? k : 'super';
/* true bila peran ini boleh menyusun struktur, syarat, dan bagian otomatis */
const penuh = () => (rancangan && rancangan.peran ? rancangan.peran : 'super') === 'super';

/* =====================================================================
   Layanan, Form Design, dan Template
   --------------------------------------------------------------------
   Satu layanan (jenis akta) memiliki SATU rancangan formulir order dan
   BEBERAPA template naskah. Order memilih salah satu templatenya; bila
   tidak memilih, dipakai template bawaan layanan itu.

   Supaya seluruh kode lama tetap berjalan, rancangan.tab dan
   rancangan.bagian/potongan/grup/halaman adalah rujukan langsung ke
   layanan dan template yang sedang dimuat — bukan salinan. sinkronAktif()
   mengembalikan rujukan itu bila ada kode yang menggantinya utuh
   (misalnya array.filter), dan dijalankan tiap kali rancangan disimpan.
   ===================================================================== */
let termuatLayanan = null, termuatTemplate = null;

const layananIni   = () => (rancangan.layanan  || []).find(x => x.id === rancangan.layananAktif)  || null;
const templateIni  = () => (rancangan.template || []).find(x => x.id === rancangan.templateAktif) || null;
const templateById = id => (rancangan.template || []).find(x => x.id === id) || null;
/* Satu layanan hanya boleh punya SATU template. templateLayanan tetap
   mengembalikan daftar supaya sisa kode aman, tetapi isinya paling banyak satu. */
const templateLayanan = idL => (rancangan.template || []).filter(x => x.layanan === idL);
const templateDari = idL => templateLayanan(idL)[0] || null;
const tplTerkunci = () => { const t = templateIni(); return !!t && t.milik === 'platform'; };

function sinkronAktif(){
  sinkronOrder();
  const L = (rancangan.layanan  || []).find(x => x.id === termuatLayanan);
  if (L && rancangan.tab) L.tab = rancangan.tab;
  const T = (rancangan.template || []).find(x => x.id === termuatTemplate);
  if (T){
    T.isi = T.isi || {};
    if (rancangan.bagian)   T.isi.bagian   = rancangan.bagian;
    if (rancangan.potongan) T.isi.potongan = rancangan.potongan;
    if (rancangan.grup)     T.isi.grup     = rancangan.grup;
    if (rancangan.halaman)  T.isi.halaman  = rancangan.halaman;
    if (rancangan.skenario) T.isi.skenario = rancangan.skenario;
  }
}
/* arahkan rancangan.tab ke formulir sebuah layanan */
function pakaiLayanan(id){
  sinkronAktif();
  const L = (rancangan.layanan || []).find(x => x.id === id) || (rancangan.layanan || [])[0];
  if (!L) return;
  rancangan.layananAktif = L.id;
  if (!Array.isArray(L.tab)) L.tab = [];
  rancangan.tab = L.tab;
  termuatLayanan = L.id;
  if (tabAktif >= rancangan.tab.length) tabAktif = 0;
}
/* arahkan bagian/potongan/grup/halaman ke isi sebuah template */
function pakaiTemplate(id){
  sinkronAktif();
  const T = (rancangan.template || []).find(x => x.id === id) || (rancangan.template || [])[0];
  if (!T) return;
  rancangan.templateAktif = T.id;
  T.isi = T.isi || {};
  T.isi.bagian   = Array.isArray(T.isi.bagian)   ? T.isi.bagian   : [];
  T.isi.potongan = Array.isArray(T.isi.potongan) ? T.isi.potongan : [];
  T.isi.grup     = Array.isArray(T.isi.grup)     ? T.isi.grup     : [];
  T.isi.halaman  = (T.isi.halaman && typeof T.isi.halaman === 'object') ? T.isi.halaman : {};
  T.isi.skenario = Array.isArray(T.isi.skenario) ? T.isi.skenario : [];
  rancangan.bagian   = T.isi.bagian;
  rancangan.potongan = T.isi.potongan;
  rancangan.grup     = T.isi.grup;
  rancangan.halaman  = T.isi.halaman;
  rancangan.skenario = T.isi.skenario;
  termuatTemplate = T.id;
  if (T.layanan && T.layanan !== rancangan.layananAktif) pakaiLayanan(T.layanan);
  bagianAktif = null; potAktif = null; mnBagian = null;
}
/* ---------- order ----------
   Tiap order melekat pada satu layanan: formulirnya dari layanan itu, naskahnya
   dari template pilihannya. Isian order disimpan di dalam ordernya sendiri, jadi
   berpindah order tidak menghapus isian order lain. */
let termuatOrder = null;
const orderIni  = () => (rancangan.order || []).find(o => o.id === rancangan.orderAktif) || null;
const orderLayanan = idL => (rancangan.order || []).filter(o => o.layanan === idL);

function sinkronOrder(){
  const O = (rancangan.order || []).find(o => o.id === termuatOrder);
  if (!O) return;
  O.baris = barisPv;
  O.form  = nilaiForm;
}
function pakaiOrder(id){
  sinkronOrder();
  const O = (rancangan.order || []).find(o => o.id === id) || (rancangan.order || [])[0];
  if (!O) return;
  rancangan.orderAktif = O.id;
  O.baris = (O.baris && typeof O.baris === 'object') ? O.baris : {};
  O.form  = (O.form  && typeof O.form  === 'object') ? O.form  : {};
  barisPv  = O.baris;
  nilaiForm = O.form;
  termuatOrder = O.id;
  if (O.layanan && O.layanan !== rancangan.layananAktif) pakaiLayanan(O.layanan);
  pvTab = 0;
}
/* template yang dipakai order aktif: pilihannya sendiri, atau bawaan layanannya */
function templateOrder(){
  const O = orderIni();
  return templateDari(O ? O.layanan : rancangan.layananAktif);
}

/* pembersihan isi satu template — dipakai pastikanBentuk untuk tiap template */
function rapikanIsiTemplate(isi, tab){
  (isi.potongan || []).forEach(p => {
    p.slot   = Array.isArray(p.slot)   ? p.slot   : [];
    p.syarat = rapikanSyarat(p.syarat);
    p.slot.forEach(sl => { sl.syarat = rapikanSyarat(sl.syarat); });
    if (typeof p.tulis !== 'string') p.tulis = 'baris';
    if (typeof p.teks  !== 'string') p.teks  = '';
    p.teks = naskahKeHtml(p.teks);
    p.slot.forEach(sl => { sl.teks = naskahKeHtml(sl.teks || '', true); });
  });
  (isi.grup || []).forEach(g => { if (!Array.isArray(g.anggota)) g.anggota = []; });
  (isi.bagian || []).forEach(b => {
    if (b.jenis === 'otomatis'){
      if (!Array.isArray(b.potongan)) b.potongan = [];
      if (typeof b.ulang    !== 'string') b.ulang = '';
      if (typeof b.kelompok !== 'string') b.kelompok = '';
      if (typeof b.nomor    !== 'string') b.nomor = 'tanpa';
      b.nomorUlangKelompok = !!b.nomorUlangKelompok;
    } else b.teks = naskahKeHtml(typeof b.teks === 'string' ? b.teks : '');
  });
  const sah = (isi.potongan || []).map(p => p.kode);
  (isi.bagian || []).forEach(b => { if (b.potongan) b.potongan = b.potongan.filter(k => sah.includes(k)); });
  (isi.grup   || []).forEach(g => { g.anggota = g.anggota.filter(k => sah.includes(k)); });
}

function pastikanBentuk(r){
  const S = window.SEED;
  if (!r || typeof r !== 'object') r = {};
  if (!Array.isArray(r.tab) || !r.tab.length) r.tab = JSON.parse(JSON.stringify(S.tab));
  if (!Array.isArray(r.potongan)) r.potongan = JSON.parse(JSON.stringify(S.potongan));
  if (!Array.isArray(r.grup))     r.grup     = JSON.parse(JSON.stringify(S.grup));
  if (!Array.isArray(r.bagian) || !r.bagian.length) r.bagian = JSON.parse(JSON.stringify(S.bagian));
  if (!r.halaman || typeof r.halaman !== 'object') r.halaman = JSON.parse(JSON.stringify(S.halaman));
  r.peran = peranSah(r.peran);
  /* Pustaka Kondisi milik platform — dipakai bersama semua layanan & template */
  if (!Array.isArray(r.pustaka))
    r.pustaka = JSON.parse(JSON.stringify((S.pustaka || [])));
  r.pustaka.forEach(k => {
    if (!k.kode) k.kode = 'KND_' + Math.random().toString(36).slice(2,6).toUpperCase();
    if (typeof k.label !== 'string') k.label = k.kode;
    k.syarat = rapikanSyarat(k.syarat);
  });

  /* --- naikkan rancangan lama ke bentuk layanan + template --- */
  if (!Array.isArray(r.layanan) || !r.layanan.length){
    r.layanan = [{ id:'lyn_ajb', kode:'AJB', nama:'Akta Jual Beli', tab:r.tab, templateBawaan:'tpl_ajb' }];
    r.layananAktif = 'lyn_ajb';
  }
  if (!Array.isArray(r.template) || !r.template.length){
    r.template = [
      { id:'tpl_ajb', kode:'AJB', nama:'AJB Standar', layanan:'lyn_ajb', milik:'kantor',
        isi:{ bagian:r.bagian, potongan:r.potongan, grup:r.grup, halaman:r.halaman } }
    ];
    r.templateAktif = 'tpl_ajb';
  }
  r.layanan.forEach(L => {
    if (!L.id) L.id = 'lyn_' + Math.random().toString(36).slice(2,8);
    if (!Array.isArray(L.tab)) L.tab = [];
    if (typeof L.kode !== 'string') L.kode = '';
    if (typeof L.nama !== 'string') L.nama = L.kode || 'Layanan';
  });
  r.template.forEach(T => {
    if (!T.id) T.id = 'tpl_' + Math.random().toString(36).slice(2,8);
    if (typeof T.kode !== 'string') T.kode = '';
    if (typeof T.nama !== 'string') T.nama = T.kode || 'Template';
    if (T.milik !== 'platform') T.milik = 'kantor';
    if (!T.layanan || !r.layanan.some(L => L.id === T.layanan)) T.layanan = r.layanan[0].id;
    T.isi = T.isi || {};
    ['bagian','potongan','grup'].forEach(k => { if (!Array.isArray(T.isi[k])) T.isi[k] = []; });
    if (!T.isi.halaman || typeof T.isi.halaman !== 'object')
      T.isi.halaman = JSON.parse(JSON.stringify(S.halaman));
  });
  /* satu layanan satu template: template berlebih dilepas, layanan tanpa template diberi satu */
  r.layanan.forEach(L => {
    const milik = r.template.filter(T => T.layanan === L.id);
    if (milik.length > 1){
      const simpan = milik.find(T => T.id === L.templateBawaan) ||
                     milik.find(T => T.milik === 'kantor') || milik[0];
      milik.forEach(T => { if (T !== simpan) r.template.splice(r.template.indexOf(T), 1); });
    }
    if (!r.template.some(T => T.layanan === L.id)){
      r.template.push({ id:'tpl_' + Math.random().toString(36).slice(2,8), kode:L.kode || 'TPL',
        nama:'Template ' + (L.nama || L.kode), layanan:L.id, milik:'kantor',
        isi:{ bagian:[], potongan:[], grup:[], halaman:JSON.parse(JSON.stringify(S.halaman)) } });
    }
    L.templateBawaan = (r.template.find(T => T.layanan === L.id) || {}).id || '';
  });
  if (!r.layanan.some(L => L.id === r.layananAktif))   r.layananAktif  = r.layanan[0].id;
  if (!r.template.some(T => T.id === r.templateAktif)) r.templateAktif = r.template[0].id;
  if (!Array.isArray(r.order) || !r.order.length){
    r.order = [{ id:'ord_1', nama:'Order ' + r.layanan[0].kode, layanan:r.layanan[0].id,
      template:r.orderTemplate || '', baris:{}, form:{} }];
  }
  r.order.forEach(O => {
    if (!O.id) O.id = 'ord_' + Math.random().toString(36).slice(2,8);
    if (!O.layanan || !r.layanan.some(L => L.id === O.layanan)) O.layanan = r.layanan[0].id;
    if (O.template && !r.template.some(T => T.id === O.template)) O.template = '';
    if (typeof O.nama !== 'string' || !O.nama) O.nama = 'Order';
    if (!O.baris || typeof O.baris !== 'object') O.baris = {};
    if (!O.form  || typeof O.form  !== 'object') O.form  = {};
  });
  /* tiap layanan punya sedikitnya satu order */
  r.layanan.forEach(L => {
    if (r.order.some(O => O.layanan === L.id)) return;
    r.order.push({ id:'ord_' + Math.random().toString(36).slice(2,8), nama:'Order ' + L.kode,
      layanan:L.id, template:'', baris:{}, form:{} });
  });
  if (!r.order.some(O => O.id === r.orderAktif)) r.orderAktif = r.order[0].id;
  delete r.orderTemplate;

  if (!Array.isArray(r.varDokumen)) r.varDokumen = JSON.parse(JSON.stringify(S.varDokumen || []));
  r.varDokumen.forEach(v => {
    if (typeof v.kode  !== 'string') v.kode = '';
    if (typeof v.label !== 'string') v.label = v.kode;
    if (typeof v.nilai !== 'string') v.nilai = '';
    if (typeof v.otomatis !== 'string') v.otomatis = '';
  });
  /* variabel global bawaan selalu ada — rancangan lama ikut dilengkapi tanpa
     mengubah variabel yang sudah dipakai di templatenya */
  VAR_BAWAAN.forEach(b => {
    let v = r.varDokumen.find(x => x.kode === b[0]);
    if (!v){ v = { kode:b[0], label:b[1], nilai:b[3], otomatis:b[2] }; r.varDokumen.push(v); }
    v.bawaan = true;
    v.kelompok = b[4];
    v.otomatis = b[2];
    if (b[5]) v.dari = b[5];
  });
  r.varDokumen.forEach(v => { if (!v.bawaan){ v.bawaan = false; v.kelompok = ''; } });

  r.tab.forEach(t => {
    if (!Array.isArray(t.field)) t.field = [];
    /* rancangan lama menandai kolom lewat judulnya; sekarang lewat sakelar tersendiri */
    t.field.forEach(f => { if (typeof f.diGrid !== 'boolean') f.diGrid = !!f.kolom; });
  });
  /* Normalisasi berlaku untuk isi SEMUA template, bukan hanya yang sedang dimuat. */
  (r.template || []).forEach(T => {
    if (T.isi.potongan === r.potongan) return;   /* yang aktif ditangani di bawah */
    rapikanIsiTemplate(T.isi, r.tab);
  });

  r.potongan.forEach(p => {
    p.slot = Array.isArray(p.slot) ? p.slot : [];
    p.syarat = rapikanSyarat(p.syarat);
    p.slot.forEach(sl => { sl.syarat = rapikanSyarat(sl.syarat); });
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
  pakaiOrder(rancangan.orderAktif);
  pakaiLayanan(rancangan.layananAktif);
  pakaiTemplate(rancangan.templateAktif);
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
  return teksSyarat(sy, labelField);
}

/* dua field dengan kode sama saling menimpa saat order disimpan */
function kodeGanda(f){
  if (!f.kode || TANPA_NILAI.includes(f.tipe)) return false;
  return (tabIni().field || []).filter(x => x.kode === f.kode && !TANPA_NILAI.includes(x.tipe)).length > 1;
}
const lencanaGanda = f => kodeGanda(f)
  ? '<span class="tanda-ganda" title="Ada field lain di tab ini dengan kode {{' + esc(f.kode) +
    '}}. Nilainya akan saling menimpa.">kode ganda</span>' : '';

/* Dua field Referensi user dengan awalan yang sama (termasuk sama-sama tanpa awalan)
   menghasilkan variabel yang sama persis — {{nama}}, {{nik}}, dan seterusnya. Yang terisi
   belakangan menimpa yang sebelumnya, dan yang kosong pun ikut menghapus. */
function sesamaPaket(f, t){
  if (f.tipe !== 'user' || !f.kode) return [];
  const tt = t || tabIni();
  const aw = (f.awalan || '').trim();
  return (tt.field || []).filter(x => x.id !== f.id && x.tipe === 'user' && x.kode &&
    (x.awalan || '').trim() === aw);
}
const lencanaGrid = f => (f.diGrid && tabIni().mode === 'daftar' && !TANPA_NILAI.includes(f.tipe))
  ? '<span class="tanda-grid" title="Muncul sebagai kolom pada tabel layar Order">di tabel</span>' : '';
const lencanaPaket = f => sesamaPaket(f).length
  ? '<span class="tanda-ganda" title="Field Referensi user lain di tab ini memakai awalan yang sama, ' +
    'jadi keduanya menghasilkan {{nama}}, {{nik}}, dan seterusnya yang sama.">paket bentrok</span>' : '';

function kartuMedan(f){
  if (f.tipe === 'tutup'){
    return '<div class="medan tutup lebar-penuh' + (pilih === f.id ? ' terpilih' : '') +
      '" draggable="true" data-id="' + f.id + '">' +
      '<button class="m-hapus" data-hapus="' + f.id + '">×</button>' +
      '<div class="m-teks">⊣ ' + esc(f.label || 'Akhir grup') + '</div></div>';
  }
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
      (f.wajib ? ' <span class="bintang">*</span>' : '') + lencanaGrid(f) + lencanaGanda(f) + lencanaPaket(f) +
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
  if (tipe === 'tutup') f.label = 'Akhir grup';
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
  if (kodeGanda(f)){
    h += '<div class="f blok-lebar"><p class="peringatan-var" style="margin:0"><b>Kode ganda.</b> ' +
      'Ada field lain di tab ini yang juga berkode <code>{{' + esc(f.kode) + '}}</code>. Saat order ' +
      'disimpan keduanya menulis ke variabel yang sama, jadi yang terakhir menimpa yang sebelumnya. ' +
      'Ganti salah satu kodenya, atau hapus field yang tidak dipakai.</p></div>';
  }
  if (sesamaPaket(f, t).length){
    h += '<div class="f blok-lebar"><p class="peringatan-var" style="margin:0"><b>Paket bentrok.</b> ' +
      'Field <b>' + esc(sesamaPaket(f, t).map(x => x.label).join('</b>, <b>')) + '</b> juga bertipe ' +
      'Referensi user dengan awalan yang sama, jadi keduanya menghasilkan variabel yang sama persis — ' +
      '<code>{{nama}}</code>, <code>{{nik}}</code>, dan seterusnya. Di satu baris order hanya salah ' +
      'satu yang terisi, dan yang kosong ikut mengosongkan variabelnya. Isi <b>Awalan variabel</b> ' +
      'di salah satu field (misalnya <code>wakil</code>, sehingga menjadi <code>{{wakil.nama}}</code>).</p></div>';
  }

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
      '<p class="hampa" style="margin:0 0 8px">KBLI yang dipilih berupa daftar, jadi <code>{{' +
      esc(f.kode || 'kbli') + '}}</code> sendiri bukan variabel. Di dalam redaksi bungkus satu barisnya ' +
      'dengan <code>[[ulang:' + esc(f.kode || 'kbli') + ']]…[[/ulang]]</code>, atau di Template Akta ' +
      'buat Bagian Otomatis dengan <b>Diulang atas → Tiap baris ' +
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

  if (f.tipe === 'tutup'){
    h += '<p class="hampa" style="margin:0">Menutup bagian lipat atau grup berulang yang sedang ' +
      'berjalan, tanpa membuka yang baru. Field sesudahnya berdiri di luar grup mana pun.</p>';
    return h;
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

    /* Kolom tabel hanya relevan pada tab bermode daftar — tabel + tombol Tambah. */
    if (t.mode === 'daftar'){
      h += '<div class="f blok-lebar" style="margin-top:4px;border-top:1px solid var(--garis);padding-top:14px">' +
        '<label class="sakelar"><input type="checkbox" data-p="diGrid"' + (f.diGrid ? ' checked' : '') +
        '> Tampilkan di tabel</label>' +
        '<p class="hampa" style="margin:6px 0 0">Tabel pada layar Order hanya memuat field yang ' +
        'sakelarnya hidup, menurut urutannya di kanvas. Bawaannya mati.</p></div>';
      if (f.diGrid && f.tipe === 'user'){
        const pilihPaket = Array.isArray(f.paket) ? f.paket : PAKET_SEMUA;
        h += '<div class="f blok-lebar"><label class="j">Data yang ditampilkan di kolom</label>' +
          '<select data-p="kolomVar">' +
          PAKET_ORANG.filter(x => pilihPaket.includes(x[0])).map(x =>
            '<option value="' + esc(x[0]) + '"' + ((f.kolomVar || 'nama') === x[0] ? ' selected' : '') +
            '>' + esc(x[1]) + '  ·  {{' + esc((f.awalan ? f.awalan + '.' : '') + x[0]) + '}}</option>').join('') +
          '</select>' +
          '<p class="hampa" style="margin:6px 0 0">Satu field Referensi user memekarkan banyak ' +
          'variabel; pilih salah satunya untuk ditampilkan di kolom tabel. Isian di dalam modal ' +
          'tetap berupa pencarian user, tidak berubah.</p></div>';
      }
      if (f.diGrid){
        h += '<div class="f"><label class="j">Judul kolom</label>' +
          '<input type="text" data-p="kolom" value="' + esc(f.kolom || '') + '" placeholder="' +
          esc((f.label || '').toUpperCase()) + '"></div>';
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
      if (k === 'diGrid' || k === 'awalan' || k === 'terbilang' || k === 'satuan') isiModalProperti(f.id);
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
    pulihkanIsi($('#pv-isi'), t, simpananTab);
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

  /* Tab bermode formulir tidak punya tombol Simpan yang merekam; isinya dicatat
     setiap kali berubah, termasuk pilihan KBLI dan baris grup berulang. */
  if (t.mode === 'formulir'){
    const rekamSemua = () => { nilaiForm[t.id] = bacaIsi($('#pv-isi'), t); };
    ['input', 'change', 'click'].forEach(ev =>
      $('#pv-isi').addEventListener(ev, () => setTimeout(rekamSemua, 0)));
  }
}

/* field dipecah menjadi kelompok: yang sebelum bagian lipat pertama berdiri sendiri */
function kelompokField(field){
  const grup = [];
  let kini = { buka:null, field:[] };
  (field || []).forEach(f => {
    if (PEMBUKA.includes(f.tipe)){
      if (kini.field.length || kini.buka) grup.push(kini);
      kini = { buka:f, field:[] };
      return;
    }
    if (f.tipe === 'tutup'){                       /* menutup kelompok tanpa membuka yang baru */
      if (kini.field.length || kini.buka) grup.push(kini);
      kini = { buka:null, field:[] };
      return;
    }
    kini.field.push(f);
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
  const kolom = t.field.filter(f => f.diGrid && !TANPA_NILAI.includes(f.tipe));
  const baris = barisPv[t.id] || [];
  let h = '<div class="bar-daftar"><button class="btn btn-utama" data-tambah>' +
    esc(t.tombolTambah || '+ Tambah') + '</button></div>';
  h += '<div class="tabel-bungkus"><table><thead><tr>' +
    (kolom.length ? kolom.map(k => '<th>' + esc(k.kolom || (k.label || '').toUpperCase()) + '</th>').join('')
                  : '<th>Ringkasan</th>') +
    '<th></th></tr></thead><tbody>';
  if (!baris.length){
    h += '<tr><td colspan="' + (Math.max(kolom.length,1) + 1) + '" class="kosong-tabel">' +
      esc(t.pesanKosong || 'Belum ada data.') + '</td></tr>';
  } else {
    baris.forEach((r,i) => {
      h += '<tr>';
      if (kolom.length){
        kolom.forEach(k => {
          let v = r[k.kode] || '—';
          if (k.tipe === 'user'){
            const u = userById(r[k.kode]);
            v = u ? (nilaiPaketOrang(u, k.kolomVar || 'nama') || '—') : (r[k.kode] || '—');
          }
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
  if (!kolom.length)
    h += '<p class="hampa" style="margin:8px 2px 0">Belum ada field yang ditandai <b>Tampilkan di ' +
      'tabel</b> di Form Design, jadi isinya diringkas dalam satu kolom.</p>';
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
  if (f.tipe === 'seksi' || f.tipe === 'tutup') return '';
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
/* =====================================================================
   MESIN SYARAT

   Bentuk simpul yang sah:
     {field, op, nilai}   baris dasar
     {grup:[baris, ...]}  gabungan ATAU — cukup satu terpenuhi
     {ref:'KODE'}         rujukan ke Pustaka Kondisi

   Tingkat atas SELALU digabung DAN. Penyimpanan sudah siap untuk pohon
   bersarang; penyuntingnya yang dibatasi satu tingkat.

   ATURAN NILAI KOSONG — satu aturan untuk semua operator:
     bila nilai fieldnya kosong, setiap operator bernilai SALAH.
     Kecualiannya hanya 'tidak terisi' dan 'tidak ada barisnya'.
   Jadi `≠ "PT"` pada field kosong bernilai salah, bukan benar.
   ===================================================================== */
const OPERATOR = [
  /* kode, label, bentuk nilai */
  ['=',                  'sama dengan',             'nilai'],
  ['≠',                  'tidak sama dengan',       'nilai'],
  ['salah satu dari',    'termasuk salah satu dari','daftar'],
  ['mengandung',         'mengandung teks',         'nilai'],
  ['terisi',             'ada isinya',              'tanpa'],
  ['tidak terisi',       'kosong',                  'tanpa'],
  ['>',                  'lebih dari',              'angka'],
  ['≥',                  'lebih dari atau sama',    'angka'],
  ['<',                  'kurang dari',             'angka'],
  ['≤',                  'kurang dari atau sama',   'angka'],
  ['ada barisnya',       'ada barisnya',            'tanpa'],
  ['tidak ada barisnya', 'tidak ada barisnya',      'tanpa']
];
const bentukNilai = op => (OPERATOR.find(o => o[0] === op) || ['','','nilai'])[2];
const labelOp = op => (OPERATOR.find(o => o[0] === op) || ['', op])[1];

/* "1.250.000" dan "0,85" sama-sama jadi angka; yang bukan angka jadi null */
function angkaDari(v){
  let t = String(v == null ? '' : v).replace(/\s/g, '');
  t = t.replace(/\.(?=\d{3}(\D|$))/g, '');
  t = t.replace(',', '.').replace(/[^0-9.\-]/g, '');
  const n = Number(t);
  return (t === '' || !isFinite(n)) ? null : n;
}
const daftarNilai = c => Array.isArray(c.nilai) ? c.nilai : (c.nilai == null ? [] : [c.nilai]);

function ujiSyarat(c, v){
  const x = v[c.field];
  const kosong = !(x != null && String(x).trim() !== '');
  /* dua operator ini memang menanyakan ketiadaan, jadi diperiksa sebelum aturan kosong */
  if (c.op === 'tidak terisi')       return kosong;
  if (c.op === 'tidak ada barisnya') return kosong || (angkaDari(x) || 0) <= 0;
  if (kosong) return false;
  const t = String(x);
  switch (c.op){
    case 'terisi':          return true;
    case 'ada barisnya':    return (angkaDari(x) || 0) > 0;
    case '=':               return t === String(c.nilai);
    case '≠':               return t !== String(c.nilai);
    case 'salah satu dari': return daftarNilai(c).map(String).indexOf(t) >= 0;
    case 'mengandung':      return t.toLowerCase().indexOf(String(c.nilai || '').toLowerCase()) >= 0;
    case '>': case '≥': case '<': case '≤': {
      const a = angkaDari(t), b = angkaDari(c.nilai);
      if (a === null || b === null) return false;
      return c.op === '>' ? a > b : c.op === '≥' ? a >= b : c.op === '<' ? a < b : a <= b;
    }
  }
  return false;
}

/* Bentuk yang sah saja yang disimpan; grup bersarang dibuang karena
   penyuntingnya satu tingkat. */
function rapikanSyarat(sy){
  const dasar = c => c && c.field && !c.grup && !c.ref;
  return (Array.isArray(sy) ? sy : []).map(c => {
    if (!c) return null;
    if (c.ref) return { ref: String(c.ref) };
    if (c.grup !== undefined) return { grup: (Array.isArray(c.grup) ? c.grup : []).filter(dasar) };
    return dasar(c) ? c : null;
  }).filter(Boolean);
}
const kondisiPustaka = k => (rancangan.pustaka || []).find(x => x.kode === k);

/* jejak menjaga rujukan berputar tidak membuat panggilan tak berujung */
function lolosSyarat(sy, v, jejak){
  const lihat = jejak || {};
  return (sy || []).every(c => {
    if (!c) return true;
    if (c.ref){
      if (lihat[c.ref]) return true;                  /* siklus — dilaporkan diagnosa */
      const k = kondisiPustaka(c.ref);
      if (!k) return true;                            /* rujukan hilang tidak menyembunyikan */
      const l = Object.assign({}, lihat); l[c.ref] = 1;
      return lolosSyarat(k.syarat, v, l);
    }
    if (Array.isArray(c.grup))
      return c.grup.length ? c.grup.some(g => lolosSyarat([g], v, lihat)) : true;
    return ujiSyarat(c, v);
  });
}

/* ---- menuliskan syarat sebagai teks; lab memakainya di kartu & diagnosa ---- */
function teksSatuSyarat(c, lab){
  if (c && c.ref){
    const k = kondisiPustaka(c.ref);
    return '⟨' + (k ? (k.label || k.kode) : c.ref + ' (hilang)') + '⟩';
  }
  if (!c || !c.field) return '?';
  const b = bentukNilai(c.op);
  if (b === 'tanpa')  return lab(c.field) + ' ' + c.op;
  if (b === 'daftar') return lab(c.field) + ' ' + c.op + ' {' + daftarNilai(c).join(', ') + '}';
  return lab(c.field) + ' ' + c.op + ' ' + c.nilai;
}
function teksSyarat(sy, lab){
  return (sy || []).map(c => Array.isArray(c && c.grup)
    ? (c.grup.length ? '(' + c.grup.map(x => teksSatuSyarat(x, lab)).join(' atau ') + ')' : '(grup kosong)')
    : teksSatuSyarat(c, lab)).join(' dan ');
}

/* ---- pilihan nilai & operator yang masuk akal untuk sebuah field ---- */
function opsiFieldSyarat(f){
  if (!f) return [];
  if (f.tipe === 'yatidak') return ['Ya', 'Tidak'];
  if (f.tipe === 'pilihan' || f.tipe === 'segmented') return (f.opsi || []).slice();
  return [];
}
function operatorUntuk(f){
  if (f && f.hitungBaris) return ['ada barisnya','tidak ada barisnya','=','≠','>','≥','<','≤'];
  if (opsiFieldSyarat(f).length) return ['=','≠','salah satu dari','terisi','tidak terisi'];
  if (f && (f.tipe === 'angka' || f.tipe === 'terbilang')) return ['=','≠','>','≥','<','≤','terisi','tidak terisi'];
  return ['=','≠','mengandung','terisi','tidak terisi'];
}
function opBawaan(f){
  if (f && f.hitungBaris) return 'ada barisnya';
  if (opsiFieldSyarat(f).length) return '=';
  return 'terisi';
}
/* satu baris syarat baru, memakai field pertama yang tersedia */
function syaratBaru(){
  const f = semuaField()[0];
  if (!f) return null;
  const op = opBawaan(f);
  return { field: f.kode, op,
    nilai: bentukNilai(op) === 'daftar' ? [] : (opsiFieldSyarat(f)[0] || '') };
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
/* Membaca seluruh isian sebuah wadah — dipakai modal Tambah maupun tab bermode formulir,
   supaya KBLI dan grup berulang tersimpan di keduanya, bukan hanya di modal. */
function bacaIsi(akar, t){
  const r = {};
  akar.querySelectorAll('[data-kode]').forEach(el => {
    if (el.closest('[data-baris]')) return;
    if (sedangTersembunyi(el)) return;
    if (el.classList.contains('segmented')){
      const a = el.querySelector('[aria-pressed="true"]');
      r[el.dataset.kode] = a ? a.textContent.trim() : '';
    } else r[el.dataset.kode] = el.value;
  });
  akar.querySelectorAll('.ulang-blok').forEach(blok => {
    if (sedangTersembunyi(blok)) return;
    const el = (t.field || []).find(x => x.id === blok.dataset.ulang);
    if (!el || !el.kode) return;
    r[el.kode] = [...blok.querySelectorAll('[data-baris]')].map(bacaMedan);
  });
  akar.querySelectorAll('.kbli-blok').forEach(blok => {
    if (sedangTersembunyi(blok)) return;
    const el = (t.field || []).find(x => x.id === blok.dataset.kbli);
    if (!el || !el.kode) return;
    r[el.kode] = [...blok.querySelectorAll('[data-kbli-terpilih] [data-kode-kbli]')].map(b => {
      const x = (window.KBLI_CONTOH || []).find(y => y.kode === b.dataset.kodeKbli) || {};
      return { kode:x.kode || '', judul:x.judul || '', golongan:x.golongan || '' };
    });
  });
  return r;
}
/* Mengembalikan pilihan KBLI dan baris grup berulang sesudah layar digambar ulang.
   Dijalankan sebelum pasangKbli/pasangUlang supaya kendalinya ikut terpasang. */
function pulihkanIsi(akar, t, nilai){
  if (!nilai) return;
  akar.querySelectorAll('.kbli-blok').forEach(blok => {
    const f = (t.field || []).find(x => x.id === blok.dataset.kbli);
    const dipilih = f && Array.isArray(nilai[f.kode]) ? nilai[f.kode] : [];
    if (!dipilih.length) return;
    const wadah = blok.querySelector('[data-kbli-terpilih]');
    const kosong = wadah.querySelector('.kb-kosong');
    if (kosong) kosong.remove();
    dipilih.forEach(x => wadah.insertAdjacentHTML('beforeend', kbliBarisHtml(x, true)));
  });
  akar.querySelectorAll('.ulang-blok').forEach(blok => {
    const f = (t.field || []).find(x => x.id === blok.dataset.ulang);
    const baris = f && Array.isArray(nilai[f.kode]) ? nilai[f.kode] : [];
    if (!baris.length) return;
    const g = kelompokField(t.field).find(x => x.buka && x.buka.id === blok.dataset.ulang);
    const wadah = blok.querySelector('[data-daftar-baris]');
    if (!g || !wadah) return;
    wadah.innerHTML = '';
    baris.forEach((isi, i) => {
      wadah.insertAdjacentHTML('beforeend', barisUlangHtml(g, i + 1));
      const b = wadah.lastElementChild;
      b.querySelectorAll('[data-kode]').forEach(el => {
        const v = isi[el.dataset.kode];
        if (v == null) return;
        if (el.classList.contains('segmented'))
          el.querySelectorAll('button').forEach(x =>
            x.setAttribute('aria-pressed', String(x.textContent.trim() === v)));
        else el.value = v;
      });
    });
  });
}

$('#m-simpan').addEventListener('click', () => {
  const t = tabModal; if (!t) return;
  barisPv[t.id] = barisPv[t.id] || [];
  barisPv[t.id].push(bacaIsi($('#m-isi'), t));
  $('#tirai').hidden = true;
  gambarPratinjau();
});
$$('[data-tutup]').forEach(b => b.addEventListener('click', () => $('#tirai').hidden = true));
$('#tirai').addEventListener('mousedown', e => { if (e.target === $('#tirai')) $('#tirai').hidden = true; });

/* ================= navigasi ================= */
/* =====================================================================
   Layar Profil Kantor — isinya variabel global, bukan field formulir order.
   ===================================================================== */
const MEDAN_KANTOR = [
  /* kode, label, jenis, placeholder, wajib, lebar */
  ['notaris_nama',          'Nama NOTARIS',              'teks',    'mis. Budi Santoso',        true,  ''],
  ['notaris_sk_nomor',      'Nomor SK Pengangkatan',     'teks',    'mis. 123/KEP-17.3/IV/2023',true,  ''],
  ['notaris_gelar',         'Gelar disingkat',           'teks',    'mis. S.H., M.Kn.',         false, ''],
  ['notaris_sk_tanggal',    'Tanggal SK Pengangkatan',   'tanggal', '',                         false, ''],
  ['notaris_gelar_panjang', 'Gelar tidak disingkat',     'teks',    'mis. Sarjana Hukum, Magister Kenotariatan', false, ''],
  ['notaris_wilayah',       'Wilayah Kerja',             'teks',    'mis. Kota Jakarta Selatan',true,  ''],
  ['notaris_telepon',       'Telepon',                   'teks',    'mis. 021-1234567',         false, ''],
  ['notaris_email',         'Email',                     'teks',    'mis. kantor@notaris.id',   false, ''],
  ['notaris_alamat',        'Alamat Kantor',             'panjang', 'Alamat lengkap kantor',    true,  'penuh'],
  ['kantor_label',          'Label kartu kantor',        'teks',    'mis. Kantor Notaris & PPAT',false,'penuh']
];
const TURUNAN_KANTOR = [
  ['notaris_nama_gelar',          'nama + gelar disingkat — dipakai pada kartu kantor'],
  ['notaris_nama_gelar_panjang',  'nama + gelar tidak disingkat — dipakai pada badan akta'],
  ['notaris_sk_tanggal_terbilang','tanggal SK dalam huruf']
];
function varDok(kode){ return (rancangan.varDokumen || []).find(v => v.kode === kode) || null; }

function gambarPanelKantor(){
  const kotak = $('#isi-kantor');
  if (!kotak) return;
  const medan = ([kode, label, jenis, ph, wajib, lebar]) => {
    const v = varDok(kode);
    const nilai = v ? (v.nilai || '') : '';
    const kendali = jenis === 'panjang'
      ? '<textarea data-pk="' + kode + '" placeholder="' + esc(ph) + '">' + esc(nilai) + '</textarea>'
      : '<input type="' + (jenis === 'tanggal' ? 'date' : 'text') + '" data-pk="' + kode + '" ' +
        'placeholder="' + esc(ph) + '" value="' + esc(nilai) + '">';
    return '<div class="pk-medan' + (lebar === 'penuh' ? ' penuh' : '') + '">' +
      '<label>' + esc(label) + (wajib ? '<span class="wajib">*</span>' : '') + '</label>' + kendali +
      '<span class="kodevar">{{' + esc(kode) + '}}</span></div>';
  };
  const ctx = konteksDokumen();
  kotak.innerHTML =
    '<h3 class="pk-kepala"><i>▤</i>Profil Kantor</h3>' +
    '<p class="pk-catatan">Isian di sini tidak terikat pada formulir order mana pun — semuanya ' +
    'menjadi variabel global yang bisa dipakai di bagian template mana saja, dan mengisi kartu ' +
    'kantor di sisi kiri layar.</p>' +
    '<div class="pk-kisi">' + MEDAN_KANTOR.map(medan).join('') + '</div>' +
    '<div class="pk-turunan"><h4>Variabel turunan</h4>' +
    '<p class="hampa">Dirakit sendiri dari isian di atas; tidak perlu diketik.</p>' +
    TURUNAN_KANTOR.map(([k, ket]) => '<div class="baris"><code>{{' + esc(k) + '}}</code>' +
      '<span class="nilai">' + (ctx[k] ? esc(ctx[k]) : '—') + ' <span class="hampa">· ' + esc(ket) +
      '</span></span></div>').join('') + '</div>';
  kotak.querySelectorAll('[data-pk]').forEach(el => el.addEventListener('input', () => {
    const v = varDok(el.dataset.pk);
    if (!v) return;
    v.nilai = el.value;
    gambarKartuKantor();
    kotak.querySelectorAll('.pk-turunan .nilai').forEach((sp, i) => {
      const c = konteksDokumen();
      const k = TURUNAN_KANTOR[i];
      sp.innerHTML = (c[k[0]] ? esc(c[k[0]]) : '—') + ' <span class="hampa">· ' + esc(k[1]) + '</span>';
    });
    simpanNanti();
  }));
}
/* kartu kantor di sidebar dibaca dari variabel global yang sama */
function gambarKartuKantor(){
  const kk = $('#kartu-kantor');
  if (!kk) return;
  const c = konteksDokumen();
  const baris = (ikon, teks) => teks ? '<div class="kk-baris"><i>' + ikon + '</i>' + esc(teks) + '</div>' : '';
  kk.innerHTML =
    '<div class="kk-judul">' + esc(c.kantor_label || 'Profil Kantor') + '</div>' +
    '<div class="kk-nama">' + esc(c.notaris_nama_gelar || c.notaris_nama || '—') + '</div>' +
    baris('▤', c.notaris_sk_nomor ? 'SK · ' + c.notaris_sk_nomor : '') +
    baris('◎', c.notaris_wilayah ? 'Wilayah · ' + c.notaris_wilayah : '') +
    baris('✆', c.notaris_telepon) +
    baris('✉', c.notaris_email) +
    baris('⌂', c.notaris_alamat);
}

/* =====================================================================
   Layar Layanan & Template, dan daftar template di Template Akta
   ===================================================================== */
let tplBuka = false;            /* true bila editor template sedang terbuka */

function idBaruAwalan(aw){ return aw + Math.random().toString(36).slice(2,8); }

function gambarLayarTemplate(){
  const daftar = $('#tpl-daftar'), editor = $('#tpl-editor');
  if (!daftar || !editor) return;
  daftar.hidden = tplBuka;
  editor.hidden = !tplBuka;
  if (tplBuka){ gambarDaftarBagian(); gambarKanan(); gambarKepalaTemplate(); return; }

  $('#tpl-tabel tbody').innerHTML = (rancangan.layanan || []).map(L => {
    const T = templateDari(L.id);
    if (!T) return '<tr><td class="utama"><b>' + esc(L.kode) + '</b> ' + esc(L.nama) + '</td>' +
      '<td class="utama"><span class="hampa">belum ada template</span></td><td></td></tr>';
    const platform = T.milik === 'platform';
    return '<tr><td class="utama"><b>' + esc(L.kode) + '</b> ' + esc(L.nama) + '</td>' +
      '<td class="utama">' + esc(T.nama) +
        (platform ? ' <span class="pil-kecil">Bawaan platform</span>'
                  : ' <span class="pil-kecil milik">Milik kantor</span>') + '</td>' +
      '<td class="kanan">' +
        (platform
          ? '<button class="btn btn-kecil" data-tsalin="' + T.id + '">⧉ Salin &amp; Sunting</button> ' +
            '<button class="btn btn-kecil btn-utama" data-tbuka="' + T.id + '">Lihat</button>'
          : '<button class="btn btn-kecil" data-tubah="' + T.id + '">⚙ Ubah</button> ' +
            '<button class="btn btn-kecil btn-utama" data-tbuka="' + T.id + '">Pasal</button>') +
      '</td></tr>';
  }).join('') || '<tr><td colspan="3" class="kosong-tabel">Belum ada layanan.</td></tr>';

  const keLyn = $('#tpl-ke-layanan');
  if (keLyn) keLyn.onclick = () => pilihMode('layanan');
  $$('#tpl-tabel [data-tbuka]').forEach(b => b.addEventListener('click', () => {
    pakaiTemplate(b.dataset.tbuka); tplBuka = true;
    gambarSemua(); gambarLayarTemplate();
  }));
  /* Satu layanan satu template: menyalin berarti menggantikan template platform
     dengan salinan milik kantor pada layanan yang sama. */
  $$('#tpl-tabel [data-tsalin]').forEach(b => b.addEventListener('click', () => {
    const asal = templateById(b.dataset.tsalin);
    if (!asal) return;
    if (!window.confirm('Salin “' + asal.nama + '” menjadi template milik kantor? ' +
      'Template platform ini akan digantikan oleh salinannya pada layanan tersebut.')) return;
    const T = { id:idBaruAwalan('tpl_'), kode:asal.kode.replace(/-P$/,''),
      nama:asal.nama.replace(/ Bawaan Platform$/,'') + ' (kantor)',
      layanan:asal.layanan, milik:'kantor', isi:JSON.parse(JSON.stringify(asal.isi)) };
    rancangan.template.splice(rancangan.template.indexOf(asal), 1, T);
    (rancangan.layanan || []).forEach(L => { if (L.templateBawaan === asal.id) L.templateBawaan = T.id; });
    (rancangan.order || []).forEach(O => { if (O.template === asal.id) O.template = T.id; });
    pakaiTemplate(T.id); tplBuka = true;
    gambarSemua(); gambarLayarTemplate(); simpanNanti();
  }));
  $$('#tpl-tabel [data-tubah]').forEach(b => b.addEventListener('click', () => ubahTemplate(b.dataset.tubah)));
}

async function ubahTemplate(id){
  const T = templateById(id); if (!T) return;
  const L = (rancangan.layanan || []).find(x => x.id === T.layanan);
  const h = await tanyaIsian('Ubah template', [
    { kunci:'kode', label:'Kode template', nilai:T.kode, petunjuk:'mis. AJB' },
    { kunci:'nama', label:'Nama template', nilai:T.nama, petunjuk:'mis. AJB Standar' }
  ], L ? 'Template layanan ' + L.nama : '');
  if (!h) return;
  T.kode = h.kode || T.kode;
  T.nama = h.nama || T.nama;
  if (L) L.templateBawaan = T.id;
  gambarLayarTemplate(); gambarLayarLayanan(); gambarKepalaTemplate(); simpanNanti();
}

function gambarKepalaTemplate(){
  const T = templateIni(), L = layananIni();
  const nm = $('#tpl-nama'), lc = $('#tpl-lencana'), kt = $('#tpl-editor .bj-ket');
  if (nm) nm.textContent = T ? T.nama : '—';
  if (lc) lc.textContent = T ? T.kode : '—';
  if (kt) kt.textContent = T && T.milik === 'platform'
    ? 'Template bawaan platform — hanya bisa dilihat. Salin dulu untuk menyuntingnya.'
    : 'Template milik kantor pada layanan ' + (L ? L.kode : '—') + '.';
  document.body.classList.toggle('tpl-kunci', tplTerkunci());
}

/* ---------- daftar formulir per layanan ---------- */
let fdBuka = false;

function gambarLayarForm(){
  const daftar = $('#fd-daftar'), editor = $('#fd-editor');
  if (!daftar || !editor) return;
  daftar.hidden = fdBuka;
  editor.hidden = !fdBuka;
  if (fdBuka){ gambarKepalaForm(); gambarDaftarTab(); gambarKanvas(); return; }

  $('#fd-tabel tbody').innerHTML = (rancangan.layanan || []).map(L => {
    const T = templateDari(L.id);
    const nField = (L.tab || []).reduce((n, t) => n + (t.field || []).length, 0);
    return '<tr><td class="utama"><b>' + esc(L.kode) + '</b> ' + esc(L.nama) +
        (L.id === rancangan.layananAktif ? ' <span class="pil-kecil default">Aktif</span>' : '') + '</td>' +
      '<td>' + (L.tab || []).length + ' tab</td>' +
      '<td>' + nField + ' field</td>' +
      '<td>' + (T ? esc(T.nama) : '<span class="hampa">—</span>') + '</td>' +
      '<td class="kanan"><button class="btn btn-kecil btn-utama" data-fdbuka="' + esc(L.id) +
      '">Rancang formulir</button></td></tr>';
  }).join('') || '<tr><td colspan="5" class="kosong-tabel">Belum ada layanan.</td></tr>';

  $$('#fd-tabel [data-fdbuka]').forEach(b => b.addEventListener('click', () => {
    pakaiLayanan(b.dataset.fdbuka);
    const T = templateDari(b.dataset.fdbuka);
    if (T) pakaiTemplate(T.id);
    fdBuka = true; tabAktif = 0; pilih = null;
    gambarSemua(); gambarLayarForm(); simpanNanti();
  }));
  const ke = $('#fd-ke-layanan');
  if (ke) ke.onclick = () => pilihMode('layanan');
}

function gambarKepalaForm(){
  const L = layananIni();
  const nm = $('#fd-nama'), lc = $('#fd-lencana');
  if (nm) nm.textContent = 'Formulir ' + (L ? L.nama : '—');
  if (lc) lc.textContent = L ? L.kode : '—';
}

function gambarLayarLayanan(){
  const tb = $('#lyn-tabel tbody'); if (!tb) return;
  tb.innerHTML = (rancangan.layanan || []).map(L => {
    const milik = templateLayanan(L.id);
    return '<tr><td class="utama"><b>' + esc(L.kode) + '</b></td>' +
      '<td class="utama">' + esc(L.nama) + '</td>' +
      '<td>' + (L.tab || []).length + ' tab</td>' +
      '<td>' + (milik[0] ? esc(milik[0].nama) : '<span class="hampa">—</span>') + '</td>' +
      '<td>' + orderLayanan(L.id).length + ' order ' +
        '<button class="btn btn-kecil" data-ltambahorder="' + esc(L.id) + '">+</button></td>' +
      '<td class="kanan"><button class="btn btn-kecil" data-lubah="' + esc(L.id) + '">⚙ Ubah</button> ' +
      '<button class="btn btn-kecil" data-lbuka="' + esc(L.id) + '">Formulir</button> ' +
      '<button class="btn btn-kecil" data-lhapus="' + esc(L.id) + '">Hapus</button></td></tr>';
  }).join('') || '<tr><td colspan="6" class="kosong-tabel">Belum ada layanan.</td></tr>';

  tb.querySelectorAll('[data-ltambahorder]').forEach(b => b.addEventListener('click', () => {
    const L = (rancangan.layanan || []).find(x => x.id === b.dataset.ltambahorder); if (!L) return;
    tambahOrder(L.id);
    gambarLayarLayanan(); gambarMenuOrder(); simpanNanti();
  }));
  tb.querySelectorAll('[data-lhapus]').forEach(b => b.addEventListener('click', () => {
    const L = (rancangan.layanan || []).find(x => x.id === b.dataset.lhapus); if (!L) return;
    if ((rancangan.layanan || []).length <= 1){ window.alert('Sisakan sedikitnya satu layanan.'); return; }
    if (!window.confirm('Hapus layanan “' + L.nama + '” beserta template dan ordernya?')) return;
    rancangan.template = rancangan.template.filter(T => T.layanan !== L.id);
    rancangan.order    = rancangan.order.filter(O => O.layanan !== L.id);
    rancangan.layanan  = rancangan.layanan.filter(x => x.id !== L.id);
    termuatLayanan = termuatTemplate = termuatOrder = null;
    pakaiOrder(rancangan.order[0] && rancangan.order[0].id);
    pakaiLayanan(rancangan.layanan[0].id);
    const T0 = templateDari(rancangan.layanan[0].id);
    if (T0) pakaiTemplate(T0.id);
    gambarSemua(); gambarLayarLayanan(); gambarMenuOrder(); simpanNanti();
  }));
  tb.querySelectorAll('[data-lubah]').forEach(b => b.addEventListener('click', async () => {
    const L = (rancangan.layanan || []).find(x => x.id === b.dataset.lubah); if (!L) return;
    const T = templateDari(L.id);
    const h = await tanyaIsian('Ubah layanan', [
      { kunci:'kode', label:'Kode layanan', nilai:L.kode, petunjuk:'mis. AJB' },
      { kunci:'nama', label:'Nama layanan', nilai:L.nama, petunjuk:'mis. Akta Jual Beli' },
      { kunci:'tkode', label:'Kode template', nilai:T ? T.kode : '', petunjuk:'mis. AJB' },
      { kunci:'tnama', label:'Nama template', nilai:T ? T.nama : '', petunjuk:'mis. AJB Standar' }
    ], 'Nama layanan dan nama templatenya sekaligus.');
    if (!h) return;
    L.kode = h.kode || L.kode;
    L.nama = h.nama || L.nama;
    if (T){ T.kode = h.tkode || T.kode; T.nama = h.tnama || T.nama; }
    gambarSemua(); gambarLayarLayanan(); gambarLayarTemplate(); simpanNanti();
  }));
  tb.querySelectorAll('[data-lbuka]').forEach(b => b.addEventListener('click', () => {
    pakaiLayanan(b.dataset.lbuka);
    const T = templateDari(b.dataset.lbuka);
    if (T) pakaiTemplate(T.id);
    fdBuka = true; tabAktif = 0; pilih = null;
    gambarSemua(); pilihMode('rancang'); simpanNanti();
  }));
  const tbh = $('#lyn-tambah');
  if (tbh) tbh.onclick = () => {
    const n = (rancangan.layanan || []).length + 1;
    const L = { id:idBaruAwalan('lyn_'), kode:'LYN' + n, nama:'Layanan ' + n,
      tab:[{ id:idBaru(), nama:'Tab baru', mode:'formulir', tombolSimpan:'Simpan', field:[] }],
      templateBawaan:'' };
    rancangan.layanan.push(L);
    const T = { id:idBaruAwalan('tpl_'), kode:L.kode, nama:'Template ' + L.nama, layanan:L.id,
      milik:'kantor',
      isi:{ bagian:[], potongan:[], grup:[], halaman:JSON.parse(JSON.stringify(rancangan.halaman)) } };
    rancangan.template.push(T);
    L.templateBawaan = T.id;
    tambahOrder(L.id);
    pakaiLayanan(L.id); gambarSemua(); gambarLayarLayanan(); gambarMenuOrder(); simpanNanti();
  };
}

/* ---------- daftar order ---------- */
let orBuka = false;                 /* true bila satu order sedang dibuka */
let layananDaftarOrder = null;      /* layanan yang daftarnya sedang ditampilkan; null = semua */

function tambahOrder(idL){
  const L = (rancangan.layanan || []).find(x => x.id === idL); if (!L) return null;
  const n = orderLayanan(L.id).length + 1;
  const O = { id:idBaruAwalan('ord_'), nama:'Order ' + L.kode + ' ' + String.fromCharCode(64 + n),
    layanan:L.id, template:'', baris:{}, form:{} };
  rancangan.order.push(O);
  return O;
}
function ringkasIsiOrder(O){
  const L = (rancangan.layanan || []).find(x => x.id === O.layanan);
  if (!L) return '—';
  const bagian = (L.tab || []).map(t => t.mode === 'daftar'
    ? t.nama + ' ' + (((O.baris || {})[t.id] || []).length) : null).filter(Boolean);
  return bagian.length ? bagian.join(' · ') : 'formulir tunggal';
}

function gambarDaftarOrder(){
  const daftar = $('#or-daftar'), isi = $('#or-isi');
  if (!daftar || !isi) return;
  daftar.hidden = orBuka;
  isi.hidden = !orBuka;
  if (orBuka){ gambarKepalaOrder(); gambarPratinjau(); return; }

  const L = layananDaftarOrder
    ? (rancangan.layanan || []).find(x => x.id === layananDaftarOrder) : null;
  const baris = L ? orderLayanan(L.id) : (rancangan.order || []);
  $('#or-daftar-judul').textContent = L ? 'Order ' + L.kode : 'Semua order';
  $('#or-daftar-ket').textContent = L
    ? 'Order layanan ' + L.nama + '. Naskahnya dirakit dengan template layanan ini.'
    : 'Tiap order melekat pada satu layanan; formulir dan templatenya mengikuti layanan itu.';

  $('#or-tabel tbody').innerHTML = baris.length ? baris.map(O => {
    const LO = (rancangan.layanan || []).find(x => x.id === O.layanan);
    const T  = templateDari(O.layanan);
    return '<tr><td class="utama"><b>' + esc(O.nama) + '</b>' +
        (O.id === rancangan.orderAktif ? ' <span class="pil-kecil default">Aktif</span>' : '') + '</td>' +
      '<td>' + (LO ? esc(LO.kode) + ' · ' + esc(LO.nama) : '—') + '</td>' +
      '<td>' + (T ? esc(T.nama) : '<span class="hampa">belum ada</span>') + '</td>' +
      '<td>' + esc(ringkasIsiOrder(O)) + '</td>' +
      '<td class="kanan"><button class="btn btn-kecil" data-oubah="' + esc(O.id) + '">⚙ Ubah</button> ' +
      '<button class="btn btn-kecil" data-ohapus="' + esc(O.id) + '">Hapus</button> ' +
      '<button class="btn btn-kecil btn-utama" data-obuka="' + esc(O.id) + '">Buka</button></td></tr>';
  }).join('') : '<tr><td colspan="5" class="kosong-tabel">Belum ada order.</td></tr>';

  $$('#or-tabel [data-obuka]').forEach(b => b.addEventListener('click', () => {
    pakaiOrder(b.dataset.obuka);
    const T = templateOrder(); if (T) pakaiTemplate(T.id);
    orBuka = true; gambarSemua(); gambarDaftarOrder(); simpanNanti();
  }));
  $$('#or-tabel [data-oubah]').forEach(b => b.addEventListener('click', async () => {
    const O = (rancangan.order || []).find(x => x.id === b.dataset.oubah); if (!O) return;
    const h = await tanyaIsian('Ubah order', [
      { kunci:'nama', label:'Nama order', nilai:O.nama, petunjuk:'mis. Order AJB A' }
    ]);
    if (!h) return;
    O.nama = h.nama || O.nama;
    gambarDaftarOrder(); gambarKepalaOrder(); simpanNanti();
  }));
  $$('#or-tabel [data-ohapus]').forEach(b => b.addEventListener('click', () => {
    const O = (rancangan.order || []).find(x => x.id === b.dataset.ohapus); if (!O) return;
    if ((rancangan.order || []).length <= 1){ window.alert('Sisakan sedikitnya satu order.'); return; }
    if (!window.confirm('Hapus “' + O.nama + '” beserta isiannya?')) return;
    rancangan.order = rancangan.order.filter(x => x.id !== O.id);
    if (rancangan.orderAktif === O.id){ termuatOrder = null; pakaiOrder(rancangan.order[0].id); }
    gambarDaftarOrder(); gambarMenuOrder(); simpanNanti();
  }));
  const tbh = $('#or-tambah');
  if (tbh) tbh.onclick = () => {
    const idL = L ? L.id : rancangan.layananAktif;
    const O = tambahOrder(idL);
    if (!O) return;
    gambarDaftarOrder(); gambarMenuOrder(); simpanNanti();
  };
}

function gambarKepalaOrder(){
  const O = orderIni(), T = templateOrder();
  const L = O ? (rancangan.layanan || []).find(x => x.id === O.layanan) : null;
  const nm = $('#or-nama'), lay = $('#or-layanan');
  if (nm) nm.textContent = O ? O.nama : 'Order';
  if (lay) lay.innerHTML = 'Layanan <b>' + esc(L ? L.kode : '—') + '</b>' +
    ' · Template <b>' + esc(T ? T.nama : 'belum ada') + '</b>';
}

/* menu sidebar: satu butir per layanan, membuka daftar ordernya */
function gambarMenuOrder(){
  const wadah = $('#menu-order');
  if (!wadah) return;
  wadah.innerHTML = (rancangan.layanan || []).map(L =>
    '<button class="m-item" data-order-layanan="' + esc(L.id) + '"><i>▸</i>Order ' +
    esc(L.kode) + '</button>').join('') ||
    '<button class="m-item mati"><i>▸</i>Belum ada layanan</button>';
  wadah.querySelectorAll('[data-order-layanan]').forEach(b => b.addEventListener('click', () => {
    layananDaftarOrder = b.dataset.orderLayanan;
    orBuka = false;
    pilihMode('pratinjau');
  }));
}

/* =====================================================================
   Modal isian ringkas — Electron tidak menyediakan window.prompt, jadi
   semua permintaan isian singkat lewat sini.
   medan: [{kunci, label, nilai, petunjuk}] · hasil: objek {kunci: nilai} atau null
   ===================================================================== */
function tanyaIsian(judul, medan, keterangan){
  return new Promise(resolve => {
    const tirai = $('#tirai-tanya');
    if (!tirai) return resolve(null);
    $('#tanya-judul').textContent = judul;
    $('#tanya-ket').textContent = keterangan || '';
    $('#tanya-isi').innerHTML = medan.map(m =>
      '<div class="f"><label class="j">' + esc(m.label) + '</label>' +
      '<input type="text" data-tanya="' + esc(m.kunci) + '" value="' + esc(m.nilai == null ? '' : m.nilai) +
      '" placeholder="' + esc(m.petunjuk || '') + '"></div>').join('');
    tirai.hidden = false;
    const kotak = $('#tanya-isi');
    const pertama = kotak.querySelector('input');
    if (pertama){ pertama.focus(); pertama.select(); }

    const bersih = () => {
      tirai.hidden = true;
      $('#tanya-ok').removeEventListener('click', simpan);
      tirai.removeEventListener('keydown', kunci);
      $$('#tirai-tanya [data-tanya-batal]').forEach(b => b.removeEventListener('click', batal));
    };
    const simpan = () => {
      const hasil = {};
      kotak.querySelectorAll('[data-tanya]').forEach(el => { hasil[el.dataset.tanya] = el.value.trim(); });
      bersih(); resolve(hasil);
    };
    const batal = () => { bersih(); resolve(null); };
    const kunci = ev => {
      if (ev.key === 'Enter'){ ev.preventDefault(); simpan(); }
      if (ev.key === 'Escape'){ ev.preventDefault(); batal(); }
    };
    $('#tanya-ok').addEventListener('click', simpan);
    tirai.addEventListener('keydown', kunci);
    $$('#tirai-tanya [data-tanya-batal]').forEach(b => b.addEventListener('click', batal));
  });
}

const KEPALA = {
  layanan:   ['Engine Module › Layanan & Template', 'Layanan & Template',
              'Tiap layanan punya satu formulir order dan beberapa template naskah.'],
  minuta:    ['Engine Module › Minuta', 'Minuta Order A',
              'Naskah hasil perakitan order — Notaris dan Asisten merapikan tulisannya di sini.'],
  kantor:    ['Engine Module › Profil Kantor', 'Profil Kantor',
              'Identitas kantor dan penanda tangan — tersedia sebagai variabel global di semua template.'],
  rancang:   ['Engine Module › Form Design', 'Form Design',
              'Rancangan isian layar order — field di sini sekaligus menjadi kamus variabel.'],
  kondisi:   ['Engine Module › Template Akta', 'Template Akta Kantor',
              'Template minuta milik kantor per layanan'],
  pustaka:   ['Engine Module › Pustaka Kondisi', 'Pustaka Kondisi',
              'Kondisi bernama milik platform — dirujuk template, bukan disalin'],
  pratinjau: ['Layanan Engine › Order A', 'Order A', 'Layanan contoh']
};
function pilihMode(mode){
  $$('.m-item[data-mode]').forEach(x => x.setAttribute('aria-current', String(x.dataset.mode === mode)));
  $$('#menu-order .m-item').forEach(x => x.setAttribute('aria-current',
    String(mode === 'pratinjau' && x.dataset.orderLayanan === layananDaftarOrder)));
  $$('.layar').forEach(l => { l.hidden = l.dataset.layar !== mode; });
  const k = KEPALA[mode] || ['','',''];
  $('#remah').textContent = k[0];
  $('#judul-halaman').textContent = k[1];
  $('#sub-halaman').textContent = k[2];
  if (mode === 'pratinjau'){
    const L = layananDaftarOrder
      ? (rancangan.layanan || []).find(x => x.id === layananDaftarOrder) : null;
    $('#remah').textContent = 'Layanan Engine › ' + (L ? 'Order ' + L.kode : 'Order');
    $('#judul-halaman').textContent = L ? 'Order ' + L.kode : 'Order';
    $('#sub-halaman').textContent = L ? L.nama : 'Daftar order';
    gambarDaftarOrder();
  }
  if (mode === 'kantor')  gambarPanelKantor();
  if (mode === 'layanan') gambarLayarLayanan();
  if (mode === 'kondisi') gambarLayarTemplate();
  if (mode === 'pustaka') gambarLayarPustaka();
  if (mode === 'rancang') gambarLayarForm();
  if (mode === 'minuta'){ pakaiTemplateOrder(); gambarMinuta(); }
  terapkanPeranLayar();
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

/* menyembunyikan aksi yang bukan milik peran terbatas */
function terapkanPeranLayar(){
  const bebas = penuh();
  /* Template Akta menyusun struktur dan syarat — hanya Super Admin. Notaris dan
     Asisten bekerja di Minuta, yang hanya menyentuh tulisannya. */
  const mt = $('#menu-template');
  if (mt){
    mt.classList.toggle('mati', !bebas);
    mt.title = bebas ? '' : 'Hanya Super Admin. Notaris dan Asisten menyunting naskah di Minuta.';
  }
  const mp = $('#menu-pustaka');
  if (mp){
    mp.classList.toggle('mati', !bebas);
    mp.title = bebas ? '' : 'Hanya Super Admin — kondisi disusun di tingkat platform.';
  }
  if (!bebas && !$('.layar[data-layar="kondisi"]').hidden) pilihMode('minuta');
  if (!bebas && !$('.layar[data-layar="pustaka"]').hidden) pilihMode('minuta');
}

function gambarKartuPeran(){
  const sel = $('#pilih-peran');
  if (!sel) return;
  const kini = rancangan.peran || 'super';
  if (!sel.options.length)
    sel.innerHTML = PERAN.map(p => '<option value="' + p[0] + '">' + esc(p[1]) + ' · ' + esc(p[2]) +
      '</option>').join('');
  sel.value = kini;
  const p = PERAN.find(x => x[0] === kini) || PERAN[0];
  $('#peran-nama').textContent  = p[1];
  $('#peran-label').textContent = p[2];
  $('#peran-av').textContent    = p[3];
  document.body.classList.toggle('peran-terbatas', !penuh());
  terapkanPeranLayar();
}

function gambarSemua(){
  gambarKartuPeran();
  gambarMenuOrder();
  gambarKartuKantor();
  if (fdBuka){ gambarKepalaForm(); gambarDaftarTab(); gambarKanvas(); }
  if (rancangan.bagian && !$('.layar[data-layar="kondisi"]').hidden && tplBuka){
    gambarDaftarBagian(); gambarKanan(); gambarKepalaTemplate();
  }
  if (!$('.layar[data-layar="pratinjau"]').hidden && orBuka) gambarPratinjau();
  if (!$('.layar[data-layar="kantor"]').hidden) gambarPanelKantor();
}

(function pasangImporFormulir(){
  const i = $('#btn-impor-form'), e = $('#btn-ekspor-form');
  if (i) i.addEventListener('click', imporFormulir);
  if (e) e.addEventListener('click', eksporFormulir);
})();

(function pasangKembaliForm(){
  const b = $('#fd-kembali');
  if (b) b.addEventListener('click', () => { fdBuka = false; gambarLayarForm(); });
})();

(function pasangKembaliOrder(){
  const b = $('#or-kembali');
  if (b) b.addEventListener('click', () => { orBuka = false; gambarDaftarOrder(); });
})();

(function pasangKembaliTemplate(){
  const b = $('#tpl-kembali');
  if (b) b.addEventListener('click', () => { tplBuka = false; gambarLayarTemplate(); });
})();

(function pasangPilihPeran(){
  const sel = $('#pilih-peran');
  if (!sel) return;
  sel.addEventListener('change', () => {
    rancangan.peran = peranSah(sel.value);
    potAktif = null;
    gambarSemua();
    if (!$('.layar[data-layar="kondisi"]').hidden){ gambarDaftarBagian(); gambarKanan(); }
    simpanNanti();
  });
})();

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
    if (x.tipe === 'seksi' || x.tipe === 'tutup'){ kini = null; continue; }
    if (x.id === f.id) return kini;
  }
  return null;
}

function semuaField(){
  const out = [];
  const ada = {};
  const taruh = x => { if (!ada[x.kode]){ ada[x.kode] = 1; out.push(x); } };
  rancangan.tab.forEach(t => t.field.forEach(f => {
    if (!f.kode) return;
    const g = grupUlangDari(t, f);
    const tanda = { tab: t.nama, tabId: t.id, grup: g ? (g.label || 'Grup') : '', grupKode: g ? g.kode : '' };
    /* Elemen KBLI sendiri bukan variabel — yang jadi variabel adalah pecahan tiap barisnya,
       jadi ia tetap dilewati sebagai field tetapi turunannya tetap didaftarkan. */
    if (f.tipe === 'kbli'){
      pecahanKbli(f).forEach(x => taruh(Object.assign({}, x, tanda,
        { lebar:'penuh', grup: f.label || 'KBLI', grupKode: f.kode })));
      return;
    }
    if (TANPA_NILAI.includes(f.tipe)) return;
    taruh(Object.assign({}, f, tanda));
    pecahanUser(f).forEach(x => taruh(Object.assign({}, x, tanda, { lebar:'penuh' })));
    pecahanTerbilang(f).forEach(x => taruh(Object.assign({}, x, tanda, { lebar:'penuh' })));
  }));
  /* Setiap tab bermode tabel menyumbang satu variabel semu: jumlah barisnya.
     Itulah yang dipakai operator 'ada barisnya'. */
  rancangan.tab.forEach(t => {
    if (t.mode !== 'daftar') return;
    taruh({ kode:'_baris_' + t.id, label: t.nama + ' \u2014 jumlah baris', tipe:'angka',
      tab: t.nama, tabId: t.id, hitungBaris: true });
  });
  return out;
}
const fieldKode = k => semuaField().find(f => f.kode === k);
const labelKode = k => { const f = fieldKode(k); return f ? f.label : k; };

function ringkasSyarat(sy){
  if (!sy || !sy.length) return 'selalu';
  return teksSyarat(sy, labelKode);
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
  const b = bentukNilai(c.op);
  if (b === 'tanpa') return '<span class="tanpa-nilai">tidak perlu nilai</span>';
  const opsi = opsiFieldSyarat(f);
  if (b === 'daftar'){
    if (!opsi.length)
      return '<input type="text" data-s="daftar" placeholder="pisahkan dengan koma" value="' +
        esc(daftarNilai(c).join(', ')) + '">';
    const dipilih = daftarNilai(c).map(String);
    return '<span class="pil-banyak">' + opsi.map(o =>
      '<label><input type="checkbox" data-s="centang" value="' + esc(o) + '"' +
      (dipilih.indexOf(String(o)) >= 0 ? ' checked' : '') + '> ' + esc(o) + '</label>').join('') + '</span>';
  }
  if (b === 'angka')
    return '<input type="text" inputmode="decimal" data-s="nilai" placeholder="angka" value="' +
      esc(c.nilai == null ? '' : c.nilai) + '">';
  if (opsi.length)
    return '<select data-s="nilai">' + opsi.map(o =>
      '<option' + (String(o) === String(c.nilai) ? ' selected' : '') + '>' + esc(o) + '</option>').join('') + '</select>';
  return '<input type="text" data-s="nilai" value="' + esc(c.nilai == null ? '' : c.nilai) + '">';
}
function barisDasarPot(c, i, induk, g){
  const f = fieldKode(c.field);
  const ops = operatorUntuk(f);
  if (ops.indexOf(c.op) < 0) ops.unshift(c.op);      /* operator lama tetap terlihat */
  return '<div class="baris-syarat" data-i="' + i + '" data-induk="' + esc(induk) + '"' +
    (g == null ? '' : ' data-g="' + g + '"') + '>' +
    '<select data-s="field">' + pilihanFieldHtml(c.field) + '</select>' +
    '<select data-s="op">' + ops.map(o =>
      '<option value="' + esc(o) + '"' + (o === c.op ? ' selected' : '') + ' title="' +
      esc(labelOp(o)) + '">' + esc(o) + '</option>').join('') + '</select>' +
    nilaiSyaratPotHtml(c) +
    '<button class="btn btn-kecil btn-bahaya" data-s="hapus">×</button></div>';
}
function barisRefPot(c, i, induk){
  const daftar = rancangan.pustaka || [];
  return '<div class="baris-syarat baris-ref" data-i="' + i + '" data-induk="' + esc(induk) + '">' +
    '<span class="tanda-ref">Kondisi tersimpan</span>' +
    '<select data-s="ref">' + (daftar.length
      ? daftar.map(k => '<option value="' + esc(k.kode) + '"' + (k.kode === c.ref ? ' selected' : '') +
          '>' + esc(k.label || k.kode) + '</option>').join('')
      : '<option value="">(pustaka masih kosong)</option>') + '</select>' +
    '<span class="hampa" style="margin:0">' +
      esc(kondisiPustaka(c.ref) ? teksSyarat(kondisiPustaka(c.ref).syarat, labelKode) : '—') + '</span>' +
    '<button class="btn btn-kecil btn-bahaya" data-s="hapus">×</button></div>';
}
function barisSyaratPot(c, i, induk){
  if (c && c.ref) return barisRefPot(c, i, induk);
  if (!Array.isArray(c && c.grup)) return barisDasarPot(c, i, induk, null);
  let h = '<div class="grup-atau" data-i="' + i + '" data-induk="' + esc(induk) + '">' +
    '<div class="atau-kepala">Cukup salah satu' +
    '<button class="btn btn-kecil btn-bahaya kanan" data-s="hapusgrup">Hapus grup</button></div>';
  if (!c.grup.length)
    h += '<p class="hampa" style="margin:0 0 6px">Grup masih kosong — selama kosong dianggap terpenuhi.</p>';
  c.grup.forEach((g, j) => {
    if (j) h += '<div class="atau">ATAU</div>';
    h += barisDasarPot(g, i, induk, j);
  });
  h += '<button class="btn btn-kecil" data-s="tambahatau" style="margin-top:6px">+ ATAU</button></div>';
  return h;
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
    ? 'Tertulis bila semua baris terpenuhi. Grup ATAU cukup salah satu barisnya. ' +
      'Field kosong membuat semua operator salah, kecuali “tidak terisi”.'
    : 'Tanpa syarat — potongan ini selalu tertulis.') + '</p>';
  p.syarat.forEach((c,i) => {
    if (i) h += '<div class="dan">DAN</div>';
    h += barisSyaratPot(c, i, 'utama');
  });
  h += '<div class="tombol-syarat">' +
    '<button class="btn btn-kecil" data-tambahsyarat="utama">+ Syarat</button>' +
    '<button class="btn btn-kecil" data-tambahgrup="utama">+ Grup ATAU</button>' +
    '<button class="btn btn-kecil" data-tambahref="utama">+ Kondisi tersimpan</button></div></div>';

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
    h += '<div class="tombol-syarat" style="margin:2px 0 10px">' +
      '<button class="btn btn-kecil" data-tambahsyarat="slot:' + i + '">+ Syarat</button>' +
      '<button class="btn btn-kecil" data-tambahgrup="slot:' + i + '">+ Grup ATAU</button>' +
      '<button class="btn btn-kecil" data-tambahref="slot:' + i + '">+ Kondisi tersimpan</button></div>';
    h += penyuntingHtml('slot' + i, sl.teks, { pendek:true }) + '</div>';
  });
  h += '<button class="btn btn-kecil" data-tambahslot>+ Sisipan bersyarat</button></div>';

  h += '</div>';  /* ed-badan */

  /* uji */
  h += ujiHtml(p);

  box.innerHTML = h;
  pasangEditorPot(p, grup, box);
}

/* Penangan baris syarat — dipakai penyunting potongan dan penyunting Pustaka Kondisi.
   ambilSy(induk) menyerahkan array syarat yang sedang disunting; ulang() menggambar ulang. */
function pasangBarisSyarat(box, ambilSy, ulang){
  box.querySelectorAll('.baris-syarat').forEach(row => {
    const sy = ambilSy(row.dataset.induk), i = +row.dataset.i;
    if (!sy) return;
    /* baris di dalam grup ATAU membawa data-g: wadahnya grup itu, bukan daftar teratas */
    const g = row.dataset.g == null ? null : +row.dataset.g;
    const wadah = g == null ? sy : (sy[i] || {}).grup;
    const k = g == null ? i : g;
    if (!wadah || !wadah[k]) return;

    const hapus = row.querySelector('[data-s="hapus"]');
    if (hapus) hapus.addEventListener('click', () => {
      wadah.splice(k, 1);
      /* grup yang tinggal satu baris tidak lagi berarti — dijadikan baris biasa */
      if (g != null && wadah.length === 1) sy[i] = wadah[0];
      ulang();
    });

    const rf = row.querySelector('[data-s="ref"]');
    if (rf){
      rf.addEventListener('change', e => { wadah[k] = { ref: e.target.value }; ulang(); });
      return;
    }

    row.querySelector('[data-s="field"]').addEventListener('change', e => {
      const f = fieldKode(e.target.value);
      const op = opBawaan(f);
      wadah[k].field = e.target.value;
      wadah[k].op = op;
      wadah[k].nilai = bentukNilai(op) === 'daftar' ? [] : (opsiFieldSyarat(f)[0] || '');
      ulang();
    });
    row.querySelector('[data-s="op"]').addEventListener('change', e => {
      wadah[k].op = e.target.value;
      const b = bentukNilai(wadah[k].op);
      if (b === 'daftar' && !Array.isArray(wadah[k].nilai))
        wadah[k].nilai = wadah[k].nilai ? [wadah[k].nilai] : [];
      if (b !== 'daftar' && Array.isArray(wadah[k].nilai))
        wadah[k].nilai = wadah[k].nilai[0] || '';
      ulang();
    });
    const nl = row.querySelector('[data-s="nilai"]');
    if (nl) nl.addEventListener('change', e => { wadah[k].nilai = e.target.value; ulang(); });
    const dft = row.querySelector('[data-s="daftar"]');
    if (dft) dft.addEventListener('change', e => {
      wadah[k].nilai = e.target.value.split(',').map(x => x.trim()).filter(Boolean);
      ulang();
    });
    const centang = row.querySelectorAll('[data-s="centang"]');
    centang.forEach(ck => ck.addEventListener('change', () => {
      wadah[k].nilai = Array.from(centang).filter(x => x.checked).map(x => x.value);
      ulang();
    }));
  });

  box.querySelectorAll('.grup-atau').forEach(kotak => {
    const sy = ambilSy(kotak.dataset.induk), i = +kotak.dataset.i;
    if (!sy || !sy[i]) return;
    kotak.querySelector('[data-s="hapusgrup"]').addEventListener('click', () => { sy.splice(i,1); ulang(); });
    kotak.querySelector('[data-s="tambahatau"]').addEventListener('click', () => {
      const c = syaratBaru(); if (!c) return;
      (sy[i].grup = sy[i].grup || []).push(c); ulang();
    });
  });

  box.querySelectorAll('[data-tambahsyarat]').forEach(b => b.addEventListener('click', () => {
    const c = syaratBaru(); if (!c) return;
    ambilSy(b.dataset.tambahsyarat).push(c); ulang();
  }));
  box.querySelectorAll('[data-tambahgrup]').forEach(b => b.addEventListener('click', () => {
    const a = syaratBaru(), c = syaratBaru(); if (!a) return;
    ambilSy(b.dataset.tambahgrup).push({ grup: [a, c] }); ulang();
  }));
  box.querySelectorAll('[data-tambahref]').forEach(b => b.addEventListener('click', () => {
    const k = (rancangan.pustaka || [])[0];
    if (!k){ window.alert('Pustaka Kondisi masih kosong. Buat kondisi bernama dulu di menu Pustaka Kondisi.'); return; }
    ambilSy(b.dataset.tambahref).push({ ref: k.kode }); ulang();
  }));
}

/* Tampilan potongan untuk PPAT dan Asisten: syarat, perulangan, penomoran dan
   grup pilih-satu hanya terbaca; yang bisa diubah cuma tulisannya. */
function gambarEditorPotTerbatas(p, box){
  const dipakai = (rancangan.bagian || [])
    .filter(b => (b.potongan || []).includes(p.kode)).map(b => b.judul);
  let h = '<div class="pot-kunci">' +
    '<div class="pk-kep"><b>' + esc(p.judul) + '</b>' +
    '<span class="kanan"><span class="sy-kunci">' + esc(ringkasSyarat(p.syarat)) + '</span>' +
    '<span class="tanda-kunci">bawaan</span></span></div>';

  h += '<div class="pk-tubuh"><label class="j">Tulisan</label>' +
    penyuntingHtml('teks', p.teks) + peringatanVarHtml(p);

  if (p.slot && p.slot.length){
    h += '<div class="f" style="margin-top:14px"><label class="j">Sisipan bersyarat</label>' +
      '<p class="hampa">Syaratnya terkunci; tulisannya bisa diubah.</p>';
    p.slot.forEach((sl, i) => {
      h += '<div class="slot-kartu"><div class="kep">' +
        '<span class="kode-slot">[[slot:' + esc(sl.kode) + ']]</span><b>' + esc(sl.label) + '</b>' +
        '<span class="kanan"><span class="sy-kunci">' + esc(ringkasSyarat(sl.syarat)) + '</span></span></div>' +
        penyuntingHtml('slot' + i, sl.teks, { pendek:true }) + '</div>';
    });
    h += '</div>';
  }

  h += '<p class="hampa" style="margin-top:12px">Dipakai pada: ' +
    (dipakai.length ? esc(dipakai.join(', ')) : '—') + '</p>';
  h += '</div></div>';

  box.innerHTML = h;
  pasangPenyunting(box, 'teks', v => { p.teks = v; simpanNanti(); });
  (p.slot || []).forEach((sl, i) => pasangPenyunting(box, 'slot' + i,
    v => { sl.teks = v; simpanNanti(); }));
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
/* Gaya penanda daftar — sama seperti pada penyunting aplikasi asli. */
const GAYA_NOMOR = [
  ['decimal',     '1. 2. 3.'],
  ['lower-alpha', 'a. b. c.'],
  ['upper-alpha', 'A. B. C.'],
  ['lower-roman', 'i. ii. iii.'],
  ['upper-roman', 'I. II. III.'],
  ['induk',       'Ikut induk (I.1. / A.1. / a.1.)']
];
const GAYA_TITIK = [
  ['disc',   '•  bulat'],
  ['dash',   '–  strip'],
  ['circle', '◦  lingkaran'],
  ['square', '▪  kotak']
];

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
  h += '<select data-gayanomor title="Gaya penanda daftar" disabled>' +
       '<optgroup label="Daftar bernomor">' +
       GAYA_NOMOR.map(g => '<option value="' + g[0] + '">' + esc(g[1]) + '</option>').join('') +
       '</optgroup><optgroup label="Daftar titik">' +
       GAYA_TITIK.map(g => '<option value="' + g[0] + '">' + esc(g[1]) + '</option>').join('') +
       '</optgroup></select>';
  h += '<label class="mulai-no" title="Nomor awal daftar">Mulai' +
       '<input type="number" min="1" value="1" data-mulaino disabled></label>';
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
  /* Menahan mousedown menjaga sorotan teks tetap hidup saat tombol ditekan, tetapi pada
     <select> dan <input> hal itu justru menahan daftar pilihannya terbuka — jadi keduanya
     dilewati; sorotannya sudah direkam lebih dulu lewat mouseup/keyup/blur. */
  bilah.addEventListener('mousedown', ev => {
    if (ev.target.closest('select,input')) return;
    if (ev.target.closest('button')) ev.preventDefault();
  });

  bilah.addEventListener('click', async ev => {
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
      const u = (await tanyaIsian('Sisipkan tautan',
        [{ kunci:'url', label:'Alamat tautan', nilai:'https://' }]) || {}).url;
      if (u) perintah('createLink', u);
      return;
    }
    if (a === 'gambar'){
      const u = (await tanyaIsian('Sisipkan gambar',
        [{ kunci:'url', label:'Alamat gambar (URL)', nilai:'https://' }]) || {}).url;
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
    segarkanDaftar();
  });

  sumber.addEventListener('input', () => { isi.innerHTML = sumber.value; simpan(sumber.value); });

  const selUk = bilah.querySelector('[data-ukuran]');
  if (selUk) selUk.addEventListener('change', () => ukuranHuruf(selUk.value));
  /* ---- gaya penanda daftar ---- */
  function daftarTerdekat(){
    const sel = window.getSelection();
    let n = (sel && sel.rangeCount) ? sel.getRangeAt(0).startContainer
          : (simpanan ? simpanan.startContainer : null);
    if (!n || !isi.contains(n)) n = simpanan ? simpanan.startContainer : null;
    if (!n || !isi.contains(n)) return null;
    if (n.nodeType === 3) n = n.parentNode;
    while (n && n !== isi && n.tagName !== 'OL' && n.tagName !== 'UL') n = n.parentNode;
    return (n && n !== isi) ? n : null;
  }
  function gayaInduk(l){
    let p = l.parentNode;
    while (p && p !== isi && p.tagName !== 'OL') p = p.parentNode;
    if (!p || p.tagName !== 'OL') return 'decimal';
    return p.style.listStyleType || getComputedStyle(p).listStyleType || 'decimal';
  }
  const selGaya  = bilah.querySelector('[data-gayanomor]');
  const inpMulai = bilah.querySelector('[data-mulaino]');
  function segarkanDaftar(){
    const l = daftarTerdekat();
    if (selGaya)  selGaya.disabled  = !l;
    if (inpMulai) inpMulai.disabled = !l || l.tagName !== 'OL';
    if (!l) return;
    if (selGaya){
      selGaya.value = l.classList.contains('ol-induk') ? 'induk'
        : (l.style.listStyleType || '').indexOf('-') >= 0 ? 'dash'
        : (l.style.listStyleType || (l.tagName === 'OL' ? 'decimal' : 'disc'));
    }
    if (inpMulai && l.tagName === 'OL') inpMulai.value = l.getAttribute('start') || '1';
  }
  if (selGaya) selGaya.addEventListener('change', () => {
    pulih();
    const l = daftarTerdekat();
    if (!l) return;
    const v = selGaya.value;
    l.classList.remove('ol-induk');
    l.style.removeProperty('--gaya-induk');
    if (v === 'induk'){
      if (l.tagName !== 'OL') return;
      l.classList.add('ol-induk');
      l.style.listStyleType = '';
      l.style.setProperty('--gaya-induk', gayaInduk(l));
    } else if (v === 'dash'){
      l.style.listStyleType = '"-  "';
    } else {
      l.style.listStyleType = v;
    }
    rekam(); ubah(); segarkanDaftar();
  });
  if (inpMulai) inpMulai.addEventListener('change', () => {
    pulih();
    const l = daftarTerdekat();
    if (!l || l.tagName !== 'OL') return;
    const n = Math.max(1, parseInt(inpMulai.value, 10) || 1);
    inpMulai.value = n;
    if (n === 1) l.removeAttribute('start'); else l.setAttribute('start', n);
    rekam(); ubah();
  });
  isi.addEventListener('keyup', segarkanDaftar);
  isi.addEventListener('mouseup', segarkanDaftar);
  segarkanDaftar();

  const selSp = bilah.querySelector('[data-spasi]');
  if (selSp) selSp.addEventListener('change', () => {
    pulih();
    blokTerpilih().forEach(el => { el.style.lineHeight = selSp.value || ''; });
    ubah();
  });

  box.querySelectorAll('[data-sisip],[data-sisip-blok]').forEach(x =>
    x.addEventListener('mousedown', ev => ev.preventDefault()));
  box.querySelectorAll('[data-sisip]').forEach(x => x.addEventListener('click', () => {
    perintah('insertText', '{{' + x.dataset.sisip + '}}');
  }));
  box.querySelectorAll('[data-sisip-blok]').forEach(x => x.addEventListener('click', () => {
    const k = x.dataset.sisipBlok;
    const contoh = (semuaField().find(f => f.dari === k) || {}).kode || (k + '_kode');
    perintah('insertText', '[[ulang:' + k + ']]{{' + contoh + '}};[[/ulang]]');
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
  }).join('') + blokUlangHtml();
}
/* Lingkup berulang bukan variabel tunggal — disediakan sebagai blok yang dibungkus di
   sekeliling satu baris redaksi, supaya barisnya ditulis sekali untuk tiap isian. */
function blokUlangHtml(){
  const g = semuaGrupUlang();
  if (!g.length) return '';
  return '<div class="gv">Blok berulang</div>' +
    '<p class="hampa" style="margin:0 0 7px;font-size:11px">Bungkus satu baris redaksi dengan blok ' +
    'ini; baris itu ditulis sekali untuk tiap isian. Letakkan di dalam <b>satu butir daftar</b> ' +
    '(tekan Tab untuk membuat sub-butir) dan butir itulah yang berulang, jadi hasilnya sub-daftar ' +
    'bernomor sendiri. Di dalamnya tersedia <code>{{nomor_baris}}</code> dan ' +
    '<code>{{huruf_baris}}</code> bila penomorannya mau diketik sendiri.</p>' +
    '<div class="chips-var">' + g.map(x => '<button data-sisip-blok="' + esc(x.kode) + '" title="' +
      esc(x.label + ' — ' + x.tab) + '">[[ulang:' + esc(x.kode) + ']]</button>').join('') + '</div>';
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

  pasangBarisSyarat(box, ambilSy, ulang);

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
    const kunci = false;
    const sub = b.jenis === 'otomatis'
      ? '<div class="sb">' + (kunci ? 'Bagian otomatis · terkunci' : 'Kondisi · disusun sistem<br>judul disembunyikan') +
        '</div>' : '';
    const i = rancangan.bagian.indexOf(b);
    return '<div class="bagian-item' + (bagianAktif === b.id ? ' aktif' : '') +
      (kunci ? ' terkunci' : '') + '" data-bagian="' + b.id + '"' +
      (kunci ? '' : ' draggable="true" title="Seret untuk memindahkan"') + '>' +
      (kunci
        ? '<span class="geser"><span class="gembok" title="Urutan dan syaratnya terkunci">' +
          SVG('<rect x="3.2" y="7" width="9.6" height="6.4" rx="1.2"/><path d="M5.6 7V5.2a2.4 2.4 0 0 1 4.8 0V7"/>') +
          '</span></span>'
        : '<span class="geser">' +
        '<button type="button" data-geser="naik" title="Naikkan"' + (i === 0 ? ' disabled' : '') + '>↑</button>' +
        '<button type="button" data-geser="turun" title="Turunkan"' +
          (i === rancangan.bagian.length - 1 ? ' disabled' : '') + '>↓</button></span>') +
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
  if (t === 'skenario')  return gambarPanelSkenario();
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
  const bebas = true;
  let h = '<div class="ed-kepala">' +
      (bebas
        ? '<input type="text" class="judul-input" data-bj value="' + esc(b.judul) + '">'
        : '<span class="judul-kunci">' + esc(b.judul) + '</span>') +
      '<span class="lencana">Bagian Otomatis</span>' +
      (bebas
        ? '<span class="kanan"><button class="btn btn-kecil" data-tambahpot>+ Potongan</button>' +
          '<button class="btn btn-kecil btn-bahaya" data-hapusbagian>Hapus bagian</button></span>'
        : '<span class="kanan"><span class="tanda-kunci">terkunci</span></span>') + '</div>' +
    '<div class="ed-badan" style="padding-bottom:0">' +
    '<p class="hampa">' + (bebas
      ? 'Struktur dan syaratnya disusun di sini. Di tenant, kantor hanya melihat syaratnya ' +
        'sebagai keterangan terkunci dan menyunting tulisannya saja.'
      : 'Bagian Otomatis — struktur, syarat tampil, dan urutannya terkunci. Klik potongan untuk ' +
        'menyunting tulisannya.') + '</p>' +
    (bebas ? pengaturUlangBagianHtml(b) : '') + daftarPotHtml(b) + '</div>';
  box.innerHTML = h;

  if (bebas){
    box.querySelector('[data-bj]').addEventListener('input', e => {
      b.judul = e.target.value; gambarDaftarBagian(); simpanNanti();
    });
    box.querySelector('[data-hapusbagian]').addEventListener('click', () => hapusBagian(b.id));
  }
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
  const tbhPot = box.querySelector('[data-tambahpot]');
  if (tbhPot) tbhPot.addEventListener('click', () => {
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
    '<p class="hampa" style="margin:0 0 10px">Variabel global — tidak berasal dari formulir order ' +
    'mana pun, jadi bisa dipakai di bagian template apa saja, termasuk bagian yang tidak berulang. ' +
    'Yang bertanda <b>bawaan</b> selalu ada dan kodenya tetap; identitas kantor diatur terpisah di ' +
    'layar <b>Profil Kantor</b>.</p>' +
    '<div class="tabel-bungkus"><table class="tabel-vardok"><thead><tr>' +
    '<th>Variabel</th><th>Keterangan</th><th>Isi</th><th></th></tr></thead><tbody>' +
    (rancangan.varDokumen || []).map((v,i) => {
      if (v.kelompok === 'kantor') return '';
      const kunci = !!v.bawaan;
      return '<tr><td>' + (kunci
          ? '<code class="kode-tetap">{{' + esc(v.kode) + '}}</code>' +
            '<span class="tanda-bawaan">bawaan</span>'
          : '<input type="text" class="kode" data-vd="kode" data-i="' + i + '" value="' + esc(v.kode) + '">') + '</td>' +
        '<td><input type="text" data-vd="label" data-i="' + i + '" value="' + esc(v.label) + '"></td>' +
        '<td>' + (kunci
          ? (v.otomatis
              ? '<span class="hampa">' + esc((OTOMATIS_VAR.find(o => o[0] === v.otomatis) || ['',''])[1]) + '</span>'
              : '<input type="text" data-vd="nilai" data-i="' + i + '" value="' + esc(v.nilai) + '">')
          : '<select data-vd="otomatis" data-i="' + i + '">' +
            OTOMATIS_VAR.map(o => '<option value="' + o[0] + '"' + (v.otomatis === o[0] ? ' selected' : '') +
              '>' + o[1] + '</option>').join('') + '</select>' +
            (v.otomatis ? '' : '<input type="text" data-vd="nilai" data-i="' + i + '" value="' + esc(v.nilai) +
              '" style="margin-top:6px">')) + '</td>' +
        '<td>' + (kunci ? '' : '<button class="btn btn-kecil btn-bahaya" data-vd-hapus="' + i + '">×</button>') +
        '</td></tr>';
    }).join('') +
    '</tbody></table></div>' +
    '<button class="btn btn-kecil" data-vd-tambah style="margin-top:9px">+ Variabel dokumen</button>' +
    '<p class="hampa" style="margin:10px 0 0">Identitas kantor — nama, gelar disingkat dan tidak ' +
    'disingkat, SK, wilayah, kontak — diisi di layar <b>Profil Kantor</b> dan tersedia di sini ' +
    'sebagai variabel global juga.</p></div>' +
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
      if (v.kelompok === 'kantor') gambarKartuKantor();
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
function userById(id){
  const k = String(id == null ? '' : id).trim().toLowerCase();
  if (!k) return null;
  const d = window.USER_CONTOH || [];
  return d.find(u => String(u.id).toLowerCase() === k) ||
         d.find(u => String(u.nama).toLowerCase() === k) || null;
}
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
let catatanRakit = [];
function catat(t){ if (catatanRakit.indexOf(t) < 0) catatanRakit.push(t); }

function konteksBaris(tab, row){
  const c = {};
  (tab.field || []).forEach(f => {
    if (TANPA_NILAI.includes(f.tipe) || !f.kode) return;
    if (f.tipe === 'kbli') return;                       /* ditangani sebagai lingkup berulang */
    const mentah = row[f.kode] == null ? '' : row[f.kode];
    if (f.tipe === 'user'){
      const u = userById(mentah);
      if (!u && mentah)
        catat('Baris di tab ' + tab.nama + ': isian “' + f.label + '” bernilai “' + mentah +
          '” tetapi tidak cocok dengan user mana pun, jadi seluruh variabel identitasnya kosong.');
      else if (!u && f.wajib)
        catat('Baris di tab ' + tab.nama + ': isian “' + f.label + '” belum dipilih, jadi seluruh ' +
          'variabel identitasnya kosong.');
      c[f.kode] = u ? u.nama : '';
      const aw = (f.awalan || '').trim();
      const pilihPaket = Array.isArray(f.paket) ? f.paket : PAKET_SEMUA;
      const kembar = sesamaPaket(f, tab);
      if (!u && kembar.length){
        const nama = kembar.map(x => x.label || x.kode).concat([f.label || f.kode]).sort();
        catat('Di tab ' + tab.nama + ', isian “' + nama.join('” dan “') + '” sama-sama Referensi user ' +
          'dengan awalan yang sama, jadi keduanya menghasilkan {{nama}}, {{nik}}, dan seterusnya yang ' +
          'sama. Beri salah satunya Awalan variabel di Form Design agar tidak saling menimpa.');
      }
      PAKET_ORANG.forEach(x => {
        if (!pilihPaket.includes(x[0])) return;
        const kv = (aw ? aw + '.' : '') + x[0];
        const nilai = nilaiPaketOrang(u, x[0]);
        /* field Referensi user yang tidak terisi tidak boleh menghapus isi kembarannya */
        if (nilai === '' && c[kv]) return;
        c[kv] = nilai;
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
  ['',          'Nilai tetap di bawah'],
  ['hari',      'Nama hari saat dokumen dibuat'],
  ['tanggal',   'Tanggal saat dokumen dibuat'],
  ['terbilang', 'Tanggal terbilang saat dokumen dibuat'],
  ['pukul',     'Pukul saat dokumen dibuat'],
  ['terbilangPukul', 'Pukul terbilang saat dokumen dibuat']
];
/* pukul dalam huruf: 10.00 -> "sepuluh", 10.15 -> "sepuluh lewat lima belas menit" */
function terbilangPukul(jam, menit){
  const j = terbilang(jam);
  return menit ? j + ' lewat ' + terbilang(menit) + ' menit' : j;
}
function konteksDokumen(){
  const d = new Date();
  const iso = d.toISOString().slice(0,10);
  const jam = String(d.getHours()).padStart(2,'0') + '.' + String(d.getMinutes()).padStart(2,'0');
  const mentah = k => {
    const v = (rancangan.varDokumen || []).find(x => x.kode === k);
    return v && v.nilai != null ? String(v.nilai) : '';
  };
  const gabung = (a, b) => [a, b].map(x => String(x || '').trim()).filter(Boolean).join(', ');
  const c = {};
  (rancangan.varDokumen || []).forEach(v => {
    if (!v.kode) return;
    switch (v.otomatis){
      case 'hari':             c[v.kode] = HARI[d.getDay()]; break;
      case 'tanggal':          c[v.kode] = tglID(iso); break;
      case 'terbilang':        c[v.kode] = terbilangTanggal(iso); break;
      case 'pukul':            c[v.kode] = jam; break;
      case 'terbilangPukul':   c[v.kode] = terbilangPukul(d.getHours(), d.getMinutes()); break;
      case 'namaGelar':        c[v.kode] = gabung(mentah('notaris_nama'), mentah('notaris_gelar')); break;
      case 'namaGelarPanjang': c[v.kode] = gabung(mentah('notaris_nama'), mentah('notaris_gelar_panjang')); break;
      case 'tanggalNilai':     c[v.kode] = tglID(v.nilai || ''); break;
      case 'terbilangDari':    c[v.kode] = terbilangTanggal(mentah(v.dari || '')); break;
      default:                 c[v.kode] = v.nilai == null ? '' : String(v.nilai);
    }
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
    if (!(kunci in ctx)){
      const lingkup = semuaGrupUlang().find(g => g.kode === kunci);
      if (lingkup){
        catat('{{' + kunci + '}} adalah lingkup berulang (' + lingkup.label + ' di tab ' + lingkup.tab +
          '), bukan satu variabel — isinya bisa lebih dari satu baris. Bungkus barisnya dengan blok ' +
          '[[ulang:' + kunci + ']] … [[/ulang]] di dalam redaksi, atau pakai Bagian Otomatis dengan ' +
          'Diulang atas → ' + lingkup.label + '.');
        return '<span class="rk-hampa" title="' + esc(kunci) + ' adalah lingkup berulang">⟨' +
          esc(kunci) + '⟩</span>';
      }
      const asal = semuaField().find(x => x.kode === kunci);
      catat(asal
        ? 'Variabel {{' + kunci + '}} berasal dari “' + asal.label + '” di tab ' + asal.tab +
          (asal.grup ? ' (di dalam ' + asal.grup + ')' : '') + ', yang tidak terjangkau dari bagian ini. ' +
          'Setel “Diulang atas” pada potongan atau bagiannya ke lingkup tersebut.'
        : 'Variabel {{' + kunci + '}} tidak dihasilkan formulir mana pun — periksa kodenya di Form Design.');
    }
    const v = ctx[kunci];
    if (v == null || v === '') return '<span class="rk-hampa" title="' + esc(kunci) + ' belum terisi">⟨' +
      esc(kunci) + '⟩</span>';
    return esc(v);
  });
}
/* Blok berulang di dalam redaksi:  [[ulang:kode]] … [[/ulang]]
   Isinya ditulis sekali untuk tiap baris lingkup itu, memakai konteks barisnya sendiri.
   Di dalam blok tersedia {{nomor_baris}} dan {{huruf_baris}} sebagai penomoran. */
const RE_ULANG = /\[\[ulang:([A-Za-z0-9_]+)\]\]([\s\S]*?)\[\[\/ulang\]\]/g;
const NILAI_ROMAWI = [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],
  [50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
const romawiKe = n => NILAI_ROMAWI.reduce((t, [v, h]) => { while (n >= v){ t += h; n -= v; } return t; }, '');
const hurufKe = n => {
  let t = '';
  while (n > 0){ n--; t = String.fromCharCode(97 + (n % 26)) + t; n = Math.floor(n / 26); }
  return t;
};
/* Penanda yang diketik di dalam satu butir daftar, satu paragraf, atau satu baris tabel
   diangkat keluar dari pembungkusnya, supaya yang diulang adalah butirnya — bukan isi di
   dalam satu butir. Dengan begitu satu sub-butir di editor menjadi sub-daftar bernomor. */
function angkatPenandaUlang(html){
  return String(html).replace(
    /<(li|p|tr|div)\b([^>]*)>\s*\[\[ulang:([A-Za-z0-9_]+)\]\]([\s\S]*?)\[\[\/ulang\]\]\s*<\/\1>/gi,
    (m, tag, atr, kode, isi) =>
      '[[ulang:' + kode + ']]<' + tag + atr + '>' + isi + '</' + tag + '>[[/ulang]]');
}
function rakitIsi(html, ctx){
  const src = angkatPenandaUlang(String(html == null ? '' : html));
  if (src.indexOf('[[ulang:') < 0) return gantiVar(src, ctx);
  const re = new RegExp(RE_ULANG.source, 'g');
  let keluar = '', mulai = 0, m;
  while ((m = re.exec(src)) !== null){
    keluar += gantiVar(src.slice(mulai, m.index), ctx);
    const baris = lingkupBaris(m[1], ctx);
    if (!baris.length)
      catat('Blok berulang [[ulang:' + m[1] + ']] tidak menemukan satu baris pun — belum ada isian ' +
        'pada lingkup itu di layar Order, atau kodenya tidak cocok dengan elemen berulang mana pun.');
    keluar += baris.map((r, i) => gantiVar(m[2], Object.assign({}, r.ctx, {
      nomor_baris: String(i + 1), angka_baris: String(i + 1),
      huruf_baris: hurufKe(i + 1), romawi_baris: romawiKe(i + 1)
    }))).join('');
    mulai = re.lastIndex;
  }
  return keluar + gantiVar(src.slice(mulai), ctx);
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
    ? (lolosSyarat(b.slot.syarat, ctx) ? rakitIsi(b.slot.teks, ctx) : '')
    : rakitIsi(b.t, ctx)).join('');
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
      jejakPot[p.kode] = 1;
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
    jejakPot[p.kode] = 1;
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
          jejakPot[p.kode] = 1;
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

/* Syarat yang menguji sebuah nilai yang tidak ada di daftar pilihan fieldnya tidak akan pernah
   terpenuhi — biasanya karena daftar opsi diubah setelah syaratnya ditulis. */
function periksaNilaiSyarat(){
  const opsiDari = {};
  rancangan.tab.forEach(t => (t.field || []).forEach(f => {
    if (!f.kode) return;
    if (f.tipe === 'pilihan' || f.tipe === 'segmented') opsiDari[f.kode] = (f.opsi || []).slice();
    else if (f.tipe === 'yatidak') opsiDari[f.kode] = ['Ya', 'Tidak'];
  }));
  /* satu baris dasar: nilai yang diuji harus ada di daftar pilihan fieldnya */
  const ujiDasar = (c, dimana, dalamGrup) => {
    if (!c || !c.field) return;
    const bentuk = bentukNilai(c.op);
    if (bentuk === 'tanpa') return;
    const o = opsiDari[c.field];
    if (!o || !o.length) return;
    const ekor = dalamGrup
      ? ', tetapi grup ATAU-nya masih bisa terpenuhi lewat baris lain.'
      : '. Syarat itu tidak akan pernah terpenuhi.';
    const salah = (bentuk === 'daftar' ? daftarNilai(c) : [c.nilai])
      .filter(v => v != null && v !== '' && o.indexOf(String(v)) < 0);
    if (!salah.length) return;
    catat('Syarat pada ' + dimana + ' menguji ' + c.field + ' = “' + salah.join('”, “') +
      '”, padahal pilihan yang tersedia hanya “' + o.join('”, “') + '”' + ekor);
  };
  const uji = (sy, dimana, jejak) => (sy || []).forEach(c => {
    if (!c) return;
    if (c.ref){
      const k = kondisiPustaka(c.ref);
      if (!k){
        catat('Syarat pada ' + dimana + ' merujuk kondisi tersimpan “' + c.ref +
          '” yang sudah tidak ada di Pustaka Kondisi. Rujukan yang hilang diabaikan, ' +
          'jadi potongannya tetap tertulis.');
        return;
      }
      const l = jejak || {};
      if (l[c.ref]){
        catat('Kondisi tersimpan “' + (k.label || k.kode) + '” merujuk dirinya sendiri ' +
          '(berputar). Putaran itu dihentikan dan dianggap terpenuhi — perbaiki definisinya.');
        return;
      }
      const l2 = Object.assign({}, l); l2[c.ref] = 1;
      uji(k.syarat, 'kondisi tersimpan “' + (k.label || k.kode) + '”', l2);
      return;
    }
    if (Array.isArray(c.grup)){
      if (!c.grup.length){
        catat('Ada grup ATAU yang masih kosong pada ' + dimana +
          '. Grup kosong diabaikan, jadi ia tidak membatasi apa pun.');
        return;
      }
      c.grup.forEach(g => ujiDasar(g, dimana, true));
      return;
    }
    ujiDasar(c, dimana, false);
  });
  (rancangan.potongan || []).forEach(p => {
    uji(p.syarat, 'potongan “' + (p.judul || p.kode) + '”');
    (p.slot || []).forEach(sl => uji(sl.syarat, 'sisipan “' + (sl.label || sl.kode) + '”'));
  });
  rancangan.tab.forEach(t => (t.field || []).forEach(f =>
    uji(f.tampilBila, 'elemen “' + (f.label || f.kode) + '” di tab ' + t.nama)));
}

/* Diisi rakitAkta: kode potongan yang benar-benar tertulis pada perakitan
   terakhir. Dipakai laporan cakupan Skenario Uji. */
let jejakPot = {};
function rakitAkta(){
  catatanRakit = [];
  jejakPot = {};
  periksaNilaiSyarat();
  const global = Object.assign({}, konteksDokumen());
  rancangan.tab.forEach(t => {
    if (t.mode === 'formulir') Object.assign(global, konteksBaris(t, nilaiForm[t.id] || {}));
  });
  rancangan.tab.forEach(t => {
    if (t.mode === 'daftar') global['_baris_' + t.id] = String((barisPv[t.id] || []).length);
  });

  const menang = {};
  const bagianKosong = [];
  let html = '', jumlahPotongan = 0, jumlahHampa = 0;

  (rancangan.bagian || []).forEach(b => {
    if (b.jenis !== 'otomatis'){
      html += '<div class="rk-bagian"><div class="rk-judul">' + esc(b.judul) + '</div>' +
        '<div class="rk-teks">' + rakitIsi(b.teks || '', global) + '</div></div>';
      return;
    }
    const hasilBagian = b.ulang
      ? rakitBagianBerulang(b, global, menang)
      : rakitBagianBebas(b, global, menang);
    const isi = hasilBagian.html;
    jumlahPotongan += hasilBagian.jumlah;
    jumlahHampa += hasilBagian.hampa;
    if (!isi) bagianKosong.push(b.judul);
    html += '<div class="rk-bagian oto">' + (isi ||
      '<div class="rk-lewat">Seluruh potongan pada bagian “' + esc(b.judul) +
      '” tidak memenuhi syarat, jadi bagian ini kosong.</div>') + '</div>';
  });

  return { html, jumlahPotongan, jumlahHampa, bagianKosong };
}
/* =====================================================================
   Minuta — ruang kerja drafting. Struktur dan syarat datang dari Template
   Akta dan terkunci di sini; yang bisa disentuh hanya tulisannya.
   ===================================================================== */
let mnBagian = null, mnTab = 'naskah';

/* Minuta selalu merakit template yang dipakai order, bukan template yang
   kebetulan sedang dibuka di layar Template Akta. */
function pakaiTemplateOrder(){
  const T = templateOrder();
  if (T && T.id !== termuatTemplate) pakaiTemplate(T.id);
}

function gambarMinuta(){
  pakaiTemplateOrder();
  if (!Array.isArray(rancangan.bagian)) rancangan.bagian = [];
  if (!mnBagian || !rancangan.bagian.some(b => b.id === mnBagian))
    mnBagian = rancangan.bagian.length ? rancangan.bagian[0].id : null;
  gambarMinutaDaftar();
  gambarMinutaKanan();
  const T = templateOrder(), L = layananIni();
  const lc = $('#mn-lencana');
  if (lc) lc.textContent = T ? T.kode : '—';
  const nm = $('#minuta-nama') || $('.layar[data-layar="minuta"] .bj-nama');
  if (nm) nm.textContent = 'Minuta ' + (L ? L.kode : '') + ' · ' + (T ? T.nama : 'tanpa template');
}

function gambarMinutaDaftar(){
  let no = 0;
  const kartu = rancangan.bagian.map(b => {
    const nomor = b.jenis === 'pasal' ? String(++no) : (b.jenis === 'otomatis' ? '⚙' : '▤');
    const kelas = b.jenis === 'pasal' ? '' : (b.jenis === 'otomatis' ? ' oto' : ' cat');
    const kunci = b.jenis === 'otomatis';
    const i = rancangan.bagian.indexOf(b);
    return '<div class="bagian-item' + (mnBagian === b.id ? ' aktif' : '') + (kunci ? ' terkunci' : '') +
      '" data-mnbagian="' + b.id + '">' +
      (kunci
        ? '<span class="geser"><span class="gembok" title="Disusun di Template Akta — terkunci">' +
          SVG('<rect x="3.2" y="7" width="9.6" height="6.4" rx="1.2"/><path d="M5.6 7V5.2a2.4 2.4 0 0 1 4.8 0V7"/>') +
          '</span></span>'
        : '<span class="geser">' +
          '<button type="button" data-mngeser="naik" title="Naikkan"' + (i === 0 ? ' disabled' : '') + '>↑</button>' +
          '<button type="button" data-mngeser="turun" title="Turunkan"' +
            (i === rancangan.bagian.length - 1 ? ' disabled' : '') + '>↓</button></span>') +
      '<span class="no' + kelas + '">' + nomor + '</span>' +
      '<span class="tk"><span class="jd">' + esc(b.judul) + '</span>' +
        (kunci ? '<div class="sb">Bagian otomatis · terkunci</div>' : '') + '</span>' +
      '<span class="mata">◉</span></div>';
  }).join('');
  $('#mn-daftar').innerHTML = kartu || '<div class="kosong-panel">Belum ada bagian.</div>';
  $('#mn-n').textContent = '(' + rancangan.bagian.length + ')';

  $$('#mn-daftar [data-mngeser]').forEach(tb => tb.addEventListener('click', ev => {
    ev.stopPropagation();
    pindahBagian(tb.closest('[data-mnbagian]').dataset.mnbagian, tb.dataset.mngeser === 'naik' ? -1 : 1);
    gambarMinuta();
  }));
  $$('#mn-daftar [data-mnbagian]').forEach(el => el.addEventListener('click', () => {
    mnBagian = el.dataset.mnbagian; potAktif = null; mnTab = 'tulisan';
    gambarMinuta();
  }));
}

function gambarMinutaKanan(){
  $$('[data-mtab]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.mtab === mnTab)));
  $$('[data-mpane]').forEach(x => { x.hidden = x.dataset.mpane !== mnTab; });
  if (mnTab === 'naskah') gambarMinutaNaskah();
  else gambarMinutaTulisan();
}

function gambarMinutaNaskah(){
  const hasil = rakitAkta();
  const jumlahBaris = rancangan.tab.map(t => t.mode === 'daftar'
    ? t.nama + ' ' + ((barisPv[t.id] || []).length) : null).filter(Boolean).join(' · ');
  const ket = $('#mn-ket');
  if (ket) ket.textContent = (jumlahBaris || 'Belum ada baris yang diisi') + ' · ' +
    hasil.jumlahPotongan + ' potongan tertulis' +
    (hasil.jumlahHampa ? ' · ' + hasil.jumlahHampa + ' variabel belum terisi' : '');
  $('#mn-naskah').innerHTML =
    (catatanRakit.length
      ? '<div class="rk-diagnosa"><b>Kenapa ada yang kosong</b><ul>' +
        catatanRakit.slice(0, 8).map(t => '<li>' + esc(t) + '</li>').join('') + '</ul></div>'
      : '') +
    '<div class="rk-kertas">' + hasil.html + '</div>';
}

function gambarMinutaTulisan(){
  const box = $('#mn-tulisan');
  const b = rancangan.bagian.find(x => x.id === mnBagian);
  if (!b){
    box.innerHTML = '<div class="kosong-kanan"><div class="bulat">✎</div>' +
      'Pilih bagian di panel kiri untuk menyunting tulisannya.</div>';
    return;
  }
  if (b.jenis !== 'otomatis'){
    box.innerHTML = '<div class="ed-kepala">' +
        '<input type="text" class="judul-input" data-mnj value="' + esc(b.judul) + '">' +
        '<span class="lencana">' + (b.jenis === 'pasal' ? 'Pasal' : 'Catatan') + '</span>' +
        '<span class="kanan"><button class="btn btn-kecil btn-bahaya" data-mnhapus>Hapus bagian</button></span></div>' +
      '<div class="ed-badan"><div class="f"><label class="j">Tulisan</label>' +
        penyuntingHtml('bagian', b.teks || '') +
        '<p class="hampa" style="margin-top:6px">Tidak berkondisi — selalu tertulis apa adanya.</p></div></div>';
    box.querySelector('[data-mnj]').addEventListener('input', e => {
      b.judul = e.target.value; gambarMinutaDaftar(); simpanNanti();
    });
    box.querySelector('[data-mnhapus]').addEventListener('click', () => {
      if (!window.confirm('Hapus bagian \u201c' + b.judul + '\u201d?')) return;
      rancangan.bagian = rancangan.bagian.filter(x => x.id !== b.id);
      mnBagian = null; nomorUlangPasal(); gambarMinuta(); simpanNanti();
    });
    pasangPenyunting(box, 'bagian', v => { b.teks = v; simpanNanti(); });
    return;
  }

  b.potongan = b.potongan || [];
  if (!potAktif || !b.potongan.includes(potAktif)) potAktif = b.potongan[0] || null;
  bagianAktif = b.id;   /* dipakai kartuPot untuk menandai cara tulisnya */
  box.innerHTML = '<div class="ed-kepala">' +
      '<span class="judul-kunci">' + esc(b.judul) + '</span>' +
      '<span class="lencana">Bagian Otomatis</span>' +
      '<span class="kanan"><span class="tanda-kunci">terkunci</span></span></div>' +
    '<div class="ed-badan" style="padding-bottom:0">' +
    '<p class="hampa">Struktur, syarat tampil, dan urutannya disusun di Template Akta dan terkunci ' +
    'di sini. Klik potongan untuk menyunting tulisannya.</p>' + daftarPotHtml(b) + '</div>' +
    '<div id="mn-editor-pot"></div>';
  box.querySelectorAll('.pot').forEach(el => el.addEventListener('click', () => {
    potAktif = el.dataset.kode; gambarMinutaTulisan();
  }));
  const p = rancangan.potongan.find(x => x.kode === potAktif && b.potongan.includes(x.kode));
  const wadah = box.querySelector('#mn-editor-pot');
  if (p) gambarEditorPotTerbatas(p, wadah);
  else wadah.innerHTML = '<div class="kosong-kanan"><div class="bulat">✎</div>' +
    'Pilih potongan di atas untuk menyunting tulisannya.</div>';
}

$$('[data-mtab]').forEach(b => b.addEventListener('click', () => {
  mnTab = b.dataset.mtab; gambarMinutaKanan();
}));
$('#mn-rakit-ulang').addEventListener('click', () => { mnTab = 'naskah'; gambarMinutaKanan(); });
$('[data-ke-order]').addEventListener('click', () => { orBuka = true; pilihMode('pratinjau'); });
$('#mn-tambah-pasal').addEventListener('click', () => {
  tambahBagian('pasal'); mnBagian = bagianAktif; mnTab = 'tulisan'; gambarMinuta();
});
$('#mn-tambah-catatan').addEventListener('click', () => {
  tambahBagian('catatan'); mnBagian = bagianAktif; mnTab = 'tulisan'; gambarMinuta();
});

function bukaRakit(){
  const hasil = rakitAkta();
  const jumlahBaris = rancangan.tab.map(t => t.mode === 'daftar'
    ? t.nama + ' ' + ((barisPv[t.id] || []).length) : null).filter(Boolean).join(' · ');
  $('#rk-sub').textContent = jumlahBaris || 'Belum ada baris yang diisi';
  $('#rk-isi').innerHTML = '<div class="rk-kertas">' + hasil.html + '</div>';
  $('#rk-catatan').innerHTML = hasil.jumlahPotongan + ' potongan tertulis' +
    (hasil.jumlahHampa ? ' · <b>' + hasil.jumlahHampa + '</b> variabel belum terisi (ditandai ⟨…⟩)' : '');
  const box = $('#rk-isi');
  if (catatanRakit.length){
    box.insertAdjacentHTML('afterbegin', '<div class="rk-diagnosa"><b>Kenapa ada yang kosong</b>' +
      '<ul>' + catatanRakit.slice(0, 8).map(t => '<li>' + esc(t) + '</li>').join('') + '</ul></div>');
  }
  $('#tirai-rakit').hidden = false;
}
$('#btn-rakit').addEventListener('click', () => { pilihMode('minuta'); });
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
/* ---------- impor / ekspor FORMULIR saja ----------
   Kebalikan dari impor template: hanya menukar rancangan formulir layanan yang
   sedang dibuka, sementara template naskahnya sama sekali tidak disentuh. */
function bentukFormulir(){
  const L = layananIni();
  return {
    jenis: 'formulir-engine',
    versi: 1,
    layanan: { kode: L ? L.kode : '', nama: L ? L.nama : '' },
    tab: JSON.parse(JSON.stringify(rancangan.tab || []))
  };
}
async function imporFormulir(){
  if (!api.impor){ $('#status').textContent = 'impor hanya tersedia di aplikasi'; return; }
  const d = await api.impor();
  if (!d) return;
  if (!d || !Array.isArray(d.tab) || !d.tab.length){
    $('#status').textContent = 'berkas itu bukan rancangan formulir — tidak ada tab di dalamnya';
    return;
  }
  const L = layananIni();
  if (!L){ $('#status').textContent = 'belum ada layanan yang dibuka'; return; }
  const nField = d.tab.reduce((n, t) => n + ((t.field || []).length), 0);
  if (!window.confirm('Ganti rancangan formulir layanan “' + L.nama + '” dengan ' + d.tab.length +
      ' tab / ' + nField + ' elemen dari berkas ini?\n\nTemplate naskahnya tidak ikut berubah.')) return;

  L.tab = JSON.parse(JSON.stringify(d.tab));
  rancangan.tab = L.tab;
  termuatLayanan = L.id;
  if (d.layanan){
    if (d.layanan.kode) L.kode = d.layanan.kode;
    if (d.layanan.nama) L.nama = d.layanan.nama;
  }
  /* isian order layanan ini tidak lagi cocok dengan formulirnya */
  (rancangan.order || []).forEach(O => { if (O.layanan === L.id){ O.baris = {}; O.form = {}; } });
  termuatOrder = null;
  pakaiOrder(rancangan.orderAktif);
  rancangan.tab.forEach(t => {
    if (!Array.isArray(t.field)) t.field = [];
    t.field.forEach(f => { if (typeof f.diGrid !== 'boolean') f.diGrid = !!f.kolom; });
  });
  tabAktif = 0; pilih = null; fdBuka = true;
  gambarSemua(); gambarLayarForm(); simpanNanti();

  const T = templateDari(L.id);
  const sah = semuaField().map(f => f.kode)
    .concat((rancangan.varDokumen || []).map(v => v.kode).filter(Boolean));
  const asing = {};
  if (T) (T.isi.potongan || []).concat((T.isi.bagian || []).filter(b => b.jenis !== 'otomatis'))
    .forEach(p => {
      const teks = [p.teks].concat((p.slot || []).map(x => x.teks)).join(' ');
      (teks.match(/\{\{[^}]+\}\}/g) || []).forEach(v => {
        const k = v.slice(2, -2).trim();
        if (!sah.includes(k)) asing[k] = true;
      });
    });
  const n = Object.keys(asing).length;
  setTimeout(() => {
    $('#status').textContent = n
      ? 'formulir dimuat · ' + n + ' variabel templatenya kini tanpa field'
      : 'formulir dimuat — seluruh variabel templatenya masih dikenali';
  }, 700);
}
async function eksporFormulir(){
  if (!api.ekspor){ $('#status').textContent = 'ekspor hanya tersedia di aplikasi'; return; }
  const hasil = await api.ekspor(bentukFormulir());
  if (hasil) $('#status').textContent = 'formulir diekspor ke ' + hasil;
}

async function eksporTemplate(){
  if (!api.ekspor){ $('#status').textContent = 'ekspor hanya tersedia di aplikasi'; return; }
  const hasil = await api.ekspor(bagianTemplate(rancangan));
  if (hasil) $('#status').textContent = 'template diekspor ke ' + hasil;
}
if ($('#btn-impor-template')) $('#btn-impor-template').addEventListener('click', imporTemplate);
if ($('#btn-ekspor-template')) $('#btn-ekspor-template').addEventListener('click', eksporTemplate);

/* =====================================================================
   PUSTAKA KONDISI — kondisi bernama milik platform.

   Potongan dan sisipan merujuk kondisi ini lewat simpul {ref:'KODE'},
   jadi definisinya hidup di satu tempat. Hanya Super Admin yang masuk ke
   sini; Notaris dan Asisten tidak pernah melihatnya.
   ===================================================================== */
let pstAktif = null;

function pemakaiKondisi(kode){
  const out = [];
  const punyaRef = sy => (sy || []).some(c => c && c.ref === kode);
  (rancangan.potongan || []).forEach(p => {
    if (punyaRef(p.syarat)) out.push(p.judul || p.kode);
    (p.slot || []).forEach(sl => {
      if (punyaRef(sl.syarat)) out.push((p.judul || p.kode) + ' › ' + (sl.label || sl.kode));
    });
  });
  (rancangan.pustaka || []).forEach(k => {
    if (k.kode !== kode && punyaRef(k.syarat)) out.push('kondisi ' + (k.label || k.kode));
  });
  return out;
}

function gambarLayarPustaka(){
  const daftar = rancangan.pustaka || [];
  if (!pstAktif || !daftar.some(k => k.kode === pstAktif))
    pstAktif = daftar.length ? daftar[0].kode : null;
  const lc = $('#pst-lencana');
  if (lc) lc.textContent = daftar.length + ' kondisi';
  const n = $('#n-pustaka');
  if (n) n.textContent = '(' + daftar.length + ')';
  gambarPustakaDaftar();
  gambarPustakaEditor();
}

function gambarPustakaDaftar(){
  const box = $('#pst-daftar');
  if (!box) return;
  const daftar = rancangan.pustaka || [];
  if (!daftar.length){
    box.innerHTML = '<div class="kosong-panel">Belum ada kondisi. Tekan <b>+ Kondisi</b>.</div>';
    return;
  }
  box.innerHTML = daftar.map(k => {
    const dipakai = pemakaiKondisi(k.kode).length;
    return '<div class="pot' + (pstAktif === k.kode ? ' aktif' : '') + '" data-pk="' + esc(k.kode) + '">' +
      '<span class="nm">' + esc(k.label || k.kode) + '</span>' +
      '<span class="slotn">' + dipakai + '×</span>' +
      '<span class="sy">' + esc(teksSyarat(k.syarat, labelKode) || 'selalu') + '</span></div>';
  }).join('');
  box.querySelectorAll('[data-pk]').forEach(el => el.addEventListener('click', () => {
    pstAktif = el.dataset.pk; gambarLayarPustaka();
  }));
}

function gambarPustakaEditor(){
  const box = $('#pst-editor');
  if (!box) return;
  const k = (rancangan.pustaka || []).find(x => x.kode === pstAktif);
  if (!k){
    box.innerHTML = '<div class="kosong-kanan"><div class="bulat">❖</div>' +
      'Pilih kondisi di panel kiri, atau buat yang baru.</div>';
    return;
  }
  k.syarat = rapikanSyarat(k.syarat);
  const dipakai = pemakaiKondisi(k.kode);

  let h = '<div class="ed-kepala">' +
    '<input type="text" class="judul-input" data-pkl value="' + esc(k.label || '') +
      '" placeholder="Nama kondisi, mis. Pihak berbentuk badan hukum">' +
    '<span class="lencana">' + esc(k.kode) + '</span>' +
    '<span class="kanan"><button class="btn btn-kecil btn-bahaya" data-pkhapus>Hapus kondisi</button></span></div>';

  h += '<div class="ed-badan">';
  h += '<div class="f"><label class="j">Kode rujukan</label>' +
    '<input type="text" data-pkk value="' + esc(k.kode) + '">' +
    '<p class="hampa">Dipakai template sebagai <code>{ref:\'' + esc(k.kode) + '\'}</code>. ' +
    'Mengubah kode akan ikut memperbarui semua yang merujuknya.</p></div>';

  h += '<div class="f"><label class="j">Syarat</label>';
  h += '<p class="hampa">Terpenuhi bila semua baris terpenuhi. Grup ATAU cukup salah satu barisnya. ' +
    'Field kosong membuat semua operator salah, kecuali “tidak terisi”.</p>';
  k.syarat.forEach((c, i) => {
    if (i) h += '<div class="dan">DAN</div>';
    h += barisSyaratPot(c, i, 'utama');
  });
  h += '<div class="tombol-syarat">' +
    '<button class="btn btn-kecil" data-tambahsyarat="utama">+ Syarat</button>' +
    '<button class="btn btn-kecil" data-tambahgrup="utama">+ Grup ATAU</button>' +
    '<button class="btn btn-kecil" data-tambahref="utama">+ Kondisi tersimpan</button></div></div>';

  h += '<div class="f"><label class="j">Dipakai di</label>' +
    (dipakai.length
      ? '<ul class="daftar-pakai">' + dipakai.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>'
      : '<p class="hampa">Belum dirujuk siapa pun.</p>') + '</div>';
  h += '</div>';
  box.innerHTML = h;

  box.querySelector('[data-pkl]').addEventListener('input', e => {
    k.label = e.target.value; gambarPustakaDaftar(); simpanNanti();
  });
  box.querySelector('[data-pkk]').addEventListener('change', e => {
    const baru = e.target.value.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_');
    if (!baru || baru === k.kode){ gambarPustakaEditor(); return; }
    if ((rancangan.pustaka || []).some(x => x !== k && x.kode === baru)){
      window.alert('Kode “' + baru + '” sudah dipakai kondisi lain.');
      gambarPustakaEditor(); return;
    }
    const lama = k.kode;
    const ganti = sy => (sy || []).forEach(c => { if (c && c.ref === lama) c.ref = baru; });
    (rancangan.potongan || []).forEach(p => { ganti(p.syarat); (p.slot || []).forEach(sl => ganti(sl.syarat)); });
    (rancangan.pustaka  || []).forEach(x => ganti(x.syarat));
    k.kode = baru; pstAktif = baru;
    gambarLayarPustaka(); simpanNanti();
  });
  box.querySelector('[data-pkhapus]').addEventListener('click', () => {
    if (dipakai.length && !window.confirm('Kondisi ini masih dirujuk ' + dipakai.length +
      ' tempat. Rujukan yang hilang akan diabaikan, jadi potongannya tetap tertulis. Hapus?')) return;
    rancangan.pustaka = (rancangan.pustaka || []).filter(x => x.kode !== k.kode);
    pstAktif = null;
    gambarLayarPustaka(); simpanNanti();
  });

  pasangBarisSyarat(box, () => k.syarat, () => { gambarLayarPustaka(); simpanNanti(); });
}

if ($('#pst-tambah')) $('#pst-tambah').addEventListener('click', () => {
  rancangan.pustaka = rancangan.pustaka || [];
  let i = rancangan.pustaka.length + 1, kode;
  do { kode = 'KONDISI_' + i++; } while (rancangan.pustaka.some(x => x.kode === kode));
  const c = syaratBaru();
  rancangan.pustaka.push({ kode, label: 'Kondisi baru', syarat: c ? [c] : [] });
  pstAktif = kode;
  gambarLayarPustaka(); simpanNanti();
});

/* =====================================================================
   SKENARIO UJI — tab di Template Akta, hanya Super Admin.

   Satu skenario adalah satu set isian karangan (baris tabel + isian
   formulir) yang disimpan BERSAMA TEMPLATENYA, bukan sebagai order.
   Gunanya dua: memeriksa template sesudah syaratnya diubah, dan menjadi
   kriteria penerimaan bagi developer yang menerapkan mesin ini —
   "keluarannya harus sama untuk skenario-skenario ini".
   ===================================================================== */

function ringkasIsiSkenario(sk){
  const bagian = [];
  (rancangan.tab || []).forEach(t => {
    if (t.mode === 'daftar'){
      const n = ((sk.baris || {})[t.id] || []).length;
      if (n) bagian.push(t.nama + ' ' + n);
    } else {
      const isi = (sk.form || {})[t.id] || {};
      const n = Object.keys(isi).filter(k => String(isi[k] || '').trim() !== '').length;
      if (n) bagian.push(t.nama + ' ' + n + ' isian');
    }
  });
  return bagian.length ? bagian.join(' · ') : 'kosong';
}

/* Merakit setiap skenario dengan mesin yang sama seperti Minuta, lalu
   mengumpulkan cakupannya. Isian yang sedang dibuka dikembalikan utuh. */
function jalankanSkenario(){
  const adaBaris = barisPv, adaForm = nilaiForm;
  const salin = x => JSON.parse(JSON.stringify(x || {}));
  const hasil = [];
  const pernah = {};
  (rancangan.skenario || []).forEach(sk => {
    barisPv   = salin(sk.baris);
    nilaiForm = salin(sk.form);
    const r = rakitAkta();
    const pot = Object.keys(jejakPot);
    pot.forEach(k => { pernah[k] = (pernah[k] || 0) + 1; });
    hasil.push({
      id: sk.id, nama: sk.nama,
      jumlah: r.jumlahPotongan, hampa: r.jumlahHampa,
      pot, bagianKosong: r.bagianKosong.slice(),
      catatan: catatanRakit.slice(0, 5)
    });
  });
  barisPv = adaBaris; nilaiForm = adaForm;
  const semua = (rancangan.potongan || []).filter(p =>
    (rancangan.bagian || []).some(b => (b.potongan || []).includes(p.kode)));
  const takPernah = semua.filter(p => !pernah[p.kode]);
  return { hasil, pernah, takPernah, jumlahDipakai: semua.length };
}

function gambarPanelSkenario(){
  const box = $('#isi-skenario');
  if (!box) return;
  rancangan.skenario = Array.isArray(rancangan.skenario) ? rancangan.skenario : [];
  const daftar = rancangan.skenario;
  const n = $('#n-skenario');
  if (n) n.textContent = '(' + daftar.length + ')';

  let h = '<div class="alat-var">' +
    '<button class="btn btn-utama btn-kecil" data-sk-ambil>+ Ambil dari order yang dibuka</button>' +
    '<button class="btn btn-kecil" data-sk-kosong>+ Skenario kosong</button>' +
    (daftar.length ? '<button class="btn btn-kecil" data-sk-rakit>⟳ Rakit semua</button>' : '') +
    '<span class="hint">Isian karangan untuk menguji template. Tidak pernah menjadi akta.</span></div>';

  if (!daftar.length){
    h += '<div class="kosong-panel">Belum ada skenario. Isi sebuah order di menu Order, ' +
      'lalu tekan <b>+ Ambil dari order yang dibuka</b> untuk membekukan isiannya di sini.</div>';
    box.innerHTML = h;
  } else {
    h += '<div class="tabel-bungkus"><table class="tabel-skenario"><thead><tr>' +
      '<th>Nama skenario</th><th>Isi</th><th></th></tr></thead><tbody>' +
      daftar.map(sk => '<tr data-skid="' + esc(sk.id) + '">' +
        '<td><input type="text" data-sk-nama value="' + esc(sk.nama || '') + '"></td>' +
        '<td class="sel-ket">' + esc(ringkasIsiSkenario(sk)) + '</td>' +
        '<td class="kanan-sel">' +
          '<button class="btn btn-kecil" data-sk-pakai>Muat ke order</button> ' +
          '<button class="btn btn-kecil btn-bahaya" data-sk-hapus>×</button></td></tr>').join('') +
      '</tbody></table></div>';
    h += '<div id="sk-laporan"></div>';
    box.innerHTML = h;
  }

  const ulang = () => { gambarPanelSkenario(); simpanNanti(); };

  const ambil = box.querySelector('[data-sk-ambil]');
  if (ambil) ambil.addEventListener('click', () => {
    const salin = x => JSON.parse(JSON.stringify(x || {}));
    rancangan.skenario.push({
      id: 'sk_' + Math.random().toString(36).slice(2, 8),
      nama: 'Skenario ' + (rancangan.skenario.length + 1),
      baris: salin(barisPv), form: salin(nilaiForm)
    });
    ulang();
  });
  const kosong = box.querySelector('[data-sk-kosong]');
  if (kosong) kosong.addEventListener('click', () => {
    rancangan.skenario.push({
      id: 'sk_' + Math.random().toString(36).slice(2, 8),
      nama: 'Skenario ' + (rancangan.skenario.length + 1), baris: {}, form: {}
    });
    ulang();
  });

  box.querySelectorAll('tr[data-skid]').forEach(tr => {
    const sk = rancangan.skenario.find(x => x.id === tr.dataset.skid);
    if (!sk) return;
    tr.querySelector('[data-sk-nama]').addEventListener('input', e => {
      sk.nama = e.target.value; simpanNanti();
    });
    tr.querySelector('[data-sk-hapus]').addEventListener('click', () => {
      if (!window.confirm('Hapus skenario “' + (sk.nama || '') + '”?')) return;
      rancangan.skenario = rancangan.skenario.filter(x => x.id !== sk.id);
      ulang();
    });
    tr.querySelector('[data-sk-pakai]').addEventListener('click', () => {
      const salin = x => JSON.parse(JSON.stringify(x || {}));
      barisPv = salin(sk.baris); nilaiForm = salin(sk.form);
      $('#status').textContent = 'isian skenario “' + (sk.nama || '') + '” dimuat ke order yang dibuka';
      gambarKanan();
    });
  });

  const rakit = box.querySelector('[data-sk-rakit]');
  if (rakit) rakit.addEventListener('click', () => {
    const lap = jalankanSkenario();
    gambarLaporanSkenario(lap);
  });
}

function gambarLaporanSkenario(lap){
  const box = $('#sk-laporan');
  if (!box) return;
  const pot = kode => {
    const p = (rancangan.potongan || []).find(x => x.kode === kode);
    return p ? (p.judul || p.kode) : kode;
  };

  let h = '<div class="lap-kepala">Laporan cakupan</div>';

  h += '<div class="lap-kartu' + (lap.takPernah.length ? ' lap-waspada' : ' lap-aman') + '">' +
    '<b>' + (lap.jumlahDipakai - lap.takPernah.length) + ' dari ' + lap.jumlahDipakai +
    '</b> potongan tertulis di setidaknya satu skenario.';
  if (lap.takPernah.length){
    h += '<p>Yang <b>tidak pernah</b> muncul — syaratnya mungkin salah, atau skenarionya belum ada:</p><ul>' +
      lap.takPernah.map(p => '<li>' + esc(p.judul || p.kode) + ' <span class="hampa">· ' +
        esc(ringkasSyarat(p.syarat)) + '</span></li>').join('') + '</ul>';
  } else {
    h += '<p>Tidak ada potongan yang terlewat.</p>';
  }
  h += '</div>';

  h += '<div class="tabel-bungkus"><table class="tabel-skenario"><thead><tr>' +
    '<th>Skenario</th><th>Potongan</th><th>Variabel kosong</th><th>Bagian tanpa tulisan</th>' +
    '</tr></thead><tbody>' +
    lap.hasil.map(r => '<tr>' +
      '<td><b>' + esc(r.nama || '') + '</b></td>' +
      '<td>' + r.jumlah + '</td>' +
      '<td class="' + (r.hampa ? 'sel-waspada' : '') + '">' + r.hampa + '</td>' +
      '<td class="sel-ket">' + (r.bagianKosong.length ? esc(r.bagianKosong.join(', ')) : '—') + '</td>' +
      '</tr>').join('') + '</tbody></table></div>';

  const berCatatan = lap.hasil.filter(r => r.catatan.length);
  if (berCatatan.length){
    h += '<div class="lap-kartu lap-waspada"><b>Diagnosa</b>' +
      berCatatan.map(r => '<p>' + esc(r.nama || '') + '</p><ul>' +
        r.catatan.map(t => '<li>' + esc(t) + '</li>').join('') + '</ul>').join('') + '</div>';
  }

  const jarang = Object.keys(lap.pernah).filter(k => lap.pernah[k] === 1);
  if (jarang.length)
    h += '<p class="hampa">Hanya tertulis di satu skenario: ' +
      jarang.map(k => esc(pot(k))).join(', ') + '.</p>';

  box.innerHTML = h;
}

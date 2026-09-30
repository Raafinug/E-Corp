/* Rancangan bawaan — meniru layar Order AJB: Narahubung, Para Pihak, Objek, Dokumen. */
window.SEED = {
  versi: 1,
  nama: 'Order AJB',
  tab: [
    {
      id: 'narahubung', nama: 'Narahubung', mode: 'formulir',
      tombolSimpan: 'Simpan Narahubung',
      field: [
        { id:'f1', tipe:'teks',    label:'Nama',   kode:'narahubung_nama',   wajib:true,  lebar:'setengah', contoh:'Test PT', sumber:'order' },
        { id:'f2', tipe:'teks',    label:'No. HP', kode:'narahubung_hp',     wajib:false, lebar:'setengah', contoh:'08xxxx', sumber:'order' },
        { id:'f3', tipe:'teks',    label:'Email',  kode:'narahubung_email',  wajib:false, lebar:'setengah', contoh:'email@contoh.id', sumber:'order' },
        { id:'f4', tipe:'panjang', label:'Catatan',kode:'narahubung_catatan',wajib:false, lebar:'penuh',    contoh:'Catatan tambahan (opsional)', sumber:'order' }
      ]
    },
    {
      id: 'para_pihak', nama: 'Para Pihak', mode: 'daftar',
      tombolTambah: '+ Tambah Pihak', judulModal: 'Tambah Para Pihak',
      pesanKosong: 'Belum ada para pihak.',
      field: [
        { id:'p1', tipe:'pilihan',   label:'Tipe Pihak',   kode:'tipe_pihak',   wajib:true, lebar:'penuh',
          opsi:['Penjual','Pembeli','Pasangan','Saksi'], sumber:'order', kolom:'TIPE', gaya:'pil' },
        { id:'p2', tipe:'segmented', label:'Bentuk Pihak', kode:'bentuk_pihak', wajib:true, lebar:'penuh',
          opsi:['Perorangan','Badan Hukum (PT)'], sumber:'order', kolom:'BENTUK', gaya:'chip' },
        { id:'p3', tipe:'pilihan',   label:'Jenis Harta',  kode:'jenis_harta',  wajib:true, lebar:'penuh',
          opsi:['Harta Sendiri','Harta Bersama'], sumber:'order',
          tampilBila:[{field:'bentuk_pihak', op:'=', nilai:'Perorangan'}],
          bantu:'Harta Bersama → pihak ini wajib menambahkan pasangannya sebagai pihak Pasangan untuk persetujuan.' },
        { id:'p3b', tipe:'teks', label:'Nama Perseroan', kode:'pt_nama', wajib:true, lebar:'setengah',
          contoh:'PT Contoh Sejahtera', sumber:'order',
          tampilBila:[{field:'bentuk_pihak', op:'=', nilai:'Badan Hukum (PT)'}] },
        { id:'p3c', tipe:'pilihan', label:'Jabatan Wakil', kode:'pt_jabatan', wajib:true, lebar:'setengah',
          opsi:['Direktur Utama','Direktur','Wakil Direktur Utama'], sumber:'order',
          tampilBila:[{field:'bentuk_pihak', op:'=', nilai:'Badan Hukum (PT)'}] },
        { id:'p3d', tipe:'yatidak', label:'Ada persetujuan Dewan Komisaris', kode:'pt_komisaris', wajib:false, lebar:'setengah',
          sumber:'order',
          tampilBila:[{field:'bentuk_pihak', op:'=', nilai:'Badan Hukum (PT)'}] },
        { id:'p3e', tipe:'teks', label:'Nomor Surat Persetujuan Komisaris', kode:'pt_komisaris_nomor', wajib:false, lebar:'setengah',
          contoh:'007/DK/IX/2026', sumber:'order',
          tampilBila:[{field:'pt_komisaris', op:'=', nilai:'Ya'}] },
        { id:'p3f', tipe:'kbli',     label:'KBLI', kode:'kbli', lebar:'penuh', ganda:true,
          keterangan:'Kegiatan usaha menurut Klasifikasi Baku Lapangan Usaha Indonesia',
          tampilBila:[{field:'bentuk_pihak', op:'=', nilai:'Badan Hukum (PT)'}] },
        { id:'p4', tipe:'user',      label:'User Klien',   kode:'user_klien',   wajib:true, lebar:'penuh',
          sumber:'ktp', kolom:'NAMA', gaya:'teks', awalan:'',
          bantu:'Pihak harus terdaftar sebagai user (fungsi Klien). Data diri terisi otomatis dari profilnya.' },
        { id:'p4b', tipe:'user',     label:'User Pasangan', kode:'user_pasangan', wajib:false, lebar:'penuh',
          sumber:'ktp', awalan:'pasangan',
          bantu:'Dipakai bila hartanya harta bersama. Variabelnya berawalan pasangan, misalnya {{pasangan.nama}}.',
          tampilBila:[{field:'jenis_harta', op:'=', nilai:'Harta Bersama'}] },
        { id:'p5', tipe:'teks',      label:'Kontak',       kode:'pihak_kontak', wajib:false, lebar:'setengah',
          sumber:'ktp', kolom:'KONTAK', gaya:'teks', contoh:'6285xxxxxxx' },
        { id:'p6', tipe:'ulang',     label:'Riwayat Perubahan Anggaran Dasar', kode:'pt_perubahan', lebar:'penuh',
          keterangan:'Diisi berulang untuk tiap akta perubahan',
          tombolTambah:'+ Tambah perubahan', minBaris:1, maksBaris:0,
          tampilBila:[{field:'bentuk_pihak', op:'=', nilai:'Badan Hukum (PT)'}] },
        { id:'p6a', tipe:'teks',     label:'Nomor Akta', kode:'perubahan_nomor', wajib:false, lebar:'seperempat',
          contoh:'12', sumber:'order' },
        { id:'p6b', tipe:'tanggal',  label:'Tanggal Akta', kode:'perubahan_tanggal', wajib:false, lebar:'sepertiga',
          sumber:'order', terbilang:'tanggal' },
        { id:'p6c', tipe:'teks',     label:'Notaris', kode:'perubahan_notaris', wajib:false, lebar:'sepertiga',
          contoh:'Nama notaris pembuat akta', sumber:'order' }
      ]
    },
    {
      id: 'objek', nama: 'Objek', mode: 'daftar',
      tombolTambah: '+ Tambah Objek', judulModal: 'Tambah Objek',
      pesanKosong: 'Belum ada objek.',
      field: [
        { id:'o0', tipe:'seksi',   label:'Data Umum', kode:'', lebar:'penuh',
          keterangan:'Jenis hak dan nomor sertipikat', tertutup:false },
        { id:'o1', tipe:'pilihan', label:'Jenis Hak', kode:'jenis_hak', wajib:true, lebar:'penuh',
          opsi:['Sertipikat Hak Milik (SHM)','Hak Guna Bangunan','Hak Pakai','Hak Milik Atas Satuan Rumah Susun'],
          sumber:'order', kolom:'HAK', gaya:'teks' },
        { id:'o2', tipe:'judul',   label:'Input Sertipikat', kode:'', lebar:'penuh' },
        { id:'o3', tipe:'teks',    label:'NIB', kode:'objek_nib', wajib:false, lebar:'setengah',
          contoh:'Nomor Identifikasi Bidang', sumber:'order', kolom:'SERTIFIKAT / NIB', gaya:'teks' },
        { id:'o4', tipe:'teks',    label:'No. Sertifikat', kode:'objek_no_sertifikat', wajib:false, lebar:'setengah',
          contoh:'Nomor Sertifikat', sumber:'order' },
        { id:'o5', tipe:'teks',    label:'Gambar Denah / Surat Ukur', kode:'objek_su_nomor', wajib:false, lebar:'setengah',
          contoh:'Gambar Denah / Surat Ukur', sumber:'order',
          tampilBila:[{field:'jenis_hak', op:'≠', nilai:'Hak Milik Atas Satuan Rumah Susun'}] },
        { id:'o6', tipe:'tanggal', label:'Tanggal Gambar Denah / Surat Ukur', kode:'objek_su_tanggal', wajib:false, lebar:'setengah',
          sumber:'order', terbilang:'tanggal' },
        { id:'o6b', tipe:'seksi',  label:'Ukuran & Letak', kode:'', lebar:'penuh',
          keterangan:'Luas bidang dan letaknya', tertutup:false },
        { id:'o7', tipe:'angka',   label:'Luas (m²)', kode:'objek_luas', wajib:true, lebar:'setengah',
          sumber:'order', kolom:'LUAS', gaya:'teks', terbilang:'meter', contoh:'250' },
        { id:'o8', tipe:'teks',    label:'Lokasi', kode:'objek_lokasi', wajib:false, lebar:'setengah',
          contoh:'Kelurahan, Kecamatan', sumber:'order', kolom:'LOKASI', gaya:'teks' },
        { id:'o9', tipe:'seksi',   label:'Harga & Pajak', kode:'', lebar:'penuh',
          keterangan:'Tidak masuk ke badan akta — hanya catatan order', tertutup:true },
        { id:'o10', tipe:'angka',  label:'Harga Transaksi (Rupiah)', kode:'objek_harga', wajib:false, lebar:'setengah',
          sumber:'order', terbilang:'rupiah', contoh:'1.000.000.000' },
        { id:'o11', tipe:'angka',  label:'NJOP (Rupiah)', kode:'objek_njop', wajib:false, lebar:'setengah',
          sumber:'order', terbilang:'rupiah', contoh:'850.000.000' }
      ]
    },
    {
      id: 'dokumen', nama: 'Dokumen', mode: 'daftar',
      tombolTambah: '+ Tambah Dokumen', judulModal: 'Tambah Dokumen',
      pesanKosong: 'Belum ada dokumen.',
      field: [
        { id:'d1', tipe:'pilihan', label:'Jenis', kode:'dokumen_jenis', wajib:true, lebar:'penuh',
          opsi:['KTP','Kartu Keluarga','Sertipikat','SPPT PBB','Akta Nikah','Lainnya'],
          sumber:'order', kolom:'JENIS', gaya:'teks' },
        { id:'d2', tipe:'teks',    label:'Pemilik', kode:'dokumen_pemilik', wajib:false, lebar:'penuh',
          contoh:'Nama pihak pemilik dokumen', sumber:'order', kolom:'PEMILIK', gaya:'teks' },
        { id:'d3', tipe:'berkas',  label:'File', kode:'dokumen_berkas', wajib:true, lebar:'penuh',
          sumber:'order', kolom:'FILE', gaya:'teks' },
        { id:'d4', tipe:'teks',    label:'Ukuran', kode:'dokumen_ukuran', wajib:false, lebar:'setengah',
          sumber:'turunan', kolom:'UKURAN', gaya:'teks' }
      ]
    }
  ],

  /* ---- pengaturan halaman ---- */
  halaman: { kertas:'F4 / Folio (21,5 × 33 cm)', orientasi:'Tegak (Portrait)',
    mAtas:'1,5', mBawah:'1,5', mKiri:'6', mKanan:'1',
    font:'Courier New (monospace, khas akta)', ukuran:'12', spasi:'2',
    footerKiri:'{{notaris_nama_gelar}}', footerTengah:'', footerKanan:'Halaman {page} dari {total}' },

  /* ---- variabel yang tidak berasal dari formulir order ---- */
  /* Variabel global bawaan (waktu, nomor, profil kantor) ditambahkan sendiri oleh
     pastikanBentuk dari VAR_BAWAAN, jadi di sini cukup variabel khas dokumen ini. */
  varDokumen: [
    { kode:'lembar', label:'Penanda lembar', nilai:'Lembar Pertama', otomatis:'' }
  ],

  /* ---- bagian template ---- */
  bagian: [
    { id:'b1', judul:'PEMBUKAAN AKTA', jenis:'catatan',
      teks:'Pada hari ini, {{var_hari}}, tanggal {{var_tanggal}}.\nHadir di hadapan saya, PPAT …' },
    { id:'b2', judul:'Para Pihak', jenis:'otomatis',
      ulang:'para_pihak', kelompok:'tipe_pihak', nomor:'angka', nomorUlangKelompok:false,
      potongan:['identitas_pihak','persetujuan_pasangan','kedudukan_pt','riwayat_perubahan','peran_pihak'] },
    { id:'b3', judul:'Objek Jual Beli', jenis:'otomatis',
      potongan:['objek_sarusun','objek_terdaftar'] },
    { id:'b4', judul:'Pasal 1', jenis:'pasal', teks:'Mulai hari ini Objek Jual Beli telah menjadi milik PIHAK KEDUA …' },
    { id:'b5', judul:'Pasal 2', jenis:'pasal', teks:'PIHAK PERTAMA menjamin bahwa Objek Jual Beli tidak tersangkut sengketa …' },
    { id:'b6', judul:'Pasal 3', jenis:'pasal', teks:'PIHAK KEDUA menyatakan kepemilikan tanahnya tidak melebihi ketentuan maksimum …' },
    { id:'b7', judul:'Daftar Dokumen', jenis:'otomatis', potongan:['daftar_dokumen'] },
    { id:'b8', judul:'Para Saksi', jenis:'catatan', teks:'Demikianlah akta ini dibuat di hadapan PARA PIHAK dan saksi-saksi …' },
    { id:'b9', judul:'Penutup', jenis:'catatan', teks:'Akta ini ditandatangani sebanyak 2 (dua) rangkap asli …' }
  ],

  /* ---- kondisi penulisan: potongan redaksi ---- */
  grup: [
    { kode:'uraian_objek', judul:'Uraian objek', anggota:['objek_sarusun','objek_terdaftar'] }
  ],
  potongan: [
    { kode:'identitas_pihak', judul:'Identitas pihak', grup:null, ulang:'', nomor:'tanpa', tulis:'baris',
      syarat:[], slot:[],
      teks:'<p><b>{{nama}}</b>, lahir di {{tempat_lahir}}, pada tanggal {{tanggal_lahir}} ' +
        '({{tanggal_lahir_terbilang}}), Warga Negara {{kewarganegaraan}}, {{pekerjaan}}, ' +
        'bertempat tinggal di {{jalan}}, Rukun Tetangga {{rt}}, Rukun Warga {{rw}}, ' +
        '{{label_kelurahan}} {{kelurahan}}, Kecamatan {{kecamatan}}, {{label_kota}} {{kota}}, ' +
        'Provinsi {{provinsi}}, Pemegang Kartu Tanda Penduduk Nomor: {{nik}}.</p>' },

    { kode:'persetujuan_pasangan', judul:'Persetujuan pasangan', grup:null, ulang:'', nomor:'tanpa', tulis:'baris',
      syarat:[{field:'jenis_harta', op:'=', nilai:'Harta Bersama'}], slot:[],
      teks:'<p>Menurut keterangannya dalam melakukan tindakan hukum yang dimaksud dalam akta ini telah ' +
        'mendapat persetujuan dari pasangannya yang sah dan satu-satunya, yaitu {{pasangan.sapaan}} ' +
        '{{pasangan.nama}}, Pemegang Kartu Tanda Penduduk Nomor: {{pasangan.nik}}, yang turut hadir di ' +
        'hadapan saya, PPAT, dan menandatangani akta ini sebagai bukti persetujuannya.</p>' },

    { kode:'kedudukan_pt', judul:'Kedudukan wakil perseroan', grup:null, ulang:'', nomor:'tanpa', tulis:'baris',
      syarat:[{field:'bentuk_pihak', op:'=', nilai:'Badan Hukum (PT)'}],
      teks:'Menurut keterangannya dalam melakukan tindakan hukum yang dimaksud dalam akta ini bertindak dalam jabatannya selaku {{pt_jabatan}} dari perseroan terbatas {{pt_nama}}, [[slot:komisaris]]dari dan oleh karena itu sah bertindak mewakili untuk dan atas nama {{pt_nama}}.',
      slot:[
        { kode:'komisaris', label:'Sisipan persetujuan Dewan Komisaris',
          syarat:[{field:'pt_komisaris', op:'=', nilai:'Ya'}],
          teks:'dan telah memperoleh persetujuan dari Dewan Komisaris berdasarkan Surat Persetujuan Nomor {{pt_komisaris_nomor}}, ' }
      ] },

    { kode:'riwayat_perubahan', judul:'Riwayat perubahan anggaran dasar', grup:null, ulang:'pt_perubahan', nomor:'tanpa', tulis:'baris',
      syarat:[{field:'bentuk_pihak', op:'=', nilai:'Badan Hukum (PT)'}], slot:[],
      teks:'<p>Akta Nomor {{perubahan_nomor}} tanggal {{perubahan_tanggal}} ' +
        '({{perubahan_tanggal_terbilang}}), dibuat di hadapan {{perubahan_notaris}}.</p>' },

    { kode:'peran_pihak', judul:'Sebutan kelompok', grup:null, ulang:'', nomor:'tanpa', tulis:'akhirKelompok',
      syarat:[], slot:[],
      teks:'<p>— selaku {{tipe_pihak}}.</p>' },

    { kode:'objek_sarusun', judul:'Uraian objek — satuan rumah susun', grup:'uraian_objek', ulang:'objek', nomor:'tanpa',
      syarat:[{field:'jenis_hak', op:'=', nilai:'Hak Milik Atas Satuan Rumah Susun'}], slot:[],
      teks:'- Hak Milik Atas Satuan Rumah Susun Nomor {{objek_no_sertifikat}}, Nomor Identifikasi Bidang Tanah (NIB) {{objek_nib}}, seluas {{objek_luas}} m2, terletak di {{objek_lokasi}}.' },

    { kode:'objek_terdaftar', judul:'Uraian objek — bidang terdaftar', grup:'uraian_objek', ulang:'objek', nomor:'tanpa',
      syarat:[], slot:[],
      teks:'- {{jenis_hak}} Nomor {{objek_no_sertifikat}} atas sebidang tanah sebagaimana diuraikan dalam Surat Ukur tanggal {{objek_su_tanggal}} Nomor {{objek_su_nomor}}, seluas {{objek_luas}} m2, dengan Nomor Identifikasi Bidang Tanah (NIB) {{objek_nib}}, terletak di {{objek_lokasi}}.' },

    { kode:'daftar_dokumen', judul:'Daftar dokumen terlampir', grup:null, ulang:'dokumen', nomor:'angka',
      syarat:[], slot:[],
      teks:'{{dokumen_jenis}} atas nama {{dokumen_pemilik}}.' }
  ]
};

/* Contoh isi basis data KBLI — di aplikasi sebenarnya ditarik dari basis data,
   bukan disimpan di dalam rancangan formulir. Dipakai hanya agar pencariannya terlihat jalan. */
window.KBLI_CONTOH = [
  { kode:'01111', judul:'Pertanian Jagung',                golongan:'Pertanian Tanaman Semusim' },
  { kode:'01132', judul:'Pertanian Buah Semusim',          golongan:'Pertanian Tanaman Semusim' },
  { kode:'01262', judul:'Perkebunan Buah Kelapa Sawit',    golongan:'Pertanian Tanaman Tahunan' },
  { kode:'10710', judul:'Industri Produk Roti dan Kue',    golongan:'Industri Pengolahan' },
  { kode:'41011', judul:'Konstruksi Gedung Hunian',        golongan:'Konstruksi' },
  { kode:'41012', judul:'Konstruksi Gedung Perkantoran',   golongan:'Konstruksi' },
  { kode:'42101', judul:'Konstruksi Jalan Raya',           golongan:'Konstruksi' },
  { kode:'46100', judul:'Perdagangan Besar Atas Dasar Balas Jasa (Fee) atau Kontrak', golongan:'Perdagangan Besar' },
  { kode:'47111', judul:'Perdagangan Eceran Berbagai Macam Barang di Minimarket',     golongan:'Perdagangan Eceran' },
  { kode:'49421', judul:'Angkutan Barang Bermotor Umum',   golongan:'Pengangkutan' },
  { kode:'56101', judul:'Restoran',                        golongan:'Penyediaan Makanan' },
  { kode:'62019', judul:'Aktivitas Pemrograman Komputer Lainnya', golongan:'Informasi dan Komunikasi' },
  { kode:'62029', judul:'Aktivitas Konsultasi Komputer Lainnya',  golongan:'Informasi dan Komunikasi' },
  { kode:'63111', judul:'Aktivitas Pengolahan Data',       golongan:'Informasi dan Komunikasi' },
  { kode:'68111', judul:'Real Estat Yang Dimiliki Sendiri atau Disewa', golongan:'Real Estat' },
  { kode:'68200', judul:'Real Estat Atas Dasar Balas Jasa (Fee) atau Kontrak', golongan:'Real Estat' },
  { kode:'69102', judul:'Aktivitas Konsultasi Hukum',      golongan:'Jasa Profesional' },
  { kode:'70209', judul:'Aktivitas Konsultasi Manajemen Lainnya', golongan:'Jasa Profesional' },
  { kode:'71101', judul:'Aktivitas Arsitektur',            golongan:'Jasa Profesional' },
  { kode:'82110', judul:'Aktivitas Penyedia Gabungan Jasa Administrasi Kantor', golongan:'Jasa Penunjang' }
];

/* Daftar user contoh — mewakili basis data user klien. Semua data di sini rekaan,
   dipakai hanya agar hasil perakitan naskah terlihat utuh. */
window.USER_CONTOH = [
  { id:'u01', nama:'Amir Sutanto', nik:'3273010101800001', tempat_lahir:'Bandung', tanggal_lahir:'1980-01-01',
    jenis_kelamin:'Laki-laki', status_kawin:'Kawin', pekerjaan:'Wiraswasta', kewarganegaraan:'Indonesia',
    jalan:'Jalan Cihampelas No. 45', rt:'03', rw:'07', label_kelurahan:'Kelurahan', kelurahan:'Cipaganti', kecamatan:'Coblong',
    label_kota:'Kota', kota:'Bandung', domisili_sementara:'', provinsi:'Jawa Barat', telepon:'081200000001', email:'amir.s@contoh.id' },
  { id:'u02', nama:'Budi Santoso', nik:'3275021203850002', tempat_lahir:'Bekasi', tanggal_lahir:'1985-03-12',
    jenis_kelamin:'Laki-laki', status_kawin:'Kawin', pekerjaan:'Karyawan Swasta', kewarganegaraan:'Indonesia',
    jalan:'Jalan Ahmad Yani No. 12', rt:'01', rw:'04', label_kelurahan:'Kelurahan', kelurahan:'Marga Jaya', kecamatan:'Bekasi Selatan',
    label_kota:'Kota', kota:'Bekasi', domisili_sementara:'Jalan Cikapundung Barat No. 9, Kota Bandung', provinsi:'Jawa Barat', telepon:'081200000002', email:'budi.s@contoh.id' },
  { id:'u03', nama:'Citra Dewi', nik:'3277034505900003', tempat_lahir:'Cimahi', tanggal_lahir:'1990-05-05',
    jenis_kelamin:'Perempuan', status_kawin:'Kawin', pekerjaan:'Ibu Rumah Tangga', kewarganegaraan:'Indonesia',
    jalan:'Jalan Gatot Subroto No. 8', rt:'02', rw:'05', label_kelurahan:'Kelurahan', kelurahan:'Baros', kecamatan:'Cimahi Tengah',
    label_kota:'Kota', kota:'Cimahi', domisili_sementara:'', provinsi:'Jawa Barat', telepon:'081200000003', email:'citra.d@contoh.id' },
  { id:'u04', nama:'Dimas Arya Pratama', nik:'3276042207920004', tempat_lahir:'Depok', tanggal_lahir:'1992-07-22',
    jenis_kelamin:'Laki-laki', status_kawin:'Belum Kawin', pekerjaan:'Pegawai Negeri Sipil', kewarganegaraan:'Indonesia',
    jalan:'Jalan Margonda Raya No. 210', rt:'05', rw:'02', label_kelurahan:'Kelurahan', kelurahan:'Kemiri Muka', kecamatan:'Beji',
    label_kota:'Kota', kota:'Depok', domisili_sementara:'Apartemen Taman Sari Tower B Lantai 12, Kota Bandung', provinsi:'Jawa Barat', telepon:'081200000004', email:'dimas.a@contoh.id' },
  { id:'u05', nama:'Eka Rahmawati', nik:'3271055809870005', tempat_lahir:'Bogor', tanggal_lahir:'1987-09-18',
    jenis_kelamin:'Perempuan', status_kawin:'Belum Kawin', pekerjaan:'Dokter', kewarganegaraan:'Indonesia',
    jalan:'Jalan Pajajaran No. 77', rt:'04', rw:'01', label_kelurahan:'Kelurahan', kelurahan:'Baranangsiang', kecamatan:'Bogor Timur',
    label_kota:'Kota', kota:'Bogor', domisili_sementara:'', provinsi:'Jawa Barat', telepon:'081200000005', email:'eka.r@contoh.id' },
  { id:'u06', nama:'Farid Nugroho', nik:'3374061511780006', tempat_lahir:'Semarang', tanggal_lahir:'1978-11-15',
    jenis_kelamin:'Laki-laki', status_kawin:'Kawin', pekerjaan:'Direktur', kewarganegaraan:'Indonesia',
    jalan:'Jalan Pandanaran No. 30', rt:'06', rw:'03', label_kelurahan:'Kelurahan', kelurahan:'Pekunden', kecamatan:'Semarang Tengah',
    label_kota:'Kota', kota:'Semarang', domisili_sementara:'', provinsi:'Jawa Tengah', telepon:'081200000006', email:'farid.n@contoh.id' },
  { id:'u07', nama:'Gita Prameswari', nik:'3578076302950007', tempat_lahir:'Surabaya', tanggal_lahir:'1995-02-23',
    jenis_kelamin:'Perempuan', status_kawin:'Kawin', pekerjaan:'Notaris', kewarganegaraan:'Indonesia',
    jalan:'Jalan Raya Darmo No. 101', rt:'02', rw:'08', label_kelurahan:'Kelurahan', kelurahan:'Darmo', kecamatan:'Wonokromo',
    label_kota:'Kota', kota:'Surabaya', domisili_sementara:'Jalan Riau No. 44, Kota Bandung', provinsi:'Jawa Timur', telepon:'081200000007', email:'gita.p@contoh.id' },
  { id:'u08', nama:'Hendra Wijaya', nik:'3171081009830008', tempat_lahir:'Jakarta', tanggal_lahir:'1983-10-09',
    jenis_kelamin:'Laki-laki', status_kawin:'Cerai Hidup', pekerjaan:'Pengusaha', kewarganegaraan:'Indonesia',
    jalan:'Jalan Sudirman Kav. 52', rt:'01', rw:'01', label_kelurahan:'Kelurahan', kelurahan:'Senayan', kecamatan:'Kebayoran Baru',
    label_kota:'Kota Administrasi', kota:'Jakarta Selatan', domisili_sementara:'', provinsi:'DKI Jakarta', telepon:'081200000008', email:'hendra.w@contoh.id' },
  { id:'u09', nama:'Indah Permatasari', nik:'3273094112910009', tempat_lahir:'Bandung', tanggal_lahir:'1991-12-01',
    jenis_kelamin:'Perempuan', status_kawin:'Cerai Mati', pekerjaan:'Guru', kewarganegaraan:'Indonesia',
    jalan:'Jalan Setiabudi No. 190', rt:'07', rw:'09', label_kelurahan:'Kelurahan', kelurahan:'Ledeng', kecamatan:'Cidadap',
    label_kota:'Kota', kota:'Bandung', domisili_sementara:'', provinsi:'Jawa Barat', telepon:'081200000009', email:'indah.p@contoh.id' },
  { id:'u10', nama:'Joko Purnomo', nik:'3204100403750010', tempat_lahir:'Kabupaten Bandung', tanggal_lahir:'1975-04-04',
    jenis_kelamin:'Laki-laki', status_kawin:'Kawin', pekerjaan:'Petani', kewarganegaraan:'Indonesia',
    jalan:'Kampung Cikoneng RT 02', rt:'02', rw:'06', label_kelurahan:'Desa', kelurahan:'Cikoneng', kecamatan:'Ciparay',
    label_kota:'Kabupaten', kota:'Bandung', domisili_sementara:'Jalan Soekarno Hatta No. 720, Kota Bandung', provinsi:'Jawa Barat', telepon:'081200000010', email:'joko.p@contoh.id' },
  { id:'u11', nama:'Kartika Sari', nik:'3273115006880011', tempat_lahir:'Bandung', tanggal_lahir:'1988-06-10',
    jenis_kelamin:'Perempuan', status_kawin:'Kawin', pekerjaan:'Apoteker', kewarganegaraan:'Indonesia',
    jalan:'Jalan Buah Batu No. 25', rt:'03', rw:'03', label_kelurahan:'Kelurahan', kelurahan:'Turangga', kecamatan:'Lengkong',
    label_kota:'Kota', kota:'Bandung', domisili_sementara:'', provinsi:'Jawa Barat', telepon:'081200000011', email:'kartika.s@contoh.id' },
  { id:'u12', nama:'Lukman Hakim', nik:'3273122808940012', tempat_lahir:'Garut', tanggal_lahir:'1994-08-28',
    jenis_kelamin:'Laki-laki', status_kawin:'Belum Kawin', pekerjaan:'Arsitek', kewarganegaraan:'Indonesia',
    jalan:'Jalan Cipaganti No. 3', rt:'01', rw:'02', label_kelurahan:'Kelurahan', kelurahan:'Cipaganti', kecamatan:'Coblong',
    label_kota:'Kota', kota:'Bandung', domisili_sementara:'', provinsi:'Jawa Barat', telepon:'081200000012', email:'lukman.h@contoh.id' },
  { id:'u13', nama:'Maya Anggraini', nik:'3273135307930013', tempat_lahir:'Sumedang', tanggal_lahir:'1993-07-13',
    jenis_kelamin:'Perempuan', status_kawin:'Belum Kawin', pekerjaan:'Akuntan', kewarganegaraan:'Indonesia',
    jalan:'Jalan Dipatiukur No. 88', rt:'04', rw:'04', label_kelurahan:'Kelurahan', kelurahan:'Lebakgede', kecamatan:'Coblong',
    label_kota:'Kota', kota:'Bandung', domisili_sementara:'Jalan Tubagus Ismail Dalam No. 5, Kota Bandung', provinsi:'Jawa Barat', telepon:'081200000013', email:'maya.a@contoh.id' },
  { id:'u14', nama:'Nanda Firmansyah', nik:'3273141902860014', tempat_lahir:'Tasikmalaya', tanggal_lahir:'1986-02-19',
    jenis_kelamin:'Laki-laki', status_kawin:'Kawin', pekerjaan:'Karyawan Swasta', kewarganegaraan:'Indonesia',
    jalan:'Jalan Soekarno Hatta No. 501', rt:'08', rw:'05', label_kelurahan:'Kelurahan', kelurahan:'Cijawura', kecamatan:'Buahbatu',
    label_kota:'Kota', kota:'Bandung', domisili_sementara:'', provinsi:'Jawa Barat', telepon:'081200000014', email:'nanda.f@contoh.id' }
];

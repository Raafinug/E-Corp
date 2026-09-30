# E-PPAT Lab — Form Design

Ruang coba-coba internal: pembangun formulir tarik-lepas beserta pratinjau layar order.

## Menjalankan

```bash
cd eppat-lab
npm install      # sekali saja — mengunduh Electron
npm start
```

Butuh Node.js 18 atau lebih baru.

Berkas `renderer/index.html` juga bisa dibuka langsung di browser untuk melihat-lihat,
hanya saja rancangannya tidak tersimpan ke berkas.

## Isi

| Berkas | Peran |
|---|---|
| `main.js` | Proses utama Electron: jendela, menu, dan penyimpanan ke berkas |
| `preload.js` | Jembatan aman antara jendela dan proses utama |
| `renderer/index.html` | Kerangka layar |
| `renderer/styles.css` | Tampilan, mengikuti palet aplikasi |
| `renderer/seed.js` | Rancangan bawaan: Narahubung, Para Pihak, Objek, Dokumen |
| `renderer/app.js` | Pembangun formulir dan pratinjau |

## Tampilan

Cangkangnya mengikuti aplikasi: sidebar hijau dengan kartu identitas kantor, bilah atas,
remah roti, judul halaman, dan spanduk TERA. Tiga layar lab dipasang pada menu yang sesuai —
**Form Design** dan **Template Akta** di bawah E-PPAT Module, serta **Order AJB** di bawah
Layanan AJB. Menu lain ditampilkan tidak aktif, hanya untuk memperlihatkan letaknya.

## Cara pakai

**Rancang.** Palet elemen ada di kiri — tarik ke kanvas, atau klik untuk menambah di akhir.
Elemen di kanvas bisa ditarik ulang untuk mengubah urutan. Seluruh properti diatur lewat
modal, bukan panel samping, supaya kanvasnya lega.

**Bentuk tab.** Tiap tab punya dua kemungkinan bentuk:

- *Formulir tunggal* — field tampil langsung, dengan satu tombol simpan. Seperti tab Narahubung.
- *Daftar + modal tambah* — tab menampilkan tabel, dan field yang dirancang menjadi isi modal
  tambahnya. Field yang diberi nama kolom akan muncul sebagai kolom tabel. Seperti tab
  Para Pihak, Objek, dan Dokumen.

**Klik kanan pada elemen di kanvas** membuka menu: *Edit Elemen…*, *Duplikat*, dan *Hapus*.
Klik ganda adalah jalan pintas ke modal yang sama. Modalnya dua kolom dan memuat label,
kode variabel, wajib, lebar, daftar pilihan, teks contoh, teks bantuan, sumber pengisian,
syarat tampil, serta pengaturan kolom tabel bila tabnya berbentuk daftar.

**Tampil bila.** Tiap field dapat disembunyikan sampai field lain bernilai tertentu.
Contoh yang sudah terpasang: *Jenis Harta* hanya tampil bila Bentuk Pihak = Perorangan,
sedangkan *Nama Perseroan* dan *Jabatan Wakil* hanya tampil bila Bentuk Pihak = Badan Hukum (PT).
Pada tab Objek, *Gambar Denah / Surat Ukur* hilang bila Jenis Hak = satuan rumah susun.
Syarat boleh lebih dari satu dan digabung dengan DAN.

**Pratinjau Order.** Menampilkan hasil rancangan seperti layar order sungguhan. Tabelnya
hidup: tekan tombol tambah, isi modalnya, dan barisnya masuk ke tabel. Field bersyarat
muncul dan hilang saat pilihannya diubah.

## Kalau rancangan lama sudah tersimpan

Berkas `rancangan.json` dari versi sebelumnya tetap terbuka: bagian yang belum ada —
daftar bagian template dan pengaturan halaman — dilengkapi otomatis dari rancangan bawaan
saat aplikasi dibuka, tanpa menghapus field yang sudah Anda buat. Rujukan potongan yang
sudah tidak ada juga dibersihkan sendiri.

## Penyimpanan

Rancangan tersimpan otomatis ke `rancangan.json` di folder data aplikasi
(`app.getPath('userData')`). Menu **Berkas** menyediakan Rancangan Baru, Ekspor JSON,
dan Impor JSON untuk memindahkannya antar komputer.

## Template Akta — penyusunan kondisi

Menu **Template Akta** memakai susunan dua panel seperti aplikasi. Panel kiri berisi daftar
bagian — Catatan, Pasal, dan Bagian Otomatis yang ditandai *Kondisi · disusun sistem* — beserta
kotak pencarian. Panel kanan punya empat tab: **Bagian**, **Variabel**, **Pengaturan Halaman**,
dan **Pratinjau**.

**Menambah dan mengurutkan bagian.** Di bawah daftar tersedia tiga tombol: **+ Pasal**,
**+ Catatan**, dan **+ Bagian Otomatis**. Urutan bagian diubah lewat panah ↑ ↓ pada tiap kartu
atau dengan menyeret kartunya ke posisi baru. Judul berpola `Pasal n` dinomori ulang otomatis
mengikuti urutan; judul yang ditulis sendiri dibiarkan apa adanya.

**Penyunting naskah.** Kolom Isi pada Catatan dan Pasal, kolom Redaksi pada potongan, dan kolom
teks pada sisipan memakai penyunting kaya dengan bilah alat penuh: tebal, miring, garis bawah,
coret, besar-kecil huruf, hapus format, daftar titik dan bernomor, H1–H3, kutipan, warna teks,
warna sorot, ukuran huruf, tautan, gambar, perataan, indentasi, spasi baris, tabel, pemisah
halaman, garis, urung/ulangi, sumber HTML, pemilih `{ } Variabel`, dan pembesar area tulis.
Naskah disimpan sebagai HTML; berkas rancangan versi lama yang masih berupa teks polos
dialihkan sendiri saat dibuka.

Catatan dan Pasal berisi naskah bebas. Bagian Otomatis berisi potongan redaksi beserta syarat
tampilnya; pilihan field pada syarat diambil langsung dari Form Design, jadi menambah field di
sana langsung menambah pilihan di sini. Tab Variabel menampilkan seluruh variabel beserta
lingkup, tipe, dan sumber pengisiannya.

**Paket variabel dari satu field.** Elemen bertipe **Referensi user** adalah satu isian di order —
memilih satu orang — tetapi menghasilkan satu paket variabel sekaligus: data KTP apa adanya
(`{{nama}}`, `{{nik}}`, `{{tempat_lahir}}`, `{{jalan}}`, `{{rt}}`, `{{kelurahan}}`,
`{{domisili_sementara}}`, dan seterusnya)
ditambah turunan sistem (`{{tanggal_lahir_terbilang}}`, `{{sapaan}}`, `{{label_kelurahan}}`,
`{{label_kota}}`). Paketnya dipilih lewat daftar centang pada modal properti elemen, dan seluruh
pecahannya langsung muncul di tab Variabel, di pemilih `{ } Variabel`, serta di pilihan syarat.

Di tab Variabel dan di pemilih `{ } Variabel`, pecahan itu tidak berbaur dengan variabel lain:
tiap elemen berpaket — Referensi user maupun KBLI — punya blok sendiri berjudul **nama elemennya**
sebagaimana ditulis di modal properti, misalnya *User Klien* dan *User Pasangan*, beserta kodenya
dan jumlah variabel yang dihasilkannya. Jadi walau ada beberapa elemen pick user, jelas variabel
mana milik siapa tanpa perlu memanjangkan kode variabelnya.

Nama pecahannya polos dan maknanya ditentukan lingkup perulangan: pada potongan yang diulang tiap
baris Para Pihak, `{{nama}}` selalu berarti orang pada baris itu. Bila satu kalimat memuat orang
kedua, elemen Referensi user-nya diberi **awalan** — awalan `pasangan` menghasilkan
`{{pasangan.nama}}`, `{{pasangan.nik}}`, dan seterusnya.

**Terbilang.** Elemen **Angka** punya pilihan terbilang: terbilang saja, atau terbilang beserta
satuan — rupiah, saham, persen, lembar, meter persegi, atau satuan lain yang diketik sendiri.
Elemen **Tanggal** punya pilihan tanggal terbilang, nama hari, atau keduanya. Barisnya tampil
langsung di bawah kotak isian pada order, dan menghasilkan variabel turunan `{{<kode>_terbilang}}`
(serta `{{<kode>_hari}}` untuk nama hari) yang bisa dipakai di redaksi. Kotak isian angka juga
diberi pemisah ribuan sambil diketik.

**Bagian lipat.** Elemen **Bagian lipat** pada palet menjadi kartu yang bisa dibuka-tutup di layar
order. Field di bawahnya masuk ke dalam bagian itu sampai bertemu bagian lipat berikutnya. Tiap
bagian punya judul, keterangan di bawah judul, dan pilihan tertutup saat order dibuka.

**Grup berulang.** Elemen **Grup berulang** membuat blok yang barisnya bisa ditambah dan dihapus di
dalam satu formulir. Field di bawahnya masuk ke grup itu sampai bertemu bagian lipat atau grup
berulang berikutnya. Propertinya: kode grup, teks tombol tambah, baris minimal dan maksimal, serta
keterangan. Variabel field di dalamnya bernilai berbeda pada tiap baris, dan lingkupnya tertulis
`Tab › Nama grup (berulang)` di tab Variabel. Di Template Akta, grup itu muncul sebagai pilihan
**Diulang atas → Tiap baris <nama grup>**; di dalam perulangan itu `{{kode}}` selalu berarti baris
yang sedang ditulis, dan nomor urutnya dicetak sistem lewat kolom Penomoran.

Lebar elemen tersedia dalam empat ukuran: penuh, setengah, sepertiga, dan seperempat.

**Rakit Naskah.** Menu **Order AJB** punya tombol *⧉ Rakit Naskah*. Isi ordernya seperti pengguna
sungguhan — tambah pihak, objek, dokumen — lalu tekan tombol itu untuk melihat akta jadinya:
potongan yang syaratnya tidak terpenuhi dibuang, yang diulang ditulis sekali per baris dengan
nomor yang dicetak sistem, grup pilih-satu memilih satu pemenang, sisipan `[[slot:…]]` masuk sesuai
syaratnya, dan seluruh `{{variabel}}` berganti jadi nilai yang diisi. Variabel yang belum terisi
ditandai ⟨begini⟩ dan dihitung di kaki modal. Elemen Referensi user pada layar order memakai daftar
user contoh bawaan, sehingga paragraf identitas terisi utuh sampai NIK dan tanggal lahir terbilang.

**Perulangan di tingkat bagian.** Bagian Otomatis punya setelan sendiri: *Bagian ini diulang atas*,
*Dikelompokkan menurut*, *Penomoran baris*, dan *Nomor mulai dari 1 lagi di tiap kelompok*. Bila
disetel, seluruh potongan di dalamnya ikut satu putaran yang sama, sehingga klausa milik satu baris
tertulis menempel pada baris itu — bukan menumpuk di belakang. Tiap potongan lalu memilih **Ditulis**:
tiap baris, sekali di awal kelompok, sekali di akhir kelompok, atau sekali saja. Potongan boleh pula
punya perulangan bersarang di dalam baris induknya, misalnya riwayat perubahan anggaran dasar di
dalam satu pihak berbadan hukum.

**Variabel dokumen.** Variabel yang tidak berasal dari formulir order — penanggalan, nama penanda
tangan, wilayah kerja, penanda lembar — didaftarkan di tab **Pengaturan Halaman**, lengkap dengan
pilihan nilai tetap atau terisi otomatis dari tanggal pembuatan. Tidak ada satu pun yang ditanam di
dalam kode, jadi rancangan ini tidak terikat pada satu jenis dokumen atau satu profesi.

**Tema.** Warnanya sengaja netral supaya tidak terikat satu produk. Seluruh warna utama berasal dari
enam variabel di bagian `:root` berkas `renderer/styles.css` — `--aksen`, `--aksen-tua`, `--aksen-hi`,
`--aksen-lembut`, `--aksen-garis`, dan `--sisi` beserta turunannya. Ganti nilai itu saja untuk memakai
warna lain; sisa berkas tidak perlu disentuh.

**Ekspor.** Rancangan dapat dikeluarkan dalam dua bentuk. **Ekspor JSON** menghasilkan berkas yang
dibaca mesin dan bisa diimpor kembali. **Ekspor Word** menghasilkan dokumen bacaan berisi ringkasan
jumlah, daftar elemen tiap tab beserta syarat tampilnya, kamus variabel lengkap dengan lingkup dan
sumber pengisian, susunan dokumen bagian demi bagian dengan setelan dan redaksi tiap potongan
berikut sisipannya, serta pengaturan halaman. Keduanya tersedia sebagai tombol di bar Form Design
dan di menu Berkas (`Ctrl/Cmd+E` untuk JSON, `Ctrl/Cmd+Shift+E` untuk Word). Dokumen Word disusun
`docx-rancangan.js` di proses utama; datanya disiapkan renderer supaya aturannya tetap satu tempat.

**Tampil bila berlaku untuk semua elemen**, bukan hanya field isian: Judul bagian, Bagian lipat,
Grup berulang, dan Pencarian KBLI juga punya blok Tampil bila di modal propertinya. Menyembunyikan
Bagian lipat atau Grup berulang ikut menyembunyikan seluruh field di dalamnya, dan isian yang sedang
tersembunyi tidak ikut tersimpan saat baris disimpan.

**Impor / Ekspor Template saja.** Di bar menu Template Akta ada tombol **Impor Template** dan
**Ekspor Template**, juga di menu Berkas (`Ctrl/Cmd+Shift+O`). Berkas ini hanya memuat bagian,
potongan, grup pilih-satu, variabel dokumen, dan pengaturan halaman — **formulir order tidak ikut
tersentuh**, jadi template bisa dipindahkan antar rancangan tanpa merusak Form Design yang sudah
disesuaikan. Sesudah impor, lab memeriksa dan menyebutkan variabel mana pada template yang belum
ada di Form Design.

**Syarat tampil** berupa perbandingan sederhana — `=`, `≠`, `terisi` — yang digabung dengan DAN.
Untuk field bertipe teks atau angka, operator bawaannya langsung `terisi`.

**Sisipan bersyarat.** Tidak semua kondisi berupa paragraf yang muncul atau hilang utuh.
Persetujuan Dewan Komisaris, misalnya, menyisip di tengah kalimat kedudukan perseroan. Tandai
posisinya dengan `[[slot:kode]]` di dalam redaksi, lalu isi teks dan syaratnya pada kartu sisipan
di bawahnya.

**Grup pilih-satu.** Uraian objek bukan beberapa kondisi setara, melainkan satu grup yang memilih
satu pemenang menurut prioritas. Anggota grup dapat dinaikkan dan diturunkan urutannya.

**Perulangan dan penomoran.** Tiap potongan menyatakan diulang atas tab yang mana — tiap pihak,
tiap objek, tiap dokumen — dan gaya penomorannya. Nomor dicetak penyusun, tidak pernah diketik
ke dalam redaksi.

**Uji kondisi** ada di bawah editor: isi nilai fieldnya, dan hasil rakitannya langsung terlihat,
lengkap dengan sisipan yang ditandai. Variabel yang belum punya field di Form Design diberi
peringatan supaya tidak lolos ke draf.

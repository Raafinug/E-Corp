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
dalam satu formulir. Field di bawahnya masuk ke grup itu sampai bertemu **Akhir grup**, bagian lipat,
atau grup berulang berikutnya. Elemen **Akhir grup** menutup bagian lipat atau grup berulang yang
sedang berjalan tanpa membuka yang baru, jadi field sesudahnya berdiri sendiri. Propertinya: kode grup, teks tombol tambah, baris minimal dan maksimal, serta
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

---

## v0.9.1 — Awalan paket dan diagnosa Rakit Naskah

**Dua field Referensi user di satu tab tidak lagi saling menimpa.** Tiap field Referensi user
memekarkan paket identitas yang sama — `{{nama}}`, `{{nik}}`, `{{sapaan}}`, dan seterusnya. Jika
dua field semacam itu berada di satu tab tanpa **Awalan variabel** yang berbeda, keduanya menulis
ke variabel yang sama; pada baris di mana salah satunya kosong (karena syarat tampilnya tidak
terpenuhi), yang kosong itu dulu ikut menghapus isi kembarannya, sehingga seluruh identitas
menjadi kosong tanpa pesan apa pun. Sekarang field yang tidak terisi tidak pernah menghapus nilai
yang sudah ada, dan pasangan yang bentrok ditandai:

- lencana **paket bentrok** pada kartu di Form Design;
- peringatan di modal properti, dengan saran mengisi Awalan variabel (misalnya `wakil`, sehingga
  variabelnya menjadi `{{wakil.nama}}`);
- catatan di panel **Kenapa ada yang kosong** pada Rakit Naskah.

**Syarat yang tidak mungkin terpenuhi kini dilaporkan.** Bila sebuah syarat menguji nilai yang
tidak ada pada daftar pilihan fieldnya — misalnya `bentuk_pihak = "Badan Hukum"` sementara
opsinya `"Badan Hukum (PT)"` — Rakit Naskah menyebutkan syarat mana, nilai apa, dan pilihan apa
saja yang sebenarnya tersedia.

**Variabel di luar jangkauan dibedakan dari variabel yang tidak ada.** Dulu keduanya dilaporkan
sebagai "tidak dihasilkan formulir mana pun". Sekarang variabel yang fieldnya ada tetapi berada
di lingkup lain disebutkan asal tab dan grupnya, berikut saran menyetel "Diulang atas".

---

## v0.9.2 — Variabel global dan layar Profil Kantor

**Penanggalan, nomor, dan identitas kantor kini benar-benar global.** Variabel berikut selalu ada
pada tiap rancangan, tidak berasal dari formulir order mana pun, jadi bisa dipakai di bagian
template apa saja termasuk kepala akta yang tidak berulang:

| Variabel | Isi |
|---|---|
| `{{var_hari}}` | nama hari penandatanganan |
| `{{var_tanggal}}` | tanggal penandatanganan |
| `{{var_terbilang_tanggal}}` | tanggal dalam huruf |
| `{{var_pukul}}` | pukul penandatanganan, mis. `10.15` |
| `{{var_terbilang_pukul}}` | pukul dalam huruf, mis. *sepuluh lewat lima belas menit* |
| `{{deed_number}}` | nomor dokumen |

Keenamnya tampil di **Template Akta → Pengaturan Dokumen** dengan tanda **bawaan**: kodenya tetap
dan tidak bisa dihapus, supaya template yang memakainya tidak pernah putus. Variabel dokumen
buatan sendiri tetap bisa ditambah, diubah kodenya, dan dihapus seperti biasa.

**Layar Profil Kantor.** Menu *Engine Module → Profil Kantor* kini hidup, dengan susunan yang sama
seperti aplikasi asli — Nama NOTARIS, Nomor SK Pengangkatan, Wilayah Kerja, Telepon, Email, Alamat
Kantor — ditambah tiga isian baru: **Tanggal SK Pengangkatan**, **Gelar disingkat**, dan **Gelar
tidak disingkat**. Tiap isian memperlihatkan kode variabelnya sendiri di bawah kotaknya.

Dari isian itu dirakit tiga variabel turunan:

| Variabel | Isi | Dipakai di |
|---|---|---|
| `{{notaris_nama_gelar}}` | nama + gelar disingkat | kartu kantor |
| `{{notaris_nama_gelar_panjang}}` | nama + gelar tidak disingkat | badan akta |
| `{{notaris_sk_tanggal_terbilang}}` | tanggal SK dalam huruf | badan akta |

**Kartu kantor di sisi kiri layar tidak lagi ditulis tetap** — isinya dibaca dari variabel yang
sama dan berubah begitu Profil Kantor disunting, memakai nama bergelar singkat sesuai aturan itu.

---

## v0.9.3 — Blok berulang di dalam redaksi

**KBLI dan grup berulang bukan variabel tunggal.** `{{kbli}}` sendiri tidak pernah menghasilkan
apa-apa, karena isinya bisa nol, satu, atau sepuluh baris. Dulu satu-satunya jalan adalah memecah
pasal menjadi beberapa bagian dan membuat Bagian Otomatis tersendiri — repot untuk daftar yang
duduk di tengah sebuah pasal.

Sekarang redaksi mana pun boleh memuat **blok berulang**:

```
[[ulang:kbli]]{{huruf_baris}}. {{kbli_kode}} — {{kbli_judul}};<br>[[/ulang]]
```

Isi di antara kedua penanda ditulis sekali untuk tiap baris lingkup itu, memakai konteks barisnya
sendiri. Di dalam blok tersedia `{{nomor_baris}}` (1, 2, 3) dan `{{huruf_baris}}` (a, b, c).
Blok ini berlaku untuk semua lingkup berulang — KBLI maupun Grup berulang — dan bisa dipakai di
redaksi bagian biasa, potongan bagian otomatis, maupun teks sisipan `[[slot:…]]`.

Tombolnya ada di panel **{ } Variabel** editor, pada kelompok **Blok berulang**; sekali klik
menyisipkan kerangkanya lengkap.

**Tiga cacat yang ikut diperbaiki:**

- Tab bermode **formulir** tidak pernah menyimpan pilihan KBLI dan baris grup berulangnya — hanya
  tab bermode daftar yang merekamnya lewat modal Tambah. Sekarang keduanya dicatat setiap kali
  berubah, dan dikembalikan saat layar digambar ulang, jadi tidak hilang ketika pindah menu.
- Panel **{ } Variabel** tidak pernah memuat variabel turunan KBLI (`{{kbli_kode}}`,
  `{{kbli_judul}}`, `{{kbli_golongan}}`), karena elemen KBLI dilewati seluruhnya sebagai elemen
  tanpa nilai. Turunannya kini terdaftar, dan ikut diperiksa sebagai variabel yang sah.
- Memakai nama lingkup sebagai variabel — menulis `{{kbli}}` begitu saja — kini dijelaskan
  sendiri oleh Rakit Naskah, lengkap dengan bentuk blok yang seharusnya dipakai.

---

## v0.9.4 — Blok berulang sebagai sub-daftar

Penanda `[[ulang:…]]` yang diketik **di dalam satu butir daftar** — atau satu paragraf, atau satu
baris tabel — kini diangkat keluar dari pembungkusnya sebelum dirakit. Yang berulang menjadi butir
itu sendiri, bukan isi di dalam satu butir, sehingga satu sub-butir di editor berubah menjadi
sub-daftar bernomor:

```html
<li>… kegiatan usaha sebagai berikut:
  <ol><li>[[ulang:kbli]]{{kbli_kode}} — {{kbli_judul}};[[/ulang]]</li></ol>
</li>
```

menghasilkan

```
2. Untuk mencapai maksud dan tujuan tersebut di atas, Perseroan dapat
   melaksanakan kegiatan usaha sebagai berikut:
   1. 01111 — Pertanian Jagung;
   2. 01132 — Pertanian Buah Semusim;
```

Cara membuatnya di editor: taruh kursor di ujung kalimat pengantar, tekan Enter untuk butir baru,
tekan tombol indent (⇥) supaya menjadi sub-butir, lalu klik `[[ulang:kbli]]` di panel
**{ } Variabel**. Penomorannya ditangani daftar itu sendiri.

**Penghitung baris** di dalam blok: `{{nomor_baris}}` dan padanannya `{{angka_baris}}` (1, 2, 3),
`{{huruf_baris}}` (a, b, c), dan `{{romawi_baris}}` (I, II, III) — hanya diperlukan bila
penomorannya mau diketik sendiri, bukan diserahkan ke daftar.

Daftar KBLI contoh ditambah empat baris bidang pertanian dan industri, supaya contoh di luar
bidang konstruksi juga bisa dicoba.

---

## v0.9.5 — Gaya penanda daftar

Bilah alat penyunting kini punya pemilih **gaya penanda daftar** dan kotak **Mulai**, tepat di
sebelah tombol daftar bernomor, seperti pada penyunting aplikasi asli. Keduanya hidup hanya ketika
kursor berada di dalam sebuah daftar, dan langsung menampilkan gaya daftar yang sedang ditempati.

Daftar bernomor:

| Pilihan | Hasil |
|---|---|
| `1. 2. 3.` | angka |
| `a. b. c.` | huruf kecil |
| `A. B. C.` | huruf besar |
| `i. ii. iii.` | romawi kecil |
| `I. II. III.` | romawi besar |
| `Ikut induk (I.1. / A.1. / a.1.)` | penanda induk + nomor sendiri |

Daftar titik: `•` bulat, `–` strip, `◦` lingkaran, `▪` kotak. Pilihan **strip** memberi penanda
`-` seperti yang dipakai pada butir akta perubahan.

**Mulai** mengatur nomor awal sebuah daftar bernomor — berguna ketika satu daftar terputus oleh
paragraf lalu dilanjutkan.

Gaya "Ikut induk" mengambil penanda daftar induknya apa adanya, jadi induk romawi besar
menghasilkan `I.1.`, induk huruf besar menghasilkan `A.1.`, dan seterusnya. Penomorannya dirakit
dengan penghitung CSS, sehingga ikut berubah sendiri ketika butir ditambah, dihapus, atau diurut
ulang — dan tampil sama di editor maupun di Rakit Naskah.

---

## v0.9.6 — Peran pengguna, dan pemilih daftar yang bisa diklik

**Pemilih gaya daftar tidak bisa dibuka.** Bilah alat menahan `mousedown` pada seluruh tombol agar
sorotan teks di dalam penyunting tidak lenyap saat tombol ditekan. Penahanan itu ikut mengenai
`<select>`, dan pada Chromium hal tersebut menahan daftar pilihannya terbuka — jadi pemilih gaya
penanda, ukuran huruf, dan spasi baris hanya bisa diubah lewat papan tik. Sekarang `<select>` dan
`<input>` dilewati; sorotannya sudah direkam lebih dulu lewat mouseup/keyup/blur, jadi perubahannya
tetap mengenai daftar yang benar.

**Peran pengguna.** Kartu pengguna di bilah atas kini bisa diganti antara **Super Admin**,
**Notaris / PPAT**, dan **Asisten**, supaya layar Template Akta bisa dilihat sebagaimana tiap peran
melihatnya. Peran tersimpan bersama rancangan.

Bagi PPAT dan Asisten:

- panel kiri hanya menawarkan **+ Pasal** dan **+ Catatan**; **+ Bagian Otomatis** dan **Impor
  Template** tidak ada;
- bagian otomatis ditandai gembok, tidak bisa diurut ulang, diseret, diganti judulnya, maupun
  dihapus, dan potongannya tidak bisa ditambah atau dibuang;
- potongan yang dipilih hanya menampilkan **Tulisan** — syarat tampil, perulangan, penomoran, dan
  grup pilih-satu tampil sebagai keterangan terkunci di sebelah judulnya;
- sisipan bersyarat di dalam kalimat tetap bisa disunting tulisannya, syaratnya tidak;
- di bawah editor tertulis **Dipakai pada** — bagian mana saja yang memakai potongan itu.

Pasal dan Catatan tetap sepenuhnya milik kantor: bisa ditambah, disunting, diurut, dan dihapus oleh
ketiga peran.

---

## v0.9.7 — Minuta sebagai ruang drafting

Pembagian tugasnya sekarang tegas: **Template Akta** menyusun struktur dan syarat, **Minuta**
merapikan tulisan.

**Template Akta hanya untuk Super Admin.** Bagi Notaris dan Asisten menu itu mati, dan bila
sempat dibuka layarnya langsung berpindah ke Minuta. Tampilan Template Akta kembali penuh tanpa
cabang terbatas — memang hanya satu peran yang melihatnya.

**Menu Minuta hidup.** Isinya ruang kerja drafting satu order:

- panel kiri memuat seluruh bagian; **Pasal & Catatan** bisa ditambah, diurut, diganti judulnya,
  dan dihapus, sedangkan **bagian otomatis** bergembok karena strukturnya milik Template Akta;
- tab **Naskah** menampilkan hasil perakitan lengkap dengan panel *Kenapa ada yang kosong*;
- tab **Tulisan** menyunting isi bagian terpilih. Pada bagian otomatis, potongannya bisa diklik
  satu per satu dan hanya tulisannya yang terbuka — syarat tampil, perulangan, penomoran, dan grup
  pilih-satu tampil sebagai keterangan terkunci;
- tombol **⟳ Rakit ulang** menyusun naskahnya lagi sesudah tulisan diubah.

Aturan ini berlaku untuk semua peran di Minuta, termasuk Super Admin: Minuta memang bukan tempat
mengubah struktur.

**Tombol di Order A berganti** dari *Rakit Naskah* menjadi **✎ Buka Drafting**, yang membawa
langsung ke Minuta; dari sana **‹ Kembali ke Order** membawa balik. Modal hasil perakitan yang
lama tidak dipakai lagi karena naskahnya sudah tampil utuh di dalam Minuta.

---

## v0.9.8 — Tampilkan di tabel

Kolom tabel pada layar Order dulu ditentukan secara tersirat: sebuah field menjadi kolom kalau
kotak *Tampil sebagai kolom tabel* diisi, dan berhenti menjadi kolom kalau dikosongkan. Judul
kolom merangkap sakelar — tidak terbaca sebagai pilihan, dan tidak terlihat dari kanvas.

Sekarang ada sakelar tersendiri di modal properti: **Tampilkan di tabel**, bawaannya mati. Sakelar
itu hanya muncul pada tab bermode **Daftar + modal tambah** — tab bermode formulir tidak punya
tabel, jadi tidak ada yang perlu dipilih. Elemen tanpa nilai (judul bagian, bagian lipat, grup
berulang, KBLI, akhir grup) juga tidak menawarkannya.

Ketika sakelarnya hidup, dua isian menyusul:

- **Judul kolom** — kosong berarti memakai label fieldnya dalam huruf besar;
- **Gaya kolom** — teks biasa, pil biru, atau chip hijau.

Urutan kolom mengikuti urutan field di kanvas, jadi memindahkan kartunya sekaligus memindahkan
kolomnya. Di kanvas, field yang tampil di tabel diberi lencana **di tabel** supaya susunan
tabelnya terbaca tanpa membuka satu per satu.

Bila tidak ada satu pun field yang dinyalakan, tabel jatuh ke satu kolom **Ringkasan** berisi semua
isian baris itu, disertai keterangan cara menyalakannya.

Rancangan lama ikut terbawa: field yang sudah punya judul kolom otomatis dianggap menyala.

---

## v0.9.9 — Layanan, banyak template, dan template yang dipakai order

Selama ini lab hanya mengenal satu template. Sekarang susunannya bertingkat, seperti aplikasi
aslinya:

```
LAYANAN (jenis akta)
├─ Form Design        satu rancangan formulir order per layanan
└─ Template           beberapa naskah untuk formulir yang sama
   ├─ AJB Standar     ← template bawaan, otomatis dipakai order
   ├─ AJB Bawaan Platform
   └─ AJB (salinan kantor)
```

**Template Akta kini dibuka lewat daftar.** Layarnya dimulai dari pemilih *Layanan (jenis akta)*
dan tabel template layanan itu — kode, nama, dan lencana *Bawaan platform* / *Milik kantor* /
*Dipakai order*. Template milik kantor dibuka lewat **Pasal**; template bawaan platform hanya bisa
**Lihat**, dan **⧉ Salin & Sunting** membuat salinan milik kantor lalu langsung membukanya.
**+ Tambah Template** membuat template kosong untuk layanan yang sedang dipilih. Di dalam editor,
**‹ Kembali** membawa balik ke daftarnya.

**Menu baru: Layanan & Template.** Inilah tempat menetapkan template mana yang otomatis dipakai
order sebuah layanan — kolom *Template bawaan untuk order*. Di sini juga terlihat berapa tab
formulir dan berapa template yang dimiliki tiap layanan, dan tombol **Formulir** membawa ke Form
Design layanan itu.

**Order A memilih layanannya dan templatenya.** Di bilah judulnya ada dua pemilih: *Layanan*
menentukan formulir mana yang diisi, dan *Template* menentukan naskah mana yang dirakit —
bawaannya mengikuti template bawaan layanan, dan bisa ditimpa khusus untuk order itu.

**Minuta mengikuti pilihan order,** bukan template yang kebetulan sedang dibuka di Template Akta.
Judulnya menyebutkan layanan dan template yang sedang dirakit.

Rancangan lama ikut naik sendiri: isinya menjadi layanan **AJB** dengan template **AJB Standar**
(milik kantor, dipakai order) ditambah satu salinan **AJB Bawaan Platform** sebagai contoh template
platform yang hanya bisa dilihat.

**Satu cacat lama ikut terbongkar:** kelas `.utama` dipakai untuk dua hal berbeda — kolom isi
aplikasi (yang memang `display:flex`) dan sel tabel `td.utama`. Akibatnya setiap sel tabel
sebenarnya adalah kotak flex; baru terlihat sekarang karena sel template memuat lebih dari satu
elemen, dan kolomnya bertumpuk ke bawah. `td.utama` kini dikembalikan menjadi sel tabel biasa.

---

## v0.10.0 — Satu layanan satu template, dan order sebagai daftar

**Satu layanan hanya boleh punya satu template.** Aturannya dipaksakan di tiga tempat: normaliser
melepas template berlebih saat berkas dimuat dan memberi template kosong kepada layanan yang belum
punya; layar Template Akta tidak lagi menawarkan *+ Tambah Template*; dan **⧉ Salin & Sunting**
pada template bawaan platform kini *menggantikan* template layanan itu dengan salinan milik kantor,
bukan menambah satu lagi. Karena tiap layanan hanya punya satu, order tidak perlu memilih template
— ia otomatis memakai template layanannya.

**Daftar template kini satu baris per layanan.** Kolomnya Layanan, Template, dan aksinya; pemilih
layanan di atasnya tidak diperlukan lagi.

**Order menjadi daftar, bukan dropdown.** Kelompok *Layanan Engine* di sidebar memuat satu butir
per layanan — *Order AJB*, *Order LYN2*, dan seterusnya. Membukanya menampilkan **daftar order**
layanan itu: nama order, layanan, template yang dipakai, ringkasan isian, dan tombol **Buka** /
**Hapus**, ditambah **+ Tambah Order**. Satu layanan boleh punya beberapa order. Tombol **‹ Kembali**
di dalam order membawa balik ke daftarnya.

**Tiap order menyimpan isiannya sendiri.** Baris tabel dan isian formulir kini melekat pada
ordernya, jadi berpindah order tidak lagi menghapus isian order lain — sebelumnya isian order
bersifat global dan tertimpa begitu formulir berganti.

**Menambah layanan sekarang lengkap sekali jalan:** layanan baru langsung memperoleh rancangan
formulirnya, satu template kosong, satu order, dan butir menunya sendiri di sidebar. Menghapus
layanan ikut menghapus template dan ordernya, dengan konfirmasi.

Tabel *Layanan & Template* menyesuaikan: kolom *Template bawaan untuk order* diganti nama template
layanan itu (karena tinggal satu), ditambah kolom **Order** berisi jumlah order dan tombol
menambah, serta tombol **Hapus** layanan.

---

## v0.10.1 — Mengganti nama layanan, template, dan order

Tombol **⚙ Ubah** sebelumnya memakai `window.prompt`. **Electron tidak menyediakan fungsi itu** —
ia melempar *"prompt() is and will not be supported."* — jadi selama ini tombol tersebut tidak
melakukan apa pun di aplikasi lab, meskipun berjalan normal di peramban biasa. Dua tombol pada
bilah penyunting, **Sisipkan tautan** dan **Sisipkan gambar**, terkena cacat yang sama.

Semuanya kini lewat modal isian sendiri:

- **⚙ Ubah** pada baris layanan mengubah **kode layanan, nama layanan, kode template, dan nama
  template** sekaligus — karena satu layanan hanya punya satu template, keduanya memang selalu
  diubah bersamaan;
- **⚙ Ubah** pada daftar Template Akta mengubah kode dan nama templatenya saja;
- **⚙ Ubah** pada daftar order mengubah nama ordernya;
- **Sisipkan tautan** dan **Sisipkan gambar** meminta alamatnya lewat modal yang sama.

Modalnya menerima **Enter** untuk menyimpan dan **Esc** untuk batal. Perubahan nama langsung
terlihat di butir menu sidebar, daftar template, daftar order, judul layar Minuta, dan kepala
editor template.

---

## v0.10.2 — Form Design sebagai daftar, dan kolom dari paket user

**Form Design kini dimulai dari daftar**, sejalan dengan Template Akta dan Order. Tabelnya memuat
satu baris per layanan: kode dan nama layanan, jumlah tab, jumlah field, nama templatenya, dan
tombol **Rancang formulir**. Di dalam editornya, **‹ Kembali** membawa balik ke daftar itu.

**Lencana "AJB" di kepala layar ternyata ditulis tetap di berkas HTML**, jadi ia tidak pernah ikut
berubah meskipun layanannya sudah diganti nama — hal yang sama pada kepala editor Template Akta.
Keduanya kini dibaca dari layanan dan template yang sedang dibuka: judulnya menjadi
*Formulir &lt;nama layanan&gt;* dengan lencana kode layanan, dan *&lt;nama template&gt;* dengan
lencana kode template.

**Kolom tabel dari field Referensi user bisa memilih datanya.** Satu field Referensi user
memekarkan 22 variabel identitas; dulu kolomnya selalu mencetak nama. Sekarang, begitu
**Tampilkan di tabel** dinyalakan pada field bertipe Referensi user, muncul pemilih **Data yang
ditampilkan di kolom** berisi seluruh variabel paketnya — nama, NIK, tempat lahir, pekerjaan,
alamat, dan seterusnya, masing-masing disertai kode variabelnya. Isian di dalam modal tetap berupa
pencarian user; yang berubah hanya apa yang dicetak di kolom.

Bila fieldnya membatasi paket (lewat daftar centang pada propertinya), pemilih ini hanya menawarkan
variabel yang dicentang.

---

## v0.10.3 — Impor & Ekspor Formulir

**Impor JSON** mengganti seluruh rancangan, termasuk template naskahnya. Untuk memasukkan rancangan
formulir dari luar tanpa menyentuh template, bilah Form Design kini punya dua tombol baru:

- **Impor Formulir** — menukar rancangan formulir layanan yang sedang dibuka dengan isi berkas,
  setelah konfirmasi yang menyebut berapa tab dan berapa elemen yang akan masuk. Template naskah
  layanan itu tidak disentuh sama sekali. Isian order layanan tersebut dikosongkan, karena
  formulirnya berganti. Sesudah impor, lab menghitung berapa variabel template yang kini tidak lagi
  punya field.
- **Ekspor Formulir** — kebalikannya, mengeluarkan rancangan formulir layanan yang sedang dibuka.

Bentuk berkasnya:

```json
{ "jenis": "formulir-engine", "versi": 1,
  "layanan": { "kode": "AJB", "nama": "Akta Jual Beli" },
  "tab": [ … ] }
```

Kode dan nama layanan pada berkas ikut menimpa layanan tujuannya, sehingga satu berkas sudah cukup
untuk memindahkan seluruh rancangan formulir sebuah layanan.

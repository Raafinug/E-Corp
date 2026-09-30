'use strict';
/* Menyusun dokumen Word dari ringkasan rancangan yang dikirim renderer.
   Sengaja hanya menerima data siap pakai, supaya aturan penyusunannya tetap satu
   tempat di renderer dan berkas ini murni soal tata letak dokumen. */
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  Header, Footer, PageNumber, PageBreak
} = require('docx');

const AKSEN = '39414F', ABU = '6B7280', GARIS = 'E4E6EA', LATAR = 'F3F4F6';

const T  = (t, o) => new TextRun(Object.assign({ text: String(t == null ? '' : t), size: 20 }, o || {}));
const P  = (anak, o) => new Paragraph(Object.assign({ spacing: { after: 110, line: 290 },
  children: Array.isArray(anak) ? anak : [T(anak)] }, o || {}));
const H1 = t => new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 340, after: 150 },
  children: [T(t, { size: 28, bold: true, color: AKSEN })] });
const H2 = t => new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 260, after: 110 },
  children: [T(t, { size: 23, bold: true, color: AKSEN })] });
const H3 = t => new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 190, after: 90 },
  children: [T(t, { size: 20, bold: true, color: '333333' })] });
const KODE = t => T(t, { font: 'Consolas', size: 18, color: '8A3324' });
const HAMPA = t => P([T(t, { italics: true, color: ABU })]);

function tabel(kepala, baris, lebar) {
  const total = lebar.reduce((a, b) => a + b, 0);
  const sel = (isi, opt) => new TableCell({
    width: { size: opt.w, type: WidthType.DXA },
    shading: opt.kepala ? { type: ShadingType.CLEAR, fill: AKSEN }
           : (opt.ganjil ? { type: ShadingType.CLEAR, fill: 'F8F9FA' } : undefined),
    margins: { top: 80, bottom: 80, left: 110, right: 110 },
    /* isi sel berupa teks biasa, atau daftar TextRun untuk satu paragraf */
    children: [new Paragraph({
      spacing: { after: 0, line: 260 },
      children: Array.isArray(isi) ? isi
        : [T(isi, { size: 17, bold: !!opt.kepala, color: opt.kepala ? 'FFFFFF' : '222222' })]
    })]
  });
  return new Table({
    width: { size: total, type: WidthType.DXA }, columnWidths: lebar,
    borders: ['top','bottom','left','right','insideHorizontal','insideVertical'].reduce((a, k) => {
      a[k] = { style: BorderStyle.SINGLE, size: 4, color: GARIS }; return a; }, {}),
    rows: [
      new TableRow({ tableHeader: true, children: kepala.map((h, i) => sel(h, { kepala: true, w: lebar[i] })) }),
      ...baris.map((r, j) => new TableRow({ children: r.map((c, i) => sel(c, { w: lebar[i], ganjil: j % 2 === 1 })) }))
    ]
  });
}
function kutipan(teks) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA }, columnWidths: [9360],
    borders: {
      top:    { style: BorderStyle.SINGLE, size: 4,  color: GARIS },
      bottom: { style: BorderStyle.SINGLE, size: 4,  color: GARIS },
      left:   { style: BorderStyle.SINGLE, size: 18, color: AKSEN },
      right:  { style: BorderStyle.SINGLE, size: 4,  color: GARIS },
      insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE }
    },
    rows: [new TableRow({ children: [new TableCell({
      width: { size: 9360, type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: LATAR },
      margins: { top: 120, bottom: 120, left: 160, right: 160 },
      children: String(teks || '—').split('\n').map(b => new Paragraph({
        spacing: { after: 60, line: 280 }, children: [T(b, { size: 19 })] }))
    })] })]
  });
}

function bangun(spek) {
  const isi = [];
  const A = (...x) => x.forEach(y => Array.isArray(y) ? isi.push(...y) : isi.push(y));

  /* ---- sampul ---- */
  A(
    new Paragraph({ spacing: { before: 2200, after: 0 },
      children: [T(spek.produk || 'ENGINE', { size: 19, bold: true, color: AKSEN, characterSpacing: 60 })] }),
    new Paragraph({ spacing: { before: 110, after: 80 },
      children: [T('Rancangan Formulir & Template', { size: 50, bold: true, color: AKSEN })] }),
    new Paragraph({ spacing: { after: 200 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: AKSEN, space: 8 } },
      children: [T(spek.subjudul || 'Dokumen bacaan yang dihasilkan dari rancangan', { size: 24, color: '444444' })] }),
    P('Dokumen ini dihasilkan langsung dari rancangan yang sedang dipakai, jadi isinya selalu sama ' +
      'dengan apa yang berjalan di aplikasi. Pasangannya adalah berkas JSON yang dibaca mesin; ' +
      'yang ini untuk dibaca orang.'),
    new Paragraph({ spacing: { before: 400 } }),
    tabel(['Hal', 'Nilai'], (spek.ringkas || []).map(r => [r[0], String(r[1])]), [3000, 6360]),
    new Paragraph({ children: [new PageBreak()] })
  );

  /* ---- 1. formulir ---- */
  A(H1('1. Formulir order'));
  A(P('Tiap tab adalah satu layar pada order. Field di sini sekaligus menjadi kamus variabel bagi template.'));
  (spek.tab || []).forEach((t, i) => {
    A(H2('1.' + (i + 1) + ' Tab ' + t.nama));
    A(P([T('Bentuk tab: ', { bold: true }), T(t.mode)]));
    if (!t.field.length) { A(HAMPA('Tab ini belum berisi elemen.')); return; }
    A(tabel(['Elemen', 'Kode', 'Tipe', 'Lebar', 'Sumber', 'Tampil bila'],
      t.field.map(f => [
        f.label, f.kode ? [KODE('{{' + f.kode + '}}')] : '—',
        f.tipe + (f.wajib ? ' · wajib' : ''), f.lebar, f.sumber || '—', f.syarat || 'selalu'
      ]), [1900, 1900, 1500, 1000, 1700, 1360]));
    (t.catatan || []).forEach(c => A(P([T('• ', { color: ABU }), T(c, { color: ABU, size: 18 })])));
  });
  A(new Paragraph({ children: [new PageBreak()] }));

  /* ---- 2. variabel ---- */
  A(H1('2. Kamus variabel'),
    P('Seluruh variabel yang tersedia bagi redaksi, beserta lingkup dan asal isinya.'),
    tabel(['Variabel', 'Keterangan', 'Lingkup', 'Sumber'],
      (spek.variabel || []).map(v => [[KODE('{{' + v.kode + '}}')], v.label, v.lingkup, v.sumber]),
      [2700, 2700, 2360, 1600]));
  if ((spek.varDokumen || []).length) {
    A(H2('2.1 Variabel dokumen'),
      P('Variabel yang tidak berasal dari formulir order. Nilainya diatur di Pengaturan Halaman.'),
      tabel(['Variabel', 'Keterangan', 'Isi'],
        spek.varDokumen.map(v => [[KODE('{{' + v.kode + '}}')], v.label, v.isi]),
        [2700, 3300, 3360]));
  }
  A(new Paragraph({ children: [new PageBreak()] }));

  /* ---- 3. susunan dokumen ---- */
  A(H1('3. Susunan dokumen'),
    P('Bagian tertulis berurutan seperti daftar di bawah ini.'));
  (spek.bagian || []).forEach((b, i) => {
    A(H2('3.' + (i + 1) + ' ' + b.judul + '  —  ' + b.jenis));
    if (!b.otomatis) { A(kutipan(b.teks)); return; }
    if (b.ulang) {
      A(P([T('Bagian ini berputar atas ', { bold: true }), T(b.ulang),
        T(b.kelompok ? ', dikelompokkan menurut ' + b.kelompok : ''),
        T(b.nomor && b.nomor !== 'tanpa' ? ', penomoran ' + b.nomor : ''),
        T(b.nomorUlangKelompok ? ', nomor mulai dari 1 lagi tiap kelompok' : '')]));
    } else {
      A(HAMPA('Tiap potongan berputar sendiri-sendiri.'));
    }
    if (!b.potongan.length) { A(HAMPA('Belum ada potongan.')); return; }
    b.potongan.forEach((p, j) => {
      A(H3('3.' + (i + 1) + '.' + (j + 1) + ' ' + p.judul));
      const rincian = [];
      rincian.push(['Kode', [KODE(p.kode)]]);
      rincian.push(['Syarat tampil', p.syarat || 'selalu']);
      if (b.ulang) rincian.push(['Ditulis', p.tulis]);
      if (p.ulang) rincian.push(['Perulangan', p.ulang]);
      if (!b.ulang && p.nomor && p.nomor !== 'tanpa') rincian.push(['Penomoran', p.nomor]);
      if (p.grup) rincian.push(['Grup pilih-satu', p.grup]);
      A(tabel(['Setelan', 'Nilai'], rincian, [2400, 6960]));
      A(P([T('Redaksi', { bold: true, size: 18, color: ABU })], { spacing: { before: 140, after: 60 } }));
      A(kutipan(p.teks));
      (p.slot || []).forEach(sl => {
        A(P([T('Sisipan ', { bold: true, size: 18, color: ABU }), KODE('[[slot:' + sl.kode + ']]'),
             T('  ' + sl.label, { size: 18, color: ABU })], { spacing: { before: 130, after: 50 } }));
        A(P([T('Syarat: ', { size: 18, color: ABU }), T(sl.syarat || 'selalu', { size: 18 })]));
        A(kutipan(sl.teks));
      });
    });
  });

  /* ---- 4. pengaturan halaman ---- */
  if (spek.halaman && spek.halaman.length) {
    A(new Paragraph({ children: [new PageBreak()] }),
      H1('4. Pengaturan halaman'),
      tabel(['Setelan', 'Nilai'], spek.halaman.map(r => [r[0], String(r[1] || '—')]), [3000, 6360]));
  }

  return new Document({
    creator: spek.produk || 'Engine',
    title: 'Rancangan Formulir & Template',
    styles: { default: { document: { run: { font: 'Calibri', size: 20, color: '222222' } } } },
    sections: [{
      properties: { page: { margin: { top: 1100, bottom: 1000, left: 1100, right: 1100 } } },
      headers: { default: new Header({ children: [new Paragraph({
        alignment: AlignmentType.RIGHT,
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GARIS, space: 6 } },
        children: [T('Rancangan Formulir & Template · ' + (spek.tanggal || ''), { size: 15, color: ABU })] })] }) },
      footers: { default: new Footer({ children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ children: ['Halaman ', PageNumber.CURRENT, ' dari ', PageNumber.TOTAL_PAGES],
          size: 15, color: ABU })] })] }) },
      children: isi
    }]
  });
}

async function buatBuffer(spek) {
  return Packer.toBuffer(bangun(spek));
}
module.exports = { buatBuffer };

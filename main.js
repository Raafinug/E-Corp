'use strict';
const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');

const BERKAS = () => path.join(app.getPath('userData'), 'rancangan.json');
let jendela = null;

function buatJendela() {
  jendela = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 640,
    backgroundColor: '#eef3f1',
    title: 'E-PPAT Lab — Form Design',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });
  jendela.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

function pasangMenu() {
  const menu = Menu.buildFromTemplate([
    {
      label: 'Berkas',
      submenu: [
        { label: 'Rancangan Baru', accelerator: 'CmdOrCtrl+N',
          click: () => jendela && jendela.webContents.send('menu', 'baru') },
        { type: 'separator' },
        { label: 'Ekspor JSON…', accelerator: 'CmdOrCtrl+E',
          click: () => jendela && jendela.webContents.send('menu', 'ekspor') },
        { label: 'Impor JSON…', accelerator: 'CmdOrCtrl+O',
          click: () => jendela && jendela.webContents.send('menu', 'impor') },
        { type: 'separator' },
        { label: 'Impor Template Saja…', accelerator: 'CmdOrCtrl+Shift+O',
          click: () => jendela && jendela.webContents.send('menu', 'impor-template') },
        { type: 'separator' },
        { label: 'Ekspor Rancangan ke Word…', accelerator: 'CmdOrCtrl+Shift+E',
          click: () => jendela && jendela.webContents.send('menu', 'ekspordocx') },
        { type: 'separator' },
        { role: 'quit', label: 'Keluar' }
      ]
    },
    {
      label: 'Tampilan',
      submenu: [
        { role: 'reload', label: 'Muat Ulang' },
        { role: 'toggleDevTools', label: 'Alat Pengembang' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Ukuran Normal' },
        { role: 'zoomIn', label: 'Perbesar' },
        { role: 'zoomOut', label: 'Perkecil' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Layar Penuh' }
      ]
    }
  ]);
  Menu.setApplicationMenu(menu);
}

/* ---------- penyimpanan lokal ---------- */
ipcMain.handle('muat', async () => {
  try {
    return JSON.parse(await fs.readFile(BERKAS(), 'utf8'));
  } catch {
    return null;                       // belum ada; renderer memakai rancangan bawaan
  }
});

ipcMain.handle('simpan', async (_e, data) => {
  await fs.mkdir(path.dirname(BERKAS()), { recursive: true });
  await fs.writeFile(BERKAS(), JSON.stringify(data, null, 2), 'utf8');
  return BERKAS();
});

ipcMain.handle('ekspor', async (_e, data) => {
  const { canceled, filePath } = await dialog.showSaveDialog(jendela, {
    title: 'Ekspor rancangan',
    defaultPath: 'rancangan-form.json',
    filters: [{ name: 'JSON', extensions: ['json'] }]
  });
  if (canceled || !filePath) return null;
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  return filePath;
});

ipcMain.handle('impor', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(jendela, {
    title: 'Impor rancangan',
    properties: ['openFile'],
    filters: [{ name: 'JSON', extensions: ['json'] }]
  });
  if (canceled || !filePaths.length) return null;
  return JSON.parse(await fs.readFile(filePaths[0], 'utf8'));
});

ipcMain.handle('ekspor-docx', async (_e, spek) => {
  const { canceled, filePath } = await dialog.showSaveDialog(jendela, {
    title: 'Ekspor rancangan ke Word',
    defaultPath: 'rancangan-form.docx',
    filters: [{ name: 'Dokumen Word', extensions: ['docx'] }]
  });
  if (canceled || !filePath) return null;
  const { buatBuffer } = require('./docx-rancangan');
  await fs.writeFile(filePath, await buatBuffer(spek));
  return filePath;
});

ipcMain.handle('lokasi', () => BERKAS());

app.whenReady().then(() => {
  pasangMenu();
  buatJendela();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) buatJendela(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

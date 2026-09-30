'use strict';
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('eppat', {
  muat:   ()     => ipcRenderer.invoke('muat'),
  simpan: (data) => ipcRenderer.invoke('simpan', data),
  ekspor: (data) => ipcRenderer.invoke('ekspor', data),
  eksporDocx: (spek) => ipcRenderer.invoke('ekspor-docx', spek),
  impor:  ()     => ipcRenderer.invoke('impor'),
  lokasi: ()     => ipcRenderer.invoke('lokasi'),
  onMenu: (cb)   => ipcRenderer.on('menu', (_e, aksi) => cb(aksi))
});

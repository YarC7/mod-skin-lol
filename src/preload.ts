// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  loadChampions: () => ipcRenderer.invoke("load-champions"),
  loadSkins: (championId: string) => ipcRenderer.invoke("load-skins", championId),
  selectFolder: () => ipcRenderer.invoke("launcher:select-folder"),
  selectFile: (filters: any) => ipcRenderer.invoke("launcher:select-file", filters),
  saveSettings: (settings: any) => ipcRenderer.invoke("launcher:save-settings", settings),
  loadSettings: () => ipcRenderer.invoke("launcher:load-settings"),
  findModFile: (championId: string, skinNameEn: string, skinNum: number) => ipcRenderer.invoke("launcher:find-mod-file", championId, skinNameEn, skinNum),
  listModFiles: (championId: string) => ipcRenderer.invoke("launcher:list-mod-files", championId),
  runModTools: (command: string, args: string[]) => ipcRenderer.invoke("launcher:run-mod-tools", command, args),
  startManager: () => ipcRenderer.invoke("launcher:start-manager"),
  clearMods: () => ipcRenderer.invoke("launcher:clear-mods"),
});

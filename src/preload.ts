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
  killManager: () => ipcRenderer.invoke("launcher:kill-manager"),
  clearMods: () => ipcRenderer.invoke("launcher:clear-mods"),
  getGamePath: () => ipcRenderer.invoke("launcher:get-game-path"),
  enableModInProfile: (modName: string) => ipcRenderer.invoke("launcher:enable-mod-in-profile", modName),
  checkForUpdates: () => ipcRenderer.invoke("launcher:check-for-updates"),
  getProfilePaths: () => ipcRenderer.invoke("launcher:get-profile-paths"),
  log: (level: "info" | "warn" | "error", message: string) => ipcRenderer.invoke("launcher:log", level, message),
});

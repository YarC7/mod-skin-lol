import "./index.css";

interface Skin {
  num: number;
  name_en: string;
  name_vi: string;
  splash: string;
  loading: string;
}

interface Champion {
  id: string;
  name_en: string;
  name_vi: string;
}

let champions: Champion[] = [];
let activeChampionId = "";

const listView = document.getElementById("listView") as HTMLDivElement;
const detailView = document.getElementById("detailView") as HTMLDivElement;
const backButton = document.getElementById("backButton") as HTMLButtonElement;
const skinList = document.getElementById("skinList") as HTMLDivElement;
const splashImage = document.getElementById("splashImage") as HTMLImageElement;
const skinTitle = document.getElementById("skinTitle") as HTMLDivElement;
const searchInput = document.getElementById("searchInput") as HTMLInputElement;
const championList = document.getElementById("championList") as HTMLDivElement;

let currentSelectedSkin: Skin | null = null;

interface ChampionSkins {
  id: string;
  name_en: string;
  name_vi: string;
  skins: Skin[];
}

declare global {
  interface Window {
    electronAPI: {
      loadChampions: () => Promise<Champion[]>;
      loadSkins: (championId: string) => Promise<ChampionSkins | null>;
      selectFolder: () => Promise<{ canceled: boolean; path: string }>;
      selectFile: (filters: any) => Promise<{ canceled: boolean; path: string }>;
      saveSettings: (settings: any) => Promise<boolean>;
      loadSettings: () => Promise<{ managerPath: string; skinsRepoPath: string; skinMappings?: any; gamePath?: string }>;
      runModTools: (command: string, args: string[]) => Promise<{ success: boolean; stdout: string; stderr?: string }>;
      findModFile: (championId: string, skinNameEn: string, skinNum: number) => Promise<string | null>;
      listModFiles: (championId: string) => Promise<string[]>;
      startManager: () => Promise<boolean>;
      killManager: () => Promise<boolean>;
      clearMods: () => Promise<boolean>;
      getGamePath: () => Promise<string>;
      enableModInProfile: (modName: string) => Promise<boolean>;
      checkForUpdates: () => Promise<any>;
      getProfilePaths: () => Promise<{ name: string; folder: string; config: string } | null>;
      log: (level: "info" | "warn" | "error", message: string) => Promise<void>;
      getLogPath: () => Promise<string>;
    };
  }
}

let settings = {
  managerPath: "",
  skinsRepoPath: "",
  skinMappings: {} as any,
  gamePath: ""
};

const settingsToggle = document.getElementById("settingsToggle") as HTMLButtonElement;
const settingsPanel = document.getElementById("settingsPanel") as HTMLDivElement;
const selectManagerButton = document.getElementById("selectManagerButton") as HTMLButtonElement;
const selectSkinsRepoButton = document.getElementById("selectSkinsRepoButton") as HTMLButtonElement;
const managerPathDisplay = document.getElementById("managerPathDisplay") as HTMLSpanElement;
const skinsRepoPathDisplay = document.getElementById("skinsRepoPathDisplay") as HTMLSpanElement;
const gamePathDisplay = document.getElementById("gamePathDisplay") as HTMLSpanElement;
const selectGameButton = document.getElementById("selectGameButton") as HTMLButtonElement;

// Notification System
type NotificationType = "success" | "error" | "warning" | "info";

function showNotification(title: string, message: string, type: NotificationType = "info", duration: number = 5000) {
  const container = document.getElementById("notificationContainer");
  if (!container) return;

  const notification = document.createElement("div");
  notification.className = `notification ${type}`;

  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ"
  };

  notification.innerHTML = `
    <div class="notification-icon">${icons[type]}</div>
    <div class="notification-content">
      <div class="notification-title">${title}</div>
      <div class="notification-message">${message}</div>
    </div>
    <button class="notification-close">×</button>
  `;

  const closeBtn = notification.querySelector(".notification-close") as HTMLButtonElement;
  closeBtn.addEventListener("click", () => {
    notification.classList.add("fade-out");
    setTimeout(() => notification.remove(), 300);
  });

  container.appendChild(notification);

  // Auto dismiss
  if (duration > 0) {
    setTimeout(() => {
      if (notification.parentElement) {
        notification.classList.add("fade-out");
        setTimeout(() => notification.remove(), 300);
      }
    }, duration);
  }
}

async function initSettings() {
  let retries = 5;
  while (retries > 0) {
    try {
      const saved = await window.electronAPI.loadSettings();
      settings = { ...settings, ...saved };
      updateSettingsUI();
      return;
    } catch (e) {
      console.warn("Retrying settings load...", retries);
      retries--;
      await new Promise(r => setTimeout(r, 500));
    }
  }
}

function updateSettingsUI() {
  managerPathDisplay.textContent = settings.managerPath || "Not set";
  skinsRepoPathDisplay.textContent = settings.skinsRepoPath || "Not set";
  gamePathDisplay.textContent = settings.gamePath || "Not set (Auto)";
}

settingsToggle.addEventListener("click", () => {
  const isHidden = settingsPanel.style.display === "none";
  settingsPanel.style.display = isHidden ? "block" : "none";
});

selectManagerButton.addEventListener("click", async () => {
  const result = await window.electronAPI.selectFolder();
  if (!result.canceled) {
    settings.managerPath = result.path;
    await window.electronAPI.saveSettings(settings);
    updateSettingsUI();
  }
});

selectGameButton.addEventListener("click", async () => {
  const result = await window.electronAPI.selectFile([
    { name: "League of Legends Executable", extensions: ["exe"] }
  ]);
  if (!result.canceled) {
    settings.gamePath = result.path;
    await window.electronAPI.saveSettings(settings);
    updateSettingsUI();
  }
});

selectSkinsRepoButton.addEventListener("click", async () => {
  const result = await window.electronAPI.selectFolder();
  if (!result.canceled) {
    settings.skinsRepoPath = result.path;
    await window.electronAPI.saveSettings(settings);
    updateSettingsUI();
  }
});

const manualCheckUpdateBtn = document.getElementById("manualCheckUpdateBtn") as HTMLButtonElement;
manualCheckUpdateBtn.addEventListener("click", async () => {
  manualCheckUpdateBtn.disabled = true;
  manualCheckUpdateBtn.textContent = "Checking...";
  try {
    await window.electronAPI.checkForUpdates();
  } catch (e) {
    console.error("Manual update check failed:", e);
  } finally {
    manualCheckUpdateBtn.disabled = false;
    manualCheckUpdateBtn.textContent = "Check for Updates";
  }
});

async function loadChampions() {
  let retries = 5;
  while (retries > 0) {
    try {
      champions = await window.electronAPI.loadChampions();
      renderChampions(champions);
      return;
    } catch (error) {
      console.warn("Retrying champions load...", retries);
      retries--;
      await new Promise(r => setTimeout(r, 500));
    }
  }
}

// Helper function to clean champion ID for Data Dragon URLs
function cleanChampionId(id: string): string {
  // Remove special characters (apostrophes, periods, spaces) and convert to lowercase
  return id.replace(/['.\s&]/g, '').toLowerCase();
}

function renderChampions(champs: Champion[]) {
  championList.innerHTML = "";
  champs.forEach((champ) => {
    const div = document.createElement("div");
    div.className = "champion-item";
    // Clean the champion ID for the image URL
    const cleanId = cleanChampionId(champ.id);
    div.innerHTML = `
      <img src="https://ddragon.leagueoflegends.com/cdn/16.2.1/img/champion/${cleanId}.png" 
           onerror="this.src='https://ddragon.leagueoflegends.com/cdn/16.2.1/img/champion/Aatrox.png'; this.style.filter='grayscale(1)';" 
           alt="${champ.name_vi}" />
      <span>${champ.name_vi}</span>
    `;

    div.addEventListener("click", () => showDetail(champ.id));
    championList.appendChild(div);
  });
}

async function showDetail(championId: string) {
  try {
    activeChampionId = championId;
    const data = await window.electronAPI.loadSkins(championId);
    if (data) {
      listView.style.display = "none";
      detailView.style.display = "block";
      renderSkins(data.skins);

      // Select first skin by default
      if (data.skins.length > 0) {
        selectSkin(data.skins[0], document.querySelector(".skin-item") as HTMLElement);
      }
    }
  } catch (error) {
    console.error("Error loading skins:", error);
  }
}

function renderSkins(skins: Skin[]) {
  skinList.innerHTML = "";
  skins.forEach((skin) => {
    const div = document.createElement("div");
    div.className = "skin-item";
    div.innerHTML = `
      <img src="${skin.loading}" 
           onerror="this.src='https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Aatrox_0.jpg'; this.style.filter='grayscale(1)';"
           alt="${skin.name_vi}" />
      <span>${skin.name_vi}</span>
      <button class="apply-skin-btn">Apply</button>
    `;

    // Select skin when clicking anywhere on the item
    div.addEventListener("click", () => selectSkin(skin, div));

    // Handle apply button specifically
    const btn = div.querySelector(".apply-skin-btn") as HTMLButtonElement;
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();

      if (!settings.managerPath) {
        showNotification("Settings Required", "Please set CS-LOL Manager path in Settings first!", "warning");
        settingsPanel.style.display = "block";
        return;
      }

      let modPath = settings.skinMappings[skin.name_en];
      if (!modPath) {
        // Try to find automatically first
        const autoPath = await window.electronAPI.findModFile(activeChampionId, skin.name_en, skin.num);
        if (autoPath) {
          modPath = autoPath;
        } else {
          // If auto find fails, list files for manual selection
          const files = await window.electronAPI.listModFiles(activeChampionId);
          if (files.length > 0) {
            const fileList = files.map(f => {
              const parts = f.split(/[\\/]/);
              return parts[parts.length - 1];
            }).join("\n");
            const choice = prompt(`Could not find an exact match for "${skin.name_vi}" (${skin.name_en}). \nAvailable files:\n${fileList}\n\nEnter filename to use:`);
            if (choice) {
              const selectedFile = files.find(f => f.toLowerCase().endsWith(choice.toLowerCase()));
              if (selectedFile) modPath = selectedFile;
            }
          }

          if (!modPath) {
            const result = await window.electronAPI.selectFile([
              { name: "Fantome/Zip Mods", extensions: ["fantome", "zip"] }
            ]);
            if (result.canceled) {
              btn.textContent = "Apply";
              btn.disabled = false;
              return;
            };
            modPath = result.path;
          }
        }

        settings.skinMappings[skin.name_en] = modPath;
        await window.electronAPI.saveSettings(settings);
      }

      const modName = skin.name_en.replace(/[^a-zA-Z0-9]/g, "_");
      btn.textContent = "Initializing...";
      btn.disabled = true;

      const startTime = Date.now();

      try {
        await window.electronAPI.log("info", `[START] Applying skin: ${skin.name_en}`);

        // 1. TẮT MANAGER (nếu đang chạy)
        btn.textContent = "Closing Manager...";
        const step1Start = Date.now();
        await window.electronAPI.killManager();
        await new Promise(r => setTimeout(r, 1000));
        await window.electronAPI.log("info", `[STEP 1] Kill Manager completed in ${Date.now() - step1Start}ms`);

        // 2. Clear old mods để tránh conflict
        btn.textContent = "Clearing old mods...";
        const step2Start = Date.now();
        await window.electronAPI.clearMods();
        await window.electronAPI.log("info", `[STEP 2] Clear mods completed in ${Date.now() - step2Start}ms`);

        // 3. Import mod
        btn.textContent = "Importing...";
        const step3Start = Date.now();
        const importRes = await window.electronAPI.runModTools("import", [
          modPath,
          `${settings.managerPath}\\installed\\${modName}`
        ]);

        if (!importRes.success) {
          // Nếu import fail nhưng file đã tồn tại thì bỏ qua lỗi
          if (!importRes.stderr?.includes("already exists")) {
            throw new Error(importRes.stderr || "Import failed");
          }
        }
        await window.electronAPI.log("info", `[STEP 3] Import completed in ${Date.now() - step3Start}ms`);

        // 4. Enable mod in profile
        btn.textContent = "Enabling mod...";
        const step4Start = Date.now();
        await window.electronAPI.enableModInProfile(modName);
        await window.electronAPI.log("info", `[STEP 4] Enable mod in profile completed in ${Date.now() - step4Start}ms`);

        // 5. Khởi động Manager GUI
        btn.textContent = "Starting Manager...";
        const step5Start = Date.now();
        await window.electronAPI.startManager();
        await new Promise(r => setTimeout(r, 500)); // Đợi một chút để manager khởi động
        await window.electronAPI.log("info", `[STEP 5] Start manager completed in ${Date.now() - step5Start}ms`);

        const totalTime = Date.now() - startTime;
        await window.electronAPI.log("info", `[COMPLETE] Total time: ${totalTime}ms for skin: ${skin.name_en}`);

        showNotification(
          "Skin Applied Successfully!",
          `${skin.name_vi} has been applied. Make sure 'Run' is enabled in CS-LOL Manager!`,
          "success",
          6000
        );


      } catch (err: any) {
        const totalTime = Date.now() - startTime;
        await window.electronAPI.log("error", `[FAILED] Error after ${totalTime}ms: ${err.message}`);
        showNotification("Error", err.message, "error", 8000);
      }
      finally {
        btn.textContent = "Apply";
        btn.disabled = false;
      }
    });

    skinList.appendChild(div);
  });
}

function selectSkin(skin: Skin, element: HTMLElement) {
  currentSelectedSkin = skin;
  document.querySelectorAll(".skin-item").forEach(el => el.classList.remove("active"));
  element.classList.add("active");

  splashImage.style.opacity = "0.3";
  setTimeout(() => {
    splashImage.src = skin.splash;
    skinTitle.textContent = skin.name_vi;
    splashImage.onload = () => {
      splashImage.style.opacity = "1";
    };
  }, 100);
}

backButton.addEventListener("click", () => {
  detailView.style.display = "none";
  listView.style.display = "block";
});

function filterChampions() {
  const query = searchInput.value.toLowerCase();
  const filtered = champions.filter((champ) =>
    champ.name_vi.toLowerCase().includes(query) || champ.name_en.toLowerCase().includes(query)
  );
  renderChampions(filtered);
}

searchInput.addEventListener("input", filterChampions);

loadChampions();
initSettings();

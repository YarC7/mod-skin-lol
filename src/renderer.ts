import "./index.css";

interface Skin {
  skinName: string;
  splashUrl: string;
  loadingUrl: string;
}

interface Champion {
  name: string;
  icon: string;
}

let champions: Champion[] = [];

const listView = document.getElementById("listView") as HTMLDivElement;
const detailView = document.getElementById("detailView") as HTMLDivElement;
const backButton = document.getElementById("backButton") as HTMLButtonElement;
const skinList = document.getElementById("skinList") as HTMLDivElement;
const splashImage = document.getElementById("splashImage") as HTMLImageElement;
const skinTitle = document.getElementById("skinTitle") as HTMLDivElement;
const searchInput = document.getElementById("searchInput") as HTMLInputElement;
const championList = document.getElementById("championList") as HTMLDivElement;

interface ChampionSkins {
  championName: string;
  championId: string;
  skins: Skin[];
}

declare global {
  interface Window {
    electronAPI: {
      loadChampions: () => Promise<Champion[]>;
      loadSkins: (championId: string) => Promise<ChampionSkins | null>;
    };
  }
}

async function loadChampions() {
  try {
    champions = await window.electronAPI.loadChampions();
    renderChampions(champions);
  } catch (error) {
    console.error("Error loading champions:", error);
  }
}

function renderChampions(champs: Champion[]) {
  championList.innerHTML = "";
  champs.forEach((champ) => {
    const div = document.createElement("div");
    div.className = "champion-item";
    div.innerHTML = `
      <img src="${champ.icon}" alt="${champ.name}" />
      <span>${champ.name}</span>
    `;

    // Extract ID from icon URL (e.g., .../Aatrox.png -> Aatrox)
    const iconParts = champ.icon.split("/");
    const filename = iconParts[iconParts.length - 1];
    const championId = filename.split(".")[0];

    div.addEventListener("click", () => showDetail(championId));
    championList.appendChild(div);
  });
}

async function showDetail(championId: string) {
  try {
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
      <img src="${skin.loadingUrl}" alt="${skin.skinName}" />
      <span>${skin.skinName}</span>
    `;
    div.addEventListener("click", () => selectSkin(skin, div));
    skinList.appendChild(div);
  });
}

function selectSkin(skin: Skin, element: HTMLElement) {
  document.querySelectorAll(".skin-item").forEach(el => el.classList.remove("active"));
  element.classList.add("active");

  splashImage.style.opacity = "0.3";
  setTimeout(() => {
    splashImage.src = skin.splashUrl;
    skinTitle.textContent = skin.skinName;
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
    champ.name.toLowerCase().includes(query),
  );
  renderChampions(filtered);
}

searchInput.addEventListener("input", filterChampions);

loadChampions();

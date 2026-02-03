import React, { useState, useEffect, useMemo } from 'react';
import './index.css';
import TitleBar from './TitleBar';
import Logo from '../assets/logo.png';
// Asset Imports
import TopIcon from '../assets/role/Top_icon.png';
import JungleIcon from '../assets/role/Jungle_icon.png';
import MidIcon from '../assets/role/Middle_icon.png';
import ADCIcon from '../assets/role/Bottom_icon.png';
import SupportIcon from '../assets/role/Support_icon.png';

import TankIcon from '../assets/class/Tank_icon.png';
import FighterIcon from '../assets/class/Fighter_icon.png';
import SlayerIcon from '../assets/class/Slayer_icon.png';
import MarksmanIcon from '../assets/class/Marksman_icon.png';
import MageIcon from '../assets/class/Mage_icon.png';
import ControllerIcon from '../assets/class/Controller_icon.png';

declare global {
    interface Window {
        electronAPI: {
            loadChampions: () => Promise<Champion[]>;
            loadSkins: (championId: string) => Promise<ChampionSkins | null>;
            loadMetadata: () => Promise<ChampionMetadata | null>;
            loadChromas: (championId: string, skinNameEn: string) => Promise<Chroma[]>;
            selectFolder: () => Promise<{ canceled: boolean; path: string }>;
            selectFile: (filters: any) => Promise<{ canceled: boolean; path: string }>;
            saveSettings: (settings: any) => Promise<boolean>;
            loadSettings: () => Promise<{ managerPath: string; skinsRepoPath: string; skinMappings?: any; gamePath?: string }>;
            runModTools: (command: string, args: string[]) => Promise<{ success: boolean; stdout: string; stderr?: string }>;
            findModFile: (championId: string, skinNameEn: string, skinNum: number) => Promise<string | null>;
            findChromaFile: (championId: string, skinNameEn: string, chromaId: string) => Promise<string | null>;
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
            minimize?: () => void;
            maximize?: () => void;
            close?: () => void;
        };
    }
}

interface Skin {
    num: number;
    name_en: string;
    name_vi: string;
    splash: string;
    loading: string;
}

interface Chroma {
    id: string;
    name: string;
    image: string;
}

interface Champion {
    id: string;
    name_en: string;
    name_vi: string;
    roles?: string[];
    classes?: string[];
}

interface ChampionMetadata {
    [championId: string]: {
        roles: string[];
        classes: string[];
    };
}

interface ChampionSkins {
    id: string;
    name_en: string;
    name_vi: string;
    skins: Skin[];
}

interface Settings {
    managerPath: string;
    skinsRepoPath: string;
    skinMappings: Record<string, string>;
    gamePath: string;
}

const App: React.FC = () => {
    const [champions, setChampions] = useState<Champion[]>([]);
    const [metadata, setMetadata] = useState<ChampionMetadata>({});
    const [settings, setSettings] = useState<Settings>({
        managerPath: "",
        skinsRepoPath: "",
        skinMappings: {},
        gamePath: ""
    });
    const [showSettings, setShowSettings] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<'asc' | 'desc'>('asc');
    const [activeFilters, setActiveFilters] = useState({
        roles: new Set<string>(),
        classes: new Set<string>()
    });
    const [selectedChampId, setSelectedChampId] = useState<string | null>(null);
    const [selectedChampSkins, setSelectedChampSkins] = useState<ChampionSkins | null>(null);
    const [selectedSkin, setSelectedSkin] = useState<Skin | null>(null);
    const [selectedChromas, setSelectedChromas] = useState<Chroma[]>([]);
    const [selectedChromaId, setSelectedChromaId] = useState<string | null>(null);
    const [isApplying, setIsApplying] = useState<string | null>(null);

    // Load Initial Data
    useEffect(() => {
        const init = async () => {
            try {
                const meta = await window.electronAPI.loadMetadata();
                if (meta) setMetadata(meta);

                const champs = await window.electronAPI.loadChampions();
                const mergedChamps = champs.map(c => ({
                    ...c,
                    roles: meta?.[c.id]?.roles || [],
                    classes: meta?.[c.id]?.classes || []
                }));
                setChampions(mergedChamps);

                const savedSettings = await window.electronAPI.loadSettings();
                if (savedSettings) {
                    setSettings(prev => ({
                        ...prev,
                        ...savedSettings,
                        skinMappings: savedSettings.skinMappings || {}
                    }));
                }
            } catch (err) {
                console.error("Initialization error:", err);
            }
        };
        init();
    }, []);

    // Filter and Sort Champions
    const filteredChampions = useMemo(() => {
        let filtered = champions.filter(champ => {
            const matchesSearch = !searchQuery ||
                champ.name_vi.toLowerCase().includes(searchQuery.toLowerCase()) ||
                champ.name_en.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesRole = activeFilters.roles.size === 0 ||
                (champ.roles && champ.roles.some(role => activeFilters.roles.has(role)));

            const matchesClass = activeFilters.classes.size === 0 ||
                (champ.classes && champ.classes.some(cls => activeFilters.classes.has(cls)));

            return matchesSearch && matchesRole && matchesClass;
        });

        // Sort champions by name (A-Z or Z-A)
        return filtered.sort((a, b) => {
            if (sortBy === 'asc') {
                return a.name_vi.localeCompare(b.name_vi);
            } else {
                return b.name_vi.localeCompare(a.name_vi);
            }
        });
    }, [champions, searchQuery, activeFilters, sortBy]);

    // Actions
    const handleShowDetail = async (id: string) => {
        const data = await window.electronAPI.loadSkins(id);
        if (data) {
            setSelectedChampId(id);
            setSelectedChampSkins(data);
            setSelectedSkin(data.skins[0]);
            // Load chromas for the first skin automatically
            const chromas = await window.electronAPI.loadChromas(id, data.skins[0].name_en);
            setSelectedChromas(chromas);
            setSelectedChromaId(null);
        }
    };

    const handleSelectSkin = async (skin: Skin) => {
        setSelectedSkin(skin);
        // Load chromas for the selected skin
        if (selectedChampId) {
            const chromas = await window.electronAPI.loadChromas(selectedChampId, skin.name_en);
            setSelectedChromas(chromas);
            setSelectedChromaId(null);
        }
    };

    const handleApplySkin = async (skin: Skin) => {
        if (!settings.managerPath) {
            alert("Please set CS-LOL Manager path in Settings first!");
            setShowSettings(true);
            return;
        }

        setIsApplying(skin.name_en);
        try {
            let modPath = "";

            // Check if a chroma is selected
            if (selectedChromaId && selectedChromas.length > 0) {
                // Try to find chroma file
                const chromaPath = await window.electronAPI.findChromaFile(selectedChampId!, skin.name_en, selectedChromaId);
                if (chromaPath) {
                    modPath = chromaPath;
                } else {
                    alert(`Could not find chroma file for ID: ${selectedChromaId}`);
                    return;
                }
            } else {
                // Use regular skin file
                modPath = settings.skinMappings[skin.name_en];
                if (!modPath) {
                    const autoPath = await window.electronAPI.findModFile(selectedChampId!, skin.name_en, skin.num);
                    if (autoPath) {
                        modPath = autoPath;
                    } else {
                        const files = await window.electronAPI.listModFiles(selectedChampId!);
                        if (files.length > 0) {
                            const fileList = files.map(f => f.split(/[\\/]/).pop()).join("\n");
                            const choice = prompt(`Could not find an exact match for "${skin.name_vi}". \nAvailable files:\n${fileList}\n\nEnter filename to use:`);
                            if (choice) {
                                const selectedFile = files.find(f => f.toLowerCase().endsWith(choice.toLowerCase()));
                                if (selectedFile) modPath = selectedFile;
                            }
                        }
                        if (!modPath) {
                            const result = await window.electronAPI.selectFile([{ name: "Fantome/Zip Mods", extensions: ["fantome", "zip"] }]);
                            if (result.canceled) return;
                            modPath = result.path;
                        }
                    }
                    const newSettings = {
                        ...settings,
                        skinMappings: { ...settings.skinMappings, [skin.name_en]: modPath }
                    };
                    setSettings(newSettings);
                    await window.electronAPI.saveSettings(newSettings);
                }
            }

            await window.electronAPI.killManager();
            await window.electronAPI.clearMods();

            const modName = selectedChromaId
                ? `${skin.name_en.replace(/[^a-zA-Z0-9]/g, "_")}_${selectedChromaId}`
                : skin.name_en.replace(/[^a-zA-Z0-9]/g, "_");

            await window.electronAPI.runModTools("import", [modPath, `${settings.managerPath}\\installed\\${modName}`]);
            await window.electronAPI.enableModInProfile(modName);
            await window.electronAPI.startManager();

            const appliedName = selectedChromaId
                ? `${skin.name_vi} (Chroma ${selectedChromaId})`
                : skin.name_vi;
            // alert(`${appliedName} applied successfully!`);
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        } finally {
            setIsApplying(null);
        }
    };

    const toggleFilter = (type: 'roles' | 'classes', value: string) => {
        setActiveFilters(prev => {
            const next = new Set(prev[type]);
            if (next.has(value)) next.delete(value);
            else next.add(value);
            return { ...prev, [type]: next };
        });
    };

    const clearFilters = () => {
        setSearchQuery("");
        setActiveFilters({ roles: new Set(), classes: new Set() });
    };

    const cleanChampionId = (id: string) => {
        const special: Record<string, string> = {
            "Cho'Gath": "Chogath", "Kai'Sa": "Kaisa", "Nunu & Willump": "Nunu",
            "Renata Glasc": "Renata", "Vel'Koz": "Velkoz", "Wukong": "MonkeyKing"
        };
        return special[id] || id.replace(/['.\s&]/g, '');
    };

    return (
        <div className="app-container dark-theme">
            <TitleBar
                showBackButton={!!selectedChampId}
                onBackClick={() => setSelectedChampId(null)}
                title={selectedChampId && selectedChampSkins ? selectedChampSkins.name_vi : "Mod Skin LoL"}
                showSettings={showSettings}
                onSettingsToggle={() => setShowSettings(!showSettings)}
            />
            {/* List View */}
            <div id="listView" style={{ display: selectedChampId ? 'none' : 'block' }}>
                <div style={{ padding: '16px' }}>
                </div>
                {showSettings && (
                    <div id="settingsPanel">
                        <div className="settings-group">
                            <label>CS-LOL Manager Path:</label>
                            <div className="path-input">
                                <span>{settings.managerPath || "Not set"}</span>
                                <button onClick={async () => {
                                    const res = await window.electronAPI.selectFolder();
                                    if (!res.canceled) {
                                        const next = { ...settings, managerPath: res.path };
                                        setSettings(next);
                                        await window.electronAPI.saveSettings(next);
                                    }
                                }}>Browse</button>
                            </div>
                        </div>
                        <div className="settings-group">
                            <label>Skins Repository Path:</label>
                            <div className="path-input">
                                <span>{settings.skinsRepoPath || "Not set"}</span>
                                <button onClick={async () => {
                                    const res = await window.electronAPI.selectFolder();
                                    if (!res.canceled) {
                                        const next = { ...settings, skinsRepoPath: res.path };
                                        setSettings(next);
                                        await window.electronAPI.saveSettings(next);
                                    }
                                }}>Browse</button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="filter-controls">
                    <div className="filter-icons">
                        <button
                            className={`filter-icon-btn ${activeFilters.roles.size === 0 && activeFilters.classes.size === 0 ? 'active' : ''}`}
                            onClick={clearFilters}
                            title="All Champions"
                        >
                            ✨
                        </button>
                        {[
                            { id: 'top', icon: TopIcon, label: 'Top' },
                            { id: 'jungle', icon: JungleIcon, label: 'Jungle' },
                            { id: 'mid', icon: MidIcon, label: 'Mid' },
                            { id: 'adc', icon: ADCIcon, label: 'ADC' },
                            { id: 'support', icon: SupportIcon, label: 'Support' },
                        ].map(r => (
                            <button
                                key={r.id}
                                className={`filter-icon-btn ${activeFilters.roles.has(r.id) ? 'active' : ''}`}
                                onClick={() => toggleFilter('roles', r.id)}
                                title={r.label}
                            >
                                <img src={r.icon} alt={r.label} />
                            </button>
                        ))}
                        <button className="filter-icon-btn" onClick={clearFilters} title="Reset Filters">
                            🔄
                        </button>
                    </div>
                    <input
                        type="text"
                        id="searchInput"
                        placeholder="Search champions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="classes-filter">
                    <span className="classes-label">CLASSES:</span>
                    {[
                        { id: 'tank', label: 'Tank', icon: TankIcon },
                        { id: 'fighter', label: 'Fighter', icon: FighterIcon },
                        { id: 'slayer', label: 'Slayer', icon: SlayerIcon },
                        { id: 'marksman', label: 'Marksman', icon: MarksmanIcon },
                        { id: 'mage', label: 'Mage', icon: MageIcon },
                        { id: 'controller', label: 'Controller', icon: ControllerIcon },
                    ].map(c => (
                        <button
                            key={c.id}
                            className={`class-filter-btn ${activeFilters.classes.has(c.id) ? 'active' : ''}`}
                            onClick={() => toggleFilter('classes', c.id)}
                        >
                            <img src={c.icon} alt={c.label} />
                            {c.label}
                        </button>
                    ))}
                    <button
                        className="sort-toggle-btn"
                        onClick={() => setSortBy(sortBy === 'asc' ? 'desc' : 'asc')}
                        title={sortBy === 'asc' ? 'Sort: A-Z' : 'Sort: Z-A'}
                    >
                        {sortBy === 'asc' ? '▲' : '▼'}
                    </button>
                </div>

                <div className="champion-counter">
                    SHOWING {filteredChampions.length} CHAMPIONS
                </div>

                <div id="championList">
                    {filteredChampions.map(champ => (
                        <div key={champ.id} className="champion-item" onClick={() => handleShowDetail(champ.id)}>
                            {/* <img
                                src={`https://ddragon.leagueoflegends.com/cdn/16.2.1/img/champion/${cleanChampionId(champ.id)}.png`}
                                onError={(e) => (e.currentTarget.src = 'https://ddragon.leagueoflegends.com/cdn/16.2.1/img/champion/Aatrox.png')}
                                alt={champ.name_vi}
                            /> */}
                            <span>{champ.name_vi}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Detail View */}
            {selectedChampId && selectedChampSkins && (
                <div id="detailView">
                    <div id="detailApp">
                        <div id="sidebar">
                            <div id="skinList">
                                {selectedChampSkins.skins.map(skin => (
                                    <div
                                        key={skin.num}
                                        className={`skin-item ${selectedSkin?.num === skin.num ? 'active' : ''}`}
                                        onClick={() => handleSelectSkin(skin)}
                                    >
                                        <img src={skin.loading} />
                                        <span>{skin.name_vi}</span>
                                        <button
                                            className="apply-skin-btn"
                                            disabled={isApplying !== null}
                                            onClick={(e) => { e.stopPropagation(); handleApplySkin(skin); }}
                                        >
                                            {isApplying === skin.name_en ? "Applying..." : "Apply"}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div id="mainContent">
                            {selectedSkin && (
                                <>
                                    <img id="splashImage" src={selectedSkin.splash} />
                                    <div id="skinTitle">{selectedSkin.name_vi}</div>
                                    {selectedChromas.length > 0 && (
                                        <div className="chromas-section">
                                            <div className="chromas-header">
                                                <span className="chromas-title">Chromas ({selectedChromas.length})</span>
                                            </div>
                                            <div className="chromas-grid">
                                                {selectedChromas.map(chroma => (
                                                    <div
                                                        key={chroma.id}
                                                        className={`chroma-item ${selectedChromaId === chroma.id ? 'active' : ''}`}
                                                        onClick={() => setSelectedChromaId(selectedChromaId === chroma.id ? null : chroma.id)}
                                                    >
                                                        <img src={chroma.image} alt={chroma.name} />
                                                        <div className="chroma-id">{chroma.id}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;


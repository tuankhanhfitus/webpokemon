// ============================================================================
// VGC TACTICS STUDIO — CORE ENGINE (CHAMPIONS REGULATION M-C)
// ============================================================================

const STORAGE_KEY_TEAMS = "vgc_mc_teams_v2";
const STORAGE_KEY_ACTIVE_TEAM = "vgc_mc_active_team_v2";
const STORAGE_KEY_GEMINI_KEY = "vgc_mc_gemini_key";

const STAT_KEYS = ["hp", "atk", "def", "spa", "spd", "spe"];
const STAT_LABELS = {
  hp: "HP",
  atk: "Atk",
  def: "Def",
  spa: "SpA",
  spd: "SpD",
  spe: "Spe"
};

let currentLang = "vi";
let teams = [];
let activeTeamId = null;
let activeSlotIndex = 0;
let modalMode = "ranked"; // 'ranked' | 'ots' | 'import'
let aiSelectedImageBase64 = null;
let aiSelectedImageMime = "image/png";
let activeMoveDropdownId = null;

// Visual Pokémon Picker State
let pickerTarget = null; // { mode: 'builder' } | { mode: 'calc', side: 'p1'|'p2' } | { mode: 'speed', slotIdx: 0|1|2 }
let pickerFilterTab = "all"; // 'all' | 'mega' | 'team'

// Damage Calculator State
let calcState = {
  activeSide: "p1",
  field: {
    isDoubles: true,
    weather: "None",
    terrain: "None"
  },
  p1: {
    species: "Garchomp",
    isMega: true,
    item: "Garchompite Z",
    ability: "Rough Skin",
    nature: "Timid",
    status: "Healthy",
    sp: { hp: 2, atk: 0, def: 0, spa: 32, spd: 0, spe: 32 },
    stages: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
    moves: [
      { name: "Draco Meteor", crit: false },
      { name: "Earth Power", crit: false },
      { name: "Flamethrower", crit: false },
      { name: "Protect", crit: false }
    ],
    selectedMoveIdx: 1
  },
  p2: {
    species: "Incineroar",
    isMega: false,
    item: "Safety Goggles",
    ability: "Intimidate",
    nature: "Careful",
    status: "Healthy",
    sp: { hp: 32, atk: 0, def: 14, spa: 0, spd: 20, spe: 0 },
    stages: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
    moves: [
      { name: "Fake Out", crit: false },
      { name: "Flare Blitz", crit: false },
      { name: "Knock Off", crit: false },
      { name: "Parting Shot", crit: false }
    ],
    selectedMoveIdx: 2
  }
};

// 3-Slot Speed Comparison State (Starts empty with 3 "+ Chọn Pokémon" slots)
let speedSlots = [null, null, null];

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
  loadTeamsFromStorage();
  populateStaticDropdowns();
  renderTeamSelector();
  renderTeamRibbon();
  renderActiveSlotEditor();

  // Initialize Damage Calc UI
  initCalcWorkspace();

  // Initialize 3-Slot Speed Workspace
  initSpeedWorkspace();

  // Load saved Gemini API Key
  const savedKey = localStorage.getItem(STORAGE_KEY_GEMINI_KEY);
  if (savedKey) {
    const keyInput = document.getElementById("ai-api-key");
    if (keyInput) keyInput.value = savedKey;
  }

  // Close custom move dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!activeMoveDropdownId) return;
    if (!e.target.closest("[data-move-picker]")) {
      const prevSide = activeMoveDropdownId.split("-")[0];
      activeMoveDropdownId = null;
      if (prevSide === "p1" || prevSide === "p2") {
        renderCalcSideUI(prevSide);
      }
    }
  });

  // Keyboard shortcuts (Escape closes modals, Ctrl+V pastes image on AI Scanner)
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      activeMoveDropdownId = null;
      closePokemonPicker();
      closePasteModal();
    }
  });

  document.addEventListener("paste", (e) => {
    const scannerView = document.getElementById("view-scanner");
    if (!scannerView || scannerView.classList.contains("hidden")) return;
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) processAiImageFile(file);
        break;
      }
    }
  });
});

// ============================================================================
// HELPERS: STATS, SPRITES (MEGA Z SUPPORT) & FORM RESOLUTION
// ============================================================================

function getSpriteUrl(spriteSlug) {
  const folder = spriteSlug.endsWith("-megaz")
    ? "gen5"
    : "dex";

  return `https://play.pokemonshowdown.com/sprites/${folder}/${spriteSlug}.png`;
}

// Multi-step fallback so Mega Z sprites (e.g. garchomp-megaz -> garchompmegaz -> garchomp-mega -> garchomp) never break
function handleSpriteError(imgEl, primarySlug, fallbackSlug, baseSlug) {
  const step = parseInt(imgEl.dataset.errStep || "0", 10);
  if (step === 0 && primarySlug && primarySlug.includes("-")) {
    imgEl.dataset.errStep = "1";
    const compactSlug = primarySlug.replace(/-/g, "");
    imgEl.src = getSpriteUrl(compactSlug);
    return;
  }
  if (step <= 1 && fallbackSlug && fallbackSlug !== primarySlug) {
    imgEl.dataset.errStep = "2";
    imgEl.src = getSpriteUrl(fallbackSlug);
    return;
  }
  if (step <= 2 && baseSlug && baseSlug !== fallbackSlug) {
    imgEl.dataset.errStep = "3";
    imgEl.src = getSpriteUrl(baseSlug);
    return;
  }
  imgEl.onerror = null;
  imgEl.src = "https://placehold.co/80x80/0f172a/38bdf8?text=PKMN";
}

function buildSpriteImgHtml(form, sizeClass = "w-16 h-16", extraClass = "") {
  return `<img src="${getSpriteUrl(form.sprite)}" alt="${escapeHtml(form.displayName)}"
    class="${sizeClass} object-contain ${extraClass}"
    onerror="handleSpriteError(this, '${form.sprite}', '${form.fallbackSprite || form.baseSprite}', '${form.baseSprite}')" />`;
}

function setImgElementForm(imgEl, form) {
  if (!imgEl || !form) return;
  imgEl.dataset.errStep = "0";
  imgEl.onerror = function () {
    handleSpriteError(this, form.sprite, form.fallbackSprite || form.baseSprite, form.baseSprite);
  };
  imgEl.src = getSpriteUrl(form.sprite);
}

function getEffectiveForm(species, isMega, item) {
  const baseData = POKEDEX_MC[species] || POKEDEX_MC["Garchomp"];
  if (isMega && baseData.megas) {
    const megaObj =
      (item && baseData.megas[item]) ||
      baseData.megas[baseData.defaultMegaStone] ||
      Object.values(baseData.megas)[0];
    if (megaObj) {
      return {
        displayName: megaObj.name,
        sprite: megaObj.sprite,
        fallbackSprite: megaObj.fallbackSprite || baseData.sprite,
        baseSprite: baseData.sprite,
        types: megaObj.types,
        base: megaObj.base,
        ability: megaObj.ability,
        isMegaActive: true
      };
    }
  }
  return {
    displayName: species,
    sprite: baseData.sprite,
    fallbackSprite: baseData.sprite,
    baseSprite: baseData.sprite,
    types: baseData.types,
    base: baseData.base,
    ability: null,
    isMegaActive: false
  };
}

function getNatureMultiplier(natureName, statKey) {
  const nat = NATURES[natureName];
  if (!nat || statKey === "hp") return 1.0;
  if (nat.plus === statKey) return 1.1;
  if (nat.minus === statKey) return 0.9;
  return 1.0;
}

// Level 50 Stat Calculation with Fixed 31 IVs and Stat Points (0-32 SP)
function calculateLv50Stat(statKey, baseVal, spVal, natureName) {
  const sp = Math.max(0, Math.min(32, parseInt(spVal, 10) || 0));
  if (statKey === "hp") {
    if (baseVal === 1) return 1;
    return baseVal + 75 + sp;
  }
  const mult = getNatureMultiplier(natureName, statKey);
  return Math.floor((baseVal + 20 + sp) * mult);
}

function spToEvEquivalent(spVal) {
  const sp = Math.max(0, Math.min(32, parseInt(spVal, 10) || 0));
  return sp === 0 ? 0 : 4 + (sp - 1) * 8;
}

function evToSpEquivalent(evVal) {
  const ev = Math.max(0, Math.min(252, parseInt(evVal, 10) || 0));
  if (ev <= 0) return 0;
  return Math.min(32, Math.max(1, Math.round((ev + 4) / 8)));
}

function getStageMultiplier(stage) {
  const s = Math.max(-6, Math.min(6, parseInt(stage, 10) || 0));
  if (s >= 0) return (2 + s) / 2;
  return 2 / (2 - s);
}

function renderTypeBadgesHtml(types) {
  return (types || [])
    .map((t) => `<span class="type-badge type-${t}">${t}</span>`)
    .join("");
}

function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const colors = {
    info: "bg-slate-900/95 border-sky-500/50 text-sky-200",
    success: "bg-slate-900/95 border-emerald-500/50 text-emerald-300",
    warn: "bg-slate-900/95 border-amber-500/50 text-amber-300",
    error: "bg-slate-900/95 border-rose-500/50 text-rose-300"
  };
  const el = document.createElement("div");
  el.className = `toast-enter px-4 py-2.5 rounded-xl border text-xs font-semibold shadow-xl backdrop-blur-md ${colors[type] || colors.info}`;
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => {
    el.style.opacity = "0";
    el.style.transition = "opacity 0.25s ease";
    setTimeout(() => el.remove(), 260);
  }, 2600);
}

// ============================================================================
// VISUAL POKÉMON GRID PICKER MODAL (SHARED BY SPEED, DAMAGE CALC & BUILDER)
// ============================================================================

function openPokemonPicker(target) {
  pickerTarget = target;
  pickerFilterTab = "all";
  updatePickerFilterButtons();

  const modal = document.getElementById("pokemon-picker-modal");
  const searchInput = document.getElementById("picker-search-input");
  const showMegaChk = document.getElementById("picker-show-mega-forms");

  if (searchInput) searchInput.value = "";
  if (showMegaChk) showMegaChk.checked = false;

  const countAllEl = document.getElementById("picker-count-all");
  if (countAllEl) countAllEl.textContent = Object.keys(POKEDEX_MC).length;

  renderPokemonPickerGrid();
  modal.classList.remove("hidden");
  setTimeout(() => searchInput?.focus(), 40);
}

function closePokemonPicker() {
  const modal = document.getElementById("pokemon-picker-modal");
  if (modal) modal.classList.add("hidden");
  pickerTarget = null;
}

function setPickerFilter(tab) {
  pickerFilterTab = tab;
  updatePickerFilterButtons();
  renderPokemonPickerGrid();
}

function updatePickerFilterButtons() {
  ["all", "mega", "team"].forEach((t) => {
    const btn = document.getElementById(`picker-tab-${t}`);
    if (!btn) return;
    if (t === pickerFilterTab) {
      btn.className = "px-3 py-1 rounded-full font-bold bg-sky-500 text-slate-950 transition";
    } else {
      btn.className = "px-3 py-1 rounded-full font-bold bg-slate-800 text-slate-300 hover:text-white transition";
    }
  });
}

function renderPokemonPickerGrid() {
  const grid = document.getElementById("picker-grid-container");
  if (!grid) return;

  const query = (document.getElementById("picker-search-input")?.value || "").trim().toLowerCase();
  const showMegaForms = document.getElementById("picker-show-mega-forms")?.checked || false;
  const teamSpeciesSet = new Set((getCurrentTeam()?.slots || []).map((s) => s.species));

  let entries = [];
  Object.keys(POKEDEX_MC)
    .sort()
    .forEach((species) => {
      const data = POKEDEX_MC[species];
      if (pickerFilterTab === "mega" && !data.megas) return;
      if (pickerFilterTab === "team" && !teamSpeciesSet.has(species)) return;

      entries.push({
        species,
        isMega: false,
        megaStone: null,
        displayName: species,
        sprite: data.sprite,
        fallbackSprite: data.sprite,
        baseSprite: data.sprite,
        types: data.types,
        hasMega: Boolean(data.megas)
      });

      if ((showMegaForms || pickerFilterTab === "mega" || query.includes("mega")) && data.megas) {
        Object.entries(data.megas).forEach(([stoneName, mObj]) => {
          entries.push({
            species,
            isMega: true,
            megaStone: stoneName,
            displayName: mObj.name,
            sprite: mObj.sprite,
            fallbackSprite: mObj.fallbackSprite || data.sprite,
            baseSprite: data.sprite,
            types: mObj.types,
            hasMega: true
          });
        });
      }
    });

  if (query) {
    entries = entries.filter(
      (e) =>
        e.displayName.toLowerCase().includes(query) ||
        e.species.toLowerCase().includes(query) ||
        e.types.some((t) => t.toLowerCase().includes(query))
    );
  }

  if (entries.length === 0) {
    grid.innerHTML = `<div class="col-span-full py-12 text-center text-sm text-slate-400">Không tìm thấy Pokémon phù hợp với từ khóa "${escapeHtml(query)}".</div>`;
    return;
  }

  grid.innerHTML = entries
    .map((item) => {
      const stoneArg = item.megaStone ? `'${item.megaStone.replace(/'/g, "\\'")}'` : "null";
      return `
        <button type="button"
          onclick="selectPokemonFromPicker('${item.species.replace(/'/g, "\\'")}', ${item.isMega}, ${stoneArg})"
          class="group bg-slate-950/85 hover:bg-slate-800/95 border border-slate-800 hover:border-sky-400 rounded-2xl p-2.5 flex flex-col items-center text-center transition relative">
          ${
            item.isMega
              ? `<span class="absolute top-1.5 right-1.5 px-1.5 py-0.2 rounded bg-pink-500/20 border border-pink-500/40 text-[9px] font-extrabold text-pink-300">MEGA</span>`
              : item.hasMega
                ? `<span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-pink-400/70" title="Có dạng Mega"></span>`
                : ""
          }
          <div class="w-16 h-16 flex items-center justify-center mb-1">
            ${buildSpriteImgHtml(item, "w-14 h-14", "group-hover:scale-110 transition-transform")}
          </div>
          <div class="text-xs font-bold text-slate-100 group-hover:text-white truncate w-full" title="${escapeHtml(item.displayName)}">
            ${escapeHtml(item.displayName)}
          </div>
        </button>
      `;
    })
    .join("");
}

function selectPokemonFromPicker(species, isMega, megaStone) {
  if (!pickerTarget) return;
  const target = { ...pickerTarget };
  closePokemonPicker();

  if (target.mode === "builder") {
    changeActiveSpecies(species);
    const mon = getCurrentPokemon();
    if (mon) {
      mon.isMega = Boolean(isMega);
      if (isMega && megaStone) mon.item = megaStone;
      saveTeamsToStorage();
      renderTeamRibbon();
      renderActiveSlotEditor();
    }
  } else if (target.mode === "calc") {
    const side = target.side || "p1";
    updateCalcSide(side, "species", species);
    if (isMega) {
      updateCalcSide(side, "isMega", true);
      if (megaStone) updateCalcSide(side, "item", megaStone);
    } else {
      updateCalcSide(side, "isMega", false);
    }
  } else if (target.mode === "speed") {
    const slotIdx = target.slotIdx ?? 0;
    const dexData = POKEDEX_MC[species] || POKEDEX_MC["Arcanine"];
    speedSlots[slotIdx] = createSpeedCardObj(species, {
      isMega: Boolean(isMega && dexData.megas),
      megaStone: megaStone || dexData.defaultMegaStone || null,
      sp: 0,
      natureMode: "neutral",
      stage: 0
    });
    renderSpeedComparisonCards();
  }
}

// ============================================================================
// NAVIGATION & LANGUAGE
// ============================================================================

function switchMainTab(tabName) {
  activeMoveDropdownId = null;
  const tabs = ["builder", "calc", "speed", "scanner"];
  tabs.forEach((t) => {
    const view = document.getElementById(`view-${t}`);
    const btn = document.getElementById(`nav-${t}`);
    if (!view || !btn) return;
    if (t === tabName) {
      view.classList.remove("hidden");
      btn.classList.add("bg-sky-500", "text-slate-950", "shadow");
      btn.classList.remove("text-slate-300", "hover:text-white");
    } else {
      view.classList.add("hidden");
      btn.classList.remove("bg-sky-500", "text-slate-950", "shadow");
      btn.classList.add("text-slate-300", "hover:text-white");
    }
  });

  if (tabName === "calc") {
    refreshCalcTeamDropdowns();
    runDamageCalculation();
  } else if (tabName === "speed") {
    renderSpeedComparisonCards();
  }
}

const I18N_DICT = {
  vi: {
    tabBuilder: "Team Builder",
    tabCalc: "Damage Calc",
    tabSpeed: "Đo Speed",
    tabScanner: "AI Quét Ảnh",
    currentTeam: "Đội hình:",
    btnNewTeam: "Tạo mới",
    btnClone: "Nhân bản",
    btnImport: "Nhập Showdown",
    btnExportRank: "Xuất Rank (Full SP/EVs)",
    btnExportOTS: "Xuất Giải OTS (Giấu EVs)",
    lblItem: "Vật phẩm (Item)",
    lblAbility: "Đặc tính (Ability)",
    lblPreset: "Preset SP nhanh (Max 66)",
    lblMoves: "Bộ chiêu thức (4 Moves)",
    moveHint: "Chọn bộ 4 chiêu thi đấu chuẩn Reg M-C",
    btnSendAtk: "Sang Damage Calc",
    btnSendSpeed: "Sang Đo Speed",
    btnClearSlot: "Đặt lại Slot",
    lblStatsTitle: "Chỉ số & Phân bổ Stat Points (SP)",
    lblStatsSub: "Tối đa 32 SP/chỉ số • Cố định 31 IVs (Lv.50)",
    lblNature: "Tính cách (Nature)"
  },
  en: {
    tabBuilder: "Team Builder",
    tabCalc: "Damage Calc",
    tabSpeed: "Speed Calc",
    tabScanner: "AI Team Scan",
    currentTeam: "Team:",
    btnNewTeam: "New",
    btnClone: "Clone",
    btnImport: "Import Paste",
    btnExportRank: "Export Ranked (Full)",
    btnExportOTS: "Export OTS (No EVs)",
    lblItem: "Held Item",
    lblAbility: "Ability",
    lblPreset: "Quick SP Preset (Max 66)",
    lblMoves: "Moveset (4 Moves)",
    moveHint: "Select 4 Reg M-C legal moves",
    btnSendAtk: "To Damage Calc",
    btnSendSpeed: "To Speed Check",
    btnClearSlot: "Reset Slot",
    lblStatsTitle: "Stats & Stat Points (SP)",
    lblStatsSub: "Max 32 SP/stat • Fixed 31 IVs (Lv.50)",
    lblNature: "Nature"
  }
};

function toggleLanguage() {
  currentLang = currentLang === "vi" ? "en" : "vi";
  const dict = I18N_DICT[currentLang];
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) el.textContent = dict[key];
  });
  showToast(currentLang === "vi" ? "Đã chuyển sang Tiếng Việt" : "Switched to English");
}

// ============================================================================
// TEAM STORAGE & CRUD
// ============================================================================

function cloneDeep(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function createEmptySlot() {
  return {
    species: "Incineroar",
    nickname: "",
    gender: "M",
    item: "Sitrus Berry",
    ability: "Intimidate",
    nature: "Careful",
    isMega: false,
    sp: { hp: 32, atk: 0, def: 14, spa: 0, spd: 20, spe: 0 },
    moves: ["Fake Out", "Flare Blitz", "Knock Off", "Parting Shot"]
  };
}

function loadTeamsFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TEAMS);
    const savedActive = localStorage.getItem(STORAGE_KEY_ACTIVE_TEAM);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        teams = parsed;
        activeTeamId = teams.some((t) => t.id === savedActive) ? savedActive : teams[0].id;
        return;
      }
    }
  } catch (err) {
    console.warn("Storage load failed:", err);
  }

  const defaultId = "team_" + Date.now();
  teams = [
    {
      id: defaultId,
      name: "Reg M-C Mega Garchomp-Z Balance",
      slots: cloneDeep(DEFAULT_SAMPLE_TEAM)
    }
  ];
  activeTeamId = defaultId;
  saveTeamsToStorage();
}

function saveTeamsToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY_TEAMS, JSON.stringify(teams));
    localStorage.setItem(STORAGE_KEY_ACTIVE_TEAM, activeTeamId);
  } catch (err) {
    console.warn("Storage save failed:", err);
  }
}

function getCurrentTeam() {
  return teams.find((t) => t.id === activeTeamId) || teams[0];
}

function getCurrentPokemon() {
  const team = getCurrentTeam();
  return team.slots[activeSlotIndex];
}

function populateStaticDropdowns() {
  const itemsHtml = ITEMS_MC.map((it) => `<option value="${it}">${it}</option>`).join("");
  ["sel-item", "calc-p1-item", "calc-p2-item"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = itemsHtml;
  });

  const naturesHtml = Object.entries(NATURES)
    .map(([key, obj]) => `<option value="${key}">${obj.label}</option>`)
    .join("");
  ["sel-nature", "calc-p1-nature", "calc-p2-nature"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = naturesHtml;
  });
}

function renderTeamSelector() {
  const sel = document.getElementById("team-selector");
  const nameInput = document.getElementById("team-name-input");
  const team = getCurrentTeam();
  if (!sel || !team) return;

  sel.innerHTML = teams
    .map((t) => `<option value="${t.id}" ${t.id === team.id ? "selected" : ""}>${escapeHtml(t.name)}</option>`)
    .join("");

  if (nameInput) nameInput.value = team.name;
}

function selectTeam(id) {
  activeTeamId = id;
  activeSlotIndex = 0;
  saveTeamsToStorage();
  renderTeamSelector();
  renderTeamRibbon();
  renderActiveSlotEditor();
}

function renameCurrentTeam(newName) {
  const team = getCurrentTeam();
  if (!team) return;
  team.name = newName.trim() || "Untitled Reg M-C Team";
  saveTeamsToStorage();
  renderTeamSelector();
}

function createNewTeam() {
  const newId = "team_" + Date.now();
  const newSlots = Array.from({ length: 6 }, (_, i) =>
    cloneDeep(DEFAULT_SAMPLE_TEAM[i] || createEmptySlot())
  );
  teams.push({
    id: newId,
    name: `Team Reg M-C #${teams.length + 1}`,
    slots: newSlots
  });
  activeTeamId = newId;
  activeSlotIndex = 0;
  saveTeamsToStorage();
  renderTeamSelector();
  renderTeamRibbon();
  renderActiveSlotEditor();
  showToast("Đã tạo đội hình mới!", "success");
}

function duplicateCurrentTeam() {
  const current = getCurrentTeam();
  if (!current) return;
  const copyId = "team_" + Date.now();
  teams.push({
    id: copyId,
    name: `${current.name} (Copy)`,
    slots: cloneDeep(current.slots)
  });
  activeTeamId = copyId;
  saveTeamsToStorage();
  renderTeamSelector();
  renderTeamRibbon();
  renderActiveSlotEditor();
  showToast("Đã nhân bản đội hình!", "success");
}

function deleteCurrentTeam() {
  if (teams.length <= 1) {
    showToast("Phải giữ lại ít nhất 1 đội hình!", "warn");
    return;
  }
  teams = teams.filter((t) => t.id !== activeTeamId);
  activeTeamId = teams[0].id;
  activeSlotIndex = 0;
  saveTeamsToStorage();
  renderTeamSelector();
  renderTeamRibbon();
  renderActiveSlotEditor();
  showToast("Đã xóa đội hình.", "info");
}

// ============================================================================
// TEAM BUILDER UI & SP ALLOCATION
// ============================================================================

function renderTeamRibbon() {
  const container = document.getElementById("team-slots-ribbon");
  const team = getCurrentTeam();
  if (!container || !team) return;

  container.innerHTML = team.slots
    .map((mon, idx) => {
      const form = getEffectiveForm(mon.species, mon.isMega, mon.item);
      const isSelected = idx === activeSlotIndex;
      const usedSp = STAT_KEYS.reduce((acc, k) => acc + (mon.sp[k] || 0), 0);
      return `
        <button type="button" onclick="selectSlot(${idx})"
          class="slot-card text-left p-2.5 rounded-2xl border ${isSelected ? "active-slot" : "border-slate-800 bg-slate-900/70 hover:border-slate-700"} flex items-center gap-2.5">
          <div class="w-12 h-12 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-center shrink-0 relative">
            ${buildSpriteImgHtml(form, "w-10 h-10")}
            ${form.isMegaActive ? `<span class="absolute -top-1 -right-1 text-[9px] px-1 rounded bg-pink-500 text-white font-extrabold">M</span>` : ""}
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-1">
              <span class="text-[10px] font-bold text-slate-500">#${idx + 1}</span>
              <span class="text-[10px] font-mono ${usedSp === 66 ? "text-emerald-400" : "text-amber-400"}">${usedSp}/66 SP</span>
            </div>
            <div class="text-xs font-extrabold text-white truncate">${escapeHtml(form.displayName)}</div>
            <div class="text-[11px] text-slate-400 truncate">${escapeHtml(mon.item || "No Item")}</div>
          </div>
        </button>
      `;
    })
    .join("");
}

function selectSlot(idx) {
  activeSlotIndex = idx;
  renderTeamRibbon();
  renderActiveSlotEditor();
}

function renderActiveSlotEditor() {
  const mon = getCurrentPokemon();
  if (!mon) return;
  const dexData = POKEDEX_MC[mon.species] || POKEDEX_MC["Garchomp"];
  const form = getEffectiveForm(mon.species, mon.isMega, mon.item);

  document.getElementById("editor-slot-num").textContent = activeSlotIndex + 1;
  setImgElementForm(document.getElementById("editor-sprite"), form);
  document.getElementById("editor-types").innerHTML = renderTypeBadgesHtml(form.types);

  const speciesLabelEl = document.getElementById("builder-species-label");
  if (speciesLabelEl) speciesLabelEl.textContent = mon.species;

  document.getElementById("input-nickname").value = mon.nickname || "";
  document.getElementById("input-gender").value = mon.gender || "";
  document.getElementById("sel-item").value = mon.item || "None";
  document.getElementById("sel-nature").value = mon.nature || "Serious";

  const selAbility = document.getElementById("sel-ability");
  const baseAbilities = dexData.abilities || ["Pressure"];
  if (!baseAbilities.includes(mon.ability)) {
    mon.ability = baseAbilities[0];
  }
  selAbility.innerHTML = baseAbilities
    .map((ab) => {
      const label = form.isMegaActive && form.ability
        ? `${ab} → [Mega: ${form.ability}]`
        : ab;
      return `<option value="${ab}" ${mon.ability === ab ? "selected" : ""}>${label}</option>`;
    })
    .join("");

  const btnMega = document.getElementById("btn-mega");
  if (dexData.megas) {
    btnMega.disabled = false;
    btnMega.className = `px-3 py-1.5 rounded-xl border text-xs font-extrabold transition flex items-center gap-1 ${
      form.isMegaActive ? "mega-btn-active" : "mega-btn-ready"
    }`;
  } else {
    btnMega.disabled = true;
    btnMega.className = "px-3 py-1.5 rounded-xl border text-xs font-extrabold transition flex items-center gap-1 mega-btn-disabled";
  }

  const movesContainer = document.getElementById("moves-inputs-container");
  const allMoveNames = Object.keys(MOVES_DB).sort();
  movesContainer.innerHTML = [0, 1, 2, 3]
    .map((mIdx) => {
      const currentMove = mon.moves[mIdx] || "Protect";
      const moveMeta = MOVES_DB[currentMove] || { type: "Normal", bp: 0, cat: "Status" };
      const optionsHtml = allMoveNames
        .map((mv) => `<option value="${mv}" ${mv === currentMove ? "selected" : ""}>${mv} (${MOVES_DB[mv].type} · ${MOVES_DB[mv].bp || "-"})</option>`)
        .join("");
      return `
        <div class="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 rounded-xl p-1.5">
          <span class="type-badge type-${moveMeta.type} shrink-0 w-16 text-center">${moveMeta.type}</span>
          <select onchange="updateActiveMove(${mIdx}, this.value)" class="w-full bg-transparent text-xs sm:text-sm font-semibold text-white focus:outline-none">
            ${optionsHtml}
          </select>
        </div>
      `;
    })
    .join("");

  renderBuilderStatsTable();
}

function renderBuilderStatsTable() {
  const mon = getCurrentPokemon();
  if (!mon) return;
  const form = getEffectiveForm(mon.species, mon.isMega, mon.item);
  const nat = NATURES[mon.nature] || NATURES.Serious;

  const totalUsed = STAT_KEYS.reduce((sum, k) => sum + (mon.sp[k] || 0), 0);
  const remaining = 66 - totalUsed;
  const badge = document.getElementById("sp-remaining-badge");
  if (badge) {
    badge.textContent = `${remaining} / 66`;
    badge.className = `font-mono text-sm font-bold ${
      remaining === 0 ? "text-emerald-400" : remaining > 0 ? "text-amber-400" : "text-rose-400"
    }`;
  }

  const container = document.getElementById("stats-rows-container");
  container.innerHTML = STAT_KEYS.map((k) => {
    const baseVal = form.base[k];
    const spVal = mon.sp[k] || 0;
    const evEq = spToEvEquivalent(spVal);
    const finalStat = calculateLv50Stat(k, baseVal, spVal, mon.nature);
    const natMark = nat.plus === k ? `<span class="text-rose-400 font-bold">+</span>` : nat.minus === k ? `<span class="text-sky-400 font-bold">-</span>` : "";

    return `
      <div class="grid grid-cols-12 gap-1.5 items-center bg-slate-900/60 px-2.5 py-1.5 rounded-xl border border-slate-800/80">
        <div class="col-span-2 text-xs font-bold text-slate-200">${STAT_LABELS[k]}${natMark}</div>
        <div class="col-span-1 text-center font-mono text-xs text-slate-400">${baseVal}</div>
        <div class="col-span-5 flex items-center gap-1.5">
          <input type="range" min="0" max="32" value="${spVal}" oninput="updateStatSP('${k}', this.value)" class="sp-slider w-full" />
          <input type="number" min="0" max="32" value="${spVal}" onchange="updateStatSP('${k}', this.value)" class="w-11 bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-center font-mono text-xs font-bold text-sky-300" />
        </div>
        <div class="col-span-2 text-center font-mono text-[11px] text-slate-400">${evEq}</div>
        <div class="col-span-2 text-right font-mono text-sm font-extrabold text-white">${finalStat}</div>
      </div>
    `;
  }).join("");
}

function changeActiveSpecies(newSpecies) {
  const mon = getCurrentPokemon();
  const dexData = POKEDEX_MC[newSpecies];
  if (!mon || !dexData) return;

  mon.species = newSpecies;
  mon.ability = dexData.abilities[0];
  mon.moves = [...dexData.defaultMoves];
  if (dexData.megas) {
    mon.isMega = true;
    mon.item = dexData.defaultMegaStone;
  } else {
    mon.isMega = false;
    if ((mon.item && mon.item.endsWith("ite")) || (mon.item && mon.item.includes("ite "))) {
      mon.item = "Focus Sash";
    }
  }
  saveTeamsToStorage();
  renderTeamRibbon();
  renderActiveSlotEditor();
}

function updateActivePokemon(key, value) {
  const mon = getCurrentPokemon();
  if (!mon) return;
  mon[key] = value;

  if (key === "item") {
    const dexData = POKEDEX_MC[mon.species];
    if (dexData && dexData.megas && dexData.megas[value]) {
      mon.isMega = true;
    } else {
      mon.isMega = false;
    }
  }

  saveTeamsToStorage();
  renderTeamRibbon();
  renderActiveSlotEditor();
}

function updateActiveMove(moveIdx, moveName) {
  const mon = getCurrentPokemon();
  if (!mon) return;
  mon.moves[moveIdx] = moveName;
  saveTeamsToStorage();
  renderActiveSlotEditor();
}

function toggleMegaForm() {
  const mon = getCurrentPokemon();
  const dexData = POKEDEX_MC[mon.species];
  if (!mon || !dexData || !dexData.megas) return;

  mon.isMega = !mon.isMega;
  if (mon.isMega && (!mon.item || !dexData.megas[mon.item])) {
    mon.item = dexData.defaultMegaStone;
  }
  saveTeamsToStorage();
  renderTeamRibbon();
  renderActiveSlotEditor();
}

function updateStatSP(statKey, rawValue) {
  const mon = getCurrentPokemon();
  if (!mon) return;
  let val = Math.max(0, Math.min(32, parseInt(rawValue, 10) || 0));

  const otherSum = STAT_KEYS.reduce((acc, k) => (k === statKey ? acc : acc + (mon.sp[k] || 0)), 0);
  const maxAllowed = Math.max(0, 66 - otherSum);
  if (val > maxAllowed) {
    val = maxAllowed;
  }
  mon.sp[statKey] = val;
  saveTeamsToStorage();
  renderTeamRibbon();
  renderBuilderStatsTable();
}

function applySpPreset(presetKey) {
  const mon = getCurrentPokemon();
  if (!mon || !presetKey) return;

  const presets = {
    phys_sweeper: { hp: 2, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 },
    spec_sweeper: { hp: 2, atk: 0, def: 0, spa: 32, spd: 0, spe: 32 },
    bulky_phys:   { hp: 32, atk: 32, def: 2, spa: 0, spd: 0, spe: 0 },
    bulky_spec:   { hp: 32, atk: 0, def: 0, spa: 32, spd: 2, spe: 0 },
    support_bal:  { hp: 32, atk: 0, def: 20, spa: 0, spd: 14, spe: 0 },
    support_spd:  { hp: 32, atk: 0, def: 12, spa: 0, spd: 22, spe: 0 },
    reset:        { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }
  };

  if (presets[presetKey]) {
    mon.sp = { ...presets[presetKey] };
    saveTeamsToStorage();
    renderTeamRibbon();
    renderBuilderStatsTable();
    showToast("Đã áp dụng phân bổ SP!", "success");
  }
}

function clearCurrentSlot() {
  const team = getCurrentTeam();
  team.slots[activeSlotIndex] = createEmptySlot();
  saveTeamsToStorage();
  renderTeamRibbon();
  renderActiveSlotEditor();
  showToast("Đã đặt lại Slot #" + (activeSlotIndex + 1));
}

function sendCurrentToCalc(side = "p1") {
  const mon = getCurrentPokemon();
  if (!mon) return;
  applyPokemonObjectToCalcSide(side, mon);
  switchMainTab("calc");
  showToast(`Đã nạp ${mon.species} sang Damage Calc!`, "success");
}

function sendCurrentToSpeed() {
  const mon = getCurrentPokemon();
  if (!mon) return;
  const card = createSpeedCardFromMon(mon);
  const emptyIdx = speedSlots.findIndex((s) => s === null);
  if (emptyIdx !== -1) {
    speedSlots[emptyIdx] = card;
  } else {
    speedSlots[0] = card;
  }
  switchMainTab("speed");
  showToast(`Đã nạp ${mon.species} vào ô so sánh Speed!`, "success");
}

// ============================================================================
// SHOWDOWN EXPORT & IMPORT (OTS KEEPS NATURE, HIDES EVs/SP)
// ============================================================================

function formatTeamToShowdown(team, mode = "ranked") {
  return team.slots
    .map((mon) => {
      const lines = [];
      const genderStr = mon.gender ? ` (${mon.gender})` : "";
      const nameStr = mon.nickname && mon.nickname.trim()
        ? `${mon.nickname.trim()} (${mon.species})${genderStr}`
        : `${mon.species}${genderStr}`;
      const itemStr = mon.item && mon.item !== "None" ? ` @ ${mon.item}` : "";
      lines.push(`${nameStr}${itemStr}`);

      if (mon.ability) {
        lines.push(`Ability: ${mon.ability}`);
      }
      lines.push(`Level: 50`);

      if (mode === "ranked") {
        const evParts = STAT_KEYS.filter((k) => (mon.sp[k] || 0) > 0).map(
          (k) => `${spToEvEquivalent(mon.sp[k])} ${STAT_LABELS[k]}`
        );
        if (evParts.length > 0) {
          lines.push(`EVs: ${evParts.join(" / ")}`);
        }
      }

      if (mon.nature) {
        lines.push(`${mon.nature} Nature`);
      }

      (mon.moves || []).forEach((mv) => {
        if (mv) lines.push(`- ${mv}`);
      });

      return lines.join("\n");
    })
    .join("\n\n");
}

function parseShowdownPasteToSlots(pasteText) {
  const blocks = pasteText
    .trim()
    .split(/\n\s*\n/)
    .filter((b) => b.trim().length > 0)
    .slice(0, 6);

  if (blocks.length === 0) return null;

  const knownSpecies = Object.keys(POKEDEX_MC);

  const parsedSlots = blocks.map((block) => {
    const slot = createEmptySlot();
    slot.sp = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
    slot.moves = [];

    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return slot;

    let header = lines[0];
    if (header.includes("@")) {
      const parts = header.split("@");
      header = parts[0].trim();
      const rawItem = parts.slice(1).join("@").trim();
      const matchedItem = ITEMS_MC.find((i) => i.toLowerCase() === rawItem.toLowerCase());
      slot.item = matchedItem || rawItem;
    } else {
      slot.item = "None";
    }

    if (header.endsWith("(M)")) {
      slot.gender = "M";
      header = header.slice(0, -3).trim();
    } else if (header.endsWith("(F)")) {
      slot.gender = "F";
      header = header.slice(0, -3).trim();
    } else {
      slot.gender = "";
    }

    const parenMatch = header.match(/^(.*?)\(([^)]+)\)$/);
    let rawSpecies = header;
    if (parenMatch) {
      slot.nickname = parenMatch[1].trim();
      rawSpecies = parenMatch[2].trim();
    }

    let matchedSpecies = knownSpecies.find(
      (s) => s.toLowerCase() === rawSpecies.toLowerCase()
    );
    if (!matchedSpecies) {
      matchedSpecies = knownSpecies.find((s) =>
        rawSpecies.toLowerCase().startsWith(s.toLowerCase())
      );
    }
    slot.species = matchedSpecies || "Garchomp";
    const dexData = POKEDEX_MC[slot.species];

    if (dexData && dexData.megas && (dexData.megas[slot.item] || rawSpecies.toLowerCase().includes("mega"))) {
      slot.isMega = true;
      if (!dexData.megas[slot.item]) {
        slot.item = dexData.defaultMegaStone;
      }
    } else {
      slot.isMega = false;
    }

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith("Ability:")) {
        const ab = line.replace("Ability:", "").trim();
        slot.ability = dexData.abilities.includes(ab) ? ab : dexData.abilities[0];
      } else if (line.endsWith("Nature")) {
        const natName = line.replace("Nature", "").trim();
        if (NATURES[natName]) slot.nature = natName;
      } else if (line.startsWith("EVs:")) {
        const evStr = line.replace("EVs:", "").trim();
        let budget = 66;
        evStr.split("/").forEach((part) => {
          const m = part.trim().match(/^(\d+)\s+(HP|Atk|Def|SpA|SpD|Spe)$/i);
          if (m) {
            const evNum = parseInt(m[1], 10);
            const key = m[2].toLowerCase();
            let sp = evToSpEquivalent(evNum);
            if (sp > budget) sp = budget;
            slot.sp[key] = sp;
            budget -= sp;
          }
        });
      } else if (line.startsWith("-")) {
        const mvRaw = line.replace(/^-+/, "").trim();
        const foundMove = Object.keys(MOVES_DB).find(
          (m) => m.toLowerCase() === mvRaw.toLowerCase()
        );
        if (foundMove && slot.moves.length < 4) {
          slot.moves.push(foundMove);
        }
      }
    }

    while (slot.moves.length < 4) {
      slot.moves.push(dexData.defaultMoves[slot.moves.length] || "Protect");
    }

    return slot;
  });

  while (parsedSlots.length < 6) {
    parsedSlots.push(createEmptySlot());
  }

  return parsedSlots;
}

function openExportModal(mode = "ranked") {
  modalMode = mode;
  const modal = document.getElementById("paste-modal");
  const title = document.getElementById("modal-title");
  const subtitle = document.getElementById("modal-subtitle");
  const tabs = document.getElementById("modal-export-tabs");
  const btn = document.getElementById("modal-action-btn");

  tabs.classList.remove("hidden");
  title.textContent = mode === "ots"
    ? "Xuất Open Team Sheet (Đánh Giải OTS)"
    : "Xuất Team Showdown (Đấu Rank)";
  subtitle.textContent = mode === "ots"
    ? "Giữ nguyên Nature, Ability, Item, Moves — chỉ ẩn chỉ số EVs / SP"
    : "Đầy đủ toàn bộ thông tin SP / EVs và Nature để luyện tập";
  btn.textContent = "Sao chép vào Clipboard";

  updateExportModalTabStyles(mode);
  document.getElementById("modal-paste-textarea").value = formatTeamToShowdown(getCurrentTeam(), mode);
  modal.classList.remove("hidden");
}

function switchExportModalMode(mode) {
  modalMode = mode;
  updateExportModalTabStyles(mode);
  const title = document.getElementById("modal-title");
  const subtitle = document.getElementById("modal-subtitle");
  title.textContent = mode === "ots"
    ? "Xuất Open Team Sheet (Đánh Giải OTS)"
    : "Xuất Team Showdown (Đấu Rank)";
  subtitle.textContent = mode === "ots"
    ? "Giữ nguyên Nature, Ability, Item, Moves — chỉ ẩn chỉ số EVs / SP"
    : "Đầy đủ toàn bộ thông tin SP / EVs và Nature để luyện tập";
  document.getElementById("modal-paste-textarea").value = formatTeamToShowdown(getCurrentTeam(), mode);
}

function updateExportModalTabStyles(mode) {
  const tabRank = document.getElementById("modal-tab-ranked");
  const tabOts = document.getElementById("modal-tab-ots");
  if (mode === "ranked") {
    tabRank.className = "flex-1 py-1.5 rounded-lg text-xs font-bold transition bg-sky-500 text-slate-950";
    tabOts.className = "flex-1 py-1.5 rounded-lg text-xs font-bold transition text-slate-300 hover:text-white";
  } else {
    tabOts.className = "flex-1 py-1.5 rounded-lg text-xs font-bold transition bg-amber-500 text-slate-950";
    tabRank.className = "flex-1 py-1.5 rounded-lg text-xs font-bold transition text-slate-300 hover:text-white";
  }
}

function openImportModal() {
  modalMode = "import";
  const modal = document.getElementById("paste-modal");
  document.getElementById("modal-title").textContent = "Nhập Đội Hình Từ Showdown Paste";
  document.getElementById("modal-subtitle").textContent = "Dán văn bản Showdown 6 Pokémon vào bên dưới để nạp tự động";
  document.getElementById("modal-export-tabs").classList.add("hidden");
  document.getElementById("modal-action-btn").textContent = "Nạp vào Đội Hình";
  document.getElementById("modal-paste-textarea").value = "";
  modal.classList.remove("hidden");
}

function closePasteModal() {
  document.getElementById("paste-modal").classList.add("hidden");
}

function handleModalPrimaryAction() {
  const textarea = document.getElementById("modal-paste-textarea");
  if (modalMode === "import") {
    const slots = parseShowdownPasteToSlots(textarea.value);
    if (!slots) {
      showToast("Không nhận diện được dữ liệu Pokémon!", "error");
      return;
    }
    const team = getCurrentTeam();
    team.slots = slots;
    activeSlotIndex = 0;
    saveTeamsToStorage();
    renderTeamRibbon();
    renderActiveSlotEditor();
    closePasteModal();
    showToast("Đã nhập đội hình thành công!", "success");
  } else {
    copyTextToClipboard(textarea.value);
  }
}

function copyTextToClipboard(text) {
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    showToast("Đã sao chép vào Clipboard!", "success");
  });
}

// ============================================================================
// CUSTOM DARK MOVE DROPDOWN (PREVENTS NATIVE WHITE POPUP MENU)
// ============================================================================

function toggleMoveDropdown(side, mIdx, event) {
  event.stopPropagation();
  const id = `${side}-${mIdx}`;
  activeMoveDropdownId = activeMoveDropdownId === id ? null : id;
  renderCalcSideUI(side);
  if (activeMoveDropdownId === id) {
    setTimeout(() => {
      const searchEl = document.getElementById(`move-search-${id}`);
      searchEl?.focus();
    }, 20);
  }
}

function filterMoveDropdownList(side, mIdx, query) {
  const q = (query || "").trim().toLowerCase();
  const listEl = document.getElementById(`move-options-${side}-${mIdx}`);
  if (!listEl) return;

  const currentMoveName = calcState[side]?.moves?.[mIdx]?.name || "";
  const filteredMoves = Object.keys(MOVES_DB)
    .sort()
    .filter((mv) => {
      const meta = MOVES_DB[mv];
      return (
        mv.toLowerCase().includes(q) ||
        meta.type.toLowerCase().includes(q) ||
        meta.cat.toLowerCase().includes(q)
      );
    });

  if (filteredMoves.length === 0) {
    listEl.innerHTML = `<div class="px-2.5 py-3 text-center text-xs text-slate-400">Không tìm thấy chiêu "${escapeHtml(query)}".</div>`;
    return;
  }

  listEl.innerHTML = filteredMoves
    .map((mv) => {
      const meta = MOVES_DB[mv];
      const isCur = mv === currentMoveName;
      return `
        <button type="button"
          onclick="pickMoveFromDropdown('${side}', ${mIdx}, '${mv.replace(/'/g, "\\'")}')"
          class="move-dropdown-item w-full px-2.5 py-1.5 text-left flex items-center justify-between gap-2 text-xs ${
            isCur ? "bg-sky-500/20 text-sky-300 font-bold" : "text-slate-200"
          } transition">
          <span class="truncate">${escapeHtml(mv)}</span>
          <span class="flex items-center gap-1.5 shrink-0">
            <span class="font-mono text-[10px] text-slate-400">${meta.bp || "-"}</span>
            <span class="type-badge type-${meta.type}">${meta.type}</span>
          </span>
        </button>
      `;
    })
    .join("");
}

function pickMoveFromDropdown(side, mIdx, moveName) {
  activeMoveDropdownId = null;
  updateCalcMove(side, mIdx, moveName);
}

// ============================================================================
// SHOWDOWN-STYLE DAMAGE CALCULATOR ENGINE
// ============================================================================

function initCalcWorkspace() {
  refreshCalcTeamDropdowns();
  renderCalcSideUI("p1");
  renderCalcSideUI("p2");
  runDamageCalculation();
}

function refreshCalcTeamDropdowns() {
  const team = getCurrentTeam();
  if (!team) return;
  const opts = `<option value="">Nạp từ Team...</option>` +
    team.slots
      .map((mon, idx) => {
        const form = getEffectiveForm(mon.species, mon.isMega, mon.item);
        return `<option value="${idx}">Slot ${idx + 1}: ${form.displayName}</option>`;
      })
      .join("");
  ["calc-p1-team-slot", "calc-p2-team-slot"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = opts;
  });
}

function applyPokemonObjectToCalcSide(side, mon) {
  calcState[side] = {
    species: mon.species,
    isMega: !!mon.isMega,
    item: mon.item || "None",
    ability: mon.ability || POKEDEX_MC[mon.species].abilities[0],
    nature: mon.nature || "Serious",
    status: "Healthy",
    sp: { ...mon.sp },
    stages: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
    moves: (mon.moves || ["Protect", "Protect", "Protect", "Protect"]).map((m) => ({
      name: m,
      crit: false
    })),
    selectedMoveIdx: 0
  };
  const dmgIdx = calcState[side].moves.findIndex((m) => (MOVES_DB[m.name]?.bp || 0) > 0);
  if (dmgIdx !== -1) calcState[side].selectedMoveIdx = dmgIdx;

  renderCalcSideUI(side);
  runDamageCalculation();
}

function loadTeamSlotToCalc(side, slotIdxStr) {
  if (slotIdxStr === "") return;
  const idx = parseInt(slotIdxStr, 10);
  const team = getCurrentTeam();
  if (!team || !team.slots[idx]) return;
  applyPokemonObjectToCalcSide(side, team.slots[idx]);
}

function updateCalcSide(side, key, value) {
  const st = calcState[side];
  if (!st) return;

  if (key === "species") {
    const dexData = POKEDEX_MC[value];
    st.species = value;
    st.ability = dexData.abilities[0];
    st.moves = dexData.defaultMoves.map((m) => ({ name: m, crit: false }));
    st.selectedMoveIdx = 0;
    if (dexData.megas) {
      st.isMega = true;
      st.item = dexData.defaultMegaStone;
    } else {
      st.isMega = false;
    }
  } else if (key === "isMega") {
    const dexData = POKEDEX_MC[st.species];
    st.isMega = Boolean(value && dexData.megas);
    if (st.isMega && (!st.item || !dexData.megas[st.item])) {
      st.item = dexData.defaultMegaStone;
    }
  } else if (key === "item") {
    st.item = value;
    const dexData = POKEDEX_MC[st.species];
    if (dexData && dexData.megas && dexData.megas[value]) {
      st.isMega = true;
    } else {
      st.isMega = false;
    }
  } else {
    st[key] = value;
  }

  renderCalcSideUI(side);
  runDamageCalculation();
}

function updateCalcStatSP(side, statKey, rawVal) {
  const val = Math.max(0, Math.min(32, parseInt(rawVal, 10) || 0));
  calcState[side].sp[statKey] = val;
  renderCalcSideUI(side);
  runDamageCalculation();
}

function updateCalcStage(side, statKey, rawStage) {
  calcState[side].stages[statKey] = Math.max(-6, Math.min(6, parseInt(rawStage, 10) || 0));
  runDamageCalculation();
}

function updateCalcMove(side, mIdx, moveName) {
  calcState[side].moves[mIdx].name = moveName;
  calcState.activeSide = side;
  calcState[side].selectedMoveIdx = mIdx;
  renderCalcSideUI(side);
  runDamageCalculation();
}

function toggleCalcMoveCrit(side, mIdx, isCrit) {
  calcState[side].moves[mIdx].crit = isCrit;
  calcState.activeSide = side;
  calcState[side].selectedMoveIdx = mIdx;
  runDamageCalculation();
}

function selectCalcActiveMove(side, mIdx) {
  calcState.activeSide = side;
  calcState[side].selectedMoveIdx = mIdx;
  runDamageCalculation();
}

function renderCalcSideUI(side) {
  const st = calcState[side];
  const dexData = POKEDEX_MC[st.species] || POKEDEX_MC["Garchomp"];
  const form = getEffectiveForm(st.species, st.isMega, st.item);

  setImgElementForm(document.getElementById(`calc-${side}-sprite`), form);
  const spLabel = document.getElementById(`calc-${side}-species-label`);
  if (spLabel) spLabel.textContent = st.species;

  const megaChk = document.getElementById(`calc-${side}-mega`);
  megaChk.checked = form.isMegaActive;
  megaChk.disabled = !dexData.megas;

  document.getElementById(`calc-${side}-types`).innerHTML = renderTypeBadgesHtml(form.types);
  document.getElementById(`calc-${side}-item`).value = st.item;
  document.getElementById(`calc-${side}-nature`).value = st.nature;
  document.getElementById(`calc-${side}-status`).value = st.status;

  const abSel = document.getElementById(`calc-${side}-ability`);
  const abilitiesPool = [...dexData.abilities];
  if (form.isMegaActive && form.ability && !abilitiesPool.includes(form.ability)) {
    abilitiesPool.unshift(form.ability);
    st.ability = form.ability;
  }
  abSel.innerHTML = abilitiesPool
    .map((ab) => `<option value="${ab}" ${st.ability === ab ? "selected" : ""}>${ab}</option>`)
    .join("");

  const nat = NATURES[st.nature] || NATURES.Serious;
  const statsContainer = document.getElementById(`calc-${side}-stats-table`);
  statsContainer.innerHTML = STAT_KEYS.map((k) => {
    const baseVal = form.base[k];
    const spVal = st.sp[k] || 0;
    const finalStat = calculateLv50Stat(k, baseVal, spVal, st.nature);
    const natMark = nat.plus === k ? "+" : nat.minus === k ? "-" : "";
    const stageOptions = [6, 5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5, -6]
      .map((s) => `<option value="${s}" ${(st.stages[k] || 0) === s ? "selected" : ""}>${s > 0 ? "+" + s : s}</option>`)
      .join("");

    return `
      <div class="grid grid-cols-12 gap-1 items-center text-xs py-0.5">
        <div class="col-span-3 font-semibold text-slate-300">${STAT_LABELS[k]}${natMark}</div>
        <div class="col-span-2 text-center font-mono text-[11px] text-slate-400">${baseVal}</div>
        <div class="col-span-3 text-center">
          <input type="number" min="0" max="32" value="${spVal}" onchange="updateCalcStatSP('${side}', '${k}', this.value)"
            class="w-12 bg-slate-900 border border-slate-700 rounded px-1 py-0.5 text-center font-mono text-[11px] text-sky-300 font-bold" />
        </div>
        <div class="col-span-2 text-center font-mono font-bold text-white">${finalStat}</div>
        <div class="col-span-2 text-center">
          ${
            k === "hp"
              ? `<span class="text-[10px] text-slate-600">-</span>`
              : `<select onchange="updateCalcStage('${side}', '${k}', this.value)" class="bg-slate-900 border border-slate-700 rounded px-1 py-0.5 font-mono text-[10px] text-slate-200">${stageOptions}</select>`
          }
        </div>
      </div>
    `;
  }).join("");

  const allMoves = Object.keys(MOVES_DB).sort();
  const movesContainer = document.getElementById(`calc-${side}-moves-editor`);
  movesContainer.innerHTML = [0, 1, 2, 3]
    .map((mIdx) => {
      const mObj = st.moves[mIdx];
      const meta = MOVES_DB[mObj.name] || { bp: 0, type: "Normal", cat: "Status" };
      const dropdownId = `${side}-${mIdx}`;
      const isOpen = activeMoveDropdownId === dropdownId;

      return `
        <div data-move-picker class="relative flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded-lg px-2 py-1 text-xs">
          <button type="button" onclick="toggleMoveDropdown('${side}', ${mIdx}, event)"
            class="flex-1 flex items-center justify-between gap-1 text-left font-semibold text-white hover:text-sky-300 truncate min-w-0">
            <span class="truncate">${escapeHtml(mObj.name)}</span>
            <span class="text-slate-400 text-[10px] shrink-0">▾</span>
          </button>
          <span class="font-mono text-[11px] text-slate-400 w-7 text-right">${meta.bp || "-"}</span>
          <span class="type-badge type-${meta.type} w-14 text-center">${meta.type}</span>
          <label class="flex items-center gap-0.5 text-[10px] text-amber-300 cursor-pointer shrink-0" title="Critical Hit">
            <input type="checkbox" ${mObj.crit ? "checked" : ""} onchange="toggleCalcMoveCrit('${side}', ${mIdx}, this.checked)" /> Crit
          </label>

          ${
            isOpen
              ? `
            <div onclick="event.stopPropagation()" class="move-dropdown-menu absolute left-0 right-0 top-full mt-1 z-40 rounded-xl overflow-hidden">
              <div class="p-1.5 border-b border-slate-800 bg-slate-900">
                <input id="move-search-${dropdownId}" type="text"
                  oninput="filterMoveDropdownList('${side}', ${mIdx}, this.value)"
                  placeholder="Gõ tên chiêu hoặc hệ..."
                  class="w-full bg-slate-950 border border-slate-700 focus:border-sky-500 rounded-lg px-2 py-1 text-xs text-white focus:outline-none" />
              </div>
              <div id="move-options-${dropdownId}" class="max-h-52 overflow-y-auto divide-y divide-slate-800/50">
                ${allMoves
                  .map((mv) => {
                    const mInfo = MOVES_DB[mv];
                    return `
                      <button type="button"
                        onclick="pickMoveFromDropdown('${side}', ${mIdx}, '${mv.replace(/'/g, "\\'")}')"
                        class="move-dropdown-item w-full px-2.5 py-1.5 text-left flex items-center justify-between gap-2 text-xs ${
                          mv === mObj.name ? "bg-sky-500/20 text-sky-300 font-bold" : "text-slate-200"
                        } transition">
                        <span class="truncate">${escapeHtml(mv)}</span>
                        <span class="flex items-center gap-1.5 shrink-0">
                          <span class="font-mono text-[10px] text-slate-400">${mInfo.bp || "-"}</span>
                          <span class="type-badge type-${mInfo.type}">${mInfo.type}</span>
                        </span>
                      </button>
                    `;
                  })
                  .join("")}
              </div>
            </div>
          `
              : ""
          }
        </div>
      `;
    })
    .join("");
}

function swapCalcSides() {
  activeMoveDropdownId = null;
  const temp = cloneDeep(calcState.p1);
  calcState.p1 = cloneDeep(calcState.p2);
  calcState.p2 = temp;
  calcState.activeSide = calcState.activeSide === "p1" ? "p2" : "p1";
  renderCalcSideUI("p1");
  renderCalcSideUI("p2");
  runDamageCalculation();
  showToast("Đã đổi vị trí Pokémon 1 và Pokémon 2!");
}

function setCalcFormat(isDoubles) {
  calcState.field.isDoubles = isDoubles;
  const btnSingles = document.getElementById("field-fmt-singles");
  const btnDoubles = document.getElementById("field-fmt-doubles");
  if (isDoubles) {
    btnDoubles.className = "py-1 rounded-lg text-[11px] font-bold bg-sky-500 text-slate-950";
    btnSingles.className = "py-1 rounded-lg text-[11px] font-bold text-slate-400";
  } else {
    btnSingles.className = "py-1 rounded-lg text-[11px] font-bold bg-sky-500 text-slate-950";
    btnDoubles.className = "py-1 rounded-lg text-[11px] font-bold text-slate-400";
  }
  runDamageCalculation();
}

function setFieldOption(fieldType, value) {
  calcState.field[fieldType] = value;
  const attr = fieldType === "weather" ? "data-field-weather" : "data-field-terrain";
  document.querySelectorAll(`[${attr}]`).forEach((btn) => {
    const isMatch = btn.getAttribute(attr) === value;
    const colSpan = btn.getAttribute(attr) === "None" ? "col-span-2 " : "";
    btn.className = isMatch
      ? `${colSpan}py-1 rounded bg-sky-500 text-slate-950 font-bold`
      : `${colSpan}py-1 rounded bg-slate-900 text-slate-300 border border-slate-800`;
  });
  runDamageCalculation();
}

function getTypeEffectiveness(moveType, defTypes) {
  let mult = 1;
  const chartRow = TYPE_CHART[moveType] || {};
  (defTypes || []).forEach((dt) => {
    if (chartRow[dt] !== undefined) {
      mult *= chartRow[dt];
    }
  });
  return mult;
}

function computeSingleMoveDamage(atkSideKey, defSideKey, moveObj) {
  const atk = calcState[atkSideKey];
  const def = calcState[defSideKey];
  const atkForm = getEffectiveForm(atk.species, atk.isMega, atk.item);
  const defForm = getEffectiveForm(def.species, def.isMega, def.item);

  const defMaxHp = calculateLv50Stat("hp", defForm.base.hp, def.sp.hp, def.nature);
  const moveMeta = MOVES_DB[moveObj.name] || { bp: 0, type: "Normal", cat: "Status", spread: false };

  if (moveMeta.cat === "Status" || !moveMeta.bp || moveMeta.bp <= 0) {
    return {
      rolls: Array(16).fill(0),
      min: 0,
      max: 0,
      minPct: 0,
      maxPct: 0,
      defMaxHp,
      koText: "Status Move (0%)"
    };
  }

  const defProtect = document.getElementById(`side-${defSideKey}-protect`)?.checked;
  if (defProtect && moveObj.name !== "Feint") {
    return {
      rolls: Array(16).fill(0),
      min: 0,
      max: 0,
      minPct: 0,
      maxPct: 0,
      defMaxHp,
      koText: "Blocked by Protect"
    };
  }

  let effType = moveMeta.type;
  let bp = moveMeta.bp;
  let abilityBoost = 1.0;

  if (effType === "Normal" && (atk.ability === "Pixilate" || atk.ability === "Aerilate" || atk.ability === "Refrigerate")) {
    effType = atk.ability === "Pixilate" ? "Fairy" : atk.ability === "Aerilate" ? "Flying" : "Ice";
    abilityBoost *= 1.2;
  }
  if (moveObj.name === "Weather Ball" && calcState.field.weather !== "None") {
    const wMap = { Sun: "Fire", Rain: "Water", Sand: "Rock", Snow: "Ice" };
    effType = wMap[calcState.field.weather] || "Normal";
  }

  if (effType === "Ground" && def.ability === "Levitate") {
    return { rolls: Array(16).fill(0), min: 0, max: 0, minPct: 0, maxPct: 0, defMaxHp, koText: "Immune (Levitate)" };
  }
  if (effType === "Fire" && def.ability === "Flash Fire") {
    return { rolls: Array(16).fill(0), min: 0, max: 0, minPct: 0, maxPct: 0, defMaxHp, koText: "Immune (Flash Fire)" };
  }
  if (effType === "Electric" && def.ability === "Lightning Rod") {
    return { rolls: Array(16).fill(0), min: 0, max: 0, minPct: 0, maxPct: 0, defMaxHp, koText: "Immune (Lightning Rod)" };
  }

  const typeMult = getTypeEffectiveness(effType, defForm.types);
  if (typeMult === 0) {
    return { rolls: Array(16).fill(0), min: 0, max: 0, minPct: 0, maxPct: 0, defMaxHp, koText: "Immune (0x)" };
  }

  const isPhys = moveMeta.cat === "Physical";
  const isBodyPress = moveObj.name === "Body Press";
  const atkStatKey = isBodyPress ? "def" : isPhys ? "atk" : "spa";
  const defStatKey = isPhys ? "def" : "spd";

  let rawA = calculateLv50Stat(atkStatKey, atkForm.base[atkStatKey], atk.sp[atkStatKey], atk.nature);
  let rawD = calculateLv50Stat(defStatKey, defForm.base[defStatKey], def.sp[defStatKey], def.nature);

  let atkStage = atk.stages[atkStatKey] || 0;
  let defStage = def.stages[defStatKey] || 0;
  if (moveObj.crit) {
    if (atkStage < 0) atkStage = 0;
    if (defStage > 0) defStage = 0;
  }

  let A = Math.floor(rawA * getStageMultiplier(atkStage));
  let D = Math.floor(rawD * getStageMultiplier(defStage));

  if (isPhys && atk.item === "Choice Band") A = Math.floor(A * 1.5);
  if (!isPhys && atk.item === "Choice Specs") A = Math.floor(A * 1.5);
  if (isPhys && atk.ability === "Huge Power") A = Math.floor(A * 2);
  if (!isPhys && def.item === "Assault Vest") D = Math.floor(D * 1.5);
  if (def.item === "Eviolite") D = Math.floor(D * 1.5);
  if (calcState.field.weather === "Sand" && defForm.types.includes("Rock") && !isPhys) {
    D = Math.floor(D * 1.5);
  }
  if (calcState.field.weather === "Snow" && defForm.types.includes("Ice") && isPhys) {
    D = Math.floor(D * 1.5);
  }

  if (atk.ability === "Tough Claws" && moveMeta.contact) abilityBoost *= 1.3;
  if (atk.ability === "Sharpness" && moveMeta.slicing) abilityBoost *= 1.5;
  if (atk.ability === "Water Bubble" && effType === "Water") abilityBoost *= 2.0;
  if (atk.ability === "Technician" && bp <= 60) abilityBoost *= 1.5;
  if (atk.ability === "Mega Launcher" && ["Aura Sphere", "Water Pulse", "Dark Pulse", "Dragon Pulse"].includes(moveObj.name)) {
    abilityBoost *= 1.5;
  }
  if (atk.ability === "Solar Power" && calcState.field.weather === "Sun" && !isPhys) {
    A = Math.floor(A * 1.5);
  }
  if (def.ability === "Thick Fat" && (effType === "Fire" || effType === "Ice")) {
    abilityBoost *= 0.5;
  }
  if (def.ability === "Heatproof" && effType === "Fire") {
    abilityBoost *= 0.5;
  }
  if (def.ability === "Multiscale") {
    abilityBoost *= 0.5;
  }
  if (def.ability === "Filter" && typeMult > 1) {
    abilityBoost *= 0.75;
  }

  bp = Math.max(1, Math.floor(bp * abilityBoost));

  let baseDamage = Math.floor(Math.floor(Math.floor((2 * 50) / 5 + 2) * bp * A / Math.max(1, D)) / 50) + 2;

  if (calcState.field.isDoubles && moveMeta.spread) {
    baseDamage = Math.floor(baseDamage * 0.75);
  }

  if (calcState.field.weather === "Sun") {
    if (effType === "Fire") baseDamage = Math.floor(baseDamage * 1.5);
    if (effType === "Water") baseDamage = Math.floor(baseDamage * 0.5);
  } else if (calcState.field.weather === "Rain") {
    if (effType === "Water") baseDamage = Math.floor(baseDamage * 1.5);
    if (effType === "Fire") baseDamage = Math.floor(baseDamage * 0.5);
  }

  if (moveObj.crit) {
    baseDamage = Math.floor(baseDamage * 1.5);
  }

  const hasStab = atkForm.types.includes(effType);
  const stabMult = hasStab ? (atk.ability === "Adaptability" ? 2.0 : 1.5) : 1.0;
  const burnMult = isPhys && atk.status === "Burned" ? 0.5 : 1.0;

  let terrainMult = 1.0;
  if (calcState.field.terrain === "Electric" && effType === "Electric" && !atkForm.types.includes("Flying") && atk.ability !== "Levitate") {
    terrainMult = 1.3;
  } else if (calcState.field.terrain === "Grassy" && effType === "Grass" && !atkForm.types.includes("Flying") && atk.ability !== "Levitate") {
    terrainMult = 1.3;
  } else if (calcState.field.terrain === "Psychic" && effType === "Psychic" && !atkForm.types.includes("Flying") && atk.ability !== "Levitate") {
    terrainMult = 1.3;
  } else if (calcState.field.terrain === "Misty" && effType === "Dragon") {
    terrainMult = 0.5;
  }

  const hhActive = document.getElementById(`side-${atkSideKey}-hh`)?.checked;
  const hhMult = hhActive ? 1.5 : 1.0;

  const fgActive = document.getElementById(`side-${defSideKey}-friendguard`)?.checked;
  const fgMult = fgActive ? 0.75 : 1.0;

  const reflectOn = document.getElementById(`side-${defSideKey}-reflect`)?.checked;
  const lsOn = document.getElementById(`side-${defSideKey}-lightscreen`)?.checked;
  const veilOn = document.getElementById(`side-${defSideKey}-auroraveil`)?.checked;

  let screenMult = 1.0;
  if (!moveObj.crit && atk.ability !== "Infiltrator") {
    if ((isPhys && (reflectOn || veilOn)) || (!isPhys && (lsOn || veilOn))) {
      screenMult = calcState.field.isDoubles ? 2732 / 4096 : 0.5;
    }
  }

  let itemDmgMult = 1.0;
  if (atk.item === "Life Orb") itemDmgMult *= 1.3;
  if (atk.item === "Expert Belt" && typeMult > 1) itemDmgMult *= 1.2;

  const typeItems = {
    "Black Glasses": "Dark",
    "Charcoal": "Fire",
    "Mystic Water": "Water",
    "Miracle Seed": "Grass",
    "Fairy Feather": "Fairy",
    "Spell Tag": "Ghost",
    "Sharp Beak": "Flying",
    "Dragon Fang": "Dragon",
    "Magnet": "Electric",
    "Never-Melt Ice": "Ice",
    "Silk Scarf": "Normal"
  };
  if (typeItems[atk.item] === effType) {
    itemDmgMult *= 1.2;
  }

  const rolls = [];
  for (let r = 85; r <= 100; r++) {
    let d = Math.floor((baseDamage * r) / 100);
    d = Math.floor(d * stabMult);
    d = Math.floor(d * typeMult);
    d = Math.floor(d * burnMult);
    d = Math.floor(d * terrainMult);
    d = Math.floor(d * hhMult);
    d = Math.floor(d * screenMult);
    d = Math.floor(d * fgMult);
    d = Math.floor(d * itemDmgMult);
    rolls.push(Math.max(1, d));
  }

  const min = rolls[0];
  const max = rolls[15];
  const minPct = Number(((min / defMaxHp) * 100).toFixed(1));
  const maxPct = Number(((max / defMaxHp) * 100).toFixed(1));

  let koText = "possible 5HKO+";
  if (min >= defMaxHp) {
    koText = "guaranteed OHKO";
  } else if (max >= defMaxHp) {
    const ohkoRolls = rolls.filter((v) => v >= defMaxHp).length;
    const pct = ((ohkoRolls / 16) * 100).toFixed(1);
    koText = `${pct}% chance to OHKO`;
  } else if (min * 2 >= defMaxHp) {
    koText = "guaranteed 2HKO";
  } else if (max * 2 >= defMaxHp) {
    koText = "possible 2HKO";
  } else if (min * 3 >= defMaxHp) {
    koText = "guaranteed 3HKO";
  } else if (max * 3 >= defMaxHp) {
    koText = "possible 3HKO";
  } else if (max * 4 >= defMaxHp) {
    koText = "possible 4HKO";
  }

  return { rolls, min, max, minPct, maxPct, defMaxHp, koText };
}

function runDamageCalculation() {
  const p1Form = getEffectiveForm(calcState.p1.species, calcState.p1.isMega, calcState.p1.item);
  const p2Form = getEffectiveForm(calcState.p2.species, calcState.p2.isMega, calcState.p2.item);

  document.getElementById("calc-top-p1-name").textContent = p1Form.displayName;
  document.getElementById("calc-top-p2-name").textContent = p2Form.displayName;

  const p1Results = calcState.p1.moves.map((m) => computeSingleMoveDamage("p1", "p2", m));
  const p2Results = calcState.p2.moves.map((m) => computeSingleMoveDamage("p2", "p1", m));

  document.getElementById("calc-top-p1-moves").innerHTML = calcState.p1.moves
    .map((m, idx) => {
      const res = p1Results[idx];
      const isSelected = calcState.activeSide === "p1" && calcState.p1.selectedMoveIdx === idx;
      return `
        <button type="button" onclick="selectCalcActiveMove('p1', ${idx})"
          class="calc-move-pill w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs ${
            isSelected ? "selected-move text-white font-bold" : "border-slate-800/80 bg-slate-900/50 text-slate-300 hover:border-slate-700"
          }">
          <span class="truncate">${escapeHtml(m.name)}</span>
          <span class="font-mono text-[11px] ${res.maxPct >= 100 ? "text-rose-400 font-bold" : "text-sky-300"}">
            ${res.minPct} - ${res.maxPct}%
          </span>
        </button>
      `;
    })
    .join("");

  document.getElementById("calc-top-p2-moves").innerHTML = calcState.p2.moves
    .map((m, idx) => {
      const res = p2Results[idx];
      const isSelected = calcState.activeSide === "p2" && calcState.p2.selectedMoveIdx === idx;
      return `
        <button type="button" onclick="selectCalcActiveMove('p2', ${idx})"
          class="calc-move-pill w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs ${
            isSelected ? "selected-move text-white font-bold" : "border-slate-800/80 bg-slate-900/50 text-slate-300 hover:border-slate-700"
          }">
          <span class="truncate">${escapeHtml(m.name)}</span>
          <span class="font-mono text-[11px] ${res.maxPct >= 100 ? "text-rose-400 font-bold" : "text-rose-300"}">
            ${res.minPct} - ${res.maxPct}%
          </span>
        </button>
      `;
    })
    .join("");

  const atkKey = calcState.activeSide;
  const defKey = atkKey === "p1" ? "p2" : "p1";
  const atk = calcState[atkKey];
  const def = calcState[defKey];
  const mIdx = atk.selectedMoveIdx;
  const activeMove = atk.moves[mIdx];
  const res = atkKey === "p1" ? p1Results[mIdx] : p2Results[mIdx];

  const aForm = atkKey === "p1" ? p1Form : p2Form;
  const dForm = defKey === "p1" ? p1Form : p2Form;
  const moveMeta = MOVES_DB[activeMove.name] || { cat: "Physical" };
  const atkStatUsed = moveMeta.cat === "Physical" ? "atk" : "spa";
  const defStatUsed = moveMeta.cat === "Physical" ? "def" : "spd";

  const atkNatSign = NATURES[atk.nature]?.plus === atkStatUsed ? "+" : NATURES[atk.nature]?.minus === atkStatUsed ? "-" : "";
  const defNatSign = NATURES[def.nature]?.plus === defStatUsed ? "+" : NATURES[def.nature]?.minus === defStatUsed ? "-" : "";

  const headline = `${atk.sp[atkStatUsed]}${atkNatSign} ${STAT_LABELS[atkStatUsed]} ${aForm.displayName} ${activeMove.name} vs. ${def.sp.hp} HP / ${def.sp[defStatUsed]}${defNatSign} ${STAT_LABELS[defStatUsed]} ${dForm.displayName}: ${res.min} - ${res.max} (${res.minPct} - ${res.maxPct}%) -- ${res.koText}`;

  document.getElementById("calc-headline").textContent = headline;
  document.getElementById("calc-subline").textContent = `Possible damage amounts: (${res.rolls.join(", ")})`;

  const remMinPct = Math.max(0, Number((100 - res.maxPct).toFixed(1)));
  const remMaxPct = Math.max(0, Number((100 - res.minPct).toFixed(1)));
  document.getElementById("calc-hp-range-text").textContent = `${remMinPct}% - ${remMaxPct}%`;
  document.getElementById("calc-hp-bar-max").style.width = `${remMaxPct}%`;
  document.getElementById("calc-hp-bar-min").style.width = `${remMinPct}%`;
}

// ============================================================================
// 3-SLOT VISUAL SPEED COMPARISON (WITH "+ Chọn Pokémon" EMPTY SLOTS)
// ============================================================================

function createSpeedCardObj(species = "Arcanine", overrides = {}) {
  const dexData = POKEDEX_MC[species] || POKEDEX_MC["Arcanine"];
  return {
    species,
    isMega: Boolean(overrides.isMega && dexData.megas),
    megaStone: overrides.megaStone || dexData.defaultMegaStone || null,
    sp: overrides.sp !== undefined ? overrides.sp : 0,
    natureMode: overrides.natureMode || "neutral", // 'minus' | 'neutral' | 'plus'
    stage: overrides.stage !== undefined ? overrides.stage : 0, // -6..+6
    weatherAbilityDouble: Boolean(overrides.weatherAbilityDouble),
    choiceScarf: Boolean(overrides.choiceScarf),
    tailwind: Boolean(overrides.tailwind)
  };
}

function createSpeedCardFromMon(mon) {
  const dexData = POKEDEX_MC[mon.species] || POKEDEX_MC["Arcanine"];
  const nat = NATURES[mon.nature] || NATURES.Serious;
  const natureMode = nat.plus === "spe" ? "plus" : nat.minus === "spe" ? "minus" : "neutral";
  return createSpeedCardObj(mon.species, {
    isMega: Boolean(mon.isMega && dexData.megas),
    megaStone: mon.item,
    sp: mon.sp?.spe || 0,
    natureMode,
    choiceScarf: mon.item === "Choice Scarf"
  });
}

function initSpeedWorkspace() {
  speedSlots = [null, null, null];
  renderSpeedComparisonCards();
}

function clearAllSpeedSlots() {
  speedSlots = [null, null, null];
  renderSpeedComparisonCards();
  showToast("Đã xóa toàn bộ ô so sánh Speed.");
}

function loadTop3TeamToSpeedCards() {
  const team = getCurrentTeam();
  if (!team) return;
  speedSlots = [0, 1, 2].map((idx) =>
    team.slots[idx] ? createSpeedCardFromMon(team.slots[idx]) : null
  );
  renderSpeedComparisonCards();
  showToast("Đã nạp 3 Pokémon đầu từ Team sang Đo Speed!", "success");
}

function removeSpeedSlot(slotIdx) {
  speedSlots[slotIdx] = null;
  renderSpeedComparisonCards();
}

function updateSpeedSlot(slotIdx, field, value) {
  const card = speedSlots[slotIdx];
  if (!card) return;

  if (field === "isMega") {
    const dexData = POKEDEX_MC[card.species];
    card.isMega = Boolean(value && dexData?.megas);
  } else if (field === "sp") {
    card.sp = Math.max(0, Math.min(32, parseInt(value, 10) || 0));
  } else if (field === "stage") {
    card.stage = Math.max(-6, Math.min(6, parseInt(value, 10) || 0));
  } else {
    card[field] = value;
  }

  renderSpeedComparisonCards();
}

function computeSpeedCardFinalValue(card) {
  const form = getEffectiveForm(card.species, card.isMega, card.megaStone);
  const natName = card.natureMode === "plus" ? "Timid" : card.natureMode === "minus" ? "Brave" : "Serious";
  let spe = calculateLv50Stat("spe", form.base.spe, card.sp, natName);

  spe = Math.floor(spe * getStageMultiplier(card.stage));

  if (card.weatherAbilityDouble) {
    spe = Math.floor(spe * 2);
  }
  if (card.choiceScarf) {
    spe = Math.floor(spe * 1.5);
  }
  if (card.tailwind) {
    spe = Math.floor(spe * 2);
  }

  return { finalSpe: spe, form };
}

function renderSpeedComparisonCards() {
  const grid = document.getElementById("speed-cards-grid");
  const emptyHint = document.getElementById("speed-empty-hint");
  if (!grid) return;

  const isTrickRoom = document.getElementById("speed-trick-room")?.checked || false;

  const computedSlots = speedSlots.map((card, slotIdx) => {
    if (!card) return { slotIdx, card: null };
    const res = computeSpeedCardFinalValue(card);
    return { slotIdx, card, finalSpe: res.finalSpe, form: res.form };
  });

  const activeItems = computedSlots.filter((s) => s.card !== null);
  if (emptyHint) {
    if (activeItems.length === 0) {
      emptyHint.classList.remove("hidden");
    } else {
      emptyHint.classList.add("hidden");
    }
  }

  const bestSpe = activeItems.reduce((best, item) => {
    if (best === null) return item.finalSpe;
    return isTrickRoom ? Math.min(best, item.finalSpe) : Math.max(best, item.finalSpe);
  }, null);

  const stagesList = [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6];

  grid.innerHTML = computedSlots
    .map(({ slotIdx, card, finalSpe, form }) => {
      if (!card) {
        return `
          <button type="button" onclick="openPokemonPicker({ mode: 'speed', slotIdx: ${slotIdx} })"
            class="glass-panel rounded-2xl p-5 min-h-[150px] border border-slate-800/90 hover:border-sky-500/60 transition flex items-center justify-center group">
            <div class="w-full h-full min-h-[112px] rounded-xl border-2 border-dashed border-slate-700/90 group-hover:border-sky-400/70 flex items-center justify-center gap-2 text-sm font-bold text-slate-300 group-hover:text-sky-300 transition">
              <span>+ Chọn Pokémon</span>
            </div>
          </button>
        `;
      }

      const dexData = POKEDEX_MC[card.species] || POKEDEX_MC["Arcanine"];
      const isWinner = bestSpe !== null && finalSpe === bestSpe;
      const badgeLabel = isTrickRoom ? "Đi trước (TR)" : "Nhanh nhất";

      const stageButtonsHtml = stagesList
        .map((st) => {
          const isCurrent = card.stage === st;
          const label = st > 0 ? `+${st}` : `${st}`;
          return `
            <button type="button" onclick="updateSpeedSlot(${slotIdx}, 'stage', ${st})"
              class="py-1 rounded text-[11px] font-mono font-bold transition ${
                isCurrent
                  ? "bg-sky-500 text-slate-950 shadow-sm shadow-sky-500/40"
                  : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
              }">
              ${label}
            </button>
          `;
        })
        .join("");

      return `
        <div class="glass-panel rounded-2xl p-5 relative flex flex-col justify-between space-y-4 transition-all ${
          isWinner
            ? "border-2 border-emerald-500 shadow-lg shadow-emerald-500/15"
            : "border border-slate-800"
        }">
          <div class="flex items-center justify-between gap-2 min-h-[28px]">
            <div>
              ${
                isWinner
                  ? `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[11px] font-extrabold tracking-wide shadow">${badgeLabel}</span>`
                  : `<span class="text-[11px] font-semibold text-slate-500">Slot #${slotIdx + 1}</span>`
              }
            </div>
            <div class="flex items-center gap-1.5">
              <button type="button" onclick="openPokemonPicker({ mode: 'speed', slotIdx: ${slotIdx} })"
                class="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] font-semibold text-sky-300 transition">
                Đổi Pokémon
              </button>
              <button type="button" onclick="removeSpeedSlot(${slotIdx})"
                class="w-7 h-7 rounded-full bg-slate-900 hover:bg-rose-500/20 border border-slate-700 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 flex items-center justify-center text-xs transition"
                title="Xóa Pokémon này">
                ✕
              </button>
            </div>
          </div>

          <div class="flex flex-col items-center text-center space-y-2">
            <button type="button" onclick="openPokemonPicker({ mode: 'speed', slotIdx: ${slotIdx} })"
              title="Nhấn để đổi Pokémon khác"
              class="w-20 h-20 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-sky-400 flex items-center justify-center shadow-inner transition group">
              ${buildSpriteImgHtml(form, "w-16 h-16", "group-hover:scale-105 transition")}
            </button>

            <div class="flex items-center justify-center gap-1.5">
              <button type="button" onclick="openPokemonPicker({ mode: 'speed', slotIdx: ${slotIdx} })"
                class="text-base font-extrabold text-white hover:text-sky-300 transition">
                ${escapeHtml(form.displayName)}
              </button>
              ${
                dexData.megas
                  ? `<label class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-extrabold cursor-pointer transition ${
                      card.isMega
                        ? "bg-pink-500/20 border-pink-500/50 text-pink-300"
                        : "bg-slate-900 border-slate-700 text-slate-400"
                    }">
                      <input type="checkbox" ${card.isMega ? "checked" : ""} onchange="updateSpeedSlot(${slotIdx}, 'isMega', this.checked)" class="hidden" />
                      <span>Mega</span>
                    </label>`
                  : ""
              }
            </div>

            <div class="flex items-center justify-center gap-1.5">
              ${renderTypeBadgesHtml(form.types)}
            </div>

            <div class="text-xs text-slate-400">
              Base Speed: <span class="font-mono font-extrabold text-white">${form.base.spe}</span>
            </div>
          </div>

          <div class="space-y-1.5">
            <div class="flex items-center justify-between text-xs">
              <span class="font-bold text-slate-200">Stat Points (SP) vào Speed</span>
              <span class="font-mono font-extrabold text-sky-400">${card.sp}</span>
            </div>
            <input type="range" min="0" max="32" value="${card.sp}"
              oninput="updateSpeedSlot(${slotIdx}, 'sp', this.value)"
              class="sp-slider w-full" />
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-200">Nature ảnh hưởng Speed</label>
            <div class="grid grid-cols-3 gap-1 bg-slate-950/90 p-1 rounded-xl border border-slate-800 text-xs">
              <button type="button" onclick="updateSpeedSlot(${slotIdx}, 'natureMode', 'minus')"
                class="py-1.5 rounded-lg font-bold transition ${
                  card.natureMode === "minus"
                    ? "bg-slate-800 text-sky-300 border border-sky-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }">
                Giảm
              </button>
              <button type="button" onclick="updateSpeedSlot(${slotIdx}, 'natureMode', 'neutral')"
                class="py-1.5 rounded-lg font-bold transition ${
                  card.natureMode === "neutral"
                    ? "bg-slate-800 text-white border border-slate-600 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }">
                Trung tính
              </button>
              <button type="button" onclick="updateSpeedSlot(${slotIdx}, 'natureMode', 'plus')"
                class="py-1.5 rounded-lg font-bold transition ${
                  card.natureMode === "plus"
                    ? "bg-slate-800 text-rose-300 border border-rose-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }">
                Tăng
              </button>
            </div>
          </div>

          <div class="space-y-1.5">
            <div class="flex items-center justify-between text-xs">
              <span class="font-bold text-slate-200">Thang bậc Speed trong trận (tăng / giảm)</span>
              <span class="font-mono font-extrabold text-sky-400">${card.stage > 0 ? "+" + card.stage : card.stage}</span>
            </div>
            <div class="grid gap-0.5" style="grid-template-columns: repeat(13, minmax(0, 1fr));">
              ${stageButtonsHtml}
            </div>
            <p class="text-[10px] leading-relaxed text-slate-400">
              0 = không đổi · số dương = được tăng tốc · số âm = bị giảm tốc (khi dính kỹ năng làm giảm Speed)
            </p>
          </div>

          <div class="space-y-2 pt-1">
            <div class="text-xs font-bold text-slate-200">Chọn thêm yếu tố ảnh hưởng tốc độ khác</div>

            <label class="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
              <input type="checkbox" ${card.weatherAbilityDouble ? "checked" : ""}
                onchange="updateSpeedSlot(${slotIdx}, 'weatherAbilityDouble', this.checked)"
                class="w-4 h-4 rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-0" />
              <span>Nhân đôi do thời tiết/ability (vd Swift Swim + Mưa)</span>
            </label>

            <label class="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
              <input type="checkbox" ${card.choiceScarf ? "checked" : ""}
                onchange="updateSpeedSlot(${slotIdx}, 'choiceScarf', this.checked)"
                class="w-4 h-4 rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-0" />
              <span>Choice Scarf</span>
            </label>

            <label class="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
              <input type="checkbox" ${card.tailwind ? "checked" : ""}
                onchange="updateSpeedSlot(${slotIdx}, 'tailwind', this.checked)"
                class="w-4 h-4 rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-0" />
              <span>Tailwind (đồng đội hỗ trợ)</span>
            </label>
          </div>

          <div class="rounded-xl p-3 text-center border ${
            isWinner
              ? "bg-emerald-500/10 border-emerald-500/40"
              : "bg-slate-950/90 border-slate-800"
          }">
            <div class="text-[11px] font-semibold text-slate-400">Tốc độ cuối cùng</div>
            <div class="font-mono text-3xl font-extrabold mt-0.5 ${
              isWinner ? "text-emerald-400" : "text-white"
            }">
              ${finalSpe}
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

// ============================================================================
// GEMINI VISION AI TEAM IMAGE SCANNER
// ============================================================================

function saveGeminiKey(val) {
  localStorage.setItem(STORAGE_KEY_GEMINI_KEY, val.trim());
  showToast("Đã lưu Gemini API Key trên trình duyệt!", "success");
}

function handleAiImageSelect(event) {
  const file = event.target.files?.[0];
  if (file) processAiImageFile(file);
}

function processAiImageFile(file) {
  aiSelectedImageMime = file.type || "image/png";
  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    aiSelectedImageBase64 = dataUrl.split(",")[1];
    const preview = document.getElementById("ai-preview-img");
    const placeholder = document.getElementById("ai-upload-placeholder");
    preview.src = dataUrl;
    preview.classList.remove("hidden");
    placeholder.classList.add("hidden");
    document.getElementById("btn-run-ai-scan").disabled = false;
  };
  reader.readAsDataURL(file);
}

async function analyzeTeamImageWithAI() {
  const apiKey = document.getElementById("ai-api-key").value.trim();
  if (!apiKey) {
    showToast("Vui lòng nhập Gemini API Key trước khi quét!", "warn");
    return;
  }
  if (!aiSelectedImageBase64) {
    showToast("Vui lòng chọn hoặc dán ảnh đội hình!", "warn");
    return;
  }

  const btn = document.getElementById("btn-run-ai-scan");
  const btnText = document.getElementById("ai-scan-btn-text");
  btn.disabled = true;
  btnText.textContent = "⏳ Đang phân tích ảnh bằng Gemini AI...";

  const promptText = `You are a competitive Pokémon VGC Regulation M-C team parser.
Extract all Pokémon visible in this team image and output ONLY clean Pokémon Showdown paste format.
Rules:
- Format each Pokémon cleanly:
Species @ Item
Ability: <Ability>
Level: 50
<Nature> Nature
- Move 1
- Move 2
- Move 3
- Move 4
- If Nature or EVs are not visible in the screenshot, infer the standard competitive VGC Regulation M-C Nature (e.g., Timid, Jolly, Adamant, Modest, Careful).
- Do NOT include markdown code fences or extra commentary, only the Showdown paste text.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: promptText },
                {
                  inline_data: {
                    mime_type: aiSelectedImageMime,
                    data: aiSelectedImageBase64
                  }
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || "Lỗi kết nối Gemini API");
    }

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleaned = rawText.replace(/```[a-z]*\n?/gi, "").replace(/```/g, "").trim();
    document.getElementById("ai-output-textarea").value = cleaned;
    showToast("Quét ảnh đội hình thành công!", "success");
  } catch (err) {
    showToast("Lỗi AI: " + err.message, "error");
  } finally {
    btn.disabled = false;
    btnText.textContent = "✨ Quét ảnh nhận diện đội hình";
  }
}

function loadAiOutputToBuilder() {
  const text = document.getElementById("ai-output-textarea").value.trim();
  if (!text) {
    showToast("Chưa có dữ liệu Showdown để nạp!", "warn");
    return;
  }
  const slots = parseShowdownPasteToSlots(text);
  if (!slots) {
    showToast("Không thể đọc định dạng đội hình từ kết quả AI.", "error");
    return;
  }
  const team = getCurrentTeam();
  team.slots = slots;
  activeSlotIndex = 0;
  saveTeamsToStorage();
  renderTeamRibbon();
  renderActiveSlotEditor();
  switchMainTab("builder");
  showToast("Đã nạp đội hình từ AI vào Team Builder!", "success");
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
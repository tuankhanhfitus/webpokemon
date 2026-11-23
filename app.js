// ============================================================================
// VGC TACTICS STUDIO — CORE ENGINE (CHAMPIONS REGULATION M-C)
// ============================================================================

const STORAGE_KEY_TEAMS = "vgc_mc_teams_v2";
const STORAGE_KEY_ACTIVE_TEAM = "vgc_mc_active_team_v2";
const STORAGE_KEY_GEMINI_KEY = "vgc_mc_gemini_key";
const GEMINI_AI_MODEL = "gemini-3.8-flash";
const GEMINI_FALLBACK_MODELS = [GEMINI_AI_MODEL, "gemini-2.5-flash"];
const STORAGE_KEY_WORKSPACE = "vgc_studio_workspace_v1";
let activeMainTab = "builder";
let hasRestoredCalcState = false;
let hasRestoredSpeedState = false;
let isRestoringWorkspace = false;
let workspaceSaveTimer = null;

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
    item: "Sitrus Berry",
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
// UI COLOR THEME + IMAGE-ENABLED ITEM SELECTORS
// ============================================================================
const THEME_STORAGE_KEY = "vgc_studio_theme";
let activeItemPicker = null;

function applyAppTheme(theme) {
  const mode = theme === "light" ? "light" : "dark";
  document.documentElement.classList.toggle("light", mode === "light");
  document.documentElement.classList.toggle("dark", mode === "dark");
  const button = document.getElementById("theme-toggle");
  if (button) {
    button.setAttribute("aria-label", mode === "light" ? "Chuyển sang giao diện tối" : "Chuyển sang giao diện sáng");
    button.setAttribute("aria-pressed", String(mode === "light"));
  }
  const label = document.getElementById("theme-toggle-label");
  if (label) label.textContent = mode === "light" ? "Tối" : "Sáng";
  const meta = document.getElementById("app-theme-color");
  if (meta) meta.content = mode === "light" ? "#f1f5fc" : "#060911";
}

function toggleAppTheme() {
  const next = document.documentElement.classList.contains("light") ? "dark" : "light";
  applyAppTheme(next);
  try { localStorage.setItem(THEME_STORAGE_KEY, next); } catch (_) { /* optional */ }
}

function getItemIconUrl(item) {
  if (!item || item === "None") return "assets/no-item.svg";
  // Champions Mega Stone artwork (48×48) collected from Bulbapedia.
  // https://github.com/KevinToodlepoot/pokemon-champions-sprites
  // Use the exact lower-case, hyphen-separated item name, including Z/X/Y variants.
  if (REG_MC_MEGA_STONES.includes(item)) {
    const slug = item.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return `https://raw.githubusercontent.com/KevinToodlepoot/pokemon-champions-sprites/main/items/${slug}.png`;
  }
  const irregular = {
    "Black Glasses": "blackglasses", "Bright Powder": "brightpowder",
    "King's Rock": "kings-rock", "Never-Melt Ice": "never-melt-ice",
    "Silver Powder": "silverpowder", "Twisted Spoon": "twistedspoon",
    "Miracle Seed": "miracle-seed", "Spell Tag": "spell-tag"
  };
  const slug = irregular[item] || item.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `https://play.pokemonshowdown.com/sprites/itemicons/${slug}.png`;
}

function itemIconFallback(item) {
  return REG_MC_MEGA_STONES.includes(item) ? "assets/mega-stone.svg" :
    item === "None" ? "assets/no-item.svg" : "assets/item-placeholder.svg";
}

function makeItemIcon(item, sizeClass = "") {
  const img = document.createElement("img");
  img.className = "item-sprite " + sizeClass;
  img.alt = "";
  img.loading = "lazy";
  img.src = getItemIconUrl(item);
  img.onerror = () => { img.onerror = null; img.src = itemIconFallback(item); };
  return img;
}

function syncItemPicker(selectOrId) {
  const select = typeof selectOrId === "string" ? document.getElementById(selectOrId) : selectOrId;
  if (!select) return;
  const host = select.closest(".item-picker-host");
  if (!host) return;
  const title = host.querySelector(".item-picker-label");
  const iconBox = host.querySelector(".item-picker-icon");
  const value = select.value || "None";
  if (title) title.textContent = value === "None" ? "Không có vật phẩm" : value;
  if (iconBox) iconBox.replaceChildren(makeItemIcon(value));
  host.querySelector(".item-picker-trigger")?.setAttribute("title", value);
}

function setupItemImagePickers() {
  ["sel-item", "calc-p1-item", "calc-p2-item"].forEach((id) => {
    const select = document.getElementById(id);
    if (!select || select.closest(".item-picker-host")) return;
    const host = document.createElement("div");
    host.className = "item-picker-host" + (id === "sel-item" ? " item-picker-builder" : " item-picker-calc");
    select.parentNode.insertBefore(host, select);
    host.appendChild(select);
    select.classList.add("item-picker-native");
    select.tabIndex = -1;
    select.setAttribute("aria-hidden", "true");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "item-picker-trigger";
    btn.setAttribute("aria-haspopup", "dialog");
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-label", id === "sel-item" ? "Chọn vật phẩm Pokémon" : "Chọn vật phẩm tính sát thương");
    btn.innerHTML = '<span class="item-picker-icon"></span><span class="item-picker-label"></span><span class="item-picker-chevron" aria-hidden="true">▾</span>';
    host.appendChild(btn);
    btn.addEventListener("click", () => openItemImagePicker(select));
    syncItemPicker(select);
  });
}

function closeItemImagePicker(restoreFocus = false) {
  if (!activeItemPicker) return;
  const { dialog, trigger } = activeItemPicker;
  dialog.remove();
  if (trigger) trigger.setAttribute("aria-expanded", "false");
  activeItemPicker = null;
  if (restoreFocus && trigger) trigger.focus();
}

function positionItemImagePicker() {
  if (!activeItemPicker) return;
  const { trigger, dialog } = activeItemPicker;
  const rect = trigger.getBoundingClientRect();
  const width = Math.min(390, window.innerWidth - 24);
  const height = Math.min(410, window.innerHeight - 28);
  const left = Math.min(Math.max(12, rect.left), window.innerWidth - width - 12);
  const below = window.innerHeight - rect.bottom;
  const above = rect.top;
  const showAbove = below < Math.min(270, height) && above > below;
  dialog.style.width = width + "px";
  dialog.style.maxHeight = height + "px";
  dialog.style.left = left + "px";
  dialog.style.top = showAbove ? Math.max(12, rect.top - height - 8) + "px" : Math.min(window.innerHeight - height - 12, rect.bottom + 8) + "px";
}

function openItemImagePicker(select) {
  if (activeItemPicker && activeItemPicker.select === select) {
    closeItemImagePicker();
    return;
  }
  closeItemImagePicker();
  const trigger = select.closest(".item-picker-host").querySelector(".item-picker-trigger");
  const dialog = document.createElement("div");
  dialog.className = "item-picker-dialog";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-label", "Chọn vật phẩm");
  dialog.innerHTML = '<div class="item-picker-dialog-header"><strong>Vật phẩm · Regulation M-C</strong><button type="button" class="item-picker-close" aria-label="Đóng danh sách">✕</button></div><input type="search" class="item-picker-search" placeholder="Tìm vật phẩm hoặc Mega Stone..." aria-label="Tìm vật phẩm" autocomplete="off"/><div class="item-picker-options" role="listbox" aria-label="Danh sách vật phẩm"></div>';
  document.body.appendChild(dialog);
  activeItemPicker = { select, trigger, dialog };
  trigger.setAttribute("aria-expanded", "true");
  positionItemImagePicker();
  const search = dialog.querySelector(".item-picker-search");
  const list = dialog.querySelector(".item-picker-options");
  function render(query = "") {
    list.replaceChildren();
    const q = query.trim().toLocaleLowerCase("vi");
    const groups = [
      ["Không trang bị", ["None"]],
      ["Vật phẩm", REG_MC_HELD_ITEMS],
      ["Mega Stone", REG_MC_MEGA_STONES]
    ];
    let count = 0;
    groups.forEach(([label, items]) => {
      const filtered = items.filter((item) => (item === "None" ? "none không có vật phẩm" : item.toLocaleLowerCase("vi")).includes(q));
      if (!filtered.length) return;
      const header = document.createElement("div");
      header.className = "item-picker-group-label";
      header.textContent = label + " (" + filtered.length + ")";
      list.appendChild(header);
      filtered.forEach((item) => {
        const opt = document.createElement("button");
        opt.type = "button";
        opt.className = "item-picker-option" + (item === select.value ? " is-selected" : "");
        opt.setAttribute("role", "option");
        opt.setAttribute("aria-selected", String(item === select.value));
        opt.appendChild(makeItemIcon(item));
        const name = document.createElement("span");
        name.textContent = item === "None" ? "Không có vật phẩm" : item;
        opt.appendChild(name);
        if (item === select.value) {
          const check = document.createElement("span");
          check.textContent = "✓";
          check.className = "item-picker-check";
          opt.appendChild(check);
        }
        opt.addEventListener("click", () => {
          select.value = item;
          closeItemImagePicker();
          select.dispatchEvent(new Event("change", { bubbles: true }));
          syncItemPicker(select);
        });
        list.appendChild(opt);
        count++;
      });
    });
    if (!count) {
      const msg = document.createElement("div");
      msg.className = "item-picker-empty";
      msg.textContent = "Không tìm thấy vật phẩm phù hợp.";
      list.appendChild(msg);
    }
  }
  render();
  search.addEventListener("input", () => render(search.value));
  search.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { e.preventDefault(); closeItemImagePicker(true); }
    if (e.key === "Enter" || e.key === "ArrowDown") {
      const first = list.querySelector(".item-picker-option");
      if (first) { e.preventDefault(); if (e.key === "Enter") first.click(); else first.focus(); }
    }
  });
  list.addEventListener("keydown", (e) => {
    const opts = [...list.querySelectorAll(".item-picker-option")];
    const idx = opts.indexOf(document.activeElement);
    if (e.key === "Escape") { e.preventDefault(); closeItemImagePicker(true); }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      (opts[(idx + (e.key === "ArrowDown" ? 1 : -1) + opts.length) % opts.length] || opts[0])?.focus();
    }
  });
  dialog.querySelector(".item-picker-close").addEventListener("click", () => closeItemImagePicker(true));
  search.focus();
}

document.addEventListener("pointerdown", (e) => {
  if (activeItemPicker && !activeItemPicker.dialog.contains(e.target) && !activeItemPicker.trigger.contains(e.target)) closeItemImagePicker();
});
window.addEventListener("resize", positionItemImagePicker);
window.addEventListener("scroll", (e) => {
  if (activeItemPicker && !activeItemPicker.dialog.contains(e.target)) closeItemImagePicker();
}, true);

// ============================================================================
// WORKSPACE SESSION PERSISTENCE (F5 / PAGE RELOAD)
// ============================================================================
// Team data and UI theme already have separate storage keys. Save ONLY the
// currently selected UI workspace here (never API keys, scanned images, etc.).
function getSavedWorkspace() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY_WORKSPACE) || "null");
    return data && data.version === 1 && typeof data === "object" ? data : null;
  } catch (_) { return null; }
}

function clampWorkspaceNumber(value, min, max, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : fallback;
}

function sanitizeCalcSide(saved, fallback) {
  if (!saved || typeof saved !== "object" || !POKEDEX_MC[saved.species]) return null;
  const dex = POKEDEX_MC[saved.species];
  const isMega = Boolean(saved.isMega && dex.megas);
  const stone = isMega && dex.megas?.[saved.item] ? saved.item : dex.defaultMegaStone;
  let item = typeof saved.item === "string" && ITEMS_MC.includes(saved.item) ? saved.item : "None";
  if (isMega) item = stone || "None";
  const suggested = getCalcSuggestedSet(saved.species, isMega, item);
  const out = {
    ...fallback, species: saved.species, isMega: Boolean(isMega && stone), item,
    ability: typeof saved.ability === "string" ? saved.ability : suggested.ability,
    nature: NATURES[saved.nature] ? saved.nature : suggested.nature,
    status: ["Healthy", "Burned", "Paralyzed", "Poisoned", "Badly Poisoned", "Asleep", "Frozen"].includes(saved.status)
      ? saved.status : "Healthy",
    sp: {}, stages: {}, moves: [],
    selectedMoveIdx: clampWorkspaceNumber(saved.selectedMoveIdx, 0, 3),
    presetSource: saved.presetSource === "smogon" ? "smogon" : "suggested",
    presetEdited: Boolean(saved.presetEdited)
  };
  for (const key of STAT_KEYS) {
    out.sp[key] = clampWorkspaceNumber(saved.sp?.[key], 0, 32);
    if (key !== "hp") out.stages[key] = clampWorkspaceNumber(saved.stages?.[key], -6, 6);
  }
  // An invalid or out-of-budget imported state is reset to a legal sample set.
  if (Object.values(out.sp).reduce((a, b) => a + b, 0) > 66) out.sp = { ...suggested.sp };
  for (let i = 0; i < 4; ++i) {
    const raw = saved.moves?.[i];
    const name = raw && MOVES_DB[raw.name] ? raw.name : suggested.moves[i];
    out.moves.push({ name: MOVES_DB[name] ? name : "Protect", crit: Boolean(raw?.crit) });
  }
  return out;
}

function restoreWorkspaceState() {
  const saved = getSavedWorkspace();
  if (!saved) return null;
  isRestoringWorkspace = true;
  activeSlotIndex = clampWorkspaceNumber(saved.activeSlotIndex, 0, 5);
  activeMainTab = ["builder", "calc", "speed", "scanner"].includes(saved.tab) ? saved.tab : "builder";
  if (saved.calc && typeof saved.calc === "object") {
    const p1 = sanitizeCalcSide(saved.calc.p1, calcState.p1);
    const p2 = sanitizeCalcSide(saved.calc.p2, calcState.p2);
    if (p1 && p2) {
      calcState.p1 = p1;
      calcState.p2 = p2;
      calcState.activeSide = ["p1", "p2"].includes(saved.calc.activeSide) ? saved.calc.activeSide : "p1";
      const f = saved.calc.field || {};
      calcState.field = {
        isDoubles: f.isDoubles !== false,
        weather: ["None", "Sun", "Rain", "Sand", "Snow"].includes(f.weather) ? f.weather : "None",
        terrain: ["None", "Electric", "Grassy", "Psychic", "Misty"].includes(f.terrain) ? f.terrain : "None"
      };
      hasRestoredCalcState = true;
    }
  }
  if (Array.isArray(saved.speedSlots) && saved.speedSlots.length === 3) {
    speedSlots = saved.speedSlots.map((card) => {
      if (!card || !POKEDEX_MC[card.species]) return null;
      const cleaned = createSpeedCardObj(card.species, card);
      cleaned.sp = clampWorkspaceNumber(card.sp, 0, 32);
      cleaned.stage = clampWorkspaceNumber(card.stage, -6, 6);
      cleaned.natureMode = ["minus", "neutral", "plus"].includes(card.natureMode) ? card.natureMode : "neutral";
      cleaned.megaStone = POKEDEX_MC[card.species].megas?.[card.megaStone] ? card.megaStone : POKEDEX_MC[card.species].defaultMegaStone || null;
      return cleaned;
    });
    hasRestoredSpeedState = true;
  }
  return saved;
}

function getWorkspaceState() {
  const flags = {};
  document.querySelectorAll('#view-calc input[type="checkbox"][id^="side-"]').forEach(el => {
    flags[el.id] = el.checked;
  });
  return {
    version: 1,
    tab: activeMainTab,
    activeSlotIndex,
    language: currentLang,
    scrollY: Math.max(0, Math.round(window.scrollY || 0)),
    calc: calcState,
    sideFlags: flags,
    speedSlots,
    speedTrickRoom: Boolean(document.getElementById("speed-trick-room")?.checked)
  };
}

function saveWorkspaceNow() {
  if (isRestoringWorkspace) return;
  clearTimeout(workspaceSaveTimer);
  workspaceSaveTimer = null;
  try { localStorage.setItem(STORAGE_KEY_WORKSPACE, JSON.stringify(getWorkspaceState())); }
  catch (_) { /* private browsing or disabled storage: the app remains usable */ }
}

function scheduleWorkspaceSave() {
  if (isRestoringWorkspace) return;
  clearTimeout(workspaceSaveTimer);
  workspaceSaveTimer = setTimeout(saveWorkspaceNow, 140);
}

function finishWorkspaceRestore(saved) {
  if (saved) {
    // Field buttons also need active styling when restored, not only data values.
    setCalcFormat(calcState.field.isDoubles);
    setFieldOption("weather", calcState.field.weather);
    setFieldOption("terrain", calcState.field.terrain);
    if (saved.sideFlags && typeof saved.sideFlags === "object") {
      Object.entries(saved.sideFlags).forEach(([id, checked]) => {
        if (!id.startsWith("side-")) return;
        const el = document.getElementById(id);
        if (el && el.type === "checkbox") el.checked = Boolean(checked);
      });
    }
    const trick = document.getElementById("speed-trick-room");
    if (trick) trick.checked = Boolean(saved.speedTrickRoom);
    if (saved.language === "en") setAppLanguage("en");
  }
  switchMainTab(activeMainTab);
  runDamageCalculation();
  renderSpeedComparisonCards();
  isRestoringWorkspace = false;

  // Native browser restoration happens before some hidden tabs become visible;
  // restore after the correct tab's layout has been rendered.
  if (saved && Number.isFinite(Number(saved.scrollY))) {
    const y = Math.max(0, Number(saved.scrollY));
    try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (_) {}
    requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, y)));
    setTimeout(() => window.scrollTo(0, y), 180);
  }
}

function setupWorkspaceAutosave() {
  // Delegation survives repeated render of controls and drag sliders.
  document.addEventListener("click", scheduleWorkspaceSave);
  document.addEventListener("change", scheduleWorkspaceSave);
  document.addEventListener("input", (event) => {
    if (event.target.matches('input[type="range"],input[type="number"],select')) scheduleWorkspaceSave();
  });
  window.addEventListener("scroll", scheduleWorkspaceSave, { passive: true });
  window.addEventListener("pagehide", saveWorkspaceNow);
  document.addEventListener("visibilitychange", () => { if (document.hidden) saveWorkspaceNow(); });
}

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
  applyAppTheme(document.documentElement.classList.contains("light") ? "light" : "dark");
  // Notify if the external dex is unreachable; never show fake base stats.
  const rosterReport = globalThis.CHAMPIONS_MC_ROSTER_REPORT;
  if (rosterReport && (rosterReport.missingSpecies.length || rosterReport.missingMegaStones.length)) {
    console.warn("Pokédex M-C loaded partially:", rosterReport);
    setTimeout(() => showToast(`Pokédex: ${rosterReport.selectableFormsLoaded}/${rosterReport.selectableFormsExpected} dạng có dữ liệu. Kiểm tra kết nối Showdown.`, "warn"), 1200);
  }
  loadTeamsFromStorage();
  const restoredWorkspace = restoreWorkspaceState();
  populateStaticDropdowns();
  setupItemImagePickers();
  renderTeamSelector();
  renderTeamRibbon();
  renderActiveSlotEditor();

  // Initialize Damage Calc UI
  initCalcWorkspace();

  // Initialize 3-Slot Speed Workspace
  initSpeedWorkspace();
  finishWorkspaceRestore(restoredWorkspace);
  setupWorkspaceAutosave();

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
      closeItemImagePicker();
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
  // Mega Z sprites are hosted in Showdown's gen5 folder, not dex.
  const folder = spriteSlug.endsWith("-megaz") ? "gen5" : "dex";
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
  if (countAllEl) countAllEl.textContent = Object.keys(POKEDEX_MC).filter(n => n !== 'Aegislash-Blade').length;

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
      if (species === 'Aegislash-Blade') return; // in-battle transformation, not a selectable team species
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
    // Set the full species/form profile atomically so the old set cannot leak.
    applyPopularCalcSet(target.side || "p1", species, Boolean(isMega), megaStone);
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
  if (!["builder", "calc", "speed", "scanner"].includes(tabName)) return;
  activeMainTab = tabName;
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
    btnClearSlot: "Reset Slot",
    lblStatsTitle: "Stats & Stat Points (SP)",
    lblStatsSub: "Max 32 SP/stat • Fixed 31 IVs (Lv.50)",
    lblNature: "Nature"
  }
};

function setAppLanguage(lang) {
  currentLang = lang === "en" ? "en" : "vi";
  const dict = I18N_DICT[currentLang];
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) el.textContent = dict[key];
  });
}

function toggleLanguage() {
  setAppLanguage(currentLang === "vi" ? "en" : "vi");
  scheduleWorkspaceSave();
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
    gender: "M",
    item: "Sitrus Berry",
    ability: "Intimidate",
    nature: "Careful",
    isMega: false,
    sp: { hp: 32, atk: 0, def: 14, spa: 0, spd: 20, spe: 0 },
    moves: ["Fake Out", "Flare Blitz", "Knock Off", "Parting Shot"]
  };
}

const REG_MC_ITEM_ALIASES = Object.freeze({
  Chimechonite: "Chimechite",
  Excadrillite: "Excadrite",
  Golisopodite: "Golisopite"
});

function migrateSavedRegMcItems(teamList) {
  let changed = 0;
  for (const team of teamList) {
    for (const mon of team.slots || []) {
      if (!mon) continue;
      // Old builds could have items from Scarlet/Violet not obtainable in Champions M-C.
      const original = mon.item || "None";
      const corrected = REG_MC_ITEM_ALIASES[original] || original;
      const next = ITEMS_MC.includes(corrected) ? corrected : "None";
      if (mon.item !== next) {
        mon.item = next;
        changed++;
      }
      // Preserve the intended Mega form whenever its legacy stone was renamed.
      const dex = POKEDEX_MC[mon.species];
      if (mon.isMega && dex?.megas && !dex.megas[mon.item]) {
        mon.item = dex.defaultMegaStone;
        changed++;
      }
    }
  }
  return changed;
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
        const updatedItems = migrateSavedRegMcItems(teams);
        if (updatedItems) {
          saveTeamsToStorage();
          showToast(`Đã cập nhật ${updatedItems} vật phẩm sang danh sách M-C. Hãy kiểm tra lại đội hình.`, "warn");
        }
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
  const toOptions = (items) => items.map(it => `<option value="${it}">${it}</option>`).join("");
  const itemsHtml = `<option value="None">— Không có vật phẩm —</option>` +
    `<optgroup label="Vật phẩm M-C (${REG_MC_HELD_ITEMS.length})">${toOptions(REG_MC_HELD_ITEMS)}</optgroup>` +
    `<optgroup label="Mega Stone M-C (${REG_MC_MEGA_STONES.length})">${toOptions(REG_MC_MEGA_STONES)}</optgroup>`;
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

  document.getElementById("input-gender").value = mon.gender || "";
  document.getElementById("sel-item").value = mon.item || "None";
  syncItemPicker("sel-item");
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
    btnMega.className = `h-11 w-full justify-center px-2 rounded-xl border text-xs font-extrabold transition flex items-center gap-1 ${
      form.isMegaActive ? "mega-btn-active" : "mega-btn-ready"
    }`;
  } else {
    btnMega.disabled = true;
    btnMega.className = "h-11 w-full justify-center px-2 rounded-xl border text-xs font-extrabold transition flex items-center gap-1 mega-btn-disabled";
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

// ============================================================================
// SHOWDOWN EXPORT & IMPORT (OTS KEEPS NATURE, HIDES EVs/SP)
// ============================================================================

function formatTeamToShowdown(team, mode = "ranked") {
  return team.slots
    .map((mon) => {
      const lines = [];
      const genderStr = mon.gender ? ` (${mon.gender})` : "";
      const nameStr = `${mon.species}${genderStr}`;
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

// Normalize OCR/AI output to the base species represented in Team Builder.
// Battle forms ("Mega Floette") are not separate species in the team sheet.
function resolveImportedSpecies(rawName, heldItem, knownSpecies) {
  const raw = String(rawName || "").trim();
  const compact = raw.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]/g, "");

  // Only the Eternal Flower form can Mega Evolve using Floettite.
  if (["floette", "floetteeternal", "floetteeternalflower", "floettemega", "megafloette", "megaeternalfloette", "floetteeternalmega"].includes(compact)) {
    return { species: "Floette-Eternal", forcedMega: compact.includes("mega") || heldItem === "Floettite" };
  }

  const exact = knownSpecies.find(s => s.toLowerCase() === raw.toLowerCase());
  if (exact) return { species: exact, forcedMega: false };

  // Some image scanners write "Mega Raichu" or "Garchomp-Mega-Z" instead
  // of the base species. Determine the actual Mega form from the stone.
  const megaRemoved = raw.replace(/^mega[ -]+/i, "")
    .replace(/[- ]mega(?:[- ]?[xy]|[- ]?z)?$/i, "")
    .replace(/[- ]mega[- ]?[xy]$/i, "");
  const canonical = knownSpecies.find(s => s.toLowerCase() === megaRemoved.toLowerCase());
  if (canonical) return { species: canonical, forcedMega: megaRemoved !== raw };

  const prefix = knownSpecies.find(s => raw.toLowerCase().startsWith(s.toLowerCase() + "-mega"));
  if (prefix) return { species: prefix, forcedMega: true };

  // Never silently replace an unrecognized Pokémon with Garchomp.
  return null;
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
      const normalizedItem = REG_MC_ITEM_ALIASES[rawItem] || rawItem;
      const matchedItem = ITEMS_MC.find((i) => i.toLowerCase() === normalizedItem.toLowerCase());
      slot.item = matchedItem || "None";
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
      const baseName = parenMatch[1].trim();
      const annotation = parenMatch[2].trim();
      // "Floette (Eternal Flower)" is a form label, not a nickname.
      rawSpecies = /^floette$/i.test(baseName) && /^eternal(?: flower)?$/i.test(annotation)
        ? "Floette-Eternal" : annotation;
    }

    const recognized = resolveImportedSpecies(rawSpecies, slot.item, knownSpecies);
    if (!recognized) return null;
    slot.species = recognized.species;
    const dexData = POKEDEX_MC[slot.species];

    if (dexData.megas && (dexData.megas[slot.item] || recognized.forcedMega)) {
      slot.isMega = true;
      if (!dexData.megas[slot.item]) slot.item = dexData.defaultMegaStone;
    } else {
      slot.isMega = false;
    }

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith("Ability:")) {
        const ab = line.replace("Ability:", "").trim();
        slot.ability = (slot.species === "Floette-Eternal" && ab === "Fairy Aura")
          ? "Flower Veil"
          : (dexData.abilities.includes(ab) ? ab : dexData.abilities[0]);
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

  if (parsedSlots.some(slot => slot === null)) return null;
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


// Popular-set loader: the calculator uses Champions SP (0–32 / 66 total), not classic EVs.
function getCalcSuggestedSet(species, isMega, megaStone) {
  const dex = POKEDEX_MC[species] || POKEDEX_MC.Garchomp;
  const stone = isMega && dex.megas
    ? (megaStone && dex.megas[megaStone] ? megaStone : dex.defaultMegaStone)
    : null;
  const form = stone ? dex.megas[stone] : null;
  const key = stone ? `${species}::${stone}` : species;
  const popular = CALC_POPULAR_SETS_MC[key];
  const curated = typeof CALC_RECOMMENDED_SETS_MC !== "undefined" ? CALC_RECOMMENDED_SETS_MC[key] : null;
  if (curated && !popular) {
    return {
      ...curated, sp: { ...curated.sp }, moves: [...curated.moves],
      isMega: Boolean(stone), source: "suggested", formKey: key
    };
  }
  if (popular) {
    return {
      ...popular, sp: { ...popular.sp }, moves: [...popular.moves],
      isMega: Boolean(stone), source: 'smogon', formKey: key
    };
  }

  // Clear, non-statistical fallback for species/forms without published curated sets.
  // Apply 66 SP defensibly; do not present these as verified top usage builds.
  const stats = form ? form.base : dex.base;
  const defaultMoves = [...(dex.defaultMoves || ['Protect'])].slice(0, 4);
  const special = stats.spa > stats.atk;
  const supportCount = defaultMoves.filter(m => MOVES_DB[m]?.cat === 'Status').length;
  const defensive = supportCount >= 2 && Math.max(stats.def, stats.spd) >= 100;
  const sp = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
  let nature;
  if (defensive) {
    nature = stats.def >= stats.spd ? 'Bold' : 'Calm';
    sp.hp = 32;
    sp[stats.def >= stats.spd ? 'def' : 'spd'] = 32;
    sp[stats.def >= stats.spd ? 'spd' : 'def'] = 2;
  } else {
    const attackKey = special ? 'spa' : 'atk';
    const speedy = stats.spe >= 100;
    nature = special ? (speedy ? 'Timid' : 'Modest') : (speedy ? 'Jolly' : 'Adamant');
    sp.hp = 2;
    sp[attackKey] = 32;
    sp.spe = 32;
  }
  return {
    item: stone || (defensive ? 'Sitrus Berry' : 'Life Orb'),
    ability: form ? form.ability : dex.abilities[0],
    nature, sp,
    moves: [...defaultMoves, ...Array(4).fill('Protect')].slice(0, 4),
    isMega: Boolean(stone), source: 'suggested', formKey: key
  };
}

function applyPopularCalcSet(side, species, isMega, megaStone) {
  const st = calcState[side];
  if (!st) return;
  const selectedSpecies = species || st.species;
  const selectedMega = isMega === undefined ? st.isMega : Boolean(isMega);
  const dex = POKEDEX_MC[selectedSpecies];
  if (!dex) return;
  const selectedStone = selectedMega
    ? ((megaStone && dex.megas?.[megaStone]) ? megaStone :
       (dex.megas?.[st.item] ? st.item : dex.defaultMegaStone))
    : null;
  const preset = getCalcSuggestedSet(selectedSpecies, Boolean(selectedStone), selectedStone);
  st.species = selectedSpecies;
  st.isMega = preset.isMega;
  st.item = preset.item;
  st.ability = preset.ability;
  st.nature = preset.nature;
  st.sp = { ...preset.sp };
  st.moves = preset.moves.map(name => ({ name, crit: false }));
  st.selectedMoveIdx = st.moves.findIndex(m => MOVES_DB[m.name]?.cat !== 'Status');
  if (st.selectedMoveIdx < 0) st.selectedMoveIdx = 0;
  st.stages = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
  st.status = 'Healthy';
  st.presetSource = preset.source;
  st.presetEdited = false;
  activeMoveDropdownId = null;
  renderCalcSideUI(side);
  runDamageCalculation();
}

function markCalcPresetEdited(side) {
  if (calcState[side]) calcState[side].presetEdited = true;
}

function initCalcWorkspace() {
  if (hasRestoredCalcState) {
    renderCalcSideUI("p1");
    renderCalcSideUI("p2");
    runDamageCalculation();
    return;
  }
  applyPopularCalcSet("p1", calcState.p1.species, calcState.p1.isMega, calcState.p1.item);
  applyPopularCalcSet("p2", calcState.p2.species, calcState.p2.isMega, calcState.p2.item);
}

function updateCalcSide(side, key, value) {
  const st = calcState[side];
  if (!st) return;

  if (key === 'species') {
    // Choosing a species from the base list means base form, not automatic Mega.
    applyPopularCalcSet(side, value, false, null);
    return;
  }
  if (key === 'isMega') {
    applyPopularCalcSet(side, st.species, Boolean(value),
      value ? (POKEDEX_MC[st.species].megas?.[st.item] ? st.item : null) : null);
    return;
  }
  if (key === 'item') {
    const dex = POKEDEX_MC[st.species];
    const stone = Boolean(dex?.megas?.[value]);
    if (stone && (value !== st.item || !st.isMega)) {
      applyPopularCalcSet(side, st.species, true, value);
      return;
    }
    if (!stone && st.isMega) {
      // Non-Mega item switches the form back to base, but keep the chosen item.
      applyPopularCalcSet(side, st.species, false, null);
    }
    st.item = value;
  } else {
    st[key] = value;
  }

  markCalcPresetEdited(side);
  renderCalcSideUI(side);
  runDamageCalculation();
}

function updateCalcStatSP(side, statKey, rawVal) {
  const val = Math.max(0, Math.min(32, parseInt(rawVal, 10) || 0));
  calcState[side].sp[statKey] = val;
  markCalcPresetEdited(side);
  renderCalcSideUI(side);
  runDamageCalculation();
}

function updateCalcStage(side, statKey, rawStage) {
  calcState[side].stages[statKey] = Math.max(-6, Math.min(6, parseInt(rawStage, 10) || 0));
  runDamageCalculation();
}

function updateCalcMove(side, mIdx, moveName) {
  calcState[side].moves[mIdx].name = moveName;
  markCalcPresetEdited(side);
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

  const presetLabel = document.getElementById(`calc-${side}-preset-note`);
  if (presetLabel) {
    const kind = st.presetSource === 'smogon'
      ? 'Meta · Smogon 10/2026, 1760+'
      : 'Build gợi ý · chưa có thống kê';
    presetLabel.textContent = kind + (st.presetEdited ? ' · đã chỉnh tay' : '');
    presetLabel.title = st.presetSource === 'smogon'
      ? 'Item, Ability, Nature, SP và các chiêu có tần suất dùng cao. Không chắc chắn là một set của cùng một người chơi.'
      : 'Dựa trên chỉ số và các chiêu mặc định, không phải bộ phổ biến nhất được xác minh.';
  }

  const megaChk = document.getElementById(`calc-${side}-mega`);
  megaChk.checked = form.isMegaActive;
  megaChk.disabled = !dexData.megas;

  document.getElementById(`calc-${side}-types`).innerHTML = renderTypeBadgesHtml(form.types);
  document.getElementById(`calc-${side}-item`).value = st.item;
  syncItemPicker(`calc-${side}-item`);
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

// Round to nearest integer, breaking exact half ties down (Pokemon damage rounding).
function roundHalfDown(value) {
  const whole = Math.floor(value);
  return whole + (value - whole > 0.5000000001 ? 1 : 0);
}

// Chain Gen 5+ fixed-point final damage modifiers at 4096 precision.
function chainFinalModifiers(modifiers) {
  return modifiers.reduce((chained, multiplier) => {
    const next = Math.round(multiplier * 4096);
    return Math.floor((chained * next + 2048) / 4096);
  }, 4096);
}

function isGroundedForCalc(pokemon, form) {
  return !form.types.includes("Flying") && pokemon.ability !== "Levitate" && pokemon.item !== "Air Balloon";
}

function computeSingleMoveDamage(atkSideKey, defSideKey, moveObj) {
  const atk = calcState[atkSideKey];
  const def = calcState[defSideKey];
  const atkForm = getEffectiveForm(atk.species, atk.isMega, atk.item);
  const defForm = getEffectiveForm(def.species, def.isMega, def.item);
  const defMaxHp = calculateLv50Stat("hp", defForm.base.hp, def.sp.hp, def.nature);
  const moveMeta = MOVES_DB[moveObj.name] || { bp: 0, type: "Normal", cat: "Status", spread: false };

  const noDamage = (message) => ({
    rolls: Array(16).fill(0), min: 0, max: 0, minPct: 0, maxPct: 0,
    defMaxHp, koText: message
  });
  if (moveMeta.cat === "Status" || !moveMeta.bp || moveMeta.bp <= 0) {
    return noDamage("Status Move (0%)");
  }
  if (document.getElementById(`side-${defSideKey}-protect`)?.checked && moveObj.name !== "Feint") {
    return noDamage("Blocked by Protect");
  }

  const weather = calcState.field.weather;
  const terrain = calcState.field.terrain;
  let effType = moveMeta.type;
  let bp = moveMeta.bp;
  const attackerGrounded = isGroundedForCalc(atk, atkForm);
  const defenderGrounded = isGroundedForCalc(def, defForm);
  const ignoresDefAbility = ["Mold Breaker", "Teravolt", "Turboblaze"].includes(atk.ability);
  const defensiveAbility = ignoresDefAbility ? "" : def.ability;
  const isPhys = moveMeta.cat === "Physical";
  const isBodyPress = moveObj.name === "Body Press";

  const bpModifiers = [];
  if (effType === "Normal" && ["Pixilate", "Aerilate", "Refrigerate"].includes(atk.ability)) {
    effType = { Pixilate: "Fairy", Aerilate: "Flying", Refrigerate: "Ice" }[atk.ability];
    bpModifiers.push(1.2);
  }
  if (moveObj.name === "Weather Ball" && weather !== "None") {
    effType = { Sun: "Fire", Rain: "Water", Sand: "Rock", Snow: "Ice" }[weather] || "Normal";
    bp *= 2;
  }
  if (moveObj.name === "Facade" && atk.status !== "Healthy") bp *= 2;
  if (moveObj.name === "Acrobatics" && (!atk.item || atk.item === "None")) bp *= 2;
  if (moveObj.name === "Expanding Force" && terrain === "Psychic" && attackerGrounded) {
    bpModifiers.push(1.5);
  }
  if (atk.ability === "Tough Claws" && moveMeta.contact) bpModifiers.push(1.3);
  if (atk.ability === "Sharpness" && moveMeta.slicing) bpModifiers.push(1.5);
  if (atk.ability === "Water Bubble" && effType === "Water") bpModifiers.push(2);
  // Fairy Aura affects Fairy moves from both sides while the Mega form is active.
  if (effType === "Fairy" && [
    atkForm.isMegaActive ? atkForm.ability : atk.ability,
    defForm.isMegaActive ? defForm.ability : def.ability
  ].includes("Fairy Aura")) bpModifiers.push(1.33);
  if (atk.ability === "Technician" && bp <= 60) bpModifiers.push(1.5);
  if (atk.ability === "Mega Launcher" && ["Aura Sphere", "Water Pulse", "Dark Pulse", "Dragon Pulse"].includes(moveObj.name)) {
    bpModifiers.push(1.5);
  }
  if (attackerGrounded && (
    (terrain === "Electric" && effType === "Electric") ||
    (terrain === "Grassy" && effType === "Grass") ||
    (terrain === "Psychic" && effType === "Psychic")
  )) bpModifiers.push(1.3);
  if (defenderGrounded && terrain === "Grassy" && ["Earthquake", "Bulldoze", "Magnitude"].includes(moveObj.name)) {
    bpModifiers.push(0.5);
  }
  if (defenderGrounded && terrain === "Misty" && effType === "Dragon") bpModifiers.push(0.5);
  if (["Solar Beam", "Solar Blade"].includes(moveObj.name) && ["Rain", "Sand", "Snow"].includes(weather)) {
    bpModifiers.push(0.5);
  }
  // Chain BP multipliers first (fixed-point), then round the final power once.
  if (document.getElementById(`side-${atkSideKey}-hh`)?.checked) bpModifiers.push(1.5);
  if (bpModifiers.length) bp = Math.max(1, roundHalfDown(bp * chainFinalModifiers(bpModifiers) / 4096));

  // Ground/ability immunities (unless the attacker's ability suppresses them).
  if (effType === "Ground" && (def.item === "Air Balloon" || defensiveAbility === "Levitate")) {
    return noDamage("Immune (Air Balloon / Levitate)");
  }
  const immunities = {
    Fire: ["Flash Fire", "Well-Baked Body"],
    Water: ["Water Absorb", "Storm Drain", "Dry Skin"],
    Electric: ["Volt Absorb", "Lightning Rod", "Motor Drive"],
    Grass: ["Sap Sipper"],
    Ground: ["Earth Eater"]
  };
  if ((immunities[effType] || []).includes(defensiveAbility)) return noDamage("Immune (Ability)");

  let typeMult = getTypeEffectiveness(effType, defForm.types);
  if (atk.ability === "Scrappy" && ["Normal", "Fighting"].includes(effType) && defForm.types.includes("Ghost")) {
    typeMult = getTypeEffectiveness(effType, defForm.types.filter((type) => type !== "Ghost"));
  }
  if (typeMult === 0) return noDamage("Immune (0x)");

  const atkStatKey = isBodyPress ? "def" : isPhys ? "atk" : "spa";
  const defStatKey = isPhys ? "def" : "spd";
  const rawA = calculateLv50Stat(atkStatKey, atkForm.base[atkStatKey], atk.sp[atkStatKey], atk.nature);
  const rawD = calculateLv50Stat(defStatKey, defForm.base[defStatKey], def.sp[defStatKey], def.nature);
  let atkStage = atk.stages[atkStatKey] || 0;
  let defStage = def.stages[defStatKey] || 0;
  if (moveObj.crit) {
    atkStage = Math.max(0, atkStage);
    defStage = Math.min(0, defStage);
  }
  let A = Math.floor(rawA * getStageMultiplier(atkStage));
  let D = Math.floor(rawD * getStageMultiplier(defStage));

  if (isPhys && atk.item === "Choice Band") A = Math.floor(A * 1.5);
  if (!isPhys && atk.item === "Choice Specs") A = Math.floor(A * 1.5);
  if (isPhys && ["Huge Power", "Pure Power"].includes(atk.ability)) A *= 2;
  if (isPhys && atk.ability === "Hustle") A = Math.floor(A * 1.5);
  if (isPhys && atk.ability === "Guts" && atk.status !== "Healthy") A = Math.floor(A * 1.5);
  if (!isPhys && atk.ability === "Solar Power" && weather === "Sun") A = Math.floor(A * 1.5);
  if (["Fire", "Ice"].includes(effType) && defensiveAbility === "Thick Fat") A = Math.floor(A * 0.5);

  if (!isPhys && def.item === "Assault Vest") D = Math.floor(D * 1.5);
  if (def.item === "Eviolite") D = Math.floor(D * 1.5); // assumes eligible holder
  if (weather === "Sand" && defForm.types.includes("Rock") && !isPhys) D = Math.floor(D * 1.5);
  if (weather === "Snow" && defForm.types.includes("Ice") && isPhys) D = Math.floor(D * 1.5);
  if (isPhys && defensiveAbility === "Fur Coat") D *= 2;

  // Level 50 base damage; modifiers below must be applied in the correct order.
  let baseDamage = Math.floor(Math.floor(22 * bp * A / Math.max(1, D)) / 50) + 2;
  const isSpread = moveObj.name === "Expanding Force"
    ? terrain === "Psychic" && attackerGrounded
    : Boolean(moveMeta.spread);
  if (calcState.field.isDoubles && isSpread) baseDamage = roundHalfDown(baseDamage * 0.75);
  if (weather === "Sun") {
    if (effType === "Fire") baseDamage = roundHalfDown(baseDamage * 1.5);
    if (effType === "Water") baseDamage = roundHalfDown(baseDamage * 0.5);
  } else if (weather === "Rain") {
    if (effType === "Water") baseDamage = roundHalfDown(baseDamage * 1.5);
    if (effType === "Fire") baseDamage = roundHalfDown(baseDamage * 0.5);
  }
  if (moveObj.crit) baseDamage = roundHalfDown(baseDamage * 1.5);

  const stabMult = atkForm.types.includes(effType)
    ? (atk.ability === "Adaptability" ? 2 : 1.5) : 1;
  const isBurnedWeakened = isPhys && atk.status === "Burned" &&
    atk.ability !== "Guts" && moveObj.name !== "Facade";

  const finalMods = [];
  const reflectOn = document.getElementById(`side-${defSideKey}-reflect`)?.checked;
  const lsOn = document.getElementById(`side-${defSideKey}-lightscreen`)?.checked;
  const veilOn = document.getElementById(`side-${defSideKey}-auroraveil`)?.checked;
  if (!moveObj.crit && atk.ability !== "Infiltrator" &&
      ((isPhys && (reflectOn || veilOn)) || (!isPhys && (lsOn || veilOn)))) {
    finalMods.push(calcState.field.isDoubles ? 2732 / 4096 : 0.5);
  }
  if (document.getElementById(`side-${defSideKey}-friendguard`)?.checked) finalMods.push(0.75);
  if (atk.item === "Life Orb") finalMods.push(1.3);
  if (atk.item === "Expert Belt" && typeMult > 1) finalMods.push(1.2);

  const typeItems = {
    "Black Glasses": "Dark", Charcoal: "Fire", "Mystic Water": "Water",
    "Miracle Seed": "Grass", "Fairy Feather": "Fairy", "Spell Tag": "Ghost",
    "Sharp Beak": "Flying", "Dragon Fang": "Dragon", Magnet: "Electric",
    "Never-Melt Ice": "Ice", "Silk Scarf": "Normal"
  };
  if (typeItems[atk.item] === effType) finalMods.push(1.2);
  if (defensiveAbility === "Filter" && typeMult > 1) finalMods.push(0.75);
  if (defensiveAbility === "Solid Rock" && typeMult > 1) finalMods.push(0.75);
  if (defensiveAbility === "Multiscale" || defensiveAbility === "Shadow Shield") {
    finalMods.push(0.5); // assumes defender is at full HP in this calculator
  }
  if (defensiveAbility === "Heatproof" && effType === "Fire") finalMods.push(0.5);
  if (defensiveAbility === "Water Bubble" && effType === "Fire") finalMods.push(0.5);
  const finalModifier = chainFinalModifiers(finalMods);

  const rolls = [];
  for (let r = 85; r <= 100; r++) {
    let d = Math.floor(baseDamage * r / 100);
    if (stabMult !== 1) d = roundHalfDown(d * stabMult);
    d = Math.floor(d * typeMult);
    if (isBurnedWeakened) d = Math.floor(d * 0.5);
    d = roundHalfDown(d * finalModifier / 4096);
    rolls.push(Math.max(1, d));
  }

  const min = rolls[0], max = rolls[15];
  const minPct = Number((min / defMaxHp * 100).toFixed(1));
  const maxPct = Number((max / defMaxHp * 100).toFixed(1));
  let koText = "possible 5HKO+";
  if (min >= defMaxHp) koText = "guaranteed OHKO";
  else if (max >= defMaxHp) {
    const pct = (rolls.filter((v) => v >= defMaxHp).length / 16 * 100).toFixed(1);
    koText = `${pct}% chance to OHKO`;
  } else if (min * 2 >= defMaxHp) koText = "guaranteed 2HKO";
  else if (max * 2 >= defMaxHp) koText = "possible 2HKO";
  else if (min * 3 >= defMaxHp) koText = "guaranteed 3HKO";
  else if (max * 3 >= defMaxHp) koText = "possible 3HKO";
  else if (max * 4 >= defMaxHp) koText = "possible 4HKO";
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
  const atkStatUsed = activeMove.name === "Body Press" ? "def" : moveMeta.cat === "Physical" ? "atk" : "spa";
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

function initSpeedWorkspace() {
  if (!hasRestoredSpeedState) speedSlots = [null, null, null];
  renderSpeedComparisonCards();
}

function clearAllSpeedSlots() {
  speedSlots = [null, null, null];
  renderSpeedComparisonCards();
  showToast("Đã xóa toàn bộ ô so sánh Speed.");
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

  // Updating an SP range input must NOT replace its DOM node during dragging.
  if (field === "sp") {
    updateSpeedComparisonLive();
    return;
  }

  renderSpeedComparisonCards();
}

// Capture the pointer for a full 0–32 SP drag even if the mouse leaves the thumb.
// We handle mouse, pen and touch with the same pointer events; keyboard still
// uses the range input's native `oninput` event.
let speedSpPointerDrag = null;

function setSpeedSpFromPointer(input, slotIdx, clientX) {
  const rect = input.getBoundingClientRect();
  // The thumb is ~16px wide, so its center moves inside these endpoints.
  const thumbRadius = 8;
  const usableWidth = Math.max(1, rect.width - thumbRadius * 2);
  const progress = Math.min(1, Math.max(0, (clientX - rect.left - thumbRadius) / usableWidth));
  const nextSp = Math.round(progress * 32);
  input.value = String(nextSp);
  if (speedSlots[slotIdx] && speedSlots[slotIdx].sp !== nextSp) {
    updateSpeedSlot(slotIdx, "sp", nextSp);
  }
}

function beginSpeedSpDrag(event, slotIdx) {
  if (event.pointerType === "mouse" && event.button !== 0) return;
  const input = event.currentTarget;
  event.preventDefault();
  speedSpPointerDrag = { input, slotIdx, pointerId: event.pointerId };
  input.setPointerCapture(event.pointerId);
  setSpeedSpFromPointer(input, slotIdx, event.clientX);
}

function moveSpeedSpDrag(event) {
  const active = speedSpPointerDrag;
  if (!active || active.input !== event.currentTarget || active.pointerId !== event.pointerId) return;
  event.preventDefault();
  setSpeedSpFromPointer(active.input, active.slotIdx, event.clientX);
}

function endSpeedSpDrag(event) {
  const active = speedSpPointerDrag;
  if (!active || active.input !== event.currentTarget || active.pointerId !== event.pointerId) return;
  speedSpPointerDrag = null;
  if (active.input.hasPointerCapture(event.pointerId)) {
    active.input.releasePointerCapture(event.pointerId);
  }
}

// Refresh only the output labels, winner badges and colors while dragging.
// Rebuilding #speed-cards-grid on every `input` releases the range thumb.
function updateSpeedComparisonLive() {
  const isTrickRoom = document.getElementById("speed-trick-room")?.checked || false;
  const active = speedSlots
    .map((card, slotIdx) => card ? { slotIdx, card, finalSpe: computeSpeedCardFinalValue(card).finalSpe } : null)
    .filter(Boolean);
  if (!active.length) return;

  const bestSpe = active.reduce((best, entry) =>
    isTrickRoom ? Math.min(best, entry.finalSpe) : Math.max(best, entry.finalSpe),
    isTrickRoom ? Infinity : -Infinity
  );

  active.forEach(({ slotIdx, card, finalSpe }) => {
    const cardEl = document.querySelector(`[data-speed-slot="${slotIdx}"]`);
    if (!cardEl) return;
    const isWinner = finalSpe === bestSpe;
    const valueEl = cardEl.querySelector("[data-speed-sp-value]");
    const speedEl = cardEl.querySelector("[data-speed-final-value]");
    const slider = cardEl.querySelector("[data-speed-sp-slider]");
    const badge = cardEl.querySelector("[data-speed-winner-badge]");
    const result = cardEl.querySelector("[data-speed-result-panel]");

    if (valueEl) valueEl.textContent = String(card.sp);
    if (speedEl) {
      speedEl.textContent = String(finalSpe);
      speedEl.classList.toggle("text-emerald-400", isWinner);
      speedEl.classList.toggle("text-white", !isWinner);
    }
    if (slider) {
      // Change the paint, not the input element or its current pointer capture.
      const percentage = (card.sp / 32) * 100;
      slider.style.background = `linear-gradient(to right, #38bdf8 0%, #38bdf8 ${percentage}%, #1e293b ${percentage}%, #1e293b 100%)`;
    }
    cardEl.classList.toggle("border-emerald-500", isWinner);
    cardEl.classList.toggle("border-slate-800", !isWinner);
    cardEl.classList.toggle("shadow-lg", isWinner);
    cardEl.classList.toggle("shadow-emerald-500/15", isWinner);

    if (result) {
      result.classList.toggle("bg-emerald-500/10", isWinner);
      result.classList.toggle("border-emerald-500/40", isWinner);
      result.classList.toggle("bg-slate-950/90", !isWinner);
      result.classList.toggle("border-slate-800", !isWinner);
    }
    if (badge) {
      badge.textContent = isWinner ? (isTrickRoom ? "Đi trước (TR)" : "Nhanh nhất") : `Slot #${slotIdx + 1}`;
      badge.className = isWinner
        ? "inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[11px] font-extrabold tracking-wide shadow"
        : "text-[11px] font-semibold text-slate-500";
    }
  });
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
        <div data-speed-slot="${slotIdx}" class="glass-panel rounded-2xl p-5 relative flex flex-col justify-between space-y-4 border-2 transition-[border-color,box-shadow] ${
          isWinner
            ? "border-emerald-500 shadow-lg shadow-emerald-500/15"
            : "border-slate-800"
        }">
          <div class="flex items-center justify-between gap-2 min-h-[28px]">
            <div>
              <span data-speed-winner-badge class="${isWinner
                ? "inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[11px] font-extrabold tracking-wide shadow"
                : "text-[11px] font-semibold text-slate-500"}">${isWinner ? badgeLabel : `Slot #${slotIdx + 1}`}</span>
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
              <span data-speed-sp-value class="font-mono font-extrabold text-sky-400">${card.sp}</span>
            </div>
            <input data-speed-sp-slider type="range" min="0" max="32" step="1" value="${card.sp}"
              aria-label="Stat Points Speed - Pokémon ${slotIdx + 1}"
              oninput="updateSpeedSlot(${slotIdx}, 'sp', this.value)"
              onpointerdown="beginSpeedSpDrag(event, ${slotIdx})"
              onpointermove="moveSpeedSpDrag(event)"
              onpointerup="endSpeedSpDrag(event)"
              onpointercancel="endSpeedSpDrag(event)"
              onlostpointercapture="endSpeedSpDrag(event)"
              style="touch-action: none; user-select: none; background: linear-gradient(to right, #38bdf8 0%, #38bdf8 ${card.sp / 32 * 100}%, #1e293b ${card.sp / 32 * 100}%, #1e293b 100%);"
              class="sp-slider w-full speed-sp-drag-slider" />
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

          <div data-speed-result-panel class="rounded-xl p-3 text-center border ${
            isWinner
              ? "bg-emerald-500/10 border-emerald-500/40"
              : "bg-slate-950/90 border-slate-800"
          }">
            <div class="text-[11px] font-semibold text-slate-400">Tốc độ cuối cùng</div>
            <div data-speed-final-value class="font-mono text-3xl font-extrabold mt-0.5 ${
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

function setAiScanStatus(message, level = "info") {
  const el = document.getElementById("ai-scan-status");
  if (!el) return;
  el.textContent = message;
  el.classList.toggle("hidden", !message);
  el.classList.remove("text-rose-300", "text-emerald-300", "text-sky-300");
  el.classList.add(level === "error" ? "text-rose-300" : level === "success" ? "text-emerald-300" : "text-sky-300");
}

function explainGeminiFailure(status, error, modelName = GEMINI_AI_MODEL) {
  const details = typeof error?.message === "string" ? error.message : "";
  if (status === 401 || status === 403) {
    return `HTTP ${status}: API Key không hợp lệ, bị giới hạn hoặc thiếu quyền sử dụng model. Kiểm tra khóa trong Google AI Studio. ${details}`.trim();
  }
  if (status === 404) {
    return `HTTP 404: Không tìm thấy endpoint/model, hoặc dự án/API Key chưa được cấp quyền truy cập ${modelName}. Kiểm tra Models trong Google AI Studio. ${details}`.trim();
  }
  if (status === 429) {
    return `HTTP 429: Đã chạm giới hạn lượt gọi (rate limit) hoặc quota. ${details}`.trim();
  }
  if (status >= 500) {
    return `HTTP ${status}: Dịch vụ Gemini tạm thời không khả dụng. ${details}`.trim();
  }
  return `HTTP ${status}: ${details || "Gemini API trả về lỗi không xác định."}`;
}

function isRetryableGeminiStatus(status) {
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

function waitMs(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGeminiInteractionsOnce(apiKey, modelName, promptText) {
  // Google's documented Interactions API for inline base64 images.
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey
    },
    body: JSON.stringify({
      model: modelName,
      store: false,
      input: [
        { type: "text", text: promptText },
        { type: "image", data: aiSelectedImageBase64, mime_type: aiSelectedImageMime }
      ]
    })
  });

  const data = await response.json().catch(() => ({}));
  return { response, data };
}

function extractInteractionText(data) {
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text;
  }
  // Interactions can also expose the model output in steps.
  const modelSteps = (data?.steps || []).filter((step) => step.type === "model_output");
  return modelSteps.flatMap((step) => step.content || [])
    .filter((part) => part.type === "text" && typeof part.text === "string")
    .map((part) => part.text).join("\n");
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
  if (btn.disabled) return; // Prevent two requests for the same image.
  const btnText = document.getElementById("ai-scan-btn-text");
  btn.disabled = true;

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
- Identify the base/alternate species form, not just its Mega battle form.
- CRITICAL FLOETTE RULE: If the image says "Mega Floette", output "Floette-Eternal @ Floettite", NEVER "Mega Floette" or plain "Floette". Its pre-Mega ability is Flower Veil; Fairy Aura is the ability after Mega Evolution.
- For all Mega Pokémon, output base species @ correct Mega Stone (e.g., Raichu @ Raichunite Y), never "Mega Raichu" as a separate species.
- Preserve clearly shown items, abilities, natures and moves exactly. Do not invent a different set when those details are visible.
- If Nature is not visible in the screenshot, infer a reasonable competitive Regulation M-C Nature and do not label that choice as verified.
- Do NOT include markdown code fences or extra commentary, only the Showdown paste text.`;

  try {
    let lastError = null;
    let data = null;

    for (const modelName of GEMINI_FALLBACK_MODELS) {
      const maxAttempts = 3;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        btnText.textContent = `⏳ ${modelName} đang phân tích (lần ${attempt}/${maxAttempts})...`;
        setAiScanStatus(`Đang gửi ảnh tới ${modelName} (lần thử ${attempt}/${maxAttempts})...`);

        const res = await callGeminiInteractionsOnce(apiKey, modelName, promptText);
        if (res.response.ok) {
          data = res.data;
          lastError = null;
          break;
        }

        lastError = new Error(explainGeminiFailure(res.response.status, res.data.error, modelName));
        if (!isRetryableGeminiStatus(res.response.status) || attempt === maxAttempts) {
          break;
        }

        const delay = attempt * 1500;
        setAiScanStatus(`${modelName} đang quá tải (${res.response.status}), thử lại sau ${delay / 1000}s...`);
        await waitMs(delay);
      }
      if (data) break;
    }

    if (!data) {
      throw lastError || new Error("Không nhận được phản hồi hợp lệ từ Gemini API.");
    }

    const rawText = extractInteractionText(data);
    const cleaned = rawText.replace(/```[a-z]*\n?/gi, "").replace(/```/g, "").trim();
    if (!cleaned) {
      throw new Error("Gemini phản hồi thành công nhưng không trả văn bản. Kiểm tra nội dung ảnh và thử lại.");
    }
    document.getElementById("ai-output-textarea").value = normalizeAiShowdownText(cleaned);
    setAiScanStatus("Đã quét ảnh thành công.", "success");
    showToast("Quét ảnh đội hình thành công!", "success");
  } catch (err) {
    // Do not log the API key or the input image data.
    console.error("Gemini AI scanner:", err.message);
    const errorMessage = err instanceof TypeError && /failed to fetch|networkerror/i.test(err.message)
      ? "Không kết nối được tới Gemini. Kiểm tra mạng và Console → Network. Nếu báo CORS, xác nhận app.js mới đã được tải (không còn header Api-Revision)."
      : err.message;
    setAiScanStatus(errorMessage, "error");
    showToast("Quét AI thất bại. Xem thông báo dưới nút Quét ảnh.", "error");
  } finally {
    btn.disabled = false;
    btnText.textContent = "✨ Quét ảnh nhận diện đội hình";
  }
}

// Normalize the text shown to the user, not only the hidden import step.
// This prevents a successful scan from displaying "Mega Floette" as the team species.
function normalizeAiShowdownText(text) {
  const knownSpecies = Object.keys(POKEDEX_MC);
  return text.split(/\n\s*\n/).map(block => {
    const lines = block.split("\n");
    if (!lines.length || !lines[0].trim()) return block;
    const header = lines[0].trim();
    const at = header.indexOf("@");
    let rawSpecies = (at < 0 ? header : header.slice(0, at)).trim();
    let item = at < 0 ? "" : header.slice(at + 1).trim();
    if (/^floette\s*\(eternal(?: flower)?\)$/i.test(rawSpecies)) rawSpecies = "Floette-Eternal";
    const resolved = resolveImportedSpecies(rawSpecies, item, knownSpecies);
    if (!resolved) return block;
    const dex = POKEDEX_MC[resolved.species];
    if (resolved.forcedMega && dex?.megas && !dex.megas[item]) item = dex.defaultMegaStone;
    if (resolved.species === "Floette-Eternal" && item === "Floettite") {
      // An OTS/Showdown paste lists the original form's Ability, not its post-Mega one.
      for (let i = 1; i < lines.length; i++) {
        if (/^\s*Ability:\s*Fairy Aura\s*$/i.test(lines[i])) lines[i] = "Ability: Flower Veil";
      }
    }
    lines[0] = resolved.species + (item ? " @ " + item : "");
    return lines.join("\n");
  }).join("\n\n");
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
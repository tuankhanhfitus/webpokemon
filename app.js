const STAT_KEYS = ["hp", "atk", "def", "spa", "spd", "spe"];
const STAT_LABELS = { hp: "HP", atk: "Atk", def: "Def", spa: "SpA", spd: "SpD", spe: "Spe" };
const MAX_STAT_SP = 32;
const MAX_TOTAL_SP = 66;
const STORAGE_KEY = "vgc_champions_mc_studio_v3";

function createMon(speciesName = "Incineroar") {
  const validSpecies = POKEDEX_MC[speciesName] ? speciesName : "Incineroar";
  const data = POKEDEX_MC[validSpecies];
  return {
    species: validSpecies,
    nickname: "",
    gender: "",
    isMega: false,
    item: data.mega ? data.mega.stone : "Sitrus Berry",
    ability: data.abilities[0],
    nature: "Adamant",
    moves: data.moves.slice(0, 4),
    sp: { hp: 32, atk: 0, def: 20, spa: 0, spd: 14, spe: 0 }
  };
}

function createDefaultSlots() {
  return [
    createMon("Incineroar"),
    { ...createMon("Garchomp"), isMega: true, item: "Garchompite", nature: "Jolly", sp: { hp: 2, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 } },
    { ...createMon("Rillaboom"), item: "Assault Vest", nature: "Adamant", sp: { hp: 32, atk: 32, def: 2, spa: 0, spd: 0, spe: 0 } },
    { ...createMon("Pelipper"), item: "Focus Sash", nature: "Timid", sp: { hp: 2, atk: 0, def: 0, spa: 32, spd: 0, spe: 32 } },
    { ...createMon("Basculegion"), item: "Choice Scarf", nature: "Adamant", sp: { hp: 2, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 } },
    { ...createMon("Amoonguss"), item: "Rocky Helmet", nature: "Bold", sp: { hp: 32, atk: 0, def: 22, spa: 0, spd: 12, spe: 0 } }
  ];
}

let state = {
  lang: "vi",
  teams: [],
  activeTeamId: null,
  activeSlotIdx: 0,
  modalMode: "ranked",
  aiImageBase64: null,
  aiImageMime: "image/png",
  calc: {
    attacker: {
      species: "Garchomp",
      isMega: true,
      item: "Garchompite",
      ability: "Sand Force",
      nature: "Jolly",
      sp: { hp: 2, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 },
      boosts: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }
    },
    defender: {
      species: "Incineroar",
      isMega: false,
      item: "Sitrus Berry",
      ability: "Intimidate",
      nature: "Careful",
      sp: { hp: 32, atk: 0, def: 20, spa: 0, spd: 14, spe: 0 },
      boosts: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }
    },
    move: {
      name: "Earthquake",
      bp: 100,
      type: "Ground",
      cat: "Physical"
    },
    field: {
      weather: "None",
      terrain: "None"
    }
  }
};

function loadStore() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].slots) {
      state.teams = parsed;
      state.activeTeamId = parsed[0].id;
      return;
    }
  } catch (e) {}
  state.teams = [{
    id: "team-mc-1",
    name: "Reg M-C Rain + Mega Garchomp",
    slots: createDefaultSlots()
  }];
  state.activeTeamId = state.teams[0].id;
  saveStore();
}

function saveStore() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.teams));
}

function getActiveTeam() {
  return state.teams.find(t => t.id === state.activeTeamId) || state.teams[0];
}

function getActivePokemon() {
  return getActiveTeam().slots[state.activeSlotIdx];
}

// CÔNG THỨC CHỈ SỐ POKÉMON CHAMPIONS LV.50 (31 IVs cố định + SP 0..32)
function calcChampionStat(statKey, baseVal, spVal, natureName) {
  const b = Number(baseVal) || 80;
  const sp = Math.min(MAX_STAT_SP, Math.max(0, Number(spVal) || 0));
  if (statKey === "hp") return b + 75 + sp;
  let val = b + 20 + sp;
  const nat = NATURES[natureName] || { plus: null, minus: null };
  if (nat.plus === statKey) val = Math.floor(val * 1.1);
  if (nat.down === statKey || nat.minus === statKey) val = Math.floor(val * 0.9);
  return val;
}

function spToEv(sp) {
  return !sp || sp <= 0 ? 0 : Math.min(252, sp * 8 - 4);
}

function evToSp(ev) {
  return !ev || ev < 4 ? 0 : Math.min(MAX_STAT_SP, Math.floor((ev + 4) / 8));
}

function getTotalSP(spObj) {
  return STAT_KEYS.reduce((acc, k) => acc + (Number(spObj?.[k]) || 0), 0);
}

function getSpriteUrl(slug) {
  return `https://play.pokemonshowdown.com/sprites/ani/${slug}.gif`;
}

function getEffectiveForm(mon) {
  const baseData = POKEDEX_MC[mon.species] || POKEDEX_MC["Incineroar"];
  if (mon.isMega && baseData.mega) {
    return {
      name: baseData.mega.name,
      slug: baseData.mega.slug,
      types: baseData.mega.types,
      base: baseData.mega.base,
      ability: baseData.mega.ability
    };
  }
  return {
    name: mon.species,
    slug: baseData.slug,
    types: baseData.types,
    base: baseData.base,
    ability: mon.ability
  };
}

function showToast(msg, type = "success") {
  const container = document.getElementById("toast-container");
  const el = document.createElement("div");
  const colors = type === "error"
    ? "bg-rose-950/95 border-rose-500/50 text-rose-200"
    : "bg-slate-900/95 border-sky-500/50 text-sky-200";
  el.className = `px-4 py-2.5 rounded-xl border shadow-xl text-xs font-semibold backdrop-blur-md transition-all ${colors}`;
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => {
    el.style.opacity = "0";
    setTimeout(() => el.remove(), 300);
  }, 2600);
}

window.copyTextToClipboard = function (text) {
  if (!text) return;
  navigator.clipboard.writeText(text);
  showToast("Đã sao chép vào Clipboard!");
};

// CHUYỂN TAB CHÍNH
window.switchMainTab = function (tabName) {
  ["builder", "calc", "scanner"].forEach(t => {
    document.getElementById(`view-${t}`).classList.toggle("hidden", t !== tabName);
    const btn = document.getElementById(`nav-${t}`);
    if (t === tabName) {
      btn.className = "nav-tab px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all bg-sky-500 text-slate-950 shadow flex items-center gap-1.5";
    } else {
      btn.className = "nav-tab px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-1.5";
    }
  });
  if (tabName === "calc") {
    populateCalcTeamDropdowns();
    runDamageCalculation();
  }
};

window.toggleLanguage = function () {
  state.lang = state.lang === "vi" ? "en" : "vi";
  const dict = {
    vi: {
      tabBuilder: "Team Builder",
      tabCalc: "Damage Calc",
      tabScanner: "AI Quét Ảnh",
      currentTeam: "Đội hình:",
      btnNewTeam: "Tạo mới",
      btnClone: "Nhân bản",
      btnImport: "Nhập Showdown",
      btnExportRank: "Xuất Rank (Full SP/EVs)",
      btnExportOTS: "Xuất Giải OTS (Giấu SP)",
      lblItem: "Vật phẩm (Item)",
      lblAbility: "Đặc tính (Ability)",
      lblPreset: "Preset SP nhanh (Max 66)",
      lblMoves: "Bộ chiêu thức (4 Moves)",
      moveHint: "Chọn bộ 4 chiêu thi đấu chuẩn Reg M-C",
      btnSendAtk: "Đưa sang Damage Calc (Bên Tấn Công)",
      btnClearSlot: "Đặt lại Slot mặc định",
      lblStatsTitle: "Chỉ số & Phân bổ Stat Points (SP)",
      lblStatsSub: "Tối đa 32 SP/chỉ số • Cố định 31 IVs (Lv.50)",
      lblNature: "Tính cách (Nature)"
    },
    en: {
      tabBuilder: "Team Builder",
      tabCalc: "Damage Calc",
      tabScanner: "AI Image Scan",
      currentTeam: "Active Team:",
      btnNewTeam: "New Team",
      btnClone: "Duplicate",
      btnImport: "Import Paste",
      btnExportRank: "Export Ranked (Full)",
      btnExportOTS: "Export OTS (No SP/EVs)",
      lblItem: "Held Item",
      lblAbility: "Ability",
      lblPreset: "Quick SP Preset (Max 66)",
      lblMoves: "Moveset (4 Moves)",
      moveHint: "Pick Regulation M-C competitive moves",
      btnSendAtk: "Send to Damage Calc (Attacker)",
      btnClearSlot: "Reset Slot",
      lblStatsTitle: "Stats & Stat Points (SP) Spread",
      lblStatsSub: "Max 32 SP/stat • Fixed 31 IVs (Lv.50)",
      lblNature: "Nature"
    }
  };
  const strings = dict[state.lang];
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (strings[key]) el.textContent = strings[key];
  });
  showToast(state.lang === "vi" ? "Đã chuyển sang Tiếng Việt" : "Switched to English");
};

// KHỞI TẠO DROPDOWN TĨNH
function initStaticDropdowns() {
  const speciesNames = Object.keys(POKEDEX_MC);
  ["sel-species", "calc-atk-species", "calc-def-species"].forEach(id => {
    document.getElementById(id).innerHTML = speciesNames.map(s => `<option value="${s}">${s}</option>`).join("");
  });

  ["sel-item", "calc-atk-item", "calc-def-item"].forEach(id => {
    document.getElementById(id).innerHTML = ITEMS_MC.map(i => `<option value="${i}">${i}</option>`).join("");
  });

  ["sel-nature", "calc-atk-nature", "calc-def-nature"].forEach(id => {
    document.getElementById(id).innerHTML = Object.entries(NATURES).map(([name, mod]) => {
      const label = mod.plus ? `${name} (+${mod.plus.toUpperCase()}, -${mod.minus.toUpperCase()})` : `${name} (Neutral)`;
      return `<option value="${name}">${label}</option>`;
    }).join("");
  });

  document.getElementById("calc-move-type").innerHTML = ALL_TYPES
    .map(t => `<option value="${t}">${t}</option>`).join("");

  document.getElementById("calc-move-name").innerHTML = Object.keys(MOVES_DB)
    .filter(m => MOVES_DB[m].bp > 0)
    .map(m => `<option value="${m}">${m} (${MOVES_DB[m].bp} BP)</option>`).join("");
}

// RENDER TEAM SELECTOR & 6-SLOT RIBBON
function renderTeamSelector() {
  const sel = document.getElementById("team-selector");
  sel.innerHTML = state.teams.map(t =>
    `<option value="${t.id}" ${t.id === state.activeTeamId ? "selected" : ""}>${t.name}</option>`
  ).join("");
  const activeTeam = getActiveTeam();
  document.getElementById("team-name-input").value = activeTeam ? activeTeam.name : "";
}

function renderTeamSlotsRibbon() {
  const team = getActiveTeam();
  const container = document.getElementById("team-slots-ribbon");
  container.innerHTML = team.slots.map((slot, idx) => {
    const isSelected = idx === state.activeSlotIdx;
    const borderClass = isSelected
      ? "border-sky-400 bg-slate-900 shadow-lg shadow-sky-500/15 ring-1 ring-sky-400/50"
      : "border-slate-800 bg-slate-900/50 hover:border-slate-700";

    const form = getEffectiveForm(slot);
    const totalSp = getTotalSP(slot.sp);
    const sprite = getSpriteUrl(form.slug);

    return `
      <button onclick="selectSlot(${idx})" class="p-2.5 rounded-2xl border ${borderClass} flex items-center gap-2.5 h-24 text-left transition relative overflow-hidden">
        <img src="${sprite}" alt="${form.name}" class="w-12 h-12 object-contain shrink-0" onerror="this.src='https://play.pokemonshowdown.com/sprites/gen5/${form.slug}.png'" />
        <div class="min-w-0 flex-1">
          <div class="text-xs font-extrabold text-white truncate">${form.name}</div>
          <div class="text-[10px] text-sky-400 truncate">${slot.item || "No Item"}</div>
          <div class="flex items-center gap-1 mt-1">
            <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              ${totalSp}/66 SP
            </span>
          </div>
        </div>
      </button>
    `;
  }).join("");
}

// RENDER ACTIVE POKÉMON EDITOR
function renderActivePokemonEditor() {
  const pkmn = getActivePokemon();
  const baseData = POKEDEX_MC[pkmn.species] || POKEDEX_MC["Incineroar"];
  const form = getEffectiveForm(pkmn);

  document.getElementById("editor-slot-num").textContent = state.activeSlotIdx + 1;
  document.getElementById("sel-species").value = pkmn.species;
  document.getElementById("input-nickname").value = pkmn.nickname || "";
  document.getElementById("input-gender").value = pkmn.gender || "";
  document.getElementById("sel-item").value = pkmn.item || "";
  document.getElementById("sel-nature").value = pkmn.nature || "Serious";

  // Mega Toggle Button
  const megaBtn = document.getElementById("btn-mega");
  if (!baseData.mega) {
    megaBtn.disabled = true;
    megaBtn.className = "px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-600 text-xs font-extrabold cursor-not-allowed flex items-center gap-1";
  } else {
    megaBtn.disabled = false;
    megaBtn.className = pkmn.isMega
      ? "px-3 py-1.5 rounded-xl border border-pink-400 bg-pink-500/20 text-pink-300 text-xs font-extrabold shadow-md shadow-pink-500/15 transition flex items-center gap-1"
      : "px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-400 hover:text-pink-300 text-xs font-extrabold transition flex items-center gap-1";
  }

  // Ability Dropdown
  const selAbility = document.getElementById("sel-ability");
  if (pkmn.isMega && baseData.mega) {
    selAbility.innerHTML = `<option value="${baseData.mega.ability}">${baseData.mega.ability} (Mega)</option>`;
  } else {
    selAbility.innerHTML = baseData.abilities.map(a => `<option value="${a}">${a}</option>`).join("");
    selAbility.value = pkmn.ability;
  }

  // Sprite & Type Badges
  const spriteEl = document.getElementById("editor-sprite");
  spriteEl.onerror = () => { spriteEl.src = `https://play.pokemonshowdown.com/sprites/gen5/${form.slug}.png`; };
  spriteEl.src = getSpriteUrl(form.slug);

  const typesContainer = document.getElementById("editor-types");
  typesContainer.innerHTML = form.types.map(t =>
    `<span class="px-2 py-0.5 rounded-md text-[10px] font-bold ${TYPE_COLORS[t] || "bg-slate-700"}">${t}</span>`
  ).join("");

  // 4 Moves Selectors
  const allMoves = Object.keys(MOVES_DB);
  const movesContainer = document.getElementById("moves-inputs-container");
  movesContainer.innerHTML = [0, 1, 2, 3].map(mIdx => {
    const mvVal = pkmn.moves[mIdx] || baseData.moves[0];
    const mvData = MOVES_DB[mvVal] || { type: "Normal", bp: 0 };
    const options = allMoves.map(m => `<option value="${m}" ${m === mvVal ? "selected" : ""}>${m}</option>`).join("");
    const badge = `<span class="px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${TYPE_COLORS[mvData.type] || "bg-slate-700"}">${mvData.type}</span>`;
    return `
      <div class="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 focus-within:border-sky-500">
        <span class="text-[11px] font-mono text-slate-500">${mIdx + 1}.</span>
        <select onchange="updateActiveMove(${mIdx}, this.value)" class="w-full bg-transparent text-xs sm:text-sm font-medium text-white focus:outline-none">
          ${options}
        </select>
        ${badge}
      </div>
    `;
  }).join("");

  renderStatsRows(pkmn, form.base);
}

function renderStatsRows(pkmn, baseStats) {
  const nat = NATURES[pkmn.nature] || { plus: null, minus: null };
  const totalSp = getTotalSP(pkmn.sp);
  const remSp = MAX_TOTAL_SP - totalSp;

  const remBadge = document.getElementById("sp-remaining-badge");
  remBadge.textContent = `${remSp} / 66`;
  remBadge.className = `font-mono text-sm font-bold ${remSp === 0 ? "text-amber-400" : "text-emerald-400"}`;

  const container = document.getElementById("stats-rows-container");
  container.innerHTML = STAT_KEYS.map(key => {
    const base = baseStats[key] || 80;
    const sp = pkmn.sp[key] || 0;
    const real = calcChampionStat(key, base, sp, pkmn.nature);

    let modSymbol = "";
    let labelColor = "text-slate-300";
    if (nat.plus === key) {
      modSymbol = '<span class="text-rose-400 font-bold">+</span>';
      labelColor = "text-rose-300";
    } else if (nat.minus === key) {
      modSymbol = '<span class="text-sky-400 font-bold">-</span>';
      labelColor = "text-sky-300";
    }

    const barPct = Math.min(100, Math.round((real / 250) * 100));
    const barColor = real >= 160 ? "bg-emerald-400" : real >= 110 ? "bg-sky-400" : "bg-amber-400";

    return `
      <div class="grid grid-cols-12 gap-1.5 items-center text-xs">
        <div class="col-span-2 font-bold ${labelColor}">${STAT_LABELS[key]}${modSymbol}</div>
        <div class="col-span-1 text-center font-mono text-[11px] text-slate-400">${base}</div>
        <div class="col-span-5 flex items-center gap-1.5">
          <input type="range" min="0" max="${MAX_STAT_SP}" value="${sp}" oninput="updateActiveSp('${key}', this.value)" class="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer" />
          <input type="number" min="0" max="${MAX_STAT_SP}" value="${sp}" onchange="updateActiveSp('${key}', this.value)" class="w-11 bg-slate-900 border border-slate-700 rounded px-1 py-0.5 text-center font-mono text-[11px] text-white" />
        </div>
        <div class="col-span-2 text-center font-mono text-[11px] text-slate-400">${spToEv(sp)}</div>
        <div class="col-span-2 flex flex-col items-end">
          <span class="font-mono font-extrabold text-white">${real}</span>
          <div class="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-0.5">
            <div class="h-full ${barColor}" style="width: ${barPct}%"></div>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function renderAllBuilderUI() {
  renderTeamSelector();
  renderTeamSlotsRibbon();
  renderActivePokemonEditor();
}

// BUILDER EVENT HANDLERS
window.selectSlot = function (idx) {
  state.activeSlotIdx = idx;
  renderTeamSlotsRibbon();
  renderActivePokemonEditor();
};

window.changeActiveSpecies = function (speciesName) {
  getActiveTeam().slots[state.activeSlotIdx] = createMon(speciesName);
  saveStore();
  renderTeamSlotsRibbon();
  renderActivePokemonEditor();
};

window.updateActivePokemon = function (field, value) {
  const pkmn = getActivePokemon();
  pkmn[field] = value;
  saveStore();
  renderTeamSlotsRibbon();
  renderActivePokemonEditor();
};

window.toggleMegaForm = function () {
  const pkmn = getActivePokemon();
  const baseData = POKEDEX_MC[pkmn.species];
  if (!baseData || !baseData.mega) return;
  pkmn.isMega = !pkmn.isMega;
  if (pkmn.isMega) pkmn.item = baseData.mega.stone;
  saveStore();
  renderTeamSlotsRibbon();
  renderActivePokemonEditor();
};

window.updateActiveMove = function (moveIdx, moveName) {
  const pkmn = getActivePokemon();
  pkmn.moves[moveIdx] = moveName;
  saveStore();
  renderActivePokemonEditor();
};

window.updateActiveSp = function (statKey, rawVal) {
  const pkmn = getActivePokemon();
  let val = Math.min(MAX_STAT_SP, Math.max(0, parseInt(rawVal, 10) || 0));
  const otherSum = STAT_KEYS
    .filter(k => k !== statKey)
    .reduce((acc, k) => acc + (Number(pkmn.sp[k]) || 0), 0);

  if (otherSum + val > MAX_TOTAL_SP) {
    val = Math.max(0, MAX_TOTAL_SP - otherSum);
  }
  pkmn.sp[statKey] = val;
  saveStore();
  const form = getEffectiveForm(pkmn);
  renderStatsRows(pkmn, form.base);
  renderTeamSlotsRibbon();
};

window.applySpPreset = function (preset) {
  const pkmn = getActivePokemon();
  if (!preset) return;
  const presets = {
    phys_sweeper: { hp: 2,  atk: 32, def: 0,  spa: 0,  spd: 0,  spe: 32 },
    spec_sweeper: { hp: 2,  atk: 0,  def: 0,  spa: 32, spd: 0,  spe: 32 },
    bulky_phys:   { hp: 32, atk: 32, def: 2,  spa: 0,  spd: 0,  spe: 0 },
    bulky_spec:   { hp: 32, atk: 0,  def: 0,  spa: 32, spd: 2,  spe: 0 },
    support_bal:  { hp: 32, atk: 0,  def: 20, spa: 0,  spd: 14, spe: 0 },
    support_spd:  { hp: 32, atk: 0,  def: 12, spa: 0,  spd: 22, spe: 0 },
    reset:        { hp: 0,  atk: 0,  def: 0,  spa: 0,  spd: 0,  spe: 0 }
  };
  if (presets[preset]) {
    pkmn.sp = { ...presets[preset] };
    saveStore();
    renderActivePokemonEditor();
    renderTeamSlotsRibbon();
  }
};

window.clearCurrentSlot = function () {
  getActiveTeam().slots[state.activeSlotIdx] = createMon("Incineroar");
  saveStore();
  renderTeamSlotsRibbon();
  renderActivePokemonEditor();
};

// MULTI-TEAM MANAGEMENT
window.selectTeam = function (teamId) {
  state.activeTeamId = teamId;
  state.activeSlotIdx = 0;
  renderAllBuilderUI();
};

window.renameCurrentTeam = function (newName) {
  const team = getActiveTeam();
  if (team && newName.trim()) {
    team.name = newName.trim();
    saveStore();
    renderTeamSelector();
  }
};

window.createNewTeam = function () {
  const newTeam = {
    id: "team-" + Date.now(),
    name: `Reg M-C Team #${state.teams.length + 1}`,
    slots: createDefaultSlots()
  };
  state.teams.unshift(newTeam);
  state.activeTeamId = newTeam.id;
  state.activeSlotIdx = 0;
  saveStore();
  renderAllBuilderUI();
  showToast("Đã tạo đội hình mới!");
};

window.duplicateCurrentTeam = function () {
  const current = getActiveTeam();
  const clone = JSON.parse(JSON.stringify(current));
  clone.id = "team-" + Date.now();
  clone.name = `${current.name} (Copy)`;
  state.teams.unshift(clone);
  state.activeTeamId = clone.id;
  saveStore();
  renderAllBuilderUI();
  showToast("Đã nhân bản đội hình!");
};

window.deleteCurrentTeam = function () {
  if (state.teams.length <= 1) {
    showToast("Cần giữ lại ít nhất 1 đội hình!", "error");
    return;
  }
  state.teams = state.teams.filter(t => t.id !== state.activeTeamId);
  state.activeTeamId = state.teams[0].id;
  state.activeSlotIdx = 0;
  saveStore();
  renderAllBuilderUI();
  showToast("Đã xóa đội hình.");
};

// EXPORT / IMPORT SHOWDOWN (RANKED VS TOURNAMENT OTS)
function formatPokemonShowdown(pkmn, mode = "ranked") {
  const form = getEffectiveForm(pkmn);
  const lines = [];

  let header = pkmn.nickname && pkmn.nickname.trim()
    ? `${pkmn.nickname.trim()} (${form.name})`
    : form.name;
  if (pkmn.gender === "M" || pkmn.gender === "F") header += ` (${pkmn.gender})`;
  if (pkmn.item) header += ` @ ${pkmn.item}`;
  lines.push(header);

  lines.push(`Ability: ${form.ability}`);
  lines.push(`Level: 50`);

  // Chế độ Đấu Rank: xuất đầy đủ SP (0-32), EV quy đổi và Nature
  // Chế độ Đánh Giải OTS: ẩn hoàn toàn SPs, EVs, IVs và Nature
  if (mode === "ranked") {
    const spParts = STAT_KEYS.filter(k => pkmn.sp[k] > 0).map(k => `${pkmn.sp[k]} ${STAT_LABELS[k]}`);
    const evParts = STAT_KEYS.filter(k => pkmn.sp[k] > 0).map(k => `${spToEv(pkmn.sp[k])} ${STAT_LABELS[k]}`);
    if (spParts.length > 0) {
      lines.push(`SPs: ${spParts.join(" / ")}`);
      lines.push(`EVs: ${evParts.join(" / ")}`);
    }
    lines.push(`${pkmn.nature} Nature`);
  }

  (pkmn.moves || []).filter(Boolean).forEach(m => lines.push(`- ${m}`));
  return lines.join("\n");
}

function exportTeamToShowdown(mode = "ranked") {
  return getActiveTeam().slots.map(s => formatPokemonShowdown(s, mode)).join("\n\n");
}

function parseShowdownPaste(pasteText) {
  const blocks = pasteText.trim().split(/\n\s*\n/).filter(b => b.trim().length > 0);
  const parsedSlots = [];

  for (let i = 0; i < 6; i++) {
    if (i >= blocks.length) {
      parsedSlots.push(createMon("Incineroar"));
      continue;
    }
    const lines = blocks[i].split("\n").map(l => l.trim()).filter(Boolean);
    let header = lines[0];
    let item = "";
    if (header.includes(" @ ")) {
      const [left, right] = header.split(" @ ");
      header = left.trim();
      item = right.trim();
    }
    let gender = "";
    if (header.endsWith(" (M)")) { gender = "M"; header = header.slice(0, -4).trim(); }
    else if (header.endsWith(" (F)")) { gender = "F"; header = header.slice(0, -4).trim(); }

    let nickname = "";
    let rawSpecies = header;
    const nickMatch = header.match(/^(.+?)\s*\(([^()]+)\)$/);
    if (nickMatch) {
      nickname = nickMatch[1].trim();
      rawSpecies = nickMatch[2].trim();
    }

    const isMega = rawSpecies.includes("-Mega");
    const baseSpecies = rawSpecies.split("-Mega")[0];
    const slot = createMon(baseSpecies);
    slot.nickname = nickname;
    slot.gender = gender;
    slot.isMega = isMega;
    if (item) slot.item = item;
    slot.sp = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };

    const moves = [];
    for (let j = 1; j < lines.length; j++) {
      const line = lines[j];
      if (line.startsWith("Ability:")) {
        slot.ability = line.replace("Ability:", "").trim();
      } else if (line.endsWith(" Nature")) {
        const nat = line.replace(" Nature", "").trim();
        if (NATURES[nat]) slot.nature = nat;
      } else if (line.startsWith("SPs:")) {
        line.replace("SPs:", "").split("/").forEach(p => {
          const m = p.trim().match(/^(\d+)\s+(HP|Atk|Def|SpA|SpD|Spe)$/i);
          if (m) slot.sp[m[2].toLowerCase()] = Math.min(MAX_STAT_SP, parseInt(m[1], 10));
        });
      } else if (line.startsWith("EVs:") && getTotalSP(slot.sp) === 0) {
        line.replace("EVs:", "").split("/").forEach(p => {
          const m = p.trim().match(/^(\d+)\s+(HP|Atk|Def|SpA|SpD|Spe)$/i);
          if (m) slot.sp[m[2].toLowerCase()] = evToSp(parseInt(m[1], 10));
        });
      } else if (line.startsWith("-")) {
        moves.push(line.replace(/^-\s*/, "").trim());
      }
    }
    if (moves.length > 0) slot.moves = moves.slice(0, 4);
    parsedSlots.push(slot);
  }
  return parsedSlots;
}

window.openExportModal = function (mode) {
  state.modalMode = mode;
  document.getElementById("paste-modal").classList.remove("hidden");
  document.getElementById("modal-export-tabs").classList.remove("hidden");
  document.getElementById("modal-action-btn").textContent = "Sao chép vào Clipboard";
  switchExportModalMode(mode);
};

window.switchExportModalMode = function (mode) {
  state.modalMode = mode;
  const isRanked = mode === "ranked";
  document.getElementById("modal-title").textContent = isRanked
    ? "Xuất Team Đấu Rank (Full SP / EVs & Nature)"
    : "Xuất Team Đánh Giải OTS (Open Team Sheet — Giấu SP/EVs)";
  document.getElementById("modal-subtitle").textContent = isRanked
    ? "Đầy đủ Stat Points (0–32 SP), EV quy đổi và Nature để lưu trữ hoặc luyện tập"
    : "Đã ẩn toàn bộ SPs, EVs, IVs và Nature theo đúng luật giải đấu chính thức";

  document.getElementById("modal-tab-ranked").className = isRanked
    ? "flex-1 py-1.5 rounded-lg text-xs font-bold transition bg-sky-500 text-slate-950"
    : "flex-1 py-1.5 rounded-lg text-xs font-bold transition text-slate-300 hover:text-white";

  document.getElementById("modal-tab-ots").className = !isRanked
    ? "flex-1 py-1.5 rounded-lg text-xs font-bold transition bg-amber-500 text-slate-950"
    : "flex-1 py-1.5 rounded-lg text-xs font-bold transition text-slate-300 hover:text-white";

  document.getElementById("modal-paste-textarea").value = exportTeamToShowdown(mode);
};

window.openImportModal = function () {
  state.modalMode = "import";
  document.getElementById("paste-modal").classList.remove("hidden");
  document.getElementById("modal-export-tabs").classList.add("hidden");
  document.getElementById("modal-title").textContent = "Nhập Team từ Showdown Paste";
  document.getElementById("modal-subtitle").textContent = "Dán văn bản đội hình vào khung bên dưới để nạp vào team hiện tại";
  document.getElementById("modal-paste-textarea").value = "";
  document.getElementById("modal-action-btn").textContent = "Nạp vào Đội hình hiện tại";
};

window.closePasteModal = function () {
  document.getElementById("paste-modal").classList.add("hidden");
};

window.handleModalPrimaryAction = function () {
  const text = document.getElementById("modal-paste-textarea").value;
  if (state.modalMode === "import") {
    if (!text.trim()) {
      showToast("Vui lòng dán nội dung Showdown Paste!", "error");
      return;
    }
    getActiveTeam().slots = parseShowdownPaste(text);
    saveStore();
    renderAllBuilderUI();
    closePasteModal();
    showToast("Đã nhập đội hình thành công!");
  } else {
    copyTextToClipboard(text);
  }
};

// DAMAGE CALCULATOR ENGINE (CHAMPIONS LV.50 DOUBLES)
function getTypeEffectiveness(moveType, defTypes) {
  let mult = 1;
  const chart = TYPE_CHART[moveType] || {};
  defTypes.forEach(dt => {
    if (chart[dt] !== undefined) mult *= chart[dt];
  });
  return mult;
}

function getStageMultiplier(stage) {
  const s = Number(stage) || 0;
  return s >= 0 ? (2 + s) / 2 : 2 / (2 - s);
}

function populateFighterAbilityDropdown(side) {
  const sideObj = state.calc[side];
  const baseData = POKEDEX_MC[sideObj.species] || POKEDEX_MC["Incineroar"];
  const sel = document.getElementById(`calc-${side === "attacker" ? "atk" : "def"}-ability`);
  if (sideObj.isMega && baseData.mega) {
    sel.innerHTML = `<option value="${baseData.mega.ability}">${baseData.mega.ability}</option>`;
    sideObj.ability = baseData.mega.ability;
  } else {
    sel.innerHTML = baseData.abilities.map(a => `<option value="${a}">${a}</option>`).join("");
    if (!baseData.abilities.includes(sideObj.ability)) {
      sideObj.ability = baseData.abilities[0];
    }
    sel.value = sideObj.ability;
  }
}

function populateCalcTeamDropdowns() {
  const team = getActiveTeam();
  const opts = `<option value="">-- Nạp từ Team (${team.name}) --</option>` +
    team.slots.map((s, idx) => `<option value="${idx}">Slot ${idx + 1}: ${getEffectiveForm(s).name}</option>`).join("");
  document.getElementById("calc-atk-team-slot").innerHTML = opts;
  document.getElementById("calc-def-team-slot").innerHTML = opts;
}

function syncCalcInputsFromState() {
  const atk = state.calc.attacker;
  const def = state.calc.defender;
  const mv = state.calc.move;

  document.getElementById("calc-atk-species").value = atk.species;
  document.getElementById("calc-atk-mega").checked = Boolean(atk.isMega);
  populateFighterAbilityDropdown("attacker");
  document.getElementById("calc-atk-item").value = atk.item;
  document.getElementById("calc-atk-nature").value = atk.nature;
  document.getElementById("calc-atk-sp-atk").value = atk.sp.atk || 0;
  document.getElementById("calc-atk-sp-spa").value = atk.sp.spa || 0;

  document.getElementById("calc-def-species").value = def.species;
  document.getElementById("calc-def-mega").checked = Boolean(def.isMega);
  populateFighterAbilityDropdown("defender");
  document.getElementById("calc-def-item").value = def.item;
  document.getElementById("calc-def-nature").value = def.nature;
  document.getElementById("calc-def-sp-hp").value = def.sp.hp || 0;
  document.getElementById("calc-def-sp-def").value = def.sp.def || 0;
  document.getElementById("calc-def-sp-spd").value = def.sp.spd || 0;

  document.getElementById("calc-move-name").value = mv.name;
  document.getElementById("calc-move-bp").value = mv.bp;
  document.getElementById("calc-move-type").value = mv.type;
  document.getElementById("calc-move-cat").value = mv.cat;
}

window.sendCurrentToCalc = function (side) {
  const pkmn = getActivePokemon();
  state.calc[side] = {
    species: pkmn.species,
    isMega: Boolean(pkmn.isMega),
    item: pkmn.item,
    ability: pkmn.ability,
    nature: pkmn.nature,
    sp: { ...pkmn.sp },
    boosts: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }
  };
  const firstMove = pkmn.moves.find(m => MOVES_DB[m] && MOVES_DB[m].bp > 0);
  if (firstMove) {
    state.calc.move = {
      name: firstMove,
      bp: MOVES_DB[firstMove].bp,
      type: MOVES_DB[firstMove].type,
      cat: MOVES_DB[firstMove].cat
    };
  }
  switchMainTab("calc");
  syncCalcInputsFromState();
  runDamageCalculation();
  showToast(`Đã đưa ${getEffectiveForm(pkmn).name} sang Damage Calc!`);
};

window.loadTeamSlotToCalc = function (side, slotIdxStr) {
  if (slotIdxStr === "") return;
  const pkmn = getActiveTeam().slots[parseInt(slotIdxStr, 10)];
  state.calc[side] = {
    species: pkmn.species,
    isMega: Boolean(pkmn.isMega),
    item: pkmn.item,
    ability: pkmn.ability,
    nature: pkmn.nature,
    sp: { ...pkmn.sp },
    boosts: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }
  };
  if (side === "attacker") {
    const firstMove = pkmn.moves.find(m => MOVES_DB[m] && MOVES_DB[m].bp > 0);
    if (firstMove) {
      state.calc.move = {
        name: firstMove,
        bp: MOVES_DB[firstMove].bp,
        type: MOVES_DB[firstMove].type,
        cat: MOVES_DB[firstMove].cat
      };
    }
  }
  syncCalcInputsFromState();
  runDamageCalculation();
};

window.updateCalcSide = function (side, key, val) {
  state.calc[side][key] = val;
  if (key === "species") {
    state.calc[side].isMega = false;
    syncCalcInputsFromState();
  } else if (key === "isMega") {
    populateFighterAbilityDropdown(side);
  }
  runDamageCalculation();
};

window.updateCalcSp = function (side, stat, val) {
  state.calc[side].sp[stat] = Math.min(MAX_STAT_SP, Math.max(0, parseInt(val, 10) || 0));
  runDamageCalculation();
};

window.updateCalcBoost = function (side, stat, val) {
  state.calc[side].boosts[stat] = parseInt(val, 10) || 0;
  runDamageCalculation();
};

window.selectCalcMove = function (moveName) {
  const mv = MOVES_DB[moveName];
  state.calc.move.name = moveName;
  if (mv) {
    state.calc.move.bp = mv.bp;
    state.calc.move.type = mv.type;
    state.calc.move.cat = mv.cat;
    document.getElementById("calc-move-bp").value = mv.bp;
    document.getElementById("calc-move-type").value = mv.type;
    document.getElementById("calc-move-cat").value = mv.cat;
  }
  runDamageCalculation();
};

window.setFieldOption = function (fieldType, val) {
  state.calc.field[fieldType] = val;
  document.querySelectorAll(`[data-field-${fieldType}]`).forEach(btn => {
    const active = btn.getAttribute(`data-field-${fieldType}`) === val;
    btn.className = active
      ? "field-btn py-1.5 rounded-lg bg-sky-500 text-slate-950 font-bold"
      : "field-btn py-1.5 rounded-lg bg-slate-900 text-slate-300 border border-slate-700";
  });
  runDamageCalculation();
};

window.swapCalcSides = function () {
  const temp = state.calc.attacker;
  state.calc.attacker = state.calc.defender;
  state.calc.defender = temp;
  syncCalcInputsFromState();
  runDamageCalculation();
};

window.setDefBulkPreset = function (hp, def, spd, nature) {
  state.calc.defender.sp.hp = hp;
  state.calc.defender.sp.def = def;
  state.calc.defender.sp.spd = spd;
  state.calc.defender.nature = nature;
  syncCalcInputsFromState();
  runDamageCalculation();
};

window.runDamageCalculation = function () {
  const atkSide = state.calc.attacker;
  const defSide = state.calc.defender;
  const moveName = document.getElementById("calc-move-name").value;
  let effectiveBP = Number(document.getElementById("calc-move-bp").value) || 0;
  let moveType = document.getElementById("calc-move-type").value;
  const moveCat = document.getElementById("calc-move-cat").value;

  const isDoubles = document.getElementById("calc-is-doubles").checked;
  const isCrit = document.getElementById("calc-is-crit").checked;
  const isBurned = document.getElementById("calc-atk-burn").checked;
  const weather = state.calc.field.weather;
  const terrain = state.calc.field.terrain;
  const hasHelpingHand = document.getElementById("field-hh").checked;
  const hasReflect = document.getElementById("field-reflect").checked;
  const hasLightScreen = document.getElementById("field-lightscreen").checked;

  const atkBaseData = POKEDEX_MC[atkSide.species] || POKEDEX_MC["Incineroar"];
  const defBaseData = POKEDEX_MC[defSide.species] || POKEDEX_MC["Incineroar"];
  const atkForm = (atkSide.isMega && atkBaseData.mega) ? atkBaseData.mega : atkBaseData;
  const defForm = (defSide.isMega && defBaseData.mega) ? defBaseData.mega : defBaseData;

  const defMaxHP = calcChampionStat("hp", defForm.base.hp, defSide.sp.hp, defSide.nature);
  const isPhysical = moveCat === "Physical";
  const atkStatKey = isPhysical ? "atk" : "spa";
  const defStatKey = isPhysical ? "def" : "spd";

  let atkStat = calcChampionStat(atkStatKey, atkForm.base[atkStatKey], atkSide.sp[atkStatKey], atkSide.nature);
  let defStat = calcChampionStat(defStatKey, defForm.base[defStatKey], defSide.sp[defStatKey], defSide.nature);

  let atkStage = Number(atkSide.boosts[atkStatKey]) || 0;
  let defStage = Number(defSide.boosts[defStatKey]) || 0;
  if (isCrit && atkStage < 0) atkStage = 0;
  if (isCrit && defStage > 0) defStage = 0;

  atkStat = Math.floor(atkStat * getStageMultiplier(atkStage));
  defStat = Math.floor(defStat * getStageMultiplier(defStage));

  if (atkSide.ability === "Huge Power" && isPhysical) atkStat = Math.floor(atkStat * 2);
  if (atkSide.ability === "Guts" && isPhysical) atkStat = Math.floor(atkStat * 1.5);
  if (atkSide.item === "Choice Band" && isPhysical) atkStat = Math.floor(atkStat * 1.5);
  if (atkSide.item === "Choice Specs" && !isPhysical) atkStat = Math.floor(atkStat * 1.5);
  if (atkSide.ability === "Solar Power" && weather === "Sun" && !isPhysical) atkStat = Math.floor(atkStat * 1.5);

  if (defSide.item === "Assault Vest" && !isPhysical) defStat = Math.floor(defStat * 1.5);
  if (weather === "Sand" && defForm.types.includes("Rock") && !isPhysical) defStat = Math.floor(defStat * 1.5);
  if (weather === "Snow" && defForm.types.includes("Ice") && isPhysical) defStat = Math.floor(defStat * 1.5);

  // Aerilate / Pixilate / Tough Claws
  if ((atkSide.ability === "Aerilate" || atkSide.ability === "Pixilate") && moveType === "Normal") {
    moveType = atkSide.ability === "Aerilate" ? "Flying" : "Fairy";
    effectiveBP = Math.floor(effectiveBP * 1.2);
  }
  if (atkSide.ability === "Tough Claws" && isPhysical) effectiveBP = Math.floor(effectiveBP * 1.3);
  if (hasHelpingHand) effectiveBP = Math.floor(effectiveBP * 1.5);

  if (terrain === "Electric" && moveType === "Electric") effectiveBP = Math.floor(effectiveBP * 1.3);
  if (terrain === "Grassy" && moveType === "Grass") effectiveBP = Math.floor(effectiveBP * 1.3);
  if (terrain === "Psychic" && moveType === "Psychic") effectiveBP = Math.floor(effectiveBP * 1.3);
  if (terrain === "Misty" && moveType === "Dragon") effectiveBP = Math.floor(effectiveBP * 0.5);

  const baseDamage = Math.floor(Math.floor(Math.floor(22 * effectiveBP * atkStat / Math.max(1, defStat)) / 50) + 2);
  const moveInfo = MOVES_DB[moveName] || { spread: false };
  const spreadMult = (isDoubles && moveInfo.spread) ? 0.75 : 1.0;

  let weatherMult = 1.0;
  if (weather === "Sun") {
    if (moveType === "Fire") weatherMult = 1.5;
    if (moveType === "Water") weatherMult = 0.5;
  } else if (weather === "Rain") {
    if (moveType === "Water") weatherMult = 1.5;
    if (moveType === "Fire") weatherMult = 0.5;
  }

  const critMult = isCrit ? 1.5 : 1.0;
  const hasStab = atkForm.types.includes(moveType);
  const stabMult = hasStab ? (atkSide.ability === "Adaptability" ? 2.0 : 1.5) : 1.0;
  const typeEff = getTypeEffectiveness(moveType, defForm.types);
  const burnMult = (isBurned && isPhysical && atkSide.ability !== "Guts") ? 0.5 : 1.0;

  let screenMult = 1.0;
  if (!isCrit) {
    if (isPhysical && hasReflect) screenMult = isDoubles ? (2732 / 4096) : 0.5;
    if (!isPhysical && hasLightScreen) screenMult = isDoubles ? (2732 / 4096) : 0.5;
  }

  const lifeOrbMult = atkSide.item === "Life Orb" ? 1.3 : 1.0;
  const parentalMult = atkSide.ability === "Parental Bond" ? 1.25 : 1.0;

  const rolls = [];
  for (let r = 85; r <= 100; r++) {
    let d = baseDamage;
    d = Math.floor(d * spreadMult);
    d = Math.floor(d * weatherMult);
    d = Math.floor(d * critMult);
    d = Math.floor(d * (r / 100));
    d = Math.floor(d * stabMult);
    d = Math.floor(d * typeEff);
    d = Math.floor(d * burnMult);
    d = Math.floor(d * screenMult);
    d = Math.floor(d * lifeOrbMult);
    d = Math.floor(d * parentalMult);
    if (typeEff > 0 && d < 1) d = 1;
    rolls.push(d);
  }

  const minDmg = rolls[0];
  const maxDmg = rolls[15];
  const minPct = ((minDmg / defMaxHP) * 100).toFixed(1);
  const maxPct = ((maxDmg / defMaxHP) * 100).toFixed(1);
  const ohkoCount = rolls.filter(d => d >= defMaxHP).length;

  let verdict = "";
  if (typeEff === 0) verdict = "IMMUNE (0x - Vô hiệu)";
  else if (ohkoCount === 16) verdict = "GUARANTEED OHKO (100% 1-Hit KO)";
  else if (ohkoCount > 0) verdict = `${((ohkoCount / 16) * 100).toFixed(1)}% CHANCE TO OHKO (${ohkoCount}/16)`;
  else if (minDmg * 2 >= defMaxHP) verdict = "GUARANTEED 2HKO";
  else if (maxDmg * 2 >= defMaxHP) verdict = "POSSIBLE 2HKO";
  else verdict = `APPROX. ${Math.ceil(defMaxHP / Math.max(1, maxDmg))}HKO`;

  const atkDisplayName = atkForm.name || atkSide.species;
  const defDisplayName = defForm.name || defSide.species;

  document.getElementById("calc-move-badge").textContent = `${moveType} • ${moveCat} • ${effectiveBP} BP • ${typeEff}x Eff`;
  document.getElementById("calc-headline").textContent =
    `${atkDisplayName} ${moveName} vs. ${defDisplayName}: ${minDmg} - ${maxDmg} (${minPct}% - ${maxPct}%)`;
  document.getElementById("calc-subline").textContent =
    `Defender HP: ${defMaxHP} | Rolls: (${rolls.join(", ")})`;
  document.getElementById("calc-ko-verdict").textContent = verdict;

  const remMinPct = Math.max(0, 100 - parseFloat(maxPct));
  const remMaxPct = Math.max(0, 100 - parseFloat(minPct));
  document.getElementById("calc-hp-range-text").textContent = `${remMinPct.toFixed(1)}% - ${remMaxPct.toFixed(1)}%`;

  const barMin = document.getElementById("calc-hp-bar-min");
  const barMax = document.getElementById("calc-hp-bar-max");
  barMin.style.width = `${remMinPct}%`;
  barMax.style.width = `${remMaxPct}%`;
  barMin.className = `h-full rounded-full transition-all duration-300 relative z-10 ${
    remMinPct > 50 ? "bg-emerald-500" : remMinPct > 20 ? "bg-amber-400" : "bg-rose-500"
  }`;
};

// AI IMAGE SCANNER (GEMINI VISION)
window.saveGeminiKey = function (val) {
  localStorage.setItem("gemini_api_key", val.trim());
};

window.handleAiImageSelect = function (event) {
  const file = event.target.files?.[0];
  if (file) processImageFileForAI(file);
};

function processImageFileForAI(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const dataUrl = e.target.result;
    const previewImg = document.getElementById("ai-preview-img");
    previewImg.src = dataUrl;
    previewImg.classList.remove("hidden");
    document.getElementById("ai-upload-placeholder").classList.add("hidden");

    const [meta, base64] = dataUrl.split(",");
    const mimeMatch = meta.match(/data:(.*?);base64/);
    state.aiImageMime = mimeMatch ? mimeMatch[1] : "image/png";
    state.aiImageBase64 = base64;
    document.getElementById("btn-run-ai-scan").disabled = false;
  };
  reader.readAsDataURL(file);
}

window.addEventListener("paste", e => {
  if (document.getElementById("view-scanner").classList.contains("hidden")) return;
  const items = e.clipboardData?.items || [];
  for (const item of items) {
    if (item.type.startsWith("image/")) {
      const file = item.getAsFile();
      if (file) processImageFileForAI(file);
    }
  }
});

window.analyzeTeamImageWithAI = async function () {
  const apiKey = document.getElementById("ai-api-key").value.trim();
  if (!apiKey) {
    showToast("Vui lòng nhập Gemini API Key trước khi quét ảnh!", "error");
    return;
  }
  if (!state.aiImageBase64) return;

  saveGeminiKey(apiKey);
  const btn = document.getElementById("btn-run-ai-scan");
  const btnText = document.getElementById("ai-scan-btn-text");
  const outputArea = document.getElementById("ai-output-textarea");

  btn.disabled = true;
  btnText.textContent = "⏳ Đang phân tích đội hình bằng Gemini Vision AI...";

  const prompt = `Extract the 6 Pokémon from this Pokémon Champions Regulation M-C team screenshot into valid Pokémon Showdown Paste format.
Output ONLY the raw Showdown paste text without markdown code blocks or commentary.
Format each Pokémon as:
Species Name @ Held Item
Ability: Ability Name
Level: 50
- Move 1
- Move 2
- Move 3
- Move 4`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: state.aiImageMime, data: state.aiImageBase64 } }
          ]
        }]
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const result = await res.json();
    const candidateText = result?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    if (!candidateText) throw new Error("Không nhận diện được dữ liệu từ ảnh.");

    outputArea.value = candidateText.replace(/```[a-z]*\n?/gi, "").replace(/```/g, "").trim();
    showToast("AI đã nhận diện xong đội hình 6 Pokémon!");
  } catch (err) {
    showToast("Lỗi phân tích ảnh: " + err.message, "error");
  }

  btn.disabled = false;
  btnText.textContent = "✨ Quét ảnh nhận diện đội hình";
};

window.loadAiOutputToBuilder = function () {
  const text = document.getElementById("ai-output-textarea").value.trim();
  if (!text) {
    showToast("Chưa có dữ liệu Showdown Paste để nạp!", "error");
    return;
  }
  getActiveTeam().slots = parseShowdownPaste(text);
  saveStore();
  renderAllBuilderUI();
  switchMainTab("builder");
  showToast("Đã nạp toàn bộ 6 Pokémon vào Team Builder!");
};

// KHỞI TẠO ỨNG DỤNG
window.addEventListener("DOMContentLoaded", () => {
  const savedKey = localStorage.getItem("gemini_api_key");
  if (savedKey) document.getElementById("ai-api-key").value = savedKey;

  initStaticDropdowns();
  loadStore();
  renderAllBuilderUI();
  syncCalcInputsFromState();
  runDamageCalculation();
});
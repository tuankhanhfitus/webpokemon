// ============================================================================
// VGC TACTICS STUDIO — POKÉMON CHAMPIONS REGULATION M-C ENGINE
// ============================================================================

const STORAGE_KEY = "vgc_champions_mc_teams_v1";
const GEMINI_KEY_STORAGE = "vgc_champions_gemini_api_key";

const STAT_KEYS = ["hp", "atk", "def", "spa", "spd", "spe"];
const STAT_LABELS = {
  hp: "HP",
  atk: "Atk",
  def: "Def",
  spa: "SpA",
  spd: "SpD",
  spe: "Spe"
};

let appState = {
  lang: "vi",
  teams: [],
  currentTeamId: null,
  activeSlotIndex: 0,
  modalMode: "ranked", // 'ranked' | 'ots' | 'import'
  aiImageBase64: null,
  aiImageMime: "image/png",
  calc: {
    attacker: {
      species: "Garchomp",
      isMega: true,
      item: "Garchompite Z",
      ability: "Levitate",
      nature: "Timid",
      sp: { hp: 2, atk: 0, def: 0, spa: 32, spd: 0, spe: 32 },
      boosts: { atk: 0, spa: 0 }
    },
    defender: {
      species: "Incineroar",
      isMega: false,
      item: "Safety Goggles",
      ability: "Intimidate",
      nature: "Careful",
      sp: { hp: 32, atk: 0, def: 14, spa: 0, spd: 20, spe: 0 },
      boosts: { def: 0, spd: 0 }
    },
    moveName: "Earth Power",
    weather: "None",
    terrain: "None"
  }
};

// ============================================================================
// 1. INITIALIZATION & STORAGE
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
  loadSavedState();
  populateGlobalDropdowns();
  renderAllBuilderUI();
  initCalculatorUI();
  initAiScannerPasteListener();

  const savedApiKey = localStorage.getItem(GEMINI_KEY_STORAGE);
  if (savedApiKey) {
    document.getElementById("ai-api-key").value = savedApiKey;
  }
});

function loadSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.teams) && parsed.teams.length > 0) {
        appState.teams = parsed.teams;
        appState.currentTeamId = parsed.currentTeamId || parsed.teams[0].id;
        return;
      }
    }
  } catch (e) {
    console.warn("Failed to parse saved teams:", e);
  }

  const defaultTeam = {
    id: "team_" + Date.now(),
    name: "Reg M-C Meta Sample #1",
    slots: JSON.parse(JSON.stringify(DEFAULT_SAMPLE_TEAM))
  };
  appState.teams = [defaultTeam];
  appState.currentTeamId = defaultTeam.id;
  saveTeamsToStorage();
}

function saveTeamsToStorage() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        teams: appState.teams,
        currentTeamId: appState.currentTeamId
      })
    );
  } catch (e) {
    console.error("Storage save error:", e);
  }
}

function getCurrentTeam() {
  return appState.teams.find((t) => t.id === appState.currentTeamId) || appState.teams[0];
}

function getActivePokemon() {
  const team = getCurrentTeam();
  return team.slots[appState.activeSlotIndex];
}

// ============================================================================
// 2. CHAMPIONS STAT POINTS (SP 0-32 / MAX 66) & MEGA FORM HELPERS
// ============================================================================

function getEffectiveForm(speciesName, item, isMega) {
  const baseData = POKEDEX_MC[speciesName] || Object.values(POKEDEX_MC)[0];
  if (isMega && baseData.megas) {
    if (item && baseData.megas[item]) {
      return {
        isMegaActive: true,
        displayName: baseData.megas[item].name,
        sprite: baseData.megas[item].sprite,
        types: baseData.megas[item].types,
        base: baseData.megas[item].base,
        ability: baseData.megas[item].ability
      };
    }
    const fallbackStone = baseData.defaultMegaStone || Object.keys(baseData.megas)[0];
    if (fallbackStone && baseData.megas[fallbackStone]) {
      return {
        isMegaActive: true,
        displayName: baseData.megas[fallbackStone].name,
        sprite: baseData.megas[fallbackStone].sprite,
        types: baseData.megas[fallbackStone].types,
        base: baseData.megas[fallbackStone].base,
        ability: baseData.megas[fallbackStone].ability
      };
    }
  }
  return {
    isMegaActive: false,
    displayName: speciesName,
    sprite: baseData.sprite,
    types: baseData.types,
    base: baseData.base,
    ability: null
  };
}

function getSpriteUrl(spriteSlug) {
  return `https://play.pokemonshowdown.com/sprites/gen5/${spriteSlug}.png`;
}

// Pokémon Champions Lv.50 Stat Formula
function calcChampionsStat(statKey, baseVal, spVal, natureName) {
  const sp = Math.max(0, Math.min(32, parseInt(spVal, 10) || 0));
  if (statKey === "hp") {
    return baseVal === 1 ? 1 : baseVal + sp + 75;
  }
  const nat = NATURES[natureName] || NATURES.Serious;
  let mult = 1.0;
  if (nat.plus === statKey) mult = 1.1;
  if (nat.minus === statKey) mult = 0.9;
  return Math.floor((baseVal + sp + 20) * mult);
}

function spToShowdownEv(sp) {
  const s = Math.max(0, Math.min(32, parseInt(sp, 10) || 0));
  return s === 0 ? 0 : 8 * s - 4;
}

function showdownEvToSp(ev) {
  const e = Math.max(0, Math.min(252, parseInt(ev, 10) || 0));
  if (e <= 0) return 0;
  return Math.min(32, Math.floor((e + 4) / 8));
}

function getTotalSpUsed(spObj) {
  return STAT_KEYS.reduce((sum, k) => sum + (parseInt(spObj[k], 10) || 0), 0);
}

// ============================================================================
// 3. UI RENDERING — TEAM BUILDER
// ============================================================================

function populateGlobalDropdowns() {
  const speciesNames = Object.keys(POKEDEX_MC).sort();
  const moveNames = Object.keys(MOVES_DB).sort();
  const natureNames = Object.keys(NATURES);

  const speciesOptions = speciesNames
    .map((s) => `<option value="${s}">${s}</option>`)
    .join("");
  document.getElementById("sel-species").innerHTML = speciesOptions;
  document.getElementById("calc-atk-species").innerHTML = speciesOptions;
  document.getElementById("calc-def-species").innerHTML = speciesOptions;

  const itemOptions = ITEMS_MC.map((it) => `<option value="${it}">${it}</option>`).join("");
  document.getElementById("sel-item").innerHTML = itemOptions;
  document.getElementById("calc-atk-item").innerHTML = itemOptions;
  document.getElementById("calc-def-item").innerHTML = itemOptions;

  const natureOptions = natureNames
    .map((n) => `<option value="${n}">${NATURES[n].label}</option>`)
    .join("");
  document.getElementById("sel-nature").innerHTML = natureOptions;
  document.getElementById("calc-atk-nature").innerHTML = natureOptions;
  document.getElementById("calc-def-nature").innerHTML = natureOptions;

  const moveOptions = `<option value="">-- Không chọn --</option>` +
    moveNames.map((m) => `<option value="${m}">${m} (${MOVES_DB[m].type} · ${MOVES_DB[m].bp || "-"})</option>`).join("");

  const movesContainer = document.getElementById("moves-inputs-container");
  movesContainer.innerHTML = [0, 1, 2, 3]
    .map(
      (idx) => `
      <select id="sel-move-${idx}" onchange="updateActiveMove(${idx}, this.value)" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-white focus:outline-none focus:border-sky-500">
        ${moveOptions}
      </select>
    `
    )
    .join("");

  const calcMoveOptions = moveNames
    .filter((m) => MOVES_DB[m].bp > 0)
    .map((m) => `<option value="${m}">${m} (${MOVES_DB[m].type} · ${MOVES_DB[m].bp} BP)</option>`)
    .join("");
  document.getElementById("calc-move-name").innerHTML = calcMoveOptions;

  const typeOptions = ALL_TYPES.map((t) => `<option value="${t}">${t}</option>`).join("");
  document.getElementById("calc-move-type").innerHTML = typeOptions;
}

function renderAllBuilderUI() {
  renderTeamSelector();
  renderTeamRibbon();
  renderActivePokemonEditor();
  updateCalcTeamSlotDropdowns();
}

function renderTeamSelector() {
  const team = getCurrentTeam();
  const sel = document.getElementById("team-selector");
  sel.innerHTML = appState.teams
    .map((t) => `<option value="${t.id}" ${t.id === team.id ? "selected" : ""}>${t.name}</option>`)
    .join("");
  document.getElementById("team-name-input").value = team.name;
}

function renderTeamRibbon() {
  const team = getCurrentTeam();
  const container = document.getElementById("team-slots-ribbon");
  container.innerHTML = team.slots
    .map((mon, idx) => {
      const form = getEffectiveForm(mon.species, mon.item, mon.isMega);
      const isActive = idx === appState.activeSlotIndex;
      const totalSp = getTotalSpUsed(mon.sp);
      return `
        <button type="button" onclick="selectSlot(${idx})" class="slot-card text-left p-2.5 rounded-2xl bg-slate-900/80 border ${
          isActive ? "active-slot" : "border-slate-800 hover:border-slate-700"
        } flex flex-col justify-between gap-1.5 relative">
          <div class="flex items-center justify-between w-full">
            <span class="text-[10px] font-bold uppercase tracking-wider ${
              isActive ? "text-sky-400" : "text-slate-500"
            }">Slot ${idx + 1}</span>
            ${
              form.isMegaActive
                ? `<span class="px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-300 text-[9px] font-extrabold">MEGA</span>`
                : `<span class="text-[10px] font-mono text-slate-400">${totalSp}/66 SP</span>`
            }
          </div>
          <div class="flex items-center gap-2">
            <img src="${getSpriteUrl(form.sprite)}" alt="${form.displayName}" class="w-11 h-11 object-contain shrink-0" onerror="this.src='https://placehold.co/48x48/0f172a/38bdf8?text=PK'" />
            <div class="min-w-0 flex-1">
              <div class="text-xs font-extrabold text-white truncate">${mon.nickname || form.displayName}</div>
              <div class="text-[10px] text-slate-400 truncate">${mon.item !== "None" ? mon.item : "No Item"}</div>
            </div>
          </div>
        </button>
      `;
    })
    .join("");
}

function renderActivePokemonEditor() {
  const mon = getActivePokemon();
  const baseData = POKEDEX_MC[mon.species] || POKEDEX_MC["Garchomp"];
  const form = getEffectiveForm(mon.species, mon.item, mon.isMega);

  document.getElementById("editor-slot-num").textContent = appState.activeSlotIndex + 1;
  document.getElementById("editor-sprite").src = getSpriteUrl(form.sprite);
  document.getElementById("editor-types").innerHTML = form.types
    .map((t) => `<span class="type-badge type-${t}">${t}</span>`)
    .join("");

  document.getElementById("sel-species").value = mon.species;
  document.getElementById("input-nickname").value = mon.nickname || "";
  document.getElementById("input-gender").value = mon.gender || "";
  document.getElementById("sel-item").value = ITEMS_MC.includes(mon.item) ? mon.item : "None";
  document.getElementById("sel-nature").value = mon.nature || "Serious";

  // Mega Button state
  const megaBtn = document.getElementById("btn-mega");
  if (!baseData.megas) {
    megaBtn.disabled = true;
    megaBtn.className = "px-3 py-1.5 rounded-xl border text-xs font-extrabold transition flex items-center gap-1 mega-btn-disabled";
  } else {
    megaBtn.disabled = false;
    megaBtn.className = `px-3 py-1.5 rounded-xl border text-xs font-extrabold transition flex items-center gap-1 ${
      form.isMegaActive ? "mega-btn-active" : "mega-btn-ready"
    }`;
  }

  // Abilities dropdown
  const abilitySel = document.getElementById("sel-ability");
  if (form.isMegaActive && form.ability) {
    abilitySel.innerHTML = `<option value="${form.ability}" selected>${form.ability} (Mega)</option>`;
    mon.ability = form.ability;
  } else {
    abilitySel.innerHTML = baseData.abilities
      .map((ab) => `<option value="${ab}" ${ab === mon.ability ? "selected" : ""}>${ab}</option>`)
      .join("");
    if (!baseData.abilities.includes(mon.ability)) {
      mon.ability = baseData.abilities[0];
    }
  }

  // Moves dropdowns
  for (let i = 0; i < 4; i++) {
    const moveSel = document.getElementById(`sel-move-${i}`);
    if (moveSel) moveSel.value = mon.moves[i] || "";
  }

  // Stats & SP Rows
  renderStatAllocationRows(mon, form);
}

function renderStatAllocationRows(mon, form) {
  const totalSp = getTotalSpUsed(mon.sp);
  const rem = 66 - totalSp;
  const badge = document.getElementById("sp-remaining-badge");
  badge.textContent = `${rem} / 66`;
  badge.className = `font-mono text-sm font-bold ${
    rem === 0 ? "text-amber-400" : rem < 0 ? "text-rose-400" : "text-emerald-400"
  }`;

  const nat = NATURES[mon.nature] || NATURES.Serious;
  const container = document.getElementById("stats-rows-container");

  container.innerHTML = STAT_KEYS.map((key) => {
    const baseVal = form.base[key];
    const spVal = mon.sp[key] || 0;
    const evEq = spToShowdownEv(spVal);
    const finalStat = calcChampionsStat(key, baseVal, spVal, mon.nature);

    let natTag = "";
    let statColor = "text-white";
    if (nat.plus === key) {
      natTag = `<span class="text-rose-400 font-bold">+</span>`;
      statColor = "text-rose-300";
    } else if (nat.minus === key) {
      natTag = `<span class="text-sky-400 font-bold">-</span>`;
      statColor = "text-sky-300";
    }

    return `
      <div class="grid grid-cols-12 gap-1.5 items-center bg-slate-900/60 px-2.5 py-1.5 rounded-xl border border-slate-800/80">
        <div class="col-span-2 text-xs font-bold text-slate-300">${STAT_LABELS[key]}${natTag}</div>
        <div class="col-span-1 text-center font-mono text-xs text-slate-400">${baseVal}</div>
        <div class="col-span-5 flex items-center gap-2">
          <input type="range" min="0" max="32" value="${spVal}" oninput="updateStatSp('${key}', this.value)" class="sp-slider w-full" />
          <input type="number" min="0" max="32" value="${spVal}" onchange="updateStatSp('${key}', this.value)" class="w-11 bg-slate-950 border border-slate-700 rounded-lg px-1 py-0.5 text-center font-mono text-xs text-sky-300 font-bold" />
        </div>
        <div class="col-span-2 text-center font-mono text-[11px] text-slate-400">${evEq} EV</div>
        <div class="col-span-2 text-right font-mono text-sm font-extrabold ${statColor}">${finalStat}</div>
      </div>
    `;
  }).join("");
}

// ============================================================================
// 4. TEAM BUILDER ACTIONS
// ============================================================================

function selectSlot(idx) {
  appState.activeSlotIndex = idx;
  renderTeamRibbon();
  renderActivePokemonEditor();
}

function selectTeam(teamId) {
  appState.currentTeamId = teamId;
  appState.activeSlotIndex = 0;
  saveTeamsToStorage();
  renderAllBuilderUI();
}

function renameCurrentTeam(newName) {
  const trimmed = newName.trim();
  if (!trimmed) return;
  const team = getCurrentTeam();
  team.name = trimmed;
  saveTeamsToStorage();
  renderTeamSelector();
}

function createNewTeam() {
  const newTeam = {
    id: "team_" + Date.now(),
    name: `Team Reg M-C #${appState.teams.length + 1}`,
    slots: JSON.parse(JSON.stringify(DEFAULT_SAMPLE_TEAM))
  };
  appState.teams.push(newTeam);
  appState.currentTeamId = newTeam.id;
  appState.activeSlotIndex = 0;
  saveTeamsToStorage();
  renderAllBuilderUI();
  showToast("Đã tạo đội hình mới!");
}

function duplicateCurrentTeam() {
  const current = getCurrentTeam();
  const copy = {
    id: "team_" + Date.now(),
    name: `${current.name} (Copy)`,
    slots: JSON.parse(JSON.stringify(current.slots))
  };
  appState.teams.push(copy);
  appState.currentTeamId = copy.id;
  saveTeamsToStorage();
  renderAllBuilderUI();
  showToast("Đã nhân bản đội hình!");
}

function deleteCurrentTeam() {
  if (appState.teams.length <= 1) {
    showToast("Cần giữ lại ít nhất 1 đội hình!", "error");
    return;
  }
  appState.teams = appState.teams.filter((t) => t.id !== appState.currentTeamId);
  appState.currentTeamId = appState.teams[0].id;
  appState.activeSlotIndex = 0;
  saveTeamsToStorage();
  renderAllBuilderUI();
  showToast("Đã xóa đội hình.");
}

function changeActiveSpecies(newSpecies) {
  const mon = getActivePokemon();
  const data = POKEDEX_MC[newSpecies];
  if (!data) return;

  mon.species = newSpecies;
  mon.nickname = "";
  mon.isMega = false;
  mon.item = data.defaultMegaStone || "Focus Sash";
  mon.ability = data.abilities[0];
  mon.moves = [...data.defaultMoves];

  saveTeamsToStorage();
  renderTeamRibbon();
  renderActivePokemonEditor();
  updateCalcTeamSlotDropdowns();
}

function updateActivePokemon(field, value) {
  const mon = getActivePokemon();
  mon[field] = value;

  if (field === "item") {
    const baseData = POKEDEX_MC[mon.species];
    if (baseData && baseData.megas && baseData.megas[value]) {
      mon.isMega = true;
    } else if (baseData && (!baseData.megas || !baseData.megas[value])) {
      mon.isMega = false;
    }
  }

  saveTeamsToStorage();
  renderTeamRibbon();
  renderActivePokemonEditor();
  updateCalcTeamSlotDropdowns();
}

function toggleMegaForm() {
  const mon = getActivePokemon();
  const baseData = POKEDEX_MC[mon.species];
  if (!baseData || !baseData.megas) return;

  mon.isMega = !mon.isMega;
  if (mon.isMega) {
    if (!baseData.megas[mon.item]) {
      mon.item = baseData.defaultMegaStone || Object.keys(baseData.megas)[0];
    }
  } else {
    mon.ability = baseData.abilities[0];
  }

  saveTeamsToStorage();
  renderTeamRibbon();
  renderActivePokemonEditor();
}

function updateActiveMove(moveIdx, moveName) {
  const mon = getActivePokemon();
  mon.moves[moveIdx] = moveName;
  saveTeamsToStorage();
}

function updateStatSp(statKey, rawValue) {
  const mon = getActivePokemon();
  let val = Math.max(0, Math.min(32, parseInt(rawValue, 10) || 0));

  const otherUsed = STAT_KEYS.reduce(
    (sum, k) => (k === statKey ? sum : sum + (mon.sp[k] || 0)),
    0
  );
  if (otherUsed + val > 66) {
    val = Math.max(0, 66 - otherUsed);
  }

  mon.sp[statKey] = val;
  saveTeamsToStorage();
  renderTeamRibbon();
  renderActivePokemonEditor();
}

function applySpPreset(presetKey) {
  if (!presetKey) return;
  const mon = getActivePokemon();
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
    renderActivePokemonEditor();
  }
}

function clearCurrentSlot() {
  const team = getCurrentTeam();
  team.slots[appState.activeSlotIndex] = {
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
  saveTeamsToStorage();
  renderAllBuilderUI();
  showToast("Đã đặt lại Slot về mặc định.");
}

// ============================================================================
// 5. SHOWDOWN EXPORT (RANKED FULL VS TOURNAMENT OTS) & IMPORT PARSER
// ============================================================================

function formatTeamToShowdown(team, mode = "ranked") {
  return team.slots
    .map((mon) => {
      const form = getEffectiveForm(mon.species, mon.item, mon.isMega);
      const speciesOutput = mode === "ots" && form.isMegaActive ? form.displayName : mon.species;

      // Line 1: Name @ Item
      let header = "";
      if (mode === "ranked" && mon.nickname && mon.nickname.trim()) {
        header += `${mon.nickname.trim()} (${speciesOutput})`;
      } else {
        header += speciesOutput;
      }
      if (mode === "ranked" && mon.gender) {
        header += ` (${mon.gender})`;
      }
      if (mon.item && mon.item !== "None") {
        header += ` @ ${mon.item}`;
      }

      const lines = [header];
      lines.push(`Ability: ${mon.ability}`);
      lines.push(`Level: 50`);

      // Ranked mode includes full EVs (converted from SP 0-32) + SP comment + Nature
      if (mode === "ranked") {
        const evParts = [];
        const spParts = [];
        STAT_KEYS.forEach((k) => {
          const spVal = mon.sp[k] || 0;
          if (spVal > 0) {
            evParts.push(`${spToShowdownEv(spVal)} ${STAT_LABELS[k]}`);
            spParts.push(`${spVal} ${STAT_LABELS[k]}`);
          }
        });
        if (evParts.length > 0) {
          lines.push(`EVs: ${evParts.join(" / ")}`);
        }
        lines.push(`${mon.nature || "Serious"} Nature`);
      }

      // Moves
      (mon.moves || []).forEach((mv) => {
        if (mv && mv.trim()) {
          lines.push(`- ${mv.trim()}`);
        }
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

  const parsedSlots = blocks.map((block) => {
    const lines = block
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    let firstLine = lines[0];
    let item = "None";
    if (firstLine.includes("@")) {
      const parts = firstLine.split("@");
      firstLine = parts[0].trim();
      item = parts[1].trim();
    }

    let gender = "";
    if (firstLine.endsWith("(M)")) {
      gender = "M";
      firstLine = firstLine.slice(0, -3).trim();
    } else if (firstLine.endsWith("(F)")) {
      gender = "F";
      firstLine = firstLine.slice(0, -3).trim();
    }

    let nickname = "";
    let rawSpecies = firstLine;
    const parenMatch = firstLine.match(/^(.+?)\s*\(([^)]+)\)$/);
    if (parenMatch) {
      nickname = parenMatch[1].trim();
      rawSpecies = parenMatch[2].trim();
    }

    // Normalize Mega species name back to base species + isMega flag
    let species = "Garchomp";
    let isMega = false;
    const cleanTarget = rawSpecies.replace(/-Mega(-[XYZ])?$/i, "");
    const matchedKey = Object.keys(POKEDEX_MC).find(
      (k) => k.toLowerCase() === cleanTarget.toLowerCase() || k.toLowerCase() === rawSpecies.toLowerCase()
    );
    if (matchedKey) {
      species = matchedKey;
    }
    if (/-Mega/i.test(rawSpecies) || (POKEDEX_MC[species]?.megas && POKEDEX_MC[species].megas[item])) {
      isMega = true;
    }

    const baseData = POKEDEX_MC[species];
    let ability = baseData.abilities[0];
    let nature = "Serious";
    const sp = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
    const moves = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith("Ability:")) {
        ability = line.replace("Ability:", "").trim();
      } else if (line.startsWith("EVs:")) {
        const evStr = line.replace("EVs:", "").trim();
        evStr.split("/").forEach((seg) => {
          const m = seg.trim().match(/^(\d+)\s+(HP|Atk|Def|SpA|SpD|Spe)$/i);
          if (m) {
            const key = m[2].toLowerCase();
            sp[key] = showdownEvToSp(parseInt(m[1], 10));
          }
        });
      } else if (line.startsWith("SPs:")) {
        const spStr = line.replace("SPs:", "").trim();
        spStr.split("/").forEach((seg) => {
          const m = seg.trim().match(/^(\d+)\s+(HP|Atk|Def|SpA|SpD|Spe)$/i);
          if (m) {
            const key = m[2].toLowerCase();
            sp[key] = Math.min(32, parseInt(m[1], 10));
          }
        });
      } else if (line.endsWith("Nature")) {
        const natName = line.replace("Nature", "").trim();
        if (NATURES[natName]) nature = natName;
      } else if (line.startsWith("-")) {
        const mv = line.replace(/^-+\s*/, "").trim();
        if (mv && moves.length < 4) moves.push(mv);
      }
    }

    // Clamp total SP to 66 if imported EVs exceeded budget
    let runningTotal = 0;
    STAT_KEYS.forEach((k) => {
      if (runningTotal + sp[k] > 66) {
        sp[k] = Math.max(0, 66 - runningTotal);
      }
      runningTotal += sp[k];
    });

    while (moves.length < 4) {
      moves.push(baseData.defaultMoves[moves.length] || "Protect");
    }

    return {
      species,
      nickname,
      gender,
      item: ITEMS_MC.includes(item) ? item : "None",
      ability,
      nature,
      isMega,
      sp,
      moves
    };
  });

  // Pad to 6 slots if user pasted fewer than 6
  while (parsedSlots.length < 6) {
    parsedSlots.push(JSON.parse(JSON.stringify(DEFAULT_SAMPLE_TEAM[parsedSlots.length])));
  }

  return parsedSlots;
}

function openExportModal(mode) {
  appState.modalMode = mode;
  const modal = document.getElementById("paste-modal");
  const tabs = document.getElementById("modal-export-tabs");
  const textarea = document.getElementById("modal-paste-textarea");
  const actionBtn = document.getElementById("modal-action-btn");

  tabs.classList.remove("hidden");
  textarea.readOnly = true;
  actionBtn.textContent = "Sao chép vào Clipboard";

  switchExportModalMode(mode);
  modal.classList.remove("hidden");
}

function switchExportModalMode(mode) {
  appState.modalMode = mode;
  const team = getCurrentTeam();
  const textarea = document.getElementById("modal-paste-textarea");
  const tabRanked = document.getElementById("modal-tab-ranked");
  const tabOts = document.getElementById("modal-tab-ots");

  if (mode === "ranked") {
    document.getElementById("modal-title").textContent = "Xuất Team Đấu Rank (Đầy đủ SP / EVs)";
    document.getElementById("modal-subtitle").textContent = "Bao gồm Nature và chỉ số SP quy đổi chuẩn Showdown";
    tabRanked.className = "flex-1 py-1.5 rounded-lg text-xs font-bold transition bg-sky-500 text-slate-950";
    tabOts.className = "flex-1 py-1.5 rounded-lg text-xs font-bold transition text-slate-300 hover:text-white";
  } else {
    document.getElementById("modal-title").textContent = "Xuất Team Đánh Giải OTS (Giấu SP / EVs)";
    document.getElementById("modal-subtitle").textContent = "Chuẩn Open Team Sheet VGC: Chỉ hiện Species, Item, Ability & 4 Moves";
    tabOts.className = "flex-1 py-1.5 rounded-lg text-xs font-bold transition bg-amber-500 text-slate-950";
    tabRanked.className = "flex-1 py-1.5 rounded-lg text-xs font-bold transition text-slate-300 hover:text-white";
  }

  textarea.value = formatTeamToShowdown(team, mode);
}

function openImportModal() {
  appState.modalMode = "import";
  const modal = document.getElementById("paste-modal");
  document.getElementById("modal-export-tabs").classList.add("hidden");
  document.getElementById("modal-title").textContent = "Nhập Team từ Pokémon Showdown";
  document.getElementById("modal-subtitle").textContent = "Dán văn bản đội hình Showdown vào bên dưới (tự động quy đổi EVs sang SP 0–32)";

  const textarea = document.getElementById("modal-paste-textarea");
  textarea.readOnly = false;
  textarea.value = "";
  textarea.placeholder = "Dán Showdown Paste tại đây...";

  document.getElementById("modal-action-btn").textContent = "Nhập vào Đội hình hiện tại";
  modal.classList.remove("hidden");
}

function closePasteModal() {
  document.getElementById("paste-modal").classList.add("hidden");
}

function handleModalPrimaryAction() {
  const textarea = document.getElementById("modal-paste-textarea");
  if (appState.modalMode === "import") {
    const slots = parseShowdownPasteToSlots(textarea.value);
    if (!slots) {
      showToast("Không nhận diện được dữ liệu Showdown hợp lệ!", "error");
      return;
    }
    const team = getCurrentTeam();
    team.slots = slots;
    appState.activeSlotIndex = 0;
    saveTeamsToStorage();
    renderAllBuilderUI();
    closePasteModal();
    showToast("Đã nhập đội hình thành công!");
  } else {
    copyTextToClipboard(textarea.value);
  }
}

// ============================================================================
// 6. VGC DAMAGE CALCULATOR (CHAMPIONS LV.50 — 16 DAMAGE ROLLS)
// ============================================================================

function initCalculatorUI() {
  updateCalcTeamSlotDropdowns();
  syncCalcSideUI("attacker");
  syncCalcSideUI("defender");
  selectCalcMove(appState.calc.moveName);
}

function updateCalcTeamSlotDropdowns() {
  const team = getCurrentTeam();
  const options =
    `<option value="">Nạp từ Team...</option>` +
    team.slots
      .map((s, idx) => {
        const form = getEffectiveForm(s.species, s.item, s.isMega);
        return `<option value="${idx}">Slot ${idx + 1}: ${form.displayName}</option>`;
      })
      .join("");

  document.getElementById("calc-atk-team-slot").innerHTML = options;
  document.getElementById("calc-def-team-slot").innerHTML = options;
}

function sendCurrentToCalc(side) {
  loadTeamSlotToCalc(side, appState.activeSlotIndex);
  switchMainTab("calc");
}

function loadTeamSlotToCalc(side, slotIndex) {
  if (slotIndex === "" || slotIndex === null || slotIndex === undefined) return;
  const team = getCurrentTeam();
  const mon = team.slots[parseInt(slotIndex, 10)];
  if (!mon) return;

  const form = getEffectiveForm(mon.species, mon.item, mon.isMega);
  appState.calc[side] = {
    species: mon.species,
    isMega: mon.isMega,
    item: mon.item,
    ability: form.isMegaActive && form.ability ? form.ability : mon.ability,
    nature: mon.nature,
    sp: { ...mon.sp },
    boosts: { atk: 0, spa: 0, def: 0, spd: 0 }
  };

  syncCalcSideUI(side);

  if (side === "attacker") {
    const firstDamagingMove = (mon.moves || []).find((m) => MOVES_DB[m] && MOVES_DB[m].bp > 0);
    if (firstDamagingMove) {
      selectCalcMove(firstDamagingMove);
    }
  }
  runDamageCalculation();
}

function syncCalcSideUI(side) {
  const prefix = side === "attacker" ? "calc-atk" : "calc-def";
  const cfg = appState.calc[side];
  const baseData = POKEDEX_MC[cfg.species] || POKEDEX_MC["Garchomp"];
  const form = getEffectiveForm(cfg.species, cfg.item, cfg.isMega);

  document.getElementById(`${prefix}-species`).value = cfg.species;
  document.getElementById(`${prefix}-mega`).checked = !!cfg.isMega;
  document.getElementById(`${prefix}-item`).value = ITEMS_MC.includes(cfg.item) ? cfg.item : "None";
  document.getElementById(`${prefix}-nature`).value = cfg.nature;

  const abSel = document.getElementById(`${prefix}-ability`);
  const abilitiesList = form.isMegaActive && form.ability
    ? [form.ability, ...baseData.abilities]
    : baseData.abilities;
  const uniqueAbs = [...new Set(abilitiesList)];
  abSel.innerHTML = uniqueAbs.map((a) => `<option value="${a}">${a}</option>`).join("");
  if (uniqueAbs.includes(cfg.ability)) {
    abSel.value = cfg.ability;
  } else {
    cfg.ability = uniqueAbs[0];
    abSel.value = cfg.ability;
  }

  if (side === "attacker") {
    document.getElementById("calc-atk-sp-atk").value = cfg.sp.atk || 0;
    document.getElementById("calc-atk-sp-spa").value = cfg.sp.spa || 0;
    document.getElementById("calc-atk-boost-atk").value = cfg.boosts.atk || 0;
    document.getElementById("calc-atk-boost-spa").value = cfg.boosts.spa || 0;
  } else {
    document.getElementById("calc-def-sp-hp").value = cfg.sp.hp || 0;
    document.getElementById("calc-def-sp-def").value = cfg.sp.def || 0;
    document.getElementById("calc-def-sp-spd").value = cfg.sp.spd || 0;
    document.getElementById("calc-def-boost-def").value = cfg.boosts.def || 0;
    document.getElementById("calc-def-boost-spd").value = cfg.boosts.spd || 0;
  }
}

function updateCalcSide(side, field, value) {
  const cfg = appState.calc[side];
  cfg[field] = value;
  if (field === "species") {
    const data = POKEDEX_MC[value];
    cfg.isMega = false;
    cfg.item = "None";
    cfg.ability = data.abilities[0];
  }
  if (field === "isMega" && value) {
    const data = POKEDEX_MC[cfg.species];
    if (data.megas && !data.megas[cfg.item]) {
      cfg.item = data.defaultMegaStone || Object.keys(data.megas)[0];
    }
    const form = getEffectiveForm(cfg.species, cfg.item, true);
    if (form.ability) cfg.ability = form.ability;
  }
  syncCalcSideUI(side);
  runDamageCalculation();
}

function updateCalcSp(side, statKey, val) {
  appState.calc[side].sp[statKey] = Math.max(0, Math.min(32, parseInt(val, 10) || 0));
  runDamageCalculation();
}

function updateCalcBoost(side, statKey, val) {
  appState.calc[side].boosts[statKey] = parseInt(val, 10) || 0;
  runDamageCalculation();
}

function setDefBulkPreset(hp, def, spd, nature) {
  appState.calc.defender.sp.hp = hp;
  appState.calc.defender.sp.def = def;
  appState.calc.defender.sp.spd = spd;
  appState.calc.defender.nature = nature;
  syncCalcSideUI("defender");
  runDamageCalculation();
}

function setFieldOption(category, value) {
  appState.calc[category] = value;
  const attr = category === "weather" ? "data-field-weather" : "data-field-terrain";
  document.querySelectorAll(`[${attr}]`).forEach((btn) => {
    const isSelected = btn.getAttribute(attr) === value;
    btn.className = isSelected
      ? "field-btn py-1.5 rounded-lg bg-sky-500 text-slate-950 font-bold"
      : "field-btn py-1.5 rounded-lg bg-slate-900 text-slate-300 border border-slate-700";
  });
  runDamageCalculation();
}

function swapCalcSides() {
  const temp = JSON.parse(JSON.stringify(appState.calc.attacker));
  appState.calc.attacker = JSON.parse(JSON.stringify(appState.calc.defender));
  appState.calc.defender = temp;
  syncCalcSideUI("attacker");
  syncCalcSideUI("defender");
  runDamageCalculation();
}

function selectCalcMove(moveName) {
  appState.calc.moveName = moveName;
  const mv = MOVES_DB[moveName];
  if (!mv) return;
  document.getElementById("calc-move-name").value = moveName;
  document.getElementById("calc-move-bp").value = mv.bp;
  document.getElementById("calc-move-type").value = mv.type;
  document.getElementById("calc-move-cat").value = mv.cat === "Status" ? "Physical" : mv.cat;
  runDamageCalculation();
}

function applyStatStage(stat, stage, isCrit, isAttack) {
  if (isCrit) {
    if (isAttack && stage < 0) stage = 0;
    if (!isAttack && stage > 0) stage = 0;
  }
  if (stage >= 0) return Math.floor((stat * (2 + stage)) / 2);
  return Math.floor((stat * 2) / (2 - stage));
}

function getTypeEffectiveness(moveType, defTypes, defAbility) {
  if (moveType === "Ground" && defAbility === "Levitate") return 0;
  let mult = 1;
  defTypes.forEach((dt) => {
    const chartRow = TYPE_CHART[moveType] || {};
    const factor = chartRow[dt] !== undefined ? chartRow[dt] : 1;
    mult *= factor;
  });
  return mult;
}

function runDamageCalculation() {
  const atkCfg = appState.calc.attacker;
  const defCfg = appState.calc.defender;
  const atkForm = getEffectiveForm(atkCfg.species, atkCfg.item, atkCfg.isMega);
  const defForm = getEffectiveForm(defCfg.species, defCfg.item, defCfg.isMega);

  const moveName = document.getElementById("calc-move-name").value || "Earthquake";
  const moveMeta = MOVES_DB[moveName] || { bp: 100, type: "Normal", cat: "Physical", spread: false };
  let bp = parseInt(document.getElementById("calc-move-bp").value, 10) || 0;
  let moveType = document.getElementById("calc-move-type").value;
  const moveCat = document.getElementById("calc-move-cat").value;

  const isDoubles = document.getElementById("calc-is-doubles").checked;
  const isCrit = document.getElementById("calc-is-crit").checked;
  const isBurned = document.getElementById("calc-atk-burn").checked;
  const hasHH = document.getElementById("field-hh").checked;
  const hasReflect = document.getElementById("field-reflect").checked;
  const hasLightScreen = document.getElementById("field-lightscreen").checked;
  const weather = appState.calc.weather;
  const terrain = appState.calc.terrain;

  // Ability type conversions (Aerilate, Pixilate, Liquid Voice)
  if (moveType === "Normal" && atkCfg.ability === "Aerilate") {
    moveType = "Flying";
    bp = Math.floor(bp * 1.2);
  } else if (moveType === "Normal" && atkCfg.ability === "Pixilate") {
    moveType = "Fairy";
    bp = Math.floor(bp * 1.2);
  } else if (moveName === "Hyper Voice" && atkCfg.ability === "Liquid Voice") {
    moveType = "Water";
  }

  // Ability power boosts (Sharpness, Tough Claws)
  if (atkCfg.ability === "Sharpness" && moveMeta.slicing) {
    bp = Math.floor(bp * 1.5);
  }
  if (atkCfg.ability === "Tough Claws" && moveMeta.contact) {
    bp = Math.floor(bp * 1.3);
  }

  // Terrain power boosts
  if (terrain === "Electric" && moveType === "Electric") bp = Math.floor(bp * 1.3);
  if (terrain === "Grassy" && moveType === "Grass") bp = Math.floor(bp * 1.3);
  if (terrain === "Psychic" && moveType === "Psychic") bp = Math.floor(bp * 1.3);
  if (terrain === "Misty" && moveType === "Dragon") bp = Math.floor(bp * 0.5);
  if (terrain === "Grassy" && moveName === "Earthquake") bp = Math.floor(bp * 0.5);
  if (terrain === "Psychic" && moveName === "Expanding Force") bp = Math.floor(bp * 1.5);

  if (hasHH) bp = Math.floor(bp * 1.5);

  // Calculate Level 50 Champions Stats
  const defMaxHp = calcChampionsStat("hp", defForm.base.hp, defCfg.sp.hp, defCfg.nature);

  const isPhys = moveCat === "Physical";
  const atkStatKey = isPhys ? "atk" : "spa";
  const defStatKey = isPhys ? "def" : "spd";

  let rawAtk = calcChampionsStat(atkStatKey, atkForm.base[atkStatKey], atkCfg.sp[atkStatKey], atkCfg.nature);
  let rawDef = calcChampionsStat(defStatKey, defForm.base[defStatKey], defCfg.sp[defStatKey], defCfg.nature);

  rawAtk = applyStatStage(rawAtk, atkCfg.boosts[atkStatKey] || 0, isCrit, true);
  rawDef = applyStatStage(rawDef, defCfg.boosts[defStatKey] || 0, isCrit, false);

  // Item & Ability stat multipliers
  if (isPhys && atkCfg.item === "Choice Band") rawAtk = Math.floor(rawAtk * 1.5);
  if (!isPhys && atkCfg.item === "Choice Specs") rawAtk = Math.floor(rawAtk * 1.5);
  if (isPhys && atkCfg.ability === "Huge Power") rawAtk = rawAtk * 2;

  if (!isPhys && defCfg.item === "Assault Vest") rawDef = Math.floor(rawDef * 1.5);
  if (!isPhys && weather === "Sand" && defForm.types.includes("Rock")) rawDef = Math.floor(rawDef * 1.5);
  if (isPhys && weather === "Snow" && defForm.types.includes("Ice")) rawDef = Math.floor(rawDef * 1.5);

  // Base Damage Formula at Level 50
  const levelFactor = Math.floor((2 * 50) / 5) + 2; // 22
  let baseDamage = Math.floor(Math.floor((levelFactor * bp * rawAtk) / Math.max(1, rawDef)) / 50) + 2;

  // Spread Modifier (Doubles 0.75x)
  const isSpreadMove = moveMeta.spread || (moveName === "Expanding Force" && terrain === "Psychic");
  if (isDoubles && isSpreadMove) {
    baseDamage = Math.floor(baseDamage * 0.75);
  }

  // Weather Modifier
  if (weather === "Sun") {
    if (moveType === "Fire") baseDamage = Math.floor(baseDamage * 1.5);
    if (moveType === "Water") baseDamage = Math.floor(baseDamage * 0.5);
  } else if (weather === "Rain") {
    if (moveType === "Water") baseDamage = Math.floor(baseDamage * 1.5);
    if (moveType === "Fire") baseDamage = Math.floor(baseDamage * 0.5);
  }

  // Critical Hit (1.5x)
  if (isCrit) {
    baseDamage = Math.floor(baseDamage * 1.5);
  }

  // STAB & Type Effectiveness
  const hasStab = atkForm.types.includes(moveType);
  const stabMult = hasStab ? (atkCfg.ability === "Adaptability" ? 2.0 : 1.5) : 1.0;
  const typeEff = getTypeEffectiveness(moveType, defForm.types, defCfg.ability);

  // Defender Defensive Abilities (Thick Fat, Aura Guard, Multiscale, Filter)
  let defAbMult = 1.0;
  if (defCfg.ability === "Thick Fat" && (moveType === "Fire" || moveType === "Ice")) defAbMult *= 0.5;
  if (defCfg.ability === "Aura Guard" && moveMeta.contact) defAbMult *= 0.5;
  if (defCfg.ability === "Multiscale") defAbMult *= 0.5;
  if (defCfg.ability === "Filter" && typeEff > 1) defAbMult *= 0.75;

  // Screens (ignored on Crit)
  let screenMult = 1.0;
  if (!isCrit) {
    if (isPhys && hasReflect) screenMult = isDoubles ? 2 / 3 : 0.5;
    if (!isPhys && hasLightScreen) screenMult = isDoubles ? 2 / 3 : 0.5;
  }

  // Attacker Held Item Damage Multipliers
  let itemMult = 1.0;
  if (atkCfg.item === "Life Orb") itemMult *= 1.3;
  if (atkCfg.item === "Expert Belt" && typeEff > 1) itemMult *= 1.2;
  const typeBoostMap = {
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
  if (typeBoostMap[atkCfg.item] === moveType) itemMult *= 1.2;

  // Generate 16 Damage Rolls (85% to 100%)
  const rolls = [];
  for (let r = 85; r <= 100; r++) {
    let dmg = Math.floor((baseDamage * r) / 100);
    dmg = Math.floor(dmg * stabMult);
    dmg = Math.floor(dmg * typeEff);
    if (isPhys && isBurned && atkCfg.ability !== "Guts") {
      dmg = Math.floor(dmg * 0.5);
    }
    dmg = Math.floor(dmg * screenMult);
    dmg = Math.floor(dmg * defAbMult);
    dmg = Math.floor(dmg * itemMult);
    if (typeEff > 0 && dmg < 1) dmg = 1;
    rolls.push(dmg);
  }

  const minDmg = rolls[0];
  const maxDmg = rolls[15];
  const minPct = ((minDmg / defMaxHp) * 100).toFixed(1);
  const maxPct = ((maxDmg / defMaxHp) * 100).toFixed(1);

  // KO Calculation
  const ohkoRolls = rolls.filter((d) => d >= defMaxHp).length;
  let koVerdict = "";
  if (typeEff === 0) {
    koVerdict = "Miễn nhiễm (0% Damage)";
  } else if (ohkoRolls === 16) {
    koVerdict = "Guaranteed OHKO (100% hạ gục 1 hit)";
  } else if (ohkoRolls > 0) {
    const chance = ((ohkoRolls / 16) * 100).toFixed(1);
    koVerdict = `${chance}% Chance to OHKO (${ohkoRolls}/16 rolls)`;
  } else if (minDmg * 2 >= defMaxHp) {
    koVerdict = "Guaranteed 2HKO";
  } else if (maxDmg * 2 >= defMaxHp) {
    koVerdict = "Possible 2HKO";
  } else if (minDmg * 3 >= defMaxHp) {
    koVerdict = "Guaranteed 3HKO";
  } else {
    const hits = Math.ceil(defMaxHp / Math.max(1, maxDmg));
    koVerdict = `~${hits}HKO`;
  }

  // Update UI
  document.getElementById("calc-move-badge").textContent = `${moveType} · ${moveCat} · ${bp} BP (${typeEff}x)`;
  document.getElementById("calc-headline").textContent =
    `${atkForm.displayName} (${atkCfg.sp[atkStatKey]} SP) ${moveName} vs. ${defForm.displayName} (${defCfg.sp.hp} HP / ${defCfg.sp[defStatKey]} Def SP): ` +
    `${minDmg} - ${maxDmg} (${minPct}% - ${maxPct}%)`;
  document.getElementById("calc-subline").textContent = `Rolls (16): (${rolls.join(", ")})`;

  const remMinPct = Math.max(0, 100 - parseFloat(maxPct)).toFixed(1);
  const remMaxPct = Math.max(0, 100 - parseFloat(minPct)).toFixed(1);
  document.getElementById("calc-hp-range-text").textContent = `${remMinPct}% - ${remMaxPct}%`;

  const barMin = document.getElementById("calc-hp-bar-min");
  const barMax = document.getElementById("calc-hp-bar-max");
  barMin.style.width = `${remMinPct}%`;
  barMax.style.width = `${remMaxPct}%`;

  const barColor =
    parseFloat(remMinPct) <= 20
      ? "bg-rose-500"
      : parseFloat(remMinPct) <= 50
      ? "bg-amber-500"
      : "bg-emerald-500";
  barMin.className = `h-full ${barColor} rounded-full transition-all duration-300 relative z-10`;
  document.getElementById("calc-ko-verdict").textContent = koVerdict;
}

// ============================================================================
// 7. GEMINI VISION AI — 6-POKÉMON TEAM SCREENSHOT SCANNER
// ============================================================================

function saveGeminiKey(key) {
  localStorage.setItem(GEMINI_KEY_STORAGE, key.trim());
  showToast("Đã lưu Gemini API Key vào trình duyệt.");
}

function initAiScannerPasteListener() {
  window.addEventListener("paste", (e) => {
    const scannerView = document.getElementById("view-scanner");
    if (scannerView.classList.contains("hidden")) return;

    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) processSelectedImageFile(file);
        break;
      }
    }
  });
}

function handleAiImageSelect(event) {
  const file = event.target.files?.[0];
  if (file) processSelectedImageFile(file);
}

function processSelectedImageFile(file) {
  appState.aiImageMime = file.type || "image/png";
  const reader = new FileReader();
  reader.onload = () => {
    const dataUrl = reader.result;
    appState.aiImageBase64 = dataUrl.split(",")[1];

    const preview = document.getElementById("ai-preview-img");
    preview.src = dataUrl;
    preview.classList.remove("hidden");
    document.getElementById("ai-upload-placeholder").classList.add("hidden");
    document.getElementById("btn-run-ai-scan").disabled = false;
  };
  reader.readAsDataURL(file);
}

async function analyzeTeamImageWithAI() {
  const apiKey = document.getElementById("ai-api-key").value.trim();
  if (!apiKey) {
    showToast("Vui lòng nhập Gemini API Key trước khi quét ảnh!", "error");
    return;
  }
  if (!appState.aiImageBase64) {
    showToast("Vui lòng chọn hoặc dán ảnh đội hình 6 Pokémon!", "error");
    return;
  }

  const btn = document.getElementById("btn-run-ai-scan");
  const btnText = document.getElementById("ai-scan-btn-text");
  btn.disabled = true;
  btnText.textContent = "⏳ AI đang phân tích 6 Pokémon...";

  const prompt = `You are a competitive Pokémon Champions VGC Regulation M-C expert.
Inspect this team screenshot showing up to 6 Pokémon and output ONLY valid Pokémon Showdown export format (plain text, no markdown fences, no explanations).
Rules:
- Identify each Pokémon species accurately (use base species name like Garchomp, Lucario, Absol, Salamence, Baxcalibur, Golisopod, Sneasler, Rillaboom, Incineroar, Kingambit, etc., and put the Mega Stone like Garchompite Z, Lucarionite Z, Absolite Z, Salamencite, Baxcalibrite, Golisopodite after '@').
- Include Ability, Level: 50, and the 4 moves starting with '- '.
- If EVs/SPs or Nature are not visible in the screenshot, omit EVs/Nature (Open Team Sheet format).
- Separate each Pokémon with one blank line.`;

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
                { text: prompt },
                {
                  inline_data: {
                    mime_type: appState.aiImageMime,
                    data: appState.aiImageBase64
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

    const rawText =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleaned = rawText.replace(/```[a-z]*\n?/gi, "").replace(/```/g, "").trim();

    document.getElementById("ai-output-textarea").value = cleaned;
    showToast("Quét ảnh đội hình thành công!");
  } catch (err) {
    console.error(err);
    showToast(`Lỗi AI: ${err.message}`, "error");
  } finally {
    btn.disabled = false;
    btnText.textContent = "✨ Quét ảnh nhận diện đội hình";
  }
}

function loadAiOutputToBuilder() {
  const pasteText = document.getElementById("ai-output-textarea").value.trim();
  if (!pasteText) {
    showToast("Chưa có dữ liệu Showdown để nạp!", "error");
    return;
  }
  const slots = parseShowdownPasteToSlots(pasteText);
  if (!slots) {
    showToast("Định dạng chưa hợp lệ, vui lòng kiểm tra lại!", "error");
    return;
  }
  const team = getCurrentTeam();
  team.slots = slots;
  appState.activeSlotIndex = 0;
  saveTeamsToStorage();
  renderAllBuilderUI();
  switchMainTab("builder");
  showToast("Đã nạp 6 Pokémon từ AI vào Team Builder!");
}

// ============================================================================
// 8. NAVIGATION, LOCALIZATION & UTILITIES
// ============================================================================

function switchMainTab(tabName) {
  ["builder", "calc", "scanner"].forEach((t) => {
    const view = document.getElementById(`view-${t}`);
    const navBtn = document.getElementById(`nav-${t}`);
    if (t === tabName) {
      view.classList.remove("hidden");
      navBtn.className = "nav-tab px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all bg-sky-500 text-slate-950 shadow";
    } else {
      view.classList.add("hidden");
      navBtn.className = "nav-tab px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-all";
    }
  });

  if (tabName === "calc") {
    runDamageCalculation();
  }
}

const I18N = {
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
    tabScanner: "AI Scanner",
    currentTeam: "Current Team:",
    btnNewTeam: "New Team",
    btnClone: "Clone",
    btnImport: "Import Paste",
    btnExportRank: "Export Rank (Full SP/EVs)",
    btnExportOTS: "Export Tourney OTS (Hide SP)",
    lblItem: "Held Item",
    lblAbility: "Ability",
    lblPreset: "Quick SP Spread (Max 66)",
    lblMoves: "Moveset (4 Moves)",
    moveHint: "Select 4 Regulation M-C legal moves",
    btnSendAtk: "Send to Damage Calc (Attacker)",
    btnClearSlot: "Reset Slot",
    lblStatsTitle: "Stats & Stat Points (SP) Allocation",
    lblStatsSub: "Max 32 SP per stat • Fixed 31 IVs (Lv.50)",
    lblNature: "Nature / Stat Alignment"
  }
};

function toggleLanguage() {
  appState.lang = appState.lang === "vi" ? "en" : "vi";
  const dict = I18N[appState.lang];
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) el.textContent = dict[key];
  });
}

function copyTextToClipboard(text) {
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    showToast("Đã sao chép vào Clipboard!");
  });
}

function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  const colors =
    type === "error"
      ? "bg-rose-950/95 border-rose-500/60 text-rose-200"
      : "bg-slate-900/95 border-sky-500/60 text-sky-200";
  toast.className = `toast-enter px-4 py-2.5 rounded-xl border ${colors} text-xs font-semibold shadow-xl backdrop-blur-md`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.25s ease";
    setTimeout(() => toast.remove(), 250);
  }, 2600);
}
const STAT_KEYS = ["hp", "atk", "def", "spa", "spd", "spe"];
const STAT_LABELS = { hp: "HP", atk: "Atk", def: "Def", spa: "SpA", spd: "SpD", spe: "Spe" };
const MAX_STAT_SP = 32;
const MAX_TOTAL_SP = 66;
const STORAGE_KEY = "vgc_champions_mc_workspaces_v2";

let activeSlot = 0;
let exportMode = "ranked";

function createMon(speciesName = "Incineroar") {
  const data = POKEDEX_MC[speciesName] || POKEDEX_MC["Incineroar"];
  return {
    species: POKEDEX_MC[speciesName] ? speciesName : "Incineroar",
    isMega: false,
    item: data.mega ? data.mega.stone : "Sitrus Berry",
    ability: data.abilities[0],
    nature: "Adamant",
    moves: data.moves.slice(0, 4),
    sp: { hp: 32, atk: 0, def: 20, spa: 0, spd: 14, spe: 0 }
  };
}

function createDefaultRoster() {
  return [
    createMon("Incineroar"),
    { ...createMon("Garchomp"), isMega: true, item: "Garchompite", nature: "Jolly", sp: { hp: 2, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 } },
    { ...createMon("Rillaboom"), item: "Assault Vest", nature: "Adamant", sp: { hp: 32, atk: 32, def: 2, spa: 0, spd: 0, spe: 0 } },
    { ...createMon("Pelipper"), item: "Focus Sash", nature: "Timid", sp: { hp: 2, atk: 0, def: 0, spa: 32, spd: 0, spe: 32 } },
    { ...createMon("Basculegion"), item: "Choice Scarf", nature: "Adamant", sp: { hp: 2, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 } },
    { ...createMon("Amoonguss"), item: "Rocky Helmet", nature: "Bold", sp: { hp: 32, atk: 0, def: 22, spa: 0, spd: 12, spe: 0 } }
  ];
}

function loadInitialStore() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (raw && raw.teams && raw.currentId && raw.teams[raw.currentId] && Array.isArray(raw.teams[raw.currentId].roster)) {
      return raw;
    }
  } catch (e) {}
  return {
    currentId: "team-1",
    teams: {
      "team-1": {
        name: "Reg M-C Rain + Mega Garchomp",
        roster: createDefaultRoster()
      }
    }
  };
}

let store = loadInitialStore();

function getCurrentTeam() {
  return store.teams[store.currentId];
}

function saveStore() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

// CÔNG THỨC CHỈ SỐ POKÉMON CHAMPIONS LV.50 (31 IVs cố định + SP 0..32)
function calcChampionStat(statKey, baseVal, spVal, natureName) {
  if (statKey === "hp") return baseVal + 75 + spVal;
  let val = baseVal + 20 + spVal;
  const nat = NATURES[natureName] || NATURES.Serious;
  if (nat.up === statKey) val = Math.floor(val * 1.1);
  if (nat.down === statKey) val = Math.floor(val * 0.9);
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
  return `https://play.pokemonshowdown.com/sprites/gen5/${slug}.png`;
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

// RENDER THANH TEAM MANAGER & 6 SLOTS
function renderTeamSelector() {
  const sel = document.getElementById("team-selector");
  sel.innerHTML = Object.entries(store.teams)
    .map(([id, t]) => `<option value="${id}" ${id === store.currentId ? "selected" : ""}>${t.name}</option>`)
    .join("");
}

function renderRosterStrip() {
  const roster = getCurrentTeam().roster;
  const strip = document.getElementById("roster-strip");
  strip.innerHTML = roster.map((mon, idx) => {
    const form = getEffectiveForm(mon);
    const totalSp = getTotalSP(mon.sp);
    return `
      <button class="roster-card ${idx === activeSlot ? "active" : ""}" onclick="selectSlot(${idx})">
        <img src="${getSpriteUrl(form.slug)}" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png'" alt="${form.name}" />
        <div class="roster-info">
          <div class="roster-name">${form.name}</div>
          <div class="roster-item">${mon.item}</div>
          <span class="roster-sp-pill">${totalSp}/66 SP</span>
        </div>
      </button>
    `;
  }).join("");
}

function selectSlot(idx) {
  activeSlot = idx;
  renderRosterStrip();
  renderBuilderEditor();
}

// RENDER TEAM BUILDER EDITOR
function renderBuilderEditor() {
  const mon = getCurrentTeam().roster[activeSlot];
  const baseData = POKEDEX_MC[mon.species] || POKEDEX_MC["Incineroar"];
  const form = getEffectiveForm(mon);

  document.getElementById("slot-number").textContent = activeSlot + 1;
  const spriteImg = document.getElementById("editor-sprite");
  spriteImg.onerror = () => { spriteImg.src = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png"; };
  spriteImg.src = getSpriteUrl(form.slug);

  document.getElementById("sel-species").value = mon.species;
  document.getElementById("editor-types").innerHTML = form.types
    .map(t => `<span class="type-badge type-${t}">${t}</span>`)
    .join("");

  const megaWrap = document.getElementById("mega-switch-wrap");
  const chkMega = document.getElementById("chk-mega");
  if (baseData.mega) {
    megaWrap.classList.remove("disabled");
    chkMega.disabled = false;
    chkMega.checked = Boolean(mon.isMega);
  } else {
    megaWrap.classList.add("disabled");
    chkMega.disabled = true;
    chkMega.checked = false;
  }

  document.getElementById("sel-item").value = mon.item;

  const selAbility = document.getElementById("sel-ability");
  if (mon.isMega && baseData.mega) {
    selAbility.innerHTML = `<option value="${baseData.mega.ability}">${baseData.mega.ability} (Mega)</option>`;
  } else {
    selAbility.innerHTML = baseData.abilities.map(a => `<option value="${a}">${a}</option>`).join("");
    selAbility.value = mon.ability;
  }

  document.getElementById("sel-nature").value = mon.nature;
  document.getElementById("sel-preset").value = "";

  const allMoves = Object.keys(MOVES_DB);
  const movesGrid = document.getElementById("moves-grid");
  movesGrid.innerHTML = [0, 1, 2, 3].map(i => {
    const currentMove = mon.moves[i] || baseData.moves[0];
    const mInfo = MOVES_DB[currentMove] || { type: "Normal", cat: "Status", power: 0 };
    const options = allMoves.map(m => `<option value="${m}" ${m === currentMove ? "selected" : ""}>${m}</option>`).join("");
    return `
      <div class="move-slot-item">
        <select class="studio-select compact" style="width:100%" onchange="updateMove(${i}, this.value)">${options}</select>
        <div class="move-slot-meta">
          <span>${mInfo.type} · ${mInfo.cat}</span>
          <span>${mInfo.power > 0 ? mInfo.power + " BP" : "Status"}</span>
        </div>
      </div>
    `;
  }).join("");

  renderStatRows();
}

function renderStatRows() {
  const mon = getCurrentTeam().roster[activeSlot];
  const form = getEffectiveForm(mon);
  const nat = NATURES[mon.nature] || NATURES.Serious;
  const totalSp = getTotalSP(mon.sp);
  const remSp = MAX_TOTAL_SP - totalSp;

  document.getElementById("sp-used-text").textContent = totalSp;
  const remBadge = document.getElementById("sp-rem-badge");
  remBadge.textContent = `Còn lại: ${remSp} SP`;
  remBadge.className = `sp-rem-badge ${remSp === 0 ? "maxed" : ""}`;
  document.getElementById("sp-budget-fill").style.width = `${(totalSp / MAX_TOTAL_SP) * 100}%`;

  const container = document.getElementById("sp-rows-container");
  container.innerHTML = STAT_KEYS.map(k => {
    const spVal = mon.sp[k] || 0;
    const finalStat = calcChampionStat(k, form.base[k], spVal, mon.nature);
    const modClass = nat.up === k ? "stat-up" : (nat.down === k ? "stat-down" : "");
    const modMark = nat.up === k ? "+" : (nat.down === k ? "-" : "");
    return `
      <div class="sp-stat-row">
        <span class="stat-name-tag ${modClass}">${STAT_LABELS[k]}${modMark}</span>
        <span style="color:var(--text-muted)">${form.base[k]}</span>
        <input type="range" min="0" max="${MAX_STAT_SP}" value="${spVal}" oninput="updateSP('${k}', this.value)" />
        <input type="number" class="sp-num-input" min="0" max="${MAX_STAT_SP}" value="${spVal}" onchange="updateSP('${k}', this.value)" />
        <span class="ev-equiv">${spToEv(spVal)}</span>
        <span class="stat-final-val">${finalStat}</span>
      </div>
    `;
  }).join("");
}

function updateSP(statKey, rawVal) {
  const mon = getCurrentTeam().roster[activeSlot];
  let val = Math.max(0, Math.min(MAX_STAT_SP, parseInt(rawVal, 10) || 0));
  const otherTotal = STAT_KEYS.reduce((s, k) => k === statKey ? s : s + (mon.sp[k] || 0), 0);
  if (otherTotal + val > MAX_TOTAL_SP) {
    val = MAX_TOTAL_SP - otherTotal;
  }
  mon.sp[statKey] = val;
  saveStore();
  renderStatRows();
  renderRosterStrip();
}

function updateMove(moveIdx, moveName) {
  getCurrentTeam().roster[activeSlot].moves[moveIdx] = moveName;
  saveStore();
  renderBuilderEditor();
}

// DAMAGE CALCULATOR LOGIC
function getTypeEffectiveness(moveType, defTypes) {
  let mult = 1;
  defTypes.forEach(dt => {
    const chart = TYPE_CHART[moveType] || {};
    if (chart[dt] !== undefined) mult *= chart[dt];
  });
  return mult;
}

function syncFighterFromSlot(side, slotIdx) {
  if (slotIdx === "") return;
  const mon = getCurrentTeam().roster[Number(slotIdx)];
  const baseData = POKEDEX_MC[mon.species] || POKEDEX_MC["Incineroar"];
  document.getElementById(`${side}-species`).value = mon.species;
  document.getElementById(`${side}-mega`).checked = Boolean(mon.isMega && baseData.mega);
  populateFighterAbility(side);
  document.getElementById(`${side}-item`).value = mon.item;
  document.getElementById(`${side}-nature`).value = mon.nature;

  if (side === "atk") {
    const dmgMove = mon.moves.find(m => MOVES_DB[m] && MOVES_DB[m].power > 0);
    if (dmgMove) {
      document.getElementById("atk-move").value = dmgMove;
      const isPhys = MOVES_DB[dmgMove].cat === "Physical";
      document.getElementById("atk-sp").value = isPhys ? mon.sp.atk : mon.sp.spa;
    }
  } else {
    document.getElementById("def-hp-sp").value = mon.sp.hp;
    document.getElementById("def-def-sp").value = Math.max(mon.sp.def, mon.sp.spd);
  }
  calculateDamage();
}

function populateFighterAbility(side) {
  const spName = document.getElementById(`${side}-species`).value;
  const isMega = document.getElementById(`${side}-mega`).checked;
  const data = POKEDEX_MC[spName] || POKEDEX_MC["Incineroar"];
  const sel = document.getElementById(`${side}-ability`);
  if (isMega && data.mega) {
    sel.innerHTML = `<option value="${data.mega.ability}">${data.mega.ability}</option>`;
  } else {
    sel.innerHTML = data.abilities.map(a => `<option value="${a}">${a}</option>`).join("");
  }
}

function calculateDamage() {
  const atkName = document.getElementById("atk-species").value;
  const defName = document.getElementById("def-species").value;
  const moveName = document.getElementById("atk-move").value;
  const move = MOVES_DB[moveName];
  if (!move) return;

  const atkData = POKEDEX_MC[atkName] || POKEDEX_MC["Incineroar"];
  const defData = POKEDEX_MC[defName] || POKEDEX_MC["Incineroar"];
  const atkIsMega = document.getElementById("atk-mega").checked && Boolean(atkData.mega);
  const defIsMega = document.getElementById("def-mega").checked && Boolean(defData.mega);

  const atkForm = atkIsMega ? atkData.mega : atkData;
  const defForm = defIsMega ? defData.mega : defData;

  document.getElementById("atk-sprite").src = getSpriteUrl(atkForm.slug);
  document.getElementById("def-sprite").src = getSpriteUrl(defForm.slug);

  const atkSp = parseInt(document.getElementById("atk-sp").value, 10) || 0;
  const defHpSp = parseInt(document.getElementById("def-hp-sp").value, 10) || 0;
  const defDefSp = parseInt(document.getElementById("def-def-sp").value, 10) || 0;

  document.getElementById("atk-sp-val").textContent = atkSp;
  document.getElementById("def-hp-sp-val").textContent = defHpSp;
  document.getElementById("def-def-sp-val").textContent = defDefSp;

  const atkItem = document.getElementById("atk-item").value;
  const defItem = document.getElementById("def-item").value;
  const atkAbility = document.getElementById("atk-ability").value;
  const defAbility = document.getElementById("def-ability").value;
  const atkNature = document.getElementById("atk-nature").value;
  const defNature = document.getElementById("def-nature").value;

  const isPhys = move.cat === "Physical";
  const atkStatKey = isPhys ? "atk" : "spa";
  const defStatKey = isPhys ? "def" : "spd";

  let A = calcChampionStat(atkStatKey, atkForm.base[atkStatKey], atkSp, atkNature);
  let D = calcChampionStat(defStatKey, defForm.base[defStatKey], defDefSp, defNature);
  const maxHP = calcChampionStat("hp", defForm.base.hp, defHpSp, defNature);

  const atkStage = parseInt(document.getElementById("atk-stage").value, 10);
  const defStage = parseInt(document.getElementById("def-stage").value, 10);
  const crit = document.getElementById("calc-crit").checked;

  if (!crit || atkStage > 0) A = Math.floor(A * (atkStage >= 0 ? (2 + atkStage) / 2 : 2 / (2 - atkStage)));
  if (!crit || defStage < 0) D = Math.floor(D * (defStage >= 0 ? (2 + defStage) / 2 : 2 / (2 - defStage)));

  if (atkAbility === "Huge Power" && isPhys) A = Math.floor(A * 2);
  if (atkAbility === "Guts" && isPhys) A = Math.floor(A * 1.5);
  if (atkItem === "Choice Band" && isPhys) A = Math.floor(A * 1.5);
  if (atkItem === "Choice Specs" && !isPhys) A = Math.floor(A * 1.5);
  if (defItem === "Assault Vest" && !isPhys) D = Math.floor(D * 1.5);

  const weather = document.getElementById("calc-weather").value;
  if (atkAbility === "Solar Power" && weather === "Sun" && !isPhys) A = Math.floor(A * 1.5);
  if (weather === "Sand" && defForm.types.includes("Rock") && !isPhys) D = Math.floor(D * 1.5);
  if (weather === "Snow" && defForm.types.includes("Ice") && isPhys) D = Math.floor(D * 1.5);

  let moveType = move.type;
  let power = move.power;
  if ((atkAbility === "Aerilate" || atkAbility === "Pixilate") && move.type === "Normal") {
    moveType = atkAbility === "Aerilate" ? "Flying" : "Fairy";
    power = Math.floor(power * 1.2);
  }
  if (atkAbility === "Tough Claws" && isPhys) power = Math.floor(power * 1.3);

  let baseDmg = Math.floor(Math.floor(Math.floor(22 * power * (A / D)) / 50) + 2);

  if (move.spread && document.getElementById("calc-doubles").checked) {
    baseDmg = Math.floor(baseDmg * 0.75);
  }

  if (weather === "Sun") {
    if (moveType === "Fire") baseDmg = Math.floor(baseDmg * 1.5);
    if (moveType === "Water") baseDmg = Math.floor(baseDmg * 0.5);
  } else if (weather === "Rain") {
    if (moveType === "Water") baseDmg = Math.floor(baseDmg * 1.5);
    if (moveType === "Fire") baseDmg = Math.floor(baseDmg * 0.5);
  }

  const terrain = document.getElementById("calc-terrain").value;
  if (terrain === "Grassy" && moveType === "Grass") baseDmg = Math.floor(baseDmg * 1.3);
  if (terrain === "Electric" && moveType === "Electric") baseDmg = Math.floor(baseDmg * 1.3);
  if (terrain === "Psychic" && moveType === "Psychic") baseDmg = Math.floor(baseDmg * 1.3);

  if (crit) baseDmg = Math.floor(baseDmg * 1.5);

  const hasStab = atkForm.types.includes(moveType);
  const stabMult = hasStab ? (atkAbility === "Adaptability" ? 2.0 : 1.5) : 1.0;
  const typeEff = getTypeEffectiveness(moveType, defForm.types);
  const screenMult = (!crit && document.getElementById("calc-screen").checked) ? 0.66 : 1.0;
  const hhMult = document.getElementById("calc-hh").checked ? 1.5 : 1.0;
  const orbMult = atkItem === "Life Orb" ? 1.3 : 1.0;
  const parentalMult = atkAbility === "Parental Bond" ? 1.25 : 1.0;

  const rolls = [];
  for (let r = 85; r <= 100; r++) {
    let dmg = Math.floor((baseDmg * r) / 100);
    dmg = Math.floor(dmg * stabMult);
    dmg = Math.floor(dmg * typeEff);
    dmg = Math.floor(dmg * screenMult * hhMult * orbMult * parentalMult);
    if (typeEff > 0 && dmg < 1) dmg = 1;
    rolls.push(dmg);
  }

  const minDmg = rolls[0];
  const maxDmg = rolls[15];
  const minPct = ((minDmg / maxHP) * 100).toFixed(1);
  const maxPct = ((maxDmg / maxHP) * 100).toFixed(1);
  const koCount = rolls.filter(d => d >= maxHP).length;

  document.getElementById("dmg-headline").textContent =
    `${atkForm.name || atkName} (${moveName}) vs ${defForm.name || defName}: ${minPct}% - ${maxPct}%`;

  const koBadge = document.getElementById("dmg-ko-badge");
  if (koCount === 16) {
    koBadge.textContent = "100% OHKO";
    koBadge.className = "ko-pill lethal";
  } else if (koCount > 0) {
    koBadge.textContent = `${((koCount / 16) * 100).toFixed(1)}% OHKO (${koCount}/16)`;
    koBadge.className = "ko-pill lethal";
  } else if (minDmg * 2 >= maxHP) {
    koBadge.textContent = "Chắc chắn 2HKO";
    koBadge.className = "ko-pill";
  } else {
    koBadge.textContent = `Khắc hệ: ${typeEff}x`;
    koBadge.className = "ko-pill";
  }

  document.getElementById("hp-bar-min").style.width = `${Math.min(100, minPct)}%`;
  document.getElementById("hp-bar-max").style.width = `${Math.min(100, maxPct)}%`;
  document.getElementById("dmg-subtext").textContent =
    `Sát thương gây ra: ${minDmg} – ${maxDmg} / ${maxHP} HP (Hệ số hệ: ${typeEff}x)`;

  document.getElementById("dmg-rolls-grid").innerHTML = rolls
    .map(r => `<span class="roll-chip ${r >= maxHP ? "ko" : ""}">${r}</span>`)
    .join("");
}

// XUẤT / NHẬP SHOWDOWN (RANKED VS TOURNAMENT OTS)
function buildShowdownOutput(mode = "ranked") {
  return getCurrentTeam().roster.map(mon => {
    const form = getEffectiveForm(mon);
    const lines = [
      `${form.name} @ ${mon.item}`,
      `Ability: ${form.ability}`,
      `Level: 50`
    ];

    if (mode === "ranked") {
      const spList = STAT_KEYS.filter(k => mon.sp[k] > 0).map(k => `${mon.sp[k]} ${STAT_LABELS[k]}`);
      const evList = STAT_KEYS.filter(k => mon.sp[k] > 0).map(k => `${spToEv(mon.sp[k])} ${STAT_LABELS[k]}`);
      if (spList.length) {
        lines.push(`SPs: ${spList.join(" / ")}`);
        lines.push(`EVs: ${evList.join(" / ")}`);
      }
      lines.push(`${mon.nature} Nature`);
    }

    mon.moves.filter(Boolean).forEach(m => lines.push(`- ${m}`));
    return lines.join("\n");
  }).join("\n\n");
}

function parseShowdownInput(text) {
  const blocks = text.trim().split(/\n\s*\n/).filter(Boolean);
  if (!blocks.length) return;

  const newRoster = blocks.slice(0, 6).map(block => {
    const lines = block.split("\n").map(l => l.trim()).filter(Boolean);
    const [rawMon, rawItem] = lines[0].split("@").map(s => s.trim());
    const cleanName = rawMon.replace(/\s*\([MF]\)$/, "");
    const isMega = cleanName.includes("-Mega");
    const baseSpecies = cleanName.split("-Mega")[0];
    const validSpecies = POKEDEX_MC[baseSpecies] ? baseSpecies : "Incineroar";

    const mon = createMon(validSpecies);
    mon.isMega = isMega;
    if (rawItem) mon.item = rawItem;
    mon.sp = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
    const moves = [];

    lines.slice(1).forEach(line => {
      if (line.startsWith("Ability:")) {
        mon.ability = line.replace("Ability:", "").trim();
      } else if (line.endsWith("Nature")) {
        const nat = line.replace("Nature", "").trim();
        if (NATURES[nat]) mon.nature = nat;
      } else if (line.startsWith("SPs:")) {
        line.replace("SPs:", "").split("/").forEach(chunk => {
          const [val, label] = chunk.trim().split(" ");
          const key = Object.keys(STAT_LABELS).find(k => STAT_LABELS[k].toLowerCase() === (label || "").toLowerCase());
          if (key) mon.sp[key] = Math.min(MAX_STAT_SP, parseInt(val, 10) || 0);
        });
      } else if (line.startsWith("EVs:") && getTotalSP(mon.sp) === 0) {
        line.replace("EVs:", "").split("/").forEach(chunk => {
          const [val, label] = chunk.trim().split(" ");
          const key = Object.keys(STAT_LABELS).find(k => STAT_LABELS[k].toLowerCase() === (label || "").toLowerCase());
          if (key) mon.sp[key] = evToSp(parseInt(val, 10) || 0);
        });
      } else if (line.startsWith("-")) {
        moves.push(line.replace(/^-+\s*/, "").trim());
      }
    });

    if (moves.length) mon.moves = moves.slice(0, 4);
    return mon;
  });

  while (newRoster.length < 6) newRoster.push(createMon("Incineroar"));
  getCurrentTeam().roster = newRoster;
  saveStore();
  selectSlot(0);
}

// AI QUÉT ẢNH ĐỘI HÌNH 6 POKÉMON
let aiImageBase64 = null;
let aiImageMime = "image/png";

function handleImageFile(file) {
  if (!file || !file.type.startsWith("image/")) return;
  aiImageMime = file.type;
  const reader = new FileReader();
  reader.onload = () => {
    aiImageBase64 = reader.result.split(",")[1];
    const preview = document.getElementById("ai-image-preview");
    preview.src = reader.result;
    preview.classList.remove("hidden");
  };
  reader.readAsDataURL(file);
}

async function runGeminiTeamScan() {
  const apiKey = document.getElementById("gemini-api-key").value.trim();
  const logEl = document.getElementById("ai-log");
  if (!apiKey) {
    logEl.textContent = "Vui lòng nhập Gemini API Key trước khi phân tích.";
    return;
  }
  if (!aiImageBase64) {
    logEl.textContent = "Vui lòng chọn hoặc dán ảnh đội hình 6 Pokémon.";
    return;
  }

  localStorage.setItem("gemini_api_key", apiKey);
  logEl.textContent = "Đang phân tích ảnh đội hình bằng Gemini Vision...";

  const prompt = `Extract the 6 Pokémon from this Pokémon Champions Regulation M-C team screenshot into valid Pokémon Showdown Paste format.
Output ONLY the raw Showdown paste text without markdown code blocks or explanations.
Format:
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
            { inline_data: { mime_type: aiImageMime, data: aiImageBase64 } }
          ]
        }]
      })
    });
    const data = await res.json();
    const pasteText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    if (!pasteText) throw new Error("Không nhận diện được dữ liệu từ hình ảnh.");

    parseShowdownInput(pasteText);
    logEl.textContent = "Đã nạp thành công đội hình từ ảnh vào Team Builder!";
    switchTab("builder");
  } catch (err) {
    logEl.textContent = "Lỗi: " + err.message;
  }
}

// CHUYỂN TAB GIAO DIỆN
function switchTab(tabName) {
  document.querySelectorAll(".nav-tab").forEach(b => b.classList.toggle("active", b.dataset.tab === tabName));
  document.querySelectorAll(".tab-view").forEach(v => v.classList.toggle("active", v.id === `tab-${tabName}`));
  if (tabName === "export") {
    document.getElementById("showdown-io-box").value = buildShowdownOutput(exportMode);
  }
  if (tabName === "calculator") {
    calculateDamage();
  }
}

// KHỞI TẠO TOÀN BỘ SỰ KIỆN
document.addEventListener("DOMContentLoaded", () => {
  const speciesList = Object.keys(POKEDEX_MC);
  ["sel-species", "atk-species", "def-species"].forEach(id => {
    document.getElementById(id).innerHTML = speciesList.map(s => `<option value="${s}">${s}</option>`).join("");
  });

  ["sel-item", "atk-item", "def-item"].forEach(id => {
    document.getElementById(id).innerHTML = ITEMS_MC.map(i => `<option value="${i}">${i}</option>`).join("");
  });

  ["sel-nature", "atk-nature", "def-nature"].forEach(id => {
    document.getElementById(id).innerHTML = Object.entries(NATURES)
      .map(([k, v]) => `<option value="${k}">${v.label}</option>`)
      .join("");
  });

  document.getElementById("atk-move").innerHTML = Object.keys(MOVES_DB)
    .filter(m => MOVES_DB[m].power > 0)
    .map(m => `<option value="${m}">${m} (${MOVES_DB[m].power} BP · ${MOVES_DB[m].type})</option>`)
    .join("");

  const savedKey = localStorage.getItem("gemini_api_key");
  if (savedKey) document.getElementById("gemini-api-key").value = savedKey;

  document.querySelectorAll(".nav-tab").forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  document.getElementById("team-selector").addEventListener("change", e => {
    store.currentId = e.target.value;
    saveStore();
    selectSlot(0);
  });

  document.getElementById("btn-new-team").addEventListener("click", () => {
    const name = prompt("Nhập tên đội hình mới:", `Reg M-C Team #${Object.keys(store.teams).length + 1}`);
    if (!name) return;
    const id = "team-" + Date.now();
    store.teams[id] = { name, roster: createDefaultRoster() };
    store.currentId = id;
    saveStore();
    renderTeamSelector();
    selectSlot(0);
  });

  document.getElementById("btn-rename-team").addEventListener("click", () => {
    const current = getCurrentTeam();
    const name = prompt("Đổi tên đội hình:", current.name);
    if (!name) return;
    current.name = name;
    saveStore();
    renderTeamSelector();
  });

  document.getElementById("btn-delete-team").addEventListener("click", () => {
    const keys = Object.keys(store.teams);
    if (keys.length <= 1) {
      alert("Cần giữ lại ít nhất 1 đội hình.");
      return;
    }
    if (!confirm(`Xóa đội hình "${getCurrentTeam().name}"?`)) return;
    delete store.teams[store.currentId];
    store.currentId = Object.keys(store.teams)[0];
    saveStore();
    renderTeamSelector();
    selectSlot(0);
  });

  document.getElementById("sel-species").addEventListener("change", e => {
    getCurrentTeam().roster[activeSlot] = createMon(e.target.value);
    saveStore();
    renderRosterStrip();
    renderBuilderEditor();
  });

  document.getElementById("chk-mega").addEventListener("change", e => {
    const mon = getCurrentTeam().roster[activeSlot];
    const data = POKEDEX_MC[mon.species];
    mon.isMega = e.target.checked;
    if (mon.isMega && data.mega) mon.item = data.mega.stone;
    saveStore();
    renderRosterStrip();
    renderBuilderEditor();
  });

  document.getElementById("sel-item").addEventListener("change", e => {
    getCurrentTeam().roster[activeSlot].item = e.target.value;
    saveStore();
    renderRosterStrip();
  });

  document.getElementById("sel-ability").addEventListener("change", e => {
    getCurrentTeam().roster[activeSlot].ability = e.target.value;
    saveStore();
  });

  document.getElementById("sel-nature").addEventListener("change", e => {
    getCurrentTeam().roster[activeSlot].nature = e.target.value;
    saveStore();
    renderStatRows();
  });

  document.getElementById("sel-preset").addEventListener("change", e => {
    if (!e.target.value) return;
    const vals = e.target.value.split(",").map(Number);
    STAT_KEYS.forEach((k, i) => getCurrentTeam().roster[activeSlot].sp[k] = vals[i]);
    saveStore();
    renderStatRows();
    renderRosterStrip();
  });

  document.getElementById("btn-clear-sp").addEventListener("click", () => {
    STAT_KEYS.forEach(k => getCurrentTeam().roster[activeSlot].sp[k] = 0);
    saveStore();
    renderStatRows();
    renderRosterStrip();
  });

  document.getElementById("btn-send-to-calc").addEventListener("click", () => {
    syncFighterFromSlot("atk", activeSlot);
    switchTab("calculator");
  });

  document.getElementById("sync-atk-slot").addEventListener("change", e => syncFighterFromSlot("atk", e.target.value));
  document.getElementById("sync-def-slot").addEventListener("change", e => syncFighterFromSlot("def", e.target.value));

  ["atk", "def"].forEach(side => {
    document.getElementById(`${side}-species`).addEventListener("change", () => {
      document.getElementById(`${side}-mega`).checked = false;
      populateFighterAbility(side);
      calculateDamage();
    });
    document.getElementById(`${side}-mega`).addEventListener("change", () => {
      populateFighterAbility(side);
      calculateDamage();
    });
  });

  document.querySelectorAll("#tab-calculator select, #tab-calculator input").forEach(el => {
    el.addEventListener("input", calculateDamage);
    el.addEventListener("change", calculateDamage);
  });

  document.getElementById("btn-mode-ranked").addEventListener("click", () => {
    exportMode = "ranked";
    document.getElementById("btn-mode-ranked").classList.add("active");
    document.getElementById("btn-mode-ots").classList.remove("active");
    document.getElementById("export-desc").innerHTML =
      "<strong>Chế độ Đấu Rank:</strong> Hiển thị đầy đủ phân bổ Stat Points (0–32 SP), thông số EV quy đổi tương đương và Nature để luyện tập hoặc lưu trữ.";
    document.getElementById("showdown-io-box").value = buildShowdownOutput("ranked");
  });

  document.getElementById("btn-mode-ots").addEventListener("click", () => {
    exportMode = "ots";
    document.getElementById("btn-mode-ots").classList.add("active");
    document.getElementById("btn-mode-ranked").classList.remove("active");
    document.getElementById("export-desc").innerHTML =
      "<strong>Chế độ Đánh Giải OTS (Open Team Sheet):</strong> Tự động ẩn toàn bộ SPs, EVs, IVs và Nature để nộp danh sách thi đấu giải chính thức.";
    document.getElementById("showdown-io-box").value = buildShowdownOutput("ots");
  });

  document.getElementById("btn-copy-showdown").addEventListener("click", () => {
    navigator.clipboard.writeText(document.getElementById("showdown-io-box").value);
    alert("Đã sao chép Showdown Paste vào bộ nhớ tạm!");
  });

  document.getElementById("btn-import-showdown").addEventListener("click", () => {
    parseShowdownInput(document.getElementById("showdown-io-box").value);
    switchTab("builder");
  });

  document.getElementById("ai-file-input").addEventListener("change", e => handleImageFile(e.target.files[0]));
  window.addEventListener("paste", e => {
    const item = [...e.clipboardData.items].find(i => i.type.startsWith("image/"));
    if (item) handleImageFile(item.getAsFile());
  });
  document.getElementById("btn-analyze-ai").addEventListener("click", runGeminiTeamScan);

  populateFighterAbility("atk");
  populateFighterAbility("def");
  renderTeamSelector();
  renderRosterStrip();
  renderBuilderEditor();
  syncFighterFromSlot("atk", 1);
  syncFighterFromSlot("def", 0);
});
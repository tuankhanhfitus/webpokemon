const STAT_KEYS = ["hp", "atk", "def", "spa", "spd", "spe"];
const STAT_LABELS = { hp: "HP", atk: "Atk", def: "Def", spa: "SpA", spd: "SpD", spe: "Spe" };
const MAX_STAT_SP = 32;
const MAX_TOTAL_SP = 66;

let activeSlot = 0;
let exportMode = "ranked"; // "ranked" | "ots"
let team = JSON.parse(localStorage.getItem("champions_mc_team")) || createDefaultTeam();

function createDefaultMon(speciesName = "Incineroar") {
  const data = POKEDEX_MC[speciesName] || POKEDEX_MC["Incineroar"];
  return {
    species: speciesName,
    isMega: false,
    item: data.mega ? data.mega.stone : "Sitrus Berry",
    ability: data.abilities[0],
    nature: "Adamant",
    moves: data.moves.slice(0, 4),
    sp: { hp: 32, atk: 0, def: 20, spa: 0, spd: 14, spe: 0 }
  };
}

function createDefaultTeam() {
  return [
    createDefaultMon("Incineroar"),
    { ...createDefaultMon("Garchomp"), isMega: true, item: "Garchompite", nature: "Jolly", sp: { hp: 2, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 } },
    { ...createDefaultMon("Rillaboom"), item: "Assault Vest", nature: "Adamant", sp: { hp: 32, atk: 32, def: 2, spa: 0, spd: 0, spe: 0 } },
    { ...createDefaultMon("Pelipper"), item: "Focus Sash", nature: "Timid", sp: { hp: 2, atk: 0, def: 0, spa: 32, spd: 0, spe: 32 } },
    { ...createDefaultMon("Basculegion"), item: "Choice Scarf", nature: "Adamant", sp: { hp: 2, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 } },
    { ...createDefaultMon("Amoonguss"), item: "Rocky Helmet", nature: "Bold", sp: { hp: 32, atk: 0, def: 22, spa: 0, spd: 12, spe: 0 } }
  ];
}

function saveTeam() {
  localStorage.setItem("champions_mc_team", JSON.stringify(team));
}

// Công thức tính chỉ số Pokémon Champions Lv.50 (31 IVs cố định + SP 0..32)
function calcChampionStat(statKey, baseVal, spVal, natureName) {
  if (statKey === "hp") {
    return baseVal + 75 + spVal; // Floor((2*Base + 31)/2) + 60 + SP = Base + 75 + SP
  }
  let raw = baseVal + 20 + spVal; // Floor((2*Base + 31)/2) + 5 + SP = Base + 20 + SP
  const nat = NATURES[natureName] || NATURES.Serious;
  if (nat.up === statKey) raw = Math.floor(raw * 1.1);
  if (nat.down === statKey) raw = Math.floor(raw * 0.9);
  return raw;
}

function getEffectiveForm(mon) {
  const baseData = POKEDEX_MC[mon.species];
  if (mon.isMega && baseData.mega) {
    return {
      name: baseData.mega.name,
      id: baseData.id,
      types: baseData.mega.types,
      base: baseData.mega.base,
      ability: baseData.mega.ability
    };
  }
  return {
    name: mon.species,
    id: baseData.id,
    types: baseData.types,
    base: baseData.base,
    ability: mon.ability
  };
}

function getTotalSP(spObj) {
  return STAT_KEYS.reduce((sum, k) => sum + (Number(spObj[k]) || 0), 0);
}

// Khởi tạo dropdowns
function initDropdowns() {
  const speciesNames = Object.keys(POKEDEX_MC);
  const fills = ["sel-species", "atk-species", "def-species"];
  fills.forEach(id => {
    const el = document.getElementById(id);
    el.innerHTML = speciesNames.map(s => `<option value="${s}">${s}</option>`).join("");
  });

  ["sel-item", "atk-item", "def-item"].forEach(id => {
    const el = document.getElementById(id);
    el.innerHTML = ITEMS_MC.map(i => `<option value="${i}">${i}</option>`).join("");
  });

  ["sel-nature", "atk-nature", "def-nature"].forEach(id => {
    const el = document.getElementById(id);
    el.innerHTML = Object.entries(NATURES).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join("");
  });

  const allMoves = Object.keys(MOVES_DB);
  document.querySelectorAll(".move-select").forEach(sel => {
    sel.innerHTML = allMoves.map(m => `<option value="${m}">${m}</option>`).join("");
  });

  document.getElementById("atk-move").innerHTML = allMoves
    .filter(m => MOVES_DB[m].power > 0)
    .map(m => `<option value="${m}">${m} (${MOVES_DB[m].power} BP)</option>`).join("");
}

function renderTeamSlots() {
  const container = document.getElementById("team-slots");
  container.innerHTML = team.map((mon, idx) => {
    const form = getEffectiveForm(mon);
    const totalSp = getTotalSP(mon.sp);
    return `
      <button class="slot-btn ${idx === activeSlot ? "active" : ""}" onclick="selectSlot(${idx})">
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${form.id}.png" alt="${form.name}">
        <div class="slot-name">${form.name}</div>
        <div class="slot-sp">${totalSp}/66 SP</div>
      </button>
    `;
  }).join("");
}

function selectSlot(idx) {
  activeSlot = idx;
  renderEditor();
  renderTeamSlots();
}

function renderEditor() {
  const mon = team[activeSlot];
  const baseData = POKEDEX_MC[mon.species];
  const form = getEffectiveForm(mon);

  document.getElementById("sel-species").value = mon.species;
  document.getElementById("mon-sprite").src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${form.id}.png`;
  document.getElementById("mon-types").innerHTML = form.types.map(t => `<span class="type-pill">${t}</span>`).join("");

  const chkMega = document.getElementById("chk-mega");
  chkMega.disabled = !baseData.mega;
  chkMega.checked = Boolean(mon.isMega && baseData.mega);

  document.getElementById("sel-item").value = mon.item;
  const selAbility = document.getElementById("sel-ability");
  if (mon.isMega && baseData.mega) {
    selAbility.innerHTML = `<option value="${baseData.mega.ability}">${baseData.mega.ability} (Mega)</option>`;
  } else {
    selAbility.innerHTML = baseData.abilities.map(a => `<option value="${a}">${a}</option>`).join("");
    selAbility.value = mon.ability;
  }

  document.getElementById("sel-nature").value = mon.nature;
  document.querySelectorAll(".move-select").forEach((sel, i) => {
    sel.value = mon.moves[i] || baseData.moves[0];
  });

  renderSPRows();
}

function renderSPRows() {
  const mon = team[activeSlot];
  const form = getEffectiveForm(mon);
  const total = getTotalSP(mon.sp);
  const counterEl = document.getElementById("sp-counter");
  counterEl.textContent = `Đã dùng: ${total} / ${MAX_TOTAL_SP} SP (Còn lại: ${MAX_TOTAL_SP - total})`;
  counterEl.className = `sp-counter ${total === MAX_TOTAL_SP ? "full" : ""}`;

  const container = document.getElementById("sp-rows");
  container.innerHTML = STAT_KEYS.map(k => {
    const spVal = mon.sp[k] || 0;
    const finalStat = calcChampionStat(k, form.base[k], spVal, mon.nature);
    return `
      <div class="sp-row">
        <strong>${STAT_LABELS[k]}</strong>
        <span style="color:var(--muted)">${form.base[k]}</span>
        <input type="range" min="0" max="${MAX_STAT_SP}" value="${spVal}" oninput="updateSP('${k}', this.value)" />
        <input type="number" min="0" max="${MAX_STAT_SP}" value="${spVal}" onchange="updateSP('${k}', this.value)" />
        <span class="final-stat">${finalStat}</span>
      </div>
    `;
  }).join("");
}

function updateSP(statKey, rawVal) {
  const mon = team[activeSlot];
  let val = Math.max(0, Math.min(MAX_STAT_SP, parseInt(rawVal, 10) || 0));
  const otherSum = STAT_KEYS.reduce((s, k) => k === statKey ? s : s + (mon.sp[k] || 0), 0);
  if (otherSum + val > MAX_TOTAL_SP) {
    val = MAX_TOTAL_SP - otherSum;
  }
  mon.sp[statKey] = val;
  saveTeam();
  renderSPRows();
  renderTeamSlots();
}

// Chuyển đổi SP (0..32) <-> EV Showdown (0..252)
function spToShowdownEv(sp) {
  if (!sp || sp <= 0) return 0;
  return Math.min(252, sp * 8 - 4);
}
function showdownEvToSp(ev) {
  if (!ev || ev < 4) return 0;
  return Math.min(MAX_STAT_SP, Math.floor((ev + 4) / 8));
}

// XUẤT TEAM: RANKED (Đầy đủ SP/EVs + Nature) VS TOURNAMENT OTS (Giấu SP/EVs + Nature)
function generateShowdownText(mode = "ranked") {
  return team.map(mon => {
    const form = getEffectiveForm(mon);
    const lines = [];
    lines.push(`${form.name} @ ${mon.item}`);
    lines.push(`Ability: ${form.ability}`);
    lines.push(`Level: 50`);

    if (mode === "ranked") {
      const spParts = STAT_KEYS.filter(k => mon.sp[k] > 0).map(k => `${mon.sp[k]} ${STAT_LABELS[k]}`);
      const evParts = STAT_KEYS.filter(k => mon.sp[k] > 0).map(k => `${spToShowdownEv(mon.sp[k])} ${STAT_LABELS[k]}`);
      if (spParts.length) {
        lines.push(`SPs: ${spParts.join(" / ")}`);
        lines.push(`EVs: ${evParts.join(" / ")}`);
      }
      lines.push(`${mon.nature} Nature`);
    }
    // Chế độ OTS (Đánh giải): ẩn hoàn toàn SPs, EVs, IVs và Nature theo chuẩn Open Team Sheet

    mon.moves.filter(Boolean).forEach(m => lines.push(`- ${m}`));
    return lines.join("\n");
  }).join("\n\n");
}

function importFromShowdownText(rawText) {
  const blocks = rawText.trim().split(/\n\s*\n/);
  if (!blocks.length) return;

  const parsedTeam = blocks.slice(0, 6).map(block => {
    const lines = block.split("\n").map(l => l.trim()).filter(Boolean);
    const header = lines[0].split("@").map(s => s.trim());
    let rawName = header[0].replace(/\s*\([MF]\)$/, "");
    let isMega = rawName.includes("-Mega");
    let baseName = rawName.split("-Mega")[0];
    if (!POKEDEX_MC[baseName]) baseName = "Incineroar";

    const mon = createDefaultMon(baseName);
    mon.isMega = isMega;
    if (header[1]) mon.item = header[1];
    mon.sp = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
    const importedMoves = [];

    lines.slice(1).forEach(line => {
      if (line.startsWith("Ability:")) {
        mon.ability = line.replace("Ability:", "").trim();
      } else if (line.endsWith("Nature")) {
        const nat = line.replace("Nature", "").trim();
        if (NATURES[nat]) mon.nature = nat;
      } else if (line.startsWith("SPs:")) {
        line.replace("SPs:", "").split("/").forEach(part => {
          const [num, stat] = part.trim().split(" ");
          const key = Object.keys(STAT_LABELS).find(k => STAT_LABELS[k].toLowerCase() === (stat || "").toLowerCase());
          if (key) mon.sp[key] = Math.min(MAX_STAT_SP, parseInt(num, 10) || 0);
        });
      } else if (line.startsWith("EVs:") && getTotalSP(mon.sp) === 0) {
        line.replace("EVs:", "").split("/").forEach(part => {
          const [num, stat] = part.trim().split(" ");
          const key = Object.keys(STAT_LABELS).find(k => STAT_LABELS[k].toLowerCase() === (stat || "").toLowerCase());
          if (key) mon.sp[key] = showdownEvToSp(parseInt(num, 10) || 0);
        });
      } else if (line.startsWith("-")) {
        importedMoves.push(line.replace(/^-+\s*/, "").trim());
      }
    });

    if (importedMoves.length) mon.moves = importedMoves.slice(0, 4);
    return mon;
  });

  while (parsedTeam.length < 6) parsedTeam.push(createDefaultMon("Incineroar"));
  team = parsedTeam;
  saveTeam();
  selectSlot(0);
}

// TÍNH DAMAGE VGC DOUBLES LV.50
function getTypeEffectiveness(moveType, defTypes) {
  let mult = 1;
  defTypes.forEach(dt => {
    const chart = TYPE_CHART[moveType] || {};
    if (chart[dt] !== undefined) mult *= chart[dt];
  });
  return mult;
}

function runDamageCalculation() {
  const atkName = document.getElementById("atk-species").value;
  const defName = document.getElementById("def-species").value;
  const moveName = document.getElementById("atk-move").value;
  const move = MOVES_DB[moveName];
  if (!move || move.power === 0) return;

  const atkData = POKEDEX_MC[atkName];
  const defData = POKEDEX_MC[defName];
  const atkItem = document.getElementById("atk-item").value;
  const defItem = document.getElementById("def-item").value;
  const atkNature = document.getElementById("atk-nature").value;
  const defNature = document.getElementById("def-nature").value;

  const atkSp = Math.min(32, Math.max(0, parseInt(document.getElementById("atk-sp").value, 10) || 0));
  const defHpSp = Math.min(32, Math.max(0, parseInt(document.getElementById("def-hp-sp").value, 10) || 0));
  const defDefSp = Math.min(32, Math.max(0, parseInt(document.getElementById("def-def-sp").value, 10) || 0));

  const isPhys = move.cat === "Physical";
  const atkStatKey = isPhys ? "atk" : "spa";
  const defStatKey = isPhys ? "def" : "spd";

  const atkBase = (atkData.mega && atkItem === atkData.mega.stone) ? atkData.mega.base : atkData.base;
  const defBase = (defData.mega && defItem === defData.mega.stone) ? defData.mega.base : defData.base;
  const atkTypes = (atkData.mega && atkItem === atkData.mega.stone) ? atkData.mega.types : atkData.types;
  const defTypes = (defData.mega && defItem === defData.mega.stone) ? defData.mega.types : defData.types;

  let A = calcChampionStat(atkStatKey, atkBase[atkStatKey], atkSp, atkNature);
  let D = calcChampionStat(defStatKey, defBase[defStatKey], defDefSp, defNature);
  const maxHP = calcChampionStat("hp", defBase.hp, defHpSp, defNature);

  const atkStage = parseInt(document.getElementById("atk-stage").value, 10);
  const defStage = parseInt(document.getElementById("def-stage").value, 10);
  const crit = document.getElementById("calc-crit").checked;

  if (!crit || atkStage > 0) A = Math.floor(A * (atkStage >= 0 ? (2 + atkStage) / 2 : 2 / (2 - atkStage)));
  if (!crit || defStage < 0) D = Math.floor(D * (defStage >= 0 ? (2 + defStage) / 2 : 2 / (2 - defStage)));

  if (atkItem === "Choice Band" && isPhys) A = Math.floor(A * 1.5);
  if (atkItem === "Choice Specs" && !isPhys) A = Math.floor(A * 1.5);
  if (defItem === "Assault Vest" && !isPhys) D = Math.floor(D * 1.5);

  const weather = document.getElementById("calc-weather").value;
  if (weather === "Sand" && defTypes.includes("Rock") && !isPhys) D = Math.floor(D * 1.5);
  if (weather === "Snow" && defTypes.includes("Ice") && isPhys) D = Math.floor(D * 1.5);

  // Công thức sát thương cơ bản Lv.50
  let baseDamage = Math.floor(Math.floor(Math.floor(22 * move.power * (A / D)) / 50) + 2);

  // Spread damage trong Doubles (0.75x)
  if (move.spread) baseDamage = Math.floor(baseDamage * 0.75);

  // Thời tiết
  if (weather === "Sun") {
    if (move.type === "Fire") baseDamage = Math.floor(baseDamage * 1.5);
    if (move.type === "Water") baseDamage = Math.floor(baseDamage * 0.5);
  } else if (weather === "Rain") {
    if (move.type === "Water") baseDamage = Math.floor(baseDamage * 1.5);
    if (move.type === "Fire") baseDamage = Math.floor(baseDamage * 0.5);
  }

  if (crit) baseDamage = Math.floor(baseDamage * 1.5);

  // 16 rolls ngẫu nhiên (85% -> 100%)
  const stab = atkTypes.includes(move.type) ? 1.5 : 1;
  const typeEff = getTypeEffectiveness(move.type, defTypes);
  const screenMult = (!crit && document.getElementById("calc-screen").checked) ? 0.66 : 1;
  const hhMult = document.getElementById("calc-helping-hand").checked ? 1.5 : 1;
  const orbMult = atkItem === "Life Orb" ? 1.3 : 1;

  const rolls = [];
  for (let r = 85; r <= 100; r++) {
    let dmg = Math.floor((baseDamage * r) / 100);
    dmg = Math.floor(dmg * stab);
    dmg = Math.floor(dmg * typeEff);
    dmg = Math.floor(dmg * screenMult * hhMult * orbMult);
    if (typeEff > 0 && dmg < 1) dmg = 1;
    rolls.push(dmg);
  }

  const minDmg = rolls[0];
  const maxDmg = rolls[15];
  const minPct = ((minDmg / maxHP) * 100).toFixed(1);
  const maxPct = ((maxDmg / maxHP) * 100).toFixed(1);
  const koCount = rolls.filter(d => d >= maxHP).length;

  let verdict = `${minPct}% - ${maxPct}% HP`;
  if (koCount === 16) verdict += " — Chắc chắn OHKO (100%)";
  else if (koCount > 0) verdict += ` — Tỉ lệ OHKO: ${((koCount / 16) * 100).toFixed(1)}% (${koCount}/16 rolls)`;
  else if (minDmg * 2 >= maxHP) verdict += " — Chắc chắn 2HKO";

  document.getElementById("dmg-headline").textContent = `${atkName} (${moveName}) vs ${defName}: ${verdict}`;
  document.getElementById("hp-bar-fill").style.width = `${Math.min(100, maxPct)}%`;
  document.getElementById("hp-bar-fill").style.background = koCount > 0 ? "#ef4444" : "#10b981";
  document.getElementById("dmg-details").textContent = `Sát thương: ${minDmg} - ${maxDmg} / ${maxHP} HP (Hệ số khắc hệ: ${typeEff}x)`;
  document.getElementById("dmg-rolls").textContent = `16 Rolls: [${rolls.join(", ")}]`;
}

// AI VISION QUÉT ẢNH TEAM RA SHOWDOWN
let uploadedImageBase64 = null;
let uploadedMimeType = "image/png";

async function analyzeImageWithGemini() {
  const apiKey = document.getElementById("gemini-key").value.trim();
  const statusEl = document.getElementById("ai-status");
  if (!apiKey) {
    statusEl.textContent = "Vui lòng nhập Gemini API Key trước.";
    return;
  }
  if (!uploadedImageBase64) {
    statusEl.textContent = "Vui lòng chọn hoặc dán ảnh đội hình 6 Pokémon.";
    return;
  }

  localStorage.setItem("gemini_api_key", apiKey);
  statusEl.textContent = "Đang phân tích hình ảnh đội hình...";

  const prompt = `Identify the 6 Pokémon in this Pokémon Champions Regulation M-C team screenshot.
Return ONLY valid Pokémon Showdown Paste text (no markdown fences, no commentary).
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
            { inline_data: { mime_type: uploadedMimeType, data: uploadedImageBase64 } }
          ]
        }]
      })
    });
    const data = await res.json();
    const extracted = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    if (!extracted) throw new Error("Không trích xuất được dữ liệu từ ảnh.");

    importFromShowdownText(extracted);
    document.getElementById("modal-ai").classList.add("hidden");
    statusEl.textContent = "";
  } catch (err) {
    statusEl.textContent = "Lỗi phân tích: " + err.message;
  }
}

// GẮN SỰ KIỆN GIAO DIỆN
document.addEventListener("DOMContentLoaded", () => {
  initDropdowns();
  renderTeamSlots();
  renderEditor();
  runDamageCalculation();

  const savedKey = localStorage.getItem("gemini_api_key");
  if (savedKey) document.getElementById("gemini-key").value = savedKey;

  document.getElementById("sel-species").addEventListener("change", e => {
    team[activeSlot] = createDefaultMon(e.target.value);
    saveTeam();
    renderEditor();
    renderTeamSlots();
  });

  document.getElementById("chk-mega").addEventListener("change", e => {
    const mon = team[activeSlot];
    const baseData = POKEDEX_MC[mon.species];
    mon.isMega = e.target.checked;
    if (mon.isMega && baseData.mega) mon.item = baseData.mega.stone;
    saveTeam();
    renderEditor();
    renderTeamSlots();
  });

  document.getElementById("sel-item").addEventListener("change", e => { team[activeSlot].item = e.target.value; saveTeam(); });
  document.getElementById("sel-ability").addEventListener("change", e => { team[activeSlot].ability = e.target.value; saveTeam(); });
  document.getElementById("sel-nature").addEventListener("change", e => { team[activeSlot].nature = e.target.value; saveTeam(); renderSPRows(); });

  document.getElementById("sel-preset").addEventListener("change", e => {
    if (!e.target.value) return;
    const vals = e.target.value.split(",").map(Number);
    STAT_KEYS.forEach((k, idx) => team[activeSlot].sp[k] = vals[idx]);
    saveTeam();
    renderSPRows();
    renderTeamSlots();
  });

  document.querySelectorAll(".move-select").forEach(sel => {
    sel.addEventListener("change", e => {
      const idx = Number(e.target.dataset.move);
      team[activeSlot].moves[idx] = e.target.value;
      saveTeam();
    });
  });

  // Damage Calc listeners
  document.querySelectorAll(".calc-panel select, .calc-panel input").forEach(el => {
    el.addEventListener("change", runDamageCalculation);
    el.addEventListener("input", runDamageCalculation);
  });

  document.getElementById("btn-sync-attacker").addEventListener("click", () => {
    const mon = team[activeSlot];
    document.getElementById("atk-species").value = mon.species;
    document.getElementById("atk-item").value = mon.item;
    document.getElementById("atk-nature").value = mon.nature;
    const firstDamaging = mon.moves.find(m => MOVES_DB[m] && MOVES_DB[m].power > 0);
    if (firstDamaging) {
      document.getElementById("atk-move").value = firstDamaging;
      const isPhys = MOVES_DB[firstDamaging].cat === "Physical";
      document.getElementById("atk-sp").value = isPhys ? mon.sp.atk : mon.sp.spa;
    }
    runDamageCalculation();
  });

  // Modal Xuất / Nhập Showdown
  document.getElementById("btn-open-io").addEventListener("click", () => {
    document.getElementById("io-textarea").value = generateShowdownText(exportMode);
    document.getElementById("modal-io").classList.remove("hidden");
  });

  document.getElementById("tab-ranked").addEventListener("click", () => {
    exportMode = "ranked";
    document.getElementById("tab-ranked").classList.add("active");
    document.getElementById("tab-ots").classList.remove("active");
    document.getElementById("export-hint").textContent = "Chế độ Đấu Rank xuất đầy đủ SP (0-32), EV quy đổi và Nature.";
    document.getElementById("io-textarea").value = generateShowdownText("ranked");
  });

  document.getElementById("tab-ots").addEventListener("click", () => {
    exportMode = "ots";
    document.getElementById("tab-ots").classList.add("active");
    document.getElementById("tab-ranked").classList.remove("active");
    document.getElementById("export-hint").textContent = "Chế độ Đánh Giải (Open Team Sheet) tự động giấu toàn bộ SP, EVs và Nature.";
    document.getElementById("io-textarea").value = generateShowdownText("ots");
  });

  document.getElementById("btn-copy-paste").addEventListener("click", () => {
    navigator.clipboard.writeText(document.getElementById("io-textarea").value);
    alert("Đã sao chép danh sách đội hình!");
  });

  document.getElementById("btn-import-paste").addEventListener("click", () => {
    importFromShowdownText(document.getElementById("io-textarea").value);
    document.getElementById("modal-io").classList.add("hidden");
  });

  // Modal AI
  document.getElementById("btn-open-ai").addEventListener("click", () => {
    document.getElementById("modal-ai").classList.remove("hidden");
  });

  document.getElementById("ai-image-input").addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    uploadedMimeType = file.type;
    const reader = new FileReader();
    reader.onload = () => {
      uploadedImageBase64 = reader.result.split(",")[1];
      const img = document.getElementById("ai-preview");
      img.src = reader.result;
      img.classList.remove("hidden");
    };
    reader.readAsDataURL(file);
  });

  window.addEventListener("paste", e => {
    if (document.getElementById("modal-ai").classList.contains("hidden")) return;
    const item = [...e.clipboardData.items].find(i => i.type.startsWith("image/"));
    if (!item) return;
    const file = item.getAsFile();
    uploadedMimeType = file.type;
    const reader = new FileReader();
    reader.onload = () => {
      uploadedImageBase64 = reader.result.split(",")[1];
      const img = document.getElementById("ai-preview");
      img.src = reader.result;
      img.classList.remove("hidden");
    };
    reader.readAsDataURL(file);
  });

  document.getElementById("btn-run-ai").addEventListener("click", analyzeImageWithGemini);

  document.querySelectorAll(".btn-close").forEach(btn => {
    btn.addEventListener("click", () => document.getElementById(btn.dataset.close).classList.add("hidden"));
  });

  document.getElementById("btn-reset-team").addEventListener("click", () => {
    if (confirm("Khôi phục đội hình mặc định Regulation M-C?")) {
      team = createDefaultTeam();
      saveTeam();
      selectSlot(0);
    }
  });
});
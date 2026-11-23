// Pokémon Champions Regulation M-C complete selectable-roster extension.
// Data basis (checked 2026-11-23):
// https://pokemaps.net/games/champions/all-pokemon-and-items
// https://champions-news.pokemon-home.com/en/page/816.html
// Base stat/ability source for missing entries: Pokémon Showdown dex.
// Existing curated values in data.js ALWAYS take priority over this extension.
// A species without verified base stats is skipped (never fabricated).
(() => {
  "use strict";
  const ROSTER = [
  "Venusaur",
  "Charizard",
  "Blastoise",
  "Beedrill",
  "Pidgeot",
  "Arbok",
  "Pikachu",
  "Raichu",
  "Raichu-Alola",
  "Clefable",
  "Ninetales",
  "Ninetales-Alola",
  "Wigglytuff",
  "Vileplume",
  "Persian",
  "Persian-Alola",
  "Arcanine",
  "Arcanine-Hisui",
  "Alakazam",
  "Machamp",
  "Victreebel",
  "Slowbro",
  "Slowbro-Galar",
  "Farfetch'd",
  "Gengar",
  "Kangaskhan",
  "Starmie",
  "Mr. Mime",
  "Pinsir",
  "Tauros",
  "Tauros-Paldea-Combat",
  "Tauros-Paldea-Blaze",
  "Tauros-Paldea-Aqua",
  "Gyarados",
  "Ditto",
  "Vaporeon",
  "Jolteon",
  "Flareon",
  "Aerodactyl",
  "Snorlax",
  "Dragonite",
  "Meganium",
  "Typhlosion",
  "Typhlosion-Hisui",
  "Feraligatr",
  "Ariados",
  "Ampharos",
  "Azumarill",
  "Politoed",
  "Espeon",
  "Umbreon",
  "Slowking",
  "Slowking-Galar",
  "Forretress",
  "Steelix",
  "Qwilfish",
  "Scizor",
  "Heracross",
  "Skarmory",
  "Houndoom",
  "Tyranitar",
  "Sceptile",
  "Blaziken",
  "Swampert",
  "Pelipper",
  "Gardevoir",
  "Sableye",
  "Mawile",
  "Aggron",
  "Medicham",
  "Manectric",
  "Swalot",
  "Sharpedo",
  "Camerupt",
  "Torkoal",
  "Altaria",
  "Milotic",
  "Castform",
  "Banette",
  "Chimecho",
  "Absol",
  "Glalie",
  "Salamence",
  "Metagross",
  "Torterra",
  "Infernape",
  "Empoleon",
  "Staraptor",
  "Luxray",
  "Roserade",
  "Rampardos",
  "Bastiodon",
  "Lopunny",
  "Spiritomb",
  "Garchomp",
  "Lucario",
  "Hippowdon",
  "Toxicroak",
  "Abomasnow",
  "Weavile",
  "Rhyperior",
  "Leafeon",
  "Glaceon",
  "Gliscor",
  "Mamoswine",
  "Gallade",
  "Froslass",
  "Rotom",
  "Rotom-Heat",
  "Rotom-Wash",
  "Rotom-Frost",
  "Rotom-Fan",
  "Rotom-Mow",
  "Serperior",
  "Emboar",
  "Samurott",
  "Samurott-Hisui",
  "Watchog",
  "Liepard",
  "Simisage",
  "Simisear",
  "Simipour",
  "Musharna",
  "Excadrill",
  "Audino",
  "Conkeldurr",
  "Scolipede",
  "Whimsicott",
  "Krookodile",
  "Scrafty",
  "Cofagrigus",
  "Garbodor",
  "Zoroark",
  "Zoroark-Hisui",
  "Reuniclus",
  "Vanilluxe",
  "Emolga",
  "Eelektross",
  "Chandelure",
  "Beartic",
  "Stunfisk",
  "Stunfisk-Galar",
  "Golurk",
  "Hydreigon",
  "Volcarona",
  "Chesnaught",
  "Delphox",
  "Greninja",
  "Diggersby",
  "Talonflame",
  "Vivillon",
  "Pyroar",
  "Floette-Eternal",
  "Florges",
  "Gogoat",
  "Pangoro",
  "Furfrou",
  "Meowstic",
  "Meowstic-F",
  "Aegislash",
  "Aromatisse",
  "Slurpuff",
  "Malamar",
  "Barbaracle",
  "Dragalge",
  "Clawitzer",
  "Heliolisk",
  "Tyrantrum",
  "Aurorus",
  "Sylveon",
  "Hawlucha",
  "Dedenne",
  "Goodra",
  "Goodra-Hisui",
  "Klefki",
  "Trevenant",
  "Gourgeist",
  "Gourgeist-Small",
  "Gourgeist-Large",
  "Gourgeist-Super",
  "Avalugg",
  "Avalugg-Hisui",
  "Noivern",
  "Decidueye",
  "Decidueye-Hisui",
  "Incineroar",
  "Primarina",
  "Toucannon",
  "Crabominable",
  "Lycanroc",
  "Lycanroc-Midnight",
  "Lycanroc-Dusk",
  "Toxapex",
  "Mudsdale",
  "Araquanid",
  "Salazzle",
  "Tsareena",
  "Oranguru",
  "Passimian",
  "Golisopod",
  "Mimikyu",
  "Drampa",
  "Kommo-o",
  "Rillaboom",
  "Cinderace",
  "Inteleon",
  "Corviknight",
  "Thievul",
  "Flapple",
  "Appletun",
  "Sandaconda",
  "Toxtricity",
  "Toxtricity-Low-Key",
  "Grapploct",
  "Polteageist",
  "Hatterene",
  "Grimmsnarl",
  "Perrserker",
  "Sirfetch'd",
  "Mr. Rime",
  "Runerigus",
  "Alcremie",
  "Falinks",
  "Pincurchin",
  "Indeedee",
  "Indeedee-F",
  "Morpeko",
  "Dragapult",
  "Wyrdeer",
  "Kleavor",
  "Basculegion",
  "Basculegion-F",
  "Sneasler",
  "Overqwil",
  "Meowscarada",
  "Skeledirge",
  "Quaquaval",
  "Pawmot",
  "Maushold",
  "Arboliva",
  "Squawkabilly",
  "Squawkabilly-Blue",
  "Squawkabilly-Yellow",
  "Squawkabilly-White",
  "Garganacl",
  "Armarouge",
  "Ceruledge",
  "Bellibolt",
  "Mabosstiff",
  "Scovillain",
  "Espathra",
  "Tinkaton",
  "Palafin",
  "Orthworm",
  "Glimmora",
  "Houndstone",
  "Annihilape",
  "Farigiraf",
  "Kingambit",
  "Baxcalibur",
  "Gholdengo",
  "Sinistcha",
  "Archaludon",
  "Hydrapple"
];
  const MEGAS = [
  {
    "base": "Venusaur",
    "stone": "Venusaurite",
    "form": "Venusaur-Mega"
  },
  {
    "base": "Charizard",
    "stone": "Charizardite X",
    "form": "Charizard-Mega-X"
  },
  {
    "base": "Charizard",
    "stone": "Charizardite Y",
    "form": "Charizard-Mega-Y"
  },
  {
    "base": "Blastoise",
    "stone": "Blastoisinite",
    "form": "Blastoise-Mega"
  },
  {
    "base": "Beedrill",
    "stone": "Beedrillite",
    "form": "Beedrill-Mega"
  },
  {
    "base": "Pidgeot",
    "stone": "Pidgeotite",
    "form": "Pidgeot-Mega"
  },
  {
    "base": "Raichu",
    "stone": "Raichunite X",
    "form": "Raichu-Mega-X"
  },
  {
    "base": "Raichu",
    "stone": "Raichunite Y",
    "form": "Raichu-Mega-Y"
  },
  {
    "base": "Clefable",
    "stone": "Clefablite",
    "form": "Clefable-Mega"
  },
  {
    "base": "Alakazam",
    "stone": "Alakazite",
    "form": "Alakazam-Mega"
  },
  {
    "base": "Victreebel",
    "stone": "Victreebelite",
    "form": "Victreebel-Mega"
  },
  {
    "base": "Slowbro",
    "stone": "Slowbronite",
    "form": "Slowbro-Mega"
  },
  {
    "base": "Gengar",
    "stone": "Gengarite",
    "form": "Gengar-Mega"
  },
  {
    "base": "Kangaskhan",
    "stone": "Kangaskhanite",
    "form": "Kangaskhan-Mega"
  },
  {
    "base": "Starmie",
    "stone": "Starminite",
    "form": "Starmie-Mega"
  },
  {
    "base": "Pinsir",
    "stone": "Pinsirite",
    "form": "Pinsir-Mega"
  },
  {
    "base": "Gyarados",
    "stone": "Gyaradosite",
    "form": "Gyarados-Mega"
  },
  {
    "base": "Aerodactyl",
    "stone": "Aerodactylite",
    "form": "Aerodactyl-Mega"
  },
  {
    "base": "Dragonite",
    "stone": "Dragoninite",
    "form": "Dragonite-Mega"
  },
  {
    "base": "Meganium",
    "stone": "Meganiumite",
    "form": "Meganium-Mega"
  },
  {
    "base": "Feraligatr",
    "stone": "Feraligite",
    "form": "Feraligatr-Mega"
  },
  {
    "base": "Ampharos",
    "stone": "Ampharosite",
    "form": "Ampharos-Mega"
  },
  {
    "base": "Steelix",
    "stone": "Steelixite",
    "form": "Steelix-Mega"
  },
  {
    "base": "Scizor",
    "stone": "Scizorite",
    "form": "Scizor-Mega"
  },
  {
    "base": "Heracross",
    "stone": "Heracronite",
    "form": "Heracross-Mega"
  },
  {
    "base": "Skarmory",
    "stone": "Skarmorite",
    "form": "Skarmory-Mega"
  },
  {
    "base": "Houndoom",
    "stone": "Houndoominite",
    "form": "Houndoom-Mega"
  },
  {
    "base": "Tyranitar",
    "stone": "Tyranitarite",
    "form": "Tyranitar-Mega"
  },
  {
    "base": "Sceptile",
    "stone": "Sceptilite",
    "form": "Sceptile-Mega"
  },
  {
    "base": "Blaziken",
    "stone": "Blazikenite",
    "form": "Blaziken-Mega"
  },
  {
    "base": "Swampert",
    "stone": "Swampertite",
    "form": "Swampert-Mega"
  },
  {
    "base": "Gardevoir",
    "stone": "Gardevoirite",
    "form": "Gardevoir-Mega"
  },
  {
    "base": "Sableye",
    "stone": "Sablenite",
    "form": "Sableye-Mega"
  },
  {
    "base": "Mawile",
    "stone": "Mawilite",
    "form": "Mawile-Mega"
  },
  {
    "base": "Aggron",
    "stone": "Aggronite",
    "form": "Aggron-Mega"
  },
  {
    "base": "Medicham",
    "stone": "Medichamite",
    "form": "Medicham-Mega"
  },
  {
    "base": "Manectric",
    "stone": "Manectite",
    "form": "Manectric-Mega"
  },
  {
    "base": "Sharpedo",
    "stone": "Sharpedonite",
    "form": "Sharpedo-Mega"
  },
  {
    "base": "Camerupt",
    "stone": "Cameruptite",
    "form": "Camerupt-Mega"
  },
  {
    "base": "Altaria",
    "stone": "Altarianite",
    "form": "Altaria-Mega"
  },
  {
    "base": "Banette",
    "stone": "Banettite",
    "form": "Banette-Mega"
  },
  {
    "base": "Chimecho",
    "stone": "Chimechite",
    "form": "Chimecho-Mega"
  },
  {
    "base": "Absol",
    "stone": "Absolite",
    "form": "Absol-Mega"
  },
  {
    "base": "Absol",
    "stone": "Absolite Z",
    "form": "Absol-Mega-Z"
  },
  {
    "base": "Glalie",
    "stone": "Glalitite",
    "form": "Glalie-Mega"
  },
  {
    "base": "Salamence",
    "stone": "Salamencite",
    "form": "Salamence-Mega"
  },
  {
    "base": "Metagross",
    "stone": "Metagrossite",
    "form": "Metagross-Mega"
  },
  {
    "base": "Staraptor",
    "stone": "Staraptite",
    "form": "Staraptor-Mega"
  },
  {
    "base": "Lopunny",
    "stone": "Lopunnite",
    "form": "Lopunny-Mega"
  },
  {
    "base": "Garchomp",
    "stone": "Garchompite",
    "form": "Garchomp-Mega"
  },
  {
    "base": "Garchomp",
    "stone": "Garchompite Z",
    "form": "Garchomp-Mega-Z"
  },
  {
    "base": "Lucario",
    "stone": "Lucarionite",
    "form": "Lucario-Mega"
  },
  {
    "base": "Lucario",
    "stone": "Lucarionite Z",
    "form": "Lucario-Mega-Z"
  },
  {
    "base": "Abomasnow",
    "stone": "Abomasite",
    "form": "Abomasnow-Mega"
  },
  {
    "base": "Gallade",
    "stone": "Galladite",
    "form": "Gallade-Mega"
  },
  {
    "base": "Froslass",
    "stone": "Froslassite",
    "form": "Froslass-Mega"
  },
  {
    "base": "Emboar",
    "stone": "Emboarite",
    "form": "Emboar-Mega"
  },
  {
    "base": "Excadrill",
    "stone": "Excadrite",
    "form": "Excadrill-Mega"
  },
  {
    "base": "Audino",
    "stone": "Audinite",
    "form": "Audino-Mega"
  },
  {
    "base": "Scolipede",
    "stone": "Scolipite",
    "form": "Scolipede-Mega"
  },
  {
    "base": "Scrafty",
    "stone": "Scraftinite",
    "form": "Scrafty-Mega"
  },
  {
    "base": "Eelektross",
    "stone": "Eelektrossite",
    "form": "Eelektross-Mega"
  },
  {
    "base": "Chandelure",
    "stone": "Chandelurite",
    "form": "Chandelure-Mega"
  },
  {
    "base": "Golurk",
    "stone": "Golurkite",
    "form": "Golurk-Mega"
  },
  {
    "base": "Chesnaught",
    "stone": "Chesnaughtite",
    "form": "Chesnaught-Mega"
  },
  {
    "base": "Delphox",
    "stone": "Delphoxite",
    "form": "Delphox-Mega"
  },
  {
    "base": "Greninja",
    "stone": "Greninjite",
    "form": "Greninja-Mega"
  },
  {
    "base": "Pyroar",
    "stone": "Pyroarite",
    "form": "Pyroar-Mega"
  },
  {
    "base": "Floette-Eternal",
    "stone": "Floettite",
    "form": "Floette-Mega"
  },
  {
    "base": "Meowstic",
    "stone": "Meowsticite",
    "form": "Meowstic-Mega"
  },
  {
    "base": "Malamar",
    "stone": "Malamarite",
    "form": "Malamar-Mega"
  },
  {
    "base": "Barbaracle",
    "stone": "Barbaracite",
    "form": "Barbaracle-Mega"
  },
  {
    "base": "Dragalge",
    "stone": "Dragalgite",
    "form": "Dragalge-Mega"
  },
  {
    "base": "Hawlucha",
    "stone": "Hawluchanite",
    "form": "Hawlucha-Mega"
  },
  {
    "base": "Crabominable",
    "stone": "Crabominite",
    "form": "Crabominable-Mega"
  },
  {
    "base": "Golisopod",
    "stone": "Golisopite",
    "form": "Golisopod-Mega"
  },
  {
    "base": "Drampa",
    "stone": "Drampanite",
    "form": "Drampa-Mega"
  },
  {
    "base": "Falinks",
    "stone": "Falinksite",
    "form": "Falinks-Mega"
  },
  {
    "base": "Scovillain",
    "stone": "Scovillainite",
    "form": "Scovillain-Mega"
  },
  {
    "base": "Glimmora",
    "stone": "Glimmoranite",
    "form": "Glimmora-Mega"
  },
  {
    "base": "Baxcalibur",
    "stone": "Baxcalibrite",
    "form": "Baxcalibur-Mega"
  }
];
  const dexSource = (typeof BattlePokedex !== "undefined" && BattlePokedex) ||
    (typeof exports !== "undefined" && exports.BattlePokedex) ||
    globalThis.BattlePokedex || globalThis.exports?.BattlePokedex || {};
  const movesSource = (typeof BattleMovedex !== "undefined" && BattleMovedex) ||
    (typeof exports !== "undefined" && exports.BattleMovedex) ||
    globalThis.BattleMovedex || globalThis.exports?.BattleMovedex || {};
  const CACHE_KEY = 'vgc_champions_regmc_verified_dex_cache_v1';
  let cache = null;
  try {
    const rawCache = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    if (rawCache?.version === 1 && rawCache?.entries && typeof rawCache.entries === 'object') cache = rawCache;
  } catch (_) { /* Storage can be unavailable, keep the network-first path. */ }
  const toId = (name) => String(name).toLowerCase().replace(/[^a-z0-9]+/g, "");
  const types = new Set(ALL_TYPES);
  const normalizeBaseStats = s => {
    if (!s) return null;
    const keys = ["hp", "atk", "def", "spa", "spd", "spe"];
    const ret = {};
    for (const k of keys) {
      const n = Number(s[k]);
      if (!Number.isInteger(n) || n < 1 || n > 255) return null;
      ret[k] = n;
    }
    return ret;
  };
  // Current project uses a few human-readable aliases for battle-relevant forms.
  const spellings = {
    "Meowstic": "Meowstic", "Meowstic-F": "Meowstic-F",
    "Farfetch'd": "Farfetch'd", "Sirfetch'd": "Sirfetch'd",
    "Mr. Mime": "Mr. Mime", "Mr. Rime": "Mr. Rime",
    "Basculegion-F": "Basculegion-F",
    "Toxtricity-Low-Key": "Toxtricity-Low-Key"
  };
  const findDex = name => dexSource[toId(spellings[name] || name)] || null;
  // Fall back to old default moves only; new dex entries get generic *suggestions*
  // based on established known moves rather than unverified learnsets.
  const chooseMoves = (entry) => {
    const attacker = entry.base.atk >= entry.base.spa ? "Physical" : "Special";
    const pool = Object.entries(MOVES_DB).filter(([n, m]) =>
      m.bp > 0 && m.cat === attacker && entry.types.includes(m.type));
    pool.sort((a,b) => (b[1].bp || 0) - (a[1].bp || 0));
    const pick = [];
    for (const [name, move] of pool) {
      if (!pick.some(p => MOVES_DB[p].type === move.type)) pick.push(name);
      if (pick.length >= 2) break;
    }
    return [...pick, "Protect", "Protect", "Protect"].slice(0,4);
  };
  for (const name of ROSTER) {
    if (POKEDEX_MC[name]) continue;
    const cachedEntry = cache?.entries?.[name];
    const raw = findDex(name) || (cachedEntry ? {
      num: cachedEntry.dex, baseStats: cachedEntry.base,
      types: cachedEntry.types, abilities: Object.fromEntries(
        (cachedEntry.abilities || []).map((a,i) => [i,a]))
    } : null);
    if (!raw) continue;
    const base = normalizeBaseStats(raw.baseStats);
    const rawTypes = raw.types;
    if (!base || !Array.isArray(rawTypes) || !rawTypes.every(t => types.has(t))) continue;
    const abilities = Array.from(new Set(Object.values(raw.abilities || {}).filter(Boolean)));
    if (!abilities.length) continue;
    const entry = {dex: Number(raw.num || 0), sprite: ({"Mr. Mime":"mrmime", "Mr. Rime":"mrrime", "Farfetch'd":"farfetchd", "Sirfetch'd":"sirfetchd"})[name] || name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''),
      types: [...rawTypes], base, abilities, defaultMoves: []};
    entry.defaultMoves = chooseMoves(entry);
    POKEDEX_MC[name] = entry;
  }
  for (const {base, stone, form} of MEGAS) {
    const mon = POKEDEX_MC[base];
    if (!mon) continue;
    mon.megas ||= {};
    if (mon.megas[stone]) continue;
    const cachedMega = cache?.entries?.[base]?.megas?.[stone];
    const raw = findDex(form) || (cachedMega ? {
      baseStats: cachedMega.base, types: cachedMega.types,
      abilities: {0:cachedMega.ability}
    } : null);
    const stats = normalizeBaseStats(raw?.baseStats);
    if (!stats || !raw.types?.every(t => types.has(t))) continue;
    const ability = Object.values(raw.abilities || {}).filter(Boolean)[0];
    if (!ability) continue;
    const megaSprite = form.toLowerCase().replace(/-mega-([xyz])$/, '-mega$1');
    mon.megas[stone] = {name:form, sprite:megaSprite, fallbackSprite:mon.sprite,
      types: [...raw.types], base:stats, ability};
    mon.defaultMegaStone ||= stone;
  }
  // Add only the Showdown moves actually listed in the curated default moves.
  // This keeps the global move dropdown manageable and preserves existing mechanics.
  for (const species of Object.values(POKEDEX_MC)) {
    for (const moveName of species.defaultMoves || []) {
      if (MOVES_DB[moveName]) continue;
      const m = movesSource[toId(moveName)];
      if (!m || !types.has(m.type) || !["Physical", "Special", "Status"].includes(m.category)) continue;
      MOVES_DB[moveName] = {bp: Number(m.basePower || 0), type:m.type,
        cat:m.category, spread: ["allAdjacent", "allAdjacentFoes", "all"].includes(m.target),
        contact: Boolean(m.flags?.contact)};
    }
  }
  // Cache merged, verified fields so a subsequent reload survives a CDN outage.
  // Existing curated records always remain authoritative after cache restore.
  if (Object.keys(dexSource).length > 100) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({version:1,
        entries:Object.fromEntries(ROSTER.filter(n=>POKEDEX_MC[n]).map(n=>[n,POKEDEX_MC[n]]))}));
    } catch (_) { /* Nonessential offline cache */ }
  }
  const actual = ROSTER.filter(n => Boolean(POKEDEX_MC[n]));
  const validMegas = MEGAS.filter(m => Boolean(POKEDEX_MC[m.base]?.megas?.[m.stone]));
  const missing = ROSTER.filter(n => !POKEDEX_MC[n]);
  const missingMega = MEGAS.filter(m => !POKEDEX_MC[m.base]?.megas?.[m.stone]);
  globalThis.CHAMPIONS_MC_ROSTER_REPORT = Object.freeze({
    eligibleSpeciesCount:231, selectableFormsExpected:ROSTER.length,
    selectableFormsLoaded:actual.length, megasExpected:MEGAS.length, megasLoaded:validMegas.length,
    missingSpecies:missing, missingMegaStones:missingMega.map(m=>m.stone),
    sourceLoaded:Object.keys(dexSource).length>100
  });
  if (missing.length || missingMega.length) console.warn('[Champions M-C] Missing verified data:',
    globalThis.CHAMPIONS_MC_ROSTER_REPORT);
})();

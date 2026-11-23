// Extra forms checked against Bulbapedia's 'List of Pokémon in Pokémon Champions'
// (2026-11-23). Preserves the old M-C entries, only extends missing forms.
(() => {
  "use strict";
  const FORMS = [
  {
    "base": "Vivillon",
    "name": "Vivillon-icysnow",
    "display": "Vivillon (Icy Snow Pattern)",
    "sprite": "vivillon-icysnow",
    "types": null,
    "availability": "transfer",
    "special": null
  },
  {
    "base": "Vivillon",
    "name": "Vivillon-polar",
    "display": "Vivillon (Polar Pattern)",
    "sprite": "vivillon-polar",
    "types": null,
    "availability": "transfer",
    "special": null
  },
  {
    "base": "Vivillon",
    "name": "Vivillon-tundra",
    "display": "Vivillon (Tundra Pattern)",
    "sprite": "vivillon-tundra",
    "types": null,
    "availability": "transfer",
    "special": null
  },
  {
    "base": "Vivillon",
    "name": "Vivillon-continental",
    "display": "Vivillon (Continental Pattern)",
    "sprite": "vivillon-continental",
    "types": null,
    "availability": "transfer",
    "special": null
  },
  {
    "base": "Vivillon",
    "name": "Vivillon-garden",
    "display": "Vivillon (Garden Pattern)",
    "sprite": "vivillon-garden",
    "types": null,
    "availability": "transfer",
    "special": null
  },
  {
    "base": "Vivillon",
    "name": "Vivillon-elegant",
    "display": "Vivillon (Elegant Pattern)",
    "sprite": "vivillon-elegant",
    "types": null,
    "availability": "transfer",
    "special": null
  },
  {
    "base": "Vivillon",
    "name": "Vivillon-meadow",
    "display": "Vivillon (Meadow Pattern)",
    "sprite": "vivillon-meadow",
    "types": null,
    "availability": "transfer",
    "special": null
  },
  {
    "base": "Vivillon",
    "name": "Vivillon-modern",
    "display": "Vivillon (Modern Pattern)",
    "sprite": "vivillon-modern",
    "types": null,
    "availability": "transfer",
    "special": null
  },
  {
    "base": "Vivillon",
    "name": "Vivillon-marine",
    "display": "Vivillon (Marine Pattern)",
    "sprite": "vivillon-marine",
    "types": null,
    "availability": "transfer",
    "special": null
  },
  {
    "base": "Vivillon",
    "name": "Vivillon-archipelago",
    "display": "Vivillon (Archipelago Pattern)",
    "sprite": "vivillon-archipelago",
    "types": null,
    "availability": "transfer",
    "special": null
  },
  {
    "base": "Vivillon",
    "name": "Vivillon-highplains",
    "display": "Vivillon (High Plains Pattern)",
    "sprite": "vivillon-highplains",
    "types": null,
    "availability": "recruit",
    "special": null
  },
  {
    "base": "Vivillon",
    "name": "Vivillon-sandstorm",
    "display": "Vivillon (Sandstorm Pattern)",
    "sprite": "vivillon-sandstorm",
    "types": null,
    "availability": "transfer",
    "special": null
  },
  {
    "base": "Vivillon",
    "name": "Vivillon-river",
    "display": "Vivillon (River Pattern)",
    "sprite": "vivillon-river",
    "types": null,
    "availability": "transfer",
    "special": null
  },
  {
    "base": "Vivillon",
    "name": "Vivillon-monsoon",
    "display": "Vivillon (Monsoon Pattern)",
    "sprite": "vivillon-monsoon",
    "types": null,
    "availability": "transfer",
    "special": null
  },
  {
    "base": "Vivillon",
    "name": "Vivillon-savanna",
    "display": "Vivillon (Savanna Pattern)",
    "sprite": "vivillon-savanna",
    "types": null,
    "availability": "transfer",
    "special": null
  },
  {
    "base": "Vivillon",
    "name": "Vivillon-sun",
    "display": "Vivillon (Sun Pattern)",
    "sprite": "vivillon-sun",
    "types": null,
    "availability": "transfer",
    "special": null
  },
  {
    "base": "Vivillon",
    "name": "Vivillon-ocean",
    "display": "Vivillon (Ocean Pattern)",
    "sprite": "vivillon-ocean",
    "types": null,
    "availability": "transfer",
    "special": null
  },
  {
    "base": "Vivillon",
    "name": "Vivillon-jungle",
    "display": "Vivillon (Jungle Pattern)",
    "sprite": "vivillon-jungle",
    "types": null,
    "availability": "transfer",
    "special": null
  },
  {
    "base": "Vivillon",
    "name": "Vivillon-fancy",
    "display": "Vivillon (Fancy Pattern)",
    "sprite": "vivillon-fancy",
    "types": null,
    "availability": "transfer",
    "special": null
  },
  {
    "base": "Vivillon",
    "name": "Vivillon-pokeball",
    "display": "Vivillon (Poké Ball Pattern)",
    "sprite": "vivillon-pokeball",
    "types": null,
    "availability": "transfer",
    "special": null
  },
  {
    "base": "Furfrou",
    "name": "Furfrou-heart",
    "display": "Furfrou (Heart Trim)",
    "sprite": "furfrou-heart",
    "types": null,
    "availability": "transfer",
    "special": null
  },
  {
    "base": "Furfrou",
    "name": "Furfrou-star",
    "display": "Furfrou (Star Trim)",
    "sprite": "furfrou-star",
    "types": null,
    "availability": "transfer",
    "special": null
  },
  {
    "base": "Furfrou",
    "name": "Furfrou-diamond",
    "display": "Furfrou (Diamond Trim)",
    "sprite": "furfrou-diamond",
    "types": null,
    "availability": "transfer",
    "special": null
  },
  {
    "base": "Furfrou",
    "name": "Furfrou-debutante",
    "display": "Furfrou (Debutante Trim)",
    "sprite": "furfrou-debutante",
    "types": null,
    "availability": "transfer",
    "special": null
  },
  {
    "base": "Furfrou",
    "name": "Furfrou-matron",
    "display": "Furfrou (Matron Trim)",
    "sprite": "furfrou-matron",
    "types": null,
    "availability": "transfer",
    "special": null
  },
  {
    "base": "Furfrou",
    "name": "Furfrou-dandy",
    "display": "Furfrou (Dandy Trim)",
    "sprite": "furfrou-dandy",
    "types": null,
    "availability": "transfer",
    "special": null
  },
  {
    "base": "Furfrou",
    "name": "Furfrou-lareine",
    "display": "Furfrou (La Reine Trim)",
    "sprite": "furfrou-lareine",
    "types": null,
    "availability": "transfer",
    "special": null
  },
  {
    "base": "Furfrou",
    "name": "Furfrou-kabuki",
    "display": "Furfrou (Kabuki Trim)",
    "sprite": "furfrou-kabuki",
    "types": null,
    "availability": "transfer",
    "special": null
  },
  {
    "base": "Furfrou",
    "name": "Furfrou-pharaoh",
    "display": "Furfrou (Pharaoh Trim)",
    "sprite": "furfrou-pharaoh",
    "types": null,
    "availability": "transfer",
    "special": null
  },
  {
    "base": "Alcremie",
    "name": "Alcremie-rubycream",
    "display": "Alcremie (Ruby Cream)",
    "sprite": "alcremie-rubycream",
    "types": null,
    "availability": "normal",
    "special": null
  },
  {
    "base": "Alcremie",
    "name": "Alcremie-matchacream",
    "display": "Alcremie (Matcha Cream)",
    "sprite": "alcremie-matchacream",
    "types": null,
    "availability": "normal",
    "special": null
  },
  {
    "base": "Alcremie",
    "name": "Alcremie-mintcream",
    "display": "Alcremie (Mint Cream)",
    "sprite": "alcremie-mintcream",
    "types": null,
    "availability": "normal",
    "special": null
  },
  {
    "base": "Alcremie",
    "name": "Alcremie-lemoncream",
    "display": "Alcremie (Lemon Cream)",
    "sprite": "alcremie-lemoncream",
    "types": null,
    "availability": "normal",
    "special": null
  },
  {
    "base": "Alcremie",
    "name": "Alcremie-saltedcream",
    "display": "Alcremie (Salted Cream)",
    "sprite": "alcremie-saltedcream",
    "types": null,
    "availability": "normal",
    "special": null
  },
  {
    "base": "Alcremie",
    "name": "Alcremie-rubyswirl",
    "display": "Alcremie (Ruby Swirl)",
    "sprite": "alcremie-rubyswirl",
    "types": null,
    "availability": "normal",
    "special": null
  },
  {
    "base": "Alcremie",
    "name": "Alcremie-caramelswirl",
    "display": "Alcremie (Caramel Swirl)",
    "sprite": "alcremie-caramelswirl",
    "types": null,
    "availability": "normal",
    "special": null
  },
  {
    "base": "Alcremie",
    "name": "Alcremie-rainbowswirl",
    "display": "Alcremie (Rainbow Swirl)",
    "sprite": "alcremie-rainbowswirl",
    "types": null,
    "availability": "normal",
    "special": null
  },
  {
    "base": "Florges",
    "name": "Florges-yellow",
    "display": "Florges (Yellow Flower)",
    "sprite": "florges-yellow",
    "types": null,
    "availability": "normal",
    "special": null
  },
  {
    "base": "Florges",
    "name": "Florges-orange",
    "display": "Florges (Orange Flower)",
    "sprite": "florges-orange",
    "types": null,
    "availability": "normal",
    "special": null
  },
  {
    "base": "Florges",
    "name": "Florges-blue",
    "display": "Florges (Blue Flower)",
    "sprite": "florges-blue",
    "types": null,
    "availability": "normal",
    "special": null
  },
  {
    "base": "Florges",
    "name": "Florges-white",
    "display": "Florges (White Flower)",
    "sprite": "florges-white",
    "types": null,
    "availability": "normal",
    "special": null
  },
  {
    "base": "Castform",
    "name": "Castform-sunny",
    "display": "Castform (Sunny)",
    "sprite": "castform-sunny",
    "types": [
      "Fire"
    ],
    "availability": "battle",
    "special": "Forecast"
  },
  {
    "base": "Castform",
    "name": "Castform-rainy",
    "display": "Castform (Rainy)",
    "sprite": "castform-rainy",
    "types": [
      "Water"
    ],
    "availability": "battle",
    "special": "Forecast"
  },
  {
    "base": "Castform",
    "name": "Castform-snowy",
    "display": "Castform (Snowy)",
    "sprite": "castform-snowy",
    "types": [
      "Ice"
    ],
    "availability": "battle",
    "special": "Forecast"
  },
  {
    "base": "Pyroar",
    "name": "Pyroar-F",
    "display": "Pyroar (Female)",
    "sprite": "pyroar-f",
    "types": null,
    "availability": "normal",
    "special": null
  },
  {
    "base": "Maushold",
    "name": "Maushold-Four",
    "display": "Maushold (Family of Four)",
    "sprite": "maushold-four",
    "types": null,
    "availability": "normal",
    "special": null
  },
  {
    "base": "Morpeko",
    "name": "Morpeko-Hangry",
    "display": "Morpeko (Hangry Mode)",
    "sprite": "morpeko-hangry",
    "types": null,
    "availability": "battle",
    "special": null
  },
  {
    "base": "Palafin",
    "name": "Palafin-Hero",
    "display": "Palafin (Hero Form)",
    "sprite": "palafin-hero",
    "types": null,
    "availability": "battle",
    "special": null
  },
  {
    "base": "Sinistcha",
    "name": "Sinistcha-Masterpiece",
    "display": "Sinistcha (Masterpiece Form)",
    "sprite": "sinistcha-masterpiece",
    "types": null,
    "availability": "normal",
    "special": null
  }
];
  const spriteCorrections = {
    "Mr. Mime": "mrmime", "Mr. Rime": "mrrime", "Farfetch'd": "farfetchd", "Sirfetch'd": "sirfetchd",
    "Kommo-o": "kommoo", "Meowstic-F": "meowstic-f", "Gourgeist": "gourgeist",
    "Tauros-Paldea-Combat": "tauros-paldeacombat",
    "Tauros-Paldea-Blaze": "tauros-paldeablaze",
    "Tauros-Paldea-Aqua": "tauros-paldeaaqua",
    "Gourgeist-Super": "gourgeist-super",
    "Lycanroc-Midnight": "lycanroc-midnight", "Toxtricity-Low-Key": "toxtricity-lowkey"
  };
  for (const [name, sprite] of Object.entries(spriteCorrections)) {
    if (POKEDEX_MC[name]) POKEDEX_MC[name].sprite = sprite;
  }
  // Prefer precise artwork for each form, avoiding incorrect type/form pictures.
  for (const row of FORMS) {
    if (POKEDEX_MC[row.name]) continue;
    const base = POKEDEX_MC[row.base];
    if (!base || !base.base || !base.types) continue; // never invent a missing base stat
    POKEDEX_MC[row.name] = {
      dex: base.dex, sprite: row.sprite, types: row.types || [...base.types],
      base: {...base.base}, abilities: [...base.abilities],
      defaultMoves: [...(base.defaultMoves || [])],
      formLabel: row.display,
      championsAvailability: row.availability,
      inBattleOnly: row.availability === "battle"
    };
    if (row.special === 'Forecast') POKEDEX_MC[row.name].abilities = ['Forecast'];
  }
  // Keep the in-battle modes correct, if they have verified BattlePokedex stats already.
  if (POKEDEX_MC['Aegislash-Blade']) POKEDEX_MC['Aegislash-Blade'].sprite = 'aegislash-blade';
  if (POKEDEX_MC['Gourgeist']) POKEDEX_MC['Gourgeist'].sprite = 'gourgeist';
  if (POKEDEX_MC['Gourgeist-Super']) POKEDEX_MC['Gourgeist-Super'].sprite = 'gourgeist-super';
  if (POKEDEX_MC['Maushold']) POKEDEX_MC['Maushold'].sprite = 'maushold';
  if (POKEDEX_MC['Palafin']) POKEDEX_MC['Palafin'].sprite = 'palafin';
  const pending = FORMS.filter(row => !POKEDEX_MC[row.name]);
  globalThis.CHAMPIONS_BULBAPEDIA_REPORT = Object.freeze({
    addedForms: FORMS.length - pending.length,
    checkedForms: FORMS.length,
    missingBases: [...new Set(pending.map(x => x.base))],
    totalSelectable: Object.keys(POKEDEX_MC).length,
    transferredPatterns: FORMS.filter(x => x.availability === 'transfer').length
  });
  if (pending.length) console.warn('[Champions Bulbapedia] Missing confirmed base data',globalThis.CHAMPIONS_BULBAPEDIA_REPORT);
})();

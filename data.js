// ============================================================================
// POKÉMON CHAMPIONS — REGULATION M-C DATABASE (VGC 2026)
// Max 32 SP per stat | 66 SP total | Level 50 | Fixed 31 IVs
// ============================================================================

const ALL_TYPES = [
  "Normal", "Fire", "Water", "Electric", "Grass", "Ice",
  "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug",
  "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy"
];

// Type Effectiveness Chart: TYPE_CHART[attackType][defendType]
const TYPE_CHART = {
  Normal:   { Rock: 0.5, Ghost: 0, Steel: 0.5 },
  Fire:     { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 2, Bug: 2, Rock: 0.5, Dragon: 0.5, Steel: 2 },
  Water:    { Fire: 2, Water: 0.5, Grass: 0.5, Ground: 2, Rock: 2, Dragon: 0.5 },
  Electric: { Water: 2, Electric: 0.5, Grass: 0.5, Ground: 0, Flying: 2, Dragon: 0.5 },
  Grass:    { Fire: 0.5, Water: 2, Grass: 0.5, Poison: 0.5, Ground: 2, Flying: 0.5, Bug: 0.5, Rock: 2, Dragon: 0.5, Steel: 0.5 },
  Ice:      { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 0.5, Ground: 2, Flying: 2, Dragon: 2, Steel: 0.5 },
  Fighting: { Normal: 2, Ice: 2, Poison: 0.5, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Rock: 2, Ghost: 0, Dark: 2, Steel: 2, Fairy: 0.5 },
  Poison:   { Grass: 2, Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0, Fairy: 2 },
  Ground:   { Fire: 2, Electric: 2, Grass: 0.5, Poison: 2, Flying: 0, Bug: 0.5, Rock: 2, Steel: 2 },
  Flying:   { Electric: 0.5, Grass: 2, Fighting: 2, Bug: 2, Rock: 0.5, Steel: 0.5 },
  Psychic:  { Fighting: 2, Poison: 2, Psychic: 0.5, Dark: 0, Steel: 0.5 },
  Bug:      { Fire: 0.5, Grass: 2, Fighting: 0.5, Poison: 0.5, Flying: 0.5, Psychic: 2, Ghost: 0.5, Dark: 2, Steel: 0.5, Fairy: 0.5 },
  Rock:     { Fire: 2, Ice: 2, Fighting: 0.5, Ground: 0.5, Flying: 2, Bug: 2, Steel: 0.5 },
  Ghost:    { Normal: 0, Psychic: 2, Ghost: 2, Dark: 0.5 },
  Dragon:   { Dragon: 2, Steel: 0.5, Fairy: 0 },
  Dark:     { Fighting: 0.5, Psychic: 2, Ghost: 2, Dark: 0.5, Fairy: 0.5 },
  Steel:    { Fire: 0.5, Water: 0.5, Electric: 0.5, Ice: 2, Rock: 2, Steel: 0.5, Fairy: 2 },
  Fairy:    { Fire: 0.5, Fighting: 2, Poison: 0.5, Dragon: 2, Dark: 2, Steel: 0.5 }
};

const NATURES = {
  Adamant: { plus: "atk", minus: "spa", label: "Adamant (+Atk, -SpA)" },
  Jolly:   { plus: "spe", minus: "spa", label: "Jolly (+Spe, -SpA)" },
  Modest:  { plus: "spa", minus: "atk", label: "Modest (+SpA, -Atk)" },
  Timid:   { plus: "spe", minus: "atk", label: "Timid (+Spe, -Atk)" },
  Bold:    { plus: "def", minus: "atk", label: "Bold (+Def, -Atk)" },
  Impish:  { plus: "def", minus: "spa", label: "Impish (+Def, -SpA)" },
  Calm:    { plus: "spd", minus: "atk", label: "Calm (+SpD, -Atk)" },
  Careful: { plus: "spd", minus: "spa", label: "Careful (+SpD, -SpA)" },
  Brave:   { plus: "atk", minus: "spe", label: "Brave (+Atk, -Spe)" },
  Quiet:   { plus: "spa", minus: "spe", label: "Quiet (+SpA, -Spe)" },
  Relaxed: { plus: "def", minus: "spe", label: "Relaxed (+Def, -Spe)" },
  Sassy:   { plus: "spd", minus: "spe", label: "Sassy (+SpD, -Spe)" },
  Naive:   { plus: "spe", minus: "spd", label: "Naive (+Spe, -SpD)" },
  Hasty:   { plus: "spe", minus: "def", label: "Hasty (+Spe, -Def)" },
  Lonely:  { plus: "atk", minus: "def", label: "Lonely (+Atk, -Def)" },
  Naughty: { plus: "atk", minus: "spd", label: "Naughty (+Atk, -SpD)" },
  Mild:    { plus: "spa", minus: "def", label: "Mild (+SpA, -Def)" },
  Rash:    { plus: "spa", minus: "spd", label: "Rash (+SpA, -SpD)" },
  Serious: { plus: null,  minus: null,  label: "Serious (Trung tính)" }
};

// Regulation M-C Legal Pokédex & Mega Evolutions (including New Reg M-C Megas & Z-Megas)
const POKEDEX_MC = {
  "Garchomp": {
    dex: 445,
    sprite: "garchomp",
    types: ["Dragon", "Ground"],
    base: { hp: 108, atk: 130, def: 95, spa: 80, spd: 85, spe: 102 },
    abilities: ["Rough Skin", "Sand Veil"],
    defaultMoves: ["Earthquake", "Dragon Claw", "Rock Slide", "Protect"],
    megas: {
      "Garchompite Z": {
        name: "Garchomp-Mega-Z",
        sprite: "garchomp-mega",
        types: ["Dragon"],
        base: { hp: 108, atk: 130, def: 85, spa: 141, spd: 85, spe: 151 },
        ability: "Levitate"
      },
      "Garchompite": {
        name: "Garchomp-Mega",
        sprite: "garchomp-mega",
        types: ["Dragon", "Ground"],
        base: { hp: 108, atk: 170, def: 115, spa: 120, spd: 95, spe: 92 },
        ability: "Sand Force"
      }
    },
    defaultMegaStone: "Garchompite Z"
  },
  "Lucario": {
    dex: 448,
    sprite: "lucario",
    types: ["Fighting", "Steel"],
    base: { hp: 70, atk: 110, def: 70, spa: 115, spd: 70, spe: 90 },
    abilities: ["Inner Focus", "Justified", "Steadfast"],
    defaultMoves: ["Aura Sphere", "Flash Cannon", "Vacuum Wave", "Protect"],
    megas: {
      "Lucarionite Z": {
        name: "Lucario-Mega-Z",
        sprite: "lucario-mega",
        types: ["Fighting", "Steel"],
        base: { hp: 70, atk: 100, def: 70, spa: 164, spd: 70, spe: 151 },
        ability: "Aura Guard"
      },
      "Lucarionite": {
        name: "Lucario-Mega",
        sprite: "lucario-mega",
        types: ["Fighting", "Steel"],
        base: { hp: 70, atk: 145, def: 88, spa: 140, spd: 70, spe: 112 },
        ability: "Adaptability"
      }
    },
    defaultMegaStone: "Lucarionite Z"
  },
  "Absol": {
    dex: 359,
    sprite: "absol",
    types: ["Dark"],
    base: { hp: 65, atk: 130, def: 60, spa: 75, spd: 60, spe: 75 },
    abilities: ["Super Luck", "Justified", "Pressure"],
    defaultMoves: ["Night Slash", "Shadow Claw", "Sacred Sword", "Protect"],
    megas: {
      "Absolite Z": {
        name: "Absol-Mega-Z",
        sprite: "absol-mega",
        types: ["Dark", "Ghost"],
        base: { hp: 65, atk: 154, def: 60, spa: 75, spd: 60, spe: 151 },
        ability: "Sharpness"
      },
      "Absolite": {
        name: "Absol-Mega",
        sprite: "absol-mega",
        types: ["Dark"],
        base: { hp: 65, atk: 150, def: 60, spa: 115, spd: 60, spe: 115 },
        ability: "Magic Bounce"
      }
    },
    defaultMegaStone: "Absolite Z"
  },
  "Salamence": {
    dex: 373,
    sprite: "salamence",
    types: ["Dragon", "Flying"],
    base: { hp: 95, atk: 135, def: 80, spa: 110, spd: 80, spe: 100 },
    abilities: ["Intimidate", "Moxie"],
    defaultMoves: ["Double-Edge", "Hyper Voice", "Draco Meteor", "Protect"],
    megas: {
      "Salamencite": {
        name: "Salamence-Mega",
        sprite: "salamence-mega",
        types: ["Dragon", "Flying"],
        base: { hp: 95, atk: 145, def: 130, spa: 120, spd: 90, spe: 120 },
        ability: "Aerilate"
      }
    },
    defaultMegaStone: "Salamencite"
  },
  "Baxcalibur": {
    dex: 998,
    sprite: "baxcalibur",
    types: ["Dragon", "Ice"],
    base: { hp: 115, atk: 145, def: 92, spa: 75, spd: 86, spe: 87 },
    abilities: ["Thermal Exchange", "Ice Body"],
    defaultMoves: ["Glaive Rush", "Icicle Crash", "Ice Shard", "Protect"],
    megas: {
      "Baxcalibrite": {
        name: "Baxcalibur-Mega",
        sprite: "baxcalibur-mega",
        types: ["Dragon", "Ice"],
        base: { hp: 115, atk: 175, def: 117, spa: 105, spd: 101, spe: 87 },
        ability: "Thermal Exchange"
      }
    },
    defaultMegaStone: "Baxcalibrite"
  },
  "Golisopod": {
    dex: 768,
    sprite: "golisopod",
    types: ["Bug", "Water"],
    base: { hp: 75, atk: 125, def: 140, spa: 60, spd: 90, spe: 40 },
    abilities: ["Emergency Exit"],
    defaultMoves: ["First Impression", "Liquidation", "Close Combat", "Protect"],
    megas: {
      "Golisopodite": {
        name: "Golisopod-Mega",
        sprite: "golisopod-mega",
        types: ["Bug", "Steel"],
        base: { hp: 75, atk: 150, def: 175, spa: 70, spd: 120, spe: 40 },
        ability: "Tough Claws"
      }
    },
    defaultMegaStone: "Golisopodite"
  },
  "Sneasler": {
    dex: 903,
    sprite: "sneasler",
    types: ["Fighting", "Poison"],
    base: { hp: 80, atk: 130, def: 60, spa: 40, spd: 80, spe: 120 },
    abilities: ["Unburden", "Poison Touch", "Pressure"],
    defaultMoves: ["Close Combat", "Dire Claw", "Fake Out", "Coaching"]
  },
  "Rillaboom": {
    dex: 812,
    sprite: "rillaboom",
    types: ["Grass"],
    base: { hp: 100, atk: 125, def: 90, spa: 60, spd: 70, spe: 85 },
    abilities: ["Grassy Surge", "Overgrow"],
    defaultMoves: ["Fake Out", "Grassy Glide", "Wood Hammer", "U-turn"]
  },
  "Incineroar": {
    dex: 727,
    sprite: "incineroar",
    types: ["Fire", "Dark"],
    base: { hp: 95, atk: 115, def: 90, spa: 80, spd: 90, spe: 60 },
    abilities: ["Intimidate", "Blaze"],
    defaultMoves: ["Fake Out", "Flare Blitz", "Knock Off", "Parting Shot"]
  },
  "Kingambit": {
    dex: 983,
    sprite: "kingambit",
    types: ["Dark", "Steel"],
    base: { hp: 100, atk: 135, def: 120, spa: 60, spd: 85, spe: 50 },
    abilities: ["Defiant", "Supreme Overlord"],
    defaultMoves: ["Kowtow Cleave", "Iron Head", "Sucker Punch", "Protect"]
  },
  "Indeedee-F": {
    dex: 876,
    sprite: "indeedee-f",
    types: ["Psychic", "Normal"],
    base: { hp: 70, atk: 55, def: 65, spa: 95, spd: 105, spe: 85 },
    abilities: ["Psychic Surge", "Synchronize"],
    defaultMoves: ["Follow Me", "Psychic", "Helping Hand", "Trick Room"]
  },
  "Armarouge": {
    dex: 936,
    sprite: "armarouge",
    types: ["Fire", "Psychic"],
    base: { hp: 85, atk: 60, def: 100, spa: 125, spd: 80, spe: 75 },
    abilities: ["Flash Fire", "Weak Armor"],
    defaultMoves: ["Expanding Force", "Armor Cannon", "Trick Room", "Wide Guard"]
  },
  "Archaludon": {
    dex: 1018,
    sprite: "archaludon",
    types: ["Steel", "Dragon"],
    base: { hp: 90, atk: 105, def: 130, spa: 125, spd: 65, spe: 85 },
    abilities: ["Stamina", "Stalwart"],
    defaultMoves: ["Electro Shot", "Flash Cannon", "Draco Meteor", "Body Press"]
  },
  "Pelipper": {
    dex: 279,
    sprite: "pelipper",
    types: ["Water", "Flying"],
    base: { hp: 60, atk: 50, def: 100, spa: 95, spd: 70, spe: 65 },
    abilities: ["Drizzle", "Keen Eye"],
    defaultMoves: ["Weather Ball", "Hurricane", "Wide Guard", "Tailwind"]
  },
  "Basculegion": {
    dex: 902,
    sprite: "basculegion",
    types: ["Water", "Ghost"],
    base: { hp: 120, atk: 112, def: 65, spa: 80, spd: 75, spe: 78 },
    abilities: ["Swift Swim", "Adaptability", "Mold Breaker"],
    defaultMoves: ["Wave Crash", "Last Respects", "Aqua Jet", "Protect"]
  },
  "Basculegion-F": {
    dex: 902,
    sprite: "basculegion-f",
    types: ["Water", "Ghost"],
    base: { hp: 120, atk: 92, def: 65, spa: 100, spd: 75, spe: 78 },
    abilities: ["Swift Swim", "Adaptability", "Mold Breaker"],
    defaultMoves: ["Muddy Water", "Shadow Ball", "Ice Beam", "Protect"]
  },
  "Gholdengo": {
    dex: 1000,
    sprite: "gholdengo",
    types: ["Steel", "Ghost"],
    base: { hp: 87, atk: 60, def: 95, spa: 133, spd: 91, spe: 84 },
    abilities: ["Good as Gold"],
    defaultMoves: ["Make It Rain", "Shadow Ball", "Nasty Plot", "Protect"]
  },
  "Farigiraf": {
    dex: 981,
    sprite: "farigiraf",
    types: ["Normal", "Psychic"],
    base: { hp: 120, atk: 90, def: 70, spa: 110, spd: 70, spe: 60 },
    abilities: ["Armor Tail", "Cud Chew"],
    defaultMoves: ["Psychic", "Dazzling Gleam", "Helping Hand", "Trick Room"]
  },
  "Charizard": {
    dex: 6,
    sprite: "charizard",
    types: ["Fire", "Flying"],
    base: { hp: 78, atk: 84, def: 78, spa: 109, spd: 85, spe: 100 },
    abilities: ["Solar Power", "Blaze"],
    defaultMoves: ["Heat Wave", "Solar Beam", "Air Slash", "Protect"],
    megas: {
      "Charizardite Y": {
        name: "Charizard-Mega-Y",
        sprite: "charizard-megay",
        types: ["Fire", "Flying"],
        base: { hp: 78, atk: 104, def: 78, spa: 159, spd: 115, spe: 100 },
        ability: "Drought"
      },
      "Charizardite X": {
        name: "Charizard-Mega-X",
        sprite: "charizard-megax",
        types: ["Fire", "Dragon"],
        base: { hp: 78, atk: 130, def: 111, spa: 130, spd: 85, spe: 100 },
        ability: "Tough Claws"
      }
    },
    defaultMegaStone: "Charizardite Y"
  },
  "Venusaur": {
    dex: 3,
    sprite: "venusaur",
    types: ["Grass", "Poison"],
    base: { hp: 80, atk: 82, def: 83, spa: 100, spd: 100, spe: 80 },
    abilities: ["Chlorophyll", "Overgrow"],
    defaultMoves: ["Sludge Bomb", "Energy Ball", "Earth Power", "Protect"],
    megas: {
      "Venusaurite": {
        name: "Venusaur-Mega",
        sprite: "venusaur-mega",
        types: ["Grass", "Poison"],
        base: { hp: 80, atk: 100, def: 123, spa: 122, spd: 120, spe: 80 },
        ability: "Thick Fat"
      }
    },
    defaultMegaStone: "Venusaurite"
  },
  "Gardevoir": {
    dex: 282,
    sprite: "gardevoir",
    types: ["Psychic", "Fairy"],
    base: { hp: 68, atk: 65, def: 65, spa: 125, spd: 115, spe: 80 },
    abilities: ["Trace", "Telepathy", "Synchronize"],
    defaultMoves: ["Hyper Voice", "Expanding Force", "Psychic", "Protect"],
    megas: {
      "Gardevoirite": {
        name: "Gardevoir-Mega",
        sprite: "gardevoir-mega",
        types: ["Psychic", "Fairy"],
        base: { hp: 68, atk: 85, def: 65, spa: 165, spd: 135, spe: 100 },
        ability: "Pixilate"
      }
    },
    defaultMegaStone: "Gardevoirite"
  },
  "Metagross": {
    dex: 376,
    sprite: "metagross",
    types: ["Steel", "Psychic"],
    base: { hp: 80, atk: 135, def: 130, spa: 95, spd: 90, spe: 70 },
    abilities: ["Clear Body"],
    defaultMoves: ["Iron Head", "Psychic Fangs", "Stomping Tantrum", "Protect"],
    megas: {
      "Metagrossite": {
        name: "Metagross-Mega",
        sprite: "metagross-mega",
        types: ["Steel", "Psychic"],
        base: { hp: 80, atk: 145, def: 150, spa: 105, spd: 110, spe: 110 },
        ability: "Tough Claws"
      }
    },
    defaultMegaStone: "Metagrossite"
  },
  "Tyranitar": {
    dex: 248,
    sprite: "tyranitar",
    types: ["Rock", "Dark"],
    base: { hp: 100, atk: 134, def: 110, spa: 95, spd: 100, spe: 61 },
    abilities: ["Sand Stream", "Unnerve"],
    defaultMoves: ["Rock Slide", "Knock Off", "Low Kick", "Protect"],
    megas: {
      "Tyranitarite": {
        name: "Tyranitar-Mega",
        sprite: "tyranitar-mega",
        types: ["Rock", "Dark"],
        base: { hp: 100, atk: 164, def: 150, spa: 95, spd: 120, spe: 71 },
        ability: "Sand Stream"
      }
    },
    defaultMegaStone: "Tyranitarite"
  },
  "Glimmora": {
    dex: 970,
    sprite: "glimmora",
    types: ["Rock", "Poison"],
    base: { hp: 83, atk: 55, def: 90, spa: 130, spd: 81, spe: 86 },
    abilities: ["Toxic Debris", "Corrosion"],
    defaultMoves: ["Power Gem", "Sludge Bomb", "Earth Power", "Spiky Shield"],
    megas: {
      "Glimmoranite": {
        name: "Glimmora-Mega",
        sprite: "glimmora-mega",
        types: ["Rock", "Poison"],
        base: { hp: 83, atk: 90, def: 105, spa: 150, spd: 96, spe: 101 },
        ability: "Adaptability"
      }
    },
    defaultMegaStone: "Glimmoranite"
  },
  "Dragonite": {
    dex: 149,
    sprite: "dragonite",
    types: ["Dragon", "Flying"],
    base: { hp: 91, atk: 134, def: 95, spa: 100, spd: 100, spe: 80 },
    abilities: ["Multiscale", "Inner Focus"],
    defaultMoves: ["Extreme Speed", "Draco Meteor", "Stomping Tantrum", "Protect"],
    megas: {
      "Dragoninite": {
        name: "Dragonite-Mega",
        sprite: "dragonite-mega",
        types: ["Dragon", "Flying"],
        base: { hp: 91, atk: 124, def: 115, spa: 145, spd: 125, spe: 100 },
        ability: "Multiscale"
      }
    },
    defaultMegaStone: "Dragoninite"
  },
  "Raichu": {
    dex: 26,
    sprite: "raichu",
    types: ["Electric"],
    base: { hp: 60, atk: 90, def: 55, spa: 90, spd: 80, spe: 110 },
    abilities: ["Lightning Rod", "Static"],
    defaultMoves: ["Fake Out", "Nuzzle", "Volt Switch", "Feint"],
    megas: {
      "Raichunite Y": {
        name: "Raichu-Mega-Y",
        sprite: "raichu",
        types: ["Electric"],
        base: { hp: 60, atk: 100, def: 55, spa: 160, spd: 85, spe: 130 },
        ability: "Lightning Rod"
      }
    },
    defaultMegaStone: "Raichunite Y"
  },
  "Whimsicott": {
    dex: 547,
    sprite: "whimsicott",
    types: ["Grass", "Fairy"],
    base: { hp: 60, atk: 67, def: 85, spa: 77, spd: 75, spe: 116 },
    abilities: ["Prankster", "Infiltrator"],
    defaultMoves: ["Moonblast", "Tailwind", "Encore", "Sunny Day"]
  },
  "Sinistcha": {
    dex: 1013,
    sprite: "sinistcha",
    types: ["Grass", "Ghost"],
    base: { hp: 71, atk: 60, def: 106, spa: 121, spd: 80, spe: 70 },
    abilities: ["Hospitality", "Heatproof"],
    defaultMoves: ["Matcha Gotcha", "Shadow Ball", "Rage Powder", "Trick Room"]
  },
  "Grimmsnarl": {
    dex: 861,
    sprite: "grimmsnarl",
    types: ["Dark", "Fairy"],
    base: { hp: 95, atk: 120, def: 65, spa: 95, spd: 75, spe: 60 },
    abilities: ["Prankster"],
    defaultMoves: ["Spirit Break", "Fake Out", "Reflect", "Light Screen"]
  },
  "Annihilape": {
    dex: 979,
    sprite: "annihilape",
    types: ["Fighting", "Ghost"],
    base: { hp: 110, atk: 115, def: 80, spa: 50, spd: 90, spe: 90 },
    abilities: ["Defiant", "Inner Focus", "Vital Spirit"],
    defaultMoves: ["Rage Fist", "Drain Punch", "Bulk Up", "Protect"]
  },
  "Excadrill": {
    dex: 530,
    sprite: "excadrill",
    types: ["Ground", "Steel"],
    base: { hp: 110, atk: 135, def: 60, spa: 50, spd: 65, spe: 88 },
    abilities: ["Sand Rush", "Mold Breaker"],
    defaultMoves: ["High Horsepower", "Iron Head", "Rock Slide", "Protect"]
  },
  "Primarina": {
    dex: 730,
    sprite: "primarina",
    types: ["Water", "Fairy"],
    base: { hp: 80, atk: 74, def: 74, spa: 126, spd: 116, spe: 60 },
    abilities: ["Liquid Voice", "Torrent"],
    defaultMoves: ["Hyper Voice", "Moonblast", "Haze", "Protect"]
  },
  "Arcanine-Hisui": {
    dex: 59,
    sprite: "arcanine-hisui",
    types: ["Fire", "Rock"],
    base: { hp: 95, atk: 115, def: 80, spa: 95, spd: 80, spe: 90 },
    abilities: ["Intimidate", "Rock Head"],
    defaultMoves: ["Rock Slide", "Flare Blitz", "Extreme Speed", "Protect"]
  },
  "Torkoal": {
    dex: 324,
    sprite: "torkoal",
    types: ["Fire"],
    base: { hp: 70, atk: 85, def: 140, spa: 85, spd: 70, spe: 20 },
    abilities: ["Drought", "White Smoke"],
    defaultMoves: ["Eruption", "Heat Wave", "Earth Power", "Protect"]
  },
  "Ninetales-Alola": {
    dex: 38,
    sprite: "ninetales-alola",
    types: ["Ice", "Fairy"],
    base: { hp: 73, atk: 67, def: 75, spa: 81, spd: 100, spe: 109 },
    abilities: ["Snow Warning"],
    defaultMoves: ["Blizzard", "Moonblast", "Aurora Veil", "Protect"]
  },
  "Pincurchin": {
    dex: 871,
    sprite: "pincurchin",
    types: ["Electric"],
    base: { hp: 48, atk: 101, def: 95, spa: 91, spd: 85, spe: 15 },
    abilities: ["Electric Surge", "Lightning Rod"],
    defaultMoves: ["Zing Zap", "Scald", "Sucker Punch", "Protect"]
  }
};

// Held Items in Regulation M-C (including Mega Stones & Terrain Seeds)
const ITEMS_MC = [
  "None",
  "Focus Sash",
  "Life Orb",
  "Choice Scarf",
  "Choice Band",
  "Choice Specs",
  "Assault Vest",
  "Sitrus Berry",
  "Safety Goggles",
  "Clear Amulet",
  "Covert Cloak",
  "Leftovers",
  "Rocky Helmet",
  "Booster Energy",
  "Light Clay",
  "Psychic Seed",
  "Grassy Seed",
  "Electric Seed",
  "Misty Seed",
  "Black Glasses",
  "Charcoal",
  "Mystic Water",
  "Miracle Seed",
  "Fairy Feather",
  "Spell Tag",
  "Sharp Beak",
  "Dragon Fang",
  "Magnet",
  "Never-Melt Ice",
  "Silk Scarf",
  "Expert Belt",
  "Wide Lens",
  "Eviolite",
  "Garchompite Z",
  "Garchompite",
  "Lucarionite Z",
  "Lucarionite",
  "Absolite Z",
  "Absolite",
  "Salamencite",
  "Baxcalibrite",
  "Golisopodite",
  "Charizardite Y",
  "Charizardite X",
  "Venusaurite",
  "Gardevoirite",
  "Metagrossite",
  "Tyranitarite",
  "Glimmoranite",
  "Dragoninite",
  "Raichunite Y"
];

// Competitive VGC Moves Database
const MOVES_DB = {
  "Protect":          { bp: 0,   type: "Normal",   cat: "Status",   spread: false },
  "Spiky Shield":     { bp: 0,   type: "Grass",    cat: "Status",   spread: false },
  "Fake Out":         { bp: 40,  type: "Normal",   cat: "Physical", spread: false, contact: true },
  "Follow Me":        { bp: 0,   type: "Normal",   cat: "Status",   spread: false },
  "Rage Powder":      { bp: 0,   type: "Bug",      cat: "Status",   spread: false },
  "Helping Hand":     { bp: 0,   type: "Normal",   cat: "Status",   spread: false },
  "Tailwind":         { bp: 0,   type: "Flying",   cat: "Status",   spread: false },
  "Trick Room":       { bp: 0,   type: "Psychic",  cat: "Status",   spread: false },
  "Wide Guard":       { bp: 0,   type: "Rock",     cat: "Status",   spread: false },
  "Parting Shot":     { bp: 0,   type: "Dark",     cat: "Status",   spread: false },
  "Coaching":         { bp: 0,   type: "Fighting", cat: "Status",   spread: false },
  "Nasty Plot":       { bp: 0,   type: "Dark",     cat: "Status",   spread: false },
  "Bulk Up":          { bp: 0,   type: "Fighting", cat: "Status",   spread: false },
  "Encore":           { bp: 0,   type: "Normal",   cat: "Status",   spread: false },
  "Sunny Day":        { bp: 0,   type: "Fire",     cat: "Status",   spread: false },
  "Reflect":          { bp: 0,   type: "Psychic",  cat: "Status",   spread: false },
  "Light Screen":     { bp: 0,   type: "Psychic",  cat: "Status",   spread: false },
  "Aurora Veil":      { bp: 0,   type: "Ice",      cat: "Status",   spread: false },
  "Haze":             { bp: 0,   type: "Ice",      cat: "Status",   spread: false },
  "Earthquake":       { bp: 100, type: "Ground",   cat: "Physical", spread: true },
  "High Horsepower":  { bp: 95,  type: "Ground",   cat: "Physical", spread: false, contact: true },
  "Stomping Tantrum": { bp: 75,  type: "Ground",   cat: "Physical", spread: false, contact: true },
  "Earth Power":      { bp: 90,  type: "Ground",   cat: "Special",  spread: false },
  "Dragon Claw":      { bp: 80,  type: "Dragon",   cat: "Physical", spread: false, contact: true },
  "Glaive Rush":      { bp: 120, type: "Dragon",   cat: "Physical", spread: false, contact: true },
  "Draco Meteor":     { bp: 130, type: "Dragon",   cat: "Special",  spread: false },
  "Rock Slide":       { bp: 75,  type: "Rock",     cat: "Physical", spread: true },
  "Power Gem":        { bp: 80,  type: "Rock",     cat: "Special",  spread: false },
  "Close Combat":     { bp: 120, type: "Fighting", cat: "Physical", spread: false, contact: true },
  "Sacred Sword":     { bp: 90,  type: "Fighting", cat: "Physical", spread: false, contact: true, slicing: true },
  "Drain Punch":      { bp: 75,  type: "Fighting", cat: "Physical", spread: false, contact: true },
  "Low Kick":         { bp: 100, type: "Fighting", cat: "Physical", spread: false, contact: true },
  "Body Press":       { bp: 80,  type: "Fighting", cat: "Physical", spread: false, contact: true },
  "Aura Sphere":      { bp: 80,  type: "Fighting", cat: "Special",  spread: false },
  "Vacuum Wave":      { bp: 40,  type: "Fighting", cat: "Special",  spread: false },
  "Dire Claw":        { bp: 80,  type: "Poison",   cat: "Physical", spread: false, contact: true },
  "Sludge Bomb":      { bp: 90,  type: "Poison",   cat: "Special",  spread: false },
  "Grassy Glide":     { bp: 55,  type: "Grass",    cat: "Physical", spread: false, contact: true },
  "Wood Hammer":      { bp: 120, type: "Grass",    cat: "Physical", spread: false, contact: true },
  "Energy Ball":      { bp: 90,  type: "Grass",    cat: "Special",  spread: false },
  "Solar Beam":       { bp: 120, type: "Grass",    cat: "Special",  spread: false },
  "Matcha Gotcha":    { bp: 80,  type: "Grass",    cat: "Special",  spread: true },
  "U-turn":           { bp: 70,  type: "Bug",      cat: "Physical", spread: false, contact: true },
  "First Impression": { bp: 90,  type: "Bug",      cat: "Physical", spread: false, contact: true },
  "Flare Blitz":      { bp: 120, type: "Fire",     cat: "Physical", spread: false, contact: true },
  "Heat Wave":        { bp: 95,  type: "Fire",     cat: "Special",  spread: true },
  "Eruption":         { bp: 150, type: "Fire",     cat: "Special",  spread: true },
  "Armor Cannon":     { bp: 120, type: "Fire",     cat: "Special",  spread: false },
  "Knock Off":        { bp: 65,  type: "Dark",     cat: "Physical", spread: false, contact: true },
  "Kowtow Cleave":    { bp: 85,  type: "Dark",     cat: "Physical", spread: false, contact: true, slicing: true },
  "Sucker Punch":     { bp: 70,  type: "Dark",     cat: "Physical", spread: false, contact: true },
  "Night Slash":      { bp: 70,  type: "Dark",     cat: "Physical", spread: false, contact: true, slicing: true },
  "Iron Head":        { bp: 80,  type: "Steel",    cat: "Physical", spread: false, contact: true },
  "Flash Cannon":     { bp: 80,  type: "Steel",    cat: "Special",  spread: false },
  "Make It Rain":     { bp: 120, type: "Steel",    cat: "Special",  spread: true },
  "Psychic":          { bp: 90,  type: "Psychic",  cat: "Special",  spread: false },
  "Expanding Force":  { bp: 80,  type: "Psychic",  cat: "Special",  spread: true },
  "Psychic Fangs":    { bp: 85,  type: "Psychic",  cat: "Physical", spread: false, contact: true },
  "Shadow Ball":      { bp: 80,  type: "Ghost",    cat: "Special",  spread: false },
  "Shadow Claw":      { bp: 70,  type: "Ghost",    cat: "Physical", spread: false, contact: true, slicing: true },
  "Last Respects":    { bp: 100, type: "Ghost",    cat: "Physical", spread: false },
  "Rage Fist":        { bp: 100, type: "Ghost",    cat: "Physical", spread: false, contact: true },
  "Wave Crash":       { bp: 120, type: "Water",    cat: "Physical", spread: false, contact: true },
  "Liquidation":      { bp: 85,  type: "Water",    cat: "Physical", spread: false, contact: true },
  "Aqua Jet":         { bp: 40,  type: "Water",    cat: "Physical", spread: false, contact: true },
  "Weather Ball":     { bp: 100, type: "Water",    cat: "Special",  spread: false },
  "Muddy Water":      { bp: 90,  type: "Water",    cat: "Special",  spread: true },
  "Scald":            { bp: 80,  type: "Water",    cat: "Special",  spread: false },
  "Hurricane":        { bp: 110, type: "Flying",   cat: "Special",  spread: false },
  "Air Slash":        { bp: 75,  type: "Flying",   cat: "Special",  spread: false },
  "Double-Edge":      { bp: 120, type: "Normal",   cat: "Physical", spread: false, contact: true },
  "Hyper Voice":      { bp: 90,  type: "Normal",   cat: "Special",  spread: true },
  "Extreme Speed":    { bp: 80,  type: "Normal",   cat: "Physical", spread: false, contact: true },
  "Feint":            { bp: 30,  type: "Normal",   cat: "Physical", spread: false },
  "Icicle Crash":     { bp: 85,  type: "Ice",      cat: "Physical", spread: false },
  "Ice Shard":        { bp: 40,  type: "Ice",      cat: "Physical", spread: false },
  "Ice Beam":         { bp: 90,  type: "Ice",      cat: "Special",  spread: false },
  "Blizzard":         { bp: 110, type: "Ice",      cat: "Special",  spread: true },
  "Electro Shot":     { bp: 130, type: "Electric", cat: "Special",  spread: false },
  "Volt Switch":      { bp: 70,  type: "Electric", cat: "Special",  spread: false },
  "Zing Zap":         { bp: 80,  type: "Electric", cat: "Physical", spread: false, contact: true },
  "Nuzzle":           { bp: 20,  type: "Electric", cat: "Physical", spread: false, contact: true },
  "Dazzling Gleam":   { bp: 80,  type: "Fairy",    cat: "Special",  spread: true },
  "Moonblast":        { bp: 95,  type: "Fairy",    cat: "Special",  spread: false },
  "Spirit Break":     { bp: 75,  type: "Fairy",    cat: "Physical", spread: false, contact: true }
};

// Default Starter Meta Team for Regulation M-C
const DEFAULT_SAMPLE_TEAM = [
  {
    species: "Garchomp",
    nickname: "",
    gender: "M",
    item: "Garchompite Z",
    ability: "Rough Skin",
    nature: "Timid",
    isMega: true,
    sp: { hp: 2, atk: 0, def: 0, spa: 32, spd: 0, spe: 32 },
    moves: ["Draco Meteor", "Earth Power", "Flamethrower" in MOVES_DB ? "Flamethrower" : "Power Gem", "Protect"]
  },
  {
    species: "Sneasler",
    nickname: "",
    gender: "F",
    item: "Focus Sash",
    ability: "Unburden",
    nature: "Jolly",
    isMega: false,
    sp: { hp: 2, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 },
    moves: ["Close Combat", "Dire Claw", "Fake Out", "Coaching"]
  },
  {
    species: "Rillaboom",
    nickname: "",
    gender: "M",
    item: "Assault Vest",
    ability: "Grassy Surge",
    nature: "Adamant",
    isMega: false,
    sp: { hp: 32, atk: 20, def: 6, spa: 0, spd: 8, spe: 0 },
    moves: ["Fake Out", "Grassy Glide", "Wood Hammer", "U-turn"]
  },
  {
    species: "Incineroar",
    nickname: "",
    gender: "M",
    item: "Safety Goggles",
    ability: "Intimidate",
    nature: "Careful",
    isMega: false,
    sp: { hp: 32, atk: 0, def: 14, spa: 0, spd: 20, spe: 0 },
    moves: ["Fake Out", "Flare Blitz", "Knock Off", "Parting Shot"]
  },
  {
    species: "Kingambit",
    nickname: "",
    gender: "M",
    item: "Black Glasses",
    ability: "Defiant",
    nature: "Adamant",
    isMega: false,
    sp: { hp: 24, atk: 32, def: 0, spa: 0, spd: 10, spe: 0 },
    moves: ["Kowtow Cleave", "Iron Head", "Sucker Punch", "Protect"]
  },
  {
    species: "Gholdengo",
    nickname: "",
    gender: "",
    item: "Life Orb",
    ability: "Good as Gold",
    nature: "Timid",
    isMega: false,
    sp: { hp: 2, atk: 0, def: 0, spa: 32, spd: 0, spe: 32 },
    moves: ["Make It Rain", "Shadow Ball", "Nasty Plot", "Protect"]
  }
];
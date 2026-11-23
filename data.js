// ============================================================================
// POKÉMON CHAMPIONS — REGULATION M-C DATABASE (VGC 2026 / POKECHAMPDEX)
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
  Gentle:  { plus: "spd", minus: "def", label: "Gentle (+SpD, -Def)" },
  Lax:     { plus: "def", minus: "spd", label: "Lax (+Def, -SpD)" },
  Hardy:   { plus: null, minus: null, label: "Hardy (Trung tính)" },
  Docile:  { plus: null, minus: null, label: "Docile (Trung tính)" },
  Bashful: { plus: null, minus: null, label: "Bashful (Trung tính)" },
  Quirky:  { plus: null, minus: null, label: "Quirky (Trung tính)" },
  Serious: { plus: null, minus: null, label: "Serious (Trung tính)" }
};

// Full Regulation M-C Legal Pokédex & Mega Evolutions (including Mega Z Forms)
const POKEDEX_MC = {
  "Abomasnow": {
    dex: 460,
    sprite: "abomasnow",
    types: ["Grass", "Ice"],
    base: { hp: 90, atk: 92, def: 75, spa: 92, spd: 85, spe: 60 },
    abilities: ["Snow Warning", "Soundproof"],
    defaultMoves: ["Blizzard", "Energy Ball", "Earth Power", "Protect"],
    megas: {
      "Abomasite": {
        name: "Abomasnow-Mega",
        sprite: "abomasnow-mega",
        fallbackSprite: "abomasnow",
        types: ["Grass", "Ice"],
        base: { hp: 90, atk: 132, def: 105, spa: 132, spd: 105, spe: 30 },
        ability: "Snow Warning"
      }
    },
    defaultMegaStone: "Abomasite"
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
        sprite: "absol-megaz",
        fallbackSprite: "absol-mega",
        types: ["Dark", "Ghost"],
        base: { hp: 65, atk: 154, def: 60, spa: 75, spd: 60, spe: 151 },
        ability: "Sharpness"
      },
      "Absolite": {
        name: "Absol-Mega",
        sprite: "absol-mega",
        fallbackSprite: "absol",
        types: ["Dark"],
        base: { hp: 65, atk: 150, def: 60, spa: 115, spd: 60, spe: 115 },
        ability: "Magic Bounce"
      }
    },
    defaultMegaStone: "Absolite Z"
  },
  "Aegislash": {
    dex: 681,
    sprite: "aegislash",
    types: ["Steel", "Ghost"],
    base: { hp: 60, atk: 50, def: 140, spa: 50, spd: 140, spe: 60 },
    abilities: ["Stance Change"],
    defaultMoves: ["Shadow Ball", "Flash Cannon", "Wide Guard", "King's Shield"]
  },
  "Aegislash-Blade": {
    dex: 681,
    sprite: "aegislash-blade",
    types: ["Steel", "Ghost"],
    base: { hp: 60, atk: 140, def: 50, spa: 140, spd: 50, spe: 60 },
    abilities: ["Stance Change"],
    defaultMoves: ["Shadow Ball", "Flash Cannon", "Close Combat", "King's Shield"]
  },
  "Aerodactyl": {
    dex: 142,
    sprite: "aerodactyl",
    types: ["Rock", "Flying"],
    base: { hp: 80, atk: 105, def: 65, spa: 60, spd: 75, spe: 130 },
    abilities: ["Unnerve", "Rock Head", "Pressure"],
    defaultMoves: ["Rock Slide", "Dual Wingbeat", "Tailwind", "Protect"],
    megas: {
      "Aerodactylite": {
        name: "Aerodactyl-Mega",
        sprite: "aerodactyl-mega",
        fallbackSprite: "aerodactyl",
        types: ["Rock", "Flying"],
        base: { hp: 80, atk: 135, def: 85, spa: 70, spd: 95, spe: 150 },
        ability: "Tough Claws"
      }
    },
    defaultMegaStone: "Aerodactylite"
  },
  "Aggron": {
    dex: 306,
    sprite: "aggron",
    types: ["Steel", "Rock"],
    base: { hp: 70, atk: 110, def: 180, spa: 60, spd: 60, spe: 50 },
    abilities: ["Sturdy", "Rock Head"],
    defaultMoves: ["Heavy Slam", "Body Press", "Rock Slide", "Protect"],
    megas: {
      "Aggronite": {
        name: "Aggron-Mega",
        sprite: "aggron-mega",
        fallbackSprite: "aggron",
        types: ["Steel"],
        base: { hp: 70, atk: 140, def: 230, spa: 60, spd: 80, spe: 50 },
        ability: "Filter"
      }
    },
    defaultMegaStone: "Aggronite"
  },
  "Alakazam": {
    dex: 65,
    sprite: "alakazam",
    types: ["Psychic"],
    base: { hp: 55, atk: 50, def: 45, spa: 135, spd: 95, spe: 120 },
    abilities: ["Magic Guard", "Inner Focus", "Synchronize"],
    defaultMoves: ["Expanding Force", "Shadow Ball", "Dazzling Gleam", "Protect"],
    megas: {
      "Alakazite": {
        name: "Alakazam-Mega",
        sprite: "alakazam-mega",
        fallbackSprite: "alakazam",
        types: ["Psychic"],
        base: { hp: 55, atk: 50, def: 65, spa: 175, spd: 105, spe: 150 },
        ability: "Trace"
      }
    },
    defaultMegaStone: "Alakazite"
  },
  "Alcremie": {
    dex: 869,
    sprite: "alcremie",
    types: ["Fairy"],
    base: { hp: 65, atk: 60, def: 75, spa: 110, spd: 121, spe: 64 },
    abilities: ["Sweet Veil", "Aroma Veil"],
    defaultMoves: ["Dazzling Gleam", "Decorate", "Encore", "Protect"]
  },
  "Altaria": {
    dex: 334,
    sprite: "altaria",
    types: ["Dragon", "Flying"],
    base: { hp: 75, atk: 70, def: 90, spa: 70, spd: 105, spe: 80 },
    abilities: ["Cloud Nine", "Natural Cure"],
    defaultMoves: ["Hyper Voice", "Draco Meteor", "Tailwind", "Protect"],
    megas: {
      "Altarianite": {
        name: "Altaria-Mega",
        sprite: "altaria-mega",
        fallbackSprite: "altaria",
        types: ["Dragon", "Fairy"],
        base: { hp: 75, atk: 110, def: 110, spa: 110, spd: 105, spe: 80 },
        ability: "Pixilate"
      }
    },
    defaultMegaStone: "Altarianite"
  },
  "Ampharos": {
    dex: 181,
    sprite: "ampharos",
    types: ["Electric"],
    base: { hp: 90, atk: 75, def: 85, spa: 115, spd: 90, spe: 55 },
    abilities: ["Static", "Plus"],
    defaultMoves: ["Thunderbolt", "Dragon Pulse", "Dazzling Gleam", "Protect"],
    megas: {
      "Ampharosite": {
        name: "Ampharos-Mega",
        sprite: "ampharos-mega",
        fallbackSprite: "ampharos",
        types: ["Electric", "Dragon"],
        base: { hp: 90, atk: 95, def: 105, spa: 165, spd: 110, spe: 45 },
        ability: "Mold Breaker"
      }
    },
    defaultMegaStone: "Ampharosite"
  },
  "Annihilape": {
    dex: 979,
    sprite: "annihilape",
    types: ["Fighting", "Ghost"],
    base: { hp: 110, atk: 115, def: 80, spa: 50, spd: 90, spe: 90 },
    abilities: ["Defiant", "Inner Focus", "Vital Spirit"],
    defaultMoves: ["Rage Fist", "Drain Punch", "Bulk Up", "Protect"]
  },
  "Appletun": {
    dex: 842,
    sprite: "appletun",
    types: ["Grass", "Dragon"],
    base: { hp: 110, atk: 85, def: 80, spa: 100, spd: 80, spe: 30 },
    abilities: ["Thick Fat", "Ripen"],
    defaultMoves: ["Apple Acid", "Dragon Pulse", "Leech Seed", "Protect"]
  },
  "Araquanid": {
    dex: 752,
    sprite: "araquanid",
    types: ["Water", "Bug"],
    base: { hp: 68, atk: 70, def: 92, spa: 50, spd: 132, spe: 42 },
    abilities: ["Water Bubble"],
    defaultMoves: ["Liquidation", "Leech Life", "Wide Guard", "Protect"]
  },
  "Arbok": {
    dex: 24,
    sprite: "arbok",
    types: ["Poison"],
    base: { hp: 60, atk: 95, def: 69, spa: 65, spd: 79, spe: 80 },
    abilities: ["Intimidate", "Shed Skin"],
    defaultMoves: ["Gunk Shot", "Knock Off", "Glare", "Protect"]
  },
  "Arboliva": {
    dex: 930,
    sprite: "arboliva",
    types: ["Grass", "Normal"],
    base: { hp: 78, atk: 69, def: 90, spa: 125, spd: 109, spe: 39 },
    abilities: ["Seed Sower", "Harvest"],
    defaultMoves: ["Hyper Voice", "Energy Ball", "Earth Power", "Protect"]
  },
  "Arcanine": {
    dex: 59,
    sprite: "arcanine",
    types: ["Fire"],
    base: { hp: 90, atk: 110, def: 80, spa: 100, spd: 80, spe: 95 },
    abilities: ["Intimidate", "Flash Fire", "Justified"],
    defaultMoves: ["Flare Blitz", "Extreme Speed", "Protect", "Helping Hand"]
  },
  "Arcanine-Hisui": {
    dex: 59,
    sprite: "arcanine-hisui",
    types: ["Fire", "Rock"],
    base: { hp: 95, atk: 115, def: 80, spa: 95, spd: 80, spe: 90 },
    abilities: ["Intimidate", "Rock Head"],
    defaultMoves: ["Rock Slide", "Flare Blitz", "Extreme Speed", "Protect"]
  },
  "Archaludon": {
    dex: 1018,
    sprite: "archaludon",
    types: ["Steel", "Dragon"],
    base: { hp: 90, atk: 105, def: 130, spa: 125, spd: 65, spe: 85 },
    abilities: ["Stamina", "Stalwart"],
    defaultMoves: ["Electro Shot", "Flash Cannon", "Draco Meteor", "Body Press"]
  },
  "Ariados": {
    dex: 168,
    sprite: "ariados",
    types: ["Bug", "Poison"],
    base: { hp: 70, atk: 90, def: 70, spa: 60, spd: 70, spe: 40 },
    abilities: ["Swarm", "Insomnia", "Sniper"],
    defaultMoves: ["Poison Jab", "First Impression", "Sticky Web", "Protect"]
  },
  "Armarouge": {
    dex: 936,
    sprite: "armarouge",
    types: ["Fire", "Psychic"],
    base: { hp: 85, atk: 60, def: 100, spa: 125, spd: 80, spe: 75 },
    abilities: ["Flash Fire", "Weak Armor"],
    defaultMoves: ["Expanding Force", "Armor Cannon", "Trick Room", "Wide Guard"]
  },
  "Aromatisse": {
    dex: 683,
    sprite: "aromatisse",
    types: ["Fairy"],
    base: { hp: 101, atk: 72, def: 72, spa: 99, spd: 89, spe: 29 },
    abilities: ["Aroma Veil", "Healer"],
    defaultMoves: ["Dazzling Gleam", "Trick Room", "Heal Pulse", "Protect"]
  },
  "Audino": {
    dex: 531,
    sprite: "audino",
    types: ["Normal"],
    base: { hp: 103, atk: 60, def: 86, spa: 60, spd: 86, spe: 50 },
    abilities: ["Regenerator", "Healer"],
    defaultMoves: ["Hyper Voice", "Trick Room", "Helping Hand", "Protect"],
    megas: {
      "Audinite": {
        name: "Audino-Mega",
        sprite: "audino-mega",
        fallbackSprite: "audino",
        types: ["Normal", "Fairy"],
        base: { hp: 103, atk: 60, def: 126, spa: 80, spd: 126, spe: 50 },
        ability: "Healer"
      }
    },
    defaultMegaStone: "Audinite"
  },
  "Aurorus": {
    dex: 699,
    sprite: "aurorus",
    types: ["Rock", "Ice"],
    base: { hp: 123, atk: 77, def: 72, spa: 99, spd: 92, spe: 58 },
    abilities: ["Refrigerate", "Snow Warning"],
    defaultMoves: ["Hyper Voice", "Blizzard", "Earth Power", "Protect"]
  },
  "Avalugg": {
    dex: 713,
    sprite: "avalugg",
    types: ["Ice"],
    base: { hp: 95, atk: 117, def: 184, spa: 44, spd: 46, spe: 28 },
    abilities: ["Sturdy", "Ice Body", "Own Tempo"],
    defaultMoves: ["Icicle Crash", "Body Press", "Wide Guard", "Protect"]
  },
  "Avalugg-Hisui": {
    dex: 713,
    sprite: "avalugg-hisui",
    types: ["Ice", "Rock"],
    base: { hp: 95, atk: 127, def: 184, spa: 34, spd: 36, spe: 38 },
    abilities: ["Strong Jaw", "Sturdy"],
    defaultMoves: ["Mountain Gale", "Rock Slide", "Body Press", "Protect"]
  },
  "Azumarill": {
    dex: 184,
    sprite: "azumarill",
    types: ["Water", "Fairy"],
    base: { hp: 100, atk: 50, def: 80, spa: 60, spd: 80, spe: 50 },
    abilities: ["Huge Power", "Sap Sipper"],
    defaultMoves: ["Liquidation", "Play Rough", "Aqua Jet", "Protect"]
  },
  "Banette": {
    dex: 354,
    sprite: "banette",
    types: ["Ghost"],
    base: { hp: 64, atk: 115, def: 65, spa: 83, spd: 63, spe: 65 },
    abilities: ["Frisk", "Insomnia"],
    defaultMoves: ["Shadow Claw", "Sucker Punch", "Will-O-Wisp", "Protect"],
    megas: {
      "Banettite": {
        name: "Banette-Mega",
        sprite: "banette-mega",
        fallbackSprite: "banette",
        types: ["Ghost"],
        base: { hp: 64, atk: 165, def: 75, spa: 93, spd: 83, spe: 75 },
        ability: "Prankster"
      }
    },
    defaultMegaStone: "Banettite"
  },
  "Barbaracle": {
    dex: 689,
    sprite: "barbaracle",
    types: ["Rock", "Water"],
    base: { hp: 72, atk: 105, def: 115, spa: 54, spd: 86, spe: 68 },
    abilities: ["Tough Claws", "Sniper"],
    defaultMoves: ["Razor Shell", "Rock Slide", "Cross Chop", "Protect"],
    megas: {
      "Barbaracite": {
        name: "Barbaracle-Mega",
        sprite: "barbaracle-mega",
        fallbackSprite: "barbaracle",
        types: ["Rock", "Water"],
        base: { hp: 72, atk: 140, def: 135, spa: 64, spd: 101, spe: 88 },
        ability: "Tough Claws"
      }
    },
    defaultMegaStone: "Barbaracite"
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
  "Bastiodon": {
    dex: 411,
    sprite: "bastiodon",
    types: ["Rock", "Steel"],
    base: { hp: 60, atk: 52, def: 168, spa: 47, spd: 138, spe: 30 },
    abilities: ["Sturdy", "Soundproof"],
    defaultMoves: ["Body Press", "Heavy Slam", "Wide Guard", "Protect"]
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
        fallbackSprite: "baxcalibur",
        types: ["Dragon", "Ice"],
        base: { hp: 115, atk: 175, def: 117, spa: 105, spd: 101, spe: 87 },
        ability: "Thermal Exchange"
      }
    },
    defaultMegaStone: "Baxcalibrite"
  },
  "Beartic": {
    dex: 614,
    sprite: "beartic",
    types: ["Ice"],
    base: { hp: 95, atk: 130, def: 80, spa: 70, spd: 80, spe: 50 },
    abilities: ["Slush Rush", "Swift Swim", "Snow Cloak"],
    defaultMoves: ["Icicle Crash", "Close Combat", "Aqua Jet", "Protect"]
  },
  "Beedrill": {
    dex: 15,
    sprite: "beedrill",
    types: ["Bug", "Poison"],
    base: { hp: 65, atk: 90, def: 40, spa: 45, spd: 80, spe: 75 },
    abilities: ["Swarm", "Sniper"],
    defaultMoves: ["Poison Jab", "U-turn", "Drill Run", "Protect"],
    megas: {
      "Beedrillite": {
        name: "Beedrill-Mega",
        sprite: "beedrill-mega",
        fallbackSprite: "beedrill",
        types: ["Bug", "Poison"],
        base: { hp: 65, atk: 150, def: 40, spa: 15, spd: 80, spe: 145 },
        ability: "Adaptability"
      }
    },
    defaultMegaStone: "Beedrillite"
  },
  "Bellibolt": {
    dex: 939,
    sprite: "bellibolt",
    types: ["Electric"],
    base: { hp: 109, atk: 64, def: 91, spa: 103, spd: 83, spe: 45 },
    abilities: ["Electromorphosis", "Static"],
    defaultMoves: ["Thunderbolt", "Muddy Water", "Protect", "Sucker Punch"]
  },
  "Blastoise": {
    dex: 9,
    sprite: "blastoise",
    types: ["Water"],
    base: { hp: 79, atk: 83, def: 100, spa: 85, spd: 105, spe: 78 },
    abilities: ["Torrent", "Rain Dish"],
    defaultMoves: ["Water Spout", "Ice Beam", "Aura Sphere", "Protect"],
    megas: {
      "Blastoisinite": {
        name: "Blastoise-Mega",
        sprite: "blastoise-mega",
        fallbackSprite: "blastoise",
        types: ["Water"],
        base: { hp: 79, atk: 103, def: 120, spa: 135, spd: 115, spe: 78 },
        ability: "Mega Launcher"
      }
    },
    defaultMegaStone: "Blastoisinite"
  },
  "Blaziken": {
    dex: 257,
    sprite: "blaziken",
    types: ["Fire", "Fighting"],
    base: { hp: 80, atk: 120, def: 70, spa: 110, spd: 70, spe: 80 },
    abilities: ["Speed Boost", "Blaze"],
    defaultMoves: ["Flare Blitz", "Close Combat", "Rock Slide", "Protect"],
    megas: {
      "Blazikenite": {
        name: "Blaziken-Mega",
        sprite: "blaziken-mega",
        fallbackSprite: "blaziken",
        types: ["Fire", "Fighting"],
        base: { hp: 80, atk: 160, def: 80, spa: 130, spd: 80, spe: 100 },
        ability: "Speed Boost"
      }
    },
    defaultMegaStone: "Blazikenite"
  },
  "Camerupt": {
    dex: 323,
    sprite: "camerupt",
    types: ["Fire", "Ground"],
    base: { hp: 70, atk: 100, def: 70, spa: 105, spd: 75, spe: 40 },
    abilities: ["Solid Rock", "Magma Armor"],
    defaultMoves: ["Eruption", "Earth Power", "Heat Wave", "Protect"],
    megas: {
      "Cameruptite": {
        name: "Camerupt-Mega",
        sprite: "camerupt-mega",
        fallbackSprite: "camerupt",
        types: ["Fire", "Ground"],
        base: { hp: 70, atk: 120, def: 100, spa: 145, spd: 105, spe: 20 },
        ability: "Sheer Force"
      }
    },
    defaultMegaStone: "Cameruptite"
  },
  "Ceruledge": {
    dex: 937,
    sprite: "ceruledge",
    types: ["Fire", "Ghost"],
    base: { hp: 75, atk: 125, def: 80, spa: 60, spd: 100, spe: 85 },
    abilities: ["Flash Fire", "Weak Armor"],
    defaultMoves: ["Bitter Blade", "Shadow Sneak", "Close Combat", "Protect"]
  },
  "Chandelure": {
    dex: 609,
    sprite: "chandelure",
    types: ["Ghost", "Fire"],
    base: { hp: 60, atk: 55, def: 90, spa: 145, spd: 90, spe: 80 },
    abilities: ["Flash Fire", "Infiltrator", "Flame Body"],
    defaultMoves: ["Heat Wave", "Shadow Ball", "Trick Room", "Protect"],
    megas: {
      "Chandelurite": {
        name: "Chandelure-Mega",
        sprite: "chandelure-mega",
        fallbackSprite: "chandelure",
        types: ["Ghost", "Fire"],
        base: { hp: 60, atk: 75, def: 105, spa: 175, spd: 105, spe: 100 },
        ability: "Shadow Tag"
      }
    },
    defaultMegaStone: "Chandelurite"
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
        fallbackSprite: "charizard",
        types: ["Fire", "Flying"],
        base: { hp: 78, atk: 104, def: 78, spa: 159, spd: 115, spe: 100 },
        ability: "Drought"
      },
      "Charizardite X": {
        name: "Charizard-Mega-X",
        sprite: "charizard-megax",
        fallbackSprite: "charizard",
        types: ["Fire", "Dragon"],
        base: { hp: 78, atk: 130, def: 111, spa: 130, spd: 85, spe: 100 },
        ability: "Tough Claws"
      }
    },
    defaultMegaStone: "Charizardite Y"
  },
  "Chesnaught": {
    dex: 652,
    sprite: "chesnaught",
    types: ["Grass", "Fighting"],
    base: { hp: 88, atk: 107, def: 122, spa: 74, spd: 75, spe: 64 },
    abilities: ["Bulletproof", "Overgrow"],
    defaultMoves: ["Wood Hammer", "Body Press", "Wide Guard", "Spiky Shield"],
    megas: {
      "Chesnaughtite": {
        name: "Chesnaught-Mega",
        sprite: "chesnaught-mega",
        fallbackSprite: "chesnaught",
        types: ["Grass", "Fighting"],
        base: { hp: 88, atk: 137, def: 152, spa: 84, spd: 95, spe: 74 },
        ability: "Bulletproof"
      }
    },
    defaultMegaStone: "Chesnaughtite"
  },
  "Chimecho": {
    dex: 358,
    sprite: "chimecho",
    types: ["Psychic"],
    base: { hp: 75, atk: 50, def: 80, spa: 95, spd: 90, spe: 65 },
    abilities: ["Levitate"],
    defaultMoves: ["Psychic", "Dazzling Gleam", "Trick Room", "Protect"],
    megas: {
      "Chimechite": {
        name: "Chimecho-Mega",
        sprite: "chimecho-mega",
        fallbackSprite: "chimecho",
        types: ["Psychic", "Steel"],
        base: { hp: 75, atk: 60, def: 105, spa: 125, spd: 120, spe: 70 },
        ability: "Levitate"
      }
    },
    defaultMegaStone: "Chimechite"
  },
  "Cinderace": {
    dex: 815,
    sprite: "cinderace",
    types: ["Fire"],
    base: { hp: 80, atk: 116, def: 75, spa: 65, spd: 75, spe: 119 },
    abilities: ["Libero", "Blaze"],
    defaultMoves: ["Pyro Ball", "High Jump Kick", "Sucker Punch", "Protect"]
  },
  "Clawitzer": {
    dex: 693,
    sprite: "clawitzer",
    types: ["Water"],
    base: { hp: 71, atk: 73, def: 88, spa: 120, spd: 89, spe: 59 },
    abilities: ["Mega Launcher"],
    defaultMoves: ["Water Pulse", "Aura Sphere", "Dark Pulse", "Protect"]
  },
  "Clefable": {
    dex: 36,
    sprite: "clefable",
    types: ["Fairy"],
    base: { hp: 95, atk: 70, def: 73, spa: 95, spd: 90, spe: 60 },
    abilities: ["Unaware", "Magic Guard", "Cute Charm"],
    defaultMoves: ["Moonblast", "Follow Me", "Helping Hand", "Protect"],
    megas: {
      "Clefablite": {
        name: "Clefable-Mega",
        sprite: "clefable-mega",
        fallbackSprite: "clefable",
        types: ["Fairy", "Flying"],
        base: { hp: 95, atk: 80, def: 93, spa: 135, spd: 110, spe: 70 },
        ability: "Magic Guard"
      }
    },
    defaultMegaStone: "Clefablite"
  },
  "Cofagrigus": {
    dex: 563,
    sprite: "cofagrigus",
    types: ["Ghost"],
    base: { hp: 58, atk: 50, def: 145, spa: 95, spd: 105, spe: 30 },
    abilities: ["Mummy"],
    defaultMoves: ["Shadow Ball", "Body Press", "Trick Room", "Protect"]
  },
  "Conkeldurr": {
    dex: 534,
    sprite: "conkeldurr",
    types: ["Fighting"],
    base: { hp: 105, atk: 140, def: 95, spa: 55, spd: 65, spe: 45 },
    abilities: ["Guts", "Iron Fist", "Sheer Force"],
    defaultMoves: ["Drain Punch", "Mach Punch", "Knock Off", "Protect"]
  },
  "Delphox": {
    dex: 655,
    sprite: "delphox",
    types: ["Fire", "Psychic"],
    base: { hp: 75, atk: 69, def: 72, spa: 114, spd: 100, spe: 104 },
    abilities: ["Blaze", "Magician"],
    defaultMoves: ["Heat Wave", "Expanding Force", "Dazzling Gleam", "Protect"],
    megas: {
      "Delphoxite": {
        name: "Delphox-Mega",
        sprite: "delphox-mega",
        fallbackSprite: "delphox",
        types: ["Fire", "Psychic"],
        base: { hp: 75, atk: 79, def: 82, spa: 154, spd: 120, spe: 124 },
        ability: "Magic Guard"
      }
    },
    defaultMegaStone: "Delphoxite"
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
        fallbackSprite: "dragonite",
        types: ["Dragon", "Flying"],
        base: { hp: 91, atk: 124, def: 115, spa: 145, spd: 125, spe: 100 },
        ability: "Multiscale"
      }
    },
    defaultMegaStone: "Dragoninite"
  },
  "Excadrill": {
    dex: 530,
    sprite: "excadrill",
    types: ["Ground", "Steel"],
    base: { hp: 110, atk: 135, def: 60, spa: 50, spd: 65, spe: 88 },
    abilities: ["Sand Rush", "Mold Breaker"],
    defaultMoves: ["High Horsepower", "Iron Head", "Rock Slide", "Protect"],
    megas: {
      "Excadrite": {
        name: "Excadrill-Mega",
        sprite: "excadrill-mega",
        fallbackSprite: "excadrill",
        types: ["Ground", "Steel"],
        base: { hp: 110, atk: 165, def: 85, spa: 60, spd: 80, spe: 108 },
        ability: "Sand Rush"
      }
    },
    defaultMegaStone: "Excadrite"
  },
  "Farigiraf": {
    dex: 981,
    sprite: "farigiraf",
    types: ["Normal", "Psychic"],
    base: { hp: 120, atk: 90, def: 70, spa: 110, spd: 70, spe: 60 },
    abilities: ["Armor Tail", "Cud Chew"],
    defaultMoves: ["Psychic", "Dazzling Gleam", "Helping Hand", "Trick Room"]
  },
  "Gallade": {
    dex: 475,
    sprite: "gallade",
    types: ["Psychic", "Fighting"],
    base: { hp: 68, atk: 125, def: 65, spa: 65, spd: 115, spe: 80 },
    abilities: ["Sharpness", "Justified", "Steadfast"],
    defaultMoves: ["Sacred Sword", "Psycho Cut", "Wide Guard", "Protect"],
    megas: {
      "Galladite": {
        name: "Gallade-Mega",
        sprite: "gallade-mega",
        fallbackSprite: "gallade",
        types: ["Psychic", "Fighting"],
        base: { hp: 68, atk: 165, def: 95, spa: 65, spd: 115, spe: 110 },
        ability: "Inner Focus"
      }
    },
    defaultMegaStone: "Galladite"
  },
  // Eternal Flower Floette is the only Floette form that can use Floettite.
  "Floette-Eternal": {
    dex: 670,
    sprite: "floette-eternal",
    types: ["Fairy"],
    base: { hp: 74, atk: 65, def: 67, spa: 125, spd: 128, spe: 92 },
    abilities: ["Flower Veil", "Symbiosis"],
    defaultMoves: ["Moonblast", "Protect", "Dazzling Gleam", "Light of Ruin"],
    megas: {
      "Floettite": {
        name: "Floette-Mega",
        sprite: "floette-mega",
        fallbackSprite: "floette-eternal",
        types: ["Fairy"],
        base: { hp: 74, atk: 85, def: 87, spa: 155, spd: 148, spe: 102 },
        ability: "Fairy Aura"
      }
    },
    defaultMegaStone: "Floettite"
  },
  "Garchomp": {
    dex: 445,
    sprite: "garchomp",
    types: ["Dragon", "Ground"],
    base: { hp: 108, atk: 130, def: 95, spa: 80, spd: 85, spe: 102 },
    abilities: ["Rough Skin", "Sand Veil"],
    defaultMoves: ["Draco Meteor", "Earth Power", "Flamethrower", "Protect"],
    megas: {
      "Garchompite Z": {
        name: "Garchomp-Mega-Z",
        sprite: "garchomp-megaz",
        fallbackSprite: "garchomp-mega",
        types: ["Dragon"],
        base: { hp: 108, atk: 130, def: 85, spa: 141, spd: 85, spe: 151 },
        ability: "Levitate"
      },
      "Garchompite": {
        name: "Garchomp-Mega",
        sprite: "garchomp-mega",
        fallbackSprite: "garchomp",
        types: ["Dragon", "Ground"],
        base: { hp: 108, atk: 170, def: 115, spa: 120, spd: 95, spe: 92 },
        ability: "Sand Force"
      }
    },
    defaultMegaStone: "Garchompite Z"
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
        fallbackSprite: "gardevoir",
        types: ["Psychic", "Fairy"],
        base: { hp: 68, atk: 85, def: 65, spa: 165, spd: 135, spe: 100 },
        ability: "Pixilate"
      }
    },
    defaultMegaStone: "Gardevoirite"
  },
  "Gengar": {
    dex: 94,
    sprite: "gengar",
    types: ["Ghost", "Poison"],
    base: { hp: 60, atk: 65, def: 60, spa: 130, spd: 75, spe: 110 },
    abilities: ["Cursed Body"],
    defaultMoves: ["Shadow Ball", "Sludge Bomb", "Icy Wind", "Protect"],
    megas: {
      "Gengarite": {
        name: "Gengar-Mega",
        sprite: "gengar-mega",
        fallbackSprite: "gengar",
        types: ["Ghost", "Poison"],
        base: { hp: 60, atk: 65, def: 80, spa: 170, spd: 95, spe: 130 },
        ability: "Shadow Tag"
      }
    },
    defaultMegaStone: "Gengarite"
  },
  "Gholdengo": {
    dex: 1000,
    sprite: "gholdengo",
    types: ["Steel", "Ghost"],
    base: { hp: 87, atk: 60, def: 95, spa: 133, spd: 91, spe: 84 },
    abilities: ["Good as Gold"],
    defaultMoves: ["Make It Rain", "Shadow Ball", "Nasty Plot", "Protect"]
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
        fallbackSprite: "glimmora",
        types: ["Rock", "Poison"],
        base: { hp: 83, atk: 90, def: 105, spa: 150, spd: 96, spe: 101 },
        ability: "Adaptability"
      }
    },
    defaultMegaStone: "Glimmoranite"
  },
  "Golisopod": {
    dex: 768,
    sprite: "golisopod",
    types: ["Bug", "Water"],
    base: { hp: 75, atk: 125, def: 140, spa: 60, spd: 90, spe: 40 },
    abilities: ["Emergency Exit"],
    defaultMoves: ["First Impression", "Liquidation", "Close Combat", "Protect"],
    megas: {
      "Golisopite": {
        name: "Golisopod-Mega",
        sprite: "golisopod-mega",
        fallbackSprite: "golisopod",
        types: ["Bug", "Steel"],
        base: { hp: 75, atk: 150, def: 175, spa: 70, spd: 120, spe: 40 },
        ability: "Tough Claws"
      }
    },
    defaultMegaStone: "Golisopite"
  },
  "Greninja": {
    dex: 658,
    sprite: "greninja",
    types: ["Water", "Dark"],
    base: { hp: 72, atk: 95, def: 67, spa: 103, spd: 71, spe: 122 },
    abilities: ["Protean", "Battle Bond", "Torrent"],
    defaultMoves: ["Hydro Pump", "Dark Pulse", "Ice Beam", "Protect"],
    megas: {
      "Greninjite": {
        name: "Greninja-Mega",
        sprite: "greninja-mega",
        fallbackSprite: "greninja",
        types: ["Water", "Dark"],
        base: { hp: 72, atk: 125, def: 77, spa: 143, spd: 81, spe: 142 },
        ability: "Protean"
      }
    },
    defaultMegaStone: "Greninjite"
  },
  "Grimmsnarl": {
    dex: 861,
    sprite: "grimmsnarl",
    types: ["Dark", "Fairy"],
    base: { hp: 95, atk: 120, def: 65, spa: 95, spd: 75, spe: 60 },
    abilities: ["Prankster"],
    defaultMoves: ["Spirit Break", "Fake Out", "Reflect", "Light Screen"]
  },
  "Gyarados": {
    dex: 130,
    sprite: "gyarados",
    types: ["Water", "Flying"],
    base: { hp: 95, atk: 125, def: 79, spa: 60, spd: 100, spe: 81 },
    abilities: ["Intimidate", "Moxie"],
    defaultMoves: ["Waterfall", "Crunch", "Dragon Dance", "Protect"],
    megas: {
      "Gyaradosite": {
        name: "Gyarados-Mega",
        sprite: "gyarados-mega",
        fallbackSprite: "gyarados",
        types: ["Water", "Dark"],
        base: { hp: 95, atk: 155, def: 109, spa: 70, spd: 130, spe: 81 },
        ability: "Mold Breaker"
      }
    },
    defaultMegaStone: "Gyaradosite"
  },
  "Hawlucha": {
    dex: 701,
    sprite: "hawlucha",
    types: ["Fighting", "Flying"],
    base: { hp: 78, atk: 92, def: 75, spa: 74, spd: 63, spe: 118 },
    abilities: ["Unburden", "Limber", "Mold Breaker"],
    defaultMoves: ["Close Combat", "Acrobatics", "Coaching", "Protect"],
    megas: {
      "Hawluchanite": {
        name: "Hawlucha-Mega",
        sprite: "hawlucha-mega",
        fallbackSprite: "hawlucha",
        types: ["Fighting", "Flying"],
        base: { hp: 78, atk: 132, def: 95, spa: 84, spd: 73, spe: 138 },
        ability: "Tough Claws"
      }
    },
    defaultMegaStone: "Hawluchanite"
  },
  "Incineroar": {
    dex: 727,
    sprite: "incineroar",
    types: ["Fire", "Dark"],
    base: { hp: 95, atk: 115, def: 90, spa: 80, spd: 90, spe: 60 },
    abilities: ["Intimidate", "Blaze"],
    defaultMoves: ["Fake Out", "Flare Blitz", "Knock Off", "Parting Shot"]
  },
  "Indeedee-F": {
    dex: 876,
    sprite: "indeedee-f",
    types: ["Psychic", "Normal"],
    base: { hp: 70, atk: 55, def: 65, spa: 95, spd: 105, spe: 85 },
    abilities: ["Psychic Surge", "Synchronize"],
    defaultMoves: ["Follow Me", "Psychic", "Helping Hand", "Trick Room"]
  },
  "Kangaskhan": {
    dex: 115,
    sprite: "kangaskhan",
    types: ["Normal"],
    base: { hp: 105, atk: 95, def: 80, spa: 40, spd: 80, spe: 90 },
    abilities: ["Scrappy", "Inner Focus"],
    defaultMoves: ["Fake Out", "Body Slam", "Sucker Punch", "Protect"],
    megas: {
      "Kangaskhanite": {
        name: "Kangaskhan-Mega",
        sprite: "kangaskhan-mega",
        fallbackSprite: "kangaskhan",
        types: ["Normal"],
        base: { hp: 105, atk: 125, def: 100, spa: 60, spd: 100, spe: 100 },
        ability: "Parental Bond"
      }
    },
    defaultMegaStone: "Kangaskhanite"
  },
  "Kingambit": {
    dex: 983,
    sprite: "kingambit",
    types: ["Dark", "Steel"],
    base: { hp: 100, atk: 135, def: 120, spa: 60, spd: 85, spe: 50 },
    abilities: ["Defiant", "Supreme Overlord"],
    defaultMoves: ["Kowtow Cleave", "Iron Head", "Sucker Punch", "Protect"]
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
        sprite: "lucario-megaz",
        fallbackSprite: "lucario-mega",
        types: ["Fighting", "Steel"],
        base: { hp: 70, atk: 100, def: 70, spa: 164, spd: 70, spe: 151 },
        ability: "Aura Guard"
      },
      "Lucarionite": {
        name: "Lucario-Mega",
        sprite: "lucario-mega",
        fallbackSprite: "lucario",
        types: ["Fighting", "Steel"],
        base: { hp: 70, atk: 145, def: 88, spa: 140, spd: 70, spe: 112 },
        ability: "Adaptability"
      }
    },
    defaultMegaStone: "Lucarionite Z"
  },
  "Mawile": {
    dex: 303,
    sprite: "mawile",
    types: ["Steel", "Fairy"],
    base: { hp: 50, atk: 85, def: 85, spa: 55, spd: 55, spe: 50 },
    abilities: ["Intimidate", "Hyper Cutter"],
    defaultMoves: ["Play Rough", "Iron Head", "Sucker Punch", "Protect"],
    megas: {
      "Mawilite": {
        name: "Mawile-Mega",
        sprite: "mawile-mega",
        fallbackSprite: "mawile",
        types: ["Steel", "Fairy"],
        base: { hp: 50, atk: 105, def: 125, spa: 55, spd: 95, spe: 50 },
        ability: "Huge Power"
      }
    },
    defaultMegaStone: "Mawilite"
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
        fallbackSprite: "metagross",
        types: ["Steel", "Psychic"],
        base: { hp: 80, atk: 145, def: 150, spa: 105, spd: 110, spe: 110 },
        ability: "Tough Claws"
      }
    },
    defaultMegaStone: "Metagrossite"
  },
  "Ninetales-Alola": {
    dex: 38,
    sprite: "ninetales-alola",
    types: ["Ice", "Fairy"],
    base: { hp: 73, atk: 67, def: 75, spa: 81, spd: 100, spe: 109 },
    abilities: ["Snow Warning"],
    defaultMoves: ["Blizzard", "Moonblast", "Aurora Veil", "Protect"]
  },
  "Pelipper": {
    dex: 279,
    sprite: "pelipper",
    types: ["Water", "Flying"],
    base: { hp: 60, atk: 50, def: 100, spa: 95, spd: 70, spe: 65 },
    abilities: ["Drizzle", "Keen Eye"],
    defaultMoves: ["Weather Ball", "Hurricane", "Wide Guard", "Tailwind"]
  },
  "Pincurchin": {
    dex: 871,
    sprite: "pincurchin",
    types: ["Electric"],
    base: { hp: 48, atk: 101, def: 95, spa: 91, spd: 85, spe: 15 },
    abilities: ["Electric Surge", "Lightning Rod"],
    defaultMoves: ["Zing Zap", "Scald", "Sucker Punch", "Protect"]
  },
  "Primarina": {
    dex: 730,
    sprite: "primarina",
    types: ["Water", "Fairy"],
    base: { hp: 80, atk: 74, def: 74, spa: 126, spd: 116, spe: 60 },
    abilities: ["Liquid Voice", "Torrent"],
    defaultMoves: ["Hyper Voice", "Moonblast", "Haze", "Protect"]
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
        sprite: "raichu-megay",
        fallbackSprite: "raichu",
        types: ["Electric"],
        base: { hp: 60, atk: 100, def: 55, spa: 160, spd: 85, spe: 130 },
        ability: "No Guard"
      },
      "Raichunite X": {
        name: "Raichu-Mega-X",
        sprite: "raichu-megax",
        fallbackSprite: "raichu",
        types: ["Electric"],
        base: { hp: 60, atk: 135, def: 95, spa: 90, spd: 95, spe: 110 },
        ability: "Levitate"
      }
    },
    defaultMegaStone: "Raichunite Y"
  },
  "Rillaboom": {
    dex: 812,
    sprite: "rillaboom",
    types: ["Grass"],
    base: { hp: 100, atk: 125, def: 90, spa: 60, spd: 70, spe: 85 },
    abilities: ["Grassy Surge", "Overgrow"],
    defaultMoves: ["Fake Out", "Grassy Glide", "Wood Hammer", "U-turn"]
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
        fallbackSprite: "salamence",
        types: ["Dragon", "Flying"],
        base: { hp: 95, atk: 145, def: 130, spa: 120, spd: 90, spe: 120 },
        ability: "Aerilate"
      }
    },
    defaultMegaStone: "Salamencite"
  },
  "Scizor": {
    dex: 212,
    sprite: "scizor",
    types: ["Bug", "Steel"],
    base: { hp: 70, atk: 130, def: 100, spa: 55, spd: 80, spe: 65 },
    abilities: ["Technician", "Swarm"],
    defaultMoves: ["Bullet Punch", "U-turn", "Close Combat", "Protect"],
    megas: {
      "Scizorite": {
        name: "Scizor-Mega",
        sprite: "scizor-mega",
        fallbackSprite: "scizor",
        types: ["Bug", "Steel"],
        base: { hp: 70, atk: 150, def: 140, spa: 65, spd: 100, spe: 75 },
        ability: "Technician"
      }
    },
    defaultMegaStone: "Scizorite"
  },
  "Sinistcha": {
    dex: 1013,
    sprite: "sinistcha",
    types: ["Grass", "Ghost"],
    base: { hp: 71, atk: 60, def: 106, spa: 121, spd: 80, spe: 70 },
    abilities: ["Hospitality", "Heatproof"],
    defaultMoves: ["Matcha Gotcha", "Shadow Ball", "Rage Powder", "Trick Room"]
  },
  "Sneasler": {
    dex: 903,
    sprite: "sneasler",
    types: ["Fighting", "Poison"],
    base: { hp: 80, atk: 130, def: 60, spa: 40, spd: 80, spe: 120 },
    abilities: ["Unburden", "Poison Touch", "Pressure"],
    defaultMoves: ["Close Combat", "Dire Claw", "Fake Out", "Coaching"]
  },
  "Milotic": {
    dex: 350,
    sprite: "milotic",
    types: ["Water"],
    base: { hp: 95, atk: 60, def: 79, spa: 100, spd: 125, spe: 81 },
    abilities: ["Marvel Scale", "Competitive", "Cute Charm"],
    defaultMoves: ["Scald", "Ice Beam", "Icy Wind", "Protect"]
  },
  "Torkoal": {
    dex: 324,
    sprite: "torkoal",
    types: ["Fire"],
    base: { hp: 70, atk: 85, def: 140, spa: 85, spd: 70, spe: 20 },
    abilities: ["Drought", "White Smoke"],
    defaultMoves: ["Eruption", "Heat Wave", "Earth Power", "Protect"]
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
        fallbackSprite: "tyranitar",
        types: ["Rock", "Dark"],
        base: { hp: 100, atk: 164, def: 150, spa: 95, spd: 120, spe: 71 },
        ability: "Sand Stream"
      }
    },
    defaultMegaStone: "Tyranitarite"
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
        fallbackSprite: "venusaur",
        types: ["Grass", "Poison"],
        base: { hp: 80, atk: 100, def: 123, spa: 122, spd: 120, spe: 80 },
        ability: "Thick Fat"
      }
    },
    defaultMegaStone: "Venusaurite"
  },
  "Whimsicott": {
    dex: 547,
    sprite: "whimsicott",
    types: ["Grass", "Fairy"],
    base: { hp: 60, atk: 67, def: 85, spa: 77, spd: 75, spe: 116 },
    abilities: ["Prankster", "Infiltrator"],
    defaultMoves: ["Moonblast", "Tailwind", "Encore", "Sunny Day"]
  }
};

// Pokémon Champions Regulation M-C: held items verified Nov 23, 2026.
// Sources: https://champforge.app/en/regulations/m-c (85 regular items + 81 Mega Stones, Meowsticite cross-checked with Pokémon Zone)
//          https://www.pokemon-zone.com/champions/items/
// "None" is a UI choice, not a battle item.
const REG_MC_HELD_ITEMS = [
  "Air Balloon",
  "Aspear Berry",
  "Babiri Berry",
  "Big Root",
  "Binding Band",
  "Black Belt",
  "Black Glasses",
  "Bright Powder",
  "Charcoal",
  "Charti Berry",
  "Cheri Berry",
  "Chesto Berry",
  "Chilan Berry",
  "Choice Scarf",
  "Chople Berry",
  "Coba Berry",
  "Colbur Berry",
  "Damp Rock",
  "Dragon Fang",
  "Eject Button",
  "Electric Seed",
  "Expert Belt",
  "Fairy Feather",
  "Focus Band",
  "Focus Sash",
  "Grassy Seed",
  "Haban Berry",
  "Hard Stone",
  "Heat Rock",
  "Icy Rock",
  "Iron Ball",
  "Kasib Berry",
  "Kebia Berry",
  "King's Rock",
  "Leek",
  "Leftovers",
  "Leppa Berry",
  "Life Orb",
  "Light Ball",
  "Light Clay",
  "Lum Berry",
  "Magnet",
  "Mental Herb",
  "Metal Coat",
  "Metronome",
  "Miracle Seed",
  "Misty Seed",
  "Muscle Band",
  "Mystic Water",
  "Never-Melt Ice",
  "Normal Gem",
  "Occa Berry",
  "Oran Berry",
  "Passho Berry",
  "Payapa Berry",
  "Pecha Berry",
  "Persim Berry",
  "Poison Barb",
  "Psychic Seed",
  "Quick Claw",
  "Rawst Berry",
  "Red Card",
  "Rindo Berry",
  "Rocky Helmet",
  "Roseli Berry",
  "Scope Lens",
  "Sharp Beak",
  "Shed Shell",
  "Shell Bell",
  "Shuca Berry",
  "Silk Scarf",
  "Silver Powder",
  "Sitrus Berry",
  "Smooth Rock",
  "Soft Sand",
  "Spell Tag",
  "Tanga Berry",
  "Terrain Extender",
  "Twisted Spoon",
  "Wacan Berry",
  "White Herb",
  "Wide Lens",
  "Wise Glasses",
  "Yache Berry",
  "Zoom Lens"
];
const REG_MC_MEGA_STONES = [
  "Abomasite",
  "Absolite",
  "Absolite Z",
  "Aerodactylite",
  "Aggronite",
  "Alakazite",
  "Altarianite",
  "Ampharosite",
  "Audinite",
  "Banettite",
  "Barbaracite",
  "Baxcalibrite",
  "Beedrillite",
  "Blastoisinite",
  "Blazikenite",
  "Cameruptite",
  "Chandelurite",
  "Charizardite X",
  "Charizardite Y",
  "Chesnaughtite",
  "Chimechite",
  "Clefablite",
  "Crabominite",
  "Delphoxite",
  "Dragalgite",
  "Dragoninite",
  "Drampanite",
  "Eelektrossite",
  "Emboarite",
  "Excadrite",
  "Falinksite",
  "Feraligite",
  "Floettite",
  "Froslassite",
  "Galladite",
  "Garchompite",
  "Garchompite Z",
  "Gardevoirite",
  "Gengarite",
  "Glalitite",
  "Glimmoranite",
  "Golisopite",
  "Golurkite",
  "Greninjite",
  "Gyaradosite",
  "Hawluchanite",
  "Heracronite",
  "Houndoominite",
  "Kangaskhanite",
  "Lopunnite",
  "Lucarionite",
  "Lucarionite Z",
  "Malamarite",
  "Manectite",
  "Mawilite",
  "Medichamite",
  "Meganiumite",
  "Meowsticite",
  "Metagrossite",
  "Pidgeotite",
  "Pinsirite",
  "Pyroarite",
  "Raichunite X",
  "Raichunite Y",
  "Sablenite",
  "Salamencite",
  "Sceptilite",
  "Scizorite",
  "Scolipite",
  "Scovillainite",
  "Scraftinite",
  "Sharpedonite",
  "Skarmorite",
  "Slowbronite",
  "Staraptite",
  "Starminite",
  "Steelixite",
  "Swampertite",
  "Tyranitarite",
  "Venusaurite",
  "Victreebelite"
];
const ITEMS_MC = ["None", ...REG_MC_HELD_ITEMS, ...REG_MC_MEGA_STONES];

// Competitive VGC Moves Database
const MOVES_DB = {
  "Protect":          { bp: 0,   type: "Normal",   cat: "Status",   spread: false },
  "Spiky Shield":     { bp: 0,   type: "Grass",    cat: "Status",   spread: false },
  "King's Shield":    { bp: 0,   type: "Steel",    cat: "Status",   spread: false },
  "Fake Out":         { bp: 40,  type: "Normal",   cat: "Physical", spread: false, contact: true },
  "Follow Me":        { bp: 0,   type: "Normal",   cat: "Status",   spread: false },
  "Rage Powder":      { bp: 0,   type: "Bug",      cat: "Status",   spread: false },
  "Helping Hand":     { bp: 0,   type: "Normal",   cat: "Status",   spread: false },
  "Decorate":         { bp: 0,   type: "Fairy",    cat: "Status",   spread: false },
  "Tailwind":         { bp: 0,   type: "Flying",   cat: "Status",   spread: false },
  "Trick Room":       { bp: 0,   type: "Psychic",  cat: "Status",   spread: false },
  "Imprison":         { bp: 0,   type: "Psychic",  cat: "Status",   spread: false },
  "Wide Guard":       { bp: 0,   type: "Rock",     cat: "Status",   spread: false },
  "Parting Shot":     { bp: 0,   type: "Dark",     cat: "Status",   spread: false },
  "Coaching":         { bp: 0,   type: "Fighting", cat: "Status",   spread: false },
  "Nasty Plot":       { bp: 0,   type: "Dark",     cat: "Status",   spread: false },
  "Bulk Up":          { bp: 0,   type: "Fighting", cat: "Status",   spread: false },
  "Dragon Dance":     { bp: 0,   type: "Dragon",   cat: "Status",   spread: false },
  "Encore":           { bp: 0,   type: "Normal",   cat: "Status",   spread: false },
  "Sunny Day":        { bp: 0,   type: "Fire",     cat: "Status",   spread: false },
  "Reflect":          { bp: 0,   type: "Psychic",  cat: "Status",   spread: false },
  "Light Screen":     { bp: 0,   type: "Psychic",  cat: "Status",   spread: false },
  "Aurora Veil":      { bp: 0,   type: "Ice",      cat: "Status",   spread: false },
  "Haze":             { bp: 0,   type: "Ice",      cat: "Status",   spread: false },
  "Heal Pulse":       { bp: 0,   type: "Psychic",  cat: "Status",   spread: false },
  "Will-O-Wisp":      { bp: 0,   type: "Fire",     cat: "Status",   spread: false },
  "Glare":            { bp: 0,   type: "Normal",   cat: "Status",   spread: false },
  "Sticky Web":       { bp: 0,   type: "Bug",      cat: "Status",   spread: false },
  "Leech Seed":       { bp: 0,   type: "Grass",    cat: "Status",   spread: false },
  "Earthquake":       { bp: 100, type: "Ground",   cat: "Physical", spread: true },
  "High Horsepower":  { bp: 95,  type: "Ground",   cat: "Physical", spread: false, contact: true },
  "Stomping Tantrum": { bp: 75,  type: "Ground",   cat: "Physical", spread: false, contact: true },
  "Drill Run":        { bp: 80,  type: "Ground",   cat: "Physical", spread: false, contact: true },
  "Earth Power":      { bp: 90,  type: "Ground",   cat: "Special",  spread: false },
  "Dragon Claw":      { bp: 80,  type: "Dragon",   cat: "Physical", spread: false, contact: true },
  "Glaive Rush":      { bp: 120, type: "Dragon",   cat: "Physical", spread: false, contact: true },
  "Draco Meteor":     { bp: 130, type: "Dragon",   cat: "Special",  spread: false },
  "Dragon Pulse":     { bp: 85,  type: "Dragon",   cat: "Special",  spread: false },
  "Rock Tomb":        { bp: 60,  type: "Rock",     cat: "Physical", spread: false },
  "Rock Slide":       { bp: 75,  type: "Rock",     cat: "Physical", spread: true },
  "Power Gem":        { bp: 80,  type: "Rock",     cat: "Special",  spread: false },
  "Close Combat":     { bp: 120, type: "Fighting", cat: "Physical", spread: false, contact: true },
  "Sacred Sword":     { bp: 90,  type: "Fighting", cat: "Physical", spread: false, contact: true, slicing: true },
  "Drain Punch":      { bp: 75,  type: "Fighting", cat: "Physical", spread: false, contact: true },
  "Mach Punch":       { bp: 40,  type: "Fighting", cat: "Physical", spread: false, contact: true },
  "Low Kick":         { bp: 100, type: "Fighting", cat: "Physical", spread: false, contact: true },
  "Body Press":       { bp: 80,  type: "Fighting", cat: "Physical", spread: false, contact: true },
  "Cross Chop":       { bp: 100, type: "Fighting", cat: "Physical", spread: false, contact: true },
  "High Jump Kick":   { bp: 130, type: "Fighting", cat: "Physical", spread: false, contact: true },
  "Aura Sphere":      { bp: 80,  type: "Fighting", cat: "Special",  spread: false },
  "Vacuum Wave":      { bp: 40,  type: "Fighting", cat: "Special",  spread: false },
  "Dire Claw":        { bp: 80,  type: "Poison",   cat: "Physical", spread: false, contact: true },
  "Gunk Shot":        { bp: 120, type: "Poison",   cat: "Physical", spread: false },
  "Poison Jab":       { bp: 80,  type: "Poison",   cat: "Physical", spread: false, contact: true },
  "Sludge Bomb":      { bp: 90,  type: "Poison",   cat: "Special",  spread: false },
  "Grassy Glide":     { bp: 55,  type: "Grass",    cat: "Physical", spread: false, contact: true },
  "Wood Hammer":      { bp: 120, type: "Grass",    cat: "Physical", spread: false, contact: true },
  "Energy Ball":      { bp: 90,  type: "Grass",    cat: "Special",  spread: false },
  "Apple Acid":       { bp: 80,  type: "Grass",    cat: "Special",  spread: false },
  "Solar Beam":       { bp: 120, type: "Grass",    cat: "Special",  spread: false },
  "Matcha Gotcha":    { bp: 80,  type: "Grass",    cat: "Special",  spread: true },
  "U-turn":           { bp: 70,  type: "Bug",      cat: "Physical", spread: false, contact: true },
  "First Impression": { bp: 90,  type: "Bug",      cat: "Physical", spread: false, contact: true },
  "Leech Life":       { bp: 80,  type: "Bug",      cat: "Physical", spread: false, contact: true },
  "Flare Blitz":      { bp: 120, type: "Fire",     cat: "Physical", spread: false, contact: true },
  "Bitter Blade":     { bp: 90,  type: "Fire",     cat: "Physical", spread: false, contact: true, slicing: true },
  "Pyro Ball":        { bp: 120, type: "Fire",     cat: "Physical", spread: false },
  "Flamethrower":     { bp: 90,  type: "Fire",     cat: "Special",  spread: false },
  "Heat Wave":        { bp: 95,  type: "Fire",     cat: "Special",  spread: true },
  "Eruption":         { bp: 150, type: "Fire",     cat: "Special",  spread: true },
  "Armor Cannon":     { bp: 120, type: "Fire",     cat: "Special",  spread: false },
  "Knock Off":        { bp: 65,  type: "Dark",     cat: "Physical", spread: false, contact: true },
  "Kowtow Cleave":    { bp: 85,  type: "Dark",     cat: "Physical", spread: false, contact: true, slicing: true },
  "Sucker Punch":     { bp: 70,  type: "Dark",     cat: "Physical", spread: false, contact: true },
  "Night Slash":      { bp: 70,  type: "Dark",     cat: "Physical", spread: false, contact: true, slicing: true },
  "Crunch":           { bp: 80,  type: "Dark",     cat: "Physical", spread: false, contact: true },
  "Dark Pulse":       { bp: 80,  type: "Dark",     cat: "Special",  spread: false },
  "Iron Head":        { bp: 80,  type: "Steel",    cat: "Physical", spread: false, contact: true },
  "Heavy Slam":       { bp: 100, type: "Steel",    cat: "Physical", spread: false, contact: true },
  "Bullet Punch":     { bp: 40,  type: "Steel",    cat: "Physical", spread: false, contact: true },
  "Flash Cannon":     { bp: 80,  type: "Steel",    cat: "Special",  spread: false },
  "Make It Rain":     { bp: 120, type: "Steel",    cat: "Special",  spread: true },
  "Psychic":          { bp: 90,  type: "Psychic",  cat: "Special",  spread: false },
  "Expanding Force":  { bp: 80,  type: "Psychic",  cat: "Special",  spread: false },
  "Psychic Fangs":    { bp: 85,  type: "Psychic",  cat: "Physical", spread: false, contact: true },
  "Psycho Cut":       { bp: 70,  type: "Psychic",  cat: "Physical", spread: false, slicing: true },
  "Shadow Ball":      { bp: 80,  type: "Ghost",    cat: "Special",  spread: false },
  "Shadow Claw":      { bp: 70,  type: "Ghost",    cat: "Physical", spread: false, contact: true, slicing: true },
  "Shadow Sneak":     { bp: 40,  type: "Ghost",    cat: "Physical", spread: false, contact: true },
  "Last Respects":    { bp: 100, type: "Ghost",    cat: "Physical", spread: false },
  "Rage Fist":        { bp: 100, type: "Ghost",    cat: "Physical", spread: false, contact: true },
  "Wave Crash":       { bp: 120, type: "Water",    cat: "Physical", spread: false, contact: true },
  "Liquidation":      { bp: 85,  type: "Water",    cat: "Physical", spread: false, contact: true },
  "Waterfall":        { bp: 80,  type: "Water",    cat: "Physical", spread: false, contact: true },
  "Razor Shell":      { bp: 75,  type: "Water",    cat: "Physical", spread: false, contact: true, slicing: true },
  "Aqua Jet":         { bp: 40,  type: "Water",    cat: "Physical", spread: false, contact: true },
  "Weather Ball":     { bp: 50,  type: "Normal",    cat: "Special",  spread: false },
  "Muddy Water":      { bp: 90,  type: "Water",    cat: "Special",  spread: true },
  "Scald":            { bp: 80,  type: "Water",    cat: "Special",  spread: false },
  "Hydro Pump":       { bp: 110, type: "Water",    cat: "Special",  spread: false },
  "Water Spout":      { bp: 150, type: "Water",    cat: "Special",  spread: true },
  "Water Pulse":      { bp: 60,  type: "Water",    cat: "Special",  spread: false },
  "Hurricane":        { bp: 110, type: "Flying",   cat: "Special",  spread: false },
  "Air Slash":        { bp: 75,  type: "Flying",   cat: "Special",  spread: false },
  "Dual Wingbeat":    { bp: 80,  type: "Flying",   cat: "Physical", spread: false, contact: true },
  "Acrobatics":       { bp: 55,  type: "Flying",   cat: "Physical", spread: false, contact: true },
  "Double-Edge":      { bp: 120, type: "Normal",   cat: "Physical", spread: false, contact: true },
  "Body Slam":        { bp: 85,  type: "Normal",   cat: "Physical", spread: false, contact: true },
  "Hyper Voice":      { bp: 90,  type: "Normal",   cat: "Special",  spread: true },
  "Extreme Speed":    { bp: 80,  type: "Normal",   cat: "Physical", spread: false, contact: true },
  "Feint":            { bp: 30,  type: "Normal",   cat: "Physical", spread: false },
  "Icicle Crash":     { bp: 85,  type: "Ice",      cat: "Physical", spread: false },
  "Mountain Gale":    { bp: 100, type: "Ice",      cat: "Physical", spread: false },
  "Ice Shard":        { bp: 40,  type: "Ice",      cat: "Physical", spread: false },
  "Ice Beam":         { bp: 90,  type: "Ice",      cat: "Special",  spread: false },
  "Blizzard":         { bp: 110, type: "Ice",      cat: "Special",  spread: true },
  "Icy Wind":         { bp: 55,  type: "Ice",      cat: "Special",  spread: true },
  "Electro Shot":     { bp: 130, type: "Electric", cat: "Special",  spread: false },
  "Thunderbolt":      { bp: 90,  type: "Electric", cat: "Special",  spread: false },
  "Zap Cannon":      { bp: 120, type: "Electric", cat: "Special",  spread: false },
  "Focus Blast":     { bp: 120, type: "Fighting", cat: "Special",  spread: false },
  "Volt Switch":      { bp: 70,  type: "Electric", cat: "Special",  spread: false },
  "Zing Zap":         { bp: 80,  type: "Electric", cat: "Physical", spread: false, contact: true },
  "Nuzzle":           { bp: 20,  type: "Electric", cat: "Physical", spread: false, contact: true },
  "Dazzling Gleam":   { bp: 80,  type: "Fairy",    cat: "Special",  spread: true },
  "Moonblast":        { bp: 95,  type: "Fairy",    cat: "Special",  spread: false },
  "Light of Ruin":   { bp: 140, type: "Fairy",    cat: "Special",  spread: false, recoil: 0.5 },
  "Calm Mind":       { bp: 0,   type: "Psychic",  cat: "Status",   spread: false },
  "Play Rough":       { bp: 90,  type: "Fairy",    cat: "Physical", spread: false, contact: true },
  "Ancient Power": { bp: 60, type: "Rock", cat: "Special", spread: false },
  "Darkest Lariat": { bp: 85, type: "Dark", cat: "Physical", spread: false },
  "Steel Beam": { bp: 140, type: "Steel", cat: "Special", spread: false },
  "Ice Fang": { bp: 65, type: "Ice", cat: "Physical", spread: false },
  "Struggle Bug": { bp: 50, type: "Bug", cat: "Special", spread: true },
  "Overheat": { bp: 130, type: "Fire", cat: "Special", spread: false },
  "Leaf Storm": { bp: 130, type: "Grass", cat: "Special", spread: false },
  "Sleep Powder": { bp: 0, type: "Grass", cat: "Status", spread: false },
  "Detect": { bp: 0, type: "Fighting", cat: "Status", spread: false },
  "Hyper Beam": { bp: 150, type: "Normal", cat: "Special", spread: false },
  "Quick Attack": { bp: 40, type: "Normal", cat: "Physical", spread: false },
  "Swords Dance": { bp: 0, type: "Normal", cat: "Status", spread: false },
  "Spirit Break":     { bp: 75,  type: "Fairy",    cat: "Physical", spread: false, contact: true }
};


// Most-used individual item / ability / spread / moves, Pokemon Showdown October 2026
// Regulation M-C Doubles, 1760 weighting. The top choices are statistical marginals:
// they are NOT guaranteed to form one exact tournament team set.
// https://www.smogon.com/stats/2026-10/moveset/gen9championsvgc2026regmc-1760.txt
const CALC_RECOMMENDED_SETS_MC = {
  "Floette-Eternal::Floettite": {
    "item": "Floettite", "ability": "Fairy Aura", "nature": "Timid",
    "sp": {"hp": 2, "atk": 0, "def": 0, "spa": 32, "spd": 0, "spe": 32},
    "moves": ["Protect", "Dazzling Gleam", "Moonblast", "Light of Ruin"]
  },
};

const CALC_POPULAR_SETS_MC = {
  "Sneasler": {"item": "White Herb", "ability": "Unburden", "nature": "Adamant", "sp": {"hp": 2, "atk": 32, "def": 0, "spa": 0, "spd": 0, "spe": 32}, "moves": ["Close Combat", "Dire Claw", "Fake Out", "Protect"]},
  "Kingambit": {"item": "Chople Berry", "ability": "Defiant", "nature": "Brave", "sp": {"hp": 32, "atk": 32, "def": 0, "spa": 0, "spd": 2, "spe": 0}, "moves": ["Kowtow Cleave", "Sucker Punch", "Iron Head", "Low Kick"]},
  "Basculegion": {"item": "Focus Sash", "ability": "Adaptability", "nature": "Brave", "sp": {"hp": 2, "atk": 32, "def": 32, "spa": 0, "spd": 0, "spe": 0}, "moves": ["Last Respects", "Aqua Jet", "Wave Crash", "Protect"]},
  "Charizard::Charizardite Y": {"item": "Charizardite Y", "ability": "Drought", "nature": "Quiet", "sp": {"hp": 32, "atk": 0, "def": 2, "spa": 32, "spd": 0, "spe": 0}, "moves": ["Heat Wave", "Weather Ball", "Protect", "Ancient Power"]},
  "Rillaboom": {"item": "Miracle Seed", "ability": "Grassy Surge", "nature": "Adamant", "sp": {"hp": 32, "atk": 32, "def": 0, "spa": 0, "spd": 0, "spe": 2}, "moves": ["Grassy Glide", "Fake Out", "Wood Hammer", "U-turn"]},
  "Incineroar": {"item": "Sitrus Berry", "ability": "Intimidate", "nature": "Adamant", "sp": {"hp": 32, "atk": 14, "def": 10, "spa": 0, "spd": 10, "spe": 0}, "moves": ["Fake Out", "Parting Shot", "Flare Blitz", "Darkest Lariat"]},
  "Garchomp": {"item": "Choice Scarf", "ability": "Rough Skin", "nature": "Adamant", "sp": {"hp": 2, "atk": 32, "def": 0, "spa": 0, "spd": 0, "spe": 32}, "moves": ["Dragon Claw", "Rock Slide", "Stomping Tantrum", "Earthquake"]},
  "Farigiraf": {"item": "Sitrus Berry", "ability": "Armor Tail", "nature": "Quiet", "sp": {"hp": 10, "atk": 0, "def": 13, "spa": 30, "spd": 13, "spe": 0}, "moves": ["Trick Room", "Psychic", "Thunderbolt", "Helping Hand"]},
  "Archaludon": {"item": "Leftovers", "ability": "Stamina", "nature": "Bold", "sp": {"hp": 30, "atk": 0, "def": 1, "spa": 1, "spd": 19, "spe": 15}, "moves": ["Protect", "Electro Shot", "Dragon Pulse", "Flash Cannon"]},
  "Indeedee-F": {"item": "Rocky Helmet", "ability": "Psychic Surge", "nature": "Bold", "sp": {"hp": 32, "atk": 0, "def": 32, "spa": 0, "spd": 2, "spe": 0}, "moves": ["Follow Me", "Helping Hand", "Psychic", "Trick Room"]},
  "Dragonite::Dragoninite": {"item": "Dragoninite", "ability": "Multiscale", "nature": "Modest", "sp": {"hp": 25, "atk": 0, "def": 0, "spa": 32, "spd": 0, "spe": 9}, "moves": ["Dragon Pulse", "Heat Wave", "Tailwind", "Extreme Speed"]},
  "Gardevoir::Gardevoirite": {"item": "Gardevoirite", "ability": "Pixilate", "nature": "Quiet", "sp": {"hp": 16, "atk": 0, "def": 18, "spa": 32, "spd": 0, "spe": 0}, "moves": ["Hyper Voice", "Psychic", "Protect", "Trick Room"]},
  "Pelipper": {"item": "Sitrus Berry", "ability": "Drizzle", "nature": "Bold", "sp": {"hp": 32, "atk": 0, "def": 10, "spa": 17, "spd": 7, "spe": 0}, "moves": ["Weather Ball", "Hurricane", "Wide Guard", "Tailwind"]},
  "Gholdengo": {"item": "Life Orb", "ability": "Good as Gold", "nature": "Modest", "sp": {"hp": 7, "atk": 0, "def": 8, "spa": 32, "spd": 0, "spe": 19}, "moves": ["Make It Rain", "Shadow Ball", "Protect", "Nasty Plot"]},
  "Whimsicott": {"item": "Focus Sash", "ability": "Prankster", "nature": "Timid", "sp": {"hp": 2, "atk": 0, "def": 0, "spa": 32, "spd": 0, "spe": 32}, "moves": ["Tailwind", "Moonblast", "Encore", "Protect"]},
  "Salamence::Salamencite": {"item": "Salamencite", "ability": "Aerilate", "nature": "Timid", "sp": {"hp": 2, "atk": 0, "def": 0, "spa": 32, "spd": 0, "spe": 32}, "moves": ["Protect", "Hyper Voice", "Tailwind", "Draco Meteor"]},
  "Garchomp::Garchompite Z": {"item": "Garchompite Z", "ability": "Levitate", "nature": "Modest", "sp": {"hp": 2, "atk": 0, "def": 0, "spa": 32, "spd": 0, "spe": 32}, "moves": ["Protect", "Power Gem", "Earth Power", "Dragon Pulse"]},
  "Armarouge": {"item": "Focus Sash", "ability": "Weak Armor", "nature": "Modest", "sp": {"hp": 0, "atk": 0, "def": 0, "spa": 32, "spd": 2, "spe": 32}, "moves": ["Expanding Force", "Armor Cannon", "Protect", "Wide Guard"]},
  "Venusaur": {"item": "Focus Sash", "ability": "Chlorophyll", "nature": "Modest", "sp": {"hp": 2, "atk": 0, "def": 0, "spa": 32, "spd": 0, "spe": 32}, "moves": ["Sludge Bomb", "Protect", "Leaf Storm", "Sleep Powder"]},
  "Lucario::Lucarionite Z": {"item": "Lucarionite Z", "ability": "Aura Guard", "nature": "Modest", "sp": {"hp": 2, "atk": 0, "def": 0, "spa": 32, "spd": 0, "spe": 32}, "moves": ["Aura Sphere", "Flash Cannon", "Protect", "Steel Beam"]},
  "Excadrill": {"item": "Focus Sash", "ability": "Sand Rush", "nature": "Adamant", "sp": {"hp": 2, "atk": 32, "def": 0, "spa": 0, "spd": 0, "spe": 32}, "moves": ["Iron Head", "Protect", "High Horsepower", "Rock Slide"]},
  "Aerodactyl::Aerodactylite": {"item": "Aerodactylite", "ability": "Tough Claws", "nature": "Jolly", "sp": {"hp": 0, "atk": 32, "def": 0, "spa": 0, "spd": 2, "spe": 32}, "moves": ["Rock Slide", "Dual Wingbeat", "Tailwind", "Ice Fang"]},
  "Torkoal": {"item": "Charcoal", "ability": "Drought", "nature": "Quiet", "sp": {"hp": 32, "atk": 0, "def": 0, "spa": 32, "spd": 2, "spe": 0}, "moves": ["Eruption", "Protect", "Weather Ball", "Earth Power"]},
  "Absol::Absolite Z": {"item": "Absolite Z", "ability": "Sharpness", "nature": "Jolly", "sp": {"hp": 2, "atk": 32, "def": 0, "spa": 0, "spd": 0, "spe": 32}, "moves": ["Night Slash", "Shadow Claw", "Close Combat", "Protect"]},
  "Aerodactyl": {"item": "Focus Sash", "ability": "Unnerve", "nature": "Jolly", "sp": {"hp": 2, "atk": 32, "def": 0, "spa": 0, "spd": 0, "spe": 32}, "moves": ["Rock Slide", "Tailwind", "Protect", "Wide Guard"]},
  "Ceruledge": {"item": "Grassy Seed", "ability": "Flash Fire", "nature": "Adamant", "sp": {"hp": 31, "atk": 7, "def": 24, "spa": 0, "spd": 3, "spe": 1}, "moves": ["Bitter Blade", "Protect", "Shadow Sneak", "Swords Dance"]},
  "Mawile::Mawilite": {"item": "Mawilite", "ability": "Huge Power", "nature": "Brave", "sp": {"hp": 32, "atk": 32, "def": 0, "spa": 0, "spd": 2, "spe": 0}, "moves": ["Play Rough", "Sucker Punch", "Protect", "Iron Head"]},
};

// Default Starter Meta Team for Regulation M-C
const DEFAULT_SAMPLE_TEAM = [
  {
    species: "Garchomp",
    gender: "M",
    item: "Garchompite Z",
    ability: "Rough Skin",
    nature: "Timid",
    isMega: true,
    sp: { hp: 2, atk: 0, def: 0, spa: 32, spd: 0, spe: 32 },
    moves: ["Draco Meteor", "Earth Power", "Flamethrower", "Protect"]
  },
  {
    species: "Sneasler",
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
    gender: "M",
    item: "Miracle Seed",
    ability: "Grassy Surge",
    nature: "Adamant",
    isMega: false,
    sp: { hp: 32, atk: 20, def: 6, spa: 0, spd: 8, spe: 0 },
    moves: ["Fake Out", "Grassy Glide", "Wood Hammer", "U-turn"]
  },
  {
    species: "Incineroar",
    gender: "M",
    item: "Sitrus Berry",
    ability: "Intimidate",
    nature: "Careful",
    isMega: false,
    sp: { hp: 32, atk: 0, def: 14, spa: 0, spd: 20, spe: 0 },
    moves: ["Fake Out", "Flare Blitz", "Knock Off", "Parting Shot"]
  },
  {
    species: "Kingambit",
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
    gender: "",
    item: "Life Orb",
    ability: "Good as Gold",
    nature: "Timid",
    isMega: false,
    sp: { hp: 2, atk: 0, def: 0, spa: 32, spd: 0, spe: 32 },
    moves: ["Make It Rain", "Shadow Ball", "Nasty Plot", "Protect"]
  }
];
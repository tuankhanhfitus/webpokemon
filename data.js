// Dữ liệu Pokémon VGC Regulation M-C (Pokémon Champions - Hỗ trợ Mega Evolution, không Restricted/Paradox/Ruin)
const NATURES = {
  Adamant: { up: 'atk', down: 'spa', label: 'Adamant (+Atk, -SpA)' },
  Jolly:   { up: 'spe', down: 'spa', label: 'Jolly (+Spe, -SpA)' },
  Modest:  { up: 'spa', down: 'atk', label: 'Modest (+SpA, -Atk)' },
  Timid:   { up: 'spe', down: 'atk', label: 'Timid (+Spe, -Atk)' },
  Bold:    { up: 'def', down: 'atk', label: 'Bold (+Def, -Atk)' },
  Impish:  { up: 'def', down: 'spa', label: 'Impish (+Def, -SpA)' },
  Calm:    { up: 'spd', down: 'atk', label: 'Calm (+SpD, -Atk)' },
  Careful: { up: 'spd', down: 'spa', label: 'Careful (+SpD, -SpA)' },
  Brave:   { up: 'atk', down: 'spe', label: 'Brave (+Atk, -Spe)' },
  Quiet:   { up: 'spa', down: 'spe', label: 'Quiet (+SpA, -Spe)' },
  Relaxed: { up: 'def', down: 'spe', label: 'Relaxed (+Def, -Spe)' },
  Sassy:   { up: 'spd', down: 'spe', label: 'Sassy (+SpD, -Spe)' },
  Serious: { up: null,  down: null,  label: 'Serious (Trung tính)' }
};

const POKEDEX_MC = {
  "Incineroar": {
    id: 727, types: ["Fire", "Dark"],
    base: { hp: 95, atk: 115, def: 90, spa: 80, spd: 90, spe: 60 },
    abilities: ["Intimidate", "Blaze"],
    moves: ["Fake Out", "Flare Blitz", "Knock Off", "Parting Shot", "Will-O-Wisp", "U-turn", "Protect"]
  },
  "Garchomp": {
    id: 445, types: ["Dragon", "Ground"],
    base: { hp: 108, atk: 130, def: 95, spa: 80, spd: 85, spe: 102 },
    abilities: ["Rough Skin", "Sand Veil"],
    mega: {
      name: "Garchomp-Mega", types: ["Dragon", "Ground"],
      base: { hp: 108, atk: 170, def: 115, spa: 120, spd: 95, spe: 92 },
      ability: "Sand Force", stone: "Garchompite"
    },
    moves: ["Earthquake", "Dragon Claw", "Stomping Tantrum", "Rock Slide", "Swords Dance", "Protect"]
  },
  "Kangaskhan": {
    id: 115, types: ["Normal"],
    base: { hp: 105, atk: 95, def: 80, spa: 40, spd: 80, spe: 90 },
    abilities: ["Scrappy", "Inner Focus"],
    mega: {
      name: "Kangaskhan-Mega", types: ["Normal"],
      base: { hp: 105, atk: 125, def: 100, spa: 60, spd: 100, spe: 100 },
      ability: "Parental Bond", stone: "Kangaskhanite"
    },
    moves: ["Fake Out", "Double-Edge", "Return", "Sucker Punch", "Low Kick", "Protect"]
  },
  "Charizard": {
    id: 6, types: ["Fire", "Flying"],
    base: { hp: 78, atk: 84, def: 78, spa: 109, spd: 85, spe: 100 },
    abilities: ["Solar Power", "Blaze"],
    mega: {
      name: "Charizard-Mega-Y", types: ["Fire", "Flying"],
      base: { hp: 78, atk: 104, def: 78, spa: 159, spd: 115, spe: 100 },
      ability: "Drought", stone: "Charizardite Y"
    },
    moves: ["Heat Wave", "Overheat", "Solar Beam", "Air Slash", "Tailwind", "Protect"]
  },
  "Salamence": {
    id: 373, types: ["Dragon", "Flying"],
    base: { hp: 95, atk: 135, def: 80, spa: 110, spd: 80, spe: 100 },
    abilities: ["Intimidate", "Moxie"],
    mega: {
      name: "Salamence-Mega", types: ["Dragon", "Flying"],
      base: { hp: 95, atk: 145, def: 130, spa: 120, spd: 90, spe: 120 },
      ability: "Aerilate", stone: "Salamencite"
    },
    moves: ["Hyper Voice", "Double-Edge", "Draco Meteor", "Tailwind", "Flamethrower", "Protect"]
  },
  "Metagross": {
    id: 376, types: ["Steel", "Psychic"],
    base: { hp: 80, atk: 135, def: 130, spa: 95, spd: 90, spe: 70 },
    abilities: ["Clear Body"],
    mega: {
      name: "Metagross-Mega", types: ["Steel", "Psychic"],
      base: { hp: 80, atk: 145, def: 150, spa: 105, spd: 110, spe: 110 },
      ability: "Tough Claws", stone: "Metagrossite"
    },
    moves: ["Iron Head", "Meteor Mash", "Psychic Fangs", "Stomping Tantrum", "Bullet Punch", "Protect"]
  },
  "Rillaboom": {
    id: 812, types: ["Grass"],
    base: { hp: 100, atk: 125, def: 90, spa: 60, spd: 70, spe: 85 },
    abilities: ["Grassy Surge", "Overgrow"],
    moves: ["Fake Out", "Grassy Glide", "Wood Hammer", "U-turn", "High Horsepower", "Protect"]
  },
  "Pelipper": {
    id: 279, types: ["Water", "Flying"],
    base: { hp: 60, atk: 50, def: 100, spa: 95, spd: 70, spe: 65 },
    abilities: ["Drizzle", "Keen Eye"],
    moves: ["Hurricane", "Weather Ball", "Tailwind", "Wide Guard", "Helping Hand", "Protect"]
  },
  "Basculegion": {
    id: 902, types: ["Water", "Ghost"],
    base: { hp: 120, atk: 112, def: 65, spa: 80, spd: 75, spe: 78 },
    abilities: ["Swift Swim", "Adaptability"],
    moves: ["Wave Crash", "Last Respects", "Aqua Jet", "Shadow Ball", "Flip Turn", "Protect"]
  },
  "Whimsicott": {
    id: 547, types: ["Grass", "Fairy"],
    base: { hp: 60, atk: 67, def: 85, spa: 77, spd: 75, spe: 116 },
    abilities: ["Prankster", "Infiltrator"],
    moves: ["Tailwind", "Moonblast", "Encore", "Taunt", "Helping Hand", "Protect"]
  },
  "Kingambit": {
    id: 983, types: ["Dark", "Steel"],
    base: { hp: 100, atk: 135, def: 120, spa: 60, spd: 85, spe: 50 },
    abilities: ["Defiant", "Supreme Overlord"],
    moves: ["Kowtow Cleave", "Iron Head", "Sucker Punch", "Swords Dance", "Low Kick", "Protect"]
  },
  "Sneasler": {
    id: 903, types: ["Fighting", "Poison"],
    base: { hp: 80, atk: 130, def: 60, spa: 40, spd: 80, spe: 120 },
    abilities: ["Unburden", "Poison Touch"],
    moves: ["Fake Out", "Close Combat", "Dire Claw", "Throat Chop", "Protect"]
  },
  "Gholdengo": {
    id: 1000, types: ["Steel", "Ghost"],
    base: { hp: 87, atk: 60, def: 95, spa: 133, spd: 91, spe: 84 },
    abilities: ["Good as Gold"],
    moves: ["Make It Rain", "Shadow Ball", "Nasty Plot", "Thunderbolt", "Protect"]
  },
  "Amoonguss": {
    id: 591, types: ["Grass", "Poison"],
    base: { hp: 114, atk: 85, def: 70, spa: 85, spd: 80, spe: 30 },
    abilities: ["Regenerator", "Effect Spore"],
    moves: ["Spore", "Rage Powder", "Pollen Puff", "Clear Smog", "Protect"]
  }
};

const ITEMS_MC = [
  "Sitrus Berry", "Safety Goggles", "Assault Vest", "Focus Sash", "Life Orb",
  "Choice Scarf", "Choice Specs", "Choice Band", "Leftovers", "Clear Amulet",
  "Covert Cloak", "Rocky Helmet", "Black Glasses", "Mystic Water", "Miracle Seed",
  "Garchompite", "Kangaskhanite", "Charizardite Y", "Salamencite", "Metagrossite"
];

const MOVES_DB = {
  "Fake Out": { power: 40, type: "Normal", cat: "Physical", spread: false },
  "Flare Blitz": { power: 120, type: "Fire", cat: "Physical", spread: false },
  "Knock Off": { power: 65, type: "Dark", cat: "Physical", spread: false },
  "Parting Shot": { power: 0, type: "Dark", cat: "Status", spread: false },
  "Will-O-Wisp": { power: 0, type: "Fire", cat: "Status", spread: false },
  "U-turn": { power: 70, type: "Bug", cat: "Physical", spread: false },
  "Protect": { power: 0, type: "Normal", cat: "Status", spread: false },
  "Earthquake": { power: 100, type: "Ground", cat: "Physical", spread: true },
  "Dragon Claw": { power: 80, type: "Dragon", cat: "Physical", spread: false },
  "Stomping Tantrum": { power: 75, type: "Ground", cat: "Physical", spread: false },
  "Rock Slide": { power: 75, type: "Rock", cat: "Physical", spread: true },
  "Swords Dance": { power: 0, type: "Normal", cat: "Status", spread: false },
  "Double-Edge": { power: 120, type: "Normal", cat: "Physical", spread: false },
  "Return": { power: 102, type: "Normal", cat: "Physical", spread: false },
  "Sucker Punch": { power: 70, type: "Dark", cat: "Physical", spread: false },
  "Low Kick": { power: 100, type: "Fighting", cat: "Physical", spread: false },
  "Heat Wave": { power: 95, type: "Fire", cat: "Special", spread: true },
  "Overheat": { power: 130, type: "Fire", cat: "Special", spread: false },
  "Solar Beam": { power: 120, type: "Grass", cat: "Special", spread: false },
  "Air Slash": { power: 75, type: "Flying", cat: "Special", spread: false },
  "Tailwind": { power: 0, type: "Flying", cat: "Status", spread: false },
  "Hyper Voice": { power: 90, type: "Normal", cat: "Special", spread: true },
  "Draco Meteor": { power: 130, type: "Dragon", cat: "Special", spread: false },
  "Flamethrower": { power: 90, type: "Fire", cat: "Special", spread: false },
  "Iron Head": { power: 80, type: "Steel", cat: "Physical", spread: false },
  "Meteor Mash": { power: 90, type: "Steel", cat: "Physical", spread: false },
  "Psychic Fangs": { power: 85, type: "Psychic", cat: "Physical", spread: false },
  "Bullet Punch": { power: 40, type: "Steel", cat: "Physical", spread: false },
  "Grassy Glide": { power: 55, type: "Grass", cat: "Physical", spread: false },
  "Wood Hammer": { power: 120, type: "Grass", cat: "Physical", spread: false },
  "High Horsepower": { power: 95, type: "Ground", cat: "Physical", spread: false },
  "Hurricane": { power: 110, type: "Flying", cat: "Special", spread: false },
  "Weather Ball": { power: 100, type: "Water", cat: "Special", spread: false },
  "Wide Guard": { power: 0, type: "Rock", cat: "Status", spread: false },
  "Helping Hand": { power: 0, type: "Normal", cat: "Status", spread: false },
  "Wave Crash": { power: 120, type: "Water", cat: "Physical", spread: false },
  "Last Respects": { power: 100, type: "Ghost", cat: "Physical", spread: false },
  "Aqua Jet": { power: 40, type: "Water", cat: "Physical", spread: false },
  "Shadow Ball": { power: 80, type: "Ghost", cat: "Special", spread: false },
  "Flip Turn": { power: 60, type: "Water", cat: "Physical", spread: false },
  "Moonblast": { power: 95, type: "Fairy", cat: "Special", spread: false },
  "Encore": { power: 0, type: "Normal", cat: "Status", spread: false },
  "Taunt": { power: 0, type: "Dark", cat: "Status", spread: false },
  "Kowtow Cleave": { power: 85, type: "Dark", cat: "Physical", spread: false },
  "Close Combat": { power: 120, type: "Fighting", cat: "Physical", spread: false },
  "Dire Claw": { power: 80, type: "Poison", cat: "Physical", spread: false },
  "Throat Chop": { power: 80, type: "Dark", cat: "Physical", spread: false },
  "Make It Rain": { power: 120, type: "Steel", cat: "Special", spread: true },
  "Nasty Plot": { power: 0, type: "Dark", cat: "Status", spread: false },
  "Thunderbolt": { power: 90, type: "Electric", cat: "Special", spread: false },
  "Spore": { power: 0, type: "Grass", cat: "Status", spread: false },
  "Rage Powder": { power: 0, type: "Bug", cat: "Status", spread: false },
  "Pollen Puff": { power: 90, type: "Bug", cat: "Special", spread: false },
  "Clear Smog": { power: 50, type: "Poison", cat: "Special", spread: false }
};

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
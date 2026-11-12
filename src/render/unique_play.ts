// WHAT THE UNIQUE ITEMS SHOW IN PLAY: THE SWITCHES (the art chat, 11 Nov 2026; queue item draw-unique-items).
//
// The unique items are built (game/uniques.ts, behind UNIQUES, off) and each has its bag picture (art/items_unique.ts, behind
// UNIQUE_ART, off). What a unique does that is SEEN in the fight the build shows as a plain stand-in (a burst, a spark) and tells
// of as an event `{ t: 'unique', id, what, … }` (game/state.ts GameEvent). The pictures of those moments are the art chat's:
// art/unique_play_art.ts paints them, render/unique_fx.ts lays them in the game.
//
// EACH BEHIND A SWITCH OF ITS OWN HERE, ALL OFF until his yes to its picture (PICTURES FIRST): with one off, that unique is
// shown exactly as the build shows it. A switch does nothing without UNIQUES: a unique's picture only ever hangs on a unique
// worn (Game.wears).
//
//   tome    THE RESTLESS TOME (the Warlock's): the book itself in flight round him, its fire streaming off it, its fire
//           leaping onto the one it touches
//   risen   THE FLESHMANCER'S BRAND: the elite risen to fight for him, the brand under it, its rising, its blows, its fall
//   fourth  THE FOURTH GLOBE (the Brawler's): four globes over his head, not three (render/veteran_fx.ts)
//   arm     THE DROWNED ARM: black water welling up under the enemy, the tentacle bursting up out of it, whipping down across
//           it as the blow lands, and pulled back under (art/unique_play_art2.ts)
//   talons  THE QUEEN'S TALONS: one of her flock, black-violet, diving out of the air over him onto the enemy, striking, beating away
//   wrench  THE STICKY WRENCH: her vial stuck in a lump of pitch on what it landed on, going where that goes, blinking quicker and
//           quicker, fizzing, until it bursts
//
// (Nothing is imported here, so that anything may ask a switch without pulling in the pictures.)
export const UNIQUE_PLAY = { tome: false, risen: false, fourth: false, arm: false, talons: false, wrench: false };

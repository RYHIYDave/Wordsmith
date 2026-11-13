// THE RECORDED SOUNDS IN PACKS (8 Nov 2026). The sound chat's batches came to 574 files; the game's page on claude.ai holds at most
// 511 files a version, so they cannot go beside it one by one. So the build packs them: every mp3 into a few packs, each its files'
// bytes one after another (`<group>-pack.mp3`: an mp3 by its name, as the page serves only the kinds of file it knows, and it is mp3s
// end to end; first `<group>.pak`, which the page would not take), and `index.json` saying where each lies (its pack, its start, its length); the loops
// (WAV) and the title theme stay files of their own. The game (engine/audio.ts) fetches the index, then a pack the first time one
// of its sounds is wanted, and decodes each sound from its own bytes as it is wanted (never the whole pack).
//   packSounds(fromDir, outDir) -> { files, index }
import fs from 'node:fs';
import path from 'node:path';

const HEROES = ['warrior', 'ranger', 'mage', 'warlock', 'tinkerer', 'brawler'];
const CORE = new Set(['swing', 'hit', 'crit', 'slam', 'monster_die', 'hurt', 'pickup', 'gold', 'word', 'rare', 'potion', 'level_up', 'portal', 'door', 'gate_rise', 'gate_fall', 'click', 'equip', 'buy', 'deny', 'imbue', 'death', 'echo', 'might', 'orb', 'boss_roar']);
const TOWN = new Set(['anvil', 'owl_hoot', 'owl_ruffle', 'crystal', 'rune_write', 'rune_drive', 'ring_power', 'coin', 'page_turn', 'notch', 'trophy_hang', 'amb_hall', 'amb_camp']);
// (the eleventh batch's brazier pop, heard by any brazier: with the world's)
const WORLD = /^(break_|chest$|rift_|trap_|sealed_door$|fire_pop$)/;
/**
 * THE TEN NEW WORDS' SOUNDS (the sound chat's sixth batch, 9 Nov 2026: assets/sound/README.md; game/word_sounds.ts): a pack of
 * their own, about 850 KB, fetched the first time one of the ten words comes into play (from floor 6) and not with the heroes'
 * skills as a game begins. The Lexicon's page turn goes with the town's.
 */
const WORDS10 = /^(pierce_(shot|lance)|bleed_(open|thorns|cut)|reap_(soul|spirit|rake|rise)|cull_(kill|mark|kindle)|surge_(wave|warn|foe)|plunder_(spray|stream|steal)|mirror_(swing|rise|break|back)|word_(lasting|fleeting|vast))$/;
/**
 * THE FLOORS' SCENE SOUNDS (the sound chat's eighth batch, 9 Nov 2026: assets/sound/README.md; game/scene_sounds.ts says which floor
 * plays which): packs of their own by act, floors 1 to 5, 6 to 10, 11 to 15 and 16 to 20, so that a floor fetches its own act's
 * (2.2 MB the first act's, under 1 MB each of the others) and not all 82 with the heroes' skills. The moments by their floor (f1_stone to f15_chandelier); the quest
 * pieces and the traps by name.
 */
const SCENE = [
  // (and the eleventh batch's standouts by their floor's act: amb_f1 to amb_f4; amb_f6 to amb_f10_bog; amb_f14)
  ['scene-1', /^(f[1-5]_|amb_f[1-5]$|crank_(gear|turn)$|furnace_out$|gate_fire_out$|cage_(down|up)$)/],
  ['scene-2', /^(ledge_crumble|eyrie_wind|singing_stones|bog_step|altar_word|seal_burn|amb_f([6-9]|10)(_bog)?)$/],
  ['scene-3', /^(f1[1-5]_|amb_f1[1-5]$|bell_(ring|muffled)$)/],
  ['scene-4', /^(nettle|clock_chime|mirror_crack|skylight|portcullis|pitch_pour|songbird)$/],
];

/**
 * Which pack a sound (its name, without its take) goes in. `bosses`: the names before a `_roar` (a boss's roar, hurt, death and
 * his acts' sounds go with him); the enemies' attacks and their voices apart, so that what a floor wants is not all fetched at once.
 */
export function packOf(base, bosses = new Set()) {
  const hero = HEROES.find((h) => base.startsWith(`${h}_`));
  if (hero) return `voice-${hero}`;
  if (CORE.has(base)) return 'core';
  if (base.startsWith('step_')) return 'steps';
  if (TOWN.has(base)) return 'town';
  if (WORLD.test(base)) return 'world';
  for (const [pack, names] of SCENE) if (names.test(base)) return pack;
  if (WORDS10.test(base)) return 'words';
  if (base.startsWith('colossus_')) return 'colossus';
  const who = base.split('_')[0];
  if (bosses.has(who)) return 'bosses';
  if (/^atk[A-Z]/.test(base)) return 'enemy-attacks';
  if (/^[a-z]+_(aggro|hurt|death)$/.test(base)) return 'enemy-voices';
  return 'skills';
}

/** The sound's name without its take: `warrior_attack_a_1` -> `warrior_attack_a`, `step_stone_3` -> `step_stone`. */
function baseOf(name) {
  return name.replace(/_\d+$/, '');
}

export function packSounds(fromDir, outDir) {
  const all = fs.readdirSync(fromDir).filter((f) => /\.(mp3|mp4|m4a|ogg|wav)$/.test(f)).sort();
  const index = {};
  const packs = new Map();
  const bosses = new Set(all.filter((f) => /_roar_\d+\.mp3$/.test(f)).map((f) => f.split('_')[0]).filter((b) => b !== 'boss' && b !== 'colossus'));
  const files = [];
  for (const f of all) {
    if (!f.endsWith('.mp3')) {
      fs.copyFileSync(path.join(fromDir, f), path.join(outDir, f));
      index[f] = { file: f };
      files.push(f);
      continue;
    }
    const g = packOf(baseOf(f.replace(/\.mp3$/, '')), bosses);
    let p = packs.get(g);
    if (!p) packs.set(g, (p = { parts: [], size: 0 }));
    const b = fs.readFileSync(path.join(fromDir, f));
    index[f] = { pack: `${g}-pack.mp3`, at: p.size, len: b.length };
    p.parts.push(b);
    p.size += b.length;
  }
  for (const [g, p] of packs) {
    fs.writeFileSync(path.join(outDir, `${g}-pack.mp3`), Buffer.concat(p.parts));
    files.push(`${g}-pack.mp3`);
  }
  fs.writeFileSync(path.join(outDir, 'index.json'), JSON.stringify(index));
  files.push('index.json');
  return { files, index, count: all.length };
}

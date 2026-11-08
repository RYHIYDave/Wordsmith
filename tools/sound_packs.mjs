// THE RECORDED SOUNDS IN PACKS (8 Nov 2026). The sound chat's batches came to 574 files; the game's page on claude.ai holds at most
// 511 files a version, so they cannot go beside it one by one. So the build packs them: every mp3 into a few packs, each its files'
// bytes one after another (`<group>.pak`), and `index.json` saying where each lies (its pack, its start, its length); the loops
// (WAV) and the title theme stay files of their own. The game (engine/audio.ts) fetches the index, then a pack the first time one
// of its sounds is wanted, and decodes each sound from its own bytes as it is wanted (never the whole pack).
//   packSounds(fromDir, outDir) -> { files, index }
import fs from 'node:fs';
import path from 'node:path';

const HEROES = ['warrior', 'ranger', 'mage', 'warlock', 'tinkerer', 'brawler'];
const CORE = new Set(['swing', 'hit', 'crit', 'slam', 'monster_die', 'hurt', 'pickup', 'gold', 'word', 'rare', 'potion', 'level_up', 'portal', 'door', 'gate_rise', 'gate_fall', 'click', 'equip', 'buy', 'deny', 'imbue', 'death', 'echo', 'might', 'orb', 'boss_roar']);
const TOWN = new Set(['anvil', 'owl_hoot', 'owl_ruffle', 'crystal', 'rune_write', 'rune_drive', 'ring_power', 'coin']);
const WORLD = /^(break_|chest$|rift_|trap_|sealed_door$)/;

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
    index[f] = { pack: `${g}.pak`, at: p.size, len: b.length };
    p.parts.push(b);
    p.size += b.length;
  }
  for (const [g, p] of packs) {
    fs.writeFileSync(path.join(outDir, `${g}.pak`), Buffer.concat(p.parts));
    files.push(`${g}.pak`);
  }
  fs.writeFileSync(path.join(outDir, 'index.json'), JSON.stringify(index));
  files.push('index.json');
  return { files, index, count: all.length };
}

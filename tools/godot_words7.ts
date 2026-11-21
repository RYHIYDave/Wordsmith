// THE GODOT PORT: THE SEVEN LAST WORDS' LOOKS (render/words7.ts, the art chat's: Piercing, Bleeding, Reaping, Culling, Surging,
// Plundering, Mirroring), for godot/scripts/fx_words7.gd.
//   npx tsx tools/godot_words7.ts          -> godot/assets/words/looks7.json: each word's six tones (W7_RAMP), the enemy's and its
//                                              fire and blood, the friend's cyan, the dust, the briars, the stone, the claws, each
//                                              look's beats (W7_BEATS) and its times (W7_TIME), a world radius on the floor (RX,
//                                              RY), a cut in glass's time, when a cut body's halves come to rest, the Shade's
//                                              wind-up; and godot/assets/words/spirit7.png and spirit7.json: REAPING'S SPIRIT, the
//                                              little grey Shade (render/words7.ts greyShade, from the bestiary's Shade, as
//                                              shadeFrameOf picks its pictures): each picture of its stand, its walk and its
//                                              rake, front and back, greyed at 0.7 its size, its edge his cyan.
//   npx tsx tools/godot_words7.ts check [dir]  -> also godot/assets/words/looks7_check.json (not kept in the repository): THE
//                                              GAME'S OWN PAINTER RUN ON A SPREAD OF MOMENTS of each look (floorW7 and airW7 on a
//                                              canvas that keeps every dot, and lightsW7's spots), what the rules keep at each given
//                                              as the game has it (a Game of the fields the looks read), and of each moment's two
//                                              layers how many pixels it lays and a sum of them all; and a run of its clock
//                                              (tickW7). godot/checks/looks7_check.gd lays the same with fx_words7.gd and holds
//                                              its pixels against these. With `dir`, every pixel of each is written there too.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { crc32, deflateSync } from 'node:zlib';
import { paintWithoutCanvas, paintingOf } from '../tests/helpers';
import { gameSwitches } from './godot_switches';
import { MONSTERS } from '../src/game/defs';
import { FIGURE_SIZE } from '../src/art/bestiary';
import type { Game } from '../src/game/game';
import type { Sprite } from '../src/engine/px';
import { W7, W7_BEATS, W7_ENEMY, W7_FRIEND, W7_GLYPH, W7_RAMP, W7_TIME, CUT_REST, clearW7, floorW7, airW7, lightsW7, playW7, tickW7, greyShadePixels, shadeArt } from '../src/render/words7';
import type { Act } from '../src/render/words7';
import type { Cam, Fx } from '../src/render/fx';

declare const process: { argv: string[] };
gameSwitches();
paintWithoutCanvas();
const OUT = 'godot/assets/words';
mkdirSync(OUT, { recursive: true });

// (what render/words7.ts keeps to itself, read out of it as it is written)
const SRC = readFileSync('src/render/words7.ts', 'utf8');
const listIn = (name: string): string[] => {
  const m = SRC.match(new RegExp(`const ${name}: readonly string\\[\\] = \\[([^\\]]*)\\]`));
  if (!m) throw new Error(`${name} not found in render/words7.ts`);
  return [...m[1].matchAll(/'(#[0-9a-f]{6})'/g)].map((q) => q[1]);
};
const numIn = (name: string): number => {
  const m = SRC.match(new RegExp(`const ${name} = ([0-9.]+);`));
  if (!m) throw new Error(`${name} not found in render/words7.ts`);
  return Number(m[1]);
};
const strIn = (name: string): string => {
  const m = SRC.match(new RegExp(`const ${name} = '(#[0-9a-f]{6})';`));
  if (!m) throw new Error(`${name} not found in render/words7.ts`);
  return m[1];
};
const beats = Object.fromEntries(Object.entries(W7_BEATS).map(([k, b]) => [k, { build: b.build, hit: b.hit, fade: b.fade }]));
writeFileSync(
  `${OUT}/looks7.json`,
  JSON.stringify(
    {
      ramp: W7_RAMP,
      enemy: W7_ENEMY,
      enemyFire: listIn('ENEMY_FIRE'),
      enemyBlood: listIn('ENEMY_BLOOD'),
      friend: W7_FRIEND,
      dust: listIn('DUST'),
      duskDust: listIn('DUSK_DUST'),
      briar: listIn('BRIAR'),
      thorn: strIn('THORN'),
      stone: listIn('STONE'),
      claw: listIn('CLAW'),
      glyph: W7_GLYPH,
      beats,
      time: W7_TIME,
      rx: numIn('RX'),
      ry: numIn('RY'),
      glassCut: numIn('GLASS_CUT'),
      cutRest: CUT_REST,
      shadeWindup: MONSTERS.shade.windup,
    },
    null,
    1,
  ),
);
console.log(`looks7.json: ${Object.keys(beats).length} looks' beats`);

// REAPING'S SPIRIT: the grey Shade's pictures (greyShade on each of the bestiary's Shade's, as shadeFrameOf picks them)
function png(w: number, h: number, rgba: Uint8ClampedArray): Uint8Array {
  const raw = new Uint8Array((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) raw.set(rgba.subarray(y * w * 4, (y + 1) * w * 4), y * (w * 4 + 1) + 1);
  const be = (n: number): number[] => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
  const chunk = (type: string, data: Uint8Array): number[] => {
    const td = new Uint8Array(4 + data.length);
    for (let i = 0; i < 4; i++) td[i] = type.charCodeAt(i);
    td.set(data, 4);
    return [...be(data.length), ...td, ...be(crc32(td) >>> 0)];
  };
  return new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, ...chunk('IHDR', new Uint8Array([...be(w), ...be(h), 8, 6, 0, 0, 0])), ...chunk('IDAT', deflateSync(raw, { level: 9 })), ...chunk('IEND', new Uint8Array(0))]);
}
{
  const art = shadeArt();
  const k = W7_TIME.spiritScale;
  type Pic = { x: number; y: number; w: number; h: number; ax: number; ay: number; dn: number };
  const made: { data: Uint8ClampedArray; w: number; h: number; ax: number; ay: number; dn: number }[] = [];
  const seen = new Map<Sprite, number>();
  const one = (sp: Sprite): number => {
    const had = seen.get(sp);
    if (had !== undefined) return had;
    const p = paintingOf(sp);
    const g = greyShadePixels(p.d, p.w, p.h, k);
    const dn = sp.density ?? 1;
    // (its anchor as far into it, 0.7 as far, and the pixel of room round it: greyShade)
    made.push({ data: g.data, w: g.w, h: g.h, ax: Math.round(sp.ax * dn * k) + 1, ay: Math.round(sp.ay * dn * k) + 1, dn });
    seen.set(sp, made.length - 1);
    return made.length - 1;
  };
  const sides: Record<string, unknown>[] = [];
  for (const set of [art.front, art.back]) {
    const clip = set.clips?.attack;
    sides.push({
      idle: set.idle.map(one),
      walk: set.walk.map(one),
      idleFps: set.idleFps ?? 2,
      walkFps: set.walkFps ?? 8,
      attack: clip ? clip.frames.map(one) : [],
      attackFps: clip ? clip.fps : 0,
      attackHit: clip ? clip.hit ?? 0 : 0,
    });
  }
  // one sheet, a row
  const W = made.reduce((s, m) => s + m.w + 1, 0);
  const H = made.reduce((s, m) => Math.max(s, m.h), 0);
  const sheet = new Uint8ClampedArray(W * H * 4);
  const pics: Pic[] = [];
  let x = 0;
  for (const m of made) {
    for (let yy = 0; yy < m.h; yy++) sheet.set(m.data.subarray(yy * m.w * 4, (yy + 1) * m.w * 4), (yy * W + x) * 4);
    pics.push({ x, y: 0, w: m.w, h: m.h, ax: m.ax, ay: m.ay, dn: m.dn });
    x += m.w + 1;
  }
  writeFileSync(`${OUT}/spirit7.png`, png(W, H, sheet));
  writeFileSync(`${OUT}/spirit7.json`, JSON.stringify({ pics, sides }));
  console.log(`spirit7.png: the grey Shade, ${made.length} pictures`);
}

if (process.argv[2] === 'check') {
  const dump = process.argv[3] ?? '';
  if (dump) mkdirSync(dump, { recursive: true });
  // THE MOMENTS. What the rules keep, as fx_words7.gd's `view` has it (the game's own names), and the looks' own state.
  type Mon = { id: number; x: number; y: number; r: number; dead: boolean; top: number; fx: number; fy: number; words: string[]; bleedT: number; stolen: number; spirit: boolean };
  type Zone = { kind: string; look?: string; x: number; y: number; r: number; t: number; dur: number; from?: string; src?: number };
  type Spirit = { id: number; x: number; y: number; t: number; life: number; next: number };
  type View = {
    hero: { x: number; y: number; fx: number; fy: number; heroBleedT: number; life: number; maxLife: number; move: { x0: number; y0: number; x1: number; y1: number } | null };
    monsters: Mon[];
    zones: Zone[];
    spirits: Spirit[];
  };
  type Splash = { x: number; y: number; age: number; size: number; seed: number; ex: number; ey: number; hero: boolean };
  type Scene = {
    name: string; clock: number; view: View; acts: Partial<Act>[]; splashes: Splash[]; bleeders: [number, { x: number; y: number; since: number }][];
    hot: [number, number][]; swing: { x: number; y: number; dx: number; dy: number; reach: number; at: number } | null; panes: (number | null)[];
  };
  const H = { x: 20, y: 20 };
  const hero = (more: Partial<View['hero']> = {}): View['hero'] => ({ x: H.x, y: H.y, fx: 0.7071, fy: 0.7071, heroBleedT: 0, life: 300, maxLife: 300, move: null, ...more });
  // (as tall as the game's own drawing will have it: topOf, a skeleton's figure)
  const top = FIGURE_SIZE.skeleton.top;
  const mon = (id: number, x: number, y: number, more: Partial<Mon> = {}): Mon => ({ id, x, y, r: 0.32, dead: false, top, fx: -0.7071, fy: -0.7071, words: [], bleedT: 0, stolen: 0, spirit: false, ...more });
  const scenes: Scene[] = [];
  const add = (name: string, view: View, clock: number, o: Partial<Scene> = {}): void => {
    scenes.push({ name, clock, view, acts: o.acts ?? [], splashes: o.splashes ?? [], bleeders: o.bleeders ?? [], hot: o.hot ?? [], swing: o.swing ?? null, panes: o.panes ?? [] });
  };
  const plain = (more: Partial<View> = {}): View => ({ hero: hero(), monsters: [], zones: [], spirits: [], ...more });
  const A = { x: H.x + 1.5, y: H.y + 0.2 };
  const B = { x: H.x + 2.6, y: H.y + 0.4 };
  const C = { x: H.x + 3.7, y: H.y + 0.6 };
  const line = [mon(1, A.x, A.y), mon(2, B.x, B.y), mon(3, C.x, C.y)];
  const ux = 0.9833;
  const uy = 0.1817;
  // PIERCING IN FRONT: the bolt through three in a line, ending in the air or on stone
  for (const t of [0.02, 0.07, 0.12, 0.18, 0.22, 0.3, 0.45]) {
    add(`pierce_front_t${t}`, plain({ monsters: line }), 10 + t, { acts: [{ word: 'piercing', side: 'front', x: H.x, y: H.y, x1: H.x + ux * 5, y1: H.y + uy * 5, dx: ux, dy: uy, r: 5, ids: [1, 2, 3], pts: [1.52, 2.63, 3.74], t, seed: 5150, dur: 0.75 }] });
  }
  for (const t of [0.2, 0.25, 0.4]) {
    add(`pierce_front_stone_t${t}`, plain({ monsters: line.slice(0, 2) }), 11 + t, { acts: [{ word: 'piercing', side: 'front', x: H.x, y: H.y, x1: H.x + ux * 4.4, y1: H.y + uy * 4.4, dx: ux, dy: uy, r: 4.4, stone: true, ids: [1, 2], pts: [1.52, 2.63], t, seed: 616, dur: 0.72 }] });
  }
  // (another way: up the screen)
  add('pierce_front_up_t0.1', plain({ monsters: [mon(4, H.x - 0.5, H.y - 1.6)] }), 12, { acts: [{ word: 'piercing', side: 'front', x: H.x, y: H.y, x1: H.x - 1.2, y1: H.y - 3.8, dx: -0.3, dy: -0.954, r: 4, ids: [4], pts: [1.67], t: 0.1, seed: 99, dur: 0.7 }] });
  // PIERCING BEHIND: the lance waiting, falling, driven along its line, the crack left glowing
  for (const t of [0.1, 0.3, 0.48, 0.53, 0.6, 0.68, 0.75, 1.0, 1.6, 2.3]) {
    add(`pierce_behind_t${t}`, plain({ monsters: line.slice(1) }), 20 + t, { acts: [{ word: 'piercing', side: 'behind', x: H.x + 0.6, y: H.y + 0.1, x1: H.x + 5, y1: H.y + 1, delay: 0.5, width: 1, ids: [2, 3], t, seed: 7070, dur: 2.62 }] });
  }
  // PIERCING ON A MONSTER: its shot through a wall to him; and a passage of the game's own shot
  for (const t of [0.05, 0.2, 0.35, 0.5, 0.62]) {
    add(`pierce_monster_t${t}`, plain(), 30 + t, { acts: [{ word: 'piercing', side: 'monster', x: H.x + 5, y: H.y - 2, x1: H.x, y1: H.y, r: 2.4, t, seed: 3131, dur: 0.75 }] });
  }
  for (const t of [0.05, 0.2, 0.45]) {
    add(`pierce_pass_t${t}`, plain(), 31 + t, { acts: [{ word: 'piercing', side: 'monster', part: 'pass', x: H.x + 2, y: H.y - 1, dx: -0.9, dy: 0.43, t, seed: 4242, dur: 0.7 }] });
  }
  // BLEEDING IN FRONT, and what bleeds: a monster standing and one walking, him, the splashes drying
  for (const t of [0.02, 0.06, 0.15, 0.35]) {
    add(`bleed_front_t${t}`, plain({ monsters: [mon(5, A.x, A.y)] }), 40 + t, { acts: [{ word: 'bleeding', side: 'front', x: A.x, y: A.y, ids: [5], dx: 1.5, dy: 0.2, t, seed: 818, dur: 0.7 }] });
  }
  const splashes: Splash[] = [
    { x: A.x + 0.5, y: A.y + 0.3, age: 0.2, size: 1.6, seed: 111, ex: 0.89, ey: 0.45, hero: false },
    { x: A.x + 0.2, y: A.y + 0.8, age: 1.8, size: 1.1, seed: 222, ex: 1, ey: 0, hero: false },
    { x: A.x - 0.6, y: A.y + 0.3, age: 2.6, size: 1.9, seed: 333, ex: 0.7, ey: -0.7, hero: false },
    { x: H.x - 0.4, y: H.y + 0.2, age: 0.5, size: 1.3, seed: 444, ex: -0.9, ey: 0.4, hero: true },
  ];
  for (const c of [3.2, 3.55]) {
    add(`bleeding_t${c}`, plain({ hero: hero({ heroBleedT: 2 }), monsters: [mon(6, A.x, A.y, { bleedT: 2 }), mon(7, B.x, B.y + 1, { bleedT: 1 })] }), c, { splashes, bleeders: [[6, { x: A.x, y: A.y, since: 0.3 }], [7, { x: B.x, y: B.y + 1, since: -0.4 }]] });
  }
  // BLEEDING BEHIND: the briars bursting up, standing with one walking in them, sinking back; and the rules' thorns
  for (const t of [0.05, 0.15, 0.6, 2.4, 4.75]) {
    add(`thorns_t${t}`, plain({ monsters: [mon(8, A.x + 0.3, A.y + 0.2)] }), 50 + t, { acts: [{ word: 'bleeding', side: 'behind', x: A.x, y: A.y, r: 1.6, t, seed: 9090, dur: 5 }] });
  }
  add('thorns_zone', plain({ zones: [{ kind: 'thorns', x: B.x, y: B.y + 1, r: 1.4, t: 1.3, dur: 5 }] }), 55);
  // BLEEDING ON A MONSTER: its blow cuts him
  for (const t of [0.02, 0.06, 0.15, 0.4]) {
    add(`bleed_monster_t${t}`, plain(), 60 + t, { acts: [{ word: 'bleeding', side: 'monster', x: H.x, y: H.y, dx: -1, dy: 0.3, t, seed: 1212, dur: 0.65 }] });
  }
  // REAPING IN FRONT: the soul torn out and flying to him
  for (const t of [0.05, 0.2, 0.45, 0.68, 0.85]) {
    add(`reap_front_t${t}`, plain(), 70 + t, { acts: [{ word: 'reaping', side: 'front', x: B.x, y: B.y, t, seed: 2323, dur: 1.0 }] });
  }
  // REAPING BEHIND: the rules' spirit rising, fighting, going; a blow of its own; its rake
  const spirit: Spirit = { id: 900, x: A.x, y: A.y + 0.8, t: 0, life: 6, next: 0.5 };
  for (const t of [0.15, 0.4, 2.0, 5.7]) {
    add(`reap_behind_t${t}`, plain({ spirits: [{ ...spirit, t }], monsters: [mon(9, A.x + 0.8, A.y + 0.9)] }), 80 + t, { acts: [{ word: 'reaping', side: 'behind', x: A.x - 0.6, y: A.y, ids: [900, 9], pts: [1.95], t, seed: 3434, dur: 6, rules: true }] });
  }
  for (const t of [0.02, 0.05, 0.12, 0.25]) {
    add(`reap_hit_t${t}`, plain({ monsters: [mon(9, A.x + 0.8, A.y + 0.9)] }), 85 + t, { acts: [{ word: 'reaping', side: 'behind', part: 'hit', x: A.x + 0.8, y: A.y + 0.9, x1: A.x, y1: A.y + 0.8, ids: [9, 900], t, seed: 4545, dur: 0.42 }] });
  }
  // REAPING ON A MONSTER: it lurches up again in the enemy's fire
  for (const t of [0.1, 0.4, 0.9, 1.2]) {
    add(`reap_monster_t${t}`, plain(), 90 + t, { acts: [{ word: 'reaping', side: 'monster', x: B.x, y: B.y, t, seed: 5656, dur: 1.4 }] });
  }
  // CULLING IN FRONT: held, the scythe sweeping through, on, gone; and with no one standing (fallen)
  for (const t of [0.04, 0.12, 0.18, 0.21, 0.26, 0.4, 0.52]) {
    add(`cull_front_t${t}`, plain({ monsters: [mon(10, A.x, A.y)] }), 100 + t, { acts: [{ word: 'culling', side: 'front', x: A.x, y: A.y, ids: [10], dx: 1.5, dy: 0.2, t, seed: 6767, dur: 0.95 }] });
  }
  add('cull_front_left_t0.2', plain(), 101, { acts: [{ word: 'culling', side: 'front', x: H.x - 1.2, y: H.y + 0.4, ids: [11], dx: -1.2, dy: 0.4, t: 0.2, seed: 77, dur: 0.95 }] });
  // CULLING BEHIND: the reaper's mark as the rules lay it, and as it takes one
  for (const t of [0.1, 2.5, 7.8]) {
    add(`reaper_zone_t${t}`, plain({ zones: [{ kind: 'reaper', x: B.x, y: B.y, r: 1.1, t, dur: 8 }] }), 110 + t);
  }
  for (const t of [0.05, 0.15, 0.35, 0.6, 0.85]) {
    add(`cull_mark_t${t}`, plain({ monsters: [mon(12, B.x + 0.2, B.y)] }), 112 + t, { acts: [{ word: 'culling', side: 'behind', part: 'mark', x: B.x, y: B.y, r: 1.1, x1: B.x + 0.2, y1: B.y, ids: [12], t, seed: 7878, dur: 0.95 }] });
  }
  // CULLING ON A MONSTER: its blow while he is low; and its fire kindled
  for (const t of [0.03, 0.12, 0.3]) {
    add(`cull_monster_blow_t${t}`, plain({ monsters: [mon(13, A.x, A.y - 0.5)] }), 120 + t, { acts: [{ word: 'culling', side: 'monster', part: 'blow', x: A.x, y: A.y - 0.5, ids: [13], t, seed: 8989, dur: 0.36 }] });
  }
  add('cull_aura', plain({ hero: hero({ life: 40 }), monsters: [mon(14, A.x, A.y, { words: ['culling'] }), mon(15, B.x, B.y + 1, { words: ['culling'] })] }), 123.3, { hot: [[14, 1], [15, 0.4]] });
  add('cull_monster_t0.2', plain({ monsters: [mon(16, A.x, A.y)] }), 124, { acts: [{ word: 'culling', side: 'monster', x: A.x, y: A.y, ids: [16], t: 0.2, seed: 1919, dur: 1 }] });
  // SURGING: in front, behind (his dodge), on a monster (its warning, its wave)
  for (const t of [0.03, 0.15, 0.35, 0.5]) {
    add(`surge_front_t${t}`, plain(), 130 + t, { acts: [{ word: 'surging', side: 'front', x: H.x, y: H.y, r: 2.2, t, seed: 2020, dur: 0.55 }] });
  }
  for (const t of [0.05, 0.25, 0.45]) {
    add(`surge_behind_t${t}`, plain(), 135 + t, { acts: [{ word: 'surging', side: 'behind', x: H.x - 1.8, y: H.y - 0.9, x1: H.x, y1: H.y, r: 1.5, t, seed: 2121, dur: 0.6 }] });
  }
  for (const t of [0.1, 0.5, 0.95]) {
    add(`surge_warn_t${t}`, plain({ monsters: [mon(17, B.x, B.y)] }), 140 + t, { acts: [{ word: 'surging', side: 'monster', part: 'warn', x: B.x, y: B.y, ids: [17], r: 2.3, pts: [1.0], t, seed: 2222, dur: 1.0 }] });
  }
  for (const t of [0.05, 0.3]) {
    add(`surge_wave_t${t}`, plain({ monsters: [mon(17, B.x, B.y)] }), 142 + t, { acts: [{ word: 'surging', side: 'monster', part: 'wave', x: B.x, y: B.y, ids: [17], r: 2.3, t, seed: 2323, dur: 0.55 }] });
  }
  for (const t of [0.4, 1.2]) {
    add(`surge_monster_t${t}`, plain({ monsters: [mon(18, B.x, B.y)] }), 144 + t, { acts: [{ word: 'surging', side: 'monster', x: B.x, y: B.y, ids: [18], r: 2.3, t, seed: 2424, dur: 1.55 }] });
  }
  // PLUNDERING: the spray (with its extra piece and without), the stream into his purse, his gold torn off him, it carrying it,
  // its gold bursting out of it as it dies
  for (const t of [0.04, 0.2, 0.5, 1.2, 2.3]) {
    add(`plunder_front_t${t}`, plain(), 150 + t, { acts: [{ word: 'plundering', side: 'front', x: B.x, y: B.y, pts: [1], t, seed: 3030, dur: 2.55 }] });
  }
  add('plunder_front_plain_t0.3', plain(), 151, { acts: [{ word: 'plundering', side: 'front', x: B.x, y: B.y, pts: [0], t: 0.3, seed: 3131, dur: 2.55 }] });
  for (const t of [0.08, 0.3, 0.6, 0.95]) {
    add(`plunder_behind_t${t}`, plain(), 155 + t, { acts: [{ word: 'plundering', side: 'behind', x: C.x, y: C.y, t, seed: 3232, dur: 1.15 }] });
  }
  for (const t of [0.1, 0.3, 0.55, 0.75]) {
    add(`plunder_monster_t${t}`, plain({ monsters: [mon(19, A.x + 0.8, A.y - 0.6)] }), 160 + t, { acts: [{ word: 'plundering', side: 'monster', x: A.x + 0.8, y: A.y - 0.6, ids: [19], t, seed: 3333, dur: 0.8 }] });
  }
  add('plunder_carrying', plain({ monsters: [mon(20, A.x, A.y, { stolen: 30 })] }), 163.4);
  for (const t of [0.05, 0.3, 0.7, 1.8]) {
    add(`plunder_drop_t${t}`, plain(), 165 + t, { acts: [{ word: 'plundering', side: 'monster', part: 'drop', x: A.x, y: A.y, t, seed: 3434, dur: 2.05 }] });
  }
  // MIRRORING: his reflection's cut (his swing seen, and none), the pane where he stood rising, casting, cracking, shattering;
  // on a monster, its glass flung back at him
  const swing = { x: H.x, y: H.y, dx: 0.7071, dy: 0.7071, reach: 1.5, at: 170 };
  for (const t of [0.04, 0.1, 0.2]) {
    add(`mirror_front_t${t}`, plain({ monsters: [mon(21, H.x + 2.4, H.y + 1.6)] }), 170 + t, { acts: [{ word: 'mirroring', side: 'front', x: H.x, y: H.y, t, seed: 4040, dur: 0.63 }], swing });
  }
  add('mirror_front_noswing_t0.1', plain(), 175.1, { acts: [{ word: 'mirroring', side: 'front', x: H.x, y: H.y, t: 0.1, seed: 4141, dur: 0.63 }] });
  for (const t of [0.05, 0.15, 0.6, 7.9]) {
    add(`mirror_zone_t${t}`, plain({ zones: [{ kind: 'mirror', x: H.x - 1.5, y: H.y + 0.5, r: 0.5, t, dur: 8 }] }), 180 + t, { panes: [0] });
  }
  add('mirror_zone_risen_late', plain({ zones: [{ kind: 'mirror', x: H.x - 1.5, y: H.y + 0.5, r: 0.5, t: 2.1, dur: 8 }] }), 182, { panes: [1.9] });
  for (const t of [0.05, 0.2, 0.45, 0.6, 0.9]) {
    add(`mirror_cast_t${t}`, plain({ monsters: [mon(22, H.x - 0.2, H.y + 1.7)] }), 185 + t, { acts: [{ word: 'mirroring', side: 'behind', part: 'cast', x: H.x - 1.5, y: H.y + 0.5, dx: 0.7071, dy: 0.7071, t, seed: 4242, dur: 1.28 }], swing });
  }
  for (const t of [0.03, 0.1, 0.18, 0.3, 0.42]) {
    add(`mirror_monster_t${t}`, plain({ monsters: [mon(23, B.x, B.y - 0.4)] }), 190 + t, { acts: [{ word: 'mirroring', side: 'monster', x: B.x, y: B.y - 0.4, ids: [23], t, seed: 4343, dur: 0.6 }] });
  }
  // ALL AT ONCE
  add(
    'together',
    plain({
      hero: hero({ heroBleedT: 1, life: 50 }),
      monsters: [mon(24, A.x, A.y, { bleedT: 3, words: ['culling'] }), mon(25, B.x, B.y + 1, { stolen: 12 })],
      zones: [{ kind: 'thorns', x: C.x, y: C.y - 1, r: 1.2, t: 2, dur: 5 }, { kind: 'reaper', x: H.x - 2, y: H.y + 1, r: 1.1, t: 3, dur: 8 }, { kind: 'mirror', x: H.x - 1, y: H.y - 1.5, r: 0.5, t: 1, dur: 8 }],
      spirits: [{ id: 901, x: H.x + 1, y: H.y + 2, t: 1, life: 6, next: 0.4 }],
    }),
    200.7,
    {
      acts: [
        { word: 'surging', side: 'front', x: H.x, y: H.y, r: 2.2, t: 0.2, seed: 1, dur: 0.55 },
        { word: 'plundering', side: 'front', x: B.x, y: B.y, pts: [1], t: 0.4, seed: 2, dur: 2.55 },
        { word: 'piercing', side: 'behind', x: H.x, y: H.y, x1: H.x + 4, y1: H.y - 2, delay: 0.5, width: 1, ids: [], t: 0.62, seed: 3, dur: 2.62 },
      ],
      splashes,
      bleeders: [[24, { x: A.x, y: A.y, since: 0.1 }]],
      hot: [[24, 0.7]],
      panes: [0, 0, 0.2],
    },
  );

  // THE GAME'S OWN PAINTER on each moment: a canvas that keeps the last colour laid on each pixel
  class Keep {
    fillStyle = '';
    px = new Map<string, string>();
    fillRect(x: number, y: number, w: number, h: number): void {
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.px.set(`${x + i},${y + j}`, this.fillStyle.toLowerCase().replace('#', ''));
    }
  }
  const cam: Cam = { ox: 0, oy: 0, lift: null } as unknown as Cam;
  const sum = (k: Keep): { n: number; md5: string } => {
    const lines = [...k.px.entries()].map(([p, c]) => `${p},${c}`).sort();
    return { n: lines.length, md5: createHash('md5').update(lines.join('\n')).digest('hex') };
  };
  const gameOf = (v: View): Game =>
    ({
      level: 1,
      hero: { x: v.hero.x, y: v.hero.y, fx: v.hero.fx, fy: v.hero.fy, heroBleedT: v.hero.heroBleedT, life: v.hero.life, d: { maxLife: v.hero.maxLife }, move: v.hero.move },
      monsters: v.monsters.map((m) => ({ ...m, kind: 'skeleton', champion: false })),
      zones: v.zones,
      spirits: v.spirits,
      projectiles: [],
    }) as unknown as Game;
  const out: unknown[] = [];
  for (const s of scenes) {
    clearW7();
    W7.clock = s.clock;
    for (const a of s.acts) playW7(a.word as Act['word'], a.side as Act['side'], { ...a, seed: a.seed ?? 1 });
    W7.splashes.push(...s.splashes.map((q) => ({ ...q })));
    for (const [id, b] of s.bleeders) W7.bleeders.set(id, { ...b });
    for (const [id, k] of s.hot) W7.hot.set(id, k);
    W7.swing = s.swing ? { ...s.swing } : null;
    const game = gameOf(s.view);
    s.view.zones.forEach((z, i) => {
      if (s.panes[i] !== undefined && s.panes[i] !== null) W7.panes.set(game.zones[i] as unknown as object, s.panes[i] as number);
    });
    const floor = new Keep();
    const air = new Keep();
    floorW7(floor as unknown as CanvasRenderingContext2D, cam, 0, game, () => true);
    airW7(air as unknown as CanvasRenderingContext2D, cam, 0, game);
    const spots: number[][] = [];
    lightsW7((x, y, r, a) => spots.push([x, y, r, a]), cam, game, 0);
    out.push({ ...s, floor: sum(floor), air: sum(air), spots });
    if (dump) writeFileSync(`${dump}/${s.name}.json`, JSON.stringify({ floor: Object.fromEntries(floor.px), air: Object.fromEntries(air.px) }));
  }
  // THE CLOCK (tickW7): six seconds at 30 a second of the rules' things coming and going (one bleeding, standing then walking;
  // one carrying his gold, then dead; one with Culling while he is low and then not; a spirit of the rules' gliding; a monster's
  // surge warned and waved; a rising told of), and of each frame what the game's own tickW7 keeps (its moments at work, the
  // splashes laid, the kindling, the spirits' facings), and every twentieth frame its two layers.
  const dt = 1 / 30;
  const v: View = plain({ hero: hero(), monsters: [], zones: [], spirits: [] });
  const m1 = mon(31, A.x, A.y);
  const m2 = mon(32, B.x, B.y + 1, { stolen: 20 });
  const m3 = mon(33, C.x, C.y, { words: ['culling'] });
  const sp: Spirit = { id: 950, x: H.x - 1, y: H.y + 1, t: 0, life: 6, next: 0.5 };
  const warn: Zone = { kind: 'warn', x: m3.x, y: m3.y, r: 2.3, t: 0, dur: 1.0, from: "Skeleton's surge", src: 33 };
  const fake = { level: 1, hero: {} as Record<string, unknown>, zones: [] as unknown[], monsters: [] as unknown[], spirits: [] as unknown[], projectiles: [] as unknown[] };
  const fxc = { fallen: [] as { figure: string; x: number; y: number; back: boolean; flip: boolean; t: number }[] };
  const frames: unknown[] = [];
  clearW7();
  W7.clock = 0;
  for (let k = 0; k < 180; k++) {
    const t = k * dt;
    // (one bleeding: standing until 1.5 s, then walking)
    m1.bleedT = t >= 0.4 && t < 4.5 ? 4.5 - t : 0;
    if (t > 1.5 && t < 3.5) {
      m1.x += 0.1;
      m1.y += 0.02;
    }
    // (he is low from 1 s to 3 s)
    v.hero.life = t >= 1 && t < 3 ? 60 : 300;
    // (it carries his gold until it dies at 2.5 s)
    m2.dead = t >= 2.5;
    // (a spirit of the rules' from 0.5 s to 4 s, gliding from 1 s to 2 s)
    sp.t = t - 0.5;
    if (t > 1 && t < 2) sp.x += 0.08;
    v.spirits = t >= 0.5 && t < 4 ? [{ ...sp }] : [];
    // (its surge warned from 3 s, its wave at 4 s)
    warn.t = t - 3;
    v.zones = t >= 3 && warn.t < warn.dur ? [warn] : [];
    v.monsters = [m1, m2, m3];
    const view = JSON.parse(JSON.stringify(v));
    fake.hero = { x: v.hero.x, y: v.hero.y, fx: v.hero.fx, fy: v.hero.fy, heroBleedT: v.hero.heroBleedT, life: v.hero.life, d: { maxLife: v.hero.maxLife }, move: null };
    fake.monsters = v.monsters.map((m) => ({ ...m, kind: 'skeleton', champion: false }));
    fake.zones = v.zones;
    fake.spirits = v.spirits;
    tickW7(dt, fake as unknown as Game, fxc as unknown as Fx);
    const f: Record<string, unknown> = {
      view,
      acts: W7.acts.map((a) => ({ word: a.word, side: a.side, part: a.part, t: a.t, dur: a.dur, x: a.x, y: a.y, r: a.r, ids: a.ids })),
      // (each look's seed is the game's chance: the Godot check lays its own looks with these to draw them)
      seeds: W7.acts.map((a) => a.seed),
      splashes: W7.splashes.length,
      hot: Object.fromEntries(W7.hot),
      spirits: Object.fromEntries([...W7.spiritWas].map(([id, w]) => [id, { fx: w.fx, fy: w.fy, walkT: w.walkT, moving: w.moving }])),
      carriers: [...W7.carriers.keys()],
    };
    if (k % 20 === 19) {
      // (the splashes are laid where the game's chance puts them: not drawn here, so that the two layers can be held dot for dot)
      const kept = W7.splashes.splice(0);
      const floor = new Keep();
      const air = new Keep();
      floorW7(floor as unknown as CanvasRenderingContext2D, cam, 0, fake as unknown as Game, () => true);
      airW7(air as unknown as CanvasRenderingContext2D, cam, 0, fake as unknown as Game);
      W7.splashes.push(...kept);
      f.floor = sum(floor);
      f.air = sum(air);
      f.clock = W7.clock;
    }
    frames.push(f);
  }
  writeFileSync(`${OUT}/looks7_check.json`, JSON.stringify({ scenes: out, clock: { dt, frames } }));
  console.log(`check: ${scenes.length} moments of the seven words' looks painted by the game's own painter; ${frames.length} frames of its clock`);
}

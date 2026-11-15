// THE GODOT PORT: LASTING'S, FLEETING'S AND VAST'S LOOKS (render/words10.ts, the art chat's), for godot/scripts/fx_words10.gd.
//   npx tsx tools/godot_words10.ts          -> godot/assets/words/looks10.json: each word's six tones (W10_RAMP), the enemy's
//                                              (W10_ENEMY), the floor's earth and dust and the enemy's dust (EARTH, DUST,
//                                              ENEMY_DUST), each look's beats (W10_BEATS) and its numbers (W10_TIME), a world
//                                              radius on the floor (RX, RY), how tall he stands (HERO_TOP), the poison's time.
//   npx tsx tools/godot_words10.ts check [dir]  -> also godot/assets/words/looks10_check.json (not kept in the repository):
//                                              THE GAME'S OWN PAINTER RUN ON A SPREAD OF MOMENTS of each look (render/words10.ts
//                                              floorW10 and airW10 on a canvas that keeps every dot), what the rules keep at each
//                                              given as the game has it (a Game of the fields the looks read), and of each
//                                              moment's two layers how many pixels it lays and a sum of them all, each pixel's
//                                              place and colour. godot/checks/looks10_check.gd lays the same moments with
//                                              fx_words10.gd and holds its pixels against these. With `dir`, every pixel of each
//                                              is written there too ({name}.json), to see where two differ.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { gameSwitches } from './godot_switches';
import { FIGURE_SIZE } from '../src/art/bestiary';
import { TUNE } from '../src/game/defs';
import type { Game } from '../src/game/game';
import { W10, W10_BEATS, W10_ENEMY, W10_GLYPH, W10_RAMP, W10_TIME, clearW10, floorW10, airW10, playW10, tickW10 } from '../src/render/words10';
import type { Act10 } from '../src/render/words10';
import type { Cam, Fx } from '../src/render/fx';

declare const process: { argv: string[] };
gameSwitches();
const OUT = 'godot/assets/words';
mkdirSync(OUT, { recursive: true });

// (what render/words10.ts keeps to itself, read out of it as it is written)
const SRC = readFileSync('src/render/words10.ts', 'utf8');
const listIn = (name: string): string[] => {
  const m = SRC.match(new RegExp(`const ${name}: readonly string\\[\\] = \\[([^\\]]*)\\]`));
  if (!m) throw new Error(`${name} not found in render/words10.ts`);
  return [...m[1].matchAll(/'(#[0-9a-f]{6})'/g)].map((q) => q[1]);
};
const numIn = (name: string): number => {
  const m = SRC.match(new RegExp(`const ${name} = ([0-9.]+);`));
  if (!m) throw new Error(`${name} not found in render/words10.ts`);
  return Number(m[1]);
};
const beats = Object.fromEntries(Object.entries(W10_BEATS).map(([k, b]) => [k, { build: b.build, hit: b.hit, fade: b.fade }]));
writeFileSync(
  `${OUT}/looks10.json`,
  JSON.stringify(
    {
      ramp: W10_RAMP,
      enemy: W10_ENEMY,
      earth: listIn('EARTH'),
      dust: listIn('DUST'),
      enemyDust: listIn('ENEMY_DUST'),
      glyph: W10_GLYPH,
      beats,
      time: W10_TIME,
      rx: numIn('RX'),
      ry: numIn('RY'),
      heroTop: numIn('HERO_TOP'),
      poisonTime: TUNE.poisonTime,
    },
    null,
    1,
  ),
);
console.log(`looks10.json: ${Object.keys(beats).length} looks' beats`);

if (process.argv[2] === 'check') {
  const dump = process.argv[3] ?? '';
  if (dump) mkdirSync(dump, { recursive: true });
  // THE MOMENTS. What the rules keep, as fx_words10.gd's `view` has it (the game's own names), and the looks' own state.
  type Skill = { id: string; kind: string; radius: number; channel: number; last: number; pace: number; size: number; wide: number; might: number; haste: number; frenzy: boolean; shield: number };
  type Mon = { id: number; x: number; y: number; r: number; dead: boolean; top: number; words: string[]; poisonT: number; burnT: number; lastSkill: number };
  type View = {
    hero: {
      x: number; y: number; fx: number; fy: number; speed: number; skills: Skill[]; channel: { skill: number; t: number } | null;
      mightT: number; hasteT: number; frenzyT: number; shieldT: number; boostBy: Record<string, number> | null;
      poisonT: number; burnT: number; chillT: number; dotBy: { word: string } | null;
    };
    zones: Record<string, unknown>[];
    monsters: Mon[];
  };
  type Scene = { name: string; clock: number; fxClock: number; view: View; acts: Partial<Act10>[]; since: Record<string, number>; trail: { x: number; y: number; at: number }[] };
  const top = FIGURE_SIZE.skeleton?.top ?? 22;
  // (his three moves: Strike, Whirlwind, Lunge, as words.json has them; `last` as Lasting (1.5) or Fleeting (2/3) makes it)
  const move = (i: number, last = 1, more: Partial<Skill> = {}): Skill => ({
    id: ['strike', 'whirlwind', 'leap'][i], kind: ['melee', 'whirl', 'leap'][i], radius: [0, 2, 1.6][i], channel: 2.4,
    last, pace: 1 / last, size: 1, wide: 1, might: 0, haste: 0, frenzy: false, shield: 0, ...more,
  });
  const L = 1.5;
  const F = 1 - 1 / 3;
  const H = { x: 20, y: 20 };
  const hero = (skills: Skill[], more: Partial<View['hero']> = {}): View['hero'] => ({
    x: H.x, y: H.y, fx: 0.7071, fy: 0.7071, speed: 4.6, skills, channel: null, mightT: 0, hasteT: 0, frenzyT: 0, shieldT: 0,
    boostBy: {}, poisonT: 0, burnT: 0, chillT: 0, dotBy: null, ...more,
  });
  const mon = (id: number, x: number, y: number, more: Partial<Mon> = {}): Mon => ({ id, x, y, r: 0.32, dead: false, top, words: [], poisonT: 0, burnT: 0, lastSkill: -1, ...more });
  const scenes: Scene[] = [];
  const add = (name: string, view: View, clock: number, o: Partial<Scene> = {}): void => {
    scenes.push({ name, clock, fxClock: o.fxClock ?? clock * 0.97 + 0.31, view, acts: o.acts ?? [], since: o.since ?? {}, trail: o.trail ?? [] });
  };
  const S = { x: H.x + 1.6, y: H.y };
  // LASTING ON A PATCH (Flame behind his Strike: burning ground, 4 s and half again): its build, at work, its last stretch, its end
  for (const [r, t] of [[1, 0.12], [1, 2.0], [1, 4.6], [1, 5.85], [2.2, 3.1], [2.2, 5.4]] as const) {
    add(`lasting_patch_r${r}_t${t}`, { hero: hero([move(0, L), move(1), move(2)]), zones: [{ key: 'burn:a', x: S.x, y: S.y, r, t, dur: 6, kind: 'burn', skill: 0 }], monsters: [] }, 3.3 + t);
  }
  // FLEETING ON A PATCH (4 s, a third less)
  for (const t of [0.05, 1.0, 2.5]) {
    add(`fleeting_patch_t${t}`, { hero: hero([move(0, F), move(1), move(2)]), zones: [{ key: 'burn:a', x: S.x, y: S.y, r: 1.3, t, dur: 2.6667, kind: 'burn', skill: 0 }], monsters: [] }, 1.7 + t);
  }
  // HIS WHIRLWIND, LASTING (2.4 s and half again) and FLEETING
  for (const t of [0.1, 1.2, 3.0]) {
    add(`lasting_spin_t${t}`, { hero: hero([move(0), move(1, L), move(2)], { channel: { skill: 1, t } }), zones: [], monsters: [] }, 5 + t);
  }
  for (const t of [0.04, 0.8]) {
    add(`fleeting_spin_t${t}`, { hero: hero([move(0), move(1, F), move(2)], { channel: { skill: 1, t } }), zones: [], monsters: [] }, 2 + t);
  }
  // A BOOST: Lasting's ribbon along his path (Power behind his Strike: might), Fleeting's streaks round him (Swift: haste)
  const path = Array.from({ length: 30 }, (_, i) => ({ x: H.x - 0.12 * (30 - i), y: H.y - 0.05 * (30 - i), at: i * 0.03 }));
  for (const [left, age] of [[7.4, 0.12], [5.0, 2.0], [0.2, 7.3]] as const) {
    add(`lasting_boost_left${left}`, { hero: hero([move(0, L, { might: 4 }), move(1), move(2)], { mightT: left, boostBy: { might: 0 } }), zones: [], monsters: [] }, 9 + age, { since: { boost: 9 }, trail: path });
  }
  add('lasting_boost_standing', { hero: hero([move(0, L, { might: 4 }), move(1), move(2)], { mightT: 3, boostBy: { might: 0 }, fx: -0.7071, fy: 0.7071 }), zones: [], monsters: [] }, 12, { since: { boost: 9 } });
  for (const [left, age] of [[1.9, 0.03], [1.0, 1.0], [0.1, 1.9]] as const) {
    add(`fleeting_boost_left${left}`, { hero: hero([move(0, F, { haste: 30 }), move(1), move(2)], { hasteT: left, boostBy: { haste: 0 } }), zones: [], monsters: [] }, 4 + age, { since: { boost: 4 } });
  }
  // (no boostBy: the boost's move found among his own, the game's way before it was kept)
  add('lasting_boost_unkept', { hero: hero([move(0), move(1), move(2, L, { haste: 25 })], { hasteT: 2.5, boostBy: null }), zones: [], monsters: [] }, 7, { since: { boost: 6 }, trail: path });
  // HIS POISON ON A MONSTER (Lasting: 6 s; Fleeting ticking fast), by the move that last struck it
  for (const [left, age] of [[5.9, 0.1], [3.0, 3.0], [0.2, 5.8]] as const) {
    add(`lasting_dot_left${left}`, { hero: hero([move(0, L), move(1), move(2)]), zones: [], monsters: [mon(7, S.x, S.y, { poisonT: left, lastSkill: 0 })] }, 20 + age, { since: { 'dot:7': 20 } });
  }
  for (const [left, age] of [[2.6, 0.02], [1.5, 1.13]] as const) {
    add(`fleeting_dot_left${left}`, { hero: hero([move(0, F), move(1), move(2)]), zones: [], monsters: [mon(9, S.x, S.y, { burnT: left, lastSkill: 0 })] }, 30 + age, { since: { 'dot:9': 30 } });
  }
  // A MONSTER'S ON HIM: Lasting (its poison 6 s), Fleeting (its burning ticking fast); and with no dotBy, by a carrier near him
  for (const [left, age] of [[5.8, 0.1], [2.0, 4.0]] as const) {
    add(`lasting_onhim_left${left}`, { hero: hero([move(0), move(1), move(2)], { poisonT: left, dotBy: { word: 'lasting' } }), zones: [], monsters: [] }, 40 + age, { since: { him: 40 } });
  }
  add('fleeting_onhim', { hero: hero([move(0), move(1), move(2)], { burnT: 1.4, dotBy: { word: 'fleeting' } }), zones: [], monsters: [] }, 50.37, { since: { him: 50 } });
  add('lasting_onhim_by_carrier', { hero: hero([move(0), move(1), move(2)], { chillT: 2.2, dotBy: null }), zones: [], monsters: [mon(3, H.x + 2, H.y + 1, { words: ['lasting'] })] }, 60.5, { since: { him: 60 } });
  // VAST IN FRONT: a ring of dust rolled out (his Whirlwind, 2 to 2.8; his Strike's splash) at its beats
  for (const t of [0.03, 0.1, 0.16, 0.3, 0.6]) {
    add(`vast_ring_t${t}`, { hero: hero([move(0), move(1), move(2)]), zones: [], monsters: [] }, 70, { acts: [{ word: 'vast', kind: 'ring', x: H.x, y: H.y, r: 2.8, r0: 2.0, t, seed: 4242, whirl: true }] });
  }
  add('vast_ring_small_t0.22', { hero: hero([move(0), move(1), move(2)]), zones: [], monsters: [] }, 71, { acts: [{ word: 'vast', kind: 'ring', x: S.x, y: S.y, r: 1.4, r0: 1.0, t: 0.22, seed: 777 }] });
  // VAST BEHIND: a splash to two near, at its beats
  const to = [{ x: S.x + 1.2, y: S.y - 0.5, top }, { x: S.x - 0.4, y: S.y + 1.3, top }];
  for (const t of [0.03, 0.12, 0.2, 0.3, 0.45, 0.65]) {
    add(`vast_splash_t${t}`, { hero: hero([move(0), move(1), move(2)]), zones: [], monsters: [] }, 80, { acts: [{ word: 'vast', kind: 'splash', x: S.x, y: S.y, r: 1.5, t, seed: 9191, to }] });
  }
  // VAST ON A MONSTER: its warning drawn wider (whole, and a minion's half)
  for (const [t, half] of [[0.05, false], [0.5, false], [0.85, false], [0.4, true]] as const) {
    add(`vast_warn_t${t}${half ? '_half' : ''}`, { hero: hero([move(0), move(1), move(2)]), zones: [{ kind: 'warn', x: S.x, y: S.y, r: 1.63, t, dur: 0.9, hostile: true, words: ['vast'], half: half ? { words: ['vast'] } : {} }], monsters: [] }, 90 + t);
  }
  // WHAT A HELD LOOK LEAVES as its thing goes: Lasting's heap, dunes and drift blowing away; Fleeting's last sparks
  const none = (): View => ({ hero: hero([move(0), move(1), move(2)]), zones: [], monsters: [] });
  for (const t of [0.1, 0.4]) {
    add(`after_heap_t${t}`, none(), 100, { acts: [{ word: 'lasting', kind: 'after', what: 'heap', x: S.x, y: S.y, p: 0.8, r0: 5, dur: 0.6, t, seed: 515 }] });
    add(`after_heap_enemy_t${t}`, none(), 100, { acts: [{ word: 'lasting', kind: 'after', what: 'heap', x: H.x, y: H.y, p: 0.6, r0: 5, enemy: true, dur: 0.6, t, seed: 616 }] });
    add(`after_dunes_t${t}`, none(), 101, { acts: [{ word: 'lasting', kind: 'after', what: 'dunes', x: S.x, y: S.y, r: 1.2, p: 0.9, dur: 0.7, t, seed: 3131 }] });
    add(`after_drift_t${t}`, none(), 102, { acts: [{ word: 'lasting', kind: 'after', what: 'drift', x: H.x, y: H.y, r: 2.0, p: 0.7, lead: 1.3, dur: 0.7, t, seed: 77 }] });
    add(`after_sparks_patch_t${t}`, none(), 103, { acts: [{ word: 'fleeting', kind: 'after', what: 'sparks', x: S.x, y: S.y, r: 1.3, p: 2, z: 0, dur: 0.4, t, seed: 4141 }] });
    add(`after_sparks_spin_t${t}`, none(), 104, { acts: [{ word: 'fleeting', kind: 'after', what: 'sparks', x: H.x, y: H.y, r: 2.0, p: 2, z: 10, dur: 0.2, t: t * 0.4, seed: 77 }] });
  }
  // ALL AT ONCE: a patch, his spin, a boost, a poison on a monster and one on him, a ring and a warning
  add(
    'together',
    {
      hero: hero([move(0, L, { might: 4 }), move(1, L), move(2, F)], { channel: { skill: 1, t: 2.9 }, mightT: 4, boostBy: { might: 0 }, poisonT: 3, dotBy: { word: 'fleeting' } }),
      zones: [{ key: 'ice:a', x: S.x, y: S.y + 1, r: 1.1, t: 5.0, dur: 6, kind: 'ice', skill: 0 }, { kind: 'warn', x: H.x - 2, y: H.y + 1, r: 1.3, t: 0.3, dur: 0.9, hostile: true, words: ['vast'], half: {} }],
      monsters: [mon(11, S.x + 0.5, S.y - 0.8, { poisonT: 4, lastSkill: 0 }), mon(12, H.x - 2, H.y + 1, { burnT: 1, lastSkill: 2 })],
    },
    123.4,
    { acts: [{ word: 'vast', kind: 'ring', x: S.x, y: S.y, r: 1.6, r0: 1.1, t: 0.2, seed: 2020 }], since: { boost: 120, 'dot:11': 121, 'dot:12': 123, him: 122 }, trail: path },
  );

  // THE GAME'S OWN PAINTER on each moment: a canvas that keeps the last colour laid on each pixel
  class Keep {
    fillStyle = '';
    px = new Map<string, string>();
    fillRect(x: number, y: number, w: number, h: number): void {
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.px.set(`${x + i},${y + j}`, this.fillStyle.toLowerCase().replace('#', ''));
    }
  }
  const cam: Cam = { ox: 0, oy: 0, lift: null };
  const sum = (k: Keep): { n: number; md5: string } => {
    const lines = [...k.px.entries()].map(([p, c]) => `${p},${c}`).sort();
    return { n: lines.length, md5: createHash('md5').update(lines.join('\n')).digest('hex') };
  };
  const out: unknown[] = [];
  for (const s of scenes) {
    clearW10();
    W10.clock = s.clock;
    W10.fx = { clock: s.fxClock } as unknown as Fx;
    for (const a of s.acts) playW10(a.word as Act10['word'], a.kind as Act10['kind'], { ...a, seed: a.seed ?? 1 });
    for (const [k, v] of Object.entries(s.since)) W10.since.set(k, v);
    W10.trail.push(...s.trail);
    const v = s.view;
    const game = {
      level: 1,
      hero: {
        ...v.hero,
        d: { speed: v.hero.speed },
        skills: v.hero.skills.map((q) => ({ id: q.id, front: [], r: { last: q.last, pace: q.pace, size: q.size, wide: q.wide, might: q.might, haste: q.haste, frenzy: q.frenzy, shield: q.shield } })),
        boostBy: v.hero.boostBy ?? undefined,
        dotBy: v.hero.dotBy ?? undefined,
      },
      zones: v.zones,
      monsters: v.monsters.map((m) => ({ ...m, kind: 'skeleton', champion: false })),
    } as unknown as Game;
    const floor = new Keep();
    const air = new Keep();
    floorW10(floor as unknown as CanvasRenderingContext2D, cam, 0, game, () => true);
    airW10(air as unknown as CanvasRenderingContext2D, cam, 0, game);
    out.push({ ...s, floor: sum(floor), air: sum(air) });
    if (dump) writeFileSync(`${dump}/${s.name}.json`, JSON.stringify({ floor: Object.fromEntries(floor.px), air: Object.fromEntries(air.px) }));
  }
  // THE CLOCK (tickW10): eight seconds at 30 a second of his things coming and going, and of each frame what the game's own
  // tickW10 keeps (its moments at work, when each state began, his path's length), and every twentieth frame its two layers.
  // The patches are kept as the same objects from frame to frame (the game knows each by itself).
  const dt = 1 / 30;
  const v: View = { hero: hero([move(0, L, { might: 4 }), move(1, L), move(2, F, { haste: 30 })]), zones: [], monsters: [] };
  const burn = { key: 'burn:t', x: S.x, y: S.y, r: 1.1, t: 0, dur: 6, kind: 'burn', skill: 0 };
  const ice = { key: 'ice:t', x: H.x - 1.5, y: H.y + 1, r: 1.0, t: 0, dur: 4 * F, kind: 'ice', skill: 2 };
  const warn = { kind: 'warn', x: H.x + 1, y: H.y - 2, r: 1.5, t: 0, dur: 0.9, hostile: true, words: ['vast'], half: {} };
  const m5 = mon(5, S.x + 0.6, S.y - 0.9, { lastSkill: 0 });
  const m6 = mon(6, S.x - 0.3, S.y + 1.1, { lastSkill: 2 });
  const fake = { level: 1, hero: {} as Record<string, unknown>, zones: [] as unknown[], monsters: [] as unknown[] };
  const fxc = { clock: 0.31 };
  const frames: unknown[] = [];
  clearW10();
  W10.clock = 0;
  for (let k = 0; k < 240; k++) {
    const t = k * dt;
    const h = v.hero;
    // (he stands until 2 s, then walks)
    if (t > 2) {
      h.x += 0.12;
      h.y += 0.03;
    }
    // his things, each in its own time
    const live = (z: { t: number; dur: number }, from: number): boolean => {
      if (t < from) return false;
      z.t = t - from;
      return z.t < z.dur;
    };
    v.zones = [];
    if (live(burn, 0.2)) v.zones.push(burn);
    if (live(ice, 0.5)) v.zones.push(ice);
    if (live(warn, 6.0)) v.zones.push(warn);
    h.channel = t >= 1 && t < 1 + 2.4 * L ? { skill: 1, t: t - 1 } : null;
    h.mightT = t >= 0.3 ? Math.max(0, 7.5 - (t - 0.3)) : 0;
    h.boostBy = t >= 0.3 ? { might: 0 } : {};
    m5.poisonT = t >= 1.5 ? Math.max(0, 6 - (t - 1.5)) : 0;
    m6.burnT = t >= 2 ? Math.max(0, 2 - (t - 2)) : 0;
    v.monsters = [m5, m6];
    h.poisonT = t >= 3 ? Math.max(0, 6 - (t - 3)) : 0;
    h.burnT = t >= 5 ? Math.max(0, 2 - (t - 5)) : 0;
    h.dotBy = t >= 5 ? { word: 'fleeting' } : t >= 3 ? { word: 'lasting' } : null;
    fake.hero = {
      ...h,
      d: { speed: h.speed },
      skills: h.skills.map((q) => ({ id: q.id, front: [], r: { last: q.last, pace: q.pace, size: q.size, wide: q.wide, might: q.might, haste: q.haste, frenzy: q.frenzy, shield: q.shield } })),
      boostBy: h.boostBy ?? undefined,
      dotBy: h.dotBy ?? undefined,
    };
    fake.zones = v.zones;
    fake.monsters = v.monsters.map((m) => ({ ...m, kind: 'skeleton', champion: false }));
    fxc.clock += dt;
    const view = JSON.parse(JSON.stringify(v));
    const fxClock = fxc.clock;
    tickW10(dt, fake as unknown as Game, fxc as unknown as Fx);
    const f: Record<string, unknown> = {
      view, fxClock,
      acts: W10.acts.map((a) => ({ word: a.word, kind: a.kind, what: a.what, t: a.t, dur: a.dur, seed: a.seed, x: a.x, y: a.y, r: a.r, r0: a.r0, p: a.p, z: a.z, enemy: a.enemy, lead: a.lead })),
      since: Object.fromEntries(W10.since),
      trail: W10.trail.length,
    };
    if (k % 20 === 19) {
      const floor = new Keep();
      const air = new Keep();
      floorW10(floor as unknown as CanvasRenderingContext2D, cam, 0, fake as unknown as Game, () => true);
      airW10(air as unknown as CanvasRenderingContext2D, cam, 0, fake as unknown as Game);
      f.floor = sum(floor);
      f.air = sum(air);
    }
    frames.push(f);
  }
  writeFileSync(`${OUT}/looks10_check.json`, JSON.stringify({ scenes: out, clock: { dt, frames } }));
  console.log(`check: ${scenes.length} moments of the three words' looks painted by the game's own painter; ${frames.length} frames of its clock`);
}

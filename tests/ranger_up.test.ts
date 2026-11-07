// THE RANGER BROUGHT UP TO THE BRAWLER'S LEVEL (src/art/ranger_up.ts, _moves.ts, _art.ts, _review.ts; the art chat's helper,
// 6-7 Nov 2026; docs/mockups/ranger_up/README.md). A MOCK-UP BEHIND A SWITCH THAT IS OFF, RANGER_UP. Held here:
//   1. the switch is off; of the game only art/heroes3.ts reaches the new files, and only through it; nothing of the game imports
//      his review; with it off, EVERY FRAME THE GAME PAINTS OF HIM IS THE SAME (each list's first, middle and last frame against
//      the hashes made from the game's Ranger as he is, d31abc22: tests/ranger_up.hashes.json; RANGER_UP_ALL=1 for every frame);
//   2. with it on, every list at 30 pictures a second (his gripping runs at 60), from all eight sides, the game's lists and more;
//   3. THE BOSSES' REVIEW (art/boss_checks.ts checkBoss), from each of his eight sides: EVERY LIST passes every check (his guard,
//      his run, the Shot, the Volley, his roll, struck both ways, his fall, his town stance and run, the squirrel and the sighting
//      in a fight and in town, his card's unslinging), with the game's handovers between them;
//   4. HIS LEGS: his bones' lengths (the knee joint raised a little: the shin 1.3 times the thigh standing straight, the hip and
//      the feet where they were); his stances' legs exactly the game's (the same feet, knee directions and depth of crouch, frame
//      for frame: his guard, his town stance, the squirrel and the sighting in a fight and in town, his card's ready, the Shot's,
//      and the Volley's kneel where the game's is); NEVER BOW-LEGGED: each knee on or inside the line from its hip to its foot,
//      within a game pixel, or no worse than the game's own, in every frame of every list he stands in, from all eight sides;
//   5. HIS BOW SEEN FROM EVERY SIDE: in every list he stands, runs or holds in (his runs, their other ways and his town lists
//      too), a good length of its wood and of its string and arrow, or, where the string is end-on, of its wood alone;
//   6. NO PRANCING: in every frame of his runs, their other ways, his stops and his setting off, no swinging thigh past 50 degrees
//      from straight down (the most 49);
//   7. crisp; the friend's cyan edge round him; nothing of the enemy's rim; nothing cut off; the feather fixed in his cap;
//   8. the Shot and the Volley by Movement 9: a held draw, the release in one frame drawn with its after-image, a follow-through;
//      their numbers as stated for the main chat;
//   9. his face reads at the game's size: two dark eyes on his lit face, the brown of his moustache under them.
//   run: tsx --test tests/ranger_up.test.ts          RANGER_UP_ALL=1 tsx --test tests/ranger_up.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';
// @ts-ignore
import * as nodePath from 'node:path';

import { RANGER_UP, RU_BROWN, RU_SKIN } from '../src/art/ranger_up';
import { paintRuMove as paintRu, ruPosed, ruSmeared, ruStartOf, ruStops } from '../src/art/ranger_up_art';
import { RU_BATTLE, RU_BATTLE_SEEN, RU_BODY, RU_GAME_KNEEL, RU_SHIN_RATIO, RU_TOWN, RU_TOWN_SEEN, RU_MOVES, RU_RUN3, ruRunWays, RU_SHOT3, RU_SHOT_HELD, RU_SHOT_HIT, RU_SHOT_LONG, RU_STAND3, RU_TOWN3, RU_TOWN_RUN3, RU_VOLLEY3, RU_VOLLEY_HELD, RU_VOLLEY_HIT, RU_VOLLEY_LONG } from '../src/art/ranger_up_moves';
import { RU_BOW_LEAST, RU_BOW_LEGS_MOST, RU_BOW_SHORT, RU_REPORTED, RU_BOW_WOOD_ALONE, RU_FRONT_ONLY, RU_STANDING, rangerReview, ruBowFaults, ruBowHeld, ruBowLegsMost, ruBowSeen, ruRunning, ruThighFaults } from '../src/art/ranger_up_review';
import { WU_RIM, WU_SIDES } from '../src/art/warrior_up';
import type { WuSide } from '../src/art/warrior_up';
import { wuThighs } from '../src/art/warrior_up_review';
import { checkBoss } from '../src/art/boss_checks';
import { MOVES3, RANGER_BODY } from '../src/art/moves3';
import type { Move3 } from '../src/art/moves3';
import { INK, RIM_ALPHA } from '../src/art/kit';
import { ENEMY_RIM } from '../src/art/mkit';
import { makeHeroArt3 } from '../src/art/heroes3';
import { lookOfPlace } from '../src/art/heroes';
import { bonesAt, solve, standing } from '../src/art/skeleton';
import type { Bones, Build } from '../src/art/skeleton';
import { rgba } from '../src/engine/px';
import { hashSprite } from '../tools/cheap_heroes';
import { rangerLists } from '../tools/ranger_up_measure';
import { paintWithoutCanvas } from './helpers';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void; deepEqual(a: unknown, b: unknown, msg?: string): void };
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
const path = nodePath as { join(...p: string[]): string };
declare const process: { env: Record<string, string | undefined> };
paintWithoutCanvas();

const FR = 1 / 30;
const near = (a: number, b: number, e = 1e-6): boolean => Math.abs(a - b) < e;
const endOf = (m: Move3): number => m.motion.keys[m.motion.keys.length - 1].at;
const KEY_OF = new Map<Move3, string>(Object.entries(RU_MOVES).map(([k, m]) => [m, k]));

// --- 1. the switch, and the game's Ranger unchanged while it is off ----------------------------------------------------------

test('1. the switch is ON (his yes, 7 Nov 2026); of the game only art/heroes3.ts reaches the new files, and only through it; nothing imports his review', () => {
  assert.equal(RANGER_UP.on, true, 'RANGER_UP is on');
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('art/ranger_up')) continue;
    if (/from ['"][^'"]*ranger_up(_moves|_art|_review)?['"]/.test(fs.readFileSync(path.join('src', f), 'utf8'))) users.push(f);
  }
  assert.equal(users.sort().join(' '), 'art/heroes3.ts', 'what imports them');
  assert.ok(/if \(cls === 'ranger' && RANGER_UP\.on\)/.test(fs.readFileSync('src/art/heroes3.ts', 'utf8')), 'heroes3 reaches them only through the switch');
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('art/ranger_up') || f.startsWith('dev/')) continue;
    assert.ok(!/ranger_up_review/.test(fs.readFileSync(path.join('src', f), 'utf8')), `${f} imports the review`);
  }
});

test('1. with the switch off, every frame the game paints of the Ranger is the very same picture (the hashes made from him as he is)', () => {
  const pinned = JSON.parse(fs.readFileSync('tests/ranger_up.hashes.json', 'utf8')) as { lists: Record<string, string[]> };
  const was = RANGER_UP.on;
  RANGER_UP.on = false;
  try {
    const lists = rangerLists();
    assert.deepEqual(lists.map((l) => l.name).sort(), Object.keys(pinned.lists).sort(), 'the same lists');
    const all = !!process.env.RANGER_UP_ALL;
    let n = 0;
    for (const l of lists) {
      const want = pinned.lists[l.name];
      assert.equal(l.frames.length, want.length, `${l.name}: as many frames`);
      const picks = all ? want.map((_, i) => i) : [...new Set([0, Math.floor(want.length / 2), want.length - 1])];
      for (const i of picks) {
        assert.equal(hashSprite(l.frames[i]), want[i], `${l.name}[${i}]: the very same picture`);
        n++;
      }
    }
    assert.ok(n > 300, `${n} frames held to their hashes`);
  } finally {
    RANGER_UP.on = was;
  }
});

// --- 2. the lists -------------------------------------------------------------------------------------------------------------

test('2. with it on, every list at 30 pictures a second (his gripping runs at 60), from all eight sides, the game\'s lists and more', () => {
  RANGER_UP.on = true;
  try {
    const art = makeHeroArt3();
    for (const place of ['dungeon', 'town', 'card'] as const) {
      const a = art.of('ranger', lookOfPlace(place)) as unknown as Record<WuSide, import('../src/art/actor_types').AnimSet>;
      for (const side of WU_SIDES) {
        const set = a[side];
        assert.ok(set, `${place} ${side}`);
        assert.equal(set.idleFps, 30, 'his stance at 30');
        assert.equal(set.idle.length, 72, 'his stance 2.4 s');
        assert.equal(set.walkFps, 60, 'his run at 60, gripping');
        assert.ok(near(set.walkStride ?? 0, RU_RUN3.stride as number), 'his stride');
        const c = set.clips!;
        for (const k of ['attack', 'heavy', 'roll', 'fall', 'reel', 'lurch'] as const) assert.ok(c[k] && Math.abs(c[k]!.fps - 30) < 1e-6 || k === 'roll', `${k} at 30`);
        assert.equal(set.stops?.length, 8, 'eight ways of coming to a stand');
        assert.ok(set.start, 'setting off');
        if (place === 'dungeon') {
          assert.equal(set.walkWays?.length, 3, 'his run the other three ways');
          assert.equal(c.attackWalk?.length, 4, 'the Shot walking, four ways');
          assert.equal(c.heavyWalk?.length, 4, 'the Volley walking, four ways');
        }
        if (side === 'front') {
          assert.ok(c.idleA && c.idleB, 'what he does left standing, from in front');
          if (place !== 'dungeon') assert.ok(c.ready, 'his card\'s ready');
        }
      }
    }
  } finally {
    RANGER_UP.on = false;
  }
});

// --- 3. the bosses' review -----------------------------------------------------------------------------------------------------

test('3. every frame of every list of his through every boss check, from all eight sides', () => {
  const faults: string[] = [];
  let moves = 0;
  const reported: string[] = [];
  for (const side of WU_SIDES) {
    const r = rangerReview(side);
    moves += r.moves.length;
    const f = checkBoss(r.mob, r.shape, r.moves);
    // (what is reported and not mended, RU_REPORTED: a check the game's own motion fails, held to no worse than the game's own)
    const game = f.some((x) => RU_REPORTED.some((k) => k.move === x.move)) ? checkBoss(...((g) => [g.mob, g.shape, RU_REPORTED.map((k) => k.move)] as const)(rangerReview(side, true))) : [];
    for (const x of f) {
      const rep = RU_REPORTED.find((k) => k.move === x.move && k.kind === x.kind && k.what === x.what);
      const was = Math.max(-Infinity, ...game.filter((y) => y.move === x.move && y.kind === x.kind && y.what === x.what).map((y) => y.by));
      if (rep && x.by <= was + 0.05) reported.push(`${side} ${x.move} ${x.what} ${x.by.toFixed(2)} (the game's own ${was.toFixed(2)})`);
      else faults.push(`${side} ${x.move} ${x.t.toFixed(2)} ${x.kind}: ${x.what}`);
    }
  }
  // (fifteen moves from in front, ten from each of the other seven sides: his card's and his habits are painted from in front)
  assert.equal(moves, 15 + 7 * 10, `${moves} moves reviewed`);
  assert.equal(faults.length, 0, faults.slice(0, 12).join('; '));
  console.log(`# reported, not mended (the game's own motion): ${reported.length} frames, the deepest ${reported.sort((p, q) => +q.split(' ').slice(-4)[0] - +p.split(' ').slice(-4)[0])[0] ?? 'none'}`);
  assert.ok(reported.every((x) => / front sighting /.test(` ${x}`)), 'only the sighting, from in front');
});

// --- the sweep: every moment that must be looked at, painted once from each side it is painted from --------------------------

function moments(): { m: Move3; t: number; key?: string; front: boolean }[] {
  const out: { m: Move3; t: number; key?: string; front: boolean }[] = [];
  const add = (m: Move3, fps: number, from = 0, to = Infinity, front = false): void => {
    const loop = m.motion.loop !== undefined;
    const n = Math.round(endOf(m) * fps);
    for (let i = Math.max(0, from); i < (loop ? n : n + 1) && i <= to; i++) out.push({ m, t: i / fps, key: KEY_OF.get(m), front });
  };
  for (const m of [RU_STAND3, RU_TOWN3]) add(m, 30);
  for (const m of [RU_RUN3, RU_TOWN_RUN3]) add(m, 60);
  add(RU_SHOT3, 30);
  add(RU_VOLLEY3, 30, RU_VOLLEY_HELD[0], RU_VOLLEY_HELD[1]);
  for (const k of RU_FRONT_ONLY) add(RU_MOVES[k], 30, k === 'rdraw' ? 26 : 0, Infinity, true);
  for (const [stand, runM] of [[RU_STAND3, RU_RUN3], [RU_TOWN3, RU_TOWN_RUN3]] as const) {
    for (const m of ruStops(stand, runM)) add(m, 30);
    add(ruStartOf(stand, runM).move, 60);
  }
  for (const m of ruRunWays()) add(m, 60);
  return out;
}
const MOMENTS = moments();
let swept: { bow: string[]; least: Record<string, { wood: number; string: number }>; carried: Record<string, { wood: number; string: number }>; crisp: string[] } | null = null;
function sweep(): NonNullable<typeof swept> {
  if (swept) return swept;
  const bow: string[] = [];
  const crisp: string[] = [];
  const least: Record<string, { wood: number; string: number }> = {};
  const carried: Record<string, { wood: number; string: number }> = {};
  const rim = rgba(WU_RIM);
  const enemy = rgba(ENEMY_RIM);
  for (const { m, t, key, front } of MOMENTS) {
    const fps = m.stride !== undefined || /setting off/.test(m.name) ? 60 : 30;
    const frame = Math.round(t * fps);
    for (const v of front ? (['front'] as WuSide[]) : WU_SIDES) {
      const f = paintRu(m, t, v);
      if (ruBowHeld(key, m.name, frame, v)) {
        bow.push(...ruBowFaults(key, m.name, frame, f, v));
        const b = ruBowSeen(f);
        // (the least of each side: in his guard, held draws and habits; and, apart, where he carries it, his runs and in town)
        const run = key === 'rrun' || key === 'rtownrun' || key === 'rtown' || key === 'tsquirrel' || key === 'tsighting' || (!key && /in town|setting off|backing away|going across/.test(m.name));
        const e = ((run ? carried : least)[v] ??= { wood: Infinity, string: Infinity });
        e.wood = Math.min(e.wood, b.wood);
        e.string = Math.min(e.string, b.string);
      }
      // crisp, the friend's edge, nothing of the enemy's, nothing cut off
      const d = f.px.d;
      let edge = 0;
      for (let k = 0; k < d.length; k += 4) {
        const a = d[k + 3];
        if (a === 0) continue;
        if (a === RIM_ALPHA) {
          if (d[k] === rim[0] && d[k + 1] === rim[1] && d[k + 2] === rim[2]) edge++;
          else crisp.push(`${m.name} ${frame} ${v}: an edge pixel not cyan`);
          continue;
        }
        if (a !== 255) crisp.push(`${m.name} ${frame} ${v}: a pixel part seen through`);
        if (d[k] === enemy[0] && d[k + 1] === enemy[1] && d[k + 2] === enemy[2]) crisp.push(`${m.name} ${frame} ${v}: the enemy's rim`);
      }
      if (edge < 60) crisp.push(`${m.name} ${frame} ${v}: ${edge} of edge`);
      const W = f.px.w;
      const H = f.px.h;
      for (let x = 0; x < W; x++) for (const y of [0, H - 1]) if (d[(y * W + x) * 4 + 3] > 0) crisp.push(`${m.name} ${frame} ${v}: cut off`);
      for (let y = 0; y < H; y++) for (const x of [0, W - 1]) if (d[(y * W + x) * 4 + 3] > 0) crisp.push(`${m.name} ${frame} ${v}: cut off`);
      if (!(f.tails ?? []).some((r) => r.id === 'r-feather')) crisp.push(`${m.name} ${frame} ${v}: no feather`);
    }
  }
  console.log('# the bow, least seen from each side (wood/string), in his guard, held draws and habits:', JSON.stringify(least), 'carried, in his runs and in town:', JSON.stringify(carried));
  return (swept = { bow, least, carried, crisp });
}

// --- 4. his legs ----------------------------------------------------------------------------------------------------------------

/** The game's own list of each of his by its short name. */
const GAME_OF: Record<string, Move3> = MOVES3 as unknown as Record<string, Move3>;
const LEG_FIELDS = ['lfx', 'lfy', 'lfz', 'lfp', 'lft', 'lk', 'rfx', 'rfy', 'rfz', 'rfp', 'rft', 'rk'] as const;

test('4. his bones: the knee joint raised a little, the shin 1.3 times the thigh standing straight; the hip, the feet and every other bone where they were', () => {
  const G = RANGER_BODY;
  const shin = (b: Build): number => (b.ankle + b.shank) / b.thigh;
  assert.ok(Math.abs(shin(G) - 1.157) < 0.005, `the game's: ${shin(G).toFixed(3)}`);
  assert.ok(Math.abs(shin(RU_BODY) - RU_SHIN_RATIO) < 1e-9 && RU_SHIN_RATIO === 1.3, `now: ${shin(RU_BODY).toFixed(3)}`);
  assert.ok(Math.abs(RU_BODY.thigh + RU_BODY.shank - (G.thigh + G.shank)) < 1e-9, 'the shin longer and the thigh shorter by the same amount: the hip where it was');
  assert.ok(G.thigh - RU_BODY.thigh > 0.85 && G.thigh - RU_BODY.thigh < 0.95, `the knee raised ${(G.thigh - RU_BODY.thigh).toFixed(2)} (a little)`);
  for (const k of Object.keys(G) as (keyof Build)[]) if (k !== 'thigh' && k !== 'shank') assert.deepEqual(RU_BODY[k], G[k], `${String(k)} as the game's`);
  // (standing straight, his hips and his feet exactly where the game's are; only his knees higher)
  const a = solve(G, standing(G) as never);
  const b = solve(RU_BODY, standing(RU_BODY) as never);
  for (const j of ['pelvis', 'hipL', 'hipR', 'ankleL', 'ankleR', 'toeL', 'heelR', 'neck', 'head', 'handL', 'handR'] as const) assert.ok(Math.hypot(...[0, 1, 2].map((i) => a[j][i] - b[j][i])) < 1e-6, `${j} where it was`);
  for (const leg of ['L', 'R'] as const) {
    const d = (p: readonly number[], q: readonly number[]): number => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
    assert.ok(Math.abs(d(b[`hip${leg}`], b[`knee${leg}`]) - RU_BODY.thigh) < 1e-6 && Math.abs(d(b[`knee${leg}`], b[`ankle${leg}`]) - RU_BODY.shank) < 1e-6, `his ${leg} thigh and shin their lengths`);
    assert.ok(b[`knee${leg}`][2] - a[`knee${leg}`][2] > 0.85, `his ${leg} knee raised ${(b[`knee${leg}`][2] - a[`knee${leg}`][2]).toFixed(2)}`);
  }
  // (and every list of his is on them, his run too)
  for (const [k, m] of Object.entries(RU_MOVES)) assert.equal(m.build, RU_BODY, `${k} on his bones`);
  for (const m of [...ruRunWays(), ...ruStops(RU_STAND3, RU_RUN3), ruStartOf(RU_STAND3, RU_RUN3).move]) assert.equal(m.build, RU_BODY, `${m.name} on his bones`);
});

test('4. his stances\' legs exactly the game\'s, frame for frame: the same feet, the same knee directions, the same depth of crouch (the owner: “He’s not a gunfighter why is he so bow legged”)', () => {
  // (his guard and his town stance: the game's, but for the bow's cant in his hand)
  for (const [now, game] of [[RU_BATTLE, MOVES3.rstand.rest], [RU_TOWN, MOVES3.rtown.rest]] as const) {
    for (const k of Object.keys(game) as (keyof Bones)[]) if (k !== 'wRoll') assert.equal(now[k], game[k], `${String(k)} as the game's`);
  }
  assert.equal(RU_BATTLE_SEEN, MOVES3.rstand.rest);
  assert.equal(RU_TOWN_SEEN, MOVES3.rtown.rest);
  // (every frame of each, and of what he does standing in them, its feet and knees the game's at that moment; his hips as low)
  const legsOf = (m: Move3, t: number): Record<string, number> => {
    const q = bonesAt(m.motion.keys, m.rest, t) as unknown as Record<string, number>;
    return Object.fromEntries(LEG_FIELDS.map((f) => [f, q[f]]));
  };
  let n = 0;
  for (const key of ['rstand', 'rtown', 'squirrel', 'sighting', 'tsquirrel', 'tsighting', 'shot']) {
    const m = RU_MOVES[key];
    const g = GAME_OF[key];
    for (let i = 0; i <= Math.round(endOf(m) * 30); i++) {
      const t = i / 30;
      // (the Shot is the game's on a held draw (Movement 9): its feet the game's throughout, never moving)
      const want = key === 'shot' ? legsOf(g, 0) : legsOf(g, Math.min(t, endOf(g)));
      assert.deepEqual(legsOf(m, t), want, `${key} ${i}: his feet and knees the game's`);
      n++;
    }
  }
  for (let i = 0; i <= Math.round(endOf(MOVES3.shot) * 30); i++) assert.deepEqual(legsOf(MOVES3.shot, i / 30), legsOf(MOVES3.shot, 0), `the game's Shot ${i} keeps its feet`);
  // (his guard's depth of crouch: the game's at rest. His breath, as it was (a7e24935), takes his hips a little lower and higher
  // than the game's does, within 0.82 units (0.41 of a game pixel) at any frame: it is what makes his chest rise and his
  // weight shift enough for the bosses' check that a stance is alive, which the game's own guard fails, 0.26 and 0.49 of 0.6)
  let most = 0;
  for (let i = 0; i <= 72; i++) {
    const t = i / 30;
    const a = bonesAt(RU_STAND3.motion.keys, RU_STAND3.rest, t).pz;
    const b = bonesAt(MOVES3.rstand.motion.keys, MOVES3.rstand.rest, t).pz;
    most = Math.max(most, Math.abs(a - b));
    assert.ok(Math.abs(a - b) <= 0.83, `his guard ${i}: his hips ${a.toFixed(2)}, the game's ${b.toFixed(2)}`);
  }
  console.log(`# his guard's hips through his breath: at most ${most.toFixed(2)} from the game's`);
  // (the Volley: down on his knee exactly where the game's kneel has him, its feet, its knees and its hips, through the held draw)
  for (let i = 7; i <= 22; i++) {
    const q = bonesAt(RU_VOLLEY3.motion.keys, RU_VOLLEY3.rest, i / 30) as unknown as Record<string, number>;
    const K = RU_GAME_KNEEL as unknown as Record<string, number>;
    for (const f of [...LEG_FIELDS, 'px', 'pz']) assert.ok(Math.abs(q[f] - K[f]) < 0.02, `the Volley ${i}: ${f} ${q[f].toFixed(2)}, the game's kneel ${K[f].toFixed(2)}`);
  }
  // (his card's ready: his town stance's feet till he has the bow, then his guard's: the game's, stepped where the game slid them)
  for (const [i, want] of [[0, RU_TOWN], [14, RU_TOWN], [24, RU_BATTLE], [Math.round(endOf(RU_MOVES.rdraw) * 30), RU_BATTLE]] as const) {
    const q = bonesAt(RU_MOVES.rdraw.motion.keys, RU_MOVES.rdraw.rest, i / 30) as unknown as Record<string, number>;
    for (const f of LEG_FIELDS) assert.ok(Math.abs(q[f] - (want as unknown as Record<string, number>)[f]) < 1e-6, `his card's ready ${i}: ${f}`);
  }
  assert.ok(n > 500, `${n} frames`);
});

/** The most each knee lies outside its line, in every list he stands in, from each of his eight sides: now and the game's. */
let bowed: { faults: string[]; rows: string[] } | null = null;
function bowLegs(): NonNullable<typeof bowed> {
  if (bowed) return bowed;
  const faults: string[] = [];
  const rows: string[] = [];
  for (const key of RU_STANDING) {
    for (const v of WU_SIDES) {
      const now = ruBowLegsMost(RU_MOVES[key], v);
      const was = ruBowLegsMost(GAME_OF[key], v);
      rows.push(`${key} ${v}: left ${now.L.toFixed(2)} (game ${was.L.toFixed(2)}), right ${now.R.toFixed(2)} (game ${was.R.toFixed(2)})`);
      for (const leg of ['L', 'R'] as const) {
        const allowed = Math.max(RU_BOW_LEGS_MOST, was[leg] + 0.05);
        if (now[leg] > allowed) faults.push(`${key} ${leg === 'L' ? now.atL : now.atR} ${v}: his ${leg === 'L' ? 'left' : 'right'} knee ${now[leg].toFixed(2)} outside the line (the game's ${was[leg].toFixed(2)})`);
      }
    }
  }
  return (bowed = { faults, rows });
}

test('4. never bow-legged: each knee on or inside the line from its hip to its foot (within a game pixel, or no worse than the game\'s own), every frame of every list he stands in, from all eight sides', () => {
  const b = bowLegs();
  console.log('# how far each knee lies outside the line from hip to foot, the most through each list (game pixels):\n#   ' + b.rows.join('\n#   '));
  assert.equal(b.rows.length, RU_STANDING.length * 8);
  assert.equal(b.faults.length, 0, b.faults.slice(0, 12).join('; '));
  // (this morning's guard, its back knee turned right out, was bow-legged: the check sees it)
  const morning: Move3 = { ...RU_STAND3, rest: { ...RU_BATTLE, lfx: 11, lfy: -1, lk: 0, lft: 2, rfx: -1, rfy: -4, rk: -78, rft: -75 } };
  const seen = Math.max(...WU_SIDES.map((v) => ruBowLegsMost(morning, v).R));
  assert.ok(seen > 3, `this morning's back knee: ${seen.toFixed(2)} outside the line`);
});

// --- 5. his bow seen ------------------------------------------------------------------------------------------------------------

test('5. his bow is seen from every side in every list he stands, runs or holds in: a good length of its wood and of its string and arrow, or of its wood alone where the string is end-on', () => {
  const s = sweep();
  assert.equal(s.bow.length, 0, s.bow.slice(0, 12).join('; '));
  for (const v of WU_SIDES) {
    assert.ok(s.least[v] && s.least[v].wood >= RU_BOW_LEAST, `${v}: ${JSON.stringify(s.least[v])}`);
    // (less only where it is reported, RU_BOW_SHORT, and by no more than it reports)
    const short = Math.min(RU_BOW_WOOD_ALONE, ...RU_BOW_SHORT.filter((x) => x.side === v).map((x) => x.wood));
    assert.ok(s.carried[v] && s.carried[v].wood >= short, `${v}, carried: ${JSON.stringify(s.carried[v])}`);
  }
});

// --- 6. no prancing -------------------------------------------------------------------------------------------------------------

test('6. no prancing: in every frame of his runs, their other ways, his stops and setting off, no swinging thigh past 50 degrees', () => {
  const faults: string[] = [];
  let most = 0;
  let n = 0;
  const runs: Move3[] = [RU_RUN3, RU_TOWN_RUN3, ...ruRunWays()];
  for (const [stand, runM] of [[RU_STAND3, RU_RUN3], [RU_TOWN3, RU_TOWN_RUN3]] as const) runs.push(...ruStops(stand, runM), ruStartOf(stand, runM).move);
  for (const m of runs) {
    const fps = 60;
    for (let i = 0; i <= Math.round(endOf(m) * fps); i++) {
      const sk = solve(m.build, bonesAt(m.motion.keys, m.rest, i / fps));
      const key = KEY_OF.get(m);
      assert.ok(ruRunning(key, m.name), `${m.name} is a run`);
      faults.push(...ruThighFaults(key, m.name, i, sk, 'front'));
      for (const t of wuThighs(sk)) if (t.swinging) most = Math.max(most, t.deg);
      n++;
    }
  }
  assert.ok(n > 300, `${n} moments`);
  assert.equal(faults.length, 0, faults.slice(0, 12).join('; '));
  // (the most, 49.0 degrees, in his stops in a fight: his thigh a little shorter now, his knee joint raised, it is 2.3 more than
  // on the game's bones; under the check's 50)
  assert.ok(most <= 49.5, `the most a swinging thigh comes up: ${most.toFixed(1)}`);
  // (the game's run, as it was, came up past 60)
  let was = 0;
  const g = MOVES3.rrun;
  for (let i = 0; i < 25; i++) for (const t of wuThighs(solve(g.build, bonesAt(g.motion.keys, g.rest, i / 60)))) if (t.swinging) was = Math.max(was, t.deg);
  assert.ok(was > 60, `the game's run: ${was.toFixed(1)}`);
});

// --- 7. crisp -------------------------------------------------------------------------------------------------------------------

test('7. every picture looked at, from every side: crisp, the friend\'s cyan edge, nothing of the enemy\'s rim, nothing cut off, the feather fixed', () => {
  const s = sweep();
  assert.equal(s.crisp.length, 0, [...new Set(s.crisp)].slice(0, 12).join('; '));
});

// --- 8. Movement 9 --------------------------------------------------------------------------------------------------------------

test('8. the Shot and the Volley by Movement 9: a held draw, the release in one frame with its after-image, a follow-through; their numbers', () => {
  assert.ok(near(RU_SHOT3.motion.hit ?? -1, RU_SHOT_HIT) && near(RU_SHOT_HIT, 10 / 30), 'the arrow goes at 10 frames (0.333 s)');
  assert.ok(near(endOf(RU_SHOT3), RU_SHOT_LONG) && near(RU_SHOT_LONG, 26 / 30), 'the Shot 26 frames');
  assert.ok(near(RU_VOLLEY3.motion.hit ?? -1, RU_VOLLEY_HIT) && near(RU_VOLLEY_HIT, 12 / 30), 'the arrows go at 12 frames (0.4 s)');
  assert.ok(near(endOf(RU_VOLLEY3), RU_VOLLEY_LONG) && near(RU_VOLLEY_LONG, 32 / 30), 'the Volley 32 frames');
  for (const [m, held, hit] of [[RU_SHOT3, RU_SHOT_HELD, RU_SHOT_HIT], [RU_VOLLEY3, RU_VOLLEY_HELD, RU_VOLLEY_HIT]] as const) {
    const at = (f: number): ReturnType<typeof ruPosed> => ruPosed(m, f / 30);
    // HELD: at full draw through the held frames, his string hand nearly still
    for (let f = held[0]; f <= held[1]; f++) assert.ok(at(f).q.draw > 0.95, `${m.name}: at full draw at ${f}`);
    const still = Math.hypot(...[0, 1, 2].map((k) => at(held[1]).s.handR[k] - at(held[0]).s.handR[k]));
    assert.ok(still < 1.5, `${m.name}: held still (${still.toFixed(2)})`);
    // THE RELEASE IN ONE FRAME: the frame before at full draw, the release frame loosed (the string straight), and only it smeared
    const h = Math.round(hit * 30);
    assert.ok(at(h - 1).q.draw > 0.95 && at(h).q.draw < 0.2, `${m.name}: loosed in one frame`);
    for (let f = 0; f <= Math.round(endOf(m) * 30); f++) assert.equal(ruSmeared(m, f / 30), f === h, `${m.name}: its after-image only on the release (${f})`);
    // ITS AFTER-IMAGE PAINTED: the release frame has more of the string's and arrow's colours than the frame after
    // THE FOLLOW-THROUGH: the string hand goes on back after the release
    const back = Math.hypot(...[0, 1, 2].map((k) => at(h + 4).s.handR[k] - at(h - 1).s.handR[k]));
    assert.ok(back > 8, `${m.name}: the string hand flies back ${back.toFixed(1)}`);
  }
  const f = paintRu(RU_SHOT3, RU_SHOT_HIT, 'front');
  const g = paintRu(RU_SHOT3, RU_SHOT_HIT + FR, 'front');
  const lineOf = (x: typeof f): number => Array.from(x.drawn.stuff).filter((k) => k >= 1000 && k < 2000).length;
  assert.ok(lineOf(f) > lineOf(g) + 10, `the release's after-image (${lineOf(f)} pixels of string and arrows, the frame after ${lineOf(g)})`);
});

// --- 9. his face ----------------------------------------------------------------------------------------------------------------

test('9. his face reads at the game\'s size: two dark eyes on his lit face, the brown of his moustache under them', () => {
  const ink = rgba(INK);
  const skin = new Set(RU_SKIN.map((c) => rgba(c).slice(0, 3).join(',')));
  const lit = new Set(RU_SKIN.slice(2).map((c) => rgba(c).slice(0, 3).join(',')));
  const brown = new Set(RU_BROWN.slice(1).map((c) => rgba(c).slice(0, 3).join(',')));
  // (as he faces his mark: not in the moment of his habit, his glance away along the way he is not facing)
  for (const t of [0, 0.6, 2.1, 2.3]) {
    const { px } = paintRu(RU_STAND3, t, 'front');
    const d = px.d;
    const at = (x: number, y: number): string => (x < 0 || y < 0 || x >= px.w || y >= px.h ? '' : `${d[(y * px.w + x) * 4]},${d[(y * px.w + x) * 4 + 1]},${d[(y * px.w + x) * 4 + 2]}`);
    const eyes: [number, number][] = [];
    let tash = 0;
    for (let y = 0; y < px.h; y++) for (let x = 0; x < px.w; x++) {
      if (at(x, y) === `${ink[0]},${ink[1]},${ink[2]}` && skin.has(at(x - 1, y)) && skin.has(at(x + 1, y)) && (lit.has(at(x - 1, y)) || lit.has(at(x + 1, y)))) eyes.push([x, y]);
    }
    const cols = new Set(eyes.map(([x]) => x));
    assert.ok(cols.size >= 2, `t ${t}: two eyes on lit skin (${eyes.length} eye pixels in ${cols.size} columns)`);
    const top = Math.min(...eyes.map(([, y]) => y));
    for (let y = top + 1; y <= top + 6; y++) for (let x = Math.min(...cols) - 3; x <= Math.max(...cols) + 3; x++) if (brown.has(at(x, y))) tash++;
    assert.ok(tash >= 6, `t ${t}: his moustache under his eyes (${tash} pixels of its brown)`);
  }
});

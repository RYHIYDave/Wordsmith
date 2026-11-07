// THE RANGER BROUGHT UP TO THE BRAWLER'S LEVEL (src/art/ranger_up.ts, _moves.ts, _art.ts, _review.ts; the art chat's helper,
// 6-7 Nov 2026; docs/mockups/ranger_up/README.md). A MOCK-UP BEHIND A SWITCH THAT IS OFF, RANGER_UP. Held here:
//   1. the switch is off; of the game only art/heroes3.ts reaches the new files, and only through it; nothing of the game imports
//      his review; with it off, EVERY FRAME THE GAME PAINTS OF HIM IS THE SAME (each list's first, middle and last frame against
//      the hashes made from the game's Ranger as he is, d31abc22: tests/ranger_up.hashes.json; RANGER_UP_ALL=1 for every frame);
//   2. with it on, every list at 30 pictures a second (his gripping runs at 60), from all eight sides, the game's lists and more;
//   3. THE BOSSES' REVIEW (art/boss_checks.ts checkBoss), from each of his eight sides: EVERY LIST passes every check (his guard,
//      his run, the Shot, the Volley, his roll, struck both ways, his fall, his town stance and run, the squirrel and the sighting
//      in a fight and in town, his card's unslinging), with the game's handovers between them;
//   4. HIS LEGS: every stance and held pose from every side held below the knee to above it (his guard and town stance back at the
//      game's width, as the owner asked, held to what that width gives, 0.75 and 0.92; the Volley's standing leg at 1.05, its
//      kneeling leg excepted), his runs at 1 where a foot bears him; his feet as far apart as the game's;
//   5. HIS BOW SEEN FROM EVERY SIDE: in every list he stands, runs or holds in (his runs, their other ways and his town lists
//      too), a good length of its wood and of its string and arrow, or, where the string is end-on, of its wood alone;
//   6. NO PRANCING: in every frame of his runs, their other ways, his stops and his setting off, no swinging thigh past 50 degrees
//      from straight down (none past 48);
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
import { RU_BATTLE, RU_TOWN, RU_MOVES, RU_RUN3, ruRunWays, RU_SHOT3, RU_SHOT_HELD, RU_SHOT_HIT, RU_SHOT_LONG, RU_STAND3, RU_TOWN3, RU_TOWN_RUN3, RU_VOLLEY3, RU_VOLLEY_HELD, RU_VOLLEY_HIT, RU_VOLLEY_LONG } from '../src/art/ranger_up_moves';
import { RU_BOW_LEAST, RU_BOW_SHORT, RU_BOW_WOOD_ALONE, RU_FRONT_ONLY, RU_LEG_GUARD_LEAST, RU_LEG_HELD_LEAST, RU_LEGS_HELD, rangerReview, ruBowFaults, ruBowHeld, ruBowSeen, ruLegFaults, ruRunning, ruThighFaults } from '../src/art/ranger_up_review';
import { WU_RIM, WU_SIDES } from '../src/art/warrior_up';
import type { WuSide } from '../src/art/warrior_up';
import { wuLegs, wuThighs } from '../src/art/warrior_up_review';
import { checkBoss } from '../src/art/boss_checks';
import { MOVES3, RANGER_BODY } from '../src/art/moves3';
import type { Move3 } from '../src/art/moves3';
import { INK, RIM_ALPHA } from '../src/art/kit';
import { ENEMY_RIM } from '../src/art/mkit';
import { makeHeroArt3 } from '../src/art/heroes3';
import { lookOfPlace } from '../src/art/heroes';
import { bonesAt, solve } from '../src/art/skeleton';
import type { Bones } from '../src/art/skeleton';
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

test('1. the switch is off; of the game only art/heroes3.ts reaches the new files, and only through it; nothing imports his review', () => {
  assert.equal(RANGER_UP.on, false, 'RANGER_UP is off');
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
  for (const side of WU_SIDES) {
    const r = rangerReview(side);
    moves += r.moves.length;
    const f = checkBoss(r.mob, r.shape, r.moves);
    faults.push(...f.map((x) => `${side} ${x.move} ${x.t.toFixed(2)} ${x.kind}: ${x.what}`));
  }
  // (fifteen moves from in front, ten from each of the other seven sides: his card's and his habits are painted from in front)
  assert.equal(moves, 15 + 7 * 10, `${moves} moves reviewed`);
  assert.equal(faults.length, 0, faults.slice(0, 12).join('; '));
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
let swept: { legs: string[]; bow: string[]; least: Record<string, { wood: number; string: number }>; carried: Record<string, { wood: number; string: number }>; crisp: string[]; legsSeen: number } | null = null;
function sweep(): NonNullable<typeof swept> {
  if (swept) return swept;
  const legs: string[] = [];
  const bow: string[] = [];
  const crisp: string[] = [];
  const least: Record<string, { wood: number; string: number }> = {};
  const carried: Record<string, { wood: number; string: number }> = {};
  let legsSeen = 0;
  const rim = rgba(WU_RIM);
  const enemy = rgba(ENEMY_RIM);
  for (const { m, t, key, front } of MOMENTS) {
    const fps = m.stride !== undefined || /setting off/.test(m.name) ? 60 : 30;
    const frame = Math.round(t * fps);
    for (const v of front ? (['front'] as WuSide[]) : WU_SIDES) {
      const f = paintRu(m, t, v);
      if (key) {
        legs.push(...ruLegFaults(key, frame, f, v));
        legsSeen++;
      }
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
  return (swept = { legs, bow, least, carried, crisp, legsSeen });
}

// --- 4. his legs ----------------------------------------------------------------------------------------------------------------

test('4. his legs: every stance and held pose from every side held below the knee to above it (his guard and town stance at the game\'s width, held to what it gives), his runs at 1 where a foot bears him', () => {
  const s = sweep();
  assert.ok(s.legsSeen > 1000, `${s.legsSeen} pictures looked at`);
  assert.equal(s.legs.length, 0, s.legs.slice(0, 12).join('; '));
  // (and what is painted from in front only, from every side on his bones alone: each leg counted, seen or not)
  const faults: string[] = [];
  for (const h of RU_LEGS_HELD.filter((x) => RU_FRONT_ONLY.includes(x.key))) {
    const m = RU_MOVES[h.key];
    for (let i = h.from; i <= Math.min(h.to, Math.round(endOf(m) * 30)); i++) {
      const sk = solve(m.build, bonesAt(m.motion.keys, m.rest, i / 30));
      for (const v of WU_SIDES) for (const l of wuLegs(sk, v, RANGER_BODY.ankle)) if (l.ratio < (h.least ?? RU_LEG_HELD_LEAST)) faults.push(`${h.key} ${i} ${v} ${l.leg} ${l.ratio.toFixed(2)}`);
    }
  }
  assert.equal(faults.length, 0, faults.slice(0, 12).join('; '));
});

test('4. ... the measure: his guard at the game\'s width (the owner: “You just need to fix the rangers wide leg stance, that’s all that’s weird”), its legs at their worst reading better than the game\'s crouch at its worst', () => {
  const B = RANGER_BODY;
  const legsAt = (m: Move3, t: number, v: WuSide): number => Math.min(...wuLegs(solve(m.build, bonesAt(m.motion.keys, m.rest, t)), v, B.ankle).map((l) => l.ratio));
  assert.ok(legsAt(MOVES3.rstand, 0.6, 'front') < 0.75, 'the game\'s crouch from in front');
  assert.ok(legsAt(MOVES3.rstand, 0.6, 'toward') < 0.6, 'the game\'s crouch from toward the camera');
  // (his feet as far apart as the game's, fore and aft and to the side, not as last night's wide guard)
  const feet = (q: Bones): [number, number] => {
    const s = solve(B, q);
    return [s.ankleL[0] - s.ankleR[0], Math.abs(s.ankleL[1] - s.ankleR[1])];
  };
  const [gx, gy] = feet(MOVES3.rstand.rest);
  const [nx, ny] = feet(RU_BATTLE);
  assert.ok(Math.abs(nx - gx) < 1 && Math.abs(ny - gy) < 1.5, `his feet ${nx.toFixed(1)} apart fore and aft, ${ny.toFixed(1)} to the side; the game's ${gx.toFixed(1)}, ${gy.toFixed(1)}`);
  const [tx] = feet(MOVES3.rtown.rest);
  const [ux] = feet(RU_TOWN);
  assert.ok(Math.abs(ux - tx) < 2, `in town ${ux.toFixed(1)} apart fore and aft; the game's ${tx.toFixed(1)}`);
  // (his crouch as deep as the game's)
  assert.equal(RU_BATTLE.pz, MOVES3.rstand.rest.pz, 'his crouch as deep as the game\'s');
  const worstGame = Math.min(...WU_SIDES.map((v) => legsAt(MOVES3.rstand, 0.6, v)));
  for (const v of WU_SIDES) assert.ok(legsAt(RU_STAND3, 0.6, v) >= Math.max(RU_LEG_GUARD_LEAST, worstGame + 0.2), `his guard from ${v}: ${legsAt(RU_STAND3, 0.6, v).toFixed(2)}`);
  // (his body, arms and bow as the game's: only his legs re-posed)
  for (const k of ['px', 'py', 'pz', 'yaw', 'pitch', 'roll', 'twist', 'bend', 'side', 'lhx', 'lhy', 'lhz', 'rhx', 'rhy', 'rhz', 'wEl', 'draw'] as const) assert.equal(RU_BATTLE[k], MOVES3.rstand.rest[k], `${k} as the game's`);
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

test('6. no prancing: in every frame of his runs, their other ways, his stops and setting off, no swinging thigh past 50 degrees (none past 48)', () => {
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
  assert.ok(most <= 48, `the most a swinging thigh comes up: ${most.toFixed(1)}`);
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

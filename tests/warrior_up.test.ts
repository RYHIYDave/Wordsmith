// THE WARRIOR BROUGHT UP TO THE BRAWLER'S LEVEL (src/art/warrior_up.ts, _moves.ts, _art.ts, _review.ts; the art chat's helper,
// 6 Nov 2026; docs/mockups/warrior_up/README.md). A MOCK-UP BEHIND A SWITCH THAT IS OFF, WARRIOR_UP. Held here:
//   1. the switch is off; of the game only art/heroes3.ts reaches the new files, and only through it; with it off, EVERY FRAME
//      THE GAME PAINTS OF HIM IS THE SAME (each list's first, middle and last frame against the hashes made before any of this,
//      tests/warrior_up.hashes.json; with WARRIOR_UP_ALL=1, every frame);
//   2. with it on, the game's knight's lists and more: those that move as the game's at its rates and lengths, the rest at 30;
//   3. EVERY FRAME OF EVERY MOVE THROUGH EVERY BOSS CHECK (art/boss_checks.ts checkBoss), from each of his eight sides (each truly
//      painted, 45 degrees apart), with the game's own handovers between them;
//   4. nothing of him through what he wears: no pixel of his mail seen from inside his tabard, its skirt, a pauldron or his scarf
//      (art/warrior_up_review.ts wuCoverFindings), every frame from all eight sides; and the check sees mail that is through;
//   5. his runs the game's own, frame for frame (the owner, 7 Nov 2026: “Just make him move like he used to.”);
//   6. crisp; the friend's cyan edge round him and his pool of cyan light behind him; nothing of the enemy's pink or gold;
//   7. his hits and lengths as stated (the main chat's numbers), and Movement 9 in each blow: a held wind-up, a strike of two
//      smeared frames;
//   8. his eight sides, each a facing of its own, truly painted (art/warrior_up_art.ts wuFacing), each facing the way it is
//      chosen for; his pig-faced helm's slit dark across his visor, its lip lit above it, from every side;
//   9. HIS LEGS READ TRUE ON THE SCREEN (the owner, 6 Nov 2026: “Can you make sure his leg ratio is correct cause it seems like
//      all these guys have long upper legs and short legs below the knee”): in every frame of his stances and of every pose he
//      holds, from each of his eight sides, each leg whose shin is seen reads at least 1.05 times as long below the knee as above
//      it (art/warrior_up_review.ts WU_LEGS_HELD, wuLegFaults); and the measure sees a short shin (his guard as it was). His runs,
//      the game's own, are measured and reported (11), not held.
//  10. HIS SWORD WHERE THE GAME HOLDS IT (the owner, 7 Nov 2026: “His sword is too high and when he runs it's up at his neck.”):
//      in his guard and his run his hands at or below his belt, the point below the hilt and behind him; in every town list his
//      sword on his back as the game has it; and how much of it his guard shows from each side, as reported;
//  11. his runs (the game's) measured as reported: the most a swinging thigh comes up, his legs where a foot bears him.
//   run: tsx --test tests/warrior_up.test.ts          WARRIOR_UP_ALL=1 tsx --test tests/warrior_up.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';
// @ts-ignore
import * as nodePath from 'node:path';

import { WARRIOR_UP, WU_MAIL, WU_PLUM, WU_RED, WU_RIM, WU_SCARF, WU_SIDES, WU_SPIN, WU_STEEL, spun, turnedStage } from '../src/art/warrior_up';
import { stage } from '../src/art/skin';
import type { WuSide } from '../src/art/warrior_up';
import { RED, SCARF_WINE } from '../src/art/hero_warrior';
import { WU_GAME_FPS, paintWu, wuFacing, wuPosed, wuSmeared } from '../src/art/warrior_up_art';
import type { WuActorArt } from '../src/art/warrior_up_art';
import { WU_KNEES_OUT, WU_REST, WU_REST_SEEN, WU_RUN_SEEN, WU_TOWN_REST, WU_TOWN_REST_SEEN } from '../src/art/warrior_up_moves';
import { WU_DRAW3, WU_FALL3, WU_LOOK3, WU_LURCH3, WU_MOVES, WU_REAR3, WU_REEL3, WU_RUN3, WU_SLAM3, WU_SLAM_HELD, WU_SLAM_HIT, WU_SLASH3, WU_STRIKE3, WU_STRIKE_HELD, WU_STRIKE_HIT, WU_STRIKE_POISE, WU_THRUST3, WU_TOWN3, WU_TOWN_RUN3, WU_WHIRL3, swingCarried } from '../src/art/warrior_up_moves';
import { WU_SWORD_LOW, WU_THIGH_MOST, wuStowedFaults, wuSwordLowFaults, wuThighMost, wuThighs, WU_LEGS_HELD, WU_LEGS_RUNS, WU_LEG_SEEN, WU_THROUGH, warriorReview, wuBladeSeen, wuCoverFindings, wuLegFaults, wuLegs, wuSword } from '../src/art/warrior_up_review';
import { checkBoss, findingsSaid } from '../src/art/boss_checks';
import { makeHeroArt3 } from '../src/art/heroes3';
import { lookOfPlace } from '../src/art/heroes';
import { GRIP_SPEED, KNIGHT_BODY, KNIGHT_RUN3, KNIGHT_TOWN3, KNIGHT_TOWN_RUN3, THRUST3, UNITS_PER_TILE } from '../src/art/moves3';
import type { Move3 } from '../src/art/moves3';
import { CANVAS3 } from '../src/art/skin';
import { INK, PINK, PLUM, RIM_ALPHA } from '../src/art/kit';
import { FLAME, ENEMY_RIM } from '../src/art/mkit';
import { bonesAt, project, solve, standing } from '../src/art/skeleton';
import { rgba } from '../src/engine/px';
import { TUNE } from '../src/game/defs';
import { hashSprite } from '../tools/cheap_heroes';
import { paintWithoutCanvas } from './helpers';
import { warriorLists } from '../tools/warrior_up_measure';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void; deepEqual(a: unknown, b: unknown, msg?: string): void };
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
const path = nodePath as { join(...p: string[]): string };
declare const process: { env: Record<string, string | undefined> };
paintWithoutCanvas();

const FR = 1 / 30;
const near = (a: number, b: number, e = 1e-6): boolean => Math.abs(a - b) < e;
const endOf = (m: Move3): number => m.motion.keys[m.motion.keys.length - 1].at;

/** Every moment of his: each move at 30 a second (his town stance and looking about him, shown at 10 and 20, are looked at at 30:
 * every frame the game shows and more). Like the game's knight he has no stops and no setting off. */
function moments(): { m: Move3; t: number }[] {
  const out: { m: Move3; t: number }[] = [];
  for (const m of Object.values(WU_MOVES)) {
    const fps = m.stride !== undefined ? 60 : 30;
    const loop = m.motion.loop !== undefined;
    const n = Math.round(endOf(m) * fps);
    for (let i = 0; i < (loop ? n : n + 1); i++) out.push({ m, t: i / fps });
  }
  return out;
}
const MOMENTS = moments();

/** What is wrong in any of his pictures, every moment from every side: painted once, each picture looked at by tests 4 and 6
 * together (and not kept: eight sides of every moment is too many pictures to hold). */
let swept: { cover: string[]; crisp: string[]; legs: string[]; legsSeen: number; low: string[]; lowFrames: number; stowed: string[]; stowedFrames: number; guardBlade: Record<string, number> } | null = null;
const KEY_OF = new Map<Move3, string>(Object.entries(WU_MOVES).map(([k, m]) => [m, k]));
function sweep(): { cover: string[]; crisp: string[]; legs: string[]; legsSeen: number; low: string[]; lowFrames: number; stowed: string[]; stowedFrames: number; guardBlade: Record<string, number> } {
  if (swept) return swept;
  const cover: string[] = [];
  const crisp: string[] = [];
  const legs: string[] = [];
  const low: string[] = [];
  const stowed: string[] = [];
  const guardBlade: Record<string, number> = {};
  let lowFrames = 0;
  let stowedFrames = 0;
  let legsSeen = 0;
  for (const { m, t } of MOMENTS) {
    const key = KEY_OF.get(m);
    const fps = m.stride !== undefined ? 60 : 30;
    const frame = Math.round(t * fps);
    const held = key !== undefined && (WU_LEGS_RUNS.includes(key) || WU_LEGS_HELD.some((h) => h.key === key && frame >= h.from && frame <= h.to));
    for (const v of WU_SIDES) {
      const f = paintWu(m, t, v);
      const at = `${m.name} ${(t * 30).toFixed(1)} ${v}`;
      const c = wuCoverFindings(f, f.ax, f.ay);
      if (c.length) cover.push(`${at}: ${c.join('; ')}`);
      crisp.push(...crispFaults(f, at, bonesAt(m.motion.keys, m.rest, t).out >= 0.25));
      if (held && key !== undefined) {
        legs.push(...wuLegFaults(key, frame, f, v));
        legsSeen += wuLegs(f.s, v, undefined, { z: f.drawn.z, w: f.px.w, h: f.px.h }).filter((l) => l.seen >= WU_LEG_SEEN).length;
      }
      // (his guard's sword: how much of its light is seen from each side, the least of every frame)
      if (key === 'rear') {
        const b = wuBladeSeen(f);
        guardBlade[v] = Math.min(guardBlade[v] ?? Infinity, b.point ? b.seen : 0);
      }
    }
    // (where his sword is: the same whichever side he is seen from)
    if (key !== undefined) {
      const { q, s } = wuPosed(m, t);
      if (WU_SWORD_LOW.includes(key)) {
        low.push(...wuSwordLowFaults(key, Math.round(t * 30), s, q));
        lowFrames++;
      }
      if (['ktown', 'ktownrun', 'klook', 'kdraw'].includes(key) && q.stow > 0.5) {
        stowed.push(...wuStowedFaults(key, Math.round(t * 30), s, q));
        stowedFrames++;
      }
    }
  }
  return (swept = { cover, crisp, legs, legsSeen, low, lowFrames, stowed, stowedFrames, guardBlade });
}

// --- 1. the switch, and the game's knight unchanged while it is off ------------------------------------------------------

test('1. the switch is off; of the game only art/heroes3.ts imports the new files, and only to go through the switch', () => {
  assert.equal(WARRIOR_UP.on, false, 'WARRIOR_UP is off');
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('art/warrior_up')) continue;
    const text = fs.readFileSync(path.join('src', f), 'utf8');
    if (/from ['"][^'"]*warrior_up(_moves|_art|_review)?['"]/.test(text)) users.push(f);
  }
  // (and the Ranger's mock-up, brought up after him on his pieces, behind its own switch; nothing of the game imports it)
  assert.equal(users.sort().join(' '), 'art/heroes3.ts art/ranger_up.ts art/ranger_up_art.ts art/ranger_up_moves.ts art/ranger_up_review.ts', 'what imports them');
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    // (art/heroes3.ts reaches the Ranger's mock-up only through its own switch, RANGER_UP: tests/ranger_up.test.ts holds that)
    if (!f.endsWith('.ts') || f.startsWith('art/ranger_up') || f === 'art/heroes3.ts') continue;
    assert.ok(!/from ['"][^'"]*ranger_up(_moves)?['"]/.test(fs.readFileSync(path.join('src', f), 'utf8')), `${f} imports the Ranger's mock-up`);
  }
  const h3 = fs.readFileSync('src/art/heroes3.ts', 'utf8');
  assert.ok(/if \(cls === 'warrior' && WARRIOR_UP\.on\)/.test(h3), 'heroes3 reaches them only through the switch');
  // (and nothing of the game imports the review, which brings in the bosses' checks)
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    // (but the Ranger's review, a review itself, which nothing of the game imports: tests/ranger_up.test.ts holds that)
    if (!f.endsWith('.ts') || f.startsWith('art/warrior_up') || f.startsWith('dev/') || f === 'art/ranger_up_review.ts') continue;
    assert.ok(!/warrior_up_review/.test(fs.readFileSync(path.join('src', f), 'utf8')), `${f} imports the review`);
  }
});

test('1. with the switch off, every frame the game paints of him is the very same picture (the hashes made before any of this)', () => {
  const pinned = JSON.parse(fs.readFileSync('tests/warrior_up.hashes.json', 'utf8')) as { lists: Record<string, string[]> };
  const was = WARRIOR_UP.on;
  WARRIOR_UP.on = false;
  try {
    const lists = warriorLists();
    assert.deepEqual(lists.map((l) => l.name).sort(), Object.keys(pinned.lists).sort(), 'the same lists');
    const all = !!process.env.WARRIOR_UP_ALL;
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
    assert.ok(n > 200, `${n} frames held to their hashes`);
  } finally {
    WARRIOR_UP.on = was;
  }
});

// --- 2. every list at 30 a second ---------------------------------------------------------------------------------------

test('2. with it on, the game holds him in the same lists as the game\'s knight and more: the lists that move as the game\'s at the game\'s own rates and lengths, the rest at 30 a second', () => {
  // (the game's knight, the switch off: his lists, their rates and their lengths)
  const game = makeHeroArt3();
  const gameSet = (place: 'dungeon' | 'town' | 'card') => (game.of('warrior', lookOfPlace(place)) as WuActorArt).front;
  const was: Record<string, ReturnType<typeof gameSet>> = { dungeon: gameSet('dungeon'), town: gameSet('town'), card: gameSet('card') };
  WARRIOR_UP.on = true;
  try {
    const art = makeHeroArt3();
    for (const place of ['dungeon', 'town', 'card'] as const) {
      const g = was[place];
      for (const v of WU_SIDES) {
        const set = (art.of('warrior', lookOfPlace(place)) as WuActorArt)[v];
        // HIS RUN, THE GAME'S: its rate, its length, played by the clock (no stride), and no stops and no setting off, as the game's
        assert.equal(set.walkFps, g.walkFps, `${place} ${v}: his run at the game's ${g.walkFps}`);
        assert.equal(set.walkFps, WU_GAME_FPS.run);
        assert.equal(set.walk.length, g.walk.length, `${place} ${v}: his run, ${g.walk.length} pictures as the game's`);
        assert.equal(set.walkStride, g.walkStride, `${place} ${v}: by the clock, as the game's`);
        assert.equal(set.stops, g.stops, `${place} ${v}: no stops, as the game's knight`);
        assert.equal(set.start, g.start, `${place} ${v}: no setting off, as the game's knight`);
        // HIS STANCE: in town and on his card the game's, at its rate and length; his rear stance, alive, at 30 (as approved)
        if (place === 'dungeon') {
          assert.equal(set.idleFps, 30, `${v}: his rear stance at 30`);
          assert.equal(set.idle.length, 60, `${v}: his rear stance, 2 s`);
        } else {
          assert.equal(set.idleFps, g.idleFps, `${place} ${v}: his town stance at the game's ${g.idleFps}`);
          assert.equal(set.idle.length, g.idle.length, `${place} ${v}: his town stance, ${g.idle.length} pictures as the game's`);
        }
        const c = set.clips!;
        for (const [k, clip] of Object.entries(c)) {
          if (!clip || !('fps' in (clip as object)) || k === 'idleA') continue;
          const fps = (clip as { fps: number }).fps;
          assert.ok(fps >= 30, `${place} ${v} ${k}: ${fps} a second`);
        }
        if (v === 'front' && place !== 'dungeon') {
          // (looking about him and drawing his sword, as the game's: their rates and lengths)
          assert.equal(c.idleA?.fps, g.clips?.idleA?.fps, `${place}: looking about him at the game's ${g.clips?.idleA?.fps}`);
          assert.equal(c.idleA?.frames.length, g.clips?.idleA?.frames.length);
          assert.equal(c.ready?.fps, g.clips?.ready?.fps, `${place}: his card's ready at the game's`);
          assert.equal(c.ready?.frames.length, g.clips?.ready?.frames.length);
        }
      }
    }
    // (a list the same in two places is one list, painted once)
    const d = art.of('warrior', lookOfPlace('dungeon')).front;
    const t = art.of('warrior', lookOfPlace('town')).front;
    const k = art.of('warrior', lookOfPlace('card')).front;
    assert.equal(d.clips?.attack?.frames, t.clips?.attack?.frames, 'one attack list');
    assert.equal(t.idle, k.idle, 'one town standing list');
    assert.equal(t.clips?.ready?.frames, k.clips?.ready?.frames, 'one ready list');
  } finally {
    WARRIOR_UP.on = false;
  }
});

// --- 3. every boss check -----------------------------------------------------------------------------------------------

test('3. every frame of every move through every boss check (art/boss_checks.ts), from each of his eight sides, and every handover the game makes', () => {
  // (his front side's review looks at him from in front and from behind, as the game has always shown him: his two sides of
  // old; each turned side's, from in front of him and behind him as he stands turned)
  for (const side of WU_SIDES) {
    const { mob, shape, moves } = warriorReview(side);
    // (all fourteen of his moves; from his other sides all but his class card's two, painted from in front only)
    assert.equal(moves.length, side === 'front' ? 14 : 12, `${side}: his moves`);
    const all = checkBoss(mob, shape, moves);
    // (his runs are the game's own, by the owner's word: the game plays them by the clock as it carries him on, and their feet
    // creep on the floor as the game's knight's do today; that, and only that, is reported (README), not held)
    const runs = all.filter((f) => (f.move === 'walk' || f.move === 'ktownrun') && f.kind === 'slide');
    const found = all.filter((f) => !runs.includes(f));
    assert.equal(found.length, 0, `${side}: ${findingsSaid(found).slice(0, 14).join('; ')}`);
    assert.ok(Math.max(0, ...runs.map((f) => f.by)) <= GAME_RUN_CREEP + 0.01, `${side}: the game's run creeps ${Math.max(0, ...runs.map((f) => f.by)).toFixed(2)}`);
  }
});
/** How far a foot on the floor creeps in the game's knight's run as the game shows it (game pixels, the most of any of his sides),
 * as the README reports it. */
const GAME_RUN_CREEP = 3.32;

// --- 4. nothing through what he wears ------------------------------------------------------------------------------------

test('4. nothing of him through what he wears: no pixel of his mail seen from inside his tabard, its skirt, a pauldron or his scarf, in any frame from any of his eight sides', () => {
  const faults = sweep().cover;
  assert.equal(faults.length, 0, faults.slice(0, 10).join(' | '));
});

test('4. ... and the check sees mail that is through (a tabard laid over his thigh: its mail is seen from inside it)', () => {
  const f = paintWu(WU_REAR3, 0, 'front');
  // (the very picture, asked again with a solid of the tabard put round his left thigh)
  const s = f.s;
  const mid: [number, number, number] = [(s.hipL[0] + s.kneeL[0]) / 2, (s.hipL[1] + s.kneeL[1]) / 2, (s.hipL[2] + s.kneeL[2]) / 2];
  const red = f.sc.mats.findIndex((x) => x.ramp !== WU_MAIL);
  f.sc.prims.push({ k: 'ell', mat: red, piece: 'trunk', blend: 0, tag: 'ribs', c: mid, axes: [[9, 0, 0], [0, 9, 0], [0, 0, 9]] });
  const said = wuCoverFindings(f, CANVAS3.ax, CANVAS3.ay);
  assert.ok(said.length > 0 && /his tabard/.test(said[0]), `it sees it: ${said.join('; ')} (through by more than ${WU_THROUGH})`);
});

// --- 5. feet grip in the run ---------------------------------------------------------------------------------------------

test('5. his runs are the game\'s own, frame for frame: the same keys, the same feet, hips, arms and sword, the same timing; only his knees turned out WU_KNEES_OUT', () => {
  for (const [now, game] of [[WU_RUN3, KNIGHT_RUN3], [WU_TOWN_RUN3, KNIGHT_TOWN_RUN3]] as const) {
    assert.equal(now.stride, undefined, `${now.name}: by the clock, as the game's`);
    assert.equal(now.rest, game.rest, `${now.name}: the game's rest`);
    assert.equal(now.motion.keys.length, game.motion.keys.length);
    assert.equal(now.motion.loop, game.motion.loop);
    now.motion.keys.forEach((k, i) => {
      const g = game.motion.keys[i];
      assert.equal(k.at, g.at, `${now.name} key ${i}: its time`);
      assert.equal(k.ease, g.ease);
      for (const f of Object.keys({ ...k.pose, ...g.pose }) as (keyof typeof k.pose)[]) {
        const want = f === 'lk' ? (g.pose.lk as number) + WU_KNEES_OUT : f === 'rk' ? (g.pose.rk as number) - WU_KNEES_OUT : g.pose[f];
        assert.deepEqual(k.pose[f], want, `${now.name} key ${i}: ${String(f)}`);
      }
    });
  }
});

// --- 6. crisp, cyan, never the enemy's ----------------------------------------------------------------------------------

function hue(r: number, g: number, b: number): [number, number] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return [0, 0];
  let h: number;
  if (max === r) h = ((g - b) / (max - min)) * 60;
  else if (max === g) h = (2 + (b - r) / (max - min)) * 60;
  else h = (4 + (r - g) / (max - min)) * 60;
  return [(h + 360) % 360, (max - min) / max];
}
const ENEMY = new Set([...FLAME, ENEMY_RIM, ...PINK].map((c) => rgba(c).slice(0, 3).join(',')));
/** HIS OWN COLOURS, as the game has had him since 6 Oct (his dark red scarf, his plum gloves and belt: hero_warrior.ts, kit.ts),
 * and the tones between each two of them that his sculpted painter adds (art/warrior_up.ts). A colour in the pink band that is
 * one of his own is his, not the enemy's: no glow, his look. */
const HIS = new Set([...WU_STEEL, ...WU_MAIL, ...WU_PLUM, ...WU_RED, ...WU_SCARF, ...PLUM, ...SCARF_WINE, ...RED].map((c) => rgba(c).slice(0, 3).join(',')));
function enemyPixel(r: number, g: number, b: number): boolean {
  const key = `${r},${g},${b}`;
  if (ENEMY.has(key)) return true;
  if (HIS.has(key)) return false;
  const [h, sat] = hue(r, g, b);
  return sat > 0.4 && Math.max(r, g, b) > 140 && (h >= 300 && h <= 352 || (h >= 30 && h <= 60 && Math.max(r, g, b) > 200));
}

function crispFaults(f: ReturnType<typeof paintWu>, at: string, out: boolean): string[] {
  const rim = rgba(WU_RIM);
  const faults: string[] = [];
  const { px, lights } = f;
  const d = px.d;
  let edge = 0;
  let body = 0;
  for (let i = 0; i < d.length; i += 4) {
    const a = d[i + 3];
    if (a === 0) continue;
    if (a === RIM_ALPHA) {
      if (d[i] === rim[0] && d[i + 1] === rim[1] && d[i + 2] === rim[2]) edge++;
      // (as the light goes out of him in his fall, his edge goes out with it: art/kit.ts lightsOut, as every hero's)
      else if (!out) faults.push(`${at}: an edge pixel not cyan`);
      else edge++;
      continue;
    }
    if (a !== 255) faults.push(`${at}: a pixel part seen through (${a})`);
    body++;
    if (enemyPixel(d[i], d[i + 1], d[i + 2])) faults.push(`${at}: the enemy's pink or gold (${d[i]},${d[i + 1]},${d[i + 2]})`);
  }
  if (body < 400 || edge < 60) faults.push(`${at}: ${body} painted, ${edge} of edge`);
  for (const L of lights) {
    const [h] = hue(...(rgba(L.color).slice(0, 3) as [number, number, number]));
    if (h < 160 || h > 205) faults.push(`${at}: a light not cyan (${L.color})`);
  }
  for (let x = 0; x < px.w; x++) for (const y of [0, px.h - 1]) if (d[(y * px.w + x) * 4 + 3] > 0) faults.push(`${at}: cut off at the top or bottom`);
  for (let y = 0; y < px.h; y++) for (const x of [0, px.w - 1]) if (d[(y * px.w + x) * 4 + 3] > 0) faults.push(`${at}: cut off at a side`);
  return faults;
}

test('6. every frame, from all eight sides: crisp; the friend\'s cyan edge round him; nothing of the enemy\'s pink or gold; his lights cyan; nothing cut off', () => {
  const faults = sweep().crisp;
  assert.equal(faults.length, 0, [...new Set(faults)].slice(0, 12).join('; '));
});

test('6. the friend\'s cyan pool of light behind him, as behind every hero, in every list the game holds while he lives (none once the light is out)', () => {
  WARRIOR_UP.on = true;
  try {
    const set = makeHeroArt3().of('warrior', lookOfPlace('dungeon')).front;
    for (const s of [set.idle[0], set.walk[3], set.clips!.attack!.frames[10], set.clips!.whirl!.frames[2], set.clips!.leap!.frames[5]]) {
      assert.equal(s.aura?.color, '#28dcf0', 'the friend\'s cyan');
      assert.ok(near(s.aura?.a ?? 0, 0.2), 'as strong as every hero\'s');
      assert.ok(!(s.lights ?? []).some((l) => !/^#(22d0e0|8af6f0|28dcf0)$/.test(l.color)), 'his lights the blade\'s cyan');
    }
    const fall = set.clips!.fall!.frames;
    assert.equal(fall[fall.length - 1].aura, undefined, 'out, at the end of his fall');
  } finally {
    WARRIOR_UP.on = false;
  }
});

// --- 7. his numbers, and Movement 9 ------------------------------------------------------------------------------------

test('7. his hits and lengths as stated for the main chat', () => {
  // Strike: both swings land at 10 frames (0.333 s; the rules have strike.windup 0.12, to become this with the switch on)
  assert.ok(near(WU_STRIKE_HIT, 10 / 30) && near(WU_STRIKE3.motion.hit ?? -1, 10 / 30) && near(WU_SLASH3.motion.hit ?? -1, 10 / 30));
  assert.ok(near(TUNE.swingStep, 0.33) && near(TUNE.swingStepTime, 0.12), 'the game\'s step on each swing, as it is (each swing skips on it)');
  assert.ok(near(WU_STRIKE3.poise ?? -1, WU_STRIKE_POISE) && near(WU_STRIKE_POISE, 21 / 30), 'the first swing waits, sword up, at 21 frames');
  assert.ok(WU_STRIKE3.tail === true && WU_SLASH3.tail === true && WU_SLASH3.poise === undefined);
  assert.ok(near(endOf(WU_STRIKE3), 36 / 30) && near(endOf(WU_SLASH3), 27 / 30), 'the first swing 36 frames, the second 27');
  // Slam: lands at 15 frames (0.5 s), 34 in all
  assert.ok(near(WU_SLAM3.motion.hit ?? -1, WU_SLAM_HIT) && near(WU_SLAM_HIT, 0.5) && near(endOf(WU_SLAM3), 34 / 30));
  // kept as they were: the Lunge (its dive the game carries him through, 0.5 s, the point out as he lands), struck (7) and his
  // fall (46); the Whirlwind once round in 12 frames (it was 8: from his turned sides, 8 threw his limbs round in leaps)
  assert.ok(near(WU_THRUST3.motion.hit ?? -1, THRUST3.motion.hit ?? -2) && near(WU_THRUST3.arc!.until, THRUST3.arc!.until) && WU_THRUST3.arc!.high === THRUST3.arc!.high);
  assert.ok(near(endOf(WU_THRUST3), endOf(THRUST3)), 'the Lunge as long');
  assert.ok(near(endOf(WU_WHIRL3), 12 / 30) && WU_WHIRL3.motion.loop === 0);
  assert.ok(near(endOf(WU_REEL3), 7 / 30) && near(endOf(WU_LURCH3), 7 / 30) && near(endOf(WU_FALL3), 46 / 30));
  // his card's ready at the same moment, and his standing loops
  assert.ok(near(WU_DRAW3.ready ?? -1, 31 / 30) && endOf(WU_DRAW3) >= 40 / 30 - 1e-6, 'ready at 31, his guard held after it');
  assert.ok(near(endOf(WU_REAR3), 2) && near(endOf(WU_TOWN3), endOf(KNIGHT_TOWN3)) && near(endOf(WU_LOOK3), 3.6));
  // the game's step, as each swing has it: a third of a tile by 0.12 s
  assert.ok(near(swingCarried(1), 0.33 * UNITS_PER_TILE));
});

test('7. every blow by Movement 9: a big wind-up HELD, the strike in two frames, smeared, and only then; a big wind-down', () => {
  for (const [m, held, hit] of [[WU_STRIKE3, WU_STRIKE_HELD, WU_STRIKE_HIT], [WU_SLASH3, WU_STRIKE_HELD, WU_STRIKE_HIT], [WU_SLAM3, WU_SLAM_HELD, WU_SLAM_HIT]] as const) {
    const tip = (f: number): [number, number, number] => {
      const q = bonesAt(m.motion.keys, m.rest, f / 30);
      const p = wuSword(solve(m.build, q), q).tip;
      return [p[0], p[1], p[2]];
    };
    const step = (f: number): number => Math.hypot(...(tip(f + 1).map((x, i) => x - tip(f)[i]) as [number, number, number]));
    // held: the wind-up's last frames barely move
    for (let f = held[0]; f < held[1]; f++) assert.ok(step(f) < 2.5, `${m.name}: held at ${f} (${step(f).toFixed(1)})`);
    // the strike: two frames from the held wind-up to the blow
    assert.equal(Math.round(hit * 30) - held[1], 2, `${m.name}: a strike of two frames`);
    for (let f = held[1]; f < Math.round(hit * 30); f++) assert.ok(step(f) > 12, `${m.name}: the strike, ${step(f).toFixed(1)} a frame`);
    // smeared in the strike and just after it, clean elsewhere
    for (let f = 0; f <= Math.round(endOf(m) * 30); f++) {
      const want = f > held[1] && f <= Math.round(hit * 30) + 1;
      assert.equal(wuSmeared(m, f / 30), want, `${m.name}: frame ${f} ${want ? '' : 'not '}smeared`);
    }
    // a big wind-up: the point drawn far from where it rests (more than a third of a blade)
    const rest = tip(0);
    const far = Math.hypot(...(tip(held[1]).map((x, i) => x - rest[i]) as [number, number, number]));
    assert.ok(far > 12, `${m.name}: wound up ${far.toFixed(1)} from where it began`);
  }
});

// --- 8. his eight sides, and his helm ----------------------------------------------------------------------------------

test('8. eight facings, each truly painted: each facing the game may give him is a side of its own, drawn facing that very way on the screen, his sword in his right hand', () => {
  // (the game's floor on the screen, as render.ts has it: a step along fx goes right and down, along fy left and down)
  const screen = (fx: number, fy: number): [number, number] => [fx - fy, (fx + fy) * 0.5];
  const want: WuSide[] = ['front', 'toward', 'frontL', 'sideL', 'backL', 'away', 'back', 'side'];
  assert.equal(new Set(want).size, 8, 'eight sides, none of them another mirrored');
  for (let k = 0; k < 8; k++) {
    const a = (k * 45 * Math.PI) / 180;
    const [fx, fy] = [Math.cos(a), Math.sin(a)];
    const side = wuFacing(fx, fy);
    assert.equal(side, want[k], `facing ${k * 45}: ${side}`);
    // (a little off the middle of each eighth, the same)
    for (const d of [-20, 20]) assert.equal(wuFacing(Math.cos(a + (d * Math.PI) / 180), Math.sin(a + (d * Math.PI) / 180)), side, `facing ${k * 45 + d}`);
    // which way he faces as that side is drawn: his forward, turned as the side turns him, seen by the game's camera from in
    // front (never its mirror from behind), so that what is in his right hand is in his right hand
    const { spin, camera } = WU_SPIN[side];
    assert.equal(camera, 'front', `${side}: the camera from in front, no mirror`);
    const p = project(spun([1, 0, 0], spin), camera);
    const o = project([0, 0, 0], camera);
    const drawn: [number, number] = [p[0] - o[0], p[1] - o[1]];
    const [sx, sy] = screen(fx, fy);
    const cos = (drawn[0] * sx + drawn[1] * sy) / (Math.hypot(...drawn) * Math.hypot(sx, sy));
    assert.ok(cos > 0.999, `facing ${k * 45}: ${side} drawn facing the way the game has him go (${cos.toFixed(3)})`);
  }
});

test('8. his pig-faced helm: the slit dark across the top of his snout with its lip lit above it, from every side that shows his face', () => {
  const key = (c: string): string => rgba(c).slice(0, 3).join(',');
  const ink = key(INK);
  const lit = new Set([key(WU_STEEL[4]), key(WU_STEEL[3])]);
  let shown = 0;
  for (const [m, t] of [[WU_REAR3, 0], [WU_REAR3, 1], [WU_RUN3, 0.2], [WU_STRIKE3, 0.3]] as const) {
    for (const side of WU_SIDES) {
      const f = paintWu(m, t, side);
      // (his face toward the camera: the way it looks, turned as the side turns him, at least half way to the eye)
      const st = turnedStage(stage(WU_SPIN[side].camera, f.ax), WU_SPIN[side].spin);
      const ff = f.s.face[0];
      const toward = st.near([f.s.head[0] + ff[0], f.s.head[1] + ff[1], f.s.head[2] + ff[2]]) - st.near(f.s.head);
      if (toward < 0.5) continue;
      shown++;
      const { px } = f;
      const d = px.d;
      const at = (x: number, y: number): string => {
        const i = (y * px.w + x) * 4;
        return d[i + 3] === 255 ? `${d[i]},${d[i + 1]},${d[i + 2]}` : '';
      };
      // (round his head as the picture has it: a dark pixel of the slit with the lit lip straight above it)
      const [hx, hy] = st.at(f.s.head);
      let n = 0;
      for (let y = Math.max(1, Math.round(hy) - 16); y < Math.min(px.h, Math.round(hy) + 12); y++) {
        for (let x = Math.max(0, Math.round(hx) - 18); x < Math.min(px.w, Math.round(hx) + 18); x++) if (at(x, y) === ink && lit.has(at(x, y - 1))) n++;
      }
      assert.ok(n >= 10, `${m.name} ${t} ${side}: the slit under its lit lip, ${n} pixels`);
    }
  }
  assert.ok(shown >= 10, `his face seen ${shown} times`);
});

// --- 9. his legs read true on the screen ------------------------------------------------------------------------------------

test('9. his legs read true: every stance and held pose from every side at 1.05 or more below the knee to above it (his runs, the game\'s own, measured in 11)', () => {
  const { legs, legsSeen } = sweep();
  assert.ok(legsSeen > 2000, `${legsSeen} legs measured where they are seen`);
  assert.equal(legs.length, 0, legs.slice(0, 12).join(' | '));
});

test('9. ... the measure: standing straight his bones read a man\'s legs; his guard and town stance as he saw them read short, and as they are now, true', () => {
  for (const side of WU_SIDES) {
    for (const l of wuLegs(solve(KNIGHT_BODY, standing(KNIGHT_BODY)), side)) assert.ok(l.ratio > 1.1 && l.ratio < 1.25, `standing straight, ${side} ${l.leg}: ${l.ratio.toFixed(2)}`);
  }
  // (his guard as he approved it: from in front and toward the camera, a shin seen end-on)
  const least = (rest: typeof WU_REST, side: WuSide): number => Math.min(...wuLegs(solve(KNIGHT_BODY, rest), side).map((l) => l.ratio));
  assert.ok(least(WU_REST_SEEN, 'front') < 0.8 && least(WU_REST_SEEN, 'toward') < 0.75, 'his guard as he saw it: a shin that reads short');
  assert.ok(least(WU_TOWN_REST_SEEN, 'toward') < 1.0, 'his town stance as he saw it: short');
  for (const side of WU_SIDES) assert.ok(least(WU_REST, side) >= 1.05 && least(WU_TOWN_REST, side) >= 1.05, `now, ${side}`);
  // his look, his upper body and his sword as the game has them: only his feet and knees are posed anew
  for (const [now, then] of [[WU_REST, WU_REST_SEEN], [WU_TOWN_REST, WU_TOWN_REST_SEEN]] as const) {
    for (const k of ['px', 'py', 'pz', 'yaw', 'pitch', 'roll', 'twist', 'bend', 'side', 'lhIn', 'lhx', 'lhy', 'lhz', 'rhIn', 'rhx', 'rhy', 'rhz', 'le', 're', 'wAz', 'wEl', 'wRoll', 'stow'] as const) assert.equal(now[k], then[k], `${k} as it was`);
  }
});

// --- 10. his sword where the game holds it ---------------------------------------------------------------------------------

test('10. his sword where the game holds it: in his guard and his run, his hands at or below his belt, the point below the hilt and behind him; in town, on his back as the game has it', () => {
  const { low, lowFrames, stowed, stowedFrames } = sweep();
  assert.equal(low.length, 0, `his sword up:\n${low.slice(0, 30).join('\n')}`);
  assert.ok(lowFrames >= 60 + 15, `${lowFrames} moments of his guard and his run looked at`);
  assert.equal(stowed.length, 0, `his sword on his back:\n${stowed.slice(0, 30).join('\n')}`);
  assert.ok(stowedFrames >= 36 + 15 + 109, `${stowedFrames} moments of town looked at`);
  // (his guard and his run hold it as the game's do: the same hands and the same way of the blade)
  for (const k of ['rhIn', 'rhx', 'rhy', 'rhz', 'wAz', 'wEl', 'wRoll'] as const) assert.equal(WU_REST[k], WU_REST_SEEN[k], `his guard's ${k}`);
});

test('10. ... the check sees a sword held up (the guard of 90de9707: the blade level at his chest); his town stance\'s is on his back as the game has it', () => {
  const up = { ...WU_REST, rhIn: 2 as const, rhx: -2.5, rhy: -17.5, rhz: 34.5, wAz: -142, wEl: 0 };
  const s = solve(KNIGHT_BODY, up);
  assert.ok(wuSwordLowFaults('rear', 0, s, up).length > 0, 'held up');
  // (the town stance with the sword's point turned up: its point not down)
  const q = { ...WU_TOWN_REST };
  const t = solve(KNIGHT_BODY, q);
  assert.equal(wuStowedFaults('ktown', 0, t, q).length, 0, 'as the game has it');
});

test('10. ... how much of his sword is seen in his guard, from each side (reported: held low and trailing behind him, from some sides he hides it)', () => {
  const { guardBlade } = sweep();
  for (const v of WU_SIDES) assert.ok(guardBlade[v] !== undefined, v);
  assert.deepEqual(guardBlade, GUARD_BLADE_SEEN, 'as the README reports it');
});
/** The least of his guard's blade seen in any frame, from each side, in game pixels of its light (0: none, or its point hidden), as
 * the README reports it. */
const GUARD_BLADE_SEEN: Record<string, number> = { front: 18, toward: 4, frontL: 0, sideL: 18, backL: 20, away: 26, back: 24, side: 16 };

// --- 11. his run, the game's: measured -----------------------------------------------------------------------------------------

test('11. his runs, the game\'s, measured as reported: the most a swinging thigh comes up, and his legs where a foot bears him', () => {
  // (the measure of a knee come up sees the run that high-stepped)
  assert.ok(wuThighMost(WU_RUN_SEEN, 60) > 90, `the run that high-stepped: ${wuThighMost(WU_RUN_SEEN, 60).toFixed(1)}`);
  assert.equal(WU_THIGH_MOST, 50);
  // (his runs as the game's: as the README reports them)
  assert.ok(Math.abs(wuThighMost(WU_RUN3, 30) - RUN_THIGH[0]) < 0.05, `his run: ${wuThighMost(WU_RUN3, 30).toFixed(1)}`);
  assert.ok(Math.abs(wuThighMost(WU_TOWN_RUN3, 30) - RUN_THIGH[1]) < 0.05, `his run in town: ${wuThighMost(WU_TOWN_RUN3, 30).toFixed(1)}`);
  // (his legs where a foot bears him, flat on the floor, from each side where its shin is seen: the least of every frame)
  for (const [m, want] of [[WU_RUN3, RUN_LEGS.run], [WU_TOWN_RUN3, RUN_LEGS.town]] as const) {
    const least: Record<string, number> = {};
    for (let i = 0; i < 15; i++) for (const v of WU_SIDES) {
      const f = paintWu(m, i / 30, v);
      for (const l of wuLegs(f.s, v, undefined, { z: f.drawn.z, w: f.px.w, h: f.px.h })) {
        const toe = l.leg === 'L' ? f.s.toeL : f.s.toeR;
        const heel = l.leg === 'L' ? f.s.heelL : f.s.heelR;
        if (l.seen < WU_LEG_SEEN || Math.max(toe[2], heel[2]) > 0.6) continue;
        least[v] = Math.min(least[v] ?? Infinity, Math.round(l.ratio * 100) / 100);
      }
    }
    assert.deepEqual(least, want, `${m.name}: as the README reports it`);
  }
});
/** His legs where a foot bears him in his runs (the game's), the least from each side, as the README reports them. */
const RUN_LEGS: { run: Record<string, number>; town: Record<string, number> } = {
  run: { front: 0.8, toward: 0.63, frontL: 0.81, sideL: 1.11, backL: 1.62, away: 1.97, back: 1.46, side: 1.11 },
  town: { front: 0.79, toward: 0.61, frontL: 0.82, sideL: 1.1, backL: 1.59, away: 2, back: 1.49, side: 1.11 },
};
/** The most a swinging thigh comes up in his run and his run in town (the game's), degrees, as the README reports it. */
const RUN_THIGH = [58.4, 54.8] as const;

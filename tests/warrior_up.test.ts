// THE WARRIOR BROUGHT UP TO THE BRAWLER'S LEVEL (src/art/warrior_up.ts, _moves.ts, _art.ts, _review.ts; the art chat's helper,
// 6 Nov 2026; docs/mockups/warrior_up/README.md). A MOCK-UP BEHIND A SWITCH THAT IS OFF, WARRIOR_UP. Held here:
//   1. the switch is off; of the game only art/heroes3.ts reaches the new files, and only through it; with it off, EVERY FRAME
//      THE GAME PAINTS OF HIM IS THE SAME (each list's first, middle and last frame against the hashes made before any of this,
//      tests/warrior_up.hashes.json; with WARRIOR_UP_ALL=1, every frame);
//   2. with it on, every list at 30 pictures a second (his run, which grips the floor, at 60);
//   3. EVERY FRAME OF EVERY MOVE THROUGH EVERY BOSS CHECK (art/boss_checks.ts checkBoss), from each of his eight sides (each truly
//      painted, 45 degrees apart), with the game's own handovers between them;
//   4. nothing of him through what he wears: no pixel of his mail seen from inside his tabard, its skirt, a pauldron or his scarf
//      (art/warrior_up_review.ts wuCoverFindings), every frame from all eight sides; and the check sees mail that is through;
//   5. his feet grip in the run: each foot on the floor goes back under him as fast as the game carries him;
//   6. crisp; the friend's cyan edge round him and his pool of cyan light behind him; nothing of the enemy's pink or gold;
//   7. his hits and lengths as stated (the main chat's numbers), and Movement 9 in each blow: a held wind-up, a strike of two
//      smeared frames;
//   8. his eight sides, each a facing of its own, truly painted (art/warrior_up_art.ts wuFacing), each facing the way it is
//      chosen for; his pig-faced helm's slit dark across his visor, its lip lit above it, from every side;
//   9. HIS LEGS READ TRUE ON THE SCREEN (the owner, 6 Nov 2026: “Can you make sure his leg ratio is correct cause it seems like
//      all these guys have long upper legs and short legs below the knee”): in every frame of his stances and of every pose he
//      holds, from each of his eight sides, each leg whose shin is seen reads at least 1.05 times as long below the knee as above
//      it; in his runs, at least 1 wherever a foot is flat on the floor bearing him (art/warrior_up_review.ts WU_LEGS_HELD,
//      wuLegFaults); and the measure sees a short shin (his guard as it was).
//  10. HIS SWORD SEEN FROM EVERY SIDE (the coordinator, 6 Nov 2026: from down and to the left it vanished behind him; "a hero must
//      read armed in every facing"): in every frame of every list he holds or runs in, from each of his eight sides (his card's
//      from in front), at least WU_BLADE_LEAST game pixels of the blade's light, its point among them (art/warrior_up_review.ts
//      WU_BLADE_HELD, wuBladeSeen); and the measure sees a hidden sword (his guard as it was, from down and to the left).
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
import { paintWu, wuFacing, wuSmeared } from '../src/art/warrior_up_art';
import type { WuActorArt } from '../src/art/warrior_up_art';
import { WU_REST, WU_REST_SEEN, WU_TOWN_REST, WU_TOWN_REST_SEEN } from '../src/art/warrior_up_moves';
import { WU_DRAW3, WU_FALL3, WU_LOOK3, WU_LURCH3, WU_MOVES, WU_REAR3, WU_REEL3, WU_RUN3, WU_SLAM3, WU_SLAM_HELD, WU_SLAM_HIT, WU_SLASH3, WU_STRIKE3, WU_STRIKE_HELD, WU_STRIKE_HIT, WU_STRIKE_POISE, WU_THRUST3, WU_TOWN3, WU_TOWN_RUN3, WU_WHIRL3, swingCarried } from '../src/art/warrior_up_moves';
import { WU_BLADE_HELD, WU_BLADE_LEAST, WU_LEGS_HELD, WU_LEGS_RUNS, WU_LEG_SEEN, WU_THROUGH, warriorReview, wuBladeFaults, wuBladeHeld, wuBladeSeen, wuCoverFindings, wuLegFaults, wuLegs, wuSword } from '../src/art/warrior_up_review';
import { checkBoss, findingsSaid } from '../src/art/boss_checks';
import { makeHeroArt3 } from '../src/art/heroes3';
import { lookOfPlace } from '../src/art/heroes';
import { GRIP_SPEED, KNIGHT_BODY, SETTLES, THRUST3, UNITS_PER_TILE, settle, startOf } from '../src/art/moves3';
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

/** Every moment of his that the game shows: each move at 30 a second, a run at 60; his settles and his setting off, both places. */
function moments(): { m: Move3; t: number }[] {
  const out: { m: Move3; t: number }[] = [];
  for (const m of Object.values(WU_MOVES)) {
    const fps = m.stride !== undefined ? 60 : 30;
    const loop = m.motion.loop !== undefined;
    const n = Math.round(endOf(m) * fps);
    for (let i = 0; i < (loop ? n : n + 1); i++) out.push({ m, t: i / fps });
  }
  for (const [stand, runM] of [[WU_REAR3, WU_RUN3], [WU_TOWN3, WU_TOWN_RUN3]] as const) {
    for (let k = 0; k < SETTLES; k++) {
      const m: Move3 = { ...stand, name: `${stand.name}: coming to a stand ${k}`, motion: settle(runM, k / SETTLES, stand.rest) };
      for (let i = 0; i <= Math.round(endOf(m) * 30); i++) out.push({ m, t: i / 30 });
    }
    const st = startOf(runM, stand.rest);
    const m: Move3 = { ...runM, name: `${runM.name}: setting off`, motion: st.motion, stride: undefined };
    for (let i = 0; i <= Math.round(endOf(m) * 60); i++) out.push({ m, t: i / 60 });
  }
  return out;
}
const MOMENTS = moments();

/** What is wrong in any of his pictures, every moment from every side: painted once, each picture looked at by tests 4 and 6
 * together (and not kept: eight sides of every moment is too many pictures to hold). */
let swept: { cover: string[]; crisp: string[]; legs: string[]; legsSeen: number; blade: string[]; bladeLeast: Record<string, number> } | null = null;
const KEY_OF = new Map<Move3, string>(Object.entries(WU_MOVES).map(([k, m]) => [m, k]));
function sweep(): { cover: string[]; crisp: string[]; legs: string[]; legsSeen: number; blade: string[]; bladeLeast: Record<string, number> } {
  if (swept) return swept;
  const cover: string[] = [];
  const crisp: string[] = [];
  const legs: string[] = [];
  const blade: string[] = [];
  const bladeLeast: Record<string, number> = {};
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
      if (wuBladeHeld(key, m.name, frame, v)) {
        blade.push(...wuBladeFaults(key, m.name, frame, f, v));
        const b = wuBladeSeen(f);
        bladeLeast[v] = Math.min(bladeLeast[v] ?? Infinity, b.point ? b.seen : 0);
      }
    }
  }
  return (swept = { cover, crisp, legs, legsSeen, blade, bladeLeast });
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
  assert.equal(users.sort().join(' '), 'art/heroes3.ts art/ranger_up.ts', 'what imports them');
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('art/ranger_up')) continue;
    assert.ok(!/from ['"][^'"]*ranger_up(_moves)?['"]/.test(fs.readFileSync(path.join('src', f), 'utf8')), `${f} imports the Ranger's mock-up`);
  }
  const h3 = fs.readFileSync('src/art/heroes3.ts', 'utf8');
  assert.ok(/if \(cls === 'warrior' && WARRIOR_UP\.on\)/.test(h3), 'heroes3 reaches them only through the switch');
  // (and nothing of the game imports the review, which brings in the bosses' checks)
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('art/warrior_up') || f.startsWith('dev/')) continue;
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

test('2. with it on, the game holds him in every list at 30 pictures a second (his gripping run at 60), the same lists as before and more', () => {
  WARRIOR_UP.on = true;
  try {
    const art = makeHeroArt3();
    for (const place of ['dungeon', 'town', 'card'] as const) {
      for (const v of WU_SIDES) {
        const set = (art.of('warrior', lookOfPlace(place)) as WuActorArt)[v];
        assert.equal(set.idleFps, 30, `${place} ${v}: standing at 30`);
        assert.equal(set.idle.length, place === 'dungeon' ? 60 : 72, `${place} ${v}: standing, ${place === 'dungeon' ? 2 : 2.4} s`);
        assert.equal(set.walkFps, 60, `${place} ${v}: his run at 60`);
        assert.ok(near(set.walkStride ?? 0, GRIP_SPEED * (27 / 60)), `${place} ${v}: his run grips, its stride`);
        assert.equal(set.walk.length, 27);
        const c = set.clips!;
        for (const [k, clip] of Object.entries(c)) {
          if (!clip || !('fps' in (clip as object))) continue;
          const fps = (clip as { fps: number }).fps;
          assert.ok(fps >= 30, `${place} ${v} ${k}: ${fps} a second`);
        }
        for (const s of set.stops ?? []) assert.equal(s.fps, 30, `${place} ${v}: its stops`);
        assert.equal(set.stops?.length, SETTLES, `${place} ${v}: coming to a stand`);
        assert.equal(set.start?.fps, 60, `${place} ${v}: setting off`);
        if (v === 'front' && place !== 'dungeon') {
          assert.equal(c.idleA?.fps, 30, `${place}: looking about him at 30`);
          assert.equal(c.idleA?.frames.length, 109);
          assert.equal(c.ready?.fps, 30, `${place}: his card's ready at 30`);
          assert.equal(c.ready?.frames.length, 41);
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
    const found = checkBoss(mob, shape, moves);
    assert.equal(found.length, 0, `${side}: ${findingsSaid(found).slice(0, 14).join('; ')}`);
  }
});

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

test('5. his feet grip in the run: each foot on the floor goes back under him exactly as fast as the game carries him (4.6 tiles a second)', () => {
  for (const runM of [WU_RUN3, WU_TOWN_RUN3]) {
    const period = (runM.stride as number) / GRIP_SPEED;
    assert.ok(near(period, 27 / 60), `${runM.name}: a turn in 27 sixtieths`);
    for (const side of ['L', 'R'] as const) {
      let down: { x: number; y: number } | null = null;
      let worst = 0;
      for (let i = 0; i <= 120; i++) {
        const t = (i / 120) * period;
        const q = bonesAt(runM.motion.keys, runM.rest, t);
        const s = solve(runM.build, q);
        const toe = side === 'L' ? s.toeL : s.toeR;
        if (toe[2] > 0.6) {
          down = null;
          continue;
        }
        // (where it is on the floor itself: the game has carried him on by then)
        const x = toe[0] + GRIP_SPEED * UNITS_PER_TILE * t;
        if (!down) down = { x, y: toe[1] };
        else worst = Math.max(worst, Math.hypot(x - down.x, toe[1] - down.y));
      }
      // (under a game pixel, as the bosses' review has it: SLIDE_MAX; a picture pixel is 0.41 of his lengths along the floor)
      assert.ok(worst < 2.2, `${runM.name} ${side}: a foot on the floor slides ${worst.toFixed(2)} of his lengths`);
    }
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
  assert.ok(near(endOf(WU_REAR3), 2) && near(endOf(WU_TOWN3), 2.4) && near(endOf(WU_LOOK3), 3.6));
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

test('9. his legs read true: every stance and held pose from every side at 1.05 or more below the knee to above it, his runs at 1 where a foot bears him', () => {
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
  // his look and his upper body as they were: only his feet and knees are posed anew (and, since, in his guard, how his sword
  // and his sword arm sit: test 10)
  for (const [now, then] of [[WU_REST, WU_REST_SEEN], [WU_TOWN_REST, WU_TOWN_REST_SEEN]] as const) {
    for (const k of ['px', 'py', 'pz', 'yaw', 'pitch', 'roll', 'twist', 'bend', 'side', 'lhx', 'lhy', 'lhz'] as const) assert.equal(now[k], then[k], `${k} as it was`);
  }
  for (const k of ['rhx', 'rhy', 'rhz', 'wAz', 'wEl'] as const) assert.equal(WU_TOWN_REST[k], WU_TOWN_REST_SEEN[k], `in town, ${k} as it was`);
});

// --- 10. his sword seen from every side ---------------------------------------------------------------------------------------

test('10. his sword is seen from every side: in every list he holds or runs in, from all eight sides, a good length of its light, its point among it', () => {
  const { blade, bladeLeast } = sweep();
  assert.equal(blade.length, 0, `his sword hidden:\n${blade.slice(0, 40).join('\n')}${blade.length > 40 ? `\n... and ${blade.length - 40} more` : ''}`);
  // (every side was looked at, and every list: none of them is left out by a name that no longer matches)
  for (const v of WU_SIDES) assert.ok(bladeLeast[v] >= WU_BLADE_LEAST, `${v}: ${bladeLeast[v]}`);
  for (const h of WU_BLADE_HELD) assert.ok(WU_MOVES[h.key], h.key);
  assert.ok(MOMENTS.some(({ m }) => wuBladeHeld(undefined, m.name, 0, 'front')), 'his settles and his setting off');
});

test('10. ... the measure: his guard as the owner saw it hid his sword from down and to the left; his guard now does not', () => {
  const old = { ...WU_REST, rhIn: WU_REST_SEEN.rhIn, rhx: WU_REST_SEEN.rhx, rhy: WU_REST_SEEN.rhy, rhz: WU_REST_SEEN.rhz, wAz: WU_REST_SEEN.wAz, wEl: WU_REST_SEEN.wEl };
  const seen = (q: typeof WU_REST, v: WuSide): { seen: number; point: boolean } => wuBladeSeen(paintWu({ ...WU_REAR3, rest: q, motion: { keys: [{ at: 0, pose: {} }] } }, 0, v));
  const was = seen(old, 'frontL');
  assert.ok(was.seen < WU_BLADE_LEAST, `as it was, from down and to the left: ${was.seen}`);
  assert.equal(wuBladeFaults('rear', WU_REAR3.name, 0, paintWu({ ...WU_REAR3, rest: old, motion: { keys: [{ at: 0, pose: {} }] } }, 0, 'frontL'), 'frontL').length, 1);
  for (const v of WU_SIDES) {
    const now = seen(WU_REST, v);
    assert.ok(now.seen >= WU_BLADE_LEAST && now.point, `${v}: ${now.seen}`);
  }
});

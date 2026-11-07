// THE WARLOCK BROUGHT UP, STAGE 1 (src/art/warlock_up.ts, _moves.ts; the art chat's helper, 7 Nov 2026;
// docs/mockups/warlock_up/README.md). A MOCK-UP BEHIND A SWITCH THAT IS OFF, WARLOCK_UP: his look as it is, painted from all eight
// sides, his legs true in his stance, his run's knees down; shown in one still. Held here:
//   1. the switch is off; nothing of the game imports the new files; with it off, EVERY FRAME THE GAME PAINTS OF HIM IS THE SAME
//      (each list's first, middle and last frame against the hashes made from the game's Warlock as he is, 56ee5c43:
//      tests/warlock_up.hashes.json; WARLOCK_UP_ALL=1 for every frame);
//   2. HIS LEGS TRUE in his stance: every frame of his stand (his breathing, the spasm, the pain folding him over, his glare), from
//      all eight sides, at 1.05 or more below the knee to above it (on his bones; and as painted, each leg whose shin is seen);
//      the game's read short; only his feet placed again, every key of his stand moved by as much;
//   3. NO PRANCING in his run: no thigh of a foot in the air more than 50 degrees from hanging (the game's came to 54); the rest of
//      his run the game's;
//   4. every picture of the still from every side: crisp, the friend's cyan edge, nothing of the enemy's rim, nothing cut off;
//   5. TRULY TURNED, NONE FLIPPED: the demon arm on his left from every side; the fire in its claws
//      seen from every side; his back leg inside his coat, never through it.
//   run: tsx --test tests/warlock_up.test.ts          WARLOCK_UP_ALL=1 tsx --test tests/warlock_up.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';
// @ts-ignore
import * as nodePath from 'node:path';

import { WARLOCK_UP, WL_BODY, paintWarlockUp, wlSkeleton } from '../src/art/warlock_up';
import { WL_FEET, WL_GAME, WL_LEG_FIELDS, WL_RUN, WL_STAND } from '../src/art/warlock_up_moves';
import { WU_RIM, WU_SIDES, WU_SPIN, turnedStage } from '../src/art/warrior_up';
import { WU_LEG_SEEN, WU_THIGH_MOST, wuLegs, wuThighs } from '../src/art/warrior_up_review';
import { RIM_ALPHA } from '../src/art/kit';
import { ENEMY_RIM } from '../src/art/mkit';
import { stage } from '../src/art/skin';
import { dot, solve, sub } from '../src/art/skeleton';
import type { V3 } from '../src/art/skeleton';
import { STANCE, warlockPose } from '../src/dev/warlock_moves';
import { HELL } from '../src/dev/sculpt_warlock';
import { rgba } from '../src/engine/px';
import { hashSprite } from '../tools/cheap_heroes';
import { warlockLists } from '../tools/warlock_up_measure';
import { paintWithoutCanvas } from './helpers';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void; deepEqual(a: unknown, b: unknown, msg?: string): void };
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
const path = nodePath as { join(...p: string[]): string };
declare const process: { env: Record<string, string | undefined> };
paintWithoutCanvas();

/** The moments of his stand the pictures are looked at in: his breathing (the still's 0.6 among them), the spasm, the fold, his glare. */
const LOOKED = [0, 0.6, 1.2, 2.8, 3.9, 5.8];
const least = (m: typeof WL_STAND, t: number, v: (typeof WU_SIDES)[number]): number => Math.min(...wuLegs(solve(WL_BODY, warlockPose(m.motion, t)), v, WL_BODY.ankle).map((l) => l.ratio));

// --- 1. the switch, and the game's Warlock unchanged while it is off ---------------------------------------------------------

test('1. the switch is off; nothing of the game imports the new files', () => {
  assert.equal(WARLOCK_UP.on, false, 'WARLOCK_UP is off');
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('art/warlock_up')) continue;
    if (/from ['"][^'"]*warlock_up(_moves)?['"]/.test(fs.readFileSync(path.join('src', f), 'utf8'))) users.push(f);
  }
  assert.equal(users.join(' '), '', 'nothing of the game imports them');
});

test('1. with the switch off, every frame the game paints of the Warlock is the very same picture (the hashes made from him as he is)', () => {
  const pinned = JSON.parse(fs.readFileSync('tests/warlock_up.hashes.json', 'utf8')) as { lists: Record<string, string[]> };
  const lists = warlockLists();
  assert.deepEqual(lists.map((l) => l.name).sort(), Object.keys(pinned.lists).sort(), 'the same lists');
  const all = !!process.env.WARLOCK_UP_ALL;
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

// --- 2. his legs ---------------------------------------------------------------------------------------------------------------

test('2. his legs read true in his stand: every frame from all eight sides at 1.05 or more; the game\'s read short', () => {
  const faults: string[] = [];
  let n = 0;
  for (let i = 0; i < Math.round(WL_STAND.long * 30); i++) {
    for (const v of WU_SIDES) {
      const r = least(WL_STAND, i / 30, v);
      if (r < 1.05) faults.push(`${i} ${v} ${r.toFixed(2)}`);
      n++;
    }
  }
  assert.ok(n >= 198 * 8, `${n} moments`);
  assert.equal(faults.length, 0, faults.slice(0, 12).join('; '));
  // (the game's stance, as it is: short from in front and from toward the camera)
  assert.ok(least(WL_GAME.stand, 0.6, 'front') < 0.98, 'the game\'s stance from in front');
  assert.ok(least(WL_GAME.stand, 0.6, 'toward') < 0.9, 'the game\'s stance from toward the camera');
  // (only his feet placed again: every key of his stand the game's but its feet, moved by WL_FEET)
  const legs = new Set<string>(WL_LEG_FIELDS);
  const S = STANCE as unknown as Record<string, number>;
  WL_GAME.stand.motion.keys.forEach((k, i) => {
    const a = k.pose as Record<string, unknown>;
    const b = WL_STAND.motion.keys[i].pose as Record<string, unknown>;
    assert.equal(WL_STAND.motion.keys[i].at, k.at, `key ${i} at the same moment`);
    for (const [f, v] of Object.entries(a)) if (!legs.has(f)) assert.deepEqual(b[f], v, `key ${i} ${f} as the game's`);
    for (const f of WL_LEG_FIELDS) assert.ok(Math.abs((b[f] as number) - (((a[f] as number | undefined) ?? S[f]) + ((WL_FEET as Record<string, number>)[f] ?? 0))) < 1e-9, `key ${i} ${f} moved by WL_FEET`);
  });
});

test('2. ... and as painted: each leg whose shin is seen, from every side, at 1.05 or more', () => {
  const faults: string[] = [];
  let seen = 0;
  for (const t of LOOKED) for (const v of WU_SIDES) {
    const f = paintWarlockUp(WL_STAND, t, v);
    for (const l of wuLegs(f.s, v, WL_BODY.ankle, { z: f.drawn.z, w: f.px.w, h: f.px.h })) {
      if (l.seen < WU_LEG_SEEN) continue;
      seen++;
      if (l.ratio < 1.05) faults.push(`${t} ${v} ${l.leg} ${l.ratio.toFixed(2)}`);
    }
  }
  assert.ok(seen >= LOOKED.length * 4, `${seen} legs seen`);
  assert.equal(faults.length, 0, faults.join('; '));
});

// --- 3. no prancing --------------------------------------------------------------------------------------------------------------

test('3. no prancing in his run: no thigh of a foot in the air more than 50 degrees from hanging; the game\'s came to more', () => {
  const most = (m: typeof WL_RUN): number => {
    let k = 0;
    for (let i = 0; i < 26; i++) for (const x of wuThighs(solve(WL_BODY, warlockPose(m.motion, i / 60)))) if (x.swinging) k = Math.max(k, x.deg);
    return k;
  };
  const now = most(WL_RUN);
  const was = most(WL_GAME.run);
  console.log(`# his run's swinging thigh, the most: before ${was.toFixed(1)}, now ${now.toFixed(1)} degrees`);
  assert.ok(now <= WU_THIGH_MOST, `now ${now.toFixed(1)}`);
  assert.ok(was > WU_THIGH_MOST, `the game's ${was.toFixed(1)}`);
  // (his right foot in the air from its lifting to its landing, as the game's: no toe dragged through; only in the last moment
  // before it lands, come down lower, it may already be at the floor)
  const air = (m: typeof WL_RUN, i: number): boolean => wuThighs(solve(WL_BODY, warlockPose(m.motion, (((i % 26) + 26) % 26) / 60)))[1].swinging;
  for (let i = 0; i < 26; i++) {
    if (air(WL_GAME.run, i) && !air(WL_GAME.run, i + 1)) continue;
    assert.equal(air(WL_RUN, i), air(WL_GAME.run, i), `${i}: his right foot in the air as the game's`);
  }
  // (and only his right foot's height and its kick differ from the game's run)
  WL_GAME.run.motion.keys.forEach((k, i) => {
    const a = k.pose as Record<string, unknown>;
    const b = WL_RUN.motion.keys[i].pose as Record<string, unknown>;
    for (const [f, v] of Object.entries(a)) if (!['rfz', 'rfp', 'rhx', 'rhy', 'rhz'].includes(f)) assert.deepEqual(b[f], v, `key ${i} ${f} as the game's`);
  });
});

// --- 4. every picture --------------------------------------------------------------------------------------------------------

test('4. every picture of the still, from every side: crisp, the friend\'s cyan edge, nothing of the enemy\'s rim, nothing cut off', () => {
  const rim = rgba(WU_RIM);
  const enemy = rgba(ENEMY_RIM);
  const faults: string[] = [];
  const shots: [typeof WL_STAND, number, (typeof WU_SIDES)[number]][] = [];
  for (const t of LOOKED) for (const v of WU_SIDES) shots.push([WL_STAND, t, v]);
  for (const i of [0, 9, 18]) for (const v of WU_SIDES) shots.push([WL_RUN, i / 60, v]);
  for (const [m, t, v] of shots) {
    const f = paintWarlockUp(m, t, v);
    const d = f.px.d;
    let edge = 0;
    for (let k = 0; k < d.length; k += 4) {
      const a = d[k + 3];
      if (a === 0) continue;
      if (a === RIM_ALPHA) {
        if (d[k] === rim[0] && d[k + 1] === rim[1] && d[k + 2] === rim[2]) edge++;
        else faults.push(`${m.name} ${t} ${v}: an edge pixel not cyan`);
        continue;
      }
      if (a !== 255) faults.push(`${m.name} ${t} ${v}: a pixel part seen through`);
      if (d[k] === enemy[0] && d[k + 1] === enemy[1] && d[k + 2] === enemy[2]) faults.push(`${m.name} ${t} ${v}: the enemy's rim`);
    }
    if (edge < 60) faults.push(`${m.name} ${t} ${v}: ${edge} of edge`);
    const W = f.px.w;
    const H = f.px.h;
    for (let x = 0; x < W; x++) for (const y of [0, H - 1]) if (d[(y * W + x) * 4 + 3] > 0) faults.push(`${m.name} ${t} ${v}: cut off`);
    for (let y = 0; y < H; y++) for (const x of [0, W - 1]) if (d[(y * W + x) * 4 + 3] > 0) faults.push(`${m.name} ${t} ${v}: cut off`);
  }
  assert.equal(faults.length, 0, [...new Set(faults)].slice(0, 12).join('; '));
});

// --- 5. truly turned ------------------------------------------------------------------------------------------------------------

test('5. truly turned, none flipped: the demon arm his left from every side; the fire in its claws seen; his back leg in his coat', () => {
  const hell = new Set(HELL.map((c) => rgba(c).slice(0, 3).join(',')));
  const faults: string[] = [];
  const fire: Record<string, number> = {};
  for (const t of LOOKED) for (const v of WU_SIDES) {
    const f = paintWarlockUp(WL_STAND, t, v);
    const st = turnedStage(stage('front', WU_SPIN[v].ax), WU_SPIN[v].spin);
    const W = f.px.w;
    // the demon arm: its pixels (its hide) nearer his left shoulder than his right, on the picture, wherever it is seen
    const hide = f.sc.mats.findIndex((m) => m.ramp[0] === '#1a040a');
    let ax = 0;
    let n = 0;
    for (let k = 0; k < f.drawn.stuff.length; k++) if (f.drawn.stuff[k] === hide) {
      ax += k % W;
      n++;
    }
    const s = wlSkeleton(WL_STAND, t);
    const L = st.at(s.shoulderL)[0];
    const R = st.at(s.shoulderR)[0];
    const handL = st.at(s.handL)[0];
    if (n > 0) {
      const mean = ax / n;
      // (the arm reaches out before him: its middle is between his left shoulder and his claws, never over on his right)
      const lo = Math.min(L, handL) - 8;
      const hi = Math.max(L, handL) + 8;
      if (Math.abs(L - R) > 4 && (mean < lo || mean > hi)) faults.push(`${t} ${v}: the demon's hide at ${mean.toFixed(0)}, his left shoulder ${L.toFixed(0)}, his claws ${handL.toFixed(0)}`);
    } else faults.push(`${t} ${v}: no demon's hide seen`);
    // the fire in its claws: game pixels of hellfire seen
    let hot = 0;
    for (let y = 0; y + 1 < f.px.h; y += 2) for (let x = 0; x + 1 < W; x += 2) {
      let c = 0;
      for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
        const k = ((y + dy) * W + x + dx) * 4;
        if (f.px.d[k + 3] === 255 && hell.has(`${f.px.d[k]},${f.px.d[k + 1]},${f.px.d[k + 2]}`)) c++;
      }
      if (c >= 2) hot++;
    }
    // (at least 8 game pixels of it as he breathes; as the pain folds him right over it and it gutters, at its smallest, 5)
    const folded = t > 3.5 && t < 4.8;
    const k = folded ? `${v} folded` : v;
    fire[k] = Math.min(fire[k] ?? Infinity, hot);
    if (hot < (folded ? 5 : 8)) faults.push(`${t} ${v}: ${hot} of his fire seen`);
    // his back leg inside his coat: its ankle within the coat's skirt where it hangs (standing, closed)
    const skirt = f.sc.prims.find((p) => p.k === 'cone' && p.piece === 'skirt' && p.tag === 'skirt') as { a: V3; b: V3; rb: number } | undefined;
    if (skirt) {
      const fw: V3 = [f.s.hips[0][0], f.s.hips[0][1], 0];
      const back = dot(sub(f.s.ankleL, f.s.ankleR), fw) < 0 ? f.s.ankleL : f.s.ankleR;
      const off = Math.hypot(back[0] - skirt.b[0], back[1] - skirt.b[1]);
      if (off + WL_BODY.legR[2] > skirt.rb + 1e-6) faults.push(`${t} ${v}: his back ankle ${off.toFixed(1)} out from his coat's foot, its reach ${skirt.rb.toFixed(1)}`);
    }
  }
  console.log('# the fire in his claws, the least seen from each side, breathing and folded (game pixels):', JSON.stringify(fire));
  assert.equal(faults.length, 0, faults.slice(0, 12).join('; '));
});

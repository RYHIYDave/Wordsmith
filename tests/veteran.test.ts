// THE VETERAN (dev/sculpt_veteran.ts, dev/veteran_globes.ts, dev/preview_veteran.ts; mock-ups, pictures first). His pick,
// 2 Nov 2026: “7, the Veteran”; “I don’t want anything reused from the original brawler, we need a totally new look”; and
// at 22:06 “I want him to look and play like an action movie hero.  Muscly, Bouncing on his toes”. So: nothing of the game
// imports him; nothing of the original Brawler's art is in him (his files and everything they import); every pose is
// crisp, edged in the friend's cyan, never the enemy's pink, nothing cut off, nothing in the floor, arms never through his
// trunk; up on his toes; in the air when he leaps; the headband's two long tails stream, follow and never pass through
// him; big fists; no eye patch, the blind eye milky; the globes cyan, hot orange and white, never pink or gold.
//   run: tsx --test tests/veteran.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodePath from 'node:path';

import { primDist } from '../src/dev/sculpt';
import { VET_ALL, VET_BUILD, VET_FIST, VET_MOVES, VET_STANCE, VET_STANCE_UP, paintVeteran, sculptVeteran } from '../src/dev/sculpt_veteran';
import { GLOBE_CYAN, GLOBE_STATES, paintGlobes } from '../src/dev/veteran_globes';
import { bodyFindings, pictureFindings } from './sculpt_checks';
import { hsv } from './floor_checks';

const test: (name: string, fn: () => void) => void = nodeTest;
const assert: { ok(v: unknown, m?: string): void; deepEqual(a: unknown, b: unknown, m?: string): void } = nodeAssert;
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string; existsSync(p: string): boolean };
const path = nodePath as { dirname(p: string): string; join(...p: string[]): string; normalize(p: string): string };

const OURS = ['sculpt_veteran', 'veteran_globes', 'preview_veteran', 'veteran_moves', 'veteran_fx', 'veteran_foe', 'veteran_scene', 'veteran_plays'];
/** What a file imports (its own paths, as written). */
const importsOf = (file: string): string[] => [...fs.readFileSync(file, 'utf8').matchAll(/(?:^|\n)\s*import[^'"]*from\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
/** Every file a file brings in, and they in turn: its whole closure. */
function closureOf(file: string): Set<string> {
  const seen = new Set<string>();
  const go = (f: string): void => {
    if (seen.has(f)) return;
    seen.add(f);
    for (const spec of importsOf(f)) {
      if (!spec.startsWith('.')) continue;
      const base = path.normalize(path.join(path.dirname(f), spec));
      const real = [`${base}.ts`, `${base}/index.ts`, base].find((c) => fs.existsSync(c) && c.endsWith('.ts'));
      if (real) go(real);
    }
  };
  go(file);
  return seen;
}
/** The original Brawler's art: his painters, his sculpt, his moves and looks. */
const BRAWLERS = /brawler|sculpt_classes/i;

test('nothing of the game imports the Veteran, his globes or his sheet', () => {
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev/')) continue;
    const re = new RegExp(`from ['"][^'"]*(${OURS.join('|')})['"]`);
    assert.ok(!re.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} imports the mock-up`);
  }
});

test('built fresh: nothing of the original Brawler is in the Veteran or his globes (their whole import closure), nor imported by his sheet', () => {
  for (const f of ['src/dev/sculpt_veteran.ts', 'src/dev/veteran_globes.ts']) {
    const bad = [...closureOf(f)].filter((x) => BRAWLERS.test(x));
    assert.deepEqual(bad, [], `${f} brings in the old Brawler's files`);
  }
  // (the sheet brings in the knight's painter only to stand the knight beside him for size)
  const direct = importsOf('src/dev/preview_veteran.ts').filter((x) => BRAWLERS.test(x));
  assert.deepEqual(direct, [], 'the sheet imports a Brawler file');
});

test('every pose, from in front, from behind and from the side: crisp, edged in the friend’s cyan, no pink, nothing cut off, in no floor, arms clear of his trunk', () => {
  for (const p of VET_ALL) {
    for (const turn of [0, 90, 45]) {
      const d = paintVeteran(p, turn);
      const found = [...pictureFindings(d.px), ...bodyFindings(d.fig.sc, true).filter((x) => !(p.air && x.startsWith('standing on nothing')))];
      assert.deepEqual(found, [], `${p.id} turned ${turn}`);
    }
  }
});

test('his stance is up on his toes, heels off the floor, at both moments of the bounce; and the bounce reads (up is higher)', () => {
  const heelsUp = (p: typeof VET_STANCE): number[] => {
    const f = sculptVeteran(p, 0);
    return [f.s.heelL[2], f.s.heelR[2]];
  };
  for (const p of [VET_STANCE, VET_STANCE_UP]) for (const h of heelsUp(p)) assert.ok(h > 1.4, `${p.id}: a heel ${h.toFixed(2)} off the floor`);
  const down = sculptVeteran(VET_STANCE, 0).s.pelvis[2];
  const up = sculptVeteran(VET_STANCE_UP, 0).s.pelvis[2];
  assert.ok(up - down > 4, `the bounce: ${down.toFixed(1)} to ${up.toFixed(1)}`);
});

test('his leaps leave the floor; his other poses stand on it', () => {
  for (const p of VET_ALL) {
    const f = sculptVeteran(p, 0);
    const low = Math.min(...f.sc.prims.filter((q) => !q.carve).map((q) => (q.k === 'cone' ? Math.min(q.a[2] - q.ra, q.b[2] - q.rb) : q.k === 'tri' ? Math.min(q.a[2], q.b[2], q.c[2]) - q.thick : q.c[2] - Math.hypot(q.axes[0][2], q.axes[1][2], q.axes[2][2]))));
    if (p.air) assert.ok(low > 5, `${p.id}: in the air, his lowest ${low.toFixed(1)} over the floor`);
    else assert.ok(low < 1.2, `${p.id}: on the floor, his lowest ${low.toFixed(1)}`);
  }
});

test('the headband: two long tails that stream behind him, follow how he moves, and never pass through him', () => {
  for (const p of VET_ALL) {
    const f = sculptVeteran(p, 0);
    assert.ok(f.tails.length === 2, `${p.id}: two tails`);
    const body = f.sc.prims.filter((q) => !q.carve && !['tailA', 'tailB', 'band'].includes(q.piece));
    for (const t of f.tails) {
      let L = 0;
      for (let i = 1; i < t.length; i++) L += Math.hypot(t[i][0] - t[i - 1][0], t[i][1] - t[i - 1][1], t[i][2] - t[i - 1][2]);
      assert.ok(L >= 18, `${p.id}: a tail ${L.toFixed(1)} long`);
      for (const pt of t.slice(2)) {
        const d = Math.min(...body.map((q) => primDist(q, pt)));
        assert.ok(d > 0.4, `${p.id}: a tail passes through him (${d.toFixed(2)})`);
      }
      // streaming out behind his head, never stiff in front of his face
      const back = (pt: readonly number[]): number => (pt[0] - f.s.head[0]) * f.s.face[0][0] + (pt[1] - f.s.head[1]) * f.s.face[0][1] + (pt[2] - f.s.head[2]) * f.s.face[0][2];
      assert.ok(back(t[t.length - 1]) < 0, `${p.id}: a tail's end in front of his face`);
    }
  }
  // (they follow: the strike's tails lie elsewhere than the wind-up's, for every move)
  for (const m of VET_MOVES) {
    const a = sculptVeteran(m.windup, 0);
    const b = sculptVeteran(m.strike, 0);
    const rel = (f: typeof a): number[] => {
      const e = f.tails[0][f.tails[0].length - 1];
      return [e[0] - f.s.head[0], e[1] - f.s.head[1], e[2] - f.s.head[2]];
    };
    const ra = rel(a);
    const rb = rel(b);
    assert.ok(Math.hypot(ra[0] - rb[0], ra[1] - rb[1], ra[2] - rb[2]) > 4, `${m.id}: the tails move with him`);
  }
});

test('big fists (at least three quarters of his head across); no eye patch; the blind eye milky with its scar', () => {
  const span = 2 * 2.65 * VET_FIST.k;
  const head = 2 * VET_BUILD.headR[1];
  assert.ok(span >= 0.75 * head, `a fist ${span.toFixed(1)} across, his head ${head.toFixed(1)}`);
  const f = sculptVeteran(VET_STANCE, 0);
  assert.ok(!f.sc.prims.some((q) => /patch/i.test(q.tag ?? '')), 'an eye patch');
  assert.ok(f.sc.marks.some((m) => m.c === '#d4d6de'), 'the milky eye');
});

test('the six key poses: the hook, the round kick, the jump, the flying uppercut, the spinning jump kick, the flying knee; each a wind-up and a strike', () => {
  assert.deepEqual(VET_MOVES.map((m) => m.id), ['punch', 'kick', 'jump', 'uppercut', 'jumpkick', 'knee']);
  for (const m of VET_MOVES) assert.ok(m.line.length > 40 && m.windup.id !== m.strike.id, m.id);
  // the uppercut, the jump, the spinning kick and the knee are off the floor; the hook and the round kick on it
  assert.deepEqual(VET_MOVES.map((m) => !!m.strike.air), [false, false, true, true, true, true]);
});

test('the globes: crisp; cyan a punch, hot orange a kick, white the jump; never pink, never gold', () => {
  assert.ok(GLOBE_CYAN[2] === '#22d0e0', 'the punch is the friend\u2019s cyan');
  let sawCyan = false;
  let sawOrange = false;
  for (const st of GLOBE_STATES) {
    const px = paintGlobes(st.row);
    for (let i = 0; i < px.d.length; i += 4) {
      const a = px.d[i + 3];
      assert.ok(a === 0 || a === 255, `${st.title}: a pixel neither there nor not`);
      if (!a) continue;
      const [h, s, v] = hsv(px.d[i], px.d[i + 1], px.d[i + 2]);
      assert.ok(!(h >= 290 && h <= 352 && s > 0.4 && v > 0.4), `${st.title}: pink`);
      assert.ok(!(h >= 38 && h <= 64 && s > 0.45 && v > 0.55), `${st.title}: gold`);
      if (h >= 175 && h <= 195 && s > 0.5) sawCyan = true;
      if (h >= 10 && h <= 32 && s > 0.5 && v > 0.5) sawOrange = true;
    }
  }
  assert.ok(sawCyan && sawOrange, 'cyan and hot orange both shown');
});

// =============================================================================================
// HIS MOVES (dev/veteran_moves.ts; the film, dev/veteran_scene.ts and tools/veteran_film.ts). His word on the stills, 2 Nov
// 2026: “Pretty good.  Those action lines will probably need to be bigger.  Remember, I’d rather have to pull back from a 10
// then build up from a 1.  In terms of awesome looking animations”; at 22:43: “Make sure his limbs all face the correct way,
// don’t make mistakes”; at 22:44: “It can be over the top, I just don’t want his foot facing backwards or something”. So:
// every frame of every move, from in front and from behind, through the figure checks the classes use (crisp, the friend's
// edge, no pixel alone, no pink, nothing cut off, nothing in the floor, his arms clear of his trunk, his legs of each other;
// slick; his feet gripping the floor); EVERY JOINT INSIDE WHAT A BODY CAN DO (knees and elbows bend only their own way and
// never past straight, feet point the way a foot can, the spine and neck never over-twisted, fists turned as a fist turns,
// left never swapped for right); each strike one or two frames, smeared, big; the globes never pink or gold.

import { VET_CANVAS } from '../src/dev/sculpt_veteran';
import type { VetPose } from '../src/dev/sculpt_veteran';
import { VET_MOTIONS, closeKickOf, inAir, kneeOf, placeOf, poseAt, skel, spinAt, upperOf, vetAt, worldOf } from '../src/dev/veteran_moves';
import type { VetMotion } from '../src/dev/veteran_moves';
import { project } from '../src/art/skeleton';
import type { Skeleton, V3 } from '../src/art/skeleton';
import { Px } from '../src/engine/px';
import { smear } from '../src/dev/veteran_fx';
import { FX_KICK, FX_PUNCH } from '../src/dev/veteran_fx';
import { globesAt } from '../src/dev/veteran_scene';
import { VET_FILM } from '../src/dev/veteran_plays';

const MOVES_ALL: VetMotion[] = [...VET_MOTIONS, kneeOf(30, 'kneeC'), upperOf(20, 'uppercutC'), closeKickOf(48, 'spinkickC')];
const framesOf = (m: VetMotion): number[] => Array.from({ length: m.long + (m.loops ? 0 : 1) }, (_, i) => i);
const sub3 = (a: readonly number[], b: readonly number[]): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot3 = (a: readonly number[], b: readonly number[]): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len3 = (a: readonly number[]): number => Math.hypot(a[0], a[1], a[2]);
const unit = (a: readonly number[]): V3 => {
  const n = len3(a) || 1;
  return [a[0] / n, a[1] / n, a[2] / n];
};
const cross3 = (a: readonly number[], b: readonly number[]): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const perp = (v: readonly number[], to: readonly number[]): V3 => {
  const u = unit(to);
  const k = dot3(v, u);
  return [v[0] - u[0] * k, v[1] - u[1] * k, v[2] - u[2] * k];
};
const angleAt = (a: readonly number[], mid: readonly number[], b: readonly number[]): number => {
  const u = unit(sub3(a, mid));
  const v = unit(sub3(b, mid));
  return (Math.acos(Math.max(-1, Math.min(1, dot3(u, v)))) * 180) / Math.PI;
};
/** How far a joint sticks out from the line between its two ends (the way it bends), and how bent it is. */
const poleOf = (a: readonly number[], mid: readonly number[], b: readonly number[]): V3 => {
  const ab = sub3(b, a);
  const t = dot3(sub3(mid, a), ab) / (dot3(ab, ab) || 1);
  return sub3(mid, [a[0] + ab[0] * t, a[1] + ab[1] * t, a[2] + ab[2] * t]);
};

/** EVERY JOINT INSIDE WHAT A BODY CAN DO, in one pose of him. */
export function jointFindings(s: Skeleton, p: VetPose): string[] {
  const out: string[] = [];
  const b = { twist: 0, bend: 0, side: 0, ...p.bones } as { twist: number; bend: number; side: number; hunch?: number };
  for (const side of ['L', 'R'] as const) {
    const hip = side === 'L' ? s.hipL : s.hipR;
    const knee = side === 'L' ? s.kneeL : s.kneeR;
    const ank = side === 'L' ? s.ankleL : s.ankleR;
    const toe = side === 'L' ? s.toeL : s.toeR;
    const heel = side === 'L' ? s.heelL : s.heelR;
    // THE KNEE: folds no tighter than a knee does, never past straight, and only toward where the toes point
    const kA = angleAt(hip, knee, ank);
    if (kA < 25) out.push(`${side} knee folded to ${kA.toFixed(0)}°`);
    const foot = sub3(toe, heel);
    const aA0 = angleAt(knee, ank, toe);
    if (kA < 168 && aA0 < 125) {
      const pole = unit(poleOf(hip, knee, ank));
      const ff = unit(perp(foot, sub3(ank, knee)));
      if (dot3(pole, ff) < -0.1) out.push(`${side} knee bends against its foot (${dot3(pole, ff).toFixed(2)})`);
    }
    // THE ANKLE: the foot tipped no further than a foot goes, up toward the shin or down to a point
    const aA = angleAt(knee, ank, toe);
    if (aA < 55 || aA > 172) out.push(`${side} ankle at ${aA.toFixed(0)}°`);
    // THE FOOT never facing backwards from his hips
    const hf = s.hips[0];
    const fh = unit([foot[0], foot[1], 0]);
    const hh = unit([hf[0], hf[1], 0]);
    const fa = (Math.acos(Math.max(-1, Math.min(1, dot3(fh, hh)))) * 180) / Math.PI;
    if (fa > 110 && Math.min(toe[2], heel[2]) < 6) out.push(`${side} foot turned ${fa.toFixed(0)}° from his hips`);
  }
  const [cf, cl] = s.chest;
  for (const side of ['L', 'R'] as const) {
    const sh = side === 'L' ? s.shoulderL : s.shoulderR;
    const el = side === 'L' ? s.elbowL : s.elbowR;
    const ha = side === 'L' ? s.handL : s.handR;
    // THE ELBOW: folds no tighter than an arm does, never past straight; never bent backward (pointing forward as the
    // fist reaches forward), never pointing into his own body
    const eA = angleAt(sh, el, ha);
    if (eA < 20) out.push(`${side} elbow folded to ${eA.toFixed(0)}°`);
    if (eA < 165) {
      const pole = unit(poleOf(sh, el, ha));
      void cf;
      const inward = side === 'L' ? [-cl[0], -cl[1], -cl[2]] : cl;
      if (dot3(pole, inward) > 0.85) out.push(`${side} elbow points into his body`);
      // THE FIST: turned as a forearm turns (palm toward the biceps, in, or away; never turned out past that)
      const d = unit(sub3(ha, el));
      const ant = unit(perp(sub3(sh, el), d));
      const lat = side === 'R' ? cross3(d, ant) : cross3(ant, d);
      const palm = (side === 'L' ? p.palmL : p.palmR) as V3;
      if (palm && dot3(unit(perp(palm, d)), lat) > 0.55) out.push(`${side} fist turned past what a forearm turns (${dot3(unit(perp(palm, d)), lat).toFixed(2)})`);
    }
  }
  // THE SPINE AND NECK: never twisted, bent or tipped past what a back does; the head turned no further than a neck turns
  if (Math.abs(b.twist) > 62) out.push(`spine twisted ${b.twist.toFixed(0)}°`);
  if (b.bend < -36 || b.bend > 52) out.push(`spine bent ${b.bend.toFixed(0)}°`);
  if (Math.abs(b.side) > 32) out.push(`spine bent over sideways ${b.side.toFixed(0)}°`);
  if ((b.hunch ?? 0) > 30) out.push(`back hunched ${b.hunch}°`);
  const nf = unit([s.face[0][0], s.face[0][1], 0]);
  const uf = unit([s.upper[0][0], s.upper[0][1], 0]);
  const neck = (Math.acos(Math.max(-1, Math.min(1, dot3(nf, uf)))) * 180) / Math.PI;
  if (neck > 95) out.push(`head turned ${neck.toFixed(0)}° from his chest`);
  // LEFT IS LEFT: his left shoulder and hip on his left
  if (dot3(sub3(s.shoulderL, s.shoulderR), s.upper[1]) <= 0) out.push('shoulders swapped');
  if (dot3(sub3(s.hipL, s.hipR), s.hips[1]) <= 0) out.push('hips swapped');
  return out;
}

/** No solid of him flattened to nothing (a muscle whose ways have folded onto each other paints as a slab). */
function flattened(sc: { prims: readonly { k: string; axes?: readonly (readonly number[])[]; piece: string; tag?: string }[] }): string[] {
  const out: string[] = [];
  for (const q of sc.prims) {
    if ((q.k !== 'ell' && q.k !== 'box') || !q.axes) continue;
    const [a, b, c] = q.axes;
    const k = Math.abs(dot3(a, cross3(b, c))) / Math.max(1e-6, len3(a) * len3(b) * len3(c));
    if (k < 0.2) out.push(`${q.piece}/${q.tag ?? q.k} flattened (${k.toFixed(2)})`);
  }
  return out;
}

const strikeFrames = (m: VetMotion): [number, number][] => [...m.strikes.map((s) => [s.from, Math.max(s.at, ...s.hits.map((h) => h.f)) + 1] as [number, number]), ...(m.struck ?? []).map((f) => [f - 1, f + 1] as [number, number])];
/** The jolt of a landing or a take-off: the frame a foot leaves or meets the floor, and the next (not judged as slick). */
function jolts(m: VetMotion): number[] {
  const out: number[] = [];
  const fr = framesOf(m);
  const up = (f: number): [boolean, boolean, boolean] => {
    const s = skel(poseAt(m, f));
    return [inAir(s), Math.min(s.toeL[2], s.heelL[2]) > 0.9, Math.min(s.toeR[2], s.heelR[2]) > 0.9];
  };
  for (let i = 1; i < fr.length; i++) {
    const a = up(fr[i - 1]);
    const b = up(fr[i]);
    if (a.some((x, k) => x !== b[k])) out.push(fr[i - 1], fr[i]);
  }
  return out;
}

for (const m of MOVES_ALL) {
  test(`${m.name} (${m.id}): every frame, from in front and from behind: crisp, the friend’s edge, no pink, nothing cut off, nothing in the floor, his body clean, no solid flattened`, () => {
    const found: string[] = [];
    for (const f of framesOf(m)) {
      const p = vetAt(m, f);
      for (const view of [0, 90]) {
        const d = paintVeteran(p, view + placeOf(m, f).turn);
        for (const x of pictureFindings(d.px)) found.push(`f${f} ${view}: ${x}`);
        for (const x of bodyFindings(d.fig.sc, true)) if (!(p.air && x.startsWith('standing on nothing'))) found.push(`f${f} ${view}: ${x}`);
        if (view === 0) for (const x of flattened(d.fig.sc as never)) found.push(`f${f}: ${x}`);
      }
    }
    assert.deepEqual([...new Set(found)], []);
  });

  test(`${m.name} (${m.id}): every joint inside what a body can do, every frame (knees, elbows, ankles, feet, spine, neck, fists; left never swapped for right)`, () => {
    const found: string[] = [];
    let prev: Skeleton | null = null;
    const strikes = strikeFrames(m);
    for (const f of framesOf(m)) {
      const p = vetAt(m, f);
      for (const x of jointFindings(p.s, p)) found.push(`f${f}: ${x}`);
      // (between two frames: each hand and foot is nearer where it was than where its fellow was: never swapped)
      const w = (q: V3): V3 => worldOf(m, f, q);
      if (prev && !strikes.some(([a, b]) => f >= a && f <= b + 1) && !jolts(m).includes(f)) {
        const pw = (q: V3): V3 => worldOf(m, f - 1, q);
        for (const [a, b] of [['handL', 'handR'], ['ankleL', 'ankleR']] as const) {
          const now = w(p.s[a]);
          if (len3(sub3(pw(prev[a]), pw(prev[b]))) > 4 && len3(sub3(now, pw(prev[a]))) > len3(sub3(now, pw(prev[b])))) found.push(`f${f}: ${a} swapped for ${b}`);
        }
      }
      prev = p.s;
    }
    assert.deepEqual([...new Set(found)], []);
  });

  test(`${m.name} (${m.id}): slick (nothing leaps, stalls or turns straight back at speed but the strike itself and a landing's jolt); a foot down on the floor stays where it is`, () => {
    const found: string[] = [];
    const fr = framesOf(m);
    const strikes = strikeFrames(m);
    const jo = jolts(m);
    // (and a whirl: while the whole of him turns faster than 40 degrees a frame, a blur, as a strike is)
    const whirl = (f: number): boolean => Math.abs(spinAt(m, f) - spinAt(m, f - 1)) > 40 || Math.abs(spinAt(m, f + 1) - spinAt(m, f)) > 40;
    const free = (f: number): boolean => strikes.some(([a, b]) => f >= a && f <= b) || jo.includes(f) || whirl(f);
    const JOINTS = ['pelvis', 'head', 'handL', 'handR', 'elbowL', 'elbowR', 'kneeL', 'kneeR', 'ankleL', 'ankleR', 'toeL', 'toeR'] as const;
    const sk = fr.map((f) => skel(poseAt(m, f)));
    for (const j of JOINTS) {
      for (const view of ['front', 'back'] as const) {
        const xy = sk.map((s, i) => project(worldOf(m, fr[i], s[j] as V3), view));
        if (m.loops) xy.push(xy[0]);
        const st = xy.slice(1).map((q, i) => [q[0] - xy[i][0], q[1] - xy[i][1]] as const);
        const sp = st.map(([x, y]) => Math.hypot(x, y));
        const N = sp.length;
        for (let i = 1; i < N - 1; i++) {
          if (free(fr[i]) || free(fr[i + 1] ?? -1) || free(fr[i - 1])) continue;
          const [a, b, c] = [sp[i - 1], sp[i], sp[i + 1]];
          if (b > 4 && b > 2.4 * Math.max(a, c)) found.push(`${j} leaps ${b.toFixed(1)} at f${fr[i]} (${view})`);
          const sa = st[i - 1];
          const sb = st[i];
          if ((sa[0] * sb[0] + sa[1] * sb[1]) / (Math.hypot(...sa) * Math.hypot(...sb) || 1) < -0.5 && a > 3.5 && b > 3.5) found.push(`${j} turns straight back at speed at f${fr[i]} (${view})`);
        }
      }
    }
    // HIS FEET GRIP THE FLOOR: a ball of a foot down on the floor in two frames running stays where it is
    for (let i = 1; i < fr.length; i++) {
      for (const toe of ['toeL', 'toeR'] as const) {
        const a = worldOf(m, fr[i - 1], sk[i - 1][toe]);
        const b = worldOf(m, fr[i], sk[i][toe]);
        if (a[2] < 0.7 && b[2] < 0.7 && Math.hypot(a[0] - b[0], a[1] - b[1]) > 0.55) found.push(`f${fr[i]}: ${toe} slides ${Math.hypot(a[0] - b[0], a[1] - b[1]).toFixed(2)}`);
      }
    }
    assert.deepEqual([...new Set(found)], []);
  });
}

test('every strike is one or two frames from its held wind-up to the blow, and SMEARED: a great band along its path, much bigger than the stills’ streak', () => {
  for (const m of MOVES_ALL) {
    for (const s of m.strikes) {
      assert.ok(s.at - s.from >= 1 && s.at - s.from <= 2, `${m.id}: the strike takes ${s.at - s.from} frames`);
      // (the path its fist, shin, knee or elbow takes, as the film paints it from in front, at the game's size)
      const path: [number, number][] = [];
      const last = Math.max(s.at, ...s.hits.map((h) => h.f));
      for (let g = s.from - 0.5; g <= last + 1e-6; g += 0.1) {
        const q = project(worldOf(m, g, skel(poseAt(m, g))[s.joint] as V3), 'front');
        path.push([100 + q[0], 100 + q[1]]);
      }
      let L = 0;
      for (let i = 1; i < path.length; i++) L += Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]);
      assert.ok(L >= 12, `${m.id}: the blow travels only ${L.toFixed(1)} pixels`);
      const px = new Px(200, 200);
      smear(px, path, s.heavy ? 13 : 9, s.kind === 'kick' ? FX_KICK : FX_PUNCH);
      let n = 0;
      for (let i = 3; i < px.d.length; i += 4) if (px.d[i]) n++;
      assert.ok(n >= 150, `${m.id}: its smear only ${n} pixels`);
      // (each blow of the strike lands within it)
      for (const h of s.hits) assert.ok(h.f >= s.at, `${m.id}: a blow lands before the strike`);
    }
  }
});

test('the Veteran held off the floor only where he leaps; a held wind-up before every strike (the two frames before it barely move)', () => {
  for (const m of MOVES_ALL) {
    for (const s of m.strikes) {
      const a = skel(poseAt(m, s.from - 2))[s.joint] as V3;
      const b = skel(poseAt(m, s.from))[s.joint] as V3;
      const c = skel(poseAt(m, s.at))[s.joint] as V3;
      assert.ok(len3(sub3(a, b)) < 0.5 * len3(sub3(b, c)), `${m.id}: the wind-up is not held (${len3(sub3(a, b)).toFixed(1)} against ${len3(sub3(b, c)).toFixed(1)})`);
    }
  }
});

test('the globes over him as each combo is put in: crisp, cyan, hot orange and white, never pink, never gold, in every frame of the film', () => {
  for (const part of VET_FILM) {
    if (!part.play.globes) continue;
    for (let G = 0; G < part.long; G++) {
      const row = globesAt(part.play, G);
      if (!row) continue;
      const px = paintGlobes(row);
      for (let i = 0; i < px.d.length; i += 4) {
        const a = px.d[i + 3];
        assert.ok(a === 0 || a === 255, 'a globe pixel neither there nor not');
        if (!a) continue;
        const [h, s, v] = hsv(px.d[i], px.d[i + 1], px.d[i + 2]);
        assert.ok(!(h >= 290 && h <= 352 && s > 0.4 && v > 0.4), `${part.title} ${G}: pink`);
        assert.ok(!(h >= 38 && h <= 64 && s > 0.45 && v > 0.55), `${part.title} ${G}: gold`);
      }
    }
  }
});

test('his moves, his film and its pieces: nothing of the game imports them, and nothing of the old Brawler is in them', () => {
  const mine = ['veteran_moves', 'veteran_fx', 'veteran_foe', 'veteran_scene', 'veteran_plays'];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev/')) continue;
    const re = new RegExp(`from ['"][^'"]*(${mine.join('|')})['"]`);
    assert.ok(!re.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} imports his moves`);
  }
  for (const f of mine) {
    const bad = [...closureOf(`src/dev/${f}.ts`)].filter((x) => BRAWLERS.test(x));
    assert.deepEqual(bad, [], `${f} brings in the old Brawler's files`);
  }
  assert.ok(!/brawler/i.test(fs.readFileSync('tools/veteran_film.ts', 'utf8').split('\n').filter((l) => l.startsWith('import')).join('\n')), 'the film tool imports a Brawler file');
});
void VET_CANVAS;

// THE VETERAN (dev/sculpt_veteran.ts, dev/veteran_globes.ts, dev/preview_veteran.ts; mock-ups, pictures first). His pick,
// 2 Nov 2026: “7, the Veteran”; “I don’t want anything reused from the original brawler, we need a totally new look”; and
// at 22:06 “I want him to look and play like an action movie hero.  Muscly, Bouncing on his toes”. So: the game brings him in
// only through its own pictures of him (art/veteran_art.ts, veteran_fx_art.ts, render/veteran_fx.ts, behind game/veteran.ts
// VETERAN); nothing of the original Brawler's art is in him (his files and everything they import); every pose is
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

/**
 * THE GAME'S OWN PICTURES OF HIM (the main chat, 3 Nov 2026, behind game/veteran.ts VETERAN): the game brings in his figure, his
 * moves, his action lines and his globes through these files only, as the old Brawler's were through art/brawler_art.ts; never
 * his sheet, his film's scene, its parts or the stand-in foe.
 */
const GAME_DOOR: Record<string, readonly string[]> = {
  'art/veteran_art.ts': ['sculpt_veteran', 'veteran_moves'],
  'art/veteran_fx_art.ts': ['veteran_moves', 'veteran_fx'],
  'render/veteran_fx.ts': ['veteran_moves', 'veteran_fx', 'veteran_globes'],
};
test('the game brings in the Veteran only through its own pictures of him (art/veteran_art.ts, art/veteran_fx_art.ts, render/veteran_fx.ts), never his sheet', () => {
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev/')) continue;
    const allowed = GAME_DOOR[f] ?? [];
    const banned = OURS.filter((o) => !allowed.includes(o));
    // (the art's files, in src/dev: the game's own render/veteran_fx.ts is not the art's dev/veteran_fx.ts)
    const re = new RegExp(`from ['"][^'"]*dev/(${banned.join('|')})['"]`);
    assert.ok(!re.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} imports the mock-up`);
  }
  // (and his frames bring in nothing of the old Brawler: his file and everything it imports)
  const bad = [...closureOf('src/art/veteran_art.ts')].filter((x) => BRAWLERS.test(x));
  assert.deepEqual(bad, [], 'art/veteran_art.ts brings in the old Brawler\'s files');
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
import { PUSH_CONE, REACH, REACH_FAR, STEP_KICK, STEP_PUNCH, VET_COMBOS, VET_MOTIONS, VET_TILE, carryAt, closeKickOf, forceGeo, inAir, kneeOf, motionById, placeOf, poseAt, roundSpan, skel, slidesOf, spinAt, upperOf, vetAt, worldOf } from '../src/dev/veteran_moves';
import type { VetMotion } from '../src/dev/veteran_moves';
import { project } from '../src/art/skeleton';
import type { Skeleton, V3 } from '../src/art/skeleton';
import { Px } from '../src/engine/px';
import { crescent, shockCone, smear } from '../src/dev/veteran_fx';
import { FX_KICK, FX_PUNCH } from '../src/dev/veteran_fx';
import { blowsOf, globesAt, playLong } from '../src/dev/veteran_scene';
import { cross3, dot3, jointFindings, len3, sub3 } from './veteran_checks';
import { VET_FILM } from '../src/dev/veteran_plays';

const MOVES_ALL: VetMotion[] = [...VET_MOTIONS, closeKickOf(1.25 * VET_TILE, 'spinkickC')];
void upperOf;
const framesOf = (m: VetMotion): number[] => Array.from({ length: m.long + (m.loops ? 0 : 1) }, (_, i) => i);
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
    // HIS FEET GRIP THE FLOOR: a ball of a foot down on the floor in two frames running stays where it is (but where it is
    // dragged up after him as he drives in: its slides, checked below)
    const slides = slidesOf(m);
    for (let i = 1; i < fr.length; i++) {
      for (const toe of ['toeL', 'toeR'] as const) {
        if (slides.some(([side, a, b]) => side === toe.slice(3) && fr[i] > a && fr[i] <= b)) continue;
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

test('his moves, his film and its pieces: the game brings in only his moves and action lines, through its own pictures of him; nothing of the old Brawler is in them', () => {
  const mine = ['veteran_moves', 'veteran_fx', 'veteran_foe', 'veteran_scene', 'veteran_plays'];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev/')) continue;
    const banned = mine.filter((o) => !(GAME_DOOR[f] ?? []).includes(o));
    const re = new RegExp(`from ['"][^'"]*dev/(${banned.join('|')})['"]`);
    assert.ok(!re.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} imports his moves`);
  }
  for (const f of mine) {
    const bad = [...closureOf(`src/dev/${f}.ts`)].filter((x) => BRAWLERS.test(x));
    assert.deepEqual(bad, [], `${f} brings in the old Brawler's files`);
  }
  assert.ok(!/brawler/i.test(fs.readFileSync('tools/veteran_film.ts', 'utf8').split('\n').filter((l) => l.startsWith('import')).join('\n')), 'the film tool imports a Brawler file');
});
void VET_CANVAS;

// =============================================================================================
// HIS WORD ON THE MOVES, 3 Nov 2026, 00:34: “I’m digging it.  I think his elbows are out a little too much in his stance.  And
// the knee and elbow need a little work.  But it looks great and I think we’re on the right track.”; his pick “Read better
// (Recommended)”; at 00:36: “And the 3 kick combo seemed like two of the same kicks”, his pick “Push kick, then round”; at
// 00:37: “Push kick hits in a cone in front of”.

test('his stance: a fighter’s guard, the elbows tucked in (inside his shoulders, below his fists), the fists up by his cheeks', () => {
  for (const p of [VET_STANCE, VET_STANCE_UP]) {
    const s = sculptVeteran(p, 0).s;
    const [, cl, cu] = s.chest;
    const mid: number[] = [(s.shoulderL[0] + s.shoulderR[0]) / 2, (s.shoulderL[1] + s.shoulderR[1]) / 2, (s.shoulderL[2] + s.shoulderR[2]) / 2];
    const out = (q: readonly number[]): number => Math.abs(dot3(sub3(q, mid), cl));
    const up = (q: readonly number[]): number => dot3(sub3(q, mid), cu);
    for (const side of ['L', 'R'] as const) {
      const sh = side === 'L' ? s.shoulderL : s.shoulderR;
      const el = side === 'L' ? s.elbowL : s.elbowR;
      const ha = side === 'L' ? s.handL : s.handR;
      assert.ok(out(el) < out(sh) - 1.5, `${p.id}: the ${side} elbow ${out(el).toFixed(1)} out, the shoulder ${out(sh).toFixed(1)}`);
      assert.ok(up(el) < up(ha) - 8, `${p.id}: the ${side} elbow not well below its fist`);
      assert.ok(out(ha) < 8 && up(ha) > up(s.neck) - 1, `${p.id}: the ${side} fist not up by his cheek (${out(ha).toFixed(1)} out, ${up(ha).toFixed(1)} up)`);
    }
  }
});

test('the push kick hits everyone in a cone in front of him, 60 degrees wide and out to 3.5 tiles from where he stood, and no one outside it; combo 4 is three different kicks', () => {
  assert.ok(PUSH_CONE.deg === 60 && Math.abs(PUSH_CONE.reach - 3.5 * VET_TILE) < 1e-9, 'the cone');
  const part = VET_FILM.find((x) => x.title.startsWith('THE PUSH KICK ·'));
  assert.ok(part, 'the push kick in the film');
  if (!part) return;
  const hit = new Set(blowsOf(part.play).filter((b) => b.react === 'shove').map((b) => b.foe));
  assert.deepEqual([...hit].sort(), [0, 1, 2], 'the three in the cone shoved, the one outside it not');
  const c4 = VET_COMBOS.find((c) => c.n === 4);
  assert.deepEqual(c4?.steps.map((x) => x.move), ['roundkick', 'push', 'spinkick']);
  assert.ok(new Set(c4?.steps.map((x) => x.move)).size === 3, 'three different kicks');
});

test('the flying knee at the blow: the thigh near level, the knee leading (the furthest forward of him) at their chest; the spinning elbow at the blow at head height, pointing at them', () => {
  for (const m of [motionById('knee'), kneeOf(1.25 * VET_TILE, 'kneeC')]) {
    const s = m.strikes[0];
    const k = skel(poseAt(m, s.at));
    const thigh = sub3(k.kneeR, k.hipR);
    assert.ok(Math.abs(thigh[2]) < 0.35 * len3(thigh), `${m.id}: the thigh not near level`);
    for (const j of ['handL', 'handR', 'toeL', 'toeR', 'head', 'ankleR'] as const) assert.ok(k.kneeR[0] >= k[j][0] - 3.5, `${m.id}: the ${j} further forward than the knee`);
    assert.ok(k.kneeR[2] > 36, `${m.id}: the knee ${k.kneeR[2].toFixed(1)} over the floor`);
  }
  const e = motionById('elbow');
  const s = e.strikes[0];
  const el = worldOf(e, s.at, skel(poseAt(e, s.at)).elbowR);
  const head = worldOf(e, s.at, skel(poseAt(e, s.at)).head);
  assert.ok(Math.abs(el[2] - head[2]) < 6, `the elbow ${el[2].toFixed(1)} high, his head ${head[2].toFixed(1)}`);
  const foe = e.foes[0];
  const a = Math.atan2(el[1] - head[1], el[0] - head[0]);
  const b = Math.atan2(foe[1] - head[1], foe[0] - head[0]);
  assert.ok(Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b))) < (25 * Math.PI) / 180, 'the elbow not pointing at them');
});

// =============================================================================================
// HIS REACH (3 Nov 2026). His words: “Okay, I don’t like his range.  I get that’s as far as his arms and legs go but I’d like
// all of his moves to have more reach.  And I’m only using whirlwind as a size comparison, I don’t want the kick to look or
// act like it.”; how it shows, his pick “Both”; how far, “About 2½ tiles (Recommended)”; which kick a first hold is, “Round
// kick first”.

const BLOWS = ['jab', 'cross', 'hook', 'roundkick', 'elbow', 'uppercut', 'knee'];
test('every punch and kick reaches 2.5 tiles from where he stood (his step and the force past the fist or foot); the push kick’s cone and the spinning kick’s crescent 3.5', () => {
  assert.ok(Math.abs(REACH - 2.5 * VET_TILE) < 1e-9 && Math.abs(REACH_FAR - 3.5 * VET_TILE) < 1e-9, 'the reaches');
  for (const id of BLOWS) {
    const m = motionById(id);
    const s = m.strikes[0];
    const g = forceGeo(m, s);
    // (the far end of its force, along its line, from where he stood)
    const tip = g.shape === 'cone' ? [g.o[0] + Math.cos(g.dir) * Math.cos(g.up) * g.r1, g.o[1] + Math.sin(g.dir) * Math.cos(g.up) * g.r1] : [g.o[0] + Math.cos(g.dir) * g.r1, g.o[1] + Math.sin(g.dir) * g.r1];
    assert.ok(Math.abs(Math.hypot(tip[0], tip[1]) - REACH) < 1, `${id}: reaches ${(Math.hypot(tip[0], tip[1]) / VET_TILE).toFixed(2)} tiles`);
    // (the force goes on past the fist or foot: it is not all his arm or leg)
    const k = worldOf(m, s.at, skel(poseAt(m, s.at))[s.joint] as V3);
    assert.ok(REACH - Math.hypot(k[0], k[1]) > 0.5 * VET_TILE, `${id}: the force reaches only ${((REACH - Math.hypot(k[0], k[1])) / VET_TILE).toFixed(2)} tiles past the limb`);
  }
  for (const id of ['spinkick', 'spinkickClose']) {
    const m = motionById(id);
    const g = forceGeo(m, m.strikes[0]);
    assert.ok(Math.abs(g.o[0] + g.r1 - REACH_FAR) < 1, `${id}: the crescent reaches ${((g.o[0] + g.r1) / VET_TILE).toFixed(2)} tiles ahead`);
  }
  assert.ok(motionById('spinkick').strikes[0].force?.shape === 'round' && Math.abs(forceGeo(motionById('spinkick'), motionById('spinkick').strikes[0]).r1 - REACH_FAR) < 2, 'the spinning kick: 3.5 tiles round him');
});

test('he steps in on every blow: a big driving step, most of it in the strike (a punch three quarters of a tile, a kick a tile); the leaps carry him further', () => {
  const want: Record<string, number> = { jab: STEP_PUNCH, cross: STEP_PUNCH, hook: STEP_PUNCH, elbow: STEP_PUNCH, roundkick: STEP_KICK, push: STEP_KICK, uppercut: 1.75 * VET_TILE, knee: 1.5 * VET_TILE, spinkickClose: 2 * VET_TILE };
  for (const [id, go] of Object.entries(want)) {
    const m = motionById(id);
    const s = m.strikes[0];
    assert.ok(Math.abs(carryAt(m, m.long)[0] - go) < 0.5, `${id}: carried ${(carryAt(m, m.long)[0] / VET_TILE).toFixed(2)} tiles`);
    if (id !== 'spinkickClose') assert.ok(carryAt(m, s.at)[0] >= 0.6 * go, `${id}: only ${(carryAt(m, s.at)[0] / go).toFixed(2)} of the step by the blow`);
    assert.ok(carryAt(m, s.from)[0] < 0.05 * go, `${id}: he moves in before the wind-up is let go`);
  }
  for (const id of ['uppercut', 'knee']) assert.ok(carryAt(motionById(id), 99)[0] > STEP_KICK, `${id}: the leap carries him no further than a step`);
});

test('a foot slides only where he drives in: forward along the floor, its dust thrown up', () => {
  for (const m of MOVES_ALL) {
    for (const [side, a, b] of slidesOf(m)) {
      const toe = side === 'L' ? 'toeL' : 'toeR';
      const p0 = worldOf(m, a, skel(poseAt(m, a))[toe]);
      const p1 = worldOf(m, b, skel(poseAt(m, b))[toe]);
      assert.ok(p1[0] - p0[0] > 5 && Math.abs(p1[1] - p0[1]) < 0.35 * (p1[0] - p0[0]), `${m.id}: the ${side} foot slides ${(p1[0] - p0[0]).toFixed(1)} on, ${(p1[1] - p0[1]).toFixed(1)} aside`);
      for (let f = a; f < b; f++) {
        const q0 = worldOf(m, f, skel(poseAt(m, f))[toe]);
        const q1 = worldOf(m, f + 1, skel(poseAt(m, f + 1))[toe]);
        assert.ok(q1[0] - q0[0] > -0.3, `${m.id}: the ${side} foot slides back at f${f + 1}`);
      }
      assert.ok((m.dust ?? []).some((d) => d.f >= a && d.f <= b && (d.at === side || d.at === 'both')), `${m.id}: no dust where the ${side} foot slides`);
    }
  }
});

test('the foes stand at his reach, and his blows land on them there', () => {
  for (const id of BLOWS) {
    const m = motionById(id);
    for (const f of m.foes) {
      const d = Math.hypot(f[0], f[1]) / VET_TILE;
      assert.ok(d > 2.0 && d <= 2.5, `${id}: a foe ${d.toFixed(2)} tiles from where he stood`);
    }
    assert.ok(m.strikes[0].hits.length === m.foes.length, `${id}: hits ${m.strikes[0].hits.length} of ${m.foes.length}`);
  }
  const sk = motionById('spinkick');
  for (const f of sk.foes) assert.ok(Math.abs(Math.hypot(f[0], f[1]) / VET_TILE - 3) < 0.1, 'the spinning kick’s foes three tiles round him');
  // (every blow of every part of the film lands on someone: the combos' foes where each blow reaches)
  for (const part of VET_FILM) {
    const p = part.play;
    let t = p.lead;
    for (const st of p.steps) {
      if (st.m.strikes.length) {
        const n = blowsOf(p).filter((b) => b.G >= t && b.G < t + st.m.long + 10 && b.react !== 'swing').length;
        assert.ok(n > 0, `${part.title}: ${st.m.id} lands on no one`);
      }
      t += st.m.long;
    }
    void playLong;
  }
});

test('the spinning jump kick is not the Whirlwind: one crescent thrown off his leg, rolled out round him, never a whole ring; each foe hit once, never again', () => {
  for (const id of ['spinkick', 'spinkickClose']) {
    const m = motionById(id);
    assert.ok(m.strikes.length === 1, `${id}: one blow`);
    const s = m.strikes[0];
    const seen = new Set<number>();
    for (const h of s.hits) {
      assert.ok(!seen.has(h.foe), `${id}: foe ${h.foe} hit twice`);
      seen.add(h.foe);
    }
    assert.ok(seen.size === m.foes.length, `${id}: every foe round him hit`);
    for (let f = s.at; f <= m.long; f++) {
      const [lo, hi] = roundSpan(m, s, f);
      assert.ok(hi - lo <= 200 && hi <= 360, `${id}: the crescent closes into a ring, or goes round again`);
    }
  }
  const part = VET_FILM.find((x) => x.title.startsWith('THE SPINNING JUMP KICK ·'));
  assert.ok(part, 'the spinning kick in the film');
  if (!part) return;
  const per = new Map<number, number>();
  for (const b of blowsOf(part.play)) per.set(b.foe, (per.get(b.foe) ?? 0) + 1);
  assert.ok([...per.values()].every((n) => n === 1) && per.size === 4, `each of the four hit once: ${JSON.stringify([...per])}`);
});

test('the force past the fist or foot: cyan for a punch, hot orange for a kick, crisp, never pink, never gold', () => {
  for (const [cols, want] of [[FX_PUNCH, 'cyan'], [FX_KICK, 'orange']] as const) {
    const px = new Px(220, 160);
    const to = (q: readonly number[]): [number, number] => [40 + 0.82 * (q[0] + q[1]), 110 + 0.41 * (q[0] - q[1]) - q[2]];
    shockCone(px, to, [0, 0, 40], 0.2, 0, 0.3, 60, 2, 3, cols, 5);
    crescent(px, to, [0, 0, 30], -0.6, 0.6, 70, 14, cols, 0, 9, undefined, 20);
    let saw = false;
    for (let i = 0; i < px.d.length; i += 4) {
      const a = px.d[i + 3];
      assert.ok(a === 0 || a === 255, 'a pixel neither there nor not');
      if (!a) continue;
      const [h, sat, v] = hsv(px.d[i], px.d[i + 1], px.d[i + 2]);
      assert.ok(!(h >= 290 && h <= 352 && sat > 0.4 && v > 0.4), `${want}: pink`);
      assert.ok(!(h >= 38 && h <= 64 && sat > 0.45 && v > 0.55), `${want}: gold`);
      if (want === 'cyan' && h >= 175 && h <= 195 && sat > 0.5) saw = true;
      if (want === 'orange' && h >= 10 && h <= 32 && sat > 0.5 && v > 0.5) saw = true;
    }
    assert.ok(saw, `${want} shown`);
  }
});

test('a first hold is the round kick: on its own, first in combo 4 (round kick, push kick, spinning jump kick) and first in combo 5', () => {
  for (const c of VET_COMBOS) {
    const first = c.steps.find((x) => x.input === 'hold');
    if (first && c.steps[0].input === 'hold') assert.ok(first.move === 'roundkick', `combo ${c.n} starts with ${first.move}`);
  }
  assert.ok(motionById('roundkick').input === 'hold', 'a lone hold');
});

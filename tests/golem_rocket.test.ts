// HER GOLEM'S ROCKET JUMP AND ITS RUN (dev/golem_rocket.ts, dev/golem_rocket_fx.ts; ready for the game, art/golem_rocket_fx.ts,
// behind GOLEM_ROCKET, off). Every frame through the Golem's own checks (tests/golem_moves.test.ts: the picture's checks, its
// body's, its giant arm clear of the rest of it), from in front and behind, turned eight ways; its stacks clear of its body;
// slick but for the blast and the slam (each a flash, his rulebook's Movement 9); its numbers the game's; its run's fist and
// feet gripping the floor at 5.5 tiles a second; its pieces crisp, the friend's cyan, no pink, no gold, nothing cut off, gone
// when done; the baked points the sculpture's own; nothing of the game importing it but what brings it in, behind its switch.

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { project } from '../src/art/skeleton';
import type { V3 } from '../src/art/skeleton';
import { UNITS_PER_TILE } from '../src/art/moves3';
import { LAST, primDist } from '../src/dev/sculpt';
import type { Sculpt } from '../src/dev/sculpt';
import { GOLEM_FIST, GOLEM_PICK, GOLEM_POSE, sculptGolemBuild } from '../src/dev/sculpt_golem';
import { GRUN, ROCKET, ROCKET_ARC, ROCKET_STRIKE, golemRocket, golemRun, rocketUp } from '../src/dev/golem_rocket';
import type { RocketPose } from '../src/dev/golem_rocket';
import { LAND_N, LAUNCH_N, PUFF_LIFE, liftOf } from '../src/dev/golem_rocket_fx';
import { GOLEM_ROCKET, RUN_STRIDE, golemRocketPiece, landPiece, launchPiece, puffPiece, rocketAtPiece, rocketTrail } from '../src/art/golem_rocket_fx';
import type { Piece } from '../src/art/golem_rocket_fx';
import { ROCKET_POINTS } from '../src/art/golem_rocket_points';
import { rocketPointsAt } from './golem_rocket_measure';
import { bodyFindings, pictureFindings } from './sculpt_checks';
import { paintWithoutCanvas } from './helpers';
import { Px } from '../src/engine/px';

paintWithoutCanvas();
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: { deepEqual(a: unknown, b: unknown, m?: string): void; ok(v: unknown, m?: string): void; equal(a: unknown, b: unknown, m?: string): void } = nodeAssert;
const TURNS = [0, 45, 90, 135, 180, 225, 270, 315];
const REST = { swing: 0, fold: 0, lean: 0, bob: 0, feet: [0, 0, 0, 0] as [number, number, number, number], level: 0, dim: 0, crumple: 0 };
const K = 0.82;

/** The Golem posed so, sculpted (turned `turn`, seen `view`), its pose put back after. */
function sculpt(q: RocketPose, view: 'front' | 'back', turn: number): { px: Px; sc: Sculpt } {
  Object.assign(GOLEM_POSE, REST, q);
  try {
    const d = sculptGolemBuild(view, GOLEM_PICK.build, turn, -14, true, 'cannon');
    return { px: d.px, sc: LAST.sc as Sculpt };
  } finally {
    Object.assign(GOLEM_POSE, REST);
    delete GOLEM_POSE.stacks;
    delete GOLEM_POSE.splay;
    delete GOLEM_POSE.flare;
    delete GOLEM_POSE.hips;
  }
}
/** Where its giant arm goes through the rest of it (as tests/golem_moves.test.ts). */
function armThrough(sc: Sculpt): string[] {
  const prims = sc.prims.filter((p) => !p.carve);
  const arm = prims.filter((p) => p.piece === 'giantR' && p.tag !== 'ball' && p.tag !== 'plate');
  const rest = prims.filter((p) => !p.piece.startsWith('giant') && p.piece !== 'stacks');
  const out: string[] = [];
  for (const g of arm) {
    const pts: V3[] = g.k === 'cone' ? (g.tag === 'upper' ? [0.5, 0.75, 1] : [0, 0.5, 1]).map((k) => [g.a[0] + (g.b[0] - g.a[0]) * k, g.a[1] + (g.b[1] - g.a[1]) * k, g.a[2] + (g.b[2] - g.a[2]) * k] as V3) : g.k === 'tri' ? [] : [g.c];
    for (const q of pts) for (const b of rest) if (primDist(b, q) < -0.5) out.push(`its giant arm's ${g.tag} through its ${b.piece} (${b.tag ?? b.k})`);
  }
  return [...new Set(out)];
}
/** Where its stacks, swung down, go through its body (their feet are rooted in it, as a stack's is). */
function stacksThrough(sc: Sculpt): string[] {
  const prims = sc.prims.filter((p) => !p.carve);
  const body = prims.filter((p) => (p.piece === 'torso' || p.piece === 'hips' || p.piece === 'head') && p.tag !== 'bezel' && p.tag !== 'window');
  const out: string[] = [];
  for (const s of prims.filter((p) => p.piece === 'stacks' && p.k === 'cone')) {
    if (s.k !== 'cone') continue;
    for (const u of s.tag === 'stack' ? [0.45, 0.7, 1] : [0.5]) {
      const q: V3 = [s.a[0] + (s.b[0] - s.a[0]) * u, s.a[1] + (s.b[1] - s.a[1]) * u, s.a[2] + (s.b[2] - s.a[2]) * u];
      for (const b of body) if (primDist(b, q) < -0.5) out.push(`its stack's ${s.tag} through its ${b.piece} (${b.tag ?? b.k})`);
    }
  }
  return [...new Set(out)];
}
const lowest = (sc: Sculpt): number => {
  let lo = Infinity;
  for (const p of sc.prims) {
    if (p.carve) continue;
    const z = p.k === 'cone' ? Math.min(p.a[2] - p.ra, p.b[2] - p.rb) : p.k === 'tri' ? Math.min(p.a[2], p.b[2], p.c[2]) - p.thick : p.c[2] - Math.hypot(p.axes[0][2], p.axes[1][2], p.axes[2][2]);
    lo = Math.min(lo, z);
  }
  return lo;
};
const inFlight = (f: number): boolean => f > ROCKET.blast && f < ROCKET.land;

test('the rocket jump: every frame crisp, the friend’s edge, no pixel alone, nothing pink, nothing cut off; nothing sunk, on its feet (in the air, nothing under the floor beneath it); its giant arm and its stacks clear of the rest of it: from in front and behind, turned eight ways', () => {
  const found: string[] = [];
  for (const view of ['front', 'back'] as const) {
    for (const turn of TURNS) {
      for (let f = 0; f <= ROCKET.end; f++) {
        const { px, sc } = sculpt(golemRocket(f), view, turn);
        const at = `${view}, turned ${turn}, frame ${f}`;
        for (const x of pictureFindings(px)) found.push(`${at}: ${x}`);
        for (const x of bodyFindings(sc, true)) {
          // (in the air it stands on nothing: it is lifted liftOf(f) over the floor, the game lifting its picture)
          if (inFlight(f) && (x.startsWith('standing on nothing') || x.startsWith('sunk into the floor'))) continue;
          found.push(`${at}: ${x}`);
        }
        if (inFlight(f) && lowest(sc) + liftOf(f) < -0.35) found.push(`${at}: under the floor beneath it`);
        if (turn === 0) for (const x of [...armThrough(sc), ...stacksThrough(sc)]) found.push(`${at}: ${x}`);
      }
    }
  }
  assert.deepEqual([...new Set(found)], []);
});

test('the rocket jump: slick (its fist and its eye never leap, stall or turn straight back at speed, as they go up and down with it), but for the blast and the slam; its fist braced still as it crouches and as it takes the blow; at rest at its start and its end', () => {
  const found: string[] = [];
  const fist: V3[] = [];
  const eye: V3[] = [];
  for (let f = 0; f <= ROCKET.end; f++) {
    const { sc } = sculpt(golemRocket(f), 'front', 0);
    const lift = liftOf(f);
    fist.push([GOLEM_FIST.c[0], GOLEM_FIST.c[1], GOLEM_FIST.c[2] + lift]);
    const lens = sc.prims.find((p) => p.tag === 'lens');
    eye.push(lens && lens.k !== 'cone' && lens.k !== 'tri' ? [lens.c[0], lens.c[1], lens.c[2] + lift] : [0, 0, 0]);
    // (sculpt left GOLEM_FIST where it drew it: the fist's middle as built)
    void sc;
  }
  for (const [name, pts] of [['its fist', fist], ['its eye', eye]] as const) {
    for (const view of ['front', 'back'] as const) {
      const xy = pts.map((p) => project(p, view));
      const st = xy.slice(1).map((p, i) => [p[0] - xy[i][0], p[1] - xy[i][1]] as const);
      const sp = st.map(([x, y]) => Math.hypot(x, y));
      for (let i = 1; i < sp.length - 1; i++) {
        if (ROCKET_STRIKE.some(([a, b]) => i >= a - 1 && i <= b + 1)) continue;
        const a = sp[i - 1], b = sp[i], c = sp[i + 1];
        if (b > 4 && b > 2.2 * Math.max(a, c)) found.push(`${name} leaps ${b.toFixed(1)} at frame ${i} (${view})`);
        if (a > 2.5 && c > 2.5 && b < 0.6 * Math.min(a, c)) found.push(`${name} stalls at frame ${i} (${view})`);
        const sa = st[i - 1], sb = st[i];
        if ((sa[0] * sb[0] + sa[1] * sb[1]) / (Math.hypot(...sa) * Math.hypot(...sb) || 1) < -0.5 && a > 3 && b > 3) found.push(`${name} turns straight back at speed at frame ${i} (${view})`);
      }
      if (sp[0] > 3) found.push(`${name} starts at speed (${view})`);
      if (sp[sp.length - 1] > 0.5) found.push(`${name} still moving at its end (${view})`);
    }
  }
  for (const [a, b] of [[ROCKET.crouch, ROCKET.blast - 1], [ROCKET.land, ROCKET.rise - 4]]) {
    const held = fist.slice(a, b + 1);
    const moved = Math.max(...held.map((p) => Math.hypot(p[0] - held[0][0], p[1] - held[0][1], p[2] - held[0][2])));
    if (moved > 0.6) found.push(`its braced fist moves ${moved.toFixed(2)} from frame ${a} to ${b}`);
  }
  assert.deepEqual(found, []);
});

test('the rocket jump’s numbers: in the air 0.7 s (21 frames), 92 game pixels up at the top (his “Yes, but higher”: twice the stand-in’s 46), flung up fast and falling like a stone; the blast and the slam each a flash; it starts and ends standing as it stands', () => {
  assert.equal(ROCKET.flight, 21);
  assert.equal(ROCKET.land, ROCKET.blast + ROCKET.flight);
  assert.equal(ROCKET_ARC.high, 92);
  const ups = Array.from({ length: ROCKET.flight + 1 }, (_, k) => rocketUp(k));
  assert.equal(ups[0], 0);
  assert.equal(ups[ROCKET.flight], 0);
  const top = Math.max(...Array.from({ length: 2101 }, (_, i) => rocketUp(i / 100)));
  assert.ok(Math.abs(top - 92) < 0.01, `its top ${top}`);
  assert.ok(ups[1] >= 20, `flung up ${ups[1].toFixed(1)} game pixels in its first frame`);
  // (falling: faster every frame from its top to the floor)
  const topK = Math.ceil(ROCKET_ARC.top * ROCKET.flight);
  for (let k = topK + 1; k < ROCKET.flight; k++) assert.ok(ups[k] - ups[k + 1] > ups[k - 1] - ups[k] - 1e-9, `falls faster at ${k}`);
  for (const [a, b] of ROCKET_STRIKE) assert.ok(b - a <= 3, 'a strike is a flash');
  const start = golemRocket(0);
  assert.ok(start.lean === 0 && start.bob === 0 && start.stacks === 0 && start.flare === 0 && start.feet.every((v) => v === 0), 'stands as it stands at its start');
  const end = golemRocket(ROCKET.end);
  assert.ok(Math.abs(end.lean) < 1e-9 && Math.abs(end.bob) < 1e-9 && end.stacks === 0 && end.flare === 0, 'stands as it stands at its end');
});

test('standing, with its rocket’s own numbers naught, it is the Golem it was, to the pixel', () => {
  for (const view of ['front', 'back'] as const) {
    for (const turn of [45, 135]) {
      Object.assign(GOLEM_POSE, REST);
      const was = sculptGolemBuild(view, GOLEM_PICK.build, turn, -14, true, 'cannon').px.d.slice();
      const now = sculpt({ ...REST, stacks: 0, splay: 0, flare: 0, hips: 0 } as RocketPose, view, turn).px.d;
      assert.ok(was.length === now.length && was.every((v, i) => v === now[i]), `${view} ${turn}`);
    }
  }
});

test('its run at 5.5 tiles a second: every frame through the checks (in a bound it is off the floor, a little: under 8 picture pixels), from in front and behind, turned eight ways; its fist and feet grip the floor while down; its fist and eye slick round and round; no scurry (under 2.5 rounds a second)', () => {
  const found: string[] = [];
  for (const view of ['front', 'back'] as const) {
    for (const turn of TURNS) {
      for (let f = 0; f < GRUN.round; f++) {
        const { px, sc } = sculpt(golemRun(f), view, turn);
        const at = `${view}, turned ${turn}, frame ${f}`;
        for (const x of pictureFindings(px)) found.push(`${at}: ${x}`);
        for (const x of bodyFindings(sc, true)) {
          if (x.startsWith('standing on nothing') && lowest(sc) < 8) continue;
          found.push(`${at}: ${x}`);
        }
        if (turn === 0) for (const x of armThrough(sc)) found.push(`${at}: ${x}`);
      }
    }
  }
  const fist: V3[] = [];
  const eye: V3[] = [];
  const feet: V3[][] = [];
  for (let f = 0; f < GRUN.round; f++) {
    const { sc } = sculpt(golemRun(f), 'front', 0);
    fist.push([...GOLEM_FIST.c] as V3);
    const e = sc.prims.find((p) => p.tag === 'lens');
    eye.push(e && e.k !== 'cone' && e.k !== 'tri' ? ([...e.c] as V3) : [0, 0, 0]);
    feet.push(sc.prims.filter((p) => p.tag === 'foot' && p.k === 'box').map((p) => [...(p as { c: V3 }).c] as V3));
  }
  const a = (-14 * Math.PI) / 180;
  const FW: V3 = [Math.SQRT1_2 * Math.cos(a) + Math.SQRT1_2 * Math.sin(a), -Math.SQRT1_2 * Math.cos(a) + Math.SQRT1_2 * Math.sin(a), 0];
  const v = (GRUN.speed * UNITS_PER_TILE) / 30;
  const world = (p: V3, f: number): V3 => [p[0] + FW[0] * v * f, p[1] + FW[1] * v * f, p[2]];
  for (let f = 0; f < GRUN.round; f++) {
    const g = (f + 1) % GRUN.round;
    const pairs: [string, V3, V3, number][] = [['its fist', fist[f], fist[g], 12.8 * K + 0.6]];
    feet[f].forEach((p, i) => pairs.push([`its foot ${i}`, p, feet[g][i], 2.2 * K + 0.6]));
    for (const [name, p, q, low] of pairs) {
      if (p[2] > low || q[2] > low) continue;
      const slide = Math.hypot(world(q, f + 1)[0] - world(p, f)[0], world(q, f + 1)[1] - world(p, f)[1]);
      if (slide > 0.55) found.push(`${name} slides ${slide.toFixed(2)} along the floor at frame ${f}`);
    }
  }
  // (each down for a while each round: it runs on them, not on air)
  const downs = (pts: V3[], low: number): number => pts.filter((p) => p[2] <= low).length;
  if (downs(fist, 12.8 * K + 0.6) < 3) found.push('its fist hardly down');
  for (let i = 0; i < 2; i++) if (downs(feet.map((q) => q[i]), 2.2 * K + 0.6) < 2) found.push(`its foot ${i} hardly down`);
  for (const [name, pts] of [['its fist', fist], ['its eye', eye]] as const) {
    for (const view of ['front', 'back'] as const) {
      // (as the floor sees it: carried along as the game carries it)
      const xy = [...pts, pts[0]].map((p, f) => project(world(p, f), view));
      const st = xy.slice(1).map((p, i) => [p[0] - xy[i][0], p[1] - xy[i][1]] as const);
      const sp = st.map(([x, y]) => Math.hypot(x, y));
      const N = sp.length;
      for (let i = 0; i < N; i++) {
        const pa = sp[(i - 1 + N) % N], b = sp[i], c = sp[(i + 1) % N];
        if (b > 4 && b > 2.2 * Math.max(pa, c)) found.push(`${name} leaps ${b.toFixed(1)} at frame ${i} (${view})`);
        if (pa > 2.5 && c > 2.5 && b < 0.6 * Math.min(pa, c)) found.push(`${name} stalls at frame ${i} (${view})`);
      }
    }
  }
  if (GRUN.speed / RUN_STRIDE > 2.5) found.push(`${(GRUN.speed / RUN_STRIDE).toFixed(2)} rounds a second`);
  if (Math.abs(RUN_STRIDE - (GRUN.round / 30) * 5.5) > 1e-9 || GRUN.speed !== 5.5) found.push('not the game’s pace');
  assert.deepEqual([...new Set(found)], []);
});

/** Its pixels' findings as an effect: crisp (each there or not), nothing pink, nothing gold, nothing cut off at its canvas's edge. */
function fxFindings(p: Piece, what: string): string[] {
  const out: string[] = [];
  const { w, h, d } = p.px;
  let fuzzy = 0, pink = 0, gold = 0, edge = 0, alone = 0;
  const on = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] > 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    if (!d[i + 3]) continue;
    if (d[i + 3] !== 255) fuzzy++;
    if (x < 2 || y < 2 || x > w - 3 || y > h - 3) edge++;
    if (!on(x - 1, y) && !on(x + 1, y) && !on(x, y - 1) && !on(x, y + 1)) alone++;
    const r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    const s = mx ? (mx - mn) / mx : 0;
    let hu = 0;
    if (mx !== mn) hu = mx === r ? (60 * ((g - b) / (mx - mn)) + 360) % 360 : mx === g ? 60 * ((b - r) / (mx - mn)) + 120 : 60 * ((r - g) / (mx - mn)) + 240;
    if (hu >= 300 && hu <= 352 && s > 0.45 && mx > 0.5) pink++;
    if (hu >= 30 && hu <= 62 && s > 0.45 && mx > 0.5) gold++;
  }
  if (fuzzy) out.push(`${what}: ${fuzzy} pixels neither there nor not`);
  if (pink) out.push(`${what}: ${pink} pixels of the enemy's pink`);
  if (gold) out.push(`${what}: ${gold} pixels of the enemy's gold`);
  if (edge) out.push(`${what}: cut off at its canvas's edge (${edge} pixels)`);
  if (alone) out.push(`${what}: ${alone} pixels alone`);
  return out;
}
const count = (p: Piece): number => {
  let n = 0;
  for (let i = 3; i < p.px.d.length; i += 4) if (p.px.d[i]) n++;
  return n;
};
const cyan = (p: Piece): number => {
  let n = 0;
  for (let i = 0; i < p.px.d.length; i += 4) if (p.px.d[i + 3] && p.px.d[i + 2] > 180 && p.px.d[i + 1] > 180 && p.px.d[i] < 200) n++;
  return n;
};

test('its pieces, every frame, from in front and behind: crisp, no pink, no gold, nothing cut off; the friend’s cyan at its blast; nothing at it in the air on the floor; all gone when done', () => {
  const found: string[] = [];
  for (const view of ['front', 'back'] as const) {
    for (let f = 0; f <= ROCKET.end; f++) {
      const p = rocketAtPiece(view, f);
      for (const [n, q] of [['floor', p.floor], ['behind', p.behind], ['over', p.over]] as const) found.push(...fxFindings(q, `${view} at it ${n} ${f}`));
      if (inFlight(f) && count(p.floor)) found.push(`${view}: something on the floor at it in the air, frame ${f}`);
    }
    const blast = rocketAtPiece(view, ROCKET.blast);
    if (cyan(blast.behind) + cyan(blast.over) < 150) found.push(`${view}: its blast hardly lit`);
    const flying = rocketAtPiece(view, ROCKET.blast + 6);
    if (cyan(flying.behind) + cyan(flying.over) < 60) found.push(`${view}: no flames as it flies`);
    for (let k = 0; k <= LAUNCH_N; k++) {
      const p = launchPiece(view, 'cannon', k);
      found.push(...fxFindings(p.floor, `${view} launch floor ${k}`), ...fxFindings(p.air, `${view} launch air ${k}`));
      if (k === LAUNCH_N && count(p.floor) + count(p.air)) found.push(`${view}: its take-off not gone at ${k}`);
      if (k === 0 && cyan(p.air) < 200) found.push(`${view}: its take-off's flash hardly lit`);
    }
    for (let k = 0; k <= LAND_N; k++) {
      const p = landPiece(view, k);
      found.push(...fxFindings(p.floor, `${view} land floor ${k}`), ...fxFindings(p.air, `${view} land air ${k}`));
      if (k === LAND_N && count(p.floor) + count(p.air)) found.push(`${view}: its landing not gone at ${k}`);
      if (k === 2 && count(p.floor) < 400) found.push(`${view}: hardly a crater`);
    }
  }
  for (let v = 0; v < 3; v++) for (let age = 0; age <= PUFF_LIFE; age++) {
    const p = puffPiece(v, age);
    found.push(...fxFindings(p, `puff ${v} ${age}`));
    if (age === PUFF_LIFE && count(p)) found.push(`puff ${v} not gone`);
  }
  // (its own picture through its jump: the friend's cyan the only glow, no pink: the picture's checks, above)
  assert.ok(count(golemRocketPiece('front', 'cannon', 0)) > 1000);
  assert.deepEqual([...new Set(found)], []);
});

test('its trail: only where it has been (between where it took off and where it is), each puff aging and gone, none after its last', () => {
  const found: string[] = [];
  for (const [dx, dy] of [[6, 0], [0, -4], [-3, 5], [5.6, 5.6]]) {
    for (const flip of [false, true]) for (const view of ['front', 'back'] as const) {
      const len = Math.hypot(dx, dy);
      for (let k = 0; k <= ROCKET.flight + PUFF_LIFE + 2; k++) {
        const ps = rocketTrail(view, flip, dx, dy, k);
        if (k > ROCKET.flight + PUFF_LIFE && ps.length) found.push(`puffs left at ${k}`);
        if (k >= 2 && k <= 12 && ps.length < 2 * (k - 1)) found.push(`too few puffs at ${k}`);
        const along = Math.min(1, k / ROCKET.flight) * len;
        for (const p of ps) {
          if (p.age < 0 || p.age >= PUFF_LIFE) found.push(`a puff aged ${p.age}`);
          const s = (p.x * dx + p.y * dy) / len;
          if (s > along + 1.2 || s < -1.2) found.push(`a puff ${s.toFixed(2)} along at ${k} (it at ${along.toFixed(2)})`);
          if (p.up < 0) found.push('a puff under the floor');
        }
      }
    }
  }
  assert.deepEqual([...new Set(found)], []);
});

test('the baked points (art/golem_rocket_points.ts) are the sculpture’s own', () => {
  assert.equal(ROCKET_POINTS.n, ROCKET.end + 1);
  for (const f of [0, 4, ROCKET.lock, 12, ROCKET.blast, 18, 25, 31, ROCKET.land - 1, ROCKET.land, 44, 50, ROCKET.end]) {
    const m = rocketPointsAt(f);
    const b = ROCKET_POINTS.v.slice(f * ROCKET_POINTS.per, (f + 1) * ROCKET_POINTS.per);
    assert.equal(m.length, ROCKET_POINTS.per);
    m.forEach((v, i) => assert.ok(Math.abs(v - b[i]) < 0.002, `frame ${f}, number ${i}: ${v} baked ${b[i]} (run npx tsx tools/bake_golem_rocket.ts)`));
  }
});

test('behind its switch, off; and nothing of the game imports it but what brings it in (the main chat, 3 Nov 2026, behind the switch)', () => {
  assert.equal(GOLEM_ROCKET.on, false);
  // (brought in by the main chat as its README's “Bringing it in” says, every use of it behind GOLEM_ROCKET: its rules, its
  // pictures, what it leaves where it took off and came down, its switch for playtests; tests/tinkerer.test.ts its rules)
  const BRINGS = ['src/game/game.ts', 'src/game/tinkerer.ts', 'src/render/render.ts', 'src/render/tinkerer_fx.ts', 'src/main.ts'];
  const walk = (dir: string): string[] => readdirSync(dir).flatMap((n: string) => {
    const p = `${dir}/${n}`;
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.ts') ? [p] : [];
  });
  const found: string[] = [];
  for (const file of walk('src')) {
    if (file.startsWith('src/dev/') || file === 'src/art/golem_rocket_fx.ts' || file === 'src/art/golem_rocket_points.ts' || BRINGS.includes(file)) continue;
    const text = readFileSync(file, 'utf8');
    // (what imports it: a word of it in a note is no import)
    if (/from ['"][^'"]*golem_rocket/.test(text)) found.push(file);
  }
  assert.deepEqual(found, []);
});

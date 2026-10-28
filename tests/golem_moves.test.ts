// HER GOLEM'S GROUND POUND (dev/golem_moves.ts, dev/sculpt_golem.ts GOLEM_POSE): every frame of it, as the heroes' moves
// are checked: the picture's own checks (crisp, the friend's edge, no pixel alone, nothing pink, nothing cut off); nothing
// of it sunk into the floor and its feet on it; its giant arm never through its body, its head or its legs; slick (his
// art rulebook's Movement: nothing of it leaps, stalls or turns straight back at speed, but for the hammer's fall itself,
// a flash: Movement 9); from in front and behind, turned eight ways. And standing, it is the Golem he picked, to the pixel.

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import { createHash } from 'node:crypto';
import { project } from '../src/art/skeleton';
import type { V3 } from '../src/art/skeleton';
import { LAST, primDist } from '../src/dev/sculpt';
import type { Sculpt } from '../src/dev/sculpt';
import { GOLEM_FIST, GOLEM_GUN, GOLEM_PICK, GOLEM_POSE, sculptGolemBuild } from '../src/dev/sculpt_golem';
import { GDOWN, GDOWN_STRIKE, GP, GPUNCH, GPUNCH_STRIKE, GP_STRIKE, GWALK, golemDown, golemPunch, golemWalk, groundPound } from '../src/dev/golem_moves';
import { bodyFindings, pictureFindings } from './sculpt_checks';
import { paintWithoutCanvas } from './helpers';

paintWithoutCanvas();
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: { deepEqual(a: unknown, b: unknown, m?: string): void; ok(v: unknown, m?: string): void } = nodeAssert;
const TURNS = [0, 45, 90, 135, 180, 225, 270, 315];
const FRAMES = Array.from({ length: GP.end + 1 }, (_, f) => f);

/** Where its giant arm goes through the rest of it (its shoulder's ball and plate are rooted in it, as a shoulder is). */
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

test('the Golem’s ground pound: every frame crisp, the friend’s edge, no pixel alone, nothing pink, nothing cut off; nothing sunk, on its feet; its giant arm clear of the rest of it: from in front and behind, turned eight ways', () => {
  const found: string[] = [];
  try {
    for (const view of ['front', 'back'] as const) {
      for (const turn of TURNS) {
        for (const f of FRAMES) {
          Object.assign(GOLEM_POSE, groundPound(f));
          const d = sculptGolemBuild(view, GOLEM_PICK.build, turn, -14, true, GOLEM_GUN.gun);
          const at = `${view}, turned ${turn}, frame ${f}`;
          for (const x of pictureFindings(d.px)) found.push(`${at}: ${x}`);
          const sc = LAST.sc as Sculpt;
          for (const x of bodyFindings(sc, true)) found.push(`${at}: ${x}`);
          if (turn === 0) for (const x of armThrough(sc)) found.push(`${at}: ${x}`);
        }
      }
    }
  } finally {
    Object.assign(GOLEM_POSE, { swing: 0, fold: 0, lean: 0, bob: 0, feet: [0, 0, 0, 0], level: 0 });
  }
  assert.deepEqual([...new Set(found)], []);
});

test('the Golem’s ground pound: slick (its fist and its head never leap, stall or turn straight back at speed, but for the hammer’s fall itself); nor starts or stops at its fastest', () => {
  const found: string[] = [];
  const fist: V3[] = [];
  const head: V3[] = [];
  try {
    for (const f of FRAMES) {
      Object.assign(GOLEM_POSE, groundPound(f));
      sculptGolemBuild('front', GOLEM_PICK.build, 0, -14, true, GOLEM_GUN.gun);
      fist.push([...GOLEM_FIST.c] as V3);
      const eye = (LAST.sc as Sculpt).prims.find((p) => p.tag === 'lens');
      head.push(eye && eye.k !== 'cone' && eye.k !== 'tri' ? ([...eye.c] as V3) : [0, 0, 0]);
    }
  } finally {
    Object.assign(GOLEM_POSE, { swing: 0, fold: 0, lean: 0, bob: 0, feet: [0, 0, 0, 0], level: 0 });
  }
  for (const [name, pts] of [['its fist', fist], ['its eye', head]] as const) {
    for (const view of ['front', 'back'] as const) {
      const xy = pts.map((p) => project(p, view));
      const st = xy.slice(1).map((p, i) => [p[0] - xy[i][0], p[1] - xy[i][1]] as const);
      const sp = st.map(([x, y]) => Math.hypot(x, y));
      const N = sp.length;
      for (let i = 1; i < N - 1; i++) {
        if (i >= GP_STRIKE[0] - 1 && i <= GP_STRIKE[1]) continue;
        const a = sp[i - 1], b = sp[i], c = sp[i + 1];
        if (b > 4 && b > 2.2 * Math.max(a, c)) found.push(`${name} leaps ${b.toFixed(1)} at frame ${i} (${view})`);
        if (a > 2.5 && c > 2.5 && b < 0.6 * Math.min(a, c)) found.push(`${name} stalls at frame ${i} (${view})`);
        const sa = st[i - 1], sb = st[i];
        if ((sa[0] * sb[0] + sa[1] * sb[1]) / (Math.hypot(...sa) * Math.hypot(...sb) || 1) < -0.5 && a > 3 && b > 3) found.push(`${name} turns straight back at speed at frame ${i} (${view})`);
      }
      if (sp[0] > 3 && sp[0] >= 0.95 * Math.max(...sp.slice(0, 4))) found.push(`${name} starts at its fastest (${view})`);
      if (sp[N - 1] > 3 && sp[N - 1] >= 0.95 * Math.max(...sp.slice(-4))) found.push(`${name} stops dead from its fastest (${view})`);
    }
  }
  assert.deepEqual(found, []);
});

test('standing, it is the Golem he picked, to the pixel (its picture before it could move, 28 Oct)', () => {
  Object.assign(GOLEM_POSE, { swing: 0, fold: 0, lean: 0, bob: 0, feet: [0, 0, 0, 0], level: 0 });
  for (const view of ['front', 'back'] as const) {
    const d = sculptGolemBuild(view, GOLEM_PICK.build, 0, -14, true, 'pincer').px.d;
    assert.ok(createHash('sha256').update(d).digest('hex').slice(0, 16) === PICKED[view], view);
  }
});
const PICKED = { front: 'd91e3e242eb05150', back: 'ac00382a54c76bec' };

// ITS WALK, knuckling along on its giant fist (dev/golem_moves.ts golemWalk): every frame of a round, as above; and its fist
// and its feet grip the floor while down, keeping pace with it as the game carries it along (his rulebook's Movement 8).
test('the Golem’s walk: every frame crisp, the friend’s edge, no pixel alone, nothing pink, nothing cut off; nothing sunk, on its feet; its giant arm clear of the rest of it: from in front and behind, turned eight ways', () => {
  const found: string[] = [];
  try {
    for (const view of ['front', 'back'] as const) {
      for (const turn of TURNS) {
        for (let f = 0; f < GWALK.round; f++) {
          Object.assign(GOLEM_POSE, golemWalk(f));
          const d = sculptGolemBuild(view, GOLEM_PICK.build, turn, -14, true, GOLEM_GUN.gun);
          const at = `${view}, turned ${turn}, frame ${f}`;
          for (const x of pictureFindings(d.px)) found.push(`${at}: ${x}`);
          const sc = LAST.sc as Sculpt;
          for (const x of bodyFindings(sc, true)) found.push(`${at}: ${x}`);
          if (turn === 0) for (const x of armThrough(sc)) found.push(`${at}: ${x}`);
        }
      }
    }
  } finally {
    Object.assign(GOLEM_POSE, { swing: 0, fold: 0, lean: 0, bob: 0, feet: [0, 0, 0, 0], level: 0 });
  }
  assert.deepEqual([...new Set(found)], []);
});

test('the Golem’s walk: its fist and its feet stay where they are on the floor while down; its fist and its eye slick, round and round', () => {
  const found: string[] = [];
  const v = GWALK.speed / 30;
  const fist: V3[] = [];
  const eye: V3[] = [];
  const feet: V3[][] = [];
  try {
    for (let f = 0; f < GWALK.round; f++) {
      Object.assign(GOLEM_POSE, golemWalk(f));
      sculptGolemBuild('front', GOLEM_PICK.build, 0, -14, true, GOLEM_GUN.gun);
      const sc = LAST.sc as Sculpt;
      fist.push([...GOLEM_FIST.c] as V3);
      const e = sc.prims.find((p) => p.tag === 'lens');
      eye.push(e && e.k !== 'cone' && e.k !== 'tri' ? ([...e.c] as V3) : [0, 0, 0]);
      feet.push(sc.prims.filter((p) => p.tag === 'foot' && p.k === 'box').map((p) => [...(p as { c: V3 }).c] as V3));
    }
  } finally {
    Object.assign(GOLEM_POSE, { swing: 0, fold: 0, lean: 0, bob: 0, feet: [0, 0, 0, 0], level: 0 });
  }
  // (its own forward, as it was built, at its size: the way the game carries it)
  const a = (-14 * Math.PI) / 180;
  const FW: V3 = [Math.SQRT1_2 * Math.cos(a) + Math.SQRT1_2 * Math.sin(a), -Math.SQRT1_2 * Math.cos(a) + Math.SQRT1_2 * Math.sin(a), 0];
  const K = 0.82;
  const world = (p: V3, f: number): V3 => [p[0] + FW[0] * v * f * K, p[1] + FW[1] * v * f * K, p[2]];
  for (let f = 0; f < GWALK.round - 1; f++) {
    const pairs: [string, V3, V3, number][] = [['its fist', fist[f], fist[f + 1], 12.8 * K + 0.6]];
    feet[f].forEach((p, i) => pairs.push([`its foot ${i}`, p, feet[f + 1][i], 2.2 * K + 0.6]));
    for (const [name, p, q, low] of pairs) {
      if (p[2] > low || q[2] > low) continue;
      const slide = Math.hypot(world(q, f + 1)[0] - world(p, f)[0], world(q, f + 1)[1] - world(p, f)[1]);
      if (slide > 0.55) found.push(`${name} slides ${slide.toFixed(2)} along the floor at frame ${f}`);
    }
  }
  for (const [name, pts] of [['its fist', fist], ['its eye', eye]] as const) {
    for (const view of ['front', 'back'] as const) {
      const xy = pts.map((p) => project(p, view));
      xy.push(xy[0]);
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
  assert.deepEqual(found, []);
});

// ITS PUNCH (dev/golem_moves.ts golemPunch): every frame, as its ground pound.
test('the Golem’s punch: every frame crisp, the friend’s edge, no pixel alone, nothing pink, nothing cut off; nothing sunk, on its feet; its giant arm clear of the rest of it: from in front and behind, turned eight ways; and slick but for the blow itself', () => {
  const found: string[] = [];
  const fist: V3[] = [];
  try {
    for (const view of ['front', 'back'] as const) {
      for (const turn of TURNS) {
        for (let f = 0; f <= GPUNCH.end; f++) {
          Object.assign(GOLEM_POSE, golemPunch(f));
          const d = sculptGolemBuild(view, GOLEM_PICK.build, turn, -14, true, GOLEM_GUN.gun);
          const at = `${view}, turned ${turn}, frame ${f}`;
          for (const x of pictureFindings(d.px)) found.push(`${at}: ${x}`);
          const sc = LAST.sc as Sculpt;
          for (const x of bodyFindings(sc, true)) found.push(`${at}: ${x}`);
          if (turn === 0) {
            for (const x of armThrough(sc)) found.push(`${at}: ${x}`);
            if (view === 'front') fist.push([...GOLEM_FIST.c] as V3);
          }
        }
      }
    }
  } finally {
    Object.assign(GOLEM_POSE, { swing: 0, fold: 0, lean: 0, bob: 0, feet: [0, 0, 0, 0], level: 0 });
  }
  for (const view of ['front', 'back'] as const) {
    const xy = fist.map((p) => project(p, view));
    const st = xy.slice(1).map((p, i) => [p[0] - xy[i][0], p[1] - xy[i][1]] as const);
    const sp = st.map(([x, y]) => Math.hypot(x, y));
    for (let i = 1; i < sp.length - 1; i++) {
      if (i >= GPUNCH_STRIKE[0] - 1 && i <= GPUNCH_STRIKE[1] + 1) continue;
      const a = sp[i - 1], b = sp[i], c = sp[i + 1];
      if (b > 4 && b > 2.2 * Math.max(a, c)) found.push(`its fist leaps ${b.toFixed(1)} at frame ${i} (${view})`);
      if (a > 2.5 && c > 2.5 && b < 0.6 * Math.min(a, c)) found.push(`its fist stalls at frame ${i} (${view})`);
    }
  }
  assert.deepEqual([...new Set(found)], []);
});

// ITS END, WINDING DOWN AND CRASHING (dev/golem_moves.ts golemDown): every frame, as above, turned eight ways (turned 135, truly
// from behind as the film shows it); its fist and its eye slick
// but for the blow's jolt and its crash (each a flash); its light going out (its eye and heart dark at the end)
test('the Golem winding down and crashing: every frame crisp, the friend’s edge, no pixel alone, nothing pink, nothing cut off; nothing sunk, on its feet; its giant arm clear of the rest of it: from in front and behind, turned eight ways; slick but for the blow and its crash', () => {
  const found: string[] = [];
  const fist: V3[] = [];
  const eye: V3[] = [];
  try {
    for (const view of ['front', 'back'] as const) {
      for (const turn of TURNS) {
        for (let f = 0; f <= GDOWN.end; f++) {
          Object.assign(GOLEM_POSE, golemDown(f));
          const d = sculptGolemBuild(view, GOLEM_PICK.build, turn, -14, true, GOLEM_GUN.gun);
          const at = `${view}, turned ${turn}, frame ${f}`;
          for (const x of pictureFindings(d.px)) found.push(`${at}: ${x}`);
          const sc = LAST.sc as Sculpt;
          for (const x of bodyFindings(sc, true)) found.push(`${at}: ${x}`);
          if (turn === 0) {
            for (const x of armThrough(sc)) found.push(`${at}: ${x}`);
            if (view === 'front') {
              fist.push([...GOLEM_FIST.c] as V3);
              const lens = sc.prims.find((p) => p.tag === 'lens');
              eye.push(lens && lens.k !== 'cone' && lens.k !== 'tri' ? ([...lens.c] as V3) : [0, 0, 0]);
            }
          }
        }
      }
    }
  } finally {
    Object.assign(GOLEM_POSE, { swing: 0, fold: 0, lean: 0, bob: 0, feet: [0, 0, 0, 0], level: 0, dim: 0, crumple: 0 });
  }
  for (const [name, pts] of [['its fist', fist], ['its eye', eye]] as const) {
    for (const view of ['front', 'back'] as const) {
      const xy = pts.map((p) => project(p, view));
      const st = xy.slice(1).map((p, i) => [p[0] - xy[i][0], p[1] - xy[i][1]] as const);
      const sp = st.map(([x, y]) => Math.hypot(x, y));
      for (let i = 1; i < sp.length - 1; i++) {
        if (GDOWN_STRIKE.some(([a, b]) => i >= a - 1 && i <= b + 1)) continue;
        const a = sp[i - 1], b = sp[i], c = sp[i + 1];
        if (b > 4 && b > 2.2 * Math.max(a, c)) found.push(`${name} leaps ${b.toFixed(1)} at frame ${i} (${view})`);
        if (a > 2.5 && c > 2.5 && b < 0.6 * Math.min(a, c)) found.push(`${name} stalls at frame ${i} (${view})`);
        const sa = st[i - 1], sb = st[i];
        if ((sa[0] * sb[0] + sa[1] * sb[1]) / (Math.hypot(...sa) * Math.hypot(...sb) || 1) < -0.5 && a > 3 && b > 3) found.push(`${name} turns straight back at speed at frame ${i} (${view})`);
      }
      if (sp[0] > 3 && sp[0] >= 0.95 * Math.max(...sp.slice(0, 4))) found.push(`${name} starts at its fastest (${view})`);
      if (sp[sp.length - 1] > 3) found.push(`${name} still moving at its end (${view})`);
    }
  }
  // (and its light out at the end: its eye and its heart, every pixel of them that its light would paint, dark glass)
  try {
    Object.assign(GOLEM_POSE, { ...golemDown(GDOWN.end), dim: 0 });
    const lit = sculptGolemBuild('front', GOLEM_PICK.build, 0, -14, true, GOLEM_GUN.gun).px.d.slice();
    Object.assign(GOLEM_POSE, golemDown(GDOWN.end));
    const out = sculptGolemBuild('front', GOLEM_PICK.build, 0, -14, true, GOLEM_GUN.gun).px.d;
    const hex = (d: Uint8ClampedArray, i: number): string => '#' + [0, 1, 2].map((c) => d[i + c].toString(16).padStart(2, '0')).join('');
    let changed = 0;
    let bright = 0;
    for (let i = 0; i < out.length; i += 4) {
      if (hex(lit, i) === hex(out, i)) continue;
      changed++;
      if (!['#141a24', '#26303e'].includes(hex(out, i))) bright++;
    }
    if (!changed) found.push('its light never goes out');
    if (bright) found.push(`${bright} pixels of its light not gone dark at its end`);
  } finally {
    Object.assign(GOLEM_POSE, { swing: 0, fold: 0, lean: 0, bob: 0, feet: [0, 0, 0, 0], level: 0, dim: 0, crumple: 0 });
  }
  assert.deepEqual([...new Set(found)], []);
});

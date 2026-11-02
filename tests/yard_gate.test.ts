// THE YARD'S OWN GATE (src/art/yard_gate.ts; behind YARD_GATE, off; nothing of the game imports it), held before it goes
// to the main chat: off and imported by nothing of the game; every piece painted; crisp (every pixel all there or not at
// all, none standing alone); nothing glowing cyan (the friend's), the mark's fire the enemy's, the slam's sparks an honest
// orange; nothing cut off; the way through exactly the game's three tiles, a hero under it with room to spare; as high as
// the yard's wall; light from the upper left (the face along x lit, along y in shade) and the mark read the same both ways;
// the portcullis down to the floor and drawn up out of the way; the drop's timing (Movement 9); the slam's dust and
// sparks; and the game's own doors and gates, every floor's, painted exactly as before (their pictures' hashes).
//   run: tsx --test tests/yard_gate.test.ts

// @ts-ignore
import { readdirSync, readFileSync, statSync } from 'node:fs';
// @ts-ignore
import { join } from 'node:path';
// @ts-ignore
import { createHash } from 'node:crypto';
// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
import { ARCH_WIDE, GATE_UP, PILLAR, SPAN, STRIP } from '../src/art/gates';
import type { GateArt, Strip } from '../src/art/gates';
import { headsmanGates } from '../src/art/floor2';
import { lookGates } from '../src/art/floors';
import { GRAIN, SPARK } from '../src/art/kit';
import { FLAME } from '../src/art/mkit';
import { EMBER } from '../src/art/props';
import type { Sprite } from '../src/engine/px';
import {
  SLAM_FRAMES, YARD_ARCH, YARD_BARS, YARD_GATE, YARD_GATE_DROP, YARD_GATE_HIGH, YARD_GATE_LIFT, YARD_SLAM_AT,
  makeYardGateArt, yardGateDropAt, yardGateSlam, yardInWay, yardLift,
} from '../src/art/yard_gate';
import { hsv, luma, rgb } from './floor_checks';
import { paintWithoutCanvas, paintingOf } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

paintWithoutCanvas();
const A = makeYardGateArt();

/** A flat thing put together again from its strips: the colour at each place (u along the plane, v up), keyed "u,v". */
function plane(strips: Strip[], alongX: boolean): Map<string, string> {
  const out = new Map<string, string>();
  for (const q of strips) {
    const p = paintingOf(q.s);
    assert.ok(p.w === STRIP && q.s.density === GRAIN, 'a strip a quarter of a tile wide, at the heroes\' grain');
    assert.ok(q.s.ax * GRAIN === (alongX ? 0 : STRIP), 'anchored at the end it begins at');
    const ay = q.s.ay * GRAIN;
    for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
      const c = p.get(x, y);
      if (c === null) continue;
      const j = alongX ? x : STRIP - 1 - x;
      out.set(`${q.t * 32 + j},${ay + Math.floor((j - 1) / 2) - y}`, c);
    }
  }
  return out;
}
function reach(m: Map<string, string>): { u0: number; u1: number; v0: number; v1: number } {
  let u0 = Infinity;
  let u1 = -Infinity;
  let v0 = Infinity;
  let v1 = -Infinity;
  for (const k of m.keys()) {
    const [u, v] = k.split(',').map(Number);
    u0 = Math.min(u0, u);
    u1 = Math.max(u1, u);
    v0 = Math.min(v0, v);
    v1 = Math.max(v1, v);
  }
  return { u0, u1, v0, v1 };
}
const lower = (cs: readonly string[]): Set<string> => new Set(cs.map((c) => c.toLowerCase()));
const FIRE = lower(FLAME);
const SPARKS = lower(EMBER);
/** Glowing cyan, the friend's: a bright, strong colour between green and blue; or one of the friend's own. */
const FRIEND = lower([...SPARK, '#22d0e0', '#28dcf0']);
function cyan(c: string): boolean {
  if (FRIEND.has(c.toLowerCase())) return true;
  const [h, s, v] = hsv(...rgb(c));
  return h >= 160 && h <= 205 && s > 0.3 && v > 0.4;
}

/** Every picture of the gate, by name. */
const pictures: [string, Sprite][] = [];
pictures.push(['the pillar', A.pillar(true)]);
for (const alongX of [true, false]) {
  const way = alongX ? 'along x' : 'along y';
  for (const lit of [false, true]) A.arch(alongX, true, lit).forEach((q, i) => pictures.push([`the arch ${way}${lit ? ', alight' : ''}, strip ${i}`, q.s]));
  for (const raise of [0, 30, GATE_UP]) A.portcullis(alongX, true, raise).forEach((q, i) => pictures.push([`the portcullis ${way} raised ${raise}, strip ${i}`, q.s]));
  for (let f = 0; f < SLAM_FRAMES; f++) pictures.push([`the slam ${way}, frame ${f}`, yardGateSlam(alongX, f)]);
}
const slams = pictures.filter(([n]) => n.startsWith('the slam'));
const gatePieces = pictures.filter(([n]) => !n.startsWith('the slam'));

test('the yard gate: off, and nothing of the game imports it', () => {
  assert.ok(YARD_GATE.on === false, 'YARD_GATE is off');
  const found: string[] = [];
  const walk = (d: string): void => {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) walk(p);
      else if (p.endsWith('.ts') && !p.includes(join('src', 'dev')) && !p.endsWith(join('art', 'yard_gate.ts')) && /from '\.\.?\/(art\/)?yard_gate'/.test(readFileSync(p, 'utf8'))) found.push(p);
    }
  };
  walk('src');
  assert.ok(found.length === 0, `imported by ${found.join(', ')}`);
});

test('the yard gate: every piece painted; everything but the boss\'s pillar, arch and portcullis is floor 2\'s own', () => {
  for (const [n, s] of pictures) assert.ok(paintingOf(s).bounds() !== null, `${n}: painted`);
  assert.ok(plane(A.arch(true, true, false), true).size > 12000, 'the face of the gate, to the wall\'s height');
  assert.ok(plane(A.portcullis(true, true, 0), true).size > 2500, 'the portcullis, down');
  const F2 = headsmanGates();
  assert.ok(A.post === F2.post && A.pillar(false) === F2.pillar(false) && A.arch(true, false, false) === F2.arch(true, false, false), 'the doors\' posts and the plain gates: floor 2\'s');
  assert.ok(A.portcullis(true, false, 30) === F2.portcullis(true, false, 30) && A.lever(true) === F2.lever(true) && A.leaf(32, 16) === F2.leaf(32, 16) && A.lintel(false) === F2.lintel(false), 'and its leaves, lintels, levers');
  assert.ok(A.pillar(true) !== F2.pillar(true) && A.arch(true, true, false) !== F2.arch(true, true, false), 'the boss\'s: its own');
  assert.ok(A.arch(false, true, true) === A.arch(false, true, true) && A.portcullis(true, true, 44) === A.portcullis(true, true, 44), 'painted once and kept');
});

test('the yard gate, Pixels 1: crisp, every pixel all there or not at all; no pixel standing alone (but a spark)', () => {
  for (const [n, s] of pictures) {
    const p = paintingOf(s);
    let soft = 0;
    for (let i = 3; i < p.d.length; i += 4) if (p.d[i] !== 0 && p.d[i] !== 255) soft++;
    assert.ok(soft === 0, `${n}: ${soft} soft pixels`);
  }
  // (alone in its plane: the strips put together again, so a pixel at a strip's edge has its neighbours)
  const alone = (m: Map<string, string>): number => {
    let k = 0;
    for (const key of m.keys()) {
      const [u, v] = key.split(',').map(Number);
      let nb = 0;
      for (let du = -1; du <= 1; du++) for (let dv = -1; dv <= 1; dv++) if ((du || dv) && m.has(`${u + du},${v + dv}`)) nb++;
      if (nb === 0) k++;
    }
    return k;
  };
  for (const alongX of [true, false]) {
    for (const lit of [false, true]) assert.equal(alone(plane(A.arch(alongX, true, lit), alongX)), 0, 'the arch');
    for (const raise of [0, 2, 30, 58, GATE_UP]) assert.equal(alone(plane(A.portcullis(alongX, true, raise), alongX)), 0, `the portcullis raised ${raise}`);
  }
  for (const [n, s] of [...slams, ['the pillar', A.pillar(true)] as [string, Sprite]]) {
    const p = paintingOf(s);
    let k = 0;
    let fire = 0;
    for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
      const c = p.get(x, y);
      if (!c) continue;
      let nb = 0;
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) if ((dx || dy) && p.has(x + dx, y + dy)) nb++;
      if (nb === 0) {
        k++;
        if (SPARKS.has(c.toLowerCase())) fire++;
      }
    }
    assert.ok(k - fire <= 2, `${n}: ${k - fire} pixels of dust or stone alone`);
  }
});

test('the yard gate, Colour 3: nothing cyan; the mark\'s fire the enemy\'s; the slam\'s sparks an honest orange', () => {
  for (const [n, s] of pictures) {
    const p = paintingOf(s);
    const bad = new Set<string>();
    for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
      const c = p.get(x, y);
      if (c && cyan(c)) bad.add(c);
    }
    assert.ok(bad.size === 0, `${n}: ${[...bad].join(' ')}`);
  }
  for (const alongX of [true, false]) {
    const fire = (m: Map<string, string>, cs: string[]): number => [...m.values()].filter((c) => cs.includes(c)).length;
    const dim = plane(A.arch(alongX, true, false), alongX);
    const lit = plane(A.arch(alongX, true, true), alongX);
    assert.ok(fire(dim, [FLAME[0], FLAME[1], FLAME[2]]) >= 200 && fire(dim, [FLAME[3], FLAME[4]]) === 0, `in embers: ${fire(dim, [FLAME[0], FLAME[1], FLAME[2]])} pixels of dark fire, none bright`);
    assert.ok(fire(lit, [FLAME[3], FLAME[4]]) >= 200, `alight: ${fire(lit, [FLAME[3], FLAME[4]])} pixels of bright fire`);
    // (all of it on the keystone, over the middle of the way)
    for (const [k, c] of lit) {
      if (!FIRE.has(c.toLowerCase())) continue;
      const [u, v] = k.split(',').map(Number);
      assert.ok(Math.abs(u + 0.5 - ARCH_WIDE / 2) <= 14 && v >= 112 && v < YARD_GATE_HIGH, `fire at ${u},${v}`);
    }
    const lights = A.arch(alongX, true, true).flatMap((q) => q.s.lights ?? []);
    assert.ok(lights.length === 1 && lights[0].color === FLAME[2], 'alight, it gives the enemy\'s light');
    assert.ok(A.arch(alongX, true, false).every((q) => !q.s.lights), 'in embers, none');
    assert.ok(![...plane(A.portcullis(alongX, true, 0), alongX).values()].some((c) => FIRE.has(c.toLowerCase())), 'no fire in the iron');
  }
  // the slam: sparks of fire's own orange in its first frames, never the enemy's pink
  for (let f = 0; f < 5; f++) {
    const p = paintingOf(yardGateSlam(true, f));
    let n = 0;
    for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
      const c = p.get(x, y);
      if (c && SPARKS.has(c.toLowerCase())) n++;
      assert.ok(!c || !FIRE.has(c.toLowerCase()), 'no pink in the sparks');
    }
    assert.ok(n >= 12, `frame ${f}: ${n} pixels of sparks`);
  }
});

test('the yard gate: nothing cut off', () => {
  for (const [n, s] of [...slams, ['the pillar', A.pillar(true)] as [string, Sprite]]) {
    const p = paintingOf(s);
    let edge = 0;
    for (let x = 0; x < p.w; x++) edge += (p.has(x, 0) ? 1 : 0) + (p.has(x, p.h - 1) ? 1 : 0);
    for (let y = 0; y < p.h; y++) edge += (p.has(0, y) ? 1 : 0) + (p.has(p.w - 1, y) ? 1 : 0);
    assert.equal(edge, 0, `${n}: ${edge} pixels on its picture's edge`);
  }
  for (const alongX of [true, false]) {
    const m = plane(A.arch(alongX, true, false), alongX);
    // (its whole face across, at the coping; the walk a tile back; each merlon's top)
    for (let u = 0; u < ARCH_WIDE; u++) assert.ok(m.has(`${u},${YARD_GATE_HIGH - 1}`) && m.has(`${u + 31},${YARD_GATE_HIGH + 31}`), `the coping and the walk whole at ${u}`);
    for (const t of [0, 1, 2]) for (let u = PILLAR + 32 * t + 8; u < PILLAR + 32 * t + 24; u++) assert.ok(m.has(`${u + 31},${YARD_GATE_HIGH + 24 + 31}`), `the merlon over tile ${t} whole at ${u}`);
    const r = reach(m);
    assert.ok(r.u0 === 0 && r.u1 === ARCH_WIDE - 1 + 31 && r.v1 === YARD_GATE_HIGH + 24 + 31, `the face from the outer edge of one pillar to the other and its walk and merlons: ${r.u0} to ${r.u1}, up to ${r.v1}`);
  }
});

test('the yard gate: the way through exactly the game\'s three tiles; a hero under it with room to spare; as high as the yard\'s wall', () => {
  assert.ok(SPAN === 96 && PILLAR === 12, 'three tiles between pillars three eighths of a tile to a side');
  const way: number[] = [];
  for (let u = -4; u < ARCH_WIDE + 4; u++) if (yardInWay(u, 0)) way.push(u);
  assert.ok(way.length === SPAN && way[0] === PILLAR && way[way.length - 1] === PILLAR + SPAN - 1, `the way: ${way[0]} to ${way[way.length - 1]}`);
  for (const alongX of [true, false]) {
    const m = plane(A.arch(alongX, true, false), alongX);
    const r = reach(m);
    assert.equal(r.v0, YARD_ARCH.spring, 'it springs from the heads of the pillars');
    // its springers sit on both pillars
    for (let u = 0; u < PILLAR; u++) assert.ok(m.has(`${u},${YARD_ARCH.spring}`) && m.has(`${ARCH_WIDE - 1 - u},${YARD_ARCH.spring}`), `on the pillars at ${u}`);
    // what is in the way is only the arch's underside, seen through it, no further back than the pillars are thick
    for (const [k, c] of m) {
      const [u, v] = k.split(',').map(Number);
      if (!yardInWay(u, v)) continue;
      let seen = false;
      for (let s = 1; s <= PILLAR; s++) if (!yardInWay(u - s, v - s)) seen = true;
      assert.ok(seen && (c === '#0e0c24' || c === '#1b1c36'), `in the way at ${u},${v}: ${c}`);
    }
    for (let v = 0; v < 100; v++) assert.ok(!m.has(`59,${v}`) && !m.has(`60,${v}`), `the middle of the way clear at ${v}`);
    const crown = YARD_ARCH.spring + YARD_ARCH.rise;
    assert.ok(crown >= 56 * 2 && YARD_GATE_HIGH === 150, `its crown ${crown} over the floor (the Crypt's boss arch's: 92); its face as high as the yard's wall`);
  }
  // up, the portcullis is out of the way: its spikes over a hero's head (56) with room to spare
  for (const alongX of [true, false]) {
    const up = reach(plane(A.portcullis(alongX, true, GATE_UP), alongX));
    assert.ok(up.v0 >= YARD_GATE_LIFT && YARD_GATE_LIFT >= 56 + 24, `up, its lowest point ${up.v0} over the floor`);
  }
});

test('the yard gate, Pixels 4: light from the upper left; the same gate both ways, the mark reading the same', () => {
  const mean = (m: Map<string, string>): number => {
    let t = 0;
    for (const c of m.values()) t += luma(...rgb(c));
    return t / m.size;
  };
  const X = plane(A.arch(true, true, false), true);
  const Yp = plane(A.arch(false, true, false), false);
  assert.ok(mean(X) > mean(Yp) + 4, `the face along x (turned to screen-left) lit: ${mean(X).toFixed(1)} against ${mean(Yp).toFixed(1)}`);
  assert.deepEqual([...X.keys()].sort(), [...Yp.keys()].sort(), 'the same shape');
  const fire = (m: Map<string, string>, mirror: boolean): string[] => [...m].filter(([, c]) => FIRE.has(c.toLowerCase())).map(([k]) => {
    const [u, v] = k.split(',').map(Number);
    return `${mirror ? ARCH_WIDE - 1 - u : u},${v}`;
  }).sort();
  assert.deepEqual(fire(X, false), fire(Yp, true), 'the mark turned along y, so that its blade is on the left on the screen both ways');
  // the pillar: its left face (lit) lighter than its right
  const p = paintingOf(A.pillar(true));
  let l = 0;
  let r = 0;
  let nl = 0;
  let nr = 0;
  const mid = Math.round(A.pillar(true).ax * GRAIN);
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
    const c = p.get(x, y);
    if (!c) continue;
    if (x < mid) {
      l += luma(...rgb(c));
      nl++;
    } else {
      r += luma(...rgb(c));
      nr++;
    }
  }
  assert.ok(l / nl > r / nr + 4, `the pillar's lit face ${(l / nl).toFixed(1)}, its shaded ${(r / nr).toFixed(1)}`);
});

test('the yard gate: the portcullis down to the floor, eight spiked uprights across the way; drawn up, nothing of it lower than it went', () => {
  for (const alongX of [true, false]) {
    const down = plane(A.portcullis(alongX, true, 0), alongX);
    const r = reach(down);
    assert.ok(r.v0 === 0 && r.u0 >= PILLAR && r.u1 < PILLAR + SPAN, `down to the floor, between the pillars (${r.u0} to ${r.u1})`);
    // (each upright's point on the floor, but the last: seen at a slant through the way, it is behind the nearer pillar)
    let spikes = 0;
    for (let u = PILLAR; u < PILLAR + SPAN; u++) if (down.has(`${u},0`) && !down.has(`${u - 1},0`)) spikes++;
    assert.equal(YARD_BARS.length, 8, 'eight uprights');
    for (const b of YARD_BARS) if (yardInWay(b + 2 + PILLAR, PILLAR)) assert.ok(down.has(`${b + 2},0`), `the point of the upright at ${b} on the floor`);
    assert.equal(spikes, 7, 'seven points seen on the floor');
    for (const raise of [2, 10, 30, 44, 58, GATE_UP]) {
      const m = plane(A.portcullis(alongX, true, raise), alongX);
      assert.equal(reach(m).v0, yardLift(raise), `raised ${raise}: its lowest point ${yardLift(raise)} over the floor`);
    }
  }
  assert.ok(yardLift(0) === 0 && yardLift(GATE_UP) === YARD_GATE_LIFT && yardLift(GATE_UP / 2) === YARD_GATE_LIFT / 2, 'the game\'s raise, as far up as this gate goes');
});

test('the yard gate: the drop (Movement 9): a held judder at the top, down in two frames, a hard landing and a bounce; the slam\'s dust thins away', () => {
  const D = YARD_GATE_DROP;
  assert.ok(D.every((r) => r >= 0 && r <= GATE_UP && r % 2 === 0), 'the game\'s raise, even');
  assert.equal(D[0], GATE_UP, 'from the top');
  const judder = D.slice(0, YARD_SLAM_AT - 1);
  assert.ok(judder.length >= 8 && judder.every((r) => r >= GATE_UP - 12) && judder.some((r) => r < GATE_UP), `held at the top, juddering: ${judder.join(' ')}`);
  assert.ok(D[YARD_SLAM_AT] === 0 && D[YARD_SLAM_AT - 2] >= GATE_UP - 12 && D[YARD_SLAM_AT - 1] > 0 && D[YARD_SLAM_AT - 1] < GATE_UP - 12, 'down in two frames');
  const after = D.slice(YARD_SLAM_AT);
  assert.ok(Math.max(...after) >= 8 && D[D.length - 1] === 0, `a bounce off the floor, then down: ${after.join(' ')}`);
  assert.ok(yardGateDropAt(YARD_SLAM_AT).slam === 0 && yardGateDropAt(YARD_SLAM_AT).lit && !yardGateDropAt(YARD_SLAM_AT - 1).lit && yardGateDropAt(YARD_SLAM_AT + SLAM_FRAMES).slam === -1, 'the slam and the mark from the landing');
  const n = (f: number): number => {
    let k = 0;
    const p = paintingOf(yardGateSlam(true, f));
    for (let i = 3; i < p.d.length; i += 4) if (p.d[i]) k++;
    return k;
  };
  assert.ok(n(6) > n(0) && n(SLAM_FRAMES - 1) < n(6) / 2, `it billows and thins: ${n(0)}, ${n(6)}, ${n(SLAM_FRAMES - 1)} pixels`);
  // anchored at the gate's foot: dust on both sides of it, in front and behind
  const s = yardGateSlam(true, 6);
  const p = paintingOf(s);
  const b = p.bounds()!;
  const ax = s.ax * GRAIN;
  const ay = s.ay * GRAIN;
  assert.ok(b.x < ax && b.x + b.w > ax && b.y < ay && b.y + b.h > ay, 'about its anchor');
});

/** A picture's pixels, hashed. */
function sum(s: Sprite, h: { update(x: Uint8Array | string): unknown }): void {
  const p = paintingOf(s);
  h.update(`${p.w}x${p.h}@${s.ax},${s.ay};`);
  h.update(new Uint8Array(p.d.buffer, p.d.byteOffset, p.d.byteLength));
}
function gateHash(G: GateArt): string {
  const h = createHash('sha1');
  sum(G.post, h);
  for (const alongX of [true, false]) {
    for (const q of G.lintel(alongX)) sum(q.s, h);
    for (const boss of [true, false]) {
      for (const lit of [false, true]) for (const q of G.arch(alongX, boss, lit)) sum(q.s, h);
      for (const raise of [0, 30, GATE_UP]) for (const q of G.portcullis(alongX, boss, raise)) sum(q.s, h);
    }
  }
  for (const boss of [true, false]) sum(G.pillar(boss), h);
  for (const [ex, ey] of [[32, 16], [-32, 16], [0, 32], [24, -4]]) sum(G.leaf(ex, ey), h);
  for (const pulled of [false, true]) sum(G.lever(pulled), h);
  sum(G.seal(32, 16, 'fire', true), h);
  return h.digest('hex') as string;
}

test('the game\'s own doors and gates, every floor\'s, painted exactly as before (their pictures\' hashes, from high-city 5a2e280)', () => {
  const BEFORE = [
    '9d72e0092e24bf5058d3696e1703636510f11d66',
    '7ca14b6bba7c632f4eb41fec8a45bb65b4663654',
    '94c96e19aae48b5a4a0648aa14ad52426c68cdbc',
    '633274a438884dbf43247918948fbdd545420ba3',
    '0fd577ce254429bfcc1fc482864413dae73edd9b',
  ];
  const now = [1, 2, 3, 4, 5].map((k) => gateHash(lookGates(k)));
  assert.deepEqual(now, BEFORE);
});

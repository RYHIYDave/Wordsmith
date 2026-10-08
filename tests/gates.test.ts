// DOORS AND GATES: their pictures (src/art/gates.ts). Version 18.5.
//
// The owner, 7 Oct 2026, 16:57, of the first pictures: "I’d like the gate to have an arch of stone
// above it.  And I’d like the boss gate to have some sort of emblem in the middle of the arch.  And
// the doors look too much like the gate.  Give them a stone outline to make the door smaller than
// the hallway width.  Have it open from one side, not from the middle on both sides". Of an emblem
// that was the boss's face, 17:38: "It doesn't have to be the same face as the boss, just something
// carved in stone, maybe with a glove." (a glow); of the carved mark, 17:43: "Better"; and to "is
// the look [...] right to build?", 17:54 and 18:02: "Yes, the new doors and gates look very [good]."
//
// What is held here, of the pictures themselves:
//   - what stands flat in a plane comes as strips a quarter of a tile wide, which put together
//     are the thing, the same in a plane along +x and (mirrored) in one along +y;
//   - A DOOR'S FRAME: two square posts 30 game pixels high, and a lintel across their heads that
//     leaves the opening, a tile wide, clear;
//   - ITS ONE LEAF: iron and nothing else, a hero's height, the same leaf at every angle;
//   - A GATE: two pillars and a round arch from the one to the other, over a way three tiles wide
//     that is clear; THE BOSS'S taller and heavier, with the mark in the middle of it: in embers,
//     or alight and giving light; the other arch has no fire in it;
//   - THE PORTCULLIS: bars across the whole way, down to the floor; raised, nothing of it is lower
//     than it was raised, and it is gone up behind the arch but for its spikes;
//   - the pictures are painted once and kept.
//   run: tsx --test tests/gates.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { ARCH, ARCH_BOSS, DOOR_HIGH, DOOR_WIDE, GATE_UP, PILLAR, POST, STRIP, SWING_STEPS, emblemMiddle, makeGateArt } from '../src/art/gates';
import type { Strip } from '../src/art/gates';
import { VAULT } from '../src/art/ground';
import { GRAIN } from '../src/art/kit';
import { FLAME, IRON } from '../src/art/mkit';
import type { Sprite } from '../src/engine/px';
import { paintWithoutCanvas, paintingOf } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

paintWithoutCanvas();
const A = makeGateArt();

/** A flat thing put together again from its strips: the colour at each place (u along the plane, v up from the floor, in picture pixels), keyed "u,v". */
function plane(strips: Strip[], alongX: boolean): Map<string, string> {
  const out = new Map<string, string>();
  for (const q of strips) {
    const p = paintingOf(q.s);
    assert.equal(p.w, STRIP, 'a strip is a quarter of a tile wide');
    assert.equal(q.s.density, GRAIN, 'at the heroes\' grain');
    assert.ok((q.t * 32) % STRIP === 0, 'and begins a whole number of strips along');
    assert.equal(q.s.ax * GRAIN, alongX ? 0 : STRIP, 'anchored at the end it begins at');
    const ay = q.s.ay * GRAIN;
    for (let y = 0; y < p.h; y++) {
      for (let x = 0; x < p.w; x++) {
        const c = p.get(x, y);
        if (c === null) continue;
        const j = alongX ? x : STRIP - 1 - x;
        out.set(`${q.t * 32 + j},${ay + Math.floor((j - 1) / 2) - y}`, c);
      }
    }
  }
  return out;
}
/** The reach of a put-together thing: its least and greatest u and v. */
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
const colours = (m: Map<string, string>): Set<string> => new Set(m.values());
const painted = (s: Sprite): { n: number; w: number; h: number; colours: Set<string> } => {
  const p = paintingOf(s);
  const b = p.bounds();
  const cs = new Set<string>();
  let n = 0;
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.w; x++) {
      const c = p.get(x, y);
      if (c !== null) {
        n++;
        cs.add(c);
      }
    }
  }
  return { n, w: b ? b.w : 0, h: b ? b.h : 0, colours: cs };
};
const FIRE = new Set<string>(FLAME);

test('a door\'s frame: two square posts 30 pixels high, a quarter of a tile to a side, and a lintel across their heads that leaves the opening clear', () => {
  assert.deepEqual([DOOR_WIDE, DOOR_HIGH, POST], [32, 60, 8], 'the opening is a tile wide and 30 game pixels high; a post is a quarter of a tile to a side');
  const post = painted(A.post);
  assert.deepEqual([post.w, post.h], [POST * 2, DOOR_HIGH + POST / 2], 'a post: two faces side by side, each as high as the opening');
  assert.ok(post.colours.size >= 6 && ![...post.colours].some((c) => FIRE.has(c)), 'of stone, in the tones of both its faces');
  for (const alongX of [true, false]) {
    const m = plane(A.lintel(alongX), alongX);
    const r = reach(m);
    // (from two pixels before the first post to two after the second; and its far end, as thick as a post, seen beyond that)
    assert.deepEqual([r.u0, r.u1], [-POST - 2, DOOR_WIDE + POST + 2 - 1 + POST], `the lintel ${alongX ? 'along x' : 'along y'}: across both posts and a little over, and its far end`);
    assert.equal(r.v0, DOOR_HIGH, 'nothing of it hangs into the opening');
    assert.ok(r.v1 - r.v0 >= 10 + POST - 1 && r.v1 - r.v0 <= 12 + POST, `five or six game pixels deep (${r.v1 - r.v0 + 1 - POST} picture pixels)`);
    // its face: every place of it from end to end, on every row
    for (let u = -POST - 2; u < DOOR_WIDE + POST + 2; u++) assert.ok(m.has(`${u},${DOOR_HIGH}`) && m.has(`${u},${DOOR_HIGH + 10}`), `its face is whole at ${u}`);
  }
  // the two are one thing, mirrored: the same places painted, in the tones of the other face
  const mx = plane(A.lintel(true), true);
  const my = plane(A.lintel(false), false);
  assert.deepEqual([...mx.keys()].sort(), [...my.keys()].sort(), 'the same shape along x and along y');
  assert.ok([...colours(mx)].some((c) => !colours(my).has(c)), 'in other tones: one face is lit and the other in shade');
});

test('a door\'s one leaf: iron and nothing else, a hero\'s height, and the same leaf at every angle of its swing', () => {
  const iron = new Set<string>([IRON[0], IRON[2], IRON[3], '#b4b0e4']);
  const shut = painted(A.leaf(32, 16));
  const open = painted(A.leaf(32, -16));
  for (const [what, s] of [['shut', shut], ['open', open]] as const) {
    assert.ok([...s.colours].every((c) => iron.has(c)), `${what}: nothing but iron (${[...s.colours].filter((c) => !iron.has(c)).join(' ')})`);
    assert.ok(s.h >= DOOR_HIGH - 4 + 16 && s.h <= DOOR_HIGH + 16 + 4, `${what}: 28 game pixels high, and a tile long across the screen (${s.h} picture pixels in all)`);
    assert.ok(s.w >= 32 && s.w <= 40, `${what}: a tile long (${s.w})`);
  }
  assert.ok(Math.abs(shut.n - open.n) < shut.n * 0.1, `the same leaf, shut and open (${shut.n} and ${open.n} picture pixels)`);
  // along +y it is the mirror image
  const other = painted(A.leaf(-32, 16));
  assert.ok(Math.abs(other.n - shut.n) < shut.n * 0.1 && Math.abs(other.w - shut.w) <= 2 && Math.abs(other.h - shut.h) <= 2, `its mirror image: ${other.n} picture pixels in ${other.w} by ${other.h}, against ${shut.n} in ${shut.w} by ${shut.h}`);
  // every step of its swing has a leaf, hung by the same hinge: none is empty, and none is much unlike the others in size
  for (let k = 0; k <= SWING_STEPS; k++) {
    const turn = ((k / SWING_STEPS) * Math.PI) / 2;
    const dx = Math.cos(turn);
    const dy = -Math.sin(turn);
    const leaf = A.leaf(Math.round(32 * (dx - dy)), Math.round(16 * (dx + dy)));
    const got = painted(leaf);
    assert.ok(got.n > shut.n * 0.6 && got.n < shut.n * 1.4, `step ${k} of ${SWING_STEPS}: ${got.n} picture pixels`);
    // (its hinge is at its foot: the anchor is on the picture's lowest rows or, turned back, above them by the leaf's rise)
    assert.ok(leaf.ax * GRAIN >= 4 && leaf.ax * GRAIN <= 8, 'hung by its hinge');
  }
  assert.equal(A.leaf(32, 16), A.leaf(32, 16), 'painted once and kept');
});

test('a gate: two pillars and a round arch from the one to the other over a way three tiles wide; the boss\'s is taller and heavier, with the mark carved in the middle of it', () => {
  assert.equal(PILLAR, 12, 'a pillar is three eighths of a tile to a side');
  const wide = 96 + PILLAR * 2;
  for (const [boss, shape] of [[false, ARCH], [true, ARCH_BOSS]] as const) {
    const what = boss ? 'the boss\'s' : 'a gate\'s';
    const pil = painted(A.pillar(boss));
    assert.deepEqual([pil.w, pil.h], [PILLAR * 2, shape.spring + PILLAR / 2], `${what} pillar: two faces, as high as its arch springs from`);
    for (const alongX of [true, false]) {
      const m = plane(A.arch(alongX, boss, false), alongX);
      const r = reach(m);
      // (the boss's ring is thick enough to stand on the whole head of each pillar, and its far end is seen beyond the last; the other's is two pixels short of the pillars' outer edges)
      assert.ok(r.u0 <= (boss ? 0 : 2), `${what} arch begins at the outer edge of its first pillar (${r.u0})`);
      assert.ok(boss ? r.u1 === wide - 1 + PILLAR : r.u1 >= wide - 3, `and ends at the outer edge of the other (${r.u1} of ${wide})`);
      assert.equal(r.v0, shape.spring, 'it springs from the heads of the pillars');
      // its ring: at the middle of the way, from the height its underside rises to, for the thickness of its ring
      const top = shape.spring + shape.rise + shape.ring;
      if (!boss) {
        assert.equal(r.v1, top - 1, `${what} arch is ${top / GRAIN} game pixels high over all`);
        for (let v = shape.spring; v < shape.spring + shape.rise; v++) assert.ok(!m.has(`${wide / 2},${v}`) && !m.has(`${wide / 2 - 1},${v}`), `the way under the middle of it is clear at ${v}`);
        for (let v = shape.spring + shape.rise; v < top; v++) assert.ok(m.has(`${wide / 2},${v}`), `its ring is whole at ${v}`);
        assert.ok(![...colours(m)].some((c) => FIRE.has(c)), 'no fire in it');
      } else {
        // (the mark stands a little over the arch and hangs a little under it)
        assert.ok(r.v1 >= top && r.v1 <= top + 12, `the boss's arch with its mark is ${(r.v1 + 1) / GRAIN} game pixels high`);
        for (let v = shape.spring; v < shape.spring + shape.rise - 12; v++) assert.ok(!m.has(`${wide / 2},${v}`), `the way under it is clear at ${v}`);
      }
      // the way through is clear from pillar to pillar, as high as a hero and more, but close under the arch at its ends
      for (let u = PILLAR + 6; u < PILLAR + 96 - 6; u++) for (let v = shape.spring; v < 58; v++) assert.ok(!m.has(`${u},${v}`) || u < PILLAR + 20, `clear at ${u},${v}`);
    }
    // along x and along y it is one shape
    assert.deepEqual([...plane(A.arch(true, boss, false), true).keys()].sort(), [...plane(A.arch(false, boss, false), false).keys()].sort());
  }
  assert.ok(ARCH_BOSS.spring + ARCH_BOSS.rise > ARCH.spring + ARCH.rise && ARCH_BOSS.ring > ARCH.ring, 'the boss\'s is taller and heavier');
  assert.ok(ARCH_BOSS.spring + ARCH_BOSS.rise > 56 + 20 && ARCH.spring + ARCH.rise > 56 + 20, 'a hero (56 picture pixels) walks under either with room to spare');
});

test('the mark in the boss\'s arch: carved in the middle of it, in embers; alight once the gate has fallen, and then it gives light', () => {
  const mid = (96 + PILLAR * 2) / 2;
  const at = emblemMiddle(ARCH_BOSS);
  assert.equal(at, ARCH_BOSS.spring + ARCH_BOSS.rise + ARCH_BOSS.ring / 2, 'on the keystone');
  for (const alongX of [true, false]) {
    const dim = plane(A.arch(alongX, true, false), alongX);
    const lit = plane(A.arch(alongX, true, true), alongX);
    assert.deepEqual([...dim.keys()].sort(), [...lit.keys()].sort(), 'the same arch');
    const fire = (m: Map<string, string>, tones: readonly string[]): number => [...m.values()].filter((c) => tones.includes(c)).length;
    // in embers: the darker fire, and none of the bright
    assert.ok(fire(dim, [FLAME[1], FLAME[2]]) >= 60 && fire(dim, [FLAME[3], FLAME[4]]) === 0, `in embers: ${fire(dim, [FLAME[1], FLAME[2]])} picture pixels of dark fire, ${fire(dim, [FLAME[3], FLAME[4]])} of bright`);
    assert.ok(fire(lit, [FLAME[3], FLAME[4]]) >= 60, `alight: ${fire(lit, [FLAME[3], FLAME[4]])} picture pixels of bright fire`);
    // the fire is the mark, and the mark is in the middle of the arch: every pixel of it within 14 pixels of the keystone's middle
    for (const [k, c] of lit) {
      if (!FIRE.has(c)) continue;
      const [u, v] = k.split(',').map(Number);
      assert.ok(Math.abs(u - mid) <= 9 && Math.abs(v - at) <= 14, `fire at ${u},${v}`);
    }
    // a lozenge round a point: the very middle is fire, and so is its line above, below and to each side; between them, stone
    assert.ok(FIRE.has(lit.get(`${mid},${at}`) ?? ''), 'its point');
    assert.ok(FIRE.has(lit.get(`${mid},${at + 11}`) ?? '') && FIRE.has(lit.get(`${mid},${at - 11}`) ?? ''), 'the lozenge above and below it');
    assert.ok(!FIRE.has(lit.get(`${mid},${at + 6}`) ?? '') && !FIRE.has(dim.get(`${mid},${at + 6}`) ?? ''), 'and stone between');
    // alight it gives light, from the middle of the arch; in embers none
    const lights = (strips: Strip[]): number => strips.reduce((n, q) => n + (q.s.lights ? q.s.lights.length : 0), 0);
    assert.equal(lights(A.arch(alongX, true, false)), 0);
    assert.equal(lights(A.arch(alongX, true, true)), 1);
    const strip = A.arch(alongX, true, true).find((q) => q.s.lights);
    assert.ok(strip && strip.t * 32 <= mid && strip.t * 32 + STRIP > mid, 'on the strip that has the middle of the arch');
    if (strip && strip.s.lights) {
      const l = strip.s.lights[0];
      // (how high over the floor the light is, as the strip's own picture has it)
      const j = mid - strip.t * 32;
      const v = strip.s.ay * GRAIN + Math.floor((j - 1) / 2) - l.y * GRAIN;
      assert.ok(Math.abs(v - at) <= 1, `at the mark's height (${v} against ${at})`);
      assert.equal(l.color, FLAME[2], 'the enemy\'s colour');
    }
  }
  // the other gates' arch has no mark, alight or not
  assert.equal(A.arch(true, false, true), A.arch(true, false, true));
  assert.ok(![...colours(plane(A.arch(true, false, true), true))].some((c) => FIRE.has(c)));
});

test('the portcullis: iron bars across the whole way, down to the floor; raised, nothing of it is lower than it was raised, and it is gone up behind the arch but for its spikes', () => {
  assert.equal(GATE_UP, 60, 'up, its spikes hang 30 game pixels over the floor: over a hero\'s head (28)');
  for (const [boss, shape] of [[false, ARCH], [true, ARCH_BOSS]] as const) {
    for (const alongX of [true, false]) {
      const down = plane(A.portcullis(alongX, boss, 0), alongX);
      const r = reach(down);
      assert.ok(r.u0 >= PILLAR && r.u1 < PILLAR + 96, `between the pillars (${r.u0} to ${r.u1})`);
      assert.ok(r.u0 <= PILLAR + 4 && r.u1 >= PILLAR + 96 - 5, 'from one to the other');
      assert.equal(r.v0, 0, 'down to the floor');
      assert.ok(r.v1 < shape.spring + shape.rise && r.v1 > shape.spring + shape.rise - 16, `and up to the arch (${r.v1})`);
      // a bar every quarter of a tile: on the row just over their spikes, twelve of them, with the floor seen between
      const over = (boss ? 9 : 7) + 1;
      let bars = 0;
      let last = false;
      for (let u = PILLAR; u < PILLAR + 96; u++) {
        const now = down.has(`${u},${over}`);
        if (now && !last) bars++;
        last = now;
      }
      assert.equal(bars, 12, 'twelve uprights');
      // each ends in a spike: at the floor far fewer pixels than just over the spikes
      const row = (m: Map<string, string>, v: number): number => [...m.keys()].filter((k) => k.endsWith(`,${v}`)).length;
      assert.ok(row(down, 0) === 12 && row(down, 0) < row(down, over) / 2, `a point at the foot of each (${row(down, 0)} pixels on the floor, ${row(down, over)} over the spikes)`);
      // raised
      let before = down.size;
      for (const raise of [20, 40, GATE_UP]) {
        const m = plane(A.portcullis(alongX, boss, raise), alongX);
        const q = reach(m);
        assert.equal(q.v0, raise, `raised ${raise}, its lowest point is ${raise} over the floor`);
        assert.ok(m.size < before, 'and less of it is seen');
        before = m.size;
      }
      assert.ok(before > 20 && before < down.size * 0.25, `up, only its spikes hang under the arch (${before} picture pixels of ${down.size})`);
    }
  }
  // nothing but iron
  const iron = new Set<string>([IRON[0], IRON[2], IRON[3], '#b4b0e4']);
  assert.ok([...colours(plane(A.portcullis(true, true, 0), true))].every((c) => iron.has(c)));
  // painted once for each height it is drawn at (an even number of picture pixels), and kept
  assert.equal(A.portcullis(true, true, 30), A.portcullis(true, true, 30.4));
  assert.equal(A.portcullis(true, true, GATE_UP + 9), A.portcullis(true, true, GATE_UP));
  assert.ok(A.portcullis(true, true, 30) !== A.portcullis(true, true, 32));
  assert.equal(A.lintel(true), A.lintel(true));
  assert.equal(makeGateArt(VAULT).pillar(true) !== A.pillar(true), true, 'each art keeps its own');
});

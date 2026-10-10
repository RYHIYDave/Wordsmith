// THE WARDEN'S FLOOR (src/art/floor1.ts; a mock-up nothing of the game imports), held to his art
// rulebook before he sees it, and to his notes on its first pictures (10 Oct 2026):
//   Places 7 (between 40 and 50 pieces, of the kinds he named), Pixels 1 (crisp), Colour 3 (no cyan;
//   pink only on the boss's gate, the Warden's own embers, as the game's boss gate has them), Colour 4
//   (the places darker than any word), Pixels 4 (light from the upper left);
//   his notes: "I don’t like the wall panels all being in the exact same spot", "Some assets could
//   be the full height like a large crack down the wall.  Or a floor tile and wall combo that’s shows
//   a crumbled wall and the debris piled on the floor.", "And the rats just kind of disappear.";
//   and the moments through the checks for animations ("Animations need run the checks"; Animations
//   1: as big, wild, kinetic and weighty as possible, checked before he sees them).
//   run: tsx --test tests/floor1.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { candles, wardenMoments, wardenPieces } from '../src/art/floor1';
import type { Moment, Piece, Track } from '../src/art/floor1';
import { CRYPT_FLOORS } from '../src/art/crypt';
import { makeGateArt } from '../src/art/gates';
import { WORD_COLOR } from '../src/art/icons';
import { COAL, EMBER, makeDungeonProps } from '../src/art/props';
import type { Sprite } from '../src/engine/px';
import { paintWithoutCanvas, paintingOf, unlike } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
paintWithoutCanvas();

const luma = (r: number, g: number, b: number): number => 0.2126 * r + 0.7152 * g + 0.0722 * b;
function hsv(r: number, g: number, b: number): [number, number, number] {
  const M = Math.max(r, g, b);
  const m = Math.min(r, g, b);
  const c = M - m;
  let h = 0;
  if (c > 0) h = M === r ? ((g - b) / c) % 6 : M === g ? (b - r) / c + 2 : (r - g) / c + 4;
  return [(h * 60 + 360) % 360, M === 0 ? 0 : c / M, M / 255];
}
const rgb = (c: string): [number, number, number] => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
const hex = (r: number, g: number, b: number): string => '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');

/** Every picture of a piece: its frames, and a wall piece's on both faces at every spot. */
const sprites = (p: Piece): Sprite[] => [...(p.frames ?? []), ...(p.left ?? []), ...(p.right ?? []), ...(p.spots ?? []).flatMap((s) => [...s.left, ...s.right])];
function each(s: Sprite, f: (r: number, g: number, b: number, a: number, x: number, y: number) => void): void {
  const p = paintingOf(s);
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
    const i = (y * p.w + x) * 4;
    if (p.d[i + 3] > 0) f(p.d[i], p.d[i + 1], p.d[i + 2], p.d[i + 3], x, y);
  }
}
const count = (s: Sprite): number => {
  let n = 0;
  each(s, () => n++);
  return n;
};
const mean = (s: Sprite): number => {
  let t = 0;
  let n = 0;
  each(s, (r, g, b) => {
    t += luma(r, g, b);
    n++;
  });
  return t / Math.max(1, n);
};
/** The anchor, in picture pixels. */
const anchor = (s: Sprite): [number, number] => [Math.round(s.ax * (s.density ?? 1)), Math.round(s.ay * (s.density ?? 1))];
/** What gives light, and so may burn bright: fire and its embers (his Colour 4 is for the places, not their fires). */
const SHINES = new Set<string>([...EMBER, ...COAL, '#fff0a0', '#ffb070', '#ff4f8a', '#c0206a', '#7a1058'].map((c) => c.toLowerCase()));
/** The seams, ink. */
const INKS = new Set<string>(['#0e0c24']);

const pieces = wardenPieces();
const byName = (n: string): Piece => {
  const p = pieces.find((q) => q.name === n);
  if (!p) throw new Error(`no piece named ${n}`);
  return p;
};

test('Places 7: between 40 and 50 pieces, of the kinds he named, each its own, every picture painted', () => {
  assert.ok(pieces.length >= 40 && pieces.length <= 50, `${pieces.length} pieces`);
  for (const k of ['wall tile', 'floor tile', 'breakable', 'on the wall', 'on the floor', 'obstacle', 'door', 'gate', 'trap', 'quest']) assert.ok(pieces.some((p) => p.kind === k), `a ${k}`);
  assert.ok(new Set(pieces.map((p) => p.name)).size === pieces.length, 'each its own name');
  for (const p of pieces) {
    const all = sprites(p);
    assert.ok(all.length > 0, `${p.name} has pictures`);
    for (const s of all) assert.ok(count(s) > 20, `${p.name}: a picture of ${count(s)} pixels`);
  }
});

test('Pixels 1: crisp, every pixel all there or not at all; a floor tile covers its whole diamond', () => {
  for (const p of pieces) {
    let soft = 0;
    for (const s of sprites(p)) each(s, (_r, _g, _b, a) => (soft += a === 255 ? 0 : 1));
    assert.ok(soft === 0, `${p.name}: ${soft} soft pixels`);
  }
  for (const p of pieces.filter((q) => q.kind === 'floor tile' || q.name === 'spike grate' || q.name === 'skull plate')) {
    for (const s of p.frames!) {
      const q = paintingOf(s);
      // (a floor tile is anchored at its top corner, a trap at its middle, where the game's traps are)
      const [ax, ay0] = anchor(s);
      const ay = ay0 - (p.kind === 'trap' ? 16 : 0);
      const holes: string[] = [];
      for (let y = 2; y <= 29; y++) {
        const hw = 2 * Math.min(y, 32 - y);
        for (let x = -hw + 3; x <= hw - 4; x++) if (!q.get(ax + x, ay + y)) holes.push(`(${x}, ${y})`);
      }
      assert.ok(holes.length === 0, `${p.name}: ${holes.length} holes in the tile, ${holes.slice(0, 6).join(' ')}`);
    }
  }
});

test('Colour 3: no cyan anywhere; pink only on the boss gate, the Warden\'s embers', () => {
  for (const p of pieces) {
    let cyan = 0;
    let pink = 0;
    for (const s of sprites(p)) each(s, (r, g, b) => {
      const [h, sa, v] = hsv(r, g, b);
      if (h >= 168 && h <= 200 && sa > 0.45 && v > 0.5) cyan++;
      if (h >= 300 && h <= 352 && sa > 0.45 && v > 0.55) pink++;
    });
    assert.ok(cyan === 0, `${p.name}: ${cyan} cyan`);
    if (p.name !== "the boss's gate") assert.ok(pink === 0, `${p.name}: ${pink} pink`);
  }
});

test('Colour 4: the places stay darker than the darkest word; what stands, lies or hangs in them, and the gates, no brighter than the game\'s own', () => {
  const darkest = Math.min(...Object.values(WORD_COLOR).map((c) => luma(...rgb(c))));
  /** The 99th of a histogram of lumas. */
  const p99 = (h: number[]): number => {
    const n = h.reduce((t, k) => t + k, 0);
    let seen = 0;
    for (let l = 0; l < 256; l++) {
      seen += h[l];
      if (seen >= n * 0.99) return l;
    }
    return 255;
  };
  const bad: string[] = [];
  for (const p of pieces) {
    const h = new Array<number>(256).fill(0);
    for (const s of sprites(p)) each(s, (r, g, b) => {
      if (SHINES.has(hex(r, g, b))) return;
      h[Math.round(luma(r, g, b))]++;
    });
    if (['wall tile', 'floor tile', 'trap'].includes(p.kind) && p99(h) >= darkest) bad.push(`${p.name} ${p99(h)}`);
  }
  assert.ok(bad.length === 0, `brighter than the darkest word (${darkest.toFixed(0)}) at the 99th: ${bad.join(', ')}`);
  // (what is lit, that is: not the seams nor the shadows some of the game's own things carry painted under them)
  const lumas = (ss: Sprite[]): number[] => {
    const h = new Array<number>(256).fill(0);
    for (const s of ss) each(s, (r, g, b) => {
      const l = Math.round(luma(r, g, b));
      if (!SHINES.has(hex(r, g, b)) && l > 24) h[l]++;
    });
    return h;
  };
  const meanOf = (h: number[]): number => h.reduce((t, k, l) => t + k * l, 0) / Math.max(1, h.reduce((t, k) => t + k, 0));
  // what stands, lies or hangs: kind by kind, its highlights no brighter than the things in the game's
  // dungeons now; and the big things, that set how light a room is, no lighter on the whole
  const P = makeDungeonProps();
  const props = lumas([...P.brazier, P.chest, P.chestOpen, P.barrel, P.urn, P.pillar, ...P.bones, ...P.rubble, ...P.staves, ...P.shards, P.portalOff, P.fallen, P.fallenSearched]);
  for (const k of ['obstacle', 'breakable', 'on the floor', 'on the wall', 'quest', 'door']) {
    const ours = lumas(pieces.filter((p) => p.kind === k).flatMap(sprites));
    const big = k === 'obstacle' || k === 'on the wall' || k === 'door';
    assert.ok(p99(ours) <= p99(props) && (!big || meanOf(ours) <= meanOf(props)), `${k}: at the 99th ${p99(ours)}, on the whole ${meanOf(ours).toFixed(0)}; the game's own things ${p99(props)} and ${meanOf(props).toFixed(0)}`);
  }
  // the gates: no brighter than the gates in the game now (the vault's)
  const V = makeGateArt();
  for (const [name, boss] of [['the gate', false], ["the boss's gate", true]] as const) {
    const ours = lumas(sprites(byName(name)));
    const theirs = lumas([...V.arch(true, boss, false).map((q) => q.s), V.pillar(boss)]);
    assert.ok(p99(ours) <= p99(theirs) && meanOf(ours) <= meanOf(theirs) + 2, `${name}: at the 99th ${p99(ours)}, on the whole ${meanOf(ours).toFixed(0)}; the game's own ${p99(theirs)} and ${meanOf(theirs).toFixed(0)}`);
  }
});

test('Pixels 4: light from the upper left, on what stands, on doors and on the wall\'s two faces', () => {
  // what stands: its left half lighter than its right, the seams left out
  for (const p of pieces.filter((q) => q.kind === 'obstacle' || q.kind === 'breakable')) {
    const s = p.frames![0];
    const px: [number, number][] = [];
    each(s, (r, g, b, _a, x) => {
      if (!INKS.has(hex(r, g, b))) px.push([x, luma(r, g, b)]);
    });
    const cx = px.reduce((t, q) => t + q[0], 0) / px.length;
    const side = (f: (x: number) => boolean): number => {
      const q = px.filter(([x]) => f(x));
      return q.reduce((t, [, l]) => t + l, 0) / Math.max(1, q.length);
    };
    const L = side((x) => x < cx - 1);
    const R = side((x) => x > cx + 1);
    assert.ok(L > R, `${p.name}: left ${L.toFixed(0)}, right ${R.toFixed(0)}`);
  }
  // a door's leaf swung into a face turned to screen-right is in shade (the second look found both alike)
  const door = byName('the door');
  assert.ok(mean(door.frames![1]) < mean(door.frames![0]) - 4, `the door's leaf: lit ${mean(door.frames![0]).toFixed(0)}, in shade ${mean(door.frames![1]).toFixed(0)}`);
  // a wall piece on the face turned to screen-right is in shade, at every spot
  for (const p of pieces.filter((q) => q.spots)) {
    for (const sp of p.spots!) assert.ok(mean(sp.right[0]) < mean(sp.left[0]), `${p.name} at (${sp.du}, ${sp.dv}): lit ${mean(sp.left[0]).toFixed(0)}, in shade ${mean(sp.right[0]).toFixed(0)}`);
  }
  // but the torch's fire burns as bright in shade as in the light, and nothing of it turns khaki
  // (the second look found the shaded torch's flame a dull khaki)
  const fire = (s: Sprite): number => {
    let n = 0;
    each(s, (r, g, b) => (n += EMBER.includes(hex(r, g, b)) ? 1 : 0));
    return n;
  };
  for (const sp of byName('torch').spots!) {
    for (let f = 0; f < sp.left.length; f++) {
      assert.ok(fire(sp.right[f]) > 10 && fire(sp.right[f]) >= fire(sp.left[f]) * 0.9, `the torch's fire in shade: ${fire(sp.right[f])} pixels, in the light ${fire(sp.left[f])}`);
      let khaki = 0;
      each(sp.right[f], (r, g, b) => {
        const [h, sa, v] = hsv(r, g, b);
        if (h >= 40 && h <= 75 && sa > 0.25 && v > 0.3 && !SHINES.has(hex(r, g, b))) khaki++;
      });
      assert.ok(khaki === 0, `the torch in shade: ${khaki} khaki pixels`);
    }
  }
});

test('his notes: the wall pieces in many places and heights; a crack down the whole wall; a crumbled wall with its heap', () => {
  const onWall = pieces.filter((p) => p.spots);
  const middles: number[] = [];
  for (const p of onWall) {
    const one = p.name === 'crumbled wall' || p.name === 'dart skull';
    if (!one) {
      assert.ok(p.spots!.length >= 3, `${p.name}: ${p.spots!.length} places`);
    }
    for (const s of p.spots!) {
      let y0 = Infinity;
      let y1 = -Infinity;
      each(s.left[0], (_r, _g, _b, _a, _x, y) => {
        y0 = Math.min(y0, y);
        y1 = Math.max(y1, y);
      });
      // (a piece the height of the wall, the crack or a banner, has no height of its own on it)
      if (y1 - y0 < 60) middles.push(Math.round((y0 + y1) / 2) - anchor(s.left[0])[1]);
    }
  }
  // no band of the wall 12 pixels high holds more than a third of them
  for (let y = Math.min(...middles); y <= Math.max(...middles); y++) {
    const n = middles.filter((m) => m >= y && m < y + 12).length;
    assert.ok(n <= middles.length / 3, `${n} of the ${middles.length} in the band from ${y} to ${y + 11}`);
  }
  // the great crack runs the wall's height
  const rows = new Set<number>();
  each(byName('great crack').left![0], (_r, _g, _b, _a, _x, y) => rows.add(y));
  assert.ok(rows.size >= 70, `the great crack ${rows.size} pixels high`);
  // the crumbled wall: the hole in the wall, and its heap on the floor in front of it
  const cw = byName('crumbled wall');
  assert.ok(cw.frames && cw.frames.length === 1 && count(cw.frames[0]) > 600, `the crumbled wall's heap: ${cw.frames ? count(cw.frames[0]) : 0} pixels`);
  // (the breach and its broken edges: near a quarter of the wall's solid face, 48 by 56)
  assert.ok(count(cw.left![0]) > 600, `the crumbled wall's breach: ${count(cw.left![0])} pixels`);
});

test('his notes, each piece: every wall piece in places of its own, low and high and across the wall, and none up where the wall fades into the dark', () => {
  /** How far across a picture on a face reaches, unsheared: [left, right], u from the face's middle. */
  const across = (s: Sprite): [number, number] => {
    let u0 = Infinity;
    let u1 = -Infinity;
    each(s, (_r, _g, _b, _a, x) => {
      u0 = Math.min(u0, x - 24);
      u1 = Math.max(u1, x - 24);
    });
    return [u0, u1];
  };
  for (const p of pieces.filter((q) => q.spots && q.spots.length > 1)) {
    const dv = p.spots!.map((s) => s.dv);
    const du = p.spots!.map((s) => s.du);
    // (the rat hole is at the wall's foot, and the crack and the long banner run the height of the wall, wherever they are)
    if (!['rat hole', 'great crack', 'banner'].includes(p.name)) assert.ok(Math.max(...dv) - Math.min(...dv) >= 8, `${p.name}: its places only ${Math.max(...dv) - Math.min(...dv)} apart up the wall`);
    // across: as far as it can go and stay on its tile (a wide piece has less room)
    const [w0, w1] = across(p.spots![0].left[0]);
    const room = Math.min(10, 31 - (w1 - w0 + 1));
    assert.ok(Math.max(...du) - Math.min(...du) >= room, `${p.name}: its places only ${Math.max(...du) - Math.min(...du)} apart across it (room for ${room})`);
  }
  // every place within its own tile's face, 32 across (u -16 to 15): nothing hangs over the tile's edge
  for (const p of pieces.filter((q) => q.spots)) {
    for (const sp of p.spots!) {
      const [u0, u1] = across(sp.left[0]);
      assert.ok(u0 >= -16 && u1 <= 15, `${p.name} at (${sp.du}, ${sp.dv}): reaches across from ${u0} to ${u1}`);
    }
  }
  // the wall's solid stone is 56 high: above it the wall fades into the dark, and nothing is set there (but the crack, which runs up into it, and fire)
  for (const p of pieces.filter((q) => q.spots && q.name !== 'great crack')) {
    for (const sp of p.spots!) {
      for (const [face, alongX] of [[sp.left, true], [sp.right, false]] as const) {
        for (const s of face) {
          let top = -Infinity;
          each(s, (r, g, b, _a, x, y) => {
            if (SHINES.has(hex(r, g, b))) return;
            const k = alongX ? Math.floor((x - 24) / 2) : Math.floor((24 - x) / 2);
            top = Math.max(top, 104 - y + k);
          });
          assert.ok(top <= 55, `${p.name} at (${sp.du}, ${sp.dv}): reaches ${top} up the wall`);
        }
      }
    }
  }
});

test('Pixels 1, crisp: no loose single pixels standing alone in any piece (but a glint or a spark)', () => {
  for (const p of pieces) {
    let loose = 0;
    for (const s of sprites(p)) {
      const q = paintingOf(s);
      for (let y = 0; y < q.h; y++) for (let x = 0; x < q.w; x++) {
        if (!q.has(x, y)) continue;
        let n = 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && q.has(x + dx, y + dy)) n++;
        if (n === 0) loose++;
      }
    }
    assert.ok(loose <= 2 * sprites(p).length, `${p.name}: ${loose} loose pixels`);
  }
});

test('Pixels 7: everything that stands has a soft shadow under it, as the figures do (the game draws it)', () => {
  for (const p of pieces.filter((q) => q.kind === 'obstacle' || q.kind === 'breakable' || q.name === 'candles' || q.name === "the statue's head" || q.name === 'horned helm' || q.kind === 'quest' || q.name === 'crumbled wall')) {
    assert.ok(p.shadow !== undefined && p.shadow >= 0.15 && p.shadow <= 0.7, `${p.name}: its shadow ${p.shadow}`);
  }
});

// =================================================================================================
// THE MOMENTS, through the checks before he sees them.

const moments = wardenMoments();
const named = (n: string): Moment => {
  const m = moments.find((q) => q.name === n);
  if (!m) throw new Error(`no moment named ${n}`);
  return m;
};
interface Film {
  name: string;
  frames: Sprite[];
  before: Sprite[] | null;
  after: Sprite[] | null;
  tracks: Track[];
  contacts?: number[];
  m: Moment;
}
/** Each moment as it plays, on each face it has. */
const films: Film[] = moments.flatMap((m) => [
  { name: m.name, frames: m.frames, before: m.before, after: m.after, tracks: m.tracks, contacts: m.contacts, m },
  ...(m.right ? [{ name: `${m.name} (in the other face)`, frames: m.right.frames, before: m.right.before, after: m.right.after, tracks: m.right.tracks, contacts: m.right.contacts, m }] : []),
]);

test('moments: crisp, long enough to read, smooth (30 frames a second), every frame painted', () => {
  for (const f of films) {
    assert.ok(f.frames.length >= 10, `${f.name}: ${f.frames.length} frames`);
    assert.ok(f.m.fps >= 30, `${f.name}: ${f.m.fps} frames a second`);
    let soft = 0;
    for (const s of [...f.frames, ...(f.before ?? []), ...(f.after ?? [])]) each(s, (_r, _g, _b, a) => (soft += a === 255 ? 0 : 1));
    assert.ok(soft === 0, `${f.name}: ${soft} soft pixels`);
  }
});

test('moments: nothing pops as one starts or ends (its first frame what was there, its last what is left)', () => {
  for (const f of films) {
    const first = f.frames[0];
    const last = f.frames[f.frames.length - 1];
    if (f.before) assert.ok(unlike(first, f.before[0]) === 0, `${f.name}: its first frame is not what was there (${unlike(first, f.before[0])} pixels)`);
    else assert.ok(count(first) <= 40, `${f.name}: nothing was there, but its first frame has ${count(first)} pixels`);
    if (f.after) assert.ok(unlike(last, f.after[0]) === 0, `${f.name}: its last frame is not what is left (${unlike(last, f.after[0])} pixels)`);
    else assert.ok(count(last) === 0, `${f.name}: nothing is left, but its last frame has ${count(last)} pixels`);
  }
});

test('moments: nothing jumps from one frame to the next', () => {
  for (const f of films) {
    for (const t of f.tracks) {
      for (let i = 1; i < t.at.length; i++) {
        const a = t.at[i - 1];
        const b = t.at[i];
        if (!a || !b) continue;
        const d = Math.hypot(b.x - a.x, b.y - a.y);
        const most = (a.size + b.size) / 2 + 2;
        assert.ok(d <= most, `${f.name}, ${t.name}, frame ${i}: moved ${d.toFixed(1)} (most ${most.toFixed(1)})`);
      }
    }
  }
});

test('moments: nothing pops in or out in the middle; what goes, goes bit by bit', () => {
  for (const f of films) {
    for (const t of f.tracks) {
      let seen = false;
      for (let i = 0; i < t.at.length; i++) {
        const b = t.at[i];
        const now = b ? b.shown : 0;
        if (now > 0) seen = true;
        if (i === 0) continue;
        const a = t.at[i - 1];
        const was = a ? a.shown : 0;
        const jolt = f.m.jolts.includes(i);
        // coming: all at once only from the picture's edge, at a jolt, or born small
        if (now - was > 0.35) assert.ok(t.fromEdge || jolt || (b !== null && b.size <= 8), `${f.name}, ${t.name}: popped in at frame ${i} (${(was * 100).toFixed(0)}% to ${(now * 100).toFixed(0)}%)`);
        // going: bit by bit, but at a jolt
        if (was - now > 0.35) assert.ok(jolt, `${f.name}, ${t.name}: frame ${i} lost ${((was - now) * 100).toFixed(0)}% of it at once`);
      }
      assert.ok(seen, `${f.name}, ${t.name}: seen at all`);
    }
    // the picture as a whole: no frame loses or gains much of what is in it, but at a jolt
    for (let i = 1; i < f.frames.length; i++) {
      if (f.m.jolts.includes(i)) continue;
      const a = count(f.frames[i - 1]);
      const b = count(f.frames[i]);
      // (a change of fewer than 54 picture pixels, a dozen of the game's, is no pop)
      assert.ok(Math.abs(b - a) <= 0.45 * Math.max(a, b, 120), `${f.name}, frame ${i}: ${a} to ${b} pixels`);
    }
  }
});

test('moments: always moving, but where it is held on purpose', () => {
  for (const f of films) {
    for (let i = 1; i < f.frames.length; i++) {
      const d = unlike(f.frames[i - 1], f.frames[i]);
      if (f.m.holds.includes(i)) assert.ok(d === 0, `${f.name}: frame ${i} is held, but ${d} pixels changed`);
      else assert.ok(d >= 4, `${f.name}: frame ${i} hardly changed (${d} pixels)`);
    }
  }
});

test('moments: the rats feed, bolt flat out, never through each other, and go into the hole bit by bit', () => {
  for (const f of films.filter((q) => q.m.name === 'rats bolt')) {
    // feeding before they bolt: a loop that moves
    assert.ok(f.before !== null && f.before.length >= 2 && unlike(f.before[0], f.before[1]) > 0, `${f.name}: feeding before`);
    // never two in one place
    assert.ok(f.contacts !== undefined && f.contacts.length === f.frames.length && f.contacts.every((c) => c === 0), `${f.name}: rats through each other, ${(f.contacts ?? []).join(' ')}`);
    for (const t of f.tracks) {
      assert.ok(t.at[0]!.shown === 1, `${f.name}, ${t.name}: whole at the start`);
      const last = t.at[t.at.length - 1]!;
      assert.ok(last.shown === 0, `${f.name}, ${t.name}: all the way in by the end (${last.shown.toFixed(2)})`);
      // into the hole: when it starts to go, it is at the hole's mouth
      const first = t.at.findIndex((a) => a!.shown < 1);
      assert.ok(Math.hypot(t.at[first]!.x, t.at[first]!.y) < 16, `${f.name}, ${t.name}: starts to go in at (${t.at[first]!.x.toFixed(0)}, ${t.at[first]!.y.toFixed(0)}), not at the hole`);
      // flat out
      const steps = t.at.slice(1).map((a, i) => Math.hypot(a!.x - t.at[i]!.x, a!.y - t.at[i]!.y));
      assert.ok(Math.max(...steps) >= 5, `${f.name}, ${t.name}: fastest step ${Math.max(...steps).toFixed(1)}`);
      // it turns as a rat can, never snapping round in a frame (the second look found one pivot 35 degrees at once)
      for (let i = 2; i < t.at.length; i++) {
        const [p0, p1, p2] = [t.at[i - 2]!, t.at[i - 1]!, t.at[i]!];
        const s1 = Math.hypot(p1.x - p0.x, (p1.y - p0.y) * 2);
        const s2 = Math.hypot(p2.x - p1.x, (p2.y - p1.y) * 2);
        if (s1 < 2 || s2 < 2 || p2.shown < 1) continue;
        let d = Math.atan2((p2.y - p1.y) * 2, p2.x - p1.x) - Math.atan2((p1.y - p0.y) * 2, p1.x - p0.x);
        while (d > Math.PI) d -= Math.PI * 2;
        while (d < -Math.PI) d += Math.PI * 2;
        assert.ok(Math.abs(d) <= 0.6, `${f.name}, ${t.name}, frame ${i}: turned ${((Math.abs(d) * 180) / Math.PI).toFixed(0)} degrees in a frame`);
      }
    }
    // all three freeze together before they bolt, then all set off together
    const still = (i: number): boolean => f.tracks.every((t) => Math.hypot(t.at[i]!.x - t.at[i - 1]!.x, t.at[i]!.y - t.at[i - 1]!.y) < 0.5);
    let frozen = 0;
    for (let i = 1; i < f.frames.length && still(i); i++) frozen++;
    assert.ok(frozen >= 6, `${f.name}: still together ${frozen} frames before they bolt`);
    const off = f.tracks.map((t) => t.at.findIndex((a, i) => i > 0 && Math.hypot(a!.x - t.at[i - 1]!.x, a!.y - t.at[i - 1]!.y) >= 0.5));
    assert.ok(Math.max(...off) - Math.min(...off) <= 2, `${f.name}: they set off on frames ${off.join(', ')}`);
  }
  // they read on the floor: their fur lighter than the floor they run on
  const fur = Math.max(...['#4c3c42'].map((c) => luma(...rgb(c))));
  const floor = Math.max(...CRYPT_FLOORS[0].slab.slice(0, 3).map((c) => luma(...rgb(c))));
  assert.ok(fur >= floor + 6, `their fur ${fur.toFixed(0)}, the floor ${floor.toFixed(0)}`);
});

test('moments: the stone shifts in the wall, tips out and falls faster every frame, strikes at the jolt and breaks, and throws its dust wide', () => {
  const m = named('dust and a falling stone');
  for (const f of films.filter((q) => q.m === m)) {
    const jolt = m.jolts[0];
    const ys = f.tracks[0].at.map((a) => (a ? a.y : 0));
    // before it goes, it is in its place (what was there before is it, with its hairline crack)
    assert.ok(f.before !== null && unlike(f.frames[0], f.before[0]) === 0, `${f.name}: the stone in its place before`);
    // it shudders in its bed before it goes
    const xs = f.tracks[0].at.slice(0, jolt).map((a) => (a ? a.x : 0));
    assert.ok(new Set(xs.map((x) => Math.round(x))).size >= 3, `${f.name}: it shudders`);
    // the fall: the last six frames before the strike, faster every frame, and a long way
    const fall = ys.slice(jolt - 6, jolt);
    for (let i = 2; i < fall.length; i++) assert.ok(fall[i] - fall[i - 1] > fall[i - 1] - fall[i - 2], `${f.name}: faster at fall step ${i} (${fall.map((y) => y.toFixed(1)).join(', ')})`);
    assert.ok(ys[jolt] - ys[jolt - 7] >= 30, `${f.name}: it falls ${(ys[jolt] - ys[jolt - 7]).toFixed(0)} pixels`);
    // it breaks as it strikes: its other piece is born on the jolt, and goes its own way
    assert.ok(f.tracks[1].at[jolt - 1] === null && f.tracks[1].at[jolt] !== null, `${f.name}: breaks as it strikes`);
    const half = f.tracks[1].at.filter((a) => a !== null);
    assert.ok(Math.hypot(half[half.length - 1]!.x - half[0]!.x, half[half.length - 1]!.y - half[0]!.y) >= 6, `${f.name}: its broken piece rolls away`);
    // the blow throws chips and dust wide (a tile and a half)
    let widest = 0;
    for (const s of f.frames.slice(jolt)) {
      let x0 = Infinity;
      let x1 = -Infinity;
      each(s, (_r, _g, _b, _a, x) => {
        x0 = Math.min(x0, x);
        x1 = Math.max(x1, x);
      });
      widest = Math.max(widest, x1 - x0 + 1);
    }
    assert.ok(widest >= 96, `${f.name}: its dust and chips ${widest} pixels across at the widest`);
    // and nothing is held still while the game goes on (the second look: a freeze in a moment reads as a stall)
    assert.ok(m.holds.length === 0, `${f.name}: held ${m.holds.length} frames`);
  }
});

test('moments: the candle: the gust leans every flame hard over, the tallest flares and is snuffed, its smoke rises high', () => {
  const m = named('a candle gutters out');
  const flame = m.tracks.find((t) => t.name === 'the tallest flame')!;
  const smoke = m.tracks.find((t) => t.name === 'its smoke')!;
  const sizes = flame.at.filter((a) => a !== null).map((a) => a!.size - 2);
  assert.ok(Math.max(...sizes) >= 12, `the tallest flares to ${Math.max(...sizes)}`);
  const lean = Math.max(...flame.at.filter((a) => a !== null).map((a) => a!.x - flame.at[0]!.x));
  assert.ok(lean >= 10, `leaned over ${lean.toFixed(1)}`);
  const top = Math.min(...smoke.at.filter((a) => a !== null).map((a) => a!.y));
  assert.ok(top <= -60, `its smoke rises to ${top}`);
  // and what is left is the candles with three of them out, the tallest first among them
  assert.ok(unlike(m.frames[m.frames.length - 1], candles(0, true, [2, 4, 1])) === 0, 'three of them left out');
  // more than one goes out, one after another (the second look: only one of four went)
  const outs = m.after![0];
  assert.ok(unlike(outs, candles(0)) > 0 && unlike(candles(0, true, [2]), outs) > 0, 'more than the tallest out');
});

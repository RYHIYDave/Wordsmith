// THE CHECKS EVERY CRYPT FLOOR'S PIECES AND MOMENTS GO THROUGH before he sees them (his art rulebook,
// and his notes on floor 1's first pictures, 10 Oct 2026: "I don’t like the wall panels all being in
// the exact same spot", "Some assets could be the full height like a large crack down the wall.  Or
// a floor tile and wall combo that’s shows a crumbled wall and the debris piled on the floor.", "And
// the rats just kind of disappear.  Animations need run the checks."). Floor 1's own are in
// tests/floor1.test.ts, as they were when he said yes to it; these are the same, for any floor.
// A floor's test file calls floorChecks(...) and adds what is its own.

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import type { Moment, Piece, Track } from '../src/art/floor1';
import { makeGateArt } from '../src/art/gates';
import { WORD_COLOR } from '../src/art/icons';
import { COAL, EMBER, makeDungeonProps } from '../src/art/props';
import type { Sprite } from '../src/engine/px';
import { paintingOf, unlike } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
}
export const test: (name: string, fn: () => void) => void = nodeTest;
export const assert: Assert = nodeAssert;

export const luma = (r: number, g: number, b: number): number => 0.2126 * r + 0.7152 * g + 0.0722 * b;
export function hsv(r: number, g: number, b: number): [number, number, number] {
  const M = Math.max(r, g, b);
  const m = Math.min(r, g, b);
  const c = M - m;
  let h = 0;
  if (c > 0) h = M === r ? ((g - b) / c) % 6 : M === g ? (b - r) / c + 2 : (r - g) / c + 4;
  return [(h * 60 + 360) % 360, M === 0 ? 0 : c / M, M / 255];
}
export const rgb = (c: string): [number, number, number] => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
export const hex = (r: number, g: number, b: number): string => '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');

/** Every picture of a piece: its frames, and a wall piece's on both faces at every spot. */
export const sprites = (p: Piece): Sprite[] => [...(p.frames ?? []), ...(p.left ?? []), ...(p.right ?? []), ...(p.spots ?? []).flatMap((s) => [...s.left, ...s.right])];
export function each(s: Sprite, f: (r: number, g: number, b: number, a: number, x: number, y: number) => void): void {
  const p = paintingOf(s);
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
    const i = (y * p.w + x) * 4;
    if (p.d[i + 3] > 0) f(p.d[i], p.d[i + 1], p.d[i + 2], p.d[i + 3], x, y);
  }
}
export const count = (s: Sprite): number => {
  let n = 0;
  each(s, () => n++);
  return n;
};
export const mean = (s: Sprite): number => {
  let t = 0;
  let n = 0;
  each(s, (r, g, b) => {
    t += luma(r, g, b);
    n++;
  });
  return t / Math.max(1, n);
};
/** The anchor, in picture pixels. */
export const anchor = (s: Sprite): [number, number] => [Math.round(s.ax * (s.density ?? 1)), Math.round(s.ay * (s.density ?? 1))];
/** What gives light, and so may burn bright: fire and its embers (his Colour 4 is for the places, not their fires). */
export const SHINES = new Set<string>([...EMBER, ...COAL, '#fff0a0', '#ffb070', '#ff4f8a', '#c0206a', '#7a1058'].map((c) => c.toLowerCase()));
/** The seams, ink. */
export const INKS = new Set<string>(['#0e0c24']);

export interface FloorSpec {
  /** Its name, for the checks' names ("floor 2"). */
  label: string;
  pieces: Piece[];
  moments: Moment[];
  /** Pieces whose one place is all they have (a breach that lines up with its heap, a trap's slot). */
  onePlace: string[];
  /** Wall pieces that run the wall's height, or sit at its foot, wherever they are: no height of their own on it. */
  fullHeight: string[];
  /** Wall pieces that give off their own light (a torch): their fire as bright in shade as in the light. */
  fires: string[];
  /** Traps laid as a floor tile, anchored at the middle (the spike floor, a plate). */
  tileTraps: string[];
  /** What lies on the floor and stands up off it enough for a shadow. */
  shadowed: string[];
}

/** Every check every floor goes through. */
export function floorChecks(F: FloorSpec): void {
  const { pieces, moments, label } = F;
  const byName = (n: string): Piece => {
    const p = pieces.find((q) => q.name === n);
    if (!p) throw new Error(`no piece named ${n}`);
    return p;
  };

  test(`${label}, Places 7: between 40 and 50 pieces, of the kinds he named, each its own, every picture painted`, () => {
    assert.ok(pieces.length >= 40 && pieces.length <= 50, `${pieces.length} pieces`);
    for (const k of ['wall tile', 'floor tile', 'breakable', 'on the wall', 'on the floor', 'obstacle', 'door', 'gate', 'trap', 'quest']) assert.ok(pieces.some((p) => p.kind === k), `a ${k}`);
    assert.ok(new Set(pieces.map((p) => p.name)).size === pieces.length, 'each its own name');
    for (const p of pieces) {
      const all = sprites(p);
      assert.ok(all.length > 0, `${p.name} has pictures`);
      for (const s of all) assert.ok(count(s) > 20, `${p.name}: a picture of ${count(s)} pixels`);
    }
  });

  test(`${label}, Pixels 1: crisp, every pixel all there or not at all; a floor tile covers its whole diamond`, () => {
    for (const p of pieces) {
      let soft = 0;
      for (const s of sprites(p)) each(s, (_r, _g, _b, a) => (soft += a === 255 ? 0 : 1));
      assert.ok(soft === 0, `${p.name}: ${soft} soft pixels`);
    }
    for (const p of pieces.filter((q) => q.kind === 'floor tile' || F.tileTraps.includes(q.name))) {
      for (const s of p.frames!) {
        const q = paintingOf(s);
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

  test(`${label}, Pixels 1, crisp: no loose single pixels standing alone in any piece (but a glint or a spark)`, () => {
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

  test(`${label}, Colour 3: no cyan anywhere; pink only on the boss gate, his embers`, () => {
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

  test(`${label}, Colour 4: the places stay darker than the darkest word; what stands, lies or hangs in them, and the gates, no brighter than the game's own`, () => {
    const darkest = Math.min(...Object.values(WORD_COLOR).map((c) => luma(...rgb(c))));
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
    const lumas = (ss: Sprite[]): number[] => {
      const h = new Array<number>(256).fill(0);
      for (const s of ss) each(s, (r, g, b) => {
        const l = Math.round(luma(r, g, b));
        if (!SHINES.has(hex(r, g, b)) && l > 24) h[l]++;
      });
      return h;
    };
    const meanOf = (h: number[]): number => h.reduce((t, k, l) => t + k * l, 0) / Math.max(1, h.reduce((t, k) => t + k, 0));
    const P = makeDungeonProps();
    const props = lumas([...P.brazier, P.chest, P.chestOpen, P.barrel, P.urn, P.pillar, ...P.bones, ...P.rubble, ...P.staves, ...P.shards, P.portalOff, P.fallen, P.fallenSearched]);
    for (const k of ['obstacle', 'breakable', 'on the floor', 'on the wall', 'quest', 'door']) {
      const ours = lumas(pieces.filter((p) => p.kind === k).flatMap(sprites));
      const big = k === 'obstacle' || k === 'on the wall' || k === 'door';
      assert.ok(p99(ours) <= p99(props) && (!big || meanOf(ours) <= meanOf(props)), `${k}: at the 99th ${p99(ours)}, on the whole ${meanOf(ours).toFixed(0)}; the game's own things ${p99(props)} and ${meanOf(props).toFixed(0)}`);
    }
    const V = makeGateArt();
    for (const [name, boss] of [['the gate', false], ["the boss's gate", true]] as const) {
      const ours = lumas(sprites(byName(name)));
      const theirs = lumas([...V.arch(true, boss, false).map((q) => q.s), V.pillar(boss)]);
      assert.ok(p99(ours) <= p99(theirs) && meanOf(ours) <= meanOf(theirs) + 2, `${name}: at the 99th ${p99(ours)}, on the whole ${meanOf(ours).toFixed(0)}; the game's own ${p99(theirs)} and ${meanOf(theirs).toFixed(0)}`);
    }
  });

  test(`${label}, Pixels 4: light from the upper left, on what stands, on doors and on the wall's two faces`, () => {
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
    const door = byName('the door');
    assert.ok(mean(door.frames![1]) < mean(door.frames![0]) - 4, `the door's leaf: lit ${mean(door.frames![0]).toFixed(0)}, in shade ${mean(door.frames![1]).toFixed(0)}`);
    for (const p of pieces.filter((q) => q.spots)) {
      for (const sp of p.spots!) assert.ok(mean(sp.right[0]) < mean(sp.left[0]), `${p.name} at (${sp.du}, ${sp.dv}): lit ${mean(sp.left[0]).toFixed(0)}, in shade ${mean(sp.right[0]).toFixed(0)}`);
    }
    const fire = (s: Sprite): number => {
      let n = 0;
      each(s, (r, g, b) => (n += EMBER.includes(hex(r, g, b)) ? 1 : 0));
      return n;
    };
    for (const name of F.fires) {
      for (const sp of byName(name).spots!) {
        for (let f = 0; f < sp.left.length; f++) {
          assert.ok(fire(sp.right[f]) > 10 && fire(sp.right[f]) >= fire(sp.left[f]) * 0.9, `${name}'s fire in shade: ${fire(sp.right[f])} pixels, in the light ${fire(sp.left[f])}`);
          let khaki = 0;
          each(sp.right[f], (r, g, b) => {
            const [h, sa, v] = hsv(r, g, b);
            if (h >= 40 && h <= 75 && sa > 0.25 && v > 0.3 && !SHINES.has(hex(r, g, b))) khaki++;
          });
          assert.ok(khaki === 0, `${name} in shade: ${khaki} khaki pixels`);
        }
      }
    }
  });

  test(`${label}, his notes: the wall pieces in many places and heights, none in one band`, () => {
    const middles: number[] = [];
    for (const p of pieces.filter((q) => q.spots)) {
      if (!F.onePlace.includes(p.name)) assert.ok(p.spots!.length >= 3, `${p.name}: ${p.spots!.length} places`);
      for (const s of p.spots!) {
        let y0 = Infinity;
        let y1 = -Infinity;
        each(s.left[0], (_r, _g, _b, _a, _x, y) => {
          y0 = Math.min(y0, y);
          y1 = Math.max(y1, y);
        });
        if (y1 - y0 < 60 && !F.fullHeight.includes(p.name)) middles.push(Math.round((y0 + y1) / 2) - anchor(s.left[0])[1]);
      }
    }
    for (let y = Math.min(...middles); y <= Math.max(...middles); y++) {
      const n = middles.filter((m) => m >= y && m < y + 12).length;
      assert.ok(n <= middles.length / 3, `${n} of the ${middles.length} in the band from ${y} to ${y + 11}`);
    }
  });

  test(`${label}, his notes, each piece: every wall piece in places of its own, low and high and across the wall, within its tile, and none up where the wall fades into the dark`, () => {
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
      if (!F.fullHeight.includes(p.name)) assert.ok(Math.max(...dv) - Math.min(...dv) >= 8, `${p.name}: its places only ${Math.max(...dv) - Math.min(...dv)} apart up the wall`);
      const [w0, w1] = across(p.spots![0].left[0]);
      const room = Math.min(10, 31 - (w1 - w0 + 1));
      assert.ok(Math.max(...du) - Math.min(...du) >= room, `${p.name}: its places only ${Math.max(...du) - Math.min(...du)} apart across it (room for ${room})`);
    }
    for (const p of pieces.filter((q) => q.spots)) {
      for (const sp of p.spots!) {
        const [u0, u1] = across(sp.left[0]);
        assert.ok(u0 >= -16 && u1 <= 15, `${p.name} at (${sp.du}, ${sp.dv}): reaches across from ${u0} to ${u1}`);
      }
    }
    for (const p of pieces.filter((q) => q.spots && !F.fullHeight.includes(q.name))) {
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

  test(`${label}, Pixels 7: everything that stands has a soft shadow under it, as wide as its foot (the game draws it)`, () => {
    for (const p of pieces.filter((q) => q.kind === 'obstacle' || q.kind === 'breakable' || q.kind === 'quest' || F.shadowed.includes(q.name))) {
      assert.ok(p.shadow !== undefined && p.shadow >= 0.15 && p.shadow <= 0.7, `${p.name}: its shadow ${p.shadow}`);
      const s = p.frames![0];
      const q = paintingOf(s);
      const ay = Math.round(s.ay * (s.density ?? 1));
      let x0 = Infinity;
      let x1 = -Infinity;
      for (let y = Math.max(0, ay - 24); y < q.h; y++) for (let x = 0; x < q.w; x++) if (q.has(x, y)) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); }
      const foot = (x1 - x0 + 1) / 4;
      const reach = p.shadow! * 22.6 * 1.5;
      assert.ok(reach >= 0.7 * foot && reach <= 1.8 * foot, `${p.name}: its shadow reaches ${reach.toFixed(1)} to each side, its foot ${foot.toFixed(1)}`);
    }
  });

  // THE MOMENTS
  const films = moments.flatMap((m) => [
    { name: m.name, frames: m.frames, before: m.before, after: m.after, tracks: m.tracks, contacts: m.contacts, m },
    ...(m.right ? [{ name: `${m.name} (in the other face)`, frames: m.right.frames, before: m.right.before, after: m.right.after, tracks: m.right.tracks as Track[], contacts: m.right.contacts, m }] : []),
  ]);

  test(`${label}, moments: crisp, long enough to read, smooth (30 frames a second), every frame painted`, () => {
    assert.ok(moments.length >= 2, `${moments.length} moments`);
    for (const f of films) {
      assert.ok(f.frames.length >= 10, `${f.name}: ${f.frames.length} frames`);
      assert.ok(f.m.fps >= 30, `${f.name}: ${f.m.fps} frames a second`);
      let soft = 0;
      for (const s of [...f.frames, ...(f.before ?? []), ...(f.after ?? [])]) each(s, (_r, _g, _b, a) => (soft += a === 255 ? 0 : 1));
      assert.ok(soft === 0, `${f.name}: ${soft} soft pixels`);
    }
  });

  test(`${label}, moments: nothing pops as one starts or ends (its first frame what was there, its last what is left)`, () => {
    for (const f of films) {
      const first = f.frames[0];
      const last = f.frames[f.frames.length - 1];
      if (f.before) assert.ok(unlike(first, f.before[0]) === 0, `${f.name}: its first frame is not what was there (${unlike(first, f.before[0])} pixels)`);
      else assert.ok(count(first) <= 40, `${f.name}: nothing was there, but its first frame has ${count(first)} pixels`);
      if (f.after) assert.ok(unlike(last, f.after[0]) === 0, `${f.name}: its last frame is not what is left (${unlike(last, f.after[0])} pixels)`);
      else assert.ok(count(last) === 0, `${f.name}: nothing is left, but its last frame has ${count(last)} pixels`);
    }
  });

  test(`${label}, moments: nothing jumps from one frame to the next`, () => {
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

  test(`${label}, moments: nothing pops in or out in the middle; what goes, goes bit by bit`, () => {
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
          if (now - was > 0.35) assert.ok(t.fromEdge || jolt || (b !== null && b.size <= 8), `${f.name}, ${t.name}: popped in at frame ${i} (${(was * 100).toFixed(0)}% to ${(now * 100).toFixed(0)}%)`);
          if (was - now > 0.35) assert.ok(jolt, `${f.name}, ${t.name}: frame ${i} lost ${((was - now) * 100).toFixed(0)}% of it at once`);
        }
        assert.ok(seen, `${f.name}, ${t.name}: seen at all`);
      }
      for (let i = 1; i < f.frames.length; i++) {
        if (f.m.jolts.includes(i)) continue;
        const a = count(f.frames[i - 1]);
        const b = count(f.frames[i]);
        assert.ok(Math.abs(b - a) <= 0.45 * Math.max(a, b, 120), `${f.name}, frame ${i}: ${a} to ${b} pixels`);
      }
    }
  });

  test(`${label}, moments: always moving, but where it is held on purpose`, () => {
    for (const f of films) {
      for (let i = 1; i < f.frames.length; i++) {
        const d = unlike(f.frames[i - 1], f.frames[i]);
        if (f.m.holds.includes(i)) assert.ok(d === 0, `${f.name}: frame ${i} is held, but ${d} pixels changed`);
        else assert.ok(d >= 4, `${f.name}: frame ${i} hardly changed (${d} pixels)`);
      }
    }
  });

  test(`${label}, moments: crisp, no speckle: hardly a loose single pixel in any frame (the second look on floor 2 found birds fading out as a cloud of dots)`, () => {
    for (const f of films) {
      f.frames.forEach((s, i) => {
        const q = paintingOf(s);
        let loose = 0;
        for (let y = 0; y < q.h; y++) for (let x = 0; x < q.w; x++) {
          if (!q.has(x, y)) continue;
          let n = 0;
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && q.has(x + dx, y + dy)) n++;
          if (n === 0) loose++;
        }
        assert.ok(loose <= 4, `${f.name}, frame ${i}: ${loose} loose pixels`);
      });
    }
  });

  test(`${label}, moments: what moves in a crowd never moves through another`, () => {
    for (const f of films) if (f.contacts) assert.ok(f.contacts.length === f.frames.length && f.contacts.every((c) => c === 0), `${f.name}: through each other, ${f.contacts.join(' ')}`);
  });
}

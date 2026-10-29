// FLOOR 18'S BOSS, THE QUEEN: WHAT HER MOVES LEAVE IN THE HALL, AND HER MIRROR (the art chat, 29 Oct 2026). A MOCK-UP:
// NOT IN THE GAME, behind QUEEN_ON (art/queen.ts, off). Her moves are art/queen_moves.ts.
//
//   THE POISON (her comb, her basic): where her comb strikes, a cloud of violet poison bursts out in a flash (two frames:
//     his Movement 9), billows and hangs there, thinning and sinking, gone in a little over two seconds. Never cyan.
//   THE HALL'S MIRRORS: tall pier glasses round the Mirror Hall, along both its long sides, their glass facing in across
//     it (from in front of the game's eye the far ones show their glass, the near ones their backs). Each phase another
//     wakes (the game's: `awake`, its glass stirring with fog).
//   SHATTER: every mirror trembles and crazes, and the lane of floor before each lights up with its cold glints (the
//     warning, held as long as she holds her arms up); then all of them burst at once (two frames) and their glass flies
//     straight across the hall in LANES as wide as the mirrors, smeared as it flies, the gaps between the lanes safe to
//     stand in; the shards fall and glitter on the floor and are gone; the mirrors' glass grows back.
//   WHERE THE REFLECTIONS STEP OUT (Reflections): a looking-glass gathers out of its shards, its glass ripples hard as
//     something comes through (the copies are another helper's, mockup/reflections), and it bursts back into shards.
//   HER MIRROR, at the end of the hall (his brief: “Her mirror hangs at the end of the hall and talks to her the whole
//     fight”): a great pier glass in a frame of silver-gilt, its crest a crown of glass spikes like hers; still, its glass
//     dark, a grey fog drifting in it; SPEAKING, the fog gathers into a faint face of grey fog that speaks, its words a
//     whisper of grey; and as she dies (his brief: “Death: her mirror cracks across and, for the first time, tells the
//     truth”), it CRACKS ACROSS in a flash and its face clears, the pink gone from its eyes, and it speaks the truth.
//
// Every one of these paints from in front, as the game's eye sees the hall (a prop of the hall does not turn round), and
// each says its own times.

import type { Painted } from './kit';
import { INK, hash } from './kit';
import type { Ramp } from './kit';
import { ENEMY_RIM, FLAME } from './mkit';
import { TILE3, paintBits } from './new_mobs3';
import type { Bit, Put } from './new_mobs3';
import { QN_GILT, QN_GLASS, QN_MIRROR, QN_POISON, QN_SILVER, glassBits } from './queen';
import type { Glass } from './queen';
import { stage } from './skin';
import type { GameView, Stage } from './skin';
import type { V3 } from './skeleton';

const TAU = Math.PI * 2;
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const smooth = (a: number, b: number, t: number): number => {
  const u = clamp01((t - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const lay = (px: Painted['px'], x: number, y: number, c: string, size = 1): void => {
  const xi = Math.round(x - size / 2);
  const yi = Math.round(y - size / 2);
  for (let dy = 0; dy < size; dy++) for (let dx = 0; dx < size; dx++) if (xi + dx >= 0 && yi + dy >= 0 && xi + dx < px.w && yi + dy < px.h) px.set(xi + dx, yi + dy, c);
};
/** A line of pixels from one point of the picture to another. */
const line = (px: Painted['px'], x0: number, y0: number, x1: number, y1: number, c: string, every = 1): void => {
  const n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
  for (let i = 0; i <= n; i++) if (i % every === 0) lay(px, x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n, c);
};

// =============================================================================================
// THE POISON: a cloud where her comb strikes

export const CLOUD_CANVAS = { w: 240, h: 176, ax: 120, ay: 112 } as const;
/**
 * Its times (seconds from her comb striking): out in two frames; held, billowing; thinning and sinking; gone. Its reach
 * (her own lengths): a tile and a half out, three across. It lies low, a mist over the floor, and is laid UNDER the
 * figures, so that it never hides the hero (his rulebook, Animations 4).
 */
export const CLOUD_FX = { burst: [0, 2 / 30] as const, hold: 1.3, long: 2.2, r: 1.5 * TILE3, high: 16 } as const;
/** The cloud's lobes: each a billow round the point it struck, at its own height, its own size, rolling slowly. */
function lobes(t: number): { c: V3; r: number }[] {
  const out: { c: V3; r: number }[] = [];
  const R = CLOUD_FX.r;
  const grow = t <= CLOUD_FX.burst[1] ? Math.max(0.15, t / CLOUD_FX.burst[1]) : 1 + 0.08 * Math.min(1, t);
  const thin = 1 - smooth(CLOUD_FX.hold, CLOUD_FX.long, t);
  for (let i = 0; i < 22; i++) {
    const a = hash(i, 1, 7801) * TAU + t * (0.3 + 0.3 * hash(i, 2, 7801)) * (i % 2 ? 1 : -1);
    const d = R * (0.2 + 0.68 * Math.sqrt(hash(i, 3, 7801))) * grow;
    const z = (4 + CLOUD_FX.high * hash(i, 4, 7801) * (1 - 0.5 * (d / R))) * (0.6 + 0.4 * thin) + 2 * Math.sin(t * 2 + i);
    const r = (9 + 9 * hash(i, 5, 7801)) * grow * (0.45 + 0.55 * thin);
    out.push({ c: [Math.cos(a) * d, Math.sin(a) * d * 0.95, z], r });
  }
  return out;
}
/** THE POISON CLOUD `t` seconds after her comb strikes (round the point it struck). */
export function cloudPainted(t: number, view: GameView = 'front'): Painted {
  const can = CLOUD_CANVAS;
  const st = stage(view === 'back' ? 'rear' : view, can.ax, can.ay, can);
  const px = st.whole(null);
  if (t < 0 || t > CLOUD_FX.long) return { px, lights: [] };
  const L = lobes(t).map((o) => {
    const [x, y] = st.at(o.c);
    return { x, y, r: o.r * 0.9 };
  });
  const thin = 1 - smooth(CLOUD_FX.hold, CLOUD_FX.long, t);
  const field = (x: number, y: number): number => {
    let f = 0;
    for (const o of L) {
      const d2 = ((x - o.x) ** 2 + (y - o.y) ** 2) / (o.r * o.r);
      if (d2 < 2.2) f += Math.exp(-d2 * 1.6);
    }
    return f;
  };
  for (let y = 0; y < can.h; y++) {
    for (let x = 0; x < can.w; x++) {
      const f = field(x + 0.5, y + 0.5);
      if (f < 0.22) continue;
      // (lit from the upper left: the field a step up and left is how the light falls on it)
      const lit = field(x - 2.5, y - 3.5) - f;
      // (its thin edge dithered, crisp, every other pixel; thinner still as it goes)
      const edge = f < 0.36 + 0.25 * (1 - thin);
      if (edge && (x + y) % 2) continue;
      if (thin < 0.6 && hash(x, y, 7802) > thin * 1.4) continue;
      const k = f > 1.15 ? (lit < -0.05 ? 1 : 2) : f > 0.6 ? (lit > 0.08 ? 4 : lit > -0.04 ? 3 : 2) : edge ? 1 : lit > 0.05 ? 3 : 2;
      px.set(x, y, QN_POISON[k]);
    }
  }
  // its burst: a ring of violet and the enemy's pink thrown out across the floor in a flash
  if (t <= CLOUD_FX.burst[1] + 0.1) {
    const k = clamp01(t / (CLOUD_FX.burst[1] + 0.1));
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * TAU;
      const r = CLOUD_FX.r * (0.5 + 0.7 * k);
      const [x, y] = st.at([Math.cos(a) * r, Math.sin(a) * r, 1 + 4 * (1 - k)]);
      lay(px, x, y, i % 4 === 0 ? FLAME[2] : QN_POISON[4], 2);
    }
  }
  // drops of poison glinting in it while it holds
  if (thin > 0.5) {
    const tick = Math.floor(t * 12);
    for (let i = 0; i < 14; i++) {
      if ((i + tick) % 3) continue;
      const a = hash(i, 6, 7803) * TAU;
      const d = CLOUD_FX.r * Math.sqrt(hash(i, 7, 7803)) * 0.8;
      const [x, y] = st.at([Math.cos(a) * d, Math.sin(a) * d, 4 + 20 * hash(i, 8, 7803)]);
      lay(px, x, y, (i + tick) % 2 ? FLAME[2] : QN_POISON[4]);
    }
  }
  return { px, lights: [] };
}

// =============================================================================================
// THE MIRROR HALL: its floor an ellipse; its mirrors along both long sides

/** The arena (her own lengths): an ellipse 20 tiles along the hall (its x) and 17 across it (its y), as a boss arena is. */
export const ARENA = { a: 10 * TILE3, b: 8.5 * TILE3 } as const;
/** A hall mirror's glass: as wide as a lane, a tile and a half; as tall as two of her. */
export const HALL_GLASS = { half: 0.75 * TILE3, tall: 118 } as const;
/** How high a mirror on the hall's near side is shown (her own lengths): cut away above, as the game cuts what stands between the eye and the fight. */
export const HALL_CUT = 34;
/** Where the hall's mirrors stand along the hall (tiles from its middle), on both its long sides: a lane before each. */
export const HALL_AT = [-7.5, -4.5, -1.5, 1.5, 4.5, 7.5] as const;
export interface HallMirror {
  /** Along the hall (her own lengths), and which side: 1 the far side (its glass toward the eye), -1 the near (its back). */
  x: number;
  side: 1 | -1;
  /** Where it stands: its glass's plane across the hall (her own lengths). */
  y: number;
}
/** Every mirror of the hall: six each side, standing just inside the ellipse's edge, facing in. */
export const HALL_MIRRORS: ReadonlyArray<HallMirror> = HALL_AT.flatMap((tx) => {
  const x = tx * TILE3;
  const edge = ARENA.b * Math.sqrt(Math.max(0, 1 - (x / ARENA.a) ** 2));
  return [1, -1].map((side) => ({ x, side: side as 1 | -1, y: side * (edge - 0.35 * TILE3) }));
});
/**
 * SHATTER'S LANES (her own lengths, along the hall): each mirror's lane, the floor straight across the hall before it,
 * as wide as its glass; and the gaps between them, safe to stand in.
 */
export const SHATTER_LANES: ReadonlyArray<readonly [number, number]> = HALL_AT.map((tx) => [tx * TILE3 - HALL_GLASS.half, tx * TILE3 + HALL_GLASS.half] as const);
/** Its times (seconds from her move's start, art/queen_moves.ts QN_SHATTER): the mirrors tremble and the lanes light (the warning); they burst at her blow; the glass flies; it lies glittering; it grows back. */
export const SHATTER_FX = { tremble: [0.3, 1.367] as const, burst: [41 / 30, 43 / 30] as const, fly: 0.45, lie: [1.85, 3.0] as const, regrow: [2.6, 3.4] as const, long: 3.4 } as const;

/** A hall mirror's glass as its moment of Shatter has it: still; trembling and crazing; burst out; growing back. */
function hallGlassAt(m: HallMirror, t: number | null, awake: boolean, i: number): Glass {
  const g: Glass = { at: [0, 0], half: HALL_GLASS.half, tall: HALL_GLASS.tall, form: 1, gone: 0, ripples: [], t: t ?? 0, cut: m.side === -1 ? HALL_CUT : undefined, keepFrame: true };
  if (awake) g.ripples = [[0, 70, ((t ?? 0) * 0.5 + i * 0.37) % 2.4]];
  if (t === null) return g;
  const [b0, b1] = SHATTER_FX.burst;
  if (t < b0) {
    g.shake = smooth(SHATTER_FX.tremble[0], b0, t) * (0.6 + 0.4 * Math.sin(t * 9 + i));
    g.crazed = smooth(SHATTER_FX.tremble[0] + 0.2, b0, t);
  } else if (t < SHATTER_FX.regrow[0]) {
    // (out in two frames: every pane gone)
    g.gone = Math.min(1, (t - b0) / (b1 - b0));
    g.crazed = 1;
  } else {
    g.form = smooth(SHATTER_FX.regrow[0], SHATTER_FX.regrow[1], t);
    g.gone = 0;
  }
  void m;
  return g;
}
/** A hall mirror's bits, in its own place (its glass the plane y = 0, facing -y if `side` is 1, +y if -1: its glass's middle at x = 0). */
function hallBits(put: Put, side: 1 | -1, g: Glass): [V3, string, number][] {
  if (side === 1) return glassBits(put, g, 'hall').shards;
  // (the near side: the same mirror turned round, its back to the eye: a board of dark gilt behind its frame)
  const bits: Bit[] = [];
  const sub: Put = (part, piece, shape) => bits.push({ part, piece, shape });
  const shards = glassBits(sub, g, 'hall');
  const flip = (p: V3): V3 => [-p[0], -p[1], p[2]];
  for (const b of bits) {
    const sh = b.shape;
    if (sh.k === 'rod') put(b.part, b.piece, { ...sh, a: flip(sh.a), b: flip(sh.b) });
    else if (sh.k === 'ball') put(b.part, b.piece, { ...sh, c: flip(sh.c) });
    else if (sh.k === 'panel') put(b.part, b.piece, { ...sh, c: flip(sh.c), u: [-sh.u[0], -sh.u[1], sh.u[2]] });
  }
  return shards.shards.map(([p, c, n]) => [flip(p), c, n] as [V3, string, number]);
}
export const HALL_MIRROR_CANVAS = { w: 140, h: 210, ax: 70, ay: 176 } as const;
/**
 * ONE OF THE HALL'S MIRRORS (`i` of HALL_MIRRORS), on its own picture, its foot's middle on the anchor: still (`t` null), or
 * `t` seconds into her Shatter; `awake`, its glass stirring (each phase another wakes).
 */
export function hallMirrorPainted(i: number, t: number | null = null, awake = false): Painted {
  const m = HALL_MIRRORS[i];
  const can = HALL_MIRROR_CANVAS;
  const st = stage('front', can.ax, can.ay, can);
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => bits.push({ part, piece, shape });
  const shards = hallBits(put, m.side, hallGlassAt(m, t, awake, i));
  const lights = paintBits(st, bits, [0, 0, 40]);
  const px = st.whole(null);
  for (const [p, c, n] of shards) {
    const [x, y] = st.at(p);
    lay(px, x, y, c, n);
  }
  return { px, lights };
}

// =============================================================================================
// SHATTER: the storm of glass across the hall, in its lanes

export const SHATTER_CANVAS = { w: 900, h: 620, ax: 450, ay: 380 } as const;
/** One shard of one mirror's burst: where in the lane it flies (across it, up off the floor), how fast, when it leaves. */
interface Shard {
  lane: number;
  across: number;
  z: number;
  speed: number;
  delay: number;
  y0: number;
  dir: number;
  big: boolean;
  seed: number;
}
const SHARDS: Shard[] = (() => {
  const out: Shard[] = [];
  HALL_MIRRORS.forEach((m, mi) => {
    const lane = HALL_AT.indexOf(Math.round(m.x / TILE3 * 2) / 2 as (typeof HALL_AT)[number]);
    for (let j = 0; j < 44; j++) {
      const seed = mi * 100 + j;
      out.push({
        lane,
        // (inside the lane, a shard's own width clear of its edges)
        across: (hash(seed, 1, 7811) - 0.5) * 2 * (HALL_GLASS.half - 3),
        z: 4 + (HALL_GLASS.tall - 22) * hash(seed, 2, 7811),
        speed: (34 + 14 * hash(seed, 3, 7811)) * TILE3,
        delay: 0.08 * hash(seed, 4, 7811),
        y0: m.y,
        dir: -m.side,
        big: hash(seed, 5, 7811) < 0.42,
        seed,
      });
    }
  });
  return out;
})();
/** Where a shard is `since` seconds after the burst (null before it leaves), and whether it has come down. */
function shardAt(s: Shard, since: number): { p: V3; down: boolean } | null {
  const u = since - s.delay;
  if (u < 0) return null;
  const x = HALL_AT[s.lane] * TILE3 + s.across;
  const edge = ARENA.b * Math.sqrt(Math.max(0, 1 - (x / ARENA.a) ** 2)) - 0.2 * TILE3;
  const far = Math.abs(s.y0) + edge;
  const went = Math.min(far, s.speed * u);
  const y = s.y0 + s.dir * went;
  // (it flies level, dipping as it goes; at the far side it drops)
  const k = went / far;
  if (went < far) return { p: [x, y, Math.max(1, s.z * (1 - 0.35 * k * k))], down: false };
  const after = u - far / s.speed;
  const z = Math.max(0.5, s.z * 0.65 - 260 * after * after);
  return { p: [x + (hash(s.seed, 6, 7811) - 0.5) * 6 * Math.min(1, after * 4), y - s.dir * 3 * Math.min(1, after * 4), z], down: z <= 0.5 };
}
/** THE GLASS IN FLIGHT `t` seconds into her move (her own lengths, the hall's middle at nothing), each piece with the lane it flies in. */
export function shardsAt(t: number): { lane: number; p: V3 }[] {
  const since = t - SHATTER_FX.burst[0];
  if (since < 0) return [];
  const out: { lane: number; p: V3 }[] = [];
  for (const s of SHARDS) {
    const a = shardAt(s, since);
    if (a && !a.down) out.push({ lane: s.lane, p: a.p });
  }
  return out;
}
/**
 * SHATTER `t` seconds into her move, as the game's eye sees the hall (its middle on the anchor): `floor`, what lies on
 * the floor (the lanes lit before the burst, the glass lying after it), laid under the figures; `air`, the glass
 * flying, laid among them by how near the eye it is: only the glass whose nearness (along the hall less across it, her
 * own lengths, as the game sorts what stands on its floor) is `between` these two, so that it can be laid behind a
 * figure that is nearer and over one that is further.
 */
export function shatterPainted(t: number, layer: 'floor' | 'air', between: readonly [number, number] = [-Infinity, Infinity]): Painted {
  const can = SHATTER_CANVAS;
  const st = stage('front', can.ax, can.ay, can);
  const px = st.whole(null);
  const [b0] = SHATTER_FX.burst;
  const since = t - b0;
  const tick = Math.floor(t * 15);
  if (layer === 'floor') {
    // THE WARNING: each lane lit across the hall by its mirror's cold light, brighter as the burst nears
    if (t >= SHATTER_FX.tremble[0] && since < SHATTER_FX.fly + 0.1) {
      // (lit until its glass has gone by)
      const k = since < 0 ? smooth(SHATTER_FX.tremble[0], b0, t) : since < SHATTER_FX.fly ? 1 : 1 - (since - SHATTER_FX.fly) / 0.1;
      for (const [x0, x1] of SHATTER_LANES) {
        for (let x = x0; x <= x1; x += 2.4) {
          const edge = ARENA.b * Math.sqrt(Math.max(0, 1 - (x / ARENA.a) ** 2));
          for (let y = -edge; y <= edge; y += 2.4) {
            const h = hash(Math.round(x * 3), Math.round(y * 3), 7812);
            const border = x - x0 < 3 || x1 - x < 3;
            if (!border && h > 0.12 + 0.5 * k) continue;
            const [sx, sy] = st.at([x, y, 0]);
            const c = border ? (k > 0.6 ? QN_GLASS[3] : QN_GLASS[2]) : (h + tick * 0.13) % 1 < 0.08 ? QN_GLASS[4] : h < 0.25 ? QN_MIRROR[3] : QN_MIRROR[2];
            lay(px, sx, sy, c);
          }
        }
      }
    }
    // THE GLASS LYING where it came down, glittering, then gone
    if (since > 0 && t < SHATTER_FX.lie[1]) {
      const left = 1 - smooth(SHATTER_FX.lie[0], SHATTER_FX.lie[1], t);
      for (const s of SHARDS) {
        const a = shardAt(s, since);
        if (!a || !a.down) continue;
        if (hash(s.seed, 7, 7811) > left) continue;
        const [x, y] = st.at(a.p);
        lay(px, x, y, (s.seed + tick) % 7 === 0 ? QN_GLASS[4] : s.big ? QN_GLASS[2] : QN_MIRROR[3], s.big ? 2 : 1);
      }
    }
    return { px, lights: [] };
  }
  // THE GLASS FLYING: each shard a sliver, its streak behind it along its lane
  if (since >= 0) {
    for (const s of SHARDS) {
      const a = shardAt(s, since);
      if (!a || a.down) continue;
      const near = a.p[0] - a.p[1];
      if (near < between[0] || near >= between[1]) continue;
      const back = shardAt(s, Math.max(s.delay, since - 0.07));
      const [x, y] = st.at(a.p);
      // (its smear: a streak along its lane behind it, dim far back, bright near it)
      if (back && !back.down) {
        const [x0, y0] = st.at(back.p);
        line(px, x0, y0, x, y, QN_MIRROR[3], s.big ? 1 : 2);
        const mid = [(x0 + x * 2) / 3, (y0 + y * 2) / 3];
        line(px, mid[0], mid[1], x, y, QN_GLASS[3]);
      }
      // (the shard: a sliver of glass, a white edge on it)
      const [xs, ys] = st.at([a.p[0], a.p[1] - s.dir * 5, a.p[2] + 1.5]);
      line(px, xs, ys, x, y, s.big ? QN_GLASS[4] : QN_GLASS[3]);
      lay(px, x, y, s.big ? '#ffffff' : QN_GLASS[4], s.big ? 3 : 2);
      if (s.big) lay(px, x + 1, y + 2, QN_GLASS[2], 2);
    }
    // the burst itself: a flash of white glass off every mirror's face
    if (since < 0.1) {
      for (const m of HALL_MIRRORS) {
        if (m.x - m.y < between[0] || m.x - m.y >= between[1]) continue;
        for (let i = 0; i < 26; i++) {
          const k = since / 0.1;
          const a = hash(i, 9, 7813) - 0.5;
          const p: V3 = [m.x + a * 2 * HALL_GLASS.half, m.y - m.side * (4 + 18 * k * hash(i, 10, 7813)), 10 + (HALL_GLASS.tall - 20) * hash(i, 11, 7813)];
          const [x, y] = st.at(p);
          lay(px, x, y, i % 3 ? '#ffffff' : QN_GLASS[3], 2);
        }
      }
    }
  }
  return { px, lights: [] };
}

// =============================================================================================
// WHERE THE REFLECTIONS STEP OUT: a looking-glass gathered out of its shards, rippling hard, burst back

export const EMERGE_CANVAS = { w: 150, h: 176, ax: 75, ay: 148 } as const;
/** Its times (seconds from her sweep landing): gathered; rippling as each comes through (stepping out about `out`); burst back into shards. */
export const EMERGE_FX = { form: [0, 0.3] as const, out: 0.55, gone: [0.95, 1.35] as const, long: 1.4 } as const;
/** WHERE A REFLECTION STEPS OUT, `t` seconds after her sweep lands: its glass facing the eye, its foot's middle on the anchor (what steps out of it comes toward the eye). */
export function emergePainted(t: number, view: GameView = 'front'): Painted {
  const can = EMERGE_CANVAS;
  const st = stage(view === 'back' ? 'rear' : view, can.ax, can.ay, can);
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => bits.push({ part, piece, shape });
  if (t < 0 || t >= EMERGE_FX.long) return { px: st.whole(null), lights: [] };
  const g: Glass = {
    at: [0, 0],
    half: 21,
    tall: 96,
    form: smooth(EMERGE_FX.form[0], EMERGE_FX.form[1], t),
    gone: smooth(EMERGE_FX.gone[0], EMERGE_FX.gone[1], t),
    ripples: [[0, 50, t - 0.3], [0, 50, t - 0.42], [0, 46, t - EMERGE_FX.out], [0, 40, t - EMERGE_FX.out - 0.12], [0, 34, t - EMERGE_FX.out - 0.24]],
    t,
  };
  const shards = glassBits(put, g, 'emerge').shards;
  const lights = paintBits(st, bits, [0, 0, 40]);
  const px = st.whole(ENEMY_RIM);
  for (const [p, c, n] of shards) {
    const [x, y] = st.at(p);
    lay(px, x, y, c, n);
  }
  // as each comes through: the glass bulging out toward the eye, a spray of bright glass off it
  if (t >= EMERGE_FX.out - 0.05 && t < EMERGE_FX.out + 0.3) {
    const k = (t - EMERGE_FX.out + 0.05) / 0.35;
    for (let i = 0; i < 30; i++) {
      const a = (i / 30) * TAU;
      const r = 6 + 18 * k * (0.6 + 0.6 * hash(i, 1, 7821));
      const p: V3 = [Math.cos(a) * r * 0.9, -2 - 10 * k * hash(i, 2, 7821), 44 + Math.sin(a) * r * 1.3];
      const [x, y] = st.at(p);
      if (hash(i, 3, 7821) < k * 0.7) continue;
      lay(px, x, y, i % 3 === 0 ? '#ffffff' : QN_GLASS[3], k < 0.5 ? 2 : 1);
    }
  }
  return { px, lights };
}

// =============================================================================================
// HER MIRROR, at the end of the hall: still, speaking, and as she dies, cracked across and telling the truth

export const TALK_CANVAS = { w: 190, h: 260, ax: 95, ay: 236 } as const;
/** Its glass (her own lengths): half as wide again as her looking-glass, and taller than two of her. */
export const TALK_GLASS = { half: 30, tall: 136, foot: 9 } as const;
/** Its times as she dies (seconds from her death's start, art/queen_moves.ts QN_DIES): it cracks across as her crown cracks; its face clears as she sinks; it speaks the truth. */
export const TALK_FX = { crack: [0.55, 0.62] as const, clear: [0.8, 2.6] as const, speak: [1.6, 3.4] as const, long: 3.4 } as const;
export type TalkMode = 'still' | 'speaking' | 'truth';
/** Its fog's greys (cool, their hue a blue-violet, none of them near the friend's). */
const FOG: Ramp = ['#2c2e40', '#44465c', '#66687e', '#8c8ea2', '#b6b8c8'];
/** The face's clear silver once it tells the truth. */
const CLEAR: Ramp = ['#3a3c52', '#6a6c86', '#9a9cb4', '#c8cadc', '#eceef6'];
/** The crack across it: from its left to its right edge and down, jagged, with its branches (as points across and up the glass from its middle). */
const CRACK: ReadonlyArray<readonly [number, number]> = (() => {
  const out: [number, number][] = [];
  const n = 14;
  for (let i = 0; i <= n; i++) {
    const k = i / n;
    out.push([-TALK_GLASS.half + 2 * TALK_GLASS.half * k, 26 - 40 * k + (hash(i, 1, 7831) - 0.5) * 9]);
  }
  return out;
})();
const BRANCHES: ReadonlyArray<ReadonlyArray<readonly [number, number]>> = [3, 6, 9, 11].map((j, bi) => {
  const [x, y] = CRACK[j];
  const dir = bi % 2 ? 1 : -1;
  return [[x, y], [x + 4 + 3 * bi, y + dir * (6 + 2 * bi)], [x + 7 + 2 * bi, y + dir * (11 + 3 * bi)]] as const;
});
/** How near a point of the glass is to a line through points (in the glass's own lengths). */
function distTo(a: number, b: number, pts: ReadonlyArray<readonly [number, number]>, upto = 1): number {
  let best = Infinity;
  const n = Math.max(1, Math.floor((pts.length - 1) * upto));
  for (let i = 0; i < n; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const dx = x1 - x0;
    const dy = y1 - y0;
    const k = Math.max(0, Math.min(1, ((a - x0) * dx + (b - y0) * dy) / (dx * dx + dy * dy)));
    best = Math.min(best, Math.hypot(a - x0 - dx * k, b - y0 - dy * k));
  }
  return best;
}
/** A value noise on the glass (0 to 1), drifting with `t`. */
function fogAt(a: number, b: number, t: number): number {
  const n = (x: number, y: number, s: number): number => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const fx = x - xi;
    const fy = y - yi;
    const sx = fx * fx * (3 - 2 * fx);
    const sy = fy * fy * (3 - 2 * fy);
    const h = (i: number, j: number): number => hash(i, j, s);
    return (h(xi, yi) * (1 - sx) + h(xi + 1, yi) * sx) * (1 - sy) + (h(xi, yi + 1) * (1 - sx) + h(xi + 1, yi + 1) * sx) * sy;
  };
  return 0.6 * n(a / 9 + t * 0.25, b / 12 - t * 0.1, 7832) + 0.4 * n(a / 4.5 - t * 0.4, b / 6 + t * 0.2, 7833);
}
/**
 * HER MIRROR `t` seconds into its mode (seen from in front, the game's eye; its glass faces along the hall, its foot's
 * middle on the anchor): `still`, a grey fog drifting in its dark glass; `speaking`, the fog gathered into a face that
 * speaks, a whisper of grey drifting off it; `truth` (from her death's start), it cracks across in a flash, its face
 * clears and loses the pink from its eyes, and it speaks.
 */
export function talkingMirrorPainted(mode: TalkMode, t: number): Painted {
  const can = TALK_CANVAS;
  const st = stage('front', can.ax, can.ay, can);
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => bits.push({ part, piece, shape });
  const W = TALK_GLASS.half;
  const Hh = TALK_GLASS.tall / 2;
  const foot = TALK_GLASS.foot;
  // (its glass faces along the hall, toward the eye's side: its plane x = 0, facing +x)
  const c: V3 = [0, 0, foot + Hh];
  const arch = W;
  const inGlass = (a: number, b: number): boolean => b <= Hh - arch || a * a + (b - (Hh - arch)) ** 2 <= arch * arch;
  // THE FACE: how much of it the fog has gathered into (0 none, 1 whole), how clear it is (0 fog, 1 truth), how far its mouth opens
  const speaking = mode === 'speaking' ? 1 : mode === 'truth' ? 1 : 0;
  const gather = mode === 'still' ? 0 : mode === 'speaking' ? smooth(0, 0.6, t) : 1;
  const clear = mode === 'truth' ? smooth(TALK_FX.clear[0], TALK_FX.clear[1], t) : 0;
  const talking = mode === 'speaking' ? (t > 0.5 ? 1 : 0) : mode === 'truth' ? (t > TALK_FX.speak[0] ? 1 : 0) : 0;
  const mouth = talking * Math.max(0, Math.sin(t * 11) * 0.6 + Math.sin(t * 4.3) * 0.5);
  const cracked = mode === 'truth' ? clamp01((t - TALK_FX.crack[0]) / (TALK_FX.crack[1] - TALK_FX.crack[0])) : 0;
  void speaking;
  const FC: [number, number] = [0, 18];
  const skin = (a: number, b: number, front: boolean, tone: number): string | null => {
    if (!inGlass(a, b)) return null;
    if (!front) return QN_GILT[1];
    // the crack across it, with its branches: dark, a lit edge along its upper side
    if (cracked > 0) {
      const d = distTo(a, b, CRACK, cracked);
      if (d < 0.7) return INK;
      if (d < 1.4 && b > 0) return QN_MIRROR[4];
      if (cracked >= 1) for (const br of BRANCHES) if (distTo(a, b, br) < 0.55) return INK;
    }
    let k = Math.max(1, Math.min(2, tone - 1));
    const sheen = (a * 0.5 + b + 400) % 40;
    if (sheen < 2.5) k += 1;
    let col: string = QN_MIRROR[k];
    // the fog drifting in it
    const f = fogAt(a, b, t);
    const fu = (a - FC[0]) / 15;
    const fv = (b - FC[1]) / 21;
    const inFace = fu * fu + fv * fv;
    const faceK = gather * (1 - smooth(0.7, 1.15, inFace));
    const fogK = f * (0.55 - 0.3 * clear) + faceK * 0.55;
    if (fogK > 0.42) col = FOG[fogK > 0.72 ? 3 : fogK > 0.56 ? 2 : 1];
    if (faceK > 0.3) {
      const R = clear > 0.5 ? CLEAR : FOG;
      const lift = 0;
      // (a face of fog: its edge thinning into the glass, every other pixel)
      if (inFace > 0.74 && ((Math.round(a * 1.3) + Math.round(b * 1.3)) % 2 !== 0)) return col;
      col = R[2];
      // its features: the brow and the hollows of its eyes, the shadow of its nose, its mouth
      const eye = (sx: number): number => ((a - sx) / 4.2) ** 2 + ((b - FC[1] - 5) / 2.6) ** 2;
      const brow = Math.abs(b - FC[1] - 9) < 1 && Math.abs(a) < 11 && Math.abs(a) > 1.5;
      if (brow) col = R[1 + lift];
      if (eye(-6) < 1 || eye(6) < 1) {
        col = R[0 + lift];
        // the pupils: the enemy's dull pink while it says only what she wants to hear; pale once it tells the truth
        if (eye(-6) < 0.3 || eye(6) < 0.3) col = clear > 0.5 ? CLEAR[4] : FLAME[0];
      }
      if (Math.abs(a) < 0.9 && b < FC[1] + 3 && b > FC[1] - 4) col = R[1 + lift];
      const mo = ((a - 0) / 5) ** 2 + ((b - FC[1] + 10) / (0.8 + 2.4 * mouth)) ** 2;
      if (mo < 1) col = R[0];
      else if (Math.abs(b - FC[1] + 10) < 0.7 && Math.abs(a) < 5) col = R[1];
      // its cheeks and its jaw: the oval's edge a step darker
      if (inFace > 0.72 && inFace < 1.0) col = R[1 + lift];
    }
    return col;
  };
  put('talk', 'pane', { k: 'panel', c, u: [0, W, 0], v: [0, 0, Hh], skin });
  // THE FRAME: thick silver-gilt round its arch, its crest a crown of glass spikes like hers, its foot a plinth
  const F = 2.2;
  const x = 0.8;
  const pts: V3[] = [[x, -W - F * 0.6, foot - 1], [x, -W - F * 0.6, c[2] + Hh - arch]];
  for (let i = 1; i <= 10; i++) {
    const a = Math.PI - (i / 10) * Math.PI;
    pts.push([x, Math.cos(a) * (arch + F * 0.6), c[2] + Hh - arch + Math.sin(a) * (arch + F * 0.6)]);
  }
  pts.push([x, W + F * 0.6, foot - 1]);
  for (let i = 0; i + 1 < pts.length; i++) put('talkframe', 'frame', { k: 'rod', a: pts[i], b: pts[i + 1], ra: F, rb: F, ramp: QN_GILT });
  // (an inner bead of silver round the glass)
  for (let i = 1; i + 2 < pts.length; i++) put('talkframe', 'frame', { k: 'rod', a: [pts[i][0] + 0.9, pts[i][1] * 0.94, pts[i][2] - (i > 1 ? 0.8 : 0)], b: [pts[i + 1][0] + 0.9, pts[i + 1][1] * 0.94, pts[i + 1][2] - 0.8], ra: 0.6, rb: 0.6, ramp: QN_SILVER });
  // the plinth: a step of gilt under it, its feet curled
  put('talkframe', 'plinth', { k: 'rod', a: [x, -W - 5, foot - 2.5], b: [x, W + 5, foot - 2.5], ra: 2.6, rb: 2.6, ramp: QN_GILT });
  for (const sy of [-1, 1]) {
    put('talkframe', 'plinth', { k: 'rod', a: [x, sy * (W + 2), foot - 3], b: [x + 4, sy * (W + 6), 1.6], ra: 1.9, rb: 1.4, ramp: QN_GILT });
    put('talkframe', 'plinth', { k: 'ball', c: [x + 4.5, sy * (W + 6.5), 1.7], ax: [[1.7, 0, 0], [0, 1.7, 0], [0, 0, 1.3]], skin: QN_GILT });
  }
  // its crest: a crown of glass spikes over its arch, as hers, on a silver band; scrolls of gilt either side
  const top = c[2] + Hh + F * 0.6;
  put('talkframe', 'crest', { k: 'rod', a: [x, -9, top + 1], b: [x, 9, top + 1], ra: 1.6, rb: 1.6, ramp: QN_SILVER });
  const H = [8, 12, 17, 12, 8];
  for (let i = 0; i < 5; i++) {
    const sy = (i - 2) * 4.2;
    const lean = (i - 2) * 1.6;
    put('talkframe', 'crest', { k: 'rod', a: [x, sy, top + 1.5], b: [x, sy + lean, top + 1.5 + H[i]], ra: 1.5, rb: 0.2, ramp: QN_GLASS });
  }
  for (const sy of [-1, 1]) {
    const s0: V3 = [x, sy * 12, top - 2];
    put('talkframe', 'crest', { k: 'rod', a: s0, b: [x, sy * 19, top + 3], ra: 1.4, rb: 0.9, ramp: QN_GILT });
    put('talkframe', 'crest', { k: 'ball', c: [x, sy * 20, top + 3.5], ax: [[1.4, 0, 0], [0, 1.5, 0], [0, 0, 1.5]], skin: QN_GILT });
  }
  const lights = paintBits(st, bits, [0, 0, 60]);
  const px = st.whole(null);
  // ITS WHISPER: grey breath drifting out of its glass as it speaks
  if (talking) {
    for (let i = 0; i < 16; i++) {
      const life = (t * 0.7 + i / 16) % 1;
      const a = (hash(i, 1, 7834) - 0.5) * 18;
      const p: V3 = [2 + 26 * life, a + Math.sin(life * 6 + i) * 3, foot + FC[1] + Hh - 12 + 12 * life];
      const [sx, sy] = st.at(p);
      lay(px, sx, sy, life < 0.4 ? FOG[4] : life < 0.75 ? FOG[3] : FOG[2], life < 0.5 ? 2 : 1);
    }
  }
  // AS IT CRACKS: a flash of glass off it
  if (mode === 'truth' && t >= TALK_FX.crack[0] && t < TALK_FX.crack[1] + 0.3) {
    const k = (t - TALK_FX.crack[0]) / (TALK_FX.crack[1] - TALK_FX.crack[0] + 0.3);
    for (let i = 0; i < 34; i++) {
      const [ca, cb] = CRACK[i % CRACK.length];
      const p: V3 = [2 + 14 * k * hash(i, 2, 7835), ca, foot + Hh + cb + (hash(i, 3, 7835) - 0.5) * 10 - 14 * k * k];
      const [sx, sy] = st.at(p);
      if (hash(i, 4, 7835) < k * 0.6) continue;
      lay(px, sx, sy, i % 3 === 0 ? '#ffffff' : QN_GLASS[3], k < 0.4 ? 2 : 1);
    }
  }
  return { px, lights };
}
void ([] as Stage[]);

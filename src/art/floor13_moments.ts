// THE MILLRACE'S MOMENT AROUND THE HERO (the art chat for floors 11 to 15, 19 Oct 2026; a mock-up, nothing of the game
// imports it).
//
// His rulebook's Places 8, his words of 10 Oct: “I’d also like a couple environmental things happening around you for
// immersion unique for each floor.  Something shifts above you and dust comes down, you spook a pack of birds and they
// fly off,  a root shrivels as you walk by.  That sort of stuff”. Made on his word to this chat of 18 Oct, 21:24
// Pacific: “Hey go without my say so.  If something is shit I’ll get it to it but you’re doing a great jobs. At least
// for 11-15”: the pick this chat would have marked recommended, sent him as a film. Not birds (floor 11's pigeons burst
// off a roof), not water (floor 12's surge): the fields' own. Checked against his Animations 1 before he sees it: “as
// big and wild and kinetic and weighty as possible.  I’d rather it be a notch too high than a notch too low.”
//
//   THE WHIRL OF PAGES: a few of the mill's written sheets lie in the corn, stirring (`before`). A gust comes over the
//     field, streaks of chaff driven before it; it catches, and a whirlwind spins up out of the corn: chaff and dust
//     spiralling up in a funnel taller than a man, the sheets snatched up into it one by one and whirled round and up;
//     it wanders a little across the field; then it falls apart, the chaff flung out and raining down, the sheets
//     fluttering down like leaves, swaying, and coming to lie in the corn somewhere else (`after`).
//
// Laid on the fields (art/millrace.ts): its anchor is any point of open corn, the whirl rising a little behind and to
// the left of it and wandering off to the right. Built as floor 11's pigeons and floor 12's surge are (art/floor2.ts
// onPic, picture pixels, KT to a tile).

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import type { Moment, Track } from './floorkit';
import { onPic } from './floor2';
import { GRAIN, hash } from './kit';

const sm = (v: number): number => {
  const c = Math.max(0, Math.min(1, v));
  return c * c * (3 - 2 * c);
};

/** The chaff and straw (the fields' gold, gone over), the dust (the track's), the sheets' paper and the Order's ink on them. */
const CHAFF = ['#8a7748', '#b09a66', '#cbb784', '#ddd0a4'] as const;
const DUST = ['#3e3428', '#544636', '#6a5a46'] as const;
const PAPER = ['#6a665a', '#9a9484', '#c2baa4', '#dcd4bc'] as const;
const INK = '#1a1720';

/** The picture: from this far left of the anchor to this far right (picture pixels across the screen). */
const LEFT = -300;
const RIGHT = 300;
/** When the gust comes (from frame 0), when the whirl spins up and how it grows, when it falls apart. */
const SPIN = 10;
const GROW = 16;
const FALL = 74;
const FADE = 14;
/** Where the whirl stands up out of the corn, and how it wanders (picture pixels a frame along x and y on the floor). */
const X0 = -68;
const Y0 = -36;
const DRIFT: [number, number] = [1.1, 0.44];
/** How strong the whirl is at a frame (0 none, 1 at its height). */
const strength = (f: number): number => sm((f - SPIN) / GROW) * (1 - sm((f - FALL) / FADE));
const centre = (f: number): [number, number] => {
  const t = Math.max(0, f - SPIN);
  return [X0 + DRIFT[0] * t, Y0 + DRIFT[1] * t];
};
/** The funnel's width at a height, at a strength. */
const radiusAt = (z: number, w: number): number => (10 + 0.36 * z) * (0.6 + 0.4 * w);

/** A sheet: where it lies before, how it turns, when the whirl takes it, how high it is carried, where it comes down. */
interface Sheet {
  x: number;
  y: number;
  turn: number;
  seed: number;
  taken: number;
  top: number;
}
const SHEETS: Sheet[] = [
  { x: -104, y: -12, turn: 0.4, seed: 1, taken: 16, top: 148 },
  { x: -36, y: -80, turn: 1.9, seed: 2, taken: 20, top: 184 },
  { x: -120, y: -72, turn: 2.8, seed: 3, taken: 24, top: 150 },
  { x: -16, y: -4, turn: 0.9, seed: 4, taken: 27, top: 164 },
  { x: -72, y: 20, turn: 2.3, seed: 5, taken: 31, top: 136 },
  { x: -40, y: -120, turn: 1.2, seed: 6, taken: 35, top: 196 },
];

/** A sheet as it is at a frame: its middle (x, y across the floor, z up), its across and its up-the-page as half-lengths in 3D. Null: not yet (it lies as before). */
interface Pose {
  c: [number, number, number];
  u: [number, number, number];
  v: [number, number, number];
}
function flat(x: number, y: number, z: number, turn: number, lift = 0): Pose {
  const u: [number, number, number] = [Math.cos(turn) * 9, Math.sin(turn) * 9, 0];
  const v: [number, number, number] = [-Math.sin(turn) * 6.6 * Math.cos(lift), Math.cos(turn) * 6.6 * Math.cos(lift), 6.6 * Math.sin(lift)];
  return { c: [x, y, z + Math.abs(v[2])], u, v };
}

/** Where each sheet is at each frame: lying, taken up and whirled round, let go and fluttering down, lying again. */
function sheetPath(s: Sheet, LAST: number): Pose[] {
  const out: Pose[] = [];
  let ang = Math.atan2(s.y - Y0, s.x - X0);
  let z = 0;
  let r = Math.hypot(s.x - X0, s.y - Y0);
  let x = s.x;
  let y = s.y;
  let vr = 0;
  let landed = false;
  let rest: Pose | null = null;
  const let_go = FALL - 4 + s.seed * 2;
  for (let f = 0; f < LAST; f++) {
    if (f < s.taken) {
      // lying in the corn, its edge lifting more as the gust comes
      const stir = f < 4 ? 0.15 : 0.15 + 0.35 * sm((f - 4) / 10);
      out.push(flat(s.x, s.y, 0, s.turn, stir * Math.abs(Math.sin(f * 0.9 + s.seed))));
      continue;
    }
    const [cx, cy] = centre(f);
    if (f === s.taken) {
      // (from where it lay, as the whirl now stands)
      ang = Math.atan2(s.y - cy, s.x - cx);
      r = Math.hypot(s.x - cx, s.y - cy);
    }
    if (f < let_go) {
      // taken: drawn in to the funnel, whirled round it and carried up it, tumbling
      const k = sm((f - s.taken) / 26);
      const w = strength(f);
      const want = radiusAt(z, w) + 6 * Math.sin(f * 0.3 + s.seed);
      r += (want - r) * 0.14;
      ang += 0.2 * (0.6 + 0.4 * w);
      z += (s.top * k - z) * 0.12;
      x = cx + Math.cos(ang) * r;
      y = cy + Math.sin(ang) * r;
      const tumble = f * 0.5 + s.seed;
      const u: [number, number, number] = [-Math.sin(ang) * 9, Math.cos(ang) * 9, 0];
      const v: [number, number, number] = [Math.cos(ang) * Math.cos(tumble) * 6.6, Math.sin(ang) * Math.cos(tumble) * 6.6, Math.sin(tumble) * 6.6];
      out.push({ c: [x, y, Math.max(z, Math.abs(v[2]) + 0.5)], u, v });
      continue;
    }
    if (!landed) {
      // let go: flung out off the funnel and fluttering down, swaying from side to side as a leaf does
      const t = f - let_go;
      if (t === 0) vr = 4.2;
      vr *= 0.93;
      r += vr;
      ang += 0.06 * Math.exp(-t / 12);
      const sway = Math.sin(t * 0.33 + s.seed) * 2.2;
      x = cx + Math.cos(ang) * r + -Math.sin(ang) * sway;
      y = cy + Math.sin(ang) * r + Math.cos(ang) * sway;
      z = Math.max(0, z - (1.8 + 1.0 * Math.abs(Math.cos(t * 0.33 + s.seed))));
      const rock = 0.9 * Math.sin(t * 0.33 + s.seed) * Math.min(1, z / 24);
      const p = flat(x, y, z, s.turn + ang * 0.2, rock);
      if (z <= 0.01) {
        landed = true;
        rest = flat(x, y, 0, s.turn + ang * 0.2, 0);
        out.push(rest);
      } else out.push(p);
      continue;
    }
    out.push(rest as Pose);
  }
  return out;
}

/** A mote of chaff or dust in the whirl: its own place round it, how fast it climbs, its colour. */
interface Mote {
  a0: number;
  climb: number;
  z0: number;
  dust: boolean;
  seed: number;
}
const MOTES: Mote[] = Array.from({ length: 230 }, (_, i) => ({ a0: hash(i, 1, 7601) * Math.PI * 2, climb: 0.9 + 1.2 * hash(i, 2, 7601), z0: hash(i, 3, 7601) * 100, dust: i % 3 === 0, seed: i }));

function theWhirl(): Moment {
  const LAST = 190;
  const W = RIGHT - LEFT + 20;
  const H = 420;
  const ax = -LEFT + 10;
  const ay = 300;
  const paths = SHEETS.map((s) => sheetPath(s, LAST));
  /** When each sheet comes to lie (the first frame it lies still after it was let go). */
  const lands = paths.map((p, k) => {
    for (let f = FALL; f < LAST - 1; f++) if (p[f].c[2] <= Math.abs(p[f].v[2]) + 0.01 && p[f + 1] === p[f] && f > SHEETS[k].taken + 10) return f;
    return LAST;
  });
  const tracks: Track[] = [
    { name: 'the gust', fromEdge: true, at: [] },
    { name: 'the whirl', fromEdge: true, at: [] },
    ...SHEETS.map((s) => ({ name: `a sheet (${s.seed})`, at: [] as Track['at'] })),
  ];

  const paint = (f: number, before: number | null, record: boolean): Px => {
    const q = new Px(W, H);
    const put = (sx: number, sy: number, c: string): void => {
      const X = Math.round(ax + sx);
      const Y = Math.round(ay + sy);
      if (X < 0 || Y < 0 || X >= W || Y >= H || sx < LEFT || sx > RIGHT) return;
      q.set(X, Y, c);
    };
    /** A mote, `n` picture pixels across (a picture pixel is half a game pixel). */
    const blob = (sx: number, sy: number, c: string, n: number): void => {
      for (let dy = 0; dy < Math.max(2, n - 1); dy++) for (let dx = 0; dx < n; dx++) put(sx + dx, sy + dy, c);
    };
    // THE GUST: streaks of chaff driven across the corn before it, out of the picture's left, gone off its right
    const gust = before === null ? Math.max(0, f) : -1;
    let lead: [number, number] | null = null;
    if (gust >= 0 && gust < 80) {
      for (let i = 0; i < 12; i++) {
        const x = LEFT * 1.2 + gust * 14 - hash(i, 1, 7611) * 140;
        const y = -100 + hash(i, 2, 7611) * 180;
        const z = 4 + hash(i, 3, 7611) * 24;
        const long = 18 + hash(i, 4, 7611) * 18;
        const [sx, sy] = onPic(x, y, z);
        if (i === 0 && sx >= LEFT) lead = [sx, sy];
        if (sx < LEFT || sx > RIGHT) continue;
        if (sx > RIGHT) continue;
        for (let k = 0; k < long; k++) {
          put(sx - k, sy, k < 3 ? CHAFF[3] : k < long * 0.6 ? CHAFF[2] : CHAFF[1]);
          if (k < long * 0.5) put(sx - k, sy + 1, CHAFF[1]);
        }
      }
    }
    // (its lead streak, going off the picture's right as it leaves)
    if (record) tracks[0].at.push(lead ? { x: Math.min(lead[0], RIGHT), y: lead[1], shown: Math.max(0, Math.min(1, (RIGHT - lead[0]) / 60)), size: 30 } : null);
    // THE WHIRL: chaff and dust spiralling up the funnel; its dust ring at the foot; flung out and falling as it goes
    const w = before === null ? strength(f) : 0;
    const [cx, cy] = centre(Math.max(0, f));
    if (before === null && f >= SPIN) {
      MOTES.forEach((m, i) => {
        const span = 200 * (0.5 + 0.5 * w);
        const zIn = (m.z0 + f * m.climb * 1.6) % 100;
        const shown = hash(i, 9, 7612) < Math.min(1, w * 1.4);
        if (f < FALL) {
          if (!shown) return;
          const z = (zIn / 100) * span;
          const spin = 0.38 + 0.12 * hash(i, 4, 7612);
          const ang = m.a0 + f * spin;
          const r = radiusAt(z, w) * (0.8 + 0.4 * hash(i, 5, 7612));
          const c = m.dust ? DUST[i % 3] : CHAFF[1 + (i % 3)];
          // (each with a streak behind it round the funnel, the way it is going)
          for (let k = 3; k >= 0; k--) {
            const a = ang - k * spin * 0.3;
            const [sx, sy] = onPic(cx + Math.cos(a) * r, cy + Math.sin(a) * r, z - k * 0.6);
            if (k === 0) blob(sx, sy, c, m.dust ? 4 : 3);
            else put(sx, sy, k === 3 ? (m.dust ? DUST[0] : CHAFF[0]) : c);
          }
        } else {
          // (falling apart: each flung out along where it was going, and down, gone into the corn)
          const t = f - FALL;
          const z0 = ((m.z0 + FALL * m.climb * 1.6) % 100) / 100 * 200;
          const ang = m.a0 + FALL * (0.38 + 0.12 * hash(i, 4, 7612));
          const r0 = radiusAt(z0, 1) * (0.8 + 0.4 * hash(i, 5, 7612));
          const out = r0 + t * (3.2 + 2 * hash(i, 6, 7612));
          const z = z0 - 0.12 * t * t - 0.8 * t;
          if (z <= 0 || hash(i, 9, 7612) >= 0.95) return;
          const [sx, sy] = onPic(cx + Math.cos(ang + 0.02 * t) * out, cy + Math.sin(ang + 0.02 * t) * out, z);
          const c = m.dust ? DUST[i % 3] : CHAFF[1 + (i % 3)];
          blob(sx, sy, c, 2);
        }
      });
      // the dust kicked up round its foot
      if (w > 0.05) {
        for (let i = 0; i < 26; i++) {
          const ang = (i / 26) * Math.PI * 2 + f * 0.2;
          const r = (20 + 10 * Math.sin(i * 1.7 + f * 0.3)) * (0.5 + 0.5 * w);
          if (hash(i, 1, 7613) > w) continue;
          const [sx, sy] = onPic(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r, 2 + 4 * hash(i, f % 7, 7613));
          blob(sx, sy, DUST[1 + (i % 2)], 4);
        }
      }
    }
    if (record) {
      const [tx, ty] = onPic(cx, cy, 80 * w);
      tracks[1].at.push(w > 0.02 ? { x: tx, y: ty, shown: Math.min(1, w * 3), size: 80 } : null);
    }
    // (a puff of chaff off the corn where each sheet comes down)
    if (before === null) {
      lands.forEach((lf, k) => {
        const t = f - lf;
        if (t < 0 || t > 9) return;
        const p = paths[k][lf];
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2 + k;
          const r = 5 + 2.2 * t;
          const z = 3 * t - 0.4 * t * t;
          if (z < 0) continue;
          const [sx, sy] = onPic(p.c[0] + Math.cos(a) * r, p.c[1] + Math.sin(a) * r, z);
          blob(sx, sy, i % 2 ? CHAFF[2] : DUST[1], 2);
        }
      });
    }
    // THE SHEETS
    SHEETS.forEach((s, k) => {
      const p = before !== null ? flat(s.x, s.y, 0, s.turn, 0.15 * Math.abs(Math.sin(before * 0.9 + s.seed))) : paths[k][Math.min(f, paths[k].length - 1)];
      const corners = [
        [p.c[0] - p.u[0] - p.v[0], p.c[1] - p.u[1] - p.v[1], p.c[2] - p.u[2] - p.v[2]],
        [p.c[0] + p.u[0] - p.v[0], p.c[1] + p.u[1] - p.v[1], p.c[2] + p.u[2] - p.v[2]],
        [p.c[0] + p.u[0] + p.v[0], p.c[1] + p.u[1] + p.v[1], p.c[2] + p.u[2] + p.v[2]],
        [p.c[0] - p.u[0] + p.v[0], p.c[1] - p.u[1] + p.v[1], p.c[2] - p.u[2] + p.v[2]],
      ].map(([x, y, z]) => onPic(x, y, z));
      // which way it faces the eye: its written side lighter, its back darker; edge on, a line
      const n = [p.u[1] * p.v[2] - p.u[2] * p.v[1], p.u[2] * p.v[0] - p.u[0] * p.v[2], p.u[0] * p.v[1] - p.u[1] * p.v[0]];
      const facing = (n[0] * 0.61 + n[1] * 0.61 + n[2] * 0.5) / (Math.hypot(n[0], n[1], n[2]) || 1);
      const xs = corners.map((c) => c[0]);
      const ys = corners.map((c) => c[1]);
      const inQuad = (px: number, py: number): boolean => {
        let inside = false;
        for (let i = 0, j = 3; i < 4; j = i++) {
          const [xi, yi] = corners[i];
          const [xj, yj] = corners[j];
          if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
        }
        return inside;
      };
      let any = 0;
      for (let Y = Math.floor(Math.min(...ys)); Y <= Math.ceil(Math.max(...ys)); Y++) {
        for (let X = Math.floor(Math.min(...xs)); X <= Math.ceil(Math.max(...xs)); X++) {
          if (!inQuad(X + 0.5, Y + 0.5)) continue;
          any++;
          const row = Y - Math.floor(Math.min(...ys));
          const light = facing > 0.25 ? 3 : facing > -0.25 ? 2 : 1;
          put(X, Y, facing > 0.25 && row % 3 === 1 && hash(Math.floor(X / 3), Y, 7614 + s.seed) < 0.7 ? INK : PAPER[light]);
        }
      }
      // (edge on: a thin line of it, still there)
      if (any < 8) {
        const [a, b] = [corners[0], corners[2]];
        for (let i = 0; i <= 12; i++) {
          put(a[0] + ((b[0] - a[0]) * i) / 12, a[1] + ((b[1] - a[1]) * i) / 12, PAPER[2]);
          put(a[0] + ((b[0] - a[0]) * i) / 12, a[1] + ((b[1] - a[1]) * i) / 12 + 1, PAPER[1]);
        }
      }
      if (record) {
        const [sx, sy] = onPic(p.c[0], p.c[1], p.c[2]);
        tracks[2 + k].at.push({ x: sx, y: sy, shown: 1, size: 18 });
      }
    });
    return q;
  };
  const cut = (q: Px): Sprite => {
    const lone: [number, number][] = [];
    for (let y = 0; y < q.h; y++) for (let x = 0; x < q.w; x++) {
      if (!q.has(x, y)) continue;
      let n = 0;
      for (let dy = -1; dy <= 1 && !n; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && q.has(x + dx, y + dy)) n++;
      if (!n) lone.push([x, y]);
    }
    for (const [x, y] of lone) q.d[(y * q.w + x) * 4 + 3] = 0;
    const bb = q.bounds(GRAIN)!;
    const c = new Px(bb.w, bb.h);
    for (let y = 0; y < bb.h; y++) for (let x = 0; x < bb.w; x++) {
      const v = q.get(bb.x + x, bb.y + y);
      if (v) c.set(x, y, v);
    }
    return c.sprite(ax - bb.x, ay - bb.y, GRAIN);
  };
  // it is over once every sheet lies still in the corn and the last of the chaff is down
  const frames: Sprite[] = [];
  let last = -1;
  const sum = (q: Px): number => {
    let h = 0;
    for (let i = 0; i < q.d.length; i++) h = (Math.imul(h, 31) + q.d[i]) | 0;
    return h;
  };
  for (let f = 0; f < LAST; f++) {
    const q = paint(f, null, true);
    if (f > FALL + 10) {
      const s = sum(q);
      if (s === last) {
        for (const t of tracks) t.at.pop();
        break;
      }
      last = s;
    }
    frames.push(cut(q));
  }
  const NF = frames.length;
  if (NF === LAST) throw new Error('the whirl is still going at the end');
  for (const t of tracks) t.at = t.at.slice(0, NF);
  const before = [0, 1, 2, 3].map((k) => cut(paint(0, k, false)));
  // (its first frame is what was there: the sheets lying as before's first)
  frames[0] = before[0];
  return { name: 'the whirl of pages', frames, fps: 30, before, after: [frames[NF - 1]], tracks, jolts: [], holds: [] };
}

let moments: Moment[] | null = null;
/** The Millrace's moment around the hero: the whirl of pages. */
export function millraceMoments(): Moment[] {
  return (moments ??= [theWhirl()]);
}

// THE WAYS THROUGH THE CRYPT: the stairwell down to the next floor, and the waypoint (a mock-up
// behind CRYPT, off: art/crypt.ts).
//
// The owner's outline, 9 Oct 2026, 22:47 (in the main chat; on the chat board at 22:52): "You find
// the dead wordsmith and the quest item to turn the altar on, kill the warden and find a stairwell
// leading down.  At the bottom of the stairs is Crypt floor 2.  There is a waypoint that will warp
// you to town and back at the beginning over every floor except the first as you could just walk
// back through the gate."
//
// THE STAIRWELL: an opening in the floor 2.4 tiles long and 1.25 across, a kerb of dressed stone
// a few pixels high round three sides of it; a flight of steps goes down it from the fourth and on under
// the floor toward the eye, into the dark. What is seen is worked out as the eye sees it: each
// pixel of the opening looks down through it, back and down, until it meets a step, the end of
// the shaft or its far side, and the deeper that is the darker (as a pit's sides are: art/ground.ts).
// In the floor's own stone, its steps chipped as the floor's stones are.
//
// THE WAYPOINT: friendly magic, so its light is the cyan of what is the player's (the art
// rulebook, Colour 3: "the town's friendly magic, such as the wordsmith's circle and the gate"). A
// round dais of the floor's stone a step high, a ring cut in its top with eight marks round it and
// a disc in the middle. Asleep (not yet found) the cuts are dark; awake, they are alight and the
// light goes round; warping, a column of light stands on it and the hero goes in a flash.

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import type { Theme } from './ground';
import { CYAN, GRAIN, SPARK, hash, mix } from './kit';

/** The dark at the bottom of a pit (art/ground.ts, PIT_DARK). */
const PIT_DARK = '#04030a';

// ---------------------------------------------------------------------------------------------
// The stairwell

/** How long the opening is along the way down, and how wide across it, in tiles; how long a step is (tiles) and how far it drops (picture pixels). */
export const STAIR_LONG = 2.4;
export const STAIR_WIDE = 1.25;
const STEP = 0.25;
const DROP = 6;
/** The kerb round the opening, on its two long sides and its lower end (the top of the steps is open): how wide (tiles) and how high (picture pixels). */
export const STAIR_KERB = 0.18;
const KERB_H = 6;

/** How dark a thing is at a depth below the floor (picture pixels): in five flat steps toward the dark at the bottom. */
function deepen(c: string, depth: number): string {
  if (depth <= 0) return c;
  const k = depth < 7 ? 0.12 : depth < 15 ? 0.34 : depth < 24 ? 0.58 : depth < 34 ? 0.78 : 0.93;
  return mix(c, PIT_DARK, k);
}

/**
 * ROUGH ROCK in a side of the shaft where a stone has fallen out (on the deeper floors): lumps a
 * few pixels across with earth between them, each lit along its upper-left edge and in shade along
 * its lower-right, in the light of the side it is in (as the walls' rock is: art/ground.ts).
 * `run`: pixels along the side; `depth`: below the floor.
 */
function roughAt(run: number, depth: number, face: readonly string[], rock: readonly string[], dirt: readonly string[]): string {
  const CELL = 6;
  const gx = run / CELL;
  const gy = depth / (CELL * 0.8);
  const cx = Math.floor(gx);
  const cy = Math.floor(gy);
  let best = 9;
  let second = 9;
  let ox = 0;
  let oy = 0;
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const px = cx + dx + 0.15 + 0.7 * hash(cx + dx, cy + dy, 321);
      const py = cy + dy + 0.15 + 0.7 * hash(cx + dx, cy + dy, 322);
      const d = Math.hypot(gx - px, gy - py);
      if (d < best) {
        second = best;
        best = d;
        ox = gx - px;
        oy = gy - py;
      } else if (d < second) second = d;
    }
  }
  if (second - best < 0.13) return dirt[0];
  const k = -ox * 0.8 - oy * 0.9;
  if (k > 0.3) return mix(face[3], rock[3], 0.5);
  if (k < -0.3) return mix(face[0], rock[0], 0.5);
  return mix(face[2], rock[1], 0.55);
}

/**
 * THE STAIRWELL, going down toward +x (`way` 'x': to the lower right of the screen) or toward +y
 * ('y': to the lower left). Anchored at the corner of the opening up the screen, (0, 0): the
 * opening runs STAIR_LONG tiles along the way down and STAIR_WIDE across, the top of the steps at
 * its far end, open to the floor; a kerb STAIR_KERB wide round the rest of it. Drawn over the
 * floor, before anything that stands.
 */
export function makeStairwell(theme: Theme, way: 'x' | 'y'): Sprite {
  const LONG = STAIR_LONG;
  const WIDE = STAIR_WIDE;
  const K = STAIR_KERB;
  // (the box it all lies in, in tiles: along the way down from 0 to LONG + K, across from -K to WIDE + K)
  const x0 = way === 'x' ? 0 : -K;
  const y0 = way === 'x' ? -K : 0;
  const x1 = way === 'x' ? LONG + K : WIDE + K;
  const y1 = way === 'x' ? WIDE + K : LONG + K;
  const PAD = 4;
  const ox = Math.ceil(-(x0 - y1) * 32) + PAD;
  const oy = Math.ceil(-(x0 + y0) * 16 + KERB_H) + PAD;
  const W = Math.ceil((x1 - y0) * 32) + ox + PAD;
  const H = Math.ceil((x1 + y1) * 16) + oy + PAD;
  const p = new Px(W, H);
  const e = theme.earth;
  const broken = e?.broken ?? 0.07;
  const raw = e?.raw ?? 0;
  const rock = e?.rock;
  const dirt = e?.dirt;
  const tread = theme.slab;
  /** The tones of an upright face by which way it looks: toward +y it is lit (it faces screen-left), toward +x in shade. */
  const faceOf = (axis: 'al' | 'ac') => ((axis === 'ac') === (way === 'x') ? theme.lit : theme.shade);
  /** Where a point of the floor is: in the opening, on the kerb, or on the floor round it. */
  const where = (al: number, ac: number): 0 | 1 | 2 => {
    if (al >= 0 && al < LONG && ac >= 0 && ac < WIDE) return 0;
    if (al >= 0 && al < LONG + K && ac >= -K && ac < WIDE + K) return 1;
    return 2;
  };
  for (let py = 0; py < H; py++) {
    for (let px = 0; px < W; px++) {
      // where this pixel's line of sight is at the height of the kerb's top, in tiles
      const sx = (px + 0.5 - ox) / 32;
      const sk = (py + 0.5 - oy + KERB_H) / 16;
      const fx = (sk + sx) / 2;
      const fy = (sk - sx) / 2;
      let c: string | null = null;
      let prev: 0 | 1 | 2 = 2;
      let prevAc = 0;
      let before = 0;
      // LOOKING DOWN ALONG IT: back (toward -x, -y) and down, a 128th of a tile at a time
      for (let d = 0; d < 2.6; d += 1 / 128) {
        const x = fx - d;
        const y = fy - d;
        const z = KERB_H - 32 * d;
        const al = way === 'x' ? x : y;
        const ac = way === 'x' ? y : x;
        const here = where(al, ac);
        if (al < 0 && z < 0) {
          // past the open top of the steps, below the floor: the end of the shaft (or, outside it, nothing of this picture)
          if (prev === 0 && ac >= 0 && ac < WIDE) {
            const f = faceOf('al');
            const depth = -z;
            const course = Math.floor(depth / 12);
            const run = ac * 32 + (course % 2) * 11;
            c = deepen(depth % 12 < 1 || run % 22 < 1 ? f[0] : f[2], depth);
          }
          break;
        }
        if (here === 2) {
          // the floor round it: not this picture's (the floor's own tile is there)
          if (z <= 0) break;
        } else if (here === 1) {
          if (z <= KERB_H && z > 0) {
            if (d === 0) {
              // THE KERB'S TOP: dressed slabs, a lit lip along its edge to the opening
              const run = al < 0 || al >= LONG ? ac : al;
              const slab = Math.floor((run + K) / 0.4);
              const joint = Math.abs((run + K) / 0.4 - Math.round((run + K) / 0.4)) < 0.035;
              const lip = (ac >= -0.03 && ac < 0) || (ac >= WIDE && ac < WIDE + 0.03 && al < LONG) || (al >= LONG && al < LONG + 0.03 && ac >= 0 && ac < WIDE);
              // (its edge to the opening catches the light, as the floor's edge does over a drop: art/ground.ts, rimLeft)
              c = joint ? theme.mortar : lip ? mix(tread[3], '#ffffff', 0.15) : al < 0.03 || ac < -K + 0.03 ? mix(tread[3], '#ffffff', 0.08) : hash(slab, Math.floor(ac + 9), 301) < 0.3 ? tread[3] : tread[2];
              // (a chip off its edge here and there)
              if (hash(slab, 3, 302) < broken * 1.5 && lip) c = theme.mortar;
            } else {
              // ONE OF ITS SIDES: an outer one, toward the eye (from the floor round it), or the inner one of its far side (from the opening)
              const axis: 'al' | 'ac' = prev === 2 ? (prevAc >= WIDE + K ? 'ac' : 'al') : 'ac';
              const f = faceOf(axis);
              const v = KERB_H - z;
              c = v < 1 ? f[4] : v > KERB_H - 1.2 ? f[0] : f[2];
            }
            break;
          }
          if (z <= 0) {
            // below the kerb's foot, beyond the opening: the side of the shaft, going down
            const axis: 'al' | 'ac' = ac < 0 || ac >= WIDE ? 'ac' : 'al';
            const f = faceOf(axis);
            const depth = -z;
            const course = Math.floor(depth / 12);
            const run = (axis === 'ac' ? al : ac) * 32 + (course % 2) * 11;
            const stone = Math.floor(run / 22);
            let col = depth % 12 < 1 || run % 22 < 1 ? f[0] : hash(stone, course, 303) < 0.3 ? f[3] : f[2];
            if (rock && dirt && hash(stone, course, 305) < raw) col = roughAt(run, depth, f, rock, dirt);
            c = deepen(col, depth);
            break;
          }
        } else if (z < 0) {
          // IN THE OPENING, below the floor: THE STEPS. The k-th (from 1) has its tread DROP * k down, over [(k - 1) STEP, k STEP) along the way down
          const k = Math.floor(al / STEP) + 1;
          const top = -DROP * k;
          if (z <= top) {
            let col: string;
            if (before > k) {
              // the eye has come back past a step's front below its tread: that step's riser, in shade, its foot darker
              const f = faceOf('al');
              col = top - z > DROP - 1.2 ? f[0] : f[1];
            } else {
              // its tread: the front edge (its nosing) catches the light, a chip off it here and there; dark where it meets the step above
              const into = al - (k - 1) * STEP;
              const across = Math.floor(ac * 6);
              const chip = hash(k, across, 307) < broken * 1.5 && into > STEP * 0.7 && ac * 6 - across < 0.55;
              if (into > STEP - 0.035) col = chip ? theme.mortar : mix(tread[3], '#ffffff', 0.12);
              else if (chip && into > STEP * 0.8) col = theme.mortar;
              else if (into < 0.025) col = tread[0];
              else col = hash(k, Math.floor(ac * 3), 309) < 0.35 ? tread[3] : tread[2];
              // (a crack across a tread here and there)
              if (hash(k, 7, 311) < broken * 2 && Math.abs(ac - 0.3 - 0.4 * hash(k, 8, 312) - (into / STEP - 0.5) * 0.25) < 0.02) col = theme.mortar;
            }
            c = deepen(col, -z);
            break;
          }
          before = k;
        }
        prev = here;
        prevAc = ac;
      }
      if (c === null) {
        // (nothing met: in the opening it is the dark at the bottom; anywhere else, nothing of this picture)
        const at = (py + 0.5 - oy) / 16;
        const ax = (at + sx) / 2;
        const ay = (at - sx) / 2;
        if (where(way === 'x' ? ax : ay, way === 'x' ? ay : ax) === 0) c = PIT_DARK;
      }
      if (c) p.set(px, py, c);
    }
  }
  return p.sprite(ox, oy, GRAIN);
}

// ---------------------------------------------------------------------------------------------
// The waypoint

/** The dais: how far it reaches from its middle (tiles), and how high it stands (picture pixels). */
export const WAY_R = 0.75;
const WAY_H = 8;
/** Frames of it awake (a loop), and of a warp. */
export const WAY_FRAMES = 12;
export const WARP_FRAMES = 12;
/** Its light: the dark of the cut, its body, its bright, its heart (the kit's CYAN and SPARK). */
const LIGHT = [CYAN[0], CYAN[2], CYAN[3], SPARK[4]] as const;

/** How far a point of the screen is from a line of the floor (both in tiles of the floor, measured on the screen in picture pixels). */
function screenGap(x: number, y: number, ax: number, ay: number, bx: number, by: number): number {
  const S = (u: number, v: number): [number, number] => [(u - v) * 32, (u + v) * 16];
  const [px, py] = S(x, y);
  const [qx, qy] = S(ax, ay);
  const [rx, ry] = S(bx, by);
  const dx = rx - qx;
  const dy = ry - qy;
  const t = Math.max(0, Math.min(1, ((px - qx) * dx + (py - qy) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - qx - t * dx, py - qy - t * dy);
}

/**
 * Where the cuts in its top are: the ring, the eight marks round inside it, the small ring and the
 * disc in the middle. 0: none; else which (1 ring, 2 a mark, 3 the small ring, 4 the disc). The
 * marks lie on the floor's grid, each a short cut pointing out with a notch across its end, two
 * picture pixels wide on the screen whichever way it points.
 */
function cutAt(x: number, y: number): 0 | 1 | 2 | 3 | 4 {
  const r = Math.hypot(x, y);
  if (Math.abs(r - 0.55) < 0.032) return 1;
  if (r < 0.1) return 4;
  if (Math.abs(r - 0.17) < 0.022) return 3;
  if (r < 0.22 || r > 0.47) return 0;
  const k = Math.round((Math.atan2(y, x) / Math.PI) * 4);
  const ux = Math.cos((k * Math.PI) / 4);
  const uy = Math.sin((k * Math.PI) / 4);
  if (screenGap(x, y, ux * 0.25, uy * 0.25, ux * 0.42, uy * 0.42) < 1.05) return 2;
  if (screenGap(x, y, ux * 0.42 - uy * 0.06, uy * 0.42 + ux * 0.06, ux * 0.42 + uy * 0.06, uy * 0.42 - ux * 0.06) < 1.05) return 2;
  return 0;
}

/** The angle round the dais of a mark (0..7) and of a point, from up the screen going round to the right. */
function turn(x: number, y: number): number {
  return (Math.atan2(x - y, -(x + y)) + 2 * Math.PI) % (2 * Math.PI);
}

/**
 * THE WAYPOINT'S DAIS, as it lies: `state` 'asleep' (its cuts dark), or awake at frame `f` of
 * WAY_FRAMES (its cuts alight, a brighter light going round the ring and each mark lighting as it
 * passes, the disc in the middle brightening and dimming). Anchored at its middle on the floor. 52 x 32
 * game pixels; drawn over the floor, before anything that stands.
 */
function makeDais(theme: Theme, state: 'asleep' | 'awake', f = 0): Sprite {
  const R = WAY_R;
  const W = Math.ceil(R * 2 * 64) + 8;
  const H = Math.ceil(R * 2 * 32) + WAY_H + 8;
  const ox = W / 2;
  const oy = H / 2 + WAY_H / 2 - 1;
  const p = new Px(W, H);
  const head = (f / WAY_FRAMES) * 2 * Math.PI;
  const swell = 0.5 + 0.5 * Math.sin((f / WAY_FRAMES) * 2 * Math.PI);
  const tread = theme.slab;
  const broken = theme.earth?.broken ?? 0.07;
  for (let py = 0; py < H; py++) {
    for (let px = 0; px < W; px++) {
      const sx = (px + 0.5 - ox) / 32;
      const sk = (py + 0.5 - oy + WAY_H) / 16;
      const fx = (sk + sx) / 2;
      const fy = (sk - sx) / 2;
      let c: string | null = null;
      for (let d = 0; d < 0.6; d += 1 / 256) {
        const x = fx - d;
        const y = fy - d;
        const z = WAY_H - 32 * d;
        if (z <= 0) break;
        const r = Math.hypot(x, y);
        if (r >= R) continue;
        if (d === 0) {
          // ITS TOP: dressed stone in eight wedges, a lit lip round its far edge and a dark one round its near edge, and the cuts
          const cut = cutAt(x, y);
          const a = turn(x, y);
          if (cut) {
            if (state === 'asleep') c = hash(Math.floor(a * 9), cut, 401) < broken * 2 ? theme.mortar : mix(theme.mortar, LIGHT[0], 0.18);
            else if (cut === 4) c = swell > 0.6 ? LIGHT[3] : LIGHT[2];
            else if (cut === 3) c = LIGHT[2];
            else {
              // (the light going round: bright at its head, trailing behind it)
              const behind = (head - a + 4 * Math.PI) % (2 * Math.PI);
              c = behind < 0.35 ? LIGHT[3] : behind < 1.4 ? LIGHT[2] : LIGHT[1];
            }
            break;
          }
          if (r > R - 0.045) {
            c = x + y < -0.1 ? mix(tread[3], '#ffffff', 0.14) : x + y > 0.1 ? tread[0] : tread[3];
            break;
          }
          const wedge = Math.floor((a / (2 * Math.PI)) * 8 + 0.5) % 8;
          const joint = Math.abs((a / (2 * Math.PI)) * 8 + 0.5 - Math.round((a / (2 * Math.PI)) * 8 + 0.5)) * r * 6 < 0.05 && r > 0.6;
          c = joint ? theme.mortar : hash(wedge, 1, 403) < 0.4 ? tread[3] : tread[2];
          // (a chip off its edge here and there)
          if (r > R - 0.1 && hash(Math.floor(a * 7), 2, 405) < broken) c = theme.mortar;
          break;
        }
        // ITS SIDE, a step high: lit where it faces screen-left, in shade where it faces screen-right
        const k = (y - x) / r;
        const v = WAY_H - z;
        const face = k > 0.25 ? theme.lit : k < -0.25 ? theme.shade : [theme.lit[0], theme.lit[1], mix(theme.lit[2], theme.shade[2], 0.5), theme.lit[3], theme.lit[4]];
        c = v < 1 ? face[4] : v > WAY_H - 1.5 ? face[0] : face[2];
        break;
      }
      if (c) p.set(px, py, c);
    }
  }
  const s = p.sprite(ox, oy, GRAIN);
  if (state === 'awake') s.lights = [{ x: ox / GRAIN, y: (oy - 6) / GRAIN, r: 30, color: '#28dcf0', a: 0.14 + 0.06 * swell }];
  return s;
}

/**
 * WHAT STANDS OVER IT: awake, motes of light rising off the cuts (frame `f` of WAY_FRAMES); warping
 * (frame `f` of WARP_FRAMES), a column of light that stands up out of the disc, flares white, and
 * goes, a ring of light going out across the dais at its height. Anchored at the dais's middle.
 * 52 x 130 game pixels.
 */
function makeOver(kind: 'motes' | 'warp', f: number): Sprite {
  const W = Math.ceil(WAY_R * 2 * 64) + 8;
  const H = 260;
  const ox = W / 2;
  const oy = H - 30;
  const p = new Px(W, H);
  if (kind === 'motes') {
    // eight motes, each rising from a mark and fading in three steps as it goes
    for (let m = 0; m < 8; m++) {
      const life = ((f / WAY_FRAMES + m * 0.37) % 1 + 1) % 1;
      const a = (m * Math.PI) / 4 + 0.3;
      const x = Math.cos(a) * 0.36;
      const y = Math.sin(a) * 0.36;
      const sx = Math.round(ox + (x - y) * 32 + Math.sin(life * 6 + m) * 2);
      const sy = Math.round(oy + (x + y) * 16 - WAY_H - life * 52);
      // (young, a small cross of light; then a speck; then a dim one)
      if (life < 0.4) {
        p.set(sx, sy, LIGHT[3]);
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) p.set(sx + dx, sy + dy, LIGHT[2]);
      } else if (life < 0.75) {
        p.rect(sx, sy, 2, 2, LIGHT[2]);
        p.set(sx, sy, LIGHT[3]);
      } else p.set(sx, sy, LIGHT[1]);
    }
  } else {
    // THE WARP: the column rises (frames 0-3), flares (4-5), and thins away (6-10), gone at 11; a ring goes out across the top
    const t = f / (WARP_FRAMES - 1);
    const rise = Math.min(1, f / 3);
    const flare = f >= 4 && f <= 5;
    const thin = f <= 5 ? 1 : Math.max(0, 1 - (f - 5) / 6);
    // (at its flare it is wider than a hero, so that it hides him: his scarf and his blade too)
    const half = thin > 0 ? (flare ? 36 : 10) * thin + (flare ? 0 : 1) : 0;
    const top = Math.round(oy - WAY_H - 200 * rise);
    for (let y = top; half > 0 && y < oy - WAY_H + 4; y++) {
      // (its top drawn to a point as it rises)
      const w = half * Math.min(1, (y - top + 1) / 14);
      for (let x = Math.floor(ox - w); x <= Math.ceil(ox + w); x++) {
        const dx = Math.abs(x + 0.5 - ox) / Math.max(1, w);
        if (dx > 1) continue;
        // (crisp bands across it: a white heart, then bright, then the body, then its dark edge)
        p.set(x, y, dx < 0.3 && (flare || f > 1) ? LIGHT[3] : dx < 0.6 ? LIGHT[2] : dx < 0.85 ? LIGHT[1] : LIGHT[0]);
      }
    }
    // the ring going out across the dais, at its height
    const rr = 0.2 + 0.6 * t;
    if (f < WARP_FRAMES - 1) {
      for (let a = 0; a < 2 * Math.PI; a += 0.01) {
        const sx = Math.round(ox + (Math.cos(a) - Math.sin(a)) * rr * 32);
        const sy = Math.round(oy - WAY_H + (Math.cos(a) + Math.sin(a)) * rr * 16);
        p.set(sx, sy, t < 0.5 ? LIGHT[2] : LIGHT[1]);
      }
    }
  }
  const s = p.sprite(ox, oy, GRAIN);
  // (its light as strong as the column is: rising with it, brightest at its flare, gone with it)
  if (kind === 'warp') {
    const a = f <= 3 ? 0.1 + 0.06 * f : f <= 5 ? 0.5 : Math.max(0, 0.28 * (1 - (f - 5) / 6));
    if (a > 0) s.lights = [{ x: ox / GRAIN, y: (oy - 60) / GRAIN, r: 60, color: '#28dcf0', a }];
  }
  return s;
}

export interface WaypointArt {
  /** The dais asleep (not yet found). */
  asleep: Sprite;
  /** The dais awake, WAY_FRAMES of a loop, and the motes rising over it. */
  awake: Sprite[];
  motes: Sprite[];
  /** A warp: WARP_FRAMES, the column of light over it. */
  warp: Sprite[];
}

export function makeWaypointArt(theme: Theme): WaypointArt {
  return {
    asleep: makeDais(theme, 'asleep'),
    awake: Array.from({ length: WAY_FRAMES }, (_, f) => makeDais(theme, 'awake', f)),
    motes: Array.from({ length: WAY_FRAMES }, (_, f) => makeOver('motes', f)),
    warp: Array.from({ length: WARP_FRAMES }, (_, f) => makeOver('warp', f)),
  };
}

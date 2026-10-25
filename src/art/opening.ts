// THE OPENING: a comic of the caravan's climb, played as a new game begins (his words to the main chat, 24 Oct 2026, 13:00
// Pacific: “I’d like to get an opening cinematic when you start a new game.  It would show a caravan traveling up the
// mountain.  With it would be your chosen character, and all the town vendor guys (armorer, mystic, stranger, wordsmith).
// They’re following another wordsmith looking for the meldstone and the altar (this is the wordsmith you find in the wardens
// area.  Then you’re  accosted by cultists and seek shelter in the prison, barring the doors just in time.  I’m thinking the
// art would be in the same vein as the title screen, a breathing comic book type style.”). Painted by the main chat at his
// word (“The art chat is pretty busy atm.  You have all the capabilities of the art chat right?”). The game begins in town
// after it, as now (“In town, as now (Recommended)”). As comic pages (his: “Take a look at some comic book pages and they are
// multiple smaller boxes each page, but when something big or important happens, it may take up a full page or even the
// whole spread of both pages”): eight pages, two to the screen as a comic lies open, their boxes laid out as he saw them
// (opening_layout.png, his “Yes, paint page 1 (Recommended)”).
//
// A MOCK-UP BEHIND A SWITCH THAT IS OFF (OPENING.on): nothing of it is in the game until he has seen it and said yes.
//
// THE SPREAD: two pages side by side, SPREAD_W x SPREAD_H game pixels (it fits the smallest of the phone's screens held
// sideways; a bigger screen shows the desk round it), painted at the finer grain (DENSITY picture pixels to a game pixel).
// Every box is painted on its own, in its own picture pixels, and laid on its page.

import { Px } from '../engine/px';
import { INK, band, bandBy, bands, balloon, shine, caption, captionSize, clamp01, dot, facets, fbm, glow, hash, inside, layerOf, lerp, limbSolid, loop, mix, noise, over, path, shadeSolid, sm, solid, wash } from './comic';
import type { Pt, Tones, V3 } from './comic';
import { Figure, axes, cross, unit } from './sdf';
import { ear, forearm, frameAt, hand, nose } from './anatomy';
import * as Cast from './cast';

/** THE SWITCH: off, until he has seen it and said yes. */
export const OPENING = { on: false };

/** Picture pixels to a game pixel. */
export const DENSITY = 2;
/** A spread, two pages, in game pixels. */
export const SPREAD_W = 416;
export const SPREAD_H = 192;
/** A page's margin and the gutters between its boxes, in picture pixels. */
const MARGIN = 12;
const GUTTER = 8;
/** The paper, and the shadow down the spine. */
const PAPER = '#e6dcc4';
const PAPER_DARK = '#c9bc9e';

/** A box of a page: where on the page (0..1 of its inner area), and what is painted in it. */
export interface BoxDef {
  x: number;
  y: number;
  w: number;
  h: number;
  /** Its painter: into a layer its size (picture pixels), `t` seconds on (its breath). */
  paint: (p: Px, t: number) => void;
  /** Its caption, top left (drawn in the game's own lettering), if any. */
  say?: string;
  /** Across both pages of the spread (the run for the gate). */
  across?: boolean;
}

/** A box's rectangle in picture pixels on its spread. */
export function boxRect(b: BoxDef, page: 0 | 1): { x: number; y: number; w: number; h: number } {
  const PW = (SPREAD_W * DENSITY) / 2;
  const PH = SPREAD_H * DENSITY;
  const ox = b.across ? 0 : page * PW;
  const iw = (b.across ? PW * 2 : PW) - 2 * MARGIN;
  const ih = PH - 2 * MARGIN;
  const x0 = ox + MARGIN + Math.round(b.x * iw) + (b.x <= 0 ? 0 : GUTTER / 2);
  const y0 = MARGIN + Math.round(b.y * ih) + (b.y <= 0 ? 0 : GUTTER / 2);
  const x1 = ox + MARGIN + Math.round((b.x + b.w) * iw) - (b.x + b.w >= 0.999 ? 0 : GUTTER / 2);
  const y1 = MARGIN + Math.round((b.y + b.h) * ih) - (b.y + b.h >= 0.999 ? 0 : GUTTER / 2);
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

/** The sky's light broken into long ragged strata of cloud (so that its bands never close into rings round the glow). */
function strata(x: number, y: number, seed: number): number {
  return (fbm(x / 46, y / 5, seed) - 0.5) * 0.34 + (fbm(x / 13, y / 2.5, seed + 1) - 0.5) * 0.08;
}

// =============================================================================================
// PAGE 1, BOX 1: THE ROAD UP. Dusk. Switchbacks climb a mountain's face to a dark prison on a crag, black against the last of
// the light; two wagons with lanterns wind up the lowest bend; far above them on the road, a small figure with a cyan light.

/** The dusk sky, from the top of the picture down to the glow on the horizon. */
const DUSK: Tones = ['#0e0b22', '#171232', '#251842', '#3a1e4c', '#5a2650', '#86344e', '#b44e48', '#d8744a', '#eea25e'];
/** The far range, against the glow; the rim of light along its ridges. */
const FAR: Tones = ['#2a1f48', '#35264f', '#462e58'];
const FAR_RIM = '#8e6258';
/** The mountain the road climbs: its dark face, its faces turned to the glow. */
const ROCK: Tones = ['#0f0c1e', '#16122a', '#1f1936', '#2b2244', '#3d2e52'];
const ROCK_RIM = '#6e4a48';
/** The prison's stone, black on the sky, rimmed with the glow. */
const KEEP: Tones = ['#0a0816', '#120f22', '#1b1630'];
const KEEP_RIM = '#a8705a';
/** The road's dust, and where the glow catches it. */
const ROAD: Tones = ['#2a2238', '#3c3048', '#54445c', '#6e5a70'];
/** A lantern's flame and its light. */
export const LAMP = ['#fff6d8', '#ffd98a', '#f4a648', '#c46a2c'];
/** The wordsmiths' light: the friend's cyan. */
export const CYANS = ['#e6ffff', '#8ff4ff', '#28dcf0', '#1898b4'];

export function paintRoadUp(p: Px, t: number): void {
  const W = p.w;
  const H = p.h;
  // where the glow is: low on the horizon, behind the crag
  const GX = W * 0.76;
  const GY = H * 0.34;
  // THE SKY, in flat bands, the dots of each band laid over the next: dark up, burning low behind the crag
  const sky = layerOf(p);
  sky.rect(0, 0, W, H, DUSK[0]);
  bands(sky, DUSK, (x, y) => {
    const g = glow(x * 0.62, y * 2.2, GX * 0.62, GY * 2.2, W * 0.8);
    return clamp01(0.05 + Math.pow(y / H, 1.2) * 0.3 + g * 1.05 + strata(x, y, 1690));
  });
  // a few stars, high and away from the glow
  for (let k = 0; k < 46; k++) {
    const x = Math.floor(hash(k, 1, 91) * W);
    const y = Math.floor(hash(k, 2, 91) * H * 0.3);
    if (glow(x, y, GX, GY, W * 0.7) > 0.04) continue;
    sky.set(x, y, hash(k, 3, 91) > 0.75 ? '#efe8ff' : '#7c74a8');
  }
  over(p, sky, null);
  // LONG CLOUDS across the glow, dark, their undersides lit
  const cl = layerOf(p);
  for (const [cy, x0, x1, th, sd] of [[0.2, 0.34, 1.05, 5, 1], [0.28, 0.5, 1.08, 4, 2], [0.13, 0.62, 0.98, 3, 3]] as const) {
    const top: Pt[] = [];
    const bot: Pt[] = [];
    for (let x = x0 * W; x <= x1 * W; x += 4) {
      const f = (x - x0 * W) / ((x1 - x0) * W);
      const thick = th * Math.sin(Math.PI * f) * (0.7 + 0.6 * noise(x / 18, sd, 40));
      top.push([x, H * cy - thick * 0.6]);
      bot.push([x, H * cy + thick * 0.4]);
    }
    cl.poly([...top, ...bot.reverse()], '#2a1838');
  }
  cl.each((x, y) => (!cl.has(x, y + 1) || !cl.has(x, y + 2) ? (glow(x, y, GX, GY, W * 0.7) > 0.15 ? '#f0a070' : '#9a4a5a') : undefined));
  over(p, cl, null);
  // THE FAR RANGE: jagged, cut in big facets, the faces toward the glow lit
  const far = layerOf(p);
  const ridge = (x: number): number => {
    const u = x / W;
    const saw = Math.abs(((u * 5.3 + 0.2) % 1) - 0.5) * 2;
    return H * (0.44 + 0.06 * saw + 0.05 * fbm(x / 40, 0, 7, 3) + 0.04 * Math.sin(u * 3.1));
  };
  for (let x = 0; x < W; x++) far.vline(x, Math.round(ridge(x)), H, FAR[0]);
  facets(far, ['#1e1838', '#2a2048', '#3a2a56', '#5a3460', '#8a4660'], [0.9, -0.2, 0.25], {
    cw: 22, ch: 30, seed: 5, tilt: [-0.1, -0.3], spread: 1.1, cracks: false,
    extra: (x, y) => glow(x, y, GX, GY, W * 0.6) * 0.5 - 0.15,
  });
  for (let x = 0; x < W; x++) {
    const y = Math.round(ridge(x));
    if (glow(x, y, GX, GY, W * 0.55) > 0.1) far.set(x, y, FAR_RIM);
  }
  over(p, far, null);
  // THE MOUNTAIN: a long slope from the lower left up toward the crag's foot
  const slope: Pt[] = loop([
    [-10, H * 0.66],
    [W * 0.14, H * 0.6],
    [W * 0.3, H * 0.54],
    [W * 0.44, H * 0.47],
    [W * 0.56, H * 0.43],
    [W * 0.66, H * 0.45],
    [W + 10, H * 0.52],
    [W + 10, H + 10],
    [-10, H + 10],
  ], 8, [0, 6, 7, 8]);
  const mtn = layerOf(p);
  mtn.poly(slope, ROCK[0]);
  bands(mtn, ROCK, (x, y) => 0.5 + glow(x, y, GX, GY, W * 0.75) * 0.6 - ((y - H * 0.45) / H) * 0.9 + (fbm(x / 30, y / 12, 12) - 0.5) * 0.35);
  // (strata: long ink strokes along the slope's grain, in its shadows; its skyline rimmed toward the glow)
  for (let k = 0; k < 16; k++) {
    const sx = hash(k, 1, 61) * W * 0.7;
    const sy = H * (0.58 + hash(k, 2, 61) * 0.4);
    const len = 18 + hash(k, 3, 61) * 40;
    const pts = path([[sx, sy], [sx + len * 0.5, sy - len * 0.16 + (hash(k, 4, 61) - 0.5) * 4], [sx + len, sy - len * 0.3]], 8);
    for (const [x, y] of pts) if (mtn.has(Math.round(x), Math.round(y))) mtn.set(Math.round(x), Math.round(y), '#0a0816');
  }
  mtn.each((x, y) => (!mtn.has(x, y - 1) && glow(x, y, GX, GY, W * 0.6) > 0.05 ? ROCK_RIM : undefined));
  over(p, mtn, INK);
  // THE CRAG: a spire of rock standing up out of the slope at the right, flat topped, the prison on it; cut in tall facets,
  // a cliff, its faces toward the glow lit
  const spire: Pt[] = loop([
    [W * 0.5, H + 10],
    [W * 0.56, H * 0.66],
    [W * 0.575, H * 0.58],
    [W * 0.6, H * 0.55],
    [W * 0.6, H * 0.46],
    [W * 0.615, H * 0.4],
    [W * 0.612, H * 0.36],
    [W * 0.63, H * 0.33],
    [W * 0.64, H * 0.3],
    [W * 0.66, H * 0.285],
    [W * 0.88, H * 0.285],
    [W * 0.892, H * 0.31],
    [W * 0.9, H * 0.36],
    [W * 0.915, H * 0.4],
    [W * 0.912, H * 0.47],
    [W * 0.935, H * 0.52],
    [W * 0.95, H * 0.6],
    [W * 0.98, H * 0.66],
    [W + 10, H * 0.72],
    [W + 10, H + 10],
  ], 2, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  // THE ROAD, built where it lies (paintRoad3D): switchbacks up the slope, round behind the crag's foot
  const road = paintRoad3D(p, W, H, GX, GY);
  // THE CRAG, over the road where it goes round behind it: a spire of rock, flat topped, the prison on it; cut in tall
  // facets, a sheer cliff, cracks down it and ledges across it, its faces toward the glow lit, a little haze on it
  const crag = layerOf(p);
  crag.poly(spire, ROCK[0]);
  facets(crag, ['#0d0b1c', '#16122a', '#221b38', '#33284c', '#4a3a60', '#6a5272'], [0.9, -0.35, 0.25], {
    cw: 7, ch: 26, seed: 13, tilt: [0.25, 0], spread: 1.6,
    extra: (x, y) => glow(x, y, GX, GY, W * 0.42) * 0.9 - ((y - H * 0.3) / H) * 0.5 + 0.08,
  });
  crag.each((x, y) => (!crag.has(x, y - 1) || (!crag.has(x + 1, y) && glow(x, y, GX, GY, W * 0.4) > 0.1) ? ROCK_RIM : undefined));
  over(p, crag, INK);
  // (the road again, where it comes out on the crag's face: a ledge cut across it and back, up to the gate)
  const ledge: Pt[] = path([[W * 0.598, H * 0.47], [W * 0.66, H * 0.42], [W * 0.715, H * 0.385], [W * 0.66, H * 0.35], [W * 0.63, H * 0.325], [W * 0.66, H * 0.3], [W * 0.695, H * 0.293]], 8);
  for (let i = 1; i < ledge.length; i++) {
    const [x0, y0] = ledge[i - 1];
    const [x1, y1] = ledge[i];
    const n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0)));
    for (let q = 0; q <= n; q++) {
      const x = Math.round(x0 + ((x1 - x0) * q) / n);
      const y = Math.round(y0 + ((y1 - y0) * q) / n);
      p.set(x, y - 1, glow(x, y, GX, GY, W * 0.45) > 0.15 ? '#8a6a72' : '#54445c');
      p.set(x, y, '#3c3048');
      p.set(x, y + 1, '#07060d');
    }
  }
  // THE PRISON on the crag
  {
    // (sculpted: sculptPrison, a metre a unit; seen from below, against the glow)
    const pf = new Figure();
    sculptPrison(pf, [0, 0, 0], 0.12);
    pf.draw(p, { look: unit([0.1, 1, 0.08]), up: [0, 0, 1], scale: W * 0.00315, ox: W * 0.77, oy: H * 0.3, persp: 260 }, { from: unit([0.35, 0.8, 0.6]), hard: 1, fill: [-0.2, -1, 0.3], fillK: 0.4, rim: KEEP_RIM, rimFrom: [0.3, -1] });
  }
  // THE WAGONS on the lowest bend, their lanterns lit, each set on the road and tilted with it; THE OLD WORDSMITH far up the
  // road, his light
  // (sculpted: sculptWagon, a fifth of a metre a unit; the furthest first)
  const lamps: Pt[] = [];
  for (const [m, seed] of [[14, 0], [5.5, 1]] as const) {
    const r = road(m);
    const wf = new Figure();
    const w = sculptWagon(wf, [0, 0, 0], Math.atan2(r.dir[1], r.dir[0]), { roll: seed * 0.7, horse: { ph: t * 2.2 + seed * 2.1, gallop: false }, lampSide: -1, driver: seed === 1 ? 'armourer' : true, ribs: false });
    const cam = r.cam(0.2);
    wf.draw(p, cam, { from: unit([-0.35, -0.75, 0.6]), hard: 1, fill: [0.6, 0.6, 0.3], fillK: 0.3, rim: '#f0a070', rimFrom: [1, -0.4] });
    if (w.lamp) lamps.push(seen(cam, w.lamp));
  }
  for (const [x, y] of lamps) shine(p, x, y, 8, LAMP[1], 2, 0.3);
  // (the old wordsmith, small, up on the next bend of the road, well ahead of them, his staff up at the prison, burning; his
  // long shadow down the road behind him)
  // (sculpted as on page 3, oldSmithFigure, drawn larger than he would be seen so far off, that he is seen at all)
  const rs = road(268);
  const sf = oldSmithFigure(Math.atan2(rs.dir[0], -rs.dir[1]), Math.sin(t * 1.3) * 0.15, unit([0.35, 0.9, 0.75]), true, 19.2);
  const scs = rs.cam(0.48);
  stroke(p, [[rs.x - 1, rs.y + 1], [rs.x - 12, rs.y + 3]], 1, '#141020');
  sf.f.draw(p, scs, { from: unit([0.55, 1, 0.3]), hard: 1, fill: [-0.3, -1, 0.5], fillK: 0.45, rim: CYANS[2], rimFrom: [1, -0.6] });
  const sh2 = seen(scs, sf.head);
  paintStaffFire(p, sh2[0], sh2[1], 0.32, t, 0.9);
  // THE NEAR SLOPE: black rock and pines framing the bottom right, their tops caught by the glow
  const near = layerOf(p);
  near.poly(loop([[W * 0.6, H + 10], [W * 0.68, H * 0.88], [W * 0.8, H * 0.8], [W * 0.9, H * 0.71], [W + 10, H * 0.66], [W + 10, H + 10]], 10, [0, 4, 5]), '#06050c');
  paintPine(near, W * 0.83, H * 0.84, 52, 0);
  paintPine(near, W * 0.94, H * 0.76, 70, 1);
  paintPine(near, W * 0.74, H * 0.92, 34, 2);
  near.each((x, y) => (!near.has(x, y - 1) && glow(x, y, GX, GY, W * 0.7) > 0.05 ? '#4a3036' : undefined));
  over(p, near, INK);
  // THE CAPTION
  caption(p, 'They followed the old wordsmith up the mountain...', 6, 6, 92);
}

/**
 * THE ROAD UP, built where it lies and seen in perspective (the owner, of the first polish, 24 Oct: "The path doesn't look have
 * any dimensions"): a road four metres wide climbing the mountain's face in switchbacks, cut into the slope, so that on its
 * uphill side a bank of rock rises over it and on its downhill side a wall of laid stones holds it up; its two ruts; the
 * nearer bends wide and the further ones narrow, the furthest dim in the haze. In metres: x across the picture, y away from
 * us, z up; the eye 16 m over the nearest of it. Each piece is laid on the picture from the furthest to the nearest.
 */
/** Where the road is on the picture `m` metres up it from its nearest: its middle, its slope there (radians, up to the right), how wide it is seen. */
interface RoadAt { x: number; y: number; slope: number; wide: number; q: V3; dir: V3; cam: (unit: number) => { look: V3; up: V3; scale: number; ox: number; oy: number } }
function paintRoad3D(p: Px, W: number, H: number, GX: number, GY: number): (m: number) => RoadAt {
  const F = W * 0.78;
  const HY = H * 0.44;
  const EYE = 28;
  const proj = (q: V3): Pt => [W / 2 + (F * q[0]) / q[1], HY - (F * (q[2] - EYE)) / q[1]];
  /** A point of the road put where it is seen on the picture at `d` metres away. */
  const at = (sx: number, sy: number, d: number): V3 => [((sx - W / 2) * d) / F, d, EYE + ((HY - sy) * d) / F];
  const keys: V3[] = [
    at(-0.1 * W, 1.0 * H, 21), at(0.28 * W, 0.9 * H, 29), at(0.5 * W, 0.835 * H, 40), at(0.53 * W, 0.81 * H, 47),
    at(0.3 * W, 0.765 * H, 128), at(0.13 * W, 0.71 * H, 160), at(0.125 * W, 0.685 * H, 172), at(0.3 * W, 0.62 * H, 215),
    at(0.48 * W, 0.525 * H, 300), at(0.565 * W, 0.49 * H, 380), at(0.66 * W, 0.47 * H, 470),
  ];
  // (smoothed: through its points, a little at a time)
  const pts: V3[] = [];
  for (let i = 0; i < keys.length - 1; i++) {
    const p0 = keys[Math.max(0, i - 1)];
    const p1 = keys[i];
    const p2 = keys[i + 1];
    const p3 = keys[Math.min(keys.length - 1, i + 2)];
    const n = Math.max(4, Math.round(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / (1.2 + p1[1] * 0.02)));
    for (let j = 0; j < n; j++) {
      const u = j / n;
      const u2 = u * u;
      const u3 = u2 * u;
      const c = (a: number, b: number, cc: number, d: number): number => 0.5 * (2 * b + (-a + cc) * u + (2 * a - 5 * b + 4 * cc - d) * u2 + (-a + 3 * b - 3 * cc + d) * u3);
      pts.push([c(p0[0], p1[0], p2[0], p3[0]), c(p0[1], p1[1], p2[1], p3[1]), c(p0[2], p1[2], p2[2], p3[2])]);
    }
  }
  pts.push(keys[keys.length - 1]);
  // every piece: its kind (1 the road, 2 the bank, 3 the wall, 4 a rut, 5 a joint of the wall), how lit, how far
  const N = W * H;
  const kind = new Uint8Array(N);
  const lit = new Float32Array(N);
  const far = new Float32Array(N);
  const put = (x: number, y: number, kd: number, l: number, d: number): void => {
    const X = Math.round(x);
    const Y = Math.round(y);
    if (X < 0 || Y < 0 || X >= W || Y >= H) return;
    const i = Y * W + X;
    kind[i] = kd;
    lit[i] = l;
    far[i] = d;
  };
  const fill = (poly: readonly Pt[], kd: number, l: number, d: number): void => {
    let x0 = Infinity;
    let x1 = -Infinity;
    let y0 = Infinity;
    let y1 = -Infinity;
    for (const [x, y] of poly) {
      x0 = Math.min(x0, x);
      x1 = Math.max(x1, x);
      y0 = Math.min(y0, y);
      y1 = Math.max(y1, y);
    }
    for (let y = Math.max(0, Math.floor(y0)); y <= Math.min(H - 1, Math.ceil(y1)); y++) {
      for (let x = Math.max(0, Math.floor(x0)); x <= Math.min(W - 1, Math.ceil(x1)); x++) {
        if (inside(poly, x + 0.5, y + 0.5)) put(x, y, kd, l, d);
      }
    }
  };
  const line = (a: Pt, b: Pt, kd: number, l: number, d: number): void => {
    const n = Math.max(1, Math.ceil(Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]))));
    for (let i = 0; i <= n; i++) put(a[0] + ((b[0] - a[0]) * i) / n, a[1] + ((b[1] - a[1]) * i) / n, kd, l, d);
  };
  const HALF = 2.4;
  const BANK = 1.6;
  const WALL = 2.6;
  const pieces: { d: number; draw: () => void }[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const dir = unit([b[0] - a[0], b[1] - a[1], 0]);
    // (across the road, level; the uphill side is the further one)
    let side: V3 = [-dir[1], dir[0], 0];
    if (side[1] < 0) side = [-side[0], -side[1], 0];
    const prev = pts[Math.max(0, i - 1)];
    const dir0 = unit([a[0] - prev[0], a[1] - prev[1], 0]);
    let side0: V3 = [-dir0[1], dir0[0], 0];
    if (side0[1] < 0) side0 = [-side0[0], -side0[1], 0];
    if (i === 0) side0 = side;
    const off = (q: V3, sd: V3, k2: number, dz: number): V3 => [q[0] + sd[0] * k2, q[1] + sd[1] * k2, q[2] + dz];
    const upA = off(a, side0, HALF, 0);
    const upB = off(b, side, HALF, 0);
    const dnA = off(a, side0, -HALF, 0);
    const dnB = off(b, side, -HALF, 0);
    const d = (a[1] + b[1]) / 2;
    if (Math.min(upA[1], dnA[1], upB[1], dnB[1]) < 3) continue;
    // (the light: the glow beyond the crag lies low over the far right; what turns to it is lit)
    const toward = clamp01(dir[0] * 0.6 + 0.5);
    pieces.push({
      d,
      draw: () => {
        const [sx, sy] = proj(a);
        const g = glow(sx, sy, GX, GY, W * 0.7);
        // the wall of laid stones under its downhill edge, standing out of the slope
        const wa = off(dnA, side0, -0.6, -WALL);
        const wb = off(dnB, side, -0.6, -WALL);
        fill([proj(dnA), proj(dnB), proj(wb), proj(wa)], 3, 0.18 + g * 0.5 + toward * 0.12, d);
        // the bank of rock rising over its uphill edge
        const ba = off(upA, side0, 0.9, BANK);
        const bb = off(upB, side, 0.9, BANK);
        fill([proj(upA), proj(upB), proj(bb), proj(ba)], 2, 0.12 + g * 0.6 + toward * 0.25, d);
        // the road itself
        fill([proj(upA), proj(upB), proj(dnB), proj(dnA)], 1, 0.4 + g * 0.85 + toward * 0.1, d);
        // its ruts, where it is wide enough to show them; the joints of the wall's stones, where it is tall enough
        const wide = Math.hypot(proj(upA)[0] - proj(dnA)[0], proj(upA)[1] - proj(dnA)[1]);
        if (wide > 5) {
          for (const v of [-0.55, 0.55]) line(proj(off(a, side0, v * HALF, 0.01)), proj(off(b, side, v * HALF, 0.01)), 4, 0.2, d);
        }
        const tall = Math.abs(proj(wa)[1] - proj(dnA)[1]);
        if (tall > 4) {
          line(proj(off(dnA, side0, -0.3, -WALL * 0.5)), proj(off(dnB, side, -0.3, -WALL * 0.5)), 5, 0, d);
          if (i % 2 === 0) line(proj(off(dnA, side0, -0.15, -0.1)), proj(off(dnA, side0, -0.3, -WALL * 0.5)), 5, 0, d);
          else line(proj(off(dnA, side0, -0.3, -WALL * 0.5)), proj(off(dnA, side0, -0.6, -WALL)), 5, 0, d);
        }
        // (its outer edge: a line of light where the road's lip meets the wall)
        line(proj(dnA), proj(dnB), 6, 0.6 + g, d);
      },
    });
  }
  pieces.sort((u, v) => v.d - u.d);
  for (const pc of pieces) pc.draw();
  // COLOURED: each kind in its own tones by how lit, the dots of each tone laid over the next; the further, the more of
  // the haze in it
  const TONES: Record<number, Tones> = {
    1: ROAD,
    2: ['#0c0a18', '#16122a', '#221b38', '#33284a', '#4a3656'],
    3: ['#0a0814', '#141022', '#1e1830', '#2c2240'],
    4: ['#1a1428', '#241c34', '#302640'],
    5: ['#06050c', '#0a0814'],
    6: ['#4a3a58', '#6e5a70', '#9a7a82', '#c89a8a'],
  };
  const haze = rgbOf(FAR[1]);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const kd = kind[i];
      if (!kd) continue;
      const tones = TONES[kd];
      const v = clamp01(lit[i] + (fbm(x / 4, y / 4, 21 + kd) - 0.5) * 0.3) * (tones.length - 1);
      const lo = Math.floor(v);
      const c = lo < tones.length - 1 && dot(x, y, v - lo, 3) ? tones[lo + 1] : tones[lo];
      const hz = clamp01((far[i] - 120) / 700) * 0.55;
      const q = rgbOf(c);
      p.set(x, y, hexOf([q[0] + (haze[0] - q[0]) * hz, q[1] + (haze[1] - q[1]) * hz, q[2] + (haze[2] - q[2]) * hz]));
    }
  }
  // the shadow it throws down the slope under its wall: the mountain's face under each bend dark, lightening down to the
  // next, so that each bend stands on its own shelf of the hill
  for (let x = 0; x < W; x++) {
    let since = 99;
    let reach = 0;
    for (let y = 0; y < H; y++) {
      const i = y * W + x;
      if (kind[i]) {
        since = 0;
        reach = Math.max(4, Math.min(16, 1800 / Math.max(60, far[i])));
        continue;
      }
      since++;
      if (since < reach && dot(x, y, 1 - since / reach, 2)) p.set(x, y, since < reach * 0.4 ? '#07060d' : '#0f0c1e');
    }
  }
  // ink round it all, where it meets the slope
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (kind[i]) continue;
      if ((x > 0 && kind[i - 1]) || (x < W - 1 && kind[i + 1]) || (y > 0 && kind[i - W]) || (y < H - 1 && kind[i + W])) p.set(x, y, '#07060d');
    }
  }
  // (where a thing on it stands: so far up it, on the picture)
  const run: number[] = [0];
  for (let i = 1; i < pts.length; i++) run.push(run[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1], pts[i][2] - pts[i - 1][2]));
  return (m: number): RoadAt => {
    let i = 1;
    while (i < pts.length - 1 && run[i] < m) i++;
    const u = clamp01((m - run[i - 1]) / Math.max(1e-6, run[i] - run[i - 1]));
    const q: V3 = [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * u, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * u, pts[i - 1][2] + (pts[i][2] - pts[i - 1][2]) * u];
    const a0 = proj(pts[i - 1]);
    const a1 = proj(pts[i]);
    const dir = unit([pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1], 0]);
    const e0 = proj([q[0] - dir[1] * HALF, q[1] + dir[0] * HALF, q[2]]);
    const e1 = proj([q[0] + dir[1] * HALF, q[1] - dir[0] * HALF, q[2]]);
    const [x, y] = proj(q);
    const fx = a1[0] - a0[0];
    const fy = a1[1] - a0[1];
    // (a camera for a thing sculpted standing on it there, `unit` metres to its unit: looking from the eye at it)
    const rel: V3 = [q[0], q[1], q[2] - EYE];
    const dist = Math.hypot(rel[0], rel[1], rel[2]);
    const cam = (u: number) => ({ look: unit(rel), up: [0, 0, 1] as V3, scale: (F / dist) * u, ox: x, oy: y });
    return { x, y, slope: Math.atan2(-fy * Math.sign(fx || 1), Math.abs(fx)), wide: Math.hypot(e1[0] - e0[0], e1[1] - e0[1]), q, dir, cam };
  };
}

function rgbOf(c: string): [number, number, number] {
  return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
}
function hexOf(q: readonly number[]): string {
  return '#' + q.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
}



/** A pine, black, its boughs in ragged tiers drooping from the trunk, `h` tall, its foot at (x, y). */
function paintPine(p: Px, x: number, y: number, h: number, seed: number): void {
  // (a mountain pine in silhouette: a crooked trunk; boughs that droop and end in ragged sprays of needles, longer on the
  // side the wind has left them, thinning to a spike at the top)
  const lean = (hash(0, 0, 37 + seed) - 0.5) * h * 0.08;
  const X = (f: number): number => x + lean * f;
  p.poly([[X(0) - 1.2, y], [X(0.9) - 0.4, y - h * 0.9], [X(0.9) + 0.4, y - h * 0.9], [X(0) + 1.2, y]], '#06050c');
  const tiers = Math.max(5, Math.round(h / 6));
  for (let k = 0; k < tiers; k++) {
    const f = k / tiers;
    const ty = y - h * (0.18 + 0.8 * f);
    for (const side of [-1, 1]) {
      const reach = ((1 - f) * h * 0.34 + 2) * (side > 0 ? 1.1 : 0.85) * (0.8 + hash(k, side, 41 + seed) * 0.4);
      const droop = 2 + (1 - f) * h * 0.08;
      const pts: Pt[] = [[X(f), ty - 1.5]];
      const sprays = 3;
      for (let i = 1; i <= sprays; i++) {
        const u = i / sprays;
        const jag = (hash(k, i * side, 43 + seed) - 0.5) * 2.5;
        pts.push([X(f) + side * reach * u, ty + droop * u * u - 1.2 + jag * 0.4]);
        pts.push([X(f) + side * reach * (u - 0.12), ty + droop * u * u + 1.6 + jag]);
      }
      pts.push([X(f) + side * 1, ty + droop * 0.6 + 1]);
      p.poly(pts, '#06050c');
    }
  }
  p.poly([[X(1) - 1, y - h * 0.95], [X(1.05), y - h * 1.04], [X(1) + 1, y - h * 0.95]], '#06050c');
}

// =============================================================================================
// PAGE 1, BOX 2: LANTERNS. Close on the front of a wagon: its lantern swinging from an iron arm off the corner post, its
// flame bright in the glass; the light falling on the canvas cover, on the great wheel deep in the rut, on the mud.

/** The wagon's canvas in lamplight, darkest first. */
const CANVAS: Tones = ['#1c1410', '#3a2a1e', '#6a5238', '#9a7e56', '#c8a878', '#ead2a0'];
/** Old wood: the post, the spokes, the bed. */
const WOOD: Tones = ['#120c08', '#24180e', '#3c2818', '#5c3e24', '#86603a'];
/** Black iron: the lantern's frame, the wheel's tyre, the arm. */
const IRON3: Tones = ['#08080c', '#16161e', '#2a2a34', '#4a4a56', '#8a8a98'];
/** The road's mud. */
const MUD: Tones = ['#0c0a0c', '#1a1416', '#2c2022', '#4a3430', '#6e4e40'];

export function paintLanterns(p: Px, t: number): void {
  const W = p.w;
  const H = p.h;
  // the lantern swings a little (its breath): about its hook
  const swing = Math.sin(t * 1.7) * 0.06;
  const hookX = W * 0.36;
  const hookY = H * 0.12;
  const hang = H * 0.2;
  const LX = hookX + Math.sin(swing) * hang;
  const LY = hookY + Math.cos(swing) * hang + H * 0.17;
  const lamp = (x: number, y: number, r = W * 0.85): number => glow(x, y, LX, LY, r);
  // THE DUSK behind, top left: the glow low, the slope's dark edge across it
  const sky = layerOf(p);
  sky.rect(0, 0, W, H, DUSK[2]);
  bands(sky, DUSK, (x, y) => 0.25 + (1 - y / (H * 0.6)) * -0.2 + glow(x, y, -W * 0.1, H * 0.55, W * 0.9) * 0.9 + strata(x, y, 1700));
  over(p, sky, null);
  const hill = layerOf(p);
  hill.poly(loop([[-5, H * 0.42], [W * 0.2, H * 0.36], [W * 0.45, H * 0.3], [W + 5, H * 0.22], [W + 5, H + 5], [-5, H + 5]], 8, [3, 4, 5]), '#0e0b1a');
  bands(hill, ['#08060f', '#0e0b1a', '#171228', '#241a36'], (x, y) => 0.55 - (y - H * 0.35) / H * 1.2 + lamp(x, y, W * 0.5) * 0.8 + (fbm(x / 14, y / 5, 33) - 0.5) * 0.4);
  hill.each((x, y) => (!hill.has(x, y - 1) ? '#5a3c42' : undefined));
  paintPine(hill, W * 0.08, H * 0.42, 26, 4);
  paintPine(hill, W * 0.2, H * 0.38, 18, 5);
  over(p, hill, null);
  // THE ROAD'S MUD at the bottom, its ruts catching the lamp
  const mud = layerOf(p);
  mud.poly(loop([[-5, H * 0.8], [W * 0.4, H * 0.77], [W + 5, H * 0.74], [W + 5, H + 5], [-5, H + 5]], 8, [2, 3, 4]), MUD[0]);
  bands(mud, MUD, (x, y) => lamp(x, y, W * 0.7) * 1.7 + (fbm(x / 9, y / 3, 41) - 0.5) * 0.45);
  // (its two ruts running back from under the wheel into the dusk, drawing together as they go; their wet edges catching
  // the lamp)
  for (const [x0, x1] of [[W * 0.1, W * -0.25], [W * 0.62, W * 0.02]] as const) {
    for (let i = 0; i <= 60; i++) {
      const u = i / 60;
      const x = x0 + (x1 - x0) * u * u * 0.4 + (x1 - x0) * u * 0.6;
      const y = H + 4 - (H * 0.24) * Math.pow(u, 0.7);
      const w = Math.max(1, 3.5 * (1 - u));
      for (let dx = -w; dx <= w; dx++) {
        const X = Math.round(x + dx);
        const Y = Math.round(y);
        if (!mud.has(X, Y)) continue;
        mud.set(X, Y, dx < -w + 1 && lamp(X, Y, W * 0.7) > 0.15 ? MUD[MUD.length - 1] : MUD[0]);
      }
    }
  }
  over(p, mud, INK);
  // THE CANVAS COVER: a great arch filling the right, sagging between its ribs, folds running down it
  const cover = layerOf(p);
  const cv: Pt[] = loop([[W * 0.5, H * 0.72], [W * 0.5, H * 0.3], [W * 0.56, H * 0.05], [W * 0.7, -6], [W + 6, -6], [W + 6, H * 0.72]], 8, [0, 4, 5]);
  cover.poly(cv, CANVAS[0]);
  bands(cover, CANVAS, (x, y) => {
    const ribs = Math.cos(((x - W * 0.5) / (W * 0.17)) * Math.PI * 2) * 0.09;
    const folds = Math.sin(x * 0.45 + y * 0.08 + Math.sin(y * 0.05) * 3) * 0.05;
    return lamp(x, y, W * 0.75) * 1.6 + 0.02 + ribs + folds - (x - W * 0.5) / W * 0.25;
  });
  // (its ribs under the canvas: dark seams; its hem a band of rope)
  cover.each((x, y) => {
    const u = (x - W * 0.5) / (W * 0.17);
    return Math.abs(u - Math.round(u)) < 0.04 && u > 0.3 ? CANVAS[1] : y > H * 0.66 ? (Math.round(x / 3) % 2 ? CANVAS[2] : CANVAS[1]) : undefined;
  });
  over(p, cover, INK);
  // THE CORNER POST and the iron arm the lantern hangs from
  const post = layerOf(p);
  post.poly(band(path([[W * 0.5, H * 0.8], [W * 0.505, H * 0.4], [W * 0.5, -6]], 6), 9, 8), WOOD[0]);
  bands(post, WOOD, (x, y) => lamp(x, y) * 1.4 + (fbm(x / 2, y / 12, 51) - 0.5) * 0.35);
  over(p, post, INK);
  const arm = layerOf(p);
  arm.poly(band([[W * 0.505, hookY], [hookX - 1, hookY]], 3), IRON3[1]);
  arm.poly(band(path([[W * 0.5, hookY + 10], [W * 0.46, hookY + 9], [W * 0.43, hookY + 4], [W * 0.415, hookY + 1]], 8), 2), IRON3[1]);
  arm.poly(band(path([[W * 0.46, hookY + 9], [W * 0.452, hookY + 6], [W * 0.462, hookY + 5]], 4), 1.6), IRON3[1]);
  arm.poly(band(path([[hookX + 1, hookY], [hookX - 1, hookY + 3], [hookX + 1, hookY + 6], [hookX + 3, hookY + 5]], 6), 2), IRON3[2]);
  arm.each((x, y) => (lamp(x, y, W * 0.4) > 0.2 && !arm.has(x, y + 1) ? IRON3[4] : undefined));
  over(p, arm, INK);
  // THE GREAT WHEEL, bottom right, deep in the rut: its iron tyre, its felloes, its spokes and hub, the lamp on its near side
  const bed = layerOf(p);
  bed.poly([[W * 0.49, H * 0.66], [W + 6, H * 0.64], [W + 6, H * 0.78], [W * 0.49, H * 0.8]], WOOD[1]);
  bands(bed, WOOD, (x, y) => lamp(x, y, W * 0.8) * 1.5 + (fbm(x / 2, y / 12, 53) - 0.5) * 0.3);
  bed.each((x, y) => (Math.abs(y - H * 0.72) < 0.6 || Math.abs(x - W * 0.62) < 0.6 ? WOOD[0] : undefined));
  over(p, bed, INK);
  paintWheel(p, W * 0.8, H * 0.9, H * 0.38, lamp, t);
  // THE LANTERN, and its light: a warm halo in the air round it, the dust in it
  shine(p, LX, LY + 4, 34 + Math.sin(t * 5.3) * 2, LAMP[2], 2, 0.22);
  paintLantern(p, LX, LY, swing, hookX, hookY);
}

/** A wagon wheel at (cx, cy), radius r: an iron tyre over wooden felloes, twelve spokes to the hub; lit by `lit`. */
function paintWheel(p: Px, cx: number, cy: number, r: number, lit: (x: number, y: number) => number, t: number): void {
  const w = layerOf(p);
  const turn = t * 0.05;
  w.ellipse(cx, cy, r, r, IRON3[1]);
  w.ellipse(cx, cy, r - 4, r - 4, WOOD[1]);
  w.ellipse(cx, cy, r - 11, r - 11, '#00000000');
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2 + turn;
    w.poly(band([[cx + Math.cos(a) * 6, cy + Math.sin(a) * 6], [cx + Math.cos(a) * (r - 10), cy + Math.sin(a) * (r - 10)]], 5, 3.5), WOOD[1]);
  }
  w.ellipse(cx, cy, 9, 9, WOOD[1]);
  // tone it: the lamp on its near (left, upper) side
  w.each((x, y) => {
    const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
    const L = lit(x, y);
    if (d > r - 4) return L > 0.18 ? (L > 0.3 ? IRON3[4] : IRON3[3]) : IRON3[1];
    const k = clamp01(L * 1.6 + (fbm(x / 2, y / 6, 61) - 0.5) * 0.3);
    return WOOD[Math.min(WOOD.length - 1, Math.floor(k * WOOD.length))];
  });
  // its hub's iron cap, and mud caked on its tyre at the bottom
  w.ellipse(cx, cy, 4, 4, IRON3[2]);
  w.each((x, y) => (Math.hypot(x + 0.5 - cx, y + 0.5 - cy) > r - 5 && y > cy - r * 0.25 && hash(x, y, 71) > 0.55 ? MUD[2] : undefined));
  over(p, w, INK);
}

/**
 * The lantern at (x, y) (its glass's middle), turned `swing`: a dome of a cap with its vent and ring, its wire bail up to the
 * hook at (hx, hy); four panes of glass in an iron frame, narrowing a little to the top; inside, the flame; a dish under it.
 */
function paintLantern(p: Px, x: number, y: number, swing: number, hx: number, hy: number): void {
  const l = layerOf(p);
  const s = Math.sin(swing);
  const R = (px: number, py: number): Pt => [x + px * Math.cos(swing) - py * s, y + px * s + py * Math.cos(swing)];
  // the glass: four panes (two seen), lit from within
  const glass: Pt[] = [R(-9, 11), R(-7.5, -11), R(7.5, -11), R(9, 11)];
  l.poly(glass, LAMP[2]);
  // the cap: a dome with eaves, a vent, the ring
  l.poly(loop([R(-11, -11), R(-8, -16), R(-3, -19), R(3, -19), R(8, -16), R(11, -11)], 4, [0, 5]), IRON3[1]);
  l.poly(loop([R(-3, -19), R(-2.5, -23), R(2.5, -23), R(3, -19)], 2, [0, 3]), IRON3[1]);
  // the dish under it
  l.poly(loop([R(-11, 11), R(-10, 15), R(10, 15), R(11, 11)], 3, [0, 3]), IRON3[1]);
  // the frame: its corner bars and a band round the middle
  for (const u of [-8.5, 0, 8.5]) l.poly(band([R(u * 0.88, -11), R(u, 11)], 2.2), IRON3[1]);
  l.poly(band([R(-8.5, 0), R(8.5, 0)], 1.6), IRON3[1]);
  // tone: the glass glowing hottest in the middle, the iron lit only at its edges by the glass
  l.each((px, py) => {
    const c = l.get(px, py);
    const d = glow(px, py, x, y + 2, 13);
    if (c === LAMP[2]) return d > 0.55 ? LAMP[0] : d > 0.25 ? LAMP[1] : LAMP[2];
    return glow(px, py, x, y, 15) > 0.15 ? IRON3[3] : glow(px, py, x, y, 20) > 0.1 ? IRON3[2] : IRON3[1];
  });
  over(p, l, INK);
  // the bail: a wire up to the hook
  const top = R(0, -23);
  const bail = path([R(-4, -20), [(top[0] + hx) / 2 - 3, (top[1] + hy) / 2], [hx, hy + 6]], 6);
  for (const [bx, by] of bail) p.set(Math.round(bx), Math.round(by), INK);
  // the flame: a tongue, white at its heart
  const f = layerOf(p);
  f.poly(loop([R(0, 6), R(-2.6, 1), R(-0.6, -5), R(0.5, -8.5), R(2.4, 0), R(1.8, 4)], 4), LAMP[1]);
  f.each((px, py) => (glow(px, py, x, y + 1, 5) > 0.2 ? LAMP[0] : undefined));
  over(p, f, null);
}

// =============================================================================================
// PAGE 1, BOX 3: FAR AHEAD. The old wordsmith on the road above them, seen from below and behind: his teal hood and mantle,
// his brown robe blowing, his book at his hip, his staff held high toward the prison, its head burning cyan. Black on the
// glow, his edges rimmed by it and by his staff's light.

/** The old wordsmith's robe (the fallen wordsmith's brown, art/body.ts), his hood and mantle (the wordsmiths' teal), his staff. */
const ROBE_OLD: Tones = ['#140c0a', '#24160e', '#3a2618', '#5a3c24'];
const TEAL_OLD: Tones = ['#071a1e', '#0e2a30', '#1a4448', '#2a6a6c'];

export function paintFarAhead(p: Px, t: number): void {
  const W = p.w;
  const H = p.h;
  const GX = W * 0.86;
  const GY = H * 0.42;
  // the staff's head, and its light
  const SX = W * 0.74;
  const SY = H * 0.12;
  const pulse = 0.5 + 0.5 * Math.sin(t * 2.4);
  const cy = (x: number, y: number): number => glow(x, y, SX, SY, W * 0.5);
  // THE SKY: the glow low at the right
  const sky = layerOf(p);
  sky.rect(0, 0, W, H, DUSK[0]);
  bands(sky, DUSK, (x, y) => 0.08 + glow(x, y * 1.4, GX, GY * 1.4, W * 0.95) * 1.05 + (y / H) * 0.15 + strata(x, y, 1701));
  over(p, sky, null);
  // THE CRAG far up at the right, the prison on it, black
  const crag = layerOf(p);
  // (a spire of rock as on page 1: broken into ledges and buttresses, cut in tall facets, its faces toward the glow lit,
  // the rest dark; its edges rimmed with the last light)
  crag.poly(loop([[W * 0.54, H + 4], [W * 0.57, H * 0.7], [W * 0.6, H * 0.64], [W * 0.6, H * 0.55], [W * 0.635, H * 0.47], [W * 0.63, H * 0.4], [W * 0.66, H * 0.34], [W * 0.665, H * 0.29], [W * 0.7, H * 0.25], [W * 0.77, H * 0.235], [W * 0.86, H * 0.24], [W * 0.92, H * 0.245], [W * 0.925, H * 0.29], [W * 0.95, H * 0.31], [W * 0.955, H * 0.37], [W + 4, H * 0.42], [W + 4, H + 4]], 2, [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 16]), '#120e20');
  facets(crag, ['#0d0b1c', '#16122a', '#221b38', '#33284c', '#4a3a60'], [0.9, -0.35, 0.25], {
    cw: 6, ch: 18, seed: 83, tilt: [0.25, 0], spread: 1.5,
    extra: (x, y) => glow(x, y, GX, GY, W * 0.5) * 0.9 - ((y - H * 0.25) / H) * 0.5 - 0.05,
  });
  crag.each((x, y) => (!crag.has(x, y - 1) || (!crag.has(x + 1, y) && glow(x, y, GX, GY, W * 0.6) > 0.08) ? KEEP_RIM : undefined));
  over(p, crag, INK);
  paintFarKeep(p, W * 0.81, H * 0.245, (W * 0.21) / 46);
  // THE SLOPE he stands on, rising to the right, the road along it
  const slope = layerOf(p);
  slope.poly(loop([[-4, H * 0.95], [W * 0.3, H * 0.96], [W * 0.6, H * 0.86], [W * 0.8, H * 0.72], [W + 4, H * 0.64], [W + 4, H + 4], [-4, H + 4]], 8, [4, 5, 6]), ROCK[0]);
  facets(slope, ROCK, [0.8, -0.4, 0.35], { cw: 18, ch: 8, seed: 81, tilt: [0.2, -0.6], spread: 0.8, cracks: false, extra: (x, y) => glow(x, y, GX, GY, W * 0.8) * 0.4 + cy(x, y) * 0.4 - (y / H) * 0.4 });
  slope.each((x, y) => (!slope.has(x, y - 1) ? ROCK_RIM : undefined));
  over(p, slope, INK);
  // THE OLD WORDSMITH, from behind and below: sculpted as on page 3 (oldSmithFigure), turned away up the road, his staff up at
  // the prison, burning
  const fig = oldSmithFigure(Math.PI - 0.35, Math.sin(t * 1.3) * 0.15, unit([0.55, 0.45, 0.85]), true, 19.2);
  const cam = { look: unit([0.15, 1, 0.3]), up: [0, 0, 1] as V3, scale: (H / 112) * 6.2, ox: W * 0.33, oy: H * 1.22, persp: 50 };
  const right = unit(cross(cam.look, cam.up));
  const dn = unit(cross(cam.look, right));
  const hs: Pt = seen(cam, fig.head);
  void right;
  void dn;
  fig.f.draw(p, cam, { at: fig.head, hard: 1, fill: [-0.1, -1, 0.3], fillK: 0.34, rim: CYANS[2], rimFrom: [1, -0.6] });
  paintStaffFire(p, hs[0], hs[1], W / 192, t, 0.85 + 0.15 * pulse);
  void SX;
  void SY;
}

// =============================================================================================
// PAGE 2: THE CARAVAN, close, each in a box of his own, in the lantern's light (from the front, on the left) and the dusk
// behind (on the right). Their skin the game's own (art/title_smith3.ts SKIN_T), warmed where the lamp is on it; their eyes
// the friend's two points of cyan light (the stranger's gold).

/** Skin in lamplight, darkest first: the game's, warmed toward its brightest. */
const SKIN_W: Tones = ['#1e1640', '#2e2456', '#463a72', '#66568e', '#8c76a6', '#b494b0', '#d8b8b8', '#f2dccc'];
/** A beard, white with age, in lamplight. */
const BEARD_W: Tones = ['#3a3070', '#5a4e8e', '#8478b2', '#ac9ec8', '#d0c0d4', '#ecdcd8', '#fff4e8'];
/** The armourer's teal shirt; his leather apron. */
const SHIRT: Tones = ['#041824', '#08283a', '#0c3a4e', '#11566a', '#1d7a86', '#2aa4a6', '#6ad0c0'];
const LEATHER: Tones = ['#140a06', '#24140c', '#3a2214', '#56341e', '#76482a', '#9a6438'];
/** The dusk's rim, on edges turned to it. */
const DUSK_RIM = '#e8904a';

/** Points given on a 192 x 176 grid, put on a box of size W x H. */
function grid(W: number, H: number): (x: number, y: number) => Pt {
  return (x, y) => [(x / 192) * W, (y / 176) * H];
}

/** A lock of hair or beard: a tapering band along `line`, shaded round, strands drawn down it; on `p`, inked. */
function lock(p: Px, line: readonly Pt[], w0: number, w1: number, tones: Tones, L: V3, seed: number, rim?: string): void {
  const l = limbSolid(p, line, w0, w1, tones, L, { hard: 0.7, back: rim ? [1, 0] : undefined, rim });
  // (its strands: two or three darker lines along it, broken)
  const n = line.length;
  for (const off of [-0.28, 0.05, 0.32]) {
    for (let i = 0; i < n; i++) {
      const a = line[Math.max(0, i - 1)];
      const b = line[Math.min(n - 1, i + 1)];
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const ll = Math.hypot(dx, dy) || 1;
      const w = lerp(w0, w1, i / (n - 1)) * off;
      const x = Math.round(line[i][0] - (dy / ll) * w);
      const y = Math.round(line[i][1] + (dx / ll) * w);
      if (l.has(x, y) && hash(x, y, seed) > 0.3) l.set(x, y, tones[Math.max(0, tones.indexOf(l.get(x, y) ?? '') - 2)] ?? tones[0]);
    }
  }
  over(p, l, INK);
}

/**
 * A fist round a strap, the back of the hand toward us: the hand, four fingers curled under it (their knuckles a row of
 * bumps along its top), the thumb laid over; `dir` the way the knuckles point (1 right, -1 left).
 */
function fist(p: Px, c: Pt, s: number, dir: number, L: V3, tones: Tones): void {
  const X = (dx: number, dy: number): Pt => [c[0] + dx * s * dir, c[1] + dy * s];
  // the back of the hand
  over(p, solid(p, loop([X(-9, -4), X(-4, -8), X(5, -8), X(9, -4), X(8, 4), X(-7, 6)], 5), tones, L, { hard: 0.7, round: 0.8 }), INK);
  // the fingers, curled: four rolls under the knuckles
  for (let k = 0; k < 4; k++) {
    const fx = -6 + k * 4.2;
    over(p, limbSolid(p, path([X(fx, -6), X(fx + 1.5, -1), X(fx + 0.5, 4)], 4), 4.6 * s, 4 * s, tones, L, { hard: 0.7 }), INK);
  }
  // the thumb over them
  over(p, limbSolid(p, path([X(-9, 2), X(-3, 5), X(4, 4)], 5), 5 * s, 4 * s, tones, L, { hard: 0.7 }), INK);
}

/** In the comic's hard light: the shadow side nearly black, the lit side in a few flat tones. */
const SKIN_K: Tones = [INK, '#160e26', '#3e2c50', '#8a6a84', '#d8aea8', '#fde2d2'];
const BEARD_K: Tones = [INK, '#2a2240', '#6c6088', '#b8acc4', '#ece0e2', '#fff8f0'];
const SHIRT_K: Tones = [INK, '#03141c', '#0a3644', '#186270', '#3a9a94'];
const LEATHER_K: Tones = [INK, '#1a0e08', '#40261a', '#704628', '#a06c40'];
const IRON_K: Tones = [INK, '#16161e', '#34343e', '#70707e', '#c4c4d4'];

/** Ink a line (`w` wide: 1 or 2) along `pts` on `p`, only where `on` says (default: everywhere). */
function inkLine(p: Px, pts: readonly Pt[], w = 1, c = INK, on?: (x: number, y: number) => boolean): void {
  for (const [x, y] of pts) {
    const X = Math.round(x);
    const Y = Math.round(y);
    if (on && !on(X, Y)) continue;
    p.set(X, Y, c);
    if (w > 1) p.set(X + 1, Y, c);
  }
}

/** Ink a line through `pts`, straight from each to the next (`w` wide: 1 or 2), in `c`. */
function stroke(p: Px, pts: readonly Pt[], w = 1, c = INK): void {
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 1.5));
    for (let j = 0; j <= n; j++) {
      const X = Math.round(x0 + ((x1 - x0) * j) / n);
      const Y = Math.round(y0 + ((y1 - y0) * j) / n);
      p.set(X, Y, c);
      if (w > 1) p.set(X + 1, Y, c).set(X, Y + 1, c);
    }
  }
}

/**
 * Light a silhouette from a lamp at (lx, ly): every pixel of `l` within `reach` of its edge on the side toward the lamp lit in
 * `tones` (darkest first: the body's own black at [0]), the nearer the edge and the lamp the brighter; the rest left its black.
 * The comic's way with a figure against a light: a crescent of light along it, the rest ink.
 */
function edgeLit(l: Px, lx: number, ly: number, reach: number, tones: Tones, near = 1): void {
  const W = l.w;
  const H = l.h;
  const out: [number, number, string][] = [];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (!l.has(x, y)) continue;
      // march from here toward the lamp: how far until we leave the figure?
      let dx = lx - x;
      let dy = ly - y;
      const d = Math.hypot(dx, dy) || 1;
      dx /= d;
      dy /= d;
      let depth = reach + 1;
      for (let s = 1; s <= reach; s++) {
        if (!l.has(Math.round(x + dx * s), Math.round(y + dy * s))) {
          depth = s;
          break;
        }
      }
      if (depth > reach) continue;
      const v = (1 - (depth - 1) / reach) * near * Math.min(1, 1.6 - d / (W * 1.4));
      const kk = Math.min(tones.length - 1, Math.max(0, Math.round(v * (tones.length - 1))));
      if (kk > 0) out.push([x, y, tones[kk]]);
    }
  }
  for (const [x, y, c] of out) l.set(x, y, c);
}




/**
 * The armourer on the wagon's bench, driving (art/cast.ts): sitting forward, his boots on the footboard, his forearms on his
 * knees and the reins in his fists, his head up to the road ahead. Seen from the side of the road: he faces +x, up z, a
 * tenth of a metre to a unit; the footboard at z 0, the bench at z 4.6.
 */
function armourerDriving(breath: number, sway: number, t = 0): Figure {
  const f = new Figure();
  const wood = f.stuff({ tones: [INK, WOOD[1], WOOD[2], WOOD[3], WOOD[4], '#a07a4c'], hatch: 4 });
  const hide = f.stuff({ tones: LEATHER_K });
  const iron = f.stuff({ tones: IRON_K });
  Cast.place(f, [0, 0, 0], Math.PI / 2, () => {
    // the bench, its plank and its side; the footboard sloping down before it; the hammer on the bench beside him
    f.block(wood, [0, 0.4, 4.35], [4.6, 1.6, 0.26], 0.08);
    f.block(wood, [0, 1.9, 5.6], [4.6, 0.22, 1.5], 0.06);
    f.block(wood, [0, -3.0, 0.0], [4.6, 1.9, 0.18], 0.06, axes(0, 0.18));
    f.block(wood, [-4.4, -0.8, 2.2], [0.22, 2.6, 2.3], 0.06);
    f.rod(wood, [3.0, 0.6, 4.75], [4.1, 0.0, 4.75], 0.13, 0.13, 0);
    f.block(iron, [2.65, 0.75, 4.8], [0.32, 0.55, 0.26], 0.05, axes(0.4), 0);
    // HIM: leaning forward over his knees, the reins in his fists
    const b = Cast.armourer(f, {
      pelvis: [0, 0.2, 5.45 + breath * 0.5],
      lean: 0.42,
      nod: -0.42,
      turn: -0.12,
      hands: [[-1.0, -4.6, 8.0], [1.0, -4.5, 8.1]],
      elbows: [[-0.6, 0.4, -1], [0.6, 0.4, -1]],
      fingers: [[0.2, -1, -0.35], [-0.2, -1, -0.35]],
      palms: [[0.5, 0, -1], [-0.5, 0, -1]],
      feet: [[-1.2, -3.6, 1.3], [1.2, -3.2, 1.2]],
      knees: [[-0.3, -1, 0.6], [0.3, -1, 0.6]],
    }, ['grip', 'grip']);
    void sway;
    // the reins out of his fists down to the horse
    for (const j of [0, 1] as const) {
      const fist = b.wrists[j];
      f.rod(hide, add3(fist, [0, -0.6, 0]), [j ? -0.6 : 0.6, -19, 2.5], 0.08, 0.08, 0);
    }

  });
  return f;
}

export function paintArmourer(p: Px, t: number): void {
  const W = p.w;
  const H = p.h;
  const P = grid(W, H);
  const k = W / 192;
  const breath = Math.sin(t * 1.6) * 0.04;
  const sway = Math.sin(t * 1.3) * 0.06;
  // THE LANTERN ahead of him on its pole, at the right; the dusk beyond it
  const lamp = P(166, 40);
  const back = layerOf(p);
  back.rect(0, 0, W, H, DUSK[3]);
  bands(back, DUSK, (x, y) => 0.18 + glow(x, y, W * 1.05, H * 0.72, W * 1.05) * 0.95);
  over(p, back, null);
  const hill = layerOf(p);
  hill.poly(loop([P(96, 124), P(140, 104), P(176, 96), P(200, 90), P(200, 180), P(96, 180)], 6, [3, 4, 5]), '#120e22');
  hill.each((x, y) => (!hill.has(x, y - 1) ? ROCK_RIM : undefined));
  over(p, hill, INK);
  // THE WAGON'S CANVAS behind him, its edge toward the lamp lit
  const cov = layerOf(p);
  cov.poly(loop([P(-4, 180), P(-4, -4), P(90, -4), P(112, 26), P(118, 70), P(110, 120), P(96, 180)], 8, [0, 1, 2, 6]), CANVAS[0]);
  bands(cov, CANVAS, (x, y) => 0.32 + glow(x, y, lamp[0], lamp[1], W * 0.95) * 0.7 + Math.sin(x * 0.35 + y * 0.04) * 0.05);
  over(p, cov, INK);
  // HIM, SCULPTED: seated on the bench, his face turned to the road and the lamp; a tenth of a metre to a unit, up is z,
  // he faces x, the far side of him is y
  const f = armourerDriving(breath, sway, t);
  const sc = 12.5 * k;
  f.draw(p, { look: unit([-0.3, 1, -0.06]), up: [0, 0, 1], scale: sc, ox: P(60, 0)[0], oy: P(0, 214)[1], persp: 70 }, {
    at: [8.5, -5.5, 13.5], hard: 1, fill: [-0.6, 0.4, 0.5], fillK: 0.22, rim: DUSK_RIM, rimFrom: [1, 0], cel: COMIC,
  });
  // THE LANTERN on its pole, ahead of him at the right
  over(p, limbSolid(p, path([P(150, 182), P(156, 120), P(162, 34)], 10), 5 * k, 4 * k, WOOD, [1, -0.3, 0.3], { hard: 1 }), INK);
  paintLantern(p, lamp[0], lamp[1] + 10 * k, Math.sin(t * 1.7) * 0.05, lamp[0] - 4 * k, lamp[1] - 14 * k);
}

/** A part of a figure lit as the comic lights it in the dark: dim in a fill light (`fill`, dotted), and a crescent of the light at `lamp` along its edges turned to it (`reach` pixels deep). */
function litPart(p: Px, pts: readonly Pt[], dim: Tones, lit: Tones, lamp: Pt, reach: number, fill: V3 = [-0.7, -0.6, 0.4]): Px {
  const l = layerOf(p);
  l.poly(pts, dim[0]);
  shadeSolid(l, dim, fill, { hard: 1 }, pts);
  edgeLit(l, lamp[0], lamp[1], reach, lit);
  return l;
}

/** A cut crystal at (x, y), `r` tall, turned `a`: a long double point, its facets in the friend's cyan, its heart white. */
function paintCrystal(p: Px, x: number, y: number, r: number, a: number): void {
  // (a long crystal of six faces, pointed at both ends, turning: three faces seen, each its own tone, the turn moving the
  // edges between them across it; its edges lit white)
  const c = layerOf(p);
  const w = r * 0.42;
  const top: Pt = [x + r * 0.08, y - r * 1.15];
  const bot: Pt = [x - r * 0.05, y + r * 0.95];
  const shoulder = y - r * 0.5;
  const hip = y + r * 0.35;
  const edges = [0, 1, 2, 3].map((i) => Math.sin(a + (i * Math.PI) / 3 - Math.PI / 2));
  const xs = edges.map((e) => x + e * w);
  const TONE = [CYANS[3], CYANS[2], CYANS[1], '#0e6a86'];
  for (let i = 0; i < 3; i++) {
    const l = Math.min(xs[i], xs[i + 1]);
    const rr = Math.max(xs[i], xs[i + 1]);
    if (rr - l < 0.4) continue;
    const face: Pt[] = [top, [l, shoulder + (l - x) * 0.08], [l, hip], bot, [rr, hip], [rr, shoulder + (rr - x) * 0.08]];
    c.poly(face, TONE[(i + Math.floor(((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) / (Math.PI / 3))) % 4]);
  }
  c.each((px, py) => (glow(px, py, x - w * 0.2, y - r * 0.3, r * 0.5) > 0.32 ? CYANS[0] : undefined));
  over(p, c, INK);
  for (const xe of xs) {
    if (xe < x - w * 0.95 || xe > x + w * 0.95) continue;
    stroke(p, [[xe, shoulder + (xe - x) * 0.08 + 1], [xe, hip - 1]], 1, '#e6ffff');
  }
  shine(p, x, y, r * 3.2, CYANS[2], 0, 0.3);
}

// =============================================================================================
// PAGE 2, BOX 2: THE MYSTIC in the wagon, lit from below by the crystal turning over her open palm: her great pale turban
// and its stone, the veil under her eyes, her purple robe, chains of gold at her throat; the wagon dark round her.

/**
 * The mystic sitting cross-legged on the wagon's floor among his wares (art/cast.ts), facing -y: his right hand out before
 * him, open, palm up, under the crystal; his left raised beside it, open toward it.
 */
function mysticSitting(): { f: Figure; palm: V3 } {
  const f = new Figure();
  const b = Cast.mystic(f, {
    pelvis: [0, 0, 1.9],
    lean: 0.06,
    nod: 0.12,
    turn: -0.45,
    hands: [[-4.5, -1.3, 6.2], [1.7, -2.6, 2.9]],
    elbows: [[-1, 0.4, -1], [1, 0.4, -0.3]],
    palms: [[0.15, -0.55, 0.82], [0, 0, -1]],
    fingers: [[-0.85, -0.35, 0.25], [0.2, -1, -0.3]],
    feet: [[0.7, -2.4, 0.7], [-0.7, -2.0, 0.85]],
    knees: [[-1, -0.6, -0.4], [1, -0.6, -0.4]],
  }, ['open', 'flat'], { seated: true });
  // (the palm: the middle of the open hand)
  const F = b.handFrames[0];
  return { f, palm: add3(add3(b.wrists[0], scale3(F.z, 0.62)), scale3(F.y, -0.15)) };
}

export function paintMystic(p: Px, t: number): void {
  const W = p.w;
  const H = p.h;
  const P = grid(W, H);
  const k = W / 192;
  const bob = Math.sin(t * 1.9) * 0.08;
  // THE CRYSTAL over his open palm, before him: the light of the box
  const ms = mysticSitting();
  const C3: V3 = add3(ms.palm, [0, 0, 1.6 + bob]);
  const cam = { look: unit([0.25, 1, -0.16]), up: [0, 0, 1] as V3, scale: 10.5 * k, ox: P(106, 0)[0], oy: P(0, 176)[1], persp: 60 };
  const rr = unit(cross(cam.look, cam.up));
  const dd = unit(cross(cam.look, rr));
  const onScreen = (q: V3): Pt => seen(cam, q);
  void rr;
  void dd;
  const cr = onScreen(C3);
  const lit = (x: number, y: number, r = W * 0.75): number => glow(x, y, cr[0], cr[1], r);
  // THE WAGON'S INSIDE: its canvas over its hoops, the crystal's cold light on it; the mouth of it at the left, the dusk
  const inn = layerOf(p);
  inn.rect(0, 0, W, H, '#07060d');
  bands(inn, ['#07060d', '#0c0c18', '#121a26', '#1a2a34', '#28404a'], (x, y) => lit(x, y, W * 0.85) * 1.25 - 0.05);
  over(p, inn, null);
  // (the wagon's mouth at the back, at the left: an arch of the canvas, the dusk and the road falling away beyond it)
  const mouth = layerOf(p);
  const arch: Pt[] = loop([P(-6, 150), P(-6, 52), P(4, 30), P(18, 22), P(32, 34), P(38, 60), P(38, 150)], 6, [0, 6]);
  mouth.poly(arch, DUSK[4]);
  bands(mouth, DUSK, (x, y) => 0.3 + (y / H) * 0.6);
  mouth.each((x, y) => (y > P(0, 112 + (x / W) * 40)[1] ? (y > P(0, 120 + (x / W) * 40)[1] ? ROAD[1] : ROCK[2]) : undefined));
  over(p, mouth, INK, 0, 0, 2);
  stroke(p, loop([P(-6, 56), P(6, 32), P(20, 26), P(34, 38), P(40, 64)], 5), 2, CANVAS[2]);
  // its hoops: bent wood arching over him, one behind another down the wagon toward its mouth at the left, each further
  // one smaller and further left; the canvas over them; lit where the crystal reaches
  // (in perspective: each further hoop the nearest drawn smaller toward where the wagon's length runs away, its mouth)
  const hoopPt = (i: number, u: number): Pt => {
    const sc = [1, 0.7, 0.5, 0.36][i];
    const a = Math.PI * u;
    const x0 = 150 - Math.cos(a) * 136;
    const y0 = 186 - Math.sin(a) * 212;
    return P(30 + (x0 - 30) * sc, 74 + (y0 - 74) * sc);
  };
  for (const i of [3, 2, 1, 0]) {
    const pts: Pt[] = [];
    for (let j = 0; j <= 24; j++) pts.push(hoopPt(i, j / 24));
    const wd = 7 - i * 1.4;
    over(p, limbSolid(p, pts, wd * k, wd * k, WOOD, [0, -0.4, 0.9], { hard: 1, extra: (x, y) => lit(x, y) * 1.2 - i * 0.12 }), INK);
  }  // sacks against its side, and his wares: charms hung from the hoop on cords, glinting
  for (const [x, y, sx, sy, seed] of [[178, 162, 15, 12, 1], [158, 170, 12, 9, 2], [22, 170, 11, 9, 3]] as const) {
    // (a sack: full and sagging at the foot, narrowing to its neck, tied off, the folds running up into the tie)
    const pts: Pt[] = [P(x - sx * 0.95, y + sy * 0.7), P(x - sx * 1.05, y), P(x - sx * 0.6, y - sy * 0.75), P(x - sx * 0.18, y - sy * 1.05), P(x - sx * 0.25, y - sy * 1.45), P(x + sx * 0.05, y - sy * 1.6), P(x + sx * 0.3, y - sy * 1.42), P(x + sx * 0.22, y - sy * 1.02), P(x + sx * 0.7, y - sy * 0.65), P(x + sx * 1.05, y + sy * 0.1), P(x + sx * 0.9, y + sy * 0.8)];
    over(p, solid(p, loop(pts, 3, [4, 5, 6]), ['#0c0a0c', '#1e1814', '#36281e', '#54402c', '#7a5c3c'], [-0.3, -0.6, 0.6], { round: 0.8, hard: 1, extra: (px, py) => lit(px, py) * 1.1 - 0.15 }), INK);
    stroke(p, [P(x - sx * 0.22, y - sy * 1.05), P(x + sx * 0.22, y - sy * 1.02)], 2, '#1a120c');
    for (const fx of [-0.5, 0.1, 0.55]) stroke(p, [P(x + fx * sx * 0.3, y - sy * 0.95), P(x + fx * sx, y - sy * 0.1 + seed)], 1, '#1a120c');
  }
  for (const [u, len, kind] of [[0.3, 30, 0], [0.38, 20, 1], [0.62, 26, 2], [0.7, 16, 0]] as const) {
    const x = u * 100;
    const sw = Math.sin(t * 1.4 + x) * 1.5;
    const top = hoopPt(1, u);
    const end: Pt = [top[0] + sw * k, top[1] + len * k];
    stroke(p, [top, end], 1, '#3a3448');
    const ch = layerOf(p);
    const [ex, ey] = end;
    // (his charms: an amulet, a ring of gold round a stone; a little bundle of dried herbs, bound; a carved tag of bone)
    if (kind === 0) {
      ch.ellipse(ex, ey + 2.5 * k, 2.6 * k, 2.6 * k, '#b07a18');
      ch.ellipse(ex, ey + 2.5 * k, 1.4 * k, 1.4 * k, '#2a8a9a');
      ch.set(Math.round(ex - 0.5 * k), Math.round(ey + 2 * k), '#8ff4ff');
    } else if (kind === 1) {
      ch.poly(loop([[ex - 1.5 * k, ey], [ex + 1.5 * k, ey], [ex + 2.5 * k, ey + 6 * k], [ex - 2.5 * k, ey + 6 * k]], 2, [0, 1]), '#4a5a2a');
      ch.hline(Math.round(ex - 1.5 * k), Math.round(ey + 1.5 * k), Math.round(3 * k), '#8a6a3a');
    } else {
      ch.poly([[ex - 1.5 * k, ey], [ex + 1.5 * k, ey], [ex + 1.5 * k, ey + 5 * k], [ex, ey + 6 * k], [ex - 1.5 * k, ey + 5 * k]], '#cfc2a0');
      ch.vline(Math.round(ex), Math.round(ey + 1.5 * k), Math.round(2.5 * k), '#7a6e58');
    }
    over(p, ch, INK);
  }
  // HIM, SCULPTED: seated cross-legged, turned a little to us; a tenth of a metre to a unit, up is z, he faces -y
  const f = ms.f;
  f.draw(p, cam, { at: C3, hard: 1, fill: [0.75, -0.55, 0.35], fillK: 0.55, rim: '#e8904a', rimFrom: [-1, -0.5] });
  // THE CRYSTAL, turning over his palm, and its light
  paintCrystal(p, cr[0], cr[1], 5.5 * k, t * 1.2);
}

// =============================================================================================
// PAGE 2, BOX 3: THE STRANGER on the tailboard at the back of the wagon, lounging against its canvas, one boot up on the
// board, his hood down over his face (two points of gold all that is seen of it); a coin turning in the air over his hand.
// Behind him the road falling away down the mountain and the last of the dusk.

/** A coin in the air at (x, y), turned `a` (its face to us at 0): gold, a glint on its edge. */
function paintCoin(p: Px, x: number, y: number, r: number, a: number): void {
  // (a coin of gold seen turning: its face a narrowing oval, its milled rim, a stamp on it, a glint)
  const c = layerOf(p);
  const w = Math.max(1, Math.abs(Math.cos(a)) * r);
  c.ellipse(x, y, w + 0.6, r, '#7a5210');
  c.ellipse(x, y, Math.max(0.5, w - 0.8), r - 0.8, '#d09a20');
  c.each((px, py, col) => (col === '#d09a20' && px + 0.5 < x - w * 0.15 ? '#ffd866' : undefined));
  if (w > r * 0.5) c.set(Math.round(x), Math.round(y), '#7a5210').set(Math.round(x), Math.round(y) - 1, '#7a5210');
  over(p, c, INK);
  p.set(Math.round(x - w * 0.4), Math.round(y - r * 0.5), '#fff3b0');
}

/**
 * The stranger on the back of the wagon (art/cast.ts), the wagon sculpted round him (sculptWagon, a fifth of a metre a unit;
 * he at half its scale): sitting on the edge of its bed under the open end of its cover, his back to the dark in it, one leg
 * over the edge, the other drawn up; his near hand out over his knee, open, palm up, from the toss of a coin. Where his palm is.
 */
function strangerOnWagon(): { f: Figure; palm: V3 } {
  const f = new Figure();
  sculptWagon(f, [0, 0, 0], 0, { roll: 0.4, backOpen: true });
  // (sitting on the bed's back edge, facing out of it, -x: his own -y turned to it)
  const { r, at } = Cast.place(f, [-8.25, 0.6, 5.4], -Math.PI / 2, () => {
    // (his right leg drawn up, its boot on the boards, his right forearm laid over its knee; his left leg over the edge;
    // his left hand up by his shoulder, out to his side, open, palm up, the coin just flicked off it)
    Cast.stranger(f, {
      pelvis: [0, 2.6, 1.05],
      lean: 0.18,
      twist: -0.1,
      nod: 0.05,
      turn: 0.25,
      hands: [[-1.0, -0.3, 5.0], [4.0, 0.2, 7.2]],
      elbows: [[-1, 0, -0.3], [0.6, 0.3, -1]],
      palms: [[0, 0, -1], [0, 0, 1]],
      fingers: [[0.2, -1, -0.5], [0.4, -1, 0.3]],
      feet: [[-1.1, 0.2, 0.8], [1.1, -1.6, -3.4]],
      knees: [[0, -1, 1], [0, -1, 0.2]],
    }, ['flat', 'open'], { seatZ: 0 });
    return [4.2, -0.5, 8.0] as V3;
  }, 0.5);
  return { f, palm: at(r) };
}

export function paintStranger(p: Px, t: number): void {
  const W = p.w;
  const H = p.h;
  const P = grid(W, H);
  const k = W / 192;
  const dusk = (x: number, y: number, r = W): number => glow(x, y, W * 0.05, H * 0.62, r);
  // THE ROAD BEHIND, falling away down the mountain into the dusk
  const sky = layerOf(p);
  sky.rect(0, 0, W, H, DUSK[2]);
  bands(sky, DUSK, (x, y) => 0.1 + dusk(x, y, W * 1.05) * 1.05 + strata(x, y, 1702));
  over(p, sky, null);
  const far = layerOf(p);
  far.poly(loop([P(-4, 96), P(26, 88), P(52, 96), P(76, 84), P(120, 94), P(200, 88), P(200, 180), P(-4, 180)], 4, [0, 1, 2, 3, 4, 5, 6, 7]), FAR[0]);
  bands(far, FAR, (x, y) => 0.2 + dusk(x, y) * 1.1);
  far.each((x, y) => (!far.has(x, y - 1) ? FAR_RIM : undefined));
  over(p, far, INK);
  const rd = layerOf(p);
  rd.poly(loop([P(-10, 190), P(-10, 150), P(30, 124), P(70, 108), P(96, 102), P(200, 112), P(200, 190)], 6, [0, 6]), ROAD[1]);
  bands(rd, ROAD, (x, y) => 0.15 + dusk(x, y, W * 0.7) * 1.0 + (fbm(x / 7, y / 3, 1601) - 0.5) * 0.3);
  // (its ruts, running back down the hill)
  for (const [x0, x1] of [[0, 62], [30, 86]] as const) stroke(rd, path([P(x0 - 20, 186), P((x0 + x1) / 2 - 6, 140), P(x1, 106)], 6), 1, ROAD[0]);
  over(p, rd, INK);
  // THE WAGON'S BACK AND HIM ON IT, SCULPTED, seen from behind it and to his side
  const { f, palm } = strangerOnWagon();
  const scam = { look: unit([0.85, 0.5, -0.15]), up: [0, 0, 1] as V3, scale: 15.5 * k, ox: 0, oy: 0, persp: 46 };
  const at0 = seen(scam, [-8.25, 0, 7.2]);
  scam.ox = P(76, 0)[0] - at0[0];
  scam.oy = P(0, 104)[1] - at0[1];
  // (the wagon's shadow on the road under it)
  const sh = layerOf(p);
  const g0 = seen(scam, [-8.6, -3.8, 0]);
  const g1 = seen(scam, [8.6, -3.8, 0]);
  const g2 = seen(scam, [8.6, 3.8, 0]);
  const g3 = seen(scam, [-8.6, 3.8, 0]);
  sh.poly([g0, g1, g2, g3], '#07060d');
  over(p, sh, null);
  f.draw(p, scam, { from: unit([-0.85, 0.55, 0.35]), hard: 1, fill: [-0.3, -1, 0.4], fillK: 0.3, rim: '#ffb070', rimFrom: [-1, -0.2] });
  // (far in the wagon's dark, the cold light of the mystic's crystal on the canvas)
  const deep = seen(scam, [2, 0, 8.5]);
  p.each((x, y, c) => (c === '#120e0c' ? (glow(x, y, deep[0], deep[1], 46 * k) > 0.3 ? '#16303a' : glow(x, y, deep[0], deep[1], 70 * k) > 0.3 ? '#14202a' : undefined) : undefined));
  // THE COIN, turning in the air over his hand, the arc of its toss
  const toss = (t * 0.9 + 0.3) % 1;
  const pm = seen(scam, palm);
  const hx = pm[0];
  const base = pm[1] - 2 * k;
  const top = base - 14 * k;
  // (the arc it goes up and comes down on: a faint trail of its glint behind it)
  for (let j = 1; j < 5; j++) {
    const u = toss - j * 0.05;
    if (u < 0) break;
    p.set(Math.round(hx + (u - 0.5) * 6 * k), Math.round(base - Math.sin(u * Math.PI) * (base - top)), j < 3 ? '#7a5210' : '#3a2a08');
  }
  paintCoin(p, hx + (toss - 0.5) * 6 * k, base - Math.sin(toss * Math.PI) * (base - top), 4 * k, t * 9);
  // (its caption runs across the foot of the page: PAGE_CAPTIONS)
}

// =============================================================================================
// PAGE 2, BOX 4: YOUR HERO AND YOUR WORDSMITH, walking beside the wagon up the road: the wordsmith (art/smith3.ts: a teal
// cowl open over his face, his long white beard and heavy brows, his night-blue robe and teal mantle, runes burning on him)
// with a rune alight in his open palm, the light of the box; the hero beside him (the knight: his pointed helm with its
// nasal bar over a coif of mail, the red tabard and its chevron, the dark red scarf, the great sword over his shoulder).
// THE HERO IS THE ONE CHOSEN: the knight, the ranger or the mage (`OPENING_HERO`).

/** How the opening's sculpted figures are inked (art/sdf.ts `cel`): the shadow solid ink, one flat middle tone, the lit tone, its brightest. */
// (the owner, of the first polish, 17:0x on 24 Oct: "Everything looks completely flat": the flat inking is put away; the
// figures are shaded round again, every tone of them)
const COMIC: { black: number; light: number; hi?: number } | undefined = undefined;

/** Which hero walks in the opening: the class chosen for the new game. */
export const OPENING_HERO: { cls: 'warrior' | 'ranger' | 'mage' } = { cls: 'warrior' };

/** The town's wordsmith sculpted standing (up z, he faces -y), as on page 2: his palm up with a rune over it, or his hand up on the bar. */
function wordsmithFigure(pose: 'palm' | 'bar', into?: Figure, o: V3 = [0, 0, 0], yaw = 0): Figure {
  const f = into ?? new Figure();
  const c = Math.cos(yaw);
  const sn = Math.sin(yaw);
  const a = (q: V3): V3 => [o[0] + q[0] * c - q[1] * sn, o[1] + q[0] * sn + q[1] * c, o[2] + q[2]];
  const back = (q: V3): V3 => [(q[0] - o[0]) * c + (q[1] - o[1]) * sn, -(q[0] - o[0]) * sn + (q[1] - o[1]) * c, q[2] - o[2]];
  const ax = (tilt = 0, roll = 0) => axes(yaw, tilt, roll);
  const rot = (v: V3): V3 => [v[0] * c - v[1] * sn, v[0] * sn + v[1] * c, v[2]];
  const robe = f.stuff({ tones: [INK, '#0e0c26', '#1a1642', '#2c2870', '#4844a2', '#7672d0'], hatch: 4, crease: 0.7 });
  const mantle = f.stuff({ tones: [INK, '#08283a', '#0c3a4e', '#16707e', '#2aa4a6', '#46c2bc'], crease: 0.7, paint: (q) => (runeOn(back(q)) ? CYANS[0] : null) });
  const skinW = f.stuff({ tones: [INK, '#2a1c3a', '#5a4258', '#94707e', '#d0aab0', '#f0e2e8'], hatch: 4, crease: 0.45 });
  const hair = f.stuff({ tones: [INK, '#4a4660', '#8a86a0', '#c4c0d4', '#ece8f4', '#ffffff'], meld: true, crease: 0.35 });
  const brow = f.stuff({ tones: [INK, '#2a2448', '#4a4470', '#7a74a0', '#a8a2c8', '#c8c2e0'], meld: true, crease: 0.4 });
  /** The runes burning down the two bands of his mantle that hang before him: a few glyphs on each, in his own measures. */
  function runeOn(q: V3): boolean {
    if (q[1] > -0.7 || q[2] > 7.5 || q[2] < 5.3) return false;
    const side = q[0] < 0 ? -1 : 1;
    const u = Math.round((q[0] - side * 0.62) / 0.1);
    const v = Math.round((q[2] - 5.3) / 0.1);
    const glyph = Math.floor(v / 6);
    const row = v % 6;
    if (Math.abs(u) > 1 || row > 3) return false;
    const runes = ['.#.##.#.#.#.', '#.#.#..#.##.', '##..#.#.##..', '.#.#.###..#.', '#..##..#..##', '.##.#.##..#.'];
    return runes[(glyph + (side > 0 ? 3 : 0)) % 6][row * 3 + u + 1] === '#';
  }
  f.egg(robe, a([0, 0.05, 6.2]), [1.25, 0.85, 1.8], ax(), 0.8);
  f.rod(robe, a([0, 0.05, 5.0]), a([0, 0.15, 1.5]), 1.2, 1.5, 0.8);
  f.egg(robe, a([0, -0.05, 7.2]), [1.2, 0.82, 0.9], ax(), 0.8);
  f.egg(robe, a([-1.3, 0.05, 7.55]), [0.6, 0.6, 0.55], ax(), 0.6);
  f.egg(robe, a([1.3, 0.05, 7.55]), [0.6, 0.6, 0.55], ax(), 0.6);
  // his mantle over his shoulders, its two bands hanging down before him, burning with runes
  f.egg(mantle, a([0, 0.1, 7.85]), [1.68, 1.1, 0.68], ax(), 0.6);
  f.block(mantle, a([-0.62, -0.74, 5.8]), [0.3, 0.12, 1.75], 0.1, ax(), 0.4);
  f.block(mantle, a([0.62, -0.74, 5.8]), [0.3, 0.12, 1.75], 0.1, ax(), 0.4);
  // his cowl, open over his face, falling to his shoulders; its edge a fold turned back
  f.egg(mantle, a([0, 0.12, 9.2]), [0.98, 0.98, 1.08], ax(), 0.5);
  f.egg(mantle, a([0, -0.95, 8.95]), [0.72, 0.62, 0.98], ax(), 0.15, true);
  f.egg(mantle, a([0, 0.28, 8.45]), [1.1, 0.92, 0.55], ax(), 0.5);
  // his face, lean and old, well forward in the cowl: the brow, the eyes deep under it, cyan; the cheekbones; the nose
  f.egg(skinW, a([0, -0.3, 9.05]), [0.6, 0.66, 0.8], ax(), 0.4);
  f.egg(skinW, a([0, -0.82, 9.3]), [0.48, 0.18, 0.12], ax(), 0.15);
  for (const sd of [-1, 1]) {
    f.egg(skinW, a([sd * 0.36, -0.82, 8.85]), [0.18, 0.12, 0.13], ax(), 0.12);
    f.egg(skinW, a([sd * 0.25, -0.95, 9.12]), [0.14, 0.09, 0.08], ax(), 0.05, true);
    f.mark(a([sd * 0.25, -0.99, 9.1]), [CYANS[0], CYANS[1], CYANS[2]], 2);
    f.rod(brow, a([sd * 0.12, -1.0, 9.26]), a([sd * 0.56, -0.82, 9.42]), 0.08, 0.05, 0.06);
    f.line([a([sd * 0.4, -0.93, 9.0]), a([sd * 0.52, -0.84, 8.92])]);
  }
  nose(f, skinW, frameAt(a([0, -0.98, 9.16]), rot([0, -0.25, -1]), rot([0, -1, 0.2])), 0.95, 'long');
  // his moustache, sweeping down; his beard: one long white fall from his cheeks to his belt, a little parted, swaying
  for (const sd of [-1, 1]) {
    f.rod(hair, a([sd * 0.05, -1.12, 8.72]), a([sd * 0.42, -1.0, 8.42]), 0.1, 0.08, 0.12);
    f.rod(hair, a([sd * 0.42, -1.0, 8.42]), a([sd * 0.5, -0.92, 8.05]), 0.08, 0.05, 0.1);
  }
  f.egg(hair, a([0, -0.86, 8.42]), [0.6, 0.36, 0.48], ax(), 0.3);
  f.rod(hair, a([0, -0.98, 8.2]), a([0.03, -1.04, 7.2]), 0.52, 0.4, 0.35);
  f.rod(hair, a([0.03, -1.04, 7.2]), a([0.08, -1.04, 6.2]), 0.4, 0.22, 0.35);
  f.rod(hair, a([0.08, -1.04, 6.2]), a([0.12, -1.0, 5.6]), 0.22, 0.06, 0.25);
  for (const x of [-0.28, -0.08, 0.14, 0.3]) f.line([a([x, -1.3, 8.15]), a([x * 0.85, -1.38, 7.4]), a([x * 0.6 + 0.04, -1.3, 6.6]), a([x * 0.3 + 0.08, -1.18, 6.0])], '#6a6680', 1);
  if (pose === 'palm') {
    // his arm out toward the young one beside him, the palm up, a rune alight over it
    f.rod(robe, a([1.35, 0, 7.6]), a([1.6, -1.05, 7.0]), 0.4, 0.36, 0.5);
    f.rod(robe, a([1.6, -1.05, 7.0]), a([1.3, -1.9, 7.75]), 0.36, 0.46, 0.4);
    forearm(f, skinW, a([1.35, -1.8, 7.72]), a([1.2, -2.15, 7.95]), 0.18, rot([0, 0, 1]));
    hand(f, skinW, frameAt(a([1.2, -2.15, 7.95]), rot([0.1, -1, 0.1]), rot([0, 0, -1])), 0.55, 'open');
  } else {
    // his arm up, his hand on the bar over him
    f.rod(robe, a([1.35, 0, 7.6]), a([1.9, -0.4, 9.2]), 0.4, 0.36, 0.5);
    f.rod(robe, a([1.9, -0.4, 9.2]), a([1.7, -0.6, 10.6]), 0.36, 0.42, 0.4);
    hand(f, skinW, frameAt(a([1.7, -0.62, 10.75]), rot([0, -0.1, 1]), rot([0, -1, 0])), 0.55, 'flat');
  }
  // the other arm at his side
  f.rod(robe, a([-1.35, 0, 7.5]), a([-1.55, -0.2, 5.6]), 0.4, 0.4, 0.5);
  return f;
}

export function paintCompany(p: Px, t: number): void {
  const W = p.w;
  const H = p.h;
  const P = grid(W, H);
  const k = W / 192;
  const flick = 0.85 + 0.15 * Math.sin(t * 5.3);
  // (their walk: each rising and falling with his step, out of step with each other)
  const bobA = Math.abs(Math.sin(t * 2.4)) * 0.08;
  const bobB = Math.abs(Math.sin(t * 2.4 + 1.3)) * 0.1;
  const flap = Math.sin(t * 3.1) * 0.25;
  // THE CAMERA: low, before them on the road, looking a little up at them; a tenth of a metre to a unit, up is z
  const cam = { look: unit([0.04, 1, 0.06]), up: [0, 0, 1] as V3, scale: 8.6 * k, ox: P(44, 0)[0], oy: P(0, 212)[1], persp: 50 };
  // THE TWO OF THEM (art/cast.ts), walking up the road toward us: the wordsmith turned to the knight beside him, his left
  // palm up with a rune over it; the knight, his sword up on his shoulder, glancing to the light
  const f = new Figure();
  const ph = t * 2.4;
  const A = Cast.place(f, [0, 0, 0], 0.32, () => Cast.townWordsmith(f, {
    pelvis: [0, 0, 9.15 + bobA],
    lean: 0.05,
    turn: 0.35,
    nod: -0.05,
    hands: [[-2.1, -0.2 + Math.sin(ph) * 0.6, 8.6], [3.4, -1.7, 11.4]],
    palms: [[0, 1, 0], [0, 0, 1]],
    fingers: [[0, 0, -1], [0.1, -1, 0.15]],
    elbows: [[-1, 0.3, -0.5], [1, 0.4, -1]],
    feet: [[-0.85, -1.2 - Math.sin(ph) * 0.8, 0.75], [0.85, 1.0 + Math.sin(ph) * 0.8, 0.95]],
  }, { palm: true }));
  Cast.place(f, [8.0, -1.2, 0], -0.8, () => Cast.knight(f, {
    pelvis: [0, 0, 9.4 + bobB],
    lean: 0.06,
    turn: -0.15,
    nod: 0.05,
    hands: [[-2.3, 0.4 + Math.sin(ph + 1.3) * 0.6, 8.9], [1.45, -1.4, 11.9]],
    elbows: [[-1, 0.3, -0.5], [1, 0, -1]],
    fingers: [[0, 0, -1], [-0.2, -0.6, 0.75]],
    palms: [[1, 0, 0], [-1, 0, 0]],
    feet: [[-0.9, 1.1 + Math.sin(ph + 1.3) * 0.8, 1.0], [0.9, -1.2 - Math.sin(ph + 1.3) * 0.8, 0.75]],
  }, { hand: 1, tip: [2.4, 5.0, 20.6] }, flap));
  const R3 = A.at([3.75, -2.0, 12.6]);
  const rr = seen(cam, R3);
  // THE DUSK behind them, the peaks under it, the slope they climb
  const sky = layerOf(p);
  sky.rect(0, 0, W, H, DUSK[2]);
  bands(sky, DUSK, (x, y) => 0.08 + glow(x, y, W * 0.15, H * 0.75, W * 1.1) * 1.0 + strata(x, y, 1703));
  over(p, sky, null);
  const far = layerOf(p);
  far.poly(loop([P(-4, 92), P(18, 76), P(34, 86), P(62, 58), P(80, 62), P(97, 34), P(104, 36), P(122, 62), P(146, 48), P(172, 72), P(200, 64), P(200, 180), P(-4, 180)], 6, [0, 5, 6, 11, 12]), '#1a1430');
  facets(far, ['#16112a', '#1e1836', '#282042', '#342a50', '#46385e'], [-0.8, -0.3, 0.4], { cw: 16, ch: 22, seed: 1705, tilt: [0.2, -0.3], spread: 1.0, cracks: false, extra: (x, y) => glow(x, y, W * 0.1, H * 0.7, W * 0.9) * 0.7 - (y / H) * 0.3 });
  far.each((x, y) => (!far.has(x, y - 1) && glow(x, y, W * 0.1, H * 0.7, W * 1.1) > 0.08 ? FAR_RIM : undefined));
  over(p, far, INK);
  // (the prison on the peak between their heads, where they are going; on the road below it, a point of cyan: the old
  // wordsmith's staff, far ahead of them)
  paintFarKeep(p, P(94, 48)[0], P(94, 48)[1], 0.6 * k);
  const ahead = P(84, 56);
  p.set(Math.round(ahead[0]), Math.round(ahead[1]), CYANS[0]).set(Math.round(ahead[0]) + 1, Math.round(ahead[1]), CYANS[2]).set(Math.round(ahead[0]), Math.round(ahead[1]) - 1, CYANS[1]);
  const hill = layerOf(p);
  hill.poly(loop([P(-4, 128), P(60, 118), P(130, 110), P(200, 98), P(200, 180), P(-4, 180)], 6, [3, 4, 5]), '#0e0b1a');
  bands(hill, ['#08060f', '#0e0b1a', '#171228', '#241a36'], (x, y) => 0.35 + glow(x, y, rr[0], rr[1], W * 0.55) * 0.9 + (fbm(x / 14, y / 5, 33) - 0.5) * 0.4);
  hill.each((x, y) => (!hill.has(x, y - 1) ? '#5a3c42' : undefined));
  over(p, hill, null);
  f.draw(p, cam, { cel: COMIC, at: R3, hard: 1, fill: [0.1, -1, 0.15], fillK: 0.3, rim: '#f0a070', rimFrom: [-1, -0.3] });
  shine(p, rr[0], rr[1] - 1, 30 * k * flick, CYANS[2], 0, 0.26);
  // THE RUNE in his palm: a glyph of light, and its glow on the dusk
  for (let j = 0; j < 8; j++) {
    const an = (j / 8) * Math.PI * 2 + 0.2;
    const r0 = (j % 2 ? 7 : 6) * k;
    const r1 = r0 + (j % 2 ? 2 : 4) * k * flick;
    for (let r = r0; r <= r1; r += 0.7) p.set(Math.round(rr[0] + Math.cos(an) * r), Math.round(rr[1] - 1 + Math.sin(an) * r), r > r1 - 1.2 ? CYANS[2] : CYANS[1]);
  }
  // (a rune of the wordsmiths' own: a stave with two branches up from it and a hook at its foot, its strokes two pixels
  // thick, white-hot in the middle, its light round it)
  const glyph = ['...##.....', '...##..##.', '...##.##..', '...####...', '...###....', '..####....', '.##.##....', '...##.....', '...##.....', '...###....', '....###...'];
  const gx = Math.round(rr[0] - 5);
  const gy = Math.round(rr[1] - 8);
  for (let r = 0; r < glyph.length; r++) {
    for (let c = 0; c < glyph[r].length; c++) {
      if (glyph[r][c] !== '#') continue;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (glyph[r + dy]?.[c + dx] !== '#') p.set(gx + c + dx, gy + r + dy, CYANS[2]);
    }
  }
  for (let r = 0; r < glyph.length; r++) for (let c = 0; c < glyph[r].length; c++) if (glyph[r][c] === '#') p.set(gx + c, gy + r, (r + c) % 3 ? CYANS[0] : CYANS[1]);
  // (its caption runs across the foot of the page: PAGE_CAPTIONS)
}

/**
 * The prison far off on its peak (its foot's middle at x, y; `k` its size, 46 pixels across at 1): the one prison of the
 * opening (sculptPrison), drawn small, against the dusk, its tops and the faces toward the last light lit.
 */
function paintFarKeep(p: Px, x: number, y: number, k: number, look: V3 = [0.1, 1, 0.04]): void {
  const f = new Figure();
  sculptPrison(f, [0, 0, 0], 0.12);
  f.draw(p, { look: unit(look), up: [0, 0, 1], scale: (46 * k) / 74, ox: x, oy: y, persp: 260 }, { from: unit([0.35, 0.8, 0.6]), hard: 1, fill: [-0.2, -1, 0.3], fillK: 0.4, rim: '#8a6a7a', rimFrom: [0.3, -1] });
}

// =============================================================================================
// PAGE 3, BOX 1: THE OLD WORDSMITH at a bend of the road, high on the mountain, night coming on: he points his staff up at
// the prison on its crag, its head burning cyan, the runes along his mantle burning with it. "Up there. The altar sleeps in
// the old prison." His look: as far ahead on page 1 (the wordsmiths' teal hood and mantle, the fallen wordsmith's brown robe,
// art/body.ts, his book at his hip); his face lean and old, a grey beard to a point, his eyes the friend's cyan.

/** The old wordsmith's stuffs, for a figure (his robe, his teal, his skin, his grey hair, his staff's wood, his book). */
function oldSmithStuffs(f: Figure, runes: (q: V3) => boolean) {
  return {
    robe: f.stuff({ tones: [INK, '#2e1e14', '#4a3220', '#6a4a2e', '#90683e', '#bc9060'], hatch: 4, crease: 0.8 }),
    brow: f.stuff({ tones: [INK, '#2a2638', '#4a4658', '#6e6a80', '#9a96aa', '#bcb8cc'], meld: true, crease: 0.4 }),
    teal: f.stuff({ tones: [INK, '#0e2a30', '#1a4448', '#2a6a6c', '#3e9290', '#5ab8b0'], crease: 0.8, paint: (q) => (runes(q) ? CYANS[0] : null) }),
    skin: f.stuff({ tones: [INK, '#2a1e3a', '#5a4258', '#94707e', '#d0aab0', '#f0e6f0'], hatch: 4, crease: 0.45 }),
    hair: f.stuff({ tones: [INK, '#3a3448', '#6a6478', '#a8a2b4', '#dcd8e6', '#ffffff'], meld: true, crease: 0.5 }),
    wood: f.stuff({ tones: [INK, '#2a1a10', '#4a2e1a', '#6e4a2a', '#9a6e40', '#c49a64'] }),
    leath: f.stuff({ tones: [INK, '#1a0e0a', '#3a2216', '#5e3a22', '#8a5a34'] }),
    book: f.stuff({ tones: [INK, '#0a2024', '#123638', '#1e5454', '#2e7a76'], paint: (_q, _n, v) => (v > 0.9 ? '#e8d8a8' : null) }),
  };
}

/** Turn `q` about the line through `o` along x, by `a` (the head tipped back to look up). */
function tipX(q: V3, o: V3, a: number): V3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  const y = q[1] - o[1];
  const z = q[2] - o[2];
  return [q[0], o[1] + y * c - z * s, o[2] + y * s + z * c];
}

/** The old wordsmith's staff's head burning at (x, y): a knot of the friend's cyan fire, and its rays turning. */
function paintStaffFire(p: Px, hx: number, hy: number, k: number, t: number, flick: number): void {
  for (let j = 0; j < 10; j++) {
    const an = (j / 10) * Math.PI * 2 + t * 0.6;
    const r0 = 5 * k;
    const r1 = r0 + (j % 2 ? 4 : 9) * k * flick;
    for (let r = r0; r <= r1; r += 0.6) p.set(Math.round(hx + Math.cos(an) * r), Math.round(hy + Math.sin(an) * r), r > r1 - 2 ? CYANS[2] : CYANS[1]);
  }
  const fire = layerOf(p);
  fire.poly(loop([[hx - 4.5 * k, hy + 2 * k], [hx - 3.5 * k, hy - 3 * k], [hx - 1 * k + Math.sin(t * 7) * k, hy - 6.5 * k], [hx + 1.5 * k, hy - 3.5 * k], [hx + 4.5 * k, hy - 1 * k], [hx + 3 * k, hy + 3.5 * k], [hx, hy + 4.5 * k]], 4, [2]), CYANS[1]);
  fire.each((x, y) => (glow(x, y, hx, hy, 5 * k) > 0.25 ? CYANS[0] : undefined));
  over(p, fire, null);
  shine(p, hx, hy, 26 * k * flick, CYANS[2], 0, 0.3);
}

/** The old wordsmith sculpted standing (up z), turned `yaw` from facing -y, his far arm up with his staff pointing along `dir`; his staff's burning head. */
/**
 * THE OLD WORDSMITH (art/cast.ts), standing, turned `yaw` (from facing -y), his staff held up in both hands toward `dir` (a
 * line in the scene's own frame), its head burning; his head tipped back to look the way it points. `mirror`: the staff's
 * higher hand his right, not his left. `gust`: the wind in his robe.
 */
function oldSmithFigure(yaw: number, gust: number, dir: V3, mirror = false, raise = 15.4): { f: Figure; head: V3; mouth: V3; eyes: [V3, V3]; hc: V3 } {
  const f = new Figure();
  const c = Math.cos(yaw);
  const sn = Math.sin(yaw);
  // (the staff's line in his own frame, before he is turned)
  const d: V3 = unit([dir[0] * c + dir[1] * sn, -dir[0] * sn + dir[1] * c, dir[2]]);
  const sx = mirror ? -1 : 1;
  const high: V3 = [sx * 1.2 + d[0] * 2.2, -2.2 + d[1] * 2.2, raise];
  const low: V3 = [high[0] - d[0] * 4.6, high[1] - d[1] * 4.6, high[2] - d[2] * 4.6];
  const shoulder = (s: number): V3 => [s * 1.85, 0, 14.3];
  const wrist = (g: V3, s: number): V3 => {
    const u = unit(sub3(g, shoulder(s)));
    return sub3(g, scale3(u, 0.62));
  };
  const hands: [V3, V3] = mirror ? [wrist(high, -1), wrist(low, 1)] : [wrist(low, -1), wrist(high, 1)];
  const look = Math.atan2(-d[0], -d[1]);
  const { r, at } = Cast.place(f, [0, 0, 0], yaw, () => {
    const o = Cast.oldWordsmith(f, {
      lean: 0.1,
      twist: look * 0.35,
      turn: look * 0.5,
      nod: -0.3,
      hands,
      elbows: [[-0.35, 0.15, -1], [0.35, 0.15, -1]],
      feet: [[-0.9, -0.5, 0.75], [0.9, 0.6, 0.75]],
    }, { reach: 5.6 }, gust);
    return { head: o.head, mouth: onHeadOf(o.b, 0, 1.0, -0.62), eyes: [onHeadOf(o.b, -0.31, 0.9, 0.04), onHeadOf(o.b, 0.31, 0.9, 0.04)] as [V3, V3], hc: o.b.head };
  });
  return { f, head: at(r.head), mouth: at(r.mouth), eyes: [at(r.eyes[0]), at(r.eyes[1])], hc: at(r.hc) };
}

/** A point by a body's head (as art/anatomy.ts `onHead`). */
function onHeadOf(b: { head: V3; hacross: V3; hfwd: V3; hup: V3; k: number }, a: number, fw: number, c: number): V3 {
  return add3(add3(add3(b.head, scale3(b.hacross, a * b.k)), scale3(b.hfwd, fw * b.k)), scale3(b.hup, c * b.k));
}

export function paintOldSmith(p: Px, t: number): void {
  const W = p.w;
  const H = p.h;
  const k = W / 231;
  const S = (x: number, y: number): Pt => [x * k, y * (H / 360)];
  const flick = 0.85 + 0.15 * Math.sin(t * 6.1);
  const gust = Math.sin(t * 1.3) * 0.15;
  // THE CAMERA: low on the road, looking up at him
  const cam = { look: unit([0.32, 1, 0.1]), up: [0, 0, 1] as V3, scale: 23 * k, ox: S(84, 0)[0], oy: S(0, 570)[1], persp: 60 };
  const onScreen = (q: V3): Pt => {
    return seen(cam, q);
  };
  // HIM, SCULPTED (oldSmithFigure): turned to the prison, his staff up at it
  const { f, head: head3, mouth: mouth3 } = oldSmithFigure(0.95, gust, unit([0.5, 0.3, 0.82]), false, 18.6);
  const hs = onScreen(head3);
  const lamp = (x: number, y: number, r = W * 0.9): number => glow(x, y, hs[0], hs[1], r);
  // THE NIGHT COMING ON: the dusk sunk to a band low on the right, stars over it
  const sky = layerOf(p);
  sky.rect(0, 0, W, H, DUSK[1]);
  bands(sky, DUSK, (x, y) => -0.05 + glow(x, y, W * 1.05, H * 0.55, W * 1.2) * 0.75 + lamp(x, y, W * 0.45) * 0.2 + strata(x, y, 1704));
  sky.each((x, y) => (y < H * 0.5 && hash(x, y, 811) > 0.994 ? (hash(x, y, 812) > 0.5 ? '#e8e4ff' : '#9a94c8') : undefined));
  over(p, sky, null);
  // THE PRISON on its crag, far off and high, where his staff points: small and hazed with the distance, black on the
  // last light; the far range under it
  const far = layerOf(p);
  far.poly(loop([S(-4, 250), S(60, 228), S(110, 238), S(150, 214), S(196, 222), S(236, 206), S(236, 300), S(-4, 300)], 6, [0, 6, 7]), FAR[0]);
  bands(far, FAR, (x, y) => 0.3 + glow(x, y, W * 1.05, H * 0.55, W * 0.9) * 1.2);
  far.each((x, y) => (!far.has(x, y - 1) ? FAR_RIM : undefined));
  over(p, far, null);
  const aim = seen(cam, add3(head3, scale3(unit([0.55, 0.3, 0.78]), 60)));
  const kx = Math.min(W - 30 * k, Math.max(W * 0.66, aim[0]));
  const ky = Math.max(H * 0.17, Math.min(H * 0.3, aim[1]));
  // (the mountain far off: its shoulders, the crag standing up out of them, sheer, flat topped; all of it hazed)
  const crag = layerOf(p);
  crag.poly(loop([[S(96, 0)[0], S(0, 250)[1]], [kx - 62 * k, ky + 92 * k], [kx - 40 * k, ky + 70 * k], [kx - 26 * k, ky + 52 * k], [kx - 22 * k, ky + 20 * k], [kx - 17 * k, ky + 3 * k], [kx + 17 * k, ky + 2 * k], [kx + 21 * k, ky + 16 * k], [kx + 24 * k, ky + 46 * k], [kx + 40 * k, ky + 64 * k], [W + 4, ky + 74 * k], [W + 4, S(0, 250)[1]]], 3, [0, 4, 5, 6, 7, 10, 11]), FAR[1]);
  facets(crag, ['#221a3e', '#2a2048', '#342854', '#43345e', '#5a4670'], [0.8, -0.5, 0.3], { cw: 7, ch: 16, seed: 731, tilt: [0.3, 0], spread: 1.2, cracks: false, extra: (x, y) => glow(x, y, W * 1.05, H * 0.5, W * 0.8) * 0.8 - 0.05 });
  crag.each((x, y) => (!crag.has(x, y - 1) && glow(x, y, W * 1.05, H * 0.5, W) > 0.05 ? FAR_RIM : undefined));
  over(p, crag, '#1a1430');
  paintFarKeep(p, kx, ky + 3 * k, 0.72 * k);
  const mist = layerOf(p);
  mist.rect(0, Math.round(S(0, 262)[1]), W, Math.round(H * 0.2), '#3a2e58');
  mist.each((x, y) => (Math.sin(x * 0.05 + y * 0.3) + (fbm(x / 20, y / 6, 821) - 0.5) * 2 > 0.4 ? '#4a3a68' : undefined));
  over(p, mist, null);
  // THE ROCK WALL behind him, on the left, up out of the top
  const wall = layerOf(p);
  wall.poly(loop([S(-4, -4), S(70, -4), S(84, 60), S(70, 130), S(96, 210), S(110, 300), S(-4, 300)], 6, [0, 1, 6]), ROCK[0]);
  facets(wall, ROCK, [0.4, -0.6, 0.5], { cw: 18, ch: 12, seed: 733, tilt: [0.2, -0.4], spread: 0.9, extra: (x, y) => lamp(x, y, W * 0.7) * 1.2 - 0.25 });
  over(p, wall, INK);
  // THE ROAD at the bend, its edge stones on the drop
  const rd = layerOf(p);
  rd.poly(loop([S(-4, 296), S(80, 288), S(160, 290), S(236, 300), S(236, 364), S(-4, 364)], 6, [0, 3, 4, 5]), ROAD[0]);
  bands(rd, ROAD, (x, y) => 0.25 + lamp(x, y, W * 0.8) * 0.9 + (fbm(x / 7, y / 3, 841) - 0.5) * 0.35);
  over(p, rd, INK);
  // (the edge stones along the road's drop behind him, sculpted: rough blocks set in a row, leaning, lit by his staff)
  {
    const sf = new Figure();
    const rk = sf.stuff({ tones: [INK, '#16122a', '#221b38', '#33284c', '#4a3a60', '#6a5272'], crease: 0.8 });
    let x = 0;
    for (let i = 0; i < 7; i++) {
      const w = 2.4 + hash(i, 1, 853) * 4.2;
      const h = 1.8 + hash(i, 2, 853) * 3.8;
      const ax = axes((hash(i, 4, 853) - 0.5) * 0.9, (hash(i, 5, 853) - 0.5) * 0.5, (hash(i, 6, 853) - 0.5) * 0.7);
      sf.block(rk, [x + w / 2, hash(i, 3, 853) * 1.5, h / 2 - 0.6], [w / 2, 1.8, h / 2], 0.45, ax, 0.2);
      // (a corner knocked off it)
      sf.block(rk, [x + w * (hash(i, 8, 853) > 0.5 ? 0.95 : 0.05), 0, h - 0.4], [1.2, 2.6, 1.2], 0, axes(0.6, 0.4, 0.8), 0.15, true);
      x += w + 0.3 + hash(i, 7, 853) * 1.6;
    }
    // (seen from where the picture's road is seen: along the road's far edge, behind him)
    sf.draw(p, { look: unit([0.25, 1, -0.12]), up: [0, 0, 1], scale: 3.4 * k, ox: S(126, 0)[0], oy: S(0, 304)[1] }, { from: unit([-0.7, -0.5, 0.6]), hard: 1, fill: [0.3, -1, 0.3], fillK: 0.35, rim: '#e8904a', rimFrom: [1, 0] });
  }
  f.draw(p, cam, { at: head3, hard: 1, fill: [-0.3, -1, 0.4], fillK: 0.5, rim: '#e8904a', rimFrom: [1, 0] });
  // THE STAFF'S HEAD, burning
  paintStaffFire(p, hs[0], hs[1], k, t, flick);
  // HIS WORDS
  const mouth = onScreen(mouth3);
  balloon(p, 'Up there. The altar sleeps in the old prison.', Math.round(6 * k), Math.round(8 * k), 62, [mouth[0] - 22 * k, mouth[1] - 16 * k]);
}

// =============================================================================================
// PAGE 3, BOX 2: HIS EYES, close, under the rim of his hood: looking up at the prison, the cyan of them burning, the staff's
// light on his brow from above.

export function paintEyes(p: Px, t: number): void {
  const W = p.w;
  const H = p.h;
  const k = W / 153;
  const flick = 0.9 + 0.1 * Math.sin(t * 6.1);
  // HIM, SCULPTED, as in the box before (oldSmithFigure, the same pose): seen close, from before his face and a little
  // under it, his eyes turned up to the prison; lit from above by his staff
  const fig = oldSmithFigure(0.95, Math.sin(t * 1.3) * 0.15, unit([0.5, 0.3, 0.82]), false, 18.6);
  const mid = lerp3(fig.eyes[0], fig.eyes[1], 0.5);
  const F = unit3(sub3(mid, fig.hc));
  const from = add3(add3(mid, scale3(F, 30)), [-3, 0, -2.5]);
  const cam = { look: unit3(sub3(mid, from)), up: [0, 0, 1] as V3, scale: 60 * k, ox: 0, oy: 0 };
  const m0 = seen(cam, mid);
  cam.ox = W * 0.5 - m0[0];
  cam.oy = H * 0.47 - m0[1];
  // the night behind him, the stars coming out
  const sky = layerOf(p);
  sky.rect(0, 0, W, H, DUSK[1]);
  bands(sky, DUSK.slice(0, 5), (x, y) => 0.1 + (1 - y / H) * 0.15 + glow(x, y, W * 1.1, H * 0.2, W) * 0.5);
  sky.each((x, y) => (hash(x, y, 961) > 0.993 ? '#c8c4f0' : undefined));
  over(p, sky, null);
  fig.f.draw(p, cam, { at: fig.head, hard: 1, fill: [-0.5, -0.8, -0.1], fillK: 0.45, rim: CYANS[2], rimFrom: [1, -0.8] });
  // HIS EYES, burning the friend's cyan
  for (const e3 of fig.eyes) {
    const [ex, ey] = seen(cam, e3);
    shine(p, ex, ey, 22 * k * flick, CYANS[2], 2, 0.42);
    const r = 3.0 * k;
    for (let y = Math.floor(ey - r); y <= ey + r; y++) for (let x = Math.floor(ex - r * 1.4); x <= ex + r * 1.4; x++) {
      const d = Math.hypot((x + 0.5 - ex) / 1.4, y + 0.5 - ey) / r;
      if (d < 1) p.set(x, y, d < 0.45 ? '#e6ffff' : d < 0.8 ? CYANS[0] : CYANS[1]);
    }
  }
}

// =============================================================================================
// PAGE 3, BOX 3: ABOVE THE ROAD. The rocks over them, black on the night; in their dark, a glint of the enemy's pink, and the
// shape of a hood against the stars, if you look.

export function paintGlint(p: Px, t: number): void {
  const W = p.w;
  const H = p.h;
  const k = W / 153;
  const blink = 0.5 + 0.5 * Math.sin(t * 3.7);
  const sky = layerOf(p);
  sky.rect(0, 0, W, H, DUSK[0]);
  bands(sky, DUSK, (x, y) => -0.1 + (1 - y / H) * 0.0 + glow(x, y, W * 1.1, H * 0.2, W * 1.0) * 0.5 + strata(x, y, 1705));
  sky.each((x, y) => (hash(x, y, 911) > 0.993 ? (hash(x, y, 912) > 0.5 ? '#e8e4ff' : '#8a84b8') : undefined));
  over(p, sky, null);
  // THE ROCKS: a great shelf of them leaning out over the road from the left, boulders on its lip
  const r = layerOf(p);
  r.poly(loop([[-4, H * 0.3], [W * 0.3, H * 0.42], [W * 0.58, H * 0.4], [W * 0.78, H * 0.5], [W * 0.9, H * 0.66], [W + 4, H * 0.7], [W + 4, H + 4], [-4, H + 4]], 6, [0, 5, 6, 7]), ROCK[0]);
  facets(r, ROCK, [0.6, -0.5, 0.4], { cw: 16, ch: 10, seed: 931, tilt: [0.3, -0.5], spread: 0.9, extra: (x, y) => glow(x, y, W * 1.1, H * 0.2, W * 0.9) * 0.7 - 0.15 });
  r.each((x, y) => (!r.has(x, y - 1) ? ROCK_RIM : undefined));
  over(p, r, INK);
  // A CULTIST crouched among the boulders on the lip, looking down at the road: his cowl and shoulders over the rocks, his
  // eyes two slashes of pink in its dark; his dagger up by his shoulder, a glint running along its blade (art/cast.ts)
  const f = new Figure();
  const cam = { look: unit([0.1, 1, 0.22]), up: [0, 0, 1] as V3, scale: 6.2 * k, ox: W * 0.52, oy: H * 0.78, persp: 60 };
  const r3 = Cast.place(f, [1.5, 3.5, -2.5], 0.15, () => {
    const c = Cast.cultist(f, {
      pelvis: [0, 0.6, 5.2],
      lean: 0.7,
      nod: 0.35,
      hands: [[-1.6, -2.6, 11.0], [1.8, -3.2, 7.6]],
      elbows: [[-1, 0.3, -1], [1, 0, -1]],
      palms: [[1, 0, 0], [0, 0, -1]],
      fingers: [[0, -0.2, 1], [0.2, -1, -0.4]],
      feet: [[-1.0, 1.2, 0.75], [1.0, -1.4, 0.75]],
      knees: [[0, -1, 0.4], [0, -1, 0.4]],
    }, { hand: 0, to: [-2.3, -2.4, 19] }, null, 2);
    return c.tip;
  });
  // the boulders on the lip, before him and about him, sculpted with him: rough, split, leaning on each other
  const rk = f.stuff({ tones: [INK, '#16122a', '#221b38', '#33284c', '#4a3a60', '#6a5272'], crease: 0.9 });
  for (const [x, y, w, d, h, a, tl, rl] of [
    [-9.5, -6, 13, 9, 12, 0.4, 0.2, -0.3], [6.5, -5, 8, 6, 8.5, 0.35, 0.15, 0.28], [-1, -9, 5, 4, 4, -0.5, -0.25, 0.2],
    [15, -1, 9, 7, 6, -0.7, 0.3, -0.2], [-22, 2, 8, 7, 7, 0.1, -0.1, 0.25], [24, 4, 12, 9, 11, 0.8, -0.2, 0.1],
  ] as const) {
    // (each a weathered stone: lumpy masses grown together, then a face or two split flat off it)
    f.egg(rk, [x, y, h * 0.42 - 2], [w * 0.55, d * 0.55, h * 0.62], axes(a, tl, rl), 1.2);
    f.egg(rk, [x + w * 0.25, y - 0.6, h * 0.5 - 2], [w * 0.38, d * 0.45, h * 0.45], axes(a + 0.9, -tl, rl), 1.4);
    f.egg(rk, [x - w * 0.3, y + 0.4, h * 0.3 - 2], [w * 0.36, d * 0.42, h * 0.4], axes(a - 0.7, tl, -rl), 1.4);
    // (split faces: planes cut off it at the top, the side toward us, the other side)
    for (const [ca, ct, cr, sh] of [[a + 0.4, 0.75 + tl, rl, 0.42], [a - 1.2, -0.9, 0.3, 0.45], [a + 2.0, 1.2, -0.4, 0.5]] as const) {
      const cut = axes(ca, ct, cr);
      const ext = Math.max(w, h) * 0.55;
      f.block(rk, add3([x, y, h * 0.42 - 2], scale3(cut[2], ext * sh + 2.8)), [w * 1.2, w * 1.2, 2.8], 0, cut, 0.25, true);
    }
  }
  f.draw(p, cam, { from: unit([0.8, -0.3, 0.5]), hard: 1, fill: [-0.3, -1, 0.2], fillK: 0.25, rim: '#8a6a7a', rimFrom: [1, -0.5] });
  // (the glint: down the blade of his dagger, a spark of the last light at its point)
  const tip = seen(cam, r3.at(r3.r ?? [0, 0, 0]));
  const g = Math.round((2 + blink * 4) * k);
  for (let d = -g; d <= g; d++) {
    const c = Math.abs(d) < 2 ? '#ffffff' : '#e8d8ff';
    p.set(Math.round(tip[0]) + d, Math.round(tip[1]), c);
    p.set(Math.round(tip[0]), Math.round(tip[1]) + d, c);
  }
  void r;

}

// =============================================================================================
// PAGE 4, THE WHOLE PAGE: THE AMBUSH. Night. The cult pours down the slope at them, hooded, in the cult's violet with its pink
// stoles (art/cultists.ts: deep cowls with a point, two slanting slashes of pink for eyes in the dark of them, the robes girded
// up to run in, bony forearms, the long wavy daggers of bone), torches high; the first of them leaping at us, his dagger up.
// A firebomb bursts on the last wagon's canvas. "The cult was waiting."

/** A cultist's stance: where his joints are, in his own measures (a tenth of a metre to a unit, up z, his front toward -y). */
interface CultPose {
  hip: V3;
  chest: V3;
  head: V3;
  sh: readonly [V3, V3];
  el: readonly [V3, V3];
  ha: readonly [V3, V3];
  kn: readonly [V3, V3];
  ft: readonly [V3, V3];
  /** The middle of his robe's hem. */
  hem: V3;
  /** Which hand holds the dagger (0 his right, 1 his left), and which a torch; where each points. */
  dagger?: { hand: 0 | 1; to: V3 };
  torch?: { hand: 0 | 1; to: V3 };
}

/** Three unit lines for a part lying along `z` (its length), its breadth toward `xHint`. */
/** Where a point is seen on the canvas by a sculpted figure's camera (as art/sdf.ts draws it, in perspective if it has it). */
function seen(cam: { look: V3; up: V3; scale: number; ox: number; oy: number; persp?: number }, q: V3): Pt {
  const look = unit(cam.look);
  const right = unit(cross(look, cam.up));
  const down = unit(cross(look, right));
  const D = cam.persp ?? 0;
  const f = D > 0 ? D / Math.max(0.05 * D, D + dt3(q, look)) : 1;
  return [dt3(q, right) * f * cam.scale + cam.ox, dt3(q, down) * f * cam.scale + cam.oy];
}

function frame(z0: V3, xHint: V3): readonly [V3, V3, V3] {
  const z = unit(z0);
  const x = unit(sub3(xHint, scale3(z, dt3(xHint, z))));
  return [x, cross(z, x), z];
}
function lerp3(a: V3, b: V3, u: number): V3 {
  return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
}

/** A cultist sculpted into `f` at `o`, turned `yaw`: where his torch burns (if he has one), and his eyes. */
/**
 * The measure the opening's scenes were first laid out in: a man of middle height about 10.2 units tall, where the people
 * of art/cast.ts are 17.6 (a tenth of a metre a unit). They are set down at this size in those scenes, so that their
 * cameras, their lights and what stands about them are as they were.
 */
const OLD = 0.58;

/** An old-measure pose (its joints given where they are, a man 10.2 high) as a pose of art/anatomy.ts. */
function oldPose(P: { hip: V3; chest: V3; head: V3; sh: readonly [V3, V3]; el: readonly [V3, V3]; ha: readonly [V3, V3]; kn: readonly [V3, V3]; ft: readonly [V3, V3] }): Cast.PoseOf {
  const d = (v: V3): V3 => scale3(v, 1 / OLD);
  const v = sub3(P.chest, P.hip);
  const lean = Math.atan2(-v[1], v[2]);
  const side = Math.atan2(v[0], v[2]);
  const hv = sub3(P.head, P.chest);
  const nod = Math.atan2(-hv[1], hv[2]) - lean;
  const mid = (a: V3, b: V3): V3 => scale3(add3(a, b), 0.5);
  return {
    pelvis: d(P.hip),
    lean,
    side,
    nod,
    hands: [d(P.ha[0]), d(P.ha[1])],
    elbows: [sub3(P.el[0], mid(P.sh[0], P.ha[0])), sub3(P.el[1], mid(P.sh[1], P.ha[1]))],
    feet: [add3(d(P.ft[0]), [0, 0, 0.45]), add3(d(P.ft[1]), [0, 0, 0.45])],
    knees: [sub3(P.kn[0], mid(P.hip, P.ft[0])), sub3(P.kn[1], mid(P.hip, P.ft[1]))],
  };
}

/** A cultist (art/cast.ts) in an old-measure pose, at `o` turned `yaw`: where his torch's flame is, and his eyes. */
function sculptCultist(f: Figure, o: V3, yaw: number, P: CultPose, eyeW = 1): { torch: V3 | null; eyes: V3[] } {
  const { r, at } = Cast.place(f, o, yaw, () => {
    const d = (v: V3): V3 => scale3(v, 1 / OLD);
    const c = Cast.cultist(f, oldPose(P), P.dagger ? { hand: P.dagger.hand, to: d(P.dagger.to) } : null, P.torch ? { hand: P.torch.hand, to: d(P.torch.to) } : null, eyeW);
    return { torch: c.torch, eyes: [onHeadOf(c.b, -0.28, 0.82, 0.04), onHeadOf(c.b, 0.28, 0.82, 0.04)] };
  }, OLD);
  return { torch: r.torch ? at(r.torch) : null, eyes: r.eyes.map(at) };
}

export function paintCultistTest(p: Px, t: number): void {
  p.rect(0, 0, p.w, p.h, '#2a2440');
  const f = new Figure();
  const r = sculptCultist(f, [0, 0, 0], 0.6, AMBUSH_POSES.run(0.4, t * 8 + 0.8, 1));
  const cam = { look: unit([0.1, 1, -0.05]), up: [0, 0, 1] as V3, scale: 26, ox: p.w * 0.3, oy: p.h * 0.95 };
  f.draw(p, cam, { cel: COMIC, at: [3, -4, 9], hard: 1, fill: [-0.5, -1, 0.5], fillK: 0.35, rim: '#ffb060', rimFrom: [1, 0.3] });
  void r;
  const g = new Figure();
  sculptCultist(g, [0, 0, 0], 0.9, AMBUSH_POSES.leap);
  g.draw(p, { ...cam, ox: p.w * 0.5 + 170, oy: p.h * 0.9 }, { cel: COMIC, at: [3, -4, 9], hard: 1, fill: [-0.5, -1, 0.5], fillK: 0.35, rim: '#ffb060', rimFrom: [1, 0.3] });
}

/** The ambush's stances: running down with a torch and a dagger (`lean` forward, `ph` the stride), and leaping. */
const AMBUSH_POSES = {
  run: (lean: number, ph: number, torchHand: 0 | 1): CultPose => {
    const sw = Math.sin(ph);
    return {
      hip: [0, 0, 5.2], chest: [0, -1.2 * lean, 7.6], head: [0, -1.9 * lean - 0.2, 9.4],
      sh: [[-1.15, -1.1 * lean, 8.1], [1.15, -1.1 * lean, 8.1]],
      el: torchHand === 0 ? [[-1.7, -1.3 * lean - 0.4, 9.2], [1.6, 0.5, 6.9]] : [[-1.6, -1.2 * lean - 0.6, 7.0], [1.7, -1.3 * lean - 0.2, 9.2]],
      ha: torchHand === 0 ? [[-1.5, -1.6 * lean - 0.9, 10.5], [1.5, -0.6, 5.9]] : [[-1.3, -1.6 * lean - 1.6, 6.3], [1.5, -1.6 * lean - 0.7, 10.5]],
      kn: [[-0.45, -1.3 * sw - 0.3, 2.9 + 0.5 * Math.max(0, sw)], [0.45, 1.3 * sw - 0.3, 2.9 + 0.5 * Math.max(0, -sw)]],
      ft: [[-0.45, -0.9 * sw + 0.5, 0.3 + 0.6 * Math.max(0, -sw)], [0.45, 0.9 * sw + 0.5, 0.3 + 0.6 * Math.max(0, sw)]],
      hem: [0, 0.4, 3.0],
      dagger: { hand: torchHand === 0 ? 1 : 0, to: torchHand === 0 ? [2.4, -2.4, 4.6] : [-2.6, -3.4, 6.0] },
      torch: { hand: torchHand, to: torchHand === 0 ? [-1.9, -2.2, 13] : [1.9, -2.2, 13] },
    };
  },
  leap: {
    hip: [0, 0.4, 5.6], chest: [0, -1.4, 7.4], head: [0, -2.4, 8.7],
    sh: [[-1.15, -1.3, 8.0], [1.15, -1.3, 8.0]],
    el: [[-1.6, -0.6, 9.5], [1.5, -2.6, 7.3]],
    ha: [[-1.1, -1.1, 10.8], [1.2, -3.8, 6.8]],
    kn: [[-0.5, -2.2, 5.0], [0.5, 1.7, 3.6]],
    ft: [[-0.5, -1.9, 2.6], [0.5, 3.4, 2.4]],
    hem: [0, 1.2, 4.0],
    dagger: { hand: 0, to: [-0.6, -2.8, 12.7] },
  } as CultPose,
};

const FIRE: Tones = ['#c43a1c', '#e8601c', '#ff8a2a', '#ffc040', '#fff3c0', '#ffffff'];

/**
 * A fireball bursting at (cx, cy), `r` across: rays flung out behind it; billows of fire rolling out from a white-hot heart,
 * each billow's underside a shade darker; inked round. `t` turns it, `seed` makes it its own.
 */
function paintFireball(p: Px, cx: number, cy: number, r: number, t: number, seed: number): void {
  // (a burst, not a star: streaks of burning stuff and sparks flung out from it; then the fire itself, billows of every
  // size thrown out unevenly, more of them up than down, the outer ones cooler and darker, rolling into smoke at the top;
  // white-hot at its heart)
  for (let j = 0; j < 22; j++) {
    const a = hash(j, seed, 1021) * Math.PI * 2;
    const L = r * (1.0 + hash(j, seed + 1, 1021) * 1.1);
    const L0 = r * 0.5;
    const n = Math.round(L - L0);
    for (let i = 0; i < n; i++) {
      const u = i / n;
      const x = Math.round(cx + Math.cos(a) * (L0 + i));
      const y = Math.round(cy + Math.sin(a) * (L0 + i) * 0.85 + u * u * r * 0.15);
      p.set(x, y, u < 0.3 ? '#fff3c0' : u < 0.7 ? '#ffc040' : '#e8601c');
    }
  }
  const ball = layerOf(p);
  const puffs: [number, number, number, number][] = [[cx, cy, r * 0.48, 0]];
  for (let j = 0; j < 14; j++) {
    const a = -Math.PI / 2 + (hash(j, seed + 2, 1021) - 0.5) * Math.PI * 1.9;
    const d = r * (0.25 + hash(j, seed + 3, 1021) * 0.5) * (Math.sin(a) < 0 ? 1.15 : 0.8);
    const rr = r * (0.18 + hash(j, seed + 4, 1021) * 0.22);
    puffs.push([cx + Math.cos(a) * d * 1.1, cy + Math.sin(a) * d - r * 0.05, rr, d / r]);
  }
  for (const [x, y, rr, j] of puffs) {
    const pts: Pt[] = [];
    for (let i = 0; i < 12; i++) {
      const b = (i / 12) * Math.PI * 2;
      const lobe = 0.82 + 0.22 * Math.abs(Math.sin(b * 2.5 + x * 0.3 + j * 5));
      pts.push([x + Math.cos(b) * rr * lobe, y + Math.sin(b) * rr * lobe * 0.9]);
    }
    ball.poly(loop(pts, 3), FIRE[2]);
  }
  ball.each((x, y) => {
    const g = glow(x, y, cx, cy, r * 0.9) + (fbm(x / 5, y / 5, seed) - 0.5) * 0.35;
    let under = 0;
    for (const [px, py, rr] of puffs.slice(1)) if (Math.hypot(x - px, y - py) < rr && y > py + rr * 0.3) under = 1;
    if (g < 0.12 && y < cy) return dot(x, y, 0.6, 2) ? '#4a2a2a' : '#6a3424';
    const i = Math.max(0, Math.min(5, Math.floor(g * 7) - under));
    return FIRE[i];
  });
  over(p, ball, INK, 0, 0, 1);
  for (let j = 0; j < 30; j++) {
    const a = hash(j, seed + 5, 1021) * Math.PI * 2;
    const d = r * (0.7 + hash(j, seed + 6, 1021) * 1.3);
    p.set(Math.round(cx + Math.cos(a) * d), Math.round(cy + Math.sin(a) * d * 0.8), j % 3 ? '#ffc040' : '#fff3c0');
  }
}

/**
 * Flames along `base` (left to right), licking up `h` high and leaning `lean` (a share of their height, sideways): tongues
 * of every height, each a curling lick narrowing to its tip, white-gold at its root, gold and orange up it, red at its edges
 * and its tip; licks torn off above them; no ink round them (fire is light, not a thing).
 */
function paintFlames(p: Px, base: readonly Pt[], h: number, lean: number, t: number, seed: number): void {
  const fl = layerOf(p);
  // (each pixel's heat: how far up its tongue (0 at the root) and how near its middle)
  const heat = new Map<number, number>();
  const put = (x: number, y: number, v: number): void => {
    const X = Math.round(x);
    const Y = Math.round(y);
    if (X < 0 || Y < 0 || X >= p.w || Y >= p.h) return;
    const i = Y * p.w + X;
    heat.set(i, Math.max(heat.get(i) ?? 0, v));
  };
  const tongue = (x: number, y: number, hh: number, w: number, ph: number, ln: number): void => {
    const n = Math.max(4, Math.round(hh));
    for (let i = -Math.round(n * 0.15); i <= n; i++) {
      const u = i / n;
      const cx = x + ln * hh * Math.max(0, u) + Math.sin(u * Math.PI * 1.6 + ph) * w * 0.5 * Math.max(0, u);
      const cy = y - hh * u;
      // (its root rounded under it, so that it grows out of the burning and not off a line)
      const half = u < 0 ? w * Math.sqrt(Math.max(0, 1 - (u / 0.15) ** 2)) : w * Math.pow(1 - u, 0.7) * (1 + 0.25 * Math.sin(u * 9 + ph * 2));
      for (let d = -half; d <= half; d += 0.5) put(cx + d, cy, (1 - Math.abs(d) / Math.max(0.5, half)) * (1 - u * 0.85));
    }
  };
  base.forEach(([x, y], i) => {
    const hh = h * (0.4 + hash(i, seed, 1023) * 0.8) * (0.85 + 0.15 * Math.sin(t * 8 + i * 1.7));
    const w = h * (0.16 + hash(i, seed + 1, 1023) * 0.12);
    const ph = t * 6 + i * 2.3 + hash(i, seed + 2, 1023) * 6;
    tongue(x, y, hh, w, ph, lean);
    // (a lick torn off over it, rising)
    const up = ((t * 1.5 + hash(i, seed + 3, 1023)) % 1) * h * 0.5;
    if (hash(i, seed + 4, 1023) > 0.35) tongue(x + lean * (hh + up), y - hh * 0.95 - up, hh * 0.28, w * 0.45, ph + 1, lean);
  });
  for (const [i, v] of heat) {
    const x = i % p.w;
    const y = Math.floor(i / p.w);
    const q = v + (fbm(x / 4, y / 5 + t * 2, seed) - 0.5) * 0.25;
    if (q < 0.04) continue;
    fl.set(x, y, q > 0.78 ? FIRE[5] : q > 0.6 ? FIRE[4] : q > 0.42 ? FIRE[3] : q > 0.26 ? FIRE[2] : q > 0.12 ? FIRE[1] : FIRE[0]);
  }
  over(p, fl, null);
}

/**
 * Smoke rolling up from (x, y), `w` wide at its foot, `h` high, drifting `drift` sideways (a share of its height): soft
 * billows in a few dark tones, dotted out at their edges; its underside lit by the fire under it (`warm`, 0..1).
 */
function paintSmoke(p: Px, x: number, y: number, w: number, h: number, drift: number, t: number, seed: number, warm = 1): void {
  const SM: Tones = ['#140e1a', '#1e1624', '#2a1e2e', '#3a2a36', '#4e3438'];
  const sm = layerOf(p);
  const x0 = Math.max(0, Math.floor(x - w * 2 - Math.abs(drift) * h));
  const x1 = Math.min(p.w - 1, Math.ceil(x + w * 2 + Math.abs(drift) * h));
  for (let yy = Math.max(0, Math.floor(y - h)); yy <= Math.min(p.h - 1, y); yy++) {
    const u = (y - yy) / h;
    const cx = x + drift * h * u * u + Math.sin(u * 5 + t * 0.7) * w * 0.25;
    const half = w * (0.5 + u * 1.3);
    for (let xx = x0; xx <= x1; xx++) {
      const d = Math.abs(xx - cx) / half;
      if (d > 1.3) continue;
      const billow = fbm(xx / (w * 0.35), (yy + t * 10) / (w * 0.3), seed, 3);
      const dens = (1 - d) * 0.9 + (billow - 0.5) * 1.1 - u * 0.25;
      if (dens < 0.05) continue;
      if (dens < 0.2 && !dot(xx, yy, dens / 0.2, 2)) continue;
      const lit = clamp01(1 - u * 2.2) * warm * (billow > 0.5 ? 1 : 0.6);
      const k = Math.max(0, Math.min(SM.length - 1, Math.floor((billow - 0.25) * 4 + lit * 2.2)));
      sm.set(xx, yy, SM[k]);
    }
  }
  over(p, sm, null);
}

/** A torch's flame at (x, y), `s` its size: a tongue licking up, white-gold at its heart, and the sparks off it. */
function paintFlame(p: Px, x: number, y: number, s: number, t: number, seed: number): void {
  const l = layerOf(p);
  const sway = Math.sin(t * 7 + seed) * 0.25 * s;
  l.poly(loop([[x - 3 * s, y + 2 * s], [x - 3.5 * s, y - 1 * s], [x - 1.5 * s + sway, y - 5 * s], [x + sway * 2, y - 9 * s], [x + 1.6 * s + sway, y - 4.5 * s], [x + 3.4 * s, y - 1 * s], [x + 2.8 * s, y + 2 * s]], 4, [3]), '#e8601c');
  l.each((px, py) => {
    const g = glow(px, py, x, y - 0.5 * s, 4.2 * s);
    return g > 0.45 ? '#fff3c0' : g > 0.2 ? '#ffc040' : g > 0.06 ? '#ff8a2a' : undefined;
  });
  over(p, l, INK);
  for (let j = 0; j < 4; j++) {
    const a = hash(j, seed, 961) * 1.2 - 0.6;
    const r = (6 + hash(j, seed, 962) * 8 + ((t * 9 + j * 3) % 6)) * s;
    p.set(Math.round(x + Math.sin(a) * r * 0.5), Math.round(y - 6 * s - r), j % 2 ? '#ffc040' : '#ff8a2a');
  }
}


/**
 * A cultist far off, running (art/cast.ts, sculpted, seen square on): his feet at (x, y), `sc` pixels to his unit, at the
 * `ph` of his stride, a torch held high if `torch` (else his dagger out), turned `yaw` (from facing us). Where his torch burns.
 */
function miniCultist(p: Px, x: number, y: number, sc: number, ph: number, torch: boolean, yaw: number): Pt | null {
  const f = new Figure();
  const sw = Math.sin(ph);
  const up = Math.cos(ph);
  const { r, at } = Cast.place(f, [0, 0, 0], yaw, () => Cast.cultist(f, {
    pelvis: [0, 0, 8.7 + Math.abs(up) * 0.3],
    lean: 0.35,
    twist: sw * 0.15,
    hands: torch ? [[-2.0, 2.2 * sw, 9.4], [1.9, -1.4, 19.0]] : [[-1.9, -3.6, 11.2], [2.1, -2.2 * sw, 9.2]],
    elbows: [[-1, 0.3, -0.5], [1, 0.3, -0.5]],
    feet: [[-0.9, -3.0 * sw, 0.8 + Math.max(0, up) * 1.6], [0.9, 3.0 * sw, 0.8 + Math.max(0, -up) * 1.6]],
    knees: [[0, -1, 0.25], [0, -1, 0.25]],
  }, torch ? null : { hand: 0, to: [-2.0, -7, 12] }, torch ? { hand: 1, to: [2.0, -1.8, 24] } : null, 1.5));
  const cam = { look: unit([0.1, 1, -0.08]), up: [0, 0, 1] as V3, scale: sc, ox: x, oy: y };
  f.draw(p, cam, { from: unit([1, -0.4, 0.4]), hard: 1, fill: [-0.4, -1, 0.3], fillK: 0.3, rim: '#ffb060', rimFrom: [1, 0] });
  return r.torch ? seen(cam, at(r.torch)) : null;
}

export function paintAmbush(p: Px, t: number): void {
  const W = p.w;
  const H = p.h;
  const S = (x: number, y: number): Pt => [(x / 392) * W, (y / 360) * H];
  const k = W / 392;
  const flick = 0.85 + 0.15 * Math.sin(t * 9.1);
  // (the last wagon, sculpted (sculptWagon), at the road's edge at the bottom right, seen from behind it and to its right;
  // where the bomb struck it, on its canvas toward its back)
  const STRIKE: V3 = [-3.5, -3.2, 9.6];
  const wcam = { look: unit([0.62, 1, -0.16]), up: [0, 0, 1] as V3, scale: 11.5 * k, ox: 0, oy: 0, persp: 70 };
  const w0 = seen(wcam, [0, 0, 0]);
  wcam.ox = S(326, 0)[0] - w0[0];
  wcam.oy = S(0, 350)[1] - w0[1];
  const boom = seen(wcam, STRIKE);
  const fire = (x: number, y: number, r = W * 0.6): number => glow(x, y, boom[0], boom[1], r) * flick;
  // THE NIGHT, the prison's crag far off right, black on it
  const sky = layerOf(p);
  sky.rect(0, 0, W, H, DUSK[0]);
  bands(sky, DUSK, (x, y) => -0.05 + glow(x, y, W * 0.95, H * 0.15, W * 0.7) * 0.4 + fire(x, y, W * 0.8) * 0.55 + strata(x, y, 1706));
  sky.each((x, y) => (y < H * 0.4 && hash(x, y, 971) > 0.994 ? '#c8c4f0' : undefined));
  over(p, sky, null);
  const crag = layerOf(p);
  crag.poly(loop([S(296, 170), S(306, 140), S(318, 132), S(322, 104), S(334, 92), S(338, 66), S(350, 52), S(392, 48), S(396, 48), S(396, 176)], 2, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]), KEEP[0]);
  facets(crag, ['#0a0816', '#120f22', '#1b1630', '#262040', '#342a50'], [0.9, -0.35, 0.25], { cw: 6 * k, ch: 16 * k, seed: 1709, tilt: [0.25, 0], spread: 1.4, extra: (x, y) => glow(x, y, W * 0.95, H * 0.15, W * 0.4) * 0.8 - 0.1 });
  crag.each((x, y) => (!crag.has(x, y - 1) ? KEEP_RIM : undefined));
  over(p, crag, INK);
  paintFarKeep(p, S(368, 46)[0], S(368, 46)[1], 0.85 * k);
  // THE SLOPE they pour down, from the top left to the road at the bottom right; the road
  const slope = layerOf(p);
  slope.poly(loop([S(-4, 40), S(70, 60), S(150, 100), S(230, 150), S(300, 196), S(396, 214), S(396, 364), S(-4, 364)], 6, [0, 6, 7]), ROCK[0]);
  facets(slope, ROCK, [0.5, -0.6, 0.5], { cw: 30, ch: 9, seed: 981, tilt: [0.55, -0.2], spread: 0.45, cracks: false, extra: (x, y) => fire(x, y, W * 0.7) * 1.3 - 0.1 });
  slope.each((x, y) => (!slope.has(x, y - 1) ? ROCK_RIM : undefined));
  over(p, slope, INK);
  const road = layerOf(p);
  road.poly(loop([S(160, 364), S(240, 300), S(300, 276), S(396, 262), S(396, 364)], 6, [0, 3, 4]), ROAD[0]);
  bands(road, ROAD, (x, y) => 0.2 + fire(x, y, W * 0.6) * 1.3 + (fbm(x / 7, y / 3, 983) - 0.5) * 0.3);
  over(p, road, INK);
  // THE FAR ONES, a stream of them down along the ridge, sculpted (miniCultist): hooded, their eyes pink, torches high,
  // lit from the right by the fire
  // (a mob, not a file: scattered down the slope from the ridge, the nearer the bigger, some bunched, some strung out
  // behind, all running down at the wagon; torches held up and out at every angle)
  const flames: [number, number, number][] = [];
  const mob: [number, number, number][] = [];
  for (let j = 0; j < 17; j++) {
    const u = hash(j, 1, 993);
    const v = hash(j, 2, 993);
    // (on the slope: from its ridge line, top left, down toward the road, lower right)
    const x = 10 + u * 190;
    const y = 40 + x * 0.52 + 14 + v * 95 * (1 - u * 0.4);
    mob.push([x, y, j]);
  }
  mob.sort((a, b) => a[1] - b[1]);
  for (const [x, y, j] of mob) {
    const sz = (0.55 + ((y - 50) / 200) * 0.85) * k;
    const tp = miniCultist(p, S(x, 0)[0], S(0, y)[1], (31 * sz) / 17.2, t * 8 + j * 1.7, j % 3 !== 1, 0.7 + (hash(j, 3, 993) - 0.5) * 0.9);
    if (tp) flames.push([tp[0], tp[1], sz * 0.55]);
  }
  flames.forEach(([x, y, sz], j) => paintFlame(p, x, y, sz, t, j));
  // THE SMOKE rolling up off the last wagon, leaning back up the hill, lit from under by the fire
  paintSmoke(p, boom[0] + 6 * k, boom[1] - 14 * k, 26 * k, 210 * k, -0.45, t, 1003, 1);
  // THE LAST WAGON, sculpted, its canvas burnt through and afire round where the bomb struck it
  const wsh = layerOf(p);
  wsh.poly(loop([seen(wcam, [-9.5, -4.4, 0]), seen(wcam, [9.5, -4.4, 0]), seen(wcam, [9.5, 4.4, 0]), seen(wcam, [-9.5, 4.4, 0])], 3), '#07060d');
  wsh.each((x, y) => (dot(x, y, 0.6, 2) ? undefined : '#120c16'));
  over(p, wsh, null);
  const wf = new Figure();
  sculptWagon(wf, [0, 0, 0], 0, { roll: 0.3, burn: 0.75, burnAt: STRIKE, lampSide: -1 });
  wf.draw(p, wcam, { from: unit([-0.2, -0.5, 0.85]), hard: 1, fill: [-0.6, -1, 0.1], fillK: 0.3, rim: '#ffb060', rimFrom: [0.3, -1] });
  // (the flames off its canvas, licking up and back off the burning, and the burst where it struck)
  const along: Pt[] = [];
  for (let j = 0; j < 9; j++) {
    const a2 = 0.35 + (j / 8) * 1.2;
    along.push(seen(wcam, [STRIKE[0] - 3 + j * 0.9, -Math.cos(a2) * 3.3, 5.4 + Math.sin(a2) * 6.6]));
  }
  paintFlames(p, along, 44 * k, -0.3, t, 1027);
  paintFireball(p, boom[0], boom[1], 26 * k * (0.96 + 0.04 * flick), t, 1029);
  for (let j = 0; j < 26; j++) {
    const a = hash(j, 6, 1001) * Math.PI * 2;
    const r = (34 + hash(j, 7, 1001) * 50 + ((t * 40 + j * 13) % 30)) * k;
    const x = boom[0] + Math.cos(a) * r;
    const y = boom[1] + Math.sin(a) * r * 0.8;
    p.set(Math.round(x), Math.round(y), j % 3 ? '#ffc040' : '#fff3c0').set(Math.round(x + Math.cos(a)), Math.round(y + Math.sin(a)), '#ff8a2a');
  }
  // THE NEAR ONES, sculpted: two running down with torches and daggers, and the first, leaping at us, his dagger up
  const look = unit([0.1, 1, -0.05]);
  const draws: { f: Figure; cam: { look: V3; up: V3; scale: number; ox: number; oy: number }; torch: V3 | null }[] = [];
  const run = AMBUSH_POSES.run;
  {
    const f = new Figure();
    const r = sculptCultist(f, [0, 0, 0], 0.5, run(0.5, t * 8, 1));
    draws.push({ f, cam: { look, up: [0, 0, 1], scale: 7.5 * k, ox: S(166, 0)[0], oy: S(0, 200)[1] }, torch: r.torch });
  }
  {
    const f = new Figure();
    const r = sculptCultist(f, [0, 0, 0], 0.7, run(0.7, t * 8 + 2, 0));
    draws.push({ f, cam: { look, up: [0, 0, 1], scale: 9.5 * k, ox: S(196, 0)[0], oy: S(0, 258)[1] }, torch: r.torch });
  }
  {
    // the nearest: running down at the wagon in a long stride, his dagger high over his head, his other hand clawing out
    const f = new Figure();
    Cast.place(f, [0, 0, 0], 0.95, () => {
      // (lunging: his weight on the leading leg, the other stretched behind him, heel up; leaning far into it; the dagger
      // drawn back high behind his head, cocked to strike down; the other hand thrust out before him, clawing)
      Cast.cultist(f, {
        pelvis: [0, 0.2, 8.2],
        lean: 0.62,
        twist: 0.4,
        nod: 0.15,
        turn: -0.1,
        hands: [[-2.2, 2.0, 17.2], [1.4, -6.6, 12.8]],
        elbows: [[-1, 0.3, 0.7], [1, 0.2, -0.6]],
        palms: [[1, 0, 0], [0, 0, -1]],
        fingers: [[0, -0.4, 1], [0, -1, -0.1]],
        feet: [[-0.9, 4.8, 1.5], [1.0, -5.2, 0.8]],
        knees: [[0, -1, -0.4], [0, -1, 0.35]],
      }, { hand: 0, to: [-1.2, -3.5, 19.8] }, null, 2);
    }, OLD);
    draws.push({ f, cam: { look, up: [0, 0, 1], scale: 19.5 * k, ox: S(96, 0)[0], oy: S(0, 352)[1] }, torch: null });
  }
  for (const dw of draws) {
    const right = unit(cross(dw.cam.look, dw.cam.up));
    const dn = unit(cross(dw.cam.look, right));
    const scr = (q: V3): Pt => [dt3(q, right) * dw.cam.scale + dw.cam.ox, dt3(q, dn) * dw.cam.scale + dw.cam.oy];
    // (lit by the fire: the burst's place, brought into the figure's own measures; and by his torch)
    const bx = (boom[0] - dw.cam.ox) / dw.cam.scale;
    const by = (boom[1] - dw.cam.oy) / dw.cam.scale;
    const B3 = add3(add3(scale3(right, bx), scale3(dn, by)), scale3(dw.cam.look, -6));
    dw.f.draw(p, dw.cam, { cel: COMIC, at: dw.torch ?? B3, hard: 1, fill: unit(sub3(B3, [0, 0, 6])), fillK: 0.4, rim: '#ffb060', rimFrom: [1, 0.3] });
    if (dw.torch) {
      const ts = scr(dw.torch);
      paintFlame(p, ts[0], ts[1], dw.cam.scale / 9, t, Math.round(dw.cam.scale));
    }
  }
  // the words
  caption(p, 'The cult was waiting.', Math.round(6 * k), Math.round(6 * k), 120);
}

// =============================================================================================
// PAGES 5 AND 6, ONE PICTURE ACROSS BOTH: THE RUN FOR THE GATE. The wagons race up the last stretch to the prison's great gate,
// the horses straining, the last wagon burning; the cult at their heels; your hero at the rear, turned, his sword swinging
// through the first of them in an arc of the friend's cyan. The lead wagon already under the gate's arch.

/** The knight's stance: his joints in his own measures (up z, his front toward -y); his sword from the fist of `hand` to `tip`. */
interface KnightPose {
  hip: V3;
  chest: V3;
  head: V3;
  sh: readonly [V3, V3];
  el: readonly [V3, V3];
  ha: readonly [V3, V3];
  kn: readonly [V3, V3];
  ft: readonly [V3, V3];
  sword: { hand: 0 | 1; tip: V3 };
  flap: number;
}

/**
 * The knight (the hero) sculpted into `f` at `o`, turned `yaw`: THE GAME'S OWN KNIGHT (art/hero3_knight.ts, the owner's
 * pick): over all of his head a round helm of steel with a POINTED VISOR (a cone of steel out from his face and a little
 * down, drawn to a point; the two slots he sees through over it, a point of light in each; the holes he breathes through in
 * it), mail at his neck; the red tabard over all his trunk, its skirt to his knees cut into points, a plum belt with its
 * buckle of cyan; mail on his arms and thighs, steel caps over his shoulders wider than his arms, steel at his elbows, on
 * his forearms, at his knees, on his shins and his feet; plum gloves; the dark red scarf wound thick round his neck, its
 * ends flying; the great sword, its blade lit cyan.
 */
function sculptKnight(f: Figure, o: V3, yaw: number, P: KnightPose): void {
  Cast.place(f, o, yaw, () => {
    Cast.knight(f, oldPose(P), { hand: P.sword.hand, tip: scale3(P.sword.tip, 1 / OLD) }, P.flap);
  }, OLD);
}

/**
 * A HORSE (a draught horse, the old measure: its withers about 9 high, a little under a man's height), at `o`, facing +x
 * turned `yaw`, `ph` the phase of its stride. `gallop`: at a run, its neck stretched, its head up, mane and tail streaming,
 * its legs reaching and driving; else walking, leaning into the collar. Its body: the deep barrel, the chest, the rounded
 * quarters, the withers; the neck thick at its root and arched; the long head, the jaw, the muzzle, the ears; the legs,
 * each in its true joints (the forearm and the knee and the cannon; the gaskin and the hock pointing back), the fetlocks,
 * the hooves; the harness: the collar, the hames, the traces back, the bridle.
 */
function sculptHorse(f: Figure, o: V3, yaw: number, ph: number, gallop = true): void {
  // (a fifth of a metre a unit; he faces +x; the withers 8.4 high. THE BODY: the barrel of his ribs, the deep chest and the
  // shoulder before it, the round of his quarters behind; the neck rising thick from the withers, arched along its crest,
  // to the poll; the head long and lean, deep at the jowl, narrowing to the muzzle; small ears pricked. THE LEGS by their
  // bones, each hoof where his gait has it at `ph`, the joints between found from the bones' lengths: the knee of the fore
  // leg folding forward, the hock of the hind folding back.)
  const c = Math.cos(yaw);
  const sn = Math.sin(yaw);
  const rot = (q: V3): V3 => [q[0] * c - q[1] * sn, q[0] * sn + q[1] * c, q[2]];
  const at = (q: V3): V3 => add3(o, rot(q));
  const fr = (z: V3, x: V3 = [1, 0, 0]): readonly [V3, V3, V3] => frame(z, x).map(rot) as unknown as readonly [V3, V3, V3];
  const AX: readonly [V3, V3, V3] = [rot([1, 0, 0]), rot([0, 1, 0]), [0, 0, 1]];
  const hide = f.stuff({ tones: [INK, '#1c100c', '#2e1c14', '#46301e', '#64462a', '#8a6238', '#a87c4c'], crease: 0.6 });
  const hair = f.stuff({ tones: [INK, '#0e0808', '#1c1210', '#2e2018', '#463224'], crease: 0.9 });
  const strap = f.stuff({ tones: [INK, '#1a0e0a', '#3a2216', '#5e3a22', '#8a5a34'] });
  const iron = f.stuff({ tones: [INK, '#22204e', '#3a3478', '#7a74c8', '#d6d0ff'] });
  const horn = f.stuff({ tones: [INK, '#14100c', '#2a2218', '#463a2a'] });
  const cyc = ph / (Math.PI * 2);
  const bob = gallop ? Math.sin(ph * 2) * 0.35 : Math.sin(ph * 2) * 0.1;
  const pitch = gallop ? Math.sin(ph) * 0.05 : 0;
  const B = (q: V3): V3 => [q[0], q[1], q[2] + bob + q[0] * pitch];
  // THE BODY
  f.egg(hide, at(B([0, 0, 6.5])), [3.1, 1.45, 1.75], AX, 0.9);
  f.egg(hide, at(B([2.6, 0, 6.7])), [1.45, 1.32, 1.85], AX, 0.9);
  f.egg(hide, at(B([-2.7, 0, 6.9])), [1.85, 1.5, 1.75], AX, 0.9);
  f.egg(hide, at(B([2.0, 0, 8.0])), [1.2, 0.8, 0.6], AX, 0.7);
  f.egg(hide, at(B([-1.0, 0, 7.9])), [2.2, 1.0, 0.5], AX, 0.8);
  // (the shoulder's slope, and the thigh's muscle down toward the stifle, each a mass under the hide)
  for (const s2 of [-1, 1]) {
    f.egg(hide, at(B([2.9, s2 * 0.6, 6.4])), [0.9, 0.75, 1.6], fr([0.45, 0, 1]), 0.7);
    f.egg(hide, at(B([-2.6, s2 * 0.75, 5.9])), [1.4, 0.8, 1.7], fr([0.3, 0, 1]), 0.7);
  }
  // THE NECK and THE HEAD
  const withers = B([2.2, 0, 8.2]);
  const poll = B(gallop ? [6.2, 0, 9.9] : [5.4, 0, 10.8]);
  const neckBase = B([3.3, 0, 7.0]);
  const crest = add3(lerp3(withers, poll, 0.5), [0.0, 0, 0.55]);
  f.rod(hide, at(neckBase), at(lerp3(neckBase, poll, 0.5)), 1.35, 0.92, 0.8);
  f.rod(hide, at(lerp3(neckBase, poll, 0.5)), at(poll), 0.92, 0.62, 0.7);
  f.rod(hide, at(withers), at(crest), 0.85, 0.7, 0.8);
  f.rod(hide, at(crest), at(poll), 0.7, 0.5, 0.7);
  const hd = unit3(gallop ? [0.82, 0, -0.57] : [0.42, 0, -0.9]);
  const jowl = add3(poll, add3(scale3(hd, 0.85), [-0.25, 0, 0]));
  const muzzle = add3(poll, scale3(hd, 3.3));
  // (the head a long wedge: broad and deep at the cheek behind, its jaw's round under it, the face straight down to the
  // muzzle, the muzzle soft and a little deeper than the face above it; the throat cut in under the jowl)
  const down = unit3(cross(hd, [0, 1, 0]));
  f.egg(hide, at(add3(poll, scale3(hd, 0.45))), [0.62, 0.58, 0.7], fr(hd, [0, 0, 1]), 0.4);
  f.egg(hide, at(add3(jowl, scale3(down, -0.3))), [0.92, 0.62, 1.02], fr(hd, [0, 0, 1]), 0.4);
  f.rod(hide, at(add3(poll, scale3(hd, 0.7))), at(add3(muzzle, scale3(hd, -0.2))), 0.66, 0.48, 0.4);
  f.egg(hide, at(add3(muzzle, add3(scale3(down, -0.12), scale3(hd, -0.12)))), [0.42, 0.44, 0.54], fr(hd, [0, 0, 1]), 0.35);
  for (const s2 of [-1, 1]) {
    // (the ears: short, pricked forward, cupped)
    const e0 = add3(poll, [-0.1, s2 * 0.3, 0.32]);
    f.rod(hide, at(e0), at(add3(e0, [gallop ? -0.5 : 0.1, s2 * 0.16, 0.9])), 0.24, 0.06, 0.12);
    f.egg(hide, at(add3(muzzle, [0.1, s2 * 0.26, 0.05])), [0.07, 0.05, 0.09], fr(hd, [0, 0, 1]), 0.05, true);
  }
  f.mark(at(add3(add3(poll, scale3(hd, 0.75)), [0.05, -0.5, 0.2])), ['#f0e8e0', '#8a7a70'], 1);
  // THE MANE lying along the crest to its far side, lifted and streaming back as he runs; the forelock; the tail
  const fly = gallop ? 1.0 : 0.25;
  for (let i = 0; i <= 8; i++) {
    const u = i / 8;
    const q = add3(lerp3(withers, poll, u), [0, 0, 0.45 + Math.sin(u * Math.PI) * 0.5]);
    const back: V3 = [-0.55 - fly * 0.9, 0.35, -0.1 + fly * 0.25 + Math.sin(ph * 3 + i) * 0.12 * fly];
    f.rod(hair, at(q), at(add3(q, back)), 0.28, 0.12, 0.35);
  }
  f.rod(hair, at(add3(poll, [0.1, 0, 0.35])), at(add3(poll, [0.45, 0, -0.25])), 0.16, 0.08, 0.15);
  const tail0 = B([-4.3, 0, 7.9]);
  const tail1 = add3(tail0, gallop ? [-1.7, 0, 0.1 + Math.sin(ph * 2) * 0.3] : [-0.8, 0, -1.6]);
  const tail2 = add3(tail1, gallop ? [-1.7, 0, -0.7] : [-0.3, 0, -2.3]);
  const tail15 = add3(lerp3(tail1, tail2, 0.5), [0, 0, gallop ? 0.35 : 0]);
  f.rod(hair, at(tail0), at(tail1), 0.36, 0.5, 0.4);
  f.rod(hair, at(tail1), at(tail15), 0.5, 0.36, 0.4);
  f.rod(hair, at(tail15), at(tail2), 0.36, 0.1, 0.3);
  // THE LEGS
  const ik = (a: V3, b: V3, l1: number, l2: number, pole: V3): V3 => {
    const d = sub3(b, a);
    const L = Math.min(l1 + l2 - 0.01, Math.hypot(d[0], d[1], d[2]));
    const u = unit3(d);
    const al = (l1 * l1 - l2 * l2 + L * L) / (2 * L);
    const h = Math.sqrt(Math.max(0, l1 * l1 - al * al));
    const pp = sub3(pole, scale3(u, dt3(pole, u)));
    return add3(add3(a, scale3(u, al)), scale3(unit3(pp), h));
  };
  /** Where a hoof is at `u` of its cycle: on the ground and going back under him, or lifted and swung forward. */
  const stride = (u: number, A: number, Bk: number, lift: number): [number, number] => {
    const st = gallop ? 0.38 : 0.6;
    const w = ((u % 1) + 1) % 1;
    if (w < st) return [A - (w / st) * (A + Bk), 0];
    const v = (w - st) / (1 - st);
    const e = v * v * (3 - 2 * v);
    return [-Bk + e * (A + Bk), Math.sin(v * Math.PI) * lift];
  };
  // (fore: elbow, knee, fetlock; hind: stifle, hock, fetlock. Their phase in the gait; the near (-y) and far legs)
  const legs: { root: V3; fore: boolean; off: number }[] = [
    { root: [2.75, -0.72, 5.0], fore: true, off: gallop ? 0.5 : 0.5 },
    { root: [2.55, 0.72, 5.0], fore: true, off: gallop ? 0.4 : 0 },
    { root: [-2.15, -0.8, 5.2], fore: false, off: gallop ? 0.08 : 0.25 },
    { root: [-2.35, 0.8, 5.2], fore: false, off: gallop ? 0 : 0.75 },
  ];
  for (const lg of legs) {
    const root = B(lg.root);
    const [dx, lift] = stride(cyc + lg.off, lg.fore ? (gallop ? 2.3 : 1.1) : gallop ? 1.6 : 1.0, lg.fore ? (gallop ? 1.6 : 0.9) : gallop ? 2.2 : 1.0, gallop ? 2.2 : 0.9);
    const hoof: V3 = [lg.root[0] + dx + (lg.fore ? 0.15 : -0.6), lg.root[1], 0.22 + lift * 0.55];
    // (lifted, the pastern folds back under the fetlock)
    const fold = clamp01(lift / 1.2);
    const fet: V3 = [hoof[0] - (0.25 + fold * 0.5) * (lg.fore ? 1 : 0.8), hoof[1], hoof[2] + 0.75 - fold * 0.2];
    const mid = lg.fore ? ik(root, fet, 1.95, 2.0, [1, 0, 0.1]) : ik(root, fet, 2.05, 2.25, [-1, 0, 0.1]);
    if (lg.fore) {
      // forearm: thick at the elbow, the knee's flat bone; the cannon lean; the fetlock's knob; the pastern; the hoof
      f.rod(hide, at(root), at(mid), 0.72, 0.3, 0.5);
      f.egg(hide, at(mid), [0.3, 0.27, 0.32], AX, 0.2);
      f.rod(hide, at(mid), at(fet), 0.24, 0.21, 0.2);
    } else {
      // gaskin: the muscle of the second thigh down to the hock's point; the cannon; the fetlock; the pastern; the hoof
      f.rod(hide, at(root), at(mid), 0.88, 0.3, 0.55);
      f.egg(hide, at(add3(mid, [-0.18, 0, 0.1])), [0.32, 0.26, 0.3], AX, 0.2);
      f.rod(hide, at(mid), at(fet), 0.25, 0.22, 0.2);
    }
    f.egg(hide, at(fet), [0.28, 0.25, 0.27], AX, 0.15);
    f.rod(hide, at(fet), at(add3(hoof, [0.08, 0, 0.28])), 0.22, 0.24, 0.12);
    f.block(horn, at(add3(hoof, [0.12, 0, 0.02])), [0.36, 0.28, 0.22], 0.12, fr([0.25 * fold, 0, 1], [1, 0, 0]), 0.08);
    f.rod(hair, at(fet), at(add3(fet, [-0.35, 0, -0.4])), 0.16, 0.06, 0.1);
  }
  // the harness: the collar round the neck's root, the hames, the traces back to the wagon; the bridle and its bit
  {
    // (the collar: a padded ring of leather round the neck's root, the hames of iron along it)
    const na = unit3(sub3(poll, neckBase));
    const cc = B([3.55, 0, 7.75]);
    const e1 = unit3([0, 1, 0]);
    const e2 = unit3([na[2], 0, -na[0]]);
    let prev: V3 | null = null;
    for (let i = 0; i <= 16; i++) {
      const an = (i / 16) * Math.PI * 2;
      const q = add3(cc, add3(scale3(e1, Math.cos(an) * 1.42), scale3(e2, Math.sin(an) * 1.55)));
      if (prev) f.rod(strap, at(prev), at(q), 0.3, 0.3, 0.25);
      prev = q;
    }
  }
  f.egg(iron, at(B([3.55, -1.3, 8.4])), [0.1, 0.1, 0.4], fr([0.3, 0, 1]), 0.04);
  f.egg(iron, at(B([3.55, 1.3, 8.4])), [0.1, 0.1, 0.4], fr([0.3, 0, 1]), 0.04);
  f.rod(strap, at(B([3.1, -1.4, 7.3])), at(B([-4.8, -1.4, 6.3])), 0.08, 0.08, 0);
  f.rod(strap, at(B([3.1, 1.4, 7.3])), at(B([-4.8, 1.4, 6.3])), 0.08, 0.08, 0);
  f.rod(strap, at(add3(poll, [0.1, -0.5, -0.1])), at(add3(muzzle, [-0.3, -0.42, 0.1])), 0.06, 0.06, 0);
  f.rod(strap, at(add3(poll, [0, -0.55, 0])), at(add3(poll, [0, 0.55, 0])), 0.07, 0.07, 0);
  f.egg(iron, at(add3(muzzle, [-0.2, -0.4, -0.1])), [0.1, 0.06, 0.1], fr([0, 0, 1]), 0);
}

/** The canvas of the wagons' covers, darkest first. */
const CANVAS_T: Tones = [INK, '#2a221c', '#4a3e30', '#6e5e48', '#9a8662', '#c4ae84', '#e4d0a4'];

/**
 * THE CARAVAN'S WAGON, sculpted (one wagon for every box it is in, near or far; the horse's measure, a fifth of a metre a
 * unit): its bed of planks, iron-strapped; its canvas cover drawn over five hoops, sagging between them, the end hoops
 * leaning out; four spoked wheels shod with iron, the hind ones the taller, `roll` turned; the bench at its front; the
 * shafts out to its horse (art: sculptHorse) when it has one, walking (`walk` its step) or galloping; a lantern hung off
 * its front corner on the `lampSide` (+1: its left, -1: its right) if lit; burnt through and afire if `burn` (0..1).
 * Facing +x at `o`, turned `yaw`. Where its lantern is, if it has one.
 */
function sculptWagon(f: Figure, o: V3, yaw: number, w: { roll?: number; horse?: { ph: number; gallop: boolean }; lampSide?: 1 | -1; burn?: number; burnAt?: V3; driver?: boolean | 'armourer'; ribs?: boolean; backOpen?: boolean } = {}): { lamp: V3 | null } {
  const c = Math.cos(yaw);
  const sn = Math.sin(yaw);
  const rot = (q: V3): V3 => [q[0] * c - q[1] * sn, q[0] * sn + q[1] * c, q[2]];
  const unrot = (q: V3): V3 => [q[0] * c + q[1] * sn, -q[0] * sn + q[1] * c, q[2]];
  const at = (q: V3): V3 => add3(o, rot(q));
  const burn = w.burn ?? 0;
  const roll = w.roll ?? 0;
  const wood = f.stuff({ tones: [INK, '#1a120c', '#2e2016', '#463020', '#64462c', '#86603a'], crease: 0.6 });
  const iron = f.stuff({ tones: [INK, '#16161e', '#2a2a34', '#44444e', '#6a6a78'], crease: 0.4 });
  // THE BED: a box of planks, its sides standing up to the cover; under it the running gear
  const Z0 = 5.4;
  f.block(wood, at([0, 0, 4.4]), [8.2, 3.0, 1.0], 0.12, [rot([1, 0, 0]), rot([0, 1, 0]), [0, 0, 1]], 0.1);
  for (const s of [-1, 1]) {
    f.line([at([-8.2, s * 3.04, 4.4]), at([8.2, s * 3.04, 4.4])], '#120c08', 1);
    for (const x of [-6.2, -2.1, 2.1, 6.2]) f.line([at([x, s * 3.05, 5.35]), at([x, s * 3.05, 3.45])], '#2a2a34', 1);
  }
  // (its end boards: the tailboard behind, the front board; their planks, the iron across them)
  for (const x of [-8.23, 8.23]) {
    for (const z of [3.95, 4.45, 4.95]) f.line([at([x, -3.0, z]), at([x, 3.0, z])], '#120c08', 1);
    for (const y of [-2.2, 2.2]) f.line([at([x, y, 5.35]), at([x, y, 3.45])], '#2a2a34', 1);
  }
  f.rod(wood, at([-5.2, 0, 3.1]), at([5.4, 0, 2.6]), 0.3, 0.3, 0.1);
  // the bench at its front, and the footboard
  // (out in front of the cover, where its driver sits in the open)
  f.block(wood, at([8.7, 0, 6.3]), [0.55, 2.7, 0.18], 0.06, [rot([1, 0, 0]), rot([0, 1, 0]), [0, 0, 1]], 0.05);
  for (const s of [-1, 1]) f.rod(wood, at([8.5, s * 2.5, 5.4]), at([8.7, s * 2.5, 6.2]), 0.12, 0.12, 0.05);
  f.block(wood, at([8.2, 0, 7.0]), [0.12, 2.7, 0.7], 0.05, [rot([1, 0, 0]), rot([0, 1, 0]), [0, 0, 1]], 0.05);
  f.block(wood, at([10.2, 0, 5.0]), [0.9, 2.4, 0.12], 0.05, [rot(unit3([0.5, 0, 0.86])), rot([0, 1, 0]), rot(unit3([-0.86, 0, 0.5]))], 0.05);
  f.block(wood, at([9.2, 0, 4.6]), [1.0, 2.6, 0.12], 0.05, [rot([1, 0, 0]), rot([0, 1, 0]), [0, 0, 1]], 0.05);
  // THE WHEELS: a felloe of wood round, an iron tyre on it, spokes from the hub; the hind pair taller
  for (const [x, R, n] of [[-5.2, 3.1, 12], [5.4, 2.6, 10]] as const) {
    for (const s of [-1, 1]) {
      const y = s * 3.6;
      const hub: V3 = [x, y, R];
      const ring = (r: number): V3[] => Array.from({ length: 17 }, (_, i) => {
        const a = roll + (i / 16) * Math.PI * 2;
        return [x + Math.cos(a) * r, y, R + Math.sin(a) * r] as V3;
      });
      const fel = ring(R - 0.2);
      const tyre = ring(R - 0.02);
      for (let i = 0; i < 16; i++) {
        f.rod(wood, at(fel[i]), at(fel[i + 1]), 0.3, 0.3, 0.12);
        f.rod(iron, at(tyre[i]), at(tyre[i + 1]), 0.14, 0.14, 0.05);
      }
      for (let i = 0; i < n; i++) {
        const a = roll + (i / n) * Math.PI * 2 + 0.13;
        f.rod(wood, at([x + Math.cos(a) * 0.4, y, R + Math.sin(a) * 0.4]), at([x + Math.cos(a) * (R - 0.35), y, R + Math.sin(a) * (R - 0.35)]), 0.15, 0.11, 0.1);
      }
      f.egg(wood, at(hub), [0.6, 0.55, 0.6], [rot([1, 0, 0]), rot([0, 1, 0]), [0, 0, 1]], 0.15);
      f.egg(iron, at([x, y + s * 0.55, R]), [0.32, 0.18, 0.32], [rot([1, 0, 0]), rot([0, 1, 0]), [0, 0, 1]], 0.05);
    }
    f.rod(iron, at([x, -3.4, R]), at([x, 3.4, R]), 0.2, 0.2, 0.05);
  }
  // THE COVER: canvas over five hoops of bent wood, half again as high as the bed is wide, the end hoops leaning out; the
  // canvas sagging between the hoops; seen from inside (through its open ends) dark
  const HX = [-7.8, -3.9, 0, 3.9, 7.8];
  const AW = 3.35;
  const AH = 6.6;
  const NA = 13;
  const hoopAt = (i: number, th: number, sag = 0): V3 => {
    const fl = i === 0 ? -1.3 : i === HX.length - 1 ? 1.3 : 0;
    const x = i === Math.floor(i) ? HX[i] : (HX[Math.floor(i)] + HX[Math.ceil(i)]) / 2;
    const k = 1 - sag;
    return [x + fl * Math.sin(th), AW * Math.cos(th) * k, Z0 + AH * Math.sin(th) * k];
  };
  const canvas = f.stuff({
    tones: CANVAS_T,
    crease: 0.9,
    paint: (q, nn) => {
      const l = unrot(sub3(q, o));
      const ln = unrot(nn);
      // (inside: dark)
      if (ln[1] * l[1] + ln[2] * (l[2] - Z0) < -0.2 && Math.abs(l[0]) > 6.5) return '#120e0c';
      if (burn > 0) {
        const ba = w.burnAt ?? [8.5, 0, 9];
        const n = fbm(l[0] * 0.32 + 7, l[2] * 0.42 + l[1] * 0.25, 1301) + (0.6 - Math.hypot(l[0] - ba[0], l[1] - ba[1], l[2] - ba[2]) / 10) * 0.6 * burn;
        const th = 0.86 - burn * 0.22;
        if (n > th + 0.05) return INK;
        if (n > th + 0.025) return '#ffb040';
        if (n > th) return '#c4401c';
        if (n > th - 0.04) return '#3a2a1e';
      }
      return null;
    },
  });
  // (laid as panels, each from a hoop to the sag halfway to the next, a strip of the arch wide)
  const panel = (A0: V3, A1: V3, M0: V3, M1: V3): void => {
    const ca = lerp3(A0, A1, 0.5);
    const cm = lerp3(M0, M1, 0.5);
    const u = unit3(sub3(cm, ca));
    const v0 = sub3(lerp3(A1, M1, 0.5), lerp3(A0, M0, 0.5));
    const v = unit3(sub3(v0, scale3(u, dt3(v0, u))));
    const n = cross(u, v);
    const hl = Math.hypot(...sub3(cm, ca)) / 2 + 0.2;
    const hw = Math.hypot(...v0) / 2 + 0.15;
    f.block(canvas, at(lerp3(ca, cm, 0.5)), [hl, hw, 0.32], 0.28, [rot(u), rot(v), rot(n)], 0.55);
  };
  for (let i = 0; i < HX.length - 1; i++) {
    for (const [i0, s0, i1, s1] of [[i, 0, i + 0.5, 0.04], [i + 0.5, 0.04, i + 1, 0]] as const) {
      for (let j = 0; j < NA - 1; j++) {
        const t0 = (j / (NA - 1)) * Math.PI;
        const t1 = ((j + 1) / (NA - 1)) * Math.PI;
        panel(hoopAt(i0, t0, s0), hoopAt(i0, t1, s0), hoopAt(i1, t0, s1), hoopAt(i1, t1, s1));
      }
    }
  }
  // (its back drawn in by its cord to a small round mouth, the canvas gathered in folds to it; unless it is left open)
  if (!w.backOpen) {
    const mid: V3 = [HX[0] - 1.0, 0, Z0 + AH * 0.42];
    const inner = (th: number): V3 => {
      const q = hoopAt(0, th);
      return [q[0] - 0.9, mid[1] + (q[1] - mid[1]) * 0.36, mid[2] + (q[2] - mid[2]) * 0.36];
    };
    for (let j = 0; j < NA - 1; j++) {
      const t0 = (j / (NA - 1)) * Math.PI;
      const t1 = ((j + 1) / (NA - 1)) * Math.PI;
      panel(inner(t0), inner(t1), hoopAt(0, t0), hoopAt(0, t1));
      if (j % 2 === 0 && w.ribs !== false) f.line([at(add3(inner(t0), [-0.35, 0, 0])), at(add3(lerp3(inner(t0), hoopAt(0, t0), 0.75), [-0.3, 0, 0]))], '#2a221c', 1);
    }
    // (and its lower part, under the mouth, closed down to the bed)
    panel(inner(0), inner(Math.PI), hoopAt(0, 0), hoopAt(0, Math.PI));
  }
  // (the hoops' ribs pressed through it, and its lacing along the bed)
  for (let i = 0; i < (w.ribs === false ? 0 : HX.length); i++) {
    const pts: V3[] = [];
    for (let j = 0; j <= 16; j++) pts.push(at(add3(hoopAt(i, (j / 16) * Math.PI), [0, 0, 0])));
    const out = pts.map((q) => {
      const l = unrot(sub3(q, o));
      const d = unit3([0, l[1], l[2] - Z0]);
      return at(add3(l, scale3(d, 0.62)));
    });
    f.line(out, '#5a4a36', 1);
  }
  // THE DRIVER, hunched on the bench in his cloak and hood
  if (w.driver === 'armourer') {
    // (the armourer, the company's own driver (art/cast.ts), at half the measure: hunched forward over his knees on the
    // bench, the reins in his fists, out to the horse)
    const leath = f.stuff({ tones: [INK, '#1a0e08', '#40261a', '#583420', '#704628'] });
    Cast.place(f, at([8.7, -0.6, 4.18]), yaw + Math.PI / 2, () => {
      const b = Cast.armourer(f, {
        pelvis: [0, 0.2, 5.45],
        lean: 0.42,
        nod: -0.3,
        turn: 0,
        hands: [[-1.0, -4.4, 8.4], [1.0, -4.3, 8.5]],
        elbows: [[-0.6, 0.4, -1], [0.6, 0.4, -1]],
        fingers: [[0.2, -1, -0.35], [-0.2, -1, -0.35]],
        palms: [[0.5, 0, -1], [-0.5, 0, -1]],
        feet: [[-1.2, -3.8, 0.4], [1.2, -3.4, 0.3]],
        knees: [[-0.3, -1, 0.6], [0.3, -1, 0.6]],
      }, ['grip', 'grip']);
      for (const j of [0, 1] as const) f.rod(leath, b.wrists[j], [j ? 0.7 : -0.7, -16, 4.5], 0.12, 0.12, 0);
    }, 0.5);
  } else if (w.driver) {
    // (a driver hunched on the bench in his cloak and hood, the reins in his hands)
    const cloak = f.stuff({ tones: [INK, '#120e14', '#1e1822', '#2c2432', '#3e3446'], crease: 0.8 });
    f.egg(cloak, at([8.5, -0.7, 7.6]), [0.9, 0.85, 1.35], [rot(unit3([1, 0, -0.3])), rot([0, 1, 0]), rot(unit3([0.3, 0, 1]))] as const, 0.5);
    f.egg(cloak, at([8.95, -0.7, 9.1]), [0.5, 0.48, 0.55], undefined, 0.4);
    f.rod(cloak, at([8.95, -0.7, 9.4]), at([8.6, -0.7, 9.9]), 0.32, 0.08, 0.3);
    f.rod(cloak, at([8.7, -0.7, 8.2]), at([9.8, -0.7, 7.4]), 0.3, 0.22, 0.3);
    f.rod(cloak, at([8.7, -0.7, 7.0]), at([10.0, -0.7, 6.6]), 0.4, 0.3, 0.3);
    f.rod(cloak, at([10.0, -0.7, 6.6]), at([10.4, -0.7, 5.1]), 0.32, 0.26, 0.3);
  }
  // THE SHAFTS out to the horse, and the horse in them
  if (w.horse) {
    for (const s of [-1, 1]) {
      f.rod(wood, at([8.0, s * 1.75, 3.7]), at([13.8, s * 1.75, 6.4]), 0.16, 0.14, 0.05);
      f.rod(wood, at([13.8, s * 1.75, 6.4]), at([18.0, s * 1.75, 7.2]), 0.14, 0.12, 0.05);
    }
    sculptHorse(f, at([15.4, 0, 0]), yaw, w.horse.ph, w.horse.gallop);
  }
  // THE LANTERN on its iron crook off the front corner, lit
  let lamp: V3 | null = null;
  if (w.lampSide) {
    const s = w.lampSide;
    const glass = f.stuff({ tones: ['#7a3a10', '#c8641c', '#ff9a2a', '#ffd060', '#fff2b0'], paint: (_q, nn) => (nn[2] > 0.6 ? '#2a2a34' : '#ffd060') });
    f.rod(iron, at([8.0, s * 3.1, 5.3]), at([8.3, s * 3.2, 10.8]), 0.13, 0.11, 0.05);
    f.rod(iron, at([8.3, s * 3.2, 10.8]), at([9.4, s * 3.2, 10.9]), 0.1, 0.1, 0.05);
    f.rod(iron, at([9.4, s * 3.2, 10.9]), at([9.4, s * 3.2, 10.35]), 0.06, 0.06, 0.02);
    f.block(glass, at([9.4, s * 3.2, 9.7]), [0.36, 0.36, 0.5], 0.08, [rot([1, 0, 0]), rot([0, 1, 0]), [0, 0, 1]], 0.05);
    f.egg(iron, at([9.4, s * 3.2, 10.3]), [0.42, 0.42, 0.16], undefined, 0.05);
    f.egg(iron, at([9.4, s * 3.2, 9.12]), [0.42, 0.42, 0.1], undefined, 0.05);
    for (const [u, v] of [[-1, -1], [-1, 1], [1, -1], [1, 1]] as const) f.rod(iron, at([9.4 + u * 0.36, s * 3.2 + v * 0.36, 9.15]), at([9.4 + u * 0.36, s * 3.2 + v * 0.36, 10.25]), 0.05, 0.05, 0.02);
    lamp = at([9.4, s * 3.2, 9.7]);
  }
  return { lamp };
}

/**
 * THE PRISON, sculpted (a metre a unit; its front along x, facing -y, up z; the rock it stands on at z 0): a curtain wall
 * round its yard, crenelled, following the crag's top; a round tower at each corner with a steep slate cone of a roof wider
 * than it; the gatehouse at the front's left end, two half-round towers either side of the great arched gate, where the road
 * comes up; the keep rising tall within, square, battlemented, a turret at its corner; arrow slits; all on a plinth of the
 * crag's own rock, broken and stepped. The one prison of the opening, near or far.
 */
function sculptPrison(f: Figure, o: V3, yaw: number, courses = false, plinth = true, through = false): void {
  const c = Math.cos(yaw);
  const sn = Math.sin(yaw);
  const rot = (q: V3): V3 => [q[0] * c - q[1] * sn, q[0] * sn + q[1] * c, q[2]];
  const unrot = (q: V3): V3 => [q[0] * c + q[1] * sn, -q[0] * sn + q[1] * c, q[2]];
  const at = (q: V3): V3 => add3(o, rot(q));
  const AX: readonly [V3, V3, V3] = [rot([1, 0, 0]), rot([0, 1, 0]), [0, 0, 1]];
  // (seen close, its stones laid in courses: the mortar between them, each course's joints over the middle of the stones under)
  const stone = f.stuff({
    tones: [INK, '#120f22', '#1b1630', '#262040', '#342a50', '#46385e'],
    crease: 0.5,
    paint: courses
      ? (q, nn) => {
          const l = unrot(sub3(q, o));
          const ln = unrot(nn);
          if (Math.abs(ln[2]) > 0.7) return null;
          const row = Math.floor(l[2] / 0.85);
          if (l[2] - row * 0.85 < 0.09) return '#0c0a18';
          const along = Math.abs(ln[1]) > Math.abs(ln[0]) ? l[0] : l[1];
          const v = (((along + (row % 2) * 0.7) % 1.4) + 1.4) % 1.4;
          return v < 0.1 ? '#0c0a18' : null;
        }
      : undefined,
  });
  const slate = f.stuff({ tones: [INK, '#0c0a18', '#141026', '#1e1834', '#2a2244'], crease: 0.4 });
  const rock = f.stuff({ tones: [INK, '#16122a', '#221b38', '#33284c', '#4a3a60', '#6a5272'], crease: 0.9 });
  // THE ROCK under it: the crag's top, broken into ledges and stepped down under the walls
  for (const [x, y, z, rx, ry, rz, a, tl, rl] of [
    [-20, 8, -3.5, 16, 12, 3.5, 0.1, 0.05, -0.04], [12, 9, -4, 20, 13, 4, -0.08, -0.04, 0.05], [-34, 4, -5, 5, 6, 5, 0.4, 0.1, 0.15],
    [31, 6, -5, 6, 7, 5, -0.5, -0.1, -0.12], [-6, -1.5, -5, 12, 3.5, 4.5, 0.15, 0.2, 0.08], [16, -1, -5.5, 10, 3.5, 5, -0.2, 0.15, -0.1],
    [-24, -3, -4, 6, 3, 3.5, 0.3, 0.25, 0.05],
  ] as const) {
    if (!plinth) break;
    const ax = axes(yaw + a, tl, rl);
    f.block(rock, at([x, y, z]), [rx, ry, rz], 0.6, ax, 0.9);
  }
  // THE CURTAIN WALL round the yard, its walk crenelled
  const corners: V3[] = [[-32, 0, 0], [30, 0, 0], [30, 24, 0], [-32, 24, 0]];
  const WH = 11;
  for (let i = 0; i < 4; i++) {
    const a = corners[i];
    const b = corners[(i + 1) % 4];
    const mid: V3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, WH / 2 - 2];
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const u = unit3([b[0] - a[0], b[1] - a[1], 0]);
    const ax: readonly [V3, V3, V3] = [rot(u), rot([-u[1], u[0], 0]), [0, 0, 1]];
    f.block(stone, at(mid), [L / 2, 1.3, WH / 2 + 2], 0.2, ax, 0.2);
    // (its merlons, along its outer edge)
    for (let d = 2; d < L - 2; d += 2.6) {
      const q: V3 = [a[0] + u[0] * d - u[1] * -0.9, a[1] + u[1] * d + u[0] * -0.9, WH + 0.6];
      f.block(stone, at(q), [0.65, 0.45, 0.75], 0.1, ax, 0.05);
    }
  }
  // THE CORNER TOWERS: round, taller than the wall, a ring of corbels under their battlements, slate cones over them
  const tower = (x: number, y: number, r: number, h: number, roof: number): void => {
    f.rod(stone, at([x, y, -3]), at([x, y, h]), r, r * 0.94, 0.3);
    f.rod(stone, at([x, y, h - 0.4]), at([x, y, h + 1.2]), r + 0.6, r + 0.6, 0.3);
    f.rod(slate, at([x, y, h + 1.0]), at([x + 0.3, y, h + 1.0 + roof]), r + 1.4, 0.15, 0.1);
    f.block(slate, at([x, y, h + 1.0 - (r + 1.4)]), [r + 3, r + 3, r + 1.4], 0, AX, 0.1, true);
    for (const an of [-0.9, -0.2, 0.5]) {
      const q: V3 = [x + Math.sin(an) * r * 1.01, y - Math.cos(an) * r * 1.01, h * 0.6];
      f.line([at(q), at([q[0], q[1], q[2] - 2.2])], '#05040a', 1);
    }
  };
  tower(-32, 24, 4.2, 17, 11);
  tower(30, 24, 4.2, 18, 12);
  tower(30, 0, 4.6, 16, 11);
  // THE GATEHOUSE at the front's left end: two half-round towers, the arched gate between them, black within
  f.block(stone, at([-24, 0.5, 6]), [7.5, 2.4, 9], 0.3, AX, 0.2);
  for (const x of [-31, -17]) tower(x, -0.6, 3.6, 15, 9);
  for (let x = -30.5; x <= -17.5; x += 2.6) f.block(stone, at([x, -1.2, 15.6]), [0.65, 0.45, 0.75], 0.1, AX, 0.05);
  // (the gate's way through: an arched passage under the gatehouse, its far end dark with the yard beyond)
  const dark = f.stuff({ tones: ['#030208', '#05040a', '#08060e', '#0c0a14'] });
  if (!through) {
    f.block(dark, at([-24, 3.4, 0.6]), [2.0, 0.25, 3.2], 0.1, AX, 0);
    f.rod(dark, at([-24, 3.2, 3.7]), at([-24, 3.6, 3.7]), 2.0, 2.0, 0);
  } else {
    // (seen from within: the yard's flags round the gate, the passage open to the night)
    const flag = f.stuff({ tones: [INK, '#0e0b18', '#16122a', '#201a36', '#2c2446', '#3a3054'], crease: 0.6, paint: (q) => {
      const l: V3 = [q[0] - o[0], q[1] - o[1], q[2]];
      const u = ((l[0] + 40) % 1.6 + 1.6) % 1.6;
      const v = ((l[1] + (Math.floor((l[0] + 40) / 1.6) % 2) * 0.6 + 40) % 1.2 + 1.2) % 1.2;
      return Math.abs(l[2]) < 0.05 && (u < 0.07 || v < 0.07) ? '#0a0814' : null;
    } });
    f.block(flag, at([-6, 12, -0.5]), [30, 14, 0.5], 0.05, AX, 0);
    f.block(flag, at([-24, 0.5, -0.5]), [1.8, 3.0, 0.5], 0.05, AX, 0);
  }
  f.block(stone, at([-24, 0.5, 0.6]), [1.8, 3.0, 3.1], 0.1, AX, 0.1, true);
  f.rod(stone, at([-24, -2.6, 3.7]), at([-24, 3.0, 3.7]), 1.8, 1.8, 0.1, true);
  // (its voussoirs round the arch's face)
  {
    const vs: V3[] = [];
    for (let i = 0; i <= 12; i++) {
      const an = (i / 12) * Math.PI;
      vs.push(at([-24 + Math.cos(an) * 1.8, -1.92, 3.7 + Math.sin(an) * 1.8]));
      if (i % 2 === 0) f.line([at([-24 + Math.cos(an) * 1.8, -1.95, 3.7 + Math.sin(an) * 1.8]), at([-24 + Math.cos(an) * 2.6, -1.95, 3.7 + Math.sin(an) * 2.6])], '#0c0a18', 1);
    }
    f.line(vs, '#0c0a18', 1);
  }
  // THE KEEP within, square and tall, battlemented; a turret at its front corner
  f.block(stone, at([4, 12, 13]), [7, 7, 17], 0.3, AX, 0.3);
  f.block(stone, at([4, 12, 30.6]), [7.6, 7.6, 0.8], 0.15, AX, 0.2);
  for (const [dx, dy, ax2] of [[1, 0, 0], [0, 1, 1]] as const) {
    for (let d = -6.6; d <= 6.6; d += 2.2) {
      for (const sg of [-1, 1]) {
        const q: V3 = [4 + (ax2 ? sg * 7.1 : d), 12 + (ax2 ? d : sg * 7.1), 32.1];
        f.block(stone, at(q), [dx ? 0.6 : 0.4, dy ? 0.6 : 0.4, 0.8], 0.1, AX, 0.05);
      }
    }
  }
  f.rod(stone, at([11, 5, 14]), at([11, 5, 36]), 2.0, 1.9, 0.3);
  f.rod(slate, at([11, 5, 36]), at([11.2, 5, 43]), 2.8, 0.12, 0.1);
  f.block(slate, at([11, 5, 36 - 2.8]), [4, 4, 2.8], 0, AX, 0.1, true);
  // (its slits, and a few in the wall)
  for (const [x, z] of [[0, 24], [6, 24], [0, 16], [8, 18], [3, 9]] as const) f.line([at([x, 4.9, z]), at([x, 4.9, z - 2.4])], '#05040a', 1);
  for (const x of [-8, 2, 14, 22]) f.line([at([x, -1.35, 7.5]), at([x, -1.35, 5.8])], '#05040a', 1);
}

function unit3(v: V3): V3 {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
}



export function paintRun(p: Px, t: number): void {
  const W = p.w;
  const H = p.h;
  const S = (x: number, y: number): Pt => [(x / 808) * W, (y / 360) * H];
  const k = W / 808;
  const flick = 0.85 + 0.15 * Math.sin(t * 9.1);
  // (the last wagon, sculpted (sculptWagon, its horse galloping in the shafts), seen side on, racing right for the gate)
  const wcam = { look: unit([0.06, 1, -0.07]), up: [0, 0, 1] as V3, scale: 10.5 * k, ox: 0, oy: 0, persp: 90 };
  const w0 = seen(wcam, [0, 0, 0]);
  wcam.ox = S(440, 0)[0] - w0[0];
  wcam.oy = S(0, 292)[1] - w0[1];
  const BURN: V3 = [-3.5, -1.5, 11.2];
  const blaze = seen(wcam, BURN);
  const fire = (x: number, y: number, r = W * 0.35): number => glow(x, y, blaze[0], blaze[1], r) * flick;
  // THE NIGHT, the burning wagon's glow under it
  const sky = layerOf(p);
  sky.rect(0, 0, W, H, DUSK[0]);
  bands(sky, DUSK, (x, y) => -0.05 + fire(x, y, W * 0.5) * 0.8 + strata(x, y, 1707));
  sky.each((x, y) => (y < H * 0.45 && hash(x, y, 1301) > 0.995 ? '#c8c4f0' : undefined));
  over(p, sky, null);
  // THE PRISON'S GATE on the right page, sculpted (the one prison, sculptPrison, close: its stones in courses), its arch
  // open, the road ramping up to it; THE LEAD WAGON already under the arch, its lantern swinging
  const gcam = { look: unit([0.35, 1, -0.03]), up: [0, 0, 1] as V3, scale: 9.6 * k, ox: 0, oy: 0, persp: 160 };
  {
    const g0 = seen(gcam, [-24, -2, 0]);
    gcam.ox = S(742, 0)[0] - g0[0];
    gcam.oy = S(0, 248)[1] - g0[1];
    const gf = new Figure();
    sculptPrison(gf, [0, 0, 0], 0, true, false);
    gf.draw(p, gcam, { from: unit([-0.8, -0.6, 0.35]), hard: 1, fill: [0.3, -1, 0.3], fillK: 0.34, rim: '#c87850', rimFrom: [-1, -0.3] });
    // (the yard's light within the arch, the lead wagon's lantern; the wagon's back going in under it)
    const lf = new Figure();
    const lw = sculptWagon(lf, [0, 0, 0], Math.PI / 2 - 0.35, { roll: t * 4, lampSide: -1 });
    const lcam = { ...gcam, scale: gcam.scale / 5 };
    const l0 = seen(lcam, [0, 0, 0]);
    lcam.ox += seen(gcam, [-24, 4, 0])[0] - l0[0];
    lcam.oy += seen(gcam, [-24, 4, 0])[1] - l0[1];
    lf.draw(p, lcam, { from: unit([0.2, 1, 0.5]), hard: 1, fill: [-0.3, -1, 0.3], fillK: 0.35, rim: LAMP[1], rimFrom: [0, -1] });
    if (lw.lamp) {
      const ls = seen(lcam, lw.lamp);
      shine(p, ls[0], ls[1], 16 * k, LAMP[1], 2, 0.25);
    }
  }
  // (the ground: the road, wide where we are, narrowing away to the gate along the hill's shoulder; the slope off its edge)
  const ground = layerOf(p);
  ground.poly(loop([S(-4, 236), S(300, 234), S(560, 238), S(700, 246), S(812, 248), S(812, 364), S(-4, 364)], 6, [0, 5, 6]), ROCK[1]);
  bands(ground, ROCK, (x, y) => 0.2 + fire(x, y, W * 0.45) * 0.9 + (y - H * 0.65) / H * 0.4 + (fbm(x / 20, y / 6, 1302) - 0.5) * 0.3);
  over(p, ground, INK);
  const road = layerOf(p);
  road.poly(loop([S(-4, 330), S(-4, 364), S(812, 364), S(812, 300), S(770, 256), S(720, 250), S(560, 252), S(300, 262), S(-4, 276)], 4, [0, 1, 2, 3]), ROAD[0]);
  bands(road, ROAD, (x, y) => 0.15 + fire(x, y, W * 0.4) * 1.3 + (fbm(x / 8, y / 3, 1303) - 0.5) * 0.3);
  // (its ruts, running away to the gate and drawing together)
  for (const [y0, y1] of [[300, 254], [338, 260]] as const) {
    for (let i = 0; i <= 200; i++) {
      const u = i / 200;
      const x = S(-4 + u * 760, 0)[0];
      const y = S(0, y0 + (y1 - y0) * Math.pow(u, 0.8))[1];
      if (road.has(Math.round(x), Math.round(y))) road.set(Math.round(x), Math.round(y), ROAD[0]);
    }
  }
  over(p, road, INK);
  // THE CULT at their heels, far ones streaming down behind on the left (sculpted, miniCultist)
  const flames: [number, number, number][] = [];
  for (let j = 0; j < 9; j++) {
    const x = S(10 + j * 26, 0)[0] + (hash(j, 1, 1307) - 0.5) * 14 * k;
    const y = S(0, 264 + (hash(j, 2, 1307) - 0.5) * 16)[1];
    const sc = (0.9 + hash(j, 3, 1307) * 0.3) * k;
    const tp = miniCultist(p, x, y, (31 * sc) / 17.2, t * 9 + j * 1.9, j % 2 === 0, 1.25 + (hash(j, 4, 1307) - 0.5) * 0.4);
    if (tp) flames.push([tp[0], tp[1], sc * 0.6]);
  }
  flames.forEach(([x, y, sc], j) => paintFlame(p, x, y, sc, t, j + 40));
  // THE LAST WAGON, burning, its horse at the gallop; smoke and sparks streaming back off it
  paintSmoke(p, blaze[0] - 10 * k, blaze[1] - 10 * k, 34 * k, 140 * k, -2.0, t, 1311, 1);
  {
    const sh = layerOf(p);
    sh.poly(loop([seen(wcam, [-9.5, -4.4, 0]), seen(wcam, [22, -4.4, 0]), seen(wcam, [22, 4.4, 0]), seen(wcam, [-9.5, 4.4, 0])], 3), '#07060d');
    sh.each((x, y) => (dot(x, y, 0.6, 2) ? undefined : '#120c16'));
    over(p, sh, null);
    const f = new Figure();
    const wl = sculptWagon(f, [0, 0, 0], 0, { roll: -t * 7, horse: { ph: t * 9 + 2.83, gallop: true }, burn: 0.85, burnAt: BURN, lampSide: -1, driver: 'armourer' });
    f.draw(p, wcam, { from: unit([-0.3, -0.5, 0.8]), hard: 1, fill: [0.2, -1, 0.2], fillK: 0.42, rim: '#ffb060', rimFrom: [-1, -0.3] });
    if (wl.lamp) {
      const ls = seen(wcam, wl.lamp);
      shine(p, ls[0], ls[1], 14 * k, LAMP[1], 2, 0.25);
    }
    // (the flames off its canvas, streaming back with the speed of it)
    // (a body of fire over the back half of its cover, licking up and streaming back: many tongues close together, the
    // tallest over where it caught; its light on everything near)
    shine(p, blaze[0], blaze[1], 70 * k * flick, '#ff8a2a', 2, 0.18);
    const along: Pt[] = [];
    for (let j = 0; j < 30; j++) {
      const u = j / 29;
      const a2 = 0.3 + hash(j, 1, 1107) * 1.5;
      along.push(seen(wcam, [-8.2 + u * 8.5, -Math.cos(a2) * 3.3, 5.4 + Math.sin(a2) * 6.4]));
    }
    paintFlames(p, along, 36 * k, -0.5, t, 1105);
  }
  for (let j = 0; j < 30; j++) {
    const x = blaze[0] - ((hash(j, 1, 1313) * 220 + t * 120 + j * 13) % 240) * k;
    const y = blaze[1] - 20 * k - hash(j, 2, 1313) * 70 * k + Math.sin(j + t * 3) * 6 * k;
    p.set(Math.round(x), Math.round(y), j % 3 ? '#ffc040' : '#fff3c0').set(Math.round(x) + 1, Math.round(y), '#ff8a2a');
  }
  // THE PURSUERS nearest, sculpted: one struck, reeling back; one behind him, his dagger out
  const look = unit([0.05, 1, -0.05]);
  {
    const f = new Figure();
    sculptCultist(f, [0, 0, 0], 1.0, AMBUSH_POSES.run(0.6, t * 9, 1), 1);
    f.draw(p, { look, up: [0, 0, 1], scale: 15.5 * k, ox: S(178, 0)[0], oy: S(0, 338)[1] }, { cel: COMIC, at: [8, -4, 8], hard: 1, fill: [0.6, -1, 0.3], fillK: 0.3, rim: '#ffb060', rimFrom: [1, -0.2] });
  }
  {
    const f = new Figure();
    const P: CultPose = {
      hip: [0, 0.3, 5.2], chest: [0, 1.2, 7.4], head: [0, 1.9, 9.0],
      sh: [[-1.15, 1.1, 8.0], [1.15, 1.1, 8.0]],
      el: [[-2.0, 0.6, 8.6], [2.0, 0.4, 8.8]],
      ha: [[-2.6, -0.2, 9.8], [2.6, -0.4, 9.6]],
      kn: [[-0.45, -0.8, 3.2], [0.45, 0.6, 2.8]],
      ft: [[-0.45, -1.4, 0.8], [0.45, 0.4, 0.3]],
      hem: [0, 0.2, 3.0],
      dagger: { hand: 1, to: [3.6, -0.8, 11.8] },
    };
    sculptCultist(f, [0, 0, 0], 1.25, P, 2);
    f.draw(p, { look, up: [0, 0, 1], scale: 12 * k, ox: S(70, 0)[0], oy: S(0, 312)[1] }, { cel: COMIC, at: [8, -4, 8], hard: 1, fill: [0.6, -1, 0.3], fillK: 0.3, rim: '#ffb060', rimFrom: [1, -0.2] });
  }
  // YOUR HERO at the rear, turned on them: lunging at them, both hands on his sword's grip, his arms out straight, its blade
  // level at them at the end of its swing from his right; the arc of cyan behind it where it has been (art/cast.ts)
  const yaw = -1.2;
  const f = new Figure();
  const flap = Math.sin(t * 3.1);
  const follow = Math.sin(t * 2.5) * 0.05;
  const dirL = unit([0.55 + follow, -1, -0.05]);
  const gM: V3 = [1.0, -4.6, 11.4];
  const tipL = add3(gM, scale3(dirL, 10.8));
  const wr = (g: V3, s: number): V3 => sub3(g, scale3(unit(sub3(g, [s * 2.2, 0, 14.2])), 0.62));
  const gO = sub3(gM, scale3(dirL, 1.15));
  // (the camera's line, as he is built: the flat of the blade turned to it)
  const cy0 = Math.cos(yaw);
  const sy0 = Math.sin(yaw);
  const lookL: V3 = [look[0] * cy0 + look[1] * sy0, -look[0] * sy0 + look[1] * cy0, look[2]];
  const placed = Cast.place(f, [0, 0, 0], yaw, () => {
    Cast.knight(f, {
      pelvis: [0, -0.6, 8.9],
      lean: 0.3,
      twist: 0.35,
      turn: -0.2,
      nod: 0.1,
      hands: [wr(gM, -1), wr(gO, 1)],
      elbows: [[-0.3, 0.2, -1], [0.3, 0.2, -1]],
      feet: [[-1.2, 3.4, 1.6], [0.9, -3.8, 0.75]],
      knees: [[0, -1, -0.3], [0.2, -1, 0.1]],
    }, { hand: 0, tip: tipL, two: true, face: scale3(lookL, -1) }, flap);
  }, OLD);
  const kcam = { look, up: [0, 0, 1] as V3, scale: 18.4 * k, ox: S(318, 0)[0], oy: S(0, 350)[1] };
  // (the arc of the swing first, behind him and his blade: a crescent of the friend's cyan, from behind his right shoulder
  // round to where the blade is now)
  {
    const hs = seen(kcam, placed.at(gM));
    const tip = seen(kcam, placed.at(tipL));
    const start = seen(kcam, placed.at([-7.5, 2.5, 15.5]));
    const R = Math.hypot(tip[0] - hs[0], tip[1] - hs[1]);
    const a1 = Math.atan2(tip[1] - hs[1], tip[0] - hs[0]);
    let a0 = Math.atan2(start[1] - hs[1], start[0] - hs[0]);
    while (a0 - a1 > Math.PI) a0 -= Math.PI * 2;
    while (a1 - a0 > Math.PI) a0 += Math.PI * 2;
    const arc = layerOf(p);
    const pts: Pt[] = [];
    const N = 24;
    for (let i = 0; i <= N; i++) {
      const a = a1 + ((a0 - a1) * i) / N;
      pts.push([hs[0] + Math.cos(a) * R * 1.03, hs[1] + Math.sin(a) * R * 1.03]);
    }
    for (let i = N; i >= 0; i--) {
      const u = i / N;
      const a = a1 + (a0 - a1) * u;
      const r = R * (1.03 - 0.34 * Math.sin(Math.min(1, u * 1.3) * Math.PI * 0.5) * (1 - u * 0.85));
      pts.push([hs[0] + Math.cos(a) * r, hs[1] + Math.sin(a) * r]);
    }
    arc.poly(pts, CYANS[2]);
    arc.each((x, y) => {
      const d = Math.hypot(x - hs[0], y - hs[1]) / R;
      const ang = Math.atan2(y - hs[1], x - hs[0]);
      let along = (ang - a1) / (a0 - a1);
      if (along < 0) along += Math.PI * 2 / Math.abs(a0 - a1);
      return d > 0.97 ? CYANS[0] : d > 0.88 ? CYANS[1] : along > 0.7 && dot(x, y, 0.5, 3) ? '#00000000' : undefined;
    });
    over(p, arc, null);
  }
  f.draw(p, kcam, { cel: COMIC, at: [9, -3, 9], hard: 1, fill: [0.4, -1, 0.3], fillK: 0.32, rim: '#ffb060', rimFrom: [1, -0.3] });
}

// =============================================================================================
// PAGE 7: THE DOORS. Through the gate under its arch; the armourer shoulders one great door shut, your hero shoves the
// other; through the last crack, pink eyes and a clawing hand; two hands heave the great bar up.
// PAGE 8: BARRED. The bar home across the doors; dust in the lantern's light; the company slumped against the doors,
// panting, your hero in the middle. "Barred, just in time." Last, along its foot: the dark, and the old wordsmith's light far
// down in it. "The old wordsmith had gone on ahead... down into the dark."

const OAK: Tones = [INK, '#1c120c', '#2e1e12', '#46301c', '#62442a', '#82603a'];
const IRONS: Tones = [INK, '#16161e', '#2a2a36', '#4a4a5a', '#7a7a8e', '#b4b4c8'];

/**
 * A great door's oak, in the polygon `pts`: planks `pw` wide standing upright from `x0` (dark seams between them, the grain
 * down them), iron bands across at the heights in `bandsAt` (each `bh` high, studded); lit by `lit`.
 */
function paintDoor(p: Px, pts: readonly Pt[], x0: number, pw: number, bandsAt: readonly number[], bh: number, lit: (x: number, y: number) => number, seed: number, persp?: { x1: number; far: number; mid: number }): void {
  const l = layerOf(p);
  l.poly(pts, OAK[2]);
  l.each((x, y) => {
    // (turned away from us, if it is: further across it, everything on it smaller toward the line through its middle)
    const v = persp ? clamp01((x + 0.5 - x0) / (persp.x1 - x0)) : 0;
    const sc = persp ? 1 + (persp.far - 1) * v : 1;
    const yy = persp ? persp.mid + (y + 0.5 - persp.mid) / sc : y + 0.5;
    const u = persp ? (v * (persp.x1 - x0) * (1 + persp.far) * 0.5 / ((1 + sc) * 0.5)) / pw : (x + 0.5 - x0) / pw;
    const plank = Math.floor(u);
    const f = u - plank;
    const L = lit(x, y) + (hash(plank, 0, seed) - 0.5) * 0.18 + (fbm(x / 2, y / 14, seed + plank) - 0.5) * 0.3;
    for (const by of bandsAt) {
      if (Math.abs(yy - by) < bh / 2) {
        const stud = Math.abs(f - 0.5) < 0.16 && Math.abs(yy - by) < bh * 0.22;
        if (stud) return IRONS[Math.min(5, 3 + Math.round(L * 2))];
        return Math.abs(yy - by) > bh / 2 - 1 ? INK : IRONS[Math.max(1, Math.min(5, Math.floor(1 + L * 4)))];
      }
    }
    if (f < 0.07) return INK;
    if (f < 0.16) return OAK[1];
    return OAK[Math.max(1, Math.min(5, Math.floor(1.5 + L * 4)))];
  });
  over(p, l, INK, 0, 0, 2);
}

/** The armourer standing, sculpted into `f`: leaning `lean` into a door at x = `door` (his hands flat on it), up to his shoulder. */
/**
 * The armourer (art/cast.ts) at `o` (old measure), shouldering the door at x = `door` shut: his left shoulder to it, his
 * body leant over into it, his feet planted out away from it and driving; his left hand flat on it high up, his right
 * across his chest flat on it too; his face to us, straining.
 */
function sculptArmourer(f: Figure, o: V3, lean: number, door: number, t: number): void {
  const breath = Math.sin(t * 4) * 0.04;
  const D = door / OLD;
  Cast.place(f, o, 0, () => {
    // (his left shoulder to the door, his whole weight leant into it: both hands flat on it before his chest, the left
    // high by his shoulder, the right across him lower; his feet driven back on the flags, the back leg straight)
    Cast.armourer(f, {
      pelvis: [-2.6, 0.2, 8.1],
      side: 0.62 + breath,
      lean: 0.12,
      twist: 0.25,
      turn: -0.3 * lean,
      nod: 0.15,
      hands: [[D - 0.35, -2.3, 11.6], [D - 0.35, -0.9, 13.6]],
      elbows: [[-0.3, -1, -0.6], [0, 0.4, -1]],
      fingers: [[0.1, -0.2, 1], [0, -0.2, 1]],
      palms: [[1, 0, 0], [1, 0, 0]],
      feet: [[-7.6, -0.7, 0.75], [-3.4, 1.1, 0.75]],
      knees: [[-0.4, -1, 0.1], [0.4, -1, 0.4]],
    }, ['flat', 'flat']);
  }, OLD);
}

export function paintThroughGate(p: Px, t: number): void {
  const W = p.w;
  const H = p.h;
  const S = (x: number, y: number): Pt => [(x / 392) * W, (y / 118) * H];
  const k = W / 392;
  const flick = 0.85 + 0.15 * Math.sin(t * 9.1);
  // THE BURNING WAGON going in under the gate: seen from the road before it, the gatehouse filling the box (the one prison,
  // sculpted, a metre a unit, its stones in courses), its two towers either side of the arch; the wagon sculpted with it,
  // its horse and its front gone in under the arch into the dark of the passage, its back end still out, its canvas
  // afire, the flames licking up the arch's face and lighting the stone round it
  const f = new Figure();
  sculptPrison(f, [0, 0, 0], 0, true, false);
  const wp = Cast.place(f, [-24, -1.0, 0], Math.PI / 2, () => sculptWagon(f, [0, 0, 0], 0, { roll: -t * 7, horse: { ph: t * 9 + 2.83, gallop: true }, burn: 0.85, burnAt: [-6, 0, 11], driver: 'armourer' }), 0.25);
  const cam = { look: unit([0.08, 1, -0.06]), up: [0, 0, 1] as V3, scale: 12.5 * k, ox: 0, oy: 0, persp: 40 };
  const g0 = seen(cam, [-24, -1.9, 0]);
  cam.ox = S(206, 0)[0] - g0[0];
  cam.oy = S(0, 114)[1] - g0[1];
  const fire3 = wp.at([-6, 0, 12]);
  const blaze = seen(cam, fire3);
  const sky = layerOf(p);
  sky.rect(0, 0, W, H, DUSK[0]);
  bands(sky, DUSK, (x, y) => -0.05 + strata(x, y, 1708));
  sky.each((x, y) => (hash(x, y, 1403) > 0.993 ? '#c8c4f0' : undefined));
  over(p, sky, null);
  f.draw(p, cam, { at: add3(fire3, [0, -4, 1]), hard: 1, fill: [-0.3, -1, 0.3], fillK: 0.3, rim: '#ffb060', rimFrom: [-1, -0.4] });
  // (the fire's light over the stone round the arch, and the fire off the wagon's canvas licking up the arch's face)
  shine(p, blaze[0], blaze[1], 90 * k * flick, '#ff8a2a', 2, 0.2);
  const along: Pt[] = [];
  for (let j = 0; j < 16; j++) {
    const a2 = 0.3 + hash(j, 1, 1410) * 2.5;
    along.push(seen(cam, wp.at([-8.2 + hash(j, 2, 1410) * 5, -Math.cos(a2) * 3.3, 5.4 + Math.sin(a2) * 6.6])));
  }
  paintFlames(p, along, 26 * k, 0.05, t, 1411);
  for (let j = 0; j < 24; j++) {
    const x = blaze[0] + (hash(j, 1, 1407) - 0.5) * 70 * k;
    const y = blaze[1] - ((hash(j, 2, 1407) * 50 + t * 30 + j * 7) % 60) * k;
    p.set(Math.round(x), Math.round(y), j % 3 ? '#ffc040' : '#fff3c0');
  }
  caption(p, 'Through the gate...', Math.round(6 * k), Math.round(6 * k), 120);
}

export function paintArmourerDoor(p: Px, t: number): void {
  const W = p.w;
  const H = p.h;
  const S = (x: number, y: number): Pt => [(x / 192) * W, (y / 111) * H];
  const k = W / 192;
  const lamp = S(40, 10);
  const lit = (x: number, y: number): number => glow(x, y, lamp[0], lamp[1], W * 1.1);
  p.rect(0, 0, W, H, '#100c1c');
  bands(p, ['#0a0812', '#100c1c', '#1a1428', '#2a1e30'], (x, y) => 0.15 + (1 - x / W) * 0.45 + (1 - y / H) * 0.15 + (fbm(x / 10, y / 18, 1410) - 0.5) * 0.15);
  // the great door, its leaf turned from us as it swings shut, at the right; its thick edge toward us, lit
  paintDoor(p, [S(124, -4), S(196, 6), S(196, 106), S(124, 116)], S(124, 0)[0], 13 * k, [S(0, 24)[1], S(0, 86)[1]], 7 * k, (x, y) => lit(x, y) * 1.1, 1411, { x1: S(196, 0)[0], far: 0.82, mid: S(0, 56)[1] });
  over(p, solid(p, [S(116, -4), S(124, -4), S(124, 116), S(116, 116)], OAK, [-0.8, -0.4, 0.4], { round: 0.4, hard: 1, extra: (x, y) => lit(x, y) * 0.6 }), INK);
  // (the flags of the passage's floor under him, going back into the dark)
  const fl = layerOf(p);
  fl.poly([S(-4, 92), S(124, 96), S(124, 116), S(-4, 116)], '#1a1426');
  bands(fl, ['#0a0812', '#140f1e', '#1e1828', '#2a2232'], (x, y) => 0.25 + lit(x, y) * 0.8 + (y - S(0, 92)[1]) / H * 1.2);
  fl.each((x, y) => (Math.abs(((x - W * 0.3) * 0.12 + (y - S(0, 92)[1]) * 0.9) % (9 * k)) < 0.8 || Math.round(y - S(0, 92)[1]) % Math.round(7 * k) === 0 ? '#08060e' : undefined));
  over(p, fl, null);
  const f = new Figure();
  sculptArmourer(f, [0, 0, 0], 0.55, 2.2, t);
  f.draw(p, { look: unit([-0.15, 1, -0.12]), up: [0, 0, 1], scale: 9.6 * k, ox: S(102, 0)[0], oy: S(0, 104)[1] }, { cel: COMIC, at: [-6, -5, 14], hard: 1, fill: [0.5, -1, 0.2], fillK: 0.3, rim: '#ffb060', rimFrom: [-1, -0.4] });
}

export function paintHeroDoor(p: Px, t: number): void {
  const W = p.w;
  const H = p.h;
  const S = (x: number, y: number): Pt => [(x / 192) * W, (y / 111) * H];
  const k = W / 192;
  const lamp = S(160, 10);
  const lit = (x: number, y: number): number => glow(x, y, lamp[0], lamp[1], W * 1.1);
  p.rect(0, 0, W, H, '#100c1c');
  bands(p, ['#0a0812', '#100c1c', '#1a1428', '#2a1e30'], (x, y) => 0.15 + (x / W) * 0.45 + (1 - y / H) * 0.15 + (fbm(x / 10, y / 18, 1420) - 0.5) * 0.15);
  paintDoor(p, [S(-4, 6), S(68, -4), S(68, 116), S(-4, 106)], S(-4, 0)[0], 13 * k, [S(0, 24)[1], S(0, 86)[1]], 7 * k, (x, y) => lit(x, y) * 1.1, 1421, { x1: S(68, 0)[0], far: 1.0, mid: S(0, 56)[1] });
  over(p, solid(p, [S(68, -4), S(76, -4), S(76, 116), S(68, 116)], OAK, [0.8, -0.4, 0.4], { round: 0.4, hard: 1, extra: (x, y) => lit(x, y) * 0.6 }), INK);
  // your hero, his right shoulder to the door, leant over into it, his feet driving; his right hand flat on it high up, his
  // left across his chest flat on it; his helm turned to us
  const f = new Figure();
  const D = (S(74, 0)[0] - S(108, 0)[0]) / (9.6 * k) / OLD;
  const flap = Math.sin(t * 3.1);
  Cast.place(f, [0, 0, 0], 0, () => {
    // (his right shoulder to the door, his weight leant into it: both hands flat on it, the right high by his shoulder,
    // the left across him lower; his feet driven back on the flags, the back leg straight)
    Cast.knight(f, {
      pelvis: [D + 6.4, 0.2, 8.3],
      side: -0.62,
      lean: 0.12,
      twist: -0.25,
      turn: 0.25,
      nod: 0.1,
      hands: [[D + 0.4, -0.9, 13.6], [D + 0.4, -2.3, 11.6]],
      elbows: [[0, 0.4, -1], [0.3, -1, -0.6]],
      fingers: [[0, -0.2, 1], [-0.1, -0.2, 1]],
      palms: [[-1, 0, 0], [-1, 0, 0]],
      feet: [[D + 7.2, 1.1, 0.75], [D + 11.4, -0.7, 0.75]],
      knees: [[-0.4, -1, 0.4], [0.4, -1, 0.1]],
    }, null, flap, ['flat', 'flat']);
  }, OLD);
  // (the flags of the passage's floor under him)
  const fl = layerOf(p);
  fl.poly([S(68, 96), S(196, 92), S(196, 116), S(68, 116)], '#1a1426');
  bands(fl, ['#0a0812', '#140f1e', '#1e1828', '#2a2232'], (x, y) => 0.25 + lit(x, y) * 0.8 + (y - S(0, 92)[1]) / H * 1.2);
  fl.each((x, y) => (Math.abs(((x - W * 0.7) * -0.12 + (y - S(0, 92)[1]) * 0.9) % (9 * k)) < 0.8 || Math.round(y - S(0, 92)[1]) % Math.round(7 * k) === 0 ? '#08060e' : undefined));
  over(p, fl, null);
  f.draw(p, { look: unit([0.15, 1, -0.12]), up: [0, 0, 1], scale: 9.6 * k, ox: S(108, 0)[0], oy: S(0, 104)[1] }, { cel: COMIC, at: [6, -5, 14], hard: 1, fill: [-0.5, -1, 0.2], fillK: 0.3, rim: '#ffb060', rimFrom: [1, -0.4] });
}

export function paintGap(p: Px, t: number): void {
  const W = p.w;
  const H = p.h;
  const S = (x: number, y: number): Pt => [(x / 192) * W, (y / 115) * H];
  const k = W / 192;
  const flick = 0.85 + 0.15 * Math.sin(t * 9.1);
  const gx = S(96, 0)[0];
  // THE CRACK between the two doors: the fire outside, red, through it
  p.rect(0, 0, W, H, '#5a2650');
  bands(p, DUSK, (x, y) => 0.4 + glow(x, y, gx, H * 0.6, W * 0.3) * 0.8 * flick);
  const lit = (x: number, y: number): number => glow(x, y, gx, H * 0.5, W * 0.35) * flick;
  // (one of them pressed to the crack, black against the fire: his cowl and its point, his shoulder)
  const cowl = layerOf(p);
  cowl.poly(loop([S(78, 70), S(80, 36), S(86, 18), S(95, 4), S(104, 16), S(110, 34), S(114, 70)], 4, [0, 3, 6]), '#0a0612');
  cowl.poly([S(70, 120), S(74, 62), S(120, 58), S(124, 120)], '#0a0612');
  over(p, cowl, null);
  paintDoor(p, [S(-4, -4), S(86, -4), S(86, 120), S(-4, 120)], S(-4, 0)[0], 15 * k, [S(0, 24)[1], S(0, 90)[1]], 8 * k, lit, 1431);
  paintDoor(p, [S(106, -4), S(196, -4), S(196, 120), S(106, 120)], S(106, 0)[0], 15 * k, [S(0, 24)[1], S(0, 90)[1]], 8 * k, lit, 1433);
  // (the fire's line down each door's edge)
  for (let y = 0; y < H; y++) {
    p.set(Math.round(S(86, 0)[0]) + 2, y, '#ff8a2a');
    p.set(Math.round(S(106, 0)[0]) - 3, y, '#ff8a2a');
  }
  // the eyes in the crack
  for (const [ex, ey, sd] of [[S(92, 32)[0], S(0, 32)[1], -1], [S(100, 32)[0], S(0, 32)[1], 1]] as const) {
    // (each a slash of the enemy's pink, slanting down to the middle, its light bleeding round it)
    shine(p, ex, ey, 9 * k, '#c02a6a', 0, 0.35);
    const n = Math.round(4 * k);
    for (let i = 0; i <= n; i++) {
      const x = Math.round(ex - sd * (i - n / 2));
      const y = Math.round(ey + (i - n / 2) * 0.45 * -1);
      p.set(x, y, i > 0 && i < n ? '#ffd0e4' : '#ff5aa0').set(x, y + 1, '#ff5aa0');
    }
  }
  // THE HAND through it: a bony forearm, the claws hooked at us
  const f = new Figure();
  const bone = f.stuff({ tones: [INK, '#2e2638', '#5e5268', '#968aa0', '#cabed0', '#f0e8f0'], crease: 0.5 });
  const robe = f.stuff({ tones: [INK, '#16101e', '#241a30', '#3e2e4e', '#544066', '#76587e'], crease: 0.9 });
  const reach = Math.sin(t * 2.2) * 0.2;
  // (his arm forced in through the crack from his side, slantwise: the ragged sleeve fallen back to the elbow, the bony
  // forearm bare from it, the hand hooked round the edge of the near door, its claws at us)
  f.rod(robe, [-0.15, 3.4, 6.5], [-0.05, 1.1, 6.35], 0.3, 0.27, 0.2);
  for (const [dx, dz] of [[-0.22, -0.25], [0.05, -0.32], [0.24, -0.12], [0.18, 0.22]] as const) f.rod(robe, [-0.05, 1.1, 6.35], [dx, 0.75, 6.35 + dz], 0.12, 0.03, 0.08);
  const wrist: V3 = [0.42, -1.0 - reach, 5.95];
  forearm(f, bone, [-0.05, 1.1, 6.3], wrist, 0.2, [1, 0, 0]);
  hand(f, bone, frameAt(wrist, unit([0.7, -0.62, -0.2]), [0, 0.25, 1]), 0.95, 'claw');
  f.draw(p, { look: unit([0.1, 1, 0.25]), up: [0, 0, 1], scale: 27 * k, ox: gx, oy: S(0, 206)[1] }, { cel: COMIC, at: [1, 3, 7], hard: 1, fill: [-0.4, -1, 0.5], fillK: 0.6, rim: '#ff8a2a', rimFrom: [0, -1] });
}

/**
 * THE BAR and its BRACKETS, sculpted (the doors' face the plane y 0, facing -y; up z): a beam of oak squared and heavy,
 * `half` long each way from x 0, its arrises worn round, the grain along it, a band of iron near each end; set at `z` (and
 * tilted `tilt`, as it is heaved up); the brackets at `xs`, each a strap of iron bent into a U standing out from the door,
 * open at its top, bolted through its two flanges. Ends of the bar's own grain lines.
 */
function sculptDoorBar(f: Figure, half: number, z: number, tilt: number, xs: readonly number[]): void {
  const oak = f.stuff({ tones: OAK, crease: 0.8 });
  const iron = f.stuff({ tones: [INK, '#121218', '#22222c', '#363644', '#55556a', '#8a8aa0'], shine: 0.25, crease: 0.5 });
  const ax = frame([Math.sin(tilt) * -1, 0, 1], [Math.cos(tilt), 0, Math.sin(tilt)]);
  const c: V3 = [0, -0.72, z];
  const along = (u: number): V3 => [c[0] + Math.cos(tilt) * u, c[1], c[2] + Math.sin(tilt) * u];
  f.block(oak, c, [half, 0.62, 0.56], 0.16, ax, 0.1);
  for (const e of [-1, 1]) {
    const q = along(e * (half - 1.1));
    f.block(iron, q, [0.16, 0.68, 0.62], 0.06, ax, 0.04);
    for (const dz of [-0.3, 0.3]) f.egg(iron, add3(q, [0, -0.7, dz]), [0.08, 0.05, 0.08], axes(), 0.02);
  }
  for (const [dz, dy] of [[0.25, -1.35], [-0.15, -1.35], [0.4, -1.0]] as const) {
    f.line([add3(along(-half + 0.3), [0, dy - c[1] + c[1], dz]), add3(along(-half * 0.2), [0, dy - c[1] + c[1], dz + 0.02]), add3(along(half - 0.4), [0, dy - c[1] + c[1], dz - 0.03])], '#1c120c', 1);
  }
  for (const x of xs) {
    // (the U: its two flanges flat on the door either side, bolted; its arms out from the door; its bottom under the bar;
    // its front up the bar's face, a little short of its top)
    const zb = z - 0.56 - 0.12 + Math.sin(tilt) * x;
    for (const sd of [-1, 1]) {
      f.block(iron, [x + sd * 0.62, -0.06, zb + 0.55], [0.22, 0.06, 0.42], 0.05, axes(), 0.03);
      for (const dz of [0.25, 0.85]) f.egg(iron, [x + sd * 0.62, -0.14, zb + dz], [0.08, 0.06, 0.08], axes(), 0.02);
    }
    f.block(iron, [x, -0.72, zb], [0.2, 0.76, 0.1], 0.05, axes(), 0.03);
    f.block(iron, [x, -1.42, zb + 0.42], [0.2, 0.09, 0.52], 0.08, axes(), 0.03);
    f.egg(iron, [x, -1.53, zb + 0.6], [0.08, 0.05, 0.08], axes(), 0.02);
    f.block(iron, [x, -1.3, zb + 0.95], [0.21, 0.2, 0.07], 0.06, axes(), 0.03);
  }
}

export function paintBar(p: Px, t: number): void {
  const W = p.w;
  const H = p.h;
  const S = (x: number, y: number): Pt => [(x / 192) * W, (y / 115) * H];
  const k = W / 192;
  const heave = (Math.sin(t * 1.8) * 0.5 + 0.5) * 0.25;
  const lamp = S(20, 0);
  const lit = (x: number, y: number): number => glow(x, y, lamp[0], lamp[1], W * 1.3);
  paintDoor(p, [S(-4, -4), S(196, -4), S(196, 120), S(-4, 120)], S(-4, 0)[0], 16 * k, [S(0, 96)[1]], 8 * k, lit, 1441);
  stroke(p, [S(96, -4), S(96, 120)], 2);
  // THE BRACKETS on the doors, waiting for it, and THE BAR heaved up toward them; the two hands under it
  const f = new Figure();
  const oak = f.stuff({ tones: OAK, crease: 0.8 });
  const iron = f.stuff({ tones: [INK, '#121218', '#22222c', '#363644', '#55556a', '#8a8aa0'], shine: 0.25 });
  const skin = f.stuff({ tones: SKIN_K, crease: 0.5 });
  const steel = f.stuff({ tones: [INK, '#22204e', '#3a3478', '#5a54a0', '#7a74c8', '#a8a2e8', '#e6e2ff'], shine: 0.45 });
  const shirt = f.stuff({ tones: SHIRT_K });
  const mail = f.stuff({ tones: [INK, '#1a1838', '#28245a', '#4a4690', '#7e7ac0', '#b8b4e8'] });
  // (the brackets bolted to the doors, waiting for it, high; the bar heaved up toward them, a little tilted)
  const by = 0.5 - heave;
  sculptDoorBar(f, 7.5, 0.9 + heave * 5, -0.05, []);
  for (const x of [-4.6, 4.6]) {
    for (const sd of [-1, 1]) {
      f.block(iron, [x + sd * 0.62, -0.06, 2.65], [0.22, 0.06, 0.42], 0.05, axes(), 0.03);
      for (const dz of [2.35, 2.95]) f.egg(iron, [x + sd * 0.62, -0.14, dz], [0.08, 0.06, 0.08], axes(), 0.02);
    }
    f.block(iron, [x, -0.72, 2.1], [0.2, 0.76, 0.1], 0.05, axes(), 0.03);
    f.block(iron, [x, -1.42, 2.52], [0.2, 0.09, 0.52], 0.08, axes(), 0.03);
    f.egg(iron, [x, -1.53, 2.7], [0.08, 0.05, 0.08], axes(), 0.02);
    f.block(iron, [x, -1.3, 3.05], [0.21, 0.2, 0.07], 0.06, axes(), 0.03);
  }
  // the armourer's great hand under its left end, palm up against it, his bare forearm up from his rolled sleeve; your
  // hero's plum glove under its right, his steel vambrace, the mail at his elbow (art/anatomy.ts: hands of a man's measure)
  const zb = 1.0 + heave * 5 - 0.55;
  const plum = f.stuff({ tones: [INK, '#24102a', '#3a1c40', '#6e3a5c', '#a8607a', '#c88aa0'], crease: 0.5 });
  const wA: V3 = [-3.1, -1.55, zb - 0.7];
  hand(f, skin, frameAt(wA, unit([0.1, 0.55, 0.85]), [0, -0.85, 0.5]), 0.95, 'grip');
  forearm(f, skin, [-3.5, -1.9, -2.6], wA, 0.5, [-1, 0, 0]);
  for (let i = 0; i < 7; i++) {
    const an = (i / 7) * Math.PI * 2;
    f.egg(shirt, add3([-3.55, -2.0, -2.9], [Math.cos(an) * 0.55, Math.sin(an) * 0.45, (i % 2) * 0.08]), [0.24, 0.24, 0.2], axes(), 0.15);
  }
  f.rod(shirt, [-3.55, -2.0, -3.0], [-3.6, -2.1, -4.6], 0.62, 0.66, 0.3);
  const wK: V3 = [3.1, -1.55, zb - 0.68];
  hand(f, plum, frameAt(wK, unit([-0.1, 0.55, 0.85]), [0, -0.85, 0.5]), 0.85, 'grip');
  forearm(f, steel, [3.45, -1.9, -2.6], wK, 0.5, [1, 0, 0]);
  // (the vambrace's plate edges, and the red of his tabard's sleeve-less shoulder far below: his, not theirs)
  for (const u of [0.25, 0.7]) {
    const c = lerp3([3.45, -1.9, -2.6], wK, u);
    const ring: V3[] = [];
    for (let i = 0; i <= 10; i++) {
      const an = (i / 10) * Math.PI * 2;
      ring.push(add3(c, [Math.cos(an) * 0.42, Math.sin(an) * 0.42, 0]));
    }
    f.line(ring, '#22204e', 1);
  }
  f.egg(steel, [3.5, -1.95, -2.6], [0.5, 0.5, 0.45], axes(), 0.1);
  f.rod(mail, [3.5, -1.95, -2.8], [3.6, -2.1, -4.6], 0.5, 0.55, 0.3);
  void by;
  f.draw(p, { look: unit([0.1, 1, 0.12]), up: [0, 0, 1], scale: 17 * k, ox: S(96, 0)[0], oy: S(0, 74)[1] }, { cel: COMIC, at: [-6, -7, 7], hard: 1, fill: [0.4, -1, 0.3], fillK: 0.5, rim: '#ffb060', rimFrom: [-1, -0.4] });
}

/** A figure of the company slumped at the doors, in silhouette against the lamplight: its outline, its eyes, where. */
function silhouette(p: Px, pts: readonly Pt[], eyes: readonly Pt[], eye: readonly string[], rim: string, lamp: Pt): void {
  const l = layerOf(p);
  l.poly(loop(pts, 3), '#0a0814');
  l.each((x, y) => {
    const dx = lamp[0] - x;
    const dy = lamp[1] - y;
    const n = Math.hypot(dx, dy) || 1;
    const nx = Math.round(x + dx / n * 1.6);
    const ny = Math.round(y + dy / n * 1.6);
    return !l.has(nx, ny) ? rim : undefined;
  });
  over(p, l, INK);
  for (const [x, y] of eyes) p.set(Math.round(x), Math.round(y), eye[0]).set(Math.round(x) + 1, Math.round(y), eye[1]);
}

export function paintBarred(p: Px, t: number): void {
  const W = p.w;
  const H = p.h;
  const S = (x: number, y: number): Pt => [(x / 392) * W, (y / 277) * H];
  const k = W / 392;
  const lamp = S(40, 64);
  const lit = (x: number, y: number): number => glow(x, y, lamp[0], lamp[1], W * 0.9) * (0.92 + 0.08 * Math.sin(t * 5.3));
  // THE DOORS, shut, filling the box; THE BAR home across them in its brackets
  p.rect(0, 0, W, H, '#100c1c');
  paintDoor(p, [S(-4, -4), S(196, -4), S(196, 230), S(-4, 230)], S(-4, 0)[0], 18 * k, [S(0, 40)[1], S(0, 158)[1]], 10 * k, (x, y) => lit(x, y) * 1.3, 1451);
  paintDoor(p, [S(196, -4), S(396, -4), S(396, 230), S(196, 230)], S(196, 0)[0], 18 * k, [S(0, 40)[1], S(0, 158)[1]], 10 * k, (x, y) => lit(x, y) * 1.3, 1453);
  {
    // (the bar, sculpted (sculptDoorBar), home in its four brackets, two on each door)
    const bf = new Figure();
    const U = 20;
    sculptDoorBar(bf, 176 / U, 0, 0, [70, 186, 206, 322].map((x) => (x - 196) / U));
    bf.draw(p, { look: unit([0, 1, -0.18]), up: [0, 0, 1], scale: U * k, ox: S(196, 0)[0], oy: S(0, 110)[1] }, { at: [(40 - 196) / U, -6, (110 - 64) / U], hard: 1, fill: [0.3, -1, 0.3], fillK: 0.35, rim: '#ffc070', rimFrom: [-1, -0.4] });
  }
  // the floor of the passage
  const fl = layerOf(p);
  fl.poly([S(-4, 230), S(396, 230), S(396, 281), S(-4, 281)], MUD[1]);
  bands(fl, MUD, (x, y) => lit(x, y) * 1.2 + (fbm(x / 6, y / 3, 1455) - 0.5) * 0.3);
  over(p, fl, INK);
  // THE LANTERN hung on the wall at the left, and the dust hanging in its light
  paintLantern(p, lamp[0], lamp[1], Math.sin(t * 1.7) * 0.04, lamp[0], lamp[1] - 30 * k);
  for (let j = 0; j < 60; j++) {
    const x = (hash(j, 1, 1457) * W + Math.sin(t * 0.6 + j) * 6 * k) % W;
    const y = (hash(j, 2, 1457) * H * 0.8 + t * 3 * k * hash(j, 3, 1457)) % (H * 0.8);
    if (lit(x, y) > 0.08) p.set(Math.round(x), Math.round(y), lit(x, y) > 0.3 ? '#fff3c0' : '#c8a878');
  }
  // THE COMPANY against the doors, panting: the armourer sat down against them, the mystic sunk down, your hero in the middle
  // leaning on his sword, his head down; the wordsmith with a hand up on the bar; the stranger off on his own, his gold eyes
  const from: V3 = unit([-1, -0.7, 0.7]);
  const light = { cel: COMIC, from, hard: 1, fill: [0.3, -1, 0.2] as V3, fillK: 0.16, rim: '#ffc070', rimFrom: [-1, -0.3] as const };
  const at = (x: number, y: number, sc: number, look: V3) => ({ look: unit(look), up: [0, 0, 1] as V3, scale: sc * k * 1.25, ox: S(x, 0)[0], oy: S(0, y)[1] });
  const pant = (r: number, ph: number): number => Math.sin(t * r + ph) * 0.06;
  // (each lit by the lantern on the wall at the left: from up there, and the further from it the dimmer)
  const lampLight = (x: number): typeof light => ({ ...light, from: unit([-(x - 40) / 160 - 0.2, -0.8, 0.7]), fillK: 0.16 * clamp01(1.3 - x / 300) });
  // THE STRANGER, apart, furthest back, in the shadow at the right: his shoulder to the wall by the doors' edge, his arms
  // folded under his cloak, his gold eyes on the rest of them
  {
    const f = new Figure();
    Cast.place(f, [0, 0, 0], -0.35, () => Cast.stranger(f, {
      side: -0.1,
      twist: 0.15,
      turn: 0.35,
      hands: [[0.7, -1.7, 12.0], [-0.7, -1.6, 12.4]],
      elbows: [[-1, -0.3, -0.6], [1, -0.3, -0.6]],
      feet: [[-0.9, -0.4, 0.75], [1.3, -1.0, 0.75]],
    }), OLD);
    f.draw(p, at(360, 240, 8.2, [-0.25, 1, -0.12]), lampLight(380));
  }
  // THE WORDSMITH, standing back against the door, his hand up on the bar over him, getting his breath
  {
    const f = new Figure();
    Cast.place(f, [0, 0, 0], 0.2, () => Cast.townWordsmith(f, {
      lean: -0.08 + pant(3.9, 2),
      nod: -0.25,
      side: 0.08,
      hands: [[-2.0, 0.6, 16.4], [2.2, -0.2, 8.8]],
      elbows: [[-1, 0.3, 0], [1, 0.3, -0.5]],
      palms: [[0, -1, 0], [-1, 0, 0]],
      fingers: [[0, 0, 1], [0, 0, -1]],
    }), OLD);
    f.draw(p, at(282, 252, 10.6, [0.25, 1, -0.05]), lampLight(282));
  }
  // THE MYSTIC sunk down cross-legged, his hands in his lap, his head bowed
  {
    const f = new Figure();
    Cast.place(f, [0, 0, 0], -0.25, () => Cast.mystic(f, {
      pelvis: [0, 0, 1.9],
      lean: 0.24 + pant(3.6, 1),
      nod: -0.32,
      hands: [[-0.5, -2.5, 3.3], [0.5, -2.4, 3.5]],
      elbows: [[-1, 0.3, -1], [1, 0.3, -1]],
      palms: [[0, 0, 1], [0, 0, 1]],
      fingers: [[0.6, -0.6, 0], [-0.6, -0.6, 0]],
      feet: [[0.7, -2.4, 0.7], [-0.7, -2.0, 0.85]],
      knees: [[-1, -0.6, -0.4], [1, -0.6, -0.4]],
    }, ['flat', 'flat'], { seated: true }), OLD);
    f.draw(p, at(128, 256, 11.0, [0.2, 1, -0.05]), lampLight(128));
  }
  // YOUR HERO, in the middle and a step nearer: down on one knee, both hands on the pommel of his sword, its point on the
  // floor before him, his weight on it, his helm bowed over his hands, panting
  {
    const f = new Figure();
    const pt = Math.sin(t * 4.2) * 0.06;
    Cast.place(f, [0, 0, 0], 0.25, () => Cast.knight(f, {
      pelvis: [0, 0.6, 6.2],
      lean: 0.38 + pt,
      nod: 0.45,
      hands: [[-0.3, -3.3, 10.1], [0.3, -3.2, 11.0]],
      elbows: [[-1, 0.2, -0.6], [1, 0.2, -0.6]],
      feet: [[-1.0, 4.0, 1.1], [1.1, -2.6, 0.75]],
      knees: [[0, -1, -0.6], [0, -1, 0.8]],
    }, { hand: 0, tip: [0, -4.6, 0.2], two: true, face: [0, -1, 0] }, Math.sin(t * 1.5) * 0.2), OLD);
    f.draw(p, at(222, 270, 12.6, [0.1, 1, -0.08]), lampLight(222));
  }
  // THE ARMOURER nearest, sat down on the floor, his back to the door, his knees up, his forearms over them, his head down
  {
    const f = new Figure();
    Cast.place(f, [0, 0, 0], 0.25, () => Cast.armourer(f, {
      pelvis: [0, 0.6, 1.75],
      lean: -0.12 + pant(4, 0),
      nod: 0.45,
      hands: [[-1.2, -3.6, 4.6], [1.3, -3.5, 4.7]],
      elbows: [[-1, 0, 0], [1, 0, 0]],
      fingers: [[0.3, -0.5, -1], [-0.3, -0.5, -1]],
      feet: [[-1.4, -4.6, 0.75], [1.5, -4.2, 0.75]],
      knees: [[-0.3, -0.4, 1], [0.3, -0.4, 1]],
    }, ['open', 'open']), OLD);
    f.draw(p, at(74, 276, 13.4, [-0.55, 1, -0.05]), lampLight(74));
  }
  // (the dark beyond the lamp's reach, over everything on the right: the comic's shadow, its dots)
  wash(p, '#05040a', (x, y) => clamp01(0.75 - lit(x, y) * 3.2) * 0.5);
  caption(p, 'Barred, just in time.', Math.round(6 * k), Math.round(6 * k), 120);
}

export function paintDark(p: Px, t: number): void {
  const W = p.w;
  const H = p.h;
  const S = (x: number, y: number): Pt => [(x / 392) * W, (y / 75) * H];
  const k = W / 392;
  const far = S(360, 52);
  const pulse = 0.7 + 0.3 * Math.sin(t * 2.3);
  const cy = (x: number, y: number): number => glow(x, y, far[0], far[1], W * 0.22) * pulse;
  p.rect(0, 0, W, H, '#05040a');
  // A PASSAGE going down away from us under the prison, arch after arch, each further and smaller, toward the one light far
  // down in it; the steps going down its floor; all of it dark but where his light touches
  for (let j = 7; j >= 0; j--) {
    const u = j / 7;
    const sc = 1 - u * 0.86;
    const cx = S(300 + u * 60, 0)[0];
    const top = S(0, 6 + u * 38)[1];
    const bot = S(0, 76 - u * 20)[1];
    const half = 60 * k * sc;
    const a = layerOf(p);
    // (each arch a band of stone round its opening, lit only where his light reaches it, fading off into the dark)
    const outer: Pt[] = loop([[cx - half * 1.25, bot + 2], [cx - half * 1.25, top + (bot - top) * 0.3], [cx, top - (bot - top) * 0.2], [cx + half * 1.25, top + (bot - top) * 0.3], [cx + half * 1.25, bot + 2]], 4, [0, 4]);
    const hole: Pt[] = loop([[cx - half, bot + 2], [cx - half, top + (bot - top) * 0.35], [cx, top], [cx + half, top + (bot - top) * 0.35], [cx + half, bot + 2]], 4, [0, 4]);
    a.poly(outer, '#0c0a14');
    a.each((x, y) => {
      if (inside(hole, x + 0.5, y + 0.5)) return '#00000000';
      const l = cy(x, y) * 2.2;
      return l > 0.55 ? '#1a4a50' : l > 0.3 ? '#123a40' : l > 0.12 && dot(x, y, (l - 0.12) / 0.18, 2) ? '#0e2a30' : '#0c0a14';
    });
    over(p, a, j === 0 ? INK : null);
  }
  for (let j = 0; j < 10; j++) {
    const u = j / 9;
    const y = S(0, 74 - u * 20)[1];
    const x0 = S(244 + u * 108, 0)[0];
    const x1 = S(360, 0)[0] + (1 - u) * 56 * k;
    for (let x = Math.round(x0); x < x1; x++) p.set(x, Math.round(y), dot(x, y, clamp01(cy(x, y) * 2.5), 2) ? '#123a40' : '#0c0a14');
  }
  // HIM, far down, small, his back to us, going down the steps; his staff up, and its light: a speck of the friend's cyan,
  // its soft glow round it (oldSmithFigure, sculpted)
  const fig = oldSmithFigure(Math.PI, 0, unit([0.1, 0.4, 1]), false, 19.2);
  const cam = { look: unit([0, 1, -0.12]), up: [0, 0, 1] as V3, scale: 0.8 * k, ox: far[0] - 2 * k, oy: far[1] + 9 * k };
  fig.f.draw(p, cam, { at: fig.head, hard: 1, fill: [0, -1, 0.3], fillK: 0.2, rim: CYANS[2], rimFrom: [0, -1] });
  const hs = seen(cam, fig.head);
  shine(p, hs[0], hs[1], 30 * k * pulse, CYANS[2], 2, 0.3);
  p.set(Math.round(hs[0]), Math.round(hs[1]), CYANS[0]).set(Math.round(hs[0]) + 1, Math.round(hs[1]), CYANS[1]).set(Math.round(hs[0]), Math.round(hs[1]) - 1, CYANS[1]);
  caption(p, 'The old wordsmith had gone on ahead... down into the dark.', Math.round(6 * k), Math.round(6 * k), 104);
}

function dt3(a: V3, b: V3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
function add3(a: V3, b: V3): V3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}
function sub3(a: V3, b: V3): V3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}
function scale3(a: V3, s: number): V3 {
  return [a[0] * s, a[1] * s, a[2] * s];
}

// =============================================================================================
// THE PAGES, as he saw them laid out (opening_layout.png)

export const PAGES: readonly (readonly BoxDef[])[] = [
  // PAGE 1
  [
    { x: 0, y: 0, w: 1, h: 0.58, paint: paintRoadUp, say: 'They followed the old wordsmith up the mountain...' },
    { x: 0, y: 0.58, w: 0.5, h: 0.42, paint: paintLanterns },
    { x: 0.5, y: 0.58, w: 0.5, h: 0.42, paint: paintFarAhead },
  ],
  // PAGE 2
  [
    { x: 0, y: 0, w: 0.5, h: 0.5, paint: paintArmourer },
    { x: 0.5, y: 0, w: 0.5, h: 0.5, paint: paintMystic },
    { x: 0, y: 0.5, w: 0.5, h: 0.5, paint: paintStranger },
    { x: 0.5, y: 0.5, w: 0.5, h: 0.5, paint: paintCompany },
  ],
  // PAGE 3
  [
    { x: 0, y: 0, w: 0.6, h: 1, paint: paintOldSmith, say: 'Up there. The altar sleeps in the old prison.' },
    { x: 0.6, y: 0, w: 0.4, h: 0.5, paint: paintEyes },
    { x: 0.6, y: 0.5, w: 0.4, h: 0.5, paint: paintGlint },
  ],
  // PAGE 4
  [{ x: 0, y: 0, w: 1, h: 1, paint: paintAmbush, say: 'The cult was waiting.' }],
  // PAGES 5 AND 6: one picture across both
  [{ x: 0, y: 0, w: 1, h: 1, paint: paintRun, across: true }],
  [],
  // PAGE 7
  [
    { x: 0, y: 0, w: 1, h: 0.34, paint: paintThroughGate, say: 'Through the gate...' },
    { x: 0, y: 0.34, w: 0.5, h: 0.33, paint: paintArmourerDoor },
    { x: 0.5, y: 0.34, w: 0.5, h: 0.33, paint: paintHeroDoor },
    { x: 0, y: 0.67, w: 0.5, h: 0.33, paint: paintGap },
    { x: 0.5, y: 0.67, w: 0.5, h: 0.33, paint: paintBar },
  ],
  // PAGE 8
  [
    { x: 0, y: 0, w: 1, h: 0.7, paint: paintBarred, say: 'Barred, just in time.' },
    { x: 0, y: 0.7, w: 1, h: 0.3, paint: paintDark, say: 'The old wordsmith had gone on ahead... down into the dark.' },
  ],
];

/** A spread (pages `k` and `k + 1`), `t` seconds on: the paper, its boxes painted and inked round, the spine's shadow. */
/**
 * Captions laid over the boxes of a page rather than in one box (a line of the telling running across two boxes): the page
 * (0 the first), its text, where its top left is (a share of the page's inner width and height), how wide it may run.
 */
export const PAGE_CAPTIONS: readonly { page: number; say: string; x: number; y: number; maxW: number }[] = [
  { page: 1, say: 'seeking the Meldstone, and the altar that wakes the words.', x: 0.02, y: 0.008, maxW: 176 },
];

export function paintSpread(k: number, t: number): Px {
  const PW = (SPREAD_W * DENSITY) / 2;
  const PH = SPREAD_H * DENSITY;
  const p = new Px(PW * 2, PH);
  // the paper, darkening into the spine
  p.rect(0, 0, PW * 2, PH, PAPER);
  wash(p, PAPER_DARK, (x) => {
    const d = Math.abs(x - PW) / 18;
    return d >= 1 ? 0 : Math.ceil((1 - d) * 3) / 3 * 0.8;
  });
  for (const page of [0, 1] as const) {
    for (const b of PAGES[k + page] ?? []) {
      const r = boxRect(b, page);
      const box = new Px(r.w, r.h);
      b.paint(box, t);
      // (the box's frame: a heavy ink line round it)
      over(p, box, INK, r.x, r.y, 2);
    }
    for (const c of PAGE_CAPTIONS) {
      if (c.page !== k + page) continue;
      const iw = PW - 2 * MARGIN;
      const ih = PH - 2 * MARGIN;
      caption(p, c.say, Math.round(page * PW + MARGIN + c.x * iw), Math.round(MARGIN + c.y * ih), c.maxW);
    }
  }
  return p;
}

// (unused yet)
void inside;
void lerp;
void mix;
void noise;
void sm;

/** (For looking at: the horse at the gallop and walking, with a man of the old measure beside it for its size.) */
export function wagonTest(p: Px, t: number): void {
  p.rect(0, 0, p.w, p.h, '#3a3450');
  const looks: V3[] = [[0.15, 1, -0.3], [-0.7, 0.7, -0.35], [0.8, 0.5, -0.25]];
  looks.forEach((lk, i) => {
    const f = new Figure();
    const r = sculptWagon(f, [0, 0, 0], 0, { roll: t, horse: { ph: t * 3, gallop: false }, lampSide: i === 1 ? -1 : 1, driver: true, burn: i === 2 ? 0.6 : 0 });
    void r;
    f.draw(p, { look: unit(lk), up: [0, 0, 1], scale: p.h / 30, ox: (p.w / 3) * (i + 0.5), oy: p.h * 0.7 }, { from: unit([-0.5, -0.8, 0.6]), hard: 1, fill: [0.6, -0.6, 0.2], fillK: 0.3 });
  });
}

export function roadProbe(p: Px): (m: number) => RoadAt {
  return paintRoad3D(p, p.w, p.h, p.w * 0.76, p.h * 0.34);
}

export function prisonTest(p: Px, t: number): void {
  void t;
  p.rect(0, 0, p.w, p.h, '#6a4a5a');
  const f = new Figure();
  sculptPrison(f, [0, 0, 0], 0.12);
  f.draw(p, { look: unit([0.1, 1, 0.08]), up: [0, 0, 1], scale: p.w / 90, ox: p.w * 0.52, oy: p.h * 0.72, persp: 260 }, { from: unit([0.35, 0.8, 0.6]), hard: 1, fill: [-0.2, -1, 0.3], fillK: 0.4, rim: KEEP_RIM, rimFrom: [0.3, -1] });
}

export function horseTest(p: Px, t: number): void {
  const light = { from: unit([-0.5, -0.8, 0.6]), hard: 1, fill: [0.6, -0.6, 0.2] as V3, fillK: 0.3 };
  for (const [i, gallop] of [[0, true], [1, false]] as const) {
    const f = new Figure();
    sculptHorse(f, [0, 0, 0], 0, t * 9 + 2.83 + i, gallop);
    f.draw(p, { look: unit([0.1, 1, -0.08]), up: [0, 0, 1], scale: 14, ox: 110 + i * 300, oy: 205 }, light);
  }
}

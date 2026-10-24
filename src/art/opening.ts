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
import { INK, band, bandBy, bands, balloon, caption, captionSize, clamp01, dot, facets, fbm, glow, halo, hash, inside, layerOf, lerp, limbSolid, loop, mix, noise, over, path, shadeSolid, sm, solid, wash } from './comic';
import type { Pt, Tones, V3 } from './comic';
import { Figure, axes, cross, unit } from './sdf';

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

// =============================================================================================
// PAGE 1, BOX 1: THE ROAD UP. Dusk. Switchbacks climb a mountain's face to a dark prison on a crag, black against the last of
// the light; two wagons with lanterns wind up the lowest bend; far above them on the road, a small figure with a cyan light.

/** The dusk sky, from the top of the picture down to the glow on the horizon. */
const DUSK: Tones = ['#0e0b22', '#171232', '#251842', '#3a1e4c', '#5a2650', '#86344e', '#b44e48', '#d8744a', '#eea25e'];
/** The far range, against the glow; the rim of light along its ridges. */
const FAR: Tones = ['#2a1f48', '#35264f', '#462e58'];
const FAR_RIM = '#9a4c5c';
/** The mountain the road climbs: its dark face, its faces turned to the glow. */
const ROCK: Tones = ['#0f0c1e', '#16122a', '#1f1936', '#2b2244', '#3d2e52'];
const ROCK_RIM = '#7a3e58';
/** The prison's stone, black on the sky, rimmed with the glow. */
const KEEP: Tones = ['#0a0816', '#120f22', '#1b1630'];
const KEEP_RIM = '#a8506a';
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
    const g = glow(x, y * 1.6, GX, GY * 1.6, W * 0.95);
    return clamp01(0.05 + Math.pow(y / H, 1.2) * 0.3 + g * 1.05);
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
    [W * 0.6, H * 0.46],
    [W * 0.61, H * 0.36],
    [W * 0.63, H * 0.3],
    [W * 0.66, H * 0.285],
    [W * 0.88, H * 0.285],
    [W * 0.905, H * 0.33],
    [W * 0.93, H * 0.48],
    [W * 0.98, H * 0.66],
    [W + 10, H * 0.72],
    [W + 10, H + 10],
  ], 8, [0, 5, 6, 10, 11]);
  const crag = layerOf(p);
  crag.poly(spire, ROCK[0]);
  facets(crag, ROCK, [0.9, -0.35, 0.25], {
    cw: 8, ch: 30, seed: 13, tilt: [0.2, 0], spread: 1.3,
    extra: (x, y) => glow(x, y, GX, GY, W * 0.42) * 0.85 - ((y - H * 0.3) / H) * 0.55,
  });
  crag.each((x, y) => (!crag.has(x, y - 1) || (!crag.has(x + 1, y) && glow(x, y, GX, GY, W * 0.4) > 0.1) ? ROCK_RIM : undefined));
  over(p, crag, INK);
  // THE ROAD: switchbacks up the slope to the crag's foot, then along the spur to the gate; cut into the hill, its outer lip dark
  const road = path([
    [W * -0.02, H * 1.02],
    [W * 0.26, H * 0.93],
    [W * 0.44, H * 0.86],
    [W * 0.28, H * 0.77],
    [W * 0.12, H * 0.7],
    [W * 0.3, H * 0.62],
    [W * 0.48, H * 0.52],
    [W * 0.54, H * 0.47],
    [W * 0.6, H * 0.4],
    [W * 0.63, H * 0.33],
    [W * 0.67, H * 0.29],
  ], 10);
  const rd = layerOf(p);
  rd.poly(band(road, 14, 3), ROAD[0]);
  bands(rd, ROAD, (x, y) => 0.42 + glow(x, y, GX, GY, W * 0.7) * 0.9 + (fbm(x / 4, y / 4, 21) - 0.5) * 0.35);
  // (the ruts: two dark lines along it, near)
  over(p, rd, null);
  const lip = band(road.map(([x, y]) => [x, y + 3] as Pt), 14, 3);
  const lipL = layerOf(p);
  lipL.poly(lip, '#000000');
  lipL.each((x, y) => (rd.has(x, y) ? '#00000000' : undefined));
  lipL.each((x, y) => (rd.has(x, y - 1) || rd.has(x, y - 2) ? '#0a0814' : null));
  over(p, lipL, null);
  // THE PRISON on the crag
  paintKeep(p, W, H, GX, GY);
  // THE WAGONS on the lowest bend, their lanterns lit; THE OLD WORDSMITH far up the road, his light
  const lamps: Pt[] = [];
  paintWagonSmall(p, W * 0.3, H * 0.875, 1.5, lamps, 0);
  paintWagonSmall(p, W * 0.12, H * 0.955, 1.4, lamps, 1);
  const smith: Pt = [W * 0.6, H * 0.4];
  paintTinySmith(p, smith[0], smith[1], t);
  for (const [x, y] of lamps) halo(p, x, y, 11, LAMP[1], 2, 0.3);
  const pulse = 0.5 + 0.5 * Math.sin(t * 2.4);
  halo(p, smith[0] + 4, smith[1] - 15, 10 + 2 * pulse, CYANS[2], 2, 0.5);
  // THE NEAR SLOPE: black rock and pines framing the bottom right, their tops caught by the glow
  const near = layerOf(p);
  near.poly(loop([[W * 0.6, H + 10], [W * 0.68, H * 0.88], [W * 0.8, H * 0.8], [W * 0.9, H * 0.71], [W + 10, H * 0.66], [W + 10, H + 10]], 10, [0, 4, 5]), '#06050c');
  paintPine(near, W * 0.83, H * 0.84, 52, 0);
  paintPine(near, W * 0.94, H * 0.76, 70, 1);
  paintPine(near, W * 0.74, H * 0.92, 34, 2);
  near.each((x, y) => (!near.has(x, y - 1) && glow(x, y, GX, GY, W * 0.7) > 0.05 ? '#5a2a3e' : undefined));
  over(p, near, INK);
  // THE CAPTION
  caption(p, 'They followed the old wordsmith up the mountain...', 6, 6, 92);
}

/**
 * The prison on the crag, black against the glow behind it, every edge facing up or toward the glow rimmed: at its left end,
 * where the road comes up, a gatehouse of two round towers with pointed roofs and the great arched gate between them; a long
 * crenelled wall; the keep rising tall over it, its top broken; a tower at the far end.
 */
function paintKeep(p: Px, W: number, H: number, GX: number, GY: number): void {
  const k = layerOf(p);
  const top = H * 0.285;
  const X = (f: number): number => W * f;
  const Y = (f: number): number => H * f;
  /** A round tower: its body tapering a little, its roof a pointed cone with eaves, a little crooked. */
  const tower = (x0: number, x1: number, y1: number, roof: number, lean: number): void => {
    k.poly(loop([[x0 - 1, top + 2], [x0, y1], [x1, y1], [x1 + 1, top + 2]], 2, [0, 1, 2, 3]), KEEP[0]);
    const mid = (x0 + x1) / 2 + lean;
    k.poly(loop([[x0 - 2.5, y1 + 1.5], [mid - 1, y1 - roof * 0.6], [mid + lean, y1 - roof], [mid + 1, y1 - roof * 0.6], [x1 + 2.5, y1 + 1.5]], 3, [0, 2, 4]), KEEP[0]);
  };
  /** Crenels along a wall's top from x0 to x1. */
  const crenels = (x0: number, x1: number, y: number): void => {
    for (let x = x0 + 1; x < x1 - 3; x += 6) k.poly([[x, y + 0.5], [x + 0.4, y - 3.5], [x + 3.6, y - 3.5], [x + 4, y + 0.5]], KEEP[0]);
  };
  // the long wall
  k.poly([[X(0.7), top + 2], [X(0.7), Y(0.17)], [X(0.875), Y(0.17)], [X(0.88), top + 2]], KEEP[0]);
  crenels(X(0.7), X(0.875), Y(0.17));
  // the keep, rising over it, its top broken on one side
  k.poly(loop([[X(0.76), Y(0.18)], [X(0.762), Y(0.06)], [X(0.8), Y(0.06)], [X(0.803), Y(0.09)], [X(0.81), Y(0.075)], [X(0.814), Y(0.18)]], 2, [0, 1, 2, 3, 4, 5]), KEEP[0]);
  crenels(X(0.762), X(0.8), Y(0.06));
  // the gatehouse's towers, and the far tower
  tower(X(0.645), X(0.68), Y(0.15), H * 0.07, -0.5);
  tower(X(0.712), X(0.745), Y(0.14), H * 0.08, 0.6);
  tower(X(0.86), X(0.892), Y(0.13), H * 0.075, 0.3);
  // tone it: the faces toward the glow (behind it: its right edges, its tops) a band lighter
  bands(k, KEEP, (x, y) => 0.12 + glow(x, y, GX, GY, W * 0.3) * 1.4, undefined, false);
  // the rim: every edge facing up or toward the glow
  k.each((x, y) => {
    const edge = !k.has(x, y - 1) || (x < GX ? !k.has(x + 1, y) : !k.has(x - 1, y));
    return edge && glow(x, y, GX, GY, W * 0.45) > 0.12 ? KEEP_RIM : undefined;
  });
  // the GREAT GATE between the gatehouse's towers: an arch, its doors shut, iron-banded
  const gx0 = X(0.68);
  const gx1 = X(0.712);
  const gate: Pt[] = loop([[gx0, top + 2], [gx0, Y(0.215)], [(gx0 + gx1) / 2, Y(0.18)], [gx1, Y(0.215)], [gx1, top + 2]], 4, [0, 4]);
  k.poly(gate, '#0b0912');
  k.each((x, y) => (inside(gate, x + 0.5, y + 0.5) && (Math.abs(x - (gx0 + gx1) / 2) < 0.6 || Math.round(y) % 5 === 0) ? '#030208' : undefined));
  // its slit windows: in the towers and the keep, black
  for (const [wx, wy, wh] of [[0.66, 0.2, 3], [0.728, 0.19, 3], [0.776, 0.09, 4], [0.792, 0.13, 3], [0.876, 0.18, 3], [0.84, 0.21, 2]] as const) k.rect(Math.round(W * wx), Math.round(H * wy), 1, wh, '#000000');
  over(p, k, INK);
}

/** A wagon far off on the road (`s` its size), going up it to the right: its arched canvas cover on its ribs, its bed, two spoked wheels, a horse bent to the climb, a driver hunched on the bench, its lantern lit on a pole at the front (pushed onto `lamps`). */
function paintWagonSmall(p: Px, x: number, y: number, s: number, lamps: Pt[], seed: number): void {
  const w = layerOf(p);
  const L = 18 * s;
  const top = y - 10 * s;
  const bed = y - 3.2 * s;
  // the cover: an arch of canvas, higher at the back, sagging between its ribs
  const cover: Pt[] = loop([[x - L / 2, bed], [x - L / 2 - 0.5, top + 2 * s], [x - L * 0.18, top - 0.6 * s], [x + L * 0.2, top], [x + L / 2 - 1, top + 2.4 * s], [x + L / 2 - 1, bed]], 6, [0, 5]);
  w.poly(cover, '#c8b088');
  w.each((px, py) => {
    if (!inside(cover, px + 0.5, py + 0.5)) return undefined;
    // (lit from its own lantern at the front, and from the glow up the hill: the front and top lighter)
    const k = (px - (x - L / 2)) / L - (py - top) / (bed - top) * 0.5;
    const rib = [-0.3, 0.02, 0.32].some((r) => Math.abs(px - (x + r * L)) < 0.6);
    if (rib) return '#6a5236';
    return k > 0.45 ? '#e6d4aa' : k > 0.05 ? '#c8b088' : '#97805e';
  });
  // the bed, its side boards; the bench at the front with the driver hunched on it
  w.poly([[x - L / 2 - 1, bed], [x + L / 2 + 1, bed], [x + L / 2, bed + 2.4 * s], [x - L / 2, bed + 2.4 * s]], '#4a3020');
  w.hline(Math.round(x - L / 2), Math.round(bed), Math.round(L), '#6e4a2e');
  w.poly(loop([[x + L / 2 - 1, bed], [x + L / 2 + 0.5, bed - 4.5 * s], [x + L / 2 + 2.4 * s, bed - 5 * s], [x + L / 2 + 3 * s, bed]], 3, [0, 3]), '#2a2030');
  // the wheels, spoked
  for (const wx of [x - L * 0.3, x + L * 0.3]) {
    const r = 3.2 * s;
    w.ellipse(wx, y, r, r, '#24160e');
    w.ellipse(wx, y, r - 1.2, r - 1.2, '#00000000');
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI + seed;
      w.line(Math.round(wx - Math.cos(a) * (r - 1)), Math.round(y - Math.sin(a) * (r - 1)), Math.round(wx + Math.cos(a) * (r - 1)), Math.round(y + Math.sin(a) * (r - 1)), '#3a2618');
    }
    w.set(Math.round(wx), Math.round(y), '#6e4a2e');
  }
  // the horse, bent to the climb: its barrel, its neck reaching up the hill, its legs
  const hx = x + L / 2 + 4 * s;
  w.poly(loop([[hx - 1.5 * s, bed - 0.5 * s], [hx, bed - 3 * s], [hx + 5 * s, bed - 3.4 * s], [hx + 7.5 * s, bed - 6 * s], [hx + 9 * s, bed - 5.6 * s], [hx + 8 * s, bed - 3 * s], [hx + 6 * s, bed - 0.4 * s], [hx + 1 * s, bed + 0.4 * s]], 4), '#2c1c14');
  for (const [lx0, lx1] of [[hx, hx - 1 * s], [hx + 1.5 * s, hx + 2.5 * s], [hx + 5 * s, hx + 4 * s], [hx + 6 * s, hx + 7.5 * s]]) {
    w.line(Math.round(lx0), Math.round(bed), Math.round(lx1), Math.round(y + 1.5 * s), '#24160e');
  }
  // the lantern's pole at the front
  w.line(Math.round(x + L / 2 + 1), Math.round(bed - 4 * s), Math.round(x + L / 2 + 3 * s), Math.round(top - 1 * s), '#2a1c12');
  over(p, w, INK);
  const lx = Math.round(x + L / 2 + 3 * s);
  const ly = Math.round(top);
  p.set(lx, ly, LAMP[0]);
  p.set(lx, ly + 1, LAMP[0]);
  p.set(lx - 1, ly + 1, LAMP[1]);
  p.set(lx + 1, ly + 1, LAMP[1]);
  p.set(lx, ly + 2, LAMP[2]);
  lamps.push([lx, ly + 1]);
}

/** The old wordsmith far up the road: a small hooded figure, his staff raised, its head alight. */
function paintTinySmith(p: Px, x: number, y: number, t: number): void {
  const s = layerOf(p);
  // the robe, the hood, leaning into the climb
  s.poly(loop([[x - 3, y], [x - 2, y - 7], [x - 1, y - 10], [x + 1.5, y - 11], [x + 2.5, y - 8], [x + 3, y]], 3, [0, 5]), '#1c3c44');
  s.each((px) => (px > x + 0.5 ? '#2c5a64' : undefined));
  // the staff, raised
  s.line(Math.round(x + 3), Math.round(y - 1), Math.round(x + 4), Math.round(y - 14), '#3a2a1c');
  over(p, s, INK);
  const on = 0.5 + 0.5 * Math.sin(t * 2.4);
  p.set(Math.round(x + 4), Math.round(y - 15), CYANS[0]);
  p.set(Math.round(x + 4), Math.round(y - 14), on > 0.5 ? CYANS[1] : CYANS[2]);
}

/** A pine, black, its boughs in ragged tiers drooping from the trunk, `h` tall, its foot at (x, y). */
function paintPine(p: Px, x: number, y: number, h: number, seed: number): void {
  const tiers = Math.max(4, Math.round(h / 8));
  for (let k = 0; k < tiers; k++) {
    const f = k / tiers;
    const ty = y - h * (0.15 + 0.85 * f);
    const half = (1 - f) * h * 0.32 + 2;
    const droop = 4 + (1 - f) * 5;
    const jag = (i: number): number => (hash(k, i, 31 + seed) - 0.5) * 3;
    p.poly([
      [x - half + jag(0), ty + droop],
      [x - half * 0.55, ty + droop * 0.4 + jag(1)],
      [x - half * 0.3 + jag(2), ty + droop * 0.75],
      [x, ty - 2],
      [x + half * 0.3 + jag(3), ty + droop * 0.75],
      [x + half * 0.55, ty + droop * 0.4 + jag(4)],
      [x + half + jag(5), ty + droop],
    ], '#06050c');
  }
  p.rect(Math.round(x - 1), Math.round(y - h * 0.2), 2, Math.round(h * 0.2), '#06050c');
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
  bands(sky, DUSK, (x, y) => 0.25 + (1 - y / (H * 0.6)) * -0.2 + glow(x, y, -W * 0.1, H * 0.55, W * 0.9) * 0.9);
  over(p, sky, null);
  const hill = layerOf(p);
  hill.poly(loop([[-5, H * 0.42], [W * 0.2, H * 0.36], [W * 0.45, H * 0.3], [W + 5, H * 0.22], [W + 5, H + 5], [-5, H + 5]], 8, [3, 4, 5]), '#0e0b1a');
  bands(hill, ['#08060f', '#0e0b1a', '#171228', '#241a36'], (x, y) => 0.55 - (y - H * 0.35) / H * 1.2 + lamp(x, y, W * 0.5) * 0.8 + (fbm(x / 14, y / 5, 33) - 0.5) * 0.4);
  hill.each((x, y) => (!hill.has(x, y - 1) ? '#6a3248' : undefined));
  paintPine(hill, W * 0.08, H * 0.42, 26, 4);
  paintPine(hill, W * 0.2, H * 0.38, 18, 5);
  over(p, hill, null);
  // THE ROAD'S MUD at the bottom, its ruts catching the lamp
  const mud = layerOf(p);
  mud.poly(loop([[-5, H * 0.8], [W * 0.4, H * 0.77], [W + 5, H * 0.74], [W + 5, H + 5], [-5, H + 5]], 8, [2, 3, 4]), MUD[0]);
  bands(mud, MUD, (x, y) => lamp(x, y, W * 0.9) * 1.3 + (fbm(x / 9, y / 3, 41) - 0.5) * 0.5 + (Math.abs(((x * 0.35 + y) % 22) - 11) < 1.5 ? 0.25 : 0));
  over(p, mud, INK);
  // THE CANVAS COVER: a great arch filling the right, sagging between its ribs, folds running down it
  const cover = layerOf(p);
  const cv: Pt[] = loop([[W * 0.5, H * 0.72], [W * 0.5, H * 0.3], [W * 0.56, H * 0.05], [W * 0.7, -6], [W + 6, -6], [W + 6, H * 0.72]], 8, [0, 4, 5]);
  cover.poly(cv, CANVAS[0]);
  bands(cover, CANVAS, (x, y) => {
    const ribs = Math.cos(((x - W * 0.5) / (W * 0.17)) * Math.PI * 2) * 0.09;
    const folds = Math.sin(x * 0.45 + y * 0.08 + Math.sin(y * 0.05) * 3) * 0.05;
    return lamp(x, y, W * 1.05) * 1.25 + 0.08 + ribs + folds - (x - W * 0.5) / W * 0.2;
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
  arm.poly(band(path([[W * 0.5, hookY + 3], [W * 0.43, hookY - 1], [hookX + 2, hookY]], 6), 3), IRON3[1]);
  arm.poly(band(path([[hookX + 2, hookY], [hookX - 1, hookY + 4], [hookX + 1, hookY + 7]], 4), 2), IRON3[2]);
  over(p, arm, INK);
  // THE GREAT WHEEL, bottom right, deep in the rut: its iron tyre, its felloes, its spokes and hub, the lamp on its near side
  paintWheel(p, W * 0.8, H * 1.02, H * 0.44, lamp, t);
  // THE LANTERN
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
  bands(sky, DUSK, (x, y) => 0.08 + glow(x, y * 1.4, GX, GY * 1.4, W * 0.95) * 1.05 + (y / H) * 0.15);
  over(p, sky, null);
  // THE CRAG far up at the right, the prison on it, black
  const crag = layerOf(p);
  crag.poly(loop([[W * 0.56, H + 4], [W * 0.6, H * 0.5], [W * 0.66, H * 0.3], [W * 0.7, H * 0.24], [W * 0.92, H * 0.24], [W * 0.96, H * 0.34], [W + 4, H * 0.42], [W + 4, H + 4]], 6, [0, 3, 4, 6, 7]), '#120e20');
  const KX = W * 0.71;
  const KY = H * 0.24;
  crag.poly([[KX, KY + 1], [KX, KY - 14], [KX + 6, KY - 14], [KX + 6, KY - 9], [KX + 18, KY - 9], [KX + 18, KY - 20], [KX + 23, KY - 22], [KX + 24, KY - 9], [KX + 36, KY - 9], [KX + 36, KY - 16], [KX + 42, KY - 16], [KX + 42, KY + 1]], '#0a0816');
  for (const tx of [KX + 3, KX + 39]) crag.poly([[tx - 4, KY - 13], [tx, KY - 22], [tx + 4, KY - 13]], '#0a0816');
  crag.each((x, y) => (!crag.has(x, y - 1) || !crag.has(x + 1, y) ? '#a8506a' : undefined));
  over(p, crag, INK);
  // THE SLOPE he stands on, rising to the right, the road along it
  const slope = layerOf(p);
  slope.poly(loop([[-4, H * 0.84], [W * 0.3, H * 0.86], [W * 0.6, H * 0.74], [W * 0.8, H * 0.58], [W + 4, H * 0.5], [W + 4, H + 4], [-4, H + 4]], 8, [4, 5, 6]), ROCK[0]);
  facets(slope, ROCK, [0.8, -0.4, 0.35], { cw: 18, ch: 8, seed: 81, tilt: [0.2, -0.6], spread: 0.8, cracks: false, extra: (x, y) => glow(x, y, GX, GY, W * 0.8) * 0.4 + cy(x, y) * 0.4 - (y / H) * 0.4 });
  slope.each((x, y) => (!slope.has(x, y - 1) ? '#7a3e58' : undefined));
  over(p, slope, INK);
  // THE OLD WORDSMITH
  const m = layerOf(p);
  const fx = W * 0.34;
  const fy = H * 1.02;
  const S = H / 112;
  const wind = Math.sin(t * 1.3) * 1.5;
  // his robe, blowing back to the left
  const robe: Pt[] = loop([
    [fx - 13 * S, fy - 66 * S],
    [fx - 15 * S, fy - 46 * S],
    [fx - 20 * S, fy - 22 * S],
    [fx - 30 * S - wind, fy - 4 * S],
    [fx - 22 * S - wind, fy + 1 * S],
    [fx - 4 * S, fy - 1 * S],
    [fx + 10 * S, fy + 1 * S],
    [fx + 13 * S, fy - 18 * S],
    [fx + 12 * S, fy - 46 * S],
    [fx + 13 * S, fy - 66 * S],
  ], 6);
  m.poly(robe, ROBE_OLD[0]);
  // his raised arm's wide sleeve, hanging from the arm up toward the staff
  const base: Pt = [fx + 10 * S, fy - 50 * S];
  const hand: Pt = [lerp(base[0], SX, 0.32), lerp(base[1], SY, 0.32)];
  const sleeve: Pt[] = loop([[fx + 8 * S, fy - 70 * S], [fx + 16 * S, fy - 80 * S], [hand[0] - 2, hand[1] - 1], [hand[0] + 4, hand[1] + 3], [fx + 22 * S, fy - 66 * S], [fx + 16 * S, fy - 54 * S], [fx + 9 * S, fy - 58 * S]], 5);
  m.poly(sleeve, ROBE_OLD[0]);
  // his mantle over his shoulders, its edge blowing
  const mantle: Pt[] = loop([[fx - 14 * S, fy - 86 * S], [fx - 20 * S, fy - 70 * S], [fx - 25 * S - wind, fy - 56 * S], [fx - 10 * S, fy - 58 * S], [fx + 4 * S, fy - 56 * S], [fx + 15 * S, fy - 62 * S], [fx + 14 * S, fy - 80 * S], [fx + 4 * S, fy - 88 * S]], 6);
  m.poly(mantle, TEAL_OLD[0]);
  // his hood, its point falling back
  const hood: Pt[] = loop([[fx - 9 * S, fy - 82 * S], [fx - 13 * S, fy - 92 * S], [fx - 10 * S, fy - 101 * S], [fx - 2 * S, fy - 105 * S], [fx + 6 * S, fy - 101 * S], [fx + 8 * S, fy - 92 * S], [fx + 6 * S, fy - 84 * S]], 6);
  m.poly(hood, TEAL_OLD[0]);
  m.poly(loop([[fx - 10 * S, fy - 99 * S], [fx - 17 * S, fy - 95 * S], [fx - 21 * S - wind, fy - 90 * S], [fx - 12 * S, fy - 92 * S]], 3), TEAL_OLD[0]);
  // his sash at his waist, its ends blowing; the book on its strap at his hip
  m.poly(band(path([[fx - 15 * S, fy - 46 * S], [fx, fy - 44 * S], [fx + 12 * S, fy - 47 * S]], 6), 4), TEAL_OLD[1]);
  m.poly(band(path([[fx - 12 * S, fy - 45 * S], [fx - 20 * S - wind, fy - 36 * S], [fx - 26 * S - wind * 2, fy - 30 * S]], 6), 3, 2), TEAL_OLD[1]);
  const book: Pt[] = loop([[fx - 19 * S, fy - 42 * S], [fx - 20 * S, fy - 30 * S], [fx - 9 * S, fy - 29 * S], [fx - 8 * S, fy - 41 * S]], 2, [0, 1, 2, 3]);
  m.poly(book, TEAL_OLD[2]);
  // tone all of him: black on the glow; his right edges (toward the glow) and his upper edges (toward his staff) rimmed
  const tone = (c: string): Tones | null => (c === ROBE_OLD[0] ? ROBE_OLD : c === TEAL_OLD[0] ? TEAL_OLD : null);
  m.each((x, y, c) => {
    const T = tone(c);
    if (!T) return undefined;
    const g = glow(x, y, GX, GY, W * 0.7) * 0.6 + cy(x, y) * 0.8;
    return T[Math.min(T.length - 1, Math.floor(clamp01(0.15 + g) * (T.length - 1)))];
  });
  m.each((x, y) => {
    if (!m.has(x + 1, y) && glow(x, y, GX, GY, W * 0.8) > 0.12) return '#c86a6a';
    if ((!m.has(x, y - 1) || !m.has(x + 1, y)) && cy(x, y) > 0.2) return CYANS[2];
    return undefined;
  });
  // his raised arm: the wide sleeve from his shoulder out to his fist on the staff, hanging from the arm
  const sh: Pt = [fx + 8 * S, fy - 76 * S];
  const arm: Pt[] = loop([[sh[0] - 3 * S, sh[1] - 4 * S], [lerp(sh[0], hand[0], 0.5), lerp(sh[1], hand[1], 0.5) - 4 * S], [hand[0] - 1 * S, hand[1] - 2.5 * S], [hand[0] + 0.5 * S, hand[1] + 3 * S], [lerp(sh[0], hand[0], 0.55), lerp(sh[1], hand[1], 0.55) + 9 * S], [sh[0] + 2 * S, sh[1] + 12 * S]], 6);
  const armL = layerOf(p);
  armL.poly(arm, ROBE_OLD[1]);
  armL.each((x, y) => (!armL.has(x, y - 1) && cy(x, y) > 0.15 ? CYANS[3] : glow(x, y, GX, GY, W * 0.7) > 0.3 && !armL.has(x + 1, y) ? '#c86a6a' : undefined));
  over(m, armL, INK);
  // his robe's folds: long strokes from his waist to his hem, swept back by the wind
  for (let k = 0; k < 5; k++) {
    const x0 = fx + (-11 + k * 5) * S;
    const pts = path([[x0, fy - 44 * S], [x0 - (2 + k) * S * 0.6, fy - 22 * S], [x0 - (5 + k * 2) * S * 0.6 - wind, fy - 2 * S]], 40);
    for (const [x, y] of pts) if (m.has(Math.round(x), Math.round(y))) m.set(Math.round(x), Math.round(y), INK);
  }
  // the hood's edge turned toward his staff: a sliver of it lit
  for (let y = Math.round(fy - 100 * S); y < fy - 84 * S; y++) {
    let x = Math.round(fx + 10 * S);
    while (x > fx - 5 * S && !m.has(x, y)) x--;
    if (m.has(x, y)) {
      m.set(x, y, CYANS[2]);
      m.set(x - 1, y, TEAL_OLD[3]);
    }
  }
  // the book's clasp, gold
  m.set(Math.round(fx - 9), Math.round(fy - 36), '#e8b04a');
  over(p, m, INK);
  // THE STAFF, held high: dark wood, its runes cut down it lit one after another, its head a ring with a rune burning in it
  const st = layerOf(p);
  st.poly(band([base, [SX, SY]], 3.2, 2.6), WOOD[1]);
  st.each((x, y) => (cy(x, y) > 0.5 ? WOOD[3] : undefined));
  over(p, st, INK);
  for (let k = 1; k < 6; k++) {
    const u = k / 7;
    const rx = Math.round(lerp(base[0], SX, u));
    const ry = Math.round(lerp(base[1], SY, u));
    const on = (Math.floor(t * 3) % 6) === k;
    p.set(rx, ry, on ? CYANS[1] : CYANS[3]);
  }
  // (his fist round it)
  const fist = layerOf(p);
  fist.poly(loop([[hand[0] - 3, hand[1]], [hand[0], hand[1] - 3], [hand[0] + 4, hand[1] - 1], [hand[0] + 3, hand[1] + 3]], 3), '#3a2a24');
  over(p, fist, INK);
  // the ring at its head, and the rune in it
  const ring = layerOf(p);
  ring.poly(loop([[SX - 6, SY], [SX - 4, SY - 6], [SX + 2, SY - 8], [SX + 6, SY - 3], [SX + 5, SY + 3], [SX, SY + 5]], 5), CYANS[3]);
  ring.poly(loop([[SX - 3, SY], [SX - 2, SY - 3], [SX + 2, SY - 4], [SX + 3, SY - 1], [SX + 2, SY + 2], [SX, SY + 2]], 4), '#00000000');
  over(p, ring, INK);
  halo(p, SX, SY - 2, 20 + 4 * pulse, CYANS[2], 3, 0.42);
  p.set(Math.round(SX), Math.round(SY - 3), CYANS[0]);
  p.set(Math.round(SX - 1), Math.round(SY - 2), CYANS[0]);
  p.set(Math.round(SX + 1), Math.round(SY - 2), CYANS[1]);
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
const DUSK_RIM = '#d07070';

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

/** The armourer sculpted, seated (up z, he faces x): on the wagon's bench with the reins (`onBench`), or sat on the floor. */
function armourerFigure(breath: number, sway: number, onBench: boolean): Figure {
  const f = new Figure();
  const skin = f.stuff({ tones: SKIN_K, hatch: 4 });
  const shirt = f.stuff({ tones: SHIRT_K, hatch: 4 });
  const hide = f.stuff({ tones: LEATHER_K, hatch: 4 });
  const white = f.stuff({ tones: BEARD_K, meld: true });
  const iron = f.stuff({ tones: IRON_K });
  const wood = f.stuff({ tones: [INK, WOOD[1], WOOD[2], WOOD[3], WOOD[4]] });
  // the bench under him, his hammer on it behind him
  if (onBench) {
    f.block(wood, [-0.5, 0, 0.1], [3.2, 2.6, 0.25], 0.08);
    f.rod(wood, [-2.6, 0.4, 0.55], [-1.0, 0.2, 0.5], 0.14, 0.14, 0);
    f.block(iron, [-2.9, 0.4, 0.62], [0.45, 0.28, 0.28], 0.06, axes(0.3), 0);
  }
  // hips and body: a barrel of a chest leaning to the road, a belly under it, great shoulders
  f.egg(shirt, [0, 0, 1.3], [1.6, 1.5, 1.0]);
  f.egg(shirt, [0.55, 0, 2.6], [1.55, 1.65, 1.35], axes(0, 0, 0.15), 1.0);
  f.egg(shirt, [0.35, 0, 3.9 + breath], [1.5, 1.95, 1.75], axes(0, 0, 0.25), 1.0);
  f.egg(shirt, [0.05, -1.95, 4.75 + breath], [1.0, 0.95, 0.9], axes(), 0.8);
  f.egg(shirt, [0.05, 1.95, 4.75 + breath], [1.0, 0.95, 0.9], axes(), 0.8);
  // the leather apron over his front, its strap over his shoulder
  f.block(hide, [1.55, 0, 2.7], [0.16, 1.3, 1.6], 0.14, axes(0, 0, 0.28), 0.25);
  f.rod(hide, [1.25, -0.9, 4.1], [0.2, -1.5, 5.25], 0.16, 0.16, 0.1);
  // the neck, the head: a skull, a jaw, a jutting brow, cheekbones, a nose like a ram's, an ear; his eye in its socket
  f.rod(skin, [0.3, 0, 5.2 + breath], [0.75, 0, 6.15], 0.8, 0.72, 0.5);
  f.egg(skin, [0.55, 0, 7.15], [1.18, 0.98, 1.22], axes(0, 0, -0.15), 0.6);
  f.egg(skin, [1.05, 0, 6.45], [0.82, 0.78, 0.62], axes(0, 0, 0.2), 0.6);
  f.rod(skin, [1.42, -0.62, 7.38], [1.5, 0.62, 7.38], 0.22, 0.22, 0.35);
  f.egg(skin, [1.28, -0.6, 6.95], [0.34, 0.3, 0.28], axes(), 0.4);
  f.egg(skin, [1.28, 0.6, 6.95], [0.34, 0.3, 0.28], axes(), 0.4);
  f.rod(skin, [1.58, 0, 7.25], [2.12, 0, 6.72], 0.17, 0.25, 0.25);
  f.egg(skin, [2.08, 0, 6.68], [0.26, 0.26, 0.22], axes(), 0.25);
  f.egg(skin, [0.38, -0.96, 7.0], [0.26, 0.14, 0.4], axes(0, 0, -0.2), 0.25);
  f.egg(skin, [1.46, -0.42, 7.1], [0.22, 0.24, 0.16], axes(), 0.1, true);
  f.mark([1.5, -0.42, 7.09], [CYANS[0], CYANS[1], CYANS[2]], 2);
  f.mark([1.52, 0.4, 7.1], [CYANS[1]], 1);
  // his beard: white, growing out of his jaw and cheeks, falling down his chest; his moustache; his brows
  f.egg(white, [1.45, 0, 5.9], [0.72, 0.95, 0.8], axes(), 0.5);
  f.egg(white, [1.05, -0.74, 6.15], [0.48, 0.34, 0.5], axes(), 0.5);
  f.egg(white, [1.05, 0.74, 6.15], [0.48, 0.34, 0.5], axes(), 0.5);
  f.egg(white, [1.72 + sway * 0.4, 0, 4.95], [0.62, 0.95, 1.25], axes(0, 0, 0.2), 0.6);
  f.egg(white, [1.95 + sway, 0, 3.95], [0.42, 0.6, 0.85], axes(0, 0, 0.25), 0.6);
  f.rod(white, [1.92, -0.08, 6.6], [1.85, -0.6, 6.25], 0.17, 0.13, 0.25);
  f.rod(white, [1.85, -0.6, 6.25], [1.78, -0.62, 5.85], 0.13, 0.09, 0.2);
  f.rod(white, [1.92, 0.08, 6.6], [1.85, 0.6, 6.25], 0.17, 0.13, 0.25);
  f.rod(white, [1.55, -0.68, 7.55], [1.62, -0.12, 7.58], 0.13, 0.1, 0.15);
  f.rod(white, [1.55, 0.68, 7.55], [1.62, 0.12, 7.58], 0.13, 0.1, 0.15);
  // his near arm: the rolled sleeve over the elbow, the great forearm out to the reins, the fist; the far arm the same
  for (const side of [-1, 1]) {
    const y0 = 1.95 * side;
    f.rod(shirt, [0.05, y0, 4.7 + breath], [0.75, y0 * 1.05, 3.15], 0.66, 0.55, 0.6);
    f.egg(shirt, [0.8, y0 * 1.05, 3.25], [0.66, 0.66, 0.42], axes(0, 0, 0.6), 0.3);
    f.rod(skin, [0.85, y0 * 1.02, 3.05], [2.95, y0 * 0.62, 3.1], 0.55, 0.34, 0.4);
    f.egg(skin, [1.45, y0 * 0.95, 3.15], [0.62, 0.5, 0.48], axes(-0.35 * side), 0.5);
    f.egg(skin, [3.2, y0 * 0.58, 3.1], [0.5, 0.42, 0.46], axes(-0.3 * side), 0.25);
    for (let j = 0; j < 4; j++) f.rod(skin, [3.45, y0 * 0.58 - 0.24 + j * 0.16, 3.3], [3.5, y0 * 0.58 - 0.24 + j * 0.16, 2.85], 0.09, 0.09, 0.08);
  }
  // the reins, out from his fists to the horse
  if (onBench) {
    f.rod(hide, [3.4, -1.15, 3.0], [8, -0.6, 2.4], 0.07, 0.07, 0);
    f.rod(hide, [3.4, 1.15, 3.0], [8, 0.6, 2.4], 0.07, 0.07, 0);
  }
  return f;
}

/** The mystic sculpted, seated (a tenth of a metre to a unit, up z, she faces -y): as on page 2. */
function mysticFigure(bob: number): Figure {
  const f = new Figure();
  const robe = f.stuff({ tones: [INK, '#120a28', '#261a52', '#3e3a8a', '#5e72c0', '#9ad0f0'], hatch: 4 });
  const pale = f.stuff({ tones: [INK, '#18202c', '#2e4a58', '#5a8a98', '#9cd0d8', '#dcfcff'] });
  const veil = f.stuff({ tones: [INK, '#160c22', '#2a1c44', '#4a3a74', '#7a72b0', '#b0ccea'], hatch: 4 });
  const skin = f.stuff({ tones: [INK, '#1a1430', '#3a3a64', '#6a7ea4', '#a8d0e4', '#e4fcff'], hatch: 4 });
  const gold = f.stuff({ tones: ['#3a2a08', '#7a5210', '#d09a20', '#ffd866', '#fff3b0'] });
  // her body under the robe: seated, hips and lap, a chest, her shoulders; the robe falling to the wagon's floor
  f.egg(robe, [0, 0.1, 2.3], [1.55, 1.25, 0.95]);
  f.rod(robe, [0, 0, 2.6], [0, -0.35, 0.4], 1.3, 1.75, 0.8);
  f.egg(robe, [0, 0, 4.05], [1.3, 0.85, 1.1], axes(), 0.8);
  f.egg(robe, [-1.15, 0.05, 4.5], [0.58, 0.6, 0.5], axes(), 0.6);
  f.egg(robe, [1.15, 0.05, 4.5], [0.58, 0.6, 0.5], axes(), 0.6);
  // (the folds of her robe falling from her lap: grooves)
  for (const dx of [-0.9, -0.3, 0.35, 0.95]) f.rod(robe, [dx, -1.05, 2.5], [dx * 1.25, -1.9, 0.5], 0.08, 0.1, 0.05, true);
  // her neck, her head: a skull, a narrow chin
  f.rod(skin, [0, 0, 4.9], [0, -0.05, 5.5], 0.4, 0.38, 0.3);
  f.egg(skin, [0, 0, 6.2], [0.78, 0.84, 0.98], axes(), 0.5);
  f.egg(skin, [0, -0.36, 5.68], [0.52, 0.48, 0.42], axes(), 0.4);
  f.mark([-0.3, -0.84, 6.25], [CYANS[0], CYANS[1], CYANS[2]], 2);
  f.mark([0.3, -0.84, 6.25], [CYANS[0], CYANS[1], CYANS[2]], 2);
  // her veil: across her face under her eyes, hooked to the turban at either side, hanging thin over her throat in folds
  f.egg(veil, [0, -0.62, 5.72], [0.82, 0.38, 0.42], axes(), 0.25);
  f.block(veil, [0, -0.86, 4.95], [0.66, 0.07, 0.62], 0.05, axes(0, -0.18), 0.35);
  for (const dx of [-0.36, 0, 0.36]) f.rod(veil, [dx, -1.0, 5.5], [dx * 1.2, -1.05, 4.35], 0.05, 0.05, 0.03, true);
  // her turban: a great dome wound round her head, a band of it across her brow, the winds' grooves crossing it, its tail
  // falling to her shoulder; the stone at its front in its setting
  f.egg(pale, [0, 0.05, 7.05], [1.08, 1.05, 0.78], axes(), 0.5);
  f.egg(pale, [0, -0.04, 6.72], [0.98, 0.96, 0.3], axes(), 0.35);
  f.rod(pale, [-1.1, -0.55, 6.85], [0.85, -0.7, 7.55], 0.05, 0.05, 0.04, true);
  f.rod(pale, [1.1, -0.5, 6.9], [-0.7, -0.8, 7.6], 0.05, 0.05, 0.04, true);
  f.rod(pale, [-1.05, -0.2, 7.2], [0.6, -0.95, 7.15], 0.05, 0.05, 0.04, true);
  f.rod(pale, [0.92, 0.35, 6.85], [1.3, 0.5, 5.6], 0.26, 0.17, 0.35);
  f.rod(pale, [1.3, 0.5, 5.6], [1.35, 0.45, 4.8], 0.17, 0.12, 0.25);
  f.egg(gold, [0, -1.0, 6.78], [0.2, 0.08, 0.24], axes(), 0);
  f.mark([0, -1.12, 6.78], ['#c8e0ff', '#9ac0ff', '#ffffff'], 2);
  // her chains of gold over the veil at her throat
  for (const [z0, sag] of [[4.7, 0.25], [4.5, 0.4]]) {
    let prev: V3 | null = null;
    for (let i = 0; i <= 8; i++) {
      const u = i / 8;
      const q: V3 = [-0.75 + 1.5 * u, -0.98 - 0.08 * Math.sin(u * Math.PI), z0 - sag * Math.sin(u * Math.PI)];
      if (prev) f.rod(gold, prev, q, 0.055, 0.055, 0);
      prev = q;
    }
  }
  // her arms: the one down to her hand cupped open under the crystal, its fingers curled up round it; the other raised
  // beside it, the hand spread
  f.rod(robe, [-1.2, 0.05, 4.45], [-1.35, -0.45, 3.2], 0.42, 0.36, 0.5);
  f.rod(robe, [-1.35, -0.45, 3.2], [-0.45, -1.35, 2.85], 0.36, 0.3, 0.4);
  f.egg(skin, [0.0, -1.55, 2.82], [0.48, 0.4, 0.16], axes(), 0.3);
  for (let j = 0; j < 4; j++) {
    const x = -0.3 + j * 0.2;
    f.rod(skin, [x, -1.85, 2.88], [x * 1.1, -1.98, 3.1], 0.08, 0.07, 0.1);
  }
  f.rod(robe, [1.2, 0.05, 4.45], [1.55, -0.55, 3.35], 0.42, 0.36, 0.5);
  f.rod(robe, [1.55, -0.55, 3.35], [1.1, -1.35, 3.7], 0.36, 0.3, 0.4);
  f.egg(skin, [1.0, -1.5, 3.85], [0.26, 0.14, 0.3], axes(), 0.2);
  for (let j = 0; j < 5; j++) {
    const a = -1.0 + j * 0.45;
    f.rod(skin, [1.0, -1.52, 3.95], [1.0 + Math.sin(a) * 0.5, -1.6, 3.95 + Math.cos(a) * 0.55], 0.065, 0.05, 0.08);
  }
  void bob;
  return f;
}

/** The stranger sculpted, sitting back (up z; he lounges along x): as on page 2. */
function strangerFigure(): Figure {
  const f = new Figure();
  const cloak = f.stuff({ tones: [INK, '#0e0c18', '#1c1a2c', '#2e2a44', '#4a4466'], hatch: 4 });
  const boot = f.stuff({ tones: [INK, '#160e0a', '#2a1c14', '#46301e'] });
  const skin = f.stuff({ tones: [INK, '#1a1228', '#3e2c48', '#7a5a6a', '#c09090'] });
  // his body, leaning back, the cloak wrapped round it, its hem over the board
  f.egg(cloak, [0, 0, 1.0], [1.45, 1.2, 0.85]);
  f.rod(cloak, [-0.55, 0.15, 1.5], [-1.05, 0.25, 4.2], 1.15, 0.95, 0.8);
  f.egg(cloak, [-1.1, 0.25, 4.3], [1.15, 0.8, 0.75], axes(0, 0, 0.35), 0.7);
  // his hood, deep, its point fallen back; under it only the dark, and his two eyes of gold
  f.egg(cloak, [-1.0, 0.1, 5.6], [0.92, 0.95, 1.0], axes(0, 0, 0.3), 0.5);
  // (its brim, standing out round his face, and the deep hollow of it)
  f.egg(cloak, [-0.75, -0.55, 5.55], [0.85, 0.42, 0.95], axes(0, 0, 0.3), 0.35);
  f.egg(cloak, [-0.72, -0.92, 5.5], [0.62, 0.55, 0.72], axes(0, 0, 0.3), 0.15, true);
  f.rod(cloak, [-1.55, 0.35, 6.2], [-2.35, 0.55, 5.4], 0.4, 0.1, 0.45);
  f.mark([-0.92, -0.55, 5.52], ['#ffd866', '#d09a20', '#7a5210'], 2);
  f.mark([-0.5, -0.55, 5.58], ['#ffd866', '#d09a20', '#7a5210'], 2);
  // his near leg up on the board, the knee high, the boot flat; the other hanging over the edge
  f.rod(cloak, [0.4, -0.3, 1.1], [1.6, -0.5, 2.6], 0.55, 0.46, 0.5);
  f.rod(boot, [1.65, -0.5, 2.55], [2.3, -0.6, 0.6], 0.42, 0.34, 0.3);
  f.egg(boot, [2.55, -0.65, 0.45], [0.6, 0.32, 0.26], axes(), 0.2);
  f.rod(cloak, [0.4, 0.55, 0.9], [1.7, 0.7, 0.5], 0.52, 0.44, 0.5);
  f.rod(boot, [1.75, 0.7, 0.45], [2.0, 0.75, -1.4], 0.4, 0.32, 0.3);
  // his arm along his knee, the hand up, the fingers open from the toss; the other arm folded under the cloak
  f.rod(cloak, [-0.6, -0.65, 3.9], [1.0, -0.95, 2.95], 0.42, 0.34, 0.5);
  f.rod(skin, [1.05, -0.95, 3.0], [1.75, -1.05, 3.55], 0.2, 0.16, 0.25);
  for (let j = 0; j < 3; j++) f.rod(skin, [1.8, -1.05 + j * 0.08, 3.6], [2.15, -1.08 + j * 0.1, 3.95 - j * 0.05], 0.065, 0.05, 0.06);
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
  hill.each((x, y) => (!hill.has(x, y - 1) ? '#7a3e58' : undefined));
  over(p, hill, INK);
  // THE WAGON'S CANVAS behind him, its edge toward the lamp lit
  const cov = layerOf(p);
  cov.poly(loop([P(-4, 180), P(-4, -4), P(90, -4), P(112, 26), P(118, 70), P(110, 120), P(96, 180)], 8, [0, 1, 2, 6]), CANVAS[0]);
  bands(cov, CANVAS, (x, y) => 0.1 + glow(x, y, lamp[0], lamp[1], W * 0.95) * 0.75 + Math.sin(x * 0.35 + y * 0.04) * 0.05);
  over(p, cov, INK);
  // HIM, SCULPTED: seated on the bench, his face turned to the road and the lamp; a tenth of a metre to a unit, up is z,
  // he faces x, the far side of him is y
  const f = armourerFigure(breath, sway, true);
  const sc = 21 * k;
  f.draw(p, { look: unit([-0.3, 1, -0.05]), up: [0, 0, 1], scale: sc, ox: P(70, 0)[0], oy: P(0, 198)[1] }, {
    at: [7.5, -4.5, 7.6], hard: 1, fill: [-0.6, 0.4, 0.5], fillK: 0.22, rim: DUSK_RIM, rimFrom: [1, 0],
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
  const c = layerOf(p);
  const w = r * 0.42;
  const sx = Math.cos(a);
  const pts: Pt[] = [[x, y - r], [x + w * Math.abs(sx) + w * 0.3, y - r * 0.15], [x + w * 0.2 * sx, y + r * 0.9], [x - w * Math.abs(sx) - w * 0.3, y - r * 0.15]];
  c.poly(pts, CYANS[2]);
  // its facets: the face toward us bright, the edge one darker, a seam down it as it turns
  const seam = x + w * 0.6 * sx;
  c.each((px, py) => (px + 0.5 < seam ? (py < y - r * 0.15 ? CYANS[1] : CYANS[2]) : py < y - r * 0.15 ? CYANS[2] : CYANS[3]));
  c.each((px, py) => (glow(px, py, x - w * 0.15, y - r * 0.3, r * 0.45) > 0.3 ? CYANS[0] : undefined));
  over(p, c, INK);
}

// =============================================================================================
// PAGE 2, BOX 2: THE MYSTIC in the wagon, lit from below by the crystal turning over her open palm: her great pale turban
// and its stone, the veil under her eyes, her purple robe, chains of gold at her throat; the wagon dark round her.

export function paintMystic(p: Px, t: number): void {
  const W = p.w;
  const H = p.h;
  const P = grid(W, H);
  const k = W / 192;
  const bob = Math.sin(t * 1.9) * 0.05;
  // THE CRYSTAL over her palm, in front of her: the light of the box
  const C3: V3 = [0.1, -1.55, 3.35 + bob];
  const cam = { look: unit([0.38, 1, -0.28]), up: [0, 0, 1] as V3, scale: 21 * k, ox: P(98, 0)[0], oy: P(0, 196)[1] };
  const right = unit([1, -0.42, 0]);
  const look = cam.look;
  const down: V3 = [right[1] * look[2] - right[2] * look[1], right[2] * look[0] - right[0] * look[2], right[0] * look[1] - right[1] * look[0]];
  const onScreen = (q: V3): Pt => {
    const rr = unit([look[1] * cam.up[2] - look[2] * cam.up[1], look[2] * cam.up[0] - look[0] * cam.up[2], look[0] * cam.up[1] - look[1] * cam.up[0]]);
    const dd = unit([look[1] * rr[2] - look[2] * rr[1], look[2] * rr[0] - look[0] * rr[2], look[0] * rr[1] - look[1] * rr[0]]);
    return [(q[0] * rr[0] + q[1] * rr[1] + q[2] * rr[2]) * cam.scale + cam.ox, (q[0] * dd[0] + q[1] * dd[1] + q[2] * dd[2]) * cam.scale + cam.oy];
  };
  void down;
  const cr = onScreen(C3);
  const glowAt = (x: number, y: number, r = W * 0.7): number => glow(x, y, cr[0], cr[1], r);
  // THE WAGON'S INSIDE: its canvas on its hoops, dark; the crystal's light on it in cold rings
  const inn = layerOf(p);
  inn.rect(0, 0, W, H, '#07060d');
  bands(inn, ['#07060d', '#0c0c18', '#121a26', '#1a2a34'], (x, y) => glowAt(x, y, W * 0.9) * 1.1 + (Math.abs(((x + y * 0.2) % (34 * k)) - 17 * k) < 1.2 * k ? 0.12 : 0));
  over(p, inn, null);
  // HER, SCULPTED: seated, turned a little to us; a tenth of a metre to a unit, up is z, she faces -y
  const f = mysticFigure(bob);
  f.draw(p, cam, { at: C3, hard: 1, fill: [0.15, -0.45, 1], fillK: 0.3, rim: '#5a4a8a', rimFrom: [-1, 0] });
  // THE CRYSTAL, turning over her palm, and its light
  paintCrystal(p, cr[0], cr[1], 14 * k, t * 1.2);
  halo(p, cr[0], cr[1], 24 * k, CYANS[2], 2, 0.2);
}

// =============================================================================================
// PAGE 2, BOX 3: THE STRANGER on the tailboard at the back of the wagon, lounging against its canvas, one boot up on the
// board, his hood down over his face (two points of gold all that is seen of it); a coin turning in the air over his hand.
// Behind him the road falling away down the mountain and the last of the dusk.

/** A coin in the air at (x, y), turned `a` (its face to us at 0): gold, a glint on its edge. */
function paintCoin(p: Px, x: number, y: number, r: number, a: number): void {
  const c = layerOf(p);
  const w = Math.max(1, Math.abs(Math.cos(a)) * r);
  c.ellipse(x, y, w, r, '#d09a20');
  c.each((px, py) => (px + 0.5 < x - w * 0.2 ? '#ffd866' : px + 0.5 > x + w * 0.5 ? '#7a5210' : undefined));
  over(p, c, INK);
  p.set(Math.round(x - w * 0.4), Math.round(y - r * 0.5), '#fff3b0');
}

export function paintStranger(p: Px, t: number): void {
  const W = p.w;
  const H = p.h;
  const P = grid(W, H);
  const k = W / 192;
  // THE ROAD BEHIND, falling away down the mountain into the dusk
  const sky = layerOf(p);
  sky.rect(0, 0, W, H, DUSK[2]);
  bands(sky, DUSK, (x, y) => 0.12 + glow(x, y, W * 0.2, H * 0.75, W * 1.0) * 0.95);
  over(p, sky, null);
  const far = layerOf(p);
  far.poly(loop([P(-4, 112), P(40, 104), P(90, 110), P(140, 98), P(200, 104), P(200, 180), P(-4, 180)], 6, [0, 4, 5, 6]), '#1a1430');
  far.each((x, y) => (!far.has(x, y - 1) ? '#8a4a5a' : undefined));
  over(p, far, INK);
  const rd = layerOf(p);
  rd.poly(band(path([P(-10, 180), P(30, 150), P(60, 126), P(84, 112)], 10), 46 * k, 6 * k), ROAD[1]);
  bands(rd, ROAD, (x, y) => 0.3 + glow(x, y, W * 0.2, H * 0.7, W * 0.6) * 0.8);
  over(p, rd, INK);
  // THE BACK OF THE WAGON: its canvas, its dark mouth, the tailboard he sits on
  const wag = layerOf(p);
  wag.poly(loop([P(80, -4), P(200, -4), P(200, 150), P(84, 150), P(78, 60)], 8, [0, 1, 2, 3]), CANVAS[0]);
  bands(wag, CANVAS, (x, y) => 0.06 + glow(x, y, W * 0.2, H * 0.6, W * 1.1) * 0.5 + Math.sin(x * 0.3 + y * 0.06) * 0.05);
  wag.poly(loop([P(104, 16), P(196, 10), P(198, 130), P(104, 134)], 8, [3]), '#05040a');
  over(p, wag, INK);
  over(p, solid(p, [P(76, 132), P(200, 128), P(200, 146), P(76, 152)], [INK, WOOD[1], WOOD[2], WOOD[3], WOOD[4]], [-1, -0.4, 0.3], { round: 0.3, hard: 1 }), INK);
  // HIM, SCULPTED: sitting sideways on the board, leaning back against the canvas; a tenth of a metre a unit, up is z
  const f = strangerFigure();
  f.draw(p, { look: unit([0.25, 1, -0.12]), up: [0, 0, 1], scale: 20 * k, ox: P(70, 0)[0], oy: P(0, 152)[1] }, {
    from: [-0.8, 0.6, 0.4], hard: 1, fill: [0.4, -0.8, 0.6], fillK: 0.24, rim: '#c87070', rimFrom: [-1, 0],
  });
  // THE COIN, turning in the air over his hand
  const toss = (t * 0.9) % 1;
  const cy = P(0, 70)[1] - Math.sin(toss * Math.PI) * 26 * k;
  paintCoin(p, P(118, 0)[0], cy, 4 * k, t * 9);
  // the caption, at its foot: the line runs on into the next box
  const say = '...seeking the Meldstone,';
  const [, ch] = captionSize(say, 70);
  caption(p, say, 6, H - ch - 2, 70);
}

// =============================================================================================
// PAGE 2, BOX 4: YOUR HERO AND YOUR WORDSMITH, walking beside the wagon up the road: the wordsmith (art/smith3.ts: a teal
// cowl open over his face, his long white beard and heavy brows, his night-blue robe and teal mantle, runes burning on him)
// with a rune alight in his open palm, the light of the box; the hero beside him (the knight: his pointed helm with its
// nasal bar over a coif of mail, the red tabard and its chevron, the dark red scarf, the great sword over his shoulder).
// THE HERO IS THE ONE CHOSEN: the knight, the ranger or the mage (`OPENING_HERO`).

/** Which hero walks in the opening: the class chosen for the new game. */
export const OPENING_HERO: { cls: 'warrior' | 'ranger' | 'mage' } = { cls: 'warrior' };

/** The town's wordsmith sculpted standing (up z, he faces -y), as on page 2: his palm up with a rune over it, or his hand up on the bar. */
function wordsmithFigure(hand: 'palm' | 'bar'): Figure {
  const f = new Figure();
  const robe = f.stuff({ tones: [INK, '#0e0c26', '#1a1642', '#2c2870', '#4844a2', '#7672d0'], hatch: 4, crease: 0.7 });
  const mantle = f.stuff({ tones: [INK, '#08283a', '#0c3a4e', '#16707e', '#2aa4a6', '#46c2bc'], crease: 0.7, paint: (q) => (runeOn(q) ? CYANS[0] : null) });
  const skinW = f.stuff({ tones: [INK, '#2a2056', '#5a4a8a', '#9a8cc6', '#d8d0f8', '#dff6fc'], hatch: 4, crease: 0.45 });
  const hair = f.stuff({ tones: [INK, '#3e3478', '#7468ae', '#bcb2e6', '#f0e8ff', '#ffffff'], meld: true, crease: 0.5 });
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
  {
    const a = (q: V3): V3 => q;
    const ax = (tilt = 0, roll = 0) => axes(0, tilt, roll);
    f.egg(robe, a([0, 0.05, 6.2]), [1.25, 0.85, 1.8], ax(), 0.8);
    f.rod(robe, a([0, 0.05, 5.0]), a([0, 0.15, 1.5]), 1.2, 1.5, 0.8);
    f.egg(robe, a([0, -0.05, 7.2]), [1.2, 0.82, 0.9], ax(), 0.8);
    f.egg(robe, a([-1.3, 0.05, 7.55]), [0.6, 0.6, 0.55], ax(), 0.6);
    f.egg(robe, a([1.3, 0.05, 7.55]), [0.6, 0.6, 0.55], ax(), 0.6);
    // his mantle over his shoulders, its two bands hanging down before him, burning with runes
    f.egg(mantle, a([0, 0.1, 7.85]), [1.68, 1.1, 0.68], ax(), 0.6);
    f.block(mantle, a([-0.62, -0.74, 5.8]), [0.3, 0.12, 1.75], 0.1, ax(), 0.4);
    f.block(mantle, a([0.62, -0.74, 5.8]), [0.3, 0.12, 1.75], 0.1, ax(), 0.4);
    // his cowl, open over his face, falling to his shoulders
    f.egg(mantle, a([0, 0.12, 9.2]), [0.98, 0.98, 1.08], ax(), 0.5);
    f.egg(mantle, a([0, -0.9, 8.98]), [0.7, 0.66, 0.95], ax(), 0.15, true);
    f.egg(mantle, a([0, 0.28, 8.45]), [1.1, 0.92, 0.55], ax(), 0.5);
    // his face: the eyes deep under the heavy brows, cyan; the nose; the beard, long and white, down his chest
    f.egg(skinW, a([0, -0.24, 9.05]), [0.62, 0.66, 0.8], ax(), 0.4);
    f.egg(skinW, a([-0.25, -0.89, 9.1]), [0.15, 0.1, 0.09], ax(), 0.08, true);
    f.egg(skinW, a([0.25, -0.89, 9.1]), [0.15, 0.1, 0.09], ax(), 0.08, true);
    f.rod(skinW, a([0, -0.92, 9.12]), a([0, -1.08, 8.82]), 0.09, 0.13, 0.15);
    f.mark(a([-0.25, -0.94, 9.08]), [CYANS[0], CYANS[1], CYANS[2]], 2);
    f.mark(a([0.25, -0.94, 9.08]), [CYANS[0], CYANS[1], CYANS[2]], 2);
    f.rod(hair, a([-0.13, -0.94, 9.22]), a([-0.62, -0.74, 9.44]), 0.1, 0.07, 0.1);
    f.rod(hair, a([0.13, -0.94, 9.22]), a([0.62, -0.74, 9.44]), 0.1, 0.07, 0.1);
    f.rod(hair, a([0, -1.04, 8.72]), a([-0.44, -0.9, 8.42]), 0.11, 0.08, 0.1);
    f.rod(hair, a([0, -1.04, 8.72]), a([0.44, -0.9, 8.42]), 0.11, 0.08, 0.1);
    f.egg(hair, a([0, -0.82, 8.38]), [0.58, 0.36, 0.5], ax(), 0.3);
    f.egg(hair, a([0, -0.86, 7.62]), [0.5, 0.3, 0.74], ax(0, -0.15), 0.4);
    f.egg(hair, a([0, -0.94, 6.82]), [0.36, 0.24, 0.62], ax(0, -0.1), 0.4);
    f.egg(hair, a([0, -0.96, 6.2]), [0.17, 0.16, 0.34], ax(), 0.3);
    for (const x of [-0.3, -0.1, 0.12, 0.32]) f.rod(hair, a([x, -1.12, 8.3]), a([x * 0.6, -1.22, 6.4]), 0.05, 0.04, 0.03, true);
    if (hand === 'palm') {
      // his arm out toward the young one beside him, the palm up, the rune alight over it
      f.rod(robe, a([1.35, 0, 7.6]), a([1.6, -1.05, 7.0]), 0.4, 0.36, 0.5);
      f.rod(robe, a([1.6, -1.05, 7.0]), a([1.28, -2.0, 7.82]), 0.36, 0.44, 0.4);
      f.egg(skinW, a([1.22, -2.3, 8.02]), [0.3, 0.3, 0.1], ax(), 0.25);
      for (let j = 0; j < 4; j++) {
        const u = -0.2 + j * 0.13;
        f.rod(skinW, a([1.22 + u, -2.52, 8.02]), a([1.22 + u * 1.1, -2.62, 8.2]), 0.065, 0.055, 0.08);
      }
      f.rod(skinW, a([0.93, -2.24, 8.02]), a([0.86, -2.44, 8.2]), 0.07, 0.06, 0.08);
    } else {
      // his arm up, his hand on the bar over him
      f.rod(robe, a([1.35, 0, 7.6]), a([1.9, -0.4, 9.2]), 0.4, 0.36, 0.5);
      f.rod(robe, a([1.9, -0.4, 9.2]), a([1.7, -0.6, 10.9]), 0.36, 0.42, 0.4);
      f.egg(skinW, a([1.7, -0.62, 11.2]), [0.26, 0.24, 0.3], ax(), 0.2);
    }
    // the other arm at his side
    f.rod(robe, a([-1.35, 0, 7.5]), a([-1.55, -0.2, 5.6]), 0.4, 0.4, 0.5);
  }
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
  const cam = { look: unit([0.04, 1, 0.1]), up: [0, 0, 1] as V3, scale: 20 * k, ox: P(50, 0)[0], oy: P(0, 240)[1] };
  const onScreen = (q: V3): Pt => {
    const rr = unit(cross(cam.look, cam.up));
    const dd = unit(cross(cam.look, rr));
    return [dt3(q, rr) * cam.scale + cam.ox, dt3(q, dd) * cam.scale + cam.oy];
  };
  /** Where a figure stands (`o`) and how it is turned (`yaw`, from facing us): its parts placed by its own measures. */
  const place = (o: V3, yaw: number) => {
    const c = Math.cos(yaw);
    const s = Math.sin(yaw);
    return {
      at: (q: V3): V3 => [o[0] + q[0] * c - q[1] * s, o[1] + q[0] * s + q[1] * c, o[2] + q[2]],
      back: (q: V3): V3 => [(q[0] - o[0]) * c + (q[1] - o[1]) * s, -(q[0] - o[0]) * s + (q[1] - o[1]) * c, q[2] - o[2]],
      ax: (tilt = 0, roll = 0, turn = 0) => axes(yaw + turn, tilt, roll),
    };
  };
  const A = place([0, 0, bobA], 0.35);
  const B = place([4.3, -0.4, bobB], -0.3);
  const R3 = A.at([1.2, -2.42, 8.5]);
  const rr = onScreen(R3);
  // THE DUSK behind them, the peaks under it, the slope they climb
  const sky = layerOf(p);
  sky.rect(0, 0, W, H, DUSK[2]);
  bands(sky, DUSK, (x, y) => 0.08 + glow(x, y, W * 0.15, H * 0.75, W * 1.1) * 1.0);
  over(p, sky, null);
  const far = layerOf(p);
  far.poly(loop([P(-4, 92), P(18, 76), P(34, 86), P(62, 58), P(80, 62), P(97, 34), P(104, 36), P(122, 62), P(146, 48), P(172, 72), P(200, 64), P(200, 180), P(-4, 180)], 6, [0, 5, 6, 11, 12]), '#1a1430');
  far.each((x, y) => (!far.has(x, y - 1) ? '#8a4a5a' : undefined));
  over(p, far, INK);
  // (the prison on the peak between their heads, where they are going; on the road below it, a point of cyan: the old
  // wordsmith's staff, far ahead of them)
  paintFarKeep(p, P(100, 34)[0], P(100, 34)[1], k);
  const ahead = P(90, 47);
  p.set(Math.round(ahead[0]), Math.round(ahead[1]), CYANS[0]).set(Math.round(ahead[0]) + 1, Math.round(ahead[1]), CYANS[2]).set(Math.round(ahead[0]), Math.round(ahead[1]) - 1, CYANS[1]);
  const hill = layerOf(p);
  hill.poly(loop([P(-4, 128), P(60, 118), P(130, 110), P(200, 98), P(200, 180), P(-4, 180)], 6, [3, 4, 5]), '#0e0b1a');
  bands(hill, ['#08060f', '#0e0b1a', '#171228', '#241a36'], (x, y) => 0.35 + glow(x, y, rr[0], rr[1], W * 0.55) * 0.9 + (fbm(x / 14, y / 5, 33) - 0.5) * 0.4);
  hill.each((x, y) => (!hill.has(x, y - 1) ? '#6a3248' : undefined));
  over(p, hill, null);
  // THE TWO OF THEM, sculpted together
  const f = new Figure();
  const robe = f.stuff({ tones: [INK, '#0e0c26', '#1a1642', '#2c2870', '#4844a2', '#7672d0'], hatch: 4, crease: 0.7 });
  const mantle = f.stuff({ tones: [INK, '#08283a', '#0c3a4e', '#16707e', '#2aa4a6', '#46c2bc'], crease: 0.7, paint: (q) => (runeOn(A.back(q)) ? CYANS[0] : null) });
  const skinW = f.stuff({ tones: [INK, '#2a2056', '#5a4a8a', '#9a8cc6', '#d8d0f8', '#dff6fc'], hatch: 4, crease: 0.45 });
  const hair = f.stuff({ tones: [INK, '#3e3478', '#7468ae', '#bcb2e6', '#f0e8ff', '#ffffff'], meld: true, crease: 0.5 });
  const red = f.stuff({ tones: [INK, '#2a0a10', '#5a1420', '#8e2230', '#c43a40', '#f07060'], hatch: 4, paint: (q) => (chevron(B.back(q)) ? '#e8d8c0' : null) });
  const scarf = f.stuff({ tones: [INK, '#1e060a', '#3e0c14', '#661822', '#922a32', '#c04a4a'] });
  const mail = f.stuff({ tones: [INK, '#1a1838', '#28245a', '#4a4690', '#7e7ac0', '#b8b4e8'], paint: (q, n, v) => ((Math.round(q[2] * 8) + Math.round(q[0] * 8 + q[1] * 3)) % 2 === 0 && v > 0.3 && v < 0.8 ? '#28245a' : null) });
  const steel = f.stuff({ tones: [INK, '#22204e', '#3a3478', '#7a74c8', '#d6d0ff', '#ffffff'] });
  const blade = f.stuff({ tones: [INK, '#1a3a5a', '#3a7aa0', '#7ad8f0', '#c8fcff', '#ffffff'] });
  const leath = f.stuff({ tones: [INK, '#1a0e0a', '#3a2216', '#5e3a22', '#8a5a34'] });
  const skinK = f.stuff({ tones: [INK, '#2a1a3a', '#5a3a5a', '#9a7a9a', '#d8c0d0', '#f0f8ff'], hatch: 4, crease: 0.45 });
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
  /** The tabard's chevron: a pale V across its front, in his own measures. */
  function chevron(q: V3): boolean {
    if (q[1] > -0.55) return false;
    return Math.abs(q[2] - (6.0 + Math.abs(q[0]) * 0.85)) < 0.16;
  }
  // THE WORDSMITH (art/smith3.ts), on the left, turned a little toward the light in his hand
  {
    const a = A.at;
    const ax = A.ax;
    f.egg(robe, a([0, 0.05, 6.2]), [1.25, 0.85, 1.8], ax(), 0.8);
    f.rod(robe, a([0, 0.05, 5.0]), a([0, 0.15, 1.5]), 1.2, 1.5, 0.8);
    f.egg(robe, a([0, -0.05, 7.2]), [1.2, 0.82, 0.9], ax(), 0.8);
    f.egg(robe, a([-1.3, 0.05, 7.55]), [0.6, 0.6, 0.55], ax(), 0.6);
    f.egg(robe, a([1.3, 0.05, 7.55]), [0.6, 0.6, 0.55], ax(), 0.6);
    // his mantle over his shoulders, its two bands hanging down before him, burning with runes
    f.egg(mantle, a([0, 0.1, 7.85]), [1.68, 1.1, 0.68], ax(), 0.6);
    f.block(mantle, a([-0.62, -0.74, 5.8]), [0.3, 0.12, 1.75], 0.1, ax(), 0.4);
    f.block(mantle, a([0.62, -0.74, 5.8]), [0.3, 0.12, 1.75], 0.1, ax(), 0.4);
    // his cowl, open over his face, falling to his shoulders
    f.egg(mantle, a([0, 0.12, 9.2]), [0.98, 0.98, 1.08], ax(), 0.5);
    f.egg(mantle, a([0, -0.9, 8.98]), [0.7, 0.66, 0.95], ax(), 0.15, true);
    f.egg(mantle, a([0, 0.28, 8.45]), [1.1, 0.92, 0.55], ax(), 0.5);
    // his face: the eyes deep under the heavy brows, cyan; the nose; the beard, long and white, down his chest
    f.egg(skinW, a([0, -0.24, 9.05]), [0.62, 0.66, 0.8], ax(), 0.4);
    f.egg(skinW, a([-0.25, -0.89, 9.1]), [0.15, 0.1, 0.09], ax(), 0.08, true);
    f.egg(skinW, a([0.25, -0.89, 9.1]), [0.15, 0.1, 0.09], ax(), 0.08, true);
    f.rod(skinW, a([0, -0.92, 9.12]), a([0, -1.08, 8.82]), 0.09, 0.13, 0.15);
    f.mark(a([-0.25, -0.94, 9.08]), [CYANS[0], CYANS[1], CYANS[2]], 2);
    f.mark(a([0.25, -0.94, 9.08]), [CYANS[0], CYANS[1], CYANS[2]], 2);
    f.rod(hair, a([-0.13, -0.94, 9.22]), a([-0.62, -0.74, 9.44]), 0.1, 0.07, 0.1);
    f.rod(hair, a([0.13, -0.94, 9.22]), a([0.62, -0.74, 9.44]), 0.1, 0.07, 0.1);
    f.rod(hair, a([0, -1.04, 8.72]), a([-0.44, -0.9, 8.42]), 0.11, 0.08, 0.1);
    f.rod(hair, a([0, -1.04, 8.72]), a([0.44, -0.9, 8.42]), 0.11, 0.08, 0.1);
    f.egg(hair, a([0, -0.82, 8.38]), [0.58, 0.36, 0.5], ax(), 0.3);
    f.egg(hair, a([0, -0.86, 7.62]), [0.5, 0.3, 0.74], ax(0, -0.15), 0.4);
    f.egg(hair, a([0, -0.94, 6.82]), [0.36, 0.24, 0.62], ax(0, -0.1), 0.4);
    f.egg(hair, a([0, -0.96, 6.2]), [0.17, 0.16, 0.34], ax(), 0.3);
    for (const x of [-0.3, -0.1, 0.12, 0.32]) f.rod(hair, a([x, -1.12, 8.3]), a([x * 0.6, -1.22, 6.4]), 0.05, 0.04, 0.03, true);
    // his arm out toward the young one beside him, the palm up, the rune alight over it
    f.rod(robe, a([1.35, 0, 7.6]), a([1.6, -1.05, 7.0]), 0.4, 0.36, 0.5);
    f.rod(robe, a([1.6, -1.05, 7.0]), a([1.28, -2.0, 7.82]), 0.36, 0.44, 0.4);
    f.egg(skinW, a([1.22, -2.3, 8.02]), [0.3, 0.3, 0.1], ax(), 0.25);
    for (let j = 0; j < 4; j++) {
      const u = -0.2 + j * 0.13;
      f.rod(skinW, a([1.22 + u, -2.52, 8.02]), a([1.22 + u * 1.1, -2.62, 8.2]), 0.065, 0.055, 0.08);
    }
    f.rod(skinW, a([0.93, -2.24, 8.02]), a([0.86, -2.44, 8.2]), 0.07, 0.06, 0.08);
    // the other arm at his side
    f.rod(robe, a([-1.35, 0, 7.5]), a([-1.55, -0.2, 5.6]), 0.4, 0.4, 0.5);
  }
  // THE HERO (the knight), on the right, nearer us, his great sword up at his shoulder, glancing to the light
  {
    const b = B.at;
    const bx = B.ax;
    f.egg(mail, b([0, 0, 6.2]), [1.3, 0.85, 1.8], bx(), 0.8);
    f.egg(mail, b([0, -0.05, 7.3]), [1.35, 0.9, 0.95], bx(), 0.8);
    f.block(red, b([0, -0.05, 6.0]), [1.12, 0.95, 1.75], 0.55, bx(), 0.3);
    f.egg(mail, b([-1.45, 0, 7.65]), [0.66, 0.7, 0.6], bx(), 0.5);
    f.egg(mail, b([1.45, 0, 7.65]), [0.66, 0.7, 0.6], bx(), 0.5);
    f.egg(steel, b([-1.5, 0, 7.98]), [0.68, 0.74, 0.34], bx(0, -0.35), 0.2);
    f.egg(steel, b([1.5, 0, 7.98]), [0.68, 0.74, 0.34], bx(0, 0.35), 0.2);
    // the scarf round his neck, its tail out on the wind beyond his shoulder
    f.egg(scarf, b([0, -0.12, 8.2]), [1.0, 0.92, 0.32], bx(), 0.3);
    f.rod(scarf, b([0.7, 0.4, 8.2]), b([2.0, 0.9, 8.0 + flap * 0.4]), 0.32, 0.25, 0.3);
    f.rod(scarf, b([2.0, 0.9, 8.0 + flap * 0.4]), b([3.1, 1.3, 8.5 - flap]), 0.25, 0.12, 0.25);
    // the coif of mail over his head and neck, open for his face; the face
    f.egg(mail, b([0, 0.05, 8.55]), [0.86, 0.84, 0.55], bx(), 0.5);
    f.egg(mail, b([0, 0.08, 9.1]), [0.8, 0.8, 0.85], bx(), 0.5);
    f.egg(mail, b([0, -0.86, 8.95]), [0.5, 0.52, 0.54], bx(), 0.12, true);
    f.egg(skinK, b([0, -0.18, 9.0]), [0.58, 0.66, 0.72], bx(), 0.4);
    f.rod(skinK, b([0, -0.82, 9.02]), b([0, -0.96, 8.78]), 0.08, 0.11, 0.12);
    f.mark(b([-0.22, -0.86, 9.05]), [CYANS[0], CYANS[1], CYANS[2]], 2);
    f.mark(b([0.22, -0.86, 9.05]), [CYANS[0], CYANS[1], CYANS[2]], 2);
    // the pointed helm: its brim, its dome rising to the point; the nasal bar down over his nose
    f.egg(steel, b([0, 0.05, 9.5]), [0.9, 0.9, 0.22], bx(), 0.1);
    f.egg(steel, b([0, 0.06, 9.82]), [0.84, 0.84, 0.48], bx(), 0.4);
    f.egg(steel, b([0, 0.08, 10.3]), [0.58, 0.58, 0.45], bx(), 0.4);
    f.egg(steel, b([0, 0.1, 10.75]), [0.32, 0.32, 0.4], bx(), 0.35);
    f.egg(steel, b([0, 0.12, 11.12]), [0.1, 0.1, 0.28], bx(), 0.25);
    f.rod(steel, b([0, -0.98, 9.48]), b([0, -1.02, 8.7]), 0.1, 0.08, 0.1);
    // his sword arm, the fist at his chest, the great sword up from it past his shoulder
    const G = b([1.3, -1.15, 8.1]);
    const tip = b([3.0, 1.0, 12.8]);
    const dir = unit(sub3(tip, G));
    const across = unit(cross(dir, [0, 1, 0]));
    const fist = add3(G, scale3(dir, -0.4));
    f.rod(mail, b([1.5, -0.05, 7.5]), b([1.85, -0.55, 6.4]), 0.42, 0.38, 0.5);
    f.rod(mail, b([1.85, -0.55, 6.4]), add3(fist, [0.1, 0.2, -0.25]), 0.38, 0.32, 0.4);
    f.egg(steel, fist, [0.3, 0.3, 0.32], bx(), 0.2);
    f.egg(steel, add3(G, scale3(dir, -0.95)), [0.15, 0.15, 0.15], bx(), 0);
    f.rod(leath, add3(G, scale3(dir, -0.85)), G, 0.1, 0.1, 0);
    f.rod(steel, add3(G, scale3(across, -0.5)), add3(G, scale3(across, 0.5)), 0.1, 0.1, 0);
    f.rod(blade, add3(G, scale3(dir, 0.08)), tip, 0.18, 0.08, 0);
    // the other arm down at his side
    f.rod(mail, b([-1.5, -0.05, 7.5]), b([-1.75, -0.3, 5.8]), 0.42, 0.38, 0.5);
  }
  f.draw(p, cam, { at: R3, hard: 1, fill: [0.1, -1, 0.15], fillK: 0.24, rim: '#f0a070', rimFrom: [0, -1] });
  // THE RUNE in his palm: a glyph of light, and its glow on the dusk
  for (let j = 0; j < 8; j++) {
    const an = (j / 8) * Math.PI * 2 + 0.2;
    const r0 = (j % 2 ? 7 : 6) * k;
    const r1 = r0 + (j % 2 ? 2 : 4) * k * flick;
    for (let r = r0; r <= r1; r += 0.7) p.set(Math.round(rr[0] + Math.cos(an) * r), Math.round(rr[1] - 1 + Math.sin(an) * r), r > r1 - 1.2 ? CYANS[2] : CYANS[1]);
  }
  const glyph = ['...#...', '..#.#..', '.#.#.#.', '..#.#..', '...#...', '...#...', '..###..'];
  const gx = Math.round(rr[0] - 3);
  const gy = Math.round(rr[1] - 5);
  for (let r = 0; r < glyph.length; r++) {
    for (let c = 0; c < glyph[r].length; c++) {
      if (glyph[r][c] !== '#') continue;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (glyph[r + dy]?.[c + dx] !== '#') p.set(gx + c + dx, gy + r + dy, CYANS[1]);
    }
  }
  for (let r = 0; r < glyph.length; r++) for (let c = 0; c < glyph[r].length; c++) if (glyph[r][c] === '#') p.set(gx + c, gy + r, CYANS[0]);
  // the caption, along the foot of the box
  const say = '...and the altar that wakes the words.';
  const [, ch] = captionSize(say, 92);
  caption(p, say, 6, H - ch - 2, 92);
}

/** The prison far off on its peak (its foot's middle at x, y; `k` the box's measure): a keep and two towers, black on the dusk, rimmed. */
function paintFarKeep(p: Px, x: number, y: number, k: number): void {
  const l = layerOf(p);
  const u = (a: number): number => a * k;
  l.rect(Math.round(x - u(8)), Math.round(y - u(6)), Math.round(u(16)), Math.round(u(7)), KEEP[0]);
  l.rect(Math.round(x - u(2)), Math.round(y - u(12)), Math.round(u(5)), Math.round(u(7)), KEEP[0]);
  for (const [tx, h] of [[-8, 9], [6, 8]] as const) {
    l.rect(Math.round(x + u(tx)), Math.round(y - u(h)), Math.round(u(3)), Math.round(u(h)), KEEP[0]);
    l.poly([[x + u(tx) - u(0.8), y - u(h)], [x + u(tx) + u(1.5), y - u(h) - u(4)], [x + u(tx) + u(3.8), y - u(h)]], KEEP[0]);
  }
  for (let c = -8; c < 8; c += 3) l.rect(Math.round(x + u(c)), Math.round(y - u(7)), Math.round(u(1.5)), Math.round(u(1)), KEEP[0]);
  l.each((px, py) => (!l.has(px, py - 1) || !l.has(px - 1, py) ? KEEP_RIM : undefined));
  over(p, l, null);
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

export function paintOldSmith(p: Px, t: number): void {
  const W = p.w;
  const H = p.h;
  const k = W / 231;
  const S = (x: number, y: number): Pt => [x * k, y * (H / 360)];
  const flick = 0.85 + 0.15 * Math.sin(t * 6.1);
  const gust = Math.sin(t * 1.3) * 0.15;
  // THE CAMERA: low on the road, looking up at him
  const cam = { look: unit([0.2, 1, 0.12]), up: [0, 0, 1] as V3, scale: 24 * k, ox: S(96, 0)[0], oy: S(0, 420)[1] };
  const onScreen = (q: V3): Pt => {
    const rr = unit(cross(cam.look, cam.up));
    const dd = unit(cross(cam.look, rr));
    return [dt3(q, rr) * cam.scale + cam.ox, dt3(q, dd) * cam.scale + cam.oy];
  };
  // where his staff points: up to the prison, top right
  const yaw = 0.95;
  const c = Math.cos(yaw);
  const sn = Math.sin(yaw);
  const at = (q: V3): V3 => [q[0] * c - q[1] * sn, q[0] * sn + q[1] * c, q[2]];
  const back = (q: V3): V3 => [q[0] * c + q[1] * sn, -q[0] * sn + q[1] * c, q[2]];
  const ax = (tilt = 0, roll = 0) => axes(yaw, tilt, roll);
  const fistL: V3 = [1.75, -0.55, 11.3];
  const F = at(fistL);
  const dir = unit([0.55, 0.3, 0.78]);
  const top = add3(F, scale3(dir, 5.0));
  const head3 = add3(top, scale3(dir, 0.35));
  const hs = onScreen(head3);
  const lamp = (x: number, y: number, r = W * 0.9): number => glow(x, y, hs[0], hs[1], r);
  // THE NIGHT COMING ON: the dusk sunk to a band low on the right, stars over it
  const sky = layerOf(p);
  sky.rect(0, 0, W, H, DUSK[1]);
  bands(sky, DUSK, (x, y) => -0.05 + glow(x, y, W * 1.05, H * 0.55, W * 1.2) * 0.75 + lamp(x, y, W * 0.45) * 0.2);
  sky.each((x, y) => (y < H * 0.5 && hash(x, y, 811) > 0.994 ? (hash(x, y, 812) > 0.5 ? '#e8e4ff' : '#9a94c8') : undefined));
  over(p, sky, null);
  // THE PRISON on its crag, top right, black on the last light; the far range under it, the valley's mist
  const far = layerOf(p);
  far.poly(loop([S(-4, 250), S(60, 228), S(110, 238), S(150, 214), S(196, 222), S(236, 206), S(236, 300), S(-4, 300)], 6, [0, 6, 7]), FAR[0]);
  bands(far, FAR, (x, y) => 0.3 + glow(x, y, W * 1.05, H * 0.55, W * 0.9) * 1.2);
  far.each((x, y) => (!far.has(x, y - 1) ? FAR_RIM : undefined));
  over(p, far, null);
  const crag = layerOf(p);
  crag.poly(loop([S(150, 240), S(160, 200), S(172, 186), S(170, 150), S(184, 124), S(182, 96), S(192, 70), S(194, 50), S(232, 46), S(236, 46), S(236, 244)], 3, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]), ROCK[0]);
  facets(crag, ROCK, [0.8, -0.5, 0.3], { cw: 14, ch: 9, seed: 731, tilt: [0.3, -0.6], spread: 0.8, extra: (x, y) => glow(x, y, W * 1.05, H * 0.5, W * 0.8) * 0.8 - 0.2 });
  crag.each((x, y) => (!crag.has(x, y - 1) || !crag.has(x + 1, y) ? ROCK_RIM : undefined));
  over(p, crag, INK);
  paintFarKeep(p, S(213, 48)[0], S(213, 48)[1], 2.3 * k);
  const mist = layerOf(p);
  mist.rect(0, Math.round(S(0, 262)[1]), W, Math.round(H * 0.2), '#3a2e58');
  mist.each((x, y) => (Math.sin(x * 0.05 + y * 0.3) + (fbm(x / 20, y / 6, 821) - 0.5) * 2 > 0.4 ? '#4a3a68' : undefined));
  over(p, mist, null);
  // THE ROCK WALL behind him, on the left, up out of the top
  const wall = layerOf(p);
  wall.poly(loop([S(-4, -4), S(70, -4), S(84, 60), S(70, 130), S(96, 210), S(110, 300), S(-4, 300)], 6, [0, 1, 6]), ROCK[0]);
  facets(wall, ROCK, [0.4, -0.6, 0.5], { cw: 18, ch: 12, seed: 733, tilt: [0.2, -0.4], spread: 0.9, extra: (x, y) => lamp(x, y, W * 0.7) * 1.2 - 0.25 });
  wall.each((x, y) => (!wall.has(x + 1, y) && lamp(x, y, W) > 0.12 ? '#2a6a6c' : undefined));
  over(p, wall, INK);
  // THE ROAD at the bend, its edge stones on the drop
  const rd = layerOf(p);
  rd.poly(loop([S(-4, 296), S(80, 288), S(160, 290), S(236, 300), S(236, 364), S(-4, 364)], 6, [0, 3, 4, 5]), ROAD[0]);
  bands(rd, ROAD, (x, y) => 0.25 + lamp(x, y, W * 0.8) * 0.9 + (fbm(x / 7, y / 3, 841) - 0.5) * 0.35);
  over(p, rd, INK);
  for (const [x, w] of [[132, 18], [156, 14], [176, 20], [202, 16], [222, 14]] as const) {
    const st = solid(p, [S(x, 300), S(x + 2, 288), S(x + w - 3, 287), S(x + w, 298), S(x + w - 1, 304), S(x + 1, 305)], ROCK, [0.2, -0.7, 0.6], { round: 0.6, hard: 1 });
    over(p, st, INK);
  }
  // HIM, SCULPTED: a tenth of a metre to a unit, up is z, his front toward -y before he is turned to the prison
  const f = new Figure();
  function runes(q0: V3): boolean {
    const q = back(q0);
    if (q[2] < 7.25 || q[2] > 7.7) return false;
    const a = Math.atan2(q[1], q[0]);
    const u = Math.floor(((a + Math.PI) / (Math.PI * 2)) * 44);
    const v = Math.floor((q[2] - 7.25) / 0.11);
    const pat = ['#.##', '.#.#', '##.#', '#..#'];
    return u % 3 !== 2 && pat[v % 4][(u + Math.floor(u / 3)) % 4] === '#';
  }
  const M = oldSmithStuffs(f, runes);
  // his robe, long, its hem blown back behind him; his boots under it
  f.rod(M.robe, at([0, 0.05, 6.0]), at([0, 0.2, 0.7]), 1.0, 1.45, 0.8);
  f.egg(M.robe, at([0, 0.5, 1.2]), [1.4, 1.5, 0.75], ax(), 0.7);
  f.rod(M.robe, at([0.1, 0.9, 2.8]), at([0.3, 2.3 + gust, 1.2]), 0.85, 0.35, 0.7);
  f.egg(M.leath, at([-0.42, -0.6, 0.3]), [0.3, 0.55, 0.28], ax(), 0.2);
  f.egg(M.leath, at([0.5, -0.2, 0.3]), [0.3, 0.55, 0.28], ax(), 0.2);
  // his body, his belt, the book at his hip
  f.egg(M.robe, at([0, 0, 7.4]), [1.12, 0.8, 1.6], ax(), 0.8);
  f.egg(M.robe, at([0, -0.05, 8.35]), [1.15, 0.78, 0.8], ax(), 0.8);
  f.egg(M.leath, at([0, 0, 6.05]), [1.08, 0.8, 0.15], ax(), 0.1);
  f.block(M.book, at([-1.12, -0.15, 5.25]), [0.2, 0.62, 0.78], 0.08, ax(), 0.1);
  f.rod(M.leath, at([-1.0, -0.3, 6.0]), at([-1.28, -0.2, 4.9]), 0.06, 0.06, 0);
  // his mantle over his shoulders and his arms to the elbow, its edge burning with runes
  f.egg(M.teal, at([0, 0.05, 8.95]), [1.55, 1.05, 0.62], ax(), 0.6);
  f.egg(M.teal, at([0, 0.1, 8.25]), [1.62, 1.1, 0.95], ax(), 0.5);
  // his head, tipped back to look up at the prison: the hood, the face in it, the grey beard
  const piv: V3 = [0, 0, 9.8];
  const hd = (q: V3): V3 => at(tipX(q, piv, -0.3));
  const hax = () => ax(-0.3);
  f.egg(M.teal, hd([0, 0.15, 10.6]), [0.95, 1.0, 1.05], hax(), 0.5);
  f.egg(M.teal, hd([0, -0.9, 10.45]), [0.62, 0.62, 0.86], hax(), 0.15, true);
  f.rod(M.teal, hd([0, 0.8, 11.2]), hd([0, 1.5, 10.1]), 0.36, 0.08, 0.4);
  f.egg(M.skin, hd([0, -0.24, 10.45]), [0.54, 0.62, 0.78], hax(), 0.4);
  f.egg(M.skin, hd([-0.22, -0.84, 10.62]), [0.13, 0.09, 0.08], hax(), 0.06, true);
  f.egg(M.skin, hd([0.22, -0.84, 10.62]), [0.13, 0.09, 0.08], hax(), 0.06, true);
  f.rod(M.skin, hd([0, -0.86, 10.62]), hd([0, -1.1, 10.22]), 0.08, 0.12, 0.12);
  f.mark(hd([-0.22, -0.9, 10.6]), [CYANS[0], CYANS[1], CYANS[2]], 2);
  f.mark(hd([0.22, -0.9, 10.6]), [CYANS[0], CYANS[1], CYANS[2]], 2);
  f.rod(M.brow, hd([-0.1, -0.9, 10.76]), hd([-0.5, -0.72, 10.9]), 0.075, 0.05, 0.06);
  f.rod(M.brow, hd([0.1, -0.9, 10.76]), hd([0.5, -0.72, 10.9]), 0.075, 0.05, 0.06);
  f.rod(M.hair, hd([0, -1.0, 10.1]), hd([-0.36, -0.86, 9.9]), 0.08, 0.06, 0.08);
  f.rod(M.hair, hd([0, -1.0, 10.1]), hd([0.36, -0.86, 9.9]), 0.08, 0.06, 0.08);
  f.egg(M.hair, hd([0, -0.72, 9.85]), [0.44, 0.3, 0.4], hax(), 0.3);
  f.egg(M.hair, hd([0, -0.78, 9.35]), [0.28, 0.22, 0.45], hax(), 0.3);
  f.egg(M.hair, hd([0, -0.76, 8.92]), [0.1, 0.1, 0.26], hax(), 0.25);
  // his far arm up, the fist round the staff; the staff up from it to the prison, its head burning
  f.rod(M.robe, at([1.3, 0, 8.7]), at([1.95, -0.25, 10.0]), 0.42, 0.36, 0.5);
  f.rod(M.robe, at([1.95, -0.25, 10.0]), at([1.78, -0.5, 11.05]), 0.36, 0.42, 0.4);
  f.egg(M.skin, F, [0.27, 0.27, 0.3], ax(), 0.2);
  f.rod(M.wood, add3(F, scale3(dir, -4.6)), top, 0.12, 0.11, 0);
  f.egg(M.wood, top, [0.24, 0.24, 0.3], ax(), 0.15);
  f.rod(M.wood, add3(top, scale3(dir, 0.1)), add3(top, [-0.35, 0.1, 0.55]), 0.09, 0.06, 0.15);
  // his near arm down, his hand on the book
  f.rod(M.robe, at([-1.3, 0, 8.7]), at([-1.5, 0.1, 7.2]), 0.4, 0.36, 0.5);
  f.rod(M.robe, at([-1.5, 0.1, 7.2]), at([-1.25, -0.4, 6.15]), 0.36, 0.34, 0.4);
  f.egg(M.skin, at([-1.2, -0.55, 6.05]), [0.24, 0.3, 0.2], ax(), 0.2);
  f.draw(p, cam, { at: head3, hard: 1, fill: [-0.1, -1, 0.35], fillK: 0.34, rim: '#e0885a', rimFrom: [1, 0] });
  // THE STAFF'S HEAD, burning: a knot of cyan fire, its rays
  const hx = hs[0];
  const hy = hs[1];
  for (let j = 0; j < 10; j++) {
    const an = (j / 10) * Math.PI * 2 + t * 0.6;
    const r0 = 5 * k;
    const r1 = r0 + (j % 2 ? 4 : 9) * k * flick;
    for (let r = r0; r <= r1; r += 0.6) p.set(Math.round(hx + Math.cos(an) * r), Math.round(hy + Math.sin(an) * r), r > r1 - 2 ? CYANS[2] : CYANS[1]);
  }
  const fire = layerOf(p);
  fire.ellipse(hx, hy, 4.5 * k, 5 * k, CYANS[1]);
  fire.each((x, y) => (glow(x, y, hx, hy, 5 * k) > 0.25 ? CYANS[0] : undefined));
  over(p, fire, null);
  // HIS WORDS
  const mouth = onScreen(hd([0, -1.0, 10.0]));
  balloon(p, 'Up there. The altar sleeps in the old prison.', Math.round(6 * k), Math.round(8 * k), 62, [mouth[0] - 4 * k, mouth[1] - 16 * k]);
}

// =============================================================================================
// PAGE 3, BOX 2: HIS EYES, close, under the rim of his hood: looking up at the prison, the cyan of them burning, the staff's
// light on his brow from above.

export function paintEyes(p: Px, t: number): void {
  const W = p.w;
  const H = p.h;
  const S = (x: number, y: number): Pt => [(x / 153) * W, (y / 176) * H];
  const k = W / 153;
  const flick = 0.9 + 0.1 * Math.sin(t * 6.1);
  /** His skin by the staff's cold light, from the darkest to the lit. */
  const SKIN: Tones = ['#140e20', '#2e2040', '#58405c', '#8a6a80', '#c0a0aa', '#ecd8de'];
  const GREY: Tones = ['#2a2638', '#4a4658', '#6e6a80', '#9a96aa', '#d8d4e4'];
  const L: V3 = [0.75, -0.75, 0.6];
  // the dark of his hood
  p.rect(0, 0, W, H, '#05090c');
  // HIS FACE, turned up to the right: the whole of it shaded round from the light above to the right
  const face = solid(p, [S(-6, 40), S(40, 30), S(110, 26), S(160, 34), S(160, 182), S(-6, 182)], SKIN, L, { c: S(96, 110), r: [W * 0.75, H * 0.75], round: 0.8, hard: 1, hatch: 4 });
  over(p, face, null);
  // his forehead's lines
  for (const [y, x0, x1] of [[46, 40, 128], [55, 30, 120], [63, 50, 112]] as const) {
    const pts: Pt[] = [];
    for (let x = x0; x <= x1; x += 4) pts.push(S(x, y + Math.sin((x - x0) * 0.05) * 2 - (x - x0) * 0.05));
    stroke(p, pts, 1);
  }
  // THE BROW, heavy, standing out over the eyes; the shadow it throws down over them
  over(p, solid(p, loop([S(8, 78), S(40, 66), S(76, 70), S(98, 62), S(140, 58), S(160, 62), S(160, 76), S(128, 78), S(98, 80), S(78, 86), S(44, 84)], 6), SKIN, L, { round: 1, hard: 1, rim: SKIN[5], back: [0.8, -0.6] }), INK);
  const sock = layerOf(p);
  sock.poly(loop([S(10, 86), S(42, 86), S(72, 90), S(70, 108), S(48, 116), S(18, 110)], 5), INK);
  sock.poly(loop([S(92, 84), S(128, 80), S(156, 82), S(156, 104), S(132, 116), S(100, 110)], 5), '#140e20');
  over(p, sock, null);
  // THE NOSE: its bridge down from between the brows, lit on its right, its shadow thrown to the left
  const nose = layerOf(p);
  nose.poly(loop([S(76, 86), S(90, 84), S(98, 130), S(104, 168), S(96, 182), S(70, 182), S(74, 140)], 5, [5]), SKIN[3]);
  shadeSolid(nose, SKIN, L, { round: 1, hard: 1, rim: SKIN[5], back: [1, -0.3] });
  over(p, nose, INK);
  const cast = layerOf(p);
  cast.poly(loop([S(76, 92), S(60, 118), S(46, 150), S(52, 182), S(72, 182), S(74, 140)], 5), '#140e20');
  cast.each((x, y) => (dot(x, y, 0.5) ? INK : undefined));
  over(p, cast, null);
  // THE CHEEK under the near eye, lit, the bags under the eye, the lines at its corner
  over(p, solid(p, loop([S(102, 118), S(132, 118), S(158, 112), S(160, 160), S(124, 168), S(104, 150)], 6), SKIN, L, { round: 1, hard: 1 }), null);
  for (const [x0, y0, x1, y1] of [[104, 120, 130, 122], [108, 128, 134, 128], [140, 96, 156, 90], [141, 101, 158, 101], [139, 106, 156, 112]] as const) stroke(p, [S(x0, y0), S(x1, y1)], 1);
  for (const [x0, y0, x1, y1] of [[22, 116, 46, 120], [26, 124, 50, 124]] as const) stroke(p, [S(x0, y0), S(x1, y1)], 1);
  // THE EYES, deep under the brow: almonds of the friend's cyan, burning, looking up to the right
  for (const [ex, ey, rw, rh] of [[40, 99, 15, 6], [118, 97, 19, 7.5]] as const) {
    const [cx, cy] = S(ex, ey);
    const w = rw * k;
    const h = rh * k;
    const eye = layerOf(p);
    eye.poly(loop([[cx - w, cy + 1], [cx - w * 0.3, cy - h], [cx + w * 0.55, cy - h * 0.9], [cx + w, cy - 1], [cx + w * 0.3, cy + h * 0.75], [cx - w * 0.5, cy + h * 0.65]], 4, [0, 3]), '#0c3038');
    const ix = cx + w * 0.3;
    const iy = cy - h * 0.25;
    const ir = h * 0.95;
    eye.each((x, y) => {
      const d = Math.hypot(x + 0.5 - ix, y + 0.5 - iy) / ir;
      return d < 0.45 ? '#e6ffff' : d < 0.8 ? CYANS[1] : d < 1.05 ? CYANS[2] : undefined;
    });
    over(p, eye, INK, 0, 0, 2);
    // the lid over its top, and the glint
    stroke(p, [[cx - w * 0.9, cy - h * 0.2], [cx - w * 0.3, cy - h - 1], [cx + w * 0.55, cy - h - 1], [cx + w, cy - 1]], 2);
    p.set(Math.round(ix + ir * 0.3), Math.round(iy - ir * 0.35), '#ffffff').set(Math.round(ix + ir * 0.3) + 1, Math.round(iy - ir * 0.35), '#ffffff');
    halo(p, ix, iy, 13 * k * flick, CYANS[2], 2, 0.16);
  }
  // HIS BROWS: grey, wild, swept up at their ends
  for (let j = 0; j < 110; j++) {
    const u = hash(j, 3, 951);
    const far = j < 44;
    const x0 = far ? 8 + u * 62 : 90 + u * 68;
    const y0 = (far ? 82 - u * 14 : 76 - u * 14) + (hash(j, 7, 951) - 0.5) * 7;
    const len = 7 + hash(j, 4, 951) * 11 + u * 6;
    const an = (far ? -0.1 : -0.15) - u * 0.75 + (hash(j, 5, 951) - 0.5) * 0.5;
    const mid: Pt = S(x0 + Math.cos(an) * len * 0.5, y0 + Math.sin(an) * len * 0.5 - 1.5);
    const pts: Pt[] = [S(x0, y0), mid, S(x0 + Math.cos(an) * len, y0 + Math.sin(an) * len + 1)];
    const lit = Math.min(GREY.length - 1, Math.floor(hash(j, 6, 951) * 3) + (far ? 0 : 2));
    stroke(p, pts, hash(j, 8, 951) > 0.6 ? 2 : 1, j % 9 === 0 ? INK : GREY[lit]);
  }
  // THE RIM OF HIS HOOD over it all: teal, heavy, lit along its edge by the staff
  const hood = layerOf(p);
  hood.poly(loop([S(-6, -6), S(160, -6), S(160, 30), S(136, 26), S(100, 22), S(60, 28), S(24, 40), S(-6, 52)], 6, [0, 1]), '#1a4448');
  shadeSolid(hood, ['#071a1e', '#0e2a30', '#1a4448', '#2a6a6c', '#3e9290', '#6ad0c8'], [0.6, -0.4, 0.8], { round: 0.6, hard: 1, hatch: 4 });
  hood.each((x, y) => (!hood.has(x, y + 1) || !hood.has(x, y + 2) ? '#8af0e8' : undefined));
  over(p, hood, INK, 0, 0, 2);
  for (const [x0, y0, x1, y1] of [[30, 2, 46, 30], [70, 0, 78, 22], [112, 0, 116, 18]] as const) stroke(p, [S(x0, y0), S((x0 + x1) / 2 + 3, (y0 + y1) / 2), S(x1, y1)], 1);
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
  bands(sky, DUSK, (x, y) => -0.1 + (1 - y / H) * 0.0 + glow(x, y, W * 1.1, H * 0.2, W * 1.0) * 0.5);
  sky.each((x, y) => (hash(x, y, 911) > 0.993 ? (hash(x, y, 912) > 0.5 ? '#e8e4ff' : '#8a84b8') : undefined));
  over(p, sky, null);
  // THE ROCKS: a great shelf of them leaning out over the road from the left, boulders on its lip
  const r = layerOf(p);
  r.poly(loop([[-4, H * 0.3], [W * 0.3, H * 0.42], [W * 0.58, H * 0.4], [W * 0.78, H * 0.5], [W * 0.9, H * 0.66], [W + 4, H * 0.7], [W + 4, H + 4], [-4, H + 4]], 6, [0, 5, 6, 7]), ROCK[0]);
  facets(r, ROCK, [0.6, -0.5, 0.4], { cw: 16, ch: 10, seed: 931, tilt: [0.3, -0.5], spread: 0.8, extra: (x, y) => glow(x, y, W * 1.1, H * 0.2, W * 0.9) * 0.6 - 0.35 });
  r.each((x, y) => (!r.has(x, y - 1) ? ROCK_RIM : undefined));
  over(p, r, INK);
  for (const [x, y, s, seed] of [[W * 0.2, H * 0.4, 13, 1], [W * 0.46, H * 0.4, 10, 2], [W * 0.66, H * 0.46, 15, 3]] as const) {
    const pts: Pt[] = [];
    for (let j = 0; j < 7; j++) {
      const an = (j / 7) * Math.PI * 2;
      const rr = s * k * (0.75 + hash(j, seed, 941) * 0.4);
      pts.push([x + Math.cos(an) * rr * 1.2, y - Math.abs(Math.sin(an)) * rr * 0.4 + Math.sin(an) * rr * 0.7]);
    }
    over(p, solid(p, pts, ROCK, [0.6, -0.6, 0.5], { round: 0.5, hard: 1, rim: ROCK_RIM }), INK);
  }
  // A HOOD between the boulders, black on the stars, its point leaning; in it, two slits of pink; beside it, the glint
  const hx = W * 0.56;
  const hy = H * 0.34;
  const q = 1.7 * k;
  const hood = layerOf(p);
  hood.poly(loop([[hx - 17 * q, hy + 10 * q], [hx - 13 * q, hy + 5 * q], [hx - 8 * q, hy + 3 * q], [hx - 7 * q, hy - 3 * q], [hx - 2 * q, hy - 9 * q], [hx + 3 * q, hy - 14 * q], [hx + 5 * q, hy - 7 * q], [hx + 8 * q, hy + 1 * q], [hx + 12 * q, hy + 4 * q], [hx + 16 * q, hy + 10 * q]], 4, [0, 5, 9]), '#0a0814');
  hood.each((x, y) => (!hood.has(x, y - 1) || !hood.has(x + 1, y) ? KEEP_RIM : undefined));
  over(p, hood, INK);
  if (blink > 0.15) {
    for (const sd of [-1, 1]) {
      const ex = Math.round(hx + sd * 3.4 * q);
      const ey = Math.round(hy);
      p.set(ex - 2 * sd, ey - 1, '#c02a6a').set(ex - sd, ey - 1, '#ff5aa0').set(ex, ey, '#ff5aa0').set(ex + sd, ey, '#ffb0d0');
    }
  }
  // the glint: a blade's edge catching the last light, a four-pointed spark of pink
  const gx = Math.round(hx + 16 * q);
  const gy = Math.round(hy + 5 * q);
  const g = Math.round((3 + blink * 5) * k);
  for (let d = -g; d <= g; d++) {
    const c = Math.abs(d) < 2 ? '#ffffff' : Math.abs(d) < g * 0.6 ? '#ffb0d0' : '#ff5aa0';
    p.set(gx + d, gy, c);
    p.set(gx, gy + d, c);
  }
  for (const [dx, dy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) p.set(gx + dx, gy + dy, '#ffb0d0');
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
function frame(z0: V3, xHint: V3): readonly [V3, V3, V3] {
  const z = unit(z0);
  const x = unit(sub3(xHint, scale3(z, dt3(xHint, z))));
  return [x, cross(z, x), z];
}
function lerp3(a: V3, b: V3, u: number): V3 {
  return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
}

/** A cultist sculpted into `f` at `o`, turned `yaw`: where his torch burns (if he has one), and his eyes. */
function sculptCultist(f: Figure, o: V3, yaw: number, P: CultPose, eyeW = 1): { torch: V3 | null; eyes: V3[] } {
  const c = Math.cos(yaw);
  const sn = Math.sin(yaw);
  const rot = (q: V3): V3 => [q[0] * c - q[1] * sn, q[0] * sn + q[1] * c, q[2]];
  const at = (q: V3): V3 => add3(o, rot(q));
  const fr = (z: V3, x: V3 = [1, 0, 0]): readonly [V3, V3, V3] => frame(z, x).map(rot) as unknown as readonly [V3, V3, V3];
  const robe = f.stuff({ tones: [INK, '#1e1030', '#341a4e', '#4e2a6e', '#6e3e8e', '#a86a9e'], hatch: 4, crease: 0.8 });
  const stole = f.stuff({ tones: [INK, '#4a0c2a', '#7a1a44', '#b02a60', '#e04a88', '#ff8ab8'], crease: 0.6 });
  const rag = f.stuff({ tones: [INK, '#120c16', '#221826', '#342636', '#4a3a48', '#6a5662'], crease: 0.6 });
  const bone = f.stuff({ tones: [INK, '#2e2638', '#5e5268', '#968aa0', '#cabed0', '#f0e8f0'], crease: 0.4 });
  const rope = f.stuff({ tones: [INK, '#2a1a10', '#4a3420', '#6e5434', '#94784c'] });
  const dark = f.stuff({ tones: [INK, INK, '#0a0812', '#0e0a16'] });
  const ivory = f.stuff({ tones: [INK, '#4a4030', '#8a7c60', '#c8b890', '#efe4c4', '#ffffff'] });
  const wood = f.stuff({ tones: [INK, '#2a1a10', '#4a2e1a', '#6e4a2a', '#9a6e40'] });
  const H = P.hip;
  const C = P.chest;
  const u = unit(sub3(C, H));
  const fwd = unit(sub3([0, -1, 0], scale3(u, dt3([0, -1, 0], u))));
  const across: V3 = unit(cross(fwd, u)).map((v) => -v) as unknown as V3;
  const waist = lerp3(H, C, 0.22);
  // HIS ROBE: the chest and shoulders broad, the waist narrow where the rope girds it, the skirt flaring to a ragged hem at his
  // knees, split before for his stride; its folds
  f.egg(robe, at(lerp3(H, C, 0.78)), [1.05, 0.66, 0.92], fr(u, across), 0.7);
  f.rod(robe, at(lerp3(H, C, 0.55)), at(waist), 0.8, 0.64, 0.6);
  f.rod(robe, at(waist), at(P.hem), 0.66, 1.2, 0.3);
  const skirt = unit(sub3(P.hem, waist));
  f.rod(robe, at(add3(P.hem, scale3(fwd, 1.0))), at(add3(lerp3(waist, P.hem, 0.35), scale3(fwd, 0.7))), 0.28, 0.04, 0.12, true);
  // (its hem ragged: slits cut up into it, long and short)
  for (let i = 0; i < 16; i++) {
    const an = (i / 16) * Math.PI * 2 + 0.2;
    const ring = add3(scale3(across, Math.cos(an) * 1.25), scale3(fwd, Math.sin(an) * 1.1));
    const lo = add3(add3(P.hem, scale3(skirt, 0.4)), ring);
    const hi = add3(add3(P.hem, scale3(skirt, -0.35 - 0.45 * hash(i, 1, 1011))), scale3(ring, 0.92));
    f.rod(robe, at(lo), at(hi), 0.09, 0.02, 0.04, true);
  }
  for (const an of [-1.2, -0.5, 0.25, 1.0, 2.2, 3.4]) {
    const dirn = add3(scale3(across, Math.cos(an)), scale3(fwd, Math.sin(an)));
    f.rod(robe, at(add3(lerp3(waist, P.hem, 0.2), scale3(dirn, 0.76))), at(add3(P.hem, scale3(dirn, 1.2))), 0.05, 0.08, 0.05, true);
  }
  f.egg(rope, at(waist), [0.72, 0.6, 0.11], fr(u, across), 0.08);
  f.egg(rope, at(add3(add3(waist, scale3(fwd, 0.6)), scale3(across, 0.25))), [0.12, 0.1, 0.12], fr(u), 0.05);
  f.rod(rope, at(add3(add3(waist, scale3(fwd, 0.62)), scale3(across, 0.25))), at(add3(add3(waist, scale3(fwd, 0.72)), add3(scale3(across, 0.32), scale3(u, -1.1)))), 0.05, 0.05, 0);
  // his cape of the cowl over his shoulders
  f.egg(robe, at(add3(C, scale3(u, 0.45))), [1.28, 0.82, 0.42], fr(u, across), 0.5);
  // HIS LEGS: the thighs under the skirt, the shins bound in rags (the bindings' ridges), the feet wrapped
  for (const j of [0, 1] as const) {
    f.rod(robe, at(add3(H, scale3(across, j ? 0.45 : -0.45))), at(P.kn[j]), 0.46, 0.34, 0.4);
    f.rod(rag, at(P.kn[j]), at(P.ft[j]), 0.27, 0.2, 0.3);
    const shin = unit(sub3(P.ft[j], P.kn[j]));
    for (const w of [0.3, 0.55, 0.8]) f.egg(rag, at(lerp3(P.kn[j], P.ft[j], w)), [0.3, 0.3, 0.05], fr(shin), 0.04, true);
    f.egg(rag, at(add3(P.ft[j], scale3(fwd, 0.3))), [0.22, 0.42, 0.18], fr([0, 0, 1], across), 0.2);
  }
  // HIS ARMS: the sleeves pushed back and bunched at the elbows, the forearms bare and bony, the hands claws
  for (const j of [0, 1] as const) {
    const sh = P.sh[j];
    const el = P.el[j];
    const ha = P.ha[j];
    const up = unit(sub3(el, sh));
    const lo = unit(sub3(ha, el));
    f.egg(robe, at(sh), [0.5, 0.5, 0.46], fr(u, across), 0.5);
    f.rod(robe, at(sh), at(el), 0.36, 0.44, 0.4);
    f.egg(robe, at(add3(el, scale3(up, -0.1))), [0.52, 0.52, 0.36], fr(up), 0.3);
    f.rod(bone, at(add3(el, scale3(lo, 0.2))), at(lerp3(el, ha, 0.86)), 0.19, 0.12, 0.15);
    f.egg(bone, at(lerp3(el, ha, 0.32)), [0.2, 0.2, 0.42], fr(lo), 0.15);
    const holding = (P.dagger && P.dagger.hand === j) || (P.torch && P.torch.hand === j);
    if (holding) f.egg(bone, at(ha), [0.2, 0.2, 0.22], fr(lo), 0.15);
    else {
      f.egg(bone, at(ha), [0.18, 0.08, 0.2], fr(lo, across), 0.12);
      for (let i = 0; i < 4; i++) {
        const sp = (i - 1.5) * 0.12;
        const base = add3(add3(ha, scale3(lo, 0.16)), scale3(across, sp));
        const tip = add3(add3(base, scale3(lo, 0.34)), add3(scale3(across, sp * 1.4), scale3(fwd, 0.14)));
        const hook = add3(tip, add3(scale3(lo, 0.12), scale3(fwd, 0.18)));
        f.rod(bone, at(base), at(tip), 0.055, 0.045, 0.05);
        f.rod(bone, at(tip), at(hook), 0.045, 0.02, 0.03);
      }
    }
  }
  // THE STOLE: two bands of the cult's pink, from behind his neck over his collar and down his front past the rope
  for (const sd of [-1, 1]) {
    const top = add3(add3(C, scale3(u, 0.3)), add3(scale3(across, sd * 0.36), scale3(fwd, 0.6)));
    const bot = add3(add3(waist, scale3(u, -1.0)), add3(scale3(across, sd * 0.42), scale3(fwd, 0.86)));
    const along = sub3(bot, top);
    f.block(stole, at(lerp3(top, bot, 0.5)), [0.17, 0.05, Math.hypot(along[0], along[1], along[2]) / 2], 0.03, fr(along, across), 0.05);
  }
  // HIS COWL, deep, its point fallen back; the dark in it; his eyes, two slashes of pink
  const hd = P.head;
  const hu = unit(sub3(hd, add3(C, scale3(u, 0.6))));
  const hf = unit(sub3(fwd, scale3(hu, dt3(fwd, hu))));
  const hx = (q: readonly [number, number, number]): V3 => add3(hd, add3(add3(scale3(across, q[0]), scale3(hf, -q[1])), scale3(hu, q[2])));
  const hfr = fr(hu, across);
  f.egg(robe, at(hd), [0.84, 0.9, 0.95], hfr, 0.5);
  f.rod(robe, at(hx([0, 0.3, 0.7])), at(hx([0, 1.4, 1.35])), 0.46, 0.05, 0.45);
  f.egg(robe, at(hx([0, -0.85, -0.05])), [0.55, 0.5, 0.7], hfr, 0.15, true);
  f.egg(dark, at(hx([0, -0.15, -0.05])), [0.55, 0.6, 0.68], hfr, 0.3);
  const eyes: V3[] = [];
  for (const sd of [-1, 1]) eyes.push(at(hx([sd * 0.16, -0.78, 0])), at(hx([sd * 0.26, -0.76, 0.06])), at(hx([sd * 0.34, -0.72, 0.11])));
  for (const e of eyes) f.mark(e, ['#ff8ab8', '#ff5aa0', '#c02a6a'], eyeW);
  // THE DAGGER: a long wavy blade of bone from his fist, a dark guard, the grip bound in pink
  if (P.dagger) {
    const h = P.dagger.hand;
    const dd = unit(sub3(P.dagger.to, P.ha[h]));
    const side = unit(cross(dd, Math.abs(dd[2]) > 0.9 ? [1, 0, 0] : [0, 0, 1]));
    let prev = add3(P.ha[h], scale3(dd, 0.24));
    f.rod(dark, at(add3(prev, scale3(side, -0.3))), at(add3(prev, scale3(side, 0.3))), 0.07, 0.07, 0);
    f.rod(stole, at(add3(P.ha[h], scale3(dd, -0.32))), at(prev), 0.08, 0.08, 0);
    for (let i = 1; i <= 6; i++) {
      const q = add3(add3(P.ha[h], scale3(dd, 0.24 + i * 0.34)), scale3(side, (i % 2 ? 0.08 : -0.08) * (i < 6 ? 1 : 0)));
      f.rod(ivory, at(prev), at(q), 0.12 - i * 0.014, 0.11 - i * 0.016, 0.05);
      prev = q;
    }
  }
  // A TORCH: its haft up from his fist, the rag bound round its head, burning
  let torch: V3 | null = null;
  if (P.torch) {
    const h = P.torch.hand;
    const dd = unit(sub3(P.torch.to, P.ha[h]));
    const top = add3(P.ha[h], scale3(dd, 2.0));
    f.rod(wood, at(add3(P.ha[h], scale3(dd, -0.6))), at(top), 0.1, 0.12, 0);
    f.egg(rag, at(top), [0.2, 0.2, 0.3], fr(dd), 0.1);
    torch = at(add3(top, scale3(dd, 0.3)));
  }
  return { torch, eyes };
}

/** One cultist, big, to look at: tsx dbg paintCultistTest. */
export function paintCultistTest(p: Px, t: number): void {
  p.rect(0, 0, p.w, p.h, '#2a2440');
  const f = new Figure();
  const r = sculptCultist(f, [0, 0, 0], 0.6, AMBUSH_POSES.run(0.4, t * 8 + 0.8, 1));
  const cam = { look: unit([0.1, 1, -0.05]), up: [0, 0, 1] as V3, scale: 26, ox: p.w * 0.3, oy: p.h * 0.95 };
  f.draw(p, cam, { at: [3, -4, 9], hard: 1, fill: [-0.5, -1, 0.5], fillK: 0.35, rim: '#ffb060', rimFrom: [1, 0.3] });
  void r;
  const g = new Figure();
  sculptCultist(g, [0, 0, 0], 0.9, AMBUSH_POSES.leap);
  g.draw(p, { ...cam, ox: p.w * 0.5 + 170, oy: p.h * 0.9 }, { at: [3, -4, 9], hard: 1, fill: [-0.5, -1, 0.5], fillK: 0.35, rim: '#ffb060', rimFrom: [1, 0.3] });
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
    hip: [0, 0.4, 5.4], chest: [0, -1.4, 7.3], head: [0, -2.4, 8.6],
    sh: [[-1.15, -1.3, 7.9], [1.15, -1.3, 7.9]],
    el: [[-1.6, -0.6, 9.4], [1.5, -2.6, 7.2]],
    ha: [[-1.1, -1.1, 10.7], [1.2, -3.8, 6.7]],
    kn: [[-0.5, -1.6, 4.4], [0.5, 1.4, 3.4]],
    ft: [[-0.5, -1.0, 2.2], [0.5, 2.9, 2.6]],
    hem: [0, 0.9, 3.2],
    dagger: { hand: 0, to: [-0.6, -2.8, 12.6] },
  } as CultPose,
};

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

export function paintAmbush(p: Px, t: number): void {
  const W = p.w;
  const H = p.h;
  const S = (x: number, y: number): Pt => [(x / 392) * W, (y / 360) * H];
  const k = W / 392;
  const flick = 0.85 + 0.15 * Math.sin(t * 9.1);
  const boom = S(318, 250);
  const fire = (x: number, y: number, r = W * 0.6): number => glow(x, y, boom[0], boom[1], r) * flick;
  // THE NIGHT, the prison's crag far off right, black on it
  const sky = layerOf(p);
  sky.rect(0, 0, W, H, DUSK[0]);
  bands(sky, DUSK, (x, y) => -0.05 + glow(x, y, W * 0.95, H * 0.15, W * 0.7) * 0.4 + fire(x, y, W * 0.8) * 0.55);
  sky.each((x, y) => (y < H * 0.4 && hash(x, y, 971) > 0.994 ? '#c8c4f0' : undefined));
  over(p, sky, null);
  const crag = layerOf(p);
  crag.poly(loop([S(296, 170), S(306, 140), S(318, 132), S(322, 104), S(334, 92), S(338, 66), S(350, 52), S(392, 48), S(396, 48), S(396, 176)], 2, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]), KEEP[0]);
  crag.each((x, y) => (!crag.has(x, y - 1) ? KEEP_RIM : undefined));
  over(p, crag, null);
  paintFarKeep(p, S(368, 46)[0], S(368, 46)[1], 1.8 * k);
  // THE SLOPE they pour down, from the top left to the road at the bottom right; the road
  const slope = layerOf(p);
  slope.poly(loop([S(-4, 40), S(70, 60), S(150, 100), S(230, 150), S(300, 196), S(396, 214), S(396, 364), S(-4, 364)], 6, [0, 6, 7]), ROCK[0]);
  facets(slope, ROCK, [0.5, -0.6, 0.5], { cw: 22, ch: 12, seed: 981, tilt: [0.5, -0.4], spread: 0.8, extra: (x, y) => fire(x, y, W * 0.7) * 1.3 - 0.15 });
  slope.each((x, y) => (!slope.has(x, y - 1) ? (fire(x, y) > 0.08 ? '#e07848' : ROCK_RIM) : undefined));
  over(p, slope, INK);
  const road = layerOf(p);
  road.poly(loop([S(160, 364), S(240, 300), S(300, 276), S(396, 262), S(396, 364)], 6, [0, 3, 4]), ROAD[0]);
  bands(road, ROAD, (x, y) => 0.2 + fire(x, y, W * 0.6) * 1.3 + (fbm(x / 7, y / 3, 983) - 0.5) * 0.3);
  over(p, road, INK);
  // THE FAR ONES, a stream of them along the ridge: hooded shapes black on the night, their eyes pink, torches high
  const swarm = layerOf(p);
  const flames: [number, number, number][] = [];
  const pinks: Pt[] = [];
  for (let j = 0; j < 11; j++) {
    const u = j / 10;
    const x = S(20 + u * 210, 0)[0] + (hash(j, 1, 991) - 0.5) * 12 * k;
    const y = S(0, 52 + u * u * 70 + u * 40)[1] + (hash(j, 2, 991) - 0.5) * 8 * k;
    const s = (0.75 + u * 0.5) * k;
    const lean = (hash(j, 3, 991) - 0.3) * 3 * s;
    const step = Math.sin(t * 8 + j * 1.7) * 2 * s;
    swarm.poly(loop([[x - 6 * s, y + 18 * s], [x - 5 * s + lean, y + 4 * s], [x - 3 * s + lean, y - 4 * s], [x + lean * 1.5 + 1 * s, y - 12 * s], [x + 4 * s + lean, y - 3 * s], [x + 6 * s + lean, y + 5 * s], [x + 8 * s + step, y + 18 * s], [x + 2 * s, y + 13 * s], [x - 2 * s - step, y + 18 * s]], 3, [3, 6, 8]), '#0a0814');
    pinks.push([x + lean + 2 * s, y - 3 * s]);
    if (j % 3 !== 1) {
      const tx = x + 9 * s + lean;
      const ty = y - 6 * s;
      swarm.poly(band([[x + 5 * s + lean, y + 4 * s], [tx, ty]], 1.4 * s), '#0a0814');
      flames.push([tx, ty - 1 * s, s * 0.55]);
    }
  }
  swarm.each((x, y) => (fire(x, y, W * 0.9) > 0.05 && !swarm.has(x + 1, y) ? '#c0604a' : undefined));
  over(p, swarm, INK);
  for (const [x, y] of pinks) p.set(Math.round(x), Math.round(y), '#ff5aa0').set(Math.round(x) - 2, Math.round(y), '#ff5aa0');
  flames.forEach(([x, y, s], j) => paintFlame(p, x, y, s, t, j));
  // THE LAST WAGON, bottom right, its canvas bursting into fire where the bomb struck it
  const wag = layerOf(p);
  wag.poly(loop([S(262, 330), S(266, 262), S(286, 232), S(330, 220), S(380, 226), S(400, 246), S(400, 330)], 6, [0, 6]), CANVAS[0]);
  bands(wag, CANVAS, (x, y) => fire(x, y, W * 0.5) * 1.4 + Math.sin(x * 0.3 + y * 0.05) * 0.05 - 0.1);
  over(p, wag, INK);
  over(p, solid(p, [S(254, 328), S(400, 322), S(400, 342), S(254, 348)], [INK, WOOD[1], WOOD[2], WOOD[3], WOOD[4]], [0.6, -0.6, 0.4], { round: 0.3, hard: 1 }), INK);
  paintWheel(p, S(290, 352)[0], S(290, 352)[1], 26 * k, (x, y) => fire(x, y, W * 0.4), t);
  // THE BURST: a ragged star of fire, white at its heart, the canvas torn round it; smoke rolling up off it; sparks flung
  const smoke = layerOf(p);
  const puffs: Pt[][] = [];
  for (let j = 0; j < 8; j++) {
    const a = -Math.PI / 2 + (hash(j, 1, 1001) - 0.55) * 1.9;
    const r = (30 + j * 9 + t * 5 * hash(j, 3, 1001)) * k;
    const cx = boom[0] + Math.cos(a) * r;
    const cy = boom[1] - 16 * k + Math.sin(a) * r * 1.1;
    const rr = (13 + hash(j, 4, 1001) * 12 + j * 1.5) * k;
    // (a billow: lobes round its rim, flattened under, as smoke rolls)
    const pts: Pt[] = [];
    for (let i = 0; i < 14; i++) {
      const b = (i / 14) * Math.PI * 2;
      const lobe = 0.78 + 0.3 * Math.abs(Math.sin(b * 3.5 + j)) + (hash(i, j, 1005) - 0.5) * 0.12;
      pts.push([cx + Math.cos(b) * rr * lobe * 1.15, cy + Math.sin(b) * rr * lobe * (Math.sin(b) > 0 ? 0.6 : 0.95)]);
    }
    puffs.push(pts);
  }
  for (const pts of puffs) smoke.poly(loop(pts, 3), '#2a2034');
  bands(smoke, ['#1a1222', '#2e2236', '#46344c', '#644450', '#94583e'], (x, y) => 0.15 + fire(x, y, W * 0.55) * 1.6 + (fbm(x / 9, y / 9, 1003) - 0.5) * 0.5);
  over(p, smoke, INK);
  // (the billows' lower edges, inked where one rolls over the next)
  for (const pts of puffs.slice(1)) {
    const lower = loop(pts, 3).filter(([x, y]) => y > pts.reduce((m, q) => m + q[1], 0) / pts.length);
    for (const [x, y] of lower) p.set(Math.round(x), Math.round(y), INK);
  }
  const burst = layerOf(p);
  const star = (n: number, r0: number, r1: number, seed: number): Pt[] => {
    const pts: Pt[] = [];
    for (let j = 0; j < n * 2; j++) {
      const a = (j / (n * 2)) * Math.PI * 2 + seed;
      const r = (j % 2 ? r0 : r1 * (0.7 + hash(j, seed * 10, 1007) * 0.55)) * k * (0.92 + 0.08 * flick);
      pts.push([boom[0] + Math.cos(a) * r * 1.15, boom[1] + Math.sin(a) * r * 0.85]);
    }
    return pts;
  };
  burst.poly(star(13, 26, 66, 0.1), '#c43a1c');
  burst.poly(star(11, 18, 44, 0.35), '#ff8a2a');
  burst.each((x, y, c) => {
    const g = glow(x, y, boom[0], boom[1], 46 * k);
    return g > 0.5 ? '#ffffff' : g > 0.3 ? '#fff3c0' : g > 0.14 ? '#ffc040' : c;
  });
  // (tongues of fire licking up the canvas from it)
  for (let j = 0; j < 5; j++) {
    const x = boom[0] + (j - 2) * 15 * k + Math.sin(t * 6 + j) * 2 * k;
    const y = boom[1] - 30 * k;
    const h = (24 + hash(j, 9, 1001) * 22) * k;
    burst.poly(loop([[x - 7 * k, y + 8 * k], [x - 4 * k, y - h * 0.4], [x + Math.sin(t * 5 + j) * 4 * k, y - h], [x + 5 * k, y - h * 0.45], [x + 7 * k, y + 8 * k]], 4, [2]), j % 2 ? '#ff8a2a' : '#ffc040');
  }
  over(p, burst, INK, 0, 0, 2);
  for (let j = 0; j < 26; j++) {
    const a = hash(j, 6, 1001) * Math.PI * 2;
    const r = (50 + hash(j, 7, 1001) * 60 + ((t * 40 + j * 13) % 30)) * k;
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
    draws.push({ f, cam: { look, up: [0, 0, 1], scale: 8 * k, ox: S(262, 0)[0], oy: S(0, 212)[1] }, torch: r.torch });
  }
  {
    const f = new Figure();
    const r = sculptCultist(f, [0, 0, 0], 0.7, run(0.7, t * 8 + 2, 0));
    draws.push({ f, cam: { look, up: [0, 0, 1], scale: 12 * k, ox: S(220, 0)[0], oy: S(0, 300)[1] }, torch: r.torch });
  }
  {
    // the leaper: thrown forward at us, his knee up, his dagger high over his head, his other hand clawing out
    const f = new Figure();
    const P = AMBUSH_POSES.leap;
    sculptCultist(f, [0, 0, 0], 0.9, P, 2);
    draws.push({ f, cam: { look, up: [0, 0, 1], scale: 25 * k, ox: S(92, 0)[0], oy: S(0, 410)[1] }, torch: null });
  }
  for (const dw of draws) {
    const right = unit(cross(dw.cam.look, dw.cam.up));
    const dn = unit(cross(dw.cam.look, right));
    const scr = (q: V3): Pt => [dt3(q, right) * dw.cam.scale + dw.cam.ox, dt3(q, dn) * dw.cam.scale + dw.cam.oy];
    // (lit by the fire: the burst's place, brought into the figure's own measures; and by his torch)
    const bx = (boom[0] - dw.cam.ox) / dw.cam.scale;
    const by = (boom[1] - dw.cam.oy) / dw.cam.scale;
    const B3 = add3(add3(scale3(right, bx), scale3(dn, by)), scale3(dw.cam.look, -6));
    dw.f.draw(p, dw.cam, { at: dw.torch ?? B3, hard: 1, fill: unit(sub3(B3, [0, 0, 6])), fillK: 0.4, rim: '#ffb060', rimFrom: [1, 0.3] });
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

/** The knight (the hero) sculpted into `f` at `o`, turned `yaw`: mail and the red tabard, the pointed helm, the scarf, the sword. */
function sculptKnight(f: Figure, o: V3, yaw: number, P: KnightPose): void {
  const c = Math.cos(yaw);
  const sn = Math.sin(yaw);
  const rot = (q: V3): V3 => [q[0] * c - q[1] * sn, q[0] * sn + q[1] * c, q[2]];
  const at = (q: V3): V3 => add3(o, rot(q));
  const fr = (z: V3, x: V3 = [1, 0, 0]): readonly [V3, V3, V3] => frame(z, x).map(rot) as unknown as readonly [V3, V3, V3];
  const H = P.hip;
  const C = P.chest;
  const u = unit(sub3(C, H));
  const fwd = unit(sub3([0, -1, 0], scale3(u, dt3([0, -1, 0], u))));
  const across: V3 = unit(cross(u, fwd));
  const back = (q: V3): V3 => {
    const d = sub3(q, H);
    return [dt3(d, across), -dt3(d, fwd), dt3(d, u)];
  };
  const red = f.stuff({ tones: [INK, '#2a0a10', '#5a1420', '#8e2230', '#c43a40', '#f07060'], hatch: 4, crease: 0.8, paint: (q0) => {
    const q = back(q0);
    return q[1] < -0.55 && Math.abs(q[2] - (1.0 + Math.abs(q[0]) * 0.85)) < 0.16 ? '#e8d8c0' : null;
  } });
  const scarf = f.stuff({ tones: [INK, '#1e060a', '#3e0c14', '#661822', '#922a32', '#c04a4a'] });
  const mail = f.stuff({ tones: [INK, '#1a1838', '#28245a', '#4a4690', '#7e7ac0', '#b8b4e8'], crease: 0.8, paint: (q, n, v) => ((Math.round(q[2] * 8) + Math.round(q[0] * 8 + q[1] * 3)) % 2 === 0 && v > 0.3 && v < 0.8 ? '#28245a' : null) });
  const steel = f.stuff({ tones: [INK, '#22204e', '#3a3478', '#7a74c8', '#d6d0ff', '#ffffff'] });
  const blade = f.stuff({ tones: [INK, '#1a3a5a', '#3a7aa0', '#7ad8f0', '#c8fcff', '#ffffff'] });
  const leath = f.stuff({ tones: [INK, '#1a0e0a', '#3a2216', '#5e3a22', '#8a5a34'] });
  const skin = f.stuff({ tones: [INK, '#2a1a3a', '#5a3a5a', '#9a7a9a', '#d8c0d0', '#f0f8ff'], hatch: 4, crease: 0.45 });
  // his body: mail, the tabard over it to his thighs, the belt
  f.egg(mail, at(lerp3(H, C, 0.75)), [1.3, 0.88, 0.95], fr(u, across), 0.7);
  f.rod(mail, at(lerp3(H, C, 0.5)), at(H), 1.12, 0.95, 0.6);
  f.block(red, at(lerp3(H, C, 0.3)), [1.12, 0.95, 1.75], 0.55, fr(u, across), 0.3);
  f.egg(leath, at(lerp3(H, C, 0.12)), [1.1, 0.95, 0.15], fr(u, across), 0.1);
  // his legs: mail, steel at the knees, boots
  for (const j of [0, 1] as const) {
    const hipJ = add3(H, scale3(across, j ? 0.55 : -0.55));
    f.rod(mail, at(hipJ), at(P.kn[j]), 0.5, 0.4, 0.4);
    f.rod(mail, at(P.kn[j]), at(P.ft[j]), 0.38, 0.3, 0.3);
    f.egg(steel, at(add3(P.kn[j], scale3(fwd, 0.25))), [0.36, 0.3, 0.34], fr(unit(sub3(P.ft[j], P.kn[j]))), 0.15);
    f.rod(leath, at(lerp3(P.kn[j], P.ft[j], 0.55)), at(P.ft[j]), 0.38, 0.36, 0.2);
    f.egg(leath, at(add3(P.ft[j], scale3(fwd, 0.35))), [0.32, 0.55, 0.26], fr([0, 0, 1], across), 0.2);
  }
  // his shoulders: mail, a steel plate over each
  for (const j of [0, 1] as const) {
    f.egg(mail, at(P.sh[j]), [0.66, 0.7, 0.6], fr(u, across), 0.5);
    f.egg(steel, at(add3(P.sh[j], scale3(u, 0.32))), [0.68, 0.74, 0.34], fr(u, across), 0.2);
    f.rod(mail, at(P.sh[j]), at(P.el[j]), 0.42, 0.38, 0.4);
    f.rod(mail, at(P.el[j]), at(P.ha[j]), 0.38, 0.32, 0.35);
    f.egg(steel, at(P.ha[j]), [0.3, 0.3, 0.32], fr(unit(sub3(P.ha[j], P.el[j]))), 0.2);
  }
  // the scarf round his neck, its tail out on the wind
  const neck = add3(C, scale3(u, 0.6));
  f.egg(scarf, at(neck), [1.0, 0.92, 0.32], fr(u, across), 0.3);
  const tail1 = add3(neck, add3(scale3(fwd, -1.0), add3(scale3(across, 1.3), [0, 0, -0.3 + P.flap * 0.4])));
  const tail2 = add3(tail1, add3(scale3(fwd, -0.6), add3(scale3(across, 1.2), [0, 0, 0.5 - P.flap])));
  f.rod(scarf, at(add3(neck, scale3(across, 0.6))), at(tail1), 0.32, 0.25, 0.3);
  f.rod(scarf, at(tail1), at(tail2), 0.25, 0.12, 0.25);
  // the coif, the face in it, the pointed helm and its nasal bar; his eyes, the friend's cyan
  const hd = P.head;
  const hu = unit(sub3(hd, neck));
  const hf = unit(sub3(fwd, scale3(hu, dt3(fwd, hu))));
  const hx = (q: readonly [number, number, number]): V3 => add3(hd, add3(add3(scale3(across, q[0]), scale3(hf, -q[1])), scale3(hu, q[2])));
  const hfr = fr(hu, across);
  f.egg(mail, at(hx([0, 0.05, -0.45])), [0.86, 0.84, 0.55], hfr, 0.5);
  f.egg(mail, at(hx([0, 0.08, 0.1])), [0.8, 0.8, 0.85], hfr, 0.5);
  f.egg(mail, at(hx([0, -0.86, -0.05])), [0.5, 0.52, 0.54], hfr, 0.12, true);
  f.egg(skin, at(hx([0, -0.18, 0])), [0.58, 0.66, 0.72], hfr, 0.4);
  f.rod(skin, at(hx([0, -0.82, 0.02])), at(hx([0, -0.96, -0.22])), 0.08, 0.11, 0.12);
  f.mark(at(hx([-0.22, -0.86, 0.05])), [CYANS[0], CYANS[1], CYANS[2]], 2);
  f.mark(at(hx([0.22, -0.86, 0.05])), [CYANS[0], CYANS[1], CYANS[2]], 2);
  f.egg(steel, at(hx([0, 0.05, 0.5])), [0.9, 0.9, 0.22], hfr, 0.1);
  f.egg(steel, at(hx([0, 0.06, 0.82])), [0.84, 0.84, 0.48], hfr, 0.4);
  f.egg(steel, at(hx([0, 0.08, 1.3])), [0.58, 0.58, 0.45], hfr, 0.4);
  f.egg(steel, at(hx([0, 0.1, 1.75])), [0.32, 0.32, 0.4], hfr, 0.35);
  f.egg(steel, at(hx([0, 0.12, 2.12])), [0.1, 0.1, 0.28], hfr, 0.25);
  f.rod(steel, at(hx([0, -0.98, 0.48])), at(hx([0, -1.02, -0.3])), 0.1, 0.08, 0.1);
  // the great sword: pommel, grip, cross, the long blade
  const fist = P.ha[P.sword.hand];
  const dir = unit(sub3(P.sword.tip, fist));
  const side = unit(cross(dir, Math.abs(dir[2]) > 0.9 ? [1, 0, 0] : [0, 0, 1]));
  const G = add3(fist, scale3(dir, 0.4));
  f.egg(steel, at(add3(fist, scale3(dir, -0.55))), [0.15, 0.15, 0.15], fr(dir), 0);
  f.rod(leath, at(add3(fist, scale3(dir, -0.45))), at(G), 0.1, 0.1, 0);
  f.rod(steel, at(add3(G, scale3(side, -0.55))), at(add3(G, scale3(side, 0.55))), 0.1, 0.1, 0);
  f.rod(blade, at(add3(G, scale3(dir, 0.08))), at(P.sword.tip), 0.18, 0.08, 0);
}

/** A horse in harness sculpted into `f` at `o`, turned `yaw` (it faces +x), at `ph` in its gallop, its neck stretched to the pull. */
function sculptHorse(f: Figure, o: V3, yaw: number, ph: number): void {
  const c = Math.cos(yaw);
  const sn = Math.sin(yaw);
  const rot = (q: V3): V3 => [q[0] * c - q[1] * sn, q[0] * sn + q[1] * c, q[2]];
  const at = (q: V3): V3 => add3(o, rot(q));
  const fr = (z: V3, x: V3 = [1, 0, 0]): readonly [V3, V3, V3] => frame(z, x).map(rot) as unknown as readonly [V3, V3, V3];
  const hide = f.stuff({ tones: [INK, '#1c100c', '#2e1c14', '#46301e', '#64462a', '#8a6238'], crease: 0.8 });
  const hair = f.stuff({ tones: [INK, '#0e0808', '#1c1210', '#2e2018', '#463224'] });
  const strap = f.stuff({ tones: [INK, '#1a0e0a', '#3a2216', '#5e3a22', '#8a5a34'] });
  const iron = f.stuff({ tones: [INK, '#22204e', '#3a3478', '#7a74c8', '#d6d0ff'] });
  const bob = Math.sin(ph * 2) * 0.25;
  // the barrel, the chest, the quarters
  f.egg(hide, at([0, 0, 7.0 + bob]), [3.0, 1.45, 1.8], fr([0, 0, 1]), 0.8);
  f.egg(hide, at([2.5, 0, 7.1 + bob]), [1.45, 1.35, 1.8], fr([0, 0, 1]), 0.8);
  f.egg(hide, at([-2.5, 0, 7.4 + bob]), [1.65, 1.45, 1.8], fr([0, 0, 1]), 0.8);
  // the neck stretched forward to the pull, the head low, the muzzle, the ears laid back
  const nk0: V3 = [3.0, 0, 8.0 + bob];
  const nk1: V3 = [5.0, 0, 9.0 + bob];
  f.rod(hide, at(nk0), at(nk1), 1.05, 0.62, 0.6);
  f.egg(hide, at([5.5, 0, 9.0 + bob]), [0.6, 0.5, 0.85], fr([0.8, 0, -0.6], [0.6, 0, 0.8]), 0.4);
  f.rod(hide, at([5.8, 0, 8.8 + bob]), at([6.6, 0, 8.1 + bob]), 0.46, 0.34, 0.3);
  f.rod(hide, at([5.1, -0.25, 9.6 + bob]), at([4.5, -0.3, 10.0 + bob]), 0.12, 0.05, 0.1);
  f.rod(hide, at([5.1, 0.25, 9.6 + bob]), at([4.5, 0.3, 10.0 + bob]), 0.12, 0.05, 0.1);
  f.mark(at([5.75, -0.48, 9.15 + bob]), ['#ffffff', '#c8c0d0'], 1);
  // the mane, flying back off the neck; the tail streaming
  for (let i = 0; i < 6; i++) {
    const q = lerp3(nk0, nk1, i / 5);
    f.rod(hair, at(add3(q, [0, 0, 0.6])), at(add3(q, [-1.0 - i * 0.1, 0, 1.0 + Math.sin(ph * 3 + i) * 0.2])), 0.16, 0.05, 0.1);
  }
  f.rod(hair, at([-3.7, 0, 8.0 + bob]), at([-5.2, 0, 8.3 + Math.sin(ph * 2) * 0.4]), 0.3, 0.2, 0.2);
  f.rod(hair, at([-5.2, 0, 8.3 + Math.sin(ph * 2) * 0.4]), at([-6.4, 0, 7.8]), 0.2, 0.05, 0.15);
  // the legs at the gallop: the forelegs reaching, the hind driving; hooves
  const g = (a: number): number => Math.sin(ph + a);
  const legs: [V3, number, number][] = [[[2.6, -0.6, 6.0], 0, 1], [[2.4, 0.6, 6.0], 0.6, 1], [[-2.7, -0.6, 6.3], 2.4, -1], [[-2.9, 0.6, 6.3], 3.0, -1]];
  for (const [top, a, fore] of legs) {
    const sw = g(a);
    const knee: V3 = [top[0] + sw * 1.2 * fore + (fore > 0 ? 0.4 : -0.5), top[1], top[2] - 2.4 + Math.max(0, sw) * 0.8];
    const hoof: V3 = [knee[0] + sw * 1.0 + (fore > 0 ? 0.6 * Math.max(0, sw) : -0.4), top[1], Math.max(0.4, knee[2] - 2.6 + Math.max(0, sw * fore) * 1.2)];
    f.rod(hide, at(top), at(knee), 0.55, 0.3, 0.5);
    f.rod(hide, at(knee), at(hoof), 0.26, 0.2, 0.2);
    f.egg(hair, at(add3(hoof, [0.1, 0, -0.2])), [0.3, 0.28, 0.24], fr([0, 0, 1]), 0.15);
  }
  // the harness: the collar round the neck's foot, the traces back, the bridle
  f.egg(strap, at([3.3, 0, 8.2 + bob]), [1.25, 1.25, 0.5], fr([0.7, 0, 0.7], [0, 1, 0]), 0.15);
  f.rod(strap, at([3.0, -1.1, 7.6 + bob]), at([-4.8, -1.0, 6.6]), 0.09, 0.09, 0);
  f.rod(strap, at([3.0, 1.1, 7.6 + bob]), at([-4.8, 1.0, 6.6]), 0.09, 0.09, 0);
  f.rod(strap, at([5.2, -0.5, 9.2 + bob]), at([6.2, -0.38, 8.4 + bob]), 0.06, 0.06, 0);
  f.egg(iron, at([6.3, -0.36, 8.3 + bob]), [0.1, 0.06, 0.1], fr([0, 0, 1]), 0);
}

/** A wagon seen side on (facing right), big: its canvas cover on its ribs, its bed, its two wheels; `burning`: the canvas afire. */
function paintWagonSide(p: Px, x: number, y: number, s: number, t: number, lit: (x: number, y: number) => number, burning: boolean): void {
  const L = 60 * s;
  const top = y - 44 * s;
  const bed = y - 14 * s;
  const cover = layerOf(p);
  const cv: Pt[] = loop([[x - L / 2, bed], [x - L / 2 - 2 * s, top + 8 * s], [x - L * 0.2, top - 2 * s], [x + L * 0.2, top], [x + L / 2, top + 8 * s], [x + L / 2 - 2 * s, bed]], 6, [0, 5]);
  cover.poly(cv, CANVAS[0]);
  bands(cover, CANVAS, (px, py) => lit(px, py) * 1.3 + Math.cos(((px - x) / (L * 0.2)) * Math.PI * 2) * 0.06 + Math.sin(px * 0.4 + py * 0.08) * 0.04 - 0.1);
  cover.each((px, py) => ([-0.3, 0, 0.3].some((r) => Math.abs(px - (x + r * L)) < 0.8 * s) ? CANVAS[1] : undefined));
  if (burning) {
    // (the canvas burnt through: black holes ringed with fire)
    cover.each((px, py) => {
      const n = fbm(px / (9 * s), py / (7 * s), 1101) + (x - px) / L * 0.5;
      return n > 0.78 ? INK : n > 0.72 ? '#ff8a2a' : n > 0.69 ? '#c43a1c' : undefined;
    });
  }
  over(p, cover, INK);
  over(p, solid(p, [[x - L / 2 - 3 * s, bed], [x + L / 2 + 3 * s, bed], [x + L / 2 + 2 * s, bed + 7 * s], [x - L / 2 - 2 * s, bed + 7 * s]], [INK, WOOD[1], WOOD[2], WOOD[3], WOOD[4]], [0.5, -0.6, 0.5], { round: 0.3, hard: 1, extra: (px, py) => lit(px, py) * 0.8 }), INK);
  for (const wx of [x - L * 0.3, x + L * 0.3]) paintWheel(p, wx, y, 13 * s, lit, t * 30);
  if (burning) {
    for (let j = 0; j < 9; j++) {
      const fx = x - L * 0.42 + (j / 8) * L * 0.84;
      const base = top + 6 * s + Math.abs(j - 4) * 1.6 * s;
      const h = (16 + hash(j, 2, 1103) * 18) * s;
      const lean = -h * 0.7;
      const fl = layerOf(p);
      fl.poly(loop([[fx - 4 * s, base + 4 * s], [fx - 3 * s + lean * 0.4, base - h * 0.45], [fx + lean + Math.sin(t * 8 + j) * 2 * s, base - h], [fx + 2 * s + lean * 0.3, base - h * 0.4], [fx + 4 * s, base + 4 * s]], 4, [2]), j % 2 ? '#ff8a2a' : '#ffc040');
      fl.each((px, py) => (glow(px, py, fx, base, 6 * s) > 0.2 ? '#fff3c0' : undefined));
      over(p, fl, INK);
    }
  }
}

/** The prison's great gate, its foot's middle at (x, y), `s` its size: two round towers, the arch between, its doors flung in. */
function paintGate(p: Px, x: number, y: number, s: number, lit: (x: number, y: number) => number): void {
  const st = layerOf(p);
  const STONE: Tones = ['#0e0c1c', '#16122a', '#201a38', '#2c2448', '#3e3258', '#54446a'];
  // the wall, up out of the top; the towers either side of the arch
  st.poly([[x - 70 * s, y], [x - 70 * s, y - 150 * s], [x + 90 * s, y - 150 * s], [x + 90 * s, y]], STONE[1]);
  for (const tx of [-44, 44]) {
    st.poly(loop([[x + (tx - 24) * s, y], [x + (tx - 22) * s, y - 170 * s], [x + (tx + 22) * s, y - 170 * s], [x + (tx + 24) * s, y]], 2, [0, 1, 2, 3]), STONE[1]);
    for (let cx = tx - 22; cx < tx + 20; cx += 9) st.poly([[x + cx * s, y - 170 * s], [x + cx * s, y - 178 * s], [x + (cx + 5) * s, y - 178 * s], [x + (cx + 5) * s, y - 170 * s]], STONE[1]);
  }
  facets(st, STONE, [0.4, -0.5, 0.6], { cw: 12 * s, ch: 7 * s, seed: 1201, tilt: [0, 0], spread: 0.6, extra: (px, py) => lit(px, py) * 1.4 - 0.1 });
  // its blocks: courses of stone
  st.each((px, py) => ((Math.round((py - y) / (7 * s)) % 1 === 0 && Math.abs(((py - y) / (7 * s)) % 1) < 0.12) || Math.abs((((px - x) / (12 * s) + Math.floor((py - y) / (7 * s)) * 0.5) % 1)) < 0.06 ? STONE[0] : undefined));
  // the arch: black within, the doors flung in at its sides, a glimmer of the yard
  const archTop = y - 74 * s;
  const arch: Pt[] = loop([[x - 22 * s, y], [x - 22 * s, archTop + 20 * s], [x - 12 * s, archTop + 4 * s], [x, archTop], [x + 12 * s, archTop + 4 * s], [x + 22 * s, archTop + 20 * s], [x + 22 * s, y]], 4, [0, 3, 6]);
  st.poly(arch, '#05040a');
  st.poly([[x - 22 * s, y], [x - 22 * s, archTop + 22 * s], [x - 12 * s, archTop + 30 * s], [x - 12 * s, y]], '#2a1c12');
  st.poly([[x + 22 * s, y], [x + 22 * s, archTop + 22 * s], [x + 12 * s, archTop + 30 * s], [x + 12 * s, y]], '#2a1c12');
  // the portcullis's teeth hanging at the arch's top
  for (let tx = -18; tx <= 18; tx += 6) st.poly([[x + (tx - 1) * s, archTop + 6 * s], [x + (tx + 1) * s, archTop + 6 * s], [x + tx * s, archTop + 14 * s]], '#3a3478');
  over(p, st, INK, 0, 0, 2);
  // the arrow slits in the towers, black
  for (const [tx, ty] of [[-44, 120], [44, 120], [-44, 70], [44, 70]]) p.rect(Math.round(x + tx * s), Math.round(y - ty * s), Math.max(1, Math.round(2 * s)), Math.round(9 * s), '#000000');
}

export function paintRun(p: Px, t: number): void {
  const W = p.w;
  const H = p.h;
  const S = (x: number, y: number): Pt => [(x / 808) * W, (y / 360) * H];
  const k = W / 808;
  const flick = 0.85 + 0.15 * Math.sin(t * 9.1);
  const blaze = S(470, 170);
  const fire = (x: number, y: number, r = W * 0.35): number => glow(x, y, blaze[0], blaze[1], r) * flick;
  // THE NIGHT, the burning wagon's glow under it
  const sky = layerOf(p);
  sky.rect(0, 0, W, H, DUSK[0]);
  bands(sky, DUSK, (x, y) => -0.05 + fire(x, y, W * 0.5) * 0.8);
  sky.each((x, y) => (y < H * 0.45 && hash(x, y, 1301) > 0.995 ? '#c8c4f0' : undefined));
  over(p, sky, null);
  // THE GATE, on the right page, the road ramping up to it
  paintGate(p, S(742, 250)[0], S(742, 250)[1], 1.1 * k, (x, y) => fire(x, y, W * 0.45) * 0.6);
  const road = layerOf(p);
  road.poly(loop([S(-4, 312), S(200, 310), S(420, 304), S(600, 282), S(700, 254), S(812, 248), S(812, 364), S(-4, 364)], 6, [0, 6, 7]), ROAD[0]);
  bands(road, ROAD, (x, y) => 0.15 + fire(x, y, W * 0.4) * 1.2 + (fbm(x / 8, y / 3, 1303) - 0.5) * 0.3);
  // (speed: streaks along the road behind them)
  road.each((x, y) => (hash(Math.floor(x / 40), y, 1305) > 0.93 && x < S(560, 0)[0] ? ROAD[3] : undefined));
  over(p, road, INK);
  // THE LEAD WAGON already under the arch, small, its lantern swinging
  const lamps: Pt[] = [];
  paintWagonSmall(p, S(724, 250)[0], S(724, 250)[1], 1.7 * k, lamps, t * 2);
  for (const [lx, ly] of lamps) halo(p, lx, ly, 16 * k, LAMP[1], 2, 0.25);
  // THE CULT at their heels, far ones streaming down behind on the left
  const swarm = layerOf(p);
  const flames: [number, number, number][] = [];
  const pinks: Pt[] = [];
  for (let j = 0; j < 9; j++) {
    const x = S(10 + j * 26, 0)[0] + (hash(j, 1, 1307) - 0.5) * 14 * k;
    const y = S(0, 250 + (hash(j, 2, 1307) - 0.5) * 30)[1];
    const sc = (1.0 + hash(j, 3, 1307) * 0.3) * k;
    const lean = 3 * sc;
    const step = Math.sin(t * 9 + j * 1.9) * 2.5 * sc;
    swarm.poly(loop([[x - 6 * sc, y + 22 * sc], [x - 5 * sc + lean, y + 5 * sc], [x - 3 * sc + lean, y - 4 * sc], [x + lean * 1.5 + 1 * sc, y - 13 * sc], [x + 4 * sc + lean, y - 3 * sc], [x + 7 * sc + lean, y + 6 * sc], [x + 8 * sc + step, y + 22 * sc], [x + 2 * sc, y + 16 * sc], [x - 2 * sc - step, y + 22 * sc]], 3, [3, 6, 8]), '#0a0814');
    pinks.push([x + lean + 3 * sc, y - 3 * sc]);
    if (j % 2 === 0) {
      swarm.poly(band([[x + 6 * sc + lean, y + 5 * sc], [x + 10 * sc + lean, y - 8 * sc]], 1.5 * sc), '#0a0814');
      flames.push([x + 10 * sc + lean, y - 9 * sc, sc * 0.6]);
    }
  }
  swarm.each((x, y) => (fire(x, y, W * 0.5) > 0.03 && !swarm.has(x + 1, y) ? '#c0604a' : undefined));
  over(p, swarm, INK);
  for (const [x, y] of pinks) p.set(Math.round(x), Math.round(y), '#ff5aa0').set(Math.round(x) - 2, Math.round(y), '#ff5aa0');
  flames.forEach(([x, y, sc], j) => paintFlame(p, x, y, sc, t, j + 40));
  // THE LAST WAGON, burning, its horse straining at the traces; sparks and smoke streaming back off it
  const smoke = layerOf(p);
  for (let j = 0; j < 7; j++) {
    const cx = S(430 - j * 52, 0)[0];
    const cy = S(0, 96 - j * 8 + Math.sin(j * 1.7) * 10)[1];
    const rr = (24 + j * 5) * k;
    const pts: Pt[] = [];
    for (let i = 0; i < 14; i++) {
      const b = (i / 14) * Math.PI * 2;
      const lobe = 0.78 + 0.3 * Math.abs(Math.sin(b * 3.5 + j)) + (hash(i, j, 1309) - 0.5) * 0.12;
      pts.push([cx + Math.cos(b) * rr * lobe * 1.4, cy + Math.sin(b) * rr * lobe * (Math.sin(b) > 0 ? 0.55 : 0.85)]);
    }
    smoke.poly(loop(pts, 3), '#2a2034');
  }
  bands(smoke, ['#1a1222', '#2e2236', '#46344c', '#644450', '#94583e'], (x, y) => 0.1 + fire(x, y, W * 0.3) * 1.6 + (fbm(x / 9, y / 9, 1311) - 0.5) * 0.5);
  over(p, smoke, INK);
  paintWagonSide(p, S(470, 312)[0], S(470, 312)[1], 2.5 * k, t, (x, y) => fire(x, y, W * 0.3), true);
  {
    const f = new Figure();
    sculptHorse(f, [0, 0, 0], 0, t * 9);
    f.draw(p, { look: unit([0, 1, -0.06]), up: [0, 0, 1], scale: 15 * k, ox: S(618, 0)[0], oy: S(0, 318)[1] }, { at: [-10, -3, 9], hard: 1, fill: [-0.3, -1, 0.4], fillK: 0.3, rim: '#ffb060', rimFrom: [-1, -0.3] });
  }
  for (let j = 0; j < 30; j++) {
    const x = blaze[0] - ((hash(j, 1, 1313) * 220 + t * 120 + j * 13) % 240) * k;
    const y = blaze[1] - 40 * k - hash(j, 2, 1313) * 70 * k + Math.sin(j + t * 3) * 6 * k;
    p.set(Math.round(x), Math.round(y), j % 3 ? '#ffc040' : '#fff3c0').set(Math.round(x) + 1, Math.round(y), '#ff8a2a');
  }
  // THE PURSUERS nearest, sculpted: one struck, reeling back; one behind him, his dagger out
  const look = unit([0.05, 1, -0.05]);
  {
    const f = new Figure();
    sculptCultist(f, [0, 0, 0], 1.0, AMBUSH_POSES.run(0.6, t * 9, 1), 1);
    f.draw(p, { look, up: [0, 0, 1], scale: 15 * k, ox: S(60, 0)[0], oy: S(0, 330)[1] }, { at: [8, -4, 8], hard: 1, fill: [0.6, -1, 0.3], fillK: 0.3, rim: '#ffb060', rimFrom: [1, -0.2] });
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
    f.draw(p, { look, up: [0, 0, 1], scale: 22 * k, ox: S(170, 0)[0], oy: S(0, 352)[1] }, { at: [8, -4, 8], hard: 1, fill: [0.6, -1, 0.3], fillK: 0.3, rim: '#ffb060', rimFrom: [1, -0.2] });
  }
  // YOUR HERO at the rear, turned on them, his sword swung through in an arc of cyan
  const sw = 0.5 + 0.5 * Math.sin(t * 2.5);
  const KP: KnightPose = {
    hip: [0, 0, 5.4], chest: [0, 0.5, 7.6], head: [0, 0.3, 9.5],
    sh: [[-1.3, 0.5, 8.3], [1.3, 0.5, 8.3]],
    el: [[-2.2, -0.6, 8.0], [1.5, -0.6, 7.0]],
    ha: [[-3.0, -1.4, 7.8], [0.8, -1.2, 6.8]],
    kn: [[-0.8, -1.4, 3.2], [0.8, 0.9, 2.8]],
    ft: [[-0.9, -1.6, 0.4], [0.9, 1.6, 0.4]],
    sword: { hand: 0, tip: [-7.0 - sw * 0.5, -3.4, 8.6] },
    flap: Math.sin(t * 3.1),
  };
  const kcam = { look, up: [0, 0, 1] as V3, scale: 27 * k, ox: S(318, 0)[0], oy: S(0, 352)[1] };
  {
    const f = new Figure();
    sculptKnight(f, [0, 0, 0], -1.2, KP);
    f.draw(p, kcam, { at: [9, -3, 9], hard: 1, fill: [0.4, -1, 0.3], fillK: 0.32, rim: '#ffb060', rimFrom: [1, -0.3] });
  }
  // (the arc of the swing: a crescent of the friend's cyan behind the blade)
  {
    const right = unit(cross(kcam.look, kcam.up));
    const dn = unit(cross(kcam.look, right));
    const c0 = Math.cos(-1.2);
    const s0 = Math.sin(-1.2);
    const scr = (q: V3): Pt => {
      const w: V3 = [q[0] * c0 - q[1] * s0, q[0] * s0 + q[1] * c0, q[2]];
      return [dt3(w, right) * kcam.scale + kcam.ox, dt3(w, dn) * kcam.scale + kcam.oy];
    };
    const hand = scr(KP.ha[0]);
    const tip = scr(KP.sword.tip);
    const arc = layerOf(p);
    const pts: Pt[] = [];
    const R = Math.hypot(tip[0] - hand[0], tip[1] - hand[1]);
    const a1 = Math.atan2(tip[1] - hand[1], tip[0] - hand[0]);
    for (let i = 0; i <= 16; i++) {
      const a = a1 + (i / 16) * 1.6;
      pts.push([hand[0] + Math.cos(a) * R * 1.02, hand[1] + Math.sin(a) * R * 1.02]);
    }
    for (let i = 16; i >= 0; i--) {
      const a = a1 + (i / 16) * 1.6;
      const r = R * (1.02 - 0.28 * Math.sin((i / 16) * Math.PI) * (1 - i / 22));
      pts.push([hand[0] + Math.cos(a) * r, hand[1] + Math.sin(a) * r]);
    }
    arc.poly(pts, CYANS[2]);
    arc.each((x, y) => {
      const d = Math.hypot(x - hand[0], y - hand[1]) / R;
      return d > 0.97 ? CYANS[0] : d > 0.9 ? CYANS[1] : undefined;
    });
    over(p, arc, null);
  }
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
function paintDoor(p: Px, pts: readonly Pt[], x0: number, pw: number, bandsAt: readonly number[], bh: number, lit: (x: number, y: number) => number, seed: number): void {
  const l = layerOf(p);
  l.poly(pts, OAK[2]);
  l.each((x, y) => {
    const u = (x + 0.5 - x0) / pw;
    const plank = Math.floor(u);
    const f = u - plank;
    const L = lit(x, y) + (hash(plank, 0, seed) - 0.5) * 0.18 + (fbm(x / 2, y / 14, seed + plank) - 0.5) * 0.3;
    for (const by of bandsAt) {
      if (Math.abs(y + 0.5 - by) < bh / 2) {
        const stud = Math.abs(f - 0.5) < 0.16 && Math.abs(y + 0.5 - by) < bh * 0.22;
        if (stud) return IRONS[Math.min(5, 3 + Math.round(L * 2))];
        return Math.abs(y + 0.5 - by) > bh / 2 - 1 ? INK : IRONS[Math.max(1, Math.min(5, Math.floor(1 + L * 4)))];
      }
    }
    if (f < 0.07) return INK;
    if (f < 0.16) return OAK[1];
    return OAK[Math.max(1, Math.min(5, Math.floor(1.5 + L * 4)))];
  });
  over(p, l, INK, 0, 0, 2);
}

/** The armourer standing, sculpted into `f`: leaning `lean` into a door at x = `door` (his hands flat on it), up to his shoulder. */
function sculptArmourer(f: Figure, o: V3, lean: number, door: number, t: number): void {
  const skin = f.stuff({ tones: SKIN_K, hatch: 4, crease: 0.6 });
  const shirt = f.stuff({ tones: SHIRT_K, hatch: 4, crease: 0.8 });
  const hide = f.stuff({ tones: LEATHER_K, hatch: 4 });
  const white = f.stuff({ tones: BEARD_K, meld: true, crease: 0.5 });
  const trews = f.stuff({ tones: [INK, '#120c10', '#24181e', '#3a2a30', '#56404a'] });
  const breath = Math.sin(t * 4) * 0.06;
  const piv: V3 = [0, 0, 5.3];
  // (his seated measures, as on page 2, stood up and leant into the door)
  const T = (q: V3): V3 => {
    const z = q[2] + 4;
    const dx = q[0] - piv[0];
    const dz = z - piv[2];
    return add3(o, [piv[0] + dx * Math.cos(lean) + dz * Math.sin(lean), q[1], piv[2] - dx * Math.sin(lean) + dz * Math.cos(lean)]);
  };
  const A = (yaw = 0, tilt = 0, roll = 0) => axes(yaw, tilt, roll + lean);
  f.egg(shirt, T([0, 0, 1.3]), [1.6, 1.5, 1.0], A());
  f.egg(shirt, T([0.55, 0, 2.6]), [1.55, 1.65, 1.35], A(0, 0, 0.15), 1.0);
  f.egg(shirt, T([0.35, 0, 3.9 + breath]), [1.5, 1.95, 1.75], A(0, 0, 0.25), 1.0);
  f.block(hide, T([1.55, 0, 2.4]), [0.16, 1.3, 1.9], 0.14, A(0, 0, 0.28), 0.25);
  // his head, bowed to the push: as on page 2
  f.rod(skin, T([0.3, 0, 5.2]), T([0.75, 0, 6.15]), 0.8, 0.72, 0.5);
  f.egg(skin, T([0.55, 0, 7.15]), [1.18, 0.98, 1.22], A(0, 0, -0.15), 0.6);
  f.egg(skin, T([1.05, 0, 6.45]), [0.82, 0.78, 0.62], A(0, 0, 0.2), 0.6);
  f.rod(skin, T([1.42, -0.62, 7.38]), T([1.5, 0.62, 7.38]), 0.22, 0.22, 0.35);
  f.rod(skin, T([1.58, 0, 7.25]), T([2.12, 0, 6.72]), 0.17, 0.25, 0.25);
  f.egg(skin, T([2.08, 0, 6.68]), [0.26, 0.26, 0.22], A(), 0.25);
  f.egg(skin, T([0.38, -0.96, 7.0]), [0.26, 0.14, 0.4], A(0, 0, -0.2), 0.25);
  f.egg(skin, T([1.46, -0.42, 7.1]), [0.22, 0.24, 0.16], A(), 0.1, true);
  f.mark(T([1.5, -0.42, 7.09]), [CYANS[0], CYANS[1], CYANS[2]], 2);
  f.egg(white, T([1.45, 0, 5.9]), [0.72, 0.95, 0.8], A(), 0.5);
  f.egg(white, T([1.05, -0.74, 6.15]), [0.48, 0.34, 0.5], A(), 0.5);
  f.egg(white, T([1.72, 0, 4.95]), [0.62, 0.95, 1.25], A(0, 0, 0.2), 0.6);
  f.egg(white, T([1.95, 0, 3.95]), [0.42, 0.6, 0.85], A(0, 0, 0.25), 0.6);
  f.rod(white, T([1.92, -0.08, 6.6]), T([1.85, -0.6, 6.25]), 0.17, 0.13, 0.25);
  f.rod(white, T([1.55, -0.68, 7.55]), T([1.62, -0.12, 7.58]), 0.13, 0.1, 0.15);
  // his arms up, the forearms braced flat on the door
  for (const side of [-1, 1]) {
    const sh = T([0.05, 1.95 * side, 4.75]);
    const hand: V3 = [door - 0.45, o[1] + 1.5 * side, o[2] + 9.6 + (side > 0 ? 0.6 : 0)];
    const el: V3 = [door - 1.5, o[1] + 2.0 * side, o[2] + 7.6];
    f.rod(shirt, sh, lerp3(sh, el, 0.6), 0.66, 0.58, 0.6);
    f.egg(shirt, lerp3(sh, el, 0.62), [0.62, 0.62, 0.42], frame(sub3(el, sh), [0, 0, 1]), 0.3);
    f.rod(skin, lerp3(sh, el, 0.6), el, 0.58, 0.5, 0.4);
    f.rod(skin, el, hand, 0.55, 0.34, 0.4);
    f.egg(skin, lerp3(el, hand, 0.3), [0.62, 0.5, 0.5], frame(sub3(hand, el), [0, 1, 0]), 0.5);
    f.egg(skin, hand, [0.18, 0.42, 0.5], frame([0, 0, 1], [1, 0, 0]), 0.25);
  }
  // his legs, driving: the near one back and straight, the far one bent under him; boots
  const hips = T([0, 0, 1.0]);
  for (const [side, kn, ft] of [[-1, [-0.6, -0.9, 3.0], [-2.6, -0.9, 0.4]], [1, [1.0, 0.9, 3.0], [-0.3, 0.9, 0.4]]] as const) {
    const knee = add3(o, kn as unknown as V3);
    const foot = add3(o, ft as unknown as V3);
    f.rod(trews, add3(hips, [0, 0.8 * side, 0]), knee, 0.75, 0.55, 0.5);
    f.rod(trews, knee, foot, 0.55, 0.42, 0.4);
    f.egg(hide, add3(foot, [0.4, 0, 0]), [0.75, 0.45, 0.4], axes(), 0.3);
  }
}

export function paintThroughGate(p: Px, t: number): void {
  const W = p.w;
  const H = p.h;
  const S = (x: number, y: number): Pt => [(x / 392) * W, (y / 118) * H];
  const k = W / 392;
  const flick = 0.85 + 0.15 * Math.sin(t * 9.1);
  const arc = S(110, 70);
  const lit = (x: number, y: number): number => glow(x, y, arc[0], arc[1], W * 0.5) * flick;
  // THE YARD'S NIGHT, and the gatehouse's wall across behind: its arch red with the fire outside
  p.rect(0, 0, W, H, DUSK[0]);
  const wall = layerOf(p);
  wall.rect(0, 0, W, Math.round(S(0, 100)[1]), '#16122a');
  const archPts: Pt[] = loop([S(66, 100), S(66, 48), S(84, 26), S(110, 18), S(136, 26), S(154, 48), S(154, 100)], 4, [0, 6]);
  wall.each((x, y) => (inside(archPts, x + 0.5, y + 0.5) ? '#00000000' : undefined));
  facets(wall, ['#08060e', '#100c1c', '#1a1428', '#261c34', '#3a2a40'], [-0.3, 0.3, 0.9], { cw: 16 * k, ch: 8 * k, seed: 1401, tilt: [0, 0], spread: 0.6, extra: (x, y) => lit(x, y) * 1.4 - 0.15 });
  wall.each((x, y) => (wall.has(x, y) && (!wall.has(x + 1, y) || !wall.has(x - 1, y) || !wall.has(x, y + 1)) && inside(loop([S(56, 104), S(56, 40), S(110, 8), S(164, 40), S(164, 104)], 3), x, y) ? '#e07848' : undefined));
  const out = layerOf(p);
  out.poly(archPts, '#2a1430');
  bands(out, ['#1a0c22', '#2a1430', '#4a1c3a', '#7a2a3a', '#a8442e'], (x, y) => 0.1 + (y / H) * 0.6 + Math.sin(x * 0.2 + t * 4) * 0.05);
  over(p, out, null);
  over(p, wall, INK, 0, 0, 2);
  // the yard's cobbles
  const yard = layerOf(p);
  yard.poly([S(-4, 100), S(396, 100), S(396, 122), S(-4, 122)], MUD[1]);
  bands(yard, MUD, (x, y) => lit(x, y) * 1.1 + (hash(Math.floor(x / 5), Math.floor(y / 3), 1405) - 0.5) * 0.3);
  over(p, yard, INK);
  // THE BURNING WAGON, through, its horse at the gallop before it; sparks streaming back to the arch
  paintWagonSide(p, S(210, 106)[0], S(210, 106)[1], 1.05 * k, t, (x, y) => glow(x, y, S(210, 50)[0], S(210, 50)[1], W * 0.25) * flick, true);
  const f = new Figure();
  sculptHorse(f, [0, 0, 0], 0, t * 9 + 1);
  f.draw(p, { look: unit([0, 1, -0.06]), up: [0, 0, 1], scale: 6.4 * k, ox: S(276, 0)[0], oy: S(0, 108)[1] }, { at: [-14, -3, 10], hard: 1, fill: [-0.3, -1, 0.4], fillK: 0.3, rim: '#ffb060', rimFrom: [-1, -0.3] });
  for (let j = 0; j < 26; j++) {
    const x = S(190, 0)[0] - ((hash(j, 1, 1407) * 120 + t * 90 + j * 9) % 130) * k;
    const y = S(0, 40)[1] - hash(j, 2, 1407) * 30 * k + Math.sin(j + t * 3) * 4 * k;
    p.set(Math.round(x), Math.round(y), j % 3 ? '#ffc040' : '#fff3c0');
  }
  // (speed: streaks along the yard behind it)
  for (let j = 0; j < 10; j++) {
    const y = S(0, 60 + j * 5)[1];
    const x0 = S(150 + hash(j, 3, 1409) * 20, 0)[0];
    stroke(p, [[x0, y], [x0 + (20 + hash(j, 4, 1409) * 30) * k, y]], 1, '#3a2a40');
  }
  caption(p, 'Through the gate...', Math.round(W - 6 * k - captionSize('Through the gate...', 120)[0]), Math.round(6 * k), 120);
}

export function paintArmourerDoor(p: Px, t: number): void {
  const W = p.w;
  const H = p.h;
  const S = (x: number, y: number): Pt => [(x / 192) * W, (y / 111) * H];
  const k = W / 192;
  const lamp = S(40, 10);
  const lit = (x: number, y: number): number => glow(x, y, lamp[0], lamp[1], W * 1.1);
  p.rect(0, 0, W, H, '#100c1c');
  bands(p, ['#0a0812', '#100c1c', '#1a1428', '#2a1e30'], (x, y) => lit(x, y) * 0.9);
  // the door, swinging shut at the right; the fire's line down its edge
  paintDoor(p, [S(118, -4), S(196, -4), S(196, 116), S(118, 116)], S(118, 0)[0], 14 * k, [S(0, 22)[1], S(0, 84)[1]], 7 * k, (x, y) => lit(x, y) * 1.2, 1411);
  const f = new Figure();
  sculptArmourer(f, [0, 0, 0], 0.55, 2.2, t);
  f.draw(p, { look: unit([-0.2, 1, -0.05]), up: [0, 0, 1], scale: 10.5 * k, ox: S(92, 0)[0], oy: S(0, 122)[1] }, { at: [-6, -5, 14], hard: 1, fill: [0.5, -1, 0.2], fillK: 0.25, rim: '#ffb060', rimFrom: [-1, -0.4] });
}

export function paintHeroDoor(p: Px, t: number): void {
  const W = p.w;
  const H = p.h;
  const S = (x: number, y: number): Pt => [(x / 192) * W, (y / 111) * H];
  const k = W / 192;
  const lamp = S(160, 10);
  const lit = (x: number, y: number): number => glow(x, y, lamp[0], lamp[1], W * 1.1);
  p.rect(0, 0, W, H, '#100c1c');
  bands(p, ['#0a0812', '#100c1c', '#1a1428', '#2a1e30'], (x, y) => lit(x, y) * 0.9);
  paintDoor(p, [S(-4, -4), S(74, -4), S(74, 116), S(-4, 116)], S(-4, 0)[0], 14 * k, [S(0, 22)[1], S(0, 84)[1]], 7 * k, (x, y) => lit(x, y) * 1.2, 1421);
  // your hero, side on, both hands flat on the door, his whole weight behind them
  const f = new Figure();
  const KP: KnightPose = {
    hip: [0, 0, 5.0], chest: [0, -1.4, 7.0], head: [0, -2.2, 8.6],
    sh: [[-1.3, -1.3, 7.7], [1.3, -1.3, 7.7]],
    el: [[-1.2, -2.6, 8.0], [1.2, -2.6, 8.2]],
    ha: [[-0.9, -3.7, 8.6], [0.9, -3.7, 8.9]],
    kn: [[-0.6, -1.4, 3.0], [0.6, 1.2, 2.6]],
    ft: [[-0.6, -1.0, 0.4], [0.7, 2.8, 0.4]],
    sword: { hand: 0, tip: [-0.9, -3.75, 8.7] },
    flap: Math.sin(t * 3.1),
  };
  sculptKnight(f, [0, 0, 0], -Math.PI / 2, KP);
  f.draw(p, { look: unit([0.2, 1, -0.05]), up: [0, 0, 1], scale: 11 * k, ox: S(114, 0)[0], oy: S(0, 122)[1] }, { at: [6, -5, 14], hard: 1, fill: [-0.5, -1, 0.2], fillK: 0.28, rim: '#ffb060', rimFrom: [1, -0.4] });
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
  paintDoor(p, [S(-4, -4), S(86, -4), S(86, 120), S(-4, 120)], S(-4, 0)[0], 15 * k, [S(0, 24)[1], S(0, 90)[1]], 8 * k, lit, 1431);
  paintDoor(p, [S(106, -4), S(196, -4), S(196, 120), S(106, 120)], S(106, 0)[0], 15 * k, [S(0, 24)[1], S(0, 90)[1]], 8 * k, lit, 1433);
  // (the fire's line down each door's edge)
  for (let y = 0; y < H; y++) {
    p.set(Math.round(S(86, 0)[0]) + 2, y, '#ff8a2a');
    p.set(Math.round(S(106, 0)[0]) - 3, y, '#ff8a2a');
  }
  // the eyes in the crack
  for (const [ex, ey] of [[S(93, 30)[0], S(0, 30)[1]], [S(99, 31)[0], S(0, 31)[1]]]) {
    p.set(Math.round(ex) - 1, Math.round(ey) - 1, '#c02a6a').set(Math.round(ex), Math.round(ey), '#ff5aa0').set(Math.round(ex) + 1, Math.round(ey), '#ffb0d0');
  }
  // THE HAND through it: a bony forearm, the claws hooked at us
  const f = new Figure();
  const bone = f.stuff({ tones: [INK, '#2e2638', '#5e5268', '#968aa0', '#cabed0', '#f0e8f0'], crease: 0.5 });
  const robe = f.stuff({ tones: [INK, '#1e1030', '#341a4e', '#4e2a6e', '#6e3e8e', '#a86a9e'] });
  const reach = Math.sin(t * 2.2) * 0.2;
  f.rod(robe, [0, 4, 6.0], [0, 1.6, 5.8], 0.55, 0.5, 0.3);
  f.rod(bone, [0, 1.8, 5.8], [0.6, -1.6 - reach, 5.4], 0.3, 0.22, 0.2);
  f.egg(bone, [0.25, 0.4, 5.62], [0.34, 0.6, 0.3], frame([0.2, -1, -0.1], [1, 0, 0]), 0.2);
  f.egg(bone, [0.75, -2.0 - reach, 5.35], [0.32, 0.4, 0.14], frame([0, -1, 0], [1, 0, 0]), 0.15);
  for (let i = 0; i < 5; i++) {
    const a = -0.9 + i * 0.45;
    const base: V3 = [0.75 + Math.sin(a) * 0.3, -2.3 - reach, 5.35 + Math.cos(a) * 0.05];
    const mid: V3 = [0.75 + Math.sin(a) * 0.75, -2.9 - reach + Math.abs(a) * 0.3, 5.5 + Math.cos(a) * 0.25];
    const tip: V3 = [0.75 + Math.sin(a) * 0.9, -3.0 - reach + Math.abs(a) * 0.3, 5.0 + Math.cos(a) * 0.1];
    f.rod(bone, base, mid, 0.08, 0.065, 0.06);
    f.rod(bone, mid, tip, 0.065, 0.02, 0.04);
  }
  f.draw(p, { look: unit([0.1, 1, 0.25]), up: [0, 0, 1], scale: 27 * k, ox: gx - 10 * k, oy: S(0, 206)[1] }, { at: [1, 3, 7], hard: 1, fill: [0, -1, 0.3], fillK: 0.3, rim: '#ff8a2a', rimFrom: [0, -1] });
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
  const iron = f.stuff({ tones: IRONS });
  const skin = f.stuff({ tones: SKIN_K, crease: 0.5 });
  const steel = f.stuff({ tones: [INK, '#22204e', '#3a3478', '#7a74c8', '#d6d0ff', '#ffffff'] });
  const shirt = f.stuff({ tones: SHIRT_K });
  const mail = f.stuff({ tones: [INK, '#1a1838', '#28245a', '#4a4690', '#7e7ac0', '#b8b4e8'] });
  for (const x of [-4.6, 4.6]) {
    f.block(iron, [x, 0.2, 3.6], [0.35, 0.35, 0.12], 0.04);
    f.block(iron, [x, 0.2, 2.2], [0.35, 0.35, 0.12], 0.04);
    f.block(iron, [x, -0.45, 2.9], [0.35, 0.12, 0.8], 0.04);
  }
  const by = 0.5 - heave;
  f.block(oak, [0, -0.6, 1.0 + heave * 5], [7.5, 0.55, 0.55], 0.12, frame([0, 0, 1], [1, 0, 0.02]), 0.2);
  // the armourer's great hand under its left end; your hero's gauntlet under its right
  const zb = 1.0 + heave * 5 - 0.6;
  f.egg(skin, [-3.0, -0.9, zb - 0.1], [0.6, 0.45, 0.3], axes(), 0.3);
  for (let i = 0; i < 4; i++) f.rod(skin, [-3.4 + i * 0.26, -1.25, zb], [-3.4 + i * 0.26, -1.4, zb + 0.55], 0.13, 0.11, 0.1);
  f.rod(skin, [-3.0, -0.6, zb - 0.6], [-3.4, 0.4, -2.4], 0.55, 0.65, 0.4);
  f.rod(shirt, [-3.4, 0.4, -2.0], [-3.5, 0.8, -4.0], 0.7, 0.75, 0.3);
  f.egg(steel, [3.0, -0.9, zb - 0.1], [0.55, 0.42, 0.28], axes(), 0.3);
  for (let i = 0; i < 4; i++) f.rod(steel, [2.6 + i * 0.26, -1.22, zb], [2.6 + i * 0.26, -1.36, zb + 0.5], 0.12, 0.1, 0.08);
  f.rod(steel, [3.0, -0.6, zb - 0.6], [3.4, 0.4, -2.4], 0.5, 0.55, 0.3);
  f.rod(mail, [3.4, 0.4, -2.2], [3.5, 0.8, -4.0], 0.55, 0.6, 0.3);
  void by;
  f.draw(p, { look: unit([0, 1, -0.15]), up: [0, 0, 1], scale: 17 * k, ox: S(96, 0)[0], oy: S(0, 88)[1] }, { at: [-8, -4, 7], hard: 1, fill: [0.3, -1, 0.3], fillK: 0.3, rim: '#ffb060', rimFrom: [-1, -0.4] });
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
  paintDoor(p, [S(-4, -4), S(196, -4), S(196, 230), S(-4, 230)], S(-4, 0)[0], 18 * k, [S(0, 40)[1], S(0, 196)[1]], 10 * k, (x, y) => lit(x, y) * 1.3, 1451);
  paintDoor(p, [S(196, -4), S(396, -4), S(396, 230), S(196, 230)], S(196, 0)[0], 18 * k, [S(0, 40)[1], S(0, 196)[1]], 10 * k, (x, y) => lit(x, y) * 1.3, 1453);
  over(p, solid(p, [S(20, 98), S(372, 94), S(374, 120), S(18, 124)], OAK, [-0.4, -0.6, 0.6], { round: 0.6, hard: 1, rim: OAK[5], back: [-0.6, -0.6] }), INK, 0, 0, 2);
  for (const x of [70, 190, 202, 322]) {
    over(p, solid(p, [S(x - 7, 90), S(x + 7, 90), S(x + 7, 128), S(x - 7, 128)], IRONS, [-0.4, -0.6, 0.6], { round: 0.4, hard: 1 }), INK);
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
  const light = { from, hard: 1, fill: [0.3, -1, 0.2] as V3, fillK: 0.24, rim: '#ffc070', rimFrom: [-1, -0.3] as const };
  const at = (x: number, y: number, sc: number, look: V3) => ({ look: unit(look), up: [0, 0, 1] as V3, scale: sc * k, ox: S(x, 0)[0], oy: S(0, y)[1] });
  armourerFigure(Math.sin(t * 4) * 0.08, 0, false).draw(p, at(52, 262, 12, [-0.55, 1, -0.05]), { ...light, from: unit([0.3, -0.8, 0.6]) });
  mysticFigure(Math.sin(t * 3.6) * 0.05).draw(p, at(128, 262, 12.5, [0.2, 1, -0.05]), light);
  {
    const f = new Figure();
    const pant = Math.sin(t * 4.2) * 0.12;
    sculptKnight(f, [0, 0, 0], 0, {
      hip: [0, 0, 5.2], chest: [0, -0.4, 7.4 + pant], head: [0, -1.0, 8.8 + pant],
      sh: [[-1.3, -0.4, 8.0 + pant], [1.3, -0.4, 8.0 + pant]],
      el: [[-1.3, -1.3, 6.5], [1.3, -1.3, 6.5]],
      ha: [[-0.25, -1.7, 6.5], [0.25, -1.7, 6.5]],
      kn: [[-0.7, -0.4, 2.8], [0.7, -0.2, 2.8]],
      ft: [[-0.9, 0, 0.3], [0.9, 0.2, 0.3]],
      sword: { hand: 0, tip: [0, -1.9, 0.1] },
      flap: Math.sin(t * 1.5) * 0.3,
    });
    f.draw(p, at(196, 264, 13.5, [0.1, 1, -0.05]), light);
  }
  wordsmithFigure('bar').draw(p, at(268, 262, 12.5, [0.25, 1, -0.05]), light);
  strangerFigure().draw(p, at(330, 250, 11, [-0.25, 1, -0.12]), { ...light, from: unit([-0.3, -0.8, 0.6]) });
  caption(p, 'Barred, just in time.', Math.round(6 * k), Math.round(6 * k), 120);
}

export function paintDark(p: Px, t: number): void {
  const W = p.w;
  const H = p.h;
  const S = (x: number, y: number): Pt => [(x / 392) * W, (y / 75) * H];
  const k = W / 392;
  const far = S(300, 60);
  p.rect(0, 0, W, H, '#05040a');
  // the stair going down into the dark, its steps catching nothing but the far cyan
  for (let j = 0; j < 9; j++) {
    const u = j / 8;
    const y = S(0, 72 - u * 14)[1];
    const x0 = S(130 + u * 150, 0)[0];
    const x1 = S(392 - u * 70, 0)[0];
    const c = glow(x0, y, far[0], far[1], W * 0.4) > 0.15 ? '#0c2a30' : '#0c0a14';
    p.rect(Math.round(x0), Math.round(y), Math.round(x1 - x0), Math.max(1, Math.round(2 * k)), c);
  }
  const pulse = 0.7 + 0.3 * Math.sin(t * 2.3);
  halo(p, far[0], far[1], 14 * k * pulse, CYANS[2], 2, 0.2);
  p.set(Math.round(far[0]), Math.round(far[1]), CYANS[0]).set(Math.round(far[0]) + 1, Math.round(far[1]), CYANS[1]).set(Math.round(far[0]), Math.round(far[1]) - 1, CYANS[1]);
  caption(p, 'The old wordsmith had gone on ahead... down into the dark.', Math.round(6 * k), Math.round(6 * k), 108);
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
    { x: 0, y: 0.5, w: 0.5, h: 0.5, paint: paintStranger, say: '...seeking the Meldstone,' },
    { x: 0.5, y: 0.5, w: 0.5, h: 0.5, paint: paintCompany, say: '...and the altar that wakes the words.' },
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
    { x: 0, y: 0, w: 1, h: 0.78, paint: paintBarred, say: 'Barred, just in time.' },
    { x: 0, y: 0.78, w: 1, h: 0.22, paint: paintDark, say: 'The old wordsmith had gone on ahead... down into the dark.' },
  ],
];

/** A spread (pages `k` and `k + 1`), `t` seconds on: the paper, its boxes painted and inked round, the spine's shadow. */
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
  }
  return p;
}

// (unused yet)
void inside;
void lerp;
void mix;
void noise;
void sm;

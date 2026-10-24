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
import { INK, band, bands, caption, clamp01, facets, fbm, glow, halo, hash, inside, layerOf, lerp, loop, mix, noise, over, path, sm, wash } from './comic';
import type { Pt, Tones } from './comic';

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
// THE PAGES, as he saw them laid out (opening_layout.png)

export const PAGES: readonly (readonly BoxDef[])[] = [
  // PAGE 1
  [
    { x: 0, y: 0, w: 1, h: 0.58, paint: paintRoadUp, say: 'They followed the old wordsmith up the mountain...' },
    { x: 0, y: 0.58, w: 0.5, h: 0.42, paint: paintLanterns },
    { x: 0.5, y: 0.58, w: 0.5, h: 0.42, paint: paintFarAhead },
  ],
  // PAGE 2
  [],
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

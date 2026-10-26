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

import { sculptHorse2 as sculptHorse, sculptWagon2 as sculptWagon } from './opening_wagon';
import { BLUFF, CRAG_R, CRAG_TOP, PEAK, ROAD_HALF, cragEdge, figCam, paintFarPine, paintLand, seenAt, theLand } from './opening_land';
import type { LandCam, LandLight } from './opening_land';
import { Px } from '../engine/px';
import { INK, band, bandBy, bands, balloon as comicBalloon, shine, caption as comicCaption, captionSize, clamp01, dot, facets, fbm, glow, hash, inside, layerOf, lerp, limbSolid, loop, mix, noise, over, path, shadeSolid, sm, solid, wash } from './comic';
import type { Pt, Tones, V3 } from './comic';
import { Figure, axes, cross, unit } from './sdf';
import { ear, forearm, frameAt, hand, nose } from './anatomy';
import * as Cast from './cast';

// ---------------------------------------------------------------------------------------------
// MOVING (his 25 Oct: “why don’t we get things moving”): every box painted once as it stands still (BAKED: what is
// sculpted, the land, all that does not move), then, each frame, what moves painted over a copy of that (LIVE: the fire,
// the smoke, the glows, the lanterns, the coin, the crystal). A painter asks `still()` before what stays put, `moving()`
// before what moves; painting a whole still (`PASS` 'all') does both. Captions and balloons are pinned to the box's frame
// (the player draws them, so that the picture can drift under them).

/** What a painter paints this time: everything, only what stays still, or only what moves. */
export type Pass = 'all' | 'base' | 'live';
let PASS: Pass = 'all';
/** Paint what stays still? */
const still = (): boolean => PASS !== 'live';
/** Paint what moves? */
const moving = (): boolean => PASS !== 'base';
/** The time to pose what is baked by (the bake is of the moment 0): `t` for a whole still, else 0. */
const T0 = (t: number): number => (PASS === 'all' ? t : 0);

/** IN FRONT OF WHAT MOVES. What moves is painted last, over the bake, so what the bake has standing before it (a figure
 * before a fire) must be kept off it: `front(p, key)`, at the place in a painter's order after which the still paint
 * stands before what moves, marks (in the bake) every pixel the still paint changes from there on; `behind(p, key, paint)`
 * paints what moves on all but those. A whole still paints in order, and needs neither. */
const FRONT_FROM = new Map<string, Uint8ClampedArray>();
const FRONTS = new Map<string, Uint8Array>();
const frontKey = (p: Px, key: string): string => `${key}@${p.w}x${p.h}`;
function front(p: Px, key: string): void {
  if (PASS === 'base') FRONT_FROM.set(frontKey(p, key), p.d.slice());
}
function behind(p: Px, key: string, paint: (q: Px) => void): void {
  const m = PASS === 'live' ? FRONTS.get(frontKey(p, key)) : undefined;
  if (!m) {
    paint(p);
    return;
  }
  const q = p.clone();
  paint(q);
  for (let i = 0; i < m.length; i++) {
    if (m[i]) continue;
    const j = i * 4;
    p.d[j] = q.d[j];
    p.d[j + 1] = q.d[j + 1];
    p.d[j + 2] = q.d[j + 2];
    p.d[j + 3] = q.d[j + 3];
  }
}
/** WHAT IS BAKED IN MORE THAN ONE POSE (a sword wound up, then struck): in the bake, each pose painted alone on a clear
 * sheet of its own; the moving paint lays on the one `now` picks (none if -1), all of it, or, `fade` under 1, a dither of
 * it. A whole still paints the pose `whole`. */
const POSES = new Map<string, Px[]>();
function posed(p: Px, key: string, n: number, whole: number, now: number, paint: (q: Px, i: number) => void, fade = 1): void {
  if (PASS === 'all') {
    paint(p, whole);
    return;
  }
  const k = frontKey(p, key);
  if (PASS === 'base') {
    const sheets: Px[] = [];
    for (let i = 0; i < n; i++) {
      const q = layerOf(p);
      paint(q, i);
      sheets.push(q);
    }
    POSES.set(k, sheets);
    return;
  }
  const s = now >= 0 ? POSES.get(k)?.[now] : undefined;
  if (!s || fade <= 0) return;
  for (let y = 0, i = 0; y < s.h; y++) {
    for (let x = 0; x < s.w; x++, i += 4) {
      if (s.d[i + 3] === 0 || (fade < 1 && hash(x, y, 77) >= fade)) continue;
      p.d[i] = s.d[i];
      p.d[i + 1] = s.d[i + 1];
      p.d[i + 2] = s.d[i + 2];
      p.d[i + 3] = 255;
    }
  }
}
/** (At the bake's end: each mark's pixels, the ones changed since.) */
function frontsDone(p: Px): void {
  for (const [key, was] of FRONT_FROM) {
    const m = new Uint8Array(p.w * p.h);
    for (let i = 0; i < m.length; i++) {
      const j = i * 4;
      if (was[j] !== p.d[j] || was[j + 1] !== p.d[j + 1] || was[j + 2] !== p.d[j + 2] || was[j + 3] !== p.d[j + 3]) m[i] = 1;
    }
    FRONTS.set(key, m);
  }
  FRONT_FROM.clear();
}

/** A caption or balloon pinned to a box's frame: its text, where (the box's own pixels), how wide; a balloon's tail's point (in the scene). */
export interface Pin { say: string; x: number; y: number; maxW: number; tail?: Pt }
let PINS: Pin[] | null = null;
function caption(p: Px, say: string, x: number, y: number, maxW: number): void {
  if (PINS) PINS.push({ say, x, y, maxW });
  else comicCaption(p, say, x, y, maxW);
}
function balloon(p: Px, say: string, x: number, y: number, maxW: number, tail: Pt): void {
  if (PINS) PINS.push({ say, x, y, maxW, tail });
  else comicBalloon(p, say, x, y, maxW, tail);
}

/** How much bigger a box is baked than it is shown, that the picture can drift within its frame. */
export const DRIFT = 1.08;

/** What a bake leaves besides its picture, for what moves to be painted over it later (in this run or another): the
 * marks of what stands in front (`front`) and the poses baked (`posed`). */
export interface BakeState {
  fronts: [string, Uint8Array][];
  poses: [string, Px[]][];
}

/** A box baked: what stays still, painted at `drift` times the size it is shown (that it can drift in its frame), its
 * pinned captions, and what its moving paint will want of the bake. */
export function bakeBox(b: BoxDef, w: number, h: number, drift = DRIFT): { img: Px; pins: Pin[]; state: BakeState } {
  const p = new Px(Math.round(w * drift), Math.round(h * drift));
  PASS = 'base';
  PINS = [];
  try {
    b.paint(p, 0);
    frontsDone(p);
    const mine = (k: string): boolean => k.endsWith(`@${p.w}x${p.h}`);
    return {
      img: p,
      pins: PINS,
      state: { fronts: [...FRONTS].filter(([k]) => mine(k)), poses: [...POSES].filter(([k]) => mine(k)) },
    };
  } finally {
    PASS = 'all';
    PINS = null;
    FRONT_FROM.clear();
  }
}

/** A bake's state, made in another run, put back (bakeBox). */
export function restoreBake(s: BakeState): void {
  for (const [k, m] of s.fronts) FRONTS.set(k, m);
  for (const [k, sheets] of s.poses) POSES.set(k, sheets);
}

/** A box `t` seconds on: what moves, painted over a copy of its bake. */
export function liveBox(b: BoxDef, img: Px, t: number): Px {
  const p = img.clone();
  PASS = 'live';
  PINS = [];
  try {
    b.paint(p, t);
    return p;
  } finally {
    PASS = 'all';
    PINS = null;
  }
}

/** Draw a pinned caption or balloon onto `p` (a box's frame), the picture under it moved by (dx, dy). */
export function drawPin(p: Px, pin: Pin, dx: number, dy: number): void {
  if (pin.tail) comicBalloon(p, pin.say, pin.x, pin.y, pin.maxW, [pin.tail[0] - dx, pin.tail[1] - dy]);
  else comicCaption(p, pin.say, pin.x, pin.y, pin.maxW);
}

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
  /** When, seconds after it comes in, its picture jolts in its frame (a blow struck, a bar home), if it does. */
  jolt?: number;
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

/** A pine near enough to see its boughs (paintPine), its foot at (x, y) `t` metres off, kept off what stands before it. */
function paintPineNear(p: Px, depth: Float32Array, x: number, y: number, h: number, t: number, seed: number): void {
  const lay = layerOf(p);
  paintPine(lay, x, y, h, seed);
  // (its boughs' undersides, toward us, caught by the evening on their sun-ward side)
  lay.each((xx, yy) => (lay.has(xx, yy) && !lay.has(xx + 1, yy) && hash(xx, yy, 499) > 0.4 ? '#2a1e30' : undefined));
  for (let yy = 0; yy < p.h; yy++) {
    for (let xx = 0; xx < p.w; xx++) {
      const i = yy * p.w + xx;
      if (lay.d[i * 4 + 3] === 0 || depth[i] < t - 3) continue;
      p.d.set(lay.d.subarray(i * 4, i * 4 + 4), i * 4);
    }
  }
}

/** THE VALLEY BEHIND A CLOSE BOX (the land, paintValley): seen from the road `s` metres along it (`off` metres out to its
 * left), `eye` metres up, looking along it turned `turn` from its way; `F` and `hy` shares of the box's width and height. */
function valleyBehind(p: Px, t: number, s: number, turn: number, eye: number, F: number, hy: number, pitch = 0, off = 0): void {
  const land = theLand();
  const r = land.along(s);
  const a = Math.atan2(r.dir[1], r.dir[0]) + turn;
  const x = r.q[0] - r.dir[1] * off;
  const y = r.q[1] + r.dir[0] * off;
  land.focus(x, y, 90);
  const cam: LandCam = { pos: [x, y, land.exact(x, y) + eye], yaw: Math.atan2(-Math.cos(a), Math.sin(a)), pitch, F: p.w * F, cx: p.w * 0.5, hy: p.h * hy };
  paintValley(p, t, cam, {});
}

/** THE CARAVAN, CLOSE (scene 2's big shot, a box of its own, not on a page): down by the road as the wagons come by, low,
 * the nearer filling the lower middle of the picture, the other behind it; behind them the foothills and the peak's face
 * going up out of the top of the picture, the road switching back and forth up it; the evening's glow behind the peak. */
export function paintCaravan(p: Px, t: number): void {
  const W = p.w;
  const H = p.h;
  const land = theLand();
  const sc = land.index.near(300, 477)?.s ?? 0;
  const cam: LandCam = { pos: [314, 459, land.exact(314, 459) + 1.6], yaw: -0.22, F: W * 0.72, cx: W * 0.5, hy: H * 0.56 };
  paintValley(p, t, cam, { wagons: [{ s: sc + 33, seed: 0, driver: true }, { s: sc + 17, seed: 1, driver: 'armourer' }, { s: sc + 1, seed: 2, driver: true }], smithAt: SMITH_AT });
  // YOUR HERO AND YOUR WORDSMITH walking beside the wagons on the road's near side, the wordsmith's rune alight in his palm
  // (art/cast.ts, as on page 2, at their true size)
  const ph = T0(t) * 2.4;
  const walker = (s: number, off: number): { q: V3; yaw: number } => {
    const r = land.along(s);
    // (on the road's side toward us)
    const sg = (cam.pos[0] - r.q[0]) * r.dir[1] - (cam.pos[1] - r.q[1]) * r.dir[0] > 0 ? 1 : -1;
    const n: V3 = [r.dir[1] * sg, -r.dir[0] * sg, 0];
    const x = r.q[0] + n[0] * off;
    const y = r.q[1] + n[1] * off;
    return { q: [x, y, land.exact(x, y)], yaw: Math.atan2(r.dir[0], -r.dir[1]) };
  };
  const sNear = land.index.near(cam.pos[0], cam.pos[1])?.s ?? sc + 14;
  const ws = walker(sNear + 1.5, 2.0);
  const kn = walker(sNear - 1.2, 2.4);
  const wf = new Figure();
  const A = Cast.place(wf, [0, 0, 0], ws.yaw - 0.35, () => Cast.townWordsmith(wf, {
    pelvis: [0, 0, 9.15],
    lean: 0.05,
    turn: 0.35,
    nod: -0.05,
    hands: [[-2.1, -0.2 + Math.sin(ph) * 0.6, 8.6], [3.4, -1.7, 11.4]],
    palms: [[0, 1, 0], [0, 0, 1]],
    fingers: [[0, 0, -1], [0.1, -1, 0.15]],
    elbows: [[-1, 0.3, -0.5], [1, 0.4, -1]],
    feet: [[-0.85, -1.2 - Math.sin(ph) * 0.8, 0.75], [0.85, 1.0 + Math.sin(ph) * 0.8, 0.95]],
  }, { palm: true }));
  const kf = new Figure();
  Cast.place(kf, [0, 0, 0], kn.yaw + 0.25, () => Cast.knight(kf, {
    pelvis: [0, 0, 9.4],
    lean: 0.06,
    turn: -0.15,
    nod: 0.05,
    hands: [[-2.3, 0.4 + Math.sin(ph + 1.3) * 0.6, 8.9], [1.45, -1.4, 11.9]],
    elbows: [[-1, 0.3, -0.5], [1, 0, -1]],
    fingers: [[0, 0, -1], [-0.2, -0.6, 0.75]],
    palms: [[1, 0, 0], [-1, 0, 0]],
    feet: [[-0.9, 1.1 + Math.sin(ph + 1.3) * 0.8, 1.0], [0.9, -1.2 - Math.sin(ph + 1.3) * 0.8, 0.75]],
  }, { hand: 1, tip: [2.4, 5.0, 20.6] }, Math.sin(T0(t) * 3.1) * 0.25));
  const wc = figCam(cam, ws.q, 0.1);
  const kc = figCam(cam, kn.q, 0.1);
  const rune = seen(wc, A.at([3.75, -2.0, 12.6]));
  if (still()) {
    kf.draw(p, kc, { cel: COMIC, at: [9, -12, 14], hard: 1, fill: [0.1, -1, 0.15], fillK: 0.3, rim: '#f0a070', rimFrom: [1, -0.3] });
    wf.draw(p, wc, { cel: COMIC, at: A.at([3.75, -2.0, 12.6]), hard: 1, fill: [0.1, -1, 0.15], fillK: 0.3, rim: '#f0a070', rimFrom: [1, -0.3] });
  }
  if (moving()) {
    const fl = 0.85 + 0.15 * Math.sin(t * 5.3);
    shine(p, rune[0], rune[1], wc.scale * 5 * fl, CYANS[2], 2, 0.3);
    shine(p, rune[0], rune[1], wc.scale * 1.4 * fl, CYANS[0], 2, 0.7);
  }
}

/** Where on the road they stop, out on the foothills before the peak, and he points up it (metres along it). */
function footOfFace(): number {
  return theLand().index.near(560, 690)?.s ?? 900;
}

/** THE OLD WORDSMITH POINTING UP (scene 3's big shot, a box of its own): at the foot of the peak's face, where the road
 * begins to climb it, the wagons stopped behind him; from low on the road behind him and to his side, looking up past him
 * as he holds his staff up at the crag on the peak's top and the prison on it, all that way up, the face going up between,
 * the road's bends on it; his words (sculpted as on page 3, oldSmithFigure, at his true size, a tenth of a metre a unit). */
export function paintPointing(p: Px, t: number): void {
  const W = p.w;
  const H = p.h;
  const land = theLand();
  const s0 = footOfFace();
  const at = land.along(s0);
  const d = at.dir;
  const up = unit([PEAK[0] - at.q[0], PEAK[1] - at.q[1], 0]);
  // (we are on the road a few steps back and to his left, low)
  const side: V3 = [up[1], -up[0], 0];
  // (further back than he is tall, and with a long lens: the peak looms over him, the prison on its crag big enough to
  // read, him in the foot of the picture from his knees up)
  const cx = at.q[0] - up[0] * 4.8 + side[0] * 1.7;
  const cy = at.q[1] - up[1] * 4.8 + side[1] * 1.7;
  if (still()) land.focus(cx, cy, 140);
  const cam: LandCam = { pos: [cx, cy, land.exact(cx, cy) + 1.5], yaw: Math.atan2(-up[0], up[1]) - 0.08, pitch: 0.17, F: W * 0.375, cx: W * 0.5, hy: H * 0.5 };
  paintValley(p, t, cam, { wagons: [{ s: s0 - 16, seed: 0, driver: true }] });
  // HIM, his staff up at the prison
  const prison: V3 = [PEAK[0], PEAK[1], CRAG_TOP + 20];
  const aim = unit([prison[0] - at.q[0], prison[1] - at.q[1], prison[2] - at.q[2] - 2]);
  const fig = oldSmithFigure(Math.atan2(aim[0], -aim[1]), Math.sin(T0(t) * 1.3) * 0.15, unit([aim[0] * 0.8, aim[1] * 0.8, Math.max(0.7, aim[2])]), true, 18.6);
  const fc = figCam(cam, at.q, 0.1);
  if (still()) fig.f.draw(p, fc, { at: fig.head, hard: 1, fill: [-0.3, -1, 0.4], fillK: 0.5, rim: '#e8904a', rimFrom: [1, 0] });
  const hs: Pt = seen(fc, fig.head);
  if (moving()) paintStaffFire(p, hs[0], hs[1], W / 231, t, 0.85 + 0.15 * Math.sin(t * 6.1));
  // HIS WORDS
  const mouth = seen(fc, fig.mouth);
  balloon(p, 'Up there. The altar sleeps in the old prison.', Math.round(W * 0.03), Math.round(H * 0.04), 120, [mouth[0], mouth[1]]);
}

/** How far up the road the old wordsmith is, ahead of the wagons, in the first box (metres along it). */
const SMITH_AT = 3500;

/** THE DUSK SKY (box 1's; his words of it, 25 Oct 2026: “The sky is actually really good”): its glow low at (GX, GY);
 * in flat bands, the dots of each band laid over the next, dark up, burning low behind the peak; a few stars; long ragged
 * banks of cloud across the glow. */
function paintDuskSky(p: Px, GX: number, GY: number): void {
  const W = p.w;
  const H = p.h;
  const u = W / 392;
  // THE SKY, in flat bands, the dots of each band laid over the next: dark up, burning low behind the crag
  const sky = layerOf(p);
  sky.rect(0, 0, W, H, DUSK[0]);
  bands(sky, DUSK, (x, y) => {
    const g = glow(x * 0.62, y * 2.2, GX * 0.62, GY * 2.2, W * 0.8);
    return clamp01(0.05 + Math.pow(y / H, 1.2) * 0.3 + g * 1.05 + strata(x, y, 1690));
  });
  // a few stars, high and away from the glow
  for (let k = 0; k < Math.round(46 * u); k++) {
    const x = Math.floor(hash(k, 1, 91) * W);
    const y = Math.floor(hash(k, 2, 91) * H * 0.3);
    if (glow(x, y, GX, GY, W * 0.7) > 0.04) continue;
    sky.set(x, y, hash(k, 3, 91) > 0.75 ? '#efe8ff' : '#7c74a8');
  }
  over(p, sky, null);
  // LONG CLOUDS across the glow: ragged banks, broken into pieces, dark above, warming down to their undersides, which the
  // glow lights
  const cl = layerOf(p);
  for (const [cy, x0, x1, th, sd] of [[0.2, 0.34, 1.05, 5, 1], [0.28, 0.5, 1.08, 4, 2], [0.13, 0.62, 0.98, 3, 3]] as const) {
    for (let x = Math.floor(x0 * W); x <= x1 * W; x++) {
      const f = (x - x0 * W) / ((x1 - x0) * W);
      const lump = fbm(x / (26 * u), sd * 7.3, 40 + sd);
      const thick = th * u * 2.4 * Math.pow(Math.sin(Math.PI * f), 0.6) * clamp01((lump - 0.32) * 2.6) * (0.75 + 0.5 * noise(x / (7 * u), sd, 41));
      if (thick < 1) continue;
      const top = H * cy - thick * 0.65;
      const bot = H * cy + thick * 0.35;
      const lit = glow(x, bot, GX, GY, W * 0.7);
      for (let y = Math.ceil(top); y <= bot; y++) {
        const d = bot - y;
        const c = d < 1.2 * u ? (lit > 0.15 ? '#f0a070' : '#9a4a5a') : d < thick * 0.45 && dot(x, y, 1 - d / (thick * 0.45), 2) ? (lit > 0.15 ? '#6a2e4a' : '#3a1e40') : '#2a1838';
        cl.set(x, y, c);
      }
    }
  }
  over(p, cl, null);
}

/** Where the sky's glow is seen by a camera in the land: low behind the peak, where the sun has gone down. */
const SKY_SUN: V3 = unit([0.53, 1, 0.51]);
function glowSeen(c: LandCam): Pt {
  const [x, y] = seenAt(c, [c.pos[0] + SKY_SUN[0] * 1e6, c.pos[1] + SKY_SUN[1] * 1e6, c.pos[2] + SKY_SUN[2] * 1e6]);
  return [x, y];
}

/** What a shot of the valley has in it besides the land: the wagons (where on the road, which, who drives, at a walk or
 * the gallop, afire), the old wordsmith far up the road (how far along it), the woods, the prison. */
/** How many metres a unit of the prison (sculptPrison) is. */
const PRISON_M = 2.6;
/** Where the prison stands on the crag: turned so that its gate (at (-24, -1.9) of its own) is where the road comes up onto
 * the crag, the way through it going on into the crag as the road does; where its own middle is, and its turn. */
function prisonPlace(): { at: V3; yaw: number; gate: V3; inward: V3 } {
  const land = theLand();
  const r = land.road;
  // (where the road crosses the crag's edge going in: the gate stands on the edge there, the way through it going in)
  let i = r.length - 1;
  const rad = (q: V3): number => Math.hypot(q[0] - PEAK[0], q[1] - PEAK[1]);
  const edgeAt = (q: V3): number => cragEdge(Math.atan2(q[1] - PEAK[1], q[0] - PEAK[0]));
  while (i > 0 && rad(r[i].q) < edgeAt(r[i].q)) i--;
  const th = Math.atan2(r[i].q[1] - PEAK[1], r[i].q[0] - PEAK[0]);
  const ge = cragEdge(th) + 0.5;
  const g: V3 = [PEAK[0] + Math.cos(th) * ge, PEAK[1] + Math.sin(th) * ge, CRAG_TOP];
  const inward = unit([PEAK[0] - g[0], PEAK[1] - g[1], 0]);
  const yaw = Math.atan2(-inward[0], inward[1]);
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  const lg: V3 = [-24 * PRISON_M, -1.9 * PRISON_M, 0];
  const off: V3 = [lg[0] * c - lg[1] * s, lg[0] * s + lg[1] * c, 0];
  return { at: [g[0] - off[0], g[1] - off[1], CRAG_TOP], yaw, gate: [g[0], g[1], CRAG_TOP], inward };
}

/** THE PRISON, AS BIG AS IT IS (his words of the first box, 25 Oct 2026: “I want the mountain to look super high and the
 * prison, while big, should look proportional”): a fortress ringing the crag's whole top, a metre a unit, sculpted where it
 * stands. Its curtain wall along the crag's edge, a little in from it, fourteen metres high, round towers along it every
 * forty metres or so with their cone roofs; the gatehouse where the road comes up onto the crag, two great towers either
 * side of the arched gate (five metres wide, seven high: a wagon goes in under it), the way through dark; within, the keep,
 * high and square, its turrets at its corners, and long halls roofed in slate. Its windows few and narrow, some lit. Its
 * stones in courses if it is seen close (`close`). Made round `o` (where the gate is), that it is drawn at that place. */
function sculptFortress(f: Figure, close: boolean): V3 {
  const pp = prisonPlace();
  const o = pp.gate;
  const at = (q: V3): V3 => [q[0] - o[0], q[1] - o[1], q[2] - o[2]];
  const base = CRAG_TOP - 3;
  const STONES = ['#0c0a18', '#120f22', '#1b1630', '#262040', '#342a50', '#46385e', '#56466a'];
  const stone = f.stuff({
    tones: [INK, '#120f22', '#1b1630', '#262040', '#342a50', '#46385e'],
    crease: 0.5,
    paint: (q, n, lit) => {
      if (Math.abs(n[2]) > 0.45) return null;
      // (in its own place: q is round the gate)
      const wx = q[0] + o[0];
      const wy = q[1] + o[1];
      const z = q[2] + o[2] - base;
      // (along the face, measured from near the gate, that it does not run away round a tower)
      const along = (n[0] * q[1] - n[1] * q[0]) / Math.max(0.2, Math.hypot(n[0], n[1]));
      void wx;
      void wy;
      // windows: narrow, in rows, few; some lit
      const row = Math.floor(z / 6.5);
      const col = Math.floor(along / 4.5);
      const fz = z / 6.5 - row;
      const fa = along / 4.5 - col;
      if (row >= 1 && fz > 0.35 && fz < 0.62 && fa > 0.44 && fa < 0.56) {
        const hh = hash(col, row, 1471);
        if (hh < (close ? 0.05 : 0.12)) return '#ffd98a';
        if (hh < 0.24) return '#0a0814';
      }
      if (!close) return null;
      // STONES LAID BY HAND: each course its own height, each stone its own length, the joints of one course off those of
      // the next; each stone its own shade; old: streaked dark down from its sills and its top, the mortar fallen in
      const zc = z + (noise(along / 9, 0.5, 1473) - 0.5) * 0.25;
      const c0 = Math.floor(zc / 0.8);
      const edges = [c0 - 1, c0, c0 + 1, c0 + 2].map((k) => k * 0.8 + (hash(k, 0, 1474) - 0.5) * 0.36);
      let course = c0;
      for (let k = 0; k < 3; k++) if (zc >= edges[k] && zc < edges[k + 1]) course = c0 - 1 + k;
      const lo = edges[course - c0 + 1];
      const hi = edges[course - c0 + 2];
      // (the joints not ruled: each stone's edges a little out of true, its corners worn; the mortar fallen deeper here)
      const wob = (noise(along * 2.3, zc * 2.3, 1478) - 0.5) * 0.07;
      if (zc - lo < 0.045 + wob || hi - zc < 0.012) return STONES[0];
      const sl = 0.9 + hash(course, 1, 1475) * 1.1;
      const sa = along / sl + hash(course, 2, 1475) * 7;
      const sid = Math.floor(sa);
      const fs = sa - sid;
      const fe = Math.min(fs, 1 - fs) * sl;
      const fzs = Math.min(zc - lo, hi - zc);
      if (fs < (0.045 + (noise(zc * 3.1, along, 1479) - 0.5) * 0.05) / sl) return STONES[0];
      if (fe < 0.09 && fzs < 0.09 && hash(sid, course, 1480) > 0.4) return STONES[1];
      // (each stone its own shade, and its face rough: pitted, a little lighter on its upper edge where the sky catches it)
      const own = (hash(sid, course, 1476) - 0.5) * 1.4;
      const rough = (noise(along * 7, z * 7, 1481) - 0.5) * 1.1 + (hash(Math.floor(along * 14), Math.floor(z * 14), 1482) > 0.93 ? -1 : 0);
      const upper = hi - zc < 0.08 ? 0.6 : 0;
      const streak = clamp01((noise(along * 1.3, z * 0.07, 1477) - 0.5) * 3) * 1.2;
      const k = Math.round(1 + lit * 4.6 + own + rough + upper - streak);
      return STONES[Math.max(1, Math.min(STONES.length - 1, k))];
    },
  });
  const slate = f.stuff({ tones: [INK, '#0c0a18', '#141026', '#1e1834', '#2a2244'], crease: 0.4 });
  const dark = f.stuff({ tones: [INK, INK, '#07060d'], crease: 0 });
  const tower = (q: V3, r: number, h: number, foot = 0): void => {
    f.rod(stone, at([q[0], q[1], base - foot]), at([q[0], q[1], base + h]), r * (foot > 0 ? 1.12 : 1), r * 0.94, 0.2);
    // (its battlement's ring a little proud of it, and its cone of slate)
    f.rod(stone, at([q[0], q[1], base + h - 1.2]), at([q[0], q[1], base + h + 0.4]), r * 1.08, r * 1.08, 0.1);
    f.rod(slate, at([q[0], q[1], base + h + 0.4]), at([q[0], q[1], base + h + r * 2.1]), r * 1.12, 0.25, 0.1);
  };
  // THE CURTAIN WALL round the crag's edge, and its towers
  const N = 24;
  const ring: V3[] = [];
  const ga = Math.atan2(o[1] - PEAK[1], o[0] - PEAK[0]);
  for (let i = 0; i < N; i++) {
    const th = ga + (i / N) * Math.PI * 2;
    const r = cragEdge(th) + 0.5;
    ring.push([PEAK[0] + Math.cos(th) * r, PEAK[1] + Math.sin(th) * r, 0]);
  }
  for (let i = 0; i < N; i++) {
    const a = ring[i];
    const b = ring[(i + 1) % N];
    // (standing on the crag's very edge, its foot carried down the cliff, so that it rises out of the rock)
    const mid: V3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, base - 4];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const ax0 = unit([b[0] - a[0], b[1] - a[1], 0]);
    const ax1: V3 = [-ax0[1], ax0[0], 0];
    // (the gate's stretch is the gatehouse's: the wall stops short of it either side)
    if (i === 0 || i === N - 1) {
      const half = len / 2 - 6;
      const sh = i === 0 ? 6 : -6;
      f.block(stone, at([mid[0] + ax0[0] * sh, mid[1] + ax0[1] * sh, mid[2]]), [half, 2.6, 18], 0.15, [ax0, ax1, [0, 0, 1]], 0.2);
    } else f.block(stone, at(mid), [len / 2 + 1, 2.6, 18], 0.15, [ax0, ax1, [0, 0, 1]], 0.2);
    if (close) {
      // (its merlons along its top)
      for (let m = -len / 2 + 1.2; m < len / 2 - 0.6; m += 2.4) {
        f.block(stone, at([mid[0] + ax0[0] * m, mid[1] + ax0[1] * m, base + 14.6]), [0.6, 2.6, 0.6], 0.05, [ax0, ax1, [0, 0, 1]], 0);
      }
    }
    if (i !== 0 && i % 2 === 0) tower(a, 5.2, 24, 26);
  }
  // THE GATEHOUSE where the road comes onto the crag: two great towers either side of the arched gate, the way through dark
  {
    const I = pp.inward;
    const S: V3 = [-I[1], I[0], 0];
    const g: V3 = [o[0], o[1], 0];
    tower([g[0] + S[0] * 8.5, g[1] + S[1] * 8.5, 0], 5, 28, 26);
    tower([g[0] - S[0] * 8.5, g[1] - S[1] * 8.5, 0], 5, 28, 26);
    f.block(stone, at([g[0], g[1], base + 9]), [5.5, 4.5, 9], 0.2, [S, I, [0, 0, 1]], 0.2);
    // (the arch: the way through, five metres wide and seven and a half high, its top round, its floor the road's, the
    // crag's top, where the terrace comes to it; dark at its far end, where it opens into the yard)
    const fl = CRAG_TOP;
    f.block(stone, at([g[0], g[1], fl + 2.5]), [2.5, 5.2, 2.5 + 0.02], 0.02, [S, I, [0, 0, 1]], 0, true);
    f.rod(stone, at([g[0] - I[0] * 5.4, g[1] - I[1] * 5.4, fl + 5.0]), at([g[0] + I[0] * 5.4, g[1] + I[1] * 5.4, fl + 5.0]), 2.5, 2.5, 0, true);
    f.block(dark, at([g[0] + I[0] * 4.3, g[1] + I[1] * 4.3, fl + 2.5]), [2.45, 0.2, 2.5], 0.02, [S, I, [0, 0, 1]], 0);
    f.rod(dark, at([g[0] + I[0] * 4.1, g[1] + I[1] * 4.1, fl + 5.0]), at([g[0] + I[0] * 4.5, g[1] + I[1] * 4.5, fl + 5.0]), 2.45, 2.45, 0);
    // (its voussoirs, a ring of wedge stones round the arch's face; and the grooves the portcullis runs in)
    for (let i = 0; i <= 10; i++) {
      const an = (i / 10) * Math.PI;
      const c = Math.cos(an);
      const s = Math.sin(an);
      f.line([at([g[0] - I[0] * 4.55 + S[0] * c * 2.5, g[1] - I[1] * 4.55 + S[1] * c * 2.5, fl + 5 + s * 2.5]), at([g[0] - I[0] * 4.55 + S[0] * c * 3.4, g[1] - I[1] * 4.55 + S[1] * c * 3.4, fl + 5 + s * 3.4])], '#0c0a18', 1);
    }
    if (close) for (let m = -5; m <= 5; m += 2.5) f.block(stone, at([g[0] + S[0] * m - I[0] * 4, g[1] + S[1] * m - I[1] * 4, base + 18.6]), [0.6, 0.6, 0.7], 0.05, [S, I, [0, 0, 1]], 0);
  }
  // THE KEEP within, high and square, its turrets; the long halls round the yard
  {
    // (the keep stands on the crag's edge beside the gate, its face to the drop and the road coming up, its foot carried down
    // the cliff: the face of the prison that is seen from below)
    const I = pp.inward;
    const S: V3 = [-I[1], I[0], 0];
    const k: V3 = [o[0] + S[0] * 34 + I[0] * 12, o[1] + S[1] * 34 + I[1] * 12, 0];
    const kx = S;
    const ky = I;
    f.block(stone, at([k[0], k[1], base + 12]), [16, 13, 36], 0.2, [kx, ky, [0, 0, 1]], 0.2);
    f.block(slate, at([k[0], k[1], base + 50]), [14, 11, 2.5], 0.6, [kx, ky, [0, 0, 1]], 0.2);
    for (const [u, w] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) tower([k[0] + kx[0] * 16 * u + ky[0] * 13 * w, k[1] + kx[1] * 16 * u + ky[1] * 13 * w, 0], 3.4, 54);
    for (const [u, w, len] of [[2.4, 2.6, 30], [-1.6, 3.2, 26], [0.4, 5.6, 22]]) {
      const h: V3 = [k[0] + kx[0] * 22 * u + ky[0] * 22 * w, k[1] + kx[1] * 22 * u + ky[1] * 22 * w, 0];
      f.block(stone, at([h[0], h[1], base + 5]), [len / 2, 5, 5], 0.15, [kx, ky, [0, 0, 1]], 0.2);
      f.block(slate, at([h[0], h[1], base + 11]), [len / 2 + 0.5, 4.2, 1.6], 0.8, [kx, ky, [0, 0, 1]], 0.2);
    }
  }
  return o;
}

interface Valley {
  wagons?: { s: number; seed: number; driver: boolean | 'armourer'; gallop?: boolean; burn?: number; burnAt?: V3 }[];
  smithAt?: number;
  lights?: LandLight[];
  /** The prison drawn (by default), and its stones in courses (close to). */
  prison?: boolean;
  prisonClose?: boolean;
}

/** A SHOT OF THE VALLEY from `cam` (art/opening_land.ts): the dusk sky, the mountain at its true size and the road up it,
 * the woods, the prison on its crag, the wagons, the old wordsmith far up the road. What it saw, for the box to stand
 * more in it: how far off each pixel's land is. */
function paintValley(p: Px, t: number, cam: LandCam, v: Valley): Float32Array | null {
  const W = p.w;
  const H = p.h;
  const land = theLand();
  if (still()) {
    const [GX, GY] = glowSeen(cam);
    paintDuskSky(p, GX, GY);
  }
  let depth: Float32Array | null = null;
  if (still()) {
    depth = paintLand(p, cam, { lights: v.lights });
    // THE WOODS low on the foothills and the peak's lower slopes: pines, each as tall as it would be seen from here, darker
    // and hazier the further off (the scale of the mountain is in them)
    const land = theLand();
    const trees: [number, number, number, number][] = [];
    for (let k = 0; k < 16000; k++) {
      const x = -1800 + hash(k, 1, 481) * 4200;
      const y = 120 + Math.pow(hash(k, 2, 481), 1.3) * 2300;
      if (fbm(x / 260, y / 260, 482) < 0.42) continue;
      const z = land.height(x, y);
      if (z > 430 + fbm(x / 90, y / 90, 483) * 120) continue;
      const n = land.normal(x, y, 3);
      if (n[2] < 0.6) continue;
      const r = land.index.near(x, y);
      if (r && r.d < ROAD_HALF + 4) continue;
      const [sx, sy, fw] = seenAt(cam, [x, y, z]);
      if (sx < -10 || sx > W + 10 || fw < 20) continue;
      trees.push([sx, sy, fw, k]);
    }
    trees.sort((a, b) => b[2] - a[2]);
    for (const [sx, sy, fw, k] of trees) {
      const hp = ((14 + hash(k, 3, 481) * 10) * cam.F) / fw;
      if (hp < 1.5) continue;
      const hz = clamp01(fw / 3200);
      const col = hz > 0.66 ? '#2a1e3c' : hz > 0.33 ? '#181428' : '#0a0912';
      if (hp > 40) paintPineNear(p, depth, sx, sy + 2, hp, fw, k);
      else paintFarPine(p, depth, sx, sy + 1, hp, fw, k, col, hp > 6 && hz < 0.5 ? '#3a2a44' : null);
    }
  }
  // THE PRISON on the crag, big as forts go and small against the mountain (sculptPrison, PRISON_M metres a unit: its
  // walls a hundred and thirty metres across), its gate where the road comes up onto the crag; black against the glow,
  // its windows lit
  if (still() && v.prison !== false) {
    const pf = new Figure();
    const at = sculptFortress(pf, v.prisonClose ?? false);
    const pc = figCam(cam, at, 1);
    const lay = layerOf(p);
    // (lit as the land is: the sun low behind the peak rimming what turns to it; the evening sky's light from up on the left
    // on the faces turned to us)
    const close = v.prisonClose ?? false;
    const fd = pf.draw(lay, pc, { from: unit([0.53, 1, 0.3]), hard: 1, fill: close ? unit([-0.4, -0.9, 0.35]) : unit([-0.7, -0.6, 0.5]), fillK: close ? 0.85 : 0.62, rim: '#f0a070', rimFrom: [1, -0.6] });
    // (its windows lit, a few, here and there in its walls and towers)
    for (let k = 0, lit = 0; k < 4000 && lit < 14; k++) {
      const x = Math.floor(hash(k, 1, 497) * W);
      const y = Math.floor(hash(k, 2, 497) * H);
      if (lay.d[(y * W + x) * 4 + 3] === 0 || lay.d[((y + 2) * W + x) * 4 + 3] === 0 || lay.d[((y - 2) * W + x) * 4 + 3] === 0) continue;
      if (lay.d[(y * W + x - 1) * 4 + 3] === 0 || lay.d[(y * W + x + 1) * 4 + 3] === 0) continue;
      lay.set(x, y, '#ffd98a');
      if (hash(k, 3, 497) > 0.5) lay.set(x, y + 1, '#f4a648');
      lit++;
    }
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        // (kept off by the land before it: how far ahead of the camera its own pixel is, against the land's)
        if (lay.d[i * 4 + 3] === 0) continue;
        const own = fd[i] === -Infinity ? Infinity : pc.persp - fd[i];
        if (depth && depth[i] < own - 4) continue;
        p.d.set(lay.d.subarray(i * 4, i * 4 + 4), i * 4);
      }
    }
  }
  // THE WAGONS on the road before us, their lanterns lit (sculptWagon, a fifth of a metre a unit); THE OLD WORDSMITH far up
  // the road ahead of them, on a bend of it up the peak's face: a speck, and his light
  const lamps: Pt[] = [];
  for (const wg of v.wagons ?? []) {
    const r = land.along(wg.s);
    const wf = new Figure();
    const g = wg.gallop ?? false;
    const w = sculptWagon(wf, [0, 0, 0], Math.atan2(r.dir[1], r.dir[0]), { roll: g ? -T0(t) * 7 : wg.seed * 0.7, horse: { ph: (g ? T0(t) * 9 : T0(t) * 2.2) + wg.seed * 2.1, gallop: g }, lampSide: -1, driver: wg.driver, ribs: false, burn: wg.burn, burnAt: wg.burnAt });
    const wc = figCam(cam, r.q, 0.2);
    if (still()) wf.draw(p, wc, { from: unit([-0.35, -0.75, 0.6]), hard: 1, fill: [0.6, 0.6, 0.3], fillK: 0.3, rim: '#f0a070', rimFrom: [1, -0.4] });
    if (w.lamp) lamps.push(seen(wc, w.lamp));
  }
  // (the lanterns' light, flickering)
  const L = cam.F / 520;
  if (moving()) for (const [i, [x, y]] of lamps.entries()) shine(p, x, y, (8 + Math.sin(t * 9.3 + i * 2) * 0.8) * L, LAMP[1], 2, 0.3);
  if (v.smithAt !== undefined) {
  const ahead = land.along(v.smithAt);
  const [hx, hy] = seenAt(cam, [ahead.q[0], ahead.q[1], ahead.q[2] + 1.8]);
  if (still()) {
    p.set(Math.round(hx), Math.round(hy), '#07060d').set(Math.round(hx), Math.round(hy) + 1, '#07060d');
  }
  if (moving()) {
    const fl = 0.85 + 0.15 * Math.sin(t * 2.4);
    shine(p, hx, hy - 1, 7 * L * fl, CYANS[2], 2, 0.4);
    p.set(Math.round(hx), Math.round(hy) - 1, CYANS[0]).set(Math.round(hx) + 1, Math.round(hy) - 1, CYANS[1]);
  }
  }
  return depth;
}

export function paintRoadUp(p: Px, t: number): void {
  const W = p.w;
  const H = p.h;
  // THE MOUNTAIN, at its true size (art/opening_land.ts): we stand a little off the road at its start, low, looking across
  // it and up at the peak; the road going away from us across the foothills, then back and forth up the peak's face to
  // the crag on its top; the wagons crossing before us; the old wordsmith far up the road
  const land = theLand();
  const sc = land.index.near(300, 477)?.s ?? 0;
  const cam: LandCam = { pos: [322, 452, land.exact(322, 452) + 3.4], yaw: 0, F: W * 0.45, cx: W * 0.5, hy: H * 0.78 };
  paintValley(p, t, cam, { wagons: [{ s: sc + 24, seed: 0, driver: true }, { s: sc + 8, seed: 1, driver: 'armourer' }], smithAt: SMITH_AT });
  // THE CAPTION
  caption(p, 'They followed the old wordsmith up the mountain...', 6, 6, 150);
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
  const u = W / 392;
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
        if (wide > 5 * u) {
          for (const v of [-0.55, 0.55]) line(proj(off(a, side0, v * HALF, 0.01)), proj(off(b, side, v * HALF, 0.01)), 4, 0.2, d);
        }
        const tall = Math.abs(proj(wa)[1] - proj(dnA)[1]);
        if (tall > 4 * u) {
          line(proj(off(dnA, side0, -0.3, -WALL * 0.5)), proj(off(dnB, side, -0.3, -WALL * 0.5)), 5, 0, d);
          if (i % 2 === 0) line(proj(off(dnA, side0, -0.15, -0.1)), proj(off(dnA, side0, -0.3, -WALL * 0.5)), 5, 0, d);
          else line(proj(off(dnA, side0, -0.3, -WALL * 0.5)), proj(off(dnA, side0, -0.6, -WALL)), 5, 0, d);
        }
        // (its outer edge: a line of light where the road's lip meets the wall)
        line(proj(dnA), proj(dnB), 6, 0.6 + g, d);
      },
    });
  }
  if (still()) {
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
      const v = clamp01(lit[i] + (fbm(x / (4 * u), y / (4 * u), 21 + kd) - 0.5) * 0.3) * (tones.length - 1);
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
        reach = Math.max(4, Math.min(16, 1800 / Math.max(60, far[i]))) * u;
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
  const swingAt = (tt: number): number => Math.sin(tt * 1.7) * 0.14;
  const hookX = W * 0.36;
  const hookY = H * 0.12;
  const hang = H * 0.2;
  const lampAt = (tt: number): Pt => [hookX + Math.sin(swingAt(tt)) * hang, hookY + Math.cos(swingAt(tt)) * hang + H * 0.17];
  // (what is lit is baked lit as by the lantern at rest; the lantern and its own light move)
  const [LX0, LY0] = lampAt(T0(t));
  const lamp = (x: number, y: number, r = W * 0.85): number => glow(x, y, LX0, LY0, r);
  const swing = swingAt(t);
  const [LX, LY] = lampAt(t);
  if (still()) {
  // THE DUSK behind, top left: the glow low, the slope's dark edge across it
  // (the land behind, across the road: the meadow, the pines, the evening over the foothills)
  valleyBehind(p, t, 260, Math.PI / 2 + 0.3, 1.5, 0.6, 0.46, 0.04, -6);
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
  }
  // (the wheel turning, the lantern swinging on its hook, its light: a warm halo in the air round it)
  if (moving()) {
    paintWheel(p, W * 0.8, H * 0.9, H * 0.38, lamp, t);
    shine(p, LX, LY + 4, 34 + Math.sin(t * 5.3) * 2, LAMP[2], 2, 0.22);
    paintLantern(p, LX, LY, swing, hookX, hookY);
  }
}

/** A wagon wheel at (cx, cy), radius r: an iron tyre over wooden felloes, twelve spokes to the hub; lit by `lit`. */
function paintWheel(p: Px, cx: number, cy: number, r: number, lit: (x: number, y: number) => number, t: number): void {
  const w = layerOf(p);
  const turn = t * 0.5;
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
  // THE OLD WORDSMITH FAR AHEAD, close: high on the peak's face at the edge of the road, his staff up and burning, looking
  // up the road for the way on; behind him the land a long way down, the road's bends below him, the foothills, the
  // evening's glow (sculpted as on page 3, oldSmithFigure, at his true size, a tenth of a metre a unit)
  const land = theLand();
  const at = land.along(SMITH_AT);
  const up = unit([PEAK[0] - at.q[0], PEAK[1] - at.q[1], 0]);
  const d = at.dir;
  // (we are on the road a little way on ahead of him, on its slope side, looking back at him and out over the drop)
  const cx = at.q[0] + d[0] * 2.9 + up[0] * 0.6;
  const cy = at.q[1] + d[1] * 2.9 + up[1] * 0.6;
  if (still()) land.focus(cx, cy, 120);
  const look = unit([-d[0] * 0.85 - up[0] * 0.5, -d[1] * 0.85 - up[1] * 0.5, 0]);
  const cam: LandCam = { pos: [cx, cy, land.exact(cx, cy) + 0.8], yaw: Math.atan2(-look[0], look[1]), pitch: 0.12, F: W * 0.66, cx: W * 0.5, hy: H * 0.56 };
  paintValley(p, t, cam, {});
  // (he faces up the road, toward us and the peak; his staff up over his head)
  const face = unit([d[0] * 0.6 + up[0] * 0.8, d[1] * 0.6 + up[1] * 0.8, 0]);
  const fig = oldSmithFigure(Math.atan2(face[0], -face[1]), Math.sin(T0(t) * 1.3) * 0.15, unit([face[0] * 0.35, face[1] * 0.35, 0.95]), true, 19.2);
  const fc = figCam(cam, [at.q[0] - up[0] * 1.5, at.q[1] - up[1] * 1.5, at.q[2]], 0.1);
  if (still()) fig.f.draw(p, fc, { at: fig.head, hard: 1, fill: [-0.1, -1, 0.3], fillK: 0.34, rim: CYANS[2], rimFrom: [1, -0.6] });
  const hs: Pt = seen(fc, fig.head);
  if (moving()) paintStaffFire(p, hs[0], hs[1], W / 192, t, 0.85 + 0.15 * Math.sin(t * 2.4));
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
  // THE ARMOURER DRIVING, close: his wagon in the caravan on the road (as in the shot over it), seen from beside its front,
  // low; him hunched on the bench over the reins, the lantern on its crook over him lighting him and the horse's rump;
  // behind, the foothills, the peak going up into the dusk (the wagon sculpted, sculptWagon; the land at its true size)
  const land = theLand();
  const s0 = (land.index.near(300, 477)?.s ?? 0) + 17;
  const r = land.along(s0);
  const d: V3 = [r.dir[0], r.dir[1], 0];
  const n: V3 = [d[1], -d[0], 0];
  const wyaw = Math.atan2(d[1], d[0]);
  const seat: V3 = [r.q[0] + d[0] * 1.75, r.q[1] + d[1] * 1.75, r.q[2] + 1.9];
  const cpos: V3 = [seat[0] + n[0] * 2.4 + d[0] * 2.4, seat[1] + n[1] * 2.4 + d[1] * 2.4, seat[2] - 0.2];
  const lk = unit([seat[0] - d[0] * 0.3 - cpos[0], seat[1] - d[1] * 0.3 - cpos[1], 0]);
  if (still()) land.focus(cpos[0], cpos[1], 80);
  const cam: LandCam = { pos: cpos, yaw: Math.atan2(-lk[0], lk[1]), pitch: 0.12, F: W * 1.0, cx: W * 0.5, hy: H * 0.55 };
  paintValley(p, t, cam, {});
  const f = new Figure();
  const w = sculptWagon(f, [0, 0, 0], wyaw, { roll: 0.7, horse: { ph: T0(t) * 2.2 + 2.1, gallop: false }, lampSide: -1, driver: 'armourer', ribs: false });
  const wc = figCam(cam, r.q, 0.2);
  const lampAt = w.lamp ? add3(w.lamp, wc.shift) : undefined;
  if (still()) f.draw(p, wc, { at: lampAt, from: lampAt ? undefined : unit([-0.35, -0.75, 0.6]), hard: 1, fill: [0.6, 0.6, 0.3], fillK: 0.35, rim: '#f0a070', rimFrom: [1, -0.4] });
  if (moving() && w.lamp) {
    const ls = seen(wc, w.lamp);
    const fl = 0.9 + 0.1 * Math.sin(t * 5.3);
    shine(p, ls[0], ls[1], wc.scale * 3.2 * fl, LAMP[2], 2, 0.18);
    shine(p, ls[0], ls[1], wc.scale * 0.9 * fl, LAMP[0], 2, 0.6);
  }
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

/**
 * A MAGIC MERCHANT'S WARES packed into the wagon's bed (`WL` its places into the figure's, a fifth of a metre a unit; the
 * floor at `Z0`): crates stacked at the back, their planks and battens; a chest bound in brass; a rack of potions in
 * coloured glass; books in a heap; scrolls in a basket; jars; a rolled rug leaning; sacks, full and tied; and hung from the
 * bows on cords, bundles of drying herbs, a lantern, a string of beads, a little bell.
 */
function wagonWares(f: Figure, WL: (q: V3) => V3, yaw: number, Z0: number): void {
  const AXW: readonly [V3, V3, V3] = [WL([1, 0, 0]), WL([0, 1, 0]), [0, 0, 1]];
  const ax = (a = 0, tl = 0, rl = 0) => axes(yaw + a, tl, rl);
  const oak = f.stuff({ tones: OAK, crease: 0.6, grain: 0.14 });
  const pine = f.stuff({ tones: [INK, '#2a1c10', '#4a3420', '#6a4c2c', '#8c6a3e', '#b08a54'], crease: 0.6, grain: 0.14 });
  const brass = f.stuff({ tones: [INK, '#3a2a10', '#6a4c18', '#a07a28', '#d0a840', '#f0d070'], shine: 0.4, crease: 0.4 });
  const iron = f.stuff({ tones: IRON_K, shine: 0.2, crease: 0.4 });
  const burlap = f.stuff({ tones: [INK, '#16120e', '#2a2018', '#40301e', '#5a4428', '#76603a'], crease: 0.9, grain: 0.18 });
  const parch = f.stuff({ tones: [INK, '#2a2418', '#4a4030', '#7a6a4c', '#b0a078', '#e0d4a8'], crease: 0.6 });
  const leathers = [
    f.stuff({ tones: [INK, '#2a0c0c', '#4a1616', '#6e2420', '#94382c', '#b85a44'], crease: 0.5 }),
    f.stuff({ tones: [INK, '#0c1a14', '#14302a', '#1e4a3a', '#2e6a50', '#4a8a6a'], crease: 0.5 }),
    f.stuff({ tones: [INK, '#1a120a', '#3a2614', '#5a3c1e', '#7c5428', '#a07038'], crease: 0.5 }),
    f.stuff({ tones: [INK, '#160c22', '#2a1640', '#40225c', '#5a3478', '#7a4c98'], crease: 0.5 }),
  ];
  const glass = [
    f.stuff({ tones: ['#041008', '#0a2414', '#103e24', '#1a6a3e', '#34a066', '#8ae0b0'], shine: 0.7, crease: 0.2, grain: 0.02 }),
    f.stuff({ tones: ['#140802', '#2e1404', '#5a2808', '#9a4a10', '#d07a20', '#ffc070'], shine: 0.7, crease: 0.2, grain: 0.02 }),
    f.stuff({ tones: ['#0c0418', '#1c0a34', '#34125a', '#56208a', '#8240c0', '#c08af0'], shine: 0.7, crease: 0.2, grain: 0.02 }),
    f.stuff({ tones: ['#04101a', '#0a2434', '#103e5a', '#1a6a8a', '#34a0c0', '#8ae0f0'], shine: 0.7, crease: 0.2, grain: 0.02 }),
  ];
  const cork = f.stuff({ tones: [INK, '#2a1a0e', '#4a3018', '#6a4a28', '#8a6a3e'] });
  const herb = f.stuff({ tones: [INK, '#101a0c', '#1c2e14', '#2c4420', '#40602e', '#5a7a3e'], crease: 0.9, grain: 0.2 });
  const clay = f.stuff({ tones: [INK, '#2a120c', '#4a2214', '#6e3820', '#94522e', '#b87444'], crease: 0.4 });
  const rug = f.stuff({ tones: [INK, '#2a0a0e', '#4a1218', '#6e1c22', '#94302c', '#b84a3a'], crease: 0.7, paint: (q, _n, v) => {
    const b = Math.floor((q[2] + q[0] * 0.3) * 2.2);
    return b % 5 === 0 ? (v > 0.45 ? '#d0a840' : '#7a5c20') : b % 5 === 2 ? (v > 0.45 ? '#2a8a8a' : '#145050') : null;
  } });
  // CRATES at the back, stacked two high on the left and one on the right; their planks, the battens at their corners
  const crate = (x: number, y: number, z: number, sx: number, sy: number, sz: number, a: number): void => {
    const q = WL([x, y, z + sz]);
    const A = ax(a);
    f.block(pine, q, [sx, sy, sz], 0.06, A, 0.03);
    for (let j = 1; j < 3; j++) f.line([WL([x - sx * 1.01, y - sy * 1.01, z + (2 * sz * j) / 3]), WL([x + sx * 1.01, y - sy * 1.01, z + (2 * sz * j) / 3])], '#1a1008', 1);
    for (const u of [-1, 1]) {
      f.block(oak, WL([x + u * (sx - 0.12), y - sy - 0.04, z + sz]), [0.14, 0.06, sz], 0.03, A, 0.02);
      f.block(oak, WL([x - sx - 0.04, y + u * (sy - 0.12), z + sz]), [0.06, 0.14, sz], 0.03, A, 0.02);
    }
    f.mark(WL([x - sx * 0.6, y - sy - 0.08, z + sz * 1.7]), ['#8a8a9a'], 1);
  };
  crate(-6.4, -1.4, Z0, 1.3, 1.3, 1.1, 0.05);
  crate(-6.3, -1.5, Z0 + 2.2, 1.1, 1.1, 0.9, -0.12);
  crate(-6.6, 1.5, Z0, 1.2, 1.15, 1.25, -0.08);
  crate(-4.0, -2.0, Z0, 0.9, 0.75, 0.8, 0.2);
  // A CHEST bound in brass, its lid domed, on the left by us; scrolls on it
  {
    const x = -1.7;
    const y = -2.05;
    const A = AXW;
    f.block(oak, WL([x, y, Z0 + 0.8]), [1.25, 0.75, 0.8], 0.08, A, 0.03);
    f.rod(oak, WL([x - 1.25, y, Z0 + 1.6]), WL([x + 1.25, y, Z0 + 1.6]), 0.75, 0.75, 0.04);
    // (its bands of old brass, thin, over the lid and down the sides)
    const band = f.stuff({ tones: [INK, '#22180a', '#3e2e12', '#5e461c', '#80622a', '#a07e38'], shine: 0.25, crease: 0.4 });
    for (const u of [-0.85, 0.85]) {
      f.block(band, WL([x + u, y, Z0 + 0.8]), [0.07, 0.77, 0.81], 0.02, A, 0.01);
      f.rod(band, WL([x + u, y - 0.07, Z0 + 1.6]), WL([x + u, y + 0.07, Z0 + 1.6]), 0.77, 0.77, 0.01);
    }
    f.egg(brass, WL([x, y - 0.8, Z0 + 1.35]), [0.22, 0.08, 0.26], ax(), 0.02);
    for (const [dx, dy, a] of [[-0.6, -0.1, 0.3], [0.2, 0.25, -0.2], [0.7, -0.15, 0.6]] as const) {
      const c0 = WL([x + dx, y + dy, Z0 + 2.48]);
      const d = WL([Math.cos(a) * 0.75, Math.sin(a) * 0.75, 0]);
      f.rod(parch, sub3(c0, scale3(d, 0.7)), add3(c0, scale3(d, 0.7)), 0.15, 0.15, 0.02);
      f.line([add3(c0, WL([0, -0.21, 0.02])), add3(c0, WL([0, 0.21, 0.02]))], '#6e1c22', 1);
    }
  }
  // A RACK OF POTIONS on the right by us: bottles of coloured glass, corked, in a crate's open top
  {
    const x = 3.3;
    const y = 2.1;
    crate(x, y, Z0, 1.15, 0.7, 0.55, 0);
    for (let j = 0; j < 7; j++) {
      const bx = x - 0.85 + (j % 4) * 0.55 + (j > 3 ? 0.27 : 0);
      const by = y + (j > 3 ? 0.3 : -0.25);
      const hgt = 0.9 + ((j * 37) % 5) * 0.12;
      const g = glass[j % glass.length];
      const base = WL([bx, by, Z0 + 1.0]);
      f.rod(g, base, add3(base, [0, 0, hgt * 0.55]), 0.24, 0.22, 0.1);
      f.egg(g, add3(base, [0, 0, hgt * 0.62]), [0.24, 0.24, 0.18], ax(), 0.15);
      f.rod(g, add3(base, [0, 0, hgt * 0.7]), add3(base, [0, 0, hgt]), 0.09, 0.08, 0.05);
      f.rod(cork, add3(base, [0, 0, hgt]), add3(base, [0, 0, hgt + 0.16]), 0.1, 0.09, 0.02);
    }
  }
  // BOOKS in a heap beside him, on the right; a jar and a candle on them
  {
    let z = Z0;
    for (let j = 0; j < 5; j++) {
      const th = 0.22 + ((j * 13) % 4) * 0.05;
      f.block(leathers[j % leathers.length], WL([1.9 + ((j * 7) % 3) * 0.08, 2.0, z + th]), [0.62 - (j % 2) * 0.08, 0.45, th], 0.04, ax(0.2 * ((j % 3) - 1)), 0.02);
      z += th * 2;
    }
    const jar = WL([1.9, 2.0, z + 0.55]);
    f.egg(clay, jar, [0.42, 0.42, 0.5], ax(), 0.2);
    f.rod(clay, add3(jar, [0, 0, 0.35]), add3(jar, [0, 0, 0.62]), 0.24, 0.26, 0.08);
    f.egg(cork, add3(jar, [0, 0, 0.66]), [0.27, 0.27, 0.08], ax(), 0.05);
  }
  // A BASKET OF SCROLLS on the left beyond the chest
  {
    const bq = WL([3.4, -2.25, Z0 + 0.55]);
    f.rod(burlap, add3(bq, [0, 0, -0.55]), add3(bq, [0, 0, 0.5]), 0.62, 0.72, 0.2);
    for (let j = 0; j < 6; j++) {
      const a = j * 1.1;
      const tip = add3(bq, [Math.cos(a) * 0.3, Math.sin(a) * 0.3, 0.6 + (j % 3) * 0.3]);
      f.rod(parch, add3(bq, [Math.cos(a) * 0.15, Math.sin(a) * 0.15, -0.2]), tip, 0.13, 0.13, 0.02);
    }
  }
  // A RUG rolled and leaning against the crates; SACKS, full and tied
  f.rod(rug, WL([-4.6, 1.9, Z0 + 0.3]), WL([-5.4, 2.2, Z0 + 3.4]), 0.42, 0.42, 0.05);
  for (const [x, y, sz, tilt] of [[-2.6, 2.15, 0.85, 0.15], [-3.6, -0.6, 0.7, -0.2], [-4.4, -2.3, 0.75, 0.25]] as const) {
    const lo = WL([x, y, Z0 + 0.5 * sz]);
    f.egg(burlap, lo, [1.15 * sz, 1.0 * sz, 0.6 * sz], ax(tilt), 0.5);
    f.egg(burlap, WL([x - tilt * 0.3, y, Z0 + 1.2 * sz]), [0.95 * sz, 0.85 * sz, 0.85 * sz], ax(tilt, tilt * 0.5, 0), 0.6);
    f.egg(burlap, WL([x - tilt * 0.6, y, Z0 + 1.9 * sz]), [0.5 * sz, 0.46 * sz, 0.45 * sz], ax(tilt), 0.45);
    f.rod(burlap, WL([x - tilt * 0.7, y, Z0 + 2.25 * sz]), WL([x - tilt * 1.2 + 0.15, y + 0.1, Z0 + 2.75 * sz]), 0.28 * sz, 0.1 * sz, 0.15);
    f.rod(iron, WL([x - tilt * 0.65, y - 0.02, Z0 + 2.2 * sz]), WL([x - tilt * 0.65, y + 0.02, Z0 + 2.24 * sz]), 0.33 * sz, 0.33 * sz, 0.01);
  }
  // HUNG FROM THE BOWS on cords: bundles of herbs drying, a lantern, a string of beads, a little bell
  const bowTop = (x: number, y: number): V3 => WL([x, y, 11.6 - y * y * 0.12]);
  const hang = (x: number, y: number, len: number): [V3, V3] => {
    const top = bowTop(x, y);
    const end = add3(top, [0, 0, -len]);
    f.line([top, end], '#2a2430', 1);
    return [top, end];
  };
  for (const [x, y, len] of [[0, 1.9, 0.9], [0, -1.9, 1.1], [-3.45, 1.0, 1.4], [-3.45, -1.5, 1.0], [-3.45, 1.9, 0.8]] as const) {
    const [, end] = hang(x, y, len);
    for (let j = 0; j < 5; j++) {
      const a = j * 1.3 + x;
      f.rod(herb, end, add3(end, [Math.cos(a) * 0.14, Math.sin(a) * 0.14, -0.7 - (j % 2) * 0.2]), 0.05, 0.1, 0.05);
    }
    f.rod(rug, add3(end, [0, 0, 0.05]), add3(end, [0, 0, -0.12]), 0.14, 0.14, 0.02);
  }
  {
    const [, end] = hang(-3.45, -0.3, 1.3);
    f.block(iron, add3(end, [0, 0, -0.45]), [0.28, 0.28, 0.4], 0.06, ax(), 0.03);
    f.egg(iron, add3(end, [0, 0, -0.02]), [0.32, 0.32, 0.12], ax(), 0.04);
    f.rod(glass[1], add3(end, [0, 0, -0.75]), add3(end, [0, 0, -0.15]), 0.2, 0.2, 0.02);
    const [t2, e2] = hang(-3.45, 0.1, 1.0);
    void t2;
    f.egg(brass, add3(e2, [0, 0, -0.25]), [0.22, 0.22, 0.28], ax(), 0.08);
    for (let j = 0; j < 9; j++) f.egg(glass[(j * 3) % 4], WL([-0.2 - j * 0.38, 2.2, 10.6 - Math.sin((j / 8) * Math.PI) * 0.8]), [0.1, 0.1, 0.1], ax(), 0.02);
  }
}

export function paintMystic(p: Px, t: number): void {
  const W = p.w;
  const H = p.h;
  const k = W / 192;
  const bob = Math.sin(t * 1.9) * 0.12;
  const bob0 = Math.sin(T0(t) * 1.9) * 0.12;
  // THE MYSTIC IN THE WAGON, close: inside the lead wagon of the caravan, rolling up the road; from the front of its bed,
  // low, looking back down it: the canvas over its bows, dark; him sitting cross-legged on the boards among his sacks, a
  // charm or two hung from a bow over him; the crystal turning over his open palm, its cold light on him and the canvas
  // round him; behind him, through the wagon's open back, the road falling away and the dusk (the wagon sculpted, hollow,
  // a fifth of a metre a unit; him at half that, as on page 2; the land at its true size)
  const land = theLand();
  const s0 = (land.index.near(300, 477)?.s ?? 0) + 33;
  const r = land.along(s0);
  const wyaw = Math.atan2(r.dir[1], r.dir[0]);
  const c = Math.cos(wyaw);
  const sn = Math.sin(wyaw);
  /** A place in the wagon (its own measure: x to its front, y across, z up) in the figure's. */
  const WL = (L: V3): V3 => [L[0] * c - L[1] * sn, L[0] * sn + L[1] * c, L[2]];
  const Z0 = 4.4;
  const f = new Figure();
  sculptWagon(f, [0, 0, 0], wyaw, { roll: 0.5, backOpen: true, hollow: true });
  // HIM, sitting cross-legged on the boards, turned a little toward us; his right palm up before him under the crystal,
  // its fingers out before him and his thumb to the outside
  const myaw = Math.atan2(c, -sn) + 0.35;
  const { r: palmL, at: mAt } = Cast.place(f, WL([0.6, -0.3, Z0]), myaw, () => {
    const b = Cast.mystic(f, {
      pelvis: [0, 0, 1.9],
      lean: 0.06,
      nod: 0.12,
      turn: -0.2,
      // (his left beside it under the crystal too, open, palm up, its fingers toward the other's, the wrist straight from the
      // forearm: both hands holding it up between them)
      hands: [[-3.2, -3.6, 6.4], [-1.3, -4.1, 6.0]],
      elbows: [[-1, 0.2, -1], [1, 0.2, -1]],
      palms: [[0, 0, 1], [0, 0, 1]],
      fingers: [[-0.3, -1, 0.15], [-0.75, -0.65, 0.05]],
      // (cross-legged: each foot tucked in under the other knee, the knees out wide to the sides and low)
      feet: [[0.35, -3.5, 0.45], [-0.35, -3.1, 0.62]],
      knees: [[-1, -0.6, 0.15], [1, -0.6, 0.15]],
    }, ['open', 'open'], { seated: true });
    // (between his two palms)
    const palm = (j: 0 | 1): V3 => add3(add3(b.wrists[j], scale3(b.handFrames[j].z, 0.62)), scale3(b.handFrames[j].y, -0.15));
    return scale3(add3(palm(0), palm(1)), 0.5);
  }, 0.5);
  const C3 = mAt(add3(palmL, [0, 0, 2.0 + bob0]));
  const C3t = mAt(add3(palmL, [0, 0, 2.0 + bob]));
  wagonWares(f, WL, wyaw, Z0);
  // THE CAMERA: in the front of the bed, low, behind the driver's bench, looking back down the wagon at him and out of its
  // open back; the land, and its sky, seen through that
  const eyeL: V3 = [6.6, 0.5, 10.1];
  const toL: V3 = [-6, -0.7, 7.6];
  const eye = WL(eyeL);
  const tw = WL([toL[0] - eyeL[0], toL[1] - eyeL[1], 0]);
  const pos: V3 = [r.q[0] + eye[0] * 0.2, r.q[1] + eye[1] * 0.2, r.q[2] + eye[2] * 0.2];
  const dh = Math.hypot(tw[0], tw[1]);
  const cam: LandCam = { pos, yaw: Math.atan2(-tw[0] / dh, tw[1] / dh), pitch: Math.atan2(toL[2] - eyeL[2], dh), F: W * 0.5, cx: W * 0.5, hy: H * 0.46 };
  if (still()) land.focus(pos[0], pos[1], 80);
  paintValley(p, t, cam, {});
  const fc = figCam(cam, r.q, 0.2);
  if (still()) f.draw(p, fc, { at: add3(C3, fc.shift), reach: 4.5, hard: 1, fill: [0.6, -0.4, 0.5], fillK: 0.12, rim: CYANS[2], rimFrom: [0, -1] });
  // THE CRYSTAL, turning over his palm, and its light
  if (moving()) {
    const ct = seen(fc, C3t);
    shine(p, ct[0], ct[1], (40 + Math.sin(t * 2.3) * 4) * k, CYANS[2], 2, 0.16);
    paintCrystal(p, ct[0], ct[1], 5.5 * k, t * 1.2);
  }
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
  const { f, palm } = strangerOnWagon();
  const scam = { look: unit([0.42, 1, -0.14]), up: [0, 0, 1] as V3, scale: 15.5 * k, ox: 0, oy: 0, persp: 46 };
  const at0 = seen(scam, [-8.25, 0, 7.2]);
  scam.ox = P(76, 0)[0] - at0[0];
  scam.oy = P(0, 104)[1] - at0[1];
  if (still()) {
  // (the land behind: the road falling away down the face below the wagon's back, the valley far under it)
  valleyBehind(p, t, ambushAt() + 900, Math.PI + 0.25, 3.2, 0.5, 0.42, -0.12);
  // THE WAGON'S BACK AND HIM ON IT, SCULPTED, seen from behind it and to his side
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
  }
  if (!moving()) return;
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
  const t0 = T0(t);
  const bobA = Math.abs(Math.sin(t0 * 2.4)) * 0.08;
  const bobB = Math.abs(Math.sin(t0 * 2.4 + 1.3)) * 0.1;
  const flap = Math.sin(t0 * 3.1) * 0.25;
  // THE CAMERA: low, before them on the road, looking a little up at them; a tenth of a metre to a unit, up is z
  const cam = { look: unit([0.04, 1, 0.06]), up: [0, 0, 1] as V3, scale: 8.6 * k, ox: P(44, 0)[0], oy: P(0, 212)[1], persp: 50 };
  // THE TWO OF THEM (art/cast.ts), walking up the road toward us: the wordsmith turned to the knight beside him, his left
  // palm up with a rune over it; the knight, his sword up on his shoulder, glancing to the light
  const f = new Figure();
  const ph = t0 * 2.4;
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
  if (still()) {
  // (the land behind them: the road they have come up, the foothills and the valley under the evening; we stand on the
  // road before them, looking back down it at them)
  valleyBehind(p, t, footOfFace() - 120, Math.PI, 1.3, 0.55, 0.6, 0.02);
  f.draw(p, cam, { cel: COMIC, at: R3, hard: 1, fill: [0.1, -1, 0.15], fillK: 0.3, rim: '#f0a070', rimFrom: [-1, -0.3] });
  }
  if (!moving()) return;
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
  const gust = Math.sin(T0(t) * 1.3) * 0.15;
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
  if (still()) {
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
  }
  // THE STAFF'S HEAD, burning
  if (moving()) paintStaffFire(p, hs[0], hs[1], k, t, flick);
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
  const fig = oldSmithFigure(0.95, Math.sin(T0(t) * 1.3) * 0.15, unit([0.5, 0.3, 0.82]), false, 18.6);
  const mid = lerp3(fig.eyes[0], fig.eyes[1], 0.5);
  const F = unit3(sub3(mid, fig.hc));
  const from = add3(add3(mid, scale3(F, 30)), [-3, 0, -2.5]);
  const cam = { look: unit3(sub3(mid, from)), up: [0, 0, 1] as V3, scale: 60 * k, ox: 0, oy: 0 };
  const m0 = seen(cam, mid);
  cam.ox = W * 0.5 - m0[0];
  cam.oy = H * 0.47 - m0[1];
  // the night behind him, the stars coming out
  if (still()) {
  const sky = layerOf(p);
  sky.rect(0, 0, W, H, DUSK[1]);
  bands(sky, DUSK.slice(0, 5), (x, y) => 0.1 + (1 - y / H) * 0.15 + glow(x, y, W * 1.1, H * 0.2, W) * 0.5);
  sky.each((x, y) => (hash(x, y, 961) > 0.993 ? '#c8c4f0' : undefined));
  over(p, sky, null);
  fig.f.draw(p, cam, { at: fig.head, hard: 1, fill: [-0.5, -0.8, -0.1], fillK: 0.45, rim: CYANS[2], rimFrom: [1, -0.8] });
  }
  if (!moving()) return;
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
  const blink = 0.5 + 0.5 * Math.sin(t * 3.7);
  // A CULTIST crouched on the bluff by the road, among its rocks, watching them: seen from just behind him, over his
  // shoulder, his cowl's point against the dusk, his dagger up by his shoulder with a glint running along its blade; below
  // him, a long way off down the bluff, the road, the wagon stopped on it and the old wordsmith's light by it; the peak
  // beyond (art/cast.ts, sculpted at his true size, on the land at its own)
  const land = theLand();
  const s0 = footOfFace();
  const at = land.along(s0);
  // (where he crouches: on the bluff's crest, on the side of it toward them)
  let best: V3 = [BLUFF[0], BLUFF[1], 0];
  let bh = -1e9;
  for (let j = 0; j < 60; j++) {
    const x = BLUFF[0] + (hash(j, 1, 1701) - 0.5) * 120;
    const y = BLUFF[1] + (hash(j, 2, 1701) - 0.5) * 120;
    const h = land.height(x, y) - Math.hypot(x - at.q[0], y - at.q[1]) * 0.08;
    if (h > bh) {
      bh = h;
      best = [x, y, 0];
    }
  }
  const me: V3 = [best[0], best[1], land.exact(best[0], best[1])];
  const to = unit([at.q[0] - me[0], at.q[1] - me[1], 0]);
  const sideV: V3 = [to[1], -to[0], 0];
  const cx = me[0] - to[0] * 2.3 + sideV[0] * 1.2;
  const cy = me[1] - to[1] * 2.3 + sideV[1] * 1.2;
  if (still()) land.focus(me[0], me[1], 100);
  const lookV = unit([at.q[0] - cx, at.q[1] - cy, 0]);
  const cam: LandCam = { pos: [cx, cy, Math.max(land.exact(cx, cy), me[2]) + 1.25], yaw: Math.atan2(-lookV[0], lookV[1]) + 0.3, pitch: -0.1, F: W * 1.15, cx: W * 0.5, hy: H * 0.4 };
  paintValley(p, t, cam, { wagons: [{ s: s0 - 16, seed: 0, driver: true }], smithAt: s0 });
  const f = new Figure();
  const r3 = Cast.place(f, [0, 0, 0], Math.atan2(to[0], -to[1]) + 0.2, () => {
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
  const fc = figCam(cam, me, 0.1);
  if (still()) f.draw(p, fc, { from: unit([0.53, 1, 0.4]), hard: 1, fill: [-0.6, -0.6, 0.4], fillK: 0.3, rim: '#f0a070', rimFrom: [0.6, -1] });
  // (the glint: down the blade of his dagger, a spark of the last light at its point)
  if (!moving()) return;
  const tip = seen(fc, r3.at(r3.r ?? [0, 0, 0]));
  const k = W / 153;
  const g = Math.round((2 + blink * 4) * k);
  for (let d = -g; d <= g; d++) {
    const c = Math.abs(d) < 2 ? '#ffffff' : '#e8d8ff';
    p.set(Math.round(tip[0]) + d, Math.round(tip[1]), c);
    p.set(Math.round(tip[0]), Math.round(tip[1]) + d, c);
  }
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
function seen(cam: { look: V3; up: V3; scale: number; ox: number; oy: number; persp?: number; shift?: V3 }, q0: V3): Pt {
  const q: V3 = cam.shift ? [q0[0] + cam.shift[0], q0[1] + cam.shift[1], q0[2] + cam.shift[2]] : q0;
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
  /** Struck: flung back, his arms thrown wide, his dagger flying from his hand, his feet going from under him. */
  reel: {
    hip: [0, 0.6, 5.0], chest: [0, 1.5, 7.3], head: [0, 2.4, 8.8],
    sh: [[-1.15, 1.4, 7.8], [1.15, 1.4, 7.8]],
    el: [[-2.3, 1.3, 8.6], [2.2, 0.8, 7.1]],
    ha: [[-3.1, 0.6, 9.9], [3.0, -0.2, 6.3]],
    kn: [[-0.5, -0.9, 2.9], [0.5, 0.7, 2.7]],
    ft: [[-0.5, -1.2, 0.5], [0.5, 1.5, 0.3]],
    hem: [0, 1.0, 3.0],
    dagger: { hand: 1, to: [4.0, -0.6, 5.2] },
  } as CultPose,
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
/** A torch's flame at (x, y), nine `s` high: a few ragged tongues licking up off the torch's head, white at their roots,
 * the tallest torn at its tip, flickering; a spark or two going up off it. */
function paintFlame(p: Px, x: number, y: number, s: number, t: number, seed: number): void {
  const h = 9 * s;
  if (h < 5) {
    // (far off, a point or two of flame)
    p.set(Math.round(x), Math.round(y), '#ffc040').set(Math.round(x), Math.round(y) - 1, h > 3 ? '#ff8a2a' : '#ffc040');
    return;
  }
  const base: Pt[] = [[x - 1.1 * s, y + 0.3 * s], [x + 0.2 * s, y + 0.6 * s], [x + 1.2 * s, y + 0.2 * s], [x - 0.3 * s, y - 0.2 * s]];
  paintFlames(p, base, h * 0.8, Math.sin(t * 3.1 + seed) * 0.15 - 0.05, t, seed + 700);
  for (let j = 0; j < 3; j++) {
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
  if (still()) f.draw(p, cam, { from: unit([1, -0.4, 0.4]), hard: 1, fill: [-0.4, -1, 0.3], fillK: 0.3, rim: '#ffb060', rimFrom: [1, 0] });
  return r.torch ? seen(cam, at(r.torch)) : null;
}

/** Where on the road the ambush falls: on the foothills, under the bluff (metres along it). */
function ambushAt(): number {
  return theLand().index.near(482, 575)?.s ?? 700;
}

/** A place `q` (a figure's own measures) turned `a` about the upright. */
const turnZ = (q: V3, a: number): V3 => [q[0] * Math.cos(a) - q[1] * Math.sin(a), q[0] * Math.sin(a) + q[1] * Math.cos(a), q[2]];

export function paintAmbush(p: Px, t: number): void {
  const W = p.w;
  const H = p.h;
  const k = W / 392;
  const flick = 0.85 + 0.15 * Math.sin(t * 9.1);
  const land = theLand();
  // WHERE: on the foothills, under the bluff by the road; the last wagon stopped on the road, burning where the bomb struck
  // its canvas; the cult pouring down the bluff's slope at it, their torches up; we are on the road behind the wagon, low,
  // looking along the road toward the peak, the bluff on the left; the peak far off over it all, the prison at its top
  const at = land.along(ambushAt());
  const d = at.dir;
  // ("up": up the bluff, off the road's left)
  const up = unit([-d[1], d[0], 0]);
  const cx = at.q[0] - d[0] * 11 + up[0] * -2.6;
  const cy = at.q[1] - d[1] * 11 + up[1] * -2.6;
  if (still()) land.focus(cx, cy, 150);
  const look = unit([d[0] * 0.85 + up[0] * 0.4, d[1] * 0.85 + up[1] * 0.4, 0]);
  const cam: LandCam = { pos: [cx, cy, land.exact(cx, cy) + 1.6], yaw: Math.atan2(-look[0], look[1]), pitch: 0.16, F: W * 0.48, cx: W * 0.5, hy: H * 0.62 };
  const fwd: V3 = [-Math.sin(cam.yaw), Math.cos(cam.yaw), 0];
  /** A place on the ground `al` metres along the road from the wagon and `o` up the slope from it, `lift` over it. */
  const ground = (al: number, o: number, lift = 0): V3 => {
    const x = at.q[0] + d[0] * al + up[0] * o;
    const y = at.q[1] + d[1] * al + up[1] * o;
    return [x, y, land.exact(x, y) + lift];
  };
  const rgt: V3 = [Math.cos(cam.yaw), Math.sin(cam.yaw), 0];
  /** A figure's turn to face the way `dir` (level), as the cast figures are turned, in the frame the little ones are drawn in. */
  const faceYaw = (dir: V3): number => {
    const ax = dir[0] * rgt[0] + dir[1] * rgt[1];
    const ay = dir[0] * fwd[0] + dir[1] * fwd[1];
    return Math.atan2(ax, -ay);
  };
  // (the last wagon, sculpted (sculptWagon), a fifth of a metre a unit; where the bomb struck it, on its canvas toward its
  // back)
  const wyaw = Math.atan2(d[1], d[0]);
  const STRIKE: V3 = [-3.5, -3.2, 9.6];
  const wpos: V3 = at.q;
  const wcam = figCam(cam, wpos, 0.2);
  const boom = seen(wcam, turnZ(STRIKE, wyaw));
  const fireAt: V3 = [wpos[0], wpos[1], wpos[2] + 2.2];
  paintValley(p, t, cam, { lights: [{ at: fireAt, color: '#ff8a2a', reach: 30, k: 0.75 }] });
  // THE CULT down the slope above the road, a mob, not a file: scattered, the nearer the bigger, some bunched, some strung
  // out behind, all running down at the wagon; torches held up and out (sculpted, miniCultist, at their true size)
  const mob: [number, number, number, number, number][] = [];
  for (let j = 0; j < 40; j++) {
    const along = -16 + hash(j, 1, 993) * 46;
    const out = 6 + Math.pow(hash(j, 2, 993), 0.9) * 42;
    const x = at.q[0] + d[0] * along + up[0] * out;
    const y = at.q[1] + d[1] * along + up[1] * out;
    const q: V3 = [x, y, land.exact(x, y)];
    const [sx, sy, fw] = seenAt(cam, q);
    if (fw < 4 || sx < -20 || sx > W + 20) continue;
    mob.push([sx, sy, fw, j, out]);
  }
  mob.sort((a, b) => b[2] - a[2]);
  const flames: [number, number, number][] = [];
  const down = faceYaw([-up[0] + d[0] * 0.3, -up[1] + d[1] * 0.3, 0]);
  for (const [sx, sy, fw, j] of mob) {
    const sc = (cam.F * 0.1) / fw;
    const tp = miniCultist(p, sx, sy, sc, T0(t) * 8 + j * 1.7, j % 3 !== 1, down + (hash(j, 3, 993) - 0.5) * 0.9);
    // (a torch's flame half a metre high: its painter's flame is nine of its measures high)
    if (tp) flames.push([tp[0], tp[1], sc * 0.55]);
  }
  front(p, 'ambush.mob');
  if (moving()) {
    behind(p, 'ambush.mob', (q) => {
      flames.forEach(([x, y, sz], j) => paintFlame(q, x, y, sz, t, j));
      // THE SMOKE rolling up off the last wagon, leaning back up the hill, lit from under by the fire
      paintSmoke(q, boom[0] + 6 * k, boom[1] - 14 * k, 24 * k, 110 * k, -1.3, t, 1003, 1);
    });
  }
  // THE LAST WAGON, its canvas burnt through and afire round where the bomb struck it
  const wf = new Figure();
  sculptWagon(wf, [0, 0, 0], wyaw, { roll: 0.3, burn: 0.75, burnAt: STRIKE, lampSide: -1 });
  if (still()) wf.draw(p, wcam, { from: unit([-0.2, -0.5, 0.85]), hard: 1, fill: [-0.6, -1, 0.1], fillK: 0.3, rim: '#ffb060', rimFrom: [0.3, -1] });
  front(p, 'ambush.wagon');
  if (moving()) behind(p, 'ambush.wagon', (p) => {
  // (the flames off its canvas, licking up and back off the burning, and the burst where it struck)
  const along: Pt[] = [];
  for (let j = 0; j < 9; j++) {
    const a2 = 0.35 + (j / 8) * 1.2;
    along.push(seen(wcam, turnZ([STRIKE[0] - 3 + j * 0.9, -Math.cos(a2) * 3.3, 5.4 + Math.sin(a2) * 6.6], wyaw)));
  }
  const sz = wcam.scale / 11.5;
  paintFlames(p, along, 44 * sz, -0.3, t, 1027);
  paintFireball(p, boom[0], boom[1], 26 * sz * (0.96 + 0.04 * flick), t, 1029);
  for (let j = 0; j < 26; j++) {
    const a = hash(j, 6, 1001) * Math.PI * 2;
    const r = (34 + hash(j, 7, 1001) * 50 + ((t * 40 + j * 13) % 30)) * sz;
    const x = boom[0] + Math.cos(a) * r;
    const y = boom[1] + Math.sin(a) * r * 0.8;
    p.set(Math.round(x), Math.round(y), j % 3 ? '#ffc040' : '#fff3c0').set(Math.round(x + Math.cos(a)), Math.round(y + Math.sin(a)), '#ff8a2a');
  }
  });
  // THE NEAR ONES, sculpted, at their true size: two running down with torches and daggers, and the first, leaping down
  // onto the road at us, his dagger up
  const draws: { f: Figure; at: V3; torch: V3 | null }[] = [];
  const run = AMBUSH_POSES.run;
  const runYaw = Math.atan2(-up[0] + d[0] * 0.2, up[1] - d[1] * 0.2);
  {
    const f = new Figure();
    const pos = ground(-4.5, 5.5);
    const r = sculptCultist(f, [0, 0, 0], runYaw, run(0.5, T0(t) * 8, 1));
    draws.push({ f, at: pos, torch: r.torch });
  }
  {
    const f = new Figure();
    const pos = ground(-0.5, 8.5);
    const r = sculptCultist(f, [0, 0, 0], runYaw + 0.3, run(0.7, T0(t) * 8 + 2, 0));
    draws.push({ f, at: pos, torch: r.torch });
  }
  {
    // the nearest: leaping down off the bank onto the road at us, his dagger high over his head, his other hand clawing out
    const f = new Figure();
    const faceYawLeap = Math.atan2(-up[0] - d[0] * 0.6, up[1] + d[1] * 0.6);
    Cast.place(f, [0, 0, 0], faceYawLeap, () => {
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
    const pos = ground(-4.2, 3.4, 1.1);
    draws.push({ f, at: pos, torch: null });
  }
  for (const dw of draws) {
    const fc = figCam(cam, dw.at, 0.175);
    // (lit by the fire, from where it is, brought into the figure's own measures; and by his torch)
    const toFire = scale3(sub3(fireAt, dw.at), 1 / 0.175);
    if (still()) dw.f.draw(p, fc, { cel: COMIC, at: dw.torch ?? toFire, hard: 1, fill: unit(toFire), fillK: 0.4, rim: '#ffb060', rimFrom: [1, 0.3] });
    if (dw.torch && moving()) {
      const ts = seen(fc, dw.torch);
      shine(p, ts[0], ts[1] - fc.scale, fc.scale * 4 * flick, '#ff8a2a', 2, 0.2);
      paintFlame(p, ts[0], ts[1], fc.scale * 0.3, t, Math.round(fc.scale));
    }
  }
  // YOUR HERO AND YOUR WORDSMITH on the road between us and the wagon, turned to meet them: the hero's sword wound up over
  // his head; the wordsmith's palm up, a rune alight over it, the friend's cyan against all their fire
  {
    const kAt = ground(-5.6, 0.9);
    const kyaw = Math.atan2(up[0] - d[0] * 0.15, -(up[1] - d[1] * 0.15));
    const kcam = figCam(cam, kAt, 0.175);
    const cy0 = Math.cos(kyaw);
    const sy0 = Math.sin(kyaw);
    const lk = kcam.look;
    const lookL: V3 = [lk[0] * cy0 + lk[1] * sy0, -lk[0] * sy0 + lk[1] * cy0, lk[2]];
    if (still()) runHero(p, kcam, kyaw, lookL, Math.sin(T0(t) * 3.1), false);
    const sAt = ground(-3.6, -1.6);
    const syaw = Math.atan2(up[0] + d[0] * 0.3, -(up[1] + d[1] * 0.3));
    const sf = wordsmithFigure('palm', undefined, [0, 0, 0], syaw);
    const scam = figCam(cam, sAt, 0.175);
    if (still()) sf.draw(p, scam, { cel: COMIC, at: [9, -6, 9], hard: 1, fill: [-0.4, -1, 0.4], fillK: 0.4, rim: '#ffb060', rimFrom: [1, -0.3] });
    if (moving()) {
      const palm = seen(scam, turnZ([1.2, -2.3, 8.55], syaw));
      const pulse = 0.85 + 0.15 * Math.sin(t * 3.7);
      shine(p, palm[0], palm[1], scam.scale * 2.4 * pulse, CYANS[2], 2, 0.25);
      shine(p, palm[0], palm[1], scam.scale * 0.8 * pulse, CYANS[0], 2, 0.6);
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

/** The canvas of the wagons' covers, darkest first. */
const CANVAS_T: Tones = [INK, '#2a221c', '#4a3e30', '#6e5e48', '#9a8662', '#c4ae84', '#e4d0a4'];

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



/** THE RUN'S HERO, his stroke wound up or struck (paintRun): drawn on `q` through `kcam`. */
export function runHero(q: Px, kcam: { look: V3; up: V3; scale: number; ox: number; oy: number }, yaw: number, lookL: V3, flap: number, struck: boolean): void {
  const wr = (g: V3, s: number): V3 => sub3(g, scale3(unit(sub3(g, [s * 2.2, 0, 14.2])), 0.62));
  const gM: V3 = [1.0, -4.6, 11.4];
  const dirL = unit([0.55, -1, -0.05]);
  const f = new Figure();
  // (wound up: both hands high over his head, his arms up, the blade cocked back behind him; his body arched back and
  // coiled round to his right, his weight back on his rear foot, his head still on them)
  const gW: V3 = [-0.4, 1.9, 19.4];
  const dirW = unit([-0.15, 0.9, 0.42]);
  const g = struck ? gM : gW;
  const dir = struck ? dirL : dirW;
  const tip = add3(g, scale3(dir, 10.8));
  const gO = sub3(g, scale3(dir, 1.15));
  Cast.place(f, [0, 0, 0], yaw, () => {
    Cast.knight(f, struck ? {
      pelvis: [0, -0.6, 8.9],
      lean: 0.3,
      twist: 0.35,
      turn: -0.2,
      nod: 0.1,
      hands: [wr(gM, -1), wr(gO, 1)],
      elbows: [[-0.3, 0.2, -1], [0.3, 0.2, -1]],
      feet: [[-1.2, 3.4, 1.6], [0.9, -3.8, 0.75]],
      knees: [[0, -1, -0.3], [0.2, -1, 0.1]],
    } : {
      pelvis: [0, 0.7, 8.7],
      lean: -0.15,
      twist: -0.35,
      turn: 0.3,
      nod: -0.05,
      hands: [wr(gW, -1), wr(gO, 1)],
      elbows: [[-0.7, 0.2, 0.5], [0.7, 0.2, 0.3]],
      feet: [[-1.2, 3.4, 0.75], [0.9, -3.8, 0.75]],
      knees: [[-0.2, -1, -0.1], [0.2, -1, 0.2]],
    }, { hand: 0, tip, two: true, face: scale3(lookL, -1) }, flap);
  }, OLD);
  f.draw(q, kcam, { cel: COMIC, at: [9, -3, 9], hard: 1, fill: [0.4, -1, 0.3], fillK: 0.32, rim: '#ffb060', rimFrom: [1, -0.3] });
}

export function paintRun(p: Px, t: number): void {
  const W = p.w;
  const H = p.h;
  const flick = 0.85 + 0.15 * Math.sin(t * 9.1);
  const land = theLand();
  // WHERE: the last of the road, the terrace along the crag's top under the prison's wall, to its gate; the wall and its
  // towers going up over it, the drop falling away beside it to the peak far below. The lead wagon turning in at the gate;
  // the last wagon, burning, at the gallop along the terrace after it; your hero at the rear, turned on the cult at their
  // heels, his stroke going through the first of them. We are on the terrace below him, low, the first of them between us,
  // looking up past him to the gate; the camera going on up from the stroke to the wall and the gatehouse over them
  const pp = prisonPlace();
  const sG = land.index.near(pp.gate[0], pp.gate[1])?.s ?? land.road[land.road.length - 1].s;
  const onLedge = (s: number): { q: V3; d: V3; out: V3 } => {
    const r = land.along(s);
    const out = unit([r.q[0] - PEAK[0], r.q[1] - PEAK[1], 0]);
    return { q: r.q, d: [r.dir[0], r.dir[1], 0], out };
  };
  const H0 = onLedge(sG - 24);
  const heroAt: V3 = H0.q;
  const dH = H0.d;
  // (we hang in the air off the terrace's edge, beside them, a little below the road: the cliff under us, the wall over
  // them, the gate up the road)
  const cpos: V3 = [heroAt[0] + H0.out[0] * 6.6 - dH[0] * 2.6, heroAt[1] + H0.out[1] * 6.6 - dH[1] * 2.6, heroAt[2] + 0.9];
  // (him turned down the road on them, and a little toward us)
  const fH = unit([-dH[0] * Math.cos(0.55) + H0.out[0] * Math.sin(0.55), -dH[1] * Math.cos(0.55) + H0.out[1] * Math.sin(0.55), 0]);
  const yaw = Math.atan2(fH[0], -fH[1]);
  const cyw = Math.cos(yaw);
  const syw = Math.sin(yaw);
  const local = (x: number, y: number): V3 => [heroAt[0] + x * cyw - y * syw, heroAt[1] + x * syw + y * cyw, heroAt[2]];
  // (where his blade's end comes, in his own measure (runHero's), and in metres: the first of them is there, struck)
  const M = OLD * 0.175;
  const foeAt = local(6.2 * M + 0.05, -14.06 * M - 0.25);
  if (still()) land.focus(heroAt[0], heroAt[1], 120);
  const aimAt: V3 = [heroAt[0] + dH[0] * 2.5, heroAt[1] + dH[1] * 2.5, 0];
  const lookC = unit([aimAt[0] - cpos[0], aimAt[1] - cpos[1], 0]);
  const cam: LandCam = { pos: cpos, yaw: Math.atan2(-lookC[0], lookC[1]), pitch: 0.22, F: W * 0.62, cx: W * 0.5, hy: H * 0.6 };
  // (the burning wagon: sculpted (sculptWagon), a fifth of a metre a unit, its horse at the gallop; where it burns)
  const Wg = onLedge(sG - 10);
  const wyaw = Math.atan2(Wg.d[1], Wg.d[0]);
  const wcam = figCam(cam, Wg.q, 0.2);
  const BURN: V3 = [-3.5, -1.5, 11.2];
  const blaze = seen(wcam, turnZ(BURN, wyaw));
  const k = wcam.scale / 10.5;
  // (the fire's light on the stones near it; the torches of the cult, behind us, on the terrace round us)
  const back = local(0, -9);
  paintValley(p, t, cam, { lights: [{ at: [Wg.q[0], Wg.q[1], Wg.q[2] + 2.5], color: '#ff8a2a', reach: 16, k: 0.7 }, { at: [back[0], back[1], back[2] + 2.4], color: '#e8601c', reach: 11, k: 0.45 }], prisonClose: true });
  // THE LEAD WAGON turning in at the gate, under its arch, its lantern swinging
  {
    const L = onLedge(sG + 2);
    const lf = new Figure();
    const lw = sculptWagon(lf, [0, 0, 0], Math.atan2(L.d[1], L.d[0]), { roll: T0(t) * 4, lampSide: -1 });
    const lcam = figCam(cam, L.q, 0.2);
    if (still()) lf.draw(p, lcam, { from: unit([0.2, 1, 0.5]), hard: 1, fill: [-0.3, -1, 0.3], fillK: 0.35, rim: LAMP[1], rimFrom: [0, -1] });
    if (lw.lamp && moving()) {
      const ls = seen(lcam, lw.lamp);
      behind(p, 'run.gate', (q) => shine(q, ls[0], ls[1], (16 + Math.sin(t * 7.3) * 1.5) * k, LAMP[1], 2, 0.25));
    }
  }
  front(p, 'run.gate');
  // THE LAST WAGON, burning, its horse at the gallop along the terrace; smoke and sparks streaming back off it
  {
    const f = new Figure();
    const wl = sculptWagon(f, [0, 0, 0], wyaw, { roll: -T0(t) * 7, horse: { ph: T0(t) * 9 + 2.83, gallop: true }, burn: 0.85, burnAt: BURN, lampSide: -1, driver: 'armourer' });
    if (still()) f.draw(p, wcam, { from: unit([-0.3, -0.5, 0.8]), hard: 1, fill: [0.2, -1, 0.2], fillK: 0.42, rim: '#ffb060', rimFrom: [-1, -0.3] });
    front(p, 'run.wagon');
    if (moving()) behind(p, 'run.wagon', (p) => {
      if (wl.lamp) {
        const ls = seen(wcam, wl.lamp);
        shine(p, ls[0], ls[1], 14 * k, LAMP[1], 2, 0.25);
      }
      // (a body of fire over the back half of its cover, licking up and streaming back: many tongues close together, the
      // tallest over where it caught; its light on everything near)
      paintSmoke(p, blaze[0] - 10 * k, blaze[1] - 10 * k, 34 * k, 140 * k, -2.0, t, 1311, 1);
      shine(p, blaze[0], blaze[1], 70 * k * flick, '#ff8a2a', 2, 0.18);
      const along: Pt[] = [];
      for (let j = 0; j < 30; j++) {
        const u = j / 29;
        const a2 = 0.3 + hash(j, 1, 1107) * 1.5;
        along.push(seen(wcam, turnZ([-8.2 + u * 8.5, -Math.cos(a2) * 3.3, 5.4 + Math.sin(a2) * 6.4], wyaw)));
      }
      paintFlames(p, along, 36 * k, -0.5, t, 1105);
      for (let j = 0; j < 30; j++) {
        const x = blaze[0] - ((hash(j, 1, 1313) * 220 + t * 120 + j * 13) % 240) * k;
        const y = blaze[1] - 20 * k - hash(j, 2, 1313) * 70 * k + Math.sin(j + t * 3) * 6 * k;
        p.set(Math.round(x), Math.round(y), j % 3 ? '#ffc040' : '#fff3c0').set(Math.round(x) + 1, Math.round(y), '#ff8a2a');
      }
    });
  }
  const STRUCK = 1.3;
  const since = t - STRUCK;
  const kcam = figCam(cam, heroAt, 0.175);
  const look = kcam.look;
  const flap = Math.sin(T0(t) * 3.1);
  // (the camera's line, as he is built: the flat of the blade turned to it)
  const cy0 = Math.cos(yaw);
  const sy0 = Math.sin(yaw);
  const lookL: V3 = [look[0] * cy0 + look[1] * sy0, -look[0] * sy0 + look[1] * cy0, look[2]];
  const wr = (g: V3, s: number): V3 => sub3(g, scale3(unit(sub3(g, [s * 2.2, 0, 14.2])), 0.62));
  // (struck: the grip before him, the blade level at them)
  const gM: V3 = [1.0, -4.6, 11.4];
  const dirL = unit([0.55, -1, -0.05]);
  const tipL = add3(gM, scale3(dirL, 10.8));
  const hero = (q: Px, struck: boolean): void => runHero(q, kcam, yaw, lookL, flap, struck);
  // (the arc of the swing, behind him and his blade: a crescent of the friend's cyan, from behind his right shoulder round
  // to where the blade is now; in its first frame, white hot)
  const arcOf = (q: Px, hot: boolean): void => {
    const placed = Cast.place(new Figure(), [0, 0, 0], yaw, () => undefined, OLD);
    const hs = seen(kcam, placed.at(gM));
    const tip = seen(kcam, placed.at(tipL));
    const start = seen(kcam, placed.at([-7.5, 2.5, 15.5]));
    const R = Math.hypot(tip[0] - hs[0], tip[1] - hs[1]);
    const a1 = Math.atan2(tip[1] - hs[1], tip[0] - hs[0]);
    let a0 = Math.atan2(start[1] - hs[1], start[0] - hs[0]);
    while (a0 - a1 > Math.PI) a0 -= Math.PI * 2;
    while (a1 - a0 > Math.PI) a0 += Math.PI * 2;
    const arc = layerOf(q);
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
    arc.poly(pts, hot ? CYANS[0] : CYANS[2]);
    arc.each((x, y) => {
      const d = Math.hypot(x - hs[0], y - hs[1]) / R;
      const ang = Math.atan2(y - hs[1], x - hs[0]);
      let along = (ang - a1) / (a0 - a1);
      if (along < 0) along += Math.PI * 2 / Math.abs(a0 - a1);
      if (hot) return d > 0.9 ? '#ffffff' : d > 0.8 ? '#e8ffff' : along > 0.8 && dot(x, y, 0.5, 3) ? '#00000000' : undefined;
      return d > 0.97 ? CYANS[0] : d > 0.88 ? CYANS[1] : along > 0.7 && dot(x, y, 0.5, 3) ? '#00000000' : undefined;
    });
    over(q, arc, null);
  };
  posed(p, 'run.arc', 2, 1, since < 0 ? -1 : since < 0.09 ? 0 : 1, (q, i) => arcOf(q, i === 0), since < 0.09 ? 1 : 1 - (since - 0.09) / 0.6);
  posed(p, 'run.hero', 2, 1, since < 0 ? 0 : 1, (q, i) => hero(q, i === 1));
  // THE FIRST OF THEM, between us and him, where his blade comes: lunging in at him, then struck, flung back; and two more
  // of them at his heels either side of us, their torches up (sculpted at their true size, a man's height)
  const toHero = (q: V3): number => Math.atan2(heroAt[0] - q[0], -(heroAt[1] - q[1]));
  const sideA = local(-1.4, -2.4);
  const sideB = local(2.0, -3.3);
  const torches: [number, number, number][] = [];
  const near = (q: Px, i: number): void => {
    const f = new Figure();
    sculptCultist(f, [0, 0, 0], toHero(foeAt), i === 0 ? AMBUSH_POSES.run(0.7, 1.2, 1) : AMBUSH_POSES.reel, 1);
    f.draw(q, figCam(cam, foeAt, 0.175), { cel: COMIC, at: [6, -2, 9], hard: 1, fill: [0.6, -1, 0.3], fillK: 0.3, rim: i === 0 ? '#ffb060' : CYANS[1], rimFrom: [0, -1] });
    for (const [j, at] of [sideA, sideB].entries()) {
      const g = new Figure();
      const fc = figCam(cam, at, 0.175);
      const r = sculptCultist(g, [0, 0, 0], toHero(at) + (j ? 0.25 : -0.25), AMBUSH_POSES.run(0.55, 2.1 + j * 2.6, j === 0 ? 1 : 0), 1);
      g.draw(q, fc, { cel: COMIC, at: [6, -2, 9], hard: 1, fill: [0.6, -1, 0.3], fillK: 0.3, rim: '#ffb060', rimFrom: [j ? -1 : 1, -0.5] });
      if (i === 0 && r.torch) torches.push([...seen(fc, r.torch), fc.scale]);
    }
  };
  posed(p, 'run.near', 2, 1, since < 0 ? 0 : 1, near);
  if (moving() && torches.length === 0) {
    // (where their torches burn, worked out again for the moving paint: the figures are not painted then)
    for (const [j, at] of [sideA, sideB].entries()) {
      const r = sculptCultist(new Figure(), [0, 0, 0], toHero(at) + (j ? 0.25 : -0.25), AMBUSH_POSES.run(0.55, 2.1 + j * 2.6, j === 0 ? 1 : 0), 1);
      const fc = figCam(cam, at, 0.175);
      if (r.torch) torches.push([...seen(fc, r.torch), fc.scale]);
    }
  }
  if (moving()) {
    for (const [j, [x, y, sc]] of torches.entries()) {
      shine(p, x, y - sc, sc * 4 * flick, '#ff8a2a', 2, 0.2);
      paintFlame(p, x, y, sc * 0.3, t, j + 40);
    }
  }
  // (where the blade's end meets him, a burst of cyan as it strikes: white hot, then the friend's cyan, sparks flung out)
  if (moving() && PASS === 'live' && since >= 0 && since < 0.45) {
    const placed = Cast.place(new Figure(), [0, 0, 0], yaw, () => undefined, OLD);
    const tip = seen(kcam, placed.at(tipL));
    const u = since / 0.45;
    const k = kcam.scale / 18.4;
    shine(p, tip[0], tip[1], (30 + 50 * u) * k, u < 0.2 ? '#ffffff' : CYANS[0], 2, 0.6 * (1 - u));
    for (let j = 0; j < 18; j++) {
      const a = hash(j, 1, 1321) * Math.PI * 2;
      const r = (6 + u * 70 * (0.5 + hash(j, 2, 1321))) * k;
      const x = Math.round(tip[0] + Math.cos(a) * r);
      const y = Math.round(tip[1] + Math.sin(a) * r + u * u * 20 * k);
      p.set(x, y, j % 2 ? CYANS[0] : '#ffffff').set(x + 1, y, CYANS[1]);
    }
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
  const k = W / 392;
  const flick = 0.85 + 0.15 * Math.sin(t * 9.1);
  // THE BURNING WAGON TURNING IN AT THE GATE: seen from the terrace behind it, low, at its outer edge over the drop; the
  // terrace running on ahead under the prison's wall to the gatehouse, its two great towers either side of the arch; the
  // wagon turning in under it, its canvas afire, the fire's light on the stones; beside us the drop, the peak's slopes and
  // the valley far below in the dusk. Then the wagon gone in, its fire's light still in the way through
  const land = theLand();
  const pp = prisonPlace();
  const sG = land.index.near(pp.gate[0], pp.gate[1])?.s ?? land.road[land.road.length - 1].s;
  // (we hang in the air out over the drop before the gate, off to the side the terrace comes along, a little under it)
  const Ig = pp.inward;
  const Sg: V3 = [-Ig[1], Ig[0], 0];
  const before = land.along(sG - 30).q;
  const sideSign = (before[0] - pp.gate[0]) * Sg[0] + (before[1] - pp.gate[1]) * Sg[1] > 0 ? 1 : -1;
  const cpos: V3 = [pp.gate[0] - Ig[0] * 44 + Sg[0] * sideSign * 16, pp.gate[1] - Ig[1] * 44 + Sg[1] * sideSign * 16, CRAG_TOP - 1];
  if (still()) land.focus(pp.gate[0], pp.gate[1], 120);
  const aim: V3 = [pp.gate[0] - Ig[0] * 4, pp.gate[1] - Ig[1] * 4, 0];
  const look = unit([aim[0] - cpos[0], aim[1] - cpos[1], 0]);
  const cam: LandCam = { pos: cpos, yaw: Math.atan2(-look[0], look[1]), pitch: 0.2, F: W * 0.42, cx: W * 0.5, hy: H * 0.62 };
  // (the wagon turning in: its front in under the arch, its back end out; facing in, along the way through)
  const I = pp.inward;
  const wq: V3 = [pp.gate[0] - I[0] * 3.2, pp.gate[1] - I[1] * 3.2, CRAG_TOP];
  const wyaw = Math.atan2(I[1], I[0]) - 0.25;
  const wcam = figCam(cam, wq, 0.2);
  const fire3: V3 = turnZ([-6, 0, 12], wyaw);
  const blaze = seen(wcam, fire3);
  const gone = t >= 2.4;
  paintValley(p, t, cam, { lights: [{ at: [wq[0], wq[1], wq[2] + 3], color: '#ff8a2a', reach: 18, k: 0.8 }], prisonClose: true });
  front(p, 'gate.wagon');
  posed(p, 'gate.wagon', 1, 0, gone ? -1 : 0, (q) => {
    const wf = new Figure();
    sculptWagon(wf, [0, 0, 0], wyaw, { roll: -T0(t) * 7, horse: { ph: T0(t) * 9 + 2.83, gallop: true }, burn: 0.85, burnAt: [-6, 0, 11], driver: 'armourer' });
    wf.draw(q, wcam, { at: add3(fire3, [0, -4, 1]), hard: 1, fill: [-0.3, -1, 0.3], fillK: 0.3, rim: '#ffb060', rimFrom: [-1, -0.4] });
  });
  // (the fire's light over the stone round the arch, and the fire off the wagon's canvas licking up the arch's face; once
  // it is in, only its light in the way through, dying)
  if (moving()) {
    const sz = wcam.scale / 15;
    if (!gone) {
      shine(p, blaze[0], blaze[1], 60 * sz * flick, '#ff8a2a', 2, 0.2);
      const along: Pt[] = [];
      for (let j = 0; j < 16; j++) {
        const a2 = 0.3 + hash(j, 1, 1410) * 2.5;
        along.push(seen(wcam, turnZ([-8.2 + hash(j, 2, 1410) * 5, -Math.cos(a2) * 3.3, 5.4 + Math.sin(a2) * 6.6], wyaw)));
      }
      paintFlames(p, along, 26 * sz, -0.25, t, 1411);
      for (let j = 0; j < 24; j++) {
        const x = blaze[0] + (hash(j, 1, 1407) - 0.5) * 70 * sz;
        const y = blaze[1] - ((hash(j, 2, 1407) * 50 + t * 30 + j * 7) % 60) * sz;
        p.set(Math.round(x), Math.round(y), j % 3 ? '#ffc040' : '#fff3c0');
      }
    } else {
      const inq = seen(figCam(cam, [pp.gate[0] + I[0] * 3, pp.gate[1] + I[1] * 3, CRAG_TOP + 2.5], 1), [0, 0, 0]);
      const fade = clamp01(1 - (t - 2.4) / 4);
      behind(p, 'gate.wagon', (q) => shine(q, inq[0], inq[1], 40 * sz * flick * (0.4 + 0.6 * fade), '#ff8a2a', 2, 0.25 * fade + 0.05));
    }
  }
  caption(p, 'Through the gate...', Math.round(6 * k), Math.round(6 * k), 120);
}

export function paintArmourerDoor(p: Px, t: number): void {
  const W = p.w;
  const H = p.h;
  const S = (x: number, y: number): Pt => [(x / 192) * W, (y / 111) * H];
  const k = W / 192;
  if (!still()) return;
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
  sculptArmourer(f, [0, 0, 0], 0.55, 2.2, T0(t));
  f.draw(p, { look: unit([-0.15, 1, -0.12]), up: [0, 0, 1], scale: 9.6 * k, ox: S(102, 0)[0], oy: S(0, 104)[1] }, { cel: COMIC, at: [-6, -5, 14], hard: 1, fill: [0.5, -1, 0.2], fillK: 0.3, rim: '#ffb060', rimFrom: [-1, -0.4] });
}

export function paintHeroDoor(p: Px, t: number): void {
  const W = p.w;
  const H = p.h;
  const S = (x: number, y: number): Pt => [(x / 192) * W, (y / 111) * H];
  const k = W / 192;
  if (!still()) return;
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
  const flap = Math.sin(T0(t) * 3.1);
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
  if (still()) {
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
  }
  front(p, 'gap.edges');
  // (the fire's line down each door's edge, flickering)
  if (moving()) behind(p, 'gap.edges', (q) => {
    for (let y = 0; y < H; y++) {
      const fl = PASS === 'live' ? hash(y >> 2, Math.floor(t * 12), 1435) : 1;
      const c = fl > 0.75 ? '#ffc040' : fl > 0.2 ? '#ff8a2a' : '#c0402a';
      q.set(Math.round(S(86, 0)[0]) + 2, y, c);
      q.set(Math.round(S(106, 0)[0]) - 3, y, c);
    }
  });
  // the eyes in the crack, their glow throbbing
  if (moving()) behind(p, 'gap.hand', (p) => {
  for (const [ex, ey, sd] of [[S(92, 32)[0], S(0, 32)[1], -1], [S(100, 32)[0], S(0, 32)[1], 1]] as const) {
    // (each a slash of the enemy's pink, slanting down to the middle, its light bleeding round it)
    shine(p, ex, ey, (9 + Math.sin(t * 3.1) * 2) * k, '#c02a6a', 0, 0.35);
    const n = Math.round(4 * k);
    for (let i = 0; i <= n; i++) {
      const x = Math.round(ex - sd * (i - n / 2));
      const y = Math.round(ey + (i - n / 2) * 0.45 * -1);
      p.set(x, y, i > 0 && i < n ? '#ffd0e4' : '#ff5aa0').set(x, y + 1, '#ff5aa0');
    }
  }
  });
  front(p, 'gap.hand');
  // THE HAND through it: a bony forearm, the claws hooked at us
  const f = new Figure();
  const bone = f.stuff({ tones: [INK, '#1a1424', '#30283e', '#4c4258', '#6e6278', '#948698'], crease: 0.7, hatch: 3 });
  const robe = f.stuff({ tones: [INK, '#16101e', '#241a30', '#3e2e4e', '#544066', '#76587e'], crease: 0.9 });
  const reach = Math.sin(T0(t) * 2.2) * 0.2;
  // (his arm forced in through the crack from his side, slantwise: the ragged sleeve fallen back to the elbow, the bony
  // forearm bare from it, the hand hooked round the edge of the near door, its claws at us)
  // (out of the crack, round the edge of the near door and onto its face: the sleeve's rags caught in the crack, the bony
  // forearm bare out of it, the long hand spread flat on the oak, its claws hooked into the wood)
  f.rod(robe, [-0.1, 3.4, 6.6], [-0.05, 0.9, 6.4], 0.3, 0.27, 0.2);
  for (const [dx, dz] of [[-0.22, -0.25], [0.05, -0.32], [0.24, -0.12], [0.18, 0.22]] as const) f.rod(robe, [-0.05, 0.9, 6.4], [dx, 0.55, 6.4 + dz], 0.12, 0.03, 0.08);
  const wrist: V3 = [0.62 + reach * 0.3, -0.42, 6.15];
  forearm(f, bone, [-0.05, 0.9, 6.35], wrist, 0.2, [0, 0, 1]);
  hand(f, bone, frameAt(wrist, unit([1, 0.12, -0.3]), [0, -1, 0.15]), 1.2, 'claw');
  if (still()) f.draw(p, { look: unit([-0.32, 1, 0.08]), up: [0, 0, 1], scale: 27 * k, ox: gx, oy: S(0, 205)[1] }, { cel: COMIC, at: [-0.3, 2.5, 7.2], hard: 1, fill: [-0.4, -1, 0.5], fillK: 0.35, rim: '#ff8a2a', rimFrom: [-1, -0.3] });
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
  // (heaved up in three goes; it clunks home in the next box)
  const heaves = [0, 0.12, 0.25];
  const now = t < 0.7 ? 0 : t < 1.3 ? 1 : 2;
  const lamp = S(20, 0);
  const lit = (x: number, y: number): number => glow(x, y, lamp[0], lamp[1], W * 1.3);
  if (still()) {
  paintDoor(p, [S(-4, -4), S(196, -4), S(196, 120), S(-4, 120)], S(-4, 0)[0], 16 * k, [S(0, 96)[1]], 8 * k, lit, 1441);
  stroke(p, [S(96, -4), S(96, 120)], 2);
  }
  posed(p, 'bar.heave', 3, 1, now, (p, i) => {
  const heave = heaves[i];
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
  // THE TWO OF THEM UNDER IT, seen from behind and below: the armourer at its left end, your hero at its right, their arms
  // up over their heads and their hands under the bar, heaving it up to the brackets; their weight thrown up into it, on
  // their toes at the last (art/cast.ts, at their true size, a tenth of a metre a unit; their backs to us, facing the doors)
  const zb = 1.0 + heave * 5 - 0.62;
  const up = heave * 6;
  const pose = (dx: number, rise: number) => ({
    pelvis: [0, 0.3, 9.3 + rise] as V3,
    lean: -0.08,
    nod: -0.35,
    hands: [[-1.05 + dx, -1.0, zb + 20.75 - up * 0.2], [1.05 + dx, -1.0, zb + 20.75 - up * 0.2]] as [V3, V3],
    elbows: [[-1, 0.3, 0.1], [1, 0.3, 0.1]] as [V3, V3],
    palms: [[0, 0, 1], [0, 0, 1]] as [V3, V3],
    fingers: [[0, -1, 0.1], [0, -1, 0.1]] as [V3, V3],
    feet: [[-1.5, 0.5, 0.75 + rise * 0.25], [1.5, -0.8, 0.75 + rise * 0.25]] as [V3, V3],
    knees: [[-0.3, -1, 0.2], [0.3, -1, 0.2]] as [V3, V3],
  });
  Cast.place(f, [-3.2, -2.1, -20.3 + up * 0.2], Math.PI, () => {
    Cast.armourer(f, pose(0, up * 0.3), ['flat', 'flat']);
  });
  Cast.place(f, [3.2, -2.1, -20.3 + up * 0.2], Math.PI, () => {
    Cast.knight(f, pose(0, up * 0.3), null, 0, ['flat', 'flat']);
  });
  void skin;
  void steel;
  void shirt;
  void mail;
  void by;
  f.draw(p, { look: unit([0.06, 1, 0.42]), up: [0, 0, 1], scale: 7.2 * k, ox: S(96, 0)[0], oy: S(0, 30)[1] }, { cel: COMIC, at: [-6, -7, 7], hard: 1, fill: [0.4, -1, 0.3], fillK: 0.5, rim: '#ffb060', rimFrom: [-1, -0.4] });
  });
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
  if (still()) {
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
  }
  // THE LANTERN hung on the wall at the left, and the dust hanging in its light
  if (moving()) behind(p, 'barred.lamp', (p) => {
  paintLantern(p, lamp[0], lamp[1], Math.sin(t * 1.7) * 0.04, lamp[0], lamp[1] - 30 * k);
  for (let j = 0; j < 60; j++) {
    const x = (hash(j, 1, 1457) * W + Math.sin(t * 0.6 + j) * 6 * k) % W;
    const y = (hash(j, 2, 1457) * H * 0.8 + t * 3 * k * hash(j, 3, 1457)) % (H * 0.8);
    if (lit(x, y) > 0.08) p.set(Math.round(x), Math.round(y), lit(x, y) > 0.3 ? '#fff3c0' : '#c8a878');
  }
  });
  front(p, 'barred.lamp');
  if (still()) {
  // THE COMPANY against the doors, panting: the armourer sat down against them, the mystic sunk down, your hero in the middle
  // leaning on his sword, his head down; the wordsmith with a hand up on the bar; the stranger off on his own, his gold eyes
  const from: V3 = unit([-1, -0.7, 0.7]);
  const light = { cel: COMIC, from, hard: 1, fill: [0.3, -1, 0.2] as V3, fillK: 0.16, rim: '#ffc070', rimFrom: [-1, -0.3] as const };
  const at = (x: number, y: number, sc: number, look: V3) => ({ look: unit(look), up: [0, 0, 1] as V3, scale: sc * k * 1.25, ox: S(x, 0)[0], oy: S(0, y)[1] });
  const pant = (r: number, ph: number): number => Math.sin(T0(t) * r + ph) * 0.06;
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
    const pt = Math.sin(T0(t) * 4.2) * 0.06;
    Cast.place(f, [0, 0, 0], 0.25, () => Cast.knight(f, {
      pelvis: [0, 0.6, 6.2],
      lean: 0.38 + pt,
      nod: 0.45,
      hands: [[-0.3, -3.3, 10.1], [0.3, -3.2, 11.0]],
      elbows: [[-1, 0.2, -0.6], [1, 0.2, -0.6]],
      feet: [[-1.0, 4.0, 1.1], [1.1, -2.6, 0.75]],
      knees: [[0, -1, -0.6], [0, -1, 0.8]],
    }, { hand: 0, tip: [0, -4.6, 0.2], two: true, face: [0, -1, 0] }, Math.sin(T0(t) * 1.5) * 0.2), OLD);
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
  }
  caption(p, 'Barred, just in time.', Math.round(6 * k), Math.round(6 * k), 120);
}

export function paintDark(p: Px, t: number): void {
  const W = p.w;
  const H = p.h;
  const k = W / 392;
  const pulse = 0.8 + 0.2 * Math.sin(t * 2.3);
  // THE WAY DOWN under the prison, seen from its top: a passage cut down through the rock, walled in laid stone, its vault
  // round over it, its stairs going down and down away from us into the dark; dark but where a light is: the hall's lantern
  // behind us, warm, on its first steps; and far down it his staff's cyan on the stones round him, and him, small, his back
  // to us, going on down (sculpted: the passage in metres; him as on page 3, oldSmithFigure, a tenth of a metre a unit)
  const d = unit([0, 1, -0.3]);
  const upP: V3 = unit([0, 0.3, 1]);
  const D = 4;
  const look = unit([0, 1, -0.24]);
  const eye: V3 = scale3(look, -D);
  const top = sub3(sub3(eye, scale3(upP, 1.55)), d);
  const at = (u: number): V3 => add3(top, scale3(d, u));
  const L = 48;
  const smith = add3(at(22), [0.25, 0, 0]);
  const staff: V3 = add3(smith, [0.35, 0.15, 2.2]);
  const lamp: V3 = add3(eye, [0.6, -1.5, 0.9]);
  const COLD = ['#06050c', '#0c0b18', '#121424', '#16202e', '#1a3038', '#1e4650', '#2a6a74', '#4294a0', '#7ae0e6'];
  const WARM = ['#06050c', '#0e0b16', '#1a121c', '#2a1a20', '#3e2420', '#5a3424', '#7a4a2c', '#9a663a'];
  const f = new Figure();
  const stone = f.stuff({
    tones: [INK, '#07060e', '#0b0a16', '#0f1420'],
    crease: 0.3,
    paint: (q, n) => {
      const tc = sub3(staff, q);
      const dc = Math.hypot(tc[0], tc[1], tc[2]);
      const tw = sub3(lamp, q);
      const dw = Math.hypot(tw[0], tw[1], tw[2]);
      const c = (0.3 + 0.7 * Math.max(0, dt3(n, tc) / dc)) * Math.exp(-dc / 8) * 1.7 + 0.1;
      const w = (0.3 + 0.7 * Math.max(0, dt3(n, tw) / dw)) * Math.exp(-dw / 6) * 1.2;
      const rel = sub3(q, top);
      const along = dt3(rel, d);
      const hgt = dt3(rel, upP);
      let joint = false;
      let own = 0;
      let lip = 0;
      if (dt3(n, upP) > 0.6) {
        // (the stairs: a step every third of a metre down, each its own stone, the edge of each worn and catching the light)
        const st = along / 0.34;
        const fs = st - Math.floor(st);
        joint = fs < 0.12;
        lip = fs > 0.86 ? 0.12 : 0;
        own = hash(Math.floor(st), Math.floor(q[0] / 0.7 + 9), 1801) - 0.5;
      } else {
        // (the walls and the vault: stones in courses, each its own length and shade)
        const row = Math.floor((hgt + 6) / 0.42 + (dt3(n, upP) < -0.2 ? q[0] * 1.6 : 0));
        const fr = (hgt + 6) / 0.42 - Math.floor((hgt + 6) / 0.42);
        const sl = 0.6 + hash(row, 1, 1802) * 0.5;
        const sa = along / sl + hash(row, 2, 1802) * 5;
        joint = fr < 0.09 || sa - Math.floor(sa) < 0.06 / sl;
        own = hash(Math.floor(sa), row, 1803) - 0.5;
      }
      const v = Math.max(c, w);
      const ramp = c >= w ? COLD : WARM;
      const kk = Math.round(v * (ramp.length - 1) * (joint ? 0.45 : 1) + (joint ? 0 : own * 0.9 + lip * (ramp.length - 1)));
      return ramp[Math.max(0, Math.min(ramp.length - 1, kk))];
    },
  });
  const mid = at(L / 2);
  const AXP: readonly [V3, V3, V3] = [[1, 0, 0], d, upP];
  f.block(stone, add3(mid, scale3(upP, 1.6)), [3.5, L / 2 + 1, 3.6], 0, AXP, 0);
  f.block(stone, add3(mid, scale3(upP, 1.1)), [1.35, L / 2 + 4, 1.1], 0.02, AXP, 0, true);
  f.rod(stone, add3(at(-4), scale3(upP, 2.2)), add3(at(L + 4), scale3(upP, 2.2)), 1.35, 1.35, 0, true);
  const cam = { look, up: [0, 0, 1] as V3, scale: (W * 0.78) / D, ox: W * 0.5, oy: H * 0.42, persp: D };
  if (still()) {
    p.rect(0, 0, W, H, '#040309');
    f.draw(p, cam, { at: staff, hard: 1, fill: [0, -1, 0.3], fillK: 0.1 }, false);
  }
  // HIM, far down, his back to us, going down the steps; his staff up, burning
  const fig = oldSmithFigure(Math.PI + 0.1, 0, unit([0.1, 0.5, 1]), false, 19.2);
  const fcam = { ...cam, scale: cam.scale * 0.1, persp: D * 10, shift: scale3(smith, 10) as V3 };
  if (still()) fig.f.draw(p, fcam, { at: scale3(staff, 10), hard: 1, fill: [0, -1, 0.3], fillK: 0.15, rim: CYANS[2], rimFrom: [0.3, -1] });
  const hs = seen(fcam, fig.head);
  if (moving()) {
    shine(p, hs[0], hs[1], 13 * k * pulse, CYANS[2], 2, 0.22);
    shine(p, hs[0], hs[1], 4 * k * pulse, CYANS[0], 2, 0.6);
    p.set(Math.round(hs[0]), Math.round(hs[1]), '#ffffff').set(Math.round(hs[0]) + 1, Math.round(hs[1]), CYANS[0]).set(Math.round(hs[0]), Math.round(hs[1]) - 1, CYANS[0]);
    const ls = seen(cam, lamp);
    void ls;
  }
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
  [{ x: 0, y: 0, w: 1, h: 1, paint: paintRun, across: true, jolt: 1.3 }],
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
    { x: 0, y: 0, w: 1, h: 0.7, paint: paintBarred, say: 'Barred, just in time.', jolt: 0.1 },
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

/** A spread's blank paper, darkening into the spine. */
export function paperSpread(): Px {
  const PW = (SPREAD_W * DENSITY) / 2;
  const PH = SPREAD_H * DENSITY;
  const p = new Px(PW * 2, PH);
  p.rect(0, 0, PW * 2, PH, PAPER);
  wash(p, PAPER_DARK, (x) => {
    const d = Math.abs(x - PW) / 18;
    return d >= 1 ? 0 : Math.ceil((1 - d) * 3) / 3 * 0.8;
  });
  return p;
}

/** A page's own captions (PAGE_CAPTIONS), pinned where they go on its spread (page 0 the left, 1 the right). */
export function pagePins(pageNo: number, page: 0 | 1): Pin[] {
  const PW = (SPREAD_W * DENSITY) / 2;
  const PH = SPREAD_H * DENSITY;
  const iw = PW - 2 * MARGIN;
  const ih = PH - 2 * MARGIN;
  return PAGE_CAPTIONS.filter((c) => c.page === pageNo).map((c) => ({
    say: c.say,
    x: Math.round(page * PW + MARGIN + c.x * iw),
    y: Math.round(MARGIN + c.y * ih),
    maxW: c.maxW,
  }));
}

// =============================================================================================
// HOW IT PLAYS: NOT A BOOK. His words, 25 Oct 2026, of the pages turning: “Okay, I know I said living comic book but I
// didn’t actually mean it’s like a book with pages flipping.”; then: “The bigger shots cover the full screen, then the
// smaller boxes transition in showing a closer or more intimate shot of what is happening”. So the story plays as SCENES:
// each opens on one of its big boxes filling the screen, the camera moving slowly across it; over it the smaller boxes
// slide in one at a time, closer shots of what is happening; then the next scene's big shot takes over. The boxes are the
// pages' (PAGES), named by page and place ('p1b2', the first page's second box).

/** The screen, in picture pixels. */
export const SCREEN_W = SPREAD_W * DENSITY;
export const SCREEN_H = SPREAD_H * DENSITY;

/** A smaller box sliding in over a scene's big shot: which box, where its top left goes on the screen, how much bigger
 * than on its page, which edge it slides in from; and which box before it on the screen it takes the place of. */
export interface Inset {
  box: string;
  x: number;
  y: number;
  scale: number;
  from: 'left' | 'right' | 'top' | 'bottom';
  replaces?: string;
}
/** A scene: its big shot (a box), how much bigger than the screen it is baked (the room the camera has to move), the
 * camera's way across it ([share of the scene's time, share of its room across, share of its room down], in order), how
 * long it is shown before its first inset comes in, its insets; how it comes in from the scene before (a dissolve, a white
 * flash, a cut); whether its box's own words are shown, and words of its own, top left. */
export interface Scene {
  big: string;
  zoom: number;
  pan: readonly (readonly [number, number, number])[];
  lead: number;
  insets: readonly Inset[];
  into: 'dissolve' | 'flash' | 'cut';
  ownWords?: boolean;
  say?: string;
}

export const SCENES: readonly Scene[] = [
  // THE ROAD UP: rising from the wagons on the road to the prison on its crag; the lantern swinging on the wagon, close;
  // the old wordsmith far ahead with his light
  {
    // (up from the wagons to the prison first; then, in the foot of the sky, the closer shots one after the other, clear of
    // the wagons, the peak and the prison)
    big: 'p1b1', zoom: 1.25, lead: 5.4, into: 'dissolve',
    pan: [[0, 0.1, 1], [0.42, 0.8, 0], [1, 0.84, 0]],
    insets: [
      { box: 'p1b2', x: 16, y: 120, scale: 1.25, from: 'left' },
      { box: 'p1b3', x: 16, y: 120, scale: 1.25, from: 'left', replaces: 'p1b2' },
    ],
  },
  // THE CARAVAN, close: the wagons rolling up the road; the company, one by one
  {
    big: 'caravan', zoom: 1.12, lead: 2.2, into: 'dissolve', ownWords: false,
    say: 'seeking the Meldstone, and the altar that wakes the words.',
    pan: [[0, 0.2, 0.6], [1, 0.8, 0.4]],
    insets: [
      { box: 'p2b1', x: 20, y: 64, scale: 1.25, from: 'left' },
      { box: 'p2b2', x: 572, y: 64, scale: 1.25, from: 'right' },
      { box: 'p2b3', x: 20, y: 64, scale: 1.25, from: 'left', replaces: 'p2b1' },
      { box: 'p2b4', x: 572, y: 64, scale: 1.25, from: 'right', replaces: 'p2b2' },
    ],
  },
  // THE OLD WORDSMITH: on his face as he speaks, then up along his staff to the prison; his eyes; a glint in the rocks
  {
    big: 'pointing', zoom: 1.12, lead: 3.4, into: 'dissolve',
    pan: [[0, 0.3, 0.8], [0.3, 0.3, 0.8], [0.8, 0.7, 0], [1, 0.7, 0]],
    insets: [
      { box: 'p3b2', x: 20, y: 144, scale: 1.25, from: 'left' },
      { box: 'p3b3', x: 621, y: 144, scale: 1.25, from: 'right' },
    ],
  },
  // THE AMBUSH: a flash, the bomb; down from the cult pouring over the ridge to the last wagon burning
  { big: 'p4b1', zoom: 1.08, lead: 5.6, into: 'flash', pan: [[0, 0.5, 0], [0.8, 0.5, 1], [1, 0.5, 1]], insets: [] },
  // THE RUN FOR THE GATE: cut to it; your hero's stroke, then on to the gate
  { big: 'run', zoom: 1.04, lead: 6.4, into: 'cut', pan: [[0, 0.5, 1], [0.34, 0.5, 1], [1, 0.5, 0]], insets: [] },
  // THROUGH THE GATE: across the gatehouse to the burning wagon going in; the doors pushed shut from either side, the hand
  // through the gap, the bar heaved up
  {
    big: 'p7b1', zoom: 1.04, lead: 2.6, into: 'dissolve',
    pan: [[0, 0.15, 0.5], [1, 0.6, 0.5]],
    insets: [
      { box: 'p7b2', x: 20, y: 218, scale: 1.25, from: 'left' },
      { box: 'p7b3', x: 572, y: 218, scale: 1.25, from: 'right' },
      { box: 'p7b4', x: 20, y: 218, scale: 1.25, from: 'left', replaces: 'p7b2' },
      { box: 'p7b5', x: 572, y: 218, scale: 1.25, from: 'right', replaces: 'p7b3' },
    ],
  },
  // BARRED: cut, the bar home; down from the bar to the company against the doors; the dark, over the doors above them
  { big: 'p8b1', zoom: 1.1, lead: 4.6, into: 'cut', pan: [[0, 0.5, 0], [0.75, 0.5, 0.85], [1, 0.5, 0.85]], insets: [] },
  // THE WAY DOWN: the old wordsmith's light far down in the dark under the prison; the end
  { big: 'dark', zoom: 1.1, lead: 6.0, into: 'dissolve', pan: [[0, 0.3, 0.2], [1, 0.6, 0.6]], insets: [] },
];

/** A box by its name ('p3b2'): its def, and its rectangle on its page. */
const NAMED: Record<string, BoxDef> = {
  caravan: { x: 0, y: 0, w: 1, h: 1, paint: paintCaravan },
  pointing: { x: 0, y: 0, w: 1, h: 1, paint: paintPointing },
  // (the run: taller than the screen, for the camera to go up from the stroke to the gate)
  run: { x: 0, y: 0, w: 1, h: 1.75, paint: paintRun, jolt: 1.3 },
  // (the way down, the last shot: the screen's own shape)
  dark: { x: 0, y: 0, w: 1, h: 1, paint: paintDark, say: 'The old wordsmith had gone on ahead... down into the dark.' },
};
export function boxNamed(id: string): { b: BoxDef; r: { x: number; y: number; w: number; h: number } } {
  if (NAMED[id]) return { b: NAMED[id], r: { x: 0, y: 0, w: SCREEN_W * NAMED[id].w, h: Math.round(SCREEN_H * NAMED[id].h) } };
  const pi = Number(id.slice(1, id.indexOf('b'))) - 1;
  const bi = Number(id.slice(id.indexOf('b') + 1)) - 1;
  const b = PAGES[pi][bi];
  return { b, r: boxRect(b, (pi % 2) as 0 | 1) };
}

/** The size a scene's big shot is baked at: its box's shape, covering the screen, `zoom` times over. */
export function bigSize(sc: Scene): { w: number; h: number } {
  const { r } = boxNamed(sc.big);
  const a = r.w / r.h;
  if (a >= SCREEN_W / SCREEN_H) {
    const h = Math.round(SCREEN_H * sc.zoom);
    return { w: Math.round(h * a), h };
  }
  const w = Math.round(SCREEN_W * sc.zoom);
  return { w, h: Math.round(w / a) };
}

export function paintSpread(k: number, t: number): Px {
  const p = paperSpread();
  for (const page of [0, 1] as const) {
    for (const b of PAGES[k + page] ?? []) {
      const r = boxRect(b, page);
      const box = new Px(r.w, r.h);
      b.paint(box, t);
      // (the box's frame: a heavy ink line round it)
      over(p, box, INK, r.x, r.y, 2);
    }
    for (const c of pagePins(k + page, page)) caption(p, c.say, c.x, c.y, c.maxW);
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

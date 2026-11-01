// THE HEADSMAN'S YARD, OUTDOORS: the painting (the art chat, 28 Oct 2026). A MOCK-UP; NOTHING OF THE GAME IMPORTS IT.
//
// His words to the main chat, 28 Oct, passed to the art chat on the board: “And I think I want the headman’s yard to be
// outdoors.  Like you go out to a big open area like a prison yard but there’s the gallows and the chopping block where the
// headsman’s boss area is at.”; read (told him so) as the Headsman's boss area an open prison yard under the sky, walled
// round, the gallows and the chopping block where he fights; who draws it, “The art chat (Recommended)”.
//
// So: a yard of cobbles under the open sky, walled round by the prison's high wall (its wall-walk and its battlements
// against the sky), a tower in its far corner flying his banner; the arch the hero comes out of from the Crypt; the prison's
// cell block and its keep beyond the wall; in the yard, the scaffold, draped in black, with the block on it, and the long
// gallows against the wall; sawdust round the block, old puddles, weeds at the wall's foot. THREE LOOKS for him to pick from,
// each its own light: GREY DAWN (the hour of executions), NIGHT BY TORCHLIGHT, and A STORM.
//
// His art rulebook kept: crisp pixels, two to a game pixel, no soft gradient across a surface (the sky in bands); one
// camera; light from the upper left, the left face lighter than the right; three tones a material; no black outlines (the
// seams a deep indigo); a dark base, the place a step quieter than the figures; no glow but an honest fire's orange (nothing
// cyan, nothing pink or gold glowing: those are the friend's and the enemy's); real shapes, not circles and squares.
//
// Measures as the game's (art/isokit.ts): picture pixels; a tile 64 x 32 on the screen; heights up, in picture pixels.

import { Px } from '../engine/px';
import { Iso, ISO_X, ISO_Y } from '../art/isokit';
import type { SideShader, TopShader } from '../art/isokit';
import { hash } from '../art/kit';

export type Look = 'dawn' | 'night' | 'storm';
export const LOOKS: Look[] = ['dawn', 'night', 'storm'];

/** Five tones of a material: its seam, its shade, its body, its light, its lit edge. */
type R5 = readonly [string, string, string, string, string];

export interface Pal {
  /** The sky, top to horizon, in bands. */
  sky: readonly string[];
  /** Clouds: shade, body, lit underside. */
  cloud: readonly [string, string, string];
  /** The prison's stone (its walls and tower). */
  stone: R5;
  /** The yard's cobbles, in the light and in shadow. */
  cobble: R5;
  cobbleShade: R5;
  earth: R5;
  earthShade: R5;
  saw: R5;
  timber: R5;
  cloth: R5;
  iron: R5;
  slate: R5;
  moss: readonly [string, string, string];
  /** The sky in a puddle: its deep, its body, its bright. */
  puddle: readonly [string, string, string];
  /** What the far buildings fade toward. */
  haze: string;
  /** How far the far buildings fade (0 none, 1 all haze). */
  hazeK: number;
  /** How long the shadows fall: picture pixels of rise for each tile they reach (0: no hard shadows). */
  slope: number;
  /** Whether lit windows burn in the far buildings. */
  windows: boolean;
  /** The seam where one part ends before another: a deep indigo, never black. */
  seam: string;
  /** Whatever lies beyond everything. */
  beyond: string;
}

export const PALS: Record<Look, Pal> = {
  // GREY DAWN: a rose dawn low under a slate sky; cool blue-violet stone touched warm on its lit edges; long shadows
  dawn: {
    sky: ['#232843', '#2b3150', '#353a5c', '#424665', '#54536e', '#6b6177', '#86707c', '#a17f82', '#bd918a', '#d3a492'],
    cloud: ['#3c4060', '#565775', '#c99a8e'],
    stone: ['#1c1d33', '#33344f', '#46476a', '#5d5c80', '#8a7f92'],
    cobble: ['#1d1e33', '#3a3a52', '#4d4c66', '#635f7a', '#8a7d92'],
    cobbleShade: ['#11122a', '#1d1e38', '#262847', '#313356', '#3d3f64'],
    earth: ['#1f1c2c', '#33293a', '#463846', '#5b4852', '#735c64'],
    earthShade: ['#131224', '#1d192c', '#262036', '#302840', '#3a3048'],
    saw: ['#3a2c30', '#6b5450', '#8f7466', '#b0927c', '#cbae92'],
    timber: ['#1d1622', '#33263a', '#4a3848', '#644c58', '#7e6468'],
    cloth: ['#0e0d18', '#191726', '#232134', '#302d44', '#3e3a56'],
    iron: ['#16172a', '#2b2d45', '#43465f', '#5f6380', '#8a8ea8'],
    slate: ['#1a1c30', '#2a2c46', '#383b58', '#4a4d6c', '#6a6888'],
    moss: ['#26302f', '#34433c', '#475747'],
    puddle: ['#3a3f5e', '#7a6f86', '#d1a596'],
    haze: '#5a5874',
    hazeK: 0.38,
    slope: 46,
    windows: true,
    seam: '#120f22',
    beyond: '#07050a',
  },
  // NIGHT BY TORCHLIGHT: deep blue under the moon; the moon's pale light on the stone's edges; torches and braziers burning
  night: {
    sky: ['#05060f', '#070917', '#0a0d1f', '#0d1128', '#111632', '#151b3b', '#1a2144', '#1f284e', '#253058', '#2b3762'],
    cloud: ['#0f1328', '#1a2140', '#3a4570'],
    stone: ['#0c0c1c', '#191a33', '#24264a', '#323661', '#56608c'],
    cobble: ['#0c0c1b', '#18192f', '#22243f', '#2e3152', '#4a5280'],
    cobbleShade: ['#08081a', '#101126', '#161834', '#1d203f', '#262a4c'],
    earth: ['#0e0b18', '#1a1424', '#251c30', '#31263c', '#423450'],
    earthShade: ['#09071a', '#120e1e', '#1a1426', '#211a2e', '#2a2238'],
    saw: ['#22191e', '#3e3032', '#564442', '#6e5852', '#86705e'],
    timber: ['#110c18', '#1f1728', '#2e2236', '#3e2f44', '#524258'],
    cloth: ['#07070f', '#0e0d1a', '#151424', '#1e1c32', '#2a2842'],
    iron: ['#0b0c1c', '#181a30', '#262944', '#373b5c', '#5a6088'],
    slate: ['#0b0c1d', '#14162c', '#1d203c', '#282c4e', '#3e4470'],
    moss: ['#121a20', '#1b2629', '#263334'],
    puddle: ['#141a36', '#2b3768', '#8a98c8'],
    haze: '#151b38',
    hazeK: 0.3,
    slope: 64,
    windows: true,
    seam: '#08071a',
    beyond: '#04040a',
  },
  // A STORM: slate and teal under black cloud; rain; the stone dark with wet; the light flat (no hard shadows)
  storm: {
    sky: ['#101418', '#13181d', '#171d22', '#1b2227', '#20282c', '#253032', '#2b3637', '#313d3d', '#384443', '#3f4b49'],
    cloud: ['#161c20', '#252e31', '#4c5a5a'],
    stone: ['#111619', '#1f272b', '#2c363a', '#3c484b', '#5a6869'],
    cobble: ['#0f1417', '#1c2427', '#283235', '#364245', '#566668'],
    cobbleShade: ['#0c1013', '#161c1f', '#1e2629', '#283134', '#323d40'],
    earth: ['#121315', '#1f1e20', '#2b2829', '#383333', '#4a4242'],
    earthShade: ['#0e0f11', '#171618', '#201e1f', '#2a2627', '#353030'],
    saw: ['#241f1c', '#3c332c', '#52463a', '#6a5a48', '#827058'],
    timber: ['#121012', '#211c1e', '#30282a', '#40363a', '#54484a'],
    cloth: ['#08090b', '#101215', '#181b1f', '#22262a', '#2e3438'],
    iron: ['#0d1013', '#1a1f24', '#283038', '#384450', '#566676'],
    slate: ['#0d1114', '#171d21', '#20282c', '#2b3539', '#425054'],
    moss: ['#1a2420', '#24322a', '#304234'],
    puddle: ['#1a2226', '#3a4a4c', '#9aacac'],
    haze: '#2a3436',
    hazeK: 0.45,
    slope: 0,
    windows: true,
    seam: '#0a0d12',
    beyond: '#050608',
  },
};

// =================================================================================================
// THE PLACE, in tiles (x down the screen to the right, y down to the left, as the game's)

/** The yard: x and y from 0 to N. */
export const N = 13;
/** The prison wall round it: how high (picture pixels), and its battlements. */
export const WALL_H = 150;
const MERLON_H = 24;
/** The tower in the far corner. */
export const TOWER = { x0: -2.6, y0: -2.6, x1: 0.4, y1: 0.4, h: 250 };
/** The arch the hero comes out of from the Crypt, in the wall along x (its face at y = 0): from x0 to x1. */
export const ARCH = { x0: 2.6, x1: 4.6, h: 104 };
/** The scaffold: its footprint and height; its steps down on its near (+y) side. */
export const SCAFFOLD = { x0: 4.8, y0: 3.8, x1: 8.2, y1: 7.0, h: 40, stepX0: 5.7, stepX1: 7.1, stepOut: 1.15 };
/** The gallows against the wall along x: its platform, and its two posts and beam. */
export const GALLOWS = { x0: 8.6, y0: 0.25, x1: 12.4, y1: 1.85, h: 34, top: 186, posts: [8.95, 12.05], postY: 1.05, nooses: [9.85, 10.55, 11.25] };

/** Where the hero and the Headsman stand. */
export const HERO_AT: [number, number] = [7.6, 9.0];
export const HEADSMAN_AT: [number, number] = [6.7, 4.7];

// =================================================================================================
// Helpers

const clampK = (k: number): number => Math.max(0, Math.min(4, k));
function hex(c: string): [number, number, number] {
  const n = parseInt(c.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function toHex(r: number, g: number, b: number): string {
  const f = (v: number): string => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${f(r)}${f(g)}${f(b)}`;
}
/** A colour `k` of the way to another. */
export function mixC(a: string, b: string, k: number): string {
  const [r0, g0, b0] = hex(a);
  const [r1, g1, b1] = hex(b);
  return toHex(r0 + (r1 - r0) * k, g0 + (g1 - g0) * k, b0 + (b1 - b0) * k);
}
const fadeR = (r: R5, to: string, k: number): R5 => r.map((c) => mixC(c, to, k)) as unknown as R5;
/** A smooth noise in 0..1 (value noise on a grid, eased between). */
function noise(x: number, y: number, k = 0): number {
  const i = Math.floor(x);
  const j = Math.floor(y);
  const fx = x - i;
  const fy = y - j;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const a = hash(i, j, k) + (hash(i + 1, j, k) - hash(i, j, k)) * sx;
  const b = hash(i, j + 1, k) + (hash(i + 1, j + 1, k) - hash(i, j + 1, k)) * sx;
  return a + (b - a) * sy;
}
const fbm = (x: number, y: number, k = 0): number => 0.55 * noise(x, y, k) + 0.3 * noise(x * 2.1, y * 2.1, k + 11) + 0.15 * noise(x * 4.3, y * 4.3, k + 23);

// =================================================================================================
// THE SKY, in bands, each band's edge broken by a step of two-pixel dither so no band is a hard line; clouds

export function paintSky(p: Px, look: Look, horizon: number): void {
  const P = PALS[look];
  const n = P.sky.length;
  const band = Math.max(8, horizon / n);
  // (below the horizon, the far land under the prison's crag: a line of dark hills, then the dark of beyond)
  const hills = (x: number): number => Math.round(horizon - 6 - 26 * fbm(x / 140, 0.5, 19) - 10 * fbm(x / 40, 2.5, 21)) & ~1;
  const land = [mixC(P.beyond, P.haze, 0.3), mixC(P.beyond, P.haze, 0.16)];
  for (let x = 0; x < p.w; x++) {
    const top = hills(x & ~1);
    for (let y = top; y < p.h; y++) p.set(x, y, y < top + 2 ? land[0] : y < horizon + 30 ? land[1] : P.beyond);
  }
  for (let y = 0; y < p.h; y++) {
    const f = y / band;
    let i = Math.min(n - 1, Math.floor(f));
    const into = f - i;
    for (let x = 0; x < p.w; x++) {
      if (y >= hills(x & ~1)) continue;
      // (the last quarter of a band: every other pair of pixels, in a checker of twos, the next band's)
      let k = i;
      if (into > 0.72 && i < n - 1 && ((x >> 1) + (y >> 1)) % 2 === 0) k = i + 1;
      p.set(x, y, P.sky[k]);
    }
  }
  // CLOUDS: long low banks, wider than tall, their undersides lit by the dawn (or the moon), drifting
  const [cShade, cBody, cLit] = P.cloud;
  const big = look === 'storm';
  for (let y = 0; y < horizon + 40 && y < p.h; y++) {
    for (let x = 0; x < p.w; x++) {
      if (y >= hills(x & ~1) - 2) continue;
      const u = x / (big ? 150 : 240);
      const v = y / (big ? 34 : 34);
      const d = fbm(u + v * 0.15, v, 7);
      const thick = big ? 0.5 : 0.6 - (y / horizon) * 0.04;
      if (d < thick) continue;
      // (a cloud's underside, toward the horizon, catches the light; its body; its top in shade)
      const below = fbm(u + (v + 0.1) * 0.15, v + 0.1, 7);
      const above = fbm(u + (v - 0.1) * 0.15, v - 0.1, 7);
      let c = cBody;
      if (below < thick) c = cLit;
      else if (above < thick && !big) c = cShade;
      else if (d > thick + 0.12) c = big ? cShade : cBody;
      // (only on whole pairs of pixels, crisp)
      if (((x & 1) === 0 && (y & 1) === 0) || p.get(x - (x & 1), y - (y & 1)) === c) p.set(x, y, c);
    }
  }
  // (and make every cloud pixel come in twos: copy each even pixel's colour to its pair)
  for (let y = 0; y < p.h; y += 2) for (let x = 0; x < p.w; x += 2) {
    const c = p.get(x, y);
    if (!c) continue;
    p.set(x + 1, y, c).set(x, y + 1, c).set(x + 1, y + 1, c);
  }
  if (look === 'storm') {
    // LIGHTNING far off: a forked bolt from the cloud down toward the hills, white at its heart, a pale violet edge; the
    // cloud round where it leaves lit
    const bolt = (x0: number, y0: number, len: number, seed: number, fork: boolean): void => {
      let x = x0;
      for (let y = y0; y < y0 + len; y += 2) {
        x += (hash(y, seed, 3) - 0.5) * 6;
        const X = Math.round(x) & ~1;
        p.set(X, y, '#f4f2ff').set(X + 1, y, '#f4f2ff').set(X, y + 1, '#f4f2ff').set(X + 1, y + 1, '#f4f2ff');
        p.set(X - 2, y, '#a8a4d8').set(X + 2, y, '#a8a4d8');
        if (fork && hash(y, seed, 5) > 0.93) bolt(X, y, Math.round(len * 0.35), seed + y, false);
      }
    };
    const bx = Math.round(p.w * 0.075);
    for (let y = 0; y < 70; y++) for (let x = -90; x < 90; x++) {
      const c = p.get(bx + x, y);
      if (c && Math.hypot(x / 90, (y - 10) / 60) < 1 && ((bx + x) >> 1) % 2 === ((y >> 1) % 2)) p.set(bx + x, y, mixC(c, '#8a96a8', 0.35));
    }
    bolt(bx, 18, horizon - 40, 11, true);
  }
  if (look === 'night') {
    // THE MOON, high in the upper left (where the light comes from), and stars
    const mx = Math.round(p.w * 0.355);
    const my = Math.round(horizon * 0.12);
    const R = 22;
    for (let y = -R - 10; y <= R + 10; y++) for (let x = -R - 10; x <= R + 10; x++) {
      const d = Math.hypot(x, y);
      const X = mx + x;
      const Y = my + y;
      if (d <= R) {
        // (its face: pale, its seas a step darker, lit from its upper left)
        const sea = fbm((x + 40) / 9, (y + 40) / 9, 3) > 0.58;
        const rim = x + y > R * 0.9;
        p.set(X, Y, rim ? '#9aa6c8' : sea ? '#b8c2dc' : '#dfe4f0');
      } else if (d <= R + 8 && ((X >> 1) + (Y >> 1)) % 2 === 0 && d <= R + 4 + 4 * hash(X >> 1, Y >> 1, 5)) {
        p.set(X, Y, '#2e3a68');
      }
    }
    for (let i = 0; i < 160; i++) {
      const x = Math.floor(hash(i, 1, 91) * p.w) & ~1;
      const y = Math.floor(hash(i, 2, 91) * horizon * 0.9) & ~1;
      if (Math.hypot(x - mx, y - my) < R + 12) continue;
      const c = hash(i, 3, 91) > 0.8 ? '#c8d0ec' : '#6a76a8';
      p.set(x, y, c).set(x + 1, y, c).set(x, y + 1, c).set(x + 1, y + 1, c);
    }
  }
}

// =================================================================================================
// STONE: the prison's ashlar, in courses; joints a seam deep, a block's top edge catching the light and its left edge too
// (on a face turned to the light); stains run down from the top; grime and moss at its foot

/** A face of dressed stone: `lit` for one turned to the light (toward the screen's left). `opening` cuts a hole (returns its colour or undefined). */
export function ashlar(r: R5, lit: boolean, seed: number, opening?: (u: number, v: number, w: number, h: number) => string | null | undefined, moss?: readonly [string, string, string]): SideShader {
  const CH = 12;
  return (u, v, w, h) => {
    if (opening) {
      const o = opening(u, v, w, h);
      if (o !== undefined) return o;
    }
    const c = Math.floor(v / CH);
    const lv = v % CH;
    const off = Math.floor(hash(c, seed, 1) * 40);
    const L = 24 + Math.floor(hash(c, seed, 2) * 14);
    const b = Math.floor((u + off) / L);
    const lu = (u + off) % L;
    if (lv === CH - 1 || lu === 0) return r[0];
    let k = lit ? 2 : 1;
    const tone = hash(b, c * 7 + seed, 3);
    if (tone < 0.1) k -= 1;
    else if (tone > 0.93) k += 1;
    if (lv === 0) k += 1;
    if (lit && lu === 1) k += 1;
    if (lv === CH - 2 || lu === L - 1) k -= 1;
    // (chips and wear: a few pixels in pairs a step darker)
    if (hash(u >> 1, v >> 1, seed + 5) < 0.025) k -= 1;
    // STAINS: rain-streaks running down from the top, longer here and there
    const col = u >> 1;
    const runs = hash(col, 0, seed + 9);
    if (runs < 0.07 && v < 24 + 70 * hash(col, 1, seed + 9) && hash(col, v >> 3, seed + 10) > 0.25) k -= 1;
    const fromFoot = h - 1 - v;
    if (fromFoot < 10) k -= 1;
    if (moss && fromFoot < 8 && hash(u >> 1, fromFoot >> 1, seed + 13) < 0.5 - fromFoot * 0.05) return moss[fromFoot < 3 ? 0 : fromFoot < 6 ? 1 : 2];
    return r[clampK(k)];
  };
}
/** The top of a wall: its flagstones, worn. */
export function flags(r: R5, seed: number): TopShader {
  return (u, v) => {
    const a = Math.floor(u * 9 + hash(Math.floor(v * 4), seed, 1) * 3);
    const b = Math.floor(v * 4);
    const fu = u * 9 + hash(b, seed, 1) * 3 - a;
    const fv = v * 4 - b;
    if (fu < 0.06 || fv < 0.1) return r[0];
    return r[hash(a, b, seed) > 0.75 ? 3 : 2];
  };
}

// =================================================================================================
// THE WALL ROUND THE YARD, ITS BATTLEMENTS, THE TOWER, THE ARCH

/** Battlements along a wall's top, on its outer edge: merlons `w` long with gaps between. */
function merlonsAlongX(iso: Iso, x0: number, x1: number, y0: number, y1: number, z: number, r: R5, seed: number): void {
  const W = 0.5;
  const G = 0.32;
  for (let x = x0; x < x1 - 0.1; x += W + G) {
    const xe = Math.min(x1, x + W);
    iso.box(x, y0, xe, y1, z, z + MERLON_H, { top: () => r[3], left: ashlar(r, true, seed + Math.round(x * 10)), right: ashlar(r, false, seed + 7) });
  }
}
function merlonsAlongY(iso: Iso, x0: number, x1: number, y0: number, y1: number, z: number, r: R5, seed: number): void {
  const W = 0.5;
  const G = 0.32;
  // (drawn far to near: from the far end, where y is least)
  for (let y = y0; y < y1 - 0.1; y += W + G) {
    const ye = Math.min(y1, y + W);
    iso.box(x0, y, x1, ye, z, z + MERLON_H, { top: () => r[3], left: ashlar(r, true, seed + 3), right: ashlar(r, false, seed + Math.round(y * 10)) });
  }
}

/** THE ARCH out of the Crypt, in the wall along x: a round-headed opening, its ring of wedge stones, the dark of the passage, the portcullis drawn up into its slot. */
function archOpening(P: Pal, wx0: number): (u: number, v: number, w: number, h: number) => string | null | undefined {
  const a0 = (ARCH.x0 - wx0) * ISO_X;
  const a1 = (ARCH.x1 - wx0) * ISO_X;
  const half = (a1 - a0) / 2;
  const cx = (a0 + a1) / 2;
  const springs = ARCH.h - half; // from the foot, where the round head begins
  return (u, v, _w, h) => {
    const up = h - 1 - v; // height above the ground
    const du = u - cx;
    if (Math.abs(du) > half + 10 || up > ARCH.h + 10) return undefined;
    // (where the round head is: inside, how far in from its edge)
    const r = up > springs ? Math.hypot(du, (up - springs) * 1.0) : Math.abs(du);
    const inside = up <= springs ? Math.abs(du) < half : r < half;
    if (inside) {
      // THE PORTCULLIS, drawn up: its bars' pointed feet hanging a little below the head
      const bar = ((u - Math.round(a0)) % 10 + 10) % 10;
      const head = up > springs ? springs + Math.sqrt(Math.max(0, half * half - du * du)) : ARCH.h;
      if (head - up < 14 && bar <= 1) return head - up > 11 && bar === 1 ? P.iron[1] : P.iron[bar === 0 ? 3 : 2];
      if (head - up < 3) return P.iron[1];
      // (the dark of the passage, a little less dark at its foot where its floor runs in)
      if (up < 8) return up < 3 ? P.stone[1] : P.stone[0];
      return P.beyond;
    }
    // THE RING OF WEDGE STONES round the head, and the jambs: a band 10 wide
    if (r < half + 10 && up > 0) {
      const ang = up > springs ? Math.atan2(up - springs, du) : du < 0 ? Math.PI : 0;
      const seg = Math.floor(ang / (Math.PI / 9));
      const edge = Math.abs(ang / (Math.PI / 9) - Math.round(ang / (Math.PI / 9))) < 0.06 || r > half + 8.5;
      if (up <= springs) {
        // the jambs: blocks one above another
        const course = Math.floor(up / 14);
        if (up % 14 === 0) return P.stone[0];
        return r < half + 1.5 ? P.stone[du < 0 ? 4 : 1] : P.stone[course % 2 ? 2 : 3];
      }
      if (edge) return P.stone[0];
      return r < half + 1.5 ? P.stone[4] : P.stone[seg % 2 ? 3 : 2];
    }
    return undefined;
  };
}

/** BEYOND THE WALL: the prison's cell block (behind the wall along y) and its keep (behind the wall along x), faded toward the sky. */
export function paintBeyond(iso: Iso, look: Look): void {
  const P = PALS[look];
  const f = (r: R5): R5 => fadeR(r, P.haze, P.hazeK);
  const stone = f(P.stone);
  const slate = f(P.slate);
  // THE KEEP, behind the wall along x: a tall block, its gable roof's ridge along x, a bell turret, slit windows
  const K = { x0: 3.4, y0: -7.6, x1: 10.2, y1: -3.2, h: 236, ridge: 318 };
  const winK = (u: number, v: number, _w: number, h: number): string | null | undefined => {
    // tall windows in a row under the eaves, round-headed, a stone mullion down each; a lit one here and there
    const col = Math.floor(u / 44);
    const uu = (u % 44) - 22;
    const up = h - 1 - v;
    const top = 200 - Math.max(0, uu * uu - 16) * 0;
    if (Math.abs(uu) <= 7 && up > 148 && up < top) {
      const head = up > 192 ? Math.hypot(uu, up - 192) > 7 : false;
      if (head) return undefined;
      if (Math.abs(uu) === 7 || up === 149) return stone[0];
      if (uu === 0 || uu === -1) return stone[2];
      const litW = P.windows && hash(col, 1, 41) > 0.5;
      if (!litW) return P.seam;
      return up < 156 || Math.abs(uu) > 4 ? '#a8502a' : '#e07a36';
    }
    // (a sill under each)
    if (Math.abs(uu) <= 9 && up >= 145 && up <= 148) return up === 148 ? stone[3] : stone[1];
    return undefined;
  };
  iso.box(K.x0, K.y0, K.x1, K.y1, 0, K.h, { top: () => slate[1], left: ashlar(stone, true, 61, winK), right: ashlar(stone, false, 62) });
  // (its roof: the slope toward us, lit, from the eave up to the ridge; slates in rows)
  const ridgeY = (K.y0 + K.y1) / 2;
  iso.slopeLeft(K.x0 - 0.1, K.x1 + 0.1, K.y1 + 0.15, K.h - 4, K.x0 - 0.1, K.x1 + 0.1, ridgeY, K.ridge, (t, s) => {
    const row = Math.floor(t * 14);
    const into = t * 14 - row;
    if (into < 0.12) return slate[0];
    const cell = Math.floor(s * 46 + (row % 2) * 0.5);
    return hash(cell, row, 43) > 0.85 ? slate[3] : t > 0.92 ? slate[4] : slate[2];
  });
  // (its gable end, at x1, in shade: a side of the box from y0 to y1, its top cut to the roof's line)
  iso.right(K.x1, K.y0, K.y1, K.h, K.ridge, (u, v, w, h) => {
    const up = h - 1 - v;
    const half = w / 2;
    const reach = (1 - Math.abs(u - half) / half) * (K.ridge - K.h);
    if (up > reach) return null;
    return ashlar(stone, false, 63)(u, v, w, h, 0, 0);
  });
  // A BELL TURRET on the ridge, its open arch black, its little spire
  const bx = 8.4;
  iso.box(bx - 0.45, ridgeY - 0.45, bx + 0.45, ridgeY + 0.45, K.ridge - 30, K.ridge + 40, {
    top: () => slate[2],
    left: (u, v, w, h) => (u > 6 && u < w - 6 && v > 10 && v < h - 18 ? (v < 14 ? stone[1] : P.beyond) : ashlar(stone, true, 64)(u, v, w, h, 0, 0)),
    right: ashlar(stone, false, 65),
  });
  iso.slopeLeft(bx - 0.5, bx + 0.5, ridgeY + 0.5, K.ridge + 40, bx, bx, ridgeY, K.ridge + 96, (t) => (t > 0.9 ? slate[4] : slate[2]));
  iso.slopeRight(bx + 0.5, ridgeY - 0.5, ridgeY + 0.5, K.ridge + 40, bx, ridgeY, ridgeY, K.ridge + 96, () => slate[1]);

  // THE CELL BLOCK, behind the wall along y: long and lower, rows of small barred windows, chimneys on its ridge
  const C = { x0: -8.2, y0: 1.6, x1: -2.8, y1: 12.4, h: 196, ridge: 262 };
  const winC = (u: number, v: number, _w: number, h: number): string | null | undefined => {
    const col = Math.floor(u / 22);
    const uu = u % 22;
    const up = h - 1 - v;
    for (const row of [128, 164]) {
      if (uu >= 7 && uu < 15 && up > row && up < row + 14) {
        if (uu === 7 || up === row + 13) return stone[0];
        if (uu === 10 || uu === 12) return stone[3];
        const litW = P.windows && hash(col, row, 47) > 0.86;
        return litW ? '#c46a30' : P.seam;
      }
    }
    return undefined;
  };
  iso.box(C.x0, C.y0, C.x1, C.y1, 0, C.h, { top: () => slate[1], left: ashlar(stone, true, 66), right: ashlar(stone, false, 67, winC) });
  const ridgeX = (C.x0 + C.x1) / 2;
  // (its roof: the slope toward us faces right, in shade)
  iso.slopeRight(C.x1 + 0.15, C.y0 - 0.1, C.y1 + 0.1, C.h - 4, ridgeX, C.y0 - 0.1, C.y1 + 0.1, C.ridge, (t, s) => {
    const row = Math.floor(t * 12);
    if (t * 12 - row < 0.12) return slate[0];
    const cell = Math.floor(s * 60 + (row % 2) * 0.5);
    return hash(cell, row, 45) > 0.85 ? slate[2] : t > 0.92 ? slate[3] : slate[1];
  });
  // (its gable end at y1, lit)
  iso.left(C.x0, C.x1, C.y1, C.h, C.ridge, (u, v, w, h) => {
    const up = h - 1 - v;
    const half = w / 2;
    const reach = (1 - Math.abs(u - half) / half) * (C.ridge - C.h);
    if (up > reach) return null;
    return ashlar(stone, true, 68)(u, v, w, h, 0, 0);
  });
  // CHIMNEYS on its ridge
  for (const cy of [3.6, 7.0, 10.4]) {
    iso.box(ridgeX - 0.3, cy - 0.3, ridgeX + 0.3, cy + 0.3, C.ridge - 20, C.ridge + 34, { top: () => stone[0], left: ashlar(stone, true, 69), right: ashlar(stone, false, 70) });
  }
}

/** THE WALL ROUND THE YARD: along x (its face at y = 0, toward the light) with the arch in it, and along y (its face at x = 0, in shade); the tower in the corner. */
export function paintWalls(iso: Iso, look: Look): void {
  const P = PALS[look];
  const S = P.stone;
  // (the tower first: it is the farthest)
  const T = TOWER;
  iso.box(T.x0, T.y0, T.x1, T.y1, 0, T.h, {
    top: flags(S, 71),
    left: ashlar(S, true, 72, (u, v, w, h) => {
      // arrow slits, one above another
      const up = h - 1 - v;
      const mid = Math.round(w * 0.55);
      for (const at of [120, 190]) if (Math.abs(u - mid) <= 1 && up > at && up < at + 26) return u === mid - 1 ? S[1] : P.beyond;
      return undefined;
    }, P.moss),
    right: ashlar(S, false, 73, (u, v, w, h) => {
      const up = h - 1 - v;
      const mid = Math.round(w * 0.45);
      if (Math.abs(u - mid) <= 1 && up > 160 && up < 186) return P.beyond;
      return undefined;
    }, P.moss),
  });
  // its battlements: on all four edges of its top (the far ones first)
  merlonsAlongX(iso, T.x0, T.x1, T.y0, T.y0 + 0.3, T.h, S, 74);
  merlonsAlongY(iso, T.x0, T.x0 + 0.3, T.y0 + 0.3, T.y1, T.h, S, 75);
  merlonsAlongY(iso, T.x1 - 0.3, T.x1, T.y0 + 0.3, T.y1, T.h, S, 76);
  merlonsAlongX(iso, T.x0 + 0.3, T.x1 - 0.3, T.y1 - 0.3, T.y1, T.h, S, 77);
  // (the wall along x, from the tower out: its walk on top, its battlements on its far edge)
  iso.box(T.x1, -1, N + 1, 0, 0, WALL_H, { top: flags(S, 79), left: ashlar(S, true, 80, archOpening(P, T.x1), P.moss), right: ashlar(S, false, 81) });
  merlonsAlongX(iso, T.x1, N + 1, -1, -0.7, WALL_H, S, 78);
  // (the wall along y, then its battlements on its far edge)
  iso.box(-1, T.y1, 0, N + 1, 0, WALL_H, { top: flags(S, 83), left: ashlar(S, true, 84), right: ashlar(S, false, 85, undefined, P.moss) });
  merlonsAlongY(iso, -1, -0.7, T.y1, N + 1, WALL_H, S, 82);
}

// =================================================================================================
// LIGHT AND SHADOW: what stands between a spot of the yard and the light (the dawn, or the moon) throws its shadow on it,
// long; and at night the torches and braziers throw pools of their orange round them, in two bands (no soft gradient)

/** Something that throws a shadow: a box over the floor, from `lo` to `hi` (picture pixels up). */
export interface Blocker { x0: number; y0: number; x1: number; y1: number; lo: number; hi: number }
/** A light that burns: where, how high, how far its light reaches (tiles). */
export interface Lamp { x: number; y: number; z: number; r: number }

export function blockers(): Blocker[] {
  const S = SCAFFOLD;
  const G = GALLOWS;
  const T = TOWER;
  const out: Blocker[] = [
    { x0: T.x0, y0: T.y0, x1: T.x1, y1: T.y1, lo: 0, hi: T.h + MERLON_H },
    { x0: -1, y0: T.y1, x1: 0, y1: N + 1, lo: 0, hi: WALL_H + MERLON_H * 0.6 },
    { x0: -8.2, y0: 1.6, x1: -2.8, y1: 12.4, lo: 0, hi: 230 },
    { x0: S.x0, y0: S.y0, x1: S.x1, y1: S.y1, lo: 0, hi: S.h },
    { x0: G.x0, y0: G.y0, x1: G.x1, y1: G.y1, lo: 0, hi: G.h },
    { x0: G.posts[0] - 0.4, y0: G.postY - 0.05, x1: G.posts[1] + 0.4, y1: G.postY + 0.2, lo: G.top - 14, hi: G.top },
  ];
  for (const px of G.posts) out.push({ x0: px - 0.12, y0: G.postY - 0.12, x1: px + 0.12, y1: G.postY + 0.12, lo: 0, hi: G.top });
  return out;
}
/** Whether a spot of the floor (at height `z`) is in shadow: walking back toward the light, along (-1, +1), rising `slope` a tile. */
export function shadowed(x: number, y: number, z: number, slope: number, bs: readonly Blocker[]): boolean {
  if (slope <= 0) return false;
  for (const b of bs) {
    // (the stretch of the walk back, t from 0, that is over the box: x - t in [x0, x1], y + t in [y0, y1])
    const t0 = Math.max(0, x - b.x1, b.y0 - y);
    const t1 = Math.min(x - b.x0, b.y1 - y);
    if (t0 > t1) continue;
    // (the walk is at z + t·slope there: under the box's top and over its foot somewhere along it)
    if (z + t0 * slope < b.hi && z + t1 * slope > b.lo) return true;
  }
  return false;
}
export function lamps(look: Look): Lamp[] {
  if (look === 'night') {
    return [
      { x: 1.6, y: 0.05, z: 92, r: 1.5 }, { x: 5.6, y: 0.05, z: 92, r: 1.5 }, { x: 7.7, y: 0.05, z: 92, r: 1.4 },
      { x: 0.05, y: 3.8, z: 92, r: 1.5 }, { x: 0.05, y: 8.0, z: 92, r: 1.5 }, { x: 0.05, y: 11.6, z: 92, r: 1.4 },
      { x: 3.9, y: 8.7, z: 30, r: 2.0 }, { x: 10.1, y: 8.3, z: 30, r: 2.0 },
    ];
  }
  if (look === 'storm') return [{ x: 2.3, y: 0.05, z: 80, r: 1.3 }, { x: 4.9, y: 0.05, z: 80, r: 1.3 }];
  return [];
}
/** How lit a spot is by the lamps: 0 none, 1 the outer band, 2 the inner. */
export function warmth(x: number, y: number, ls: readonly Lamp[]): number {
  let best = 0;
  for (const l of ls) {
    const d = Math.hypot(x - l.x, y - l.y) / l.r;
    // (each band's edge broken a little so no circle reads)
    const e = d + (hash(Math.floor(x * 9), Math.floor(y * 9), 31) - 0.5) * 0.08;
    if (e < 0.5) best = 2;
    else if (e < 1) best = Math.max(best, 1);
  }
  return best;
}
/** A colour warmed by a lamp's light, `k` bands of it. */
export const warm = (c: string, k: number): string => (k <= 0 ? c : mixC(c, k >= 2 ? '#f0a050' : '#d07838', k >= 2 ? 0.34 : 0.17));

// =================================================================================================
// THE YARD'S GROUND: cobbles, set close and rounded, each lit on its upper left; worn to beaten earth round the scaffold
// and along the way from the arch; sawdust at the scaffold's steps; old puddles holding the sky; a gutter of stone along the
// wall's foot; weeds where the wall meets the ground

interface Puddle { x: number; y: number; rx: number; ry: number }
export function puddles(look: Look): Puddle[] {
  const k = look === 'storm' ? 1.45 : 1;
  const ps: Puddle[] = [
    { x: 2.5, y: 6.0, rx: 0.95 * k, ry: 0.6 * k },
    { x: 10.8, y: 6.6, rx: 1.15 * k, ry: 0.7 * k },
    { x: 4.6, y: 11.2, rx: 0.8 * k, ry: 0.5 * k },
    { x: 11.6, y: 11.0, rx: 0.6 * k, ry: 0.45 * k },
  ];
  if (look === 'storm') ps.push({ x: 7.8, y: 9.0, rx: 0.7, ry: 0.45 }, { x: 1.4, y: 9.6, rx: 0.6, ry: 0.5 });
  return ps;
}
function inPuddle(x: number, y: number, ps: readonly Puddle[]): number {
  let best = 9;
  for (const p of ps) {
    const d = Math.hypot((x - p.x) / p.rx, (y - p.y) / p.ry) + (fbm(x * 3, y * 3, 51) - 0.5) * 0.45;
    best = Math.min(best, d);
  }
  return best;
}
/** How worn to earth a spot is (above 0.5: earth). */
function worn(x: number, y: number): number {
  const S = SCAFFOLD;
  const cx = (S.x0 + S.x1) / 2;
  const cy = (S.y0 + S.y1) / 2;
  const round = 1 - Math.hypot((x - cx) / 2.9, (y - cy) / 2.9);
  // (the way trodden from the arch to the scaffold, and on toward the near side)
  const ax = (ARCH.x0 + ARCH.x1) / 2;
  const t = Math.max(0, Math.min(1, (y - 0) / (cy - 0)));
  const px = ax + (cx - ax) * t;
  const path = y < cy ? 1 - Math.abs(x - px) / 0.95 : 0;
  // (and under the gallows, where they stood to watch)
  const watch = 1 - Math.hypot((x - 10.5) / 2.4, (y - 2.6) / 1.2);
  return Math.max(round, path, watch) + (fbm(x * 1.6, y * 1.6, 53) - 0.5) * 0.6;
}

export function paintGround(iso: Iso, look: Look): void {
  const P = PALS[look];
  const bs = blockers();
  const ls = lamps(look);
  const ps = puddles(look);
  const S = SCAFFOLD;
  const CS = 0.3; // a cobble's size, in tiles
  // the light comes from (-1, +1): a stone is lit on that side of it
  const LX = -Math.SQRT1_2;
  const LY = Math.SQRT1_2;
  iso.top(0, 0, N, N, 0, (u, v) => {
    const x = u * N;
    const y = v * N;
    const shade = shadowed(x, y, 0, P.slope, bs);
    const heat = warmth(x, y, ls);
    const W = (c: string): string => warm(c, heat);
    // (the foot of the walls: a band in their shade whatever the light)
    const nearWall = Math.min(x, y);
    // THE GUTTER along the wall along y: a channel of stone with dark water in it
    if (x < 0.34) {
      if (x < 0.06 || x > 0.3) return W(P.stone[0]);
      const wet = (Math.floor(y * 8) + Math.floor(x * 20)) % 7 === 0;
      return W(x < 0.12 ? P.stone[1] : wet ? P.puddle[1] : P.puddle[0]);
    }
    // PUDDLES: the sky in them; a dark wet rim; a bright edge on their far side (where the sky is brightest)
    const pd = inPuddle(x, y, ps);
    if (pd < 1) {
      if (pd > 0.86) return W(P.earth[0]);
      const far = (x + y) % 1;
      void far;
      // (the sky's light caught on the far edge; the body; a streak of reflected brightness)
      if (pd > 0.7 && hash(Math.floor(x * 30), Math.floor(y * 30), 55) > 0.3) return P.puddle[(x - y) > 0 ? 1 : 0];
      const streak = Math.abs(((x - y) * 2.2) % 1) < 0.08;
      return streak ? P.puddle[2] : P.puddle[look === 'night' ? 0 : 1];
    }
    if (pd < 1.12) return W((shade ? P.earthShade : P.earth)[1]);
    // SAWDUST at the foot of the scaffold's steps, spread thin
    const sd = Math.hypot((x - (S.stepX0 + S.stepX1) / 2) / 1.5, (y - (S.y1 + S.stepOut + 0.4)) / 0.9) + (fbm(x * 4, y * 4, 57) - 0.5) * 0.5;
    const R = shade ? P.earthShade : P.earth;
    const C = shade ? P.cobbleShade : P.cobble;
    if (sd < 1) {
      const fleck = hash(Math.floor(x * 32), Math.floor(y * 32), 59);
      return W(fleck > 0.55 ? P.saw[shade ? 2 : 3] : fleck > 0.2 ? P.saw[shade ? 1 : 2] : R[2]);
    }
    // THE COBBLES: the nearest of the stones (each set a little off its place on the grid)
    const gi = Math.floor(x / CS);
    const gj = Math.floor(y / CS);
    let d1 = 9;
    let d2 = 9;
    let ci = 0;
    let cj = 0;
    let cx = 0;
    let cy = 0;
    for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) {
      const i = gi + a;
      const j = gj + b;
      const fx = (i + 0.2 + 0.6 * hash(i, j, 61)) * CS;
      const fy = (j + 0.2 + 0.6 * hash(i, j, 62)) * CS;
      const d = Math.hypot(x - fx, y - fy);
      if (d < d1) {
        d2 = d1;
        d1 = d;
        ci = i;
        cj = j;
        cx = fx;
        cy = fy;
      } else if (d < d2) d2 = d;
    }
    const wornK = worn(x, y);
    const earth = wornK > 0.5;
    // (a cobble half sunk in the earth where it is worn: only the biggest show)
    if (earth) {
      if (wornK < 0.62 && d2 - d1 > 0.05 && hash(ci, cj, 63) > 0.45) {
        // a stone in the earth
      } else {
        const fleck = hash(Math.floor(x * 24), Math.floor(y * 24), 65);
        const rut = fbm(x * 2.5, y * 2.5, 67);
        let k = rut > 0.62 ? 1 : 2;
        if (fleck > 0.93) k = 3;
        else if (fleck < 0.05) k = 0;
        return W(R[k]);
      }
    }
    // the joint between stones: dirt, and here and there a blade of grass in it
    if (d2 - d1 < 0.036) {
      if (hash(ci * 3 + cj, Math.floor((x + y) * 20), 69) > 0.93 && nearWall > 1) return W(P.moss[1]);
      return W(C[0]);
    }
    // (lit on its upper left, in shade on its lower right; a stone darker or lighter than the next)
    const ex = (x - cx) / Math.max(0.06, d1);
    const ey = (y - cy) / Math.max(0.06, d1);
    const toLight = ex * LX + ey * LY;
    const edge = d1 / (d1 + (d2 - d1)) > 0.62;
    let k = 2;
    const tone = hash(ci, cj, 71);
    if (tone < 0.18) k = 1;
    else if (tone > 0.9) k = 3;
    if (edge && toLight > 0.35) k += 1;
    if (edge && toLight < -0.35) k -= 1;
    // (wet stones in the dawn and the storm catch the sky on their lit edge)
    if (look !== 'night' && edge && toLight > 0.6 && hash(ci, cj, 73) > 0.6) k = 4;
    if (nearWall < 0.7) k -= 1;
    return W(C[clampK(k)]);
  });
  // WEEDS where the walls meet the ground: tufts of blades, two pixels wide
  const P2 = P.moss;
  for (let i = 0; i < 70; i++) {
    const along = hash(i, 1, 75) * N;
    const onX = i % 2 === 0;
    const off = 0.36 + hash(i, 2, 75) * 0.25;
    const [sx, sy] = onX ? iso.at(along, off) : iso.at(off + 0.3, along);
    const tall = 4 + Math.floor(hash(i, 3, 75) * 6);
    for (let b = 0; b < 3; b++) {
      const bx = Math.round(sx) + (b - 1) * 3;
      const lean = b - 1;
      for (let t = 0; t < tall - b; t++) {
        const X = bx + Math.round((lean * t) / 4);
        const Y = Math.round(sy) - t;
        iso.p.set(X, Y, P2[t > tall - 3 ? 2 : 1]);
      }
    }
  }
}

// =================================================================================================
// THE SCAFFOLD: a platform of planks on a frame of posts and cross-braces, draped in black along its two seen sides, its
// steps down on its near side; the block stands on it (a piece of the floor's own, set on it as the game sets a prop)

/** Planks running along x: their seams, their nails, an old stain here and there (a dull wine, never gore). */
function planksX(r: R5, seed: number, stains: boolean, x0: number, y0: number, x1: number, y1: number): TopShader {
  return (u, v) => {
    const x = x0 + u * (x1 - x0);
    const y = y0 + v * (y1 - y0);
    const board = Math.floor(y / 0.22);
    const along = x + hash(board, 0, seed) * 3;
    const cut = Math.floor(along / 1.6);
    const fv = y / 0.22 - board;
    const fu = along / 1.6 - cut;
    if (fv < 0.12) return r[0];
    if (fu < 0.03) return r[0];
    if ((fu < 0.07 || fu > 0.95) && fv > 0.4 && fv < 0.62) return r[4];
    if (stains && fbm(x * 2.2, y * 2.2, seed + 3) > 0.66) return fv > 0.85 ? '#2a1420' : '#3c1a26';
    const grain = hash(Math.floor(along * 18), board, seed + 1) > 0.88;
    return r[grain ? 1 : fv < 0.3 ? 3 : 2];
  };
}
/** A face of upright boards (the scaffold's and the gallows' sides). */
function boardsUp(r: R5, lit: boolean, seed: number): SideShader {
  return (u, v, _w, h) => {
    const b = Math.floor(u / 7);
    const lu = u % 7;
    if (lu === 0 || v === h - 1) return r[0];
    let k = lit ? 2 : 1;
    if (v === 0) k += 1;
    if (lit && lu === 1) k += 1;
    if (hash(b, Math.floor(v / 3), seed) > 0.9) k -= 1;
    return r[clampK(k)];
  };
}
/** The black drape: hanging in folds from the platform's edge, its foot cut in swags. */
function drape(P: Pal, lit: boolean, depth: number, seed: number): SideShader {
  const r = P.cloth;
  return (u, v, w, h) => {
    // (swags: the drape's foot rises between the posts where it hangs looped)
    const swag = 10;
    const ph = ((u % (swag * 4)) / (swag * 4)) * Math.PI * 2;
    const foot = depth - Math.round(Math.abs(Math.sin(ph / 2)) * 7);
    if (v > foot) return null;
    // (folds: a lit crest and a shaded trough, again and again across it)
    const f = (u + Math.round(v * 0.2)) % 12;
    let k = lit ? 2 : 1;
    if (f < 2) k += 1;
    else if (f > 8) k -= 1;
    if (v === 0) k = lit ? 4 : 3;
    if (v >= foot - 1) k -= 1;
    void w;
    void h;
    void seed;
    return r[clampK(k)];
  };
}
export function paintScaffold(iso: Iso, look: Look): void {
  const P = PALS[look];
  const S = SCAFFOLD;
  const T = P.timber;
  const ls = lamps(look);
  // (lit at night by the braziers near it: its near faces a band warmer)
  const heat = Math.max(warmth(S.x1, S.y1 + 1, ls), warmth(S.x0, S.y1 + 1, ls)) > 0 ? 1 : 0;
  const Tw = T.map((c) => warm(c, heat)) as unknown as R5;
  // THE FRAME under the platform: dark between its posts, posts at its corners and between, cross-braces
  const under = (lit: boolean): SideShader => (u, v, w, h) => {
    const posts = Math.round(w / 3);
    const lu = u % posts;
    if (lu < 4 || u > w - 4) return Tw[lit && lu < 2 ? 3 : 2];
    // the cross-brace: two diagonals between each pair of posts
    const t = lu / posts;
    const d1 = Math.abs(v / h - t);
    const d2 = Math.abs(v / h - (1 - t));
    if (d1 < 0.06 || d2 < 0.06) return Tw[lit ? 2 : 1];
    return P.seam;
  };
  iso.box(S.x0, S.y0, S.x1, S.y1, 0, S.h, { top: planksX(Tw, 81, true, S.x0, S.y0, S.x1, S.y1), left: under(true), right: under(false) });
  // THE DRAPE, over the frame's top, on its two seen sides
  iso.left(S.x0, S.x1, S.y1, S.h - 26, S.h, drape(P, true, 26, 83));
  iso.right(S.x1, S.y0, S.y1, S.h - 26, S.h, drape(P, false, 26, 84));
  // ITS STEPS, down on its near side: three, each lower than the last (far to near)
  const rise = S.h / 4;
  const run = S.stepOut / 3;
  for (let i = 0; i < 3; i++) {
    const top = S.h - rise * (i + 1);
    iso.box(S.stepX0, S.y1 + run * i, S.stepX1, S.y1 + run * (i + 1), 0, top, {
      top: planksX(Tw, 85 + i, false, S.stepX0, 0, S.stepX1, 1),
      left: boardsUp(Tw, true, 86 + i),
      right: boardsUp(Tw, false, 87 + i),
    });
  }
}

// =================================================================================================
// THE GALLOWS: a long platform against the wall, its trapdoors under three nooses, two great posts and a beam over them
// braced at each end; its steps up at its near side

/** A rope or a brace drawn as a line two pixels wide between two points of the world. */
function bar(iso: Iso, a: [number, number, number], b: [number, number, number], c: string, c2: string, wide = 2): void {
  const [x0, y0] = iso.at(a[0], a[1], a[2]);
  const [x1, y1] = iso.at(b[0], b[1], b[2]);
  const n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
  for (let i = 0; i <= n; i++) {
    const X = Math.round(x0 + ((x1 - x0) * i) / n);
    const Y = Math.round(y0 + ((y1 - y0) * i) / n);
    for (let k = 0; k < wide; k++) iso.p.set(X + k, Y, k === 0 ? c : c2);
  }
}
export function paintGallows(iso: Iso, look: Look): void {
  const P = PALS[look];
  const G = GALLOWS;
  const T = P.timber;
  const ls = lamps(look);
  const heat = warmth((G.x0 + G.x1) / 2, G.y1 + 0.6, ls) > 0 ? 1 : 0;
  const Tw = T.map((c) => warm(c, heat)) as unknown as R5;
  // THE PLATFORM: its trapdoors under the nooses (a seam round each, an iron hinge)
  const top = planksX(Tw, 91, false, G.x0, G.y0, G.x1, G.y1);
  iso.box(G.x0, G.y0, G.x1, G.y1, 0, G.h, {
    top: (u, v) => {
      const x = G.x0 + u * (G.x1 - G.x0);
      const y = G.y0 + v * (G.y1 - G.y0);
      for (const nx of G.nooses) {
        const dx = Math.abs(x - nx);
        const dy = Math.abs(y - (G.postY + 0.1));
        if (dx < 0.3 && dy < 0.3) {
          if (dx > 0.26 || dy > 0.26) return P.seam;
          if (dx < 0.05 && dy > 0.2) return P.iron[3];
        }
      }
      return top(u, v);
    },
    left: boardsUp(Tw, true, 92),
    right: boardsUp(Tw, false, 93),
  });
  // THE POSTS and THE BEAM
  const ironish = Tw;
  for (const px of G.posts) {
    iso.box(px - 0.12, G.postY - 0.12, px + 0.12, G.postY + 0.12, G.h, G.top, {
      top: () => Tw[3],
      left: boardsUp(Tw, true, 94),
      right: boardsUp(Tw, false, 95),
    });
  }
  iso.box(G.posts[0] - 0.35, G.postY - 0.11, G.posts[1] + 0.35, G.postY + 0.11, G.top - 14, G.top, {
    top: () => Tw[3],
    left: boardsUp(Tw, true, 96),
    right: boardsUp(Tw, false, 97),
  });
  // (braces from each post up to the beam)
  bar(iso, [G.posts[0] + 0.12, G.postY + 0.12, G.top - 54], [G.posts[0] + 0.85, G.postY + 0.12, G.top - 14], ironish[3], ironish[1], 3);
  bar(iso, [G.posts[1] - 0.12, G.postY + 0.12, G.top - 54], [G.posts[1] - 0.85, G.postY + 0.12, G.top - 14], ironish[3], ironish[1], 3);
  // THE NOOSES: a rope down from the beam, its loop, the knot's coils
  const rope = [P.saw[1], P.saw[2], P.saw[3]];
  for (const nx of G.nooses) {
    const ny = G.postY + 0.1;
    const zTop = G.top - 14;
    const zKnot = G.top - 62;
    bar(iso, [nx, ny, zTop], [nx, ny, zKnot], rope[2], rope[1], 2);
    const [kx, ky] = iso.at(nx, ny, zKnot);
    // the knot's coils
    for (let c = 0; c < 4; c++) for (let k = -1; k <= 2; k++) iso.p.set(Math.round(kx) + k, Math.round(ky) + c * 2, c % 2 ? rope[0] : rope[2]);
    // the loop
    const lx = Math.round(kx) + 1;
    const ly = Math.round(ky) + 18;
    for (let a = 0; a < 64; a++) {
      const t = (a / 64) * Math.PI * 2;
      const X = Math.round(lx + Math.cos(t) * 6);
      const Y = Math.round(ly + Math.sin(t) * 9);
      iso.p.set(X, Y, Math.cos(t) < -0.2 ? rope[2] : rope[1]);
      iso.p.set(X + 1, Y, rope[0]);
    }
  }
  // ITS STEPS up at its near side
  const sx0 = 10.0;
  const sx1 = 10.9;
  for (let i = 0; i < 3; i++) {
    iso.box(sx0, G.y1 + 0.28 * i, sx1, G.y1 + 0.28 * (i + 1), 0, G.h - (G.h / 4) * (i + 1), {
      top: planksX(Tw, 98 + i, false, sx0, 0, sx1, 1),
      left: boardsUp(Tw, true, 99),
      right: boardsUp(Tw, false, 100),
    });
  }
}

/** THE WALLS TOWARD THE EYE, left out as the game leaves them out: cut down to a low course, their cut tops lit. */
export function paintNearWalls(iso: Iso, look: Look): void {
  const P = PALS[look];
  const S = P.stone;
  const cut: TopShader = (u, v) => (hash(Math.floor(u * 40), Math.floor(v * 40), 101) > 0.8 ? S[3] : S[4]);
  iso.box(N, -1, N + 1, N + 1, 0, 16, { top: cut, left: ashlar(S, true, 102), right: ashlar(S, false, 103) });
  iso.box(-1, N, N, N + 1, 0, 16, { top: cut, left: ashlar(S, true, 104), right: ashlar(S, false, 105) });
}

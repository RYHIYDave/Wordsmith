// The pictures on the attack buttons: one for each of the twelve attacks.
//
// Painted at the heroes' grain (the owner, 6 Oct 2026, 23:03: "need some updated icons.  the trap
// is a glaring weakness."; and 7 Oct, 00:34: "redo the icons"): two picture pixels to a game
// pixel, so thirty-two by thirty-two of them in the sixteen game pixels a button's slot gives; in
// the heroes' own colours (art/kit.ts) and their manner: flat tones, three to a material, the light
// from the upper left, the style's dark seam between one part and the next. What glows on a friend
// is cyan (the warrior's blade and what it leaves in the air, where a leap comes down, the trap's
// plate); the mage's magic is the violet it is drawn in when it is cast (art/spells.ts).
//
// Up to Version 15 they were sixteen by sixteen grids of single game pixels (icons.ts keeps those
// painters for the before-and-after picture: abilityIconsWas), and Leap and Warp shared one boot.
// Every attack has a picture of its own now.

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import type { AbilityId } from '../game/types';
import { BLADE, BROWN, CYAN, INK, LEAF, MAIL, PLUM, ROBE, STEEL } from './kit';

/** An icon's canvas, in picture pixels: two to a game pixel, so the sixteen game pixels the slots are made for. */
const N = 32;
const WHITE = '#ffffff';

type Pt = readonly [number, number];
/** Three tones of one material: dark, middle, light. */
type T3 = readonly [string, string, string];
const three = (r: readonly string[]): T3 => [r[0], r[2], r[4]];
const STEEL3 = three(STEEL);
const WOOD3 = three(BROWN);
const LEAF3 = three(LEAF);
const CYAN3 = three(CYAN);
/** The mage's own magic: the violet of the robe (art/spells.ts, SPELL_TONES.phys). */
const VIOLET3 = three(ROBE);
/** The warrior's red: his tabard and his scarf (hero_warrior.ts, RED). */
const RED3: T3 = ['#6a1020', '#d02a30', '#ff7058'];
/** Stone thrown up off the floor. */
const STONE3 = three(MAIL);

/** Where the light comes from: the upper left, and more from above than from the side. */
const LIGHT: Pt = [-0.6, -0.8];

const rad = (deg: number): number => (deg * Math.PI) / 180;
/** An angle on the screen in degrees: 0 to the right, 90 straight down (the screen's y runs down). */
const dir = (deg: number): Pt => [Math.cos(rad(deg)), Math.sin(rad(deg))];
const degOf = (dx: number, dy: number): number => (Math.atan2(dy, dx) * 180) / Math.PI;

/** Paint pixel by pixel: `at` is given the middle of each pixel and says its colour, or nothing. */
function fill(p: Px, at: (x: number, y: number) => string | null): Px {
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.w; x++) {
      const c = at(x + 0.5, y + 0.5);
      if (c) p.set(x, y, c);
    }
  }
  return p;
}

/** A part painted on a sheet of its own and laid on the picture with the style's dark seam all round it. */
function part(p: Px, paint: (sheet: Px) => void): void {
  const sheet = new Px(p.w, p.h);
  paint(sheet);
  sheet.outline(INK);
  p.blit(sheet, 0, 0);
}

/** How a point lies by the line from a to b: `t` along it (0 at a, 1 at b), `off` across it (more than 0 on the side the light falls on), and the line's length. */
function along(x: number, y: number, a: Pt, b: Pt): { t: number; off: number; len: number } {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  let nx = -dy / len;
  let ny = dx / len;
  if (nx * LIGHT[0] + ny * LIGHT[1] < 0) {
    nx = -nx;
    ny = -ny;
  }
  const px = x - a[0];
  const py = y - a[1];
  return { t: (px * dx + py * dy) / (len * len), off: px * nx + py * ny, len };
}

/** A bar from a to b, `h0` to either side of its middle at a and `h1` at b, in three tones across it: light on the side the light falls on. Its ends are square, or round. */
function bar(p: Px, a: Pt, b: Pt, h0: number, h1: number, tones: T3, round = false): void {
  fill(p, (x, y) => {
    const { t, off } = along(x, y, a, b);
    const h = h0 + (h1 - h0) * Math.max(0, Math.min(1, t));
    if (t < 0 || t > 1) {
      if (!round) return null;
      const e = t < 0 ? a : b;
      if (Math.hypot(x - e[0], y - e[1]) > h) return null;
    } else if (Math.abs(off) > h) return null;
    return off > h * 0.3 ? tones[2] : off < -h * 0.3 ? tones[0] : tones[1];
  });
}

/** A ball: dark all over, its middle tone toward the light, its light tone nearer the light still. */
function ball(p: Px, c: Pt, r: number, tones: T3): void {
  p.ellipse(c[0], c[1], r, r, tones[0]);
  p.ellipse(c[0] + LIGHT[0] * r * 0.22, c[1] + LIGHT[1] * r * 0.22, r * 0.8, r * 0.8, tones[1]);
  p.ellipse(c[0] + LIGHT[0] * r * 0.48, c[1] + LIGHT[1] * r * 0.48, r * 0.46, r * 0.46, tones[2]);
}

/** A ring lying on the floor (an oval, twice as wide as deep or so), `thick` across: lighter along its far edge. */
function floorRing(p: Px, c: Pt, rx: number, ry: number, thick: number, tones: T3): void {
  fill(p, (x, y) => {
    const d = Math.hypot((x - c[0]) / rx, (y - c[1]) / ry);
    const off = (d - 1) * Math.min(rx, ry);
    if (Math.abs(off) > thick / 2) return null;
    return y < c[1] - ry * 0.35 ? tones[2] : y > c[1] + ry * 0.45 ? tones[0] : tones[1];
  });
}

/** An oval line on the floor in one colour, `thick` across: what is inside one oval and outside another that much smaller. */
function oval(p: Px, c: Pt, rx: number, ry: number, thick: number, col: string): void {
  fill(p, (x, y) => {
    const dx = x - c[0];
    const dy = y - c[1];
    if ((dx / rx) ** 2 + (dy / ry) ** 2 > 1) return null;
    const ix = rx - thick;
    const iy = ry - thick;
    return ix > 0 && iy > 0 && (dx / ix) ** 2 + (dy / iy) ** 2 <= 1 ? null : col;
  });
}

/** A star of light lying flat on the floor: `n` points about c, `rx` by `ry` to their tips. */
function floorStar(p: Px, c: Pt, rx: number, ry: number, n: number, col: string, turn = 0): void {
  const pts: Pt[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2 + turn;
    const r = i % 2 === 0 ? 1 : 0.5;
    pts.push([c[0] + Math.cos(a) * rx * r, c[1] + Math.sin(a) * ry * r]);
  }
  p.poly(pts, col);
}

/** A four-pointed glint: a middle and four arms, `r` long. */
function glint(p: Px, x: number, y: number, r: number, col: string, heart: string = col): void {
  for (let i = 1; i <= r; i++) p.set(x + i, y, col).set(x - i, y, col).set(x, y + i, col).set(x, y - i, col);
  p.set(x, y, heart);
}

/** Lay rows of characters on the picture with their top left corner at (x, y): each character a colour from `key`, '.' nothing. */
function stamp(p: Px, x: number, y: number, rows: readonly string[], key: Record<string, string>): void {
  rows.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      const ch = row.charAt(i);
      if (ch === '.') continue;
      const c = key[ch];
      if (c === undefined) throw new Error(`ability icons: '${ch}' has no colour`);
      p.set(x + i, y + j, c);
    }
  });
}

/** A tail of light along a curve from a to b, bent toward `via`: `r0` to either side of its middle at a and `r1` at b; `light` along the side of it the light falls on, if given. */
function trail(p: Px, a: Pt, via: Pt, b: Pt, r0: number, r1: number, body: string, light: string | null = null): void {
  const at = (t: number): Pt => [(1 - t) * (1 - t) * a[0] + 2 * t * (1 - t) * via[0] + t * t * b[0], (1 - t) * (1 - t) * a[1] + 2 * t * (1 - t) * via[1] + t * t * b[1]];
  for (const pass of [0, 1]) {
    if (pass === 1 && light === null) break;
    for (let i = 0; i <= 160; i++) {
      const t = i / 160;
      const [x, y] = at(t);
      const r = r0 + (r1 - r0) * t;
      if (pass === 0) p.ellipse(x, y, r, r, body);
      else if (r > 1.1) p.ellipse(x + LIGHT[0] * r * 0.5, y + LIGHT[1] * r * 0.5, r * 0.5, r * 0.5, light);
    }
  }
}

/** A lit blade from a to its point at b, `wide` to either side of the line down its middle: white where the light falls on it. */
function blade(p: Px, a: Pt, b: Pt, wide: number): void {
  part(p, (s) => {
    fill(s, (x, y) => {
      const { t, off, len } = along(x, y, a, b);
      if (t < 0 || t > 1) return null;
      // (it comes to its point over the last of its length)
      const left = (1 - t) * len;
      const h = left < wide * 2.2 ? 0.35 + (left / (wide * 2.2)) * (wide - 0.35) : wide;
      if (Math.abs(off) > h) return null;
      if (Math.abs(off) < 0.5 && left > wide * 3.2 && t * len > 1.5) return BLADE[2];
      return off > 0 ? WHITE : off < -wide * 0.42 ? BLADE[2] : BLADE[3];
    });
  });
}

/**
 * The warrior's great sword, as he carries it (hero_warrior.ts, blade): a lit blade with a line
 * down its middle, a steel guard, a wrapped grip, a steel pommel. From the end of its pommel at
 * `from` it is `long` picture pixels to its point, toward `deg`; `grip` of that is the grip.
 */
function sword(p: Px, from: Pt, deg: number, long: number, wide = 2.5, grip = 4.6): void {
  const u = dir(deg);
  const at = (r: number, across = 0): Pt => [from[0] + u[0] * r - u[1] * across, from[1] + u[1] * r + u[0] * across];
  const guard = 3.6 + grip + 1.2;
  blade(p, at(guard + 1.2), at(long), wide);
  part(p, (s) => {
    const a = at(2.4);
    const b = at(guard);
    fill(s, (x, y) => {
      const { t, off, len } = along(x, y, a, b);
      if (t < 0 || t > 1 || Math.abs(off) > 1.45) return null;
      return Math.floor(t * len + 0.5) % 2 === 0 ? PLUM[2] : PLUM[4];
    });
    ball(s, at(2), 2.15, STEEL3);
    bar(s, at(guard + 0.2, -(wide + 2.9)), at(guard + 0.2, wide + 2.9), 1.45, 1.45, STEEL3, true);
  });
}

/** An arrow from its nock at `tail` to its point at `tip`: a brown shaft, a steel head with barbs, the ranger's green in its feathers. For one that lies along a diagonal. */
function arrow(p: Px, tail: Pt, tip: Pt): void {
  const long = Math.hypot(tip[0] - tail[0], tip[1] - tail[1]);
  const ux = (tip[0] - tail[0]) / long;
  const uy = (tip[1] - tail[1]) / long;
  const head = 9;
  // the feathers: they rise from the nock, are tallest a little way along and run down to the shaft
  part(p, (s) => {
    fill(s, (x, y) => {
      const { t, off } = along(x, y, tail, tip);
      const r = t * long;
      const o = Math.abs(off);
      const w = r < 3.2 ? 2 + (r - 0.4) * 1.05 : 4.9 * (1 - (r - 3.2) / 8.2);
      if (r < 0.4 || o > w || o < 0.9) return null;
      // (a feather is cut across twice)
      if (o > 1.6 && (Math.abs(r - o * 0.5 - 4.2) < 0.5 || Math.abs(r - o * 0.5 - 7) < 0.5)) return LEAF3[0];
      return off > 0 ? LEAF3[2] : LEAF3[1];
    });
  });
  part(p, (s) => bar(s, tail, [tip[0] - ux * head * 0.55, tip[1] - uy * head * 0.55], 1.3, 1.3, WOOD3));
  part(p, (s) => {
    fill(s, (x, y) => {
      const { t, off } = along(x, y, tail, tip);
      const r = (1 - t) * long; // back from the point
      const o = Math.abs(off);
      if (r < -0.2 || r > head || o > 0.5 + r * 0.6) return null;
      // (the barbs: cut away behind, either side of the socket)
      if (r > head * 0.66 && o > 1.5 && o < 1.5 + (r - head * 0.66) * 1.7) return null;
      if (r > head * 0.66 && o > 1.5 + (r - head * 0.66) * 1.7 + 2.4) return null;
      return off > 0.3 ? STEEL3[2] : off < -1.9 ? STEEL3[0] : STEEL3[1];
    });
  });
}

// ---------------------------------------------------------------------------------------------
// The warrior's

/** Strike: the great sword at the end of its cut, and the crescent of light it has left in the air behind it. */
function strike(): Px {
  const p = new Px(N, N);
  const o: Pt = [4.5, 28];
  const R = 27;
  const A0 = -97;
  const A1 = -27;
  fill(p, (x, y) => {
    const d = Math.hypot(x - o[0], y - o[1]);
    const t = (degOf(x - o[0], y - o[1]) - A0) / (A1 - A0);
    if (t < 0 || t > 1 || d > R) return null;
    // thin where the cut began, wide just behind the blade
    const thick = 1.6 + 14.5 * Math.pow(t, 1.5);
    const depth = R - d;
    if (depth > thick) return null;
    if (depth < 1.5) return t > 0.2 ? WHITE : BLADE[3];
    const k = depth / thick;
    return k < 0.4 ? BLADE[3] : k < 0.78 ? BLADE[2] : BLADE[0];
  });
  sword(p, o, A1, R);
  return p;
}

/** Slam: the great sword driven point down into the floor, the burst that goes out from it along the floor, and the stone it throws up. */
function slam(): Px {
  const p = new Px(N, N);
  const c: Pt = [16, 25];
  floorStar(p, c, 14.6, 5.6, 10, CYAN3[0], 0.16);
  floorStar(p, c, 12.6, 4.7, 10, CYAN3[1], 0.16);
  floorStar(p, c, 8.8, 3.3, 10, CYAN3[2], 0.16);
  // how fast it came down: streaks in the air either side of it
  for (const [x, y, len] of [[8, 5, 7], [5, 11, 4], [24, 3, 8], [27, 10, 5]] as const) {
    p.rect(x, y, 1, len, CYAN3[1]);
    p.rect(x, y + len, 1, 1, WHITE);
  }
  sword(p, [16, 0.6], 90, 24.6);
  floorStar(p, c, 4.4, 1.7, 10, WHITE, 0.16);
  // stone thrown up
  for (const [x, y, s] of [[3, 17, 3], [9, 15, 2], [26, 16, 3], [21, 14, 2]] as const) {
    p.rect(x, y, s, s, STONE3[1]);
    p.rect(x, y, s - 1, 1, STONE3[2]);
    p.rect(x + s - 1, y + 1, 1, s - 1, STONE3[0]);
  }
  return p;
}

/** Whirlwind: the sword swung all the way round, and round again: two crescents of its light chasing each other about the hilt. */
function whirl(): Px {
  const p = new Px(N, N);
  const c: Pt = [16, 16];
  const R = 14.4;
  const heads = [-38, 142];
  const SPAN = 150;
  fill(p, (x, y) => {
    const d = Math.hypot(x - c[0], y - c[1]);
    if (d > R) return null;
    const ang = degOf(x - c[0], y - c[1]);
    let out: string | null = null;
    heads.forEach((head, i) => {
      // how far behind the crescent's leading end, in degrees (they go round with the clock)
      const back = (((head - ang) % 360) + 360) % 360;
      if (back > SPAN) return;
      const t = 1 - back / SPAN;
      const thick = 1.5 + 5.6 * Math.pow(t, 1.25);
      const depth = R - d;
      if (depth > thick) return;
      const k = depth / thick;
      // (the second is the turn before: a step dimmer)
      if (i === 0) out = depth < 1.4 ? (t > 0.3 ? WHITE : BLADE[3]) : k < 0.5 ? BLADE[3] : k < 0.85 ? BLADE[2] : BLADE[0];
      else out = depth < 1.4 ? (t > 0.3 ? BLADE[3] : BLADE[2]) : k < 0.6 ? BLADE[2] : BLADE[0];
    });
    return out;
  });
  // the blade itself, out from him to the head of the first crescent
  const u = dir(heads[0]);
  blade(p, [c[0] + u[0] * 3, c[1] + u[1] * 3], [c[0] + u[0] * (R + 0.4), c[1] + u[1] * (R + 0.4)], 2.3);
  // his scarf, going round after him
  const v = (deg: number, r: number): Pt => [c[0] + dir(heads[0] + deg)[0] * r, c[1] + dir(heads[0] + deg)[1] * r];
  part(p, (s) => trail(s, v(-110, 8.4), v(-150, 9.4), v(-190, 4.4), 0.8, 2.3, RED3[1], RED3[2]));
  // and himself, seen from above: the helm
  part(p, (s) => ball(s, c, 4.3, STEEL3));
  return p;
}

/**
 * An armoured boot, seen from its side, toe to the right: the greave with its flared cuff, the
 * ankle, the foot, a sole with a heel. Drawn by hand, pixel by pixel; `lean` shifts each row a
 * little further left than the one below it, so that the leg leans back from the foot.
 */
const BOOT = [
  '.WWLLLLMM.....',
  'WWLLLLLMMD....',
  'WLLLLLMMMD....',
  '.DDDDDDDD.....',
  '.WLLLMMMD.....',
  '.WLLLMMMD.....',
  '.WLLLMMMD.....',
  '.WLLLMMMD.....',
  '.WLLLMMMD.....',
  '.WLLLMMMD.....',
  '.DDDDDDDDD....',
  '.WLLLMMMMMD...',
  '.WLLLLMMMMMLL.',
  '.WLLLLMMMMMMML',
  '.LLMMMMMMMMMMD',
  '.MMMMMMMMMMMDD',
  '.DDDDDDDDDDDDD',
  '.DDDD..DDDDDDD',
];
function boot(p: Px, x: number, y: number, lean: number): void {
  const key = { W: WHITE, L: STEEL3[2], M: STEEL3[1], D: STEEL3[0] };
  part(p, (s) => BOOT.forEach((row, j) => stamp(s, x - Math.round((BOOT.length - 1 - j) * lean), y + j, [row], key)));
}

/** Leap: an armoured boot coming down at the end of the arc of its jump, and the ring on the floor where it will land. */
function leap(): Px {
  const p = new Px(N, N);
  oval(p, [21, 27.5], 9.4, 3.2, 1.4, CYAN3[1]);
  p.rect(19, 27, 4, 1, CYAN3[2]);
  trail(p, [2.5, 27.5], [1, 5], [12, 4.6], 0.7, 2.8, CYAN3[1], CYAN3[2]);
  boot(p, 16, 4, 0.16);
  return p;
}

// ---------------------------------------------------------------------------------------------
// The ranger's

/**
 * Shot: one arrow in flight, up and to the right, along the diagonal from its nock at (6.5, 26.5):
 * a brown shaft, light above and dark below; a broad steel head, its two barbs swept back; a
 * feather either side of the nock in the ranger's green, the lower one in the shaft's shade.
 */
function shot(): Px {
  const p = new Px(N, N);
  // the air it has come through
  for (const [x0, y0, len] of [[3, 13, 6], [19, 29, 6]] as const) {
    for (let i = 0; i <= len; i++) p.set(x0 + i, y0 - i, i === len ? WHITE : CYAN3[1]);
  }
  const nock: Pt = [6.5, 26.5];
  /** A place by the arrow: `r` along it from the nock, `a` across it (more than 0 above it, on the side the light falls on). */
  const at = (r: number, a: number): Pt => [nock[0] + (r - a) * Math.SQRT1_2, nock[1] - (r + a) * Math.SQRT1_2];
  const L = 24 * Math.SQRT2;
  part(p, (s) => {
    s.poly([at(0.4, 0.8), at(-0.6, 4.4), at(5.6, 4.4), at(10, 0.8)], LEAF3[2]);
    s.poly([at(0.4, -0.8), at(-0.6, -4.4), at(5.6, -4.4), at(10, -0.8)], LEAF3[1]);
    // (each feather's outer edge, a tone darker: it curls away from the light)
    s.poly([at(-0.6, 4.4), at(5.6, 4.4), at(6.6, 3.4), at(-0.3, 3.4)], LEAF3[1]);
    s.poly([at(-0.6, -4.4), at(5.6, -4.4), at(6.6, -3.4), at(-0.3, -3.4)], LEAF3[0]);
  });
  part(p, (s) => bar(s, nock, at(L - 6, 0), 1.3, 1.3, WOOD3));
  part(p, (s) => {
    s.poly([at(L + 0.6, 0), at(L - 9.8, 5.2), at(L - 6.6, 0)], STEEL3[2]);
    s.poly([at(L + 0.6, 0), at(L - 6.6, 0), at(L - 9.8, -5.2)], STEEL3[1]);
    // (the ridge down its middle catches the light toward the point)
    s.line(at(L - 0.4, 0)[0], at(L - 0.4, 0)[1], at(L - 3.4, 0)[0], at(L - 3.4, 0)[1], WHITE);
  });
  return p;
}

/** One of the arrows that come down in a volley: point down, its nock at the top; eight wide, eighteen tall. */
const FALLING = [
  '.1....2.',
  '.11..22.',
  '.11ab22.',
  '.31ab23.',
  '.11ab22.',
  '..1ab2..',
  '...ab...',
  '...ab...',
  '...ab...',
  '...ab...',
  '...ab...',
  '...ab...',
  '..TabS..',
  '.TTabSS.',
  'TTTTSSSS',
  '.TTTSSS.',
  '..TTSS..',
  '..TTSS..',
  '...TS...',
];

/** Volley: three arrows coming down out of the sky onto the ring that marks where they will land. */
function volley(): Px {
  const p = new Px(N, N);
  oval(p, [16, 27.2], 13.4, 3.6, 1.4, CYAN3[1]);
  const key = { 1: LEAF3[2], 2: LEAF3[1], 3: LEAF3[0], a: WOOD3[2], b: WOOD3[1], T: STEEL3[2], S: STEEL3[1] };
  for (const [x, y] of [[3, 2], [21, 4], [12, 8]] as const) {
    // (the air above it)
    p.rect(x + 3, y - 2, 1, 1, CYAN3[1]);
    part(p, (s) => stamp(s, x, y, FALLING, key));
  }
  return p;
}

/**
 * Trap: the jaw trap as it lies open on the floor (icons.ts, trapFrame), seen from where the game
 * is seen from. Two steel jaws in a ring, each a row of teeth standing up edge to edge like a saw:
 * the far jaw's against the dark, tall, and the near jaw's in front, short enough to see over; in
 * the middle the plate, lit with the heroes' cyan as it is when the trap is armed; and at either
 * end, where the two jaws meet, the block they turn on.
 */
function trap(): Px {
  const p = new Px(N, N);
  const c: Pt = [16, 19.5];
  const RX = 14;
  const RY = 8;
  const rx = 11;
  const ry = 5.6;
  const on = (deg: number, k: number): Pt => [c[0] + Math.cos(rad(deg)) * (rx + (RX - rx) * k), c[1] + Math.sin(rad(deg)) * (ry + (RY - ry) * k)];
  /** A jaw's row of teeth, from `a0` round to `a1`: `n` of them, `tall`. */
  const teeth = (a0: number, a1: number, n: number, tall: number, together = false): void => {
    const row = new Px(N, N);
    for (let i = 0; i < n; i++) {
      const l = on(a0 + ((a1 - a0) * i) / n, 0.5);
      const r = on(a0 + ((a1 - a0) * (i + 1)) / n, 0.5);
      const left = l[0] < r[0] ? l : r;
      const right = l[0] < r[0] ? r : l;
      const top: Pt = [(left[0] + right[0]) / 2, Math.min(left[1], right[1]) - tall];
      const foot = Math.max(left[1], right[1]) + 1;
      const one = (s: Px): void => {
        s.poly([[left[0], foot], [left[0], left[1]], [top[0] - 0.5, top[1]], [top[0] + 0.5, top[1]], [right[0], right[1]], [right[0], foot]], STEEL3[1]);
        s.poly([[left[0], foot], [left[0], left[1]], [top[0] - 0.5, top[1]], [top[0], top[1]], [top[0], foot]], STEEL3[2]);
        s.set(top[0] - 0.5, top[1], WHITE).set(top[0] - 0.5, top[1] + 1, WHITE);
      };
      // (the far teeth each have the seam round them; the near ones, smaller, are one saw's edge)
      if (together) one(row);
      else part(p, one);
    }
    if (together) p.blit(row.outline(INK), 0, 0);
  };
  teeth(204, 336, 6, 7.5);
  // the jaws' ring: its outer wall, in shade, and its top; the dark inside it
  fill(p, (x, y) => {
    for (const drop of [2, 0]) {
      const ox = (x - c[0]) / RX;
      const oy = (y - drop - c[1]) / RY;
      if (ox * ox + oy * oy > 1) continue;
      if (drop > 0) return STEEL3[0];
      const ix = (x - c[0]) / rx;
      const iy = (y - c[1]) / ry;
      if (ix * ix + iy * iy <= 1) return INK;
      return y < c[1] ? STEEL3[1] : STEEL3[2];
    }
    return null;
  });
  // the plate, and its light
  part(p, (s) => {
    s.ellipse(c[0], c[1] + 0.2, 6.6, 3.2, STEEL3[0]);
    s.ellipse(c[0], c[1] - 0.8, 6.6, 3.2, STEEL3[1]);
    s.ellipse(c[0], c[1] - 0.9, 5.2, 2.3, CYAN3[1]);
    s.ellipse(c[0] - 0.6, c[1] - 1.1, 3, 1.2, CYAN3[2]);
  });
  // the blocks the jaws turn on
  for (const x of [1, 28]) {
    part(p, (s) => {
      s.rect(x, 18, 3, 4, STEEL3[1]);
      s.rect(x, 18, 3, 1, STEEL3[2]);
      s.rect(x + 2, 19, 1, 3, STEEL3[0]);
    });
  }
  teeth(26, 154, 5, 5.4, true);
  // the near jaw's band and its wall, over the feet of its teeth
  fill(p, (x, y) => {
    if (y < c[1] + 1.5) return null;
    const ix = (x - c[0]) / (rx + 0.9);
    const iy = (y - c[1]) / (ry + 0.9);
    if (ix * ix + iy * iy <= 1) return null;
    for (const drop of [0, 2]) {
      const ox = (x - c[0]) / RX;
      const oy = (y - drop - c[1]) / RY;
      if (ox * ox + oy * oy <= 1) return drop > 0 ? STEEL3[0] : STEEL3[2];
    }
    return null;
  });
  return p;
}

// ---------------------------------------------------------------------------------------------
// The mage's

/** A crescent of force, part of a ring about `o`: `r` to its leading edge, `thick` at its middle, and nothing at either end. */
function crescent(p: Px, o: Pt, r: number, thick: number, a0: number, a1: number, edge: string, body: string, back: string | null): void {
  fill(p, (x, y) => {
    const d = Math.hypot(x - o[0], y - o[1]);
    const t = (degOf(x - o[0], y - o[1]) - a0) / (a1 - a0);
    if (t < 0 || t > 1 || d > r) return null;
    const w = thick * Math.pow(Math.sin(t * Math.PI), 0.7);
    const depth = r - d;
    if (depth > w) return null;
    return depth < Math.max(1, w * 0.3) ? edge : back !== null && depth > w * 0.7 ? back : body;
  });
}

/** Wave: three crescents of force going out one behind the other, the leading one the brightest. */
function wave(): Px {
  const p = new Px(N, N);
  const o: Pt = [1.5, 30.5];
  crescent(p, o, 12.5, 3.2, -84, -6, VIOLET3[2], VIOLET3[1], null);
  crescent(p, o, 20.5, 4.4, -86, -4, VIOLET3[2], VIOLET3[1], VIOLET3[0]);
  crescent(p, o, 29.5, 6.2, -87, -3, WHITE, VIOLET3[2], VIOLET3[1]);
  return p;
}

/** Orb: the ball of magic the staff sets down (art/spells.ts, orbFrame), and the waves it sends out along the floor. */
function orb(): Px {
  const p = new Px(N, N);
  // the waves: the one that has gone furthest is the fainter
  oval(p, [16, 24.5], 14.4, 5.6, 1.3, VIOLET3[1]);
  oval(p, [16, 24.5], 9.4, 3.5, 1.4, VIOLET3[2]);
  part(p, (s) => {
    const c: Pt = [16, 12];
    s.ellipse(c[0], c[1], 8.6, 8.6, VIOLET3[0]);
    s.ellipse(c[0] - 1.2, c[1] - 1.2, 7.1, 7.1, VIOLET3[1]);
    s.ellipse(c[0] - 2.6, c[1] - 2.8, 4.3, 4.1, VIOLET3[2]);
    s.ellipse(c[0] - 3.2, c[1] - 3.4, 2, 1.9, WHITE);
    // (a rim of light along its lower right: the glow coming back off the floor)
    for (let i = 0; i < 9; i++) {
      const a = 0.25 + (i / 8) * 1.05;
      s.set(c[0] + Math.cos(a) * 7.9, c[1] + Math.sin(a) * 7.9, VIOLET3[2]);
    }
  });
  // its sparks
  p.rect(3, 8, 2, 2, VIOLET3[2]).rect(27, 5, 2, 2, WHITE).rect(28, 14, 1, 1, VIOLET3[2]);
  return p;
}

/** Beam: the head of the mage's staff, its bar and its long crystal, and the beam that goes from the crystal's point. */
function beam(): Px {
  const p = new Px(N, N);
  const u = dir(-45);
  const from: Pt = [12.5, 19.5];
  // the beam: white at its heart
  fill(p, (x, y) => {
    const px = x - from[0];
    const py = y - from[1];
    const far = px * u[0] + py * u[1];
    if (far < 0) return null;
    const off = Math.abs(px * u[1] - py * u[0]);
    // (narrow where it leaves the crystal, and soon its full width)
    const w = Math.min(3.3, 1.6 + far * 0.4);
    return off < w * 0.36 ? WHITE : off < w * 0.72 ? VIOLET3[2] : off < w ? VIOLET3[1] : null;
  });
  // the flare where it leaves the crystal
  glint(p, 13, 19, 5, VIOLET3[2], WHITE);
  glint(p, 13, 19, 3, WHITE);
  // the staff's head: its shaft, the bar across it, the crystal
  part(p, (s) => bar(s, [1.5, 30.5], [6.5, 25.5], 1.3, 1.3, WOOD3));
  part(p, (s) => bar(s, [3.5, 21.5], [10.5, 28.5], 1.3, 1.3, STEEL3, true));
  part(p, (s) => {
    const a: Pt = [6.5, 25.5];
    const b: Pt = [13.5, 18.5];
    fill(s, (x, y) => {
      const { t, off } = along(x, y, a, b);
      if (t < 0 || t > 1) return null;
      // (a long crystal: widest a third of the way up it)
      const h = t < 0.34 ? 1.2 + (t / 0.34) * 1.7 : 2.9 * (1 - (t - 0.34) / 0.66) + 0.3;
      if (Math.abs(off) > h) return null;
      return off > 0.4 ? CYAN3[2] : off < -1.3 ? CYAN3[0] : CYAN3[1];
    });
  });
  // sparks thrown off it
  p.rect(19, 3, 1, 1, WHITE).rect(27, 13, 2, 2, VIOLET3[2]).rect(14, 8, 1, 1, VIOLET3[2]);
  return p;
}

/** Familiar: the wisp the mage calls (art/spells.ts, familiarFrame): a ball of violet light with a white heart, a tail that curls under it and comes apart, and the motes that go round it. */
function familiar(): Px {
  const p = new Px(N, N);
  const c: Pt = [13, 11.5];
  // the tail: it curls away under the body and comes apart into motes
  trail(p, [26, 27.5], [25.5, 15], [16, 17], 0.5, 4.6, VIOLET3[0]);
  trail(p, [24, 24], [23.5, 16.5], [16, 16.5], 0.4, 3.2, VIOLET3[1]);
  p.rect(27, 29, 2, 2, VIOLET3[1]);
  p.set(24, 30, VIOLET3[0]);
  // the haze about it: every other pixel of a ring
  fill(p, (x, y) => {
    const d = Math.hypot(x - c[0], y - c[1]);
    return d <= 10 && d > 7.4 && (Math.floor(x) + Math.floor(y)) % 2 === 0 ? VIOLET3[0] : null;
  });
  p.ellipse(c[0], c[1], 7.4, 7.4, VIOLET3[1]);
  p.ellipse(c[0] - 0.8, c[1] - 0.9, 5.3, 5.3, VIOLET3[2]);
  // its heart: a diamond
  p.poly([[c[0] - 0.5, c[1] - 4.4], [c[0] + 3, c[1] - 0.9], [c[0] - 0.5, c[1] + 2.6], [c[0] - 4, c[1] - 0.9]], WHITE);
  // the motes that go round it
  glint(p, 27, 9, 1, VIOLET3[2], WHITE);
  p.rect(3, 22, 2, 2, VIOLET3[2]);
  p.set(24, 3, VIOLET3[2]);
  return p;
}

/** Warp: gone from one place, where a ring on the floor and the motes rising off it are all that is left, and there in another in a burst of light. */
function warp(): Px {
  const p = new Px(N, N);
  // where she was
  oval(p, [8.5, 26.5], 6.9, 2.9, 1.4, VIOLET3[1]);
  for (const [x, y, s, col] of [[6, 22, 1, VIOLET3[1]], [9, 20, 2, VIOLET3[1]], [11, 16, 2, VIOLET3[2]], [5, 17, 1, VIOLET3[1]]] as const) p.rect(x, y, s, s, col);
  // where she is: a burst, four long points and four short
  const at: Pt = [20.5, 11.5];
  const star = (long: number, short: number, col: string): void => {
    const pts: Pt[] = [];
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 - Math.PI / 2;
      const r = i % 4 === 0 ? long : i % 2 === 0 ? short : short * 0.45;
      pts.push([at[0] + Math.cos(a) * r, at[1] + Math.sin(a) * r]);
    }
    p.poly(pts, col);
  };
  star(10.6, 7.6, VIOLET3[0]);
  star(9.6, 6.4, VIOLET3[1]);
  star(7.6, 4.6, VIOLET3[2]);
  star(5.2, 2.6, WHITE);
  return p;
}

// ---------------------------------------------------------------------------------------------

const PAINTERS: Record<AbilityId, () => Px> = { strike, slam, whirl, leap, shot, volley, trap, wave, orb, beam, familiar, warp };

/** Every attack's icon: sixteen game pixels square, anchor in the middle, painted two picture pixels to a game pixel. */
export function makeAbilityIcons(): Record<AbilityId, Sprite> {
  const out = {} as Record<AbilityId, Sprite>;
  for (const id of Object.keys(PAINTERS) as AbilityId[]) out[id] = PAINTERS[id]().outline(INK).sprite(N / 2, N / 2, 2);
  return out;
}

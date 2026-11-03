// THE VETERAN'S THREE ICONS (the art chat's helper, 3 Nov 2026), for the HUD's TAP, HOLD and SWIPE: his Punch, his Kick and
// his Jump. Asked for by the main chat on the board, 3 Nov 2026, 11:32: “PLEASE DRAW: THE VETERAN'S THREE ABILITY ICONS for
// the HUD's TAP, HOLD and SWIPE (Punch, Kick, Jump: art/ability_icons.ts; today they borrow the old Brawler's jab, cross and
// slip, which he does not want reused). His globes, cyan, hot orange and white, would read at once; your call.” His punch's
// colour since, 3 Nov 2026, 10:44: “...the brawler is Str/dex, so I think we change the color of the globe for a punch to
// green and the kicks stay orange/red.” And his word on the old Brawler: “I don’t want anything reused from the original
// brawler, we need a totally new look.” A FIRST PASS, TO BE SHOWN TO HIM. Nothing here is taken from art/brawler_icons.ts.
//
// On the buttons' canvas (art/ability_icons.ts: thirty-two picture pixels, two to a game pixel, in the sixteen game pixels a
// button gives), in the heroes' manner: flat tones, three to a material, the light from the upper left, the style's dark
// seam between one part and the next. In HIS colours (the art chat's sculpt of him, dev/sculpt_veteran.ts on
// art/brawler-looks: his weathered skin, his linen wraps grey with use, his leather straps, his grey-blue trousers) and his
// globes' (dev/veteran_globes.ts there): the punch's EMERALD GREEN, the kick's HOT ORANGE-RED, the jump's WHITE.
//   punch   (TAP)    his big wrapped fist driven in up and to the right, a smear of green behind it, a green burst off its
//                    knuckles, white at the heart
//   kick    (HOLD)   his wrapped shin and foot whipping round from the knee, the hot orange crescent of its path over it
//   jump    (SWIPE)  his two wrapped feet springing up, toes pointed, out of a white burst of dust, the air streaking past

import { Px } from '../engine/px';
import { INK } from './kit';

const N = 32;
type Pt = readonly [number, number];
/** Three tones of one material: dark, middle, light. */
type T3 = readonly [string, string, string];
/** Is the middle of a picture pixel inside a shape. */
type Inside = (x: number, y: number) => boolean;

// HIS COLOURS (the art chat's sculpt of him, dev/sculpt_veteran.ts on art/brawler-looks)
/** His skin, an old man's, weathered and tanned (VET_SKIN 1, 2, 3). */
const SKIN: T3 = ['#663634', '#a0604a', '#cc8e68'];
/** His linen wraps, grey with use (VET_LINEN 2, 3, 4). */
const LINEN: T3 = ['#948a8e', '#c2b8b2', '#e4dcd2'];
/** His leather straps (VET_STRAP 2, 3, 4). */
const STRAP: T3 = ['#3e281e', '#5c3e2c', '#7a583e'];
/** His trousers, grey-blue (VET_CLOTH 2, 3, 4). */
const CLOTH: T3 = ['#4e5670', '#727c96', '#9aa2b8'];

// HIS GLOBES' COLOURS (dev/veteran_globes.ts on art/brawler-looks)
/** The punch's emerald (GLOBE_GREEN): deep, body, bright, light, top. */
export const VET_GREEN = ['#0c6a38', '#12a050', '#18c060', '#76f4ae', '#d4ffe6'] as const;
/** The kick's hot orange-red (GLOBE_ORANGE). */
export const VET_ORANGE = ['#5a1606', '#a8340a', '#e8561a', '#ff7c2e', '#ffb486'] as const;
/** The jump's white (GLOBE_WHITE). */
export const VET_WHITE = ['#6a6890', '#a4a2c4', '#d4d2ea', '#f2f2fc', '#ffffff'] as const;
const WHITE = '#ffffff';

/** Where the light comes from: the upper left, more from above than from the side. */
const LIGHT: Pt = [-0.6, -0.8];

const rad = (deg: number): number => (deg * Math.PI) / 180;

/** How far the point (x, y) lies from the segment a to b, and how far along it (0 at a, 1 at b). */
function seg(x: number, y: number, a: Pt, b: Pt): { d: number; t: number } {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const l2 = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / l2));
  return { d: Math.hypot(x - a[0] - dx * t, y - a[1] - dy * t), t };
}
/** A limb from a to b: `r0` thick to either side at a, `r1` at b, round at both ends. */
const limb = (a: Pt, b: Pt, r0: number, r1: number): Inside => (x, y) => {
  const { d, t } = seg(x, y, a, b);
  return d <= r0 + (r1 - r0) * t;
};
const egg = (c: Pt, rx: number, ry: number, turn = 0): Inside => (x, y) => {
  const ca = Math.cos(rad(-turn));
  const sa = Math.sin(rad(-turn));
  const dx = x - c[0];
  const dy = y - c[1];
  const u = dx * ca - dy * sa;
  const v = dx * sa + dy * ca;
  return (u / rx) ** 2 + (v / ry) ** 2 <= 1;
};
const any = (...s: Inside[]): Inside => (x, y) => s.some((f) => f(x, y));
const but = (a: Inside, b: Inside): Inside => (x, y) => a(x, y) && !b(x, y);
const both = (a: Inside, b: Inside): Inside => (x, y) => a(x, y) && b(x, y);

/**
 * A shape in three tones, lit from the upper left: light along the edge the light falls on, dark along the edge away from
 * it, the middle between. `rim` and `shade` say how deep the light and the dark edges go, in picture pixels.
 */
function solid(p: Px, inside: Inside, t: T3, rim = 1.4, shade = 2.0): void {
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.w; x++) {
      const cx = x + 0.5;
      const cy = y + 0.5;
      if (!inside(cx, cy)) continue;
      const lit = !inside(cx + LIGHT[0] * rim, cy + LIGHT[1] * rim);
      const dark = !inside(cx - LIGHT[0] * shade, cy - LIGHT[1] * shade);
      p.set(x, y, lit && !dark ? t[2] : dark ? t[0] : t[1]);
    }
  }
}
/** One colour over a shape. */
function flat(p: Px, inside: Inside, c: string): void {
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) if (inside(x + 0.5, y + 0.5)) p.set(x, y, c);
}
/** Recolour what is already painted inside a shape (a seam, a band of a wrap). */
function over(p: Px, inside: Inside, c: string): void {
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) if (p.has(x, y) && inside(x + 0.5, y + 0.5)) p.set(x, y, c);
}
/** A part painted on a sheet of its own and laid on the picture with the style's dark seam all round it. */
function part(p: Px, paint: (sheet: Px) => void): void {
  const sheet = new Px(p.w, p.h);
  paint(sheet);
  sheet.outline(INK);
  p.blit(sheet, 0, 0);
}
/** A frame turned to `deg` about `o`: a place `u` along it and `v` across it (v more than 0 to the right of the way it goes), in picture pixels; and back. */
function frame(o: Pt, deg: number): { at: (u: number, v: number) => Pt; of: (x: number, y: number) => Pt } {
  const c = Math.cos(rad(deg));
  const s = Math.sin(rad(deg));
  return {
    at: (u, v) => [o[0] + u * c - v * s, o[1] + u * s + v * c],
    of: (x, y) => {
      const dx = x - o[0];
      const dy = y - o[1];
      return [dx * c + dy * s, -dx * s + dy * c];
    },
  };
}
/** A star of light: `n` points about c, `r` to their tips and `r * dip` between them. */
function star(c: Pt, r: number, n: number, dip: number, turn = 0): Inside {
  return (x, y) => {
    const dx = x - c[0];
    const dy = y - c[1];
    const d = Math.hypot(dx, dy);
    const a = Math.atan2(dy, dx) - rad(turn);
    const k = Math.abs(Math.cos((a * n) / 2));
    return d <= r * (dip + (1 - dip) * k ** 3);
  };
}

// ---------------------------------------------------------------------------------------------
// PUNCH (TAP)

/**
 * Punch: his big wrapped fist driven straight out at you, knuckles first, the linen over them; a green burst behind it and
 * the air streaking off it in green, the way it came.
 */
export function vetPunchIcon(): Px {
  const p = new Px(N, N);
  // THE BURST behind it, off its knuckles: a star of green, lighter toward its heart, white at its middle
  const C: Pt = [16.5, 13.5];
  flat(p, star(C, 16.5, 8, 0.42, 6), VET_GREEN[0]);
  flat(p, star(C, 15.0, 8, 0.42, 6), VET_GREEN[2]);
  flat(p, star(C, 12.0, 8, 0.46, 28.5), VET_GREEN[3]);
  flat(p, star(C, 9.0, 8, 0.5, 28.5), VET_GREEN[4]);
  flat(p, egg(C, 6.0, 6.0), WHITE);
  // HIS FOREARM behind it, going away from you down to the right: wrapped at the wrist, bare skin beyond
  part(p, (s) => {
    solid(s, limb([19, 21], [31, 33], 4.4, 4.0), SKIN, 1.5, 2.0);
    const wrap = limb([19, 21], [24.5, 26.5], 5.0, 4.6);
    solid(s, wrap, LINEN, 1.4, 2.0);
    over(s, both(wrap, (x, y) => Math.abs((((x + y * 0.4) % 3.0) + 3.0) % 3.0 - 1.5) < 0.45), LINEN[0]);
    over(s, both(wrap, (x, y) => Math.abs(x + y - 50.5) < 1.0), STRAP[1]);
  });
  // THE FIST: the back of the hand wrapped in linen across the top, the four fingers folded down in front of you
  part(p, (s) => {
    // (the hand: a broad, blocky shape, its corners rounded)
    const box = (x: number, y: number): boolean => Math.hypot(Math.max(Math.abs(x - 15.0) - 6.0, 0), Math.max(Math.abs(y - 17) - 4.2, 0)) <= 3.2;
    const knuckles = [8.5, 12.5, 16.5, 20.4].map((x, i) => egg([x, i === 3 ? 10.6 : i === 0 ? 10.0 : 9.6], 2.2, 2.4));
    const hand = any(box, ...knuckles);
    solid(s, hand, LINEN, 1.6, 2.2);
    over(s, both(hand, (x, y) => y > 10 && Math.abs((((x - y * 0.7) % 3.2) + 3.2) % 3.2 - 1.6) < 0.45), LINEN[0]);
    // (the four fingers, side by side, each a column with its knuckle at the top: lit on its left, dark on its right)
    const cols: [number, number][] = [[6.6, 11.6], [10.6, 11.0], [14.6, 11.0], [18.6, 12.2]];
    cols.forEach(([x0, top]) => {
      const finger = (x: number, y: number): boolean => x > x0 && x < x0 + 3.9 && y > top && y < 21.6 && !(y < top + 1.2 && (x < x0 + 0.8 || x > x0 + 3.1));
      flat(s, finger, SKIN[1]);
      over(s, both(finger, (x) => x < x0 + 1.1), SKIN[2]);
      over(s, both(finger, (x) => x > x0 + 2.9), SKIN[0]);
      over(s, both(finger, (x, y) => y < top + 2.2 && x > x0 + 0.8 && x < x0 + 2.9), SKIN[2]);
      over(s, both(finger, (x, y) => y > 20.0), SKIN[0]);
    });
    // (the linen over the knuckles, a band across the top of the fingers)
    const band = both(hand, (x, y) => y < 11.4 + (x > 18.6 ? 1.0 : 0) && y > 6);
    solid(s, band, LINEN, 1.3, 1.4);
    // (the creases of the wrap between one knuckle and the next)
    for (const x of [10.55, 14.55, 18.55]) over(s, both(band, (x2, y) => Math.abs(x2 - x) < 0.5 && y > 8.5), LINEN[0]);
  });
  part(p, (s) => {
    // (the thumb, folded across the first two fingers, its root at the hand's side, its nail at its tip)
    const thumb = (x: number, y: number): boolean => seg(x, y, [5.6, 19.2], [14.4, 18.6]).d <= 2.3;
    solid(s, thumb, SKIN, 1.3, 1.6);
    over(s, both(thumb, (x, y) => x > 13.6 && y < 18.6), SKIN[2]);
  });
  return p;
}

// ---------------------------------------------------------------------------------------------
// KICK (HOLD)

/** Kick: his wrapped shin and foot whipping round from the knee, and the hot orange crescent of the path it has cut. */
export function vetKickIcon(): Px {
  const p = new Px(N, N);
  // (it whips round the knee, over the top from the left, and comes down on the right)
  const knee: Pt = [10.5, 22];
  const R = 16.5;
  const a0 = 212;
  const a1 = 338;
  const angleOf = (x: number, y: number): number => {
    const a = (Math.atan2(y - knee[1], x - knee[0]) * 180) / Math.PI;
    return a < 0 ? a + 360 : a;
  };
  // THE CRESCENT: the path of the foot, thin at its tail, thick and white-hot at its head
  const crescent = (inner: number, outer: number, from = a0): Inside => (x, y) => {
    const a = angleOf(x, y);
    if (a < from || a > a1) return false;
    const u = (a - a0) / (a1 - a0);
    const d = Math.hypot(x - knee[0], y - knee[1]);
    const thick = 0.6 + 6.4 * u ** 1.4;
    return d <= R + outer * thick && d >= R - inner * thick;
  };
  flat(p, crescent(1.0, 0.2), VET_ORANGE[1]);
  flat(p, crescent(0.74, 0.08, a0 + 16), VET_ORANGE[2]);
  flat(p, crescent(0.44, -0.04, a0 + 38), VET_ORANGE[3]);
  flat(p, crescent(0.18, -0.16, a0 + 70), VET_ORANGE[4]);
  // (a second, fainter sweep inside it, the air whipped round with it)
  flat(p, (x, y) => {
    const a = angleOf(x, y);
    if (a < 238 || a > a1 - 6) return false;
    const u = (a - 238) / (a1 - 6 - 238);
    return Math.abs(Math.hypot(x - knee[0], y - knee[1]) - (R - 8.6 + u * 1.2)) < 0.5 + u * 0.7;
  }, VET_ORANGE[1]);
  // THE LEG: the thigh in his trousers, out of the corner, folded at the knee
  part(p, (s) => {
    const thigh = any(limb([2, 35], [8.2, 25.5], 4.2, 4.9), egg([knee[0] - 0.2, knee[1] + 0.2], 4.2, 4.0));
    solid(s, thigh, CLOTH, 1.6, 2.4);
    // (the folds of the cloth bunched behind the knee)
    for (const [cx, cy, r] of [[14.5, 29.5, 5.5], [15.5, 32.5, 6.5]] as const) over(s, both(thigh, (x, y) => Math.abs(Math.hypot(x - cx, y - cy) - r) < 0.5 && x < cx), CLOTH[0]);
  });
  // (the shin and the foot along the way out from the knee to the crescent's head, pointed)
  const S = frame(knee, -21);
  const L = (f: (u: number, v: number) => boolean): Inside => (x, y) => {
    const [u, v] = S.of(x, y);
    return f(u, v);
  };
  part(p, (s) => {
    // (the shin, wrapped in linen from the knee down, its bands slanting; a strap tied under the knee)
    const shin = L((u, v) => {
      const { d, t } = seg(u, v, [2.8, 0], [12.4, 0]);
      return d <= 2.9 - 0.7 * t;
    });
    solid(s, shin, LINEN, 1.3, 1.8);
    over(s, both(shin, L((u, v) => u > 5 && Math.abs((((u - v * 0.6) % 2.7) + 2.7) % 2.7 - 1.35) < 0.4)), LINEN[0]);
    over(s, both(shin, L((u) => u > 3.0 && u < 4.8)), STRAP[1]);
    over(s, both(shin, L((u, v) => u > 3.0 && u < 4.8 && v < -1.0)), STRAP[2]);
  });
  part(p, (s) => {
    // (the foot, pointed out along the shin's line: its heel behind the ankle, its arch wrapped, its toes bare)
    const foot = L((u, v) => {
      const sole = seg(u, v, [12.2, 0.4], [19.6, -0.4]);
      return sole.d <= 2.5 - 1.1 * sole.t || Math.hypot(u - 12.6, v - 1.6) <= 1.8;
    });
    solid(s, foot, LINEN, 1.2, 1.7);
    over(s, both(foot, L((u, v) => u > 13.6 && u < 17 && Math.abs((((u + v * 0.7) % 2.6) + 2.6) % 2.6 - 1.3) < 0.4)), LINEN[0]);
    const toes = both(foot, L((u) => u > 17.0));
    over(s, toes, SKIN[1]);
    over(s, both(toes, L((u, v) => v < -0.7)), SKIN[2]);
    over(s, both(toes, L((u, v) => v > 0.6)), SKIN[0]);
  });
  // (where it lands: a hot spark off the foot)
  const tip = S.at(21.6, -0.6);
  flat(p, star(tip, 3.4, 4, 0.3, 45), VET_ORANGE[3]);
  flat(p, egg(tip, 1.0, 1.0), WHITE);
  return p;
}

// ---------------------------------------------------------------------------------------------
// JUMP (SWIPE)

/** One of his feet seen from the side, toes pointed down, springing up: his trousers to the ankle, the linen wrapped round the arch, bare toes and heel. */
function springingFoot(p: Px, ankle: Pt, lean: number, h: number): void {
  const F = frame(ankle, 90 + lean);
  const L = (f: (u: number, v: number) => boolean): Inside => (x, y) => {
    const [u, v] = F.of(x, y);
    return f(u, v);
  };
  // (the leg above it, in his trousers, up out of the picture; the cuff gathered at the ankle)
  part(p, (s) => {
    const leg = L((u, v) => u < -1 && u > -40 && Math.abs(v + u * 0.06) <= 2.6 + Math.max(0, -u - 4) * 0.1);
    solid(s, leg, CLOTH, 1.4, 2.0);
    over(s, both(leg, L((u, v) => Math.abs(u + v * 0.5 + 6.5) < 0.45)), CLOTH[0]);
    solid(s, L((u, v) => u <= -0.5 && u >= -3.0 && Math.abs(v) <= 3.3), CLOTH, 1.2, 1.6);
  });
  part(p, (s) => {
    // (the foot: from the ankle down to the pointed toes, the heel behind)
    const foot = L((u, v) => {
      const a = seg(u, v, [0, 0], [h, 1.3]);
      return a.d <= 2.6 - 1.05 * a.t || Math.hypot(u - 0.6, v + 2.0) <= 1.8;
    });
    solid(s, foot, LINEN, 1.3, 1.8);
    // (the wrap's bands, round the arch and the ankle)
    over(s, both(foot, L((u, v) => u < h - 3 && Math.abs((((u + v * 0.6) % 2.6) + 2.6) % 2.6 - 1.3) < 0.42)), LINEN[0]);
    // (the bare heel, and the toes)
    over(s, both(foot, L((u, v) => Math.hypot(u - 0.4, v + 2.5) < 1.3)), SKIN[2]);
    const toes = both(foot, L((u) => u > h - 2.6));
    over(s, toes, SKIN[1]);
    over(s, both(toes, L((u, v) => v > 1.2)), SKIN[0]);
    over(s, both(toes, L((u, v) => v < 0.2)), SKIN[2]);
  });
}

/** Jump: his two wrapped feet springing up, toes pointed, out of a white burst of dust, the air streaking past them. */
export function vetJumpIcon(): Px {
  const p = new Px(N, N);
  const floor: Pt = [16, 27.5];
  // THE BURST OF DUST: spikes of it flung up and out off the floor, white
  for (const [deg, long, k] of [[-166, 15, 1], [-142, 15, 2], [-117, 13, 2], [-63, 13, 2], [-38, 15, 2], [-14, 15, 1]] as const) {
    const tipAt: Pt = [floor[0] + Math.cos(rad(deg)) * long, floor[1] + Math.sin(rad(deg)) * long * 0.8];
    flat(p, limb(floor, tipAt, 2.8, 0.4), VET_WHITE[k]);
    flat(p, limb(floor, tipAt, 1.2, 0.2), VET_WHITE[k + 2]);
  }
  // (the cloud along the floor)
  const puffs: [number, number, number, number][] = [[4.6, 28.4, 3.8, 2.8], [10.2, 26.6, 4.6, 3.8], [16, 27.2, 5.0, 4.0], [21.8, 26.6, 4.6, 3.8], [27.4, 28.4, 3.8, 2.8]];
  part(p, (s) => {
    const cloud = any(...puffs.map(([x, y, rx, ry]) => egg([x, y], rx, ry)));
    solid(s, cloud, [VET_WHITE[1], VET_WHITE[3], WHITE], 1.6, 1.6);
    // (the bellies of the puffs in their shade)
    for (const [x, y, rx, ry] of puffs) over(s, both(cloud, egg([x + 1.0, y + 1.3], rx * 0.62, ry * 0.5)), VET_WHITE[2]);
  });
  // THE AIR streaking past: lines straight up from the dust, the way he went
  for (const [x, y0, y1] of [[2, 9, 20], [7, 3, 15], [25, 3, 15], [30, 9, 20]] as const) {
    for (let y = y0; y <= y1; y++) p.set(x, y, y < y0 + 3 ? VET_WHITE[1] : y > y1 - 3 ? VET_WHITE[2] : WHITE);
  }
  // HIS FEET: the far one a little higher and behind, the near one in front
  springingFoot(p, [19.5, 4.5], -12, 10.5);
  springingFoot(p, [13, 7.5], -8, 11.5);
  return p;
}

/** The Veteran's three, by what they are: his tap, his hold, his swipe. */
export const VETERAN_ICONS = { punch: vetPunchIcon, kick: vetKickIcon, jump: vetJumpIcon } as const;

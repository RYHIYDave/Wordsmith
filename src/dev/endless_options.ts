// Concept art, not part of the game: TEN PICTURES FOR ENDLESS MODE'S SPLASH, for the owner to pick from (the art chat, 11 Nov 2026).
//
// Shown the hall of gates painted full size (art/endless_splash.ts) and asked whether it was right, his words, 11 Nov 2026, by
// 08:17 (Eastern): “Gimme 10 options”. Read as with the start screen's ten (dev/title_options.ts, 21 Oct): ten stills, each a
// different direction, each painted small (TW x TH, half the size the game would paint it), none of them moving yet, each with a
// line of what would move in it. The one he picks is painted full size and given its moment. The first of the ten is the hall of
// gates he has seen, as it is painted.
//
// On every one the word ENDLESS is lettered by the game (`wordY`: the row of its top here). What glows on a friend is cyan; pink
// burning to gold is the enemy's; an honest flame is orange.

import { C, Pic, TH, TW, bay, clamp01, fbm, h, mix, ridge, rnd, scale } from './title_options_kit';

export interface EndlessOption {
  n: number;
  name: string;
  /** What would move in it, in a line. */
  life: string;
  /** The row of the top of ENDLESS on it (21 rows tall here). */
  wordY: number;
  /** Null: the hall of gates as it is painted (art/endless_splash.ts). */
  paint: ((p: Pic) => void) | null;
}

const NIGHT = h('#05040f');
const DEEP = h('#07061a');
const CY = h('#22d0e0');
const CY_HI = h('#b8fff8');
const CY_LO = h('#0c6a80');
const PK = h('#ff4f8a');
const PK_LO = h('#c0206a');
const PLUM = h('#7a1058');
const GOLD = h('#ffb070');
const GOLD_HI = h('#fff0a0');
const FIRE = h('#ff8a2a');
/** The standing stones' violet, dark to light. */
const VIO = ['#11122e', '#191a44', '#262a62', '#3a4088', '#5660ac', '#7e8ad0'].map(h);
/** Each floor's own stone (dark, mid, light): the prison, the canyon, the fen, the High City, the quarry, the town. */
const STONES: readonly (readonly C[])[] = [
  ['#2c2a36', '#4e4a5a', '#7c7690'],
  ['#6c463a', '#be8262', '#d69870'],
  ['#2e3a22', '#5a5661', '#837e88'],
  ['#64606c', '#c4bebc', '#e2dcd4'],
  ['#4d465c', '#8a8094', '#aaa1a6'],
  ['#52444c', '#958474', '#ae9a88'],
].map((r) => r.map(h));
const stoneOf = (i: number): readonly C[] => STONES[((i % 6) + 6) % 6];

/** A little knight seen from behind, his blade alight (10 x 13). */
const KNIGHT = ['....hh....', '...hhHH...', '...hHHHr..', '..rrrrrrr.', '..mRRRRm.c', '..mRRRRm.c', '..mHHHHm.C', '...HHHH..C', '...mHHm..c', '...m..m..s', '...m..m...', '..mm..mm..'];
const KNIGHT_KEY: Record<string, C> = { h: h('#b4c0d0'), H: h('#7a879c'), m: h('#4a5466'), r: h('#c02838'), R: h('#6e1020'), c: CY, C: CY_HI, s: h('#2e3440') };

// ---------------------------------------------------------------------------------------------
// 2. THE STAIR WITH NO BOTTOM: straight down a round shaft, ring under ring of every floor's stone, a stair winding down its
// wall, the enemy's fire at the bottom.
function paintStair(p: Pic): void {
  const cx = 128;
  const cy = 76;
  for (let y = 0; y < TH; y++) {
    for (let x = 0; x < TW; x++) {
      const dx = x + 0.5 - cx;
      const dy = (y + 0.5 - cy) * 1.1;
      const r = Math.hypot(dx, dy);
      if (r < 5) {
        p.set(x, y, r < 1.8 ? GOLD_HI : r < 3.4 ? GOLD : PK);
        continue;
      }
      const kf = Math.log(176 / r) / Math.log(1 / 0.76);
      const k = Math.floor(kf);
      const f = kf - k;
      const st = stoneOf(k);
      const ang = Math.atan2(dy, dx);
      const a = (ang / (Math.PI * 2)) * 16 + (k & 1 ? 0.5 : 0) + 100;
      const fa = a - Math.floor(a);
      // (the light from the upper left: the wall across the shaft from it is lit)
      const facing = Math.cos(ang - 0.75);
      let c = st[facing > 0.35 ? 2 : facing < -0.3 ? 0 : 1];
      if (rnd(Math.floor(a), k, 3) < 0.25) c = scale(c, 0.85);
      if (f < 0.08 || fa < 0.05 + 0.3 / Math.max(6, r)) c = scale(c, 0.45);
      // THE STAIR: on every ring a flight along the wall, each a little further round
      let sa = (ang - k * 0.95) % (Math.PI * 2);
      if (sa < 0) sa += Math.PI * 2;
      if (sa < 1.7 && f > 0.52) {
        c = mix(st[2], 0xffffff, 0.12);
        if ((sa * 9) % 1 < 0.22) c = scale(c, 0.55);
        if (f < 0.6) c = scale(c, 0.5);
      }
      // (the dark with depth, and the fire's light from below)
      c = mix(c, DEEP, 0.22 + clamp01(k / 11) * 0.62);
      if (k >= 6) c = mix(c, k >= 9 ? PK_LO : PLUM, clamp01((k - 5) / 6) * 0.6);
      p.set(x, y, c);
    }
  }
  // (a torch at the head of each flight; the waypoint's light on the brink, lower left)
  for (let k = 1; k < 7; k++) {
    const r = 176 * 0.76 ** (k + 0.75);
    const a = k * 0.95 + 0.05;
    const tx = cx + Math.cos(a) * r;
    const ty = cy + (Math.sin(a) * r) / 1.1;
    p.glow(tx, ty, 9 - k, 9 - k, FIRE, 0.5, 3);
    p.set(tx, ty, GOLD_HI);
  }
  p.glow(26, 112, 64, 34, CY, 0.38, 4);
  p.glow(cx, cy, 22, 20, PK, 0.55, 4);
  p.haze(128, 14, 140, 26, NIGHT, 0.6, 3);
}

// ---------------------------------------------------------------------------------------------
// 3. THE ROAD GOES ON: night, the title's hills, a road of flags winding away through gate after gate to the horizon, where the
// enemy's light lies like a wrong dawn.
function paintRoad(p: Pic): void {
  const HOR = 50;
  const XR = 152;
  p.vgrad(0, HOR + 2, ['#04051a', '#060a24', '#0c1636', '#1a2a50'].map(h));
  p.stars(0, HOR - 8, 7, 70);
  // (the aurora, his light, across the top)
  for (let x = 0; x < TW; x++) {
    const hem = 20 + Math.sin(x * 0.05) * 6 + Math.sin(x * 0.13 + 2) * 3;
    for (let y = Math.floor(hem) - 14; y < hem; y++) p.add(x, y, CY, 0.16 * clamp01((y - hem + 14) / 14) * (0.6 + 0.4 * Math.sin(x * 0.4)));
  }
  // (the wrong dawn, behind the mountains where the road goes through them)
  p.glow(XR, HOR - 3, 74, 24, PK_LO, 0.95, 5);
  p.glow(XR, HOR - 1, 28, 11, GOLD, 0.9, 3);
  for (let x = 0; x < TW; x++) {
    const m = ridge(x, HOR - 13, 14, 0.035, 11, 0.6) + Math.max(0, 1 - Math.abs(x - XR) / 28) * 17;
    for (let y = Math.floor(m); y < HOR + 3; y++) p.set(x, y, y < m + 1.5 && Math.abs(x - XR) < 60 ? h('#3a1848') : h('#0c1230'));
  }
  // (the prison on its peak)
  const peak = Math.floor(ridge(40, HOR - 13, 14, 0.035, 11, 0.6));
  p.rect(38, peak - 9, 5, 10, h('#0a0f26'));
  p.rect(36, peak - 11, 9, 3, h('#0a0f26'));
  p.set(40, peak - 6, FIRE);
  // (the land in three folds, the nearer the lighter under the moon)
  for (const [base, amp, col, seed] of [[HOR + 3, 3, '#0f172c', 5], [HOR + 20, 7, '#131e36', 6], [HOR + 44, 9, '#182640', 7]] as const) {
    for (let x = 0; x < TW; x++) {
      const top = ridge(x, base, amp, 0.022, seed);
      for (let y = Math.floor(top); y < TH; y++) p.set(x, y, y < top + 1.2 ? mix(h(col), 0xffffff, 0.14) : bay(x, y) < 0.18 ? mix(h(col), 0xffffff, 0.07) : h(col));
    }
  }
  const roadX = (t: number): number => 128 + 58 * Math.sin(t * 5.6) * (1 - t) ** 1.1 + (XR - 128) * t;
  const roadY = (t: number): number => HOR + 2 + (TH - HOR + 4) * (1 - t) ** 2.2;
  const roadW = (t: number): number => 19 * (1 - t) ** 2 + 0.6;
  // THE ROAD, far to near, and the gates over it
  const gates = [0.9, 0.82, 0.72, 0.6, 0.46, 0.3, 0.13];
  let gi = 0;
  for (let i = 0; i <= 900; i++) {
    const t = 1 - i / 900;
    const x = roadX(t);
    const y = roadY(t);
    const w = roadW(t);
    const row = Math.floor((1 - t) ** 0.6 * 44);
    for (let xx = Math.floor(x - w); xx <= x + w; xx++) {
      let c = row & 1 ? h('#6a76c0') : h('#7e8ad0');
      if (w > 3 && Math.abs(xx - x) > w - 1.3) c = h('#262a62');
      else if (w > 5 && Math.abs(xx - x) < 0.6 && row % 3 === 0) c = h('#3a4088');
      p.set(xx, y, mix(mix(c, DEEP, t * 0.55), PK_LO, clamp01((t - 0.6) / 0.4) * 0.7));
    }
    if (gi < gates.length && t <= gates[gi]) {
      const s = 34 * (1 - t) ** 1.6 + 3;
      const st = stoneOf(gi + 1);
      const c = mix(mix(st[1], DEEP, 0.1 + t * 0.6), PLUM, clamp01(t - 0.5) * 0.8);
      const post = Math.max(1, s * 0.2);
      const out = Math.max(w + post * 0.5, s * 0.55);
      p.rect(x - out - post / 2, y - s, post, s + 1, mix(c, 0xffffff, 0.12));
      p.rect(x + out - post / 2, y - s, post, s + 1, scale(c, 0.65));
      p.rect(x - out - post, y - s - post, out * 2 + post * 2, post, c);
      p.rect(x - out - post, y - s - post, out * 2 + post * 2, 1, mix(c, 0xffffff, 0.25));
      if (s > 7) {
        p.set(x - out + post / 2 + 1, y - s * 0.55, GOLD_HI);
        p.glow(x - out + post / 2 + 1, y - s * 0.55, s * 0.36, s * 0.36, FIRE, 0.5, 3);
      }
      gi++;
    }
  }
  // (the waypoint where the road begins)
  p.ellipse(128, 111, 30, 6, (x, y, n) => (n > 0.86 ? VIO[4] : Math.abs(n - 0.6) < 0.08 || n < 0.2 ? CY_HI : VIO[2]));
  p.glow(128, 110, 60, 16, CY, 0.5, 4);
}

// ---------------------------------------------------------------------------------------------
// 4. THE TOWER OF EVERY FLOOR: a tower with no top, each storey another floor's stone, up through the clouds and out of sight.
function paintTower(p: Pic): void {
  p.vgrad(0, TH, ['#0a0616', '#0c0a22', '#0e1230', '#101a3c', '#0c1430'].map(h));
  p.stars(0, 70, 13, 60);
  // (the enemy's light behind the cloud at its top)
  p.glow(128, 2, 70, 26, PK_LO, 0.8, 5);
  p.glow(128, 0, 26, 10, GOLD, 0.7, 3);
  const half = (y: number): number => 16 + 32 * (y / TH) ** 1.2;
  let y = TH;
  let k = 0;
  while (y > 0) {
    const tall = Math.max(2, Math.round(3 + 11 * (y / TH) ** 1.6));
    const st = stoneOf(k);
    for (let yy = y - tall; yy < y; yy++) {
      const hw = half(yy);
      for (let x = Math.floor(128 - hw); x <= 128 + hw; x++) {
        const u = (x - 128) / hw;
        // (round: lit on its left from the moon, dark on its right)
        let c = u < -0.45 ? st[2] : u > 0.35 ? st[0] : st[1];
        if (yy === y - 1 || (tall > 5 && (x + (yy & 4 ? 3 : 0)) % 7 === 0 && (yy - y + tall) % 4 !== 3)) c = scale(c, 0.6);
        if (yy === y - tall) c = mix(c, 0xffffff, 0.18);
        p.set(x, yy, mix(c, DEEP, 0.06 + 0.42 * (1 - yy / TH)));
      }
      // (a window, lit, and the stair wound round the outside)
      if (tall > 4 && yy === y - Math.floor(tall / 2)) {
        const wx = 128 + half(yy) * (0.5 * Math.sin(k * 2.3));
        p.set(wx, yy, k % 3 === 0 ? FIRE : GOLD_HI);
        p.set(wx, yy - 1, FIRE);
      }
    }
    const sx = 128 + half(y) * Math.sin(k * 0.9);
    p.line(sx - 5, y - 1, sx + 5, y - tall, scale(st[2], 0.9), 0.7);
    y -= tall;
    k++;
  }
  // (cloud across it, twice: so high does it go)
  for (const [cy, a] of [[86, 0.8], [30, 0.85], [8, 0.9]] as const) {
    for (let x = 0; x < TW; x++) {
      const top = cy + (fbm(x * 0.04, cy, 3) - 0.5) * 12;
      const thick = 3 + fbm(x * 0.07, cy + 9, 4) * 6;
      for (let yy = Math.floor(top); yy < top + thick; yy++) p.over(x, yy, mix(h('#232a52'), cy < 20 ? PLUM : h('#3a4476'), (yy - top) / thick < 0.3 ? 0.7 : 0.2), a * (bay(x, yy) < 0.8 ? 1 : 0.6));
    }
  }
  p.glow(128, 114, 70, 12, CY, 0.4, 3);
}

// ---------------------------------------------------------------------------------------------
// 5. EVERY FLOOR AT ONCE: the game's own view from above, room after room of every floor laid side by side to every edge, the
// waypoint in the middle of it.
function paintPatchwork(p: Pic): void {
  const cx = 128;
  const cy = 74;
  for (let y = 0; y < TH; y++) {
    for (let x = 0; x < TW; x++) {
      const sx = (x + 0.5 - cx) / 12;
      const sy = (y + 0.5 - cy) / 6;
      const u = (sx + sy) / 2 + 40;
      const v = (sy - sx) / 2 + 40;
      const ru = Math.floor(u / 4);
      const rv = Math.floor(v / 4);
      const st = stoneOf(Math.floor(rnd(ru, rv, 21) * 6));
      const fu = u / 4 - ru;
      const fv = v / 4 - rv;
      const tu = u - Math.floor(u);
      const tv = v - Math.floor(v);
      let c = st[1];
      const tile = rnd(Math.floor(u), Math.floor(v), 22);
      if (tile < 0.3) c = st[0];
      else if (tile > 0.82) c = st[2];
      if (tu < 0.09 || tv < 0.09) c = scale(c, 0.7);
      // (the rooms' walls: a lit top, a dark face, a doorway in each)
      const door = Math.abs(fv - 0.5) < 0.12 || Math.abs(fu - 0.5) < 0.12;
      if ((fu < 0.07 || fv < 0.07) && !door) c = mix(st[2], 0xffffff, 0.2);
      else if ((fu < 0.16 || fv < 0.16) && !door) c = scale(st[0], 0.55);
      // (the dark with distance; the enemy's eyes in the far rooms)
      const far = clamp01(Math.hypot((x - cx) / 150, (y - cy - 8) / 62));
      c = mix(c, DEEP, clamp01(far * 1.1 - 0.22 + (bay(x, y) - 0.5) * 0.08));
      p.set(x, y, c);
    }
  }
  for (let i = 0; i < 46; i++) {
    const x = Math.floor(rnd(i, 1, 31) * TW);
    const y = Math.floor(rnd(i, 2, 31) * TH);
    if (Math.hypot((x - cx) / 100, (y - cy) / 44) < 1) continue;
    p.set(x, y, PK);
    p.set(x + 2, y, PK);
    p.glow(x + 1, y, 4, 3, PK_LO, 0.5, 2);
  }
  // (the waypoint, awake, in the middle room)
  p.ellipse(cx, cy + 2, 16, 8, (x, y, n) => (n > 0.84 ? VIO[4] : Math.abs(n - 0.62) < 0.1 || n < 0.22 ? CY_HI : VIO[2]));
  p.glow(cx, cy + 1, 46, 24, CY, 0.55, 4);
  p.haze(128, 12, 150, 24, NIGHT, 0.7, 3);
}

// ---------------------------------------------------------------------------------------------
// 6. THE SERPENT THAT EATS ITS TAIL: a ring of old stone, a serpent swallowing itself, the word inside it.
function paintSerpent(p: Pic): void {
  p.fill(NIGHT);
  for (let y = 0; y < TH; y++) for (let x = 0; x < TW; x++) if (bay(x, y) < 0.35 - Math.hypot((x - 128) / 150, (y - 60) / 70) * 0.4) p.set(x, y, h('#0b0a22'));
  const cx = 128;
  const cy = 59;
  const rx = 108;
  const ry = 47;
  for (let y = 0; y < TH; y++) {
    for (let x = 0; x < TW; x++) {
      const dx = (x + 0.5 - cx) / rx;
      const dy = (y + 0.5 - cy) / ry;
      const n = Math.hypot(dx, dy);
      let ang = Math.atan2(dy, dx) + Math.PI * 0.72;
      if (ang < 0) ang += Math.PI * 2;
      ang %= Math.PI * 2;
      // (thick behind the head, thin at the tail it is swallowing)
      const thick = 0.085 + 0.1 * (1 - ang / (Math.PI * 2));
      const off = (n - 1) / thick;
      if (Math.abs(off) > 1) continue;
      // (scales: rows along it, lit from the upper left)
      const sc = Math.floor(ang * 26) + (Math.floor((off + 1) * 2.5) & 1 ? 0.5 : 0);
      const lit = -dx * 0.55 - dy * 0.75 + off * (dy < 0 ? -0.5 : 0.5);
      let c = VIO[lit > 0.45 ? 5 : lit > 0.1 ? 4 : lit > -0.3 ? 3 : 2];
      if ((ang * 26 + (Math.floor((off + 1) * 2.5) & 1 ? 0.5 : 0)) % 1 < 0.2 || Math.abs(off) > 0.86) c = VIO[1];
      if (rnd(Math.floor(sc), Math.floor((off + 1) * 2.5), 41) < 0.12) c = h('#3c4b2b');
      p.set(x, y, c);
    }
  }
  // (its head, the tail in its jaws, the enemy's eye)
  const hx = cx + Math.cos(-Math.PI * 0.72) * rx;
  const hy = cy + Math.sin(-Math.PI * 0.72) * ry;
  p.poly([[hx - 20, hy - 3], [hx - 4, hy - 14], [hx + 14, hy - 10], [hx + 22, hy + 1], [hx + 10, hy + 9], [hx - 12, hy + 10]], VIO[4]);
  p.poly([[hx - 20, hy - 3], [hx - 4, hy - 14], [hx + 14, hy - 10], [hx + 4, hy - 6], [hx - 10, hy - 2]], VIO[5]);
  p.poly([[hx - 20, hy - 1], [hx - 6, hy + 2], [hx - 12, hy + 10]], VIO[1]);
  p.line(hx - 19, hy, hx - 4, hy + 3, NIGHT);
  for (let i = 0; i < 4; i++) p.set(hx - 16 + i * 3, hy + 2 + (i & 1), 0xe9ecff);
  p.rect(hx + 5, hy - 4, 4, 3, PK);
  p.set(hx + 6, hy - 3, GOLD_HI);
  p.glow(hx + 7, hy - 3, 13, 10, PK, 0.6, 3);
  // (the word's light inside the ring)
  p.glow(cx, cy, 78, 26, h('#5660ac'), 0.28, 4);
}

// ---------------------------------------------------------------------------------------------
// 7. THE BOOK WITH NO LAST PAGE: the book he fell asleep over, its pages lifting off one after another and winding away into
// the dark, each a floor.
function paintBook(p: Pic): void {
  p.vgrad(0, TH, ['#05040f', '#07061a', '#0c0a22', '#14102a'].map(h));
  // (the desk lamp's light on the desk)
  p.glow(128, 108, 120, 30, FIRE, 0.22, 4);
  const paper = h('#cbbfa8');
  const page = (x0: number, x1: number, lift: number): void => {
    p.poly([[x0, 108], [128, 98 - lift], [128, 114], [x0 - 6, 117]], (x, y) => (bay(x, y) < 0.2 ? h('#988c7c') : paper));
    for (let r = 0; r < 4; r++) p.line(x0 + 8 + (x0 > 128 ? -16 : 0), 107 + r * 2 - (r > 1 ? 0 : 1), (x0 + 128) / 2 + (x1 > 0 ? 6 : -6), 102 + r * 2, h('#5a5366'), 0.6);
  };
  page(52, 1, 0);
  page(204, -1, 0);
  p.rect(126, 96, 4, 20, h('#4a2c1a'));
  // THE PAGES, far to near, winding up and away
  for (let i = 15; i >= 0; i--) {
    const t = i / 15;
    const x = 128 - 72 * Math.sin(t * 5.78) * (1 - 0.25 * t) + 80 * t ** 3;
    const y = 92 - 82 * t ** 0.9;
    const s = 13 * (1 - t) ** 1.2 + 2.5;
    const tilt = Math.sin(t * 5.4 + 1.2) * 0.9;
    const st = stoneOf(i);
    const c = mix(mix(paper, st[1], 0.55), DEEP, t * 0.62);
    const ax = Math.cos(tilt) * s;
    const ay = Math.sin(tilt) * s * 0.6;
    p.poly([[x - ax, y - ay - s * 0.6], [x + ax, y + ay - s * 0.6], [x + ax * 0.9, y + ay + s * 0.55], [x - ax * 0.9, y - ay + s * 0.55]], c);
    p.line(x - ax, y - ay - s * 0.6, x + ax, y + ay - s * 0.6, mix(c, 0xffffff, 0.3));
    // (a line of his letters on each, cyan near, the enemy's far off)
    if (s > 5) for (let k = -1; k <= 1; k++) p.rune(x + k * s * 0.5 - 1, y - 2, i + k + 2, t > 0.66 ? PK : CY, 1);
    else p.set(x, y, t > 0.66 ? PK : CY);
    p.glow(x, y, s * 1.3, s, t > 0.66 ? PK_LO : CY_LO, 0.4, 2);
  }
  p.glow(236, 8, 30, 14, PK, 0.5, 3);
}

// ---------------------------------------------------------------------------------------------
// 8. THE HORDE WITHOUT END: the dark full of the enemy's eyes, row behind row to the horizon; one blade alight before them.
function paintHorde(p: Pic): void {
  const HOR = 38;
  p.vgrad(0, HOR, ['#0a0616', '#1a0a28', '#3a1040', '#7a1058'].map(h));
  p.glow(128, HOR, 150, 16, PK_LO, 0.5, 4);
  p.vgrad(HOR, TH, ['#16081e', '#0c0616', '#07050f', '#05040a'].map(h));
  for (let r = 0; r < 13; r++) {
    const y = HOR + 2 + r * r * 0.44;
    const sp = 3.5 + r * 1.9;
    const big = r / 12;
    for (let i = -2; i < TW / sp + 2; i++) {
      const x = i * sp + rnd(i, r, 51) * sp * 0.8;
      const yy = y + rnd(i, r, 52) * (1 + r * 0.5);
      if (y > 84 && Math.abs(x - 128) < 26 + (yy - 84)) continue;
      // (a head and shoulders out of the dark, horned or helmed, and its eyes)
      const body = mix(h('#0c0818'), h('#2a1838'), 0.25 + big * 0.5);
      if (r > 2) {
        p.ellipse(x, yy + 2 + big * 5, 2 + big * 7, 2 + big * 6, body);
        p.ellipse(x, yy, 1.5 + big * 3.5, 1.5 + big * 3.2, mix(body, 0xffffff, 0.05));
        if (rnd(i, r, 53) > 0.5) {
          p.line(x - 2 - big * 3, yy - 1, x - 3 - big * 5, yy - 3 - big * 5, body);
          p.line(x + 2 + big * 3, yy - 1, x + 3 + big * 5, yy - 3 - big * 5, body);
        } else if (rnd(i, r, 54) > 0.5) p.line(x + 4 + big * 5, yy + 6, x + 5 + big * 6, yy - 8 - big * 9, mix(body, 0xffffff, 0.1));
      }
      const gap = 1 + Math.round(big * 2);
      const e = big > 0.55 ? 2 : 1;
      p.rect(x - gap, yy, e, e, PK);
      p.rect(x + gap, yy, e, e, PK);
      if (big > 0.55) p.set(x - gap, yy, GOLD_HI), p.set(x + gap, yy, GOLD_HI);
      if (r > 5) p.glow(x, yy, 3 + big * 6, 2 + big * 4, PK_LO, 0.35, 2);
    }
  }
  // (the hero, his back to us, on the last of the light)
  p.ellipse(128, 111, 30, 6, h('#16203a'));
  p.glow(128, 104, 46, 22, CY, 0.5, 4);
  p.sprite(123, 97, KNIGHT, KNIGHT_KEY);
  p.glow(132, 102, 9, 12, CY_HI, 0.5, 3);
}

// ---------------------------------------------------------------------------------------------
// 9. THE WHEEL OF FLOORS: a great stone wheel, a floor to every spoke; a pointer over it. It turns, and stops, and turns again.
function paintWheel(p: Pic): void {
  p.vgrad(0, TH, ['#05040f', '#080720', '#0c0a2a', '#0e0c30'].map(h));
  const cx = 128;
  const cy = 134;
  const R = 90;
  for (let y = 0; y < TH; y++) {
    for (let x = 0; x < TW; x++) {
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      const r = Math.hypot(dx, dy);
      if (r > R) continue;
      const a = Math.atan2(dy, dx) + Math.PI / 2;
      const w = Math.floor((a / (Math.PI * 2)) * 20 + 100.5);
      const fw = (a / (Math.PI * 2)) * 20 + 100.5 - w;
      const st = stoneOf(Math.floor(rnd(w, 3, 61) * 6) + (w & 1));
      let c: C;
      if (r > R - 6) c = (Math.floor(a * 30) & 1 ? VIO[3] : VIO[2]);
      else if (r > R - 8 || r < 30 && r > 28) c = VIO[1];
      else if (r < 28) c = r < 12 ? (r < 5 ? GOLD_HI : r < 8 ? GOLD : PK) : mix(VIO[2], PLUM, 1 - (r - 12) / 16);
      else {
        c = st[fw < 0.5 ? 2 : 1];
        if (fw < 0.06 || fw > 0.94) c = VIO[0];
        else if (rnd(Math.floor(r / 5), w, 62) < 0.2) c = st[0];
        // (the spoke under the pointer is the one chosen: his light on it)
        if (w === 100) c = mix(c, CY_HI, 0.45);
      }
      // (lit from the upper left)
      p.set(x, y, mix(c, DEEP, clamp01(0.1 + (dx / R) * 0.25 + (r < R - 8 && r > 30 ? 0.12 : 0))));
    }
  }
  // (a sign cut in each spoke)
  for (let w = -4; w <= 4; w++) {
    const a = (w / 20) * Math.PI * 2 - Math.PI / 2;
    p.rune(cx + Math.cos(a) * 66 - 1, cy + Math.sin(a) * 66 - 2, w + 9, w === 0 ? CY_HI : VIO[0], 1);
  }
  // THE POINTER, iron, his light in it
  p.poly([[cx - 7, 36], [cx + 7, 36], [cx + 3, 42], [cx, 50], [cx - 3, 42]], h('#8a8498'));
  p.poly([[cx - 2, 38], [cx + 2, 38], [cx, 47]], CY_HI);
  p.glow(cx, 44, 22, 16, CY, 0.6, 4);
  p.glow(cx, cy - 8, 40, 26, PK, 0.5, 4);
}

// ---------------------------------------------------------------------------------------------
// 10. THE SHAFT THROUGH THE WORLD: the ground cut open from the side, floor under floor, the mine's cage going down the shaft
// through them all and out of the bottom of the picture.
function paintShaft(p: Pic): void {
  const layers = [5, 0, 4, 1, 2, 3, 0, 1, 2];
  const tops = [0, 14, 30, 44, 58, 72, 86, 98, 108, TH];
  for (let k = 0; k < layers.length; k++) {
    const st = stoneOf(layers[k]);
    for (let y = tops[k]; y < tops[k + 1]; y++) {
      for (let x = 0; x < TW; x++) {
        const wob = Math.round(Math.sin(x * 0.07 + k * 2) * 1.6);
        const yy = y + wob;
        const g = fbm(x * 0.09, yy * 0.3 + k * 9, k + 3);
        let c = st[g > 0.62 ? 2 : g < 0.42 ? 0 : 1];
        if ((yy - tops[k]) % 5 === 0 && rnd(x >> 2, yy, 71) < 0.7) c = scale(c, 0.7);
        if (y === tops[k] + (wob > 0 ? 1 : 0)) c = scale(st[0], 0.5);
        // (deeper is darker, and at the last the enemy's light comes up)
        c = mix(c, DEEP, 0.08 + 0.5 * (y / TH));
        if (y > 92) c = mix(c, PK_LO, ((y - 92) / 26) * 0.55);
        p.set(x, y, c);
      }
    }
    // (a gallery in each floor, a torch in it, and something of the floor: bars, a pool, a pillar)
    const gy = Math.floor((tops[k] + tops[k + 1]) / 2);
    const left = k & 1;
    const x0 = left ? 22 + k * 5 : 150;
    const x1 = left ? 116 : 232 - k * 4;
    for (let x = x0; x < x1; x++) for (let y = gy - 3; y <= gy + 2; y++) p.set(x, y + Math.round(Math.sin(x * 0.07 + k * 2) * 1.6), y === gy + 2 ? scale(stoneOf(layers[k])[0], 0.7) : h('#0a0818'));
    const tx = left ? x0 + 14 : x1 - 14;
    p.set(tx, gy - 1, GOLD_HI);
    p.glow(tx, gy - 1, 9, 6, FIRE, 0.55, 3);
    if (layers[k] === 0) for (let b = 0; b < 5; b++) p.vline(tx + (left ? 18 : -18) + b * 2, gy - 3, gy + 1, h('#55505e'));
    if (layers[k] === 3) p.rect(tx + (left ? 20 : -24), gy - 3, 2, 5, h('#c4bebc')), p.rect(tx + (left ? 30 : -34), gy - 3, 2, 5, h('#c4bebc'));
    if (layers[k] === 2) p.hline(tx + (left ? 16 : -30), tx + (left ? 30 : -16), gy + 1, h('#4c5e35'));
  }
  // THE SHAFT, its chain, the cage with his light in it
  p.rect(119, 0, 18, TH, h('#070614'));
  for (let y = 0; y < TH; y++) {
    p.set(118, y, scale(p.get(117, y), 0.55));
    p.set(137, y, scale(p.get(138, y), 1.25));
    if (y < 50 && (y & 1) === 0) p.set(128, y, h('#8a8498'));
    else if (y < 50) p.set(128, y, h('#55505e'));
  }
  p.rect(121, 50, 14, 13, h('#16161b'));
  p.rect(122, 51, 12, 11, h('#0a1a24'));
  for (let b = 0; b < 4; b++) p.vline(122 + b * 4, 50, 62, h('#55505e'));
  p.hline(121, 134, 50, h('#8a8498'));
  p.hline(121, 134, 62, h('#323039'));
  p.rect(127, 55, 2, 4, CY_HI);
  p.glow(128, 57, 26, 18, CY, 0.6, 4);
  p.glow(128, TH, 60, 16, PK, 0.6, 4);
  p.glow(128, TH, 18, 6, GOLD, 0.7, 3);
  p.haze(128, 10, 150, 18, NIGHT, 0.45, 3);
}

export const ENDLESS_OPTIONS: EndlessOption[] = [
  { n: 1, name: 'THE HALL OF GATES', life: 'The one you have seen. The gates wake one after another, away from you; the far fire takes; the word lands on the lintel.', wordY: 0, paint: null },
  { n: 2, name: 'THE STAIR WITH NO BOTTOM', life: 'The torches light ring under ring, down and down; dust falls away; the fire at the bottom flares; the word slams across it.', wordY: 7, paint: paintStair },
  { n: 3, name: 'THE ROAD GOES ON', life: 'Lights kindle in the gates one after another down the road; the aurora ripples; the wrong dawn at its end swells.', wordY: 6, paint: paintRoad },
  { n: 4, name: 'THE TOWER OF EVERY FLOOR', life: 'Windows light storey by storey up the tower and out of sight; cloud drifts across it; pink lightning in the cloud at its top.', wordY: 44, paint: paintTower },
  { n: 5, name: 'EVERY FLOOR AT ONCE', life: 'Seen as the game is seen. Room after room lights outward from the waypoint to every edge; eyes open in the far rooms.', wordY: 6, paint: paintPatchwork },
  { n: 6, name: 'THE SERPENT THAT EATS ITS TAIL', life: 'The stone serpent turns, scale by scale, always swallowing; its eye opens; the word burns inside the ring.', wordY: 49, paint: paintSerpent },
  { n: 7, name: 'THE BOOK WITH NO LAST PAGE', life: 'Pages lift off the book one after another and wind away into the dark, each a floor, their letters lighting as they go.', wordY: 6, paint: paintBook },
  { n: 8, name: 'THE HORDE WITHOUT END', life: 'Eyes open in the dark, row behind row, to the horizon; they blink; his blade flares against them.', wordY: 6, paint: paintHorde },
  { n: 9, name: 'THE WHEEL OF FLOORS', life: 'The wheel turns with a heavy grinding and clacks to a stop on a floor, again and again; the pointer flares each time.', wordY: 3, paint: paintWheel },
  { n: 10, name: 'THE SHAFT THROUGH THE WORLD', life: 'The cage goes down and down, floor after floor sliding up past it, never the last; its light swings.', wordY: 4, paint: paintShaft },
];


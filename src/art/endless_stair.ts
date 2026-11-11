// ENDLESS MODE'S SPLASH, PAINTED: THE STAIR WITH NO BOTTOM (the art chat, 11 Nov 2026). A MOCK-UP BEHIND A SWITCH THAT IS OFF:
// ENDLESS_SPLASH (art/endless_splash.ts): `on`, and `picture: 'stair'`.
//
// HIS PICK. Shown the hall of gates and asked whether it was right, his words, 11 Nov 2026, by 08:17 (Eastern): “Gimme 10
// options”. Shown ten sketches (dev/endless_options.ts) and asked which to paint full size and bring to life, by 08:30: “2 The
// stair with no bottom”. This is that sketch painted at the game's fine grain, for every screen, with its moment.
//
// THE PICTURE: we stand on the brink of a round shaft and look straight down it. Storey under storey, each of another floor's
// own stone (the town's at the top, then the prison's, the canyon's, the fen's, the High City's, the quarry's, and round again),
// each with its doorway and a torch by it; a stair winds down the wall, a storey and a half to a turn, past every door. At its head, on
// a round landing, lies the town's waypoint, awake, seen from straight above. At the bottom, where the storeys close to a point,
// the enemy's pink burns to gold. No one is in it.
//
// THE WORD IS LETTERED BY THE GAME, across the top of the shaft (the picture is made quieter under it as the game draws it).
//
// ITS MOMENT (the same seconds as the hall's, ES_MOMENT): out of the dark the torches take storey under storey, down and down,
// faster and faster, each with a kick and dust falling away down the shaft; the fire at the bottom flares; the word lands.
//
// Painted as the hall is (art/endless_splash.ts): every picture pixel a line of sight, what it meets first found by its numbers
// and painted as stone in flat tones, a seam of one pixel, light in bands.

import {
  CANYON, CY, CY_HI, CY_LO, ES_FIRES, ES_FLAMES, ES_H, ES_MOMENT, ES_W, ES_WAYS, FEN, FIRE, HIGH, IRON, MOSS, NIGHT, PRISON, QUARRY, TOWN, WAYSTONE,
  air, band, bay, endlessWake, hx, lit, mixc, rim, rnd, wayCut, wear,
} from './endless_splash';
import type { C, EndlessLettering, EndlessPainting, EndlessPatch, EndlessScene, Theme } from './endless_splash';

const W = ES_W * 2;
const H = ES_H * 2;
const VX = W / 2;
/** The shaft's middle, in picture pixels from the picture's top; and how far down the screen the game puts it. */
const VY = 446;
export const STAIR_VY_AT = 0.62;
const F = 600;

// The shaft, in eye-heights: we look straight down from its brink. A point is (X, Y) across it and z down it.
const RW = 3.2;
const Z0 = 4;
const DZ = 3.6;
const N = 12;
const ZB = Z0 + DZ * N;
/** The stair: how far it stands out from the wall, how thick, how far down it goes in a turn; where it begins. */
const WS = 0.6;
const TH = 0.3;
const PITCH = DZ * 1.5;
const TH_A = Math.PI - 0.2;
const Z_A = 4.6;
/** The landing at the stair's head, and the waypoint on it. */
const PLAT_R = 0.9;
const PX = (RW - 0.35) * Math.cos(TH_A);
const PY = (RW - 0.35) * Math.sin(TH_A);
const DAIS = 0.58;
const ORDER: readonly Theme[] = [TOWN, PRISON, CANYON, FEN, HIGH, QUARRY, PRISON, FEN, CANYON, HIGH, PRISON, QUARRY];
const TAU = Math.PI * 2;

const turnOf = (th: number): number => (((th - TH_A) % TAU) + TAU) % TAU;
const angd = (a: number, b: number): number => {
  let d = (a - b) % TAU;
  if (d > Math.PI) d -= TAU;
  if (d < -Math.PI) d += TAU;
  return d;
};
/** Each storey's doorway: the angle round the shaft where the stair comes to its sill; and its torch, a little further round. */
const DOOR_V = 2.25;
const doorAt = (k: number): number => TH_A + ((Z0 + DZ * k + DOOR_V - Z_A) * TAU) / PITCH;
const torchAt = (k: number): readonly [number, number] => (k === 0 ? [TH_A + 0.85, Z0 + 1.0] : [doorAt(k) + 0.36, Z0 + DZ * k + 1.15]);
const TORCHES = Array.from({ length: N }, (_, k) => torchAt(k));

/** What moves (as the hall's NOW): the torches' fire, the waypoint's light going round, the fire at the bottom. */
const NOW = { flame: 0, way: -1, fire: 0 };

/** The torches' light on a point of the wall or the stair at angle th, depth z (the storey's own torch and the one above). */
function torchLight(th: number, z: number, k: number): number {
  let s = 0;
  for (let j = Math.max(0, k - 1); j <= Math.min(N - 1, k + 1); j++) {
    const [ta, tz] = TORCHES[j];
    const du = angd(th, ta) * RW;
    const dz = z - tz;
    s += 1.5 / (1 + (du * du + dz * dz) / 0.6);
  }
  return s;
}
/** The waypoint's light on a point (X, Y, z) with normal n. */
function wayLight(X: number, Y: number, z: number, nx: number, ny: number, nz: number): number {
  const vx = PX - X;
  const vy = PY - Y;
  const vz = Z_A - 0.6 - z;
  const d2 = vx * vx + vy * vy + vz * vz;
  const lam = (vx * nx + vy * ny + vz * nz) / Math.sqrt(d2);
  return lam <= 0 ? 0 : (1.6 * lam) / (1 + d2 / 7);
}
/** The fire's light from below, on what faces the shaft's middle. */
const pinkAt = (z: number): number => 0.95 * Math.exp(-(ZB - z) / 11);

interface Hit {
  c: C;
  stage: number;
}
const storeyOf = (z: number): number => Math.max(0, Math.min(N - 1, Math.floor((z - Z0) / DZ)));

/** The wall of the shaft at angle th, depth z. */
function wallAt(th: number, z: number, r: number, px: number, py: number): C {
  const k = storeyOf(z);
  const t = ORDER[k];
  const v = z - (Z0 + DZ * k);
  const u = (th + Math.PI) * RW;
  const dv = (z * z) / (F * RW);
  const du = z / F;
  const fine = t.hc / dv > 4.5;
  // THE TORCH: an iron cup on the wall, its fire standing up the wall toward us
  const [ta, tz] = TORCHES[k];
  const tu = angd(th, ta) * RW;
  const tv = z - tz;
  if (Math.abs(tu) < 0.3 && tv > -0.6 && tv < 0.5) {
    const fy = -tv - 0.02;
    const ph = NOW.flame * TAU + k * 1.7;
    const tall = 0.46 * (0.9 + 0.13 * Math.sin(ph));
    if (fy > 0 && fy < tall) {
      const wd = 0.12 * Math.sin(Math.min(1, fy / tall) * Math.PI) ** 0.7 * (1 - fy * 0.6) + 0.012;
      const fx = Math.abs(tu - (0.03 + fy * 0.05) * Math.sin(fy * 14 - ph));
      if (fx < wd) return fx < wd * 0.34 && fy < 0.3 ? hx('#fff0a0') : fx < wd * 0.68 ? hx('#ffc24a') : hx('#ff8a2a');
    }
    if (tv >= -0.02 && tv < 0.1 && Math.abs(tu) < 0.17 - tv * 0.6) return tu < -0.04 ? IRON[2] : IRON[1];
    if (tv >= 0.1 && tv < 0.42 && Math.abs(tu) < 0.035) return IRON[1];
  }
  let tone: number;
  let alb: C | null = null;
  const lt0 = torchLight(th, z, k);
  // THE DOORWAY of this storey's floor: a dark way in, its stones round it, the prison's barred
  const dd = angd(th, doorAt(k)) * RW;
  if (k > 0 && Math.abs(dd) < 0.62 && v > 0.62 && v < DOOR_V) {
    if (Math.abs(dd) > 0.5 || v < 0.74) tone = 3;
    else {
      const bars = t.teeth && Math.abs(((dd + 2) % 0.2) - 0.1) < du * 0.7;
      const deep = mixc(t.stone[0], 0, 0.72);
      return rim(air(lit(bars ? IRON[2] : v > DOOR_V - 0.3 ? t.flag[1] : deep, 0, band(lt0 * (bars ? 0.9 : 0.35), px, py), 0), z, px, py), band(pinkAt(z) * 0.4, px, py));
    }
  } else if (v < 0.26) {
    // (the ledge at the head of each storey)
    tone = v > 0.26 - dv * 1.01 && fine ? -1 : 3;
    if (t.moss && rnd(Math.floor(u / 0.3), k, 47) > 0.45) alb = MOSS[2];
  } else {
    const row = Math.floor(v / t.hc);
    const shift = (row & 1 ? t.bl / 2 : 0) + (rnd(row, k, 5) - 0.5) * t.bl * 0.3;
    const col = Math.floor((u + shift) / t.bl);
    const hsh = rnd(col, row, k * 13 + 3);
    tone = hsh < 0.26 ? 0 : hsh > 0.8 ? 2 : 1;
    if (fine) {
      if (Math.floor((v - dv) / t.hc) !== row || Math.floor((u - du + shift) / t.bl) !== col) tone = -1;
      else if (Math.floor((v - 2 * dv) / t.hc) !== row) tone++;
      else tone += wear(px, py);
    }
    if (t.inlay !== undefined && v > 0.5 && v < 0.68) alb = t.inlay;
    if (t.moss && tone >= 0) {
      const clump = rnd(Math.floor(u / 0.21), row, 41) + (v > 2.6 ? 0.3 : 0);
      if (clump > 0.62 && v / t.hc - row < 0.16 + (clump - 0.62) * 0.9) alb = MOSS[clump > 0.9 ? 2 : 1];
    }
    if (t.roots) {
      // (roots down the fen's wall from its ledge)
      const i = Math.round(u / 0.5);
      const rr = rnd(i, k, 61);
      if (rr > 0.4 && v < 0.26 + 0.4 + rr * 1.3 && Math.abs(u - i * 0.5 - Math.sin(v * 5 + i) * 0.05) < du * 0.8) alb = hx('#56504a');
    }
  }
  // (the light from the upper left, down the shaft: the wall across from it catches it)
  const facing = Math.cos(th - 0.75);
  if (tone >= 0) tone += facing > 0.4 ? 1 : facing < -0.35 ? -1 : 0;
  // (the stair's shadow on the wall under it)
  let under = false;
  for (let n = 0; n < 8; n++) {
    const zs = Z_A + ((turnOf(th) + TAU * n) * PITCH) / TAU;
    if (zs > z) break;
    if (z > zs + TH && z < zs + TH + 1.2) under = true;
  }
  if (under && tone >= 0) tone = Math.max(0, tone - 2);
  const base = tone < 0 ? mixc(t.stone[0], 0, 0.55) : alb ?? t.stone[Math.max(0, Math.min(3, tone))];
  const lc = wayLight(RW * Math.cos(th), RW * Math.sin(th), z, -Math.cos(th), -Math.sin(th), 0) * (under ? 0.3 : 1);
  // (the night sky's light down the shaft, less with every storey: by it each floor's stone is seen for what it is)
  const sky = under || tone < 0 ? 0 : band((0.62 / (1 + (z - Z0) / 8)) * (facing > 0 ? 1 : 0.6), px, py);
  return rim(air(mixc(lit(base, band(lc, px, py), band(lt0 * (under ? 0.45 : 1), px, py), 0), mixc(base, 0, 0.35), sky), z, px, py), band(pinkAt(z), px, py));
}

/** A tread of the stair at angle th, depth zs, rho out from the shaft's middle; `turns`: how far round from its head. */
function treadAt(th: number, zs: number, rho: number, turns: number, r: number, px: number, py: number): C {
  const k = storeyOf(zs);
  const t = ORDER[k];
  const q = zs / F;
  const step = (turns * 44) / TAU;
  const idx = Math.floor(step);
  let tone = (idx & 1 ? 3 : 2) - (rnd(idx, 9, 91) < 0.18 ? 1 : 0);
  if (q < 0.035) {
    if (Math.floor(((turns - 1 / r) * 44) / TAU) !== idx) tone = -1;
    else if (rho < RW - WS + q * 1.7) tone = 3;
    else if (rho > RW - q * 1.6) tone = 0;
    else tone += wear(px, py);
  }
  const base = tone < 0 ? mixc(t.flag[0], 0, 0.5) : t.stone[Math.max(0, Math.min(3, tone))];
  const lc = wayLight(rho * Math.cos(th), rho * Math.sin(th), zs, 0, 0, -1) + 0.12;
  // (what faces up has the sky's light on it, all the way down: the stair stands off the wall by it)
  return rim(air(mixc(lit(base, band(lc, px, py), band(torchLight(th, zs, k) * 0.9, px, py), 0), hx('#8a94c8'), tone < 0 ? 0 : 0.2), zs * 0.72, px, py), band(pinkAt(zs) * 0.35, px, py));
}

/** The landing at the stair's head and the waypoint on it, seen from straight above; null where it is not. */
function landingAt(dx: number, dy: number, px: number, py: number): C | null {
  const X = (dx * Z_A) / F;
  const Y = (dy * Z_A) / F;
  const d = Math.hypot(X - PX, Y - PY);
  const q = Z_A / F;
  if (d < PLAT_R) {
    if (d < DAIS) {
      // THE WAYPOINT, AWAKE (art/crypt_ways.ts): eight wedges, a lip, the ring, the eight marks, the small ring, the disc
      const rx = (X - PX) / DAIS;
      const ry = (Y - PY) / DAIS;
      const rho = d / DAIS;
      const cut = wayCut(rx, ry, q / DAIS);
      if (cut !== 0) {
        if (NOW.way < 0) return cut === 4 || cut === 2 ? CY_HI : cut === 3 ? CY : rnd(px >> 1, py >> 1, 71) > 0.3 ? CY : CY_HI;
        const head = NOW.way * TAU;
        const da = Math.abs(angd(Math.atan2(ry, rx), head));
        if (cut === 4) return Math.sin(head) > -0.3 ? CY_HI : CY;
        if (cut === 3) return Math.sin(head) > 0.4 ? CY_HI : CY;
        if (cut === 1) return da < 0.7 ? CY_HI : da < 1.6 ? CY : mixc(CY, CY_LO, 0.45);
        return da < 0.9 ? CY_HI : mixc(CY, CY_LO, 0.3);
      }
      const a = Math.atan2(ry, rx);
      const wedge = Math.floor((a / Math.PI) * 4 + 8);
      const joint = Math.floor((Math.atan2(ry, rx - q / DAIS) / Math.PI) * 4 + 8) !== wedge || Math.floor((Math.atan2(ry - q / DAIS, rx) / Math.PI) * 4 + 8) !== wedge;
      let tone = 1 + (wedge & 1);
      if (rho > 0.92) tone = a < -0.4 && a > -2.8 ? 3 : 0;
      else if (joint && rho > 0.14) tone = 0;
      else tone += wear(px, py);
      const near = Math.min(Math.abs(rho - 0.73), Math.abs(rho - 0.24) + 0.08, rho);
      return lit(WAYSTONE[Math.max(0, Math.min(3, tone))], band(0.95 - near * 2.2, px, py), 0, 0);
    }
    // (the landing's own stone round it, a kerb at its edge)
    const a = Math.atan2(Y - PY, X - PX);
    const seg = Math.floor(a * 3.5 + 20);
    let tone = 1 + (rnd(seg, 3, 97) > 0.5 ? 1 : 0);
    if (d > PLAT_R - 0.14) tone = d > PLAT_R - q * 1.2 ? -1 : 3;
    else if (Math.floor(Math.atan2(Y - PY, X - PX - q) * 3.5 + 20) !== seg || d < DAIS + q * 1.2) tone = -1;
    else tone += wear(px, py);
    return lit(tone < 0 ? mixc(TOWN.stone[0], 0, 0.5) : TOWN.stone[Math.min(3, tone)], band(1.3 / (1 + (d - DAIS) * (d - DAIS) * 5), px, py), 0, 0);
  }
  // (its edge, seen a little from above as it is: dark, the waypoint's light on its lip)
  const z2 = Z_A + 0.5;
  if (Math.hypot((dx * z2) / F - PX, (dy * z2) / F - PY) < PLAT_R) return lit(mixc(TOWN.stone[0], 0, 0.35), band(0.25, px, py), 0, 0);
  return null;
}

/** THE FIRE AT THE BOTTOM: hottest in its middle, its edge licking. */
function fireAt(r: number, th: number): C {
  const R = (F * RW) / ZB;
  const lick = (rnd(Math.floor(th * 5 + 40), 3 + NOW.fire * 7, 97) - 0.5) * 0.24 + (rnd(Math.floor(th * 11 + 80), 5 + NOW.fire * 3, 97) - 0.5) * 0.12;
  const v = 1 - r / R + lick;
  return FIRE[v > 0.72 ? 0 : v > 0.52 ? 1 : v > 0.3 ? 2 : v > 0.12 ? 3 : 4];
}

/** What the picture pixel (px, py) shows. */
function hitAt(px: number, py: number): Hit {
  const dx = px + 0.5 - VX;
  const dy = py + 0.5 - VY;
  const r = Math.max(0.5, Math.hypot(dx, dy));
  const th = Math.atan2(dy, dx);
  if ((r * Z0) / F > RW) {
    // THE BRINK: the town's flags round the shaft's mouth, a kerb at its edge
    const X = (dx * Z0) / F;
    const Y = (dy * Z0) / F;
    const rho = (r * Z0) / F;
    const q = Z0 / F;
    let tone: number;
    if (rho < RW + 0.34) {
      const seg = Math.floor(th * 9 + 40);
      tone = rho < RW + q * 1.2 || rho > RW + 0.34 - q * 1.2 || Math.floor(Math.atan2(dy, dx - 1) * 9 + 40) !== seg ? -1 : 2 + (rnd(seg, 1, 99) > 0.6 ? 1 : 0) + wear(px, py);
    } else {
      const row = Math.floor(Y / 0.95);
      const sh = row & 1 ? 0.6 : 0;
      const col = Math.floor((X + sh) / 1.2);
      const hsh = rnd(col, row, 77);
      tone = hsh < 0.3 ? 0 : hsh > 0.78 ? 2 : 1;
      if (Math.floor((Y - q) / 0.95) !== row || Math.floor((X - q + sh) / 1.2) !== col) tone = -1;
      else tone += wear(px, py);
    }
    const base = tone < 0 ? mixc(TOWN.flag[0], 0, 0.55) : rho < RW + 0.34 ? TOWN.stone[Math.min(3, tone)] : TOWN.flag[Math.max(0, Math.min(2, tone))];
    const dw = Math.hypot(X - PX, Y - PY);
    return { c: mixc(lit(base, band(1.25 / (1 + (dw * dw) / 2.2), px, py), band(torchLight(th, Z0, 0) * 0.5, px, py), 0), mixc(base, 0, 0.35), tone < 0 ? 0 : 0.3), stage: 0 };
  }
  const land = landingAt(dx, dy, px, py);
  if (land !== null) return { c: land, stage: 0 };
  // THE STAIR, turn under turn
  const tn = turnOf(th);
  for (let n = 0; n < 8; n++) {
    const turns = tn + TAU * n;
    const zs = Z_A + (turns * PITCH) / TAU;
    if (zs > ZB - 0.5) break;
    const rho = (r * zs) / F;
    if (rho > RW) break;
    if (rho >= RW - WS) return { c: treadAt(th, zs, rho, turns, r, px, py), stage: storeyOf(zs) };
    if ((r * (zs + TH)) / F >= RW - WS) {
      // (its inner edge, in shadow; the fire's light on it far down)
      const k = storeyOf(zs);
      return { c: rim(air(lit(mixc(ORDER[k].stone[0], 0, 0.4), band(wayLight(rho * Math.cos(th), rho * Math.sin(th), zs, -Math.cos(th), -Math.sin(th), 0) * 0.5, px, py), 0, 0), zs, px, py), band(pinkAt(zs) * 1.1, px, py)), stage: k };
    }
  }
  const zw = (F * RW) / r;
  if (zw >= ZB) return { c: fireAt(r, th), stage: N };
  return { c: wallAt(th, zw, r, px, py), stage: storeyOf(zw) };
}

/** THE PICTURE, painted (about a second: once, before the splash is wanted). */
export function paintEndlessStair(): EndlessPainting {
  const c = new Int32Array(W * H);
  const stage = new Uint8Array(W * H);
  for (let py = 0; py < H; py++) {
    for (let px = 0; px < W; px++) {
      const hit = hitAt(px, py);
      let col = hit.c;
      const edge = Math.min(px, W - 1 - px);
      if (edge < 96 && (96 - edge) / 96 > bay(px, py)) col = NIGHT;
      c[py * W + px] = col;
      stage[py * W + px] = hit.stage;
    }
  }
  return { w: W, h: H, c, stage };
}

function patch(x: number, y: number, w: number, h: number): EndlessPatch {
  const c = new Int32Array(w * h);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) c[j * w + i] = hitAt(x + i, y + j).c;
  return { x, y, w, h, c };
}
/** Where a point of the wall is on the picture. */
const wallPx = (th: number, z: number): [number, number] => [VX + ((F * RW) / z) * Math.cos(th), VY + ((F * RW) / z) * Math.sin(th)];
const near = (k: number): number => Z0 / (Z0 + DZ * k);
const WAY_PX: readonly [number, number] = [VX + (PX * F) / Z_A, VY + (PY * F) / Z_A];

/** Where the letters go: across the top of the shaft. */
function lettering(w: number, h: number, wordW: number, subW: number): EndlessLettering {
  const vy = Math.round(h * STAIR_VY_AT);
  const oneLine = subW <= w - 16;
  let scale = 6;
  while (scale > 2 && (wordW * scale > w * 0.66 || 7 * scale > h * 0.2)) scale--;
  const wordY = Math.max(scale, Math.round(h * 0.045)) + (scale >> 1);
  const subY = wordY + 7 * scale + scale + 3;
  return { ox: Math.floor(w / 2) - ES_W / 2, oy: vy - VY / 2, lintel: subY + (oneLine ? 7 : 16) + 3, scale, wordY, subY, oneLine };
}

/** THE STAIR WITH NO BOTTOM as the splash plays it. */
export const STAIR_SCENE: EndlessScene = {
  gates: N,
  moment: ES_MOMENT,
  wake: endlessWake,
  near,
  paint: paintEndlessStair,
  torches: TORCHES.map(([ta, tz], k) => {
    const [x, y] = wallPx(ta, tz - 0.22);
    return [x, y, k, near(k) > 0.5 ? 2 : near(k) > 0.24 ? 1 : 0] as const;
  }),
  flames: 5,
  paintFlame: (site, i) => {
    NOW.flame = i / ES_FLAMES;
    const [ta, tz] = TORCHES[site];
    const [x, y] = wallPx(ta, tz - 0.2);
    const half = Math.ceil((0.62 * F * RW) / (tz * tz)) + Math.ceil((0.3 * F) / tz) + 3;
    const out = patch(Math.round(x) - half, Math.round(y) - half, half * 2, half * 2);
    NOW.flame = 0;
    return out;
  },
  wayAt: WAY_PX,
  wayStage: 0,
  wayGlow: [58, 58],
  paintWay: (i) => {
    NOW.way = i / ES_WAYS;
    const half = Math.ceil((DAIS * F) / Z_A) + 2;
    const out = patch(Math.round(WAY_PX[0]) - half, Math.round(WAY_PX[1]) - half, half * 2, half * 2);
    // (only the waypoint itself)
    for (let j = 0; j < out.h; j++) for (let k = 0; k < out.w; k++) if (Math.hypot(k + 0.5 - half, j + 0.5 - half) > half - 2) out.c[j * out.w + k] = -1;
    NOW.way = -1;
    return out;
  },
  fireAt: [VX, VY],
  paintFire: (i) => {
    NOW.fire = i;
    const half = Math.ceil((F * RW) / ZB) + 1;
    const out = patch(VX - half, VY - half, half * 2, half * 2);
    for (let j = 0; j < out.h; j++) for (let k = 0; k < out.w; k++) if (hitAt(out.x + k, out.y + j).stage < N) out.c[j * out.w + k] = -1;
    NOW.fire = 0;
    return out;
  },
  dustN: (k, land) => (land ? 44 : Math.round(6 + 16 * near(k))),
  dust: (k, i, a, land) => {
    // (off the storey's ledge, and away down the shaft: smaller and nearer the middle as it falls)
    const s = land ? 977 : 0;
    const life = 0.6 + rnd(i, k, 307 + s) * 0.5;
    const age = a - rnd(i, k, 301 + s) * 0.08;
    if (age < 0 || age > life) return null;
    const th = rnd(i, k, 311 + s) * TAU;
    const z = Z0 + DZ * k + 0.2 + (land ? 9 : 5) * age + 30 * age * age;
    const rr = (F * (RW - 0.12 - rnd(i, k, 313 + s) * 0.5)) / z;
    return [VX + rr * Math.cos(th), VY + rr * Math.sin(th), z < 9 && rnd(i, k, 317 + s) > 0.5 ? 2 : 1, Math.ceil((1 - age / life) * 4) / 4];
  },
  lettering,
};
void ES_FIRES;

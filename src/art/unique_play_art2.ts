// WHAT THE UNIQUE ITEMS SHOW IN PLAY, THE NEXT ONES: THE PICTURES (the art chat's helper, 12 Nov 2026; queue item draw-unique-items).
// No screen needed: each painter makes a picture (engine/px.ts Px) at the heroes' grain (two picture pixels to a game pixel),
// lit from the upper left, edged in the style's ink; render/unique_fx.ts lays them in the game, each behind its switch
// (render/unique_play.ts UNIQUE_PLAY), off.
//
//   THE DROWNED ARM   (amulet, the Swamp Colossus's: “Every 5 seconds a tentacle bursts up under the enemy you are fighting and
//                     slams it”): his drowned olive flesh, pale suckers down its inside (its bag picture's, art/items_unique.ts
//                     drownedarm, and the Colossus's own arm). As it is warned (game.ts stepArm: 'warn', half a second before),
//                     black water wells up on the floor there and churns; the arm bursts up out of it, towers, cocks back and
//                     whips down across the enemy as the blow lands ('slam'), lies there a moment, and is pulled back under; the
//                     water closes and is gone.
//   THE QUEEN'S TALONS (boots, the Carrion Queen's: “Each critical hit calls one of her birds: it dives on the nearest enemy”): one
//                     of her flock, the ledge road's vulture (art/ledge_vultures.ts, its moves with his yes), its brown
//                     feathers her black-violet (the boot's bag picture's raven), its eyes and its edge the friend's cyan: it
//                     comes down out of the air over him onto that enemy in its own head-first stoop, in the rules' 0.35
//                     seconds ('dive'), strikes talons first, pulls out, beats away up and is gone.

import { Px } from '../engine/px';
import type { GameView } from './skin';
import { VULTURE } from './ledge_vultures';
import { canvasOf, paintMob } from './new_mobs3';
import { INK } from './kit';
import type { Ramp } from './kit';

/** His drowned olive flesh (the bag picture's `arm`), and its suckers. */
export const ARM_FLESH: Ramp = ['#12180e', '#263220', '#42542e', '#687c46', '#a2b07c'];
export const ARM_SUCKER = ['#5e5a40', '#8a8460', '#b4aa80', '#d8d0a6'] as const;
/** The black water it comes out of (the bag picture's deep `teal`, the darkest of it): never bright enough to read as a glow. */
export const ARM_WATER = ['#03090e', '#06161e', '#06222e', '#0c3a50', '#1e5866'] as const;

/**
 * THE DROWNED ARM'S TIMES AND SIZES. `frames` at 30 a second from the warning; the blow lands at frame `slam` (the rules' half a
 * second). Where it comes up: `from` tiles from the enemy (back and to the left on the screen, so that it whips down across him
 * from the side); how long it is (picture pixels), how thick at its root. The water's reach (tiles). Its canvas: `w` by `h`, its
 * root at (`ax`, `ay`).
 */
export const ARM = { frames: 36, slam: 15, from: [-0.8, 0.2] as const, long: 112, thick: 10, pool: 1.15, w: 236, h: 196, ax: 84, ay: 146 };
/** Its pale inside, where its suckers are (the bag picture's suckers' colour, shaded as its flesh is). */
export const ARM_INSIDE: Ramp = ['#22241a', '#3c4028', '#5a5e38', '#7e8050', '#a6a470'];

const clamp = (v: number, a: number, b: number): number => Math.max(a, Math.min(b, v));
const ease = (k: number): number => {
  const u = clamp(k, 0, 1);
  return u * u * (3 - 2 * u);
};
const lerp = (a: number, b: number, k: number): number => a + (b - a) * k;

/** Its pose at a frame: how much of it is out of the water (0..1), the way its root leaves the water (degrees, the screen's: -90 up), how much it bends along its length, how much its tip curls, how high off the floor its far end is lifted (lying). */
export function armPose(f: number): { out: number; a0: number; bend: number; curl: number; lie: number; wave: number } | null {
  const S = ARM.slam;
  // (where it lies across the floor: along the way from its root to the enemy, as the screen shows it)
  const lieA = (Math.atan2((ARM.from[0] * -1 + ARM.from[1] * -1) * 8, (ARM.from[0] * -1 - ARM.from[1] * -1) * 16) * 180) / Math.PI;
  const sway = 10 * Math.sin(f * 0.9);
  if (f < 3) return null;
  if (f < 10) {
    // (it bursts up, its tip hooked over, swaying)
    const k = ease((f - 3) / 6);
    return { out: 0.15 + 0.85 * k, a0: lerp(-98, -84, k), bend: lerp(30, 4, k), curl: lerp(150, 110, k) + sway, lie: 0, wave: 9 };
  }
  if (f < 13) {
    // (it cocks back, coiling)
    const k = ease((f - 9) / 3);
    return { out: 1, a0: lerp(-84, -112, k), bend: lerp(4, -46, k), curl: lerp(110, -130, k), lie: 0, wave: lerp(9, 4, k) };
  }
  if (f < S) {
    // (the whip: two frames, the second near the floor)
    const k = (f - 12) / (S - 12);
    return { out: 1, a0: lerp(-112, lieA - 4, k * k), bend: lerp(-46, 4, k), curl: lerp(-130, -40, k), lie: 0, wave: 2 };
  }
  if (f < S + 6) {
    // (it lies across him, its tip curling; it bounces once)
    const b = f === S + 2 ? 0.35 : f === S + 3 ? 0.18 : 0;
    return { out: 1, a0: lieA + 4, bend: 2, curl: -50 - (f - S) * 6, lie: b, wave: 3 };
  }
  if (f < ARM.frames - 2) {
    // (pulled back under: it lifts off the floor and sinks into the water, its tip last, curling up)
    const k = ease((f - S - 6) / (ARM.frames - 2 - S - 6));
    return { out: 1 - k, a0: lerp(lieA + 4, -70, Math.min(1, k * 2)), bend: lerp(2, 30, k), curl: lerp(-80, 160, k), lie: 0, wave: 6 };
  }
  return null;
}

/** Its line: the points down its middle from where it leaves the water to its tip, and how thick it is at each (picture pixels, on its canvas). */
export function armLine(f: number): { pts: [number, number][]; r: number[] } | null {
  const p = armPose(f);
  if (!p) return null;
  const N = 40;
  const L = ARM.long * p.out;
  const pts: [number, number][] = [[ARM.ax, ARM.ay]];
  const r: number[] = [];
  let x = ARM.ax;
  let y = ARM.ay;
  // (what is out of the water is its far end: its thick root shows only once it is all out)
  const s0 = 1 - p.out;
  for (let i = 0; i <= N; i++) {
    const s = i / N;
    const sg = s0 + s * p.out;
    r.push(1 + (ARM.thick - 1) * Math.pow(1 - sg, 0.75));
    if (i === N) break;
    const a = ((p.a0 + p.bend * s + p.curl * s * s * s + p.wave * Math.sin(s * Math.PI * 2.2)) * Math.PI) / 180;
    x += Math.cos(a) * (L / N);
    // (lying, its far end lifted a little off the floor as it bounces)
    y += Math.sin(a) * (L / N) - p.lie * s * 2.2;
    pts.push([x, y]);
  }
  return { pts, r };
}

/** THE ARM AT A FRAME (from its warning; 0 to ARM.frames - 1): its picture, its root at (ARM.ax, ARM.ay). Empty where it is under. */
export function paintArm(f: number): Px {
  const out = new Px(ARM.w, ARM.h);
  const line = armLine(f);
  if (!line) return out;
  const { pts, r } = line;
  const W = ARM.w;
  const H = ARM.h;
  // each pixel: how near it is to its line, which side, how far along
  const best = new Float32Array(W * H).fill(Infinity);
  const along = new Float32Array(W * H);
  const side = new Float32Array(W * H);
  const nx = new Float32Array(W * H);
  const ny = new Float32Array(W * H);
  for (let i = 0; i + 1 < pts.length; i++) {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[i + 1];
    const R = Math.max(r[i], r[i + 1]) + 1;
    const x0 = Math.floor(Math.min(ax, bx) - R);
    const x1 = Math.ceil(Math.max(ax, bx) + R);
    const y0 = Math.floor(Math.min(ay, by) - R);
    const y1 = Math.ceil(Math.max(ay, by) + R);
    const dx = bx - ax;
    const dy = by - ay;
    const l2 = dx * dx + dy * dy || 1e-6;
    for (let y = Math.max(0, y0); y <= Math.min(H - 1, y1); y++) {
      for (let x = Math.max(0, x0); x <= Math.min(W - 1, x1); x++) {
        const px = x + 0.5;
        const py = y + 0.5;
        const u = clamp(((px - ax) * dx + (py - ay) * dy) / l2, 0, 1);
        const cx = ax + dx * u;
        const cy = ay + dy * u;
        const d = Math.hypot(px - cx, py - cy);
        const rr = lerp(r[i], r[i + 1], u);
        const k = d / rr;
        const q = y * W + x;
        if (k <= 1 && k < best[q]) {
          best[q] = k;
          along[q] = (i + u) / (pts.length - 1);
          const l = Math.sqrt(l2);
          // (which side of its line: its right as it goes, the inside of a curl that bends right)
          side[q] = ((px - ax) * dy - (py - ay) * dx) / l >= 0 ? 1 : -1;
          nx[q] = d > 1e-6 ? (px - cx) / d : 0;
          ny[q] = d > 1e-6 ? (py - cy) / d : 0;
        }
      }
    }
  }
  // its flesh: lit from the upper left, round as a limb
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const q = y * W + x;
      const k = best[q];
      if (k > 1) continue;
      const nz = Math.sqrt(Math.max(0, 1 - k * k));
      const lit = nz * 0.55 + (nx[q] * -0.55 + ny[q] * -0.75) * k * 0.75 + 0.1;
      const tone = clamp(Math.round(lit * 4.2), 0, 4);
      // (its inside, where the suckers are, pale: its right as it goes)
      out.set(x, y, side[q] > 0 && k > 0.4 ? ARM_INSIDE[clamp(tone, 1, 4)] : ARM_FLESH[tone]);
      // (wet: a glint on its lit side, now and then along it)
      if (k > 0.35 && k < 0.62 && nx[q] * -0.55 + ny[q] * -0.75 > 0.6 && Math.floor(along[q] * 26) % 3 === 0) out.set(x, y, '#c6d09a');
    }
  }
  // its suckers down its inside (its right as it goes): rings, a dark pit in each, bigger toward its root
  let since = 0;
  for (let i = 1; i + 1 < pts.length; i++) {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[i + 1];
    const dx = bx - ax;
    const dy = by - ay;
    const l = Math.hypot(dx, dy) || 1;
    since += l;
    const rr = r[i];
    const gap = Math.max(3, rr * 0.9);
    if (since < gap || rr < 1.8) continue;
    since = 0;
    const sx = -dy / l;
    const sy = dx / l;
    const cx = ax + sx * rr * 0.6;
    const cy = ay + sy * rr * 0.6;
    const X = Math.round(cx - 0.5);
    const Y = Math.round(cy - 0.5);
    const inside = (xx: number, yy: number): boolean => xx >= 0 && yy >= 0 && xx < W && yy < H && best[yy * W + xx] <= 0.9;
    if (!inside(X, Y)) continue;
    if (rr > 5.5) {
      for (const [ox, oy, c] of [[-1, 0, 2], [1, 0, 1], [0, -1, 3], [0, 1, 1], [0, 0, 0]] as [number, number, number][]) if (inside(X + ox, Y + oy)) out.set(X + ox, Y + oy, c === 0 ? ARM_SUCKER[0] : ARM_SUCKER[c]);
    } else if (rr > 3.2) {
      out.set(X, Y, ARM_SUCKER[2]);
      if (inside(X + 1, Y)) out.set(X + 1, Y, ARM_SUCKER[0]);
    } else out.set(X, Y, ARM_SUCKER[3]);
  }
  out.outline(INK);
  // black water running off it, as it rises and as it is pulled back
  if (f >= 5 && f < ARM.frames - 2) {
    for (let i = 4; i < pts.length - 2; i += 7) {
      const [x, y] = pts[i];
      const drop = ((f * 3 + i * 5) % 9) / 9;
      const X = Math.round(x + (i % 2 ? 2 : -2));
      const Y = Math.round(y + r[i] + 1 + drop * 6);
      if (Y < H - 1 && X > 0 && X < W - 1 && !out.has(X, Y)) {
        out.set(X, Y, ARM_WATER[4]);
        out.set(X, Y + 1, ARM_WATER[3]);
      }
    }
  }
  return out;
}

/**
 * THE BLACK WATER on the floor where it comes up, at a frame (0 to ARM.frames - 1): welling up and churning as it is warned,
 * thrown out in a ring as it slams, closing as it is pulled under. An ellipse as the floor lies (twice as wide as deep), its
 * middle at (ax, ay); `ry` its depth.
 */
export function paintArmPool(f: number): { px: Px; ax: number; ay: number } {
  const rx0 = Math.round(ARM.pool * 32);
  const W = rx0 * 2 + 12;
  const H = rx0 + 12;
  const ax = W >> 1;
  const ay = H >> 1;
  const out = new Px(W, H);
  const S = ARM.slam;
  // how far it has spread: welling up, then all of it, then closing
  const k = f < 6 ? ease((f + 1) / 6) : f < S + 8 ? 1 : 1 - ease((f - S - 8) / (ARM.frames - S - 8));
  if (k <= 0.02) return { px: out, ax, ay };
  const rx = rx0 * (0.35 + 0.65 * k);
  const ry = rx / 2;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const u = (x + 0.5 - ax) / rx;
      const v = (y + 0.5 - ay) / ry;
      const d = Math.hypot(u, v);
      // (its edge ragged, as water is)
      const rag = 0.06 * Math.sin(Math.atan2(v, u) * 7 + f * 0.7);
      if (d > 1 + rag) continue;
      // deepest in the middle; rings running out from where it comes up
      let tone = d < 0.45 ? 0 : d < 0.8 ? 1 : 2;
      const ring = (d * 5 - f * 0.55) % 1;
      if (ring > 0.82 && d > 0.3 && d < 0.95) tone = Math.min(4, tone + 1);
      if (d > 0.93 + rag) tone = 3;
      out.set(x, y, ARM_WATER[tone]);
    }
  }
  // bubbles breaking as it churns, before it comes up
  if (f < S) {
    for (let i = 0; i < 5; i++) {
      const a = i * 2.4 + f * 0.9;
      const rr = (0.2 + ((i * 37 + f * 13) % 10) / 14) * rx * 0.8;
      const X = Math.round(ax + Math.cos(a) * rr);
      const Y = Math.round(ay + Math.sin(a) * rr * 0.5);
      if (out.has(X, Y) && (f + i) % 3 !== 0) {
        out.set(X, Y, ARM_WATER[4]);
        if ((f + i) % 2) out.set(X + 1, Y, ARM_WATER[3]);
      }
    }
  }
  return { px: out, ax, ay };
}

// =============================================================================================
// THE QUEEN'S TALONS: ONE OF HER BIRDS

/**
 * HER BIRD IS ONE OF HER FLOCK: the Carrion Queen's vulture of the ledge road (art/ledge_vultures.ts VULTURE, every move of it
 * with his yes: its bald head and hooked beak, its ragged wings, its great taloned feet), its flight and its dive painted by its
 * own painter (art/new_mobs3.ts paintMob), turned hers and his: its dusty brown feathers her black-violet (the boot's bag
 * picture's raven), its pale ruff, head and talons as they are, its eyes the enemy's fire no more but the friend's cyan, and the
 * friend's cyan edge round it, as round every friend (it is his, called by his boots).
 */
export const BIRD_RAVEN = ['#0a0718', '#17102e', '#2a1c4c', '#3a2862', '#4e3a7e', '#7a62a8'] as const;
/** The friend's edge round it (the heroes' own: art/warrior_up.ts WU_RIM). */
export const BIRD_RIM = '#22d0e0';
/**
 * ITS DIVE, as the rules have it (game.ts callBird: 'dive', `secs` from him to the enemy, then the blow): in its own dive's
 * moments (art VULTURE_DIVE), its stoop from `from` to the blow at `hit` played over the rules' seconds while it comes from over
 * him to the enemy, `high` game pixels up as it sets off; then its strike held and its pull-out to `end` where it struck; then
 * `away` seconds of its flight, beating up and on along the way it came, fading.
 */
export const TALONS = { from: 0.25, hit: 0.7, end: 1.2, away: 0.55, high: 20, fps: 30 } as const;

const lumaOf = (r: number, g: number, b: number): number => 0.299 * r + 0.587 * g + 0.114 * b;
const RAVEN_Y = BIRD_RAVEN.map((c) => {
  const v = parseInt(c.slice(1), 16);
  return lumaOf(v >> 16, (v >> 8) & 255, v & 255);
});

/** Her bird's colours from the vulture's: its brown feathers her black-violet by how light, the enemy's fire in its eyes the friend's cyan; the rest (its pale head, ruff and talons, the ink) as they are. Changes `p`. */
export function talonsLook(p: Px): Px {
  const d = p.d;
  const set = (i: number, c: string): void => {
    const v = parseInt(c.slice(1), 16);
    d[i] = v >> 16;
    d[i + 1] = (v >> 8) & 255;
    d[i + 2] = v & 255;
  };
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] !== 255) continue;
    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];
    const mx = Math.max(r, g, b);
    const mn = Math.min(r, g, b);
    const sat = mx ? (mx - mn) / mx : 0;
    const y = lumaOf(r, g, b);
    // (the enemy's fire in its eyes: the friend's cyan, as bright)
    if (r > 200 && sat > 0.4) {
      set(i, y > 165 ? '#b8fff8' : '#22d0e0');
      continue;
    }
    // (its brown feathers: warm, dull, not pale)
    if (r >= g && g >= b && sat > 0.16 && y < 120) {
      let best = 0;
      for (let k = 1; k < RAVEN_Y.length; k++) if (Math.abs(RAVEN_Y[k] - y * 1.05) < Math.abs(RAVEN_Y[best] - y * 1.05)) best = k;
      set(i, BIRD_RAVEN[best]);
    }
  }
  return p;
}

/** Its canvas (the vulture's: its floor point at (ax, ay)). */
export const BIRD_CANVAS = canvasOf(VULTURE);

/** HER BIRD painted: in its dive at `t` seconds of the vulture's own dive (art VULTURE_DIVE), or in flight at `t` seconds of its wing beat; from in front or behind; her colours, the friend's edge. */
export function paintTalonsBird(move: 'dive' | 'fly', t: number, view: GameView): Px {
  return talonsLook(paintMob(VULTURE, move === 'dive' ? 'attack' : 'walk', t, view, BIRD_RIM).px);
}

/**
 * WHERE HER BIRD IS, `t` seconds after it is called (the rules' `secs` to the blow): how far along the floor from him to the
 * enemy (0 to 1, on past it as it leaves), how high its floor point is over the floor (game pixels), which of its moves and the
 * moment of it, and how clear it is. Null once it is gone.
 */
export function talonsAt(t: number, secs: number): { along: number; high: number; move: 'dive' | 'fly'; at: number; alpha: number } | null {
  const T = TALONS;
  if (t < secs) {
    // (coming down out of the air over him onto it, faster as it comes: its own stoop, played over the rules' time)
    const u = t / secs;
    return { along: u * u, high: T.high * (1 - u * u), move: 'dive', at: T.from + (T.hit - T.from) * u, alpha: Math.min(1, 0.35 + u * 3) };
  }
  const after = t - secs;
  if (after < T.end - T.hit) return { along: 1, high: 0, move: 'dive', at: T.hit + after, alpha: 1 };
  const u = (after - (T.end - T.hit)) / T.away;
  if (u >= 1) return null;
  return { along: 1 + u * 0.8, high: u * 30, move: 'fly', at: u * T.away, alpha: 1 - u * u };
}

// =============================================================================================
// THE STICKY WRENCH: HER VIAL, STUCK

/** The glue that holds it (an amber pitch), its brew (her vials' own cyan: art dev/contraption_fx.ts BREW), its brass cap. */
export const STICKY_GLUE = ['#1e0e06', '#3c200c', '#6a3c14', '#a0661e', '#d49a3c'] as const;
export const STICKY_BREW = ['#0c6a80', '#22d0e0', '#b8fff8', '#e8ffff'] as const;
export const STICKY_CAP = ['#4a3410', '#8a6a24', '#c8a04a', '#f0d88a'] as const;
/**
 * HER VIAL STUCK (the Sticky Wrench: “landed, it sticks, to the enemy it landed on if there is one, and goes where that goes”,
 * game.ts 'stuck', bursting `fuse` seconds on): `frames` at 30 a second over the rules' 0.7 seconds; its canvas `w` by `h`, the
 * point it is stuck at (`ax`, `ay`). Its brew blinks brighter and brighter, quicker and quicker (`blinks`: the frames it flares
 * on), a ring of light off it at each; it fizzes at its cap; the glue holding it drips.
 */
export const STICKY = { frames: 21, w: 40, h: 40, ax: 20, ay: 28, blinks: [0, 7, 12, 15, 17, 18, 19, 20] } as const;

/** HER VIAL STUCK at frame `f` (0 to STICKY.frames - 1). */
export function paintStuckVial(f: number): Px {
  const p = new Px(STICKY.w, STICKY.h);
  const { ax, ay } = STICKY;
  // how hot its brew is: flaring on each blink and dying back over two frames, the last ones running together
  const since = Math.min(...STICKY.blinks.map((b) => (f >= b ? f - b : 99)));
  const heat = since === 0 ? 2 : since === 1 ? 1 : 0;
  const late = f / (STICKY.frames - 1);
  // THE GLUE, a lump of amber pitch round its foot, a drip or two hanging
  for (let y = -2; y <= 2; y++) {
    for (let x = -5; x <= 5; x++) {
      const d = (x * x) / 25 + (y * y) / 5;
      if (d > 1 + 0.2 * Math.sin(x * 1.9 + y * 2.3)) continue;
      // (glossy and dark: a glint on its upper left)
      const lit = 0.75 - 0.05 * x - 0.2 * y - d * 0.45;
      p.set(ax + x, ay + y, x === -2 && y === -1 ? STICKY_GLUE[4] : STICKY_GLUE[clamp(Math.round(lit * 3), 0, 3)]);
    }
  }
  // (one drip, stretching as it goes)
  const drip = 1 + Math.floor(late * 3);
  for (let k = 1; k <= drip; k++) p.set(ax - 2, ay + 2 + k, STICKY_GLUE[k === drip ? 2 : 1]);
  // THE VIAL, stuck head down at a slant in the glue, its glass of her brew, its brass cap
  const a = 0.55;
  const c = Math.cos(a);
  const s = Math.sin(a);
  const cx = ax + 1;
  const cy = ay - 6;
  for (let v = -3.5; v <= 3.5; v += 0.5) {
    for (let u = -1.6; u <= 1.6; u += 0.5) {
      const isCap = v < -2.4;
      if (isCap && Math.abs(u) > 1.1) continue;
      const X = Math.round(cx + u * c - v * s);
      const Y = Math.round(cy + u * s + v * c);
      if (isCap) p.set(X, Y, STICKY_CAP[u < 0 ? 3 : 2]);
      else p.set(X, Y, STICKY_BREW[clamp((u < -0.6 ? 2 : u < 0.6 ? 1 : 0) + heat, 0, 3)]);
    }
  }
  // (it fizzes at its cap: a few sparks of her brew spat up, more as it nears its end)
  const capX = cx - -3.2 * s;
  const capY = cy + -3.2 * c;
  const n = 2 + Math.floor(late * 4);
  for (let i = 0; i < n; i++) {
    const h = Math.sin((f * 7.1 + i * 13.7) * 1.3) * 43758.5;
    const r = h - Math.floor(h);
    const X = Math.round(capX + (r - 0.5) * 6);
    const Y = Math.round(capY - 1 - ((f * 3 + i * 5) % 7));
    p.set(X, Y, STICKY_BREW[r > 0.5 ? 3 : 2]);
  }
  p.outline(INK);
  // A RING OF LIGHT OFF IT as it flares (laid after its edge: light, not a thing)
  if (heat === 2) {
    const R = 7 + late * 4;
    for (let i = 0; i < 32; i++) {
      const t = (i / 32) * Math.PI * 2;
      const X = Math.round(cx + Math.cos(t) * R);
      const Y = Math.round(cy + Math.sin(t) * R * 0.8);
      if (X > 0 && Y > 0 && X < STICKY.w - 1 && Y < STICKY.h - 1 && !p.has(X, Y)) p.set(X, Y, STICKY_BREW[1]);
    }
  }
  return p;
}

// Concept art, not part of the game: one warrior painted in several art styles, so the owner can
// choose a direction before anything is redrawn for real. Everything is drawn from one figure
// builder; a Look sets its proportions, colours, depth of shading and finish.

import { Px, mix } from '../engine/px';

export const FW = 76;
export const FH = 100;
/** Anchor: the floor point between the feet. */
export const FAX = 38;
export const FAY = 92;

/** Tones of one material, dark to light. */
export type Ramp = readonly [string, string, string, string, string];

export interface Look {
  id: string;
  name: string;
  blurb: string[];
  // --- proportions, in pixels ---
  /** Radius of the helm. */
  headR: number;
  /** Floor to chin. */
  bodyH: number;
  /** Share of bodyH that is leg. */
  legs: number;
  /** Half width at the chest and at the belt. */
  chest: number;
  waist: number;
  legW: number;
  armR: number;
  shieldR: number;
  /** Sword: blade length and half width. */
  blade: number;
  bladeW: number;
  /** How far the tabard hangs below the belt, as a share of the leg. */
  skirt: number;
  /** 0 = no cape; otherwise how far down the body it hangs (0..1). */
  cape: number;
  /** 0 = no plume; otherwise its size. */
  plume: number;
  helm: 'round' | 'great';
  face: 'big' | 'open' | 'shadow' | 'none';
  /** Torn hems, notched edges. */
  ragged: boolean;
  trim: boolean;
  // --- colours ---
  ink: string;
  steel: Ramp;
  mail: Ramp;
  cloth: Ramp;
  cloak: Ramp;
  leather: Ramp;
  brass: Ramp;
  wood: Ramp;
  feather: Ramp;
  /** The sword's blade, when it is not plain steel. */
  bladeRamp?: Ramp;
  /** The foe: bone, its rusted blade, and a light in the eye sockets (or none). */
  bone: Ramp;
  rust: Ramp;
  socket: string | null;
  /** Dark to light. */
  skin: readonly [string, string, string, string];
  eye: string;
  glint: string;
  blush: string | null;
  /** How deep light and shade reach into a form: [rim, band] in pixels. */
  hi: readonly [number, number];
  lo: readonly [number, number];
  /** Pushes every rounded form darker (above 0) or lighter (below 0). */
  shade: number;
  // --- the ground it stands on, and the light ---
  ground: readonly [string, string, string, string];
  mortar: string;
  backdrop: string;
  /** 0..1: how dark it is away from the light. */
  dark: number;
  glow: string;
  finish: 'none' | 'grime' | 'engrave';
}

// ---------------------------------------------------------------------------------------------
// Painting helpers (the same ideas as art/heroes2.ts)

export function layer(): Px {
  return new Px(FW, FH);
}

export function stack(layers: ReadonlyArray<Px>, ink: string): Px {
  const out = layer();
  for (const l of layers) out.blit(l.outline(ink), 0, 0);
  return out;
}

/** Paint a shape, then shade it by how close each pixel is to its lit (upper-left) and shaded (lower-right) edge. */
export function lit(dst: Px, ramp: Ramp, hi: readonly [number, number], lo: readonly [number, number], paint: (l: Px) => void): void {
  const l = layer();
  paint(l);
  const reach = (x: number, y: number, step: number, max: number): number => {
    for (let k = 1; k <= max; k++) {
      if (!l.has(x + step * k, y + step * k)) return k;
      if (!l.has(x + step * k, y + step * (k - 1)) && !l.has(x + step * (k - 1), y + step * k)) return k;
    }
    return max + 1;
  };
  l.each((x, y) => {
    const a = reach(x, y, -1, hi[1]);
    const b = reach(x, y, 1, lo[1]);
    if (a <= hi[0] && b > lo[0]) return ramp[4];
    if (b <= lo[0]) return ramp[0];
    if (a <= hi[1] && b > lo[1]) return ramp[3];
    if (b <= lo[1] && a > hi[1]) return ramp[1];
    return ramp[2];
  });
  dst.blit(l, 0, 0);
}

const LX = -0.52;
const LY = -0.62;
const LZ = 0.59;

/** A ball: five tones and a highlight. `shade` pushes it darker (grim looks keep more in shadow). */
export function ball(p: Px, cx: number, cy: number, rx: number, ry: number, ramp: Ramp, shade = 0): void {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const nx = (x + 0.5 - cx) / rx;
      const ny = (y + 0.5 - cy) / ry;
      const d2 = nx * nx + ny * ny;
      if (d2 > 1) continue;
      const i = nx * LX + ny * LY + Math.sqrt(1 - d2) * LZ - shade;
      p.set(x, y, ramp[i > 0.9 ? 4 : i > 0.62 ? 3 : i > 0.22 ? 2 : i > -0.2 ? 1 : 0]);
    }
  }
}

/** A limb: a thick line that tapers from radius r0 to r1, shaded across its width. */
export function limb(p: Px, x0: number, y0: number, x1: number, y1: number, r0: number, r1: number, ramp: Ramp, links = false): void {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len2 = dx * dx + dy * dy || 1;
  const rMax = Math.max(r0, r1) + 1;
  for (let y = Math.floor(Math.min(y0, y1) - rMax); y <= Math.ceil(Math.max(y0, y1) + rMax); y++) {
    for (let x = Math.floor(Math.min(x0, x1) - rMax); x <= Math.ceil(Math.max(x0, x1) + rMax); x++) {
      const t = Math.max(0, Math.min(1, ((x + 0.5 - x0) * dx + (y + 0.5 - y0) * dy) / len2));
      const r = r0 + (r1 - r0) * t;
      const ox = x + 0.5 - (x0 + dx * t);
      const oy = y + 0.5 - (y0 + dy * t);
      if (ox * ox + oy * oy > r * r) continue;
      const s = (ox * LX + oy * LY) / (r * 0.81);
      let tone = s > 0.5 ? 3 : s < -0.45 ? 1 : 2;
      if (links && x % 2 === 0 && y % 2 === 0) tone = Math.max(0, tone - 1);
      p.set(x, y, ramp[tone]);
    }
  }
}

export function stamp(p: Px, x: number, y: number, rows: ReadonlyArray<string>, key: Readonly<Record<string, string | null>>): void {
  for (let j = 0; j < rows.length; j++) {
    const row = rows[j];
    for (let i = 0; i < row.length; i++) {
      const c = key[row.charAt(i)];
      if (c) p.set(x + i, y + j, c);
    }
  }
}

/** A steady pseudo-random number in 0..1 for a pixel (so a picture is the same every time). */
export function hash(x: number, y: number, k = 0): number {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(k | 0, 2147483647)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// ---------------------------------------------------------------------------------------------
// Faces. Letters: J j k K = skin dark to light, e = eye, X = glint, P = blush, . = leave alone.

const FACE_BIG = [
  'JJJJJJJJJJJJJ',
  'jkkkkkkkkkkkj',
  'kkXekkkkkXekj',
  'kkeekkkkkeekj',
  'kkeekkKkkeekj',
  'kPPkkkkkkPPkj',
  '.kkkkJJkkkkj.',
  '..jkkkkkkkj..',
  '...jjjjjjj...',
];

const FACE_OPEN = [
  'JJJJJJJJJ',
  'jJJkkJJkJ',
  'kXekkXekJ',
  'keekKeekJ',
  'KkkkkkkjJ',
  '.kkJJkjJ.',
  '..jjjjJ..',
];

// A barbute's T-shaped opening: darkness, and two points of light for eyes.
const FACE_SHADOW = [
  'eeeeeee',
  'eXeeeXe',
  'eeeeeee',
  '..eee..',
  '..eee..',
  '..eee..',
];

// ---------------------------------------------------------------------------------------------
// The figure

export function leg(p: Px, L: Look, hipX: number, sole: number, len: number, far: boolean): void {
  const top = sole - len;
  const w = L.legW;
  const dim = (r: Ramp): Ramp => (far ? [r[0], r[0], r[1], r[2], r[3]] : r);
  const steel = dim(L.steel);
  const mail = dim(L.mail);
  const boot = dim(L.leather);
  const bootH = Math.max(3, Math.round(len * 0.3));
  const knee = sole - Math.round(len * 0.55);
  // mail down to the knee
  lit(p, mail, [0, 2], [1, 2], (l) => l.rect(hipX, top, w, knee - top, L.ink));
  for (let y = top; y < knee; y++) for (let x = hipX; x < hipX + w; x++) if (x % 2 === 0 && y % 2 === 0 && p.get(x, y) !== mail[0]) p.set(x, y, mail[1]);
  // knee cop and greave
  lit(p, steel, L.hi, L.lo, (l) => {
    l.rect(hipX - 1, knee, w + 2, 2, L.ink);
    l.rect(hipX, knee + 2, w, sole - bootH - knee - 1, L.ink);
  });
  // boot: a cuff, the upper, and a toe that reaches forward
  lit(p, boot, [0, 2], [1, 2], (l) => {
    for (let y = sole - bootH + 1; y <= sole; y++) {
      const cuff = y === sole - bootH + 1;
      l.rect(hipX - (cuff ? 1 : 0), y, cuff ? w + 2 : y >= sole - 1 ? w + 3 : w, 1, L.ink);
    }
  });
  p.hline(hipX, sole, w + 3, boot[0]);
}

export function cape(p: Px, L: Look, X: number, shoulderY: number, hemY: number): void {
  lit(p, L.cloak, [0, 2], [1, 4], (l) => {
    for (let y = shoulderY; y <= hemY; y++) {
      const t = (y - shoulderY) / (hemY - shoulderY);
      const half = L.chest + 2 + Math.round(t * 5);
      const drift = -Math.round(t * 3); // it hangs a little toward screen-left, as if in a draught
      for (let x = X - half + drift; x < X + half + drift; x++) {
        // a torn hem: uneven teeth along the bottom
        if (L.ragged && y > hemY - 2 - Math.floor(hash(x, 7) * 5)) continue;
        if (!L.ragged && y > hemY - (Math.abs(x - X - drift) % 6 < 3 ? 0 : 1)) continue;
        l.set(x, y, L.ink);
      }
    }
  });
  // folds
  for (let y = shoulderY + 3; y <= hemY; y++) {
    const t = (y - shoulderY) / (hemY - shoulderY);
    for (const f of [-0.7, -0.25, 0.3, 0.75]) {
      const x = X + Math.round(f * (L.chest + 2 + t * 5)) - Math.round(t * 3);
      if (p.has(x, y) && hash(x, y, 3) > 0.25) p.set(x, y, L.cloak[0]);
    }
  }
}

export function skirt(p: Px, L: Look, X: number, top: number, bottom: number): void {
  lit(p, L.cloth, [0, 2], [1, 3], (l) => {
    for (let y = top; y <= bottom; y++) {
      const t = (y - top) / Math.max(1, bottom - top);
      const half = L.waist + Math.round(t * 2);
      for (let x = X - half; x < X + half; x++) {
        if (L.ragged && y > bottom - 1 - Math.floor(hash(x, 11) * 4)) continue;
        l.set(x, y, L.ink);
      }
    }
  });
  for (let y = top + 1; y <= bottom; y++) {
    const t = (y - top) / Math.max(1, bottom - top);
    for (const f of [-0.6, 0.5]) {
      const x = X + Math.round(f * (L.waist + t * 2));
      if (p.has(x, y)) p.set(x, y, L.cloth[1]);
    }
    if (y >= top + 2 && p.has(X - 1, y)) p.set(X - 1, y, L.cloth[0]); // the split
  }
  if (L.trim) {
    for (let x = X - L.waist - 3; x < X + L.waist + 3; x++) {
      if (p.has(x, bottom)) p.set(x, bottom, x < X - 2 ? L.brass[3] : x < X + 4 ? L.brass[2] : L.brass[1]);
    }
  }
}

function chest(p: Px, L: Look, X: number, top: number, belt: number): void {
  // mail at the neck
  lit(p, L.mail, [0, 2], [1, 2], (l) => l.rect(X - Math.round(L.headR * 0.45), top - 3, Math.round(L.headR * 0.9) + 1, 4, L.ink));
  // the tabard
  lit(p, L.cloth, L.hi, [L.lo[0], L.lo[1] + 1], (l) => {
    for (let y = top; y < belt; y++) {
      const t = (y - top) / Math.max(1, belt - top - 1);
      const half = Math.round(L.chest + (L.waist - L.chest) * t) - (y < top + 2 ? 1 : 0);
      l.rect(X - half, y, half * 2, 1, L.ink);
    }
  });
  if (L.trim) {
    // neckline: a brass-trimmed V over mail
    const deep = Math.max(3, Math.round(L.headR * 0.45));
    for (let k = 0; k < deep; k++) {
      p.set(X - deep + k, top + k, L.brass[2]).set(X + deep - 1 - k, top + k, L.brass[1]);
      for (let x = X - deep + 1 + k; x <= X + deep - 2 - k; x++) p.set(x, top + k, x % 2 === 0 && (top + k) % 2 === 0 ? L.mail[1] : L.mail[2]);
    }
    // emblem: an open book in gold thread
    stamp(p, X - 3, top + deep + 2, ['YGyzYYy', 'YYyzYyy', 'yyzZyyz'], { G: L.brass[4], Y: L.brass[3], y: L.brass[2], z: L.brass[1], Z: L.brass[0] });
  }
  // belt and buckle
  const bw = L.waist;
  p.rect(X - bw, belt, bw * 2, 3, L.leather[2]);
  p.hline(X - bw, belt, bw * 2, L.leather[3]).hline(X - bw, belt + 2, bw * 2, L.leather[1]);
  stamp(p, X - 2, belt, ['GYy', 'YVz', 'yzZ'], { G: L.brass[4], Y: L.brass[3], y: L.brass[2], z: L.brass[1], Z: L.brass[0], V: L.leather[0] });
}

export function plume(p: Px, L: Look, cx: number, top: number): void {
  const R = L.headR;
  const s = L.plume;
  lit(p, L.feather, [1, 2], [1, 2], (l) => {
    // feathers rise from the crown, sweep back, and fall
    const pts = [
      [cx - 1, top + 1],
      [cx - R * 0.55, top - R * 0.75 * s],
      [cx - R * 1.3, top - R * 0.45 * s],
      [cx - R * 1.65, top + R * 0.35],
    ];
    for (let k = 0; k <= 40; k++) {
      const t = k / 40;
      // a smooth curve through the four points
      const a = (1 - t) ** 3;
      const b = 3 * (1 - t) ** 2 * t;
      const c = 3 * (1 - t) * t ** 2;
      const d = t ** 3;
      const x = a * pts[0][0] + b * pts[1][0] + c * pts[2][0] + d * pts[3][0];
      const y = a * pts[0][1] + b * pts[1][1] + c * pts[2][1] + d * pts[3][1];
      const r = (R * 0.2 + R * 0.26 * Math.sin(Math.PI * Math.min(1, t * 1.25))) * (0.7 + 0.3 * s);
      l.ellipse(x, y, r, r, L.ink);
    }
  });
  if (L.ragged) {
    for (let y = 0; y < FH; y++) for (let x = 0; x < cx - R * 0.6; x++) if (p.has(x, y) && !p.has(x, y + 1) && hash(x, y, 5) < 0.45) p.erase(x, y);
  }
}

function helm(p: Px, L: Look, X: number, chinY: number): void {
  const R = L.headR;
  const cx = X - 0.5;
  const cy = chinY - R + 1;
  if (L.plume > 0) plume(p, L, cx, Math.round(cy - R));
  if (L.helm === 'great') {
    // a flat-topped great helm: a bucket with a cross on its face
    const x0 = Math.round(cx - R);
    const y0 = Math.round(cy - R);
    const w = Math.round(R * 2);
    const h = Math.round(R * 2 + 2);
    lit(p, L.steel, L.hi, L.lo, (l) => {
      l.rect(x0 + 1, y0, w - 2, 1, L.ink);
      l.rect(x0, y0 + 1, w, h - 2, L.ink);
      l.rect(x0 + 1, y0 + h - 1, w - 2, 1, L.ink);
    });
    const slitY = y0 + Math.round(h * 0.38);
    const barX = x0 + Math.round(w * 0.62);
    // the cross: a brass strip down the face and one across the eyes
    for (let y = y0 + 1; y < y0 + h - 1; y++) p.set(barX, y, L.brass[2]).set(barX + 1, y, L.brass[1]);
    for (let x = x0 + 1; x < x0 + w - 1; x++) p.set(x, slitY - 1, L.brass[2]).set(x, slitY + 1, L.brass[1]);
    // the eye slit itself, and breathing holes below it
    for (let x = x0 + 2; x < x0 + w - 1; x++) if (x !== barX && x !== barX + 1) p.set(x, slitY, L.ink);
    for (let k = 0; k < 3; k++) p.set(barX + 3, slitY + 3 + k * 2, L.ink).set(barX - 3, slitY + 3 + k * 2, L.steel[0]);
    // rivets along the top
    for (let x = x0 + 2; x < x0 + w - 1; x += 3) p.set(x, y0 + 1, L.steel[4]);
    return;
  }
  ball(p, cx, cy, R, R, L.steel, L.shade);
  // a ridge over the crown
  for (let k = 0; k < R - 1; k++) {
    const y = Math.round(cy - R) + k;
    const x = Math.round(cx) - 1 - Math.round(k * 0.2);
    if (p.has(x, y)) p.set(x, y, L.steel[4]);
    if (p.has(x + 1, y)) p.set(x + 1, y, k < R * 0.55 ? L.steel[3] : L.steel[2]);
  }
  // brow band, following the helm's own shading
  const by = Math.round(cy) - 1;
  const rows = R >= 8 ? 2 : 1;
  for (let y = by; y < by + rows; y++) {
    for (let x = 0; x < FW; x++) {
      const c = p.get(x, y);
      const i = c === null ? -1 : L.steel.indexOf(c);
      if (i >= 0) p.set(x, y, L.brass[Math.max(0, i - (y === by + 1 ? 1 : 0))]);
    }
  }
  const key = { J: L.skin[0], j: L.skin[1], k: L.skin[2], K: L.skin[3], e: L.eye, X: L.glint, P: L.blush ?? L.skin[2] };
  const fy = by + rows;
  if (L.face === 'big') stamp(p, Math.round(cx) - 4, fy, FACE_BIG, key);
  else if (L.face === 'open') stamp(p, Math.round(cx) - 2, fy, FACE_OPEN, key);
  else if (L.face === 'shadow') stamp(p, Math.round(cx) - 2, fy, FACE_SHADOW, key);
}

export function sword(p: Px, L: Look, hx: number, hy: number, deg: number): void {
  const a = (deg * Math.PI) / 180;
  const dx = Math.cos(a);
  const dy = -Math.sin(a);
  const litSide = 0.65 * dy - 0.75 * dx > 0 ? 1 : -1;
  const reach = L.blade + 8;
  const tip = 4 + L.blade;
  const steel = L.bladeRamp ?? L.steel;
  for (let y = Math.floor(hy - reach); y <= Math.ceil(hy + reach); y++) {
    for (let x = Math.floor(hx - reach); x <= Math.ceil(hx + reach); x++) {
      const rx = x + 0.5 - hx;
      const ry = y + 0.5 - hy;
      const u = rx * dx + ry * dy;
      const v = (-rx * dy + ry * dx) * litSide;
      let c: string | null = null;
      if (u >= 4 && u <= tip) {
        const half = u > tip - 3.5 ? (tip - u) * (L.bladeW / 3.5) : L.bladeW;
        if (Math.abs(v) <= half) c = v > L.bladeW * 0.35 ? steel[4] : v < -L.bladeW * 0.35 ? steel[2] : steel[3];
        if (c && Math.abs(v) < 0.5 && u < tip - 6) c = steel[2];
        // a notched, pitted edge
        if (c && L.ragged && hash(Math.round(u), 1) < 0.13 && v * (hash(Math.round(u), 2) < 0.5 ? 1 : -1) > half - 1) c = null;
      } else if (u >= 2.2 && u < 4 && Math.abs(v) <= L.bladeW + 2.6) {
        c = v > 1.5 ? L.brass[3] : v < -2.5 ? L.brass[0] : u < 3 ? L.brass[1] : L.brass[2];
      } else if (u >= -2.6 && u < 2.2 && Math.abs(v) <= 1.3) {
        c = Math.floor(u + 3) % 2 === 0 ? L.leather[2] : L.leather[1];
      } else if (u >= -4.8 && u < -2.6 && Math.abs(v) <= 1.9) {
        c = v > 0.4 ? L.brass[3] : v < -0.9 ? L.brass[0] : L.brass[2];
      }
      if (c) p.set(x, y, c);
    }
  }
}

export function gauntlet(p: Px, L: Look, hx: number, hy: number): void {
  const x = Math.round(hx) - 2;
  const y = Math.round(hy) - 2;
  p.rect(x, y, 4, 4, L.leather[2]);
  p.hline(x, y, 3, L.leather[4]).vline(x, y, 3, L.leather[3]);
  p.hline(x + 1, y + 3, 3, L.leather[1]).vline(x + 3, y + 1, 3, L.leather[1]);
}

export function roundShield(p: Px, L: Look, cx: number, cy: number): void {
  const r = L.shieldR;
  for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
    for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
      const ox = x + 0.5 - cx;
      const oy = y + 0.5 - cy;
      const d = Math.hypot(ox, oy);
      if (d > r) continue;
      // a battered shield has bites out of its rim
      if (L.ragged && d > r - 1.2 && hash(Math.round(Math.atan2(oy, ox) * 5), 2) < 0.22) continue;
      const side = (ox * LX + oy * LY) / r;
      if (d > r - 1.9) {
        p.set(x, y, L.steel[side > 0.55 ? 4 : side > 0.2 ? 3 : side > -0.35 ? 2 : side > -0.7 ? 1 : 0]);
      } else {
        const seam = ((Math.floor(ox) % 4) + 4) % 4 === 0;
        const tone = side > 0.45 ? 4 : side > 0.05 ? 3 : side > -0.45 ? 2 : 1;
        p.set(x, y, L.wood[seam ? Math.max(0, tone - 2) : tone]);
      }
    }
  }
  for (let x = Math.floor(cx - r + 2); x <= Math.ceil(cx + r - 3); x++) p.set(x, Math.round(cy) - 1, L.steel[3]).set(x, Math.round(cy), L.steel[1]);
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + 0.4;
    const x = Math.floor(cx + Math.cos(a) * (r - 1));
    const y = Math.floor(cy + Math.sin(a) * (r - 1));
    if (p.has(x, y)) p.set(x, y, L.steel[4]);
  }
  ball(p, cx, cy - 0.5, Math.max(2, r * 0.34), Math.max(2, r * 0.34), L.steel, L.shade);
}

/** The finish: what is done to the whole picture after it is painted. */
export function finish(p: Px, L: Look): Px {
  if (L.finish === 'grime') {
    // dirt, pitting and old blood: scattered pixels pushed a tone darker, more of them lower down
    p.each((x, y, c) => {
      if (c === L.ink) return null;
      const low = y / FH;
      if (hash(x, y, 9) < 0.05 + low * 0.1) {
        for (const ramp of [L.steel, L.mail, L.cloth, L.cloak, L.leather, L.brass, L.wood, L.feather]) {
          const i = ramp.indexOf(c);
          if (i > 0) return ramp[i - 1];
        }
      }
      return null;
    });
    return p;
  }
  if (L.finish === 'engrave') {
    // an engraving: the shaded side of each form becomes pen hatching over a wash of colour
    p.each((x, y, c) => {
      const wash = WASH[c];
      if (wash === undefined) return null;
      return (x + y) % 3 === 0 ? L.ink : wash;
    });
    return p;
  }
  return p;
}

// Marker colours that the engraving finish turns into hatching, and the wash under each.
const H_STEEL = '#010101';
const H_RED = '#020202';
const H_BROWN = '#030303';
const H_BONE = '#040404';
const H_BLUE = '#050505';
const WASH: Readonly<Record<string, string>> = {
  [H_STEEL]: '#b4bab0',
  [H_RED]: '#a8402e',
  [H_BROWN]: '#8e6638',
  [H_BONE]: '#cbbd9a',
  [H_BLUE]: '#56627c',
};

/** Paint the warrior, standing, facing the camera. */
export function figure(L: Look): Px {
  const X = FAX;
  const B = L.bodyH;
  const hip = Math.round(B * L.legs);
  const belt = hip + Math.max(4, Math.round((B - hip) * 0.36));
  const shoulder = B - 2;
  const shoulderY = FAY - shoulder;
  const beltY = FAY - belt;

  const back = layer();
  if (L.cape > 0) cape(back, L, X, shoulderY + 1, FAY - Math.round(shoulder * (1 - L.cape)));

  // sword hand, just outside the shoulder plate
  const hx = X + L.chest + 5;
  const hy = beltY - Math.round((B - belt) * 0.3);
  const weapon = layer();
  sword(weapon, L, hx, hy, 70);

  const body = layer();
  // the sword arm goes behind the chest: upper arm in mail, forearm in plate
  const ex = (X + L.chest + 1 + hx) / 2 + 1;
  const ey = (shoulderY + 3 + hy) / 2 + 2;
  limb(body, X + L.chest + 1, shoulderY + 3, ex, ey, L.armR, L.armR - 0.4, L.mail, true);
  limb(body, ex, ey, hx, hy, L.armR - 0.4, L.armR - 0.8, L.steel);
  // legs: the foot nearer the camera (screen-left) stands lower
  leg(body, L, X + 1, FAY - 3, hip - 2, true);
  leg(body, L, X - L.legW - 2, FAY - 1, hip, false);
  skirt(body, L, X, beltY + 3, FAY - hip + Math.round(hip * L.skirt));
  // shield arm: a mail sleeve hanging at the side, a gloved fist at the end of it
  limb(body, X - L.chest - 1, shoulderY + 3, X - L.chest - 2, beltY - 1, L.armR, L.armR - 0.4, L.mail, true);
  gauntlet(body, L, X - L.chest - 2, beltY + 2);
  chest(body, L, X, shoulderY, beltY);
  const pr = Math.max(3.5, L.chest * 0.62);
  ball(body, X + L.chest + 1.5, shoulderY + 1.5, pr - 1, (pr - 1) * 0.85, [L.steel[0], L.steel[0], L.steel[1], L.steel[2], L.steel[3]]);
  ball(body, X - L.chest - 1, shoulderY + 1.5, pr, pr * 0.82, L.steel, L.shade);
  helm(body, L, X, FAY - B);

  const hand = layer();
  gauntlet(hand, L, hx, hy);

  const shield = layer();
  roundShield(shield, L, X - L.chest - 3, beltY - Math.round((B - belt) * 0.15));

  return finish(stack([back, body, weapon, hand, shield], L.ink), L);
}

/** The foe: a skeleton with a rusted blade, raised toward the hero on its left. */
export function skeleton(L: Look): Px {
  const X = FAX + 2;
  const cute = L.face === 'big';
  const R = Math.max(4.5, L.headR * 0.9);
  const B = Math.round(L.bodyH * 0.92);
  const hip = Math.round(B * L.legs);
  const shoulderY = FAY - (B - 2);
  const hipY = FAY - hip;
  const half = Math.max(4, Math.round(L.chest * 0.7));
  const br = cute ? 1.8 : 1.4;
  const bone = L.bone;
  const dark = L.ink;

  const body = layer();
  const joint = (x: number, y: number, r: number): void => ball(body, x, y, r, r, bone, L.shade);

  // legs: thigh, knee, shin, and a foot that points at the hero
  const legBone = (hx: number, fx: number, sole: number, bend: number): void => {
    const kx = (hx + fx) / 2 + bend;
    const ky = (hipY + sole) / 2;
    limb(body, hx, hipY, kx, ky, br, br - 0.2, bone);
    limb(body, kx, ky, fx, sole - 1, br - 0.2, br - 0.3, bone);
    joint(kx, ky, br + 0.6);
    const f = Math.round(fx);
    body.rect(f - 3, sole - 1, 5, 2, bone[2]);
    body.hline(f - 3, sole - 1, 4, bone[3]).set(f + 1, sole, bone[1]);
  };
  legBone(X + half * 0.55, X + half * 0.95, FAY - 3, 1.2);
  legBone(X - half * 0.55, X - half * 0.95, FAY - 1, -1.2);

  // what is left of its clothes
  if (!cute) {
    const bottom = hipY + Math.round(hip * 0.5);
    lit(body, L.cloak, [0, 1], [1, 2], (l) => {
      for (let y = hipY - 2; y <= bottom; y++) {
        for (let x = X - half; x < X + half; x++) {
          if (y > bottom - 1 - Math.floor(hash(x, 13) * 6)) continue;
          l.set(x, y, dark);
        }
      }
    });
  }

  // hips
  lit(body, bone, L.hi, L.lo, (l) => {
    const w = Math.round(half * 0.85);
    l.rect(X - w, hipY - 4, w * 2, 3, dark);
    l.rect(X - w + 1, hipY - 1, w * 2 - 2, 1, dark);
  });
  body.set(X - 1, hipY - 2, bone[0]).set(X, hipY - 2, bone[0]);

  // spine
  for (let y = shoulderY + 1; y < hipY - 4; y++) {
    const k = (y - shoulderY) % 2 === 0;
    body.set(X - 1, y, k ? bone[3] : bone[1]).set(X, y, k ? bone[2] : bone[0]);
  }

  // ribs: every other row is a rib, and the gaps between are a little narrower
  const ribTop = shoulderY + 1;
  const ribBot = shoulderY + Math.max(5, Math.round((hipY - shoulderY) * 0.58));
  for (let y = ribTop; y <= ribBot; y++) {
    const t = (y - ribTop) / (ribBot - ribTop);
    const w = Math.round(half * (0.82 + 0.18 * Math.sin(Math.PI * t)));
    const rib = (y - ribTop) % 2 === 0;
    for (let x = X - w + (rib ? 0 : 1); x < X + w - (rib ? 0 : 1); x++) {
      const s = (x - X) / w;
      body.set(x, y, !rib ? bone[0] : s < -0.6 ? bone[4] : s < -0.05 ? bone[3] : s < 0.55 ? bone[2] : bone[1]);
    }
    body.set(X - 1, y, rib ? bone[4] : bone[2]).set(X, y, rib ? bone[3] : bone[1]);
  }
  body.hline(X - half, shoulderY, half * 2, bone[3]);

  // the arm that hangs: shoulder, elbow, and three finger bones
  const sy = shoulderY + 1;
  const sx2 = X + half + 1;
  const ex2 = sx2 + 2;
  const ey2 = sy + Math.round(B * 0.2);
  const hx2 = sx2;
  const hy2 = ey2 + Math.round(B * 0.16);
  limb(body, sx2, sy, ex2, ey2, br, br - 0.2, bone);
  limb(body, ex2, ey2, hx2, hy2, br - 0.2, br - 0.4, bone);
  joint(ex2, ey2, br + 0.3);
  joint(sx2, sy, br + 0.8);
  body.set(hx2 - 2, hy2 + 1, bone[3]).set(hx2 - 2, hy2 + 2, bone[2]).set(hx2, hy2 + 2, bone[3]).set(hx2, hy2 + 3, bone[2]).set(hx2 + 2, hy2 + 1, bone[2]);

  // the arm that holds the blade, raised
  const sx = X - half - 1;
  const ex = sx - 3.5;
  const ey = sy + Math.round(B * 0.13);
  const hx = ex - 2.5;
  const hy = ey - Math.round(B * 0.2);
  limb(body, sx, sy, ex, ey, br, br - 0.2, bone);
  limb(body, ex, ey, hx, hy, br - 0.2, br - 0.4, bone);
  joint(ex, ey, br + 0.3);
  joint(sx, sy, br + 0.8);

  // skull
  const cx = X - 1.5;
  const cy = FAY - B - R + 2;
  ball(body, cx, cy, R, R * 0.95, bone, L.shade);
  const jw = Math.max(2, Math.round(R * 0.55));
  const jy = Math.round(cy + R * 0.66);
  const jh = Math.max(2, Math.round(R * 0.5));
  const mx = Math.round(cx);
  for (let y = jy; y < jy + jh; y++) {
    for (let x = mx - jw; x < mx + jw; x++) body.set(x, y, x < mx - jw * 0.4 ? bone[3] : x < mx + jw * 0.4 ? bone[2] : bone[1]);
  }
  if (cute) {
    // big round sockets with a glint, and a little row of teeth
    const so = R * 0.42;
    for (const side of [-1, 1]) {
      const ox = cx + side * so;
      const oy = cy + R * 0.12;
      body.ellipse(ox, oy, R * 0.2, R * 0.27, L.eye);
      body.set(Math.round(ox - 1), Math.round(oy - R * 0.14), L.glint);
    }
    for (let x = mx - 2; x <= mx + 2; x++) body.set(x, jy + 1, x % 2 === 0 ? dark : bone[4]);
  } else {
    const so = Math.max(2, Math.round(R * 0.42));
    const sw = Math.max(2, Math.round(R * 0.36));
    const ey0 = Math.round(cy - R * 0.1);
    for (const side of [-1, 1]) {
      const x0 = Math.round(cx + side * so - sw / 2);
      body.rect(x0, ey0, sw, sw, dark);
      if (L.socket) body.set(x0 + (side < 0 ? sw - 1 : 0), ey0 + sw - 1, L.socket);
    }
    body.set(mx, Math.round(cy + R * 0.44), dark);
    if (R >= 6) body.set(mx - 1, Math.round(cy + R * 0.44), dark);
    // teeth, and a jaw that hangs open on the grimmer looks
    for (let x = mx - jw + 1; x < mx + jw - 1; x++) body.set(x, jy, (x & 1) === 0 ? bone[4] : dark);
    if (L.ragged) {
      for (let x = mx - jw + 1; x < mx + jw - 1; x++) body.set(x, jy + 1, dark);
      // a crack down from the crown
      body.set(mx + 1, Math.round(cy - R) + 1, dark).set(mx + 2, Math.round(cy - R) + 2, dark).set(mx + 1, Math.round(cy - R) + 3, dark);
    }
  }

  const weapon = layer();
  const iron: Ramp = L.finish === 'engrave' ? L.rust : [0, 1, 2, 3, 4].map((i) => mix(L.steel[i], L.rust[i], 0.45)) as unknown as Ramp;
  sword(weapon, { ...L, steel: iron, bladeRamp: undefined, brass: L.rust, blade: Math.round(L.blade * 0.8), bladeW: L.bladeW * 1.25, ragged: true }, hx, hy, 112);
  weapon.each((x, y) => (hash(x, y, 21) < 0.13 ? L.rust[2] : null));
  const hand = layer();
  ball(hand, hx, hy, 1.9, 1.9, bone, L.shade);

  return finish(stack([body, weapon, hand], L.ink), L);
}

// ---------------------------------------------------------------------------------------------
// The ground under the figure: a round patch of flagstones, seen at the game's angle.

export function groundPatch(L: Look, rx: number, ry: number): Px {
  const M = 12; // room for the flagstones that stick out past the oval
  const w = rx * 2 + M * 2;
  const h = ry * 2 + M;
  const p = new Px(w, h);
  const S = 1.6; // flagstones per floor tile
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x + 0.5 - w / 2;
      const dy = y + 0.5 - h / 2;
      // which flagstone is this? (the floor's own grid, turned to the game's angle)
      const u = (dx / 32 + dy / 16) / 2 + 8;
      const v = (dy / 16 - dx / 32) / 2 + 8;
      const su = Math.floor(u * S);
      const sv = Math.floor(v * S);
      // a flagstone is laid whole or not at all, so the patch ends in a stepped edge
      const uc = (su + 0.5) / S - 8;
      const vc = (sv + 0.5) / S - 8;
      const cx = 32 * (uc - vc);
      const cy = 16 * (uc + vc);
      if ((cx * cx) / (rx * rx) + (cy * cy) / (ry * ry) > 1) continue;
      const fu = u * S - su;
      const fv = v * S - sv;
      const edge = Math.min(fu, fv);
      let c: string;
      if (edge < 0.07) c = L.mortar;
      else {
        const tone = hash(su, sv, 1);
        c = L.ground[tone < 0.3 ? 1 : tone < 0.8 ? 2 : 3];
        if (edge < 0.16) c = L.ground[3]; // a lit lip along each slab's upper edges
        if (Math.max(fu, fv) > 0.9) c = L.ground[0]; // and a shaded one along the lower
        if (hash(x, y, 4) < 0.06) c = L.ground[0];
      }
      if (L.finish === 'engrave' && c === L.ground[1]) c = (x + y) % 4 === 0 ? L.ink : L.ground[2];
      p.set(x, y, c);
    }
  }
  return p;
}

// ---------------------------------------------------------------------------------------------
// The looks: four from the darkest to the lightest, then two from other directions altogether.

const GRIM: Look = {
  id: 'grim',
  name: 'Grimdark',
  blurb: ['Gaunt and battered. Rust, rags and', 'old blood. Mostly darkness.'],
  headR: 5.5, bodyH: 54, legs: 0.5, chest: 8, waist: 6, legW: 5, armR: 2.8, shieldR: 8.5, blade: 26, bladeW: 1.9, skirt: 0.5, cape: 0.82, plume: 0, helm: 'great', face: 'none', ragged: true, trim: false,
  ink: '#030305',
  steel: ['#0c0d11', '#22252b', '#3e4349', '#62686c', '#8f9594'],
  mail: ['#08090c', '#15171b', '#272a2f', '#3d4146', '#565b5e'],
  cloth: ['#12060a', '#290b11', '#451119', '#63191f', '#812a27'],
  cloak: ['#060507', '#100d11', '#1d181c', '#2c2528', '#3d3436'],
  leather: ['#0b0706', '#1c120d', '#302019', '#463022', '#5f442e'],
  brass: ['#17110a', '#33260f', '#54401c', '#7a602e', '#a08447'],
  wood: ['#0d0907', '#1f150f', '#34241a', '#4a3524', '#624830'],
  feather: ['#12060a', '#290b11', '#451119', '#63191f', '#812a27'],
  bone: ['#0f0d0a', '#2b261e', '#4e4737', '#756c55', '#9c9278'],
  rust: ['#0c0908', '#201813', '#3a2c22', '#574536', '#74604c'],
  socket: '#c0281a',
  skin: ['#3a2a26', '#57423a', '#77604f', '#978068'],
  eye: '#030305', glint: '#8f9a94', blush: null,
  hi: [0, 1], lo: [2, 4], shade: 0.14,
  ground: ['#0b0a0d', '#17151a', '#221f25', '#2e2a30'], mortar: '#050406', backdrop: '#040305', dark: 0.88, glow: 'rgba(150,90,44,0.3)',
  finish: 'grime',
};

const DARK: Look = {
  id: 'dark',
  name: 'Dark fantasy',
  blurb: ['A real knight in muted colours,', 'lit by torchlight.'],
  headR: 6.5, bodyH: 48, legs: 0.48, chest: 9, waist: 7, legW: 5, armR: 3, shieldR: 9, blade: 22, bladeW: 2, skirt: 0.42, cape: 0.7, plume: 0.9, helm: 'round', face: 'shadow', ragged: false, trim: true,
  ink: '#0c0910',
  steel: ['#161a22', '#2f3744', '#566274', '#8793a4', '#c2ccd6'],
  mail: ['#0f1218', '#1e242e', '#343d4a', '#515c6b', '#73808f'],
  cloth: ['#220a10', '#48121c', '#74202a', '#a13238', '#c85a50'],
  cloak: ['#16080c', '#2e0d15', '#4a151f', '#6a202a', '#8c3438'],
  leather: ['#1c110b', '#352115', '#553723', '#7a5334', '#a17548'],
  brass: ['#3a2508', '#6b4a14', '#a17a26', '#d2a844', '#f0d67c'],
  wood: ['#1e130c', '#3a2616', '#5c3e24', '#825c36', '#a87e4c'],
  feather: ['#2a0a10', '#58141e', '#8c2430', '#bc3c40', '#e06a5c'],
  bone: ['#1c181a', '#4a4238', '#7e7460', '#b0a688', '#dcd4b4'],
  rust: ['#1a120e', '#38281e', '#5c4636', '#867060', '#aa9884'],
  socket: '#9cf078',
  skin: ['#4a2e24', '#7c5140', '#aa7860', '#cfa084'],
  eye: '#07050a', glint: '#ffd27a', blush: null,
  hi: [1, 2], lo: [1, 3], shade: 0.12,
  ground: ['#1c1722', '#2a2331', '#3a3040', '#4d4252'], mortar: '#120d18', backdrop: '#0b0810', dark: 0.72, glow: 'rgba(255,150,60,0.22)',
  finish: 'none',
};

const HERO: Look = {
  id: 'hero',
  name: 'Classic adventure',
  blurb: ['Clean shapes and strong colours,', 'like a 16-bit console adventure.'],
  headR: 7.5, bodyH: 40, legs: 0.45, chest: 9, waist: 7, legW: 5, armR: 3, shieldR: 9, blade: 18, bladeW: 2, skirt: 0.38, cape: 0.55, plume: 1, helm: 'round', face: 'open', ragged: false, trim: true,
  ink: '#181020',
  steel: ['#2a3350', '#4f6088', '#8aa0c8', '#c4d4f0', '#ffffff'],
  mail: ['#232a42', '#3b4868', '#5c6e98', '#8496c0', '#aebce0'],
  cloth: ['#5a0c1c', '#9c1428', '#d82838', '#f85858', '#ffa098'],
  cloak: ['#101c50', '#1c3486', '#2a54c0', '#4a80e8', '#86b4ff'],
  leather: ['#3a1c0c', '#6a3818', '#a05c28', '#d08848', '#f0b878'],
  brass: ['#7a4a00', '#c08010', '#f0b828', '#ffe060', '#fff8b0'],
  wood: ['#3c200e', '#6e3e1c', '#a4642e', '#d49250', '#f4c080'],
  feather: ['#5a0c1c', '#9c1428', '#d82838', '#f85858', '#ffa098'],
  bone: ['#3a3458', '#8a84a0', '#c8c4d0', '#eceaf0', '#ffffff'],
  rust: ['#3a2418', '#6a4a34', '#9a7a5c', '#c4a888', '#e4d0b4'],
  socket: '#ff4040',
  skin: ['#8a4a30', '#c87850', '#f0a878', '#ffd0a8'],
  eye: '#181020', glint: '#ffffff', blush: null,
  hi: [1, 2], lo: [1, 2], shade: 0,
  ground: ['#3a3458', '#544c78', '#6e6698', '#8a82b4'], mortar: '#262040', backdrop: '#1a1630', dark: 0.3, glow: 'rgba(255,220,150,0.16)',
  finish: 'none',
};

const CUTE: Look = {
  id: 'cute',
  name: 'Bright and cute',
  blurb: ['Big head, big eyes, soft colours.', 'Friendly even when it is spooky.'],
  headR: 11, bodyH: 27, legs: 0.4, chest: 8, waist: 7, legW: 6, armR: 3, shieldR: 8, blade: 13, bladeW: 2.3, skirt: 0.4, cape: 0, plume: 1.05, helm: 'round', face: 'big', ragged: false, trim: true,
  ink: '#4a2a48',
  steel: ['#6a6f9a', '#9aa0c8', '#c4c9e8', '#e4e8f8', '#ffffff'],
  mail: ['#5c608a', '#7e84b0', '#a0a6cc', '#c0c6e4', '#dce0f4'],
  cloth: ['#b03a50', '#e0546a', '#ff7a88', '#ffa4a8', '#ffd0cc'],
  cloak: ['#b03a50', '#e0546a', '#ff7a88', '#ffa4a8', '#ffd0cc'],
  leather: ['#7a4a2a', '#a8703e', '#d09a5c', '#ecc088', '#fce0b8'],
  brass: ['#c88a10', '#f0b828', '#ffd84a', '#fff08a', '#fffbd0'],
  wood: ['#8a5630', '#b47c44', '#d8a464', '#f0c890', '#fce4c0'],
  feather: ['#b03a50', '#e0546a', '#ff7a88', '#ffa4a8', '#ffd0cc'],
  bone: ['#8a80a8', '#bcb4d4', '#e4e0f0', '#f6f4fc', '#ffffff'],
  rust: ['#8a6a50', '#b08c6c', '#d0b090', '#e8d0b4', '#f8ecd8'],
  socket: null,
  skin: ['#d08868', '#f0a888', '#ffc8a8', '#ffe2cc'],
  eye: '#3a2038', glint: '#ffffff', blush: '#ff8a9a',
  hi: [1, 3], lo: [1, 2], shade: 0,
  ground: ['#8ab0a0', '#a4c8b4', '#bcdcc8', '#d4ecdc'], mortar: '#6e9488', backdrop: '#cfe8e0', dark: 0, glow: 'rgba(255,255,220,0.2)',
  finish: 'none',
};

const BOOK: Look = {
  id: 'book',
  name: 'Storybook ink',
  blurb: ['Pen lines and washes of colour on', 'paper, like a picture in an old book.'],
  headR: 7, bodyH: 43, legs: 0.47, chest: 9, waist: 7, legW: 5, armR: 3, shieldR: 9, blade: 20, bladeW: 2, skirt: 0.4, cape: 0.6, plume: 1, helm: 'round', face: 'open', ragged: false, trim: true,
  ink: '#2a1b12',
  steel: ['#2a1b12', H_STEEL, '#d6d8c8', '#e8e4ce', '#f6efda'],
  mail: ['#2a1b12', H_STEEL, '#b4bab0', '#ccd0c2', '#e2e0cc'],
  cloth: ['#2a1b12', H_RED, '#bc4c3a', '#d27058', '#e4a088'],
  cloak: ['#2a1b12', H_BLUE, '#6c7890', '#8c96aa', '#aab2c0'],
  leather: ['#2a1b12', H_BROWN, '#a87c48', '#c29c68', '#dabe90'],
  brass: ['#5a3c14', '#8a6424', '#c79a3c', '#e0bc62', '#f0dc98'],
  wood: ['#2a1b12', H_BROWN, '#b48c54', '#caa872', '#dec596'],
  feather: ['#2a1b12', H_RED, '#bc4c3a', '#d27058', '#e4a088'],
  bone: ['#2a1b12', H_BONE, '#e4d8b8', '#f0e8ce', '#f9f3e2'],
  rust: ['#2a1b12', H_BROWN, '#cdbb98', '#ddd0b0', '#ebe2c8'],
  socket: null,
  skin: ['#b89878', '#d8bc98', '#ecd8b8', '#f6ecd6'],
  eye: '#2a1b12', glint: '#f6ecd6', blush: null,
  hi: [1, 2], lo: [0, 3], shade: -0.22,
  ground: ['#bca880', '#d0bc94', '#e0d0ac', '#ecdfc0'], mortar: '#2a1b12', backdrop: '#efe2c4', dark: 0, glow: 'rgba(0,0,0,0)',
  finish: 'engrave',
};

const NEON: Look = {
  id: 'neon',
  name: 'Bold and modern',
  blurb: ['Flat colour, no outlines, glowing', 'accents on deep blue.'],
  headR: 6, bodyH: 46, legs: 0.5, chest: 8, waist: 6, legW: 4, armR: 2.6, shieldR: 8, blade: 22, bladeW: 1.8, skirt: 0.45, cape: 0.8, plume: 1.1, helm: 'round', face: 'shadow', ragged: false, trim: false,
  ink: '#0e0c24',
  steel: ['#3a3478', '#3a3478', '#7a74c8', '#d6d0ff', '#d6d0ff'],
  mail: ['#28245a', '#28245a', '#4a4690', '#7e7ac0', '#7e7ac0'],
  cloth: ['#7a1058', '#7a1058', '#e0287a', '#ff7aa8', '#ff7aa8'],
  cloak: ['#0c3a52', '#0c3a52', '#157a8c', '#3cc4c0', '#3cc4c0'],
  leather: ['#3a1c40', '#3a1c40', '#6e3a5c', '#a8607a', '#a8607a'],
  brass: ['#0c6a80', '#0c6a80', '#22d0e0', '#b8fff8', '#b8fff8'],
  wood: ['#2a2466', '#2a2466', '#4640a0', '#6e68cc', '#6e68cc'],
  feather: ['#0c6a80', '#0c6a80', '#22d0e0', '#b8fff8', '#b8fff8'],
  bladeRamp: ['#0c6a80', '#0c6a80', '#22d0e0', '#8af6f0', '#ffffff'],
  bone: ['#5a4a8a', '#5a4a8a', '#b0a4e0', '#f0e8ff', '#f0e8ff'],
  rust: ['#3a1848', '#3a1848', '#7a3a78', '#c06aa0', '#c06aa0'],
  socket: '#ff4f8a',
  skin: ['#5a4a8a', '#8a7ab0', '#b0a4e0', '#d8d0f8'],
  eye: '#0e0c24', glint: '#7af8f0', blush: null,
  hi: [0, 2], lo: [0, 3], shade: 0,
  ground: ['#12102e', '#191740', '#201e50', '#2b2966'], mortar: '#0b0a1e', backdrop: '#0b0a1e', dark: 0.55, glow: 'rgba(40,220,240,0.2)',
  finish: 'none',
};

export const LOOKS: readonly Look[] = [GRIM, DARK, HERO, CUTE, BOOK, NEON];

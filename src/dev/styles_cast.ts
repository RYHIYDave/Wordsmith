// Concept art, part two: the rest of the cast (ranger, mage, cultist, bat, brute), painted with the
// same helpers as styles.ts so they follow whichever Look they are given. Not part of the game.

import { Px } from '../engine/px';
import { FAX, FAY, FH, FW, ball, cape, gauntlet, finish, hash, layer, limb, lit, stamp } from './styles';
import type { Look, Ramp } from './styles';

/** Colours the first sheet did not need. */
interface Cast {
  /** The ranger's hood and cloak. */
  leaf: Ramp;
  /** The mage's robe and hat. */
  robe: Ramp;
  /** The cultist's robe, and the strip of cloth down its front. */
  gloom: Ramp;
  stole: Ramp;
  /** The brute's hide. */
  flesh: Ramp;
  /** The bat's body and its wings. */
  fur: Ramp;
  wing: Ramp;
  /** The light in the mage's staff, and the cultist's fire. */
  spark: Ramp;
  flame: Ramp;
}

const CAST: Readonly<Record<string, Cast>> = {
  grim: {
    leaf: ['#07090a', '#11160f', '#1e2618', '#2f3a24', '#465233'],
    robe: ['#07070c', '#12121c', '#20202e', '#313044', '#48465c'],
    gloom: ['#08050a', '#150c17', '#251526', '#382038', '#4e2e4c'],
    stole: ['#12060a', '#290b11', '#451119', '#63191f', '#812a27'],
    flesh: ['#0b0d0a', '#232a20', '#3d4636', '#5a644e', '#7a846a'],
    fur: ['#060505', '#120e0d', '#211a18', '#342926', '#4a3b36'],
    wing: ['#0a0606', '#1c0e0f', '#32181a', '#4a2426', '#643434'],
    spark: ['#1a2a36', '#3a5a6e', '#6a9ab0', '#a8d4e0', '#e8fbff'],
    flame: ['#3a0c06', '#7a1c0a', '#c24a12', '#f0902a', '#ffd870'],
  },
  neon: {
    leaf: ['#0e4a2c', '#0e4a2c', '#22b060', '#8af078', '#8af078'],
    robe: ['#3a1a7a', '#3a1a7a', '#7a3ae0', '#b890ff', '#b890ff'],
    gloom: ['#1c0c34', '#1c0c34', '#3a1a5c', '#643a8c', '#643a8c'],
    stole: ['#7a1058', '#7a1058', '#e0287a', '#ff7aa8', '#ff7aa8'],
    flesh: ['#34406a', '#34406a', '#5870a8', '#9ab0e0', '#9ab0e0'],
    fur: ['#241c5c', '#241c5c', '#3c3490', '#6a62c8', '#6a62c8'],
    wing: ['#5a1050', '#5a1050', '#b0206a', '#f0508a', '#f0508a'],
    spark: ['#0c6a80', '#0c6a80', '#22d0e0', '#b8fff8', '#ffffff'],
    flame: ['#7a1058', '#c0206a', '#ff4f8a', '#ffb070', '#fff0a0'],
  },
};

/** The extra colours for a look; looks without their own borrow from what they have. */
function cast(L: Look): Cast {
  return (
    CAST[L.id] ?? {
      leaf: L.cloak,
      robe: L.cloak,
      gloom: L.cloak,
      stole: L.cloth,
      flesh: L.leather,
      fur: L.cloak,
      wing: L.cloth,
      spark: L.brass,
      flame: L.brass,
    }
  );
}

/** A light a figure gives off, in its own canvas: the scene adds the glow. */
export interface Light {
  x: number;
  y: number;
  r: number;
  color: string;
}
export const LIGHTS = new WeakMap<Px, Light[]>();

/** One tone darker all round: the side of a figure that is turned away from the light. */
function dim(r: Ramp): Ramp {
  return [r[0], r[0], r[1], r[2], r[3]];
}

/** Stack outlined layers, with an optional layer under them and one over them that get no outline. */
function compose(under: Px | null, layers: ReadonlyArray<Px>, over: Px | null, L: Look): Px {
  const out = layer();
  if (under) out.blit(under, 0, 0);
  for (const l of layers) out.blit(l.outline(L.ink), 0, 0);
  const done = finish(out, L);
  if (over) done.blit(over, 0, 0);
  return done;
}

interface Frame {
  X: number;
  B: number;
  hip: number;
  shoulderY: number;
  beltY: number;
  hipY: number;
  chinY: number;
}

/** The heights every standing figure is hung from. */
function frame(L: Look, X: number, scale: number): Frame {
  const B = Math.round(L.bodyH * scale);
  const hip = Math.round(B * L.legs);
  const belt = hip + Math.max(4, Math.round((B - hip) * 0.36));
  return { X, B, hip, shoulderY: FAY - (B - 2), beltY: FAY - belt, hipY: FAY - hip, chinY: FAY - B };
}

/** A leg in hose with a tall boot; the toe points at the foe (screen-right). */
function bootLeg(p: Px, L: Look, hipX: number, sole: number, len: number, w: number, far: boolean, hose: Ramp, bootShare: number): void {
  const top = sole - len;
  const bootTop = sole - Math.round(len * bootShare);
  const boot = far ? dim(L.leather) : L.leather;
  lit(p, far ? dim(hose) : hose, [0, 2], [1, 2], (l) => l.rect(hipX, top, w, bootTop - top + 1, L.ink));
  lit(p, boot, [0, 2], [1, 2], (l) => {
    for (let y = bootTop; y <= sole; y++) {
      const cuff = y <= bootTop + 1;
      l.rect(hipX - (cuff ? 1 : 0), y, cuff ? w + 2 : y >= sole - 1 ? w + 3 : w, 1, L.ink);
    }
  });
  p.hline(hipX, sole, w + 3, boot[0]);
}

/** A belt with a buckle. */
function belt(p: Px, L: Look, X: number, y: number, half: number, strap: Ramp): void {
  const x0 = Math.round(X - half);
  const w = Math.round(half * 2);
  p.rect(x0, y, w, 3, strap[2]);
  p.hline(x0, y, w, strap[3]).hline(x0, y + 2, w, strap[1]);
  stamp(p, X - 2, y, ['GYy', 'YVz', 'yzZ'], { G: L.brass[4], Y: L.brass[3], y: L.brass[2], z: L.brass[1], Z: L.brass[0], V: strap[0] });
}

/** Everything inside an ellipse, as a list of pixels. */
function inEllipse(cx: number, cy: number, rx: number, ry: number): [number, number][] {
  const out: [number, number][] = [];
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = (x + 0.5 - cx) / rx;
      const dy = (y + 0.5 - cy) / ry;
      if (dx * dx + dy * dy <= 1) out.push([x, y]);
    }
  }
  return out;
}

/** A flame: a teardrop with a bright heart, its tip leaning away from the draught. */
function flame(p: Px, cx: number, base: number, h: number, ramp: Ramp, lean: number): void {
  for (let i = 0; i < h; i++) {
    const t = i / (h - 1);
    const hw = Math.max(0.5, h * 0.3 * Math.sin(Math.PI * (0.22 + t * 0.78)) ** 0.8 * (1 - t * 0.35));
    const mid = cx + lean * t * t * 2.2;
    for (let x = Math.floor(mid - hw); x < Math.ceil(mid + hw); x++) {
      const d = Math.abs(x + 0.5 - mid) / hw;
      if (d > 1) continue;
      p.set(x, base - i, d < 0.5 && t < 0.5 ? ramp[4] : d < 0.8 && t < 0.78 ? ramp[3] : ramp[2]);
    }
  }
}

// ---------------------------------------------------------------------------------------------
// Ranger: slim, hooded and cloaked, a leather jerkin, a longbow held toward the foe, a quiver.

export function ranger(L: Look): Px {
  const C = cast(L);
  const { X, B, hip, shoulderY, beltY, hipY, chinY } = frame(L, FAX - 4, 0.97);
  const c = L.chest - 1.5;
  const w = L.waist - 1;
  const lw = Math.max(3, L.legW - 1);
  const R = L.headR;
  const ar = L.armR - 0.5;

  // behind everything: the cloak, and a quiver over the shoulder nearer the foe
  const back = layer();
  cape(back, { ...L, cloak: C.leaf, chest: Math.round(c) }, X, shoulderY + 1, FAY - Math.round(hip * 0.3));
  const qx = X + Math.round(c);
  const qy = shoulderY - 6;
  lit(back, L.leather, [1, 2], [1, 2], (l) => l.rect(qx, qy, 4, 11, L.ink));
  for (let k = 0; k < 3; k++) {
    const ax = qx + k + (k === 2 ? 1 : 0);
    const ay = qy - 3 - (k === 1 ? 1 : 0);
    back.set(ax, ay, L.feather[4]).set(ax, ay + 1, L.feather[3]).set(ax, ay + 2, L.feather[2]);
  }

  const body = layer();
  // the bow arm reaches toward the foe; painted first so the chest overlaps its shoulder
  const gx = X + Math.round(c) + 8;
  const gy = beltY - Math.round((B - hip) * 0.2);
  const ex = X + c + 4;
  const ey = shoulderY + 3 + (gy - shoulderY - 3) * 0.6;
  limb(body, X + c, shoulderY + 3, ex, ey, ar, ar - 0.2, C.leaf);
  limb(body, ex, ey, gx, gy, ar - 0.2, ar - 0.5, L.leather);
  // legs: dark hose and tall boots
  bootLeg(body, L, X + 1, FAY - 3, hip - 2, lw, true, L.mail, 0.52);
  bootLeg(body, L, X - lw - 1, FAY - 1, hip, lw, false, L.mail, 0.52);
  // the jerkin's skirt
  const hemY = hipY + Math.round(hip * 0.18);
  lit(body, L.leather, [0, 2], [1, 3], (l) => {
    for (let y = beltY + 3; y <= hemY; y++) {
      const half = w + ((y - beltY - 3) / Math.max(1, hemY - beltY - 3)) * 1.6;
      for (let x = Math.round(X - half); x < Math.round(X + half); x++) {
        if (L.ragged && y > hemY - 1 - Math.floor(hash(x, 23) * 3)) continue;
        l.set(x, y, L.ink);
      }
    }
  });
  // the other arm hangs, a gloved fist at the end of it
  limb(body, X - c, shoulderY + 3, X - c - 1.5, beltY, ar, ar - 0.3, C.leaf);
  gauntlet(body, L, X - c - 1.5, beltY + 3);
  // the jerkin
  lit(body, L.leather, L.hi, [L.lo[0], L.lo[1] + 1], (l) => {
    for (let y = shoulderY; y < beltY; y++) {
      const half = c + (w - c) * ((y - shoulderY) / Math.max(1, beltY - shoulderY - 1));
      l.rect(Math.round(X - half), y, Math.round(half * 2), 1, L.ink);
    }
  });
  for (let y = shoulderY + 3; y < beltY - 1; y += 2) body.set(X, y, L.leather[0]).set(X + 1, y, L.leather[4]);
  // the quiver's strap, shoulder to hip
  for (let y = shoulderY; y < beltY; y++) {
    const t = (y - shoulderY) / Math.max(1, beltY - shoulderY - 1);
    const x = Math.round(X + c - 2 + (-w + 1 - (c - 2)) * t);
    body.set(x, y, L.leather[0]).set(x + 1, y, L.leather[1]);
  }
  belt(body, L, X, beltY, w, [L.leather[0], L.leather[0], L.leather[1], L.leather[2], L.leather[3]]);
  // the hood's mantle over the shoulders, coming to a point on the chest
  const mBot = shoulderY + Math.round((beltY - shoulderY) * 0.6);
  lit(body, C.leaf, L.hi, L.lo, (l) => {
    for (let y = shoulderY - 2; y <= mBot; y++) {
      const t = Math.max(0, (y - shoulderY) / (mBot - shoulderY));
      const half = (c + 2.5) * (1 - t ** 1.7);
      if (half < 0.6) continue;
      for (let x = Math.round(X - half); x < Math.round(X + half); x++) {
        if (L.ragged && t > 0.3 && Math.abs(x + 0.5 - X) > half - 1.5 && hash(x, y, 29) < 0.3) continue;
        l.set(x, y, L.ink);
      }
    }
  });
  // the hood: a little larger than the head, with a point that falls back
  const cx = X - 0.5;
  const cy = chinY - R + 1;
  const hr = R + 0.9;
  lit(body, C.leaf, L.hi, L.lo, (l) =>
    l.poly(
      [
        [cx + hr * 0.35, cy - hr * 0.85],
        [cx - hr * 0.5, cy - hr - 2.5],
        [cx - hr * 0.95, cy - hr * 0.3],
      ],
      L.ink,
    ),
  );
  ball(body, cx, cy, hr, hr, C.leaf, L.shade);
  // its opening: darkness, a lit edge, two eyes, and (when the look shows faces at all) a chin
  const ox = cx + hr * 0.26;
  const oy = cy + hr * 0.16;
  const orx = hr * 0.6;
  const ory = hr * 0.72;
  const open = inEllipse(ox, oy, orx, ory);
  for (const [x, y] of open) body.set(x, y, L.eye);
  for (const [x, y] of open) if (!open.some(([a, b]) => a === x - 1 && b === y)) body.set(x - 1, y, C.leaf[4]);
  if (L.face !== 'shadow') {
    for (const [x, y] of open) {
      if (y < oy + ory * 0.25) continue;
      body.set(x, y, y > oy + ory * 0.7 ? L.skin[0] : x < ox ? L.skin[2] : L.skin[1]);
    }
    body.set(Math.round(ox), Math.round(oy + ory * 0.55), L.skin[0]);
  }
  const eyeY = Math.round(oy - ory * 0.12);
  body.set(Math.round(ox - orx * 0.5), eyeY, L.glint).set(Math.round(ox + orx * 0.4), eyeY, L.glint);

  // the bow: two limbs that curve back from the grip, and the string between their tips
  const bow = layer();
  const string = layer();
  const Hb = Math.round(B * 0.4);
  const k = Math.max(5, Math.round(B * 0.11));
  for (let i = -Hb; i <= Hb; i++) {
    const t = Math.abs(i) / Hb;
    const x = Math.round(gx - k * t * t + (t > 0.86 ? (t - 0.86) * 14 : 0));
    bow.set(x, gy + i, L.wood[t < 0.2 ? 2 : 4]);
    if (t < 0.8) bow.set(x + 1, gy + i, L.wood[t < 0.2 ? 1 : 2]);
  }
  for (let i = -Hb + 1; i < Hb; i++) string.set(gx - k + 1, gy + i, L.bladeRamp ? L.brass[3] : L.bone[3]);
  const hand = layer();
  gauntlet(hand, L, gx, gy);

  return compose(string, [back, body, bow, hand], null, L);
}

// ---------------------------------------------------------------------------------------------
// Mage: a long robe with bright trim, a pointed hat, a book under one arm, and a staff with a
// light caged at its top.

export function mage(L: Look): Px {
  const C = cast(L);
  const { X, B, hip, shoulderY, beltY, chinY } = frame(L, FAX - 5, 0.96);
  const c = L.chest - 1.5;
  const w = L.waist - 0.5;
  const R = L.headR;
  const ar = L.armR;
  const hem = FAY - 1;
  const fx = Math.round(X - 0.5) + 1; // the middle of the face, turned a little toward the foe

  // the staff: taller than its owner
  const staff = layer();
  const over = layer();
  const sx = X + Math.round(c) + 9;
  const orbY = chinY - Math.round(R * 2) - 6;
  for (let y = orbY + 5; y <= FAY - 2; y++) staff.set(sx, y, L.wood[y % 7 === 0 ? 2 : 3]).set(sx + 1, y, L.wood[1]);
  const cage: ReadonlyArray<readonly [number, number, number]> = [
    [-3, -2, 3], [-3, -1, 3], [-3, 0, 3], [-3, 1, 3], [-2, 2, 3], [-2, 3, 2], [-1, 4, 2],
    [0, 4, 2], [1, 4, 2], [2, 4, 1], [3, 3, 1], [3, 2, 1], [4, 1, 1], [4, 0, 1], [4, -1, 1], [4, -2, 1],
  ];
  for (const [dx, dy, tone] of cage) staff.set(sx + dx, orbY + dy, L.brass[tone]);
  ball(over, sx + 1, orbY, 2.6, 2.6, C.spark);

  const body = layer();
  // the staff arm: a sleeve that widens to its mouth
  const hy = beltY - Math.round((B - hip) * 0.22);
  const ex = X + c + 3.5;
  const ey = shoulderY + 4 + (hy - shoulderY - 4) * 0.75;
  limb(body, X + c, shoulderY + 3, ex, ey, ar, ar + 0.3, C.robe);
  limb(body, ex, ey, sx - 2, hy + 1, ar + 0.3, ar + 1.3, C.robe);
  // shoes under the hem
  body.rect(X - 5, hem - 1, 4, 2, L.leather[1]).rect(X + 2, hem - 1, 4, 2, L.leather[1]);
  // the robe: narrow at the sash, then down to the floor
  const flare = c + 3.5;
  const half = (y: number): number =>
    y <= beltY ? c + (w - c) * ((y - shoulderY) / Math.max(1, beltY - shoulderY)) : w + (flare - w) * ((y - beltY) / (hem - beltY)) ** 0.8;
  lit(body, C.robe, L.hi, [L.lo[0], L.lo[1] + 1], (l) => {
    for (let y = shoulderY; y <= hem; y++) {
      const h = half(y);
      for (let x = Math.round(X - h); x < Math.round(X + h); x++) {
        if (L.ragged && y > hem - 1 - Math.floor(hash(x, 17) * 5)) continue;
        l.set(x, y, L.ink);
      }
    }
  });
  for (let y = beltY + 4; y <= hem; y++) {
    for (const f of [-0.6, 0.45]) {
      const x = Math.round(X + f * half(y));
      if (body.has(x, y) && hash(x, y, 31) > 0.2) body.set(x, y, C.robe[1]);
    }
  }
  // trim: down the front, and a band above the hem
  for (let y = shoulderY + 1; y <= hem - 1; y++) if (body.has(X, y)) body.set(X, y, L.brass[2]).set(X + 1, y, L.brass[1]);
  for (let x = 0; x < FW; x++) if (body.has(x, hem - 3) && body.has(x, hem - 2)) body.set(x, hem - 3, L.brass[x < X ? 3 : 2]);
  // the sash
  body.rect(Math.round(X - w), beltY, Math.round(w * 2), 2, L.brass[2]);
  body.hline(Math.round(X - w), beltY + 1, Math.round(w * 2), L.brass[1]);
  // the other arm is bent across the body and holds a book against the chest
  limb(body, X - c, shoulderY + 3, X - c - 1.5, beltY - 4, ar, ar + 0.2, C.robe);
  limb(body, X - c - 1.5, beltY - 4, X - 3, beltY - 5, ar + 0.2, ar + 0.6, C.robe);
  const bx = Math.round(X - c) - 2;
  const by = beltY - 12;
  lit(body, C.stole, [1, 2], [1, 2], (l) => l.rect(bx, by, 7, 9, L.ink));
  body.vline(bx + 6, by + 1, 7, L.bone[3]);
  body.set(bx + 2, by + 3, L.brass[3]).set(bx + 3, by + 3, L.brass[2]).set(bx + 2, by + 4, L.brass[2]).set(bx + 3, by + 4, L.brass[1]);
  body.rect(bx + 2, by + 7, 3, 2, L.skin[2]);
  body.hline(bx + 2, by + 7, 3, L.skin[3]);
  // a short mantle over the shoulders
  lit(body, dim(C.robe), L.hi, L.lo, (l) => {
    for (let y = shoulderY - 2; y <= shoulderY + 4; y++) {
      const t = Math.max(0, (y - shoulderY) / 4);
      const h = (c + 2) * Math.sqrt(1 - t * t * 0.7);
      l.rect(Math.round(X - h), y, Math.round(h * 2), 1, L.ink);
    }
  });
  body.set(X, shoulderY + 1, L.brass[4]).set(X + 1, shoulderY + 1, L.brass[2]).set(X, shoulderY + 2, L.brass[2]).set(X + 1, shoulderY + 2, L.brass[1]);

  // the head: mostly hat. Under the brim, darkness and two eyes.
  const cx = X - 0.5;
  const cy = chinY - R + 1;
  ball(body, cx, cy, R, R, [L.skin[0], L.skin[0], L.skin[1], L.skin[2], L.skin[3]], L.shade + 0.1);
  const brimY = Math.round(cy - R * 0.45);
  for (const [x, y] of inEllipse(cx, cy, R, R)) if (y >= brimY && y <= brimY + 5) body.set(x, y, L.eye);
  body.set(fx - 2, brimY + 4, L.glint).set(fx + 1, brimY + 4, L.glint);
  if (L.ragged) {
    // a long grey beard
    const top = brimY + 6;
    const tip = chinY + Math.round(R * 1.7);
    lit(body, dim(L.steel), [1, 2], [1, 2], (l) => {
      for (let y = top; y <= tip; y++) {
        const t = (y - top) / (tip - top);
        const h = R * 0.85 * (1 - t ** 1.6);
        for (let x = Math.round(fx - h); x < Math.round(fx + h); x++) {
          if (hash(x, y, 37) < t * 0.35) continue;
          l.set(x, y, L.ink);
        }
      }
    });
  }
  // the hat: a wide brim, and a cone whose tip droops back
  const tipY = brimY - Math.round(R * 2.6);
  lit(body, C.robe, L.hi, L.lo, (l) => {
    for (let y = tipY; y <= brimY; y++) {
      const t = (brimY - y) / (brimY - tipY);
      const h = Math.max(0.6, R * 0.98 * (1 - t) ** 0.8);
      const bend = -R * 1.1 * t ** 3;
      l.rect(Math.round(cx - h + bend), y, Math.max(1, Math.round(h * 2)), 1, L.ink);
    }
    l.ellipse(cx, brimY + 1.5, R + 5, 1.7, L.ink);
  });
  for (let x = 0; x < FW; x++) {
    const col = body.get(x, brimY - 1);
    const i = col === null ? -1 : C.robe.indexOf(col);
    if (i >= 0 && Math.abs(x + 0.5 - cx) < R) body.set(x, brimY - 1, L.brass[Math.min(4, i + 1)]);
  }

  const hand = layer();
  hand.rect(sx - 1, hy - 2, 4, 4, L.skin[2]);
  hand.hline(sx - 1, hy - 2, 3, L.skin[3]).vline(sx + 2, hy - 1, 3, L.skin[1]).hline(sx - 1, hy + 1, 3, L.skin[1]);

  const out = compose(null, [staff, body, hand], over, L);
  LIGHTS.set(out, [{ x: sx + 1, y: orbY, r: 26, color: C.spark[3] }]);
  return out;
}

// ---------------------------------------------------------------------------------------------
// Cultist: a hooded robe, two burning eyes, a flame held up in one pale hand, a knife in the other.

export function cultist(L: Look): Px {
  const C = cast(L);
  const { X, shoulderY, beltY, chinY } = frame(L, FAX + 4, 0.9);
  const c = L.chest - 1;
  const w = L.waist;
  const R = L.headR;
  const ar = L.armR;
  const hem = FAY - 1;
  const body = layer();
  const over = layer();

  // the far arm hangs; the hand holds a crooked knife, point down
  const kx = Math.round(X + c + 2);
  const ky = beltY + 2;
  limb(body, X + c, shoulderY + 3, X + c + 2.5, beltY - 5, ar, ar + 0.3, dim(C.gloom));
  limb(body, X + c + 2.5, beltY - 5, kx, ky - 2, ar + 0.3, ar + 1, dim(C.gloom));
  for (let i = 0; i < 8; i++) {
    const x = kx + (i > 4 ? -1 : 0);
    body.set(x, ky + 3 + i, L.steel[4]);
    if (i < 6) body.set(x + 1, ky + 3 + i, L.steel[2]);
  }
  body.rect(kx - 1, ky, 4, 3, L.bone[3]);
  body.hline(kx - 1, ky + 2, 4, L.bone[1]);

  // the robe
  const flare = c + 4;
  const half = (y: number): number =>
    y <= beltY ? c + (w - c) * ((y - shoulderY) / Math.max(1, beltY - shoulderY)) : w + (flare - w) * ((y - beltY) / (hem - beltY)) ** 0.8;
  lit(body, C.gloom, L.hi, [L.lo[0], L.lo[1] + 1], (l) => {
    for (let y = shoulderY; y <= hem; y++) {
      const h = half(y);
      for (let x = Math.round(X - h); x < Math.round(X + h); x++) {
        if (L.ragged && y > hem - 1 - Math.floor(hash(x, 41) * 6)) continue;
        l.set(x, y, L.ink);
      }
    }
  });
  for (let y = beltY + 4; y <= hem; y++) {
    for (const f of [-0.5, 0.55]) {
      const x = Math.round(X + f * half(y));
      if (body.has(x, y) && hash(x, y, 43) > 0.2) body.set(x, y, C.gloom[1]);
    }
  }
  // a strip of cloth down the front, with a sign on it
  for (let y = shoulderY + 2; y <= hem - 4; y++) {
    for (let x = X - 3; x <= X; x++) if (body.has(x, y)) body.set(x, y, C.stole[x === X - 3 ? 3 : x === X ? 1 : 2]);
  }
  const sy = shoulderY + 6;
  for (const [dx, dy] of [[-2, 0], [-1, 0], [-2, 1], [-1, 1], [-2, 3], [-1, 3]] as const) body.set(X + dx, sy + dy, C.flame[3]);
  // a rope round the waist, one end hanging
  body.hline(Math.round(X - w), beltY, Math.round(w * 2), L.bone[2]).hline(Math.round(X - w), beltY + 1, Math.round(w * 2), L.bone[1]);
  body.vline(X + 2, beltY + 2, 5, L.bone[2]);

  // the hood: a deep cowl with a point, leaning toward the hero
  const cx = X - 1.5;
  const cy = chinY - R + 2;
  const hr = R + 1.2;
  lit(body, C.gloom, L.hi, L.lo, (l) => {
    l.poly(
      [
        [cx + hr * 0.5, cy - hr * 0.7],
        [cx - hr * 0.25, cy - hr - 3],
        [cx - hr * 0.8, cy - hr * 0.55],
      ],
      L.ink,
    );
    // the cowl spreads onto the shoulders
    for (let y = Math.round(cy + hr * 0.5); y <= shoulderY + 4; y++) {
      const t = (y - (cy + hr * 0.5)) / Math.max(1, shoulderY + 4 - (cy + hr * 0.5));
      const h = hr * 0.8 + (c + 1.5 - hr * 0.8) * t;
      l.rect(Math.round(X - 1 - h), y, Math.round(h * 2), 1, L.ink);
    }
  });
  ball(body, cx, cy, hr, hr, C.gloom, L.shade);
  const ox = cx - hr * 0.22;
  const oy = cy + hr * 0.18;
  const open = inEllipse(ox, oy, hr * 0.62, hr * 0.7);
  for (const [x, y] of open) body.set(x, y, L.ink);
  for (const [x, y] of open) if (!open.some(([a, b]) => a === x - 1 && b === y)) body.set(x - 1, y, C.gloom[4]);
  const eyeY = Math.round(oy - 0.5);
  const eye = L.socket ?? C.flame[3];
  over.set(Math.round(ox - hr * 0.3), eyeY, eye).set(Math.round(ox + hr * 0.2), eyeY, eye);

  // the near arm is raised, palm up, and a flame stands over the palm
  const arm = layer();
  const hx = X - c - 8;
  const hy = shoulderY + 1;
  const ex = X - c - 4;
  const ey = shoulderY + 7;
  limb(arm, X - c + 1, shoulderY + 4, ex, ey, ar + 0.2, ar + 0.4, C.gloom);
  limb(arm, ex, ey, hx + 1.5, hy + 2.5, ar + 0.4, ar + 1.1, C.gloom);
  // the sleeve hangs open below the forearm
  lit(arm, C.gloom, L.hi, L.lo, (l) =>
    l.poly(
      [
        [ex + 1, ey + 1],
        [hx + 1, hy + 3],
        [hx + 3, hy + 12],
      ],
      L.ink,
    ),
  );
  arm.rect(hx - 1, hy, 4, 3, L.bone[3]);
  arm.hline(hx - 1, hy, 4, L.bone[4]).hline(hx - 1, hy + 2, 4, L.bone[1]);
  flame(over, hx + 0.5, hy - 2, 10, C.flame, -1);

  const out = compose(null, [body, arm], over, L);
  LIGHTS.set(out, [{ x: hx + 0.5, y: hy - 6, r: 24, color: C.flame[3] }]);
  return out;
}

// ---------------------------------------------------------------------------------------------
// Bat: a furry body with big ears, red eyes, and wings of skin stretched over finger bones.
// It flies: nothing touches the ground.

export function bat(L: Look): Px {
  const C = cast(L);
  const X = FAX;
  const s = L.bodyH / 48;
  const by = FAY - Math.round(L.bodyH * 0.5);
  const wings = layer();
  const pts = (side: number): [number, number][] => [
    [X + side * 3, by - 2 * s],
    [X + side * 10 * s, by - 10 * s],
    [X + side * 21 * s, by - 6 * s],
    [X + side * 17 * s, by + 1 * s],
    [X + side * 13 * s, by - 2 * s],
    [X + side * 10 * s, by + 4 * s],
    [X + side * 6.5 * s, by + 0.5 * s],
    [X + side * 3, by + 4 * s],
  ];
  for (const side of [-1, 1]) {
    const q = pts(side);
    lit(wings, side < 0 ? C.wing : dim(C.wing), L.hi, L.lo, (l) => l.poly(q, L.ink));
    // arm and finger bones
    const bone = C.fur[side < 0 ? 4 : 3];
    const [sh, wr, tip, , f1, , f2] = q;
    wings.line(Math.round(sh[0]), Math.round(sh[1]), Math.round(wr[0]), Math.round(wr[1]), bone);
    wings.line(Math.round(wr[0]), Math.round(wr[1]), Math.round(tip[0] - side), Math.round(tip[1]), bone);
    wings.line(Math.round(wr[0]), Math.round(wr[1]), Math.round(f1[0]), Math.round(f1[1]), bone);
    wings.line(Math.round(wr[0]), Math.round(wr[1]), Math.round(f2[0]), Math.round(f2[1]), bone);
  }

  const body = layer();
  const over = layer();
  // ears
  for (const side of [-1, 1]) {
    lit(body, C.fur, L.hi, L.lo, (l) =>
      l.poly(
        [
          [X + side * 4.2 * s, by - 6 * s],
          [X + side * 3.4 * s, by - 12 * s],
          [X + side * 0.6 * s, by - 7.5 * s],
        ],
        L.ink,
      ),
    );
  }
  ball(body, X, by, 4.6 * s, 5.4 * s, C.fur, L.shade);
  ball(body, X, by - 5 * s, 4 * s, 3.4 * s, C.fur, L.shade);
  // feet
  body.set(X - 2, Math.round(by + 5.4 * s) + 1, C.fur[2]).set(X + 1, Math.round(by + 5.4 * s) + 1, C.fur[2]);
  // eyes and fangs
  const eyeY = Math.round(by - 5.4 * s);
  const eye = L.socket ?? '#ff4040';
  over.set(X - 2, eyeY, eye).set(X + 1, eyeY, eye);
  body.set(X - 1, eyeY + 2, L.ink).set(X, eyeY + 2, L.ink);
  body.set(X - 2, eyeY + 3, L.bone[4]).set(X + 1, eyeY + 3, L.bone[4]);

  return compose(null, [wings, body], over, L);
}

// ---------------------------------------------------------------------------------------------
// Brute: a hulking ogre. A barrel of a body, a tiny head sunk between boulder shoulders, tusks,
// one arm that hangs to the knee and one that holds a club high.

export function brute(L: Look): Px {
  const C = cast(L);
  const X = FAX + 5;
  const B = Math.round(L.bodyH * 1.1);
  const k = B / 58;
  const hip = Math.round(B * 0.34);
  const hipY = FAY - hip;
  const shoulderY = FAY - Math.round(B * 0.88);
  const rx = L.chest * 1.75;
  const R = Math.max(4, L.headR * 0.82);
  const fr = C.flesh;
  const far = dim(fr);

  const body = layer();
  const over = layer();
  // legs: short and thick, planted wide
  for (const side of [1, -1]) {
    const ramp = side > 0 ? far : fr;
    const lx = X + side * rx * 0.5;
    const sole = FAY - (side > 0 ? 3 : 1);
    limb(body, lx, hipY - 3, lx + side * 1.5, sole - 3, L.legW * 0.95, L.legW * 0.8, ramp);
    lit(body, ramp, [1, 2], [1, 2], (l) => l.rect(Math.round(lx + side * 1.5) - 6, sole - 2, 10, 3, L.ink));
  }
  // a hide round the hips
  const clothBot = hipY + Math.round(hip * 0.5);
  lit(body, L.leather, [0, 2], [1, 3], (l) => {
    for (let y = hipY - 7; y <= clothBot; y++) {
      for (let x = Math.round(X - rx * 0.82); x < Math.round(X + rx * 0.82); x++) {
        if (y > clothBot - 1 - Math.floor(hash(x, 47) * 6)) continue;
        l.set(x, y, L.ink);
      }
    }
  });
  // the far arm hangs, its fist near the knee
  const sxr = X + rx * 0.9;
  const syr = shoulderY + 6;
  limb(body, sxr, syr, sxr + 3.5, syr + B * 0.2, 4.8 * k, 4.2 * k, far);
  limb(body, sxr + 3.5, syr + B * 0.2, sxr + 2, syr + B * 0.4, 4.2 * k, 4.6 * k, far);
  ball(body, sxr + 2, syr + B * 0.44, 4.8 * k, 4.4 * k, far, L.shade);
  // the body
  const midY = (shoulderY + hipY) / 2 + 1;
  const ry = (hipY - shoulderY) / 2 + 3;
  ball(body, X, midY, rx, ry, fr, L.shade);
  ball(body, X + rx * 0.78, shoulderY + 4, 6.4 * k, 5.4 * k, far, L.shade);
  ball(body, X - rx * 0.78, shoulderY + 4, 6.8 * k, 5.6 * k, fr, L.shade);
  // the line under the chest, and a navel
  for (let x = Math.round(X - rx * 0.62); x < Math.round(X + rx * 0.55); x++) {
    const t = (x - X) / (rx * 0.6);
    const y = Math.round(midY - ry * 0.12 + 1.5 * Math.cos(t * Math.PI * 2));
    if (body.has(x, y) && Math.abs(t) > 0.08) body.set(x, y, fr[1]);
  }
  body.set(X - 1, Math.round(midY + ry * 0.45), fr[0]).set(X - 1, Math.round(midY + ry * 0.45) + 1, fr[1]);
  // a strap across the chest
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    const x = Math.round(X + rx * 0.6 - t * rx * 1.25);
    const y = Math.round(shoulderY + 5 + t * (hipY - 8 - shoulderY - 5));
    if (body.has(x, y)) body.set(x, y, L.leather[1]).set(x, y + 1, L.leather[0]);
  }
  // the head: small, low, jutting toward the hero
  const cx = X - 2.5;
  const cy = shoulderY + 2;
  // ears
  body.rect(Math.round(cx + R) - 1, Math.round(cy) - 1, 2, 3, far[2]);
  ball(body, cx, cy, R, R * 0.92, fr, L.shade);
  lit(body, fr, [1, 2], [1, 2], (l) => l.rect(Math.round(cx - R * 0.95), Math.round(cy + R * 0.3), Math.round(R * 1.7), Math.max(3, Math.round(R * 0.8)), L.ink));
  const browY = Math.round(cy - R * 0.25);
  body.hline(Math.round(cx - R * 0.85), browY, Math.round(R * 1.6), fr[0]);
  const eye = L.socket ?? '#ffd040';
  over.set(Math.round(cx - R * 0.55), browY + 1, eye).set(Math.round(cx + R * 0.2), browY + 1, eye);
  // mouth and tusks
  const mouthY = Math.round(cy + R * 0.62);
  body.hline(Math.round(cx - R * 0.6), mouthY, Math.round(R * 1.1), fr[0]);
  for (const tx of [Math.round(cx - R * 0.7), Math.round(cx + R * 0.35)]) body.set(tx, mouthY - 1, L.bone[3]).set(tx, mouthY - 2, L.bone[4]);

  // the club, and the near arm that holds it high
  const sxl = X - rx * 0.9;
  const syl = shoulderY + 5;
  const exl = sxl - 6 * k;
  const eyl = syl - 1;
  const hxl = exl - 0.5;
  const hyl = eyl - 10 * k;
  const club = layer();
  const tipX = hxl - 5 * k;
  const tipY = hyl - 24 * k;
  limb(club, hxl + 1.2, hyl + 4, tipX, tipY, 2.2 * k, 5.4 * k, L.wood);
  for (let i = 0; i < 9; i++) {
    const t = 0.45 + (i / 9) * 0.5;
    const x = Math.round(hxl + 1.2 + (tipX - hxl - 1.2) * t + (hash(i, 3, 5) - 0.5) * 7 * k);
    const y = Math.round(hyl + 4 + (tipY - hyl - 4) * t);
    if (club.has(x, y)) club.set(x, y, L.steel[4]).set(x + 1, y + 1, L.steel[1]);
  }
  const arm = layer();
  limb(arm, sxl, syl, exl, eyl, 5 * k, 4.4 * k, fr);
  limb(arm, exl, eyl, hxl, hyl, 4.4 * k, 4.6 * k, fr);
  ball(arm, hxl, hyl, 4.6 * k, 4.4 * k, fr, L.shade);
  ball(arm, exl, eyl, 4.8 * k, 4.6 * k, fr, L.shade);

  return compose(null, [body, club, arm], over, L);
}

/** The canvas every figure here is painted on. */
export const CANVAS = { w: FW, h: FH };

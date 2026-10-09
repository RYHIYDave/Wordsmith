// The warrior: the owner's pick from ten designs (number 10, the Scarf Knight). A pointed helm
// with a nasal bar over a mail coif, a long scarf blowing in the wind, a tabard with a chevron, a
// kite shield with the same chevron, and a blade that glows. His colours are RED, the colour of
// strength (the owner, 5 Oct 2026: "I like the green ranger and blue mage since Dex and int match
// so I'd like the knight to kinda follow that theme"): a red tabard and a dark red scarf. (He was
// teal and pink until Version 14.4.)
//
// Painted with the kit at twice the grain of the first builds' art. Every frame faces
// screen-right: `front` toward the camera (down-right), `back` away from it (up-right).
//
// SEEN FROM A CORNER (Version 14.5; the kit's "Turned to the grid"). The owner, 5 Oct 2026: "I'd
// like the character models to move and turn in those four cardinal directions as well." Until
// then the knight was painted square-on (a level belt, level shoulders, a face in the middle of
// the helm, feet side by side, a shield held flat to the screen) and only his sword pointed along
// the grid. Now he stands the way he faces, and everything about him says which way that is:
//   - facing down-right (`front`): his chest is turned that way, so belt, hem and the line of
//     his shoulders run UP to the right, and what is on his middle line (the buckle, the chevron,
//     the bar of the helm) sits toward the right. His SHIELD is on the further arm, held out in
//     front of him: it faces the way he does, and is seen as the right-hand side of a box is seen,
//     its top edge running up to the right. His SWORD is in the hand nearer us, on the left of the
//     picture. The further shoulder is up beside his jaw, the nearer one lower. The feet point
//     down-right and a step goes that way.
//   - facing up-right (`back`): we see his back (its lines run DOWN to the right, the seam of the
//     tabard and the knot of the scarf to the left of the middle) and his sword side, nearest us on
//     the right. The shield is beyond him, held out the way he faces: we see a strip of its inside
//     past his further shoulder.
// So the sword is in the same hand whichever of the two it is (his right), and changes sides of
// the picture as he turns, as it would. (Before, it was on the right of the picture in both, which
// meant it changed hands.) The other two ways are these two mirrored (render.ts), as they always
// were: there, as in every mirrored figure, it is in his left.
//
import { Px } from '../engine/px';
import type { Light } from '../engine/px';
import type { TailDef, TailRoot } from '../engine/tails';
import type { ActorArt } from './actor_types';
import type { Key, Timeline } from './clip';
import {
  BLADE, CYAN, GLINT, HI, INDIGO, INK, KAY, KH, KW, KX, LO, MAIL, PINK, PLUM, STEEL, TEAL, TURN,
  along, animSet, arm, ball, compose, dim, dir, fist, footOf, hash, joint, layer, leg, limb, lit, runPoses, shear, slant, stamp,
} from './kit';
import type { LegStyle, Moves, Painted, Pose, Ramp, V } from './kit';
import { KNIGHT2_TAILS } from './reimagined';

// --- how the knight is built, in pixels -------------------------------------------------------
/** Floor to chin, floor to hip, floor to belt. */
const BODY = 45;
const HIP = 23;
const BELT = 31;
/**
 * Half width at the chest and at the waist. (Square-on they were 8 and 6. A body twice as wide as
 * it is deep, seen from a corner, is about four fifths as wide as it is seen from the front.)
 */
const CHEST = 6.5;
const WAIST = 5;
/** How far either shoulder is from the middle of him, and how far the nearer one is below it and the further one above. */
const SHOULDER = 6;
const NEAR_DROP = 2;
const FAR_RISE = 3;
/** Half the width of the shield as it is seen, and its height. (Held square to us it would be 8.5 wide.) */
const SHIELD_W = 6;
const SHIELD_H = HIP + 4;
/** Radius of the head. */
const HEAD = 5.6;
const ARM = 2.6;
/** Bones of the sword arm. */
const UPPER = 7.6;
const FORE = 4.6;

const LEGS: LegStyle = { w: 4, upper: MAIL, lower: STEEL, share: 0.56, cuff: true, knee: STEEL, band: null };

/** The colours of what he wears. */
export interface KnightLook {
  /** The tabard. */
  tabard: Ramp;
  /** The scarf, and the chevron on the shield. */
  scarf: Ramp;
}

/**
 * Red: the colour of strength. (The owner, 5 Oct 2026: "can I see the knight with a red tabard? I
 * like the green ranger and blue mage since Dex and int match so I'd like the knight to kinda
 * follow that theme".) A warm red, so that it is not the pink of the scarf.
 */
export const RED: Ramp = ['#6a1020', '#6a1020', '#d02a30', '#ff7058', '#ff7058'];
/** Scarves to go with it, for him to choose between. */
export const SCARF_GOLD: Ramp = ['#8a5a10', '#8a5a10', '#e8a820', '#ffe070', '#ffe070'];
export const SCARF_PALE: Ramp = ['#5a4a8a', '#5a4a8a', '#c8bef0', '#ffffff', '#ffffff'];
/** ("Red scarf?", 15:31: a scarlet brighter and more orange than the tabard's red, and a wine darker than it) */
export const SCARF_RED: Ramp = ['#8a1418', '#8a1418', '#f4442e', '#ffac80', '#ffac80'];
export const SCARF_WINE: Ramp = ['#3c0818', '#3c0818', '#8e1428', '#c83040', '#c83040'];

/**
 * As he is in the game. The owner's pick (5 Oct 2026, 15:32, from six shown: "Let's go with E"):
 * a red tabard and a dark red scarf. Until then (Versions 10 to 14.4) the tabard was teal and the
 * scarf pink: `KNIGHT_WAS`.
 */
export const KNIGHT_LOOK: KnightLook = { tabard: RED, scarf: SCARF_WINE };
export const KNIGHT_WAS: KnightLook = { tabard: TEAL, scarf: PINK };

/** What is in the hands. */
export interface WarriorKit {
  /** A sword for one hand and a shield, or one great sword for both. */
  twoHanded: boolean;
  /** His colours, where they are not the game's own (the art tools, showing a choice). */
  look?: KnightLook;
  /** His attacks as they were up to Version 15.0 (the art tools, showing before and after). */
  was?: boolean;
}

// ---------------------------------------------------------------------------------------------
// Parts

/**
 * Hanging cloth: it widens from h0 to h1 and its hem is cut into points. `drift` carries the hem
 * sideways. The wind sends a wave down it (`wind` is where the wave has got to, 0..1 round its
 * loop; `blow` is how big it is at the hem, in pixels): the cloth snakes from side to side below
 * the belt and the points of the hem rise and fall one after another.
 */
function tabardSkirt(p: Px, cloth: Ramp, X: number, top: number, bottom: number, h0: number, h1: number, drift: number, wind: number, blow: number): void {
  const snake = (t: number): number => Math.sin((wind - t * 0.6) * Math.PI * 2) * blow * t;
  const lift = (x: number): number => Math.round(Math.sin((wind + (x - X) / 16) * Math.PI * 2) * blow * 0.7);
  lit(p, cloth, [0, 2], [1, 3], (l) => {
    for (let y = top; y <= bottom + 1; y++) {
      const t = Math.min(1, (y - top) / Math.max(1, bottom - top));
      const half = h0 + (h1 - h0) * t;
      const mid = X + drift * t + snake(t);
      for (let x = Math.round(mid - half); x < Math.round(mid + half); x++) {
        const k = (((x - Math.round(mid)) % 6) + 6) % 6;
        if (y > bottom - Math.abs(k - 3) + lift(x)) continue;
        l.set(x, y, INK);
      }
    }
  });
  // folds: darker lines that follow the cloth down
  for (let y = top + 1; y <= bottom + 1; y++) {
    const t = Math.min(1, (y - top) / Math.max(1, bottom - top));
    for (const f of [-0.55, 0.5]) {
      const x = Math.round(X + drift * t + snake(t) + f * (h0 + (h1 - h0) * t));
      const c = p.get(x, y);
      if (c !== null && cloth.indexOf(c) >= 2 && hash(x, y, 3) > 0.2) p.set(x, y, cloth[0]);
    }
  }
}

function torso(p: Px, cloth: Ramp, X: number, top: number, bottom: number): void {
  lit(p, cloth, HI, [LO[0], LO[1] + 1], (l) => {
    for (let y = top; y < bottom; y++) {
      const t = (y - top) / Math.max(1, bottom - top - 1);
      const half = CHEST + (WAIST - CHEST) * t - (y < top + 2 ? 1 : 0);
      l.rect(Math.round(X - half), y, Math.round(half * 2), 1, INK);
    }
  });
}

/** The belt. `buckle`: the column of the chest's middle line, where the buckle is, or null for the back. */
function belt(p: Px, X: number, y: number, buckle: number | null): void {
  const x0 = Math.round(X - WAIST);
  const w = Math.round(WAIST * 2);
  p.rect(x0, y, w, 3, PLUM[2]);
  p.hline(x0, y, w, PLUM[3]).hline(x0, y + 2, w, PLUM[1]);
  if (buckle !== null) stamp(p, buckle - 1, y, ['GYy', 'YVz', 'yzZ'], { G: CYAN[4], Y: CYAN[3], y: CYAN[2], z: CYAN[1], Z: CYAN[0], V: PLUM[0] });
}

/**
 * A sword. (hx, hy) is the hand nearest the blade; the grip runs back from it. `deg` is the way
 * the blade points (0 = screen-right, 90 = up).
 */
export function blade(p: Px, hx: number, hy: number, deg: number, len: number, bw: number, grip: number, guard: number): void {
  const [dx, dy] = dir(deg);
  const litSide = 0.65 * dy - 0.75 * dx > 0 ? 1 : -1;
  const tip = 4 + len;
  const reach = len + grip + 10;
  for (let y = Math.floor(hy - reach); y <= Math.ceil(hy + reach); y++) {
    for (let x = Math.floor(hx - reach); x <= Math.ceil(hx + reach); x++) {
      const rx = x + 0.5 - hx;
      const ry = y + 0.5 - hy;
      const u = rx * dx + ry * dy;
      const v = (-rx * dy + ry * dx) * litSide;
      let c: string | null = null;
      if (u >= 4 && u <= tip) {
        const half = u > tip - 4 ? (tip - u) * (bw / 4) : bw;
        if (Math.abs(v) <= half) c = v > bw * 0.35 ? BLADE[4] : v < -bw * 0.35 ? BLADE[2] : BLADE[3];
        if (c && Math.abs(v) < 0.5 && u < tip - 6) c = BLADE[2];
      } else if (u >= 2.2 && u < 4 && Math.abs(v) <= bw + guard) {
        c = v > 1.5 ? STEEL[4] : v < -2.5 ? STEEL[0] : STEEL[2];
      } else if (u >= 2 - grip && u < 2.2 && Math.abs(v) <= 1.3) {
        c = Math.floor(u + 40) % 2 === 0 ? PLUM[2] : PLUM[3];
      } else if (u >= -grip - 0.6 && u < 2 - grip && Math.abs(v) <= 2) {
        c = v > 0.4 ? STEEL[4] : v < -0.9 ? STEEL[0] : STEEL[2];
      }
      if (c) p.set(x, y, c);
    }
  }
}

/** The lights along a blade: a soft halo from the guard to the tip. */
export function bladeLights(hx: number, hy: number, deg: number, len: number): Light[] {
  const [dx, dy] = dir(deg);
  const out: Light[] = [];
  for (const k of [0.3, 0.62, 0.92]) out.push({ x: hx + dx * (4 + len * k), y: hy + dy * (4 + len * k), r: 9 + len * 0.12, color: BLADE[3], a: 0.3 });
  return out;
}

/**
 * The streak a blade leaves in the air when it cuts (Pose.sweep): a crescent of its own light from
 * where it was to where it is, lying along the path of its point. It is widest just behind the
 * blade, and thins and breaks up toward the end that is oldest. (The owner, 6 Oct 2026: "I want
 * things to have weight"; "The warrior swings his sword with practiced lethal intent". A cut that
 * goes from over the shoulder to the floor in a thirtieth of a second is not seen to travel
 * unless it leaves this behind it.)
 */
function streak(p: Px, hx: number, hy: number, deg: number, sweep: number, len: number, lights: Light[], thin = 1): void {
  const tip = len + 4;
  const way = sweep > 0 ? 1 : -1;
  const span = Math.min(200, Math.abs(sweep));
  for (let y = Math.floor(hy - tip - 1); y <= Math.ceil(hy + tip + 1); y++) {
    for (let x = Math.floor(hx - tip - 1); x <= Math.ceil(hx + tip + 1); x++) {
      const rx = x + 0.5 - hx;
      const ry = y + 0.5 - hy;
      const r = Math.hypot(rx, ry);
      if (r > tip + 0.5) continue;
      // how far round from the blade this is, going back the way it came
      const da = (((((Math.atan2(-ry, rx) * 180) / Math.PI - deg) * way) % 360) + 360) % 360;
      if (da > span) continue;
      const u = da / span;
      const thick = 1.5 + tip * 0.58 * thin * Math.pow(1 - u, 0.75);
      const v = (r - (tip - thick)) / thick;
      if (v < 0) continue;
      // (the oldest part of it is breaking up)
      if (u > 0.6 && hash(x, y, 7) < (u - 0.6) * 2.4) continue;
      p.set(x, y, v > 0.72 ? (u < 0.4 ? BLADE[4] : BLADE[3]) : u < 0.22 ? BLADE[3] : u < 0.6 ? BLADE[2] : BLADE[1]);
    }
  }
  const strong = Math.min(1, span / 90);
  for (const k of [0.15, 0.45]) {
    const [dx, dy] = dir(deg + way * span * k);
    lights.push({ x: hx + dx * tip * 0.8, y: hy + dy * tip * 0.8, r: 13, color: BLADE[3], a: 0.34 * strong });
  }
}

/**
 * A blade driven point first into the floor (prop 4: `k` is 1 in the frame it strikes, 0 when it
 * is over): a ring of light runs out along the floor from the point (so it is twice as wide as it
 * is tall), and chips of light fly up.
 */
export function floorStrike(over: Px, x: number, y: number, k: number, lights: Light[]): void {
  const r = 4 + (1 - k) * 14;
  const n = 28;
  for (let i = 0; i < n; i++) {
    // (it breaks up as it goes)
    if (k < 0.6 && i % 2 === 0) continue;
    const a = (i / n) * Math.PI * 2;
    const px = Math.round(x + Math.cos(a) * r);
    const py = Math.round(y + Math.sin(a) * r * 0.5);
    over.set(px, py, k > 0.5 ? '#ffffff' : BLADE[3]);
    if (k > 0.75) over.set(px, py - 1, BLADE[3]);
  }
  if (k > 0.35) for (const [dx, dy] of [[-6, -4], [5, -7], [-2, -9], [8, -3], [1, -5]] as const) over.set(Math.round(x + dx * (1.7 - k)), Math.round(y + dy * (1.7 - k)), '#ffffff');
  lights.push({ x, y, r: 13 + (1 - k) * 8, color: BLADE[3], a: 0.6 * k });
}

/** Half the width of the kite shield at a height between its top (0) and its point (1). */
function kiteHalf(t: number, wide: number): number {
  return t < 0.25 ? wide * Math.sqrt(1 - ((0.25 - t) / 0.25) ** 2 * 0.55) : wide * (1 - ((t - 0.25) / 0.75) ** 1.6);
}

/**
 * The kite shield: a painted field inside a steel rim, with the knight's chevron. (kx, top) is the
 * middle of its top edge. `inside` paints the side the arm is strapped to: no rim light, no chevron.
 */
function kite(p: Px, kx0: number, top0: number, tall: number, wide: number, inside: boolean, device: Ramp): void {
  const kx = Math.round(kx0);
  const top = Math.round(top0);
  const bot = top + tall;
  const shape = (l: Px): void => {
    for (let y = top; y <= bot; y++) {
      const half = kiteHalf((y - top) / tall, wide);
      l.rect(Math.round(kx - half), y, Math.max(1, Math.round(half * 2)), 1, INK);
    }
  };
  const field = inside ? dim(INDIGO) : INDIGO;
  lit(p, field, [0, 5], [0, 5], shape);
  const m = layer();
  shape(m);
  const rimLit = inside ? STEEL[2] : STEEL[4];
  const rimDark = inside ? STEEL[0] : STEEL[1];
  m.each((x, y) => {
    const out = (ox: number, oy: number): boolean => !m.has(x + ox, y + oy);
    if (out(-1, 0) || out(0, -1) || out(-2, 0) || out(0, -2) || out(-1, -1)) p.set(x, y, rimLit);
    else if (out(1, 0) || out(0, 1) || out(2, 0) || out(0, 2) || out(1, 1)) p.set(x, y, rimDark);
    return null;
  });
  if (inside) {
    // the straps the arm goes through
    p.hline(Math.round(kx) - 4, top + 6, 8, PLUM[2]).hline(Math.round(kx) - 4, top + 12, 8, PLUM[2]);
    return;
  }
  for (let k = 0; k < 6; k++) {
    for (const s of [-1, 1]) {
      const x = Math.round(kx) + s * k - (s > 0 ? 0 : 1);
      for (let j = 0; j < 3; j++) if (field.indexOf(p.get(x, top + 8 + k + j) ?? '') >= 0) p.set(x, top + 8 + k + j, j === 0 ? device[3] : device[2]);
    }
  }
}

/**
 * The mail coif and the pointed helm over it. He is seen from a corner: facing down-right the
 * dark slot of the face is on the right of the head (the nearer eye, the nasal bar, and the
 * further eye at the very edge), and the left of the head is the coif over his ear. Facing
 * up-right there is no face to see: the coif hangs in rows, and the end of the slot just shows
 * at the right edge.
 */
function helm(p: Px, cx: number, cy: number, back: boolean): void {
  ball(p, cx, cy, HEAD, HEAD, MAIL);
  const mid = Math.round(cx);
  const base = Math.round(cy);
  if (!back) {
    for (let x = mid - 1; x <= mid + 5; x++) for (let y = base + 1; y <= base + 3; y++) if (p.has(x, y)) p.set(x, y, INK);
    p.set(mid + 1, base + 2, GLINT).set(mid + 4, base + 2, GLINT);
  } else {
    // from behind: the links of the coif hang in rows down to the shoulders
    for (let y = base + 1; y <= base + 4; y += 2) for (let x = Math.round(cx - HEAD) + 1; x < Math.round(cx + HEAD); x += 2) if (p.has(x, y)) p.set(x, y, MAIL[1]);
    for (let y = base + 1; y <= base + 2; y++) for (let x = mid + 4; x <= mid + 5; x++) if (p.has(x, y)) p.set(x, y, INK);
  }
  const top = Math.round(cy - HEAD - 7);
  lit(p, STEEL, HI, LO, (l) => {
    for (let y = top; y <= base; y++) {
      const t = (y - top) / (base - top);
      const half = Math.max(0.6, (HEAD + 0.5) * Math.sin((Math.min(1, t * 1.08) * Math.PI) / 2) ** 0.85);
      l.rect(Math.round(cx - half), y, Math.max(1, Math.round(half * 2)), 1, INK);
    }
  });
  // a glowing band round the brow
  for (let x = 0; x < KW; x++) {
    const c = p.get(x, base);
    const i = c === null ? -1 : STEEL.indexOf(c);
    if (i >= 0) p.set(x, base, CYAN[i]);
  }
  if (!back) p.vline(mid + 3, base + 1, 3, STEEL[3]);
}

/**
 * The two ends of the scarf. They are not painted in the frames: each frame says where they are
 * tied, and they are moved and drawn every frame of the game (engine/tails.ts). The nearer end is
 * the longer and brighter; the further one is in shade.
 */
const SCARF = { gravity: 45, wind: 380, flutter: 460, rate: 2.0, drag: 5 };
/** The two flying ends of a scarf of a colour. */
export function scarfTails(c: Ramp): Record<string, TailDef> {
  return {
    'w-scarf-a': { n: 9, seg: 1.75, w0: 5.2, w1: 2.8, dark: c[1], mid: c[2], light: c[3], ...SCARF },
    'w-scarf-b': { n: 7, seg: 1.7, w0: 4.4, w1: 2.4, dark: c[0], mid: mixTone(c[1], c[2]), light: c[2], ...SCARF, gravity: 125, wind: 330, rate: 2.3, flutter: 400 },
  };
}
// (and what flies from the knight reimagined, the Boar Knight: named by no frame while his switch,
// REIMAGINED.knight in art/reimagined.ts, is off, as it is)
export const WARRIOR_TAILS: Record<string, TailDef> = { ...scarfTails(KNIGHT_LOOK.scarf), ...KNIGHT2_TAILS };

function mixTone(a: string, b: string): string {
  const v = (h: string, i: number): number => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
  const f = (i: number): string => Math.round((v(a, i) + v(b, i)) / 2).toString(16).padStart(2, '0');
  return '#' + f(0) + f(1) + f(2);
}

/**
 * The scarf wound round the neck. It lies on the shoulders, so it leans a little the way they do:
 * up to the right when he faces us, down to the right when he does not.
 */
function scarfWrap(p: Px, scarf: Ramp, X: number, sy: number, back: boolean): void {
  const flat = layer();
  lit(flat, scarf, [0, 1], [0, 1], (l) => {
    l.rect(X - 6, sy - 3, 12, 3, INK);
    l.rect(X - 5, sy, 10, 1, INK);
  });
  // the knot, where the two ends leave: at the back of the neck, which is to the left of his middle
  if (back) flat.rect(X - 6, sy - 3, 3, 4, scarf[0]).set(X - 6, sy - 3, scarf[2]);
  const way = back ? 1 : -1;
  shear(flat, (x) => way * Math.floor((x - X + 2) / 4), p);
}

// ---------------------------------------------------------------------------------------------
// The rig

function knight(q: Pose, back: boolean, kit: WarriorKit): Painted {
  // (the way he faces is down the screen when he faces us and up it when he does not: `fwd`)
  const fwd = back ? -1 : 1;
  // A lunge (Pose.step) carries the whole of him along the grid, the way he faces: two pixels
  // across for each one down the screen, or up it. (BX, F): the floor point under him then.
  const BX = KX + Math.round(q.step * 0.9);
  const F = KAY + Math.round(q.step * 0.45) * fwd;
  const X = BX + Math.round(q.lean);
  // (leaning the way he faces carries him a little down the screen, or up it)
  const Y = Math.round(q.bob + q.lean * 0.4 * fwd);
  const sy = F - (BODY - 2) + Y;
  const beltY = F - BELT + Y;
  const hipY = F - HIP + Y;
  const chinY = F - BODY + Y;
  const cx = X - 0.5;
  const cy = chinY - HEAD + 1;
  const lights: Light[] = [];
  const look = kit.look ?? KNIGHT_LOOK;
  // the stride sways the cloth and rocks the shoulders
  const sway = q.swing;
  // what he does when left standing: 1 = testing the edge of the sword (the free hand goes to the
  // blade; `act` is how far it has got there and `pt` how far along the blade the thumb has run),
  // 2 = the sword planted point down and leant on (`act` is how far the hand has slid onto the pommel)
  const testing = q.prop === 1;
  const planted = q.prop === 2;

  // --- seen from a corner ---
  // The corner of his body that is nearest us: where the side we see of him meets his chest (or
  // his back). Everything that runs across him is lowest there and rises from it both ways.
  const turn = slant(back ? X + 3 : X - 4, 2);
  // His middle line: toward the side he faces when we see his chest, away from it when we see his back.
  const mid = X + TURN * fwd;
  // Which side is nearer the camera? Facing us it is the screen-left side; facing away, the right.
  const near = back ? 1 : -1;

  // --- the sword hand: his right, which is the one nearer us ---
  // one-handed: hanging at his side, the blade pointing down. Two-handed: in front of the belt.
  const two = kit.twoHanded;
  // (two-handed, the hands are beside the buckle, not over it: it is one of the things that says which way he faces)
  const restX = two ? X + (back ? 8 : 7) : X + near * 11;
  // (a planted sword stands on the floor: it does not rise and fall with his breathing)
  const restY = (two ? beltY - 2 : beltY + 4) - (planted ? Y : 0);
  // (a step swings the sword arm along the grid: across, and up or down the screen with it)
  const hx = restX + q.hx + (two ? sway * 0.6 : sway * 1.6);
  const hy = restY + q.hy + (two ? 0 : sway * 0.8 * fwd);
  const aim = q.aim + (two ? sway * 3 : sway * 5);
  const len = two ? 28 : 19;
  const bw = two ? 2.4 : 2;
  const grip = two ? 9 : 4;
  const guard = two ? 3.6 : 2.8;
  const [adx, ady] = dir(aim);

  const weapon = layer();
  const over = layer();
  // (the streak of a cut lies under the blade that left it; in a whirlwind, prop 3, the blade is
  // going round too fast to say which way: it has a streak before it and one behind)
  if (Math.abs(q.sweep) >= 6) streak(weapon, hx, hy, aim, q.sweep, len, lights, q.prop === 3 ? 0.55 : 1);
  if (q.prop === 3 && Math.abs(q.sweep) >= 6) streak(weapon, hx, hy, aim, -q.sweep * 0.8, len, lights, 0.55);
  blade(weapon, hx, hy, aim, len, bw, grip, guard);
  for (const l of bladeLights(hx, hy, aim, len)) lights.push(l);
  // (the point driven into the floor: see floorStrike)
  if (q.prop === 4 && q.pt > 0.02) floorStrike(over, hx + adx * (4 + len), hy + ady * (4 + len), Math.min(1, q.pt), lights);
  const hands = layer();
  // leaning on a one-handed sword, the hand slides from the grip up onto the pommel
  const onPommel = planted && !two ? Math.max(0, Math.min(1, q.act)) : 0;
  const grab: V = [hx - adx * (grip + 1) * onPommel, hy - ady * (grip + 1) * onPommel];
  fist(hands, grab[0], grab[1]);
  // the second hand of a two-handed grip sits further down the hilt
  const hilt: V = [hx - adx * 5, hy - ady * 5];
  // where the free hand goes to test the edge: a point on the blade that runs from near the guard toward the tip
  const reachK = testing ? Math.max(0, Math.min(1, q.act)) : 0;
  const run = (two ? 9 : 6) + q.pt * (two ? 15 : 10);
  const onBlade: V = [hx + adx * run + q.ohx, hy + ady * run + 1 + q.ohy];

  // --- the scarf's flying ends: they leave from the back of his neck, which is up and to the left
  // of his middle when he faces us and down and to the left when he does not. (They are not
  // painted here: this is only where they are tied.) ---
  const nx = X - 4;
  const ny = back ? sy - 1 : sy - 2;
  const tails: TailRoot[] = [
    { id: 'w-scarf-b', x: nx, y: ny + 0.5, over: back },
    { id: 'w-scarf-a', x: nx, y: ny - 1, over: back },
  ];

  const body = layer();
  // The nearer foot stands lower on the screen and the further one higher: they are on the grid.
  // (the legs do not lean with the body: the feet are what the anchor is measured from)
  const nearX = back ? BX + 1 : BX - LEGS.w - 1;
  const farX = back ? BX - LEGS.w - 1 : BX + 1;
  leg(body, farX, F - 24, F - 3, true, LEGS, footOf(q, false, back, true), back ? 1 : 3, back ? -1 : 1);
  // (in a lunge the knee of the leg that leads is pushed forward over its foot)
  const lead = footOf(q, true, back, true);
  lead.bend += Math.max(0, Math.min(1, q.step / 6)) * 3;
  leg(body, nearX, F - 24, F - 1, false, LEGS, lead, back ? 1 : 3, back ? -1 : 1);
  // the tabard below the belt: the wind is always in it, harder when he moves
  const skirt = layer();
  tabardSkirt(skirt, look.tabard, X, beltY + 3, hipY + 8, WAIST, WAIST + 3 + Math.abs(sway) * 0.8, -sway * 1.2 - q.drag * 0.8, q.wind, 1.1 + Math.min(1.2, q.drag) * 0.9);
  shear(skirt, turn, body);

  // the arms: the sword arm is the nearer one (its shoulder is the lower), the shield arm the
  // further (its shoulder is up beside his jaw, and the arm goes behind his chest, or his back)
  const sShoulder: V = [X + near * SHOULDER, sy + 3 + NEAR_DROP];
  const sElbow = pick(joint(sShoulder, grab, UPPER, FORE, 1), joint(sShoulder, grab, UPPER, FORE, -1), (v) => near * v[0] + v[1] * 0.3);
  const oShoulder: V = [X - near * SHOULDER, sy + 3 - FAR_RISE];
  // the shield arm at rest: the forearm is behind the shield. Off: 0 held out in front, 1 raised
  // (a guard), -1 swung wide out of the sword's way, -2 the shield set down on its point beside him.
  const up = Math.max(0, q.off);
  const out = Math.max(0, Math.min(1, -q.off));
  const down = Math.max(0, Math.min(1, -q.off - 1));
  // (the hand of the shield arm, where the shield is strapped: out to his further side and a little forward)
  const oRest: V = [oShoulder[0] - near * (3 - up + out * 3), oShoulder[1] + 8 - up * 2 - out];
  // the free hand: at rest, or part of the way to the blade
  const oHand: V = two ? [hilt[0] + (onBlade[0] - hilt[0]) * reachK, hilt[1] + (onBlade[1] - hilt[1]) * reachK] : [oRest[0] + (onBlade[0] - oRest[0]) * reachK, oRest[1] + (onBlade[1] - oRest[1]) * reachK];
  // the further arm, where it hangs: beyond the body, in shade
  if (!two && reachK === 0) limb(body, oShoulder[0], oShoulder[1], oRest[0], oRest[1], ARM, ARM - 0.3, dim(MAIL), true);
  // the further shoulder plate: smaller, in shade, half hidden by the chest (or the back)
  ball(body, oShoulder[0] - near, oShoulder[1] - 1.5, 3.6, 3, dim(STEEL));
  // the chest (or the back), the belt and what is on them: painted level, then set on the grid
  const trunk = layer();
  torso(trunk, look.tabard, X, sy, beltY);
  if (back) {
    // the tabard's back: a seam down his middle
    for (let y = sy + 4; y < beltY; y++) if (y % 2 === 0) trunk.set(mid - 1, y, look.tabard[0]);
  }
  belt(trunk, X, beltY, back ? null : mid);
  shear(trunk, turn, body);
  if (!back) {
    // The chevron on his chest, its point on his middle line. (It is painted as it is to be seen,
    // not set on the grid with the rest: leant over like the belt, a mark this small stops being
    // a chevron and becomes a stripe.)
    const vy = sy + 9 + turn(mid);
    const mark = (x: number, y: number, c: string): void => {
      if (look.tabard.indexOf(body.get(x, y) ?? '') >= 0) body.set(x, y, c);
    };
    for (let k = 0; k < 4; k++) {
      mark(mid - 1 - k, vy - k, CYAN[2]);
      mark(mid - 1 - k, vy - 1 - k, CYAN[3]);
    }
    for (let k = 0; k < 3; k++) {
      mark(mid + k, vy - k, CYAN[2]);
      mark(mid + k, vy - 1 - k, CYAN[3]);
    }
  }
  const freeArm = layer();
  if (two) {
    // both hands on the hilt: the other arm comes across the body to the grip (or to the blade, to test it)
    const e2 = pick(joint(oShoulder, oHand, UPPER, FORE + 3, 1), joint(oShoulder, oHand, UPPER, FORE + 3, -1), (v) => v[1]);
    arm(reachK > 0 ? freeArm : body, oShoulder, e2, oHand, ARM, dim(MAIL), dim(STEEL), true);
  } else if (reachK > 0) {
    // reaching for the blade: the whole arm shows, across his chest
    const e = pick(joint(oShoulder, oHand, UPPER, FORE + 2, 1), joint(oShoulder, oHand, UPPER, FORE + 2, -1), (v) => v[1] + near * v[0] * 0.3);
    arm(freeArm, oShoulder, e, oHand, ARM, dim(MAIL), dim(STEEL), true);
  }
  // the sword arm: this side of everything
  arm(body, sShoulder, sElbow, grab, ARM, MAIL, STEEL, true);
  // the nearer shoulder plate: the bigger, in the light
  ball(body, sShoulder[0] + near, sShoulder[1] - 1.5, 4.2, 3.5, STEEL);
  // A cut carries the sword hand across in front of him, past the shield. The sword arm is on our
  // side of him and the shield on the other, so the arm is seen over the shield, not under it.
  // (Up to Version 15.0 it went under: the hand came out from behind the shield.)
  const reach = layer();
  if (!back && !two && !kit.was && grab[0] > X + 3) {
    arm(reach, sShoulder, sElbow, grab, ARM, MAIL, STEEL, true);
    ball(reach, sShoulder[0] + near, sShoulder[1] - 1.5, 4.2, 3.5, STEEL);
  }
  helm(body, cx, cy, back);
  scarfWrap(body, look.scarf, X, sy, back);
  // the free hand, where it shows
  if (two) fist(hands, oHand[0], oHand[1]);
  else if (reachK > 0) fist(hands, oHand[0], oHand[1]);
  if (testing && reachK >= 1) {
    // the thumb on the edge: a glint runs ahead of it, and flares as it comes off the end of the blade
    const gx = Math.round(hx + adx * (run + 3));
    const gy = Math.round(hy + ady * (run + 3));
    over.set(gx, gy, '#ffffff').set(gx + 1, gy, BLADE[3]);
    if (q.pt > 0.9) {
      const tx = Math.round(hx + adx * (4 + len));
      const ty = Math.round(hy + ady * (4 + len));
      const big = q.pt >= 1 ? 3 : 2;
      for (let k = -big; k <= big; k++) over.set(tx + k, ty, '#ffffff').set(tx, ty + k, '#ffffff');
      lights.push({ x: tx, y: ty, r: 9, color: BLADE[3], a: 0.55 });
    }
  }

  // --- the shield: on the further arm, held out the way he faces. It is a flat thing that faces
  // along the grid, so it is seen as the side of a box is: facing us, the side that looks down
  // and to the right (its lines run up to the right); facing away we see its inside, which looks
  // down and to the left (its lines run down to the right), and most of it is behind him. ---
  const shield = layer();
  if (!two) {
    const flat = layer();
    // set down, it stands on its point on the floor beside him and does not breathe with him
    const kx = Math.round(oRest[0] - near * 3 - near * sway * 0.6 + (back ? 3 : 0));
    const carried = oShoulder[1] + (back ? -5 : -1) - up * 3 - sway * 0.6;
    const stood = F - 3 - SHIELD_H;
    kite(flat, kx, carried + (stood - carried) * down, SHIELD_H, SHIELD_W, back, look.scarf);
    shear(flat, along(kx, back ? 1 : -1), shield);
  }

  // --- stack it ---
  let layers: Px[];
  if (back) layers = two ? [body, weapon, hands] : [shield, body, weapon, hands];
  else if (two) layers = q.behind ? [weapon, body, freeArm, hands] : [body, weapon, freeArm, hands];
  // (set down, the shield stands beyond him; held, it is out in front of his chest)
  else if (down > 0.5) layers = [shield, body, weapon, freeArm, hands];
  else layers = q.behind ? [weapon, body, shield, reach, freeArm, hands] : [body, shield, reach, weapon, freeArm, hands];
  return { px: compose(null, layers, over), lights, tails };
}

function pick(a: V, b: V, score: (v: V) => number): V {
  return score(a) >= score(b) ? a : b;
}

// ---------------------------------------------------------------------------------------------
// Animations
//
// Every move is a timeline (clip.ts): a few key poses and when each is reached. The frames between
// are worked out. `hit` is the moment the blow lands; the game's rules have a wind-up of their own
// for each attack, and the picture is played faster or slower up to that moment to match it.

/** A cut or a slam: rest, wound up, the blow, followed through, rest. */
function blow(up: Partial<Pose>, strike: Partial<Pose>, after: Partial<Pose>, t: readonly [number, number, number, number], hit: number): Timeline {
  const keys: Key[] = [
    { at: 0, pose: {} },
    { at: t[0], pose: up, ease: 'out' },
    { at: t[1], pose: strike, ease: 'in' },
    { at: t[2], pose: after, ease: 'out' },
    // (the wind has gone once round by the end, so the cloth is where the standing loop begins)
    { at: t[3], pose: { wind: 1 }, ease: 'io' },
  ];
  return { keys, hit };
}

/** A leap, laid out from 0 (leaving the floor) to 1 (landing): crouched to push off, up with the legs tucked, coming down on the sword. */
function leapOf(push: Partial<Pose>, air: Partial<Pose>, fall: Partial<Pose>): Timeline {
  return {
    keys: [
      { at: 0, pose: push },
      { at: 0.24, pose: air, ease: 'out' },
      { at: 0.62, pose: { ...air, nearLift: 1, farLift: 0.9 }, ease: 'lin' },
      { at: 0.9, pose: fall, ease: 'in' },
      { at: 1, pose: fall, ease: 'lin' },
    ],
  };
}

/** One frame of an attack (kit.ts, CLIP_FPS): the keys below are set on frames, so that each is seen exactly. */
const FR = 1 / 30;

/**
 * STRIKE with the sword and shield, as it is from Version 15.1. The owner, 6 Oct 2026: "I want
 * things to have weight. That's very important"; "The warrior swings his sword with practiced
 * lethal intent"; and of the Strike before this one, on his page of notes: "0 weight". That one
 * raised the sword and brought it down with the body standing where it stood: an arm moved, and
 * nothing else did. This one is a swordsman's cut, and all of him is in it:
 *   the guard   he sinks onto his back leg, the shield comes up, the sword goes back over the shoulder
 *   the step    the body goes first (the leading foot is in the air, the blade has not moved yet)
 *   the cut     he lands on that foot, a pace nearer, low, and the blade comes over and down
 *               through whatever is in front of him, leaving its streak in the air (Pose.sweep)
 *   the hold    he stays there, blade low, for a tenth of a second: the cloth that streamed behind
 *               him catches up and swings past. A blow that is held is a blow that landed.
 *   and back    to his stance.
 * The blow is the fifth frame, and the rules land theirs in the same instant (`hit`).
 */
const CUT: Timeline = {
  hit: 4 * FR,
  keys: [
    { at: 0, pose: {} },
    { at: 2 * FR, pose: { lean: -3, bob: 2, far: -0.5, hx: -1, hy: -21, aim: 148, off: 1, behind: true, wind: 0.12, drag: -0.6 }, ease: 'out' },
    { at: 3 * FR, pose: { lean: 1, bob: 1, step: 4, near: 0.6, nearLift: 0.7, far: -1.2, hx: 1, hy: -22, aim: 132, off: 0.4, behind: true, wind: 0.25, drag: 1.2 }, ease: 'in' },
    { at: 4 * FR, pose: { lean: 5, bob: 4, step: 8, near: 0.8, far: -2.1, hx: 24, hy: -5, aim: -28, sweep: 150, off: -1, wind: 0.4, drag: 2.6 }, ease: 'in' },
    { at: 5 * FR, pose: { lean: 6, bob: 5, step: 9, near: 0.8, far: -2.3, hx: 23, hy: 4, aim: -60, sweep: 70, off: -1, wind: 0.5, drag: 1.4 }, ease: 'out' },
    { at: 8 * FR, pose: { lean: 5, bob: 4, step: 9, near: 0.8, far: -2.3, hx: 22, hy: 4, aim: -56, off: -0.6, wind: 0.68, drag: -1.4 }, ease: 'out' },
    { at: 13 * FR, pose: { wind: 1 }, ease: 'io' },
  ],
};
/** The same cut seen from behind him: it goes away from us, up the screen, and ends pointing at what he struck. */
const CUT_BACK: Timeline = {
  hit: 4 * FR,
  keys: [
    { at: 0, pose: {} },
    { at: 2 * FR, pose: { lean: -3, bob: 2, far: -0.5, hx: -2, hy: -17, aim: 150, off: 1, wind: 0.12, drag: -0.6 }, ease: 'out' },
    { at: 3 * FR, pose: { lean: 1, bob: 1, step: 4, near: 0.6, nearLift: 0.7, far: -1.2, hx: -3, hy: -19, aim: 136, off: 0.4, wind: 0.25, drag: 1.2 }, ease: 'in' },
    { at: 4 * FR, pose: { lean: 5, bob: 3, step: 8, near: 0.8, far: -2.1, hx: 7, hy: -13, aim: 30, sweep: 115, wind: 0.4, drag: 2.6 }, ease: 'in' },
    { at: 5 * FR, pose: { lean: 6, bob: 4, step: 9, near: 0.8, far: -2.3, hx: 7, hy: -5, aim: -16, sweep: 60, wind: 0.5, drag: 1.4 }, ease: 'out' },
    { at: 8 * FR, pose: { lean: 5, bob: 3, step: 9, near: 0.8, far: -2.3, hx: 6, hy: -4, aim: -12, wind: 0.68, drag: -1.4 }, ease: 'out' },
    { at: 13 * FR, pose: { wind: 1 }, ease: 'io' },
  ],
};

/**
 * STRIKE with the great sword (what a warrior starts with): the same cut with both hands on the
 * hilt. The guard is the high one, hands beside the helm and the blade back over the shoulder;
 * the blade is half as long again, so its streak is half as big again.
 */
const CLEAVE: Timeline = {
  hit: 4 * FR,
  keys: [
    { at: 0, pose: {} },
    { at: 2 * FR, pose: { lean: -3, bob: 2, far: -0.5, hx: -16, hy: -13, aim: 142, behind: true, wind: 0.12, drag: -0.6 }, ease: 'out' },
    { at: 3 * FR, pose: { lean: 1, bob: 1, step: 3, near: 0.6, nearLift: 0.7, far: -1.0, hx: -14, hy: -15, aim: 130, behind: true, wind: 0.25, drag: 1.2 }, ease: 'in' },
    { at: 4 * FR, pose: { lean: 5, bob: 4, step: 6, near: 0.8, far: -1.6, hx: 6, hy: 1, aim: -26, sweep: 150, wind: 0.4, drag: 2.6 }, ease: 'in' },
    { at: 5 * FR, pose: { lean: 6, bob: 5, step: 7, near: 0.8, far: -1.9, hx: 5, hy: 8, aim: -56, sweep: 70, wind: 0.5, drag: 1.4 }, ease: 'out' },
    { at: 8 * FR, pose: { lean: 5, bob: 4, step: 7, near: 0.8, far: -1.9, hx: 4, hy: 8, aim: -52, wind: 0.68, drag: -1.4 }, ease: 'out' },
    { at: 13 * FR, pose: { wind: 1 }, ease: 'io' },
  ],
};
const CLEAVE_BACK: Timeline = {
  hit: 4 * FR,
  keys: [
    { at: 0, pose: {} },
    { at: 2 * FR, pose: { lean: -3, bob: 2, far: -0.5, hx: 1, hy: -13, aim: 142, wind: 0.12, drag: -0.6 }, ease: 'out' },
    { at: 3 * FR, pose: { lean: 1, bob: 1, step: 3, near: 0.6, nearLift: 0.7, far: -1.0, hx: 1, hy: -15, aim: 130, wind: 0.25, drag: 1.2 }, ease: 'in' },
    { at: 4 * FR, pose: { lean: 5, bob: 3, step: 6, near: 0.8, far: -1.6, hx: 6, hy: -9, aim: 32, sweep: 105, wind: 0.4, drag: 2.6 }, ease: 'in' },
    { at: 5 * FR, pose: { lean: 6, bob: 4, step: 7, near: 0.8, far: -1.9, hx: 6, hy: -2, aim: -14, sweep: 60, wind: 0.5, drag: 1.4 }, ease: 'out' },
    { at: 8 * FR, pose: { lean: 5, bob: 3, step: 7, near: 0.8, far: -1.9, hx: 5, hy: -1, aim: -10, wind: 0.68, drag: -1.4 }, ease: 'out' },
    { at: 13 * FR, pose: { wind: 1 }, ease: 'io' },
  ],
};

/**
 * SLAM with the sword and shield, from Version 15.1. Up to 15.0 the sword went up and was driven
 * into the floor with the knight standing over it. Now he goes up onto his toes with the sword
 * as high as it will go, tips forward off them, and comes down with everything he has: a pace
 * forward, deep into his knees, the blade coming over in a streak and its point driven into the
 * floor ahead of him, where a ring of light runs out from it; he stays down over the hilt while
 * the cloth settles, and gets up. It lands on the eighth frame, as the rules land theirs (`hit`).
 * `top`: the sword at its highest; `down`: driven into the floor, for the view; `arc`: how far it came round.
 */
function slamOf(top: Partial<Pose>, down: Partial<Pose>, arc: number): Timeline {
  const low: Partial<Pose> = { ...down, prop: 4, lean: 4, bob: 4, step: 6, near: 0.9, far: -1.6 };
  return {
    hit: 7 * FR,
    keys: [
      { at: 0, pose: {} },
      { at: 3 * FR, pose: { ...top, hy: (top.hy ?? 0) + 8, lean: -2, bob: 1, far: -0.4, off: 1, wind: 0.1 }, ease: 'out' },
      { at: 5 * FR, pose: { ...top, lean: -2, bob: -2, off: 1, wind: 0.18, drag: -0.6 }, ease: 'out' },
      // (he tips forward off his toes, the leading foot already in the air: the fall has begun)
      { at: 6 * FR, pose: { ...top, hy: (top.hy ?? 0) + 1, aim: (top.aim ?? 90) - 14, lean: 1, bob: -1, step: 2, near: 0.5, nearLift: 0.7, off: 0.5, wind: 0.2, drag: 0.8 }, ease: 'lin' },
      { at: 7 * FR, pose: { ...low, pt: 1, sweep: arc, off: -1, wind: 0.4, drag: 2.8 }, ease: 'in' },
      { at: 9 * FR, pose: { ...low, pt: 0.4, sweep: 30, off: -1, wind: 0.5, drag: 1.2 }, ease: 'out' },
      { at: 12 * FR, pose: { ...low, bob: 3, lean: 3, off: -0.5, wind: 0.65, drag: -1.3 }, ease: 'out' },
      { at: 18 * FR, pose: { prop: 4, wind: 1 }, ease: 'io' },
    ],
  };
}

/**
 * WHIRLWIND (the great sword, held), from Version 15.1. Up to 15.0 a warrior who whirled showed
 * one frozen frame of the Strike as the game turned him about. Now he has a spin of his own for
 * as long as it is held: knees bent, leaning back against the pull of the sword, arms out and the
 * blade level along the grid with its light smeared before it and behind it, the tabard thrown
 * out. (The game turns him through his four views as before, and its two crescents go round him.)
 * `level`: where the hands are and how the blade points, for the view.
 */
function spin(level: Partial<Pose>): Timeline {
  const hy = level.hy ?? 0;
  const out: Partial<Pose> = { ...level, prop: 3, lean: -1, bob: 2, near: -0.5, far: 0.7, sweep: 80, drag: 2 };
  return {
    loop: 0,
    keys: [
      { at: 0, pose: { ...out, wind: 0 } },
      { at: 2 * FR, pose: { ...out, hy: hy - 1, sweep: 100, bob: 3, wind: 0.25 }, ease: 'lin' },
      { at: 4 * FR, pose: { ...out, sweep: 70, wind: 0.5 }, ease: 'lin' },
      { at: 6 * FR, pose: { ...out, hy: hy + 1, sweep: 100, lean: -2, wind: 0.75 }, ease: 'lin' },
      { at: 8 * FR, pose: { ...out, wind: 1 }, ease: 'lin' },
    ],
  };
}
/** ... and coming out of it: the blade is let run on down to the floor, held there, and brought back. */
function spinEnd(level: Partial<Pose>, low: Partial<Pose>): Timeline {
  return {
    keys: [
      { at: 0, pose: { ...level, prop: 3, lean: -1, bob: 2, near: -0.5, far: 0.7, sweep: 80, drag: 2 } },
      { at: 2 * FR, pose: { ...low, lean: 2, bob: 3, near: 0.6, far: -0.8, sweep: 60, drag: 1.2, wind: 0.3 }, ease: 'out' },
      { at: 4 * FR, pose: { ...low, lean: 2, bob: 3, near: 0.6, far: -0.8, drag: -1.2, wind: 0.5 }, ease: 'out' },
      { at: 8 * FR, pose: { wind: 1 }, ease: 'io' },
    ],
  };
}

/**
 * A LEAP COMES DOWN (from Version 15.1). Up to 15.0 the knight landed and was standing in the
 * same instant. Now, if he is left standing where he lands, the weight of it goes into the floor:
 * deep into his knees over the sword, its point driven in and a ring of light running out from
 * it, a beat held there, and up. (Anything else he does on landing, he does at once, as before.)
 * `fall`: the last pose of the leap; `down`: the sword driven into the floor, for the view.
 */
function landing(fall: Partial<Pose>, down: Partial<Pose>): Timeline {
  const low: Partial<Pose> = { ...fall, ...down, prop: 4, lean: 3, bob: 5, near: 0.9, far: -0.7, nearLift: 0 };
  return {
    keys: [
      { at: 0, pose: fall },
      { at: 1 * FR, pose: { ...low, pt: 1, drag: 2.6, wind: 0.2 }, ease: 'lin' },
      { at: 3 * FR, pose: { ...low, pt: 0.4, bob: 4, drag: 1, wind: 0.35 }, ease: 'out' },
      { at: 6 * FR, pose: { ...low, bob: 4, drag: -1.3, wind: 0.5 }, ease: 'out' },
      { at: 12 * FR, pose: { prop: 4, wind: 1 }, ease: 'io' },
    ],
  };
}

/**
 * How the knight runs (from Version 15.1): driving forward, leaning into it, each footfall coming
 * down hard under the weight of the mail, the tabard and the scarf thrown well back.
 */
const KNIGHT_RUN = runPoses({ lean: 2, dip: 2, stride: 1.2, drag: 1.5 });

/**
 * THE KNIGHT'S FALL, when his life runs out (6 Oct 2026; the owner: heroes are to be "very
 * stylized and cool. Proud and daring", and "I want things to have weight"). Until then a hero
 * whose life ran out stood as he stood, behind the words YOU DIED. Now the blow throws him back
 * on his heels; he takes a step back to keep his feet; the sword goes point down to the floor
 * before him and he holds himself up on it; his knees go and he comes down hard on one of them,
 * his hands still on the hilt; his head goes down, and the light goes out of the blade
 * (Pose.out). He is left kneeling behind his sword: he does not lie down.
 * `plant`: the sword set point down (and, when he carries one, the shield stood beside it);
 * `kneel`: where his hands are on it once he is down.
 */
/**
 * A heavy blow rocks him back on his heels (the first moment of his fall, and then he is upright
 * again): the owner, 6 Oct 2026, "I want things to have weight". Until then a hero who was struck
 * flashed red and did not move.
 */
const KNIGHT_REEL: Timeline = {
  keys: [
    { at: 0, pose: {} },
    { at: 2 * FR, pose: { lean: -5, bob: 1, step: -3, near: 0.5, far: -0.7, drag: -2.5, wind: 0.08 }, ease: 'out' },
    { at: 4 * FR, pose: { lean: -3, bob: 1, step: -3, near: 0.3, far: -0.5, drag: 1.2, wind: 0.14 }, ease: 'io' },
    { at: 7 * FR, pose: {}, ease: 'io' },
  ],
};
/** ... and one from behind throws them forward a step: pitched over, a foot out to catch them, and upright again. */
const KNIGHT_LURCH: Timeline = {
  keys: [
    { at: 0, pose: {} },
    { at: 2 * FR, pose: { lean: 5, bob: 2, step: 3, near: -0.6, far: 0.6, drag: 2.5, wind: 0.08 }, ease: 'out' },
    { at: 4 * FR, pose: { lean: 3, bob: 2, step: 3, near: 0.5, far: -0.3, drag: -1, wind: 0.14 }, ease: 'io' },
    { at: 7 * FR, pose: {}, ease: 'io' },
  ],
};

function fallOf(plant: Partial<Pose>, kneel: Partial<Pose>): Timeline {
  const down: Partial<Pose> = { ...plant, ...kneel, near: 1.3, far: -1.3, step: -5 };
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 2 * FR, pose: { lean: -5, bob: 1, step: -3, near: 0.5, far: -0.7, drag: -2.5, wind: 0.08 }, ease: 'out' },
      { at: 8 * FR, pose: { lean: -3, bob: 2, step: -5, near: -0.4, far: 0.4, drag: -0.8, wind: 0.25 }, ease: 'io' },
      { at: 14 * FR, pose: { ...plant, lean: -1, bob: 3, step: -5, wind: 0.4 }, ease: 'io' },
      { at: 21 * FR, pose: { ...plant, lean: 0, bob: 4, step: -5, wind: 0.55, out: 0.2 }, ease: 'io' },
      // (his knees go: slowly, and then all at once; and the weight of him landing presses him lower still for a moment)
      { at: 27 * FR, pose: { ...down, bob: 14, lean: 3, wind: 0.68, drag: 1.6, out: 0.45 }, ease: 'in' },
      { at: 29 * FR, pose: { ...down, bob: 15, lean: 4, wind: 0.72, drag: -1, out: 0.5 }, ease: 'lin' },
      { at: 33 * FR, pose: { ...down, bob: 13, lean: 4, wind: 0.8, out: 0.6 }, ease: 'out' },
      { at: 46 * FR, pose: { ...down, bob: 14, lean: 6, wind: 1, out: 1 }, ease: 'io' },
    ],
  };
}

/** The knight with a sword and his shield, or with a great sword in both hands. */
export function makeWarriorArt(kit: WarriorKit): ActorArt {
  const rig = (q: Pose, back: boolean): Painted => knight(q, back, kit);
  if (kit.twoHanded) {
    // The great sword rests across the body, point up over the shoulder.
    const across: Partial<Pose> = { hx: -3, hy: -2, aim: 140, prop: 1 };
    const down: Partial<Pose> = { aim: -90, hx: -4, hy: 0, prop: 2 };
    const front: Moves = {
      ...(kit.was ? {} : { walk: KNIGHT_RUN }),
      // the cut (see CLEAVE). Up to Version 15.0, a full swing: back over the shoulder, down through the target, and on toward the floor
      attack: !kit.was ? CLEAVE : blow(
        { lean: -2, hx: -4, hy: -9, aim: 118, behind: true, wind: 0.15 },
        { lean: 2, bob: 1, near: 0.7, far: -0.4, hx: 7, hy: 3, aim: -22, wind: 0.45, drag: 1.6 },
        { lean: 1, bob: 1, near: 0.5, far: -0.2, hx: 5, hy: 8, aim: -52, wind: 0.75, drag: 0.6 },
        [0.09, 0.17, 0.26, 0.43], 0.13,
      ),
      // the slam: straight up, then driven point first into the floor
      heavy: blow(
        { lean: -1, bob: -1, hx: -3, hy: -14, aim: 98, behind: true, wind: 0.15 },
        { lean: 3, bob: 3, near: 0.8, far: -0.5, hx: 8, hy: 9, aim: -72, wind: 0.45, drag: 2 },
        { lean: 2, bob: 2, near: 0.6, far: -0.3, hx: 7, hy: 7, aim: -64, wind: 0.75, drag: 0.6 },
        [0.15, 0.25, 0.38, 0.6], 0.22,
      ),
      leap: leapOf(
        { bob: 3, near: -0.3, far: 0.3, hx: -1, hy: 1, aim: 70, drag: 1, wind: 0.1 },
        { bob: -1, lean: 1, near: 0.4, far: -0.6, nearLift: 1, farLift: 0.6, hx: -3, hy: -12, aim: 104, behind: true, drag: 2.2, wind: 0.35 },
        { bob: 1, lean: 3, near: 0.8, far: -0.4, nearLift: 0.3, hx: 6, hy: 2, aim: -30, drag: 2.4, wind: 0.6 },
      ),
      ...(kit.was ? {} : {
        whirl: spin({ hx: 7, hy: 1, aim: -27 }),
        whirlEnd: spinEnd({ hx: 7, hy: 1, aim: -27 }, { hx: 5, hy: 8, aim: -54 }),
        land: landing({ bob: 1, lean: 3, near: 0.8, far: -0.4, nearLift: 0.3, hx: 6, hy: 2, aim: -30, drag: 2.4, wind: 0.6 }, { hx: 6, hy: 7, aim: -62 }),
        fall: fallOf({ prop: 2, aim: -90, hx: -4, hy: 0 }, { hx: 0, hy: 3 }),
        reel: KNIGHT_REEL,
        lurch: KNIGHT_LURCH,
      }),
      // he tests the edge: the blade is brought across the body, and a thumb is run along it
      idleA: {
        keys: [
          { at: 0, pose: {} },
          { at: 0.45, pose: { ...across } },
          { at: 0.7, pose: { ...across, act: 1 } },
          { at: 1.45, pose: { ...across, act: 1, pt: 1, lean: -1 }, ease: 'lin' },
          { at: 1.65, pose: { ...across, act: 1, pt: 1, aim: 133, lean: -1 } },
          { at: 1.9, pose: { ...across, pt: 1 } },
          { at: 2.4, pose: {} },
        ],
      },
      // he sets the point of the sword on the floor in front of him and rests on it
      idleB: {
        keys: [
          { at: 0, pose: {} },
          { at: 0.55, pose: { ...down }, ease: 'in' },
          { at: 0.85, pose: { ...down, bob: 1 }, ease: 'out' },
          { at: 1.9, pose: { ...down, bob: 2, lean: 1 } },
          { at: 2.8, pose: { ...down, bob: 1 } },
          { at: 3.1, pose: { ...down } },
          { at: 3.6, pose: {} },
        ],
      },
    };
    const backMoves: Moves = {
      ...(kit.was ? {} : { walk: KNIGHT_RUN }),
      attack: !kit.was ? CLEAVE_BACK : blow(
        { lean: -2, hx: -4, hy: -9, aim: 118, wind: 0.15 },
        { lean: 2, bob: 1, near: 0.7, far: -0.4, hx: 6, hy: -5, aim: 30, wind: 0.45, drag: 1.6 },
        { lean: 1, bob: 1, near: 0.5, far: -0.2, hx: 6, hy: 2, aim: -20, wind: 0.75, drag: 0.6 },
        [0.09, 0.17, 0.26, 0.43], 0.13,
      ),
      heavy: blow(
        { lean: -1, bob: -1, hx: -3, hy: -14, aim: 98, wind: 0.15 },
        { lean: 3, bob: 3, near: 0.8, far: -0.5, hx: 7, hy: 1, aim: -8, wind: 0.45, drag: 2 },
        { lean: 2, bob: 2, near: 0.6, far: -0.3, hx: 6, hy: 2, aim: -14, wind: 0.75, drag: 0.6 },
        [0.15, 0.25, 0.38, 0.6], 0.22,
      ),
      leap: leapOf(
        { bob: 3, near: -0.3, far: 0.3, hx: -1, hy: 1, aim: 70, drag: 1, wind: 0.1 },
        { bob: -1, lean: 1, near: 0.4, far: -0.6, nearLift: 1, farLift: 0.6, hx: -3, hy: -12, aim: 104, drag: 2.2, wind: 0.35 },
        { bob: 1, lean: 3, near: 0.8, far: -0.4, nearLift: 0.3, hx: 5, hy: -6, aim: 24, drag: 2.4, wind: 0.6 },
      ),
      ...(kit.was ? {} : {
        whirl: spin({ hx: 7, hy: -6, aim: 27 }),
        whirlEnd: spinEnd({ hx: 7, hy: -6, aim: 27 }, { hx: 6, hy: -1, aim: -12 }),
        land: landing({ bob: 1, lean: 3, near: 0.8, far: -0.4, nearLift: 0.3, hx: 5, hy: -6, aim: 24, drag: 2.4, wind: 0.6 }, { hx: 6, hy: 0, aim: -14 }),
        fall: fallOf({ prop: 2, aim: -90, hx: -4, hy: 0 }, { hx: 0, hy: 3 }),
        reel: KNIGHT_REEL,
        lurch: KNIGHT_LURCH,
      }),
    };
    return { front: animSet(rig, false, { aim: 62 }, front), back: animSet(rig, true, { aim: 66 }, backMoves) };
  }
  // One-handed: the sword hangs at rest in the hand nearer us, point down.
  // Facing us that hand is on the LEFT of the picture and what he strikes at is to the right, so a
  // blow carries the hand across in front of him (hx grows by a body's width).
  // (to test the edge the blade is brought up across the chest, pointing over the shield shoulder)
  const across: Partial<Pose> = { off: -2, hx: 7, hy: -8, aim: 25, prop: 1 };
  const down: Partial<Pose> = { off: -2, aim: -90, hx: -1, hy: 3, prop: 2 };
  const front: Moves = {
    ...(kit.was ? {} : { walk: KNIGHT_RUN }),
    // the cut (see CUT). Up to Version 15.0: raised over the sword shoulder with the shield up, swung down across, then low
    attack: !kit.was ? CUT : blow(
      { lean: -1, hx: 3, hy: -21, aim: 108, off: 1, wind: 0.15 },
      { lean: 2, bob: 1, near: 0.7, far: -0.4, hx: 21, hy: -4, aim: -24, off: -1, wind: 0.45, drag: 1.6 },
      { lean: 1, bob: 1, near: 0.5, far: -0.2, hx: 21, hy: 3, aim: -56, wind: 0.75, drag: 0.6 },
      [0.08, 0.16, 0.24, 0.42], 0.12,
    ),
    // the slam (see slamOf). Up to Version 15.0: the sword goes straight up, then is driven point first into the floor in front of him
    heavy: !kit.was ? slamOf({ hx: 4, hy: -27, aim: 96 }, { hx: 17, hy: 6, aim: -76 }, 165) : blow(
      { lean: -1, bob: -1, hx: 4, hy: -25, aim: 96, off: 1, wind: 0.15 },
      { lean: 3, bob: 3, near: 0.8, far: -0.5, hx: 16, hy: 5, aim: -78, off: -1, wind: 0.45, drag: 2 },
      { lean: 2, bob: 2, near: 0.6, far: -0.3, hx: 15, hy: 3, aim: -70, wind: 0.75, drag: 0.6 },
      [0.14, 0.25, 0.37, 0.6], 0.22,
    ),
    leap: leapOf(
      { bob: 3, near: -0.3, far: 0.3, hy: -2, aim: -70, drag: 1, wind: 0.1 },
      { bob: -1, lean: 1, near: 0.4, far: -0.6, nearLift: 1, farLift: 0.6, hx: 3, hy: -21, aim: 104, off: 0.6, drag: 2.2, wind: 0.35 },
      { bob: 1, lean: 3, near: 0.8, far: -0.4, nearLift: 0.3, hx: 18, hy: -4, aim: -30, off: -1, drag: 2.4, wind: 0.6 },
    ),
    ...(kit.was ? {} : {
      land: landing({ bob: 1, lean: 3, near: 0.8, far: -0.4, nearLift: 0.3, hx: 18, hy: -4, aim: -30, off: -1, drag: 2.4, wind: 0.6 }, { hx: 17, hy: 5, aim: -74 }),
      fall: fallOf({ off: -2, prop: 2, aim: -90, hx: -1, hy: 3, act: 1 }, { hx: 2, hy: 4 }),
      reel: KNIGHT_REEL,
        lurch: KNIGHT_LURCH,
    }),
    // he tests the edge of his sword: the shield is stood on its point, the blade is brought up
    // across the chest, and a thumb is run along it
    idleA: {
      keys: [
        { at: 0, pose: {} },
        { at: 0.4, pose: { off: -2 } },
        { at: 0.85, pose: { ...across } },
        { at: 1.1, pose: { ...across, act: 1 } },
        { at: 1.95, pose: { ...across, act: 1, pt: 1, lean: -1 }, ease: 'lin' },
        { at: 2.2, pose: { ...across, act: 1, pt: 1, aim: 32, lean: -1 } },
        { at: 2.55, pose: { ...across, pt: 1 } },
        { at: 3.1, pose: { off: -2 } },
        { at: 3.6, pose: {} },
      ],
    },
    // he plants the sword point down beside him and leans on the pommel
    idleB: {
      keys: [
        { at: 0, pose: {} },
        { at: 0.45, pose: { ...down, off: 0 }, ease: 'in' },
        { at: 0.8, pose: { ...down, act: 1, bob: 2, lean: -1 }, ease: 'out' },
        { at: 1.9, pose: { ...down, act: 1, bob: 3, lean: -2 } },
        { at: 2.8, pose: { ...down, act: 1, bob: 2, lean: -1 } },
        { at: 3.1, pose: { ...down, off: 0 } },
        { at: 3.6, pose: {} },
      ],
    },
  };
  const backMoves: Moves = {
    ...(kit.was ? {} : { walk: KNIGHT_RUN }),
    attack: !kit.was ? CUT_BACK : blow(
      { lean: -1, hx: -3, hy: -18, aim: 104, off: 1, wind: 0.15 },
      { lean: 2, bob: 1, near: 0.7, far: -0.4, hx: 4, hy: -13, aim: 30, wind: 0.45, drag: 1.6 },
      { lean: 1, bob: 1, near: 0.5, far: -0.2, hx: 3, hy: -3, aim: -28, wind: 0.75, drag: 0.6 },
      [0.08, 0.16, 0.24, 0.42], 0.12,
    ),
    heavy: !kit.was ? slamOf({ hx: -4, hy: -24, aim: 96 }, { hx: 7, hy: -3, aim: -16 }, 110) : blow(
      { lean: -1, bob: -1, hx: -4, hy: -22, aim: 96, off: 1, wind: 0.15 },
      { lean: 3, bob: 3, near: 0.8, far: -0.5, hx: 6, hy: -4, aim: -14, wind: 0.45, drag: 2 },
      { lean: 2, bob: 2, near: 0.6, far: -0.3, hx: 5, hy: -2, aim: -22, wind: 0.75, drag: 0.6 },
      [0.14, 0.25, 0.37, 0.6], 0.22,
    ),
    leap: leapOf(
      { bob: 3, near: -0.3, far: 0.3, hy: -2, aim: -60, drag: 1, wind: 0.1 },
      { bob: -1, lean: 1, near: 0.4, far: -0.6, nearLift: 1, farLift: 0.6, hx: -3, hy: -18, aim: 100, off: 0.6, drag: 2.2, wind: 0.35 },
      { bob: 1, lean: 3, near: 0.8, far: -0.4, nearLift: 0.3, hx: 4, hy: -12, aim: 26, drag: 2.4, wind: 0.6 },
    ),
    ...(kit.was ? {} : {
      land: landing({ bob: 1, lean: 3, near: 0.8, far: -0.4, nearLift: 0.3, hx: 4, hy: -12, aim: 26, drag: 2.4, wind: 0.6 }, { hx: 7, hy: -3, aim: -16 }),
      fall: fallOf({ off: -2, prop: 2, aim: -90, hx: -1, hy: 3, act: 1 }, { hx: 2, hy: 4 }),
      reel: KNIGHT_REEL,
        lurch: KNIGHT_LURCH,
    }),
  };
  return { front: animSet(rig, false, { aim: -85 }, front), back: animSet(rig, true, { aim: -72 }, backMoves) };
}

/** For the art sheets: one frame, as a painting. */
export function paintWarrior(q: Pose, back: boolean, kit: WarriorKit): Painted {
  return knight(q, back, kit);
}

export const WARRIOR_CANVAS = { w: KW, h: KH };

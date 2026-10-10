// THE WARDEN'S FLOOR: the Crypt's first floor, themed after its boss (a mock-up; nothing of the
// game imports it).
//
// The owner, 10 Oct 2026, by 07:29, asked whether the Crypt's four floors were good to build as
// shown: "Yes.  I’d also like each floor to be themed after the boss.  Add this to the ruleset.
// We need somewhere between 40-50 unique assets on each floor for each boss.  That can include
// wall tiles, floor tiles, breakables, stuff on the walls, on the floor, obstacles, the looks of
// doors and gates, traps, and quests." (His art rulebook, Places 7, his doc at rev 43.) By 07:41,
// to the four themes: "Yes, start floor 1 (Recommended)", offered as "A sheet of the Warden's floor
// pieces comes to you first."
//
// THE THEME, from the Warden as he is painted (art/monster_warden.ts): "A dead king's jailer: a
// towering skeleton in cracked iron with fire showing through the cracks, a horned helm open over
// the skull's face, a long tattered cape the colour of blood, and a two-handed maul". So floor 1 is
// THE DEAD KING'S TOMB AND ITS JAILER: the king's tomb and his effigy, his throne, his crown cut in
// the stone; and the jailer's iron: bars, keys, shackles, horned helms, mauls, his blood-red cloth.
// It stands on the Crypt's first floor as he said yes to it (art/crypt.ts, CRYPT_FLOORS[0]: old
// and crumbling, all stone).
//
// THE RULES IT KEEPS (his art rulebook): crisp pixels, two to a game pixel, light from the upper
// left, three tones a material, the indigo seam between parts; turned to the grid (what has sides
// is built on the grid, what lies on the floor lies along its lines); a step quieter than the
// figures (the cloth a dull wine, the iron the Crypt's old iron); no glow but an honest fire's
// orange (no cyan, no pink: Colour 3); old, broken and burnt (Places 6); no carved words (Words in
// the world 3): the crown, the horned helm and the maul are the marks, never letters.
//
// THE PIECES (FLOOR1_PIECES has them by name, with what of the game each is):
//   WALL TILES, cut into a wall's face: a burial niche, a sealed niche with the crown, a barred
//     window, the horned skull, the king's head in a roundel, a place where the stones fell in.
//   FLOOR TILES: a ledger stone with a sword cut in it, a grave slab with an iron ring, the king's
//     red runner, a drain, the crown laid in the floor, a slab sunk into a grave.
//   BREAKABLES (for the game's barrel and urn): a tall funeral urn, a squat urn, a bone box, a
//     skull jar; and what each leaves broken.
//   ON THE WALLS: a long banner, a banner in rags, a shield, keys on a hook, shackles, a torch, two
//     mauls crossed, a horned helm on a peg.
//   ON THE FLOOR: a fallen guard, keys, a fallen banner, the effigy's broken head, a horned helm,
//     candles in their wax, a chain.
//   OBSTACLES: a sarcophagus, an open one, the king's tomb and effigy, a horned knight in stone, the
//     floor's pillar, a cresset, a rack of mauls, the king's throne, the king's coffer (the chest).
//   DOORS AND GATES: the door's leaf, the gate's crest, the boss's gate.
//   TRAPS: the spike floor's grate, the dart wall's plate, its slot in a horned skull.
//   QUESTS: the Warden's horn, his trophy.
//
// Measures as the game's (art/isokit.ts): picture pixels, two to a game pixel; a tile 64 x 32 on
// the screen; along +x 32 right and 16 down, along +y 32 left and 16 down; heights up.

import { Px } from '../engine/px';
import type { Light, Sprite } from '../engine/px';
import { CRYPT_FLOORS, OLD_IRON, OLD_RUST, TIMBER } from './crypt';
import type { Theme } from './ground';
import { Iso, plainSide } from './isokit';
import type { SideShader } from './isokit';
import { GRAIN, INK, ball, compose, hash, limb, lit, mix } from './kit';
import type { Ramp } from './kit';
import { COAL, EMBER, GOLD, ROUND_HI, ROUND_LO, column, hoop, stoneOf, tongue, trunk } from './props';
import type { TrunkLook } from './props';

// =================================================================================================
// The colours

const THEME: Theme = CRYPT_FLOORS[0];
/** The dressed stone of the floor's tombs and statues (the walls' own, from their shade to a lit edge). */
const STONE: Ramp = stoneOf(THEME);
/** The stone of a wall's face turned to the light, as a ramp: its joint, its low tone, its usual, its high, and a lit edge. */
const FACE: Ramp = [THEME.lit[0], THEME.lit[1], THEME.lit[2], THEME.lit[4], THEME.lit[4]];
/** Bone in a wall's niche: in the wall's dark, a step under the bone that lies on the floor. */
const NICHE_BONE: Ramp = ['#1e1a34', '#1e1a34', '#3e3862', '#5a5484', '#5a5484'];
/** The Warden's cloth, "the colour of blood", as a place has it: a dull wine, darker than any word. */
export const WINE: Ramp = ['#1a0a1a', '#1a0a1a', '#42142a', '#66203a', '#7e2c48'];
/** Old bone, a step under the vault's. */
const OLD_BONE: Ramp = ['#26203e', '#26203e', '#6a6294', '#a29ac6', '#c2bae2'];
/** Tallow candles. */
const WAX: Ramp = ['#3a3252', '#3a3252', '#867ea4', '#b8b0d2', '#d4cce8'];
/** Fired clay with a dark glaze: the funeral urns. */
const ASH_CLAY: Ramp = ['#1a162e', '#1a162e', '#363052', '#544c7a', '#6e6696'];
/** What is left in an urn. */
const ASH = ['#2c2840', '#3e3a54', '#575270'] as const;
/** The dark of a hole in stone. */
const DEEP = '#07060f';
/** Iron, with a glint for its edge. */
const IRONS: Ramp = OLD_IRON;
/** Small iron things (keys, chains, hooks): a little brighter, so they read against stone at a phone's size. */
const SMALL_IRON: Ramp = ['#1c1a3a', '#1c1a3a', '#4c4884', '#8480bc', '#a8a4dc'];
const GLINT = '#9a96c8';

/** A shade of a ramp's tone on a face turned away from the light. */
function shaded(c: string): string {
  return mix(c, '#06051a', 0.32);
}
function darkened(r: Ramp): Ramp {
  return r.map(shaded) as unknown as Ramp;
}

// =================================================================================================
// The two ways things are laid: flat in a wall's face, and flat on the floor along its lines.

/** A flat picture painted upright, `u` across from its middle and `v` up from its foot. */
const PW = 48;
const PH = 120;
const PCX = 24;
const PFOOT = 104;

/** A blank flat picture for a wall, and where (u, v) is on it. */
function flat(): Px {
  return new Px(PW, PH);
}
const fx = (u: number): number => PCX + u;
const fy = (v: number): number => PFOOT - v;

/**
 * A FLAT PICTURE SET INTO A WALL'S FACE: the face turned to screen-left (`alongX`, a plane along +x,
 * in the light) or the one turned to screen-right (along +y, in shade). As the walls' faces do,
 * each column drops a pixel for every two across (art/ground.ts, bottomRow). Anchored at the foot of
 * the face under the middle of its tile; a tile's face is 32 across (u -16 to 15) and the solid
 * stone of it 56 high (above that the wall fades into the dark).
 */
function onFace(picture: Px, alongX: boolean, lights: readonly Light[] = []): Sprite {
  const src = alongX ? picture : recolor(picture, shaded);
  const by = alongX ? (x: number): number => Math.floor((x - PCX) / 2) : (x: number): number => Math.floor((PCX - x) / 2);
  const out = new Px(PW, PH);
  // (the shear is done by hand: a column moves down by `by`)
  for (let x = 0; x < PW; x++) {
    const k = by(x);
    for (let y = 0; y < PH; y++) {
      const c = src.get(x, y);
      if (c) out.set(x, y + k, c);
    }
  }
  const s = out.sprite(PCX, PFOOT, GRAIN);
  if (lights.length) s.lights = lights.map((l) => ({ ...l }));
  return s;
}

function recolor(p: Px, f: (c: string) => string): Px {
  const out = new Px(p.w, p.h);
  const memo = new Map<string, string>();
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.w; x++) {
      const c = p.get(x, y);
      if (!c) continue;
      let to = memo.get(c);
      if (!to) memo.set(c, (to = f(c)));
      out.set(x, y, to);
    }
  }
  return out;
}

/** Both faces of a wall piece. */
export interface WallPiece {
  left: Sprite;
  right: Sprite;
}
function wallPiece(paint: (p: Px) => void, lights: (alongX: boolean) => Light[] = () => []): WallPiece {
  const p = flat();
  paint(p);
  return { left: onFace(p, true, lights(true)), right: onFace(p, false, lights(false)) };
}

/** A raised shape cut in relief: lit on the edges that face the light (up and to the left), dark on those that face away. */
function relief(p: Px, r: Ramp, mask: (u: number, v: number) => boolean, u0: number, u1: number, v0: number, v1: number): void {
  for (let v = v0; v <= v1; v++) {
    for (let u = u0; u <= u1; u++) {
      if (!mask(u, v)) continue;
      const hi = !mask(u - 1, v) || !mask(u, v + 1);
      const lo = !mask(u + 1, v) || !mask(u, v - 1);
      p.set(fx(u), fy(v), hi && !lo ? r[3] : lo && !hi ? r[0] : hi && lo ? r[2] : r[2]);
      if (hi && !mask(u - 1, v + 1) && !lo) p.set(fx(u), fy(v), r[4]);
    }
  }
}
/** A shape cut into the stone: in shadow along the edges that face the light (the lip above them hides it), lit along the far ones. */
function sunk(p: Px, r: Ramp, mask: (u: number, v: number) => boolean, u0: number, u1: number, v0: number, v1: number, floor: string): void {
  for (let v = v0; v <= v1; v++) {
    for (let u = u0; u <= u1; u++) {
      if (!mask(u, v)) continue;
      const nearLit = !mask(u - 1, v) || !mask(u, v + 1);
      const nearDark = !mask(u + 1, v) || !mask(u, v - 1);
      p.set(fx(u), fy(v), nearLit ? r[0] : nearDark ? r[3] : floor);
    }
  }
}

/** THE FLOOR: a picture of one tile, a diamond 64 x 32, from what is at each (u, v) of it (0..1 along x and along y). Anchored at its top corner, as the floor's own tiles are. */
function onTile(paint: (u: number, v: number) => string | null): Sprite {
  const p = new Px(64, 32);
  for (let y = 0; y < 32; y++) {
    const hw = y < 16 ? 2 * y + 1 : 2 * (31 - y) + 1;
    for (let x = 32 - hw; x < 32 + hw; x++) {
      const px = x + 0.5 - 32;
      const py = y + 0.5;
      const u = (px / 32 + py / 16) / 2;
      const v = (py / 16 - px / 32) / 2;
      const c = paint(u, v);
      if (c) p.set(x, y, c);
    }
  }
  return p.sprite(32, 0, GRAIN);
}

/** The floor's own flagstone tones, for what is laid in it. */
const SLAB = THEME.slab;

/**
 * A FLAT PICTURE LAID ON THE FLOOR ALONG ITS LINES (as the fallen wordsmith is, art/props.ts): painted
 * as if lying along the screen, then each column slid down by half as far as it is across from the
 * middle, which is how a thing that lies along +x is seen. 64 x 56; anchored at the middle of its floor.
 */
const LW = 64;
const LH = 56;
function lying(paint: (p: Px, under: Px) => void, way: 1 | -1 = 1): Px {
  const p = new Px(LW, LH);
  const under = new Px(LW, LH);
  paint(p, under);
  const out = new Px(LW, LH);
  for (const src of [under, p]) {
    for (let x = 0; x < LW; x++) {
      const k = way * Math.floor((x - LW / 2) / 2);
      for (let y = 0; y < LH; y++) {
        const c = src.get(x, y);
        if (c) out.set(x, y + k, c);
      }
    }
  }
  return out;
}
const LCX = LW / 2;
const LCY = LH / 2;

// =================================================================================================
// WALL TILES: cut into a wall's face

/** A burial niche: an arched hollow in the wall, a skull and long bones laid in it, its sill worn. */
function niche(open: boolean): (p: Px) => void {
  return (p) => {
    const inArch = (u: number, v: number): boolean => Math.abs(u + 0.5) <= 9 && v >= 16 && (v <= 30 || (u + 0.5) ** 2 + ((v - 30) * 1.15) ** 2 <= 81);
    const rim = (u: number, v: number): boolean => Math.abs(u + 0.5) <= 11 && v >= 14 && (v <= 30 || (u + 0.5) ** 2 + ((v - 30) * 1.15) ** 2 <= 121);
    // the dressed rim round it, raised a little from the face
    relief(p, FACE, (u, v) => rim(u, v) && !inArch(u, v), -12, 11, 12, 46);
    // the sill, lit along its top
    for (let u = -11; u <= 10; u++) {
      p.set(fx(u), fy(15), FACE[4]);
      p.set(fx(u), fy(14), FACE[2]);
      p.set(fx(u), fy(13), FACE[0]);
    }
    if (open) {
      sunk(p, FACE, inArch, -10, 9, 16, 42, DEEP);
      // the hollow goes back into the dark; a skull at its mouth and long bones under it
      const bones = new Px(PW, PH);
      limb(bones, fx(-6), fy(17), fx(7), fy(18), 1.1, 1.1, NICHE_BONE);
      limb(bones, fx(-4), fy(19), fx(5), fy(17), 1, 1, NICHE_BONE);
      ball(bones, fx(-2), fy(22), 3.6, 3.2, NICHE_BONE);
      bones.set(fx(-3), fy(22), DEEP).set(fx(-1), fy(22), DEEP).set(fx(-2), fy(20), NICHE_BONE[0]);
      p.blit(bones, 0, 0);
    } else {
      // sealed: a slab set in it, the crown cut in its middle
      relief(p, FACE, inArch, -10, 9, 16, 42);
      const crown = (u: number, v: number): boolean => {
        const x = u + 0.5;
        if (v >= 24 && v <= 26 && Math.abs(x) <= 5) return true;
        if (v > 26 && v <= 31) return Math.abs(x) <= 5 && (Math.abs(x) >= 4 || (Math.abs(x) <= 1 && v <= 33)) ? true : Math.abs(x) <= 1;
        return false;
      };
      sunk(p, FACE, crown, -6, 5, 24, 33, FACE[1]);
      // (and its edge has come away at one corner)
      p.set(fx(7), fy(17), DEEP).set(fx(8), fy(17), DEEP).set(fx(8), fy(18), FACE[0]);
    }
  };
}

/** A barred window: a square hole in the wall, bars of the jailer's iron across it, dark behind. */
function grille(p: Px): void {
  const hole = (u: number, v: number): boolean => Math.abs(u + 0.5) <= 8 && v >= 22 && v <= 40;
  relief(p, FACE, (u, v) => Math.abs(u + 0.5) <= 10 && v >= 20 && v <= 42 && !hole(u, v), -11, 10, 19, 43);
  sunk(p, FACE, hole, -9, 8, 22, 40, DEEP);
  for (const u of [-6, -2, 2, 6]) {
    for (let v = 21; v <= 41; v++) {
      p.set(fx(u), fy(v), IRONS[3]);
      p.set(fx(u + 1), fy(v), IRONS[2]);
    }
  }
  for (const v of [26, 36]) {
    for (let u = -9; u <= 8; u++) {
      p.set(fx(u), fy(v), IRONS[3]);
      p.set(fx(u), fy(v - 1), IRONS[0]);
    }
  }
  // rust run down the stone from the bars' feet
  for (const u of [-6, 2]) for (let v = 16; v <= 20; v++) if (hash(u, v, 5) < 0.7) p.set(fx(u + 1), fy(v), OLD_RUST[2]);
}

/** The horned skull, cut proud of the wall: the jailer's mark. */
function hornedSkull(p: Px, mouthSlot = false): void {
  const skull = (u: number, v: number): boolean => {
    const x = u + 0.5;
    const y = v - 31;
    const cran = (x / 7) ** 2 + (y / 7.5) ** 2 <= 1 && y > -3;
    const jaw = Math.abs(x) <= 4.5 - (y < -3 ? (-3 - y) * 0.4 : 0) && y <= -2 && y >= -9;
    return cran || jaw;
  };
  const horn = (u: number, v: number): boolean => {
    // two horns sweeping out and up from the brow, thinning to their points
    for (const s of [-1, 1]) {
      for (let t = 0; t <= 1; t += 0.02) {
        const hx = s * (5 + 9 * t);
        const hy = 34 + 2 + 11 * t * t;
        const r = 2.4 * (1 - t) + 0.4;
        if ((u + 0.5 - hx) ** 2 + (v - hy) ** 2 <= r * r) return true;
      }
    }
    return false;
  };
  relief(p, FACE, (u, v) => horn(u, v), -16, 15, 30, 52);
  relief(p, FACE, skull, -8, 7, 20, 40);
  // the eyes and the nose, deep; the teeth
  const holes = (u: number, v: number): boolean => {
    const x = u + 0.5;
    return ((Math.abs(x) - 3) ** 2 + (v - 32) ** 2 <= 4.5) || (Math.abs(x) <= 1 && v >= 27 && v <= 28);
  };
  sunk(p, FACE, holes, -6, 5, 26, 35, DEEP);
  if (mouthSlot) {
    // (the dart wall's slot: its mouth a dark slit, the points of darts glinting in it)
    for (let u = -4; u <= 3; u++) {
      p.set(fx(u), fy(24), DEEP).set(fx(u), fy(23), DEEP);
      p.set(fx(u), fy(22), FACE[3]);
    }
    for (const u of [-3, 0, 3]) p.set(fx(u), fy(24), GLINT);
  } else {
    for (let u = -3; u <= 2; u++) if (u % 2 === 0) p.set(fx(u), fy(23), FACE[0]);
  }
}

/** The dead king's head in a roundel: a crowned face, its eyes shut, cut in a sunk round. */
function kingsHead(p: Px): void {
  const R = 12;
  const round = (u: number, v: number): boolean => (u + 0.5) ** 2 + (v - 33) ** 2 <= R * R;
  // the roundel's ring, raised, then its field, sunk
  relief(p, FACE, (u, v) => round(u, v) && (u + 0.5) ** 2 + (v - 33) ** 2 > (R - 2.2) ** 2, -13, 12, 20, 46);
  sunk(p, FACE, (u, v) => (u + 0.5) ** 2 + (v - 33) ** 2 <= (R - 2.2) ** 2, -10, 9, 23, 43, FACE[1]);
  // the head, raised in the field
  const head = (u: number, v: number): boolean => {
    const x = u + 0.5;
    const face = (x / 5) ** 2 + ((v - 30) / 6.4) ** 2 <= 1;
    const crown = v >= 35 && v <= 41 && Math.abs(x) <= 5.5 && (v <= 37 || Math.abs(x) >= 4.5 || Math.abs(x) <= 1 || (Math.abs(Math.abs(x) - 2.7) <= 0.6 && v <= 39));
    const beard = Math.abs(x) <= 3.5 - (24.5 - v) * 0.3 && v >= 22 && v < 26;
    return face || crown || beard;
  };
  relief(p, FACE, head, -7, 6, 21, 42);
  // its eyes shut, a line each; a line for the mouth
  for (const s of [-1, 1]) p.set(fx(s * 2 - (s < 0 ? 1 : 0)), fy(31), FACE[0]).set(fx(s * 2 - (s < 0 ? 1 : 0) + s), fy(31), FACE[0]);
  p.set(fx(-1), fy(27), FACE[0]).set(fx(0), fy(27), FACE[0]);
}

/** Where the stones fell in: a ragged hole in the face, dark behind, the fallen stones' edges broken. */
function fallenIn(p: Px): void {
  const hole = (u: number, v: number): boolean => {
    const x = u + 0.5;
    const r = 9 + 3 * (hash(Math.floor((Math.atan2(v - 28, x) + 4) * 2.2), 0, 7) - 0.5);
    return (x / 1.15) ** 2 + (v - 28) ** 2 <= r * r && v >= 16;
  };
  sunk(p, FACE, hole, -14, 13, 14, 42, DEEP);
  // a stone half out of its bed at the hole's edge, and the earth behind them
  relief(p, FACE, (u, v) => u >= 4 && u <= 11 && v >= 34 && v <= 39 && !(u === 11 && v === 34), 3, 12, 33, 40);
  for (let u = -8; u <= 8; u++) for (let v = 18; v <= 22; v++) if (hole(u, v) && hash(u, v, 9) < 0.35) p.set(fx(u), fy(v), '#1b1426');
}

// =================================================================================================
// FLOOR TILES

/** Where (u, v) is from a tile's middle, along x and along y. */
const mid = (u: number, v: number): [number, number] => [u - 0.5, v - 0.5];

/** A slab of its own, laid on the tile: its gap round it, its lit far edges and shaded near ones. */
function slabAt(u: number, v: number, x0: number, x1: number, y0: number, y1: number, body: string): string | null {
  if (u < x0 || u > x1 || v < y0 || v > y1) return null;
  const e = 0.035;
  if (u < x0 + e * 0.6 || v < y0 + e * 0.6 || u > x1 - e * 0.6 || v > y1 - e * 0.6) return THEME.mortar;
  if (u < x0 + e * 1.6 || v < y0 + e * 1.6) return SLAB[3];
  if (u > x1 - e * 1.6 || v > y1 - e * 1.6) return SLAB[0];
  return body;
}
/** The flagstones round a laid slab: the floor's own tones, in two stones. */
function around(u: number, v: number): string {
  if (Math.abs(u - 0.5) < 0.012 || Math.abs(v - 0.5) < 0.012 || u < 0.012 || v < 0.012) return THEME.mortar;
  return hash(Math.floor(u * 2), Math.floor(v * 2), 3) < 0.5 ? SLAB[1] : SLAB[2];
}

/** A ledger stone: a long slab over a grave, a sword cut along it, point toward the door of the room. */
function ledger(u: number, v: number): string | null {
  const s = slabAt(u, v, 0.06, 0.94, 0.2, 0.8, SLAB[2]);
  if (!s) return around(u, v);
  if (s !== SLAB[2]) return s;
  const [x, y] = mid(u, v);
  // the blade along x, the cross-guard, the grip and its pommel
  const blade = x > -0.18 && x < 0.36 && Math.abs(y) < 0.045 * (1 - Math.max(0, x - 0.2) / 0.16);
  const guard = Math.abs(x + 0.2) < 0.03 && Math.abs(y) < 0.14;
  const grip = x > -0.33 && x <= -0.2 && Math.abs(y) < 0.03;
  const pommel = (x + 0.36) ** 2 + (y / 1.4) ** 2 < 0.0012;
  if (blade || guard || grip || pommel) {
    // cut: dark on the side toward the light, its far edge lit
    return y < -0.015 ? THEME.mortar : y > 0.02 ? SLAB[3] : DEEP;
  }
  // (worn smooth down its middle where feet have gone over it)
  if (Math.abs(y) < 0.16 && hash(Math.floor(u * 24), Math.floor(v * 12), 11) < 0.12) return SLAB[3];
  return s;
}

/** A grave slab with an iron ring let into it, to lift it by. */
function ringSlab(u: number, v: number): string | null {
  const s = slabAt(u, v, 0.12, 0.88, 0.12, 0.88, SLAB[1]);
  if (!s) return around(u, v);
  if (s !== SLAB[1]) return s;
  const [x, y] = mid(u, v);
  const d = Math.hypot(x, y);
  // the ring's sunk bed, the ring in it (lit on the side of the light), its staple
  if (d < 0.13 && d > 0.08) return x + y < 0 ? IRONS[3] : IRONS[2];
  if (d <= 0.08 && d > 0.055) return THEME.mortar;
  if (Math.abs(x) < 0.03 && Math.abs(y + 0.1) < 0.03) return IRONS[0];
  if (hash(Math.floor(u * 20), Math.floor(v * 20), 12) < 0.05) return SLAB[0];
  return s;
}

/** The king's runner: a strip of his red cloth along x, worn through, its edges frayed. `end`: the piece where it ends, in a fringe. */
function runner(end: boolean): (u: number, v: number) => string | null {
  return (u, v) => {
    const [x, y] = mid(u, v);
    const fray = 0.02 * hash(Math.floor(u * 40), 0, 13);
    const inCloth = Math.abs(y) < 0.3 - fray && (!end || x < 0.22 + 0.04 * hash(Math.floor(v * 30), 1, 14));
    if (!inCloth) return around(u, v);
    // worn through to the stone in places
    if (hash(Math.floor(u * 8), Math.floor(v * 5), 15) < 0.035) return around(u, v);
    // its border: a darker band and a pale stitched line in it
    const b = 0.3 - Math.abs(y);
    if (b < 0.035) return WINE[0];
    if (b < 0.07) return Math.floor(u * 30) % 2 === 0 ? WINE[3] : WINE[2];
    // (the fringe at its end)
    if (end && x > 0.16) return Math.floor(v * 40) % 2 === 0 ? WINE[2] : null;
    // the cloth: worn paler down its middle
    return Math.abs(y) < 0.1 && hash(Math.floor(u * 8), Math.floor(v * 8), 16) < 0.4 ? WINE[3] : WINE[2];
  };
}

/** A drain: an iron grate in a square of stone, the dark under it. */
function drain(u: number, v: number): string | null {
  const s = slabAt(u, v, 0.18, 0.82, 0.18, 0.82, SLAB[1]);
  if (!s) return around(u, v);
  if (s !== SLAB[1]) return s;
  const [x, y] = mid(u, v);
  if (Math.abs(x) < 0.2 && Math.abs(y) < 0.2) {
    const bar = Math.abs(((x + 0.2) * 16) % 2 - 1) > 0.55 ? 'x' : Math.abs(((y + 0.2) * 16) % 2 - 1) > 0.55 ? 'y' : null;
    if (Math.abs(x) > 0.18 || Math.abs(y) > 0.18) return IRONS[2];
    if (bar === 'x') return IRONS[3];
    if (bar === 'y') return IRONS[2];
    return DEEP;
  }
  return s;
}

/** The crown laid in the floor: a round of paler stone, and the king's crown in it in dark stone. */
function inlay(u: number, v: number): string | null {
  const [x, y] = mid(u, v);
  const d = Math.hypot(x, y);
  if (d > 0.36) return around(u, v);
  if (d > 0.33) return THEME.mortar;
  if (d > 0.3) return x + y < 0 ? SLAB[3] : SLAB[1];
  // the crown, its band along y (a line across the screen to the left), its five points toward -x
  const band = Math.abs(x - 0.06) < 0.04 && Math.abs(y) < 0.17;
  const pts = x < 0.02 && x > -0.14 && Math.abs(y) < 0.17 && Math.abs(((y + 0.17) / 0.085) % 1 - 0.5) < 0.18 * (1 + (x + 0.14) / 0.16);
  if (band || pts) return THEME.mortar;
  return hash(Math.floor(u * 30), Math.floor(v * 30), 17) < 0.1 ? SLAB[2] : mix(SLAB[2], SLAB[3], 0.5);
}

/** A slab sunk into the grave under it: tipped, one edge down in the dark, a crack across it. */
function sunkSlab(u: number, v: number): string | null {
  const s = slabAt(u, v, 0.08, 0.92, 0.08, 0.92, SLAB[1]);
  if (!s) return around(u, v);
  const [x, y] = mid(u, v);
  // the gap it has opened along its far edge, dark
  if (u < 0.2 && s !== THEME.mortar) return u < 0.14 ? DEEP : THEME.mortar;
  // (tipped down toward that edge: darker toward it)
  if (Math.abs(x + y * 0.4 - 0.12) < 0.012) return DEEP;
  if (s !== SLAB[1]) return s;
  return x < -0.1 ? SLAB[0] : s;
}

// =================================================================================================
// ON THE WALLS: hung on a face

/** A long banner of his red cloth hanging from an iron rod, torn into tongues at its foot, the horned helm on it in old bone. */
function banner(rags: boolean): (p: Px) => void {
  return (p) => {
    const half = rags ? 5 : 9;
    const top = 54;
    const cloth = new Px(PW, PH);
    for (let u = -half; u <= half; u++) {
      const torn = rags ? 10 + Math.floor(hash(u, 1, 21) * 22) : 12 + Math.floor(hash(Math.floor(u / 3), 2, 22) * 9) + (Math.abs(u) % 3 === 1 ? 2 : 0);
      for (let v = torn; v <= top; v++) {
        // holes burnt and torn in it
        if (rags && hash(u, Math.floor(v / 3), 23) < 0.12 && v < top - 3) continue;
        // its folds: hanging in three soft folds, each lit on its left
        const f = ((u + half + 0.5) / (2 * half + 1)) * (rags ? 2 : 3);
        const fr = f - Math.floor(f);
        const c = fr < 0.2 ? WINE[3] : fr > 0.8 ? WINE[1] : WINE[2];
        cloth.set(fx(u), fy(v), v === torn ? WINE[1] : c);
      }
    }
    if (!rags) {
      // the horned helm on it, in old bone: a dome, the two horns, the dark of the face
      const hy = 36;
      for (let u = -4; u <= 3; u++) for (let v = hy - 4; v <= hy + 3; v++) if ((u + 0.5) ** 2 / 16 + (v - hy) ** 2 / 14 <= 1) cloth.set(fx(u), fy(v), OLD_BONE[2]);
      for (let v = hy - 4; v <= hy - 1; v++) cloth.set(fx(-1), fy(v), WINE[0]).set(fx(0), fy(v), WINE[0]);
      for (const s of [-1, 1]) for (let t = 0; t <= 1; t += 0.1) cloth.set(fx(Math.round(s * (4 + 3 * t) - (s < 0 ? 1 : 0))), fy(Math.round(hy + 1 + 5 * t * t)), OLD_BONE[3]);
      // a border along its sides
      for (let v = 16; v <= top - 2; v++) {
        cloth.set(fx(-half + 1), fy(v), WINE[4]);
        cloth.set(fx(half - 1), fy(v), WINE[0]);
      }
    }
    p.blit(cloth, 0, 0);
    // the rod it hangs from, out past it each side, a knob at each end; the hooks into the wall
    for (let u = -half - 3; u <= half + 3; u++) {
      p.set(fx(u), fy(top + 1), IRONS[3]);
      p.set(fx(u), fy(top), IRONS[0]);
    }
    for (const u of [-half - 3, half + 3]) p.set(fx(u), fy(top + 2), IRONS[3]).set(fx(u), fy(top - 1), IRONS[0]);
  };
}

/** A shield on the wall: a heater of his red, rimmed in iron, the horned helm on it. */
function shield(p: Px): void {
  const inside = (u: number, v: number): boolean => {
    const x = u + 0.5;
    const y = v - 26;
    if (y > 12 || y < -14) return false;
    if (y >= 0) return Math.abs(x) <= 9;
    return Math.abs(x) <= 9 * Math.sqrt(Math.max(0, 1 - (y / 14) ** 2));
  };
  for (let v = 10; v <= 40; v++) {
    for (let u = -10; u <= 10; u++) {
      if (!inside(u, v)) continue;
      const edge = !inside(u - 1, v) || !inside(u + 1, v) || !inside(u, v + 1) || !inside(u, v - 1);
      const x = u + 0.5;
      p.set(fx(u), fy(v), edge ? (x < 0 || v >= 37 ? IRONS[3] : IRONS[0]) : x < -3 ? WINE[3] : x > 4 ? WINE[1] : WINE[2]);
    }
  }
  // a band of iron down it and across, and the helm where they cross
  for (let v = 13; v <= 37; v++) p.set(fx(0), fy(v), IRONS[2]);
  for (let u = -8; u <= 7; u++) p.set(fx(u), fy(31), IRONS[2]);
  ball(p, fx(0), fy(31), 3.4, 3, OLD_BONE);
  for (const s of [-1, 1]) for (let t = 0; t <= 1; t += 0.12) p.set(fx(Math.round(s * (3 + 3 * t)) - (s < 0 ? 1 : 0)), fy(Math.round(32 + 4 * t * t)), OLD_BONE[3]);
  p.set(fx(-1), fy(30), DEEP).set(fx(0), fy(30), DEEP);
}

/** A ring of the jailer's keys on an iron hook. */
function keysOnHook(p: Px): void {
  // the hook
  for (let v = 40; v <= 44; v++) p.set(fx(0), fy(v), SMALL_IRON[3]);
  p.set(fx(1), fy(40), SMALL_IRON[2]).set(fx(1), fy(39), SMALL_IRON[2]).set(fx(0), fy(44), GLINT);
  // the ring hanging from it
  for (let a = 0; a < Math.PI * 2; a += 0.1) {
    const u = Math.round(Math.cos(a) * 4);
    const v = Math.round(36 + Math.sin(a) * 3.4);
    p.set(fx(u), fy(v), a > Math.PI * 0.6 && a < Math.PI * 1.6 ? SMALL_IRON[3] : SMALL_IRON[2]);
  }
  // three keys on it, hanging: a bow, a shank, a bit
  const key = (u0: number, lean: number, len: number): void => {
    for (let k = 0; k <= len; k++) {
      const u = Math.round(u0 + lean * k);
      p.set(fx(u), fy(33 - k), k === 0 ? SMALL_IRON[3] : SMALL_IRON[2]);
    }
    const ue = Math.round(u0 + lean * len);
    p.set(fx(ue + 1), fy(33 - len), SMALL_IRON[2]).set(fx(ue + 1), fy(34 - len), SMALL_IRON[2]).set(fx(ue + 2), fy(33 - len), SMALL_IRON[0]);
    p.set(fx(ue), fy(32 - len), GLINT);
  };
  key(-3, -0.15, 11);
  key(0, 0, 13);
  key(3, 0.2, 9);
}

/** Shackles on the wall: two ring bolts, chains hanging from them, the cuffs at their ends. */
function shackles(p: Px): void {
  for (const s of [-1, 1]) {
    const u0 = s * 8;
    // the ring bolt
    ball(p, fx(u0), fy(44), 2, 2, SMALL_IRON);
    p.set(fx(u0), fy(44), DEEP);
    // the chain: links, every other one on its edge
    const len = s < 0 ? 16 : 11;
    for (let k = 1; k <= len; k++) {
      const u = u0 + Math.round(Math.sin(k * 0.25) * (s < 0 ? 1 : -1));
      if (k % 2) {
        p.set(fx(u - 1), fy(44 - k), SMALL_IRON[3]).set(fx(u + 1), fy(44 - k), SMALL_IRON[0]);
      } else p.set(fx(u), fy(44 - k), SMALL_IRON[2]);
    }
    // the cuff: a broad open ring
    const v = 44 - len - 3;
    for (let a = 0; a < Math.PI * 2; a += 0.15) {
      const uu = Math.round(u0 + Math.cos(a) * 3);
      const vv = Math.round(v + Math.sin(a) * 2.4);
      p.set(fx(uu), fy(vv), Math.cos(a) < 0 ? SMALL_IRON[3] : SMALL_IRON[0]);
    }
    p.set(fx(u0 + 3), fy(v), OLD_RUST[2]);
  }
}

/** A torch in an iron sconce: frame `f` of four. */
function torch(f: number): (p: Px) => void {
  return (p) => {
    // the bracket out of the wall, and its cup
    for (let v = 26; v <= 31; v++) p.set(fx(0), fy(v), IRONS[2]);
    p.set(fx(1), fy(28), IRONS[0]);
    for (let u = -2; u <= 2; u++) p.set(fx(u), fy(32), IRONS[3]);
    for (let u = -2; u <= 2; u++) p.set(fx(u), fy(33), IRONS[2]);
    // the torch: wood, its head wrapped, the fire on it
    for (let v = 33; v <= 42; v++) p.set(fx(-1), fy(v), TIMBER[3]).set(fx(0), fy(v), TIMBER[2]).set(fx(1), fy(v), TIMBER[0]);
    for (let v = 41; v <= 44; v++) for (let u = -2; u <= 2; u++) p.set(fx(u), fy(v), u < 0 ? COAL[3] : COAL[2]);
    const flames: ReadonlyArray<readonly [number, number, number]> = [[11, 3.2, 1], [13, 3, -1], [10, 3.4, 2], [12, 3, -2]];
    const [h, w, lean] = flames[f % 4];
    tongue(p, fx(0), fy(45), h, w, lean, EMBER);
    p.set(fx(lean > 0 ? 2 : -2), fy(45 + h + 2), EMBER[3]);
  };
}

/** Two of the jailer's mauls crossed on the wall, heads up, an iron clasp where they cross. */
function crossedMauls(p: Px): void {
  for (const s of [-1, 1]) {
    // the haft, from low on one side to high on the other
    const u0 = s * 9;
    const u1 = -s * 8;
    limb(p, fx(u0), fy(14), fx(u1), fy(44), 1.2, 1.2, TIMBER);
    // the head: a block of iron across the haft's top
    const hx = fx(u1);
    const hy = fy(46);
    lit(p, IRONS, [1, 2], [1, 2], (l) => l.poly([[hx - 5, hy - 2], [hx + 4, hy - 4], [hx + 6, hy + 1], [hx - 3, hy + 4]], INK));
  }
  ball(p, fx(0), fy(29), 2.4, 2.4, IRONS);
  p.set(fx(-1), fy(30), GLINT);
}

/** A horned helm hung on a peg. */
function helmOnPeg(p: Px): void {
  for (let u = -1; u <= 1; u++) p.set(fx(u), fy(28), TIMBER[2]);
  ball(p, fx(0), fy(34), 6, 6.4, IRONS);
  // the opening for the face: dark, its rim lit
  for (let v = 29; v <= 34; v++) for (let u = -2; u <= 2; u++) p.set(fx(u), fy(v), DEEP);
  for (let u = -3; u <= 3; u++) p.set(fx(u), fy(35), IRONS[3]);
  // the horns, bone, curling out and up
  for (const s of [-1, 1]) {
    for (let t = 0; t <= 1; t += 0.05) {
      const u = Math.round(s * (5 + 6 * t) - (s < 0 ? 1 : 0));
      const v = Math.round(37 + 9 * t * t);
      p.set(fx(u), fy(v), t > 0.8 ? OLD_BONE[4] : OLD_BONE[3]);
      if (t < 0.6) p.set(fx(u), fy(v - 1), OLD_BONE[2]);
    }
  }
  p.set(fx(-3), fy(39), GLINT);
}

// =================================================================================================
// STANDING THINGS, built on the grid; anchored at the middle of their tile.

/** A box of one ramp: top lightest, its screen-left side lit, its screen-right side in shade. */
function block(iso: Iso, r: Ramp, x0: number, y0: number, x1: number, y1: number, z0: number, z1: number): void {
  iso.box(x0, y0, x1, y1, z0, z1, { top: () => r[3], left: litSide(r), right: shadeSide(r) });
}
function litSide(r: Ramp): SideShader {
  return (u, v, _w, h) => (v === 0 ? r[3] : v >= h - 1 ? r[1] : u === 0 ? r[3] : r[2]);
}
function shadeSide(r: Ramp): SideShader {
  return (_u, v, _w, h) => (v === 0 ? r[2] : v >= h - 1 ? r[0] : mix(r[0], r[2], 0.4));
}

/** The soft shadow under a standing thing, a little to the lower right (art/rulebook: Pixels 7). */
function footShadow(p: Px, cx: number, cy: number, rx: number, ry: number): void {
  p.ellipse(cx + 2, cy + 1, rx, ry, THEME.mortar);
}

/** A SARCOPHAGUS along x: a plinth, the chest of it with a sunk panel on each side, a gabled lid. `open`: the lid slid half off, the dark and bones inside. */
function sarcophagus(open: boolean): Sprite {
  const W = 96;
  const H = 80;
  const ox = 48;
  const oy = 52;
  const base = new Px(W, H);
  const body = new Px(W, H);
  const lid = new Px(W, H);
  const iso = new Iso(body, ox, oy);
  block(new Iso(base, ox, oy), STONE, -0.48, -0.27, 0.48, 0.27, 0, 5);
  const A = 0.43;
  const B = 0.22;
  const TOP = 24;
  const panel = (lit_: boolean): SideShader => (u, v, w, h) => {
    if (v === 0) return lit_ ? STONE[3] : STONE[2];
    if (v >= h - 1) return lit_ ? STONE[1] : STONE[0];
    const inPanel = u >= 3 && u <= w - 4 && v >= 3 && v <= h - 4;
    if (!inPanel) return lit_ ? (u === 0 ? STONE[3] : STONE[2]) : mix(STONE[0], STONE[2], 0.4);
    // the panel sunk: its top and its edge toward the light in shadow, its far edge lit
    if (v === 3 || u === 3) return lit_ ? STONE[1] : STONE[0];
    if (v === h - 4 || u === w - 4) return lit_ ? STONE[3] : STONE[2];
    // (a crown cut in the long side's panel)
    if (lit_ && Math.abs(u - w / 2) < 6 && v >= h / 2 - 3 && v <= h / 2 + 2 && (v >= h / 2 || Math.abs(u - w / 2) % 3 < 1)) return STONE[1];
    return lit_ ? STONE[2] : mix(STONE[0], STONE[2], 0.25);
  };
  iso.box(-A, -B, A, B, 5, TOP, { top: () => STONE[3], left: panel(true), right: panel(false) });
  if (!open) {
    gabled(new Iso(lid, ox, oy), -A - 0.03, A + 0.03, -B - 0.03, B + 0.03, TOP, 4, 7, true);
  } else {
    // the dark inside, and bones in it; the lid slid off toward +x, one end down on the plinth
    const ii = new Iso(body, ox, oy);
    ii.top(-A + 0.04, -B + 0.04, A - 0.04, B - 0.04, TOP, (u) => (u < 0.06 ? STONE[1] : DEEP));
    const [sx, sy] = ii.at(-0.1, 0, TOP);
    limb(body, sx - 8, sy + 1, sx + 6, sy - 2, 1, 1, OLD_BONE);
    ball(body, sx - 10, sy, 2.6, 2.2, OLD_BONE);
    gabled(new Iso(lid, ox, oy), -A + 0.36, A + 0.42, -B - 0.05, B + 0.01, TOP, 4, 7, false);
  }
  return compose(base, [body, lid], null).sprite(ox, oy, GRAIN);
}

/** A gabled lid along x: a slab `slab` high, a ridge `rise` higher, the slope toward +y seen and lit; a long cross cut along it (`cross`). */
function gabled(iso: Iso, x0: number, x1: number, y0: number, y1: number, z: number, slab: number, rise: number, cross: boolean): void {
  block(iso, STONE, x0, y0, x1, y1, z, z + slab);
  const ym = (y0 + y1) / 2;
  iso.slopeLeft(x0, x1, y1, z + slab, x0, x1, ym, z + slab + rise, (t, s) => {
    if (t > 0.9) return STONE[4];
    if (cross && Math.abs(t - 0.45) < 0.12 && s > 0.12 && s < 0.88) return STONE[1];
    if (cross && Math.abs(s - 0.25) < 0.025 && t > 0.15 && t < 0.8) return STONE[1];
    return t < 0.12 ? STONE[2] : STONE[3];
  });
  // the gable's end, toward +x: a triangle in shade
  iso.right(x1, y0, y1, z + slab, z + slab + rise, (u, v, w, h) => {
    const k = Math.abs((u + 0.5) / w - 0.5) * 2;
    return v >= h * k ? (v === Math.ceil(h * k) ? STONE[2] : mix(STONE[0], STONE[2], 0.4)) : null;
  });
}

/** THE KING'S TOMB: a sarcophagus with his effigy lying on it in stone, crowned, his hands on a sword. */
function effigyTomb(): Sprite {
  const W = 96;
  const H = 90;
  const ox = 48;
  const oy = 60;
  const base = new Px(W, H);
  const body = new Px(W, H);
  const king = new Px(W, H);
  block(new Iso(base, ox, oy), STONE, -0.5, -0.29, 0.5, 0.29, 0, 6);
  block(new Iso(body, ox, oy), STONE, -0.45, -0.24, 0.45, 0.24, 6, 24);
  block(new Iso(body, ox, oy), STONE, -0.47, -0.26, 0.47, 0.26, 24, 28);
  // the effigy: built of rounded blocks along x, head toward -x on a cushion
  const k = new Iso(king, ox, oy);
  const E: Ramp = [STONE[0], STONE[1], mix(STONE[2], STONE[3], 0.4), STONE[4], mix(STONE[4], '#ffffff', 0.2)];
  block(k, E, -0.42, -0.12, -0.27, 0.12, 28, 32); // the cushion
  block(k, E, -0.24, -0.13, 0.22, 0.13, 28, 37); // the body in its robe
  block(k, E, 0.22, -0.1, 0.4, 0.1, 28, 34); // the legs and feet
  block(k, E, 0.36, -0.1, 0.42, -0.01, 34, 40); // the feet, up
  block(k, E, 0.36, 0.01, 0.42, 0.1, 34, 40);
  // the head and its crown
  const [hx, hy] = k.at(-0.33, 0, 38);
  ball(king, hx, hy - 1, 6, 5.2, E);
  for (let i = -2; i <= 2; i++) {
    const [cx, cy] = k.at(-0.4, i * 0.035, 39);
    king.set(Math.round(cx), Math.round(cy) - 1, E[4]).set(Math.round(cx), Math.round(cy), E[3]);
  }
  // the sword down his body, its hilt under his folded hands
  const [s0x, s0y] = k.at(-0.18, 0, 37.5);
  const [s1x, s1y] = k.at(0.34, 0, 35);
  king.line(Math.round(s0x), Math.round(s0y), Math.round(s1x), Math.round(s1y), E[4]);
  king.line(Math.round(s0x), Math.round(s0y) + 1, Math.round(s1x), Math.round(s1y) + 1, E[1]);
  const [gx, gy] = k.at(-0.12, 0, 38);
  king.line(Math.round(gx) - 3, Math.round(gy) - 1, Math.round(gx) + 3, Math.round(gy) + 2, E[1]);
  ball(king, Math.round(gx) - 2, Math.round(gy) - 2, 2.2, 2, E);
  return compose(base, [body, king], null).sprite(ox, oy, GRAIN);
}

/** A HORNED KNIGHT IN STONE: on a plinth, his maul planted head-down before him, both hands on its haft. */
function knightStatue(): Sprite {
  const W = 56;
  const H = 150;
  const ox = 28;
  const oy = 128;
  const base = new Px(W, H);
  const fig = new Px(W, H);
  const front = new Px(W, H);
  block(new Iso(base, ox, oy), STONE, -0.3, -0.3, 0.3, 0.3, 0, 12);
  block(new Iso(base, ox, oy), STONE, -0.27, -0.27, 0.27, 0.27, 12, 15);
  const S: Ramp = [STONE[0], STONE[1], STONE[2], STONE[3], STONE[4]];
  const foot = oy - 15;
  // legs in greaves, the long surcoat over them, the body, the shoulders
  lit(fig, S, [1, 3], [1, 4], (l) => {
    l.rect(ox - 8, foot - 22, 6, 22, INK);
    l.rect(ox + 2, foot - 22, 6, 22, INK);
    l.poly([[ox - 11, foot - 18], [ox + 11, foot - 18], [ox + 9, foot - 48], [ox - 9, foot - 48]], INK);
    l.poly([[ox - 12, foot - 46], [ox + 12, foot - 46], [ox + 10, foot - 64], [ox - 10, foot - 64]], INK);
  });
  ball(fig, ox - 11, foot - 61, 5.4, 4.6, S);
  ball(fig, ox + 11, foot - 61, 5.4, 4.6, S, 0.2);
  // the horned helm
  ball(fig, ox, foot - 72, 6.4, 7.2, S);
  for (let v = 0; v < 5; v++) fig.hline(ox - 2, foot - 72 + v, 4, STONE[0]);
  for (const s of [-1, 1]) {
    for (let t = 0; t <= 1; t += 0.04) {
      const x = Math.round(ox + s * (5 + 8 * t));
      const y = Math.round(foot - 75 - 10 * t * t);
      fig.set(x, y, t > 0.85 ? STONE[4] : s < 0 ? STONE[3] : STONE[2]);
      fig.set(x, y + 1, s < 0 ? STONE[2] : STONE[1]);
      if (t < 0.5) fig.set(x, y + 2, STONE[1]);
    }
  }
  // the maul, head on the plinth before him, its haft up to his hands
  limb(front, ox, foot - 6, ox, foot - 46, 1.6, 1.4, S);
  lit(front, S, [1, 2], [1, 3], (l) => l.rect(ox - 7, foot - 9, 14, 9, INK));
  // his hands on the haft, the arms down to them
  limb(front, ox - 10, foot - 58, ox - 3, foot - 46, 2.6, 2.2, S);
  limb(front, ox + 10, foot - 58, ox + 3, foot - 45, 2.6, 2.2, S);
  ball(front, ox, foot - 46, 4, 3, S);
  // old and broken: a horn's tip gone, a chip from the surcoat's hem
  fig.erase(ox + 12, foot - 84).erase(ox + 13, foot - 84);
  fig.set(ox - 9, foot - 19, STONE[0]).set(ox - 8, foot - 19, STONE[0]);
  return compose(base, [fig, front], null).sprite(ox, oy, GRAIN);
}

/** THE FLOOR'S PILLAR: the vault's round shaft of drums, with two bands of the jailer's iron round it and a head carved with horns. 48 x 112. */
function pillar(): Sprite {
  const W = 48;
  const H = 112;
  const cx = 24;
  const oy = 94;
  const blocks = new Px(W, H);
  const shaft = new Px(W, H);
  const head = new Px(W, H);
  const SQ = 0.22;
  const FOOT = 9;
  const TOP = 64;
  const SLAB_Z = 70;
  new Iso(blocks, cx, oy).box(-SQ, -SQ, SQ, SQ, 0, FOOT, { top: () => STONE[3], left: plainSide(THEME.lit[2], THEME.lit[4], THEME.lit[1]), right: plainSide(THEME.shade[2], THEME.shade[4], THEME.shade[1]) });
  lit(shaft, STONE, ROUND_HI, ROUND_LO, (l) => l.rect(cx - 9, oy - TOP, 18, TOP - FOOT, INK));
  for (let y = oy - TOP + 17; y < oy - FOOT - 9; y += 17) for (let x = cx - 9; x < cx + 9; x++) shaft.set(x, y + Math.round(1.2 * (1 - ((x + 0.5 - cx) / 9) ** 2)), THEME.lit[0]);
  // the bands of iron, each with a rivet catching the light
  for (const y of [oy - 24, oy - 50]) {
    hoop(shaft, cx, y, 9.6, 3, 1.2, IRONS);
    shaft.set(cx - 4, y + 2, GLINT);
  }
  // the head: a swelling, its slab, and the horns that curl out from under the slab
  lit(head, STONE, [1, 3], [1, 4], (l) => column(l, cx, oy - SLAB_Z - 1, oy - TOP + 1, (t) => 13 - 3 * t));
  new Iso(head, cx, oy).box(-SQ, -SQ, SQ, SQ, SLAB_Z, SLAB_Z + 6, { top: (u, v) => (u < 0.1 || v < 0.1 ? STONE[3] : STONE[4]), left: plainSide(THEME.lit[2], THEME.lit[4], THEME.lit[1]), right: plainSide(THEME.shade[2], THEME.shade[4], THEME.shade[1]) });
  for (const s of [-1, 1]) {
    for (let t = 0; t <= 1; t += 0.05) {
      const x = Math.round(cx + s * (11 + 7 * t));
      const y = Math.round(oy - TOP - 2 - 10 * t * t);
      const th = Math.round(3 * (1 - t)) + 1;
      for (let q = 0; q < th; q++) head.set(x, y + q, q === 0 ? (s < 0 ? STONE[4] : STONE[3]) : q === th - 1 ? STONE[1] : STONE[2]);
    }
  }
  return compose(null, [blocks, shaft, head], null).sprite(cx, oy, GRAIN);
}

/** A CRESSET: an iron basket of fire on a pole on three feet, its rim set with horns: frame `f` of four. */
function cresset(f: number): Sprite {
  const W = 40;
  const H = 110;
  const cx = 20;
  const foot = 100;
  const iron = new Px(W, H);
  const fire = new Px(W, H);
  const under = new Px(W, H);
  footShadow(under, cx, foot, 11, 4);
  limb(iron, cx - 1, foot - 10, cx - 10, foot - 1, 1.4, 1.2, IRONS);
  limb(iron, cx + 1, foot - 10, cx + 10, foot - 1, 1.4, 1.2, IRONS);
  limb(iron, cx, foot - 9, cx + 2, foot - 4, 1.2, 1, IRONS);
  limb(iron, cx, foot - 8, cx, foot - 62, 1.6, 1.6, IRONS);
  // the basket: hoops and staves, drawn in under its rim
  lit(iron, IRONS, [1, 2], [1, 3], (l) => column(l, cx, foot - 74, foot - 62, (t) => 10 - 5 * t));
  for (let x = cx - 9; x <= cx + 9; x += 3) for (let y = foot - 73; y < foot - 63; y++) if (iron.has(x, y)) iron.set(x, y, COAL[2]);
  iron.ellipse(cx, foot - 74, 10, 2.6, IRONS[3]);
  iron.ellipse(cx, foot - 74, 8.5, 1.8, COAL[0]);
  for (let x = cx - 7; x <= cx + 7; x++) if (hash(x, f, 31) < 0.6) iron.set(x, foot - 74, hash(x, f, 32) < 0.4 ? EMBER[2] : COAL[3]);
  // two horns from the rim
  for (const s of [-1, 1]) for (let t = 0; t <= 1; t += 0.08) iron.set(Math.round(cx + s * (10 + 3 * t)), Math.round(foot - 75 - 8 * t * t), t > 0.8 ? OLD_BONE[4] : OLD_BONE[3]);
  const F: ReadonlyArray<ReadonlyArray<readonly [number, number, number, number]>> = [
    [[0, 20, 5.6, 2], [-5, 11, 3, -2], [5, 9, 2.8, 1]],
    [[1, 17, 5.4, -2], [5, 13, 3.2, 2], [-5, 8, 2.6, -1]],
    [[0, 21, 5.6, -3], [-4, 9, 3, -2], [6, 11, 2.8, 1]],
    [[-1, 16, 5.2, 2], [-6, 12, 3, -1], [4, 8, 2.8, 2]],
  ];
  for (const [dx, h, w, lean] of F[f % 4]) tongue(fire, cx + dx, foot - 74, h, w, lean, EMBER);
  fire.set(cx + [-5, 6, -2, 4][f % 4], foot - 98 + (f % 2), EMBER[3]);
  const s = compose(under, [iron], fire).sprite(cx, foot, GRAIN);
  s.lights = [{ x: cx / GRAIN, y: (foot - 84) / GRAIN, r: 14 + (f % 2), color: EMBER[2], a: 0.5 }];
  return s;
}

/** A RACK OF MAULS: a frame of old timber along x, three of the jailer's mauls stood in it, heads down. */
function maulRack(): Sprite {
  const W = 88;
  const H = 100;
  const ox = 44;
  const oy = 78;
  const back = new Px(W, H);
  const front = new Px(W, H);
  const iso = new Iso(back, ox, oy);
  for (const x of [-0.42, 0.36]) block(iso, TIMBER, x, -0.06, x + 0.06, 0.06, 0, 48);
  block(iso, TIMBER, -0.44, -0.07, 0.44, 0.03, 44, 48);
  block(iso, TIMBER, -0.44, 0.04, 0.44, 0.1, 6, 9);
  const fi = new Iso(front, ox, oy);
  for (const [x, lean] of [[-0.25, 0.04], [0, -0.03], [0.24, 0.05]] as const) {
    // the head on the floor in front of the low rail, the haft up to the top rail
    block(fi, IRONS, x - 0.07, 0.1, x + 0.07, 0.22, 0, 9);
    const [ax, ay] = fi.at(x, 0.16, 9);
    const [bx, by] = fi.at(x + lean, -0.02, 50);
    limb(front, ax, ay, bx, by, 1.2, 1.2, TIMBER);
  }
  return compose(back, [front], null).sprite(ox, oy, GRAIN);
}

/** THE KING'S THRONE: on two steps, facing down the screen to the left (+y), a high back crowned with horns. */
function throne(): Sprite {
  const W = 96;
  const H = 150;
  const ox = 48;
  const oy = 112;
  const steps = new Px(W, H);
  const seat = new Px(W, H);
  const crownL = new Px(W, H);
  const s = new Iso(steps, ox, oy);
  block(s, STONE, -0.5, -0.5, 0.5, 0.5, 0, 6);
  block(s, STONE, -0.4, -0.42, 0.4, 0.38, 6, 11);
  const t = new Iso(seat, ox, oy);
  // the back: a tall slab along x at the far side
  t.box(-0.32, -0.38, 0.32, -0.26, 11, 80, {
    top: () => STONE[4],
    left: (u, v, w, h) => {
      if (v === 0 || u === 0) return STONE[4];
      if (v >= h - 1) return STONE[1];
      // a sunk panel with the horned crown carved high in it
      const inP = u > 4 && u < w - 5 && v > 6 && v < h - 22;
      if (!inP) return u >= w - 1 ? STONE[2] : STONE[3];
      if (u === 5 || v === 7) return STONE[1];
      const cu = u - w / 2;
      if (v > 14 && v < 22 && Math.abs(cu) < 8 && (v > 19 || Math.abs(Math.abs(cu) - 4) < 1.2 || Math.abs(cu) < 1)) return STONE[1];
      return STONE[2];
    },
    right: shadeSide(STONE),
  });
  // the seat and its two arms
  block(t, STONE, -0.3, -0.26, 0.3, 0.2, 11, 30);
  block(t, STONE, -0.32, -0.26, -0.22, 0.24, 30, 40);
  block(t, STONE, 0.22, -0.26, 0.32, 0.24, 30, 40);
  // the horns on the top of its back
  const [tx, ty] = t.at(0, -0.32, 80);
  for (const sd of [-1, 1]) {
    for (let k = 0; k <= 1; k += 0.03) {
      const x = Math.round(tx + sd * (8 + 12 * k));
      const y = Math.round(ty - 2 - 14 * k * k);
      const th = Math.round(3.4 * (1 - k)) + 1;
      for (let q = 0; q < th; q++) seat.set(x, y + q, q === 0 ? (k > 0.85 ? STONE[4] : STONE[3]) : q === th - 1 ? STONE[1] : STONE[2]);
    }
  }
  // an old crown of iron left on the seat
  const [cx, cy] = t.at(0.02, -0.04, 30);
  lit(crownL, SMALL_IRON, [1, 2], [1, 2], (l) => {
    l.rect(Math.round(cx) - 5, Math.round(cy) - 3, 10, 3, INK);
    for (const d of [-5, -2, 1, 4]) l.rect(Math.round(cx) + d, Math.round(cy) - 6, 1, 3, INK);
  });
  crownL.set(Math.round(cx) - 4, Math.round(cy) - 3, GLINT);
  return compose(steps, [seat, crownL], null).sprite(ox, oy, GRAIN);
}

/** THE KING'S COFFER (the game's chest): old timber covered in his red, bound in iron. 56 x 64 at (28, 48). */
const COFFER: TrunkLook = { a: 0.4, b: 0.26, rim: 14, rise: 8, wood: TIMBER, lid: WINE, metal: IRONS, stone: null, planks: [7] };
function coffer(open: boolean): Sprite {
  return trunk(56, 64, 28, 48, COFFER, open).sprite(28, 48, GRAIN);
}

// =================================================================================================
// BREAKABLES (the game's barrel and urn): round, standing at the middle of their foot

/** A tall funeral urn with its lid, dark glazed, a band of red round its shoulder. 32 x 52 at (16, 46). */
function tallUrn(): Sprite {
  const W = 32;
  const H = 52;
  const cx = 16;
  const foot = 46;
  const top = 9;
  const body = new Px(W, H);
  const under = new Px(W, H);
  footShadow(under, cx, foot, 9, 3);
  const half = (t: number): number => (t < 0.1 ? 6 : t < 0.18 ? 4.6 : t < 0.45 ? 4.6 + 5.6 * Math.sin(((t - 0.18) / 0.27) * (Math.PI / 2)) : t > 0.93 ? 6 : 10.2 - 4.6 * ((t - 0.45) / 0.48) ** 1.5);
  lit(body, ASH_CLAY, [0, 3], [0, 4], (l) => column(l, cx, top, foot - 1, half));
  hoop(body, cx, top + 13, half(0.4) + 0.2, 2, 1.3, WINE);
  // the lid and its knob
  body.ellipse(cx, top, 6, 1.8, ASH_CLAY[3]);
  ball(body, cx, top - 3, 2.6, 2.4, ASH_CLAY);
  // (a chip off its lip, and a crack down its belly)
  body.set(cx + 5, top + 1, INK);
  for (let y = top + 18; y < top + 27; y++) body.set(cx + 3 + Math.round(Math.sin(y) * 0.6), y, ASH_CLAY[0]);
  return compose(under, [body], null).sprite(cx, foot, GRAIN);
}

/** A squat urn with two handles, its mouth open. 36 x 40 at (18, 34). */
function squatUrn(): Sprite {
  const W = 36;
  const H = 40;
  const cx = 18;
  const foot = 34;
  const top = 11;
  const body = new Px(W, H);
  const under = new Px(W, H);
  footShadow(under, cx, foot, 11, 3);
  const half = (t: number): number => (t < 0.12 ? 7 : t < 0.5 ? 7 + 5 * Math.sin(((t - 0.12) / 0.38) * (Math.PI / 2)) : 12 - 5 * ((t - 0.5) / 0.5) ** 1.4);
  lit(body, ASH_CLAY, [0, 3], [0, 4], (l) => column(l, cx, top, foot - 1, half));
  // the handles: loops on its shoulders
  for (const s of [-1, 1]) {
    for (let a = 0; a < Math.PI; a += 0.15) {
      const x = Math.round(cx + s * (11 + Math.sin(a) * 3));
      const y = Math.round(top + 4 + Math.cos(a) * 3);
      body.set(x, y, s < 0 ? ASH_CLAY[3] : ASH_CLAY[1]);
    }
  }
  body.ellipse(cx, top, 7, 2, ASH_CLAY[3]);
  body.ellipse(cx, top + 0.4, 5.6, 1.3, DEEP);
  hoop(body, cx, top + 6, half(0.3), 1, 1.2, WINE);
  hoop(body, cx, top + 9, half(0.42), 1, 1.2, WINE);
  return compose(under, [body], null).sprite(cx, foot, GRAIN);
}

/** A bone box: a small coffin of old timber with a gabled lid, iron at its corners, a skull cut on its side. On the grid. 48 x 44 at (24, 32). */
function boneBox(): Sprite {
  const W = 48;
  const H = 44;
  const ox = 24;
  const oy = 32;
  const box = new Px(W, H);
  const under = new Px(W, H);
  footShadow(under, ox, oy + 2, 15, 6);
  const iso = new Iso(box, ox, oy);
  const A = 0.22;
  const B = 0.14;
  iso.box(-A, -B, A, B, 0, 12, {
    top: () => TIMBER[3],
    left: (u, v, w, h) => {
      if (u <= 1 || u >= w - 2) return IRONS[u <= 1 ? 3 : 2];
      if (v === 0) return TIMBER[3];
      if (v >= h - 1) return TIMBER[1];
      // the skull, small, cut in the middle of the long side
      const cu = u - w / 2;
      if (Math.abs(cu) < 3 && v > 2 && v < 8) return Math.abs(cu) < 2 && v < 7 ? (v === 4 && Math.abs(cu) === 1 ? DEEP : OLD_BONE[2]) : OLD_BONE[1];
      return v === 6 ? TIMBER[1] : TIMBER[2];
    },
    right: (u, v, w, h) => (u <= 1 || u >= w - 2 ? IRONS[1] : v === 0 ? TIMBER[2] : v >= h - 1 ? TIMBER[0] : mix(TIMBER[0], TIMBER[2], 0.4)),
  });
  // the lid: low and gabled, of the same timber
  const lid = new Iso(box, ox, oy);
  lid.slopeLeft(-A - 0.02, A + 0.02, B + 0.02, 12, -A - 0.02, A + 0.02, 0, 17, (t) => (t > 0.85 ? TIMBER[4] : t < 0.15 ? TIMBER[2] : TIMBER[3]));
  lid.right(A + 0.02, -B - 0.02, B + 0.02, 12, 17, (u, v, w, h) => {
    const k = Math.abs((u + 0.5) / w - 0.5) * 2;
    return v >= h * k ? mix(TIMBER[0], TIMBER[2], 0.4) : null;
  });
  return compose(under, [box], null).sprite(ox, oy, GRAIN);
}

/** A jar whose lid is a skull. 28 x 44 at (14, 38). */
function skullJar(): Sprite {
  const W = 28;
  const H = 44;
  const cx = 14;
  const foot = 38;
  const top = 16;
  const body = new Px(W, H);
  const head = new Px(W, H);
  const under = new Px(W, H);
  footShadow(under, cx, foot, 8, 3);
  const half = (t: number): number => (t < 0.1 ? 5 : 5 + 3.6 * Math.sin(Math.min(1, (t - 0.1) / 0.5) * (Math.PI / 2)) - (t > 0.6 ? (t - 0.6) * 6 : 0));
  lit(body, ASH_CLAY, [0, 3], [0, 4], (l) => column(l, cx, top, foot - 1, half));
  hoop(body, cx, top + 10, half(0.45), 1, 1.2, OLD_BONE);
  ball(head, cx, top - 5, 5, 5, OLD_BONE);
  head.set(cx - 2, top - 5, DEEP).set(cx - 1, top - 5, DEEP).set(cx + 2, top - 5, DEEP).set(cx + 1, top - 5, DEEP);
  head.set(cx, top - 3, OLD_BONE[1]);
  head.hline(cx - 2, top - 1, 5, OLD_BONE[2]);
  return compose(under, [body, head], null).sprite(cx, foot, GRAIN);
}

/** What a broken urn leaves: its shards, and its ash spilled. Lying; at the middle of its floor. */
function urnShards(): Sprite {
  const p = lying((l, under) => {
    under.ellipse(LCX + 2, LCY + 2, 15, 5, THEME.mortar);
    under.ellipse(LCX - 2, LCY + 1, 12, 4, ASH[0]);
    for (let i = 0; i < 40; i++) {
      const x = LCX - 12 + Math.floor(hash(i, 1, 41) * 22);
      const y = LCY - 2 + Math.floor(hash(i, 2, 41) * 6);
      under.set(x, y, hash(i, 3, 41) < 0.5 ? ASH[1] : ASH[2]);
    }
    for (const [x, y, w, h] of [[LCX + 4, LCY - 3, 6, 3], [LCX - 10, LCY + 1, 5, 2], [LCX + 9, LCY + 2, 4, 2], [LCX - 3, LCY + 3, 3, 2]] as const) {
      lit(l, ASH_CLAY, [0, 2], [0, 2], (q) => q.poly([[x, y + h], [x + 1, y], [x + w, y + 1], [x + w - 1, y + h]], INK));
      l.set(x + 1, y + h - 1, WINE[2]);
    }
  });
  return p.sprite(LCX, LCY, GRAIN);
}

/** What a broken bone box leaves: splinters of its timber, and the bones that were in it. */
function boxSplinters(): Sprite {
  const p = lying((l, under) => {
    under.ellipse(LCX + 2, LCY + 2, 16, 5, THEME.mortar);
    for (const [x0, y0, x1, y1] of [[LCX - 12, LCY, LCX - 3, LCY - 2], [LCX + 2, LCY + 3, LCX + 12, LCY + 1], [LCX - 6, LCY + 3, LCX, LCY + 4]] as const) limb(l, x0, y0, x1, y1, 1.2, 1, TIMBER);
    limb(l, LCX - 4, LCY - 1, LCX + 6, LCY - 3, 1.1, 1.1, OLD_BONE);
    ball(l, LCX + 9, LCY - 3, 2.6, 2.3, OLD_BONE);
    l.set(LCX + 8, LCY - 3, DEEP);
    l.set(LCX - 12, LCY + 1, IRONS[3]).set(LCX - 11, LCY + 1, IRONS[2]);
  });
  return p.sprite(LCX, LCY, GRAIN);
}

// =================================================================================================
// ON THE FLOOR: lying along its lines, at the middle of their floor

/** A fallen guard: a skeleton in the jailer's iron, a helm rolled from its skull, its spear broken by it. */
function fallenGuard(): Sprite {
  const p = lying((l, under) => {
    under.ellipse(LCX + 2, LCY + 2, 25, 7, THEME.mortar);
    // the legs: bones, then iron greaves
    limb(l, LCX + 8, LCY - 1, LCX + 20, LCY - 3, 1.3, 1.1, OLD_BONE);
    limb(l, LCX + 8, LCY + 3, LCX + 19, LCY + 5, 1.3, 1.1, OLD_BONE);
    limb(l, LCX + 18, LCY - 3, LCX + 24, LCY - 4, 2, 1.8, IRONS);
    limb(l, LCX + 17, LCY + 5, LCX + 23, LCY + 6, 2, 1.8, IRONS);
    // the breastplate over the ribs
    lit(l, IRONS, [1, 2], [1, 3], (q) => q.poly([[LCX - 8, LCY - 4], [LCX + 6, LCY - 5], [LCX + 9, LCY + 1], [LCX + 6, LCY + 5], [LCX - 8, LCY + 5]], INK));
    for (let x = LCX - 6; x < LCX + 6; x += 3) l.set(x, LCY, IRONS[0]);
    // an arm out, its hand by the spear
    limb(l, LCX - 4, LCY - 4, LCX - 4, LCY - 12, 1.1, 1, OLD_BONE);
    // the skull, and the helm rolled off it
    ball(l, LCX - 12, LCY, 3.6, 3.4, OLD_BONE);
    l.set(LCX - 13, LCY - 1, DEEP).set(LCX - 11, LCY - 1, DEEP);
    ball(l, LCX - 19, LCY - 6, 4, 3.4, IRONS);
    for (const s of [-1, 1]) l.set(LCX - 19 + s * 4, LCY - 9, OLD_BONE[3]).set(LCX - 19 + s * 5, LCY - 10, OLD_BONE[4]);
    // the spear, broken in two
    l.line(LCX - 22, LCY - 13, LCX - 6, LCY - 15, TIMBER[3]);
    l.line(LCX - 22, LCY - 12, LCX - 6, LCY - 14, TIMBER[1]);
    l.line(LCX + 1, LCY - 13, LCX + 12, LCY - 12, TIMBER[3]);
    l.poly([[LCX + 12, LCY - 13], [LCX + 17, LCY - 12], [LCX + 12, LCY - 11]], IRONS[3]);
  });
  return p.sprite(LCX, LCY, GRAIN);
}

/** Keys dropped on the floor: a ring with two on it, a third flung a little way off. */
function droppedKeys(): Sprite {
  const p = lying((l, under) => {
    under.ellipse(LCX + 1, LCY + 1, 9, 3, THEME.mortar);
    l.ellipse(LCX - 2, LCY, 4, 2.4, SMALL_IRON[3]);
    l.ellipse(LCX - 2, LCY, 3, 1.4, THEME.slab[1]);
    l.line(LCX + 1, LCY + 1, LCX + 8, LCY + 2, SMALL_IRON[2]);
    l.set(LCX + 8, LCY + 3, SMALL_IRON[2]).set(LCX + 7, LCY + 3, SMALL_IRON[2]);
    l.line(LCX - 5, LCY + 1, LCX - 10, LCY + 4, SMALL_IRON[2]);
    l.set(LCX - 10, LCY + 5, SMALL_IRON[2]);
    l.line(LCX + 11, LCY - 4, LCX + 17, LCY - 5, SMALL_IRON[3]);
    l.ellipse(LCX + 10, LCY - 4, 1.6, 1.2, SMALL_IRON[2]);
    l.set(LCX + 4, LCY + 1, GLINT);
  });
  return p.sprite(LCX, LCY, GRAIN);
}

/** A banner fallen and crumpled, its rod still in its hem. */
function fallenBanner(): Sprite {
  const p = lying((l, under) => {
    under.ellipse(LCX + 2, LCY + 2, 22, 7, THEME.mortar);
    lit(l, WINE, [1, 2], [1, 3], (q) => q.poly([[LCX - 20, LCY - 3], [LCX - 6, LCY - 6], [LCX + 4, LCY - 3], [LCX + 18, LCY - 5], [LCX + 21, LCY + 2], [LCX + 10, LCY + 6], [LCX - 2, LCY + 4], [LCX - 18, LCY + 5]], INK));
    for (const [x0, y0, x1, y1] of [[LCX - 12, LCY - 3, LCX - 4, LCY + 3], [LCX + 6, LCY - 2, LCX + 12, LCY + 4]] as const) l.line(x0, y0, x1, y1, WINE[1]);
    // the corner of its helm showing in a fold
    ball(l, LCX - 1, LCY, 2.4, 2, OLD_BONE);
    // (torn tongues at its foot end)
    for (let k = 0; k < 4; k++) l.line(LCX + 18 + k, LCY - 3 + k * 2, LCX + 24 + k, LCY - 2 + k * 2, WINE[2]);
    l.line(LCX - 22, LCY - 5, LCX - 22, LCY + 7, IRONS[3]);
  });
  return p.sprite(LCX, LCY, GRAIN);
}

/** The effigy's head broken off and lying on its side, its crown chipped. */
function effigyHead(): Sprite {
  const W = 40;
  const H = 32;
  const p = new Px(W, H);
  const under = new Px(W, H);
  footShadow(under, 20, 22, 11, 4);
  ball(p, 18, 17, 8, 6.4, STONE);
  // the crown, along its side; the face turned up and to the left, eyes shut
  for (let i = 0; i < 5; i++) p.set(26, 11 + i * 2, STONE[4]).set(27, 11 + i * 2, STONE[3]).set(26, 12 + i * 2, STONE[2]);
  p.line(24, 10, 24, 22, STONE[1]);
  p.set(14, 15, STONE[0]).set(15, 15, STONE[0]).set(14, 19, STONE[0]).set(15, 19, STONE[0]);
  p.set(11, 17, STONE[1]);
  // the break at its neck
  for (let y = 13; y < 22; y++) p.set(10 - Math.round(hash(y, 1, 51) * 2), y, STONE[1]);
  return compose(under, [p], null).sprite(20, 20, GRAIN);
}

/** A horned helm lying on its side. */
function droppedHelm(): Sprite {
  const W = 40;
  const H = 32;
  const p = new Px(W, H);
  const horns = new Px(W, H);
  const under = new Px(W, H);
  footShadow(under, 20, 22, 10, 4);
  ball(p, 20, 18, 7, 6, IRONS);
  for (let y = 15; y <= 20; y++) p.hline(14, y, 4, DEEP);
  p.vline(18, 14, 8, IRONS[3]);
  for (let t = 0; t <= 1; t += 0.05) {
    horns.set(Math.round(22 + 8 * t), Math.round(12 - 6 * t * t), t > 0.8 ? OLD_BONE[4] : OLD_BONE[3]);
    horns.set(Math.round(25 + 6 * t), Math.round(22 + 4 * t * t), OLD_BONE[2]);
  }
  return compose(under, [p, horns], null).sprite(20, 20, GRAIN);
}

/** Candles in their old wax, burning: frame `f` of four. */
export function candles(f: number, flames = true): Sprite {
  const W = 48;
  const H = 48;
  const cx = 24;
  const cy = 36;
  const wax = new Px(W, H);
  const fire = new Px(W, H);
  wax.ellipse(cx, cy, 15, 5, WAX[1]);
  wax.ellipse(cx - 1, cy - 1, 12, 3.6, WAX[2]);
  for (let i = 0; i < 6; i++) wax.set(cx - 10 + Math.floor(hash(i, 1, 61) * 20), cy - 2 + Math.floor(hash(i, 2, 61) * 4), WAX[3]);
  const sticks: ReadonlyArray<readonly [number, number, number]> = [[-8, 0, 10], [-2, -2, 15], [5, 1, 8], [9, -2, 12], [1, 3, 6]];
  sticks.forEach(([dx, dy, h], i) => {
    const x = cx + dx;
    const y = cy + dy;
    lit(wax, WAX, [0, 1], [0, 2], (l) => l.rect(x - 1, y - h, 3, h, INK));
    wax.set(x - 1, y - h, WAX[4]);
    // a wick, and a small flame; one has gone out
    if (i === 4) {
      wax.set(x, y - h - 1, INK);
      return;
    }
    const lean = [0, 1, 0, -1][(f + i) % 4];
    if (!flames) {
      wax.set(x, y - h - 1, INK);
      return;
    }
    tongue(fire, x, y - h - 1, 4 + ((f + i) % 2), 1.4, lean, EMBER);
  });
  const s = compose(null, [wax], fire).sprite(cx, cy, GRAIN);
  if (flames) s.lights = [{ x: cx / GRAIN, y: (cy - 16) / GRAIN, r: 10 + (f % 2), color: EMBER[2], a: 0.38 }];
  return s;
}

/** A chain lying in loose coils. */
function coiledChain(): Sprite {
  const p = lying((l, under) => {
    under.ellipse(LCX + 1, LCY + 1, 13, 4, THEME.mortar);
    for (let a = 0; a < Math.PI * 5; a += 0.32) {
      const r = 3 + a * 0.6;
      const x = Math.round(LCX + Math.cos(a) * r * 1.4);
      const y = Math.round(LCY + Math.sin(a) * r * 0.5);
      if (Math.floor(a / 0.32) % 2) l.set(x, y, SMALL_IRON[3]).set(x + 1, y, SMALL_IRON[2]);
      else l.set(x, y, SMALL_IRON[2]).set(x, y + 1, SMALL_IRON[0]);
    }
    for (let k = 0; k < 9; k++) l.set(LCX + 15 + k, LCY - 1 + (k % 2), k % 2 ? SMALL_IRON[2] : SMALL_IRON[3]);
    l.set(LCX - 6, LCY - 2, OLD_RUST[2]).set(LCX + 4, LCY + 2, OLD_RUST[2]);
  });
  return p.sprite(LCX, LCY, GRAIN);
}

// =================================================================================================
// TRAPS

/** The spike floor's tile: an iron grate let into the stone, a hole under each of the nine spikes; `glint`, the warning. Anchored at the middle, as the game's holes are. */
function spikeGrate(glint: boolean): Sprite {
  const t = onTile((u, v) => {
    const [x, y] = mid(u, v);
    if (Math.abs(x) > 0.46 || Math.abs(y) > 0.46) return around(u, v);
    if (Math.abs(x) > 0.43 || Math.abs(y) > 0.43) return x + y < -0.4 ? IRONS[3] : IRONS[1];
    // the nine holes, each in its square of the grate
    const cx = Math.round(x * 3) / 3;
    const cy = Math.round(y * 3) / 3;
    const d = Math.hypot(x - cx, (y - cy) * 1);
    if (d < 0.05) return glint ? (d < 0.025 ? '#d8d4ff' : IRONS[3]) : DEEP;
    if (d < 0.075) return IRONS[0];
    const bar = Math.abs(((x + 0.5) * 3) % 1 - 0.5) < 0.08 || Math.abs(((y + 0.5) * 3) % 1 - 0.5) < 0.08;
    return bar ? IRONS[3] : IRONS[2];
  });
  // (the tile's own picture is anchored at its top corner; the game's holes at its middle)
  return { ...t, ay: t.ay + 8 };
}

/** The dart wall's plate: a square slab with the crown cut in it; `pressed`, sunk flush. Anchored at the middle. */
function crownPlate(pressed: boolean): Sprite {
  const up = pressed ? 0 : 2;
  const t = onTile((u, v) => {
    const [x, y] = mid(u, v);
    if (Math.abs(x) > 0.36 || Math.abs(y) > 0.36) return around(u, v);
    if (Math.abs(x) > 0.33 || Math.abs(y) > 0.33) return THEME.mortar;
    if (!pressed && (x > 0.29 || y > 0.29)) return SLAB[0];
    if (x < -0.28 || y < -0.28) return pressed ? SLAB[1] : SLAB[3];
    const band = Math.abs(x - 0.06) < 0.035 && Math.abs(y) < 0.14;
    const pts = x < 0.03 && x > -0.11 && Math.abs(y) < 0.14 && Math.abs(((y + 0.14) / 0.07) % 1 - 0.5) < 0.22;
    if (band || pts) return pressed ? SLAB[0] : THEME.mortar;
    return pressed ? SLAB[1] : SLAB[2];
  });
  return { ...t, ay: t.ay + 8 + up / GRAIN };
}

// =================================================================================================
// DOORS AND GATES

/**
 * THE DOOR'S LEAF on this floor: heavy planks of old timber bound in the jailer's iron, studded,
 * a great lock. As the game's leaf (art/gates.ts, makeDoorLeaf): from its hinge (the anchor, on the
 * floor) to its free end, (ex, ey) picture pixels away along the floor.
 */
export function tombLeaf(ex: number, ey: number, high = 56): Sprite {
  const pad = 6;
  const w = Math.abs(ex) + pad * 2;
  const h = high + Math.abs(ey) + pad * 2;
  const p = new Px(w, h);
  const ox = ex >= 0 ? pad : pad - ex;
  const oy = high + pad + (ey < 0 ? -ey : 0);
  const at = (t: number, up: number): [number, number] => [Math.round(ox + ex * t), Math.round(oy + ey * t - up)];
  const steps = Math.max(Math.abs(ex), 1);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const [x, y] = at(t, 0);
    // planks: a joint every fifth of its width
    const joint = Math.abs((t * 5) % 1) < 1 / steps * 1.2 && t > 0.05 && t < 0.95;
    for (let up = 0; up < high; up++) {
      let c = joint ? TIMBER[1] : t < 0.04 ? TIMBER[3] : TIMBER[2];
      // its iron: bands across it, the studs on them
      const band = (up >= 8 && up <= 11) || (up >= high - 13 && up <= high - 10) || (up >= Math.round(high * 0.46) && up <= Math.round(high * 0.46) + 2);
      if (band) c = up === 8 || up === high - 13 || up === Math.round(high * 0.46) ? IRONS[3] : IRONS[2];
      if (band && i % 6 === 3 && (up === 9 || up === high - 12)) c = GLINT;
      if (up === high - 1) c = TIMBER[3];
      if (up === 0) c = TIMBER[0];
      p.set(x, y - up, c);
    }
  }
  // the lock: a plate on the free end, its keyhole, a ring
  const [lx, ly] = at(0.84, Math.round(high * 0.46) - 6);
  p.rect(lx - 3, ly - 8, 7, 11, IRONS[2]);
  p.hline(lx - 3, ly - 9, 7, IRONS[3]);
  p.vline(lx - 4, ly - 8, 11, IRONS[3]);
  p.set(lx, ly - 4, DEEP).set(lx, ly - 3, DEEP).set(lx, ly - 2, DEEP);
  p.set(lx - 1, ly + 4, IRONS[3]).set(lx, ly + 5, IRONS[2]).set(lx + 1, ly + 4, IRONS[2]);
  return p.sprite(ox, oy, GRAIN);
}

/** The crest over this floor's gates: a round of stone, the horned skull cut in it (where the game's gates have none). A wall piece, as the arch it is set in. */
function gateCrest(p: Px): void {
  const R = 11;
  relief(p, FACE, (u, v) => (u + 0.5) ** 2 + (v - 30) ** 2 <= R * R, -12, 11, 18, 42);
  const skull = (u: number, v: number): boolean => {
    const x = u + 0.5;
    return ((x / 4.4) ** 2 + ((v - 31) / 4.6) ** 2 <= 1) || (Math.abs(x) <= 2.6 && v >= 24 && v < 28);
  };
  sunk(p, FACE, skull, -6, 5, 23, 36, FACE[1]);
  for (const s of [-1, 1]) for (let t = 0; t <= 1; t += 0.06) p.set(fx(Math.round(s * (4 + 5 * t)) - (s < 0 ? 1 : 0)), fy(Math.round(33 + 5 * t * t)), FACE[0]);
}

/** The boss's gate on this floor: its arch's keystone carries the king's crown, cut and burning with the Warden's fire (his embers: the enemy's colours, on the enemy's gate). */
function bossCrest(lit_: boolean): (p: Px) => void {
  return (p) => {
    const R = 13;
    relief(p, FACE, (u, v) => (u + 0.5) ** 2 + (v - 32) ** 2 <= R * R, -14, 13, 18, 46);
    const crown = (u: number, v: number): boolean => {
      const x = u + 0.5;
      if (v >= 25 && v <= 28 && Math.abs(x) <= 7) return true;
      if (v > 28 && v <= 37 && Math.abs(x) <= 7) {
        const tooth = Math.abs(x) >= 6 || Math.abs(x) <= 1 || Math.abs(Math.abs(x) - 3.5) <= 0.8;
        return tooth && v <= (Math.abs(x) <= 1 ? 38 : 35);
      }
      return false;
    };
    const ember: Ramp = ['#3a0c2a', '#3a0c2a', '#7a1058', '#c0206a', '#ff4f8a'];
    for (let v = 24; v <= 39; v++) {
      for (let u = -8; u <= 7; u++) {
        if (!crown(u, v)) continue;
        p.set(fx(u), fy(v), lit_ ? (crown(u, v + 1) && crown(u, v - 1) ? '#fff0a0' : '#ffb070') : ember[(u + v) % 2 ? 2 : 1]);
      }
    }
  };
}

// =================================================================================================
// QUESTS

/** The Warden's horn, broken from his helm where he fell: the trophy the armourer asked for. A glint on it, so it reads as a thing to take. */
function wardenHorn(): Sprite {
  const W = 44;
  const H = 32;
  const p = new Px(W, H);
  const under = new Px(W, H);
  const over = new Px(W, H);
  footShadow(under, 22, 22, 13, 4);
  // a great curved horn of bone, its broken root ringed in his cracked iron
  for (let t = 0; t <= 1; t += 0.01) {
    const x = 9 + 26 * t;
    const y = 20 - 12 * t * t + 2 * t;
    const r = 3.4 * (1 - t) + 0.6;
    for (let dy = -r; dy <= r; dy += 0.5) {
      const yy = Math.round(y + dy);
      const tone = dy < -r * 0.3 ? OLD_BONE[3] : dy > r * 0.4 ? OLD_BONE[1] : OLD_BONE[2];
      p.set(Math.round(x), yy, t > 0.9 ? OLD_BONE[4] : tone);
    }
  }
  lit(p, IRONS, [1, 2], [1, 2], (l) => l.poly([[5, 16], [11, 15], [12, 24], [6, 25]], INK));
  // the crack in its iron with his fire gone out of it, and the glint
  p.set(8, 18, '#5a1c1c').set(9, 20, '#5a1c1c').set(8, 22, '#5a1c1c');
  over.set(30, 10, '#ffffff').set(29, 10, GOLD[4]).set(31, 10, GOLD[4]).set(30, 9, GOLD[4]).set(30, 11, GOLD[4]);
  return compose(under, [p], over).sprite(22, 20, GRAIN);
}

// =================================================================================================
// MOMENTS AROUND YOU (the owner, 10 Oct 2026, 07:52: "I’d also like a couple environmental things
// happening around you for immersion unique for each floor.  Something shifts above you and dust
// comes down, you spook a pack of birds and they fly off,  a root shrivels as you walk by.  That
// sort of stuff"). Floor 1's, the tomb's, each a short film; when each plays, and where, is the main
// chat's. As big and as weighty as they can be (Animations 1): the stone falls hard and bounces,
// the rats bolt.

export interface Moment {
  name: string;
  /** Its frames, and how many a second. */
  frames: Sprite[];
  fps: number;
}

/** DUST AND A FALLING STONE: something shifts above, grit sifts down, then a stone drops, strikes the floor, bounces, breaks, and the dust rolls out. Anchored where it strikes. 16 frames at 15 a second. */
function stoneFalls(): Moment {
  const W = 120;
  const H = 300;
  const cx = 60;
  const floor = 280;
  const top = 6;
  const frames: Sprite[] = [];
  const N = 18;
  const LAND = 8;
  /** A broken stone, its corners about (x, y), `k` its size. */
  const chunk = (p: Px, x: number, y: number, k: number, seed: number): void =>
    lit(p, STONE, [1, 2], [1, 3], (l) =>
      l.poly(
        [
          [x - 6 * k, y - 4 * k],
          [x + (1 + hash(seed, 1, 83)) * 2 * k, y - 7 * k],
          [x + 7 * k, y - 1 * k],
          [x + 4 * k, y + 5 * k],
          [x - 5 * k, y + 4 * k],
        ],
        INK,
      ),
    );
  for (let f = 0; f < N; f++) {
    const p = new Px(W, H);
    const over = new Px(W, H);
    // the grit: a stream two grains wide, falling the whole time, thinning as it ends
    const grains = f < 13 ? 44 - f * 3 : 0;
    for (let i = 0; i < grains; i++) {
      const sp = 0.55 + hash(i, 1, 81) * 0.45;
      const y = top + ((hash(i, 2, 81) * (floor - top) + f * 26 * sp) % (floor - top));
      const x = cx - 4 + Math.round(hash(i, 3, 81) * 8 + Math.sin(y * 0.05 + i) * 1.5);
      const c = hash(i, 4, 81) < 0.5 ? STONE[3] : STONE[4];
      p.set(x, Math.round(y), c).set(x, Math.round(y) + 1, STONE[2]);
    }
    // the stone: falls faster and faster from the dark above, strikes, bounces, and breaks
    if (f >= 2 && f < LAND) {
      const t = (f - 2) / (LAND - 2);
      const y = top + 10 + (floor - 16 - top) * t * t;
      chunk(p, cx, y, 1.7, 1);
      // (streaks above it, it falls so fast)
      if (t > 0.3) for (const dx of [-5, 0, 5]) for (let k = 10; k < 10 + 30 * t; k += 3) p.set(cx + dx, Math.round(y - k), STONE[2]);
    } else if (f >= LAND) {
      const k = f - LAND;
      // the big half bounces, the small one rolls away, chips fly out in arcs
      const hop = [0, 12, 16, 10, 0, 4, 0][Math.min(k, 6)];
      chunk(p, cx - 6, floor - 6 - hop, 1.3, 2);
      const roll = Math.min(k, 6) * 3;
      if (k >= 1) chunk(p, cx + 10 + roll, floor - 4, 0.8, 3);
      for (let c = 0; c < 6 && k < 9; c++) {
        const a = -Math.PI * (0.15 + 0.7 * hash(c, 1, 84));
        const v = 7 + 5 * hash(c, 2, 84);
        const tt = k * 0.9;
        const x = Math.round(cx + Math.cos(a) * v * tt * 1.4);
        const y = Math.round(floor - 3 + Math.sin(a) * v * tt + 1.6 * tt * tt);
        if (y <= floor + 2) p.rect(x, y, 2, 2, c % 2 ? STONE[3] : STONE[2]);
      }
      // the dust rolling out from the blow, wider and thinner each frame, then gone
      if (k < 10) {
        const r = 10 + k * 6;
        const n = 130 - k * 11;
        for (let i = 0; i < n; i++) {
          const a = hash(i, 5, 82) * Math.PI * 2;
          const rr = r * (0.45 + hash(i, 6, 82) * 0.55);
          const x = Math.round(cx + Math.cos(a) * rr * 1.7);
          const y = Math.round(floor - 3 + Math.sin(a) * rr * 0.6 - k * hash(i, 7, 82) * 2.5);
          over.set(x, y, i % 3 === 0 ? STONE[4] : STONE[3]);
          if (i % 2 === 0) over.set(x + 1, y, STONE[2]);
        }
      }
      // the crack in the floor where it struck
      p.line(cx - 10, floor + 1, cx + 2, floor + 3, THEME.mortar);
      p.line(cx + 2, floor + 3, cx + 9, floor + 1, THEME.mortar);
      p.line(cx - 3, floor + 2, cx - 6, floor + 6, THEME.mortar);
    }
    frames.push(compose(null, [p], over).sprite(cx, floor, GRAIN));
  }
  return { name: 'dust and a falling stone', frames, fps: 15 };
}

/** RATS BOLT: three rats that were feeding on the bones run from the hero, along the floor up the screen to the left, into a burial niche at the wall's foot. Anchored at the niche's mouth. 14 frames at 20 a second. */
function ratsBolt(): Moment {
  const W = 200;
  const H = 120;
  const ax = 170;
  const ay = 30;
  const FUR: Ramp = ['#1e1a2c', '#1e1a2c', '#544a68', '#82789a', '#a298bc'];
  const frames: Sprite[] = [];
  const N = 14;
  const rats = [{ d0: 0.0, lane: 0, speed: 1.0 }, { d0: 0.18, lane: 7, speed: 1.12 }, { d0: 0.34, lane: -6, speed: 0.95 }];
  for (let f = 0; f < N; f++) {
    const p = new Px(W, H);
    for (const [i, r] of rats.entries()) {
      // how far along it is: from 150 picture pixels down the floor's line to the niche
      const s = Math.max(0, 1 - (f / (N - 3)) * r.speed - r.d0 * 0.1);
      if (s <= 0.02) continue;
      const dist = s * 150 + r.d0 * 30;
      const x = ax - dist + r.lane;
      const y = ay + dist / 2 + r.lane * 0.3;
      // a rat seen running toward the upper left: body, head ahead with its snout, a long tail behind
      const leg = (f + i) % 2;
      ball(p, x, y, 6.5, 3.8, FUR);
      ball(p, x + 6, y - 2, 3.2, 2.5, FUR);
      p.set(x + 9, y - 3, FUR[1]).set(x + 7, y - 4, '#c4bcd8').set(x + 7, y - 2, DEEP);
      p.set(x + 4, y - 4, FUR[4]);
      for (let k = 0; k < 9; k++) p.set(Math.round(x - 5 - k), Math.round(y + 1 + k * 0.4 + Math.sin(k * 0.9 + f) * 1), FUR[3]);
      // legs: a blur of them under it
      p.set(x - 2 + leg, y + 3, FUR[0]).set(x + 3 - leg, y + 3, FUR[0]);
      // dust kicked up behind
      if (f % 2 === 0) p.set(Math.round(x - 7), Math.round(y + 3), STONE[2]);
    }
    frames.push(p.sprite(ax, ay, GRAIN));
  }
  return { name: 'rats bolt', frames, fps: 20 };
}

/** A CANDLE GUTTERS OUT in a draught as the hero passes: the flames lean hard over, flare, and the tallest goes out, a curl of smoke rising off its wick. 12 frames at 12 a second. Laid over the candles. */
function candleGutters(): Moment {
  const frames: Sprite[] = [];
  for (let f = 0; f < 12; f++) {
    const W = 48;
    const H = 72;
    const cx = 24;
    const cy = 60;
    const fire = new Px(W, H);
    const smoke = new Px(W, H);
    // the candles' places as in candles(): only the flames are drawn here
    const sticks: ReadonlyArray<readonly [number, number, number]> = [[-8, 0, 10], [-2, -2, 15], [5, 1, 8], [9, -2, 12]];
    sticks.forEach(([dx, dy, h], i) => {
      const x = cx + dx;
      const y = cy - 24 + dy;
      const gust = f < 3 ? 3 + f * 2 : f < 7 ? 8 - (f - 3) : 3;
      if (i === 1 && f >= 5) {
        // out: the smoke curls up off the wick, thinning
        for (let k = 0; k < 10 + (f - 5) * 3; k++) {
          const sy = y - h - 2 - k;
          const sx = Math.round(x + Math.sin(k * 0.45 + f * 0.7) * 2 + k * 0.15);
          if (hash(k, f, 91) < 0.8 - k * 0.02) smoke.set(sx, sy, k < 6 ? '#5a5474' : '#3c3858');
        }
        return;
      }
      tongue(fire, x, y - h - 1, (i === 1 ? 7 - Math.max(0, f - 2) : 5) + (f % 2), 1.6, gust * (i === 1 ? 1.4 : 1), EMBER);
    });
    const s = compose(null, [], fire);
    s.blit(smoke, 0, 0);
    const sp = s.sprite(cx, cy - 24, GRAIN);
    sp.lights = [{ x: cx / GRAIN, y: (cy - 40) / GRAIN, r: f < 5 ? 11 : 8, color: EMBER[2], a: f < 5 ? 0.42 : 0.3 }];
    frames.push(sp);
  }
  return { name: 'a candle gutters out', frames, fps: 12 };
}

let moments: Moment[] | null = null;
/** Floor 1's moments around the hero, made the first time they are asked for and kept. */
export function wardenMoments(): Moment[] {
  return moments ?? (moments = [stoneFalls(), ratsBolt(), candleGutters()]);
}

// =================================================================================================
// THE SET

export type PieceKind = 'wall tile' | 'floor tile' | 'breakable' | 'broken' | 'on the wall' | 'on the floor' | 'obstacle' | 'door' | 'gate' | 'trap' | 'quest';

/** One of the floor's pieces: its name, what of the game it is, and its pictures (frames where it moves; a wall piece's on each face). */
export interface Piece {
  name: string;
  kind: PieceKind;
  /** Standing or lying pictures, or a floor tile's: frames. */
  frames?: Sprite[];
  /** A wall piece: frames on the face turned to screen-left, and on the one turned to screen-right. */
  left?: Sprite[];
  right?: Sprite[];
}

function wallSet(paint: (p: Px) => void, frames = 1, light?: (f: number) => (alongX: boolean) => Light[]): { left: Sprite[]; right: Sprite[] } {
  const left: Sprite[] = [];
  const right: Sprite[] = [];
  for (let f = 0; f < frames; f++) {
    const w = wallPiece(frames > 1 ? (paint as unknown as (f: number) => (p: Px) => void)(f) : paint, light ? light(f) : undefined);
    left.push(w.left);
    right.push(w.right);
  }
  return { left, right };
}

let made: Piece[] | null = null;

/** THE WARDEN'S FLOOR, every piece, painted the first time they are asked for and kept. */
export function wardenPieces(): Piece[] {
  if (made) return made;
  const w = (name: string, kind: PieceKind, paint: (p: Px) => void): Piece => ({ name, kind, ...wallSet(paint) });
  const torchLight = (f: number) => (alongX: boolean): Light[] => [{ x: PCX / GRAIN, y: (PFOOT - 52) / GRAIN, r: 14 + (f % 2), color: EMBER[2], a: alongX ? 0.5 : 0.42 }];
  const torches = { left: [0, 1, 2, 3].map((f) => wallPiece(torch(f), torchLight(f)).left), right: [0, 1, 2, 3].map((f) => wallPiece(torch(f), torchLight(f)).right) };
  made = [
    // wall tiles
    w('burial niche', 'wall tile', niche(true)),
    w('sealed niche', 'wall tile', niche(false)),
    w('barred window', 'wall tile', grille),
    w('horned skull', 'wall tile', (p) => hornedSkull(p)),
    w("the king's head", 'wall tile', kingsHead),
    w('fallen-in stones', 'wall tile', fallenIn),
    // floor tiles
    { name: 'ledger stone', kind: 'floor tile', frames: [onTile(ledger)] },
    { name: 'grave slab and ring', kind: 'floor tile', frames: [onTile(ringSlab)] },
    { name: "the king's runner", kind: 'floor tile', frames: [onTile(runner(false))] },
    { name: "the runner's end", kind: 'floor tile', frames: [onTile(runner(true))] },
    { name: 'drain', kind: 'floor tile', frames: [onTile(drain)] },
    { name: 'the crown in the floor', kind: 'floor tile', frames: [onTile(inlay)] },
    { name: 'sunken grave slab', kind: 'floor tile', frames: [onTile(sunkSlab)] },
    // breakables, and what they leave
    { name: 'funeral urn', kind: 'breakable', frames: [tallUrn()] },
    { name: 'squat urn', kind: 'breakable', frames: [squatUrn()] },
    { name: 'bone box', kind: 'breakable', frames: [boneBox()] },
    { name: 'skull jar', kind: 'breakable', frames: [skullJar()] },
    { name: 'urn shards and ash', kind: 'broken', frames: [urnShards()] },
    { name: 'splinters and bones', kind: 'broken', frames: [boxSplinters()] },
    // on the walls
    w('banner', 'on the wall', banner(false)),
    w('banner in rags', 'on the wall', banner(true)),
    w('shield', 'on the wall', shield),
    w('keys on a hook', 'on the wall', keysOnHook),
    w('shackles', 'on the wall', shackles),
    { name: 'torch', kind: 'on the wall', ...torches },
    w('crossed mauls', 'on the wall', crossedMauls),
    w('horned helm on a peg', 'on the wall', helmOnPeg),
    // on the floor
    { name: 'fallen guard', kind: 'on the floor', frames: [fallenGuard()] },
    { name: 'dropped keys', kind: 'on the floor', frames: [droppedKeys()] },
    { name: 'fallen banner', kind: 'on the floor', frames: [fallenBanner()] },
    { name: "the effigy's head", kind: 'on the floor', frames: [effigyHead()] },
    { name: 'horned helm', kind: 'on the floor', frames: [droppedHelm()] },
    { name: 'candles', kind: 'on the floor', frames: [0, 1, 2, 3].map((f) => candles(f)) },
    { name: 'chain', kind: 'on the floor', frames: [coiledChain()] },
    // obstacles
    { name: 'sarcophagus', kind: 'obstacle', frames: [sarcophagus(false)] },
    { name: 'open sarcophagus', kind: 'obstacle', frames: [sarcophagus(true)] },
    { name: "the king's tomb", kind: 'obstacle', frames: [effigyTomb()] },
    { name: 'horned knight', kind: 'obstacle', frames: [knightStatue()] },
    { name: 'pillar', kind: 'obstacle', frames: [pillar()] },
    { name: 'cresset', kind: 'obstacle', frames: [0, 1, 2, 3].map(cresset) },
    { name: 'rack of mauls', kind: 'obstacle', frames: [maulRack()] },
    { name: "the king's throne", kind: 'obstacle', frames: [throne()] },
    { name: "the king's coffer", kind: 'obstacle', frames: [coffer(false), coffer(true)] },
    // doors and gates
    { name: "the door's leaf", kind: 'door', frames: [tombLeaf(32, 16), tombLeaf(-32, 16)] },
    w("the gate's crest", 'gate', gateCrest),
    w("the boss's gate", 'gate', bossCrest(false)),
    // traps
    { name: 'spike grate', kind: 'trap', frames: [spikeGrate(false), spikeGrate(true)] },
    { name: 'crown plate', kind: 'trap', frames: [crownPlate(false), crownPlate(true)] },
    w('dart skull', 'trap', (p) => hornedSkull(p, true)),
    // quests
    { name: "the Warden's horn", kind: 'quest', frames: [wardenHorn()] },
  ];
  return made;
}

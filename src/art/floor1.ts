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
import { makeGateArt } from './gates';
import type { GateArt, Mark } from './gates';
import { Iso, plainSide } from './isokit';
import type { SideShader } from './isokit';
import { GRAIN, INK, ball, blend, compose, hash, limb, lit, mix } from './kit';
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

/** The colours of what gives off its own light (a fire, embers): never put in a face's shade, nor in the dark the wall fades into. */
const SHINES = new Set<string>([...EMBER, COAL[2], COAL[3], '#fff0a0', '#ffb070', '#ff4f8a', '#c0206a', '#7a1058']);
/** The dark the walls fade into at their tops (art/ground.ts, BEYOND). */
const BEYOND = '#07050a';
/**
 * A FLAT PICTURE SET INTO A WALL'S FACE: the face turned to screen-left (`alongX`, a plane along +x,
 * in the light) or the one turned to screen-right (along +y, in shade). As the walls' faces do,
 * each column drops a pixel for every two across (art/ground.ts, bottomRow). Anchored at the foot of
 * the face under the middle of its tile; a tile's face is 32 across (u -16 to 15) and the solid
 * stone of it 56 high: above that the wall fades into the dark in four steps, and so does what is
 * on it there (art/ground.ts, faded), but what gives off light.
 */
function onFace(picture: Px, alongX: boolean, lights: readonly Light[] = []): Sprite {
  const s = onFacePx(picture, alongX).sprite(PCX, PFOOT, GRAIN);
  if (lights.length) s.lights = lights.map((l) => ({ ...l }));
  return s;
}
/** The same, as a painting (for a moment that paints a face's piece with more round it). */
function onFacePx(picture: Px, alongX: boolean): Px {
  const by = alongX ? (x: number): number => Math.floor((x - PCX) / 2) : (x: number): number => Math.floor((PCX - x) / 2);
  const out = new Px(PW, PH);
  const TALL = 80;
  const FADE = 24;
  for (let x = 0; x < PW; x++) {
    const k = by(x);
    for (let y = 0; y < PH; y++) {
      let c = picture.get(x, y);
      if (!c) continue;
      if (!SHINES.has(c)) {
        if (!alongX) c = shaded(c);
        const v = PFOOT - y;
        const fromTop = TALL - 1 - v;
        if (fromTop < FADE) c = mix(c, BEYOND, [0.9, 0.66, 0.42, 0.2][Math.max(0, Math.floor((fromTop * 4) / FADE))]);
      }
      out.set(x, y + k, c);
    }
  }
  return out;
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
/**
 * A wall piece, painted about its own middle and set `du` across the face and `dv` up it: so that
 * no two stand in the same spot (the owner, 10 Oct 2026: "I don’t like the wall panels all being
 * in the exact same spot"). A face is 32 across (u -16 to 15); its stone 56 high, fading into the
 * dark up to 80.
 */
function wallPiece(paint: (p: Px) => void, lights: (alongX: boolean) => Light[] = () => [], du = 0, dv = 0): WallPiece {
  const painted = flat();
  paint(painted);
  const p = flat();
  p.blit(painted, du, -dv);
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
// THE KING'S CROWN, as a picture: seen a little from above and in front, so that it reads as a
// crown and never as a letter (the second look found the first, a bar with prongs, reading as Ш):
// a ring of gold-work seen as a band, its hollow seen from above, five points rising from its near
// half with a ball on each, jewels on the band. Cut in stone, laid in the floor, or burning.

type CrownPart = 'band' | 'point' | 'hollow' | 'jewel' | null;
/** What of the crown is at (s, t) from the middle of its box: s across, t up, both in half its width (-1..1). */
function crownAt(s: number, t: number): CrownPart {
  if (Math.abs(s) > 1.02) return null;
  const top = 0.12;
  const ry = 0.3;
  const half = Math.sqrt(Math.max(0, 1 - s * s));
  const rimLow = top - ry * half;
  const rimHigh = top + ry * half;
  const bandLow = rimLow - 0.5;
  // the points, from the rim's near edge up, each with a ball on its tip
  for (const [ps, tall] of [[-0.78, 0.5], [-0.4, 0.6], [0, 0.72], [0.4, 0.6], [0.78, 0.5]] as const) {
    const base = top - ry * Math.sqrt(Math.max(0, 1 - ps * ps));
    const up = t - base;
    if (up >= -0.02 && up <= tall && Math.abs(s - ps) <= 0.15 * (1 - up / tall) + 0.02) return 'point';
    if (Math.hypot(s - ps, t - (base + tall + 0.06)) <= 0.09) return 'point';
  }
  if (t <= rimLow && t >= bandLow) {
    // the jewels: one in the middle of the band, one each side
    for (const js of [-0.55, 0, 0.55]) if (Math.hypot(s - js, t - (rimLow + bandLow) / 2) <= 0.1) return 'jewel';
    return 'band';
  }
  if (t > rimLow && t <= rimHigh) {
    // the rim all round (its far side a thin line behind the points), the hollow inside it
    const e = s * s + ((t - top) / ry) ** 2;
    return e > 0.62 ? 'band' : 'hollow';
  }
  return null;
}
/** The crown cut proud of a face, centred at (u0, v0), `w` across: band and points raised, the hollow and the jewels sunk dark. */
function crownCarved(p: Px, u0: number, v0: number, w: number): void {
  const R = w / 2;
  const part = (u: number, v: number): CrownPart => crownAt((u + 0.5 - u0) / R, (v - v0) / R);
  const reach = Math.ceil(R * 1.1);
  relief(p, FACE, (u, v) => part(u, v) === 'band' || part(u, v) === 'point', u0 - reach, u0 + reach, v0 - reach, v0 + reach);
  sunk(p, FACE, (u, v) => part(u, v) === 'hollow' || part(u, v) === 'jewel', u0 - reach, u0 + reach, v0 - reach, v0 + reach, DEEP);
}

// =================================================================================================
// WALL TILES: cut into a wall's face

/** A burial niche: an arched hollow in the wall, a skull and long bones laid in it, its sill worn. Sealed: a slab set in it with the king's crown cut on it. */
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
      relief(p, FACE, inArch, -10, 9, 16, 42);
      crownCarved(p, 0, 27, 14);
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
      p.set(fx(u), fy(22), FACE[2]);
    }
    // (dull iron, but for the one catching the light)
    for (const u of [-3, 3]) p.set(fx(u), fy(24), IRONS[3]);
    p.set(fx(0), fy(24), GLINT);
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

/**
 * WHERE THE STONES FELL IN: a stone of the wall's own courses gone, the dark behind it, the ledge it
 * sat on catching the light, the next stone broken at a corner, a crack running on from the break (the
 * second look found a ragged blob that took no notice of the courses). Laid on the face's courses as
 * art/ground.ts lays them (sixteen rows to a course, every other course with a joint in the middle of
 * the face): `k` 0, the left stone of the middle course; 1, its right stone; 2, the left stone of the
 * bottom course, at the foot of the wall, broken up into the course over it.
 */
function fallenIn(k: 0 | 1 | 2): (p: Px) => void {
  return (p) => {
    const [u0, u1] = k === 1 ? [1, 14] : [-14, -1];
    const [v0, v1] = k === 2 ? [0, 14] : [32, 46];
    // the corner broken off the next stone, under it (over it, at the foot): a wedge, its edge straight
    const cu = k === 1 ? u0 : u1;
    const bite = (u: number, v: number): boolean => {
      const along = Math.abs(u - cu);
      const deep = k === 2 ? v - v1 : v0 - v;
      return deep > 0 && along <= 7 && deep <= 6 - along * 0.75;
    };
    const hole = (u: number, v: number): boolean => (u >= u0 && u <= u1 && v >= v0 && v <= v1) || bite(u, v);
    for (let v = v0 - 9; v <= v1 + 9; v++) {
      for (let u = u0 - 1; u <= u1 + 1; u++) {
        if (!hole(u, v)) continue;
        // inside it: the ledge it sat on (two rows) and its side toward the light are lit; the rest the dark behind
        const ledge = !hole(u, v - 1) ? FACE[4] : !hole(u, v - 2) ? FACE[2] : null;
        const side = !hole(u + 1, v) ? FACE[2] : null;
        p.set(fx(u), fy(v), ledge ?? side ?? (hash(u, v, 112 + k) < 0.08 ? '#1b1426' : DEEP));
      }
    }
    // a lump of the broken stone left lying on the ledge
    const lu = k === 1 ? u1 - 7 : u0 + 2;
    const lv = v0 + 2;
    lit(p, FACE, [1, 2], [1, 2], (l) => l.poly([[fx(lu), fy(lv)], [fx(lu + 1), fy(lv + 3)], [fx(lu + 4), fy(lv + 4)], [fx(lu + 6), fy(lv + 1)], [fx(lu + 5), fy(lv)]], INK));
    // a crack running on from the break, in jags: down the stone under it (up the one over it, at the foot)
    let x = cu + (k === 1 ? 3 : -3);
    for (let i = 0; i < 12; i++) {
      const v = k === 2 ? v1 + 7 + i : v0 - 7 - i;
      x += i % 3 === 2 ? 0 : (k === 1 ? 1 : -1) * (hash(i, k, 113) < 0.5 ? 1 : -1);
      p.set(fx(x), fy(v), DEEP);
      p.set(fx(x + 1), fy(v), FACE[3]);
    }
  };
}

// =================================================================================================
// FLOOR TILES

/** Where (u, v) is from a tile's middle, along x and along y. */
const mid = (u: number, v: number): [number, number] => [u - 0.5, v - 0.5];

/**
 * THE FLOOR: a picture of one tile, a diamond 64 x 32. `inside`, if given, is a slab of its own
 * laid in it: its gap round it and its two lips are found pixel by pixel on the tile's own grid (the
 * second look found them dashed when worked out from (u, v)), so they run as cleanly as the floor's
 * own joints: the gap in mortar, the lip along its far edges lit, along its near edges in shade.
 * `paint` gives the slab's face (or, with no slab, all of the tile); `outside`, the floor round it.
 */
function tileOf(paint: (u: number, v: number) => string | null, inside?: (u: number, v: number) => boolean, outside: (u: number, v: number) => string = around): Px {
  const p = new Px(64, 32);
  const uv = (x: number, y: number): [number, number] => {
    const px = x + 0.5 - 32;
    const py = y + 0.5;
    return [(px / 32 + py / 16) / 2, (py / 16 - px / 32) / 2];
  };
  const inDiamond = (x: number, y: number): boolean => {
    if (y < 0 || y >= 32) return false;
    const hw = y < 16 ? 2 * y + 1 : 2 * (31 - y) + 1;
    return x >= 32 - hw && x < 32 + hw;
  };
  const M = (x: number, y: number): boolean => inDiamond(x, y) && (!inside || inside(...uv(x, y)));
  const gap = (x: number, y: number): boolean => M(x, y) && (!M(x - 1, y) || !M(x + 1, y) || !M(x, y - 1) || !M(x, y + 1));
  const N = (x: number, y: number): boolean => M(x, y) && !gap(x, y);
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 64; x++) {
      if (!inDiamond(x, y)) continue;
      const [u, v] = uv(x, y);
      let c: string | null;
      if (inside && !M(x, y)) c = outside(u, v);
      else if (inside && gap(x, y)) c = THEME.mortar;
      else if (inside && !N(x, y - 1)) c = SLAB[3];
      else if (inside && !N(x, y + 1)) c = SLAB[0];
      else c = paint(u, v) ?? outside(u, v);
      p.set(x, y, c);
    }
  }
  return p;
}
function onTile(paint: (u: number, v: number) => string | null, inside?: (u: number, v: number) => boolean): Sprite {
  return tileOf(paint, inside).sprite(32, 0, GRAIN);
}
/** A rectangle of the tile, (x0..x1, y0..y1) of u and v. */
const box = (x0: number, x1: number, y0: number, y1: number) => (u: number, v: number): boolean => u >= x0 && u <= x1 && v >= y0 && v <= y1;
/** The flagstones round a laid slab: the floor's own tones, in two stones. */
function around(u: number, v: number): string {
  if (Math.abs(u - 0.5) < 0.012 || Math.abs(v - 0.5) < 0.012 || u < 0.012 || v < 0.012) return THEME.mortar;
  return hash(Math.floor(u * 2), Math.floor(v * 2), 3) < 0.5 ? SLAB[1] : SLAB[2];
}

/** A ledger stone: a long slab over a grave, a sword cut along it, point toward the door of the room. */
function ledger(u: number, v: number): string | null {
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
  return SLAB[2];
}

/** A grave slab with an iron ring let into it, to lift it by. */
function ringSlab(u: number, v: number): string | null {
  const [x, y] = mid(u, v);
  const d = Math.hypot(x, y);
  // the ring's sunk bed, the ring in it (lit on the side of the light), its staple
  if (d < 0.13 && d > 0.08) return x + y < 0 ? IRONS[3] : IRONS[2];
  if (d <= 0.08 && d > 0.055) return THEME.mortar;
  if (Math.abs(x) < 0.03 && Math.abs(y + 0.1) < 0.03) return IRONS[0];
  if (hash(Math.floor(u * 20), Math.floor(v * 20), 12) < 0.05) return SLAB[0];
  return SLAB[1];
}

/**
 * The king's runner: a strip of his red cloth laid down the middle of a tile along x, or along y
 * (`alongY`), so that it may lead up to his throne; threadbare in places but never worn through (the
 * second look found holes in it, the same on every tile), each tile `k` worn its own way, its edges
 * frayed. `end`: where it ends, in a fringe (the stone shows between its threads).
 */
function runner(end: boolean, alongY = false, k = 0): (u: number, v: number) => string | null {
  return (u0, v0) => {
    const [u, v] = alongY ? [v0, u0] : [u0, v0];
    const [x, y] = mid(u, v);
    const fray = 0.02 * hash(Math.floor(u * 40), k, 13);
    const inCloth = Math.abs(y) < 0.3 - fray && (!end || x < 0.22 + 0.04 * hash(Math.floor(v * 30), 1, 14));
    if (!inCloth) return around(u0, v0);
    // its border: a darker band and a pale stitched line in it
    const b = 0.3 - Math.abs(y);
    if (b < 0.035) return WINE[0];
    if (b < 0.07) return Math.floor(u * 30) % 2 === 0 ? WINE[3] : WINE[2];
    // (the fringe at its end: its threads, the floor between them)
    if (end && x > 0.16) return Math.floor(v * 40) % 2 === 0 ? WINE[2] : around(u0, v0);
    // threadbare in patches, the weave showing dark, each tile its own
    if (Math.abs(y) < 0.2 && hash(Math.floor(u * 6), Math.floor(v * 4), 15 + k * 7) < 0.14) return (Math.floor(u * 32) + Math.floor(v * 16)) % 2 ? WINE[1] : WINE[2];
    // the cloth: worn paler down its middle
    return Math.abs(y) < 0.1 && hash(Math.floor(u * 8), Math.floor(v * 8), 16 + k) < 0.4 ? WINE[3] : WINE[2];
  };
}

/** A drain: an iron grate in a square of stone, the dark under it. */
function drain(u: number, v: number): string | null {
  const [x, y] = mid(u, v);
  if (Math.abs(x) < 0.2 && Math.abs(y) < 0.2) {
    const bar = Math.abs(((x + 0.2) * 16) % 2 - 1) > 0.55 ? 'x' : Math.abs(((y + 0.2) * 16) % 2 - 1) > 0.55 ? 'y' : null;
    if (Math.abs(x) > 0.18 || Math.abs(y) > 0.18) return IRONS[2];
    if (bar === 'x') return IRONS[3];
    if (bar === 'y') return IRONS[2];
    return DEEP;
  }
  return SLAB[1];
}

/** The crown laid in the floor: a round of paler stone, the king's crown in it as a picture in dark stone, upright to the eye. */
function inlay(u: number, v: number): string | null {
  const [x, y] = mid(u, v);
  // (the picture's across and up, as the eye sees the floor: across the screen and up it)
  const s = (x - y) / 0.2;
  const t = -(x + y) / 0.2 - 0.05;
  const part = crownAt(s, t * 1.0);
  if (part === 'hollow') return SLAB[0];
  if (part === 'jewel') return DEEP;
  if (part) return THEME.mortar;
  return hash(Math.floor(u * 30), Math.floor(v * 30), 17) < 0.1 ? SLAB[2] : mix(SLAB[2], SLAB[3], 0.5);
}

/** A slab sunk into the grave under it: tipped, one edge down in the dark, a crack across it. */
function sunkSlab(u: number, v: number): string | null {
  const [x, y] = mid(u, v);
  // the gap it has opened along its far edge, dark
  if (u < 0.2) return u < 0.14 ? DEEP : THEME.mortar;
  // (tipped down toward that edge: darker toward it; a crack across it)
  if (Math.abs(x + y * 0.4 - 0.12) < 0.012) return DEEP;
  return x < -0.1 ? SLAB[0] : SLAB[1];
}

/**
 * A GREAT CRACK down the whole of the wall, floor to dark: the stones on either side of it
 * shifted, one hanging half out, grit at its foot. Full height (the owner: "Some assets could be
 * the full height like a large crack down the wall").
 */
function greatCrack(p: Px): void {
  // its line: down the wall in jags, wider low where the wall has settled
  const at = (v: number): number => Math.round(Math.sin(v * 0.21) * 3 + Math.sin(v * 0.07 + 1) * 4 + (hash(Math.floor(v / 6), 0, 101) - 0.5) * 3);
  for (let v = 0; v <= 78; v++) {
    const c = at(v);
    const wide = v < 24 ? 3 : v < 50 ? 2 : 1;
    for (let k = 0; k < wide; k++) p.set(fx(c + k), fy(v), DEEP);
    // its lips: the edge toward the light in shadow, the far one lit
    p.set(fx(c - 1), fy(v), FACE[0]);
    p.set(fx(c + wide), fy(v), FACE[3]);
    // branches off it
    if (hash(v, 1, 102) < 0.07) for (let k = 1; k < 6; k++) p.set(fx(c + wide + k), fy(v - Math.round(k * 0.6)), FACE[0]);
  }
  // stones shifted along it: proud of the face on one side, sunk on the other
  for (const [u0, v0, w, h, out] of [[3, 14, 7, 6, true], [-10, 30, 7, 6, false], [2, 44, 6, 5, true], [-8, 58, 6, 5, true]] as const) {
    const mask = (u: number, v: number): boolean => u >= u0 && u < u0 + w && v >= v0 && v < v0 + h;
    if (out) relief(p, FACE, mask, u0 - 1, u0 + w, v0 - 1, v0 + h);
    else sunk(p, FACE, mask, u0 - 1, u0 + w, v0 - 1, v0 + h, FACE[1]);
  }
  // grit and bits of a broken corner fallen at its foot, in little heaps
  for (let i = 0; i < 6; i++) {
    const u = -6 + Math.floor(hash(i, 2, 103) * 12);
    const v = Math.floor(hash(i, 3, 103) * 2);
    p.set(fx(u), fy(v), FACE[3]).set(fx(u + 1), fy(v), FACE[1]);
  }
}

/** A WALL CRUMBLED at its foot: a breach in it as high as a man's chest, rough-edged, earth and dark behind (its fallen stones are the heap on the floor before it: crumbledHeap). */
function crumbledWall(p: Px): void {
  const breach = (u: number, v: number): boolean => {
    const x = u + 0.5;
    const top = 30 - (x / 12) ** 2 * 14 + (hash(Math.floor(u / 2), 0, 104) - 0.5) * 6;
    return Math.abs(x) <= 13 && v >= 0 && v <= top;
  };
  sunk(p, FACE, breach, -14, 13, 0, 34, DEEP);
  // the earth behind, low in it, and a root of rock
  for (let u = -12; u <= 12; u++) for (let v = 0; v <= 8 - Math.abs(u) / 3; v++) if (breach(u, v)) p.set(fx(u), fy(v), v > 5 ? '#241a30' : '#1b1426');
  // broken stones still hanging at its top edge, proud and catching the light
  for (const [u0, v0, w] of [[-9, 22, 5], [2, 27, 6], [8, 18, 4]] as const) relief(p, FACE, (u, v) => u >= u0 && u < u0 + w && v >= v0 && v < v0 + 4, u0 - 1, u0 + w, v0 - 1, v0 + 5);
}

/** The heap of the fallen wall's stones on the floor before it: dressed blocks broken and tumbled, grit between them. At the middle of the tile in front of the wall. */
function crumbledHeap(): Sprite {
  const W = 72;
  const H = 52;
  const cx = 36;
  const cy = 34;
  const p = new Px(W, H);
  const under = new Px(W, H);
  for (let i = 0; i < 26; i++) under.set(cx - 24 + Math.floor(hash(i, 1, 105) * 48), cy - 4 + Math.floor(hash(i, 2, 105) * 12), i % 3 ? STONE[1] : STONE[2]);
  // the blocks: the bigger at the back (up the screen, nearer the wall), heaped
  const blocks: ReadonlyArray<readonly [number, number, number, number]> = [
    [-14, -10, 1.5, 1], [4, -12, 1.3, 2], [16, -6, 1.0, 3], [-20, 0, 1.1, 4], [-6, -3, 1.4, 5], [10, 2, 1.2, 6], [-12, 8, 0.9, 7], [2, 9, 1.0, 8], [20, 8, 0.7, 9],
  ];
  const HEAP: Ramp = [STONE[0], STONE[1], STONE[2], STONE[3], STONE[3]];
  for (const [dx, dy, k, seed] of blocks) {
    const x = cx + dx;
    const y = cy + dy;
    lit(p, HEAP, [1, 2], [1, 3], (l) =>
      l.poly([[x - 7 * k, y - 2 * k], [x - 1 * k, y - 6 * k + hash(seed, 1, 106) * 2], [x + 7 * k, y - 3 * k], [x + 6 * k, y + 3 * k], [x - 5 * k, y + 4 * k]], INK),
    );
    // (a dressed face on some, its tooled edge still straight)
    if (seed % 2) p.line(Math.round(x - 5 * k), Math.round(y - 1 * k), Math.round(x + 5 * k), Math.round(y - 2 * k), STONE[1]);
  }
  return compose(under, [p], null).sprite(cx, cy, GRAIN);
}

/** A RAT HOLE at the foot of the wall: a gnawed arch where a stone has gone, dark inside. */
function ratHole(p: Px): void {
  const hole = (u: number, v: number): boolean => {
    const x = u + 0.5;
    return v >= 0 && (x / 6.5) ** 2 + (v / 9) ** 2 <= 1;
  };
  sunk(p, FACE, hole, -8, 7, 0, 10, DEEP);
  // gnawed: its lip ragged, crumbs of stone before it
  for (const [u, v] of [[-7, 4], [6, 5], [-4, 9], [3, 9]] as const) p.set(fx(u), fy(v), DEEP);
  for (let i = 0; i < 7; i++) p.set(fx(-8 + Math.floor(hash(i, 1, 107) * 16)), fy(0), i % 2 ? FACE[3] : FACE[1]);
}

// =================================================================================================
// ON THE WALLS: hung on a face

/** A long banner of his red cloth hanging from an iron rod, torn into tongues at its foot, the horned helm on it in old bone. */
function banner(rags: boolean): (p: Px) => void {
  return (p) => {
    const half = rags ? 5 : 9;
    // (the long one hangs from high on the wall nearly to the floor; the rags from as high, shorter;
    // its rod at the top of the wall's solid stone, below where the wall fades into the dark)
    const top = 53;
    const cloth = new Px(PW, PH);
    for (let u = -half; u <= half; u++) {
      const torn = rags ? 22 + Math.floor(hash(u, 1, 21) * 20) : 4 + Math.floor(hash(Math.floor(u / 3), 2, 22) * 9) + (Math.abs(u) % 3 === 1 ? 2 : 0);
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
      const hy = 46;
      for (let u = -4; u <= 3; u++) for (let v = hy - 4; v <= hy + 3; v++) if ((u + 0.5) ** 2 / 16 + (v - hy) ** 2 / 14 <= 1) cloth.set(fx(u), fy(v), OLD_BONE[2]);
      for (let v = hy - 4; v <= hy - 1; v++) cloth.set(fx(-1), fy(v), WINE[0]).set(fx(0), fy(v), WINE[0]);
      for (const s of [-1, 1]) for (let t = 0; t <= 1; t += 0.1) cloth.set(fx(Math.round(s * (4 + 3 * t) - (s < 0 ? 1 : 0))), fy(Math.round(hy + 1 + 5 * t * t)), OLD_BONE[3]);
      // a border along its sides
      for (let v = 8; v <= top - 2; v++) {
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

/**
 * The jailer's keys on a hook: a ring of iron hung on a peg, three great keys hanging from it close
 * together, each with an open bow (its hole dark), a long shank and a big toothed bit turned out, the
 * seam round them so they read against the stone (the second look found the first, a ring and two
 * splayed keys, reading as a little hanging skeleton).
 */
function keysOnHook(p: Px): void {
  const I = SMALL_IRON;
  const k = flat();
  // the peg out of the wall, turned up at its end
  for (let u = -1; u <= 1; u++) k.set(fx(u), fy(48), I[3]).set(fx(u), fy(47), I[1]);
  k.set(fx(1), fy(49), I[3]);
  // the ring hung on it: a thick hoop, lit on its upper left
  for (let v = 34; v <= 47; v++) {
    for (let u = -7; u <= 7; u++) {
      const d = ((u + 0.5) / 6) ** 2 + ((v - 40.5) / 6) ** 2;
      if (d > 1 || d < 0.45) continue;
      k.set(fx(u), fy(v), (u + 0.5) / 6 - (v - 40.5) / 6 < -0.4 ? I[4] : (u + 0.5) / 6 - (v - 40.5) / 6 < 0.5 ? I[3] : I[2]);
    }
  }
  // three keys hanging from the bottom of the ring, nearly side by side
  const key = (u0: number, len: number, out: 1 | -1): void => {
    // the bow: an open loop, its hole dark
    for (let v = 30; v <= 35; v++) {
      for (let u = u0 - 2; u <= u0 + 2; u++) {
        const edge = Math.abs(u - u0) === 2 || v === 30 || v === 35;
        const corner = Math.abs(u - u0) === 2 && (v === 30 || v === 35);
        if (corner) continue;
        k.set(fx(u), fy(v), edge ? (u < u0 || v === 35 ? I[3] : I[2]) : DEEP);
      }
    }
    // the shank, lit on its left
    for (let v = 30 - len; v < 30; v++) k.set(fx(u0), fy(v), I[3]).set(fx(u0 + 1), fy(v), I[1]);
    // the bit: a block turned out from the shank's foot, its wards cut
    for (let dv = 0; dv < 5; dv++) {
      for (let du = 1; du <= 4; du++) {
        if (dv === 2 && du >= 2) continue;
        const u = out > 0 ? u0 + 1 + du : u0 - du;
        k.set(fx(u), fy(30 - len + dv), dv === 4 ? I[3] : I[2]);
      }
    }
  };
  key(-4, 14, -1);
  key(0, 17, 1);
  key(4, 11, 1);
  p.blit(compose(null, [k], null), 0, 0);
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


/** A SARCOPHAGUS along x: a plinth, the chest of it with a sunk panel on each side, a gabled lid. `open`: its lid broken in two, one half still on it, the other fallen to the floor before it, the dark and bones inside. */
function sarcophagus(open: boolean): Sprite {
  const W = 96;
  const H = 80;
  const ox = 48;
  const oy = 52;
  const base = new Px(W, H);
  const body = new Px(W, H);
  const lid = new Px(W, H);
  const fallen = new Px(W, H);
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
    // (a round boss in its middle)
    if (lit_ && (u - w / 2) ** 2 + ((v - h / 2) * 1.6) ** 2 < 9) return (u - w / 2) + (v - h / 2) < 0 ? STONE[3] : STONE[1];
    return lit_ ? STONE[2] : mix(STONE[0], STONE[2], 0.25);
  };
  iso.box(-A, -B, A, B, 5, TOP, { top: () => STONE[3], left: panel(true), right: panel(false) });
  if (!open) {
    gabled(new Iso(lid, ox, oy), -A - 0.03, A + 0.03, -B - 0.03, B + 0.03, TOP, 4, 7, true);
  } else {
    // the dark inside where the lid is gone, and bones in it
    const ii = new Iso(body, ox, oy);
    ii.top(0.0, -B + 0.04, A - 0.04, B - 0.04, TOP, (u) => (u > 0.94 ? STONE[1] : DEEP));
    const [sx, sy] = ii.at(0.22, 0, TOP);
    limb(body, sx - 8, sy + 1, sx + 5, sy - 2, 1, 1, OLD_BONE);
    ball(body, sx + 6, sy - 2, 2.6, 2.2, OLD_BONE);
    // the half of the lid still on it, its broken end ragged
    gabled(new Iso(lid, ox, oy), -A - 0.03, 0.02, -B - 0.03, B + 0.03, TOP, 4, 7, false);
    // the other half on the floor before it, lying flat on its side, cracked
    const f = new Iso(fallen, ox, oy);
    block(f, STONE, 0.0, B + 0.07, 0.42, B + 0.25, 0, 4);
    const [cx0, cy0] = f.at(0.2, B + 0.07, 4);
    const [cx1, cy1] = f.at(0.26, B + 0.25, 4);
    fallen.line(Math.round(cx0), Math.round(cy0), Math.round(cx1), Math.round(cy1), STONE[0]);
  }
  return compose(base, [body, lid, fallen], null).sprite(ox, oy, GRAIN);
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

/**
 * THE KING'S TOMB: a great chest of stone on a plinth, his effigy lying on its lid in paler stone,
 * built on the grid as the tomb is (the second look found a lump with a ball on it; a third, a figure
 * laid flat that read as a sword): his head crowned on a cushion, his shoulders and his robe down to
 * his feet, turned up at the end; his hands folded on his breast over the hilt of a sword laid down
 * his body.
 */
function effigyTomb(): Sprite {
  const W = 96;
  const H = 90;
  const ox = 48;
  const oy = 60;
  const base = new Px(W, H);
  const body = new Px(W, H);
  const fig = new Px(W, H);
  block(new Iso(base, ox, oy), STONE, -0.5, -0.29, 0.5, 0.29, 0, 6);
  block(new Iso(body, ox, oy), STONE, -0.45, -0.24, 0.45, 0.24, 6, 24);
  block(new Iso(body, ox, oy), STONE, -0.47, -0.26, 0.47, 0.26, 24, 28);
  // the effigy, of a paler stone than the tomb
  const E: Ramp = [STONE[1], STONE[1], mix(STONE[2], STONE[3], 0.6), STONE[4], mix(STONE[4], '#ffffff', 0.2)];
  const e = new Iso(fig, ox, oy);
  const Z = 28;
  // the cushion under his head, broad and flat; his head on it, round, the points of his crown round its top
  // (the third look found a ribbed lump: a round head now, and the sword a line of light, one piece with him)
  block(e, E, -0.43, -0.13, -0.27, 0.13, Z, Z + 3);
  const [hx, hy] = e.at(-0.35, 0, Z + 7);
  ball(fig, hx, hy, 3.8, 3.4, E);
  for (const k of [-2, 0, 2]) fig.set(Math.round(hx + k), Math.round(hy) - 4, E[4]).set(Math.round(hx + k), Math.round(hy) - 3, E[3]);
  fig.set(Math.round(hx) + 1, Math.round(hy) + 1, E[1]);
  // his shoulders, broad; his robe falling to his feet, a little lower, a fold down it
  block(e, E, -0.28, -0.12, -0.14, 0.12, Z, Z + 7);
  block(e, E, -0.14, -0.1, 0.3, 0.1, Z, Z + 6);
  // his feet, turned up at the end
  block(e, E, 0.3, -0.08, 0.36, -0.01, Z, Z + 9);
  block(e, E, 0.3, 0.01, 0.36, 0.08, Z, Z + 9);
  // the sword laid down his body from his breast to his knees: its blade a line of light with its shadow
  // beside it on the robe, its guard across, his hands folded on its hilt
  const [b0x, b0y] = e.at(-0.1, 0, Z + 6);
  const [b1x, b1y] = e.at(0.26, 0, Z + 6);
  fig.line(Math.round(b0x), Math.round(b0y) + 1, Math.round(b1x), Math.round(b1y) + 1, STONE[1]);
  fig.line(Math.round(b0x), Math.round(b0y), Math.round(b1x), Math.round(b1y), E[4]);
  block(e, E, -0.12, -0.07, -0.1, 0.07, Z + 6, Z + 8);
  block(e, E, -0.22, -0.045, -0.13, 0.045, Z + 6, Z + 10);
  return compose(base, [body, fig], null).sprite(ox, oy, GRAIN);
}

/**
 * A HORNED KNIGHT IN STONE on a plinth, turned on the grid as everything that stands is
 * (art/isokit.ts): built of blocks, facing down the screen to the left, his front to the light and his
 * right side in shade; his maul planted head-down before him and his hands on its pommel; a great
 * helm with the dark cross of its slits, horns sweeping from it along the line of his shoulders (the
 * second look found the first a front view sheared, a flat card).
 */
function knightStatue(): Sprite {
  const W = 72;
  const H = 150;
  const ox = 36;
  const oy = 128;
  const base = new Px(W, H);
  const body = new Px(W, H);
  const front = new Px(W, H);
  const horns = new Px(W, H);
  block(new Iso(base, ox, oy), STONE, -0.3, -0.3, 0.3, 0.3, 0, 12);
  block(new Iso(base, ox, oy), STONE, -0.27, -0.27, 0.27, 0.27, 12, 15);
  // (a chip broken from the plinth's front edge)
  const [chx, chy] = new Iso(base, ox, oy).at(-0.12, 0.3, 12);
  base.set(Math.round(chx), Math.round(chy), STONE[0]).set(Math.round(chx) + 1, Math.round(chy), STONE[0]).set(Math.round(chx), Math.round(chy) + 1, STONE[1]);
  const P0 = 15;
  const b = new Iso(body, ox, oy);
  // his legs in greaves, feet apart along the line of his shoulders
  block(b, STONE, -0.15, -0.05, -0.04, 0.06, P0, P0 + 24);
  block(b, STONE, 0.04, -0.05, 0.15, 0.06, P0, P0 + 24);
  // the skirt of his surcoat to the knee; his body, broad at the chest; his pauldrons
  block(b, STONE, -0.17, -0.08, 0.17, 0.08, P0 + 16, P0 + 32);
  block(b, STONE, -0.18, -0.09, 0.18, 0.08, P0 + 32, P0 + 56);
  block(b, STONE, -0.28, -0.09, -0.16, 0.08, P0 + 47, P0 + 58);
  block(b, STONE, 0.16, -0.09, 0.28, 0.08, P0 + 47, P0 + 58);
  // his great helm, the dark cross of its slits on its front
  b.box(-0.09, -0.08, 0.09, 0.08, P0 + 56, P0 + 76, {
    top: () => STONE[4],
    left: (u, v, w, h, px, py) => {
      const m = Math.floor(w / 2);
      if (v === 7 && u > 0 && u < w - 1) return DEEP;
      if (u === m && v > 7 && v < h - 5) return DEEP;
      return litSide(STONE)(u, v, w, h, px, py);
    },
    right: shadeSide(STONE),
  });
  // the maul planted head-down on the plinth before him, its haft up to his hands
  const f = new Iso(front, ox, oy);
  block(f, STONE, -0.07, 0.13, 0.07, 0.23, P0, P0 + 9);
  const [h0x, h0y] = f.at(0, 0.18, P0 + 9);
  const [h1x, h1y] = f.at(0, 0.16, P0 + 38);
  limb(front, h0x, h0y, h1x, h1y, 1.4, 1.2, STONE);
  // his arms: down from his shoulders, then in to his hands on the pommel
  for (const s of [-1, 1]) {
    const [sx, sy] = f.at(s * 0.22, 0, P0 + 50);
    const [ex, ey] = f.at(s * 0.2, 0.09, P0 + 40);
    const [wx, wy] = f.at(s * 0.04, 0.16, P0 + 39);
    limb(front, sx, sy, ex, ey, 2.6, 2.4, STONE);
    limb(front, ex, ey, wx, wy, 2.4, 2.2, STONE);
  }
  const [px, py] = f.at(0, 0.16, P0 + 40);
  ball(front, px, py, 3.4, 2.6, STONE);
  // the horns, from his helm's sides out along his shoulders' line and up; the tip of one broken off
  // (thick at the root and sweeping well out before they rise: the third look found one a thin antenna)
  for (const s of [-1, 1]) {
    for (let t = 0; t <= (s < 0 ? 0.86 : 1); t += 0.02) {
      // (a bull's: out along his shoulders' line, curving up at their tips)
      const [x, y] = f.at(s * (0.09 + 0.33 * Math.sin((t * Math.PI) / 2)), 0, P0 + 67 + 2 * t + 9 * t * t);
      const th = Math.round(5 * (1 - t)) + 2;
      for (let q = 0; q < th; q++) horns.set(Math.round(x), Math.round(y) + q, q === 0 ? (t > 0.8 ? STONE[4] : STONE[3]) : q === th - 1 ? STONE[1] : STONE[2]);
    }
  }
  return compose(base, [body, front, horns], null).sprite(ox, oy, GRAIN);
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

/** A RACK OF MAULS: a frame of old timber along x, the jailer's mauls stood in it head up, their hafts in the lower rail and resting in the slots of the upper (the second look found them hung head down, like weights from a gallows). */
function maulRack(): Sprite {
  const W = 88;
  const H = 104;
  const ox = 44;
  const oy = 80;
  const back = new Px(W, H);
  const hafts = new Px(W, H);
  const heads = new Px(W, H);
  const front = new Px(W, H);
  const iso = new Iso(back, ox, oy);
  // the two ends and the low rail behind the hafts
  for (const x of [-0.42, 0.36]) block(iso, TIMBER, x, -0.07, x + 0.06, 0.07, 0, 34);
  block(iso, TIMBER, -0.42, -0.07, 0.42, 0.0, 4, 8);
  const hi = new Iso(hafts, ox, oy);
  const xs = [-0.24, -0.02, 0.2] as const;
  for (const x of xs) {
    const [ax, ay] = hi.at(x, 0.02, 4);
    const [bx, by] = hi.at(x, 0.02, 40);
    limb(hafts, ax, ay, bx, by, 1.3, 1.3, TIMBER);
  }
  // the top rail across their hafts, in front of them
  block(new Iso(front, ox, oy), TIMBER, -0.42, 0.04, 0.42, 0.1, 28, 32);
  // their heads: blocks of iron across the haft's top, a little worn and rusted
  const h = new Iso(heads, ox, oy);
  for (const x of xs) {
    block(h, IRONS, x - 0.05, -0.08, x + 0.05, 0.12, 40, 50);
    const [gx, gy] = h.at(x - 0.05, 0.12, 49);
    heads.set(Math.round(gx) + 1, Math.round(gy), GLINT);
  }
  return compose(back, [hafts, front, heads], null).sprite(ox, oy, GRAIN);
}

/** THE KING'S THRONE: on two steps, facing down the screen to the left (+y), a high back crowned with horns. */
function throne(): Sprite {
  const W = 96;
  const H = 150;
  const ox = 48;
  const oy = 112;
  const steps = new Px(W, H);
  const seat = new Px(W, H);
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
      const part = crownAt(cu / 7, -(v - 18) / 7);
      if (part === 'hollow' || part === 'jewel') return STONE[0];
      if (part) return crownAt((cu - 1) / 7, -(v - 19) / 7) ? STONE[2] : STONE[3];
      if (crownAt((cu - 1) / 7, -(v - 19) / 7)) return STONE[1];
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
  // (its seat empty: the second look found a crown left on it reading as a letter)
  return compose(steps, [seat], null).sprite(ox, oy, GRAIN);
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

/** A bone box: a small coffin of old timber on the grid, a gabled lid, iron at its corners, and a skull set on top of it (the second look found the skull cut in its side reading as a window). 48 x 52 at (24, 38). */
function boneBox(): Sprite {
  const W = 48;
  const H = 52;
  const ox = 24;
  const oy = 38;
  const box = new Px(W, H);
  const top = new Px(W, H);
  const under = new Px(W, H);
  const iso = new Iso(box, ox, oy);
  const A = 0.22;
  const B = 0.14;
  iso.box(-A, -B, A, B, 0, 12, {
    top: () => TIMBER[3],
    left: (u, v, w, h) => (u <= 1 || u >= w - 2 ? IRONS[u <= 1 ? 3 : 2] : v === 0 ? TIMBER[3] : v >= h - 1 ? TIMBER[1] : v === 6 ? TIMBER[1] : TIMBER[2]),
    right: (u, v, w, h) => (u <= 1 || u >= w - 2 ? IRONS[1] : v === 0 ? TIMBER[2] : v >= h - 1 ? TIMBER[0] : mix(TIMBER[0], TIMBER[2], 0.4)),
  });
  const lid = new Iso(box, ox, oy);
  lid.slopeLeft(-A - 0.02, A + 0.02, B + 0.02, 12, -A - 0.02, A + 0.02, 0, 17, (t) => (t > 0.85 ? TIMBER[4] : t < 0.15 ? TIMBER[2] : TIMBER[3]));
  lid.right(A + 0.02, -B - 0.02, B + 0.02, 12, 17, (u, v, w, h) => {
    const k = Math.abs((u + 0.5) / w - 0.5) * 2;
    return v >= h * k ? mix(TIMBER[0], TIMBER[2], 0.4) : null;
  });
  // the skull on its ridge
  const [sx, sy] = lid.at(0, 0, 17);
  ball(top, sx, sy - 4, 4.6, 4.2, OLD_BONE);
  top.rect(Math.round(sx) - 3, Math.round(sy) - 5, 2, 2, DEEP).rect(Math.round(sx) + 1, Math.round(sy) - 5, 2, 2, DEEP);
  top.set(Math.round(sx), Math.round(sy) - 2, DEEP);
  return compose(under, [box, top], null).sprite(ox, oy, GRAIN);
}

/** A squat jar whose lid is a great skull, its sockets dark (the second look found the first a chess pawn). 36 x 44 at (18, 38). */
function skullJar(): Sprite {
  const W = 36;
  const H = 44;
  const cx = 18;
  const foot = 38;
  const top = 22;
  const body = new Px(W, H);
  const head = new Px(W, H);
  const under = new Px(W, H);
  const half = (t: number): number => 7 + 4.5 * Math.sin(Math.min(1, t) * Math.PI * 0.85);
  lit(body, ASH_CLAY, [0, 3], [0, 4], (l) => column(l, cx, top, foot - 1, half));
  hoop(body, cx, top + 6, half(0.35), 1, 1.4, OLD_BONE);
  // the skull: broad dome, deep sockets, a nose hole, a row of teeth
  ball(head, cx, top - 6, 7, 6.4, OLD_BONE);
  for (const sx of [-3, 2]) head.rect(cx + sx - 1, top - 7, 3, 3, DEEP);
  head.set(cx, top - 3, DEEP).set(cx - 1, top - 3, DEEP);
  for (let x = cx - 3; x <= cx + 3; x++) head.set(x, top - 1, x % 2 ? OLD_BONE[3] : OLD_BONE[1]);
  return compose(under, [body, head], null).sprite(cx, foot, GRAIN);
}

/**
 * WHAT A BREAKABLE LEAVES, on the floor where it stood (the second look found the first a thin
 * sliver, and the same for three of them). `kind`: the funeral urn (big shards with its red band,
 * a heap of ash), the squat urn (a handle and shards, ash), the skull jar (its skull rolled out,
 * shards). Drawn as the eye sees the floor: spread in an oval twice as wide as deep.
 */
function urnShards(kind: 'tall' | 'squat' | 'skull' = 'tall'): Sprite {
  const W = 56;
  const H = 36;
  const cx = 28;
  const cy = 20;
  const p = new Px(W, H);
  const under = new Px(W, H);
  if (kind !== 'skull') {
    // the ash: a low heap, lit on its upper left
    lit(under, [ASH[0], ASH[0], ASH[1], ASH[2], ASH[2]], [1, 2], [1, 2], (l) => l.ellipse(cx - 2, cy + 1, 10, 4, INK));
    for (let i = 0; i < 16; i++) under.set(cx - 14 + Math.floor(hash(i, 1, 41) * 26), cy - 3 + Math.floor(hash(i, 2, 41) * 9), hash(i, 3, 41) < 0.5 ? ASH[1] : ASH[2]);
  }
  const shards: ReadonlyArray<readonly [number, number, number, number, boolean]> = kind === 'tall'
    ? [[cx + 6, cy - 5, 9, 5, true], [cx - 15, cy + 1, 7, 4, false], [cx + 11, cy + 3, 6, 3, false], [cx - 4, cy + 5, 5, 3, true]]
    : [[cx + 7, cy - 3, 6, 4, false], [cx - 13, cy + 3, 5, 3, true], [cx + 10, cy + 5, 4, 3, false]];
  for (const [x, y, w, h, band] of shards) {
    // a curved piece of the pot: its outer face lit, its broken edge dark, the inside of the curve showing
    lit(p, ASH_CLAY, [1, 2], [1, 2], (l) => l.poly([[x, y + h], [x + 1, y], [x + w, y + 1], [x + w - 1, y + h]], INK));
    p.line(x + 1, y + h - 1, x + w - 2, y + h - 1, DEEP);
    if (band) p.line(x + 1, y + 1, x + w - 1, y + 2, WINE[2]);
  }
  if (kind === 'squat') {
    // a handle, still a loop
    for (let a = 0; a < Math.PI; a += 0.2) p.set(Math.round(cx - 6 + Math.cos(a) * 3), Math.round(cy - 4 - Math.sin(a) * 3), ASH_CLAY[3]);
  }
  if (kind === 'skull') {
    ball(p, cx - 4, cy - 1, 5, 4.4, OLD_BONE);
    p.rect(cx - 7, cy - 2, 2, 2, DEEP).rect(cx - 3, cy - 2, 2, 2, DEEP);
    p.set(cx - 5, cy + 1, DEEP);
  }
  return compose(under, [p], null).sprite(cx, cy, GRAIN);
}

/** What a broken bone box leaves: its planks split and scattered along the floor's lines, an iron corner, and the bones that were in it, a skull among them. */
function boxSplinters(): Sprite {
  const W = 60;
  const H = 36;
  const cx = 30;
  const cy = 20;
  const p = new Px(W, H);
  const under = new Px(W, H);
  // planks: along x (down to the right, a pixel in two) and along y (down to the left)
  for (const [x, y, len, way] of [[cx - 16, cy - 3, 12, 1], [cx + 3, cy + 2, 11, 1], [cx - 4, cy - 6, 9, -1], [cx + 12, cy - 4, 8, -1]] as const) {
    for (let k = 0; k < len; k++) {
      const xx = x + (way > 0 ? k : -k);
      const yy = y + Math.floor(k / 2);
      p.set(xx, yy, TIMBER[3]).set(xx, yy + 1, TIMBER[2]).set(xx, yy + 2, TIMBER[0]);
    }
  }
  p.rect(cx - 17, cy - 4, 2, 2, IRONS[3]);
  limb(p, cx - 6, cy + 4, cx + 4, cy + 6, 1.1, 1.1, OLD_BONE);
  limb(p, cx - 2, cy + 7, cx + 8, cy + 4, 1, 1, OLD_BONE);
  ball(p, cx + 9, cy - 1, 4, 3.6, OLD_BONE);
  p.rect(cx + 7, cy - 2, 2, 2, DEEP).set(cx + 11, cy - 2, DEEP);
  return compose(under, [p], null).sprite(cx, cy, GRAIN);
}

// =================================================================================================
// ON THE FLOOR: lying along its lines, at the middle of their floor

/** A fallen guard: a skeleton in the jailer's iron, a helm rolled from its skull, its spear broken by it. All of it lying flat on the floor's lines. */
function fallenGuard(): Sprite {
  const p = lying((l, under) => {
    // the legs: bones, then iron greaves
    limb(l, LCX + 8, LCY - 1, LCX + 20, LCY - 3, 1.3, 1.1, OLD_BONE);
    limb(l, LCX + 8, LCY + 3, LCX + 19, LCY + 5, 1.3, 1.1, OLD_BONE);
    limb(l, LCX + 18, LCY - 3, LCX + 24, LCY - 4, 2, 1.8, IRONS);
    limb(l, LCX + 17, LCY + 5, LCX + 23, LCY + 6, 2, 1.8, IRONS);
    // the breastplate over the ribs
    lit(l, IRONS, [1, 2], [1, 3], (q) => q.poly([[LCX - 8, LCY - 4], [LCX + 6, LCY - 5], [LCX + 9, LCY + 1], [LCX + 6, LCY + 5], [LCX - 8, LCY + 5]], INK));
    for (let x = LCX - 6; x < LCX + 6; x += 3) l.set(x, LCY, IRONS[0]);
    // an arm flung out along the floor's other line, its hand by the spear
    limb(l, LCX - 4, LCY - 4, LCX + 3, LCY - 11, 1.1, 1, OLD_BONE);
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

/** The jailer's keys dropped on the floor: a big ring of iron with two great keys on it, each with its round bow, its long shaft and its square bit, lying flat on the floor's lines (the second look found the first too small to read). */
function droppedKeys(): Sprite {
  const I = SMALL_IRON;
  const p = lying((out) => {
    const l = new Px(LW, LH);
    // a ring of iron, thick: lit on its upper left, in shade on its lower right, the floor in its middle
    const ring = (cx: number, cy: number, rx: number, ry: number, hole: number): void => {
      for (let y = Math.floor(cy - ry); y <= cy + ry; y++) {
        for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
          const d = ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2;
          if (d > 1 || d < hole) continue;
          const toLight = (x + 0.5 - cx) / rx + (y + 0.5 - cy) / ry;
          l.set(x, y, toLight < -0.7 ? I[3] : toLight < 0.4 ? I[2] : IRONS[2]);
        }
      }
    };
    // a great key: its bow at (x0, y0), its shaft `len` along x (dir 1 or -1), its bit hanging down off the end
    const key = (x0: number, y0: number, dir: 1 | -1, len: number): void => {
      ring(x0, y0, 3.6, 3, 0.3);
      for (let t = 3; t <= len; t++) {
        l.set(x0 + dir * t, y0, I[3]).set(x0 + dir * t, y0 + 1, I[1]);
      }
      // a collar where the shaft leaves the bow
      l.set(x0 + dir * 4, y0 - 1, I[3]).set(x0 + dir * 4, y0 + 2, I[1]);
      // the bit: a square block off the shaft's end, a notch cut in it
      for (let a = 0; a < 4; a++) for (let b = 2; b <= 6; b++) if (!(a === 1 && (b === 3 || b === 5))) l.set(x0 + dir * (len - a), y0 + b, b === 2 || a === 3 ? I[3] : I[2]);
    };
    ring(LCX - 6, LCY - 1, 7, 4.6, 0.45);
    key(LCX + 3, LCY - 2, 1, 17);
    key(LCX - 15, LCY + 3, -1, 13);
    // (the seam round them, so that they read against the floor)
    out.blit(compose(null, [l], null), 0, 0);
  });
  return p.sprite(LCX, LCY, GRAIN);
}

/** A banner fallen and crumpled, its rod still in its hem, lying along the floor's other line. */
function fallenBanner(): Sprite {
  const p = lying((l, under) => {
    lit(l, WINE, [1, 2], [1, 3], (q) => q.poly([[LCX - 20, LCY - 3], [LCX - 6, LCY - 6], [LCX + 4, LCY - 3], [LCX + 18, LCY - 5], [LCX + 21, LCY + 2], [LCX + 10, LCY + 6], [LCX - 2, LCY + 4], [LCX - 18, LCY + 5]], INK));
    for (const [x0, y0, x1, y1] of [[LCX - 12, LCY - 3, LCX - 4, LCY + 3], [LCX + 6, LCY - 2, LCX + 12, LCY + 4]] as const) l.line(x0, y0, x1, y1, WINE[1]);
    // the corner of its helm showing in a fold
    ball(l, LCX - 1, LCY, 2.4, 2, OLD_BONE);
    // (torn tongues at its foot end)
    for (let k = 0; k < 4; k++) l.line(LCX + 18 + k, LCY - 3 + k * 2, LCX + 24 + k, LCY - 2 + k * 2, WINE[2]);
    // the rod, across its head end: along the floor's other line (in this flat picture, at a slant: it lies flat once laid down)
    l.line(LCX - 17, LCY - 9, LCX - 27, LCY + 1, IRONS[3]);
    l.line(LCX - 17, LCY - 8, LCX - 27, LCY + 2, IRONS[0]);
  });
  return p.sprite(LCX, LCY, GRAIN);
}

/** The horned knight's head, broken from its statue and lying on its side in the dust: his great helm in stone, the dark slit of its eyes turned toward the eye, one horn up in the air and the other along the floor, the pale break of its neck (the second look found it the same blob as the iron helm; and marks on its face read as letters, then as a die). */
function effigyHead(): Sprite {
  const W = 52;
  const H = 42;
  const p = new Px(W, H);
  const horns = new Px(W, H);
  const cx = 25;
  const cy = 27;
  // the helm on its side: longer than it is high, its crown rounded to the left, lit on its top and upper left
  lit(p, STONE, [1, 3], [1, 4], (l) => l.poly([[cx - 12, cy - 3], [cx - 9, cy - 8], [cx - 3, cy - 10], [cx + 9, cy - 9], [cx + 11, cy - 6], [cx + 11, cy + 5], [cx + 8, cy + 7], [cx - 6, cy + 7], [cx - 11, cy + 3]], INK));
  // its face toward us: the eye-slit (upright, the helm on its side), deep, with a lit lip
  for (let y = cy - 6; y <= cy + 4; y++) p.set(cx + 1, y, DEEP).set(cx + 2, y, DEEP).set(cx + 3, y, STONE[4]);
  // the break at its neck: rough and pale, on its right
  for (let y = cy - 8; y <= cy + 6; y++) p.set(cx + 11 + Math.round(hash(y, 1, 51)), y, STONE[4]).set(cx + 12 + Math.round(hash(y, 2, 51)), y, STONE[3]);
  // the horns: one curving up into the air, the other lying along the floor
  for (let t = 0; t <= 1; t += 0.025) {
    const th = Math.round(3.6 * (1 - t)) + 1;
    const x = Math.round(cx - 7 - 8 * t);
    const y = Math.round(cy - 9 - 13 * t * t);
    for (let q = 0; q < th; q++) horns.set(x + q, y, q === 0 ? STONE[4] : q === th - 1 ? STONE[1] : STONE[3]);
    const x2 = Math.round(cx - 11 - 12 * t);
    const y2 = Math.round(cy + 5 + 2 * t * t);
    for (let q = 0; q < th; q++) horns.set(x2, y2 + q, q === 0 ? STONE[3] : STONE[1]);
  }
  return compose(null, [p, horns], null).sprite(cx, cy + 6, GRAIN);
}

/** A jailer's helm of iron, dropped and standing on its rim: a rusted dome, a nasal guard between two dark eye-holes, and two great curving horns of bone, pale against the dark iron (the second look found it the same blob as the statue's head). */
function droppedHelm(): Sprite {
  const W = 48;
  const H = 40;
  const p = new Px(W, H);
  const horns = new Px(W, H);
  const cx = 24;
  const foot = 32;
  // the dome, its rim on the floor
  lit(p, IRONS, [1, 3], [1, 3], (l) => {
    for (let y = foot - 15; y <= foot; y++) {
      const half = y < foot - 9 ? Math.round(Math.sqrt(Math.max(0, 1 - ((y - (foot - 9)) / 6.5) ** 2)) * 8) : 8;
      l.hline(cx - half, y, half * 2, INK);
    }
  });
  // its rim, a lit band; the eye-holes either side of the nasal; rust down from a rivet
  for (let x = cx - 8; x < cx + 8; x++) p.set(x, foot - 2, x < cx ? IRONS[3] : IRONS[2]);
  for (const s of [-1, 1]) for (let y = foot - 8; y <= foot - 5; y++) p.hline(cx + (s < 0 ? -5 : 2), y, 3, DEEP);
  p.vline(cx, foot - 9, 7, IRONS[3]).vline(cx + 1, foot - 9, 7, IRONS[1]);
  p.set(cx - 6, foot - 11, GLINT);
  for (let y = foot - 10; y < foot - 4; y++) if (hash(y, 3, 116) < 0.6) p.set(cx + 5, y, OLD_RUST[2]);
  // the horns of bone, from its sides, curving out and up
  for (const s of [-1, 1]) {
    for (let t = 0; t <= 1; t += 0.025) {
      const th = Math.round(3.4 * (1 - t)) + 1;
      const x = Math.round(cx + s * (8 + 9 * t));
      const y = Math.round(foot - 10 - 14 * t * t + 3 * t);
      for (let q = 0; q < th; q++) horns.set(x, y + q, q === 0 ? (t > 0.8 ? OLD_BONE[4] : OLD_BONE[3]) : q === th - 1 ? OLD_BONE[1] : OLD_BONE[2]);
    }
  }
  return compose(null, [p, horns], null).sprite(cx, foot, GRAIN);
}

/** The candles' canvas: tall and wide enough for their smoke dragged off by a draught. Their pool of wax at (CCX, CCY). */
const CW_ = 120;
const CH_ = 128;
const CCX = 40;
const CCY = 108;
/**
 * The candles in their old wax: where each stands (from the pool's middle) and how tall it is: a big
 * clump of them burnt down to all heights (the second look found the first too small to read). The
 * seventh went out long ago.
 */
const STICKS: ReadonlyArray<readonly [number, number, number]> = [[-14, 0, 12], [-8, -3, 20], [-2, -1, 26], [4, 2, 16], [9, -2, 22], [14, 1, 10], [-5, 4, 8], [2, -5, 14]];
/** The one long gone out. */
const COLD = 6;
/**
 * A FLAME of an honest fire: its foot at (x, base), `h` high, `w` its half width at its fullest, its
 * tip `lean` pixels over. Its rows are joined, so that leaning hard it bends and never breaks into
 * loose pixels (the second look found the gust's flames coming apart).
 */
function flame(p: Px, x: number, base: number, h: number, w: number, lean: number): void {
  let prev = x;
  for (let i = 0; i < h; i++) {
    const t = i / Math.max(1, h - 1);
    const hw = Math.max(0.5, w * Math.sin(Math.PI * (0.2 + t * 0.8)) ** 0.8 * (1 - t * 0.3));
    const mid = x + lean * t * t;
    let x0 = Math.floor(mid - hw);
    let x1 = Math.ceil(mid + hw);
    // (joined to the row under it)
    x0 = Math.min(x0, Math.round(prev));
    x1 = Math.max(x1, Math.round(prev) + 1);
    for (let xx = x0; xx < x1; xx++) {
      const d = Math.abs(xx + 0.5 - mid) / hw;
      p.set(xx, base - i, d < 0.45 && t < 0.45 ? EMBER[4] : d < 0.8 && t < 0.72 ? EMBER[3] : t > 0.86 ? EMBER[1] : EMBER[2]);
    }
    prev = mid;
  }
}
/** The candles: their wax, and on each wick what `wick` paints there (its flame; nothing; an ember). On the tall canvas, the pool at its anchor; the candles drawn far to near. */
function candlesPx(wick: (i: number, x: number, top: number, fire: Px, wax: Px) => void): { wax: Px; fire: Px } {
  const wax = new Px(CW_, CH_);
  const fire = new Px(CW_, CH_);
  wax.ellipse(CCX, CCY, 21, 7, WAX[1]);
  wax.ellipse(CCX - 1, CCY - 1, 18, 5.4, WAX[2]);
  for (let i = 0; i < 10; i++) wax.set(CCX - 16 + Math.floor(hash(i, 1, 61) * 32), CCY - 3 + Math.floor(hash(i, 2, 61) * 6), WAX[3]);
  const order = STICKS.map((_, i) => i).sort((m, n) => STICKS[m][1] - STICKS[n][1]);
  for (const i of order) {
    const [dx, dy, h] = STICKS[i];
    const x = CCX + dx;
    const y = CCY + dy;
    lit(wax, WAX, [0, 1], [0, 2], (l) => l.rect(x - 1, y - h, 3, h, INK));
    wax.set(x - 1, y - h, WAX[4]);
    // (wax run down its side)
    for (let k = 0; k < Math.floor(h / 7); k++) wax.set(x + (k % 2 ? 1 : -1), y - h + 2 + Math.floor(hash(i, k, 62) * (h - 3)), WAX[3]);
    wax.set(x, y - h - 1, INK);
    if (i !== COLD) wick(i, x, y - h - 1, fire, wax);
  }
  return { wax, fire };
}
/** A candle's flame as it burns still: small, flickering one way and back. */
function stillFlame(f: number, i: number, x: number, top: number, fire: Px): void {
  flame(fire, x, top, 5 + ((f + i) % 2), 1.5, [0, 1, 0, -1][(f + i) % 4]);
}
/** CANDLES IN THEIR OLD WAX, burning: frame `f` of four. `flames` false: all out. `out`: those that have gone out (the tallest, 1, after its moment). */
export function candles(f: number, flames = true, out: readonly number[] = []): Sprite {
  const { wax, fire } = candlesPx((i, x, top, fr) => {
    if (flames && !out.includes(i)) stillFlame(f, i, x, top, fr);
  });
  const s = compose(null, [wax], fire).sprite(CCX, CCY, GRAIN);
  if (flames) s.lights = [{ x: CCX / GRAIN, y: (CCY - 22) / GRAIN, r: 13 + (f % 2) - out.length * 1.5, color: EMBER[2], a: 0.42 }];
  return s;
}

/** A heavy chain of the jailer's lying in loose coils on the floor: each link a ring of iron a few pixels across, one lying flat with the floor in its middle, the next on its edge, rust on some (the second look found the first too small to read). */
function coiledChain(): Sprite {
  const W = 72;
  const H = 44;
  const cx = 36;
  const cy = 22;
  const p = new Px(W, H);
  const I = SMALL_IRON;
  // the path: a coil of a turn and a half, then a tail running off along x
  const pts: [number, number][] = [];
  for (let a = 0; a <= Math.PI * 3; a += 0.02) {
    const r = 0.1 + a * 0.03;
    pts.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  const [lx, ly] = pts[pts.length - 1];
  for (let k = 1; k <= 40; k++) pts.push([lx + k * 0.012, ly + k * 0.003]);
  let along = 0;
  let link = 0;
  for (let i = 1; i < pts.length; i++) {
    const [x, y] = pts[i];
    const [x0, y0] = pts[i - 1];
    along += Math.hypot((x - x0 - (y - y0)) * 32, (x - x0 + (y - y0)) * 16);
    if (along < 4.5) continue;
    along = 0;
    link++;
    const sx = Math.round(cx + (x - y) * 32);
    const sy = Math.round(cy + (x + y) * 16);
    const rust = hash(link, 1, 115) < 0.25;
    if (link % 2) {
      // a link lying flat: a ring five across and three deep, its middle the floor
      // (a glint on one link in four, not on every one: the third look found the chain sparkling)
      const top = link % 4 === 1 ? I[4] : I[3];
      for (const [dx, dy, c] of [[-2, 0, I[3]], [-1, -1, top], [0, -1, I[3]], [1, -1, I[2]], [2, 0, I[2]], [1, 1, I[1]], [0, 1, I[1]], [-1, 1, I[2]]] as const) p.set(sx + dx, sy + dy, rust && dx > 0 ? OLD_RUST[2] : c);
    } else {
      // on its edge: a bar, lit along its top, dark under
      for (let dx = -2; dx <= 2; dx++) p.set(sx + dx, sy, dx < 1 ? I[3] : I[2]).set(sx + dx, sy + 1, I[0]);
    }
  }
  return compose(null, [p], null).sprite(cx, cy, GRAIN);
}

// =================================================================================================
// TRAPS

/** The spike floor's tile: an iron grate let into the stone, a hole under each of the nine spikes; `glint`, the warning. Anchored at the middle, as the game's holes are. */
function spikeGrate(glint: boolean): Sprite {
  const t = tileOf(
    (u, v) => {
      const [x, y] = mid(u, v);
      // the nine holes, each in its square of the grate
      const cx = Math.round(x * 3) / 3;
      const cy = Math.round(y * 3) / 3;
      const d = Math.hypot(x - cx, y - cy);
      if (d < 0.05) return glint ? (d < 0.025 ? '#d8d4ff' : IRONS[3]) : DEEP;
      if (d < 0.075) return IRONS[0];
      const bar = Math.abs(((x + 0.5) * 3) % 1 - 0.5) < 0.08 || Math.abs(((y + 0.5) * 3) % 1 - 0.5) < 0.08;
      return bar ? IRONS[3] : IRONS[2];
    },
    box(0.04, 0.96, 0.04, 0.96),
  ).sprite(32, 0, GRAIN);
  // (the tile's own picture is anchored at its top corner; the game's holes at its middle)
  return { ...t, ay: t.ay + 8 };
}

/**
 * THE DART WALL'S PLATE: a square stone with a horned skull cut in it, a hair raised in its own gap
 * until it is trodden on; `pressed`, sunk flush. Only the plate is raised: the floor round it stays
 * where it is (the second look found the whole tile lifted). Anchored at the middle.
 */
function crownPlate(pressed: boolean): Sprite {
  const up = pressed ? 0 : 2;
  const inside = box(0.16, 0.84, 0.16, 0.84);
  const A = tileOf((u, v) => {
    const [x, y] = mid(u, v);
    // the skull, upright to the eye: (s, t) across and up the screen
    const s = (x - y) / 0.17;
    const t = -(x + y) / 0.17;
    const cran = s * s / 0.7 + (t - 0.15) ** 2 / 0.75 <= 1 && t > -0.35;
    const jaw = Math.abs(s) <= 0.5 && t <= -0.3 && t >= -0.95;
    const eye = Math.hypot(Math.abs(s) - 0.36, t - 0.05) <= 0.2;
    const horn = [-1, 1].some((k) => {
      for (let q = 0; q <= 1; q += 0.05) if (Math.hypot(s - k * (0.75 + 0.8 * q), t - (0.35 + 0.9 * q * q)) <= 0.16 * (1 - q) + 0.05) return true;
      return false;
    });
    if (eye) return DEEP;
    if (cran || jaw || horn) return pressed ? SLAB[0] : THEME.mortar;
    return pressed ? SLAB[1] : SLAB[2];
  }, inside);
  // the plate (inside its gap) set `up` rows higher; its near edges' sides under it
  const isPlate = (x: number, y: number): boolean => {
    if (x < 0 || y < 0 || x >= 64 || y >= 32) return false;
    const c = A.get(x, y);
    return !!c && c !== THEME.mortar && inside((x + 0.5 - 32) / 64 + (y + 0.5) / 32, (y + 0.5) / 32 - (x + 0.5 - 32) / 64) && !(A.get(x - 1, y) === THEME.mortar || A.get(x + 1, y) === THEME.mortar);
  };
  const out = new Px(64, 34);
  for (let y = 0; y < 32; y++) for (let x = 0; x < 64; x++) {
    const c = A.get(x, y);
    if (c && !isPlate(x, y)) out.set(x, y + 2, c);
  }
  for (let y = 0; y < 32; y++) for (let x = 0; x < 64; x++) {
    if (!isPlate(x, y)) continue;
    out.set(x, y + 2 - up, A.get(x, y)!);
    if (up && !isPlate(x, y + 1)) for (let k = 1; k <= up; k++) out.set(x, y + 2 - up + k, k === up ? THEME.mortar : SLAB[0]);
  }
  return out.sprite(32, 18, GRAIN);
}

// =================================================================================================
// DOORS AND GATES

/**
 * THE DOOR'S LEAF on this floor: heavy planks of old timber bound in the jailer's iron, studded,
 * a great lock. As the game's leaf (art/gates.ts, makeDoorLeaf): from its hinge (the anchor, on the
 * floor) to its free end, (ex, ey) picture pixels away along the floor.
 */
export function tombLeaf(ex: number, ey: number, high = 56, inShade = false): Sprite {
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
  return (inShade ? recolor(p, shaded) : p).sprite(ox, oy, GRAIN);
}

/** The face of a leaf turned more to screen-right than to screen-left is in shade (the second look found both turns alike). */
function leafOf(ex: number, ey: number): Sprite {
  const s = tombLeaf(ex, ey);
  const dx = (ex / 32 + ey / 16) / 2;
  const dy = (ey / 16 - ex / 32) / 2;
  if (Math.abs(dy) <= Math.abs(dx)) return s;
  // (painted again, shaded: the leaf along y shows its face turned to screen-right)
  return tombLeaf(ex, ey, 56, true);
}

/**
 * THE CROWN OVER THIS FLOOR'S GATES (art/gates.ts, a Mark): the king's crown cut in a roundel on the
 * arch's keystone, in stone, giving off no light. The boss's gate keeps the Warden's own rune, which
 * the owner said yes to for it (7 Oct, "Better"): this floor is his.
 */
const crownMark: Mark = (x, y, st, _lit, lightLow) => {
  const d = Math.hypot(x, y);
  if (d > 12.4) return null;
  const toLight = y - (lightLow ? x : -x);
  if (d > 11.4) return st.joint;
  if (d > 9.4) return toLight > 5 ? st.light : toLight < -6 ? st.dark : st.body;
  const part = crownAt(x / 7.5, (y + 0.5) / 7.5);
  if (part === 'hollow' || part === 'jewel') return st.joint;
  if (part) {
    // raised: lit on the edges toward the light
    const above = crownAt((x + (lightLow ? -1 : 1)) / 7.5, (y + 1.5) / 7.5);
    return above ? st.body : st.light;
  }
  return st.dark;
};

let gates: GateArt | null = null;
/** THIS FLOOR'S DOORS AND GATES, as the game's (art/gates.ts): its stone, the crown over its gates, the Warden's rune over his, its doors of old timber bound in iron. */
export function wardenGates(): GateArt {
  return gates ?? (gates = makeGateArt(THEME, { gateMark: crownMark, leaf: leafOf }));
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
  /**
   * What is there before it plays (a loop, played until it is set off; none: nothing is there), and
   * what is left when it is over (a loop or a still; none: nothing is). Its first frame is `before`'s
   * first, and its last is `after`'s first, so nothing pops as it starts or ends (the second look
   * found every moment popping at one end or the other).
   */
  before: Sprite[] | null;
  after: Sprite[] | null;
  /**
   * FOR THE CHECKS (tests/floor1.test.ts; the owner: "Animations need run the checks"): where each
   * thing that moves in it is, frame by frame, in picture pixels from the anchor (up is less), how
   * big it is drawn along the way it moves (its smear too), and how much of it shows (1 all of it, 0
   * none: gone into the dark of a hole, or snuffed out).
   */
  tracks: Track[];
  /** The frames on which a sudden change is meant (a stone striking the floor and breaking). */
  jolts: number[];
  /** The frames held on purpose (the freeze as the stone strikes: his rulebook, Movement 7). */
  holds: number[];
  /** (the rats) For each frame, how many pixels two of them share: never any. */
  contacts?: number[];
  /** A moment that plays in a wall's face: the same, for the face turned to screen-right (the frames above are for the one turned to screen-left). */
  right?: { frames: Sprite[]; before: Sprite[] | null; after: Sprite[] | null; tracks: Track[]; contacts?: number[] };
}
export interface Track {
  name: string;
  /** May it come into the picture after the first frame? From the edge of the picture (falling from the dark above), or born at a jolt. */
  fromEdge?: boolean;
  at: ({ x: number; y: number; shown: number; size: number } | null)[];
}

// -------------------------------------------------------------------------------------------------

/** Where (x, y) is in a four-cornered piece (corners a, b, c, d: along a to b, up a to d), as [along, up], each about 0..1. */
function quadUV(x: number, y: number, a: readonly [number, number], b: readonly [number, number], c: readonly [number, number], d: readonly [number, number]): [number, number] {
  let s = 0.5;
  let t = 0.5;
  for (let i = 0; i < 10; i++) {
    const ex = a[0] + (b[0] - a[0]) * s;
    const ey = a[1] + (b[1] - a[1]) * s;
    const gx = d[0] + (c[0] - d[0]) * s;
    const gy = d[1] + (c[1] - d[1]) * s;
    const px = ex + (gx - ex) * t;
    const py = ey + (gy - ey) * t;
    const dsx = (b[0] - a[0]) * (1 - t) + (c[0] - d[0]) * t;
    const dsy = (b[1] - a[1]) * (1 - t) + (c[1] - d[1]) * t;
    const dtx = gx - ex;
    const dty = gy - ey;
    const det = dsx * dty - dsy * dtx;
    if (Math.abs(det) < 1e-9) break;
    s += ((x - px) * dty - (y - py) * dtx) / det;
    t += (dsx * (y - py) - dsy * (x - px)) / det;
  }
  return [Math.max(0, Math.min(1, s)), Math.max(0, Math.min(1, t))];
}

/** Fill a polygon on the canvas, pixel by pixel (as Px.poly does), each pixel's colour from `colour(x, y)`. */
function fillWith(p: Px, pts: ReadonlyArray<readonly [number, number]>, colour: (x: number, y: number) => string | null): void {
  if (pts.length < 3) return;
  const ys = pts.map((q) => q[1]);
  for (let y = Math.floor(Math.min(...ys)); y < Math.ceil(Math.max(...ys)); y++) {
    const yc = y + 0.5;
    const xs: number[] = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      if ((a[1] <= yc && b[1] > yc) || (b[1] <= yc && a[1] > yc)) xs.push(a[0] + ((yc - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
    }
    xs.sort((m, n) => m - n);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      for (let x = Math.round(xs[k]); x < Math.round(xs[k + 1]); x++) {
        const c = colour(x, y);
        if (c) p.set(x, y, c);
      }
    }
  }
}

/** A block of stone in the world: its middle, its half sizes (along the wall and out from it in tiles, up in picture pixels), and how far it has turned over (about the line along the wall: its top toward the room). */
interface Rock {
  a: number;
  b: number;
  z: number;
  ha: number;
  hb: number;
  hz: number;
  turn: number;
}

/**
 * DUST AND A FALLING STONE: SOMETHING SHIFTS ABOVE YOU. A stone of the wall's upper course has worked
 * loose: before it goes, it sits in its place with a hairline crack round it (`before`). It shifts: the
 * crack opens and runs on into the stones beside it, grit pours out of it catching the light, the
 * stone shudders, tips out from the wall with a puff of dust and drops, turning over as it falls, out
 * of the dark where the wall fades and into the light; it strikes the floor at the wall's foot (the
 * jolt: the main chat's screen kick) and breaks: its smaller piece rolls away, chips fly and land, and
 * the dust bursts out along the floor and rises, each cloud of it swelling and then shrinking away.
 * What is left (`after`): the gap in the wall's course, the two pieces and the chips. For a face turned
 * to screen-left (`alongX`) or to screen-right; anchored at the foot of the face under the middle of
 * its tile, as a wall piece is. At 30 frames a second. (The second look found the first, a stone out
 * of the dark overhead, unseen for half a second; a drop, not a stone; frozen as it struck while the
 * game went on; and its dust a speckle.)
 */
function wallGivesWay(alongX: boolean): { frames: Sprite[]; before: Sprite[]; after: Sprite[]; tracks: Track[]; land: number; land2: number } {
  const W = 220;
  const H = 180;
  const ax = 110;
  const ay = 128;
  const G = 2.4;
  /** Picture pixels to a tile, for turning a block over (its depth is in tiles, its height in pixels). */
  const K = 40;
  const scr = (a: number, b: number, z: number): [number, number] => {
    const [x, y] = alongX ? [a, b] : [b, a];
    return [ax + (x - y) * 32, ay + (x + y) * 16 - z];
  };
  /** A column of the face's picture (u) as a place along the wall. */
  const aOf = (u: number): number => (alongX ? u : -u) / 32;
  // the stone: the long stone of the course from 48 to 62 up, the face's width of it (u -14 to 13); 0.24 deep
  const U0 = -14;
  const U1 = 13;
  const Z0 = 48;
  const Z1 = 62;
  const D = 0.24;
  const home: Rock = { a: (aOf(U0) + aOf(U1 + 1)) / 2, b: -D / 2, z: (Z0 + Z1 + 1) / 2, ha: (U1 + 1 - U0) / 64, hb: D / 2, hz: (Z1 + 1 - Z0) / 2, turn: 0 };
  // what each face of a block shows: up is lightest, to the left in between, to the right darkest (Pixels 4)
  const tone = (n: [number, number, number]): number => {
    const [na, nb, nz] = n;
    const [nx, ny] = alongX ? [na, nb] : [nb, na];
    const s = 0.95 * nz + 0.55 * ny + 0.15 * nx;
    return s > 0.7 ? 3 : s > 0.32 ? 2 : s > 0.02 ? 1 : 0;
  };
  /** A face's colour: by how it is turned (0 dark to 3 the top), and toward its lit edge (+1) or its dark one (-1), as the wall's own stones are. */
  const toneOf = (k: number, e: number): string => {
    const lit = [FACE[0], FACE[1], FACE[2], FACE[3], FACE[4]];
    if (k >= 2) return lit[Math.max(0, Math.min(4, k + e))];
    return shaded(lit[Math.max(0, Math.min(4, k + 1 + e))]);
  };
  /** The fade of the wall's top (onFace): up in the dark, a stone is as dark as the wall there. */
  const faded = (c: string, z: number, keep = 1): string => {
    const fromTop = 79 - z;
    return fromTop < 24 && keep > 0 ? mix(c, BEYOND, keep * [0.9, 0.66, 0.42, 0.2][Math.max(0, Math.floor((fromTop * 4) / 24))]) : c;
  };
  /** Draw a block: each face that is seen, only what of it is out in the room (not inside the wall), shaded and textured as a dressed stone. */
  const drawRock = (p: Px, r: Rock, seed: number, keep = 1): void => {
    const c = Math.cos(r.turn);
    const s = Math.sin(r.turn);
    const corner = (sa: number, sb: number, sz: number): [number, number, number] => {
      const B = sb * r.hb * K;
      const Z = sz * r.hz;
      return [r.a + sa * r.ha, r.b + (B * c + Z * s) / K, r.z - B * s + Z * c];
    };
    // the faces: four corners each (lower left, lower right, upper right, upper left as seen from outside) and its outward normal
    const faces: { q: [number, number, number][]; n: [number, number, number]; key: string }[] = [
      { q: [corner(-1, 1, -1), corner(1, 1, -1), corner(1, 1, 1), corner(-1, 1, 1)], n: [0, c, -s], key: 'front' },
      { q: [corner(-1, -1, 1), corner(1, -1, 1), corner(1, 1, 1), corner(-1, 1, 1)], n: [0, s, c], key: 'top' },
      { q: [corner(1, 1, -1), corner(1, -1, -1), corner(1, -1, 1), corner(1, 1, 1)], n: [1, 0, 0], key: 'end' },
      { q: [corner(-1, -1, -1), corner(-1, 1, -1), corner(-1, 1, 1), corner(-1, -1, 1)], n: [-1, 0, 0], key: 'end' },
      { q: [corner(1, -1, -1), corner(-1, -1, -1), corner(-1, -1, 1), corner(1, -1, 1)], n: [0, -c, s], key: 'back' },
      { q: [corner(-1, 1, -1), corner(-1, -1, -1), corner(1, -1, -1), corner(1, 1, -1)], n: [0, -s, -c], key: 'bottom' },
    ];
    for (const f of faces) {
      const [na, nb, nz] = f.n;
      const [nx, ny] = alongX ? [na, nb] : [nb, na];
      // (seen from the camera: up and toward the eye)
      if (0.62 * nx + 0.62 * ny + 0.49 * nz <= 0.02) continue;
      // only what is out of the wall: clipped to b >= 0
      const clipped: [number, number, number][] = [];
      for (let i = 0; i < 4; i++) {
        const A = f.q[i];
        const B = f.q[(i + 1) % 4];
        const inA = A[1] >= -1e-6;
        const inB = B[1] >= -1e-6;
        if (inA) clipped.push(A);
        if (inA !== inB) {
          const t = A[1] / (A[1] - B[1]);
          clipped.push([A[0] + (B[0] - A[0]) * t, 0, A[2] + (B[2] - A[2]) * t]);
        }
      }
      if (clipped.length < 3) continue;
      const pts = clipped.map((q) => scr(q[0], q[1], q[2]));
      const quad = f.q.map((q) => scr(q[0], q[1], q[2])) as [number, number][];
      const k = tone(f.n);
      // (the face's height at a point, for the fade: from three of its corners)
      const zs = f.q.map((q) => q[2]);
      fillWith(p, pts, (x, y) => {
        const [u, v] = quadUV(x + 0.5, y + 0.5, quad[0], quad[1], quad[2], quad[3]);
        const z = zs[0] + (zs[1] - zs[0]) * u + (zs[3] - zs[0]) * v;
        // its dressed face: lit along the edge toward the light, dark along the one away; a few marks of the chisel
        const e = v > 0.9 ? 1 : v < 0.1 || hash(Math.floor(u * 8), Math.floor(v * 6), seed) < 0.08 ? -1 : 0;
        return faded(toneOf(k, e), z, keep);
      });
    }
  };
  // the chips and the dust clouds of the strike, each its own way
  // (thrown well out, a tile and more, each bouncing once where it comes down: the third look found them falling short)
  const CHIPS = Array.from({ length: 12 }, (_, i) => ({ ang: hash(i, 1, 121) * Math.PI * 2, v: 0.05 + 0.06 * hash(i, 2, 121), up: 6 + 8 * hash(i, 3, 121) }));
  /** Where a chip is, k frames after the strike: along the floor from the strike (tiles), and up (pixels). */
  const chipAt = (c: { v: number; up: number }, k: number): [number, number] => {
    const t1 = (2 * c.up) / G;
    if (k <= t1) return [c.v * k, c.up * k - 0.5 * G * k * k];
    const up2 = c.up * 0.3;
    const t = Math.min(k - t1, (2 * up2) / G);
    return [c.v * t1 + c.v * 0.6 * t, Math.max(0, up2 * t - 0.5 * G * t * t)];
  };
  // (a ring of low clouds thrown fast along the floor, and a few slower billows that rise)
  const DUST = Array.from({ length: 16 }, (_, i) => {
    const billow = i % 4 === 0;
    return { ang: (i / 16) * Math.PI * 2 + hash(i, 1, 122) * 0.4, v: billow ? 0.035 + 0.02 * hash(i, 2, 122) : 0.12 + 0.07 * hash(i, 2, 122), r0: billow ? 3.5 : 1.8 + 1.2 * hash(i, 3, 122), grow: billow ? 7 : 4, rise: billow ? 0.6 : 0.15, life: (billow ? 36 : 24) + Math.floor(hash(i, 4, 122) * 8) };
  });
  const DUST_END = Math.max(...DUST.map((d) => d.life));
  /** Grit: grains out of the crack, from the frame each is loosed, falling. */
  const GRIT = Array.from({ length: 40 }, (_, i) => ({ born: 2 + Math.floor(i * 0.62), u: U0 + hash(i, 1, 123) * (U1 - U0), b: 0.02 + 0.04 * hash(i, 2, 123) }));
  // the timeline
  const SHAKE = 8;
  const TIP = 16;
  const DROP = 21;
  /** The shudder, frame by frame: across and up, in picture pixels (two to a game pixel). */
  const SHUDDER: ReadonlyArray<readonly [number, number]> = [[2, 1], [-2, 0], [3, 2], [-2, 0], [4, 1], [-3, 2], [4, 0], [-4, 2]];
  const tracks: Track[] = [
    { name: 'the stone', at: [] },
    { name: 'its broken half', at: [] },
    { name: 'the stone above it', at: [] },
    { name: 'a lump of the wall', at: [] },
  ];
  let land = -1;
  let landed: Rock | null = null;
  /** Where the stone is in frame f (before it strikes): in its place, shaking, tipping out on its foot's front edge, then falling free and turning over. */
  const stoneAt = (f: number): Rock => {
    const r: Rock = { ...home };
    if (f < SHAKE) return r;
    if (f < TIP) {
      // shuddering, harder as it works loose: one and two of the game's pixels this way and that,
      // jumping in its bed, creeping out of it (the third look found a picture pixel's shudder unseen)
      const [sa, sz] = SHUDDER[f - SHAKE];
      r.a += (sa / 32) * (alongX ? 1 : -1);
      r.z += sz;
      r.b += 0.03 * ((f - SHAKE) / (TIP - SHAKE));
      return r;
    }
    // tipping out about the front edge of its foot, then free
    const tipTo = 0.5;
    const pivotB = home.b + home.hb + 0.03;
    const tipped = (th: number): Rock => {
      // its middle swung about the pivot (at its foot's front edge) by th
      const dB = (home.b + 0.03 - pivotB) * K;
      const dZ = home.hz;
      return { ...r, b: pivotB + (dB * Math.cos(th) + dZ * Math.sin(th)) / K, z: Z0 - dB * Math.sin(th) + dZ * Math.cos(th), turn: th };
    };
    if (f < DROP) return tipped(tipTo * ((f - TIP + 1) / (DROP - TIP)) ** 1.5);
    const t = f - DROP + 1;
    const s = tipped(tipTo);
    return { ...s, b: s.b + 0.022 * t, z: s.z - 0.5 * G * t * t - 1.2 * t, turn: tipTo + 0.16 * t };
  };
  const lowest = (r: Rock): number => {
    let m = Infinity;
    for (const sb of [-1, 1]) for (const sz of [-1, 1]) m = Math.min(m, r.z - sb * r.hb * K * Math.sin(r.turn) + sz * r.hz * Math.cos(r.turn));
    return m;
  };
  // find where it strikes
  for (let f = DROP; f < DROP + 30; f++) {
    const r = stoneAt(f);
    if (lowest(r) <= 0) {
      land = f;
      landed = { ...r, z: r.z - lowest(r) };
      break;
    }
  }
  const L = landed!;
  // after the strike: the big piece rocks back flat; the small one breaks off and rolls away, slowing
  const bigAt = (k: number): Rock => {
    const flatTurn = Math.round(L.turn / (Math.PI / 2)) * (Math.PI / 2);
    const turn = k >= 4 ? flatTurn : L.turn + (flatTurn - L.turn) * (1 - (1 - k / 4) ** 2) + (k === 1 ? 0.08 : 0);
    const r: Rock = { ...L, ha: L.ha * 0.62, a: L.a - L.ha * 0.38, turn };
    return { ...r, z: r.z - lowest(r) };
  };
  const smallAt = (k: number): Rock => {
    const go = (1 - 0.86 ** k) / (1 - 0.86);
    const r: Rock = { ...L, ha: L.ha * 0.36, hb: L.hb * 0.9, hz: L.hz * 0.8, a: L.a + L.ha * 0.62 + 0.02 + 0.035 * go, b: L.b + 0.05 * go, turn: L.turn + 0.3 * go };
    return { ...r, z: r.z - lowest(r) };
  };
  // THE STONE ABOVE IT: the course over the gap has lost what held it up. As the stone strikes, the
  // stone over the gap's right half slips: it sags down into the gap and tips out, half out of its bed,
  // out of the dark into the light, jerks as it catches, and hangs there; it shivers, and gives way:
  // it drops, turning, and strikes the floor, the second blow (the third look asked for more of the
  // wall to give; the fourth found the hanging stone lost in the dark, and asked for a second strike).
  const SU0 = 1;
  const SU1 = 14;
  const SZ0 = 64;
  const SZ1 = 77;
  const slipHome: Rock = { a: (aOf(SU0) + aOf(SU1 + 1)) / 2, b: -D / 2, z: (SZ0 + SZ1 + 1) / 2, ha: (SU1 + 1 - SU0) / 64, hb: D / 2, hz: (SZ1 + 1 - SZ0) / 2, turn: 0 };
  const SLIP = [0, 0.04, 0.16, 0.36, 0.64, 1, 1.14, 0.95, 1.02, 1];
  const hangAt = (p: number): Rock => ({ ...slipHome, z: slipHome.z - 10 * p, b: slipHome.b + 0.12 * p, turn: 0.42 * p });
  const hung = hangAt(1);
  /** When it gives way, and how it falls from where it hung. */
  const FALL2 = land + 17;
  const fall2 = (t: number): Rock => ({ ...hung, b: hung.b + 0.035 * t, z: hung.z - 0.5 * G * t * t - 0.6 * t, turn: 0.42 + 0.2 * t });
  let land2 = -1;
  let L2: Rock = hung;
  for (let t = 1; t < 30; t++) {
    const r = fall2(t);
    if (lowest(r) <= 0) {
      land2 = FALL2 + t;
      L2 = { ...r, z: r.z - lowest(r) };
      break;
    }
  }
  const slipAt = (f: number, rest: boolean): Rock => {
    if (rest || f >= land2) {
      // down: it rocks back flat, sliding a little, and lies there
      const k = rest ? 999 : f - land2;
      const flatTurn = Math.round(L2.turn / (Math.PI / 2)) * (Math.PI / 2);
      const turn = k >= 4 ? flatTurn : L2.turn + (flatTurn - L2.turn) * (1 - (1 - k / 4) ** 2) + (k === 1 ? 0.08 : 0);
      const r: Rock = { ...L2, turn, b: L2.b + 0.015 * Math.min(k, 4) };
      return { ...r, z: r.z - lowest(r) };
    }
    if (f > FALL2) return fall2(f - FALL2);
    if (f <= land) return slipHome;
    const r = hangAt(SLIP[Math.min(SLIP.length - 1, f - land)]);
    // (it shivers before it goes)
    return f >= FALL2 - 4 ? { ...r, z: r.z + [1, 0, 2, 0, 1][f - (FALL2 - 4)], a: r.a + ([1, -1, 1, -2, 0][f - (FALL2 - 4)] / 32) * (alongX ? 1 : -1) } : r;
  };
  /** How much of the wall's fade it keeps: all of it in its bed, none once it has come out into the light. */
  const slipKeep = (f: number, rest: boolean): number => (rest || f > land + 5 ? 0 : f <= land ? 1 : Math.max(0, 1 - SLIP[f - land]));
  // THE SECOND BLOW'S dust and chips: fewer and smaller than the first's
  const DUST2 = Array.from({ length: 10 }, (_, i) => {
    const billow = i % 3 === 0;
    return { ang: (i / 10) * Math.PI * 2 + hash(i, 1, 131) * 0.5, v: billow ? 0.03 + 0.015 * hash(i, 2, 131) : 0.09 + 0.05 * hash(i, 2, 131), r0: billow ? 2.6 : 1.4 + hash(i, 3, 131), grow: billow ? 5 : 3, rise: billow ? 0.5 : 0.12, life: (billow ? 28 : 20) + Math.floor(hash(i, 4, 131) * 6) };
  });
  const CHIPS2 = Array.from({ length: 6 }, (_, i) => ({ ang: hash(i, 1, 132) * Math.PI * 2, v: 0.04 + 0.05 * hash(i, 2, 132), up: 5 + 6 * hash(i, 3, 132) }));
  // A LUMP OF THE WALL'S CORE, shaken out of the gap by the first blow: it drops, strikes the floor
  // with a puff of its own, hops once and lies there (twice the size it was: the fourth look)
  const LUMP_AT = land;
  const lumpHome = { a: slipHome.a - (alongX ? 1 : -1) * 0.12, b: 0.07, z: 50 };
  const LUMP_FALL = Math.ceil(Math.sqrt((2 * (lumpHome.z - 5)) / G));
  const lumpAt = (f: number, rest: boolean): Rock | null => {
    if (!rest && f < LUMP_AT) return null;
    const t = rest ? 999 : f - LUMP_AT;
    const base: Rock = { a: lumpHome.a, b: lumpHome.b, z: 0, ha: 6 / 32, hb: 0.12, hz: 5, turn: 0 };
    const sit = (r: Rock, up: number): Rock => ({ ...r, z: r.z - lowest(r) + up });
    if (t <= LUMP_FALL) {
      const r: Rock = { ...base, z: lumpHome.z - 0.5 * G * t * t, turn: 0.22 * t };
      return lowest(r) < 0 ? sit(r, 0) : r;
    }
    // the hop, out from the wall, coming to rest flat
    const h = Math.min(t - LUMP_FALL, 5);
    const t0 = 0.22 * LUMP_FALL;
    const flatT = Math.ceil(t0 / (Math.PI / 2)) * (Math.PI / 2);
    return sit({ ...base, b: base.b + 0.016 * h, turn: t0 + (flatT - t0) * (h / 5) }, Math.max(0, 3.2 * h - 0.64 * h * h));
  };
  // GRIT POURING after the strike, out of the gap's ledge and from under the hanging stone, thick at
  // first and thinning to nothing over a second; what comes down heaps up at the wall's foot
  const POUR = Array.from({ length: 44 }, (_, i) => {
    const under = i % 3 !== 0;
    return { born: land + 1 + Math.floor(26 * (i / 44) ** 1.5), u: under ? SU0 + hash(i, 1, 127) * (SU1 - SU0) : U0 + hash(i, 1, 127) * (U1 - U0), z0: under ? 57 : Z0 - 1, b: under ? 0.03 + 0.03 * hash(i, 2, 127) : 0.02 + 0.02 * hash(i, 2, 127), land: { db: 0.02 + 0.09 * hash(i, 3, 127) ** 1.5, da: (hash(i, 4, 127) - 0.5) * 0.06 } };
  });
  const pourFall = (g: { z0: number }): number => Math.ceil(Math.sqrt(g.z0 / 0.55));
  // (its last frame, what is left, follows straight on from the last wisp of dust)
  let lastDust = 0;
  for (let k = 0; k <= DUST_END; k++) {
    for (const d of DUST) {
      if (k >= d.life) continue;
      const r = (d.r0 + d.grow * (1 - Math.exp(-k / 5))) * (1 - (k / d.life) ** 2);
      if (r >= 0.6) lastDust = k;
    }
  }
  let lastDust2 = 0;
  for (let k = 0; k <= 40; k++) {
    for (const d of DUST2) {
      if (k >= d.life) continue;
      const r = (d.r0 + d.grow * (1 - Math.exp(-k / 5))) * (1 - (k / d.life) ** 2);
      if (r >= 0.6) lastDust2 = k;
    }
  }
  const END = Math.max(land + lastDust, land2 + lastDust2) + 1;
  const paint = (f: number, rest: boolean): Sprite => {
    const face = flat();
    const body = new Px(W, H);
    const over = new Px(W, H);
    // THE FACE: the bed of the stone, dark behind (its ledge lit), and the crack round it, opening and running on
    const open = rest ? 1 : Math.min(1, f / 10);
    for (let v = Z0; v <= Z1; v++) {
      for (let u = U0; u <= U1; u++) face.set(fx(u), fy(v), v === Z0 ? FACE[3] : v === Z0 + 1 ? FACE[2] : u === U1 ? FACE[1] : hash(u, v, 124) < 0.06 ? '#1b1426' : DEEP);
    }
    // (the hairline at its two ends, from the start; the joints over and under it opening; cracks running on into the stones beside it)
    for (let v = Z0; v <= Z1; v++) {
      face.set(fx(U0 - 1), fy(v), DEEP).set(fx(U0 - 2), fy(v), FACE[1]);
      face.set(fx(U1 + 1), fy(v), DEEP).set(fx(U1 + 2), fy(v), FACE[3]);
    }
    if (open > 0) {
      for (let u = U0; u <= U1; u++) if (hash(u, 1, 125) < open) face.set(fx(u), fy(Z1 + 1), DEEP).set(fx(u), fy(Z0 - 1), DEEP);
      const run = Math.round(open * 7);
      for (let i = 0; i < run; i++) {
        face.set(fx(U0 - 2 - i), fy(Z0 - 1 - Math.floor(i * 0.6)), DEEP);
        face.set(fx(U1 + 2 + Math.floor(i * 0.5)), fy(Z1 - 2 - i), DEEP);
      }
    }
    // (once the stone above has slipped: the dark of its bed, and the joints round it opened)
    if (rest || f > land) {
      for (let v = SZ0; v <= SZ1; v++) {
        for (let u = SU0 - 1; u <= SU1 + 1; u++) face.set(fx(u), fy(v), u === SU1 + 1 ? FACE[1] : hash(u, v, 128) < 0.06 ? '#1b1426' : DEEP);
      }
      for (let u = SU0 - 1; u <= SU1 + 1; u++) face.set(fx(u), fy(SZ1 + 1), DEEP);
    }
    body.blit(onFacePx(face, alongX), ax - PCX, ay - PFOOT);
    // the stone above, and the lump shaken out from under it
    const sl = slipAt(f, rest);
    const lu = lumpAt(f, rest);
    // (the farther of the two first)
    if (lu && lu.a + lu.b > sl.a + sl.b) drawRock(body, lu, 4);
    drawRock(body, sl, 3, slipKeep(f, rest));
    if (lu && lu.a + lu.b <= sl.a + sl.b) drawRock(body, lu, 4);
    // the chips of the second blow, where they come to rest
    if (rest || f >= land2) {
      const k2 = rest ? 999 : f - land2;
      for (const c of CHIPS2) {
        const [d, z] = chipAt(c, k2);
        const [x, y] = scr(L2.a + Math.cos(c.ang) * d, Math.max(0.02, L2.b + Math.sin(c.ang) * d), z);
        body.set(Math.round(x), Math.round(y), FACE[2]).set(Math.round(x) + 1, Math.round(y), FACE[1]);
      }
    }
    // the grit that pours after the strike: what has come down heaped at the wall's foot
    for (const g of POUR) {
      if (!rest && f - g.born < pourFall(g)) continue;
      const [x, y] = scr(aOf(g.u) + g.land.da, g.b + g.land.db, 0);
      body.set(Math.round(x), Math.round(y), hash(g.born, Math.round(g.u * 3), 129) < 0.5 ? FACE[2] : FACE[3]).set(Math.round(x) + 1, Math.round(y), FACE[1]);
    }
    const stone = tracks[0];
    const half = tracks[1];
    const centre = (r: Rock): { x: number; y: number } => {
      const [x, y] = scr(r.a, r.b, r.z);
      return { x: x - ax, y: y - ay };
    };
    if (!rest && f < land) {
      const r = stoneAt(f);
      drawRock(body, r, 1);
      stone.at[f] = { ...centre(r), shown: 1, size: 24 };
      half.at[f] = null;
    } else {
      const k = rest ? 999 : f - land;
      const big = bigAt(k);
      const small = smallAt(k);
      drawRock(body, big, 1);
      drawRock(body, small, 2);
      if (!rest) {
        stone.at[f] = { ...centre(big), shown: 1, size: 24 };
        half.at[f] = { ...centre(small), shown: 1, size: 16 };
      }
      // the chips: thrown out and up, coming down, bouncing once, and staying where they stop
      for (const c of CHIPS) {
        const [d, z] = chipAt(c, k);
        const a = L.a + Math.cos(c.ang) * d;
        const b = Math.max(0.02, L.b + Math.sin(c.ang) * d);
        const [x, y] = scr(a, b, z);
        body.set(Math.round(x), Math.round(y), c.v > 0.06 ? FACE[3] : FACE[2]).set(Math.round(x) + 1, Math.round(y), FACE[1]);
      }
      // the dust: clouds thrown out along the floor from the strike and rising, each swelling and then shrinking away
      if (!rest) {
        for (const d of DUST) {
          if (k >= d.life) continue;
          const go = (1 - 0.88 ** k) / (1 - 0.88);
          const a = L.a + Math.cos(d.ang) * d.v * go;
          const b = Math.max(0.02, L.b + Math.sin(d.ang) * d.v * go);
          const z = 4 * (1 - Math.exp(-k / 6)) + d.rise * k;
          const grow = d.r0 + d.grow * (1 - Math.exp(-k / 5));
          const r = grow * (1 - (k / d.life) ** 2);
          if (r < 0.6) continue;
          const [x, y] = scr(a, b, z);
          for (let yy = Math.floor(y - r); yy <= y + r; yy++) {
            for (let xx = Math.floor(x - r * 1.4); xx <= x + r * 1.4; xx++) {
              const q = (((xx + 0.5 - x) / 1.4) ** 2 + (yy + 0.5 - y) ** 2) / (r * r);
              if (q > 1) continue;
              // (soft at its rim: every other pixel there)
              if (q > 0.6 && (xx + yy) % 2 === 0) continue;
              const toLight = (xx - x + (yy - y)) / r;
              over.set(xx, yy, toLight < -0.8 ? STONE[4] : toLight < 0.5 ? STONE[3] : STONE[2]);
            }
          }
        }
      }
    }
    // grit out of the crack, catching the light as it falls, gone where it meets the floor
    if (!rest) {
      for (const g of GRIT) {
        const t = f - g.born;
        if (t < 0 || g.born > DROP + 4) continue;
        const z = Z0 - 1 - 0.55 * t * t;
        if (z < 1) continue;
        const [x, y] = scr(aOf(g.u), g.b, z);
        over.set(Math.round(x), Math.round(y), hash(g.born, Math.round(g.u), 126) < 0.5 ? STONE[4] : STONE[3]);
        if (t > 2) over.set(Math.round(x), Math.round(y) - 1, STONE[2]);
      }
      // puffs of dust out of the crack as it tips: from its top joint and its two ends, blown out and sinking, shrinking away
      if (f >= TIP && f < TIP + 12) {
        const k = f - TIP;
        for (const [du, dz] of [[-2, 10], [U1 - U0 + 2, 6]] as const) {
          const r = 1.5 + 2.6 * Math.sin((Math.PI * (k + 1)) / 13);
          const [x, y] = scr(aOf(U0 + du), 0.05 + 0.03 * k, Z0 + dz - 1.4 * k);
          for (let yy = Math.floor(y - r); yy <= y + r; yy++) {
            for (let xx = Math.floor(x - r * 1.3); xx <= x + r * 1.3; xx++) {
              const q = (((xx + 0.5 - x) / 1.3) ** 2 + (yy + 0.5 - y) ** 2) / (r * r);
              if (q > 1 || (q > 0.5 && (xx + yy) % 2 === 0)) continue;
              over.set(xx, yy, xx - x + (yy - y) < -r * 0.6 ? STONE[4] : STONE[3]);
            }
          }
        }
      }
      // the streak of its fall: pale lines trailing up off it as it drops fastest
      if (f >= DROP + 2 && f < land) {
        const r = stoneAt(f);
        const [x, y] = scr(r.a, r.b, r.z);
        for (const dx of [-6, -1, 4]) for (let k = 4; k < 18; k += 2) over.set(Math.round(x + dx), Math.round(y - 8 - k), k < 10 ? STONE[3] : STONE[2]);
      }
      /** A small cloud of dust, soft at its rim, lit on its upper left. */
      const cloud = (x: number, y: number, r: number): void => {
        for (let yy = Math.floor(y - r); yy <= y + r; yy++) {
          for (let xx = Math.floor(x - r * 1.3); xx <= x + r * 1.3; xx++) {
            const q = (((xx + 0.5 - x) / 1.3) ** 2 + (yy + 0.5 - y) ** 2) / (r * r);
            if (q > 1 || (q > 0.5 && (xx + yy) % 2 === 0)) continue;
            over.set(xx, yy, xx - x + (yy - y) < -r * 0.6 ? STONE[4] : STONE[3]);
          }
        }
      };
      // grit pouring after the strike: out of the gap's ledge and from under the hanging stone, falling, catching the light
      for (const g of POUR) {
        const t = f - g.born;
        if (t < 0 || t >= pourFall(g)) continue;
        const z = g.z0 - 0.55 * t * t;
        if (z < 1) continue;
        const [x, y] = scr(aOf(g.u), g.b + g.land.db * (t / pourFall(g)), z);
        over.set(Math.round(x), Math.round(y), hash(g.born, Math.round(g.u * 3), 126) < 0.5 ? STONE[4] : STONE[3]);
        if (t > 2) over.set(Math.round(x), Math.round(y) - 1, STONE[2]);
      }
      // dust bursting out from under the stone above as it slips down into the gap (below where the wall fades)
      if (f > land && f <= land + 10) {
        const k = f - land - 1;
        const r = 1.2 + 2.4 * Math.sin((Math.PI * (k + 1)) / 11);
        for (const [u, z] of [[SU0 + 1, 58], [SU1 - 1, 55], [(SU0 + SU1) / 2, 57]] as const) {
          const [x, y] = scr(aOf(u), 0.04 + 0.025 * k, z - 1.2 * k);
          cloud(x, y, r);
        }
      }
      // the lump's own puff where it strikes, thrown out low each way
      const lk = f - LUMP_AT - LUMP_FALL;
      if (lk >= 0 && lk < 10) {
        for (const s of [-1, 1]) {
          const [x, y] = scr(lumpHome.a + s * 0.03 * (1 + lk), lumpHome.b + 0.02 * lk, 2 + 0.4 * lk);
          cloud(x, y, (1.4 + 1.6 * Math.sin((Math.PI * (lk + 1)) / 11)));
        }
      }
      // (the lump smeared as it drops fastest: a short streak up off it)
      let smear = 0;
      const lt = f - LUMP_AT;
      if (lu && lt >= 3 && lt <= LUMP_FALL) {
        smear = Math.min(10, Math.round(G * lt * 0.8));
        const [x, y] = scr(lu.a, lu.b, lu.z + lu.hz);
        for (let k = 1; k <= smear; k++) if (k % 3 !== 0) over.set(Math.round(x), Math.round(y) - k, k < 5 ? STONE[3] : STONE[2]);
      }
      // the second blow's dust, thrown out low and rising, smaller than the first's
      if (f >= land2) {
        const k2 = f - land2;
        for (const d of DUST2) {
          if (k2 >= d.life) continue;
          const go = (1 - 0.88 ** k2) / (1 - 0.88);
          const r = (d.r0 + d.grow * (1 - Math.exp(-k2 / 5))) * (1 - (k2 / d.life) ** 2);
          if (r < 0.6) continue;
          const [x, y] = scr(L2.a + Math.cos(d.ang) * d.v * go, Math.max(0.02, L2.b + Math.sin(d.ang) * d.v * go), 3 * (1 - Math.exp(-k2 / 6)) + d.rise * k2);
          cloud(x, y, r);
        }
      }
      // (the stone above smeared as it drops fastest: pale lines trailing up off it)
      let streak = 0;
      if (f > FALL2 + 1 && f < land2) {
        streak = Math.min(12, Math.round(G * (f - FALL2) * 0.7));
        const [x, y] = scr(sl.a, sl.b, sl.z + sl.hz);
        for (const dx of [-4, 3]) for (let k = 2; k <= streak; k += 2) over.set(Math.round(x + dx), Math.round(y) - k, k < 7 ? STONE[3] : STONE[2]);
      }
      tracks[2].at[f] = { ...centre(sl), shown: 1, size: 16 + streak };
      tracks[3].at[f] = lu ? { ...centre(lu), shown: 1, size: 12 + smear } : null;
    }
    return compose(null, [body], over).sprite(ax, ay, GRAIN);
  };
  const frames: Sprite[] = [];
  for (let f = 0; f <= END; f++) frames.push(f === END ? paint(f, true) : paint(f, false));
  for (const t of tracks) {
    t.at.length = frames.length;
    for (let f = 0; f < frames.length; f++) if (t.at[f] === undefined) t.at[f] = t.at[f - 1] ?? null;
  }
  // (before: the stone in its place, the hairline round it; after: what is left)
  const before = [paint(0, false)];
  return { frames, before, after: [paint(END, true)], tracks, land, land2 };
}

// -------------------------------------------------------------------------------------------------

/**
 * The rats' fur: a dusty grey-brown, its back lit, against the floor's indigo (the second look found
 * the first pale mice, and the next too dark to see on the floor; the third, counting their pixels,
 * most of them darker than the floor: their shaded side is a warm dark grey now, not black).
 */
const FUR: Ramp = ['#140f12', '#3e3238', '#4c3c42', '#78626a', '#9e8890'];
/** The dust the rats kick up off the floor: its rim, its middle, its lit edge. */
const RAT_DUST = ['#3e3a52', '#4a4660', '#58526a'] as const;

/**
 * RATS BOLT. Three rats feed on a scatter of bones (`before`, a loop). Something startles them: all
 * three freeze together, heads up, sniffing; then they bolt at once for a hole at the foot of the
 * wall, each turning as it runs, its body bending after its head along the way it has run, its feet
 * gripping the floor and kicking up dust as it pushes off. At the hole they pile up: the first
 * squeezes in head first while the others wait at its sides, scrabbling, each going in as the one
 * before is through, the last tail whipping in after it. None ever goes through another (the second
 * look found the first rats queueing politely and snapping round in a frame, tails flickering, feet
 * sliding, and too dark to see). Built in the world (a along the wall, b out from it, in tiles); what
 * is past the wall's face has gone into the hole. For a hole in a face turned to screen-left (`alongX`)
 * or to screen-right; anchored at the hole's mouth (ratHole). `after`: the bones, the rats gone.
 */
function ratsBolt(alongX: boolean): { frames: Sprite[]; before: Sprite[]; after: Sprite[]; tracks: Track[]; contacts: number[] } {
  const W = 300;
  const H = 170;
  const ax = alongX ? 170 : 130;
  const ay = 50;
  const scr = (a: number, b: number, z: number): [number, number] => {
    const [x, y] = alongX ? [a, b] : [b, a];
    return [ax + (x - y) * 32, ay + (x + y) * 16 - z];
  };
  /** How far out from the wall's face a pixel is, for a rat's height off the floor (4 pixels). */
  const outAt = (px: number, py: number): number => (alongX ? ((py + 4 - ay) / 16 - (px - ax) / 32) / 2 : ((py + 4 - ay) / 16 + (px - ax) / 32) / 2);
  /**
   * Parts along a rat, from its snout back: how far behind its snout (tiles), how high, how wide, how
   * tall. A big rat of the tombs, a third bigger than life, so that it reads at a glance.
   */
  const PARTS: ReadonlyArray<readonly [number, number, number, number]> = [
    [0, 3.6, 1.8, 1.4], [0.065, 4.1, 3.4, 2.7], [0.17, 4.3, 5.5, 4.2], [0.29, 4.1, 5.7, 4.2], [0.38, 3.6, 4.4, 3.4],
  ];
  const TAIL = 0.44;
  const TAIL_END = 0.9;
  const RUN = 0.17;
  const MOUTH = 0.3;
  const FREEZE = 3;
  const BOLT = 10;
  const N = 90;
  // where each feeds and which way it faces the bones (an angle on the floor: 0 is +a, PI/2 is +b)
  const rats = [
    { a: 0.08, b: 1.5, h: 1.45 },
    { a: -0.72, b: 2.15, h: 0.25 },
    { a: 0.78, b: 2.5, h: 3.4 },
  ];
  // the queue: the nearest the hole goes first; the others wait at its sides
  const WAIT: ReadonlyArray<readonly [number, number]> = [[0, MOUTH], [-0.36, 0.5], [0.36, 0.62]];
  /** Each rat's snout, frame by frame: where it is, which way it faces, how fast it goes, and what it is doing. */
  interface State { a: number; b: number; h: number; v: number; doing: 'feed' | 'freeze' | 'run' | 'wait' | 'in' }
  const path: [number, number][][] = rats.map((r) => {
    // (behind it, as it stands: a straight line back from its snout)
    const out: [number, number][] = [];
    for (let k = 12; k >= 1; k--) out.push([r.a - Math.cos(r.h) * 0.1 * k, r.b - Math.sin(r.h) * 0.1 * k]);
    return out;
  });
  const states: State[][] = rats.map(() => []);
  const cur: State[] = rats.map((r) => ({ a: r.a, b: r.b, h: r.h, v: 0, doing: 'feed' }));
  /** How far back along its run a point `back` tiles behind its snout is: [a, b, way along]. */
  const along = (i: number, f: number, back: number): [number, number, number] => {
    const pts = [...path[i].slice(0, path[i].length - (states[i].length - 1 - f)), [states[i][f].a, states[i][f].b] as [number, number]];
    let left = back;
    for (let k = pts.length - 1; k > 0; k--) {
      const [x1, y1] = pts[k];
      const [x0, y0] = pts[k - 1];
      const d = Math.hypot(x1 - x0, y1 - y0);
      if (d >= left && d > 1e-9) {
        const t = left / d;
        return [x1 + (x0 - x1) * t, y1 + (y0 - y1) * t, Math.atan2(y1 - y0, x1 - x0)];
      }
      left -= d;
    }
    const [x0, y0] = pts[0];
    return [x0, y0, states[i][f].h];
  };
  /** How much of a rat is past the mouth (its rump, 0.38 behind its snout, in the hole). */
  const through = (i: number, f: number): boolean => along(i, f, 0.3)[1] < 0.02;
  // RUN THEM: frame by frame, each steering for its goal, turning no faster than a rat can
  for (let f = 0; f < N; f++) {
    for (let i = 0; i < rats.length; i++) {
      const s = cur[i];
      if (f >= FREEZE && s.doing === 'feed') s.doing = 'freeze';
      if (f >= BOLT && s.doing === 'freeze') s.doing = 'run';
      if (s.doing === 'run' || s.doing === 'wait' || s.doing === 'in') {
        // its goal: the mouth if the one before it is through (or it is first), else its place at the side
        const ahead = i > 0 ? states[i - 1].length - 1 : -1;
        const clear = i === 0 || (ahead >= 0 && through(i - 1, ahead));
        const [ga, gb] = s.b < MOUTH + 0.04 && clear ? [0, -2] : clear ? [0, MOUTH] : WAIT[i];
        const da = ga - s.a;
        const db = gb - s.b;
        const dist = Math.hypot(da, db);
        // (at its place at the side it faces the hole, pressing at it, not its own place)
        const want = !clear && dist < 0.08 ? Math.atan2(MOUTH - s.b, -s.a) : Math.atan2(db, da);
        let turn = want - s.h;
        while (turn > Math.PI) turn -= Math.PI * 2;
        while (turn < -Math.PI) turn += Math.PI * 2;
        // (spinning round on the spot as it starts, but running no more than 0.3 a frame: the third look found 0.6 at a run a snap)
        const most = 0.3 + 0.3 * Math.max(0, 1 - s.v / 0.06);
        s.h += Math.max(-most, Math.min(most, turn));
        // its speed: flat out; slowing to its place at the side, and while the widest of it squeezes through the mouth
        const squeeze = s.b < 0.16 && s.b > -0.42;
        const top = !clear ? Math.min(RUN, dist * 0.45) : squeeze ? RUN * 0.45 : RUN;
        s.v = s.v < top ? Math.min(top, s.v + RUN * 0.34) : Math.max(top, s.v - RUN * 0.5);
        // (facing well away from where it wants to go, it turns before it runs)
        // (facing well away from where it wants to go, it wheels round tight, hardly moving, before it runs)
        if (Math.abs(turn) > 1.2) s.v = Math.min(s.v, 0.04);
        const go = Math.abs(turn) > 1.2 ? s.v * 0.5 : s.v;
        if (!clear && dist < 0.05) s.doing = 'wait';
        else s.doing = s.b < MOUTH ? 'in' : 'run';
        s.a += Math.cos(s.h) * Math.min(go, dist + (clear ? 1 : 0));
        s.b += Math.sin(s.h) * Math.min(go, dist + (clear ? 1 : 0));
      }
      states[i].push({ ...s });
      path[i].push([s.a, s.b]);
    }
    // all of them in?
    if (f > BOLT && rats.every((_, i) => along(i, f, TAIL_END + 0.05)[1] < -0.02)) break;
  }
  const NF = states[0].length;
  // THE FEET: each planted where it is put down, stepping on when its body has gone a stride past it
  const FEET: ReadonlyArray<readonly [number, number]> = [[0.1, 1], [0.1, -1], [0.3, 1], [0.3, -1]];
  const feet: [number, number][][][] = rats.map(() => []);
  for (let i = 0; i < rats.length; i++) {
    let planted: [number, number][] = [];
    for (let f = 0; f < NF; f++) {
      const want = FEET.map(([back, side]) => {
        const [a, b, h] = along(i, f, back);
        return [a - Math.sin(h) * 0.045 * side + Math.cos(h) * 0.025, b + Math.cos(h) * 0.045 * side + Math.sin(h) * 0.025] as [number, number];
      });
      if (f === 0) planted = want.map((q) => [...q] as [number, number]);
      const scrabble = states[i][f].doing === 'wait';
      let stepped = 0;
      planted = planted.map((p, k) => {
        const [wa, wb] = want[k];
        const far = Math.hypot(wa - p[0], wb - p[1]);
        // (a trot: the two diagonal pairs by turns; scrabbling at the hole, every foot every other frame)
        const turnOf = (k === 0 || k === 3 ? 0 : 1) === f % 2;
        if ((far > 0.07 && turnOf && stepped < 2) || (scrabble && turnOf)) {
          stepped++;
          const [, , h] = along(i, f, FEET[k][0]);
          return [wa + Math.cos(h) * (scrabble ? 0.02 : 0.03), wb + Math.sin(h) * (scrabble ? 0.02 : 0.03)];
        }
        return p;
      });
      feet[i].push(planted.map((q) => [...q] as [number, number]));
    }
  }
  // DUST KICKED UP from its hind feet as it pushes off, and as it scrabbles at the hole: puffs that
  // swell, drift back and up, and linger a quarter of a second (the third look found them too small to see)
  const PUFFS: { f0: number; a: number; b: number; h: number; life: number; size: number }[] = [];
  for (let i = 0; i < rats.length; i++) {
    for (let f = 0; f < NF; f++) {
      const st = states[i][f];
      // (at the push-off, two, and scrabbling at the hole, one every third frame: not a string of them)
      if (!((st.doing === 'run' && (f === BOLT || f === BOLT + 2)) || (st.doing === 'wait' && (f + i) % 3 === 0))) continue;
      const [ra, rb, rh] = along(i, f, 0.36);
      const side = (f + i) % 2 ? 1 : -1;
      PUFFS.push({ f0: f, a: ra - Math.cos(rh) * 0.06 - Math.sin(rh) * 0.03 * side, b: rb - Math.sin(rh) * 0.06 + Math.cos(rh) * 0.03 * side, h: rh, life: Math.min(8, NF - 1 - f), size: 0.7 + 0.6 * hash(f, i, 133) });
    }
  }
  const BONES = (q: Px): void => {
    for (const [a, b, a2, b2] of [[-0.2, 1.75, 0.15, 1.85], [0.2, 2.05, 0.45, 1.95], [-0.45, 2.45, -0.1, 2.5]] as const) {
      const [x0, y0] = scr(a, b, 0);
      const [x1, y1] = scr(a2, b2, 0);
      limb(q, x0, y0, x1, y1, 1, 1, OLD_BONE);
    }
    const [sx, sy] = scr(0.35, 2.3, 0);
    ball(q, sx, sy - 2, 3, 2.6, OLD_BONE);
    q.set(Math.round(sx) - 1, Math.round(sy) - 2, DEEP);
  };
  const tracks: Track[] = rats.map((_, i) => ({ name: `rat ${i + 1}`, at: [] }));
  const contacts: number[] = [];
  /** One frame: each rat at frame `f` (its feeding loop's frame `loop` while it feeds). */
  const paint = (f: number, loop: number, record: boolean): Sprite => {
    const p = new Px(W, H);
    // (the rats on a layer of their own, each already seamed: not seamed again with the bones, which would ring them twice in ink)
    const rl = new Px(W, H);
    const over = new Px(W, H);
    BONES(p);
    // far ones first
    const order = rats.map((_, i) => i).sort((m, n) => states[m][f].a + states[m][f].b - (states[n][f].a + states[n][f].b));
    let touching = 0;
    for (let i = 0; i < rats.length; i++) for (let j = i + 1; j < rats.length; j++) {
      for (const [bi, , ri] of PARTS.map(([bk, , rx]) => [bk, 0, rx / 32] as const)) {
        for (const [bj, , rj] of PARTS.map(([bk, , rx]) => [bk, 0, rx / 32] as const)) {
          const [a1, b1] = along(i, f, bi);
          const [a2, b2] = along(j, f, bj);
          if (b1 > 0 && b2 > 0 && Math.hypot(a1 - a2, b1 - b2) < (ri + rj) * 0.8) touching++;
        }
      }
    }
    for (const i of order) {
      const st = states[i][f];
      const feeding = st.doing === 'feed';
      const frozen = st.doing === 'freeze';
      const busy = st.doing === 'wait';
      const q = new Px(W, H);
      // its tail, trailing along the way it ran, a slow wave down it (faster as it whips in)
      const tail: [number, number][] = [];
      for (let k = TAIL; k <= TAIL_END + 1e-9; k += 0.03) {
        const [a, b, h] = along(i, f, k);
        const amp = (feeding || frozen ? 0.012 : st.doing === 'in' ? 0.04 : 0.026) * ((k - TAIL) / (TAIL_END - TAIL));
        const wave = Math.sin(f * (feeding ? 0.2 : 0.35) + i * 2 - k * 7) * amp;
        tail.push(scr(a - Math.sin(h) * wave, b + Math.cos(h) * wave, 1));
      }
      for (let k = 1; k < tail.length; k++) q.line(Math.round(tail[k - 1][0]), Math.round(tail[k - 1][1]), Math.round(tail[k][0]), Math.round(tail[k][1]), k < tail.length / 2 ? FUR[2] : FUR[3]);
      // its legs: from under its body to where each foot is planted
      FEET.forEach(([back], k) => {
        const [a, b] = along(i, f, back);
        const [bx, by] = scr(a, b, 2.5);
        const [fx_, fy_] = scr(feet[i][f][k][0], feet[i][f][k][1], 0);
        q.line(Math.round(bx), Math.round(by), Math.round(fx_), Math.round(fy_), FUR[0]);
      });
      // its body, rump first so the nearer parts are over the farther; head up while it freezes, dipping while it feeds
      for (let k = PARTS.length - 1; k >= 0; k--) {
        const [back, z, rx, ry] = PARTS[k];
        const [a, b] = along(i, f, back);
        // (sniffing in a slow rhythm, three frames up and three down: the third look found a pixel's flicker every frame a buzz)
        const lift = k <= 1 ? (frozen ? 2 + (Math.floor((f + i) / 3) % 2) : feeding ? [0, -1, -2, -1][(loop + i) % 4] : busy ? Math.floor(f / 2) % 2 : 0) : 0;
        const bound = (st.doing === 'run' || st.doing === 'in') && k === 2 && f % 2 ? 1 : 0;
        const [px, py] = scr(a, b, z + lift + bound);
        ball(q, px, py, rx, ry, FUR);
      }
      // its ears (pricked up when it freezes) and its eye
      const [ea, eb] = along(i, f, 0.09);
      const [ex, ey] = scr(ea, eb, 7.4 + (frozen ? 2 : 0));
      q.set(Math.round(ex) - 1, Math.round(ey) - 1, FUR[4]).set(Math.round(ex) + 1, Math.round(ey) - 1, FUR[4]);
      if (frozen) q.set(Math.round(ex) - 1, Math.round(ey) - 2, FUR[3]).set(Math.round(ex) + 1, Math.round(ey) - 2, FUR[3]);
      const [ha, hb] = along(i, f, 0.05);
      const [hx, hy] = scr(ha, hb, 5.6 + (frozen ? 2 : 0));
      q.set(Math.round(hx), Math.round(hy), DEEP);
      // (the seam round it, so that it reads against the floor)
      const seamed = compose(null, [q], null);
      // what of it is past the wall's face has gone into the hole's dark: pixel by pixel
      let all = 0;
      let shown = 0;
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const c = seamed.get(x, y);
          if (!c) continue;
          all++;
          if (outAt(x, y) < 0) continue;
          shown++;
          rl.set(x, y, c);
        }
      }
      if (record) {
        const [tx, ty] = scr(st.a, st.b, 0);
        // (its snout: a small thing, so that the checks hold it to small steps)
        tracks[i].at.push({ x: tx - ax, y: ty - ay, shown: all ? shown / all : 0, size: 8 });
      }
    }
    // the dust they kick up: each puff swells, drifts back and up off the floor, and lingers
    for (const pf of PUFFS) {
      const age = f - pf.f0;
      if (age < 0 || age >= pf.life) continue;
      const r = (1.4 + 1.8 * Math.sin((Math.PI * (age + 1)) / (pf.life + 1))) * pf.size;
      const back = 0.025 * age;
      const [x, y] = scr(pf.a - Math.cos(pf.h) * back, pf.b - Math.sin(pf.h) * back, 1.5 + 0.6 * age);
      if (outAt(x, y) < 0) continue;
      for (let yy = Math.floor(y - r); yy <= y + r; yy++) {
        for (let xx = Math.floor(x - r * 1.4); xx <= x + r * 1.4; xx++) {
          const q2 = (((xx + 0.5 - x) / 1.4) ** 2 + (yy + 0.5 - y) ** 2) / (r * r);
          if (q2 > 1 || (q2 > 0.55 && (xx + yy) % 2 === 0) || outAt(xx, yy) < 0) continue;
          // (the floor's own dust: a step or two lighter than the floor, never as light as their fur: the fourth look found it glowing)
          over.set(xx, yy, xx - x + (yy - y) < -r * 0.5 ? RAT_DUST[2] : q2 < 0.5 ? RAT_DUST[1] : RAT_DUST[0]);
        }
      }
    }
    if (record) contacts.push(touching);
    const out = compose(null, [p], null);
    out.blit(rl, 0, 0);
    out.blit(over, 0, 0);
    return out.sprite(ax, ay, GRAIN);
  };
  const frames: Sprite[] = [];
  for (let f = 0; f < NF; f++) frames.push(paint(f, f, true));
  // tracks in the order of the rats, not the order they were drawn
  // (before: the feeding loop, its first frame the bolt's first; after: the bones, the rats gone)
  const before = [0, 1, 2, 3].map((k) => paint(0, k, false));
  const after = [(() => {
    const q = new Px(W, H);
    BONES(q);
    return compose(null, [q], null).sprite(ax, ay, GRAIN);
  })()];
  return { frames, before, after, tracks, contacts };
}

// -------------------------------------------------------------------------------------------------

/**
 * THE CANDLES GUTTER in a draught as the hero passes. They burn still (its first frame is the candles'
 * own); a gust comes: every flame is torn over and streams out flat, two and three times its height,
 * flaring, sparks ripped off it and flying downwind, dying; ash and grit skate across the floor
 * through the wax. The tallest is beaten down and snuffed, then the next, then a third, each wick a
 * red ember that dies, each throwing up a thick plume of smoke that the draught drags off sideways
 * before it can rise; the light falls as each goes. The gust eases; the flames left stand up again,
 * the smoke rises and thins away. Its last frame is the candles with three out, which they stay. At 30
 * frames a second (the second look found the first a timid flicker of a few pixels).
 */
function candleGutters(): Moment {
  const FPS = 30;
  // (its last frame, the candles' own, falls on the first of their four: (N - 1) a multiple of 4)
  const N = 61;
  /** How hard the draught blows, 0 to 1, frame by frame: coming on fast, gusting, easing off. */
  const gust = (f: number): number => (f <= 0 ? 0 : f < 8 ? 1 - (1 - f / 8) ** 2 : f < 26 ? 0.9 + 0.1 * Math.sin(f * 1.7) : f < 40 ? ((40 - f) / 14) ** 2 : 0);
  /** Which go out, in turn, and on which frame: the tallest first. */
  const OUT: ReadonlyArray<readonly [number, number]> = [[2, 12], [4, 17], [1, 22]];
  const outOf = (i: number): number => OUT.find((o) => o[0] === i)?.[1] ?? Infinity;
  const SMOKE_FOR = 10;
  const SMOKE_LIFE = 30;
  // the drift and the rise of the smoke, summed up frame by frame: dragged off sideways while the draught blows, rising once it eases
  const driftTo: number[] = [0];
  const riseTo: number[] = [0];
  for (let f = 1; f <= N; f++) {
    const g = gust(f);
    driftTo.push(driftTo[f - 1] + 2.6 * g + 0.25);
    riseTo.push(riseTo[f - 1] + 0.35 + 2.3 * (1 - g));
  }
  const flameTrack: Track = { name: 'the tallest flame', at: [] };
  const smokeTrack: Track = { name: 'its smoke', at: [] };
  const frames: Sprite[] = [];
  // (its frames wider than the candles' own, out to the left, the way the draught comes: the ash it
  // drives skates in from well behind them, past the hero's feet; the third look found it unseen)
  const OX = 112;
  const MW = CW_ + OX;
  for (let f = 0; f < N; f++) {
    const g = gust(f);
    const over = new Px(MW, CH_);
    const smoke = new Px(MW, CH_);
    let lit_ = 0;
    const { wax, fire } = candlesPx((i, x, top, fr, wx) => {
      const fo = outOf(i);
      const h0 = 5 + ((f + i) % 2);
      if (f >= fo) {
        // out: its wick an ember, dimming, then dark
        const age = f - fo;
        const c = age < 2 ? EMBER[2] : age < 5 ? COAL[3] : age < 9 ? COAL[2] : null;
        if (c) fr.set(x, top, c);
        else wx.set(x, top, INK);
        if (i === 2) flameTrack.at[f] = { x: x - CCX, y: top - CCY, shown: age < 2 ? 0.15 : 0, size: 2 };
        return;
      }
      lit_++;
      // torn over by the draught: stretched, streaming downwind flat, flickering; beaten down over its last five frames
      const beat = fo - f <= 5 ? (fo - f) / 6 : 1;
      const h = Math.max(2, Math.round(h0 * (1 + 1.3 * g) * beat));
      const lean = g * h * 1.7 + (g < 0.2 ? [0, 1, 0, -1][(f + i) % 4] : Math.sin(f * 1.3 + i) * 1.5 * g);
      flame(fr, x, top, h, 1.5 + 0.5 * g, lean);
      if (i === 2) flameTrack.at[f] = { x: x + lean - CCX, y: top - h - CCY, shown: beat, size: h + 2 };
    });
    // the light falls as each goes
    // sparks ripped off the flames, flying downwind, dimming and dying
    for (let b = 1; b < f; b++) {
      if (gust(b) < 0.4) continue;
      for (let k = 0; k < 2; k++) {
        const i = Math.floor(hash(b, k, 94) * STICKS.length);
        if (i === COLD || b >= outOf(i)) continue;
        const age = f - b;
        const life = 8 + Math.floor(hash(b, k, 95) * 5);
        if (age >= life) continue;
        const [dx, dy, hh] = STICKS[i];
        const vx = 2.6 + 2 * hash(b, k, 96);
        const vy = -0.9 - hash(b, k, 97);
        const x = OX + CCX + dx + 4 + vx * age;
        const y = CCY + dy - hh - 6 + vy * age + 0.12 * age * age;
        over.set(Math.round(x), Math.round(y), age < 3 ? EMBER[4] : age < 6 ? EMBER[3] : age < 9 ? EMBER[2] : COAL[3]);
      }
    }
    // ash and grit skating across the floor on the draught from well behind the candles, through the
    // wax and on, hopping, slowing as it settles and gone: grains a game pixel across (2 by 2)
    for (let b = 1; b < 28; b++) {
      for (let k = 0; k < 3; k++) {
        const age = f - b;
        const life = 18 + Math.floor(hash(b, k, 98) * 10);
        if (age < 0 || age >= life || gust(b) < 0.3) continue;
        const x0 = OX + CCX - 118 + hash(b, k, 99) * 70;
        const y0 = CCY - 8 + hash(b, k, 100) * 16;
        let x = x0;
        for (let t = b; t < f; t++) x += 4.2 * gust(t) * (1 - (t - b) / life);
        const hop = Math.round(Math.abs(Math.sin(age * 0.8 + k)) * 3 * gust(f));
        const tone = k === 1 ? STONE[3] : WAX[2];
        const X = Math.round(x);
        const Y = Math.round(y0) - hop;
        // (the last few frames of its life, a single grain, before it is gone)
        if (life - age <= 3) over.set(X, Y, tone);
        else over.set(X, Y, tone).set(X + 1, Y, tone).set(X, Y + 1, STONE[2]).set(X + 1, Y + 1, STONE[2]);
      }
    }
    // the smoke off each snuffed wick: a thick plume, given off for a third of a second, dragged off by the draught and then rising, thinning from its oldest end
    smokeTrack.at[f] = null;
    for (const [i, fo] of OUT) {
      if (f < fo || f >= N - 1) continue;
      const [dx, dy, hh] = STICKS[i];
      const wx0 = OX + CCX + dx;
      const wy0 = CCY + dy - hh - 2;
      let prev: [number, number] | null = null;
      let all = 0;
      let kept = 0;
      for (let e = fo; e <= Math.min(f, fo + SMOKE_FOR) + 1e-9; e += 0.25) {
        const a = f - e;
        const ei = Math.floor(e);
        const sx = Math.round(wx0 + driftTo[f] - driftTo[ei] + Math.sin(a * 0.5 + e) * 1.2 * Math.min(1, a / 4));
        const sy = Math.round(wy0 - (riseTo[f] - riseTo[ei]));
        all++;
        const keep = hash(Math.round(e * 4), i, 91) >= a / SMOKE_LIFE;
        if (keep) {
          kept++;
          const tone = a < 6 ? '#8a84a4' : a < 14 ? '#6c6888' : '#55516e';
          if (prev) smoke.line(prev[0], prev[1], sx, sy, tone);
          smoke.set(sx, sy, tone).set(sx + 1, sy, tone).set(sx, sy + 1, '#4e4a68').set(sx + 1, sy + 1, '#4e4a68');
          if (a < 8) smoke.set(sx, sy - 1, '#a29cba');
        }
        prev = keep ? [sx, sy] : null;
        if (i === 2 && e === fo) smokeTrack.at[f] = { x: sx - OX - CCX, y: sy - CCY, shown: 0, size: Math.min(8, 2 + (f - fo)) };
      }
      if (i === 2 && smokeTrack.at[f]) smokeTrack.at[f]!.shown = kept / all;
    }
    const s = new Px(MW, CH_);
    s.blit(compose(null, [wax], fire), OX, 0);
    s.blit(smoke, 0, 0);
    s.blit(over, 0, 0);
    const sp = s.sprite(OX + CCX, CCY, GRAIN);
    sp.lights = [{ x: (OX + CCX) / GRAIN, y: (CCY - 22) / GRAIN, r: 13 - (STICKS.length - 1 - lit_) * 1.5 + Math.round(g * 2), color: EMBER[2], a: 0.42 + g * 0.06 }];
    frames.push(sp);
  }
  for (let f = 0; f < N; f++) if (flameTrack.at[f] === undefined) flameTrack.at[f] = null;
  const before = [0, 1, 2, 3].map((f) => candles(f));
  const after = [0, 1, 2, 3].map((f) => candles(f, true, OUT.map((o) => o[0])));
  return { name: 'a candle gutters out', frames, fps: FPS, before, after, tracks: [flameTrack, smokeTrack], jolts: [], holds: [] };
}

let moments: Moment[] | null = null;
/** Floor 1's moments around the hero, made the first time they are asked for and kept. */
export function wardenMoments(): Moment[] {
  if (moments) return moments;
  const left = ratsBolt(true);
  const right = ratsBolt(false);
  const rats: Moment = { name: 'rats bolt', frames: left.frames, fps: 30, before: left.before, after: left.after, tracks: left.tracks, jolts: [], holds: [], contacts: left.contacts, right };
  const sl = wallGivesWay(true);
  const sr = wallGivesWay(false);
  // (one moment, two faces: the blows fall on the same frames in both)
  if (sr.land !== sl.land || sr.land2 !== sl.land2) throw new Error('the stone strikes on different frames in the two faces');
  const stone: Moment = { name: 'dust and a falling stone', frames: sl.frames, fps: 30, before: sl.before, after: sl.after, tracks: sl.tracks, jolts: [sl.land, sl.land2], holds: [], right: { frames: sr.frames, before: sr.before, after: sr.after, tracks: sr.tracks } };
  return (moments = [stone, rats, candleGutters()]);
}

// =================================================================================================
// THE SET

export type PieceKind = 'wall tile' | 'floor tile' | 'breakable' | 'on the wall' | 'on the floor' | 'obstacle' | 'door' | 'gate' | 'trap' | 'quest';

/** A place a wall piece may be set in a wall's face: `du` across it and `dv` up it (picture pixels), and its pictures there, on each face, frame by frame. */
export interface Spot {
  du: number;
  dv: number;
  left: Sprite[];
  right: Sprite[];
}

/** One of the floor's pieces: its name, what of the game it is, and its pictures (frames where it moves; a wall piece's on each face). */
export interface Piece {
  name: string;
  kind: PieceKind;
  /** Standing or lying pictures, a floor tile's, or (a breakable) whole and then broken: frames. A wall piece with a heap of its own: the heap. */
  frames?: Sprite[];
  /** A wall piece: frames on the face turned to screen-left, and on the one turned to screen-right, at its first spot. */
  left?: Sprite[];
  right?: Sprite[];
  /**
   * A wall piece: every spot it may be set in, its first the one above. The game picks one for each
   * that it lays, so that no two stand in the same place (the owner: "I don’t like the wall panels
   * all being in the exact same spot").
   */
  spots?: Spot[];
  /** A door or a gate: the floor's own pictures of them, as the game takes them (art/gates.ts). */
  gates?: GateArt;
  /**
   * What stands: the soft shadow the game draws under it, as under a figure (render.ts, shadow), its
   * reach in tiles (his rulebook, Pixels 7: "Everything that stands or walks has a soft dark oval
   * under it, never a hard-edged one"). A breakable's while it stands whole.
   */
  shadow?: number;
}

function wallSet(paint: (p: Px) => void, frames = 1, light?: (f: number) => (alongX: boolean) => Light[], du = 0, dv = 0): { left: Sprite[]; right: Sprite[] } {
  const left: Sprite[] = [];
  const right: Sprite[] = [];
  for (let f = 0; f < frames; f++) {
    const w = wallPiece(frames > 1 ? (paint as unknown as (f: number) => (p: Px) => void)(f) : paint, light ? light(f) : undefined, du, dv);
    left.push(w.left);
    right.push(w.right);
  }
  return { left, right };
}

let made: Piece[] | null = null;

/**
 * WHERE EACH WALL PIECE MAY BE SET: its first spot, then others, (across, up) in picture pixels. Each
 * has its own height on the wall, low, middle or high, and its spots move it a fair way across the
 * face and a little up or down, so that two of the same do not line up (the second look found the
 * first nudges too small, and most pieces in one band).
 */
const SPOTS: Record<string, ReadonlyArray<readonly [number, number]>> = {
  // (each low, middling and high on the wall, all of it below where the wall fades into the dark, 56 up,
  // and within its own tile's face, 32 across: the second look found some in the fade, too many at one
  // height, and some hanging over the edge of their tile)
  'burial niche': [[5, -13], [-5, 2], [-1, 16]],
  'sealed niche': [[3, -12], [5, 0], [-5, 14]],
  'barred window': [[1, -13], [5, 1], [-6, 13]],
  'horned skull': [[-2, -17], [2, -1], [-1, 9]],
  "the king's head": [[-4, -22], [4, -8], [-3, 6]],
  'great crack': [[0, 0], [-6, 0], [5, 0]],
  'crumbled wall': [[0, 0]],
  'rat hole': [[0, 0], [-8, 0], [8, 0]],
  banner: [[0, 0], [-4, -2], [3, -5]],
  'banner in rags': [[7, -17], [-5, -10], [-4, 0]],
  shield: [[6, -13], [6, 3], [-4, 15]],
  'keys on a hook': [[5, -12], [-6, -4], [2, 5]],
  shackles: [[4, -22], [1, -10], [-5, 9]],
  torch: [[-5, -14], [6, 3], [0, 5]],
  'crossed mauls': [[-3, -14], [2, -6], [-3, 2]],
  'horned helm on a peg': [[4, -27], [-4, -2], [0, 9]],
  'dart skull': [[0, 0]],
};
function spotsOf(name: string, paint: (p: Px) => void, frames = 1, light?: (f: number, du: number, dv: number) => (alongX: boolean) => Light[]): { left: Sprite[]; right: Sprite[]; spots: Spot[] } {
  const spots = (SPOTS[name] ?? [[0, 0]]).map(([du, dv]) => ({ du, dv, ...wallSet(paint, frames, light ? (f) => light(f, du, dv) : undefined, du, dv) }));
  return { left: spots[0].left, right: spots[0].right, spots };
}

/** THE WARDEN'S FLOOR, every piece, painted the first time they are asked for and kept. */
export function wardenPieces(): Piece[] {
  if (made) return made;
  const w = (name: string, kind: PieceKind, paint: (p: Px) => void): Piece => ({ name, kind, ...spotsOf(name, paint) });
  const torchLight = (f: number, du: number, dv: number) => (alongX: boolean): Light[] => [{ x: (PCX + du) / GRAIN, y: (PFOOT - 52 - dv) / GRAIN, r: 14 + (f % 2), color: EMBER[2], a: alongX ? 0.5 : 0.42 }];
  const G = wardenGates();
  made = [
    // wall tiles
    w('burial niche', 'wall tile', niche(true)),
    w('sealed niche', 'wall tile', niche(false)),
    w('barred window', 'wall tile', grille),
    w('horned skull', 'wall tile', (p) => hornedSkull(p)),
    w("the king's head", 'wall tile', kingsHead),
    // (where the stones fell in, its three places on the courses' own lines: each its own picture)
    (() => {
      const spots: Spot[] = ([[0, -8, 0], [1, 8, 0], [2, -8, -32]] as const).map(([k, du, dv]) => ({ du, dv, ...wallSet(fallenIn(k)) }));
      return { name: 'fallen-in stones', kind: 'wall tile' as const, left: spots[0].left, right: spots[0].right, spots };
    })(),
    w('great crack', 'wall tile', greatCrack),
    { name: 'crumbled wall', kind: 'wall tile', ...spotsOf('crumbled wall', crumbledWall), frames: [crumbledHeap()], shadow: 0.45 },
    w('rat hole', 'wall tile', ratHole),
    // floor tiles
    { name: 'ledger stone', kind: 'floor tile', frames: [onTile(ledger, box(0.06, 0.94, 0.2, 0.8))] },
    { name: 'grave slab and ring', kind: 'floor tile', frames: [onTile(ringSlab, box(0.12, 0.88, 0.12, 0.88))] },
    // (along x, two tiles worn each its own way and its end; then the same along y, to lead up to the throne)
    { name: "the king's runner", kind: 'floor tile', frames: [false, true].flatMap((y) => [onTile(runner(false, y, 0)), onTile(runner(false, y, 1)), onTile(runner(true, y, 0))]) },
    { name: 'drain', kind: 'floor tile', frames: [onTile(drain, box(0.18, 0.82, 0.18, 0.82))] },
    { name: 'the crown in the floor', kind: 'floor tile', frames: [onTile(inlay, (u, v) => Math.hypot(u - 0.5, v - 0.5) <= 0.34)] },
    { name: 'sunken grave slab', kind: 'floor tile', frames: [onTile(sunkSlab, box(0.08, 0.92, 0.08, 0.92))] },
    // breakables: whole, and what each leaves broken
    { name: 'funeral urn', kind: 'breakable', frames: [tallUrn(), urnShards('tall')], shadow: 0.2 },
    { name: 'squat urn', kind: 'breakable', frames: [squatUrn(), urnShards('squat')], shadow: 0.22 },
    { name: 'bone box', kind: 'breakable', frames: [boneBox(), boxSplinters()], shadow: 0.26 },
    { name: 'skull jar', kind: 'breakable', frames: [skullJar(), urnShards('skull')], shadow: 0.2 },
    // on the walls
    w('banner', 'on the wall', banner(false)),
    w('banner in rags', 'on the wall', banner(true)),
    w('shield', 'on the wall', shield),
    w('keys on a hook', 'on the wall', keysOnHook),
    w('shackles', 'on the wall', shackles),
    { name: 'torch', kind: 'on the wall', ...spotsOf('torch', torch as unknown as (p: Px) => void, 4, torchLight) },
    w('crossed mauls', 'on the wall', crossedMauls),
    w('horned helm on a peg', 'on the wall', helmOnPeg),
    // on the floor
    { name: 'fallen guard', kind: 'on the floor', frames: [fallenGuard()] },
    { name: 'dropped keys', kind: 'on the floor', frames: [droppedKeys()] },
    { name: 'fallen banner', kind: 'on the floor', frames: [fallenBanner()] },
    { name: "the statue's head", kind: 'on the floor', frames: [effigyHead()], shadow: 0.24 },
    { name: 'horned helm', kind: 'on the floor', frames: [droppedHelm()], shadow: 0.2 },
    { name: 'candles', kind: 'on the floor', frames: [0, 1, 2, 3].map((f) => candles(f)), shadow: 0.26 },
    { name: 'chain', kind: 'on the floor', frames: [coiledChain()] },
    // obstacles
    { name: 'sarcophagus', kind: 'obstacle', frames: [sarcophagus(false)], shadow: 0.55 },
    { name: 'open sarcophagus', kind: 'obstacle', frames: [sarcophagus(true)], shadow: 0.55 },
    { name: "the king's tomb", kind: 'obstacle', frames: [effigyTomb()], shadow: 0.6 },
    { name: 'horned knight', kind: 'obstacle', frames: [knightStatue()], shadow: 0.45 },
    { name: 'pillar', kind: 'obstacle', frames: [pillar()], shadow: 0.34 },
    { name: 'cresset', kind: 'obstacle', frames: [0, 1, 2, 3].map(cresset), shadow: 0.28 },
    { name: 'rack of mauls', kind: 'obstacle', frames: [maulRack()], shadow: 0.4 },
    { name: "the king's throne", kind: 'obstacle', frames: [throne()], shadow: 0.62 },
    { name: "the king's coffer", kind: 'obstacle', frames: [coffer(false), coffer(true)], shadow: 0.38 },
    // doors and gates: the floor's own, as the game takes them; each piece's pictures its leaf, its plain gate's arch, its boss's arch
    { name: 'the door', kind: 'door', gates: G, frames: [G.leaf(32, 16), G.leaf(-32, 16), G.post] },
    { name: 'the gate', kind: 'gate', gates: G, frames: [...G.arch(true, false, false).map((q) => q.s), G.pillar(false)] },
    { name: "the boss's gate", kind: 'gate', gates: G, frames: [...G.arch(true, true, false).map((q) => q.s), G.pillar(true)] },
    // traps
    { name: 'spike grate', kind: 'trap', frames: [spikeGrate(false), spikeGrate(true)] },
    { name: 'skull plate', kind: 'trap', frames: [crownPlate(false), crownPlate(true)] },
    w('dart skull', 'trap', (p) => hornedSkull(p, true)),
    // quests
    { name: "the Warden's horn", kind: 'quest', frames: [wardenHorn()], shadow: 0.24 },
  ];
  return made;
}

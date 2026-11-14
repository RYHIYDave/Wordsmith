// SKINS FOR THE MAGE'S STAFF (14 Nov 2026). THE SWITCH `STAFF_SKINS` IS ON, at his yes (below): the four unique staves of the
// game are drawn in her hands. Her own staff is PLAIN_STAFF (art/mage_up.ts), painted as it always was (tests/staff_skins.test.ts);
// with the switch off the game's Mage is exactly as she was.
//
// His question, 13 Nov 2026, 18:22: “How hard would it be to have weapon skins?  Like can we just put a grey stick in the mage’s
// hand, build a basic skin for the staff, then have unique staves map over the grey stick the same way the basic staff does?  Or
// is it much more complicated than that?”. Told that her moves already carry the staff's line (art/mage_up.ts StaffAt: her
// right hand, the way up it, its foot and its head) and that the catch is the bake (her pictures baked with the staff in them),
// he picked: “Yes, split layer (Recommended)”. Then, 14 Nov: “Start the staff skins (Recommended)”.
//
// HOW IT IS SPLIT: TWO LAYERS A FRAME.
//   HER: the frame painted with no staff at all (art/mage_up.ts MuAround.staff = null). Baked once, the same for every skin.
//   THE SKIN: the frame painted whole with that staff in her hand, kept only where it differs from HER (skinLayer): the staff,
//     its head and the streak it leaves, AND whatever of her it changes: her fingers round it, her hand passing in front of it,
//     the edge of her where it runs behind her, the shade it lays on her. Baked once for each skin; small.
// Drawn HER, then THE SKIN over her (the game's ordinary drawing, one over the other), they are the whole frame painted with that
// staff, pixel for pixel: a pixel of the skin that is not wholly solid never lies over one of hers (tests/staff_skins.test.ts),
// so laying one over the other gives back exactly the whole. So her own staff laid over her is her as she is today; and any
// skin's fingers, hand and edges are right because each skin is painted whole and only then cut down.
//
// THE FIRST SKIN OTHER THAN HER OWN, to see by: THE SHEPHERD'S CROOK, the Mage's staff of his doc “Wordsmith: Unique Items”
// (“The Orb follows you instead of staying where you set it”): a crook of brown wood whose head curls over into a hook, a little
// cut stone hung from its end on a short chain, the friend's cyan, burning as her crystal does when she casts. The hook is laid
// on her, not on the eye: it curls the same way from every side (his words, 14 Nov: “the hook gets inverted when she tunrs”).

import { Px } from '../engine/px';
import type { Light } from '../engine/px';
import { BONE, BROWN, CYAN, INK, PLUM, SPARK, STEEL, TEAL, hash } from './kit';
import type { Ramp } from './kit';
import { streakAt, PLAIN_STAFF } from './mage_up';
import type { MuFrame, MuSide, StaffAt, StaffSkin } from './mage_up';
import { paintMuMove } from './mage_up_art';
import type { Move3 } from './moves3';
import { add, cross, lerp3, mul, norm } from './skeleton';
import type { V3 } from './skeleton';
import type { Stage } from './skin';
import { five } from './warrior_up';
import type { StaffId } from './heroes';

/**
 * THE SWITCH: ON, at his yes, 14 Nov 2026 (by 16:11 Eastern), shown her in the game with each staff
 * (docs/mockups/staff_skins/pictures/staves_in_game.mp4) and asked whether to turn them on: “Yes, switch them on (Recommended)”.
 * On, the Mage holding a unique staff is drawn holding it (render/render.ts heroArt: her place with that staff,
 * art/heroes.ts STAFF_PLACES), its pictures baked whole, a group of their own for each staff (render/baked.ts bakeGroups), as the
 * Warrior's axe and maul are: his pick, 14 Nov 2026, told the split layers would cost about an eighth more memory while she is
 * played and each staff baked whole about 2 MB of download and none: “Bake each staff whole (Recommended)”.
 */
export const STAFF_SKINS = { on: true };

const SK_BROWN: Ramp = five(BROWN);
const SK_TEAL: Ramp = five(TEAL);

/**
 * THE SHEPHERD'S CROOK: a pole of brown wood from her staff's foot, a leather wrap where she holds it, two turns of teal cord
 * under its head; at its head the wood curls over into a hook (across the staff as the eye sees it, as her own staff's horns
 * are laid), its end turned out a little; from the end, a short chain and a little cut stone.
 */
export const CROOK_STAFF: StaffSkin = {
  id: 'crook',
  name: "The Shepherd's Crook",
  sculpt(sc, at) {
    const { s, p3, side3, foot } = at;
    const wood = sc.mat({ ramp: SK_BROWN, crease: 0.3, paint: (h) => {
      const t = h.tone;
      if (h.prim.tag === 'wrap') return (h.y + h.x) % 2 === 0 ? SK_BROWN[Math.max(0, Math.min(2, t - 1))] : SK_BROWN[Math.max(0, t - 2)];
      // (the grain: a lit line down it here and there)
      if (h.prim.tag === 'pole' && t >= 2 && hash(h.x, Math.floor(h.y / 2), 11) < 0.12) return SK_BROWN[Math.min(4, t + 1)];
      return SK_BROWN[Math.max(0, Math.min(4, t))];
    } });
    const cord = sc.mat({ ramp: SK_TEAL, crease: 0.3 });
    const { top, c, r, way } = crookOf(at);
    sc.cone(wood, 'staff', foot, top, 0.95, 1.05, 0.4, { tag: 'pole' });
    sc.cone(wood, 'staff', add(s.handR, mul(p3, -3.2)), add(s.handR, mul(p3, 3.2)), 1.25, 1.25, 0.2, { tag: 'wrap' });
    for (const k of [3.5, 5.2]) sc.ell(cord, 'staffhead', add(top, mul(p3, -k)), [mul(p3, 0.55), mul(side3, 1.35), mul(norm(cross(p3, side3)), 1.35)], 0.3, { tag: 'cord' });
    // the hook: over from the top of the pole and down the far side, thinning
    let last = top;
    const N = 9;
    for (let i = 1; i <= N; i++) {
      const th = Math.PI - (i / N) * (Math.PI + CROOK_PAST);
      const pt = add(c, add(mul(way, r * Math.cos(th)), mul(p3, r * Math.sin(th))));
      sc.cone(wood, 'staffhead', last, pt, 1.05 - 0.3 * ((i - 1) / N), 1.05 - 0.3 * (i / N), 0.45, { tag: 'hook' });
      last = pt;
    }
    // (its end turned out a little, a knob)
    sc.ell(wood, 'staffhead', last, [mul(p3, 0.9), mul(side3, 0.9), mul(norm(cross(p3, side3)), 0.9)], 0.4, { tag: 'hook' });
    return [wood, cord];
  },
  extras(st, at, lights) {
    crookStone(st, at, lights);
  },
};

/**
 * WHICH WAY A STAFF'S HEAD IS LAID, ON HER: up, leaning to the way she faces, made square to the staff (her front where the staff
 * stands straight up). Hers, not the eye's, so that a head that is not the same on both sides (a hook, a fork, a curl) is the
 * same on her from every side (his words, 14 Nov 2026, of the Crook laid across the staff as the eye sees it: “the hook gets
 * inverted when she tunrs”).
 */
export function headWay({ s, p3 }: StaffAt): V3 {
  const want = add([0, 0, 1], mul(s.chest[0], 0.6));
  return norm(add(want, mul(p3, -(want[0] * p3[0] + want[1] * p3[1] + want[2] * p3[2]))), s.chest[0]);
}

/** How far past the far side the hook comes round (radians below level). */
const CROOK_PAST = 0.75;
/**
 * Where the crook's pole ends, which way its hook curls, and the hook's middle, size and end. THE HOOK CURLS THE SAME WAY ON HER
 * FROM EVERY SIDE: up and over toward the way she faces, square to the staff (her body's, not the eye's). His words, 14 Nov 2026,
 * shown it laid across the staff as the eye sees it: “the hook gets inverted when she tunrs”.
 */
function crookOf(at: StaffAt): { top: V3; c: V3; r: number; end: V3; way: V3 } {
  const { p3, tip3 } = at;
  const r = 3.4;
  const top = add(tip3, mul(p3, -3.6));
  const way = headWay(at);
  const c = add(top, mul(way, r));
  const th = -CROOK_PAST;
  const end = add(c, add(mul(way, r * Math.cos(th)), mul(p3, r * Math.sin(th))));
  return { top, c, r, end, way };
}

/**
 * THE CROOK'S STONE: a short chain from the hook's end, and on it a little cut stone of the friend's cyan, lit side nearly white,
 * its edge a dark cyan line; it swells and whitens as she casts (as her crystal does), its sparks then, and its light. The
 * streak of her swung staff's head, as every skin's.
 */
function crookStone(st: Stage, at: StaffAt, lights: Light[]): void {
  const { p3, tip3, burn, around } = at;
  const { end } = crookOf(at);
  // (hung from the hook's end, straight down, whichever way the staff is held)
  const stone3 = add(end, [0, 0, -3.4]);
  const [sx, sy] = st.at(stone3);
  const gem = st.part(st.near(stone3) + 0.4);
  streakAt(st, around, tip3, sx, sy);
  // (the chain: dark links from the hook's end down to the stone)
  const [ex, ey] = st.at(end);
  const links = Math.max(2, Math.round(Math.hypot(sx - ex, sy - ey)));
  for (let i = 1; i < links; i++) {
    const k = i / links;
    gem.put(Math.round(ex + (sx - ex) * k - 0.5), Math.round(ey + (sy - ey) * k - 0.5), i % 2 ? INK : '#5a4a8a', st.near(stone3) + 0.4);
  }
  const R = 2.4 + 0.45 * Math.min(2, burn - 1);
  const hot = burn >= 2.6;
  const z = st.near(stone3) + 0.6;
  for (let y = Math.floor(sy - R - 2); y <= Math.ceil(sy + R + 2); y++) {
    for (let x = Math.floor(sx - R - 2); x <= Math.ceil(sx + R + 2); x++) {
      const dx = x + 0.5 - sx;
      const dy = y + 0.5 - sy;
      // (a cut stone: a diamond a little taller than wide)
      const d = Math.abs(dx) / R + Math.abs(dy) / (R * 1.25);
      if (d > 1.18) continue;
      if (d > 0.95) {
        gem.put(x, y, hot ? CYAN[2] : CYAN[0], z);
        continue;
      }
      const lit = dx + dy < 0;
      let c = Math.abs(dx) < 0.6 && dy < 0 ? '#ffffff' : lit ? SPARK[3] : SPARK[2];
      if (hot) c = d < 0.6 ? '#ffffff' : SPARK[3];
      gem.put(x, y, c, z);
    }
  }
  // (its sparks as she casts, as her crystal's: a few points of light out from it, set off from the stone, never over it)
  if (burn >= 1.5) {
    const rays = Math.max(1, Math.min(4, Math.round((burn - 1) * 3)));
    for (let k = 2; k <= rays + 3; k++) {
      const c = k <= rays + 1 ? '#ffffff' : SPARK[2];
      for (const [rx, ry] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
        if (k > rays + (rx !== 0 ? 3 : 1)) continue;
        st.over.set(Math.round(sx - 0.5 + rx * (R + 1 + k)), Math.round(sy - 0.5 + ry * (R + 3 + k)), c);
      }
    }
  }
  const heat = Math.max(0, burn - 1);
  lights.push({ x: sx, y: sy, r: 16 + Math.min(2, heat) * 6, color: SPARK[3], a: 0.34 + Math.min(2, heat) * 0.18 });
}

/**
 * A STONE OF THE FRIEND'S CYAN at a point of a staff's head: round (a pearl, an orb) or cut (a diamond a little taller than wide),
 * its lit side nearly white, its edge a dark cyan line; it swells and whitens as she casts, as her crystal does; its sparks then,
 * set off from it; RINGS going out from it as it burns, where `rings` (Resonance's pulse); and its light. Returns where it is.
 */
function stoneAt(st: Stage, at: StaffAt, stone3: V3, lights: Light[], o: { size: number; cut: boolean; rings?: boolean }): [number, number] {
  const { burn } = at;
  const [sx, sy] = st.at(stone3);
  const gem = st.part(st.near(stone3) + 0.4);
  const R = o.size + 0.45 * Math.min(2, burn - 1);
  const hot = burn >= 2.6;
  const z = st.near(stone3) + 0.6;
  for (let y = Math.floor(sy - R - 2); y <= Math.ceil(sy + R + 2); y++) {
    for (let x = Math.floor(sx - R - 2); x <= Math.ceil(sx + R + 2); x++) {
      const dx = x + 0.5 - sx;
      const dy = y + 0.5 - sy;
      const d = o.cut ? Math.abs(dx) / R + Math.abs(dy) / (R * 1.25) : Math.hypot(dx, dy) / R;
      if (d > 1.18) continue;
      if (d > 0.95) {
        gem.put(x, y, hot ? CYAN[2] : CYAN[0], z);
        continue;
      }
      const lit = dx + dy < 0;
      let c = o.cut ? (Math.abs(dx) < 0.6 && dy < 0 ? '#ffffff' : lit ? SPARK[3] : SPARK[2]) : Math.hypot(dx + R * 0.35, dy + R * 0.35) < R * 0.38 ? '#ffffff' : lit ? SPARK[3] : SPARK[2];
      if (hot) c = d < 0.6 ? '#ffffff' : SPARK[3];
      gem.put(x, y, c, z);
    }
  }
  if (burn >= 1.5) {
    const rays = Math.max(1, Math.min(4, Math.round((burn - 1) * 3)));
    for (let k = 2; k <= rays + 3; k++) {
      const c = k <= rays + 1 ? '#ffffff' : SPARK[2];
      for (const [rx, ry] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
        if (k > rays + (rx !== 0 ? 3 : 1)) continue;
        st.over.set(Math.round(sx - 0.5 + rx * (R + 1 + k)), Math.round(sy - 0.5 + ry * (R + 3 + k)), c);
      }
    }
    // (Resonance's pulse as she casts hard: a ring of light out from the orb, and a fainter one further out, broken)
    if (o.rings && burn >= 3.1) {
      for (const [rr, c, keep] of [[R + 3.5, SPARK[3], 1], [R + 6.5, SPARK[2], 0.55]] as const) {
        const n = Math.round(rr * 6);
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2;
          const x = Math.round(sx - 0.5 + Math.cos(a) * rr);
          const y = Math.round(sy - 0.5 + Math.sin(a) * rr * 0.85);
          if (hash(x, y, 13) < keep) st.over.set(x, y, c);
        }
      }
    }
  }
  const heat = Math.max(0, burn - 1);
  lights.push({ x: sx, y: sy, r: 16 + Math.min(2, heat) * 6, color: SPARK[3], a: 0.34 + Math.min(2, heat) * 0.18 });
  return [sx, sy];
}

const SK_BONE: Ramp = five(BONE);
const SK_PLUM: Ramp = five(PLUM);
const SK_STEEL: Ramp = five(STEEL);

/**
 * EBB AND FLOW (his doc: “The Wave comes back: it flies out, turns, and passes through everything again on its way home”): a
 * staff of sea-worn driftwood, pale, bound with teal cord where she holds it and under its head; its head two crests carved like
 * waves breaking, one curling forward and one back (out, then back), and between them a round pearl of the friend's cyan.
 */
export const EBB_STAFF: StaffSkin = {
  id: 'ebb',
  name: 'Ebb and Flow',
  sculpt(sc, at) {
    const { s, p3, foot, tip3 } = at;
    const wood = sc.mat({ ramp: SK_BONE, crease: 0.32, paint: (h) => {
      const t = h.tone;
      // (sea-worn: a darker groove of the grain down it here and there)
      if (h.prim.tag === 'pole' && hash(Math.floor(h.x / 2), h.y, 17) < 0.14) return SK_BONE[Math.max(0, t - 1)];
      return SK_BONE[Math.max(0, Math.min(4, t))];
    } });
    const cord = sc.mat({ ramp: SK_TEAL, crease: 0.3, paint: (h) => ((h.x + h.y) % 2 === 0 ? SK_TEAL[Math.max(0, Math.min(4, h.tone))] : SK_TEAL[Math.max(0, h.tone - 1)]) });
    const way = headWay(at);
    const top = add(tip3, mul(p3, -4.2));
    sc.cone(wood, 'staff', foot, top, 0.95, 1.15, 0.4, { tag: 'pole' });
    sc.cone(cord, 'staff', add(s.handR, mul(p3, -3.2)), add(s.handR, mul(p3, 3.2)), 1.25, 1.25, 0.2, { tag: 'wrap' });
    sc.cone(cord, 'staffhead', add(top, mul(p3, -2.6)), add(top, mul(p3, -0.8)), 1.3, 1.3, 0.2, { tag: 'band' });
    // the two crests, back to back, like waves breaking away from each other: each rises from the top of the pole, leaning out,
    // then curls over outward and down and back in under itself (a wave's lip), thinning to its end
    for (const sg of [1, -1]) {
      const pts: V3[] = [];
      const RISE = 5;
      for (let i = 0; i <= RISE; i++) {
        const k = i / RISE;
        pts.push(add(top, add(mul(way, sg * 1.9 * Math.pow(k, 1.5)), mul(p3, 5.4 * k))));
      }
      const p2 = pts[pts.length - 1];
      const r0 = 2.3;
      const c = add(p2, mul(way, sg * r0));
      const CURL = 9;
      for (let i = 1; i <= CURL; i++) {
        const k = i / CURL;
        const ang = Math.PI - k * Math.PI * 1.75;
        const r = r0 * (1 - 0.5 * k);
        pts.push(add(c, add(mul(way, sg * r * Math.cos(ang)), mul(p3, r * Math.sin(ang)))));
      }
      for (let i = 1; i < pts.length; i++) {
        const k0 = (i - 1) / (pts.length - 1);
        const k1 = i / (pts.length - 1);
        sc.cone(wood, 'staffhead', pts[i - 1], pts[i], 1.3 - 0.7 * k0, 1.3 - 0.7 * k1, 0.45, { tag: 'crest' });
      }
    }
    return [wood, cord];
  },
  extras(st, at, lights) {
    const { p3, tip3, around } = at;
    const pearl = add(add(tip3, mul(p3, -4.2)), mul(p3, 3.4));
    const [sx, sy] = st.at(pearl);
    streakAt(st, around, tip3, sx, sy);
    stoneAt(st, at, pearl, lights, { size: 2.6, cut: false });
  },
};

/**
 * RESONANCE (his doc: “A Wave that passes through your Orb makes it pulse at once, twice as hard”; its name his pick of 11 Nov
 * 2026 for what was first The Tuning Staff): a staff whose head is a TUNING FORK of steel, its two tines rising side by side
 * from a rounded bend, an orb of the friend's cyan held between their tips; a shaft of plum-dark wood with steel bands; as she
 * casts, rings of light go out from the orb.
 */
export const RESONANCE_STAFF: StaffSkin = {
  id: 'resonance',
  name: 'Resonance',
  sculpt(sc, at) {
    const { s, p3, foot, tip3 } = at;
    const wood = sc.mat({ ramp: SK_PLUM, crease: 0.3, paint: (h) => (h.prim.tag === 'wrap' ? ((h.x + h.y) % 2 === 0 ? SK_BROWN[Math.max(0, Math.min(3, h.tone))] : SK_BROWN[Math.max(0, h.tone - 1)]) : SK_PLUM[Math.max(0, Math.min(4, h.tone))]) });
    const steel = sc.mat({ ramp: SK_STEEL, crease: 0.3, paint: (h) => SK_STEEL[Math.max(1, Math.min(4, h.tone + (h.prim.tag === 'tine' ? 1 : 0)))] });
    const way = headWay(at);
    const bend = add(tip3, mul(p3, -6.4));
    sc.cone(wood, 'staff', foot, bend, 0.95, 1.05, 0.4, { tag: 'pole' });
    sc.cone(wood, 'staff', add(s.handR, mul(p3, -3.2)), add(s.handR, mul(p3, 3.2)), 1.25, 1.25, 0.2, { tag: 'wrap' });
    for (const k of [0.3, 0.7]) sc.cone(steel, 'staff', lerp3(foot, bend, k - 0.02), lerp3(foot, bend, k + 0.02), 1.25, 1.25, 0.2, { tag: 'band' });
    // the fork: a rounded bend at the top of the shaft, and the two tines rising from it side by side
    const gap = 3.0;
    sc.ell(steel, 'staffhead', add(bend, mul(p3, 0.6)), [mul(p3, 1.1), mul(way, gap + 0.9), mul(norm(cross(p3, way)), 1.0)], 0.5, { tag: 'bend' });
    for (const sg of [1, -1]) {
      const a = add(bend, add(mul(way, sg * gap), mul(p3, 0.8)));
      const b = add(a, mul(p3, 6.6));
      sc.cone(steel, 'staffhead', a, b, 0.72, 0.6, 0.4, { tag: 'tine' });
    }
    return [wood, steel];
  },
  extras(st, at, lights) {
    const { p3, tip3, around } = at;
    // (the orb held between the tines, a little below their tips)
    const orb = add(tip3, mul(p3, -1.4));
    const [sx, sy] = st.at(orb);
    streakAt(st, around, tip3, sx, sy);
    stoneAt(st, at, orb, lights, { size: 2.0, cut: false, rings: true });
  },
};

/** An honest fire's colours (as the endless stair's torches burn: art/endless_stair.ts): its heart, its body, its edge. */
const FIRE_HEART = '#fff0a0';
const FIRE_BODY = '#ffc24a';
const FIRE_EDGE = '#ff8a2a';
const SK_CHAR: Ramp = ['#140f14', '#21181c', '#33252a', '#4a3536', '#644844'];
const SK_IRON: Ramp = ['#1e1c26', '#302e3c', '#4a4858', '#6c6a7c', '#9492a4'];

/**
 * THE KINDLING ROD (the game's levelling unique of floor 8, art/game/uniques.ts `kindlingrod`: “Every hit is fire. Can deal no
 * other type of damage.”): a rod of charred wood, black and cracked, the cracks lit as embers are; at its head an iron cresset,
 * its ribs curving up round a bed of coals, and AN HONEST FIRE standing up out of it (the art rulebook's Glows: an honest fire
 * burns orange), flickering; it flares taller and whiter as she casts.
 */
export const ROD_STAFF: StaffSkin = {
  id: 'rod',
  name: 'The Kindling Rod',
  sculpt(sc, at) {
    const { s, p3, foot, tip3 } = at;
    const wood = sc.mat({ ramp: SK_CHAR, crease: 0.32, paint: (h) => {
      const t = h.tone;
      if (h.prim.tag === 'wrap') return (h.x + h.y) % 2 === 0 ? SK_BROWN[Math.max(0, Math.min(2, t - 1))] : SK_BROWN[Math.max(0, t - 2)];
      // (charred: cracks in it lit as embers are, here and there)
      if (h.prim.tag === 'pole' && hash(h.x, h.y, 23) < 0.05) return hash(h.x, h.y, 29) < 0.5 ? FIRE_EDGE : '#b8501c';
      return SK_CHAR[Math.max(0, Math.min(4, t + 1))];
    } });
    const iron = sc.mat({ ramp: SK_IRON, crease: 0.3 });
    const way = headWay(at);
    const across = norm(cross(p3, way), s.across);
    const collar = add(tip3, mul(p3, -5.2));
    sc.cone(wood, 'staff', foot, collar, 1.05, 1.2, 0.4, { tag: 'pole' });
    sc.cone(wood, 'staff', add(s.handR, mul(p3, -3.2)), add(s.handR, mul(p3, 3.2)), 1.3, 1.3, 0.2, { tag: 'wrap' });
    // the cresset: an iron collar, and four ribs curving up and out from it round the coals
    sc.cone(iron, 'staffhead', add(collar, mul(p3, -0.6)), add(collar, mul(p3, 0.8)), 1.55, 1.55, 0.2, { tag: 'collar' });
    for (let r = 0; r < 4; r++) {
      const a = (r / 4) * Math.PI * 2 + Math.PI / 4;
      const out = norm(add(mul(way, Math.cos(a)), mul(across, Math.sin(a))), way);
      let last = add(collar, mul(p3, 0.6));
      for (let i = 1; i <= 4; i++) {
        const k = i / 4;
        const pt = add(collar, add(mul(p3, 0.6 + 4.2 * k), mul(out, 1.2 + 2.0 * Math.sin(k * Math.PI * 0.62))));
        sc.cone(iron, 'staffhead', last, pt, 0.5, 0.42, 0.3, { tag: 'rib' });
        last = pt;
      }
    }
    return [wood, iron];
  },
  extras(st, at, lights) {
    const { p3, tip3, burn, around } = at;
    // (the coals in the cresset: the fire's foot)
    const coals3 = add(tip3, mul(p3, -2.2));
    const [cx, cy] = st.at(coals3);
    streakAt(st, around, tip3, cx, cy - 4);
    const fire = st.part(st.near(coals3) + 0.8);
    const z = st.near(coals3) + 0.8;
    // (a bed of coals, glowing, as wide as the cresset)
    for (let dx = -3; dx <= 3; dx++) for (let dy = -1; dy <= 1; dy++) {
      if (Math.abs(dx) + Math.abs(dy) * 2 > 4) continue;
      const x = Math.round(cx + dx - 0.5);
      const y = Math.round(cy + dy - 0.5);
      fire.put(x, y, hash(x, y, 31) < 0.4 ? FIRE_BODY : hash(x, y, 37) < 0.5 ? FIRE_EDGE : '#b8501c', z);
    }
    // THE FIRE: standing straight up out of the coals whichever way the rod is held, flickering (by the wind's turn), taller and
    // whiter as she casts
    const heat = Math.max(0, burn - 1);
    const ph = ((around.wind ?? 0) * 7) % 1;
    const tall = 7 + 2.2 * Math.min(2.4, heat) + 1.2 * Math.sin(ph * Math.PI * 2);
    const wide = 2.6 + 0.5 * Math.min(2.4, heat);
    for (let fy = 0; fy <= Math.ceil(tall); fy++) {
      const k = fy / tall;
      if (k > 1) break;
      const half = wide * Math.pow(Math.sin(Math.min(1, k * 1.15 + 0.12) * Math.PI), 0.8) * (1 - k * 0.45);
      const sway = 0.9 * Math.sin(k * 5 + ph * Math.PI * 2) * k;
      for (let fx = -Math.ceil(half); fx <= Math.ceil(half); fx++) {
        const d = Math.abs(fx - sway);
        if (d > half) continue;
        const c = d < half * 0.35 && k < 0.6 ? FIRE_HEART : d < half * 0.7 ? FIRE_BODY : FIRE_EDGE;
        fire.put(Math.round(cx + fx - 0.5), Math.round(cy - 1 - fy - 0.5), heat > 1.6 && c === FIRE_BODY ? FIRE_HEART : c, z);
      }
    }
    lights.push({ x: cx, y: cy - tall * 0.45, r: 18 + Math.min(2, heat) * 6, color: FIRE_BODY, a: 0.32 + Math.min(2, heat) * 0.16 });
  },
};

/** Each unique staff's skin, by the id of its place (art/heroes.ts StaffId). */
export const STAFF_SKIN_OF: Readonly<Record<StaffId, StaffSkin>> = { crook: CROOK_STAFF, ebb: EBB_STAFF, resonance: RESONANCE_STAFF, rod: ROD_STAFF };
/** The unique staves of the game (game/uniques.ts) that are drawn in her hands, and the skin each is. */
export const STAFF_OF_UNIQUE: Readonly<Record<string, StaffId>> = { shepherdscrook: 'crook', tide: 'ebb', tuningstaff: 'resonance', kindlingrod: 'rod' };
/** The skin of the staff an item is, if it is one of those (and the switch is on); null: her own staff. */
export function staffWorn(item: { unique?: string; rarity?: number } | null | undefined): StaffId | null {
  if (!STAFF_SKINS.on || !item || item.rarity !== 3 || !item.unique) return null;
  return STAFF_OF_UNIQUE[item.unique] ?? null;
}

/** The skins of her staff, her own first. */
export const STAFF_SKIN_LIST: readonly StaffSkin[] = [PLAIN_STAFF, CROOK_STAFF, EBB_STAFF, RESONANCE_STAFF, ROD_STAFF];

/**
 * THE SKIN'S LAYER: the frame painted whole with a staff (`whole`), kept only where it differs from her painted with none
 * (`her`); see-through everywhere else. Laid over `her`, it gives back `whole` exactly (a pixel of it not wholly solid never lies
 * over one of hers: tests/staff_skins.test.ts).
 */
export function skinLayer(whole: Px, her: Px): Px {
  const out = new Px(whole.w, whole.h);
  const a = whole.d;
  const b = her.d;
  for (let k = 0; k < whole.w * whole.h * 4; k += 4) {
    if (a[k] === b[k] && a[k + 1] === b[k + 1] && a[k + 2] === b[k + 2] && a[k + 3] === b[k + 3]) continue;
    out.d[k] = a[k];
    out.d[k + 1] = a[k + 1];
    out.d[k + 2] = a[k + 2];
    out.d[k + 3] = a[k + 3];
  }
  return out;
}

/** A frame of hers in its two layers: her with no staff, and a skin's layer with that skin's lights (those `her` has not). */
export interface MuLayers {
  her: MuFrame;
  skin: Px;
  skinLights: Light[];
  whole: MuFrame;
}

/** A moment of one of her moves from one side, in its two layers, with a skin of her staff. */
export function muLayers(m: Move3, t: number, view: MuSide, skin: StaffSkin): MuLayers {
  const her = paintMuMove(m, t, view, undefined, null);
  const whole = paintMuMove(m, t, view, undefined, skin);
  const mine = new Set(her.lights.map((l) => JSON.stringify(l)));
  return { her, whole, skin: skinLayer(whole.px, her.px), skinLights: whole.lights.filter((l) => !mine.has(JSON.stringify(l))) };
}

/** `under` with `over` laid on it as a canvas lays one picture over another (source over): for the checks and the pictures. */
export function laidOver(under: Px, over: Px): Px {
  const out = new Px(under.w, under.h);
  out.d.set(under.d);
  const o = over.d;
  for (let k = 0; k < out.d.length; k += 4) {
    const a = o[k + 3];
    if (a === 0) continue;
    if (a === 255 || out.d[k + 3] === 0) {
      out.d[k] = o[k];
      out.d[k + 1] = o[k + 1];
      out.d[k + 2] = o[k + 2];
      out.d[k + 3] = a;
      continue;
    }
    // (a pixel partly solid over one of hers: blended as the canvas would; the test holds that it never happens)
    const ua = out.d[k + 3] / 255;
    const oa = a / 255;
    const ra = oa + ua * (1 - oa);
    for (let c = 0; c < 3; c++) out.d[k + c] = Math.round((o[k + c] * oa + out.d[k + c] * ua * (1 - oa)) / ra);
    out.d[k + 3] = Math.round(ra * 255);
  }
  return out;
}


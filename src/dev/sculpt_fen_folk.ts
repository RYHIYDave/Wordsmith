// THE STILT TOWN'S OWN PEOPLE, SCULPTED (the queue chat, 14 Nov 2026). Each town has its own vendors: his words of 14 Nov 2026,
// “We want different looking vendors for different towns”; his pick: the armourer, the mystic and the stranger given new looks that
// fit the town, on their same moves, their stalls to match, the wordsmith the same in every town (“Yes, that (Recommended)”).
//
// Sculpted as the town's are (dev/sculpt_townsfolk.ts), on the same builds and the same moves (dev/townsfolk_moves.ts). The Stilt
// Town's, folk of the fen:
//   the SMITH       a broad hat woven of rushes; no beard, a dark moustache, his jaw stubbled; a sleeveless jerkin of green-brown
//                   leather laced up the front, his arms bare, a bracer on his left forearm; a leather apron; a rope for a belt;
//                   tall waders to the thigh. His hammer
//   the HERBALIST   a tall soft hat of woven rushes, its point flopped over, its brim wide; round spectacles; a thin grey beard;
//                   a long coat of moss-green cloth patched in browns and greens, a satchel's strap across him. Over his palm, as
//                   the town's mystic's crystal turns, a WISP floats, a ball of the friend's cyan with its tail curling round it;
//                   it lifts and blazes the same
//   the STRANGER    leaning on his shack, arms folded: a ragged cowl and cloak of grey-green sacking; his face behind a mask woven
//                   of reeds, two pale points in its eye-slits (never gold); his legs wrapped in strips. His coin
// No edge of light (his rulebook, Pixels 5).

import type { Ramp } from '../art/kit';
import { add, cross, dot, len, lerp3, mul, norm, sub } from '../art/skeleton';
import type { V3 } from '../art/skeleton';
import { onBall, onCone } from './sculpt';
import type { Cone, Ell } from './sculpt';
import {
  ANVIL, ARMOURER_BUILD, FLOOR_CUT, MYSTIC_BUILD, STRANGER_BUILD, WALL, armOf, bootsOn, bootsOnWall, crystalAt, fistOf,
  frameOf, headIn, keepBelow, legOf, openHand, rigOf, sh, trunkIn,
} from './sculpt_townsfolk';
import type { Aloft, ArmourerPose, Cut, MysticPose, StrangerPose, TownFigure } from './sculpt_townsfolk';

const IRON: Ramp = ['#18181f', '#32323c', '#565662', '#848490', '#b6b6c0'];
const WOODR: Ramp = ['#1a0c08', '#341a10', '#5a3018', '#84502a', '#aa7440'];
/** Rushes, woven: the hats, the mask. */
const RUSH: Ramp = ['#2a2214', '#42361e', '#5c4c2a', '#7a6838', '#968248'];

/** The sparks off the anvil as the blow lands (the town's armourer's, as they are). */
function sparksOf(fly: number): Aloft {
  const from: V3 = [ANVIL.fwd, 0, ANVIL.up + 0.5];
  return {
    paint: (st, where) => {
      const [x0, y0] = where(from);
      const tone = fly < 0.25 ? '#ffffff' : fly < 0.5 ? '#fff3b0' : fly < 0.75 ? '#ffc860' : '#ff8a2a';
      const n = 26;
      for (let j = 0; j < n; j++) {
        const seed = (j * 37) % 17;
        if (fly > 0.55 && seed % 3 === 0) continue;
        if (fly > 0.8 && seed % 2 === 0) continue;
        const a = Math.PI * (0.06 + (0.88 * ((j * 7) % n)) / n);
        const speed = 9 + (seed % 7) * 3.4;
        const dist = speed * (1 - Math.pow(1 - fly, 2.2));
        const x = x0 + Math.cos(a) * dist * 1.25;
        const y = y0 - Math.sin(a) * dist + fly * fly * (16 + (seed % 5) * 3);
        st.over.set(Math.round(x), Math.round(y), tone);
        if (fly < 0.5 && seed % 2 === 0) st.over.set(Math.round(x - Math.cos(a) * 1.6), Math.round(y + Math.sin(a) * 1.4), fly < 0.25 ? '#fff3b0' : '#ffc860');
      }
      if (fly < 0.3) {
        const r = fly < 0.12 ? 4 : 3;
        for (let dy = -r; dy <= r; dy++) for (let dx = -r * 2; dx <= r * 2; dx++) if ((dx * dx) / (4 * r * r) + (dy * dy) / (r * r) <= 1) st.over.set(Math.round(x0) + dx, Math.round(y0) + dy, Math.abs(dx) + Math.abs(dy) * 2 < r ? '#ffffff' : '#fff3b0');
      }
    },
    lights: (where) => {
      const [x, y] = where(from);
      return [{ x, y, r: 10 + 26 * (1 - fly), color: '#ff8a2a', a: 0.7 * (1 - fly) }];
    },
  };
}

// ---------------------------------------------------------------------------------------------------------------------------
// THE SMITH

const F_SKIN: Ramp = ['#341a18', '#643a2c', '#9a6644', '#c49262', '#e2b886'];
/** His jerkin: leather, a green-brown. */
const F_JERKIN: Ramp = ['#12140c', '#222616', '#363c22', '#4a522e', '#62683c'];
const F_APRON: Ramp = ['#140c08', '#2a1a10', '#46301e', '#624630', '#7e5e42'];
/** His waders: near black, a green in them. */
const F_WADE: Ramp = ['#080a08', '#121612', '#1e241c', '#2c3428', '#3e4838'];
const F_TROUSER: Ramp = ['#14120e', '#262218', '#3a3424', '#4e4632', '#645a42'];
const F_HAIR: Ramp = ['#0c0806', '#1a120c', '#2a1e14', '#3c2c1e', '#503c2a'];
const F_ROPE: Ramp = ['#2a2014', '#4a3a24', '#6e5a38', '#94804e', '#b8a46a'];

/** THE STILT TOWN'S SMITH, sculpted in a pose (the armourer's moves); `turn`: truly turned. */
export function sculptFenSmith(p: ArmourerPose, turn = 0): TownFigure {
  const B = ARMOURER_BUILD;
  const g = rigOf(B, p.bones, turn);
  const { sc, s, f, l, u, ribs, belly, pel, at, onHead, hf, hl, hu, R, dk } = g;
  const [rf, rl, ru] = ribs.r;

  const skin = sc.mat({
    ramp: F_SKIN,
    paint: (h) => {
      const tg = h.prim.tag ?? '';
      const d = dk(h.prim.piece);
      if (h.prim.piece === 'head') {
        const [fw, lf, up] = onHead(h.p);
        if (tg === 'nose' && h.tone >= 2) return sh(F_SKIN, h.tone + 1);
        // (his jaw stubbled: a darker fleck in a loose grid)
        if ((tg === 'jaw' || tg === 'cheek') && up < -0.3 && (h.x + h.y * 2) % 3 === 0) return sh(F_SKIN, Math.max(0, h.tone - 2));
        if (tg !== 'neck' && fw > 0.36 && up < 0.34 && up > -0.8) return sh(F_SKIN, Math.max(2, h.tone + 1) - (Math.abs(lf) > 0.66 ? 1 : 0));
        return null;
      }
      if ((tg === 'fore' || tg === 'upper') && (h.x * 3 + h.y * 5) % 7 === 0) return sh(F_SKIN, h.tone - 1 - d);
      return d ? sh(F_SKIN, h.tone - 1) : null;
    },
  });
  headIn(g, skin, { jaw: 1.15, brow: 1.1, nose: 1.15 });
  const hide = sc.mat({ ramp: F_APRON, paint: (h) => (h.prim.tag === 'bracer' && h.y % 3 === 0 ? sh(F_APRON, h.tone + 1) : null) });
  for (const side of ['L', 'R'] as const) {
    const { sh: shd, el, ha } = armOf(s, side);
    const piece = `arm${side}`;
    const out = mul(l, side === 'L' ? 1 : -1);
    const [, uo] = frameOf(shd, el, out, f);
    sc.ell(skin, piece, add(shd, add(mul(u, -0.4), mul(uo, 0.8))), [mul(f, 3.4), mul(uo, 3.2), mul(u, 3.3)], 1.4, { tag: 'shoulder' });
    sc.cone(skin, piece, shd, el, 3.2, 2.8, 1.4, { tag: 'upper' });
    const wrist = lerp3(el, ha, 0.82);
    sc.cone(skin, piece, el, wrist, 2.9, 2.0, 1.2, { tag: 'fore' });
    const [fd, fo, fw] = frameOf(el, ha, out, f);
    sc.ell(skin, piece, add(lerp3(el, ha, 0.26), mul(fo, 0.6)), [mul(fd, 3.3), mul(fo, 2.8), mul(fw, 2.6)], 1.0, { tag: 'foreBulge' });
    if (side === 'L') sc.cone(hide, piece, lerp3(el, ha, 0.4), lerp3(el, ha, 0.88), 3.0, 2.4, 0.4, { tag: 'bracer' });
    fistOf(g, skin, side, 1.22);
  }
  // ---- THE JERKIN: leather, sleeveless, laced up the front ----
  const jerkin = sc.mat({
    ramp: F_JERKIN,
    paint: (h) => {
      const v = sub(h.p, ribs.c);
      const front = dot(v, rf) > 0;
      const across = dot(v, rl);
      if (front && Math.abs(across) < 0.5) return sh(F_JERKIN, h.tone - 1);
      if (front && Math.abs(Math.abs(across) - 1.2) < 0.4 && Math.floor(dot(v, ru) * 1.2) % 2 === 0) return F_ROPE[3];
      return dk(h.prim.piece) ? sh(F_JERKIN, h.tone - 1) : null;
    },
  });
  trunkIn(g, jerkin, 1.0, { paunch: 2.2, yoke: 1.12, tag: 'jerkin' });
  const waistC = add(belly.c, mul(belly.r[2], -belly.h[2] * 0.25));
  // ---- TROUSERS, rolled at the knee; WADERS to the thigh ----
  const trouser = sc.mat({ ramp: F_TROUSER, paint: (h) => (dk(h.prim.piece) ? sh(F_TROUSER, h.tone - 1) : null) });
  const wade = sc.mat({
    ramp: F_WADE,
    paint: (h) => {
      const tg = h.prim.tag ?? '';
      if (tg === 'sole') return sh(F_WADE, 0);
      if (tg === 'cuff') return sh(F_WADE, h.tone + 1);
      // (a wet shine down them)
      if (h.tone >= 3 && (h.x + h.y) % 2 === 0) return sh(F_WADE, 4);
      return dk(h.prim.piece) ? sh(F_WADE, h.tone - 1) : null;
    },
  });
  for (const side of ['L', 'R'] as const) {
    const { hip, knee } = legOf(s, side);
    const [lH, lK] = B.legR;
    sc.cone(trouser, `leg${side}`, add(hip, mul(s.hips[2], 0.8)), lerp3(hip, knee, 0.5), lH * 1.08 + 0.5, lK * 1.06 + 0.6, 1.5, { tag: 'thigh' });
  }
  bootsOn(g, wade, 0.96, 1.12);
  for (const side of ['L', 'R'] as const) {
    const { hip, knee } = legOf(s, side);
    const [lH, lK] = B.legR;
    // (the waders up over the knee to the middle of the thigh, a cuff turned down at their top)
    sc.cone(wade, `leg${side}`, knee, lerp3(knee, hip, 0.5), lK * 1.06 + 1.1, lH * 1.0 + 1.0, 0.8, { tag: 'boot' });
    sc.cone(wade, `leg${side}`, lerp3(knee, hip, 0.44), lerp3(knee, hip, 0.52), lH * 1.0 + 1.4, lH * 1.0 + 1.4, 0.3, { tag: 'cuff' });
  }
  // ---- THE APRON, the rope belt ----
  const kneeZ = Math.max(s.kneeL[2], s.kneeR[2]) - 1.2;
  const apron = sc.mat({
    ramp: F_APRON,
    crease: 0.2,
    paint: (h) => {
      const tg = h.prim.tag ?? '';
      if (tg === 'skirt' && h.p[2] < kneeZ + 1.3) return sh(F_APRON, h.tone + 1);
      if (tg === 'skirt' || tg === 'bib') {
        // (mud dried on it, a lighter crust)
        if (h.p[2] < kneeZ + 6 && (h.x * 5 + h.y * 3) % 7 === 0) return '#5e5440';
        const k = (Math.floor(h.p[2] * 1.3) * 7 + h.x * 13) % 23;
        if (k === 0 || k === 9) return sh(F_APRON, h.tone - 1);
      }
      return null;
    },
  });
  {
    const front = keepBelow(mul(rf, -1), add(ribs.c, mul(rf, ribs.h[0] * 0.22)));
    const bibC = add(lerp3(ribs.c, belly.c, 0.55), mul(rf, 0.6));
    sc.ell(apron, 'apron', bibC, [mul(rf, ribs.h[0] * 0.98 + 2.8), mul(rl, ribs.h[1] * 0.56), mul(ru, ribs.h[2] * 0.82)], 0.6, { tag: 'bib', cuts: [front] });
    const frontOnly = keepBelow(mul(pel.r[0], -1), add(pel.c, mul(pel.r[0], -pel.h[0] * 0.55)));
    const top = keepBelow([0, 0, 1], add(waistC, [0, 0, 1.2]));
    const bot: Cut = { n: [0, 0, -1], o: -kneeZ };
    const mid = lerp3(waistC, lerp3(s.kneeL, s.kneeR, 0.5), 0.5);
    sc.ell(apron, 'apron', add(mid, mul(pel.r[0], 1.0)), [mul(pel.r[0], pel.h[0] + 4.8), mul(pel.r[1], pel.h[1] + 3.8), [0, 0, (waistC[2] - kneeZ) * 0.95]], 0.8, { tag: 'skirt', cuts: [frontOnly, top, bot] });
    for (const side of [1, -1]) {
      const a = add(bibC, add(mul(rl, side * ribs.h[1] * 0.5), add(mul(ru, ribs.h[2] * 0.72), mul(rf, ribs.h[0] * 0.75 + 1.9))));
      const b = add(s.neck, add(mul(l, side * 3.1), add(mul(u, 0.5), mul(f, 0.6))));
      sc.cone(apron, 'apron', a, b, 0.75, 0.75, 0.3, { tag: 'strap' });
    }
  }
  const rope = sc.mat({ ramp: F_ROPE, paint: (h) => ((h.x + h.y) % 2 === 0 ? sh(F_ROPE, h.tone + 1) : null) });
  sc.ell(rope, 'belt', add(waistC, mul(belly.r[2], 0.4)), [mul(belly.r[0], belly.h[0] + 4.0), mul(belly.r[1], belly.h[1] + 2.4), mul(belly.r[2], 0.8)], 0.3, { tag: 'rope' });
  // ---- HIS MOUSTACHE, dark; his brows; THE HAT of woven rushes ----
  const hair = sc.mat({ ramp: F_HAIR, meld: true, paint: (h) => sh(F_HAIR, Math.max(2, h.tone + 1)) });
  sc.ell(hair, 'head', at(1.0, 0, -0.38), [mul(hf, 0.8), mul(hl, R[1] * 0.44), mul(hu, 0.8)], 0.4, { tag: 'tash' });
  for (const side of [1, -1]) {
    sc.cone(hair, 'head', at(0.98, side * 0.3, -0.42), at(0.88, side * 0.5, -0.86), 0.8, 0.5, 0.3, { tag: 'tash' });
    sc.cone(hair, 'head', at(0.92, side * 0.12, 0.3), at(0.78, side * 0.72, 0.24), 0.7, 0.55, 0.3, { tag: 'brow' });
  }
  const rush = sc.mat({
    ramp: RUSH,
    paint: (h) => {
      // (woven: rings round it, a darker line every few pixels, the rush crossing them)
      const b = onBall(h.prim as Ell, h.p);
      const ring = Math.floor(Math.hypot(b[0], b[1]) * 9);
      if (h.n[2] < -0.2) return RUSH[0];
      return ring % 2 === 0 ? sh(RUSH, h.tone) : sh(RUSH, h.tone - ((h.x + h.y) % 2));
    },
  });
  sc.ell(rush, 'hat', at(-0.06, 0, 0.62), [mul(hf, R[0] * 0.96), mul(hl, R[1] * 0.98), mul(hu, R[2] * 0.56)], 0.5, { tag: 'crown' });
  sc.ell(rush, 'hatBrim', at(0.0, 0, 0.42), [mul(hf, R[0] * 2.1), mul(hl, R[1] * 2.1), mul(hu, 0.6)], 0.3, { tag: 'brim' });
  for (const side of [1, -1]) {
    sc.mark(at(0.82, side * 0.38, 0.08), sh(F_SKIN, 1), 2, 1, side > 0 ? 0 : -1);
    sc.mark(at(0.86, side * 0.36, 0.04), '#140a18');
  }
  // ---- THE HAMMER ----
  const iron = sc.mat({
    ramp: IRON,
    paint: (h) => {
      if (h.prim.tag !== 'head') return null;
      const b = onBall(h.prim as Ell, h.p);
      if (Math.abs(b[0]) > 0.8) return sh(IRON, h.tone + 1);
      if (Math.abs(b[0]) < 0.16) return sh(IRON, h.tone - 1);
      return null;
    },
  });
  const wood = sc.mat({ ramp: WOODR });
  {
    const d = s.point;
    const ac = s.across;
    const third = norm(cross(d, ac));
    const ha = s.handR;
    sc.cone(wood, 'hammer', add(ha, mul(d, -3.4)), add(ha, mul(d, 12.5)), 0.75, 0.7, 0.2, { tag: 'handle' });
    sc.box(iron, 'hammer', add(ha, mul(d, 13.2)), [mul(ac, 4.6), mul(d, 2.3), mul(third, 2.3)], 0.5, 0.3, { tag: 'head' });
  }
  const aloft: Aloft[] = [];
  const fly = p.sparks ?? 0;
  if (fly > 0) aloft.push(sparksOf(fly));
  void len;
  void onCone;
  return { sc, s, B, aloft };
}

// ---------------------------------------------------------------------------------------------------------------------------
// THE HERBALIST

const H_SKIN: Ramp = ['#30181c', '#5c3030', '#8e5a46', '#ba8664', '#dcb08c'];
/** His coat: moss green; its patches in browns and greens. */
const H_COAT: Ramp = ['#10160c', '#1c2614', '#2c3a1e', '#3e5028', '#566a36'];
const H_PATCH: Ramp[] = [['#1a120c', '#2e2016', '#463220', '#5e462c', '#78583a'], ['#141a12', '#24301e', '#38462c', '#4e5e3a', '#68784a']];
const H_BEARD: Ramp = ['#2e2c2a', '#4a4844', '#6a6862', '#8e8c84', '#b2b0a6'];
const H_STRAP: Ramp = ['#140c08', '#2a1a10', '#46301e', '#624630', '#7e5e42'];
/** His hat: soft felt, a dark moss. */
const H_FELT: Ramp = ['#0a0e08', '#141a10', '#20281a', '#2e3824', '#3e4a30'];
const HERB_G = '#7a9a4a';
/** The wisp: the friend's cyan (his rulebook, Colour 3), as the town's mystic's crystal. */
const H_WISP: Ramp = ['#0c6a80', '#18a0b4', '#22d0e0', '#b8fff8', '#ffffff'];

/** THE STILT TOWN'S HERBALIST, sculpted in a pose (the mystic's moves); `turn`: truly turned. */
export function sculptFenHerbalist(p: MysticPose, turn = 0): TownFigure {
  const B = MYSTIC_BUILD;
  const g = rigOf(B, p.bones, turn);
  const { sc, s, f, l, u, ribs, belly, pel, at, onHead, hf, hl, hu, R, dk } = g;
  const [rf, rl, ru] = ribs.r;
  const [swx, swy] = p.sway ?? [0, 0];
  const hand = p.hand ?? 'R';

  const skin = sc.mat({
    ramp: H_SKIN,
    paint: (h) => {
      const d = dk(h.prim.piece);
      if (h.prim.piece === 'head') {
        const [fw, lf, up] = onHead(h.p);
        if (h.prim.tag === 'nose' && h.tone >= 2) return sh(H_SKIN, h.tone + 1);
        if (h.prim.tag !== 'neck' && fw > 0.36 && up < 0.5 && up > -0.8) return sh(H_SKIN, Math.max(2, h.tone + 1) - (Math.abs(lf) > 0.68 ? 1 : 0));
        return null;
      }
      return d ? sh(H_SKIN, h.tone - 1) : null;
    },
  });
  headIn(g, skin, { jaw: 0.88, brow: 1.0, nose: 1.25, lean: 0.84 });
  // ---- THE COAT: moss green, to the deck, patched ----
  const waistC = add(belly.c, mul(belly.r[2], -belly.h[2] * 0.35));
  const coat = sc.mat({
    ramp: H_COAT,
    paint: (h) => {
      const d = dk(h.prim.piece);
      // (patches: squares of another cloth stitched on, here and there)
      const pu = Math.floor(h.x / 6);
      const pv = Math.floor(h.y / 7);
      const n = ((pu * 7 + pv * 13) % 11 + 11) % 11;
      if (n === 3 || n === 7) {
        const P = H_PATCH[n === 3 ? 0 : 1];
        if (h.x % 6 === 0 || h.y % 7 === 0) return sh(P, h.tone + 1 - d);
        return sh(P, h.tone - d);
      }
      if (h.prim.tag === 'skirt' && h.p[2] < 2.0) return sh(H_COAT, h.tone - 1);
      if ((h.x + Math.floor(h.y / 5)) % 6 === 0) return sh(H_COAT, h.tone - 1 - d);
      return d ? sh(H_COAT, h.tone - 1) : null;
    },
  });
  trunkIn(g, coat, 1.1, { yoke: 0.96, tag: 'coat' });
  {
    const mid = lerp3(s.ankleL, s.ankleR, 0.5);
    const top = add(pel.c, mul(s.hips[2], 1.6));
    const foot: V3 = [mid[0] + s.hips[0][0] * swx + s.hips[1][0] * swy, mid[1] + s.hips[0][1] * swx + s.hips[1][1] * swy, 1.6];
    sc.cone(coat, 'skirt', top, foot, B.pelvisHalf + 0.8, B.stance + 4.8, 1.6, { tag: 'skirt', cuts: [{ n: [0, 0, -1], o: -1.6 }, keepBelow([0, 0, 1], add(waistC, [0, 0, -1.2]))] });
  }
  for (const side of ['L', 'R'] as const) {
    const { sh: shd, el, ha } = armOf(s, side);
    const piece = `arm${side}`;
    const out = mul(l, side === 'L' ? 1 : -1);
    const [, uo] = frameOf(shd, el, out, f);
    sc.ell(coat, piece, add(shd, add(mul(u, -0.3), mul(uo, 0.5))), [mul(f, 3.0), mul(uo, 2.7), mul(u, 2.8)], 1.6, { tag: 'sleeve' });
    sc.cone(coat, piece, shd, el, 2.7, 2.5, 1.4, { tag: 'sleeve' });
    sc.cone(coat, piece, el, lerp3(el, ha, 0.8), 2.5, 2.4, 1.2, { tag: 'sleeve' });
    sc.cone(skin, piece, lerp3(el, ha, 0.78), ha, 1.35, 1.25, 0.6, { tag: 'wrist' });
  }
  openHand(g, skin, hand, [0, 0, 1], 1.0);
  openHand(g, skin, hand === 'R' ? 'L' : 'R', [0, 0, -1], 1.0);
  // the satchel's strap across him, and the satchel at his hip
  const strap = sc.mat({ ramp: H_STRAP });
  {
    const a = add(s.neck, add(mul(l, B.shoulderHalf * 0.7), add(mul(u, -1.0), mul(f, 1.2))));
    const b = add(waistC, add(mul(rl, -(belly.h[1] + 1.8)), mul(rf, belly.h[0] * 0.6 + 1.6)));
    sc.cone(strap, 'strap', a, b, 0.75, 0.75, 0.2, { tag: 'strap' });
    sc.box(strap, 'satchel', add(waistC, add(mul(rl, -(belly.h[1] + 2.8)), mul(ru, -2.6))), [mul(rf, 2.6), mul(rl, 1.4), mul(ru, 2.4)], 0.6, 0.4, { tag: 'satchel' });
  }
  // ---- HIS BEARD: thin and grey, long; THE SPECTACLES ----
  const beard = sc.mat({ ramp: H_BEARD, meld: true, paint: (h) => ((h.x + Math.floor(h.y / 3)) % 3 === 0 ? sh(H_BEARD, h.tone) : sh(H_BEARD, Math.max(2, h.tone + 1))) });
  sc.ell(beard, 'head', at(0.5, 0, -0.74), [mul(hf, R[0] * 0.46), mul(hl, R[1] * 0.6), mul(hu, R[2] * 0.36)], 0.6, { tag: 'beard' });
  sc.cone(beard, 'head', at(0.68, 0, -1.0), add(at(0.78, 0, -2.4), add(mul(hl, swy * 0.3), mul(hf, swx * 0.2))), R[1] * 0.4, 0.4, 0.5, { tag: 'beard' });
  for (const side of [1, -1]) {
    sc.mark(at(0.92, side * 0.36, 0.06), '#c8ccc4', 2, 2, side > 0 ? 0 : -1, -1, 2.6);
    sc.mark(at(0.94, side * 0.36, 0.06), '#1a1a20', 1, 1, 0, 0, 2.6);
  }
  // ---- THE HAT: soft dark felt, its brim narrow, its crown tall, its point flopped over to one side; a sprig in its band ----
  const felt = sc.mat({ ramp: H_FELT, paint: (h) => (h.n[2] < -0.2 ? H_FELT[0] : h.prim.tag === 'band' ? sh(H_STRAP, h.tone) : null) });
  sc.ell(felt, 'hatBrim', at(-0.02, 0, 0.46), [mul(hf, R[0] * 1.5), mul(hl, R[1] * 1.5), mul(hu, 0.5)], 0.3, { tag: 'brim' });
  const c0 = at(-0.06, 0, 0.6);
  const c1 = add(at(-0.12, 0, 1.75), mul(hl, swy * 0.2));
  const c2 = add(at(-0.2, 0.95, 2.05), add(mul(hl, swy * 0.5), mul(hf, -swx * 0.3)));
  sc.cone(felt, 'hat', c0, c1, R[1] * 0.92, R[1] * 0.42, 0.8, { tag: 'crown' });
  sc.cone(felt, 'hat', c1, c2, R[1] * 0.42, 0.5, 0.6, { tag: 'tip' });
  sc.cone(felt, 'hat', at(-0.06, 0, 0.62), at(-0.06, 0, 0.78), R[1] * 0.96, R[1] * 0.92, 0.2, { tag: 'band' });
  sc.mark(at(0.3, -0.85, 0.74), HERB_G, 1, 3, 0, -2, 2.6);
  // ---- boots under the hem ----
  const boot = sc.mat({ ramp: H_STRAP });
  for (const side of ['L', 'R'] as const) {
    const { heel, toe } = legOf(s, side);
    const fd = norm(sub(toe, heel));
    const fs = norm(cross([0, 0, 1], fd), [0, 1, 0]);
    sc.box(boot, `leg${side}`, add(lerp3(heel, toe, 0.62), [0, 0, 1.0]), [mul(fd, len(sub(toe, heel)) * 0.42), mul(fs, 1.5), [0, 0, 1.0]], 0.9, 0.8, { tag: 'shoe', cuts: [FLOOR_CUT] });
  }
  // ---- THE WISP over his palm: a ball of cyan, its tail curling round it; it lifts and blazes ----
  const flare = p.flare ?? 0;
  const turnC = (p.spin ?? 0) * Math.PI * 2;
  const cc = add(crystalAt(s, p), [0, 0, 1.0]);
  const aloft: Aloft[] = [{
    stands: cc,
    paint: (st, where) => {
      const [x0, y0] = where(cc);
      const r = 2.4 + flare * 1.6;
      // (its ball: white at the heart, cyan round it)
      for (let dy = -4; dy <= 4; dy++)
        for (let dx = -4; dx <= 4; dx++) {
          const d = Math.hypot(dx, dy * 1.1);
          if (d > r) continue;
          st.over.set(Math.round(x0) + dx, Math.round(y0) + dy, d < r * 0.4 ? H_WISP[4] : d < r * 0.75 ? H_WISP[3] : H_WISP[2]);
        }
      // (its tail, curling round it as it turns)
      for (let k = 0; k < 10; k++) {
        const a = turnC + k * 0.45;
        const rr = r + 1.5 + k * 0.6;
        st.over.set(Math.round(x0 + Math.cos(a) * rr * 1.2), Math.round(y0 + Math.sin(a) * rr * 0.7 + k * 0.4), k < 4 ? H_WISP[3] : k < 7 ? H_WISP[2] : H_WISP[1]);
      }
      if (flare > 0.35) {
        const k = (flare - 0.35) / 0.65;
        for (let rr = 0; rr < 8; rr++) {
          const a = (rr / 8) * Math.PI * 2 + turnC * 0.25;
          const from = 5 + 2 * k;
          const to = from + (rr % 2 === 0 ? 10 : 5) * k;
          for (let dd = from; dd <= to; dd++) st.over.set(Math.round(x0 + Math.cos(a) * dd * 1.1), Math.round(y0 + Math.sin(a) * dd * 0.9), dd > to - 2 ? H_WISP[2] : H_WISP[3]);
        }
      }
    },
    lights: (where) => {
      const [x, y] = where(cc);
      return [{ x, y, r: 15 + flare * 16, color: H_WISP[2], a: 0.4 + flare * 0.32 }];
    },
  }];
  void rf;
  void rl;
  void ru;
  void onCone;
  return { sc, s, B, aloft };
}

// ---------------------------------------------------------------------------------------------------------------------------
// THE STRANGER

/** His cowl and cloak: grey-green sacking, ragged. */
const X_SACK: Ramp = ['#0c0e0a', '#181c14', '#262c20', '#363e2e', '#4a5440'];
const X_WRAP: Ramp = ['#1a1814', '#2c2822', '#403a30', '#56503e', '#6e6650'];
const X_SKIN: Ramp = ['#2a1a26', '#523036', '#845848', '#b08464', '#d8b08c'];
const X_GOLD: Ramp = ['#4a2e0c', '#7a5210', '#d09a20', '#ffd866', '#fff3b0'];
const X_EYE = '#c8e4ec';

/** THE STILT TOWN'S STRANGER, sculpted in a pose (the stranger's moves); he never leaves the shack he leans on. */
export function sculptFenStranger(p: StrangerPose, turn = 0): TownFigure {
  const B = STRANGER_BUILD;
  const g = rigOf(B, p.bones, turn);
  const { sc, s, f, l, u, ribs, at, onHead, hf, hl, hu, R, dk } = g;
  const [rf] = ribs.r;
  const wall: Cut = { n: [-1, 0, 0], o: WALL };

  const skin = sc.mat({ ramp: X_SKIN, paint: (h) => sh(X_SKIN, Math.min(1, h.tone)) });
  headIn(g, skin, { jaw: 1.0, brow: 1.0, nose: 1.0, lean: 0.92 });
  // ---- WRAPPINGS: strips round his arms and legs, his hands ----
  const wrap = sc.mat({
    ramp: X_WRAP,
    paint: (h) => {
      if (h.prim.tag === 'sole') return sh(X_WRAP, 0);
      // (the strips wound round: a dark line slanting between each turn)
      return ((h.x + h.y * 2) % 5 === 0) ? sh(X_WRAP, h.tone - 1 - dk(h.prim.piece)) : dk(h.prim.piece) ? sh(X_WRAP, h.tone - 1) : null;
    },
  });
  const sack = sc.mat({
    ramp: X_SACK,
    crease: 0.24,
    paint: (h) => {
      const tg = h.prim.tag ?? '';
      const d = dk(h.prim.piece);
      // (sacking: its coarse weave, a lighter thread now and then; its edges ragged)
      if (tg === 'cloak' && h.p[2] < 11.5 && (h.x * 7) % 5 < 2) return sh(X_SACK, h.tone - 1);
      if ((h.x + h.y) % 4 === 0) return sh(X_SACK, h.tone - 1 - d);
      if ((h.x * 3 + h.y) % 11 === 0) return sh(X_SACK, h.tone + 1 - d);
      return d ? sh(X_SACK, h.tone - 1) : null;
    },
  });
  trunkIn(g, sack, 1.0, { tag: 'tunic', cuts: [wall] });
  for (const side of ['L', 'R'] as const) {
    const { sh: shd, el, ha } = armOf(s, side);
    const piece = `arm${side}`;
    const out = mul(l, side === 'L' ? 1 : -1);
    const [, uo] = frameOf(shd, el, out, f);
    sc.ell(sack, piece, add(shd, add(mul(u, -0.3), mul(uo, 0.5))), [mul(f, 3.0), mul(uo, 2.8), mul(u, 2.8)], 1.6, { tag: 'sleeve', cuts: [wall] });
    sc.cone(sack, piece, shd, el, 2.6, 2.3, 1.4, { tag: 'sleeve', cuts: [wall] });
    sc.cone(wrap, piece, el, lerp3(el, ha, 0.88), 2.2, 1.9, 1.2, { tag: 'wrap' });
    fistOf(g, wrap, side, 0.98);
  }
  for (const side of ['L', 'R'] as const) {
    const { hip, knee, ankle } = legOf(s, side);
    const [lH, lK, lA] = B.legR;
    const piece = `leg${side}`;
    sc.cone(wrap, piece, add(hip, mul(s.hips[2], 0.8)), knee, lH * 1.05 + 0.4, lK * 1.04 + 0.4, 1.5, { tag: 'thigh', cuts: [wall] });
    sc.cone(wrap, piece, knee, lerp3(knee, ankle, 0.6), lK * 1.02 + 0.4, lA + 0.9, 1.2, { tag: 'shin', cuts: [wall] });
  }
  bootsOnWall(g, wrap, 0.5);
  // ---- THE CLOAK, ragged, open in front; THE COWL up over his head ----
  {
    const hemZ = 11.0;
    const top = add(s.neck, add(mul(u, -1.6), mul(f, -1.0)));
    const foot: V3 = [s.pelvis[0] - 1.0 + s.hips[1][0] * (p.sway ?? 0), s.pelvis[1] + s.hips[1][1] * (p.sway ?? 0), hemZ];
    const open = keepBelow([1, 0, 0], add(s.pelvis, [-1.5, 0, 0]));
    const hem: Cut = { n: [0, 0, -1], o: -hemZ };
    sc.cone(sack, 'cloak', top, foot, B.shoulderHalf + 2.2, B.pelvisHalf + 5.0, 1.6, { tag: 'cloak', cuts: [open, wall, hem] });
    for (const side of [1, -1]) {
      const a = add(s.neck, add(mul(l, side * (B.shoulderHalf * 0.72)), add(mul(u, -1.4), mul(f, 1.6))));
      const b: V3 = [s.pelvis[0] - 3.0 + s.hips[1][0] * (side * (B.pelvisHalf + 3.6) + (p.sway ?? 0)), s.pelvis[1] + s.hips[1][1] * (side * (B.pelvisHalf + 3.6) + (p.sway ?? 0)), s.pelvis[2] - 3.0];
      sc.cone(sack, 'cloak', a, b, 2.0, 2.4, 1.2, { tag: 'cloak', cuts: [wall, hem] });
    }
    sc.ell(sack, 'head', at(-0.14, 0, 0.14), [mul(hf, R[0] * 1.3), mul(hl, R[1] * 1.28), mul(hu, R[2] * 1.24)], 1.0, { tag: 'cowl', cuts: [wall] });
    sc.cone(sack, 'head', at(-0.5, 0, 0.8), at(-1.3, 0, 0.3), R[1] * 0.74, 1.0, 1.2, { tag: 'cowl', cuts: [wall] });
    sc.cone(sack, 'head', at(-0.4, 0, -0.5), add(s.neck, add(mul(f, -1.6), mul(u, -1.4))), 3.6, 4.4, 1.6, { tag: 'cowl', cuts: [wall] });
    sc.ell(sack, 'head', at(1.16, 0, -0.16), [mul(hf, R[0] * 0.74), mul(hl, R[1] * 0.82), mul(hu, R[2] * 0.86)], 0.5, { carve: true });
  }
  // ---- THE MASK of woven reeds over his face, two slits for his eyes ----
  const mask = sc.mat({
    ramp: RUSH,
    paint: (h) => {
      const [, lf, up] = onHead(h.p);
      // (the eye-slits: dark)
      if (Math.abs(up - 0.06) < 0.1 && Math.abs(Math.abs(lf) - 0.36) < 0.2) return '#0a0806';
      // (woven: a darker line every other row, crossing)
      return (h.y % 2 === 0) !== (h.x % 4 < 2) ? sh(RUSH, Math.max(2, h.tone)) : sh(RUSH, Math.max(3, h.tone + 1));
    },
  });
  sc.ell(mask, 'mask', at(0.6, 0, -0.12), [mul(hf, R[0] * 0.5), mul(hl, R[1] * 0.78), mul(hu, R[2] * 0.82)], 0.3, { tag: 'mask', cuts: [keepBelow(mul(hf, -1), at(0.62, 0, 0))] });
  // HIS EYES: two pale points in the slits
  {
    const look = Math.round(p.look ?? 0);
    for (const side of [1, -1]) sc.mark(at(1.0, side * 0.36, 0.06), X_EYE, 1, 1, look, 0, 5.5);
  }
  // THE COIN
  const gold = sc.mat({ ramp: X_GOLD });
  if (p.coin) {
    const c = p.coin.at;
    const a = p.coin.turn * Math.PI * 2;
    const face: V3 = [Math.cos(a), 0, Math.sin(a)];
    const edge: V3 = [-Math.sin(a), 0, Math.cos(a)];
    sc.ell(gold, 'coin', c, [mul(face, 0.5), [0, 2.5, 0], mul(edge, 2.5)], 0.1, { tag: 'coin' });
  }
  const aloft: Aloft[] = [];
  if (p.coin) {
    const c = p.coin.at;
    const turnK = p.coin.turn;
    aloft.push({
      stands: c,
      paint: (st, where) => {
        if (Math.abs(Math.sin(turnK * Math.PI * 2)) > 0.5) return;
        const [x, y] = where(c);
        for (const [dx, dy] of [[0, 0], [3, 0], [-3, 0], [0, 3], [0, -3], [4, 0], [-4, 0]] as const) st.over.set(Math.round(x) + dx, Math.round(y) + dy, dx === 0 && dy === 0 ? '#ffffff' : X_GOLD[4]);
      },
      lights: (where) => {
        const [x, y] = where(c);
        return [{ x, y, r: 8, color: X_GOLD[3], a: 0.4 }];
      },
    });
  }
  void rf;
  void hu;
  void dot;
  return { sc, s, B, aloft };
}

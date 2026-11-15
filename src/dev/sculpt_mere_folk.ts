// THE FROZEN MERE'S OWN PEOPLE, SCULPTED (the queue chat, 14 Nov 2026). Each town has its own vendors: his words of 14 Nov 2026,
// “We want different looking vendors for different towns”; his pick: the armourer, the mystic and the stranger given new looks that
// fit the town, on their same moves, their stalls to match, the wordsmith the same in every town (“Yes, that (Recommended)”).
//
// Sculpted as the town's are (dev/sculpt_townsfolk.ts), on the same builds and the same moves (dev/townsfolk_moves.ts). The Mere's,
// a winter fair out on the ice:
//   the SMITH     a coat quilted thick, oxblood, its sleeves shoved up his forearms for the heat of the forge; a hat of dark fur
//                 with its flaps tied up; a scarf of brown wool; his beard black, frost in it; a leather apron; felt boots
//   the SELLER    tall in a long quilted coat of deep blue to the snow, a band of white stitching round its hem, a fur collar;
//                 a tall hat of pale fur; a long grey moustache, his cheeks red with the cold. Over his palm, as the town's mystic's
//                 crystal turns, an ICE CRYSTAL turns, six points, the friend's cyan; it lifts and blazes the same
//   the STRANGER  leaning on the ice-fisher's hut, arms folded: a dark parka, its hood up and ringed with a ruff of fur, so
//                 that his face is a shadow with two pale points in it (never gold); fur boots to the knee. His coin
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

// ---------------------------------------------------------------------------------------------------------------------------
// THE SMITH

const K_SKIN: Ramp = ['#38181e', '#6a3434', '#a8664e', '#d09272', '#eec09c'];
/** His coat: quilted thick, oxblood. */
const K_COAT: Ramp = ['#1e080a', '#3a1014', '#5a1c1e', '#7c2c28', '#9e4236'];
/** His hat: dark fur. */
const K_FUR: Ramp = ['#140e0c', '#261c16', '#3e2e22', '#584432', '#725a44'];
/** His scarf: brown wool, a dull ochre. */
const K_SCARF: Ramp = ['#2a1c0c', '#4a3214', '#6e4c1e', '#94682c', '#b68840'];
/** His beard: black, frost in it. */
const K_BEARD: Ramp = ['#08080c', '#121218', '#1e1e26', '#2e2e3a', '#44444e'];
const K_FROST = '#b8c8dc';
const K_APRON: Ramp = ['#140c08', '#2a1a10', '#46301e', '#624630', '#7e5e42'];
const K_WOOL: Ramp = ['#0e0e14', '#1c1c26', '#2e2e3c', '#444456', '#5c5c70'];
/** His boots: grey felt. */
const K_FELT: Ramp = ['#1a1a1e', '#2e2e34', '#46464e', '#62626a', '#808088'];

/** THE MERE'S SMITH, sculpted in a pose (the armourer's moves); `turn`: truly turned. */
export function sculptMereSmith(p: ArmourerPose, turn = 0): TownFigure {
  const B = ARMOURER_BUILD;
  const g = rigOf(B, p.bones, turn);
  const { sc, s, f, l, u, ribs, belly, pel, at, onHead, hf, hl, hu, R, dk } = g;
  const [rf, rl, ru] = ribs.r;

  const skin = sc.mat({
    ramp: K_SKIN,
    paint: (h) => {
      const tg = h.prim.tag ?? '';
      const d = dk(h.prim.piece);
      if (h.prim.piece === 'head') {
        const [fw, lf, up] = onHead(h.p);
        if (tg === 'nose' && h.tone >= 2) return sh(K_SKIN, h.tone + 1);
        // (his cheeks and nose red with the cold)
        if (tg === 'cheek' && fw > 0.4) return h.tone >= 2 ? '#c4625a' : sh(K_SKIN, h.tone);
        if (tg !== 'neck' && fw > 0.36 && up < 0.34 && up > -0.8) return sh(K_SKIN, Math.max(2, h.tone + 1) - (Math.abs(lf) > 0.66 ? 1 : 0));
        return null;
      }
      if (tg === 'fore' && (h.x * 3 + h.y * 5) % 7 === 0) return sh(K_SKIN, h.tone - 1 - d);
      return d ? sh(K_SKIN, h.tone - 1) : null;
    },
  });
  headIn(g, skin, { jaw: 1.1, brow: 1.1, nose: 1.3 });
  for (const side of ['L', 'R'] as const) {
    const { el, ha } = armOf(s, side);
    const piece = `arm${side}`;
    const out = mul(l, side === 'L' ? 1 : -1);
    const wrist = lerp3(el, ha, 0.82);
    sc.cone(skin, piece, lerp3(el, ha, 0.2), wrist, 2.8, 2.0, 1.2, { tag: 'fore' });
    const [fd, fo, fw] = frameOf(el, ha, out, f);
    sc.ell(skin, piece, add(lerp3(el, ha, 0.3), mul(fo, 0.6)), [mul(fd, 3.1), mul(fo, 2.7), mul(fw, 2.5)], 1.0, { tag: 'foreBulge' });
    fistOf(g, skin, side, 1.22);
  }

  // ---- THE COAT: quilted, oxblood; its sleeves shoved up to below the elbow in thick rolls; its skirts to mid-thigh ----
  const coat = sc.mat({
    ramp: K_COAT,
    crease: 0.18,
    paint: (h) => {
      const tg = h.prim.tag ?? '';
      const d = dk(h.prim.piece);
      if (tg === 'roll') return sh(K_COAT, h.tone + 1 - d);
      // (the quilting: stitched in diamonds, a darker line along each, a lighter puff between)
      const a = (h.x + h.y * 2) % 6;
      const b = (h.x - h.y * 2 + 600) % 6;
      if (a === 0 || b === 0) return sh(K_COAT, h.tone - 1 - d);
      if (a === 3 && b === 3) return sh(K_COAT, h.tone + 1 - d);
      return d ? sh(K_COAT, h.tone - 1) : null;
    },
  });
  trunkIn(g, coat, 1.3, { paunch: 2.2, yoke: 1.18, tag: 'coat' });
  sc.ell(coat, 'torso', add(pel.c, mul(pel.r[2], -2.6)), [mul(pel.r[0], pel.h[0] + 2.6), mul(pel.r[1], pel.h[1] + 2.4), mul(pel.r[2], pel.h[2] + 4.0)], 1.2, { tag: 'skirt' });
  for (const side of ['L', 'R'] as const) {
    const { sh: shd, el, ha } = armOf(s, side);
    const piece = `arm${side}`;
    const out = mul(l, side === 'L' ? 1 : -1);
    const [, uo] = frameOf(shd, el, out, f);
    const dOut = norm(sub(uo, mul(f, dot(uo, f))), out);
    let dUp = norm(cross(f, dOut), u);
    if (dot(dUp, u) < 0) dUp = mul(dUp, -1);
    sc.ell(coat, piece, add(shd, add(mul(u, -0.2), mul(uo, 1.0))), [mul(f, 4.1), mul(dOut, 3.8), mul(dUp, 3.8)], 1.4, { tag: 'sleeve' });
    sc.cone(coat, piece, shd, el, 3.8, 3.5, 1.4, { tag: 'sleeve' });
    sc.cone(coat, piece, el, lerp3(el, ha, 0.24), 3.7, 3.6, 0.6, { tag: 'roll' });
  }
  const wool = sc.mat({ ramp: K_WOOL, paint: (h) => (dk(h.prim.piece) ? sh(K_WOOL, h.tone - 1) : null) });
  for (const side of ['L', 'R'] as const) {
    const { hip, knee, ankle } = legOf(s, side);
    const [lH, lK, lA] = B.legR;
    const piece = `leg${side}`;
    sc.cone(wool, piece, add(hip, mul(s.hips[2], 0.8)), knee, lH * 1.08 + 0.5, lK * 1.05 + 0.5, 1.5, { tag: 'thigh' });
    sc.cone(wool, piece, knee, lerp3(knee, ankle, 0.7), lK * 1.02 + 0.5, lA + 0.9, 1.2, { tag: 'shin' });
  }
  const felt = sc.mat({
    ramp: K_FELT,
    paint: (h) => {
      const tg = h.prim.tag ?? '';
      if (tg === 'sole') return sh(K_FELT, h.tone - 2);
      if (tg === 'cuff') return sh(K_FELT, h.tone + 1);
      return dk(h.prim.piece) ? sh(K_FELT, h.tone - 1) : null;
    },
  });
  bootsOn(g, felt, 0.7, 1.12);

  // ---- THE APRON: leather, a bib and a skirt to the knee (the town's smith's shape: the trade's) ----
  const waistC = add(belly.c, mul(belly.r[2], -belly.h[2] * 0.25));
  const kneeZ = Math.max(s.kneeL[2], s.kneeR[2]) - 1.2;
  const apron = sc.mat({
    ramp: K_APRON,
    crease: 0.2,
    paint: (h) => {
      const tg = h.prim.tag ?? '';
      if (tg === 'bib') {
        const b = onBall(h.prim as Ell, h.p);
        if (Math.abs(b[1]) > 0.8 || b[2] > 0.82) return sh(K_APRON, h.tone + 1);
      }
      if (tg === 'skirt' && h.p[2] < kneeZ + 1.3) return sh(K_APRON, h.tone + 1);
      if (tg === 'bib' || tg === 'skirt') {
        const k = (Math.floor(h.p[2] * 1.3) * 7 + h.x * 13) % 23;
        if (k === 0 || k === 9) return sh(K_APRON, h.tone - 1);
      }
      return null;
    },
  });
  {
    const front = keepBelow(mul(rf, -1), add(ribs.c, mul(rf, ribs.h[0] * 0.22)));
    const bibC = add(lerp3(ribs.c, belly.c, 0.5), mul(rf, 0.9));
    sc.ell(apron, 'apron', bibC, [mul(rf, ribs.h[0] * 0.98 + 3.2), mul(rl, ribs.h[1] * 0.58), mul(ru, ribs.h[2] * 0.9)], 0.6, { tag: 'bib', cuts: [front] });
    const frontOnly = keepBelow(mul(pel.r[0], -1), add(pel.c, mul(pel.r[0], -pel.h[0] * 0.55)));
    const top = keepBelow([0, 0, 1], add(waistC, [0, 0, 1.2]));
    const bot: Cut = { n: [0, 0, -1], o: -kneeZ };
    const mid = lerp3(waistC, lerp3(s.kneeL, s.kneeR, 0.5), 0.5);
    sc.ell(apron, 'apron', add(mid, mul(pel.r[0], 1.6)), [mul(pel.r[0], pel.h[0] + 5.6), mul(pel.r[1], pel.h[1] + 4.6), [0, 0, (waistC[2] - kneeZ) * 0.95]], 0.8, { tag: 'skirt', cuts: [frontOnly, top, bot] });
    sc.ell(apron, 'apron', waistC, [mul(belly.r[0], belly.h[0] + 4.3), mul(belly.r[1], belly.h[1] + 2.8), mul(belly.r[2], 0.85)], 0.3, { tag: 'string' });
  }
  // ---- THE SCARF: thick brown wool wound round his neck, an end hanging down his front ----
  const scarf = sc.mat({ ramp: K_SCARF, paint: (h) => ((h.x + h.y) % 3 === 0 ? sh(K_SCARF, h.tone - 1) : (h.y % 4 === 0 ? sh(K_SCARF, h.tone + 1) : null)) });
  {
    sc.cone(scarf, 'scarf', add(s.neck, add(mul(u, -1.4), mul(f, -0.4))), add(s.neck, add(mul(u, 1.0), mul(f, 0.0))), 4.0, 3.5, 0.8, { tag: 'scarf' });
    const [bx] = p.beard ?? [0, 0];
    const a = add(s.neck, add(mul(f, 3.8), add(mul(l, -2.0), mul(u, -1.0))));
    const b = add(a, add(mul(ru, -9.5), add(mul(rf, 1.6), mul(rl, bx * 0.3))));
    sc.cone(scarf, 'scarf', a, b, 1.7, 1.6, 0.4, { tag: 'end' });
  }
  // ---- HIS BEARD, black with frost in it; the hat of dark fur, its flaps tied up ----
  const [bx, bz] = p.beard ?? [0, 0];
  const hair = sc.mat({
    ramp: K_BEARD,
    meld: true,
    paint: (h) => {
      const tg = h.prim.tag ?? '';
      const lit = Math.max(2, h.tone + 1);
      if (tg === 'beard' || tg === 'tash') {
        if ((h.x * 7 + h.y * 3) % 11 === 0) return K_FROST;
        return (h.x + Math.floor(h.y / 3)) % 3 === 0 ? sh(K_BEARD, lit - 1) : sh(K_BEARD, lit);
      }
      if (tg === 'brow') return sh(K_BEARD, Math.min(4, lit + 1));
      return null;
    },
  });
  {
    const swing = add(mul(hl, bx), mul(hu, bz));
    sc.ell(hair, 'head', at(0.42, 0, -0.78), [mul(hf, R[0] * 0.62), mul(hl, R[1] * 0.92), mul(hu, R[2] * 0.52)], 0.9, { tag: 'beard' });
    for (const side of [1, -1]) sc.cone(hair, 'head', at(-0.02, side * 0.86, -0.3), at(0.4, side * 0.66, -0.9), 1.5, 2.3, 0.8, { tag: 'beard' });
    const a = at(0.6, 0, -1.2);
    const b = add(at(0.66, 0, -2.0), mul(swing, 0.6));
    sc.cone(hair, 'head', a, b, R[1] * 0.84, R[1] * 0.5, 0.9, { tag: 'beard' });
    sc.ell(hair, 'head', at(1.0, 0, -0.4), [mul(hf, 0.8), mul(hl, R[1] * 0.42), mul(hu, 0.8)], 0.4, { tag: 'tash' });
    for (const side of [1, -1]) sc.cone(hair, 'head', at(0.92, side * 0.12, 0.3), at(0.78, side * 0.72, 0.24), 0.7, 0.55, 0.3, { tag: 'brow' });
  }
  const fur = sc.mat({
    ramp: K_FUR,
    meld: true,
    paint: (h) => ((h.x + Math.floor(h.y / 2)) % 3 === 0 ? sh(K_FUR, h.tone - 1) : sh(K_FUR, Math.max(1, h.tone))),
  });
  {
    // (round on his head, a band of fur round its foot, its two flaps turned up over it and tied)
    sc.ell(fur, 'hat', at(-0.1, 0, 0.62), [mul(hf, R[0] * 1.0), mul(hl, R[1] * 1.04), mul(hu, R[2] * 0.66)], 0.8, { tag: 'crown' });
    sc.ell(fur, 'hat', at(-0.06, 0, 0.36), [mul(hf, R[0] * 1.08), mul(hl, R[1] * 1.12), mul(hu, 1.8)], 0.5, { tag: 'band' });
    for (const side of [1, -1]) sc.ell(fur, 'hat', at(-0.1, side * 0.98, 0.56), [mul(hf, R[0] * 0.5), mul(hl, 0.9), mul(hu, R[2] * 0.42)], 0.4, { tag: 'flap' });
  }
  for (const side of [1, -1]) {
    sc.mark(at(0.82, side * 0.38, 0.08), sh(K_SKIN, 1), 2, 1, side > 0 ? 0 : -1);
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
  void ru;
  void len;
  void onCone;
  return { sc, s, B, aloft };
}

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
// THE SELLER

const L_SKIN: Ramp = ['#30181c', '#5c3030', '#94604c', '#c48e6e', '#e6bc98'];
/** His long coat: quilted, deep blue. */
const L_COAT: Ramp = ['#080a1e', '#10163a', '#1c2658', '#2c3a7a', '#42549c'];
/** The white of its stitched hem and of his collar's fur and his hat. */
const L_WHITE: Ramp = ['#545a6a', '#868c9c', '#b6bcc8', '#dce0e8', '#f6f8fc'];
const L_HAIR: Ramp = ['#3e3c44', '#6a6872', '#9a98a2', '#c8c6ce', '#eceaf0'];
/** His hat's fur: grey. */
const L_HATFUR: Ramp = ['#26262c', '#3e3e46', '#5c5c66', '#80808a', '#a4a4ae'];
const L_BOOT: Ramp = ['#100a08', '#20140e', '#382418', '#523624', '#6c4a32'];
/** The ice crystal: the friend's cyan (his rulebook, Colour 3), as the town's mystic's crystal. */
const L_ICE: Ramp = ['#0c6a80', '#18a0b4', '#22d0e0', '#b8fff8', '#ffffff'];

/** THE MERE'S SELLER, sculpted in a pose (the mystic's moves); `turn`: truly turned. */
export function sculptMereSeller(p: MysticPose, turn = 0): TownFigure {
  const B = MYSTIC_BUILD;
  const g = rigOf(B, p.bones, turn);
  const { sc, s, f, l, u, ribs, belly, pel, at, onHead, hf, hl, hu, R, dk } = g;
  const [swx, swy] = p.sway ?? [0, 0];
  const hand = p.hand ?? 'R';

  const skin = sc.mat({
    ramp: L_SKIN,
    paint: (h) => {
      const d = dk(h.prim.piece);
      if (h.prim.piece === 'head') {
        const [fw, lf, up] = onHead(h.p);
        if (h.prim.tag === 'nose' && h.tone >= 2) return '#c46a5e';
        if (h.prim.tag === 'cheek' && fw > 0.4 && h.tone >= 2) return '#c86c60';
        if (h.prim.tag !== 'neck' && fw > 0.36 && up < 0.5 && up > -0.8) return sh(L_SKIN, Math.max(2, h.tone + 1) - (Math.abs(lf) > 0.68 ? 1 : 0));
        return null;
      }
      return d ? sh(L_SKIN, h.tone - 1) : null;
    },
  });
  headIn(g, skin, { jaw: 0.95, brow: 1.0, nose: 1.1, lean: 0.88 });

  // ---- THE COAT: quilted, deep blue, from his shoulders to the snow; a band of white stitching round its hem ----
  const waistC = add(belly.c, mul(belly.r[2], -belly.h[2] * 0.35));
  const coat = sc.mat({
    ramp: L_COAT,
    paint: (h) => {
      const tg = h.prim.tag ?? '';
      const d = dk(h.prim.piece);
      if (tg === 'skirt') {
        // (its hem: a band of white stitching in a running zigzag)
        if (h.p[2] < 4.4 && h.p[2] > 1.2) {
          const z = Math.floor(h.p[2] * 2);
          return (h.x + z) % 4 === 0 || (h.x - z + 400) % 4 === 0 ? sh(L_WHITE, 3) : sh(L_COAT, h.tone);
        }
        if (h.p[2] <= 1.2) return sh(L_COAT, h.tone - 1);
      }
      // (quilted in long channels down him)
      if ((tg === 'skirt' || tg === 'coat') && h.x % 4 === 0) return sh(L_COAT, h.tone - 1 - d);
      if (tg === 'sleeve' && h.y % 4 === 0) return sh(L_COAT, h.tone - 1 - d);
      return d ? sh(L_COAT, h.tone - 1) : null;
    },
  });
  trunkIn(g, coat, 1.2, { yoke: 0.98, tag: 'coat' });
  {
    const mid = lerp3(s.ankleL, s.ankleR, 0.5);
    const top = add(pel.c, mul(s.hips[2], 1.6));
    const foot: V3 = [mid[0] + s.hips[0][0] * swx + s.hips[1][0] * swy, mid[1] + s.hips[0][1] * swx + s.hips[1][1] * swy, 0.4];
    sc.cone(coat, 'skirt', top, foot, B.pelvisHalf + 1.0, B.stance + 5.2, 1.6, { tag: 'skirt', cuts: [{ n: [0, 0, -1], o: -0.5 }, keepBelow([0, 0, 1], add(waistC, [0, 0, -1.2]))] });
  }
  const white = sc.mat({
    ramp: L_WHITE,
    meld: true,
    paint: (h) => ((h.x + Math.floor(h.y / 2)) % 3 === 0 ? sh(L_WHITE, h.tone - 1 - dk(h.prim.piece)) : sh(L_WHITE, Math.max(2, h.tone) - dk(h.prim.piece))),
  });
  for (const side of ['L', 'R'] as const) {
    const { sh: shd, el, ha } = armOf(s, side);
    const piece = `arm${side}`;
    const out = mul(l, side === 'L' ? 1 : -1);
    const [, uo] = frameOf(shd, el, out, f);
    sc.ell(coat, piece, add(shd, add(mul(u, -0.3), mul(uo, 0.5))), [mul(f, 3.2), mul(uo, 2.9), mul(u, 3.0)], 1.6, { tag: 'sleeve' });
    sc.cone(coat, piece, shd, el, 2.9, 2.7, 1.4, { tag: 'sleeve' });
    sc.cone(coat, piece, el, lerp3(el, ha, 0.8), 2.7, 2.5, 1.2, { tag: 'sleeve' });
    sc.cone(white, piece, lerp3(el, ha, 0.7), lerp3(el, ha, 0.86), 2.8, 2.7, 0.4, { tag: 'cuff' });
    sc.cone(skin, piece, lerp3(el, ha, 0.8), ha, 1.35, 1.25, 0.6, { tag: 'wrist' });
  }
  openHand(g, skin, hand, [0, 0, 1], 1.0);
  openHand(g, skin, hand === 'R' ? 'L' : 'R', [0, 0, -1], 1.0);
  // the collar of white fur, deep, round his shoulders
  sc.cone(white, 'collar', add(s.neck, add(mul(u, -1.8), mul(f, -0.6))), add(s.neck, add(mul(u, 0.6), mul(f, -0.3))), B.shoulderHalf * 0.62 + 1.6, 3.6, 0.8, { tag: 'collar' });
  // a sash of the coat's own blue, darker, round his waist
  const sash = sc.mat({ ramp: L_COAT, paint: (h) => sh(L_COAT, h.tone - 1) });
  sc.ell(sash, 'sash', waistC, [mul(belly.r[0], belly.h[0] + 3.2), mul(belly.r[1], belly.h[1] + 2.8), mul(belly.r[2], 1.4)], 0.3, { tag: 'sash' });

  // ---- HIS FACE: a long grey moustache down past his chin; grey brows ----
  const hair = sc.mat({
    ramp: L_HAIR,
    meld: true,
    paint: (h) => {
      const lit = Math.max(2, h.tone + 1);
      if (h.prim.tag === 'brow') return sh(L_HAIR, Math.min(4, lit));
      return (h.x + Math.floor(h.y / 3)) % 3 === 0 ? sh(L_HAIR, lit - 1) : sh(L_HAIR, lit);
    },
  });
  sc.ell(hair, 'head', at(1.0, 0, -0.4), [mul(hf, 0.7), mul(hl, R[1] * 0.42), mul(hu, 0.7)], 0.4, { tag: 'tash' });
  for (const side of [1, -1]) {
    sc.cone(hair, 'head', at(0.98, side * 0.24, -0.44), add(at(0.86, side * 0.56, -1.2), mul(hl, swy * 0.2 * side)), 0.9, 0.5, 0.3, { tag: 'tash' });
    sc.cone(hair, 'head', add(at(0.86, side * 0.56, -1.2), mul(hl, swy * 0.2 * side)), add(at(0.82, side * 0.6, -1.8), mul(hl, swy * 0.3 * side)), 0.5, 0.3, 0.2, { tag: 'tash' });
    sc.cone(hair, 'head', at(0.92, side * 0.12, 0.3), at(0.78, side * 0.72, 0.26), 0.7, 0.5, 0.3, { tag: 'brow' });
  }
  for (const side of [1, -1]) {
    sc.mark(at(0.86, side * 0.38, 0.02), '#140a18', 1, 1, 0, 0, 2.4);
    sc.mark(at(0.9, side * 0.4, 0.22), sh(L_SKIN, 0), 2, 1, side > 0 ? 0 : -1, 0, 2.4);
  }
  // ---- THE HAT: round and deep, grey fur, its crown of the coat's blue ----
  const hatFur = sc.mat({ ramp: L_HATFUR, meld: true, paint: (h) => ((h.x + Math.floor(h.y / 2)) % 3 === 0 ? sh(L_HATFUR, h.tone - 1) : sh(L_HATFUR, Math.max(1, h.tone))) });
  sc.cone(hatFur, 'hat', at(-0.1, 0, 0.5), at(-0.16, 0, 1.18), R[1] * 1.18, R[1] * 1.14, 0.8, { tag: 'hat' });
  sc.ell(coat, 'hatTop', at(-0.16, 0, 1.2), [mul(hf, R[0] * 0.92), mul(hl, R[1] * 1.0), mul(hu, R[2] * 0.2)], 0.4, { tag: 'hatTop' });

  // ---- BOOTS under the hem ----
  const boot = sc.mat({ ramp: L_BOOT });
  for (const side of ['L', 'R'] as const) {
    const { heel, toe } = legOf(s, side);
    const fd = norm(sub(toe, heel));
    const fs = norm(cross([0, 0, 1], fd), [0, 1, 0]);
    sc.box(boot, `leg${side}`, add(lerp3(heel, toe, 0.62), [0, 0, 1.0]), [mul(fd, len(sub(toe, heel)) * 0.42), mul(fs, 1.5), [0, 0, 1.0]], 0.9, 0.8, { tag: 'shoe', cuts: [FLOOR_CUT] });
  }

  // ---- THE ICE CRYSTAL over his open palm: six points, turning; it lifts and blazes ----
  const flare = p.flare ?? 0;
  const turnC = (p.spin ?? 0) * Math.PI * 2;
  const cc = crystalAt(s, p);
  const big = 1 + flare * 0.4;
  const ice = sc.mat({
    ramp: L_ICE,
    crease: 0,
    paint: (h) => {
      const t = onCone(h.prim as Cone, h.p, [0, 0, 1]);
      return sh(L_ICE, Math.max(1, 2 + (t.t > 0.6 ? 1 : 0) + (flare > 0.5 ? 1 : 0) + (Math.cos(t.around + turnC) > 0.3 ? 1 : 0)));
    },
  });
  for (let k = 0; k < 6; k++) {
    const a = turnC * 0.5 + (k / 6) * Math.PI * 2;
    // (its six arms in a flat star standing upright, turning about the up of it)
    const dir: V3 = [Math.cos(turnC) * Math.cos(a), Math.sin(turnC) * Math.cos(a), Math.sin(a)];
    sc.cone(ice, 'crystal', cc, add(cc, mul(dir, 4.2 * big)), 0.9 * big, 0.2, 0.1, { tag: 'arm' });
  }
  const aloft: Aloft[] = [{
    stands: cc,
    paint: (st, where) => {
      const [x0, y0] = where(cc);
      const n = flare > 0.2 ? 7 : 4;
      for (let j = 0; j < n; j++) {
        const a = turnC * (1 + (j % 2)) + (j * Math.PI * 2) / n;
        const far = 8 + flare * 6 + (j % 3);
        st.over.set(Math.round(x0 + Math.cos(a) * far * 1.15), Math.round(y0 + Math.sin(a) * far * 0.6 - (j % 2)), j % 2 === 0 ? L_ICE[3] : L_ICE[2]);
      }
      if (flare > 0.35) {
        const k = (flare - 0.35) / 0.65;
        for (let r = 0; r < 6; r++) {
          const a = (r / 6) * Math.PI * 2 + turnC * 0.25;
          const from = 6 + 2 * k;
          const to = from + 10 * k;
          for (let dd = from; dd <= to; dd++) st.over.set(Math.round(x0 + Math.cos(a) * dd * 1.1), Math.round(y0 + Math.sin(a) * dd * 0.9), dd > to - 2 ? L_ICE[2] : dd > to - 5 ? L_ICE[3] : '#ffffff');
        }
      }
    },
    lights: (where) => {
      const [x, y] = where(cc);
      return [{ x, y, r: 14 + flare * 16, color: L_ICE[2], a: 0.34 + flare * 0.34 }];
    },
  }];
  void ribs;
  return { sc, s, B, aloft };
}

// ---------------------------------------------------------------------------------------------------------------------------
// THE STRANGER

/** His parka: dark, a brown near black. */
const P_PARKA: Ramp = ['#0c0a0a', '#1a1614', '#2a2420', '#3c342e', '#524840'];
/** The ruff of fur round his hood, and his boots: grey-brown, shaggy. */
const P_FUR: Ramp = ['#3a362e', '#5e5648', '#867c68', '#aaa08a', '#ccc4ae'];
const P_GLOVE: Ramp = ['#0a0808', '#161210', '#24201c', '#36302a', '#4a423a'];
const P_TROUSER: Ramp = ['#0a0a10', '#14141e', '#22222e', '#323242', '#464658'];
const P_SKIN: Ramp = ['#2a1a26', '#523036', '#845848', '#b08464', '#d8b08c'];
const P_GOLD: Ramp = ['#4a2e0c', '#7a5210', '#d09a20', '#ffd866', '#fff3b0'];
const P_EYE = '#c8e4ec';

/** THE MERE'S STRANGER, sculpted in a pose (the stranger's moves); he never leaves the hut he leans on. */
export function sculptMereStranger(p: StrangerPose, turn = 0): TownFigure {
  const B = STRANGER_BUILD;
  const g = rigOf(B, p.bones, turn);
  const { sc, s, f, l, u, pel, at, onHead, hf, hl, hu, R, dk } = g;
  const wall: Cut = { n: [-1, 0, 0], o: WALL };

  const skin = sc.mat({ ramp: P_SKIN, paint: (h) => sh(P_SKIN, Math.min(1, h.tone)) });
  headIn(g, skin, { jaw: 1.0, brow: 1.0, nose: 1.1, lean: 0.92 });
  const parka = sc.mat({
    ramp: P_PARKA,
    crease: 0.22,
    paint: (h) => {
      const tg = h.prim.tag ?? '';
      const d = dk(h.prim.piece);
      if (tg === 'hood') {
        const [fw, , up] = onHead(h.p);
        if (fw > 0.6 && up < 0.6) return P_PARKA[0];
      }
      // (long seams down it; its hem a tone lighter where it is bound)
      if (tg === 'parka' && h.p[2] < 14.0) return sh(P_PARKA, h.tone + 1);
      if ((h.x + Math.floor(h.y / 6)) % 5 === 0) return sh(P_PARKA, h.tone - 1 - d);
      return d ? sh(P_PARKA, h.tone - 1) : null;
    },
  });
  trunkIn(g, parka, 1.4, { tag: 'parka', cuts: [wall] });
  sc.ell(parka, 'torso', add(pel.c, mul(pel.r[2], -3.6)), [mul(pel.r[0], pel.h[0] + 2.6), mul(pel.r[1], pel.h[1] + 2.4), mul(pel.r[2], pel.h[2] + 5.0)], 1.2, { tag: 'parka', cuts: [wall, { n: [0, 0, -1], o: -13.0 }] });
  const glove = sc.mat({ ramp: P_GLOVE });
  for (const side of ['L', 'R'] as const) {
    const { sh: shd, el, ha } = armOf(s, side);
    const piece = `arm${side}`;
    const out = mul(l, side === 'L' ? 1 : -1);
    const [, uo] = frameOf(shd, el, out, f);
    sc.ell(parka, piece, add(shd, add(mul(u, -0.3), mul(uo, 0.5))), [mul(f, 3.2), mul(uo, 3.0), mul(u, 3.0)], 1.6, { tag: 'sleeve', cuts: [wall] });
    sc.cone(parka, piece, shd, el, 2.9, 2.7, 1.4, { tag: 'sleeve', cuts: [wall] });
    sc.cone(parka, piece, el, lerp3(el, ha, 0.86), 2.7, 2.4, 1.2, { tag: 'sleeve' });
    fistOf(g, glove, side, 1.02);
  }
  const trouser = sc.mat({ ramp: P_TROUSER, paint: (h) => (dk(h.prim.piece) ? sh(P_TROUSER, h.tone - 1) : null) });
  for (const side of ['L', 'R'] as const) {
    const { hip, knee, ankle } = legOf(s, side);
    const [lH, lK, lA] = B.legR;
    const piece = `leg${side}`;
    sc.cone(trouser, piece, add(hip, mul(s.hips[2], 0.8)), knee, lH * 1.05 + 0.4, lK * 1.04 + 0.4, 1.5, { tag: 'thigh', cuts: [wall] });
    sc.cone(trouser, piece, knee, lerp3(knee, ankle, 0.6), lK * 1.02 + 0.4, lA + 0.9, 1.2, { tag: 'shin', cuts: [wall] });
  }
  const fur = sc.mat({
    ramp: P_FUR,
    meld: true,
    paint: (h) => {
      const tg = h.prim.tag ?? '';
      if (tg === 'sole') return sh(P_FUR, 0);
      if (tg === 'cuff') return sh(P_FUR, Math.max(3, h.tone + 1));
      // (bands of hide stitched round the boots; shaggy elsewhere)
      if (tg === 'boot' && (h.y % 7 === 0)) return sh(P_PARKA, 2);
      return (h.x + Math.floor(h.y / 2)) % 3 === 0 ? sh(P_FUR, h.tone - 1 - dk(h.prim.piece)) : sh(P_FUR, Math.max(1, h.tone) - dk(h.prim.piece));
    },
  });
  bootsOnWall(g, fur, 0.8);
  // ---- THE HOOD, up, round his head; its ruff of fur round his face ----
  {
    sc.ell(parka, 'head', at(-0.14, 0, 0.14), [mul(hf, R[0] * 1.36), mul(hl, R[1] * 1.34), mul(hu, R[2] * 1.28)], 1.0, { tag: 'hood', cuts: [wall] });
    sc.cone(parka, 'head', at(-0.4, 0, -0.5), add(s.neck, add(mul(f, -1.6), mul(u, -1.4))), 3.8, 4.6, 1.6, { tag: 'hood', cuts: [wall] });
    sc.ell(parka, 'head', at(1.18, 0, -0.14), [mul(hf, R[0] * 0.8), mul(hl, R[1] * 0.9), mul(hu, R[2] * 0.98)], 0.5, { carve: true });
    const ring = keepBelow(mul(hf, -1), at(0.62, 0, 0));
    sc.ell(fur, 'ruff', at(0.46, 0, -0.08), [mul(hf, R[0] * 0.9), mul(hl, R[1] * 1.42), mul(hu, R[2] * 1.36)], 0.5, { tag: 'ruff', cuts: [ring, keepBelow(hf, at(0.98, 0, 0)), wall] });
    sc.ell(parka, 'head', at(1.12, 0, -0.14), [mul(hf, R[0] * 0.7), mul(hl, R[1] * 0.86), mul(hu, R[2] * 0.94)], 0.3, { carve: true });
  }
  // HIS EYES: two pale points in the dark of the hood
  {
    const look = Math.round(p.look ?? 0);
    for (const side of [1, -1]) sc.mark(at(0.78, side * 0.36, 0.08), P_EYE, 1, 1, look, 0, 5.5);
  }
  // THE COIN, when it is in the air
  const gold = sc.mat({ ramp: P_GOLD });
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
        for (const [dx, dy] of [[0, 0], [3, 0], [-3, 0], [0, 3], [0, -3], [4, 0], [-4, 0]] as const) st.over.set(Math.round(x) + dx, Math.round(y) + dy, dx === 0 && dy === 0 ? '#ffffff' : P_GOLD[4]);
      },
      lights: (where) => {
        const [x, y] = where(c);
        return [{ x, y, r: 8, color: P_GOLD[3], a: 0.4 }];
      },
    });
  }
  void hu;
  return { sc, s, B, aloft };
}

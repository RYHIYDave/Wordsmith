// THE ISLE OF STONES' OWN PEOPLE, SCULPTED (the queue chat, 14 Nov 2026). His word on the isle drawn to the game's standard,
// asked what to change: “We want different looking vendors for different towns”; asked whether that meant the isle's armourer,
// mystic and stranger given new looks that fit the isle (furs, bone charms, sealskin), on their same moves, their stalls redone
// to match, the wordsmith the same in every town: “Yes, that (Recommended)”.
//
// So each is sculpted as the town's are (dev/sculpt_townsfolk.ts: one body on the heroes' bones, cloth laid over it, each stuff
// inked off from the next, at the Brawler's grain and no finer), on the SAME BUILD AND THE SAME POSES (dev/townsfolk_moves.ts:
// what each does now and then is what the town's does), in the isle's own dress:
//   the SMITH     a big copper-haired smith: his beard in one thick braid ringed with iron, his hair tied back; a mantle of grey
//                 fur over his shoulders, a sleeveless tunic of undyed wool, his arms bare and banded with old ink; an apron of
//                 sealskin from his waist to his knees; his legs bound in strips; boots of fur. His hammer.
//   the SEER      an old man of the isle: a cloak of dark hide with its hood up, edged in pale fur; under it a robe of the sea's
//                 deep green; his white beard in two braids; ink across his brow; a cord round his waist hung with charms of
//                 bone, shells round his neck and a great disc of bone carved with a rune. Over his palm, as the town's mystic's
//                 crystal turns, a SEA-STONE turns, round and smooth, the friend's cyan in its rune; it lifts and blazes the same.
//   the STRANGER  leaning on his stone in the dark, arms folded: a long coat of oiled sailcloth, grey-green, its collar up to his
//                 jaw; a thick knitted jumper; tall sea boots; a broad hat of tarred cloth pulled down, so that his face is a
//                 shadow with two pale points in it (never gold: the enemy's). His coin, the same.
// No edge of light (his rulebook, Pixels 5: "Townsfolk have none"). What glows is the friend's cyan, or a coin's gold, or sparks.

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

// ---------------------------------------------------------------------------------------------------------------------------
// THE SMITH

/** Skin: weathered by the wind off the sea, ruddy at the forge. */
const I_SKIN: Ramp = ['#38181e', '#6a3434', '#a4644e', '#cc9070', '#ecbe9a'];
/** His hair and beard: copper. */
const I_HAIR: Ramp = ['#2a0e08', '#561e10', '#86341a', '#b4542a', '#d8804a'];
/** The mantle on his shoulders and his boots: grey fur. */
const I_FUR: Ramp = ['#22242c', '#40424c', '#6a6c76', '#9a9ca6', '#cfd0d8'];
/** His tunic: undyed wool. */
const I_TUNIC: Ramp = ['#221e18', '#3e3628', '#62573f', '#8a7e5e', '#b0a47e'];
/** His apron: sealskin, grey-brown, scorched. */
const I_APRON: Ramp = ['#141010', '#2a2220', '#463a34', '#64544a', '#827064'];
/** His trousers: brown wool; the strips bound round his legs a step lighter. */
const I_WOOL: Ramp = ['#140e0c', '#2a1e18', '#463226', '#644a36', '#7e6248'];
const I_BIND: Ramp = ['#1a1612', '#3a3026', '#5e5040', '#827058', '#a28e72'];
/** The old ink on his arms and on the seer's brow: a dark blue, never a glow. */
const INK_BLUE = '#1c2c56';
const I_IRON: Ramp = ['#18181f', '#32323c', '#565662', '#848490', '#b6b6c0'];
const I_WOOD: Ramp = ['#1a0c08', '#341a10', '#5a3018', '#84502a', '#aa7440'];

/** THE ISLE'S SMITH, sculpted in a pose (the armourer's: dev/townsfolk_moves.ts ARMOURER_MOVES); `turn`: truly turned. */
export function sculptIsleSmith(p: ArmourerPose, turn = 0): TownFigure {
  const B = ARMOURER_BUILD;
  const g = rigOf(B, p.bones, turn);
  const { sc, s, f, l, u, ribs, belly, pel, at, onHead, hf, hl, hu, R, dk } = g;
  const [rf, rl, ru] = ribs.r;

  // ---- SKIN: his face, his arms bare from the shoulder, banded with old ink ----
  const skin = sc.mat({
    ramp: I_SKIN,
    paint: (h) => {
      const tg = h.prim.tag ?? '';
      const d = dk(h.prim.piece);
      if (h.prim.piece === 'head') {
        const [fw, lf, up] = onHead(h.p);
        if (tg === 'nose' && h.tone >= 2) return sh(I_SKIN, h.tone + 1);
        if (tg === 'cheek' && fw > 0.4) return sh(I_SKIN, Math.max(2, h.tone));
        if (tg !== 'neck' && fw > 0.36 && up < 0.34 && up > -0.8) return sh(I_SKIN, Math.max(2, h.tone + 1) - (Math.abs(lf) > 0.66 ? 1 : 0));
        return null;
      }
      // (two bands of ink round each upper arm, and one round each forearm by the wrist)
      if (tg === 'upper') {
        const t = onCone(h.prim as Cone, h.p, u).t;
        if ((t > 0.42 && t < 0.52) || (t > 0.6 && t < 0.66)) return INK_BLUE;
      }
      if (tg === 'fore') {
        const t = onCone(h.prim as Cone, h.p, u).t;
        if (t > 0.72 && t < 0.8) return INK_BLUE;
        if ((h.x * 3 + h.y * 5) % 7 === 0) return sh(I_SKIN, h.tone - 1 - d);
      }
      return d ? sh(I_SKIN, h.tone - 1) : null;
    },
  });
  headIn(g, skin, { jaw: 1.08, brow: 1.1, nose: 1.2 });
  for (const side of ['L', 'R'] as const) {
    const { sh: shd, el, ha } = armOf(s, side);
    const piece = `arm${side}`;
    const out = mul(l, side === 'L' ? 1 : -1);
    const [, uo] = frameOf(shd, el, out, f);
    // (the round of his shoulder, the upper arm, the forearm thick as a smith's)
    sc.ell(skin, piece, add(shd, add(mul(u, -0.4), mul(uo, 0.8))), [mul(f, 3.4), mul(uo, 3.2), mul(u, 3.3)], 1.4, { tag: 'shoulder' });
    sc.cone(skin, piece, shd, el, 3.2, 2.8, 1.4, { tag: 'upper' });
    const wrist = lerp3(el, ha, 0.82);
    sc.cone(skin, piece, el, wrist, 2.9, 2.0, 1.2, { tag: 'fore' });
    const [fd, fo, fw] = frameOf(el, ha, out, f);
    sc.ell(skin, piece, add(lerp3(el, ha, 0.26), mul(fo, 0.6)), [mul(fd, 3.3), mul(fo, 2.8), mul(fw, 2.6)], 1.0, { tag: 'foreBulge' });
    fistOf(g, skin, side, 1.22);
  }

  // ---- THE TUNIC: undyed wool, sleeveless, to the top of his thighs; a belt of hide ----
  const tunic = sc.mat({
    ramp: I_TUNIC,
    paint: (h) => {
      const tg = h.prim.tag ?? '';
      // (its weave: a darker pixel in a loose diagonal now and then; its hem a tone darker)
      if (tg === 'hem') return sh(I_TUNIC, h.tone - 1);
      if ((h.x + h.y * 3) % 9 === 0) return sh(I_TUNIC, h.tone - 1);
      return dk(h.prim.piece) ? sh(I_TUNIC, h.tone - 1) : null;
    },
  });
  trunkIn(g, tunic, 0.9, { paunch: 2.2, yoke: 1.1, tag: 'tunic' });
  sc.ell(tunic, 'torso', add(pel.c, mul(pel.r[2], -1.8)), [mul(pel.r[0], pel.h[0] + 2.0), mul(pel.r[1], pel.h[1] + 1.9), mul(pel.r[2], pel.h[2] + 2.6)], 1.2, { tag: 'hem' });
  const waistC = add(belly.c, mul(belly.r[2], -belly.h[2] * 0.25));

  // ---- TROUSERS, BOUND IN STRIPS FROM KNEE TO ANKLE; BOOTS OF FUR ----
  const wool = sc.mat({ ramp: I_WOOL, paint: (h) => (dk(h.prim.piece) ? sh(I_WOOL, h.tone - 1) : null) });
  const bind = sc.mat({
    ramp: I_BIND,
    paint: (h) => {
      // (the strips wound round and round: a dark line between each turn, slanting)
      const t = onCone(h.prim as Cone, h.p, [1, 0, 0]);
      const k = Math.floor(t.t * 7 + t.around / Math.PI);
      if (((h.y + Math.floor(t.around * 2)) % 3) === 0) return sh(I_BIND, h.tone - 1 - dk(h.prim.piece));
      return k % 2 === 0 ? null : sh(I_BIND, h.tone - dk(h.prim.piece));
    },
  });
  for (const side of ['L', 'R'] as const) {
    const { hip, knee, ankle } = legOf(s, side);
    const [lH, lK, lA] = B.legR;
    const piece = `leg${side}`;
    sc.cone(wool, piece, add(hip, mul(s.hips[2], 0.8)), knee, lH * 1.08 + 0.5, lK * 1.05 + 0.5, 1.5, { tag: 'thigh' });
    sc.cone(bind, piece, knee, lerp3(knee, ankle, 0.7), lK * 1.02 + 0.7, lA + 1.0, 1.2, { tag: 'shin' });
  }
  const fur = sc.mat({
    ramp: I_FUR,
    meld: true,
    paint: (h) => {
      const tg = h.prim.tag ?? '';
      // (shaggy: its locks falling down the picture, a darker run every few pixels; its edge the palest)
      if (tg === 'sole') return sh(I_HAIR, 0);
      if (tg === 'edge') return (h.x * 5 + h.y) % 4 === 0 ? sh(I_FUR, h.tone) : sh(I_FUR, Math.max(2, h.tone + 1));
      if ((h.x + Math.floor(h.y / 2)) % 3 === 0) return sh(I_FUR, h.tone - 1 - dk(h.prim.piece));
      return dk(h.prim.piece) ? sh(I_FUR, h.tone - 1) : null;
    },
  });
  bootsOn(g, fur, 0.5, 1.12);

  // ---- THE APRON: sealskin, round his front and sides from the waist to the knee, open behind, tied at his back ----
  const kneeZ = Math.max(s.kneeL[2], s.kneeR[2]) - 1.2;
  const apron = sc.mat({
    ramp: I_APRON,
    crease: 0.2,
    paint: (h) => {
      const tg = h.prim.tag ?? '';
      if (tg === 'skirt') {
        if (h.p[2] < kneeZ + 1.3) return sh(I_APRON, h.tone + 1);
        // (scorch marks where the sparks have caught it; a seam down its middle)
        const v = sub(h.p, waistC);
        const across = dot(v, belly.r[1]);
        if (Math.abs(across) < 0.45) return sh(I_APRON, h.tone - 1);
        const k = (Math.floor(h.p[2] * 1.3) * 7 + Math.floor(across * 1.1) * 13) % 23;
        if (k === 0 || k === 9) return sh(I_APRON, h.tone - 1);
      }
      if (tg === 'bow') return sh(I_APRON, h.tone + 1);
      return null;
    },
  });
  {
    const frontOnly = keepBelow(mul(pel.r[0], -1), add(pel.c, mul(pel.r[0], -pel.h[0] * 0.55)));
    const top = keepBelow([0, 0, 1], add(waistC, [0, 0, 1.2]));
    const bot: Cut = { n: [0, 0, -1], o: -kneeZ };
    const mid = lerp3(waistC, lerp3(s.kneeL, s.kneeR, 0.5), 0.5);
    sc.ell(apron, 'apron', add(mid, mul(pel.r[0], 1.0)), [mul(pel.r[0], pel.h[0] + 4.6), mul(pel.r[1], pel.h[1] + 3.8), [0, 0, (waistC[2] - kneeZ) * 0.95]], 0.8, { tag: 'skirt', cuts: [frontOnly, top, bot] });
    const knot = add(waistC, mul(belly.r[0], -(belly.h[0] + 3.2)));
    for (const side of [1, -1]) {
      sc.ell(apron, 'apron', add(knot, add(mul(belly.r[1], side * 1.9), mul(belly.r[2], 0.5))), [mul(belly.r[0], 0.7), mul(belly.r[1], 1.6), mul(belly.r[2], 1.0)], 0.3, { tag: 'bow' });
      sc.cone(apron, 'apron', knot, add(knot, add(mul(belly.r[1], side * 1.2), add(mul(belly.r[2], -4.0), mul(belly.r[0], -0.4)))), 0.6, 0.45, 0.2, { tag: 'bow' });
    }
  }
  // the belt over the tunic, with a ring of iron for a buckle
  const belt = sc.mat({ ramp: I_APRON, paint: (h) => sh(I_APRON, h.tone + 1) });
  sc.ell(belt, 'belt', add(waistC, mul(belly.r[2], 0.6)), [mul(belly.r[0], belly.h[0] + 3.6), mul(belly.r[1], belly.h[1] + 2.2), mul(belly.r[2], 1.1)], 0.3, { tag: 'belt' });
  const iron = sc.mat({
    ramp: I_IRON,
    paint: (h) => {
      if (h.prim.tag !== 'head') return h.prim.tag === 'ring' ? sh(I_IRON, Math.max(2, h.tone)) : null;
      const b = onBall(h.prim as Ell, h.p);
      if (Math.abs(b[0]) > 0.8) return sh(I_IRON, h.tone + 1);
      if (Math.abs(b[0]) < 0.16) return sh(I_IRON, h.tone - 1);
      return null;
    },
  });
  sc.ell(iron, 'buckle', add(waistC, add(mul(belly.r[0], belly.h[0] + 3.7), mul(belly.r[2], 0.6))), [mul(belly.r[0], 0.5), mul(belly.r[1], 1.3), mul(belly.r[2], 1.4)], 0.2, { tag: 'ring' });

  // ---- THE MANTLE: a short cape of grey fur over his shoulders, high on his chest and down his back to his shoulder blades,
  // laid over him as his tunic is (so it hugs him); its edge the palest; a pin of bone at his throat ----
  {
    const P0 = add(ribs.c, mul(ru, ribs.h[2] * 0.12));
    const n = norm(add(mul(ru, -1), mul(rf, 0.62)));
    const slant: Cut = { n, o: dot(n, P0) };
    const mantle = sc.mat({
      ramp: I_FUR,
      meld: true,
      paint: (h) => {
        const edge = dot(sub(h.p, P0), n) > -1.1;
        if (edge) return (h.x * 5 + h.y) % 4 === 0 ? sh(I_FUR, h.tone) : sh(I_FUR, Math.max(3, h.tone + 1));
        if ((h.x + Math.floor(h.y / 2)) % 3 === 0) return sh(I_FUR, h.tone - 1);
        return null;
      },
    });
    trunkIn(g, mantle, 2.1, { paunch: 2.2, yoke: 1.2, tag: 'mantle', cuts: [slant], seat: false });
    void rl;
  }
  const bone = sc.mat({ ramp: E_BONE });
  sc.cone(bone, 'pin', add(s.neck, add(mul(f, ribs.h[0] * 0.8 + 3.6), add(mul(u, -3.4), mul(l, 2.2)))), add(s.neck, add(mul(f, ribs.h[0] * 0.8 + 3.8), add(mul(u, -5.2), mul(l, -2.0)))), 0.6, 0.45, 0.2, { tag: 'pin' });

  // ---- HIS HAIR AND BEARD: copper; his hair tied back in a tail; his beard in one thick braid ringed with iron, swinging ----
  const [bx, bz] = p.beard ?? [0, 0];
  const hair = sc.mat({
    ramp: I_HAIR,
    meld: true,
    paint: (h) => {
      const tg = h.prim.tag ?? '';
      const lit = Math.max(2, h.tone + 1);
      // (the braid: its plaits, a dark notch slanting each way in turn)
      if (tg === 'braid') {
        const t = onCone(h.prim as Cone, h.p, hl);
        const k = Math.floor(t.t * 5);
        return ((h.x + (k % 2 ? h.y : -h.y)) % 4 + 4) % 4 === 0 ? sh(I_HAIR, lit - 2) : sh(I_HAIR, lit - (k % 2));
      }
      if (tg === 'beard' || tg === 'tash') return (h.x + Math.floor(h.y / 3)) % 3 === 0 ? sh(I_HAIR, lit - 1) : sh(I_HAIR, lit);
      if (tg === 'brow') return sh(I_HAIR, Math.min(3, lit));
      // (his hair drawn back off his brow: lines running back over his skull)
      if (tg === 'scalp' || tg === 'tail') return (h.x * 2 + h.y) % 4 === 0 ? sh(I_HAIR, h.tone - 1) : sh(I_HAIR, Math.max(1, h.tone));
      return null;
    },
  });
  {
    const swing = add(mul(hl, bx), mul(hu, bz));
    // the hair on his skull, drawn back: over his crown, down behind, clear of his brow
    const back = keepBelow(hf, at(0.5, 0, 0));
    sc.ell(hair, 'head', at(-0.14, 0, 0.12), [mul(hf, R[0] * 0.92 + 0.5), mul(hl, R[1] * 0.98 + 0.5), mul(hu, R[2] * 0.86 + 0.5)], 0.5, { tag: 'scalp', cuts: [back, keepBelow(mul(hu, -1), at(0, 0, -0.1))] });
    // the tail at the back of his head, tied, down to his shoulders
    const t0 = at(-0.92, 0, 0.1);
    const t1 = add(at(-1.2, 0, -1.3), mul(swing, 0.3));
    sc.cone(hair, 'hairTail', t0, t1, 1.6, 1.1, 0.6, { tag: 'tail' });
    // the beard on his jaw and under his chin
    sc.ell(hair, 'head', at(0.42, 0, -0.78), [mul(hf, R[0] * 0.6), mul(hl, R[1] * 0.9), mul(hu, R[2] * 0.48)], 0.9, { tag: 'beard' });
    for (const side of [1, -1]) sc.cone(hair, 'head', at(-0.02, side * 0.86, -0.3), at(0.4, side * 0.66, -0.9), 1.5, 2.2, 0.8, { tag: 'beard' });
    // ONE THICK BRAID down his chest, two rings of iron on it
    const a = at(0.6, 0, -1.2);
    const b = add(at(0.7, 0, -2.2), mul(swing, 0.5));
    const c = add(at(0.66, 0, -3.3), swing);
    sc.cone(hair, 'braid', a, b, R[1] * 0.56, R[1] * 0.44, 0.8, { tag: 'braid' });
    sc.cone(hair, 'braid', b, c, R[1] * 0.44, R[1] * 0.22, 0.6, { tag: 'braid' });
    for (const k of [0.45, 0.8]) {
      const q = lerp3(b, c, k);
      sc.cone(iron, 'braidRing', add(q, mul(norm(sub(c, b)), 0.5)), add(q, mul(norm(sub(c, b)), -0.5)), R[1] * (0.44 - 0.22 * k) + 0.55, R[1] * (0.44 - 0.22 * k) + 0.55, 0.1, { tag: 'ring' });
    }
    // the moustache, heavy, down past the corners of his mouth into the beard
    sc.ell(hair, 'head', at(1.0, 0, -0.4), [mul(hf, 0.8), mul(hl, R[1] * 0.4), mul(hu, 0.8)], 0.4, { tag: 'tash' });
    for (const side of [1, -1]) sc.cone(hair, 'head', at(0.98, side * 0.28, -0.44), at(0.86, side * 0.56, -1.0), 0.9, 0.6, 0.3, { tag: 'tash' });
    for (const side of [1, -1]) sc.cone(hair, 'head', at(0.92, side * 0.12, 0.3), at(0.78, side * 0.72, 0.24), 0.66, 0.5, 0.3, { tag: 'brow' });
  }
  for (const side of [1, -1]) {
    sc.mark(at(0.82, side * 0.38, 0.08), sh(I_SKIN, 1), 2, 1, side > 0 ? 0 : -1);
    sc.mark(at(0.86, side * 0.36, 0.04), '#140a18');
  }

  // ---- THE HAMMER, in his right hand ----
  const wood = sc.mat({ ramp: I_WOOD });
  {
    const d = s.point;
    const ac = s.across;
    const third = norm(cross(d, ac));
    const ha = s.handR;
    sc.cone(wood, 'hammer', add(ha, mul(d, -3.4)), add(ha, mul(d, 12.5)), 0.75, 0.7, 0.2, { tag: 'handle' });
    sc.box(iron, 'hammer', add(ha, mul(d, 13.2)), [mul(ac, 4.6), mul(d, 2.3), mul(third, 2.3)], 0.5, 0.3, { tag: 'head' });
  }

  // ---- SPARKS, where the head comes down on the anvil (the town's armourer's, the same) ----
  const aloft: Aloft[] = [];
  const fly = p.sparks ?? 0;
  if (fly > 0) aloft.push(sparksOf(fly));
  void ru;
  void hu;
  void len;
  return { sc, s, B, aloft };
}

/** The sparks off the anvil as the blow lands, and their light (the town's armourer's, as they are). */
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
// THE SEER

const E_SKIN: Ramp = ['#2e1a1c', '#5a3432', '#8c5e4a', '#b88a6a', '#dcb490'];
/** His cloak and hood: dark hide. */
const E_HIDE: Ramp = ['#1a1612', '#342c22', '#54483a', '#786a56', '#9c8c74'];
/** His robe: the sea's deep green (a green, never the friend's cyan). */
const E_ROBE: Ramp = ['#081a16', '#0e2c24', '#184438', '#265e4c', '#3a7a62'];
/** Bone: the charms, the disc, the pin; and shells. */
const E_BONE: Ramp = ['#4a4438', '#7a7262', '#aea48e', '#d6ceb6', '#f2ecd8'];
/** His hair and beard: white, a little grey. */
const E_HAIR: Ramp = ['#3e3c44', '#6a6872', '#9a98a2', '#c8c6ce', '#eceaf0'];
/** The fur at the edge of his hood and his cuffs: pale, warm. */
const E_FUR: Ramp = ['#3c362c', '#625a4a', '#968a70', '#c6b896', '#ece2c4'];
/** The cord at his waist. */
const E_CORD: Ramp = ['#1e1610', '#3a2c1c', '#5e4a30', '#846c48', '#a68e62'];
/** The sea-stone: friendly magic, the friend's cyan (his rulebook, Colour 3), as the town's mystic's crystal. */
const E_STONE: Ramp = ['#0c6a80', '#18a0b4', '#22d0e0', '#b8fff8', '#ffffff'];

/** THE ISLE'S SEER, sculpted in a pose (the mystic's: dev/townsfolk_moves.ts MYSTIC_MOVES); `turn`: truly turned. */
export function sculptIsleSeer(p: MysticPose, turn = 0): TownFigure {
  const B = MYSTIC_BUILD;
  const g = rigOf(B, p.bones, turn);
  const { sc, s, f, l, u, ribs, belly, pel, at, onHead, hf, hl, hu, R, dk } = g;
  const [rf, rl, ru] = ribs.r;
  const [swx, swy] = p.sway ?? [0, 0];
  const hand = p.hand ?? 'R';

  // ---- SKIN: his face, his hands ----
  const skin = sc.mat({
    ramp: E_SKIN,
    paint: (h) => {
      const d = dk(h.prim.piece);
      if (h.prim.piece === 'head') {
        const [fw, lf, up] = onHead(h.p);
        if (h.prim.tag === 'nose' && h.tone >= 2) return sh(E_SKIN, h.tone + 1);
        if (h.prim.tag !== 'neck' && fw > 0.36 && up < 0.5 && up > -0.8) return sh(E_SKIN, Math.max(2, h.tone + 1) - (Math.abs(lf) > 0.68 ? 1 : 0));
        return null;
      }
      return d ? sh(E_SKIN, h.tone - 1) : null;
    },
  });
  headIn(g, skin, { jaw: 0.9, brow: 1.05, nose: 1.15, lean: 0.86 });

  // ---- THE ROBE: deep green, its skirts to the floor, narrow sleeves with cuffs of fur ----
  const waistC = add(belly.c, mul(belly.r[2], -belly.h[2] * 0.35));
  const robe = sc.mat({
    ramp: E_ROBE,
    paint: (h) => {
      const tg = h.prim.tag ?? '';
      const d = dk(h.prim.piece);
      if (tg === 'skirt') {
        // (a band of darker weave over the hem; long folds down the skirts)
        if (h.p[2] < 3.0) return sh(E_ROBE, h.tone - 1);
        const { around } = onCone(h.prim as Cone, h.p, s.hips[0]);
        if (Math.floor((around + Math.PI) * 2.9) % 3 === 0) return sh(E_ROBE, h.tone - 1);
        return null;
      }
      if (tg === 'sleeve' && (h.x * 2 + h.y) % 7 === 0) return sh(E_ROBE, h.tone - 1 - d);
      return d ? sh(E_ROBE, h.tone - 1) : null;
    },
  });
  trunkIn(g, robe, 1.0, { yoke: 0.95, tag: 'robe' });
  {
    const mid = lerp3(s.ankleL, s.ankleR, 0.5);
    const top = add(pel.c, mul(s.hips[2], 1.6));
    const foot: V3 = [mid[0] + s.hips[0][0] * swx + s.hips[1][0] * swy, mid[1] + s.hips[0][1] * swx + s.hips[1][1] * swy, 0.4];
    sc.cone(robe, 'skirt', top, foot, B.pelvisHalf + 0.6, B.stance + 5.6, 1.6, { tag: 'skirt', cuts: [{ n: [0, 0, -1], o: -0.5 }, keepBelow([0, 0, 1], add(waistC, [0, 0, -1.2]))] });
  }
  const efur = sc.mat({
    ramp: E_FUR,
    meld: true,
    paint: (h) => ((h.x + Math.floor(h.y / 2)) % 3 === 0 ? sh(E_FUR, h.tone - 1 - dk(h.prim.piece)) : sh(E_FUR, Math.max(2, h.tone) - dk(h.prim.piece))),
  });
  for (const side of ['L', 'R'] as const) {
    const { sh: shd, el, ha } = armOf(s, side);
    const piece = `arm${side}`;
    const out = mul(l, side === 'L' ? 1 : -1);
    const [, uo] = frameOf(shd, el, out, f);
    sc.ell(robe, piece, add(shd, add(mul(u, -0.3), mul(uo, 0.5))), [mul(f, 3.0), mul(uo, 2.7), mul(u, 2.8)], 1.6, { tag: 'sleeve' });
    sc.cone(robe, piece, shd, el, 2.7, 2.5, 1.4, { tag: 'sleeve' });
    const wrist = lerp3(el, ha, 0.8);
    sc.cone(robe, piece, el, wrist, 2.5, 2.3, 1.2, { tag: 'sleeve' });
    // (a cuff of pale fur at each wrist)
    sc.cone(efur, piece, lerp3(el, ha, 0.7), lerp3(el, ha, 0.86), 2.6, 2.5, 0.4, { tag: 'cuff' });
    sc.cone(skin, piece, lerp3(el, ha, 0.8), ha, 1.35, 1.25, 0.6, { tag: 'wrist' });
  }
  openHand(g, skin, hand, [0, 0, 1], 1.0);
  openHand(g, skin, hand === 'R' ? 'L' : 'R', [0, 0, -1], 1.0);

  // ---- THE CLOAK OF HIDE: from his shoulders down his back to the floor, open in front; THE HOOD up over his head, edged in
  // pale fur, his face looking out of it ----
  const hide = sc.mat({
    ramp: E_HIDE,
    crease: 0.24,
    paint: (h) => {
      const tg = h.prim.tag ?? '';
      if (tg === 'cloak') {
        // (its seams where the hides are stitched: a lighter stitch every other pixel down them; folds)
        if ((h.x + Math.floor(h.y / 5)) % 5 === 0) return sh(E_HIDE, h.tone - 1);
        if (h.x % 9 === 0 && h.y % 2 === 0) return sh(E_HIDE, h.tone + 1);
      }
      return dk(h.prim.piece) ? sh(E_HIDE, h.tone - 1) : null;
    },
  });
  {
    const top = add(s.neck, add(mul(u, -1.6), mul(f, -1.0)));
    const foot: V3 = [s.pelvis[0] - 1.6 + s.hips[0][0] * swx * 0.6 + s.hips[1][0] * swy, s.pelvis[1] + s.hips[0][1] * swx * 0.6 + s.hips[1][1] * swy, 0.6];
    const open = keepBelow(rf, add(ribs.c, mul(rf, ribs.h[0] * 0.15)));
    sc.cone(hide, 'cloak', top, foot, B.shoulderHalf + 2.0, B.pelvisHalf + 5.4, 1.6, { tag: 'cloak', cuts: [open, { n: [0, 0, -1], o: -0.6 }] });
    for (const side of [1, -1]) {
      const a = add(s.neck, add(mul(l, side * (B.shoulderHalf * 0.74)), add(mul(u, -1.4), mul(f, 1.4))));
      const b: V3 = [s.pelvis[0] + s.hips[0][0] * 1.5 + s.hips[1][0] * side * (B.pelvisHalf + 4.6), s.pelvis[1] + s.hips[0][1] * 1.5 + s.hips[1][1] * side * (B.pelvisHalf + 4.6), 1.2];
      sc.cone(hide, 'cloak', a, b, 2.0, 2.8, 1.2, { tag: 'cloak' });
    }
    // the hood, up: round his head, its peak falling back, its opening round his face
    sc.ell(hide, 'head', at(-0.14, 0, 0.16), [mul(hf, R[0] * 1.3), mul(hl, R[1] * 1.3), mul(hu, R[2] * 1.24)], 1.0, { tag: 'hood' });
    sc.cone(hide, 'head', at(-0.5, 0, 0.86), at(-1.3, 0, 0.3), R[1] * 0.7, 1.0, 1.2, { tag: 'hood' });
    sc.cone(hide, 'head', at(-0.4, 0, -0.5), add(s.neck, add(mul(f, -1.6), mul(u, -1.4))), 3.6, 4.4, 1.6, { tag: 'hood' });
    sc.ell(hide, 'head', at(1.1, 0, -0.18), [mul(hf, R[0] * 0.8), mul(hl, R[1] * 0.92), mul(hu, R[2] * 1.02)], 0.5, { carve: true });
    // the fur round its opening
    const ring = keepBelow(mul(hf, -1), at(0.5, 0, 0));
    sc.ell(efur, 'hoodFur', at(0.28, 0, -0.1), [mul(hf, R[0] * 0.9), mul(hl, R[1] * 1.22), mul(hu, R[2] * 1.18)], 0.4, { tag: 'fur', cuts: [ring, keepBelow(hf, at(0.78, 0, 0))] });
    sc.ell(hide, 'head', at(1.06, 0, -0.18), [mul(hf, R[0] * 0.66), mul(hl, R[1] * 0.86), mul(hu, R[2] * 0.96)], 0.3, { carve: true });
  }

  // ---- HIS BEARD, white, in two braids down his chest; his brows; ink across his brow ----
  const hair = sc.mat({
    ramp: E_HAIR,
    meld: true,
    paint: (h) => {
      const tg = h.prim.tag ?? '';
      const lit = Math.max(2, h.tone + 1);
      if (tg === 'braid') {
        const t = onCone(h.prim as Cone, h.p, hl);
        const k = Math.floor(t.t * 4);
        return ((h.x + (k % 2 ? h.y : -h.y)) % 3 + 3) % 3 === 0 ? sh(E_HAIR, lit - 2) : sh(E_HAIR, lit - (k % 2));
      }
      if (tg === 'beard' || tg === 'tash') return (h.x + Math.floor(h.y / 3)) % 3 === 0 ? sh(E_HAIR, lit - 1) : sh(E_HAIR, lit);
      if (tg === 'brow') return sh(E_HAIR, Math.min(4, lit + 1));
      return null;
    },
  });
  {
    const sway = add(mul(hl, swy * 0.3), mul(hf, swx * 0.2));
    sc.ell(hair, 'head', at(0.46, 0, -0.76), [mul(hf, R[0] * 0.56), mul(hl, R[1] * 0.82), mul(hu, R[2] * 0.42)], 0.8, { tag: 'beard' });
    for (const side of [1, -1]) {
      const a = at(0.66, side * 0.3, -1.1);
      const b = add(at(0.74, side * 0.34, -2.1), sway);
      const c = add(at(0.7, side * 0.3, -3.0), mul(sway, 1.6));
      sc.cone(hair, 'braid', a, b, 1.25, 1.0, 0.6, { tag: 'braid' });
      sc.cone(hair, 'braid', b, c, 1.0, 0.55, 0.5, { tag: 'braid' });
      sc.cone(hair, 'head', at(0.98, side * 0.26, -0.44), at(0.84, side * 0.5, -0.96), 0.8, 0.55, 0.3, { tag: 'tash' });
      sc.cone(hair, 'head', at(0.92, side * 0.12, 0.3), at(0.78, side * 0.7, 0.26), 0.7, 0.5, 0.3, { tag: 'brow' });
    }
    sc.ell(hair, 'head', at(1.0, 0, -0.4), [mul(hf, 0.7), mul(hl, R[1] * 0.36), mul(hu, 0.7)], 0.4, { tag: 'tash' });
  }
  for (const side of [1, -1]) {
    // his eyes: pale, deep under his brows (a seer's: they look through you)
    sc.mark(at(0.84, side * 0.38, 0.04), '#b4c0c4', 1, 1, 0, 0, 2.4);
    sc.mark(at(0.9, side * 0.4, 0.22), sh(E_SKIN, 0), 2, 1, side > 0 ? 0 : -1, 0, 2.4);
  }
  // (a line of dots of ink across his brow)
  for (const k of [-0.36, -0.12, 0.12, 0.36]) sc.mark(at(0.86, k, 0.44), INK_BLUE, 1, 1, 0, 0, 2.4);

  // ---- THE CORD at his waist, hung with charms of bone; shells round his neck; the disc of bone on his chest ----
  const cord = sc.mat({ ramp: E_CORD, paint: (h) => ((h.x + h.y) % 2 === 0 ? sh(E_CORD, h.tone + 1) : null) });
  sc.ell(cord, 'cord', waistC, [mul(belly.r[0], belly.h[0] + 3.0), mul(belly.r[1], belly.h[1] + 2.6), mul(belly.r[2], 0.9)], 0.3, { tag: 'cord' });
  const bone = sc.mat({ ramp: E_BONE, paint: (h) => (h.prim.tag === 'disc' && (onBall(h.prim as Ell, h.p)[1] ** 2 + onBall(h.prim as Ell, h.p)[2] ** 2) > 0.72 ? sh(E_BONE, h.tone - 1) : null) });
  for (const [ac, long] of [[-0.62, 5.5], [-0.2, 7.5], [0.28, 6.2], [0.7, 4.8]] as const) {
    // (each charm: a cord down, a bone or a tooth at its end, swinging with his robe)
    const a = add(waistC, add(mul(belly.r[0], (belly.h[0] + 3.1) * Math.cos(ac)), mul(belly.r[1], (belly.h[1] + 2.7) * Math.sin(ac))));
    const b = add(a, [s.hips[0][0] * swx * 0.6, s.hips[0][1] * swx * 0.6, -long]);
    sc.cone(cord, 'charm', a, lerp3(a, b, 0.6), 0.3, 0.3, 0.1, { tag: 'cord' });
    sc.cone(bone, 'charm', lerp3(a, b, 0.55), b, 0.75, 0.35, 0.2, { tag: 'charm' });
  }
  {
    // shells on a cord round his neck, and the disc below them
    for (let i = 0; i <= 6; i++) {
      const a = (i / 6 - 0.5) * 2.2;
      const q = add(ribs.c, add(mul(rf, ribs.h[0] + 1.2 - 0.6 * Math.abs(Math.sin(a))), add(mul(rl, ribs.h[1] * 0.7 * Math.sin(a)), mul(ru, ribs.h[2] * 0.92 - 3.0 * Math.cos(a)))));
      sc.mark(q, i % 2 ? E_BONE[3] : E_BONE[2], 1, 1, 0, 0, 2.6);
    }
    const dc = add(ribs.c, add(mul(rf, ribs.h[0] + 1.5), mul(ru, ribs.h[2] * 0.92 - 5.6)));
    sc.ell(bone, 'disc', dc, [mul(rf, 0.5), mul(rl, 2.3), mul(ru, 2.3)], 0.2, { tag: 'disc' });
    // (its rune: carved, dark)
    for (const [dl, du] of [[0, 1], [0, 0], [0, -1], [-1, 0.6], [1, 0.6], [-1, -1], [1, -1]] as const) sc.mark(add(dc, add(mul(rf, 0.7), add(mul(rl, dl * 0.9), mul(ru, du * 0.9)))), E_BONE[0], 1, 1, 0, 0, 2.6);
  }

  // ---- boots of fur under the hem ----
  for (const side of ['L', 'R'] as const) {
    const { heel, toe } = legOf(s, side);
    const fd = norm(sub(toe, heel));
    const fs = norm(cross([0, 0, 1], fd), [0, 1, 0]);
    sc.box(efur, `leg${side}`, add(lerp3(heel, toe, 0.6), [0, 0, 1.1]), [mul(fd, len(sub(toe, heel)) * 0.44), mul(fs, 1.6), [0, 0, 1.1]], 0.9, 0.8, { tag: 'shoe', cuts: [FLOOR_CUT] });
  }

  // ---- THE SEA-STONE over his open palm: round and smooth, its rune the friend's cyan; turning, lifting, blazing ----
  const flare = p.flare ?? 0;
  const turnC = (p.spin ?? 0) * Math.PI * 2;
  const cc = crystalAt(s, p);
  const big = 1 + flare * 0.35;
  const stone = sc.mat({
    ramp: E_STONE,
    crease: 0,
    paint: (h) => {
      // (its face: pale grey-green stone, and the rune in it lit; as it turns, the rune goes round with it)
      const b = onBall(h.prim as Ell, h.p);
      const ra = Math.atan2(b[1], b[0]) + turnC;
      const fx = Math.cos(ra) * Math.hypot(b[0], b[1]);
      const fz = b[2];
      const onRune = Math.abs(fx) < 0.18 && Math.abs(fz) < 0.62 && Math.hypot(b[0], b[1]) > 0.5 && Math.cos(ra) > -2;
      const cross2 = Math.abs(fz - 0.2) < 0.14 && Math.abs(fx) < 0.5;
      if ((onRune || cross2) && Math.sin(ra) > -0.2) return sh(E_STONE, 2 + (flare > 0.5 ? 2 : 1));
      const grey = ['#2a3a3a', '#46605c', '#6c8a84', '#9ab4ac', '#c8dcd4'];
      return grey[Math.max(0, Math.min(4, h.tone + (flare > 0.5 ? 1 : 0)))];
    },
  });
  sc.ell(stone, 'crystal', add(cc, [0, 0, 0.6]), [[2.6 * big, 0, 0], [0, 2.6 * big, 0], [0, 0, 3.0 * big]], 0.1, { tag: 'stone' });
  const aloft: Aloft[] = [{
    stands: cc,
    paint: (st, where) => {
      const [x0, y0] = where(cc);
      const n = flare > 0.2 ? 7 : 4;
      for (let j = 0; j < n; j++) {
        const a = turnC * (1 + (j % 2)) + (j * Math.PI * 2) / n;
        const far = 7 + flare * 6 + (j % 3);
        st.over.set(Math.round(x0 + Math.cos(a) * far * 1.15), Math.round(y0 + Math.sin(a) * far * 0.6 - (j % 2)), j % 2 === 0 ? E_STONE[3] : E_STONE[2]);
      }
      if (flare > 0.35) {
        const k = (flare - 0.35) / 0.65;
        for (let r = 0; r < 8; r++) {
          const a = (r / 8) * Math.PI * 2 + turnC * 0.25;
          const from = 5 + 2 * k;
          const to = from + (r % 2 === 0 ? 11 : 5) * k;
          for (let dd = from; dd <= to; dd++) st.over.set(Math.round(x0 + Math.cos(a) * dd * 1.1), Math.round(y0 + Math.sin(a) * dd * 0.9), dd > to - 2 ? E_STONE[2] : dd > to - 5 ? E_STONE[3] : '#ffffff');
        }
      }
    },
    lights: (where) => {
      const [x, y] = where(cc);
      return [{ x, y, r: 13 + flare * 16, color: E_STONE[2], a: 0.32 + flare * 0.36 }];
    },
  }];
  void ru;
  void rl;
  return { sc, s, B, aloft };
}

// ---------------------------------------------------------------------------------------------------------------------------
// THE STRANGER

/** His long coat: oiled sailcloth, grey-green. */
const T_COAT: Ramp = ['#0a0e0c', '#161e1a', '#26322c', '#3a4a42', '#52645a'];
/** His jumper: thick knitted wool, a dark sea blue. */
const T_KNIT: Ramp = ['#0a0c18', '#141a2e', '#222c48', '#344066', '#4c5a86'];
/** His sea boots: black. */
const T_BOOT: Ramp = ['#08080a', '#141418', '#222228', '#34343c', '#4a4a54'];
/** His hat: tarred cloth, a dark olive. */
const T_HAT: Ramp = ['#0a0a08', '#16150f', '#262418', '#3a3624', '#504a32'];
/** His breeches: a dark brown canvas. */
const T_CANVAS: Ramp = ['#100c0a', '#201a14', '#342a20', '#4a3e30', '#625442'];
const T_SKIN: Ramp = ['#2a1a26', '#523036', '#845848', '#b08464', '#d8b08c'];
/** The coin: gold (treasure, a coin, never a glow of the enemy's). */
const T_GOLD: Ramp = ['#4a2e0c', '#7a5210', '#d09a20', '#ffd866', '#fff3b0'];
/** His eyes under the brim: two pale points. */
const T_EYE = '#c8e4ec';

/** THE ISLE'S STRANGER, sculpted in a pose (the stranger's: dev/townsfolk_moves.ts STRANGER_MOVES); he never leaves his stone. */
export function sculptIsleStranger(p: StrangerPose, turn = 0): TownFigure {
  const B = STRANGER_BUILD;
  const g = rigOf(B, p.bones, turn);
  const { sc, s, f, l, u, ribs, belly, pel, at, onHead, hf, hl, hu, R, dk } = g;
  const [rf, rl, ru] = ribs.r;
  const wall: Cut = { n: [-1, 0, 0], o: WALL };

  const skin = sc.mat({
    ramp: T_SKIN,
    paint: (h) => {
      if (h.prim.piece === 'head') {
        // (his face in the shadow of the brim: dark)
        return sh(T_SKIN, Math.min(1, h.tone));
      }
      return dk(h.prim.piece) ? sh(T_SKIN, h.tone - 1) : null;
    },
  });
  headIn(g, skin, { jaw: 1.0, brow: 1.0, nose: 1.1, lean: 0.92 });

  // ---- THE JUMPER: thick knit, its ribs running down it, a roll of a collar at his throat ----
  const knit = sc.mat({
    ramp: T_KNIT,
    paint: (h) => {
      const tg = h.prim.tag ?? '';
      const d = dk(h.prim.piece);
      // (cables: a lighter run every few pixels, broken across by the stitches)
      if (tg === 'jumper' || tg === 'sleeve') {
        if (h.x % 3 === 0 && h.y % 2 === 0) return sh(T_KNIT, h.tone - 1 - d);
      }
      if (tg === 'roll') return (h.y % 2 === 0 ? sh(T_KNIT, h.tone + 1) : null);
      return d ? sh(T_KNIT, h.tone - 1) : null;
    },
  });
  trunkIn(g, knit, 1.0, { tag: 'jumper', cuts: [wall] });
  sc.cone(knit, 'torso', add(s.neck, add(mul(u, -0.8), mul(f, -0.2))), add(s.neck, add(mul(u, 1.2), mul(f, 0.1))), 3.3, 3.0, 0.6, { tag: 'roll', cuts: [wall] });
  const canvas = sc.mat({ ramp: T_CANVAS, paint: (h) => (dk(h.prim.piece) ? sh(T_CANVAS, h.tone - 1) : null) });
  for (const side of ['L', 'R'] as const) {
    const { sh: shd, el, ha } = armOf(s, side);
    const piece = `arm${side}`;
    const out = mul(l, side === 'L' ? 1 : -1);
    const [, uo] = frameOf(shd, el, out, f);
    sc.ell(knit, piece, add(shd, add(mul(u, -0.3), mul(uo, 0.5))), [mul(f, 3.0), mul(uo, 2.8), mul(u, 2.8)], 1.6, { tag: 'sleeve', cuts: [wall] });
    sc.cone(knit, piece, shd, el, 2.7, 2.4, 1.4, { tag: 'sleeve', cuts: [wall] });
    sc.cone(knit, piece, el, lerp3(el, ha, 0.86), 2.4, 2.0, 1.2, { tag: 'sleeve' });
    fistOf(g, skin, side, 0.98);
  }
  for (const side of ['L', 'R'] as const) {
    const { hip, knee, ankle } = legOf(s, side);
    const [lH, lK, lA] = B.legR;
    const piece = `leg${side}`;
    sc.cone(canvas, piece, add(hip, mul(s.hips[2], 0.8)), knee, lH * 1.05 + 0.4, lK * 1.04 + 0.4, 1.5, { tag: 'thigh', cuts: [wall] });
    sc.cone(canvas, piece, knee, lerp3(knee, ankle, 0.6), lK * 1.02 + 0.4, lA + 0.9, 1.2, { tag: 'shin', cuts: [wall] });
  }
  // ---- SEA BOOTS: black, tall, to the knee, their tops turned down ----
  const boot = sc.mat({
    ramp: T_BOOT,
    paint: (h) => {
      const tg = h.prim.tag ?? '';
      if (tg === 'sole') return sh(T_BOOT, h.tone - 2);
      if (tg === 'cuff') return sh(T_BOOT, h.tone + 1);
      // (a shine down the shin of each, as such boots have)
      if (tg === 'boot' && h.tone >= 3) return sh(T_BOOT, 4);
      return dk(h.prim.piece) ? sh(T_BOOT, h.tone - 1) : null;
    },
  });
  bootsOnWall(g, boot, 0.82);

  // ---- THE COAT: oiled sailcloth, from his shoulders down his back and sides to his shins, open in front; flat against the
  // stone behind him; its collar turned up to his jaw ----
  const hemZ = 10.5;
  const coat = sc.mat({
    ramp: T_COAT,
    crease: 0.24,
    paint: (h) => {
      const tg = h.prim.tag ?? '';
      if (tg === 'coat') {
        // (stiff with oil: long straight folds, and a dull shine on them where the light is)
        if (h.p[2] < hemZ + 1.0) return sh(T_COAT, h.tone + 1);
        if ((h.x + Math.floor(h.y / 7)) % 5 === 0) return sh(T_COAT, h.tone - 1);
        if (h.tone >= 3 && (h.x + h.y) % 3 === 0) return sh(T_COAT, 4);
      }
      if (tg === 'collar') return h.tone >= 2 ? sh(T_COAT, h.tone) : null;
      return dk(h.prim.piece) ? sh(T_COAT, h.tone - 1) : null;
    },
  });
  {
    const top = add(s.neck, add(mul(u, -1.6), mul(f, -1.0)));
    const foot: V3 = [s.pelvis[0] - 1.0 + s.hips[1][0] * (p.sway ?? 0), s.pelvis[1] + s.hips[1][1] * (p.sway ?? 0), hemZ];
    const open = keepBelow([1, 0, 0], add(s.pelvis, [-1.5, 0, 0]));
    const hem: Cut = { n: [0, 0, -1], o: -hemZ };
    sc.cone(coat, 'coat', top, foot, B.shoulderHalf + 2.2, B.pelvisHalf + 4.6, 1.6, { tag: 'coat', cuts: [open, wall, hem] });
    for (const side of [1, -1]) {
      const a = add(s.neck, add(mul(l, side * (B.shoulderHalf * 0.74)), add(mul(u, -1.4), mul(f, 1.6))));
      const b: V3 = [s.pelvis[0] - 2.4 + s.hips[1][0] * (side * (B.pelvisHalf + 3.4) + (p.sway ?? 0)), s.pelvis[1] + s.hips[1][1] * (side * (B.pelvisHalf + 3.4) + (p.sway ?? 0)), hemZ + 1.0];
      sc.cone(coat, 'coat', a, b, 2.0, 2.3, 1.2, { tag: 'coat', cuts: [wall, hem] });
    }
    // the collar, turned up round his neck to his jaw, open at the front
    const front = keepBelow(f, add(s.neck, mul(f, 1.2)));
    sc.cone(coat, 'collar', add(s.neck, mul(u, -1.6)), add(s.neck, add(mul(u, 2.6), mul(f, -0.6))), 4.4, 4.2, 0.6, { tag: 'collar', cuts: [front, wall] });
  }
  // ---- THE HAT: a broad brim of tarred cloth, pulled down over his eyes; its crown low and round ----
  const hat = sc.mat({
    ramp: T_HAT,
    paint: (h) => {
      const tg = h.prim.tag ?? '';
      if (tg === 'brim') {
        const b = onBall(h.prim as Ell, h.p);
        // (its edge rolled, a tone lighter; its underside dark)
        if (h.n[2] < -0.2) return T_HAT[0];
        if (Math.hypot(b[0], b[1]) > 0.86) return sh(T_HAT, h.tone + 1);
      }
      if (tg === 'band') return sh(T_HAT, h.tone - 1);
      return null;
    },
  });
  {
    // (tipped down at the front, as a hat pulled low is)
    const tip = 0.12;
    const hfw = norm(add(hf, mul(hu, -tip)));
    const huw = norm(add(hu, mul(hf, tip)));
    sc.ell(hat, 'hat', at(-0.08, 0, 0.86), [mul(hfw, R[0] * 0.96), mul(hl, R[1] * 0.98), mul(huw, R[2] * 0.8)], 0.6, { tag: 'crown' });
    sc.ell(hat, 'hat', at(-0.04, 0, 0.62), [mul(hfw, R[0] * 1.04), mul(hl, R[1] * 1.06), mul(huw, 0.9)], 0.2, { tag: 'band' });
    sc.ell(hat, 'hatBrim', at(0.06, 0, 0.46), [mul(hfw, R[0] * 1.72), mul(hl, R[1] * 1.8), mul(huw, 0.5)], 0.3, { tag: 'brim', cuts: [wall] });
    void onHead;
  }
  // HIS EYES: two pale points in the shadow under the brim; they go from side to side, or stay on whoever has come up
  {
    const look = Math.round(p.look ?? 0);
    for (const side of [1, -1]) sc.mark(at(0.86, side * 0.36, 0.06), T_EYE, 1, 1, look, 0, 5.5);
    // (a grey stubble on his jaw)
    for (const [k, z] of [[-0.3, -0.62], [0, -0.7], [0.3, -0.62], [-0.15, -0.8], [0.15, -0.8]] as const) sc.mark(at(0.9, k, z), '#5c5a62', 1, 1, 0, 0, 2.4);
  }
  // THE COIN, when it is in the air (the town's stranger's, the same)
  const gold = sc.mat({ ramp: T_GOLD });
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
        for (const [dx, dy] of [[0, 0], [3, 0], [-3, 0], [0, 3], [0, -3], [4, 0], [-4, 0]] as const) st.over.set(Math.round(x) + dx, Math.round(y) + dy, dx === 0 && dy === 0 ? '#ffffff' : T_GOLD[4]);
      },
      lights: (where) => {
        const [x, y] = where(c);
        return [{ x, y, r: 8, color: T_GOLD[3], a: 0.4 }];
      },
    });
  }
  void ribs;
  void belly;
  void pel;
  void rf;
  void rl;
  void ru;
  void hu;
  return { sc, s, B, aloft };
}

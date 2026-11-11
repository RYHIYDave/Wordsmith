// NEW DEMONS FOR THE WARLOCK'S CHANGE, TO CHOOSE FROM (the Warlock chat, 11 Nov 2026). A MOCK-UP; NOTHING OF THE GAME IMPORTS IT.
//
// His words, 11 Nov 2026, asked how far to go with the Warlock: “I need the demon redone.  I like okay but I think it can be
// much better”. Asked what should be much better, his picks, all four: “His body is a dark lump (Recommended),His head and
// face,His wings,Not scary enough”. Asked how far the new demon can go from the one in the game: “A new design, same moves”.
// And at 15:16: “New designs, not older designs that I’ve already passed over”.
//
// SO: each demon here is a new creature, none of the ten of 26 Oct nor of the redo he turned down (the brute with wings, the
// wraith, the serpent, the burning bones; the bare-bone, brute's and bat's faces), and none of them the demon in the game. Each
// stands ON THE GAME'S OWN DEMON'S BONES (dev/sculpt_demon_rig.ts DEMON_B) IN ITS OWN POSES (dev/demon_moves.ts), so every
// move he passed (its stand on all fours, its run, the rakes, Damning, the smoke step, the change, the burning out) fits the
// one he picks: only what is sculpted on the bones is new. What he asked of the demon before is kept on every one: on all
// fours, a gorilla's long arms, its claws flat on the floor burning with the friend's cyan fire.
//
// HOW THEY ARE DRAWN, against what was wrong: a few big forms a body, not dozens of small lumps (the game's demon is some 150
// solids, its body a tangle of them); each stuff its own colour and three clear tones, light enough to read on a dark floor;
// the far limbs a tone darker than the near; a head a size bigger, its face made of a few bold marks that read at the game's
// size; no wings.

import type { Ramp } from '../art/kit';
import { CYAN } from '../art/kit';
import { FRIEND_RIM } from '../art/hero3_knight';
import type { GameView, PaintView } from '../art/skin';
import { add, cross, lerp3, mul, norm, solve, sub } from '../art/skeleton';
import type { Bones, Posed, Rot, Skeleton, V3 } from '../art/skeleton';
import { Sculpt, draw, onCone } from './sculpt';
import type { Cone, Drawn, Hit } from './sculpt';
import { IVORY } from './sculpt_warlock';
import { demonHand, tone5 } from './sculpt_demon';
import { DEMON_B, RIG_CANVAS, demonAura, fireBehind } from './sculpt_demon_rig';

export type NewDemon = 'pact' | 'pale' | 'mane';
export const NEW_DEMONS: { id: NewDemon; name: string; says: string }[] = [
  { id: 'pact', name: 'A. The Pact Made Flesh', says: 'his demon arm grown over all of him: old-blood hide, black horn armour down its back, great crescent horns' },
  { id: 'pale', name: 'B. The Pale Crawler', says: 'gaunt and bone-white, no eyes, a mouth from ear to ear, a crown of black thorns, its arms dipped in soot' },
  { id: 'mane', name: 'C. The Burning Mane', says: 'a dusk-violet beast with four eyes and sabre fangs, a mane of his cyan hellfire down its neck and back' },
];

const U: V3 = [0, 0, 1];
const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
/** A point from `o`, so far along each line of a bone's own (forward, left, up). */
const from = (o: V3, r: Rot, f: number, l: number, u: number): V3 => add(o, add(mul(r[0], f), add(mul(r[1], l), mul(r[2], u))));
/** A solid's three half-lengths along a bone's own lines. */
const axes = (r: Rot, f: number, l: number, u: number): readonly [V3, V3, V3] => [mul(r[0], f), mul(r[1], l), mul(r[2], u)];
const WORLD: Rot = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
/** A bone's lines, its forward lifted `deg` toward its up (a face lifted to glare up from under its brow, so it is seen from above). */
const lifted = (r: Rot, deg: number): Rot => {
  const a = (deg * Math.PI) / 180;
  return [add(mul(r[0], Math.cos(a)), mul(r[2], Math.sin(a))), r[1], add(mul(r[2], Math.cos(a)), mul(r[0], -Math.sin(a)))];
};

// ---- their colours (every glow the friend's cyan; nothing the enemy's pink or gold)
/** A: the hide of his demon arm (dev/sculpt_warlock.ts DEMON_RED), a little duller and darker, as old blood. */
const BLOOD: Ramp = ['#14060c', '#30101a', '#541c26', '#7c3034', '#a4524a'];
/** A: horn grown as armour, black with a cold light on it. */
const HORN_BLACK: Ramp = ['#0a0812', '#1a1624', '#322c44', '#5c5478', '#9088ac'];
/** B: skin like old bone, cold. */
const BONE_SKIN: Ramp = ['#2c2440', '#5c5270', '#9890a8', '#ccc6d8', '#f0ecf6'];
/** B: its arms and shanks as if dipped in soot; its thorns. */
const SOOT: Ramp = ['#08070e', '#15131e', '#2a2636', '#4a4460', '#746c8c'];
/** C: its hide, a dusk violet (his coat's colour, in flesh). */
const DUSK: Ramp = ['#140e26', '#2c2048', '#4c3a74', '#7660a2', '#a690cc'];
/** C: its stripes and its muzzle. */
const DUSK_DARK: Ramp = ['#0a0816', '#18122a', '#2a2046', '#443664', '#62528a'];
const MOUTH: Ramp = ['#120206', '#2a0610', '#3e0a16', '#5a1220', '#7a1c2a'];

/** What a new demon's sculpture needs drawn with it: where its fires burn. */
interface Built {
  /** Fires on the floor under its claws (each claw's five, the left's first). */
  floor: V3[];
  /** Other fires on it (a mane's), each `size` big. */
  flames: { p: V3; size: number; deep?: number }[];
  /** Where its smoke rises from. */
  smoke: V3[];
  jaw: V3;
}

interface Kit {
  sc: Sculpt;
  s: Skeleton;
  /** Is this piece on its far side from the eye. */
  far: (piece: string) => boolean;
  /** Its tail swung to its left (radians). */
  tail: number;
}

/** A material whose far limbs are a tone darker (as the heroes' far limbs are), with a painter of its own after that. */
function fleshOf(k: Kit, ramp: Ramp, paint?: (h: Hit) => string | null, crease = 0.7): number {
  return k.sc.mat({
    ramp,
    crease,
    paint: (h) => {
      const own = paint?.(h);
      if (own) return own;
      return k.far(h.prim.piece) ? tone5(ramp, h.tone - 1) : null;
    },
  });
}

/** An eye of the friend's cyan burning in its socket: a slanted lens, a white-hot core. */
function eye(k: Kit, glow: number, c: V3, r: Rot, side: number, long: number, tall: number, slant: number): void {
  const out = norm(add(mul(r[1], side), mul(r[2], slant)));
  const up = norm(add(mul(r[2], 1), mul(r[1], -side * slant)));
  k.sc.ell(glow, 'head', c, [mul(r[0], 1.0), mul(out, long), mul(up, tall)], 0.05, { tag: 'eye' });
  k.sc.mark(add(c, mul(r[0], 1.0)), '#ffffff', 1, 1, 0, 0, 2.5);
}

/** A horn or a spike along `pts`, `r0` thick at its root, drawn to a point. */
function spike(k: Kit, mat0: number, piece: string, pts: V3[], r0: number, tag = 'horn', r1 = 0.15, mat = mat0): void {
  const n = pts.length - 1;
  for (let i = 0; i < n; i++) {
    const a = r0 + (r1 - r0) * Math.pow(i / n, 0.8);
    const b = r0 + (r1 - r0) * Math.pow((i + 1) / n, 0.8);
    k.sc.cone(mat, piece, pts[i], pts[i + 1], a, b, 0.25, { tag });
  }
}

/** Its two claws flat on the floor (dev/sculpt_demon.ts demonHand: a hand built as a hand, his word of 24 Oct), and their fires. */
function claws(k: Kit, hide: number, talon: number, scale: number, out: Built): void {
  const { s, sc } = k;
  const fh = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
  for (const side of [1, -1] as const) {
    const piece = side > 0 ? 'armL' : 'armR';
    const ha = side > 0 ? s.handL : s.handR;
    const el = side > 0 ? s.elbowL : s.elbowR;
    const planted = ha[2] < 14;
    const up = planted ? Math.max(0, ha[2] - 7) : 0;
    demonHand(sc, hide, talon, piece, ha, el, false, scale, planted ? fh : undefined, planted && side < 0, up);
    if (!planted) continue;
    const S = 1.45 * scale;
    const acr = norm(cross(U, fh));
    const thumbW = side < 0 ? acr : mul(acr, -1);
    const fan = (deg: number): V3 => norm(add(mul(fh, Math.cos((deg * Math.PI) / 180)), mul(thumbW, Math.sin((deg * Math.PI) / 180))));
    const palmC = add(ha, mul(fh, 1.5 * S));
    for (const g of [48, 22.5, -0.5, -23.5, -48]) out.floor.push(add(palmC, add(mul(fan(g), 6.0 * S), [0, 0, 2.2 + up - palmC[2]])));
  }
}

/** A tail from its rump: `long` in all, `r0` thick at its root, hung in a curve and swung by `k.tail`; returns its points. */
function tailOf(k: Kit, long: number, n: number, droop: number, curl: number): V3[] {
  const { s } = k;
  const root = from(s.pelvis, s.hips, -8, 0, 2);
  const pts: V3[] = [root];
  let dir: V3 = norm([-1, 0, -0.15]);
  let p = root;
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    // (down to the floor, then along it and up at its end; swung to its left more the further along it)
    const a = k.tail * (0.5 + t * 1.6);
    const flat: V3 = [-Math.cos(a), Math.sin(a), 0];
    dir = norm([flat[0], flat[1], -droop * (1 - t * 2.2) + curl * Math.max(0, t - 0.55) * 3]);
    p = add(p, mul(dir, long / n));
    if (p[2] < 3) p = [p[0], p[1], 3];
    pts.push(p);
  }
  return pts;
}

// ============================================================================================================
// A. THE PACT MADE FLESH: his demon arm grown over all of him. Old-blood hide in great slabs; black horn grown over its
// shoulders and down its back as armour, each plate drawn out into a hooked blade; two great crescent horns (his hood's two
// little horns, grown); a short broad muzzle under a brow of black horn, a grin of ivory with his fire behind it; the pact's
// cracks of cyan light over its heart and down both arms.
function pactInto(k: Kit): Built {
  const { sc, s } = k;
  const out: Built = { floor: [], flames: [], smoke: [], jaw: s.head };
  const cracksOn = new Set(['fore', 'upper', 'chest']);
  const hide = fleshOf(k, BLOOD, (h) => {
    const p = h.prim;
    if (!p.tag || !cracksOn.has(p.tag)) return null;
    if (p.k === 'cone') {
      const { t, around } = onCone(p as Cone, h.p, U);
      const zig = Math.sin(t * 17 + around * 1.3) * 0.3;
      if (Math.abs(around - 0.5 - zig) < 0.1) return h.tone >= 2 ? CYAN[3] : CYAN[2];
    } else {
      const v = sub(h.p, from(s.ribs, s.chest, 13, 0, 12));
      const down = -dot(v, s.chest[2]);
      const across = dot(v, s.chest[1]);
      if (down > -2 && down < 15 && Math.abs(across - Math.sin(down * 0.6) * 2.2 + down * 0.2) < 0.7) return h.tone >= 2 ? CYAN[3] : CYAN[2];
    }
    return null;
  });
  const horn = fleshOf(k, HORN_BLACK, undefined, 0.5);
  const ivory = sc.mat({
    ramp: IVORY,
    paint: (h) => {
      if (h.prim.k !== 'cone' || h.prim.tag !== 'horn') return null;
      const { t } = onCone(h.prim as Cone, h.p, s.face[2]);
      return Math.floor(t * 2.6) % 2 === 0 ? tone5(IVORY, h.tone - 1) : null;
    },
  });
  const glow = sc.mat({ ramp: CYAN, paint: (h) => (h.tone >= 2 ? '#e8ffff' : CYAN[2]) });
  const mouth = sc.mat({ ramp: MOUTH });

  // ---- its trunk: a great chest, a hump of shoulder over it, a hard belly drawn up under it, narrow hips
  sc.ell(hide, 'torso', from(s.pelvis, s.hips, -1, 0, 2), axes(s.hips, 10, 12, 9), 3, { tag: 'pelvis' });
  sc.ell(hide, 'torso', lerp3(s.waist, s.ribs, 0.4), axes(s.belly, 10.5, 12.5, 9), 3, { tag: 'belly' });
  sc.ell(hide, 'torso', from(lerp3(s.ribs, s.back, 0.55), s.chest, 2.5, 0, 0), axes(s.chest, 15.5, 19, 14), 3.5, { tag: 'ribs' });
  for (const side of [1, -1]) {
    // (its breast: two slabs, a groove between them)
    sc.ell(hide, 'torso', from(s.ribs, s.chest, 14, side * 8.6, 9.5), axes(s.chest, 5.2, 9.4, 8), 1.2, { tag: 'chest' });
    // (the shoulder, a boulder, run into its arm)
    const sh = side > 0 ? s.shoulderL : s.shoulderR;
    sc.ell(hide, side > 0 ? 'armL' : 'armR', add(sh, [0, side * 1.5, 1]), axes(WORLD, 10, 9.5, 10), 2.4, { tag: 'delt' });
  }
  // (the groove down between its breasts, and under them)
  sc.ell(hide, 'torso', from(s.ribs, s.chest, 19, 0, 9), axes(s.chest, 2.2, 1.1, 8), 0.3, { carve: true });
  // (the hump: one mass over both shoulders, under its armour)
  const humpC = add(lerp3(s.shoulderL, s.shoulderR, 0.5), [-5, 0, 8]);
  sc.ell(hide, 'torso', humpC, axes(WORLD, 14, 19, 9.5), 3, { tag: 'hump' });

  // ---- black horn grown as armour: four plates lapped down its back from its neck to its rump, each drawn out to a hooked blade
  const spineAt = (t: number): V3 => {
    // (along the top of its back: from over its shoulders down to its rump)
    const a = add(humpC, [6, 0, 8.5]);
    const b = add(humpC, [-10, 0, 7]);
    const c = from(s.waist, s.belly, -11, 0, 4);
    const d = from(s.pelvis, s.hips, -10.5, 0, 3);
    return t < 1 ? lerp3(a, b, t) : t < 2 ? lerp3(b, c, t - 1) : lerp3(c, d, t - 2);
  };
  for (let i = 0; i < 4; i++) {
    const t = i * 0.72;
    const c = spineAt(t);
    const back = norm(sub(spineAt(t + 0.5), spineAt(t - 0.1)));
    const upw = norm(cross(back, [0, 1, 0]));
    const w = 15 - i * 2.6;
    sc.ell(horn, `plate${i}`, add(c, mul(upw, -1.5)), [mul(back, 6.2 - i * 0.5), [0, w, 0], mul(upw, 3.6)], 0.4, { tag: 'plate' });
    // its blade: up and back, hooked
    const root = add(c, mul(upw, 1.5));
    const L = 13 - i * 2.2;
    spike(k, horn, `plate${i}`, [root, add(root, add(mul(upw, L * 0.55), mul(back, L * 0.25))), add(root, add(mul(upw, L * 0.9), mul(back, L * 0.75))), add(root, add(mul(upw, L * 0.95), mul(back, L * 1.25)))], 3.4 - i * 0.45, 'blade', 0.15, ivory);
  }
  // (and a plate over each shoulder, a spike out of it: his pauldron's, grown)
  for (const side of [1, -1]) {
    const sh = side > 0 ? s.shoulderL : s.shoulderR;
    const piece = side > 0 ? 'padL' : 'padR';
    const c = add(sh, [-1, side * 4.5, 7]);
    sc.ell(horn, piece, c, [[9, 0, 0], [0, 7.5, side * 2], [0, -side * 1.2, 4.2]], 0.4, { tag: 'plate' });
    spike(k, horn, piece, [add(c, [0, side * 3, 2]), add(c, [-2, side * 9, 8]), add(c, [-5, side * 12.5, 15])], 3.0, 'blade', 0.15, ivory);
    spike(k, horn, piece, [add(c, [5, side * 3, 1.5]), add(c, [7, side * 8, 6]), add(c, [7, side * 10.5, 11])], 2.2, 'blade', 0.15, ivory);
  }

  // ---- its arms: a gorilla's, the forearm the thickest of it; a blade of horn back off each elbow, a ridge of it down the forearm
  for (const side of [1, -1] as const) {
    const piece = side > 0 ? 'armL' : 'armR';
    const sh = side > 0 ? s.shoulderL : s.shoulderR;
    const el = side > 0 ? s.elbowL : s.elbowR;
    const ha = side > 0 ? s.handL : s.handR;
    sc.cone(hide, piece, sh, el, 8.6, 7.4, 2.2, { tag: 'upper' });
    sc.cone(hide, piece, el, ha, 7.8, 8.8, 1.6, { tag: 'fore' });
    sc.ell(hide, piece, lerp3(el, ha, 0.4), axes(WORLD, 9.6, 9.2, 10), 1.6, { tag: 'fore' });
    const fa = norm(sub(ha, el));
    // (the swell of its upper arm before and behind the bone, a groove between; a bracer of black horn above its wrist)
    const ua = norm(sub(el, sh));
    const fw = norm(sub([1, 0, 0], mul(ua, ua[0])));
    sc.ell(hide, piece, add(lerp3(sh, el, 0.5), mul(fw, 4.2)), [mul(ua, 9), mul(fw, 4.6), mul(cross(ua, fw), 5.4)], 0.9, { tag: 'upper' });
    sc.ell(hide, piece, add(lerp3(sh, el, 0.55), mul(fw, -4.4)), [mul(ua, 10), mul(fw, 4.4), mul(cross(ua, fw), 5.2)], 0.9, { tag: 'upper' });
    sc.cone(horn, piece, lerp3(el, ha, 0.76), lerp3(el, ha, 0.9), 9.3, 9.6, 0.3, { tag: 'bracer' });
    const back = norm(sub(norm(sub(el, sh)), mul(fa, 0.6)));
    spike(k, horn, piece, [add(el, mul(back, 4)), add(el, add(mul(back, 11), [0, 0, 3])), add(el, add(mul(back, 16), [0, 0, 8]))], 3.2, 'blade', 0.15, ivory);
    // (a ridge of bone blades back off its forearm, above the bracer)
    for (let i = 0; i < 2; i++) {
      const p = add(lerp3(el, ha, 0.3 + i * 0.22), [-7.4, 0, 0]);
      spike(k, horn, piece, [p, add(p, [-4.5, 0, 1.5 + i]), add(p, [-8 + i, 0, 4])], 2.3 - i * 0.3, 'blade', 0.15, ivory);
    }
  }
  claws(k, hide, ivory, 1.08, out);

  // ---- its legs: a goat's, the thigh a great haunch, the shank black-haired, a cloven hoof of black horn
  for (const side of [1, -1] as const) {
    const piece = side > 0 ? 'legL' : 'legR';
    const hip = side > 0 ? s.hipL : s.hipR;
    const knee = side > 0 ? s.kneeL : s.kneeR;
    const hock = side > 0 ? s.ankleL : s.ankleR;
    const toe = side > 0 ? s.toeL : s.toeR;
    sc.cone(hide, piece, hip, knee, 9.2, 6.4, 2.2, { tag: 'thigh' });
    sc.ell(hide, piece, lerp3(hip, knee, 0.35), axes(WORLD, 9.5, 8.6, 10), 2, { tag: 'thigh' });
    sc.cone(hide, piece, knee, hock, 5.6, 3.6, 1.2, { tag: 'shank' });
    sc.cone(horn, piece, hock, [toe[0] - 1.5, toe[1], 4.5], 3.4, 4.0, 0.6, { tag: 'cannon' });
    sc.ell(horn, piece, [toe[0], toe[1], 2.6], axes(WORLD, 5, 3.8, 2.8), 0.5, { tag: 'hoof' });
    spike(k, horn, piece, [add(hock, [-2, 0, 1]), add(hock, [-7, side * 0.5, 4]), add(hock, [-10, side * 0.5, 8])], 2.2, 'blade', 0.15, ivory);
  }

  // ---- its tail: heavy, a row of small blades down it, a hook of black horn at its end
  {
    const pts = tailOf(k, 46, 7, 0.75, 0.55);
    for (let i = 0; i + 1 < pts.length - 1; i++) sc.cone(hide, 'tail', pts[i], pts[i + 1], 6.2 - i * 0.75, 5.5 - i * 0.75, 1.2, { tag: 'tail' });
    for (let i = 1; i < pts.length - 2; i++) spike(k, horn, 'tail', [add(pts[i], [0, 0, 4.5 - i * 0.5]), add(pts[i], [-3, 0, 9 - i * 0.8])], 1.8, 'blade', 0.15, ivory);
    const e = pts[pts.length - 2];
    const d = norm(sub(pts[pts.length - 1], e));
    spike(k, horn, 'tail', [e, add(e, add(mul(d, 5), [0, 0, 2])), add(e, add(mul(d, 7), [0, 0, 8])), add(e, add(mul(d, 3), [0, 0, 12]))], 3.2, 'blade', 0.15, ivory);
  }

  // ---- its head: big and broad, thrust out low between its shoulders; a brow of black horn in a V, its eyes burning under it;
  // a heavy muzzle wrinkled back in a snarl; its underjaw hung wide, long teeth, his fire in its throat
  const H = s.head;
  const F = lifted(s.face, 22);
  const hp = (f: number, l: number, u: number): V3 => from(H, F, f, l, u);
  sc.cone(hide, 'head', add(lerp3(s.shoulderL, s.shoulderR, 0.5), [2, 0, 4]), hp(-6, 0, 0), 11, 10, 3, { tag: 'neck' });
  sc.ell(hide, 'head', hp(-2, 0, 2.5), axes(F, 12.5, 12.5, 10.5), 2.5, { tag: 'skull' });
  sc.cone(hide, 'head', hp(4, 0, -0.5), hp(16.5, 0, -2.2), 8.2, 5.6, 1.6, { tag: 'snout' });
  sc.ell(hide, 'head', hp(18.6, 0, -1.2), axes(F, 3, 4.6, 3), 1.0, { tag: 'nose' });
  for (const side of [1, -1]) {
    sc.cone(hide, 'head', hp(0, side * 11.5, -1), hp(12, side * 7.6, -3), 3.6, 2.2, 1.2, { tag: 'cheek' });
    // its socket, dug in under the brow, and the eye burning in it
    sc.ell(hide, 'head', hp(11.2, side * 6.2, 2.4), axes(F, 3.2, 3.6, 2.4), 0.4, { carve: true });
    eye(k, glow, hp(10.4, side * 6.0, 2.2), F, side, 2.7, 1.3, 0.5);
    // the brow, of horn: high at the temple, low over its nose
    sc.cone(horn, 'brow', hp(-1, side * 12.5, 10), hp(12.5, side * 2.2, 5.6), 3.4, 2.4, 0.6, { tag: 'brow' });
    // its crescent horn: out from the temple, up, and in over its head
    spike(k, ivory, side > 0 ? 'hornL' : 'hornR', [hp(-3, side * 10, 7), hp(-6, side * 18, 13), hp(-5, side * 23, 23), hp(0, side * 22, 34), hp(7, side * 16, 42), hp(12, side * 10, 45)], 5.2, 'horn');
    sc.ell(hide, 'head', hp(20.2, side * 2.0, -0.8), axes(F, 1.3, 1.2, 0.9), 0.2, { carve: true });
  }
  sc.ell(horn, 'brow', hp(12.6, 0, 5.4), axes(F, 2.6, 3.2, 2.2), 0.6, { tag: 'brow' });
  // (a crest of short spikes back over its skull)
  for (let i = 0; i < 3; i++) spike(k, ivory, 'crest', [hp(-1 - i * 5, 0, 12.4 - i * 0.8), hp(-4 - i * 5.5, 0, 17.5 - i * 1.4)], 1.8 - i * 0.2, 'spur');
  // (the snarl: its muzzle wrinkled back across the bridge)
  for (const f of [8.5, 11, 13.5]) sc.ell(hide, 'head', hp(f, 0, 4.6 - (f - 8.5) * 0.35), axes(F, 0.6, 4.6, 0.8), 0.2, { carve: true });
  sc.cone(hide, 'jaw', hp(-1, 0, -9), hp(12.5, 0, -19.5), 6.4, 4.2, 1.2, { tag: 'jaw' });
  sc.ell(hide, 'jaw', hp(13.2, 0, -19.8), axes(F, 3, 4.2, 2.6), 0.8, { tag: 'chin' });
  sc.ell(mouth, 'maw', hp(8, 0, -10.5), axes(F, 8.6, 6.4, 6.2), 0.4, { tag: 'maw' });
  sc.ell(glow, 'maw', hp(5, 0, -11), axes(F, 4.2, 4.8, 3.6), 0.3, { tag: 'throat' });
  // its teeth: long fangs down from its upper jaw round the front of its muzzle; a row up from the lower; two tusks outside its lip
  for (let i = -3; i <= 3; i++) {
    const a = (i / 3) * 1.2;
    const up = hp(11.5 + Math.cos(a) * 6.6, Math.sin(a) * 6.2, -5.4);
    sc.cone(ivory, 'teeth', up, add(up, mul(F[2], -(Math.abs(i) === 2 ? 6.4 : 3.8))), 1.35, 0.1, 0.1, { tag: 'fang' });
    const lo = hp(8.2 + Math.cos(a) * 6.4, Math.sin(a) * 5.6, -16.2 - Math.cos(a) * 2.2);
    sc.cone(ivory, 'teeth', lo, add(lo, mul(F[2], Math.abs(i) === 1 ? 3.8 : 2.6)), 1.1, 0.1, 0.1, { tag: 'fang' });
  }
  for (const side of [1, -1]) spike(k, ivory, 'teeth', [hp(8, side * 6.4, -17), hp(11.5, side * 8.2, -13), hp(12.5, side * 8.6, -7)], 1.9, 'fang');
  out.jaw = hp(12, 0, -8);
  
  return out;
}

/** NO PIXEL ALONE (his rulebook's Pixels 1), as the game's demon (dev/sculpt_demon_rig.ts demonAura). */
function noPixelAlone(d: Drawn): void {
  const { w, h, d: px } = d.px;
  const solid = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < w && y < h && px[(y * w + x) * 4 + 3] === 255;
  for (let y = 0; y < h - 1; y++) {
    for (let x = 0; x < w; x++) {
      if (!solid(x, y) || solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1)) continue;
      const i = (y * w + x) * 4;
      const j = ((y + 1) * w + x) * 4;
      if (px[j + 3] === 0) for (let c = 0; c < 4; c++) px[j + c] = c === 3 ? 255 : px[i + c];
      else px[i + 3] = 0;
    }
  }
}

/** A new demon at a moment: on the game's demon's bones in a pose, from in front or behind (as the camera truly sees it), turned `turn`. */
export function newDemonFrame(kind: NewDemon, view: GameView, pose: Bones, turn = 0, t = 2, tail = 0): Drawn {
  const pv: PaintView = view === 'back' ? 'rear' : view;
  const s = solve(DEMON_B, pose as Posed);
  const sc = new Sculpt();
  sc.spin = turn;
  const a = (turn * Math.PI) / 180;
  const spun = (p: V3): V3 => [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a), p[2]];
  const nearOf = (p: V3): number => {
    const q = spun(p);
    return pv === 'front' ? 0.612 * (q[0] - q[1]) + 0.5 * q[2] : 0.612 * (-q[0] - q[1]) + 0.5 * q[2];
  };
  const farL = nearOf(add(s.pelvis, [0, 20, 6])) < nearOf(s.pelvis);
  const k: Kit = { sc, s, far: (piece) => (piece.endsWith('L') ? farL : piece.endsWith('R') ? !farL : false), tail };
  const built = kind === 'pact' ? pactInto(k) : kind === 'pale' ? paleInto(k) : maneInto(k);
  const d = draw(sc, pv, RIG_CANVAS.ax, RIG_CANVAS.ay, RIG_CANVAS, undefined, FRIEND_RIM);
  built.flames.forEach((f, i) => fireBehind(d, sc.at(f.p), f.size, t + i * 0.37, f.deep ?? 10));
  built.floor.forEach((p, i) => fireBehind(d, sc.at(p), 3.7 - (i % 2) * 0.7, t + i * 0.41, 12));
  if (built.smoke.length) demonAura(d, { seat: s.head, fires: [], talons: [], aura: { from: built.smoke.map((p) => sc.at(p)), horns: [], jaw: sc.at(built.smoke[0]), claws: [], feet: [], behind: pv !== 'front', time: t } }, 'smoke');
  noPixelAlone(d);
  return d;
}

/** A limb's parts, each side: the names of its piece and its joints. */
function arm(s: Skeleton, side: 1 | -1): { piece: string; sh: V3; el: V3; ha: V3 } {
  return side > 0 ? { piece: 'armL', sh: s.shoulderL, el: s.elbowL, ha: s.handL } : { piece: 'armR', sh: s.shoulderR, el: s.elbowR, ha: s.handR };
}
function leg(s: Skeleton, side: 1 | -1): { piece: string; hip: V3; knee: V3; hock: V3; toe: V3; heel: V3 } {
  return side > 0 ? { piece: 'legL', hip: s.hipL, knee: s.kneeL, hock: s.ankleL, toe: s.toeL, heel: s.heelL } : { piece: 'legR', hip: s.hipR, knee: s.kneeR, hock: s.ankleR, toe: s.toeR, heel: s.heelR };
}

// ============================================================================================================
// B. THE PALE CRAWLER: starved and bone-white, all elbows and ribs; its arms from the elbow down and its shanks black as if
// dipped in soot, its talons long; NO EYES, the skin smooth where they would be; a mouth from ear to ear full of needles, his
// fire behind them; a crown of black thorns grown out of its skull; its backbone standing out in knuckles down to a long
// bony tail.
function paleInto(k: Kit): Built {
  const { sc, s } = k;
  const out: Built = { floor: [], flames: [], smoke: [], jaw: s.head };
  const skin = fleshOf(k, BONE_SKIN, (h) => {
    if (h.prim.tag !== 'ribs') return null;
    const v = sub(h.p, s.ribs);
    const u = dot(v, s.chest[2]);
    const side = Math.abs(dot(v, s.chest[1]));
    // (its ribs showing: bands of shadow round its flanks)
    return side > 5 && Math.floor((u + 40) / 2.4) % 2 === 0 ? tone5(BONE_SKIN, h.tone - 1) : null;
  }, 0.85);
  const soot = fleshOf(k, SOOT, undefined, 0.5);
  const ivory = sc.mat({ ramp: IVORY });
  const glow = sc.mat({ ramp: CYAN, paint: (h) => (h.tone >= 2 ? '#e8ffff' : CYAN[2]) });
  const mouth = sc.mat({ ramp: MOUTH });

  // ---- its trunk: a cage of ribs, a belly sunk in under it, narrow hips; its shoulder blades standing up sharp
  sc.ell(skin, 'torso', from(s.pelvis, s.hips, -1, 0, 2), axes(s.hips, 7.5, 9.5, 7.5), 2.4, { tag: 'pelvis' });
  sc.ell(skin, 'torso', lerp3(s.waist, s.ribs, 0.35), axes(s.belly, 6.4, 7.6, 9), 2.6, { tag: 'belly' });
  sc.ell(skin, 'torso', from(lerp3(s.ribs, s.back, 0.55), s.chest, 2, 0, 0), axes(s.chest, 12.5, 14.5, 12.5), 2.6, { tag: 'ribs' });
  const top = add(lerp3(s.shoulderL, s.shoulderR, 0.5), [-3, 0, 5]);
  sc.ell(skin, 'torso', top, axes(WORLD, 9, 15, 6.5), 2.4, { tag: 'hump' });
  for (const side of [1, -1] as const) {
    const sh = arm(s, side).sh;
    sc.ell(skin, 'torso', add(sh, [-6, -side * 6, 8]), [[5.5, 0, 2], [0, 3.6, 0], [-3, 0, 9]], 1.0, { tag: 'blade' });
  }
  // (its backbone: knuckles from its neck to its rump, each with a short spur of bone)
  const spine = (t: number): V3 => {
    const a = add(top, [8, 0, 6]);
    const b = add(top, [-8, 0, 6.5]);
    const c = from(s.waist, s.belly, -7.4, 0, 3);
    const d = from(s.pelvis, s.hips, -8, 0, 4);
    return t < 1 ? lerp3(a, b, t) : t < 2 ? lerp3(b, c, t - 1) : lerp3(c, d, t - 2);
  };
  for (let i = 0; i < 9; i++) {
    const c = spine(i * 0.36);
    sc.ell(skin, 'torso', c, axes(WORLD, 2.6, 2.6, 2.4), 0.8, { tag: 'backbone' });
    spike(k, ivory, 'spurs', [add(c, [0, 0, 1.5]), add(c, [-2.5, 0, 6.5 - i * 0.3])], 1.3, 'spur');
  }

  // ---- its arms: long and thin, a knot of bone at the elbow, black from there down
  for (const side of [1, -1] as const) {
    const { piece, sh, el, ha } = arm(s, side);
    sc.ell(skin, piece, add(sh, [0, side * 1, 0]), axes(WORLD, 6, 5.6, 6), 1.6, { tag: 'delt' });
    sc.cone(skin, piece, sh, el, 4.6, 3.6, 1.4, { tag: 'upper' });
    sc.ell(skin, piece, el, axes(WORLD, 4.6, 4.4, 4.6), 0.8, { tag: 'elbow' });
    spike(k, ivory, piece, [add(el, [-3, 0, 1]), add(el, [-9, 0, 4])], 1.6, 'spur');
    sc.cone(soot, piece, lerp3(el, ha, 0.16), ha, 3.9, 3.4, 0.8, { tag: 'fore' });
  }
  claws(k, soot, ivory, 1.2, out);

  // ---- its legs: thin, the shank black; a foot of three talons
  for (const side of [1, -1] as const) {
    const { piece, hip, knee, hock, toe } = leg(s, side);
    sc.cone(skin, piece, hip, knee, 6.2, 4.2, 1.6, { tag: 'thigh' });
    sc.ell(skin, piece, knee, axes(WORLD, 4.4, 4.2, 4.4), 0.8, { tag: 'knee' });
    sc.cone(soot, piece, lerp3(knee, hock, 0.2), hock, 3.6, 2.8, 0.8, { tag: 'shank' });
    sc.cone(soot, piece, hock, [toe[0] - 2, toe[1], 3.6], 2.8, 3.0, 0.6, { tag: 'cannon' });
    spike(k, ivory, piece, [add(hock, [-1.5, 0, 0.5]), add(hock, [-6, 0, 3.5])], 1.5, 'spur');
    for (const g of [-0.5, 0, 0.5]) spike(k, ivory, piece, [[toe[0] - 1, toe[1], 2.8], [toe[0] + 4 * Math.cos(g), toe[1] + 4 * Math.sin(g), 3.2], [toe[0] + 7.5 * Math.cos(g), toe[1] + 7.5 * Math.sin(g), 0.6]], 1.5, 'claw');
  }

  // ---- its tail: long, thin, knuckled as its back, a hooked barb of bone at its end
  {
    const pts = tailOf(k, 58, 10, 0.7, 0.9);
    for (let i = 0; i + 1 < pts.length - 1; i++) {
      sc.cone(skin, 'tail', pts[i], pts[i + 1], 3.2 - i * 0.26, 2.9 - i * 0.26, 0.8, { tag: 'tail' });
      if (i > 0 && i < 8) sc.ell(skin, 'tail', pts[i], axes(WORLD, 3.3 - i * 0.24, 3.3 - i * 0.24, 3.3 - i * 0.24), 0.5, { tag: 'backbone' });
    }
    const e = pts[pts.length - 2];
    const d = norm(sub(pts[pts.length - 1], e));
    spike(k, ivory, 'tail', [e, add(e, add(mul(d, 4), [0, 0, 3])), add(e, add(mul(d, 5.5), [0, 0, 9])), add(e, add(mul(d, 1), [0, 0, 14]))], 1.9, 'barb');
  }

  // ---- its head: a bald skull with no eyes; its mouth cut back to where its ears would be, hung open, needles top and bottom
  const H = s.head;
  const F = lifted(s.face, 24);
  const hp = (f: number, l: number, u: number): V3 => from(H, F, f, l, u);
  sc.cone(skin, 'head', add(top, [8, 0, 1]), hp(-6, 0, -1), 6, 5.6, 2, { tag: 'neck' });
  sc.ell(skin, 'head', hp(-1, 0, 3), axes(F, 12.5, 11, 9.6), 2.2, { tag: 'skull' });
  sc.ell(skin, 'head', hp(9, 0, 0.5), axes(F, 7.4, 8.6, 5.4), 1.8, { tag: 'snout' });
  // (where its eyes would be: two shallow hollows, skinned over; its nose two slits)
  for (const side of [1, -1]) {
    sc.ell(skin, 'head', hp(10.6, side * 6.4, 5.2), axes(F, 2.6, 3.0, 1.8), 1.0, { carve: true });
    sc.ell(skin, 'head', hp(16.2, side * 1.6, 1.6), axes(F, 1.4, 0.8, 1.6), 0.2, { carve: true });
  }
  sc.cone(skin, 'jaw', hp(-4, 0, -8), hp(11, 0, -17.5), 6.6, 4.6, 1.2, { tag: 'jaw' });
  sc.ell(mouth, 'maw', hp(5, 0, -8.6), axes(F, 11, 8.4, 5.6), 0.4, { tag: 'maw' });
  sc.ell(glow, 'maw', hp(4.5, 0, -10.5), axes(F, 7, 6.2, 3.4), 0.3, { tag: 'throat' });
  for (let i = -6; i <= 6; i++) {
    const a = (i / 6) * 1.95;
    const up = hp(4.5 + Math.cos(a) * 11.4, Math.sin(a) * 9.4, -4.6);
    sc.cone(ivory, 'teeth', up, add(up, mul(F[2], -(i % 2 === 0 ? 5.6 : 3.4))), 0.95, 0.08, 0.1, { tag: 'fang' });
    const lo = hp(2.5 + Math.cos(a) * 10.2, Math.sin(a) * 8.2, -13.4 - Math.cos(a) * 3.2);
    sc.cone(ivory, 'teeth', lo, add(lo, mul(F[2], i % 2 === 0 ? 3.2 : 4.8)), 0.9, 0.08, 0.1, { tag: 'fang' });
  }
  // its crown: long black thorns out of its skull from ear to ear, swept up and back, no two alike
  for (let i = 0; i < 9; i++) {
    const b = ((i - 4) / 4) * 1.35;
    const long = 13 + ((i * 5) % 4) * 2.2 - Math.abs(i - 4) * 1.2;
    const root = hp(-2.5 - (i % 2) * 2.2, Math.sin(b) * 9.6, 3 + Math.cos(b) * 8.4);
    // (each standing up off its skull, fanned out to its sides, its tip hooked back)
    const outw = norm(add(mul(F[1], Math.sin(b) * 0.9), add([0, 0, 1], mul(F[0], -0.15))));
    spike(k, soot, 'crown', [root, add(root, mul(outw, long * 0.55)), add(root, add(mul(outw, long * 0.98), mul(F[0], -long * 0.28)))], 2.0, 'thorn');
  }
  out.jaw = hp(10, 0, -10);
  return out;
}

// ============================================================================================================
// C. THE BURNING MANE: a great beast between a lion and an ape, its hide the dusk violet of his coat, barred darker down its
// back; FOUR EYES; two sabre fangs down past its chin; short horns swept back; and where a lion has its mane, HIS HELLFIRE:
// a ruff of cyan flame round its neck and a crest of it down its backbone to the tip of its tail.
function maneInto(k: Kit): Built {
  const { sc, s } = k;
  const out: Built = { floor: [], flames: [], smoke: [], jaw: s.head };
  const bodyWay = norm(sub(add(lerp3(s.shoulderL, s.shoulderR, 0.5), [0, 0, 6]), s.pelvis));
  const BARRED = new Set(['ribs', 'hump', 'belly', 'pelvis', 'thigh', 'upper', 'delt', 'tail']);
  const hide = fleshOf(k, DUSK, (h) => {
    const tg = h.prim.tag;
    if (tg === 'skull' || tg === 'brow') for (const e of masked) if (Math.hypot(h.p[0] - e[0], h.p[1] - e[1], h.p[2] - e[2]) < 5.2) return tone5(DUSK_DARK, h.tone - 1);
    if (!tg || !BARRED.has(tg) || h.tone < 2) return null;
    const along = dot(h.p, bodyWay) + (tg === 'thigh' || tg === 'upper' || tg === 'delt' ? h.p[2] * 0.6 : 0);
    return Math.sin(along * 0.66 + Math.sin(h.p[1] * 0.35) * 0.9) > 0.5 ? tone5(DUSK_DARK, h.tone - 1) : null;
  });
  const dark = fleshOf(k, DUSK_DARK, undefined, 0.5);
  const ivory = sc.mat({ ramp: IVORY });
  const glow = sc.mat({ ramp: CYAN, paint: (h) => (h.tone >= 2 ? '#e8ffff' : CYAN[2]) });
  const mouth = sc.mat({ ramp: MOUTH });
  /** (its eyes: the hide dark round them, a mask, so they burn out of it) */
  const masked: V3[] = [];

  // ---- its trunk: a deep chest, drawn up to a narrow waist; heavy shoulders
  sc.ell(hide, 'torso', from(s.pelvis, s.hips, -1, 0, 2), axes(s.hips, 9, 10.5, 8), 2.6, { tag: 'pelvis' });
  sc.ell(hide, 'torso', lerp3(s.waist, s.ribs, 0.35), axes(s.belly, 8, 9.4, 9), 2.8, { tag: 'belly' });
  sc.ell(hide, 'torso', from(lerp3(s.ribs, s.back, 0.55), s.chest, 2.5, 0, 0), axes(s.chest, 14, 16, 13.5), 3, { tag: 'ribs' });
  const top = add(lerp3(s.shoulderL, s.shoulderR, 0.5), [-4, 0, 6.5]);
  sc.ell(hide, 'torso', top, axes(WORLD, 12, 16.5, 8), 3, { tag: 'hump' });

  // ---- its arms: thick, the paw broad and dark; its legs a great cat's
  for (const side of [1, -1] as const) {
    const { piece, sh, el, ha } = arm(s, side);
    sc.ell(hide, piece, add(sh, [0, side * 1.5, 0.5]), axes(WORLD, 8.8, 8.2, 9), 2.2, { tag: 'delt' });
    sc.cone(hide, piece, sh, el, 7.2, 6, 2, { tag: 'upper' });
    sc.cone(hide, piece, el, lerp3(el, ha, 0.7), 6.6, 6.8, 1.4, { tag: 'fore' });
    sc.cone(dark, piece, lerp3(el, ha, 0.62), ha, 6.9, 6.4, 0.6, { tag: 'paw' });
    spike(k, ivory, piece, [add(el, [-4, 0, 1]), add(el, [-10, 0, 5])], 2.2, 'spur');
  }
  claws(k, dark, ivory, 1.05, out);
  for (const side of [1, -1] as const) {
    const { piece, hip, knee, hock, toe } = leg(s, side);
    sc.cone(hide, piece, hip, knee, 8.6, 5.6, 2, { tag: 'thigh' });
    sc.ell(hide, piece, lerp3(hip, knee, 0.35), axes(WORLD, 8.6, 7.6, 9), 1.8, { tag: 'thigh' });
    sc.cone(hide, piece, knee, hock, 4.8, 3.2, 1.2, { tag: 'shank' });
    sc.cone(dark, piece, hock, [toe[0] - 2, toe[1], 3.8], 3.0, 3.4, 0.6, { tag: 'cannon' });
    sc.ell(dark, piece, [toe[0] + 1, toe[1], 2.8], axes(WORLD, 5, 4.2, 2.8), 0.6, { tag: 'paw' });
    for (const g of [-0.45, 0, 0.45]) spike(k, ivory, piece, [[toe[0] + 4 * Math.cos(g), toe[1] + 4 * Math.sin(g), 3], [toe[0] + 8 * Math.cos(g), toe[1] + 8 * Math.sin(g), 0.6]], 1.3, 'claw');
  }

  // ---- its tail: long, lashing, his fire at its tip
  {
    const pts = tailOf(k, 56, 9, 0.6, 1.1);
    for (let i = 0; i + 1 < pts.length; i++) sc.cone(hide, 'tail', pts[i], pts[i + 1], 3.8 - i * 0.26, 3.5 - i * 0.26, 1.0, { tag: 'tail' });
    out.flames.push({ p: add(pts[pts.length - 1], [0, 0, 1]), size: 3.4 });
  }

  // ---- its head: a lion's breadth and an ape's brow; four eyes; a dark muzzle; two sabre fangs
  const H = s.head;
  const F = lifted(s.face, 22);
  const hp = (f: number, l: number, u: number): V3 => from(H, F, f, l, u);
  sc.cone(hide, 'head', add(top, [9, 0, 0]), hp(-6, 0, -1), 9.5, 9, 2.6, { tag: 'neck' });
  sc.ell(hide, 'head', hp(-2, 0, 2.5), axes(F, 12, 12, 10.2), 2.4, { tag: 'skull' });
  sc.cone(dark, 'muzzle', hp(5, 0, -1), hp(16, 0, -2.6), 7.6, 5.8, 1.4, { tag: 'snout' });
  sc.ell(dark, 'muzzle', hp(18.4, 0, -1.4), axes(F, 2.8, 4.4, 2.8), 0.9, { tag: 'nose' });
  for (const side of [1, -1]) {
    // its brow, heavy; under it two eyes a side, the upper the smaller
    sc.cone(hide, 'head', hp(-1, side * 12, 8.4), hp(12, side * 2.4, 5.2), 3.2, 2.4, 1.2, { tag: 'brow' });
    sc.ell(hide, 'head', hp(11, side * 6.2, 2.4), axes(F, 3, 3.4, 2.2), 0.4, { carve: true });
    eye(k, glow, hp(10.2, side * 6.0, 2.2), F, side, 2.6, 1.25, 0.5);
    eye(k, glow, hp(4.5, side * 10.6, 3.6), F, side, 1.9, 1.0, 0.7);
    masked.push(hp(10.2, side * 6.0, 2.2), hp(4.5, side * 10.6, 3.6));
    spike(k, ivory, side > 0 ? 'hornL' : 'hornR', [hp(-2, side * 8, 9), hp(-9, side * 11.5, 14.5), hp(-17, side * 11.5, 16), hp(-23, side * 9.5, 14)], 3.6, 'horn');
    sc.cone(hide, 'head', hp(-5, side * 11.5, 5), hp(-10, side * 15.5, 10.5), 2.6, 0.4, 0.8, { tag: 'ear' });
  }
  sc.cone(hide, 'jaw', hp(-3, 0, -9), hp(11.5, 0, -19), 6.6, 4.4, 1.2, { tag: 'jaw' });
  sc.ell(mouth, 'maw', hp(7, 0, -10), axes(F, 10, 7.6, 6), 0.4, { tag: 'maw' });
  sc.ell(glow, 'maw', hp(5, 0, -10.5), axes(F, 4, 4.6, 3.2), 0.3, { tag: 'throat' });
  for (const side of [1, -1]) {
    spike(k, ivory, 'teeth', [hp(14.5, side * 6.0, -4.5), hp(16.4, side * 6.8, -11), hp(15.2, side * 6.6, -19.5)], 2.5, 'fang');
    for (const f of [11, 8, 5]) sc.cone(ivory, 'teeth', hp(f, side * 6.6, -5.6), hp(f, side * 6.6, -8.6), 1.0, 0.1, 0.1, { tag: 'fang' });
    for (const f of [10, 7]) sc.cone(ivory, 'teeth', hp(f - 1, side * 5.4, -15.2 + (10 - f) * 0.5), hp(f - 1, side * 5.4, -12.2 + (10 - f) * 0.5), 1.0, 0.1, 0.1, { tag: 'fang' });
  }
  // ---- its mane, his hellfire: a ruff of it round its neck, a crest of it down its back
  for (let i = 0; i < 7; i++) {
    const b = ((i - 3) / 3) * 1.15;
    out.flames.push({ p: hp(-14 - Math.abs(i - 3) * 0.8, Math.sin(b) * 13.5, 2 + Math.cos(b) * 9.5), size: 5.0 - Math.abs(i - 3) * 0.4, deep: 1 });
  }
  const crest = (t: number): V3 => {
    const a = add(top, [4, 0, 8]);
    const b = add(top, [-11, 0, 6.5]);
    const c = from(s.waist, s.belly, -9.4, 0, 3);
    const d = from(s.pelvis, s.hips, -9.6, 0, 4);
    return t < 1 ? lerp3(a, b, t) : t < 2 ? lerp3(b, c, t - 1) : lerp3(c, d, t - 2);
  };
  for (let i = 0; i < 8; i++) out.flames.push({ p: add(crest(i * 0.4), [0, 0, 1]), size: 4.8 - i * 0.32 });
  out.jaw = hp(12, 0, -9);
  return out;
}

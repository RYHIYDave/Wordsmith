// TEN QUICK IDEAS FOR THE WARLOCK'S DEMON, ON THE WEREWOLF'S FRAME (the Warlock chat, 11 Nov 2026). A MOCK-UP; NOTHING OF THE
// GAME IMPORTS IT.
//
// His words, 11 Nov 2026. Shown three new demons on the werewolf's frame he asked for and asked whether the frame was right and
// which look it should wear: “Sure but I don’t like these options so why do you keep giving them to me”, and “None of these
// looks”. (Told him: my mistake, his “Nah man” had been to the looks too; they are gone. THE FRAME IS SETTLED: a werewolf's,
// up on two legs to fight, down on all fours to run.) Asked what the demon should look like on it, his pick of three ways to
// go on: “Ten quick ideas” (offered as: ten small, different heads and hides on the frame to react to, before any is drawn
// properly).
//
// SO: ten, each a different creature in its head, its hide and the one thing it is known by; small and quick, for him to say
// which way to go. All on the one frame (dev/demon_new.ts WOLF_B, wolfFrame) in the one stance (DEMON_UP), their claws open
// and burning with his cyan fire. NONE IS A LOOK HE HAS PASSED OVER: not the three of today (the red one in horn armour with
// crescent horns; the bone-white one with no eyes and a crown of thorns; the violet one with four eyes and a mane of fire),
// nor the ten of 26 Oct and its redo (dev/demon_designs.ts: the brute with wings, the wraith, the serpent, the burning bones;
// a brute's, a bare skull's, a long goat's, a great maw's, a hound's and a bat's face). The first is the demon he has (“I
// like okay”), built again on the frame, to measure the rest by.
//
// QUICK: their hides' patterns are laid by where a point is in the figure's own space, not carried by each bone, so they would
// crawl if the figure moved. The one he picks is drawn properly.

import type { Ramp } from '../art/kit';
import { CYAN } from '../art/kit';
import type { GameView } from '../art/skin';
import { add, cross, lerp3, mul, norm, sub } from '../art/skeleton';
import type { Bones, Rot, V3 } from '../art/skeleton';
import { primDist } from './sculpt';
import type { Sculpt, Drawn, Hit } from './sculpt';
import { IVORY } from './sculpt_warlock';
import { tone5 } from './sculpt_demon';
import { HEAD_K, HORN_BLACK, MOUTH, U, WORLD, arm, axes, bigger, claws, dot, eye, fleshOf, from, lifted, paintDemon, spike, tailOf, wolfFrame } from './demon_new';
import type { Built, Frame, Kit } from './demon_new';

export const IDEAS: { name: string; says: string }[] = [
  { name: '1. YOURS, REBUILT', says: 'the demon you have, on the new frame: dark hide, swept horns, the snarling beast face, wings' },
  { name: '2. THE HORNED OWL', says: 'feathered, a hooked beak, great round eyes, feather horns' },
  { name: '3. THE SCALED', says: 'a long flat snout of teeth, scales, a heavy tail' },
  { name: '4. THE MANY-EYED', says: 'a spider’s face: eight eyes, two great fangs, bristles' },
  { name: '5. THE ONE EYE', says: 'one burning eye, an underbite of tusks, horns hooked down' },
  { name: '6. THE LIVING SHADOW', says: 'pure black; only its eyes, its grin and its claws burn' },
  { name: '7. THE SPLIT FACE', says: 'its mouth runs up its face; six eyes; locks of flesh' },
  { name: '8. THE GARGOYLE', says: 'cracked stone, a square jaw, wings folded like a cloak' },
  { name: '9. THE ANGLER', says: 'needle teeth in a huge underjaw, his fire as its lure, a fin' },
  { name: '10. THE OBSIDIAN', says: 'black glass in facets, a crown of shards, light inside' },
];

const hash = (x: number, y: number): number => {
  const v = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return v - Math.floor(v);
};
const frac = (x: number): number => x - Math.floor(x);

/** A head being built: the bigger sculptor, a place in the head's own measure, the head's lines (lifted toward the eye). */
interface Head {
  hsc: Sculpt;
  hk: Kit;
  hp: (f: number, l: number, u: number) => V3;
  F: Rot;
}
function headOf(k: Kit, lift = 22): Head {
  const F = lifted(k.s.face, lift);
  const hsc = bigger(k.sc, HEAD_K);
  return { hsc, hk: { ...k, sc: hsc }, hp: (f, l, u) => from(k.s.head, F, f * HEAD_K, l * HEAD_K, u * HEAD_K), F };
}
/** Its three stuffs every one has: bone, the friend's cyan burning, the dark of a mouth. */
function stuffs(k: Kit): { ivory: number; glow: number; mouth: number } {
  return {
    ivory: k.sc.mat({ ramp: IVORY }),
    glow: k.sc.mat({ ramp: CYAN, paint: (h) => (h.tone >= 2 ? '#e8ffff' : CYAN[2]) }),
    mouth: k.sc.mat({ ramp: MOUTH }),
  };
}
/** A round eye burning: a disc of the friend's cyan facing the way the head faces, a white-hot point. */
function roundEye(h: Head, glow: number, c: V3, r: number): void {
  h.hsc.ell(glow, 'eye', c, axes(h.F, 1.1, r, r), 0.05, { tag: 'eye' });
  h.hsc.mark(add(c, mul(h.F[0], 1.2 * HEAD_K)), '#ffffff', 1, 1, 0, 0, 2.5);
}
/** A row of teeth round the front of a jaw: `n` of them on an arc `span` radians either side of straight ahead, each `long` (the odd ones `odd`), pointing up (1) or down (-1). */
function teeth(h: Head, mat: number, n: number, span: number, cf: number, rf: number, rl: number, u: number, way: 1 | -1, long: number, odd: number, thick = 1.1): void {
  for (let i = 0; i < n; i++) {
    const a = n === 1 ? 0 : (i / (n - 1) - 0.5) * 2 * span;
    const root = h.hp(cf + Math.cos(a) * rf, Math.sin(a) * rl, u);
    h.hsc.cone(mat, 'teeth', root, add(root, mul(h.F[2], way * (i % 2 ? odd : long) * HEAD_K)), thick, 0.1, 0.1, { tag: 'fang' });
  }
}

/**
 * WINGS FOLDED ROUND ITS SHOULDERS LIKE A CLOAK (of wings, his word of 11 Nov: “Maybe, we’ll see what you come up with”; and of
 * the game's, 26 and 27 Oct: “two big flat sails”, “too flat.  Curve them.”): each an arm up from its back to a wrist high
 * over and outside its shoulder, three fingers hanging from it down and back, the skin between them bellied out and its edge
 * drawn up in a scallop between each two tips; never one flat sheet.
 */
function cloakWings(k: Kit, skin: number, bone: number, talon: number, fr: Frame, size: number): void {
  const { sc } = k;
  for (const side of [1, -1] as const) {
    const piece = side > 0 ? 'wingL' : 'wingR';
    const R = add(fr.spine(0.5), [0, side * 8, 0]);
    const E = add(R, mul([-10, side * 12, 18], size));
    const W = add(E, mul([-4, side * 13, 13], size));
    const tips: V3[] = [add(W, mul([5, side * 14, -22], size)), add(W, mul([-10, side * 10, -38], size)), add(W, mul([-21, side * 1, -48], size))];
    const B = add(fr.spine(1.7), [-2, side * 5, 0]);
    sc.cone(bone, piece, R, E, 3.2, 2.5, 0.8, { tag: 'wingarm' });
    sc.cone(bone, piece, E, W, 2.5, 1.9, 0.6, { tag: 'wingarm' });
    spike(k, talon, piece, [W, add(W, [1, side * 2, 5]), add(W, [4, side * 2, 9])], 1.6, 'claw');
    for (const tp of tips) sc.cone(bone, piece, W, tp, 1.6, 0.5, 0.3, { tag: 'finger' });
    const edge: V3[] = [...tips, B];
    for (let i = 0; i + 1 < edge.length; i++) {
      const P = edge[i];
      const Q = edge[i + 1];
      let n = norm(cross(sub(P, W), sub(Q, W)));
      if (n[0] > 0) n = mul(n, -1);
      // (the middle of its edge drawn up toward the wrist, a scallop; the skin bellied out behind)
      const M = add(lerp3(lerp3(P, Q, 0.5), W, 0.24), mul(n, 3.2 * size));
      sc.tri(skin, piece, W, P, M, 0.7, 0.5, { tag: 'membrane' });
      sc.tri(skin, piece, W, M, Q, 0.7, 0.5, { tag: 'membrane' });
    }
    sc.tri(skin, piece, E, W, B, 0.7, 0.5, { tag: 'membrane' });
    sc.tri(skin, piece, R, E, B, 0.7, 0.5, { tag: 'membrane' });
  }
}

const out0 = (k: Kit): Built => ({ floor: [], flames: [], smoke: [], jaw: k.s.head });

// ---- 1. YOURS, REBUILT: the demon he has. An ash-dark hide, lifted so its body reads; two great horns swept back; the beast's
// face he picked (27 Oct: “A, beast sharpened (Recommended)”): a heavy brow in a V, a long muzzle, its jaws wide, fangs down and
// tusks up; spines down its back; and wings, folded round it like a cloak.
function idea1(k: Kit): Built {
  const { sc, s } = k;
  const o = out0(k);
  const { ivory, glow, mouth } = stuffs(k);
  const ASH: Ramp = ['#0c0a12', '#221e2c', '#3e384c', '#5e5670', '#827a96'];
  const hide = fleshOf(k, ASH);
  const horn = fleshOf(k, HORN_BLACK, undefined, 0.5);
  const leather = fleshOf(k, ['#12060a', '#2a0e14', '#481820', '#6c2a2c', '#8e443c'], undefined, 0.4);
  const fr = wolfFrame(k, { hide, foot: 'hoof', footMat: horn, talon: ivory });
  cloakWings(k, leather, hide, ivory, fr, 1.05);
  for (let i = 0; i < 6; i++) spike(k, ivory, 'spines', [add(fr.spine(0.2 + i * 0.45), [0, 0, 1]), add(fr.spine(0.2 + i * 0.45), [-4, 0, 9 - i * 0.7])], 2.2 - i * 0.18, 'spine');
  claws(k, hide, ivory, 1.15, o);
  const pts = tailOf(k, 50, 7, 0.75, 0.6);
  for (let i = 0; i + 1 < pts.length; i++) sc.cone(hide, 'tail', pts[i], pts[i + 1], 5 - i * 0.6, 4.4 - i * 0.6, 1.0, { tag: 'tail' });
  const h = headOf(k);
  const { hsc, hk, hp, F } = h;
  hsc.cone(hide, 'head', add(fr.top, [9, 0, 0]), hp(-6, 0, -1), 9.5, 9, 2.6, { tag: 'neck' });
  hsc.ell(hide, 'head', hp(-2, 0, 2.5), axes(F, 12, 11.5, 10), 2.4, { tag: 'skull' });
  hsc.cone(hide, 'head', hp(4, 0, -0.5), hp(19, 0, -3), 7.4, 4.4, 1.6, { tag: 'snout' });
  hsc.ell(hide, 'head', hp(20.5, 0, -2.2), axes(F, 2.6, 3.8, 2.6), 0.9, { tag: 'nose' });
  for (const side of [1, -1]) {
    hsc.cone(hide, 'head', hp(-1, side * 11.5, 9), hp(12.5, side * 2, 5), 3.2, 2.4, 1.0, { tag: 'brow' });
    hsc.ell(hide, 'head', hp(11, side * 5.8, 2.4), axes(F, 3, 3.4, 2.2), 0.4, { carve: true });
    eye(hk, glow, hp(10.2, side * 5.6, 2.2), F, side, 2.6, 1.25, 0.5);
    spike(hk, ivory, side > 0 ? 'hornL' : 'hornR', [hp(-3, side * 9, 8), hp(-12, side * 15, 14), hp(-22, side * 17, 24), hp(-28, side * 14, 36)], 4.6, 'horn');
    for (const [f, long] of [[16, 5.5], [12.5, 3.4], [9, 3.4], [5.5, 3]] as const) hsc.cone(ivory, 'teeth', hp(f, side * (3.6 + (16 - f) * 0.28), -5.2), hp(f, side * (3.6 + (16 - f) * 0.28), -5.2 - long), 1.15, 0.1, 0.1, { tag: 'fang' });
    spike(hk, ivory, 'teeth', [hp(13.5, side * 3.6, -15.5), hp(14.5, side * 4, -10)], 1.6, 'fang');
  }
  hsc.cone(hide, 'jaw', hp(-1, 0, -9), hp(15, 0, -17), 5.6, 3.4, 1.2, { tag: 'jaw' });
  hsc.ell(mouth, 'maw', hp(9, 0, -10), axes(F, 9.5, 5.2, 5), 0.4, { tag: 'maw' });
  hsc.ell(glow, 'maw', hp(4.5, 0, -10.5), axes(F, 3.6, 4, 3), 0.3, { tag: 'throat' });
  return o;
}

// ---- 2. THE HORNED OWL: feathered slate-blue; a pale face in two discs, great round eyes burning in them; a hooked black
// beak; two horns of feather up from its brow; a ruff round its neck; a fringe of long feathers down each forearm.
function idea2(k: Kit): Built {
  const { sc, s } = k;
  const o = out0(k);
  const { ivory, glow, mouth } = stuffs(k);
  const FEATHER: Ramp = ['#10121e', '#252a3e', '#434a66', '#6a7290', '#98a0ba'];
  const feather = fleshOf(k, FEATHER, (h: Hit) => (h.tone >= 2 && Math.sin(h.p[2] * 0.8 + Math.sin((h.p[0] + h.p[1]) * 0.45) * 1.4) > 0.5 ? tone5(FEATHER, h.tone - 1) : null));
  const face = sc.mat({ ramp: ['#3a3440', '#6a6270', '#a09aa4', '#d0cad0', '#f0ecee'] });
  const beak = fleshOf(k, HORN_BLACK, undefined, 0.5);
  const fr = wolfFrame(k, { hide: feather, foot: 'claw', footMat: beak, talon: ivory });
  for (const side of [1, -1] as const) {
    const { piece, el, ha } = arm(s, side);
    for (let i = 0; i < 5; i++) {
      const p = add(lerp3(el, ha, 0.12 + i * 0.17), [-5, 0, 0]);
      spike(k, feather, piece, [p, add(p, [-7 + i * 0.6, side * 1.5, -1]), add(p, [-14 + i * 1.3, side * 3, -4])], 2.6, 'plume', 0.4);
    }
  }
  claws(k, feather, ivory, 1.1, o);
  const root = from(s.pelvis, s.hips, -8, 0, 2);
  for (const g of [-0.5, 0, 0.5]) spike(k, feather, 'tail', [root, add(root, [-10, Math.sin(g) * 9, -1]), add(root, [-22, Math.sin(g) * 20, -6])], 3.6, 'plume', 0.6);
  const h = headOf(k);
  const { hsc, hk, hp, F } = h;
  hsc.cone(feather, 'head', add(fr.top, [9, 0, 0]), hp(-6, 0, -1), 10, 9.5, 2.6, { tag: 'neck' });
  hsc.ell(feather, 'head', hp(-1, 0, 2), axes(F, 12, 12.5, 11.5), 2.4, { tag: 'skull' });
  for (let i = 0; i < 9; i++) {
    const b = ((i - 4) / 4) * 2.2;
    const c = hp(-8, Math.sin(b) * 12, -1 + Math.cos(b) * 10.5);
    const outw = norm(add(mul(F[1], Math.sin(b)), add(mul(F[2], Math.cos(b)), mul(F[0], -0.7))));
    spike(hk, feather, 'ruff', [c, add(c, mul(outw, 8.5))], 3.4, 'plume', 0.5);
  }
  for (const side of [1, -1]) {
    hsc.ell(face, 'face', hp(8.6, side * 5.4, 1.2), axes(F, 3.2, 6.2, 6.8), 1.0, { tag: 'disc' });
    hsc.ell(glow, 'eye', hp(11.4, side * 5.2, 2.2), axes(F, 1.1, 3.3, 3.3), 0.05, { tag: 'eye' });
    hsc.ell(mouth, 'pupil', hp(12.3, side * 4.9, 2.2), axes(F, 0.7, 1.4, 1.4), 0.05, { tag: 'pupil' });
    hsc.mark(hp(13, side * 5.6, 3), '#ffffff', 1, 1, 0, 0, 2.5);
    hsc.cone(beak, 'brow', hp(6, side * 10, 8), hp(12, side * 1.6, 5), 1.7, 1.3, 0.4, { tag: 'brow' });
    spike(hk, feather, side > 0 ? 'tuftL' : 'tuftR', [hp(4, side * 7, 8), hp(0, side * 13, 17), hp(-5, side * 17, 27)], 3.8, 'plume', 0.3);
  }
  hsc.cone(beak, 'beak', hp(10.5, 0, -1.5), hp(15.5, 0, -4.5), 3, 1.8, 0.6, { tag: 'beak' });
  spike(hk, beak, 'beak', [hp(15.5, 0, -4.5), hp(17, 0, -7.5), hp(15.4, 0, -11)], 1.8, 'beak');
  return o;
}

// ---- 3. THE SCALED: a marsh-green hide of scales; a long flat snout, its teeth meeting down both sides; its eyes up on its
// skull; two rows of horn plates down its back; a heavy tail.
function idea3(k: Kit): Built {
  const { sc, s } = k;
  const o = out0(k);
  const { ivory, glow, mouth } = stuffs(k);
  const SCALE: Ramp = ['#0a120e', '#1a2a20', '#2e4634', '#4e6c4e', '#7a9670'];
  const hide = fleshOf(k, SCALE, (h: Hit) => {
    if (h.tone < 2) return null;
    const u = h.p[0] * 0.42 + h.p[2] * 0.3;
    const v = h.p[1] * 0.42 + h.p[2] * 0.22 + (Math.floor(u) % 2) * 0.5;
    return frac(u) < 0.2 || frac(v) < 0.2 ? tone5(SCALE, h.tone - 1) : null;
  });
  const plate = fleshOf(k, ['#060c0a', '#101c16', '#1e3024', '#344a36', '#506a4e'], undefined, 0.5);
  const fr = wolfFrame(k, { hide, foot: 'claw', footMat: plate, talon: ivory });
  for (let i = 0; i < 8; i++) for (const side of [1, -1]) spike(k, plate, 'scutes', [add(fr.spine(i * 0.36), [0, side * 4.5, 0.5]), add(fr.spine(i * 0.36), [-2.5, side * 5.5, 5.5 - i * 0.3])], 2.4, 'scute', 0.3);
  claws(k, hide, ivory, 1.15, o);
  const pts = tailOf(k, 62, 8, 0.7, 0.3);
  for (let i = 0; i + 1 < pts.length; i++) {
    sc.cone(hide, 'tail', pts[i], pts[i + 1], 7.5 - i * 0.82, 6.7 - i * 0.82, 1.2, { tag: 'tail' });
    spike(k, plate, 'tail', [add(pts[i], [0, 0, 6.5 - i * 0.7]), add(pts[i], [-3, 0, 10.5 - i * 1.0])], 2.0, 'scute', 0.3);
  }
  const h = headOf(k, 16);
  const { hsc, hk, hp, F } = h;
  hsc.cone(hide, 'head', add(fr.top, [9, 0, 0]), hp(-6, 0, -1), 10, 9.5, 2.6, { tag: 'neck' });
  hsc.ell(hide, 'head', hp(-3, 0, 1.5), axes(F, 10.5, 11.5, 8.5), 2.4, { tag: 'skull' });
  hsc.box(hide, 'head', hp(13, 0, -1.5), axes(F, 13, 6.6, 3.2), 2.2, 2.0, { tag: 'snout' });
  hsc.ell(hide, 'head', hp(25, 0, 0.2), axes(F, 2.6, 4.2, 2.4), 0.8, { tag: 'nose' });
  for (const side of [1, -1]) {
    hsc.ell(hide, 'head', hp(1.5, side * 6.6, 7), axes(F, 3.6, 3.2, 2.8), 0.8, { tag: 'brow' });
    eye(hk, glow, hp(4.2, side * 7.6, 7.2), F, side, 2.2, 1.2, 0.2);
    for (let i = 0; i < 8; i++) {
      const f = 3 + i * 2.9;
      const l = side * 6.3 * (1 - i * 0.03);
      hsc.cone(ivory, 'teeth', hp(f, l, -4.2), hp(f, l, -4.2 - (i % 2 ? 3.8 : 2.6)), 1.05, 0.1, 0.1, { tag: 'fang' });
      hsc.cone(ivory, 'teeth', hp(f + 1.45, l * 0.94, -9.2 - i * 0.2), hp(f + 1.45, l * 0.94, -6.2 - i * 0.2), 1.0, 0.1, 0.1, { tag: 'fang' });
    }
  }
  hsc.cone(hide, 'jaw', hp(-3, 0, -7), hp(24, 0, -11.5), 4.6, 2.6, 1.0, { tag: 'jaw' });
  hsc.ell(mouth, 'maw', hp(11, 0, -6.4), axes(F, 12.5, 5.6, 2.4), 0.4, { tag: 'maw' });
  hsc.ell(glow, 'maw', hp(1, 0, -6.6), axes(F, 3.2, 4, 1.8), 0.3, { tag: 'throat' });
  return o;
}

// ---- 4. THE MANY-EYED: a spider's face on the frame. A bristled umber hide; eight eyes, two great and six lesser, all burning;
// no jaw: two heavy fangs hung under them; long bristles standing off its shoulders.
function idea4(k: Kit): Built {
  const { sc, s } = k;
  const o = out0(k);
  const { ivory, glow } = stuffs(k);
  const UMBER: Ramp = ['#0e0a0c', '#241a1c', '#40302e', '#624c44', '#8a7062'];
  const hide = fleshOf(k, UMBER, (h: Hit) => (h.tone >= 2 && hash(h.x * 0.5 + (h.y >> 1), h.y) > 0.8 ? tone5(UMBER, h.tone + 1) : null));
  const dark = fleshOf(k, ['#07060a', '#141014', '#261c20', '#3c2e30', '#584646'], undefined, 0.5);
  const fr = wolfFrame(k, { hide, fore: dark, foreFrom: 0.5, shank: dark, foot: 'claw', footMat: dark, talon: ivory, lean: 0.9 });
  for (let i = 0; i < 12; i++) {
    const side = i % 2 ? 1 : -1;
    const c = add(fr.top, [5 - (i >> 1) * 3.2, side * (5 + ((i * 5) % 4) * 4.2), 7]);
    spike(k, dark, 'bristles', [c, add(c, [-2, side * 2, 7]), add(c, [-6, side * 3.5, 13 + (i % 3) * 2])], 1.2, 'bristle', 0.1);
  }
  claws(k, dark, ivory, 1.15, o);
  const h = headOf(k);
  const { hsc, hk, hp, F } = h;
  hsc.cone(hide, 'head', add(fr.top, [9, 0, 0]), hp(-6, 0, -1), 9, 8.5, 2.6, { tag: 'neck' });
  hsc.ell(hide, 'head', hp(0, 0, 1), axes(F, 12, 12.5, 10.5), 2.4, { tag: 'skull' });
  for (const side of [1, -1]) {
    roundEye(h, glow, hp(10.8, side * 3.5, 1.4), 2.7);
    roundEye(h, glow, hp(8.6, side * 8.6, 4.4), 2.0);
    roundEye(h, glow, hp(7.4, side * 4.4, 8.2), 1.4);
    roundEye(h, glow, hp(3.4, side * 11.8, 4), 1.4);
    hsc.ell(dark, side > 0 ? 'fangL' : 'fangR', hp(9.4, side * 3.8, -6), axes(F, 3.2, 3.2, 4.6), 0.8, { tag: 'jawbase' });
    spike(hk, ivory, side > 0 ? 'fangL' : 'fangR', [hp(10.4, side * 3.8, -9.5), hp(11.6, side * 2.8, -14.5), hp(9.6, side * 0.9, -18.5)], 2.0, 'fang');
    hsc.cone(dark, side > 0 ? 'palpL' : 'palpR', hp(5, side * 9.5, -5), hp(11, side * 11.5, -9.5), 1.9, 1.3, 0.5, { tag: 'palp' });
    hsc.cone(dark, side > 0 ? 'palpL' : 'palpR', hp(11, side * 11.5, -9.5), hp(13.5, side * 9.5, -14), 1.3, 0.3, 0.3, { tag: 'palp' });
  }
  void s;
  return o;
}

// ---- 5. THE ONE EYE: an olive hide; one great eye burning under a single heavy brow, its pupil a slit; a jaw thrust out past
// its lip, two tusks up from it; its horns out from its temples, hooked down and forward beside its jaw.
function idea5(k: Kit): Built {
  const { sc } = k;
  const o = out0(k);
  const { ivory, glow, mouth } = stuffs(k);
  const OLIVE: Ramp = ['#0e100c', '#22261c', '#3c4230', '#5e664a', '#868e6a'];
  const hide = fleshOf(k, OLIVE);
  const horn = fleshOf(k, HORN_BLACK, undefined, 0.5);
  const hornIvory = sc.mat({ ramp: IVORY });
  const fr = wolfFrame(k, { hide, foot: 'hoof', footMat: horn, talon: ivory });
  claws(k, hide, ivory, 1.15, o);
  const pts = tailOf(k, 40, 6, 0.8, 0.4);
  for (let i = 0; i + 1 < pts.length; i++) sc.cone(hide, 'tail', pts[i], pts[i + 1], 4.4 - i * 0.6, 3.8 - i * 0.6, 1.0, { tag: 'tail' });
  const h = headOf(k);
  const { hsc, hk, hp, F } = h;
  hsc.cone(hide, 'head', add(fr.top, [9, 0, 0]), hp(-6, 0, -1), 10, 9.5, 2.6, { tag: 'neck' });
  hsc.ell(hide, 'head', hp(-1, 0, 2), axes(F, 12, 12.5, 11), 2.4, { tag: 'skull' });
  hsc.cone(hide, 'head', hp(7, -10, 8.8), hp(7, 10, 8.8), 3.3, 3.3, 1.0, { tag: 'brow' });
  // (its eye a ball standing out of its socket, so it is seen from every side; its pupil a slit down the front of it)
  hsc.ell(glow, 'eye', hp(9.6, 0, 3), axes(F, 4.8, 5.2, 4.4), 0.05, { tag: 'eye' });
  hsc.ell(mouth, 'pupil', hp(13.9, 0, 3), axes(F, 1.0, 0.9, 3.2), 0.05, { tag: 'pupil' });
  hsc.mark(hp(13.4, -2.6, 5), '#ffffff', 2, 1, 0, 0, 3);
  hsc.ell(hide, 'head', hp(8.5, 0, -4.2), axes(F, 6, 8.2, 4), 1.4, { tag: 'snout' });
  hsc.box(hide, 'jaw', hp(8.8, 0, -10.2), axes(F, 8.8, 9, 3.2), 2.4, 1.2, { tag: 'jaw' });
  hsc.ell(mouth, 'maw', hp(11, 0, -7.2), axes(F, 6.4, 7.6, 1.5), 0.3, { tag: 'maw' });
  teeth(h, ivory, 5, 0.9, 9.5, 7.2, 7, -8.4, 1, 2.8, 2.2);
  for (const side of [1, -1]) {
    spike(hk, ivory, 'teeth', [hp(14.2, side * 7, -9), hp(15.8, side * 8, -5), hp(15.4, side * 8, -1.2)], 2.1, 'fang');
    spike(hk, hornIvory, side > 0 ? 'hornL' : 'hornR', [hp(-2, side * 11, 5), hp(-3, side * 17.5, 1), hp(2, side * 19.5, -6), hp(10, side * 17.5, -9.5), hp(16, side * 14.5, -6.5)], 4.4, 'horn');
  }
  return o;
}

// ---- 6. THE LIVING SHADOW (HIS PICK OF THE TEN, 11 Nov: asked of each, his answers “6”, “6. The Living Shadow (Recommended)”,
// “None of these three”, “No, not 10”): black all through, hardly a form on it; only what burns is seen: two slanted eyes, a
// grin of teeth of light from ear to ear, its claws. Two horns curled like smoke; a tail that thins away into smoke; its
// smoke rising off its horns, its shoulders and its back. FROM BEHIND it has no face to be known by, so his fire shows down
// its backbone: an ember in each knuckle of it.
export function shadowInto(k: Kit): Built {
  const { sc } = k;
  const o = out0(k);
  const { glow } = stuffs(k);
  const hide = sc.mat({ ramp: ['#04040a', '#07070f', '#0c0c1a', '#15152c', '#222244'], crease: 0.25 });
  const fr = wolfFrame(k, { hide, foot: 'claw', footMat: hide, talon: glow });
  claws(k, hide, glow, 1.15, o);
  const ember = sc.mat({ ramp: CYAN, paint: (h) => (h.nl > 0.8 ? '#e8ffff' : CYAN[2]) });
  // (each ember a short bar of his light across a knuckle of its backbone, lying on its skin: found by going out from its
  // backbone until nothing of it is left)
  const body = sc.prims.filter((p) => !p.carve);
  const skinFrom = (c: V3, way: V3): V3 => {
    let d = 0;
    for (let j = 0; j < 60; j++) {
      const q = add(c, mul(way, d));
      const m = Math.min(...body.map((p) => primDist(p, q)));
      if (m > 0.15) break;
      d += Math.max(0.35, -m);
    }
    return add(c, mul(way, d));
  };
  for (let i = 0; i < 8; i++) {
    const t = 0.15 + i * 0.37;
    const back = norm(sub(fr.spine(t + 0.2), fr.spine(Math.max(0, t - 0.2))));
    const outw = norm(cross([0, 1, 0], back));
    sc.ell(ember, 'embers', add(skinFrom(fr.spine(t), outw), mul(outw, 1.4)), [mul(back, 1.6), [0, 3.8 - i * 0.22, 0], mul(outw, 1.9)], 0.05, { tag: 'ember' });
  }
  const pts = tailOf(k, 46, 8, 0.65, 0.9);
  for (let i = 0; i + 1 < pts.length; i++) sc.cone(hide, 'torso', pts[i], pts[i + 1], 3.6 - i * 0.4, 3.2 - i * 0.4, 1.0, { tag: 'tail' });
  const h = headOf(k);
  const { hsc, hk, hp, F } = h;
  hsc.cone(hide, 'torso', add(fr.top, [9, 0, 0]), hp(-6, 0, -1), 10, 9.5, 2.6, { tag: 'neck' });
  hsc.ell(hide, 'torso', hp(-1, 0, 2), axes(F, 12, 12, 11), 2.4, { tag: 'skull' });
  // (a jaw under its grin, hung a little open: the lower teeth stand on it)
  hsc.ell(hide, 'torso', hp(2.5, 0, -8.6), axes(F, 10.6, 10.4, 4), 1.6, { tag: 'jaw' });
  const tips: V3[] = [];
  for (const side of [1, -1]) {
    eye(hk, glow, hp(11.2, side * 4.8, 4.2), F, side, 4.0, 1.8, 0.55);
    const horn: V3[] = [hp(-2, side * 9, 8), hp(-8, side * 15, 16), hp(-7, side * 20, 27), hp(1, side * 19, 36), hp(9, side * 13, 39), hp(13, side * 8, 36)];
    spike(hk, hide, 'torso', horn, 3.4, 'horn', 0.3);
    tips.push(horn[horn.length - 1]);
  }
  for (let i = -6; i <= 6; i++) {
    const a = (i / 6) * 1.5;
    const up = hp(1.5 + Math.cos(a) * 10.9, Math.sin(a) * 10.5, -4.2 + Math.abs(i) * 0.5);
    hsc.cone(glow, 'grin', up, add(up, mul(F[2], -(i % 2 ? 2.4 : 3.6) * HEAD_K)), 1.25, 0.12, 0.1, { tag: 'fang' });
  }
  for (let i = -5; i <= 5; i++) {
    const a = ((i + 0.5) / 6) * 1.5;
    const lo = hp(2.5 + Math.cos(a) * 10.4, Math.sin(a) * 10.2, -9.6 + Math.abs(i) * 0.45);
    hsc.cone(glow, 'grin', lo, add(lo, mul(F[2], (i % 2 ? 2.2 : 3.2) * HEAD_K)), 1.15, 0.12, 0.1, { tag: 'fang' });
  }
  o.smoke = [tips[0], tips[1], pts[pts.length - 1]];
  return o;
}
const idea6 = shadowInto;

// ---- 7. THE SPLIT FACE: a bruise-mauve hide; no jaw: its mouth a gash straight up its face from its chin to its brow, teeth
// meeting across it from both lips, his fire deep in it; three eyes down each side of it; locks of flesh hung from the back of
// its skull.
function idea7(k: Kit): Built {
  const { sc } = k;
  const o = out0(k);
  const { ivory, glow, mouth } = stuffs(k);
  const MAUVE: Ramp = ['#150e18', '#30222f', '#54404f', '#806874', '#ac949c'];
  const hide = fleshOf(k, MAUVE);
  const dark = fleshOf(k, ['#0c080e', '#1e141e', '#362834', '#52404c', '#705c66'], undefined, 0.5);
  const fr = wolfFrame(k, { hide, foot: 'claw', footMat: dark, talon: ivory });
  claws(k, hide, ivory, 1.15, o);
  const h = headOf(k);
  const { hsc, hk, hp, F } = h;
  hsc.cone(hide, 'head', add(fr.top, [9, 0, 0]), hp(-6, 0, -1), 9.5, 9, 2.6, { tag: 'neck' });
  hsc.ell(hide, 'head', hp(-1, 0, 1), axes(F, 11.5, 10.8, 13), 2.4, { tag: 'skull' });
  hsc.ell(mouth, 'maw', hp(9.6, 0, -0.5), axes(F, 3.6, 3.0, 10.5), 0.4, { tag: 'maw' });
  hsc.ell(glow, 'maw', hp(8.2, 0, -0.5), axes(F, 2, 1.4, 7.5), 0.3, { tag: 'throat' });
  for (const side of [1, -1]) {
    hsc.cone(hide, 'head', hp(10.6, side * 3.8, -10.5), hp(10.6, side * 3.8, 9.5), 1.7, 1.7, 0.6, { tag: 'lip' });
    for (let i = 0; i < 7; i++) {
      const u = -9.2 + i * 3 + (side > 0 ? 0 : 1.5);
      hsc.cone(ivory, 'teeth', hp(11.6, side * 3.2, u), hp(12.2, -side * 0.6, u), 1.0, 0.1, 0.1, { tag: 'fang' });
    }
    roundEye(h, glow, hp(9, side * 7.4, 6.4), 1.6);
    roundEye(h, glow, hp(9.6, side * 8, 1.2), 1.6);
    roundEye(h, glow, hp(9, side * 7.4, -4), 1.6);
  }
  for (let j = -2; j <= 2; j++) {
    const root = hp(-9, j * 4.2, 6 - Math.abs(j) * 1.5);
    spike(hk, hide, `lock${j + 2}`, [root, add(root, mul(add(mul(F[0], -9), add(mul(F[1], j * 2.5), mul(U, -3))), HEAD_K)), add(root, mul(add(mul(F[0], -15), add(mul(F[1], j * 4.5), mul(U, -13))), HEAD_K)), add(root, mul(add(mul(F[0], -13), add(mul(F[1], j * 5.5), mul(U, -24))), HEAD_K))], 2.7, 'lock', 0.5);
  }
  return o;
}

// ---- 8. THE GARGOYLE: grey stone, pitted and cracked; a block of a head, a shelf of brow, a square jaw thrust out, two tusks;
// short thick horns; and wings of the same stone, folded round its shoulders like a cloak.
function idea8(k: Kit): Built {
  const { sc } = k;
  const o = out0(k);
  const { ivory, glow, mouth } = stuffs(k);
  const STONE: Ramp = ['#16161c', '#30323a', '#52565e', '#7c8088', '#a8acb2'];
  const pitted = (h: Hit): string | null => {
    const r = hash(h.x, h.y);
    if (h.tone >= 2 && r > 0.9) return tone5(STONE, h.tone - 1);
    if (h.tone >= 2 && r < 0.05) return tone5(STONE, h.tone + 1);
    // (cracks: thin dark lines where a slow wave crosses nothing)
    return Math.abs(Math.sin(h.p[0] * 0.21 + h.p[2] * 0.17) + Math.sin(h.p[1] * 0.19 - h.p[2] * 0.13)) < 0.035 ? tone5(STONE, h.tone - 2) : null;
  };
  const hide = fleshOf(k, STONE, pitted);
  const wing = fleshOf(k, ['#101016', '#24262e', '#3e424a', '#5e626a', '#82868e'], pitted, 0.4);
  const fr = wolfFrame(k, { hide, foot: 'claw', footMat: hide, talon: ivory });
  cloakWings(k, wing, hide, ivory, fr, 1.0);
  claws(k, hide, ivory, 1.15, o);
  const pts = tailOf(k, 44, 6, 0.8, 0.4);
  for (let i = 0; i + 1 < pts.length; i++) sc.cone(hide, 'tail', pts[i], pts[i + 1], 4.8 - i * 0.6, 4.2 - i * 0.6, 1.0, { tag: 'tail' });
  const h = headOf(k);
  const { hsc, hk, hp, F } = h;
  hsc.cone(hide, 'head', add(fr.top, [9, 0, 0]), hp(-6, 0, -1), 10, 9.5, 2.6, { tag: 'neck' });
  hsc.box(hide, 'head', hp(-1, 0, 2), axes(F, 11, 11.5, 10), 4, 2.0, { tag: 'skull' });
  hsc.box(hide, 'head', hp(8.4, 0, 6.6), axes(F, 3.4, 11, 2.6), 1.4, 0.8, { tag: 'brow' });
  hsc.ell(hide, 'head', hp(12.6, 0, 0.6), axes(F, 2.8, 3.6, 2.6), 0.8, { tag: 'nose' });
  hsc.box(hide, 'jaw', hp(8, 0, -8.8), axes(F, 9.2, 9.6, 3.4), 2, 1.2, { tag: 'jaw' });
  hsc.ell(mouth, 'maw', hp(12, 0, -5.2), axes(F, 5.4, 8.2, 1.2), 0.3, { tag: 'maw' });
  for (const side of [1, -1]) {
    hsc.ell(hide, 'head', hp(11, side * 5.6, 3), axes(F, 3, 3.4, 2.2), 0.4, { carve: true });
    eye(hk, glow, hp(10.2, side * 5.4, 2.8), F, side, 2.4, 1.2, 0.35);
    spike(hk, ivory, 'teeth', [hp(15, side * 5.6, -7.2), hp(16.2, side * 6.2, -1.6)], 1.9, 'fang');
    spike(hk, hide, side > 0 ? 'hornL' : 'hornR', [hp(2, side * 8, 9), hp(6, side * 11.5, 16), hp(12.5, side * 11.5, 20.5)], 4.0, 'horn', 0.4);
    hsc.cone(hide, 'head', hp(-4, side * 12, 3), hp(-12.5, side * 17.5, 8.5), 3.0, 0.4, 0.8, { tag: 'ear' });
  }
  return o;
}

// ---- 9. THE ANGLER: a deep-water blue-black hide; a great underjaw thrust out, long needles up out of it past its lip; small
// pale eyes; a stalk up off its brow and over, HIS FIRE BURNING AT ITS END, its lure; a fin of spines down its back.
function idea9(k: Kit): Built {
  const { sc } = k;
  const o = out0(k);
  const { ivory, glow, mouth } = stuffs(k);
  const DEEP: Ramp = ['#06080f', '#101624', '#1e2a40', '#34466a', '#506896'];
  const hide = fleshOf(k, DEEP);
  const fin = fleshOf(k, ['#0a1420', '#162a3c', '#264a5e', '#3e7286', '#62a0ae'], undefined, 0.3);
  const fr = wolfFrame(k, { hide, foot: 'claw', footMat: hide, talon: ivory });
  const tipOf = (i: number): V3 => add(fr.spine(0.2 + i * 0.44), [-5 - i * 0.5, 0, 16 - i * 1.6]);
  for (let i = 0; i < 6; i++) {
    spike(k, ivory, 'fin', [fr.spine(0.2 + i * 0.44), tipOf(i)], 1.3, 'ray', 0.2);
    if (i < 5) {
      sc.tri(fin, 'fin', fr.spine(0.2 + i * 0.44), tipOf(i), lerp3(tipOf(i), tipOf(i + 1), 0.5), 0.5, 0.3, { tag: 'web' });
      sc.tri(fin, 'fin', fr.spine(0.2 + i * 0.44), lerp3(tipOf(i), tipOf(i + 1), 0.5), fr.spine(0.2 + (i + 1) * 0.44), 0.5, 0.3, { tag: 'web' });
    }
  }
  claws(k, hide, ivory, 1.15, o);
  const pts = tailOf(k, 46, 7, 0.7, 0.5);
  for (let i = 0; i + 1 < pts.length; i++) sc.cone(hide, 'tail', pts[i], pts[i + 1], 4.6 - i * 0.55, 4 - i * 0.55, 1.0, { tag: 'tail' });
  const h = headOf(k);
  const { hsc, hk, hp, F } = h;
  hsc.cone(hide, 'head', add(fr.top, [9, 0, 0]), hp(-6, 0, -1), 10, 9.5, 2.6, { tag: 'neck' });
  hsc.ell(hide, 'head', hp(-1, 0, 1), axes(F, 12.5, 12.5, 11), 2.4, { tag: 'skull' });
  hsc.ell(hide, 'head', hp(9, 0, -2), axes(F, 5, 8.8, 3.2), 1.2, { tag: 'lip' });
  hsc.box(hide, 'jaw', hp(8, 0, -11), axes(F, 11, 10.5, 3.6), 3, 1.2, { tag: 'jaw' });
  hsc.ell(mouth, 'maw', hp(9.5, 0, -7), axes(F, 9.5, 9, 2.4), 0.3, { tag: 'maw' });
  hsc.ell(glow, 'maw', hp(4, 0, -7.4), axes(F, 3, 4.4, 1.6), 0.3, { tag: 'throat' });
  teeth(h, ivory, 9, 1.45, 8, 10.4, 9.8, -8.6, 1, 8, 5.4, 0.95);
  teeth(h, ivory, 7, 1.2, 8.5, 5.4, 8, -4.6, -1, 3.4, 2.4, 0.9);
  for (const side of [1, -1]) roundEye(h, glow, hp(9.8, side * 7.6, 4.6), 1.3);
  spike(hk, hide, 'lure', [hp(4, 0, 10), hp(8, 0, 20), hp(16, 0, 25.5), hp(23, 0, 22.5)], 1.7, 'stalk', 0.6);
  hsc.ell(glow, 'lure', hp(24.5, 0, 21), axes(F, 2.4, 2.4, 2.4), 0.2, { tag: 'lure' });
  o.flames.push({ p: hp(24.5, 0, 22.5), size: 3.4, deep: 40 });
  return o;
}

// ---- 10. THE OBSIDIAN: black glass, cut in facets, each plane its own tone and the brightest a hard blue-white; a crown of
// long shards up off its skull, shards off its shoulders and elbows; two slits of his light for eyes, a jagged crack of it for
// a mouth.
function idea10(k: Kit): Built {
  const { sc, s } = k;
  const o = out0(k);
  const { glow } = stuffs(k);
  const GLASS: Ramp = ['#07060e', '#14122a', '#2a2650', '#5a58a0', '#c8d4ff'];
  const Lf = norm([0.35, 0.5, 0.8]);
  const hide = sc.mat({
    ramp: GLASS,
    crease: 0.3,
    paint: (h: Hit) => {
      const q = 2.1;
      const sn = norm([Math.round(h.n[0] * q) / q, Math.round(h.n[1] * q) / q, Math.round(h.n[2] * q) / q]);
      const nl = dot(sn, Lf);
      const tone = nl > 0.9 ? 4 : nl > 0.6 ? 3 : nl > 0.2 ? 2 : nl > -0.2 ? 1 : 0;
      return tone5(GLASS, tone - (k.far(h.prim.piece) ? 1 : 0));
    },
  });
  const fr = wolfFrame(k, { hide, foot: 'claw', footMat: hide, talon: hide });
  for (const side of [1, -1] as const) {
    const { piece, sh, el } = arm(s, side);
    for (let i = 0; i < 3; i++) spike(k, hide, piece, [add(sh, [-3 + i * 3, side * (2 + i * 2), 8]), add(sh, [-6 + i * 3.5, side * (6 + i * 4), 19 - i * 3.5])], 3.2 - i * 0.4, 'shard', 0.2);
    spike(k, hide, piece, [add(el, [-4, 0, 1]), add(el, [-13, side * 2, 6])], 2.8, 'shard', 0.2);
  }
  claws(k, hide, hide, 1.15, o);
  const h = headOf(k);
  const { hsc, hk, hp, F } = h;
  hsc.cone(hide, 'head', add(fr.top, [9, 0, 0]), hp(-6, 0, -1), 9.5, 9, 2.6, { tag: 'neck' });
  hsc.box(hide, 'head', hp(-1, 0, 2), axes(F, 11, 10.5, 10), 1.6, 1.6, { tag: 'skull' });
  hsc.box(hide, 'head', hp(9.5, 0, -4), axes(F, 5.5, 6.5, 5), 1.2, 1.2, { tag: 'snout' });
  const crown: [number, number, number, number, number][] = [[-2, 0, 20, 3.2, 0], [-1, 6, 15, 2.8, 0.35], [-1, -6.5, 17, 2.8, -0.35], [-5, 10.5, 11, 2.4, 0.7], [-5, -10.5, 12, 2.4, -0.7], [-8, 3, 14, 2.4, 0.15], [-8, -3.5, 12, 2.4, -0.2]];
  for (const [f, l, long, r, lean] of crown) {
    const root = hp(f, l, 9 - Math.abs(l) * 0.25);
    const way = norm(add(mul(F[2], 1), add(mul(F[1], lean), mul(F[0], -0.3))));
    spike(hk, hide, 'crown', [root, add(root, mul(way, long * HEAD_K))], r, 'shard', 0.2);
  }
  for (const side of [1, -1]) eye(hk, glow, hp(10.4, side * 5.4, 3.2), F, side, 2.8, 1.0, 0.6);
  for (let i = -4; i <= 4; i++) {
    const c = hp(15.4 - Math.abs(i) * 0.25, i * 1.5, -5.4 + (i % 2 ? 1.3 : -0.7));
    hsc.ell(glow, 'crack', c, axes(F, 1.1, 1.3, 1.1), 0.05, { tag: 'crack' });
  }
  return o;
}

const BUILDERS = [idea1, idea2, idea3, idea4, idea5, idea6, idea7, idea8, idea9, idea10];

/** The Living Shadow, his pick, at a moment: on the werewolf's frame in a pose, from in front or behind, turned `turn`. */
export function shadowFrame(view: GameView, pose: Bones, turn = 0, t = 2, tail = 0, paws = false): Drawn {
  return paintDemon(shadowInto, view, pose, turn, t, tail, paws);
}
/** One of the ten ideas (1 to 10) at a moment: on the werewolf's frame in a pose, from in front or behind, turned `turn`. */
export function ideaFrame(n: number, view: GameView, pose: Bones, turn = 0, t = 2, tail = 0, paws = false): Drawn {
  return paintDemon(BUILDERS[n - 1], view, pose, turn, t, tail, paws);
}
void WORLD;

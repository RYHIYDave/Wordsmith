// THE OPENING'S PEOPLE (art/opening.ts), each built on one human body at a man's true proportions (art/anatomy.ts) and
// dressed over it, each as the game has him:
//   THE KNIGHT (the hero; art/hero3_knight.ts): over all his head a round helm of steel with a pointed visor, the two slots
//     he sees through over it with a point of light in each; mail at his neck; the red tabard over his trunk, its skirt to
//     his knees cut in points, a plum belt with a buckle of cyan; mail on his arms and thighs, steel caps over his shoulders
//     wider than his arms, steel at his elbows, forearms, knees, shins and feet; plum gloves; the dark red scarf wound thick
//     round his neck, its ends flying; the great sword, its blade lit cyan.
//   THE TOWN'S WORDSMITH (art/smith3.ts): a teal cowl open over his face, a long white beard and heavy brows, cyan eyes, a
//     night-blue robe, a teal mantle, runes burning cyan on its bands.
//   THE OLD WORDSMITH (the fallen wordsmith, art/body.ts): the wordsmiths' teal hood, peaked, and mantle; a brown robe; his
//     book at his hip; a lean face, a short grey beard; his staff, its head burning cyan, held in both hands.
//   THE ARMOURER (art/townsfolk.ts): a smith, heavy and broad, bald, a great pale beard; a teal shirt, its sleeves rolled
//     over his great forearms; a leather apron.
//   THE MYSTIC (art/townsfolk.ts): a seller of charms; a long robe of the mage's purple, a sash of gold, chains of gold at his
//     neck; a great pale turban wound round his head with a stone in it; a veil under his eyes; his crystal.
//   THE STRANGER (art/townsfolk.ts): a long dark cloak, the hood down over his face, two points of gold all that is seen of it.
//   A CULTIST (art/cultists.ts): a robe of the cult's violet girded up to his knees with a rope, a deep cowl with a point,
//     two slanting slashes of pink for eyes in its dark, a pink stole, bony forearms, a long wavy dagger of bone.
// Each is built where he stands (his feet about the origin, facing -y); a scene turns and places him with its camera.

import { Figure } from './sdf';
import type { V3 } from './comic';
import { INK } from './comic';
import { at as onFrame, frameAt, hand, onChest, onHead, pose, sculptBody, sculptFoot } from './anatomy';
import type { Body, Build, Pose } from './anatomy';

const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const lerp = (a: V3, b: V3, u: number): V3 => add(a, mul(sub(b, a), u));
const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (a: V3): V3 => mul(a, 1 / (Math.hypot(a[0], a[1], a[2]) || 1));
const len = (a: V3): number => Math.hypot(a[0], a[1], a[2]);
const ax3 = (x: V3, y: V3, z: V3): readonly [V3, V3, V3] => [x, y, z];

/** The friend's eyes: two points of cyan light. */
export const CYAN_EYES = ['#b8fff8', '#22d0e0', '#0c6a80'];
/** The stranger's: gold, as in the game. */
export const GOLD_EYES = ['#ffd866', '#d09a20', '#7a5210'];

// ---------------------------------------------------------------------------------------------
// WHAT THEY ARE MADE OF (each a run of tones, darkest first)

const T = {
  skinLight: [INK, '#3a2430', '#6a4248', '#9a6a66', '#c8988a', '#ecc6b0', '#fde2d2'],
  skinOld: [INK, '#2e2232', '#5a4250', '#8a6a72', '#b8968e', '#dcc0b4', '#f2e0d6'],
  skinDark: [INK, '#24141a', '#46282c', '#6e4438', '#9a6a52', '#c09276', '#e0b89c'],
  skinBone: [INK, '#2e2638', '#4e4458', '#7a6e86', '#a89cb4', '#d0c6dc', '#f0e8f4'],
  white: [INK, '#4a4660', '#7e7a96', '#aeaac4', '#d8d4e8', '#f2eef8', '#ffffff'],
  grey: [INK, '#2e2c3a', '#4e4a5e', '#76728a', '#9e9ab0', '#c4c0d4'],
  steel: [INK, '#22204e', '#3a3478', '#5a54a0', '#7a74c8', '#a8a2e8', '#d6d0ff', '#ffffff'],
  mail: [INK, '#1a1840', '#28245a', '#3a3676', '#4a4690', '#7e7ac0', '#a8a4e0'],
  red: [INK, '#3a0810', '#6a1020', '#8a1624', '#a01c28', '#d02a30', '#ff7058'],
  wine: [INK, '#24040e', '#3c0818', '#541020', '#661020', '#8e1428', '#c83040'],
  plum: [INK, '#24102a', '#3a1c40', '#54304e', '#6e3a5c', '#a8607a', '#c88aa0'],
  blade: [INK, '#0c6a80', '#22d0e0', '#8af6f0', '#ffffff'],
  nightBlue: [INK, '#0e0c26', '#1a1642', '#24205a', '#2c2870', '#4844a2', '#7672d0'],
  teal: [INK, '#08283a', '#0c3a4e', '#125462', '#16707e', '#2aa4a6', '#46c2bc'],
  tealOld: [INK, '#071a1e', '#0e2a30', '#16383e', '#1a4448', '#2a6a6c', '#46928e'],
  brown: [INK, '#24160e', '#3a2618', '#4a3220', '#5a3c24', '#7e5a38', '#a8825a'],
  leather: [INK, '#1a0e08', '#40261a', '#583420', '#704628', '#a06c40', '#c08a58'],
  shirt: [INK, '#03141c', '#0a3644', '#104a58', '#186270', '#3a9a94', '#5ab8b0'],
  wood: [INK, '#24180e', '#3c2818', '#4c3420', '#5c3e24', '#86603a', '#a87e50'],
  purple: [INK, '#1a0a2a', '#36164e', '#46205e', '#562a78', '#7a46a0', '#a676c8'],
  gold: ['#3a2a08', '#7a5210', '#b07a18', '#d09a20', '#e8c060', '#fff3b0'],
  pale: [INK, '#5a6070', '#8a96a6', '#aab8c4', '#c8d6de', '#e4eef2', '#ffffff'],
  veil: [INK, '#1e1030', '#2e1a46', '#3a2058', '#5a3a86', '#8a6ab8', '#c0a8e0'],
  cloak: [INK, '#141020', '#1e1a2c', '#2a2440', '#3a3250', '#564c70', '#7a6e96'],
  boot: [INK, '#1a100a', '#2e1e14', '#3e2a1a', '#4a3220', '#6e4c30', '#8e6a44'],
  violet: [INK, '#1e1030', '#341a4e', '#40205c', '#4e2a6e', '#6e3e8e', '#a86a9e'],
  pink: [INK, '#4a0c2a', '#7a1a44', '#9a2254', '#b02a60', '#e04a88', '#ff8ab8'],
  rag: [INK, '#120c16', '#221826', '#2a1e2e', '#342636', '#4a3a48', '#6a5662'],
  rope: [INK, '#2a1a10', '#4a3420', '#5e4430', '#6e5434', '#94784c'],
  ivory: [INK, '#4a4030', '#8a7c60', '#c8b890', '#efe4c4', '#ffffff'],
  dark: [INK, INK, '#0a0812', '#0e0a16'],
} as const;

// ---------------------------------------------------------------------------------------------
// CLOTHES, worn over a body

/**
 * A ROBE over the body: its trunk a little fuller than the body's, its skirt falling from the waist to `hem` (a height above
 * the ground), wider at the foot (`flare`), hanging round each leg as he stands or strides, folds running down it.
 */
function skirt(f: Figure, st: number, b: Body, hem: number, flare: number, folds = 6, wind: V3 = [0, 0, 0]): void {
  const k = b.k;
  const ground = Math.min(b.ankles[0][2], b.ankles[1][2]) - 0.75 * k;
  const footMid = lerp(b.ankles[0], b.ankles[1], 0.5);
  const hemC: V3 = add([footMid[0], footMid[1], ground + hem], wind);
  f.rod(st, b.waist, hemC, 1.25 * k * b.B.heavy ** 0.7, flare * k, 0.5);
  // (round each leg, so that a stride shows through it)
  for (const j of [0, 1] as const) {
    const ank = b.ankles[j];
    const foot: V3 = add([ank[0], ank[1], Math.max(ground + hem, ank[2] - 0.2 * k)], mul(wind, 0.6));
    f.rod(st, b.hips[j], b.knees[j], 0.95 * k, 0.85 * k, 0.6);
    if (ank[2] - 0.75 * k < ground + hem + 0.1) f.rod(st, b.knees[j], foot, 0.85 * k, flare * 0.6 * k, 0.6);
  }
  for (let i = 0; i < folds; i++) {
    const an = -1.3 + (i / Math.max(1, folds - 1)) * 2.6;
    const d = add(mul(b.across, Math.sin(an)), mul(b.fwd, Math.cos(an)));
    f.rod(st, add(lerp(b.waist, hemC, 0.25), mul(d, 1.3 * k)), add(hemC, mul(d, flare * k * 1.02)), 0.06 * k, 0.11 * k, 0.06, true);
  }
}

/** Sleeves over the arms: wide ones falling open to the wrist (a bell), or rolled up over the elbow. */
function sleeves(f: Figure, st: number, b: Body, kind: 'bell' | 'rolled' | 'long'): void {
  const k = b.k;
  for (const j of [0, 1] as const) {
    const sh = b.shoulders[j];
    const el = b.elbows[j];
    const wr = b.wrists[j];
    f.egg(st, sh, [0.7 * k, 0.72 * k, 0.74 * k], ax3(b.across, mul(b.fwd, -1), b.up), 0.5);
    if (kind === 'rolled') {
      const end = lerp(sh, el, 0.82);
      f.rod(st, sh, end, 0.62 * k, 0.55 * k, 0.4);
      // (the roll: a thick band of cloth turned up round the arm, lumpy)
      const ua = unit(sub(el, sh));
      const F = frameAt(end, ua, b.fwd);
      for (let i = 0; i < 7; i++) {
        const an = (i / 7) * Math.PI * 2;
        f.egg(st, onFrame(F, Math.cos(an) * 0.52 * k, Math.sin(an) * 0.52 * k, (i % 2 ? 0.04 : -0.04) * k), [0.24 * k, 0.24 * k, 0.2 * k], ax3(F.x, F.y, F.z), 0.2);
      }
    } else {
      f.rod(st, sh, el, 0.62 * k, 0.6 * k, 0.4);
      const wide = kind === 'bell' ? 0.95 : 0.55;
      const cuff = lerp(el, wr, 0.92);
      f.rod(st, el, cuff, 0.58 * k, wide * k, 0.35);
      // (the sleeve's mouth: hollowed, so that it is cloth and not a log)
      f.rod(st, lerp(el, wr, 1.08), lerp(el, wr, 0.8), wide * 0.75 * k, wide * 0.55 * k, 0.1, true);
    }
  }
}

/**
 * A HOOD or COWL round the head: fuller than the skull, open over the face, falling onto the shoulders; peaked behind (the
 * old wordsmith's, a cultist's point) or round. `deep`: how far the face is sunk in it (the stranger's, a cultist's: dark).
 */
function hood(f: Figure, st: number, b: Body, o: { peak?: number; open?: number; deep?: number; brim?: boolean }): void {
  const k = b.k;
  const HA = ax3(b.hacross, mul(b.hfwd, -1), b.hup);
  f.egg(st, onHead(b, 0, -0.22, 0.28), [1.12 * k, 1.28 * k, 1.28 * k], HA, 0.5);
  f.egg(st, onChest(b, 0, -0.05, 1.45), [1.75 * k, 1.3 * k, 0.62 * k], ax3(b.across, mul(b.fwd, -1), b.up), 0.6);
  if (o.brim) f.egg(st, onHead(b, 0, 0.62, 0.32), [0.98 * k, 0.42 * k, 1.05 * k], HA, 0.35);
  const open = o.open ?? 0.72;
  const deep = o.deep ?? 0;
  f.egg(st, onHead(b, 0, 1.0 + (o.brim ? 0.2 : 0) - deep * 0.4, -0.12), [open * k, 0.78 * k, (open + 0.25) * k], HA, 0.14, true);
  if (o.peak) {
    f.rod(st, onHead(b, 0, -0.55, 1.15), onHead(b, 0, -1.25 - o.peak * 0.4, 0.75 + o.peak * 0.5), 0.5 * k, 0.06 * k, 0.45);
  }
}

/** A BEARD: from the jaw and cheeks, down the chest to `to` (a share of the way to the belt), parted a little; a moustache. */
function beard(f: Figure, st: number, b: Body, o: { to: number; full: number; moustache?: boolean; sway?: number }): void {
  const k = b.k;
  const HA = ax3(b.hacross, mul(b.hfwd, -1), b.hup);
  f.egg(st, onHead(b, 0, 0.5, -0.72), [0.66 * k * o.full, 0.42 * k, 0.55 * k], HA, 0.35);
  for (const s of [-1, 1]) f.egg(st, onHead(b, s * 0.52, 0.42, -0.35), [0.25 * k * o.full, 0.25 * k, 0.4 * k], HA, 0.3);
  if (o.moustache !== false) {
    for (const s of [-1, 1]) {
      f.rod(st, onHead(b, s * 0.05, 0.96, -0.5), onHead(b, s * 0.42, 0.86, -0.72), 0.12 * k, 0.08 * k, 0.12);
      f.rod(st, onHead(b, s * 0.42, 0.86, -0.72), onHead(b, s * 0.5, 0.78, -1.05), 0.08 * k, 0.05 * k, 0.1);
    }
  }
  const chin = onHead(b, 0, 0.78, -1.12);
  const end = add(lerp(onChest(b, 0, 1.3, 0.6), b.waist, o.to), mul(b.fwd, 0.6 * k * (1 - o.to)));
  const mid = add(lerp(chin, end, 0.5), add(mul(b.fwd, 0.15 * k), mul(b.across, (o.sway ?? 0) * k)));
  f.rod(st, chin, mid, 0.5 * k * o.full, 0.38 * k * o.full, 0.35);
  f.rod(st, mid, end, 0.38 * k * o.full, 0.08 * k, 0.35);
  for (const x of [-0.25, -0.08, 0.1, 0.26]) f.line([add(chin, mul(b.hacross, x * k * 1.6)), add(mid, mul(b.hacross, x * k)), add(end, mul(b.hacross, x * k * 0.3))], '#6a6680', 1);
}

// ---------------------------------------------------------------------------------------------
// THE PEOPLE

/** A standing pose, the hands hanging at the sides: a start to change from. */
export function standing(B: Build, over: Partial<Pose> = {}): Pose {
  const k = B.tall / 17.6;
  return { hands: [[-2.25 * k * B.broad, -0.15 * k, 8.3 * k], [2.25 * k * B.broad, -0.15 * k, 8.3 * k]], ...over };
}

/** THE KNIGHT. `sword`: the great sword from his `hand` (0 right, 1 left) to `tip`, or on his back (null). */
export function knight(f: Figure, P: Pose, sword: { hand: 0 | 1; tip: V3 } | null, flap = 0): Body {
  const B: Build = { tall: 18.2, broad: 1.12, heavy: 1.1 };
  const b = pose(B, P);
  const k = b.k;
  const TA = ax3(b.across, mul(b.fwd, -1), b.up);
  const HA = ax3(b.hacross, mul(b.hfwd, -1), b.hup);
  const red = f.stuff({ tones: T.red, hatch: 4, crease: 0.8 });
  const wine = f.stuff({ tones: T.wine, crease: 0.8 });
  const mail = f.stuff({ tones: T.mail, crease: 0.8, paint: (q, _n, v) => ((Math.round(q[2] * 7) + Math.round(q[0] * 7 + q[1] * 3)) % 2 === 0 && v > 0.3 && v < 0.8 ? '#28245a' : null) });
  const steel = f.stuff({ tones: T.steel, shine: 0.7, crease: 0.7 });
  const plum = f.stuff({ tones: T.plum, crease: 0.5 });
  const blade = f.stuff({ tones: T.blade, shine: 0.5 });
  // the body in its mail and plate: mail at the neck, arms and thighs, the tabard over the trunk, steel at the shins and feet
  sculptBody(f, mail, b, {
    face: false, skull: false, hands: false,
    as: { trunk: { stuff: red, grow: 1.05 }, arms: { stuff: mail, grow: 1.08 }, forearms: { stuff: steel, grow: 1.12 }, legs: { stuff: mail, grow: 1.05 }, shins: { stuff: steel, grow: 1.15 }, feet: { stuff: steel, grow: 1.12 } },
  });
  // the tabard's skirt to his knees, cut into points at its hem; the belt and its buckle
  skirt(f, red, b, 4.4 * k, 1.75, 4);
  const hemZ = Math.min(b.ankles[0][2], b.ankles[1][2]) - 0.75 * k + 4.4 * k;
  const footMid = lerp(b.ankles[0], b.ankles[1], 0.5);
  for (let i = 0; i < 12; i++) {
    const an = (i / 12) * Math.PI * 2 + 0.26;
    const d = add(mul(b.across, Math.cos(an) * 1.85 * k), mul(b.fwd, Math.sin(an) * 1.7 * k));
    f.rod(red, add([footMid[0], footMid[1], hemZ - 0.3 * k], d), add([footMid[0], footMid[1], hemZ + 0.55 * k], mul(d, 0.95)), 0.26 * k, 0.02 * k, 0.05, true);
  }
  f.egg(plum, b.waist, [1.32 * k, 1.14 * k, 0.2 * k], TA, 0.08);
  f.block(steel, add(b.waist, mul(b.fwd, 1.12 * k)), [0.24 * k, 0.07 * k, 0.18 * k], 0.04 * k, TA, 0.02);
  f.mark(add(b.waist, mul(b.fwd, 1.2 * k)), CYAN_EYES, 2);
  // steel caps over his shoulders, wider than his arms; cops at his elbows and knees; his gloves
  for (const j of [0, 1] as const) {
    const s = j ? 1 : -1;
    f.egg(steel, add(add(b.shoulders[j], mul(b.up, 0.32 * k)), mul(b.across, s * 0.2 * k)), [1.0 * k, 0.92 * k, 0.6 * k], TA, 0.15);
    f.egg(steel, add(add(b.shoulders[j], mul(b.up, -0.25 * k)), mul(b.across, s * 0.45 * k)), [0.82 * k, 0.78 * k, 0.45 * k], TA, 0.15);
    f.egg(steel, b.elbows[j], [0.48 * k, 0.48 * k, 0.48 * k], TA, 0.1);
    f.egg(steel, add(b.knees[j], mul(b.fwd, 0.25 * k)), [0.55 * k, 0.45 * k, 0.55 * k], TA, 0.1);
    const holds = sword && sword.hand === j;
    hand(f, plum, holds ? frameAt(b.wrists[j], b.handFrames[j].z, cross(b.handFrames[j].z, unit(sub(sword!.tip, b.wrists[j])))) : b.handFrames[j], 1.2 * k, holds ? 'grip' : 'fist');
  }
  // the scarf wound thick round his neck, hiding his chin; its two ends flying from the back of it
  f.egg(wine, onChest(b, 0, 0.05, 1.62), [1.2 * k, 1.12 * k, 0.5 * k], TA, 0.3);
  const knot = onChest(b, 0, -0.9, 1.6);
  for (const [k1, k2] of [[0, 0.2], [0.3, -0.25]] as const) {
    const t1 = add(knot, add(mul(b.fwd, (-1.2 - k1) * k), add(mul(b.across, (1.4 + k1) * k), [0, 0, (-0.4 + flap * 0.4 + k2) * k])));
    const t2 = add(t1, add(mul(b.fwd, -0.7 * k), add(mul(b.across, 1.5 * k), [0, 0, (0.5 - flap + k2) * k])));
    f.rod(wine, knot, t1, 0.34 * k, 0.28 * k, 0.3);
    f.rod(wine, t1, t2, 0.28 * k, 0.1 * k, 0.25);
  }
  // HIS HELM over all of his head: a round skull of steel; the pointed visor out from his face; the slots; the breathing holes
  f.rod(mail, onHead(b, 0, -0.1, -0.9), onChest(b, 0, 0, 1.6), 0.7 * k, 0.75 * k, 0.4);
  f.egg(steel, onHead(b, 0, -0.08, 0.2), [0.98 * k, 1.12 * k, 1.12 * k], HA, 0.3);
  const root = onHead(b, 0, 0.62, -0.32);
  const point = onHead(b, 0, 1.62, -0.62);
  f.rod(steel, root, point, 0.62 * k, 0.1 * k, 0.3);
  f.line([onHead(b, 0, 1.0, 0.5), onHead(b, 0, 0.6, 1.0), onHead(b, 0, -0.1, 1.3)], '#3a3478', 1);
  for (const s of [-1, 1]) {
    const slot: V3[] = [];
    for (let i = 0; i <= 4; i++) {
      const az = s * (0.16 + i * 0.12);
      slot.push(onHead(b, Math.sin(az) * 0.99, Math.cos(az) * 1.08 - 0.08, 0.2));
    }
    f.line(slot, INK, 2);
    f.mark(onHead(b, Math.sin(s * 0.34) * 1.02, Math.cos(s * 0.34) * 1.1 - 0.08, 0.22), ['#7af8f0', '#22d0e0', '#0c6a80'], 2);
  }
  for (const [x, z] of [[0, 0], [-0.13, -0.07], [0.13, -0.07], [0, -0.15]] as const) f.mark(onHead(b, x, 1.22, -0.42 + z), [INK], 1);
  // THE GREAT SWORD
  if (sword) {
    const fist = b.wrists[sword.hand];
    const fz = b.handFrames[sword.hand].z;
    const grip = add(fist, mul(fz, 0.75 * k));
    const dir = unit(sub(sword.tip, grip));
    const side = unit(cross(dir, Math.abs(dir[2]) > 0.9 ? [1, 0, 0] : [0, 0, 1]));
    const G = add(grip, mul(dir, 0.55 * k));
    const SA = ax3(side, cross(dir, side), dir);
    f.egg(steel, add(grip, mul(dir, -0.75 * k)), [0.24 * k, 0.09 * k, 0.24 * k], SA, 0.02);
    f.rod(plum, add(grip, mul(dir, -0.65 * k)), G, 0.12 * k, 0.12 * k, 0);
    f.rod(steel, add(G, mul(side, -0.8 * k)), add(G, mul(side, 0.8 * k)), 0.11 * k, 0.11 * k, 0);
    for (const e of [-1, 1]) f.rod(steel, add(G, mul(side, e * 0.8 * k)), add(add(G, mul(side, e * 0.95 * k)), mul(dir, 0.18 * k)), 0.11 * k, 0.08 * k, 0.04);
    const bl = len(sub(sword.tip, G));
    f.block(blade, add(G, mul(dir, bl * 0.45)), [0.26 * k, 0.06 * k, bl * 0.43], 0.05 * k, SA, 0);
    f.egg(blade, add(G, mul(dir, bl * 0.87)), [0.26 * k, 0.06 * k, bl * 0.14], SA, 0.05);
    f.line([add(G, mul(dir, 0.4 * k)), add(G, mul(dir, bl * 0.75))], '#0c6a80', 1);
  }
  return b;
}

/** THE TOWN'S WORDSMITH. `palm`: his right hand out, palm up (a rune to burn over it); else his hands at rest. */
export function townWordsmith(f: Figure, P: Pose, o: { palm?: boolean; sway?: number } = {}): Body {
  const B: Build = { tall: 17.4, broad: 0.98, heavy: 0.95 };
  const b = pose(B, P);
  const k = b.k;
  const TA = ax3(b.across, mul(b.fwd, -1), b.up);
  const skin = f.stuff({ tones: T.skinOld, hatch: 4, crease: 0.5 });
  const robe = f.stuff({ tones: T.nightBlue, hatch: 4, crease: 0.8 });
  const teal = f.stuff({ tones: T.teal, crease: 0.8, paint: (q) => (runeOn(q) ? '#e6ffff' : null) });
  const white = f.stuff({ tones: T.white, meld: true, crease: 0.35 });
  const brow = f.stuff({ tones: T.grey, meld: true, crease: 0.4 });
  /** The runes on his mantle's two bands hanging before him: glyphs down each, read in the trunk's own lines. */
  function runeOn(q: V3): boolean {
    const d = sub(q, b.chest);
    const a = dot(d, b.across) / k;
    const fw = dot(d, b.fwd) / k;
    const z = dot(d, b.up) / k;
    if (fw < 0.9 || z > 0.9 || z < -3.6 || Math.abs(Math.abs(a) - 0.72) > 0.22) return false;
    const u = Math.round((Math.abs(a) - 0.72) / 0.11);
    const v = Math.round((z + 3.6) / 0.11);
    const row = v % 7;
    if (row > 4) return false;
    const runes = ['.#.##.#.#.#.##.', '#.#.#..#.##.#.#', '##..#.#.##..#.#', '.#.#.###..#.##.'];
    return runes[(Math.floor(v / 7) + (a > 0 ? 2 : 0)) % 4][row * 3 + u + 1] === '#';
  }
  sculptBody(f, skin, b, {
    eyes: CYAN_EYES, nose: 'long', hands: o.palm ? ['open', 'open'] : ['open', 'open'],
    as: { trunk: { stuff: robe, grow: 1.08 }, arms: { stuff: robe, grow: 1.1 }, legs: { stuff: robe }, shins: { stuff: robe } },
    forearms: false, feet: false,
  });
  skirt(f, robe, b, 0.2 * k, 2.0, 7);
  sleeves(f, robe, b, 'bell');
  for (const j of [0, 1] as const) f.rod(skin, lerp(b.elbows[j], b.wrists[j], 0.5), b.wrists[j], 0.34 * k, 0.28 * k, 0.2);
  for (const j of [0, 1] as const) sculptFoot(f, robe, b, j, undefined, 1.1);
  // his mantle over his shoulders, its two bands hanging down before him to his knees, burning with runes
  f.egg(teal, onChest(b, 0, 0.05, 1.3), [2.0 * k, 1.4 * k, 0.75 * k], TA, 0.6);
  for (const s of [-1, 1]) f.block(teal, onChest(b, s * 0.72, 1.12, -1.45), [0.3 * k, 0.1 * k, 2.25 * k], 0.08 * k, TA, 0.4);
  // his cowl, open over his face
  hood(f, teal, b, { open: 0.74 });
  // his brows, heavy; his beard to his belt, white; his hair white at his temples under the cowl
  for (const s of [-1, 1]) f.rod(brow, onHead(b, s * 0.12, 0.92, 0.36), onHead(b, s * 0.58, 0.72, 0.5), 0.1 * k, 0.07 * k, 0.08);
  beard(f, white, b, { to: 0.85, full: 1.0, sway: o.sway ?? 0 });
  return b;
}

/** THE OLD WORDSMITH, his staff in both hands from `low` (his right hand) up through `high` (his left) to its head; `gust`. */
export function oldWordsmith(f: Figure, P: Pose, staff: { tip: V3 }, gust = 0): { b: Body; head: V3 } {
  const B: Build = { tall: 17.8, broad: 0.95, heavy: 0.88 };
  const b = pose(B, P);
  const k = b.k;
  const TA = ax3(b.across, mul(b.fwd, -1), b.up);
  const skin = f.stuff({ tones: T.skinOld, hatch: 4, crease: 0.5 });
  const robe = f.stuff({ tones: T.brown, hatch: 4, crease: 0.8 });
  const teal = f.stuff({ tones: T.tealOld, crease: 0.8, paint: (q) => (mantleRune(q) ? '#8ff4ff' : null) });
  const grey = f.stuff({ tones: T.grey, meld: true, crease: 0.4 });
  const wood = f.stuff({ tones: T.wood });
  const leath = f.stuff({ tones: T.leather });
  const book = f.stuff({ tones: T.tealOld, paint: (_q, _n, v) => (v > 0.9 ? '#e8d8a8' : null) });
  function mantleRune(q: V3): boolean {
    const d = sub(q, b.chest);
    const z = dot(d, b.up) / k;
    if (z > 0.75 || z < 0.45) return false;
    const a = Math.atan2(dot(d, b.across), dot(d, b.fwd));
    const u = Math.floor(((a + Math.PI) / (Math.PI * 2)) * 54);
    return u % 3 !== 2 && (u * 7 + Math.floor((z - 0.45) / 0.1)) % 3 === 0;
  }
  sculptBody(f, skin, b, {
    eyes: CYAN_EYES, nose: 'long', hands: ['grip', 'grip'],
    as: { trunk: { stuff: robe, grow: 1.08 }, arms: { stuff: robe, grow: 1.1 }, legs: { stuff: robe }, shins: { stuff: robe }, feet: { stuff: leath, grow: 1.1 } },
    forearms: false,
  });
  skirt(f, robe, b, 0.35 * k, 2.1, 7, mul(b.fwd, -gust * 4 * k));
  sleeves(f, robe, b, 'long');
  for (const j of [0, 1] as const) f.rod(skin, lerp(b.elbows[j], b.wrists[j], 0.55), b.wrists[j], 0.32 * k, 0.27 * k, 0.2);
  // his belt; his book on its strap at his right hip
  f.egg(leath, b.waist, [1.36 * k, 1.16 * k, 0.16 * k], TA, 0.08);
  const bk = add(add(b.waist, mul(b.across, -1.35 * k)), mul(b.up, -0.8 * k));
  f.block(book, bk, [0.18 * k, 0.6 * k, 0.75 * k], 0.06 * k, TA, 0.08);
  f.rod(leath, add(b.waist, mul(b.across, -1.2 * k)), add(bk, mul(b.up, 0.6 * k)), 0.06 * k, 0.06 * k, 0);
  // his mantle, its edge burning with runes; his hood, peaked behind
  f.egg(teal, onChest(b, 0, 0.05, 1.05), [2.0 * k, 1.4 * k, 1.0 * k], TA, 0.5);
  hood(f, teal, b, { peak: 1, open: 0.7 });
  // his lean face's grey: brows, a short beard to a point
  for (const s of [-1, 1]) f.rod(grey, onHead(b, s * 0.12, 0.92, 0.36), onHead(b, s * 0.55, 0.74, 0.46), 0.08 * k, 0.05 * k, 0.07);
  beard(f, grey, b, { to: 0.0, full: 0.62 });
  // HIS STAFF, through both his hands, its head knotted
  const lowH = add(b.wrists[0], mul(b.handFrames[0].z, 0.7 * k));
  const highH = add(b.wrists[1], mul(b.handFrames[1].z, 0.7 * k));
  const dir = unit(sub(staff.tip, lowH));
  const foot = add(lowH, mul(dir, -4.5 * k));
  void highH;
  f.rod(wood, foot, staff.tip, 0.15 * k, 0.13 * k, 0);
  f.egg(wood, staff.tip, [0.3 * k, 0.3 * k, 0.36 * k], ax3(b.across, mul(b.fwd, -1), dir), 0.15);
  f.rod(wood, add(staff.tip, mul(dir, 0.15 * k)), add(staff.tip, add(mul(dir, 0.5 * k), mul(b.across, -0.4 * k))), 0.11 * k, 0.07 * k, 0.15);
  return { b, head: add(staff.tip, mul(dir, 0.45 * k)) };
}

/** THE ARMOURER: heavy, bald, a great pale beard; his teal shirt, its sleeves rolled; a leather apron. */
export function armourer(f: Figure, P: Pose, hands: readonly ['fist' | 'grip' | 'flat' | 'open', 'fist' | 'grip' | 'flat' | 'open'] = ['fist', 'fist']): Body {
  const B: Build = { tall: 17.6, broad: 1.22, heavy: 1.38 };
  const b = pose(B, P);
  const k = b.k;
  const TA = ax3(b.across, mul(b.fwd, -1), b.up);
  const skin = f.stuff({ tones: T.skinLight, hatch: 4, crease: 0.5 });
  const shirt = f.stuff({ tones: T.shirt, hatch: 4, crease: 0.8 });
  const leath = f.stuff({ tones: T.leather, crease: 0.8 });
  const white = f.stuff({ tones: T.white, meld: true, crease: 0.35 });
  const trews = f.stuff({ tones: T.cloak, crease: 0.8 });
  const boot = f.stuff({ tones: T.boot });
  sculptBody(f, skin, b, {
    eyes: CYAN_EYES, nose: 'ram', hands,
    as: { trunk: { stuff: shirt, grow: 1.05 }, legs: { stuff: trews, grow: 1.08 }, shins: { stuff: boot, grow: 1.12 }, feet: { stuff: boot, grow: 1.15 } },
    arms: false,
  });
  sleeves(f, shirt, b, 'rolled');
  // his apron of leather, from his chest to his knees, its strap round his neck
  const top = onChest(b, 0, 1.12, 0.6);
  const knees = lerp(b.knees[0], b.knees[1], 0.5);
  const bot = add(knees, mul(b.fwd, 1.0 * k));
  const mid = add(lerp(top, bot, 0.5), mul(b.fwd, 0.55 * k));
  f.block(leath, lerp(top, mid, 0.5), [1.0 * k, 0.1 * k, len(sub(mid, top)) * 0.52], 0.08 * k, ax3(b.across, unit(cross(b.across, unit(sub(mid, top)))), unit(sub(mid, top))), 0.3);
  f.block(leath, lerp(mid, bot, 0.5), [1.15 * k, 0.1 * k, len(sub(bot, mid)) * 0.52], 0.08 * k, ax3(b.across, unit(cross(b.across, unit(sub(bot, mid)))), unit(sub(bot, mid))), 0.3);
  for (const s of [-1, 1]) f.rod(leath, add(top, mul(b.across, s * 0.8 * k)), onChest(b, s * 0.7, 0.1, 1.75), 0.08 * k, 0.08 * k, 0.05);
  // his beard, great and pale, to the middle of his chest; his brows; bald
  for (const s of [-1, 1]) f.rod(white, onHead(b, s * 0.12, 0.92, 0.36), onHead(b, s * 0.58, 0.74, 0.44), 0.11 * k, 0.07 * k, 0.08);
  beard(f, white, b, { to: 0.4, full: 1.25 });
  void TA;
  return b;
}

/** THE MYSTIC: his robe of the mage's purple, a gold sash, gold chains; the great pale turban wound round his head; the veil. */
export function mystic(f: Figure, P: Pose, hands: readonly ['fist' | 'grip' | 'flat' | 'open', 'fist' | 'grip' | 'flat' | 'open'] = ['open', 'open']): Body {
  const B: Build = { tall: 17.2, broad: 1.0, heavy: 0.95 };
  const b = pose(B, P);
  const k = b.k;
  const TA = ax3(b.across, mul(b.fwd, -1), b.up);
  const HA = ax3(b.hacross, mul(b.hfwd, -1), b.hup);
  const skin = f.stuff({ tones: T.skinDark, hatch: 4, crease: 0.5 });
  const robe = f.stuff({ tones: T.purple, hatch: 4, crease: 0.8 });
  const gold = f.stuff({ tones: T.gold, shine: 0.6 });
  const cloth = f.stuff({ tones: T.pale, crease: 0.9 });
  const veil = f.stuff({ tones: T.veil, crease: 0.9 });
  sculptBody(f, skin, b, {
    eyes: CYAN_EYES, nose: 'small', hands,
    as: { trunk: { stuff: robe, grow: 1.08 }, arms: { stuff: robe, grow: 1.1 }, legs: { stuff: robe }, shins: { stuff: robe } },
    forearms: false, feet: false,
  });
  skirt(f, robe, b, 0.15 * k, 2.1, 7);
  sleeves(f, robe, b, 'bell');
  for (const j of [0, 1] as const) {
    f.rod(skin, lerp(b.elbows[j], b.wrists[j], 0.5), b.wrists[j], 0.32 * k, 0.27 * k, 0.2);
    sculptFoot(f, robe, b, j, undefined, 1.1);
  }
  // the sash of gold round his waist, its knot and end at his side; the chains at his neck
  f.egg(gold, b.waist, [1.36 * k, 1.18 * k, 0.2 * k], TA, 0.06);
  f.rod(gold, add(b.waist, add(mul(b.across, 0.8 * k), mul(b.fwd, 0.85 * k))), add(b.waist, add(mul(b.across, 1.0 * k), add(mul(b.fwd, 0.95 * k), mul(b.up, -1.2 * k)))), 0.12 * k, 0.16 * k, 0.05);
  for (const [z0, sag] of [[1.15, 0.3], [0.95, 0.5]] as const) {
    let prev: V3 | null = null;
    for (let i = 0; i <= 10; i++) {
      const u = i / 10;
      const q = onChest(b, -0.85 + 1.7 * u, 1.18 + 0.12 * Math.sin(u * Math.PI), z0 - sag * Math.sin(u * Math.PI));
      if (prev) f.rod(gold, prev, q, 0.06 * k, 0.06 * k, 0);
      prev = q;
    }
  }
  // THE VEIL: a thin cloth from under his eyes, over his nose and mouth, falling to his throat in soft folds
  for (let i = 0; i < 9; i++) {
    const u = (i - 4) / 4;
    const a = u * 0.62;
    const top = onHead(b, a, 1.0 - Math.abs(u) * 0.32, -0.05 - Math.abs(u) * 0.05);
    const bot = onHead(b, a * 0.85, 1.05 - Math.abs(u) * 0.25, -1.45 + Math.abs(u) * 0.2);
    f.rod(veil, top, bot, 0.1 * k, 0.12 * k, 0.12);
  }
  for (const s of [-1, 1]) f.rod(veil, onHead(b, s * 0.62, 0.68, -0.05), onHead(b, s * 0.85, 0.2, 0.42), 0.05 * k, 0.04 * k, 0.05);
  // THE TURBAN: a great mass of pale cloth wound round his head, fuller than it and rising over it, its lowest wind close over
  // his brow; the winds lying across one another, crossing at the front over the stone in its setting of gold; the cloth's
  // end tucked in at the side
  f.egg(cloth, onHead(b, 0, -0.1, 0.72), [1.18 * k, 1.3 * k, 0.95 * k], HA, 0.4);
  f.egg(cloth, onHead(b, 0, -0.05, 1.2), [1.0 * k, 1.12 * k, 0.6 * k], HA, 0.5);
  // (the lowest wind, a roll hugging the brow and the back of the head)
  let prev: V3 | null = null;
  for (let i = 0; i <= 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    const q = onHead(b, Math.sin(a) * 1.02, Math.cos(a) * 1.12 - 0.12, 0.45 + (Math.cos(a) > 0 ? 0 : 0.12));
    if (prev) f.rod(cloth, prev, q, 0.24 * k, 0.24 * k, 0.12);
    prev = q;
  }
  // (the winds crossing over the front, each from low at one side to high at the other: grooves pressed into the cloth)
  for (let w = 0; w < 4; w++) {
    const side = w % 2 ? 1 : -1;
    const z0 = 0.62 + w * 0.2;
    const pts: V3[] = [];
    for (let i = 0; i <= 12; i++) {
      const u = i / 12;
      const a = side * (-1.4 + u * 2.8);
      const z = z0 + side * (u - 0.5) * 0.5;
      pts.push(onHead(b, Math.sin(a) * 1.22, Math.cos(a) * 1.3 - 0.1, z));
    }
    for (let i = 1; i < pts.length; i++) f.rod(cloth, pts[i - 1], pts[i], 0.06 * k, 0.06 * k, 0.04, true);
    f.line(pts.map((q) => add(q, mul(b.hup, -0.04 * k))), '#5a6070', 1);
  }
  f.egg(gold, onHead(b, 0, 1.25, 0.82), [0.24 * k, 0.1 * k, 0.3 * k], HA, 0.04);
  f.mark(onHead(b, 0, 1.36, 0.82), ['#e8f0ff', '#9ab0d8', '#ffffff'], 2);
  f.rod(cloth, onHead(b, 1.05, -0.3, 0.75), onHead(b, 1.25, -0.55, -0.4), 0.26 * k, 0.15 * k, 0.3);
  return b;
}

/** THE STRANGER: a long dark cloak wrapped round him, the hood down over his face; two points of gold in its dark; boots. */
export function stranger(f: Figure, P: Pose, hands: readonly ['fist' | 'grip' | 'flat' | 'open', 'fist' | 'grip' | 'flat' | 'open'] = ['fist', 'fist']): Body {
  const B: Build = { tall: 17.8, broad: 1.0, heavy: 0.92 };
  const b = pose(B, P);
  const k = b.k;
  const cloak = f.stuff({ tones: T.cloak, hatch: 4, crease: 0.9 });
  const glove = f.stuff({ tones: T.boot, crease: 0.5 });
  const boot = f.stuff({ tones: T.boot });
  const dark = f.stuff({ tones: T.dark });
  sculptBody(f, cloak, b, {
    face: false, skull: false, eyes: null, hands,
    as: { hands: { stuff: glove }, legs: { stuff: cloak, grow: 1.05 }, shins: { stuff: boot, grow: 1.15 }, feet: { stuff: boot, grow: 1.15 }, forearms: { stuff: cloak, grow: 1.1 }, arms: { stuff: cloak, grow: 1.12 } },
  });
  // the cloak's fall from his shoulders to his calves, open in front over his legs; its folds
  f.egg(cloak, onChest(b, 0, -0.05, 1.2), [2.05 * k, 1.42 * k, 0.8 * k], ax3(b.across, mul(b.fwd, -1), b.up), 0.5);
  const ground = Math.min(b.ankles[0][2], b.ankles[1][2]) - 0.75 * k;
  for (const s of [-1, 1]) {
    const top = onChest(b, s * 1.4, -0.3, 0.8);
    const hemP: V3 = add(add(lerp(b.ankles[0], b.ankles[1], s < 0 ? 0.15 : 0.85), mul(b.fwd, -0.6 * k)), [0, 0, 0]);
    f.rod(cloak, top, [hemP[0], hemP[1], ground + 3.0 * k], 0.9 * k, 1.35 * k, 0.5);
  }
  f.rod(cloak, onChest(b, 0, -0.9, 0.5), add(lerp(b.ankles[0], b.ankles[1], 0.5), [0, 1.0 * k, ground + 2.8 * k - b.ankles[0][2]]), 1.4 * k, 1.8 * k, 0.5);
  // the hood, deep, its brim out over his face; the dark in it; two points of gold
  const HA = ax3(b.hacross, mul(b.hfwd, -1), b.hup);
  f.egg(cloak, onHead(b, 0, -0.1, 0.25), [1.08 * k, 1.2 * k, 1.22 * k], HA, 0.5);
  f.egg(cloak, onHead(b, 0, 0.55, 0.45), [1.0 * k, 0.55 * k, 1.05 * k], HA, 0.35);
  f.rod(cloak, onHead(b, 0, 0.6, 1.3), onHead(b, 0, 1.15, 1.0), 0.25 * k, 0.06 * k, 0.25);
  f.egg(cloak, onHead(b, 0, 1.15, -0.05), [0.72 * k, 0.65 * k, 0.92 * k], HA, 0.14, true);
  f.egg(dark, onHead(b, 0, 0.2, -0.05), [0.72 * k, 0.7 * k, 0.85 * k], HA, 0.3);
  for (const s of [-1, 1]) f.mark(onHead(b, s * 0.28, 0.72, 0.05), GOLD_EYES, 2);
  return b;
}

/** A CULTIST: his violet robe girded up with rope, the deep pointed cowl, the pink slashes of his eyes, the stole; his dagger. */
export function cultist(f: Figure, P: Pose, dagger: { hand: 0 | 1; to: V3 } | null, torch: { hand: 0 | 1; to: V3 } | null): { b: Body; torch: V3 | null } {
  const B: Build = { tall: 17.2, broad: 0.92, heavy: 0.82 };
  const b = pose(B, P);
  const k = b.k;
  const TA = ax3(b.across, mul(b.fwd, -1), b.up);
  const HA = ax3(b.hacross, mul(b.hfwd, -1), b.hup);
  const bone = f.stuff({ tones: T.skinBone, crease: 0.45 });
  const robe = f.stuff({ tones: T.violet, hatch: 4, crease: 0.85 });
  const pink = f.stuff({ tones: T.pink, crease: 0.7 });
  const rag = f.stuff({ tones: T.rag, crease: 0.7 });
  const rope = f.stuff({ tones: T.rope });
  const dark = f.stuff({ tones: T.dark });
  const ivory = f.stuff({ tones: T.ivory, shine: 0.3 });
  const wood = f.stuff({ tones: T.wood });
  const holds = (j: number): 'grip' | 'claw' => ((dagger && dagger.hand === j) || (torch && torch.hand === j) ? 'grip' : 'claw');
  sculptBody(f, bone, b, {
    face: false, skull: false, hands: [holds(0), holds(1)],
    as: { trunk: { stuff: robe, grow: 1.06 }, arms: { stuff: robe, grow: 1.12 }, legs: { stuff: robe, grow: 1.05 }, shins: { stuff: rag, grow: 1.1 }, feet: { stuff: rag, grow: 1.1 } },
  });
  // the robe girded up to his knees, ragged at its hem; the rope round him; the sleeves pushed back to the elbows
  skirt(f, robe, b, 4.6 * k, 1.75, 5);
  f.egg(rope, b.waist, [1.22 * k, 1.04 * k, 0.14 * k], TA, 0.06);
  f.rod(rope, add(b.waist, add(mul(b.fwd, 1.0 * k), mul(b.across, 0.3 * k))), add(b.waist, add(mul(b.fwd, 1.1 * k), add(mul(b.across, 0.4 * k), mul(b.up, -1.4 * k)))), 0.06 * k, 0.06 * k, 0);
  for (const j of [0, 1] as const) f.egg(robe, b.elbows[j], [0.62 * k, 0.62 * k, 0.48 * k], TA, 0.3);
  // the stole: two bands of the cult's pink from his neck down his front past the rope
  for (const s of [-1, 1]) {
    const top = onChest(b, s * 0.42, 1.0, 1.4);
    const bot = add(add(b.waist, mul(b.up, -1.3 * k)), add(mul(b.across, s * 0.5 * k), mul(b.fwd, 1.15 * k)));
    const along = sub(bot, top);
    f.block(pink, lerp(top, bot, 0.5), [0.2 * k, 0.06 * k, len(along) / 2], 0.04 * k, ax3(b.across, unit(cross(b.across, unit(along))), unit(along)), 0.05);
  }
  // the deep cowl with its point fallen back; the dark in it; the slanting slashes of pink
  f.egg(robe, onHead(b, 0, -0.18, 0.28), [1.1 * k, 1.25 * k, 1.28 * k], HA, 0.5);
  f.rod(robe, onHead(b, 0, -0.4, 1.25), onHead(b, 0, -1.6, 1.9), 0.55 * k, 0.05 * k, 0.45);
  f.egg(robe, onHead(b, 0, 1.15, -0.1), [0.7 * k, 0.62 * k, 0.9 * k], HA, 0.14, true);
  f.egg(dark, onHead(b, 0, 0.15, -0.1), [0.72 * k, 0.72 * k, 0.85 * k], HA, 0.3);
  for (const s of [-1, 1]) for (const [a, c] of [[0.18, -0.02], [0.28, 0.04], [0.38, 0.1]] as const) f.mark(onHead(b, s * a, 0.82, c), ['#ff8ab8', '#ff5aa0', '#c02a6a'], 1);
  // the dagger: a long wavy blade of bone, a dark guard, its grip bound in pink
  if (dagger) {
    const grip = add(b.wrists[dagger.hand], mul(b.handFrames[dagger.hand].z, 0.7 * k));
    const dd = unit(sub(dagger.to, grip));
    const side = unit(cross(dd, Math.abs(dd[2]) > 0.9 ? [1, 0, 0] : [0, 0, 1]));
    let prev = add(grip, mul(dd, 0.4 * k));
    f.rod(dark, add(prev, mul(side, -0.35 * k)), add(prev, mul(side, 0.35 * k)), 0.08 * k, 0.08 * k, 0);
    f.rod(pink, add(grip, mul(dd, -0.4 * k)), prev, 0.1 * k, 0.1 * k, 0);
    for (let i = 1; i <= 6; i++) {
      const q = add(add(grip, mul(dd, (0.4 + i * 0.42) * k)), mul(side, (i % 2 ? 0.1 : -0.1) * (i < 6 ? 1 : 0) * k));
      f.rod(ivory, prev, q, (0.15 - i * 0.018) * k, (0.14 - i * 0.02) * k, 0.05);
      prev = q;
    }
  }
  let flame: V3 | null = null;
  if (torch) {
    const grip = add(b.wrists[torch.hand], mul(b.handFrames[torch.hand].z, 0.7 * k));
    const dd = unit(sub(torch.to, grip));
    const top = add(grip, mul(dd, 2.4 * k));
    f.rod(wood, add(grip, mul(dd, -0.8 * k)), top, 0.13 * k, 0.15 * k, 0);
    f.egg(rag, top, [0.26 * k, 0.26 * k, 0.36 * k], ax3(b.across, mul(b.fwd, -1), dd), 0.1);
    flame = add(top, mul(dd, 0.35 * k));
  }
  return { b, torch: flame };
}

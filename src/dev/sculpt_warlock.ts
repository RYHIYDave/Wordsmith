// THE WARLOCK, SCULPTED (the art chat, 23 Oct 2026). A MOCK-UP; NOTHING OF THE GAME IMPORTS IT.
//
// His look, picked 23 Oct by 18:43 Pacific: “A with the spiked pauldron” (the horned hood and the long coat; his left arm
// already the demon's); his brief, by 22:10: “Pact-bound scholar (Recommended)”, “Hunched and pained”, “Heavy cyan hellfire
// (Recommended)”. So: a big man in a long dark coat, stooped and fighting the thing in him, his demon arm hanging heavy with
// cyan fire in its claws, his right hand clamped on it; the hood, the horns through it, two points of cyan for eyes; the
// spiked pauldron; the red book chained at his hip. What glows on him is cyan, the friend's.

import type { Ramp } from '../art/kit';
import { CYAN } from '../art/kit';
import { FRIEND_RIM } from '../art/hero3_knight';
import { HEAD_B } from '../art/moves3';
import { CANVAS3 } from '../art/skin';
import type { GameView, PaintView, Stage } from '../art/skin';
import { add, buildOf, cross, lerp3, mul, norm, solve, standing, sub } from '../art/skeleton';
import type { Bones, Build, Posed, V3 } from '../art/skeleton';
import { Sculpt, draw, onBall, onCone } from './sculpt';
import type { Cone, Drawn, Ell } from './sculpt';
import { BRASS, HIDE, SKIN_W, farSide, limbFrame, manBody, manHead, onHead, shadeOf, tailorFor } from './sculpt_classes';
import type { Who } from './sculpt_classes';

/** His coat: black wool gone grey at its folds. */
export const COAT: Ramp = ['#0e0b1c', '#1e1832', '#322a50', '#4c4270', '#6c6094'];
/** The demon's hide on his arm: dark blood red. */
export const DEMON_RED: Ramp = ['#1a040a', '#3a0816', '#661424', '#9a2c32', '#cc5644'];
/** Horn and claw. */
export const IVORY: Ramp = ['#241c30', '#463a56', '#857894', '#cfc4dc', '#f2eefa'];
/** Steel: the pauldron, the chain. */
export const STEEL5: Ramp = ['#1c1a40', '#33306a', '#605aa8', '#a29ce2', '#e2deff'];
/** How far toward the eye the fire in his claws stands out from its heart: a claw nearer than that is before it, and hides it. */
export const FIRE_DEEP = 2.0;
/** How big the demon's hand is (1 a big man's hand; his is a demon's, more). */
export const DEMON_HAND = { k: 2.0 };
/** Dark iron, cold and grey: his pauldron. */
export const IRON5: Ramp = ['#100e16', '#1e1b28', '#33303f', '#4f4a5c', '#77708a'];
/** The book's red leather. */
const BOOKRED: Ramp = ['#22040c', '#420a16', '#6e1420', '#a02a2c', '#c84a3e'];

/** THE WARLOCK'S BODY: the knight's height, broad: a big man for one who reads. */
export const WARLOCK_SCULPT_BODY: Build = buildOf(58, HEAD_B * 1.12, { shoulders: 1.16, chest: 1.1, waist: 1.0, hips: 1.0, depth: 1.05, limbs: 1.08, pad: 1.1 });

/**
 * How his face is held under the hood (his “Polish faces up close”, 24 Oct): `turn`, his hood turned to us (it was 2: its
 * opening side-on, one eye seen); his face all but lost in its dark (`shadow`), the bridge of his nose and his chin caught
 * cold (`lit`); each eye's light on the hollow under it.
 */
export const HIS_FACE = { turn: -20, up: 4, dark: true, lit: '#5a4a6a', slant: 0, shadow: '#22121e' };

/** HUNCHED AND PAINED: stooped, his shoulders up, his weight back on his right foot; the demon arm thrust out before him,
 * its claws open on the fire; his right hand clamped round its forearm, holding it back. HUNCHED HIGH IN THE BACK, on the
 * spine's new joints (art/skeleton.ts Bones.hunch, shrug; his words, 25 Oct: "Can you put some articulation points in the
 * spine in the wire frame the character sprites are being built with?  The bend needs to be higher up in the back.
 * Shoulders hunched forward"): little bend below the ribs, the top of his back curled over, his shoulders rolled forward. */
export function warlockStance(B: Build): Bones {
  const t = B.tall / 58;
  return {
    ...standing(B),
    pz: -1.2 * t, yaw: -18, bend: 4, hunch: 46, shrug: 0.9, side: -6, twist: 10, faceTurn: HIS_FACE.turn, faceUp: HIS_FACE.up, faceTilt: -6,
    lfx: 2.4 * t, lfy: 1.6 * t, lft: 14, lk: 12,
    rfx: -2.0 * t, rfy: -2.2 * t, rft: -18, rk: -12, rfp: 6,
    lhIn: 0, lhx: 9.0 * t, lhy: 7.5 * t, lhz: -3.0 * t, le: 40,
    rhIn: 0, rhx: 6.5 * t, rhy: 9.5 * t, rhz: -7.0 * t, re: 18,
  };
}

/** A smooth noise in [0, 1] (value noise on a grid, eased between): the flicker of the fire. */
export function noise2(x: number, y: number): number {
  const h = (i: number, j: number): number => {
    const v = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
    return v - Math.floor(v);
  };
  const i = Math.floor(x);
  const j = Math.floor(y);
  const fx = x - i;
  const fy = y - j;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const a = h(i, j) + (h(i + 1, j) - h(i, j)) * sx;
  const b = h(i, j + 1) + (h(i + 1, j + 1) - h(i, j + 1)) * sx;
  return a + (b - a) * sy;
}
/** Hellfire's colours, coolest to hottest: deep teal at its ragged edge, the friend's cyan, ice-white, white at its heart. */
export const HELL = ['#0c6a80', '#22d0e0', '#b8fff8', '#ffffff'];

/**
 * THE DEMON'S PALM, turned up under the fire: its middle, the way up from it (the world's up, square to his forearm), and the
 * way across it (to the outer side of his left hand, square to both).
 */
export function demonPalm(s: { elbowL: V3; handL: V3; chest: readonly [V3, V3, V3] }): { palm: V3; pu: V3; ps: V3; fd: V3 } {
  const fd = norm(sub(s.handL, s.elbowL), [1, 0, 0]);
  const up0 = sub([0, 0, 1], mul(fd, fd[2]));
  const pu = Math.hypot(up0[0], up0[1], up0[2]) > 0.2 ? norm(up0) : norm(sub(s.chest[0], mul(fd, dot3(s.chest[0], fd))), [1, 0, 0]);
  const ps = norm(cross(fd, pu));
  return { palm: add(s.handL, add(mul(fd, 1.2 * DEMON_HAND.k), mul(pu, 0.3))), pu, ps, fd };
}
const dot3 = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
/** Where the fire in the demon's claws has its heart, a fire of `size`: above his palm by as much as its foot goes down, and a little more, so it sits in the curled claws over the palm. */
export function fireSeat(s: { elbowL: V3; handL: V3; chest: readonly [V3, V3, V3] }, size: number): V3 {
  const { palm, fd } = demonPalm(s);
  return add(palm, [0, 0, fireFoot(size) + 1.0 * DEMON_HAND.k]);
}

/** How deep below its heart a fire of `size` closes round (picture pixels): the bowl of its foot. */
export function fireFoot(size: number): number {
  return Math.max(2.5, size * 1.5 * 0.95);
}
/**
 * THE SHAPE OF HELLFIRE: at a pixel `x` across and `yy` up (negative) or down from its heart, how hot a fire of `size` is at
 * moment `t` (0 its ragged edge to 3 its white heart), or -1 for no fire there. Tongues licking up out of the heart, each
 * its own height, flickering and breaking off at their tips, leaning `lean` (picture pixels a picture pixel up); ITS FOOT
 * ROUNDED, not cut off flat (his word, 25 Oct: “I’d like the bottom part of the fire to not be flat please”): below its heart
 * it closes round in a ragged bowl, burning round what holds it.
 */
export function fireAt(x: number, yy: number, size: number, t = 0, lean = 0): number {
  const H = Math.round(size * 3.3);
  const W = size * 1.5;
  const D = fireFoot(size);
  if (yy > D || yy < -H * 1.25) return -1;
  const up = -yy / H;
  const sway = lean * -yy + Math.sin(up * 4.2 - t * 8.0) * size * 0.32 * Math.max(0, up);
  const dx = x - sway;
  // (the noise rising through it: tongues licking up and breaking off)
  const n = noise2(dx * 0.42 + 3.1, (-yy) * 0.34 - t * 9.5);
  const n2 = noise2(dx * 0.9 + 11.7, (-yy) * 0.7 - t * 14);
  // (below the heart: the bowl, narrowing round to its bottom, its rim flickering)
  const below = yy > 0 ? yy / D : 0;
  const bowl = yy > 0 ? Math.sqrt(Math.max(0, 1 - below * below)) * (0.82 + 0.36 * n) : 1;
  const half = (W * Math.pow(Math.max(0, 1 - Math.max(0, up)), 0.6) * (0.62 + 0.55 * n) + (yy >= -1 ? 0.6 : 0)) * bowl;
  let heat = -1;
  if (up <= 1 && Math.abs(dx) <= half) heat = (1 - Math.abs(dx) / Math.max(0.5, half)) * (1 - Math.max(0, up) * 0.85) * (1 - below * 0.7) + (n2 - 0.5) * 0.25;
  // (tongues torn off above, burning out as they rise)
  else if (up > 0.7 && up < 1.22 && Math.abs(dx) < W * 0.42 && n * n2 > 0.42 - (up - 0.7) * 0.15) heat = 0.12;
  if (heat < 0) return -1;
  return heat > 0.66 && up < 0.42 && below < 0.4 ? 3 : heat > 0.42 ? 2 : heat > 0.16 ? 1 : 0;
}

/**
 * CYAN HELLFIRE in his claws, real fire (his word of the first films, 25 Oct: “And the flame is bad.”): tongues of it licking
 * up out of a white-hot heart in his claws, each its own height, flickering and breaking off at their tips as they rise,
 * leaning back as he moves (`lean`, picture pixels a picture pixel up); embers flung up out of it. `size` its half-width at its foot, in picture pixels; `t` the moment, seconds. Drawn over everything (it is
 * light), in whole pixels, none left alone.
 */
export function handFire(st: Stage, at: V3, size: number, t = 0, lean = 0): void {
  const [cx, cy] = st.at(at);
  const H = Math.round(size * 3.3);
  const W = size * 1.5;
  const px = new Map<number, number>();
  const key = (x: number, y: number): number => (y + 512) * 1024 + (x + 512);
  const put = (x: number, y: number, k: number): void => {
    const q = key(x, y);
    if ((px.get(q) ?? -1) < k) px.set(q, k);
  };
  const reach = Math.ceil(W * 1.6 + Math.abs(lean) * H * 1.3);
  for (let yy = -Math.round(H * 1.25); yy <= Math.ceil(fireFoot(size)); yy++) {
    for (let x = -reach; x <= reach; x++) {
      const k = fireAt(x, yy, size, t, lean);
      if (k >= 0) put(x, yy, k);
    }
  }
  // EMBERS flung up out of it, each a spark two pixels long
  for (let e = 0; e < 5; e++) {
    const ph = (t * (0.9 + e * 0.13) + e * 0.37) % 1;
    if (ph > 0.82) continue;
    const ex = Math.round(Math.sin(e * 12.7) * W * 0.9 + Math.sin(ph * 7 + e) * 2.2 + lean * H * (0.4 + ph));
    const ey = Math.round(-H * (0.45 + ph * 1.0));
    const k = ph < 0.4 ? 3 : 2;
    put(ex, ey, k);
    put(ex, ey - 1, k);
  }
  // (none left alone: a flame pixel with no flame beside it goes)
  const has = (x: number, y: number): boolean => px.has(key(x, y));
  for (const [q, k] of px) {
    const x = (q % 1024) - 512;
    const y = Math.floor(q / 1024) - 512;
    if (!has(x - 1, y) && !has(x + 1, y) && !has(x, y - 1) && !has(x, y + 1)) continue;
    st.over.set(Math.round(cx + x), Math.round(cy + y), HELL[k]);
  }
}

/**
 * WHAT HIS MOVES SET AS HE IS DRAWN (dev/warlock_moves.ts): how his coat's skirts trail where his legs have been (`SKIRT_SWING`,
 * in his measure, added to where they hang to), and the fire in his claws (`ARM_FIRE`: its size, and `seed`, its flicker).
 * At rest, as he was drawn before.
 */
export const SKIRT_SWING: { v: V3 } = { v: [0, 0, 0] };
export const ARM_FIRE = { size: 4.0, seed: 1, t: 0, lean: 0, open: 0, blaze: 0 };
/** As he runs his coat swings open at the front, its skirts flung back behind his legs (`on`); standing, it hangs closed. */
export const SKIRT_OPEN = { on: false };

/** Half the width of one of his coat's panels as he runs. */
export const PANEL_HALF = 2.9;
/**
 * How far to move a coat panel's foot so that no leg goes through it: the panel hangs from `at` to `ft`, `half` wide either
 * side; each leg a rod (from, to, its radius at each end); `margin` more than the leg's radius kept clear. Null if clear.
 */
function panelClear(at: V3, ft: V3, half: number, legs: [V3, V3, number, number][], margin: number): V3 | null {
  const d = sub(ft, at);
  const L = Math.hypot(d[0], d[1], d[2]);
  const along = mul(d, 1 / L);
  const tg = norm(cross([0, 0, 1], along), [0, 1, 0]);
  let best: V3 | null = null;
  let worst = 0;
  for (const [a, b, ra, rb] of legs) {
    for (let k = 0; k <= 6; k++) {
      const P = lerp3(a, b, k / 6);
      const r = ra + (rb - ra) * (k / 6) + margin;
      const q = sub(P, at);
      const u = Math.max(0, Math.min(L, q[0] * along[0] + q[1] * along[1] + q[2] * along[2]));
      const w = Math.max(-half, Math.min(half, q[0] * tg[0] + q[1] * tg[1] + q[2] * tg[2]));
      const near = add(at, add(mul(along, u), mul(tg, w)));
      const v = sub(near, P);
      const dist = Math.hypot(v[0], v[1], v[2]);
      const pen = r - dist;
      if (pen > worst && u > L * 0.12) {
        worst = pen;
        // (out from the leg, along the ground, swung at the panel's foot by as much as its middle must move, and a little more)
        const flat = norm([v[0], v[1], 0], [-along[0], -along[1], 0]);
        best = mul(flat, (pen + 0.3) * Math.min(3, L / Math.max(u, 1)));
      }
    }
  }
  return best;
}

/** The warlock sculpted, standing as he stands, in one of the game's views. */
export function sculptWarlock(view: GameView, pose?: Bones, turn = 0): Drawn {
  const B = WARLOCK_SCULPT_BODY;
  const q = (pose ?? warlockStance(B)) as Posed;
  const s = solve(B, q);
  // FROM BEHIND AS THE CAMERA TRULY SEES HIM (skin.ts PaintView 'rear'), not in a mirror as the heroes are: the demon arm is
  // his left, and stays on his left from behind (his word, 25 Oct, of a picture of him from behind: “Isn’t from behind the
  // wrong arm?  Isnt his left are the demonic one”; as the Headsman's axe, art/new_mobs3.ts Mob.trueBack)
  const pv: PaintView = view === 'back' ? 'rear' : view;
  const w: Who = { s, B, view: pv, spin: turn };
  const sc = new Sculpt();
  sc.spin = turn;
  const [f, l, u] = s.chest;
  // (what hangs from the top of his back, his collar, his shoulders and his hood, its way: the chest's, but where his back
  // is curled over it, art/skeleton.ts Bones.hunch)
  const [F, L, U] = s.upper;
  const farArm = (piece: string): boolean => piece.endsWith('L') ? farSide(w, s.elbowL) : piece.endsWith('R') ? farSide(w, s.elbowR) : false;
  // HIS SKIN (seen only at his throat and right hand): the face is in the hood's dark
  const skin = sc.mat({
    ramp: SKIN_W,
    shade: 0.5,
    paint: (h) => {
      if (h.prim.piece === 'head' && h.prim.tag !== 'neck') {
        // HIS FACE in the hood's dark (his “Polish faces up close”, 24 Oct): all but lost in it, gaunt; only the bone of his
        // cheeks, his nose and his chin caught, cold, by the light of his eyes
        const [a, b, c] = onHead(w, h.p);
        if (HIS_FACE.dark && a > 0.5 && ((c < -0.62 && Math.abs(b) < 0.3) || (Math.abs(b) < 0.1 && c < -0.05 && c > -0.3))) return HIS_FACE.lit;
        if (HIS_FACE.dark) return HIS_FACE.shadow;
      }
      return farArm(h.prim.piece) ? shadeOf(SKIN_W, h.tone - 1) : null;
    },
  });
  // (his body under the coat: the man's, so the coat lies on a body; his left arm is the demon's, built below)
  manBody(sc, w, skin, 1.0, 'L');
  manHead(sc, w, skin);
  const t = tailorFor(sc, w, 1.0);
  // THE COAT: over his trunk and shoulders, a high collar, its skirts to his ankles, open down the front below the belt
  const coat = sc.mat({
    ramp: COAT,
    paint: (h) => {
      const far = farArm(h.prim.piece) ? 1 : 0;
      if (h.prim.tag === 'hem') return shadeOf(BOOKRED, h.tone - 1);
      // its folds: darker runs down the skirt
      if (h.prim.tag === 'skirt') {
        const { around } = onCone(h.prim as Cone, h.p, f);
        // its front edges, piped in red where it opens
        if (Math.abs(Math.abs(around) - 0.42) < 0.12) return shadeOf(BOOKRED, h.tone);
        if (Math.floor((around + Math.PI) * 2.6) % 3 === 0) return shadeOf(COAT, h.tone - 1);
        // the red lining of its hem
        if (h.p[2] < 3.2) return shadeOf(BOOKRED, h.tone - 1);
      }
      return far ? shadeOf(COAT, h.tone - 1) : null;
    },
  });
  t.overTrunk(coat, 0.8, [], 'coat', true);
  // the skirts: from his hips flaring to his ankles, open at the front between his legs
  const mid = lerp3(s.ankleL, s.ankleR, 0.5);
  const top = add(t.pel.c, mul(s.hips[2], 1.2));
  const sw = SKIRT_SWING.v;
  const foot: V3 = [mid[0] - s.hips[0][0] * 0.6 + sw[0], mid[1] - s.hips[0][1] * 0.6 + sw[1], 2.0 + sw[2]];
  if (!SKIRT_OPEN.on) {
    sc.cone(coat, 'skirt', top, foot, B.pelvisHalf + 1.2, B.stance + 4.6, 1.4, { tag: 'skirt', cuts: [{ n: [0, 0, -1], o: -1.6 }] });
    sc.box(coat, 'skirt', add(lerp3(top, foot, 0.62), mul(s.hips[0], B.stance + 4)), [mul(s.hips[0], B.stance + 2.6), mul(s.hips[1], 1.0), [0, 0, 12]], 0.4, 0.8, { carve: true });
  } else {
    // RUNNING, THE COAT FLUNG OPEN: its skirts in panels hung from round his hips, none before him (it is open there), each
    // foot trailing where his body has been and blown back (SKIRT_SWING), the panels fluttering each a little apart; and NO
    // PANEL THROUGH A LEG (Heroes 6, clean bodies; his word of the second run, 25 Oct: “the bottom of the robe is bad, it’s
    // clipping which is a rule that you should be following”): each panel's foot is swung clear of his legs, out and back,
    // as cloth is pushed aside by a leg going through it
    const fw0 = norm([s.hips[0][0], s.hips[0][1], 0]);
    const sd0 = norm([s.hips[1][0], s.hips[1][1], 0]);
    const rx = B.pelvisDeep + 1.4;
    const ry = B.pelvisHalf + 1.6;
    const len = Math.max(10, top[2] - 3.0);
    const legs: [V3, V3, number, number][] = [];
    for (const [hip, knee, ankle] of [[s.hipL, s.kneeL, s.ankleL], [s.hipR, s.kneeR, s.ankleR]] as const) {
      legs.push([lerp3(hip, knee, 0.2), knee, B.legR[0], B.legR[1]]);
      legs.push([knee, ankle, B.legR[1], B.legR[2]]);
    }
    const n = 9;
    const back = mul(fw0, -1);
    // (one stretch of a panel moved clear of his legs: `from` fixed, `to` moved out from them and back, a little at a time,
    // at most `most` in all; what is left of it shortened toward `from` until it is clear)
    const settle = (from: V3, to: V3, most: number): V3 => {
      let at2 = to;
      let moved = 0;
      for (let it = 0; it < 14 && moved < most; it++) {
        const push = panelClear(from, at2, PANEL_HALF, legs, 1.6);
        if (!push) return at2;
        const m = Math.hypot(push[0], push[1], push[2]);
        const step = Math.min(1.5, m, most - moved);
        const dirn = norm(add(mul(push, 1 / Math.max(m, 1e-6)), mul(back, 0.5)));
        at2 = add(at2, mul(dirn, step));
        moved += step;
      }
      for (let k = 0; k < 8 && panelClear(from, at2, PANEL_HALF, legs, 1.6); k++) at2 = lerp3(at2, from, 0.18);
      return at2;
    };
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.PI / n;
      if (Math.abs(Math.atan2(Math.sin(a), Math.cos(a))) < 1.05) continue;
      const dir = norm(add(mul(fw0, Math.cos(a) * rx), mul(sd0, Math.sin(a) * ry)));
      const at = add(top, add(mul(fw0, Math.cos(a) * rx), mul(sd0, Math.sin(a) * ry)));
      const tg = norm(cross([0, 0, 1], dir));
      const flutter = Math.sin(ARM_FIRE.seed * 0.9 + i * 1.7) * 1.3;
      const half = len / 2;
      // (in two stretches, so that it can bend round a leg: hip to knee, knee to hem)
      let md = add(add(at, [0, 0, -half]), add(mul(dir, 1.6), add(mul(sw, 0.45), mul(tg, flutter * 0.4))));
      const md0 = md;
      md = settle(at, md, 6);
      let ft = add(add(md, sub(md, md0)), add([0, 0, -half], add(mul(dir, 1.6), add(mul(sw, 0.5 + 0.1 * Math.cos(i)), mul(tg, flutter)))));
      ft = settle(md, ft, 7);
      for (const [p0, p1] of [[at, md], [md, ft]] as const) {
        const along = norm(sub(p1, p0));
        const across = norm(cross(along, cross(tg, along)), tg);
        const nn = norm(cross(along, across));
        const L2 = Math.hypot(p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]);
        sc.box(coat, 'skirt', lerp3(p0, p1, 0.5), [mul(along, L2 * 0.5 + 0.4), mul(across, PANEL_HALF), mul(nn, 0.5)], 0.3, 0.9, { tag: 'panel' });
      }
    }
  }
  // the collar, standing up round his neck
  sc.cone(coat, 'torso', add(s.neck, mul(U, -1.4)), add(s.neck, add(mul(U, 1.6), mul(F, -0.6))), 3.6, 4.0, 0.6, { tag: 'collar', cuts: [{ n: F, o: F[0] * s.neck[0] + F[1] * s.neck[1] + F[2] * s.neck[2] + 1.6 }] });
  // his right arm in its sleeve, a turned-back cuff
  {
    const sh = s.shoulderR;
    const el = s.elbowR;
    const ha = s.handR;
    sc.ell(coat, 'armR', add(sh, mul(U, -0.4)), [mul(F, 3.0), mul(L, 2.8), mul(U, 2.8)], 1.8);
    sc.cone(coat, 'armR', sh, el, 2.9, 2.5, 1.4);
    sc.cone(coat, 'armR', el, lerp3(el, ha, 0.72), 2.5, 2.3, 1.2);
    sc.cone(coat, 'armR', lerp3(el, ha, 0.62), lerp3(el, ha, 0.76), 2.75, 2.75, 0.4, { tag: 'hem' });
    // his hand, clamped round the demon's arm
    const [d, o] = limbFrame(el, ha, mul(l, -1));
    sc.box(skin, 'armR', add(ha, mul(d, 0.6)), [mul(d, 1.5), mul(o, 1.1), mul(norm(cross(d, o)), 1.4)], 0.8, 0.9, { tag: 'hand' });
  }
  // trousers and boots under it
  const trousers = sc.mat({ ramp: COAT });
  t.legsIn(trousers, 1.7, 0.6);
  t.boots(t.bootMat(HIDE, null), true, null);
  // A BELT, and the red book chained at his right hip
  const belt = sc.mat({ ramp: HIDE, paint: (h) => (onBall(h.prim as Ell, h.p)[0] > 0.82 && Math.abs(onBall(h.prim as Ell, h.p)[1]) < 0.2 ? shadeOf(STEEL5, h.tone) : null) });
  t.waistBand(belt, 1.0, 1.5, 0.5);
  const book = sc.mat({
    ramp: BOOKRED,
    paint: (h) => {
      const b = onBall(h.prim as Ell, h.p);
      // the pages' edge, and a clasp of steel
      if (Math.abs(b[0]) > 0.7 && Math.abs(b[2]) < 0.75) return shadeOf(IVORY, h.tone - 1);
      if (Math.abs(b[2]) < 0.18 && b[0] > 0.3) return shadeOf(STEEL5, h.tone);
      return null;
    },
  });
  const hipR = add(t.belly.c, add(mul(l, -(t.belly.h[1] + 2.4)), add(mul(f, 0.6), mul(u, -t.belly.h[2] * 1.4))));
  sc.box(book, 'book', hipR, [mul(f, 2.4), mul(l, 1.1), mul(u, 3.0)], 0.5, 0.2, { tag: 'book' });
  const steel = sc.mat({ ramp: STEEL5 });
  const ring = add(t.belly.c, add(mul(l, -(t.belly.h[1] + 1.2)), add(mul(f, 1.4), mul(u, -t.belly.h[2] * 0.5))));
  for (let i = 0; i < 4; i++) {
    const p = lerp3(ring, add(hipR, mul(u, 3.0)), (i + 0.5) / 4);
    sc.ell(steel, 'book', add(p, mul(f, (i % 2) * 0.3)), [mul(f, 0.55), mul(l, 0.55), mul(u, 0.7)], 0, { tag: 'link' });
  }
  // THE DEMON'S ARM, his left: red hide from the shoulder, ridged with muscle, spines down the forearm, claws, cracks of cyan
  // light; the coat's sleeve torn off at the shoulder
  {
    const sh = s.shoulderL;
    const el = s.elbowL;
    const ha = s.handL;
    const out = l;
    const hide = sc.mat({
      ramp: DEMON_RED,
      paint: (h) => {
        const p = h.prim;
        if (p.tag === 'claw' || p.tag === 'spine') return null;
        if (p.k === 'cone') {
          const { t: along, around } = onCone(p, h.p, u);
          // cracks of cyan light running down it, branching; BLAZING (his pact meter full: his pick, “Arm blazes cyan
          // (Recommended)”) wider, more of them, white-hot
          const zig = Math.sin(along * 22 + around * 1.5) * 0.35;
          const wide = 1 + 0.9 * ARM_FIRE.blaze;
          if (Math.abs(around - 0.6 - zig) < 0.16 * wide || (along > 0.4 && Math.abs(around + 1.4 + zig * 0.6) < 0.12 * wide)) return ARM_FIRE.blaze > 0.5 ? (h.tone >= 1 ? '#ffffff' : CYAN[3]) : h.tone >= 2 ? CYAN[3] : CYAN[2];
          if (ARM_FIRE.blaze > 0.5 && Math.abs(around - 2.2 + zig * 0.8) < 0.1 * wide) return h.tone >= 2 ? CYAN[3] : CYAN[2];
        }
        return farSide(w, el) ? shadeOf(DEMON_RED, h.tone - 1) : null;
      },
    });
    const [ud, uo, uw] = limbFrame(sh, el, out);
    sc.ell(hide, 'armL', add(sh, add(mul(U, -0.3), mul(uo, 0.7))), [mul(F, 3.6), mul(uo, 3.3), mul(U, 3.3)], 1.8, { tag: 'delt' });
    sc.cone(hide, 'armL', sh, el, 3.3, 2.7, 1.5, { tag: 'upper' });
    sc.ell(hide, 'armL', add(lerp3(sh, el, 0.5), mul(norm(add(f, mul(uo, -0.2))), 1.0)), [mul(ud, 3.6), mul(uo, 2.6), mul(uw, 2.6)], 1.4, { tag: 'bicep' });
    const wrist = lerp3(el, ha, 0.8);
    sc.cone(hide, 'armL', el, wrist, 3.1, 2.2, 1.3, { tag: 'fore' });
    const [fd, fo, fw] = limbFrame(el, ha, out);
    sc.ell(hide, 'armL', add(lerp3(el, ha, 0.28), mul(fo, 0.6)), [mul(fd, 3.2), mul(fo, 2.7), mul(fw, 2.6)], 1.4, { tag: 'foreBulge' });
    // THE DEMON'S HAND, BIG, ITS CLAWS ROUND THE FIRE (his word, 25 Oct, asked whether he has a hand on his demon arm: “Does
    // he have a hand on his demon arm?  I thought the fire was just hiding it?”; then his pick, “Big claws round the fire
    // (Recommended)”): a broad palm turned up under the fire, four long fingers and a thumb curling up round its foot,
    // each ending in a great hooked claw of ivory, so the hand is seen with the fire in it; the fire sits just above the
    // palm (fireSeat). Thrown (ARM_FIRE.open), the claws are flung wide open.
    const { palm, pu, ps } = demonPalm(s);
    const open = ARM_FIRE.open;
    const k = DEMON_HAND.k;
    sc.ell(hide, 'armL', palm, [mul(fd, 2.5 * k), mul(ps, 2.5 * k), mul(pu, 1.4 * k)], 1.2, { tag: 'palm' });
    const claw = sc.mat({ ramp: IVORY, paint: (h) => (h.prim.tag === 'claw' && onCone(h.prim as Cone, h.p, pu).t < 0.22 ? shadeOf(IVORY, h.tone - 2) : null) });
    // (A CUP OF CLAWS round the fire's foot: each finger from the rim of the palm, out and up round the fire, its claw hooked
    // in over it; four round the far side of the palm, the thumb round its outer side. Open, each splayed out flat.)
    const shut = 1 - open;
    const way = (a: number): V3 => add(mul(fd, Math.cos(a)), mul(ps, Math.sin(a)));
    const at = (a: number, r: number, up: number): V3 => add(palm, add(mul(way(a), r * k), mul(pu, up * k)));
    const mix = (c: [number, number], o: [number, number]): [number, number] => [c[0] * shut + o[0] * open, c[1] * shut + o[1] * open];
    for (const [a, thumb] of [[-1.15, false], [-0.4, false], [0.4, false], [1.15, false], [-2.1, true]] as const) {
      const s1 = thumb ? 0.85 : 1;
      const p0 = at(a, 1.9, 0.2);
      const [r1, u1] = mix([3.0 * s1, 1.6], [3.6, 0.3]);
      const [r2, u2] = mix([3.4 * s1, 3.4 * s1], [5.4, 0.2]);
      const [r3, u3] = mix([2.3, 5.4 * s1], [7.4, -0.5]);
      const p1 = at(a, r1, u1);
      const p2 = at(a, r2, u2);
      const p3 = at(a, r3, u3);
      sc.cone(hide, 'armL', p0, p1, 1.05 * k, 0.9 * k, 0.6, { tag: 'finger' });
      sc.cone(hide, 'armL', p1, p2, 0.9 * k, 0.75 * k, 0.5, { tag: 'finger' });
      // (the claw, long and hooked: in over the fire, or out)
      sc.cone(claw, 'armL', p2, p3, 0.82 * k, 0.1, 0.25, { tag: 'claw' });
    }
    // spines down the back of the forearm
    for (let i = 0; i < 3; i++) {
      const a = add(lerp3(el, wrist, 0.14 + i * 0.28), mul(fo, 2.0));
      sc.cone(claw, 'armL', a, add(a, add(mul(fo, 3.2 - i * 0.5), mul(fd, -1.6))), 0.9, 0.05, 0.3, { tag: 'spine' });
    }
    // the coat's sleeve, torn off ragged at the top of his arm
    sc.cone(coat, 'torso', add(sh, add(mul(U, 0.4), mul(out, -0.6))), add(sh, add(mul(ud, 2.2), mul(out, 0.3))), 3.3, 3.2, 0.6, { tag: 'torn' });
    // THE SPIKED PAULDRON: a plate of dark iron over the shoulder, two spikes standing off it (his pick, 25 Oct, told its
    // three pale spikes read as a hand by his face: “Darker, fewer spikes (Recommended)”)
    const iron = sc.mat({ ramp: IRON5 });
    sc.ell(iron, 'pauldron', add(sh, add(mul(U, 1.4), mul(out, 0.6))), [mul(F, 3.9), mul(out, 3.4), mul(U, 2.4)], 0.6, { tag: 'plate', cuts: [{ n: mul(U, -1) as V3, o: -(U[0] * sh[0] + U[1] * sh[1] + U[2] * sh[2]) + 0.2 }] });
    for (const [k, len] of [[-1.2, 6.4], [1.6, 5.0]] as const) {
      const base = add(sh, add(mul(U, 3.0), add(mul(out, 1.0), mul(F, k))));
      sc.cone(iron, 'pauldron', base, add(base, add(mul(U, len * 0.85), add(mul(out, len * 0.5), mul(F, k * 0.25)))), 1.3, 0.05, 0.3, { tag: 'spike' });
    }
  }
  // THE HOOD: deep, over his head, its opening a dark hollow with two points of cyan in it; the horns swept back through it
  const [hf, hl, hu] = s.face;
  const R = B.headR;
  const hat = (fw: number, lf: number, up: number): V3 => add(s.head, add(mul(hf, R[0] * fw), add(mul(hl, R[1] * lf), mul(hu, R[2] * up))));
  const hood = sc.mat({
    ramp: COAT,
    paint: (h) => {
      const [a, , c] = onHead(w, h.p);
      // inside the opening: the dark
      if (a > 0.55 && c < 0.55) return COAT[0];
      return null;
    },
  });
  sc.ell(hood, 'head', hat(-0.15, 0, 0.12), [mul(hf, R[0] * 1.32), mul(hl, R[1] * 1.3), mul(hu, R[2] * 1.22)], 1.0, { tag: 'hood' });
  sc.cone(hood, 'head', hat(-0.4, 0, -0.4), add(s.neck, add(mul(F, -1.8), mul(U, -1.2))), 3.2, 3.6, 1.6, { tag: 'hood' });
  // (the opening: the hood carved hollow before his face)
  sc.ell(hood, 'head', hat(1.15, 0, -0.18), [mul(hf, R[0] * 0.7), mul(hl, R[1] * 0.78), mul(hu, R[2] * 0.82)], 0.5, { carve: true });
  // the dark of his face in it, and his eyes
  // (seen under the hood's brim: drawn on the dark of the hood's opening, from up to its depth in front of them)
  for (const side of [1, -1]) {
    sc.mark(hat(0.84, side * 0.34, 0.02), CYAN[3], 1, 1, 0, 0, 4.5);
    // (and their light on the hollow round them, a pixel below each)
    if (HIS_FACE.dark) sc.mark(hat(0.84, side * 0.34, 0.02), CYAN[1], 1, 1, HIS_FACE.slant ? (side > 0 ? 1 : -1) : 0, HIS_FACE.slant || 1, 4.5);
  }
  // THE HORNS: from his temples through the hood, swept back and curling up at their tips
  const horn = sc.mat({
    ramp: IVORY,
    paint: (h) => {
      const { t: along } = onCone(h.prim as Cone, h.p, hu);
      // ridged, ringed round
      return Math.floor(along * 4 + (h.prim.tag === 'h1' ? 0 : 0.5)) % 2 === 0 ? shadeOf(IVORY, h.tone - 1) : null;
    },
  });
  for (const side of [1, -1]) {
    let a = hat(0.25, side * 0.62, 0.72);
    let r = 1.8;
    const dirs: V3[] = [
      norm(add(mul(hu, 1.0), add(mul(hl, side * 0.5), mul(hf, -0.2)))),
      norm(add(mul(hu, 0.5), add(mul(hl, side * 0.35), mul(hf, -1.0)))),
      norm(add(mul(hu, -0.1), add(mul(hl, side * 0.15), mul(hf, -1.0)))),
      norm(add(mul(hu, 0.6), add(mul(hl, side * 0.1), mul(hf, -0.6)))),
    ];
    dirs.forEach((d, i) => {
      const b = add(a, mul(d, 3.2));
      sc.cone(horn, 'horns', a, b, r, r * 0.74, 0.6, { tag: `h${i % 2}` });
      a = b;
      r *= 0.74;
    });
  }
  void cross;
  void sub;
  void BRASS;
  let fireNear = Infinity;
  return draw(sc, pv, CANVAS3.ax, CANVAS3.ay, CANVAS3, (st) => {
    // (THE FIRE IN THE CLAWS, the claws curled round in front of it hiding it where they are: his pick, “Big claws round the
    // fire (Recommended)”)
    const seat = sc.at(fireSeat(s, ARM_FIRE.size));
    fireNear = st.near(seat) + FIRE_DEEP;
    handFire(st, seat, ARM_FIRE.size, ARM_FIRE.t, ARM_FIRE.lean);
    // (THE ARM BLAZING, his pact meter full: cyan fire licking up all along it, shoulder to claws, pulsing)
    if (ARM_FIRE.blaze > 0) {
      const pulse = 0.8 + 0.25 * Math.sin(ARM_FIRE.t * 9);
      const along: V3[] = [];
      for (let i = 0; i < 6; i++) along.push(i < 3 ? lerp3(s.shoulderL, s.elbowL, 0.2 + i * 0.32) : lerp3(s.elbowL, s.handL, (i - 3) * 0.33 + 0.1));
      along.forEach((p, i) => {
        const size = ARM_FIRE.blaze * pulse * (1.9 + 0.5 * Math.sin(ARM_FIRE.t * 7 + i * 1.9));
        if (size > 0.9) handFire(st, sc.at(add(p, [0, 0, 2.2])), size, ARM_FIRE.t + i * 0.37, ARM_FIRE.lean);
      });
    }
  }, FRIEND_RIM, () => fireNear);
}

// THE KNIGHT, PAINTED OVER THE BONES (begun 6 Oct 2026, painted again that evening; NOT IN THE
// GAME: the game's knight is still hero_warrior.ts, until the owner has seen this one and said so).
//
// The same man as the owner picked (the Scarf Knight: a pointed helm with a nasal bar over a mail
// coif, a red tabard, a dark red scarf, a blade that glows), on a body of his own (moves3.ts,
// KNIGHT_BODY: the owner, of the first one painted over the bones, "They lost all girth,
// especially the warrior. He needs broader shoulders"). Everything of him is a solid (skin.ts):
// lit by the way its skin faces, and nearer or further from the eye pixel by pixel, so that an
// arm crosses in front of his chest and is hidden behind his own shoulder without anyone saying
// so. One painter serves both of the game's views and every pose: nothing in here knows what
// move he is making.

import type { Light, Px } from '../engine/px';
import type { TailRoot } from '../engine/tails';
import { KNIGHT_LOOK, blade, bladeLights } from './hero_warrior';
import type { KnightLook } from './hero_warrior';
import { BLADE, CYAN, GLINT, INK, MAIL, PLUM, STEEL, hash } from './kit';
import type { Painted, Ramp } from './kit';
import { GREAT_BLADE } from './moves3';
import { ball, band, cloth, eyesToward, faces, girdle, laidAlong, mid, off, rod, sided, skirtOf, stage, trunkBalls } from './skin';
import type { GameView, Stage } from './skin';
import { onBack } from './carried';
import { add, mul, sub, trunkOf } from './skeleton';
import type { Build, Posed, Skeleton, V3 } from './skeleton';

export interface Knight3 {
  build: Build;
  /** A great sword in both hands; or (not painted yet) a sword and a shield. */
  twoHanded: boolean;
  look?: KnightLook;
  /** The crisp edge of light round him (skin.ts, `edge`): a colour, or null for none. Cyan if not given: he is the player's. */
  rim?: string | null;
  /** Another head, painted in place of his own (heads to choose from: dev/options3.ts). His own if not given. */
  head?: HeadPainter;
}

/** What the painter of a head is given: where the parts of the frame are painted, the figure, its pose and its body. */
export interface HeadCtx {
  st: Stage;
  s: Skeleton;
  q: Posed;
  B: Build;
}
/**
 * A HEAD PAINTED IN PLACE OF A HERO'S OWN (the owner, 6 Oct 2026, 23:11: "maybe 10 ranger faces.
 * and 10 full faced helmets for the warrior"): everything from the neck up. It gives back what
 * flies from the head, if anything does (the game moves those: engine/tails.ts).
 */
export type HeadPainter = (c: HeadCtx) => TailRoot[] | void;

/** What a frame is painted in the light of: the moment before it, and the wind. */
export interface Around {
  /** The figure a frame earlier: cloth is left behind by however far he has moved since. */
  prev?: Skeleton | null;
  /** Where the blade has just been, newest first: its guard and its point, a few moments back (a cut leaves its streak). */
  trail?: ReadonlyArray<readonly [V3, V3]>;
  /** Where the wind has got to, 0..1 round its loop. */
  wind?: number;
}

/** The knight's helm: how much bigger than his head it is, front to back, side to side and in height. */
export const HELM: readonly [number, number, number] = [1.18, 1.26, 1.12];
/** How high on his head the slots he sees through are: clear of the root of the visor, which is below them. */
const SLOTS = 0.46;
const D = Math.PI / 180;

/** The edge of light round what is the player's. */
export const FRIEND_RIM = '#22d0e0';

export function paintKnight3(s: Skeleton, q: Posed, view: GameView, kit: Knight3, around: Around = {}): Painted {
  const st = stage(view);
  const B = kit.build;
  const look = kit.look ?? KNIGHT_LOOK;
  const lights: Light[] = [];
  /** How far the body has come since the frame before: cloth hangs back by some of it. */
  const come: V3 = around.prev ? sub(s.pelvis, around.prev.pelvis) : [0, 0, 0];
  const mine = (ramp: Ramp, p: V3): Ramp => sided(st, s, ramp, p);
  const trunk = trunkOf(B, s);
  const [aS, aE, aW] = B.armR;
  const [lH, lK, lA] = B.legR;

  // --- the legs: mail to the knee, a steel greave below it, a knee cop, a steel shoe ---
  for (const side of ['L', 'R'] as const) {
    const hip = side === 'L' ? s.hipL : s.hipR;
    const knee = side === 'L' ? s.kneeL : s.kneeR;
    const ankle = side === 'L' ? s.ankleL : s.ankleR;
    const heel = side === 'L' ? s.heelL : s.heelR;
    const toe = side === 'L' ? s.toeL : s.toeR;
    const thigh = st.part(mid(hip, knee));
    rod(thigh, st, hip, knee, lH, lK + 0.3, mine(MAIL, knee), { links: true, shade: 0.12 });
    const shin = st.part(mid(knee, ankle));
    const steel = mine(STEEL, ankle);
    // (the shoe stands on the floor: its middle line is its own thickness above it)
    rod(shin, st, add(heel, [0, 0, 1.9]), add(toe, [0, 0, 1.5]), 2.1, 1.7, steel, { shade: 0.2 });
    rod(shin, st, knee, ankle, lK + 0.55, lA + 0.6, steel);
    const cop = st.part(st.near(knee) + 0.3);
    ball(cop, st, knee, [[lK + 1.0, 0, 0], [0, lK + 1.0, 0], [0, 0, lK + 1.0]], steel);
  }

  // --- the trunk: the tabard over all of it, shoulders to hips ---
  const body = st.part(s.ribs);
  for (const o of trunkBalls(trunk, 0.9)) ball(body, st, o.c, o.axes, look.tabard);
  rod(body, st, off(s.shoulderL, s.chest, 0, -1.6, 0.2), off(s.shoulderR, s.chest, 0, 1.6, 0.2), 2.9, 2.9, look.tabard);

  // --- the skirt of the tabard: it hangs from the waist to the knee, round wherever his legs
  // have gone, its hem cut into points; and the belt over it, with its buckle in front ---
  const skirt = st.part(s.pelvis);
  const lag = mul(come, -0.8);
  cloth(skirt, st, skirtOf(s, B, { top: girdle(trunk[2], 0.55, 1.0), drop: B.thigh * 0.6, wide: B.pelvisHalf + 2.4, deep: B.pelvisDeep + 2.4, lag, wind: around.wind ?? 0 }), look.tabard, { ragged: true, folds: [40, -35, 115, -125, 180] });
  const belt = st.part(s.waist);
  const waist = girdle(trunk[2], 0.62, 1.35);
  band(belt, st, waist, PLUM, 2);
  if (st.near(s.hips[0]) > 0.05) {
    const [bx, by] = st.at(add(waist.c, waist.u));
    const z = st.near(add(waist.c, waist.u)) + 0.6;
    for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) belt.put(Math.round(bx) + i, Math.round(by) + j, i === 0 && j === 0 ? CYAN[4] : i + j < 0 ? CYAN[3] : CYAN[2], z);
  }
  /** Is the great sword put away on his back (carried.ts), and not in his hand? */
  const away = q.stow > 0.5;
  if (away && st.near(s.chest[0]) > 0) {
    // (what it hangs from: a strap from his right shoulder across his chest to his left hip)
    const a = off(s.shoulderR, s.chest, B.ribDeep * 0.8, 3.4, 0.9);
    const b = off(s.waist, s.hips, B.pelvisDeep * 0.9, B.pelvisHalf * 0.9, 1.2);
    const [x0, y0] = st.at(a);
    const [x1, y1] = st.at(b);
    const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
    for (let i = 0; i <= n; i++) {
      const x = Math.round(x0 + ((x1 - x0) * i) / n - 0.5);
      const y = Math.round(y0 + ((y1 - y0) * i) / n - 0.5);
      body.mark(x, y, PLUM[1]);
      body.mark(x + 1, y, PLUM[3]);
      body.mark(x + 1, y + 1, PLUM[2]);
    }
  }

  // --- the arms: mail, a steel pauldron on the shoulder, a cop on the elbow, a steel vambrace, a glove ---
  for (const side of ['L', 'R'] as const) {
    const sh = side === 'L' ? s.shoulderL : s.shoulderR;
    const el = side === 'L' ? s.elbowL : s.elbowR;
    const hand = side === 'L' ? s.handL : s.handR;
    const out = side === 'L' ? 1 : -1;
    const upper = st.part(mid(sh, el));
    rod(upper, st, sh, el, aS + 0.2, aE + 0.3, mine(MAIL, el), { links: true });
    const fore = st.part(mid(el, hand, 0.6));
    const steel = mine(STEEL, hand);
    rod(fore, st, el, hand, aE + 0.55, aW + 0.7, steel);
    ball(fore, st, el, [[aE + 0.9, 0, 0], [0, aE + 0.9, 0], [0, 0, aE + 0.9]], steel);
    const glove = st.part(st.near(hand) + 0.2);
    ball(glove, st, hand, [[aW + 0.95, 0, 0], [0, aW + 0.95, 0], [0, 0, aW + 0.95]], mine(PLUM, hand));
    // (the pauldron: a cap of steel over the point of the shoulder, wider than the arm it covers)
    const cap = st.part(st.near(sh) + 0.5);
    ball(cap, st, off(sh, s.chest, 0, out * 0.4, 1.1), [mul(s.chest[0], aS + 1.2), mul(s.chest[1], aS + 1.25), mul(s.chest[2], aS + 0.1)], mine(STEEL, sh));
  }

  // --- the scarf wound round the neck, thick enough to hide his chin; its two ends fly from the back of it (the game moves those) ---
  const wrap = st.part(st.near(s.neck) + 0.4);
  ball(wrap, st, off(s.neck, s.chest, 0.4, 0, -0.2), [mul(s.chest[0], 4.3), mul(s.chest[1], 6.0), mul(s.chest[2], 2.3)], look.scarf);
  const knot = off(s.neck, s.chest, -4.2, 0, 1.2);
  const [tx, ty] = st.at(knot);
  const behind = st.near(knot) < st.near(s.neck);
  const tails: TailRoot[] = [
    { id: 'w-scarf-b', x: tx, y: ty + 0.5, over: !behind },
    { id: 'w-scarf-a', x: tx, y: ty - 1, over: !behind },
  ];

  // --- the head: mail at his neck, and over all of his head A HELM WITH A POINTED VISOR (the
  // owner, 7 Oct 2026, 00:03, of ten full-face helms sketched for him: "4 for the warrior"; and
  // the night before, "10 full faced helmets for the warrior": none of his face is seen). A round
  // skull of steel; out from where his face is a cone of steel drawn to a point; over the cone
  // the two slots he sees through, a point of light in each; in the cone, the holes he breathes
  // through. (Until then: a pointed helm with a nasal bar over a mail coif, his eyes in the dark
  // slot of his face. That painter is kept, as text, in docs/kept.) ---
  if (kit.head) kit.head({ st, s, q, B });
  else {
    const [hf, hl, hu] = s.face;
    const R = B.headR;
    const head = st.part(st.near(s.head) + 0.3);
    rod(head, st, s.neck, s.skull, 2.3, 2.3, MAIL, { links: true });
    // (the skull of the helm: round, over all of his head)
    const helm = st.part(st.near(s.head) + 0.6);
    ball(helm, st, add(s.head, mul(hu, R[2] * 0.05)), [mul(hf, R[0] * HELM[0]), mul(hl, R[1] * HELM[1]), mul(hu, R[2] * HELM[2])], STEEL);
    // (where his face is, as it is drawn for whoever is looking: skin.ts, eyesToward)
    const eyes = eyesToward(st, s);
    const mid = ((eyes[0] + eyes[1]) / 2) * D;
    const out = add(mul(hf, Math.cos(mid)), mul(hl, Math.sin(mid)));
    /** A point on the helm's skin: degrees round from his nose, and a share of his head's height above its middle. */
    const on = (az: number, up: number): V3 => add(s.head, add(add(mul(hf, Math.cos(az * D) * R[0] * HELM[0]), mul(hl, Math.sin(az * D) * R[1] * HELM[1])), mul(hu, up * R[2])));
    // (the visor: a cone of steel out from his face and a little down, drawn to a point)
    const root = add(s.head, add(mul(out, R[0] * 0.55), mul(hu, -R[2] * 0.22)));
    const point = add(s.head, add(mul(out, R[0] * 2.25), mul(hu, -R[2] * 0.5)));
    const visor = st.part(st.near(point) + 0.4);
    rod(visor, st, root, point, 3.2, 0.7, STEEL);
    // (the two slots he sees through, over it, a point of light in each; and the holes he breathes through, in it)
    for (const turn of eyes) {
      if (!faces(st, s, turn)) continue;
      for (let d = -16; d <= 16; d += 4) {
        const [x, y] = st.at(on(turn + d, SLOTS));
        helm.mark(Math.round(x - 0.5), Math.round(y - 0.5), INK);
      }
      const [x, y] = st.at(on(turn, SLOTS));
      helm.mark(Math.round(x - 0.5), Math.round(y - 0.5), GLINT);
    }
    if (st.near(out) > 0.1) {
      const [x, y] = st.at(add(root, mul(sub(point, root), 0.45)));
      for (const [dx, dy] of [[0, 0], [-2, 1], [2, 0], [0, 2]] as const) visor.mark(x + dx - 0.5, y + dy - 0.5, INK);
    }
  }

  // --- the great sword: its grip in his right hand, and the streak of where it has just been;
  // or put away on his back, its hilt up over his right shoulder (carried.ts) ---
  const carried = away ? onBack(B, s, 'sword') : { grip: s.handR, point: s.point };
  const guard3 = add(carried.grip, mul(carried.point, 1.3));
  const tip3 = add(guard3, mul(carried.point, GREAT_BLADE));
  const sword = st.part(mid(guard3, tip3, 0.4));
  const [gx, gy] = st.at(carried.grip);
  const [px, py] = st.seen(carried.point);
  const seenLong = Math.hypot(px, py);
  const deg = (Math.atan2(-py, px) * 180) / Math.PI;
  const len = Math.max(2, GREAT_BLADE * seenLong - 2.7);
  if (!away && around.trail && around.trail.length > 1) {
    const moved = Math.hypot(...sub(around.trail[0][1], around.trail[around.trail.length - 1][1]));
    if (moved > 9) {
      // A crescent along the path of the point: widest and brightest just behind the blade,
      // thinning toward the end that is oldest, and breaking up there.
      const n = around.trail.length;
      const fan = st.part(st.near(mid(guard3, tip3, 0.4)) - 0.4);
      const inner = (e: readonly [V3, V3], age: number): V3 => mid(e[0], e[1], 0.5 + 0.47 * Math.pow(age, 0.7));
      for (let i = n - 1; i >= 1; i--) {
        const a = around.trail[i];
        const b = around.trail[i - 1];
        const age = (i - 0.5) / (n - 1);
        fan.poly([inner(a, i / (n - 1)), a[1], b[1], inner(b, (i - 1) / (n - 1))].map((p) => st.at(p)), age < 0.3 ? BLADE[3] : age < 0.62 ? BLADE[2] : BLADE[1]);
      }
      // (its outer edge, where the point went, is the brightest of it)
      for (let i = 1; i < n; i++) {
        const age = i / (n - 1);
        if (age > 0.6) break;
        const [x0, y0] = st.at(around.trail[i - 1][1]);
        const [x1, y1] = st.at(around.trail[i][1]);
        fan.line(Math.round(x0), Math.round(y0), Math.round(x1), Math.round(y1), age < 0.3 ? BLADE[4] : BLADE[3]);
      }
      const old = st.at(around.trail[n - 1][1]);
      const now = st.at(around.trail[0][1]);
      const far = Math.hypot(old[0] - now[0], old[1] - now[1]) || 1;
      for (let y = 0; y < fan.h; y++) for (let x = 0; x < fan.w; x++) {
        if (!fan.has(x, y)) continue;
        const k = 1 - Math.hypot(x - old[0], y - old[1]) / far;
        if (k > 0.35 && hash(x, y, 7) < (k - 0.35) * 1.5) fan.erase(x, y);
      }
      const [lx, ly] = st.at(mid(around.trail[1][0], around.trail[1][1], 0.8));
      lights.push({ x: lx, y: ly, r: 13, color: BLADE[3], a: 0.3 });
    }
  }
  blade(sword, gx, gy, deg, len, 2.6, Math.max(2, 9 * seenLong), 4);
  laidAlong(sword, st, add(carried.grip, mul(carried.point, -9)), tip3, 0.4);
  // (its light: not when it is on his back and he is between it and the eye)
  const glow = away && st.near(s.chest[0]) > 0 ? [] : bladeLights(gx, gy, deg, len);
  const whole = st.whole(kit.rim === undefined ? FRIEND_RIM : kit.rim);
  // (TRUE LEFT, the mock-up that is not in the game: seen from in front of his left side the blade
  // can be wholly behind him, which neither of the game's two views ever shows. A light of it
  // shines only as much as there is of the blade to be seen round it: none through his body.)
  for (const l of glow) {
    const k = view === 'front' || view === 'back' ? 1 : bladeSeen(whole, l.x, l.y);
    if (k >= 1) lights.push(l);
    else if (k > 0) lights.push({ ...l, a: (l.a ?? 0.5) * k });
  }

  return { px: whole, lights, tails };
}

/**
 * How much of the blade (or its streak) is to be seen round a point of the finished frame, 0 to 1:
 * none, or a few pixels peeping out, is 0; a good piece of it is 1. (Not the rim round the
 * figure, which is the blade's own cyan, laid on thin.)
 */
function bladeSeen(px: Px, x: number, y: number): number {
  let n = 0;
  for (let dy = -3; dy <= 3; dy++) {
    for (let dx = -3; dx <= 3; dx++) {
      const xx = Math.round(x) + dx;
      const yy = Math.round(y) + dy;
      if (!px.inside(xx, yy) || px.d[(yy * px.w + xx) * 4 + 3] < 255) continue;
      const c = px.get(xx, yy);
      if (c !== null && BLADE.includes(c)) n++;
    }
  }
  return n < 4 ? 0 : Math.min(1, n / 18);
}

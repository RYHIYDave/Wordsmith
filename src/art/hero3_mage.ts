// THE MAGE, PAINTED OVER THE BONES (begun 6 Oct 2026; NOT IN THE GAME: the game's mage is still
// hero_mage.ts, until the owner has seen this one move and said so).
//
// SHE IS THE ONE THE OWNER CHOSE that night at 23:51 ("yep a is good"), of ten sketched for him
// (src/dev/options3.ts, number 2, the pane "A"). His words on the way to her: "And make the mage
// female" (19:26); "i need 10 new mages. i dont think im happy with her yet. i like the faces
// being similar but i have plans for way more classes and they all cant have that face" (23:11);
// "can i get 2 from the original drawing but move the hair so i see both eyes" (23:41); and, of
// her with the glowing eyes the first heroes had, "nope, dark eyes and brown hair" (23:48).
//
//   - A POINTED HAT in her purple, its tip fallen over backward, its brim wide, a band of light
//     round it.
//   - BROWN HAIR, long, BROUGHT FORWARD OVER EACH SHOULDER FROM BEHIND HER EARS, so that none of
//     it is on her face. What hangs down her front really moves (engine/tails.ts): each frame
//     only says where the two lengths of it are fixed.
//   - HER FACE IS IN THE LIGHT, and her eyes are DARK: two pixels each, one over the other. No
//     glow in them, no scarf over her mouth.
//   - A short cape over her shoulders, a blue nearly black, a line of light at its hem; a bodice
//     of the same; her long purple skirt with its hem of light; a plum belt.
//   - A staff with A SILVER CRESCENT at its head, a crystal in the cup of it.
//
// (Until then she was a wanderer in a wide brim with a feather in it, a teal scarf wound up to
// her eyes and a satchel of books. That painter is kept, as text, in docs/kept.)
//
// She is on a body of her own (moves3.ts, MAGE_BODY: the shortest of the three, narrow in the
// shoulder, a small waist, hips wider than it). Everything of her is a solid (skin.ts), lit by
// the way its skin faces. The skirt hangs from her waist round wherever her legs have gone, so a
// lunge spreads it and a crouch pools it on the floor. THE BRIM OF THE HAT is a real plate on a
// head that turns, but it is always tipped a little from the eye (the game looks down on its
// figures: a level brim would hide her eyes whenever she looked straight ahead).

import type { Light } from '../engine/px';
import type { TailRoot } from '../engine/tails';
import { book, bookShut, mageLight } from './hero_mage';
import { BROWN, CYAN, INDIGO, INK, MAIL, NIGHT, PINK, PLUM, ROBE, SKIN4, SPARK, STEEL, TEAL, hash } from './kit';
import type { Painted, Ramp } from './kit';
import { STAFF_UP, STAFF_DOWN, WILD } from './moves3';
import { ball, band, cloth, eyesToward, faces, girdle, hidden, mid, off, rod, sided, skirtOf, stage, tippedFrom, trunkBalls } from './skin';
import type { GameView, Ring, Sheet } from './skin';
import { add, cross, dot, lerp3, mul, norm, sub, trunkOf } from './skeleton';
import type { Build, Posed, Skeleton, V3 } from './skeleton';
import { FRIEND_RIM } from './hero3_knight';
import type { Around } from './hero3_knight';

/** Her face: in the light. */
const SKIN: Ramp = [SKIN4[0], SKIN4[1], SKIN4[2], SKIN4[3], SKIN4[3]];
/** Her hands. */
const HAND: Ramp = [SKIN4[1], SKIN4[1], SKIN4[2], SKIN4[3], SKIN4[3]];
const WOOD = INDIGO;
/** The hat: how wide its brim is, from its middle to its edge, as a share of her height; how tall its point is; and how far back its tip has fallen. */
export const BRIM = 0.19;
export const POINT = 15;
export const BENT = 4.5;
/** How far below the root of her neck the cape over her shoulders hangs, and the length of hair down her front. */
export const CAPE = 5.2;
const D = Math.PI / 180;

/**
 * WHICH MAGE. `battle`, if not said: THE BATTLE MAGE IN THE POINTED HAT, WHO IS THE MAGE (the
 * owner, 7 Oct 2026, 00:24: "its going to be the battle mage i can already tell"; "no need to do
 * the other mage"). On the way to her, from 00:10: "can i see the battle mage with the original
 * hat?"; "wait no give me the pointy hat"; "and a belt"; "move the hair to see the eyes";
 * "alright give the full mock up for the pointy hat battle mage and the mage in the robes". The
 * same hat and face as the one in robes whom he chose first; but PINK HAIR IN TWO BRAIDS brought
 * forward from behind her ears (their ends move), a ragged teal cape, a SHORT robe to above the
 * knee over dark hose and tall boots, a broad BROWN BELT with a pouch on it, steel on her
 * forearms and gloves, and at the head of her staff a long crystal over a cross-bar. Of ten
 * sketched for him she was number 9 (src/dev/options3.ts).
 * `robes`: the one he chose first and then set aside (the head of this file): kept, and painted
 * only when asked for.
 */
export type MageLook = 'robes' | 'battle';

export function paintMage3(s: Skeleton, q: Posed, view: GameView, kit: { build: Build; rim?: string | null; look?: MageLook }, around: Around = {}): Painted {
  const st = stage(view);
  const B = kit.build;
  const battle = kit.look !== 'robes';
  const HAIR: Ramp = battle ? PINK : BROWN;
  const lights: Light[] = [];
  const wind = (around.wind ?? 0) * Math.PI * 2;
  const come: V3 = around.prev ? sub(s.pelvis, around.prev.pelvis) : [0, 0, 0];
  const lag = mul(come, -0.9);
  const gale = Math.max(0, q.gale);
  const mine = (ramp: Ramp, p: V3): Ramp => sided(st, s, ramp, p);
  const trunk = trunkOf(B, s);
  const [aS, aE, aW] = B.armR;
  const [lH, lK, lA] = B.legR;
  const [cf, cl, cu] = s.chest;
  const fromBehind = st.near(cf) < 0;
  const hipH = B.ankle + B.shank + B.thigh;

  // --- the legs: dark hose and soft dark boots (only the boots are seen, under the skirt) ---
  const legs: Sheet[] = [];
  for (const side of ['L', 'R'] as const) {
    const hip = side === 'L' ? s.hipL : s.hipR;
    const knee = side === 'L' ? s.kneeL : s.kneeR;
    const ankle = side === 'L' ? s.ankleL : s.ankleR;
    const heel = side === 'L' ? s.heelL : s.heelR;
    const toe = side === 'L' ? s.toeL : s.toeR;
    const thigh = st.part(mid(hip, knee));
    rod(thigh, st, hip, knee, lH, lK + 0.2, mine(MAIL, knee), { shade: 0.15 });
    const shin = st.part(mid(knee, ankle));
    const boot = mine(battle ? PLUM : NIGHT, ankle);
    rod(shin, st, add(heel, [0, 0, 1.7]), add(toe, [0, 0, 1.3]), 1.9, 1.5, boot, { shade: 0.15 });
    if (battle) {
      // (tall boots to the knee, a turned cuff at their top)
      rod(shin, st, knee, ankle, lK + 0.55, lA + 0.6, boot);
      ball(st.part(st.near(knee) + 0.2), st, lerp3(knee, ankle, 0.08), [[lK + 0.9, 0, 0], [0, lK + 0.9, 0], [0, 0, 1.3]], boot);
    } else {
      const top = lerp3(knee, ankle, 0.6);
      rod(shin, st, knee, top, lK + 0.2, lK, mine(MAIL, knee));
      rod(shin, st, top, ankle, lK + 0.4, lA + 0.6, boot);
    }
    legs.push(thigh, shin);
  }

  // --- the bodice, fitted: her ribs, and the small of her waist under them ---
  const body = st.part(s.ribs);
  const balls = trunkBalls(trunk, 0.6);
  const BODICE: Ramp = battle ? ROBE : NIGHT;
  ball(body, st, balls[0].c, balls[0].axes, BODICE);
  ball(body, st, balls[1].c, balls[1].axes, BODICE);
  // (her hips in her hose, where a short robe does not hide them)
  if (battle) ball(body, st, balls[2].c, balls[2].axes, MAIL);
  rod(body, st, off(s.shoulderL, s.chest, 0, -0.8, 0.2), off(s.shoulderR, s.chest, 0, 0.8, 0.2), 2.1, 2.1, BODICE);
  ball(body, st, off(trunk[0].c, s.chest, B.ribDeep * 0.5, 0, 0.4), [mul(cf, 2.5), mul(cl, B.ribHalf * 0.9), mul(cu, 2.4)], BODICE);
  if (battle && !fromBehind) {
    // the line it closes on, glowing, down the front
    const a = st.at(off(s.neck, s.chest, B.ribDeep + 0.4, 0, -2.5));
    const b = st.at(off(s.waist, s.hips, B.waistDeep + 0.6, 0, 1.5));
    const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1])));
    for (let i = 0; i <= n; i++) body.mark(a[0] + ((b[0] - a[0]) * i) / n - 0.5, a[1] + ((b[1] - a[1]) * i) / n - 0.5, CYAN[2]);
  }

  // --- the skirt: from her waist out over her hips and down to a wide hem a little off the
  // floor, round wherever her legs are (it pools on the floor when she crouches), stirred by the
  // wind, left behind by movement, and streaming back from a blast in her face ---
  const skirts = st.part(s.pelvis);
  const coat = battle
    ? skirtOf(s, B, { top: girdle(trunk[1], -0.15, 0.7), drop: B.thigh * 0.72, wide: B.pelvisHalf + 3.6, deep: B.pelvisDeep + 3.2, lag: mul(lag, 0.6), wind: around.wind ?? 0, gale })
    : skirtOf(s, B, { top: girdle(trunk[1], -0.15, 0.7), drop: hipH - 2.4, wide: B.pelvisHalf + 6.6, deep: B.pelvisDeep + 5.4, lag, wind: around.wind ?? 0, gale });
  cloth(skirts, st, coat, ROBE, { hem: CYAN, folds: battle ? [0, 180, 90, -90] : [0, 180] });
  // (in the long one her legs are inside it: only what is below its hem is seen)
  if (!battle) hidden(legs, skirts);
  // (a glint here and there on the cloth)
  {
    const [wx, wy] = st.at(s.pelvis);
    for (let k = 0; k < 5; k++) {
      const x = Math.round(wx + (hash(k, 3, 41) - 0.5) * 12);
      const y = Math.round(wy + 4 + hash(k, 5, 43) * 16);
      if (!battle && hash(k, Math.floor(wind * 2), 47) > 0.5) skirts.mark(x, y, CYAN[3]);
    }
  }
  const sash = st.part(s.waist);
  const waist = girdle(trunk[1], -0.1, 1.0);
  // (the battle mage's is broad and of brown leather, where it can be seen: "and a belt")
  band(sash, st, waist, battle ? BROWN : PLUM, battle ? 4 : 2);
  if (!fromBehind) {
    const at = add(waist.c, waist.u);
    const [bx, by] = st.at(at);
    for (let j = -1; j <= 0; j++) for (let i = -1; i <= 0; i++) sash.put(Math.round(bx) + i, Math.round(by) + j + (battle ? 1 : 0), i + j < -1 ? CYAN[4] : CYAN[2], st.near(at) + 0.6);
  }
  if (battle) {
    // (a pouch on the belt, at her right hip)
    const at = off(s.hipR, s.hips, 1.4, -B.pelvisHalf * 0.5 - 3.6, 1.6);
    ball(st.part(st.near(at) + 1.2), st, at, [[2.2, 0, 0], [0, 1.8, 0], [0, 0, 2.2]], mine(PLUM, at));
  }

  const [hf, hl, hu] = s.face;
  const R = B.headR;

  // --- her hair behind: out from under the hat and down to her shoulders. It begins INSIDE the
  // head (a ring of it as big as the head lay in the head's own skin, and the two were painted
  // through each other); from in front, what is seen of it either side of her neck is its
  // underside. It is left behind a little as she moves, and a blast in her face lifts it. ---
  if (!battle) {
    const top: Ring = { c: add(s.head, mul(hu, R[2] * 0.3)), u: mul(hf, R[0] * 0.86), v: mul(hl, R[1] * 0.9) };
    const neck: Ring = { c: add(s.neck, [0, 0, 0.6]), u: mul(cf, R[0] * 1.25), v: mul(cl, R[1] * 1.5) };
    // (most of her hair is forward over her shoulders: what is left behind is narrow, and ends between her shoulder blades)
    const low: Ring = { c: add(add(add(s.neck, mul(cf, -1.2 - gale * 3)), [0, 0, -5 + gale * 2]), mul(lag, 0.5)), u: mul(cf, B.ribDeep + 1.7), v: mul(cl, B.shoulderHalf * 0.62) };
    cloth(st.part(st.near(s.neck) - 0.3), st, [top, neck, low], HAIR, { arc: [68, 292], lining: 0.2, folds: [180, 130, -130] });
  }

  // --- the arms: sleeves dark to the elbow and purple below it, belled at the wrist; her hands ---
  for (const side of ['L', 'R'] as const) {
    const sh = side === 'L' ? s.shoulderL : s.shoulderR;
    const el = side === 'L' ? s.elbowL : s.elbowR;
    const hand = side === 'L' ? s.handL : s.handR;
    const upper = st.part(mid(sh, el));
    rod(upper, st, sh, el, aS + 0.5, aE + 0.5, mine(battle ? ROBE : NIGHT, el));
    const fore = st.part(mid(el, hand, 0.6));
    // (the battle mage: steel on her forearm to the wrist, and a glove)
    if (battle) rod(fore, st, el, lerp3(el, hand, 0.96), aE + 0.5, aW + 0.75, mine(STEEL, hand));
    else rod(fore, st, el, lerp3(el, hand, 0.84), aE + 0.5, aW + 1.7, mine(ROBE, hand));
    const palm = st.part(st.near(hand) + 0.2);
    ball(palm, st, hand, [[aW + 0.6, 0, 0], [0, aW + 0.6, 0], [0, 0, aW + 0.6]], mine(battle ? PLUM : HAND, hand));
  }

  // --- the cape: cloth over both shoulders, all the way round, to the middle of her upper arms.
  // Her arms come out from under it. Its hem is left behind a little by movement, stirred by the
  // wind, and pushed back by a blast in her face. ---
  {
    const top: Ring = { c: add(s.neck, mul(cu, 0.4)), u: mul(cf, B.ribDeep * 0.85), v: mul(cl, 2.7) };
    const shoulders: Ring = { c: add(s.neck, mul(cu, -1.3)), u: mul(cf, B.ribDeep + 1.5), v: mul(cl, B.shoulderHalf + aS + 0.7) };
    const sway = add(add(mul(lag, 0.4), mul(cl, Math.sin(wind + 0.6) * 0.25)), mul(cf, -gale * 1.6));
    const hem: Ring = { c: add(add(s.neck, mul(cu, battle ? -4.4 : -CAPE)), sway), u: mul(cf, B.ribDeep + 1.7), v: mul(cl, B.shoulderHalf + aS + 1.0) };
    // (the battle mage's is teal, and its hem is cut into points)
    if (battle) cloth(st.part(st.near(s.neck) + 0.1), st, [top, shoulders, hem], TEAL, { ragged: true, folds: [35, -35, 150, -150] });
    else cloth(st.part(st.near(s.neck) + 0.1), st, [top, shoulders, hem], NIGHT, { hem: CYAN, folds: [35, -35, 150, -150] });
  }

  // --- the head: her face, bare, and the hair on the back and the crown of it; her eyes ---
  const head = st.part(st.near(s.head) + 0.3);
  rod(head, st, s.neck, s.skull, 1.7, 1.7, SKIN);
  ball(head, st, s.head, [mul(hf, R[0]), mul(hl, R[1]), mul(hu, R[2])], (u, tone) => (u[0] < 0 || u[2] > 0.62 ? HAIR[tone] : SKIN[tone]));
  // (dark: each two pixels, one over the other. The hat, next, hides them when she looks down.)
  for (const turn of eyesToward(st, s)) {
    if (!faces(st, s, turn)) continue;
    const a = turn * D;
    const eye = add(s.head, add(add(mul(hf, Math.cos(a) * R[0] * 0.97), mul(hl, Math.sin(a) * R[1] * 0.97)), mul(hu, 0.14 * R[2])));
    const [x, y] = st.at(eye);
    head.mark(Math.round(x - 0.5), Math.round(y - 0.5), INK);
    head.mark(Math.round(x - 0.5), Math.round(y - 0.5) + 1, INK);
  }

  // --- her hair in front: from behind each ear forward over the collar bone, painted; and from
  // there down her front, a length that really moves (the game hangs it from where this says) ---
  const tails: TailRoot[] = [];
  for (const side of [-1, 1]) {
    const p0 = add(add(s.head, mul(hl, side * R[1] * 0.97)), add(mul(hf, -R[0] * 0.25), mul(hu, -R[2] * 0.15)));
    // (a braid lies further out, in front of the point of the shoulder; loose hair nearer her neck)
    const p1 = battle ? off(s.neck, s.chest, B.ribDeep * 0.9 + 1.5, side * B.shoulderHalf * 0.8, -2.2) : off(s.neck, s.chest, B.ribDeep * 0.9 + 1.3, side * B.shoulderHalf * 0.66, -1.6);
    const lock = st.part(mid(p0, p1));
    rod(lock, st, p0, p1, battle ? 1.45 : 1.26, battle ? 1.5 : 1.4, mine(HAIR, p1));
    if (battle) {
      // (its plaits: a darker pixel every third one along it)
      const [x0, y0] = st.at(p0);
      const [x1, y1] = st.at(p1);
      const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0));
      for (let i = 2; i < n; i += 3) lock.mark(x0 + ((x1 - x0) * i) / n - 0.5, y0 + ((y1 - y0) * i) / n - 0.5, HAIR[1]);
    }
    const [x, y] = st.at(add(p1, [0, 0, -0.6]));
    // ('a' is always the one over her right shoulder, which is the one toward the eye when she faces it: a length of hair must not change shoulders as she turns)
    const id = battle ? (side < 0 ? 'm-braid-a' : 'm-braid-b') : side < 0 ? 'm-tress-a' : 'm-tress-b';
    tails.push({ id, x, y, over: !fromBehind, blast: gale > 0.02 ? gale * 1.4 : 0 });
  }

  // --- the hat: a wide brim, and a tall cone whose tip has fallen over backward (it is left
  // behind a little by movement, and nods in the wind). Tipped from the eye, as her brim always is. ---
  {
    const hat = st.part(st.near(s.head) + 0.8);
    const U = tippedFrom(st, hu, 22);
    const F = norm(sub(hf, mul(U, dot(hf, U))), hf);
    const L = cross(U, F);
    const C0 = add(s.head, mul(hu, R[2] * 0.82));
    const wide = BRIM * B.tall;
    ball(hat, st, C0, [mul(F, wide), mul(L, wide), mul(U, 1.0)], ROBE);
    const nod = add(add(mul(lag, 0.6), mul(L, Math.sin(wind) * 0.35)), mul(F, -gale * 2.2));
    const base: Ring = { c: add(C0, mul(U, 0.9)), u: mul(F, R[0] * 1.36), v: mul(L, R[1] * 1.56) };
    const belly: Ring = { c: add(add(C0, add(mul(U, POINT * 0.5), mul(F, -BENT * 0.2))), mul(nod, 0.3)), u: mul(F, R[0] * 0.8), v: mul(L, R[1] * 0.9) };
    const neck: Ring = { c: add(add(C0, add(mul(U, POINT * 0.82), mul(F, -BENT * 0.55))), mul(nod, 0.7)), u: mul(F, R[0] * 0.42), v: mul(L, R[1] * 0.46) };
    const tip: Ring = { c: add(add(C0, add(mul(U, POINT * 0.92), mul(F, -BENT * 1.25))), nod), u: mul(F, 0.4), v: mul(L, 0.4) };
    cloth(hat, st, [tip, neck, belly, base], ROBE, { lift: 0.35 });
    band(hat, st, base, CYAN, 2, 0.5);
  }

  // --- the staff, in the right hand: the pole; at its head a crescent of silver, its horns up;
  // and in the cup of the crescent a cut crystal. (What is at its head is turned to the eye: a
  // crescent seen edge on is a line.) ---
  const p3 = s.point;
  const side3 = norm(cross(p3, st.eye), s.across);
  const foot = add(s.handR, mul(p3, -STAFF_DOWN));
  const tip3 = add(s.handR, mul(p3, STAFF_UP));
  const pole = st.part(mid(foot, tip3, 0.55));
  rod(pole, st, foot, add(tip3, mul(p3, battle ? -5.5 : -4.6)), 1.05, 1.05, WOOD);
  if (battle) {
    // (the battle mage's: a cross-bar of steel under a long crystal, like the guard of a blade)
    const bar = add(tip3, mul(p3, -5.5));
    rod(pole, st, add(bar, mul(side3, -3)), add(bar, mul(side3, 3)), 0.9, 0.9, STEEL);
  } else {
    let last: V3 | null = null;
    const n = 14;
    for (let i = 0; i <= n; i++) {
      const k = i / n;
      const a = (-138 + 276 * k) * D;
      const p = add(tip3, add(mul(p3, -Math.cos(a) * 4.6), mul(side3, Math.sin(a) * 4.6)));
      const thick = (j: number): number => 1.35 - 1.0 * Math.abs(2 * j - 1);
      if (last) rod(pole, st, last, p, thick((i - 1) / n), thick(k), STEEL);
      last = p;
    }
  }
  const gem3 = add(tip3, mul(p3, battle ? 1.2 : 0.6));
  const [tx, ty] = st.at(gem3);
  const seen3 = st.seen(p3);
  const ul = Math.hypot(seen3[0], seen3[1]) || 1;
  const ux = seen3[0] / ul;
  const uy = seen3[1] / ul;
  // how hot the crystal burns: 1 at rest, 2 gathering, 3 let go (a beam that is held burns its hottest)
  const burn = Math.max(1 + q.draw, gale > 0.6 ? 3 : 1);
  // (where the crystal has just been: a streak of its light, when the staff is swung)
  if (around.trail && around.trail.length > 1) {
    const n = around.trail.length;
    const moved = Math.hypot(...sub(around.trail[0][1], around.trail[n - 1][1]));
    if (moved > 8) {
      const fan = st.part(st.near(tip3) - 0.5);
      const inner = (e: readonly [V3, V3], age: number): V3 => mid(e[0], e[1], 0.55 + 0.42 * Math.pow(age, 0.7));
      for (let i = n - 1; i >= 1; i--) {
        const a = around.trail[i];
        const b = around.trail[i - 1];
        const age = (i - 0.5) / (n - 1);
        fan.poly([inner(a, i / (n - 1)), a[1], b[1], inner(b, (i - 1) / (n - 1))].map((p) => st.at(p)), age < 0.3 ? SPARK[3] : age < 0.62 ? SPARK[2] : SPARK[1]);
      }
      const old = st.at(around.trail[n - 1][1]);
      const far = Math.hypot(old[0] - tx, old[1] - ty) || 1;
      for (let y = 0; y < fan.h; y++) for (let x = 0; x < fan.w; x++) {
        if (!fan.has(x, y)) continue;
        const k = 1 - Math.hypot(x - old[0], y - old[1]) / far;
        if (k > 0.35 && hash(x, y, 9) < (k - 0.35) * 1.5) fan.erase(x, y);
      }
    }
  }
  // the crystal: a cut stone, long the way the staff points, as near the eye as the staff's head is. It swells as it burns.
  const gem = st.part(st.near(gem3) + 0.6);
  const half = (battle ? 2.3 : 1.9) + 0.5 * Math.min(2, burn - 1);
  const long = (battle ? 8.4 : 3.2) + 0.9 * Math.min(2, burn - 1);
  for (let y = Math.floor(ty - long - 2); y <= Math.ceil(ty + long + 2); y++) {
    for (let x = Math.floor(tx - long - 2); x <= Math.ceil(tx + long + 2); x++) {
      const dx = x + 0.5 - tx;
      const dy = y + 0.5 - ty;
      const a = -dx * uy + dy * ux;
      const b = dx * ux + dy * uy;
      if (Math.abs(a) / half + Math.abs(b) / long > 1) continue;
      const tone = dx < 0 ? (dy < 0 ? '#ffffff' : SPARK[3]) : dy < 0 ? SPARK[3] : SPARK[2];
      gem.put(x, y, burn >= 3 ? (dx + dy < 2 ? '#ffffff' : SPARK[3]) : tone, st.near(gem3) + 0.6);
    }
  }
  if (burn >= 1.5) {
    const rays = Math.max(1, Math.min(6, Math.round((burn - 1) * 3)));
    for (let k = 2; k <= rays + 4; k++) {
      const c = k <= rays ? '#ffffff' : SPARK[2];
      for (const [rx, ry] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
        const far = (rx !== 0 ? 3 : battle ? 9 : 5) + k;
        if (k > rays + (rx !== 0 ? 2 : 0)) continue;
        st.over.set(Math.round(tx - 0.5 + rx * far), Math.round(ty - 0.5 + ry * far), c);
      }
    }
  }
  const hot = Math.max(0, Math.min(2, burn - 1));
  const pulse = hot > 0.5 ? 0 : Math.sin(wind);
  // (BIG AND WILD, moves3.ts WILD: a real glow, that swells and flickers with how hot it burns; the
  // crackle and the bolts are render/fx.ts's, from the charge handed back below)
  const heat = Math.max(0, burn - 1);
  if (WILD.on) {
    // (as it is in her guard, and as big again and nearly white as a spell is let go)
    const k = Math.max(0, Math.min(1, (heat - 1.2) / 1.8));
    const s = k * k * (3 - 2 * k);
    lights.push({ x: tx, y: ty, r: 24 + 24 * s + 3 * hash(Math.round(tx), Math.round(ty), Math.round(heat * 40)), color: SPARK[3], a: 0.44 + 0.28 * s });
  }
  else lights.push({ x: tx, y: ty, r: 21 + hot * 6.5 + pulse * 1.5, color: SPARK[3], a: 0.38 + hot * 0.185 + pulse * 0.07 });

  // --- the staff brought down on the floor (prop 5; `pt` is 1 in the frame it strikes, 0 when the ring has gone) ---
  if (q.prop === 5 && q.pt > 0.02) {
    const k = Math.min(1, q.pt);
    const r = 4.5 + (1 - k) * 15;
    for (let i = 0; i < 30; i++) {
      if (k < 0.6 && i % 2 === 0) continue;
      const a = (i / 30) * Math.PI * 2;
      const [x, y] = st.at([foot[0] + Math.cos(a) * r, foot[1] + Math.sin(a) * r, 0]);
      st.over.set(Math.round(x), Math.round(y), k > 0.5 ? '#ffffff' : SPARK[3]);
      if (k > 0.75) st.over.set(Math.round(x), Math.round(y) - 1, SPARK[3]);
    }
    const [fx, fy] = st.at([foot[0], foot[1], 0]);
    if (k > 0.4) for (const [dx, dy] of [[-5, -4], [4, -6], [-2, -8], [7, -3]] as const) st.over.set(Math.round(fx + dx * (1.6 - k)), Math.round(fy + dy * (1.6 - k)), '#ffffff');
    lights.push({ x: fx, y: fy, r: 12 + (1 - k) * 8, color: SPARK[3], a: 0.55 * k });
  }

  // --- what she does when left standing: a mage light over the open hand, or a book ---
  if (q.prop === 1) {
    const [lx, ly] = st.at(s.handL);
    mageLight(st.over, lx, ly, q.pt, lights);
  }
  if (q.prop === 2) {
    const [lx, ly] = st.at(s.handL);
    const layer = st.part(st.near(s.handL) + 2.5);
    // (shut, as it is brought out from under her cape or put back; open in front of the chest)
    if (s.handL[2] < s.waist[2] + 2) bookShut(layer, lx, ly - 1);
    else book(layer, st.over, lx + 1, ly - 2, q.pt > 0.12 && q.pt < 0.88 ? ((q.pt - 0.12) / 0.76) % 1 : 0, lights);
  }

  return { px: st.whole(kit.rim === undefined ? FRIEND_RIM : kit.rim), lights, tails, charge: { x: tx, y: ty, heat } };
}

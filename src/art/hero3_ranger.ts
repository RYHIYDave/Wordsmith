// THE RANGER, PAINTED OVER THE BONES (begun 6 Oct 2026, painted again that evening; NOT IN THE
// GAME: the game's ranger is still hero_ranger.ts, until the owner has seen this one and said so).
//
// The same scout as the owner picked (the Feather-cap Scout: a mask across the eyes, a wide soft
// teal cap with a long glowing feather in it, a green jerkin with a hem cut into points, a pink
// neckerchief, a teal cloak down his back, a quiver, and a bow), on a body of his own (moves3.ts,
// RANGER_BODY: lean, an archer's shoulders). Everything of him is a solid (skin.ts), lit by the
// way its skin faces. His head is painted on its own skin, so when it turns to follow the
// squirrel or tips back along an arrow, the mask, the eyes and the cap go with it. HIS CLOAK IS
// WORN OVER HIS ARMS: it hangs from his shoulders round his back, wide enough to hold his elbows
// wherever they are, so an arm comes out from under it and never through it.

import type { Light } from '../engine/px';
import type { TailRoot } from '../engine/tails';
import { SQ_BUNCH, SQ_FLICK, SQ_RUN, SQ_SIT, squirrel } from './hero_ranger';
import { BROWN, CYAN, INDIGO, INK, LEAF, MAIL, PINK, PLUM, SKIN4, STEEL, TEAL, dim } from './kit';
import type { Painted, Ramp } from './kit';
import { onBack } from './carried';
import { BOW_BRACE, BOW_HALF } from './moves3';
import { ball, band, cloth, eyesToward, faces, girdle, mid, off, rod, sided, skirtOf, stage, thread, trunkBalls, wornOn } from './skin';
import type { GameView, Ring } from './skin';
import { add, cross, dot, heading, lerp3, mul, norm, sub, trunkOf } from './skeleton';
import type { Build, Posed, Skeleton, V3 } from './skeleton';
import { FRIEND_RIM } from './hero3_knight';
import type { Around, HeadPainter } from './hero3_knight';

const SKIN: Ramp = [SKIN4[0], SKIN4[1], SKIN4[2], SKIN4[3], SKIN4[3]];
const WOOD = INDIGO;
const SHAFT = STEEL[3];
/** His trousers: the dark blue of the kit's mail, without its links. */
const HOSE = MAIL;

/**
 * Where the squirrel is on its run, for a `pt` of 0..1: out from under the cloak onto the right
 * shoulder, round behind the neck to the left one, a sit there, back across the chest, a last look
 * from the right shoulder, and under the cloak again. Its feet, which way it looks (+1 = the way
 * he faces), and what it is doing.
 */
export function squirrelOn(s: Skeleton, B: Build, pt: number): { at: V3; looks: number; doing: 'sit' | 'run'; step: number } | null {
  const under = off(s.shoulderR, s.chest, -B.ribDeep - 1, 1.5, -7);
  const right = off(s.shoulderR, s.chest, 0, 1, 3.4);
  const nape = off(s.neck, s.chest, -3.4, 0, 3);
  const left = off(s.shoulderL, s.chest, 0, -1, 3.4);
  const chest = off(s.ribs, s.chest, B.ribDeep + 1.6, 0, B.chest * 0.55);
  const legs: [number, number, V3, V3, number, 'sit' | 'run'][] = [
    [0.0, 0.08, under, right, 1, 'run'],
    [0.08, 0.2, right, right, 1, 'sit'],
    [0.2, 0.27, right, nape, 1, 'run'],
    [0.27, 0.34, nape, left, 1, 'run'],
    [0.34, 0.56, left, left, -1, 'sit'],
    [0.56, 0.65, left, chest, -1, 'run'],
    [0.65, 0.74, chest, right, -1, 'run'],
    [0.74, 0.88, right, right, 1, 'sit'],
    [0.88, 1.0, right, under, 1, 'run'],
  ];
  for (const [t0, t1, a, b, looks, doing] of legs) {
    if (pt < t0 || pt > t1) continue;
    const k = (pt - t0) / (t1 - t0);
    return { at: lerp3(a, b, k), looks, doing, step: Math.floor(k * (t1 - t0) * 60) };
  }
  return null;
}

export function paintRanger3(s: Skeleton, q: Posed, view: GameView, kit: { build: Build; rim?: string | null; head?: HeadPainter }, around: Around = {}): Painted {
  const st = stage(view);
  const B = kit.build;
  const lights: Light[] = [];
  const wind = (around.wind ?? 0) * Math.PI * 2;
  const come: V3 = around.prev ? sub(s.pelvis, around.prev.pelvis) : [0, 0, 0];
  const lag = mul(come, -0.9);
  const mine = (ramp: Ramp, p: V3): Ramp => sided(st, s, ramp, p);
  const trunk = trunkOf(B, s);
  const [aS, aE, aW] = B.armR;
  const [lH, lK, lA] = B.legR;
  /** Is it his back that is toward the eye? */
  const fromBehind = st.near(s.chest[0]) < 0;

  // --- the legs: dark hose, and tall soft boots with a turned cuff below the knee ---
  for (const side of ['L', 'R'] as const) {
    const hip = side === 'L' ? s.hipL : s.hipR;
    const knee = side === 'L' ? s.kneeL : s.kneeR;
    const ankle = side === 'L' ? s.ankleL : s.ankleR;
    const heel = side === 'L' ? s.heelL : s.heelR;
    const toe = side === 'L' ? s.toeL : s.toeR;
    const thigh = st.part(mid(hip, knee));
    rod(thigh, st, hip, knee, lH, lK + 0.2, mine(HOSE, knee), { shade: 0.1 });
    const top = lerp3(knee, ankle, 0.28);
    const shin = st.part(mid(knee, ankle));
    const boot = mine(PLUM, ankle);
    rod(shin, st, knee, top, lK + 0.2, lK, mine(HOSE, knee));
    rod(shin, st, add(heel, [0, 0, 1.5]), add(toe, [0, 0, 1.2]), 1.7, 1.3, boot, { shade: 0.2 });
    rod(shin, st, top, ankle, lK + 0.35, lA + 0.5, boot);
    const cuff = st.part(st.near(top) + 0.3);
    ball(cuff, st, top, [[lK + 0.75, 0, 0], [0, lK + 0.75, 0], [0, 0, 1.2]], boot);
  }

  // --- THE CAPE: a short one, from his shoulders down his back to his hips. It is the part of a
  // tube that is BEHIND HIM, from shoulder to shoulder, whichever way he is turned to the eye:
  // from behind, its outside is seen; from in front, what shows of it either side of him is its
  // lining. HIS ARMS ARE IN FRONT OF IT. An elbow that is out to his side and back has the cape
  // hang inside it (the arm is seen beside the cape, not through it); one that is drawn back
  // close behind him has the cape go round behind it. ---
  {
    const f = norm([s.chest[0][0], s.chest[0][1], 0], [1, 0, 0]);
    const l = norm([s.chest[1][0], s.chest[1][1], 0], [0, 1, 0]);
    const full = B.shoulderHalf + aS + 0.9;
    let deep = B.ribDeep + 2.3;
    // (how far out the cape reaches at his left, and at his right)
    const reach: [number, number] = [full, full];
    for (const el of [s.elbowL, s.elbowR]) {
      const d = sub(el, s.ribs);
      const back = -dot(d, f);
      const side = dot(d, l);
      const out = Math.abs(side);
      if (back + aE < 0.5) continue;
      const inside = out - aE - 0.8;
      if (inside >= B.shoulderHalf * 0.7) reach[side >= 0 ? 0 : 1] = Math.min(reach[side >= 0 ? 0 : 1], inside);
      else deep = Math.max(deep, (back + aE + 1.1) / Math.sqrt(Math.max(0.2, 1 - (out / full) ** 2)));
    }
    const fly = 1.5 + Math.sin(wind) * 1.2;
    const lean = (reach[0] - reach[1]) / 2;
    const wide = (reach[0] + reach[1]) / 2;
    const top: Ring = { c: add(s.neck, mul(s.chest[2], 0.2)), u: mul(f, B.ribDeep + 1.6), v: mul(l, B.shoulderHalf + aS + 0.4) };
    const middle: Ring = { c: add(add(add(mid(s.waist, s.ribs), mul(f, -0.8)), mul(l, lean)), mul(lag, 0.4)), u: mul(f, deep), v: mul(l, wide) };
    // (it ends at his hips and is a little narrower there than at his shoulders, so that his legs are seen)
    const low = add(add(add([s.pelvis[0], s.pelvis[1], Math.max(3, s.pelvis[2] - B.thigh * 0.12)], mul(f, -1.4 - fly)), mul(l, lean)), lag);
    const hem: Ring = { c: low, u: mul(f, deep - 1.2), v: mul(l, wide - 0.9 + Math.sin(wind + 1.7) * 0.5) };
    const cloak = st.part(mid(s.ribs, low));
    cloth(cloak, st, [top, middle, hem], TEAL, { folds: [180, 140, -140, 112, -112], arc: [100, 260], lining: 0.35 });
    // the quiver: slung on his back outside the cloak, its mouth above the right shoulder, three glowing fletchings out of it
    const q0 = off(s.ribs, s.chest, -deep - 1.6, -B.shoulderHalf * 0.55, B.chest + 3.4);
    const q1 = off(s.ribs, s.chest, -deep - 2.4, B.shoulderHalf * 0.3, -4.5);
    const quiver = st.part(mid(q0, q1));
    rod(quiver, st, q1, q0, 1.7, 1.9, mine(PLUM, q0));
    for (const k of [-1, 0, 1]) {
      const a = add(q0, add(mul(s.chest[1], k * 1.0), mul(s.chest[2], 0.8)));
      const b = add(q0, add(mul(s.chest[1], k * 1.5), mul(s.chest[2], 4.6 + (k === 0 ? 1 : 0))));
      thread(quiver, st, a, b, CYAN[2], 0.5);
      const [fx, fy] = st.at(b);
      quiver.put(Math.round(fx - 0.5), Math.round(fy - 0.5), CYAN[4], st.near(b) + 0.6);
    }
  }

  // --- the jerkin: the trunk, and a skirt to the middle of his thighs whose hem is cut into points ---
  const body = st.part(s.ribs);
  for (const o of trunkBalls(trunk, 0.5)) ball(body, st, o.c, o.axes, LEAF);
  rod(body, st, off(s.shoulderL, s.chest, 0, -1.0, 0.2), off(s.shoulderR, s.chest, 0, 1.0, 0.2), 2.0, 2.0, LEAF);
  if (!fromBehind) {
    // the strap of the quiver across his chest
    const a = off(s.shoulderR, s.chest, B.ribDeep * 0.75, 2.2, 0.6);
    const b = off(s.waist, s.hips, B.pelvisDeep * 0.9, B.pelvisHalf * 0.85, 1);
    const [x0, y0] = st.at(a);
    const [x1, y1] = st.at(b);
    const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
    for (let i = 0; i <= n; i++) {
      const x = Math.round(x0 + ((x1 - x0) * i) / n - 0.5);
      const y = Math.round(y0 + ((y1 - y0) * i) / n - 0.5);
      body.mark(x, y, PLUM[1]);
      body.mark(x + 1, y, PLUM[2]);
    }
  }
  /** Is the bow put away on his back (carried.ts), and not in his hand? */
  const away = q.stow > 0.5;
  const skirt = st.part(s.pelvis);
  cloth(skirt, st, skirtOf(s, B, { top: girdle(trunk[2], 0.55, 0.6), drop: B.thigh * 0.5, wide: B.pelvisHalf + 1.9, deep: B.pelvisDeep + 1.9, lag: mul(lag, 0.6), wind: around.wind ?? 0 }), LEAF, { ragged: true, folds: [30, -45, 120, -120] });
  const belt = st.part(s.waist);
  const waist = girdle(trunk[2], 0.62, 0.9);
  band(belt, st, waist, dim(PLUM), 2);
  if (!fromBehind) {
    const at = add(waist.c, waist.u);
    const [bx, by] = st.at(at);
    for (let j = -1; j <= 0; j++) for (let i = -1; i <= 0; i++) belt.put(Math.round(bx) + i, Math.round(by) + j, i + j < -1 ? CYAN[4] : CYAN[2], st.near(at) + 0.6);
  }

  // --- the arms: green sleeves, leather bracers, gloves ---
  for (const side of ['L', 'R'] as const) {
    const sh = side === 'L' ? s.shoulderL : s.shoulderR;
    const el = side === 'L' ? s.elbowL : s.elbowR;
    const hand = side === 'L' ? s.handL : s.handR;
    const upper = st.part(mid(sh, el));
    rod(upper, st, sh, el, aS + 0.3, aE + 0.25, mine(LEAF, el));
    const fore = st.part(mid(el, hand, 0.6));
    rod(fore, st, el, hand, aE + 0.3, aW + 0.4, mine(PLUM, hand));
    const glove = st.part(st.near(hand) + 0.2);
    ball(glove, st, hand, [[aW + 0.6, 0, 0], [0, aW + 0.6, 0], [0, 0, aW + 0.6]], mine(dim(PLUM), hand));
  }

  // --- the neckerchief: pink, round the neck, its knot hanging on his chest ---
  const wrap = st.part(st.near(s.neck) + 0.4);
  ball(wrap, st, off(s.neck, s.chest, 0.3, 0, -0.3), [mul(s.chest[0], 3.4), mul(s.chest[1], 4.6), mul(s.chest[2], 1.9)], PINK);
  if (!fromBehind) ball(wrap, st, off(s.neck, s.chest, B.ribDeep * 0.9, 0.3, -3.2), [mul(s.chest[0], 1.4), mul(s.chest[1], 2.1), mul(s.chest[2], 2.2)], PINK);

  // --- the head: skin, the mask across the eyes, dark hair behind, and the wide soft cap over it all ---
  let tails: TailRoot[];
  if (kit.head) tails = kit.head({ st, s, q, B }) ?? [];
  else {
    const [hf, hl, hu] = s.face;
    const R = B.headR;
    // HIS FACE IS BARE, IN THE LIGHT, AND HE HAS A BROWN MOUSTACHE (the owner, 7 Oct 2026, 00:05,
    // of ten faces sketched for him: "10 for ranger but a brown mustache"; number 10 was an old
    // scout with a white one). Two dark eyes, each two pixels one over the other, a brow over
    // each; brown hair on the back of his head. (Until then: a dark mask across his eyes, and
    // two points of light in it. That painter is kept, as text, in docs/kept.)
    const head = st.part(st.near(s.head) + 0.3);
    rod(head, st, s.neck, s.skull, 1.9, 1.9, SKIN);
    ball(head, st, s.head, [mul(hf, R[0]), mul(hl, R[1]), mul(hu, R[2])], (u, tone) => {
      const [f, , up] = u;
      if (f < -0.2) return BROWN[tone];
      if (f > 0.15 && up < -0.14 && up > -0.46) return BROWN[Math.max(2, tone)];
      return SKIN[tone];
    });
    for (const turn of eyesToward(st, s)) {
      if (!faces(st, s, turn)) continue;
      const a = (turn * Math.PI) / 180;
      const eye = add(s.head, add(add(mul(hf, Math.cos(a) * R[0] * 0.97), mul(hl, Math.sin(a) * R[1] * 0.97)), mul(hu, 0.14 * R[2])));
      const [x, y] = st.at(eye);
      head.mark(Math.round(x - 0.5), Math.round(y - 0.5) - 1, BROWN[1]);
      head.mark(Math.round(x - 0.5), Math.round(y - 0.5), INK);
      head.mark(Math.round(x - 0.5), Math.round(y - 0.5) + 1, INK);
    }
    // (the cap: wider than his head and soft, sitting low at the back; its sag hangs off to his right and behind)
    const cap = st.part(st.near(s.head) + 0.7);
    // (tipped from the eye, as everything worn on a head is: skin.ts, TIPPED)
    const [wf0, , wu0] = wornOn(st, s);
    // A SOFT CAP SLUMPS. On a head thrown far back (Volley: he leans back and looks up) a cap as
    // wide as this, turned with the head, stood out behind it like a plate, bigger than he was
    // (the owner, 6 Oct 2026, 21:04: "something strange going on with the ranger's hat"). The
    // further the head is tipped from upright, the more the cap stays level and the less it is
    // wide: it hangs on the back of his head as cloth does.
    const slump = Math.max(0, Math.min(1, (Math.acos(Math.max(-1, Math.min(1, hu[2]))) / (Math.PI / 180) - 12) / 38));
    const wu = norm(add(mul(wu0, 1 - 0.65 * slump), [0, 0, 0.65 * slump]), wu0);
    const wf = norm(sub(wf0, mul(wu, dot(wf0, wu))), wf0);
    const wl = cross(wu, wf);
    // (it sits a little higher than it did over the mask: 0.82 of his head's half height above its middle, where it was 0.74, so that his eyes are clear of it)
    const capC = add(add(s.head, mul(hu, R[2] * (0.82 - 0.12 * slump))), mul(wf, -R[0] * (0.1 + 0.25 * slump)));
    ball(cap, st, capC, [mul(wf, R[0] * (1.42 - 0.22 * slump)), mul(wl, R[1] * (1.8 - 0.4 * slump)), mul(wu, R[2] * 0.56)], TEAL);
    ball(cap, st, add(add(capC, add(mul(wf, -R[0] * 0.85), mul(wl, -R[1] * 1.1))), [0, 0, -1.6]), [mul(wf, R[0] * 0.95), mul(wl, R[1] * 1.05), [0, 0, R[2] * 0.62]], TEAL);
    band(cap, st, { c: add(capC, mul(wu, -R[2] * 0.26)), u: mul(wf, R[0] * 1.33), v: mul(wl, R[1] * 1.7) }, dim(TEAL), 1, 0.2);
    const quill = st.at(add(capC, add(add(mul(wf, -R[0] * 0.15), mul(wl, -R[1] * 0.5)), mul(wu, R[2] * 0.55))));
    tails = [{ id: 'r-feather', x: quill[0], y: quill[1], over: true }];
  }

  // --- the bow, in his left hand: its two limbs, its string (to the fingers, when it is drawn),
  // and the arrow on it; or put away across his back (carried.ts) ---
  const carried = away ? onBack(B, s, 'bow') : { grip: s.handL, point: s.point, across: s.across };
  const grip = carried.grip;
  const p3 = carried.point;
  const ac = carried.across;
  const tipOf = (side: 1 | -1): V3 => add(grip, add(mul(ac, side * BOW_HALF * (1 - 0.13 * q.draw)), mul(p3, -(BOW_BRACE + 0.05 * B.tall * q.draw))));
  const bow = st.part(grip);
  for (const side of [1, -1] as const) {
    const ctl = add(grip, add(mul(ac, side * BOW_HALF * 0.72), mul(p3, 0.6)));
    const t = tipOf(side);
    let last: V3 = grip;
    for (let i = 1; i <= 7; i++) {
      const k = i / 7;
      const pt = add(add(mul(grip, (1 - k) * (1 - k)), mul(ctl, 2 * k * (1 - k))), mul(t, k * k));
      rod(bow, st, last, pt, 1.5 - 0.6 * ((i - 1) / 7), 1.5 - 0.6 * k, WOOD);
      last = pt;
    }
  }
  const strung = !away && q.draw >= 0.2;
  const line = st.part(grip);
  const arrow = (from: V3, to: V3): void => {
    thread(line, st, from, to, SHAFT, 0.2);
    const [x1, y1] = st.at(to);
    const [x0, y0] = st.at(from);
    const d = Math.hypot(x1 - x0, y1 - y0) || 1;
    for (let k = 0; k < 3; k++) line.put(Math.round(x1 - ((x1 - x0) / d) * k - 0.5), Math.round(y1 - ((y1 - y0) / d) * k - 0.5), k === 0 ? '#ffffff' : CYAN[3], st.near(to) + 0.4);
    for (let k = 0; k < 3; k++) line.put(Math.round(x0 + ((x1 - x0) / d) * k - 0.5), Math.round(y0 + ((y1 - y0) / d) * k - 0.5), CYAN[2], st.near(from) + 0.4);
    lights.push({ x: x1, y: y1, r: 9, color: CYAN[3], a: 0.45 });
  };
  if (strung) {
    thread(line, st, tipOf(1), s.handR, CYAN[3]);
    thread(line, st, s.handR, tipOf(-1), CYAN[3]);
    arrow(s.handR, add(s.handR, mul(p3, 0.43 * B.tall)));
  } else thread(line, st, tipOf(1), tipOf(-1), CYAN[3]);
  // what has just been loosed: one arrow (prop 3) or a fan of them (prop 4), going the way it points; `pt` is how far gone
  if (!away && (q.prop === 3 || q.prop === 4) && q.pt < 0.999) {
    const gone = Math.max(0, Math.min(1, q.pt));
    for (const turn of q.prop === 4 ? [-11, 0, 11] : [0]) {
      const d = heading(q.wAz + turn * 0.4, q.wEl + turn);
      const from = add(grip, mul(d, 8 + gone * 30));
      const to = add(grip, mul(d, 22 + gone * 42));
      const [x0, y0] = st.at(from);
      const [x1, y1] = st.at(to);
      st.over.line(Math.round(x0), Math.round(y0), Math.round(x1), Math.round(y1), turn === 0 ? '#ffffff' : CYAN[3]);
    }
    const [lx, ly] = st.at(add(grip, mul(p3, 12)));
    lights.push({ x: lx, y: ly, r: 15, color: CYAN[3], a: 0.5 * (1 - gone) });
  }

  // --- what he does when left standing: the squirrel on his shoulders, or an arrow held before his eye ---
  if (q.prop === 1) {
    const sq = squirrelOn(s, B, q.pt);
    if (sq) {
      const layer = st.part(st.near(sq.at) + 1.5);
      const [x, y] = st.at(sq.at);
      // (which way it looks on the screen: the way he faces is to screen-right)
      const rows = sq.doing === 'run' ? (sq.step % 2 === 0 ? SQ_RUN : SQ_BUNCH) : Math.floor(q.pt * 90) % 5 === 1 ? SQ_FLICK : SQ_SIT;
      squirrel(layer, x, y, st.seen(s.chest[0])[0] * sq.looks >= 0 ? 1 : -1, rows);
    }
  }
  if (q.prop === 2) {
    const d = heading(q.pAz, q.pEl);
    const from = add(s.handR, mul(d, -4));
    const to = add(s.handR, mul(d, 13));
    arrow(from, to);
    if (q.pt > 0 && q.pt < 1) {
      const [gx, gy] = st.at(lerp3(from, to, q.pt));
      st.over.set(Math.round(gx), Math.round(gy), '#ffffff').set(Math.round(gx) + 1, Math.round(gy), '#ffffff');
      lights.push({ x: gx, y: gy, r: 6, color: CYAN[3], a: 0.5 });
    }
  }

  return { px: st.whole(kit.rim === undefined ? FRIEND_RIM : kit.rim), lights, tails };
}

// THE RANGER REIMAGINED: "THE WIND-RUNNER" (the art chat's design, 9 Oct 2026). NOT IN THE GAME:
// painted only while REIMAGINED.ranger (art/reimagined.ts) is on, and it is OFF, until the owner has
// seen the pictures and said yes (previews/reimagined/, made by src/dev/preview_reimagined.ts and
// src/dev/preview_reimagined_gif.ts). A SKIN, as the art rulebook has it (Heroes 4: "a skin is a
// new outfit over the same bones and moves"): his body, his moves, his bow and arrows and his
// squirrel are today's. This painter began as a copy of today's (art/hero3_ranger.ts, the
// Feather-cap Scout), which is left as it is.
//
// The outfit:
//   - A HOOD AND A SHORT CAPE IN ONE (a chaperon): the hood up, and the cape over his shoulders to
//     the middle of his upper arms, its hem cut into points (the old jerkin's hem). Outside, his
//     bright leaf green, so that he still pops on the deep blue floor; inside the hood a darker
//     green. FROM THE CROWN OF THE HOOD, A LONG TAIL (a liripipe): a narrow tube of the same cloth
//     about half his height long, streaming back. It is the one thing to know him by, and it really
//     moves: it is not painted in the frames but hung from where they say and moved every frame of
//     the game ('r2-liripipe', art/reimagined.ts; engine/tails.ts).
//   - THE FEATHER from his old cap, long and glowing cyan, its quill tucked into the side of the
//     hood, sweeping back ('r2-feather').
//   - His face in the shadow of the hood: a dark indigo cloth over his nose and mouth, and above it
//     two glints of his eyes.
//   - A fitted jerkin of dark teal leather; across his chest, from his right shoulder to his left
//     hip, the brown leather strap of his quiver; a broad belt with a pouch; a leather bracer on his
//     bow arm; dark gloves.
//   - Dark hose, PALE WRAPS round his shins from the ankle to below the knee, soft low brown boots.
//   - The quiver on his back, its fletchings over his right shoulder: pale, with cyan-white tips.
//   - No neckerchief and no cap. Nothing glows on him but the friend's cyan: the feather, the
//     glints of his eyes and of the fletchings, his bowstring (as today) and the edge of light round
//     him. Pink and gold are the enemy's.
//
// THE CAPE GOES OVER HIS ARMS AS HIS OLD CLOAK DID: it is a cloth round his shoulders (skin.ts,
// `cloth`), wide enough to hold them, and an arm comes out from under its hem. Where an arm is
// lifted toward the level (the bow held out, the string drawn back) the hem rides up over it on that
// side, so that the arm leaves the cape below its hem and never through it.

import type { Light } from '../engine/px';
import type { TailRoot } from '../engine/tails';
import { SQ_BUNCH, SQ_FLICK, SQ_RUN, SQ_SIT, squirrel } from './hero_ranger';
import { squirrelOn } from './hero3_ranger';
import { BROWN, CYAN, GLINT, INDIGO, LEAF, MAIL, STEEL, TEAL } from './kit';
import type { Painted, Ramp } from './kit';
import { onBack } from './carried';
import { ARROW_LONG, BOW_BRACE, BOW_HALF, RANGER_STANCES } from './moves3';
import { P } from './palette';
import { SEEN, ball, band, cloth, eyesToward, faces, girdle, mid, off, rod, sided, skirtOf, stage, thread, trunkBalls, wornOn } from './skin';
import type { GameView, Ring, Sheet, Stage } from './skin';
import { add, dot, heading, lerp3, mul, sub, trunkOf } from './skeleton';
import type { Build, Posed, Skeleton, V3 } from './skeleton';
import { FRIEND_RIM } from './hero3_knight';
import type { Around, HeadPainter } from './hero3_knight';

const D = Math.PI / 180;
const WOOD = INDIGO;
const SHAFT = STEEL[3];
/** His hose: the dark blue of the kit's mail, without its links (as today). */
const HOSE = MAIL;
/** The hood and the cape: the ranger's own bright leaf green. */
const HOOD = LEAF;
/** Inside the hood, in its shadow: a darker green. */
const HOOD_IN: Ramp = ['#05241a', '#05241a', '#0a3624', '#0e4a2c', '#0e4a2c'];
/** His jerkin: dark teal leather. */
const JERKIN: Ramp = ['#0a2a3a', '#0a2a3a', '#0f5266', '#157a8c', '#157a8c'];
/** The sleeves of his shirt: the kit's teal, lighter than the jerkin. */
const SLEEVE = TEAL;
/** Leather: the strap, the belt, the pouch, the bracer, the quiver and the boots (the kit's brown, the game's wood). */
const LEATHER = BROWN;
/** His gloves: a darker leather. */
const GLOVE: Ramp = [P.wd1, P.wd1, P.wd2, P.wd3, P.wd3];
/** The wraps round his shins: bone, and the shadow between one turn of them and the next. */
const WRAPS: Ramp = [P.bn1, P.bn1, P.bn2, P.bn3, P.bn3];
const WRAP_GAP = P.bn1;
/** The cloth over his nose and mouth: a dark indigo, catching a little of the light under the hood. */
const VEIL: Ramp = [INDIGO[0], INDIGO[0], '#36307c', INDIGO[2], INDIGO[2]];
/** His face above it, in the deep shadow of the hood: only the glints of his eyes show in it. */
const SHADED: Ramp = ['#140f34', '#140f34', '#1e1846', '#2c2454', '#2c2454'];
/** The fletchings of his arrows in the quiver: pale, and their tips. */
const FLETCH: Ramp = [P.bn2, P.bn2, P.bn3, P.bn4, P.bn4];
const FLETCH_TIP = CYAN[4];

/** The hood: how much bigger it is than his head, front to back, side to side and in height; and how far it is tipped from the eye (less than a cap is: it is round his head, not on it). */
export const HOOD_SIZE: readonly [number, number, number] = [1.22, 1.3, 1.14];
const HOOD_TIP = 10;
/** Where the crown of the hood is drawn out to, behind his head and up (shares of his head's depth and height): the root of its tail. */
const PEAK: readonly [number, number] = [2.0, 0.7];
/** The opening of the hood for his face: how far round it reaches either side of the middle of his face (degrees), where its middle is (up the hood, from -1 to 1), and how far up and down from there. */
const OPENING: readonly [number, number, number] = [58, -0.1, 0.66];
/** The cape: how far below the root of his neck its hem hangs (about the middle of his upper arms), and how far up it may ride over an arm that is lifted. */
export const CAPE_DROP = 6.8;
const CAPE_RIDE = 4.2;
/** How far round from an arm the hem rides up with it (degrees either side). */
const RIDE_ARC = 60;
/** The points of the cape's hem: how many pixels each column of it loses from its foot, column by column across the picture. */
const DAGS: readonly number[] = [0, 1, 2, 3, 2, 1];

/** Is a pixel of a sheet one of these colours? (So that a mark goes on the face, not on the hood in front of it.) */
function isOf(p: Sheet, x: number, y: number, ramp: Ramp): boolean {
  const c = p.get(Math.round(x), Math.round(y));
  return c !== null && ramp.includes(c);
}

/** Cut the hem of a cloth into points: each column of the part loses `cuts[x]` pixels from its foot (the pattern repeats across the picture). */
function dagged(p: Sheet, cuts: readonly number[]): void {
  const W = p.w;
  for (let x = 0; x < W; x++) {
    let y = p.h - 1;
    while (y >= 0 && p.d[(y * W + x) * 4 + 3] === 0) y--;
    const n = cuts[x % cuts.length];
    for (let k = 0; k < n && y - k >= 0; k++) {
      const i = (y - k) * W + x;
      if (p.d[i * 4 + 3] === 0) break;
      p.erase(x, y - k);
      p.z[i] = NaN;
    }
  }
}

/**
 * THE WRAPS ROUND A SHIN: a rod of bone from `a` to `b`, and across it every three pixels down it
 * a line of shadow, slanting as a band wound round and round a leg does, so that it reads as turn
 * after turn of cloth.
 */
function wraps(p: Sheet, st: Stage, a: V3, b: V3, ra: number, rb: number, ramp: Ramp): void {
  rod(p, st, a, b, ra, rb, ramp);
  const [x0, y0] = st.at(a);
  const [x1, y1] = st.at(b);
  const dx = x1 - x0;
  const dy = y1 - y0;
  const L = Math.hypot(dx, dy) || 1;
  const ux = dx / L;
  const uy = dy / L;
  const R = Math.max(ra, rb) * SEEN + 1;
  for (let y = Math.floor(Math.min(y0, y1) - R); y <= Math.ceil(Math.max(y0, y1) + R); y++) {
    for (let x = Math.floor(Math.min(x0, x1) - R); x <= Math.ceil(Math.max(x0, x1) + R); x++) {
      const px = x + 0.5 - x0;
      const py = y + 0.5 - y0;
      const t = px * ux + py * uy;
      const c = -px * uy + py * ux;
      if (t < 1 || t > L - 0.5) continue;
      const r = (ra + ((rb - ra) * t) / L) * SEEN;
      if (Math.abs(c) > r) continue;
      const k = Math.floor(t + c * 0.65);
      if (((k % 3) + 3) % 3 === 0) p.mark(x, y, WRAP_GAP);
    }
  }
}

export function paintRanger3b(s: Skeleton, q: Posed, view: GameView, kit: { build: Build; rim?: string | null; head?: HeadPainter }, around: Around = {}): Painted {
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
  const [cf, cl, cu] = s.chest;
  /** Is it his back that is toward the eye? */
  const fromBehind = st.near(cf) < 0;

  // --- the legs: dark hose; pale wraps round the shins from the ankle to below the knee; soft low boots ---
  for (const side of ['L', 'R'] as const) {
    const hip = side === 'L' ? s.hipL : s.hipR;
    const knee = side === 'L' ? s.kneeL : s.kneeR;
    const ankle = side === 'L' ? s.ankleL : s.ankleR;
    const heel = side === 'L' ? s.heelL : s.heelR;
    const toe = side === 'L' ? s.toeL : s.toeR;
    const thigh = st.part(mid(hip, knee));
    rod(thigh, st, hip, knee, lH, lK + 0.2, mine(HOSE, knee), { shade: 0.1 });
    const shin = st.part(mid(knee, ankle));
    const w0 = lerp3(knee, ankle, 0.16);
    const w1 = lerp3(knee, ankle, 0.84);
    rod(shin, st, knee, w0, lK + 0.2, lK + 0.2, mine(HOSE, knee));
    wraps(shin, st, w0, w1, lK + 0.45, lA + 0.55, mine(WRAPS, ankle));
    const boot = mine(LEATHER, ankle);
    rod(shin, st, add(heel, [0, 0, 1.5]), add(toe, [0, 0, 1.2]), 1.7, 1.3, boot, { shade: 0.2 });
    const top = lerp3(knee, ankle, 0.8);
    rod(shin, st, top, ankle, lA + 0.7, lA + 0.6, boot);
    // (a soft turned top)
    ball(st.part(st.near(top) + 0.3), st, top, [[lA + 1.0, 0, 0], [0, lA + 1.0, 0], [0, 0, 0.9]], boot);
  }

  // --- the jerkin: dark teal leather, fitted to him, and a short skirt of it over his hips ---
  const body = st.part(s.ribs);
  for (const o of trunkBalls(trunk, 0.4)) ball(body, st, o.c, o.axes, JERKIN);
  rod(body, st, off(s.shoulderL, s.chest, 0, -1.0, 0.2), off(s.shoulderR, s.chest, 0, 1.0, 0.2), 2.0, 2.0, JERKIN);
  if (!fromBehind) {
    // the strap of the quiver: brown leather across his chest, from his right shoulder to his left hip
    const a = off(s.shoulderR, s.chest, B.ribDeep * 0.75, 2.2, 0.6);
    const b = off(s.waist, s.hips, B.pelvisDeep * 0.9, B.pelvisHalf * 0.85, 1);
    const [x0, y0] = st.at(a);
    const [x1, y1] = st.at(b);
    const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
    for (let i = 0; i <= n; i++) {
      const x = Math.round(x0 + ((x1 - x0) * i) / n - 0.5);
      const y = Math.round(y0 + ((y1 - y0) * i) / n - 0.5);
      body.mark(x, y, LEATHER[3]);
      body.mark(x + 1, y, LEATHER[2]);
      body.mark(x + 2, y, LEATHER[1]);
    }
  }
  /** Is the bow put away on his back (carried.ts), and not in his hand? */
  const away = q.stow > 0.5;
  const skirt = st.part(s.pelvis);
  cloth(skirt, st, skirtOf(s, B, { top: girdle(trunk[2], 0.55, 0.5), drop: B.thigh * 0.3, wide: B.pelvisHalf + 1.4, deep: B.pelvisDeep + 1.4, lag: mul(lag, 0.6), wind: around.wind ?? 0 }), JERKIN, { folds: [30, -45, 120, -120] });
  // --- the belt: broad, of brown leather, a buckle of plain steel, and a pouch at his right hip ---
  const belt = st.part(s.waist);
  const waist = girdle(trunk[2], 0.62, 0.9);
  band(belt, st, waist, LEATHER, 3);
  if (!fromBehind) {
    const at = add(waist.c, waist.u);
    const [bx, by] = st.at(at);
    for (let j = -1; j <= 1; j++) for (let i = -1; i <= 0; i++) belt.put(Math.round(bx) + i, Math.round(by) + j, i + j < 0 ? STEEL[3] : STEEL[2], st.near(at) + 0.6);
  }
  {
    const a = -55 * D;
    const at = add(add(waist.c, add(mul(waist.u, Math.cos(a) * 1.08), mul(waist.v, Math.sin(a) * 1.08))), mul(s.hips[2], -1.6));
    const pouch = st.part(st.near(at) + 0.8);
    ball(pouch, st, at, [mul(s.hips[0], 1.5), mul(s.hips[1], 1.9), mul(s.hips[2], 2.1)], mine(LEATHER, at));
  }

  // --- the arms: the sleeves of the shirt under his jerkin, a lighter teal (so that an arm before
  // him is seen against the jerkin), a leather bracer on the bow arm (his left), dark gloves ---
  for (const side of ['L', 'R'] as const) {
    const sh = side === 'L' ? s.shoulderL : s.shoulderR;
    const el = side === 'L' ? s.elbowL : s.elbowR;
    const hand = side === 'L' ? s.handL : s.handR;
    const upper = st.part(mid(sh, el));
    rod(upper, st, sh, el, aS + 0.3, aE + 0.25, mine(SLEEVE, el));
    const fore = st.part(mid(el, hand, 0.6));
    rod(fore, st, el, hand, aE + 0.25, aW + 0.3, mine(SLEEVE, hand));
    if (side === 'L') rod(fore, st, lerp3(el, hand, 0.24), lerp3(el, hand, 0.9), aE + 0.6, aW + 0.7, mine(LEATHER, hand));
    const glove = st.part(st.near(hand) + 0.2);
    ball(glove, st, hand, [[aW + 0.6, 0, 0], [0, aW + 0.6, 0], [0, 0, aW + 0.6]], mine(GLOVE, hand));
  }

  // --- THE CAPE: over his shoulders, all the way round, to the middle of his upper arms, its hem
  // cut into points. His arms come out from under it: where one is lifted, the hem rides up on that
  // side to the underside of the arm where it leaves the cape, so that the cloth lies over the arm
  // and the arm comes out from under its hem, never through it. Its hem is left behind a little by
  // movement and stirred by the wind. ---
  {
    const top: Ring = { c: add(s.neck, mul(cu, 0.5)), u: mul(cf, B.ribDeep * 0.95), v: mul(cl, 3.2) };
    const shoulders: Ring = { c: add(s.neck, mul(cu, -1.2)), u: mul(cf, B.ribDeep + 1.7), v: mul(cl, B.shoulderHalf + aS + 0.8) };
    const sway = add(mul(lag, 0.4), mul(cl, Math.sin(wind + 0.6) * 0.25));
    const hc = add(add(s.neck, mul(cu, -CAPE_DROP)), sway);
    const hu = mul(cf, B.ribDeep + 2.2);
    const hv = mul(cl, B.shoulderHalf + aS + 1.4);
    // (where each arm leaves the cape, and how far up the hem must ride there)
    const rides: { az: number; up: number }[] = [];
    for (const [sh, el] of [[s.shoulderL, s.elbowL], [s.shoulderR, s.elbowR]] as [V3, V3][]) {
      for (let i = 1; i <= 16; i++) {
        const p = lerp3(sh, el, i / 16);
        const d = sub(p, s.neck);
        const z = dot(d, cu);
        if (z < -CAPE_DROP) break;
        const f = dot(d, cf);
        const l = dot(d, cl);
        // (the cape's half-widths at this height, between its shoulders and its hem)
        const k = Math.max(0, Math.min(1, (-1.2 - z) / (CAPE_DROP - 1.2)));
        const wide = B.shoulderHalf + aS + 0.8 + 0.6 * k;
        const deep = B.ribDeep + 1.7 + 0.5 * k;
        const r = aS + (aE - aS) * (i / 16);
        if ((Math.abs(l) / Math.max(1, wide - r)) ** 2 + (f / Math.max(1, deep - r)) ** 2 > 1) {
          const up = Math.min(CAPE_RIDE, Math.max(0, z - r + 0.6 + CAPE_DROP));
          if (up > 0) rides.push({ az: Math.atan2(l, f), up });
          break;
        }
      }
    }
    const pts: V3[] = [];
    for (let i = 0; i < 32; i++) {
      const a = (i / 32) * Math.PI * 2;
      let up = Math.sin(wind + a * 2) * 0.35;
      for (const r of rides) {
        const apart = Math.abs(((a - r.az + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
        if (apart < RIDE_ARC * D) up = Math.max(up, r.up * Math.cos((apart / (RIDE_ARC * D)) * (Math.PI / 2)) ** 2);
      }
      // (the back of it is what the wind and movement take most)
      const rear = Math.max(0, -Math.cos(a));
      pts.push(add(add(hc, add(mul(hu, Math.cos(a)), mul(hv, Math.sin(a)))), add(mul(cu, up), mul(lag, 0.3 * rear))));
    }
    const hem: Ring = { c: hc, u: hu, v: hv, pts };
    const cape = st.part(st.near(s.neck) + 0.1);
    cloth(cape, st, [top, shoulders, hem], HOOD, { folds: [35, -35, 150, -150, 90, -90] });
    dagged(cape, DAGS);
  }

  // --- the quiver: brown leather, slung on his back outside the cape from his left hip to above
  // his right shoulder, and the fletchings of his arrows out of it: pale, their tips cyan-white ---
  {
    const back = B.ribDeep + 2.6;
    const q0 = off(s.neck, s.chest, -back - 1.2, -B.shoulderHalf * 0.85, -0.6);
    const q1 = off(s.ribs, s.chest, -back + 0.3, B.shoulderHalf * 0.45, -0.8);
    const quiver = st.part(mid(q0, q1));
    rod(quiver, st, q1, q0, 1.35, 1.6, mine(LEATHER, q0));
    // (the arrows stand up out of it, more up than the quiver leans)
    const along = sub(q0, q1);
    const n = Math.hypot(along[0], along[1], along[2]) || 1;
    const up: V3 = add(mul(along, 0.35 / n), mul(cu, 0.65));
    for (const k of [-1, 0, 1]) {
      const a = add(q0, add(mul(cl, k * 0.8), mul(up, 0.6)));
      const b = add(q0, add(mul(cl, k * 1.5), mul(up, 4.0 + (k === 0 ? 0.8 : 0))));
      rod(quiver, st, a, b, 0.55, 0.45, FLETCH);
      const [fx, fy] = st.at(b);
      quiver.put(Math.round(fx - 0.5), Math.round(fy - 0.5), FLETCH_TIP, st.near(b) + 0.8);
    }
  }

  // --- the head: in a hood, his face in its shadow; a dark cloth over his nose and mouth, the
  // glints of his eyes above it; the long tail from the crown of the hood and the feather in its
  // side (both hung from where they are here, and moved every frame of the game) ---
  let tails: TailRoot[];
  if (kit.head) tails = kit.head({ st, s, q, B }) ?? [];
  else {
    const [hf, hl, hu] = s.face;
    const R = B.headR;
    // (the middle of his face is drawn turned toward the eye, as every face is: skin.ts, eyesToward.
    // The opening of the hood is turned with it.)
    const [e0, e1] = eyesToward(st, s);
    const toward = ((e0 + e1) / 2) * D;
    // (his face: what the opening of the hood shows of his head. Round it, the inside of the hood.)
    const face = st.part(st.near(s.head) + 0.3);
    ball(face, st, s.head, [mul(hf, R[0]), mul(hl, R[1]), mul(hu, R[2])], (u, tone) => {
      const [f, l, up] = u;
      const az = Math.atan2(l, f) - toward;
      if (Math.abs(az) > 70 * D || up > 0.66 || up < -0.95) return HOOD_IN[tone];
      if (up < -0.06) return VEIL[tone];
      return SHADED[tone];
    });
    for (const turn of [e0, e1]) {
      if (!faces(st, s, turn)) continue;
      const a = turn * D;
      const eye = add(s.head, add(add(mul(hf, Math.cos(a) * R[0] * 0.97), mul(hl, Math.sin(a) * R[1] * 0.97)), mul(hu, 0.16 * R[2])));
      const [x, y] = st.at(eye);
      if (isOf(face, x - 0.5, y - 0.5, SHADED)) face.mark(Math.round(x - 0.5), Math.round(y - 0.5), GLINT);
    }
    // (the hood: bigger than his head all round, tipped from the eye a little as all headgear is,
    // and open in front for his face, its edge turned back; its crown drawn out behind and up into
    // a point, where the tail begins)
    const [wf, wl, wu] = wornOn(st, s, HOOD_TIP);
    const hood = st.part(st.near(s.head) + 0.7);
    const C = add(add(s.head, mul(wu, R[2] * 0.08)), mul(wf, -R[0] * 0.06));
    const [sf, sl, su] = HOOD_SIZE;
    ball(hood, st, C, [mul(wf, R[0] * sf), mul(wl, R[1] * sl), mul(wu, R[2] * su)], (u, tone) => {
      const [f, l, up] = u;
      const az = Math.atan2(l, f) - toward;
      if (Math.cos(az) <= 0) return HOOD[tone];
      const e = (az / (OPENING[0] * D)) ** 2 + ((up - OPENING[1]) / OPENING[2]) ** 2;
      if (e < 1) return null;
      return e < 1.5 ? HOOD[Math.min(4, tone + 1)] : HOOD[tone];
    });
    const crown = add(C, add(mul(wf, -R[0] * 0.45), mul(wu, R[2] * 0.55)));
    const point = add(C, add(mul(wf, -R[0] * PEAK[0]), mul(wu, R[2] * PEAK[1])));
    rod(hood, st, crown, point, 2.6, 1.2, HOOD);
    const root = st.at(point);
    const quill = st.at(add(C, add(add(mul(wl, -R[1] * sl * 0.95), mul(wu, R[2] * 0.4)), mul(wf, -R[0] * 0.35))));
    tails = [
      { id: 'r2-liripipe', x: root[0], y: root[1], over: fromBehind },
      { id: 'r2-feather', x: quill[0], y: quill[1], over: true },
    ];
  }

  // --- the bow, in his left hand: its two limbs, its string (to the fingers, when it is drawn),
  // and the arrow on it; or put away across his back (carried.ts). AS TODAY'S (art/hero3_ranger.ts). ---
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
    if (RANGER_STANCES.on) {
      // (as the game draws its own arrow in flight: a shaft of light wood a game pixel thick and a
      // pale steel head two game pixels square, with no light of its own)
      const [x0, y0] = st.at(from);
      const [x1, y1] = st.at(to);
      const za = st.near(from) + 0.4;
      const zb = st.near(to) + 0.4;
      const n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
      for (let i = 0; i <= n; i++) {
        const k = i / n;
        const x = Math.round(x0 + (x1 - x0) * k - 1);
        const y = Math.round(y0 + (y1 - y0) * k - 1);
        for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) line.put(x + dx, y + dy, P.wd5, za + (zb - za) * k);
      }
      const hx = Math.round(x1 - 2);
      const hy = Math.round(y1 - 2);
      for (let dx = 0; dx < 4; dx++) for (let dy = 0; dy < 4; dy++) line.put(hx + dx, hy + dy, P.sl5, zb + 0.1);
      return;
    }
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
    arrow(s.handR, add(s.handR, mul(p3, ARROW_LONG * B.tall)));
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

  // --- what he does when left standing: the squirrel on his shoulders, or an arrow held before his eye (as today's) ---
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

// THE KNIGHT REIMAGINED: "THE BOAR KNIGHT" (the art chat's design, 9 Oct 2026). NOT IN THE GAME:
// painted only while REIMAGINED.knight (art/reimagined.ts) is on, and it is OFF, until the owner
// has seen the pictures and said yes (previews/reimagined/warrior_sheet.png, warrior_moving.gif). A
// SKIN, as the art rulebook has it (Heroes 4: "a skin is a new outfit over the same bones and
// moves"): his body, his moves and his great sword are today's. This painter began as a copy of
// today's (art/hero3_knight.ts, the Scarf Knight), which is left as it is.
//
// THE OWNER'S ONE RULE: "I just want to keep the pig helmet for sure on the warrior". HIS HEAD IS
// TODAY'S, EXACTLY: the helm with its pointed visor, painted by the very lines of today's painter
// (below, "the head", copied as they are). The rest, broad and heavy ("heavy but quick", "proud and
// daring"):
//   - BIG ROUNDED PAULDRONS of steel, three plates each (a dome over the shoulder and two lames
//     round the arm below it), the right a little bigger: his shoulders much broader than today.
//   - A DARK FUR MANTLE round his neck and over his shoulders and the top of his back, its edge
//     rough; and from under it A LONG DEEP-CRIMSON CLOAK to his calves, its hem torn into strips.
//     The cloak is his moving cloth (no scarf): it is left behind as he moves, streams out behind
//     him when he runs and stirs in the wind, and the torn strips at its hem are hung from it and
//     moved every frame of the game ('w2-strip-a' to 'c', art/reimagined.ts; engine/tails.ts). IT
//     IS BEHIND HIS ARMS AS THE FIRST RANGER'S CLOAK WAS (an elbow out behind him has it go round
//     behind the elbow), and below the waist it goes round his legs wherever they are (skin.ts,
//     skirtOf): no arm, no leg and no blade comes through it.
//   - A steel breastplate with a raised ridge down its middle; over it a SHORT RED TABARD, a panel
//     in front and one behind, the front one with his emblem: A BOAR'S HEAD in cream (his own
//     design, a few bold pixels).
//   - A heavy belt with a big round bronze buckle; a mail skirt below the tabard; steel vambraces
//     and gauntlets; steel greaves and heavy sabatons.
//   - The great sword as today, its cyan glow as today. Nothing else glows on him: bronze and cream
//     are plain colours, not lights.

import type { Light } from '../engine/px';
import type { TailRoot } from '../engine/tails';
import { RED, blade, bladeLights } from './hero_warrior';
import { BLADE, GLINT, INK, MAIL, STEEL, hash } from './kit';
import type { Painted, Ramp } from './kit';
import { GREAT_BLADE } from './moves3';
import { P } from './palette';
import { ball, band, cloth, eyesToward, faces, girdle, hidden, laidAlong, mid, off, rod, sided, skirtOf, stage, trunkBalls } from './skin';
import type { GameView, Ring, Sheet } from './skin';
import { onBack } from './carried';
import { add, dot, lerp3, mul, norm, sub, trunkOf } from './skeleton';
import type { Posed, Skeleton, V3 } from './skeleton';
import { FRIEND_RIM, HELM } from './hero3_knight';
import type { Around, Knight3 } from './hero3_knight';

const D = Math.PI / 180;
/** How high on his head the slots he sees through are (today's helm). */
const SLOTS = 0.46;

/** The tabard: the knight's own red (art/hero_warrior.ts). */
const TABARD = RED;
/** The cloak: a deep crimson, darker than the tabard; its lining darker still. */
const CRIMSON: Ramp = ['#3a0812', '#3a0812', '#781426', '#b02436', '#b02436'];
/** The fur of the mantle: a charcoal brown. */
const FUR: Ramp = ['#1a1310', '#1a1310', '#36281f', '#5a4434', '#5a4434'];
const FUR_TIP = '#7a604a';
/** Leather: the belt. */
const STRAP: Ramp = [P.wd1, P.wd1, P.wd2, P.wd3, P.wd3];
/** The buckle: bronze (a plain colour: it does not glow). */
const BRONZE: Ramp = ['#4a2c14', '#4a2c14', '#8e5c2c', '#c89a5a', '#c89a5a'];
/** The boar on his tabard: cream, its tusks ivory, its eyes and snout the tabard's dark. */
const CREAM = '#f0e6c8';
const IVORY = '#fff8e8';

/** The pauldrons: how much bigger the right one (his sword arm) is than the left; and where on each, from its top (1) to its foot (-1), the edges of the two plates below its top one are. */
const RIGHT_BIGGER = 1.14;
const LAMES: readonly number[] = [0.5, 0.08];
/** The cloak: how far above the floor its hem hangs (about the middle of his calves). */
export const CLOAK_HEM = 8.5;

/**
 * HIS BOAR: a boar's head, seen from the side and facing the way he faces (its crest of bristles,
 * its eye, its long snout and a tusk), drawn on the front of his tabard as rows of a picture.
 * c = cream, t = ivory (the tusk), d = the tabard's own dark (the eye, the end of the snout), . = none.
 */
export const BOAR: readonly string[] = [
  '.c.c.c.....',
  'cccccc.....',
  'cccccccc...',
  'ccdcccccccc',
  'ccccccccccd',
  '.cccccctc..',
  '.....tt....',
];

/** Each painted pixel of a part, on every second column and row, a tone darker in its own ramp: mail, its links showing. */
function links(p: Sheet, ramp: Ramp): void {
  for (let y = 0; y < p.h; y += 2) {
    for (let x = 0; x < p.w; x += 2) {
      const c = p.get(x, y);
      if (c === null) continue;
      const k = ramp.lastIndexOf(c);
      if (k > 0) p.mark(x, y, ramp[Math.max(0, k - 2)]);
    }
  }
}

/**
 * A HEM TORN INTO STRIPS: across the part, where its foot is, a deep notch at each of `at` (shares
 * of the way across it, so that the strips stay with the cloth as it swings), `deep` pixels deep
 * and narrowing to its top; and between them a little raggedness. Each column loses from its foot
 * as much as that says.
 */
function torn(p: Sheet, at: readonly number[], deep: number): void {
  const W = p.w;
  let x0 = W;
  let x1 = -1;
  const foot = new Int16Array(W).fill(-1);
  for (let x = 0; x < W; x++) {
    for (let y = p.h - 1; y >= 0; y--) {
      if (p.d[(y * W + x) * 4 + 3] === 0) continue;
      foot[x] = y;
      x0 = Math.min(x0, x);
      x1 = Math.max(x1, x);
      break;
    }
  }
  if (x1 < x0) return;
  for (let x = x0; x <= x1; x++) {
    if (foot[x] < 0) continue;
    let cut = hash(x, 3, 91) < 0.35 ? 1 : 0;
    for (const a of at) {
      const cx = x0 + (x1 - x0) * a;
      const d = Math.abs(x + 0.5 - cx);
      if (d < 2.6) cut = Math.max(cut, Math.round(deep * (1 - d / 2.6)));
    }
    for (let k = 0; k < cut; k++) {
      const y = foot[x] - k;
      if (y < 0 || p.d[(y * W + x) * 4 + 3] === 0) break;
      p.erase(x, y);
      p.z[y * W + x] = NaN;
    }
  }
}

export function paintKnight3b(s: Skeleton, q: Posed, view: GameView, kit: Knight3, around: Around = {}): Painted {
  const st = stage(view);
  const B = kit.build;
  const lights: Light[] = [];
  /** How far the body has come since the frame before: cloth hangs back by some of it. */
  const come: V3 = around.prev ? sub(s.pelvis, around.prev.pelvis) : [0, 0, 0];
  const lag = mul(come, -0.8);
  // (a long cloak is left behind by as much, but no further than a lunge of a few units throws it)
  const far = Math.hypot(lag[0], lag[1], lag[2]);
  const trail: V3 = far > 2.4 ? mul(lag, 2.4 / far) : lag;
  const wind = (around.wind ?? 0) * Math.PI * 2;
  const mine = (ramp: Ramp, p: V3): Ramp => sided(st, s, ramp, p);
  const trunk = trunkOf(B, s);
  const [aS, aE, aW] = B.armR;
  const [lH, lK, lA] = B.legR;
  const [cf, cl, cu] = s.chest;
  /** Is it his back that is toward the eye? */
  const fromBehind = st.near(cf) < 0;

  // --- the legs: mail to the knee, a steel greave below it, a knee cop, a heavy steel sabaton ---
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
    // (the sabaton stands on the floor: its middle line is its own thickness above it; broad, and a plate over the instep)
    rod(shin, st, add(heel, [0, 0, 2.2]), add(toe, [0, 0, 1.7]), 2.5, 2.0, steel, { shade: 0.2 });
    ball(shin, st, add(lerp3(heel, toe, 0.55), [0, 0, 2.6]), [[2.4, 0, 0], [0, 2.4, 0], [0, 0, 1.6]], steel);
    rod(shin, st, knee, ankle, lK + 0.7, lA + 0.8, steel);
    const cop = st.part(st.near(knee) + 0.3);
    ball(cop, st, knee, [[lK + 1.2, 0, 0], [0, lK + 1.2, 0], [0, 0, lK + 1.1]], steel);
  }

  // --- THE CLOAK: from his shoulders, under the mantle, down his back to his calves. It is the
  // part of a tube that is BEHIND HIM, from shoulder to shoulder (from in front, what shows of it
  // either side of him is its lining). His arms are in front of it: an elbow out to his side and
  // back has the cloak hang inside it, one drawn back close behind him has the cloak go round
  // behind it (as the first ranger's cloak did, art/hero3_ranger.ts). Below his waist it goes round
  // his legs wherever they are, as a long coat does (skin.ts, skirtOf). It is left behind by
  // however far he has just moved, streams out behind him the faster he goes, and stirs in the
  // wind; its hem is torn into strips, and three of them hang from it and fly (the game moves those). ---
  const strips: TailRoot[] = [];
  {
    const f = norm([cf[0], cf[1], 0], [1, 0, 0]);
    const l = norm([cl[0], cl[1], 0], [0, 1, 0]);
    const full = B.shoulderHalf + aS * 0.4;
    let deep = B.ribDeep + 1.7;
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
    const lean = (reach[0] - reach[1]) / 2;
    const wide = (reach[0] + reach[1]) / 2;
    // (the faster he goes, the more the back of it streams out behind him)
    const speed = Math.min(2, Math.hypot(come[0], come[1]));
    const gale = Math.min(0.32, speed * 0.2) + 0.04 * (1 + Math.sin(wind));
    const top: Ring = { c: add(s.neck, mul(cu, -0.6)), u: mul(f, B.ribDeep + 1.2), v: mul(l, B.shoulderHalf * 0.8) };
    const middle: Ring = { c: add(add(add(mid(s.waist, s.ribs), mul(f, -0.8)), mul(l, lean)), mul(trail, 0.4)), u: mul(f, deep), v: mul(l, wide) };
    const waist = { c: add(add(s.waist, mul(f, -0.6)), mul(l, lean * 0.5)), u: mul(f, Math.max(deep - 0.6, B.waistDeep + 1.6)), v: mul(l, Math.max(wide - 1.2, B.waistHalf + 1.8)) };
    const drop = Math.max(2, s.pelvis[2] - CLOAK_HEM);
    const coat = skirtOf(s, B, { top: waist, drop, wide: B.pelvisHalf + 3.4, deep: B.pelvisDeep + 3.2, lag: mul(trail, 1.2), wind: around.wind ?? 0, gale, pad: 1.3 });
    const rings: Ring[] = [top, middle, ...coat];
    const cloak = st.part(mid(s.ribs, s.pelvis));
    cloth(cloak, st, rings, CRIMSON, { folds: [180, 150, -150, 125, -125], arc: [100, 260], lining: 0.4 });
    torn(cloak, [0.2, 0.47, 0.76], 7);
    // (the three strips that fly: from the back of its hem, at a third, a half and two thirds of the way round behind him)
    const hem = coat[coat.length - 1];
    const pts = hem.pts ?? [];
    for (const [id, at] of [['w2-strip-a', 0.375], ['w2-strip-b', 0.5], ['w2-strip-c', 0.625]] as const) {
      const p = pts.length ? pts[Math.round(at * pts.length) % pts.length] : add(hem.c, mul(hem.u, -1));
      const [x, y] = st.at(add(p, [0, 0, 0.6]));
      strips.push({ id, x, y, over: fromBehind });
    }
  }

  // --- the breastplate: steel over all of his trunk, a raised ridge down its middle ---
  const body = st.part(s.ribs);
  for (const o of trunkBalls(trunk, 0.9)) ball(body, st, o.c, o.axes, STEEL);
  rod(body, st, off(s.shoulderL, s.chest, 0, -1.6, 0.2), off(s.shoulderR, s.chest, 0, 1.6, 0.2), 2.9, 2.9, STEEL);
  if (st.near(cf) > 0.05) {
    const a = off(s.neck, s.chest, B.ribDeep * 0.95 + 0.6, 0, -1.4);
    const b = add(trunk[0].c, add(mul(cf, B.ribDeep + 0.9), mul(cu, -1.0)));
    const [x0, y0] = st.at(a);
    const [x1, y1] = st.at(b);
    const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
    for (let i = 0; i <= n; i++) {
      const x = Math.round(x0 + ((x1 - x0) * i) / n - 0.5);
      const y = Math.round(y0 + ((y1 - y0) * i) / n - 0.5);
      body.mark(x, y, STEEL[4]);
      body.mark(x + 1, y, STEEL[1]);
    }
  }

  // --- the mail skirt: from his waist to above his knees, round wherever his legs have gone ---
  const mailSkirt = st.part(s.pelvis);
  cloth(mailSkirt, st, skirtOf(s, B, { top: girdle(trunk[2], 0.5, 1.0), drop: B.thigh * 0.72, wide: B.pelvisHalf + 2.2, deep: B.pelvisDeep + 2.2, lag: mul(lag, 0.6), wind: around.wind ?? 0 }), MAIL, { folds: [40, -40, 140, -140] });
  links(mailSkirt, MAIL);

  // --- THE TABARD: short and red, a panel in front and one behind, from the middle of his chest
  // to the middle of his thighs; on the front panel, his boar ---
  {
    const tabTop = girdle(trunk[0], -0.35, 1.5);
    const rings = skirtOf(s, B, { top: tabTop, drop: B.thigh * 0.42, wide: B.pelvisHalf + 2.6, deep: B.pelvisDeep + 2.6, lag: mul(lag, 0.6), wind: around.wind ?? 0, pad: 1.4 });
    const front = st.part(add(s.waist, mul(cf, B.waistDeep + 2)));
    cloth(front, st, rings, TABARD, { arc: [-56, 56], folds: [0], lining: 0.35 });
    const backPanel = st.part(add(s.waist, mul(cf, -(B.waistDeep + 2))));
    cloth(backPanel, st, rings, TABARD, { arc: [124, 236], folds: [180], lining: 0.35 });
    // (it is worn over the breastplate and the mail: what of those is under the panel toward the eye is not seen through it)
    hidden([body, mailSkirt], fromBehind ? backPanel : front);
    // (his boar, on the front panel below his belt, where it is turned toward the eye)
    if (st.near(s.hips[0]) > 0.3) {
      const at = add(s.pelvis, add(mul(s.hips[0], B.pelvisDeep + 2.8), mul(s.hips[2], -1.4)));
      const [bx, by] = st.at(at);
      const x0 = Math.round(bx) - Math.floor(BOAR[0].length / 2);
      const y0 = Math.round(by) - Math.floor(BOAR.length / 2);
      BOAR.forEach((row, j) => {
        for (let i = 0; i < row.length; i++) {
          const ch = row.charAt(i);
          if (ch === '.') continue;
          front.mark(x0 + i, y0 + j, ch === 'c' ? CREAM : ch === 't' ? IVORY : TABARD[0]);
        }
      });
    }
  }

  // --- the belt: broad and heavy, of dark leather, and a big round bronze buckle in front ---
  const belt = st.part(s.waist);
  const waist = girdle(trunk[2], 0.62, 1.9);
  band(belt, st, waist, STRAP, 3);
  if (st.near(s.hips[0]) > 0.05) {
    const at = add(add(waist.c, mul(waist.u, 1.06)), mul(s.hips[2], -0.6));
    const buckle = st.part(st.near(at) + 0.8);
    ball(buckle, st, at, [mul(s.hips[0], 1.0), mul(s.hips[1], 2.0), mul(s.hips[2], 2.0)], BRONZE);
    const [bx, by] = st.at(at);
    buckle.mark(Math.round(bx - 0.5), Math.round(by - 0.5), BRONZE[0]);
  }
  /** Is the great sword put away on his back (carried.ts), and not in his hand? */
  const away = q.stow > 0.5;

  // --- the arms: mail, a cop on the elbow, a steel vambrace, a steel gauntlet ---
  for (const side of ['L', 'R'] as const) {
    const sh = side === 'L' ? s.shoulderL : s.shoulderR;
    const el = side === 'L' ? s.elbowL : s.elbowR;
    const hand = side === 'L' ? s.handL : s.handR;
    const upper = st.part(mid(sh, el));
    rod(upper, st, sh, el, aS + 0.2, aE + 0.3, mine(MAIL, el), { links: true });
    const fore = st.part(mid(el, hand, 0.6));
    const steel = mine(STEEL, hand);
    rod(fore, st, el, lerp3(el, hand, 0.86), aE + 0.65, aW + 0.85, steel);
    ball(fore, st, el, [[aE + 1.0, 0, 0], [0, aE + 1.0, 0], [0, 0, aE + 1.0]], steel);
    const glove = st.part(st.near(hand) + 0.2);
    ball(glove, st, hand, [[aW + 1.15, 0, 0], [0, aW + 1.15, 0], [0, 0, aW + 1.05]], steel);
  }

  // --- THE PAULDRONS: big and round, of steel plates: a dome over the point of each shoulder,
  // standing out past it and down over the top of the arm, and across its lower part the edges of
  // the two plates (lames) below the top one, each lit along its top. The right one (his sword
  // arm) is a little bigger. ---
  for (const side of ['L', 'R'] as const) {
    const sh = side === 'L' ? s.shoulderL : s.shoulderR;
    const out = side === 'L' ? 1 : -1;
    const big = side === 'R' ? RIGHT_BIGGER : 1;
    const steel = mine(STEEL, sh);
    const dome = st.part(st.near(sh) + 0.7);
    ball(dome, st, off(sh, s.chest, 0, out * 2.0, 0.2), [mul(cf, (aS + 2.3) * big), mul(cl, (aS + 2.9) * big), mul(cu, (aS + 1.4) * big)], (u, tone) => {
      const up = u[2];
      for (const edge of LAMES) {
        // (the edge of a plate: dark; the plate below it is lit along its top)
        if (up < edge && up > edge - 0.15) return steel[Math.min(1, tone)];
        if (up <= edge - 0.15 && up > edge - 0.3) return steel[Math.min(4, tone + 1)];
      }
      return steel[tone];
    });
  }

  // --- THE MANTLE: dark fur round his neck, over his shoulders and the top of his back, short in
  // front and longest behind, its edge rough ---
  {
    const top: Ring = { c: add(s.neck, mul(cu, 1.1)), u: mul(cf, B.ribDeep * 0.75), v: mul(cl, 4.6) };
    const shoulders: Ring = { c: add(s.neck, mul(cu, -0.6)), u: mul(cf, B.ribDeep + 2.4), v: mul(cl, B.shoulderHalf * 0.86) };
    const pts: V3[] = [];
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      // (how far down it hangs: two units in front, eight behind)
      const down = 2.6 + 5.4 * (1 - Math.cos(a)) * 0.5;
      pts.push(add(add(s.neck, mul(cu, -down)), add(mul(cf, Math.cos(a) * (B.ribDeep + 2.8)), mul(cl, Math.sin(a) * (B.shoulderHalf * 0.9)))));
    }
    const hemC = add(s.neck, mul(cu, -5.3));
    const hem: Ring = { c: hemC, u: mul(cf, B.ribDeep + 2.8), v: mul(cl, B.shoulderHalf * 0.9), pts };
    const fur = st.part(st.near(s.neck) + 0.2);
    cloth(fur, st, [top, shoulders, hem], FUR, { folds: [30, -30, 70, -70, 110, -110, 150, -150, 180] });
    // (its rough edge: tufts of every length; and a few lighter tips in it)
    for (let x = 0; x < fur.w; x++) {
      let y = fur.h - 1;
      while (y >= 0 && fur.d[(y * fur.w + x) * 4 + 3] === 0) y--;
      if (y < 0) continue;
      const n = Math.floor(hash(x, 5, 17) * 3.2);
      for (let k = 0; k < n && y - k > 0; k++) {
        fur.erase(x, y - k);
        fur.z[(y - k) * fur.w + x] = NaN;
      }
      if (hash(x, 9, 23) > 0.55) fur.mark(x, y - n - 1, FUR_TIP);
    }
  }

  // --- the head: TODAY'S, EXACTLY (art/hero3_knight.ts): mail at his neck, and over all of his
  // head the helm with the pointed visor (the owner: "I just want to keep the pig helmet for sure
  // on the warrior"). These lines are today's painter's own, unchanged. ---
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
  // or put away on his back, its hilt up over his right shoulder (carried.ts). AS TODAY'S. ---
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
  if (!(away && st.near(s.chest[0]) > 0)) for (const l of bladeLights(gx, gy, deg, len)) lights.push(l);

  return { px: st.whole(kit.rim === undefined ? FRIEND_RIM : kit.rim), lights, tails: strips };
}

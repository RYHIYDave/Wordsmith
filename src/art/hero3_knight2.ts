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
//   - BIG BROAD PAULDRONS of steel plate, three plates each: a flat dome over the point of the
//     shoulder, lit along its top, and below it two plates (lames) round the top of the arm, each
//     flaring out a little past the one above, a dark seam under the edge of each; the right one a
//     little bigger. His shoulders much broader than today.
//   - A ROUGH COLLAR OF DARK FUR round the root of his neck and over his shoulders, behind the
//     pauldrons, standing up round the back of his neck and, highest, over his shoulders, so that it
//     shows round the helm from in front too; its edges broken into tufts, a few lighter hairs in it.
//   - From under it A LONG DEEP-CRIMSON CLOAK to his calves, its hem cut into short jagged points.
//     The cloak is his moving cloth (no scarf), painted in the frames: it is left behind as he moves,
//     streams out behind him when he runs and stirs in the wind. Nothing flies from it that the game
//     moves apart from him (long strips torn from its hem, and then short tatters, were tried: they
//     read as legs and as claws). IT IS BEHIND HIS ARMS AS THE FIRST RANGER'S CLOAK WAS (an elbow
//     out behind him has it go round behind the elbow), and below the waist it goes round his legs
//     wherever they are (skin.ts, skirtOf): no arm, no leg and no blade comes through it.
//   - A steel breastplate with a raised ridge down its middle; over it a SHORT RED TABARD, a panel
//     in front and one behind, the front one with his emblem: A BOAR'S HEAD in cream (his own
//     design, a few bold pixels).
//   - A heavy belt with a big round bronze buckle; a mail skirt below the tabard; steel vambraces
//     and gauntlets; steel greaves and heavy sabatons.
//   - The great sword as today, its cyan glow as today. Nothing else glows on him: bronze and cream
//     are plain colours, not lights.

import type { Light } from '../engine/px';
import { RED, blade, bladeLights } from './hero_warrior';
import { BLADE, GLINT, INK, MAIL, STEEL, hash } from './kit';
import type { Painted, Ramp } from './kit';
import { GREAT_BLADE } from './moves3';
import { P } from './palette';
import { ball, band, cloth, eyesToward, faces, girdle, hidden, laidAlong, mid, off, rod, sided, skirtOf, stage, trunkBalls } from './skin';
import type { GameView, Ring, Sheet, Stage } from './skin';
import { onBack } from './carried';
import { add, cross, dot, lerp3, mul, norm, sub, trunkOf } from './skeleton';
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
/** The fur of the collar: a dark brown; and the lighter tips of a few of its hairs. */
const FUR: Ramp = ['#140b05', '#140b05', '#2e1b0e', '#4a2e18', '#4a2e18'];
const FUR_TIP = '#7e5c3c';
/** Leather: the belt. */
const STRAP: Ramp = [P.wd1, P.wd1, P.wd2, P.wd3, P.wd3];
/** The buckle: bronze (a plain colour: it does not glow). */
const BRONZE: Ramp = ['#4a2c14', '#4a2c14', '#8e5c2c', '#c89a5a', '#c89a5a'];
/** The boar on his tabard: cream, its tusks ivory, its eyes and snout the tabard's dark. */
const CREAM = '#f0e6c8';
const IVORY = '#fff8e8';

/** The pauldrons: how much bigger the right one (his sword arm) is than the left; and how far each of the two plates (lames) below the dome comes down, and how much each flares out past the one above it. */
const RIGHT_BIGGER = 1.14;
const LAME: readonly [number, number] = [1.55, 0.09];
/** The steel of a seam between two plates: dark (a shade lighter where the light is on it). */
const SEAM: Ramp = [STEEL[0], STEEL[0], STEEL[0], STEEL[1], STEEL[1]];
/** The lit top edge of a plate. */
const EDGE: Ramp = [STEEL[3], STEEL[3], STEEL[4], STEEL[4], STEEL[4]];
/** The cloak: how far above the floor its hem hangs (about the middle of his calves). */
export const CLOAK_HEM = 8.5;
/** ITS RAGGED HEM: how deep its jagged points are cut up into it, the least and the most (picture pixels), and how far apart they are round it (degrees). */
const RAGS: readonly [number, number, number] = [2, 4, 22];
/** The fur collar: how high above the root of his neck its top edge, its thickest round and its foot are. */
const FUR_AT: readonly [number, number, number] = [1.0, -1.0, -3.0];
/** The fur collar where it stands up round the back of his neck and over his shoulders: how high its top edge is above the root of his neck behind him and over his shoulders, and how wide it flares there (half its width). */
const RUFF: readonly [number, number, number] = [1.6, 5.0, 7.6];

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
 * A HEM CUT INTO SHORT JAGGED POINTS, along the hem as the eye sees it (the points of its ring from
 * `from` to `to` degrees round, joined): every RAGS[2] degrees round it a point that reaches the
 * hem, and between each two a notch cut up into the cloth, 2 to 4 pixels deep (each its own). The
 * points are where they are round the hem, so they stay with the cloth as it swings and streams.
 */
function ragged(p: Sheet, st: Stage, pts: readonly V3[], from: number, to: number): void {
  const n = pts.length;
  const segs: [number, number, number, number, number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * 360;
    const a1 = ((i + 1) / n) * 360;
    if (a1 <= from || a0 >= to) continue;
    const [x0, y0] = st.at(pts[i]);
    const [x1, y1] = st.at(pts[(i + 1) % n]);
    segs.push([x0, y0, x1, y1, a0, a1]);
  }
  if (!segs.length) return;
  const most = RAGS[1] + 1;
  let bx0 = Infinity;
  let by0 = Infinity;
  let bx1 = -Infinity;
  let by1 = -Infinity;
  for (const [x0, y0, x1, y1] of segs) {
    bx0 = Math.min(bx0, x0, x1);
    by0 = Math.min(by0, y0, y1);
    bx1 = Math.max(bx1, x0, x1);
    by1 = Math.max(by1, y0, y1);
  }
  // (what of the part there was: a notch is cut in from its edge, never a hole in the middle of it,
  // where the hem, seen through the cloth, passes behind what is in front of it)
  const was = Uint8Array.from({ length: p.w * p.h }, (_, i) => (p.d[i * 4 + 3] > 0 ? 1 : 0));
  const edgeNear = (x: number, y: number, r: number): boolean => {
    for (let j = -r; j <= r; j++) {
      for (let i = -r; i <= r; i++) {
        if (i * i + j * j > r * r + r) continue;
        const xx = x + i;
        const yy = y + j;
        if (xx < 0 || yy < 0 || xx >= p.w || yy >= p.h || !was[yy * p.w + xx]) return true;
      }
    }
    return false;
  };
  for (let y = Math.floor(by0 - most); y <= Math.ceil(by1 + most); y++) {
    for (let x = Math.floor(bx0 - most); x <= Math.ceil(bx1 + most); x++) {
      if (!p.has(x, y)) continue;
      // (how far it is from the hem, and where round the hem that nearest point is)
      let best = Infinity;
      let ang = 0;
      for (const [x0, y0, x1, y1, a0, a1] of segs) {
        const dx = x1 - x0;
        const dy = y1 - y0;
        const t = Math.max(0, Math.min(1, ((x + 0.5 - x0) * dx + (y + 0.5 - y0) * dy) / (dx * dx + dy * dy || 1e-6)));
        const d = Math.hypot(x + 0.5 - x0 - dx * t, y + 0.5 - y0 - dy * t);
        if (d < best) {
          best = d;
          ang = a0 + (a1 - a0) * t;
        }
      }
      const k = Math.floor(ang / RAGS[2]);
      const f = ang / RAGS[2] - k;
      const deep = RAGS[0] + Math.round(hash(k, 4, 61) * (RAGS[1] - RAGS[0]));
      const cut = deep * (1 - Math.abs(2 * f - 1));
      if (best < cut && edgeNear(x, y, Math.ceil(cut))) {
        p.erase(x, y);
        p.z[y * p.w + x] = NaN;
      }
    }
  }
}

/** A line one pixel wide round part of a ring (from `from` to `to` degrees round it from its first line), drawn on what of `p` is painted there, on the side of the ring toward the eye: lit from the upper left. */
function lineRound(p: Sheet, st: Stage, r: Ring, ramp: Ramp, from: number, to: number): void {
  for (let a = from; a <= to; a += 2) {
    const t = a * D;
    const outward = add(mul(r.u, Math.cos(t)), mul(r.v, Math.sin(t)));
    const seen = st.seen(outward);
    if (seen[2] < 0) continue;
    const [x, y] = st.at(add(r.c, outward));
    p.mark(Math.round(x - 0.5), Math.round(y - 0.5), ramp[seen[0] < 0.25 * Math.hypot(seen[0], seen[1]) ? 3 : 2]);
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
  // wind; its hem is cut into short jagged points. ---
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
    const hem = coat[coat.length - 1];
    if (hem.pts) ragged(cloak, st, hem.pts, 100, 260);
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

  // --- THE PAULDRONS: big and broad plates of steel over the points of his shoulders. Each is a
  // flat dome, lit along its top, and below it two plates (lames) round the top of the arm, each
  // flaring out a little past the one above: a dark seam under the edge of each plate, and the
  // plate below lit along its top. They ride up a little with a raised arm. The right one (his
  // sword arm) is a little bigger. ---
  const plates: Sheet[] = [];
  for (const side of ['L', 'R'] as const) {
    const sh = side === 'L' ? s.shoulderL : s.shoulderR;
    const el = side === 'L' ? s.elbowL : s.elbowR;
    const out = side === 'L' ? 1 : -1;
    const big = side === 'R' ? RIGHT_BIGGER : 1;
    const steel = mine(STEEL, sh);
    // (its axis: down from over the shoulder, a little of the way toward the elbow; the way out from his body, and forward, square to it)
    const down = norm(add(mul(cu, -0.6), mul(norm(sub(el, sh), mul(cu, -1)), 0.4)), mul(cu, -1));
    const side0 = mul(cl, out);
    const o = norm(sub(side0, mul(down, dot(side0, down))), side0);
    const fw = norm(cross(down, o), cf);
    const ahead = dot(fw, cf) < 0 ? mul(fw, -1) : fw;
    const rF = (aS + 2.1) * big;
    const rO = (aS + 2.7) * big;
    const rU = (aS - 0.4) * big;
    // (the rim of the dome, where the first lame hangs from)
    const rim = add(off(sh, s.chest, 0, out * 2.6, 0), mul(down, -0.6));
    const dome = st.part(st.near(sh) + 0.7);
    ball(dome, st, rim, [mul(ahead, rF), mul(o, rO), mul(down, -rU)], (u, tone) => {
      if (u[2] < 0) return null;
      // (plate: flat, few tones; the top of it, where the light is, lit)
      return u[2] > 0.78 && tone >= 2 ? steel[4] : steel[Math.max(1, Math.min(3, tone))];
    });
    plates.push(dome);
    let top: Ring = { c: rim, u: mul(o, rO), v: mul(ahead, rF) };
    for (let k = 0; k < 2; k++) {
      const grow = 1 + LAME[1] * (k + 1);
      const foot: Ring = { c: add(top.c, mul(down, LAME[0])), u: mul(o, rO * grow), v: mul(ahead, rF * grow) };
      const lame = st.part(st.near(sh) + 0.65 - k * 0.05);
      cloth(lame, st, [top, foot], steel, { arc: [-125, 125], lift: 0.4 });
      // (the seam under the plate above, dark; and this plate lit along its top, just under it)
      lineRound(lame, st, { c: add(top.c, mul(down, 0.2)), u: top.u, v: top.v }, SEAM, -125, 125);
      lineRound(lame, st, { c: add(top.c, mul(down, 0.75)), u: mul(top.u, 1 + LAME[1] * 0.4), v: mul(top.v, 1 + LAME[1] * 0.4) }, EDGE, -125, 125);
      plates.push(lame);
      top = foot;
    }
  }

  // --- THE FUR: a rough collar of dark fur, thick, round the root of his neck and over the tops of
  // his shoulders under the pauldrons; and standing up round the back of his neck and, highest,
  // over his shoulders behind the pauldrons, so that from in front it shows round the helm and over
  // the pauldrons. Its edges are broken into tufts, a few lighter hairs at their tips. ---
  {
    const ring = (up: number, deep: number, wide: number): Ring => ({ c: add(s.neck, mul(cu, up)), u: mul(cf, deep), v: mul(cl, wide) });
    const pts: V3[] = [];
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      const down = -FUR_AT[2] + 0.8 * Math.max(0, -Math.cos(a)) ** 2;
      pts.push(add(add(s.neck, mul(cu, -down)), add(mul(cf, Math.cos(a) * (B.ribDeep + 1.4)), mul(cl, Math.sin(a) * B.shoulderHalf * 0.78))));
    }
    const thick = ring(FUR_AT[1], B.ribDeep + 1.9, B.shoulderHalf * 0.82);
    const roll = st.part(st.near(s.neck) + 0.2);
    cloth(roll, st, [ring(FUR_AT[0], B.ribDeep * 0.8, 4.6), thick, { ...ring(FUR_AT[2], B.ribDeep + 1.4, B.shoulderHalf * 0.78), pts }], FUR, { folds: [30, -30, 70, -70, 110, -110, 150, -150, 180] });
    // (standing up round the back of his neck and over his shoulders, highest over the shoulders,
    // behind the pauldrons: from in front its inside shows round the helm and over the pauldrons;
    // from behind it is low behind the helm, which it leaves as it is)
    const ruff = st.part(add(s.neck, mul(cf, -1)));
    const edge: V3[] = [];
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      const up = RUFF[0] + (RUFF[1] - RUFF[0]) * Math.sin(a) ** 2;
      edge.push(add(add(s.neck, mul(cu, up)), add(mul(cf, Math.cos(a) * B.ribDeep - 0.8), mul(cl, Math.sin(a) * RUFF[2]))));
    }
    const rim: Ring = { c: add(add(s.neck, mul(cu, (RUFF[0] + RUFF[1]) / 2)), mul(cf, -0.8)), u: mul(cf, B.ribDeep), v: mul(cl, RUFF[2]), pts: edge };
    cloth(ruff, st, [rim, thick], FUR, { arc: [62, 298], lining: 0.12, folds: [75, -75, 105, -105, 140, -140] });
    // (its edges: tufts, every column its own, along its foot and along its top; on a few a lighter tip)
    for (const [fur, seed] of [[roll, 17], [ruff, 29]] as const) {
      for (let x = 0; x < fur.w; x++) {
        let y = fur.h - 1;
        while (y >= 0 && !fur.has(x, y)) y--;
        if (y < 0) continue;
        const h = hash(x, 5, seed);
        let end = y;
        if (h < 0.3) {
          fur.erase(x, y);
          fur.z[y * fur.w + x] = NaN;
          end = y - 1;
        } else if (h > 0.55) {
          const z = fur.nearAt(x, y);
          const n = h > 0.85 ? 2 : 1;
          for (let k = 1; k <= n; k++) fur.put(x, y + k, FUR[1], z);
          end = y + n;
        }
        if (hash(x, 9, seed + 6) > 0.68) fur.mark(x, end, FUR_TIP);
        let t = 0;
        while (t < fur.h && !fur.has(x, t)) t++;
        if (t >= end) continue;
        const g = hash(x, 7, seed + 24);
        if (g > 0.5) {
          const z = fur.nearAt(x, t);
          const n = g > 0.82 ? 2 : 1;
          for (let k = 1; k <= n; k++) fur.put(x, t - k, FUR[2], z);
          if (hash(x, 3, seed + 2) > 0.6) fur.mark(x, t - n, FUR_TIP);
        } else if (g < 0.22) {
          fur.erase(x, t);
          fur.z[t * fur.w + x] = NaN;
        }
      }
    }
    // (and a few lighter hairs in the lit side of it)
    for (const fur of [roll, ruff]) {
      for (let y = 0; y < fur.h; y++) {
        for (let x = 0; x < fur.w; x++) {
          const c = fur.get(x, y);
          if (c !== null && FUR.lastIndexOf(c) >= 3 && hash(x, y, 53) < 0.16) fur.mark(x, y, FUR_TIP);
        }
      }
    }
    // (the pauldrons are over it: what of it is under them is not seen)
    for (const plate of plates) hidden(fromBehind ? [ruff] : [roll, ruff], plate);
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

  return { px: st.whole(kit.rim === undefined ? FRIEND_RIM : kit.rim), lights, tails: [] };
}

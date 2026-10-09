// THE MAGE REIMAGINED: "THE STORM-WITCH" (the art chat's design, 9 Oct 2026). NOT IN THE GAME:
// painted only while REIMAGINED.mage (art/reimagined.ts) is on, and it is OFF, until the owner has
// seen the pictures and said yes (previews/reimagined/mage_sheet.png, mage_moving.gif). A SKIN, as
// the art rulebook has it (Heroes 4: "a skin is a new outfit over the same bones and moves"): her
// body, her moves, her face and her staff are today's. This painter began as a copy of today's
// battle mage (art/hero3_mage.ts), which is left as it is. What the owner chose is kept, and she is
// made wilder:
//   - THE POINTED HAT in her purple (as today's), taller, its tip bent over and a little twisted,
//     its brim wider at her sides and behind (its front edge where it was: her eyes are seen) with
//     one notch torn out of it; the band of cyan light round it kept; and three small rune charms
//     hanging from the brim on threads, each with a glint of the friend's cyan.
//   - THE PINK BRAIDS, longer, flying with her (the game moves them: 'm2-braid-a', 'b').
//   - A LONG HIGH-COLLARED COAT in a deep violet, its collar standing up behind her head, open in
//     front, and from the waist down TWO LONG COAT-TAILS, split up the back, that flare out and fly
//     behind her: her moving cloth. They are painted in the frames behind her and round her legs (no
//     leg comes through them), left behind as she moves and blown back by a blast in her face; and
//     the point of each flies, moved every frame of the game ('m2-coat-a', 'b'), behind her, so that
//     it hangs from under the hem. Their lining is a lighter purple; along their hems a line of small
//     cyan runes (a faint light: hers).
//   - A fitted plum bodice with two straps across it; a broad brown belt with two pouches, and a
//     small grimoire hanging at her hip on a chain.
//   - Long dark gloves with steel bracers; dark hose and tall boots with buckles (as today).
//   - Her staff and its crystal exactly as today's. Nothing glows on her but the friend's cyan.

import type { Light } from '../engine/px';
import type { TailRoot } from '../engine/tails';
import { book, bookShut, mageLight } from './hero_mage';
import { BROWN, CYAN, INDIGO, INK, MAIL, PINK, PLUM, ROBE, SKIN4, SPARK, STEEL, hash } from './kit';
import type { Painted, Ramp } from './kit';
import { STAFF_UP, STAFF_DOWN } from './moves3';
import { ball, band, cloth, eyesToward, faces, girdle, mid, off, rod, sided, skirtOf, stage, tippedFrom, trunkBalls } from './skin';
import type { GameView, Ring, Sheet } from './skin';
import { add, cross, dot, lerp3, mul, norm, sub, trunkOf } from './skeleton';
import type { Build, Posed, Skeleton, V3 } from './skeleton';
import { FRIEND_RIM } from './hero3_knight';
import { BRIM } from './hero3_mage';
import type { Around } from './hero3_knight';

/** Her face: in the light (as today's). */
const SKIN: Ramp = [SKIN4[0], SKIN4[1], SKIN4[2], SKIN4[3], SKIN4[3]];
const WOOD = INDIGO;
const D = Math.PI / 180;
/** The coat: a deep violet; its lining a lighter purple. */
const COAT: Ramp = ['#1e1040', '#1e1040', '#462a8a', '#6c4cbc', '#6c4cbc'];
const LINING: Ramp = ['#4a2a7a', '#4a2a7a', '#7a52b8', '#a682e0', '#a682e0'];
/** The hat: her purple, as today's. */
const HAT: Ramp = ROBE;
/** Her bodice: plum. */
const BODICE = PLUM;
/** Her gloves: long and dark. */
const GLOVE: Ramp = ['#140f2a', '#140f2a', '#2a2248', '#463c6e', '#463c6e'];
/** The grimoire: a dark cover, the edge of its pages. */
const COVER: Ramp = ['#2a1020', '#2a1020', '#4e2034', '#7a3a50', '#7a3a50'];
const PAGES = '#e8dcc0';
/** The hat: how wide its brim is (a share of her height), how tall its point, how far its tip has fallen over, and how far it is twisted to one side. */
export const BRIM2 = 0.235;
export const POINT2 = 21;
export const BENT2 = 7.5;
const TWIST2 = 2.6;
/** Where round the brim (degrees from the front, toward her left) the notch is torn out of it, and how wide it is. */
const NOTCH: readonly [number, number] = [128, 15];
/** Where round the brim the charms hang from (degrees from the front toward her left), and how long each thread is. */
const CHARMS: readonly (readonly [number, number])[] = [[-72, 6], [-112, 7.5], [82, 6.5]];
/** How far above the floor her coat-tails end (their flying points go on down from there, nearly to the floor), and how far up the back the split between them goes. */
const TAILS_END = 7.5;
const SPLIT = 9;
/** How high her collar stands above the root of her neck, and how wide it flares there (half its width). */
const COLLAR: readonly [number, number] = [6.2, 5.6];
/** The charms' threads: a pale violet, to be seen against the dark. */
const THREAD = '#8c84bc';
/** A charm: a little diamond of bone, lit from the upper left, with a rune of the friend's cyan in the middle. */
const CHARM: readonly (readonly [number, number, string])[] = [[0, -1, '#e8dfc4'], [-1, 0, '#e8dfc4'], [1, 0, '#a89e84'], [0, 1, '#a89e84']];

export function paintMage3b(s: Skeleton, q: Posed, view: GameView, kit: { build: Build; rim?: string | null }, around: Around = {}): Painted {
  const st = stage(view);
  const B = kit.build;
  const lights: Light[] = [];
  const wind = (around.wind ?? 0) * Math.PI * 2;
  const come: V3 = around.prev ? sub(s.pelvis, around.prev.pelvis) : [0, 0, 0];
  const lag = mul(come, -0.9);
  const far = Math.hypot(lag[0], lag[1], lag[2]);
  const trail: V3 = far > 2.4 ? mul(lag, 2.4 / far) : lag;
  const gale = Math.max(0, q.gale);
  const mine = (ramp: Ramp, p: V3): Ramp => sided(st, s, ramp, p);
  const trunk = trunkOf(B, s);
  const [aS, aE, aW] = B.armR;
  const [lH, lK, lA] = B.legR;
  const [cf, cl, cu] = s.chest;
  const fromBehind = st.near(cf) < 0;

  // --- the legs: dark hose and tall boots to the knee, a turned cuff at their top, two buckles on each (as today's, and the buckles) ---
  for (const side of ['L', 'R'] as const) {
    const hip = side === 'L' ? s.hipL : s.hipR;
    const knee = side === 'L' ? s.kneeL : s.kneeR;
    const ankle = side === 'L' ? s.ankleL : s.ankleR;
    const heel = side === 'L' ? s.heelL : s.heelR;
    const toe = side === 'L' ? s.toeL : s.toeR;
    const thigh = st.part(mid(hip, knee));
    rod(thigh, st, hip, knee, lH, lK + 0.2, mine(MAIL, knee), { shade: 0.15 });
    const shin = st.part(mid(knee, ankle));
    const boot = mine(PLUM, ankle);
    rod(shin, st, add(heel, [0, 0, 1.7]), add(toe, [0, 0, 1.3]), 1.9, 1.5, boot, { shade: 0.15 });
    rod(shin, st, knee, ankle, lK + 0.55, lA + 0.6, boot);
    ball(st.part(st.near(knee) + 0.2), st, lerp3(knee, ankle, 0.08), [[lK + 0.9, 0, 0], [0, lK + 0.9, 0], [0, 0, 1.3]], boot);
    // (the buckles: a straight bar of steel across the front of the boot, twice)
    if (!fromBehind) {
      for (const k of [0.4, 0.68]) {
        const at = lerp3(knee, ankle, k);
        const [x, y] = st.at(add(at, mul(cf, lK + 0.4)));
        shin.mark(x - 1, y, STEEL[3]);
        shin.mark(x, y, STEEL[2]);
      }
    }
  }

  // --- THE COAT-TAILS: from her waist down nearly to her ankles behind her, round her legs
  // wherever they are (skin.ts, skirtOf), the back half of it only (it is open in front), split up
  // the back into two; left behind as she moves, blown back by a blast in her face, and flaring as
  // she runs. Their lining shows from in front; along their hems, a line of small cyan runes. The
  // point of each tail flies (the game moves those, 'm2-coat-a', 'b'). ---
  const flying: TailRoot[] = [];
  {
    const speed = Math.min(2, Math.hypot(come[0], come[1]));
    const blow = Math.min(1.2, gale + Math.min(0.35, speed * 0.2) + 0.05 * (1 + Math.sin(wind)));
    const rings = skirtOf(s, B, { top: girdle(trunk[1], -0.3, 1.3), drop: Math.max(2, s.pelvis[2] - TAILS_END), wide: B.pelvisHalf + 5.2, deep: B.pelvisDeep + 4.6, lag: mul(trail, 1.3), wind: around.wind ?? 0, gale: blow, pad: 1.4 });
    const tailsPart = st.part(mid(s.pelvis, s.waist));
    cloth(tailsPart, st, rings, COAT, { folds: [150, -150, 125, -125], arc: [84, 276], lining: 0.2 });
    // (the lining: where the eye looks into it, a lighter purple)
    for (let y = 0; y < tailsPart.h; y++) {
      for (let x = 0; x < tailsPart.w; x++) {
        const c = tailsPart.get(x, y);
        if (c === null) continue;
        const k = COAT.lastIndexOf(c);
        if (k >= 0 && st.near(cf) > 0 && tailsPart.nearAt(x, y) < st.near(s.pelvis)) tailsPart.mark(x, y, LINING[Math.min(4, k + 1)]);
      }
    }
    // (split up the back, from the hem to behind her knees: two tails, a notch between them that opens as it comes down)
    const hem = rings[rings.length - 1];
    const pts = hem.pts ?? [];
    const back = pts.length === 16 ? pts[8] : add(hem.c, mul(hem.u, -1));
    const [sx, sy] = st.at(back);
    const [, ty] = st.at(add(back, [0, 0, SPLIT]));
    for (let y = Math.round(ty); y <= Math.round(sy) + 3; y++) {
      const half = 0.3 + 2.2 * Math.max(0, Math.min(1, (y - ty) / Math.max(1, sy - ty)));
      for (let x = Math.floor(sx - half); x <= Math.ceil(sx + half); x++) {
        if (Math.abs(x + 0.5 - sx) > half || !tailsPart.has(x, y)) continue;
        tailsPart.erase(x, y);
        tailsPart.z[y * tailsPart.w + x] = NaN;
      }
    }
    // (the runes along the hem: on the foot of each column, every other pair of columns, a cyan mark)
    for (let x = 0; x < tailsPart.w; x++) {
      let y = tailsPart.h - 1;
      while (y >= 0 && !tailsPart.has(x, y)) y--;
      if (y < 1 || (x & 3) > 1) continue;
      tailsPart.mark(x, y - 1, (x & 3) === 0 ? CYAN[2] : CYAN[3]);
    }
    // (the two flying points: from the foot of each tail, either side of the split, up inside the
    // hem so that no gap opens between; always behind her, so that they hang from under the hem
    // and never cross her legs; seen from in front, their lining shows)
    for (const [id, i] of [['m2-coat-a', 7], ['m2-coat-b', 9]] as const) {
      const p = pts.length === 16 ? pts[i] : add(hem.c, mul(hem.u, -1));
      const [x, y] = st.at(add(p, [0, 0, 2.4]));
      flying.push({ id, x, y, over: false, inside: !fromBehind, blast: gale > 0.02 ? gale * 1.4 : 0 });
    }
  }

  // --- the bodice, fitted, of plum: her ribs and the small of her waist, two straps across it ---
  const body = st.part(s.ribs);
  const balls = trunkBalls(trunk, 0.6);
  ball(body, st, balls[0].c, balls[0].axes, BODICE);
  ball(body, st, balls[1].c, balls[1].axes, BODICE);
  ball(body, st, balls[2].c, balls[2].axes, MAIL);
  rod(body, st, off(s.shoulderL, s.chest, 0, -0.8, 0.2), off(s.shoulderR, s.chest, 0, 0.8, 0.2), 2.1, 2.1, BODICE);
  ball(body, st, off(trunk[0].c, s.chest, B.ribDeep * 0.5, 0, 0.4), [mul(cf, 2.5), mul(cl, B.ribHalf * 0.9), mul(cu, 2.4)], BODICE);
  for (const up of [-0.1, -0.55]) band(body, st, girdle(trunk[0], up, 0.75), BROWN, 1);

  // --- the coat itself: over her back and her sides from the collar to the waist, open in front
  // (her bodice shows), its sleeves to her elbows ---
  {
    const neck: Ring = { c: add(s.neck, mul(cu, 0.2)), u: mul(cf, B.ribDeep * 0.85), v: mul(cl, 2.9) };
    const shoulders: Ring = { c: add(s.neck, mul(cu, -1.4)), u: mul(cf, B.ribDeep + 1.3), v: mul(cl, B.shoulderHalf + aS + 0.4) };
    const ribs = girdle(trunk[0], -0.2, 1.1);
    const waist = girdle(trunk[1], -0.3, 1.25);
    const coat = st.part(add(s.ribs, mul(cf, -1)));
    cloth(coat, st, [neck, shoulders, ribs, waist], COAT, { arc: [58, 302], folds: [180, 140, -140], lining: 0.25 });
  }
  // --- the belt: broad, of brown leather, round her bodice under the coat (so it is seen only in
  // front, where the coat is open); two pouches; and the grimoire hanging at her left hip on a chain ---
  const sash = st.part(s.waist);
  const waist = girdle(trunk[1], -0.1, 1.15);
  if (!fromBehind) band(sash, st, waist, BROWN, 3);
  if (!fromBehind) {
    const at = add(waist.c, waist.u);
    const [bx, by] = st.at(at);
    for (let j = -1; j <= 0; j++) for (let i = -1; i <= 0; i++) sash.put(Math.round(bx) + i, Math.round(by) + j + 1, i + j < -1 ? STEEL[3] : STEEL[2], st.near(at) + 0.6);
  }
  for (const a of [-35, -70]) {
    const r = a * D;
    const at = add(add(waist.c, add(mul(waist.u, Math.cos(r) * 1.1), mul(waist.v, Math.sin(r) * 1.1))), mul(s.hips[2], -1.5));
    ball(st.part(st.near(at) + 0.3), st, at, [mul(s.hips[0], 1.4), mul(s.hips[1], 1.6), mul(s.hips[2], 1.9)], mine(BROWN, at));
  }
  {
    // (from the belt at her left hip, a chain, and the little book swinging at its end, left behind as she moves)
    const r = 70 * D;
    const hook = add(waist.c, add(mul(waist.u, Math.cos(r) * 1.1), mul(waist.v, Math.sin(r) * 1.1)));
    const tome = add(add(hook, [0, 0, -4.6]), mul(trail, 0.8));
    const chain = st.part(mid(hook, tome));
    const [hx, hy] = st.at(hook);
    const [bx, by] = st.at(tome);
    const n = Math.max(1, Math.ceil(Math.hypot(bx - hx, by - hy)));
    for (let i = 0; i <= n; i++) chain.put(Math.round(hx + ((bx - hx) * i) / n - 0.5), Math.round(hy + ((by - hy) * i) / n - 0.5), i % 2 ? STEEL[2] : STEEL[3], st.near(lerp3(hook, tome, i / n)) + 0.4);
    const book3 = st.part(st.near(tome) + 0.9);
    ball(book3, st, add(tome, [0, 0, -1.3]), [mul(s.hips[0], 0.9), mul(s.hips[1], 1.9), [0, 0, 2.2]], mine(COVER, tome));
    const [px, py] = st.at(add(tome, [0, 0, -1.3]));
    book3.mark(Math.round(px - 0.5), Math.round(py - 0.5), CYAN[2]);
    book3.mark(Math.round(px - 0.5) + 1, Math.round(py - 0.5) + 2, PAGES);
    book3.mark(Math.round(px - 0.5), Math.round(py - 0.5) + 2, PAGES);
  }

  const [hf, hl, hu] = s.face;
  const R = B.headR;

  // --- the arms: the coat's sleeves to the elbow; long dark gloves from there, steel bracers over them ---
  for (const side of ['L', 'R'] as const) {
    const sh = side === 'L' ? s.shoulderL : s.shoulderR;
    const el = side === 'L' ? s.elbowL : s.elbowR;
    const hand = side === 'L' ? s.handL : s.handR;
    const upper = st.part(mid(sh, el));
    rod(upper, st, sh, el, aS + 0.6, aE + 0.65, mine(COAT, el));
    const fore = st.part(mid(el, hand, 0.6));
    rod(fore, st, lerp3(el, hand, 0.08), lerp3(el, hand, 0.97), aE + 0.3, aW + 0.45, mine(GLOVE, hand));
    rod(fore, st, lerp3(el, hand, 0.32), lerp3(el, hand, 0.8), aE + 0.62, aW + 0.72, mine(STEEL, hand));
    const palm = st.part(st.near(hand) + 0.2);
    ball(palm, st, hand, [[aW + 0.6, 0, 0], [0, aW + 0.6, 0], [0, 0, aW + 0.6]], mine(GLOVE, hand));
  }

  // --- the collar: high and standing, round the back of her neck and up behind her head, open in front ---
  {
    const foot: Ring = { c: add(s.neck, mul(cu, -0.3)), u: mul(cf, B.ribDeep * 0.95), v: mul(cl, 3.4) };
    const top: Ring = { c: add(add(s.neck, mul(cu, COLLAR[0])), mul(cf, -1.6)), u: mul(cf, B.ribDeep * 1.1), v: mul(cl, COLLAR[1]) };
    const collar = st.part(add(s.neck, mul(cf, -1.5)));
    cloth(collar, st, [top, foot], COAT, { arc: [70, 290], lining: 0.15 });
    // (its inside, toward her, a lighter purple)
    for (let y = 0; y < collar.h; y++) for (let x = 0; x < collar.w; x++) {
      const c = collar.get(x, y);
      if (c === null) continue;
      const k = COAT.lastIndexOf(c);
      if (k >= 0 && collar.nearAt(x, y) < st.near(s.neck)) collar.mark(x, y, LINING[Math.min(3, k + 1)]);
    }
  }

  // --- the head: her face, bare, and her hair on the back and the crown of it; her eyes (as today's) ---
  const head = st.part(st.near(s.head) + 0.3);
  rod(head, st, s.neck, s.skull, 1.7, 1.7, SKIN);
  ball(head, st, s.head, [mul(hf, R[0]), mul(hl, R[1]), mul(hu, R[2])], (u, tone) => (u[0] < 0 || u[2] > 0.62 ? PINK[tone] : SKIN[tone]));
  for (const turn of eyesToward(st, s)) {
    if (!faces(st, s, turn)) continue;
    const a = turn * D;
    const eye = add(s.head, add(add(mul(hf, Math.cos(a) * R[0] * 0.97), mul(hl, Math.sin(a) * R[1] * 0.97)), mul(hu, 0.14 * R[2])));
    const [x, y] = st.at(eye);
    head.mark(Math.round(x - 0.5), Math.round(y - 0.5), INK);
    head.mark(Math.round(x - 0.5), Math.round(y - 0.5) + 1, INK);
  }

  // --- her braids: pink, from behind each ear forward over the collar bone, painted; from there,
  // longer than they were, two that really fly (the game moves them) ---
  const tails: TailRoot[] = [];
  for (const side of [-1, 1]) {
    const p0 = add(add(s.head, mul(hl, side * R[1] * 0.97)), add(mul(hf, -R[0] * 0.25), mul(hu, -R[2] * 0.15)));
    const p1 = off(s.neck, s.chest, B.ribDeep * 0.9 + 1.5, side * B.shoulderHalf * 0.8, -2.2);
    const lock = st.part(mid(p0, p1));
    rod(lock, st, p0, p1, 1.45, 1.5, mine(PINK, p1));
    const [x0, y0] = st.at(p0);
    const [x1, y1] = st.at(p1);
    const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0));
    for (let i = 2; i < n; i += 3) lock.mark(x0 + ((x1 - x0) * i) / n - 0.5, y0 + ((y1 - y0) * i) / n - 0.5, PINK[1]);
    const [x, y] = st.at(add(p1, [0, 0, -0.6]));
    tails.push({ id: side < 0 ? 'm2-braid-a' : 'm2-braid-b', x, y, over: !fromBehind, blast: gale > 0.02 ? gale * 1.4 : 0 });
  }

  // --- THE HAT: a wide floppy brim with a notch torn out of it, and a tall cone whose tip has
  // fallen over backward and a little to one side, twisted (left behind a little by movement,
  // nodding in the wind); the band of light round it; and from the brim, three small rune charms on
  // threads, swinging. Tipped from the eye, as her brim always is. ---
  {
    const hat = st.part(st.near(s.head) + 0.8);
    const U = tippedFrom(st, hu, 22);
    const F = norm(sub(hf, mul(U, dot(hf, U))), hf);
    const L = cross(U, F);
    const C0 = add(s.head, mul(hu, R[2] * 0.82));
    const wide = BRIM2 * B.tall;
    // (the brim: a plate, a notch torn out of it; wider than it was at her sides and behind, its
    // front edge where it was, so that it does not come down over her eyes)
    const brim = add(C0, mul(F, -(BRIM2 - BRIM) * B.tall * 0.85));
    ball(hat, st, brim, [mul(F, wide), mul(L, wide), mul(U, 1.0)], (u, tone) => {
      const r = Math.hypot(u[0], u[1]);
      const az = (Math.atan2(u[1], u[0]) * 180) / Math.PI;
      const off2 = Math.abs(((az - NOTCH[0] + 540) % 360) - 180);
      if (r > 0.72 && off2 < NOTCH[1] * (r - 0.6) * 2.6) return null;
      return HAT[r > 0.8 ? Math.max(0, tone - 1) : tone];
    });
    const nod = add(add(mul(trail, 0.6), mul(L, Math.sin(wind) * 0.45 + TWIST2)), mul(F, -gale * 2.2));
    const base: Ring = { c: add(C0, mul(U, 0.9)), u: mul(F, R[0] * 1.36), v: mul(L, R[1] * 1.56) };
    const belly: Ring = { c: add(add(C0, add(mul(U, POINT2 * 0.45), mul(F, -BENT2 * 0.12))), mul(nod, 0.15)), u: mul(F, R[0] * 0.86), v: mul(L, R[1] * 0.96) };
    const neckR: Ring = { c: add(add(C0, add(mul(U, POINT2 * 0.78), mul(F, -BENT2 * 0.45))), mul(nod, 0.55)), u: mul(F, R[0] * 0.45), v: mul(L, R[1] * 0.5) };
    const bend: Ring = { c: add(add(C0, add(mul(U, POINT2 * 0.88), mul(F, -BENT2 * 0.95))), mul(nod, 0.85)), u: mul(F, R[0] * 0.3), v: mul(L, R[1] * 0.32) };
    const tip: Ring = { c: add(add(C0, add(mul(U, POINT2 * 0.8), mul(F, -BENT2 * 1.35))), nod), u: mul(F, 0.35), v: mul(L, 0.35) };
    cloth(hat, st, [tip, bend, neckR, belly, base], HAT, { lift: 0.35, folds: [30, -60] });
    band(hat, st, base, CYAN, 2, 0.5);
    // (the charms: from the brim's edge, a thread, and on it a little disc of bone with a rune of light in it, swinging with her)
    for (const [deg, len] of CHARMS) {
      const a = deg * D;
      const from = add(brim, add(mul(F, Math.cos(a) * wide * 0.9), mul(L, Math.sin(a) * wide * 0.9)));
      const swing = add(mul(trail, 0.5), mul(L, Math.sin(wind + deg) * 0.4));
      const to = add(add(from, [0, 0, -len]), swing);
      const charm = st.part(st.near(to) + 1.0);
      const [fx, fy] = st.at(from);
      const [cx, cy] = st.at(to);
      const n = Math.max(1, Math.ceil(Math.hypot(cx - fx, cy - fy)));
      for (let i = 0; i < n; i++) charm.put(Math.round(fx + ((cx - fx) * i) / n - 0.5), Math.round(fy + ((cy - fy) * i) / n - 0.5), THREAD, st.near(lerp3(from, to, i / n)) + 0.9);
      const x = Math.round(cx - 0.5);
      const y = Math.round(cy - 0.5) + 1;
      for (const [dx, dy, c] of CHARM) charm.put(x + dx, y + dy, c, st.near(to) + 1.0);
      charm.put(x, y, CYAN[3], st.near(to) + 1.1);
    }
  }

  // --- the staff, in the right hand: as today's, exactly (art/hero3_mage.ts, the battle mage's):
  // the pole; at its head a cross-bar of steel under a long crystal ---
  const p3 = s.point;
  const side3 = norm(cross(p3, st.eye), s.across);
  const foot = add(s.handR, mul(p3, -STAFF_DOWN));
  const tip3 = add(s.handR, mul(p3, STAFF_UP));
  const pole = st.part(mid(foot, tip3, 0.55));
  rod(pole, st, foot, add(tip3, mul(p3, -5.5)), 1.05, 1.05, WOOD);
  const bar = add(tip3, mul(p3, -5.5));
  rod(pole, st, add(bar, mul(side3, -3)), add(bar, mul(side3, 3)), 0.9, 0.9, STEEL);
  const gem3 = add(tip3, mul(p3, 1.2));
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
      const far2 = Math.hypot(old[0] - tx, old[1] - ty) || 1;
      for (let y = 0; y < fan.h; y++) for (let x = 0; x < fan.w; x++) {
        if (!fan.has(x, y)) continue;
        const k = 1 - Math.hypot(x - old[0], y - old[1]) / far2;
        if (k > 0.35 && hash(x, y, 9) < (k - 0.35) * 1.5) fan.erase(x, y);
      }
    }
  }
  // the crystal: a cut stone, long the way the staff points, as near the eye as the staff's head is. It swells as it burns.
  const gem = st.part(st.near(gem3) + 0.6);
  const half = 2.3 + 0.5 * Math.min(2, burn - 1);
  const long = 8.4 + 0.9 * Math.min(2, burn - 1);
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
        const reach = (rx !== 0 ? 3 : 9) + k;
        if (k > rays + (rx !== 0 ? 2 : 0)) continue;
        st.over.set(Math.round(tx - 0.5 + rx * reach), Math.round(ty - 0.5 + ry * reach), c);
      }
    }
  }
  const hot = Math.max(0, Math.min(2, burn - 1));
  const pulse = hot > 0.5 ? 0 : Math.sin(wind);
  lights.push({ x: tx, y: ty, r: 21 + hot * 6.5 + pulse * 1.5, color: SPARK[3], a: 0.38 + hot * 0.185 + pulse * 0.07 });

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

  // --- what she does when left standing: a mage light over the open hand, or a book (as today's) ---
  if (q.prop === 1) {
    const [lx, ly] = st.at(s.handL);
    mageLight(st.over, lx, ly, q.pt, lights);
  }
  if (q.prop === 2) {
    const [lx, ly] = st.at(s.handL);
    const layer: Sheet = st.part(st.near(s.handL) + 2.5);
    if (s.handL[2] < s.waist[2] + 2) bookShut(layer, lx, ly - 1);
    else book(layer, st.over, lx + 1, ly - 2, q.pt > 0.12 && q.pt < 0.88 ? ((q.pt - 0.12) / 0.76) % 1 : 0, lights);
  }

  return { px: st.whole(kit.rim === undefined ? FRIEND_RIM : kit.rim), lights, tails: [...tails, ...flying] };
}

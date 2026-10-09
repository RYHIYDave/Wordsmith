// THE WORDSMITH ON BONES (the art chat, 8 Oct 2026). A MOCK-UP BEHIND A SWITCH THAT IS OFF:
// SMITH3.on. With it off the town's wordsmith is the one painted in art/townsfolk.ts.
//
// The owner, 22:41, when the quest item and the runes powering up were to be drawn: "wait on that,
// cause we probably need new art for the wordsmith and the runes around him with the new design
// rules". His brief, by 22:45 (the rulebook's questions for a character): "Ancient and mighty
// (Recommended)"; what you would know him by, "Runes burning on him (Recommended)"; his ring when
// it is powered, "Big and wild (Recommended)"; his size, "A head taller (Recommended)". 22:46: "id
// like him on the wire skeleton and all that". 22:49: "ill give you the freedom to reimagine his
// look if you want".
//
// So he is a body of bones like the heroes (skeleton.ts), painted over them here, and he turns for
// real to face whoever comes up to him (the figure is turned round, not its picture flipped):
//   - TALL AND OLD: a head taller than the heroes, broad, a little stooped over his work.
//   - A DEEP NIGHT-BLUE ROBE to the floor, and over his shoulders A TEAL MANTLE with its cowl down
//     his back: the teal of the fallen wordsmith in the first dungeon (art/body.ts), so the two are
//     of one order.
//   - A LONG WHITE BEARD, his crown bald, white hair behind; heavy white brows; HIS EYES BURN CYAN.
//   - RUNES BURN ON HIM: down the front of his robe, round its hem, along the edge of his mantle, in
//     the skin of his bare forearms and the backs of his hands, and one on his brow. They throb
//     slowly as he stands, and blaze when he works.
//   - No staff: his hands do the work. Standing, a small rune turns over his open right hand. Now
//     and then he raises both hands, writes a great rune on the air stroke by stroke, and drives it
//     down into his slab.
// What glows on him is the friend's cyan (the rulebook). Townsfolk have no edge of light round them.
//
// He saw him and his ring (art/ring3.ts) at work in the town, beside the wordsmith and the ring as
// they are (smith.gif), and close up (smith_close.png), and said by 23:09: "Yes, this is him
// (Recommended)"; and of how wild the ring is, "Just right (Recommended)".

import type { Light, Sprite } from '../engine/px';
import { BONE, CYAN, INK, NIGHT, PLUM, SKIN4, TEAL, lazyFrames, toSprite } from './kit';
import type { Painted, Ramp } from './kit';
import { CANVAS3, ball, band, cloth, eyesToward, faces, girdle, hidden, mid, off, rod, skirtOf, stage, trunkBalls } from './skin';
import type { Ring, Sheet, Stage } from './skin';
import { add, bonesAt, buildOf, lerp3, mul, solve, standing, sub, trunkOf } from './skeleton';
import type { Bones, Build, Key3, Posed, Rot, Skeleton, V3 } from './skeleton';
import type { Facing, Townsman } from './townsfolk';

/** The switch: the wordsmith on bones and his ring made new (art/town.ts), or as they were. */
export const SMITH3 = { on: false };

/** His body: a head taller than the heroes (they are 54.5 to 58 tall), broad in the shoulder and deep in the chest, his limbs heavy. */
export const SMITH_BODY: Build = buildOf(68, 1.3, { shoulders: 1.16, chest: 1.14, waist: 1.16, hips: 1.08, depth: 1.12, limbs: 1.12, pad: 1.8, skirt: [9, 8] });

/** His robe, a blue nearly black; his mantle, the wordsmiths' teal, a step darker than the town's own so that the runes on it stand out. */
const ROBE: Ramp = ['#1a1642', '#1a1642', '#2c2870', '#4844a2', '#5e5abc'];
const MANTLE: Ramp = ['#08283a', '#08283a', '#11566a', '#1d8a92', '#1d8a92'];
const SKIN: Ramp = [SKIN4[0], SKIN4[1], SKIN4[2], SKIN4[3], SKIN4[3]];
const HAIR: Ramp = BONE;
const BOOT: Ramp = PLUM;
const D = Math.PI / 180;

/** How hot a rune burns (0 cold, 1 white-hot) as a colour: the wordsmiths' teal, the friend's cyan, its pale heart, white. */
export function burning(t: number): string {
  return t < 0.28 ? TEAL[2] : t < 0.58 ? CYAN[2] : t < 0.86 ? CYAN[3] : '#ffffff';
}

/** His runes: a few strokes each on a 3 x 5 grid (his own: none of them is a letter of any alphabet). */
const GLYPHS: ReadonlyArray<ReadonlyArray<string>> = [
  ['#.#', '.#.', '.#.', '#.#', '#..'],
  ['##.', '#..', '###', '..#', '.##'],
  ['.#.', '#.#', '.#.', '.#.', '#.#'],
  ['#..', '#.#', '###', '#.#', '..#'],
  ['.##', '#..', '.#.', '..#', '##.'],
  ['#.#', '#.#', '.#.', '#..', '###'],
  ['###', '.#.', '#.#', '.#.', '###'],
  ['#..', '.#.', '..#', '.#.', '#..'],
];

/** His bigger runes, on a 5 x 7 grid: down the front of his robe and round its hem, where they must be read from across the town. */
export const RUNES7: ReadonlyArray<ReadonlyArray<string>> = [
  ['..#..', '.#.#.', '#.#.#', '..#..', '..#..', '..#..', '.###.'],
  ['..#..', '.###.', '#.#.#', '..#..', '..#..', '.#.#.', '#...#'],
  ['#####', '.#.#.', '..#..', '..#..', '.#.#.', '#####', '.....'],
  ['#...#', '.#.#.', '..#..', '..#..', '..#..', '.#.#.', '#...#'],
  ['..#..', '.#.#.', '#.#.#', '.#.#.', '..#..', '..#..', '..#..'],
  ['...#.', '..#..', '.#...', '#####', '...#.', '..#..', '.#...'],
  ['#...#', '#####', '#...#', '#####', '#...#', '#####', '#...#'],
  ['####.', '...#.', '.#.#.', '.#...', '.####', '.....', '.....'],
];

/** A rune of his, its middle at (x, y) of the picture, cut into what is painted there (nothing where the part is not); `big`: one of the bigger ones. */
function glyphOn(p: Sheet, k: number, x: number, y: number, color: string, big = false): void {
  const set = big ? RUNES7 : GLYPHS;
  const rows = set[((k % set.length) + set.length) % set.length];
  const w = rows[0].length;
  const h = rows.length;
  const x0 = Math.round(x) - Math.floor(w / 2);
  const y0 = Math.round(y) - Math.floor(h / 2);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (rows[j][i] === '#') p.mark(x0 + i, y0 + j, color);
}

/** ... and one standing in the air, over everything (a rune he holds up, or writes). */
function glyphIn(st: Stage, k: number, x: number, y: number, color: string, big = 1): void {
  const rows = GLYPHS[((k % GLYPHS.length) + GLYPHS.length) % GLYPHS.length];
  const x0 = Math.round(x - 1.5 * big);
  const y0 = Math.round(y - 2.5 * big);
  for (let j = 0; j < 5 * big; j++) for (let i = 0; i < 3 * big; i++) if (rows[Math.floor(j / big)][Math.floor(i / big)] === '#') st.over.set(x0 + i, y0 + j, color);
}

/**
 * THE GREAT RUNE he writes on the air: its strokes in the order he makes them, each from one point
 * to another in a square two across (its middle at 0, 0; up is +). His own design.
 */
const GREAT: ReadonlyArray<readonly [number, number, number, number]> = [
  [0, 1, 0, -1],
  [-0.7, 0.55, 0, 1],
  [0.7, 0.55, 0, 1],
  [-0.75, -0.2, 0.75, 0.35],
  [-0.75, 0.35, 0.75, -0.2],
  [-0.45, -0.85, 0.45, -0.85],
];

// ---------------------------------------------------------------------------------------------
// How he stands and moves

/** At his work: tall, his head and shoulders a little bowed over the slab, his feet apart and turned out; his right hand open before him, his left at his side. */
export const SMITH_STANCE: Bones = {
  ...standing(SMITH_BODY),
  pz: -0.5,
  bend: 7,
  faceUp: -12,
  lfx: 1.2,
  lfy: 1.4,
  rfx: -1.6,
  rfy: -1.4,
  lft: 14,
  rft: -16,
  rhIn: 0,
  rhx: 10,
  rhy: 7.5,
  rhz: -15,
  re: 25,
  lhIn: 0,
  lhx: 8,
  lhy: -6.5,
  lhz: -19,
  le: 20,
  prop: 2,
};

/** Standing (3.6 s round, at the town's ten frames a second): he breathes twice, looks along the slab and back, and the rune over his hand turns. */
export const SMITH_IDLE_LONG = 3.6;
const IDLE_KEYS: Key3[] = [
  { at: 0, pose: { pt: 0 } },
  { at: 0.9, pose: { pz: -1.3, bend: 8.6, rhz: -14.2, pt: 0.25 }, ease: 'io' },
  { at: 1.8, pose: { pt: 0.5 }, ease: 'io' },
  { at: 2.7, pose: { pz: -1.3, bend: 8.6, faceTurn: 10, rhz: -14.4, pt: 0.75 }, ease: 'io' },
  { at: 3.6, pose: { pt: 1 }, ease: 'io' },
];

/**
 * WHAT HE DOES NOW AND THEN (3 s): both hands up before him and the runes on him blaze; his right
 * hand writes the great rune on the air, stroke by stroke; he gathers it up over his head, and
 * drives it down into the slab with both hands, bowed over it; then stands as he was.
 * `draw` is how hot his runes burn; `prop` 1 is the great rune, `pt` how far it has got.
 */
export const SMITH_ACT_LONG = 3;
const UP_R: Partial<Bones> = { rhIn: 0, rhx: 11, rhy: 5, rhz: -6, re: 30 };
const UP_L: Partial<Bones> = { lhIn: 0, lhx: 10, lhy: -5, lhz: -7, le: 30 };
const ACT_KEYS: Key3[] = [
  { at: 0, pose: { prop: 2, pt: 0 } },
  { at: 0.4, pose: { ...UP_R, ...UP_L, bend: 2, faceUp: -4, draw: 0.55, prop: 1, pt: 0 }, ease: 'io' },
  // (the strokes: the hand goes to where each begins and along it)
  { at: 0.62, pose: { ...UP_L, bend: 2, faceUp: -2, draw: 0.6, prop: 1, pt: 0.1, rhIn: 0, rhx: 14, rhy: 2, rhz: 0, re: 35 }, ease: 'io' },
  { at: 0.84, pose: { ...UP_L, bend: 2, faceUp: -6, draw: 0.65, prop: 1, pt: 0.2, rhIn: 0, rhx: 14, rhy: 2, rhz: -12, re: 35 }, ease: 'io' },
  { at: 1.04, pose: { ...UP_L, bend: 2, faceUp: -2, draw: 0.7, prop: 1, pt: 0.3, rhIn: 0, rhx: 14, rhy: 7, rhz: -3, re: 35 }, ease: 'io' },
  { at: 1.22, pose: { ...UP_L, bend: 2, faceUp: -2, draw: 0.72, prop: 1, pt: 0.4, rhIn: 0, rhx: 14, rhy: -3, rhz: -3, re: 35 }, ease: 'io' },
  { at: 1.42, pose: { ...UP_L, bend: 2, faceUp: -6, draw: 0.76, prop: 1, pt: 0.5, rhIn: 0, rhx: 14, rhy: 7, rhz: -9, re: 35 }, ease: 'io' },
  { at: 1.6, pose: { ...UP_L, bend: 2, faceUp: -8, draw: 0.8, prop: 1, pt: 0.6, rhIn: 0, rhx: 14, rhy: 1, rhz: -14, re: 35 }, ease: 'io' },
  // (gathered up over his head, the whole of him lifting)
  { at: 1.92, pose: { rhIn: 0, rhx: 7, rhy: 5, rhz: 6, re: 40, lhIn: 0, lhx: 7, lhy: -5, lhz: 6, le: 40, pz: 0.6, bend: -3, faceUp: 8, draw: 1, prop: 1, pt: 0.75 }, ease: 'out' },
  // (and driven down into the slab)
  { at: 2.12, pose: { rhIn: 0, rhx: 16, rhy: 4, rhz: -17, re: 20, lhIn: 0, lhx: 16, lhy: -4, lhz: -17, le: 20, pz: -2.6, bend: 16, faceUp: -18, draw: 1, prop: 1, pt: 0.95 }, ease: 'in' },
  { at: 2.4, pose: { rhIn: 0, rhx: 15.5, rhy: 4, rhz: -17.5, re: 20, lhIn: 0, lhx: 15.5, lhy: -4, lhz: -17.5, le: 20, pz: -2.4, bend: 15, faceUp: -16, draw: 0.75, prop: 1, pt: 1 }, ease: 'out' },
  // (it is gone into the slab; and the small rune is over his hand again as he straightens)
  { at: 2.5, pose: { rhIn: 0, rhx: 15, rhy: 4.5, rhz: -17.2, re: 21, lhIn: 0, lhx: 15, lhy: -4.5, lhz: -17.5, le: 20, pz: -2.2, bend: 14, faceUp: -15, draw: 0.6, prop: 2, pt: 1 }, ease: 'lin' },
  { at: 3, pose: { prop: 2, pt: 1, draw: 0 }, ease: 'io' },
];

// ---------------------------------------------------------------------------------------------
// Turned for real

const FACING_TURN: Record<Facing, number> = { se: 0, sw: -90, ne: 90, nw: 180 };

/** The whole figure turned round on the spot by `deg` (to its left): every joint and every part's own axes. */
function turnedBy(s: Skeleton, deg: number): Skeleton {
  if (deg === 0) return s;
  const c = Math.cos(deg * D);
  const n = Math.sin(deg * D);
  const r = (v: V3): V3 => [v[0] * c - v[1] * n, v[0] * n + v[1] * c, v[2]];
  const R = (m: Rot): Rot => [r(m[0]), r(m[1]), r(m[2])];
  const out = { ...s } as Record<string, unknown>;
  for (const k of Object.keys(s) as (keyof Skeleton)[]) {
    const v = s[k];
    if (k === 'poleL' || k === 'poleR') continue;
    if (Array.isArray(v) && v.length === 3 && typeof v[0] === 'number') out[k] = r(v as unknown as V3);
    else if (Array.isArray(v) && v.length === 3 && Array.isArray(v[0])) out[k] = R(v as unknown as Rot);
  }
  return out as unknown as Skeleton;
}

// ---------------------------------------------------------------------------------------------
// The painter

export interface SmithAround {
  /** The figure a moment before (cloth hangs back by how far it has moved). */
  prev?: Skeleton;
  /** Where the wind and his slow throb have got to, 0..1 round. */
  wind?: number;
}

/** THE WORDSMITH, painted over his bones, turned `turn` degrees to his left from facing down the screen to the right. */
export function paintSmith3(s0: Skeleton, q: Posed, turn: number, around: SmithAround = {}): Painted {
  const s = turnedBy(s0, turn);
  const st = stage('front');
  const B = SMITH_BODY;
  const lights: Light[] = [];
  const round = (around.wind ?? 0) * Math.PI * 2;
  const lag: V3 = around.prev ? mul(sub(s.pelvis, turnedBy(around.prev, turn).pelvis), -0.9) : [0, 0, 0];
  // how hot the runes on him burn: a slow throb as he stands, a blaze as he works
  const heat = Math.max(0, Math.min(1, q.draw));
  const throb = 0.5 + 0.5 * Math.sin(round * 2);
  /** How hot the rune at `k` along a band burns (a pulse runs down each band, round and round). */
  const hotAt = (k: number): number => Math.min(1, 0.32 + 0.16 * throb + 0.62 * heat + 0.22 * Math.max(0, Math.cos((k - (around.wind ?? 0)) * Math.PI * 4)) * (1 - heat * 0.5));
  const trunk = trunkOf(B, s);
  const [aS, aE, aW] = B.armR;
  const [lH, lK, lA] = B.legR;
  const [cf, cl, cu] = s.chest;
  const fromBehind = st.near(cf) < 0;
  const hipH = B.ankle + B.shank + B.thigh;

  // --- his legs, inside the robe, and his boots under its hem ---
  const legs: Sheet[] = [];
  for (const side of ['L', 'R'] as const) {
    const hip = side === 'L' ? s.hipL : s.hipR;
    const knee = side === 'L' ? s.kneeL : s.kneeR;
    const ankle = side === 'L' ? s.ankleL : s.ankleR;
    const heel = side === 'L' ? s.heelL : s.heelR;
    const toe = side === 'L' ? s.toeL : s.toeR;
    const thigh = st.part(mid(hip, knee));
    rod(thigh, st, hip, knee, lH, lK + 0.2, ROBE, { shade: 0.2 });
    const shin = st.part(mid(knee, ankle));
    rod(shin, st, knee, ankle, lK + 0.3, lA + 0.5, ROBE, { shade: 0.2 });
    rod(shin, st, add(heel, [0, 0, 1.8]), add(toe, [0, 0, 1.4]), 2.1, 1.7, BOOT, { shade: 0.1 });
    legs.push(thigh, shin);
  }

  // --- the robe over his trunk: deep chest, broad shoulders ---
  const body = st.part(s.ribs);
  const balls = trunkBalls(trunk, 1.1);
  ball(body, st, balls[0].c, balls[0].axes, ROBE);
  ball(body, st, balls[1].c, balls[1].axes, ROBE);
  ball(body, st, balls[2].c, balls[2].axes, ROBE);
  rod(body, st, off(s.shoulderL, s.chest, 0, -1, 0.4), off(s.shoulderR, s.chest, 0, 1, 0.4), aS + 0.8, aS + 0.8, ROBE);
  ball(body, st, off(trunk[0].c, s.chest, B.ribDeep * 0.45, 0, 0.6), [mul(cf, 3.2), mul(cl, B.ribHalf * 0.95), mul(cu, 3.2)], ROBE);

  // --- the robe below the waist, to the floor: wide and heavy, stirred a little ---
  const skirts = st.part(s.pelvis);
  const coat = skirtOf(s, B, { top: girdle(trunk[1], -0.2, 1.4), drop: hipH - 1.4, wide: B.pelvisHalf + 11, deep: B.pelvisDeep + 9, lag, wind: around.wind ?? 0, gale: 0, pad: 1.4 });
  cloth(skirts, st, coat, ROBE, { folds: [0, 180, 65, -65, 125, -125] });
  hidden(legs, skirts);

  // --- RUNES DOWN THE FRONT OF THE ROBE, from his collar to its hem, between two lines of the mantle's teal ---
  if (!fromBehind) {
    const line: V3[] = [];
    // (on the trunk: from under the beard to the waist)
    for (let i = 0; i <= 4; i++) line.push(off(lerp3(s.ribs, s.waist, i / 4), s.chest, B.ribDeep + 0.9 - i * 0.15, 0, 2 - i * 0.5));
    // (and down the front of the skirt, ring by ring)
    for (let i = 1; i < coat.length; i++) line.push(add(coat[i].c, coat[i].u));
    const pix = line.map((p) => st.at(p));
    let total = 0;
    for (let i = 1; i < pix.length; i++) total += Math.hypot(pix[i][0] - pix[i - 1][0], pix[i][1] - pix[i - 1][1]);
    // (the band's edges)
    let run = 0;
    for (let i = 1; i < pix.length; i++) {
      const [x0, y0] = pix[i - 1];
      const [x1, y1] = pix[i];
      const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
      for (let j = 0; j < n; j++) {
        const x = x0 + ((x1 - x0) * j) / n;
        const y = y0 + ((y1 - y0) * j) / n;
        const sheet = i < 5 ? body : skirts;
        sheet.mark(x - 4, y, MANTLE[2]);
        sheet.mark(x + 4, y, MANTLE[2]);
      }
      run += Math.hypot(x1 - x0, y1 - y0);
    }
    // (the runes between them, every seven pixels down it)
    let at = 5;
    let k = 0;
    run = 0;
    for (let i = 1; i < pix.length && at < total - 2; i++) {
      const [x0, y0] = pix[i - 1];
      const [x1, y1] = pix[i];
      const l = Math.hypot(x1 - x0, y1 - y0);
      while (at <= run + l && at < total - 2) {
        const u = (at - run) / (l || 1);
        const sheet = i < 5 ? body : skirts;
        glyphOn(sheet, k + 3, x0 + (x1 - x0) * u, y0 + (y1 - y0) * u, burning(hotAt(at / total)), true);
        k++;
        at += 9;
      }
      run += l;
    }
    const [lx, ly] = st.at(line[2]);
    lights.push({ x: lx, y: ly, r: 16 + heat * 10, color: CYAN[2], a: 0.14 + heat * 0.18 });
  }

  // --- RUNES ROUND THE HEM, on the side toward the eye ---
  {
    const hem = coat[coat.length - 1];
    const lift = coat.length > 1 ? sub(coat[coat.length - 2].c, hem.c) : ([0, 0, 1] as V3);
    const up = mul(lift, 4.5 / (Math.hypot(lift[0], lift[1], lift[2]) || 1));
    const n = 12;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const out = add(mul(hem.u, Math.cos(a)), mul(hem.v, Math.sin(a)));
      if (st.seen(out)[2] < 0) continue;
      const p = add(add(hem.c, out), up);
      const [x, y] = st.at(p);
      glyphOn(skirts, i, x, y, burning(hotAt(i / n) * 0.9), true);
    }
  }

  // --- a sash of the mantle's teal at his waist ---
  band(st.part(s.waist), st, girdle(trunk[1], -0.15, 1.9), MANTLE, 3);

  // --- the arms: wide sleeves of the robe to below the elbow, then his bare forearms, runes cut in
  // them burning; big hands, the backs of them marked too ---
  for (const side of ['L', 'R'] as const) {
    const sh = side === 'L' ? s.shoulderL : s.shoulderR;
    const el = side === 'L' ? s.elbowL : s.elbowR;
    const hand = side === 'L' ? s.handL : s.handR;
    const upper = st.part(mid(sh, el));
    rod(upper, st, sh, el, aS + 0.6, aE + 1.0, ROBE);
    const cuff = lerp3(el, hand, 0.34);
    const sleeve = st.part(mid(el, cuff));
    rod(sleeve, st, el, cuff, aE + 1.1, aE + 2.0, ROBE);
    // (the cuff turned back: the teal of the mantle)
    rod(sleeve, st, lerp3(el, hand, 0.3), cuff, aE + 2.05, aE + 2.1, MANTLE);
    const fore = st.part(mid(cuff, hand, 0.6));
    rod(fore, st, cuff, hand, aE + 0.2, aW + 0.3, SKIN);
    // (the runes in his forearm: a stroke across it every three pixels, burning)
    const [x0, y0] = st.at(lerp3(cuff, hand, 0.18));
    const [x1, y1] = st.at(lerp3(cuff, hand, 0.82));
    const n = Math.max(1, Math.floor(Math.hypot(x1 - x0, y1 - y0) / 3));
    for (let i = 0; i <= n; i++) {
      const x = x0 + ((x1 - x0) * i) / n;
      const y = y0 + ((y1 - y0) * i) / n;
      const c = burning(hotAt(0.3 + i * 0.07) + 0.08);
      fore.mark(x, y, c);
      if (i % 2 === 0) fore.mark(x, y - 1, c);
      else fore.mark(x + 1, y, c);
    }
    const palm = st.part(st.near(hand) + 0.2);
    ball(palm, st, hand, [[aW + 0.55, 0, 0], [0, aW + 0.55, 0], [0, 0, aW + 0.5]], SKIN);
    const [hx, hy] = st.at(hand);
    palm.mark(hx, hy - 0.5, burning(hotAt(0.5) + 0.15));
    lights.push({ x: hx, y: hy, r: 8 + heat * 5, color: CYAN[2], a: 0.18 + heat * 0.14 });
  }

  // --- the mantle over his shoulders, down to his chest in front and his shoulder blades behind,
  // its edge marked with points of light; and the cowl of it lying down his back ---
  const [hf, hl, hu] = s.face;
  const R = B.headR;
  {
    const top: Ring = { c: add(s.neck, mul(cu, 0.6)), u: mul(cf, B.ribDeep * 0.8), v: mul(cl, 3.4) };
    const shoulders: Ring = { c: add(s.neck, mul(cu, -1.8)), u: mul(cf, B.ribDeep + 1.4), v: mul(cl, B.shoulderHalf + aS + 0.6) };
    const sway = add(mul(lag, 0.4), mul(cl, Math.sin(round + 0.6) * 0.3));
    const hem: Ring = { c: add(add(s.neck, mul(cu, -9.5)), sway), u: mul(cf, B.ribDeep + 2.0), v: mul(cl, B.shoulderHalf + aS + 1.5) };
    const mantle = st.part(st.near(s.neck) + 0.1);
    cloth(mantle, st, [top, shoulders, hem], MANTLE, { ragged: true, folds: [40, -40, 160, -160] });
    // (its edge: a point of light every few pixels)
    const n = 22;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const out = add(mul(hem.u, Math.cos(a)), mul(hem.v, Math.sin(a)));
      if (st.seen(out)[2] < 0) continue;
      const [x, y] = st.at(add(add(hem.c, out), mul(cu, 0.8)));
      mantle.mark(x, y, burning(hotAt(i / n) * 0.85));
    }
    // (the cowl: a fold of it, thrown back, lying across his shoulders behind his neck)
    const cowlA: Ring = { c: add(off(s.neck, s.chest, -1.4, 0, 1.6), mul(cu, 0.4)), u: mul(cf, B.ribDeep * 0.75), v: mul(cl, B.shoulderHalf * 0.7) };
    const cowlB: Ring = { c: off(s.neck, s.chest, -B.ribDeep * 0.9, 0, -5.5), u: mul(cf, B.ribDeep * 0.55), v: mul(cl, B.shoulderHalf * 0.55) };
    cloth(st.part(st.near(off(s.neck, s.chest, -3, 0, -2))), st, [cowlA, cowlB], MANTLE, { arc: [110, 250], lining: 0.35 });
  }

  // --- his head, in the cowl of his mantle: a face in its shadow, heavy white brows, his eyes
  // burning; the edge of the cowl marked with points of light ---
  const head = st.part(st.near(s.head) + 0.3);
  rod(head, st, s.neck, s.skull, 2.3, 2.3, SKIN);
  ball(head, st, s.head, [mul(hf, R[0]), mul(hl, R[1]), mul(hu, R[2])], (u, tone) => {
    // (the brows: a heavy white ridge over each eye)
    if (u[0] > 0.7 && u[2] > 0.16 && u[2] < 0.36 && Math.abs(u[1]) > 0.08 && Math.abs(u[1]) < 0.66) return HAIR[3];
    return SKIN[tone];
  });
  for (const t of eyesToward(st, s)) {
    if (!faces(st, s, t)) continue;
    const a = t * D;
    const eye = add(s.head, add(add(mul(hf, Math.cos(a) * R[0] * 0.97), mul(hl, Math.sin(a) * R[1] * 0.97)), mul(hu, 0.04 * R[2])));
    const [x, y] = st.at(eye);
    head.mark(Math.round(x - 0.5), Math.round(y - 0.5), heat > 0.5 ? '#ffffff' : CYAN[3]);
    head.mark(Math.round(x - 0.5), Math.round(y - 0.5) + 1, CYAN[2]);
    lights.push({ x, y, r: 5 + heat * 3, color: CYAN[2], a: 0.25 + heat * 0.2 });
  }
  // (the cowl: a shell over his head, open over his face, its peak a little back and up)
  {
    const hood = st.part(st.near(s.head) + 0.5);
    const c = add(s.head, add(mul(hf, -R[0] * 0.18), mul(hu, R[2] * 0.12)));
    const big: readonly [V3, V3, V3] = [mul(hf, R[0] * 1.22), mul(hl, R[1] * 1.3), mul(hu, R[2] * 1.2)];
    ball(hood, st, c, big, (u, tone) => {
      // (open in front: an oval round the face, down to the chin)
      if (u[0] > -0.05 && Math.abs(u[1]) < 0.8 - Math.max(0, u[2] - 0.2) * 0.6 && u[2] < 0.72) return null;
      return MANTLE[tone];
    });
    // (its peak: a point drawn back over the crown)
    const peakA: Ring = { c: add(c, mul(hu, R[2] * 0.75)), u: mul(hf, R[0] * 0.9), v: mul(hl, R[1] * 0.9) };
    const peakB: Ring = { c: add(add(c, mul(hu, R[2] * 1.45)), mul(hf, -R[0] * 0.9)), u: mul(hf, 0.4), v: mul(hl, 0.4) };
    cloth(hood, st, [peakB, peakA], MANTLE, { lift: 0.3 });
    // (its edge round his face: points of light)
    if (!fromBehind) {
      const n = 14;
      for (let i = 0; i < n; i++) {
        const a = -Math.PI * 0.95 + (i / (n - 1)) * Math.PI * 1.9;
        const p = add(c, add(add(mul(hf, R[0] * 1.3 * 0.62), mul(hl, Math.sin(a) * R[1] * 1.38 * 0.74)), mul(hu, Math.cos(a) * R[2] * 1.3 * 0.62)));
        if (st.near(p) < st.near(s.head)) continue;
        const [x, y] = st.at(p);
        if (i % 2 === 0) hood.mark(x, y, burning(hotAt(i / n) * 0.8));
      }
    }
  }

  // --- his beard: long and white, from his jaw down over his chest to his belt, a moustache over it ---
  {
    const chin: Ring = { c: add(s.head, add(mul(hf, R[0] * 0.6), mul(hu, -R[2] * 0.45))), u: mul(hf, R[0] * 0.5), v: mul(hl, R[1] * 0.95) };
    const sway = add(mul(lag, 0.6), mul(cl, Math.sin(round + 1.3) * 0.35));
    const chest: Ring = { c: add(off(s.ribs, s.chest, B.ribDeep + 1.4, 0, B.chest * 0.62), mul(sway, 0.4)), u: mul(cf, 1.7), v: mul(cl, R[1] * 1.12) };
    const belly: Ring = { c: add(off(s.ribs, s.chest, B.ribDeep + 1.6, 0, -1.5), mul(sway, 0.8)), u: mul(cf, 1.2), v: mul(cl, R[1] * 0.7) };
    const end: Ring = { c: add(off(lerp3(s.ribs, s.waist, 0.7), s.chest, B.ribDeep + 1.4, 0, 0), sway), u: mul(cf, 0.4), v: mul(cl, 0.5) };
    const beard = st.part(st.near(chest.c) + 0.6);
    cloth(beard, st, [chin, chest, belly, end], HAIR, { folds: [0, 30, -30] });
    if (!fromBehind) {
      const lip = add(s.head, add(mul(hf, R[0] * 0.92), mul(hu, -R[2] * 0.22)));
      ball(st.part(st.near(lip) + 0.4), st, lip, [mul(hf, 1.0), mul(hl, R[1] * 0.75), mul(hu, 0.9)], HAIR);
    }
  }

  // --- what is in the air: the small rune turning over his right hand as he stands (prop 2), or the
  // great rune he writes, gathers up and drives into the slab (prop 1) ---
  if (q.prop === 2) {
    const over = add(s.handR, [0, 0, 7 + Math.sin(q.pt * Math.PI * 4) * 1.2]);
    const [x, y] = st.at(over);
    const k = Math.floor(q.pt * 4) % 4;
    glyphIn(st, k, x, y, burning(0.7 + 0.2 * throb));
    lights.push({ x, y, r: 12, color: CYAN[2], a: 0.3 });
  } else if (q.prop === 1) {
    greatRune(st, s, q.pt, lights);
  }

  return { px: st.whole(null), lights };
}

/**
 * The great rune: written stroke by stroke in front of his chest (`pt` 0 to 0.6), blazing (to
 * 0.75), gathered up over his head with his hands (0.75), and driven down and out in front of him,
 * smaller as it goes, into the slab (to 1).
 */
function greatRune(st: Stage, s: Skeleton, pt: number, lights: Light[]): void {
  const [cf] = s.chest;
  const fwd: V3 = [s.hips[0][0], s.hips[0][1], 0];
  const before = add(add(s.neck, mul(fwd, 15)), [0, 0, -7]);
  const above = add(add(s.neck, mul(fwd, 9)), [0, 0, 14]);
  const slab = add(mul(fwd, 34), [0, 0, 22]);
  let c: V3;
  let size = 7;
  if (pt <= 0.75) c = before;
  else if (pt <= 0.8) c = lerp3(before, above, (pt - 0.75) / 0.05);
  else if (pt <= 0.95) {
    const k = (pt - 0.8) / 0.15;
    c = lerp3(above, slab, k * k);
    size = 7 - 3 * k;
  } else c = slab;
  if (pt >= 0.99) return;
  const [cx, cy] = st.at(c);
  const done = Math.min(1, pt / 0.6) * GREAT.length;
  const hot = pt > 0.6 ? 1 : 0.75;
  for (let i = 0; i < GREAT.length; i++) {
    const part = Math.max(0, Math.min(1, done - i));
    if (part <= 0) break;
    const [ax, ay, bx, by] = GREAT[i];
    const x0 = cx + ax * size;
    const y0 = cy - ay * size;
    const x1 = cx + (ax + (bx - ax) * part) * size;
    const y1 = cy - (ay + (by - ay) * part) * size;
    const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 1.5));
    for (let j = 0; j <= n; j++) {
      const x = Math.round(x0 + ((x1 - x0) * j) / n - 0.5);
      const y = Math.round(y0 + ((y1 - y0) * j) / n - 0.5);
      st.over.set(x, y, hot >= 1 ? '#ffffff' : CYAN[3]);
      // (a glow either side of the stroke)
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) if (!st.over.has(x + dx, y + dy)) st.over.set(x + dx, y + dy, CYAN[2]);
    }
    // (where the hand is writing it now: a spark)
    if (part < 1) {
      st.over.set(Math.round(x1 - 0.5), Math.round(y1 - 0.5), '#ffffff');
      for (const [dx, dy] of [[2, 0], [-2, 0], [0, 2], [0, -2]] as const) st.over.set(Math.round(x1 - 0.5) + dx, Math.round(y1 - 0.5) + dy, CYAN[3]);
    }
  }
  // (blazing: rays from it)
  if (pt > 0.6) {
    const k = Math.min(1, (pt - 0.6) / 0.15);
    for (let r = 0; r < 8; r++) {
      const a = (r / 8) * Math.PI * 2 + 0.3;
      for (let j = Math.round(size + 2); j < size + 2 + 4 * k; j++) st.over.set(Math.round(cx + Math.cos(a) * j - 0.5), Math.round(cy + Math.sin(a) * j * 0.8 - 0.5), j % 2 === 0 ? '#ffffff' : CYAN[3]);
    }
  }
  lights.push({ x: cx, y: cy, r: 22 + (pt > 0.6 ? 14 : 0), color: CYAN[2], a: 0.35 + (pt > 0.6 ? 0.2 : 0) });
  void cf;
  void INK;
}

// ---------------------------------------------------------------------------------------------
// As the town has its people (art/townsfolk.ts, Townsman)

/** His pool of light: the friend's cyan, a little wider than a hero's (he is bigger, and he burns). */
const AURA_SMITH: Light = { x: CANVAS3.ax - 4, y: CANVAS3.ay - 34, r: 56, color: '#28dcf0', a: 0.24 };

/** One frame of him: the moment `t` of a run of keys, turned to face `to`, the wind at `wind`. */
export function smithFrame(keys: ReadonlyArray<Key3>, t: number, to: Facing, wind: number): Sprite {
  const q = bonesAt(keys, SMITH_STANCE, t);
  const s = solve(SMITH_BODY, q);
  const prev = solve(SMITH_BODY, bonesAt(keys, SMITH_STANCE, Math.max(0, t - 1 / 30)));
  return toSprite(paintSmith3(s, q, FACING_TURN[to], { prev, wind }), AURA_SMITH, CANVAS3.ax, CANVAS3.ay);
}

/** The town's frames of him: standing at his work (the slab is to his left: he faces down the screen to the left), what he does now and then, and turned to whoever comes up to him. */
export function makeSmith3(fps = 10, actFps = 20): Townsman {
  const idleN = Math.round(SMITH_IDLE_LONG * fps);
  const idleOf = (to: Facing): Sprite[] => lazyFrames(idleN, (i) => smithFrame(IDLE_KEYS, (i / idleN) * SMITH_IDLE_LONG, to, i / idleN));
  const idle = idleOf('sw');
  const actN = Math.round(SMITH_ACT_LONG * actFps) + 1;
  const act = lazyFrames(actN, (i) => smithFrame(ACT_KEYS, (i / (actN - 1)) * SMITH_ACT_LONG, 'sw', (i / (actN - 1)) % 1));
  return { idle, act, loops: 3, work: 'sw', turned: { sw: idle, se: idleOf('se'), ne: idleOf('ne'), nw: idleOf('nw') } };
}

/** For the dev pages and the tests: the keys of his standing loop and of what he does now and then. */
export const SMITH_MOVES = { idle: IDLE_KEYS, act: ACT_KEYS };

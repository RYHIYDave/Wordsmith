// THE WARLOCK'S DEMON, HULKING (the art chat, 23 Oct 2026). NOT IN THE GAME: a sketch for him to judge.
//
// The owner, 23 Oct 2026 (Pacific), of the classic demon built on the heroes' bones: “Cmon man.  No that isn’t it.  Try more
// hulking.  It doesn’t have to fit on the same character wire.  Make it menacing”. So it is built FREE of the heroes' bones:
// every part placed by hand in the figure's own space and painted with the heroes' solids (art/skin.ts), so it is lit and
// seamed as they are. Nearly twice a hero's height and three times his bulk: a hump of muscle where a neck should be, the
// head hung low and forward under it, horns thrust forward; arms like trunks hanging to its knees, hands like shovels with
// hooked claws; short goat legs bent back at the hock, on cloven hooves; spines down its back; a heavy tail. Its hide nearly
// black; HIS CYAN BURNING THROUGH IT: the cracks of his pact across chest and arms, the eyes, the furnace of its mouth, the
// fire in its left hand. (Pink and gold glows are the enemy's; this is a friend.)

import { CYAN, GLINT, INK, SPARK } from '../art/kit';
import type { Painted, Ramp } from '../art/kit';
import { FRIEND_RIM } from '../art/hero3_knight';
import { ball, cloth, rod, stage } from '../art/skin';
import type { GameView, Ring, Sheet, Stage } from '../art/skin';
import type { Px } from '../engine/px';
import { add, lerp3, mul, norm, sub } from '../art/skeleton';
import type { V3 } from '../art/skeleton';

/** Its hide: nearly black, a dark wine where the light falls. */
export const HULK_HIDE: Ramp = ['#07040a', '#07040a', '#1c0b14', '#36141e', '#5a1e28'];
/** Horn, claw and hoof: black at the root to bone at the tip. */
const HORN: Ramp = ['#08060c', '#08060c', '#2a2430', '#6a6070', '#cfc6da'];
const BONE: Ramp = ['#2a2236', '#2a2236', '#8a7c96', '#d6cce2', '#f4f0fa'];
/** The rag of his coat round its loins. */
const COAL: Ramp = ['#141226', '#141226', '#2a2640', '#4a4462', '#4a4462'];
const RUST: Ramp = ['#3e1222', '#3e1222', '#7a2432', '#b44a44', '#b44a44'];

/** Its canvas: big enough for it and its horns. */
export const HULK_CANVAS = { w: 340, h: 300, ax: 170, ay: 262 };

export interface HulkLook {
  name: string;
  /** Turned this many degrees to its left from facing the eye. */
  yaw: number;
  /** Its horns: thrust forward as a bull's, or swept up and back. */
  horns: 'forward' | 'back';
  /** Its left hand (the fire's) raised before it, claws spread, or hanging. */
  raised: boolean;
  /** Ragged wings folded on its back, or none. */
  wings: boolean;
  /** What pours off it: black smoke, or, with a word of that kind on him, flames, frost, lightning or poison's stink. */
  aura?: Aura;
}
/** (the owner, 23 Oct 2026, 21:07 Pacific: “Have the demon effuse black smoke.  I’d like the demon form to change based on the
 * damage word type attached to it.  So the black smoke can turn to flames or frost, or crackling lightning, or green stink lines
 * or whatever”) The game's damage kinds (game/types.ts Element: phys, fire, frost, lightning) and the poison word; each in the
 * words' own colours (art/palette.ts, as the hero's words are drawn). */
export type Aura = 'smoke' | 'fire' | 'frost' | 'lightning' | 'poison';
export const AURAS: Aura[] = ['smoke', 'fire', 'frost', 'lightning', 'poison'];

export const HULKS: HulkLook[] = [
  { name: 'Horns forward, its fire raised', yaw: -18, horns: 'forward', raised: true, wings: false },
  { name: 'Horns swept back, arms hanging', yaw: -22, horns: 'back', raised: false, wings: false },
  { name: 'Horns forward, ragged wings', yaw: -18, horns: 'forward', raised: true, wings: true },
];

const D = Math.PI / 180;

/** A small deterministic noise in 0..1. */
function hash(a: number, b: number, k: number): number {
  let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263) + Math.imul(k | 0, 2147483647)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** THE HULKING DEMON, as `o`, seen from in front or behind. */
export function paintHulk(o: HulkLook, view: GameView = 'front'): Painted {
  const st = stage(view, HULK_CANVAS.ax, HULK_CANVAS.ay, HULK_CANVAS);
  // its own way about: forward toward the eye (turned by its yaw), its left to the picture's right, up
  const F0 = norm([1, -1, 0]);
  const L0 = norm([1, 1, 0]);
  const a = o.yaw * D;
  const F = add(mul(F0, Math.cos(a)), mul(L0, Math.sin(a)));
  const L = add(mul(F0, -Math.sin(a)), mul(L0, Math.cos(a)));
  const U: V3 = [0, 0, 1];
  const P = (f: number, l: number, u: number): V3 => add(add(mul(F, f), mul(L, l)), mul(U, u));
  const axes = (rf: number, rl: number, ru: number): readonly [V3, V3, V3] => [mul(F, rf), mul(L, rl), mul(U, ru)];
  const hide = HULK_HIDE;
  const behind = st.near(F) < 0;
  /** A part as near as `p`, plus a little. */
  const part = (p: V3, more = 0): Sheet => st.part(st.near(p) + more);

  // ---- ITS SKELETON, placed by hand (picture lengths; the floor at 0)
  const pelvis = P(-2, 0, 46);
  const chest = P(6, 0, 70);
  const hump = P(-6, 0, 84);
  const head = P(25, 0, 86);
  const legs = ([1, -1] as const).map((side) => ({
    side,
    hip: P(0, side * 12, 44),
    knee: P(10, side * 17, 28),
    hock: P(-6, side * 16, 14),
    hoof: P(side > 0 ? 4 : -2, side * 15, 2.4),
  }));
  const arm = (side: 1 | -1) => {
    const raised = o.raised && side > 0;
    const sh = P(4, side * 31, 82);
    const el = raised ? P(14, side * 44, 64) : P(6, side * 42, 58);
    const hand = raised ? P(30, side * 38, 62) : P(16, side * 40, 30);
    return { side, sh, el, hand, raised };
  };
  const arms = [arm(1), arm(-1)];

  // ---- THE TAIL: heavy, from the small of its back down to the floor and away, a hooked spike at its end
  {
    const p = part(P(-24, -10, 20), -6);
    const pts = [P(-14, 0, 44), P(-26, -6, 30), P(-30, -18, 12), P(-22, -32, 6), P(-12, -40, 10)];
    for (let i = 0; i + 1 < pts.length; i++) rod(p, st, pts[i], pts[i + 1], 5.5 - i * 1.1, 4.4 - i * 1.0, hide);
    rod(p, st, pts[4], P(-4, -44, 18), 2.4, 0.3, HORN);
  }

  // ---- RAGGED WINGS folded on its back (the third look)
  if (o.wings) {
    for (const side of [1, -1]) {
      const p = part(P(-16, side * 20, 84), -8);
      const root = P(-10, side * 16, 88);
      const wrist = P(-18, side * 30, 118);
      rod(p, st, root, wrist, 3.0, 2.2, hide);
      const tips = [P(-24, side * 40, 112), P(-26, side * 42, 86), P(-24, side * 36, 60)];
      for (const t of tips) rod(p, st, wrist, t, 1.6, 0.4, HORN);
      const rings: Ring[] = [];
      void rings;
      // (the leather: torn between the fingers)
      const pts = [root, wrist, ...tips, P(-14, side * 22, 64)];
      const pix = pts.map((q) => st.at(q));
      const ys = pix.map((q) => q[1]);
      const z = st.near(root) - 1;
      for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++) {
        const xs: number[] = [];
        for (let i = 0; i < pix.length; i++) {
          const [ax, ay] = pix[i];
          const [bx, by] = pix[(i + 1) % pix.length];
          if ((ay <= y && by > y) || (by <= y && ay > y)) xs.push(ax + ((y - ay) * (bx - ax)) / (by - ay));
        }
        xs.sort((u, v) => u - v);
        for (let k = 0; k + 1 < xs.length; k += 2) {
          for (let x = Math.round(xs[k]); x < Math.round(xs[k + 1]); x++) {
            if (hash(x >> 2, y >> 3, side + 9) < 0.12) continue;
            p.put(x, y, hash(x, y >> 2, 3) < 0.2 ? hide[1] : hide[2], z);
          }
        }
      }
    }
  }

  // ---- THE LEGS: a goat's, short and thick: a great thigh forward to the knee, back to a high hock, down to a cloven hoof;
  // coarse hair from the thigh down
  for (const g of legs) {
    const { side, hip, knee, hock, hoof } = g;
    const th = part(lerp3(hip, knee, 0.5), 0.5);
    rod(th, st, hip, knee, 11, 8, hide);
    const sh = part(lerp3(knee, hock, 0.5));
    rod(sh, st, knee, hock, 7.5, 4.5, hide);
    shag(sh, hide, 11 + side);
    const cn = part(lerp3(hock, hoof, 0.5), 0.2);
    rod(cn, st, hock, hoof, 4.2, 3.2, hide);
    shag(cn, hide, 21 + side);
    const hf = part(hoof, 0.6);
    ball(hf, st, add(hoof, mul(F, 2.0)), axes(6.0, 4.4, 3.0), (u, t) => (Math.abs(u[1]) < 0.1 && u[0] > -0.3 ? INK : HORN[Math.min(3, t + 1)]));
    // (spurs of bone off the back of the hock)
    const sp = part(hock, 0.4);
    rod(sp, st, add(hock, mul(F, -2)), add(hock, add(mul(F, -9), mul(U, 2))), 2.0, 0.3, HORN);
  }

  // ---- A RAG OF HIS COAT round its loins, its red hem; HIS RED BOOK on a chain at its hip
  {
    const sk = part(pelvis, 1.5);
    const rings: Ring[] = [
      { c: P(-1, 0, 52), u: mul(F, 15), v: mul(L, 17) },
      { c: P(1, 0, 38), u: mul(F, 18), v: mul(L, 20) },
    ];
    cloth(sk, st, rings, COAL, { ragged: true, hem: RUST, folds: [0, 30, -30, 90, -90, 150, -150, 180] });
    const book = P(10, -20, 38);
    const bp = part(book, 4);
    ball(bp, st, book, axes(5, 2.4, 6), RUST);
  }

  // ---- THE TRUNK: belly, ribcage, two great slabs of chest; and over its back THE HUMP, a mountain of muscle from the head's
  // root out to both shoulders. Each its own part, so the dark seams draw the muscle.
  const belly = part(P(6, 0, 54), 0.5);
  ball(belly, st, P(4, 0, 56), axes(14, 16, 11), hide);
  const ribs = part(chest);
  ball(ribs, st, chest, axes(17, 25, 17), hide);
  for (const side of [1, -1]) {
    const at = P(17, side * 12, 72);
    const pec = part(at, 1);
    ball(pec, st, at, axes(7, 13, 9), hide);
  }
  for (const up of [50, 58]) {
    for (const side of [1, -1]) {
      const at = P(16, side * 6, up);
      const ab = part(at, 0.5);
      ball(ab, st, at, axes(4, 5.5, 4), hide);
    }
  }
  const humpP = part(hump, behind ? 1 : -2);
  ball(humpP, st, hump, axes(13, 21, 10), hide);
  for (const side of [1, -1]) {
    const tr = part(P(0, side * 16, 84), behind ? 1.5 : -1);
    ball(tr, st, P(0, side * 17, 84), axes(11, 12, 9), hide);
  }
  // spines down its back, from the hump to the tail's root
  for (let i = 0; i < 6; i++) {
    const at = P(-16 - i * 0.2, 0, 84 - i * 7.5);
    const sp = part(at, 0.5);
    rod(sp, st, at, add(at, add(mul(F, -9 + i * 0.6), mul(U, 6 - i * 0.6))), 3.0 - i * 0.25, 0.3, i === 0 ? BONE : HORN);
  }

  // ---- THE ARMS: shoulder, upper arm and forearm each its own; forearms like trunks; hands like shovels; hooked claws
  for (const A of arms) {
    const { side, sh, el, hand, raised } = A;
    const dl = part(sh, 2);
    ball(dl, st, sh, axes(12, 12, 11), hide);
    const up = part(lerp3(sh, el, 0.5), 1);
    rod(up, st, sh, lerp3(sh, el, 0.5), 10, 11, hide);
    rod(up, st, lerp3(sh, el, 0.5), el, 11, 8.5, hide);
    const fo = part(lerp3(el, hand, 0.5), 1.5);
    rod(fo, st, el, lerp3(el, hand, 0.35), 9, 11, hide);
    rod(fo, st, lerp3(el, hand, 0.35), hand, 11, 7, hide);
    // (spines down the back of the forearm)
    const back = norm(sub(mul(F, -1), mul(norm(sub(hand, el)), 0)));
    for (let i = 1; i <= 3; i++) {
      const at = lerp3(el, hand, 0.15 + i * 0.2);
      const sp = part(at, 0.2);
      rod(sp, st, add(at, mul(back, 6)), add(at, add(mul(back, 13 - i * 2), mul(U, 2))), 2.2, 0.3, HORN);
    }
    const hp = part(hand, 2.5);
    ball(hp, st, hand, axes(8.5, 7.5, 7.5), hide);
    // claws: four, long, hooked, bone pale toward their points
    const dir = raised ? norm(add(mul(F, 1), mul(U, 0.6))) : norm(add(mul(F, 0.6), mul(U, -1)));
    const across = norm(sub(mul(L, 1), mul(dir, 0)));
    for (const k of [-1.5, -0.5, 0.5, 1.5]) {
      const a0 = add(hand, add(mul(dir, 6.5), mul(across, k * 3.2)));
      const m = add(a0, add(mul(dir, 6.5), mul(F, raised ? -0.5 : 2.0)));
      const b = add(m, add(mul(dir, 3.0), mul(F, raised ? -4 : 3.5)));
      const cp = part(a0, raised ? 3 : 3.5);
      rod(cp, st, a0, m, 2.0, 1.4, HORN);
      rod(cp, st, m, b, 1.4, 0.2, BONE);
    }
  }

  // ---- THE HEAD: hung low and forward under the hump; a brow like a shelf; a jaw thrust out, fangs up out of it and down
  // into it; burning eyes; horns
  const hd = part(head, 3);
  ball(hd, st, head, axes(9, 9.5, 10), hide);
  const jaw = P(32, 0, 79);
  const jp = part(jaw, 3.5);
  ball(jp, st, jaw, axes(7, 9, 5), hide);
  const brow = part(P(32, 0, 90), 4);
  ball(brow, st, P(31, 0, 89.5), axes(4, 9.5, 3), hide);
  // (ears: short, swept back)
  for (const side of [1, -1]) {
    const e = part(P(21, side * 9, 88), 2);
    rod(e, st, P(21, side * 8, 88), P(15, side * 15, 92), 2.2, 0.3, hide);
  }
  // the horns
  for (const side of [1, -1]) {
    const hp = part(P(26, side * 10, 92), 3.5);
    const pts =
      o.horns === 'forward'
        ? [P(25, side * 7, 94), P(25, side * 15, 98), P(31, side * 22, 102), P(41, side * 23, 102), P(49, side * 19, 98)]
        : [P(25, side * 7, 94), P(21, side * 13, 102), P(13, side * 16, 110), P(3, side * 17, 114), P(-7, side * 16, 112)];
    const shades: Ramp[] = [[HORN[0], HORN[0], HORN[1], HORN[2], HORN[2]], [HORN[1], HORN[1], HORN[2], HORN[3], HORN[3]], [HORN[2], HORN[2], HORN[3], BONE[3], BONE[3]], [BONE[1], BONE[1], BONE[2], BONE[3], BONE[4]]];
    for (let i = 0; i + 1 < pts.length; i++) rod(hp, st, pts[i], pts[i + 1], 4.4 - i * 1.05, Math.max(0.3, 4.4 - (i + 1) * 1.05), shades[i]);
  }

  // ---- HIS CYAN BURNING THROUGH: eyes, the furnace of its mouth, the cracks of his pact, the fire in its left hand
  if (!behind) {
    const glow = (p: V3, w: number, h: number, hot = true): void => {
      const [x, y] = st.at(p);
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) st.over.set(Math.round(x) + i - Math.floor(w / 2), Math.round(y) + j, hot && j === 0 ? '#ffffff' : GLINT);
    };
    // eyes: slanted slits under the brow
    for (const side of [1, -1]) {
      const [x, y] = st.at(P(35, side * 5, 86));
      for (let i = 0; i < 4; i++) st.over.set(Math.round(x) + side * i, Math.round(y) - (i > 1 ? 1 : 0), i < 2 ? '#ffffff' : GLINT);
    }
    // the mouth: a gash of light, fangs across it
    const [mx, my] = st.at(P(38, 0, 80));
    for (let i = -6; i <= 6; i++) {
      const fang = Math.abs(i) % 3 === 1;
      st.over.set(Math.round(mx) + i, Math.round(my), fang ? BONE[4] : SPARK[3]);
      st.over.set(Math.round(mx) + i, Math.round(my) + 1, fang ? BONE[3] : SPARK[2]);
      if (Math.abs(i) === 5) for (let k = 1; k <= 3; k++) st.over.set(Math.round(mx) + i, Math.round(my) - k, BONE[k < 2 ? 4 : 3]);
    }
    void glow;
    // the cracks of his pact: jagged lines of light branching across the chest, down the belly and along the arms
    const crack = (from: V3, to: V3, seed: number, branches = 2): void => {
      const [x0, y0] = st.at(from);
      const [x1, y1] = st.at(to);
      const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
      let wob = 0;
      for (let i = 0; i <= n; i++) {
        wob += (hash(i, seed, 7) - 0.5) * 1.6;
        wob *= 0.8;
        const x = Math.round(x0 + ((x1 - x0) * i) / n + wob);
        const y = Math.round(y0 + ((y1 - y0) * i) / n);
        st.over.set(x, y, i % 5 === 0 ? '#ffffff' : SPARK[2]);
        if (branches > 0 && hash(i, seed, 8) < 0.06) {
          const len = 3 + Math.floor(hash(i, seed, 9) * 4);
          const dx = hash(i, seed, 10) < 0.5 ? -1 : 1;
          for (let k = 1; k <= len; k++) st.over.set(x + dx * k, y + k, SPARK[2]);
        }
      }
    };
    crack(P(20, 4, 82), P(22, -6, 62), 1);
    crack(P(22, -6, 62), P(18, 2, 48), 2);
    for (const A of arms) crack(lerp3(A.el, A.hand, 0.15), lerp3(A.el, A.hand, 0.7), 20 + A.side, 1);
    // the fire in its left hand
    const fire = arms[0].raised ? add(arms[0].hand, mul(U, 6)) : add(arms[0].hand, mul(U, 4));
    const [fx, fy] = st.at(fire);
    const tongues = [[-5, 10], [-3, 16], [-1, 12], [1, 20], [3, 14], [5, 11], [7, 7], [-7, 6]] as const;
    for (const [dx, h] of tongues) {
      for (let j = 0; j < h; j++) {
        const k = j / h;
        const w = Math.round(Math.sin(j * 0.7 + dx) * 1.5 * k);
        const col = k < 0.3 ? '#ffffff' : k < 0.65 ? SPARK[3] : SPARK[2];
        st.over.set(Math.round(fx) + dx + w, Math.round(fy) - j, col);
        if (k < 0.55) st.over.set(Math.round(fx) + dx + w + 1, Math.round(fy) - j, k < 0.3 ? '#ffffff' : SPARK[3]);
      }
    }
    for (let i = -6; i <= 6; i++) st.under.set(Math.round(fx) + i, Math.round(fy) + 1, CYAN[2]);
  }
  const px = st.whole(FRIEND_RIM);
  drawAura(st, px, o.aura ?? 'smoke', {
    from: [P(-2, 0, 96), P(2, 24, 94), P(2, -24, 94), P(-12, 14, 90), P(-12, -14, 90), ...arms.map((A) => lerp3(A.el, A.hand, 0.4)), ...arms.map((A) => A.sh)],
    horns: [P(41, 23, 102), P(41, -23, 102), P(49, 19, 98), P(49, -19, 98)],
    jaw: P(38, 0, 78),
    claws: arms.map((A) => A.hand),
    feet: legs.map((g) => g.hoof),
    behind,
  });
  return { px, lights: [], tails: [] };
}

/** What pours off it, about the points given. */
interface AuraAt {
  /** Where it rises from: the hump, the shoulders, the back, the forearms. */
  from: V3[];
  horns: V3[];
  jaw: V3;
  claws: V3[];
  feet: V3[];
  behind: boolean;
}
const SMOKE = ['#0e0b14', '#17121f', '#221c2c', '#302940', '#403856'];
const FIRE = ['#a8300c', '#e05018', '#ff8a2a', '#ffc24a', '#fff0a0', '#ffffff'];
const FROST = ['#1c4a9a', '#2e6cc8', '#58a8f0', '#b0e0ff', '#ffffff'];
const BOLT = ['#c8b020', '#fff060', '#ffffd0', '#ffffff'];
const STINK = ['#4a5a0c', '#7c9416', '#b4cc24', '#e6f47a'];
function drawAura(st0: Stage, out: Px, kind: Aura, at: AuraAt): void {
  // (drawn on the finished picture, so that the friend's rim goes round him and not round his smoke: what is "under" him only
  // where he is not)
  const st = {
    at: st0.at,
    under: { set: (x: number, y: number, c: string) => (out.has(x, y) ? undefined : out.set(x, y, c)) },
    over: { set: (x: number, y: number, c: string) => out.set(x, y, c) },
  };
  const pix = (p: V3): [number, number] => {
    const [x, y] = st.at(p);
    return [Math.round(x), Math.round(y)];
  };
  /** A soft round puff: its core, its rim lit at the upper left; drawn on `layer`; `every`: 1 solid, 2 every other pixel. */
  const puff = (layer: 'under' | 'over', x: number, y: number, r: number, tones: readonly string[], every = 1): void => {
    const L = layer === 'under' ? st.under : st.over;
    for (let j = -r; j <= r; j++) {
      for (let i = -r; i <= r; i++) {
        const d = Math.hypot(i, j) / r;
        if (d > 1) continue;
        if (every > 1 && (x + i + y + j) % every !== 0) continue;
        const lit = -i - j > r * 0.6;
        L.set(x + i, y + j, d > 0.8 ? tones[lit ? 3 : 1] : lit ? tones[2] : tones[d < 0.45 ? 0 : 1]);
      }
    }
  };
  const sources = at.from.map(pix);
  if (kind === 'smoke') {
    // black smoke pouring up off it, curling and thinning as it rises, mostly behind it; wisps across it; a pall at its hooves
    sources.forEach(([sx, sy], n) => {
      const drift = (n % 2 ? 1 : -1) * (0.6 + hash(n, 3, 4));
      for (let i = 0; i < 16; i++) {
        const t = i / 15;
        const x = sx + Math.round(Math.sin(i * 0.55 + n * 1.7) * 4 * t + drift * t * 16);
        const y = sy - Math.round(i * 3.6 + hash(i, n, 4) * 2);
        const r = Math.round(2 + t * 4 + hash(i, n, 5) * 1.5);
        // (thinner as it rises: solid low down, every other pixel higher, every third at the top)
        puff(i < 3 && !at.behind ? 'over' : 'under', x, y, r, SMOKE, t < 0.4 ? 1 : t < 0.75 ? 2 : 3);
      }
    });
    for (const h of at.horns.map(pix)) for (let i = 0; i < 5; i++) puff('under', h[0] + i * 2, h[1] - 2 - i * 4, 1 + Math.round(i * 0.7), SMOKE, i < 2 ? 1 : 2);
    if (!at.behind) {
      const [jx, jy] = pix(at.jaw);
      for (let i = 0; i < 5; i++) puff('over', jx + 3 + i * 3, jy - 1 - i * 3, 1 + Math.round(i * 0.6), SMOKE, 2);
    }
    for (const f of at.feet.map(pix)) for (let i = -3; i <= 3; i++) puff('under', f[0] + i * 5, f[1] + 1 - Math.abs(i) * 0.5, 4, SMOKE, Math.abs(i) > 1 ? 2 : 1);
  } else if (kind === 'fire') {
    // it burns: tongues of flame off its back, its shoulders, its forearms, licking up and away; embers flying
    sources.forEach(([sx, sy], n) => {
      const tall = 16 + Math.round(hash(n, 1, 6) * 16);
      for (let k = -3; k <= 3; k++) {
        const h = Math.round(tall * (1 - Math.abs(k) * 0.2) * (0.7 + hash(n, k + 5, 6) * 0.5));
        for (let j = 0; j < h; j++) {
          const t = j / h;
          const w = Math.max(1, Math.round((1 - t) * 2.5));
          const x = sx + k * 2 + Math.round(Math.sin(j * 0.4 + n + k) * 2.5 * t);
          const col = t < 0.2 ? FIRE[4] : t < 0.45 ? FIRE[3] : t < 0.75 ? FIRE[2] : FIRE[1];
          for (let i = 0; i < w; i++) st.under.set(x + i, sy - j, i === 0 && t < 0.3 && Math.abs(k) < 2 ? FIRE[5] : col);
        }
      }
      for (let e = 0; e < 5; e++) st.under.set(sx + Math.round((hash(e, n, 7) - 0.5) * 26), sy - tall - 3 - Math.round(hash(e, n, 8) * 20), e % 2 ? FIRE[3] : FIRE[4]);
      if (!at.behind) {
        for (const k of [-4, 0, 4]) {
          const h = 5 + Math.round(hash(n, k + 9, 20) * 5);
          for (let j = 0; j < h; j++) {
            const t = j / h;
            const x = sx + k + Math.round(Math.sin(j * 0.9 + n) * t);
            st.over.set(x, sy - j, t < 0.3 ? FIRE[4] : t < 0.7 ? FIRE[3] : FIRE[2]);
            if (t < 0.5) st.over.set(x + 1, sy - j, FIRE[2]);
          }
        }
      }
    });
    for (const h of at.horns.map(pix)) for (let j = 0; j < 8; j++) st.under.set(h[0] + (j % 2), h[1] - j, j < 3 ? FIRE[4] : FIRE[2]);
    if (!at.behind) {
      const [jx, jy] = pix(at.jaw);
      for (let j = 0; j < 8; j++) for (let i = 0; i < 3 - (j >> 2); i++) st.over.set(jx + 4 + i + (j >> 1), jy - j, j < 3 ? FIRE[4] : FIRE[2]);
    }
    for (const f of at.feet.map(pix)) for (let i = -6; i <= 6; i++) for (let j = 0; j < 2 + Math.round(hash(i, f[0], 9) * 5); j++) st.under.set(f[0] + i * 2, f[1] + 2 - j, j < 1 ? FIRE[4] : FIRE[2]);
  } else if (kind === 'frost') {
    // it freezes: a cold mist rolling down off it, rime and icicles grown from its shoulders and horns, snow about it
    sources.forEach(([sx, sy], n) => {
      for (let i = 0; i < 6; i++) puff('under', sx + Math.round((n % 2 ? 1 : -1) * i * 4), sy + i * 5 - 4, 3 + i, FROST, 2);
      // ice: three shards jutting up
      for (let k = -1; k <= 1; k++) {
        const h = 6 + Math.round(hash(n, k + 2, 3) * 7);
        for (let j = 0; j < h; j++) {
          const w = Math.max(0, Math.round((1 - j / h) * 2));
          for (let i = -w; i <= w; i++) st.over.set(sx + k * 4 + i + Math.round(j * k * 0.3), sy - j, i < 0 ? FROST[4] : j > h - 3 ? FROST[3] : FROST[2]);
        }
      }
    });
    for (const h of at.horns.map(pix)) for (let j = 0; j < 4; j++) st.over.set(h[0] + j - 1, h[1] + (j % 2), FROST[4]);
    for (let n = 0; n < 34; n++) {
      const x = Math.round(st.at(at.jaw)[0] + (hash(n, 1, 11) - 0.5) * 150);
      const y = Math.round(st.at(at.jaw)[1] + (hash(n, 2, 11) - 0.6) * 170);
      st.over.set(x, y, FROST[4]);
      if (n % 3 === 0) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) st.over.set(x + dx, y + dy, FROST[3]);
    }
    for (const f of at.feet.map(pix)) for (let i = -3; i <= 3; i++) puff('under', f[0] + i * 6, f[1] + 1, 5, FROST, 2);
  } else if (kind === 'lightning') {
    // it crackles: arcs leaping between its horns and shoulders, down its arms, to the floor
    const bolt = (a: [number, number], b: [number, number], seed: number, layer: 'under' | 'over'): void => {
      const L = layer === 'under' ? st.under : st.over;
      const n = Math.max(2, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 4));
      let px = a[0];
      let py = a[1];
      for (let i = 1; i <= n; i++) {
        const t = i / n;
        const x = Math.round(a[0] + (b[0] - a[0]) * t + (i < n ? (hash(i, seed, 12) - 0.5) * 9 : 0));
        const y = Math.round(a[1] + (b[1] - a[1]) * t + (i < n ? (hash(i, seed, 13) - 0.5) * 9 : 0));
        const m = Math.max(Math.abs(x - px), Math.abs(y - py), 1);
        for (let k = 0; k <= m; k++) {
          const qx = Math.round(px + ((x - px) * k) / m);
          const qy = Math.round(py + ((y - py) * k) / m);
          L.set(qx, qy, BOLT[3]);
          L.set(qx + 1, qy, BOLT[1]);
          L.set(qx, qy + 1, BOLT[0]);
        }
        if (hash(i, seed, 14) < 0.25) for (let k = 1; k <= 4; k++) L.set(x + k, y + k * (hash(i, seed, 15) < 0.5 ? 1 : -1), BOLT[1]);
        px = x;
        py = y;
      }
    };
    const horns = at.horns.map(pix);
    bolt(horns[0], horns[1], 1, 'under');
    bolt(horns[2], sources[1], 2, 'under');
    bolt(horns[3], sources[2], 3, 'under');
    sources.forEach((sp, n) => {
      if (n < 3) bolt(sp, [sp[0] + Math.round((hash(n, 4, 16) - 0.5) * 30), sp[1] - 18 - Math.round(hash(n, 5, 16) * 10)], 10 + n, 'under');
    });
    const claws = at.claws.map(pix);
    const feet = at.feet.map(pix);
    bolt(claws[0], [claws[0][0] + 16, feet[0][1] + 2], 20, 'over');
    bolt(claws[1], [claws[1][0] - 14, feet[1][1] + 2], 21, 'over');
    if (!at.behind) bolt(sources[5], sources[6], 22, 'over');
    for (let n = 0; n < 16; n++) st.over.set(Math.round(st.at(at.jaw)[0] + (hash(n, 6, 17) - 0.5) * 110), Math.round(st.at(at.jaw)[1] + (hash(n, 7, 17) - 0.5) * 120), BOLT[2]);
  } else {
    // poison: green stink rising off it in wavy lines; venom dripping from its jaws and claws; bubbles
    sources.forEach(([sx, sy], n) => {
      for (let k = 0; k < 2; k++) {
        const x0 = sx + (k ? 5 : -4);
        for (let j = 0; j < 26; j++) {
          const x = x0 + Math.round(Math.sin(j * 0.42 + n * 1.3 + k * 2) * 2.4);
          const y = sy - 4 - j - k * 4;
          st.under.set(x, y, j < 6 ? STINK[3] : j < 16 ? STINK[2] : STINK[1]);
          if (j % 2 === 0) st.under.set(x + 1, y, STINK[1]);
        }
      }
      for (let b = 0; b < 2; b++) {
        const bx = sx + Math.round((hash(n, b, 18) - 0.5) * 20);
        const by = sy - 10 - Math.round(hash(n, b, 19) * 24);
        for (let a = 0; a < 12; a++) st.under.set(bx + Math.round(Math.cos((a / 12) * 6.283) * 2), by + Math.round(Math.sin((a / 12) * 6.283) * 2), STINK[2]);
      }
    });
    if (!at.behind) {
      const [jx, jy] = pix(at.jaw);
      for (const dx of [-4, 1, 5]) for (let j = 0; j < 4 + Math.abs(dx); j++) st.over.set(jx + dx, jy + 2 + j, j === 0 ? STINK[3] : STINK[2]);
    }
    for (const c of at.claws.map(pix)) for (const dx of [-5, 0, 4]) for (let j = 0; j < 6; j++) st.over.set(c[0] + dx, c[1] + 8 + j, j > 4 ? STINK[3] : STINK[2]);
    for (const f of at.feet.map(pix)) for (let i = -3; i <= 3; i++) puff('under', f[0] + i * 6, f[1] + 1, 4, STINK, 2);
  }
}

/** COARSE HAIR on a part already painted: darker strands down it, and its outline ragged with tufts out either side. */
function shag(sheet: Sheet, ramp: Ramp, seed: number): void {
  const W = sheet.w;
  const H = sheet.h;
  const extra: [number, number, string, number][] = [];
  for (let y = 0; y < H; y++) {
    let x0 = -1;
    let x1 = -1;
    for (let x = 0; x < W; x++) {
      if (!sheet.has(x, y)) continue;
      if (x0 < 0) x0 = x;
      x1 = x;
      if (hash(x, Math.floor((y + (x % 3)) / 3), seed) < 0.3) sheet.mark(x, y, ramp[1]);
    }
    if (x0 < 0) continue;
    const z0 = sheet.z[y * W + x0];
    const z1 = sheet.z[y * W + x1];
    if (hash(x0, y, seed + 1) < 0.4) extra.push([x0 - 1, y + 1, ramp[2], z0], [x0 - 2, y + 2, ramp[1], z0]);
    if (hash(x1, y, seed + 2) < 0.4) extra.push([x1 + 1, y + 1, ramp[1], z1], [x1 + 2, y + 2, ramp[1], z1]);
  }
  for (const [x, y, col, z] of extra) sheet.put(x, y, col, Number.isNaN(z) ? sheet.near : z);
}

export const _unused = { Stage: null as unknown as Stage };

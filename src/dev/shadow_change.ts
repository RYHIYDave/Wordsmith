// THE CHANGE INTO THE LIVING SHADOW (the queue's finish-mage-and-warlock-eight-sides, 12 Nov 2026;
// docs/mockups/warlock_up2/README.md, "The change into it"). A MOCK-UP; NOTHING OF THE GAME IMPORTS IT.
//
// The game's change into its demon, as he asked for it (dev/warlock_change.ts; his words, 26 Oct: “I’d like a little bit of an
// actual transition from one to the other.  Not just a smoke cloud obscuring the change.”), is kept as it is, its every time:
// tapped, he jolts and the pain doubles him over; then HE BECOMES IT in front of you, his bones growing into its, his coat,
// hood and boots torn away a piece at a time in puffs of smoke, the embers whirling up round him. What is new is only what he
// becomes: THE LIVING SHADOW (his pick, 11 Nov), UP ON TWO LEGS at the end of it (his word, 11 Nov, asked of the change among
// its other moves: “Yes, all on two legs (Recommended)”), and then ITS ROAR, the one he said yes to (dev/shadow_moves.ts
// shadowRoarMove; 12 Nov, “Yes, that's it (Recommended)”), which begins in that very stance.
//
// HOW IT GROWS OUT OF HIM, on the same bones, in one sculpture with him (as the game's demon does, dev/sculpt_demon_rig.ts
// demonInto): its black spreading over him from his demon arm, a ragged edge of his cyan running before it; its claws first,
// out of his hands; its body swelling out of his; its horns through his hood; its head as his hood tears; the embers down its
// back; its tail; and last its wings out of his back. Each part appears at its moment already a little grown and grows to
// its size (`SHADOW_GROWTH`); what grows out from a root (a talon, a horn, a fang, a finger of a wing, its tail) grows out
// from that root, longer as it grows.

import { CYAN } from '../art/kit';
import { add, mul, solve, sub } from '../art/skeleton';
import type { Bones, Build, Posed, V3 } from '../art/skeleton';
import type { GameView, PaintView } from '../art/skin';
import { Px } from '../engine/px';
import type { Drawn, Hit, Prim } from './sculpt';
import { ARM_FIRE, WARLOCK_SCULPT_BODY, drawWarlockSculpt, noise2, warlockSculpt } from './sculpt_warlock';
import { MORPH_AT, MORPH_LONG, ROAR_AT, becoming, buildBetween, handsFromShoulders, poseBetween, tearsAt, untilK } from './warlock_change';
import { warlockPose, withWarlockAt } from './warlock_moves';
import type { WarlockMove } from './warlock_moves';
import { warlockSpells } from './warlock_spells';
import { CHANGE_SCENE, morphLight } from './warlock_fx';
import type { TornAt } from './warlock_fx';
import { DEMON_UP, WOLF_B } from './demon_new';
import type { Kit } from './demon_new';
import { shadowInto } from './demon_ideas';
import { shadowOthers } from './shadow_moves';
import type { ShadowMove } from './shadow_moves';
import { SLASH_SCENE, roarScene } from './shadow_fx';

/** How long the whole change is: his, then its roar (the game's change roars 1.4 s; the Living Shadow's roar is 42 frames). */
export const SHADOW_CHANGE_ALL = ROAR_AT + 42 / 30;

const ease = (u: number): number => {
  const c = Math.max(0, Math.min(1, u));
  return c * c * c * (c * (c * 6 - 15) + 10);
};
const span = (k: number, a: number, b: number): number => ease((k - a) / (b - a));
const lerp = (a: number, b: number, k: number): number => a + (b - a) * k;

/**
 * WHEN EACH PART OF IT GROWS, as a share of the change (as the game's demon's, dev/warlock_change.ts growthAt): it appears
 * at `start` already `from` of its size, and is whole by `end`.
 */
export const SHADOW_GROWTH = {
  hands: { start: 0.06, end: 0.5, from: 0.6 },
  body: { start: 0.04, end: 0.7, from: 0.45 },
  horns: { start: 0.16, end: 0.7, from: 0.2 },
  head: { start: 0.4, end: 0.75, from: 0.75 },
  embers: { start: 0.35, end: 0.8, from: 0.5 },
  feet: { start: 0.55, end: 0.85, from: 0.4 },
  tail: { start: 0.4, end: 0.85, from: 0 },
  wings: { start: 0.45, end: 0.85, from: 0.3 },
} as const;
type Part = keyof typeof SHADOW_GROWTH;
function grownAt(part: Part, k: number): number {
  const g = SHADOW_GROWTH[part];
  return k < g.start ? 0 : lerp(g.from, 1, span(k, g.start, g.end));
}
const HAND = new Set(['claw', 'finger', 'thumb', 'palm']);
const HEAD = new Set(['skull', 'jaw', 'neck', 'eye', 'fang', 'throat']);
const FOOT = new Set(['cannon', 'paw', 'claw', 'spur']);
/** Which part of it a solid is (dev/demon_ideas.ts shadowInto: its pieces and tags). */
function partOf(p: Prim): Part {
  const t = p.tag ?? '';
  if (p.piece === 'wingL' || p.piece === 'wingR') return 'wings';
  if ((p.piece === 'armL' || p.piece === 'armR') && HAND.has(t)) return 'hands';
  if (t === 'horn') return 'horns';
  if (p.piece === 'head' || p.piece === 'grin' || HEAD.has(t)) return 'head';
  if (p.piece === 'embers') return 'embers';
  if (t === 'tail') return 'tail';
  if ((p.piece === 'legL' || p.piece === 'legR') && FOOT.has(t)) return 'feet';
  return 'body';
}
/** Grows out from its root (its first point), longer as it grows, rather than swelling where it is. */
const FROM_ROOT = new Set(['claw', 'finger', 'thumb', 'horn', 'fang', 'spur', 'wingarm']);

/** A solid made `g` of its size: swollen where it is, or grown out from its root. */
function grow(p: Prim, g: number): void {
  const q = p as unknown as Record<string, unknown>;
  q.blend = (p.blend ?? 1) * g;
  if (p.k === 'ell' || p.k === 'box') {
    q.axes = p.axes.map((a) => mul(a, g));
    if (p.k === 'box') q.round = p.round * g;
  } else if (p.k === 'cone') {
    if (FROM_ROOT.has(p.tag ?? '')) {
      q.b = add(p.a, mul(sub(p.b, p.a), g));
      const r = 0.5 + 0.5 * g;
      q.ra = p.ra * r;
      q.rb = p.rb * r;
    } else {
      q.ra = p.ra * g;
      q.rb = p.rb * g;
    }
  } else if (p.k === 'tri') {
    // (a wing's skin, its first point at its wrist: drawn out from there as the wing grows)
    q.b = add(p.a, mul(sub(p.b, p.a), g));
    q.c = add(p.a, mul(sub(p.c, p.a), g));
  }
}

/** Its own hide, as it spreads over him (dev/demon_ideas.ts shadowInto: black all through). */
const SHADOW_HIDE = ['#04040a', '#07070f', '#0c0c1a', '#15152c', '#222244'];

/**
 * HIS BONES AT A MOMENT OF THE CHANGE INTO IT (seconds from his being tapped): his build grown into its werewolf's frame (WOLF_B),
 * his pose into its stance up on two legs (DEMON_UP), heaving as he changes; and how far he has become it. Whole, it is its
 * stance exactly.
 */
export function shadowChangeRig(change: WarlockMove, t: number): { B: Build; q: Posed; k: number } {
  const k = becoming(t);
  const WB = WARLOCK_SCULPT_BODY;
  const manQ = warlockPose(change.motion, Math.min(t, MORPH_AT));
  if (k <= 0) return { B: WB, q: manQ, k };
  if (k >= 1) return { B: WOLF_B, q: DEMON_UP as Posed, k };
  const it = DEMON_UP as unknown as Record<string, unknown>;
  const mid = poseBetween(handsFromShoulders(WB, manQ), handsFromShoulders(WOLF_B, DEMON_UP), k) as unknown as Record<string, unknown>;
  // (its elbows as its own only once it is more it than him: before, the solver finds his)
  for (const key of ['le', 're']) {
    if (k < 0.5) delete mid[key];
    else if (it[key] !== undefined) mid[key] = it[key];
  }
  {
    const a = (manQ as unknown as Record<string, number>).faceTurn ?? 0;
    const b = (it.faceTurn as number | undefined) ?? 0;
    mid.faceTurn = lerp(a, b, span(k, 0, 0.25));
  }
  // (HEAVING as he changes, as in the game's: his back bowing and his shoulders jerking up, strongest half way)
  const heave = Math.sin(Math.PI * k);
  const ph = (t - MORPH_AT) * Math.PI * 2 * 3.2;
  mid.bend = ((mid.bend as number) ?? 0) + 5 * heave * Math.sin(ph);
  mid.shrug = ((mid.shrug as number) ?? 0) + 0.25 * heave * Math.max(0, Math.sin(ph + 1.2));
  return { B: buildBetween(WB, WOLF_B, k), q: mid as unknown as Posed, k };
}

let REST: ReturnType<typeof solve> | undefined;
let ROAR: ShadowMove | undefined;
/** The change's own move of his (dev/warlock_spells.ts: tapped, he jolts and doubles over). */
function changeMove(): WarlockMove {
  const change = warlockSpells().find((m) => m.name.startsWith('Tapped'));
  if (!change) throw new Error('no change');
  return change;
}

/** HIM BECOMING IT at a moment (seconds from his being tapped, before it roars), on the change's scene: the picture, the pieces of him torn away so far and when, where his heart is, and how far he has become it. */
export function shadowChangeFrame(view: GameView, t: number, turn = 0): { d: Drawn; torn: TornAt[]; heart: V3; k: number } {
  const change = changeMove();
  return withWarlockAt(change, Math.min(t, MORPH_AT), turn, () => becomingIt(change, view, t, turn));
}
function becomingIt(change: WarlockMove, view: GameView, t: number, turn: number): { d: Drawn; torn: TornAt[]; heart: V3; k: number } {
  const { B, q, k } = shadowChangeRig(change, t);
  const m = warlockSculpt(view, undefined, turn, { B, q });
  const s = m.s;
  // ITS BLACK SPREADING OVER HIM from his demon arm, a ragged edge of his cyan running before it (as in the game's change,
  // in its own black: his skin and his arm's red gone its black where it has reached; the cracks of light in his arm kept)
  if (k > 0) {
    const reach = 66 * span(k, 0, 0.55);
    const ab = sub(s.handL, s.shoulderL);
    const ab2 = ab[0] * ab[0] + ab[1] * ab[1] + ab[2] * ab[2];
    const fromArm = (p: V3): number => {
      const ap = sub(p, s.shoulderL);
      const u = Math.max(0, Math.min(1, (ap[0] * ab[0] + ap[1] * ab[1] + ap[2] * ab[2]) / ab2));
      return Math.hypot(ap[0] - ab[0] * u, ap[1] - ab[1] * u, ap[2] - ab[2] * u);
    };
    const lit = new Set<string>([...CYAN, '#ffffff']);
    for (const mi of [0, 7]) {
      const mat = m.sc.mats[mi];
      const was = mat.paint;
      mat.paint = (h: Hit): string | null => {
        const own = was ? was(h) : null;
        if (own && lit.has(own)) return own;
        const edge = reach - 3 + (noise2(h.p[0] * 0.35 + h.p[2] * 0.2 + 5, h.p[1] * 0.35 + h.p[2] * 0.15) - 0.5) * 7;
        const d = fromArm(h.p);
        const tone = Math.max(0, Math.min(4, h.tone));
        if (d < edge) return SHADOW_HIDE[tone];
        if (d < edge + 1.6 && reach < 60) return tone >= 2 ? CYAN[3] : CYAN[2];
        return own;
      };
    }
  }
  // (the pieces of him torn away by now, as in the game's change: those that go in a puff of smoke, where and when)
  const torn: TornAt[] = [];
  const counts = new Map<number, number>();
  const kept = m.sc.prims.filter((p) => {
    const n = counts.get(p.mat) ?? 0;
    counts.set(p.mat, n + 1);
    const [at, puff] = tearsAt(p.mat, p.piece, p.tag, n);
    if (k < at) return true;
    if (puff && !p.carve) torn.push({ at: m.sc.at(p.k === 'cone' ? p.a : p.c), t: MORPH_AT + MORPH_LONG * untilK(at) });
    return false;
  });
  m.sc.prims.splice(0, m.sc.prims.length, ...kept);
  // THE LIVING SHADOW GROWN OUT OF HIM, on the same bones, in the same sculpture: each part as grown as the change has it
  if (k > 0) {
    const pv: PaintView = m.pv as PaintView;
    const a = (turn * Math.PI) / 180;
    const nearOf = (p: V3): number => {
      const x = p[0] * Math.cos(a) - p[1] * Math.sin(a);
      const y = p[0] * Math.sin(a) + p[1] * Math.cos(a);
      return pv === 'front' ? 0.612 * (x - y) + 0.5 * p[2] : 0.612 * (-x - y) + 0.5 * p[2];
    };
    const farL = nearOf(add(s.pelvis, [0, 20, 6])) < nearOf(s.pelvis);
    const kit: Kit = { sc: m.sc, s, far: (piece) => (piece.endsWith('L') ? farL : piece.endsWith('R') ? !farL : false), tail: 0.25, paws: false, rest: (REST ??= solve(WOLF_B, DEMON_UP as Posed)) };
    const n0 = m.sc.prims.length;
    const k0 = m.sc.marks.length;
    shadowInto(kit);
    const mine = m.sc.prims.splice(n0);
    const out: Prim[] = [];
    // ITS WINGS unfold out of his back: every point of a wing drawn in toward where it joins its back, as far as it is grown
    const roots = new Map<string, V3>();
    for (const p of mine) if ((p.piece === 'wingL' || p.piece === 'wingR') && p.k === 'cone' && p.tag === 'wingarm' && !roots.has(p.piece)) roots.set(p.piece, p.a);
    const gw = grownAt('wings', k);
    // (WHAT GROWS OUT FROM A ROOT grows out as one: a horn, a talon, a finger, its tail are each a run of pieces end to end,
    // and the run grows from its first root, so many of its pieces whole and the next part grown; never each piece from its
    // own root, which left them hung apart along where the whole would be)
    const chained = (p: Prim): boolean => p.k === 'cone' && (FROM_ROOT.has(p.tag ?? '') || p.tag === 'tail');
    for (let i = 0; i < mine.length; ) {
      const p = mine[i];
      const part = partOf(p);
      const g = part === 'wings' ? gw : grownAt(part, k);
      if (part === 'wings') {
        i++;
        if (g <= 0.001) continue;
        const R = roots.get(p.piece);
        if (R && g < 1) {
          const q = p as unknown as Record<string, unknown>;
          const at = (v: V3): V3 => add(R, mul(sub(v, R), g));
          if (p.k === 'cone') {
            q.a = at(p.a);
            q.b = at(p.b);
            q.ra = p.ra * Math.max(0.45, g);
            q.rb = p.rb * Math.max(0.45, g);
          } else if (p.k === 'tri') {
            q.a = at(p.a);
            q.b = at(p.b);
            q.c = at(p.c);
          } else if (p.k === 'ell' || p.k === 'box') {
            q.c = at(p.c);
            q.axes = p.axes.map((x) => mul(x, g));
          }
        }
        out.push(p);
        continue;
      }
      if (chained(p)) {
        const run: Prim[] = [p];
        let j = i + 1;
        while (j < mine.length) {
          const a = mine[j];
          const last = run[run.length - 1];
          if (a.k !== 'cone' || last.k !== 'cone' || a.piece !== p.piece || a.tag !== p.tag || Math.hypot(a.a[0] - last.b[0], a.a[1] - last.b[1], a.a[2] - last.b[2]) > 1e-6) break;
          run.push(a);
          j++;
        }
        i = j;
        if (g <= 0.001) continue;
        const r = p.tag === 'tail' ? 1 : 0.5 + 0.5 * g;
        run.forEach((c, n) => {
          if (c.k !== 'cone') return;
          const f = Math.max(0, Math.min(1, g * run.length - n));
          if (f <= 0.001) return;
          const q = c as unknown as Record<string, unknown>;
          if (f < 1) q.b = add(c.a, mul(sub(c.b, c.a), f));
          if (r < 1) {
            q.ra = c.ra * r;
            q.rb = c.rb * r;
          }
          out.push(c);
        });
        continue;
      }
      i++;
      if (g <= 0.001) continue;
      if (g < 1) grow(p, g);
      out.push(p);
    }
    m.sc.prims.push(...out);
    // (its eyes' glints only once its head has come)
    if (grownAt('head', k) <= 0) m.sc.marks.splice(k0);
  }
  // (the fire in his claws dying as he changes, and the blaze on his arm, as in the game's change)
  ARM_FIRE.size *= 1 - span(k, 0, 0.3);
  ARM_FIRE.blaze *= 1 - span(k, 0, 0.25);
  ARM_FIRE.t = t;
  ARM_FIRE.seed = 1 + t * 9;
  const d = drawWarlockSculpt(m, undefined, CHANGE_SCENE);
  const heart = m.sc.at([(s.pelvis[0] + s.neck[0]) / 2, (s.pelvis[1] + s.neck[1]) / 2, (s.pelvis[2] + s.neck[2]) / 2]);
  return { d, torn, heart, k };
}

/** Its roar as he said yes to it (dev/shadow_moves.ts shadowRoarMove), which the change ends in. */
export function shadowChangeRoar(): ShadowMove {
  return (ROAR ??= shadowOthers().find((m) => /roar/i.test(m.name)) ?? shadowOthers()[2]);
}

/**
 * THE CHANGE AS SEEN, at a moment (seconds from his being tapped), on the slash's scene (dev/shadow_fx.ts SLASH_SCENE, as its
 * other moves are shown): him becoming it, the puffs of smoke where each piece of him tore away and the embers whirling round
 * him (dev/warlock_fx.ts morphLight, as the game's change has them); then its roar, rings, lines and all (roarScene).
 */
export function shadowChangeScene(view: GameView, t: number, turn = 0): Px {
  if (t >= ROAR_AT) return roarScene(shadowChangeRoar(), t - ROAR_AT, view, turn);
  const { d, torn, heart, k } = shadowChangeFrame(view, t, turn);
  const out = new Px(SLASH_SCENE.w, SLASH_SCENE.h);
  const dx = SLASH_SCENE.ax - CHANGE_SCENE.ax;
  const dy = SLASH_SCENE.ay - CHANGE_SCENE.ay;
  const put = (px: Px): void => {
    for (let y = 0; y < px.h; y++) {
      for (let x = 0; x < px.w; x++) {
        const i = (y * px.w + x) * 4;
        const al = px.d[i + 3];
        if (al === 0) continue;
        const sx = x + dx;
        const sy = y + dy;
        if (sx < 0 || sy < 0 || sx >= out.w || sy >= out.h) continue;
        const j = (sy * out.w + sx) * 4;
        const a = al / 255;
        const b = out.d[j + 3] / 255;
        const o = a + b * (1 - a);
        for (let c = 0; c < 3; c++) out.d[j + c] = Math.round((px.d[i + c] * a + out.d[j + c] * b * (1 - a)) / Math.max(o, 1e-6));
        out.d[j + 3] = Math.round(o * 255);
      }
    }
  };
  put(d.px);
  put(morphLight(torn, t, Math.sin(Math.PI * k), heart, Infinity, view));
  return out;
}

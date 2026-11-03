// THE RAT KING'S NEW MOVES AS THE REVIEW SEES THEM (docs/mockups/action_f12_ratking): he is not on the heroes' bones, so the review
// for the old rigs (art/action_f1_checks.ts checkKit, as the Hollow Stag's in tests/stag_action_shapes.ts): the King's head and the
// knot of tails (his hips) followed, and the heads of the front rat and the one at the heap's back; the end each move strikes with
// (art/ratking_action.ts tipOf); a pair of one rat's feet as his soles (`PAIRS`: the front rat's forefeet and hind feet, the two
// beside it, the one at the back), down where they stand on the floor; frame by frame, in game pixels, both ways round. A rat gone
// into the cracks is followed no further. With them, the review's run over every new move (`review`) and the whole-figure checks the
// game's own test of him makes (`whole`: FLOOR, SLIDE on every rat's every foot, JUMP from his stand and back). His roll (2 Nov) as it is
// seen: where the game has carried him down his lane (`pose9World`), handing back to his stand where he stopped (`shift`). Here and not in the art files: the game's own tests keep figures from importing the checks.

import { checkKit } from '../src/art/action_f1_checks';
import type { KitFrame, KitMove } from '../src/art/action_f1_checks';
import type { V } from '../src/art/kit';
import { RK_STAND, headOf, ratKingPose } from '../src/art/rat_king';
import type { KingPose } from '../src/art/rat_king';
import { HITS9, LONG9, MOVES9, STRIKES9, pose9, pose9World, roll9Along, smeared9, solids9, tipOf } from '../src/art/ratking_action';
import { TILE3 } from '../src/art/new_mobs3';
import type { Move9 } from '../src/art/ratking_action';
import { stage } from '../src/art/skin';
import type { GameView } from '../src/art/skin';
import type { V3 } from '../src/art/skeleton';

/** The pairs of feet taken as his soles: [rat, first foot]: forefeet 0 and 1, hind feet 2 and 3. */
export const PAIRS: readonly (readonly [number, number])[] = [[0, 0], [0, 2], [1, 0], [6, 0], [3, 0], [4, 2]];
function seenAt(view: GameView): (p: V3) => V {
  const st = stage(view, 0, 0, { w: 8, h: 8 });
  return (p) => {
    const [x, y] = st.at(p);
    return [x / 2, y / 2];
  };
}
function kitFrame(at: (p: V3) => V, K: KingPose, t: number, pair: readonly [number, number], tip: V3 | null, smeared: boolean): KitFrame {
  const pts: Record<string, V> = { hips: at(K.knot) };
  if (K.rats[10].gone < 0.5) pts.head = at(headOf(K.rats[10]).at);
  if (K.rats[0].gone < 0.5) pts.front = at(headOf(K.rats[0]).at);
  if (K.rats[3].gone < 0.5) pts.rear = at(headOf(K.rats[3]).at);
  const r = K.rats[pair[0]];
  const feet = [r.feet[pair[1]], r.feet[pair[1] + 1]];
  return {
    t,
    pts,
    soles: [at(feet[0]), at(feet[1])],
    down: [feet[0][2] < 0.005, feet[1][2] < 0.005],
    heights: [feet[0][2] / 2, feet[1][2] / 2],
    tip: tip ? at(tip) : null,
    smeared,
  };
}
/** His stand (the game's own), as the review reads it. */
export function standKit(view: GameView, pair: readonly [number, number]): KitMove {
  const at = seenAt(view);
  const frames: KitFrame[] = [];
  for (let i = 0; i < RK_STAND.frames; i++) {
    const t = i / RK_STAND.fps;
    frames.push(kitFrame(at, ratKingPose('stand', t), t, pair, null, false));
  }
  return { name: 'stand', frames, round: true };
}
/** One of his new moves as the review reads it, every frame at 30 a second: his roll where the game has carried him (his floor point moved down his lane, `roll9Along`), as it is seen. */
export function kingKit(view: GameView, which: Move9, pair: readonly [number, number]): KitMove {
  const at = seenAt(view);
  const n = Math.round(LONG9[which] * 30) + 1;
  const frames: KitFrame[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / 30;
    const K = pose9World(which, t);
    frames.push(kitFrame(at, K, t, pair, tipOf(which, K), smeared9(which, t)));
  }
  const name = which === 'attack' ? 'bite' : which;
  if (which !== 'roll') return { name, frames, hit: HITS9[which], strike: STRIKES9[which] };
  const o = at([0, 0, 0]);
  const e = at([roll9Along(LONG9.roll) * TILE3, 0, 0]);
  return { name, frames, hit: HITS9[which], strike: STRIKES9[which], shift: [e[0] - o[0], e[1] - o[1]] };
}

/** THE REVIEW for the old rigs over every new move, both ways round, each pair of feet as his soles: its findings. */
export function review(): string[] {
  const said: string[] = [];
  for (const v of ['front', 'back'] as const) {
    for (const pair of PAIRS) {
      const stand = standKit(v, pair);
      for (const m of MOVES9) {
        for (const f of checkKit(kingKit(v, m, pair), stand)) {
          // (unknotting hands over to the swarm and the knot, not to his stand: they are gone into the cracks at its end)
          if (m === 'unknot' && f.move === 'unknot > stand') continue;
          said.push(`${v} ${f.move} (rat ${pair[0]} feet ${pair[1]}): ${f.kind} ${f.what}, ${f.by.toFixed(1)} at ${f.t.toFixed(2)} s`);
        }
      }
    }
  }
  return said;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function bottomOf(sh: any): number {
  if (sh.k === 'rod') return Math.min(sh.a[2] - sh.ra, sh.b[2] - sh.rb);
  if (sh.k === 'ball') return sh.c[2] - Math.hypot(sh.ax[0][2], sh.ax[1][2], sh.ax[2][2]);
  if (sh.k === 'band') return sh.ring.c[2] - Math.hypot(sh.ring.u[2], sh.ring.v[2]);
  return Infinity;
}
/** FLOOR, SLIDE and JUMP on the whole of him. */
export function whole(): string[] {
  const said: string[] = [];
  for (const m of MOVES9) {
    const n = Math.round(LONG9[m] * 30);
    for (const view of ['front', 'back'] as const) {
      let low = Infinity;
      let what = '';
      for (let i = 0; i <= n; i++) for (const b of solids9(m, i / 30, view).bits) {
        const z = bottomOf(b.shape);
        if (z < low) {
          low = z;
          what = `${b.part}/${b.piece} at ${(i / 30).toFixed(2)}`;
        }
      }
      if (low < -0.5) said.push(`${m} ${view}: FLOOR ${low.toFixed(2)} (${what})`);
    }
    const dt = 1 / 600;
    let worst = 0;
    let at = '';
    // (where the game has carried him: a foot down must not slide over the floor as he goes)
    for (let t = 0; t + dt <= LONG9[m]; t += dt) {
      const a = pose9World(m, t).rats;
      const b = pose9World(m, t + dt).rats;
      a.forEach((r, i) => r.feet.forEach((p, k) => {
        const q = b[i].feet[k];
        if (p[2] < 1e-6 && q[2] < 1e-6) {
          const d = Math.hypot(q[0] - p[0], q[1] - p[1]);
          if (d > worst) {
            worst = d;
            at = `rat ${i} foot ${k} at ${t.toFixed(4)}`;
          }
        }
      }));
    }
    if (worst > 1e-6) said.push(`${m}: SLIDE ${worst.toFixed(4)} (${at})`);
  }
  for (const view of ['front', 'back'] as const) {
    const st = stage(view, 0, 0, { w: 2, h: 2 });
    const pts = (K: ReturnType<typeof ratKingPose>): number[][] => [...K.rats.map((r) => st.at(r.c) as unknown as number[]), st.at(K.knot) as unknown as number[]];
    const leap = (a: number[][], b: number[][]): number => a.reduce((s, p, i) => s + Math.hypot(p[0] - b[i][0], p[1] - b[i][1]), 0) / a.length / 2;
    const stands = Array.from({ length: 45 }, (_, i) => pts(ratKingPose('stand', i / 15)));
    for (const m of MOVES9) {
      const first = pts(pose9(m, 0));
      const worst = Math.max(...stands.map((s) => leap(s, first)));
      if (worst > 3) said.push(`${view} stand > ${m}: JUMP ${worst.toFixed(2)}`);
      if (m !== 'unknot') {
        const back = leap(pts(pose9(m, LONG9[m])), stands[0]);
        if (back > 3) said.push(`${view} ${m} > stand: JUMP ${back.toFixed(2)}`);
      }
    }
  }
  return said;
}

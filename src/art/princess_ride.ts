// THE PRINCESS ON HER SPECTRAL STEED (her ultimate): her, on the heroes' bones (art/princess.ts), seated side-saddle on
// the steed (art/spectral_steed.ts), painted together on one stage. A MOCK-UP, behind PRINCESS_ON (off); nothing of the
// game imports it.

import type { Painted } from './kit';
import { ENEMY_RIM } from './mkit';
import { momentOf, paintBits } from './new_mobs3';
import type { Bit, Mob, MobMove, Put } from './new_mobs3';
import { PRINCESS_BODY, PRINCESS_REST, princessPainter } from './princess';
import { PRINCESS } from './princess_moves';
import { stage } from './skin';
import type { GameView } from './skin';
import { add, mul, norm, solve, standing } from './skeleton';
import type { Bones, Skeleton, V3 } from './skeleton';
import { seatOf, steedBits, steedGrains, thinSteed } from './spectral_steed';
import type { SteedPose } from './spectral_steed';

const B = PRINCESS_BODY;
/** The picture of her riding: room for the steed's leap and her lash. */
export const RIDE_CANVAS = { w: 440, h: 380, ax: 210, ay: 300 } as const;

/** Her pelvis's height standing, as the bones have it (her seat is set from it). */
const PELVIS0 = solve(B, { ...standing(B) } as never).pelvis[2];

/** HER SEATED SIDE-SADDLE on the steed: her hips on its back, facing its way, her body turned a little to its left; both her legs down its left flank, the knees bent; her left hand on her vine reins at its withers; her right hand raised high with her lash. */
export function riderPose(P: SteedPose, lift = 0): Partial<Bones> {
  const seat = seatOf(P);
  const at = add(seat.at, mul(seat.u, 3.2 + lift));
  const foot = (fwd: number, out: number, down: number): V3 => add(add(add(seat.at, mul(seat.f, fwd)), mul(seat.l, out)), [0, 0, -down]);
  const fl = foot(7, 12.5, 18);
  const frt = foot(4.5, 11, 20);
  const rein = add(add(add(seat.at, mul(seat.f, 11)), mul(seat.l, 2.5)), mul(seat.u, 7));
  return {
    ...PRINCESS_REST,
    px: at[0], py: at[1], pz: at[2] - PELVIS0,
    yaw: P.yaw + 6, pitch: -P.pitch * 0.6 - 4, roll: 0, twist: 10, bend: 2, side: -2,
    faceTurn: P.yaw + 8, faceUp: 4, faceTilt: 4,
    lfx: fl[0], lfy: fl[1] - B.stance, lfz: fl[2] - B.ankle, lfp: 30, lft: 30, lk: 40, lkUp: 20,
    rfx: frt[0], rfy: frt[1] + B.stance, rfz: frt[2] - B.ankle, rfp: 34, rft: 40, rk: 50, rkUp: 20,
    lhIn: 2, lhx: rein[0], lhy: rein[1], lhz: rein[2], le: -20,
    rhIn: 1, rhx: 2, rhy: -5, rhz: 13, re: 30,
  } as Partial<Bones>;
}
/** Her lash flourished over her head as she rides: from her right hand up and back, curling. */
function flourish(s: Skeleton, t: number): V3[] {
  const pts: V3[] = [s.handR];
  const back = norm([-1, -0.3, 0.4]);
  for (let i = 1; i <= 12; i++) {
    const k = i / 12;
    const curl = Math.sin(k * Math.PI * 1.6 + t * 4) * 6 * k;
    pts.push(add(s.handR, [back[0] * 30 * k, back[1] * 30 * k + curl * 0.6, 10 * Math.sin(Math.PI * k) + back[2] * 10 * k - 18 * k * k + curl * 0.5]));
  }
  return pts;
}
const riderPaint = princessPainter({ vine: (m) => flourish(m.s, m.t) });

/** ONE PICTURE OF HER RIDING: the steed posed `P`, she seated on it, `t` seconds in (for what churns and sways). */
export function ridePainted(P: SteedPose, t: number, view: GameView = 'front'): Painted {
  const st = stage(view === 'back' ? 'rear' : view, RIDE_CANVAS.ax, RIDE_CANVAS.ay, RIDE_CANVAS);
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => bits.push({ part, piece, shape });
  // (which side of it is toward the eye)
  const near = st.near(add(seatOf(P).at, [0, 3, 0])) > st.near(add(seatOf(P).at, [0, -3, 0])) ? 1 : -1;
  steedBits(P, put, near);
  const steedParts = new Set(bits.map((b) => b.part)).size;
  const mv: MobMove = { name: 'The Princess rides', motion: { keys: [{ at: 0, pose: riderPose(P) }, { at: 1, pose: riderPose(P) }] }, rest: PRINCESS_REST };
  const m = momentOf(PRINCESS as Mob, mv, Math.min(0.99, t % 1));
  m.t = t;
  bits.push(...riderPaint.bits(st, m));
  const lights = paintBits(st, bits, seatOf(P).at);
  let ids: Int16Array | null = null;
  (globalThis as { __partsSeen?: (ids: Int16Array) => void }).__partsSeen = (x) => {
    ids = x.slice();
  };
  const px = st.whole(ENEMY_RIM);
  (globalThis as { __partsSeen?: unknown }).__partsSeen = undefined;
  const seen = ids as Int16Array | null;
  if (seen) thinSteed(px, st, P, (k) => seen[k] >= 0 && seen[k] < steedParts);
  for (const [p, c, size] of steedGrains(P, t, [-1, 0, 0])) {
    const [x, y] = st.at(p);
    const xi = Math.round(x - size / 2);
    const yi = Math.round(y - size / 2);
    for (let dy = 0; dy < size; dy++) for (let dx = 0; dx < size; dx++) if (xi + dx >= 0 && yi + dy >= 0 && xi + dx < px.w && yi + dy < px.h) px.set(xi + dx, yi + dy, c);
  }
  return { px, lights };
}

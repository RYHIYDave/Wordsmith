// THE MOTH AS THE BOSS REVIEW SEES IT (art/boss_checks.ts): its outside as solids, its six legs (its "arms"), its six
// feet (what grips the top), its four wings and its antennae (what it must never pass through itself), the points of it
// the review follows, and how its moves hand over. Here and not in src/art/moth_moves.ts: the game's own tests keep
// figures from importing the checks (tests/bosses.test.ts, 12), as the Carrion Queen's are kept (tests/carrion_queen_shape.ts).

import type { BossShape, CheckArm, CheckLimb, CheckLump, CheckThing, Handover } from '../src/art/boss_checks';
import { AB_R, AB_SEG, HEAD, THORAX, mothGeom, onWing, poseOf, wingRim } from '../src/art/moth';
import type { MothGeom } from '../src/art/moth';
import { MOTH, MOTH_BEAT, MOTH_STRIKES, smearedAt } from '../src/art/moth_moves';
import { cross, norm } from '../src/art/skeleton';
import type { Posed, Skeleton, V3 } from '../src/art/skeleton';

/** Its moves in the air, and on the book (its last phase). */
export const IN_AIR = ['attack', 'dust', 'eyes', 'swarm', 'reel'];
export const ON_BOOK = ['beat', 'perchReel'];

/** Its solids at a moment (`G`, from its geometry). */
export function mothSolids(G: MothGeom): { limbs: CheckLimb[]; lumps: CheckLump[] } {
  const lumps: CheckLump[] = [
    { name: 'thorax', c: G.TC, rot: [G.A, G.L, G.Dd], h: [THORAX[0] * 0.96, THORAX[1] * 0.96, THORAX[2] * 0.96] },
    { name: 'head', c: G.HC, rot: [G.hF, G.hL, G.hU], h: HEAD },
  ];
  G.ab.forEach((c, i) => {
    const dir = G.abDir[i];
    const side = norm(cross(dir, G.Dd), G.L);
    const up = norm(cross(side, dir), G.Dd);
    lumps.push({ name: `ab${i}`, c, rot: [dir, side, up], h: [AB_SEG * 0.8, AB_R[i] * 0.95, AB_R[i] * 0.86] });
  });
  const limbs: CheckLimb[] = [];
  G.legs.forEach((lg, i) => {
    const n = `${i < 3 ? 'L' : 'R'}${i % 3}`;
    limbs.push({ name: `femur${n}`, a: lg.coxa, b: lg.knee, r: 6.5 }, { name: `tibia${n}`, a: lg.knee, b: lg.ankle, r: 4 });
  });
  return { limbs, lumps };
}
/** Its legs as the review takes a figure's arms: from its thorax (the coxa), the knee, the ankle. */
function legsOf(G: MothGeom): CheckArm[] {
  return G.legs.map((lg, i) => ({ name: `${i < 3 ? 'L' : 'R'}${i % 3}`, sh: lg.coxa, el: lg.knee, hand: lg.ankle }));
}
/** Its wings' edges and leading edges, and its antennae: none of them through its body or its legs (each may touch where it grows from). */
function wingThings(G: MothGeom): CheckThing[] {
  const out: CheckThing[] = [];
  for (const w of G.wings) {
    const pts: V3[] = [];
    for (let k = 3; k <= 20; k++) pts.push(onWing(w, (k / 20) * w.len, -0.04 * w.len));
    for (const [x, y] of wingRim(w.hind, 22)) if (Math.hypot(x, y) > 0.25) pts.push(onWing(w, x * w.len, y * w.len));
    out.push({ name: `${w.hind ? 'hind' : 'fore'}wing${w.side === 1 ? 'L' : 'R'}`, pts, r: 1.5, may: ['thorax'] });
  }
  G.ant.forEach((pts, i) => out.push({ name: `antenna${i ? 'R' : 'L'}`, pts: pts.slice(2), r: 1.5, may: ['head'] }));
  return out;
}
/** The points of it the review follows: its head, thorax and abdomen's tip; its wings' tips; its antennae's tips; its forefeet. */
function followed(G: MothGeom): Record<string, V3> {
  const out: Record<string, V3> = { head: G.HC, chest: G.TC, abTip: G.abTip };
  for (const w of G.wings) {
    const k = `${w.hind ? 'hind' : 'apex'}${w.side === 1 ? 'L' : 'R'}`;
    out[k] = w.hind ? onWing(w, 0.92 * w.len, 0.36 * w.len) : onWing(w, 0.99 * w.len, 0.03 * w.len);
  }
  out.antL = G.ant[0][G.ant[0].length - 1];
  out.antR = G.ant[1][G.ant[1].length - 1];
  out.footL = G.legs[0].tarsus[5];
  out.footR = G.legs[3].tarsus[5];
  return out;
}
/** The moves that strike, by the end they strike with: its right forewing's apex. */
const STRIKERS = new Set(Object.keys(MOTH_STRIKES));

/**
 * HOW ITS MOVES HAND OVER (the game's to keep): its stand is one great slow beat, so THE GAME BEGINS EACH OF ITS MOVES IN
 * STEP, as its stand comes round to its first frame (the top of the beat), and each ends there; its drift and its stand
 * beat in step, frame for frame, so the game goes from one to the other at the same frame. On the book the same.
 */
export function mothHandovers(): Handover[] {
  const h: Handover[] = [];
  for (const m of [...IN_AIR, 'land']) h.push({ from: 'stand', at: 0, to: m, toAt: 0, phase: true });
  for (const m of IN_AIR) h.push({ from: m, at: 'end', to: 'stand', toAt: 0 });
  for (let i = 0; i <= MOTH_BEAT.frames; i++) {
    const t = i / MOTH_BEAT.fps;
    h.push({ from: 'stand', at: t, to: 'walk', toAt: t, phase: true }, { from: 'walk', at: t, to: 'stand', toAt: t });
  }
  h.push({ from: 'land', at: 'end', to: 'perch', toAt: 0 });
  for (const m of [...ON_BOOK, 'dying']) h.push({ from: 'perch', at: 0, to: m, toAt: 0 });
  for (const m of ON_BOOK) h.push({ from: m, at: 'end', to: 'perch', toAt: 0 });
  return h;
}

/** Its geometry from a moment's bones and pose (all of it is carried on them: art/moth.ts MothExtra). */
const geom = (s: Skeleton, q: Posed): MothGeom => mothGeom(s, poseOf(q));
export const MOTH_SHAPE: BossShape = {
  body: (s, q) => mothSolids(geom(s, q)),
  things: (_move, _t, s, q) => wingThings(geom(s, q)),
  tip: (move, _t, s, q) => (STRIKERS.has(move) ? followed(geom(s, q)).apexR : null),
  grips: (_move, _t, s, q) => geom(s, q).legs.map((lg, i) => ({ name: `foot${i}`, p: lg.tarsus[5] })),
  arms: (_move, _t, s, q) => legsOf(geom(s, q)),
  follow: (_move, _t, s, q) => followed(geom(s, q)),
  strikes: MOTH_STRIKES,
  smeared: smearedAt,
  handovers: mothHandovers(),
};
export { MOTH };

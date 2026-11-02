// THE PHYSICIAN'S MOVES DONE THE ACTION WAY (docs/mockups/action_f14_physician): a hash of every frame the game shows of the
// Physician (art/physician_moves.ts makePhysicianArt, as art/act1_figs/physician.ts hands it over), move by move, both ways round, and
// of what the game draws of his moves (art/physician_shots.ts, as render/act1_fx/physician.ts draws it, at a run of moments), so that
// what is added behind PHYSICIAN_ACTION is shown to change nothing, pixel for pixel. It imports only the game's own files (and the
// dev pages' stand-in canvas), so that it runs the same on the branch this one came from. Nothing of the game imports it.
//   npx tsx tools/physician_action_hash.ts [moves]
import { createHash } from 'node:crypto';
import { Px } from '../src/engine/px';
import { makePhysicianArt } from '../src/art/physician_moves';
import { drawCaneRap, drawDrawAim, drawHeldWord, drawHushCloud, drawPhialFlight, drawRoundsRing, drawWordFreed } from '../src/art/physician_shots';
import { PxCtx } from '../src/dev/action_f3_scene';
import { hashMoves, whole } from './action_f3_hash';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
/** What the game draws of his moves, at a run of moments, on a plain picture. */
export function shotsHash(): string {
  const h = createHash('sha256');
  const at = (x: number, y: number): [number, number] => [300 + 32 * (x - y), 200 + 16 * (x + y)];
  for (let t = 0; t <= 4.2; t += 0.1) {
    const p = new Px(640, 420);
    const g = new PxCtx(p, 1) as unknown as CanvasRenderingContext2D;
    drawCaneRap(g, at, 1, 0, t);
    drawDrawAim(g, at, 0, 0, 2, 0, Math.min(1, t), t);
    drawHeldWord(g, 300, 120, 'fire', t);
    drawWordFreed(g, 300, 120, 420, 260, 'frost', t);
    drawPhialFlight(g, at, 0, 0, 3, 1, t, 1.7);
    drawHushCloud(g, at, 3, -1, t, 2);
    drawRoundsRing(g, at, -2, 1, t);
    h.update(p.d);
  }
  return h.digest('hex').slice(0, 16);
}
/** The hashes of every frame the game shows of him, and of what it draws of his moves. */
export function physicianHashes(): { physician: string; shots: string; byMove: Record<string, string> } {
  const m = hashMoves(makePhysicianArt());
  const byMove = Object.fromEntries(Object.entries(m).map(([k, v]) => [k, `${v.length} ${createHash('sha256').update(v.join()).digest('hex').slice(0, 10)}`]));
  return { physician: whole(m), shots: shotsHash(), byMove };
}
if (process.argv[1]?.endsWith('physician_action_hash.ts')) {
  const h = physicianHashes();
  console.log(JSON.stringify(process.argv[2] === 'moves' ? h : { physician: h.physician, shots: h.shots }, null, 1));
}

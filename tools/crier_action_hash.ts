// THE CRIER'S MOVES DONE THE ACTION WAY (docs/mockups/action_f11_crier): a hash of every frame the game shows of the Crier
// (art/crier_moves.ts makeCrierArt, as art/act1_figs/crier.ts hands it over), move by move, both ways round, and of what the game
// draws of his moves on the floor (art/crier_shots.ts, as render/act1_fx/crier.ts draws it, at a run of moments), so that what is
// added behind CRIER_ACTION is shown to change nothing, pixel for pixel. It imports only the game's own files (and the dev pages'
// stand-in canvas), so that it runs the same on the branch this one came from. Nothing of the game imports it.
//   npx tsx tools/crier_action_hash.ts [moves]
import { createHash } from 'node:crypto';
import { Px } from '../src/engine/px';
import { makeCrierArt } from '../src/art/crier_moves';
import { drawBellSlam, drawCrowdBreath, drawCrowdCall, drawHushedRising, drawProclaimWarn, drawProclamation, drawShoutBlast, drawShoutWarn } from '../src/art/crier_shots';
import { PxCtx } from '../src/dev/action_f3_scene';
import { hashMoves, whole } from './action_f3_hash';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
/** What the game draws of his moves on the floor, at a run of moments, on a plain picture. */
export function shotsHash(): string {
  const h = createHash('sha256');
  const at = (x: number, y: number): [number, number] => [300 + 32 * (x - y), 200 + 16 * (x + y)];
  for (let t = 0; t <= 2.8; t += 0.1) {
    const p = new Px(640, 420);
    const g = new PxCtx(p, 1) as unknown as CanvasRenderingContext2D;
    drawBellSlam(g, at, 1, 0, t);
    drawShoutWarn(g, at, 0, 0, 1, 0, Math.min(1, t), t);
    drawShoutBlast(g, at, 0, 0, 1, 0, t);
    drawProclaimWarn(g, at, 0, 0, 0, 1, Math.min(1, t), t);
    drawProclamation(g, at, 0, 0, 0, 1, t);
    drawCrowdBreath(g, at, 0, 0, Math.min(1, t), t);
    drawCrowdCall(g, at, 0, 0, t);
    drawHushedRising(g, at, -3, 2, t);
    h.update(p.d);
  }
  return h.digest('hex').slice(0, 16);
}
/** The hashes of every frame the game shows of him, and of what it draws of his moves. */
export function crierHashes(): { crier: string; shots: string; byMove: Record<string, string> } {
  const m = hashMoves(makeCrierArt());
  const byMove = Object.fromEntries(Object.entries(m).map(([k, v]) => [k, `${v.length} ${createHash('sha256').update(v.join()).digest('hex').slice(0, 10)}`]));
  return { crier: whole(m), shots: shotsHash(), byMove };
}
if (process.argv[1]?.endsWith('crier_action_hash.ts')) {
  const h = crierHashes();
  console.log(JSON.stringify(process.argv[2] === 'moves' ? h : { crier: h.crier, shots: h.shots }, null, 1));
}

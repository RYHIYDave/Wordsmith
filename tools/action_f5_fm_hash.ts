// THE FLESHMANCER'S MOVES DONE THE ACTION WAY (docs/mockups/action_f5_fleshmancer): a hash of every frame the game shows of the
// Fleshmancer (art/fleshmancer.ts makeFleshmancerArt3), of the mini fleshmancer (art/cultists.ts makeMiniFleshmancerArt3), move by
// move, both ways round, and of the hands of his rings (makeRingHandArt), so that what is added behind FLESH_ACTION is shown to
// change nothing, pixel for pixel. It imports only the game's own files, so that it runs the same on the branch this one came
// from. Nothing of the game imports it.
//   npx tsx tools/action_f5_fm_hash.ts [moves]
import { createHash } from 'node:crypto';
import { Px } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import { FM_HAND_KINDS, makeFleshmancerArt3, makeRingHandArt } from '../src/art/fleshmancer';
import { makeMiniFleshmancerArt3 } from '../src/art/cultists';
import { hashMoves, whole } from './action_f3_hash';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
const frames = (list: Sprite[]): string[] =>
  list.map((sp) => {
    const p = sp.img as unknown as Px;
    return createHash('sha256').update(`${p.w}x${p.h}@${sp.ax},${sp.ay};`).update(p.d).update(JSON.stringify(sp.lights ?? [])).digest('hex').slice(0, 12);
  });
/** The hashes of every frame the game shows of him, of the mini fleshmancer and of his ring's hands. */
export function fmHashes(): { fleshmancer: string; mini: string; hands: string; byMove: Record<string, string> } {
  const m = hashMoves(makeFleshmancerArt3());
  const mini = hashMoves(makeMiniFleshmancerArt3());
  const hands: Record<string, string[]> = {};
  for (const v of ['front', 'back'] as const) for (let k = 0; k < FM_HAND_KINDS; k++) hands[`${v}:${k}`] = frames(makeRingHandArt(v, k));
  const byMove = Object.fromEntries(Object.entries(m).map(([k, v]) => [k, `${v.length} ${createHash('sha256').update(v.join()).digest('hex').slice(0, 10)}`]));
  return { fleshmancer: whole(m), mini: whole(mini), hands: whole(hands), byMove };
}
if (process.argv[1]?.endsWith('action_f5_fm_hash.ts')) {
  const h = fmHashes();
  const out: Record<string, unknown> = { fleshmancer: h.fleshmancer, mini: h.mini, hands: h.hands };
  if (process.argv[2] === 'moves') out['by move'] = h.byMove;
  console.log(JSON.stringify(out, null, 1));
}

// THE AMALGAMATION'S MOVES DONE THE ACTION WAY (docs/mockups/action_f4_amalgam): a hash of every frame the game shows of the
// Ossuary Amalgamation (art/bosses3.ts makeAmalgamArt3), move by move, both ways round, and of what it sends out (a skull of its
// swarm in flight, the arms of the dead out of the floor), so that what is added behind AMALGAM_ACTION is shown to change nothing,
// pixel for pixel. It imports only the game's own files, so that it runs the same on the branch this one came from. Nothing of
// the game imports it.
//   npx tsx tools/action_f4_amalgam_hash.ts [moves]
import { createHash } from 'node:crypto';
import { Px } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import { makeAmalgamArt3, makeFloorArmArt, makeSwarmSkullArt } from '../src/art/bosses3';
import { hashMoves, whole } from './action_f3_hash';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
const frames = (list: Sprite[]): string[] =>
  list.map((sp) => {
    const p = sp.img as unknown as Px;
    return createHash('sha256').update(`${p.w}x${p.h}@${sp.ax},${sp.ay};`).update(p.d).update(JSON.stringify(sp.lights ?? [])).digest('hex').slice(0, 12);
  });
if (process.argv[1]?.endsWith('action_f4_amalgam_hash.ts')) {
  const m = hashMoves(makeAmalgamArt3());
  const out: Record<string, unknown> = { amalgam: whole(m) };
  const sent: Record<string, string[]> = {};
  for (const v of ['front', 'back'] as const) {
    sent[`${v}:swarmSkull`] = frames(makeSwarmSkullArt(v));
    sent[`${v}:floorArms`] = frames(makeFloorArmArt(v));
  }
  out['what it sends out'] = whole(sent);
  if (process.argv[2] === 'moves') out['amalgam by move'] = Object.fromEntries(Object.entries(m).map(([k, v]) => [k, `${v.length} ${createHash('sha256').update(v.join()).digest('hex').slice(0, 10)}`]));
  console.log(JSON.stringify(out, null, 1));
}

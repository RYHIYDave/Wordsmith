// THE CARRION QUEEN'S MOVES DONE THE ACTION WAY (docs/mockups/action_f7_queen): a hash of every frame the game shows of the Carrion
// Queen (art/carrion_queen2_moves.ts makeQueen2Art, as art/act1_figs/queen.ts hands her over), move by move, both ways round, so that
// what is added behind QUEEN_ACTION is shown to change nothing, pixel for pixel. It imports only the game's own files, so that it runs
// the same on the branch this one came from. Nothing of the game imports it.
//   npx tsx tools/action_f7_queen_hash.ts [moves]
import { createHash } from 'node:crypto';
import { Px } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import type { ActorArt, AnimSet } from '../src/art/actor_types';
import { makeQueen2Art } from '../src/art/carrion_queen2_moves';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
function lists(s: AnimSet): [string, Sprite[]][] {
  const out: [string, Sprite[]][] = [['idle', s.idle], ['walk', s.walk], ['attack3', s.attack]];
  const c = s.clips;
  if (c) {
    for (const k of ['attack', 'heavy', 'die', 'reel'] as const) if (c[k]) out.push([k, c[k]!.frames]);
    for (const [k, v] of Object.entries(c.moves ?? {})) out.push([`moves.${k}`, v.frames]);
  }
  return out;
}
function frameHash(sp: Sprite): string {
  const p = sp.img as unknown as Px;
  return createHash('sha256').update(`${p.w}x${p.h}@${sp.ax},${sp.ay},${sp.density ?? 1};`).update(p.d).update(JSON.stringify(sp.lights ?? [])).update(JSON.stringify(sp.aura ?? null)).digest('hex').slice(0, 12);
}
/** Every frame of her, both ways round, by move. */
export function queenHashes(art: ActorArt = makeQueen2Art()): { whole: string; byMove: Record<string, string> } {
  const m: Record<string, string[]> = {};
  for (const [view, s] of [['front', art.front], ['back', art.back]] as const) for (const [name, fr] of lists(s)) m[`${view}:${name}`] = fr.map(frameHash);
  const byMove = Object.fromEntries(Object.entries(m).map(([k, v]) => [k, `${v.length} ${createHash('sha256').update(v.join()).digest('hex').slice(0, 10)}`]));
  return { whole: createHash('sha256').update(JSON.stringify(m)).digest('hex').slice(0, 16), byMove };
}
if (process.argv[1]?.endsWith('action_f7_queen_hash.ts')) {
  const h = queenHashes();
  console.log(JSON.stringify(process.argv[2] === 'moves' ? h : { queen: h.whole }, null, 1));
}

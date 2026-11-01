// THE FLOOR 3 ACTION MOCK-UPS (docs/mockups/action_f3): a hash of every frame the game shows of the green troll (the brute), the
// red troll (the guardian), the troll chieftain and the Boneward, move by move, with the game's own switches, and of the trolls
// with their new moves' switch off, so that what is added behind BRUTE_RAMPAGE and BONEWARD_WALL is shown to change nothing,
// pixel for pixel. It imports only the game's own files, so that it runs the same on the branch this one came from. Nothing of
// the game imports it.
//   npx tsx tools/action_f3_hash.ts [moves]
import { createHash } from 'node:crypto';
import { Px } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import type { ActorArt, AnimSet } from '../src/art/actor_types';
import { makeBestiary, useMonsterAttacks } from '../src/art/bestiary';
import { makeChieftainArt } from '../src/art/monster_brute';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
function lists(s: AnimSet): [string, Sprite[]][] {
  const out: [string, Sprite[]][] = [['idle', s.idle], ['walk', s.walk], ['attack3', s.attack]];
  if (s.heavy) out.push(['heavy3', s.heavy]);
  const c = s.clips;
  if (c) {
    for (const k of ['attack', 'heavy', 'die', 'reel'] as const) if (c[k]) out.push([k, c[k]!.frames]);
    for (const [k, v] of Object.entries(c.moves ?? {})) out.push([`moves.${k}`, v.frames]);
  }
  return out;
}
function frameHash(sp: Sprite): string {
  const h = createHash('sha256');
  const p = sp.img as unknown as Px;
  h.update(`${p.w}x${p.h}@${sp.ax},${sp.ay},${sp.density ?? 1};`);
  h.update(p.d);
  h.update(JSON.stringify(sp.lights ?? []));
  return h.digest('hex').slice(0, 12);
}
/** Every move of a figure, both ways round: a hash of each frame. */
export function hashMoves(art: ActorArt): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [view, s] of [['front', art.front], ['back', art.back]] as const) for (const [name, fr] of lists(s)) out[`${view}:${name}`] = fr.map(frameHash);
  return out;
}
export const whole = (m: Record<string, string[]>): string => createHash('sha256').update(JSON.stringify(m)).digest('hex').slice(0, 16);
if (process.argv[1]?.endsWith('action_f3_hash.ts')) {
  const out: Record<string, unknown> = {};
  for (const moves of [true, false]) {
    useMonsterAttacks(moves);
    const be = makeBestiary();
    for (const f of ['brute', 'guardian', 'boneward'] as const) {
      const m = hashMoves(be.of(f));
      out[`${f}${moves ? '' : ' (their moves off)'}`] = whole(m);
      if (process.argv[2] === 'moves') out[`${f}${moves ? '' : ' (their moves off)'} by move`] = Object.fromEntries(Object.entries(m).map(([k, v]) => [k, `${v.length} ${createHash('sha256').update(v.join()).digest('hex').slice(0, 10)}`]));
    }
    out[`chieftain${moves ? '' : ' (their moves off)'}`] = whole(hashMoves(makeChieftainArt()));
  }
  useMonsterAttacks(true);
  console.log(JSON.stringify(out, null, 1));
}

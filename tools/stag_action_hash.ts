// THE HOLLOW STAG'S MOVES DONE THE ACTION WAY (docs/mockups/action_f9_stag): a hash of every frame the game shows of the Hollow Stag
// (art/hollow_stag.ts makeStagArt, as art/act1_figs/stag.ts hands it over) and of a stretch of its roots (rootSnakePainted, as
// render/act1_fx/stag.ts lays them), move by move, both ways round, so that what is added behind STAG_ACTION is shown to change
// nothing, pixel for pixel. It imports only the game's own files, so that it runs the same on the branch this one came from.
// Nothing of the game imports it.
//   npx tsx tools/stag_action_hash.ts [moves]
import { createHash } from 'node:crypto';
import { Px } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import type { ActorArt, AnimSet } from '../src/art/actor_types';
import { makeStagArt, rootSnakePainted } from '../src/art/hollow_stag';

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
/** Every frame of it, both ways round, by move; and its roots' stretches (a run of moments, three ways along, both ways round). */
export function stagHashes(art: ActorArt = makeStagArt()): { whole: string; roots: string; byMove: Record<string, string> } {
  const m: Record<string, string[]> = {};
  for (const [view, s] of [['front', art.front], ['back', art.back]] as const) for (const [name, fr] of lists(s)) m[`${view}:${name}`] = fr.map(frameHash);
  const byMove = Object.fromEntries(Object.entries(m).map(([k, v]) => [k, `${v.length} ${createHash('sha256').update(v.join()).digest('hex').slice(0, 10)}`]));
  const r = createHash('sha256');
  for (const view of ['front', 'back'] as const) for (const along of [-24, 0, 24]) for (let t = -0.3; t <= 0.9; t += 0.1) {
    const p = rootSnakePainted(t, view, along, 3).px;
    r.update(`${p.w}x${p.h};`).update(p.d);
  }
  return { whole: createHash('sha256').update(JSON.stringify(m)).digest('hex').slice(0, 16), roots: r.digest('hex').slice(0, 16), byMove };
}
if (process.argv[1]?.endsWith('stag_action_hash.ts')) {
  const h = stagHashes();
  console.log(JSON.stringify(process.argv[2] === 'moves' ? h : { stag: h.whole, roots: h.roots }, null, 1));
}

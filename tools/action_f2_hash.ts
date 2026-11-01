// THE FLOOR 2 ACTION MOCK-UPS (docs/mockups/action_f2): a hash of every frame the game shows of the cultist, the shade and the
// Headsman, move by move, with the game's own switches, so that what is added behind the new switches is shown to change
// nothing, pixel for pixel, and the Headsman's mend is shown to change only the moves it mends. Nothing of the game imports it.
//   npx tsx tools/action_f2_hash.ts
import { createHash } from 'node:crypto';
import { Px } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import type { ActorArt, AnimSet } from '../src/art/actor_types';
import { makeBestiary } from '../src/art/bestiary';
import { AXE_HELD } from '../src/art/headsman2';
import { headsman2Mob } from '../src/art/headsman2_moves';
import { mobSet } from '../src/art/new_mobs3';

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
const whole = (m: Record<string, string[]>): string => createHash('sha256').update(JSON.stringify(m)).digest('hex').slice(0, 16);
if (process.argv[1]?.endsWith('action_f2_hash.ts')) {
  const be = makeBestiary();
  const out: Record<string, unknown> = {};
  for (const f of ['cultist', 'shade', 'headsman'] as const) {
    const m = hashMoves(be.of(f));
    out[f] = whole(m);
    if (process.argv[2] === 'moves') out[`${f} by move`] = Object.fromEntries(Object.entries(m).map(([k, v]) => [k, `${v.length} ${createHash('sha256').update(v.join()).digest('hex').slice(0, 10)}`]));
    if (process.argv[2] === 'frames') out[`${f} frames`] = m;
  }
  // THE HEADSMAN AS HE WAS, before art/action_f2's mend (AXE_HELD off: made, and painted, so): the same as the game's before it
  AXE_HELD.on = false;
  const was = headsman2Mob();
  const m = hashMoves({ front: mobSet(was, 'front', was.pace), back: mobSet(was, 'back', was.pace) });
  out['headsman as he was (AXE_HELD off)'] = whole(m);
  if (process.argv[2] === 'frames') out['headsman as he was frames'] = m;
  AXE_HELD.on = true;
  console.log(JSON.stringify(out, null, 1));
}

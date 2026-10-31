// THE FLOOR 1 ACTION MOCK-UPS (docs/mockups/action_f1): a hash of every frame the game shows today of the bones (the skeleton, the
// bone archer, the shieldbearer) and of the Warden, with the game's own switches, so that what is added behind the new switches is
// shown to change nothing, pixel for pixel. Nothing of the game imports it.
//   npx tsx tools/action_f1_hash.ts
import { createHash } from 'node:crypto';
import { Px } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import type { ActorArt, AnimSet } from '../src/art/actor_types';
import { makeBestiary } from '../src/art/bestiary';
import { makeArcherArt, makeShieldbearerArt, makeSkeletonArt } from '../src/art/monster_bones';
import { WARDEN_MOVES, makeWardenArt } from '../src/art/monster_warden';
import { CRAWL_OUT } from '../src/art/mkit';

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
function hashArt(art: ActorArt): string {
  const h = createHash('sha256');
  for (const [view, s] of [['front', art.front], ['back', art.back]] as const) {
    for (const [name, fr] of lists(s)) {
      h.update(`${view}:${name}:${fr.length};`);
      for (const sp of fr) {
        const p = sp.img as unknown as Px;
        h.update(`${p.w}x${p.h}@${sp.ax},${sp.ay},${sp.density ?? 1};`);
        h.update(p.d);
        h.update(JSON.stringify(sp.lights ?? []));
      }
    }
  }
  return h.digest('hex').slice(0, 16);
}
const out: Record<string, string> = {};
const be = makeBestiary();
for (const f of ['skeleton', 'archer', 'warden'] as const) out[`bestiary ${f} (game switches: WARDEN_MOVES ${WARDEN_MOVES.on}, CRAWL_OUT ${CRAWL_OUT.on})`] = hashArt(be.of(f));
const w = WARDEN_MOVES.on;
const c = CRAWL_OUT.on;
for (const on of [false, true]) {
  WARDEN_MOVES.on = on;
  CRAWL_OUT.on = on;
  out[`warden, moves ${on}`] = hashArt(makeWardenArt());
  out[`skeleton, crawl ${on}`] = hashArt(makeSkeletonArt());
  out[`archer, ${on}`] = hashArt(makeArcherArt());
  out[`archer was, ${on}`] = hashArt(makeArcherArt(true));
  out[`shieldbearer, ${on}`] = hashArt(makeShieldbearerArt());
}
WARDEN_MOVES.on = w;
CRAWL_OUT.on = c;
console.log(JSON.stringify(out, null, 1));

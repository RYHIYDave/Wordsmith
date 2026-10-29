// ACT 2, THE HUSH: THE MAP-MAKERS OF ITS FIVE FLOORS (game/act2/, one a ground), asked by game/act1_level.ts in place of
// the descent's (game/act1_layout.ts). One not built yet (it gives null every time) is stood in for by the descent's
// map-maker, its open areas laid as the Quarry's, the floor's own ground painted over them, and no stronghold.

import { cityFloor, landOf } from './act1';
import type { Act2LandKind } from './act1';
import { generateAct1 } from './act1_layout';
import type { Laid } from './act1_layout';
import { BUILT as gatewardBuilt, generate as gateward } from './act2/gateward';
import { BUILT as undercityBuilt, generate as undercity } from './act2/undercity';
import { BUILT as millraceBuilt, generate as millrace } from './act2/millrace';
import { BUILT as housequietBuilt, generate as housequiet } from './act2/housequiet';
import { BUILT as libraryBuilt, generate as library } from './act2/library';
import { BUILT as swangardensBuilt, generate as swangardens } from './act2/swangardens';

const MAKERS: Readonly<Record<Act2LandKind, { built: boolean; make: (depth: number, seed: number) => Laid | null }>> = {
  gateward: { built: gatewardBuilt, make: gateward },
  undercity: { built: undercityBuilt, make: undercity },
  millrace: { built: millraceBuilt, make: millrace },
  housequiet: { built: housequietBuilt, make: housequiet },
  library: { built: libraryBuilt, make: library },
  // (ACT 2, PART TWO, THE HIGH CITY: its floors' own, as the Hush's: game/act1.ts HIGH_CITY)
  swangardens: { built: swangardensBuilt, make: swangardens },
};

/** Lay floor `depth` (11 to 15) of the Hush, or one of the High City's (16 on, HIGH_CITY). */
export function generateAct2(depth: number, seed: number): Laid {
  if (!cityFloor(depth)) throw new Error(`no floor of the city at ${depth}`);
  const kind = landOf(depth) as Act2LandKind;
  const M = MAKERS[kind];
  if (!M.built) return generateAct1(depth, seed);
  for (let attempt = 0; attempt < 60; attempt++) {
    const out = M.make(depth, (seed + attempt * 7919) >>> 0);
    if (out) return out;
  }
  // (never seen in the tests' seeds: the descent's ground stands in rather than the game stopping)
  return generateAct1(depth, seed);
}

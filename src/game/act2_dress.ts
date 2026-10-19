// ACT 2, THE HUSH: EACH FLOOR DRESSED WITH ITS OWN PIECES by its own dresser (game/act2/<its ground>.ts, `dress`), asked by
// game/act1_dress.ts; null where a floor's is not built yet (the descent's dresser lays the floor's set then).

import { act2Floor, landOf } from './act1';
import type { Act2LandKind } from './act1';
import type { Act1Dress } from './act1_dress';
import type { Level } from './state';
import { dress as gateward } from './act2/gateward';
import { dress as undercity } from './act2/undercity';
import { dress as millrace } from './act2/millrace';
import { dress as housequiet } from './act2/housequiet';
import { dress as library } from './act2/library';

const DRESSERS: Readonly<Record<Act2LandKind, (L: Level, depth: number, seed: number) => Act1Dress | null>> = { gateward, undercity, millrace, housequiet, library };

export function dressAct2(L: Level, depth: number, seed: number): Act1Dress | null {
  if (!act2Floor(depth)) return null;
  return DRESSERS[landOf(depth) as Act2LandKind](L, depth, seed);
}

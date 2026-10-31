// ACT 2, THE HUSH: EACH FLOOR DRESSED WITH ITS OWN PIECES by its own dresser (game/act2/<its ground>.ts, `dress`), asked by
// game/act1_dress.ts; null where a floor's is not built yet (the descent's dresser lays the floor's set then).
// (ACT 2, THE HUSH: and then ITS MOMENT AROUND THE HERO, laid in this one place for all five floors: game/act2_moments.ts.)

import { act2Floor, cityFloor, landOf } from './act1';
import type { Act2LandKind } from './act1';
import type { Act1Dress } from './act1_dress';
import { layHushMoments } from './act2_moments';
import type { Level } from './state';
import { dress as gateward } from './act2/gateward';
import { dress as undercity } from './act2/undercity';
import { dress as millrace } from './act2/millrace';
import { dress as housequiet } from './act2/housequiet';
import { dress as library } from './act2/library';
import { dress as swangardens } from './act2/swangardens';
import { dress as masque } from './act2/masque';
import { dress as glassgallery } from './act2/glassgallery';

const DRESSERS: Readonly<Record<Act2LandKind, (L: Level, depth: number, seed: number) => Act1Dress | null>> = { gateward, undercity, millrace, housequiet, library, swangardens, masque, glassgallery };

export function dressAct2(L: Level, depth: number, seed: number): Act1Dress | null {
  if (!cityFloor(depth)) return null;
  const own = DRESSERS[landOf(depth) as Act2LandKind](L, depth, seed);
  // (ACT 2, THE HUSH: its moment, once everything else of the floor is laid: game/act2_moments.ts; the Hush's floors only)
  if (own && act2Floor(depth)) own.moments = layHushMoments(L, depth, seed, own);
  return own;
}

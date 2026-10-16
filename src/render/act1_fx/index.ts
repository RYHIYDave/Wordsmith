// ACT 1, THE DESCENT: WHAT EACH KIND OF ITS OWN DOES TO THE FLOOR AND SENDS ACROSS IT, DRAWN (render/act1_fx/types.ts),
// each in a file of its own here. Null: nothing beyond its figure.

import type { MonsterKind } from '../../game/types';
import type { Act1Fx } from './types';
import { FX as chanter } from './chanter';
import { FX as firepot } from './firepot';
import { FX as qgolem } from './qgolem';
import { FX as rubbling } from './rubbling';
import { FX as vulture } from './vulture';
import { FX as crawler } from './crawler';
import { FX as scorpion } from './scorpion';
import { FX as devil } from './devil';
import { FX as deer } from './deer';
import { FX as wolf } from './wolf';
import { FX as drowned } from './drowned';
import { FX as leech } from './leech';
import { FX as spawn } from './spawn';
import { FX as unfinished } from './unfinished';
import { FX as queen } from './queen';
import { FX as cantor } from './cantor';
import { FX as stag } from './stag';
import { FX as eye } from './eye';

export const ACT1_FX: Readonly<Partial<Record<MonsterKind, Act1Fx | null>>> = {
  chanter,
  firepot,
  qgolem,
  rubbling,
  vulture,
  crawler,
  scorpion,
  devil,
  deer,
  wolf,
  drowned,
  leech,
  spawn,
  unfinished,
  queen,
  cantor,
  stag,
  eye,
};

export function act1Fx(kind: string): Act1Fx | null {
  return (ACT1_FX as Record<string, Act1Fx | null | undefined>)[kind] ?? null;
}

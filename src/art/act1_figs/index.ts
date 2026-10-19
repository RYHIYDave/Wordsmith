// ACT 1, THE DESCENT: THE PICTURES OF EVERY KIND OF ITS OWN, as the game holds a monster's (art/bestiary.ts),
// each in a file of its own here (art/act1_figs/types.ts). Null: not built yet.

import type { MonsterKind } from '../../game/types';
import type { Act1Fig } from './types';
import { FIG as chanter } from './chanter';
import { FIG as firepot } from './firepot';
import { FIG as qgolem } from './qgolem';
import { FIG as rubbling } from './rubbling';
import { FIG as vulture } from './vulture';
import { FIG as crawler } from './crawler';
import { FIG as scorpion } from './scorpion';
import { FIG as devil } from './devil';
import { FIG as deer } from './deer';
import { FIG as wolf } from './wolf';
import { FIG as drowned } from './drowned';
import { FIG as leech } from './leech';
import { FIG as spawn } from './spawn';
import { FIG as unfinished } from './unfinished';
import { FIG as queen } from './queen';
import { FIG as cantor } from './cantor';
import { FIG as stag } from './stag';
import { FIG as eye } from './eye';
// ACT 2, THE HUSH (game/act1.ts ACT2): the city's own, each floor's own, the five bosses
import { FIG as hushed } from './hushed';
import { FIG as watch } from './watch';
import { FIG as scribe } from './scribe';
import { FIG as hound } from './hound';
import { FIG as rat } from './rat';
import { FIG as dredger } from './dredger';
import { FIG as fieldhand } from './fieldhand';
import { FIG as carter } from './carter';
import { FIG as patient } from './patient';
import { FIG as orderly } from './orderly';
import { FIG as inkling } from './inkling';
import { FIG as bookwarden } from './bookwarden';
import { FIG as crier } from './crier';
import { FIG as ratking } from './ratking';
import { FIG as palimpsest } from './palimpsest';
import { FIG as physician } from './physician';
import { FIG as censor } from './censor';

export const ACT1_FIGS: Readonly<Partial<Record<MonsterKind, Act1Fig | null>>> = {
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
  hushed,
  watch,
  scribe,
  hound,
  rat,
  dredger,
  fieldhand,
  carter,
  patient,
  orderly,
  inkling,
  bookwarden,
  crier,
  ratking,
  palimpsest,
  physician,
  censor,
};

export function act1Fig(kind: string): Act1Fig | null {
  return (ACT1_FIGS as Record<string, Act1Fig | null | undefined>)[kind] ?? null;
}

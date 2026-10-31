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
// ACT 2, THE HUSH (game/act1.ts ACT2): the city's own, each floor's own, the five bosses
import { FX as hushed } from './hushed';
import { FX as watch } from './watch';
import { FX as scribe } from './scribe';
import { FX as hound } from './hound';
import { FX as rat } from './rat';
import { FX as dredger } from './dredger';
import { FX as fieldhand } from './fieldhand';
import { FX as carter } from './carter';
import { FX as patient } from './patient';
import { FX as orderly } from './orderly';
import { FX as inkling } from './inkling';
import { FX as bookwarden } from './bookwarden';
import { FX as crier } from './crier';
import { FX as ratking } from './ratking';
import { FX as palimpsest } from './palimpsest';
import { FX as physician } from './physician';
import { FX as censor } from './censor';
import { FX as scraper } from './scraper';
import { FX as quill } from './quill';
import { FX as swan } from './swan';
import { FX as gardener } from './gardener';
import { FX as groom } from './groom';
import { FX as pguard } from './pguard';
import { FX as princess } from './princess';
import { FX as footman } from './footman';
import { FX as dancer } from './dancer';
import { FX as order } from './order';
import { FX as prince } from './prince';
import { FX as lady } from './lady';
import { FX as qguard } from './qguard';
import { FX as reflection } from './reflection';
import { FX as gqueen } from './gqueen';
import { FX as kknight } from './kknight';
import { FX as xbow } from './xbow';
import { FX as gking } from './gking';

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
  scraper,
  quill,
  // (ACT 2, PART TWO, THE HIGH CITY: floor 16's)
  swan,
  gardener,
  groom,
  pguard,
  princess,
  // (floor 17's)
  footman,
  dancer,
  order,
  prince,
  // (floor 18's)
  lady,
  qguard,
  reflection,
  gqueen,
  // (floor 19's)
  kknight,
  xbow,
  gking,
};

export function act1Fx(kind: string): Act1Fx | null {
  return (ACT1_FX as Record<string, Act1Fx | null | undefined>)[kind] ?? null;
}

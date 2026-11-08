// ACT 1, THE DESCENT: WHAT EACH KIND OF ITS OWN DOES TO THE FLOOR AND SENDS ACROSS IT, DRAWN (render/act1_fx/types.ts),
// each in a file of its own here. Null: nothing beyond its figure.

import type { MonsterKind } from '../../game/types';
import type { Act1Fx } from './types';
// FLOOR 1, MORE ACTION (ACTION_F1): the bone archer's arrow rain, the Warden's Lockdown
import { FX as archer } from './archer';
import { FX as warden } from './warden';
// FLOOR 2, MORE ACTION (ACTION_F2): the cultist's fire sigil, the Shade's rime
import { FX as cultist } from './cultist';
import { FX as shade } from './shade';
// THE OSSUARY AMALGAMATION'S MOVES DONE THE ACTION WAY (AM_ACTION): its marks, rings, gouges and rain
import { FX as amalgam } from './amalgam';
// THE CHAINED ONE'S MOVES DONE THE ACTION WAY (CO_ACTION): his crack and his rings
import { FX as chained } from './chained';
// FLOOR 3, MORE ACTION (ACTION_F3): the green troll's shockwave ring
import { FX as brute } from './brute';
// FLOOR 4, MORE ACTION (ACTION_F4): the Ossuary Golem's skeleton hurl
import { FX as golem } from './golem';
// THE FLESHMANCER'S MOVES DONE THE ACTION WAY (FM_ACTION): his shards, rings, fire, heaps, pit and rise (and the mini's fire)
import { FX as fleshmancer } from './fm';
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
import { FX as EYE_FX } from './eye';
import { COLOSSUS_FX } from './colossus';
import { COLOSSUS } from '../../game/colossus_fight';
/** Floor 10's boss drawn: the Drowned Eye's pictures, or (COLOSSUS on) the Swamp Colossus's stand-ins. */
const eye: Act1Fx = new Proxy({} as Act1Fx, {
  get: (_t, k: string | symbol) => (COLOSSUS.on ? (COLOSSUS_FX as unknown as Record<string | symbol, unknown>)[k] : (EYE_FX as unknown as Record<string | symbol, unknown>)[k]),
  has: (_t, k: string | symbol) => k in (COLOSSUS.on ? COLOSSUS_FX : EYE_FX),
});
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
import { FX as hshape } from './hshape';
import { FX as rshade } from './rshade';
import { FX as stoker } from './stoker';
import { FX as rshadow } from './rshadow';
import { FX as moth } from './moth';

export const ACT1_FX: Readonly<Partial<Record<MonsterKind, Act1Fx | null>>> = {
  // (the first floors' own, done the action way: floor 1's, behind ACTION_F1; their perils only)
  archer,
  warden,
  // (floor 2's, behind ACTION_F2)
  cultist,
  shade,
  // (the Chained One's, behind CO_ACTION)
  chained,
  // (the Amalgamation's, behind AM_ACTION)
  amalgam,
  // (floor 3's, behind ACTION_F3)
  brute,
  // (floor 4's, behind ACTION_F4)
  golem,
  // (the Fleshmancer's, behind FM_ACTION: his perils only)
  fleshmancer,
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
  // (floor 20's)
  hshape,
  rshadow,
  moth,
  rshade,
  stoker,
};

export function act1Fx(kind: string): Act1Fx | null {
  return (ACT1_FX as Record<string, Act1Fx | null | undefined>)[kind] ?? null;
}

// ACT 1, THE DESCENT: EVERY KIND OF ITS OWN, BY ITS RULES (game/act1_rules/types.ts; each in a file of its
// own here). A kind whose rules are null is not built yet: the cult stands in for it (game/act1_mobs.ts), and
// a floor's boss not built yet is stood in for by the Warden (game/bosses.ts, bossKind).

import type { BossRules } from '../bosses';
import type { Monster } from '../state';
import type { MonsterKind } from '../types';
import type { Act1Rules } from './types';
import { RULES as chanter } from './chanter';
import { RULES as firepot } from './firepot';
import { RULES as qgolem } from './qgolem';
import { RULES as rubbling } from './rubbling';
import { RULES as vulture } from './vulture';
import { RULES as crawler } from './crawler';
import { RULES as scorpion } from './scorpion';
import { RULES as devil } from './devil';
import { RULES as deer } from './deer';
import { RULES as wolf } from './wolf';
import { RULES as drowned } from './drowned';
import { RULES as leech } from './leech';
import { RULES as spawn } from './spawn';
import { RULES as unfinished } from './unfinished';
import { RULES as queen } from './queen';
import { RULES as cantor } from './cantor';
import { RULES as stag } from './stag';
import { RULES as eye } from './eye';
// ACT 2, THE HUSH (game/act1.ts ACT2): the city's own, each floor's own, the five bosses
import { RULES as hushed } from './hushed';
import { RULES as watch } from './watch';
import { RULES as scribe } from './scribe';
import { RULES as hound } from './hound';
import { RULES as rat } from './rat';
import { RULES as dredger } from './dredger';
import { RULES as fieldhand } from './fieldhand';
import { RULES as carter } from './carter';
import { RULES as patient } from './patient';
import { RULES as orderly } from './orderly';
import { RULES as inkling } from './inkling';
import { RULES as bookwarden } from './bookwarden';
import { RULES as crier } from './crier';
import { RULES as ratking } from './ratking';
import { RULES as palimpsest } from './palimpsest';
import { RULES as physician } from './physician';
import { RULES as censor } from './censor';
import { RULES as scraper } from './scraper';
import { RULES as quill } from './quill';
import { RULES as swan } from './swan';
import { RULES as gardener } from './gardener';
import { RULES as groom } from './groom';
import { RULES as pguard } from './pguard';
import { RULES as princess } from './princess';
import { RULES as footman } from './footman';
import { RULES as dancer } from './dancer';
import { RULES as order } from './order';
import { RULES as prince } from './prince';

export const ACT1_RULES: Readonly<Partial<Record<MonsterKind, Act1Rules | null>>> = {
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
};

/** The rules of a kind of the descent's own (null: not one, or not built yet). */
export function act1Rules(kind: MonsterKind): Act1Rules | null {
  return ACT1_RULES[kind] ?? null;
}

/** The kinds whose rules ward others (Act1Rules.ward). */
const WARDERS = new Set<MonsterKind>((Object.keys(ACT1_RULES) as MonsterKind[]).filter((k) => ACT1_RULES[k]?.ward));

/** How much less harm monster `m` takes now for the wards of those round it (a chanter's over the cult near it): the strongest of them, 0 to 1. */
export function act1Ward(R: BossRules, m: Monster): number {
  if (WARDERS.size === 0) return 0;
  let best = 0;
  for (const o of R.g.monsters) {
    if (o.dead || o === m || !WARDERS.has(o.kind)) continue;
    best = Math.max(best, ACT1_RULES[o.kind]!.ward!(R, o, m));
  }
  return best;
}

// ACT 1, THE DESCENT: EVERY KIND OF ITS OWN, BY ITS RULES (game/act1_rules/types.ts; each in a file of its
// own here). A kind whose rules are null is not built yet: the cult stands in for it (game/act1_mobs.ts), and
// a floor's boss not built yet is stood in for by the Warden (game/bosses.ts, bossKind).

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
};

/** The rules of a kind of the descent's own (null: not one, or not built yet). */
export function act1Rules(kind: MonsterKind): Act1Rules | null {
  return ACT1_RULES[kind] ?? null;
}

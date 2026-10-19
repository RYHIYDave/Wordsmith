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
  const own = (ACT1_FIGS as Record<string, Act1Fig | null | undefined>)[kind];
  if (own !== undefined) return own;
  // (ACT 2, THE HUSH: one of a kind's other looks, '<kind>:<form>': Act1Fig.looks)
  const at = kind.indexOf(':');
  if (at < 0) return null;
  const base = (ACT1_FIGS as Record<string, Act1Fig | null | undefined>)[kind.slice(0, at)];
  return base?.looks?.[Number(kind.slice(at + 1)) - 1] ?? null;
}

/** (ACT 2, THE HUSH) The figure a monster of a kind with other looks is shown as, by its form ('<kind>:<form>'); null: its kind's own. */
export function act1Look(kind: string, form: number | undefined): string | null {
  if (!form) return null;
  const f = (ACT1_FIGS as Record<string, Act1Fig | null | undefined>)[kind];
  return f?.looks?.[form - 1] ? `${kind}:${form}` : null;
}

/** (ACT 2, THE HUSH) Every other look of every kind built, as the game names its figure ('<kind>:<form>'). */
export function act1Looks(): string[] {
  const out: string[] = [];
  for (const [kind, f] of Object.entries(ACT1_FIGS)) f?.looks?.forEach((_l, i) => out.push(`${kind}:${i + 1}`));
  return out;
}

/**
 * (ACT 2, THE HUSH) For a figure of a kind whose looks are stages (Act1Fig.staged): the next to paint ahead, and those
 * gone past, to let go of. Null: not one of those.
 */
export function act1Stages(figure: string): { next: string[]; past: string[] } | null {
  const at = figure.indexOf(':');
  const kind = at < 0 ? figure : figure.slice(0, at);
  const f = (ACT1_FIGS as Record<string, Act1Fig | null | undefined>)[kind];
  if (!f || !f.staged || !f.looks?.length) return null;
  const now = at < 0 ? 0 : Number(figure.slice(at + 1));
  const name = (k: number): string => (k === 0 ? kind : `${kind}:${k}`);
  const past: string[] = [];
  for (let k = 0; k < now; k++) past.push(name(k));
  return { next: now < f.looks.length ? [name(now + 1)] : [], past };
}

// ACT 2, PART TWO, THE HIGH CITY: FLOOR 17, THE MASQUE: THE MASKED DANCERS: their rules (game/act1_rules/types.ts). Built by the
// main chat from the art chat's (art/masque_dancers.ts, masque_dancers_moves.ts; his picks there: how they move, “Gliding fast,
// whirling (Recommended)”, and their pictures, “Yes, that's them (Recommended)”; docs/mockups/masque_dancers/README.md).
//
// His doc, level 17: "masked dancers who waltz until they notice you"; the clock: "Every so often it chimes: every dancer stops
// dead and turns to look at you, then the music starts again and they all come at once." The brief he picked: "courtiers at the
// prince's ball, in gowns and frock coats of the seven rooms' colours ... knight's size, in crowds, fun to smash; they waltz in
// pairs round the room until they see you, then break off and whirl at you, fast; at the clock's chime they freeze and turn to
// look; ... one attack, a whirling spin into you".
//
// WHAT THEY DO (the main chat's, where the art leaves it to the game):
// - IN PAIRS: of a pack, each two in the order they are laid, a lady and a gentleman, dressed in the colour of the room they
//   are laid in (their form: art/act1_figs/dancer.ts); the gentleman stands at the lady's spot, the pair's middle, both facing
//   the same way, and while they sleep they waltz there (their pictures: render/act1_fx/dancer.ts), the pair turning round each
//   other once a second. One left over stands posed.
// - NOTICING HIM (woken): the waltz breaks (the art's chime from DN_CHIME.go), each steps out to where it stood in the pair
//   (chimeSplit), and they whirl at him at DN_PACE.
// - THE CHIME (game/act2/masque_rules.ts): stopped dead, the masks round to him, held, then the break and at him.
// - THE WHIRLING SPIN, their one blow (DN_SPIN, 1.8 s): wound and held (the warning, 0.36 to 0.7 s), the strike in two frames
//   carrying them SPIN.lunge (1.25 tiles) into him, landing at 0.8 s; struck, whoever is within SPIN.area (1.5 tiles) of where it
//   lands (his “bigger AOE”); carried on to SPIN_END as it winds down. Its circle marked on the floor in the enemy's pink
//   through the warning (render/act1_fx/dancer.ts).

import { DN_CHIME, DN_PACE, DN_SPIN, SPIN, SPIN_END, WHIRL_ROUND, chimeSplit } from '../../art/masque_dancers_moves';
import { TILE3 } from '../../art/new_mobs3';
import type { ActDef, BossRules, GaitDef } from '../bosses';
import type { Monster } from '../state';
import type { Act1Rules } from './types';

/** The six rooms the dancers are dressed for, in the tale's order (the black room has none: its floor is the Prince's). */
export const DANCE_ROOMS = ['blue', 'purple', 'green', 'orange', 'white', 'violet'] as const;
/** A dancer's form: its room's place times two, and 0 a lady, 1 a gentleman (art/act1_figs/dancer.ts holds the same order). */
export const formOf = (room: number, gent: boolean): number => room * 2 + (gent ? 1 : 0);
/** The spin's carry, in tiles: the strike's, and in all by its end. */
export const SPIN_CARRY = { strike: SPIN.lunge, end: SPIN_END / TILE3 };

const GAIT: GaitDef = { pace: DN_PACE, cycle: WHIRL_ROUND[1] - WHIRL_ROUND[0], setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 1.6, slack: 0.3, trueBack: true };

const ACTS: readonly ActDef[] = [
  { id: 'dancer:spin', clip: 'attack', long: DN_SPIN.long, hit: DN_SPIN.hit, dmg: 1, cooldown: 0, first: 0, after: 0.5, near: 0, far: SPIN.lunge + 1.0 },
  { id: 'dancer:chime', clip: 'chime', long: DN_CHIME.long, hit: DN_CHIME.go, dmg: 0, cooldown: 0, first: 0, after: 0, near: 0, far: 999, forced: true },
  { id: 'dancer:notice', clip: 'chime', long: DN_CHIME.long, hit: DN_CHIME.long, dmg: 0, cooldown: 0, first: 0, after: 0, near: 0, far: 999, forced: true },
];

/** What a dancer keeps (Monster.a1): its partner's id (-1 none), whether it has noticed him, a chime or notice wanted. */
function keep(m: Monster): Record<string, number> {
  return (m.a1 ??= { partner: -1, noticed: 0, want: 0, split: 0 });
}
/** Call a dancer to the clock's chime (game/act2/masque_rules.ts): woken if waltzing, and to stop dead and look. */
export function callToChime(m: Monster): void {
  const k = keep(m);
  k.want = 1;
  k.noticed = 1;
  if (m.state === 'sleep') {
    m.state = 'chase';
    m.cd = 0.3;
  }
}

/** Step a dancer out of the pair to where it stood in it, from the pair's middle (forward and to its left). */
function splitOut(R: BossRules, m: Monster): void {
  const k = keep(m);
  if (k.split || k.partner < 0) return;
  k.split = 1;
  const gent = (m.form ?? 0) % 2 === 1;
  const [fwd, left] = chimeSplit(gent ? 'gent' : 'lady').map((v) => v / TILE3);
  const x = m.x + m.fx * fwd + m.fy * left;
  const y = m.y + m.fy * fwd - m.fx * left;
  const L = R.g.level;
  if (L.walk[Math.floor(y) * L.floor.w + Math.floor(x)] === 1) {
    m.x = x;
    m.y = y;
  }
}

/** Carry one along its facing by `d` tiles, so far as the floor lets it. */
function carry(R: BossRules, m: Monster, d: number): void {
  const L = R.g.level;
  const n = Math.max(1, Math.ceil(Math.abs(d) / 0.1));
  for (let i = 0; i < n; i++) {
    const x = m.x + (m.fx * d) / n;
    const y = m.y + (m.fy * d) / n;
    if (L.walk[Math.floor(y) * L.floor.w + Math.floor(x)] !== 1) return;
    m.x = x;
    m.y = y;
  }
}

export const RULES: Act1Rules | null = {
  gait: GAIT,
  acts: ACTS,
  spawned(R, m) {
    const k = keep(m);
    // (its room: where it is laid; one laid between rooms is dressed for one of the six by its number)
    const rooms = R.g.level.land?.masque?.rooms ?? [];
    const at = rooms.find((q) => m.x >= q.r[0] && m.y >= q.r[1] && m.x < q.r[2] && m.y < q.r[3]);
    const ri = at ? DANCE_ROOMS.indexOf(at.role as (typeof DANCE_ROOMS)[number]) : -1;
    const room = ri >= 0 ? ri : m.id % DANCE_ROOMS.length;
    // (a pair: the lady first, the gentleman after her, at her spot and facing her way)
    const lady = m.packId >= 0 ? R.g.monsters.find((o) => o !== m && o.kind === 'dancer' && o.packId === m.packId && !o.dead && (o.form ?? 0) % 2 === 0 && keep(o).partner < 0) : undefined;
    if (lady) {
      m.form = (lady.form ?? 0) + 1;
      m.x = lady.x;
      m.y = lady.y;
      m.fx = lady.fx;
      m.fy = lady.fy;
      k.partner = lady.id;
      keep(lady).partner = m.id;
    } else m.form = formOf(room, false);
  },
  forced(_R, m, acts) {
    const k = keep(m);
    if (!k.want) return -1;
    // (kept wanted until it begins: start)
    return acts.findIndex((a) => a.id === (k.want === 1 ? 'dancer:chime' : 'dancer:notice'));
  },
  tick(_R, m) {
    // (woken, it notices him: the waltz breaks; once)
    const k = keep(m);
    if (!k.noticed && !m.act) {
      k.noticed = 1;
      k.want = 2;
    }
    return false;
  },
  start(R, m, a) {
    if (a.id === 'dancer:notice' || a.id === 'dancer:chime') keep(m).want = 0;
    if (a.id === 'dancer:notice' && m.act) m.act.t = DN_CHIME.go;
    if (a.id === 'dancer:notice' || a.id === 'dancer:chime') splitOut(R, m);
  },
  acting(R, m, a, t0, t1) {
    if (a.id !== 'dancer:spin') return;
    const at = (T: number): boolean => t0 < T && t1 >= T;
    const [s0, s1] = DN_SPIN.strike;
    // (the strike carries them in, its two frames; the wind-down a little further)
    if (t1 > s0 && t0 < s1) carry(R, m, (SPIN_CARRY.strike * (Math.min(t1, s1) - Math.max(t0, s0))) / (s1 - s0));
    if (t0 >= s1 && t0 < a.long) carry(R, m, ((SPIN_CARRY.end - SPIN_CARRY.strike) * (Math.min(t1, a.long) - t0)) / (a.long - s1));
    if (at(DN_SPIN.hit - 0.1)) R.g.sfx('whirl', 0.35);
    if (at(a.hit)) {
      const h = R.g.hero;
      if (Math.hypot(h.x - m.x, h.y - m.y) <= SPIN.area + 0.3) R.blow(m, a.dmg);
    }
  },
};

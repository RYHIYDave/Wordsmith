// ACT 1: THE TWISTED DEER (FLOOR 9, THE PINEWOOD): its rules (game/act1_rules/types.ts).
//
// His design doc: "Twisted Deer | Medium | An antler gore; a rearing stomp." The art chat's pictures, each with his
// yes (art/twisted_deer.ts; 15 Oct, by 14:17, "Yes, as shown (Recommended)"): its hitching limp, painted for 1.8 tiles
// a second; its gore, its antlers hooking up through you 0.55 s in, 44 of its lengths (about 1.1 tiles) before it; its
// rearing stomp, reared up through its warning, its forefeet slammed down 0.7 s in, and a ring of nine thorny roots
// bursting up round it from 0.8 s, 0.6 to 1.2 tiles out. Medium: two attacks, by his rule of 9 Oct (the gore its
// basic blow, the stomp its big one, with a cooldown). How far the thorns hurt, how hard and how often are these rules'.
//
// Every number here that is a picture's is written down here; tests/act1_deer.test.ts holds it to the art.

import { TUNE } from '../defs';
import type { ActDef, GaitDef } from '../bosses';
import type { Act1Rules } from './types';

/** THE TWISTED DEER'S NUMBERS (tiles, seconds of its pictures). */
export const DEER = {
  /** Its gore: its antlers hook up through you at `hit`, `reach` tiles before it (DEER_GORE.reach, 44 of its lengths), in a strip `half` to either side. */
  gore: { hit: 0.55, reach: 1.12, half: 0.65, knock: 0.5 },
  /** Its stomp: its forefeet slammed down at `hit`; the thorns burst up at `thorns` (its hit and its tenth's freeze), out to `reach` (the furthest of them, about 1.2 tiles); its warning on the floor from `warnFrom` (it gathers to rear). */
  stomp: { hit: 0.7, thorns: 0.8, reach: 1.25, warnFrom: 0.14, knock: 1 },
};

/** Its limp, painted for 1.8 tiles a second, a round of 0.5 s; it may stop at any frame of it (the art's: "its limp stops at any frame"). */
const GAIT: GaitDef = { pace: 1.8, cycle: 1 / 16, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 1.0, slack: 0.25, trueBack: false };

const ACTS: readonly ActDef[] = [
  { id: 'deer:gore', clip: 'attack', long: 1.1, hit: DEER.gore.hit, dmg: 1, cooldown: 0, first: 0, after: 0.5, near: 0, far: 1.25 },
  { id: 'deer:stomp', clip: 'stomp', long: 1.5, hit: DEER.stomp.hit, dmg: 1.3, cooldown: 7, first: 3, after: 0.6, near: 0, far: 1.35 },
];

export const RULES: Act1Rules | null = {
  gait: GAIT,
  acts: ACTS,
  acting(R, m, a, t0, t1) {
    const g = R.g;
    const h = g.hero;
    const at = (T: number): boolean => t0 < T && t1 >= T;
    const dist = Math.hypot(h.x - m.x, h.y - m.y);
    const free = !h.move && h.invuln <= 0 && !g.over;
    if (a.id === 'deer:gore') {
      if (!at(a.hit)) return;
      // (its antlers hook up through what is before it, as far as they reach)
      const G = DEER.gore;
      const r = R.rel(m);
      if (free && r.fwd > -0.2 && dist <= G.reach + TUNE.heroRadius * 0.5 && Math.abs(r.left) <= G.half) {
        R.blow(m, a.dmg);
        g.knockHero(m.x, m.y, G.knock);
      }
      g.emit({ t: 'shake', amount: 2 });
      g.sfx('swing', 0.7);
    } else if (a.id === 'deer:stomp') {
      const S = DEER.stomp;
      if (at(a.hit)) {
        // (its forefeet come down: the earth bursts from under them)
        g.emit({ t: 'shake', amount: 4 });
        g.sfx('slam', 0.8);
      }
      if (at(S.thorns)) {
        // (the thorny roots burst up in a ring round it: whoever is within it is struck and thrown)
        if (free && dist <= S.reach + TUNE.heroRadius * 0.5) {
          R.blow(m, a.dmg);
          g.knockHero(m.x, m.y, S.knock);
        }
        g.emit({ t: 'shake', amount: 3 });
        g.sfx('explode', 0.35);
      }
    }
  },
};

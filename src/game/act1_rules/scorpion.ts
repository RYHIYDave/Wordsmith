// ACT 1: THE CANYON SCORPIONS (FLOOR 8): its rules (game/act1_rules/types.ts).
//
// His doc's table: "Canyon Scorpions (medium)": "A pincer snap; a poison tail strike from range." His brief to the art
// chat (15 Oct): "Darting bursts, then dead still (Recommended)"; "Pincer snap, then a long tail strike (Recommended)".
// The art chat's pictures (art/canyon_scorpions.ts), each with his yes as shown: its stand, its scuttle (painted for 2
// tiles a second), its pincer snap, its tail strike (the venom's jet and splash two tiles on, in its own picture), its
// flinch and its death.
//
// WHAT IT DOES, by those (the main chat's):
// - IT DARTS: it scuttles in dashes of one or two of its walk's rounds, then stops dead still a moment, then goes again
//   (its pictures stop as its walk comes round, as every gait does). Still, it still strikes at one in its reach. With its
//   tail strike ready and the hero too near for it, it darts back a round of its walk first, to strike from range.
// - THE PINCER SNAP, its basic blow: both pincers snap shut 1.28 tiles before it at the art's moment.
// - THE TAIL STRIKE, its big move, from range: its tail drawn back high (the warning, and a ring on the floor where its
//   venom will come down: render/act1_fx/scorpion.ts), the stab, and its venom's jet bursting on the floor `reach` before
//   it (the art's SC_STING.reach) as the jet's head reaches the floor. What the venom bursts on it POISONS: the hero's
//   own poison (Hero.poisonT, as a monster's Poison word gives it, game.ts hurtHero): most of the blow again over the
//   next few seconds.

import type { ActDef } from '../bosses';
import { beside } from '../facing';
import { TUNE } from '../defs';
import type { Monster } from '../state';
import type { Act1Rules } from './types';

/** THE SCORPION'S NUMBERS: the art's (art/canyon_scorpions.ts, held to it by tests/act1_scorpion.test.ts) and the rules'. */
export const SCORPION = {
  /** The snap: its pincers shut 1.28 tiles before it (the picture's); what is in this strip before it is struck. */
  snap: { fwd: [0.2, 1.7] as const, half: 0.55 },
  /** The tail strike: the stab at the act's `hit`, held a tenth; its venom's jet reaches the floor `burst` seconds in, `reach` tiles before it, and bursts within `r`; the warning ring from `warnFrom`. What it bursts on is poisoned with `poison` of the harm it took, over the hero's poison time. */
  sting: { burst: 0.86, reach: 78 / 39.19, r: 0.7, warnFrom: 0.3, poison: 0.6 },
  /** Its darting: dashes of `dash` of its walk's rounds (a range), then still for `still` seconds (a range). */
  dash: [1, 2] as const,
  still: [0.35, 0.75] as const,
  /** Its dart back, to have him in its tail strike's range: so many rounds of its walk, straight away from him. */
  back: 1,
};

const ACTS: readonly ActDef[] = [
  // its pincer snap: its basic blow
  { id: 'scorpion:snap', clip: 'attack', long: 0.7, hit: 0.3, dmg: 1, cooldown: 0, first: 0, after: 1.0, near: 0, far: 1.7 },
  // its tail strike, from range: its big move (heavy: held a tenth at the stab)
  { id: 'scorpion:sting', clip: 'sting', long: 1.35, hit: 0.66, dmg: 0.8, cooldown: 6, first: 2, after: 0.6, near: 1.3, far: 2.6 },
];

/** What it keeps (Monster.a1): `dash` its walk's rounds still to go; `still` seconds still to stand; `ph` its walk's place in its round when last seen; `back` its dart back's rounds still to go, the way (`bx`, `by`). */
function keep(m: Monster): Record<string, number> {
  return (m.a1 ??= { dash: -1, still: 0, ph: 0, back: 0, bx: 0, by: 0 });
}

/** Where its venom comes down: `reach` before it. */
export function venomAt(m: Monster): { x: number; y: number } {
  return beside(m.x, m.y, m.fx, m.fy, m.act ? m.act.hand : 1, SCORPION.sting.reach, 0);
}

export const RULES: Act1Rules | null = {
  gait: { pace: 2.0, cycle: 0.5, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 1.05, slack: 0.4, trueBack: true },
  acts: ACTS,

  tick(R, m, dt, dist) {
    const g = R.g;
    const a = keep(m);
    if (m.state === 'act' || !m.gait) return false;
    const G = m.gait;
    if (a.back > 0) {
      // ITS DART BACK: away from him at its pace, its scuttle playing; it stops as its walk comes round, and strikes
      if (G.mode !== 'walk') m.gait = { mode: 'walk', t: 0 };
      m.anim = 'walk';
      m.fx = a.bx;
      m.fy = a.by;
      const sp = m.speed * (m.chillT > 0 ? 1 - m.chill : 1);
      g.slide(m, Math.min(m.r, 0.42), a.bx * sp * dt, a.by * sp * dt, g.level.walk, true);
      const before = m.gait!.t;
      m.gait!.t += (dt * sp) / 2.0;
      if (Math.floor(m.gait!.t / 0.5) > Math.floor(before / 0.5)) a.back--;
      if (a.back <= 0) {
        m.gait = { mode: 'stand', t: 0 };
        m.anim = 'idle';
        a.still = 0;
        a.dash = -1;
        a.ph = 0;
      }
      return true;
    }
    if (G.mode === 'walk') {
      // ITS DASH: so many rounds of its walk, counted as each comes round to its first frame; then it stops there
      if (a.dash < 0) a.dash = g.rng.int(SCORPION.dash[0], SCORPION.dash[1]);
      const ph = (G.t % 0.5) / 0.5;
      if (ph < a.ph) a.dash--;
      a.ph = ph;
      if (a.dash <= 0) {
        m.gait = { mode: 'stand', t: 0 };
        m.anim = 'idle';
        a.dash = -1;
        a.ph = 0;
        a.still = g.rng.range(SCORPION.still[0], SCORPION.still[1]);
        return true;
      }
      return false;
    }
    a.ph = 0;
    a.dash = -1;
    // (standing, its tail strike ready and he too near for it: it darts back first)
    const sting = ACTS[1];
    if (G.mode === 'stand' && m.cd <= 0 && m.moveCd && m.moveCd[1] <= 0 && dist < sting.near && g.sees(m.x, m.y, g.hero.x, g.hero.y)) {
      const n = dist || 1;
      a.bx = (m.x - g.hero.x) / n;
      a.by = (m.y - g.hero.y) / n;
      a.back = SCORPION.back;
      a.still = 0;
      return true;
    }
    if (a.still <= 0) return false;
    // DEAD STILL, but for its breath; it turns to him, and strikes if he is in its reach and it is ready
    a.still -= dt;
    G.t += dt;
    if (dist > 0.01) {
      m.fx = (g.hero.x - m.x) / dist;
      m.fy = (g.hero.y - m.y) / dist;
    }
    const ready = m.cd <= 0 && ACTS.some((d, i) => (!m.moveCd || m.moveCd[i] <= 0) && dist >= d.near && dist <= d.far);
    if (ready) {
      a.still = 0;
      return false;
    }
    // (its big move cools as it stands)
    if (m.moveCd) for (let k = 0; k < m.moveCd.length; k++) m.moveCd[k] -= dt;
    return true;
  },

  acting(R, m, a, t0, t1) {
    const g = R.g;
    const h = g.hero;
    const at = (T: number): boolean => t0 < T && t1 >= T;
    switch (a.id) {
      case 'scorpion:snap': {
        if (!at(a.hit)) break;
        const S = SCORPION.snap;
        const r = R.rel(m);
        if (r.fwd >= S.fwd[0] && r.fwd <= S.fwd[1] && Math.abs(r.left) <= S.half) R.blow(m, a.dmg);
        g.sfx('swing', 0.5);
        break;
      }
      case 'scorpion:sting': {
        const S = SCORPION.sting;
        if (at(a.hit)) {
          g.sfx('swing', 0.8);
          g.emit({ t: 'shake', amount: 2 });
        }
        if (!at(S.burst)) break;
        // ITS VENOM BURSTS on the floor before it: what it bursts on is struck, and poisoned
        const p = venomAt(m);
        if (Math.hypot(h.x - p.x, h.y - p.y) <= S.r + TUNE.heroRadius * 0.5) {
          const before = h.life;
          R.blow(m, a.dmg);
          const took = before - h.life;
          if (took > 0 && !g.over) {
            h.poisonDps = Math.max(h.poisonT > 0 ? h.poisonDps : 0, (took * S.poison) / TUNE.poisonTime);
            h.poisonT = TUNE.poisonTime;
            g.emit({ t: 'text', x: h.x, y: h.y, text: 'Poisoned', color: '#ff8a80' });
          }
        }
        g.sfx('fire', 0.4);
        break;
      }
      default:
        break;
    }
  },
};

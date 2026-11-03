// ACT 2, PART TWO, THE HIGH CITY: FLOOR 17, THE MASQUE: THE FOOTMEN: their rules (game/act1_rules/types.ts). Built by the main
// chat from the art chat's (art/masque_footmen.ts, masque_footmen_moves.ts, masque_footmen_fx.ts; his picks there, how they move
// “Brisk and stiff (Recommended)”, and their pictures “Yes, that's them (Recommended)”; docs/mockups/masque_footmen/README.md).
// His doc, level 17: "footmen". A little taller than the knight, fewer; medium: two blows (his rulebook).
//
// WHAT THEY DO (the main chat's, where the art leaves it to the game):
// - THE MARCH at FM_PACE, 2.8 tiles a second, a step each 0.23 s.
// - THE TRAY FLUNG (his basic blow, FM_THROW, 2.3 s): coiled and held (the warning, 0.44 to 0.74 s), it leaves his hand at 0.87 s
//   and flies out along the art's loop (trayFlight: six tiles out, 2.3 across) and back into his hand at 1.84 s; he stands and
//   waits for it. Where it passes is the blow: the hero within TRAY.hit of it, once a throw. Thrown from as far as it reaches.
// - THE CANDELABRUM (his second, FM_SWING, 2.1 s, every 7 s): raised and held (0.48 to 0.80 s), brought down at 0.93 s and the
//   fire fan bursts out before him (the art's FIRE_FX: from 0.55 to 3 tiles out, 120 degrees across): whoever is in it is
//   struck, 1.3 times his blow.
// Their warnings on the floor in the enemy's pink (render/act1_fx/footman.ts).

import { TILE3 } from '../../art/new_mobs3';
import { FIRE_FX } from '../../art/masque_footmen_fx';
import { FM_PACE, FM_SWING, FM_THROW, TRAY_FLIGHT, trayFlight } from '../../art/masque_footmen_moves';
import type { ActDef, BossRules, GaitDef } from '../bosses';
import type { Monster } from '../state';
import type { Act1Rules } from './types';

/** The footmen's numbers (tiles; seconds of their pictures). */
export const FOOTMAN_TUNE = {
  /** The tray strikes the hero within this of its middle. */
  tray: { hit: 0.75, reach: 6.0 },
  /** The fire fan: from `near` to `far` tiles before him, `half` radians either side of his forward. */
  fire: { near: FIRE_FX.near / TILE3, far: FIRE_FX.r / TILE3 + 0.3, half: ((FIRE_FX.spread / 2) * Math.PI) / 180 + 0.08, every: 7 },
};

/** Where his tray is, `t` seconds after it left his hand, on the floor (world), from where he stands and the way he faces. */
export function trayAt(m: { x: number; y: number; fx: number; fy: number }, t: number): { x: number; y: number } {
  const c = trayFlight(Math.max(0, Math.min(TRAY_FLIGHT.long, t))).c;
  const fwd = c[0] / TILE3;
  const left = c[1] / TILE3;
  return { x: m.x + m.fx * fwd + m.fy * left, y: m.y + m.fy * fwd - m.fx * left };
}

const GAIT: GaitDef = { pace: FM_PACE, cycle: 0.23, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 2.4, slack: 0.4, trueBack: true };

const ACTS: readonly ActDef[] = [
  { id: 'footman:tray', clip: 'attack', long: FM_THROW.long, hit: FM_THROW.hit, dmg: 1, cooldown: 0, first: 0, after: 0.6, near: 1.5, far: FOOTMAN_TUNE.tray.reach },
  { id: 'footman:fire', clip: 'candelabrum', long: FM_SWING.long, hit: FM_SWING.hit, dmg: 1.3, cooldown: FOOTMAN_TUNE.fire.every, first: 2, after: 0.6, near: 0, far: 2.8 },
];

/** Is the hero in his fire fan? */
export function inFire(R: BossRules, m: Monster): boolean {
  const r = R.rel(m);
  const d = Math.hypot(r.fwd, r.left);
  const F = FOOTMAN_TUNE.fire;
  return d >= F.near && d <= F.far && Math.abs(Math.atan2(r.left, r.fwd)) <= F.half;
}

export const RULES: Act1Rules | null = {
  gait: GAIT,
  acts: ACTS,
  start(_R, m) {
    (m.a1 ??= {}).trayHit = 0;
  },
  acting(R, m, a, t0, t1) {
    const g = R.g;
    const at = (T: number): boolean => t0 < T && t1 >= T;
    if (a.id === 'footman:tray') {
      if (at(FM_THROW.hit)) g.sfx('swing', 0.5);
      if (at(FM_THROW.catch)) g.sfx('hit', 0.3);
      // (in flight: where it passes him, it strikes, once)
      if (t1 > FM_THROW.hit && t0 < FM_THROW.catch && !(m.a1?.trayHit)) {
        const p = trayAt(m, t1 - FM_THROW.hit);
        if (Math.hypot(g.hero.x - p.x, g.hero.y - p.y) <= FOOTMAN_TUNE.tray.hit) {
          (m.a1 ??= {}).trayHit = 1;
          R.blow(m, a.dmg);
        }
      }
      return;
    }
    if (a.id === 'footman:fire') {
      if (at(FM_SWING.hit - 0.06)) g.sfx('swing', 0.5);
      if (at(FM_SWING.hit)) {
        g.sfx('fire', 0.6);
        if (inFire(R, m)) R.blow(m, a.dmg);
      }
    }
  },
};

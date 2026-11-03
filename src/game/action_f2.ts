// FLOOR 2, MORE ACTION (game/defs.ts ACTION_F2; the art chat's art/action-f2, his yes to its pictures): what the cultist's FIRE
// SIGIL and the Shade's RIME do on the floor. Each is a peril of kind 'act1' by name (its picture drawn by
// render/act1_fx/cultist.ts and shade.ts), stepped here (game/bosses.ts stepPerils, for a peril whose kind has no rules of its own).
//   THE FIRE SIGIL (in place of the cultist's fire bolt): as the cultist begins its cast, a ring under where the hero stands
//     (art/action_f2_fx.ts SIGIL.radius); at its slam (the peril's 0) the ring erupts, and a hero whose middle is inside it is
//     struck; then the floor burns on, its fire shrinking in to the middle (burnRadius), a hero inside it burned so much a
//     second (SIGIL_BURN). If the cultist falls, or is stopped, before its slam, nothing erupts.
//   THE RIME (the Shade's rake, cold): at its blow a patch of frost RIME.ahead before it; a hero in it is slowed by RIME.slow
//     while it lies (rimeHolds).

import { RIME, SIGIL, SIGIL_LONG, burnRadius, rimeHolds, sigilStrikes } from '../art/action_f2_fx';
import type { Game } from './game';
import type { Monster, Peril } from './state';

/** The perils' names. */
export const SIGIL_PERIL = 'cultist:sigil';
export const RIME_PERIL = 'shade:rime';
/** How long each lasts (seconds: the sigil from its eruption, the rime from the blow). */
export const SIGIL_LASTS = SIGIL_LONG;
export const RIME_LASTS = RIME.lie;
/** The burning floor's harm: this share of the eruption's, every `every` seconds a hero stands in it. */
export const SIGIL_BURN = { share: 0.18, every: 0.5 };

/** A step of a floor 2 peril (game/bosses.ts stepPerils). False: it is none of these. */
export function stepActionF2(g: Game, p: Peril, hurt: (mult?: number) => void): boolean {
  const h = g.hero;
  if (p.a1 === SIGIL_PERIL) {
    // (its cultist still casting: if it has fallen, or been stopped in its cast, nothing erupts)
    if (p.t < -0.05) {
      const m = g.monsters.find((o: Monster) => o.id === p.a);
      if (!m || m.dead || m.state !== 'windup') p.dur = p.t;
      return true;
    }
    if (!p.done && p.t >= 0) {
      p.done = 1;
      if (sigilStrikes(h.x - p.x, h.y - p.y)) hurt();
      g.sfx('fire', 0.9);
      g.emit({ t: 'shake', amount: 2.5 });
      return true;
    }
    // (the floor burning on: a tick every SIGIL_BURN.every while he stands in what still burns)
    if (p.done && p.t > SIGIL.strike[1]) {
      const next = SIGIL.strike[1] + SIGIL_BURN.every * p.done;
      if (p.t >= next) {
        p.done++;
        if (Math.hypot(h.x - p.x, h.y - p.y) <= burnRadius(p.t)) hurt(SIGIL_BURN.share);
      }
    }
    return true;
  }
  if (p.a1 === RIME_PERIL) {
    if (rimeHolds(p.t, h.x - p.x, h.y - p.y)) {
      const was = (h.slowT ?? 0) > 0 ? h.slowBy ?? 0 : 0;
      h.slowT = Math.max(h.slowT ?? 0, 0.12);
      h.slowBy = Math.max(was, RIME.slow);
    }
    return true;
  }
  return false;
}

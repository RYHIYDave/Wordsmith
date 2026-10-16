// ACT 1: THE DUST DEVILS (FLOOR 8): its rules (game/act1_rules/types.ts).
//
// His doc's table: "Dust Devils (small)": "Small whirlwinds that spin into you, knock you about, then scatter." His brief
// to the art chat (15 Oct): "Weaving, never still (Recommended)"; "Lashes you with a whip of sand (Recommended)"; "Flickers
// and stutters" when struck. The art chat's pictures (art/dust_devils.ts), each with his yes as shown: its stand, its
// weave (its dust trail painted for 2.4 tiles a second), its lash, its stutter and its death.
//
// WHAT IT DOES, by those (the main chat's):
// - IT SPINS INTO YOU: it weaves as it comes (its own swaying in its picture, and a weave of its way across the floor),
// - LASHES YOU, its one attack (small: one, by his rule): its whip of sand cracks out `reach` before it at the art's
//   moment, and KNOCKS YOU ABOUT (thrown back a step, as a heavy blow throws him),
// - THEN SCATTERS: off away from you for a moment, weaving, before it comes back at you.

import type { ActDef } from '../bosses';
import type { Monster } from '../state';
import type { Act1Rules } from './types';

/** THE DUST DEVIL'S NUMBERS: the art's (art/dust_devils.ts, held to it by tests/act1_devil.test.ts) and the rules'. */
export const DEVIL = {
  /** The lash: its whip's tip cracks `reach` tiles before it (DD_LASH.reach, 50 of its lengths), 12 of them up, its whip out from its side to there; what is under it, in the strip `fwd` before it and `half` to either side, is struck, and knocked back by `knock` of a heavy blow's step. */
  lash: { reach: 50 / 39.19, fwd: [0.1, 50 / 39.19 + 0.55] as const, half: 0.6, knock: 1 },
  /** It spins in this near (tiles, middle to middle) before it lashes: into you, its whip reaching on past you. */
  near: 1.1,
  /** Its weave across the floor as it goes: so far to either side of its way (tiles), so long a swerve each way and back (seconds). */
  weave: { wide: 0.22, period: 1.6 },
  /** After its lash it scatters: off for `secs` seconds (a range), up to `turn` radians off straight away from him. */
  scatter: { secs: [0.6, 1.0] as const, turn: 0.9 },
};

/** The pace its weave is painted for (DD_PACE): its picture plays on at it as it goes. */
const DD_GAIT_PACE = 2.4;

const ACTS: readonly ActDef[] = [
  // its lash: its one attack (light: no freeze)
  { id: 'devil:lash', clip: 'attack', long: 0.9, hit: 0.5, dmg: 1, cooldown: 0, first: 0, after: 0.2, near: 0, far: 1.5 },
];

/** What it keeps (Monster.a1): `go` seconds of scattering still to go, the way it scatters (`sx`, `sy`); `w` its weave's clock. */
function keep(m: Monster): Record<string, number> {
  return (m.a1 ??= { go: 0, sx: 0, sy: 0, w: m.seed * DEVIL.weave.period });
}

export const RULES: Act1Rules | null = {
  gait: { pace: DD_GAIT_PACE, cycle: 1.0, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 1.1, slack: 0.3, trueBack: true },
  acts: ACTS,

  tick(R, m, dt, dist) {
    const g = R.g;
    const a = keep(m);
    if (m.state === 'act' || !m.gait) return false;
    const sp = m.speed * (m.chillT > 0 ? 1 - m.chill : 1);
    if (a.go > 0) {
      // SCATTERING: off away from him at its pace, its weave playing on
      a.go -= dt;
      if (m.gait.mode !== 'walk') m.gait = { mode: 'walk', t: 0 };
      m.anim = 'walk';
      m.fx = a.sx;
      m.fy = a.sy;
      g.slide(m, Math.min(m.r, 0.42), a.sx * sp * dt, a.sy * sp * dt, g.level.walk, true);
      m.gait.t += (dt * sp) / DD_GAIT_PACE;
      return true;
    }
    if (m.gait.mode === 'walk' && dist <= DEVIL.near && g.sees(m.x, m.y, g.hero.x, g.hero.y)) {
      // (it has no feet: in its reach it stops where it is, not where its weave comes round, as a walker's must)
      m.gait = { mode: 'stand', t: 0 };
      m.anim = 'idle';
      return false;
    }
    if (m.gait.mode === 'walk') {
      // ITS WEAVE: a swerve to one side of its way and the other as it comes (the step carries it on along its way)
      const W = DEVIL.weave;
      a.w += dt;
      const side = ((2 * Math.PI * W.wide) / W.period) * Math.cos((2 * Math.PI * a.w) / W.period);
      g.slide(m, Math.min(m.r, 0.42), m.fy * side * dt, -m.fx * side * dt, g.level.walk, true);
    }
    return false;
  },

  acting(R, m, a, t0, t1) {
    const g = R.g;
    const h = g.hero;
    const at = (T: number): boolean => t0 < T && t1 >= T;
    if (at(0.42)) g.sfx('gust', 0.5);
    if (!at(a.hit)) return;
    // THE CRACK of its whip, before it: struck, and knocked about
    const L = DEVIL.lash;
    const r = R.rel(m);
    if (r.fwd >= L.fwd[0] && r.fwd <= L.fwd[1] && Math.abs(r.left) <= L.half && !h.move && h.invuln <= 0) {
      R.blow(m, a.dmg);
      g.knockHero(m.x, m.y, L.knock);
    }
    g.sfx('swing', 0.5);
  },

  end(R, m) {
    // THEN IT SCATTERS: off away from him, a little to one side
    const g = R.g;
    const a = keep(m);
    const dx = m.x - g.hero.x;
    const dy = m.y - g.hero.y;
    const ang = Math.atan2(dy, dx) + g.rng.range(-DEVIL.scatter.turn, DEVIL.scatter.turn);
    a.sx = Math.cos(ang);
    a.sy = Math.sin(ang);
    a.go = g.rng.range(DEVIL.scatter.secs[0], DEVIL.scatter.secs[1]);
    // (its weave, from its lash's last pose, which is its stand's: it goes off at once)
    m.gait = { mode: 'walk', t: 0 };
    m.anim = 'walk';
  },
};

// ACT 2, THE HUSH: FLOOR 11'S BOSS, THE CRIER: what he does to the floor and sends across it, drawn (render/act1_fx/types.ts),
// where his rules (game/act1_rules/crier.ts) have it. The pictures are the art chat's own (art/crier_shots.ts, with his yes
// to the films they are in), drawn in the game's own pixels as they come; only what his own picture does not paint (art/
// crier.ts paints the burst of the Hush off his bell as it slams, the dead air boiling out of it as he shouts, the rings of
// his call going up out of it, and the Hush pouring out of him as he dies):
//   ON THE FLOOR, as he makes a move: the Silent Shout's cone marked as he draws breath, the dust drawn in toward him
//     (drawShoutWarn); the Proclamation's lane marked as he holds the scroll high (drawProclaimWarn); a ring closing in
//     on him as he draws breath for the Crowd (drawCrowdBreath). Each from where his film has it begin, to its blow.
//   ON THE FLOOR, what his moves leave: the flags cracked where his bell slams down (drawBellSlam); the dead air rolling
//     out over the Shout's cone, the floor dark under it (drawShoutBlast); the scroll flung down, unrolling down its lane,
//     lying, and crumbling into the Hush (drawProclamation); his call's rings rolling out from him (drawCrowdCall); and
//     where the Hushed come out, a pool of the Hush welling up first (drawHushedRising).
// Every colour is the enemy's pink and gold, and the Hush's grey: never a friend's cyan (the art chat's, held by
// tests/crier.test.ts).

import { drawBellSlam, drawCrowdBreath, drawCrowdCall, drawHushedRising, drawProclaimWarn, drawProclamation, drawShoutBlast, drawShoutWarn } from '../../art/crier_shots';
import { CRIER, CRIER_ACTS, proclaimWay, shoutWay } from '../../game/act1_rules/crier';
import type { Monster } from '../../game/state';
import type { Act1Fx } from './types';

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const hitOf = (id: string): number => CRIER_ACTS.find((a) => a.id === id)!.hit;
/** How far through a warning, `t` seconds into its move: from `from` to just before its blow (as the art chat's films have it). */
const warnK = (t: number, from: number, hit: number): number => clamp01((t - from) / (hit - 0.04 - from));

export const FX: Act1Fx | null = {
  ground(c, m, p) {
    const g = c.g;
    if (!g) return;
    if (m) {
      // HIM, as he makes a move: its warning on the floor, until its blow
      const act = m.act;
      if (!act || m.state !== 'act') return;
      const t = act.t;
      if (act.id === 'crier:shout' && t < hitOf(act.id)) {
        const w = shoutWay(m.fx, m.fy, act.hand);
        drawShoutWarn(g, c.at, m.x, m.y, w.fx, w.fy, warnK(t, CRIER.shout.warnFrom, hitOf(act.id)), c.t);
      } else if (act.id === 'crier:proclaim' && t < hitOf(act.id)) {
        const w = proclaimWay(m.fx, m.fy, act.hand);
        drawProclaimWarn(g, c.at, m.x, m.y, w.fx, w.fy, warnK(t, CRIER.proclaim.warnFrom, hitOf(act.id)), c.t);
      } else if (act.id === 'crier:crowd' && t < hitOf(act.id)) {
        drawCrowdBreath(g, c.at, m.x, m.y, warnK(t, CRIER.crowd.warnFrom, hitOf(act.id)), c.t);
      }
      return;
    }
    if (!p) return;
    switch (p.a1) {
      case 'crier:slam':
        drawBellSlam(g, c.at, p.x, p.y, p.t);
        break;
      case 'crier:shout':
        drawShoutBlast(g, c.at, p.x, p.y, p.fx, p.fy, p.t);
        break;
      case 'crier:scroll':
        drawProclamation(g, c.at, p.x, p.y, p.fx, p.fy, p.t, [p.a, p.b]);
        break;
      case 'crier:call':
        drawCrowdCall(g, c.at, p.x, p.y, p.t);
        break;
      case 'crier:rising':
        if (p.t >= 0) drawHushedRising(g, c.at, p.x, p.y, p.t);
        break;
      default:
        break;
    }
  },

  // (struck as he marches, he marches on: his flinch is a standing one, and the game carries him on at his pace)
  sprite(m: Monster, _art, set) {
    if (m.state === 'act' || !m.gait || m.struckT === undefined || m.frozenT > 0) return null;
    const gt = m.gait;
    const reel = set.clips?.reel;
    if (!reel || m.struckT >= reel.frames.length / reel.fps) return null;
    const more = set.clips?.moves ?? {};
    const of = (clip: { frames: readonly unknown[]; fps: number } | undefined, t: number): number => (clip ? Math.max(0, Math.min(clip.frames.length - 1, Math.floor(Math.max(0, t) * clip.fps + 1e-6))) : -1);
    if (gt.mode === 'walk') return set.walk[Math.floor(Math.max(0, gt.t) * (set.walkFps ?? 15) + 1e-6) % set.walk.length];
    if (gt.mode === 'setOff' && more.setOff) return more.setOff.frames[of(more.setOff, gt.t)];
    if (gt.mode === 'halt' && more.halt) return more.halt.frames[of(more.halt, gt.t)];
    return null;
  },
};

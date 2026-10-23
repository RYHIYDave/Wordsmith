// ACT 1: THE DROWNED EYE, THE ACT'S BOSS (FLOOR 10): his figure as his rules have it, and what he lays on the floor,
// drawn (render/act1_fx/types.ts). Every picture here is the art chat's (art/drowned_eye.ts, held as his pictures by
// art/act1_figs/eye.ts); only the warning of his sweep's reach on the floor is the game's own, in the enemy's pink and
// gold, as the Headsman's sweep has it (art/boss_shots.ts drawSweepRing).
//   HIS FIGURE: his lurk, his stand, or his stand blazing, by his phase, where his round has it (game/act1_rules/eye.ts
//     eyeClock); in a move of his figure, its picture, aimed as his rules aimed it. Never turned over: he faces the
//     camera always.
//   STANDING among the figures: his arms bursting up through the floor, the siege's bolts, his eggs (one picture of
//     each, every other one of them turned over so that no two side by side are the same).
//   ON THE FLOOR: the reach of his sweep, while his arm is cocked back ('eye:reach', laid on the ring by his rules).

import type { AnimSet, ActorArt } from '../../art/actor_types';
import { FLAME } from '../../art/mkit';
import { flipSprite } from '../../engine/px';
import type { Sprite } from '../../engine/px';
import { actDef } from '../../game/bosses';
import { EYE_STAND, EYE_SWEEP, eyeClip, eyeClock, eyePhase, figureAct, moveOf, onAim, sweepAngle } from '../../game/act1_rules/eye';
import type { Monster, Peril } from '../../game/state';
import { clipIndex, paintedNear } from '../figure';
import type { Act1Fx, Act1FxCtx } from './types';

/**
 * His figure this frame: his round, or the move he makes. NEVER PAINTED HERE: a frame of his takes a third of a second and more
 * to paint, and the painter paints them beside the game (render/painter.ts); one read here before it had come was painted on
 * the spot, the game held still meanwhile, frame after frame: he stuttered (the owner, 23 Oct 2026, 15:21: “He stutters in and
 * out of view”). So the frame wanted if it is here, else the nearest of the same that is, else his round's; and if none of
 * his round is here yet, its first, painted on the spot once.
 */
function figureNow(m: Monster, set: AnimSet): Sprite | null {
  const moves = set.clips?.moves ?? {};
  const ph = eyePhase(m);
  if (m.state === 'act' && m.act) {
    const a = actDef(m);
    const mv = a && figureAct(a) ? moveOf(a) : null;
    const c = mv ? moves[eyeClip(mv, m.act.a)] : undefined;
    if (c && c.frames.length) {
      const s = paintedNear(c.frames, clipIndex(c, m.act.t));
      if (s) return s;
    }
  }
  const loop = ph === 0 ? moves.lurk?.frames : ph >= 2 ? moves.stand3?.frames : set.idle;
  if (!loop || !loop.length) return null;
  // (none of it here yet: its first frame painted on the spot, once, and the nearest to it shown from then on)
  return paintedNear(loop, Math.floor(eyeClock(m) * EYE_STAND.fps + 1e-6) % loop.length, true) ?? loop[0];
}

/** One of the pictures of their own he lays on the floor, `t` seconds in (null before it begins or once it is over). */
function pieceOf(c: Act1FxCtx, name: 'burst' | 'bolt' | 'egg', t: number, turn: boolean): Sprite | null {
  const art: ActorArt = c.bestiary.of('eye');
  const clip = art.front.clips?.moves?.[name];
  if (!clip || t < 0 || t >= clip.frames.length / clip.fps) return null;
  // (as figureNow: the nearest painted; none yet, this one painted on the spot: an arm that strikes is seen)
  const i = clipIndex(clip, t);
  const s = paintedNear(clip.frames, i) ?? clip.frames[i];
  return turn ? flipSprite(s) : s;
}

/**
 * THE REACH OF HIS SWEEP, on the ring's stones while his arm is cocked (a peril of its own, 'eye:reach', so that it is
 * drawn with the ring's floor: his middle is in his pool): the arc his arm will come round through, dotted in the enemy's
 * fire, a hot run along it the way it will come, as the Headsman's sweep has it (art/boss_shots.ts drawSweepRing).
 */
function sweepWarning(c: Act1FxCtx, p: Peril): void {
  const g = c.g;
  if (!g) return;
  const S = EYE_SWEEP;
  const k = Math.min(1, p.t / S.sweep[0]);
  const a0 = sweepAngle(S.sweep[0], p.a);
  const a1 = sweepAngle(S.over, p.a);
  // (as close set as the Headsman's ring: a dot every two or three of the game's pixels along it)
  const n = Math.max(48, Math.round((Math.abs(a1 - a0) / 360) * S.reach * 80));
  const run = (c.t * 1.4) % 1;
  const was = g.globalAlpha;
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const o = onAim(a0 + (a1 - a0) * u, S.reach);
    const [x, y] = c.at(p.b + o.x, p.c + o.y);
    const lead = 1 - ((((u - run) % 1) + 1) % 1);
    const hot = lead > 0.85 ? (lead - 0.85) / 0.15 : 0;
    g.globalAlpha = was * Math.min(1, 0.25 + 0.6 * k + 0.4 * hot);
    g.fillStyle = hot > 0.5 ? FLAME[3] : FLAME[2];
    g.fillRect(Math.round(x), Math.round(y), 1, 1);
    if (i % 2 === 0) {
      g.fillStyle = FLAME[0];
      g.fillRect(Math.round(x), Math.round(y) + 1, 1, 1);
    }
  }
  g.globalAlpha = was;
}

export const FX: Act1Fx = {
  sprite(m: Monster, _art: ActorArt, set: AnimSet): Sprite | null {
    const s = figureNow(m, set);
    if (!s) return null;
    // (never turned over: where the game would turn him to the hero, as a boss who waits for his gate is, it is undone)
    return m.fx - m.fy < 0 ? flipSprite(s) : s;
  },

  ground(c: Act1FxCtx, _m: Monster | null, p: Peril | null): void {
    if (p && p.a1 === 'eye:reach') sweepWarning(c, p);
  },

  standing(c: Act1FxCtx, m: Monster | null, p: Peril | null): void {
    if (!p || !p.a1) return;
    const name = p.a1 === 'eye:burst' ? 'burst' : p.a1 === 'eye:bolt' ? 'bolt' : p.a1 === 'eye:egg' ? 'egg' : null;
    if (!name) return;
    const s = pieceOf(c, name, p.t, p.c % 2 === 1);
    if (!s) return;
    const [x, y] = c.at(p.x, p.y);
    c.stand(p.x + p.y, s, x, y);
  },
};

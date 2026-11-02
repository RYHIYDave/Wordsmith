// THE FLESHMANCER, EVERY MOVE DONE THE ACTION WAY (the art chat's art/action-f5, art/fleshmancer_action.ts and
// art/fleshmancer_action_fx.ts behind FLESH_ACTION; his yes to it there, 2 Nov 2026, “Yes, that's it (Recommended)”, the fire whip
// faster than he can run, as drawn). Behind this switch (off), with the art's (art/bestiary.ts useFmAction). His acts (game/bosses.ts
// FM2_ACTS, fmActing) leave these perils of kind 'act1', stepped here (game/bosses.ts stepPerils) and drawn by
// render/act1_fx/fm.ts; each one's clock is his act's own (0 as it begins) unless said:
//   FM_SHARDS  his two fans of bone shards: drawn up out of the floor and hung before him, each its lane marked; flung at his hammer
//              (SHARD_HITS), 15 tiles a second for 10; a hero within SHARDS.r of a flying shard is struck, once by each. `b` the
//              first fan's aim (radians on the floor, taken as he begins), `c` the second's (taken as it is drawn up, in the first's
//              gaps: NaN till then),
//              `d` the shards that have struck (a bit each), `a` him.
//   FM_RINGS   his five rings of hands round where he stood: the cracks lit, the first slam's rings (1, 3, 5) burst up at
//              RING_HITS[0], the others at RING_HITS[1], each a frame after the one inside it; a hero within RINGS.r of a hand as
//              its ring bursts up (and for HAND_UP after) is struck, once by each ring. `b` its aim, `d` the rings that have struck.
//   FM_FIRE    his fire (or a mini fleshmancer's, `d` 1): the stream whipped round from FIRE_HIT to FIRE_STOP, the floor left burning
//              in lanes where it gouted; a hero in the stream, or in a lane burning, is burned every TICK (in a lane, LANE_SHARE).
//              `fx`, `fy` the way he faced, `hand` the hand he is drawn with, `c` when it last burned him.
//   FM_HEAP    a bone heap of his hall shaking while he summons and bursting as its dead come up (`b` which, for its moment).
//   FM_PIT     the pit of his dead under him as he is yanked down (its clock his going's).
//   FM_RISE    where he will rise, marked a second before he erupts; its 0 his eruption: a hero within RISE_MARK.r of it then is
//              struck (`done` 1 once it has).

import { RING_HITS, RISE_HIT, RISE_LONG, SHARD_DRAW, SHARD_HITS, SHARD_LONG, SINK_GONE, SINK_LONG, FIRE_HIT, FIRE_LONG, MINI_LONG, fireWay, miniWay } from '../art/fleshmancer_action';
import { FIRE, MINI_FIRE, RINGS, RISE_MARK, SHARDS, fireStrikes, ringBurst, ringStrikes, shardsAt } from '../art/fleshmancer_action_fx';
import { fromFigure } from './facing';
import type { Game } from './game';
import type { Peril } from './state';

/** The switch (off): his moves the action way, in the rules; the art's goes with it (art/bestiary.ts useFmAction). */
export const FM_ACTION = { on: false };

export const FM_SHARDS = 'fleshmancer:shards';
export const FM_RINGS = 'fleshmancer:rings';
export const FM_FIRE = 'fleshmancer:fire';
export const FM_HEAP = 'fleshmancer:heap';
export const FM_PIT = 'fleshmancer:pit';
export const FM_RISE = 'fleshmancer:rise';

/**
 * The rules' own numbers. His teleport's (`blink`: going, out of reach from `gone`, nowhere `pause`, coming back `rise`, out of reach
 * till `up`: the README's “FLESH_BLINK sink 1.0, gone 0.667, pause 0.4, rise 1.4, up 0.667”); the rise's blow (`riseDmg`, a share of
 * his); how long a ring's hands strike as they come up (`handUp`); how often the fire burns him (`tick`) and how much a lane does of
 * the stream's (`laneShare`); how long each peril lasts after its act begins.
 */
export const FM2 = {
  blink: { sink: SINK_LONG, gone: SINK_GONE, pause: 0.4, rise: RISE_LONG, up: RISE_HIT },
  riseDmg: 1.0,
  handUp: 0.3,
  tick: 0.22,
  laneShare: 0.5,
  lasts: { shards: SHARD_LONG + 0.5, rings: RING_HITS[1] + 2.0, fire: FIRE_LONG + FIRE.burn + FIRE.scorch, mini: MINI_LONG + MINI_FIRE.burn + MINI_FIRE.scorch },
};

/** Where his shards are now, each on the floor (tiles), and whether it is flying (it strikes): both fans, each by its own aim. */
export function shardsNow(p: Peril): { x: number; y: number; i: number; flying: boolean; s: ReturnType<typeof shardsAt>[number] }[] {
  const out: { x: number; y: number; i: number; flying: boolean; s: ReturnType<typeof shardsAt>[number] }[] = [];
  for (let fan = 0; fan < 2; fan++) {
    const aim = fan === 0 ? p.b : p.c;
    if (!Number.isFinite(aim)) continue;
    let i = fan === 0 ? 0 : SHARDS.fan[0];
    for (const s of shardsAt(p.t, aim)) {
      if (s.fan !== fan) continue;
      out.push({ x: p.x + s.x, y: p.y + s.y, i: i++, flying: s.state === 'flying', s });
    }
  }
  return out;
}

/** A step of one of his perils (game/bosses.ts stepPerils). False: it is none of his. */
export function stepFm(g: Game, p: Peril, hurt: (mult?: number) => void): boolean {
  if (!p.a1 || !p.a1.startsWith('fleshmancer:')) return false;
  const h = g.hero;
  // (the reaches are the art's own, the hero's body in them: SHARDS.r so that the gaps are real, RINGS.r, RISE_MARK.r)
  switch (p.a1) {
    case FM_SHARDS: {
      // (the second fan's aim, as it is drawn up: turned toward where the hero is then by whole steps of the first fan's, so that it
      // still hangs in the first one's gaps, as drawn: who stood in a gap of the first is struck by the second)
      if (!Number.isFinite(p.c) && p.t >= SHARD_DRAW[1][0]) {
        const step = (SHARDS.apart * Math.PI) / 180;
        const off = Math.atan2(h.y - p.y, h.x - p.x) - p.b;
        p.c = p.b + step * Math.round(Math.atan2(Math.sin(off), Math.cos(off)) / step);
      }
      if (p.t < SHARD_HITS[0]) break;
      for (const s of shardsNow(p)) {
        if (!s.flying || p.d & (1 << s.i)) continue;
        if (Math.hypot(h.x - s.x, h.y - s.y) > SHARDS.r) continue;
        p.d |= 1 << s.i;
        hurt();
      }
      break;
    }
    case FM_RINGS: {
      RINGS.radii.forEach((_, i) => {
        const T = ringBurst(i);
        if (p.t < T || p.t > T + FM2.handUp || p.d & (1 << i)) return;
        if (!ringStrikes(i, h.x - p.x, h.y - p.y, p.b)) return;
        p.d |= 1 << i;
        hurt();
        g.emit({ t: 'shake', amount: 1.5 });
      });
      break;
    }
    case FM_FIRE: {
      const mini = p.d === 1;
      if (p.t - p.c < FM2.tick) break;
      const r = fromFigure(p.x, p.y, p.fx, p.fy, p.hand ?? 1, h.x, h.y);
      if (!fireStrikes(p.t, r.fwd, r.left, mini)) break;
      p.c = p.t;
      hurt(inStream(p.t, r.fwd, r.left, mini) ? 1 : FM2.laneShare);
      break;
    }
    case FM_RISE: {
      if (p.done || p.t < 0) break;
      p.done = 1;
      if (Math.hypot(h.x - p.x, h.y - p.y) <= RISE_MARK.r) {
        hurt();
        g.knockHero(p.x, p.y, 1);
      }
      g.emit({ t: 'shake', amount: 4 });
      g.sfx('slam', 0.9);
      break;
    }
    default:
      break;
  }
  return true;
}

/** Whether a hero (tiles before him, to his left) is in the stream itself now (not only a lane): the stream burns the more. */
function inStream(t: number, fwd: number, left: number, mini: boolean): boolean {
  const S = mini ? MINI_FIRE : FIRE;
  const now = (mini ? miniWay : fireWay)(t);
  if (now === null) return false;
  const d = Math.hypot(fwd, left);
  if (d < S.land - 0.2 || d > S.reach + 0.3) return false;
  const b = Math.atan2(left, fwd);
  return Math.abs(((b - now + Math.PI * 3) % (Math.PI * 2)) - Math.PI) <= Math.atan2(S.half, d);
}

/** (for the tests) When his fire first bursts out (seconds into it). */
export const FM_FIRE_AT = FIRE_HIT;

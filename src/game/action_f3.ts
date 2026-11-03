// FLOOR 3, MORE ACTION (game/defs.ts ACTION_F3; the art chat's art/action-f3, his "Yes, that's it (Recommended)" to each, 31 Oct
// 2026): THE GREEN TROLL's RAMPAGE in place of his swing and his slam, and his BULL RUSH as his second (game.ts startMove,
// landMove, carryAlong, runCharge; the Boneward's shield wall is game.ts wallUp). His numbers are his pictures' (art/monster_brute.ts,
// art/action_f3_fx.ts):
//   THE RAMPAGE: two swings, each a step in, then a leap and a two-fisted slam. The swings (RAMPAGE.hits, 0.6 and 1.167 s) strike a
//     hero within RAMPAGE.reach in the half of the floor before him; the game carries him rampageTravel(t) the way he faces (2.0
//     tiles: not on through the hero, nor into a wall); as the club goes up over his head (RAMPAGE.raise, 1.4 s) the ring is marked
//     with the game's red circle, its middle RING.ahead before where he will land; the slam (2.367 s) strikes a hero within
//     RING.radius of it, and the ring goes out over the floor (RING_PERIL, drawn by render/act1_fx/brute.ts). Stopped before it
//     (staggered), the mark goes and the slam never comes.
//   THE BULL RUSH: the red troll's charge (CHARGE), but his own: down a lane RUSH.half wide (each side) to RUSH.past beyond the
//     hero, at RUSH.pace; his run ended as its round comes to one of RUSH.endOn; then carried rushStopTravel through his stop.
import { RAMPAGE, RING, RUSH } from '../art/action_f3_fx';
import { ACTION_F3, CHARGE } from './defs';
import type { Monster } from './state';

/** The ring's peril (drawn only: its blow is the slam's own), and how long it lasts from the slam. */
export const RING_PERIL = 'brute:ring';
export const RING_LASTS = RING.long;
/** What each blow of the rampage does, times his blow: the swings as his old swing, the slam as his old slam. */
export const RAMPAGE_BLOWS = { swing: 0.6, slam: 1.0 } as const;
/** The rampage's whole reach, from where he begins it: its swing's, and the rest of the time he steps in to it. */
export const RAMPAGE_FROM = RAMPAGE.reach + 0.3;

/** Whether a troll is the green troll with his rampage and his rush (ACTION_F3). */
export const greenTroll = (m: { kind: string; champion: boolean }): boolean => ACTION_F3.on && m.kind === 'brute' && !m.champion;

/** A charge's numbers by whose it is: the red troll's (CHARGE), or the green troll's bull rush (RUSH). `stop`: how far his stop carries him on past the end of his run (the lane is drawn to there). */
export function chargeOf(m: { kind: string; champion: boolean }): { speed: number; half: number; past: number; run: number; stop: number; knock: number } {
  if (greenTroll(m)) return { speed: RUSH.pace, half: RUSH.half, past: RUSH.past + RUSH.stop, run: RUSH.past, stop: RUSH.stop, knock: CHARGE.knock };
  return { speed: CHARGE.speed, half: CHARGE.half, past: CHARGE.past, run: CHARGE.past, stop: 0, knock: CHARGE.knock };
}

/** Whether the bull rush's run may end at this moment of it: its round (six frames) come to one of RUSH.endOn, so his stop takes him from his stride. */
export const rushMayEnd = (m: Monster): boolean => RUSH.endOn.includes(Math.floor(m.animT * 30 + 1e-6) % 6);

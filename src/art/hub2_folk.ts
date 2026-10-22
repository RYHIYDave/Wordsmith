// ACT 2'S TOWN HUB, THE CAMP INSIDE THE GATE: ITS PEOPLE (the art chat's, 22 Oct 2026). A MOCK-UP: NOTHING OF THE GAME
// IMPORTS THIS FILE; it is behind HUB2 (art/hub2.ts), off.
//
// His picks for the camp's people (22 Oct, one pop-up): who, “The Hushed, voices back (Recommended)” (offered as: floor
// 11's porter, goodwife and baker as they were before the Hush: colour in their faces, talking); what they do, “Talking
// round the fire (Recommended)” (offered as: sitting on the logs, warming their hands, chatting); and whether they notice
// the hero, “No, they keep to themselves”.
//
// So the three of art/hushed.ts, painted with HUSH_FREED on (the colour back in their faces and hands, their eyes their
// own, no Hush leaking out of them, no ink on them), and no edge of light round them (his rulebook, Pixels 5:
// "Townsfolk have none"). Each sits on a log by the cooking fire (art/hub2.ts, a log to sit on), leaning in to it, their
// hands held out to its warmth; they talk in turn, the one speaking turning to the others and putting a hand out as they
// talk, the others turning to listen; a laugh now and then. A round of TALK_LONG seconds, each their own part of it.

import type { Sprite } from '../engine/px';
import { HUSHED_BODY, HUSHED_CANVAS, HUSHED_REST, HUSH_FREED } from './hushed';
import type { HushedWho } from './hushed';
import { HUSHED_BAKER, HUSHED_GOODWIFE, HUSHED_PORTER } from './hushed_moves';
import { toSprite } from './kit';
import { paintMob } from './new_mobs3';
import type { Mob } from './new_mobs3';
import type { GameView } from './skin';
import type { Bones, Key3, Motion } from './skeleton';

const fr = (t: number): number => t - Math.floor(t);
const B = HUSHED_BODY;

/** How long the talk takes to come round: each of the three speaks a third of it. */
export const TALK_LONG = 6.0;
/** How many pictures a round, and at how many a second (the town's people stand at 10). */
export const TALK_FRAMES = 60;
export const TALK_FPS = 10;

/** How high a log's top is (art/hub2.ts logSeat: its radius, in the figure's own lengths, a game pixel each), where they sit. */
const SEAT = 9.5;

/**
 * SAT ON A LOG: the pelvis down so that the seat of them is on the log's top, the thighs out level over it, the shins
 * down to the feet on the setts before it; upright, leaning in a little to the fire, the hands held out to it. Their
 * rest for this, the slack of the Hush gone out of them.
 */
const hipH = B.ankle + B.shank + B.thigh;
export const SIT_REST: Bones = {
  ...HUSHED_REST,
  pz: SEAT + 2.4 - hipH,
  pitch: 2,
  bend: 9,
  roll: 0,
  side: 0,
  faceUp: 4,
  faceTilt: 0,
  faceTurn: 0,
  lfx: B.thigh * 0.95, lfy: 3.2, lfz: 0, lft: 12, lk: 9,
  rfx: B.thigh * 0.95, rfy: -3.2, rfz: 0, rft: -12, rk: -9,
  lhIn: 1, lhx: 11.5, lhy: 4.2, lhz: -11,
  rhIn: 1, rhx: 11.5, rhy: -4.2, rhz: -11,
  le: -12, re: 12,
};

/** Whose turn it is to speak `u` round into the talk (0..1): the porter, the goodwife, the baker. */
const SPEAKER: readonly HushedWho[] = ['porter', 'goodwife', 'baker'];
function speaking(who: HushedWho, u: number): number {
  // (each speaks a third; a soft start and end to it)
  const k = SPEAKER.indexOf(who);
  const v = fr(u - k / 3) * 3;
  if (v >= 1) return 0;
  return Math.sin(v * Math.PI) ** 0.6;
}
/** Which way each looks to the one speaking: + to their left, - to their right (as they sit round the fire). */
const LOOK_TO: Record<HushedWho, Record<HushedWho, number>> = {
  // (the porter on the log behind the fire, facing the eye; the goodwife on its left, the baker across it from her)
  porter: { porter: 0, goodwife: 25, baker: -25 },
  goodwife: { porter: -30, goodwife: 0, baker: 5 },
  baker: { porter: 30, goodwife: -5, baker: 0 },
};

/** THE TALK, sat on a log by the fire: a round of TALK_LONG seconds. */
function talk(who: HushedWho): Motion {
  const R = SIT_REST;
  const N = TALK_FRAMES;
  const keys: Key3[] = [];
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * TALK_LONG;
    const u = t / TALK_LONG;
    const a = u * Math.PI * 2;
    const breath = Math.sin(a * 6);
    const me = speaking(who, u);
    // whom they look at: the one speaking, or (while they speak) each of the others in turn
    let look = 0;
    for (const o of SPEAKER) if (o !== who) look += LOOK_TO[who][o] * speaking(o, u);
    if (me > 0) look = LOOK_TO[who][SPEAKER[(SPEAKER.indexOf(who) + 1) % 3]] * Math.sin(u * Math.PI * 6) * 0.8;
    // while they speak: the right hand out, turning over as they make their point; a nod
    const gesture = me * (0.6 + 0.4 * Math.sin(a * 9));
    // a laugh at the end of each one's turn: the shoulders up and down, the head back
    const endOf = fr(u * 3);
    const laugh = endOf > 0.92 ? Math.sin(((endOf - 0.92) / 0.08) * Math.PI) : 0;
    keys.push({
      at: t,
      ease: 'lin',
      pose: {
        pz: R.pz + 0.25 * breath + 0.4 * laugh,
        bend: R.bend - 1.2 * breath - 4 * laugh + 2.5 * me,
        twist: look * 0.25,
        faceTurn: look,
        faceUp: R.faceUp + 3 * Math.sin(a * 3 + 1) + 10 * laugh + 4 * me * Math.sin(a * 12),
        faceTilt: 4 * Math.sin(a * 2 + 0.5),
        // the left hand held out to the fire; the right with it, or out as they talk
        lhx: R.lhx + 0.6 * Math.sin(a * 4),
        lhz: R.lhz + 0.5 * breath,
        rhx: R.rhx - 3 * gesture,
        rhy: R.rhy - 3 * gesture,
        rhz: R.rhz + 9 * gesture + 0.5 * breath,
      },
    });
  }
  return { loop: 0, keys };
}
/** Their mouth: talking while it is their turn (a word or two a beat), a laugh, shut while they listen. */
function talkJaw(who: HushedWho): (t: number) => number {
  return (t) => {
    const u = fr(t / TALK_LONG);
    const me = speaking(who, u);
    const endOf = fr(u * 3);
    const laugh = endOf > 0.92 ? 0.7 : 0;
    return Math.max(laugh, me * (0.25 + 0.35 * Math.max(0, Math.sin(t * 13 + SPEAKER.indexOf(who)))));
  };
}

/** One of them, sat by the fire talking: the Hushed's figure with its stand made this. */
function campMob(base: Mob, who: HushedWho): Mob {
  return {
    ...base,
    id: `vellum-${who}`,
    name: who === 'porter' ? 'A porter of Vellum' : who === 'goodwife' ? 'A goodwife of Vellum' : 'A baker of Vellum',
    stand: { name: 'Talking round the fire', motion: talk(who), rest: SIT_REST, jaw: talkJaw(who) },
    idleFrames: TALK_FRAMES,
    idleFps: TALK_FPS,
    grains: undefined,
  };
}
export const CAMP_FOLK: Record<HushedWho, Mob> = {
  porter: campMob(HUSHED_PORTER, 'porter'),
  goodwife: campMob(HUSHED_GOODWIFE, 'goodwife'),
  baker: campMob(HUSHED_BAKER, 'baker'),
};

/** One of them at `t` seconds into the talk, from in front or behind, as the game holds a picture: their voices back, no edge of light. */
export function campFolkFrame(who: HushedWho, t: number, view: GameView): Sprite {
  HUSH_FREED.on = true;
  try {
    return toSprite(paintMob(CAMP_FOLK[who], 'stand', t, view, null), null, HUSHED_CANVAS.ax, HUSHED_CANVAS.ay);
  } finally {
    HUSH_FREED.on = false;
  }
}

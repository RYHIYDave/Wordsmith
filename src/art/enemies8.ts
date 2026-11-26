// THE EIGHT WEAKEST ENEMIES MADE LIVELIER (the main chat, 26 Nov 2026). The owner's words: “Next Find the 8 weakest enemies
// and work on them. Weakest in terms of their animations and look.”; asked whether these were the eight, his pick “Yes, these 8
// (Recommended)”: the skeleton marksman, the cultist, the cult priest, the shade, the skeleton archer, the skeleton, the swan
// and the scribe. What each was promised: a real walk (steps, robes swaying), a livelier stance and attack, a proper fall, and
// sharper detail.
//
// PICTURES FIRST (his standing rule): all of it is behind ENEMIES8, off, until he has seen the pictures and said yes; while it
// is off every one of them is exactly as it was. (The skeleton and the bone archer are made new by their own switches,
// SKELETON3 and ARCHER3, art/bestiary.ts: the skeletons on the heroes' bones, now with the crawl out of the ground and the
// arrow rain that today's have.)
//
// This file holds the switch and the poses of the two that are painted by the old rig (art/monster_cultist.ts: the cultist and
// the high priest), so that it imports nothing that imports it. How the rig reads a pose: monster_cultist.ts, "The rig".

import type { Pose } from './kit';

/** THE SWITCH, OFF until his yes to the pictures. */
export const ENEMIES8 = { on: false };

const TAU = Math.PI * 2;

/**
 * THE CULTIST STANDING (twelve poses at ten a second, as the kit's standing loop): it breathes, its shoulders rising and
 * sinking; it sways a little from foot to foot under the robe, the hem stirring after it; the flame in its hand gutters and
 * swells, the hand rising and falling with it; the knife hand turns the blade.
 */
export const CULT_IDLE: Partial<Pose>[] = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * TAU;
  return {
    wind: i / 12,
    bob: Math.sin(a) > 0.25 ? 1 : 0,
    lean: Math.round(Math.sin(a + 0.6) * 1.2),
    swing: 0.6 * Math.sin(a - 0.5),
    hx: Math.round(Math.sin(a * 2) * 0.8),
    hy: Math.round(Math.sin(a) * 1.4),
    act: 1 + 0.22 * Math.sin(a * 3),
    off: 0.15 * Math.sin(a),
    drag: 0.3,
  };
});

/**
 * THE CULTIST'S WALK (eight poses): real steps under the robe. Each foot comes out in turn and carries the hem with it, its toe
 * showing; the body dips onto each step and rises as the other foot passes, leaning into its way; the hem swings wide from side
 * to side, the knife arm swinging against the steps, the flame streaming back and bobbing with the stride.
 */
export const CULT_WALK: Partial<Pose>[] = Array.from({ length: 8 }, (_, i) => {
  const a = (i / 8) * TAU;
  const BOB = [2, 1, 0, 1, 2, 1, 0, 1];
  const LEAN = [1, 1, 2, 2, 1, 1, 2, 2];
  return {
    near: -Math.cos(a) * 1.5,
    nearLift: Math.max(0, Math.sin(a)) * 1.2,
    far: Math.cos(a) * 1.5,
    farLift: Math.max(0, -Math.sin(a)) * 1.2,
    bob: BOB[i],
    lean: LEAN[i],
    swing: Math.cos(a) * 2,
    hx: Math.round(-Math.cos(a) * 1.2),
    hy: BOB[i] - 1,
    off: -0.4 * Math.cos(a),
    wind: ((i / 8) * 2) % 1,
    drag: 1.7,
  };
});

/**
 * THE HIGH PRIEST STANDING: still, as a priest is, but alive: his chest rising and sinking, the censer swinging slowly on its
 * chain from the crook of his staff, smoke trailing after it, the fire in his other hand breathing with him.
 */
export const PRIEST_IDLE: Partial<Pose>[] = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * TAU;
  return {
    wind: i / 12,
    bob: Math.sin(a) > 0.25 ? 1 : 0,
    lean: Math.round(Math.sin(a + 0.6) * 0.7),
    swing: 0.4 * Math.sin(a - 0.5),
    hy: Math.round(Math.sin(a) * 1.0),
    act: 1 + 0.15 * Math.sin(a * 2),
    ohy: -1.5,
    gale: 16 * Math.sin(a),
    drag: 0.3,
  };
});

/**
 * HIS WALK, STILL A SLOW PROCESSION (his pick, 9 Oct, by 14:41: “A slow procession (Recommended)”), but one that can be seen:
 * each step comes out under the robe and carries the hem forward; he sinks a little onto each and sways with them; the censer
 * swings wider with his steps, the smoke trailing.
 */
export const PRIEST_WALK: Partial<Pose>[] = Array.from({ length: 8 }, (_, i) => {
  const a = (i / 8) * TAU;
  return {
    near: -Math.cos(a) * 1.0,
    nearLift: Math.max(0, Math.sin(a)) * 0.7,
    far: Math.cos(a) * 1.0,
    farLift: Math.max(0, -Math.sin(a)) * 0.7,
    bob: i % 4 === 0 ? 1 : 0,
    lean: Math.round(Math.sin(a) * 0.8),
    swing: Math.cos(a) * 1.1,
    wind: ((i / 8) * 2) % 1,
    drag: 0.8,
    ohy: -1.5,
    gale: 34 * Math.sin(a - 0.9),
  };
});

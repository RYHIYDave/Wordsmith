// THE WORLD'S SOUNDS IN PLAY (the sound chat's fourth batch, 7 Nov 2026: his “Even the scene stuff like the wordsmith altar powering
// up or the armorer hammering his anvil in town. Or the owl in the rafters”; “Footsteps yes”; “All good, hand over (Recommended)”;
// the Hush floors “Thin and muffled (Recommended)”). What is heard where: the ground underfoot by the floor; which loops go round
// and how loud (by nearness); whether a floor is one of the Hush's. engine/audio.ts plays them (footstep, setLoops, setMuffled,
// worldSound); main.ts asks these each frame.

import type { Ground } from '../engine/audio';
import { isCamp } from './camp';
import { doorMiddle } from './doors';
import type { Game } from './game';
import { CRANK_TIMES } from './quests15';
import { FURNACE_LOOP, PILLAR_LOOP, bedOf } from './scene_sounds';

/** The switch: off, none of the world's sounds is played (the scene's sounds made in code play as before). */
export const WORLD_SOUNDS = { on: true };

/** The ground underfoot on each floor (the sound chat's list): the prison and the city stone, the Quarry's roads gravel, the woods and gardens earth, the Fen and the Undercity water, the mill, the wards and the library boards, the Masque and the Gallery carpet. */
export const GROUND_OF: Readonly<Record<number, Ground>> = {
  1: 'stone', 2: 'stone', 3: 'stone', 4: 'stone', 5: 'stone',
  6: 'gravel', 7: 'gravel', 8: 'gravel', 9: 'earth', 10: 'water',
  11: 'stone', 12: 'water', 13: 'wood', 14: 'wood', 15: 'wood',
  16: 'earth', 17: 'carpet', 18: 'carpet', 19: 'stone', 20: 'stone',
};

/** Where the hero stands: the town's stone, or his floor's ground. */
export function groundOf(g: Game): Ground {
  if (g.level.town) return 'stone';
  return GROUND_OF[g.level.floor.depth] ?? 'stone';
}

/** A step each this many seconds at a walk (the sound chat's try-out: 0.42 s; in water 0.55), quicker as he goes faster. */
export const STEP_EVERY = { at: 0.42, water: 0.55, pace: 3.2 };

/** THE HUSH FLOORS, 11 to 15: the world heard thin and muffled there. */
export function hushFloor(g: Game): boolean {
  const d = g.level.floor.depth;
  return !g.level.town && d >= 11 && d <= 15;
}

/** How loud a sound at `d` tiles away is heard: full within `near`, nothing past `far`. */
export function byNearness(d: number, near: number, far: number): number {
  if (d <= near) return 1;
  if (d >= far) return 0;
  return 1 - (d - near) / (far - near);
}

/** The loops wanted now and how loud: the fires near him, the water on the wet floors, the ring's hum, the hall's and the camp's air; the floor's own background, its furnace, its burning pillars. */
export function loopWants(g: Game, castleHall: boolean): Record<string, number> {
  const L = g.level;
  const h = g.hero;
  const out: Record<string, number> = {};
  const near = (x: number, y: number): number => Math.hypot(x - h.x, y - h.y);
  // (the braziers, cressets and candles of the floor: the nearest heard)
  let fire = 0;
  for (const p of L.props) if (p.kind === 'brazier' && p.state !== 1) fire = Math.max(fire, byNearness(near(p.x, p.y), 1.5, 7));
  if (fire > 0) out.fire_small = 0.55 * fire;
  if (L.town) {
    for (const st of L.stations) {
      if (st.kind === 'armourer') out.fire_big = 0.5 * byNearness(near(st.x, st.y), 2, 9);
      if (st.kind === 'wordsmith') out.ring_hum = 0.55 * byNearness(near(st.x, st.y), 2.5, 10);
    }
    // (the Shaft's Rim, the Endless town, is no hall: its own sounds are the sound chat's to make, docs/endless_town_build.md)
    if (castleHall && !L.rim) out.bed_hall = 0.45;
  }
  if (isCamp(L)) out.bed_camp = 0.45;
  const d = L.floor.depth;
  if (!L.town && (d === 10 || d === 12 || d === 13)) out.water = 0.35;
  if (!L.town) {
    // (THE FLOORS' BACKGROUNDS, the sound chat's eighth batch, 9 Nov 2026: one loop a floor, under all of it; mixed quiet, so
    // played at full volume; one floor's at a time, the last floor's fading as this one's comes: engine/audio.ts setLoops)
    const bed = bedOf(d);
    if (bed) out[bed] = 1;
    // (floor 3: the Stoker's furnace, near it while it burns: until the crank's turn is done, and then it dies: `furnace_out`)
    const F = L.furnace;
    if (bed && F && (!F.out || (F.turnedAt !== undefined && F.turnedAt >= 0 && g.time - F.turnedAt < CRANK_TIMES.turn))) {
      const at = F.spot ? doorMiddle(F.spot) : F.crank;
      const v = FURNACE_LOOP.vol * byNearness(near(at.x, at.y), FURNACE_LOOP.near, FURNACE_LOOP.far);
      if (v > 0) out.furnace = v;
    }
    // (floor 10: the Colossus's pillars, the siege magic of his phase 3: near each while it burns, the nearest heard)
    let pillar = 0;
    if (bed) for (const p of L.pillars ?? []) if (p.lit) pillar = Math.max(pillar, byNearness(near(p.x, p.y), PILLAR_LOOP.near, PILLAR_LOOP.far));
    if (pillar > 0) out.pillar_fire = PILLAR_LOOP.vol * pillar;
  }
  return out;
}

/** The town's people's sounds, at the start of what each does now and then (render/render.ts hears them as it draws them). */
export const FOLK_SOUND: Readonly<Record<string, string>> = {
  armourer: 'anvil',
  mystic: 'crystal',
  wordsmith: 'rune_write',
  stranger: 'coin',
};
/** The owl's hoot, now and then: once in this many seconds, at random between. */
export const OWL_HOOT = { from: 20, to: 40 };

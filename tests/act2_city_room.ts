// ACT 2, THE HUSH: WHAT THE TESTS OF FLOOR 11'S FOUR (the city's own: tests/act2_hushed.test.ts, act2_watch, act2_scribe,
// act2_hound) SHARE, beside the descent's kinds' room (tests/act1_kinds_room_c.ts, whose room, watching and long fight they
// use). Not a test file: `tsx --test tests/*.test.ts` does not pick it up.
//   - the Hush's switch on for a while (ACT2, game/act1.ts: off until his yes), put back after;
//   - a long fight with a pack of a kind on a floor of the Hush, the switch on;
//   - what of the game is the same with the switch off: no floor 11 to 15 laid as the Hush's, none of its kinds in a pack
//     of the old floors.

import { RNG } from '../src/engine/rng';
import { ACT2, act1Floor } from '../src/game/act1';
import { act1Pack } from '../src/game/act1_mobs';
import type { MonsterKind } from '../src/game/types';
import { longFight } from './act1_kinds_room_c';

/** Runs `fn` with the Hush switched on (as __dbg.act2 does), and puts the switch back however it ends. */
export function hush<T>(fn: () => T): T {
  const was = ACT2.on;
  ACT2.on = true;
  try {
    return fn();
  } finally {
    ACT2.on = was;
  }
}

/** A long fight with a pack of `kind` as floor `depth` of the Hush lays one (tests/act1_kinds_room_c.ts longFight), the Hush on. */
export function cityFight(kind: MonsterKind, depth: number, secs: number, seed = 3): ReturnType<typeof longFight> {
  return hush(() => longFight(kind, depth, secs, seed));
}

/** With the Hush off: is `kind` in none of the packs of floors 1 to 15 (and are floors 11 to 15 not the Hush's)? Returns what was found against it. */
export function offTheFloors(kind: MonsterKind): string[] {
  const found: string[] = [];
  if (ACT2.on) found.push('the switch is on');
  for (let d = 11; d <= 15; d++) if (act1Floor(d)) found.push(`floor ${d} is laid as open ground`);
  const rng = new RNG(11);
  for (let d = 6; d <= 15; d++) {
    for (let i = 0; i < 200; i++) {
      for (const tier of ['normal', 'elite', 'champion'] as const) {
        const p = act1Pack(d, rng, tier);
        if (p.kind === kind) found.push(`a pack of it on floor ${d}`);
      }
    }
  }
  return found;
}

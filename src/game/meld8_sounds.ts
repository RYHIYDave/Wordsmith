// THE EIGHT MELDS' SOUNDS: the sound chat's TWELFTH BATCH (assets/sound/README.md, "Twelfth batch: the eight melds' sounds"). His
// ask in the sound chat, 12 Nov 2026, 20:18 Eastern: “Need sounds for the new melds.  It's in the queue”; shown them on try-out 17,
// the art chat's film of the eight at work with each sound on its event: “All good, hand over (Recommended)”. 20 sounds, two takes
// each (<name>_1, _2), each begun with its look's event (`{ t: 'meld8' }`, game/game.ts meld8Struck and the rest): its big moment
// is built in on the look's own beat, so nothing is delayed. Played by the rules as the event is sent (game/game.ts emit), through
// the world's bus (engine/audio.ts worldSound); fetched as a meld comes into his abilities (main.ts warmWords), a pack of their own
// (tools/sound_packs.mjs).

import type { MeldId } from './types';

/** The switch: off, the eight melds make no sound of their own (as before 25.3.17). */
export const MELD8_SOUNDS = { on: true };

/** Each meld's sound, by its id; Sunder's blow on one sundered and Fervor's fifth kill have their own. */
export const MELD8_SOUND: Readonly<Record<string, string>> = {
  siphon: 'meld_siphon',
  cauterize: 'meld_cauterize',
  forking: 'meld_forking',
  shiver: 'meld_shiver',
  sunder: 'meld_sunder',
  fervor: 'meld_fervor',
  rimeward: 'meld_rimeward',
  implode: 'meld_implode',
};
export const SUNDER_HIT = 'meld_sunder_hit';
export const FERVOR_FLARE = 'meld_fervor_flare';

/** How loud: in front at 1; behind (the event's `k` under 1) at this, as try-out 17 plays them. */
export const MELD8_BEHIND_VOL = 0.6;
/**
 * The least time between two of a sound, seconds. Siphon comes on every tick of his poison and Forking on every hit: at most one
 * Siphon each 0.5 s and four Forkings a second (the sound chat's); the rest come seldom enough as they are.
 */
export const MELD8_GAP: Readonly<Record<string, number>> = { meld_siphon: 0.5, meld_forking: 0.25 };
export const MELD8_GAP_ELSE = 0.06;

interface Meld8Moment {
  id: MeldId | string;
  what?: 'hit';
  k?: number;
  n?: number;
  most?: number;
}

/** The sound of a meld's moment (its name, how loud, the least time since the last of it), or null for a meld that has none. */
export function meld8SoundOf(e: Meld8Moment): { name: string; vol: number; gap: number } | null {
  let name = MELD8_SOUND[e.id as string];
  if (!name || !Object.prototype.hasOwnProperty.call(MELD8_SOUND, e.id)) return null;
  if (e.id === 'sunder' && e.what === 'hit') name = SUNDER_HIT;
  else if (e.id === 'fervor' && e.n !== undefined && e.most !== undefined && e.n >= e.most) name = FERVOR_FLARE;
  const vol = e.k !== undefined && e.k < 1 ? MELD8_BEHIND_VOL : 1;
  return { name, vol, gap: MELD8_GAP[name] ?? MELD8_GAP_ELSE };
}

/** The sounds of these melds, for fetching them as they come into his abilities (main.ts warmWords). */
export function meld8SoundsOf(ids: Iterable<string>): string[] {
  const out: string[] = [];
  for (const id of ids) {
    if (!Object.prototype.hasOwnProperty.call(MELD8_SOUND, id)) continue;
    out.push(MELD8_SOUND[id]);
    if (id === 'sunder') out.push(SUNDER_HIT);
    if (id === 'fervor') out.push(FERVOR_FLARE);
  }
  return [...new Set(out)].sort();
}

/** Every one of them (the twelfth batch's ten names). */
export const MELD8_SOUND_NAMES: readonly string[] = meld8SoundsOf(Object.keys(MELD8_SOUND));

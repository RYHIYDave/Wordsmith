// THE ONE RELEASE, ALL OF IT. Asked, 2 Nov 2026, whether the three new characters should wait for the release after this one, to go
// live with the High City (his pick of 29 Oct, “Release with the floors”), he asked “Why aren’t the high city levels in this
// release?”; told that pick ties them, and asked how he wants it, his answer: “All of it in this one” (offered as: floors and
// characters together now; this release waits until the characters are locked in). So THE HIGH CITY, floors 16 to 20 (game/act1.ts
// HIGH_CITY, its Hush with it, ACT2), is put on here as the game starts (main.ts, before the game or its painter's worker runs),
// as the first five floors' looks are (game/floor_looks.ts). The characters and the ranger's companions are read as their files
// load, so the game's builds switch them on as it is bundled (tools/lib.mjs RELEASE_DEFINES). The unit tests, which do not start
// the game, see each as its own file has it.
import { ACT2, HIGH_CITY } from './act1';

/** His word: on. */
export const ALL_OF_IT = { on: true };
/** Put the High City on (or off). */
export function useAllOfIt(on: boolean): void {
  HIGH_CITY.on = on;
  if (on) ACT2.on = true;
}

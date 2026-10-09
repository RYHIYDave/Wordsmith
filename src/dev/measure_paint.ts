// Dev page: HOW LONG A HERO'S FRAMES TAKE TO PAINT, the first heroes' (art/heroes.ts) and the ones
// painted over the bones (art/heroes3.ts). Each frame of a hero is painted the first time it is
// shown, or ahead of need a few thousandths of a second at a time (Renderer.heroArt): a frame
// that takes long to paint is a pause in the game the first time it is seen.
//   node tools/preview.mjs src/dev/measure_paint.ts shots/measure.png 100 100 "warrior"
//   (hash "ranger!ranger": with the ranger's new stances and moves on, art/moves3.ts RANGER_STANCES; on anyway since Version 19.4)
import { makeHeroArt } from '../art/heroes';
import type { HeroArt, HeroLook } from '../art/heroes';
import { makeHeroArt3 } from '../art/heroes3';
import { useRangerStances } from '../art/moves3';
import type { ClassId } from '../game/types';

let asked = decodeURIComponent(location.hash.slice(1));
if (asked.startsWith('ranger!')) {
  useRangerStances(true);
  asked = asked.slice('ranger!'.length);
}
const cls = (asked || 'warrior') as ClassId;

function measure(name: string, art: HeroArt, look: HeroLook): void {
  const times: number[] = [];
  for (let n = 0; n < 5000; n++) {
    const t0 = performance.now();
    if (!art.warm(cls, look)) break;
    times.push(performance.now() - t0);
  }
  times.sort((a, b) => a - b);
  const sum = times.reduce((a, b) => a + b, 0);
  const at = (k: number): string => (times[Math.min(times.length - 1, Math.floor(times.length * k))] ?? 0).toFixed(2);
  console.log(`${name} ${cls}: ${times.length} frames, ${sum.toFixed(0)} ms in all, mean ${(sum / Math.max(1, times.length)).toFixed(2)}, median ${at(0.5)}, 90th ${at(0.9)}, worst ${at(1)}`);
}

// (once each first, unmeasured, so that the browser has compiled the painters)
makeHeroArt().warm(cls, { twoHanded: cls === 'warrior' });
makeHeroArt3().warm(cls, { twoHanded: cls === 'warrior' });
measure('first heroes, dungeon', makeHeroArt(), { twoHanded: cls === 'warrior' });
measure('on the bones, dungeon', makeHeroArt3(), { twoHanded: cls === 'warrior' });
measure('on the bones, town   ', makeHeroArt3(), { twoHanded: cls === 'warrior', town: true });
(window as unknown as { __ready: boolean }).__ready = true;

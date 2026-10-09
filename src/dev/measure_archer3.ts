// Dev page: HOW LONG A FRAME OF THE BONE ARCHER TAKES TO PAINT, today's (art/monster_bones.ts) and the
// mock-up on the heroes' bones (art/monster_bones3.ts), with the skeleton on the bones and the knight
// on the bones (art/heroes3.ts) beside them for a measure. A frame is painted the first time it is shown, or ahead of need a few
// thousandths of a second at a time (Bestiary.warm, Renderer.heroArt): what is timed here is that
// first showing, as the game pays for it (painting, trimming, and putting it on a canvas).
//   node tools/preview.mjs src/dev/measure_archer3.ts shots/ar3/measure.png 900 300 "5"
//   hash = how many times to paint every frame afresh (each time with pictures made anew)
import type { ActorArt, AnimSet } from '../art/actor_types';
import { makeHeroArt3 } from '../art/heroes3';
import { makeArcherArt } from '../art/monster_bones';
import { makeArcherArt3, makeSkeletonArt3 } from '../art/monster_bones3';
import type { Sprite } from '../engine/px';

const rounds = Math.max(1, Number(decodeURIComponent(location.hash.slice(1))) || 5);
const lines: string[] = [];
const say = (s: string): void => {
  lines.push(s);
  console.log(s);
};

/** Every frame of a monster's art, each timed as it is first shown: [what, milliseconds][]. */
function timeAll(art: ActorArt): [string, number][] {
  const out: [string, number][] = [];
  for (const [view, set] of [['front', art.front], ['back', art.back]] as const) {
    const lists: [string, Sprite[]][] = [['standing', set.idle], ['walking', set.walk], ['attack', clipFrames(set, 'attack')], ['death', clipFrames(set, 'die')]];
    for (const [what, frames] of lists) {
      for (let i = 0; i < frames.length; i++) {
        const t0 = performance.now();
        // (reading a frame is what paints it: kit.ts, lazyFrames)
        const s = frames[i];
        out.push([what, performance.now() - t0]);
        if (!s) throw new Error(`no frame ${i} of ${what}, ${view}`);
      }
    }
  }
  return out;
}
function clipFrames(set: AnimSet, k: 'attack' | 'die'): Sprite[] {
  return set.clips?.[k]?.frames ?? [];
}

/** The knight's frames, timed one by one as the game paints them ahead of need. */
function timeKnight(): number[] {
  const art = makeHeroArt3();
  const out: number[] = [];
  for (let n = 0; n < 5000; n++) {
    const t0 = performance.now();
    if (!art.warm('warrior', { twoHanded: true })) break;
    out.push(performance.now() - t0);
  }
  return out;
}

const stats = (ms: number[]): string => {
  const s = [...ms].sort((a, b) => a - b);
  const sum = s.reduce((a, b) => a + b, 0);
  const at = (k: number): string => (s[Math.min(s.length - 1, Math.floor(s.length * k))] ?? 0).toFixed(2);
  return `${s.length} frames, mean ${(sum / Math.max(1, s.length)).toFixed(2)} ms, median ${at(0.5)}, 90th ${at(0.9)}, worst ${at(1)}`;
};

// (once each first, not counted, so that the browser has compiled the painters)
timeAll(makeArcherArt());
timeAll(makeArcherArt3());
timeAll(makeSkeletonArt3());
timeKnight();

const all: Record<string, number[]> = { today: [], bones: [], skeleton: [], knight: [] };
const byWhat: Record<string, Record<string, number[]>> = { today: {}, bones: {} };
for (let r = 0; r < rounds; r++) {
  for (const [name, make] of [['today', makeArcherArt], ['bones', makeArcherArt3]] as const) {
    for (const [what, ms] of timeAll(make())) {
      all[name].push(ms);
      (byWhat[name][what] ??= []).push(ms);
    }
  }
  for (const [, ms] of timeAll(makeSkeletonArt3())) all.skeleton.push(ms);
  all.knight.push(...timeKnight());
}
say(`painted every frame ${rounds} times over, each time afresh`);
say(`TODAY'S BONE ARCHER:  ${stats(all.today)}`);
for (const [what, ms] of Object.entries(byWhat.today)) say(`    ${what.padEnd(9)} ${stats(ms)}`);
say(`ON THE BONES:         ${stats(all.bones)}`);
for (const [what, ms] of Object.entries(byWhat.bones)) say(`    ${what.padEnd(9)} ${stats(ms)}`);
say(`THE SKELETON (bones): ${stats(all.skeleton)}`);
say(`THE KNIGHT (bones):   ${stats(all.knight)}`);

const pre = document.createElement('pre');
pre.textContent = lines.join('\n');
pre.style.color = '#e0d8f0';
pre.style.font = '14px monospace';
pre.style.padding = '10px';
document.body.style.overflow = 'auto';
document.body.appendChild(pre);
(window as unknown as { __ready: boolean }).__ready = true;

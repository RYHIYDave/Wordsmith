// Dev page: HOW LONG THE FIRST FIVE FLOORS' NEW ART TAKES TO PAINT, and how much room it takes.
//   node tools/preview.mjs src/dev/measure_first5.ts shots/measure.png 100 100 "mob:headsman"
//   hash = mob:<headsman|chained|chained1|chained2|amalgam|beast|fleshmancer|dagger|minifm>
//        | floor:<1..5>   the floor's pieces, then each of its moments
//        | stair:<1..5>   the stairwell's opening on that floor (way x, at 0,0)
//        | shaft          the mine shaft: still, the cage coming down, the ride up
// Every line it logs begins "measure".
import type { ActorArt, AnimSet } from '../art/actor_types';
import { makeAmalgamArt3, makeBoneBeastArt3, makeChainedArt3, makeHeadsmanArt3 } from '../art/bosses3';
import { CRYPT_FLOORS } from '../art/crypt';
import { makeDaggerCultistArt3, makeMiniFleshmancerArt3 } from '../art/cultists';
import { makeFleshmancerArt3 } from '../art/fleshmancer';
import { wardenMoments, wardenPieces } from '../art/floor1';
import { headsmanMoments, headsmanPieces } from '../art/floor2';
import { chainedMoments, chainedPieces } from '../art/floor3';
import { ossuaryMoment, ossuaryPieces } from '../art/floor4';
import { lairPieces } from '../art/floor5';
import { lairMoment } from '../art/floor5_moments';
import type { Moment, Piece } from '../art/floorkit';
import { LAIR } from '../art/lair';
import { cageDown, cageUp, shaftStill } from '../art/shaft';
import { stairwellOpens } from '../art/stairwell_open';
import type { Sprite } from '../engine/px';

const [what = 'mob', which = 'headsman'] = decodeURIComponent(location.hash.slice(1)).split(':');
const log = (s: string): void => console.log(`measure ${s}`);
const bytes = (s: Sprite): number => s.img.width * s.img.height * 4;
const mb = (n: number): string => (n / 1048576).toFixed(1);

function lists(set: AnimSet): [string, Sprite[]][] {
  const out: [string, Sprite[]][] = [['stand', set.idle], ['walk', set.walk]];
  if (set.clips?.attack) out.push(['attack', set.clips.attack.frames]);
  for (const [n, c] of Object.entries(set.clips?.moves ?? {})) out.push([`more.${n}`, c.frames]);
  if (set.clips?.reel) out.push(['reel', set.clips.reel.frames]);
  if (set.clips?.die) out.push(['die', set.clips.die.frames]);
  return out;
}

function measureMob(name: string, art: ActorArt): void {
  let all = 0;
  let room = 0;
  let count = 0;
  let worst = 0;
  for (const [view, set] of [['front', art.front], ['back', art.back]] as const) {
    for (const [n, frames] of lists(set)) {
      const t0 = performance.now();
      let b = 0;
      let w = 0;
      let big = [0, 0];
      for (let i = 0; i < frames.length; i++) {
        const t1 = performance.now();
        const s = frames[i];
        w = Math.max(w, performance.now() - t1);
        b += bytes(s);
        if (s.w * s.h > big[0] * big[1]) big = [s.w, s.h];
      }
      const ms = performance.now() - t0;
      all += ms;
      room += b;
      count += frames.length;
      worst = Math.max(worst, w);
      log(`${name} ${view} ${n}: ${frames.length} frames, ${ms.toFixed(0)} ms (${(ms / Math.max(1, frames.length)).toFixed(1)} each, worst ${w.toFixed(1)}), ${mb(b)} MB, biggest ${big[0]}x${big[1]} game px`);
    }
  }
  log(`${name} IN ALL: ${count} frames, ${all.toFixed(0)} ms, mean ${(all / count).toFixed(1)}, worst ${worst.toFixed(1)}, ${mb(room)} MB`);
}

function roomOf(m: Moment): number {
  let b = 0;
  const seen = new Set<Sprite>();
  const add = (list: Sprite[] | null | undefined): void => {
    for (const s of list ?? []) if (!seen.has(s)) { seen.add(s); b += bytes(s); }
  };
  add(m.frames);
  add(m.before);
  add(m.after);
  if (m.right) { add(m.right.frames); add(m.right.before); add(m.right.after); }
  return b;
}

function timed<T>(name: string, make: () => T, room: (v: T) => number, more: (v: T) => string = () => ''): T {
  const t0 = performance.now();
  const v = make();
  const ms = performance.now() - t0;
  log(`${name}: ${ms.toFixed(0)} ms, ${mb(room(v))} MB ${more(v)}`);
  return v;
}

const pieceRoom = (ps: Piece[]): number => {
  let b = 0;
  const seen = new Set<Sprite>();
  const add = (list: Sprite[] | undefined): void => {
    for (const s of list ?? []) if (!seen.has(s)) { seen.add(s); b += bytes(s); }
  };
  for (const p of ps) {
    add(p.frames); add(p.left); add(p.right);
    for (const sp of p.spots ?? []) { add(sp.left); add(sp.right); }
  }
  return b;
};

setTimeout(() => {
if (what === 'mob') {
  const art =
    which === 'headsman' ? makeHeadsmanArt3()
    : which === 'chained' ? makeChainedArt3(undefined, 0)
    : which === 'chained1' ? makeChainedArt3(undefined, 1)
    : which === 'chained2' ? makeChainedArt3(undefined, 2)
    : which === 'amalgam' ? makeAmalgamArt3()
    : which === 'beast' ? makeBoneBeastArt3()
    : which === 'fleshmancer' ? makeFleshmancerArt3()
    : which === 'dagger' ? makeDaggerCultistArt3()
    : makeMiniFleshmancerArt3();
  measureMob(which, art);
} else if (what === 'floor') {
  const k = Number(which) || 1;
  const pieces = timed(`floor ${k} pieces`, () => (k === 1 ? wardenPieces() : k === 2 ? headsmanPieces() : k === 3 ? chainedPieces() : k === 4 ? ossuaryPieces() : lairPieces()), pieceRoom, (v) => `${v.length} pieces`);
  void pieces;
  const info = (m: Moment): string => `"${m.name}" ${m.frames.length} frames at ${m.fps}, biggest ${Math.max(...m.frames.map((s) => s.w))}x${Math.max(...m.frames.map((s) => s.h))}, right ${m.right ? 'yes' : 'no'}`;
  if (k === 1) { const t0 = performance.now(); const ms = wardenMoments(); log(`floor 1 moments (all): ${(performance.now() - t0).toFixed(0)} ms, ${mb(ms.reduce((a, m) => a + roomOf(m), 0))} MB`); for (const m of ms) log(info(m)); }
  if (k === 2) { const t0 = performance.now(); const ms = headsmanMoments(); log(`floor 2 moments (all): ${(performance.now() - t0).toFixed(0)} ms, ${mb(ms.reduce((a, m) => a + roomOf(m), 0))} MB`); for (const m of ms) log(info(m)); }
  if (k === 3) { const t0 = performance.now(); const ms = chainedMoments(); log(`floor 3 moments (all): ${(performance.now() - t0).toFixed(0)} ms, ${mb(ms.reduce((a, m) => a + roomOf(m), 0))} MB`); for (const m of ms) log(info(m)); }
  if (k === 4) for (let n = 0; n < 3; n++) timed(`floor 4 moment ${n}`, () => ossuaryMoment(n), roomOf, info);
  if (k === 5) for (let n = 0; n < 3; n++) timed(`floor 5 moment ${n}`, () => lairMoment(n), roomOf, info);
} else if (what === 'stair') {
  const k = Number(which) || 1;
  const theme = k === 5 ? LAIR : CRYPT_FLOORS[k - 1];
  for (const way of ['x', 'y'] as const) timed(`stairwell opens, floor ${k}, way ${way}`, () => stairwellOpens(theme, way, [0, 0]), roomOf, (m) => `${m.frames.length} frames, biggest ${Math.max(...m.frames.map((s) => s.w))}x${Math.max(...m.frames.map((s) => s.h))}`);
} else {
  timed('shaft still', () => shaftStill(), (v) => bytes(v.empty) + bytes(v.down));
  timed('cage down', () => cageDown(), (v) => roomOf(v.m) + v.layers.back.reduce((a, s) => a + bytes(s), 0) + v.layers.front.reduce((a, s) => a + bytes(s), 0), (v) => `${v.m.frames.length} frames`);
  timed('cage up', () => cageUp(), (v) => roomOf(v.m) + v.layers.back.reduce((a, s) => a + bytes(s), 0) + v.layers.front.reduce((a, s) => a + bytes(s), 0), (v) => `${v.m.frames.length} frames`);
}
(window as unknown as { __ready: boolean }).__ready = true;
}, 50);

// THE NEW CLASSES' FRAMES, COUNTED, TIMED AND HASHED (the art chat's helper, 1 Nov 2026; docs/cheap_heroes.md).
//
// The owner, 31 Oct, of the Warlock: “He needs to be able to be played by anyone, what are we talking about”; the order:
// the Warlock, the Tinkerer and the Brawler each as cheap to paint as the Warrior, and HOW THEY LOOK NOT CHANGED. This
// lists every frame the game holds of each of them (every place, both views, every list of every set), and either times
// them as the main chat did (the median of 8 frames spread over a list, after its first) or paints them all and hashes
// each (its pixels, its size, its anchor, its lights, its pool of light, its tails, its charge), so that a frame painted
// before a change and after it can be proved the same.
//
//   npx tsx tools/cheap_heroes.ts measure <list>             a row of the cost table (warlock:demon/front.idle)
//   npx tsx tools/cheap_heroes.ts hash <out.json> [class...]  every frame's hash (and the time each list took), to a file
//   npx tsx tools/cheap_heroes.ts same <a.json> <b.json>      are two hash files the same, frame for frame?
//   npx tsx tools/cheap_heroes.ts check <a.json> [every] [class...]  every so many frames held against a hash file

// @ts-ignore - node typings are not part of this project
import { createHash } from 'node:crypto';
// @ts-ignore
import { readFileSync, writeFileSync } from 'node:fs';
import type { Sprite } from '../src/engine/px';
import type { ActorArt, AnimSet } from '../src/art/actor_types';
import { makeHeroArt3 } from '../src/art/heroes3';
import { lookOfPlace } from '../src/art/heroes';
import type { HeroPlace } from '../src/art/heroes';
import type { ClassId } from '../src/game/types';
import { golemCharge, makeContraptionArt, makeGolemArt } from '../src/art/tinkerer_art';
import { paintWithoutCanvas, paintingOf } from '../tests/helpers';
import { PAINTING } from '../src/art/kit';

paintWithoutCanvas();

declare const process: { argv: string[]; exit(code: number): never };

/** One list of frames: what it is, and its frames (painted when first read). */
export interface FrameList {
  name: string;
  frames: Sprite[];
}

/** Every list of frames in a set, by where it is in it (`idle`, `clips.attack`, `stops.0`...). */
function listsOfSet(set: AnimSet, prefix: string, out: FrameList[]): void {
  const walk = (v: unknown, name: string): void => {
    if (Array.isArray(v)) {
      if (v.length && typeof Object.getOwnPropertyDescriptor(v, 0)?.get === 'function') {
        out.push({ name, frames: v as Sprite[] });
        return;
      }
      if (v.length && v.every((x) => x && typeof x === 'object' && 'img' in (x as object))) {
        out.push({ name, frames: v as Sprite[] });
        return;
      }
      v.forEach((x, i) => walk(x, `${name}.${i}`));
      return;
    }
    if (v && typeof v === 'object') {
      if ('img' in (v as object)) return;
      for (const k of Object.keys(v as object)) walk((v as Record<string, unknown>)[k], name ? `${name}.${k}` : k);
    }
  };
  walk(set, prefix);
}
function listsOfArt(art: ActorArt | { front: unknown; back: unknown }, prefix: string): FrameList[] {
  const out: FrameList[] = [];
  listsOfSet(art.front as AnimSet, `${prefix}/front`, out);
  listsOfSet(art.back as AnimSet, `${prefix}/back`, out);
  return out;
}

export type Who = 'warrior' | 'warlock' | 'tinkerer' | 'brawler' | 'tinkerer-kit';
export const EVERYONE: Who[] = ['warrior', 'warlock', 'tinkerer', 'brawler', 'tinkerer-kit'];

/** Every list of frames of one of them, in every place the game shows them (one HeroArt for all, as the game has). */
export function listsOf(who: Who): FrameList[] {
  const art = makeHeroArt3();
  const of = (cls: ClassId, place: HeroPlace): FrameList[] => listsOfArt(art.of(cls, lookOfPlace(place)), `${cls}:${place}`);
  if (who === 'warrior') return of('warrior', 'dungeon');
  if (who === 'warlock') return [...of('warlock', 'dungeon'), ...of('warlock', 'blaze'), ...of('warlock', 'demon'), ...of('warlock', 'town'), ...of('warlock', 'card')];
  if (who === 'tinkerer') return [...of('tinkerer', 'dungeon'), ...of('tinkerer', 'card')];
  if (who === 'brawler') return [...of('brawler', 'dungeon'), ...of('brawler', 'card')];
  // (HER GOLEM AND HER CONTRAPTION: sculpted as she is, so kept the same as well)
  const out: FrameList[] = [];
  for (const gun of ['cannon', 'tesla', 'pincer'] as const) out.push(...listsOfArt(makeGolemArt(gun), `golem:${gun}`));
  for (const gun of ['cannon', 'tesla'] as const) for (const v of ['front', 'back'] as const) out.push({ name: `golem:${gun}/${v}/charge`, frames: golemCharge(v, gun) });
  for (const ammo of ['vials', 'bombs', 'energy'] as const) out.push(...listsOfArt(makeContraptionArt(ammo), `contraption:${ammo}`));
  return out;
}

/** A frame's hash: its pixels and everything the game reads of it. */
export function hashSprite(s: Sprite): string {
  const p = paintingOf(s);
  const h = createHash('sha256');
  const { img: _img, ...rest } = s;
  h.update(JSON.stringify({ ...rest, pw: p.w, ph: p.h }));
  h.update(p.d);
  return h.digest('hex').slice(0, 16);
}

const fmt = (ms: number): string => ms.toFixed(0);

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : NaN;
}

/** The main chat's measure: a list's first frame painted, then 8 spread over it, each timed; their median. */
export function measureList(l: FrameList): number {
  const n = l.frames.length;
  void l.frames[0];
  const ts: number[] = [];
  const picks = new Set<number>();
  for (let k = 0; k < 8; k++) picks.add(Math.min(n - 1, 1 + Math.floor((k * (n - 1)) / 8)));
  for (const i of picks) {
    if (i === 0) continue;
    const t0 = performance.now();
    void l.frames[i];
    ts.push(performance.now() - t0);
  }
  return median(ts);
}

function main(): void {
  const [mode, ...args] = process.argv.slice(2);
  if (mode === 'same') {
    const a = JSON.parse(readFileSync(args[0], 'utf8')) as { lists: Record<string, string[]> };
    const b = JSON.parse(readFileSync(args[1], 'utf8')) as { lists: Record<string, string[]> };
    let frames = 0;
    let bad = 0;
    for (const k of new Set([...Object.keys(a.lists), ...Object.keys(b.lists)])) {
      const x = a.lists[k];
      const y = b.lists[k];
      if (!x || !y) {
        if (x || y) console.log(`only in one: ${k}`);
        continue;
      }
      if (x.length !== y.length) console.log(`${k}: ${x.length} frames against ${y.length}`);
      for (let i = 0; i < Math.min(x.length, y.length); i++) {
        frames++;
        if (x[i] !== y[i]) {
          bad++;
          if (bad < 40) console.log(`${k}[${i}] differs`);
        }
      }
    }
    console.log(`${frames} frames compared, ${bad} differ`);
    process.exit(bad ? 1 : 0);
  }
  if (mode === 'measure') {
    // (one list, by its name, in a process of its own, as the main chat measured: `measure warlock:demon/front.idle`)
    const name = args[0];
    const w = name.split(':')[0] as Who;
    const t0 = performance.now();
    const l = listsOf(w === ('golem' as Who) || w === ('contraption' as Who) ? 'tinkerer-kit' : w).find((x) => x.name === name);
    if (!l) throw new Error(`no list ${name}`);
    const made = performance.now() - t0;
    console.log(`${name.padEnd(42)} ${String(l.frames.length).padStart(4)} frames  ${fmt(measureList(l)).padStart(5)} ms a frame  (its set made in ${fmt(made)} ms)`);
    return;
  }
  const who = (args.filter((a) => !a.endsWith('.json')) as Who[]).length ? (args.filter((a) => !a.endsWith('.json')) as Who[]) : EVERYONE;
  if (mode === 'hash') {
    const out = args.find((a) => a.endsWith('.json'));
    if (!out) throw new Error('hash: give a file to write');
    const res: { lists: Record<string, string[]>; ms: Record<string, number>; frames: Record<string, number>; painted: Record<string, number>; unique: Record<string, number> } = { lists: {}, ms: {}, frames: {}, painted: {}, unique: {} };
    for (const w of who) {
      const t0 = performance.now();
      const p0 = PAINTING.frames;
      let n = 0;
      // (every picture painted is a Sprite of its own: one frame shared by lists, or painted once for alike moments, is one)
      const own = new Set<Sprite>();
      const lists = listsOf(w);
      for (const l of lists) {
        const s0 = performance.now();
        res.lists[l.name] = l.frames.map((s) => {
          own.add(s);
          return hashSprite(s);
        });
        res.ms[l.name] = Math.round(performance.now() - s0);
        n += l.frames.length;
        writeFileSync(out, JSON.stringify(res, null, 0));
      }
      res.ms[`ALL ${w}`] = Math.round(performance.now() - t0);
      res.frames[w] = n;
      res.painted[w] = own.size;
      res.unique[w] = new Set(lists.flatMap((l) => res.lists[l.name])).size;
      console.log(`${w}: ${n} frames read, ${own.size} pictures painted (${PAINTING.frames - p0} frames made), ${res.unique[w]} different pictures, ${(res.ms[`ALL ${w}`] / 1000).toFixed(1)} s`);
      writeFileSync(out, JSON.stringify(res, null, 0));
    }
    return;
  }
  if (mode === 'check') {
    // (a quick look: every `every`-th frame of each list painted and held against a hash file made before)
    const ref = JSON.parse(readFileSync(args[0], 'utf8')) as { lists: Record<string, string[]> };
    const every = Number(args.find((a) => /^\d+$/.test(a)) ?? 7);
    const whom = (args.slice(1).filter((a) => !/^\d+$/.test(a)) as Who[]);
    let n = 0;
    let bad = 0;
    const t0 = performance.now();
    for (const w of whom.length ? whom : EVERYONE) {
      for (const l of listsOf(w)) {
        const want = ref.lists[l.name];
        if (!want) throw new Error(`no hashes for ${l.name}`);
        for (let i = 0; i < l.frames.length; i += every) {
          n++;
          if (hashSprite(l.frames[i]) !== want[i]) {
            bad++;
            console.log(`${l.name}[${i}] DIFFERS`);
          }
        }
      }
    }
    console.log(`${n} frames checked, ${bad} differ, ${((performance.now() - t0) / 1000).toFixed(1)} s`);
    process.exit(bad ? 1 : 0);
  }
  throw new Error(`no mode ${mode}`);
}

if (process.argv[1] && /tools[\\/]cheap_heroes\.ts$/.test(process.argv[1])) main();

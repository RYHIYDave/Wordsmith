// THE TINKERER'S AND THE BRAWLER'S FRAMES FROM EIGHT SIDES, COUNTED, WEIGHED AND CHECKED (the Tinkerer chat, 11 Nov 2026;
// docs/mockups/eight_sides/README.md), as tools/ranger_up_measure.ts does the Ranger's.
//
// Every frame the game holds of the hero in a dungeon (the Brawler's and the Tinkerer's set is one for a dungeon and town; a class
// card keeps its two sides), from the sides asked for, with art/sides_more.ts EIGHT_MORE on: how many lists and frames, how
// many different pictures, the memory they take decoded at the game's grain (4 bytes a picture pixel), about what they add to
// the download packed as picture files, how long each took to paint; and every frame whose picture touches the edge of the
// canvas it is painted on (it may be cut off there).
//
//   npx tsx tools/sides_more_measure.ts <tinkerer|brawler> [sides, comma-separated: all eight if not given] [out.json]
//   npx tsx tools/sides_more_measure.ts sum <a.json> <b.json> ...        the files of several runs added up, a line a side

// @ts-ignore - node typings are not part of this project
import { readFileSync, writeFileSync } from 'node:fs';
// @ts-ignore
import { deflateSync } from 'node:zlib';
import type { Sprite } from '../src/engine/px';
import { makeHeroArt3 } from '../src/art/heroes3';
import { lookOfPlace } from '../src/art/heroes';
import { GRAIN } from '../src/art/kit';
import { CANVAS3 } from '../src/art/skin';
import { EIGHT_MORE, MORE_SIDES } from '../src/art/sides_more';
import type { WuSide } from '../src/art/warrior_up';
import { VET_CANVAS } from '../src/dev/sculpt_veteran';
import { hashSprite } from './cheap_heroes';
import { paintWithoutCanvas, paintingOf } from '../tests/helpers';

declare const process: { argv: string[]; exit(code: number): never };

interface List {
  name: string;
  frames: Sprite[];
}
/** Every list of frames in a set, by where it is in it (as tools/cheap_heroes.ts walks them). */
function listsOfSet(set: unknown, prefix: string, out: List[]): void {
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

interface SideReport {
  side: string;
  lists: number;
  frames: number;
  held: number;
  pictures: number;
  memoryMB: number;
  packedMB: number;
  paintMs: number;
  msPerFrame: number;
  /** Frames whose picture touches an edge of its canvas: list, frame, which edges. */
  edges: string[];
}

/** The canvas a list of a hero's is painted on (picture pixels) and where the floor point is on it; null: not checked. */
function canvasOf(cls: string, list: string, s: Sprite): { w: number; h: number; ax: number; ay: number } | null {
  if (cls === 'brawler') {
    if (list.includes('vetFx')) return { w: 600, h: 460, ax: 300, ay: 300 };
    return VET_CANVAS;
  }
  // (the Tinkerer: the heroes' canvas; her blast jump's is taller by 80, its floor point as far lower)
  const tall = list.includes('leap') || list.includes('land') ? 80 : 0;
  void s;
  return { w: CANVAS3.w, h: CANVAS3.h + tall, ax: CANVAS3.ax, ay: CANVAS3.ay + tall };
}

function measure(cls: 'tinkerer' | 'brawler', sides: WuSide[]): SideReport[] {
  EIGHT_MORE.tinkerer = true;
  EIGHT_MORE.brawler = true;
  const art = makeHeroArt3().of(cls, lookOfPlace('dungeon')) as unknown as Record<string, unknown>;
  const out: SideReport[] = [];
  for (const side of sides) {
    const lists: List[] = [];
    listsOfSet(art[side], '', lists);
    const seen = new Set<Sprite>();
    const pictures = new Set<string>();
    const edges: string[] = [];
    let frames = 0;
    let bytes = 0;
    let packed = 0;
    let ms = 0;
    for (const l of lists) {
      for (let i = 0; i < l.frames.length; i++) {
        const before = performance.now();
        const s = l.frames[i];
        const took = performance.now() - before;
        frames++;
        if (!s || !s.img || s.w <= 0) continue;
        if (seen.has(s)) continue;
        seen.add(s);
        ms += took;
        const p = paintingOf(s);
        bytes += p.w * p.h * 4;
        packed += deflateSync(p.d, { level: 9 }).length + 60;
        pictures.add(hashSprite(s));
        const cv = canvasOf(cls, l.name, s);
        if (cv && p.w > GRAIN) {
          const x0 = Math.round(cv.ax - s.ax * GRAIN);
          const y0 = Math.round(cv.ay - s.ay * GRAIN);
          const hit = [x0 <= 0 ? 'left' : '', x0 + p.w >= cv.w ? 'right' : '', y0 <= 0 ? 'top' : '', y0 + p.h >= cv.h ? 'bottom' : ''].filter(Boolean);
          if (hit.length) edges.push(`${l.name}[${i}] ${hit.join('+')}`);
        }
      }
    }
    const r: SideReport = {
      side, lists: lists.length, frames, held: seen.size, pictures: pictures.size, memoryMB: +(bytes / 1024 / 1024).toFixed(2), packedMB: +(packed / 1024 / 1024).toFixed(3),
      paintMs: Math.round(ms), msPerFrame: +(ms / Math.max(1, seen.size)).toFixed(1), edges,
    };
    out.push(r);
    console.log(JSON.stringify({ ...r, edges: r.edges.length }));
  }
  return out;
}

function main(): void {
  const [what, a, b] = process.argv.slice(2);
  if (what === 'sum') {
    const all: SideReport[] = process.argv.slice(3).flatMap((f) => JSON.parse(readFileSync(f, 'utf8')) as SideReport[]);
    const tot = (k: 'lists' | 'frames' | 'held' | 'pictures' | 'memoryMB' | 'packedMB' | 'paintMs'): number => all.reduce((s, r) => s + r[k], 0);
    for (const r of all) console.log(`${r.side.padEnd(7)} ${r.lists} lists, ${r.frames} frames, ${r.held} held, ${r.memoryMB} MB, ${r.packedMB} MB packed, ${r.msPerFrame} ms a frame, ${r.edges.length} at an edge`);
    console.log(`ALL ${all.length} sides: ${tot('lists')} lists, ${tot('frames')} frames, ${tot('held')} held, ${tot('memoryMB').toFixed(1)} MB decoded, ${tot('packedMB').toFixed(2)} MB packed, ${(tot('paintMs') / 1000).toFixed(0)} s to paint`);
    for (const r of all) for (const e of r.edges) console.log(`  edge: ${r.side} ${e}`);
    return;
  }
  if (what !== 'tinkerer' && what !== 'brawler') {
    console.error('which hero: tinkerer or brawler');
    process.exit(1);
  }
  const sides = (a && !a.endsWith('.json') ? a.split(',') : [...MORE_SIDES]) as WuSide[];
  const outFile = a && a.endsWith('.json') ? a : b;
  paintWithoutCanvas();
  const r = measure(what, sides);
  if (outFile) writeFileSync(outFile, JSON.stringify(r));
}

main();

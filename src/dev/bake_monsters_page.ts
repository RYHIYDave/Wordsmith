// THE FLOORS' MONSTERS BAKED, the page the bake runs in (tools/bake_monsters.mjs; render/monsters_baked.ts says why). It paints
// every frame of ONE figure, in the order the game wants them (art/bestiary.ts paintOrder: the places the painter's worker
// gives its frames into), each once (a frame the same as one already painted is kept once), lays them on sheets in that order,
// and hands the tool each sheet's pixels and where each frame goes. A FRESH PAGE FOR EVERY FIGURE (the tool's): what one figure
// made is given back whole as its page is closed, and nothing of one is in another's pictures. In the manner of the heroes' and
// the town's people's bake pages (src/dev/bake_heroes_page.ts, bake_townsfolk_page.ts), which are not touched: their marks,
// and so their bakes, stay as they are.

import { framesOf, makeBestiary, paintOrder } from '../art/bestiary';
import type { MonsterFigure } from '../art/bestiary';
import type { Sprite } from '../engine/px';
import { HOLD_MOST_MB, bakedFigures, figureLens } from '../render/monsters_bake_list';
import type { MonsterBakeFile } from '../render/monsters_bake_list';
import { ALL_OF_IT, useAllOfIt } from '../game/all_of_it';
import { ENEMY_MOVES, useEnemyMoves } from '../game/enemy_moves';
import { FLOOR_LOOKS, useFloorLooks } from '../game/floor_looks';

/** A sheet's widest and tallest (a phone takes a picture this big in at once without trouble). */
const SHEET = 2048;

// THE SWITCHES THE GAME PUTS ON AS IT STARTS (the last lines of main.ts, before the game or its painter's worker runs), THE SAME,
// IN THE SAME WORDS, before any picture is made: the monsters are painted here as the game has them. One put on there and not
// here would leave the baked monsters as they were without it (tests/monsters_baked.test.ts holds the two to each other).
useEnemyMoves(ENEMY_MOVES.on);
useFloorLooks(FLOOR_LOOKS.on);
useAllOfIt(ALL_OF_IT.on);
const bestiary = makeBestiary();

type Made = { file: Omit<MonsterBakeFile, 'mark' | 'sheets' | 'figure'> & { sheets: { w: number; h: number }[] }; canvases: HTMLCanvasElement[]; sources: HTMLCanvasElement[] };
let made: Made | null = null;

function hashOf(data: Uint8ClampedArray, w: number, h: number, other: string): string {
  let a = 0x811c9dc5 ^ w;
  let b = 0x9747b28c ^ h;
  const u = new Uint32Array(data.buffer, data.byteOffset, data.byteLength >> 2);
  for (let i = 0; i < u.length; i++) {
    a = Math.imul(a ^ u[i], 0x01000193);
    b = Math.imul(b ^ u[i], 0x5bd1e995) ^ (b >>> 13);
  }
  for (let i = 0; i < other.length; i++) a = Math.imul(a ^ other.charCodeAt(i), 0x01000193);
  return `${w}x${h}:${(a >>> 0).toString(16)}:${(b >>> 0).toString(16)}:${other.length}`;
}

/**
 * Bake one figure: paints it, lays it out, keeps its sheets for `sheet`. What can be said of it, for the tool: its frames (each
 * once), the places they go, the places with no picture (`empty`), its sheets, the parts of a frame that cannot be kept, how
 * long the painting took, how many pixels it is in hand, and the biggest frame.
 */
function figure(name: MonsterFigure): { frames: number; places: number; empty: number; sheets: { w: number; h: number }[]; dropped: string[]; ms: number; px: number; big: [number, number] } {
  const t0 = performance.now();
  const art = bestiary.of(name);
  const lists = [framesOf(art.front), framesOf(art.back)];
  const bySprite = new Map<Sprite, number>();
  const byHash = new Map<string, number>();
  const frames: { s: Sprite; parts: number }[] = [];
  const parts: Omit<Sprite, 'img'>[] = [];
  const partsOf = new Map<string, number>();
  const dropped = new Set<string>();
  const at: number[] = [];
  let places = 0;
  let empty = 0;
  for (const [v, l, i] of paintOrder(art)) {
    // (reading it is what paints it)
    const s = lists[v][l][i];
    const cv = s?.img;
    if (!cv || !cv.width || !cv.height) {
      empty++;
      continue;
    }
    let fi = bySprite.get(s);
    if (fi === undefined) {
      const { img: _img, ...rest } = s;
      for (const [key, val] of Object.entries(rest)) if (typeof val === 'function' || val === undefined) dropped.add(key);
      const pj = JSON.stringify(rest);
      let pi = partsOf.get(pj);
      if (pi === undefined) {
        pi = parts.length;
        parts.push(JSON.parse(pj));
        partsOf.set(pj, pi);
      }
      const data = cv.getContext('2d')!.getImageData(0, 0, cv.width, cv.height).data;
      const hk = hashOf(data, cv.width, cv.height, pj);
      fi = byHash.get(hk);
      if (fi === undefined) {
        fi = frames.length;
        frames.push({ s, parts: pi });
        byHash.set(hk, fi);
      }
      bySprite.set(s, fi);
    }
    at.push(v, l, i, fi);
    places++;
  }
  const ms = Math.round(performance.now() - t0);
  // (laid on sheets in rows, in the order they are wanted: the frames wanted first are on the first sheet)
  const sheets: { w: number; h: number }[] = [];
  const placed: MonsterBakeFile['frames'] = [];
  const lay: { fi: number; sx: number; x: number; y: number }[] = [];
  let x = 0;
  let y = 0;
  let row = 0;
  let wide = 0;
  let px = 0;
  const big: [number, number] = [0, 0];
  const close = (): void => {
    if (!wide) return;
    sheets.push({ w: wide, h: y + row });
    x = 0;
    y = 0;
    row = 0;
    wide = 0;
  };
  for (let fi = 0; fi < frames.length; fi++) {
    const cv = frames[fi].s.img;
    const w = cv.width;
    const h = cv.height;
    if (w > SHEET || h > SHEET) throw new Error(`${name}: a frame of ${w}x${h} is bigger than a sheet`);
    if (w * h > big[0] * big[1]) {
      big[0] = w;
      big[1] = h;
    }
    if (x + w > SHEET) {
      y += row;
      x = 0;
      row = 0;
    }
    if (y + h > SHEET) close();
    lay.push({ fi, sx: sheets.length, x, y });
    placed[fi] = [sheets.length, x, y, w, h, frames[fi].parts];
    x += w;
    wide = Math.max(wide, x);
    row = Math.max(row, h);
    px += w * h;
  }
  close();
  const canvases: HTMLCanvasElement[] = [];
  for (const sh of sheets) {
    const cv = document.createElement('canvas');
    cv.width = sh.w;
    cv.height = sh.h;
    canvases.push(cv);
  }
  for (const p of lay) canvases[p.sx].getContext('2d')!.drawImage(frames[p.fi].s.img, p.x, p.y);
  made = { file: { sheets, frames: placed, parts, lens: figureLens(art), at }, canvases, sources: frames.map((f) => f.s.img) };
  return { frames: frames.length, places, empty, sheets, dropped: [...dropped], ms, px, big };
}

function have(): Made {
  if (!made) throw new Error('no figure baked');
  return made;
}

/** A sheet's pixels, as base64 (red, green, blue, alpha, a byte each, row by row). */
function sheet(n: number): string {
  const cv = have().canvases[n];
  const data = cv.getContext('2d')!.getImageData(0, 0, cv.width, cv.height).data;
  let s = '';
  const CH = 0x8000;
  for (let i = 0; i < data.length; i += CH) s += String.fromCharCode.apply(null, data.subarray(i, i + CH) as unknown as number[]);
  return btoa(s);
}

/** The figure's file, but for its mark, its name and its sheets' names (the tool's to give). */
function file(): string {
  return JSON.stringify(have().file);
}

/**
 * A sheet as written (a PNG, base64) checked against the frames it holds: each frame cut from it AS THE GAME CUTS IT
 * (render/monsters_baked.ts openSheet: the file read as a picture, the frame drawn out of it into a canvas of its own), pixel
 * by pixel against the frame as painted. How many pixels differ, and by how much at most.
 */
async function check(n: number, png: string): Promise<{ frames: number; differ: number; most: number }> {
  const m = have();
  const bin = atob(png);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const url = URL.createObjectURL(new Blob([bytes], { type: 'image/png' }));
  const img = new Image();
  img.decoding = 'async';
  img.src = url;
  await img.decode();
  let count = 0;
  let differ = 0;
  let most = 0;
  for (let fi = 0; fi < m.file.frames.length; fi++) {
    const [s, x, y, w, h] = m.file.frames[fi];
    if (s !== n) continue;
    count++;
    const cv = document.createElement('canvas');
    cv.width = w;
    cv.height = h;
    const g = cv.getContext('2d')!;
    g.drawImage(img, x, y, w, h, 0, 0, w, h);
    const got = g.getImageData(0, 0, w, h).data;
    const want = m.sources[fi].getContext('2d')!.getImageData(0, 0, w, h).data;
    for (let i = 0; i < got.length; i += 4) {
      const d = Math.max(Math.abs(got[i] - want[i]), Math.abs(got[i + 1] - want[i + 1]), Math.abs(got[i + 2] - want[i + 2]), Math.abs(got[i + 3] - want[i + 3]));
      if (d > 0) {
        differ++;
        most = Math.max(most, d);
      }
    }
    cv.width = 0;
    cv.height = 0;
  }
  img.src = '';
  URL.revokeObjectURL(url);
  return { frames: count, differ, most };
}

(window as unknown as Record<string, unknown>).bakeMob = { figures: () => bakedFigures(), most: () => HOLD_MOST_MB, figure, sheet, file, check };

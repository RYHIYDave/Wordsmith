// THE TOWN'S PEOPLE BAKED, the page the bake runs in (tools/bake_townsfolk.mjs; render/townsfolk_baked.ts says why). It paints
// every frame of the sculpted four and of the wordsmith with his ring dark (art/townsfolk3.ts folkLists: the lists the game
// shows, in the order it wants them), each once (a frame the same as one already painted is kept once), lays them on sheets in
// that order, and hands the tool each sheet's pixels and where each frame is. In the manner of the heroes' bake page
// (src/dev/bake_heroes_page.ts), which is not touched: its mark, and so the heroes' bake, stay as they are.

import { TOWNSFOLK3_HEAVY, folkLists, makeSmithDark3, makeTownsfolk3 } from '../art/townsfolk3';
import type { Sprite } from '../engine/px';
import type { FolkBakeFile } from '../render/townsfolk_baked';

/** A sheet's widest and tallest (a phone takes a picture this big in at once without trouble). */
const SHEET = 2048;

// (every frame painted when it is asked for, here)
TOWNSFOLK3_HEAVY.on = false;
const lists = folkLists(makeTownsfolk3(), makeSmithDark3());

type Made = { file: Omit<FolkBakeFile, 'mark' | 'sheets' | 'group'> & { sheets: { w: number; h: number }[] }; canvases: HTMLCanvasElement[]; sources: HTMLCanvasElement[] };
let made: Made | null = null;

// (what has been painted so far: the frames, each once; their other parts, each once; which frame each place shows)
const bySprite = new Map<Sprite, number>();
const byHash = new Map<string, number>();
const frames: { s: Sprite; parts: number }[] = [];
const parts: Omit<Sprite, 'img'>[] = [];
const partsOf = new Map<string, number>();
const dropped = new Set<string>();
const at: number[][] = lists.map(() => []);
let paintMs = 0;

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

/** Paint one list (the tool asks for them one at a time, so that it can say how the bake is going). What can be said of it. */
function paint(l: number): { name: string; places: number; frames: number; ms: number } {
  const t0 = performance.now();
  const { name, list } = lists[l];
  if (at[l].length) throw new Error(`${name}: painted already`);
  const before = frames.length;
  for (let i = 0; i < list.length; i++) {
    const s = list[i];
    const cv = s.img;
    if (!cv || !cv.width || !cv.height) {
      at[l].push(-1);
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
    at[l].push(fi);
  }
  const ms = Math.round(performance.now() - t0);
  paintMs += ms;
  return { name, places: list.length, frames: frames.length - before, ms };
}

/** Lay every frame painted on sheets, in rows, in the order they are wanted. What can be said of the whole. */
function pack(): { frames: number; first: number; places: number; sheets: { w: number; h: number }[]; dropped: string[]; ms: number; px: number } {
  for (let l = 0; l < lists.length; l++) if (at[l].length !== lists[l].list.length) throw new Error(`${lists[l].name}: not painted`);
  const sheets: { w: number; h: number }[] = [];
  const canvases: HTMLCanvasElement[] = [];
  const placed: FolkBakeFile['frames'] = [];
  let x = 0;
  let y = 0;
  let row = 0;
  let wide = 0;
  let px = 0;
  const lay: { fi: number; sx: number; x: number; y: number }[] = [];
  const close = (): void => {
    if (!lay.length && !x) return;
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
    if (w > SHEET || h > SHEET) throw new Error(`a frame of ${w}x${h} is bigger than a sheet`);
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
  for (const sh of sheets) {
    const cv = document.createElement('canvas');
    cv.width = sh.w;
    cv.height = sh.h;
    canvases.push(cv);
  }
  for (const p of lay) canvases[p.sx].getContext('2d')!.drawImage(frames[p.fi].s.img, p.x, p.y);
  // (how many of the frames, from the first, the loops the town shows at once are made of: they were painted first, so they are
  // the first on the first sheet; the loading screen waits for these and no more)
  let first = 0;
  for (let l = 0; l < lists.length; l++) if (lists[l].first) for (const fi of at[l]) first = Math.max(first, fi + 1);
  for (let l = 0; l < lists.length; l++) if (!lists[l].first && lists[l + 1]?.first) throw new Error('the first lists are not the first');
  made = { file: { sheets, frames: placed, parts, first, lists: lists.map((li, l) => ({ name: li.name, at: at[l] })) }, canvases, sources: frames.map((f) => f.s.img) };
  return { frames: frames.length, first, places: at.reduce((n, a) => n + a.length, 0), sheets, dropped: [...dropped], ms: paintMs, px };
}

function have(): Made {
  if (!made) throw new Error('not packed');
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

/** The bake's file, but for its mark, its group and its sheets' names (the tool's to give). */
function file(): string {
  return JSON.stringify(have().file);
}

/**
 * A sheet as written (a PNG, base64) checked against the frames it holds: each frame cut from it as the game cuts it
 * (render/townsfolk_baked.ts), pixel by pixel against the frame as painted. How many pixels differ, and by how much at most.
 */
async function check(n: number, png: string): Promise<{ frames: number; differ: number; most: number }> {
  const m = have();
  const bin = atob(png);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const sheetBmp = await createImageBitmap(new Blob([bytes], { type: 'image/png' }), { premultiplyAlpha: 'default', colorSpaceConversion: 'none' });
  const cv = document.createElement('canvas');
  const g = cv.getContext('2d', { willReadFrequently: true })!;
  let count = 0;
  let differ = 0;
  let most = 0;
  for (let fi = 0; fi < m.file.frames.length; fi++) {
    const [s, x, y, w, h] = m.file.frames[fi];
    if (s !== n) continue;
    count++;
    const bmp = await createImageBitmap(sheetBmp, x, y, w, h, { premultiplyAlpha: 'default', colorSpaceConversion: 'none' });
    cv.width = w;
    cv.height = h;
    g.drawImage(bmp, 0, 0);
    bmp.close();
    const got = g.getImageData(0, 0, w, h).data;
    const want = m.sources[fi].getContext('2d')!.getImageData(0, 0, w, h).data;
    for (let i = 0; i < got.length; i += 4) {
      const d = Math.max(Math.abs(got[i] - want[i]), Math.abs(got[i + 1] - want[i + 1]), Math.abs(got[i + 2] - want[i + 2]), Math.abs(got[i + 3] - want[i + 3]));
      if (d > 0) {
        differ++;
        most = Math.max(most, d);
      }
    }
  }
  sheetBmp.close();
  cv.width = 0;
  cv.height = 0;
  return { frames: count, differ, most };
}

(window as unknown as Record<string, unknown>).bakeFolk = { lists: () => lists.map((l) => ({ name: l.name, places: l.list.length })), paint, pack, sheet, file, check };

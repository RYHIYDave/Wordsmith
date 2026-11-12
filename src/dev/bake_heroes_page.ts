// THE HEROES' PICTURES BAKED, the page the bake runs in (tools/bake_heroes.mjs; render/baked.ts says why). It paints every
// frame of every hero in every place the painter's worker paints them (render/painter.ts, hero), each once (a frame the same
// as one already painted, in the group, is kept once), lays them on sheets in the order they are wanted, and hands the tool
// each sheet's pixels and where each frame is.

import { heroLists, makeHeroArt3 } from '../art/heroes3';
import { lookOfPlace } from '../art/heroes';
import type { Sprite } from '../engine/px';
import { VETERAN } from '../game/veteran';
import { bakeGroups, bakedFirst, bakedPlaces, heroSides, keyName, listLengths } from '../render/baked';
import type { BakeFile } from '../render/baked';

/** A sheet's widest and tallest (a phone takes a picture this big in at once without trouble). */
const SHEET = 2048;

const art = makeHeroArt3();
const groups = bakeGroups(VETERAN.on);
const made = new Map<string, { file: Omit<BakeFile, 'mark' | 'sheets'> & { sheets: { w: number; h: number }[] }; canvases: HTMLCanvasElement[]; sources: HTMLCanvasElement[] }>();

function hashOf(data: Uint8ClampedArray, w: number, h: number, parts: string): string {
  let a = 0x811c9dc5 ^ w;
  let b = 0x9747b28c ^ h;
  const u = new Uint32Array(data.buffer, data.byteOffset, data.byteLength >> 2);
  for (let i = 0; i < u.length; i++) {
    a = Math.imul(a ^ u[i], 0x01000193);
    b = Math.imul(b ^ u[i], 0x5bd1e995) ^ (b >>> 13);
  }
  for (let i = 0; i < parts.length; i++) a = Math.imul(a ^ parts.charCodeAt(i), 0x01000193);
  return `${w}x${h}:${(a >>> 0).toString(16)}:${(b >>> 0).toString(16)}:${parts.length}`;
}

/** Bake one group: paints it, lays it out, keeps its sheets for `sheet`. What can be said of it, for the tool. */
function group(name: string): { frames: number; places: number; sheets: { w: number; h: number }[]; dropped: string[]; ms: number } {
  const t0 = performance.now();
  const keys = groups[name];
  if (!keys) throw new Error(`no group ${name}`);
  const bySprite = new Map<Sprite, number>();
  const byHash = new Map<string, number>();
  const frames: { s: Sprite; parts: number }[] = [];
  const parts: Omit<Sprite, 'img'>[] = [];
  const partsOf = new Map<string, number>();
  const dropped = new Set<string>();
  const outKeys: BakeFile['keys'] = [];
  let places = 0;
  // (each hero's places in the order they are wanted; THE CARDS: every hero's standing and running before anything else of any
  // of them (render/baked.ts bakedFirst), so that they are on the group's first sheet and all six stand on their cards as it comes)
  const per = keys.map((k) => {
    const a = art.of(k.cls, { ...lookOfPlace(k.place), vet: k.vet });
    const sides = heroSides(a);
    return { k, sides, lists: sides.map((s) => heroLists(s)), all: bakedPlaces(sides, k.place === 'card'), first: bakedFirst(sides, k.place === 'card'), at: [] as number[] };
  });
  const runs: [(typeof per)[number], number, number][] = [...per.map((p) => [p, 0, p.first] as [(typeof per)[number], number, number]), ...per.map((p) => [p, p.first, p.all.length] as [(typeof per)[number], number, number])];
  for (const [p, from, to] of runs) {
    const { lists, at } = p;
    for (const [v, l, i] of p.all.slice(from, to)) {
      const s = lists[v][l][i];
      const cv = s.img;
      if (!cv || !cv.width || !cv.height) continue;
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
  }
  for (const p of per) outKeys.push({ cls: p.k.cls, place: p.k.place, vet: p.k.vet, lens: listLengths(p.sides), at: p.at });
  // (laid on sheets in rows, in the order they are wanted)
  const sheets: { w: number; h: number }[] = [];
  const canvases: HTMLCanvasElement[] = [];
  const placed: BakeFile['frames'] = [];
  let x = 0;
  let y = 0;
  let row = 0;
  let wide = 0;
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
    if (w > SHEET || h > SHEET) throw new Error(`${name}: a frame of ${w}x${h} is bigger than a sheet`);
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
  }
  close();
  for (const sh of sheets) {
    const cv = document.createElement('canvas');
    cv.width = sh.w;
    cv.height = sh.h;
    canvases.push(cv);
  }
  for (const p of lay) canvases[p.sx].getContext('2d')!.drawImage(frames[p.fi].s.img, p.x, p.y);
  made.set(name, { file: { group: name, sheets, frames: placed, parts, keys: outKeys }, canvases, sources: frames.map((f) => f.s.img) });
  return { frames: frames.length, places, sheets, dropped: [...dropped], ms: Math.round(performance.now() - t0) };
}

/** A sheet's pixels, as base64 (red, green, blue, alpha, a byte each, row by row). */
function sheet(name: string, n: number): string {
  const m = made.get(name);
  if (!m) throw new Error(`group ${name} not baked`);
  const cv = m.canvases[n];
  const data = cv.getContext('2d')!.getImageData(0, 0, cv.width, cv.height).data;
  let s = '';
  const CH = 0x8000;
  for (let i = 0; i < data.length; i += CH) s += String.fromCharCode.apply(null, data.subarray(i, i + CH) as unknown as number[]);
  return btoa(s);
}

/** A group's file, but for the bake's mark and its sheets' names (the tool's to give). */
function file(name: string): string {
  const m = made.get(name);
  if (!m) throw new Error(`group ${name} not baked`);
  return JSON.stringify(m.file);
}

/**
 * A sheet as written (a PNG, base64) checked against the frames it holds: each frame cut from it as the game cuts it
 * (render/baked.ts), pixel by pixel against the frame as painted. How many pixels differ, and by how much at most.
 */
async function check(name: string, n: number, png: string): Promise<{ frames: number; differ: number; most: number }> {
  const m = made.get(name);
  if (!m) throw new Error(`group ${name} not baked`);
  const bin = atob(png);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const sheetBmp = await createImageBitmap(new Blob([bytes], { type: 'image/png' }), { premultiplyAlpha: 'default', colorSpaceConversion: 'none' });
  const cv = document.createElement('canvas');
  const g = cv.getContext('2d', { willReadFrequently: true })!;
  let frames = 0;
  let differ = 0;
  let most = 0;
  for (let fi = 0; fi < m.file.frames.length; fi++) {
    const [s, x, y, w, h] = m.file.frames[fi];
    if (s !== n) continue;
    frames++;
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
  return { frames, differ, most };
}

/** Let a group go, once the tool has it. */
function drop(name: string): void {
  const m = made.get(name);
  if (!m) return;
  for (const cv of m.canvases) {
    cv.width = 0;
    cv.height = 0;
  }
  made.delete(name);
}

(window as unknown as Record<string, unknown>).bake = { groups: () => Object.keys(groups), names: () => Object.fromEntries(Object.entries(groups).map(([g, ks]) => [g, ks.map(keyName)])), group, sheet, file, check, drop };

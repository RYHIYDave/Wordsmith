// THE HEROES' PICTURES BAKED, the page the bake runs in (tools/bake_heroes.mjs; render/baked.ts says why). It paints every
// frame of every hero in every place the painter's worker paints them (render/painter.ts, hero), each once (a frame the same
// as one already painted, in the group, is kept once), lays them on sheets in the order they are wanted, and hands the tool
// each sheet's pixels and where each frame is.

import { bakeLists, makeHeroArt3 } from '../art/heroes3';
import { lookOfPlace } from '../art/heroes';
import type { Sprite } from '../engine/px';
import { VETERAN } from '../game/veteran';
import { bakeGroups, bakedFirst, bakedPlaces, heroSides, keyName, listLengths, packName, packsOf } from '../render/baked';
import type { BakeFile, BakePack } from '../render/baked';

/** A sheet's widest and tallest (a phone takes a picture this big in at once without trouble). */
const SHEET = 2048;

const art = makeHeroArt3();
const groups = bakeGroups(VETERAN.on);
/**
 * A group as baked: its file (but for the mark and the sheets' names: the tool's to give), EVERY SHEET OF IT, the ones a hero
 * always holds first and then one for each of his packs (render/baked.ts PACKS), and every frame laid on a sheet with the
 * picture it was painted as (to check the sheet against, as written).
 */
interface Made {
  file: Omit<BakeFile, 'mark' | 'sheets' | 'packs'> & { sheets: { w: number; h: number }[]; packs?: BakePack[] };
  canvases: HTMLCanvasElement[];
  laid: { sheet: number; x: number; y: number; w: number; h: number; src: HTMLCanvasElement }[];
}
const made = new Map<string, Made>();

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

/**
 * Bake one group: paints it, lays it out, keeps its sheets for `sheet`. What can be said of it, for the tool: `sheets` is
 * every sheet, the always-held ones first (`held` of them), then one for each pack, in the file's order.
 */
function group(name: string): { frames: number; places: number; sheets: { w: number; h: number }[]; held: number; packs: number; heldBytes: number; packBytes: number; dropped: string[]; ms: number } {
  const t0 = performance.now();
  const keys = groups[name];
  if (!keys) throw new Error(`no group ${name}`);
  const bySprite = new Map<Sprite, number>();
  const byHash = new Map<string, number>();
  const frames: { s: Sprite; parts: number }[] = [];
  const parts: Omit<Sprite, 'img'>[] = [];
  const partsOf = new Map<string, number>();
  const dropped = new Set<string>();
  /** Every place of every hero of the group: its frame, and the pack its list is kept in ('' : always held). */
  const all: { key: number; v: number; l: number; i: number; fi: number; pack: string }[] = [];
  const lens: number[][][] = [];
  // (each hero's places in the order they are wanted; THE CARDS: every hero's standing and running before anything else of any
  // of them (render/baked.ts bakedFirst), so that they are on the group's first sheet and all six stand on their cards as it comes)
  const per = keys.map((k, key) => {
    const a = art.of(k.cls, { ...lookOfPlace(k.place), vet: k.vet });
    const sides = heroSides(a);
    lens.push(listLengths(sides));
    // (A HERO KEPT IN PACKS, render/baked.ts PACKS: which pack each of his lists is in; a move's own first frame is always held)
    return { key, k, sides, lists: sides.map((s) => bakeLists(s)), plan: packsOf(k, sides), all: bakedPlaces(sides, k.place === 'card'), first: bakedFirst(sides, k.place === 'card') };
  });
  const runs: [(typeof per)[number], number, number][] = [...per.map((p) => [p, 0, p.first] as [(typeof per)[number], number, number]), ...per.map((p) => [p, p.first, p.all.length] as [(typeof per)[number], number, number])];
  for (const [p, from, to] of runs) {
    const { key, lists, plan } = p;
    for (const [v, l, i] of p.all.slice(from, to)) {
      const s = lists[v][l][i];
      const cv = s.img;
      if (!cv || !cv.width || !cv.height) continue;
      let fi = bySprite.get(s);
      if (fi === undefined) {
        const { img: _img, ...rest } = s;
        for (const [pk, val] of Object.entries(rest)) if (typeof val === 'function' || val === undefined) dropped.add(pk);
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
      const pp = plan?.[v]?.[l] ?? null;
      all.push({ key, v, l, i, fi, pack: pp && !(pp.lead && i === 0) ? packName(pp.pack, v) : '' });
    }
  }
  // (WHAT IS ALWAYS HELD: every frame a place outside the packs shows. A pack's place that shows one of those is given it with
  // them, and is no part of its pack: so a pack holds only pictures that are its own.)
  const heldFrames = new Map<number, number>();
  for (const p of all) if (!p.pack && !heldFrames.has(p.fi)) heldFrames.set(p.fi, heldFrames.size);
  const outKeys: BakeFile['keys'] = keys.map((k, key) => ({ cls: k.cls, place: k.place, vet: k.vet, lens: lens[key], at: [] }));
  const packs = new Map<string, { frames: Map<number, number>; at: number[] }>();
  for (const p of all) {
    const hf = heldFrames.get(p.fi);
    if (hf !== undefined) {
      outKeys[p.key].at.push(p.v, p.l, p.i, hf);
      continue;
    }
    let pk = packs.get(p.pack);
    if (!pk) packs.set(p.pack, (pk = { frames: new Map(), at: [] }));
    let pf = pk.frames.get(p.fi);
    if (pf === undefined) pk.frames.set(p.fi, (pf = pk.frames.size));
    pk.at.push(p.key, p.v, p.l, p.i, pf);
  }
  // (laid on sheets in rows, in the order they are wanted: what is always held on as many sheets as it takes; then each pack
  // on one sheet of its own)
  const sheets: { w: number; h: number }[] = [];
  const laid: Made['laid'] = [];
  /** Lay these frames on sheets from the next on; where each went, as [sheet, x, y, width, height, parts], in their order. */
  const lay = (fis: number[], one: string | null): [number, number, number, number, number, number][] => {
    const first = sheets.length;
    const out: [number, number, number, number, number, number][] = [];
    let x = 0;
    let y = 0;
    let row = 0;
    let wide = 0;
    let any = false;
    const close = (): void => {
      if (!any) return;
      sheets.push({ w: wide, h: y + row });
      x = 0;
      y = 0;
      row = 0;
      wide = 0;
      any = false;
    };
    for (const fi of fis) {
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
      out.push([sheets.length, x, y, w, h, frames[fi].parts]);
      laid.push({ sheet: sheets.length, x, y, w, h, src: cv });
      any = true;
      x += w;
      wide = Math.max(wide, x);
      row = Math.max(row, h);
    }
    close();
    if (one !== null && sheets.length !== first + 1) throw new Error(`${name}: the pack ${one} does not go on one sheet (${sheets.length - first})`);
    return out;
  };
  const placed = lay([...heldFrames.keys()], null);
  const held = sheets.length;
  let heldBytes = 0;
  for (const f of placed) heldBytes += f[3] * f[4] * 4;
  const outPacks: BakePack[] = [];
  let packBytes = 0;
  for (const [pn, pk] of packs) {
    const at = lay([...pk.frames.keys()], pn);
    const bytes = at.reduce((n, f) => n + f[3] * f[4] * 4, 0);
    packBytes += bytes;
    outPacks.push({ name: pn, sheet: '', frames: at.map(([, x, y, w, h, pi]) => [x, y, w, h, pi]), at: pk.at, bytes });
  }
  const canvases: HTMLCanvasElement[] = [];
  for (const sh of sheets) {
    const cv = document.createElement('canvas');
    cv.width = sh.w;
    cv.height = sh.h;
    canvases.push(cv);
  }
  for (const p of laid) canvases[p.sheet].getContext('2d')!.drawImage(p.src, p.x, p.y);
  const file: Made['file'] = { group: name, sheets: sheets.slice(0, held), frames: placed, parts, keys: outKeys };
  if (outPacks.length) file.packs = outPacks;
  made.set(name, { file, canvases, laid });
  return { frames: frames.length, places: all.length, sheets, held, packs: outPacks.length, heldBytes, packBytes, dropped: [...dropped], ms: Math.round(performance.now() - t0) };
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
  for (const f of m.laid) {
    const { sheet: s, x, y, w, h } = f;
    if (s !== n) continue;
    frames++;
    const bmp = await createImageBitmap(sheetBmp, x, y, w, h, { premultiplyAlpha: 'default', colorSpaceConversion: 'none' });
    cv.width = w;
    cv.height = h;
    g.drawImage(bmp, 0, 0);
    bmp.close();
    const got = g.getImageData(0, 0, w, h).data;
    const want = f.src.getContext('2d')!.getImageData(0, 0, w, h).data;
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

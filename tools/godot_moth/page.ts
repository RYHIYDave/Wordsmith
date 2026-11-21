// THE GODOT PORT: THE MOTH'S PICTURES BAKED A MOVE AT A TIME (tools/godot_bake_moth.mjs runs this in a page). The release does not
// bake the Moth (render/monsters_bake_list.ts TOO_BIG: 1,304 frames, 1,984 MB were they all held at once): the game paints it beside
// itself a frame at a time. Godot has no painter of its own, so its frames are painted here by the game's own art (the bestiary's,
// as the release's bake page paints a figure, src/dev/bake_monsters_page.ts, line for line where it can be) but A SIDE AND A LIST AT
// A TIME: each group's new frames laid on sheets of their own and handed over, then let go of, so that the page never holds more
// than one move's pictures. Godot takes in only the sheets of the moves it is playing (scripts/baked_figure.gd, `groups`).

import { framesOf, makeBestiary } from '../../src/art/bestiary';
import type { MonsterFigure } from '../../src/art/bestiary';
import { heroSides } from '../../src/art/sides';
import type { Sprite } from '../../src/engine/px';
import { figureLens } from '../../src/render/monsters_bake_list';
import { ALL_OF_IT, useAllOfIt } from '../../src/game/all_of_it';
import { ENEMY_MOVES, useEnemyMoves } from '../../src/game/enemy_moves';
import { FLOOR_LOOKS, useFloorLooks } from '../../src/game/floor_looks';

const SHEET = 2048;
useEnemyMoves(ENEMY_MOVES.on);
useFloorLooks(FLOOR_LOOKS.on);
useAllOfIt(ALL_OF_IT.on);
const bestiary = makeBestiary();

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

let lists: Sprite[][][] = [];
let lens: number[][] = [];
const byHash = new Map<string, number>();
const bySprite = new Map<Sprite, number>();
const parts: Omit<Sprite, 'img'>[] = [];
const partsOf = new Map<string, number>();
const frames: [number, number, number, number, number, number][] = [];
const at: number[] = [];
let sheetsDone = 0;
let canvases: HTMLCanvasElement[] = [];

/** The figure opened: how many sides, and each side's lists' lengths. */
function open(name: MonsterFigure): { sides: number; lens: number[][] } {
  const art = bestiary.of(name);
  lists = heroSides(art).map(framesOf);
  lens = figureLens(art);
  return { sides: lists.length, lens };
}

/**
 * One group baked: side `v`'s list `l`, each frame painted (reading it is what paints it), a frame the same as one already
 * baked kept once; its new frames laid on sheets of its own. What can be said of it: its sheets' sizes (numbered from
 * `sheetsDone`), how many frames, how many new.
 */
function group(v: number, l: number): { sheets: { w: number; h: number }[]; frames: number; fresh: number } {
  const list = lists[v][l];
  const fresh: { s: Sprite; fi: number }[] = [];
  for (let i = 0; i < list.length; i++) {
    const s = list[i];
    const cv = s?.img as HTMLCanvasElement | undefined;
    if (!cv || !cv.width || !cv.height) continue;
    let fi = bySprite.get(s);
    if (fi === undefined) {
      const { img: _img, ...rest } = s;
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
        frames.push([-1, 0, 0, cv.width, cv.height, pi]);
        byHash.set(hk, fi);
        fresh.push({ s, fi });
      }
      bySprite.set(s, fi);
    }
    at.push(v, l, i, fi);
  }
  // (its new frames laid on sheets of its own, in rows)
  const sheets: { w: number; h: number }[] = [];
  const lay: { fi: number; s: Sprite; sx: number; x: number; y: number }[] = [];
  let x = 0;
  let y = 0;
  let row = 0;
  let wide = 0;
  const close = (): void => {
    if (!wide) return;
    sheets.push({ w: wide, h: y + row });
    x = 0;
    y = 0;
    row = 0;
    wide = 0;
  };
  for (const f of fresh) {
    const w = f.s.img.width;
    const h = f.s.img.height;
    if (w > SHEET || h > SHEET) throw new Error(`a frame of ${w}x${h} is bigger than a sheet`);
    if (x + w > SHEET) {
      y += row;
      x = 0;
      row = 0;
    }
    if (y + h > SHEET) close();
    lay.push({ fi: f.fi, s: f.s, sx: sheets.length, x, y });
    frames[f.fi][0] = sheetsDone + sheets.length;
    frames[f.fi][1] = x;
    frames[f.fi][2] = y;
    x += w;
    wide = Math.max(wide, x);
    row = Math.max(row, h);
  }
  close();
  canvases = sheets.map((sh) => {
    const cv = document.createElement('canvas');
    cv.width = sh.w;
    cv.height = sh.h;
    return cv;
  });
  for (const p of lay) canvases[p.sx].getContext('2d')!.drawImage(p.s.img as HTMLCanvasElement, p.x, p.y);
  // (the group's frames let go of: their pictures are on its sheets now)
  for (const p of lay) {
    const cv = p.s.img as HTMLCanvasElement;
    cv.width = 0;
    cv.height = 0;
  }
  sheetsDone += sheets.length;
  return { sheets, frames: list.length, fresh: fresh.length };
}

/** A sheet of the group last baked, as base64 pixels (red, green, blue, alpha, a byte each, row by row); let go of after. */
function sheet(n: number): string {
  const cv = canvases[n];
  const data = cv.getContext('2d')!.getImageData(0, 0, cv.width, cv.height).data;
  let s = '';
  const CH = 0x8000;
  for (let i = 0; i < data.length; i += CH) s += String.fromCharCode.apply(null, data.subarray(i, i + CH) as unknown as number[]);
  cv.width = 0;
  cv.height = 0;
  return btoa(s);
}

/** The figure's file, but for its name and its sheets' names (the tool's to give). */
function file(): string {
  return JSON.stringify({ frames, parts, lens, at });
}

(window as unknown as Record<string, unknown>).bakeMoth = { open, group, sheet, file };

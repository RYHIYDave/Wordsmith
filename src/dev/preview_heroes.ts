// Dev preview: every hero animation, both facings, at 6x.
//   node tools/preview.mjs src/dev/preview_heroes.ts shots/heroes.png 1200 1400

import { makeHeroArtV1 as makeHeroArt } from '../art/heroes_v1';
import { P } from '../art/palette';
import type { Sprite } from '../engine/px';
import { CLASS_IDS } from '../game/types';
import { ready, showSheet } from './sheet';
import type { SheetItem } from './sheet';

const art = makeHeroArt();

/**
 * Several sprites standing side by side on a patch of dungeon floor (a P.st3 / P.st4 checker),
 * so we can judge how the heroes read against the real floor colours.
 */
function onFloor(sprites: Sprite[]): Sprite {
  const w = sprites.reduce((a, s) => a + s.w, 0);
  const h = sprites.reduce((a, s) => Math.max(a, s.h), 0);
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const g = cv.getContext('2d')!;
  for (let y = 0; y < h; y += 8) {
    for (let x = 0; x < w; x += 8) {
      g.fillStyle = (x + y) % 16 === 0 ? P.st3 : P.st4;
      g.fillRect(x, y, 8, 8);
    }
  }
  let x = 0;
  for (const s of sprites) {
    g.drawImage(s.img, x, 0);
    x += s.w;
  }
  return { img: cv, w, h, ax: sprites[0].ax, ay: sprites[0].ay };
}

const PALETTE = new Set<string>(Object.values(P));

/**
 * Sanity checks, reported in the console (tools/preview.mjs prints them):
 *  - every frame is 24x32 with anchor (12, 29);
 *  - every pixel is fully opaque or fully transparent, and its colour is in the palette;
 *  - the outermost pixels are empty or ink - anything else means something (a weapon tip,
 *    usually) has been cut off by the edge of the canvas.
 */
function checkFrames(name: string, frames: Sprite[]): void {
  const hex = (n: number): string => (n < 16 ? '0' : '') + n.toString(16);
  frames.forEach((s, n) => {
    const tag = `${name}[${n}]`;
    if (s.w !== 24 || s.h !== 32 || s.ax !== 12 || s.ay !== 29) console.warn(`${tag}: wrong size or anchor`);
    const d = s.img.getContext('2d')!.getImageData(0, 0, s.w, s.h).data;
    for (let y = 0; y < s.h; y++) {
      for (let x = 0; x < s.w; x++) {
        const i = (y * s.w + x) * 4;
        if (d[i + 3] === 0) continue;
        const c = '#' + hex(d[i]) + hex(d[i + 1]) + hex(d[i + 2]);
        if (d[i + 3] !== 255) console.warn(`${tag}: half-transparent pixel at ${x},${y}`);
        if (!PALETTE.has(c)) console.warn(`${tag}: colour ${c} at ${x},${y} is not in the palette`);
        const edge = x === 0 || y === 0 || x === s.w - 1 || y === s.h - 1;
        if (edge && c !== P.ink) console.warn(`${tag}: clipped at the canvas edge (${x},${y})`);
      }
    }
  });
}

const items: SheetItem[] = [];
// Three rows of six frames per class.
for (const id of CLASS_IDS) {
  const a = art[id];
  for (const facing of ['front', 'back'] as const) {
    checkFrames(`${id} ${facing} idle`, a[facing].idle);
    checkFrames(`${id} ${facing} walk`, a[facing].walk);
    checkFrames(`${id} ${facing} attack`, a[facing].attack);
  }
  items.push({ label: `${id} front idle`, frames: a.front.idle }, { label: `${id} front walk`, frames: a.front.walk });
  items.push({ label: `${id} front attack`, frames: a.front.attack }, { label: `${id} back attack`, frames: a.back.attack });
  items.push({ label: `${id} back idle`, frames: a.back.idle }, { label: `${id} back walk`, frames: a.back.walk });
}
items.push({ label: 'all three, front idle', frames: CLASS_IDS.map((id) => art[id].front.idle[0]) });
items.push({
  label: 'on floor colours: front idle, back idle',
  sprite: onFloor([...CLASS_IDS.map((id) => art[id].front.idle[0]), ...CLASS_IDS.map((id) => art[id].back.idle[0])]),
});

showSheet(items, { scale: 6, width: 1200, title: 'Heroes (24x32, anchor 12,29)' });
ready();

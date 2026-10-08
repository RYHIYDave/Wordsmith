// Dev preview for the boss and the town characters:
//   node tools/preview.mjs src/dev/preview_boss.ts shots/boss.png 1300 1500
// Shows every animation of the Warden (both facings), the two NPCs, and a mock-up on floor colours.
// It also checks each frame for palette / outline mistakes and prints what it finds.

import { makeBossArt, makeNpcArt } from '../art/boss';
import { P } from '../art/palette';
import type { Sprite } from '../engine/px';
import { ready, showSheet, type SheetItem } from './sheet';

const boss = makeBossArt();
const npc = makeNpcArt();

/** Report pixels that break the art rules: off-palette colours, soft alpha, or art touching the canvas edge. */
function audit(name: string, frames: Sprite[]): void {
  const allowed = new Set<string>(Object.values(P));
  frames.forEach((s, i) => {
    const d = s.img.getContext('2d')!.getImageData(0, 0, s.w, s.h).data;
    const bad = new Set<string>();
    let soft = 0;
    let clipped = 0;
    for (let y = 0; y < s.h; y++) {
      for (let x = 0; x < s.w; x++) {
        const k = (y * s.w + x) * 4;
        if (d[k + 3] === 0) continue;
        if (d[k + 3] !== 255) soft++;
        const hex = '#' + [d[k], d[k + 1], d[k + 2]].map((v) => (v < 16 ? '0' : '') + v.toString(16)).join('');
        if (!allowed.has(hex)) bad.add(hex);
        const edge = x === 0 || y === 0 || x === s.w - 1 || y === s.h - 1;
        if (edge && hex !== P.ink) clipped++;
      }
    }
    if (bad.size || soft || clipped) {
      console.warn(`${name}[${i}]: off-palette ${[...bad].join(',') || 'none'}, soft alpha ${soft}, clipped edge pixels ${clipped}`);
    }
  });
}

/** Sprites standing in a row on dungeon-floor colours: the real readability test. */
function onFloor(sprites: Sprite[]): Sprite {
  const gap = 6;
  const w = sprites.reduce((a, s) => a + s.w + gap, gap);
  const h = 66;
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const g = cv.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  // rough flagstones in the two floor tones
  g.fillStyle = P.st3;
  g.fillRect(0, 0, w, h);
  g.fillStyle = P.st4;
  for (let y = 0; y < h; y += 8) {
    for (let x = (y / 8) % 2 === 0 ? 0 : 16; x < w; x += 32) g.fillRect(x + 1, y + 1, 15, 7);
  }
  let x = gap;
  const ground = 58;
  for (const s of sprites) {
    g.drawImage(s.img, x, ground - s.ay);
    x += s.w + gap;
  }
  return { img: cv, w, h, ax: 0, ay: 0 };
}

const items: SheetItem[] = [
  { label: 'warden front idle', frames: boss.front.idle },
  { label: 'warden front attack: wind-up, smash, recover', frames: boss.front.attack },
  { label: 'warden front walk', frames: boss.front.walk },
  { label: 'merchant', frames: npc.merchant },
  { label: 'warden back idle', frames: boss.back.idle },
  { label: 'warden back attack: wind-up, smash, recover', frames: boss.back.attack },
  { label: 'warden back walk', frames: boss.back.walk },
  { label: 'wordsmith', frames: npc.wordsmith },
  {
    label: 'on floor colours (st3 / st4): idle, wind-up, back idle, merchant, wordsmith',
    sprite: onFloor([boss.front.idle[0], boss.front.attack[0], boss.back.idle[0], npc.merchant[0], npc.wordsmith[0]]),
  },
];

audit('front.idle', boss.front.idle);
audit('front.walk', boss.front.walk);
audit('front.attack', boss.front.attack);
audit('back.idle', boss.back.idle);
audit('back.walk', boss.back.walk);
audit('back.attack', boss.back.attack);
audit('merchant', npc.merchant);
audit('wordsmith', npc.wordsmith);

showSheet(items, { scale: 5, width: 1280, title: 'The Warden (boss) and town characters' });
ready();

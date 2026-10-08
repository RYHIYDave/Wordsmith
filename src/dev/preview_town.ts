// Dev preview for the town props and characters:
//   node tools/preview.mjs src/dev/preview_town.ts shots/town_props.png 1100 700
import { makeNpcArt } from '../art/boss';
import { P } from '../art/palette';
import { makePropArt } from '../art/tiles';
import type { Sprite } from '../engine/px';
import { ready, showSheet, type SheetItem } from './sheet';

const props = makePropArt();
const npc = makeNpcArt();

function onFloor(sprites: Sprite[]): Sprite {
  const gap = 8;
  const w = sprites.reduce((a, s) => a + s.w + gap, gap);
  const h = 56;
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const g = cv.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  g.fillStyle = P.st3;
  g.fillRect(0, 0, w, h);
  g.fillStyle = P.st4;
  for (let y = 0; y < h; y += 8) for (let x = (y / 8) % 2 === 0 ? 0 : 16; x < w; x += 32) g.fillRect(x + 1, y + 1, 15, 7);
  let x = gap;
  for (const s of sprites) {
    g.drawImage(s.img, x, 46 - s.ay);
    x += s.w + gap;
  }
  return { img: cv, w, h, ax: 0, ay: 0 };
}

const items: SheetItem[] = [
  { label: 'lexicon (4 frames)', frames: props.lexicon },
  { label: 'stash', sprite: props.stash },
  { label: 'chest (for scale)', sprite: props.chest },
  { label: 'anvil', sprite: props.anvil },
  { label: 'stall', sprite: props.stall },
  { label: 'on floor colours', sprite: onFloor([props.lexicon[0], props.stash, props.chest, npc.wordsmith[0], props.anvil, npc.merchant[0], props.stall, props.portal[0]]) },
];
showSheet(items, { scale: 6, width: 1080, title: 'Town props' });
ready();

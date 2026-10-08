// Dev preview: every regular-monster animation, both facings, at 6x.
//   node tools/preview.mjs src/dev/preview_monsters.ts shots/monsters.png 1200 1800

import { makeMonsterArt } from '../art/monsters';
import type { RegularMonster } from '../art/monsters';
import { P } from '../art/palette';
import type { Sprite } from '../engine/px';
import { ready, showSheet } from './sheet';
import type { SheetItem } from './sheet';

const art = makeMonsterArt();
const KINDS: ReadonlyArray<RegularMonster> = ['skeleton', 'archer', 'cultist', 'bat', 'brute'];

/**
 * Several sprites standing side by side on a patch of dungeon floor (a P.st3 / P.st4 checker),
 * feet on one line, so we can compare sizes and judge how they read against the real floor colours.
 */
function onFloor(sprites: Sprite[]): Sprite {
  const w = sprites.reduce((a, s) => a + s.w, 0);
  const up = sprites.reduce((a, s) => Math.max(a, s.ay), 0); // tallest part above an anchor
  const down = sprites.reduce((a, s) => Math.max(a, s.h - s.ay), 0);
  const h = up + down;
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
    g.drawImage(s.img, x, up - s.ay);
    x += s.w;
  }
  return { img: cv, w, h, ax: sprites[0].ax, ay: up };
}

const items: SheetItem[] = [];
// One entry per monster, per facing, per animation. showSheet simply flows entries left to right,
// so the order below is chosen to make each monster start on a fresh row at a 1200 px page width.
for (const k of KINDS) {
  const a = art[k];
  const entry = (facing: 'front' | 'back', anim: 'idle' | 'walk' | 'attack'): SheetItem => ({ label: `${k} ${facing} ${anim}`, frames: a[facing][anim] });
  const w = a.front.idle[0].w;
  if (w > 24) {
    // brute: idle + attack share a row, the walk gets its own
    items.push(entry('front', 'idle'), entry('front', 'attack'), entry('front', 'walk'));
    items.push(entry('back', 'idle'), entry('back', 'attack'), entry('back', 'walk'));
  } else if (w < 24) {
    // bat: all nine frames of a facing fit on one row
    items.push(entry('front', 'walk'), entry('front', 'attack'), entry('front', 'idle'));
    items.push(entry('back', 'walk'), entry('back', 'attack'), entry('back', 'idle'));
  } else {
    // skeleton, archer, cultist: three rows of six frames
    items.push(entry('front', 'idle'), entry('front', 'walk'), entry('front', 'attack'));
    items.push(entry('back', 'attack'), entry('back', 'idle'), entry('back', 'walk'));
  }
}

// All five side by side for scale, then the same line-up standing on the real floor colours.
items.push({ label: 'all five, front idle (scale comparison)', frames: KINDS.map((k) => art[k].front.idle[0]) });
items.push({ label: 'on floor colours: front idle', sprite: onFloor(KINDS.map((k) => art[k].front.idle[0])) });
items.push({ label: 'on floor colours: back idle', sprite: onFloor(KINDS.map((k) => art[k].back.idle[0])) });
items.push({ label: 'on floor colours: front attack, wind-up', sprite: onFloor(KINDS.map((k) => art[k].front.attack[0])) });
items.push({ label: 'on floor colours: front attack, strike', sprite: onFloor(KINDS.map((k) => art[k].front.attack[1])) });

showSheet(items, { scale: 6, width: 1200, title: 'Regular monsters (skeleton, archer, cultist 24x32 @ 12,29; bat 20x28 @ 10,26; brute 34x40 @ 17,37)' });
ready();

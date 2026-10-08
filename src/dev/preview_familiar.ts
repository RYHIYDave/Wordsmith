// Dev page: the familiars, as they were (one body in four colours) and as they are (a spirit of its
// own for each kind of damage), every frame of each.
//   node tools/preview.mjs src/dev/preview_familiar.ts shots/familiar.png 1500 900
import { FAMILIAR_FRAMES, SPELL_TONES, familiarWas, makeSpellArt } from '../art/spells';
import type { Sprite } from '../engine/px';
import type { Element } from '../game/types';

const S = 8;
const CELL = 20 * S;
const ELS: Element[] = ['phys', 'fire', 'frost', 'lightning'];
const NAMES: Record<Element, string> = { phys: "the mage's own magic", fire: 'fire', frost: 'frost', lightning: 'lightning' };
const art = makeSpellArt();
const cv = document.createElement('canvas');
cv.width = 190 + (FAMILIAR_FRAMES + 2) * CELL;
cv.height = 60 + ELS.length * (CELL + 10);
cv.style.position = 'static';
cv.style.display = 'block';
document.body.style.margin = '0';
document.body.style.background = '#16131c';
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;
g.fillStyle = '#16131c';
g.fillRect(0, 0, cv.width, cv.height);
g.fillStyle = '#ffd866';
g.font = 'bold 24px sans-serif';
g.fillText('FAMILIARS: before (left), and now, frame by frame', 14, 34);
const put = (sp: Sprite, x: number, y: number): void => {
  g.fillStyle = '#1b1946';
  g.fillRect(x + 3, y + 3, CELL - 6, CELL - 6);
  g.drawImage(sp.img, x + CELL / 2 - sp.ax * S, y + CELL * 0.42 - sp.ay * S, sp.w * S, sp.h * S);
};
ELS.forEach((el, r) => {
  const y = 52 + r * (CELL + 10);
  g.fillStyle = '#d8d0e0';
  g.font = '17px sans-serif';
  g.fillText(NAMES[el], 12, y + CELL / 2);
  put(familiarWas(SPELL_TONES[el], 0), 180, y);
  for (let f = 0; f < FAMILIAR_FRAMES; f++) put(art.familiar[el][f], 180 + CELL + 30 + f * CELL, y);
});
(window as unknown as { __ready: boolean }).__ready = true;

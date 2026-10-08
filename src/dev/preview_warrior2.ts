// Dev preview: the warrior as it is now beside the warrior at twice the detail, at the same size.
//   node tools/preview.mjs src/dev/preview_warrior2.ts shots/warrior2.png 1180 900
// Add #zoom to the address for a close-up of single frames (used while drawing).

import { makeHeroArtV1 as makeHeroArt } from '../art/heroes_v1';
import { makeWarrior2Art } from '../art/heroes2';
import { P } from '../art/palette';
import type { ActorArt } from '../art/actor_types';
import type { Sprite } from '../engine/px';

const oldArt = makeHeroArt().warrior;
const newArt = makeWarrior2Art();

/** The poses compared, left to right. */
const POSES: readonly { label: string; pick: (a: ActorArt) => Sprite }[] = [
  { label: 'standing', pick: (a) => a.front.idle[0] },
  { label: 'walking', pick: (a) => a.front.walk[0] },
  { label: 'sword raised', pick: (a) => a.front.attack[0] },
  { label: 'striking', pick: (a) => a.front.attack[1] },
  { label: 'from behind', pick: (a) => a.back.idle[0] },
];

function main(): void {
  const zoom = location.hash.includes('zoom');
  const cv = document.createElement('canvas');
  cv.style.position = 'static';
  document.body.style.overflow = 'auto';
  document.documentElement.style.overflow = 'auto';
  document.body.style.height = 'auto';
  document.body.appendChild(cv);

  if (zoom) {
    // every new frame, large, for drawing work
    const frames = [...newArt.front.idle, ...newArt.front.walk, ...newArt.front.attack, ...newArt.back.idle, ...newArt.back.walk, ...newArt.back.attack];
    const S = 6;
    const cols = 6;
    const cw = frames[0].w * S + 8;
    const ch = frames[0].h * S + 8;
    cv.width = cols * cw + 8;
    cv.height = Math.ceil(frames.length / cols) * ch + 8;
    const g = cv.getContext('2d') as CanvasRenderingContext2D;
    g.imageSmoothingEnabled = false;
    g.fillStyle = '#17131c';
    g.fillRect(0, 0, cv.width, cv.height);
    frames.forEach((f, i) => {
      const x = 8 + (i % cols) * cw;
      const y = 8 + Math.floor(i / cols) * ch;
      g.fillStyle = (i % 2 === 0) === (Math.floor(i / cols) % 2 === 0) ? P.st3 : P.st4;
      g.fillRect(x, y, f.w * S, f.h * S);
      g.drawImage(f.img, x, y, f.w * S, f.h * S);
    });
    return;
  }

  // Portrait sheet, made to be looked at on a phone: NOW on the left, NEW on the right.
  const S = 8; // screen pixels per pixel of the current art
  const cellW = 30 * S;
  const cellH = 41 * S;
  const pad = 14;
  const titleH = 78;
  const rowGap = 30;
  const shown = [POSES[0], POSES[3], POSES[4]];
  const G = 4; // "game size": screen pixels per pixel of the current art
  const stripH = 40 * G;
  const stripTop = titleH + shown.length * (cellH + rowGap) + 34;
  cv.width = pad * 3 + cellW * 2;
  cv.height = stripTop + 2 * (stripH + 28) + 6;
  console.log(`sheet ${cv.width}x${cv.height}`);
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  g.fillStyle = '#17131c';
  g.fillRect(0, 0, cv.width, cv.height);
  g.textBaseline = 'top';
  g.fillStyle = '#ffe070';
  g.font = 'bold 21px monospace';
  g.fillText('The warrior, old and new', pad, 12);

  const cols: { name: string; note: string; art: ActorArt; scale: number; color: string }[] = [
    { name: 'NOW', note: 'each figure 24 x 32 dots', art: oldArt, scale: S, color: '#a89cab' },
    { name: 'NEW', note: 'the same space, 4x the dots', art: newArt, scale: S / 2, color: '#58c0b0' },
  ];
  cols.forEach((col, c) => {
    const x0 = pad + c * (cellW + pad);
    g.fillStyle = col.color;
    g.font = 'bold 20px monospace';
    g.fillText(col.name, x0, 42);
    g.font = '11px monospace';
    g.fillStyle = '#857888';
    g.fillText(col.note, x0 + 54, 48);
    shown.forEach((pose, r) => {
      const y0 = titleH + r * (cellH + rowGap);
      // a patch of dungeon floor colours behind each figure
      for (let ty = 0; ty < cellH; ty += 4 * S) {
        for (let tx = 0; tx < cellW; tx += 4 * S) {
          g.fillStyle = (tx + ty) % (8 * S) === 0 ? P.st3 : P.st4;
          g.fillRect(x0 + tx, y0 + ty, Math.min(4 * S, cellW - tx), Math.min(4 * S, cellH - ty));
        }
      }
      const sp = pose.pick(col.art);
      // both generations stand on the same floor point
      const ax = x0 + 14 * S;
      const ay = y0 + 37 * S;
      g.drawImage(sp.img, ax - sp.ax * col.scale, ay - sp.ay * col.scale, sp.w * col.scale, sp.h * col.scale);
      if (c === 0) {
        g.fillStyle = '#a89cab';
        g.font = '13px monospace';
        g.fillText(pose.label, x0 + 2, y0 + cellH + 6);
      }
    });
  });

  // at about the size they appear in the game
  g.fillStyle = '#a89cab';
  g.font = '13px monospace';
  g.fillText('About the size you see while playing:', pad, stripTop - 22);
  const picks = (a: ActorArt): Sprite[] => [a.front.idle[0], a.front.walk[0], a.front.attack[1], a.back.idle[0]];
  cols.forEach((col, k) => {
    const sy = stripTop + k * (stripH + 28);
    const sx = pad + 58;
    const stripW = cv.width - sx - pad;
    g.fillStyle = col.color;
    g.font = 'bold 15px monospace';
    g.fillText(col.name, pad, sy + stripH / 2 - 8);
    g.fillStyle = P.st3;
    g.fillRect(sx, sy, stripW, stripH);
    const sc = k === 0 ? G : G / 2;
    picks(col.art).forEach((sp, i) => {
      const ax = sx + 16 * G + i * Math.floor((stripW - 20 * G) / 4);
      const ay = sy + 36 * G;
      g.drawImage(sp.img, ax - sp.ax * sc, ay - sp.ay * sc, sp.w * sc, sp.h * sc);
    });
  });
}

main();
(window as unknown as { __ready: boolean }).__ready = true;

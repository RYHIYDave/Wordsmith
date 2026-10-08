// Dev preview for the title paintings (src/art/title.ts) and the fallen wordsmith (src/art/body.ts):
//   node tools/preview.mjs src/dev/preview_title.ts shots/title_preview.png 2000 1500
// Shows both paintings at 4x, the change between them a quarter, half and three quarters done,
// both at 1x (phone size) on black, and the body sprites on floor colours. It also checks the art
// against its rules and prints what it finds, with how long the paintings took to make.
//
// For a closer look at one part, pass a view after the size (the window must be as tall as the
// page, or the bottom is cut off):
//   ... shots/x.png 1440 960 real                        one painting as big as fits (also: dream, fade)
//   ... shots/x.png 1440 960 marks                       both paintings with TITLE_MARKS ringed
//   ... shots/x.png 1200 900 crop:real:90,0,60,60:16     a region (x,y,w,h) of a painting at a scale;
//                                                        crop:fade:... for the change half done, and
//                                                        add :both to see the dream beside it
//   ... shots/x.png 900 500 body                         the body sprites, large
//
// The change from one painting to the other, and the life in them:
//   ... shots/x.png 2190 2000 morph                      twelve frames of the library turning into
//                                                        the dream at 3x, a fifth of a second apart
//                                                        as the title screen plays them
//   ... shots/x.png 2190 2000 back                       the same, for the way back
//   ... shots/x.png 1640 1300 morph:70,0,100,104:4:16    a part of it (x,y,w,h) at a scale, in so
//                                                        many frames (also back:...)
//   ... shots/x.png 1960 1800 life                       four moments of the life over each painting
//                                                        at 2x, and the brew, the fire, her eyes, the
//                                                        lamp and the cat closer to
// These also print how long the change takes to get ready and to paint.

import { makeBodyArt } from '../art/body';
import { P } from '../art/palette';
import { TITLE_MARKS, TITLE_REST, TITLE_TURN, makeTitleArt, titleRound } from '../art/title';
import type { Sprite } from '../engine/px';
import { ready } from './sheet';

const t0 = performance.now();
const art = makeTitleArt();
const paintMs = performance.now() - t0;
const t1 = performance.now();
makeTitleArt();
const againMs = performance.now() - t1;
const body = makeBodyArt();

const view = decodeURIComponent(location.hash.slice(1));

const cv = document.createElement('canvas');
cv.width = window.innerWidth;
cv.height = window.innerHeight;
cv.style.position = 'static';
cv.style.display = 'block';
document.body.appendChild(cv);
const g = cv.getContext('2d')!;
g.imageSmoothingEnabled = false;
g.fillStyle = '#1c1722';
g.fillRect(0, 0, cv.width, cv.height);
g.font = '12px monospace';
g.textBaseline = 'top';

function label(text: string, x: number, y: number): void {
  g.fillStyle = '#a89cab';
  g.fillText(text, x, y);
}

/** One painting, or the change between the two part done (0 = real, 1 = dream), scaled up with hard pixels. */
function picture(mixTo: number, x: number, y: number, scale: number, back = false): void {
  g.drawImage(art.morph(mixTo, back), x, y, art.w * scale, art.h * scale);
}

/** A box (sx, sy, sw, sh) of that picture. */
function pictureBox(mixTo: number, back: boolean, sx: number, sy: number, sw: number, sh: number, x: number, y: number, scale: number): void {
  g.drawImage(art.morph(mixTo, back), sx, sy, sw, sh, x, y, sw * scale, sh * scale);
}

/**
 * Frames of the change as the title screen plays it: evenly spaced in time from just after it
 * begins to just before it ends, each labelled with its time and how far the picture has turned.
 */
function changeStrip(back: boolean, box: readonly number[], scale: number, frames: number): void {
  const [sx, sy, sw, sh] = box;
  const gap = 6;
  const perRow = Math.max(1, Math.floor((cv.width - gap) / (sw * scale + gap)));
  // how long the getting ready takes (all of it, since nothing has been made ready yet), and then one picture
  const t0 = performance.now();
  art.morph(0.5, back);
  const readyMs = performance.now() - t0;
  const t1 = performance.now();
  for (let i = 0; i < 50; i++) art.morph(0.02 + (0.96 * i) / 49, back);
  const eachMs = (performance.now() - t1) / 50;
  console.log(`the change: ${readyMs.toFixed(1)} ms to get ready and paint the first picture, then ${eachMs.toFixed(2)} ms a picture`);
  // (the round begins with a rest on the library; the change back begins a rest and a change later)
  const begins = TITLE_REST + (back ? TITLE_REST + TITLE_TURN : 0);
  for (let i = 0; i < frames; i++) {
    const into = (TITLE_TURN * (i + 0.5)) / frames;
    const at = titleRound(begins + into);
    const x = gap + (i % perRow) * (sw * scale + gap);
    const y = 4 + Math.floor(i / perRow) * (sh * scale + 18);
    label(`${into.toFixed(2)} s   ${Math.round(at.k * 100)}% dream`, x, y);
    pictureBox(at.k, at.back, sx, sy, sw, sh, x, y + 14, scale);
  }
}

/** The life over a painting (`k` 0 = the library, 1 = the dream) at time `t`: a box of it, scaled up. */
function alive(k: number, t: number, sx: number, sy: number, sw: number, sh: number, x: number, y: number, scale: number): void {
  g.drawImage(k === 0 ? art.real : art.dream, sx, sy, sw, sh, x, y, sw * scale, sh * scale);
  const life = art.life(t, k);
  if (life) g.drawImage(life, sx, sy, sw, sh, x, y, sw * scale, sh * scale);
}

function lifeSheet(): void {
  const t0 = performance.now();
  art.life(0, 1);
  const firstMs = performance.now() - t0;
  const t1 = performance.now();
  for (let i = 0; i < 100; i++) art.life(i * 0.37, 1);
  const dreamMs = (performance.now() - t1) / 100;
  const t2 = performance.now();
  for (let i = 0; i < 100; i++) art.life(i * 0.37, 0);
  const realMs = (performance.now() - t2) / 100;
  console.log(`the life: ${firstMs.toFixed(1)} ms the first time, then ${dreamMs.toFixed(2)} ms a frame over the dream and ${realMs.toFixed(2)} ms over the library`);
  const pad = 8;
  const times = [1.0, 1.4, 1.8, 2.2];
  let y = 4;
  for (const [k, name] of [[0, 'the library'], [1, 'the dream']] as const) {
    times.forEach((t, i) => {
      label(`${name}, ${t.toFixed(1)} s (2x)`, pad + i * 488, y);
      alive(k, t, 0, 0, art.w, art.h, pad + i * 488, y + 14, 2);
    });
    y += 14 + 320 + 10;
  }
  // closer: each row is a part of a painting (x, y, w, h) at a scale, at a few moments one after another
  const close: ReadonlyArray<readonly [string, number, readonly number[], number, readonly number[]]> = [
    ['the brew and the steam, a third of a second apart (5x)', 1, [44, 62, 152, 44], 5, [3.0, 3.33]],
    ['the fire, a tenth of a second apart (5x)', 1, [44, 112, 152, 34], 5, [3.0, 3.1]],
    ['her eyes, a ninth of a second apart (8x)', 1, [98, 26, 44, 16], 8, [3.0, 3.11, 3.22, 3.33]],
    ['the lamp and the dust in its light, a second apart (5x)', 0, [70, 52, 100, 46], 5, [3.0, 4.0, 5.0]],
    ['the cat\'s tail: at rest, lifting, up (10x)', 0, [28, 74, 24, 20], 10, [1.0, 0.02, 0.2]],
    ['the cat in the dream: watching, blinking (10x)', 1, [28, 74, 24, 20], 10, [5.0, 5.35]],
  ];
  let x = pad;
  let rowH = 0;
  for (const [name, k, box, scale, at] of close) {
    // (a short row goes beside the one before it if there is room)
    const w = at.length * (box[2] * scale + 8);
    if (x > pad && x + w > cv.width - pad) {
      x = pad;
      y += rowH;
      rowH = 0;
    }
    label(name, x, y);
    at.forEach((t, i) => alive(k, t, box[0], box[1], box[2], box[3], x + i * (box[2] * scale + 8), y + 14, scale));
    rowH = Math.max(rowH, 14 + box[3] * scale + 10);
    if (w > cv.width / 2) {
      x = pad;
      y += rowH;
      rowH = 0;
    } else x += w + 16;
  }
}

/** A patch of dungeon floor (32x16 diamonds in the two flagstone tones) with sprites lying on it. */
function onFloor(sprites: Sprite[], x: number, y: number, scale: number): void {
  const gap = 10;
  const w = sprites.reduce((a, s) => a + s.w + gap, gap);
  const h = 36;
  const buf = document.createElement('canvas');
  buf.width = w;
  buf.height = h;
  const b = buf.getContext('2d')!;
  for (let i = -8; i < 16; i++) {
    for (let j = -8; j < 16; j++) {
      b.fillStyle = (i + j) % 2 === 0 ? P.st3 : P.st4;
      const tx = (i - j) * 16;
      const ty = (i + j) * 8;
      for (let r = 0; r < 16; r++) {
        const hw = r < 8 ? 2 * r + 1 : 2 * (15 - r) + 1;
        b.fillRect(tx + 16 - hw, ty + r, hw * 2, 1);
      }
    }
  }
  let sx = gap;
  for (const s of sprites) {
    b.drawImage(s.img, sx, 20 - s.ay);
    sx += s.w + gap;
  }
  g.drawImage(buf, x, y, w * scale, h * scale);
}

/** Check the art against its rules and print anything that is wrong. */
function audit(): void {
  for (const [name, c] of [['real', art.real], ['dream', art.dream]] as const) {
    if (c.width !== 240 || c.height !== 160 || art.w !== 240 || art.h !== 160) console.warn(`${name}: size is ${c.width}x${c.height}, not 240x160`);
    const d = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data;
    let clear = 0;
    const colours = new Set<number>();
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] !== 255) clear++;
      colours.add((d[i] << 16) | (d[i + 1] << 8) | d[i + 2]);
    }
    if (clear) console.warn(`${name}: ${clear} pixels are not fully opaque`);
    console.log(`${name}: ${c.width}x${c.height}, fully opaque: ${clear === 0}, ${colours.size} colours`);
  }
  const allowed = new Set<string>(Object.values(P));
  for (const [name, s] of [['body', body.body], ['searched', body.searched]] as const) {
    const d = s.img.getContext('2d')!.getImageData(0, 0, s.w, s.h).data;
    const bad = new Set<string>();
    let soft = 0;
    let clipped = 0;
    let x0 = s.w;
    let y0 = s.h;
    let x1 = -1;
    let y1 = -1;
    for (let y = 0; y < s.h; y++) {
      for (let x = 0; x < s.w; x++) {
        const k = (y * s.w + x) * 4;
        if (d[k + 3] === 0) continue;
        if (d[k + 3] !== 255) soft++;
        x0 = Math.min(x0, x);
        y0 = Math.min(y0, y);
        x1 = Math.max(x1, x);
        y1 = Math.max(y1, y);
        const hex = '#' + [d[k], d[k + 1], d[k + 2]].map((v) => (v < 16 ? '0' : '') + v.toString(16)).join('');
        if (!allowed.has(hex)) bad.add(hex);
        // art that touches the canvas edge has lost its outline there (the glint may sit on the outline)
        if ((x === 0 || y === 0 || x === s.w - 1 || y === s.h - 1) && hex !== P.ink) clipped++;
      }
    }
    if (bad.size || soft || clipped) console.warn(`${name}: off-palette ${[...bad].join(',') || 'none'}, soft alpha ${soft}, clipped ${clipped}`);
    console.log(`${name}: canvas ${s.w}x${s.h}, art ${x1 - x0 + 1}x${y1 - y0 + 1} at (${x0}, ${y0}), anchor (${s.ax}, ${s.ay})`);
  }
  console.log(`makeTitleArt took ${paintMs.toFixed(1)} ms (a second call: ${againMs.toFixed(1)} ms)`);
}

function sheet(): void {
  const pad = 20;
  label('real (4x)', pad, 6);
  picture(0, pad, 22, 4);
  label('dream (4x)', pad + 980, 6);
  picture(1, pad + 980, 22, 4);

  const y2 = 22 + 640 + 24;
  [0.25, 0.5, 0.75].forEach((f, i) => {
    label(`the change, ${Math.round(f * 100)}% done (2x)`, pad + i * 500, y2 - 16);
    picture(f, pad + i * 500, y2, 2);
  });
  // phone size: 1x on black
  const x1 = pad + 1500;
  g.fillStyle = '#000000';
  g.fillRect(x1 - 6, y2, 252, 346);
  label('1x', x1 - 6, y2 - 16);
  picture(0, x1, y2 + 6, 1);
  picture(1, x1, y2 + 176, 1);

  const y3 = y2 + 346 + 34;
  label('fallen wordsmith: body, searched (6x, on st3 / st4)', pad, y3 - 16);
  onFloor([body.body, body.searched], pad, y3, 6);
  label('3x', pad + 560, y3 - 16);
  onFloor([body.body, body.searched], pad + 560, y3, 3);
  label('2x', pad + 860, y3 - 16);
  onFloor([body.body, body.searched], pad + 860, y3, 2);
  label('1x', pad + 1060, y3 - 16);
  onFloor([body.body, body.searched], pad + 1060, y3, 1);
}

/** Ring a pixel of a painting drawn at (ox, oy) and `scale`. */
function ring(ox: number, oy: number, scale: number, at: readonly [number, number]): void {
  g.strokeStyle = '#ff00ff';
  g.lineWidth = 1;
  g.strokeRect(ox + (at[0] - 2) * scale - 0.5, oy + (at[1] - 2) * scale - 0.5, 5 * scale + 1, 5 * scale + 1);
  g.fillStyle = '#ff00ff';
  g.fillRect(ox + at[0] * scale + scale / 2 - 1, oy + at[1] * scale + scale / 2 - 1, 2, 2);
}

function closeUp(): void {
  const part = view.split(':');
  if (part[0] === 'real' || part[0] === 'dream' || part[0] === 'fade') {
    const s = Math.max(1, Math.floor(Math.min(cv.width / art.w, cv.height / art.h)));
    picture(part[0] === 'real' ? 0 : part[0] === 'dream' ? 1 : 0.5, 0, 0, s);
  } else if (part[0] === 'marks') {
    const s = Math.max(1, Math.floor(Math.min(cv.width / (art.w * 2 + 4), cv.height / art.h)));
    picture(0, 0, 0, s);
    picture(1, (art.w + 4) * s, 0, s);
    for (const at of TITLE_MARKS.lens) ring(0, 0, s, at);
    ring(0, 0, s, TITLE_MARKS.lamp);
    for (const at of TITLE_MARKS.eye) ring((art.w + 4) * s, 0, s, at);
    ring((art.w + 4) * s, 0, s, TITLE_MARKS.brew);
  } else if (part[0] === 'crop') {
    const [x, y, w, h] = part[2].split(',').map(Number);
    const s = Number(part[3] ?? 8);
    const which = part[1];
    const buf = document.createElement('canvas');
    buf.width = w;
    buf.height = h;
    const b = buf.getContext('2d')!;
    b.drawImage(art.morph(which === 'real' ? 0 : which === 'dream' ? 1 : 0.5), -x, -y);
    g.drawImage(buf, 0, 0, w * s, h * s);
    if (part[4] === 'both') {
      const b2 = document.createElement('canvas');
      b2.width = w;
      b2.height = h;
      b2.getContext('2d')!.drawImage(art.dream, -x, -y);
      g.drawImage(b2, w * s + 10, 0, w * s, h * s);
    }
  } else if (part[0] === 'morph' || part[0] === 'back') {
    const box = part[1] ? part[1].split(',').map(Number) : [0, 0, art.w, art.h];
    changeStrip(part[0] === 'back', box, Number(part[2] ?? 3), Number(part[3] ?? 12));
  } else if (part[0] === 'life') {
    lifeSheet();
  } else if (part[0] === 'body') {
    onFloor([body.body, body.searched], 10, 10, 10);
    onFloor([body.body, body.searched], 10, 390, 2);
    onFloor([body.body, body.searched], 200, 390, 1);
    onFloor([body.body, body.searched], 320, 390, 3);
  }
}

audit();
if (view) closeUp();
else sheet();
ready();

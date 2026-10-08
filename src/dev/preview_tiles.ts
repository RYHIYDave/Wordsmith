// Dev preview for src/art/tiles.ts: every tile and prop on a labelled sheet, then a small test
// room that shows how they sit together.
//   node tools/preview.mjs src/dev/preview_tiles.ts shots/tiles.png 1100 900

import { makePropArt, makeTileArt } from '../art/tiles';
import { P } from '../art/palette';
import { WALL_H } from '../engine/iso';
import type { Sprite } from '../engine/px';
import { hash2 } from '../engine/rng';
import { ready, showSheet } from './sheet';

const tiles = makeTileArt();
const props = makePropArt();

showSheet(
  [
    { label: 'floors 0-7 (32x16)', frames: tiles.floors },
    { label: 'wallsTall 0-3', frames: tiles.wallsTall },
    { label: 'wallsLow 0-2', frames: tiles.wallsLow },
    { label: 'brazier x4', frames: props.brazier },
    { label: 'chest', sprite: props.chest },
    { label: 'chestOpen', sprite: props.chestOpen },
    { label: 'barrel', sprite: props.barrel },
    { label: 'urn', sprite: props.urn },
    { label: 'pillar', sprite: props.pillar },
    { label: 'bones x3', frames: props.bones },
    { label: 'rubble x3', frames: props.rubble },
    { label: 'anvil', sprite: props.anvil },
    { label: 'stall', sprite: props.stall },
    { label: 'portal x4', frames: props.portal },
    { label: 'portalOff', sprite: props.portalOff },
  ],
  { scale: 4, width: 1100, title: 'Tiles and props' },
);

// ---------------------------------------------------------------------------------------------
// Test room: 9x9 tiles, tall walls on the two far edges, low (cut-away) walls on the two near
// edges, drawn at 3x in painter's order.

const N = 9;
const SCALE = 3;
const PAD = 6;

// Low-resolution buffer first, so the room is scaled exactly like the game will scale it.
const buf = document.createElement('canvas');
buf.width = N * 32 + PAD * 2;
buf.height = WALL_H + N * 16 + PAD * 2;
const g = buf.getContext('2d')!;
g.fillStyle = P.black;
g.fillRect(0, 0, buf.width, buf.height);

const originX = PAD + (N - 1) * 16 + 16; // screen x of tile (0, 0)'s top vertex
const originY = PAD + WALL_H;

/** Draw a sprite with its anchor at tile (tx, ty)'s top vertex, `drop` pixels lower. */
function put(s: Sprite, tx: number, ty: number, drop: number): void {
  g.drawImage(s.img, originX + (tx - ty) * 16 - s.ax, originY + (tx + ty) * 8 + drop - s.ay);
}

function pick<T>(list: readonly T[], tx: number, ty: number, seed: number): T {
  return list[Math.floor(hash2(tx, ty, seed) * list.length)];
}

// Things standing in the room, by tile. Props anchor at the tile CENTRE (8 px below the vertex).
// (Placed so that nothing hides anything else.)
const standing: { s: Sprite; tx: number; ty: number }[] = [
  { s: props.brazier[0], tx: 1, ty: 1 },
  { s: props.pillar, tx: 2, ty: 1 },
  { s: props.pillar, tx: 1, ty: 2 },
  { s: props.brazier[1], tx: 7, ty: 1 },
  { s: props.brazier[2], tx: 1, ty: 7 },
  { s: props.portal[1], tx: 4, ty: 4 },
  { s: props.portalOff, tx: 6, ty: 2 },
  { s: props.stall, tx: 1, ty: 5 },
  { s: props.chest, tx: 6, ty: 4 },
  { s: props.chestOpen, tx: 5, ty: 6 },
  { s: props.barrel, tx: 7, ty: 3 },
  { s: props.barrel, tx: 7, ty: 5 },
  { s: props.urn, tx: 6, ty: 5 },
  { s: props.urn, tx: 7, ty: 7 },
  { s: props.anvil, tx: 3, ty: 7 },
];

// Flat decals lie on the floor, so they are drawn with it.
const decals: { s: Sprite; tx: number; ty: number }[] = [
  { s: props.bones[0], tx: 4, ty: 2 },
  { s: props.bones[1], tx: 2, ty: 4 },
  { s: props.bones[2], tx: 5, ty: 7 },
  { s: props.rubble[0], tx: 3, ty: 1 },
  { s: props.rubble[1], tx: 6, ty: 7 },
  { s: props.rubble[2], tx: 3, ty: 5 },
];

// 1. all floor tiles, then the decals
for (let ty = 0; ty < N; ty++) {
  for (let tx = 0; tx < N; tx++) put(pick(tiles.floors, tx, ty, 5), tx, ty, 0);
}
for (const d of decals) put(d.s, d.tx, d.ty, 8);

// 2. walls and props together, far to near (increasing tx + ty)
for (let depth = 0; depth <= 2 * (N - 1); depth++) {
  for (let tx = 0; tx < N; tx++) {
    const ty = depth - tx;
    if (ty < 0 || ty >= N) continue;
    if (tx === 0 || ty === 0) put(pick(tiles.wallsTall, tx, ty, 9), tx, ty, 0);
    else if (tx === N - 1 || ty === N - 1) put(pick(tiles.wallsLow, tx, ty, 9), tx, ty, 0);
    for (const o of standing) if (o.tx === tx && o.ty === ty) put(o.s, tx, ty, 8);
  }
}

const room = document.createElement('canvas');
room.width = buf.width * SCALE;
room.height = buf.height * SCALE;
room.style.position = 'static';
room.style.marginTop = '12px';
const rg = room.getContext('2d')!;
rg.imageSmoothingEnabled = false;
rg.drawImage(buf, 0, 0, room.width, room.height);
document.body.appendChild(room);

ready();

// Dev-only: draws generated dungeon levels top-down so layouts can be judged at a glance.
//   node tools/preview.mjs src/dev/preview_dungeon.ts shots/dungeon.png 1100 800
//
// Legend: black = void, dark grey = wall, grey = floor tinted by room kind (start green, boss red,
// treasure gold, guardian orange, elite purple), numbers = place along the main path, green
// square = start, red square = boss point, orange dots = normal packs, magenta = elite packs,
// yellow = a guardian's pack (bigger dot = bigger pack), small dots = props.
//
// Add #levels=1:5,3:9 to the page address (depth:seed pairs) to look at particular levels.

import { generateFloor } from '../game/dungeon';
import { T_FLOOR, T_WALL } from '../game/types';
import type { Floor, PropKind, RoomKind } from '../game/types';

const PX = 2; // screen pixels per tile
const CELL = 160 * PX + 20; // room for the largest map plus a gap
const LABEL_H = 16;

/** The levels shown: [depth, seed]. */
const DEFAULT_LEVELS: readonly (readonly [number, number])[] = [
  [1, 101],
  [1, 2024],
  [3, 7],
  [5, 99],
  [8, 4242],
  [12, 31337],
];

const ROOM_TINT: Record<RoomKind, string> = {
  start: '#4f7a55',
  normal: '#6f6c74',
  treasure: '#9a8a3d',
  elite: '#74598c',
  guardian: '#a8642e',
  boss: '#8a4a4a',
};

const PROP_COLOUR: Record<PropKind, string> = {
  brazier: '#ffd24a',
  chest: '#ffffff',
  barrel: '#c98a4b',
  urn: '#58c4d8',
  pillar: '#15131a',
  bones: '#b9b4a6',
  rubble: '#8d8791',
};

function drawFloor(g: CanvasRenderingContext2D, f: Floor, ox: number, oy: number): void {
  // tiles
  for (let y = 0; y < f.h; y++) {
    for (let x = 0; x < f.w; x++) {
      const t = f.tiles[y * f.w + x];
      g.fillStyle = t === T_FLOOR ? '#5d5a62' : t === T_WALL ? '#2c2931' : '#000000';
      g.fillRect(ox + x * PX, oy + y * PX, PX, PX);
    }
  }
  // room tint (floor tiles only, so clipped corners still show as wall)
  for (const r of f.rooms) {
    g.fillStyle = ROOM_TINT[r.kind];
    for (let y = r.y; y < r.y + r.h; y++) {
      for (let x = r.x; x < r.x + r.w; x++) {
        if (f.tiles[y * f.w + x] === T_FLOOR) g.fillRect(ox + x * PX, oy + y * PX, PX, PX);
      }
    }
  }
  // props: flat ones as a single pixel, solid ones as a 2x2 dot
  for (const p of f.props) {
    g.fillStyle = PROP_COLOUR[p.kind];
    const flat = p.kind === 'bones' || p.kind === 'rubble';
    if (flat) g.fillRect(ox + p.x * PX, oy + p.y * PX, 1, 1);
    else g.fillRect(ox + p.x * PX, oy + p.y * PX, 2, 2);
  }
  // packs
  for (const p of f.packs) {
    g.fillStyle = p.tier === 'elite' ? '#ff3df2' : p.tier === 'champion' ? '#ffe600' : '#ff9a2e';
    const r = 1 + p.size * 0.3;
    g.beginPath();
    g.arc(ox + p.x * PX, oy + p.y * PX, r, 0, Math.PI * 2);
    g.fill();
  }
  // place along the main path
  g.fillStyle = '#ffffff';
  for (const r of f.rooms) {
    if (r.path >= 0) g.fillText(`${r.path}`, ox + r.x * PX + 1, oy + r.y * PX);
  }
  // start and boss points
  g.fillStyle = '#39ff5a';
  g.fillRect(ox + f.start.x * PX - 2, oy + f.start.y * PX - 2, 5, 5);
  g.fillStyle = '#ff2a2a';
  g.fillRect(ox + f.boss.x * PX - 2, oy + f.boss.y * PX - 2, 5, 5);
}

function levels(): readonly (readonly [number, number])[] {
  const m = /levels=([0-9:,]+)/.exec(location.hash);
  if (!m) return DEFAULT_LEVELS;
  return m[1].split(',').map((pair) => {
    const [d, s] = pair.split(':').map(Number);
    return [d || 1, s || 1] as const;
  });
}

function main(): void {
  const list = levels();
  const cols = 3;
  const rows = Math.ceil(list.length / cols);
  const cv = document.createElement('canvas');
  cv.width = cols * CELL + 16;
  cv.height = rows * (CELL + LABEL_H) + 16;
  cv.style.position = 'static';
  document.body.style.overflow = 'auto';
  document.documentElement.style.overflow = 'auto';
  document.body.style.height = 'auto';
  document.body.appendChild(cv);
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.fillStyle = '#17131c';
  g.fillRect(0, 0, cv.width, cv.height);
  g.font = '10px monospace';
  g.textBaseline = 'top';

  list.forEach(([depth, seed], k) => {
    const t0 = performance.now();
    const f = generateFloor(depth, seed);
    const ms = performance.now() - t0;
    const ox = 8 + (k % cols) * CELL;
    const oy = 8 + Math.floor(k / cols) * (CELL + LABEL_H);
    const monsters = f.packs.reduce((a, p) => a + p.size, 0);
    g.fillStyle = '#d8d0c0';
    g.fillText(`depth ${depth} seed ${seed}  ${f.w}x${f.h}  ${f.rooms.length} rooms  ${monsters} monsters  ${ms.toFixed(0)}ms`, ox, oy);
    drawFloor(g, f, ox, oy + LABEL_H);
    // map outline, so unused space around the level is visible
    g.strokeStyle = '#3a3542';
    g.strokeRect(ox - 0.5, oy + LABEL_H - 0.5, f.w * PX + 1, f.h * PX + 1);
  });
}

main();
(window as unknown as { __ready: boolean }).__ready = true;

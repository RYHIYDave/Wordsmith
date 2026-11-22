// THE SHAFT'S RIM'S PICTURES THAT CHANGE, FOR THE GODOT VERSION (godot/scripts/rim.gd). The rest of the town's look is recorded whole
// from the game (tools/godot_record.mjs rim: its ground, its pieces as they stand with the stone uncut, the wall empty, the gate
// bare); these are drawn over it as they come to be, each the art chat's own painting (art/shaft_props.ts rimProps, render/rim.ts):
//   record|<n>|<fresh>   the record stone with n notches (0 to RECORD_ROOM), the newest glowing (fresh 1) or not;
//   trophies|<bits>      the trophies wall, each of its four mounts filled (bit k: the boss of floor 5, 10, 15, 20) or empty;
//   quarter|<k>          (ENDLESS_KEY) a shard of the tablet lying where its boss fell (art/endless_tablet.ts paintQuarter);
//   socket|<bits>        the tablet in the wordsmith's bench, the quarters he holds lying in it, dark;
//   lit|<f>              the four set and burning, frame f at 30 a second (art/endless_tablet.ts SOCKET_LIT: kindling, the flare,
//                        then burning on, the last SOCKET_LIT.burn going round);
//   portal|floor|<f>, portal|rise|<f>   the landing's portal opening and standing open (art/endless_portal.ts: PORTAL_OPEN_FRAMES, then
//                        PORTAL_IDLE round), what lies flat of it and what rises out of it.
// Each [x, y, w, h, ax, ay] in godot/assets/rim/pics.png, two picture pixels to a game pixel; the pieces' places and depths
// (art/shaft_props.ts rimPieces), the gate's three sockets (GATE_SOCKETS, tiles from its anchor), and the key's numbers.
//   npx tsx tools/godot_rim.ts
import { mkdirSync, writeFileSync } from 'node:fs';
import { paintWithoutCanvas, paintingOf } from '../tests/helpers';
import { pngRGBA } from './mage_up_sheet';
import { Px } from '../src/engine/px';
import { gameSwitches } from './godot_switches';
import { GATE_SOCKETS, rimPieces, rimProps } from '../src/art/shaft_props';
import { RIM_SLAB } from '../src/art/shaft_town';
import { QUARTER_N, SOCKET_LIT, SOCKET_LIT_FRAMES, paintQuarter, paintSocketTablet } from '../src/art/endless_tablet';
import { PORTAL_IDLE, PORTAL_OPEN_FRAMES, paintPortalFloor, paintPortalRise } from '../src/art/endless_portal';
import { RIM_RULES } from '../src/game/rim';
import { KEY_TIMES, PORTAL_NEAR, KEY_TEXT, QUARTER_FLOORS, QUARTER_BOSS } from '../src/game/endless_key';
import type { Sprite } from '../src/engine/px';

paintWithoutCanvas();
gameSwitches();

const pics: [string, Px, number, number][] = [];
const add = (key: string, px: Px, ax: number, ay: number): void => void pics.push([key, px, ax, ay]);
// (a Sprite's anchor is in game pixels; its painting is at its own grain)
const addSprite = (key: string, s: Sprite): void => {
  const d = s.density ?? 1;
  add(key, paintingOf(s), Math.round(s.ax * d), Math.round(s.ay * d));
};

const P = rimProps(RIM_SLAB);
const room = RIM_RULES.recordRoom;
for (let n = 0; n <= room; n++) {
  addSprite(`record|${n}|0`, P.record(n, false));
  if (n > 0) addSprite(`record|${n}|1`, P.record(n, true));
}
for (let bits = 0; bits < 16; bits++) addSprite(`trophies|${bits}`, P.trophies([0, 1, 2, 3].map((k) => (bits & (1 << k)) !== 0)));
// (ENDLESS_KEY: the tablet in the bench; the landing's portal)
for (let bits = 1; bits < 16; bits++) {
  const p = paintSocketTablet([0, 1, 2, 3].map((k) => (bits & (1 << k)) !== 0));
  add(`socket|${bits}`, p.px, p.ox, p.oy);
}
// (a shard lying where its boss fell: its item picture, its middle its anchor: render.ts)
for (let k = 0; k < 4; k++) add(`quarter|${k}`, paintQuarter(k), QUARTER_N / 2, QUARTER_N / 2);
for (let f = 0; f < SOCKET_LIT_FRAMES; f++) {
  const p = paintSocketTablet([true, true, true, true], f);
  add(`lit|${f}`, p.px, p.ox, p.oy);
}
for (let f = 0; f < PORTAL_OPEN_FRAMES + PORTAL_IDLE; f++) {
  const a = paintPortalFloor(f);
  add(`portal|floor|${f}`, a.px, a.ox, a.oy);
  const b = paintPortalRise(f);
  add(`portal|rise|${f}`, b.px, b.ox, b.oy);
}

// (packed into one sheet, each cut to what it paints, the tallest first)
const W = 4096;
const out: Record<string, number[]> = {};
const placed: { px: Px; sx: number; sy: number; x: number; y: number; w: number; h: number }[] = [];
let cx = 0;
let cy = 0;
let rowH = 0;
for (const [key, px, ax, ay] of [...pics].sort((a, b) => b[1].h - a[1].h)) {
  let x0 = px.w;
  let y0 = px.h;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < px.h; y++) for (let x = 0; x < px.w; x++) if (px.d[(y * px.w + x) * 4 + 3] > 0) {
    x0 = Math.min(x0, x);
    y0 = Math.min(y0, y);
    x1 = Math.max(x1, x);
    y1 = Math.max(y1, y);
  }
  if (x1 < 0) {
    out[key] = [0, 0, 0, 0, 0, 0];
    continue;
  }
  const w = x1 - x0 + 1;
  const h = y1 - y0 + 1;
  if (cx + w > W) {
    cx = 0;
    cy += rowH + 1;
    rowH = 0;
  }
  placed.push({ px, sx: x0, sy: y0, x: cx, y: cy, w, h });
  out[key] = [cx, cy, w, h, ax - x0, ay - y0];
  cx += w + 1;
  rowH = Math.max(rowH, h);
}
const sheet = new Px(W, cy + rowH);
for (const q of placed) for (let j = 0; j < q.h; j++) for (let i = 0; i < q.w; i++) {
  const o = ((q.sy + j) * q.px.w + q.sx + i) * 4;
  const d = ((q.y + j) * W + q.x + i) * 4;
  for (let c = 0; c < 4; c++) sheet.d[d + c] = q.px.d[o + c];
}
// (the gate's sockets, in tiles from its anchor: render/rim.ts tileAt)
const tileAt = (gx: number, gy: number): [number, number] => [(gx / 16 + gy / 8) / 2, (gy / 8 - gx / 16) / 2];
const OUT = 'godot/assets/rim';
mkdirSync(OUT, { recursive: true });
writeFileSync(`${OUT}/pics.png`, pngRGBA(sheet));
writeFileSync(`${OUT}/pics.json`, JSON.stringify({
  pics: out,
  pieces: rimPieces().filter((p) => p.kind !== 'torch').map((p) => ({ kind: p.kind, at: p.at, d: p.depth[0] + p.depth[1] })),
  sockets: GATE_SOCKETS.map((s) => tileAt(s.x, s.y)),
  room,
  // (render/rim.ts NAME_AT: how high over each its name is written)
  names: { record: 84, trophies: 52 },
  key: { lit: SOCKET_LIT, litFrames: SOCKET_LIT_FRAMES, portalOpen: PORTAL_OPEN_FRAMES, portalIdle: PORTAL_IDLE, portalAt: KEY_TIMES.portal, near: PORTAL_NEAR,
    floors: [...QUARTER_FLOORS], bosses: [...QUARTER_BOSS], text: { got1: KEY_TEXT.got(0, 1), set: KEY_TEXT.set, open: KEY_TEXT.open, through: KEY_TEXT.through, prompt: KEY_TEXT.prompt, label: KEY_TEXT.label(0) } },
}) + '\n');
console.log(`the Shaft's Rim's pictures that change: ${pics.length} pictures in a ${W}x${sheet.h} sheet`);

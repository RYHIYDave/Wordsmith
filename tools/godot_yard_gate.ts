// THE GODOT PORT: THE HEADSMAN'S YARD'S OWN GATE AS IT FALLS (art/yard_gate.ts, YARD_GATE on; render.ts standDoors), for
// godot/scripts/doors.gd and look.gd. Floor 2's look (tools/godot_looks.ts floor2) holds the gate up and down and its portcullis
// at 21 heights as it rises; here, what the renderer draws as it FALLS, by its own beat:
//   godot/assets/looks/floor2_gate.png + floor2_gate.json
//     pics: { name, x, y, w, h, ax, ay, lights } each picture in the sheet, two picture pixels to a game pixel (ax, ay: its anchor
//       in it; lights: what it gives off, game pixels from its anchor: render.ts propLit, drawLights);
//     drop: for each frame of YARD_GATE_DROP (30 a second from the moment it falls), its portcullis's strips [name, x, y, d] at
//       that frame's raise (held juddering at the top, dropped in two frames, a bounce off the floor, then down for good);
//     arch: the arch's strips with the mark on its keystone alight [name, x, y, d] (from the landing on: A.arch(..., lit));
//     slam: SLAM_FRAMES frames of its dust and sparks [name, x, y, d], stood at the middle of the gate's foot;
//     tune: fps, the frame it lands on (YARD_SLAM_AT), and the renderer's little shake while the slam's first frames show.
//   Each (x, y) a screen point in game pixels from world (0, 0): ((wx - wy) * 16, (wx + wy) * 8), as the look's items are; d the
//   renderer's depth.
//   npx tsx tools/godot_yard_gate.ts
import { mkdirSync, writeFileSync } from 'node:fs';
import { paintWithoutCanvas, paintingOf } from '../tests/helpers';
import { pngRGBA } from './mage_up_sheet';
import { Px } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import { gameSwitches } from './godot_switches';
import { Game } from '../src/game/game';
import { doorFace } from '../src/game/doors';
import { GATE_UP, PILLAR, STRIP } from '../src/art/gates';
import type { Strip } from '../src/art/gates';
import { SLAM_FRAMES, YARD_GATE, YARD_GATE_DROP, YARD_SLAM_AT, makeYardGateArt, yardGateSlam } from '../src/art/yard_gate';

paintWithoutCanvas();
gameSwitches();
if (!YARD_GATE.on) throw new Error('YARD_GATE is off: the yard has no gate of its own');
const game = new Game('warrior', 1);
game.depth = 2;
game.enterDungeon();
const L = game.level;
const door = L.doors.find((d) => d.spot.kind === 'bossgate');
if (!door) throw new Error('floor 2 without its boss gate');
const s = door.spot;
const A = makeYardGateArt();
const face = doorFace(s);
const at = (t: number, back = 0): [number, number] => (s.alongX ? [s.a + t, face - back] : [face - back, s.a + t]);
const wide = PILLAR / 32;
const r3 = (n: number): number => Math.round(n * 1000) / 1000;

// --- the pictures, each once
const named: [string, Sprite][] = [];
const names = new Map<Sprite, string>();
const nameOf = (sp: Sprite, hint: string): string => {
  let n = names.get(sp);
  if (n) return n;
  n = `${hint} ${named.length}`;
  names.set(sp, n);
  named.push([n, sp]);
  return n;
};
type Put = [string, number, number, number];
const put = (depth: number, sp: Sprite, x: number, y: number, hint: string): Put => [nameOf(sp, hint), (x - y) * 16, (x + y) * 8, r3(depth)];
const strips = (list: Strip[], t0: number, back: number, hint: string): Put[] => list.map((q) => {
  const [x, y] = at(t0 + q.t, back);
  return put(x + y + STRIP / 64, q.s, x, y, hint);
});

// THE DROP: its portcullis frame by frame (render.ts: strips(A.portcullis(s.alongX, boss, drop.raise), -wide, wide))
const drop = YARD_GATE_DROP.map((raise) => strips(A.portcullis(s.alongX, true, raise), -wide, wide, 'portcullis'));
// THE ARCH, its mark alight (render.ts: strips(A.arch(s.alongX, boss, lit), -wide, 0))
const arch = strips(A.arch(s.alongX, true, true), -wide, 0, 'arch lit');
// (the arch unlit, as floor 2's look holds it: the lit one is laid over it, so it must cover the same pixels)
const dark = strips(A.arch(s.alongX, true, false), -wide, 0, 'arch dark');
for (let i = 0; i < arch.length; i++) {
  const a = paintingOf(named.find((n) => n[0] === arch[i][0])![1]);
  const b = paintingOf(named.find((n) => n[0] === dark[i][0])![1]);
  if (a.w !== b.w || a.h !== b.h || arch[i][1] !== dark[i][1] || arch[i][2] !== dark[i][2]) throw new Error(`the lit arch's strip ${i} is not where the dark one is`);
  for (let p = 3; p < a.d.length; p += 4) if ((a.d[p] > 0) !== (b.d[p] > 0)) throw new Error(`the lit arch's strip ${i} does not cover the dark one's pixels`);
}
// (the dark arch is not wanted in the sheet: floor 2's look has it)
for (const d of dark) {
  const i = named.findIndex((n) => n[0] === d[0]);
  if (!arch.some((a) => a[0] === d[0])) named.splice(i, 1);
}
// THE SLAM (render.ts: const [x, y] = at(1.5, wide); put(x + y + 0.3, yardGateSlam(s.alongX, drop.slam), x, y))
const slam: Put[] = [];
for (let f = 0; f < SLAM_FRAMES; f++) {
  const [x, y] = at(1.5, wide);
  slam.push(put(x + y + 0.3, yardGateSlam(s.alongX, f), x, y, 'slam'));
}

// --- packed into a sheet
const W = 1024;
const placed: { name: string; x: number; y: number; w: number; h: number; ax: number; ay: number; lights: { x: number; y: number; r: number; color: string; a: number }[] }[] = [];
let cx = 0;
let cy = 0;
let rowH = 0;
for (const [n, sp] of named) {
  const k = 2 / (sp.density ?? 1);
  const p = paintingOf(sp);
  const w = p.w * k;
  const h = p.h * k;
  if (cx + w > W) { cx = 0; cy += rowH + 1; rowH = 0; }
  placed.push({ name: n, x: cx, y: cy, w, h, ax: sp.ax * 2, ay: sp.ay * 2, lights: (sp.lights ?? []).map((l) => ({ x: l.x - sp.ax, y: l.y - sp.ay, r: l.r, color: l.color, a: l.a ?? 0.5 })) });
  cx += w + 1;
  rowH = Math.max(rowH, h);
}
const sheet = new Px(W, cy + rowH);
named.forEach(([, sp], i) => {
  const q = placed[i];
  const k = 2 / (sp.density ?? 1);
  const p = paintingOf(sp);
  for (let j = 0; j < q.h; j++) for (let x = 0; x < q.w; x++) {
    const o = (Math.floor(j / k) * p.w + Math.floor(x / k)) * 4;
    const d = ((q.y + j) * W + q.x + x) * 4;
    for (let c = 0; c < 4; c++) sheet.d[d + c] = p.d[o + c];
  }
});
const OUT = 'godot/assets/looks';
mkdirSync(OUT, { recursive: true });
writeFileSync(`${OUT}/floor2_gate.png`, pngRGBA(sheet));
writeFileSync(`${OUT}/floor2_gate.json`, JSON.stringify({
  door: { a: s.a, plane: s.plane, alongX: s.alongX },
  pics: placed,
  drop,
  arch,
  slam,
  tune: { fps: 30, raise: [...YARD_GATE_DROP], up: GATE_UP, slam_at: YARD_SLAM_AT, slam_frames: SLAM_FRAMES, shake_frames: 4, shake: 2 },
}) + '\n');
console.log(`the yard's gate: ${drop.length} frames of its drop, ${arch.length} strips of its arch alight, ${slam.length} of its slam; ${named.length} pictures in a ${W}x${sheet.h} sheet`);

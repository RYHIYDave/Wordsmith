// THE GODOT PORT: THE GOLEM'S SHOTS THAT RUN ANY WAY, as the game paints them, for the port's painter to be checked against
// (godot/scripts/heroes/golem_paint.gd; godot/checks/golem_shots_check.gd): the shell in flight, the beam and a tesla coil's zap,
// for a few ways and frames, each picture's pixels and anchor.
//   npx tsx tools/godot_golem_shots.ts <dir>   -> <dir>/shots.json
//   godot --headless --path godot -s res://checks/golem_shots_check.gd -- --dir=<dir>
import { mkdirSync, writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { paintWithoutCanvas } from '../tests/helpers';
import { gameSwitches } from './godot_switches';
import { boltFrames, boltPiece, shellFlightPiece, beamPiece } from '../src/art/golem_shots_fx';
import { GUN_GLOW, bolt, crackle } from '../src/dev/golem_gun_fx';
import { Light } from '../src/dev/warlock_fx';

paintWithoutCanvas();
gameSwitches();
const dir = process.argv[2];
if (!dir) throw new Error('give a directory');
mkdirSync(dir, { recursive: true });
const out: unknown[] = [];
const keep = (what: Record<string, unknown>, px: Px, ax: number, ay: number): void => {
  out.push({ ...what, w: px.w, h: px.h, ax, ay, data: Buffer.from(px.d).toString('base64') });
};
// (the shell: front and back, turned over or not, near and far, through its flight and its trail's end)
for (const [view, flip, dx, dy, n] of [['front', false, 4, 1, 6], ['front', true, -1, 5, 8], ['back', false, -3, -4, 9], ['back', true, -5, -0.5, 4]] as const) {
  for (const k of [0, 1, Math.floor(n / 2), n - 1, n + 1, n + 3]) {
    const p = shellFlightPiece(view, flip, dx, dy, k, n);
    keep({ kind: 'shell', view, flip, dx, dy, k, n }, p.px, p.ax, p.ay);
  }
}
// (the beam: out, held, thinning)
for (const [view, flip, dx, dy] of [['front', false, 6, 2], ['back', true, -2, -7], ['front', true, 0.5, 7.5]] as const) {
  for (const k of [0, 1, 5, 10, 13, 16]) {
    const p = beamPiece(view, flip, dx, dy, k);
    keep({ kind: 'beam', view, flip, dx, dy, k }, p.px, p.ax, p.ay);
  }
}
// (her tree's Contraption's energy bolt: from its firing to the last of its crackle and its ball's smoke)
for (const [view, flip, dx, dy] of [['front', false, 5, 1], ['back', true, -2, -6], ['front', true, 0.5, 3]] as const) {
  const { long } = boltFrames(view, flip, dx, dy);
  for (const k of [0, 1, 2, 4, 8, 14, long - 1]) {
    const p = boltPiece(view, flip, dx, dy, k);
    keep({ kind: 'bolt', view, flip, dx, dy, k }, p.px, p.ax, p.ay);
  }
}
// (a tesla coil's zap, render/tinkerer_fx.ts zapFrames, its four frames)
const G = 2;
for (const [x, y, up, to] of [[10.3, 7.7, 40, [{ x: 13, y: 8.5 }, { x: 14.2, y: 11 }]], [4.5, 20.25, 80, [{ x: 2, y: 18 }]]] as const) {
  const at = (px: number, py: number, z: number): [number, number] => [((px - py) - (x - y)) * 16 * G, (((px + py) - (x + y)) * 8 - z) * G];
  const pts = [at(x, y, up), ...to.map((p) => at(p.x, p.y, 14))];
  const pad = 40;
  const x0 = Math.min(...pts.map((p) => p[0])) - pad;
  const y0 = Math.min(...pts.map((p) => p[1])) - pad;
  const w = Math.ceil(Math.max(...pts.map((p) => p[0])) + pad - x0);
  const h = Math.ceil(Math.max(...pts.map((p) => p[1])) + pad - y0);
  const seed = Math.floor(Math.abs(x * 7 + y * 13) * 10);
  for (let k = 0; k < 4; k++) {
    const px = new Px(w, h);
    const l = new Light();
    for (let i = 1; i < pts.length; i++) {
      if (k < 3) bolt(l, pts[i - 1][0] - x0, pts[i - 1][1] - y0, pts[i][0] - x0, pts[i][1] - y0, seed + k * 31 + i, k);
      crackle(l, pts[i][0] - x0, pts[i][1] - y0, 12, k < 2 ? 5 : 3, seed + k * 17 + i * 5);
    }
    crackle(l, pts[0][0] - x0, pts[0][1] - y0, 8, 3, seed + k * 23);
    l.lay(px, GUN_GLOW);
    keep({ kind: 'zap', x, y, up, to, k }, px, -x0, -y0);
  }
}
writeFileSync(`${dir}/shots.json`, JSON.stringify(out));
console.log(`${out.length} pictures`);

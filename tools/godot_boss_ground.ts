// THE GODOT PORT: A BOSS'S GROUND OUT ON THE OPEN FLOORS (floors 6 to 10), as the game's own map-maker lays it, for what the
// Godot side cannot read off the floor's layout (godot/assets/floor<N>/layout.json):
//   npx tsx tools/godot_boss_ground.ts [seed] [floor]   -> godot/assets/floor<N>/boss.json
//   area   the boss's area (game/act1_layout.ts Blob: x, y, rx, ry, rot, wob, seed), and its ground as game.ts meetOutdoorBoss
//          asks of it: `inside`, a grid over its room (`x0`, `y0`, `w`, `h`, `step` tiles a cell), 1 where a cell's middle is
//          well inside it (blobDist < 0.8)
//   perch  where the boss stands on it, by its kind's rules (game/act1_rules/<kind>.ts bossAt; the Carrion Queen's with
//          `views`, which of her picture's ways round have their backs to the drop there: queen.ts perchOf)
//   drop   the Ledge Road's drop round the boss's room (land.drop: 1 where the ground falls away), over the same box as
//          `inside` and DROP_MARGIN tiles more each way, a tile a cell (`dx0`, `dy0`, `dw`, `dh`); none on a floor without one
// The floor is made as tools/godot_export.ts makes it (a new Warrior's game, the game's start switches on), and the boss's place
// is checked against the one in that floor's monsters.json.
import { readFileSync, writeFileSync } from 'node:fs';
import { paintWithoutCanvas } from '../tests/helpers';
import { gameSwitches } from './godot_switches';
import { Game } from '../src/game/game';
import { blobDist } from '../src/game/act1_layout';
import { act1Rules } from '../src/game/act1_rules/index';
import { perchOf as queenPerch } from '../src/game/act1_rules/queen';

declare const process: { argv: string[]; exit: (n: number) => never };
paintWithoutCanvas();
gameSwitches();
const seed = Number(process.argv[2] ?? 1) >>> 0;
const depth = Math.max(1, Number(process.argv[3] ?? 6) | 0);
const OUT = `godot/assets/floor${depth}${process.env.WS_OUT_SUFFIX ?? ""}`;
const STEP = 0.5;
const DROP_MARGIN = 8;

const game = new Game('warrior', seed);
game.depth = depth;
game.enterDungeon();
const L = game.level;
const land = L.land;
const area = land?.areas.find((a) => a.role === 'boss');
const boss = game.monsters.find((m) => m.boss);
if (!land || !area || !boss) {
  console.log(`floor ${depth}: no boss out on open ground`);
  process.exit(1);
}
const f = L.floor;
const room = f.rooms.find((r) => r.kind === 'boss');
const x0 = room ? room.x : Math.floor(area.blob.x - area.blob.rx - 2);
const y0 = room ? room.y : Math.floor(area.blob.y - area.blob.ry - 2);
const w = room ? room.w : Math.ceil(2 * area.blob.rx + 4);
const h = room ? room.h : Math.ceil(2 * area.blob.ry + 4);
const nw = Math.round(w / STEP);
const nh = Math.round(h / STEP);
const inside: number[] = [];
for (let j = 0; j < nh; j++) for (let i = 0; i < nw; i++) inside.push(blobDist(area.blob, x0 + (i + 0.5) * STEP, y0 + (j + 0.5) * STEP) < 0.8 ? 1 : 0);
const rules = act1Rules(boss.kind);
const at = rules && rules.bossAt ? rules.bossAt(L) : null;
const qp = boss.kind === 'queen' ? queenPerch(L) : null;
const perch = qp ? { ...qp } : at ? { ...at } : null;
let drop: Record<string, number | number[]> | null = null;
if (land.drop) {
  const dx0 = Math.max(0, x0 - DROP_MARGIN);
  const dy0 = Math.max(0, y0 - DROP_MARGIN);
  const dw = Math.min(f.w, x0 + w + DROP_MARGIN) - dx0;
  const dh = Math.min(f.h, y0 + h + DROP_MARGIN) - dy0;
  const cells: number[] = [];
  for (let ty = dy0; ty < dy0 + dh; ty++) for (let tx = dx0; tx < dx0 + dw; tx++) cells.push(land.drop[ty * f.w + tx] === 1 ? 1 : 0);
  drop = { dx0, dy0, dw, dh, cells };
}
// (the same floor as the one exported: the boss where its monsters.json has it)
const had = JSON.parse(readFileSync(`${OUT}/monsters.json`, 'utf8')).monsters.find((m: { boss: boolean }) => m.boss) as { kind: string; x: number; y: number } | undefined;
if (!had || had.kind !== boss.kind || Math.hypot(had.x - boss.x, had.y - boss.y) > 1e-6) {
  console.log(`floor ${depth}: the boss made here (${boss.kind} at ${boss.x}, ${boss.y}) is not the one in ${OUT}/monsters.json`);
  process.exit(1);
}
writeFileSync(`${OUT}/boss.json`, JSON.stringify({ kind: boss.kind, area: { ...area.blob, inside: { x0, y0, w, h, step: STEP, cells: inside } }, perch, drop }));
console.log(`floor ${depth}: ${boss.kind}'s ground: its area at (${area.blob.x.toFixed(2)}, ${area.blob.y.toFixed(2)}), ${inside.filter((v) => v).length} of ${inside.length} cells well inside; perch ${perch ? JSON.stringify(perch) : 'none'}; drop ${drop ? `${drop.dw}x${drop.dh}` : 'none'}`);

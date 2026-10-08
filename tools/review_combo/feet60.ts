// (scratch) At 60 frames a second, as a phone shows it: how far each foot's ball moves over the floor while it stays on it, in game pixels.
import { MOVES3 } from '../../src/art/moves3';
import { bonesAt, project, solve } from '../../src/art/skeleton';
import { COMBO } from '../../src/game/defs';
import { Game } from '../../src/game/game';
import { emptyControls } from '../../src/game/state';
COMBO.on = true;
const face: [number, number] = process.argv[2] === 'back' ? [0, -1] : [1, 0];
const view = process.argv[2] === 'back' ? 'back' : 'front';
const game = Game.forPractice('warrior', 3);
(game as unknown as { waveT: number }).waveT = 1e9;
game.monsters.length = 0;
const h = game.hero; h.x = 14.5; h.y = 15.5; h.fx = face[0]; h.fy = face[1];
const x0 = h.x, y0 = h.y; const dt = 1 / 60;
let order = false; let lastAge = 1e9; let swing = -1; const taps = [0.3, 1.25];
type Track = { on: boolean; start: [number, number]; most: number; from: string; to: string };
const tr: Record<string, Track> = {};
const report: string[] = [];
for (let i = 0; i < 150; i++) {
  const t = i * dt; const ctl = emptyControls(); ctl.aimX = h.x + face[0] * 2; ctl.aimY = h.y + face[1] * 2;
  for (const at of taps) if (t <= at && t + dt > at) order = true;
  if (order) { ctl.fire = true; }
  game.update(dt, ctl);
  if (h.anim === 'attack' && h.attackAge < lastAge) { swing++; order = false; }
  lastAge = h.anim === 'attack' ? h.attackAge : 1e9;
  let move = 'rear', tm = 0, fr = 0;
  if (h.anim === 'attack') {
    move = h.combo === 1 ? 'kslash' : 'strike'; const m = MOVES3[move]; const hit = m.motion.hit ?? 0;
    const end = m.motion.keys[m.motion.keys.length - 1].at; const n = Math.ceil(end * 30 - 1e-6) + 1;
    const tc = h.attackAge < h.attackWind ? (h.attackAge / h.attackWind) * hit : hit + (h.attackAge - h.attackWind);
    fr = Math.max(0, Math.min(n - 1, Math.floor(tc * 30 + 1e-6))); tm = Math.min(end, fr / 30);
  }
  const m = MOVES3[move]; const s = solve(m.build, bonesAt(m.motion.keys, m.rest, tm));
  const dx = h.x - x0, dy = h.y - y0; const ax = (dx - dy) * 16, ay = (dx + dy) * 8; // game px
  for (const [nm, toe, heel] of [['front', s.toeL, s.heelL], ['back', s.toeR, s.heelR]] as const) {
    const p = project(toe as [number, number, number], view); const sx = ax + p[0] / 2, sy = ay + p[1] / 2; // picture px to game px
    const on = Math.min(toe[2], heel[2]) < 0.5;
    const key = `${swing}:${nm}`; const label = `${move} f${fr}`;
    const k = tr[key] ?? (tr[key] = { on: false, start: [0, 0], most: 0, from: '', to: '' });
    if (on && !k.on) { k.start = [sx, sy]; k.from = label; }
    if (on) { const d = Math.hypot(sx - k.start[0], sy - k.start[1]); if (d > k.most) { k.most = d; k.to = label; } }
    if (!on && k.on && k.most > 0.25) { report.push(`swing ${swing} ${nm} foot: on the floor from ${k.from}, moved ${k.most.toFixed(1)} game px by ${k.to} before it lifted`); k.most = 0; }
    k.on = on;
  }
}
for (const [key, k] of Object.entries(tr)) if (k.on && k.most > 0.25) report.push(`swing ${key.split(':')[0]} ${key.split(':')[1]} foot: on the floor from ${k.from}, moved ${k.most.toFixed(1)} game px by ${k.to} (still down)`);
console.log(`${view}: hero moved ${Math.hypot(h.x - x0, h.y - y0).toFixed(3)} tiles in ${swing + 1} swings`);
console.log(report.join('\n'));

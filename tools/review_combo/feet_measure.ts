// (scratch, not committed) Replays src/dev/preview_combo.ts's cells in node and says, for each GIF
// frame, where each foot's heel and toe are on the GIF's screen and how high off the floor.
import { MOVES3 } from '../../src/art/moves3';
import { bonesAt, project, solve } from '../../src/art/skeleton';
import { COMBO, TUNE } from '../../src/game/defs';
import { Game } from '../../src/game/game';
import { emptyControls } from '../../src/game/state';

COMBO.on = true;
const S = 4, FPS = 25, TICK = 1 / FPS, SUB = 5, SECONDS = 4.4, TICKS = Math.round(SECONDS * FPS);
const CW = 88, CH = 80, FX = 30, FY = [50, 64], PAD = 8, HEAD = 84, LABEL = 40;
type Inner = { waveT: number };
function newGame(face: [number, number]): Game {
  const game = Game.forPractice('warrior', 3);
  (game as unknown as Inner).waveT = 1e9;
  game.monsters.length = 0;
  game.hero.x = 14.5; game.hero.y = 15.5; game.hero.fx = face[0]; game.hero.fy = face[1];
  game.events.length = 0;
  return game;
}
const probe = newGame([1, 0]);
const BETWEEN = 1 / Math.max(0.3, probe.hero.skills[0].r.rate);
const SECOND_UNTIL = BETWEEN + TUNE.comboWindow;
const LATE = 0.3 + SECOND_UNTIL + 0.35;
console.log(`rate ${probe.hero.skills[0].r.rate.toFixed(3)} between ${BETWEEN.toFixed(3)}s`);
const which = process.argv[2] ?? 'tt';
const view = Number(process.argv[3] ?? 0);
const face: [number, number] = view === 0 ? [1, 0] : [0, -1];
const taps = which === 'tt' ? [0.3, 0.62] : which === 'late' ? [0.3, LATE] : [];
const held = which === 'held' ? 0.3 : -1;
const row = which === 'tt' ? 0 : which === 'late' ? 1 : 2;
const game = newGame(face);
const h = game.hero;
const x0g = h.x, y0g = h.y;
const cx0 = PAD + view * (CW * S + PAD), cy0 = HEAD + row * (CH * S + LABEL + PAD);
let order: { uses: number; t: number } | null = null;
const v = view === 0 ? 'front' : 'back';
for (let k = 0; k <= TICKS; k++) {
  const t0 = k * TICK;
  const dt = TICK / SUB;
  for (let j = 0; j < SUB; j++) {
    const t = t0 + j * dt;
    const ctl = emptyControls();
    ctl.aimX = h.x + face[0] * 2; ctl.aimY = h.y + face[1] * 2;
    for (const at of taps) if (t <= at && t + dt > at) order = { uses: h.skills[0].uses, t: 0 };
    if (order) { order.t += dt; if (h.skills[0].uses > order.uses || order.t > 3) order = null; else ctl.fire = true; }
    if (held >= 0 && t >= held && t < SECONDS - 0.9) ctl.fire = true;
    game.update(dt, ctl);
  }
  // what the figure shows (figure.ts: attackFrame, frameOf; the clips are 30 a second)
  let move = 'rear', fr = 0, tm = 0;
  if (h.anim === 'attack') {
    move = h.combo === 1 ? 'kslash' : 'strike';
    const m = MOVES3[move];
    const hit = m.motion.hit ?? 0;
    const end = m.motion.keys[m.motion.keys.length - 1].at;
    const n = Math.ceil(end * 30 - 1e-6) + 1;
    const tc = h.attackAge < h.attackWind ? (h.attackWind > 0 ? (h.attackAge / h.attackWind) * hit : hit) : hit + (h.attackAge - h.attackWind);
    fr = Math.max(0, Math.min(n - 1, Math.floor(tc * 30 + 1e-6)));
    tm = Math.min(end, fr / 30);
  }
  const m = MOVES3[move];
  const q = bonesAt(m.motion.keys, m.rest, move === 'rear' ? 0 : tm);
  const s = solve(m.build, q);
  const dx = h.x - x0g, dy = h.y - y0g;
  const ax = cx0 + (FX + (dx - dy) * 16) * S, ay = cy0 + (FY[view] + (dx + dy) * 8) * S;
  const scr = (p: readonly number[]): string => { const pr = project(p as [number, number, number], v); return `${(ax + pr[0] * S / 2).toFixed(1)},${(ay + pr[1] * S / 2).toFixed(1)}`; };
  const foot = (nm: string, heel: readonly number[], toe: readonly number[]): string => `${nm} heel ${scr(heel)} z${heel[2].toFixed(1)} toe ${scr(toe)} z${toe[2].toFixed(1)}`;
  console.log(`gif ${String(k).padStart(3)} ${move.padEnd(6)} f${String(fr).padStart(2)} step ${Math.hypot(dx, dy).toFixed(3)}t | ${foot('L', s.heelL, s.toeL)} | ${foot('R', s.heelR, s.toeR)}`);
}

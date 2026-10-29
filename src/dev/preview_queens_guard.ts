// Dev page: FLOOR 18'S QUEEN'S GUARD (art/queens_guard.ts, art/queens_guard_moves.ts, art/queens_guard_fx.ts), standing,
// from in front and from behind, beside the knight for size; a file of them at the game's size; a move close up; and the
// film of every move at the scale of a boss arena. Nothing of the game imports it. The floor is a stand-in for the Glass
// Gallery's (polished dark stone in tiles, silver seams; not the floor's own art, which is not made yet).
//   PREVIEW_TIMEOUT=200000 node tools/preview.mjs src/dev/preview_queens_guard.ts shots/qg/sheet.png 1200 620 "sheet"
//   ... "big:<move>:<t>" (front and behind, four times as big), "grid:<move>:<t>,<t>,..." (a move at several moments,
//   twice as big, front above and behind below)
//   film: node tools/queens_guard_film.mjs (window.__film: how many frames, and each drawn on asking)
import type { Sprite } from '../engine/px';
import { makeHeroArt3 } from '../art/heroes3';
import { toSprite } from '../art/kit';
import type { Painted } from '../art/kit';
import { TILE3, canvasOf, deathOfMob, paintMob } from '../art/new_mobs3';
import type { Mob } from '../art/new_mobs3';
import { QG_BASH, QG_CHARGE, QG_CHARGE_EVERY, QG_CHARGE_IN, QG_CHARGE_OUT, QG_CHOP, QG_DIES, QG_MARCH, QG_REEL, QG_STAND, QG_WALK, QUEENS_GUARD, bashCarried } from '../art/queens_guard_moves';
import { BASH_CANVAS, BASH_FX, CHOP_CANVAS, CHOP_FX, bashPainted, chopPainted } from '../art/queens_guard_fx';
import type { GameView } from '../art/skin';

const [mode = 'sheet', a1 = 'stand', a2 = '0'] = decodeURIComponent(location.hash.slice(1)).split(':');
const cv = document.createElement('canvas');
cv.width = window.innerWidth;
cv.height = window.innerHeight;
cv.style.display = 'block';
document.body.style.margin = '0';
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;

// =============================================================================================
// A STAND-IN FLOOR FOR THE GLASS GALLERY: polished dark stone in tiles (a tile 64 by 32 picture pixels), silver seams, a
// faint sheen; and the edge of a boss arena (an ellipse 17 by 20 tiles) where asked

/** Picture pixels across and down for a place on the floor (figure lengths: forward and to the left, as seen from in front). */
const onFloor = (x: number, y: number): [number, number] => [(32 / TILE3) * (x + y), (16 / TILE3) * (x - y)];
function floor(w: number, h: number, ox: number, oy: number, k: number, arena: [number, number] | null): HTMLCanvasElement {
  const W = Math.ceil(w / k);
  const H = Math.ceil(h / k);
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const cg = c.getContext('2d') as CanvasRenderingContext2D;
  const img = cg.createImageData(W, H);
  const put = (i: number, col: number[]): void => {
    img.data[i] = col[0];
    img.data[i + 1] = col[1];
    img.data[i + 2] = col[2];
    img.data[i + 3] = 255;
  };
  const A = [31, 28, 43];
  const Bc = [37, 34, 51];
  const SEAM = [62, 58, 84];
  const SEAM_LIT = [92, 88, 120];
  const VEIN = [46, 42, 62];
  const RIM = [86, 80, 116];
  const OUT = [16, 14, 24];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const sx = x - ox / k;
      const sy = y - oy / k;
      // (back to the floor: tiles along each of the two ways)
      const ti = (sx / 32 + sy / 16) / 2;
      const tj = (sx / 32 - sy / 16) / 2;
      const fi = ti - Math.floor(ti);
      const fj = tj - Math.floor(tj);
      const i = (y * W + x) * 4;
      let col = (Math.floor(ti) + Math.floor(tj)) % 2 === 0 ? A : Bc;
      // a vein through the stone here and there
      const vein = Math.sin(ti * 9.1 + tj * 3.7) + Math.sin(ti * 2.3 - tj * 7.9);
      if (Math.abs(vein - 1.2) < 0.04) col = VEIN;
      if (fi < 0.022 || fj < 0.022) col = fi < 0.022 && fj > 0.5 ? SEAM_LIT : SEAM;
      // a sheen of the glasshouse's light across the polish
      const sheen = Math.sin((sx - sy * 2) * 0.012);
      if (sheen > 0.985 && (x + y) % 2 === 0) col = [col[0] + 10, col[1] + 10, col[2] + 14];
      if (arena) {
        const e = Math.hypot(ti / arena[0], tj / arena[1]);
        if (e > 1.0 && e < 1.0 + 0.6 / Math.max(arena[0], arena[1])) col = RIM;
        else if (e >= 1.0 + 0.6 / Math.max(arena[0], arena[1])) col = (x + y) % 3 ? OUT : A;
      }
      put(i, col);
    }
  }
  cg.putImageData(img, 0, 0);
  return c;
}
function laidFloor(ox: number, oy: number, k: number, arena: [number, number] | null = null): void {
  const f = floor(cv.width, cv.height, ox, oy, k, arena);
  g.drawImage(f, 0, 0, f.width * k, f.height * k);
}

function draw(s: Sprite, x: number, y: number, k: number): void {
  const d = s.density ?? 1;
  g.drawImage(s.img, Math.round(x - s.ax * d * k), Math.round(y - s.ay * d * k), s.w * d * k, s.h * d * k);
}
const CACHE = new Map<string, Sprite>();
const spOf = (mob: Mob, which: string, t: number, view: GameView): Sprite => {
  const key = `${which}:${t.toFixed(4)}:${view}`;
  let s = CACHE.get(key);
  if (!s) {
    s = which === 'dying' ? toSprite(deathOfMob(mob, Math.min(1, t / mob.dieTime), view), null, canvasOf(mob).ax, canvasOf(mob).ay) : toSprite(paintMob(mob, which, t, view), mob.aura, canvasOf(mob).ax, canvasOf(mob).ay);
    CACHE.set(key, s);
  }
  return s;
};
const fxSprite = (p: Painted, can: { ax: number; ay: number }): Sprite => toSprite(p, null, can.ax, can.ay);
const hero = makeHeroArt3().of('warrior', { twoHanded: false });
const G = QUEENS_GUARD;
function label(text: string, x: number, y: number, size = 15, color = '#e8e4f4'): void {
  g.font = `bold ${size}px sans-serif`;
  g.fillStyle = 'rgba(8,6,14,0.75)';
  const w = g.measureText(text).width;
  g.fillRect(x - 6, y - size - 2, w + 12, size + 9);
  g.fillStyle = color;
  g.fillText(text, x, y);
}

if (mode === 'sheet') {
  // THE SHEET: the queen's guard from in front and from behind, beside the knight, three times as big; a file of them at
  // the game's size
  const K = 3;
  laidFloor(0, cv.height * 0.55, K);
  const y = cv.height - 70;
  draw(hero.front.idle[0], 90, y, K);
  draw(spOf(G, 'stand', 0, 'front'), 330, y, K);
  draw(spOf(G, 'stand', 0, 'back'), 620, y, K);
  draw(hero.back.idle[0], 820, y, K);
  // (at the game's size, three of them marching on the knight)
  const x0 = 930;
  const y0 = y - 120;
  g.fillStyle = 'rgba(8,6,14,0.55)';
  g.fillRect(x0 - 20, y0 - 150, 290, 230);
  draw(hero.front.idle[0], x0 + 220, y0 + 50, 1);
  for (const [dx, dy, t] of [[20, -40, 0.0], [60, -6, 0.35], [10, 20, 0.7]] as const) draw(spOf(G, 'walk', t, 'front'), x0 + dx, y0 + dy, 1);
  label('The queen’s guard, floor 18 (medium): from in front, from behind, beside the knight (3× size)', 14, 26);
  label('At the game’s size', x0 - 10, y0 - 128, 13);
} else if (mode === 'big') {
  const K = 4;
  laidFloor(0, cv.height * 0.5, K);
  const t = Number(a2) || 0;
  draw(spOf(G, a1, t, 'front'), cv.width * 0.3, cv.height - 70, K);
  draw(spOf(G, a1, t, 'back'), cv.width * 0.72, cv.height - 70, K);
} else if (mode === 'grid') {
  // A MOVE AT SEVERAL MOMENTS (`grid:<move>:<t>,<t>,...`), twice as big: from in front along the top, from behind below
  const K = 2;
  laidFloor(0, cv.height * 0.5, K);
  const ts = a2.split(',').map(Number);
  const w = cv.width / ts.length;
  ts.forEach((t, i) => {
    for (const [row, view] of [[0, 'front'], [1, 'back']] as const) {
      const y = (cv.height / 2) * (row + 1) - 30;
      draw(spOf(G, a1, t, view), w * (i + 0.42), y, K);
      label(`${t.toFixed(3)} s`, w * i + 8, y + 22, 12);
    }
  });
}

// =============================================================================================
// THE FILM: every move at the scale of a boss arena with the knight in it for size (left), and close up from in front and
// from behind (right); each strike again at half speed

interface Shot {
  /** What it says. */
  say: string;
  /** How long (seconds of film). */
  long: number;
  /** The move, and its own time at a moment of the film (seconds into the shot). */
  move: (s: number) => { move: string; t: number };
  /** Where they stand on the floor (figure lengths from the arena's middle, as seen from in front), and the way they face (front: toward the bottom right; back: toward the top right). */
  at: (s: number) => [number, number];
  view: GameView;
  /** The floor's mark of a blow, if any: which, how long since it began, and where. */
  fx?: (s: number) => { which: 'chop' | 'bash'; t: number; at: [number, number] } | null;
  /** Where the knight stands. */
  knight: [number, number];
  /** Where the camera looks (the middle of the arena's view), if not between them. */
  cam?: [number, number];
}
const T = TILE3;
const FPS = 30;
/** The way they face on the floor (figure lengths, as seen from in front): from in front, +x; from behind, +y. */
const way = (view: GameView): [number, number] => (view === 'front' ? [1, 0] : [0, 1]);
const along = (o: [number, number], view: GameView, d: number): [number, number] => [o[0] + way(view)[0] * d, o[1] + way(view)[1] * d];
function shots(): Shot[] {
  const out: Shot[] = [];
  const W = QG_WALK.frames / QG_WALK.fps;
  // STANDING
  out.push({ say: 'Standing on guard: shield up, halberd upright, breathing', long: 3.2, move: (s) => ({ move: 'stand', t: s }), at: () => [-2 * T, 0], view: 'front', knight: [2.6 * T, 0.6 * T] });
  for (const view of ['front', 'back'] as GameView[]) {
    // MEASURED, THEN A SUDDEN CHARGE: marching, then all at once flat out (into the charge, its run), skidding to a stop
    // before the knight, and the shield charge into him
    const start: [number, number] = view === 'front' ? [-7 * T, -0.5 * T] : [-0.5 * T, -7 * T];
    const m = 2.4;
    const ci = QG_CHARGE_IN.long;
    const c = 2 * QG_CHARGE_EVERY;
    const co = QG_CHARGE_OUT.long;
    const bash = QG_BASH.long;
    const dM = QG_MARCH * m * T;
    const dC = dM + QG_CHARGE * (ci + c) * T;
    const dO = dC + QG_CHARGE_OUT.shift;
    const dB = dO + QG_BASH.carry * T + QG_BASH.end;
    const knight: [number, number] = along(start, view, dO + QG_BASH.carry * T + 1.3 * T);
    out.push({
      say: `March (${QG_MARCH} tile/s), then a sudden charge (${QG_CHARGE} tiles/s), skid, shield charge — ${view === 'front' ? 'from in front' : 'from behind'}`,
      long: m + ci + c + co + bash + 0.4,
      move: (s) => {
        if (s < m) return { move: 'walk', t: s % W };
        if (s < m + ci) return { move: 'chargeIn', t: s - m };
        if (s < m + ci + c) return { move: 'charge', t: (s - m - ci) % W };
        if (s < m + ci + c + co) return { move: 'chargeOut', t: s - m - ci - c };
        return { move: 'bash', t: Math.min(bash, s - m - ci - c - co) };
      },
      at: (s) => {
        const tb = s - m - ci - c - co;
        const d = s < m ? QG_MARCH * s * T : s < m + ci + c ? dM + QG_CHARGE * (s - m) * T : tb < 0 ? dC : tb < bash ? dO + bashCarried(tb) : dB;
        return along(start, view, d);
      },
      view,
      fx: (s) => {
        const tb = s - m - ci - c - co;
        return tb >= QG_BASH.hit ? { which: 'bash', t: tb - QG_BASH.hit, at: along(start, view, dO + QG_BASH.carry * T) } : null;
      },
      knight,
      cam: along(start, view, dB / 2),
    });
  }
  // THE HALBERD CHOP, from in front and from behind, then its strike at half speed
  for (const view of ['front', 'back'] as GameView[]) {
    const at: [number, number] = view === 'front' ? [-4 * T, 0] : [0, -4 * T];
    out.push({ say: `The halberd chop — its line ${QG_CHOP.from}–${QG_CHOP.reach} tiles out, ${QG_CHOP.wide} wide — ${view === 'front' ? 'from in front' : 'from behind'}`, long: QG_CHOP.long + 0.2, move: (s) => ({ move: 'attack', t: Math.min(QG_CHOP.long, s) }), at: () => at, view, fx: (s) => (s >= QG_CHOP.hit ? { which: 'chop', t: s - QG_CHOP.hit, at } : null), knight: view === 'front' ? [3.4 * T, 2.4 * T] : [2.4 * T, 3.4 * T] });
  }
  {
    const at: [number, number] = [-4 * T, 0];
    const t0 = QG_CHOP.warn[1] - 0.2;
    out.push({ say: 'The halberd chop’s strike at half speed: two frames, smeared', long: 1.2, move: (s) => ({ move: 'attack', t: t0 + Math.floor((s / 2) * FPS) / FPS }), at: () => at, view: 'front', fx: (s) => { const t = t0 + Math.floor((s / 2) * FPS) / FPS; return t >= QG_CHOP.hit ? { which: 'chop', t: t - QG_CHOP.hit, at } : null; }, knight: [3.4 * T, 2.4 * T] });
  }
  // THE SHIELD CHARGE again, close, from in front and from behind, and at half speed
  for (const view of ['front', 'back'] as GameView[]) {
    const start: [number, number] = view === 'front' ? [-4 * T, 0] : [0, -4 * T];
    out.push({
      say: `The shield charge — carried ${QG_BASH.carry} tiles in two frames, a ring ${QG_BASH.ring} tiles across — ${view === 'front' ? 'from in front' : 'from behind'}`,
      long: QG_BASH.long + 0.2,
      move: (s) => ({ move: 'bash', t: Math.min(QG_BASH.long, s) }),
      at: (s) => along(start, view, bashCarried(s) + (s >= QG_BASH.long ? QG_BASH.end : 0)),
      view,
      fx: (s) => (s >= QG_BASH.hit ? { which: 'bash', t: s - QG_BASH.hit, at: along(start, view, QG_BASH.carry * T) } : null),
      knight: view === 'front' ? [1.6 * T, 2.6 * T] : [2.6 * T, 1.6 * T],
    });
  }
  {
    const start: [number, number] = [-4 * T, 0];
    const t0 = QG_BASH.warn[1] - 0.2;
    const tt = (s: number): number => t0 + Math.floor((s / 2) * FPS) / FPS;
    out.push({ say: 'The shield charge’s strike at half speed: two frames, smeared, the mirror’s flash', long: 1.2, move: (s) => ({ move: 'bash', t: tt(s) }), at: (s) => along(start, 'front', bashCarried(tt(s))), view: 'front', fx: (s) => (tt(s) >= QG_BASH.hit ? { which: 'bash', t: tt(s) - QG_BASH.hit, at: along(start, 'front', QG_BASH.carry * T) } : null), knight: [1.6 * T, 2.6 * T] });
  }
  // STRUCK, both ways
  out.push({ say: 'Struck', long: 1.2, move: (s) => ({ move: s < 0.6 ? 'reel' : 'reel', t: Math.min(QG_REEL, s % 0.6) }), at: () => [-2 * T, 0], view: 'front', knight: [1 * T, 0.4 * T] });
  out.push({ say: 'Struck — from behind', long: 0.8, move: (s) => ({ move: 'reel', t: Math.min(QG_REEL, s % 0.6) }), at: () => [0, -2 * T], view: 'back', knight: [0.4 * T, 1 * T] });
  // THE DEATH, both ways
  for (const view of ['front', 'back'] as GameView[]) {
    out.push({ say: `The shield cracks like glass; to one knee; the Hush leaves him; down — ${view === 'front' ? 'from in front' : 'from behind'}`, long: QG_DIES.long + 0.6, move: (s) => ({ move: 'dying', t: Math.min(QG_DIES.long, s) }), at: () => (view === 'front' ? [-2 * T, 0] : [0, -2 * T]), view, knight: view === 'front' ? [1.4 * T, 1.0 * T] : [1.0 * T, 1.4 * T] });
  }
  return out;
}
const SHOTS = shots();
const FRAMES = SHOTS.map((s) => Math.round(s.long * FPS));
const TOTAL = FRAMES.reduce((a, b) => a + b, 0);
function filmFrame(i: number): void {
  let k = i;
  let si = 0;
  while (si < SHOTS.length - 1 && k >= FRAMES[si]) k -= FRAMES[si++];
  const shot = SHOTS[si];
  const s = k / FPS;
  const { move, t } = shot.move(s);
  // THE ARENA: the camera on the middle of what happens
  const AW = 800;
  const K = 1.25;
  const pos = shot.at(s);
  const mid: [number, number] = shot.cam ?? [(shot.knight[0] + shot.at(0)[0]) / 2, (shot.knight[1] + shot.at(0)[1]) / 2];
  const [mx, my] = onFloor(mid[0], mid[1]);
  const ox = AW / 2 - mx * K;
  const oy = cv.height / 2 + 30 - my * K;
  g.save();
  g.beginPath();
  g.rect(0, 0, AW, cv.height);
  g.clip();
  laidFloor(ox, oy, K, [8.5, 10]);
  const scr = (p: [number, number]): [number, number] => {
    const [x, y] = onFloor(p[0], p[1]);
    return [ox + x * K, oy + y * K];
  };
  const fx = shot.fx?.(s);
  if (fx) {
    const p = fx.which === 'chop' ? chopPainted(fx.t, shot.view) : bashPainted(fx.t, shot.view);
    const [fxX, fxY] = scr(fx.at);
    if ((fx.which === 'chop' && fx.t <= CHOP_FX.long) || (fx.which === 'bash' && fx.t <= BASH_FX.long)) draw(fxSprite(p, fx.which === 'chop' ? CHOP_CANVAS : BASH_CANVAS), fxX, fxY, K);
  }
  const [kx, ky] = scr(shot.knight);
  const [gx, gy] = scr(pos);
  const guard = spOf(G, move, t, shot.view);
  const kn = hero.front.idle[Math.floor(s * 10) % hero.front.idle.length];
  if (ky < gy) {
    draw(kn, kx, ky, K);
    draw(guard, gx, gy, K);
  } else {
    draw(guard, gx, gy, K);
    draw(kn, kx, ky, K);
  }
  // (a tile, for size)
  g.restore();
  // CLOSE UP: from in front above, from behind below
  g.fillStyle = '#0c0a14';
  g.fillRect(AW, 0, cv.width - AW, cv.height);
  const CK = 1.7;
  for (const [row, view] of [[0, 'front'], [1, 'back']] as const) {
    const top = row * (cv.height / 2);
    g.save();
    g.beginPath();
    g.rect(AW + 4, top + 4, cv.width - AW - 8, cv.height / 2 - 8);
    g.clip();
    laidFloor(AW, top + cv.height / 4, CK);
    const cx = AW + (cv.width - AW) * 0.42;
    const cy = top + cv.height / 2 - 34;
    // (the close-ups stand still: the shield charge's carry is shown in the arena)
    draw(spOf(G, move, t, view), cx, cy, CK);
    g.restore();
    label(view === 'front' ? 'in front' : 'behind', AW + 12, top + 24, 13, '#cfc8ec');
  }
  label(shot.say, 12, 26, 16);
  const NAMES: Record<string, string> = { walk: 'march', attack: 'halberd chop', bash: 'shield charge', reel: 'struck', dying: 'death', chargeIn: 'into the charge', charge: 'charge', chargeOut: 'out of the charge (skid)', stand: 'stand' };
  label(`${NAMES[move] ?? move} ${t.toFixed(2)} s`, 12, cv.height - 14, 13, '#b8b2d8');
  label('arena: an ellipse 17 by 20 tiles; a tile is one floor square', AW - 410, cv.height - 14, 12, '#9c96bc');
}
(window as unknown as { __film: { count: number; draw: (i: number) => void } }).__film = { count: TOTAL, draw: filmFrame };
if (mode === 'film') filmFrame(Number(a1) || 0);
void QG_STAND;
(window as unknown as { __ready: boolean }).__ready = true;

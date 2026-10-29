// Dev page: FLOOR 19'S CROSSBOWMEN ON THE WALLS (art/keep_crossbowmen.ts, art/keep_crossbowmen_moves.ts,
// art/keep_crossbowmen_fx.ts), on a floor of the keep's cold flagstones (painted here for the pictures only: floor 19's
// own ground is not made yet). Nothing of the game imports it.
//   PREVIEW_TIMEOUT=200000 node tools/preview.mjs src/dev/preview_keep_crossbowmen.ts shots/cb/sheet.png 1200 520 "sheet"
//   ... "big:<move>:<t>" (front and behind, four times as big), "grid:<move>:<t>,<t>,..." (a move at several moments,
//   both ways round, twice as big), "film" (the film, frame by frame: window.__film; tools/crossbow_film.mjs)
import type { Sprite } from '../engine/px';
import { makeHeroArt3 } from '../art/heroes3';
import { toSprite } from '../art/kit';
import type { Painted } from '../art/kit';
import { canvasOf, deathOfMob, paintMob } from '../art/new_mobs3';
import type { Mob } from '../art/new_mobs3';
import { CB_DIES, CB_PACE, CB_PLANT, CB_RELOAD, CB_SHOT, CROSSBOWMAN } from '../art/keep_crossbowmen_moves';
import { CB_FX_CANVAS, CB_LANE, shotPainted } from '../art/keep_crossbowmen_fx';
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

// --- THE KEEP'S FLOOR, for the pictures: cold flagstones, laid in courses, worn and cracked (picture pixels) ---
const hashN = (a: number, b: number, c: number): number => {
  let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
const STONE = ['#22252c', '#2a2e36', '#30353e', '#373c46', '#3e434e'];
const JOINT = '#15171c';
const LIT = '#4a505c';
/** The floor under picture pixel (x, y), the floor's origin at (ox, oy): a tile is 64 by 32. */
function floorAt(x: number, y: number): string {
  const a = (x / 32 + y / 16) / 2;
  const b = (y / 16 - x / 32) / 2;
  // (courses along a, each tile two flags along b, every other course offset half a flag)
  const row = Math.floor(a * 1.0);
  const fb = b * 2 + (row % 2 ? 0.5 : 0);
  const col = Math.floor(fb);
  const ua = a - row;
  const ub = fb - col;
  if (ua < 0.05 || ub < 0.07) return JOINT;
  if (ua < 0.1 || ub < 0.13) return LIT;
  const tone = Math.floor(hashN(row, col, 11) * 3) + 1;
  // (worn and cracked here and there)
  const crack = hashN(row, col, 12) < 0.25 && Math.abs((ua - 0.5) * 0.9 - (ub - 0.5) * 0.5 + (hashN(row, col, 13) - 0.5) * 0.4) < 0.025;
  if (crack) return JOINT;
  const grain = hashN(Math.floor(x / 2), Math.floor(y / 2), 14);
  return STONE[Math.max(0, Math.min(4, tone + (grain > 0.92 ? 1 : grain < 0.08 ? -1 : 0)))];
}
function floor(w: number, h: number, ox: number, oy: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const cx = c.getContext('2d') as CanvasRenderingContext2D;
  const img = cx.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const col = floorAt(x - ox, y - oy);
      const i = (y * w + x) * 4;
      img.data[i] = parseInt(col.slice(1, 3), 16);
      img.data[i + 1] = parseInt(col.slice(3, 5), 16);
      img.data[i + 2] = parseInt(col.slice(5, 7), 16);
      img.data[i + 3] = 255;
    }
  }
  cx.putImageData(img, 0, 0);
  return c;
}
/** The floor filling the canvas at `k` times (picture pixels), its origin at screen (sx, sy). */
function ground(k: number, sx = 0, sy = 0): void {
  const w = Math.ceil(cv.width / k) + 2;
  const h = Math.ceil(cv.height / k) + 2;
  const f = floor(w, h, Math.round(sx / k), Math.round(sy / k));
  g.drawImage(f, 0, 0, w * k, h * k);
}

function draw(s: Sprite, x: number, y: number, k: number, flip = false): void {
  const d = s.density ?? 1;
  if (!flip) {
    g.drawImage(s.img, Math.round(x - s.ax * d * k), Math.round(y - s.ay * d * k), s.w * d * k, s.h * d * k);
    return;
  }
  g.save();
  g.translate(Math.round(x), 0);
  g.scale(-1, 1);
  g.drawImage(s.img, Math.round(-s.ax * d * k), Math.round(y - s.ay * d * k), s.w * d * k, s.h * d * k);
  g.restore();
}
const cache = new Map<string, Sprite>();
const spOf = (mob: Mob, which: string, t: number, view: GameView): Sprite => {
  const key = `${which}:${t.toFixed(4)}:${view}`;
  let s = cache.get(key);
  if (!s) {
    s = which === 'dying' ? toSprite(deathOfMob(mob, Math.min(1, t / mob.dieTime), view), null, canvasOf(mob).ax, canvasOf(mob).ay) : toSprite(paintMob(mob, which, t, view), mob.aura, canvasOf(mob).ax, canvasOf(mob).ay);
    cache.set(key, s);
  }
  return s;
};
const fxCache = new Map<string, { under: Sprite; over: Sprite }>();
const fxOf = (t: number, view: GameView): { under: Sprite; over: Sprite } => {
  const key = `${t.toFixed(4)}:${view}`;
  let f = fxCache.get(key);
  if (!f) {
    const p = shotPainted(t, view);
    const sp = (x: Painted): Sprite => x.px.sprite(CB_FX_CANVAS.ax, CB_FX_CANVAS.ay, 1);
    f = { under: sp(p.under), over: sp(p.over) };
    fxCache.set(key, f);
  }
  return f;
};
const hero = makeHeroArt3().of('warrior', { twoHanded: false });
const CB = CROSSBOWMAN;
const caption = (text: string, sub = ''): void => {
  g.fillStyle = 'rgba(8,8,14,0.78)';
  g.fillRect(0, 0, cv.width, sub ? 74 : 46);
  g.fillStyle = '#efe6d6';
  g.font = 'bold 26px sans-serif';
  g.fillText(text, 18, 33);
  if (sub) {
    g.fillStyle = '#c6bca8';
    g.font = '21px sans-serif';
    g.fillText(sub, 18, 63);
  }
};
const label = (text: string, x: number, y: number): void => {
  g.font = 'bold 19px sans-serif';
  const w = g.measureText(text).width;
  g.fillStyle = 'rgba(8,8,14,0.7)';
  g.fillRect(x - w / 2 - 6, y - 18, w + 12, 25);
  g.fillStyle = '#efe6d6';
  g.fillText(text, x - w / 2, y);
};
/** One tile along the figure's forward, on the screen at `k` times: from in front (down-right) or from behind (up-right). */
const tileStep = (view: GameView, k: number): [number, number] => (view === 'front' ? [32 * k, 16 * k] : [32 * k, -16 * k]);

if (mode === 'sheet') {
  // THE SHEET: standing, from in front and from behind, beside the knight, three times as big; and at the game's size, a
  // group of them planted along the walls, the knight before them
  const K = 3;
  ground(K);
  const y = 430;
  draw(hero.front.idle[0], 80, y, K);
  draw(spOf(CB, 'stand', 0, 'front'), 280, y, K);
  draw(spOf(CB, 'stand', 0, 'back'), 610, y, K);
  draw(hero.back.idle[0], 820, y, K);
  label('the knight', 80, y + 50);
  label('from in front', 330, y + 50);
  label('from behind', 640, y + 50);
  // (at the game's size: a group of them planted along the walls)
  const x0 = 930;
  const yy = 260;
  const row: [number, number, number][] = [[0, 0, 0.1], [36, -18, 0.9], [72, -36, 1.6]];
  for (const [dx, dy, t] of row) draw(spOf(CB, 'stand', t, 'front'), x0 + dx, yy + dy + 40, 1);
  draw(hero.back.idle[0], x0 + 150, yy + 140, 1);
  label('at the game’s size', x0 + 90, yy + 200);
} else if (mode === 'big') {
  const K = 4;
  ground(K);
  const t = Number(a2) || 0;
  draw(spOf(CB, a1, t, 'front'), cv.width * 0.3, cv.height - 70, K);
  draw(spOf(CB, a1, t, 'back'), cv.width * 0.72, cv.height - 70, K);
} else if (mode === 'zoom') {
  // ONE OF HIM, eight times as big (`zoom:<move>:<t>`): from in front at the left, from behind at the right
  const K = 7;
  ground(K);
  const t = Number(a2) || 0;
  draw(spOf(CB, a1, t, 'front'), cv.width * 0.26, cv.height - 60, K);
  draw(spOf(CB, a1, t, 'back'), cv.width * 0.74, cv.height - 60, K);
} else if (mode === 'head') {
  // HIS HEAD AND SHOULDERS, sixteen times as big (`head:<move>:<t>`): from in front at the left, from behind at the right
  const K = 14;
  ground(K);
  const t = Number(a2) || 0;
  draw(spOf(CB, a1, t, 'front'), cv.width * 0.25, cv.height + 46 * K - 120, K);
  draw(spOf(CB, a1, t, 'back'), cv.width * 0.75, cv.height + 46 * K - 120, K);
} else if (mode === 'grid') {
  const K = 2;
  ground(K);
  const ts = a2.split(',').map(Number);
  const w = cv.width / ts.length;
  ts.forEach((t, i) => {
    for (const [row, view] of [[0, 'front'], [1, 'back']] as const) {
      const y = (cv.height / 2) * (row + 1) - 30;
      draw(spOf(CB, a1, t, view), w * (i + 0.42), y, K);
      g.fillStyle = '#ffffff';
      g.font = '14px monospace';
      g.fillText(`${t.toFixed(3)} s`, w * i + 6, y + 22);
    }
  });
} else if (mode === 'shot') {
  // THE SHOT AT THE ARENA'S SCALE at one moment (`shot:<front|back>:<t>`)
  const view = a1 as GameView;
  const K = 2;
  const t = Number(a2) || 0;
  ground(K);
  const ox = 130;
  const oy = view === 'front' ? 190 : cv.height - 120;
  const fx = fxOf(t, view);
  draw(fx.under, ox, oy, K);
  const [sx, sy] = tileStep(view, K);
  draw(view === 'front' ? hero.back.idle[0] : hero.front.idle[0], ox + 8 * sx, oy + 8 * sy, K, true);
  draw(spOf(CB, 'attack', t, view), ox, oy, K);
  draw(fx.over, ox, oy, K);
}

// =============================================================================================
// THE FILM: every move, from in front and from behind, captioned; the shot at the arena's scale with the knight in it; the
// strike again at half speed. Frame by frame: window.__film.draw(i).

interface Seg {
  n: number;
  draw: (i: number) => void;
}
const F = 30;
const segs: Seg[] = [];
const sec = (s: number): number => Math.round(s * F);
/** Two of him side by side, three times as big (from in front at the left, from behind at the right), the knight beside each. */
function pair(move: string, tOf: (i: number) => number, text: string, sub: string, n: number, knight = true): void {
  segs.push({
    n,
    draw: (i) => {
      const K = 3;
      ground(K);
      const t = tOf(i);
      const y = cv.height - 70;
      if (knight) draw(hero.front.idle[0], 90, y, K);
      draw(spOf(CB, move, t, 'front'), 330, y, K);
      draw(spOf(CB, move, t, 'back'), 800, y, K);
      if (knight) draw(hero.back.idle[0], 1110, y, K);
      label('from in front', 360, y + 48);
      label('from behind', 820, y + 48);
      caption(text, sub);
    },
  });
}
/** The shot (and the reload after it) at the arena's scale: twice as big, the line 12 tiles across the floor, the knight in it 8 tiles away; from in front he steps out of the lane during the warning. */
function shot(view: GameView, from: number, to: number, speed: number, text: string, subOf: (t: number) => string, knightMoves: boolean): void {
  const n = Math.round(((to - from) / speed) * F);
  segs.push({
    n,
    draw: (i) => {
      const K = 2;
      const t = from + (i / F) * speed;
      ground(K);
      const ox = 110;
      const oy = view === 'front' ? 175 : cv.height - 70;
      const [sx, sy] = tileStep(view, K);
      const inShot = t <= CB_SHOT.long;
      const ts = inShot ? t : t - CB_SHOT.long;
      if (inShot) draw(fxOf(ts, view).under, ox, oy, K);
      // the knight: in the lane 8 tiles off, facing them; from in front he steps out of it (walking, 2.5 tiles a second) as the line is held
      const step = knightMoves ? Math.max(0, Math.min(1.3, (t - 0.82) * 2.5)) : 0;
      const kx = ox + 8 * sx + step * 32 * K * -1 * (view === 'front' ? 1 : 1);
      const ky = oy + 8 * sy + step * 16 * K * (view === 'front' ? 1 : -1);
      const walking = knightMoves && t > 0.82 && t < 0.82 + 1.3 / 2.5;
      const kf = view === 'front' ? (walking ? hero.front.walk[Math.floor(t * 20) % hero.front.walk.length] : hero.back.idle[0]) : hero.front.idle[0];
      const knightFirst = view === 'back';
      const him = (): void => draw(inShot ? spOf(CB, 'attack', ts, view) : spOf(CB, 'reload', Math.min(CB_RELOAD.long, ts), view), ox, oy, K);
      if (knightFirst) draw(kf, kx, ky, K, true);
      him();
      if (!knightFirst) draw(kf, kx, ky, K, true);
      if (inShot) draw(fxOf(ts, view).over, ox, oy, K);
      caption(text, subOf(t));
    },
  });
}
const shotSub = (t: number): string => {
  const S = CB_SHOT;
  if (t < S.crank[0]) return 'off the shoulder';
  if (t < S.crank[1]) return 'the crank: two hard turns';
  if (t < S.raise[1]) return 'raised over the pavise, cheek to the stock';
  if (t < S.steady[0]) return `the red line, ${CB_LANE.tiles} tiles: held ${(S.strike[0] - S.line[1]).toFixed(1)} s, trembling — step out of it`;
  if (t < S.strike[0]) return 'steadied: the last warning';
  if (t < S.hit + 0.04) return 'THE BOLT: two frames, the whole line';
  if (t < S.long) return 'the kick carried through; rocked back; the Hush bursts out';
  return 'then the reload: five turns of the crank, a bolt from the case';
};
if (mode === 'film') {
  pair('stand', (i) => (i / F) % 2.4, 'A CROSSBOWMAN OF THE KEEP, planted behind his pavise', 'knight’s size; breathing, watching the walls, the Hush leaking', sec(3.2));
  // THE JOG: across the floor at his pace, from in front (down the screen) and from behind (up it)
  segs.push({
    n: sec(3.2),
    draw: (i) => {
      const K = 2;
      const t = i / F;
      ground(K);
      const go = CB_PACE * t;
      draw(spOf(CB, 'walk', t % 0.6, 'front'), 120 + go * 32 * K, 150 + go * 16 * K, K);
      draw(spOf(CB, 'walk', t % 0.6, 'back'), 640 + go * 32 * K, cv.height - 40 - go * 16 * K, K);
      draw(hero.front.idle[0], 1110, 300, K);
      caption('THE JOG to his spot, the pavise on his back', `${CB_PACE} tiles a second (the knight walks 2.5); the crossbow carried low`);
    },
  });
  pair('plant', (i) => Math.min(CB_PLANT.long, (i / F) * 0.5), 'THE PLANT (half speed)', 'swung off his back round his left side, and driven into the floor', sec(CB_PLANT.long * 2 + 0.6));
  shot('front', 0, CB_SHOT.long + CB_RELOAD.long, 1, 'THE AIMED SHOT, from in front', shotSub, true);
  shot('back', 0, CB_SHOT.long + 0.5, 1, 'THE AIMED SHOT, from behind', shotSub, false);
  shot('front', 1.1, 1.9, 0.5, 'THE STRIKE AT HALF SPEED, from in front', shotSub, false);
  shot('back', 1.1, 1.9, 0.5, 'THE STRIKE AT HALF SPEED, from behind', shotSub, false);
  pair('reload', (i) => Math.min(CB_RELOAD.long, i / F), 'THE RELOAD', 'five turns of the crank, the string to the nut, a bolt laid in, back on the shoulder', sec(CB_RELOAD.long + 0.4));
  pair('reel', (i) => ((i / F) % 0.7 < 0.4 ? (i / F) % 0.7 : 0), 'STRUCK', 'jolted back, the Hush coughed out', sec(2.1));
  pair('dying', (i) => Math.min(CB_DIES.long, i / F), 'THE HUSH LEAVES HIM', 'the crossbow drops; the Hush pours out; he slumps behind his pavise, a man again', sec(CB_DIES.long + 1.2));
}
(window as unknown as { __film: { n: number; draw: (i: number) => void } }).__film = {
  n: segs.reduce((a, s) => a + s.n, 0),
  draw: (i: number) => {
    let k = i;
    for (const s of segs) {
      if (k < s.n) {
        s.draw(k);
        return;
      }
      k -= s.n;
    }
  },
};
if (mode === 'film') (window as unknown as { __film: { draw: (i: number) => void } }).__film.draw(Number(a1) || 0);
(window as unknown as { __ready: boolean }).__ready = true;

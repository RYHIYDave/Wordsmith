// Dev page: FLOOR 17'S FOOTMEN (art/masque_footmen.ts, art/masque_footmen_moves.ts, art/masque_footmen_fx.ts): standing,
// from in front and from behind, beside the knight for size, three times as big, and a few of them at the game's size;
// a move close up; a move at several moments; and THE FILM, every move at the scale of a room with the knight in it.
// On a plain floor of the Masque's first room (a mock-up's floor, not floor 17's own ground). Nothing of the game imports it.
//   PREVIEW_TIMEOUT=200000 node tools/preview.mjs src/dev/preview_masque_footmen.ts shots/fm/sheet.png 1200 900 "sheet"
//   ... "big:<move>:<t>" (front and behind, four times as big)
//   ... "grid:<move>:<t>,<t>,...[:<k>]" (a move at several moments, both ways round, k times as big)
//   ... "reach" (how far his blows reach: the tray's loop and the fire fan, the knight for size)
//   node tools/footmen_film.mjs (THE FILM: frames from "film", made into an MP4)
import type { Sprite } from '../engine/px';
import type { Painted } from '../art/kit';
import { makeHeroArt3 } from '../art/heroes3';
import { toSprite } from '../art/kit';
import { canvasOf, deathOfMob, paintMob } from '../art/new_mobs3';
import type { Mob } from '../art/new_mobs3';
import { FOOTMAN, FM_DIES, FM_PACE, FM_SWING, FM_THROW, FM_REEL, FM_STAND_LONG, FM_MARCH, TRAY_FLIGHT, trayFlight } from '../art/masque_footmen_moves';
import { FIRE_CANVAS, FIRE_FX, TRAY_SHOT_CANVAS, firePainted, trayShotPainted } from '../art/masque_footmen_fx';
import type { GameView } from '../art/skin';
import { GRID, project } from '../art/skeleton';
import type { V3 } from '../art/skeleton';
import { TILE3 } from '../art/new_mobs3';

const [mode = 'sheet', a1 = 'stand', a2 = '0', a3 = ''] = decodeURIComponent(location.hash.slice(1)).split(':');
const cv = document.createElement('canvas');
cv.width = window.innerWidth;
cv.height = window.innerHeight;
cv.style.display = 'block';
document.body.style.margin = '0';
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;

// ---------------------------------------------------------------------------------------------
// THE FLOOR: polished marble in the first room's blue, set in diamonds (a mock-up's floor)

const FLOOR_A = [22, 27, 48];
const FLOOR_B = [28, 34, 60];
const SEAM = [14, 17, 34];
function hashN(x: number, y: number, k: number): number {
  let h = (x * 374761393 + y * 668265263 + k * 1442695041) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
/** The floor, `w` by `h` picture pixels, its origin (a tile's corner) at (`ox`, `oy`). */
function floorPic(w: number, h: number, ox: number, oy: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const x2 = c.getContext('2d') as CanvasRenderingContext2D;
  const img = x2.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const X = x + 0.5 - ox;
      const Y = y + 0.5 - oy;
      const fx = (X / GRID + (2 * Y) / GRID) / 2 / TILE3;
      const fy = (X / GRID - (2 * Y) / GRID) / 2 / TILE3;
      const tx = Math.floor(fx);
      const ty = Math.floor(fy);
      const ex = Math.min(fx - tx, 1 - (fx - tx));
      const ey = Math.min(fy - ty, 1 - (fy - ty));
      let col = (tx + ty) & 1 ? FLOOR_A : FLOOR_B;
      // (veins in the marble, faint)
      const v = Math.sin((fx * 3.1 + fy * 1.3 + hashN(tx, ty, 3) * 6) * 2.2) + 0.6 * Math.sin((fx - fy) * 7.3 + hashN(tx, ty, 4) * 9);
      if (v > 1.25) col = col.map((k) => k + 6);
      if (hashN(x, y, 9) < 0.04) col = col.map((k) => k + 3);
      if (ex < 0.022 || ey < 0.022) col = SEAM;
      // (the dark at the edges of the room)
      const dx = (x - w / 2) / (w / 2);
      const dy = (y - h / 2) / (h / 2);
      const dark = Math.max(0, Math.min(1, (Math.hypot(dx, dy) - 0.55) / 0.7)) * 0.55;
      const i = (y * w + x) * 4;
      img.data[i] = Math.round(col[0] * (1 - dark));
      img.data[i + 1] = Math.round(col[1] * (1 - dark));
      img.data[i + 2] = Math.round(col[2] * (1 - dark));
      img.data[i + 3] = 255;
    }
  }
  x2.putImageData(img, 0, 0);
  return c;
}

// ---------------------------------------------------------------------------------------------
// DRAWING

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
/** A painted picture (picture pixels) as a canvas. */
function canvasOfPainted(p: Painted): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = p.px.w;
  c.height = p.px.h;
  (c.getContext('2d') as CanvasRenderingContext2D).putImageData(new ImageData(new Uint8ClampedArray(p.px.d), p.px.w, p.px.h), 0, 0);
  return c;
}
/** A painted picture anchored at (`ax`, `ay`) of it, laid with that point at (`x`, `y`), `k` times as big; and its lights. */
function lay(p: Painted, ax: number, ay: number, x: number, y: number, k: number): { x: number; y: number; r: number; color: string; a: number }[] {
  g.drawImage(canvasOfPainted(p), Math.round(x - ax * k), Math.round(y - ay * k), p.px.w * k, p.px.h * k);
  return p.lights.map((l) => ({ x: x + (l.x - ax) * k, y: y + (l.y - ay) * k, r: l.r * k, color: l.color, a: l.a ?? 0.5 }));
}
function shadow(x: number, y: number, rx: number, k: number, a = 0.55): void {
  g.save();
  g.translate(x, y);
  g.scale(1, 0.5);
  const gr = g.createRadialGradient(0, 0, 0, 0, 0, rx * k);
  gr.addColorStop(0, `rgba(4,3,10,${a})`);
  gr.addColorStop(1, 'rgba(4,3,10,0)');
  g.fillStyle = gr;
  g.beginPath();
  g.arc(0, 0, rx * k, 0, Math.PI * 2);
  g.fill();
  g.restore();
}
function lights(ls: { x: number; y: number; r: number; color: string; a: number }[]): void {
  g.save();
  g.globalCompositeOperation = 'lighter';
  for (const l of ls) {
    const gr = g.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r);
    const [r, gg, b] = [1, 3, 5].map((i) => parseInt(l.color.slice(i, i + 2), 16));
    gr.addColorStop(0, `rgba(${r},${gg},${b},${l.a * 0.8})`);
    gr.addColorStop(1, `rgba(${r},${gg},${b},0)`);
    g.fillStyle = gr;
    g.fillRect(l.x - l.r, l.y - l.r, l.r * 2, l.r * 2);
  }
  g.restore();
}
const spOf = (mob: Mob, which: string, t: number, view: GameView): Sprite =>
  which === 'dying' ? toSprite(deathOfMob(mob, Math.min(1, t / mob.dieTime), view), null, canvasOf(mob).ax, canvasOf(mob).ay) : toSprite(paintMob(mob, which, t, view), null, canvasOf(mob).ax, canvasOf(mob).ay);
/** A frame of his and its lights, laid at (x, y), `k` times as big. */
function footman(which: string, t: number, view: GameView, x: number, y: number, k: number): { x: number; y: number; r: number; color: string; a: number }[] {
  const can = canvasOf(FOOTMAN);
  const p = which === 'dying' ? deathOfMob(FOOTMAN, Math.min(1, t / FOOTMAN.dieTime), view) : paintMob(FOOTMAN, which, t, view);
  shadow(x, y, 13, k);
  return lay(p, can.ax, can.ay, x, y, k);
}
const hero = makeHeroArt3().of('warrior', { twoHanded: false });
function knight(view: GameView, x: number, y: number, k: number, flip = false): void {
  shadow(x, y, 12, k);
  draw(view === 'front' ? hero.front.idle[0] : hero.back.idle[0], x, y, k, flip);
}
/** Where a point of his own space is on the screen, from his place on the floor at (x, y), seen `view`, `k` times as big. */
const onScreen = (p: V3, view: GameView, x: number, y: number, k: number): [number, number] => {
  const r = project(p, view === 'back' ? 'rear' : 'front');
  return [x + r[0] * k, y + r[1] * k];
};
function caption(text: string, sub = ''): void {
  g.save();
  g.fillStyle = 'rgba(6,5,12,0.78)';
  g.fillRect(0, 0, cv.width, sub ? 74 : 50);
  g.fillStyle = '#f2ead8';
  g.font = 'bold 28px sans-serif';
  g.textBaseline = 'top';
  g.fillText(text, 18, 11);
  if (sub) {
    g.fillStyle = '#b8b0c4';
    g.font = '20px sans-serif';
    g.fillText(sub, 18, 46);
  }
  g.restore();
}
function label(text: string, x: number, y: number): void {
  g.save();
  g.font = 'bold 20px sans-serif';
  g.textAlign = 'center';
  g.fillStyle = 'rgba(6,5,12,0.7)';
  const w = g.measureText(text).width + 14;
  g.fillRect(x - w / 2, y - 2, w, 26);
  g.fillStyle = '#e8e0d0';
  g.textBaseline = 'top';
  g.fillText(text, x, y + 2);
  g.restore();
}

// ---------------------------------------------------------------------------------------------
// THE MODES

if (mode === 'sheet') {
  // THE SHEET: him from in front and from behind beside the knight, three times as big; a few of them at the game's size
  const K = 3;
  const F = floorPic(Math.ceil(cv.width / K), Math.ceil(cv.height / K), 0, 0);
  g.drawImage(F, 0, 0, F.width * K, F.height * K);
  const y = 560;
  const ls: ReturnType<typeof footman> = [];
  knight('front', 120, y, K);
  ls.push(...footman('stand', 0, 'front', 400, y, K));
  ls.push(...footman('stand', 0, 'back', 760, y, K));
  knight('back', 1060, y, K);
  lights(ls);
  label('the knight', 120, y + 16);
  label('the footman, from in front', 400, y + 16);
  label('from behind', 760, y + 16);
  label('the knight, from behind', 1060, y + 16);
  // (at the game's size: three of them marching on the knight)
  const y2 = cv.height - 70;
  const ls2: ReturnType<typeof footman> = [];
  knight('back', 820, y2 + 6, 1, true);
  for (const [dx, dy, t] of [[0, -40, 0], [60, -18, 0.17], [-40, -6, 0.33]] as const) ls2.push(...footman('walk', t, 'front', 640 + dx, y2 + dy, 1));
  lights(ls2);
  label('at the game’s size', 720, y2 + 22);
  caption('Floor 17, the Masque: the footmen', 'Hushed footmen in the Masque’s livery: powdered wig, black coat laced gold, white gloves, a silver tray, a lit candelabrum');
} else if (mode === 'big') {
  const K = 4;
  const F = floorPic(Math.ceil(cv.width / K), Math.ceil(cv.height / K), 0, 0);
  g.drawImage(F, 0, 0, F.width * K, F.height * K);
  const t = Number(a2) || 0;
  const ls = [...footman(a1, t, 'front', cv.width * 0.28, cv.height - 90, K), ...footman(a1, t, 'back', cv.width * 0.74, cv.height - 90, K)];
  lights(ls);
  caption(`${a1} @ ${t.toFixed(3)} s`);
} else if (mode === 'grid') {
  // A MOVE AT SEVERAL MOMENTS, both ways round
  const ts = a2.split(',').map(Number);
  const K = Number(a3 || '2');
  const F = floorPic(Math.ceil(cv.width / K), Math.ceil(cv.height / K), 0, 0);
  g.drawImage(F, 0, 0, F.width * K, F.height * K);
  const w = cv.width / ts.length;
  const ls: ReturnType<typeof footman> = [];
  ts.forEach((t, i) => {
    ls.push(...footman(a1, t, 'front', w * (i + 0.42), cv.height * 0.47, K));
    ls.push(...footman(a1, t, 'back', w * (i + 0.42), cv.height * 0.93, K));
    label(`${t.toFixed(2)} s`, w * (i + 0.5), 60);
  });
  lights(ls);
  caption(`${a1}`);
} else if (mode === 'reach') {
  // HOW FAR HIS BLOWS REACH, at room scale with the knight: the tray's loop (every tenth of its flight), and the fire fan
  const K = 2;
  const F = floorPic(Math.ceil(cv.width / K), Math.ceil(cv.height / K), 0, 0);
  g.drawImage(F, 0, 0, F.width * K, F.height * K);
  const ls: ReturnType<typeof footman> = [];
  // (left: the tray's loop)
  const A = { x: 70, y: 210 };
  const kt = onScreen([4.5 * TILE3, 0, 0], 'front', A.x, A.y, K);
  ls.push(...footman('attack', FM_THROW.hit + 0.15, 'front', A.x, A.y, K));
  knight('back', kt[0], kt[1], K, true);
  for (let i = 1; i < 10; i++) {
    const t = (i / 10) * TRAY_FLIGHT.long;
    const at = trayFlight(t);
    const [sx, sy] = onScreen([at.c[0], at.c[1], 0], 'front', A.x, A.y, K);
    shadow(sx, sy, 7, K, 0.4);
    ls.push(...lay(trayShotPainted(at, 'front', [trayFlight(Math.max(0, t - 1 / 30)).c, trayFlight(Math.max(0, t - 0.5 / 30)).c]), TRAY_SHOT_CANVAS.ax, TRAY_SHOT_CANVAS.ay, A.x, A.y, K));
  }
  label('the tray: six tiles out and back, in under a second', 300, cv.height - 60);
  // (right: the fire fan, burning)
  const B2 = { x: 700, y: 330 };
  ls.push(...lay(firePainted(0.3, 'front'), FIRE_CANVAS.ax, FIRE_CANVAS.ay, B2.x, B2.y, K));
  ls.push(...footman('candelabrum', FM_SWING.hit + 0.3, 'front', B2.x, B2.y, K));
  const kf = onScreen([2.2 * TILE3, 0, 0], 'front', B2.x, B2.y, K);
  knight('back', kf[0], kf[1], K, true);
  label('the fire: three tiles out, a third of a turn across', 900, cv.height - 60);
  lights(ls);
  caption('How far the footman\u2019s blows reach (the knight for size)', 'his rule of 28 Oct: bigger areas for the longer warnings');
} else if (mode === 'film') {
  // THE FILM: each shot a run of frames at thirty a second
  const K = 2;
  /** Close: three times as big. */
  const K3 = 3;
  type Ls = ReturnType<typeof footman>;
  interface Shot {
    caption: string;
    sub: string;
    frames: number;
    draw: (i: number) => Ls;
  }
  const shots: Shot[] = [];
  const FPS = 30;
  // (where things stand: from in front he faces down the screen to the right; from behind, up it to the right)
  const fromFront = { x: 300, y: 300 };
  const fromBack = { x: 330, y: 560 };
  /** The knight `tiles` before him, facing him. */
  const knightBefore = (view: GameView, at: { x: number; y: number }, tiles: number, k = K): void => {
    const [x, y] = onScreen([tiles * TILE3, 0, 0], view, at.x, at.y, k);
    knight(view === 'front' ? 'back' : 'front', x, y, k, true);
  };
  const scene = (view: GameView, at: { x: number; y: number }, which: string, t: number, knightTiles: number | null, k = K): Ls => {
    const ls: Ls = [];
    const ky = knightTiles === null ? -1e9 : onScreen([knightTiles * TILE3, 0, 0], view, at.x, at.y, k)[1];
    // (whichever is further up the screen first)
    if (knightTiles !== null && ky < at.y) knightBefore(view, at, knightTiles, k);
    ls.push(...footman(which, t, view, at.x, at.y, k));
    if (knightTiles !== null && ky >= at.y) knightBefore(view, at, knightTiles, k);
    return ls;
  };
  const floors = new Map<number, HTMLCanvasElement>();
  const ground = (k = K): void => {
    let f = floors.get(k);
    if (!f) floors.set(k, (f = floorPic(Math.ceil(cv.width / k), Math.ceil(cv.height / k), 0, 0)));
    g.drawImage(f, 0, 0, f.width * k, f.height * k);
  };
  // 1. STANDING
  shots.push({
    caption: 'Standing: upright and stiff, the tray up on his palm, the candles lit',
    sub: 'breathing, his weight shifting, looking the room over; from in front and from behind',
    frames: Math.round(FM_STAND_LONG * FPS),
    draw: (i) => {
      ground(K3);
      const t = i / FPS;
      const ls = [...footman('stand', t, 'front', 330, 600, K3), ...footman('stand', t, 'back', 760, 600, K3)];
      knight('front', 1050, 610, K3);
      return ls;
    },
  });
  // 2. THE MARCH, across the floor at his pace, from in front and from behind
  for (const view of ['front', 'back'] as const) {
    const long = view === 'front' ? 2.4 : 2.0;
    shots.push({
      caption: `The march: brisk and stiff, ${FM_PACE} tiles a second ${view === 'front' ? '(from in front)' : '(from behind)'}`,
      sub: 'faster than the knight walks; quick stiff-legged steps, the tray and the candles held steady',
      frames: Math.round(long * FPS),
      draw: (i) => {
        const t = i / FPS;
        const d = FM_PACE * TILE3 * t;
        const start = view === 'front' ? { x: 110, y: 200 } : { x: 130, y: 690 };
        const [x, y] = onScreen([d, 0, 0], view, start.x, start.y, K);
        ground();
        const ls = footman('walk', t, view, x, y, K);
        const [kx, ky] = onScreen([FM_PACE * TILE3 * long + 1.2 * TILE3, 0, 0], view, start.x, start.y, K);
        knight(view === 'front' ? 'back' : 'front', kx, ky, K, true);
        return ls;
      },
    });
  }
  // 3. THE TRAY FLUNG, and the strike at half speed
  const trayShot = (view: GameView, at: { x: number; y: number }, t: number, k = K): Ls => {
    const since = t - FM_THROW.hit;
    if (since <= 0 || since >= TRAY_FLIGHT.long) return [];
    const now = trayFlight(since);
    const was = [3, 2.5, 2, 1.5, 1, 0.5].map((u) => trayFlight(Math.max(0, since - u / FPS)).c);
    const [sx, sy] = onScreen([now.c[0], now.c[1], 0], view, at.x, at.y, k);
    shadow(sx, sy, 7, k, 0.5);
    return lay(trayShotPainted(now, view, was), TRAY_SHOT_CANVAS.ax, TRAY_SHOT_CANVAS.ay, at.x, at.y, k);
  };
  const close = { x: 330, y: 330 };
  for (const view of ['front', 'back'] as const) {
    const at = view === 'front' ? fromFront : fromBack;
    shots.push({
      caption: `The tray flung ${view === 'front' ? '(from in front)' : '(from behind)'}`,
      sub: 'coiled and held (the warning), flung in two frames; it flies six tiles out, loops round, and he catches it',
      frames: Math.round(FM_THROW.long * FPS) + 10,
      draw: (i) => {
        const t = Math.min(FM_THROW.long, i / FPS);
        ground();
        const ls = scene(view, at, 'attack', t, 4.5);
        ls.push(...trayShot(view, at, t));
        return ls;
      },
    });
  }
  shots.push({
    caption: 'The tray flung: the strike at half speed',
    sub: 'the uncoiling and the throw, two frames, smeared; then it is gone',
    frames: 54,
    draw: (i) => {
      const t = FM_THROW.hit - 0.4 + i / 2 / FPS;
      ground(K3);
      const ls = scene('front', close, 'attack', t, 4.5, K3);
      ls.push(...trayShot('front', close, t, K3));
      return ls;
    },
  });
  // 4. THE CANDELABRUM, and the strike at half speed
  const fire = (view: GameView, at: { x: number; y: number }, t: number, k = K): Ls => {
    const since = t - FM_SWING.hit;
    if (since < 0 || since > FIRE_FX.long) return [];
    return lay(firePainted(since, view), FIRE_CANVAS.ax, FIRE_CANVAS.ay, at.x, at.y, k);
  };
  for (const view of ['front', 'back'] as const) {
    const at = view === 'front' ? fromFront : fromBack;
    shots.push({
      caption: `The candelabrum ${view === 'front' ? '(from in front)' : '(from behind)'}`,
      sub: 'raised high and held (the warning), over and down in two frames; its fire flung out three tiles before him',
      frames: Math.round(FM_SWING.long * FPS) + 10,
      draw: (i) => {
        const t = Math.min(FM_SWING.long, i / FPS);
        ground();
        const ls = fire(view, at, t);
        ls.push(...scene(view, at, 'candelabrum', t, 2.2));
        return ls;
      },
    });
  }
  shots.push({
    caption: 'The candelabrum: the strike at half speed',
    sub: 'over his head and down in two frames, the flames a streak of fire; the fan bursts out',
    frames: 54,
    draw: (i) => {
      const t = FM_SWING.hit - 0.4 + i / 2 / FPS;
      ground(K3);
      const ls = fire('front', close, t, K3);
      ls.push(...scene('front', close, 'candelabrum', t, 2.2, K3));
      return ls;
    },
  });
  // 5. STRUCK
  shots.push({
    caption: 'Struck',
    sub: 'jolted back, the tray tipping, the flames blown about (twice)',
    frames: 48,
    draw: (i) => {
      const t = (i % 24) / FPS;
      ground(K3);
      return [...footman('reel', Math.min(FM_REEL, t), 'front', 380, 600, K3), ...footman('reel', Math.min(FM_REEL, t), 'back', 820, 600, K3)];
    },
  });
  // 6. HIS DEATH
  for (const view of ['front', 'back'] as const) {
    shots.push({
      caption: `His death ${view === 'front' ? '(from in front)' : '(from behind)'}`,
      sub: 'the tray clatters down, he drops to his knees, the Hush leaves him: a man again, alive, still',
      frames: Math.round(FM_DIES.long * FPS) + 18,
      draw: (i) => {
        const t = Math.min(FM_DIES.long, i / FPS);
        ground(K3);
        return footman('dying', t, view, 560, 560, K3);
      },
    });
  }
  const total = shots.reduce((n, s) => n + s.frames, 0);
  (window as unknown as { __film: { count: number; draw: (i: number) => void } }).__film = {
    count: total,
    draw: (i: number) => {
      let k = i;
      for (const s of shots) {
        if (k < s.frames) {
          g.clearRect(0, 0, cv.width, cv.height);
          const ls = s.draw(k);
          lights(ls);
          caption(s.caption, s.sub);
          return;
        }
        k -= s.frames;
      }
    },
  };
  const first = Number(a1);
  (window as unknown as { __film: { draw: (i: number) => void } }).__film.draw(Number.isFinite(first) ? first : 0);
}
void FM_MARCH;
(window as unknown as { __ready: boolean }).__ready = true;

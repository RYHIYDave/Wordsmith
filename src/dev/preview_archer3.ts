// Dev page: THE BONE ARCHER ON THE HEROES' BONES (art/monster_bones3.ts, a mock-up: not in the game)
// beside TODAY'S BONE ARCHER (art/monster_bones.ts), each as the game would show it: the same
// frames, picked by the game's own rules (the walk by the clock at its own pace, the attack by the
// rules' wind-up as Renderer.monsterSprite does, the death at its own pace), with the pool of
// light the game puts behind a monster and the lights it gives off.
//   node tools/preview.mjs src/dev/preview_archer3.ts shots/ar3/strip.png 1800 900 "strip:bones:walk:front:5"
//   hash = strip:<now | bones>:<idle | walk | attack | die>:<front | back>[:<scale>[:<every>[:<per row>]]]
//            every frame of one animation in a row, big (scale = screen pixels to a game pixel)
//          sheet: THE STILL SHEET FOR THE OWNER: today's and the new, facing you and facing away,
//            at the size the game shows them on a phone and enlarged
//          film[:<scale>[:slow]]: frames of the moving picture, for tools/page_gif.mjs: today's
//            and the new side by side, facing you and facing away, each standing, walking,
//            striking and falling, at the game's own pace (slow: three times slower)
import type { ActorArt, AnimSet, Clip } from '../art/actor_types';
import { GRAIN } from '../art/kit';
import { makeArcherArt } from '../art/monster_bones';
import { archerHolding, makeArcherArt3, paintSkeleton3 } from '../art/monster_bones3';
import { CANVAS3 } from '../art/skin';
import { MOVES3 } from '../art/moves3';
import { spriteOf3 } from '../art/heroes3';
import { toSprite } from '../art/kit';
import { drawAura, drawLights } from '../engine/px';
import type { Sprite } from '../engine/px';
import { MONSTERS, TUNE } from '../game/defs';
import { attackFrame } from '../render/figure';

const parts = decodeURIComponent(location.hash.slice(1)).split(':');
const mode = parts[0] || 'strip';

const NOW: ActorArt = makeArcherArt();
const BONES: ActorArt = makeArcherArt3();
const artOf = (who: string): ActorArt => (who === 'now' ? NOW : BONES);

const cv = document.createElement('canvas');
cv.style.position = 'static';
cv.style.display = 'block';
for (const el of [document.documentElement, document.body]) {
  el.style.height = 'auto';
  el.style.overflow = 'visible';
}
document.body.style.margin = '0';
document.body.style.background = '#16131c';
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
const win = window as unknown as { __ready: boolean; __frames: number; __tickMs: number; __frame: (i: number) => string };

const WINDUP = MONSTERS.archer.windup;
const BUSY = WINDUP + TUNE.monsterRecover;
const FLOOR = '#0b0a1e';

function clipOf(set: AnimSet, k: 'attack' | 'die'): Clip {
  const c = set.clips?.[k];
  if (!c) throw new Error('no ' + k);
  return c;
}

/** A diamond of the dungeon's floor, as big as a tile, under the figure (the flagstones' two shades), in game pixels at scale S. */
function tiles(x0: number, y0: number, w: number, h: number, fx: number, fy: number, S: number, slide = 0): void {
  g.fillStyle = FLOOR;
  g.fillRect(x0, y0, w, h);
  g.save();
  g.beginPath();
  g.rect(x0, y0, w, h);
  g.clip();
  // (a figure faces screen-right and toward you: the floor goes by to the left and up the screen)
  const ox = ((slide % 32) + 32) % 32;
  const oy = (((slide / 2) % 16) + 16) % 16;
  for (let k = -6; k <= 8; k++) {
    for (let j = -10; j <= 8; j++) {
      const cx = x0 + (fx + k * 32 + (j % 2 === 0 ? 0 : 16) - ox) * S;
      const cy = y0 + (fy + j * 8 - oy) * S;
      g.fillStyle = (k + j) % 2 === 0 ? '#201e50' : '#1b1946';
      g.beginPath();
      g.moveTo(cx, cy - 7.5 * S);
      g.lineTo(cx + 15 * S, cy);
      g.lineTo(cx, cy + 7.5 * S);
      g.lineTo(cx - 15 * S, cy);
      g.closePath();
      g.fill();
    }
  }
  g.restore();
}

/** A figure on the floor at (px, py) (its floor point), as the game draws it: its shadow, its pool of light, the figure, its lights. */
function figure(sp: Sprite, px: number, py: number, S: number, shadow = true): void {
  if (shadow) {
    // (the game's soft shadow under a monster: by its size in the rules)
    const r = MONSTERS.archer.radius * 0.75 * 22.6 * 1.5;
    g.fillStyle = 'rgba(0,0,0,0.42)';
    g.beginPath();
    g.ellipse(px, py, (r * S) / 1.5, (r * 0.5 * S) / 1.5, 0, 0, Math.PI * 2);
    g.fill();
  }
  drawAura(g, sp, px, py, S);
  g.imageSmoothingEnabled = false;
  g.drawImage(sp.img, px - sp.ax * S, py - sp.ay * S, sp.w * S, sp.h * S);
  drawLights(g, sp, px, py, S);
}

function text(s: string, x: number, y: number, size: number, color: string, bold = false, align: CanvasTextAlign = 'left'): void {
  g.fillStyle = color;
  g.font = `${bold ? 'bold ' : ''}${size}px system-ui, -apple-system, Segoe UI, sans-serif`;
  g.textBaseline = 'top';
  g.textAlign = align;
  g.fillText(s, x, y);
  g.textAlign = 'left';
}

// =============================================================================================
// strip: every frame of one animation

if (mode === 'strip') {
  const who = parts[1] || 'bones';
  const anim = parts[2] || 'walk';
  const view = parts[3] === 'back' ? 'back' : 'front';
  const S = Number(parts[4]) || 5;
  const every = Math.max(1, Number(parts[5]) || 1);
  const set = artOf(who)[view];
  const frames: Sprite[] = anim === 'idle' ? set.idle : anim === 'walk' ? set.walk : anim === 'attack' ? clipOf(set, 'attack').frames : clipOf(set, 'die').frames;
  const list: Sprite[] = [];
  for (let i = 0; i < frames.length; i += every) list.push(frames[i]);
  // (one box for every cell: the box that holds every frame, from its floor point)
  let left = 10;
  let right = 10;
  let up = 10;
  let down = 4;
  for (const f of list) {
    left = Math.max(left, f.ax);
    right = Math.max(right, f.w - f.ax);
    up = Math.max(up, f.ay);
    down = Math.max(down, f.h - f.ay);
  }
  const cw = Math.ceil(left + right + 6) * S;
  const ch = Math.ceil(up + down + 6) * S;
  const perRow = Math.max(1, Math.min(list.length, Number(parts[6]) || Math.floor(2400 / (cw + 6))));
  const rows = Math.ceil(list.length / perRow);
  cv.width = perRow * (cw + 6) + 6;
  cv.height = 30 + rows * (ch + 22);
  g.fillStyle = '#16131c';
  g.fillRect(0, 0, cv.width, cv.height);
  const fps = anim === 'idle' ? set.idleFps : anim === 'walk' ? set.walkFps : anim === 'attack' ? clipOf(set, 'attack').fps : clipOf(set, 'die').fps;
  text(`${who === 'now' ? "TODAY'S BONE ARCHER" : 'ON THE BONES'}: ${anim}, ${view === 'front' ? 'facing you' : 'facing away'}, ${frames.length} frames at ${fps} a second`, 6, 6, 16, '#ffd866', true);
  list.forEach((f, n) => {
    const x0 = 6 + (n % perRow) * (cw + 6);
    const y0 = 30 + Math.floor(n / perRow) * (ch + 22);
    const fx = Math.ceil(left + 3);
    const fy = Math.ceil(up + 3);
    tiles(x0, y0, cw, ch, fx, fy, S);
    figure(f, x0 + fx * S, y0 + fy * S, S);
    text(`${n * every}${f.w * GRAIN > 170 ? ' (wide)' : ''}`, x0 + 3, y0 + ch + 3, 12, '#a8a2b8');
  });
  win.__ready = true;
}

// =============================================================================================
// film: today's and the new, side by side, as the game plays them

/** What a figure does in the film, and when (seconds): it stands, walks, stands, strikes, stands, falls, and lies. */
const ROUND = { walkAt: 0.5, walkFor: 2.0, strikeAt: 2.8, dieAt: 3.9, all: 5.8 };
const WHAT: ReadonlyArray<readonly [number, string]> = [
  [0, 'stands'],
  [ROUND.walkAt, 'walks'],
  [ROUND.walkAt + ROUND.walkFor, 'stands'],
  [ROUND.strikeAt, 'shoots'],
  [ROUND.strikeAt + BUSY, 'stands'],
  [ROUND.dieAt, 'is killed'],
];

interface Cell {
  art: ActorArt;
  back: boolean;
}

/** The frame a figure shows at a moment of the film, chosen as the game chooses it, and how far the floor has gone by under it (game pixels across). */
function shownAt(c: Cell, t: number): { sp: Sprite; slide: number } {
  const set = c.back ? c.art.back : c.art.front;
  const idleFps = set.idleFps ?? 10;
  const walkFps = set.walkFps ?? 16;
  // (the standing loop by the clock, as the game plays it: Renderer.actorSprite)
  const idle = (at: number): Sprite => set.idle[Math.floor(at * idleFps + 1e-6) % set.idle.length];
  const walked = Math.max(0, Math.min(ROUND.walkFor, t - ROUND.walkAt));
  // (the archer's pace in the rules, in tiles a second; a tile along the grid is 16 game pixels across the screen)
  const slide = walked * MONSTERS.archer.speed * 16;
  if (t >= ROUND.walkAt && t < ROUND.walkAt + ROUND.walkFor) return { sp: set.walk[Math.floor(walked * walkFps + 1e-6) % set.walk.length], slide };
  const age = t - ROUND.strikeAt;
  // (the attack by the rules' wind-up, as Renderer.monsterSprite plays it)
  if (age >= 0 && age < BUSY) return { sp: attackFrame(clipOf(set, 'attack'), age, WINDUP), slide };
  if (t >= ROUND.dieAt) {
    // (a death at its own pace, its last frame the body, which lies: Renderer.fallenSprite)
    const die = clipOf(set, 'die');
    return { sp: die.frames[Math.min(die.frames.length - 1, Math.floor((t - ROUND.dieAt) * die.fps + 1e-6))], slide };
  }
  return { sp: idle(t), slide };
}

if (mode === 'film') {
  const S = Number(parts[1]) || 4;
  const slow = parts[2] === 'slow' ? 3 : 1;
  const FPS = 25;
  const TICKS = Math.round(ROUND.all * FPS * slow);
  const cells: Cell[] = [
    { art: NOW, back: false },
    { art: BONES, back: false },
    { art: NOW, back: true },
    { art: BONES, back: true },
  ];
  // one box for every cell, that holds every frame any of them shows
  let left = 10;
  let right = 10;
  let up = 10;
  let down = 6;
  for (const c of cells) {
    for (let i = 0; i < TICKS; i++) {
      const { sp } = shownAt(c, i / FPS / slow);
      left = Math.max(left, sp.ax);
      right = Math.max(right, sp.w - sp.ax);
      up = Math.max(up, sp.ay);
      down = Math.max(down, sp.h - sp.ay);
    }
  }
  const M = 6;
  // (each cell at least wide enough for its heading)
  const need = Math.max(Math.ceil(left) + Math.ceil(right) + M * 2, Math.ceil(300 / S));
  const fx = Math.ceil(left) + M + Math.floor((need - (Math.ceil(left) + Math.ceil(right) + M * 2)) / 2);
  const fy = Math.ceil(up) + M;
  const cw = need * S;
  const ch = (Math.ceil(up) + Math.ceil(down) + M * 2) * S;
  const PAD = 10;
  const HEAD = 84;
  const SIDE = 0;
  const LAB = 28;
  cv.width = SIDE + PAD + 2 * (cw + PAD);
  cv.height = HEAD + 2 * (ch + LAB + PAD) + 34;
  const draw = (tick: number): void => {
    const t = tick / FPS / slow;
    g.fillStyle = '#16131c';
    g.fillRect(0, 0, cv.width, cv.height);
    text(`THE BONE ARCHER, ${slow > 1 ? 'three times slower than the game' : 'at the speed of the game'}`, PAD, 10, 20, '#ffd866', true);
    text('a mock-up: not in the game', PAD, 36, 15, '#a8a2b8');
    text("TODAY'S", SIDE + PAD + cw / 2, HEAD - 24, 18, '#f0e8ff', true, 'center');
    text("ON THE HEROES' BONES", SIDE + PAD + cw + PAD + cw / 2, HEAD - 24, 18, '#f0e8ff', true, 'center');
    cells.forEach((c, n) => {
      const col = n % 2;
      const row = Math.floor(n / 2);
      const x0 = SIDE + PAD + col * (cw + PAD);
      const y0 = HEAD + row * (ch + LAB + PAD);
      const { sp, slide } = shownAt(c, t);
      // (facing you it goes down the screen and to the right, and the floor goes by up and to the
      // left; facing away it goes up and to the right, and the floor goes by down and to the left)
      tilesBy(x0, y0, cw, ch, fx, fy, S, slide, c.back ? -slide / 2 : slide / 2);
      g.save();
      g.beginPath();
      g.rect(x0, y0, cw, ch);
      g.clip();
      figure(sp, x0 + fx * S, y0 + fy * S, S);
      g.restore();
      text(c.back ? 'facing away' : 'facing you', x0 + cw / 2, y0 + ch + 5, 15, '#a8a2b8', false, 'center');
    });
    let what = WHAT[0][1];
    for (const [at, w] of WHAT) if (t >= at) what = w;
    text(`it ${what}`, cv.width / 2, cv.height - 26, 18, '#ffd866', true, 'center');
  };
  draw(0);
  win.__frames = TICKS;
  win.__tickMs = 1000 / FPS;
  win.__frame = (i: number): string => {
    draw(i);
    return cv.toDataURL('image/png');
  };
  win.__ready = true;
}

// =============================================================================================
// sheet: the four standing figures, enlarged (the still sheet's lower half: tools/archer3_sheet.py
// puts the game's own pictures of them, at the size a phone shows them, over it)

if (mode === 'sheet') {
  const W = 1266;
  const S = Number(parts[1]) || 12;
  const cells: (Cell & { label: string })[] = [
    { art: NOW, back: false, label: "today's, facing you" },
    { art: BONES, back: false, label: 'on the bones, facing you' },
    { art: NOW, back: true, label: "today's, facing away" },
    { art: BONES, back: true, label: 'on the bones, facing away' },
  ];
  let left = 10;
  let right = 10;
  let up = 10;
  let down = 4;
  for (const c of cells) {
    const sp = (c.back ? c.art.back : c.art.front).idle[0];
    left = Math.max(left, sp.ax);
    right = Math.max(right, sp.w - sp.ax);
    up = Math.max(up, sp.ay);
    down = Math.max(down, sp.h - sp.ay);
  }
  const GAP = 10;
  const cw = Math.floor((W - GAP * 5) / 4);
  const ch = Math.ceil(up + down + 8) * S;
  const LAB = 34;
  cv.width = W;
  cv.height = ch + LAB + GAP * 2;
  g.fillStyle = '#17142e';
  g.fillRect(0, 0, cv.width, cv.height);
  cells.forEach((c, n) => {
    const x0 = GAP + n * (cw + GAP) + (n >= 2 ? 0 : 0);
    const y0 = GAP;
    const fx = Math.round(cw / S / 2 - (right - left) / 2);
    const fy = Math.ceil(up + 4);
    tiles(x0, y0, cw, ch, fx, fy, S);
    g.save();
    g.beginPath();
    g.rect(x0, y0, cw, ch);
    g.clip();
    figure((c.back ? c.art.back : c.art.front).idle[0], x0 + fx * S, y0 + fy * S, S);
    g.restore();
    text(c.label, x0 + cw / 2, y0 + ch + 8, 21, n % 2 === 1 ? '#ffd866' : '#f0e8ff', true, 'center');
  });
  win.__ready = true;
}

/** The floor of `tiles`, gone by `ox` game pixels to the left and `oy` up. */
function tilesBy(x0: number, y0: number, w: number, h: number, fx: number, fy: number, S: number, ox: number, oy: number): void {
  g.fillStyle = FLOOR;
  g.fillRect(x0, y0, w, h);
  g.save();
  g.beginPath();
  g.rect(x0, y0, w, h);
  g.clip();
  const mx = ((ox % 32) + 32) % 32;
  const my = ((oy % 16) + 16) % 16;
  for (let k = -6; k <= 8; k++) {
    for (let j = -10; j <= 10; j++) {
      const cx = x0 + (fx + k * 32 + (j % 2 === 0 ? 0 : 16) - mx) * S;
      const cy = y0 + (fy + j * 8 - my) * S;
      g.fillStyle = ((k + j) % 2 + 2) % 2 === 0 ? '#201e50' : '#1b1946';
      g.beginPath();
      g.moveTo(cx, cy - 7.5 * S);
      g.lineTo(cx + 15 * S, cy);
      g.lineTo(cx, cy + 7.5 * S);
      g.lineTo(cx - 15 * S, cy);
      g.closePath();
      g.fill();
    }
  }
  g.restore();
}

// =============================================================================================
// try:<gx>,<gy>,<gz>,<az>,<el>,<roll>;...[@scale]: ways of holding the bow, each facing you and facing away

if (mode === 'try') {
  const [list, sc] = (parts[1] || '6.5,2,-14.5,6,-42,25').split('@');
  const S = Number(sc) || 5;
  const tries = list.split(';').map((v) => v.split(',').map(Number));
  const sprites: { sp: Sprite; label: string }[] = [];
  for (const v of tries) {
    const [gx, gy, gz, az, el, roll] = v;
    const m = archerHolding([gx, gy, gz], az, el, roll);
    for (const view of ['front', 'back'] as const) sprites.push({ sp: toSprite(paintSkeleton3(m, 0, view), null, CANVAS3.ax, CANVAS3.ay), label: `${v.join(',')} ${view}` });
  }
  let left = 10;
  let right = 10;
  let up = 10;
  let down = 4;
  for (const { sp } of sprites) {
    left = Math.max(left, sp.ax);
    right = Math.max(right, sp.w - sp.ax);
    up = Math.max(up, sp.ay);
    down = Math.max(down, sp.h - sp.ay);
  }
  const cw = Math.ceil(left + right + 6) * S;
  const ch = Math.ceil(up + down + 6) * S;
  const perRow = 6;
  cv.width = perRow * (cw + 6) + 6;
  cv.height = Math.ceil(sprites.length / perRow) * (ch + 22) + 10;
  g.fillStyle = '#16131c';
  g.fillRect(0, 0, cv.width, cv.height);
  sprites.forEach(({ sp, label }, n) => {
    const x0 = 6 + (n % perRow) * (cw + 6);
    const y0 = 6 + Math.floor(n / perRow) * (ch + 22);
    const fx = Math.ceil(left + 3);
    const fy = Math.ceil(up + 3);
    tiles(x0, y0, cw, ch, fx, fy, S);
    figure(sp, x0 + fx * S, y0 + fy * S, S);
    text(label, x0 + 3, y0 + ch + 3, 12, '#a8a2b8');
  });
  win.__ready = true;
}

// =============================================================================================
// hero:<short name in MOVES3>:<front | back>[:<scale>[:<every>]]: a hero's move on the bones, for comparison (the ranger's `shot`)

if (mode === 'hero') {
  const name = parts[1] || 'shot';
  const view = parts[2] === 'back' ? 'back' : 'front';
  const S = Number(parts[3]) || 6;
  const every = Math.max(1, Number(parts[4]) || 2);
  const move = MOVES3[name];
  if (!move) throw new Error('no move ' + name);
  const end = move.motion.keys[move.motion.keys.length - 1].at;
  const list: Sprite[] = [];
  for (let i = 0; i <= Math.round(end * 30); i += every) list.push(spriteOf3(move, i / 30, view));
  let left = 10;
  let right = 10;
  let up = 10;
  let down = 4;
  for (const f of list) {
    left = Math.max(left, f.ax);
    right = Math.max(right, f.w - f.ax);
    up = Math.max(up, f.ay);
    down = Math.max(down, f.h - f.ay);
  }
  const cw = Math.ceil(left + right + 6) * S;
  const ch = Math.ceil(up + down + 6) * S;
  const perRow = 6;
  cv.width = perRow * (cw + 6) + 6;
  cv.height = 30 + Math.ceil(list.length / perRow) * (ch + 22);
  g.fillStyle = '#16131c';
  g.fillRect(0, 0, cv.width, cv.height);
  text(`${name}, ${view}`, 6, 6, 16, '#ffd866', true);
  list.forEach((f, n) => {
    const x0 = 6 + (n % perRow) * (cw + 6);
    const y0 = 30 + Math.floor(n / perRow) * (ch + 22);
    const fx = Math.ceil(left + 3);
    const fy = Math.ceil(up + 3);
    tiles(x0, y0, cw, ch, fx, fy, S);
    figure(f, x0 + fx * S, y0 + fy * S, S, false);
    text(`${n * every}`, x0 + 3, y0 + ch + 3, 12, '#a8a2b8');
  });
  win.__ready = true;
}

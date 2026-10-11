// Dev page: THE FLESHMANCER, the Crypt's lair boss on floor 5 (a mock-up: NOT IN THE GAME; art/fleshmancer.ts):
// his look, for the owner's yes, on a piece of the dungeon's own floor with the dark of a dungeon over it.
// (docs/mockups/fleshmancer/README.md)
//   node tools/preview.mjs src/dev/preview_fleshmancer.ts previews/fleshmancer/sheet.png 1600 1000 "sheet:3"
//   node tools/page_gif.mjs src/dev/preview_fleshmancer.ts "stand:4" previews/fleshmancer/stand.gif
//   hash = sheet[:<scale>]: standing, facing you and facing away, beside the knight (standing, and ready to fight) for size; under them,
//            beside the other hooded ones he must not be taken for (a cultist, the high priest, the
//            Shade, the Headsman)
//          close[:<scale>]: him alone, big, facing you and facing away
//          pose:<seconds>:<front | back>[:<scale>]: one frame of his stand, big
//          poses:<seconds,seconds,...>[:<scale>]: a row of frames of his stand, facing you and away
//          stand[:<scale>]: frames of a moving picture (tools/page_gif.mjs): his stand, twice round,
//            facing you and facing away
//          floor[:<device pixels to a picture pixel>[:<seconds into his stand>]]: him in a room of the Crypt's floor (src/dev/fm_floor.ts),
//            the knight come in, at the game's own size and in the game's own dark, as a phone shows it
//            (844 by 390 points at three device pixels to a point: 2.5 device pixels to a picture pixel)
import { makeGroundArt } from '../art/ground';
import { spriteOf3 } from '../art/heroes3';
import { toSprite } from '../art/kit';
import { makeCultistArt, makeHighPriestArt } from '../art/monster_cultist';
import { MOVES3 } from '../art/moves3';
import { HEADSMAN } from '../art/bosses3';
import { FLESHMANCER, FM_FLOAT, fmHoodTop, staffOf } from '../art/fleshmancer';
import { SHADE, canvasOf, paintMob, skeletonAt } from '../art/new_mobs3';
import type { Mob } from '../art/new_mobs3';
import type { GameView } from '../art/skin';
import { drawAura, drawLights, flipSprite } from '../engine/px';
import type { Sprite } from '../engine/px';
import { FM_FLOOR } from './fm_floor';

const parts = decodeURIComponent(location.hash.slice(1)).split(':');
const mode = parts[0] || 'sheet';

const cv = document.createElement('canvas');
cv.style.position = 'static';
cv.style.display = 'block';
for (const el of [document.documentElement, document.body]) {
  el.style.height = 'auto';
  el.style.overflow = 'visible';
}
const BG = '#17142e';
document.body.style.margin = '0';
document.body.style.background = BG;
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
const win = window as unknown as { __ready: boolean; __frames: number; __tickMs: number; __frame: (i: number) => string };
const ground = makeGroundArt(FM_FLOOR.theme);

function text(s: string, x: number, y: number, size: number, color: string, weight = 400, align: CanvasTextAlign = 'left'): void {
  g.fillStyle = color;
  g.font = `${weight} ${size}px system-ui, -apple-system, Segoe UI, sans-serif`;
  g.textBaseline = 'top';
  g.textAlign = align;
  g.fillText(s, x, y);
  g.textAlign = 'left';
}

/** A sprite's reach from its floor point, in picture pixels: left, right, up, down. */
function reachOf(sp: Sprite): [number, number, number, number] {
  return [sp.ax * 2, (sp.w - sp.ax) * 2, sp.ay * 2, (sp.h - sp.ay) * 2];
}
function reachAll(sps: ReadonlyArray<Sprite>): [number, number, number, number] {
  let [l, r, u, d] = [0, 0, 0, 0];
  for (const sp of sps) {
    const [a, b, e, f] = reachOf(sp);
    l = Math.max(l, a);
    r = Math.max(r, b);
    u = Math.max(u, e);
    d = Math.max(d, f);
  }
  return [l, r, u, Math.max(d, 10)];
}

/**
 * A pane of the dungeon's floor (the game's own tiles), the dark of a dungeon over it (thinner about the
 * figures), and on it figures at their floor points: each with its soft shadow, its pool of light, itself
 * and its lights. `S`: screen pixels to a picture pixel. (As preview_bosses.ts.)
 */
function pane(x: number, y: number, w: number, h: number, S: number, who: ReadonlyArray<{ sp: Sprite; fx: number; fy: number; shadow: number }>): void {
  g.save();
  g.beginPath();
  g.rect(x, y, w, h);
  g.clip();
  g.fillStyle = '#07061a';
  g.fillRect(x, y, w, h);
  g.imageSmoothingEnabled = false;
  const fx0 = who.length ? who[0].fx : x + w / 2;
  const fy0 = who.length ? who[0].fy : y + h / 2;
  const span = Math.ceil(w / (32 * S)) + 6;
  for (let ty = -span; ty <= span; ty++) {
    for (let tx = -span; tx <= span; tx++) {
      const px = fx0 + (tx - ty) * 32 * S;
      const py = fy0 + (tx + ty) * 16 * S - 16 * S;
      if (px < x - 70 * S || px > x + w + 70 * S || py < y - 40 * S || py > y + h + 40 * S) continue;
      const sp = ground.floor(tx + 20, ty + 20);
      g.drawImage(sp.img, px - sp.ax * 2 * S, py - sp.ay * 2 * S, sp.img.width * S, sp.img.height * S);
    }
  }
  g.fillStyle = 'rgba(6,4,14,0.55)';
  g.fillRect(x, y, w, h);
  g.globalCompositeOperation = 'destination-out';
  for (const f of who) {
    const r = Math.max(60, (f.shadow + 50) * S);
    const lit = g.createRadialGradient(f.fx, f.fy - 24 * S, 0, f.fx, f.fy - 24 * S, r);
    lit.addColorStop(0, 'rgba(0,0,0,0.6)');
    lit.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = lit;
    g.fillRect(x, y, w, h);
  }
  g.globalCompositeOperation = 'source-over';
  for (const f of who) shadowAt(f.fx, f.fy, f.shadow * S);
  for (const f of who) {
    drawAura(g, f.sp, f.fx, f.fy, 2 * S);
    g.imageSmoothingEnabled = false;
    g.drawImage(f.sp.img, Math.round(f.fx - f.sp.ax * 2 * S), Math.round(f.fy - f.sp.ay * 2 * S), f.sp.img.width * S, f.sp.img.height * S);
    drawLights(g, f.sp, f.fx, f.fy, 2 * S);
  }
  g.restore();
}
/** The soft shadow under a figure (the game's: a soft oval, darkest under it). */
function shadowAt(fx: number, fy: number, r: number, c: CanvasRenderingContext2D = g): void {
  const sh = c.createRadialGradient(fx, fy, 0, fx, fy, r);
  sh.addColorStop(0, 'rgba(0,0,0,0.62)');
  sh.addColorStop(0.65, 'rgba(0,0,0,0.42)');
  sh.addColorStop(1, 'rgba(0,0,0,0)');
  c.save();
  c.translate(fx, fy);
  c.scale(1, 0.5);
  c.translate(-fx, -fy);
  c.fillStyle = sh;
  c.beginPath();
  c.arc(fx, fy, r, 0, Math.PI * 2);
  c.fill();
  c.restore();
}

const spOf = (mob: Mob, which: string, t: number, view: GameView): Sprite => toSprite(paintMob(mob, which, t, view), mob.aura, canvasOf(mob).ax, canvasOf(mob).ay);
const KNIGHT = (view: GameView = 'front'): Sprite => spriteOf3(MOVES3.rear, 0, view);
const FM = FLESHMANCER;

/** A row of figures on one pane, each with its name and a line under it. */
function row(list: { sp: Sprite; name: string; line: string; shadow: number; gold: boolean }[], y: number, S: number, PAD: number, W: number): number {
  const GAP = 18;
  const cellOf = (sp: Sprite): [number, number] => {
    const [l, r] = reachOf(sp);
    const cw = Math.max(l + r, 62);
    return [cw, l + (cw - l - r) / 2];
  };
  const [, , up, down] = reachAll(list.map((f) => f.sp));
  const wide = list.reduce((a, f) => a + cellOf(f.sp)[0] + GAP, GAP);
  const h = (up + down + 14) * S;
  let x = PAD + (W - PAD * 2 - wide * S) / 2 + GAP * S;
  const at = list.map((f) => {
    const [cw, l] = cellOf(f.sp);
    const fx = x + l * S;
    x += (cw + GAP) * S;
    return { sp: f.sp, fx, fy: y + (up + 7) * S, shadow: f.shadow };
  });
  pane(PAD, y, W - PAD * 2, h, S, at);
  at.forEach((w, i) => {
    text(list[i].name, w.fx, y + h + 6, 17, list[i].gold ? '#ffd866' : '#cfc8ff', 700, 'center');
    text(list[i].line, w.fx, y + h + 27, 14, '#a8a2b8', 500, 'center');
  });
  return h + 50;
}
function widthOf(list: { sp: Sprite }[], S: number, PAD: number): number {
  const GAP = 18;
  return list.reduce((a, f) => {
    const [l, r] = reachOf(f.sp);
    return a + Math.max(l + r, 62) + GAP;
  }, GAP) * S + PAD * 2;
}
/** The top of his hood and of his skull's fire above the floor, at rest (picture pixels, as painted). */
function heights(): { hood: number; skull: number } {
  const s = skeletonAt(FM, 'stand', 0);
  return { hood: Math.round(fmHoodTop(s)), skull: Math.round(staffOf(s).skull[2] + 4) };
}

if (mode === 'sheet') {
  const S = Number(parts[1]) || 3;
  const PAD = 14;
  const { hood, skull } = heights();
  const row1 = [
    { sp: spriteOf3(MOVES3.ktown, 0, 'front'), name: 'The knight', line: 'a hero, standing: 58 tall', shadow: 12, gold: false },
    { sp: KNIGHT(), name: 'The knight', line: 'ready to fight', shadow: 12, gold: false },
    { sp: spOf(FM, 'stand', 0, 'front'), name: 'The Fleshmancer', line: `facing you: his hood ${hood} up, floating ${FM_FLOAT}`, shadow: FM.shadow, gold: true },
    { sp: spOf(FM, 'stand', 0, 'back'), name: 'The Fleshmancer', line: `facing away: the skull ${skull} up`, shadow: FM.shadow, gold: true },
  ];
  const row2 = [
    { sp: makeCultistArt().front.idle[0], name: 'A cultist', line: 'his flock', shadow: 11, gold: false },
    { sp: makeHighPriestArt().front.idle[0], name: 'The high priest', line: 'their leader', shadow: 11, gold: false },
    { sp: spOf(SHADE, 'stand', 0, 'front'), name: 'A Shade', line: 'hooded, floating', shadow: SHADE.shadow, gold: false },
    { sp: spOf(FM, 'stand', 0, 'front'), name: 'The Fleshmancer', line: 'the lair boss', shadow: FM.shadow, gold: true },
    { sp: spOf(HEADSMAN, 'stand', 0, 'front'), name: 'The Headsman', line: 'floor 2’s boss', shadow: HEADSMAN.shadow, gold: false },
  ];
  const W = Math.max(1100, widthOf(row1, S, PAD), widthOf(row2, 2, PAD));
  const [, , up1, down1] = reachAll(row1.map((f) => f.sp));
  const [, , up2, down2] = reachAll(row2.map((f) => f.sp));
  const h1 = (up1 + down1 + 14) * S + 50;
  const h2 = (up2 + down2 + 14) * 2 + 50;
  cv.width = W;
  cv.height = 70 + h1 + 40 + h2 + PAD;
  g.fillStyle = BG;
  g.fillRect(0, 0, cv.width, cv.height);
  text('The Fleshmancer', PAD, 12, 26, '#ffd866', 700);
  text('the Crypt’s lair boss, floor 5. His look, standing. A mock-up: not in the game', PAD, 44, 16, '#cfc8ff', 600);
  row(row1, 70, S, PAD, W);
  text('Beside the other hooded ones he must not be taken for (half the size of the row above)', PAD, 70 + h1 + 8, 16, '#cfc8ff', 600);
  row(row2, 70 + h1 + 36, 2, PAD, W);
  win.__ready = true;
}

if (mode === 'close') {
  const S = Number(parts[1]) || 7;
  const PAD = 12;
  const list = (['front', 'back'] as const).map((v) => ({ sp: spOf(FM, 'stand', 0, v), name: v === 'front' ? 'Facing you' : 'Facing away', line: v === 'front' ? 'his right hand on the staff, his left his casting hand' : 'seen as the camera truly sees him: the staff still in his right hand', shadow: FM.shadow, gold: true }));
  const W = widthOf(list, S, PAD);
  const [, , up, down] = reachAll(list.map((f) => f.sp));
  cv.width = W;
  cv.height = 56 + (up + down + 14) * S + 50 + PAD;
  g.fillStyle = BG;
  g.fillRect(0, 0, cv.width, cv.height);
  text('The Fleshmancer, close', PAD, 10, 24, '#ffd866', 700);
  row(list, 52, S, PAD, W);
  win.__ready = true;
}

if (mode === 'pose') {
  const t = Number(parts[1]) || 0;
  const view = (parts[2] || 'front') as GameView;
  const S = Number(parts[3]) || 6;
  const sp = spOf(FM, 'stand', t, view);
  const [l, r, u, d] = reachOf(sp);
  cv.width = Math.max(300, (l + r + 40) * S);
  cv.height = (u + d + 40) * S + 40;
  g.fillStyle = BG;
  g.fillRect(0, 0, cv.width, cv.height);
  text(`The Fleshmancer: stand ${t} s, ${view}`, 10, 8, 16, '#ffd866', 700);
  pane(0, 30, cv.width, cv.height - 30, S, [{ sp, fx: (l + 20) * S, fy: 30 + (u + 20) * S, shadow: FM.shadow }]);
  win.__ready = true;
}

if (mode === 'poses') {
  const ts = (parts[1] || '0').split(',').map(Number);
  const S = Number(parts[2]) || 3;
  const PAD = 10;
  const rows = (['front', 'back'] as const).map((view) => ts.map((t) => ({ sp: spOf(FM, 'stand', t, view), name: `${t} s`, line: view, shadow: FM.shadow, gold: false })));
  const W = Math.max(...rows.map((r) => widthOf(r, S, PAD)));
  const [, , up, down] = reachAll(rows.flat().map((f) => f.sp));
  const h = (up + down + 14) * S + 50;
  cv.width = W;
  cv.height = 40 + h * 2 + PAD;
  g.fillStyle = BG;
  g.fillRect(0, 0, cv.width, cv.height);
  text('The Fleshmancer: his stand', PAD, 8, 18, '#ffd866', 700);
  row(rows[0], 40, S, PAD, W);
  row(rows[1], 40 + h, S, PAD, W);
  win.__ready = true;
}

// =============================================================================================
// HIS STAND AS A FILM (tools/page_gif.mjs): twice round, at its own frames a second, as the game shows it

function filmPage(ticks: number, fps: number, draw: (tick: number) => void): void {
  draw(0);
  win.__frames = ticks;
  win.__tickMs = 1000 / fps;
  win.__frame = (i: number): string => {
    draw(i);
    return cv.toDataURL('image/png');
  };
  win.__ready = true;
}

if (mode === 'stand') {
  const S = Number(parts[1]) || 3;
  const FPS = 30;
  const LOOP = FM.idleFrames / FM.idleFps;
  const TICKS = Math.round(2 * LOOP * FPS);
  const at = (t: number): number => (Math.floor(t * FM.idleFps + 1e-6) % FM.idleFrames) / FM.idleFps;
  const all: Sprite[] = [];
  for (let i = 0; i < FM.idleFrames; i++) for (const v of ['front', 'back'] as const) all.push(spOf(FM, 'stand', i / FM.idleFps, v));
  const [l, r, u, d] = reachAll(all);
  const PAD = 10;
  const M = 16;
  const cw = (l + r + 2 * M) * S;
  const ch = (u + d + 2 * M) * S;
  const HEAD = 58;
  cv.width = PAD + 2 * (cw + PAD);
  cv.height = HEAD + ch + 34;
  filmPage(TICKS, FPS, (tick) => {
    const t = tick / FPS;
    g.fillStyle = BG;
    g.fillRect(0, 0, cv.width, cv.height);
    text(`${FM.stand.name}`, PAD, 8, 17, '#ffd866', 700);
    text(`a mock-up: not in the game. His stand, ${FM.idleFrames} frames at ${FM.idleFps} a second, twice round`, PAD, 32, 14, '#cfc8ff', 600);
    for (const [j, view] of (['front', 'back'] as const).entries()) {
      const x = PAD + j * (cw + PAD);
      pane(x, HEAD, cw, ch, S, [{ sp: spOf(FM, 'stand', at(t), view), fx: x + (M + l) * S, fy: HEAD + (M + u) * S, shadow: FM.shadow }]);
      text(view === 'front' ? 'facing you' : 'facing away', x + cw / 2, HEAD + ch + 6, 15, '#e8e2ff', 600, 'center');
    }
  });
}

// =============================================================================================
// ON THE CRYPT'S FLOOR, AS A PHONE SHOWS HIM: the game's view of a room, in the game's own pixels (a
// phone of 844 by 390 points at three device pixels to one: the game makes its pixel five device pixels,
// so its view is 506 by 234 of them), the dark laid over it as the game lays it (render.ts `light`: the
// far floor 0.88 dark, a wide gentle pool and a bright one round the hero, a pool round a boss, a hole for
// every light a monster gives off, the vignette), then what glows. The knight has come in; the fleshmancer
// floats four tiles off, facing him.

if (mode === 'floor') {
  const DS = Number(parts[1]) || 2.5;
  const GW = 506;
  const GH = 234;
  const RES = 2;
  const scene = document.createElement('canvas');
  scene.width = GW * RES;
  scene.height = GH * RES;
  const c = scene.getContext('2d') as CanvasRenderingContext2D;
  c.setTransform(RES, 0, 0, RES, 0, 0);
  c.imageSmoothingEnabled = false;
  c.fillStyle = '#07050a';
  c.fillRect(0, 0, GW, GH);
  // (the camera on the hero, a little below the middle; the floor's tiles laid round him)
  const hx = GW / 2 + 40;
  const hy = GH / 2 + 34;
  const toScreen = (tx: number, ty: number): [number, number] => [hx + (tx - ty) * 16, hy + (tx + ty) * 8];
  for (let ty = -14; ty <= 14; ty++) {
    for (let tx = -14; tx <= 14; tx++) {
      const [px, py] = toScreen(tx, ty);
      if (px < -40 || px > GW + 40 || py < -30 || py > GH + 30) continue;
      const sp = ground.floor(tx + 40, ty + 40);
      c.drawImage(sp.img, px - sp.ax, py - 8 - sp.ay, sp.img.width / 2, sp.img.height / 2);
    }
  }
  // (what lies about on the floor, in the dark between them, as the game lays litter: anchored at its middle)
  const litter = FM_FLOOR.litter();
  const LITTER: ReadonlyArray<readonly [number, number, number]> = [[-6.5, 2.2, 0], [-2.2, -3.6, 1], [1.8, -2.4, 4], [-8.5, -3.2, 5], [3.4, 3.0, 2], [-4.8, 4.6, 6], [5.6, -5.2, 7], [-10, 0.5, 3], [0.6, 5.8, 8]];
  for (const [tx, ty, k] of LITTER) {
    const sp = litter[k % litter.length];
    const [px, py] = toScreen(tx, ty);
    c.drawImage(sp.img, Math.round(px - sp.ax), Math.round(py - sp.ay), sp.w, sp.h);
  }
  const t0 = Number(parts[2]) || 0;
  const boss = spOf(FM, 'stand', t0, 'front');
  const knight = flipSprite(KNIGHT('back'));
  const [bx, by] = toScreen(-4.2, -0.6);
  const who = [
    { sp: boss, x: bx, y: by, shadow: FM.shadow / 2 },
    { sp: knight, x: hx, y: hy, shadow: 6 },
  ].sort((a, b) => a.y - b.y);
  for (const f of who) shadowAt(f.x, f.y, f.shadow * 2, c);
  for (const f of who) {
    drawAura(c, f.sp, f.x, f.y);
    c.drawImage(f.sp.img, Math.round(f.x - f.sp.ax), Math.round(f.y - f.sp.ay), f.sp.w, f.sp.h);
  }
  // THE DARK (render.ts `light`), in the game's pixels
  const dark = document.createElement('canvas');
  dark.width = GW * RES;
  dark.height = GH * RES;
  const dg = dark.getContext('2d') as CanvasRenderingContext2D;
  dg.setTransform(RES, 0, 0, RES, 0, 0);
  dg.fillStyle = 'rgba(6,4,14,0.88)';
  dg.fillRect(0, 0, GW, GH);
  dg.globalCompositeOperation = 'destination-out';
  const pool = document.createElement('canvas');
  pool.width = 128;
  pool.height = 128;
  {
    const pc = pool.getContext('2d') as CanvasRenderingContext2D;
    const grd = pc.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, 'rgba(0,0,0,1)');
    grd.addColorStop(0.5, 'rgba(0,0,0,0.7)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    pc.fillStyle = grd;
    pc.fillRect(0, 0, 128, 128);
  }
  dg.imageSmoothingEnabled = true;
  const spot = (x: number, y: number, r: number, strength: number): void => {
    dg.globalAlpha = Math.min(1, strength);
    dg.drawImage(pool, Math.round(x - r), Math.round(y - r * 0.62), Math.round(r * 2), Math.round(r * 1.24));
  };
  spot(hx, hy - 8, 380, 0.36);
  spot(hx, hy - 8, 165, 1);
  for (const l of boss.lights ?? []) if (l.r >= 7) spot(bx + l.x - boss.ax, by + l.y - boss.ay + 6, l.r * 2.6, (l.a ?? 0.5) * 1.1);
  spot(bx, by - 12, 56, 0.7);
  dg.globalAlpha = 1;
  dg.globalCompositeOperation = 'source-over';
  {
    dg.save();
    dg.translate(GW / 2, GH / 2);
    dg.scale(GW / 2, GH / 2);
    const grd = dg.createRadialGradient(0, 0, 0.5, 0, 0, Math.SQRT2);
    grd.addColorStop(0, 'rgba(4,3,10,0)');
    grd.addColorStop(1, 'rgba(4,3,10,0.62)');
    dg.fillStyle = grd;
    dg.fillRect(-1, -1, 2, 2);
    dg.restore();
  }
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.drawImage(dark, 0, 0);
  c.setTransform(RES, 0, 0, RES, 0, 0);
  // what glows, over the dark
  drawLights(c, knight, hx, hy);
  drawLights(c, boss, bx, by);
  cv.width = Math.round(GW * RES * DS);
  cv.height = Math.round(GH * RES * DS);
  g.imageSmoothingEnabled = false;
  g.drawImage(scene, 0, 0, cv.width, cv.height);
  win.__ready = true;
}

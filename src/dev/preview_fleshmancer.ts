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
import { FLESHMANCER, FM_DEATH, FM_HALT, FM_REEL, FM_SET_OFF, FM_FIRE, FM_HAND_FPS, FM_HAND_FRAMES, FM_HAND_KINDS, FM_HAND_TIME, FM_RAISE, FM_REST, FM_RINGS, FM_SHARDS, fmFireTurn, fmHemOf, fmHoodTop, fmMouthAt, fmSkullAt, fmTails, makeRingHandArt, staffOf } from '../art/fleshmancer';
import { FM_RAISE_STIR, FM_RINGS_LAID, FM_SHARD, FM_SHARD_BREAK, FM_WAVE_SPEED, drawBoneShard, drawFireStream, drawHandCrack, drawRaiseGlow, drawScorch, drawShardBreak, drawShardShadow, drawSlamWave, glowAt } from '../art/fm_spells';
import { DIE3_TIME, STAND3, deathOf3, paintSkeleton3 } from '../art/monster_bones3';
import { TILE3 } from '../art/new_mobs3';
import { solve } from '../art/skeleton';
import { SHADE, canvasOf, deathOfMob, paintMob, skeletonAt } from '../art/new_mobs3';
import type { Mob } from '../art/new_mobs3';
import { CANVAS3 } from '../art/skin';
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
/** The soft shadow under a figure, as the game lays it (render.ts `shadow`: a soft oval, darkest under the figure and gone at its rim, at 0.7). */
function shadowAt(fx: number, fy: number, r: number, c: CanvasRenderingContext2D = g): void {
  const sh = c.createRadialGradient(fx, fy, 0, fx, fy, r);
  sh.addColorStop(0, 'rgba(0,0,0,0.7)');
  sh.addColorStop(0.4, 'rgba(0,0,0,0.6)');
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
/** The top of his hood and the middle of the skull at rest (the middle of his bob), and the lowest of his tails above the floor at the bottom of his bob (picture pixels, as painted). */
function heights(): { hood: number; skull: number; gap: number } {
  const r = solve(FM.build, FM_REST);
  const s = skeletonAt(FM, 'stand', 0);
  const tails = fmTails(fmHemOf(s), 0, 0);
  const gap = Math.min(...tails.flatMap((x) => x.pts.map((p) => p[2] - x.r)));
  return { hood: Math.round(fmHoodTop(r)), skull: Math.round(staffOf(r).skull[2]), gap: Math.round(gap) };
}

if (mode === 'sheet') {
  const S = Number(parts[1]) || 3;
  const PAD = 14;
  const { hood, gap } = heights();
  const row1 = [
    { sp: spriteOf3(MOVES3.ktown, 0, 'front'), name: 'The knight', line: 'a hero, standing: 58 tall', shadow: 12, gold: false },
    { sp: KNIGHT(), name: 'The knight', line: 'ready to fight', shadow: 12, gold: false },
    { sp: spOf(FM, 'stand', 0, 'front'), name: 'The Fleshmancer', line: `facing you: hood ${hood} up`, shadow: FM.shadow, gold: true },
    { sp: spOf(FM, 'stand', 0, 'back'), name: 'The Fleshmancer', line: `away: tails ${gap} off the floor`, shadow: FM.shadow, gold: true },
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

if (mode === 'aposes') {
  // aposes:<move>:<seconds,seconds,...>[:<scale>]: a row of frames of one of his moves, facing you and away
  const which = parts[1] || 'attack';
  const ts = (parts[2] || '0').split(',').map(Number);
  const S = Number(parts[3]) || 3;
  const PAD = 10;
  const rows = (['front', 'back'] as const).map((view) => ts.map((t) => ({ sp: spOf(FM, which, t, view), name: `${t} s`, line: view, shadow: FM.shadow, gold: false })));
  const W = Math.max(...rows.map((r) => widthOf(r, S, PAD)));
  const [, , up, down] = reachAll(rows.flat().map((f) => f.sp));
  const h = (up + down + 14) * S + 50;
  cv.width = W;
  cv.height = 40 + h * 2 + PAD;
  g.fillStyle = BG;
  g.fillRect(0, 0, cv.width, cv.height);
  text(`The Fleshmancer: ${which}`, PAD, 8, 18, '#ffd866', 700);
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

// =============================================================================================
// HIS ATTACKS AS FILMS (tools/page_gif.mjs): in a room of the Crypt's floor, in the game's own pixels, the
// knight come in; him standing a moment, the attack, and standing again; what he sends out where the game
// would put it (art/fm_spells.ts).
//   film:<shards | rings | raise | fire>[:<screen pixels to a game pixel: 4, a phone's size doubled>]

interface Figure { sp: Sprite; x: number; y: number; light?: boolean }
if (mode === 'film') {
  const which = parts[1] || 'shards';
  const DS = Number(parts[2]) || 4;
  const RES = 2;
  const FPS = 30;
  const LEAD = 0.4;
  const move = which === 'shards' ? 'attack' : which;
  const LONG: Record<string, number> = { shards: FM_SHARDS.long, rings: FM_RINGS.long, raise: FM_RAISE.long, fire: FM_FIRE.long, glide: 0, reel: 0, death: 0 };
  const AFTER: Record<string, number> = { shards: 1.0, rings: 1.9, raise: 1.4, fire: 0.6, glide: 0, reel: 0, death: 0 };
  // (his glide, struck and his death: a run of his moves one after another, as the game would play them)
  const RUNS: Record<string, ReadonlyArray<readonly [string, number]>> = {
    glide: [['stand', 0.4], ['setOff', FM_SET_OFF], ['walk', 2], ['halt', FM_HALT], ['stand', 0.8]],
    reel: [['stand', 0.4], ['reel', FM_REEL], ['stand', 0.5], ['reel', FM_REEL], ['stand', 0.8]],
    death: [['stand', 0.4], ['dying', FM_DEATH.long], ['gone', 0.6]],
  };
  const run = RUNS[which];
  const GW = which === 'shards' ? 300 : 320;
  const GH = which === 'shards' ? 190 : which === 'fire' ? 226 : 210;
  // (his floor point on the screen, and the knight's, in tiles from his)
  const hx = which === 'shards' || which === 'glide' ? 78 : GW / 2 - 8;
  const hy = which === 'shards' ? 92 : which === 'fire' ? 136 : 116;
  const KN: Record<string, [number, number]> = { shards: [3.4, 0.25], rings: [3.6, 0.2], raise: [3.0, 0.4], fire: [3.3, 0.6], glide: [5.2, -1.4], reel: [1.6, 0.3], death: [2.6, 0.4] };
  const at = (tx: number, ty: number): [number, number] => [hx + (tx - ty) * 16, hy + (tx + ty) * 8];
  const total = run ? run.reduce((a, [, l]) => a + l, 0) : LEAD + LONG[which] + AFTER[which];
  /** Where in the run a moment of the film is: the move, how far into it, and how far he has glided along the floor (tiles) by then. */
  const runAt = (t: number): { mv: string; tt: number; along: number } => {
    let t0 = 0;
    let along = 0;
    for (const [i, [mv, l]] of (run ?? []).entries()) {
      const moving = mv === 'setOff' || mv === 'walk' || mv === 'halt';
      if (t < t0 + l || i === (run ?? []).length - 1) return { mv, tt: Math.min(l, t - t0), along: along + (moving ? FM.pace * Math.min(l, t - t0) : 0) };
      if (moving) along += FM.pace * l;
      t0 += l;
    }
    return { mv: 'stand', tt: 0, along };
  };
  const TICKS = Math.round(total * FPS);
  const knight = flipSprite(KNIGHT('back'));
  const litter = FM_FLOOR.litter();
  const LITTER: ReadonlyArray<readonly [number, number, number]> = [[-3.5, 2.2, 0], [-2.2, -3.6, 1], [1.8, -2.4, 4], [-5.5, -1.2, 5], [5.4, 3.0, 2], [-1.8, 4.6, 6], [5.6, -3.2, 7], [-6, 0.5, 3], [0.6, 5.2, 8]];
  // (his move at a moment of the film: his stand before and after it, at its own frames a second)
  const standAt = (t: number): number => (Math.floor(t * FM.idleFps + 1e-6) % FM.idleFrames) / FM.idleFps;
  const himAt = (t: number): [string, number] => {
    if (run) {
      const r = runAt(t);
      if (r.mv === 'stand') return ['stand', standAt(r.tt)];
      if (r.mv === 'walk') return ['walk', (Math.floor(r.tt * FM.walkFps + 1e-6) % FM.walkFrames) / FM.walkFps];
      if (r.mv === 'dying') return ['dying', Math.round(r.tt * 20) / 20];
      if (r.mv === 'gone') return ['gone', 0];
      return [r.mv, Math.round(r.tt * 30) / 30];
    }
    if (t < LEAD) return ['stand', standAt(t)];
    if (t < LEAD + LONG[which]) return [move, Math.round((t - LEAD) * 30) / 30];
    return ['stand', standAt(t - LEAD - LONG[which])];
  };
  const cache = new Map<string, Sprite>();
  const sprite = (key: string, make: () => Sprite): Sprite => {
    let sp = cache.get(key);
    if (!sp) cache.set(key, (sp = make()));
    return sp;
  };
  const himSp = (mv: string, t: number): Sprite =>
    sprite(`fm:${mv}:${t.toFixed(3)}`, () => (mv === 'dying' || mv === 'gone' ? toSprite(deathOfMob(FM, mv === 'gone' ? 1 : t / FM.dieTime, 'front'), null, canvasOf(FM).ax, canvasOf(FM).ay) : spOf(FM, mv, t, 'front')));
  // THE RINGS OF HANDS: each ring as the wave reaches it, a gap in each, turned its own way
  const hands: { x: number; y: number; t0: number; kind: number; seed: number }[] = [];
  if (which === 'rings') {
    const slam = LEAD + FM_RINGS.hit;
    FM_RINGS_LAID.forEach((ring, i) => {
      const g0 = [5, 1, 9][i];
      for (let j = 0; j < ring.n; j++) {
        if (((j - g0 + ring.n) % ring.n) < ring.gap) continue;
        const a = (j / ring.n) * Math.PI * 2 + i * 0.37;
        hands.push({ x: Math.cos(a) * ring.r, y: Math.sin(a) * ring.r, t0: slam + ring.r / FM_WAVE_SPEED + ((j * 7) % 5) * 0.012, kind: j % FM_HAND_KINDS, seed: i * 31 + j });
      }
    });
  }
  const handArt = [0, 1, 2].map((k) => makeRingHandArt('front', k));
  // RAISING THE DEAD: three heaps of bones round the room, each one of the dead coming back up out of it
  const PILES: ReadonlyArray<readonly [number, number, number]> = [[2.4, -2.3, 0], [3.3, 2.0, 0.14], [-1.6, 2.7, 0.27]];
  const pileAt = (t: number, i: number): { sp: Sprite; k: number; tau: number } => {
    const tau = t - (LEAD + FM_RAISE.shriek + PILES[i][2]);
    if (tau < FM_RAISE_STIR) return { sp: sprite('pile', () => toSprite(deathOf3(1, 'front'), null, CANVAS3.ax, CANVAS3.ay)), k: 1, tau };
    if (tau < FM_RAISE_STIR + DIE3_TIME) {
      const k = 1 - (tau - FM_RAISE_STIR) / DIE3_TIME;
      const kk = Math.round(k * DIE3_TIME * 30) / (DIE3_TIME * 30);
      return { sp: sprite(`die:${kk.toFixed(3)}`, () => toSprite(deathOf3(kk, 'front'), null, CANVAS3.ax, CANVAS3.ay)), k, tau };
    }
    const st = Math.round((tau - FM_RAISE_STIR - DIE3_TIME) * 30) / 30;
    return { sp: sprite(`sk:${(st % 1.2).toFixed(3)}`, () => toSprite(paintSkeleton3(STAND3, st % 1.2, 'front'), null, CANVAS3.ax, CANVAS3.ay)), k: 0, tau };
  };
  // THE SWEEPING FIRE: which way it pours on the floor (tiles), from the way he faces turning to his left
  const fireWay = (t: number): readonly [number, number] | null => {
    const tt = t - LEAD;
    if (tt < FM_FIRE.burst - 0.001 || tt > FM_FIRE.stop + 0.001) return null;
    const a = fmFireTurn(tt);
    return [Math.cos(a), -Math.sin(a)];
  };
  // THE SHARDS: a fan from where the skull is as it spits, the middle one at the knight
  const spit = LEAD + FM_SHARDS.hit;
  const skull0 = fmSkullAt('attack', FM_SHARDS.hit);
  const mouth0 = fmMouthAt('attack', FM_SHARDS.hit);
  const from: [number, number] = [skull0[0] / TILE3, -skull0[1] / TILE3];
  const h0 = (from[0] + from[1]) * 8 - mouth0[1] / 2;
  const [kx, ky] = KN[which];
  const toKnight = Math.hypot(kx - from[0], ky - from[1]);
  const aim = Math.atan2(ky - from[1], kx - from[0]);
  const shardAt = (i: number, d: number): { x: number; y: number; z: number } => {
    const a = aim + ((i - (FM_SHARD.fan - 1) / 2) * FM_SHARD.apart * Math.PI) / 180;
    const [x, y] = at(from[0] + Math.cos(a) * d, from[1] + Math.sin(a) * d);
    return { x, y, z: h0 * (1 - d / FM_SHARD.reach) + 4 * (d / FM_SHARD.reach) * (1 - d / FM_SHARD.reach) * 4 };
  };
  const shardEnd = (i: number): number => (i === (FM_SHARD.fan - 1) / 2 ? toKnight - 0.15 : FM_SHARD.reach);
  const scene = document.createElement('canvas');
  scene.width = GW * RES;
  scene.height = GH * RES;
  const c = scene.getContext('2d') as CanvasRenderingContext2D;
  const dark = document.createElement('canvas');
  dark.width = GW * RES;
  dark.height = GH * RES;
  const dg = dark.getContext('2d') as CanvasRenderingContext2D;
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
  cv.width = Math.round(GW * DS);
  cv.height = Math.round(GH * DS);
  filmPage(TICKS, FPS, (tick) => {
    const t = tick / FPS;
    c.setTransform(RES, 0, 0, RES, 0, 0);
    c.imageSmoothingEnabled = false;
    c.fillStyle = '#07050a';
    c.fillRect(0, 0, GW, GH);
    for (let ty = -16; ty <= 16; ty++) {
      for (let tx = -16; tx <= 16; tx++) {
        const [px, py] = at(tx, ty);
        if (px < -40 || px > GW + 40 || py < -30 || py > GH + 30) continue;
        const sp = ground.floor(tx + 40, ty + 40);
        c.drawImage(sp.img, px - sp.ax, py - 8 - sp.ay, sp.img.width / 2, sp.img.height / 2);
      }
    }
    for (const [tx, ty, k] of LITTER) {
      const sp = litter[k % litter.length];
      const [px, py] = at(tx, ty);
      c.drawImage(sp.img, Math.round(px - sp.ax), Math.round(py - sp.ay), sp.w, sp.h);
    }
    const lights: [number, number, number, number][] = [];
    // ON THE FLOOR, under everything
    if (which === 'fire') drawScorch(c, at, 0, 0, fireWay, t, LEAD + FM_FIRE.burst);
    if (which === 'rings') {
      drawSlamWave(c, at, 0, 0, t - (LEAD + FM_RINGS.hit));
      for (const h of hands) drawHandCrack(c, at, h.x, h.y, t - h.t0, FM_HAND_TIME, h.seed);
    }
    if (which === 'shards') {
      for (let i = 0; i < FM_SHARD.fan; i++) {
        const d = 0.3 + FM_SHARD.speed * (t - spit);
        if (t < spit || d >= shardEnd(i)) continue;
        const p = shardAt(i, d);
        drawShardShadow(c, p.x, p.y);
      }
    }
    // THE FIGURES, nearest last
    const [mv, mt] = himAt(t);
    const him = himSp(mv, mt);
    // (gliding, he is borne along the floor the way he faces)
    const [gx, gy] = run ? at(runAt(t).along, 0) : [hx, hy];
    const figs: Figure[] = [{ sp: him, x: gx, y: gy, light: true }];
    const [kxs, kys] = at(kx, ky);
    figs.push({ sp: knight, x: kxs, y: kys, light: true });
    if (which === 'rings') {
      for (const h of hands) {
        const f = Math.floor((t - h.t0) * FM_HAND_FPS);
        if (f < 0 || f >= FM_HAND_FRAMES) continue;
        const [x, y] = at(h.x, h.y);
        figs.push({ sp: handArt[h.kind][f], x, y });
        lights.push([x, y - 10, 26, 0.6]);
      }
    }
    const piles: { x: number; y: number; tau: number }[] = [];
    if (which === 'raise') {
      // (each heap: bones of others lying round the one that comes up)
      const heap = sprite('heap', () => toSprite(deathOf3(1, 'back'), null, CANVAS3.ax, CANVAS3.ay));
      const heapF = sprite('heapF', () => flipSprite(toSprite(deathOf3(1, 'front'), null, CANVAS3.ax, CANVAS3.ay)));
      PILES.forEach((p) => {
        for (const [dx, dy, k] of [[-0.35, -0.25, 0], [0.3, -0.3, 1], [-0.1, 0.35, 1], [0.38, 0.22, 0]] as const) {
          const [x, y] = at(p[0] + dx, p[1] + dy);
          figs.push({ sp: k ? heapF : heap, x, y, light: false });
        }
      });
      PILES.forEach((p, i) => {
        const r = pileAt(t, i);
        const [x, y] = at(p[0], p[1]);
        figs.push({ sp: r.sp, x, y: y + 0.01 });
        piles.push({ x, y, tau: r.tau });
        lights.push([x, y - 8, 30, 0.7]);
      });
    }
    // (the stream goes behind him when it pours away from you)
    const way = which === 'fire' ? fireWay(t) : null;
    const streamFirst = !!way && way[0] + way[1] < -0.2;
    const mouth = run ? [0, 0] : fmMouthAt(mv, mt);
    const mx = hx + mouth[0] / 2;
    const my = hy + mouth[1] / 2;
    const stream = (): void => {
      if (which === 'fire') drawFireStream(c, at, 0, 0, mx, my, fireWay, t, LEAD + FM_FIRE.burst, LEAD + FM_FIRE.stop);
    };
    if (streamFirst) stream();
    figs.sort((a, b) => a.y - b.y);
    for (const f of figs) {
      drawAura(c, f.sp, f.x, f.y);
      c.drawImage(f.sp.img, Math.round(f.x - f.sp.ax), Math.round(f.y - f.sp.ay), f.sp.w, f.sp.h);
    }
    if (!streamFirst) stream();
    // OVER THE FIGURES: the shards in flight and where they strike
    if (which === 'shards') {
      for (let i = 0; i < FM_SHARD.fan; i++) {
        const end = shardEnd(i);
        const d = 0.3 + FM_SHARD.speed * (t - spit);
        if (t < spit) continue;
        if (d < end) {
          const p = shardAt(i, d);
          const q = shardAt(i, Math.max(0, d - 0.15));
          drawBoneShard(c, p.x, p.y, p.z, p.x - q.x, p.y - p.z - (q.y - q.z), t - spit, i * 1.7);
          lights.push([p.x, p.y - p.z, 18, 0.5]);
        } else {
          const tb = t - spit - (end - 0.3) / FM_SHARD.speed;
          const p = shardAt(i, end);
          const q = shardAt(i, end - 0.15);
          drawShardBreak(c, p.x, p.y, p.z, p.x - q.x, p.y - p.z - (q.y - q.z), tb);
          if (tb < FM_SHARD_BREAK) lights.push([p.x, p.y - p.z, 26, 0.7 * (1 - tb / FM_SHARD_BREAK)]);
        }
      }
    }
    if (which === 'raise') for (const p of piles) drawRaiseGlow(c, p.x, p.y, p.tau, DIE3_TIME);
    if (way) {
      for (const d of [1, 2.2, 3.4, 4.6]) {
        const [x, y] = at(way[0] * d, way[1] * d);
        lights.push([x, y - 4, 40, 0.8]);
      }
      lights.push([mx, my, 30, 0.8]);
    }
    if (which === 'rings') {
      const tw = t - (LEAD + FM_RINGS.hit);
      if (tw >= 0 && tw < 1.4) lights.push([hx, hy, 40 + 70 * Math.min(1, tw), 0.8 * (1 - tw / 1.4)]);
    }
    // THE DARK (render.ts `light`), thinner round him and the knight and wherever his fire is
    dg.setTransform(RES, 0, 0, RES, 0, 0);
    dg.globalCompositeOperation = 'source-over';
    dg.clearRect(0, 0, GW, GH);
    dg.fillStyle = 'rgba(6,4,14,0.8)';
    dg.fillRect(0, 0, GW, GH);
    dg.globalCompositeOperation = 'destination-out';
    dg.imageSmoothingEnabled = true;
    const spot = (x: number, y: number, r: number, strength: number): void => {
      dg.globalAlpha = Math.min(1, strength);
      dg.drawImage(pool, Math.round(x - r), Math.round(y - r * 0.62), Math.round(r * 2), Math.round(r * 1.24));
    };
    spot(kxs, kys - 8, 150, 0.85);
    spot(GW / 2, GH / 2, 300, 0.3);
    spot(gx, gy - 16, 70, 0.75);
    for (const l of him.lights ?? []) if (l.r >= 7) spot(gx + l.x - him.ax, gy + l.y - him.ay + 6, l.r * 2.6, (l.a ?? 0.5) * 1.1);
    if (mv === 'dying') spot(gx, gy, 50, 0.8);
    for (const [x, y, r, a] of lights) spot(x, y, r, a);
    dg.globalAlpha = 1;
    dg.globalCompositeOperation = 'source-over';
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.drawImage(dark, 0, 0);
    c.setTransform(RES, 0, 0, RES, 0, 0);
    for (const f of figs) if (f.light !== false) drawLights(c, f.sp, f.x, f.y);
    for (const [x, y, r, a] of lights) glowAt(c, x, y, r * 0.5, a * 0.35);
    c.setTransform(1, 0, 0, 1, 0, 0);
    g.imageSmoothingEnabled = false;
    g.drawImage(scene, 0, 0, cv.width, cv.height);
  });
}

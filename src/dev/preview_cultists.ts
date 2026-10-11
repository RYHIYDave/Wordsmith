// Dev page: THE CULT'S TWO NEW FIGHTERS (a mock-up: NOT IN THE GAME; art/cultists.ts): the dagger cultist
// and the mini fleshmancer, for the owner's yes to their looks, on a piece of the dungeon's own floor with
// the dark of a dungeon over it. (docs/mockups/cultists/README.md)
//   node tools/preview.mjs src/dev/preview_cultists.ts previews/cultists/sheet.png 1600 1000 "sheet:3"
//   hash = sheet[:<scale>]: each standing, facing you and facing away, beside the knight for size; under them,
//            beside the cult's others (a cultist, the high priest, the fleshmancer)
//          close[:<scale>]: the two alone, big
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
import { FM_FLOOR } from "./fm_floor";
import { DAGGER_CULTIST, MINI_FM, MINI_REST, MINI_FM_LOOK, KNIFE_REST, knifeCowlTop } from "../art/cultists";
import { withFmLook } from "../art/fleshmancer";

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

const KNIFE = DAGGER_CULTIST;
const MINI = MINI_FM;
/** The top of the dagger cultist's cowl and of the mini fleshmancer's hood at rest (picture pixels). */
function tops(): { knife: number; mini: number; master: number } {
  const k = solve(KNIFE.build, KNIFE_REST);
  const m = withFmLook(MINI_FM_LOOK, () => fmHoodTop(solve(MINI.build, MINI_REST)));
  return { knife: Math.round(knifeCowlTop(k)), mini: Math.round(m), master: Math.round(fmHoodTop(solve(FM.build, FM_REST))) };
}

if (mode === 'sheet') {
  const S = Number(parts[1]) || 3;
  const PAD = 14;
  const h = tops();
  const row1 = [
    { sp: spriteOf3(MOVES3.ktown, 0, 'front'), name: 'The knight', line: 'a hero: 58 tall', shadow: 12, gold: false },
    { sp: spOf(KNIFE, 'stand', 0, 'front'), name: 'The dagger cultist', line: `facing you: cowl ${h.knife} up`, shadow: KNIFE.shadow, gold: true },
    { sp: spOf(KNIFE, 'stand', 0, 'back'), name: 'The dagger cultist', line: 'facing away', shadow: KNIFE.shadow, gold: true },
    { sp: spOf(MINI, 'stand', 0, 'front'), name: 'The mini fleshmancer', line: `facing you: hood ${h.mini} up`, shadow: MINI.shadow, gold: true },
    { sp: spOf(MINI, 'stand', 0, 'back'), name: 'The mini fleshmancer', line: 'facing away', shadow: MINI.shadow, gold: true },
  ];
  const row2 = [
    { sp: makeCultistArt().front.idle[0], name: 'A cultist', line: 'the cult’s flock', shadow: 11, gold: false },
    { sp: spOf(KNIFE, 'stand', 0, 'front'), name: 'The dagger cultist', line: 'new', shadow: KNIFE.shadow, gold: true },
    { sp: makeHighPriestArt().front.idle[0], name: 'The high priest', line: 'their leader', shadow: 11, gold: false },
    { sp: spOf(MINI, 'stand', 0, 'front'), name: 'The mini fleshmancer', line: 'new', shadow: MINI.shadow, gold: true },
    { sp: spOf(FM, 'stand', 0, 'front'), name: 'The Fleshmancer', line: `floor 5’s boss: hood ${h.master} up`, shadow: FM.shadow, gold: false },
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
  text('The cult’s two new fighters', PAD, 12, 26, '#ffd866', 700);
  text('their looks, standing. A mock-up: not in the game', PAD, 44, 16, '#cfc8ff', 600);
  row(row1, 70, S, PAD, W);
  text('Beside the cult’s others (half the size of the row above)', PAD, 70 + h1 + 8, 16, '#cfc8ff', 600);
  row(row2, 70 + h1 + 36, 2, PAD, W);
  win.__ready = true;
}

if (mode === 'close') {
  const S = Number(parts[1]) || 6;
  const PAD = 12;
  const list = [
    { sp: spOf(KNIFE, 'stand', 0, 'front'), name: 'The dagger cultist', line: 'facing you', shadow: KNIFE.shadow, gold: true },
    { sp: spOf(MINI, 'stand', 0, 'front'), name: 'The mini fleshmancer', line: 'facing you', shadow: MINI.shadow, gold: true },
  ];
  const W = widthOf(list, S, PAD);
  const [, , up, down] = reachAll(list.map((f) => f.sp));
  cv.width = W;
  cv.height = 56 + (up + down + 14) * S + 50 + PAD;
  g.fillStyle = BG;
  g.fillRect(0, 0, cv.width, cv.height);
  text('Close', PAD, 10, 24, '#ffd866', 700);
  row(list, 52, S, PAD, W);
  win.__ready = true;
}

if (mode === 'loop') {
  // THEIR STANDING LOOPS, frame by frame in a grid (for a film): <scale>:<0 the dagger cultist | 1 the mini fleshmancer>:<front | back>
  const S = Number(parts[1]) || 3;
  const which = Number(parts[2]) || 0;
  const view = (parts[3] || 'front') as GameView;
  const mob = which === 0 ? KNIFE : MINI;
  const n = mob.idleFrames;
  const CW = 110;
  const CH = which === 0 ? 96 : 120;
  const COLS = 6;
  cv.width = CW * S * COLS;
  cv.height = CH * S * Math.ceil(n / COLS);
  g.fillStyle = BG;
  g.fillRect(0, 0, cv.width, cv.height);
  for (let i = 0; i < n; i++) {
    const x = (i % COLS) * CW * S;
    const y = Math.floor(i / COLS) * CH * S;
    const sp = spOf(mob, 'stand', i / mob.idleFps, view);
    const kn = KNIGHT(view);
    pane(x, y, CW * S, CH * S, S, [
      { sp, fx: x + CW * S * 0.62, fy: y + (CH - 18) * S, shadow: mob.shadow },
      { sp: kn, fx: x + CW * S * 0.2, fy: y + (CH - 10) * S, shadow: 12 },
    ]);
  }
  console.log(`cells ${n} ${COLS} ${CW * S} ${CH * S}`);
  win.__ready = true;
}

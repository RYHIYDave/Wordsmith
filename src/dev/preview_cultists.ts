// Dev page: THE CULT'S TWO NEW FIGHTERS (a mock-up: NOT IN THE GAME; art/cultists.ts): the dagger cultist
// and the mini fleshmancer, for the owner's yes to their looks, on a piece of the dungeon's own floor with
// the dark of a dungeon over it. (docs/mockups/cultists/README.md)
//   node tools/preview.mjs src/dev/preview_cultists.ts previews/cultists/sheet.png 1600 1000 "sheet:3"
//   hash = sheet[:<scale>]: each standing, facing you and facing away, beside the knight for size; under them,
//            beside the cult's others (a cultist, the high priest, the fleshmancer)
//          close[:<scale>]: the two alone, big
//          film:<charge | raise | fire>[:<screen pixels to a game pixel>]: their attacks, as films (page_gif.mjs)
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
import { DAGGER_CULTIST, KNIFE_BLOW, KNIFE_DIES, KNIFE_REST, MINI_FIRE, MINI_FIRE_SIZE, MINI_FM, MINI_FM_LOOK, MINI_HALT, MINI_RAISE, MINI_REST, MINI_SET_OFF, knifeCowlTop, miniFireAt, miniFireTurn } from "../art/cultists";
import { CRAWL_OUT } from '../art/mkit';
import { makeSkeletonArt } from '../art/monster_bones';
import type { AnimSet, Clip } from '../art/actor_types';
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

/** A page that shows itself frame by frame (tools/page_gif.mjs). */
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
    { sp: spOf(KNIFE, 'stand', 0, 'front'), name: 'Dagger cultist', line: 'new', shadow: KNIFE.shadow, gold: true },
    { sp: makeHighPriestArt().front.idle[0], name: 'The high priest', line: 'their leader', shadow: 11, gold: false },
    { sp: spOf(MINI, 'stand', 0, 'front'), name: 'Mini fleshmancer', line: 'new', shadow: MINI.shadow, gold: true },
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

if (mode === 'strip') {
  // ONE MOVE, frame by frame in a grid: <scale>:<0 the dagger cultist | 1 the mini fleshmancer>:<move>:<front | back>:<frames a second>
  const S = Number(parts[1]) || 2;
  const which = Number(parts[2]) || 0;
  const move = parts[3] || 'attack';
  const view = (parts[4] || 'front') as GameView;
  const fps = Number(parts[5]) || 30;
  const mob = which === 0 ? KNIFE : MINI;
  const long = move === 'dying' ? mob.dieTime : move === 'walk' ? mob.walkFrames / mob.walkFps : move === 'stand' ? mob.idleFrames / mob.idleFps : move === 'reel' ? mob.reelTime : (() => {
    const mv = move === 'attack' ? mob.attack : mob.more?.[move];
    const ks = mv!.motion.keys;
    return ks[ks.length - 1].at;
  })();
  const n = Math.round(long * fps) + (move === 'walk' || move === 'stand' ? 0 : 1);
  const CW = 120;
  const CH = which === 0 ? 100 : 120;
  const COLS = 8;
  cv.width = CW * S * COLS;
  cv.height = CH * S * Math.ceil(n / COLS);
  g.fillStyle = BG;
  g.fillRect(0, 0, cv.width, cv.height);
  for (let i = 0; i < n; i++) {
    const x = (i % COLS) * CW * S;
    const y = Math.floor(i / COLS) * CH * S;
    const t = i / fps;
    const sp = move === 'dying' ? toSprite(deathOfMob(mob, t / mob.dieTime, view), null, canvasOf(mob).ax, canvasOf(mob).ay) : spOf(mob, move, t, view);
    pane(x, y, CW * S, CH * S, S, [{ sp, fx: x + CW * S * 0.45, fy: y + (CH - 22) * S, shadow: mob.shadow }]);
    text(`${i}`, x + 4, y + 2, 12, '#cfc8ff', 600);
  }
  console.log(`cells ${n} ${COLS} ${CW * S} ${CH * S}`);
  win.__ready = true;
}

// =============================================================================================
// THEIR ATTACKS AS FILMS (tools/page_gif.mjs): in a room of the lair's floor, in the game's own pixels, the
// dark over it as the game lays it, the knight come in; what they send out where the game would put it.
//   charge  the dagger cultist runs at the knight, leaps and plunges his dagger
//   raise   a dagger cultist falls dead beside another of the cult's dead; the mini fleshmancer calls up the
//           dead: each body burns away and a skeleton crawls up out of the ground where it lay (the Warden's
//           dead, as they come: art/mkit.ts crawlOut, the game's skeleton's `crawl`)
//   fire    the mini fleshmancer sweeps his fire across the floor before him (art/fm_spells.ts, MINI_FIRE_SIZE)
//   glide   the mini fleshmancer sets off, glides at the knight and stops
//   struck  the dagger cultist flinches twice; the mini fleshmancer flinches twice, and dies (his own fire takes him)

interface Fig { sp: Sprite; x: number; y: number; shadow: number; light?: boolean; alpha?: number }
if (mode === 'film') {
  const which = parts[1] || 'charge';
  const DS = Number(parts[2]) || 4;
  const RES = 2;
  const FPS = 30;
  const cache = new Map<string, Sprite>();
  const sprite = (key: string, make: () => Sprite): Sprite => {
    let sp = cache.get(key);
    if (!sp) cache.set(key, (sp = make()));
    return sp;
  };
  // (how much of the floor shows, in game pixels, and where on it his floor point is)
  const VIEW: Record<string, [number, number, number, number]> = { charge: [220, 130, 120, 95], raise: [236, 140, 84, 98], fire: [220, 140, 90, 95], glide: [230, 140, 140, 100], struck: [220, 140, 110, 82] };
  const [GW, GH, hx, hy] = VIEW[which] ?? VIEW.charge;
  const at = (tx: number, ty: number): [number, number] => [hx + (tx - ty) * 16, hy + (tx + ty) * 8];
  // (the knight, in tiles from him; struck (MOVES3.kreel) when the blow lands or the fire sweeps over him)
  const KN: Record<string, [number, number]> = { charge: [1.05, -0.65], raise: [3.8, -1.4], fire: [2.4, -0.5], glide: [1.4, 0.2], struck: [1.5, 1.5] };
  const [kx, ky] = KN[which];
  const REEL = MOVES3.kreel;
  const REEL_LONG = REEL.motion.keys[REEL.motion.keys.length - 1].at;
  let struckAt = -1;
  const knightAt = (t: number): Sprite => {
    const tr = t - struckAt;
    if (struckAt < 0 || tr < 0 || tr >= REEL_LONG) return sprite('knight', () => flipSprite(KNIGHT('back')));
    const q = Math.round(tr * 30) / 30;
    return sprite(`kreel:${q.toFixed(3)}`, () => flipSprite(spriteOf3(REEL, q, 'back')));
  };
  const litter = FM_FLOOR.litter();
  const LITTER: ReadonlyArray<readonly [number, number, number]> = [[-3.5, 2.6, 0], [-2.6, -3.6, 1], [2.8, -2.6, 4], [-5.5, -1.6, 5], [5.4, 3.2, 2], [-1.6, 4.6, 6], [5.6, -3.4, 7], [-6.4, 1.5, 3], [1.0, 5.2, 8]];
  const posed = (mob: Mob, mv: string, t: number): Sprite => sprite(`${mob.id}:${mv}:${t.toFixed(3)}`, () => spOf(mob, mv, t, 'front'));
  const dead = (mob: Mob, k: number): Sprite => sprite(`${mob.id}:dying:${k.toFixed(3)}`, () => toSprite(deathOfMob(mob, k, 'front'), null, canvasOf(mob).ax, canvasOf(mob).ay));
  const standAt = (mob: Mob, t: number): number => (Math.floor(t * mob.idleFps + 1e-6) % mob.idleFrames) / mob.idleFps;
  const at30 = (t: number): number => Math.round(t * 30) / 30;
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
  /** Where a sprite's painted pixels are, about its floor point (game pixels): their middle. */
  const middleOf = (sp: Sprite): [number, number] => {
    const im = sp.img as HTMLCanvasElement;
    const d = (im.getContext('2d') as CanvasRenderingContext2D).getImageData(0, 0, im.width, im.height).data;
    let [x0, y0, x1, y1] = [im.width, im.height, 0, 0];
    for (let y = 0; y < im.height; y++) for (let x = 0; x < im.width; x++) if (d[(y * im.width + x) * 4 + 3] > 60) {
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
    }
    return [((x0 + x1) / 2) * (sp.w / im.width) - sp.ax, ((y0 + y1) / 2) * (sp.h / im.height) - sp.ay];
  };

  // ---- WHAT HAPPENS, AND WHEN ----
  let total = 0;
  /** What a moment of a film holds: its figures; what is drawn on the floor under them; what is drawn among them at a depth (screen y: figures further up the screen go before it); what is drawn over them; the lights. */
  type Frame = { figs: Fig[]; under: () => void; among?: { y: number; draw: () => void }; over: () => void; lights: [number, number, number, number][] };
  let frameAt: (t: number) => Frame;

  if (which === 'charge') {
    // He stands, then runs at the knight from four tiles off, leaps and plunges his dagger, and stands.
    const LEAD = 0.4;
    const FROM = -4.2;
    const RUN = -FROM / KNIFE.pace;
    const BLOW = KNIFE_BLOW.long;
    total = LEAD + RUN + BLOW + 0.9;
    struckAt = LEAD + RUN + KNIFE_BLOW.hit;
    frameAt = (t) => {
      let sp: Sprite;
      let along = FROM;
      if (t < LEAD) sp = posed(KNIFE, 'stand', standAt(KNIFE, t));
      else if (t < LEAD + RUN) {
        const tt = t - LEAD;
        sp = posed(KNIFE, 'walk', (Math.floor(tt * KNIFE.walkFps + 1e-6) % KNIFE.walkFrames) / KNIFE.walkFps);
        along = FROM + KNIFE.pace * tt;
      } else if (t < LEAD + RUN + BLOW) {
        sp = posed(KNIFE, 'attack', at30(t - LEAD - RUN));
        along = 0;
      } else {
        sp = posed(KNIFE, 'stand', standAt(KNIFE, t - LEAD - RUN - BLOW));
        along = 0;
      }
      const [x, y] = at(along, 0);
      const [kxs, kys] = at(kx, ky);
      const figs: Fig[] = [{ sp, x, y, shadow: KNIFE.shadow }, { sp: knightAt(t), x: kxs, y: kys, shadow: 12 }];
      const lights: [number, number, number, number][] = [];
      const tb = t - LEAD - RUN;
      if (tb > KNIFE_BLOW.hit - 0.02 && tb < KNIFE_BLOW.hit + 0.25) lights.push([kxs - 6, kys - 8, 46, 0.9 * (1 - (tb - KNIFE_BLOW.hit + 0.02) / 0.27)]);
      return { figs, under: () => {}, over: () => {}, lights };
    };
  } else if (which === 'glide') {
    // THE MINI FLESHMANCER'S GLIDE: he stands, sets off, glides at the knight, stops, and stands.
    const RUN: ReadonlyArray<readonly [string, number]> = [['stand', 0.4], ['setOff', MINI_SET_OFF], ['walk', 2.0], ['halt', MINI_HALT], ['stand', 0.8]];
    const FROM = -3.4;
    total = RUN.reduce((a, [, l]) => a + l, 0);
    frameAt = (t) => {
      let t0 = 0;
      let along = FROM;
      let sp: Sprite = posed(MINI, 'stand', 0);
      for (const [i, [mv, l]] of RUN.entries()) {
        const last = i === RUN.length - 1;
        if (t < t0 + l || last) {
          const tt = Math.min(l, t - t0);
          if (mv !== 'stand') along += MINI.pace * tt;
          sp = mv === 'stand' ? posed(MINI, 'stand', standAt(MINI, tt)) : mv === 'walk' ? posed(MINI, 'walk', (Math.floor(tt * MINI.walkFps + 1e-6) % MINI.walkFrames) / MINI.walkFps) : posed(MINI, mv, at30(tt));
          break;
        }
        if (mv !== 'stand') along += MINI.pace * l;
        t0 += l;
      }
      const [x, y] = at(along, 0);
      const [kxs, kys] = at(kx, ky);
      return { figs: [{ sp, x, y, shadow: MINI.shadow }, { sp: knightAt(t), x: kxs, y: kys, shadow: 12 }], under: () => {}, over: () => {}, lights: [] };
    };
  } else if (which === 'struck') {
    // STRUCK: the dagger cultist flinches twice; the mini fleshmancer flinches twice, and dies.
    const KNIFE_HITS = [0.4, 0.9];
    const MINI_HITS = [1.4, 2.0];
    const DIES_AT = 2.6;
    total = DIES_AT + MINI_FM.dieTime + 0.9;
    const C: [number, number] = [-0.2, 1.6];
    const M: [number, number] = [1.4, -0.4];
    /** Which move, and how far into it, at a moment, given when the blows land. */
    const inBlow = (t: number, hits: readonly number[], long: number): number => {
      for (const h of hits) if (t >= h && t < h + long) return t - h;
      return -1;
    };
    const flipped = (key: string, make: () => Sprite): Sprite => sprite(`flip:${key}`, () => flipSprite(make()));
    frameAt = (t) => {
      const figs: Fig[] = [];
      const tk = inBlow(t, KNIFE_HITS, KNIFE.reelTime);
      const knife = tk >= 0 ? posed(KNIFE, 'reel', at30(tk)) : posed(KNIFE, 'stand', standAt(KNIFE, t));
      const [cx, cy] = at(C[0], C[1]);
      figs.push({ sp: knife, x: cx, y: cy, shadow: KNIFE.shadow });
      // (the mini fleshmancer turned toward the knight: his picture facing you, the other way round)
      let mini: Sprite;
      let alive = true;
      if (t >= DIES_AT) {
        const k = Math.min(1, Math.round(((t - DIES_AT) / MINI.dieTime) * MINI.dieTime * 20) / (MINI.dieTime * 20));
        mini = flipped(`die:${k.toFixed(3)}`, () => dead(MINI, k));
        alive = false;
      } else {
        const tm = inBlow(t, MINI_HITS, MINI.reelTime);
        mini = tm >= 0 ? flipped(`reel:${at30(tm).toFixed(3)}`, () => posed(MINI, 'reel', at30(tm))) : flipped(`stand:${standAt(MINI, t).toFixed(3)}`, () => posed(MINI, 'stand', standAt(MINI, t)));
      }
      const [mx, my] = at(M[0], M[1]);
      figs.push({ sp: mini, x: mx, y: my, shadow: alive ? MINI.shadow : 0 });
      const [kxs, kys] = at(kx, ky);
      figs.push({ sp: knightAt(t), x: kxs, y: kys, shadow: 12 });
      // (a flash where each blow lands)
      const lights: [number, number, number, number][] = [];
      for (const h of KNIFE_HITS) if (t >= h && t < h + 0.15) lights.push([cx, cy - 16, 30, 0.8 * (1 - (t - h) / 0.15)]);
      for (const h of [...MINI_HITS, DIES_AT]) if (t >= h && t < h + 0.15) lights.push([mx, my - 22, 34, 0.8 * (1 - (t - h) / 0.15)]);
      return { figs, under: () => {}, over: () => {}, lights };
    };
  } else if (which === 'raise') {
    // A dagger cultist stands and is struck dead, beside another of the cult's dead; the mini fleshmancer calls up the dead.
    CRAWL_OUT.on = true;
    const SKEL: AnimSet = makeSkeletonArt().front;
    const crawl = SKEL.clips?.moves?.crawl as Clip;
    const CRAWL_LONG = crawl.frames.length / crawl.fps;
    const clipAt = (cl: Clip, t: number): Sprite => cl.frames[Math.min(cl.frames.length - 1, Math.floor(t * cl.fps + 1e-6))];
    const skelStand = (t: number): Sprite => SKEL.idle[Math.floor(t * (SKEL.idleFps ?? 2)) % SKEL.idle.length];
    const LEAD = 0.3;
    const DIES = KNIFE_DIES.long;
    const CALL = LEAD + DIES + 0.15;
    const RISE = CALL + MINI_RAISE.rise;
    // (the two bodies: where each lies, whether it is turned the other way, and how long after the rise its dead one comes)
    const A: [number, number] = [1.6, -1.2];
    const B: [number, number] = [0.4, 2.2];
    const bodyA = dead(KNIFE, 1);
    const bodyB = sprite('bodyB', () => flipSprite(dead(KNIFE, 1)));
    const [maX, maY] = middleOf(bodyA);
    const [mbX, mbY] = middleOf(bodyB);
    const BODIES = [
      { tile: A, mid: [maX, maY + 1] as const, late: 0.0 },
      { tile: B, mid: [mbX, mbY + 1] as const, late: 0.16 },
    ];
    const BURN = 0.32;
    total = RISE + 0.16 + CRAWL_LONG + 1.0;
    frameAt = (t) => {
      const figs: Fig[] = [];
      const lights: [number, number, number, number][] = [];
      // HIM
      const tm = t - CALL;
      const him = tm >= 0 && tm < MINI_RAISE.long ? posed(MINI, 'raise', at30(tm)) : posed(MINI, 'stand', standAt(MINI, tm < 0 ? t : tm - MINI_RAISE.long));
      const [mx, my] = at(0, 0);
      figs.push({ sp: him, x: mx, y: my, shadow: MINI.shadow });
      // THE KNIGHT
      const [kxs, kys] = at(kx, ky);
      figs.push({ sp: knightAt(t), x: kxs, y: kys, shadow: 12 });
      // THE BODIES, AND THE DEAD THAT COME UP OUT OF THE GROUND WHERE THEY LAY
      const glows: (() => void)[] = [];
      BODIES.forEach((b, i) => {
        const [bx, by] = at(b.tile[0], b.tile[1]);
        const sx = bx + b.mid[0];
        const sy = by + b.mid[1];
        const start = RISE + b.late;
        let body: Sprite | null;
        if (i === 0) body = t < LEAD ? posed(KNIFE, 'stand', standAt(KNIFE, t)) : t < LEAD + DIES ? dead(KNIFE, Math.round(((t - LEAD) / DIES) * DIES * 30) / (DIES * 30)) : bodyA;
        else body = bodyB;
        // (it burns away as the ground opens under it)
        const burnt = (t - (start - 0.12)) / BURN;
        if (body && burnt < 1) figs.push({ sp: body, x: bx, y: by, shadow: t < LEAD + KNIFE_DIES.buckle && i === 0 ? KNIFE.shadow : 0, alpha: 1 - Math.max(0, Math.min(1, burnt)) });
        const tc = t - start;
        if (tc >= 0) {
          const sp = tc < CRAWL_LONG ? clipAt(crawl, tc) : skelStand(tc - CRAWL_LONG);
          figs.push({ sp, x: sx, y: sy + 0.02, shadow: tc < CRAWL_LONG * 0.75 ? 0 : 9 });
        }
        const tau = t - (start - 0.3);
        glows.push(() => drawRaiseGlow(c, sx, sy, tau, CRAWL_LONG * 0.55));
        if (tau > 0 && tau < 0.3 + CRAWL_LONG * 0.55 + 0.3) lights.push([sx, sy - 6, 34, 0.75]);
      });
      return { figs, under: () => {}, over: () => glows.forEach((f) => f()), lights };
    };
  } else {
    // THE FIRE: he stands, sweeps his fire across the floor before him, and stands.
    const LEAD = 0.4;
    total = LEAD + MINI_FIRE.long + 0.9;
    const fireWay = (t: number): readonly [number, number] | null => {
      const tt = t - LEAD;
      if (tt < MINI_FIRE.burst - 0.001 || tt > MINI_FIRE.stop + 0.001) return null;
      const a = miniFireTurn(tt);
      return [Math.cos(a), -Math.sin(a)];
    };
    {
      const aK = Math.atan2(-ky, kx);
      for (let tt = MINI_FIRE.pour; tt <= MINI_FIRE.stop; tt += 1 / 60) if (miniFireTurn(tt) >= aK) { struckAt = LEAD + tt; break; }
    }
    frameAt = (t) => {
      const tt = t - LEAD;
      const firing = tt >= 0 && tt < MINI_FIRE.long;
      const him = firing ? posed(MINI, 'attack', at30(tt)) : posed(MINI, 'stand', standAt(MINI, tt < 0 ? t : tt - MINI_FIRE.long));
      const [gx, gy] = at(0, 0);
      const [kxs, kys] = at(kx, ky);
      const figs: Fig[] = [{ sp: him, x: gx, y: gy, shadow: MINI.shadow }, { sp: knightAt(t), x: kxs, y: kys, shadow: 12 }];
      const lights: [number, number, number, number][] = [];
      const way = fireWay(t);
      const src = firing ? miniFireAt(at30(tt)) : [0, 0];
      const sx = gx + src[0] / 2;
      const sy = gy + src[1] / 2;
      const stream = (): void => drawFireStream(c, at, 0, 0, sx, sy, fireWay, t, LEAD + MINI_FIRE.burst, LEAD + MINI_FIRE.stop, MINI_FIRE_SIZE);
      // (it goes behind him when it pours away from you; and behind the knight where it passes behind him)
      const behind = !!way && way[0] + way[1] < -0.2;
      const wl = way ?? fireWay(LEAD + MINI_FIRE.stop - 1 / 60);
      const dK = Math.hypot(kx, ky);
      const depth = behind ? gy - 0.5 : Math.max(gy + 0.5, wl ? at(wl[0] * dK, wl[1] * dK)[1] : gy + 0.5);
      if (way) {
        for (const d of [0.8, 1.6, 2.4]) {
          const [x, y] = at(way[0] * d, way[1] * d);
          lights.push([x, y - 4, 34, 0.8]);
        }
        lights.push([sx, sy, 26, 0.8]);
      }
      return {
        figs,
        under: () => drawScorch(c, at, 0, 0, fireWay, t, LEAD + MINI_FIRE.burst, MINI_FIRE_SIZE),
        among: { y: depth, draw: stream },
        over: () => {},
        lights,
      };
    };
  }

  const TICKS = Math.round(total * FPS);
  cv.width = Math.round(GW * DS);
  cv.height = Math.round(GH * DS);
  filmPage(TICKS, FPS, (tick) => {
    const t = tick / FPS;
    const f = frameAt(t);
    c.setTransform(RES, 0, 0, RES, 0, 0);
    c.imageSmoothingEnabled = false;
    c.globalAlpha = 1;
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
    f.under();
    for (const fg of f.figs) if (fg.shadow > 0) shadowAt(fg.x, fg.y, fg.shadow, c);
    const figs = [...f.figs].sort((a, b) => a.y - b.y);
    let among = f.among;
    for (const fg of figs) {
      if (among && fg.y > among.y) {
        among.draw();
        among = undefined;
      }
      c.globalAlpha = fg.alpha ?? 1;
      drawAura(c, fg.sp, fg.x, fg.y);
      c.drawImage(fg.sp.img, Math.round(fg.x - fg.sp.ax), Math.round(fg.y - fg.sp.ay), fg.sp.w, fg.sp.h);
      c.globalAlpha = 1;
    }
    if (among) among.draw();
    f.over();
    // THE DARK (render.ts `light`), thinner round the figures and wherever fire is
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
    const [kxs, kys] = at(kx, ky);
    spot(kxs, kys - 8, 150, 0.85);
    spot(GW / 2, GH / 2, 300, 0.3);
    for (const fg of f.figs) {
      if (fg.x === kxs && fg.y === kys) continue;
      spot(fg.x, fg.y - 14, 56, 0.7 * (fg.alpha ?? 1));
      for (const l of fg.sp.lights ?? []) if (l.r >= 7) spot(fg.x + l.x - fg.sp.ax, fg.y + l.y - fg.sp.ay + 6, l.r * 2.6, (l.a ?? 0.5) * 1.1 * (fg.alpha ?? 1));
    }
    for (const [x, y, r, a] of f.lights) spot(x, y, r, a);
    dg.globalAlpha = 1;
    dg.globalCompositeOperation = 'source-over';
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.drawImage(dark, 0, 0);
    c.setTransform(RES, 0, 0, RES, 0, 0);
    for (const fg of figs) if (fg.light !== false && (fg.alpha ?? 1) > 0.3) drawLights(c, fg.sp, fg.x, fg.y);
    for (const [x, y, r, a] of f.lights) glowAt(c, x, y, r * 0.5, a * 0.35);
    c.setTransform(1, 0, 0, 1, 0, 0);
    g.imageSmoothingEnabled = false;
    g.drawImage(scene, 0, 0, cv.width, cv.height);
  });
}

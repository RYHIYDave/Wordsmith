// Dev page: FLOOR 11'S BOSS, THE CRIER (art/crier.ts, art/crier_moves.ts), on the flags of the Crier's Square
// (art/gateward.ts), beside the knight for size, at dusk. Nothing of the game imports it.
//
//   node tools/preview.mjs src/dev/preview_crier.ts shots/crier_sheet.png 1014 640 sheet[:<scale>]
//     standing, facing you and facing away, beside the knight
//   node tools/preview.mjs src/dev/preview_crier.ts shots/crier_pose.png 1014 640 pose:<move>:<seconds>[:<scale>]
//     one moment of a move, facing you and away
//   node tools/page_gif.mjs src/dev/preview_crier.ts "film:<move>[:<scale>]" previews/crier/<move>.gif
//     a film (tools/page_gif.mjs): facing you and facing away, on the square at dusk, with what the move does
//     to the floor (art/crier_shots.ts); <move>: stand, walk, attack, shout, proclaim, crowd, death

import { GW_ZONE, gateWardLook, gateWardPaintFloor } from '../art/gateward';
import { CRIER_MOB } from '../art/crier_moves';
import { CR_CROWD, CR_OFF, CR_PROCLAIM, CR_SHOUT, CR_SWING_HIT, CR_TRUMPET_GOES, trumpetOf } from '../art/crier';
import { CROWD_FOR, PROCLAIM_FOR, RISING_FOR, SHOUT_FOR, SHOUT_HALF, SHOUT_TO, SLAM_FOR, PROCLAIM_TO, PROCLAIM_HALF, drawBellSlam, drawCrowdBreath, drawCrowdCall, drawHushedRising, drawProclaimWarn, drawProclamation, drawShoutBlast, drawShoutWarn } from '../art/crier_shots';
import type { FloorAt } from '../art/mob_shots';
import { spriteOf3 } from '../art/heroes3';
import { toSprite } from '../art/kit';
import { MOVES3 } from '../art/moves3';
import { TILE3, canvasOf, deathOfMob, paintMob, paintViewOf, posedOfMob, skeletonAt } from '../art/new_mobs3';
import type { Mob } from '../art/new_mobs3';
import { P } from '../art/palette';
import { paintTerrain, pictureOf, terrainOf } from '../art/terrain';
import { drawText } from '../engine/font';
import { drawAura, drawLights } from '../engine/px';
import type { Sprite } from '../engine/px';
import { T_FLOOR } from '../game/types';
import type { Floor } from '../game/types';
import type { GameView, PaintView } from '../art/skin';
import { THEME } from '../ui/ui';

const [HASH, OFF] = decodeURIComponent(location.hash.slice(1)).split('|');
const parts = HASH.split(':');
// `|a,b`: leave those parts off
for (const k of (OFF ?? '').split(',').filter(Boolean)) CR_OFF[k] = true;
const mode = parts[0] || 'sheet';

// a patch of the Crier's Square to stand them on
const W = 30;
const H = 30;
const FLOOR = { depth: 11, seed: 11, w: W, h: H, tiles: new Uint8Array(W * H).fill(T_FLOOR), cut: new Uint8Array(W * H), variant: new Uint8Array(W * H), rooms: [], start: { x: 0, y: 0 } } as unknown as Floor;
const LAND = { floor: FLOOR, zone: () => GW_ZONE.Square };
const T = terrainOf(gateWardPaintFloor(LAND, 'open'), gateWardLook(LAND, 'open'));

const cv = document.createElement('canvas');
const g = cv.getContext('2d') as CanvasRenderingContext2D;

function show(): void {
  document.body.style.margin = '0';
  document.body.style.background = '#0d1030';
  document.body.appendChild(cv);
  (window as unknown as { __ready: boolean }).__ready = true;
}

/** The ground under a pane, `S` times, its middle on the square's middle. */
function groundPane(x: number, y: number, w: number, h: number, S: number): void {
  const [cx, cy] = pictureOf(15, 15);
  const gw = Math.ceil(w / S);
  const gh = Math.ceil(h / S);
  const p = paintTerrain(T, Math.round(cx - gw / 2), Math.round(cy - gh / 2), gw, gh);
  const c = document.createElement('canvas');
  c.width = gw;
  c.height = gh;
  (c.getContext('2d') as CanvasRenderingContext2D).putImageData(new ImageData(p.rgba, gw, gh), 0, 0);
  g.imageSmoothingEnabled = false;
  g.drawImage(c, x, y, gw * S, gh * S);
  // the dusk over it
  g.fillStyle = 'rgba(26,16,40,0.18)';
  g.fillRect(x, y, w, h);
}

const spOf = (mob: Mob, which: string, t: number, view: GameView): Sprite =>
  which === 'die' ? toSprite(deathOfMob(mob, t / mob.dieTime, view), null, canvasOf(mob).ax, canvasOf(mob).ay) : toSprite(paintMob(mob, which, t, view), mob.aura, canvasOf(mob).ax, canvasOf(mob).ay);
const KNIGHT = (): Sprite => spriteOf3(MOVES3.rear, 0, 'front');

/** A figure at (fx, fy), its floor point, `S` times: its shadow, its aura, itself, its lights. */
function figure(sp: Sprite, fx: number, fy: number, S: number, shadow: number): void {
  g.save();
  g.fillStyle = 'rgba(14,10,24,0.45)';
  g.beginPath();
  g.ellipse(fx, fy, shadow * S, shadow * 0.45 * S, 0, 0, Math.PI * 2);
  g.fill();
  g.restore();
  drawAura(g, sp, fx, fy, 2 * S);
  g.imageSmoothingEnabled = false;
  g.drawImage(sp.img, Math.round(fx - sp.ax * 2 * S), Math.round(fy - sp.ay * 2 * S), sp.img.width * S, sp.img.height * S);
  drawLights(g, sp, fx, fy, 2 * S);
}

function label(s: string, x: number, y: number): void {
  g.save();
  g.scale(2, 2);
  drawText(g, s, x / 2, y / 2, THEME.text, { shadow: P.ink });
  g.restore();
}

if (mode === 'strip') {
  // strip:<move>:<t,t,...>:<scale>: a row of moments of a move, facing you above and facing away below
  const which = parts[1] || 'attack';
  const ts = (parts[2] || '0').split(',').map(Number);
  const S = Number(parts[3]) || 2;
  const sps = ts.map((t) => [spOf(CRIER_MOB, which === 'dying' ? 'die' : which, t, 'front'), spOf(CRIER_MOB, which === 'dying' ? 'die' : which, t, 'back')] as const);
  const cellW = Math.ceil(Math.max(...sps.flat().map((sp) => sp.w * 2)) * S * 0.62);
  const up = Math.max(...sps.flat().map((sp) => sp.ay * 2)) * S;
  const down = Math.max(...sps.flat().map((sp) => (sp.h - sp.ay) * 2)) * S;
  const rowH = Math.ceil(up + down * 0.6) + 24;
  cv.width = Math.min(4000, cellW * ts.length + 20);
  cv.height = rowH * 2 + 30;
  groundPane(0, 0, cv.width, cv.height, S);
  ts.forEach((t, i) => {
    const x = 10 + cellW * (i + 0.5);
    figure(sps[i][0], x, 30 + up, S, CRIER_MOB.shadow);
    figure(sps[i][1], x, 30 + rowH + up, S, CRIER_MOB.shadow);
    label(`${t.toFixed(2)}`, x - 20, 6);
  });
  show();
} else if (mode === 'game') {
  // game: as a phone shows it (the game's size), on the square at dusk, the knight before him
  cv.width = 1014;
  cv.height = 468;
  groundPane(0, 0, cv.width, cv.height, 1);
  const grd = g.createRadialGradient(507, 234, 300, 507, 234, 600);
  grd.addColorStop(0, 'rgba(6,4,14,0)');
  grd.addColorStop(1, 'rgba(6,4,14,0.3)');
  g.fillStyle = grd;
  g.fillRect(0, 0, cv.width, cv.height);
  figure(spOf(CRIER_MOB, 'stand', 0, 'front'), 560, 230, 1, CRIER_MOB.shadow);
  figure(KNIGHT(), 440, 300, 1, 9);
  label('The Crier, at the game\'s size', 10, 8);
  show();
} else if (mode === 'big') {
  // big:<move>:<seconds>:<scale>: facing you and away, big, on the ground
  const which = parts[1] || 'stand';
  const t = Number(parts[2]) || 0;
  const S = Number(parts[3]) || 7;
  cv.width = 1014;
  cv.height = 700;
  g.fillStyle = '#0d1030';
  g.fillRect(0, 0, cv.width, cv.height);
  groundPane(0, 0, cv.width, cv.height, S);
  const fy = cv.height - 40;
  figure(spOf(CRIER_MOB, which, t, 'front'), 260, fy, S, CRIER_MOB.shadow);
  figure(spOf(CRIER_MOB, which, t, 'back'), 760, fy, S, CRIER_MOB.shadow);
  show();
} else if (mode === 'sheet' || mode === 'pose') {
  const S = Number(mode === 'sheet' ? parts[1] : parts[3]) || 3;
  const which = mode === 'pose' ? parts[1] : 'stand';
  const t = mode === 'pose' ? Number(parts[2]) : 0;
  cv.width = 1014;
  cv.height = 640;
  g.fillStyle = '#0d1030';
  g.fillRect(0, 0, cv.width, cv.height);
  const paneY = 40;
  const paneH = 540;
  groundPane(10, paneY, cv.width - 20, paneH, S);
  const fy = paneY + paneH - 70;
  const front = spOf(CRIER_MOB, which, t, 'front');
  const back = spOf(CRIER_MOB, which, t, 'back');
  const xs = [260, 560, 860];
  figure(front, xs[0], fy, S, CRIER_MOB.shadow);
  figure(back, xs[1], fy, S, CRIER_MOB.shadow);
  figure(KNIGHT(), xs[2], fy, S, 9);
  label(mode === 'sheet' ? `The Crier, standing (${S} times)` : `The Crier: ${which} at ${t.toFixed(2)} s (${S} times)`, 14, 10);
  label('facing you', xs[0] - 50, paneY + paneH + 14);
  label('facing away', xs[1] - 56, paneY + paneH + 14);
  label('the knight', xs[2] - 50, paneY + paneH + 14);
  show();
}

// =============================================================================================
// FILMS (tools/page_gif.mjs): facing you and facing away, on the Crier's Square at dusk; what the move does to
// the floor drawn on it in the game's own pixels (art/crier_shots.ts); the game's freeze as a heavy blow lands.

const win = window as unknown as { __ready: boolean; __frames: number; __tickMs: number; __frame: (i: number) => string };
const BG = '#17142e';
/** The floor in the game's pixels from a point of it in tiles (he stands at 0, 0). */
const ISO: FloorAt = (x, y) => [(x - y) * 16, (x + y) * 8];
/** A point before him and to his left (tiles) as a point of the floor, as he is seen: facing you, or away (as the camera truly sees him). */
const floorOf = (view: PaintView, fwd: number, left: number): [number, number] => (view === 'front' ? [fwd, -left] : view === 'rear' ? [-left, -fwd] : [left, -fwd]);
/** A point of the figure (its own lengths) as tiles before him and to his left, and a height (the game's pixels). */
const tilesOf = (p: readonly number[]): [number, number, number] => [p[0] / TILE3, p[1] / TILE3, p[2] / 2];
const viewOf = (view: GameView): PaintView => paintViewOf(CRIER_MOB, view);

function text(s: string, x: number, y: number, size: number, color: string, weight = 400, align: CanvasTextAlign = 'left'): void {
  g.fillStyle = color;
  g.font = `${weight} ${size}px system-ui, -apple-system, Segoe UI, sans-serif`;
  g.textBaseline = 'top';
  g.textAlign = align;
  g.fillText(s, x, y);
  g.textAlign = 'left';
}
/** (a canvas in the game's own pixels, for what is drawn on the floor) */
const low = document.createElement('canvas');
/** Draw in the game's own pixels, his floor point at (0, 0), scaled up as the pane is (a game pixel is two of the picture's). */
function inGamePixels(x: number, y: number, w: number, h: number, fx0: number, fy0: number, S: number, draw: (c: CanvasRenderingContext2D) => void): void {
  const k = 2 * S;
  const ox = Math.ceil((fx0 - x) / k) + 1;
  const oy = Math.ceil((fy0 - y) / k) + 1;
  const x0 = fx0 - ox * k;
  const y0 = fy0 - oy * k;
  low.width = Math.ceil((x + w - x0) / k) + 1;
  low.height = Math.ceil((y + h - y0) / k) + 1;
  const c = low.getContext('2d') as CanvasRenderingContext2D;
  c.clearRect(0, 0, low.width, low.height);
  c.save();
  c.translate(ox, oy);
  draw(c);
  c.restore();
  g.imageSmoothingEnabled = false;
  g.drawImage(low, x0, y0, low.width * k, low.height * k);
}
/** A pane of the square's flags with him on it at (fx0, fy0): the floor gone `by` tiles by under him (toward his front as he is seen); dusk over it, lighter round him; `under` drawn on the floor, `over` in the air. */
function filmPane(x: number, y: number, w: number, h: number, S: number, fx0: number, fy0: number, sp: Sprite, view: PaintView, by = 0, under?: (c: CanvasRenderingContext2D) => void, over?: (c: CanvasRenderingContext2D) => void): void {
  g.save();
  g.beginPath();
  g.rect(x, y, w, h);
  g.clip();
  // the square's flags (a pixel of them is a picture pixel), the point under him at his floor point
  const [ax, ay] = floorOf(view, by, 0);
  const [cx, cy] = pictureOf(15 + ax, 15 + ay);
  const gw = Math.ceil(w / S) + 2;
  const gh = Math.ceil(h / S) + 2;
  const left = Math.floor(cx - (fx0 - x) / S);
  const top = Math.floor(cy - (fy0 - y) / S);
  const p = paintTerrain(T, left, top, gw, gh);
  const c = document.createElement('canvas');
  c.width = gw;
  c.height = gh;
  (c.getContext('2d') as CanvasRenderingContext2D).putImageData(new ImageData(p.rgba, gw, gh), 0, 0);
  g.imageSmoothingEnabled = false;
  g.drawImage(c, fx0 - (cx - left) * S, fy0 - (cy - top) * S, gw * S, gh * S);
  // dusk over it, lighter round him
  g.fillStyle = 'rgba(14,8,28,0.42)';
  g.fillRect(x, y, w, h);
  g.globalCompositeOperation = 'destination-out';
  const lit = g.createRadialGradient(fx0, fy0 - 30 * S, 0, fx0, fy0 - 30 * S, 160 * S);
  lit.addColorStop(0, 'rgba(0,0,0,0.5)');
  lit.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = lit;
  g.fillRect(x, y, w, h);
  g.globalCompositeOperation = 'source-over';
  if (under) inGamePixels(x, y, w, h, fx0, fy0, S, under);
  figure(sp, fx0, fy0, S, CRIER_MOB.shadow);
  if (over) inGamePixels(x, y, w, h, fx0, fy0, S, over);
  g.restore();
}
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
/** A sprite's reach from its floor point, in picture pixels: left, right, up, down. */
function reachAll(sps: ReadonlyArray<Sprite>): [number, number, number, number] {
  let [l, r, u, d] = [0, 0, 0, 10];
  for (const sp of sps) {
    l = Math.max(l, sp.ax * 2);
    r = Math.max(r, (sp.w - sp.ax) * 2);
    u = Math.max(u, sp.ay * 2);
    d = Math.max(d, (sp.h - sp.ay) * 2);
  }
  return [l, r, u, d];
}
const lastKey = (which: string): number => {
  const mv = which === 'attack' ? CRIER_MOB.attack : which === 'reel' ? CRIER_MOB.reel : which === 'dying' ? CRIER_MOB.dying : CRIER_MOB.more?.[which];
  const keys = mv?.motion.keys ?? [];
  return keys.length ? keys[keys.length - 1].at : 1;
};

/** WHAT A MOVE IS CALLED IN THE FILMS, moment by moment, what it does to the floor, and where on the floor that reaches (tiles before him and to his left). */
interface FilmOf {
  long: number;
  heavy: number[];
  said: (t: number) => string;
  under?: (c: CanvasRenderingContext2D, t: number, view: PaintView) => void;
  over?: (c: CanvasRenderingContext2D, t: number, view: PaintView) => void;
  tail?: number;
  reach?: ReadonlyArray<readonly [number, number]>;
}
const unit = (a: number, b: number): [number, number] => {
  const l = Math.hypot(a, b) || 1;
  return [a / l, b / l];
};
function crierFilms(): Record<string, FilmOf> {
  const M = CRIER_MOB;
  // (where his bell slams down)
  const slam = tilesOf(trumpetOf(skeletonAt(M, 'attack', CR_SWING_HIT + 0.02), posedOfMob(M, 'attack', CR_SWING_HIT + 0.02)).rim);
  // (the way the Shout goes: the trumpet's, as he blows)
  const sh = trumpetOf(skeletonAt(M, 'shout', CR_SHOUT.hit + 0.05), posedOfMob(M, 'shout', CR_SHOUT.hit + 0.05));
  const shWay = unit(sh.way[0], sh.way[1]);
  // (the way the scroll is flung: from his hips to his hand as it lets go; and where it lets go)
  const prS = skeletonAt(M, 'proclaim', CR_PROCLAIM.hit + 0.04);
  const prWay = unit(prS.handL[0] - prS.pelvis[0], prS.handL[1] - prS.pelvis[1]);
  const prFrom = tilesOf(prS.handL);
  // (where the Hushed come out, in these films: round him, the call reaching each in turn. The game's own spots)
  const SPOTS: [number, number][] = [[4.4, 2.6], [3.2, -3.6], [-2.2, 4.0], [-3.4, -2.6]];
  const turnTo = (w: [number, number], f: number, l: number): [number, number] => [w[0] * f - w[1] * l, w[1] * f + w[0] * l];
  const warnK = (t: number, from: number, to: number): number => Math.max(0, Math.min(1, (t - from) / (to - from)));
  return {
    attack: {
      long: lastKey('attack'),
      heavy: [CR_SWING_HIT],
      said: (t) => (t < 0.37 ? 'His swing: he heaves the trumpet up and back over his shoulder' : t < CR_SWING_HIT - 0.12 ? 'His swing: held up there, its throat burning (the warning)' : t < CR_SWING_HIT + 0.3 ? 'His swing: over and down, sudden: the bell slams the flags' : 'His swing: heaved up out of the cracks, back to his side'),
      under: (c, t, view) => {
        const [x, y] = floorOf(view, slam[0], slam[1]);
        drawBellSlam(c, ISO, x, y, t - CR_SWING_HIT);
      },
      tail: SLAM_FOR - (lastKey('attack') - CR_SWING_HIT),
      reach: [[slam[0] + 1.6, slam[1]], [slam[0], slam[1] + 1.6], [slam[0], slam[1] - 1.6]],
    },
    shout: {
      long: lastKey('shout'),
      heavy: [],
      said: (t) => (t < 0.26 ? 'The Silent Shout: the trumpet to his lips' : t < CR_SHOUT.hit ? 'The Silent Shout: a great breath drawn, the cone marked, the dust drawn in (the warning)' : t < CR_SHOUT.end ? 'The Silent Shout: he blows, and no sound comes: dead air rolls out, the floor dark under it' : 'The Silent Shout: the trumpet lowered'),
      under: (c, t, view) => {
        const [fx, fy] = floorOf(view, shWay[0], shWay[1]);
        if (t < CR_SHOUT.hit) drawShoutWarn(c, ISO, 0, 0, fx, fy, warnK(t, 0.42, CR_SHOUT.hit - 0.04), t);
        else drawShoutBlast(c, ISO, 0, 0, fx, fy, t - CR_SHOUT.hit);
      },
      tail: CR_SHOUT.hit + SHOUT_FOR - lastKey('shout'),
      // (round its far arc, every few degrees)
      reach: Array.from({ length: 17 }, (_, i) => ((-1 + i / 8) * SHOUT_HALF * Math.PI) / 180).map((a) => turnTo(shWay, (SHOUT_TO + 0.3) * Math.cos(a), (SHOUT_TO + 0.3) * Math.sin(a))),
    },
    proclaim: {
      long: lastKey('proclaim'),
      heavy: [CR_PROCLAIM.hit],
      said: (t) => (t < 0.36 ? 'The Proclamation: a great scroll drawn from his satchel' : t < CR_PROCLAIM.hit ? 'The Proclamation: held up high, its seal burning, the lane marked (the warning)' : t < CR_PROCLAIM.hit + 0.7 ? 'The Proclamation: flung down, it unrolls down the lane, blank' : t < CR_PROCLAIM.hit + 1.9 ? 'The Proclamation: he points the trumpet after it' : 'The Proclamation: it crumbles into the Hush'),
      under: (c, t, view) => {
        const [fx, fy] = floorOf(view, prWay[0], prWay[1]);
        if (t < CR_PROCLAIM.hit) drawProclaimWarn(c, ISO, 0, 0, fx, fy, warnK(t, 0.55, CR_PROCLAIM.hit - 0.04), t);
        else drawProclamation(c, ISO, 0, 0, fx, fy, t - CR_PROCLAIM.hit, [Math.hypot(prFrom[0], prFrom[1]), prFrom[2]]);
      },
      tail: CR_PROCLAIM.hit + PROCLAIM_FOR - lastKey('proclaim'),
      reach: [turnTo(prWay, PROCLAIM_TO + 0.5, PROCLAIM_HALF + 0.4), turnTo(prWay, PROCLAIM_TO + 0.5, -PROCLAIM_HALF - 0.4)],
    },
    crowd: {
      long: lastKey('crowd'),
      heavy: [],
      said: (t) => (t < 0.28 ? 'The Crowd: the trumpet lifted to the sky' : t < CR_CROWD.hit ? 'The Crowd: his head thrown back, a breath drawn, a ring closing on him (the warning)' : t < CR_CROWD.end ? 'The Crowd: he blows a call that makes no sound; rings of the Hush roll out' : 'The Crowd: the Hushed come out of the alleys to him (the game\'s own)'),
      under: (c, t, view) => {
        if (t < CR_CROWD.hit) drawCrowdBreath(c, ISO, 0, 0, warnK(t, 0.36, CR_CROWD.hit - 0.04), t);
        else drawCrowdCall(c, ISO, 0, 0, t - CR_CROWD.hit);
        for (const [i, [a, b]] of SPOTS.entries()) {
          const [x, y] = floorOf(view, a, b);
          drawHushedRising(c, ISO, x, y, t - CR_CROWD.hit - Math.hypot(a, b) / 7.5 - 0.12 * i);
        }
      },
      tail: Math.max(CR_CROWD.hit + CROWD_FOR, CR_CROWD.hit + 5.2 / 7.5 + 0.36 + RISING_FOR) - lastKey('crowd'),
      reach: SPOTS.flatMap(([a, b]) => [[a + 0.9, b], [a - 0.9, b], [a, b + 0.9], [a, b - 0.9]] as [number, number][]),
    },
  };
}

if (mode === 'film') {
  const which = parts[1] || 'attack';
  const S = Number(parts[2]) || 1.5;
  const FPS = 30;
  const mob = CRIER_MOB;
  const PAD = 10;
  const HEAD = 58;
  const standAt = (t: number, from: number): number => (Math.floor(Math.max(0, t - from) * mob.idleFps + 1e-6) % mob.idleFrames) / mob.idleFps;
  if (which === 'stand' || which === 'death') {
    // HIS STAND, twice round at its own frames a second; or HIS DEATH: struck, then struck down
    const reelLong = lastKey('reel');
    const T1 = 0.6;
    const T2 = T1 + reelLong + 0.5;
    const ROUND = which === 'stand' ? (2 * mob.idleFrames) / mob.idleFps : T2 + mob.dieTime + 1.2;
    const TICKS = Math.round(ROUND * FPS);
    const frameOf = (view: GameView, t: number): Sprite =>
      which === 'stand' ? spOf(mob, 'stand', standAt(t, 0), view) : t >= T2 ? spOf(mob, 'die', Math.min(mob.dieTime, t - T2), view) : t >= T1 && t < T1 + reelLong ? spOf(mob, 'reel', t - T1, view) : spOf(mob, 'stand', t >= T1 ? standAt(t, T1 + reelLong) : standAt(t, 0), view);
    const all: Sprite[] = [];
    for (let i = 0; i < TICKS; i += 3) for (const v of ['front', 'back'] as const) all.push(frameOf(v, i / FPS));
    const [l, r, u, d] = reachAll(all);
    const Mg = 24;
    const cw = (l + r + 2 * Mg) * S;
    const ch = (u + d + 2 * Mg) * S;
    cv.width = PAD + 2 * (cw + PAD);
    cv.height = HEAD + ch + 34;
    document.body.appendChild(cv);
    filmPage(TICKS, FPS, (tick) => {
      const t = tick / FPS;
      g.fillStyle = BG;
      g.fillRect(0, 0, cv.width, cv.height);
      const td = t - T2;
      const said = which === 'stand' ? `${mob.stand.name}: his stand, ${mob.idleFrames} frames at ${mob.idleFps} a second, twice round` : t < T2 ? (t >= T1 && t < T1 + reelLong ? 'The Crier: struck' : 'The Crier') : td < CR_TRUMPET_GOES ? 'Struck down: the pink goes out of him, and the Hush pours out' : td < 1.0 ? 'Struck down: the trumpet falls; his knees give' : td < 2.1 ? 'Struck down: he sways on his knees, and falls on his face' : 'Struck down: the last of the Hush rises off him, and thins away';
      text(said, PAD, 8, 17, '#ffd866', 700);
      text('a mock-up: not in the game', PAD, 32, 14, '#cfc8ff', 600);
      for (const [j, view] of (['front', 'back'] as const).entries()) {
        const x = PAD + j * (cw + PAD);
        filmPane(x, HEAD, cw, ch, S, x + (Mg + l) * S, HEAD + (Mg + u) * S, frameOf(view, t), viewOf(view));
        text(view === 'front' ? 'facing you' : 'facing away', x + cw / 2, HEAD + ch + 6, 15, '#e8e2ff', 600, 'center');
      }
    });
  } else if (which === 'walk') {
    // HIS MARCH, as the game would play it: he stands, sets off, marches, halts as his march comes round, stands; toward you, then away
    const period = mob.walkFrames / mob.walkFps;
    const seq = [
      { which: 'stand', long: 0.6 },
      { which: 'setOff', long: lastKey('setOff') },
      { which: 'walk', long: Math.ceil(2.4 / period) * period },
      { which: 'halt', long: lastKey('halt') },
      { which: 'stand', long: 1.0 },
    ];
    const LEG = seq.reduce((a, p2) => a + p2.long, 0);
    const TICKS = Math.round(2 * LEG * FPS);
    const moving = (w: string): boolean => w === 'setOff' || w === 'walk' || w === 'halt';
    const doing = (t: number): { which: string; m: number; by: number } => {
      let t0 = 0;
      let by = 0;
      for (let i = 0; i < seq.length; i++) {
        const p2 = seq[i];
        if (t < t0 + p2.long || i === seq.length - 1) {
          const m = Math.max(0, Math.min(p2.long, t - t0));
          const shown = p2.which === 'stand' ? Math.floor(m * mob.idleFps + 1e-6) / mob.idleFps : p2.which === 'walk' ? ((Math.floor(m * mob.walkFps + 1e-6) % mob.walkFrames) / mob.walkFrames) * period : m;
          return { which: p2.which, m: shown, by: by + (moving(p2.which) ? m * mob.pace : 0) };
        }
        t0 += p2.long;
        if (moving(p2.which)) by += p2.long * mob.pace;
      }
      return { which: 'stand', m: 0, by };
    };
    const all: Sprite[] = [];
    for (let i = 0; i < Math.round(LEG * FPS); i += 2) for (const v of ['front', 'back'] as const) all.push(spOf(mob, doing(i / FPS).which, doing(i / FPS).m, v));
    const [l, r, u, d] = reachAll(all);
    const Mg = 30;
    const cw = (l + r + 2 * Mg) * S;
    const ch = (u + d + 2 * Mg) * S;
    cv.width = Math.max(cw + 2 * PAD, 640);
    cv.height = HEAD + ch + 34;
    document.body.appendChild(cv);
    const named = (w: string): string => (w === 'walk' ? mob.walk.name : w === 'stand' ? mob.stand.name : (mob.more?.[w]?.name ?? 'The Crier'));
    filmPage(TICKS, FPS, (tick) => {
      const t = tick / FPS;
      const away = t >= LEG;
      const dd = doing(away ? t - LEG : t);
      const view: GameView = away ? 'back' : 'front';
      g.fillStyle = BG;
      g.fillRect(0, 0, cv.width, cv.height);
      text(`${named(dd.which)}, ${away ? 'going away' : 'coming toward you'}`, PAD, 8, 17, '#ffd866', 700);
      text(`a mock-up: not in the game. ${mob.pace} tiles a second; the floor goes by under him`, PAD, 32, 14, '#cfc8ff', 600);
      const x = (cv.width - cw) / 2;
      filmPane(x, HEAD, cw, ch, S, x + (Mg + l) * S, HEAD + (Mg + u) * S, spOf(mob, dd.which, dd.m, view), viewOf(view), dd.by);
    });
  } else {
    // A MOVE: he stands, makes it, stands; what it does to the floor on it; held a tenth of a second at each heavy blow (the game's freeze)
    const film = crierFilms()[which];
    const HOLD = 0.1;
    const T1 = 0.6;
    const ROUND = T1 + film.long + film.heavy.length * HOLD + Math.max(0.7, (film.tail ?? 0) + 0.3);
    const TICKS = Math.round(ROUND * FPS);
    const moveT = (t: number): number => {
      let m = t - T1;
      for (const h of film.heavy) if (m > h) m = m < h + HOLD ? h : m - HOLD;
      return m;
    };
    const after = T1 + film.long + film.heavy.length * HOLD;
    const frameOf = (view: GameView, t: number): Sprite => {
      const m = moveT(t);
      return m < 0 ? spOf(mob, 'stand', standAt(t, 0), view) : m > film.long ? spOf(mob, 'stand', standAt(t, after), view) : spOf(mob, which, m, view);
    };
    const all: Sprite[] = [];
    for (let i = 0; i < TICKS; i += 3) for (const v of ['front', 'back'] as const) all.push(frameOf(v, i / FPS));
    const [l, r, u, d] = reachAll(all);
    // (each view's own bounds: him, and what the move reaches on the floor; picture pixels from his floor point)
    const Mg = 20;
    const box = (view: GameView): [number, number, number, number] => {
      let [x0, x1, y0, y1] = [-l, r, -u, d];
      for (const [a, b] of film.reach ?? []) {
        const [fx, fy] = floorOf(viewOf(view), a, b);
        const [sx, sy] = ISO(fx, fy);
        x0 = Math.min(x0, sx * 2);
        x1 = Math.max(x1, sx * 2);
        y0 = Math.min(y0, sy * 2);
        y1 = Math.max(y1, sy * 2);
      }
      return [x0 - Mg, x1 + Mg, y0 - Mg, y1 + Mg];
    };
    const boxes = { front: box('front'), back: box('back') };
    const cw = Math.max(...Object.values(boxes).map((b) => b[1] - b[0])) * S;
    const ch = Math.max(...Object.values(boxes).map((b) => b[3] - b[2])) * S;
    cv.width = PAD + 2 * (cw + PAD);
    cv.height = HEAD + ch + 34;
    document.body.appendChild(cv);
    filmPage(TICKS, FPS, (tick) => {
      const t = tick / FPS;
      const m = moveT(t);
      g.fillStyle = BG;
      g.fillRect(0, 0, cv.width, cv.height);
      const mm = m >= 0 && m <= film.long + (film.tail ?? 0) ? m : -1;
      text(mm >= 0 ? film.said(Math.min(m, film.long)) : 'The Crier', PAD, 8, 17, '#ffd866', 700);
      text('a mock-up: not in the game. What each move does to the hero, and how far, are the main chat\u2019s rules', PAD, 32, 14, '#cfc8ff', 600);
      for (const [j, view] of (['front', 'back'] as const).entries()) {
        const x = PAD + j * (cw + PAD);
        const b = boxes[view];
        const bw = (b[1] - b[0]) * S;
        const bh = (b[3] - b[2]) * S;
        const fx0 = x + (cw - bw) / 2 - b[0] * S;
        const fy0 = HEAD + (ch - bh) / 2 - b[2] * S;
        const pv = viewOf(view);
        filmPane(x, HEAD, cw, ch, S, fx0, fy0, frameOf(view, t), pv, 0, film.under && mm >= 0 ? (c) => film.under?.(c, mm, pv) : undefined, film.over && mm >= 0 ? (c) => film.over?.(c, mm, pv) : undefined);
        text(view === 'front' ? 'facing you' : 'facing away', x + cw / 2, HEAD + ch + 6, 15, '#e8e2ff', 600, 'center');
      }
    });
  }
}

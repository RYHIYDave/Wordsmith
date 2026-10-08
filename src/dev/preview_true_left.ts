// Dev page: TRUE LEFT-FACING HEROES, A MOCK-UP FOR THE OWNER (8 Oct 2026; NOT IN THE GAME: the
// switch `TRUE_LEFT` in art/heroes3.ts is off, and this page switches it on for itself only).
// What it answers, and what the pictures showed: docs/mockups/true_left/README.md.
//
// Today a hero who faces screen-left is shown as the picture of him facing right, turned over: his
// weapon changes sides and the light on him falls from the top right. Here the knight is shown
// both ways: AS NOW, and with frames of the figure itself turned to face left (skeleton.ts,
// `frontL` and `backL`). Every picture is made by the game's own Figure (render/figure.ts) from the
// game's own art (art/heroes3.ts, `makeHeroArt3`), so it is, frame for frame, what the game would
// show; the scarf flies as it does in the game.
//
//   cells: node tools/preview.mjs src/dev/preview_true_left.ts shots/true_left/cells4.png 1100 1400 "cells:4" | grep CELLS > shots/true_left/cells4.json
//     A grid of pictures for tools/sheet_true_left.py to lay out (it says how): a row for each of
//     STANDING, RUNNING and STRIKING, as now and true (six rows), and a column for each way he
//     faces (down-right, up-right, down-left, up-left). `cells:<screen pixels to a game pixel>`.
//   tries: node tools/preview.mjs src/dev/preview_true_left.ts previews/true_left/knight_down_left_turned_a_little.png 1520 578 "tries:5"
//     His stance and his run facing down-left, and turned a little either way of it (is there a
//     turn near down-left that shows his sword?).
//   turn:  node tools/true_left_gif.mjs (it collects this page's frames).
//     `turn:<scale>`: the knight standing and turning on the spot, round once: with the game's four
//     views as now, beside himself turning the same way with eight views, each the figure itself
//     turned. window.__frame(i) draws frame i.
import type { ActorArt } from '../art/actor_types';
import { makeGroundArt } from '../art/ground';
import { HERO_TAILS } from '../art/heroes';
import { TRUE_LEFT, makeHeroArt3, paintMove3 } from '../art/heroes3';
import { MOVES3 } from '../art/moves3';
import { CANVAS3 } from '../art/skin';
import type { GameView } from '../art/skin';
import { toSprite } from '../art/kit';
import { drawAura, drawLights } from '../engine/px';
import type { Sprite } from '../engine/px';
import { Tails } from '../engine/tails';
import { Figure } from '../render/figure';
import type { FigureState } from '../render/figure';

const [mode = 'cells', scaleArg = '4'] = decodeURIComponent(location.hash.slice(1)).split(':');
const S = Number(scaleArg) || 4;
const DUNGEON = { twoHanded: true };

// The knight's figure as the game makes it today (the switch off) and with true left frames (the
// switch on for the making of this one figure only, and put back).
const today: ActorArt = makeHeroArt3().of('warrior', DUNGEON);
const was = TRUE_LEFT.on;
TRUE_LEFT.on = true;
const turned: ActorArt = makeHeroArt3().of('warrior', DUNGEON);
TRUE_LEFT.on = was;
if (today.left || !turned.left) throw new Error('the switch did not do what it says');

const ground = makeGroundArt();
/** The four ways he faces, as steps in the world (render/figure.ts): down-right, up-right, down-left, up-left. */
const WAYS: [string, number, number][] = [['down-right', 1, 0], ['up-right', 0, -1], ['down-left', 0, 1], ['up-left', -1, 0]];
/** The rules' wind-up of the quick attack (game/defs.ts: as tools use it), so that the blow lands where the rules land it. */
const WIND = 0.12;
const TICK = 1 / 30;
const SPEED = 4.2;

type Pose = 'stand' | 'run' | 'strike';
/** What the rules say he is doing at a moment `t` (seconds) of the picture: the moment shown is t = 0. */
function stateAt(pose: Pose, fx: number, fy: number, t: number): FigureState {
  const base = { fx, fy, attackSkill: 0, attackAge: 0, attackWind: 0, leapK: -1 };
  // (one frame of his run, the fourth of fifteen: a stride open)
  if (pose === 'run') return { ...base, anim: 'walk', animT: 0.1001 + t + 2 };
  // (the strike: begun WIND before its blow, which is the moment shown; standing before that)
  if (pose === 'strike') {
    const age = WIND + 0.0001 + t;
    return age >= 0 ? { ...base, anim: 'attack', animT: 2 + t, attackAge: age, attackWind: WIND } : { ...base, anim: 'idle', animT: 2 + t };
  }
  return { ...base, anim: 'idle', animT: 2 + t };
}

/** The frame shown, and the figure that shows it, after two seconds of whatever led up to it (so that the scarf is flying as it would be). */
function shown(art: ActorArt, pose: Pose, fx: number, fy: number): { fig: Figure; sp: Sprite } {
  const fig = new Figure();
  const lead = 60;
  let sp = fig.frame(art, stateAt(pose, fx, fy, -lead * TICK), 0, 0, 0, false);
  for (let k = lead - 1; k >= 0; k--) {
    const t = -k * TICK;
    // (a runner is carried along: the scarf streams behind him)
    const gone = pose === 'run' ? (t + lead * TICK) * SPEED : 0;
    sp = fig.frame(art, stateAt(pose, fx, fy, t), TICK, (fx - fy) * 16 * gone, (fx + fy) * 8 * gone, false);
  }
  return { fig, sp };
}

/** A cell: CW x CH game pixels, his feet at (FX, FY) in it. */
const CW = 66;
const CH = 58;
const FX = 33;
const FY = 44;

/** Where each picture reaches, from his feet, in game pixels (for the sheet's maker to cut round). */
const extents: { x0: number; x1: number; y0: number; y1: number }[] = [];

/** Lay the dungeon's floor, the dark round the hero's own light, and draw him as the game does: shadow, pool of light, scarf, figure, the light of his blade. */
function drawCell(g: CanvasRenderingContext2D, x0: number, y0: number, s: number, art: ActorArt, pose: Pose, fx: number, fy: number): void {
  g.save();
  g.beginPath();
  g.rect(x0, y0, CW * s, CH * s);
  g.clip();
  g.translate(x0, y0);
  g.scale(s, s);
  g.imageSmoothingEnabled = false;
  g.fillStyle = '#05040c';
  g.fillRect(0, 0, CW, CH);
  for (let tx = -5; tx <= 5; tx++) {
    for (let ty = -5; ty <= 5; ty++) {
      const x = FX + (tx - ty) * 16;
      const y = FY + (tx + ty) * 8;
      if (x < -40 || x > CW + 40 || y < -30 || y > CH + 30) continue;
      const f = ground.floor(tx + 40, ty + 40);
      g.drawImage(f.img, x - f.ax, y - f.ay, f.w, f.h);
    }
  }
  // (the dark of a dungeon, thinner where the hero's own light falls)
  const dark = g.createRadialGradient(FX, FY - 12, 6, FX, FY - 12, 52);
  dark.addColorStop(0, 'rgba(6,4,14,0)');
  dark.addColorStop(0.55, 'rgba(6,4,14,0.3)');
  dark.addColorStop(1, 'rgba(6,4,14,0.78)');
  g.fillStyle = dark;
  g.fillRect(0, 0, CW, CH);
  const { fig, sp } = shown(art, pose, fx, fy);
  extents.push({ x0: -sp.ax, x1: sp.w - sp.ax, y0: -sp.ay, y1: sp.h - sp.ay });
  g.fillStyle = 'rgba(0,0,0,0.42)';
  g.beginPath();
  g.ellipse(FX, FY, 7, 3, 0, 0, Math.PI * 2);
  g.fill();
  fig.draw(g, sp, FX, FY, 1);
  fig.lights(g, FX, FY, 1);
  g.restore();
}

const POSES: Pose[] = ['stand', 'run', 'strike'];
const cv = document.createElement('canvas');
cv.style.position = 'static';
cv.style.display = 'block';
for (const el of [document.documentElement, document.body]) {
  el.style.height = 'auto';
  el.style.overflow = 'visible';
}
document.body.style.margin = '0';
document.body.style.background = '#000';
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;

if (mode === 'cells') {
  // six rows (each pose as now, then true), four columns (the ways he faces); no gaps: the sheet's maker cuts them apart
  cv.width = WAYS.length * CW * S;
  cv.height = POSES.length * 2 * CH * S;
  POSES.forEach((pose, p) => {
    [today, turned].forEach((art, r) => {
      WAYS.forEach(([, fx, fy], c) => drawCell(g, c * CW * S, (p * 2 + r) * CH * S, S, art, pose, fx, fy));
    });
  });
  // (for tools/sheet_true_left.py: where the cells are, and where in each the picture reaches; row by row)
  console.log(`CELLS ${JSON.stringify({ scale: S, cw: CW, ch: CH, fx: FX, fy: FY, rows: POSES.flatMap((p) => [`${p} now`, `${p} true`]), cols: WAYS.map((w) => w[0]), extents })}`);
}

// ---------------------------------------------------------------------------------------------
// The knight standing and turning on the spot, round once to his right: with the game's four
// views as it has them now (two of them the others turned over), and with eight views, each the
// figure itself turned (the four in between were offered on 4 Oct 2026 and never built).

/** The eight ways, as bearings on the floor (0 up the screen, 90 to its right), and the view that shows him facing each: the figure turned to its own left from facing down-right. */
const EIGHT: [number, GameView][] = [[135, 'front'], [180, 'turn-45'], [225, 'frontL'], [270, 'turn-135'], [315, 'backL'], [0, 'turn135'], [45, 'turn90'], [90, 'turn45']];
/** Frame `i` of a move (at `fps` frames a second: his stance's ten, if not said), seen from any view: as the game would hold it. */
const loose = new Map<string, Sprite>();
function looseFrame(view: GameView, i: number, move = 'rear', fps = 10): Sprite {
  const key = `${view}@${move}@${i}@${fps}`;
  let s = loose.get(key);
  if (!s) {
    // (the pool of light behind him lies on the side his sword trails, as the game has it: kit.ts)
    const left = view === 'frontL' || view === 'backL' || view === 'turn-135';
    const aura = { x: CANVAS3.ax + (left ? 4 : -4), y: CANVAS3.ay - 30, r: 46, color: '#28dcf0', a: 0.2 };
    s = toSprite(paintMove3(MOVES3[move], i / fps, view), aura, CANVAS3.ax, CANVAS3.ay);
    loose.set(key, s);
  }
  return s;
}

if (mode === 'tries') {
  // FACING DOWN-LEFT, A LITTLE EITHER WAY: is there a turn of the figure near down-left that shows
  // his sword? (His stance and his run, the figure turned from facing you to facing straight left.)
  const TRIES: [GameView, string, string][] = [['turn-45', 'facing you', '(45\u00b0 toward you)'], ['turn-67.5', '22\u00b0 toward you', ''], ['frontL', 'DOWN-LEFT', '(true)'], ['turn-112.5', '22\u00b0 to the left', ''], ['turn-135', 'straight left', '(45\u00b0 to the left)']];
  const ROWS: [string, number, number, string][] = [['rear', 0, 10, 'STANDING'], ['krun', 3, 30, 'RUNNING']];
  const TW = 54;
  const TH = 50;
  const TX = 27;
  const TY = 40;
  const HEAD = 62;
  const LEFT = 130;
  cv.width = LEFT + TRIES.length * (TW * S + 8);
  cv.height = HEAD + ROWS.length * (TH * S + 8);
  g.fillStyle = '#17142e';
  g.fillRect(0, 0, cv.width, cv.height);
  g.textBaseline = 'middle';
  TRIES.forEach(([view, a, b], c) => {
    const x = LEFT + c * (TW * S + 8);
    g.fillStyle = view === 'frontL' ? '#7af8f0' : '#ffd866';
    g.font = '700 17px DejaVu Sans, system-ui, sans-serif';
    g.fillText(a, x + 4, 20);
    g.fillStyle = '#f0e8ff';
    g.font = '15px DejaVu Sans, system-ui, sans-serif';
    g.fillText(b, x + 4, 44);
  });
  ROWS.forEach(([move, i, fps, label], r) => {
    const y0 = HEAD + r * (TH * S + 8);
    g.fillStyle = '#f0e8ff';
    g.font = '700 17px DejaVu Sans, system-ui, sans-serif';
    g.fillText(label, 8, y0 + (TH * S) / 2);
    TRIES.forEach(([view], c) => {
      const x0 = LEFT + c * (TW * S + 8);
      const sp = looseFrame(view, i, move, fps);
      // (the scarf, as it hangs after a couple of seconds: blown behind a runner)
      const tails = new Tails(HERO_TAILS);
      for (let k = 0; k < 60; k++) tails.step(1 / 30, sp.tails, sp.ax, sp.ay, -1, move === 'krun' ? -k * 4.2 * 16 / 30 / Math.SQRT2 : 0, move === 'krun' ? k * 4.2 * 8 / 30 / Math.SQRT2 : 0);
      g.save();
      g.beginPath();
      g.rect(x0, y0, TW * S, TH * S);
      g.clip();
      g.translate(x0, y0);
      g.scale(S, S);
      g.imageSmoothingEnabled = false;
      g.fillStyle = '#05040c';
      g.fillRect(0, 0, TW, TH);
      for (let tx = -5; tx <= 5; tx++) {
        for (let ty = -5; ty <= 5; ty++) {
          const x = TX + (tx - ty) * 16;
          const y = TY + (tx + ty) * 8;
          if (x < -40 || x > TW + 40 || y < -30 || y > TH + 30) continue;
          const f = ground.floor(tx + 40, ty + 40);
          g.drawImage(f.img, x - f.ax, y - f.ay, f.w, f.h);
        }
      }
      const dark = g.createRadialGradient(TX, TY - 12, 6, TX, TY - 12, 46);
      dark.addColorStop(0, 'rgba(6,4,14,0)');
      dark.addColorStop(0.55, 'rgba(6,4,14,0.3)');
      dark.addColorStop(1, 'rgba(6,4,14,0.78)');
      g.fillStyle = dark;
      g.fillRect(0, 0, TW, TH);
      g.fillStyle = 'rgba(0,0,0,0.42)';
      g.beginPath();
      g.ellipse(TX, TY, 7, 3, 0, 0, Math.PI * 2);
      g.fill();
      drawAura(g, sp, TX, TY, 1);
      tails.draw(g, TX, TY, false, 1);
      g.drawImage(sp.img, TX - sp.ax, TY - sp.ay, sp.w, sp.h);
      tails.draw(g, TX, TY, true, 1);
      drawLights(g, sp, TX, TY, 1);
      g.restore();
      if (view === 'frontL') {
        g.strokeStyle = '#7af8f0';
        g.lineWidth = 3;
        g.strokeRect(x0 - 1.5, y0 - 1.5, TW * S + 3, TH * S + 3);
      }
    });
  });
}

if (mode === 'turn') {
  /** A pane, in game pixels; his feet in it; the film's rate; how long he takes to go round once. */
  const PW = 74;
  const PH = 67;
  const PX = 37;
  const PY = 47;
  const FPS = 25;
  const ROUND = 6.4;
  const HEAD = 46;
  const FOOT = 34;
  const GAPX = 12;
  const frames = Math.round(ROUND * FPS);
  cv.width = 2 * PW * S + GAPX * 3;
  cv.height = HEAD + PH * S + FOOT;
  const now = new Figure();
  const tails = new Tails(HERO_TAILS);
  let facing = 1;
  let drawn = -1;
  /** Where he faces at frame i: a bearing on the floor, and that as a step in the world (render/figure.ts). */
  const way = (i: number): { b: number; fx: number; fy: number; east: number; north: number } => {
    const b = 135 + (360 * i) / frames;
    const east = Math.sin((b * Math.PI) / 180);
    const north = Math.cos((b * Math.PI) / 180);
    return { b, east, north, fx: (east - north) / Math.SQRT2, fy: (-north - east) / Math.SQRT2 };
  };
  const pane = (x0: number, title: string, note: string, draw: () => void, b: number): void => {
    g.save();
    g.beginPath();
    g.rect(x0, HEAD, PW * S, PH * S);
    g.clip();
    g.translate(x0, HEAD);
    g.scale(S, S);
    g.imageSmoothingEnabled = false;
    g.fillStyle = '#05040c';
    g.fillRect(0, 0, PW, PH);
    for (let tx = -5; tx <= 5; tx++) {
      for (let ty = -5; ty <= 5; ty++) {
        const x = PX + (tx - ty) * 16;
        const y = PY + (tx + ty) * 8;
        if (x < -40 || x > PW + 40 || y < -30 || y > PH + 30) continue;
        const f = ground.floor(tx + 40, ty + 40);
        g.drawImage(f.img, x - f.ax, y - f.ay, f.w, f.h);
      }
    }
    const dark = g.createRadialGradient(PX, PY - 12, 6, PX, PY - 12, 56);
    dark.addColorStop(0, 'rgba(6,4,14,0)');
    dark.addColorStop(0.55, 'rgba(6,4,14,0.3)');
    dark.addColorStop(1, 'rgba(6,4,14,0.78)');
    g.fillStyle = dark;
    g.fillRect(0, 0, PW, PH);
    // the way he faces, on the floor (a tile is 32 across and 16 down): an arrow that goes round smoothly
    const r = (b * Math.PI) / 180;
    const ux = Math.sin(r) * 22.6;
    const uy = -Math.cos(r) * 11.3;
    const n = Math.hypot(ux, uy) || 1;
    const [ax, ay] = [PX + ux * 0.55, PY + uy * 0.55];
    const [bx, by] = [PX + ux * 1.25, PY + uy * 1.25];
    g.strokeStyle = 'rgba(122,248,240,0.6)';
    g.fillStyle = 'rgba(122,248,240,0.6)';
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(ax, ay);
    g.lineTo(bx, by);
    g.stroke();
    g.beginPath();
    g.moveTo(bx + (ux / n) * 4, by + (uy / n) * 4);
    g.lineTo(bx - (uy / n) * 3, by + (ux / n) * 3);
    g.lineTo(bx + (uy / n) * 3, by - (ux / n) * 3);
    g.closePath();
    g.fill();
    g.fillStyle = 'rgba(0,0,0,0.42)';
    g.beginPath();
    g.ellipse(PX, PY, 7, 3, 0, 0, Math.PI * 2);
    g.fill();
    draw();
    g.restore();
    g.fillStyle = '#ffd866';
    g.font = '700 19px DejaVu Sans, system-ui, sans-serif';
    g.textBaseline = 'middle';
    g.textAlign = 'left';
    g.fillText(title, x0 + 2, HEAD / 2);
    g.fillStyle = '#f0e8ff';
    g.font = '15px DejaVu Sans, system-ui, sans-serif';
    g.fillText(note, x0 + 2, HEAD + PH * S + FOOT / 2);
  };
  const drawTick = (tick: number): void => {
    if (tick <= drawn) {
      now.reset();
      tails.reset();
      drawn = -1;
    }
    // (a turn and a bit before the first frame, so that the scarves are flying as they will be when the film goes round)
    const lead = drawn < 0 ? frames : 0;
    let a: Sprite | null = null;
    let b: Sprite | null = null;
    let bearing = 135;
    for (let k = drawn + 1 - lead; k <= tick; k++) {
      const w = way(((k % frames) + frames) % frames);
      bearing = w.b;
      const t = (k + frames * 2) / FPS;
      a = now.frame(today, { anim: 'idle', animT: t, fx: w.fx, fy: w.fy, attackSkill: 0, attackAge: 0, attackWind: 0, leapK: -1 }, 1 / FPS, 0, 0, false);
      // the nearest of the eight ways, and his stance in it at the moment the game's own loop is at (ten frames a second)
      const k8 = Math.round((((w.b - 135) % 360) + 360) % 360 / 45) % 8;
      b = looseFrame(EIGHT[k8][1], Math.floor(t * 10) % 20);
      if (Math.abs(w.east) > 0.2) facing = w.east > 0 ? 1 : -1;
      tails.step(1 / FPS, b.tails, b.ax, b.ay, facing, 0, 0);
    }
    drawn = tick;
    g.fillStyle = '#17142e';
    g.fillRect(0, 0, cv.width, cv.height);
    const sa = a as Sprite;
    const sb = b as Sprite;
    pane(GAPX, 'NOW: 4 views', 'two are the other two turned over', () => {
      now.draw(g, sa, PX, PY, 1);
      now.lights(g, PX, PY, 1);
    }, bearing);
    pane(GAPX * 2 + PW * S, '8 views, turned for real', 'sword always on his right; two are side-on', () => {
      drawAura(g, sb, PX, PY, 1);
      tails.draw(g, PX, PY, false, 1);
      g.drawImage(sb.img, PX - sb.ax, PY - sb.ay, sb.w, sb.h);
      tails.draw(g, PX, PY, true, 1);
      drawLights(g, sb, PX, PY, 1);
    }, bearing);
  };
  drawTick(0);
  const w = window as unknown as { __frames: number; __tickMs: number; __frame: (i: number) => string };
  w.__frames = frames;
  w.__tickMs = 1000 / FPS;
  w.__frame = (i: number): string => {
    drawTick(i);
    return cv.toDataURL('image/png');
  };
}

(window as unknown as { __ready: boolean }).__ready = true;

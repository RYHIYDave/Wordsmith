// Dev page: THE RANGER'S SIX COMPANIONS (art/companions_art.ts), beside the Ranger for size. Nothing of the game imports it.
//
//   node tools/preview.mjs src/dev/preview_companions_art.ts shots/comp_strip.png 1600 900 strip:<kind>:<move>[:<scale>[:<every>]]
//   node tools/preview.mjs src/dev/preview_companions_art.ts shots/comp_close.png 1200 700 close:<kind>:<move>:<seconds>[:<scale>]

import { COMP_CANVAS, KINDS, companionFrame, companionIcon, moveFps, moveLong } from '../art/companions_art';
import { COMP_ATTACK, COMP_STAND, groundOf, moveFrames } from '../art/companions_art_moves';
const COMP_STAND_P = COMP_STAND.period;
import type { Kind } from '../art/companions_art';
import { spriteOf3 } from '../art/heroes3';
import { MOVES3 } from '../art/moves3';
import { drawText } from '../engine/font';
import { drawAura, drawLights } from '../engine/px';
import type { Sprite } from '../engine/px';
import type { GameView } from '../art/skin';
import { P } from '../art/palette';
import { THEME } from '../ui/ui';

const parts = decodeURIComponent(location.hash.slice(1)).split(':');
const mode = parts[0] || 'strip';
const cv = document.createElement('canvas');
const g = cv.getContext('2d') as CanvasRenderingContext2D;
const win = window as unknown as { __ready: boolean; __frames: number; __tickMs: number; __frame: (i: number) => string };
function show(): void {
  document.body.style.margin = '0';
  document.body.style.background = '#0d1030';
  document.body.appendChild(cv);
  win.__ready = true;
}
function label(s: string, x: number, y: number, scale = 2): void {
  g.save();
  g.scale(scale, scale);
  drawText(g, s, x / scale, y / scale, THEME.text, { shadow: P.ink });
  g.restore();
}
/** A figure laid down `S` times, its floor point at (fx, fy): its soft shadow, its pool of light, it, its lights. */
function figure(sp: Sprite, fx: number, fy: number, S: number, shadow: number): void {
  g.save();
  g.fillStyle = 'rgba(8,6,20,0.5)';
  g.beginPath();
  g.ellipse(fx, fy, shadow * S, shadow * 0.45 * S, 0, 0, Math.PI * 2);
  g.fill();
  g.restore();
  drawAura(g, sp, fx, fy, 2 * S);
  g.imageSmoothingEnabled = false;
  g.drawImage(sp.img, Math.round(fx - sp.ax * 2 * S), Math.round(fy - sp.ay * 2 * S), sp.img.width * S, sp.img.height * S);
  drawLights(g, sp, fx, fy, 2 * S);
}
const RANGER = (t = 0, view: GameView = 'front'): Sprite => spriteOf3(MOVES3.rstand, t, view);

if (mode === 'strip') {
  const kind = (parts[1] || 'wolf') as Kind;
  const which = parts[2] || 'stand';
  const S = Number(parts[3]) || 3;
  const every = Number(parts[4]) || (which === 'stand' ? 3 : 1);
  const fps = moveFps(kind, which);
  const n = Math.round(moveLong(kind, which) * fps);
  const ts: number[] = [];
  for (let i = 0; i <= n; i += every) ts.push(i / fps);
  const cellW = 50 * S;
  const cellH = 56 * S;
  const cols = Math.min(ts.length, Math.floor(1580 / cellW));
  const rows = Math.ceil(ts.length / cols);
  cv.width = 20 + cols * cellW;
  cv.height = 40 + rows * 2 * cellH;
  g.fillStyle = '#1a1830';
  g.fillRect(0, 0, cv.width, cv.height);
  ts.forEach((t, i) => {
    const c = i % cols;
    const r = Math.floor(i / cols);
    for (const [vi, view] of (['front', 'back'] as const).entries()) {
      const x = 10 + c * cellW + cellW / 2;
      const y = 40 + (r * 2 + vi) * cellH + cellH * 0.78;
      g.fillStyle = vi ? '#22203a' : '#26243e';
      g.fillRect(10 + c * cellW + 2, 40 + (r * 2 + vi) * cellH + 2, cellW - 4, cellH - 4);
      figure(companionFrame(kind, which, t, view), x, y, S, 6);
      label(`${t.toFixed(2)}`, 10 + c * cellW + 6, 40 + (r * 2 + vi) * cellH + 6, 1);
    }
  });
  label(`${kind} ${which}, front and back, ${S} times`, 10, 8);
  show();
} else if (mode === 'close') {
  const kind = (parts[1] || 'wolf') as Kind;
  const which = parts[2] || 'stand';
  const t = Number(parts[3]) || 0;
  const S = Number(parts[4]) || 8;
  const sps = (['front', 'back'] as const).map((v) => companionFrame(kind, which, t, v));
  cv.width = sps.reduce((a, sp) => a + sp.img.width * S + 40, 20);
  cv.height = Math.max(...sps.map((sp) => sp.img.height * S)) + 60;
  g.fillStyle = '#3a3448';
  g.fillRect(0, 0, cv.width, cv.height);
  g.imageSmoothingEnabled = false;
  let x = 20;
  for (const sp of sps) {
    g.drawImage(sp.img, x, 44, sp.img.width * S, sp.img.height * S);
    x += sp.img.width * S + 40;
  }
  label(`${kind} ${which} at ${t.toFixed(2)} s (${S} times)`, 10, 8);
  show();
} else if (mode === 'all') {
  // all six standing, front and back, with the Ranger, `S` times
  const S = Number(parts[1]) || 3;
  const which = parts[2] || 'stand';
  const t = Number(parts[3]) || 0;
  const cellW = 50 * S;
  cv.width = 40 + cellW * (KINDS.length + 1);
  cv.height = 2 * 76 * S + 60;
  g.fillStyle = '#1a1830';
  g.fillRect(0, 0, cv.width, cv.height);
  for (const [vi, view] of (['front', 'back'] as const).entries()) {
    const fy = 40 + (vi + 1) * 76 * S - 8 * S;
    figure(RANGER(0, view), 20 + cellW / 2, fy, S, 9);
    KINDS.forEach((k, i) => figure(companionFrame(k, which, t, view), 20 + cellW * (i + 1.5), fy, S, 7));
  }
  label(`all six, ${which} at ${t}, ${S} times`, 10, 8);
  show();
}
else if (mode === 'contact') {
  // every one of them: its stand, its moving, the beats of its attack, from in front and behind; and its icon
  const S = Number(parts[1]) || 3;
  const A = COMP_ATTACK;
  const cols: [string, number, GameView][] = [
    ['stand', 0, 'front'], ['stand', 0, 'back'], ['walk', 0.25, 'front'], ['walk', 0.6, 'back'],
    ['attack', 0.27, 'front'], ['attack', A.strike + 1 / 30, 'front'], ['attack', A.hit, 'front'], ['attack', 0.5, 'front'], ['attack', A.hit, 'back'],
  ];
  const cellW = 50 * S;
  const cellH = 62 * S;
  cv.width = 20 + cellW * cols.length + 40 * S;
  cv.height = 40 + cellH * KINDS.length;
  g.fillStyle = '#1a1830';
  g.fillRect(0, 0, cv.width, cv.height);
  KINDS.forEach((k, r) => {
    cols.forEach(([which, t0, view], c) => {
      const t = which === 'walk' ? t0 * moveFrames(k) / 30 : t0;
      g.fillStyle = (r + c) % 2 ? '#22203a' : '#26243e';
      g.fillRect(10 + c * cellW, 30 + r * cellH, cellW - 2, cellH - 2);
      figure(companionFrame(k, which, t, view), 10 + c * cellW + cellW * 0.42, 30 + r * cellH + cellH * 0.86, S, 6);
      label(`${k} ${which} ${t.toFixed(2)} ${view}`, 12 + c * cellW, 32 + r * cellH, 1);
    });
    const ic = companionIcon(k);
    const icv = document.createElement('canvas');
    icv.width = 32;
    icv.height = 32;
    (icv.getContext('2d') as CanvasRenderingContext2D).putImageData(new ImageData(new Uint8ClampedArray(ic.d), 32, 32), 0, 0);
    g.fillStyle = '#14122a';
    g.fillRect(16 + cols.length * cellW, 40 + r * cellH, 32 * S, 32 * S);
    g.imageSmoothingEnabled = false;
    g.drawImage(icv, 16 + cols.length * cellW, 40 + r * cellH, 32 * S, 32 * S);
  });
  label(`the six: stand, moving, attack (held, striking, the blow, through), front and back; icons (${S} times)`, 10, 8);
  show();
}
void COMP_CANVAS;

// ---------------------------------------------------------------------------------------------
// THE SHEET AND THE FILM FOR HIM

const NAME: Record<Kind, string> = { hawk: 'Hawk', snake: 'Snake', wolf: 'Wolf', bat: 'Bat', fox: 'Fox', tortoise: 'Tortoise' };
const GROUP: Record<Kind, string> = { hawk: 'Hunting', snake: 'Hunting', wolf: 'Hunting', bat: 'Wild', fox: 'Wild', tortoise: 'Wild' };
const GIFT: Record<Kind, string> = {
  hawk: 'its talons mark the prey: your next hit a sure critical',
  snake: 'its bite poisons',
  wolf: 'its bite holds them in place',
  bat: 'its bite heals you',
  fox: 'its bite gives you a burst of speed',
  tortoise: 'it stays by you; its hits shield you',
};
const GOING: Record<Kind, string> = { hawk: 'flying', snake: 'slithering', wolf: 'loping', bat: 'flying', fox: 'darting', tortoise: 'trundling, slow and steady' };
function pane(x: number, y: number, w: number, h: number, c = '#211e3a'): void {
  g.fillStyle = c;
  g.fillRect(x, y, w, h);
}
/** Floor marks under a moving figure: a grid of little diamonds going by under it at its pace (its own lengths `slide`), seen from in front or behind. */
function floorMarks(fx: number, fy: number, S: number, view: GameView, slide: number, w: number): void {
  const GR = Math.sqrt(2 / 3);
  g.fillStyle = 'rgba(120,110,170,0.35)';
  const step = 16;
  for (let i = -8; i <= 8; i++) {
    for (let j = -3; j <= 3; j++) {
      const x = i * step - (((slide % step) + step) % step);
      const yy = j * step;
      const sx = GR * (x + yy);
      const sy = GR * 0.5 * (view === 'front' ? x - yy : yy - x);
      const px = fx + sx * S;
      const py = fy + sy * S;
      if (Math.abs(px - fx) > w / 2 || Math.abs(sy) > 26) continue;
      g.fillRect(Math.round(px) - S, Math.round(py), 2 * S, S);
    }
  }
}
function sheetOrFilm(): void {
  if (mode === 'sheet') {
    const S = 3;
    cv.width = 1200;
    cv.height = 1060;
    g.fillStyle = '#0d1030';
    g.fillRect(0, 0, cv.width, cv.height);
    label("THE RANGER'S COMPANIONS: the Hunting Companion (hawk, snake, wolf) and the Wild (bat, fox, tortoise)", 14, 10);
    label('standing, beside the Ranger, three times as big: from in front (above) and from behind (below)', 14, 32, 1.5);
    const cell = 1200 / 7;
    for (const [vi, view] of (['front', 'back'] as const).entries()) {
      const top = 56 + vi * 250;
      pane(6, top, 1188, 242);
      const fy = top + 214;
      figure(RANGER(0, view), cell * 0.5, fy, S, 9);
      KINDS.forEach((k, i) => figure(companionFrame(k, 'stand', 0.3, view), cell * (i + 1.42), fy, S, 7));
    }
    label('Ranger', cell * 0.5 - 30, 560);
    KINDS.forEach((k, i) => label(`${NAME[k]}`, cell * (i + 1.42) - 30, 560));
    KINDS.forEach((k, i) => label(`${GROUP[k]}`, cell * (i + 1.42) - 30, 580, 1));
    // at the game's size: the Ranger with the six about him
    label("at the game's size: the Ranger with all six about him (in the game he has two at most)", 14, 606, 1.5);
    pane(6, 628, 1188, 200, '#1a1830');
    const spots: [Kind | 'ranger', number, number, GameView][] = [
      ['ranger', 560, 760, 'front'], ['wolf', 470, 790, 'front'], ['fox', 650, 800, 'front'], ['tortoise', 620, 740, 'back'],
      ['snake', 420, 730, 'back'], ['hawk', 520, 700, 'front'], ['bat', 690, 690, 'back'],
    ];
    spots.sort((a, b) => a[2] - b[2]);
    for (const [k, x, y, view] of spots) figure(k === 'ranger' ? RANGER(0.4, view) : companionFrame(k, 'stand', 0.6, view), x, y, 1, k === 'ranger' ? 9 : 6);
    for (const [k, x, y, view] of [['wolf', 900, 790, 'back'], ['hawk', 1000, 720, 'back'], ['fox', 1080, 800, 'back']] as [Kind, number, number, GameView][]) figure(companionFrame(k, 'walk', 0.1, view), x, y, 1, 6);
    figure(spriteOf3(MOVES3.rrun, 0.1, 'back'), 980, 780, 1, 9);
    label('and going with him, from behind', 900, 640, 1);
    // the icons
    label('their icons (32 square, as the attack buttons are), four times as big', 14, 846, 1.5);
    KINDS.forEach((k, i) => {
      const ic = companionIcon(k);
      const icv = document.createElement('canvas');
      icv.width = 32;
      icv.height = 32;
      (icv.getContext('2d') as CanvasRenderingContext2D).putImageData(new ImageData(new Uint8ClampedArray(ic.d), 32, 32), 0, 0);
      const x = 30 + i * 195;
      pane(x - 6, 870, 140, 140, '#14122a');
      g.imageSmoothingEnabled = false;
      g.drawImage(icv, x, 876, 128, 128);
      label(NAME[k], x + 30, 1018, 1.5);
    });
    show();
    return;
  }
  // THE FILM: for each, standing, going, its attack, and its attack again at half speed; from in front and from behind, the Ranger beside it
  const W = 1200;
  const H = 676;
  const FPS = 30;
  const S = 3;
  cv.width = W;
  cv.height = H;
  type Seg = { k: Kind; what: 'stand' | 'walk' | 'wings' | 'attack' | 'slow' | 'title'; from: number; long: number };
  const segs: Seg[] = [{ k: 'hawk', what: 'title', from: 0, long: 2 }];
  let at = 2;
  for (const k of KINDS) {
    for (const [what, long] of [['stand', 0.9], ['walk', 1.6], ['wings', 2.2], ['attack', COMP_ATTACK.long + 0.5], ['slow', COMP_ATTACK.long * 2 + 0.4]] as const) {
      // (the wings close up, for the two that fly only: his words, 30 Oct, “They curve while flapping”)
      if (what === 'wings' && k !== 'hawk' && k !== 'bat') continue;
      segs.push({ k, what, from: at, long });
      at += long;
    }
  }
  const total = Math.round(at * FPS);
  const draw = (i: number): void => {
    const T = i / FPS;
    const seg = segs.find((sg) => T >= sg.from && T < sg.from + sg.long) ?? segs[segs.length - 1];
    const t = T - seg.from;
    g.fillStyle = '#0d1030';
    g.fillRect(0, 0, W, H);
    if (seg.what === 'title') {
      label("THE RANGER'S COMPANIONS", 360, 250, 4);
      label('each standing, going, its attack, and its attack again at half speed', 270, 330, 2);
      label('from in front (left) and from behind (right), the Ranger beside it for size', 250, 362, 2);
      return;
    }
    const k = seg.k;
    const head = seg.what === 'stand' ? 'standing' : seg.what === 'walk' ? GOING[k] : seg.what === 'wings' ? 'its wings in flight, close up, at half speed' : seg.what === 'attack' ? 'its attack' : k === 'snake' ? 'its bite again, close up, at half speed' : 'its attack again, at half speed';
    label(`THE ${NAME[k].toUpperCase()}  (the ${GROUP[k]} Companion): ${head}`, 16, 12, 2.5);
    label(GIFT[k], 16, 52, 2);
    for (const [vi, view] of (['front', 'back'] as const).entries()) {
      const px = 8 + vi * 596;
      pane(px, 88, 588, 580);
      label(view === 'front' ? 'from in front' : 'from behind', px + 10, 96, 1.5);
      const fy = 88 + 470;
      const rx = px + 130;
      const ax = px + 300;
      let sp: Sprite;
      let rs: Sprite;
      if (seg.what === 'wings') {
        // (close up: six times as big, its body in the middle of the pane, no Ranger)
        const n = moveFrames(k);
        const fi = Math.floor(t * FPS * 0.5) % n;
        figure(companionFrame(k, 'walk', fi / FPS, view), px + 294, 88 + 300 + (k === 'hawk' ? 31 : 27) * 6, 6, 0);
        continue;
      }
      if (seg.what === 'slow' && k === 'snake') {
        // (close up: five times as big, room for its strike)
        const tt = Math.min(COMP_ATTACK.long, Math.max(0, (t - 0.15) * 0.5));
        figure(companionFrame(k, 'attack', Math.round(tt * 30) / 30, view), px + 150, 88 + 400, 5, 9);
        continue;
      }
      if (seg.what === 'walk') {
        const n = moveFrames(k);
        const fi = Math.floor(t * FPS) % n;
        sp = companionFrame(k, 'walk', fi / FPS, view);
        rs = spriteOf3(MOVES3.rrun, t, view);
        floorMarks(ax, fy, S, view, groundOf(k) * t, 560);
      } else if (seg.what === 'stand') {
        const fps = moveFps(k, 'stand');
        sp = companionFrame(k, 'stand', (Math.floor(t * fps) % Math.round(COMP_STAND_P * fps)) / fps, view);
        rs = RANGER(t, view);
      } else {
        const slow = seg.what === 'slow' ? 0.5 : 1;
        const tt = Math.min(COMP_ATTACK.long, Math.max(0, (t - 0.15) * slow));
        sp = companionFrame(k, 'attack', Math.round(tt * 30) / 30, view);
        rs = RANGER(t, view);
      }
      figure(rs, rx, fy, S, 9);
      figure(sp, ax, fy, S, 7);
    }
  };
  win.__frames = total;
  win.__tickMs = 1000 / FPS;
  win.__frame = (i: number): string => {
    draw(i);
    return cv.toDataURL('image/png');
  };
  draw(Math.round(3 * FPS));
  show();
}
// (after everything above is set up)
if (mode === 'sheet' || mode === 'film') sheetOrFilm();

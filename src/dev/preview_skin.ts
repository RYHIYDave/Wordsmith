// Dev page: A HERO PAINTED OVER THE BONES (src/art/hero3_knight.ts), in the game's two views, for
// one move of the skeleton (src/art/moves3.ts). (What flies from a hero, the scarf's ends, is
// not in a painting: the game moves those. They are not shown.)
//   node tools/preview.mjs src/dev/preview_skin.ts shots/skin.png 1800 900 "strike:still:0,3,4,5,8:1.3:5"
//   node tools/page_gif.mjs src/dev/preview_skin.ts "strike:film::1.3:5" previews/skin_strike.gif
//   hash = <move>:<still | film | heads>:<moments, in frames of a thirtieth of a second>:<how big the head is, 1 = life>:<screen pixels to a picture pixel>
//     heads: one moment (the first given), with heads of 1, 1.15, 1.3, 1.45 and 1.6 times life
//     after all that, ?crop=x0,y0,x1,y1 shows only that box of the painter's canvas
import { paintMove3 } from '../art/heroes3';
import { MAGE_TAILS } from '../art/hero_mage';
import { RANGER_TAILS } from '../art/hero_ranger';
import { WARRIOR_TAILS } from '../art/hero_warrior';
import type { Painted } from '../art/kit';
import { Tails } from '../engine/tails';
import { MOVES3 } from '../art/moves3';
import { CANVAS3 } from '../art/skin';
import type { GameView } from '../art/skin';
import type { Build } from '../art/skeleton';

const raw = decodeURIComponent(location.hash.slice(1));
const [name = 'rear', mode = 'still', arg = '0', headArg = '1.3', scaleArg = '5'] = raw.split('?')[0].split(':');
const move = MOVES3[name] ?? MOVES3.rear;
const END = move.motion.keys[move.motion.keys.length - 1].at;
const FRAME = 1 / 30;
const S = Number(scaleArg) || 5;
const HEAD = Number(headArg) || 1.3;
/** The body of whoever makes the move, with a head `head` times life (their own is 1.3). */
function buildOf(_tall: number, head: number): Build {
  const b = move.build;
  const k = head / 1.3;
  return { ...b, headUp: b.headUp * k, headFwd: b.headFwd * k, headR: [b.headR[0] * k, b.headR[1] * k, b.headR[2] * k] };
}

/** Whose move it is: the one who holds what it is made with. */
const HERO = move.held === 'bow' ? 'ranger' : move.held === 'staff' ? 'mage' : 'knight';
const TAILS = HERO === 'ranger' ? RANGER_TAILS : HERO === 'mage' ? MAGE_TAILS : WARRIOR_TAILS;

/** `look=robes` in the address: the mage's other look, the one in long robes whom he set aside (art/hero3_mage.ts). */
const LOOK = new URLSearchParams(raw.split('?')[1] ?? '').get('look') ?? '';
/** One frame, painted as the game would paint it (art/heroes3.ts: the same function makes the game's own frames). */
function painted(build: Build, t: number, view: GameView): Painted {
  return paintMove3(move, t, view, LOOK === 'robes' ? { build, mage: 'robes' } : { build });
}

// (the part of the painter's canvas that is shown: `crop=x0,y0,x1,y1` in the address narrows it)
const CROP = (new URLSearchParams(raw.split('?')[1] ?? '').get('crop') ?? `0,0,${CANVAS3.w},${CANVAS3.h}`).split(',').map(Number);
const CX0 = CROP[0];
const CY0 = CROP[1];
const CW = CROP[2] - CROP[0];
const CH = CROP[3] - CROP[1];
const KAX = CANVAS3.ax - CX0;
const KAY = CANVAS3.ay - CY0;
const BG = '#17142e';
const PANEL = ['#262354', '#211e4b'];
const cv = document.createElement('canvas');
for (const el of [document.documentElement, document.body]) {
  el.style.height = 'auto';
  el.style.overflow = 'visible';
}
document.body.style.margin = '0';
document.body.style.background = BG;
cv.style.position = 'static';
cv.style.display = 'block';
document.body.appendChild(cv);
const PAD = 8;
const HEADING = 40;
const LABEL = 24;
/** Room over the figure for a leap: the game lifts the whole figure through the air (Move3.arc). */
const ROOM = move.arc ? move.arc.high : 0;
const liftAt = (t: number): number => (move.arc && t < move.arc.until ? Math.sin((t / move.arc.until) * Math.PI) * move.arc.high : 0);

/** One still of the figure in a pane, with the scarf's ends as they hang when he has stood so for a couple of seconds. */
function pane(g: CanvasRenderingContext2D, x: number, y: number, f: Painted, label: string, i: number): void {
  const pic = f.px.toCanvas();
  const scarf = new Tails(TAILS);
  const roots = (f.tails ?? []).map((r) => ({ ...r, x: r.x / 2, y: r.y / 2 }));
  for (let k = 0; k < 70; k++) scarf.step(FRAME, roots, CANVAS3.ax / 2, CANVAS3.ay / 2, 1, 0, 0);
  g.fillStyle = PANEL[i % 2];
  g.fillRect(x, y, CW * S, CH * S + LABEL);
  g.save();
  g.beginPath();
  g.rect(x, y, CW * S, CH * S + LABEL);
  g.clip();
  // the floor he stands on: the grid's lines through his feet
  g.strokeStyle = '#34306c';
  g.lineWidth = 1;
  for (const way of [1, -1]) {
    g.beginPath();
    g.moveTo(x + (KAX - 60) * S, y + LABEL + (KAY - 30 * way) * S);
    g.lineTo(x + (KAX + 60) * S, y + LABEL + (KAY + 30 * way) * S);
    g.stroke();
  }
  g.imageSmoothingEnabled = false;
  scarf.draw(g, x + KAX * S, y + LABEL + KAY * S, false, S * 2);
  g.drawImage(pic, CX0, CY0, CW, CH, x, y + LABEL, CW * S, CH * S);
  scarf.draw(g, x + KAX * S, y + LABEL + KAY * S, true, S * 2);
  g.restore();
  g.fillStyle = '#cfc8ff';
  g.font = '600 15px system-ui, sans-serif';
  g.textAlign = 'left';
  g.textBaseline = 'middle';
  g.fillText(label, x + 8, y + LABEL / 2 + 1);
}
function title(g: CanvasRenderingContext2D, text: string): void {
  g.fillStyle = '#ffd866';
  g.font = '700 18px system-ui, sans-serif';
  g.textAlign = 'left';
  g.textBaseline = 'middle';
  g.fillText(text, PAD + 4, PAD + HEADING / 2);
}
// (the two ways the game shows a hero. Nothing here says "in the game": these are pictures to look at,
// and the owner sees nothing go into the game before he has seen it.)
const LABELS: Record<'front' | 'back', string> = { front: 'Facing you', back: 'Facing away' };
// (`views=back,front` in the address chooses which are shown, and in what order)
const VIEWS: { view: GameView; label: string }[] = (new URLSearchParams(raw.split('?')[1] ?? '').get('views') ?? 'front,back').split(',').map((v) => (v === 'back' ? 'back' : 'front') as 'front' | 'back').map((view) => ({ view, label: LABELS[view] }));
const w = window as unknown as { __ready: boolean; __frames: number; __tickMs: number; __frame: (k: number) => string };
const times = (arg || '0').split(',').map((v) => Number(v) * FRAME);

if (mode === 'heads') {
  // three sizes of head to choose between, one above another: each seen facing you and facing away
  const heads: [number, string][] = [[1, 'A: head true to life'], [1.3, 'B: head a little bigger'], [1.6, 'C: head bigger still']];
  cv.width = PAD + VIEWS.length * (CW * S + PAD);
  cv.height = PAD + HEADING + heads.length * (CH * S + LABEL + PAD);
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.fillStyle = BG;
  g.fillRect(0, 0, cv.width, cv.height);
  title(g, `The ${HERO}, painted over the skeleton: which head?`);
  heads.forEach(([h, say], r) => {
    VIEWS.forEach(({ view }, c) => {
      pane(g, PAD + c * (CW * S + PAD), PAD + HEADING + r * (CH * S + LABEL + PAD), painted(buildOf(57, h), times[0], view), c === 0 ? say : view === 'back' ? 'facing away' : '', c + r);
    });
  });
} else if (mode === 'still') {
  cv.width = PAD + times.length * (CW * S + PAD);
  cv.height = PAD + HEADING + VIEWS.length * (CH * S + LABEL + PAD);
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.fillStyle = BG;
  g.fillRect(0, 0, cv.width, cv.height);
  title(g, `${move.name} · not in the game`);
  const build = buildOf(57, HEAD);
  times.forEach((t, c) => {
    VIEWS.forEach(({ view, label }, r) => {
      pane(g, PAD + c * (CW * S + PAD), PAD + HEADING + r * (CH * S + LABEL + PAD), painted(build, t, view), `frame ${Math.round((t / FRAME) * 10) / 10}, ${label}`, c + r);
    });
  });
} else {
  // (the film: the two views one above the other, which is what a phone held upright shows biggest)
  const paneH = (CH + ROOM) * S + LABEL;
  cv.width = PAD * 2 + CW * S;
  cv.height = PAD + HEADING + VIEWS.length * (paneH + PAD);
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  const build = buildOf(57, HEAD);
  const shots: [number, string][] = [];
  if (move.motion.loop !== undefined) {
    const from = move.motion.loop;
    const slow = END - from < 1 ? 4 : 1;
    if (slow > 1) for (let i = 0; i < Math.round((END - from) / FRAME) * slow; i++) shots.push([from + (i * FRAME) / slow, `slowed ${slow} times`]);
    for (let lap = 0; lap < (slow > 1 ? 5 : 2); lap++) for (let t = from; t < END - 1e-6; t += FRAME) shots.push([t, slow > 1 ? 'at full speed' : '']);
  } else {
    // (`slow=1` in the address: no slowed showing first, for a long thing that is not quick anyway; then it is played twice)
    const SLOW = Number(new URLSearchParams(raw.split('?')[1] ?? '').get('slow') ?? 4) || 4;
    if (SLOW > 1) {
      for (let i = 0; i < 10; i++) shots.push([0, `slowed ${SLOW} times`]);
      for (let i = 0; i <= Math.round(END / FRAME) * SLOW; i++) shots.push([(i * FRAME) / SLOW, `slowed ${SLOW} times`]);
      for (let i = 0; i < 10; i++) shots.push([END, `slowed ${SLOW} times`]);
    }
    for (let lap = 0; lap < (SLOW > 1 ? 3 : 2); lap++) {
      for (let i = 0; i <= Math.round(END / FRAME); i++) shots.push([i * FRAME, 'at full speed']);
      for (let i = 0; i < 14; i++) shots.push([END, 'at full speed']);
    }
  }
  // The scarf's two flying ends, moved as the game moves them (engine/tails.ts): one set for each
  // view. The film is asked for frame by frame, in order, so they carry on from each to the next.
  const flying = VIEWS.map(() => new Tails(TAILS));
  let was = -1;
  const show = (k: number): string => {
    const [t, note] = shots[Math.max(0, Math.min(shots.length - 1, k))];
    const prev = k > 0 ? shots[Math.min(shots.length - 1, k - 1)][0] : t;
    // (time that goes back, a new lap, lets them settle a moment instead)
    const dt = k === was + 1 && t > prev ? t - prev : FRAME / 2;
    was = k;
    g.fillStyle = BG;
    g.fillRect(0, 0, cv.width, cv.height);
    title(g, `${move.name} · not in the game`);
    const lift = liftAt(t);
    VIEWS.forEach(({ view, label }, i) => {
      const f = painted(build, t, view);
      const x = PAD;
      const y = PAD + HEADING + i * (paneH + PAD);
      g.fillStyle = PANEL[i % 2];
      g.fillRect(x, y, CW * S, paneH);
      const feetX = x + KAX * S;
      const floorY = y + LABEL + (ROOM + KAY) * S;
      const feetY = floorY - lift * S;
      g.save();
      g.beginPath();
      g.rect(x, y + LABEL, CW * S, (CH + ROOM) * S);
      g.clip();
      // the floor he stands on (the grid's lines through his place), and his shadow on it when he is in the air
      g.strokeStyle = '#34306c';
      g.lineWidth = 1;
      for (const way of [1, -1]) {
        g.beginPath();
        g.moveTo(feetX - 60 * S, floorY - 30 * way * S);
        g.lineTo(feetX + 60 * S, floorY + 30 * way * S);
        g.stroke();
      }
      if (lift > 0.5) {
        g.fillStyle = 'rgba(0, 0, 0, 0.3)';
        g.beginPath();
        g.ellipse(feetX, floorY, 10 * S, 5 * S, 0, 0, Math.PI * 2);
        g.fill();
      }
      flying[i].step(dt, (f.tails ?? []).map((r) => ({ ...r, x: r.x / 2, y: r.y / 2 })), CANVAS3.ax / 2, CANVAS3.ay / 2, 1, 0, -lift / 2);
      g.imageSmoothingEnabled = false;
      flying[i].draw(g, feetX, feetY, false, S * 2);
      g.drawImage(f.px.toCanvas(), CX0, CY0, CW, CH, x, y + LABEL + (ROOM - lift) * S, CW * S, CH * S);
      flying[i].draw(g, feetX, feetY, true, S * 2);
      g.restore();
      g.fillStyle = '#9a94c8';
      g.font = '600 14px system-ui, sans-serif';
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      g.fillText(label, x + 8, y + LABEL / 2 + 1);
    });
    g.fillStyle = '#fff3c4';
    g.font = '700 15px system-ui, sans-serif';
    g.textAlign = 'right';
    g.textBaseline = 'middle';
    g.fillText(note, cv.width - PAD - 6, PAD + HEADING / 2);
    return cv.toDataURL('image/png');
  };
  w.__frames = shots.length;
  w.__tickMs = 1000 * FRAME;
  w.__frame = show;
  show(0);
}
w.__ready = true;

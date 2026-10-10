// Dev page: THE HEROES AS THE GAME PLAYS THEM, for the review of their animations against the art
// rulebook (tools/review_heroes/; the art chat, 8 Oct 2026). The game's own rules move the hero and
// the game's own chooser picks each frame (tools/review_heroes/sim.ts); each frame is painted by the
// game's own painter (art/heroes3.ts, paintMove3) and stood on a floor that does not move, so that a
// foot that slides is seen to slide: a white ring where each foot came down, and a line to where it
// has got to while it stays down. The scarf's and the feather's flying ends go as the game moves them
// (but for a figure facing screen-left, which is drawn without them).
//   node tools/page_gif.mjs src/dev/preview_play.ts "3:1:warrior/quick attack, walking|ranger/quick attack, walking" previews/x.gif
//   hash = <screen pixels to a game pixel>:<slowed how many times>:[grip!][ranger!][mage!][slid<n>!]<class>/<scenario>[=<label>]|<class>/<scenario>...
import { paintMove3 } from '../art/heroes3';
import { useGrippingRuns, useMageStances, useRangerStances } from '../art/moves3';
import { CANVAS3 } from '../art/skin';
import { MAGE_TAILS } from '../art/hero_mage';
import { RANGER_TAILS } from '../art/hero_ranger';
import { WARRIOR_TAILS } from '../art/hero_warrior';
import { Tails } from '../engine/tails';
import { P } from '../art/palette';
import { RANGER_ARROW } from '../game/defs';
import { Fx, pline } from '../render/fx';
import type { ClassId } from '../game/types';
import { moveOf, place, play, scenariosOf } from '../../tools/review_heroes/sim';
import type { Shown } from '../../tools/review_heroes/sim';

// (the chooser mirrors the picture of a figure facing screen-left on a canvas of its own: the
// stand-ins it is handed are notes, not pictures, so the canvas keeps the note and draws nothing)
const drawImage0 = CanvasRenderingContext2D.prototype.drawImage;
CanvasRenderingContext2D.prototype.drawImage = function (this: CanvasRenderingContext2D, img: unknown, ...rest: number[]): void {
  if (typeof img === 'string') {
    (this.canvas as unknown as { src: string }).src = img;
    return;
  }
  (drawImage0 as (...a: unknown[]) => void).call(this, img, ...rest);
} as typeof drawImage0;

const HASH = decodeURIComponent(location.hash.slice(1)).split(':');
const [sArg = '3', slowArg = '1'] = HASH;
// (the list may have colons of its own, in what the panels are called)
const list0 = HASH.slice(2).join(':') || 'warrior/runs, seen from in front';
// (before the list, `grip!`: with the gripping runs, art/moves3.ts GRIP; `slid<n>!`: a foot is
// marked as slid once it has gone n game px from where it came down, where it is 1 otherwise)
let list = list0;
let GRIPPING = false;
let SLID = 1;
for (;;) {
  const m = list.match(/^(grip|ranger|mage|slid([0-9.]+))!/);
  if (!m) break;
  if (m[1] === 'grip') GRIPPING = true;
  else if (m[1] === 'ranger') useRangerStances(true);
  else if (m[1] === 'mage') useMageStances(true);
  else SLID = Number(m[2]);
  list = list.slice(m[0].length);
}
if (GRIPPING) useGrippingRuns(true);
const S = Number(sArg) || 3;
const SLOW = Number(slowArg) || 1;
const NAMES: Record<string, string> = { warrior: 'Warrior', ranger: 'Ranger', mage: 'Mage' };
interface Panel {
  cls: ClassId;
  name: string;
  shown: Shown[];
  /** The flying ends, and the last step they were moved on to. */
  tails: Tails;
  tailsAt: number;
  /** The game's effects (a Volley's arrows going up), fed what the game told of, step by step, and the last step fed. */
  fx: Fx;
  fxAt: number;
  x0: number;
  y0: number;
  w: number;
  h: number;
}
const panels: Panel[] = list.split('|').map((item) => {
  // (`<class>/<scenario>=<what it is called on the picture>`)
  const [what, label] = item.split('=');
  const [cls, name] = what.split('/') as [ClassId, string];
  const sc = scenariosOf(cls).find((s) => s.name === name);
  if (!sc) throw new Error(`no scenario "${name}" for ${cls}`);
  const shown = play(sc);
  // (and room for the game's own arrows for the first of their flight)
  const flying = shown.flatMap((s) => s.arrows.filter((a) => a.age < 0.3));
  const xs = [...shown.map((s) => s.x), ...flying.map((a) => a.x)];
  const ys = [...shown.map((s) => s.y - s.lift), ...flying.map((a) => a.y - 24)];
  const x0 = Math.min(...xs) - 34;
  const x1 = Math.max(...xs) + 34;
  const y0 = Math.min(...ys) - 50;
  const y1 = Math.max(...shown.map((s) => s.y)) + 10;
  const tails = new Tails(cls === 'ranger' ? RANGER_TAILS : cls === 'mage' ? MAGE_TAILS : WARRIOR_TAILS);
  return { cls, name: label ?? `${NAMES[cls]}: ${name}`, shown, tails, tailsAt: -1, fx: new Fx(), fxAt: -1, x0, y0, w: x1 - x0, h: y1 - y0 };
});
const PAD = 8;
const HEAD = 30;
// (one above another, as a phone held upright shows them biggest)
const W = PAD * 2 + Math.max(...panels.map((p) => Math.round(p.w * S)));
const H = HEAD + panels.reduce((a, p) => a + Math.round(p.h * S) + PAD, 0);
const cv = document.createElement('canvas');
cv.width = W;
cv.height = H;
for (const el of [document.documentElement, document.body]) {
  el.style.height = 'auto';
  el.style.overflow = 'visible';
}
document.body.style.margin = '0';
cv.style.display = 'block';
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
/** The game shows sixty steps a second; the film, thirty. */
const steps = Math.max(...panels.map((p) => p.shown.length));
const frames = Math.ceil(steps / 2);

function floor(p: Panel, ox: number, oy: number): void {
  // the grid of the floor's tiles (a tile is 32 by 16 game px), as the game lays it
  g.save();
  g.beginPath();
  g.rect(ox, oy, p.w * S, p.h * S);
  g.clip();
  g.fillStyle = '#1d1a40';
  g.fillRect(ox, oy, p.w * S, p.h * S);
  g.strokeStyle = '#2f2b66';
  g.lineWidth = 1;
  const at = (tx: number, ty: number): [number, number] => [ox + ((tx - ty) * 16 - p.x0) * S, oy + ((tx + ty) * 8 - p.y0) * S];
  for (let k = 0; k <= 60; k++) {
    for (const [a, b] of [[at(k, 0), at(k, 60)], [at(0, k), at(60, k)]]) {
      g.beginPath();
      g.moveTo(a[0], a[1]);
      g.lineTo(b[0], b[1]);
      g.stroke();
    }
  }
  g.restore();
}

function draw(k: number): string {
  g.fillStyle = '#17142e';
  g.fillRect(0, 0, W, H);
  g.fillStyle = '#ffd866';
  g.font = '700 15px system-ui, sans-serif';
  g.textBaseline = 'middle';
  g.fillText(SLOW > 1 ? `As the game plays it, slowed ${SLOW} times` : 'As the game plays it, at its own speed', PAD, HEAD / 2);
  const ox = PAD;
  let oy = HEAD;
  for (const p of panels) {
    floor(p, ox, oy);
    const i = Math.min(p.shown.length - 1, k * 2);
    // where each foot that is down came down: followed from the start to now
    const rings: { at: [number, number]; now: [number, number] }[] = [];
    const held: Record<string, { at: [number, number]; by: string } | null> = { L: null, R: null };
    for (let j = 0; j <= i; j++) {
      const pl = place(p.shown[j]);
      const jumped = j > 0 && Math.hypot(p.shown[j].x - p.shown[j - 1].x, p.shown[j].y - p.shown[j - 1].y) > 12;
      for (const side of ['L', 'R']) {
        const h = pl.holds[side];
        const by = String(pl.holds[`${side}by`] ?? '');
        if (!h) {
          held[side] = null;
          continue;
        }
        const was = held[side];
        if (!was || was.by !== by || jumped) held[side] = { at: h, by };
        if (j === i) rings.push({ at: (held[side] as { at: [number, number] }).at, now: h });
      }
    }
    const sh = p.shown[i];
    const f = paintMove3(moveOf(sh.key), sh.mt, sh.view);
    const pic = f.px.toCanvas();
    // (the flying ends moved on a step at a time, as the game moves them, up to this step)
    for (let j = p.tailsAt + 1; j <= i; j++) {
      const sj = p.shown[j];
      const fj = j === i ? f : paintMove3(moveOf(sj.key), sj.mt, sj.view);
      const roots = (fj.tails ?? []).map((r) => ({ ...r, x: r.x / 2, y: r.y / 2 }));
      if (j === 0) for (let w = 0; w < 60; w++) p.tails.step(1 / 60, roots, CANVAS3.ax / 2, CANVAS3.ay / 2, 1, sj.x, sj.y - sj.lift);
      p.tails.step(1 / 60, roots, CANVAS3.ax / 2, CANVAS3.ay / 2, 1, sj.x, sj.y - sj.lift);
    }
    p.tailsAt = Math.max(p.tailsAt, i);
    g.save();
    g.beginPath();
    g.rect(ox, oy, p.w * S, p.h * S);
    g.clip();
    g.imageSmoothingEnabled = false;
    const fx = ox + (sh.x - p.x0) * S;
    const fy = oy + (sh.y - sh.lift - p.y0) * S;
    // (the soft shadow under the figure, on the floor)
    g.fillStyle = 'rgba(0, 0, 0, 0.35)';
    g.beginPath();
    g.ellipse(ox + (sh.x - p.x0) * S, oy + (sh.y - p.y0) * S, 9 * S, 4.5 * S, 0, 0, Math.PI * 2);
    g.fill();
    if (!sh.left) p.tails.draw(g, fx, fy, false, S);
    g.save();
    g.translate(fx, fy);
    if (sh.left) g.scale(-1, 1);
    g.drawImage(pic, -(CANVAS3.ax / 2) * S, -(CANVAS3.ay / 2) * S, (CANVAS3.w / 2) * S, (CANVAS3.h / 2) * S);
    g.restore();
    if (!sh.left) p.tails.draw(g, fx, fy, true, S);
    g.restore();
    // THE GAME'S OWN ARROWS, as render/render.ts draws a hero's plain one (a shaft of light wood
    // and a pale steel head, and its shadow on the floor): from where RANGER_ARROW says, when on
    g.save();
    g.beginPath();
    g.rect(ox, oy, p.w * S, p.h * S);
    g.clip();
    for (const a of sh.arrows) {
      const lifted = RANGER_ARROW.on && !a.hostile;
      if (lifted && 0.4 + a.age * Math.hypot(a.vx, a.vy) < RANGER_ARROW.from) continue;
      const up = lifted ? Math.round(RANGER_ARROW.height) : 10;
      const dx = (a.vx - a.vy) * 16;
      const dy = (a.vx + a.vy) * 8;
      const len = Math.hypot(dx, dy) || 1;
      const body = lifted ? RANGER_ARROW.long : 6;
      g.save();
      g.translate(ox - p.x0 * S, oy - p.y0 * S);
      g.scale(S, S);
      pline(g, a.x - (dx / len) * body, a.y - up - (dy / len) * body, a.x, a.y - up, P.wd5);
      g.fillStyle = P.sl5;
      g.fillRect(Math.round(a.x), Math.round(a.y - up), 2, 2);
      g.fillStyle = P.black;
      g.globalAlpha = 0.35;
      g.fillRect(Math.round(a.x - 2), Math.round(a.y), 4, 1);
      g.restore();
    }
    // and the game's effects (a Volley's arrows), fed and moved on step by step up to this one
    for (let j = p.fxAt + 1; j <= i; j++) {
      p.fx.handle(p.shown[j].events, () => {});
      p.fx.update(1 / 60);
    }
    p.fxAt = Math.max(p.fxAt, i);
    g.translate(ox - p.x0 * S, oy - p.y0 * S);
    g.scale(S, S);
    p.fx.drawAir(g, { ox: 0, oy: 0 });
    g.restore();
    // the rings and the lines: where a foot came down, and where it has slid to
    g.save();
    g.lineWidth = 2;
    for (const r of rings) {
      const ax = ox + (r.at[0] - p.x0) * S;
      const ay = oy + (r.at[1] - p.y0) * S;
      const nx = ox + (r.now[0] - p.x0) * S;
      const ny = oy + (r.now[1] - p.y0) * S;
      const slid = Math.hypot(r.now[0] - r.at[0], r.now[1] - r.at[1]);
      g.strokeStyle = slid >= SLID ? '#ffd866' : '#ffffff';
      g.beginPath();
      g.arc(ax, ay, 2.2 * S, 0, Math.PI * 2);
      g.stroke();
      if (slid >= SLID) {
        g.beginPath();
        g.moveTo(ax, ay);
        g.lineTo(nx, ny);
        g.stroke();
      }
    }
    g.restore();
    g.fillStyle = '#cfc8ff';
    g.font = '600 14px system-ui, sans-serif';
    g.fillText(p.name, ox + 6, oy + 12);
    oy += Math.round(p.h * S) + PAD;
  }
  return cv.toDataURL('image/png');
}
const w = window as unknown as { __ready: boolean; __frames: number; __tickMs: number; __frame: (k: number) => string };
w.__frames = frames;
w.__tickMs = (1000 / 30) * SLOW;
w.__frame = draw;
draw(0);
w.__ready = true;

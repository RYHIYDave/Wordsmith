// THE NAME CARDS ACROSS THE SCREEN (behind BOSS_INTRO and FLOOR_NAMES in game/defs.ts, both on since
// the owner's yes to films of them, 21:49: "Yeah man looks awesome."). His words, 10 Oct 2026, 21:30: "The gate closes and the boss says
// a little line.  And the boss’s name shows up all stylized on the screen.  [...] when you enter the
// next dungeon it’s called something that relates to the boss or the location.  And that is also
// stylized with the actual level under that in smaller font"; his pick at 21:33, "A": every floor's
// own name, "Prison Level N" under it.
//
// THE BOSS'S NAME: in the enemy's colours (his rule: pink and gold glows are the enemy's), large,
// dropped in with a flash, a rule running out to either side of it with a diamond at its end; it
// goes as the boss begins to fight. THE FLOOR'S NAME: in the stone's pale violet, large, with its
// level under it in the small letters, spaced out, between two short rules; it fades in and out.
import { LINE_H, drawText, textWidth } from '../engine/font';
import { BOSS_INTRO } from '../game/defs';

export interface BossCard { name: string; t: number; secs: number }
export interface FloorCard { name: string; level: string; t: number; secs: number }

const ENEMY = { edge: '#ff4f8a', deep: '#7a1058', gold: '#ffd27a', light: '#fff0a0', ink: '#0d0716' };
const STONE = { edge: '#2a2466', face: '#ece8ff', under: '#b0a4e0', small: '#a3abd8', ink: '#07050a' };

const clamp = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const ease = (v: number): number => 1 - (1 - v) * (1 - v);

/** The largest whole scale at which `text` fits in `room` (at least 1). */
function fitScale(text: string, room: number, most: number): number {
  for (let s = most; s > 1; s--) if (textWidth(text) * s <= room) return s;
  return 1;
}

/** Text with an edge all round it: drawn in the edge's colour a pixel (a `scale`th of the letter) to every side, then itself. */
function edged(g: CanvasRenderingContext2D, text: string, x: number, y: number, scale: number, face: string, edge: string, shadow: string, lower?: string): void {
  const k = Math.max(1, Math.floor(scale / 2));
  drawText(g, text, x + k, y + 2 * k, shadow, { align: 'center', scale });
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]]) drawText(g, text, x + dx * k, y + dy * k, edge, { align: 'center', scale });
  drawText(g, text, x, y, face, { align: 'center', scale });
  if (!lower) return;
  // (the lower half of the letters in a second colour: a light falling on them from above)
  const h = LINE_H.normal * scale;
  g.save();
  g.beginPath();
  g.rect(0, y + Math.round(h * 0.55), g.canvas.width, h);
  g.clip();
  drawText(g, text, x, y, lower, { align: 'center', scale });
  g.restore();
}

/** A rule from `x0` to `x1` at `y`, a diamond at its far end. */
function rule(g: CanvasRenderingContext2D, x0: number, x1: number, y: number, color: string, tip: string): void {
  const a = Math.min(x0, x1);
  const b = Math.max(x0, x1);
  if (b - a < 2) return;
  g.fillStyle = color;
  g.fillRect(Math.round(a), Math.round(y), Math.round(b - a), 1);
  g.fillStyle = tip;
  const tx = Math.round(x1);
  const ty = Math.round(y);
  g.fillRect(tx - 1, ty - 1, 3, 3);
  g.fillRect(tx, ty - 2, 1, 5);
  g.fillRect(tx - 2, ty, 5, 1);
}

/** The boss's name across the screen. `t` from 0 to `secs`. */
export function drawBossCard(g: CanvasRenderingContext2D, card: BossCard, viewW: number, viewH: number): void {
  const name = /^the /i.test(card.name) ? card.name.toUpperCase() : `THE ${card.name.toUpperCase()}`;
  const scale = fitScale(name, viewW - 40, 3);
  const w = textWidth(name) * scale;
  const h = LINE_H.normal * scale;
  // (it comes once he has begun his line, and stays until he fights: low on the screen, clear of the
  // line over his head)
  const t = card.t - BOSS_INTRO.nameAt;
  const left = card.secs - card.t;
  if (t < 0) return;
  const a = left > 0.5 ? clamp(t / 0.12) : clamp(left / 0.5);
  if (a <= 0) return;
  const cx = Math.round(viewW / 2);
  // (dropped in: from a few pixels above, in the first tenth of a second and a half)
  const drop = Math.round((1 - ease(clamp(t / 0.15))) * -8);
  const y = Math.round(viewH * 0.62) + drop;
  g.globalAlpha = a;
  // a band of dark behind it, so that it reads over anything
  g.globalAlpha = a * 0.55;
  g.fillStyle = ENEMY.ink;
  g.fillRect(0, y - Math.round(h * 0.45), viewW, Math.round(h * 1.9));
  g.globalAlpha = a;
  // the rules run out to either side from the name's ends
  const out = ease(clamp((t - 0.08) / 0.45)) * Math.min(70, (viewW - w) / 2 - 12);
  const ry = y + Math.round(h / 2);
  rule(g, cx - w / 2 - 6, cx - w / 2 - 6 - out, ry, ENEMY.edge, ENEMY.gold);
  rule(g, cx + w / 2 + 6, cx + w / 2 + 6 + out, ry, ENEMY.edge, ENEMY.gold);
  // (a flash as it lands: the letters white for a moment)
  const flash = t < 0.2;
  edged(g, name, cx, y, scale, flash ? '#ffffff' : ENEMY.light, ENEMY.edge, ENEMY.deep, flash ? undefined : ENEMY.gold);
  g.globalAlpha = 1;
}

/** The floor's name, its level under it. `t` from 0 to `secs`. */
export function drawFloorCard(g: CanvasRenderingContext2D, card: FloorCard, viewW: number, viewH: number): void {
  const name = card.name.toUpperCase();
  const scale = fitScale(name, viewW - 32, 2);
  const h = LINE_H.normal * scale;
  const t = card.t;
  const a = t < card.secs - 0.8 ? clamp(t / 0.5) : clamp((card.secs - t) / 0.8);
  if (a <= 0) return;
  const cx = Math.round(viewW / 2);
  const y = Math.round(viewH * 0.2) + Math.round((1 - ease(clamp(t / 0.5))) * 4);
  g.globalAlpha = a;
  edged(g, name, cx, y, scale, STONE.face, STONE.edge, STONE.ink, STONE.under);
  // the level under it, its letters spaced out, between two short rules
  const level = card.level.toUpperCase();
  const gap = 2;
  const widths = [...level].map((ch) => (ch === ' ' ? 3 : textWidth(ch, 'small')));
  const lw = widths.reduce((n, v) => n + v, 0) + gap * (level.length - 1);
  let x = cx - Math.round(lw / 2);
  const ly = y + h + 5;
  [...level].forEach((ch, i) => {
    if (ch !== ' ') {
      drawText(g, ch, x + 1, ly + 1, STONE.ink, { font: 'small' });
      drawText(g, ch, x, ly, STONE.small, { font: 'small' });
    }
    x += widths[i] + gap;
  });
  const ry = ly + 2;
  rule(g, cx - lw / 2 - 5, cx - lw / 2 - 5 - 18, ry, STONE.under, STONE.face);
  rule(g, cx + lw / 2 + 5, cx + lw / 2 + 5 + 18, ry, STONE.under, STONE.face);
  g.globalAlpha = 1;
}

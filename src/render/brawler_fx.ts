// THE BRAWLER'S EFFECTS IN THE GAME (the main chat, 28 Oct 2026; game/brawler.ts, behind BRAWLER).
//
// What his punches throw off, after the art chat's (dev/brawler_fx.ts: every blow throws a ring of air and a crack of light
// off the fist, a streak behind a fist going in; the heavy ones kick the screen; the haymaker rolls a wave along the floor),
// laid where the rules say each lands; and the punches' NAMES floating over him as they land (his words of 24 Oct: “Maybe we
// can have the names of each punch float over the character”; to them, “Good for now”): a tap's small and quick, a hold's
// bigger, the haymaker's biggest of all. A FIRST PASS, TO BE SHOWN TO THE OWNER.

import type { GameEvent } from '../game/state';
import type { Game } from '../game/game';
import { drawText } from '../engine/font';
import { P } from '../art/palette';
import type { Cam } from './fx';
import { wx, wy } from './fx';

const CYAN = ['#0c6a80', '#22d0e0', '#b8fff8', '#e8ffff'];

interface Name { text: string; x: number; y: number; big: 0 | 1 | 2; t: number; n: number }
interface Ring { x: number; y: number; dx: number; dy: number; size: number; t: number }
interface Spot { x: number; y: number; t: number }
interface Trail { x0: number; y0: number; x1: number; y1: number; t: number }
interface Ball { id: number; dx: number; dy: number; t: number }

const LIFE = { name: [0.7, 0.9, 1.2], ring: 0.25, spot: 0.3, trail: 0.45, ball: 0.7 };
const LABEL: Record<string, string> = { jab: 'JAB', hook: 'HOOK', uppercut: 'UPPERCUT', cross: 'CROSS', 'body blow': 'BODY BLOW', overhand: 'OVERHAND', haymaker: 'HAYMAKER', counter: 'COUNTER' };

export class BrawlerFx {
  /** The game being drawn (a launched one's place is read off its monster). */
  game: Game | null = null;
  private names: Name[] = [];
  private rings: Ring[] = [];
  private bowled: Spot[] = [];
  private trails: Trail[] = [];
  private balls: Ball[] = [];

  handle(e: GameEvent): void {
    switch (e.t) {
      case 'punch': {
        // (its name, once a press: not again for Twin's second blow or the echo's)
        if (e.n === 0 && !e.echo) {
          // (a combo's names stack up as it goes: each new one a line above the last still showing)
          const up = this.names.filter((m) => m.t < 0.35).length;
          this.names.push({ text: LABEL[e.name] ?? e.name.toUpperCase(), x: e.x, y: e.y, big: e.big, t: 0, n: up });
        }
        const size = e.big === 2 ? 3 : e.big === 1 ? 2 : 1;
        this.rings.push({ x: e.x + e.dx * 1.1, y: e.y + e.dy * 1.1, dx: e.dx, dy: e.dy, size, t: 0 });
        break;
      }
      case 'cannonball':
        this.balls.push({ id: e.id, dx: e.dx, dy: e.dy, t: 0 });
        break;
      case 'bowled':
        this.bowled.push({ x: e.x, y: e.y, t: 0 });
        break;
      case 'slip':
        this.trails.push({ x0: e.x0, y0: e.y0, x1: e.x1, y1: e.y1, t: 0 });
        break;
      default:
        break;
    }
  }

  update(dt: number): void {
    const age = <T extends { t: number }>(list: T[], life: (x: T) => number): T[] => {
      for (const x of list) x.t += dt;
      return list.filter((x) => x.t < life(x));
    };
    this.names = age(this.names, (n) => LIFE.name[n.big]);
    this.rings = age(this.rings, () => LIFE.ring);
    this.bowled = age(this.bowled, () => LIFE.spot);
    this.trails = age(this.trails, () => LIFE.trail);
    this.balls = age(this.balls, () => LIFE.ball);
  }

  clear(): void {
    this.names = [];
    this.rings = [];
    this.bowled = [];
    this.trails = [];
    this.balls = [];
  }

  /** What is over everything: rings of air off his fists, the launched one's streak, the bowled, his after-images, the names. */
  drawAir(g: CanvasRenderingContext2D, c: Cam): void {
    // (his slip: after-images of him weaving low along the way he went, thinning)
    for (const tr of this.trails) {
      const k = tr.t / LIFE.trail;
      g.globalAlpha = Math.max(0, 0.7 * (1 - k));
      for (let i = 0; i <= 4; i++) {
        const u = i / 4;
        const x = Math.round(wx(c, tr.x0 + (tr.x1 - tr.x0) * u, tr.y0 + (tr.y1 - tr.y0) * u));
        const y = Math.round(wy(c, tr.x0 + (tr.x1 - tr.x0) * u, tr.y0 + (tr.y1 - tr.y0) * u) + Math.sin(u * Math.PI * 2) * 3);
        g.fillStyle = CYAN[i === 4 ? 2 : 1];
        g.fillRect(x - 3, y - 22, 6, 7);
        g.fillRect(x - 2, y - 26, 4, 4);
        g.fillRect(x - 4, y - 15, 8, 9);
      }
      g.globalAlpha = 1;
    }
    // (a ring of air off the fist as it lands, opening the way it went; a crack of light at its heart for a hold's)
    for (const r of this.rings) {
      const k = r.t / LIFE.ring;
      const x = wx(c, r.x, r.y);
      const y = wy(c, r.x, r.y) - 16;
      const sx = (r.dx - r.dy) * 16;
      const sy = (r.dx + r.dy) * 8 - 0;
      const ang = Math.atan2(sy, sx);
      const rad = (4 + 10 * k) * (0.7 + 0.4 * r.size);
      g.globalAlpha = 1 - k;
      g.strokeStyle = r.size > 1 ? CYAN[2] : P.white;
      g.lineWidth = r.size > 2 ? 2 : 1;
      g.beginPath();
      g.ellipse(Math.round(x), Math.round(y), rad * 0.55, rad, ang, -1.2, 1.2);
      g.stroke();
      if (r.size > 1 && k < 0.5) {
        g.fillStyle = CYAN[3];
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2 + 0.4;
          const l = (3 + r.size * 2) * (1 - k);
          g.fillRect(Math.round(x + Math.cos(a) * l), Math.round(y + Math.sin(a) * l * 0.7), 1, 1);
        }
      }
      g.globalAlpha = 1;
    }
    // (the one launched: speed lines streaming behind it as it flies)
    const game = this.game;
    if (game) {
      for (const b of this.balls) {
        const m = game.monsters.find((q) => q.id === b.id);
        if (!m) continue;
        const x = wx(c, m.x, m.y);
        const y = wy(c, m.x, m.y) - 14;
        const sx = (b.dx - b.dy) * 16;
        const sy = (b.dx + b.dy) * 8;
        const l = Math.hypot(sx, sy) || 1;
        g.globalAlpha = 1 - b.t / LIFE.ball;
        g.strokeStyle = CYAN[2];
        g.lineWidth = 1;
        for (const off of [-6, -2, 2, 6]) {
          const ox = (-sy / l) * off;
          const oy = (sx / l) * off;
          g.beginPath();
          g.moveTo(Math.round(x + ox - (sx / l) * 6), Math.round(y + oy - (sy / l) * 6));
          g.lineTo(Math.round(x + ox - (sx / l) * (18 + Math.abs(off) * 2)), Math.round(y + oy - (sy / l) * (18 + Math.abs(off) * 2)));
          g.stroke();
        }
        g.globalAlpha = 1;
      }
    }
    for (const b of this.bowled) {
      const k = b.t / LIFE.spot;
      g.globalAlpha = 1 - k;
      g.strokeStyle = P.white;
      g.beginPath();
      g.ellipse(Math.round(wx(c, b.x, b.y)), Math.round(wy(c, b.x, b.y) - 12), 4 + 10 * k, 3 + 6 * k, 0, 0, Math.PI * 2);
      g.stroke();
      g.globalAlpha = 1;
    }
    // (the names: rising off over him, a tap's small and quick, a hold's bigger, the haymaker's biggest)
    for (const n of this.names) {
      const life = LIFE.name[n.big];
      const k = n.t / life;
      const pop = Math.min(1, n.t / 0.06);
      const x = Math.round(wx(c, n.x, n.y));
      const y = Math.round(wy(c, n.x, n.y) - 52 - n.n * 10 - k * (n.big === 2 ? 8 : 14));
      g.globalAlpha = Math.max(0, Math.min(1, (1 - k) * 2.5)) * pop;
      const color = n.big === 2 ? CYAN[3] : n.big === 1 ? CYAN[2] : P.white;
      drawText(g, n.text, x, y, color, { align: 'center', font: n.big === 0 ? 'small' : 'normal', scale: n.big === 2 ? 2 : 1, shadow: P.ink });
      g.globalAlpha = 1;
    }
  }
}

// THE BRAWLER'S EFFECTS IN THE GAME (the main chat, 28 Oct 2026; game/brawler.ts, behind BRAWLER).
//
// What his punches throw off, after the art chat's (dev/brawler_fx.ts: every blow throws a ring of air and a crack of light
// off the fist, a streak behind a fist going in; the heavy ones kick the screen; the haymaker rolls a wave along the floor),
// laid where the rules say each lands; and the punches' NAMES floating over him as they land (his words of 24 Oct: “Maybe we
// can have the names of each punch float over the character”; to them, “Good for now”): a tap's small and quick, a hold's
// bigger, the haymaker's biggest of all. A FIRST PASS, TO BE SHOWN TO THE OWNER.
//
// HIS TREE'S (game/talents.ts BRAWLER_TREE), as modest as can be, to be filmed and shown to him before any goes live: one his
// Big Uppercut throws up is drawn up in the air (render.ts asks liftOf), and comes down in a puff of dust, dazed (a few
// specks of white going round over its head while it is stunned); KNOCKOUT over one knocked out; drops of blood off what his
// body blows have set bleeding; a ring where a knocked-back one is knocked into another; Shockwave's wave of air, a ring of it
// going on ahead; while Iron Chin holds, a glint of the friend's cyan on the floor either side of him; Set-Up ready, specks of
// cyan at his fists; his slip ready again (Bob and Weave), a ring of cyan at his feet; Slip Reflex's slip, SLIP over him.

import type { GameEvent, Monster } from '../game/state';
import type { Game } from '../game/game';
import { BRAWL_TUNE } from '../game/brawler';
import { drawText } from '../engine/font';
import { P } from '../art/palette';
import { FIGURE_SIZE, figureOf } from '../art/bestiary';
import { DUST } from '../dev/brawler_fx';
import type { Cam } from './fx';
import { wx, wy } from './fx';

const CYAN = ['#0c6a80', '#22d0e0', '#b8fff8', '#e8ffff'];

interface Name { text: string; x: number; y: number; big: 0 | 1 | 2; t: number; n: number }
interface Ring { x: number; y: number; dx: number; dy: number; size: number; t: number }
interface Spot { x: number; y: number; t: number }
interface Trail { x0: number; y0: number; x1: number; y1: number; t: number }
interface Ball { id: number; dx: number; dy: number; t: number }
interface Wave { x: number; y: number; dx: number; dy: number; far: number; speed: number; t: number }

const LIFE = { name: [0.7, 0.9, 1.2], ring: 0.25, spot: 0.3, trail: 0.45, ball: 0.7, dust: 0.4, ready: 0.35 };
const LABEL: Record<string, string> = { jab: 'JAB', hook: 'HOOK', uppercut: 'UPPERCUT', cross: 'CROSS', 'body blow': 'BODY BLOW', overhand: 'OVERHAND', haymaker: 'HAYMAKER', counter: 'COUNTER' };
/** How high a monster's head is over its feet (pixels). */
const headOf = (m: Monster): number => FIGURE_SIZE[figureOf(m)]?.top ?? 28;

export class BrawlerFx {
  /** The game being drawn (a launched one's place is read off its monster). */
  game: Game | null = null;
  private names: Name[] = [];
  private rings: Ring[] = [];
  private bowled: Spot[] = [];
  private trails: Trail[] = [];
  private balls: Ball[] = [];
  // (his tree's)
  private dust: Spot[] = [];
  private ready: Spot[] = [];
  private waves: Wave[] = [];
  /** Those his uppercut has dazed (it came down, or a boss was knocked silly), drawn so while they are stunned. */
  private dazed = new Set<number>();
  private clock = 0;

  /** (Big Uppercut) How far up off the floor `m` is drawn (pixels): one his uppercut has thrown up. */
  liftOf(m: Monster): number {
    const game = this.game;
    return game ? Math.round(game.upOf(m) * BRAWL_TUNE.talents.bigUppercut.high) : 0;
  }

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
      // (his tree's)
      case 'comeDown':
        this.dust.push({ x: e.x, y: e.y, t: 0 });
        this.dazed.add(e.id);
        break;
      case 'knockout':
        if (e.boss) this.dazed.add(e.id);
        else this.names.push({ text: 'KNOCKOUT', x: e.x, y: e.y, big: 2, t: 0, n: 0 });
        break;
      case 'pinball':
        this.bowled.push({ x: e.x, y: e.y, t: 0 });
        break;
      case 'shockwave':
        this.waves.push({ x: e.x, y: e.y, dx: e.dx, dy: e.dy, far: e.far, speed: e.speed, t: 0 });
        break;
      case 'slipReady':
        this.ready.push({ x: e.x, y: e.y, t: 0 });
        break;
      case 'slipReflex':
        this.names.push({ text: 'SLIP', x: e.x, y: e.y, big: 0, t: 0, n: this.names.filter((m) => m.t < 0.35).length });
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
    this.dust = age(this.dust, () => LIFE.dust);
    this.ready = age(this.ready, () => LIFE.ready);
    this.waves = age(this.waves, (w) => w.far / Math.max(1, w.speed) + 0.15);
    this.clock += dt;
    const game = this.game;
    for (const id of [...this.dazed]) {
      const m = game ? game.monsters.find((q) => q.id === id) : undefined;
      if (!m || m.dead || m.stunT <= 0) this.dazed.delete(id);
    }
  }

  clear(): void {
    this.names = [];
    this.rings = [];
    this.bowled = [];
    this.trails = [];
    this.balls = [];
    this.dust = [];
    this.ready = [];
    this.waves = [];
    this.dazed.clear();
  }

  /** HIS TREE'S, on the floor and on those he has struck: under the names, over everything else (drawAir calls it). */
  private drawTree(g: CanvasRenderingContext2D, c: Cam): void {
    const game = this.game;
    // (Big Uppercut: the puff of dust it comes down in)
    for (const d of this.dust) {
      const k = d.t / LIFE.dust;
      const x = Math.round(wx(c, d.x, d.y));
      const y = Math.round(wy(c, d.x, d.y));
      g.globalAlpha = 1 - k;
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        const l = 5 + 12 * k;
        g.fillStyle = DUST[i % DUST.length];
        g.fillRect(Math.round(x + Math.cos(a) * l), Math.round(y + Math.sin(a) * l * 0.5 - k * 3), 2, 1);
      }
      g.globalAlpha = 1;
    }
    // (Shockwave: a ring of air going on ahead, the way he punched, with a line of air behind it)
    for (const w of this.waves) {
      const gone = Math.min(w.far, w.t * w.speed);
      const k = Math.max(0, w.t * w.speed - w.far) / (0.15 * w.speed);
      const cx = w.x + w.dx * gone;
      const cy = w.y + w.dy * gone;
      const x = wx(c, cx, cy);
      const y = wy(c, cx, cy) - 10;
      const sx = (w.dx - w.dy) * 16;
      const sy = (w.dx + w.dy) * 8;
      const ang = Math.atan2(sy, sx);
      g.globalAlpha = Math.max(0, 0.9 * (1 - k));
      g.strokeStyle = P.white;
      g.lineWidth = 1;
      g.beginPath();
      g.ellipse(Math.round(x), Math.round(y), 5, 12, ang, -1.3, 1.3);
      g.stroke();
      g.strokeStyle = CYAN[2];
      g.beginPath();
      g.ellipse(Math.round(x - Math.cos(ang) * 3), Math.round(y - Math.sin(ang) * 3), 4, 10, ang, -1.2, 1.2);
      g.stroke();
      g.globalAlpha = Math.max(0, 0.35 * (1 - k));
      g.beginPath();
      g.moveTo(Math.round(wx(c, w.x + w.dx * 0.6, w.y + w.dy * 0.6)), Math.round(wy(c, w.x + w.dx * 0.6, w.y + w.dy * 0.6) - 10));
      g.lineTo(Math.round(x), Math.round(y));
      g.stroke();
      g.globalAlpha = 1;
    }
    // (his slip ready again: a ring of cyan opening at his feet)
    for (const r of this.ready) {
      const k = r.t / LIFE.ready;
      g.globalAlpha = 1 - k;
      g.strokeStyle = CYAN[2];
      g.lineWidth = 1;
      g.beginPath();
      g.ellipse(Math.round(wx(c, r.x, r.y)), Math.round(wy(c, r.x, r.y)), 6 + 10 * k, 3 + 5 * k, 0, 0, Math.PI * 2);
      g.stroke();
      g.globalAlpha = 1;
    }
    if (!game) return;
    const h = game.hero;
    if (h.cls !== 'brawler') return;
    const hx = wx(c, h.x, h.y);
    const hy = wy(c, h.x, h.y);
    // (Iron Chin, while he winds up a hold: a glint of cyan on the floor either side of him, never over him)
    if (h.windup && h.windup.skill === 1 && game.has('ironchin')) {
      g.globalAlpha = 0.55 + 0.25 * Math.sin(this.clock * 30);
      g.strokeStyle = CYAN[1];
      g.lineWidth = 1;
      for (const a0 of [0, Math.PI]) {
        g.beginPath();
        g.ellipse(Math.round(hx), Math.round(hy), 13, 6, 0, a0 - 0.7, a0 + 0.7);
        g.stroke();
      }
      g.globalAlpha = 1;
    }
    // (Set-Up ready: specks of cyan flickering at his fists)
    if (game.brawl.setUp) {
      g.fillStyle = CYAN[3];
      for (let i = 0; i < 4; i++) {
        if (Math.floor(this.clock * 12 + i * 1.7) % 3 === 0) continue;
        const side = i % 2 ? 1 : -1;
        g.fillRect(Math.round(hx + side * (8 + (i >> 1) * 2)), Math.round(hy - 18 - (i >> 1) * 3), 1, 1);
      }
    }
    for (const m of game.monsters) {
      if (m.dead || !m.seen) continue;
      const mx = wx(c, m.x, m.y);
      const my = wy(c, m.x, m.y) - this.liftOf(m);
      const top = headOf(m);
      // (Bleeders: drops of blood falling off what bleeds, two at a time)
      if ((m.bleedT ?? 0) > 0) {
        g.fillStyle = P.bl3;
        for (let i = 0; i < 2; i++) {
          const u = (this.clock * 1.4 + i * 0.5 + m.id * 0.37) % 1;
          g.globalAlpha = 1 - u * 0.6;
          g.fillRect(Math.round(mx + (i ? 3 : -4)), Math.round(my - top * 0.55 + u * top * 0.5), 1, 2);
        }
        g.globalAlpha = 1;
      }
      // (dazed by his uppercut: three specks of white going round over its head while it is stunned)
      if (this.dazed.has(m.id) && m.stunT > 0) {
        g.fillStyle = P.white;
        for (let i = 0; i < 3; i++) {
          const a = this.clock * 6 + (i / 3) * Math.PI * 2;
          g.fillRect(Math.round(mx + Math.cos(a) * 6), Math.round(my - top - 4 + Math.sin(a) * 2), 1, 1);
        }
      }
    }
  }

  /** What is over everything: rings of air off his fists, the launched one's streak, the bowled, his after-images, the names. */
  drawAir(g: CanvasRenderingContext2D, c: Cam): void {
    this.drawTree(g, c);
    // (his slip: a streak of the friend's cyan low along the way he weaved, thinning; his after-images are the renderer's)
    for (const tr of this.trails) {
      const k = tr.t / LIFE.trail;
      g.globalAlpha = Math.max(0, 0.6 * (1 - k));
      g.strokeStyle = CYAN[1];
      g.lineWidth = 1;
      g.beginPath();
      for (let i = 0; i <= 12; i++) {
        const u = i / 12;
        const x = wx(c, tr.x0 + (tr.x1 - tr.x0) * u, tr.y0 + (tr.y1 - tr.y0) * u);
        const y = wy(c, tr.x0 + (tr.x1 - tr.x0) * u, tr.y0 + (tr.y1 - tr.y0) * u) - 6 + Math.sin(u * Math.PI * 3) * 3;
        if (i === 0) g.moveTo(Math.round(x), Math.round(y));
        else g.lineTo(Math.round(x), Math.round(y));
      }
      g.stroke();
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

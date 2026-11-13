// SET 1 IN PLAY: HOW THE BATTLE AXE'S AND THE WARHAMMER'S UNIQUES LOOK AT WORK (game/uniques.ts SET1_DEFS; their rules game/game.ts
// “UNIQUE ITEMS, SET 1”). Made by the main chat, 12 Nov 2026, at his word: “just do number 1, get it all finished, screw what chat
// its supposed to go to”.
//
// BEHIND SET1_LOOK, OFF until his yes to their pictures (PICTURES FIRST): off, nothing here is drawn or ticked, and each shows as
// the build's plain stand-in (a burst, a spark) as the rules tell of it. On, told of the rules' moments (`{ t: 'unique', id,
// what }`) and asked for what stands in the world each frame:
//
//   GYRE         his axe spinning where its flight ended is the game's own spinning axe (render/render.ts, a thrown axe that
//                does not move); under it, wind streaming round on the floor as far as it cuts; as it falls, a puff of dust
//   RED TITHE    the blood of one that died bleeding thrown in an arc to the one it lands on, drops trailing it, a splash there
//   WIDOWFALL    the game's own whirling cut all round him (the stand-in is its look)
//   DEATH KNELL  over each enemy ringing, the rings of a struck bell going out from it, pale bronze, again and again until it is
//                still; as one peals, a great ring of the bell's sound going out over the floor, the shock
//   DEADWEIGHT   at his feet, the weight he carries: so many iron studs round him on the floor, one for each Smash in a row;
//                the fifth's Earthquake is the game's own
//   STARBREAKER  the meteor: seen high up as he begins his Earthquake, falling with its fire streaming off it, its shadow growing
//                on the floor where it will land, until it strikes as the hammer comes down: a flash, the ground thrown up,
//                rocks flying; the floor burning after is the game's own fire. With Tremors, a flare of its fire with each shake.

import { drawGlow } from '../engine/px';
import type { Game } from '../game/game';
import type { GameEvent } from '../game/state';
import { UNIQUE_TUNE } from '../game/uniques';
import type { Cam } from './fx';
import { wx, wy } from './fx';

/**
 * The switch. Off: nothing here is drawn, ticked or read, and the six show as the build's stand-ins. ON at his yes, 13 Nov 2026,
 * shown these looks in a film on his page Set 1 Uniques: “Yes, put them live (Recommended)”.
 */
export const SET1_LOOK = { on: true };

/** Their colours: the meteor's fire (its rock is Starbreaker's head's), blood, the bell's bronze sound, wind, iron. */
export const SET1_COLORS = {
  rock: ['#1c1824', '#322a3a', '#544658'],
  fire: ['#7a1a06', '#d04810', '#ff8a2a', '#ffd27a', '#fff4d6'],
  blood: ['#6a0a16', '#b01c2c', '#e8444e'],
  bell: ['#7a5a2a', '#c8a46a', '#f2e4c2'],
  wind: ['#9aa6c8', '#d4dcf0'],
  iron: ['#16141e', '#3a3848', '#7a788a'],
} as const;

/** The meteor: how high over its spot it is first seen (game pixels) and how far to the right; its size; how long its strike shows. */
export const METEOR = { high: 230, right: 80, size: 11, trail: 10, strike: 0.55, rocks: 11 } as const;

const TX = 22.6;
const TY = 11.3;

interface Fall {
  x: number;
  y: number;
  t: number;
  dur: number;
}
interface Strike {
  x: number;
  y: number;
  r: number;
  t: number;
  big: boolean;
}
interface Blood {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  t: number;
  dur: number;
}
interface Ring {
  x: number;
  y: number;
  r: number;
  t: number;
}

/** A small deterministic scatter (0 to 1) for its rocks and drops. */
const hash = (i: number, k: number): number => {
  const s = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

export class Set1Fx {
  game: Game | null = null;
  private falls: Fall[] = [];
  private strikes: Strike[] = [];
  private bloods: Blood[] = [];
  private splashes: Ring[] = [];
  private peals: Ring[] = [];
  private dusts: Ring[] = [];
  private clock = 0;
  /** The stand-ins the rules tell next, to be left out (their spots). */
  private standIns: { t: string; x: number; y: number }[] = [];

  clear(): void {
    this.falls = [];
    this.strikes = [];
    this.bloods = [];
    this.splashes = [];
    this.peals = [];
    this.dusts = [];
    this.standIns = [];
  }

  /** An event of the game's: the moments its pictures hang on. */
  handle(e: GameEvent): void {
    if (!SET1_LOOK.on || e.t !== 'unique') return;
    if (e.id === 'starbreaker') {
      if (e.what === 'fall') this.falls.push({ x: e.x, y: e.y, t: 0, dur: Math.max(0.2, e.secs ?? 0.6) });
      else if (e.what === 'land' || e.what === 'shake') {
        this.falls = this.falls.filter((f) => Math.hypot(f.x - e.x, f.y - e.y) > 0.6);
        this.strikes.push({ x: e.x, y: e.y, r: e.r ?? 1.6, t: 0, big: e.what === 'land' });
        this.standIns.push({ t: 'burst', x: e.x, y: e.y });
      }
    } else if (e.id === 'redtithe' && e.what === 'throw') {
      this.bloods.push({ x0: e.x, y0: e.y, x1: e.x1 ?? e.x, y1: e.y1 ?? e.y, t: 0, dur: Math.max(0.1, e.secs ?? 0.25) });
    } else if (e.id === 'deathknell' && e.what === 'peal') {
      this.peals.push({ x: e.x, y: e.y, r: e.r ?? 2.6, t: 0 });
      this.standIns.push({ t: 'burst', x: e.x, y: e.y });
    } else if (e.id === 'gyre' && e.what === 'fall') {
      this.dusts.push({ x: e.x, y: e.y, r: 0.6, t: 0 });
      this.standIns.push({ t: 'spark', x: e.x, y: e.y });
    }
  }

  /** Is this the build's plain stand-in for one of the moments drawn here (told just after it, at its spot)? Then it is left out. */
  owns(e: GameEvent): boolean {
    if (!SET1_LOOK.on || (e.t !== 'burst' && e.t !== 'spark')) return false;
    const k = this.standIns.findIndex((s) => s.t === e.t && Math.abs(s.x - e.x) < 1e-6 && Math.abs(s.y - e.y) < 1e-6);
    if (k < 0) return false;
    this.standIns.splice(k, 1);
    return true;
  }

  update(dt: number): void {
    if (!SET1_LOOK.on) return;
    this.clock += dt;
    this.standIns = [];
    for (const f of this.falls) f.t += dt;
    this.falls = this.falls.filter((f) => f.t < f.dur + 0.3);
    for (const s of this.strikes) s.t += dt;
    this.strikes = this.strikes.filter((s) => s.t < METEOR.strike);
    for (const b of this.bloods) {
      b.t += dt;
      if (b.t >= b.dur && b.t - dt < b.dur) this.splashes.push({ x: b.x1, y: b.y1, r: 0.5, t: 0 });
    }
    this.bloods = this.bloods.filter((b) => b.t < b.dur);
    for (const r of [...this.splashes, ...this.peals, ...this.dusts]) r.t += dt;
    this.splashes = this.splashes.filter((r) => r.t < 0.4);
    this.peals = this.peals.filter((r) => r.t < 0.5);
    this.dusts = this.dusts.filter((r) => r.t < 0.5);
  }

  /** On the floor, under everything that stands: the meteor's shadow, the axe's wind, the weight at his feet, the peal's ring. */
  drawGround(g: CanvasRenderingContext2D, cam: Cam): void {
    if (!SET1_LOOK.on) return;
    const game = this.game;
    // STARBREAKER: the shadow of what is falling, growing and darkening as it comes
    for (const f of this.falls) {
      const k = Math.min(1, f.t / f.dur);
      g.globalAlpha = 0.25 + 0.4 * k;
      g.fillStyle = '#000000';
      g.beginPath();
      g.ellipse(Math.round(wx(cam, f.x, f.y)), Math.round(wy(cam, f.x, f.y)), (0.4 + 0.9 * k) * TX * 0.5, (0.4 + 0.9 * k) * TY * 0.5, 0, 0, Math.PI * 2);
      g.fill();
      g.globalAlpha = 1;
    }
    if (game) {
      // GYRE: wind streaming round each spinning axe, as far as it cuts
      const G = UNIQUE_TUNE.gyre;
      for (const p of game.projectiles) {
        if (!p.gyre || p.hostile) continue;
        const cx = wx(cam, p.x, p.y);
        const cy = wy(cam, p.x, p.y);
        const fade = Math.min(1, p.gyre.t / 0.4);
        for (let k = 0; k < 3; k++) {
          const a0 = -this.clock * 9 + (k * Math.PI * 2) / 3;
          for (let s = 0; s < 10; s++) {
            const a = a0 + s * 0.09;
            const rr = 0.75 + 0.25 * (s / 10);
            g.globalAlpha = (0.55 - s * 0.045) * fade;
            g.fillStyle = s < 3 ? SET1_COLORS.wind[1] : SET1_COLORS.wind[0];
            g.fillRect(Math.round(cx + Math.cos(a) * G.r * TX * rr), Math.round(cy + Math.sin(a) * G.r * TY * rr), 2, 1);
          }
        }
        g.globalAlpha = 1;
      }
      // DEADWEIGHT: an iron stud on the floor round his feet for each Smash in a row
      const n = game.wears('deadweight') ? game.uq.weight : 0;
      if (n > 0) {
        const h = game.hero;
        const cx = wx(cam, h.x, h.y);
        const cy = wy(cam, h.x, h.y);
        for (let k = 0; k < n; k++) {
          const a = Math.PI / 2 + (k - (n - 1) / 2) * 0.55;
          const x = Math.round(cx + Math.cos(a) * 13);
          const y = Math.round(cy + Math.sin(a) * 6.5);
          g.fillStyle = SET1_COLORS.iron[0];
          g.fillRect(x - 2, y - 1, 4, 3);
          g.fillStyle = SET1_COLORS.iron[2];
          g.fillRect(x - 1, y - 1, 2, 1);
        }
      }
    }
    // DEATH KNELL: a peal's shock, a great ring going out over the floor
    for (const r of this.peals) {
      const k = r.t / 0.5;
      g.globalAlpha = 0.95 * (1 - k);
      g.strokeStyle = SET1_COLORS.bell[2];
      g.lineWidth = 3;
      g.beginPath();
      g.ellipse(Math.round(wx(cam, r.x, r.y)), Math.round(wy(cam, r.x, r.y)), r.r * TX * (0.3 + 0.7 * k), r.r * TY * (0.3 + 0.7 * k), 0, 0, Math.PI * 2);
      g.stroke();
      g.strokeStyle = SET1_COLORS.bell[0];
      g.lineWidth = 1;
      g.beginPath();
      g.ellipse(Math.round(wx(cam, r.x, r.y)), Math.round(wy(cam, r.x, r.y)), r.r * TX * (0.2 + 0.6 * k), r.r * TY * (0.2 + 0.6 * k), 0, 0, Math.PI * 2);
      g.stroke();
      g.globalAlpha = 1;
    }
    // STARBREAKER: where it struck, the ground thrown up in a ring
    for (const s of this.strikes) {
      const k = s.t / METEOR.strike;
      g.globalAlpha = 0.7 * (1 - k);
      g.strokeStyle = s.big ? SET1_COLORS.fire[2] : SET1_COLORS.fire[1];
      g.lineWidth = s.big ? 2 : 1;
      g.beginPath();
      g.ellipse(Math.round(wx(cam, s.x, s.y)), Math.round(wy(cam, s.x, s.y)), s.r * TX * (0.4 + 0.8 * k), s.r * TY * (0.4 + 0.8 * k), 0, 0, Math.PI * 2);
      g.stroke();
      g.globalAlpha = 1;
    }
  }

  /** In the air, over everything: the meteor and its strike, the blood thrown, the bells' rings, the axe's dust. */
  drawAir(g: CanvasRenderingContext2D, cam: Cam): void {
    if (!SET1_LOOK.on) return;
    const F = SET1_COLORS.fire;
    // STARBREAKER: the meteor falling, its fire streaming back up the way it came
    for (const f of this.falls) {
      const k = Math.min(1, f.t / f.dur);
      const e = k * k;
      const gx = wx(cam, f.x, f.y);
      const gy = wy(cam, f.x, f.y);
      const at = (q: number): [number, number] => [gx + METEOR.right * (1 - q), gy - 6 - METEOR.high * (1 - q)];
      for (let i = METEOR.trail; i >= 1; i--) {
        const q = Math.max(0, e - i * 0.03);
        const [x, y] = at(q);
        const s = Math.max(2, Math.round(METEOR.size * 1.1 * (1 - i / (METEOR.trail + 2))));
        g.globalAlpha = 0.85 * (1 - i / (METEOR.trail + 1));
        g.fillStyle = i < 3 ? F[3] : i < 5 ? F[2] : F[1];
        g.fillRect(Math.round(x - s / 2), Math.round(y - s / 2), s, s);
      }
      g.globalAlpha = 1;
      const [x, y] = at(e);
      drawGlow(g, x, y, 26 + 14 * k, F[2], 0.65);
      // the rock: its corners knocked off, dark, lit along its leading edge (lower left, the way it falls) by its own fire
      const S = METEOR.size;
      const x0 = Math.round(x - S / 2);
      const y0 = Math.round(y - S / 2);
      g.fillStyle = SET1_COLORS.rock[0];
      g.fillRect(x0 + 2, y0, S - 4, S);
      g.fillRect(x0, y0 + 2, S, S - 4);
      g.fillRect(x0 + 1, y0 + 1, S - 2, S - 2);
      g.fillStyle = SET1_COLORS.rock[1];
      g.fillRect(x0 + 3, y0 + 2, S - 6, 3);
      g.fillStyle = SET1_COLORS.rock[2];
      g.fillRect(x0 + 4, y0 + 2, 3, 1);
      g.fillStyle = F[2];
      g.fillRect(x0, y0 + 3, 2, S - 5);
      g.fillRect(x0 + 2, y0 + S - 2, S - 5, 2);
      g.fillStyle = F[3];
      g.fillRect(x0 + 1, y0 + S - 3, 3, 2);
      g.fillStyle = F[4];
      g.fillRect(x0 + 1, y0 + S - 2, 1, 1);
    }
    // STARBREAKER: its strike, a flash and rocks thrown up
    for (const s of this.strikes) {
      const k = s.t / METEOR.strike;
      const gx = wx(cam, s.x, s.y);
      const gy = wy(cam, s.x, s.y);
      drawGlow(g, gx, gy - 6, (s.big ? 46 : 26) * (0.6 + 0.6 * k), F[2], (s.big ? 0.9 : 0.5) * (1 - k));
      if (k < 0.2 && s.big) drawGlow(g, gx, gy - 6, 22, F[4], 1 - k * 5);
      const n = s.big ? METEOR.rocks : 4;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + hash(i, 1);
        const v = 40 + 50 * hash(i, 2);
        const up = 70 + 60 * hash(i, 3);
        const t = s.t;
        const x = gx + Math.cos(a) * v * t;
        const y = gy - 4 + Math.sin(a) * v * t * 0.5 - up * t + 260 * t * t;
        g.globalAlpha = 1 - k;
        g.fillStyle = i % 3 === 0 ? F[2] : SET1_COLORS.rock[1];
        g.fillRect(Math.round(x), Math.round(y), 2, 2);
      }
      g.globalAlpha = 1;
    }
    // RED TITHE: the blood thrown in an arc, drops trailing it
    for (const b of this.bloods) {
      const k = Math.min(1, b.t / b.dur);
      const x0 = wx(cam, b.x0, b.y0);
      const y0 = wy(cam, b.x0, b.y0) - 10;
      const x1 = wx(cam, b.x1, b.y1);
      const y1 = wy(cam, b.x1, b.y1) - 10;
      const lift = 18 + Math.hypot(x1 - x0, y1 - y0) * 0.25;
      for (let i = 0; i < 6; i++) {
        const q = Math.max(0, k - i * 0.05);
        const x = x0 + (x1 - x0) * q;
        const y = y0 + (y1 - y0) * q - lift * 4 * q * (1 - q);
        const s = i === 0 ? 4 : i < 3 ? 3 : 2;
        g.fillStyle = SET1_COLORS.blood[i === 0 ? 2 : i < 3 ? 1 : 0];
        g.fillRect(Math.round(x - s / 2), Math.round(y - s / 2), s, s);
      }
    }
    for (const r of this.splashes) {
      const k = r.t / 0.4;
      const x = wx(cam, r.x, r.y);
      const y = wy(cam, r.x, r.y) - 10;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        g.globalAlpha = 1 - k;
        g.fillStyle = SET1_COLORS.blood[i % 2 ? 1 : 2];
        g.fillRect(Math.round(x + Math.cos(a) * 12 * k), Math.round(y + Math.sin(a) * 6 * k + 10 * k * k), 3, 3);
      }
      g.globalAlpha = 1;
    }
    // DEATH KNELL: the rings of a struck bell going out from each enemy still ringing
    const game = this.game;
    if (game && game.wears('deathknell')) {
      const B = SET1_COLORS.bell;
      for (const m of game.monsters) {
        const left = m.knellT ?? 0;
        if (m.dead || left <= 0) continue;
        const cx = wx(cam, m.x, m.y);
        const cy = wy(cam, m.x, m.y) - 14;
        const strong = Math.min(1, left / 1.2);
        for (let w = 0; w < 2; w++) {
          const k = (this.clock * 1.6 + w * 0.5) % 1;
          g.globalAlpha = 0.95 * (1 - k) * strong;
          g.strokeStyle = w ? B[1] : B[2];
          g.lineWidth = w ? 1 : 2;
          g.beginPath();
          g.ellipse(Math.round(cx), Math.round(cy), 5 + 12 * k, 3 + 6 * k, 0, Math.PI * 1.05, Math.PI * 1.95);
          g.stroke();
          g.beginPath();
          g.ellipse(Math.round(cx), Math.round(cy), 5 + 12 * k, 3 + 6 * k, 0, Math.PI * 0.05, Math.PI * 0.95);
          g.stroke();
        }
        g.globalAlpha = 1;
      }
    }
    // GYRE: the dust it throws up as it falls
    for (const r of this.dusts) {
      const k = r.t / 0.5;
      const x = wx(cam, r.x, r.y);
      const y = wy(cam, r.x, r.y);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + 0.3;
        g.globalAlpha = 0.7 * (1 - k);
        g.fillStyle = SET1_COLORS.wind[i % 2];
        g.fillRect(Math.round(x + Math.cos(a) * 12 * k), Math.round(y + Math.sin(a) * 6 * k - 4 * k), 2, 2);
      }
      g.globalAlpha = 1;
    }
  }
}

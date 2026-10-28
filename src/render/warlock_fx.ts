// THE WARLOCK'S EFFECTS IN THE GAME (the main chat, 28 Oct 2026; game/warlock.ts, behind WARLOCK).
//
// What his moves throw off, made of the art chat's own pieces (src/dev/warlock_fx.ts, demon_fx.ts: his hellfire's shape,
// the burn licking up a figure, the cursed one's smoke and embers, the smoke's clouds, a burst of flecks, cracks, holes torn
// in the floor and the jets out of them), laid out where the rules say things happen rather than on a film's stage. Each
// piece is painted once at the picture's grain and kept; what moves (a chain, a ring) is drawn line by line each frame.
//
// A FIRST PASS, TO BE SHOWN TO THE OWNER: the art chat's films have more in them than this (the chains' links, the rakes'
// streaks off each talon, the comet of the demon's step); each will be put closer to its film as he looks at it.
//
//   hellbolt in flight     his fire laid on its side, the way it flies
//   hellOn                 a burst of his fire where the bolt bites
//   burning (hellT)        tongues of his cyan fire licking up the one burning, flaring with each bite
//   curse                  chains of black smoke whipping out from his claw to each it curses, a brand at each tip
//   cursed (curseT)        black smoke seeping up off the cursed one, cyan embers in it
//   spread                 its burns leaping in arcs from the one that died to the others
//   smoke                  a river of black smoke along the floor where he went, puffs billowing up off it, thinning
//   damning                under each it strikes: the floor cracking open, a hole torn in it, a jet of its fire
//   roar                   the demon formed: a ring thrown out over the floor
//   change                 embers whirling up round him

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { drawSprite } from '../engine/px';
import type { GameEvent, Projectile } from '../game/state';
import type { Game } from '../game/game';
import { Light, SMOKE, burn, burst, cloud, fire, smolder } from '../dev/warlock_fx';
import { HELL } from '../dev/sculpt_warlock';
import { STUFF, crackStar, drawCrack, drawHole, jet } from '../dev/demon_fx';
import type { Cam } from './fx';
import { wx, wy } from './fx';

/** Picture pixels to a game pixel (the heroes' grain). */
const G = 2;
const hash = (i: number): number => {
  const x = Math.sin(i * 61.7 + 7.3) * 43758.5453;
  return x - Math.floor(x);
};

/** A piece painted on a canvas of its own, its anchor at (`ax`, `ay`) picture pixels: kept as a sprite at the grain. */
function piece(w: number, h: number, ax: number, ay: number, paint: (fl: Light, sm: Light, dk: Light) => void): Sprite {
  const px = new Px(w, h);
  const fl = new Light();
  const sm = new Light();
  const dk = new Light();
  paint(fl, sm, dk);
  dk.lay(px, STUFF);
  sm.lay(px, SMOKE);
  fl.lay(px, HELL);
  return px.sprite(ax, ay, G);
}

/** Pieces painted when first wanted. */
const kept = new Map<string, Sprite[]>();
function loop(key: string, n: number, make: (i: number) => Sprite): Sprite[] {
  let list = kept.get(key);
  if (!list) {
    list = Array.from({ length: n }, (_, i) => make(i));
    kept.set(key, list);
  }
  return list;
}

/** THE BURN on a figure about a man's size (the art chat's TARGET_BOX, a cultist), round and round. */
const BURN_LOOP = 1.6;
const burnFrames = (): Sprite[] => loop('burn', 16, (i) => piece(96, 140, 48, 120, (fl) => burn(fl, 48, 120, 36, 62, (i / 16) * BURN_LOOP, 1)));
/** THE CURSED ONE'S SMOKE, round and round. */
const smolderFrames = (): Sprite[] => loop('smolder', 16, (i) => piece(96, 150, 48, 128, (fl, sm) => smolder(fl, sm, 48, 128, 36, 62, (i / 16) * BURN_LOOP, 1, 3)));
/** THE BOLT, its fire on its side, leaning back off the way it flies (left or right on the screen). */
const boltFrames = (lean: number): Sprite[] => loop(`bolt${lean}`, 6, (i) => piece(60, 60, 30, 34, (fl) => fire(fl, 30, 34, 3.4, i * 0.07, lean)));
/** A BURST of his fire's flecks, fading. */
const burstFrames = (): Sprite[] => loop('burst', 8, (i) => piece(64, 50, 32, 25, (fl) => burst(fl, 32, 25, 14, i / 8, 7)));
/** A BALL of his fire, as a burn leaps. */
const ballFrames = (): Sprite[] => loop('ball', 4, (i) => piece(40, 44, 20, 30, (fl) => fire(fl, 20, 30, 2.4, i * 0.09, 0)));
/** A PUFF of black smoke. */
const puffFrames = (): Sprite[] => loop('puff', 6, (i) => piece(60, 46, 30, 40, (_fl, sm) => cloud(sm, 30, 40, 26, 22, i * 0.17, 0.15, 11 + i)));
/** THE GROUND ERUPTING (Damning): the floor cracking open in a star, a hole torn in it, a jet of fire out of it, dying. */
const ERUPT = 0.9;
const eruptFrames = (): Sprite[] =>
  loop('erupt', 24, (i) => {
    const u = i / 23;
    return piece(140, 150, 70, 110, (fl, _sm, dk) => {
      const S = (p: readonly [number, number, number] | number[]): [number, number] => [70 + p[0], 110 + p[1] * 0.5];
      const heat = u < 0.15 ? 3 : u < 0.5 ? 3 - (u - 0.15) * 3 : Math.max(0, 1.95 - (u - 0.5) * 4);
      for (const c of crackStar(0, 0, 6, 34, 6, 5)) drawCrack(dk, fl, c, Math.min(1, u * 5), heat, S);
      drawHole(dk, fl, 0, 0, 9, heat, 5, S);
      const size = u < 0.1 ? u * 60 : Math.max(0, 6 * (1 - (u - 0.1) / 0.6));
      jet(fl, 70, 110, size, u * ERUPT, 0, 112);
    });
  });

interface Chain { x: number; y: number; to: { id: number; x: number; y: number }[]; t: number }
interface River { x0: number; y0: number; x1: number; y1: number; t: number; demon: boolean }
interface Leap { x0: number; y0: number; x1: number; y1: number; t: number }
interface Spot { x: number; y: number; t: number }
interface Ring { x: number; y: number; r: number; t: number }

/** How long each lasts (seconds). */
const CHAIN = { reach: 0.33, hold: 0.6, gone: 0.87 };
const RIVER = 1.1;
const LEAP = 0.42;
const BURST = 0.3;
const RING = 0.55;
const EMBERS = 1.6;

export class WarlockFx {
  /** The game being drawn (the burning and the cursed are read off its monsters; a chain leaves the hero's claw). */
  game: Game | null = null;
  private t = 0;
  private chains: Chain[] = [];
  private rivers: River[] = [];
  private leaps: Leap[] = [];
  private bursts: Spot[] = [];
  private erupts: Spot[] = [];
  private rings: Ring[] = [];
  private embers: Spot[] = [];

  handle(e: GameEvent): void {
    switch (e.t) {
      case 'hellOn':
        this.bursts.push({ x: e.x, y: e.y, t: 0 });
        break;
      case 'curse':
        if (!e.echo || e.to.length) this.chains.push({ x: e.x, y: e.y, to: [...e.to], t: 0 });
        break;
      case 'spread':
        for (const o of e.to) this.leaps.push({ x0: e.x, y0: e.y, x1: o.x, y1: o.y, t: 0 });
        break;
      case 'smoke':
        this.rivers.push({ x0: e.x0, y0: e.y0, x1: e.x1, y1: e.y1, t: 0, demon: e.demon });
        break;
      case 'damning':
        for (const a of e.at) this.erupts.push({ x: a.x, y: a.y, t: 0 });
        break;
      case 'roar':
        this.rings.push({ x: e.x, y: e.y, r: e.r, t: 0 });
        break;
      case 'change':
        this.embers.push({ x: e.x, y: e.y, t: 0 });
        break;
      default:
        break;
    }
  }

  update(dt: number): void {
    this.t += dt;
    const age = <T extends { t: number }>(list: T[], life: number): T[] => {
      for (const x of list) x.t += dt;
      return list.filter((x) => x.t < life);
    };
    this.chains = age(this.chains, CHAIN.gone);
    this.rivers = age(this.rivers, RIVER);
    this.leaps = age(this.leaps, LEAP);
    this.bursts = age(this.bursts, BURST);
    this.erupts = age(this.erupts, ERUPT);
    this.rings = age(this.rings, RING);
    this.embers = age(this.embers, EMBERS);
  }

  clear(): void {
    this.chains = [];
    this.rivers = [];
    this.leaps = [];
    this.bursts = [];
    this.erupts = [];
    this.rings = [];
    this.embers = [];
  }

  /** What lies on the floor: the smoke steps' rivers, the ground torn open. */
  drawGround(g: CanvasRenderingContext2D, c: Cam): void {
    const puffs = puffFrames();
    for (const r of this.rivers) {
      const k = r.t / RIVER;
      const len = Math.hypot(r.x1 - r.x0, r.y1 - r.y0);
      const n = Math.max(2, Math.round(len * (r.demon ? 3 : 2.2)));
      g.globalAlpha = Math.max(0, 1 - k * k);
      for (let i = 0; i <= n; i++) {
        const u = i / n;
        // (it lies where he went, rolling on the way he went; puffs billowing up off it as it thins)
        const x = r.x0 + (r.x1 - r.x0) * u + Math.sin(i * 1.7 + this.t * 3) * 0.08;
        const y = r.y0 + (r.y1 - r.y0) * u + Math.cos(i * 1.3 + this.t * 3) * 0.08;
        const rise = k * (10 + 8 * hash(i * 3)) * (hash(i) < 0.5 ? 1 : 0.4);
        const s = puffs[(i + Math.floor(this.t * 8)) % puffs.length];
        drawSprite(g, s, Math.round(wx(c, x, y)), Math.round(wy(c, x, y) - rise));
      }
      g.globalAlpha = 1;
    }
    const er = eruptFrames();
    for (const e of this.erupts) drawSprite(g, er[Math.min(er.length - 1, Math.floor((e.t / ERUPT) * er.length))], Math.round(wx(c, e.x, e.y)), Math.round(wy(c, e.x, e.y)));
    for (const r of this.rings) {
      const k = r.t / RING;
      g.globalAlpha = 1 - k;
      g.strokeStyle = HELL[k < 0.4 ? 2 : 1];
      g.lineWidth = 1;
      g.beginPath();
      g.ellipse(wx(c, r.x, r.y), wy(c, r.x, r.y), r.r * 16 * (0.3 + k), r.r * 8 * (0.3 + k), 0, 0, Math.PI * 2);
      g.stroke();
      g.globalAlpha = 1;
    }
  }

  /** What is over everything: the burning and the cursed, the chains, the bolt's burst, the burns leaping, embers. */
  drawAir(g: CanvasRenderingContext2D, c: Cam): void {
    const game = this.game;
    if (game) {
      const bf = burnFrames();
      const sf = smolderFrames();
      for (const m of game.monsters) {
        if (m.dead) continue;
        const x = Math.round(wx(c, m.x, m.y));
        const y = Math.round(wy(c, m.x, m.y));
        if ((m.curseT ?? 0) > 0) drawSprite(g, sf[Math.floor(((this.t + m.id * 0.37) / BURN_LOOP) * sf.length) % sf.length], x, y);
        if ((m.hellT ?? 0) > 0) drawSprite(g, bf[Math.floor(((this.t + m.id * 0.53) / BURN_LOOP) * bf.length) % bf.length], x, y);
      }
    }
    // the chains of black smoke, whipping out and slack, snapped taut as he hauls back, burning away to smoke
    for (const ch of this.chains) {
      const hx = wx(c, ch.x, ch.y);
      const hy = wy(c, ch.x, ch.y) - 20;
      const out = Math.min(1, ch.t / CHAIN.reach);
      const fade = ch.t > CHAIN.hold ? 1 - (ch.t - CHAIN.hold) / (CHAIN.gone - CHAIN.hold) : 1;
      const slack = ch.t < CHAIN.reach ? 1 : Math.max(0, 1 - (ch.t - CHAIN.reach) / 0.15);
      ch.to.forEach((o, j) => {
        const tx = wx(c, o.x, o.y);
        const ty = wy(c, o.x, o.y) - 16;
        const dx = tx - hx;
        const dy = ty - hy;
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;
        const links = Math.max(4, Math.round((len * out) / 3));
        g.globalAlpha = Math.max(0, fade);
        for (let i = 0; i <= links; i++) {
          const u = (i / links) * out;
          const wave = Math.sin(u * 9 - this.t * 14 + j) * 5 * slack * Math.sin(Math.PI * u);
          const x = Math.round(hx + dx * u + nx * wave);
          const y = Math.round(hy + dy * u + ny * wave + Math.sin(Math.PI * u) * 6 * slack);
          g.fillStyle = SMOKE[i % 2 === 0 ? 0 : 1];
          g.fillRect(x - 1, y - 1, 2, 2);
          if (hash(i * 7 + j) < 0.3) {
            g.fillStyle = SMOKE[2];
            g.fillRect(x, y - 2, 1, 1);
          }
        }
        // (a hot cyan brand at its tip)
        if (out >= 1) {
          const bx = Math.round(hx + dx);
          const by = Math.round(hy + dy);
          g.fillStyle = HELL[2];
          g.fillRect(bx - 1, by - 1, 3, 3);
          g.fillStyle = HELL[3];
          g.fillRect(bx, by, 1, 1);
        }
        g.globalAlpha = 1;
      });
    }
    const bu = burstFrames();
    for (const b of this.bursts) drawSprite(g, bu[Math.min(bu.length - 1, Math.floor((b.t / BURST) * bu.length))], Math.round(wx(c, b.x, b.y)), Math.round(wy(c, b.x, b.y) - 14));
    const ball = ballFrames();
    for (const l of this.leaps) {
      const k = l.t / LEAP;
      const x = l.x0 + (l.x1 - l.x0) * k;
      const y = l.y0 + (l.y1 - l.y0) * k;
      const up = Math.sin(Math.PI * k) * 26 + 14;
      drawSprite(g, ball[Math.floor(this.t * 20) % ball.length], Math.round(wx(c, x, y)), Math.round(wy(c, x, y) - up));
    }
    // embers whirling up round him as he changes
    for (const e of this.embers) {
      const k = e.t / EMBERS;
      for (let i = 0; i < 14; i++) {
        const a = hash(i) * Math.PI * 2 + e.t * (2 + hash(i * 3) * 2);
        const r = 6 + 10 * hash(i * 5) + k * 8;
        const up = ((e.t * (16 + 14 * hash(i * 7)) + hash(i * 11) * 30) % 46);
        const x = Math.round(wx(c, e.x, e.y) + Math.cos(a) * r);
        const y = Math.round(wy(c, e.x, e.y) - up + Math.sin(a) * r * 0.4);
        g.fillStyle = HELL[up < 20 ? 2 : 1];
        g.globalAlpha = 1 - k;
        g.fillRect(x, y, 1, 2);
      }
      g.globalAlpha = 1;
    }
  }

  /** HIS BOLT in flight: his fire laid on its side, leaning back off the way it flies. */
  drawBolt(g: CanvasRenderingContext2D, c: Cam, p: Projectile): void {
    const sdx = (p.vx - p.vy) * 16;
    const lean = sdx >= 0 ? -1 : 1;
    const fr = boltFrames(lean);
    drawSprite(g, fr[Math.floor(this.t * 20) % fr.length], Math.round(wx(c, p.x, p.y)), Math.round(wy(c, p.x, p.y) - 14));
  }
}


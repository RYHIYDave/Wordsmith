// THE TINKERER'S EFFECTS IN THE GAME (the main chat, 28 Oct 2026; game/tinkerer.ts, behind TINKERER).
//
// What her moves and her minions throw off, made of the art chat's own pieces (src/dev/contraption_fx.ts: her vials, their
// bursts, the thud of a thing coming down, the lamp lit; blast_fx.ts: her bomb, its scorch and its chips; golem_pound_fx.ts:
// the Golem's steam and its shockwave; golem_gun_fx.ts: its cannon's flash, shot and hit; golem_down_fx.ts: sparks and
// gears; demon_fx.ts: the floor's cracks), laid out where the rules say things happen. Each piece painted once at the
// picture's grain and kept.
//
// A FIRST PASS, TO BE SHOWN TO THE OWNER.
//
//   contraption       a thud of dust where it comes down; its lamp's ring as it is lit
//   vial              her vial lobbed high, tumbling, from its mouth to where it comes down; its mouth's flash
//   vialBurst         glass flying, her brew splashed and fizzing, its vapour rising
//   contraptionEnd    yellow sparks off its brass as it falls apart
//   golemArrive       a great burst of steam and a ring of dust as it drops in
//   golemPunch        cyan shards bursting where its fist meets
//   golemShot         its cannon's flash, the shot streaking, its hit bursting
//   golemPound        the floor cracked in a star round its fist, its heart's cyan in the cracks; a ring of steam and dust
//                     racing out; steam bursting up
//   golemDown         sparks and gears as it winds down
//   blastJump         her bomb going off: its flash and fireball, chips flung, a scorch left glowing and cooling; puffs of
//                     its smoke along the way she flew
//   blastLand         a thud of dust where she comes down

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { drawSprite } from '../engine/px';
import type { GameEvent } from '../game/state';
import { Light, SMOKE, cloud } from '../dev/warlock_fx';
import { BREW, CAP, VAPOUR, lampRing, thud, vialBurst, vialSprite } from '../dev/contraption_fx';
import { CHIP, SCORCH, blast, chips, scorch } from '../dev/blast_fx';
import { HEART, STEAM, burstSteam, shock } from '../dev/golem_pound_fx';
import { GUN_GLOW, IRON, impactBurst, muzzleFlash } from '../dev/golem_gun_fx';
import { GEARS, SPARKS, gears, sparks } from '../dev/golem_down_fx';
import { STUFF, crackStar, drawCrack } from '../dev/demon_fx';
import type { Cam } from './fx';
import { wx, wy } from './fx';

/** Picture pixels to a game pixel (the heroes' grain). */
const G = 2;

type Lay = [Light, readonly string[]];
/** A piece painted on a canvas of its own, its anchor at (`ax`, `ay`) picture pixels: its lights laid in the order given. */
function piece(w: number, h: number, ax: number, ay: number, lights: number, ramps: readonly (readonly string[])[], paint: (l: Light[]) => void): Sprite {
  const px = new Px(w, h);
  const ls = Array.from({ length: lights }, () => new Light());
  paint(ls);
  const order: Lay[] = ls.map((l, i) => [l, ramps[i]]);
  for (const [l, r] of order) l.lay(px, r);
  return px.sprite(ax, ay, G);
}
const kept = new Map<string, Sprite[]>();
function loop(key: string, n: number, make: (i: number) => Sprite): Sprite[] {
  let list = kept.get(key);
  if (!list) {
    list = Array.from({ length: n }, (_, i) => make(i));
    kept.set(key, list);
  }
  return list;
}

/** HER VIAL, turned in eighths of a turn as it tumbles. */
const vialFrames = (): Sprite[] => loop('vial', 8, (i) => piece(16, 16, 8, 8, 2, [CAP, BREW], ([cap, brew]) => vialSprite(brew, cap, 8, 8, (i / 8) * Math.PI * 2)));
/** A VIAL BURSTING, frame by frame (30 a second). */
const BURST_N = 18;
const burstFrames = (): Sprite[] => loop('vburst', BURST_N, (k) => piece(84, 64, 42, 46, 2, [VAPOUR, BREW], ([va, l]) => vialBurst(l, va, 42, 40, 46, k, k / 30, 5)));
/** A THUD of dust. */
const thudFrames = (): Sprite[] => loop('thud', 14, (k) => piece(60, 30, 30, 22, 1, [SMOKE], ([sm]) => thud(sm, 30, 22, k, 3, 1)));
/** ITS LAMP LIT: a ring of cyan. */
const lampFrames = (): Sprite[] => loop('lamp', 5, (k) => piece(30, 30, 15, 15, 1, [BREW], ([l]) => lampRing(l, 15, 15, k)));
/** HER BOMB GOING OFF (in the air: the flash, the fireball, the smoke, the chips) and its SCORCH (on the floor). */
const BLAST_N = 24;
const blastFrames = (): Sprite[] => loop('blast', BLAST_N, (k) => piece(120, 120, 60, 96, 3, [CHIP, SMOKE, BREW], ([st, sm, l]) => {
  blast(l, sm, 60, 96, k, k / 30, 7);
  chips(st, l, 60, 96, k, 7);
}));
const SCORCH_N = 40;
const scorchFrames = (): Sprite[] => loop('scorch', 8, (i) => piece(50, 24, 25, 12, 2, [SCORCH, BREW], ([sc, l]) => scorch(sc, l, 25, 12, i * 5, 7)));
/** THE GOLEM'S POUND: on the floor, the cracks and the ring; in the air, the steam. */
const POUND_N = 24;
const poundFloor = (): Sprite[] => loop('poundF', POUND_N, (k) => piece(200, 110, 100, 55, 3, [STUFF, STEAM, HEART], ([dk, st, l]) => {
  const S = (p: readonly number[]): [number, number] => [100 + p[0], 55 + p[1] * 0.5];
  const heat = k < 4 ? 3 : k < 12 ? 2 : k < 20 ? 1 : 0;
  for (const c of crackStar(0, 0, 7, 40, 5, 9)) drawCrack(dk, l, c, Math.min(1, (k + 1) / 3), heat, S);
  shock(st, 100, 55, k, k / 30, 3);
}));
const poundAir = (): Sprite[] => loop('poundA', POUND_N, (k) => piece(120, 110, 60, 90, 1, [STEAM], ([st]) => burstSteam(st, 60, 80, k * 1.6, k / 30, 1, 5)));
/** THE GOLEM DROPPING IN: steam and a ring of dust. */
const ARRIVE_N = 18;
const arriveFrames = (): Sprite[] => loop('arrive', ARRIVE_N, (k) => piece(160, 110, 80, 80, 1, [STEAM], ([st]) => {
  shock(st, 80, 80, k, k / 30, 11);
  burstSteam(st, 80, 70, k * 1.6, k / 30, 0.8, 13);
}));
/** ITS FIST OR ITS SHOT LANDING: cyan shards. */
const IMPACT_N = 10;
const impactFrames = (big: number): Sprite[] => loop(`impact${big}`, IMPACT_N, (k) => piece(70, 70, 35, 35, 2, [IRON, GUN_GLOW], ([iron, l]) => {
  void iron;
  impactBurst(l, 35, 35, k, 3, big);
}));
/** ITS CANNON'S FLASH, to the left or the right of the picture. */
const FLASH_N = 6;
const flashFrames = (way: number): Sprite[] => loop(`flash${way}`, FLASH_N, (k) => piece(60, 50, 30, 25, 1, [GUN_GLOW], ([l]) => muzzleFlash(l, 30, 25, way, -0.3, k, 4)));
/** SPARKS AND GEARS off brass. */
const SPARK_N = 16;
const sparkFrames = (size: number): Sprite[] => loop(`sparks${size}`, SPARK_N, (k) => piece(90, 80, 45, 60, 2, [GEARS, SPARKS], ([st, l]) => {
  sparks(l, 45, 40, k, 7);
  if (size > 0) gears(st, 45, 40, 60, k, 7, size);
}));
/** A PUFF of her bomb's smoke. */
const puffFrames = (): Sprite[] => loop('puff', 6, (i) => piece(40, 34, 20, 28, 1, [SMOKE], ([sm]) => cloud(sm, 20, 28, 18, 15, i * 0.17, 0.2, 31 + i)));

interface Spot { x: number; y: number; t: number }
interface Lob { x0: number; y0: number; x1: number; y1: number; t: number; flight: number; hand?: boolean }
interface Path { x0: number; y0: number; x1: number; y1: number; t: number }

/** How long each lasts (seconds). */
const LIFE = { burst: BURST_N / 30, thud: 14 / 30, lamp: 5 / 30, blast: BLAST_N / 30, scorch: SCORCH_N / 30 * 2, pound: POUND_N / 30, arrive: ARRIVE_N / 30, impact: IMPACT_N / 30, flash: FLASH_N / 30, sparks: SPARK_N / 30, trail: 0.9 };
/** From her letting go, its coming down and its being lit (dev/contraption_fx.ts CT: land 27 and open1 53, from letGo 15). */
const CON_LAND = 12 / 30;
const CON_LIT = 38 / 30;

export class TinkererFx {
  private t = 0;
  private lobs: Lob[] = [];
  private shots: (Lob & { way: number })[] = [];
  private bursts: Spot[] = [];
  private thuds: Spot[] = [];
  private lamps: Spot[] = [];
  private blasts: Spot[] = [];
  private scorches: Spot[] = [];
  private pounds: Spot[] = [];
  private arrives: Spot[] = [];
  private impacts: (Spot & { big: number })[] = [];
  private flashes: (Spot & { way: number })[] = [];
  private sparks: (Spot & { size: number })[] = [];
  private trails: Path[] = [];
  /** Things to come: a Contraption coming down, being lit (seconds until). */
  private later: { at: number; e: () => void }[] = [];

  handle(e: GameEvent): void {
    switch (e.t) {
      case 'contraption': {
        const x = e.x;
        const y = e.y;
        this.later.push({ at: this.t + CON_LAND, e: () => this.thuds.push({ x, y, t: 0 }) });
        this.later.push({ at: this.t + CON_LIT, e: () => this.lamps.push({ x, y, t: 0 }) });
        break;
      }
      case 'vial':
        // (out of a Contraption's mortar, with its flash; or, her Vial Toss, from her hand up by her shoulder)
        this.lobs.push({ x0: e.x0, y0: e.y0, x1: e.x1, y1: e.y1, t: 0, flight: e.flight, hand: e.id < 0 });
        if (e.id >= 0) this.flashes.push({ x: e.x0, y: e.y0, t: 0, way: 0 });
        break;
      case 'vialBurst':
        this.bursts.push({ x: e.x, y: e.y, t: 0 });
        break;
      case 'contraptionEnd':
        this.sparks.push({ x: e.x, y: e.y, t: 0, size: 0 });
        break;
      case 'golemArrive':
        this.arrives.push({ x: e.x, y: e.y, t: 0 });
        break;
      case 'golemPunch':
        this.impacts.push({ x: e.x, y: e.y, t: 0, big: 1 });
        break;
      case 'golemShot': {
        const way = e.x1 - e.y1 - (e.x0 - e.y0) >= 0 ? 1 : -1;
        this.shots.push({ x0: e.x0, y0: e.y0, x1: e.x1, y1: e.y1, t: 0, flight: Math.max(0.05, e.flight), way });
        this.flashes.push({ x: e.x0, y: e.y0, t: 0, way });
        const x = e.x1;
        const y = e.y1;
        this.later.push({ at: this.t + e.flight, e: () => this.impacts.push({ x, y, t: 0, big: 1.4 }) });
        break;
      }
      case 'golemPound':
        this.pounds.push({ x: e.x, y: e.y, t: 0 });
        break;
      case 'golemDown':
        this.sparks.push({ x: e.x, y: e.y, t: 0, size: 1 });
        break;
      case 'blastJump':
        this.blasts.push({ x: e.x0, y: e.y0, t: 0 });
        this.scorches.push({ x: e.x0, y: e.y0, t: 0 });
        this.trails.push({ x0: e.x0, y0: e.y0, x1: e.x1, y1: e.y1, t: 0 });
        break;
      case 'blastLand':
        this.thuds.push({ x: e.x, y: e.y, t: 0 });
        break;
      default:
        break;
    }
  }

  update(dt: number): void {
    this.t += dt;
    const due = this.later.filter((l) => l.at <= this.t);
    this.later = this.later.filter((l) => l.at > this.t);
    for (const d of due) d.e();
    const age = <T extends { t: number }>(list: T[], life: number): T[] => {
      for (const x of list) x.t += dt;
      return list.filter((x) => x.t < life);
    };
    this.lobs = this.lobs.filter((l) => (l.t += dt) < l.flight);
    this.shots = this.shots.filter((l) => (l.t += dt) < l.flight);
    this.bursts = age(this.bursts, LIFE.burst);
    this.thuds = age(this.thuds, LIFE.thud);
    this.lamps = age(this.lamps, LIFE.lamp);
    this.blasts = age(this.blasts, LIFE.blast);
    this.scorches = age(this.scorches, LIFE.scorch);
    this.pounds = age(this.pounds, LIFE.pound);
    this.arrives = age(this.arrives, LIFE.arrive);
    this.impacts = age(this.impacts, LIFE.impact);
    this.flashes = age(this.flashes, LIFE.flash);
    this.sparks = age(this.sparks, LIFE.sparks);
    this.trails = age(this.trails, LIFE.trail);
  }

  clear(): void {
    this.lobs = [];
    this.shots = [];
    this.bursts = [];
    this.thuds = [];
    this.lamps = [];
    this.blasts = [];
    this.scorches = [];
    this.pounds = [];
    this.arrives = [];
    this.impacts = [];
    this.flashes = [];
    this.sparks = [];
    this.trails = [];
    this.later = [];
  }

  /** What lies on the floor: scorches, the pounds' cracks and rings, the thuds of dust, lamps lit. */
  drawGround(g: CanvasRenderingContext2D, c: Cam): void {
    const at = (list: Sprite[], k: number): Sprite => list[Math.max(0, Math.min(list.length - 1, Math.floor(k * list.length)))];
    const put = (s: Sprite, x: number, y: number, up = 0): void => drawSprite(g, s, Math.round(wx(c, x, y)), Math.round(wy(c, x, y) - up));
    const sc = scorchFrames();
    for (const s of this.scorches) {
      g.globalAlpha = Math.max(0, Math.min(1, 1.5 - (s.t / LIFE.scorch) * 1.5));
      put(at(sc, Math.min(0.99, s.t / (SCORCH_N / 30))), s.x, s.y);
      g.globalAlpha = 1;
    }
    const pf = poundFloor();
    for (const p of this.pounds) put(at(pf, p.t / LIFE.pound), p.x, p.y);
    const th = thudFrames();
    for (const p of this.thuds) put(at(th, p.t / LIFE.thud), p.x, p.y);
    const lm = lampFrames();
    for (const p of this.lamps) put(at(lm, p.t / LIFE.lamp), p.x, p.y, 8);
  }

  /** What is over everything: her vials in the air and bursting, her bomb, the Golem's steam, flashes, shots, sparks. */
  drawAir(g: CanvasRenderingContext2D, c: Cam): void {
    const at = (list: Sprite[], k: number): Sprite => list[Math.max(0, Math.min(list.length - 1, Math.floor(k * list.length)))];
    const put = (s: Sprite, x: number, y: number, up = 0): void => drawSprite(g, s, Math.round(wx(c, x, y)), Math.round(wy(c, x, y) - up));
    // (the puffs of her bomb's smoke along the way she flew, thinning)
    const pu = puffFrames();
    for (const p of this.trails) {
      const k = p.t / LIFE.trail;
      const len = Math.hypot(p.x1 - p.x0, p.y1 - p.y0);
      const n = Math.max(2, Math.round(len * 1.6));
      g.globalAlpha = Math.max(0, 1 - k);
      for (let i = 0; i <= n; i++) {
        const u = i / n;
        // (only where she has been: the trail grows behind her as she flies)
        if (u > Math.min(1, p.t / 0.6)) break;
        const lift = Math.sin(Math.PI * u) * 34 + 8 + k * 10;
        put(pu[(i + Math.floor(this.t * 8)) % pu.length], p.x0 + (p.x1 - p.x0) * u, p.y0 + (p.y1 - p.y0) * u, lift);
      }
      g.globalAlpha = 1;
    }
    const bl = blastFrames();
    for (const p of this.blasts) put(at(bl, p.t / LIFE.blast), p.x, p.y);
    // (her vials, lobbed high, tumbling)
    const vf = vialFrames();
    for (const l of this.lobs) {
      const u = l.t / l.flight;
      const x = l.x0 + (l.x1 - l.x0) * u;
      const y = l.y0 + (l.y1 - l.y0) * u;
      const up = (l.hand ? 30 : 10) * (1 - u) + 4 * 30 * u * (1 - u);
      put(vf[Math.floor(l.t * 18) % vf.length], x, y, up);
    }
    const bu = burstFrames();
    for (const p of this.bursts) put(at(bu, p.t / LIFE.burst), p.x, p.y);
    const pa = poundAir();
    for (const p of this.pounds) put(at(pa, p.t / LIFE.pound), p.x, p.y);
    const ar = arriveFrames();
    for (const p of this.arrives) put(at(ar, p.t / LIFE.arrive), p.x, p.y);
    // (its cannon's shot, streaking in the friend's cyan, from its muzzle up by its shoulder)
    for (const s of this.shots) {
      const u = s.t / s.flight;
      const x0 = wx(c, s.x0, s.y0) + s.way * 8;
      const y0 = wy(c, s.x0, s.y0) - 34;
      const x1 = wx(c, s.x1, s.y1);
      const y1 = wy(c, s.x1, s.y1) - 12;
      const hx = x0 + (x1 - x0) * u;
      const hy = y0 + (y1 - y0) * u;
      const tx = x0 + (x1 - x0) * Math.max(0, u - 0.25);
      const ty = y0 + (y1 - y0) * Math.max(0, u - 0.25);
      g.strokeStyle = GUN_GLOW[1];
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(Math.round(tx), Math.round(ty));
      g.lineTo(Math.round(hx), Math.round(hy));
      g.stroke();
      g.fillStyle = GUN_GLOW[3];
      g.fillRect(Math.round(hx) - 1, Math.round(hy) - 1, 3, 3);
    }
    for (const f of this.flashes) {
      if (f.way === 0) {
        // (a contraption's mouth: a little puff of her brew's flash)
        const k = f.t / LIFE.flash;
        g.globalAlpha = 1 - k;
        g.fillStyle = BREW[k < 0.4 ? 3 : 1];
        const x = Math.round(wx(c, f.x, f.y));
        const y = Math.round(wy(c, f.x, f.y) - 12);
        g.fillRect(x - 1, y - 1 - Math.round(k * 4), 3, 3);
        g.globalAlpha = 1;
      } else put(at(flashFrames(f.way), f.t / LIFE.flash), f.x, f.y, 34);
    }
    for (const p of this.impacts) put(at(impactFrames(p.big), p.t / LIFE.impact), p.x, p.y, 12);
    for (const p of this.sparks) put(at(sparkFrames(p.size), p.t / LIFE.sparks), p.x, p.y, 0);
  }
}

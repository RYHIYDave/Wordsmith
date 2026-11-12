// WHAT THE UNIQUE ITEMS SHOW IN PLAY, LAID IN THE GAME (the art chat, 11 Nov 2026; queue item draw-unique-items).
//
// The pictures are art/unique_play_art.ts's; here they are put where the rules have things happen. Each unique behind its own
// switch (render/unique_play.ts UNIQUE_PLAY), ALL OFF until his yes; with one off nothing here is drawn for it and the game
// shows it as the build does. Told of every event (render/fx.ts handle), moved on with the effects, and asked each frame for
// what stands in the world (render/render.ts: the book and its fire, the risen elite, sorted with everything else that
// stands, so the book goes behind him and in front of him as it circles), what lies on the floor, and what is over everything.
//
//   THE RESTLESS TOME      the book where the rules have it (Game.uq.tomeA, UNIQUE_TUNE.tome), turned the way it flies, beating;
//                          a soft shadow under it; tongues of the demon's fire left along its way, each rising and burning
//                          down in a third of a second; its warm light on the floor; on a 'touch', its fire leaping onto that
//                          one, the book's own fire flaring for a moment (his cyan hellfire then takes there: the Warlock's own)
//   THE FLESHMANCER'S BRAND the risen elite (Game.risen) in its kind's own pictures, drained, glowing the friend's cyan
//                          (art risenLook): pulled up off the floor where it fell (its fall played backward; its body gone
//                          from the floor), standing, walking, striking; the brand under it on the floor, turning, its ring
//                          burning away as its seconds run out; the floor cracked with light where it rose; a burst on the
//                          one it strikes; and at its end it falls again and fades
//   THE FOURTH GLOBE       render/veteran_fx.ts (four globes over the Brawler's head)
//   THE DROWNED ARM        on its 'warn', black water welling up there, the tentacle bursting up out of it a little behind the
//                          enemy, towering, cocking back and whipping down across it on the 'slam' (the rules' half a second
//                          on), the water thrown out round it; it lies there a moment and is pulled back under (art ARM)

import type { Sprite } from '../engine/px';
import type { Px } from '../engine/px';
import { drawGlow, drawSprite, flipSprite, retireSprite } from '../engine/px';
import type { GameEvent } from '../game/state';
import type { Game } from '../game/game';
import type { MonsterKind } from '../game/types';
import { UNIQUE_TUNE } from '../game/uniques';
import type { AnimSet } from '../art/actor_types';
import type { Bestiary } from '../art/bestiary';
import { FIGURE_SIZE, figureOf } from '../art/bestiary';
import { BRAND, RISEN_BLOW_FRAMES, RISEN_CYAN, RISE_CRACKS, TOME, TOME_FLAME, TOME_GLOW, TOME_TOUCH_FRAMES, paintBrand, paintRiseCracks, paintRisenBlow, paintTome, paintTomeFlame, paintTomeTouch, risenLook } from '../art/unique_play_art';
import type { Cam } from './fx';
import { wx, wy } from './fx';
import { attackFrame } from './figure';
import { risingSprite } from './arrivals';
import { UNIQUE_PLAY } from './unique_play';
import { ARM, ARM_WATER, paintArm, paintArmPool } from '../art/unique_play_art2';

/** Picture pixels to a game pixel (the heroes' grain). */
const G = 2;
/** THE TOME: how high over the floor it flies (game pixels) and how far it bobs; how long a tongue of its fire burns (seconds) and how fast it rises (game pixels a second); how often one is left; how long the book flares after a touch. */
export const TOME_FLIES = { high: 16, bob: 1.5, burns: 0.36, rises: 15, every: 1 / 30, flare: 0.22, most: 16 };
/** THE RISEN ELITE: how long its rising takes (the rules': game.ts stepRisen), how long its fall is seen and from when it fades; how long the cracks stay, and fade. */
export const RISEN_SHOWN = { rise: 0.6, strike: 0.6, blow: 0.3, fall: 1.0, fades: 0.4, cracks: 2.6, cracksFade: 0.7 };
/** How many pixels of drained pictures are kept (about 8 megabytes); past it the lot is let go and made again as asked for. */
const LOOK_BUDGET = 2_000_000;

/** Something of a unique's that stands in the world this frame: how far down the picture it is (its floor point's x + y), its picture, where on the screen, how clear. */
export interface UniqueStand {
  d: number;
  s: Sprite;
  x: number;
  y: number;
  alpha: number;
}
/** What the effects lend it (render/fx.ts Fx). */
interface Lent {
  shake: number;
  fallen: { x: number; y: number; t: number }[];
  rings: { x: number; y: number; r: number; t: number; dur: number; colors: readonly string[]; fill: boolean; heavy?: boolean }[];
  spray(x: number, y: number, n: number, colors: readonly string[], speed: number, up: number, z?: number): void;
}

const kept = new Map<string, Sprite>();
/** A picture of the art's, painted once and kept. */
function keep(key: string, paint: () => { px: Px; ax: number; ay: number }): Sprite {
  let s = kept.get(key);
  if (!s) {
    const p = paint();
    s = p.px.sprite(p.ax, p.ay, G);
    kept.set(key, s);
  }
  return s;
}

export class UniqueFx {
  /** The game being drawn (render/render.ts sets it each frame), and its monsters' pictures. */
  game: Game | null = null;
  bestiary: Bestiary | null = null;
  private t = 0;
  // ---- the tome
  private flames: { x: number; y: number; z: number; t: number; lean: number; seed: number }[] = [];
  private flameT = 0;
  private flare = 0;
  private touches: { x: number; y: number; z: number; t: number; seed: number }[] = [];
  private tomeAt: { x: number; y: number; z: number } | null = null;
  // ---- the risen elite
  /** It as last drawn: for its fall, which the rules tell of once it is gone. */
  private last: { kind: MonsterKind; champion: boolean; x: number; y: number; fx: number; fy: number; r: number } | null = null;
  private cracks: { x: number; y: number; t: number; seed: number }[] = [];
  private falls: { kind: MonsterKind; champion: boolean; x: number; y: number; fx: number; fy: number; r: number; t: number }[] = [];
  private blows: { x: number; y: number; z: number; t: number; seed: number }[] = [];
  // ---- the drowned arm: each from its warning (the enemy's spot, how long since)
  private arms: { x: number; y: number; t: number; flip: boolean }[] = [];
  private looks = new Map<Sprite, Sprite>();
  private lookPx = 0;
  private cuts = new Map<Sprite, Map<number, { sp: Sprite; down: number } | null>>();
  private seeds = 0;

  clear(): void {
    this.flames = [];
    this.touches = [];
    this.tomeAt = null;
    this.flare = 0;
    this.last = null;
    this.cracks = [];
    this.falls = [];
    this.blows = [];
    this.arms = [];
  }

  /**
   * THE BUILD'S STAND-INS, not shown once the picture is (game/game.ts sends them with no name on them: stepTome's spark of fire
   * where the book is, a dozen a turn, “until it is drawn”; raise's ten sparks where the elite rises): is this event one of them?
   */
  owns(e: GameEvent): boolean {
    if (e.t !== 'spark') return false;
    const g = this.game;
    if (!g) return false;
    if (e.el === 'fire' && e.n === 1 && UNIQUE_PLAY.tome && g.wears('restlesstome')) {
      const h = g.hero;
      return Math.abs(Math.hypot(e.x - h.x, e.y - h.y) - UNIQUE_TUNE.tome.r) < 0.02;
    }
    if (e.el === 'frost' && e.n === 10 && this.roseAt && e.x === this.roseAt.x && e.y === this.roseAt.y) {
      this.roseAt = null;
      return true;
    }
    return false;
  }
  /** Where an elite has just risen (the stand-in's sparks come next, in the same step). */
  private roseAt: { x: number; y: number } | null = null;

  /** An event of the game's (render/fx.ts handle): the moments a unique's picture hangs on. */
  handle(e: GameEvent, fx: Lent): void {
    if (e.t !== 'unique') return;
    const g = this.game;
    if (e.id === 'restlesstome' && UNIQUE_PLAY.tome && e.what === 'touch') {
      const m = g?.monsters.find((q) => q.id === e.mid);
      const top = m ? (FIGURE_SIZE[figureOf(m)]?.top ?? 28) : 28;
      this.touches.push({ x: e.x, y: e.y, z: Math.min(20, top * 0.5), t: 0, seed: ++this.seeds });
      this.flare = TOME_FLIES.flare;
    }
    if (e.id === 'drownedarm' && UNIQUE_PLAY.arm) {
      if (e.what === 'warn') {
        // (it comes up on the far side of the enemy from him, as the screen has it, and whips down across it toward him)
        const h = g?.hero;
        const flip = !!h && h.x - h.y < e.x - e.y;
        this.arms.push({ x: e.x, y: e.y, t: 0, flip });
        if (this.arms.length > 3) this.arms.shift();
      } else if (e.what === 'slam') {
        // (the black water thrown out round it as it lands)
        fx.rings.push({ x: e.x, y: e.y, r: (e.r ?? 1.3) * 1.05, t: 0, dur: 0.4, colors: [ARM_WATER[4], ARM_WATER[3], ARM_WATER[2], ARM_WATER[1]], fill: false, heavy: true });
        fx.spray(e.x, e.y, 26, [ARM_WATER[4], ARM_WATER[3], ARM_WATER[2], '#687c46'], 2.1, 150, 2);
      }
    }
    if (e.id === 'fleshmancersbrand' && UNIQUE_PLAY.risen) {
      if (e.what === 'rise') {
        // (its body is no longer lying there: it is the one getting up)
        const k = fx.fallen.findIndex((f) => f.t < 0.2 && Math.abs(f.x - e.x) < 0.6 && Math.abs(f.y - e.y) < 0.6);
        if (k >= 0) fx.fallen.splice(k, 1);
        this.roseAt = { x: e.x, y: e.y };
        this.cracks.push({ x: e.x, y: e.y, t: 0, seed: ++this.seeds });
        if (this.cracks.length > 4) this.cracks.shift();
        fx.rings.push({ x: e.x, y: e.y, r: 1.7, t: 0, dur: 0.36, colors: ['#ffffff', RISEN_CYAN[2], RISEN_CYAN[1], RISEN_CYAN[0]], fill: false, heavy: true });
        fx.spray(e.x, e.y, 22, [RISEN_CYAN[3], RISEN_CYAN[2], RISEN_CYAN[1]], 1.5, 150, 3);
        fx.shake = Math.max(fx.shake, 2);
      } else if (e.what === 'strike' && e.x1 !== undefined && e.y1 !== undefined) {
        const m = g?.monsters.find((q) => q.id === e.mid);
        const top = m ? (FIGURE_SIZE[figureOf(m)]?.top ?? 28) : 28;
        this.blows.push({ x: e.x1, y: e.y1, z: Math.min(20, top * 0.5), t: 0, seed: ++this.seeds });
        fx.spray(e.x1, e.y1, 8, [RISEN_CYAN[3], RISEN_CYAN[2], RISEN_CYAN[1]], 2.2, 70, 12);
      } else if (e.what === 'fall') {
        const l = this.last;
        if (l && Math.hypot(l.x - e.x, l.y - e.y) < 1.5) this.falls.push({ ...l, x: e.x, y: e.y, t: 0 });
        this.last = null;
        fx.spray(e.x, e.y, 14, [RISEN_CYAN[2], RISEN_CYAN[1], RISEN_CYAN[0]], 0.9, 110, 10);
      }
    }
  }

  /** A step of the effects' time. */
  update(dt: number): void {
    this.t += dt;
    this.flare = Math.max(0, this.flare - dt);
    for (const f of this.flames) {
      f.t += dt;
      f.z += TOME_FLIES.rises * dt;
    }
    this.flames = this.flames.filter((f) => f.t < TOME_FLIES.burns);
    for (const q of this.touches) q.t += dt;
    this.touches = this.touches.filter((q) => q.t * 30 < TOME_TOUCH_FRAMES);
    for (const c of this.cracks) c.t += dt;
    this.cracks = this.cracks.filter((c) => c.t < RISEN_SHOWN.cracks);
    for (const f of this.falls) f.t += dt;
    this.falls = this.falls.filter((f) => f.t < RISEN_SHOWN.fall);
    for (const a of this.arms) a.t += dt;
    this.arms = this.arms.filter((a) => a.t * 30 < ARM.frames);
    for (const b of this.blows) b.t += dt;
    this.blows = this.blows.filter((b) => b.t * 30 < RISEN_BLOW_FRAMES);
    // THE TOME: a tongue of its fire left where it is, a thirtieth of a second apart
    const at = this.tomeNow();
    this.tomeAt = at ? { x: at.x, y: at.y, z: at.z } : null;
    if (!at) {
      this.flameT = 0;
      return;
    }
    this.flameT += dt;
    if (this.flameT >= TOME_FLIES.every) {
      this.flameT = Math.min(this.flameT - TOME_FLIES.every, TOME_FLIES.every);
      // (at the foot of its spine, its fire blown back off its way; leaning the other way on the picture)
      const sdx = at.tx - at.ty;
      this.flames.push({ x: at.x - at.tx * 0.2, y: at.y - at.ty * 0.2, z: at.z - 1, t: 0, lean: at.still ? 0 : sdx > 0.25 ? -1 : sdx < -0.25 ? 1 : 0, seed: ++this.seeds });
      if (this.flames.length > TOME_FLIES.most) this.flames.shift();
    }
  }

  /** THE TOME, worn and shown: where it is in the world, how high, and the way it flies there (a unit, the world's). */
  private tomeNow(): { x: number; y: number; z: number; tx: number; ty: number; still: boolean } | null {
    const g = this.game;
    if (!g || !UNIQUE_PLAY.tome || g.over || !g.wears('restlesstome')) return null;
    const h = g.hero;
    const a = g.uq.tomeA;
    const r = UNIQUE_TUNE.tome.r;
    return { x: h.x + Math.cos(a) * r, y: h.y + Math.sin(a) * r, z: TOME_FLIES.high + TOME_FLIES.bob * Math.sin(this.t * 5.1), tx: -Math.sin(a), ty: Math.cos(a), still: !!h.change };
  }

  /** The picture `s` drained and glowing the friend's cyan (art risenLook), made once and kept; its lights the friend's. */
  private risenOf(s: Sprite): Sprite {
    let t = this.looks.get(s);
    if (t) return t;
    const area = s.img.width * s.img.height;
    if (this.lookPx + area > LOOK_BUDGET) {
      for (const one of this.looks.values()) retireSprite(one);
      this.looks.clear();
      this.cuts.clear();
      this.lookPx = 0;
    }
    const cv = document.createElement('canvas');
    cv.width = s.img.width;
    cv.height = s.img.height;
    const c = cv.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
    c.drawImage(s.img, 0, 0);
    const im = c.getImageData(0, 0, cv.width, cv.height);
    risenLook(im.data);
    c.putImageData(im, 0, 0);
    t = { img: cv, w: s.w, h: s.h, ax: s.ax, ay: s.ay };
    if (s.density !== undefined) t.density = s.density;
    this.looks.set(s, t);
    this.lookPx += area;
    return t;
  }

  /** The risen one's picture for what it is doing: its kind's own frames (render.ts actorSprite's, and its fall backward as it rises). */
  private risenFrame(set: AnimSet, act: string, actT: number, walked: number): { sp: Sprite; down: number } | null {
    const one = (fr: readonly Sprite[] | undefined, i: number): Sprite | null => (fr && fr.length ? fr[Math.max(0, Math.min(fr.length - 1, i))] : null);
    const idle = one(set.idle, Math.floor(this.t * (set.idleFps ?? 2)) % Math.max(1, set.idle?.length ?? 1));
    let sp: Sprite | null = null;
    if (act === 'rise') {
      // (pulled up off the floor: slow to start, then snapped upright)
      const k = Math.max(0, Math.min(1, actT / RISEN_SHOWN.rise));
      const u = k * k * (3 - 2 * k) * k;
      const die = set.clips?.die;
      if (die && die.frames.length > 1) sp = one(die.frames, Math.round((1 - u) * (die.frames.length - 1)));
      else if (idle) {
        // (a kind with no fall painted: up out of the floor)
        const step = Math.round(u * 12);
        let m = this.cuts.get(idle);
        if (!m) this.cuts.set(idle, (m = new Map()));
        if (!m.has(step)) m.set(step, risingSprite(this.risenOf(idle), step / 12));
        return m.get(step) ?? null;
      }
    } else if (act === 'strike') {
      const clip = set.clips?.attack;
      if (clip && clip.hit !== undefined && clip.frames.length) sp = attackFrame(clip, actT, RISEN_SHOWN.blow);
      else sp = one(set.attack, actT < 0.24 ? 0 : actT < 0.42 ? 1 : 2);
    } else if (act === 'walk') {
      const n = set.walk?.length ?? 0;
      if (n) sp = set.walk[set.walkStride ? Math.floor((walked / set.walkStride) * n) % n : Math.floor(actT * (set.walkFps ?? 8)) % n];
    }
    sp = sp ?? idle;
    return sp ? { sp: this.risenOf(sp), down: 0 } : null;
  }

  /** WHAT STANDS IN THE WORLD this frame (render/render.ts lays each with everything else that stands): the book and its fire; the risen elite, and one falling. */
  stands(cam: Cam): UniqueStand[] {
    const out: UniqueStand[] = [];
    const g = this.game;
    if (!g) return out;
    // THE TOME'S FIRE, oldest first, then the book
    for (const f of this.flames) {
      const u = f.t / TOME_FLIES.burns;
      const sizes = TOME_FLAME.sizes;
      const i = Math.max(0, Math.min(sizes.length - 1, Math.round((1 - u) * (sizes.length - 2) + (this.flare > 0 ? 1 : 0))));
      const fr = (Math.floor(this.t * 20) + f.seed) % TOME_FLAME.frames;
      const s = keep(`flame|${i}|${fr}|${f.lean}`, () => paintTomeFlame(sizes[i], fr, f.lean));
      out.push({ d: f.x + f.y - 0.004, s, x: wx(cam, f.x, f.y), y: wy(cam, f.x, f.y) - f.z, alpha: 1 });
    }
    const at = this.tomeNow();
    if (at) {
      const al = Math.atan2(at.tx + at.ty, at.tx - at.ty);
      const hd = ((Math.round((al / (Math.PI * 2)) * TOME.headings) % TOME.headings) + TOME.headings) % TOME.headings;
      const fl = Math.floor(this.t * 30) % TOME.flaps;
      const s = keep(`tome|${hd}|${fl}`, () => ({ px: paintTome(hd, fl), ax: TOME.ax, ay: TOME.ay }));
      out.push({ d: at.x + at.y, s, x: wx(cam, at.x, at.y), y: wy(cam, at.x, at.y) - at.z, alpha: 1 });
    }
    // ITS FIRE ON THE ONE IT TOUCHED, before it
    for (const q of this.touches) {
      const age = Math.min(TOME_TOUCH_FRAMES - 1, Math.floor(q.t * 30));
      const s = keep(`touch|${age}|${q.seed % 3}`, () => paintTomeTouch(age, q.seed % 3));
      out.push({ d: q.x + q.y + 0.05, s, x: wx(cam, q.x, q.y), y: wy(cam, q.x, q.y) - q.z, alpha: 1 });
    }
    // THE DROWNED ARM: from a little behind the enemy (ARM.from), behind it as it rises, over it once it has whipped down across it
    for (const a of this.arms) {
      const f = Math.min(ARM.frames - 1, Math.floor(a.t * 30));
      const [fx0, fy0] = a.flip ? [ARM.from[1], ARM.from[0]] : ARM.from;
      const bx = a.x + fx0;
      const by = a.y + fy0;
      const s0 = keep(`arm|${f}`, () => ({ px: paintArm(f), ax: ARM.ax, ay: ARM.ay }));
      out.push({ d: f < ARM.slam ? bx + by : a.x + a.y + 0.4, s: a.flip ? flipSprite(s0, true) : s0, x: wx(cam, bx, by), y: wy(cam, bx, by), alpha: 1 });
    }
    if (!UNIQUE_PLAY.risen || !this.bestiary) return out;
    // THE RISEN ELITE
    const p = g.risen;
    if (p) {
      this.last = { kind: p.kind, champion: p.champion, x: p.x, y: p.y, fx: p.fx, fy: p.fy, r: p.r };
      const art = this.bestiary.of(figureOf({ kind: p.kind, champion: p.champion }));
      const shown = this.risenFrame(p.fx + p.fy < -0.2 ? art.back : art.front, p.act, p.actT, p.walked);
      if (shown) out.push({ d: p.x + p.y + 0.01, s: p.fx - p.fy < 0 ? flipSprite(shown.sp, true) : shown.sp, x: wx(cam, p.x, p.y), y: wy(cam, p.x, p.y) + shown.down, alpha: 1 });
    }
    // ... and one whose time is up: it falls as its kind falls, and fades
    for (const f of this.falls) {
      const art = this.bestiary.of(figureOf({ kind: f.kind, champion: f.champion }));
      const set = f.fx + f.fy < -0.2 ? art.back : art.front;
      const die = set.clips?.die;
      const sp = die && die.frames.length ? die.frames[Math.min(die.frames.length - 1, Math.floor(f.t * die.fps))] : set.idle?.[0];
      if (!sp) continue;
      const look = this.risenOf(sp);
      const alpha = f.t < RISEN_SHOWN.fades ? 1 : Math.max(0, 1 - (f.t - RISEN_SHOWN.fades) / (RISEN_SHOWN.fall - RISEN_SHOWN.fades));
      out.push({ d: f.x + f.y + 0.01, s: f.fx - f.fy < 0 ? flipSprite(look, true) : look, x: wx(cam, f.x, f.y), y: wy(cam, f.x, f.y), alpha });
    }
    return out;
  }

  /** WHAT LIES ON THE FLOOR (with the floor's effects): the book's shadow; the cracks where the elite rose, its shadow, the brand under it. */
  drawGround(g: CanvasRenderingContext2D, cam: Cam): void {
    const game = this.game;
    if (!game) return;
    const oval = (x: number, y: number, r: number, a: number): void => {
      g.globalAlpha = a;
      g.fillStyle = '#000000';
      g.beginPath();
      g.ellipse(wx(cam, x, y), wy(cam, x, y), r * 22.6, r * 11.3, 0, 0, Math.PI * 2);
      g.fill();
      g.globalAlpha = 1;
    };
    const at = this.tomeAt;
    if (at) oval(at.x, at.y, 0.3, 0.24);
    // THE DROWNED ARM'S BLACK WATER, between where it comes up and the enemy
    for (const a of this.arms) {
      const f = Math.min(ARM.frames - 1, Math.floor(a.t * 30));
      const s = keep(`armpool|${f}`, () => paintArmPool(f));
      const [fx0, fy0] = a.flip ? [ARM.from[1], ARM.from[0]] : ARM.from;
      const px = a.x + fx0 * 0.45;
      const py = a.y + fy0 * 0.45;
      drawSprite(g, s, Math.round(wx(cam, px, py)), Math.round(wy(cam, px, py)));
    }
    if (!UNIQUE_PLAY.risen) return;
    for (const c of this.cracks) {
      const grow = Math.min(RISE_CRACKS.grow - 1, Math.floor(c.t * 30 * 0.8));
      const cool = Math.max(0, Math.min(RISE_CRACKS.cool - 1, Math.floor(((c.t - 0.15) / 1.3) * (RISE_CRACKS.cool - 1))));
      const s = keep(`cracks|${grow}|${cool}|${c.seed % 4}`, () => paintRiseCracks(grow, cool, c.seed % 4));
      g.globalAlpha = c.t > RISEN_SHOWN.cracks - RISEN_SHOWN.cracksFade ? Math.max(0, (RISEN_SHOWN.cracks - c.t) / RISEN_SHOWN.cracksFade) : 1;
      drawSprite(g, s, Math.round(wx(cam, c.x, c.y)), Math.round(wy(cam, c.x, c.y)));
      g.globalAlpha = 1;
    }
    const p = game.risen;
    if (!p) return;
    oval(p.x, p.y, Math.max(0.3, p.r * 0.95), p.act === 'rise' ? 0.3 * Math.min(1, p.actT / RISEN_SHOWN.rise) : 0.3);
    // THE BRAND: stamped down white-hot as it rises, then turning under it, its ring burning away with its seconds
    const r = Math.round((Math.max(0.5, p.r + 0.26) * 45.25) / 2) * 2;
    const turn = Math.floor(this.t * 8) % BRAND.turns;
    const left = Math.max(0, Math.min(BRAND.steps, Math.ceil((p.t / UNIQUE_TUNE.brand.secs) * BRAND.steps)));
    const hot = p.act === 'rise' && p.actT < 0.1;
    const s = keep(`brand|${r}|${turn}|${left}|${hot}`, () => paintBrand(r, turn, left, hot));
    // (its last seconds: it gutters)
    g.globalAlpha = p.t < 2 && Math.floor(this.t * 10) % 2 === 0 ? 0.55 : 0.95;
    drawSprite(g, s, Math.round(wx(cam, p.x, p.y)), Math.round(wy(cam, p.x, p.y)));
    g.globalAlpha = 1;
    // (the brands painted are many, a few pixels each: the old ones let go of now and then)
    if (kept.size > 900) for (const k of [...kept.keys()]) if (k.startsWith('brand|')) kept.delete(k);
  }

  /** WHAT IS OVER EVERYTHING (with the air's effects, over the dark): the book's warm light, the risen one's cold light; the burst of its blow. */
  drawAir(g: CanvasRenderingContext2D, cam: Cam): void {
    const game = this.game;
    if (!game) return;
    const at = this.tomeAt;
    if (at) drawGlow(g, wx(cam, at.x, at.y), wy(cam, at.x, at.y) - 2, this.flare > 0 ? 44 : 32, TOME_GLOW, (this.flare > 0 ? 0.3 : 0.15) + 0.02 * Math.sin(this.t * 31));
    if (!UNIQUE_PLAY.risen) return;
    const p = game.risen;
    if (p) drawGlow(g, wx(cam, p.x, p.y), wy(cam, p.x, p.y) - 12, 30, '#28dcf0', p.act === 'rise' ? 0.2 + 0.25 * (1 - Math.min(1, p.actT / RISEN_SHOWN.rise)) : 0.17);
    for (const b of this.blows) {
      const age = Math.floor(b.t * 30);
      if (age >= RISEN_BLOW_FRAMES) continue;
      const s = keep(`blow|${age}|${b.seed % 4}`, () => paintRisenBlow(age, b.seed % 4));
      drawSprite(g, s, Math.round(wx(cam, b.x, b.y)), Math.round(wy(cam, b.x, b.y) - b.z));
    }
  }
}

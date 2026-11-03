// THE VETERAN IN THE GAME: HIS FRAME, HIS ACTION LINES, HIS GLOBES (the main chat, 3 Nov 2026; behind game/veteran.ts VETERAN,
// which is off).
//
// His frames are the art chat's (art/veteran_art.ts), and so are what his blows throw off (dev/veteran_fx.ts, the action lines
// his word asked to be big: “Those action lines will probably need to be bigger.  Remember, I’d rather have to pull back from a
// 10 then build up from a 1.  In terms of awesome looking animations”). What is the same every time a move is thrown (the
// smears, the elbow's arc of light, the force past the fist or foot, dust, a heavy landing's ring, speed lines) is painted as
// frames of his (art/veteran_fx_art.ts) and laid here from where he stood as the move began, along the way he faced then, at
// the move's frame, and on after it ends for its dust and its force to die away. What changes with who is struck is painted
// here, as the art's film has it: a BURST on each one his blow strikes, a SHOCKWAVE RING under a heavy blow, STARS round one
// his uppercut has launched; his AFTER-IMAGES along a strike; the screen shaken on his heavy blows (the game's own shake). And
// THE GLOBES over his head (dev/veteran_globes.ts): three, empty until filled, cyan a punch, hot orange a kick, white the
// jump; locked, the rims white and a bar joining them, when three are in; cyan or orange fire for a swipe's flying blow. Never
// pink, never gold.
//
// Where: what lies on the floor under everyone, with the floor's effects (drawGround); what is behind him at height, and his
// after-images, just behind him (behind); the rest over everything (drawAir).

import type { Sprite } from '../engine/px';
import { Px, drawSprite, flipSprite } from '../engine/px';
import type { Game } from '../game/game';
import type { VetGlobe, VetPlaying } from '../game/veteran';
import { VETERAN } from '../game/veteran';
import type { ActorArt } from '../art/actor_types';
import { FIGURE_SIZE, figureOf } from '../art/bestiary';
import { toSprite } from '../art/kit';
import { vetFxNone, vetJointAt, vetLastHit, vetLiftAt } from '../art/veteran_fx_art';
import type { VetFxLayer } from '../art/veteran_fx_art';
import { VET_STAND, VET_TILE, forceGeo, motionById, placeOf } from '../dev/veteran_moves';
import type { Strike, VetMotion } from '../dev/veteran_moves';
import { FX_KICK, FX_PUNCH, floorRing, impact, stars } from '../dev/veteran_fx';
import { GLOBES_H, GLOBES_W, paintGlobes } from '../dev/veteran_globes';
import type { Globe } from '../dev/veteran_globes';
import type { Cam } from './fx';
import { wx, wy } from './fx';
import { LIFE_BAR } from './lifebar';

/** Picture pixels to a game pixel (the art's effects are painted at the heroes' grain). */
const G2 = 2;
const kindCols = (k: 'punch' | 'kick'): readonly string[] => (k === 'kick' ? FX_KICK : FX_PUNCH);
/** How many frames a move's effects go on after it (art/veteran_fx_art.ts VET_FX_AFTER). */
const AFTER = 16;
/** The frames a globe takes to fill, by what filled it (the art's film: a tap 4, a hold 9, a swipe 3). */
const FILL: Record<'punch' | 'kick' | 'jump', number> = { punch: 4, kick: 9, jump: 3 };

/**
 * The way his picture faces for a facing, as the game draws heroes (render/figure.ts): mirrored to face screen-left, from
 * behind facing away; and the game's floor axes of it, his forward and his left (on the mirrored picture his left is the
 * world's right).
 */
export function vetView(fx: number, fy: number): { left: boolean; away: boolean; f: [number, number]; l: [number, number] } {
  const left = fx - fy < 0;
  const away = fx + fy < -0.2;
  const f: [number, number] = away ? (left ? [-1, 0] : [0, -1]) : left ? [0, 1] : [1, 0];
  const s = left ? -1 : 1;
  return { left, away, f, l: [f[1] * s, -f[0] * s] };
}
/** Where on the screen a point of a move's scene (his measure, along his forward and left, from a floor point) is, from that point (game pixels). */
function screenOf(v: { f: [number, number]; l: [number, number] }, a: number, b: number): [number, number] {
  const X = (a * v.f[0] + b * v.l[0]) / VET_TILE;
  const Y = (a * v.f[1] + b * v.l[1]) / VET_TILE;
  return [(X - Y) * 16, (X + Y) * 8];
}

/** A move being played, or playing out its effects after it (its frame going on at the pace it went). */
interface Play {
  key: string;
  m: VetMotion;
  x0: number;
  y0: number;
  fx: number;
  fy: number;
  f: number;
  /** Frames a second it was going at (his pace). */
  rate: number;
  live: boolean;
  /** Those its blow has struck that have been seen struck. */
  struck: Set<number>;
}
/** A blow seen landing on one: where (tiles, and how high: picture pixels), from which play, at which of its frames. */
interface Burst {
  play: Play;
  born: number;
  x: number;
  y: number;
  z: number;
  kind: 'punch' | 'kick';
  heavy: boolean;
  big: number;
  late: number;
  ring: number;
  seed: number;
}

/** A little picture painted the art's way (a Px at the heroes' grain), made once and kept, by what it is. */
const KEPT = new Map<string, Sprite>();
function kept(key: string, w: number, h: number, paint: (px: Px) => void): Sprite {
  let s = KEPT.get(key);
  if (!s) {
    const px = new Px(w, h);
    paint(px);
    s = toSprite({ px, lights: [] }, null, w / 2, h / 2);
    KEPT.set(key, s);
  }
  return s;
}

export class VeteranFx {
  private plays: Play[] = [];
  private bursts: Burst[] = [];
  /** Those his uppercut has launched (stars round their heads while they are stunned), and when. */
  private launched = new Map<number, number>();
  private clock = 0;
  /** The globes as shown: each its kind and when it came in (the clock); a row draining away once a combo is over. */
  private slots: { kind: VetGlobe; t0: number }[] = [];
  private drain: { slots: { kind: VetGlobe; t0: number }[]; t0: number } | null = null;
  /** Where the hero is drawn this frame (game pixels), the top of the bar of his life over him, and his pictures. */
  private heroAt: { x: number; y: number } | null = null;
  private barY = 0;
  private art: ActorArt | null = null;
  /** After-images made, by the frame they are of and their colours. */
  private ghosts = new WeakMap<Sprite, Map<string, Sprite>>();
  private globeCv: HTMLCanvasElement | null = null;

  /** Is he the Veteran, in this game? */
  on(game: Game): boolean {
    return VETERAN.on && game.hero.cls === 'brawler';
  }

  clear(): void {
    this.plays = [];
    this.bursts = [];
    this.launched.clear();
    this.slots = [];
    this.drain = null;
  }

  /** The move he is playing, if any. */
  private moveOf(game: Game): VetPlaying | null {
    return this.on(game) ? (game.hero.vet?.move ?? null) : null;
  }

  /**
   * A STEP OF THE GAME'S TIME (`dt` seconds): which move he is playing, how far through it; the blows seen landing (bursts);
   * the screen shaken on his heavy blows (`shake`: the game's own, render/fx.ts); the globes coming in and draining away.
   */
  step(game: Game, shake: { shake: number }, dt: number): void {
    if (!this.on(game)) {
      if (this.plays.length || this.bursts.length) this.clear();
      return;
    }
    this.clock += dt;
    const mv = game.hero.vet?.move ?? null;
    const key = mv ? `${mv.id}|${mv.x0}|${mv.y0}|${mv.fx}|${mv.fy}|${mv.globe}` : '';
    for (const p of this.plays) {
      if (mv && p.key === key && p.live) {
        if (dt > 0 && mv.f > p.f) p.rate = Math.max(10, Math.min(120, (mv.f - p.f) / dt));
        p.f = mv.f;
      } else {
        p.live = false;
        p.f += p.rate * dt;
      }
    }
    if (mv && !this.plays.some((p) => p.live && p.key === key)) {
      this.plays.push({ key, m: motionById(mv.id), x0: mv.x0, y0: mv.y0, fx: mv.fx, fy: mv.fy, f: mv.f, rate: 30, live: true, struck: new Set() });
    }
    // (the blows seen landing: each one his move's blow has struck, once, where it stands)
    const live = this.plays.find((p) => p.live);
    if (live && mv) {
      const s = live.m.strikes[0];
      for (const id of mv.hit) {
        if (live.struck.has(id)) continue;
        live.struck.add(id);
        const mon = game.monsters.find((q) => q.id === id);
        if (!mon || !s) continue;
        this.burstOn(live, s, mon.x, mon.y, live.struck.size - 1);
        if (live.m.id === 'uppercut') this.launched.set(id, this.clock);
      }
    }
    this.plays = this.plays.filter((p) => p.live || p.f < p.m.long + AFTER);
    this.bursts = this.bursts.filter((b) => this.plays.includes(b.play) && b.play.f - b.born < 10);
    for (const [id, t] of this.launched) {
      const m = game.monsters.find((q) => q.id === id);
      if (!m || m.dead || (m.stunT <= 0 && this.clock - t > 0.5)) this.launched.delete(id);
    }
    // THE SCREEN SHAKEN on his heavy blows, as the art's film shakes it
    if (live) {
      const F = Math.floor(live.f);
      if (live.m.shake?.some(([a, b]) => F >= a && F <= b)) shake.shake = Math.max(shake.shake, 2);
    }
    // THE GLOBES: each its kind and when it came in; a combo that is over drains away
    const now = game.hero.vet?.globes ?? [];
    if (now.length === 0 && this.slots.length && !this.drain) this.drain = { slots: this.slots, t0: this.clock };
    if (now.length) this.drain = null;
    this.slots = now.map((k, i) => (this.slots[i] && this.slots[i].kind === k ? this.slots[i] : { kind: k, t0: this.clock }));
    if (this.drain && this.clock - this.drain.t0 > 8 / 30) this.drain = null;
  }

  /** A burst on one struck (and, under a heavy blow, a ring along the floor) where it stands, a little toward the blow (the art's). */
  private burstOn(p: Play, s: Strike, mx: number, my: number, n: number): void {
    let ox = p.x0;
    let oy = p.y0;
    let z = 26;
    if (s.force) {
      const g = forceGeo(p.m, s);
      const v = vetView(p.fx, p.fy);
      ox += (g.o[0] * v.f[0] + g.o[1] * v.l[0]) / VET_TILE;
      oy += (g.o[0] * v.f[1] + g.o[1] * v.l[1]) / VET_TILE;
      z = Math.max(24, Math.min(48, g.o[2]));
    }
    const dx = ox - mx;
    const dy = oy - my;
    const dd = Math.hypot(dx, dy) || 1;
    const on = 7 / VET_TILE;
    const react = s.force?.react ?? s.cone?.react ?? 'snap';
    const heavy = s.cone ? false : s.heavy;
    this.bursts.push({
      play: p, born: Math.floor(p.f), x: mx + (dx / dd) * on, y: my + (dy / dd) * on, z, kind: s.kind, heavy, big: s.cone ? 0.9 : (s.burst ?? 1), late: s.under ? 1 : 0,
      ring: heavy && react !== 'shove' ? (react === 'fly' || react === 'launch' ? 1.4 : 1) : 0, seed: 101 + (n % 4) * 17,
    });
  }

  // -------------------------------------------------------------------------------------------
  // HIS FRAME

  /**
   * HIS PICTURE WHILE A MOVE PLAYS: its frame (Math.floor of how far through it he is), turned as he faced as it began, as
   * the game turns heroes (mirrored to face screen-left, from behind facing away). Null: no move, or no art for it.
   */
  shown(game: Game, art: ActorArt): Sprite | null {
    this.art = art;
    const mv = this.moveOf(game);
    if (!mv) return null;
    const v = vetView(mv.fx, mv.fy);
    const c = (v.away ? art.back : art.front).clips?.vet?.[mv.id];
    if (!c || !c.frames.length) return null;
    const s = c.frames[Math.max(0, Math.min(c.frames.length - 1, Math.floor(mv.f)))];
    return v.left ? flipSprite(s) : s;
  }

  /** How high off the floor he is (the art's: his lowest foot, his measure: picture pixels), for his shadow. */
  liftOf(game: Game): number {
    const mv = this.moveOf(game);
    return mv ? vetLiftAt(motionById(mv.id), Math.floor(mv.f)) : 0;
  }

  /** An after-image of him: every solid pixel of a frame, its rim one colour and the rest another (the art's ghost). */
  private ghostOf(s: Sprite, fill: string, edge: string, flip: boolean): Sprite {
    let m = this.ghosts.get(s);
    if (!m) this.ghosts.set(s, (m = new Map()));
    const key = `${fill}${edge}`;
    let gs = m.get(key);
    if (!gs) {
      const w = s.img.width;
      const h = s.img.height;
      const cv = document.createElement('canvas');
      cv.width = w;
      cv.height = h;
      const g = cv.getContext('2d') as CanvasRenderingContext2D;
      g.drawImage(s.img, 0, 0);
      const d = g.getImageData(0, 0, w, h).data;
      const solid = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] === 255;
      const out = g.createImageData(w, h);
      const o = out.data;
      const rgb = (c: string): number[] => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
      const F = rgb(fill);
      const E = rgb(edge);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          if (!solid(x, y)) continue;
          const c = !solid(x - 1, y) || !solid(x + 1, y) || !solid(x, y - 1) || !solid(x, y + 1) ? E : F;
          const i = (y * w + x) * 4;
          o[i] = c[0];
          o[i + 1] = c[1];
          o[i + 2] = c[2];
          o[i + 3] = 255;
        }
      }
      g.putImageData(out, 0, 0);
      gs = { img: cv, w: s.w, h: s.h, ax: s.ax, ay: s.ay };
      if (s.density !== undefined) gs.density = s.density;
      m.set(key, gs);
    }
    return flip ? flipSprite(gs) : gs;
  }

  // -------------------------------------------------------------------------------------------
  // THE LAYERS

  /** A layer of a play's action lines at its frame, mirrored as his picture is, and where it is laid (where he stood, on the screen); or null. */
  private layerOf(p: Play, layer: VetFxLayer, cam: Cam): { s: Sprite; x: number; y: number } | null {
    const art = this.art;
    if (!art) return null;
    const v = vetView(p.fx, p.fy);
    const list = (v.away ? art.back : art.front).clips?.vetFx?.[p.m.id]?.[layer];
    const F = Math.floor(p.f);
    if (!list || F < 0 || F >= list.length) return null;
    const s = list[F];
    if (vetFxNone(s) || s.w <= 1) return null;
    return { s: v.left ? flipSprite(s) : s, x: Math.round(wx(cam, p.x0, p.y0)), y: Math.round(wy(cam, p.x0, p.y0)) };
  }

  /** WHAT LIES ON THE FLOOR, under everyone (render.ts, with the floor's other effects): his action lines' floor layer; the rings under his heavy blows. */
  drawGround(g: CanvasRenderingContext2D, cam: Cam, game: Game): void {
    if (!this.on(game)) return;
    for (const p of this.plays) {
      const l = this.layerOf(p, 'ground', cam);
      if (l) drawSprite(g, l.s, l.x, l.y);
    }
    // SHOCKWAVE RINGS along the floor under the heavy blows, round those they land on
    for (const b of this.bursts) {
      const age = Math.floor(b.play.f - b.born);
      if (!b.ring || age < 0 || age > 9) continue;
      const s = kept(`ring|${b.kind}|${b.ring}|${age}`, 240, 120, (px) => floorRing(px, 120, 60, age, kindCols(b.kind), b.ring));
      drawSprite(g, s, Math.round(wx(cam, b.x, b.y)), Math.round(wy(cam, b.x, b.y)));
    }
  }

  /**
   * WHAT IS BEHIND HIM AT HEIGHT, and his AFTER-IMAGES: what render.ts stands just behind him (`dd` its depth from his), each a
   * picture at a point of the screen. `x`, `y`: where he is drawn (game pixels); `top`: how high his head is over that
   * (render.ts heroAt.top: the bar of his life is over it).
   */
  behind(game: Game, art: ActorArt, x: number, y: number, cam: Cam, top: number): { s: Sprite; x: number; y: number; dd: number }[] {
    this.heroAt = { x, y };
    this.barY = y - top - LIFE_BAR.lift - 1;
    this.art = art;
    const out: { s: Sprite; x: number; y: number; dd: number }[] = [];
    if (!this.on(game)) return out;
    for (const p of this.plays) {
      const l = this.layerOf(p, 'behind', cam);
      if (l) out.push({ ...l, dd: -0.01 });
    }
    // AFTER-IMAGES of him along the strike: where he was a whole frame and half a frame ago
    const live = this.plays.find((p) => p.live);
    if (live && this.moveOf(game)) {
      const v = vetView(live.fx, live.fy);
      const set = v.away ? art.back : art.front;
      const list = set.clips?.vet?.[live.m.id];
      const halves = set.clips?.vetHalves?.[live.m.id];
      const F = Math.floor(live.f);
      const o = placeOf(live.m, F).at;
      for (const s of live.m.strikes) {
        if (!(F > s.from && F <= vetLastHit(s) + 1) || !list) continue;
        for (const [back, fill, edge] of [[1.0, 1, 2], [0.5, 2, 3]] as const) {
          const gf = Math.max(s.from, F - back);
          if (gf >= F) continue;
          const sp = Number.isInteger(gf) ? list.frames[gf] : halves ? halves.frames[Math.round(gf - halves.from)] : undefined;
          if (!sp) continue;
          const at = placeOf(live.m, gf).at;
          const [dx, dy] = screenOf(v, at[0] - o[0], at[1] - o[1]);
          const cols = kindCols(s.kind);
          out.push({ s: this.ghostOf(sp, cols[fill], cols[edge], v.left), x: x + dx, y: y + dy, dd: back === 1 ? -0.006 : -0.004 });
        }
      }
    }
    return out;
  }

  /** WHAT IS OVER EVERYTHING (render.ts, with the air's effects): his action lines' top layer; the bursts of his blows; stars; his globes. */
  drawAir(g: CanvasRenderingContext2D, cam: Cam, game: Game): void {
    if (!this.on(game)) return;
    for (const p of this.plays) {
      const l = this.layerOf(p, 'front', cam);
      if (l) drawSprite(g, l.s, l.x, l.y);
    }
    // THE IMPACTS where his blows land
    for (const b of this.bursts) {
      const age = Math.floor(b.play.f - b.born) - b.late;
      if (age < 0 || age > 6) continue;
      const s = kept(`burst|${b.kind}|${b.heavy}|${b.big}|${b.seed}|${age}`, 160, 140, (px) => impact(px, 80, 70, age, kindCols(b.kind), b.heavy, b.seed, b.big));
      drawSprite(g, s, Math.round(wx(cam, b.x, b.y)), Math.round(wy(cam, b.x, b.y) - b.z / G2));
    }
    // STARS round the head of one his uppercut has launched, while it is stunned
    for (const [id, t] of this.launched) {
      const m = game.monsters.find((q) => q.id === id);
      if (!m || m.dead || this.clock - t < 10 / 30) continue;
      const top = FIGURE_SIZE[figureOf(m)]?.top ?? 28;
      const k = Math.round((((this.clock * 30 * 0.32) % (Math.PI * 2)) / (Math.PI * 2)) * 40) % 40;
      const s = kept(`stars|${k}`, 32, 16, (px) => stars(px, 16, 8, (k / 40) * ((Math.PI * 2) / 0.32)));
      drawSprite(g, s, Math.round(wx(cam, m.x, m.y)), Math.round(wy(cam, m.x, m.y) - top - 4));
    }
    this.drawGlobes(g, game);
  }

  /** THE GLOBES over his head: three, filled as his combo is put in, locked when three are in, a swipe's in fire. */
  private drawGlobes(g: CanvasRenderingContext2D, game: Game): void {
    if (game.level.town || game.over || !this.heroAt) return;
    const h = game.hero;
    const flick = Math.floor(this.clock * 30);
    const level = (s: { kind: VetGlobe; t0: number }): number => (s.kind === 'punchFire' || s.kind === 'kickFire' ? 1 : Math.min(1, ((this.clock - s.t0) * 30 + 1) / FILL[s.kind]));
    const globeOf = (s: { kind: VetGlobe; t0: number } | undefined, drain = 1): Globe => {
      if (!s) return { kind: 'empty' };
      if (s.kind === 'punchFire' || s.kind === 'kickFire') {
        const of = s.kind === 'punchFire' ? 'punch' : 'kick';
        return drain > 0.5 ? { kind: 'fire', of } : { kind: of, level: drain * 2 };
      }
      return { kind: s.kind, level: Math.min(level(s), drain) };
    };
    let row: readonly [Globe, Globe, Globe];
    let locked: boolean;
    if (this.drain) {
      const k = Math.max(0, 1 - ((this.clock - this.drain.t0) * 30) / 8);
      const ss = this.drain.slots;
      row = [globeOf(ss[0], k), globeOf(ss[1], k), globeOf(ss[2], k)];
      locked = ss.length >= 3 && k >= 0.6;
    } else {
      row = [globeOf(this.slots[0]), globeOf(this.slots[1]), globeOf(this.slots[2])];
      // (locked once the third is in, and filled)
      locked = this.slots.length >= 3 && row.every((r) => r.kind === 'fire' || (r.kind !== 'empty' && r.level >= 1));
    }
    const gl = paintGlobes({ globes: row, locked, flick });
    // (over his head, as the art's film has them, ten of his measure over it, following him through his moves; and never down
    // over the bar of his life, which stands over his head in a fight: kept just over where it is drawn)
    const mv = this.moveOf(game);
    const m = mv ? motionById(mv.id) : VET_STAND;
    const F = mv ? Math.floor(mv.f) : 0;
    const head = vetJointAt(m, F, 'head');
    const o = placeOf(m, F).at;
    const [dx, dy] = screenOf(vetView(mv ? mv.fx : h.fx, mv ? mv.fy : h.fy), head[0] - o[0], head[1] - o[1]);
    const tx = this.heroAt.x + dx;
    const ty = this.heroAt.y + dy - (head[2] + 10) / G2;
    const bx = Math.round(tx - GLOBES_W / G2 / 2);
    const by = Math.round(Math.min(ty - (GLOBES_H + 2) / G2, this.barY - 1 - GLOBES_H / G2));
    let cv = this.globeCv;
    if (!cv) {
      cv = this.globeCv = document.createElement('canvas');
      cv.width = GLOBES_W;
      cv.height = GLOBES_H;
    }
    const c = cv.getContext('2d') as CanvasRenderingContext2D;
    const im = c.createImageData(GLOBES_W, GLOBES_H);
    im.data.set(gl.d);
    c.putImageData(im, 0, 0);
    g.drawImage(cv, bx, by, GLOBES_W / G2, GLOBES_H / G2);
  }
}

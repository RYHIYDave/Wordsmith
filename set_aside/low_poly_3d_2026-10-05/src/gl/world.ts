// The game's world drawn in low-poly 3D: the place, what stands in it, the hero and the monsters,
// lit by its fires. The owner, 5 Oct 2026: "I think when I said 2D I really meant low-poly 3D for
// the look"; "I like the sort of cartoonish look, but I think I want the 3D."
//
// Nothing of the rules is here, and nothing of the rules changes: this reads the same Game the
// pixel painter reads (render/render.ts) and draws what is SOLID in it on a canvas of its own,
// which lies under the game's canvas. The pixel painter goes on drawing everything else over it
// (effects, shots, names, bars, the whole interface), with the same camera: a point of the floor
// is at the same place on both. So the look can be switched while the game runs, and the pixel
// look loses nothing by this being here.
//
// Stage 1 (this file as it first stood): dungeons and the practice room. The town is still the
// pixel painter's.

import { WORD_COLOR } from '../art/icons';
import { toWorldX, toWorldY } from '../engine/iso';
import { MONSTERS, SKILLS, TUNE } from '../game/defs';
import type { Game } from '../game/game';
import type { Level, Monster } from '../game/state';
import type { ClassId, Element } from '../game/types';
import type { Cam, Fx } from '../render/fx';
import { batJoints, batParts, bruteBuild, cultistBuild, fallen, joints, knightBuild, mageBuild, rangerBuild, skeletonBuild, wardenBuild } from './figures';
import type { Build, Pose } from './figures';
import { Painter } from './gl';
import type { Draw, Look, Part, PointLight } from './gl';
import { barrel, brazier, chest, fire, urn } from './kit3';
import { CHUNK, FIXED, PX_HIGH, WALL_MAX, buildPiece, wallHeights } from './level3';
import type { Flame } from './level3';
import { hex } from './mesh';
import type { Mesh, RGB } from './mesh';
import { BEAST_BLOW, BEAST_REST, GREAT_BLOW, GREAT_REST, HERO_BLOW, HERO_REST, TUCK, WARDEN_VOLLEY, WHIRL, leap, strike, walk } from './pose';
import type { Beast } from './pose';
import { chestOpen, portalArch, portalLight, portalSwirl, shards, staves } from './props3';
import { gameCam } from './scenes';
import { mats, rotX, rotY, rotZ, scale, translate } from './vec';
import type { M4 } from './vec';

/** Figures are drawn a fifth larger than life against the tiles, as the pixel ones are: they must read on a phone. */
const SIZE = 1.22;
const GUARDIAN = 1.33;
const WARDEN = 1.48;

/**
 * How high each figure's head stands over its floor point, in GAME pixels, as it is drawn here:
 * the bars and names the pixel painter hangs over heads hang from there. (The pixel figures are a
 * little smaller: art/bestiary.ts, FIGURE_SIZE.)
 */
export const TOP3D = {
  monster: { skeleton: 33, archer: 35, cultist: 37, bat: 30, brute: 35, guardian: 49, warden: 64 } as Record<string, number>,
  hero: { warrior: 41, ranger: 37, mage: 42 } as Record<ClassId, number>,
};

const WARM: RGB = [3.0, 1.35, 0.42];
const k3 = (c: RGB, s: number): RGB => [c[0] * s, c[1] * s, c[2] * s];
/** The light a thing of each element gives off. */
const GLOW: Record<Element | 'arcane', RGB> = { phys: [0.8, 0.85, 1.1], fire: [1.7, 0.62, 0.16], frost: [0.4, 0.85, 1.6], lightning: [1.35, 1.25, 0.5], arcane: [0.95, 0.5, 1.6] };

/** A moving thing remembered from one frame to the next: where it was, which way it is turned, how far it has walked. */
interface Seen {
  x: number;
  y: number;
  turn: number;
  gone: number;
  pace: number;
  stamp: number;
}

interface Piece {
  part: Part;
  flames: Flame[];
}

interface Kind {
  build: Build;
  rest: Pose;
  held: { r: boolean; l: boolean };
}

const turnOf = (fx: number, fy: number): number => (Math.atan2(-fy, fx) * 180) / Math.PI;

/** How long ago a monster's attack began, by the rules' own clock (render/figure.ts has the reasons). */
function attackAge(windingUp: boolean, t: number, windup: number): number {
  const left = Math.max(0, t);
  if (windingUp) return windup > 0 ? windup * (1 - Math.max(1e-4, Math.min(1, left / windup))) : 0;
  return windup + TUNE.monsterRecover - Math.min(TUNE.monsterRecover, left);
}

export class World3D {
  readonly canvas: HTMLCanvasElement;
  readonly painter: Painter;
  private level: Level | null = null;
  private heights: Float32Array = new Float32Array(0);
  private pieces = new Map<number, Piece>();
  /** How much of each tile is shown (0..255): it comes up over a moment when the tile is first seen. */
  private shown: Uint8Array = new Uint8Array(0);
  private shownSent = false;
  private parts = new Map<Mesh, Part>();
  private meshes = new Map<string, Mesh>();
  private kinds = new Map<string, Kind>();
  private bat = batParts();
  private seenById = new Map<number, Seen>();
  private heroSeen: Seen | null = null;
  private heroFor: unknown = null;
  /** How far the hero has fallen (0 standing .. 1 lying), once the run is over. */
  private fall = 0;
  private stamp = 0;
  private last = 0;
  // ---- how it is going (see `note`)
  /** 0 = the finest picture; each step up is coarser and quicker. A slow device is moved up by itself. */
  quality = 0;
  /** Held where it is (a playtest, or the player's own choice): it does not move by itself. */
  held = false;
  fps = 0;
  private frames = 0;
  private slow = 0;
  private since = 0;
  private began = 0;
  private built = 0;

  /** The 3D world's canvas is put under `over`, the game's own. Throws where the browser has no WebGL2. */
  constructor(private over: HTMLCanvasElement) {
    const cv = document.createElement('canvas');
    cv.style.cssText = 'display:none;position:absolute;left:0;top:0;transform-origin:0 0;pointer-events:none';
    this.canvas = cv;
    this.painter = new Painter(cv, 2048, 1024);
    const stage = over.parentElement;
    if (stage) stage.insertBefore(cv, over);
  }

  /** A 3D world under the game's canvas, or null where this browser cannot draw one. */
  static make(over: HTMLCanvasElement): World3D | null {
    try {
      return new World3D(over);
    } catch {
      return null;
    }
  }

  /** Nothing of the world is to be seen in 3D just now (the starting screen, the town). */
  hide(): void {
    if (this.canvas.style.display !== 'none') this.canvas.style.display = 'none';
  }

  /** One line about how fast it is going, for the corner of a test page. */
  get note(): string {
    return `3D ${this.fps} fps  detail ${4 - this.quality}/4  ${this.canvas.width}x${this.canvas.height}  ${Math.round(this.painter.drawn / 1000)}k tris`;
  }

  private part(mesh: Mesh): Part {
    let p = this.parts.get(mesh);
    if (!p) {
      p = this.painter.keep(mesh);
      this.parts.set(mesh, p);
    }
    return p;
  }

  /** A mesh made once and kept under a name. */
  private mesh(name: string, make: () => Mesh): Mesh {
    let m = this.meshes.get(name);
    if (!m) {
      m = make();
      this.meshes.set(name, m);
    }
    return m;
  }

  private kind(name: string): Kind {
    let k = this.kinds.get(name);
    if (k) return k;
    switch (name) {
      case 'warrior': k = { build: knightBuild(false), rest: HERO_REST.warrior, held: { r: true, l: true } }; break;
      case 'warrior2': k = { build: knightBuild(true), rest: GREAT_REST, held: { r: true, l: true } }; break;
      case 'ranger': k = { build: rangerBuild(), rest: HERO_REST.ranger, held: { r: false, l: true } }; break;
      case 'mage': k = { build: mageBuild(), rest: HERO_REST.mage, held: { r: true, l: false } }; break;
      case 'skeleton': k = { build: skeletonBuild(), rest: BEAST_REST.skeleton, held: { r: true, l: false } }; break;
      case 'archer': k = { build: skeletonBuild(hex('#b02a4a'), 'bow'), rest: BEAST_REST.archer, held: { r: false, l: true } }; break;
      case 'cultist': k = { build: cultistBuild(), rest: BEAST_REST.cultist, held: { r: true, l: false } }; break;
      case 'brute': k = { build: bruteBuild(false), rest: BEAST_REST.brute, held: { r: true, l: false } }; break;
      case 'guardian': k = { build: bruteBuild(true), rest: BEAST_REST.guardian, held: { r: true, l: false } }; break;
      default: k = { build: wardenBuild(), rest: BEAST_REST.warden, held: { r: true, l: false } }; break;
    }
    this.kinds.set(name, k);
    return k;
  }

  /** Follow a moving thing from the last frame to this one: how far it walked, and its turn eased toward the way it faces. */
  private follow(s: Seen | null, x: number, y: number, fx: number, fy: number, moving: boolean, dt: number, quick: number): Seen {
    const want = turnOf(fx, fy);
    if (!s || this.stamp - s.stamp > 3) return { x, y, turn: want, gone: 0, pace: 0, stamp: this.stamp };
    const d = Math.hypot(x - s.x, y - s.y);
    // (a jump across the room is not a walk)
    if (d < 1.5) s.gone += d;
    s.x = x;
    s.y = y;
    s.pace = moving && dt > 0 ? Math.min(1, s.pace + dt * 7) : Math.max(0, s.pace - dt * 6);
    let turn = ((want - s.turn + 540) % 360) - 180;
    const step = quick * dt;
    turn = Math.max(-step, Math.min(step, turn));
    s.turn += turn;
    s.stamp = this.stamp;
    return s;
  }

  private enter(L: Level): void {
    for (const p of this.pieces.values()) this.painter.drop(p.part);
    this.pieces.clear();
    this.level = L;
    this.heights = wallHeights(L);
    this.shown = new Uint8Array(L.floor.w * L.floor.h);
    for (let i = 0; i < this.shown.length; i++) this.shown[i] = L.explored[i] ? 255 : 0;
    this.shownSent = false;
    this.seenById.clear();
    this.heroSeen = null;
    this.fall = 0;
  }

  /**
   * Draw the world as it is this frame. `cam`: the pixel painter's camera of the same frame (it
   * has just drawn); `W`, `H`: the screen in game pixels; `scale`: device pixels to a game pixel;
   * `t`: the game's clock; `dt`: the game time this frame stands for (0 while paused).
   */
  draw(game: Game, cam: Cam, W: number, H: number, scale0: number, fx: Fx, t: number, dt: number): void {
    const now = performance.now();
    const L = game.level;
    const f = L.floor;
    if (L !== this.level) this.enter(L);
    this.stamp++;
    const cv = this.canvas;
    const over = this.over;
    // ---- the canvas: where the game's own is, and as fine as the device (or coarser, if it is slow)
    if (cv.style.display !== 'block') cv.style.display = 'block';
    if (cv.style.width !== over.style.width) cv.style.width = over.style.width;
    if (cv.style.height !== over.style.height) cv.style.height = over.style.height;
    if (cv.style.transform !== over.style.transform) cv.style.transform = over.style.transform;
    const fine = Math.min(1, 2 / (window.devicePixelRatio || 1)) * [1, 0.75, 0.6, 0.5][this.quality];
    const bw = Math.max(1, Math.round(W * scale0 * fine));
    const bh = Math.max(1, Math.round(H * scale0 * fine));
    if (cv.width !== bw || cv.height !== bh) {
      cv.width = bw;
      cv.height = bh;
    }
    this.painter.shadows(this.quality < 2 ? 2048 : 1024, this.quality < 2 ? 1024 : 512);

    // ---- the camera: the pixel painter's own. The point of the floor that is in the middle of
    // the screen, and as much above and below it as the screen is high.
    const midX = toWorldX(W / 2 - cam.ox, H / 2 - cam.oy);
    const midY = toWorldY(W / 2 - cam.ox, H / 2 - cam.oy);
    const half = H / (32 * Math.SQRT2);
    const sx = (x: number, y: number): number => cam.ox + (x - y) * 16;
    const sy = (x: number, y: number): number => cam.oy + (x + y) * 8;
    const onScreen = (x: number, y: number, m: number, up: number): boolean => {
      const px = sx(x, y);
      const py = sy(x, y);
      return px > -m && px < W + m && py > -m && py < H + m + up;
    };

    // ---- what has been seen: each tile comes up over a moment, near the hero first
    const h = game.hero;
    {
      const sh = this.shown;
      const ex = L.explored;
      let changed = !this.shownSent;
      const step = Math.max(1, Math.round((dt > 0 ? dt : 0.016) * 900));
      const R = 22;
      const tx0 = Math.max(0, Math.floor(h.x) - R);
      const tx1 = Math.min(f.w - 1, Math.floor(h.x) + R);
      const ty0 = Math.max(0, Math.floor(h.y) - R);
      const ty1 = Math.min(f.h - 1, Math.floor(h.y) + R);
      for (let y = ty0; y <= ty1; y++) {
        for (let x = tx0; x <= tx1; x++) {
          const i = y * f.w + x;
          if (ex[i] && sh[i] < 255) {
            sh[i] = Math.min(255, sh[i] + step);
            changed = true;
          }
        }
      }
      if (changed) {
        this.painter.seen(f.w, f.h, sh);
        this.shownSent = true;
      }
    }

    // ---- the pieces of the place that are in the picture (and a little round it: what stands
    // just outside throws its shadow in). Those not built yet are built now: all of them when the
    // place is first seen, afterwards a couple a frame, the nearest first.
    const list: Draw[] = [];
    const M = 76;
    const flames: Flame[] = [];
    const want: number[] = [];
    const c0x = Math.max(0, Math.floor((midX - 26) / CHUNK));
    const c1x = Math.min(Math.floor((f.w - 1) / CHUNK), Math.floor((midX + 26) / CHUNK));
    const c0y = Math.max(0, Math.floor((midY - 26) / CHUNK));
    const c1y = Math.min(Math.floor((f.h - 1) / CHUNK), Math.floor((midY + 26) / CHUNK));
    for (let cy = c0y; cy <= c1y; cy++) {
      for (let cx = c0x; cx <= c1x; cx++) {
        const x0 = cx * CHUNK;
        const y0 = cy * CHUNK;
        const x1 = x0 + CHUNK;
        const y1 = y0 + CHUNK;
        if (sx(x1, y0) < -M || sx(x0, y1) > W + M || sy(x1, y1) < -M || sy(x0, y0) - WALL_MAX * PX_HIGH > H + M) continue;
        const key = cy * 4096 + cx;
        const p = this.pieces.get(key);
        if (p) {
          if (p.part.count > 0) list.push({ part: p.part, m: IDENT });
          for (const fl of p.flames) flames.push(fl);
        } else want.push(key);
      }
    }
    if (want.length) {
      const first = this.pieces.size === 0;
      const dist = (key: number): number => Math.hypot(((key % 4096) + 0.5) * CHUNK - h.x, (Math.floor(key / 4096) + 0.5) * CHUNK - h.y);
      want.sort((a, b) => dist(a) - dist(b));
      const n = first ? want.length : Math.min(2, want.length);
      for (let i = 0; i < n; i++) {
        const key = want[i];
        const made = buildPiece(L, this.heights, key % 4096, Math.floor(key / 4096));
        const p: Piece = { part: made.mesh.data.length ? this.painter.own(made.mesh) : { first: 0, count: 0 }, flames: made.flames };
        this.pieces.set(key, p);
        this.built++;
        if (p.part.count > 0) list.push({ part: p.part, m: IDENT });
        for (const fl of p.flames) flames.push(fl);
      }
    }

    // ---- lights are gathered as things are drawn; the brightest and nearest are used
    const lights: (PointLight & { w: number })[] = [];
    const light = (gx: number, gy: number, z: number, color: RGB, reach: number): void => {
      const d = Math.hypot(gx - midX, gy - midY);
      lights.push({ at: [gy, gx, z], color, reach, w: ((color[0] + color[1] + color[2]) * reach) / (1 + (d * d) / 30) });
    };
    const flicker = (seed: number): number => 0.86 + 0.1 * Math.sin(t * 11 + seed * 2.1) + 0.06 * Math.sin(t * 17.3 + seed * 4.4);
    const known = (x: number, y: number): boolean => {
      const tx = Math.floor(x);
      const ty = Math.floor(y);
      return tx >= 0 && ty >= 0 && tx < f.w && ty < f.h && L.explored[ty * f.w + tx] === 1;
    };

    // ---- the torches on the walls
    const torch = this.part(this.mesh('torch', () => fire(0.09, 0.3, 5)));
    for (const fl of flames) {
      if (!known(fl.x - 0.2, fl.y - 0.2) && !known(fl.x, fl.y)) continue;
      const k = flicker(fl.seed);
      const f1 = Math.sin(t * 12 + fl.seed);
      list.push({ part: torch, m: mats(translate(fl.y, fl.x, fl.z), rotZ(t * 60 + fl.seed * 40), scale(1 + 0.08 * f1, 1 - 0.06 * f1, 0.9 + 0.2 * k)), bright: true });
      if (onScreen(fl.x, fl.y, 120, 60)) light(fl.x + 0.1, fl.y + 0.1, fl.z + 0.25, k3(WARM, 0.5 * k), 4.5);
    }

    // ---- what stands in the place and can change
    const flame = this.part(this.mesh('flame', () => fire(0.24, 0.62, 3)));
    const braziers: { x: number; y: number; k: number; d: number }[] = [];
    for (const p of L.props) {
      if (FIXED.includes(p.kind) || !L.explored[p.ty * f.w + p.tx] || !onScreen(p.x, p.y, 150, 110)) continue;
      // (the painter's X is the game's y)
      const at = translate(p.y, p.x, 0);
      const seed = (p.tx * 7 + p.ty * 13) % 50;
      switch (p.kind) {
        case 'brazier': {
          list.push({ part: this.part(this.mesh(`brazier${seed % 3}`, () => brazier(seed % 3, false))), m: at });
          const k = flicker(seed);
          const f1 = Math.sin(t * 11 + seed * 2.1);
          const f2 = Math.sin(t * 17.3 + seed * 4.4);
          list.push({ part: flame, m: mats(translate(p.y, p.x, 0.88), rotZ(t * 50 + seed * 30), scale(1 + 0.07 * f2, 1 + 0.07 * f1, 1 + 0.16 * f1 + 0.06 * f2)), bright: true });
          braziers.push({ x: p.x, y: p.y, k, d: Math.hypot(p.x - h.x, p.y - h.y) });
          break;
        }
        case 'chest':
          list.push({ part: this.part(p.state === 1 ? this.mesh('chestOpen', chestOpen) : this.mesh('chest', chest)), m: mats(at, rotZ(-45)) });
          if (p.state === 1) light(p.x, p.y, 0.5, [0.9, 0.62, 0.14], 2.2);
          break;
        case 'barrel':
          list.push({ part: this.part(p.state === 1 ? this.mesh(`staves${seed % 3}`, () => staves(seed % 3)) : this.mesh('barrel', barrel)), m: mats(at, rotZ(seed * 23)) });
          break;
        case 'urn':
          list.push({ part: this.part(p.state === 1 ? this.mesh(`shards${seed % 3}`, () => shards(seed % 3)) : this.mesh(`urn${seed % 4}`, () => urn(seed % 4))), m: mats(at, rotZ(seed * 31)) });
          break;
        case 'portal': {
          const on = p.state === 1;
          const turn = rotZ(-45);
          list.push({ part: this.part(this.mesh(on ? 'archOn' : 'arch', () => portalArch(on))), m: mats(at, turn) });
          if (on) {
            list.push({ part: this.part(this.mesh('portalLight', portalLight)), m: mats(at, turn), bright: true });
            list.push({ part: this.part(this.mesh('portalSwirl', portalSwirl)), m: mats(at, turn, translate(0, 0.05, 1.25), rotY(t * 140)), bright: true });
            list.push({ part: this.part(this.mesh('portalSwirl', portalSwirl)), m: mats(at, turn, translate(0, 0.08, 1.25), rotY(-t * 90 + 40), scale(0.6)), bright: true });
            light(p.x + 0.5, p.y + 0.5, 1.3, k3([0.3, 1.5, 1.4], 0.9 + 0.1 * Math.sin(t * 5)), 7);
          }
          break;
        }
        case 'body': {
          const searched = p.state === 1;
          list.push({ part: this.part(this.mesh(searched ? 'fallenDone' : 'fallen', () => fallen(searched))), m: mats(at, rotZ(-20)) });
          if (!searched) light(p.x, p.y, 0.7, k3([0.25, 1.1, 1.0], 0.8 + 0.2 * Math.sin(t * 4)), 3.4);
          break;
        }
        default:
          break;
      }
    }

    // ---- the monsters
    for (const m of game.monsters) {
      if (m.dead || !m.seen) continue;
      if (!onScreen(m.x, m.y, 70, m.boss ? 130 : 80)) continue;
      const fig = m.kind === 'warden' ? 'warden' : m.champion ? 'guardian' : m.kind;
      const frozen = m.frozenT > 0;
      const s = this.follow(this.seenById.get(m.id) ?? null, m.x, m.y, m.fx, m.fy, m.anim === 'walk' && !frozen, dt, 700);
      this.seenById.set(m.id, s);
      const tint = this.tintOf(m, t);
      const size = SIZE * (fig === 'guardian' ? GUARDIAN : fig === 'warden' ? WARDEN : 1);
      const def = MONSTERS[m.kind];
      const whole = m.boss && m.atk === 1 ? TUNE.wardenVolleyWindup : def.windup;
      const age = m.anim === 'attack' ? attackAge(m.state === 'windup', m.t, whole) : -1;
      if (fig === 'bat') {
        // it hangs in the air at about the height of a chest, and stoops as it strikes
        const stoop = age >= 0 ? Math.sin(Math.min(1, age / (whole + TUNE.monsterRecover)) * Math.PI) : 0;
        const z = 1.02 + (frozen ? 0 : 0.12 * Math.sin(t * 2.3 + m.seed * 9)) - 0.42 * stoop;
        const world = mats(translate(m.y, m.x, z), rotZ(s.turn), rotX(-28 * stoop), scale(size));
        for (const j of batJoints(this.bat, frozen ? 0.3 : Math.sin(t * 13 + m.seed * 30))) list.push({ part: this.part(j.mesh), m: mats(world, j.m), tint });
        continue;
      }
      const kind = this.kind(fig);
      let upper = kind.rest;
      if (!frozen && age >= 0) upper = strike(kind.rest, m.boss && m.atk === 1 ? WARDEN_VOLLEY : BEAST_BLOW[fig as Beast], age, whole, TUNE.monsterRecover);
      const pose = walk(upper, s.gone, frozen ? 0 : s.pace, size, frozen ? 0 : t + m.seed * 7, kind.held, m.seed * 40);
      const world = mats(translate(m.y, m.x, 0), rotZ(s.turn), scale(size));
      for (const j of joints(kind.build, pose)) list.push({ part: this.part(j.mesh), m: mats(world, j.m), tint });
      // a cultist's fire lights the floor round it, and far more of it as it swells
      if (fig === 'cultist' && !frozen) light(m.x + m.fx * 0.3, m.y + m.fy * 0.3, 1.5 * size, k3([1.6, 0.3, 0.8], 0.6 * (pose.growR ?? 1)), 3.4);
      if (m.boss || m.champion) light(m.x + m.fx * 0.5, m.y + m.fy * 0.5, 1.6 * size, [1.3, 0.25, 0.6], m.boss ? 5 : 3.6);
      if (m.burnT > 0) light(m.x, m.y, 1, k3(GLOW.fire, 0.6), 3);
    }
    if (this.stamp % 240 === 0) for (const [id, s] of this.seenById) if (this.stamp - s.stamp > 240) this.seenById.delete(id);

    // ---- the hero
    {
      const who = `${h.cls}:${game.seed}`;
      if (who !== this.heroFor) {
        this.heroFor = who;
        this.heroSeen = null;
        this.fall = 0;
      }
      const two = h.cls === 'warrior' && h.gear.mainhand !== null && h.gear.mainhand.weapon === 'greatsword';
      const kind = this.kind(two ? 'warrior2' : h.cls);
      const moving = h.anim === 'walk' || (h.anim === 'attack' && (Math.abs(h.x - (this.heroSeen ? this.heroSeen.x : h.x)) + Math.abs(h.y - (this.heroSeen ? this.heroSeen.y : h.y)) > 0.004));
      const s = this.follow(this.heroSeen, h.x, h.y, h.fx, h.fy, moving && !h.move, dt, 1100);
      this.heroSeen = s;
      let upper = kind.rest;
      let spin = 0;
      let roll = 0;
      let z = 0;
      let legs = true;
      const mv = h.move;
      const ch = h.channel ? SKILLS[h.skills[h.channel.skill].id].kind : null;
      if (mv) {
        const k = Math.min(1, mv.t / mv.dur);
        legs = false;
        if (mv.kind === 'leap') {
          upper = leap(kind.rest, k);
          z = Math.sin(k * Math.PI) * 1.25;
        } else {
          upper = TUCK;
          roll = k * 360;
          z = 0.12 + Math.sin(k * Math.PI) * 0.2;
        }
      } else if (ch === 'whirl') {
        upper = WHIRL;
        spin = (t * 900) % 360;
      } else if (h.attackT > 0 || h.channel) {
        const sk = h.skills[h.attackSkill];
        const def = SKILLS[sk.id];
        // (as the pixel figure has it: the quick attack plays the first animation, the slow one the second; a beam is thrust out)
        const slot = (h.cls === 'mage' && def.kind === 'beam') || def.kind === 'whirl' ? 0 : h.attackSkill === 1 ? 1 : 0;
        const blow = (two ? GREAT_BLOW : HERO_BLOW[h.cls])[slot];
        upper = h.channel ? blow.hit : strike(kind.rest, blow, h.attackAge, h.attackWind, def.follow);
      }
      if (game.over) this.fall = Math.min(1, this.fall + (dt > 0 ? dt : 0.016) * 2.6);
      const pose = legs ? walk(upper, s.gone, s.pace, SIZE, t, kind.held) : upper;
      let world = mats(translate(h.y, h.x, z), rotZ(s.turn + spin));
      if (roll) world = mats(world, translate(0, 0, 0.55), rotX(-roll), translate(0, 0, -0.55));
      if (this.fall > 0) {
        // down: over backward, and still
        const e = this.fall * this.fall * (3 - 2 * this.fall);
        world = mats(world, rotX(86 * e), translate(0, 0, 0.06 * e));
      }
      world = mats(world, scale(SIZE));
      let tint: Draw['tint'];
      if (h.flash > 0) tint = [1, 0.22, 0.3, Math.min(0.7, h.flash * 6)];
      else if (h.chillT > 0) tint = [0.35, 0.6, 1, 0.3];
      else if (h.poisonT > 0) tint = [0.3, 0.9, 0.2, 0.28];
      for (const j of joints(kind.build, pose)) list.push({ part: this.part(j.mesh), m: mats(world, j.m), tint });
    }

    // ---- the light the hero carries (pale, and cool beside a fire's), and every other light there is
    light(h.x + 0.55, h.y + 0.55, 2.1, L.town ? [0.5, 0.55, 0.9] : [0.62, 0.66, 1.15], 9.5);
    const arcane = h.cls === 'mage';
    let shots = 0;
    for (const p of game.projectiles) {
      if (shots++ > 6) break;
      light(p.x, p.y, 0.7, k3(p.hostile ? [1.5, 0.3, 0.5] : GLOW[p.element === 'phys' && arcane ? 'arcane' : p.element], p.look === 'mote' ? 0.35 : p.look === 'wave' ? 0.8 : 0.55), p.look === 'wave' ? 4 : 3);
    }
    for (const o of game.orbs) light(o.x, o.y, 1.0, k3(GLOW[o.element === 'phys' ? 'arcane' : o.element], 0.9), 5);
    for (const q of game.familiars) light(q.x, q.y, 1.2, k3(GLOW[q.element === 'phys' ? 'arcane' : q.element], 0.4), 2.6);
    for (const d of game.drops) if (d.kind === 'word' && d.word && known(d.x, d.y)) light(d.x, d.y, 0.8, k3(hex(WORD_COLOR[d.word]), 1.6), 4.2);
    for (const g of fx.glows) light(g.x, g.y, 0.9, k3([1.5, 1.2, 0.9], 1 - g.t / g.dur), Math.max(2.5, g.r / 9));
    let zl = 0;
    for (const zn of game.zones) {
      if (zn.kind === 'warn' || zn.r < 1.2 || zl++ > 3) continue;
      light(zn.x, zn.y, 0.6, k3(zn.kind === 'burn' ? GLOW.fire : zn.kind === 'ice' ? GLOW.frost : zn.kind === 'storm' ? GLOW.lightning : zn.kind === 'venom' ? [0.4, 1.1, 0.2] : GLOW.arcane, 0.5 * Math.min(1, (zn.dur - zn.t) * 2)), 2 + zn.r);
    }
    // The braziers: the one nearest the hero throws the shadows, the others only light. As the
    // hero walks from one to the next the shadows of the first fade out before those of the
    // second fade in, so that none of them ever jumps.
    braziers.sort((a, b) => a.d - b.d);
    let fireOf: Look['fire'];
    if (braziers.length && braziers[0].d < 10.5) {
      const b0 = braziers[0];
      const next = braziers.length > 1 ? braziers[1].d : 99;
      const shade = Math.max(0, Math.min(1, (next - b0.d) / 2.5)) * Math.max(0, Math.min(1, (10.5 - b0.d) / 2));
      fireOf = { at: [b0.y, b0.x, 1.28], toward: [h.y, h.x, 0.3], color: k3(WARM, 0.95 * b0.k), reach: 9.5, shade, spread: 124 };
      // (a fire with the hero standing right on it would look straight down: it looks a little aside)
      if (b0.d < 0.6) fireOf.toward = [b0.y + 1, b0.x + 1, 0.2];
    }
    for (let i = fireOf ? 1 : 0; i < braziers.length; i++) light(braziers[i].x, braziers[i].y, 1.28, k3(WARM, 0.85 * braziers[i].k), 6.5);
    lights.sort((a, b) => b.w - a.w);
    const most = this.quality >= 3 ? 8 : 16;

    const look: Look = {
      cam: gameCam([midY, midX, 0], half),
      sky: [0.105, 0.11, 0.24],
      ground: [0.035, 0.032, 0.08],
      moonFrom: [0.75, -0.55, 1.15],
      moon: [0.3, 0.33, 0.6],
      fire: fireOf,
      lights: lights.slice(0, most),
      bounds: { at: [midY, midX, 1], half: W / 32 + H / 16 + 3 },
      vignette: 0.42,
      mist: { color: [0.004, 0.003, 0.014], at: [h.y, h.x, 0], near: 9.5, far: 17, most: 0.82 },
      seen: { w: f.w, h: f.h },
    };
    this.painter.paint(look, list);

    // ---- how it is going: a slow device gets a coarser picture, once and for good
    if (!this.began) this.began = now;
    this.frames++;
    if (this.last && now - this.last > 26) this.slow++;
    this.last = now;
    if (now - this.since > 1000) {
      this.fps = Math.round((this.frames * 1000) / (now - this.since));
      if (!this.held && now - this.began > 4000 && this.since > 0 && this.slow > this.frames * 0.4 && this.quality < 3) this.quality++;
      this.since = now;
      this.frames = 0;
      this.slow = 0;
    }
  }

  /** The colour laid over a monster for what ails it, as the pixel painter lays one over its picture. */
  private tintOf(m: Monster, t: number): Draw['tint'] {
    if (m.flash > 0) return [1, 1, 1, 0.85];
    if (m.frozenT > 0) return [0.62, 0.86, 1, 0.72];
    if (m.chillT > 0) return [0.35, 0.6, 1, 0.3];
    if (m.burnT > 0) return [1, 0.42, 0.08, 0.16 + 0.14 * Math.abs(Math.sin(t * 17 + m.id))];
    if (m.poisonT > 0) return [0.3, 0.9, 0.2, Math.min(0.5, 0.2 + m.poisonN * 0.04) + 0.06 * Math.sin(t * 6 + m.id)];
    return undefined;
  }
}

const IDENT: M4 = (() => {
  const m = new Float32Array(16);
  m[0] = m[5] = m[10] = m[15] = 1;
  return m;
})();

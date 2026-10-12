// THE FIRST FIVE FLOORS, DRAWN: EACH FLOOR'S OWN PIECES AND ITS MOMENTS. Where game/first5.ts has laid
// them, the art chat's pictures (art/floor1.ts to floor5.ts, by name: art/floors.ts lookPieces), set as
// its READMEs say (docs/mockups/floor1/README.md and on):
//   a wall piece in its wall's face, on the face turned to screen-left (`left`) or the one in shade
//     (`right`), at one of its places (`spots`), anchored at the foot of the face under the middle of its
//     tile, in depth just in front of the face; one with a heap of its own has its heap (`frames[0]`)
//     standing on the floor tile before it;
//   a floor tile in place of the floor's own picture of that tile;
//   what stands, at the middle of its tile, in depth, with the game's soft shadow under it (`shadow`);
//   the game's own things (braziers, chests, barrels and urns, pillars, bones) as the floor's own;
//   A MOMENT where it is laid, as he comes near and sees it: `before` (or the piece it plays at) until
//     then, its frames, then `after`, at 30 a second, the screen kicked at each of its jolts.
// The moments' films are the painter's (render/painter.ts): without one, what is there stays as it is
// (the piece), or a piece of the floor's stands in for what only the film holds (game/first5.ts, standIn).

import type { MomentFilm } from '../art/films';
import { momentKeys } from '../art/films';
import { lookPieces } from '../art/floors';
import type { Piece } from '../art/floor1';
import type { Sprite } from '../engine/px';
import { FLOOR_SETS } from '../game/first5';
import type { Dress, FloorSet, MomentHost, TilePiece, WallPiece } from '../game/first5';
import type { Game } from '../game/game';
import type { Level, PropInst } from '../game/state';
import type { Stage, Kick } from './dress';
import { wx, wy } from './fx';
import type { Painter } from './painter';

/** The films' own speed. */
const FPS = 30;
/** A moment plays when he comes this near where it is (tiles), and sees it. */
const MOMENT_NEAR = 5.5;
/** The screen's kick at a moment's jolt (game pixels: the art chat's films show 3 and 2). */
const MOMENT_KICK = 3;
/** The pieces that move are played at this many frames a second (a torch's flame, candles). */
const LOOP_FPS = 8;

/** A moment's state on the level: waiting, playing (since `t0`, by the game's clock), over. */
interface Played {
  host: MomentHost;
  state: 'wait' | 'play' | 'done';
  t0: number;
  last: number;
  /** The game prop it plays at (a bell, a heap), if it is one; and the cart's rails' end, which its film takes the place of. */
  prop: PropInst | null;
  also: PropInst | null;
}

export class FloorPieces {
  private level: Level | null = null;
  private dress: Dress | null = null;
  private set: FloorSet | null = null;
  private pieces: Map<string, Piece> | null = null;
  private walls = new Map<number, WallPiece[]>();
  private tiles = new Map<number, TilePiece>();
  private moments: Played[] = [];
  private hosts = new Map<PropInst, Played>();
  private kicked: Kick[] = [];
  private freed: number[] = [];

  constructor(private readonly painter: () => Painter | null) {}

  /** This frame's level: its pieces looked up anew when it is another than last time's. */
  begin(game: Game): boolean {
    const L = game.level;
    if (L === this.level) return this.dress !== null;
    this.level = L;
    this.dress = L.dress ?? null;
    this.walls.clear();
    this.tiles.clear();
    this.moments = [];
    this.hosts.clear();
    if (!this.dress) {
      this.set = null;
      this.pieces = null;
      return false;
    }
    const D = this.dress;
    this.set = FLOOR_SETS[D.floor - 1];
    this.pieces = lookPieces(D.floor);
    for (const w of D.wall) {
      const list = this.walls.get(w.i) ?? [];
      list.push(w);
      this.walls.set(w.i, list);
    }
    for (const t of D.tiles) this.tiles.set(t.i, t);
    const f = L.floor;
    for (const host of D.moments) {
      const site = this.set.moments[host.n];
      const at = (x: number, y: number): PropInst | null => L.props.find((p) => p.kind === 'piece' && p.tx === x && p.ty === y) ?? null;
      const hx = Math.floor(host.x - (site.two ? 1 : 0));
      const hy = Math.floor(host.y);
      const prop = site.at === 'thing' ? at(hx, hy) : null;
      const also = site.rails ? at(hx + 6, hy) : null;
      const pl: Played = { host, state: 'wait', t0: 0, last: -1, prop, also };
      this.moments.push(pl);
      if (prop) this.hosts.set(prop, pl);
      if (also) this.hosts.set(also, pl);
      void f;
    }
    return true;
  }

  private piece(name: string): Piece | undefined {
    return this.pieces?.get(name);
  }

  /** The film of moment `n` of this floor, if the painter has made it. */
  private film(n: number): MomentFilm | null {
    const D = this.dress;
    const p = this.painter();
    if (!D || !p) return null;
    const keys = momentKeys(D.floor);
    if (keys.length === 1) return p.filmOf<MomentFilm[]>(keys[0])?.[n] ?? null;
    return keys[n] ? p.filmOf<MomentFilm>(keys[n]) : null;
  }

  /** A floor tile's picture, where one of the floor's own is laid there. */
  tile(i: number): Sprite | null {
    const t = this.tiles.get(i);
    if (!t) return null;
    const p = this.piece(t.name);
    return p?.frames?.[t.frame] ?? p?.frames?.[0] ?? null;
  }

  /**
   * What is set in the faces of wall tile `i` (its top corner at (px, py) on the screen, its depth `s`):
   * its pieces, and a moment that plays there. Called for every wall tile whose faces are drawn.
   */
  wall(game: Game, i: number, faces: number, s: number, px: number, py: number, t: number, stage: Stage): void {
    const list = this.walls.get(i);
    const pm = this.moments.find((m) => m.host.i === i);
    if (!list && !pm) return;
    for (const w of list ?? []) {
      if (!(faces & (w.side === 0 ? 1 : 2))) continue;
      if (pm && pm.host.side === w.side && this.momentShown(pm)) continue;
      const p = this.piece(w.name);
      if (!p) continue;
      const spots = p.spots && p.spots.length ? p.spots : null;
      const frames = spots ? (w.side === 0 ? spots[w.spot % spots.length].left : spots[w.spot % spots.length].right) : w.side === 0 ? p.left : p.right;
      if (!frames || frames.length === 0) continue;
      const sp = frames[Math.floor(t * LOOP_FPS + i) % frames.length];
      const x = w.side === 0 ? px - 8 : px + 8;
      const y = py + 12;
      stage.stand(s + 1.01, sp, x, y);
      if (sp.lights) stage.lit(sp, x, y);
      // (a piece with a heap of its own: the heap stands on the floor tile before it)
      if (this.set?.heaps.includes(w.name) && p.frames && p.frames[0]) {
        const f = game.level.floor;
        const tx = i % f.w;
        const ty = (i - tx) / f.w;
        const hx = w.side === 0 ? tx + 0.5 : tx + 1.5;
        const hy = w.side === 0 ? ty + 1.5 : ty + 0.5;
        stage.stand(hx + hy, p.frames[0], Math.round(wx(stage.cam, hx, hy)), Math.round(wy(stage.cam, hx, hy)));
      }
    }
    if (pm && faces & (pm.host.side === 0 ? 1 : 2)) {
      const sp = this.momentFrame(pm, game, pm.host.side === 1);
      const site = this.set!.moments[pm.host.n];
      const x = pm.host.side === 0 ? px - 8 : px + 8;
      const y = py + 12;
      if (sp) {
        stage.stand(s + 1.012, sp, x, y);
        if (sp.lights) stage.lit(sp, x, y);
      } else if (site.standIn && !this.film(pm.host.n)) {
        const p = this.piece(site.standIn);
        const fr = p?.spots?.[0] ? (pm.host.side === 0 ? p.spots[0].left : p.spots[0].right) : null;
        if (fr && fr[0]) stage.stand(s + 1.01, fr[0], x, y);
      }
    }
  }

  /** The heaps before wall pieces, and what stands of the floor's own: their soft shadows on the floor. */
  shadows(g: CanvasRenderingContext2D, game: Game, stage: Stage, here: (x: number, y: number) => boolean): void {
    const L = game.level;
    for (const p of L.props) {
      if (!L.explored[p.ty * L.floor.w + p.tx]) continue;
      const name = this.nameOf(p);
      if (!name) continue;
      const pc = this.piece(name);
      if (!pc?.shadow || !here(p.x, p.y)) continue;
      if (p.kind !== 'piece' && p.state === 1 && (p.kind === 'barrel' || p.kind === 'urn')) continue;
      const pm = this.hosts.get(p);
      if (pm && pm.state !== 'wait') continue;
      stage.shadow(g, wx(stage.cam, p.x, p.y), wy(stage.cam, p.x, p.y), pc.shadow);
    }
  }

  /** The name of the floor's own piece a game's prop is shown as, or null (as it always was). */
  nameOf(p: PropInst): string | null {
    const set = this.set;
    if (!set) return null;
    switch (p.kind) {
      case 'piece':
        return p.name ?? null;
      case 'chest':
        return set.chest;
      case 'barrel':
        return set.breakables[p.variant & 1];
      case 'urn':
        return set.breakables[2 + (p.variant & 1)];
      case 'brazier':
        return set.fire;
      case 'pillar':
        return set.pillar;
      case 'bones':
        return set.lying.length ? set.lying[p.variant % set.lying.length] : null;
      default:
        return null;
    }
  }

  /**
   * The picture a prop stands as on this floor (undefined: as it always was, the game's own; null:
   * nothing stands: it lies, or a moment's film has taken its place).
   */
  standing(game: Game, p: PropInst, t: number): Sprite | null | undefined {
    const name = this.nameOf(p);
    if (!name) return p.kind === 'piece' ? null : undefined;
    if (p.kind === 'bones') return null;
    const pc = this.piece(name);
    const fr = pc?.frames;
    if (!fr || fr.length === 0) return undefined;
    const pm = this.hosts.get(p);
    if (pm && this.momentShown(pm)) return null;
    if (p.kind === 'chest') return fr[p.state === 1 && fr[1] ? 1 : 0];
    if (p.kind === 'barrel' || p.kind === 'urn') return p.state === 0 ? fr[0] : null;
    return fr.length >= 3 ? fr[Math.floor(t * LOOP_FPS + p.variant + p.tx) % fr.length] : fr[0];
  }

  /** What lies flat of a prop on this floor (undefined: as it always was): a broken breakable's leavings, the floor's own bones. */
  flat(p: PropInst): Sprite | null | undefined {
    const name = this.nameOf(p);
    if (!name) return undefined;
    const fr = this.piece(name)?.frames;
    if (!fr) return undefined;
    if (p.kind === 'bones') return fr[0];
    if ((p.kind === 'barrel' || p.kind === 'urn') && p.state === 1) return fr[1] ?? null;
    return undefined;
  }

  /** Is a moment's film shown in place of what it plays at (it is ready and waiting with its own `before`, playing, or over)? */
  private momentShown(pm: Played): boolean {
    if (pm.state !== 'wait') return true;
    const film = this.film(pm.host.n);
    return !!film && !!film.before && film.before.length > 0;
  }

  /** The frame of a moment to show now (null: none: nothing of the film is there). */
  private momentFrame(pm: Played, game: Game, right: boolean): Sprite | null {
    const film = this.film(pm.host.n);
    if (!film) return null;
    const side = right && film.right ? film.right : film;
    const now = game.time;
    if (pm.state === 'wait') return side.before && side.before.length ? side.before[Math.floor(now * LOOP_FPS) % side.before.length] : null;
    const k = Math.floor((now - pm.t0) * FPS);
    if (pm.state === 'play' && k < side.frames.length) return side.frames[Math.max(0, k)];
    return side.after && side.after.length ? side.after[Math.floor(now * LOOP_FPS) % side.after.length] : (side.frames[side.frames.length - 1] ?? null);
  }

  /** The moments that stand on the floor (all but those in walls): drawn in depth where they are. */
  standMoments(game: Game, stage: Stage): void {
    for (const pm of this.moments) {
      if (pm.host.i !== undefined) continue;
      const L = game.level;
      const tx = Math.floor(pm.host.x - (this.set?.moments[pm.host.n].two ? 1 : 0));
      const ty = Math.floor(pm.host.y);
      if (!L.explored[ty * L.floor.w + tx]) continue;
      const x = Math.round(wx(stage.cam, pm.host.x, pm.host.y));
      const y = Math.round(wy(stage.cam, pm.host.x, pm.host.y));
      const sp = this.momentFrame(pm, game, false);
      if (sp) {
        stage.stand(pm.host.x + pm.host.y, sp, x, y);
        if (sp.lights) stage.lit(sp, x, y);
        continue;
      }
      // (no film: what only the film holds, a heap of fallen stone or a pit prop, has a piece of the floor's in its place)
      const site = this.set!.moments[pm.host.n];
      if (site.standIn && site.at === 'floor') {
        const fr = this.piece(site.standIn)?.frames;
        if (fr && fr[0]) stage.stand(pm.host.x + pm.host.y, fr[0], x, y);
      }
    }
  }

  /**
   * A step of the floor's moments: one waiting whose film is made plays as he comes near and sees where
   * it is; one playing has its jolts kick the screen; one over leaves what it leaves (and the tile it
   * cleared walked on: `freedTiles`).
   */
  step(game: Game): void {
    if (!this.dress) return;
    const L = game.level;
    const h = game.hero;
    const now = game.time;
    for (const pm of this.moments) {
      const host = pm.host;
      if (pm.state === 'wait') {
        const tx = Math.floor(host.x);
        const ty = Math.floor(host.y);
        if (Math.hypot(h.x - host.x, h.y - host.y) > MOMENT_NEAR || !L.visible[ty * L.floor.w + tx]) continue;
        if (!this.film(host.n)) continue;
        pm.state = 'play';
        pm.t0 = now;
        pm.last = -1;
      }
      if (pm.state !== 'play') continue;
      const film = this.film(host.n);
      if (!film) {
        pm.state = 'done';
        continue;
      }
      const k = Math.floor((now - pm.t0) * FPS);
      for (let f = pm.last + 1; f <= Math.min(k, film.frames.length - 1); f++) {
        const j = film.jolts.indexOf(f);
        if (j >= 0) this.kicked.push({ amount: j === 0 ? MOMENT_KICK : MOMENT_KICK - 1, vol: 0.45 });
      }
      pm.last = k;
      if (k >= film.frames.length) {
        pm.state = 'done';
        if (host.clears !== undefined) this.freed.push(host.clears);
      }
    }
  }

  /** The kicks of the moments' jolts since this was last asked. */
  kicks(): Kick[] {
    const out = this.kicked;
    this.kicked = [];
    return out;
  }

  /** The tiles the moments have cleared since this was last asked (the cart's, gone off down its rails): walked on now. */
  freedTiles(): number[] {
    const out = this.freed;
    this.freed = [];
    return out;
  }
}

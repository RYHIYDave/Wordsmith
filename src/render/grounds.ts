// FLOOR 2 AS THE PRISON'S GROUNDS AT NIGHT, DRAWN (the art chat's pictures, art/grounds.ts: his words of 2 Nov 2026, of floor 2's
// halls, “Yes, redo the halls (Recommended)”; asked whether more of it should be outside, “Mostly outside”; “Yes, hand it over
// (Recommended)”; behind GROUNDS, off until his yes to it in play). As the art chat's README lays it out
// (docs/mockups/floor2_look/README.md, "How to bring it in"):
//   - THE FLOOR: the courtyards' cobbles (his yard's own); the long walk's flags; the gaoler's room's flags, and the passage out
//     through his house; weeds at the foot of every face that stands, the yard's gutter at the outer wall's, straw by the gaoler's
//     door and the block doors, mud and puddles here and there, beaten earth before the ways; a wide puddle lying in a courtyard;
//   - THE WALLS: every face toward a courtyard a cell block's (its kinds by the tile; its corners at the two ends of a run), the
//     prison's high outer wall (his yard's) where no courtyard lies behind, the gaoler's room's own inside;
//   - THE WAYS: a gatehouse at each way's mouth in the courtyard it opens into (open, or barred: its portcullis drawn up), the
//     gaoler's door out of his house, stood as a gate's arch is; the chapel's front and the stair down from floor 1 in place of
//     their three tiles of wall;
//   - THE TORCHES: the yard's torch on every block face of the torch kind and along the outer wall;
//   - THE LIGHT: under the open sky the yard's dark (0.42), the sky's own light over what lies behind the far walls, its vignette;
//     in the gaoler's room the Crypt's (0.88); holes at the torches, the lantern over the gaoler's door and the warm room through
//     it, the chapel's lit doorway, the stair's light; the lit cell windows' glow;
//   - THE SKY: while the hero is in a courtyard (or the ways out of it), over the line of its two far walls the night sky and the
//     tower (his yard's), and what lies behind those walls not drawn there but a few tiles through its ways (render.ts).
// Where the courtyards, the ways, the walk, the chapel and the stair are is the rules' (game/grounds_way.ts).

import { BLOCK_KINDS, GROUNDS, GROUNDS_LIGHTS, makeGroundsArt } from '../art/grounds';
import type { GroundsArt } from '../art/grounds';
import { STRIP } from '../art/gates';
import type { Strip } from '../art/gates';
import type { Sprite } from '../engine/px';
import { stretchAnchor, stretchTiles } from '../game/chapel_way';
import { inGaol } from '../game/grounds_way';
import type { GroundsGate, GroundsPlan, GroundsRect } from '../game/grounds_way';
import { T_FLOOR, T_WALL } from '../game/types';
import type { Level } from '../game/state';
import type { Cam } from './fx';
import { wx, wyFlat } from './fx';
import type { LookLight, LookStand, LookView } from './looks';
import { FACE_LEFT, FACE_RIGHT, wallFaces, wholeFaces } from './walls';

/** Does tile (tx, ty) lie behind courtyard `r`'s far walls on the screen (past their line, in the band they hide)? */
export function behindOf(r: GroundsRect, tx: number, ty: number): boolean {
  const x0 = r.x;
  const y0 = r.y;
  const x1 = r.x + r.w - 1;
  const u = tx - ty;
  return (tx < x0 - 1 && u >= x0 - (r.y + r.h - 1) - 1 && u <= x0 - y0) || (ty < y0 - 1 && u >= x0 - y0 && u <= x1 - y0 + 1);
}

/** A small hash of a tile, 0 to 1. */
function hash(x: number, y: number, k: number): number {
  let h = Math.imul(x * 374761393 + y * 668265263 + k * 2147483647, 1274126177);
  h ^= h >>> 13;
  h = Math.imul(h, 1103515245);
  return ((h >>> 0) % 10007) / 10007;
}

/** How high the far walls stand to their tops (game pixels: a block's roof ridge, 148 picture pixels, a tile back; the outer wall's merlons, 176), for the sky's own light over them. */
const FAR_WALL_UP = 84;
/** How many tiles beyond a way through a far wall are drawn while the sky is over that wall. */
const THROUGH = 4;

interface Laid {
  plan: GroundsPlan;
  /** One of its own floor tiles at a tile (by index). */
  tiles: Map<number, Sprite>;
  /** Each face that stands: its picture (left, right). */
  faces: Map<number, [Sprite | null, Sprite | null]>;
  /** The faces not drawn (a way's picture or a stretch's stands there): the bits of FACE_LEFT and FACE_RIGHT. */
  hidden: Map<number, number>;
  torches: { x: number; y: number; alongX: boolean }[];
  puddles: LookStand[];
  lights: LookLight[];
}

export class GroundsView implements LookView {
  private art: GroundsArt | null = null;
  private cache: Laid | null = null;
  private cacheFor: Level | null = null;
  /** The courtyard the sky is over this frame (its rectangle), or null (render.ts sets it: `skyOver`). */
  private sky: GroundsRect | null = null;
  /** Whether the hero is indoors this frame (the gaoler's room and the passage out through his house). */
  private indoors = false;

  get dark(): number {
    return this.indoors ? GROUNDS_LIGHTS.gaol.a : GROUNDS_LIGHTS.dark.a;
  }

  on(L: Level): boolean {
    return GROUNDS.on && !L.town && !L.act1 && !!L.grounds;
  }
  warm(): void {
    this.A();
  }
  A(): GroundsArt {
    return (this.art ??= makeGroundsArt());
  }
  private tile(n: string): Sprite {
    return this.A().tiles.find((q) => q.name === n)!.frames![0];
  }
  private piece(n: string) {
    return this.A().pieces.find((q) => q.name === n);
  }

  /**
   * THIS FRAME: where the hero is (render.ts, before the floor is drawn). Indoors in the gaoler's room, no sky; else the courtyard
   * he is in, or the one whose ways he is in (the last he was in), is under the sky. Returns that courtyard, or null.
   */
  skyOver(L: Level, hx: number, hy: number, inYard: boolean): GroundsRect | null {
    const P = L.grounds;
    if (!P) return (this.sky = null);
    // (in his yard, the yard's own sky: render/yard.ts)
    if (inYard) {
      this.indoors = false;
      this.sky = null;
      return null;
    }
    this.indoors = inGaol(P, Math.floor(hx), Math.floor(hy));
    if (this.indoors) return (this.sky = null);
    const x = Math.floor(hx);
    const y = Math.floor(hy);
    const here = L.floor.rooms.find((r) => r.kind !== 'boss' && r.kind !== 'start' && x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h);
    if (here) this.sky = { x: here.x, y: here.y, w: here.w, h: here.h };
    else if (this.sky) {
      // (out of every courtyard: the last one's sky only while he is in the ways out of it on its near side, a few tiles; through a
      // way in its far walls, or farther off, none, and everything drawn. It had stayed over wherever he went, the halls and the
      // rooms behind that courtyard's far walls left undrawn round him, and the sky's picture, laid along walls far off, short of
      // the screen. His words, 3 Nov 2026, 22:15: “The ground in level 2 isn’t loading properly so rooms and hallways are filled
      // with the sky, and the sky will sometimes be half black”.)
      const r = this.sky;
      const near = x >= r.x - THROUGH && x < r.x + r.w + THROUGH && y >= r.y - THROUGH && y < r.y + r.h + THROUGH;
      if (!near || behindOf(r, x, y)) this.sky = null;
    }
    return this.sky;
  }
  /** Is the sky over a courtyard this frame (and so the yard's dark, its vignette)? */
  outdoors(): boolean {
    return !this.indoors;
  }

  /** While the sky is over courtyard `r`, is tile (tx, ty) drawn? Not what lies behind its far walls on the screen, but a few tiles through the ways in them. */
  shows(L: Level, tx: number, ty: number): boolean {
    const r = this.sky;
    if (!r) return true;
    const x0 = r.x;
    const y0 = r.y;
    if (!behindOf(r, tx, ty)) return true;
    for (const g of L.grounds?.gates ?? []) {
      if (!g.alongX && g.line === x0 && ty >= g.a - 1 && ty <= g.a + 3 && tx >= x0 - 1 - THROUGH && tx < x0) return true;
      if (g.alongX && g.line === y0 && tx >= g.a - 1 && tx <= g.a + 3 && ty >= y0 - 1 - THROUGH && ty < y0) return true;
    }
    return false;
  }

  /** THE SKY AND THE TOWER, over what lies behind the courtyard's far walls on the screen (as his yard's: render/yard.ts `back`). */
  drawSky(g: CanvasRenderingContext2D, cam: Cam, W: number, H: number): void {
    const r = this.sky;
    if (!r) return;
    const A = this.A();
    const tx = wx(cam, r.x, r.y);
    const ty = wyFlat(cam, r.x, r.y);
    const lx = wx(cam, r.x, r.y + r.h);
    const ly = wyFlat(cam, r.x, r.y + r.h);
    const rx = wx(cam, r.x + r.w, r.y);
    const ry = wyFlat(cam, r.x + r.w, r.y);
    if (rx < 0 || lx > W || ty - A.beyond.ay > H) return;
    g.save();
    g.beginPath();
    g.moveTo(lx, ly);
    g.lineTo(tx, ty);
    g.lineTo(rx, ry);
    g.lineTo(rx, -10);
    g.lineTo(lx, -10);
    g.closePath();
    g.clip();
    const b = A.beyond;
    // (the sky's picture is his yard's, 13 tiles across: laid again along a wider courtyard's far walls)
    for (const [ox, oy] of this.skySpots(r)) {
      const sx = Math.round(wx(cam, r.x + ox, r.y + oy));
      const sy = Math.round(wyFlat(cam, r.x + ox, r.y + oy));
      g.drawImage(b.img, sx - b.ax, sy - b.ay, b.w, b.h);
    }
    const t = A.tower;
    g.drawImage(t.img, Math.round(tx) - t.ax, Math.round(ty) - t.ay, t.w, t.h);
    g.restore();
  }
  /** Where the sky's picture is laid along a courtyard's far walls (from its far corner): enough to cover both. */
  private skySpots(r: GroundsRect): [number, number][] {
    const out: [number, number][] = [[0, 0]];
    for (let k = 12; k < r.w + 2; k += 12) out.push([k, 0]);
    for (let k = 12; k < r.h + 2; k += 12) out.push([0, k]);
    return out;
  }

  /** THE SKY'S OWN LIGHT: the dark over what lies behind the far walls taken down by a share of it, on the dark's own canvas. */
  skyLift(dg: CanvasRenderingContext2D, cam: Cam): void {
    const r = this.sky;
    if (!r) return;
    dg.save();
    dg.globalCompositeOperation = 'destination-out';
    dg.globalAlpha = GROUNDS_LIGHTS.dark.skyLift;
    dg.beginPath();
    dg.moveTo(wx(cam, r.x, r.y + r.h), wyFlat(cam, r.x, r.y + r.h) - FAR_WALL_UP);
    dg.lineTo(wx(cam, r.x, r.y), wyFlat(cam, r.x, r.y) - FAR_WALL_UP);
    dg.lineTo(wx(cam, r.x + r.w, r.y), wyFlat(cam, r.x + r.w, r.y) - FAR_WALL_UP);
    dg.lineTo(wx(cam, r.x + r.w, r.y), -10);
    dg.lineTo(wx(cam, r.x, r.y + r.h), -10);
    dg.closePath();
    dg.fillStyle = '#000';
    dg.fill();
    dg.restore();
  }

  /** Its vignette under the sky (his yard's); indoors the game's own. */
  get vignette(): number | undefined {
    return this.indoors ? undefined : GROUNDS_LIGHTS.dark.vignette;
  }

  private of(L: Level): Laid {
    if (this.cacheFor === L && this.cache) return this.cache;
    this.cacheFor = L;
    const P = L.grounds!;
    const f = L.floor;
    const W = f.w;
    const A = this.A();
    const isFloor = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < W && y < f.h && f.tiles[y * W + x] === T_FLOOR;
    const isWall = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < W && y < f.h && f.tiles[y * W + x] === T_WALL;
    const yard = f.yard;
    const inYard = (x: number, y: number): boolean => !!yard && x >= yard.x - 1 && x <= yard.x + yard.n && y >= yard.y - 1 && y <= yard.y + yard.n;
    // THE FACES NOT DRAWN: a way's two tiles of wall either side of its mouth; the stair's and the chapel's three
    const hidden = new Map<number, number>();
    const hide = (i: number, bit: number): void => {
      hidden.set(i, (hidden.get(i) ?? 0) | bit);
    };
    for (const g of P.gates) {
      for (const k of [-1, 3]) {
        const [x, y] = g.alongX ? [g.a + k, g.line - 1] : [g.line - 1, g.a + k];
        if (isWall(x, y)) hide(y * W + x, g.alongX ? FACE_LEFT : FACE_RIGHT);
      }
    }
    for (const s of [P.wayIn, P.chapel]) if (s) for (const i of stretchTiles(f, s)) hide(i, s.alongX ? FACE_LEFT : FACE_RIGHT);
    // EACH FACE THAT STANDS, its picture: the gaoler's room's inside, a block's toward a courtyard, the outer wall where none is behind
    const whole = true;
    const faces = new Map<number, [Sprite | null, Sprite | null]>();
    const torches: { x: number; y: number; alongX: boolean }[] = [];
    const lights: LookLight[] = [];
    const torchFace = [A.block.faceLeft[BLOCK_KINDS.indexOf('torch')], A.block.faceRight[BLOCK_KINDS.indexOf('torch')]];
    const doorFace = [A.block.faceLeft[BLOCK_KINDS.indexOf('door')], A.block.faceRight[BLOCK_KINDS.indexOf('door')]];
    const standing = (x: number, y: number, left: boolean): boolean => {
      if (!isWall(x, y)) return false;
      const i = y * W + x;
      const bit = left ? FACE_LEFT : FACE_RIGHT;
      return ((whole ? wholeFaces(f, i) : wallFaces(f, i)) & bit) !== 0 && !((hidden.get(i) ?? 0) & bit);
    };
    const doors: [number, number][] = [];
    const feet: { x: number; y: number; alongX: boolean; outer: boolean }[] = [];
    for (let y = 0; y < f.h; y++) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        if (f.tiles[i] !== T_WALL || inYard(x, y)) continue;
        const pics: [Sprite | null, Sprite | null] = [null, null];
        for (const left of [true, false]) {
          if (!standing(x, y, left)) continue;
          // (what lies before it, and behind it)
          const [fx, fy] = left ? [x, y + 1] : [x + 1, y];
          const back = (d: number): [number, number] => (left ? [x, y - d] : [x - d, y]);
          let pic: Sprite;
          let outer = false;
          const [bx, by] = back(1);
          if (isFloor(fx, fy) && inGaol(P, fx, fy)) pic = A.gaol.face(left, x, y);
          else if (!isFloor(fx, fy) && isFloor(bx, by) && inGaol(P, bx, by)) pic = A.block.face(left, x, y);
          else {
            // (a block: what lies behind it is a courtyard, or more of the block; the outer wall has the dark behind it)
            let behind = false;
            for (let d = 1; d <= 24; d++) {
              const [qx, qy] = back(d);
              if (isWall(qx, qy)) continue;
              behind = isFloor(qx, qy);
              break;
            }
            if (isFloor(fx, fy) && behind) {
              // (a cell block: its corners at the two ends of a run)
              const [px, py] = left ? [x - 1, y] : [x, y - 1];
              const [nx, ny] = left ? [x + 1, y] : [x, y + 1];
              const end = !standing(px, py, left) ? 'low' : !standing(nx, ny, left) ? 'high' : undefined;
              pic = A.block.face(left, x, y, end);
              const k = left ? 0 : 1;
              if (pic === torchFace[k]) torches.push(left ? { x: x + 0.5, y: y + 1, alongX: true } : { x: x + 1, y: y + 0.5, alongX: false });
              if (pic === doorFace[k]) doors.push([fx, fy]);
            } else {
              // (the prison's high outer wall: his yard's own faces; a torch on it every seven tiles)
              outer = true;
              pic = left ? A.wall.faceLeft[(((x * 5 + 2) % 4) + 4) % 4] : A.wall.faceRight[(((y * 3 + 1) % 4) + 4) % 4];
              if (isFloor(fx, fy) && (left ? x : y) % 7 === 3) torches.push(left ? { x: x + 0.5, y: y + 1, alongX: true } : { x: x + 1, y: y + 0.5, alongX: false });
            }
          }
          pics[left ? 0 : 1] = pic;
          if (isFloor(fx, fy)) feet.push({ x: fx, y: fy, alongX: left, outer });
          // (a lit cell window's glow: its picture's own, no hole)
          for (const l of pic.lights ?? []) lights.push({ x, y, up: pic.ay - l.y, dx: l.x - pic.ax, r: 0, strength: 0, glow: { r: l.r, color: l.color, a: l.a ?? 0.5 }, still: true });
        }
        if (pics[0] || pics[1]) faces.set(i, pics);
      }
    }
    // THE FLOOR'S OWN: the gaoler's flags indoors, the walk, and over the cobbles what lies there
    const tiles = new Map<number, Sprite>();
    const solidAt = new Set<number>();
    for (const p of L.props) if (p.solid) solidAt.add(p.ty * W + p.tx);
    const free = (x: number, y: number): boolean => isFloor(x, y) && !tiles.has(y * W + x) && !P.walk[y * W + x] && !inYard(x, y) && !L.dress?.tiles.some((t) => t.i === y * W + x);
    for (let y = 0; y < f.h; y++) for (let x = 0; x < W; x++) if (isFloor(x, y) && inGaol(P, x, y)) tiles.set(y * W + x, A.gaol.floor(x, y));
    for (let i = 0; i < P.walk.length; i++) if (P.walk[i] && !tiles.has(i)) tiles.set(i, A.walk(i % W, Math.floor(i / W)));
    // (beaten earth before every way, on the courtyard's side of its mouth)
    for (const g of P.gates) {
      if (g.kind === 'gaol') continue;
      for (let k = -1; k <= 3; k++) {
        for (const d of [0, 1]) {
          const [x, y] = g.alongX ? [g.a + k, g.line + d] : [g.line + d, g.a + k];
          if (free(x, y) && hash(x, y, 811) < (d === 0 ? 0.7 : 0.35)) tiles.set(y * W + x, this.tile('beaten earth'));
        }
      }
    }
    // (straw by the gaoler's door and the block doors)
    const straw = (cx: number, cy: number, n: number): void => {
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (free(cx + dx, cy + dy) && hash(cx + dx, cy + dy, 813 + n) < 0.4) tiles.set((cy + dy) * W + cx + dx, this.tile(hash(cx + dx, cy + dy, 815) < 0.5 ? 'straw' : 'a drift of straw'));
    };
    for (const g of P.gates) if (g.kind === 'gaol') straw(g.line + 1, g.a + 1, 0);
    doors.forEach(([x, y], n) => straw(x, y, n + 1));
    // (weeds at the foot of every block face, every other tile or so; the gutter at the outer wall's foot)
    for (const q of feet) {
      if (!free(q.x, q.y)) continue;
      if (q.outer) tiles.set(q.y * W + q.x, this.tile(q.alongX ? 'gutter along x' : 'gutter along y'));
      else if (!inGaol(P, q.x, q.y) && hash(q.x, q.y, 817) < 0.55) tiles.set(q.y * W + q.x, this.tile(q.alongX ? 'weeds along x' : 'weeds along y'));
    }
    // (mud, churned mud and puddles a tile in ten)
    const wet = ['mud', 'churned mud', 'a puddle', 'a little puddle', 'mud', 'a long puddle'];
    for (let y = 0; y < f.h; y++) for (let x = 0; x < W; x++) if (free(x, y) && !inGaol(P, x, y) && !solidAt.has(y * W + x) && hash(x, y, 819) < 0.08) tiles.set(y * W + x, this.tile(wet[Math.floor(hash(x, y, 821) * wet.length)]));
    // (a wide puddle lying in a courtyard here and there)
    const puddles: LookStand[] = [];
    P.courts.forEach((r, n) => {
      if (hash(r.x, r.y, 823) < 0.45) return;
      const big = hash(r.x, r.y, 825) < 0.5;
      const pic = this.piece(big ? 'a great puddle' : 'a wide puddle')?.frames?.[0];
      if (!pic) return;
      for (let k = 0; k < 30; k++) {
        const x = r.x + 2 + Math.floor(hash(n, k, 827) * (r.w - 4));
        const y = r.y + 2 + Math.floor(hash(n, k, 829) * (r.h - 4));
        let ok = true;
        for (let dy = -1; dy <= 1 && ok; dy++) for (let dx = -1; dx <= 1 && ok; dx++) ok = free(x + dx, y + dy) && !solidAt.has((y + dy) * W + x + dx);
        if (!ok) continue;
        puddles.push({ x: x + 0.5, y: y + 0.5, s: pic });
        break;
      }
    });
    // THE LIGHT
    const Lt = GROUNDS_LIGHTS;
    for (const q of torches) lights.push({ x: q.x, y: q.y, up: Lt.torch.up, r: Lt.torch.r, strength: Lt.torch.strength, glow: null });
    for (const g of P.gates) {
      if (g.kind !== 'gaol') continue;
      // (the lantern over his door, at the doorway's middle; the warm room through it, a tile and a half inside)
      const [mx, my] = g.alongX ? [g.a + 1.5, g.line] : [g.line, g.a + 1.5];
      lights.push({ x: mx, y: my, up: Lt.lantern.up, r: Lt.lantern.r, strength: Lt.lantern.strength, glow: null });
      const [rx, ry] = g.alongX ? [mx, my - Lt.lantern.room.into] : [mx - Lt.lantern.room.into, my];
      lights.push({ x: rx, y: ry, up: 0, r: Lt.lantern.room.r, strength: Lt.lantern.room.strength, glow: null });
    }
    if (P.chapel) {
      const a = stretchAnchor(P.chapel);
      const [x, y] = P.chapel.alongX ? [a.x, a.y + Lt.chapel.out] : [a.x + Lt.chapel.out, a.y];
      lights.push({ x, y, up: Lt.chapel.up, r: Lt.chapel.r, strength: Lt.chapel.strength, glow: null, still: true });
    }
    if (P.wayIn) {
      const a = stretchAnchor(P.wayIn);
      const [x, y] = P.wayIn.alongX ? [a.x, a.y + Lt.wayIn.into] : [a.x + Lt.wayIn.into, a.y];
      lights.push({ x, y, up: Lt.wayIn.up, r: Lt.wayIn.r, strength: Lt.wayIn.strength, glow: null, still: true });
    }
    // (the glows on the chapel's and the stair's pictures)
    for (const s of [P.chapel, P.wayIn]) {
      if (!s) continue;
      const pic = s === P.chapel ? A.chapel(s.alongX) : A.wayIn(s.alongX);
      const a = stretchAnchor(s);
      for (const l of pic.lights ?? []) lights.push({ x: a.x, y: a.y, up: pic.ay - l.y, dx: l.x - pic.ax, r: 0, strength: 0, glow: { r: l.r, color: l.color, a: l.a ?? 0.5 }, still: true });
    }
    // (the grounds' own braziers: as the game lights one)
    for (const p of L.props) if (p.kind === 'piece' && p.name === 'brazier of irons') lights.push({ x: p.x, y: p.y, up: Lt.brazier.up, r: Lt.brazier.r, strength: Lt.brazier.strength, glow: null });
    this.cache = { plan: P, tiles, faces, hidden, torches, puddles, lights };
    return this.cache;
  }

  laid(L: Level, tx: number, ty: number): Sprite | null {
    return this.of(L).tiles.get(ty * L.floor.w + tx) ?? null;
  }
  flags(tx: number, ty: number): Sprite {
    return this.A().floor(tx, ty);
  }
  face(L: Level, left: boolean, tx: number, ty: number): Sprite {
    const pics = this.of(L).faces.get(ty * L.floor.w + tx);
    const pic = pics ? pics[left ? 0 : 1] : null;
    if (pic) return pic;
    const A = this.A();
    return left ? A.wall.faceLeft[0] : A.wall.faceRight[0];
  }
  unfaced(L: Level, i: number, which: number): number {
    const h = this.of(L).hidden.get(i);
    return h === undefined ? which : which & ~h;
  }
  graded(s: Sprite): Sprite {
    return s;
  }
  lights(L: Level): readonly LookLight[] {
    return this.of(L).lights;
  }
  flats(L: Level): readonly LookStand[] {
    return this.of(L).puddles;
  }

  /** The ways' gatehouses and the gaoler's door, as strips at their mouths; the chapel and the stair; the torches. */
  stands(L: Level, t: number): readonly LookStand[] {
    const C = this.of(L);
    const A = this.A();
    const out: LookStand[] = [];
    const strips = (g: GroundsGate, list: Strip[]): void => {
      for (const q of list) {
        const [x, y] = g.alongX ? [g.a + q.t, g.line] : [g.line, g.a + q.t];
        out.push({ x, y, s: q.s, d: x + y + STRIP / 64 });
      }
    };
    for (const g of C.plan.gates) strips(g, A.gateway(g.alongX, g.kind));
    for (const s of [C.plan.chapel, C.plan.wayIn]) {
      if (!s) continue;
      const a = stretchAnchor(s);
      out.push({ x: a.x, y: a.y, s: s === C.plan.chapel ? A.chapel(s.alongX) : A.wayIn(s.alongX), d: a.x + a.y - 0.5 });
    }
    const torch = this.piece("the yard's torch");
    if (torch) {
      for (const q of C.torches) {
        const list = (q.alongX ? torch.left : torch.right) ?? torch.frames ?? [];
        if (list.length) out.push({ x: q.x, y: q.y, s: list[Math.floor(t * 8 + q.x + q.y) % list.length], d: q.x + q.y - 0.5 });
      }
    }
    // (the wells, the tumbrils and the braziers before the chapel are floor 2's pieces now: render/pieces.ts stands them)
    return out;
  }
}

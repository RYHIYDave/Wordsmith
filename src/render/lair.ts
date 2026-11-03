// FLOOR 5, THE MINE THAT BECOMES HIS TEMPLE, DRAWN (the art chat's pictures, art/lair_temple.ts: his “A, through the threshold
// (Recommended)” and “Yes, hand them over (Recommended)”, 2 Nov 2026; behind LAIR_TEMPLE, off until his yes to it in play). As the art
// chat's README lays it out (docs/mockups/floor5_look/README.md, "How to bring it in"):
//   - THE FLOOR, by its part (game/lair_way.ts): the mine's packed earth with the rails laid along the way through it, grit at the
//     feet of its walls and here and there; the temple's black flags with the rift's cracks out from the rift, bones here and there;
//   - THE WALLS by the part of the floor before them: the mine's timbered rock (a lantern on some posts), the temple's carved black
//     stone; his hall's ring of wall, the rift's cracks breathing up it; the threshold standing in each doorway where the mine meets
//     the temple, the wall either side of its way its own;
//   - THE LIGHT: its lantern-lit dark, 0.8; each lantern, each lantern post and each brazier, the mine's rock lit low between them,
//     the rift's glowing cracks, the rift itself, his hall's cracked wall.

import { LAIR_LIGHTS, LAIR_TEMPLE, gradeColour, makeLairTempleArt } from '../art/lair_temple';
import type { LairArt } from '../art/lair_temple';
import { floorLook } from '../art/floors';
import { STRIP } from '../art/gates';
import { WALL_LOOK } from '../art/ground';
import { hash } from '../art/kit';
import type { Sprite } from '../engine/px';
import { thresholdFace } from '../game/lair_way';
import { T_FLOOR, T_WALL } from '../game/types';
import type { Room } from '../game/types';
import type { Level } from '../game/state';
import { gradeOnPage } from './looks';
import type { LookLight, LookStand, LookView } from './looks';
import { wallFaces, wallsAway } from './walls';

const TEMPLE = 2;

interface Laid {
  tiles: Map<number, Sprite[]>;
  hall: Room | null;
  /** The wall tiles either side of a threshold's way (its own front takes their place): which face. */
  covered: Map<number, boolean>;
  strips: LookStand[];
  lights: LookLight[];
}

export class LairView implements LookView {
  readonly dark = LAIR_LIGHTS.dark;
  private art: LairArt | null = null;
  private cache: Laid | null = null;
  private cacheFor: Level | null = null;
  private gradedMemo = new WeakMap<Sprite, Sprite>();

  on(L: Level): boolean {
    return LAIR_TEMPLE.on && !L.town && L.floor.depth >= 1 && floorLook(L.floor.depth) === 5 && !!L.dress && !!L.lair;
  }
  warm(): void {
    this.A();
  }
  private A(): LairArt {
    return (this.art ??= makeLairTempleArt());
  }
  /** The temple's part at tile i (else the mine's). */
  private temple(L: Level, i: number): boolean {
    return L.lair?.part[i] === TEMPLE;
  }
  private named(n: string, temple: boolean): Sprite[] {
    const A = this.A();
    return ((temple ? A.temple : A.mine).tiles.find((q) => q.name === n)?.frames ?? []) as Sprite[];
  }

  private of(L: Level): Laid {
    if (this.cacheFor === L && this.cache) return this.cache;
    this.cacheFor = L;
    const f = L.floor;
    const W = f.w;
    const A = this.A();
    const plan = L.lair!;
    const tiles = new Map<number, Sprite[]>();
    const lights: LookLight[] = [];
    const isFloor = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < W && y < f.h && f.tiles[y * W + x] === T_FLOOR && !(f.cut && f.cut[y * W + x] !== 0);
    const isWall = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < W && y < f.h && f.tiles[y * W + x] === T_WALL;
    const solidAt = new Set<number>();
    for (const p of L.props) if (p.solid) solidAt.add(p.ty * W + p.tx);
    const dressed = new Set<number>((L.dress?.tiles ?? []).map((t) => t.i));
    const hall = f.rooms.find((r) => r.kind === 'boss') ?? null;
    // THE RAILS and THE RIFT'S CRACKS (game/lair_way.ts)
    for (const r of plan.rails) tiles.set(r.i, this.named(r.name, false));
    for (const c of plan.cracks) {
      tiles.set(c.i, this.named(c.name, true));
      if (c.glow) {
        const C = LAIR_LIGHTS.crack;
        lights.push({ x: (c.i % W) + 0.5, y: Math.floor(c.i / W) + 0.5, up: 0, r: C.r, strength: C.strength, glow: { ...C.glow } });
      }
    }
    // GRIT at the feet of the mine's walls and here and there; BONES on the temple's flags here and there
    const away = wallsAway(f, WALL_LOOK);
    for (let y = 0; y < f.h; y++) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        if (!isFloor(x, y) || tiles.has(i) || dressed.has(i) || solidAt.has(i)) continue;
        const h = hash(x, y, 5201);
        if (this.temple(L, i)) {
          if (h > 0.972) tiles.set(i, this.named('bones on the flags', true));
          continue;
        }
        const wallX = isWall(x, y - 1) && !away[(y - 1) * W + x];
        const wallY = isWall(x - 1, y) && !away[y * W + x - 1];
        if (wallX && h < 0.32) tiles.set(i, this.named('grit at a wall along x', false));
        else if (wallY && h < 0.32) tiles.set(i, this.named('grit at a wall along y', false));
        else if (h > 0.965) tiles.set(i, this.named('grit and stones', false));
      }
    }
    // THE THRESHOLDS: their strips, stood as a gate's arch is (from the tile before the way to the tile after it, at its face line)
    const covered = new Map<number, boolean>();
    const strips: LookStand[] = [];
    for (const t of plan.thresholds) {
      const face = thresholdFace(t);
      for (const q of A.threshold(t.alongX)) {
        const [x, y] = t.alongX ? [t.a + q.t, face] : [face, t.a + q.t];
        strips.push({ x, y, s: q.s, d: x + y + STRIP / 64 });
      }
      for (const k of [t.a - 1, t.a + 3]) {
        const [x, y] = t.alongX ? [k, t.line] : [t.line, k];
        if (isWall(x, y)) covered.set(y * W + x, t.alongX);
      }
    }
    // THE WALLS' LIGHT: each lantern on the mine's wall (its picture's own light), the rest of the mine's rock lit low; the
    // cracked tiles of his hall's wall
    const inHall = (x: number, y: number): boolean => !!hall && x >= hall.x - 1 && y >= hall.y - 1 && x <= hall.x + hall.w && y <= hall.y + hall.h;
    for (let y = 0; y < f.h; y++) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        if (f.tiles[i] !== T_WALL || away[i]) continue;
        const which = wallFaces(f, i);
        for (const side of [0, 1] as const) {
          if (!(which & (side === 0 ? 1 : 2))) continue;
          if (covered.get(i) === (side === 0)) continue;
          const fx = side === 0 ? x : x + 1;
          const fy = side === 0 ? y + 1 : y;
          const footX = side === 0 ? x + 0.5 : x + 1;
          const footY = side === 0 ? y + 1 : y + 0.5;
          if (inHall(x, y) && hall && fx >= hall.x && fy >= hall.y && fx < hall.x + hall.w && fy < hall.y + hall.h) {
            const k = (((side === 0 ? x : y) % 4) + 4) % 4;
            if (k === 0) {
              const C = LAIR_LIGHTS.wallCrack;
              lights.push({ x: footX, y: footY, up: C.up, r: C.r, strength: C.strength, glow: { ...C.glow } });
            }
            continue;
          }
          if (this.temple(L, fy * W + fx)) continue;
          const s = A.mine.face(side === 0, x, y, 0);
          const l = s.lights?.[0];
          if (l) {
            const C = LAIR_LIGHTS.lantern;
            // (where render.ts stands a wall's face: the tile's top corner; its light where the picture has it)
            lights.push({ x: x, y: y, up: s.ay - l.y, dx: l.x - s.ax, r: C.r, strength: C.strength, glow: { ...C.glow } });
          } else {
            const C = LAIR_LIGHTS.mineWall;
            lights.push({ x: footX, y: footY, up: C.up, r: C.r, strength: C.strength, glow: null });
          }
        }
      }
    }
    // LANTERN POSTS and BRAZIERS (their pictures' own glow is drawn with them); THE RIFT
    const post = A.pieces.find((p) => p.name === 'a lantern post')?.frames?.[0];
    const pl = post?.lights?.[0];
    for (const p of L.props) {
      if (p.kind !== 'piece' || !p.name) continue;
      if (p.name === 'a lantern post') {
        const C = LAIR_LIGHTS.lanternPost;
        lights.push({ x: p.x, y: p.y, up: post && pl ? post.ay - pl.y : 40, dx: post && pl ? pl.x - post.ax : 0, r: C.r, strength: C.strength, glow: null });
      } else if (p.name === 'a brazier') {
        const C = LAIR_LIGHTS.brazier;
        lights.push({ x: p.x, y: p.y, up: C.up, r: C.r, strength: C.strength, glow: null });
      }
    }
    const rift = (L.dress?.moments ?? []).find((m) => m.n === 2);
    if (rift) {
      const C = LAIR_LIGHTS.rift;
      lights.push({ x: rift.x, y: rift.y, up: C.up, r: C.r, strength: C.strength, glow: null });
    }
    this.cache = { tiles, hall, covered, strips, lights };
    return this.cache;
  }

  laid(L: Level, tx: number, ty: number, t: number): Sprite | null {
    const laid = this.of(L).tiles.get(ty * L.floor.w + tx);
    return laid && laid.length ? laid[Math.floor(t * 6 + hash(tx, ty, 5203) * 4) % laid.length] : null;
  }

  flags(tx: number, ty: number): Sprite {
    const L = this.cacheFor;
    const A = this.A();
    return L && this.temple(L, ty * L.floor.w + tx) ? A.temple.floor(tx, ty) : A.mine.floor(tx, ty);
  }

  face(L: Level, left: boolean, tx: number, ty: number, t: number): Sprite {
    const C = this.of(L);
    const A = this.A();
    const fr = Math.floor(t * 6 + hash(tx, ty, 5205) * 4) % 4;
    const H = C.hall;
    const fx = left ? tx : tx + 1;
    const fy = left ? ty + 1 : ty;
    if (H && fx >= H.x && fy >= H.y && fx < H.x + H.w && fy < H.y + H.h) {
      const k = (((left ? tx : ty) % 4) + 4) % 4;
      return (left ? A.hall.faceLeft : A.hall.faceRight)[k][fr];
    }
    return (this.temple(L, fy * L.floor.w + fx) ? A.temple : A.mine).face(left, tx, ty, fr);
  }

  unfaced(L: Level, i: number, which: number): number {
    const a = this.of(L).covered.get(i);
    return a === undefined ? which : which & (a ? ~1 : ~2);
  }

  graded(s: Sprite): Sprite {
    const hit = this.gradedMemo.get(s);
    if (hit) return hit;
    const out = gradeOnPage(s, (c) => gradeColour(c, 'mine'));
    this.gradedMemo.set(s, out);
    return out;
  }

  lights(L: Level): readonly LookLight[] {
    return this.of(L).lights;
  }

  stands(L: Level, _t: number): readonly LookStand[] {
    return this.of(L).strips;
  }
}

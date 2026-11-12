// THE TINKERER AND THE BRAWLER FROM ALL EIGHT SIDES (art/sides_more.ts EIGHT_MORE: the Tinkerer's on, live since 25.3.6; the
// Brawler's off, at his word from the phone, 11 Nov 2026; the Tinkerer chat, 11 Nov 2026;
// docs/mockups/eight_sides/README.md). Off, the game has each from two sides and the Brawler's moves go four ways, as ever. On,
// each has eight sets, the two the game had THE VERY SAME PICTURES (nothing of either is repainted: the Brawler is his measure
// for art), the six more each truly turned and none a mirror; and the Brawler's moves, action lines and blows go eight ways.
//   run: tsx --test tests/sides_more.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
// @ts-ignore
import { readFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import { makeHeroArt3 } from '../src/art/heroes3';
import { lookOfPlace } from '../src/art/heroes';
import type { ActorArt, AnimSet } from '../src/art/actor_types';
import { toSprite } from '../src/art/kit';
import { EIGHT_ORDER, heroSides, isEight } from '../src/art/sides';
import { EIGHT_MORE, MORE_SIDES, MORE_TURN, MORE_WAY, moreSideOf } from '../src/art/sides_more';
import { CANVAS3 } from '../src/art/skin';
import { GRID } from '../src/art/skeleton';
import { makeTinkererArt } from '../src/art/tinkerer_art';
import { makeVeteranArt } from '../src/art/veteran_art';
import { paintVetFx } from '../src/art/veteran_fx_art';
import { WU_SIDES, WU_SPIN } from '../src/art/warrior_up';
import type { WuSide } from '../src/art/warrior_up';
import { wuFacing } from '../src/art/warrior_up_art';
import { VET_CANVAS, paintVeteran } from '../src/dev/sculpt_veteran';
import { FX_PUNCH, shockCone } from '../src/dev/veteran_fx';
import { VET_RUN, VET_STAND, VET_TILE, motionById, spinAt, vetAt } from '../src/dev/veteran_moves';
import { TRUN_ROUND, drawTinkerAt, tinkerMoves } from '../src/dev/tinkerer_moves';
import type { RNG } from '../src/engine/rng';
import { BRAWLER } from '../src/game/brawler';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Monster } from '../src/game/state';
import { VETERAN, vetBlowLeft, vetFacing, vetLeft } from '../src/game/veteran';
import { vetView } from '../src/render/veteran_fx';
import { frameHash } from '../tools/sides_more_same';
import { paintWithoutCanvas, paintingOf, unlike } from './helpers';

declare const process: { env: Record<string, string | undefined> };
/** Every frame of the Brawler's two sides and their action lines, as on main before his six more (tools/sides_more_same.ts pin). */
const PINNED = JSON.parse(readFileSync(new URL('./sides_more.hashes.json', import.meta.url), 'utf8')) as { lists: Record<string, string[]> };
const ALL = process.env.SIDES_MORE === 'all';

paintWithoutCanvas();

/** With both switches on, and put back after. */
function on<T>(run: () => T): T {
  const was = { ...EIGHT_MORE };
  EIGHT_MORE.tinkerer = true;
  EIGHT_MORE.brawler = true;
  try {
    return run();
  } finally {
    Object.assign(EIGHT_MORE, was);
  }
}
/** With both switches off, as the game was before them, and put back after. */
function asOff<T>(run: () => T): T {
  const was = { ...EIGHT_MORE };
  EIGHT_MORE.tinkerer = false;
  EIGHT_MORE.brawler = false;
  try {
    return run();
  } finally {
    Object.assign(EIGHT_MORE, was);
  }
}
/** The middle of what is painted of a frame, from its floor point (game pixels). */
function middle(s: Sprite): [number, number] {
  const p = paintingOf(s);
  const d = s.density ?? 1;
  let n = 0;
  let sx = 0;
  let sy = 0;
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) if (p.d[(y * p.w + x) * 4 + 3]) {
    n++;
    sx += x;
    sy += y;
  }
  return n ? [sx / n / d - s.ax, sy / n / d - s.ay] : [0, 0];
}
/** A frame's picture as a key: its size and every pixel of it. */
function pictureKey(s: Sprite): string {
  const p = paintingOf(s);
  return `${p.w}x${p.h}:${Array.from(p.d).join(',')}`;
}
/** The way a side faces on the screen (game pixels a tile, not made one long). */
const screenWay = (side: WuSide): [number, number] => [(MORE_WAY[side][0] - MORE_WAY[side][1]) * 16, (MORE_WAY[side][0] + MORE_WAY[side][1]) * 8];

test('the sides, their turns and their ways are the Warrior\'s own', () => {
  assert.deepEqual([...MORE_SIDES], [...EIGHT_ORDER], 'the two the game has always had first, as the game numbers them');
  assert.deepEqual([...MORE_SIDES].sort(), [...WU_SIDES].sort());
  for (const s of WU_SIDES) assert.equal(MORE_TURN[s], WU_SPIN[s].spin, `${s}: turned as the Warrior is`);
  assert.equal(MORE_TURN.front, 0, 'from in front: not turned, as ever');
  assert.equal(MORE_TURN.back, 90, 'from behind: turned 90 to the left, as ever');
  for (let a = -180; a < 180; a += 1.5) {
    const fx = Math.cos((a * Math.PI) / 180);
    const fy = Math.sin((a * Math.PI) / 180);
    assert.equal(moreSideOf(fx, fy), wuFacing(fx, fy), `facing ${a} degrees`);
  }
  for (const s of WU_SIDES) {
    const [x, y] = MORE_WAY[s];
    assert.ok(Math.abs(Math.hypot(x, y) - 1) < 1e-12, `${s}: a unit way`);
    assert.equal(moreSideOf(x, y), s, `${s}: its own way`);
  }
  // (45 degrees apart, round from down and to the right)
  const round: WuSide[] = ['front', 'toward', 'frontL', 'sideL', 'backL', 'away', 'back', 'side'];
  round.forEach((s, k) => {
    const a = (k * 45 * Math.PI) / 180;
    assert.ok(Math.abs(MORE_WAY[s][0] - Math.cos(a)) < 1e-12 && Math.abs(MORE_WAY[s][1] - Math.sin(a)) < 1e-12, `${s}: ${k * 45} degrees round`);
  });
});

test('the game has the Tinkerer on, and on this branch the Brawler; OFF, each has the game\'s two sides, and the Brawler\'s moves go his four ways', () => {
  // (THE TINKERER'S ON, live since 25.3.6, 11 Nov 2026, at his “Yes, hand both to main (Recommended)”. THE BRAWLER'S: off in `main`
  // at his word from the phone on the test page that had both on, 11 Nov 2026 (docs/mockups/eight_sides/BRING_IN.md, its foot);
  // ON ON THIS BRANCH, build/brawler-packed, which mends it (his moves kept packed: docs/mockups/eight_sides/PACKED.md). The
  // three lines that say so: this one, tests/veteran_art.test.ts's `was` and tests/veteran_rules.test.ts's `eightWas`.)
  assert.deepEqual(EIGHT_MORE, { tinkerer: true, brawler: true }, 'the Tinkerer live; the Brawler on on this branch, his moves kept packed');
  asOff(() => {
    const t = makeTinkererArt();
    const v = makeVeteranArt();
    assert.equal(isEight(t), false, 'the Tinkerer: two sides');
    assert.equal(isEight(v), false, 'the Brawler: two sides');
    assert.deepEqual(Object.keys(t), ['front', 'back']);
    assert.deepEqual(Object.keys(v), ['front', 'back']);
    assert.deepEqual(vetFacing(0.8, 0.6), [1, 0]);
    assert.deepEqual(vetFacing(-0.6, -0.8), [0, -1]);
    assert.deepEqual(vetLeft(0, 1), [-1, 0], 'facing down and to the left his picture is a mirror: its left the world\'s other side');
    assert.deepEqual(vetBlowLeft(0, 1, 0.6, 0.8), [-0.8, 0.6]);
    const w = vetView(0, 1);
    assert.equal(w.left, true);
    assert.equal(w.side, null);
  });
});

test('ON: the Tinkerer from all eight sides; her two the same pictures, her six more truly turned', () => {
  const off = asOff(() => makeTinkererArt());
  const art = on(() => makeTinkererArt());
  assert.ok(isEight(art), 'eight sides');
  assert.equal(heroSides(art).length, 8);
  const moves = tinkerMoves();
  const stand = moves.find((m) => m.name.startsWith('Standing'))!;
  const run = moves.find((m) => m.name.startsWith('Running'))!;
  const sets = art as unknown as Record<WuSide, AnimSet>;
  // (her two: the very lists the game has with the switch off, and so the very pictures)
  for (const v of ['front', 'back'] as const) {
    assert.equal(sets[v].idle, off[v].idle, `${v}: her standing the game's own list`);
    assert.equal(sets[v].walk, off[v].walk, `${v}: her running the game's own list`);
    for (const [name, c] of Object.entries(sets[v].clips ?? {})) {
      const o = (off[v].clips as Record<string, unknown>)[name] as { frames?: Sprite[] } | undefined;
      const mine = c as { frames?: Sprite[] };
      if (mine.frames && o?.frames) assert.equal(mine.frames.length, o.frames.length, `${v} ${name}: as long`);
    }
    const k = 7;
    assert.equal(unlike(sets[v].clips!.attack!.frames[k], off[v].clips!.attack!.frames[k]), 0, `${v}: her toss at frame ${k} the same picture`);
  }
  const seen = new Map<string, WuSide>();
  for (const side of MORE_SIDES) {
    const set = sets[side];
    // (every list as long as from in front)
    assert.equal(set.idle.length, sets.front.idle.length, `${side}: standing`);
    assert.equal(set.walk.length, sets.front.walk.length, `${side}: running`);
    assert.equal(set.walkStride, sets.front.walkStride);
    for (const name of ['attack', 'heavy', 'leap', 'land', 'reel', 'lurch', 'fall'] as const) assert.equal(set.clips![name]!.frames.length, sets.front.clips![name]!.frames.length, `${side} ${name}`);
    assert.equal(set.clips!.tapAs!.contraption!.frames.length, sets.front.clips!.tapAs!.contraption!.frames.length, `${side}: her Contraption thrown down`);
    // (a frame of hers is the art's figure at that moment, truly turned for the side)
    const want = toSprite({ px: drawTinkerAt('front', stand, 0, MORE_TURN[side]).px, lights: [] }, null, CANVAS3.ax, CANVAS3.ay);
    assert.equal(unlike(set.idle[0], want), 0, `${side}: standing, the art's figure turned ${MORE_TURN[side]}`);
    const i = Math.round(TRUN_ROUND * 60 * 0.25);
    const wantRun = toSprite({ px: drawTinkerAt('front', run, i / 60, MORE_TURN[side]).px, lights: [] }, null, CANVAS3.ax, CANVAS3.ay);
    assert.equal(unlike(set.walk[i], wantRun), 0, `${side}: running`);
    // (no two sides the same picture)
    const key = pictureKey(set.idle[0]);
    assert.equal(seen.get(key), undefined, `${side}: not the picture of ${seen.get(key)}`);
    seen.set(key, side);
  }
  // (never a mirror: her wrench is on her right shoulder; down and to the left it is not the mirror of down and to the right)
  const a = paintingOf(sets.front.idle[0]);
  const b = paintingOf(sets.frontL.idle[0]);
  let same = a.w === b.w && a.h === b.h;
  if (same) for (let y = 0; y < a.h && same; y++) for (let x = 0; x < a.w; x++) if (a.get(x, y) !== b.get(a.w - 1 - x, y)) {
    same = false;
    break;
  }
  assert.equal(same, false, 'down-left is painted, not down-right mirrored');
});

test('ON: the Brawler from all eight sides; his two the same pictures, his six more truly turned', () => {
  const off = asOff(() => makeVeteranArt());
  const art = on(() => makeVeteranArt());
  assert.ok(isEight(art), 'eight sides');
  const sets = art as unknown as Record<WuSide, AnimSet>;
  const jab = motionById('jab');
  const at = Math.min(...jab.strikes.map((s) => s.at));
  for (const v of ['front', 'back'] as const) {
    assert.equal(sets[v].idle, off[v].idle, `${v}: his stance the game's own list`);
    assert.equal(sets[v].walk, off[v].walk, `${v}: his run the game's own list`);
    assert.equal(unlike(sets[v].clips!.vet!.jab.frames[at], off[v].clips!.vet!.jab.frames[at]), 0, `${v}: his jab's blow the same picture`);
    assert.equal(unlike(sets[v].clips!.vetFx!.jab.front[at + 2], off[v].clips!.vetFx!.jab.front[at + 2]), 0, `${v}: its action lines the same picture`);
  }
  const seen = new Map<string, WuSide>();
  for (const side of MORE_SIDES) {
    const set = sets[side];
    assert.equal(set.idle.length, VET_STAND.long, `${side}: his stance`);
    assert.equal(set.walk.length, VET_RUN.long, `${side}: his run`);
    for (const id of Object.keys(sets.front.clips!.vet!)) {
      assert.equal(set.clips!.vet![id].frames.length, sets.front.clips!.vet![id].frames.length, `${side} ${id}`);
      for (const k of ['ground', 'behind', 'front'] as const) assert.equal(set.clips!.vetFx![id][k].length, sets.front.clips!.vetFx![id][k].length, `${side} ${id}: its action lines (${k})`);
    }
    // (a frame of his is the art's pose at that frame, truly turned for the side)
    const want = toSprite({ px: paintVeteran(vetAt(VET_STAND, 0), MORE_TURN[side] + spinAt(VET_STAND, 0)).px, lights: [] }, null, VET_CANVAS.ax, VET_CANVAS.ay);
    assert.equal(unlike(set.idle[0], want), 0, `${side}: his stance, the art's figure turned ${MORE_TURN[side]}`);
    const key = pictureKey(set.idle[0]);
    assert.equal(seen.get(key), undefined, `${side}: not the picture of ${seen.get(key)}`);
    seen.set(key, side);
    // (his jab's force goes out the way the side faces on the screen: its action lines lie that way from where he stood)
    const fx = set.clips!.vetFx!.jab.front[at + 2];
    assert.equal(unlike(fx, paintVetFx(jab, at + 2, side, 'front')), 0, `${side}: its lines painted as made`);
    const [mx, my] = middle(fx);
    const [wx, wy] = screenWay(side);
    const cos = (mx * wx + my * wy) / (Math.hypot(mx, my) * Math.hypot(wx, wy));
    // (the lines are thrown from his fist, at his shoulder's height: 20 game pixels over the floor point; lifted back down)
    const [lx, ly] = [mx, my + 20];
    const cosFloor = (lx * wx + ly * wy) / (Math.hypot(lx, ly) * Math.hypot(wx, wy));
    assert.ok(Math.max(cos, cosFloor) > 0.8, `${side}: his jab's lines lie the way he faces (${mx.toFixed(1)}, ${my.toFixed(1)} against ${wx.toFixed(0)}, ${wy.toFixed(0)})`);
  }
});

test('ON: the Brawler\'s moves face the nearest of eight ways, his left is his left, and his lines are laid as the art lays them', () => {
  on(() => {
    const r = Math.SQRT1_2;
    assert.deepEqual(vetFacing(1, 0.1), [1, 0]);
    assert.deepEqual(vetFacing(0.8, 0.6), [r, r], 'between down-right and down-left: straight down the screen');
    assert.deepEqual(vetFacing(-0.6, -0.8), [-r, -r], 'straight up the screen');
    assert.deepEqual(vetFacing(3, -2.9), [r, -r], 'straight to the right');
    assert.deepEqual(vetFacing(-0.1, 1), [0, 1]);
    for (let a = -180; a < 180; a += 7) {
      const dx = Math.cos((a * Math.PI) / 180);
      const dy = Math.sin((a * Math.PI) / 180);
      const [fx, fy] = vetFacing(dx * 2.5, dy * 2.5);
      assert.ok(Math.abs(Math.hypot(fx, fy) - 1) < 1e-12, 'a unit way: he is carried as far whichever way he faces');
      const off = Math.acos(Math.max(-1, Math.min(1, fx * dx + fy * dy))) * (180 / Math.PI);
      assert.ok(off <= 22.5 + 1e-9, `aimed ${a} degrees: his picture within 22.5 degrees of it (${off.toFixed(1)}); four ways were within 45`);
      // (his left is his left: no picture of his is a mirror)
      assert.deepEqual(vetLeft(fx, fy), [fy, -fx]);
      assert.deepEqual(vetBlowLeft(fx, fy, dx, dy), [dy, -dx]);
      const v = vetView(fx, fy);
      assert.equal(v.left, false, 'never mirrored');
      assert.equal(v.side, moreSideOf(dx, dy));
      assert.deepEqual(v.f, [fx, fy]);
      assert.deepEqual(v.l, [fy, -fx]);
      // (the art's film: a point of his scene (his forward, his left) turned as the side is and projected; the game lays it there)
      const V = (MORE_TURN[v.side!] * Math.PI) / 180;
      for (const [p, q] of [[10, 0], [0, 10], [7, -4], [-30, 22]]) {
        const x = p * Math.cos(V) - q * Math.sin(V);
        const y = p * Math.sin(V) + q * Math.cos(V);
        const want: [number, number] = [(GRID * (x + y)) / 2, (GRID * 0.5 * (x - y)) / 2];
        const X = (p * v.f[0] + q * v.l[0]) / VET_TILE;
        const Y = (p * v.f[1] + q * v.l[1]) / VET_TILE;
        const game: [number, number] = [(X - Y) * 16, (X + Y) * 8];
        assert.ok(Math.abs(game[0] - want[0]) < 1e-9 && Math.abs(game[1] - want[1]) < 1e-9, `${v.side}: (${p}, ${q}) at ${game} on the screen, the art's ${want}`);
      }
    }
  });
  // (and off, his four ways)
  asOff(() => assert.deepEqual(vetFacing(0.8, 0.6), [1, 0]));
});

test('ON: the game holds eight sides of each in a dungeon and in town, and two on a class card', () => {
  on(() => {
    const A = makeHeroArt3();
    for (const cls of ['tinkerer', 'brawler'] as const) {
      const game: ActorArt = A.of(cls, lookOfPlace('dungeon'));
      assert.equal(heroSides(game).length, 8, `${cls}: eight sides`);
      assert.equal(A.of(cls, lookOfPlace('town')), game, `${cls}: in town as in a dungeon`);
      const card = A.of(cls, lookOfPlace('card'));
      assert.equal(heroSides(card).length, 2, `${cls}: a card shows two`);
      for (const v of ['front', 'back'] as const) assert.equal(card[v].idle, game[v].idle, `${cls} ${v}: one standing list`);
    }
  });
});

/** A list of a set by its name in the pinned file ('clips.vetFx.jab.front', 'idle', 'clips.reel.frames'). */
function listAt(set: AnimSet, name: string): Sprite[] {
  let v: unknown = set;
  for (const k of name.split('.')) v = (v as Record<string, unknown>)[k];
  return v as Sprite[];
}

test('NOTHING OF THE BRAWLER REPAINTED: his two sides and their action lines the very pictures they were on main, the switch off and on', () => {
  // (the first, the middle and the last frame of every list; SIDES_MORE=all: every frame, some four minutes.
  // The Tinkerer's two are held by tests/cheap_heroes.test.ts, which pins every frame of hers.)
  for (const state of ['off', 'on'] as const) {
    const art = state === 'on' ? on(() => makeVeteranArt()) : asOff(() => makeVeteranArt());
    let lists = 0;
    for (const [name, pinned] of Object.entries(PINNED.lists)) {
      const [, rest] = name.split('/');
      const side = rest.slice(0, rest.indexOf('.')) as 'front' | 'back';
      const list = listAt(art[side], rest.slice(rest.indexOf('.') + 1));
      assert.equal(list.length, pinned.length, `${state} ${name}: as long as it was`);
      const picks = ALL ? pinned.map((_, i) => i) : [...new Set([0, pinned.length >> 1, pinned.length - 1])];
      for (const i of picks) assert.equal(frameHash(list[i]), pinned[i], `${state} ${name}[${i}]: the same picture`);
      lists++;
    }
    assert.equal(lists, 124, 'every list of his two sides');
  }
});

test('a cone of force seen exactly side-on shows its ring (leaned on the new sides only), not a bar', () => {
  /** How much is painted in the three columns at the cone's far end: a ring seen edge-on is a bar there, all of it. */
  const farEnd = (p: Px, right: boolean): number => {
    let x0 = p.w;
    let x1 = -1;
    for (let x = 0; x < p.w; x++) for (let y = 0; y < p.h; y++) if (p.d[(y * p.w + x) * 4 + 3]) {
      x0 = Math.min(x0, x);
      x1 = Math.max(x1, x);
    }
    let n = 0;
    for (let k = 0; k < 3; k++) {
      const x = right ? x1 - k : x0 + k;
      for (let y = 0; y < p.h; y++) if (p.d[(y * p.w + x) * 4 + 3]) n++;
    }
    return n;
  };
  // (the painter itself: a cone thrown straight to the right of the screen, turned 45 as the side `side` is)
  const cone = (V: number, lean: number): Px => {
    const px = new Px(300, 240);
    const r = (V * Math.PI) / 180;
    const to = (q: readonly number[]): [number, number] => {
      const a = q[0] * Math.cos(r) - q[1] * Math.sin(r);
      const b = q[0] * Math.sin(r) + q[1] * Math.cos(r);
      return [150 + GRID * (a + b), 150 + GRID * 0.5 * (a - b) - (q[2] ?? 0)];
    };
    shockCone(px, to, [10, 0, 45], 0, 0, (18 * Math.PI) / 180, 60, 4, 6, FX_PUNCH, 7, lean);
    return px;
  };
  const known = farEnd(cone(0, 0), true);
  const bar = farEnd(cone(45, 0), true);
  const leaned = farEnd(cone(45, Math.PI / 6), true);
  assert.ok(bar > known * 2, `not leaned, side-on, its ring is a bar (${bar} against ${known} from in front)`);
  assert.ok(leaned < known * 1.5, `leaned, a ring as from in front (${leaned} against ${known})`);
  // (his straight blows' cones, on the two sides they would lie edge-on from)
  for (const id of ['jab', 'cross', 'knee']) {
    const m = motionById(id);
    const at = Math.min(...m.strikes.map((s) => s.at));
    for (const side of ['side', 'sideL'] as const) {
      const n = farEnd(paintingOf(paintVetFx(m, at + 3, side, 'front')), side === 'side');
      assert.ok(n < 90, `${id} ${side}: its ring shows (${n} painted at its far end; a bar is some 150)`);
    }
  }
});

test('ON, IN A FIGHT: a jab aimed straight down the screen faces straight down, carries him that way and lands; off, it faces one of his four', () => {
  type Inner = { rng: RNG; waveT: number; spawn: (k: string, x: number, y: number, pack: number, rank: number, boss: boolean, rng: RNG) => Monster; wakeUp: (m: Monster) => void };
  const was = [VETERAN.on, BRAWLER.on];
  VETERAN.on = true;
  BRAWLER.on = true;
  try {
    const fight = (): { fx: number; fy: number; moved: [number, number]; hurt: number } => {
      const g = Game.forPractice('brawler', 3);
      const a = g as unknown as Inner;
      a.waveT = 1e9;
      g.monsters.length = 0;
      g.hero.x = 14.5;
      g.hero.y = 15.5;
      g.hero.fx = 1;
      g.hero.fy = 0;
      // (one standing straight down the screen from him: as far along the floor's x as its y)
      const m = a.spawn('skeleton', g.hero.x + 1.2, g.hero.y + 1.2, 1, 0, false, a.rng);
      a.wakeUp(m);
      m.speed = 0;
      m.cd = 1e9;
      m.life = m.maxLife = 1e7;
      const x0 = g.hero.x;
      const y0 = g.hero.y;
      const press = emptyControls();
      press.fire = true;
      press.aimX = m.x;
      press.aimY = m.y;
      g.update(1 / 60, press);
      let fx = 0;
      let fy = 0;
      for (let i = 0; i < 90; i++) {
        const c = emptyControls();
        c.aimX = m.x;
        c.aimY = m.y;
        g.update(1 / 60, c);
        const mv = g.hero.vet?.move;
        if (mv) [fx, fy] = [mv.fx, mv.fy];
      }
      return { fx, fy, moved: [g.hero.x - x0, g.hero.y - y0], hurt: m.maxLife - m.life };
    };
    const four = asOff(fight);
    assert.ok(Math.abs(four.fx) + Math.abs(four.fy) === 1 && four.fx * four.fy === 0, `off: his picture faces one of his four ways (${four.fx}, ${four.fy})`);
    assert.ok(four.hurt > 0, 'off: his jab lands, as ever');
    const eight = on(fight);
    const r = Math.SQRT1_2;
    assert.ok(Math.abs(eight.fx - r) < 1e-12 && Math.abs(eight.fy - r) < 1e-12, `on: his picture faces straight down the screen (${eight.fx}, ${eight.fy})`);
    assert.ok(eight.hurt > 0, 'on: his jab lands');
    assert.equal(eight.hurt, four.hurt, 'as hard as ever');
    // (carried as the art carries him, along the way his picture faces: straight down the screen, as far as his four ways carry him)
    const along = eight.moved[0] * r + eight.moved[1] * r;
    const across = eight.moved[0] * r - eight.moved[1] * r;
    assert.ok(Math.abs(across) < 1e-9, `on: carried straight along it (${across} across)`);
    assert.ok(Math.abs(along - Math.hypot(four.moved[0], four.moved[1])) < 1e-9, `on: carried as far (${along} against ${Math.hypot(four.moved[0], four.moved[1])})`);
  } finally {
    [VETERAN.on, BRAWLER.on] = was;
  }
});

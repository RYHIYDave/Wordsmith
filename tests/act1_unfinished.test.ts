// ACT 1: THE UNFINISHED, FLOOR 6'S BOSS, IN THE GAME (game/act1_rules/unfinished.ts, art/act1_figs/unfinished.ts,
// render/act1_fx/unfinished.ts): the art chat's pictures (art/unfinished.ts) and the main chat's rules.
//
//   1. it is built: the Quarry's boss, its rules, its pictures (every clip its acts name), its effects;
//   2. its rules' numbers are its pictures' own;
//   3. on its floor it stands with its back in the quarry's far wall, one with it, facing out;
//   4. in the wall it never walks, and turns no further than its picture there allows;
//   5. the fist slam, the stomp: where and when their pictures say, and nowhere else;
//   6. the hurled block: lands where the hero stood (unless he steps out of its shadow) and lies as cover, a block
//      of the floor, till it crumbles;
//   7. the rockslide: boulders down lanes marked on the floor, across the way to the hero; between them is safe;
//   8. at half its life it tears itself free, and walks after him from then on;
//   9. nothing it draws is cyan; its things' pictures crisp;
//  10. a long fight on its floor, and killed in the middle of anything: nothing thrown, nothing left harming him.
//   run: tsx --test tests/act1_unfinished.test.ts

// @ts-ignore
import { test as nodeTest } from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { FIGURE_SIZE, makeBestiary } from '../src/art/bestiary';
import { UF_FUSED_CLIPS } from '../src/art/act1_figs/unfinished';
import { FIG } from '../src/art/act1_figs/unfinished';
import { GRAIN } from '../src/art/kit';
import { TILE3, skeletonAt } from '../src/art/new_mobs3';
import { UF_DIE_TIME, UF_HURL_HIT, UF_HURL_TEAR, UF_PACE, UF_SLAM_HIT, UF_SLIDE_HIT, UF_STOMP_HIT, UF_TEAR_HIT, UNFINISHED, UNFINISHED_ON, boulderRolling, hurledBlock, stompCracks } from '../src/art/unfinished';
import type { Sprite } from '../src/engine/px';
import { RNG } from '../src/engine/rng';
import { ACT1 } from '../src/game/act1';
import { RULES, UF, UF_ACTS, UF_GAIT, perchOf } from '../src/game/act1_rules/unfinished';
import { bossKind } from '../src/game/bosses';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { GameEvent, Monster } from '../src/game/state';
import { T_WALL } from '../src/game/types';
import { FX } from '../src/render/act1_fx/unfinished';
import type { Act1FxCtx } from '../src/render/act1_fx/types';
import { paintWithoutCanvas, paintingOf, seasoned, unlike } from './helpers';
import { makeFilm } from '../src/art/films';
import type { ThingsFilm } from '../src/art/films';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

paintWithoutCanvas();

const near = (a: number, b: number, tol: number, what: string): void => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} against ${b} (within ${tol})`);
const act = (id: string) => UF_ACTS.find((a) => a.id === `unfinished:${id}`)!;
const ART = FIG!.make();

/** The floor of the Quarry, for a hero who has been down before. */
function floor6(seed: number): Game {
  const g = seasoned(new Game('warrior', seed), 1);
  g.depth = 6;
  g.cleared = 6;
  g.enterDungeon();
  g.events.length = 0;
  return g;
}

interface Hooks {
  waveT: number;
  wakeUp(m: Monster): void;
}
/** An empty practice room, the hero still in it, and the Unfinished `far` tiles to the west of him, awake, facing him, not to be killed; `wall`: still one with the wall (facing along the floor's x); only `only` of its acts ready (null: none). */
function room(far: number, wall: boolean, only: string | null): { g: Game; m: Monster } {
  const g = Game.forPractice('warrior', 5);
  (g as unknown as Hooks).waveT = 1e9;
  g.monsters.length = 0;
  const h = g.hero;
  h.x += Math.max(0, far - 7);
  const m = g.spawn('unfinished', h.x - far, h.y, -2, 0, false, new RNG(9));
  (g as unknown as Hooks).wakeUp(m);
  m.words = [];
  m.shield = 0;
  m.life = m.maxLife = 1e9;
  m.cd = 0;
  m.fx = 1;
  m.fy = 0;
  m.form = wall ? 0 : 1;
  m.a1 = { bfx: 1, bfy: 0 };
  keep(m, only);
  g.events.length = 0;
  return { g, m };
}
function keep(m: Monster, only: string | null): void {
  m.moveCd = UF_ACTS.map((a) => (only && a.id === `unfinished:${only}` ? 0 : 1e9));
  m.cd = 0;
}
interface Seen {
  hurts: { t: number; n: number }[];
  began: number;
  events: GameEvent[];
}
function watch(g: Game, m: Monster, secs: number, move?: (t: number) => { mx: number; my: number } | null): Seen {
  const c = emptyControls();
  const h = g.hero;
  const seen: Seen = { hurts: [], began: -1, events: [] };
  for (let k = 0; k < Math.round(secs * 60); k++) {
    const mv = move ? move(k / 60) : null;
    c.mx = mv ? mv.mx : 0;
    c.my = mv ? mv.my : 0;
    const before = h.life;
    g.update(1 / 60, c);
    if (h.life < before) seen.hurts.push({ t: (k + 1) / 60, n: before - h.life });
    h.life = h.d.maxLife;
    if (seen.began < 0 && m.state === 'act') seen.began = (k + 1) / 60;
    seen.events.push(...g.events);
    g.events.length = 0;
  }
  return seen;
}
const firstHurt = (s: Seen): number => (s.hurts.length ? s.hurts[0].t - s.began : -1);

test('1. it is built: the Quarry\'s boss, its rules, its pictures (every clip its acts name), its effects', () => {
  assert.ok(ACT1.on, 'the descent is on');
  assert.equal(bossKind(6), 'unfinished', 'floor 6\'s boss is the Unfinished');
  assert.ok(RULES && FIG && FX, 'its rules, its pictures, its effects');
  assert.ok(FIG!.heavy, 'a boss: heavy to paint, made for its floor');
  assert.ok(FIG!.switches?.includes(UNFINISHED_ON), 'the art chat\'s switch');
  makeBestiary();
  assert.equal(UNFINISHED_ON.on, true, 'on with the descent (art/bestiary.ts useAct1Figs)');
  // (four moves, by his rulebook, a basic blow and three big ones, each in the wall and free; and tearing free)
  const moves = new Set(UF_ACTS.filter((a) => !a.forced).map((a) => a.id.replace(/Wall$/, '')));
  assert.equal(moves.size, 4, 'four attacks');
  assert.equal(UF_ACTS.filter((a) => a.cooldown === 0 && !a.forced).length, 2, 'its basic blow (free and in the wall) has no cooldown');
  for (const a of UF_ACTS) {
    const front = a.clip === 'attack' ? ART.front.clips?.attack : ART.front.clips?.moves?.[a.clip];
    assert.ok(front && front.frames.length > 10, `${a.id}: its clip ${a.clip}, from in front`);
    // (in the wall it is only ever seen from in front)
    if (!a.id.endsWith('Wall') && !a.forced) assert.ok(a.clip === 'attack' ? ART.back.clips?.attack : ART.back.clips?.moves?.[a.clip], `${a.id}: from behind`);
  }
  for (const set of [ART.front, ART.back]) {
    assert.ok(set.clips?.reel && set.clips.die && set.clips.moves?.setOff && set.clips.moves.halt, 'struck, its death, setting off and stopping');
  }
  assert.ok(ART.front.clips?.moves?.[UF_FUSED_CLIPS.stand] && ART.front.clips.moves[UF_FUSED_CLIPS.reel], 'its stand and flinch in the wall');
  assert.equal(ART.back.clips?.moves?.[UF_FUSED_CLIPS.stand], undefined, 'not painted from behind in the wall');
});

test("2. its rules' numbers are its pictures' own", () => {
  const len = (clip: { frames: unknown[]; fps: number }): number => (clip.frames.length - 1) / clip.fps;
  const moves = ART.front.clips!.moves!;
  for (const a of UF_ACTS) {
    const clip = a.clip === 'attack' ? ART.front.clips!.attack! : moves[a.clip];
    near(a.long, len(clip), 1e-6, `${a.id}: as long as its picture`);
    if (clip.hit !== undefined) near(a.hit, clip.hit, 1e-6, `${a.id}: its blow at its picture's`);
  }
  near(act('slam').hit, UF_SLAM_HIT, 1e-9, 'the slam');
  near(act('stomp').hit, UF_STOMP_HIT, 1e-9, 'the stomp');
  near(act('hurl').hit, UF_HURL_HIT, 1e-9, 'the hurl');
  near(act('rockslide').hit, UF_SLIDE_HIT, 1e-9, 'the rockslide');
  near(act('tear').hit, UF_TEAR_HIT, 1e-9, 'tearing free');
  near(UF.slide.hits[0], UF_SLIDE_HIT, 1e-9, 'the rockslide\'s first blow');
  near(UF.slide.hits[1] - UF.slide.hits[0], 0.56, 1e-9, 'and its second (art: SLIDE_AGAIN)');
  near(UF.hurl.tear, UF_HURL_TEAR, 1e-9, 'the block torn up');
  near((ART.front.clips!.die!.frames.length - 1) / ART.front.clips!.die!.fps, UF_DIE_TIME, 1e-6, 'its death');
  // (where its blows land, in tiles before it and to its left: its picture's own)
  const t = (v: readonly number[]): number[] => v.map((x) => x / TILE3);
  const fist = t(skeletonAt(UNFINISHED, 'attack', UF_SLAM_HIT).handR);
  near(fist[0], UF.slam.fist[0], 0.02, 'the fist comes down that far before it');
  near(fist[1], UF.slam.fist[1], 0.02, 'and to its right');
  const skid = t(skeletonAt(UNFINISHED, 'attack', UF_SLAM_HIT + 0.22).handR);
  near(skid[0], UF.slam.skid[0], 0.02, 'and skids on');
  const toe = t(skeletonAt(UNFINISHED, 'stomp', UF_STOMP_HIT + 0.02).toeR);
  near(toe[0], UF.stomp.at[0], 0.05, 'the stomp\'s toe');
  near(toe[1], UF.stomp.at[1], 0.05, 'the stomp\'s toe, to its right');
  const hs = skeletonAt(UNFINISHED, 'hurl', UF_HURL_HIT);
  const mid = t(hs.handL.map((v, i) => (v + hs.handR[i]) / 2));
  near(mid[0], UF.hurl.from[0], 0.03, 'the block leaves its hands');
  near(mid[2], UF.hurl.from[2], 0.05, 'over its head');
  // (its gait: its walk's pace, its loop, setting off and stopping)
  near(UF_GAIT.pace, UF_PACE, 1e-9, 'its pace');
  near(UF_GAIT.cycle, ART.front.walk.length / (ART.front.walkFps ?? 8), 1e-9, 'its walk\'s loop');
  near(UF_GAIT.setOff, len(moves.setOff), 1e-6, 'setting off');
  near(UF_GAIT.halt, len(moves.halt), 1e-6, 'stopping');
  assert.ok(UF_GAIT.stopAt < act('slam').far, 'it comes within its slam\'s reach');
  assert.equal(UF_GAIT.trueBack, !!UNFINISHED.trueBack, 'from behind as its pictures are painted');
});

test('3. on its floor it stands with its back in the quarry\'s far wall, one with it, facing out', () => {
  for (const seed of [3, 17, 29]) {
    const g = floor6(seed);
    const m = g.boss!;
    assert.equal(m.kind, 'unfinished', `seed ${seed}: the Unfinished`);
    const p = perchOf(g.level);
    assert.ok(p, `seed ${seed}: its place found`);
    near(Math.hypot(m.x - p!.x, m.y - p!.y), 0, 1e-6, `seed ${seed}: it stands there`);
    assert.equal(m.form, 0, `seed ${seed}: one with the wall`);
    assert.ok((p!.fx === 1 && p!.fy === 0) || (p!.fx === 0 && p!.fy === 1), `seed ${seed}: facing out, from in front (its back up the screen)`);
    // (the quarry's rock behind it, as near as its picture's stone)
    const f = g.level.floor;
    let D = 0;
    for (let s = 0.05; s < 3; s += 0.05) {
      const x = m.x - p!.fx * s;
      const y = m.y - p!.fy * s;
      if (g.level.walk[Math.floor(y) * f.w + Math.floor(x)] !== 1) {
        D = s;
        // (the wall: its rock, or a tile its rounded edge cuts across, as its rules have it; not a piece on the floor)
        const i = Math.floor(y) * f.w + Math.floor(x);
        assert.ok(f.tiles[i] === T_WALL || (!!f.cut && f.cut[i] !== 0), `seed ${seed}: the quarry's wall, not a piece (${f.tiles[i]}, cut ${f.cut ? f.cut[i] : '-'})`);
        break;
      }
    }
    assert.ok(D >= 0.9 && D <= 1.6, `seed ${seed}: the wall ${D.toFixed(2)} behind it`);
  }
});

test('4. in the wall it never walks, and turns no further than its picture there allows', () => {
  const { g, m } = room(6, true, null);
  const x0 = m.x;
  const y0 = m.y;
  const h = g.hero;
  // (the hero goes round it, near and far)
  watch(g, m, 8, (t) => ({ mx: Math.cos(t), my: Math.sin(t * 0.7) }));
  near(Math.hypot(m.x - x0, m.y - y0), 0, 1e-9, 'it has not moved');
  assert.equal(m.gait?.mode, 'stand', 'it stands');
  h.x = m.x;
  h.y = m.y + 4;
  watch(g, m, 0.5);
  near(Math.atan2(m.fy, m.fx), UF.turn, 1e-6, 'a hero at its side: turned as far as it may');
  // (free, it comes on)
  const free = room(8, false, null);
  watch(free.g, free.m, 4);
  assert.ok(free.m.x > free.g.hero.x - 8 + 1, 'free, it walks after him');
});

test('5. the fist slam, the stomp: where and when their pictures say, and nowhere else', () => {
  for (const wall of [true, false]) {
    const slam = wall ? 'slamWall' : 'slam';
    const stomp = wall ? 'stompWall' : 'stomp';
    {
      const { g, m } = room(2.2, wall, slam);
      const s = watch(g, m, 2.6);
      near(firstHurt(s), UF_SLAM_HIT, 0.04, `${slam}: lands as its fist comes down`);
      assert.equal(s.hurts.length, 1, `${slam}: once`);
    }
    {
      const { g, m } = room(2.2, wall, slam);
      const s = watch(g, m, 2.6, (t) => (t > 0.3 && t < 1.0 ? { mx: 0, my: 1 } : null));
      assert.equal(s.hurts.length, 0, `${slam}: stepped aside, it misses`);
    }
    {
      const { g, m } = room(2.5, wall, stomp);
      const s = watch(g, m, 2.8);
      near(firstHurt(s), UF_STOMP_HIT, 0.04, `${stomp}: lands as its foot comes down`);
      assert.equal(s.hurts.length, 1, `${stomp}: once`);
      assert.ok(g.perils.some((p) => p.a1 === 'unfinished:cracks'), `${stomp}: the terrace cracked`);
    }
    {
      const { g, m } = room(5, wall, null);
      g.bosses.startAct(m, UF_ACTS, UF_ACTS.findIndex((a) => a.id === `unfinished:${stomp}`));
      const s = watch(g, m, 2.8);
      assert.equal(s.hurts.length, 0, `${stomp}: beyond its ring, nothing`);
    }
  }
});

test('6. the hurled block: lands where the hero stood, unless he steps out of its shadow; lies as cover till it crumbles', () => {
  {
    const { g, m } = room(6, true, 'hurlWall');
    const h = g.hero;
    const at = { x: h.x, y: h.y };
    const s = watch(g, m, 3.4);
    assert.equal(s.hurts.length, 1, 'it lands on him');
    const t = firstHurt(s);
    assert.ok(t > UF_HURL_HIT && t < UF_HURL_HIT + 1, `after it leaves its hands (${t.toFixed(2)})`);
    const b = g.perils.find((p) => p.a1 === 'unfinished:block')!;
    assert.ok(b && b.done === 1, 'it lies there');
    near(Math.hypot(b.x - at.x, b.y - at.y), 0, 0.3, 'where he stood');
    // (cover: once he is off it, it is a block of the floor)
    const L = g.level;
    const i = Math.floor(b.y) * L.floor.w + Math.floor(b.x);
    h.x = b.x + 3;
    h.y = b.y;
    watch(g, m, 0.2);
    assert.equal(L.walk[i], 0, 'nobody walks through it');
    // (and it crumbles: floor again)
    m.moveCd = UF_ACTS.map(() => 1e9);
    watch(g, m, UF.hurl.lies + 1);
    assert.equal(L.walk[i], 1, 'crumbled, it is floor again');
    assert.ok(!g.perils.some((p) => p.a1 === 'unfinished:block'), 'and gone');
  }
  {
    const { g, m } = room(6, true, 'hurlWall');
    const s = watch(g, m, 3.4, (t) => (t > UF.hurl.aim + 0.05 && t < UF.hurl.aim + 0.6 ? { mx: 0, my: 1 } : null));
    assert.equal(s.hurts.length, 0, 'out of its shadow in time, it misses');
  }
});

test('7. the rockslide: boulders down lanes marked on the floor, across the way to the hero; between them is safe', () => {
  for (const wall of [true, false]) {
    const id = wall ? 'rockslideWall' : 'rockslide';
    {
      const { g, m } = room(5, wall, id);
      const s = watch(g, m, 7);
      assert.equal(s.hurts.length, 1, `${id}: a boulder down his lane strikes him, once`);
      assert.ok(firstHurt(s) > UF_SLIDE_HIT, `${id}: after its blow (${firstHurt(s).toFixed(2)})`);
    }
    {
      const { g, m } = room(5, wall, id);
      const laid: number[][] = [];
      const c = emptyControls();
      let hurt = 0;
      for (let k = 0; k < 7 * 60; k++) {
        const t = k / 60;
        // (he steps half a lane's breadth along the way to it, after the first lanes are laid)
        c.mx = t > UF.slide.laid[0] + 0.05 && t < UF.slide.laid[0] + 0.35 ? -1 : 0;
        const before = g.hero.life;
        g.update(1 / 60, c);
        if (g.hero.life < before) hurt++;
        g.hero.life = g.hero.d.maxLife;
        for (const p of g.perils) if (p.a1 === 'unfinished:lane' && !laid.some((q) => q[0] === p.a && q[1] === p.b)) laid.push([p.a, p.b, p.fx, p.fy]);
      }
      assert.ok(laid.length >= 3, `${id}: its lanes (${laid.length})`);
      // (across the way to him: along the floor's y, he being due east of it)
      for (const l of laid) assert.ok(l[2] === 0 && l[3] === 1, `${id}: a lane along the floor's y`);
      for (const l of laid) assert.ok(Math.abs(l[0] - m.x) >= UF.slide.clear, `${id}: no lane through the Unfinished`);
      assert.equal(hurt, 0, `${id}: between the lanes, nothing strikes him`);
    }
  }
});

test('8. at half its life it tears itself free, and walks after him from then on', () => {
  const { g, m } = room(2.4, true, null);
  m.life = m.maxLife * 0.49;
  const s = watch(g, m, 3.6);
  assert.ok(s.events.some((e) => e.t === 'msg' && /tears itself free/.test(e.text)), 'told');
  near(firstHurt(s), UF_TEAR_HIT, 0.04, 'it rips free with a lunge, and what is before it is struck');
  assert.equal(m.form, 1, 'free');
  // (and from then on it is free: its moves free, and it walks)
  g.hero.x += 6;
  m.moveCd = UF_ACTS.map(() => 1e9);
  const x0 = m.x;
  watch(g, m, 4);
  assert.ok(m.x > x0 + 1, 'it walks after him');
  keep(m, 'slamWall');
  assert.equal(RULES!.can!(g.bosses, m, act('slamWall'), 2, true), false, 'its moves in the wall are done with');
  assert.equal(RULES!.can!(g.bosses, m, act('slam'), 2, true), true, 'its moves free');
});

/** A canvas that only notes the colours it is told to use. */
function noting(): { g: CanvasRenderingContext2D; colors: Set<string> } {
  const colors = new Set<string>();
  const target: Record<string, unknown> = { globalAlpha: 1, lineWidth: 1, globalCompositeOperation: 'source-over' };
  const g = new Proxy(target, {
    get(o, k: string) {
      if (k in o) return o[k];
      return () => undefined;
    },
    set(o, k: string, v) {
      if ((k === 'fillStyle' || k === 'strokeStyle') && typeof v === 'string') colors.add(v);
      o[k] = v;
      return true;
    },
  }) as unknown as CanvasRenderingContext2D;
  return { g, colors };
}
/** Is a colour the friend's: cyan, or near it? */
function cyan(c: string): boolean {
  const m = /^#([0-9a-f]{6})/i.exec(c);
  if (!m) return false;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255;
  const gg = (n >> 8) & 255;
  const b = n & 255;
  return b > 140 && gg > 140 && r < 120;
}

test('9. nothing it draws is cyan; its things\' pictures crisp', () => {
  // (each of its things on the floor and in the air, at moments of it)
  const { g, m } = room(6, true, 'rockslideWall');
  const { g: cv, colors } = noting();
  const stood: Sprite[] = [];
  const ctx: Act1FxCtx = { g: cv, at: (x, y) => [(x - y) * 16, (x + y) * 8], game: g, t: 0, bestiary: makeBestiary(), stand: (_d, s) => void stood.push(s), spot: () => undefined };
  for (let k = 0; k < 60 * 6; k++) {
    g.update(1 / 60, emptyControls());
    g.hero.life = g.hero.d.maxLife;
    if (k === 60 * 3) keep(m, 'hurlWall');
    if (k === 60 * 5) keep(m, 'stompWall');
    if (k % 6) continue;
    ctx.t = k / 60;
    FX!.ground!(ctx, m, null);
    for (const p of g.perils) if (p.a1) {
      FX!.ground!(ctx, null, p);
      FX!.standing!({ ...ctx, g: null }, null, p);
    }
  }
  assert.ok(colors.size > 3, `it drew (${[...colors].join(' ')})`);
  for (const c of colors) assert.ok(!cyan(c), `no cyan: ${c}`);
  for (const s of [...stood, ...[0, 1, 2, 3, 4].map(hurledBlock), ...[0, 3, 6].map(boulderRolling), ...[0, 3].map(stompCracks)]) {
    const d = paintingOf(s).d;
    for (let i = 0; i < d.length; i += 4) {
      if (!d[i + 3]) continue;
      assert.ok(d[i + 3] === 255, 'crisp: every pixel all there or not at all');
      assert.ok(!(d[i + 2] > 140 && d[i + 1] > 140 && d[i] < 120), 'nothing cyan');
    }
  }
  // (its picture in the wall: its stand and flinch there, by its effects)
  const sp = FX!.sprite!(m, ART, ART.front);
  assert.ok(sp === null || sp.w > 0, 'shown in the wall');
  m.state = 'chase';
  m.act = undefined;
  m.struckT = 0.1;
  assert.ok(FX!.sprite!(m, ART, ART.front) === ART.front.clips!.moves![UF_FUSED_CLIPS.reel].frames[3], 'struck in the wall: its flinch there');
  m.struckT = 5;
  m.form = 1;
  assert.equal(FX!.sprite!(m, ART, ART.front), null, 'free: as its gait and acts have it');
  // (its size, as the game goes by it: its stand)
  const s = ART.front.idle[0];
  const p = paintingOf(s);
  const ax = Math.round(s.ax * GRAIN);
  const ay = Math.round(s.ay * GRAIN);
  let head = 0;
  for (let y = 0; y < p.h && head === 0; y++) for (let x = ax - 3; x <= ax + 3; x++) if (p.has(x, y)) head = (ay - y) / GRAIN;
  near(FIGURE_SIZE.unfinished.top, head, 4, 'its top');
  assert.equal(FIGURE_SIZE.unfinished.top, FIG!.size.top, 'the game goes by its own');
});

test('9b. its things painted ahead (art/films.ts things:unfinished, by the painter as its floor is come to): the same pictures, and drawn from there once made', () => {
  assert.deepEqual(FX!.films, ['things:unfinished'], 'its floor asks for them');
  const film = makeFilm('things:unfinished') as ThingsFilm;
  const own: Record<string, Sprite[]> = { blocks: [0, 1, 2, 3, 4].map(hurledBlock), boulders: [0, 1, 2, 3, 4, 5, 6, 7].map(boulderRolling), cracks: [0, 1, 2, 3].map(stompCracks) };
  for (const [name, list] of Object.entries(own)) {
    assert.equal(film[name]?.length, list.length, `${name}: all of them`);
    list.forEach((s, i) => {
      const t = film[name][i];
      assert.deepEqual([t.w, t.h, t.ax, t.ay], [s.w, s.h, s.ax, s.ay], `${name} ${i}: its size and anchor`);
      assert.equal(unlike(t, s), 0, `${name} ${i}: the same picture`);
    });
  }
  // (drawn from the film once it is made; painted here where it is not)
  const all = new Set(Object.values(film).flat());
  for (const given of [true, false]) {
    const { g, m } = room(6, true, 'rockslideWall');
    const stood: Sprite[] = [];
    const ctx: Act1FxCtx = { g: noting().g, at: (x, y) => [(x - y) * 16, (x + y) * 8], game: g, t: 0, bestiary: makeBestiary(), stand: (_d, s) => void stood.push(s), spot: () => undefined, ...(given ? { film: <T>(key: string): T | null => (key === 'things:unfinished' ? (film as unknown as T) : null) } : {}) };
    for (let k = 0; k < 60 * 6; k++) {
      g.update(1 / 60, emptyControls());
      g.hero.life = g.hero.d.maxLife;
      if (k === 60 * 3) keep(m, 'hurlWall');
      if (k % 6) continue;
      ctx.t = k / 60;
      for (const p of g.perils) if (p.a1) {
        FX!.ground!(ctx, null, p);
        FX!.standing!({ ...ctx, g: null }, null, p);
      }
    }
    assert.ok(stood.length > 10, `it stood its things (${stood.length})`);
    const from = stood.filter((s) => all.has(s)).length;
    if (given) assert.equal(from, stood.length, 'all of them the film\'s');
    else assert.equal(from, 0, 'none of them the film\'s: painted here');
  }
});

test('10. a long fight on its floor, and killed in the middle of anything: nothing thrown, nothing left harming him', () => {
  const g = floor6(3);
  const m = g.boss!;
  const h = g.hero;
  // (it alone: the floor's packs, near its quarry on the longer floors, would follow him in and fell him at once)
  g.monsters = g.monsters.filter((o) => o === m);
  // (the hero brought before it, and kept alive; struck by him now and then, it tears free at half its life)
  h.x = m.x + m.fx * 3.5;
  h.y = m.y + m.fy * 3.5;
  (g as unknown as Hooks).wakeUp(m);
  const c = emptyControls();
  const walk0 = Uint8Array.from(g.level.walk);
  let tore = false;
  for (let k = 0; k < 60 * 90; k++) {
    const t = k / 60;
    c.mx = Math.cos(t * 0.6) * (t % 9 < 5 ? 1 : 0);
    c.my = Math.sin(t * 0.45) * (t % 9 < 5 ? 1 : 0);
    g.update(1 / 60, c);
    h.life = h.d.maxLife;
    if (k === 60 * 30) m.life = m.maxLife * 0.45;
    if (m.form === 1) tore = true;
    g.events.length = 0;
    if (g.over) break;
  }
  assert.ok(tore, 'it tore itself free');
  // (killed in the middle of an act: its things are done with, and the floor is as it was)
  for (const id of ['hurl', 'rockslide', 'stomp']) {
    for (const when of [0.5, 1.7, 2.3]) {
      const rr = room(5, false, id);
      for (let k = 0; k < 600 && !(rr.m.state === 'act' && rr.m.act && rr.m.act.t >= when); k++) rr.g.update(1 / 60, emptyControls());
      rr.g.kill(rr.m);
      const s = watch(rr.g, rr.m, 9);
      assert.equal(s.hurts.filter((x) => x.t > 1.5).length, 0, `${id}, killed ${when} s in: nothing of it harms him after`);
      assert.equal(rr.g.perils.filter((p) => p.a1 && p.a1.startsWith('unfinished:') && p.a1 !== 'unfinished:cracks').length, 0, `${id}, killed ${when} s in: nothing of it left`);
    }
  }
  g.kill(m);
  for (let k = 0; k < 60 * 3; k++) g.update(1 / 60, emptyControls());
  let changed = 0;
  for (let i = 0; i < walk0.length; i++) if (walk0[i] !== g.level.walk[i] && walk0[i] === 1) changed++;
  assert.equal(changed, 0, 'its blocks crumbled with it: the floor as it was');
});

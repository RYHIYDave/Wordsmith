// ACT 1: THE CLIFF CRAWLERS OF THE LEDGE ROAD IN THE GAME (game/act1_rules/crawler.ts, art/act1_figs/crawler.ts,
// render/act1_fx/crawler.ts), the art chat's pictures (art/ledge_crawlers.ts), its moves each with his yes as shown.
//   1. it is built: its rules, its pictures by the names its acts use, its size against them, its pace its walk's;
//   2. its numbers are its pictures' own (its swipe's claw, its leap's landing, its spring);
//   3. its claw swipe strikes at its picture's moment, before it and to its left, and misses one who has stepped away;
//   4. its leap comes down on the hero at its picture's moment and grabs him, and drags him as it hops back; he is held
//      only while he is dragged;
//   5. on the Ledge Road: one that comes into the world near the drop waits under the lip out of sight and out of reach,
//      and as it wakes springs up over the lip onto the road; its drag pulls the hero toward the drop, and never over it;
//   6. its packs are a medium monster's; nothing it draws is cyan; a long fight throws nothing and leaves him free.
//   run: tsx --test tests/act1_crawler.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { FIG } from '../src/art/act1_figs/crawler';
import { FIGURE_SIZE, makeBestiary } from '../src/art/bestiary';
import { CR_DIE, CR_LEAP, CR_PACE, CR_SWIPE, CR_WALK, crawlerSolids } from '../src/art/ledge_crawlers';
import { TILE3 } from '../src/art/new_mobs3';
import type { V3 } from '../src/art/skeleton';
import { RNG } from '../src/engine/rng';
import { CRAWLER, RULES, lipDepth, underLip } from '../src/game/act1_rules/crawler';
import { act1Pack, act1Ready } from '../src/game/act1_mobs';
import { MONSTERS, PACK_BY_SIZE, TUNE } from '../src/game/defs';
import type { Game } from '../src/game/game';
import { T_FLOOR, T_PIT } from '../src/game/types';
import { FX } from '../src/render/act1_fx/crawler';
import { cyan, floorOf, hooks, measure, noteColours, only, room, watch } from './act1_ledge_canyon_harness';
import { paintWithoutCanvas } from './helpers';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void };
paintWithoutCanvas();
const near = (a: number, b: number, tol: number, what: string): void => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} against ${b} (within ${tol})`);
const centre = (which: string, t: number, piece: string): V3 => {
  const b = crawlerSolids(which, t).find((x) => x.piece === piece)!;
  return (b.shape as { c: V3 }).c;
};

/** The places on a floor of the Ledge Road where the road meets the drop down the screen: the road's tile, and the drop's beside it. */
function lips(g: Game): { x: number; y: number; px: number; py: number }[] {
  const L = g.level;
  const f = L.floor;
  const drop = L.land!.drop!;
  const out: { x: number; y: number; px: number; py: number }[] = [];
  for (let ty = 1; ty < f.h - 1; ty++) {
    for (let tx = 1; tx < f.w - 1; tx++) {
      const i = ty * f.w + tx;
      if (f.tiles[i] !== T_FLOOR || L.walk[i] !== 1) continue;
      for (const [dx, dy] of [[1, 0], [0, 1]]) {
        const j = (ty + dy) * f.w + tx + dx;
        if (drop[j] === 1 && f.tiles[j] === T_PIT) out.push({ x: tx + 0.5, y: ty + 0.5, px: tx + dx + 0.5, py: ty + dy + 0.5 });
      }
    }
  }
  return out;
}

test('1. it is built: its rules, its pictures by the names its acts use, its size against its pictures', () => {
  assert.ok(RULES && FIG && FX, 'rules, pictures and what it draws');
  assert.ok(act1Ready('crawler'));
  assert.equal(MONSTERS.crawler.size, 'medium');
  assert.equal(RULES!.acts.filter((a) => !a.forced).length, 2, 'medium: two attacks, by his rule');
  const art = makeBestiary().of('crawler');
  for (const set of [art.front, art.back]) {
    for (const a of RULES!.acts) {
      const clip = a.clip === 'attack' ? set.clips?.attack : set.clips?.moves?.[a.clip];
      assert.ok(clip, `${a.id}: its clip, ${a.clip}`);
      near((clip!.frames.length - 1) / clip!.fps, a.long, 0.04, `${a.id}: as long as its clip`);
      near(clip!.hit ?? -1, a.hit, 1e-9, `${a.id}: its blow's moment is its clip's`);
    }
    assert.ok(set.clips?.reel && set.clips?.die, 'struck, and its death');
    assert.equal(set.clips!.die!.fps, CR_DIE.fps, 'its death at thirty a second, as painted');
    assert.ok(set.clips!.moves!.leap.frames[20].w > 0 && set.clips!.die!.frames[30].w > 0, 'its frames paint');
  }
  const { head, reach } = measure(art.front.idle[0]);
  near(FIG!.size.top, head, 4, 'the top of its back, standing');
  assert.ok(FIG!.size.half <= reach + 1 && FIG!.size.half >= reach * 0.4, `half its width ${FIG!.size.half}, its picture reaching ${reach}`);
  assert.equal(FIGURE_SIZE.crawler.top, FIG!.size.top);
  // (its feet grip the rock: it goes at the pace its walk is painted for)
  assert.equal(MONSTERS.crawler.speed, CR_PACE);
  assert.equal(RULES!.gait.pace, CR_PACE);
  assert.equal(RULES!.gait.cycle, CR_WALK.period);
});

test('2. its numbers are its pictures\' own', () => {
  const [swipe, leap, climb] = RULES!.acts;
  assert.equal(swipe.hit, CR_SWIPE.hit);
  assert.equal(swipe.long, CR_SWIPE.long);
  assert.equal(leap.hit, CR_LEAP.hit);
  assert.equal(leap.long, CR_LEAP.long);
  assert.equal(climb.clip, 'leap', 'up over the lip: its leap\'s own picture');
  // (the swipe: its claw at the blow is in the strip it strikes)
  const S = CRAWLER.swipe;
  const claw = centre('attack', CR_SWIPE.hit, 'claw0');
  const [f, l] = [claw[0] / TILE3, claw[1] / TILE3];
  assert.ok(f >= S.fwd[0] && f <= S.fwd[1] && l >= S.left[0] && l <= S.left[1], `its claw at the blow, ${f.toFixed(2)} before it and ${l.toFixed(2)} to its left, is in what it strikes`);
  // (the leap: its body and its head come down within the place it strikes)
  const L = CRAWLER.leap;
  for (const piece of ['carapace', 'head']) {
    const c = centre('leap', CR_LEAP.hit, piece);
    assert.ok(Math.abs(c[0] / TILE3 - L.at) <= L.r && Math.abs(c[1] / TILE3) <= L.r, `its ${piece} comes down where it strikes`);
  }
  near(L.from, CR_LEAP.hit + CR_LEAP.freeze, 1e-9, 'it lets go as its landing\'s freeze is over');
  near(L.to, CR_LEAP.long, 1e-9, 'and has hopped back by its end');
  // (up over the lip: crouched from its start, it springs from its warning's end and is down at its blow)
  assert.equal(CRAWLER.lip.spring[0], CR_LEAP.warn);
  assert.equal(CRAWLER.lip.spring[1], CR_LEAP.hit);
});

test('3. its claw swipe strikes at its picture\'s moment, and misses one who has stepped away', () => {
  let { g, m } = room('crawler', 1.2);
  only(m, 'crawler:swipe');
  const seen = watch(g, m, 3);
  const blows = seen.hurts.filter((x) => x.act === 'crawler:swipe');
  assert.ok(blows.length >= 1, 'it strikes him');
  for (const b of blows) near(b.at, CR_SWIPE.hit, 1 / 50, 'at the blow, as its picture has it');
  ({ g, m } = room('crawler', 1.2));
  only(m, 'crawler:swipe');
  const h = g.hero;
  let away = false;
  const miss = watch(g, m, 2, () => {
    if (!away && m.state === 'act') {
      away = true;
      h.x += 2.5;
    }
  }, () => away && m.state !== 'act');
  assert.ok(away, 'it began its swipe');
  assert.equal(miss.hurts.length, 0, 'it misses one out of its reach');
});

test('4. its leap comes down on him at its picture\'s moment, grabs him and drags him as it hops back', () => {
  let { g, m } = room('crawler', 1.2);
  only(m, 'crawler:leap');
  const h = g.hero;
  let from: { x: number; y: number } | null = null;
  let held = 0;
  let free = 0;
  const seen = watch(g, m, 2.5, () => {
    if (m.state === 'act' && m.act && m.act.id === 'crawler:leap') {
      if (m.act.t < CRAWLER.leap.hit) from = { x: h.x, y: h.y };
      else if (m.act.t > CRAWLER.leap.from + 0.05 && m.act.t < CRAWLER.leap.to - 0.05 && (h.held ?? 0) > 0) held++;
    } else if (from && (h.held ?? 0) <= 0) free++;
  });
  const blows = seen.hurts.filter((x) => x.act === 'crawler:leap');
  assert.equal(blows.length, 1, 'it comes down on him, once');
  near(blows[0].at, CR_LEAP.hit, 1 / 50, 'at the blow, as its picture has it');
  assert.ok(from, 'it leapt');
  const moved = Math.hypot(h.x - from!.x, h.y - from!.y);
  near(moved, CRAWLER.leap.drag, 0.25, 'he is dragged as it hops back');
  assert.ok(held > 10, 'held while he is dragged');
  assert.ok(free > 10, 'and let go after');
  // (one who has stepped away is neither struck nor grabbed)
  ({ g, m } = room('crawler', 1.2));
  only(m, 'crawler:leap');
  let away = false;
  const miss = watch(g, m, 2, () => {
    if (!away && m.state === 'act') {
      away = true;
      g.hero.x += 3;
    }
  }, () => away && m.state !== 'act');
  assert.equal(miss.hurts.length, 0, 'it misses him');
  assert.ok(!(g.hero.held ?? 0), 'and has not got hold of him');
});

test('5. on the Ledge Road: it waits under the lip, springs up over it as it wakes; its drag pulls him toward the drop, never over', () => {
  const g = floorOf(3, 7);
  const h = g.hero;
  g.monsters.length = 0;
  const all = lips(g).sort((a, b) => Math.hypot(a.x - h.x, a.y - h.y) - Math.hypot(b.x - h.x, b.y - h.y));
  assert.ok(all.length > 20, 'the road meets the drop');
  // (one put into the world two tiles in from the lip: it waits under the lip)
  const lip = all.find((p) => g.free(g.level.walk, p.x - (p.px - p.x) * 2, p.y - (p.py - p.y) * 2, 0.45))!;
  const m = g.spawn('crawler', lip.x - (lip.px - lip.x) * 2, lip.y - (lip.py - lip.y) * 2, 4, 0, false, new RNG(2));
  assert.ok(underLip(m), 'it waits under the lip');
  assert.ok(lips(g).some((p) => Math.abs(p.x - m.x) < 1e-9 && Math.abs(p.y - m.y) < 1e-9), 'at the lip: a tile of the road with the drop beside it down the screen');
  assert.equal(lipDepth(m), CRAWLER.lip.below, 'let down under the edge');
  const blank = FX!.sprite!(m, makeBestiary().of('crawler'), makeBestiary().of('crawler').front);
  assert.ok(blank && blank.w <= 1, 'not seen while it waits');
  const life = m.life;
  hooks(g).damageMonster(m, 5, 'phys', false, -1);
  assert.equal(m.life, life, 'and out of reach');
  // (it wakes: it springs up over the lip)
  hooks(g).wakeUp(m);
  const depth: number[] = [];
  let reachDuring = 0;
  const seen = watch(g, m, 3, () => {
    if (m.act && m.act.id === 'crawler:climb') {
      depth.push(lipDepth(m));
      const before = m.life;
      hooks(g).damageMonster(m, 1, 'phys', false, -1);
      if (m.life < before) reachDuring++;
    }
  });
  assert.ok(seen.acts.length && seen.acts[0].id === 'crawler:climb' && seen.acts[0].t <= CRAWLER.lip.stagger + 0.1, 'it springs up as it wakes');
  assert.ok(depth[0] === CRAWLER.lip.below && depth[depth.length - 1] === 0, 'from under the edge up onto the road');
  for (let i = 1; i < depth.length; i++) assert.ok(depth[i] <= depth[i - 1] + 1e-9, 'only ever rising');
  assert.equal(reachDuring, 0, 'out of reach as it climbs');
  assert.ok(!underLip(m) && g.free(g.level.walk, m.x, m.y, 0.42), 'up, and on the road');
  assert.equal(seen.hurts.length, 0, 'its climb harms nobody');
  // THE DRAG TOWARD THE DROP: the hero at a lip, it before him on the road
  let tried = 0;
  for (const p of all) {
    const ix = p.x - p.px;
    const iy = p.y - p.py;
    const cx = p.x + ix * 1.25;
    const cy = p.y + iy * 1.25;
    if (!g.free(g.level.walk, cx, cy, 0.45) || !g.free(g.level.walk, p.x + ix * 0.3, p.y + iy * 0.3, TUNE.heroRadius)) continue;
    if (++tried > 3) break;
    g.monsters.length = 0;
    h.x = p.x + ix * 0.3;
    h.y = p.y + iy * 0.3;
    const c = g.spawn('crawler', cx, cy, 5, 0, false, new RNG(4));
    c.a1 = { hid: 0, wait: 0, ix: 0, iy: 0, grab: 0, gx: 0, gy: 0, ox: 0, oy: 0 };
    c.x = cx;
    c.y = cy;
    hooks(g).wakeUp(c);
    c.life = c.maxLife = 1e9;
    c.words = [];
    only(c, 'crawler:leap');
    const pit = (): number => Math.hypot(h.x - p.px, h.y - p.py);
    const before = pit();
    let grabbed = false;
    watch(g, c, 2, () => {
      if (c.a1 && c.a1.grab) grabbed = true;
      assert.ok(g.free(g.level.walk, h.x, h.y, TUNE.heroRadius), 'he is never over the edge');
    });
    assert.ok(grabbed, 'it grabs him');
    assert.ok(pit() <= before + 1e-6, `dragged toward the drop, not away (${before.toFixed(2)} to ${pit().toFixed(2)})`);
  }
  assert.ok(tried > 0, 'a lip to try it at');
});

test('6. its packs are a medium monster\'s; nothing it draws is cyan; a long fight throws nothing and leaves him free', () => {
  let n = 0;
  for (let s = 1; s < 400 && n < 5; s++) {
    const p = act1Pack(7, new RNG(s), 'normal');
    if (p.kind !== 'crawler') continue;
    n++;
    assert.ok(p.size >= PACK_BY_SIZE.medium[0] && p.size <= PACK_BY_SIZE.medium[1], `a pack of ${p.size}`);
  }
  assert.ok(n > 0, 'the Ledge Road has packs of them');
  // (what it draws on the floor: its leap's ring, and the scrape of its drag)
  const { g, m } = room('crawler', 1.2);
  only(m, 'crawler:leap');
  const { ctx, colours } = noteColours();
  const draw = (): void => FX!.ground!({ g: ctx, at: (x, y) => [(x - y) * 16, (x + y) * 8], game: g, t: 1, bestiary: makeBestiary(), stand: () => undefined, spot: () => undefined }, m, null);
  watch(g, m, 2.5, draw);
  assert.ok(colours.size > 3, 'it draws its ring and its scrape');
  for (const c of colours) assert.ok(!cyan(c), `${c} is not cyan`);
  // A LONG FIGHT on the Ledge Road, by the drop: a pack, a hero who walks about and strikes what he reaches
  const f = floorOf(5, 7);
  const h = f.hero;
  f.monsters.length = 0;
  const pack = f.spotsRound(h.x + 2, h.y + 2, 4).map((s) => f.spawn('crawler', s.x, s.y, 6, 0, false, new RNG(7)));
  for (const c of pack) hooks(f).wakeUp(c);
  const x0 = h.x;
  const y0 = h.y;
  watch(f, pack[0], 45, (t) => {
    if (!(h.held ?? 0)) {
      const nx = x0 + Math.cos(t * 0.5) * 1.5;
      const ny = y0 + Math.sin(t * 0.5) * 1.5;
      if (f.free(f.level.walk, nx, ny, TUNE.heroRadius)) {
        h.x = nx;
        h.y = ny;
      }
    }
    if (Math.round(t * 60) % 15 === 0) for (const c of pack) if (!c.dead && Math.hypot(c.x - h.x, c.y - h.y) < 1.8) hooks(f).damageMonster(c, 6, 'phys', false, -1);
  });
  assert.ok(pack.some((c) => c.dead), 'he kills some of them');
  for (const c of pack) if (!c.dead) f.kill(c);
  watch(f, pack[0], 0.5);
  assert.ok(!(h.held ?? 0), 'and nothing has hold of him after');
});

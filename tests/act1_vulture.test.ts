// ACT 1: THE VULTURES OF THE LEDGE ROAD IN THE GAME (game/act1_rules/vulture.ts, art/act1_figs/vulture.ts,
// render/act1_fx/vulture.ts), the art chat's pictures (art/ledge_vultures.ts) each with his yes as shown.
//   1. it is built: its rules, its pictures (the clips its acts name, its death at thirty a second), its size against them;
//   2. its numbers are its pictures' own (its dive's moments, its talons' reach, its pull-out);
//   3. it perches while it sleeps, takes off as it wakes, and circles overhead, struck up there all the same (Version
//      23.5: his “Oh the vultures being unhittable in the air has to go.  It’s infuriating to fight them”);
//   4. its dive strikes at its picture's moment where its talons are, and misses one who has stepped off its line; at
//      the bottom of its dive it can be struck, and flinches;
//   5. one called into a fight (the Carrion Queen's flock) comes down out of the sky and dives;
//   6. its packs are a small monster's; nothing it draws is cyan; a long fight throws nothing;
//   7. killed up in the air it falls from there (the 'die' event's lift, render.ts fallenLift); over the drop it falls
//      away into it, and what it leaves lands on the floor; overhead, it neither jostles nor is jostled.
//   run: tsx --test tests/act1_vulture.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { FIG } from '../src/art/act1_figs/vulture';
import { FIGURE_SIZE, makeBestiary } from '../src/art/bestiary';
import { VULTURE as VULTURE_MOB, VULTURE_DEATH, VULTURE_DIVE, VULTURE_PACE, VULTURE_WALK, vultureDivePose } from '../src/art/ledge_vultures';
import { TILE3, skeletonAt } from '../src/art/new_mobs3';
import { RNG } from '../src/engine/rng';
import { RULES, VULTURE, liftOf } from '../src/game/act1_rules/vulture';
import { act1Pack, act1Ready } from '../src/game/act1_mobs';
import { MONSTERS, PACK_BY_SIZE } from '../src/game/defs';
import { FX } from '../src/render/act1_fx/vulture';
import { FALL, fallenLift } from '../src/render/render';
import type { Monster } from '../src/game/state';
import { T_PIT } from '../src/game/types';
import { cyan, floorOf, hooks, measure, noteColours, room, watch } from './act1_ledge_canyon_harness';
import { paintWithoutCanvas } from './helpers';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void };
paintWithoutCanvas();
const near = (a: number, b: number, tol: number, what: string): void => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} against ${b} (within ${tol})`);

test('1. it is built: its rules, its pictures by the names its acts use, its size against its pictures', () => {
  assert.ok(RULES && FIG && FX, 'rules, pictures and what it draws');
  assert.ok(act1Ready('vulture'), 'in the game: no longer stood in for by the cult');
  assert.equal(MONSTERS.vulture.size, 'small');
  const art = makeBestiary().of('vulture');
  for (const set of [art.front, art.back]) {
    for (const a of RULES!.acts) {
      const clip = a.clip === 'attack' ? set.clips?.attack : set.clips?.moves?.[a.clip];
      assert.ok(clip, `${a.id}: its clip, ${a.clip}`);
      near((clip!.frames.length - 1) / clip!.fps, a.long, 0.04, `${a.id}: its clip is as long as the act`);
      near(clip!.hit ?? -1, a.hit, 1e-9, `${a.id}: its blow's moment is its clip's`);
    }
    assert.ok(set.clips?.reel && set.clips.reel.frames.length > 1, 'struck: its flinch');
    assert.equal(set.clips?.die?.fps, VULTURE_DEATH.fps, 'its death at the thirty a second it is painted for');
    near((set.clips!.die!.frames.length - 1) / set.clips!.die!.fps, VULTURE_DEATH.long, 1e-9, 'its death as long as it is painted');
    assert.equal(set.walk.length, VULTURE_WALK.frames, 'its circling flight');
    assert.equal(set.walkFps, VULTURE_WALK.fps, 'one wing beat a second, as painted');
    assert.ok(set.walk[3].w > 0 && set.clips!.attack!.frames[21].w > 0 && set.clips!.die!.frames[30].w > 0, 'its frames paint');
  }
  // (its size as the game's figures' are held to their pictures)
  const { head, reach } = measure(art.front.idle[0]);
  near(FIG!.size.top, head, 4, 'the top of its head, standing');
  assert.ok(FIG!.size.half <= reach + 1 && FIG!.size.half >= reach * 0.4, `half its width ${FIG!.size.half}, its picture reaching ${reach}`);
  assert.equal(FIGURE_SIZE.vulture.top, FIG!.size.top, 'the game goes by its size');
});

test('2. its numbers are its pictures\' own', () => {
  const D = VULTURE.dive;
  assert.equal(D.long, VULTURE_DIVE.long);
  assert.equal(D.hit, VULTURE_DIVE.hit);
  assert.equal(D.warn, VULTURE_DIVE.warn);
  assert.equal(RULES!.gait.pace, VULTURE_PACE, 'the pace its walk is painted for');
  near(RULES!.gait.cycle, VULTURE_WALK.frames / VULTURE_WALK.fps, 1e-9, 'its wing beat');
  // (its talons at the strike: so far before its floor point)
  const s = skeletonAt(VULTURE_MOB, 'attack', VULTURE_DIVE.hit);
  near(D.reach, Math.max(s.toeL[0], s.toeR[0]) / TILE3, 0.06, 'its talons\' reach at the strike');
  // (its pull-out: its body comes back to its floor point between `from` and `to`, by `back`)
  const px = (t: number): number => (vultureDivePose(t).px ?? 0) / TILE3;
  near(px(VULTURE_DIVE.hit + VULTURE_DIVE.freeze), px(D.from), 1e-6, 'held out before it until its pull-out');
  near(px(D.from) - px(D.to), D.back, 0.01, 'and back to its floor point by its end');
  near(px(D.to), 0, 1e-6, 'its dive ends where it began, in the picture');
  // (it stoops after its warning's hold)
  assert.ok(D.stoop > D.warn && D.stoop < D.hit, 'the stoop after the warning, before the strike');
});

test('3. it perches asleep, takes off as it wakes, and circles overhead, struck up there all the same', () => {
  const g = floorOf(7, 7);
  const h = g.hero;
  g.monsters.length = 0;
  // (a perch of the floor's own, well away from him: one beside him is one called in)
  let spot = { x: h.x, y: h.y };
  for (let k = 0; k < 64 && Math.hypot(spot.x - h.x, spot.y - h.y) < 7; k++) {
    const x = h.x + Math.cos(k * 0.4) * 7.5;
    const y = h.y + Math.sin(k * 0.4) * 7.5;
    if (g.free(g.level.walk, x, y, 0.3) && g.sees(h.x, h.y, x, y)) spot = { x, y };
  }
  const m = g.spawn('vulture', spot.x, spot.y, 7, 0, false, new RNG(3));
  assert.equal(m.state, 'sleep');
  assert.equal(liftOf(m), 0, 'on its perch, on the floor');
  assert.equal(FX!.lift!(m), 0);
  assert.ok(Math.hypot(m.x - h.x, m.y - h.y) > VULTURE.callNear, 'a perch well away from him');
  // (it wakes as the hero comes in sight of it)
  const lifts: number[] = [];
  const round: number[] = [];
  let struck = 0;
  watch(g, m, 6, () => {
    lifts.push(liftOf(m));
    if (m.state !== 'act' && liftOf(m) >= VULTURE.high) {
      round.push(Math.hypot(m.x - h.x, m.y - h.y));
      // (up there it is struck all the same, and flinches: Version 23.5; its life put back, to watch it on)
      const life = m.life;
      hooks(g).damageMonster(m, 3, 'phys', false, -1);
      if (m.life < life && m.struckT !== undefined && m.struckT < 0.05) struck++;
      m.life = life;
    }
    // (wherever it flies, it is over floor or the drop: what flies goes by the open grid)
    assert.ok(g.isOpen(m.x, m.y), 'over open ground');
    m.a1!.next = 99;
  });
  assert.ok(lifts[0] < 3, 'it takes off from its perch');
  assert.ok(lifts.some((v) => v >= VULTURE.high), 'and climbs to its height');
  assert.ok(round.length > 60, 'it comes to him and circles');
  assert.equal(struck, round.length, 'up in the air every blow reaches it');
  const mean = round.reduce((s, v) => s + v, 0) / round.length;
  near(mean, VULTURE.ring, 0.9, 'round the hero, about its ring out');
  near(FX!.lift!(m), liftOf(m), 1e-9, 'drawn as high as it is');
});

test('4. its dive strikes at its picture\'s moment where its talons are; it misses one who steps off its line; low or high, it can be struck', () => {
  // (struck: a hero who stands)
  let { g, m } = room('vulture', 3);
  const seen = watch(g, m, 7);
  const dives = seen.acts.filter((a) => a.id === 'vulture:dive');
  assert.ok(dives.length >= 1, 'it dives');
  const blows = seen.hurts.filter((x) => x.act === 'vulture:dive');
  assert.ok(blows.length >= 1, 'its dive strikes him');
  for (const b of blows) near(b.at, VULTURE.dive.hit, 1 / 50, 'at the strike, as its picture has it');
  assert.equal(seen.hurts.filter((x) => x.act !== 'vulture:dive').length, 0, 'nothing else of it harms him');
  // (one who steps off its line as it climbs to dive is not struck)
  ({ g, m } = room('vulture', 3));
  const h = g.hero;
  let moved = false;
  const dodge = watch(g, m, 7, () => {
    if (!moved && m.state === 'act' && m.act && m.act.t > 0.1 && m.act.t < 0.3) {
      moved = true;
      // (two tiles to the side of its line)
      const ux = m.fx;
      const uy = m.fy;
      h.x += -uy * 2;
      h.y += ux * 2;
    }
  }, () => moved && m.state !== 'act');
  assert.ok(moved, 'it began a dive');
  assert.equal(dodge.hurts.length, 0, 'it misses him');
  // (at the bottom of its dive it can be struck, and flinches)
  ({ g, m } = room('vulture', 3));
  m.life = m.maxLife = 1000;
  let low = false;
  let high = false;
  watch(g, m, 7, () => {
    if (m.state === 'act' && m.act && m.act.t >= 0.75 && m.act.t < 1.0 && !low) {
      const life = m.life;
      hooks(g).damageMonster(m, 3, 'phys', false, -1);
      low = m.life < life && m.struckT !== undefined && m.struckT < 0.05;
    }
    if (m.state !== 'act' && liftOf(m) >= VULTURE.high && !high) {
      const life = m.life;
      hooks(g).damageMonster(m, 3, 'phys', false, -1);
      high = m.life < life && m.struckT !== undefined && m.struckT < 0.05;
    }
  });
  assert.ok(low, 'low, at the bottom of its dive, it is struck and flinches');
  assert.ok(high, 'high, it is struck and flinches too (Version 23.5)');
});

test('5. one called into a fight comes down out of the sky and dives', () => {
  const { g, m } = room('vulture', 1.5);
  // (room() spawns it and wakes it at once: as the Carrion Queen's call will bring her flock)
  const lifts: number[] = [];
  const seen = watch(g, m, 4, () => lifts.push(liftOf(m)));
  assert.ok(lifts[0] > VULTURE.high + 30, 'it comes down out of the sky');
  assert.ok(seen.acts.some((a) => a.id === 'vulture:dive' && a.t < 3), 'and dives soon');
});

test('6. its packs are a small monster\'s; nothing it draws is cyan; a long fight throws nothing', () => {
  // (a floor 7 pack of vultures, by the floor's own packs)
  let n = 0;
  for (let s = 1; s < 400 && n < 5; s++) {
    const p = act1Pack(7, new RNG(s), 'normal');
    if (p.kind !== 'vulture') continue;
    n++;
    assert.ok(p.size >= PACK_BY_SIZE.small[0] && p.size <= PACK_BY_SIZE.small[1], `a pack of ${p.size}`);
  }
  assert.ok(n > 0, 'the Ledge Road has packs of them');
  // (its dive's line on the floor: the enemy's pink and gold)
  const { g, m } = room('vulture', 3);
  watch(g, m, 6, undefined, () => m.state === 'act' && !!m.act && m.act.t > 0.4);
  const { ctx, colours } = noteColours();
  FX!.ground!({ g: ctx, at: (x, y) => [(x - y) * 16, (x + y) * 8], game: g, t: 1, bestiary: makeBestiary(), stand: () => undefined, spot: () => undefined }, m, null);
  assert.ok(colours.size > 0, 'its line is drawn');
  for (const c of colours) assert.ok(!cyan(c), `${c} is not cyan`);
  // A LONG FIGHT on the Ledge Road: a flock round a hero who walks about and strikes what he can reach
  const f = floorOf(11, 7);
  const h = f.hero;
  f.monsters.length = 0;
  const flock = f.spotsRound(h.x, h.y + 3, 5).map((s) => f.spawn('vulture', s.x, s.y, 3, 0, false, new RNG(5)));
  for (const v of flock) hooks(f).wakeUp(v);
  const x0 = h.x;
  const y0 = h.y;
  let kills = 0;
  watch(f, flock[0], 60, (t) => {
    h.x = x0 + Math.cos(t * 0.4) * 1.2;
    h.y = y0 + Math.sin(t * 0.4) * 1.2;
    if (Math.round(t * 60) % 12 === 0) for (const v of flock) if (!v.dead && Math.hypot(v.x - h.x, v.y - h.y) < 2) hooks(f).damageMonster(v, 4, 'phys', false, -1);
    kills = flock.filter((v) => v.dead).length;
  });
  assert.ok(kills >= 1, `the hero kills those he can reach as they dive (${kills})`);
});

test('7. killed up in the air it falls from there; over the drop it falls away into it, what it leaves on the floor; overhead it is aloft', () => {
  // (his words to the main chat, 20 Oct 2026, 21:31 Pacific: “Oh the vultures being unhittable in the air has to go.  It’s infuriating to fight them”)
  assert.equal(RULES!.reachable, undefined, 'nothing keeps it out of reach');
  const g = floorOf(7, 7);
  const L = g.level;
  const f = L.floor;
  const h = g.hero;
  g.monsters.length = 0;
  // (a tile of the drop, and a tile of the road, near the hero)
  let pit: { x: number; y: number } | null = null;
  let road: { x: number; y: number } | null = null;
  for (let r = 1; r < 30 && !(pit && road); r++) {
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      const tx = Math.floor(h.x) + dx;
      const ty = Math.floor(h.y) + dy;
      if (tx < 0 || ty < 0 || tx >= f.w || ty >= f.h) continue;
      const i = ty * f.w + tx;
      if (!pit && f.tiles[i] === T_PIT && L.open[i] === 1) pit = { x: tx + 0.5, y: ty + 0.5 };
      if (!road && r > 2 && L.walk[i] === 1 && g.free(L.walk, tx + 0.5, ty + 0.5, 0.3)) road = { x: tx + 0.5, y: ty + 0.5 };
    }
  }
  assert.ok(pit && road, 'the Ledge Road has its drop and its road');
  const fell = (at: { x: number; y: number }): { lift?: number; away?: boolean; m: Monster } => {
    const m = g.spawn('vulture', at.x, at.y, 7, 0, false, new RNG(4));
    hooks(g).wakeUp(m);
    m.a1!.lift = VULTURE.high;
    m.carries = ['fire'];
    g.events.length = 0;
    const was = g.drops.length;
    hooks(g).damageMonster(m, 1e6, 'phys', false, -1);
    assert.ok(m.dead, 'struck down up there');
    const e = g.events.find((x) => x.t === 'die');
    assert.ok(e && e.t === 'die', 'it dies');
    const got = g.drops.slice(was);
    assert.ok(got.length >= 1, 'it leaves what it carried');
    for (const d of got) assert.equal(L.walk[Math.floor(d.y) * f.w + Math.floor(d.x)], 1, `what it leaves lies on floor that can be walked to (${d.x.toFixed(2)}, ${d.y.toFixed(2)})`);
    return e && e.t === 'die' ? { lift: e.lift, away: e.away, m } : { m };
  };
  const overRoad = fell(road!);
  near(overRoad.lift ?? -1, VULTURE.high, 1e-9, 'over the road: it falls from as high as it flew');
  assert.ok(!overRoad.away, 'and lies on the road');
  const overDrop = fell(pit!);
  near(overDrop.lift ?? -1, VULTURE.high, 1e-9, 'over the drop: from as high as it flew');
  assert.equal(overDrop.away, true, 'and away into the drop');
  // (as it is drawn: down to the floor as its death's fall lands; over the drop, on past it and gone)
  const L0 = VULTURE.high;
  near(fallenLift({ lift: L0, t: 0 }).up, L0, 1e-9, 'at the blow, where it was');
  near(fallenLift({ lift: L0, t: FALL.from }).up, L0, 1e-9, 'held through the blow\'s freeze');
  assert.ok(fallenLift({ lift: L0, t: 0.4 }).up < L0 && fallenLift({ lift: L0, t: 0.4 }).up > 0, 'falling');
  near(fallenLift({ lift: L0, t: FALL.to }).up, 0, 1e-9, 'on the floor as its death lands it on its back');
  near(fallenLift({ lift: L0, t: 0.9 }).up, 0, 1e-9, 'and lies there');
  assert.equal(fallenLift({ lift: L0, t: 0.9 }).alpha, 1);
  assert.ok(fallenLift({ lift: L0, away: true, t: 0.7 }).up < 0, 'over the drop, on down past the floor');
  assert.equal(fallenLift({ lift: L0, away: true, t: FALL.gone }).alpha, 0, 'and gone');
  assert.ok(FALL.to - FALL.from > 0 && Math.abs(FALL.from - VULTURE_DEATH.freeze) < 1e-9, 'its fall after its death\'s freeze');
  // (overhead it is aloft: over what is on the ground, not among it; on its perch it is not)
  const m = g.spawn('vulture', road!.x, road!.y, 7, 0, false, new RNG(4));
  assert.equal(RULES!.aloft!(m), false, 'on its perch');
  m.a1!.lift = VULTURE.high;
  assert.equal(RULES!.aloft!(m), true, 'up in the air');
});

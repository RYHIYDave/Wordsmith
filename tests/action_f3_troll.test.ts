// FLOOR 3, MORE ACTION IN THE GAME (game/defs.ts ACTION_F3; game/action_f3.ts): the green troll's rampage and his bull rush, the
// rules the main chat put to the art chat's pictures (his yes to them, 31 Oct 2026). Held here:
//   1. off, his swing and his slam as ever; on, the rampage and the rush, their blows where his pictures have them, and the art's
//      switch (BRUTE_RAMPAGE) with them; the red troll untouched;
//   2. the rampage: a hero who stands before him is struck by both swings and the slam; one behind him by none;
//   3. it carries him 2.0 tiles the way he faces, where nothing is in his way; and not on through the hero;
//   4. its ring is marked as his club goes up (RAMPAGE.raise), RING.ahead before where he will land, RING.radius round; staggered
//      before the slam, the mark goes and nothing comes;
//   5. the bull rush: down its lane at its pace, the hero in it struck once and knocked aside; his stop carries him on.
//   run: tsx --test tests/action_f3_troll.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { RAMPAGE, RING, RUSH } from '../src/art/action_f3_fx';
import { BRUTE_RAMPAGE, RAMPAGE_HITS, RAMPAGE_LONG } from '../src/art/monster_brute';
import { useActionF3 } from '../src/art/bestiary';
import { ACTION_F3, MONSTERS, movesOf } from '../src/game/defs';
import { RING_PERIL } from '../src/game/action_f3';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Monster } from '../src/game/state';

function on<T>(fn: () => T): T {
  const was = ACTION_F3.on;
  useActionF3(true);
  try {
    return fn();
  } finally {
    useActionF3(was);
  }
}

/** A floor of the green troll's with a long clear run along +x, the hero set on it (the first such place on it). */
function floor(): Game {
  const g = new Game('warrior', 4245);
  g.depth = 4;
  g.enterDungeon();
  g.monsters = [];
  g.perils = [];
  g.zones = [];
  const h = g.hero;
  const G = g as unknown as { free(w: Uint8Array, x: number, y: number, r: number): boolean };
  const f = g.level.floor;
  const clear = (x: number, y: number): boolean => {
    for (let a = -9; a <= 4; a += 0.25) for (const s of [-1.3, 0, 1.3]) if (!G.free(g.level.walk, x + a, y + s, 0.6)) return false;
    return true;
  };
  for (let y = 2; y < f.h - 2; y++) {
    for (let x = 10; x < f.w - 5; x++) {
      if (!clear(x + 0.5, y + 0.5)) continue;
      h.x = x + 0.5;
      h.y = y + 0.5;
      return g;
    }
  }
  throw new Error('no room for a troll');
}
/** A green troll `d` tiles from the hero along -x (so facing +x at him), beginning his move `i`; in his rampage, walking nowhere of himself (his rush runs at his pace). */
function troll(d: number, i: number): { g: Game; m: Monster } {
  const g = floor();
  const h = g.hero;
  const m = g.spawn('brute', h.x - d, h.y, -1, 0, false, g.rng);
  m.champion = false;
  g.monsters = [m];
  m.state = 'chase';
  if (i === 0) m.speed = 0;
  const G = g as unknown as { startMove(m: Monster, def: unknown, moves: unknown, i: number): void };
  G.startMove(m, MONSTERS.brute, movesOf(m), i);
  return { g, m };
}
/** Run it `secs` seconds; `each` told the clock every frame. How many times the hero was struck. */
function run(g: Game, secs: number, each: (t: number) => void = () => undefined): number {
  const h = g.hero;
  const c = emptyControls();
  let hits = 0;
  for (let k = 1; k <= Math.round(secs * 30); k++) {
    h.invuln = 0;
    h.life = h.d.maxLife;
    g.update(1 / 30, c);
    if (h.life < h.d.maxLife) hits++;
    each(k / 30);
  }
  return hits;
}

test('1. off, as ever; on, the rampage and the rush where his pictures have them, and the art with them; the red troll untouched', () => {
  assert.equal(ACTION_F3.on, false);
  assert.equal(BRUTE_RAMPAGE.on, false);
  assert.deepEqual(movesOf({ kind: 'brute', champion: false })!.map((m) => m.id), ['swing', 'slam']);
  const red = movesOf({ kind: 'brute', champion: true });
  on(() => {
    assert.ok(BRUTE_RAMPAGE.on);
    const now = movesOf({ kind: 'brute', champion: false })!;
    assert.deepEqual(now.map((m) => m.id), ['rampage', 'charge']);
    assert.ok(Math.abs(now[0].windup - RAMPAGE_HITS[2]) < 1e-9 && Math.abs(now[0].windup + now[0].recover - RAMPAGE_LONG) < 1e-9, 'the rampage as his picture has it');
    assert.ok(Math.abs(now[1].windup - RUSH.windup) < 1e-9 && Math.abs(now[1].recover - RUSH.recover) < 1e-9, 'the rush as his pictures have it');
    assert.equal(movesOf({ kind: 'brute', champion: true }), red, 'the red troll as he was');
  });
  assert.ok(!BRUTE_RAMPAGE.on);
});

test('2. the rampage: before him, both swings and the slam; behind him, nothing', () => {
  on(() => {
    const a = troll(1.8, 0);
    assert.equal(run(a.g, RAMPAGE_LONG + 0.1), 3, 'struck by both swings and the slam');
    const b = troll(1.8, 0);
    b.g.hero.x = b.m.x - 1.8;
    assert.equal(run(b.g, RAMPAGE_LONG + 0.1), 0, 'behind him, nothing');
  });
});

test('3. carried 2.0 tiles the way he faces; not on through the hero', () => {
  on(() => {
    const a = troll(8, 0);
    const x0 = a.m.x;
    run(a.g, RAMPAGE_LONG + 0.05);
    assert.ok(Math.abs(a.m.x - x0 - RAMPAGE.travel) < 0.05, `carried ${(a.m.x - x0).toFixed(2)} tiles`);
    const b = troll(1.6, 0);
    run(b.g, RAMPAGE_LONG + 0.05);
    assert.ok(b.m.x < b.g.hero.x, `stopped before the hero (${(b.g.hero.x - b.m.x).toFixed(2)} tiles short)`);
  });
});

test('4. its ring marked as the club goes up, where he will land; staggered first, it goes and nothing comes', () => {
  on(() => {
    const { g, m } = troll(8, 0);
    const x0 = m.x;
    let marked = -1;
    let ring: { x: number; y: number; r: number } | null = null;
    run(g, RAMPAGE_HITS[2] - 0.1, (t) => {
      const z = g.zones.find((q) => q.kind === 'warn' && q.src === m.id);
      if (z && marked < 0) {
        marked = t;
        ring = { x: z.x, y: z.y, r: z.r };
      }
    });
    assert.ok(Math.abs(marked - RAMPAGE.raise) < 0.05, `marked at ${marked.toFixed(3)} s`);
    const got = ring as { x: number; y: number; r: number } | null;
    assert.ok(got && Math.abs(got.x - (x0 + RAMPAGE.travel + RING.ahead)) < 0.05 && got.r === RING.radius, 'where he will land, and as wide as the ring');
    // (staggered: the mark goes, and nothing comes)
    const s = troll(1.8, 0);
    let gone = false;
    const hits = run(s.g, RAMPAGE_LONG + 0.1, (t) => {
      if (!gone && t >= RAMPAGE.raise + 0.2) {
        gone = true;
        (s.g as unknown as { breakOff(m: Monster): void }).breakOff(s.m);
        s.m.speed = 0;
        s.m.cd = 99;
      }
    });
    assert.ok(!s.g.zones.some((q) => q.kind === 'warn' && q.src === s.m.id), 'its mark gone');
    assert.ok(!s.g.perils.some((p) => p.a1 === RING_PERIL), 'no ring');
    assert.equal(hits, 2, 'the two swings only');
  });
});

test('5. the bull rush: down its lane at its pace; the hero in it struck once, knocked aside; carried on through his stop', () => {
  on(() => {
    const { g, m } = troll(6, 1);
    const lane = g.zones.find((z) => z.kind === 'lane' && z.src === m.id);
    assert.ok(lane && Math.abs(lane.r - RUSH.half) < 1e-9, 'its lane as wide as his');
    assert.ok(lane && Math.abs((lane.x1 ?? 0) - lane.x - (6 + RUSH.past + RUSH.stop)) < 0.25, `its lane on ${((lane?.x1 ?? 0) - (lane?.x ?? 0)).toFixed(2)} tiles`);
    const hy = g.hero.y;
    let off = -1;
    let ended = -1;
    let endX = 0;
    let stopX = 0;
    const hits = run(g, RUSH.windup + 2, (t) => {
      if (m.state === 'charge' && off < 0) off = t;
      if (m.state === 'recover' && off >= 0 && ended < 0) {
        ended = t;
        endX = m.x;
      }
      // (where his stop has taken him, while he stops: after it, he turns back for the hero)
      if (m.state === 'recover' && ended >= 0) stopX = m.x;
    });
    assert.ok(Math.abs(off - RUSH.windup) < 0.05, `off at ${off.toFixed(3)} s`);
    assert.equal(hits, 1, 'struck once');
    assert.ok(Math.abs(g.hero.y - hy) > 0.5, 'knocked aside');
    assert.ok(Math.abs(stopX - endX - RUSH.stop) < 0.15, `his stop carried him ${(stopX - endX).toFixed(2)} tiles`);
  });
});

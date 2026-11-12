// THE PRISON'S STORIES (game/stories.ts, STORIES; art/prison_story.ts, the threads' pieces). His picks, 12 Nov 2026: floor 1 “The
// night it fell”, floor 2 “The endless line”, floor 3 “The thing below”, floor 4 “The miners dig in”, and “Both threads” (the cult's
// candles more on each floor down; the Sunken Eye's black water from floor 3 down). Held here, the floors in their looks as the
// game has them (game/floor_looks.ts), over a few seeds each:
//   1. on at his word; off, no story laid and no threads' pieces with the floors' own
//   2. on: nearly every room of the way is laid with its beat, the beats in the story's order from the way in to the boss's hall,
//      every beat there
//   3. every piece laid is one of the floor's own in its look (or the threads')
//   4. nothing laid cuts off any floor: every tile walked on and come to from the way in without the story is come to with it
//   5. the threads: the cult's candles on floor 3 and more of them than on floor 1; the black water on floors 3 and 4 and not above
//      (each pool on the floor before its own face); the threads' pieces in each look, the swamp's water its own colours, nothing
//      cyan
//   6. FLOOR 5 (its pieces' switch, LAIR_STORY, on at his word; off, none): the mine's beats in its rooms of the way, the temple's
//      in the room before his hall; the Eye in the temple's stone and in his hall's; the drag marks a run from the way into the
//      temple to beside one of his bone heaps; every piece one of the floor's own (its part's) or the story's; nothing cut off
//   run: tsx --test tests/prison_stories.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { Game } from '../src/game/game';
import { STORIES, STORY_SETS, BLACK_POOL, BLACK_WATER, CULT_CANDLES, EYE, wayRooms, beatsOf } from '../src/game/stories';
import { LAIR_STORY } from '../src/art/lair_story';
import { LAIR_PART } from '../src/art/lair_temple';
import { useFloorLooks } from '../src/game/floor_looks';
import { forgetPieces, lookPieces } from '../src/art/floors';
import { prisonStoryPieces } from '../src/art/prison_story';
import { PRISON } from '../src/art/prison';
import { CHAPEL } from '../src/art/chapel';
import { SWAMP } from '../src/art/lair_story';
import { pixelsOf } from '../src/art/lair_temple';
import { paintWithoutCanvas, seasoned } from './helpers';

paintWithoutCanvas();
useFloorLooks(true);
const SEEDS = [11, 33, 55, 7919];

function floor(depth: number, seed: number): Game {
  const g = seasoned(new Game('warrior', seed), 8);
  g.depth = depth;
  g.cleared = depth - 1;
  g.enterDungeon();
  return g;
}
function withStories<T>(on: boolean, f: () => T): T {
  const was = STORIES.on;
  STORIES.on = on;
  forgetPieces(0);
  try {
    return f();
  } finally {
    STORIES.on = was;
    forgetPieces(0);
  }
}

test('1. on at his word (12 Nov 2026); off, no story laid and no threads\' pieces with the floors\' own', () => {
  assert.equal(STORIES.on, true);
  assert.deepEqual(STORIES.floors, [1, 2, 3, 4]);
  withStories(false, () => {
    for (const depth of [1, 2, 3, 4]) {
      const g = floor(depth, 11);
      assert.equal(g.level.dress?.story, undefined, `floor ${depth}`);
    }
    for (const k of [3, 4]) for (const name of [CULT_CANDLES, BLACK_WATER, BLACK_POOL.x, BLACK_POOL.y]) assert.ok(!lookPieces(k).has(name), `floor ${k}: ${name}`);
  });
});

test('2. on: the way\'s rooms laid with their beats, in the story\'s order, every beat there', () => {
  withStories(true, () => {
    for (const depth of [1, 2, 3, 4]) {
      const beats = STORY_SETS[depth].map((b) => b.name);
      let rooms = 0;
      let laid = 0;
      for (const seed of SEEDS) {
        const g = floor(depth, seed);
        const way = wayRooms(g.level.floor.rooms);
        const story = g.level.dress!.story!;
        rooms += way.length;
        laid += story.length;
        // (in the way's order, the beats never go back)
        const order = way.map((r) => story.find((s) => s.room === r.id)).filter((s) => s).map((s) => beats.indexOf(s!.beat));
        for (let k = 1; k < order.length; k++) assert.ok(order[k] >= order[k - 1], `floor ${depth} seed ${seed}: beats ${order.join(' ')}`);
        assert.deepEqual([...new Set(beatsOf(STORY_SETS[depth], way.length))], beats.map((_, k) => k), `floor ${depth} seed ${seed}: every beat has a room`);
        assert.ok(new Set(order).size >= beats.length - 1, `floor ${depth} seed ${seed}: beats laid ${[...new Set(order)].join(' ')}`);
      }
      assert.ok(laid >= rooms * 0.9, `floor ${depth}: ${laid} of ${rooms} rooms of the way laid`);
    }
  });
});

test('3. every piece laid is one of the floor\'s own in its look, or the threads\'', () => {
  withStories(true, () => {
    for (const depth of [1, 2, 3, 4]) {
      const P = lookPieces(depth);
      for (const seed of SEEDS) {
        const L = floor(depth, seed).level;
        const yard = new Set((L.floor.yard?.pieces ?? []).map((p) => p.name));
        for (const w of L.dress!.wall) assert.ok(P.has(w.name), `floor ${depth}: ${w.name}`);
        for (const t of L.dress!.tiles) assert.ok(P.has(t.name) || t.name === 'the rails', `floor ${depth}: ${t.name}`);
        for (const p of L.props) if (p.kind === 'piece' && p.name && !yard.has(p.name) && p.name !== 'yard foot') assert.ok(P.has(p.name), `floor ${depth}: ${p.name}`);
      }
    }
  });
});

/** The floor's walk, and which of its tiles are come to from where he comes in (four ways). */
function reachOf(g: Game): { walk: Uint8Array; seen: Uint8Array } {
  const L = g.level;
  const f = L.floor;
  const seen = new Uint8Array(f.w * f.h);
  const q = [Math.floor(f.start.y) * f.w + Math.floor(f.start.x)];
  seen[q[0]] = 1;
  for (let k = 0; k < q.length; k++) {
    const i = q[k];
    const x = i % f.w;
    for (const j of [i - 1, i + 1, i - f.w, i + f.w]) {
      if (j < 0 || j >= seen.length || seen[j] || L.walk[j] !== 1 || Math.abs((j % f.w) - x) > 1) continue;
      seen[j] = 1;
      q.push(j);
    }
  }
  return { walk: L.walk.slice(), seen };
}

test('4. nothing laid cuts off any floor', () => {
  for (const depth of [1, 2, 3, 4]) {
    for (const seed of SEEDS) {
      // (every tile come to without the story, and walked on with it, is come to with it)
      const before = withStories(false, () => reachOf(floor(depth, seed)));
      const now = withStories(true, () => reachOf(floor(depth, seed)));
      const lost: number[] = [];
      for (let i = 0; i < now.seen.length; i++) if (before.seen[i] && now.walk[i] === 1 && !now.seen[i]) lost.push(i);
      assert.deepEqual(lost, [], `floor ${depth} seed ${seed}: cut off by the story`);
    }
  }
});

test('5. the threads: the cult\'s candles grow to floor 3, the black water from floor 3 down; their pieces in each look', () => {
  withStories(true, () => {
    const count = (depth: number, name: string): number => {
      let n = 0;
      for (const seed of SEEDS) {
        const L = floor(depth, seed).level;
        n += L.props.filter((p) => p.name === name).length + L.dress!.wall.filter((w) => w.name === name).length;
      }
      return n;
    };
    assert.ok(count(3, CULT_CANDLES) > count(1, 'candles'), 'more of the cult\'s candles on floor 3 than on floor 1');
    for (const depth of [1, 2]) assert.equal(count(depth, BLACK_WATER) + count(depth, CULT_CANDLES), 0, `floor ${depth}: none of the threads' new pieces`);
    for (const depth of [3, 4]) {
      for (const seed of SEEDS) {
        const L = floor(depth, seed).level;
        const W = L.floor.w;
        const faces = L.dress!.wall.filter((w) => w.name === BLACK_WATER);
        assert.ok(faces.length >= 1, `floor ${depth} seed ${seed}: black water`);
        for (const w of faces) {
          // (the pool on the floor tile before its face: below the wall along x, beside the wall along y)
          const at = w.side === 0 ? w.i + W : w.i + 1;
          const pool = L.dress!.tiles.find((t) => t.i === at);
          assert.equal(pool?.name, w.side === 0 ? BLACK_POOL.x : BLACK_POOL.y, `floor ${depth} seed ${seed}: the pool before the water at ${w.i}`);
        }
      }
    }
  });
  // (each look: the floors' first looks, and the prison's and the chapel's as the game has them)
  const swamp = new Set<string>(SWAMP);
  for (const looks of [false, true]) {
    PRISON.on = looks;
    CHAPEL.on = looks;
    for (const k of [3, 4]) {
      const list = prisonStoryPieces(k);
      assert.deepEqual(list.map((p) => p.name).sort(), [BLACK_WATER, BLACK_POOL.x, BLACK_POOL.y, ...(k === 3 ? [CULT_CANDLES] : [])].sort());
      for (const p of list) {
        const sprites = [...(p.frames ?? []), ...(p.left ?? []), ...(p.right ?? []), ...(p.spots ?? []).flatMap((s) => [...s.left, ...s.right])];
        assert.ok(sprites.length > 0, `${p.name}: pictures`);
        let wet = 0;
        for (const s of sprites) {
          const px = pixelsOf(s);
          for (let i = 0; i < px.d.length; i += 4) {
            if (px.d[i + 3] === 0) continue;
            const [r, g, b] = [px.d[i], px.d[i + 1], px.d[i + 2]];
            // (nothing cyan: the friend's colour)
            assert.ok(!(b > r + 40 && g > r + 40), `floor ${k} ${p.name}: cyan #${((r << 16) | (g << 8) | b).toString(16)}`);
            if (swamp.has(`#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`)) wet++;
          }
        }
        if (p.name !== CULT_CANDLES) assert.ok(wet > 20, `floor ${k} ${p.name}: the swamp's own black water (${wet} pixels)`);
        if (p.kind === 'floor tile') for (const s of p.frames!) assert.deepEqual([pixelsOf(s).w, pixelsOf(s).h], [64, 32], `${p.name}: a tile's picture`);
      }
    }
  }
  useFloorLooks(true);
});

test('6. floor 5: the mine\'s beats, the temple\'s, the Eye, the drag marks to his dead; its own pieces; nothing cut off', () => {
  assert.equal(LAIR_STORY.on, true, 'on at his word');
  LAIR_STORY.on = false;
  assert.equal(floor(5, 11).level.dress?.story, undefined, 'off: no story on floor 5');
  const before = new Map(SEEDS.map((seed) => [seed, reachOf(floor(5, seed))]));
  LAIR_STORY.on = true;
  forgetPieces(0);
  try {
    const P = lookPieces(5);
    const beats = STORY_SETS[5];
    let laid = 0;
    let rooms = 0;
    for (const seed of SEEDS) {
      const g = floor(5, seed);
      const L = g.level;
      const f = L.floor;
      const W = f.w;
      const part = L.lair!.part;
      const story = L.dress!.story!;
      const way = wayRooms(f.rooms);
      laid += story.length;
      rooms += way.length;
      for (const s of story) {
        const r = f.rooms.find((q) => q.id === s.room)!;
        const temple = part[(r.y + (r.h >> 1)) * W + r.x + (r.w >> 1)] === 2;
        assert.equal(beats.find((b) => b.name === s.beat)!.part, temple ? 'temple' : 'mine', `seed ${seed}: ${s.beat} in the ${temple ? 'temple' : 'mine'}`);
      }
      // (the Eye: in the temple's room and in his hall)
      const hall = f.rooms.find((r) => r.kind === 'boss')!;
      const eyes = L.dress!.wall.filter((w) => w.name === EYE).map((w) => (w.side === 0 ? w.i + W : w.i + 1));
      assert.ok(eyes.some((i) => (i % W) >= hall.x && (i % W) < hall.x + hall.w && Math.floor(i / W) >= hall.y && Math.floor(i / W) < hall.y + hall.h), `seed ${seed}: the Eye in his hall`);
      // (the drag marks: a run whose last tile is beside one of his bone heaps, each tile beside the one before it)
      const drag = L.dress!.tiles.filter((t) => t.name.startsWith('drag marks')).map((t) => t.i);
      const heaps = (f.heaps ?? []).map((h) => Math.floor(h.y) * W + Math.floor(h.x));
      assert.ok(drag.some((i) => heaps.some((h) => Math.abs((h % W) - (i % W)) + Math.abs(Math.floor(h / W) - Math.floor(i / W)) === 1)), `seed ${seed}: the drag marks end by his dead`);
      // (every piece one of the floor's own, in its own part, or the story's)
      for (const w of L.dress!.wall) assert.ok(P.has(w.name), `seed ${seed}: ${w.name}`);
      for (const t of L.dress!.tiles) assert.ok(P.has(t.name) || /^(rails|a crack of the rift)/.test(t.name), `seed ${seed}: ${t.name}`);
      for (const p of L.props) {
        if (p.kind !== 'piece' || !p.name) continue;
        assert.ok(P.has(p.name), `seed ${seed}: ${p.name}`);
        const own = LAIR_PART[p.name];
        if (own) assert.equal(part[p.ty * W + p.tx] === 2 ? 'temple' : 'mine', own, `seed ${seed}: ${p.name} in its part`);
      }
      // (nothing cut off)
      const was = before.get(seed)!;
      const now = reachOf(g);
      const lost: number[] = [];
      for (let i = 0; i < now.seen.length; i++) if (was.seen[i] && now.walk[i] === 1 && !now.seen[i]) lost.push(i);
      assert.deepEqual(lost, [], `seed ${seed}: cut off by the story`);
    }
    assert.ok(laid >= rooms * 0.8, `${laid} of ${rooms} rooms of the way laid`);
  } finally {
    LAIR_STORY.on = true;
    forgetPieces(0);
  }
});

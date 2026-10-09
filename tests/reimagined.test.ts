// The heroes reimagined (src/art/reimagined.ts; the art chat, 9 Oct 2026): new outfits over the same
// bones and moves, as pictures for the owner, behind switches that are OFF until he has seen them
// and said yes. What is held here: the switches are off, and with them off every hero is today's,
// frame for frame, byte for byte; and each new outfit (the ranger's Wind-runner,
// src/art/hero3_ranger2.ts; the knight's Boar Knight, src/art/hero3_knight2.ts; the mage's
// Storm-witch, src/art/hero3_mage2.ts), switched on, is painted in every one of the hero's moves,
// cleanly, and the others are as they were.
//   run: tsx --test tests/reimagined.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import { readFileSync } from 'node:fs';

import { onBack } from '../src/art/carried';
import { HERO_TAILS } from '../src/art/heroes';
import { paintMove3, streakShown, windAt } from '../src/art/heroes3';
import { paintKnight3 } from '../src/art/hero3_knight';
import { paintMage3 } from '../src/art/hero3_mage';
import { paintRanger3 } from '../src/art/hero3_ranger';
import { PINK, lightsOut } from '../src/art/kit';
import type { Painted } from '../src/art/kit';
import { FLAME } from '../src/art/mkit';
import { GREAT_BLADE, MOVES3, STAFF_UP, runWaysOf, settlesOf, startsOf, walkingOf } from '../src/art/moves3';
import type { Move3 } from '../src/art/moves3';
import { KNIGHT2_TAILS, MAGE2_TAILS, RANGER2_TAILS, REIMAGINED } from '../src/art/reimagined';
import { CANVAS3 } from '../src/art/skin';
import type { GameView } from '../src/art/skin';
import { add, bonesAt, mul, solve } from '../src/art/skeleton';
import type { Posed, V3 } from '../src/art/skeleton';
import { TAIL_PATCH, Tails } from '../src/engine/tails';
import type { TailDef } from '../src/engine/tails';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

type Who = 'ranger' | 'knight' | 'mage';
const VIEWS: GameView[] = ['front', 'back'];
const endOf = (m: Move3): number => m.motion.keys[m.motion.keys.length - 1].at;
const FRAME = 1 / 30;

/** Every move of a hero's: their own (by what they hold), and those made from them (coming to a stand, setting off, running the other ways, attacking and being rocked as they walk: the ranger's, so far). */
function movesOf(held: string, run: Move3, stand: Move3, extra: [string, Move3][] = []): [string, Move3][] {
  const start = startsOf(run, stand);
  return [
    ...Object.entries(MOVES3).filter(([, m]) => m.held === held),
    ...settlesOf(run, stand).map((m, k): [string, Move3] => [`coming to a stand ${k}`, m]),
    ...(start ? [['setting off', start.move] as [string, Move3]] : []),
    ...runWaysOf(run).map((m, k): [string, Move3] => [`running the other way ${k}`, m]),
    ...extra,
  ];
}
const HEROES: Record<Who, { name: string; moves: [string, Move3][]; tails: string; stand: Move3 }> = {
  ranger: {
    name: 'the ranger',
    stand: MOVES3.rstand,
    tails: 'r2-feather,r2-liripipe',
    moves: movesOf('bow', MOVES3.rrun, MOVES3.rstand, [
      ...settlesOf(MOVES3.rtownrun, MOVES3.rtown).map((m, k): [string, Move3] => [`coming to a stand in town ${k}`, m]),
      ...walkingOf(MOVES3.shot, MOVES3.rrun).map((m, k): [string, Move3] => [`shot, walking ${k}`, m]),
      ...walkingOf(MOVES3.volley, MOVES3.rrun).map((m, k): [string, Move3] => [`volley, walking ${k}`, m]),
      ...walkingOf(MOVES3.rreel, MOVES3.rrun, false).map((m, k): [string, Move3] => [`rocked, walking ${k}`, m]),
      ...walkingOf(MOVES3.rlurch, MOVES3.rrun, false).map((m, k): [string, Move3] => [`thrown forward, walking ${k}`, m]),
    ]),
  },
  knight: { name: 'the knight', stand: MOVES3.rear, tails: 'w2-strip-a,w2-strip-b,w2-strip-c', moves: movesOf('greatsword', MOVES3.krun, MOVES3.rear) },
  mage: {
    name: 'the mage',
    stand: MOVES3.mstand,
    tails: 'm2-braid-a,m2-braid-b,m2-coat-a,m2-coat-b',
    moves: movesOf('staff', MOVES3.mrun, MOVES3.mstand, [
      ...walkingOf(MOVES3.wave, MOVES3.mrun).map((m, k): [string, Move3] => [`wave, walking ${k}`, m]),
      ...walkingOf(MOVES3.orb, MOVES3.mrun).map((m, k): [string, Move3] => [`orb, walking ${k}`, m]),
      ...walkingOf(MOVES3.mreel, MOVES3.mrun, false).map((m, k): [string, Move3] => [`rocked, walking ${k}`, m]),
      ...walkingOf(MOVES3.mlurch, MOVES3.mrun, false).map((m, k): [string, Move3] => [`thrown forward, walking ${k}`, m]),
    ]),
  },
};
const WHO: Who[] = ['ranger', 'knight', 'mage'];

/** Moments of a move, `every` seconds apart, and its end. */
function moments(m: Move3, every: number): number[] {
  const out: number[] = [];
  for (let t = 0; t < endOf(m) - 1e-9; t += every) out.push(t);
  out.push(endOf(m));
  return out;
}

/** With one hero's switch on for a while, and off again after, whatever happens. */
function wearing(who: Who, fn: () => void): void {
  REIMAGINED[who] = true;
  try {
    fn();
  } finally {
    REIMAGINED[who] = false;
  }
}

/**
 * A frame of one of a hero's moves as TODAY'S painter (src/art/hero3_ranger.ts, hero3_knight.ts,
 * hero3_mage.ts) paints it, called here directly with what art/heroes3.ts's paintMove3 hands a
 * painter: the bones at that moment (in a move that goes round, folded into its loop), the bones a
 * thirtieth of a second before, where the wind has got to, (the knight and the mage) where his
 * blade or her crystal has just been, and the light going out of a hero who has fallen.
 */
function today(who: Who, move: Move3, t: number, view: GameView): Painted {
  const end = endOf(move);
  const from = move.motion.loop;
  const long = from !== undefined ? end - from : 0;
  const fold = (when: number): number => (from !== undefined && long > 1e-6 && when >= end ? from + ((when - from) % long) : when);
  const now = fold(Math.max(0, t));
  const posed = (back: number): Posed => {
    let when = now - back;
    if (from !== undefined && long > 1e-6 && now >= from && when < from) when += long;
    return bonesAt(move.motion.keys, move.rest, Math.max(0, when));
  };
  const build = move.build;
  const q = posed(0);
  const s = solve(build, q);
  const prev = solve(build, posed(FRAME));
  const wind = windAt(move, now);
  let f: Painted;
  if (who === 'ranger') f = paintRanger3(s, q, view, { build }, { prev, wind });
  else if (who === 'mage') {
    const trail: [V3, V3][] = [];
    for (let i = 0; i <= 8; i++) {
      const sk = i === 0 ? s : solve(build, posed((FRAME * i) / 8));
      trail.push([add(sk.handR, mul(sk.point, STAFF_UP * 0.5)), add(sk.handR, mul(sk.point, STAFF_UP))]);
    }
    f = paintMage3(s, q, view, { build }, { prev, trail, wind });
  } else {
    const trail: [V3, V3][] = [];
    for (let i = 0; i <= 8; i++) {
      const then = i === 0 ? q : posed((FRAME * i) / 8);
      const sk = i === 0 ? s : solve(build, then);
      const away = then.stow > 0.5 ? onBack(build, sk, 'sword') : null;
      const hand = away ? away.grip : sk.handR;
      const point = away ? away.point : sk.point;
      trail.push([add(hand, mul(point, 1.3)), add(hand, mul(point, 1.3 + GREAT_BLADE))]);
    }
    f = paintKnight3(s, q, view, { build, twoHanded: true }, { prev, trail: streakShown(move, now) ? trail : [], wind });
  }
  return q.out > 0.01 ? lightsOut(f, q.out) : f;
}

/** How many pixels two paintings differ in. */
function unlike(a: Painted, b: Painted): number {
  let n = 0;
  for (let i = 0; i < a.px.d.length; i += 4) {
    if (a.px.d[i] !== b.px.d[i] || a.px.d[i + 1] !== b.px.d[i + 1] || a.px.d[i + 2] !== b.px.d[i + 2] || a.px.d[i + 3] !== b.px.d[i + 3]) n++;
  }
  return n;
}
const same = (a: Painted, b: Painted): boolean => a.px.w === b.px.w && a.px.h === b.px.h && unlike(a, b) === 0 && JSON.stringify(a.tails ?? []) === JSON.stringify(b.tails ?? []) && JSON.stringify(a.lights) === JSON.stringify(b.lights);

test('every switch is off: no hero wears a reimagined outfit in the game', () => {
  assert.equal(REIMAGINED.ranger, false);
  assert.equal(REIMAGINED.knight, false);
  assert.equal(REIMAGINED.mage, false);
});

for (const who of WHO) {
  const H = HEROES[who];

  test(`with the switches off, every frame of ${H.name} is today's painter's own, byte for byte`, () => {
    let frames = 0;
    for (const [name, m] of H.moves) {
      for (const t of moments(m, 0.1)) {
        for (const view of VIEWS) {
          const game = paintMove3(m, t, view);
          const was = today(who, m, t, view);
          assert.ok(same(game, was), `${name}, ${t.toFixed(2)} s, ${view}: ${unlike(game, was)} pixels are not today's`);
          frames++;
        }
      }
    }
    assert.ok(frames > 200, `every move was looked at (${frames} frames)`);
  });

  test(`with ${H.name}'s switch on, ${H.name} wears the new outfit, with what flies from it; the others are as they were`, () => {
    const others = WHO.filter((w) => w !== who).map((w) => [w, paintMove3(HEROES[w].stand, 0, 'front')] as const);
    wearing(who, () => {
      for (const [name, m] of H.moves) {
        if (!(name in MOVES3)) continue;
        for (const view of VIEWS) {
          const now = paintMove3(m, 0, view);
          const n = unlike(now, today(who, m, 0, view));
          assert.ok(n > 300, `${name}, ${view}: only ${n} pixels differ from today's`);
          assert.equal((now.tails ?? []).map((r) => r.id).sort().join(','), H.tails, `${name}, ${view}: what flies from the new outfit`);
        }
      }
      for (const [w, was] of others) assert.ok(same(paintMove3(HEROES[w].stand, 0, 'front'), was), `${HEROES[w].name} changed`);
    });
    // (and off again: today's)
    assert.ok(same(paintMove3(H.stand, 0, 'front'), today(who, H.stand, 0, 'front')));
  });

  test(`switched on, every move of ${H.name} is painted cleanly: the whole figure, what flies from it tied on it, and nothing of the enemy's pink or gold`, () => {
    const enemy = new Set([...FLAME, ...PINK].map((c) => parseInt(c.slice(1), 16)));
    const gold = new Set(FLAME.filter((c) => !PINK.includes(c)).map((c) => parseInt(c.slice(1), 16)));
    const pinkOf = (d: Uint8ClampedArray): number => {
      let n = 0;
      for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 0 && enemy.has((d[i] << 16) | (d[i + 1] << 8) | d[i + 2])) n++;
      return n;
    };
    let frames = 0;
    wearing(who, () => {
      for (const [name, m] of H.moves) {
        for (const t of moments(m, 1 / 15)) {
          for (const view of VIEWS) {
            const where = `${name}, ${t.toFixed(3)} s, ${view}`;
            const f = paintMove3(m, t, view);
            const d = f.px.d;
            let painted = 0;
            let pink = 0;
            for (let i = 0; i < d.length; i += 4) {
              if (d[i + 3] === 0) continue;
              painted++;
              if (enemy.has((d[i] << 16) | (d[i + 1] << 8) | d[i + 2])) pink++;
            }
            // (the whole of the figure: the Wind-runner has no long cloak, so a little less of him than today, never much less; measured, 0.73 at the least, in the tightest moment of the roll)
            const was = today(who, m, t, view).px.d;
            let then = 0;
            for (let i = 3; i < was.length; i += 4) if (was[i] > 0) then++;
            assert.ok(painted > 0.65 * then, `${where}: only ${painted} pixels of the figure, where today has ${then}`);
            // (the mage's hair is pink, as today's is, and nothing else on her: no gold, and no more pink
            // than her hair, a little more of which is seen than today, with no cape over her shoulders;
            // measured, 1.6 times today's at the most, 20 pixels)
            if (who === 'mage') {
              assert.ok(pink <= pinkOf(was) * 1.8 + 8, `${where}: ${pink} pixels of the enemy's colours, where today has ${pinkOf(was)}`);
              for (let i = 0; i < d.length; i += 4) {
                const v = (d[i] << 16) | (d[i + 1] << 8) | d[i + 2];
                assert.ok(d[i + 3] === 0 || !gold.has(v), `${where}: a pixel of the enemy's gold`);
              }
            } else assert.equal(pink, 0, `${where}: ${pink} pixels of the enemy's colours`);
            for (const l of f.lights) assert.ok(!enemy.has(parseInt(l.color.slice(1, 7), 16)), `${where}: a light of the enemy's colour, ${l.color}`);
            const roots = f.tails ?? [];
            assert.equal(roots.map((r) => r.id).sort().join(','), H.tails, `${where}: what flies from the new outfit`);
            for (const r of roots) assert.ok(r.x >= 0 && r.y >= 0 && r.x <= CANVAS3.w && r.y <= CANVAS3.h && Number.isFinite(r.x + r.y), `${where}: ${r.id} is tied at ${r.x}, ${r.y}`);
            frames++;
          }
        }
      }
    });
    assert.ok(frames > 400, `every move was looked at (${frames} frames)`);
  });
}

test('the Boar Knight keeps the pig helmet: the lines that paint his head are today\'s, exactly', () => {
  // (the owner: "I just want to keep the pig helmet for sure on the warrior")
  const head = (file: string): string => {
    const text = readFileSync(new URL(`../src/art/${file}`, import.meta.url), 'utf8') as string;
    const a = text.indexOf('  if (kit.head) kit.head({ st, s, q, B });');
    const b = text.indexOf('  // --- the great sword');
    assert.ok(a > 0 && b > a, `${file}: the head is where it was`);
    return text.slice(a, b);
  };
  assert.equal(head('hero3_knight2.ts'), head('hero3_knight.ts'), 'the Boar Knight\'s head is not today\'s');
});

test('what flies from the new outfits is what the game knows how to move and draw: the hood\'s tail is cloth, the feather a glowing quill, the cloak\'s strips cloth, the braids hair and the coat\'s points cloth', () => {
  for (const id of ['r2-liripipe', 'r2-feather']) assert.ok(HERO_TAILS[id] === RANGER2_TAILS[id], `${id} is one of the game's tails`);
  for (const id of ['w2-strip-a', 'w2-strip-b', 'w2-strip-c']) {
    assert.ok(HERO_TAILS[id] === KNIGHT2_TAILS[id], `${id} is one of the game's tails`);
    assert.ok(KNIGHT2_TAILS[id].rest === undefined && (KNIGHT2_TAILS[id].stiff ?? 0) === 0 && KNIGHT2_TAILS[id].glow === undefined, `${id} is cloth, and does not glow`);
  }
  for (const id of ['m2-braid-a', 'm2-braid-b', 'm2-coat-a', 'm2-coat-b']) {
    assert.ok(HERO_TAILS[id] === MAGE2_TAILS[id], `${id} is one of the game's tails`);
    assert.ok(MAGE2_TAILS[id].glow === undefined, `${id} does not glow`);
  }
  for (const id of ['m2-coat-a', 'm2-coat-b']) {
    const d = MAGE2_TAILS[id];
    assert.ok(d.rest === undefined && (d.stiff ?? 0) === 0 && d.inside !== undefined, `${id} is cloth, with a lining`);
  }
  // (her braids are longer than the battle mage's, which are four links of 1.05)
  for (const id of ['m2-braid-a', 'm2-braid-b']) assert.ok(MAGE2_TAILS[id].n * MAGE2_TAILS[id].seg > 4 * 1.05 * 1.5, `${id} is longer than today's`);
  const tail = RANGER2_TAILS['r2-liripipe'];
  assert.ok(tail.rest === undefined && (tail.stiff ?? 0) === 0 && tail.glow === undefined, 'the tail of the hood is cloth, and does not glow');
  // (about half his height long: he is 57 picture pixels tall, two to a game pixel)
  const long = tail.n * tail.seg * 2;
  assert.ok(long > 0.45 * MOVES3.rstand.build.tall && long < 0.65 * MOVES3.rstand.build.tall, `the tail of the hood is ${long.toFixed(1)} picture pixels long`);
  const feather = RANGER2_TAILS['r2-feather'];
  assert.ok((feather.stiff ?? 0) > 0 && feather.rest?.length === feather.n && feather.glow !== undefined, 'the feather is a quill, with a shape, and glows');
});

test('the tails of the game move as they did: what the new outfits ask of the engine (an S-wave, a ripple across) is their own, and every other tail is moved as before', () => {
  // (a tail that does not say how far round its ripple goes is moved as one that says 5.6, the engine's own, and down the screen)
  const ids = Object.keys(HERO_TAILS).filter((id) => !id.startsWith('r2-') && !id.startsWith('w2-') && !id.startsWith('m2-'));
  for (const id of ids) assert.ok(HERO_TAILS[id].wave === undefined && HERO_TAILS[id].across === undefined, `${id} asks for nothing new`);
  const plain: Record<string, TailDef> = {};
  const said: Record<string, TailDef> = {};
  for (const id of ids) {
    plain[id] = HERO_TAILS[id];
    said[id] = { ...HERO_TAILS[id], wave: 5.6, across: false };
  }
  const a = new Tails(plain);
  const b = new Tails(said);
  for (let k = 0; k < 600; k++) {
    const roots = ids.map((id, i) => ({ id, x: 40 + i + Math.sin(k * 0.05) * 6, y: 20 + Math.cos(k * 0.07) * 3, over: i % 2 === 0, blast: k % 300 < 40 ? 1.5 : 0 }));
    a.step(1 / 60, roots, 40, 60, k % 400 < 200 ? 1 : -1, Math.sin(k * 0.01) * 80, Math.cos(k * 0.013) * 40);
    b.step(1 / 60, roots, 40, 60, k % 400 < 200 ? 1 : -1, Math.sin(k * 0.01) * 80, Math.cos(k * 0.013) * 40);
  }
  assert.equal(JSON.stringify(a.shapes()), JSON.stringify(b.shapes()), 'the same tails, moved the same way');
  // (and the hood's tail, hanging in still air, snakes: its middle swings from side to side of the line from its root to its tip)
  const t = new Tails({ 'r2-liripipe': RANGER2_TAILS['r2-liripipe'] });
  let most = 0;
  for (let k = 0; k < 400; k++) {
    t.step(1 / 60, [{ id: 'r2-liripipe', x: 40, y: 20, over: false }], 40, 60, 1, 0, 0);
    const p = t.shapes()[0].points;
    const n = p.length / 2 - 1;
    const [x0, y0, x1, y1] = [p[0], p[1], p[n * 2], p[n * 2 + 1]];
    const m = Math.floor(n / 2);
    const across = Math.abs((x1 - x0) * (p[m * 2 + 1] - y0) - (y1 - y0) * (p[m * 2] - x0)) / (Math.hypot(x1 - x0, y1 - y0) || 1);
    if (k > 120) most = Math.max(most, across);
  }
  assert.ok(most > 0.8, `the hood's tail does not snake (${most.toFixed(2)} game pixels off its line at the most)`);
});

test('a tail with a lining shows it when the frame says so (the Storm-witch\'s coat seen from in front), and its outside otherwise', () => {
  const d = MAGE2_TAILS['m2-coat-a'];
  const inside = d.inside as NonNullable<TailDef['inside']>;
  const colours = (on: boolean): Set<string> => {
    const t = new Tails({ 'm2-coat-a': d });
    for (let k = 0; k < 60; k++) t.step(1 / 60, [{ id: 'm2-coat-a', x: 40, y: 20, over: false, inside: on }], 40, 60, 1, 0, 0);
    const out = new Uint8ClampedArray(TAIL_PATCH.w * TAIL_PATCH.h * 4);
    t.paint(out, false);
    const seen = new Set<string>();
    for (let i = 0; i < out.length; i += 4) if (out[i + 3] > 0) seen.add('#' + [out[i], out[i + 1], out[i + 2]].map((v) => v.toString(16).padStart(2, '0')).join(''));
    return seen;
  };
  const a = colours(true);
  const b = colours(false);
  assert.ok(a.has(inside.mid) && !a.has(d.mid), 'seen from in front: its lining');
  assert.ok(b.has(d.mid) && !b.has(inside.mid), 'seen from behind: its outside');
});

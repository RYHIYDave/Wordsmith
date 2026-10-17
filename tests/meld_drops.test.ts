// Tests for RUNEDUST AND THE MELDSTONE DRAWN (art/meld_drops.ts; where they play, render/meld_drops.ts; the
// rules' side, game/melds.ts STONE_RISE): a mock-up behind a switch that is off, MELD_DROPS. His words to
// the main chat, 16 Oct 2026, 17:40: "Runedust and the meldstone need to be done".
//   run: tsx --test tests/meld_drops.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
import { FLAME } from '../src/art/mkit';
import { CYAN } from '../src/art/kit';
import { HEAPS, MELD_DROPS, SPILL_FRAMES, STONE_FRAMES, STONE_SPIN, WHIRL_FRAMES, heapOf, makeMeldDropsArt, meldstoneSprite, spinStep, standingLook } from '../src/art/meld_drops';
import type { MeldDropsArt } from '../src/art/meld_drops';
import type { Sprite } from '../src/engine/px';
import { HAND_IN } from '../src/game/defs';
import { Game } from '../src/game/game';
import { MELD, MELD_TUNE, STONE_RISE } from '../src/game/melds';
import { emptyControls } from '../src/game/state';
import type { Monster } from '../src/game/state';
import { BOB, GIVEN, HOVER, KEPT_Z, MeldDrops, ORBIT, RISE, TAKEN, givenOf, orbitAt, riseOf, takenOf } from '../src/render/meld_drops';
import { paintWithoutCanvas, paintingOf, seasoned } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

paintWithoutCanvas();
const DT = 1 / 30;

/** Every picture of theirs. */
function everyPicture(a: MeldDropsArt): { name: string; s: Sprite }[] {
  const out: { name: string; s: Sprite }[] = [];
  a.heap.forEach((h, k) => h.forEach((s, f) => out.push({ name: `heap ${k} frame ${f}`, s })));
  a.spill.forEach((h, k) => {
    for (let f = 0; f < SPILL_FRAMES; f++) out.push({ name: `spill ${k} frame ${f}`, s: h[f] });
  });
  for (let f = 0; f < WHIRL_FRAMES; f++) {
    out.push({ name: `whirl behind ${f}`, s: a.whirl[f].back });
    out.push({ name: `whirl in front ${f}`, s: a.whirl[f].front });
  }
  for (let f = 0; f < STONE_FRAMES; f++) out.push({ name: `stone ${f}`, s: a.stone[f] });
  for (let f = 0; f < STONE_SPIN; f++) {
    out.push({ name: `spin apart ${f}`, s: a.spinApart[f] });
    out.push({ name: `spin whole ${f}`, s: a.spinWhole[f] });
    out.push({ name: `ash half ${f}`, s: a.halves[0][f] });
    out.push({ name: `slate half ${f}`, s: a.halves[1][f] });
  }
  a.crack.forEach((s, f) => out.push({ name: `crack ${f}`, s }));
  out.push({ name: 'icon', s: a.icon }, { name: 'carried', s: a.carried }, { name: 'burst', s: a.burst });
  return out;
}

const art = makeMeldDropsArt();
const all = everyPicture(art);

const hex = (r: number, g: number, b: number): string => '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');

test('the switch is on (his yes, 16 Oct, 22:17): the new runedust and Meldstone are drawn, and the rules hold them under the floor', () => {
  assert.equal(MELD_DROPS.on, true);
  assert.equal(STONE_RISE.on, true);
});

test('every picture is crisp, nothing of it cut off at its edge, and the light it gives is the friend\'s cyan', () => {
  for (const { name, s } of all) {
    const p = paintingOf(s);
    assert.equal(s.density, 2, `${name}: at the fine grain`);
    for (let i = 3; i < p.d.length; i += 4) assert.ok(p.d[i] === 0 || p.d[i] === 255, `${name}: no half-seen pixel`);
    if (name === 'icon') continue;
    for (let x = 0; x < p.w; x++) assert.ok(!p.has(x, 0) && !p.has(x, p.h - 1), `${name}: nothing cut off at the top or the bottom`);
    for (let y = 0; y < p.h; y++) assert.ok(!p.has(0, y) && !p.has(p.w - 1, y), `${name}: nothing cut off at the sides`);
    for (const l of s.lights ?? []) assert.equal(l.color, CYAN[2], `${name}: its light is the friend's`);
  }
});

test('nothing of them is the enemy\'s colours: no pink, no gold', () => {
  const enemy = new Set([...FLAME, '#ff4f8a', '#ff3a78'].map((c) => c.toLowerCase()));
  for (const { name, s } of all) {
    const p = paintingOf(s);
    for (let i = 0; i < p.d.length; i += 4) {
      if (p.d[i + 3] === 0) continue;
      const [r, g, b] = [p.d[i], p.d[i + 1], p.d[i + 2]];
      assert.ok(!enemy.has(hex(r, g, b)), `${name}: an enemy's colour`);
      // (warm: red well over blue: none of it)
      assert.ok(!(r > 150 && r > b + 60), `${name}: nothing warm (${hex(r, g, b)})`);
    }
  }
});

test('runedust: the more of it, the bigger the heap; its fountain ends in its heap', () => {
  assert.deepEqual([1, 2, 3, 4, 5, 6, 12].map(heapOf), [0, 0, 1, 1, 2, 2, 2]);
  const area = (s: Sprite): number => {
    const p = paintingOf(s);
    let n = 0;
    for (let i = 3; i < p.d.length; i += 4) if (p.d[i]) n++;
    return n;
  };
  const sizes = [0, 1, 2].map((k) => area(art.heap[k][0]));
  assert.ok(sizes[0] < sizes[1] && sizes[1] < sizes[2], `heaps grow: ${sizes.join(' < ')}`);
  for (let k = 0; k < 3; k++) {
    // the last of its fountain: its heap there whole, a little of the puff still rolling out
    const last = area(art.spill[k][SPILL_FRAMES - 1]);
    assert.ok(last >= sizes[k] * 0.85, `heap ${k}: the fountain ends with its heap (${last} against ${sizes[k]})`);
    assert.ok(HEAPS[k].r > 0 && HEAPS[k].h > 0);
  }
  // it glitters: no two frames of its round the same
  for (let k = 0; k < 3; k++) {
    const a = paintingOf(art.heap[k][0]);
    const b = paintingOf(art.heap[k][8]);
    let differ = 0;
    for (let i = 0; i < a.d.length; i++) if (a.d[i] !== b.d[i]) differ++;
    assert.ok(differ > 0, `heap ${k} is alive`);
  }
});

test('the Meldstone: its halves strain apart and snap back every round; alone, each half is less than the whole', () => {
  const seps = Array.from({ length: STONE_FRAMES }, (_, f) => standingLook(f).sep);
  assert.ok(Math.max(...seps) > 2 && Math.min(...seps) === 0, 'apart, and fused');
  assert.ok(seps[0] === 0 && seps[STONE_FRAMES - 1] === 0, 'fused as its round begins and ends (no jump)');
  const area = (s: Sprite): number => {
    const p = paintingOf(s);
    let n = 0;
    for (let i = 3; i < p.d.length; i += 4) if (p.d[i]) n++;
    return n;
  };
  const whole = area(meldstoneSprite({ yaw: 0, sep: 0, burn: 0.5, bolts: 0, motes: 0, ring: 0, frame: 0 }));
  const ash = area(meldstoneSprite({ yaw: 0, sep: 0, burn: 0.5, bolts: 0, motes: 0, ring: 0, frame: 0, only: -1 }));
  const slate = area(meldstoneSprite({ yaw: 0, sep: 0, burn: 0.5, bolts: 0, motes: 0, ring: 0, frame: 0, only: 1 }));
  assert.ok(ash < whole && slate < whole && ash + slate >= whole * 0.9, `${ash} + ${slate} make ${whole}`);
  assert.deepEqual([0, 22.5, 359, -22.5, 720].map(spinStep), [0, 1, 0, 15, 0]);
});

test('as it drops: under the floor, then a crack of light, up spinning and torn apart, slammed together, down to hang', () => {
  const t = 0;
  assert.equal(riseOf(-1, t).z, null, 'under the floor');
  assert.equal(riseOf(-1, t).crack, null, 'nothing yet');
  assert.ok(riseOf(-0.2, t).crack, 'its light cracks the floor');
  const up = riseOf(RISE.top * 0.5, t);
  assert.equal(up.shown, 'apart');
  assert.ok((up.z ?? 0) > 10, 'shot up');
  assert.ok(!riseOf(RISE.slam - 0.01, t).slammed && riseOf(RISE.slam + 0.01, t).slammed, 'slammed together at its moment');
  assert.ok(riseOf(RISE.slam + 0.05, t).burst, 'in a burst of light');
  const hang = riseOf(RISE.down + 1, 0.5);
  assert.equal(hang.shown, 'hang');
  assert.ok(Math.abs((hang.z ?? 0) - HOVER) <= BOB + 1e-9, 'hanging over the floor');
  // smooth: no jump in its height from one thirtieth of a second to the next
  for (let a = 0; a < RISE.down + 0.5; a += 1 / 60) {
    const z0 = riseOf(a, a).z ?? 0;
    const z1 = riseOf(a + 1 / 60, a + 1 / 60).z ?? 0;
    assert.ok(Math.abs(z1 - z0) < 7, `no jump at ${a.toFixed(2)} s (${z0.toFixed(1)} to ${z1.toFixed(1)})`);
  }
});

test('taken: over his head, torn apart, slammed together, and into him; then gone', () => {
  const from: [number, number] = [5, 5];
  const to: [number, number] = [5.5, 5.2];
  const top = takenOf(TAKEN.leap + 0.05, from, to);
  assert.ok(top && (top.z ?? 0) > 40 && top.shown === 'apart', 'over his head, apart');
  assert.ok(!takenOf(TAKEN.slam - 0.01, from, to)?.slammed && takenOf(TAKEN.slam + 0.01, from, to)?.slammed, 'slammed');
  const last = takenOf(TAKEN.gone - 0.01, from, to);
  assert.ok(last && last.scale < 0.3 && (last.z ?? 99) <= TAKEN.chestZ + 3, 'into his chest, small');
  assert.equal(takenOf(TAKEN.gone, from, to), null, 'gone into him');
});

test('given: over the slab, its halves whirl round each other and slam together; then round and round the column of light', () => {
  const hero: [number, number] = [11, 14];
  const slab: [number, number] = [9.5, 15.5];
  const whirl = givenOf((GIVEN.split + GIVEN.slam) / 2, 0, hero, slab);
  assert.ok(whirl && whirl.halves && whirl.halves.length === 2 && !whirl.stone, 'its halves, apart');
  const after = givenOf(GIVEN.slam + 0.05, 0, hero, slab);
  assert.ok(after?.slammed && after.burst, 'slammed together, in a burst');
  // it comes to its round without a jump
  const t = 12.3;
  const st = givenOf(GIVEN.settled - 1e-6, t, hero, slab)?.stone;
  const o = orbitAt(t, slab);
  assert.ok(st, 'whole');
  assert.ok(Math.hypot((st?.x ?? 0) - o.x, (st?.y ?? 0) - o.y) < 0.01 && Math.abs((st?.z ?? 0) - o.z) < 0.5, 'on its round as it settles');
  assert.ok(Math.abs(Math.hypot(o.x - slab[0], o.y - slab[1]) - ORBIT.r) < 1e-9 && Math.abs(o.z - KEPT_Z) <= BOB + 1e-9);
  // its moments: what the rules say happened, seen; and forgotten once played out
  const M = new MeldDrops();
  M.see([{ t: 'dustGot', x: 1, y: 1, n: 3 }, { t: 'stoneGot', x: 1, y: 1 }, { t: 'stoneGiven', x: 9.5, y: 14.5 }], 10, { x: 11, y: 14 });
  assert.equal(M.whirls.length, 1);
  assert.ok(M.taken && M.given);
  M.tidy(20);
  assert.ok(M.whirls.length === 0 && !M.taken && !M.given);
});

interface Killer {
  kill: (m: Monster) => void;
}

/** Floor 5, the Fleshmancer felled where he stands. */
function felled(seed = 9): { g: Game; boss: Monster } {
  const g = seasoned(new Game('warrior', seed), 20);
  g.depth = 5;
  g.cleared = 4;
  g.enterDungeon();
  const boss = g.monsters.find((m) => m.kind === 'fleshmancer');
  if (!boss) throw new Error('the Fleshmancer is on floor 5');
  boss.life = 0;
  (g as unknown as Killer).kill(boss);
  return { g, boss };
}

test('the rules (STONE_RISE): off, the drops fall at once; on, they wait under the floor while he goes down, and the Meldstone cannot be taken while it rises', () => {
  const was = { meld: MELD.on, rise: STONE_RISE.on };
  MELD.on = true;
  try {
    STONE_RISE.on = false;
    const off = felled();
    for (const d of off.g.drops.filter((q) => q.kind === 'dust' || q.kind === 'stone')) assert.equal(d.age, 0, `off: the ${d.kind} at once`);
    STONE_RISE.on = true;
    const { g, boss } = felled();
    const dust = g.drops.find((q) => q.kind === 'dust')!;
    const stone = g.drops.find((q) => q.kind === 'stone')!;
    assert.equal(dust.age, -STONE_RISE.dustWait);
    assert.equal(stone.age, -STONE_RISE.wait);
    assert.ok(stone.x === boss.x && stone.y === boss.y, 'the Meldstone where he went down');
    // the hero right on it: it is not his until it has risen and hangs
    const h = g.hero;
    h.x = stone.x;
    h.y = stone.y;
    const c = emptyControls();
    g.events.length = 0;
    let t = 0;
    while (h.meld === null && t < 8) {
      g.update(DT, c);
      t += DT;
    }
    assert.equal(h.meld, 'stone', 'taken in the end');
    assert.ok(t >= STONE_RISE.wait + STONE_RISE.stands - 2 * DT, `not before it has risen (${t.toFixed(2)} s)`);
    assert.ok(g.events.some((e) => e.t === 'stoneGot'), 'the rules say it was taken');
    assert.equal(h.dust, MELD_TUNE.fleshmancerDust);
  } finally {
    MELD.on = was.meld;
    STONE_RISE.on = was.rise;
  }
});

test('the rules say when runedust is taken, and when the Meldstone is given to the wordsmith', () => {
  const was = { meld: MELD.on, hand: HAND_IN.on };
  MELD.on = true;
  HAND_IN.on = true;
  try {
    const { g } = felled(11);
    const dust = g.drops.find((q) => q.kind === 'dust')!;
    const h = g.hero;
    h.x = dust.x;
    h.y = dust.y;
    g.events.length = 0;
    for (let k = 0; k < 30; k++) g.update(DT, emptyControls());
    const got = g.events.find((e) => e.t === 'dustGot');
    assert.ok(got && got.t === 'dustGot' && got.n === MELD_TUNE.fleshmancerDust, 'runedust taken, and how much');
    const t = seasoned(new Game('warrior', 15), 10);
    t.hero.meld = 'stone';
    const st = t.level.stations.find((q) => q.kind === 'wordsmith')!;
    t.hero.x = st.x + 1.5;
    t.hero.y = st.y - 0.6;
    const c = emptyControls();
    c.interact = true;
    t.events.length = 0;
    t.update(DT, c);
    assert.equal(t.hero.meld, 'open');
    assert.ok(t.events.some((e) => e.t === 'stoneGiven'), 'given: the rules say so');
  } finally {
    MELD.on = was.meld;
    HAND_IN.on = was.hand;
  }
});

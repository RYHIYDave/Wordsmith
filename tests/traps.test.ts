// THE TRAPS (game/traps.ts): the spike floor, the dart wall and the sealed door, in the hall laid
// by hand for them (`#hall=traps`, game/level.ts, `makeTrapHall`) and as the map-maker lays them,
// from the second dungeon on, since the owner's yes of 8 Oct 2026, 11:36 ("Yes, as they are
// (Recommended)", of their pictures and "Put the traps into the dungeons, as in the pictures?").
//   run: tsx --test tests/traps.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { botStep, newBot } from '../src/dev/bot';
import { DOORS, doorMiddle, doorTiles, doorWay } from '../src/game/doors';
import { MIX, generateFloor } from '../src/game/dungeon';
import { Game } from '../src/game/game';
import { TRAP_HALL } from '../src/game/level';
import { armorReduction } from '../src/game/stats';
import { emptyControls } from '../src/game/state';
import type { GameEvent, Monster } from '../src/game/state';
import { DART, SPIKE, SPIKE_BEAT, TRAPS, TRAPS_FROM, onHazard, slotMouth, spikeAt, spikeHeight } from '../src/game/traps';
import type { HazardInst } from '../src/game/traps';
import { T_FLOOR, T_WALL, WORD_IDS } from '../src/game/types';
import type { Floor, HazardSpot, WordId } from '../src/game/types';
import type { RNG } from '../src/engine/rng';
import { withoutCrypt } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const DT = 1 / 60;

type Inner = {
  rng: RNG;
  spawn: (k: string, x: number, y: number, pack: number, rank: number, boss: boolean, rng: RNG) => Monster;
  wakeUp: (m: Monster) => void;
  shutIn: (m: { x: number; y: number }) => boolean;
  useBasic: (tx: number, ty: number) => void;
  updatePractice: () => void;
};
const inner = (g: Game): Inner => g as unknown as Inner;

/** The hall of the traps, with nothing in it but the hero; the practice room's waves switched off. */
function hall(cls: 'warrior' | 'ranger' | 'mage' = 'warrior'): Game {
  const g = Game.forPractice(cls, 5, 'traps');
  inner(g).updatePractice = () => {};
  g.monsters.length = 0;
  g.hero.invuln = 0;
  return g;
}
function steps(g: Game, n: number, c = emptyControls()): GameEvent[] {
  const out: GameEvent[] = [];
  for (let k = 0; k < n; k++) {
    g.events.length = 0;
    g.update(DT, c);
    out.push(...g.events);
  }
  return out;
}
const said = (events: GameEvent[], text: string): number => events.filter((e) => e.t === 'msg' && e.text === text).length;
const put = (g: Game, x: number, y: number): void => {
  g.hero.x = x;
  g.hero.y = y;
  g.hero.move = null;
};
const hazard = (g: Game, kind: 'spikes' | 'darts', k = 0): HazardInst => g.level.hazards.filter((z) => z.spot.kind === kind)[k];
/** What a share of the hero's life comes to after armour (the spikes' and the darts' harm is physical), at least 1. */
const afterArmour = (g: Game, share: number): number => Math.max(1, Math.round(g.hero.d.maxLife * share * (1 - armorReduction(g.hero.d.armor, Math.max(1, g.depth)))));
/** A monster stood still where it is put, awake, that cannot hit back. */
function stillMonster(g: Game, kind: string, x: number, y: number): Monster {
  const m = inner(g).spawn(kind, x, y, 0, 0, false, inner(g).rng);
  m.speed = 0;
  m.cd = 1e9;
  return m;
}
/** The words of the hero's first ability: these in front, these behind, nothing else. */
function wordsOn(g: Game, front: WordId[], behind: WordId[] = []): void {
  const s = g.hero.skills[0];
  for (let i = 0; i < s.front.length; i++) if (s.front[i]) g.unsocket(0, 'front', i);
  for (let i = 0; i < s.behind.length; i++) if (s.behind[i]) g.unsocket(0, 'behind', i);
  for (const w of front) assert.equal(g.socket(0, 'front', w), null, `${w} goes in front`);
  for (const w of behind) assert.equal(g.socket(0, 'behind', w), null, `${w} goes behind`);
}
/** With the map-maker's switches as asked, and put back. */
function laid<T>(traps: boolean, run: () => T): T {
  const was = { traps: TRAPS.on, doors: DOORS.on };
  TRAPS.on = traps;
  DOORS.on = true;
  try {
    return run();
  } finally {
    TRAPS.on = was.traps;
    DOORS.on = was.doors;
  }
}

// =================================================================================================
// THE SWITCH, AND THE BEAT

test('the switch is on in the game (his yes, 8 Oct 2026, 11:36), and the traps begin with the second dungeon: the first has none, and with the switch off no dungeon has any', () => {
  assert.equal(TRAPS.on, true, 'the owner, of the traps\' pictures and "Put the traps into the dungeons, as in the pictures?": "Yes, as they are (Recommended)"');
  assert.equal(TRAPS_FROM, 2);
  for (let seed = 1; seed <= 12; seed++) {
    const first = generateFloor(1, seed * 131);
    assert.ok(!first.hazards && !first.rooms.some((r) => r.sealed) && !(first.doors ?? []).some((d) => d.kind === 'worddoor'), `the first dungeon of seed ${seed * 131} has no trap`);
    laid(false, () => {
      for (const depth of [2, 5, 9]) {
        const f = generateFloor(depth, seed * 131);
        assert.ok(!f.hazards && !f.rooms.some((r) => r.sealed) && !(f.doors ?? []).some((d) => d.kind === 'worddoor'), `with the switch off, dungeon ${depth} of seed ${seed * 131} has no trap`);
      }
    });
  }
});

test('a spike floor\'s beat: down 1.6 seconds, a warning of 0.3, up 0.6; its phase moves it along; the spikes snap up and sink at the end', () => {
  assert.equal(SPIKE.down, 1.6);
  assert.equal(SPIKE.warn, 0.3);
  assert.equal(SPIKE.up, 0.6);
  assert.equal(Math.round(SPIKE_BEAT * 100) / 100, 2.5);
  const s: HazardSpot = { kind: 'spikes', x: 0, y: 0, w: 2, h: 3, phase: 0 };
  assert.equal(spikeAt(s, 0.5).at, 'down');
  assert.equal(spikeAt(s, 1.7).at, 'warn');
  assert.equal(spikeAt(s, 2.2).at, 'up');
  assert.equal(spikeAt(s, 2.6).at, 'down', 'and down again: a beat is 2.5 seconds');
  assert.equal(spikeAt({ ...s, phase: 1.25 }, 0.9).at, 'up', 'half a beat on, its spikes are up when the other\'s are down');
  assert.equal(spikeHeight(s, 1.0), 0, 'down, no spike stands');
  assert.equal(spikeHeight(s, 1.75), 0, 'nor in the warning: the holes glint');
  assert.equal(spikeHeight(s, 2.2), 1, 'up: all the way');
  assert.ok(spikeHeight(s, 1.92) > 0 && spikeHeight(s, 1.92) < 1, 'they snap up');
  assert.ok(spikeHeight(s, 2.47) > 0 && spikeHeight(s, 2.47) < 1, 'and sink at the end');
});

// =================================================================================================
// THE HALL, AND THE RULES IN IT

test('the hall of the traps is as its plan says: two spike floors, a dart wall, and a sealed door of FLAME in the vault\'s way in, which is wall to whatever walks, flies, is shot or looks; no other door', () => {
  const g = hall();
  const L = g.level;
  const f = L.floor;
  assert.deepEqual(L.hazards.map((z) => z.spot.kind), ['spikes', 'spikes', 'darts']);
  assert.deepEqual(L.doors.map((d) => `${d.spot.room}:${d.spot.kind}:${d.spot.word}`), ['3:worddoor:fire']);
  const d = L.doors[0];
  assert.deepEqual([d.open, d.want], [0, 0], 'it is shut');
  for (const i of doorWay(f, d.spot)) assert.deepEqual([L.walk[i], L.open[i]], [0, 0], 'its tile is wall to walking, and to sight and shots');
  const q = hazard(g, 'darts').spot.slot;
  assert.ok(q && f.tiles[q.y * f.w + q.x] === T_WALL, 'the dart wall\'s slot is in a wall');
  assert.equal(TRAP_HALL.rooms.find((r) => r.id === 3)?.sealed, 'fire');
});

test('a spike floor hurts the hero once each time it rises, a sixth of their life (before armour), and not while they roll or leap', () => {
  const g = hall();
  const h = g.hero;
  const z = hazard(g, 'spikes', 0);
  put(g, z.spot.x + 1, z.spot.y + 1.5);
  assert.ok(onHazard(z.spot, h.x, h.y));
  g.time = 1.5;
  h.life = h.d.maxLife;
  steps(g, 18);
  assert.equal(h.life, h.d.maxLife, 'down and in the warning, nothing');
  steps(g, 10);
  // (the hero's life comes back a little as the steps go by: the harm is counted to the nearest whole)
  const once = Math.round(h.d.maxLife - h.life);
  assert.equal(once, afterArmour(g, SPIKE.share), 'as they rise: a sixth of the hero\'s life, less what armour takes');
  steps(g, 30);
  assert.equal(Math.round(h.d.maxLife - h.life), once, 'only once while they are up');
  // (the next rise: once more)
  h.life = h.d.maxLife;
  g.time = 4.3;
  steps(g, 12);
  assert.equal(Math.round(h.d.maxLife - h.life), once, 'and once each time they rise');
  // (a hero rolling over them is not hurt)
  h.life = h.d.maxLife;
  g.time = 6.8;
  h.move = { kind: 'roll', t: 0, dur: 1, fx: 1, fy: 0, sx: h.x, sy: h.y, tx: h.x, ty: h.y } as unknown as typeof h.move;
  steps(g, 1);
  g.time = 6.85;
  for (let k = 0; k < 5; k++) {
    h.x = z.spot.x + 1;
    h.y = z.spot.y + 1.5;
    g.time += DT;
    g.update(DT, emptyControls());
  }
  assert.equal(h.life, h.d.maxLife, 'while rolling, nothing');
});

test('monsters on a spike floor take a sixth of their own life each time it rises; a bat flies over it', () => {
  const g = hall();
  const z = hazard(g, 'spikes', 1);
  put(g, 21.5, 15.5);
  const sk = stillMonster(g, 'skeleton', z.spot.x + 1.5, z.spot.y + 1.5);
  const bat = stillMonster(g, 'bat', z.spot.x + 2.5, z.spot.y + 2.5);
  sk.life = sk.maxLife;
  bat.life = bat.maxLife;
  // (this floor is half a beat behind: up from 0.65 to 1.25)
  g.time = 0.3;
  steps(g, 5);
  g.time = 0.6;
  steps(g, 12);
  assert.equal(sk.maxLife - sk.life, Math.max(1, Math.round(sk.maxLife * SPIKE.share)), 'a skeleton: a sixth of its life');
  assert.equal(bat.life, bat.maxLife, 'a bat: nothing');
});

test('a dart wall: the hero on the plate sets it off, a monster does not; three darts leave the slot, all at the place the hero stood as it clicked; it is ready again three seconds later', () => {
  const g = hall();
  const h = g.hero;
  const z = hazard(g, 'darts');
  // (a monster on the plate, the hero far off: nothing)
  put(g, 10, 18.5);
  const m = stillMonster(g, 'skeleton', z.spot.x + 0.5, z.spot.y + 0.5);
  steps(g, 30);
  assert.equal(z.left + (z.ready > 0 ? 1 : 0), 0, 'a monster does not set it off');
  m.dead = true;
  g.monsters.length = 0;
  // (the hero on it)
  put(g, z.spot.x + 0.5, z.spot.y + 0.5);
  h.invuln = 1e9;
  steps(g, 1);
  assert.equal(z.left, DART.count, 'it clicks: three to come');
  assert.deepEqual([z.aimX, z.aimY], [h.x, h.y], 'all at where the hero stands');
  // (he steps off at once: they still fly at the place he stood)
  put(g, z.spot.x + 0.5, z.spot.y - 1.5);
  const seen = new Set<object>();
  const dirs: string[] = [];
  for (let k = 0; k < 60; k++) {
    steps(g, 1);
    for (const p of g.projectiles) {
      if (p.look !== 'dart' || seen.has(p)) continue;
      seen.add(p);
      const n = Math.hypot(p.vx, p.vy);
      dirs.push(`${(p.vx / n).toFixed(3)},${(p.vy / n).toFixed(3)}`);
      assert.ok(p.trap && p.hostile, 'a dart is the dungeon\'s, and hurts the hero');
    }
  }
  assert.equal(seen.size, DART.count, 'three darts');
  const o = slotMouth(z.spot);
  const want = Math.atan2(z.aimY - o.y, z.aimX - o.x);
  assert.ok(dirs.every((d) => d === dirs[0]) && Math.abs(Math.atan2(Number(dirs[0].split(',')[1]), Number(dirs[0].split(',')[0])) - want) < 1e-3, `every one at the place he stood (${dirs.join(' ')})`);
  // (back on it at once: not ready; three seconds after the click: ready, and it clicks again)
  put(g, z.spot.x + 0.5, z.spot.y + 0.5);
  steps(g, 2);
  assert.ok(z.left === 0 && z.ready > 0, 'not ready yet');
  steps(g, Math.ceil((DART.rearm - 1) / DT) + 5);
  assert.equal(z.left > 0 || z.ready > DART.rearm - 0.2, true, 'ready again three seconds after the click: it clicks again');
});

test('a dart hurts the hero a share of their life (before armour); and a monster in its way, a share of its own', () => {
  const g = hall();
  const h = g.hero;
  const z = hazard(g, 'darts');
  put(g, z.spot.x + 0.5, z.spot.y + 0.5);
  h.life = h.d.maxLife;
  for (let k = 0; k < 120 && h.life >= h.d.maxLife - 0.5; k++) steps(g, 1);
  assert.equal(Math.round(h.d.maxLife - h.life), afterArmour(g, DART.share), 'the first dart: twelve hundredths of the hero\'s life, less what armour takes');
  // (a skeleton between the slot and the plate takes the dart instead)
  const g2 = hall();
  const z2 = hazard(g2, 'darts');
  const o = slotMouth(z2.spot);
  const m = stillMonster(g2, 'skeleton', (o.x + z2.spot.x + 0.5) / 2, z2.spot.y + 0.5);
  m.life = m.maxLife;
  put(g2, z2.spot.x + 0.5, z2.spot.y + 0.5);
  g2.hero.invuln = 1e9;
  for (let k = 0; k < 120 && m.life >= m.maxLife; k++) steps(g2, 1);
  assert.equal(m.maxLife - m.life, Math.max(1, Math.round(m.maxLife * DART.share)), 'a skeleton in its way: twelve hundredths of its life');
});

test('the sealed door opens only to a blow from an attack that carries its word, in front or behind; a line says what it wants, and that it opens; once open, it is open to walking and to sight, and what was shut in is in reach', () => {
  for (const side of ['front', 'behind'] as const) {
    const g = hall();
    const L = g.level;
    const d = L.doors.find((q) => q.spot.kind === 'worddoor');
    assert.ok(d);
    if (!d) return;
    const at = doorMiddle(d.spot);
    const inVault = stillMonster(g, 'skeleton', at.x, at.y - 3);
    put(g, at.x, at.y + 3.5);
    g.hero.fx = 0;
    g.hero.fy = -1;
    const ev = steps(g, 20);
    assert.equal(said(ev, 'A sealed door. It wants FLAME.'), side === 'front' ? 1 : 1, 'seen from near, a line says what it wants');
    assert.equal(inner(g).shutIn(inVault), true, 'what is in the vault is out of the hero\'s reach');
    // (a Strike without the word: nothing)
    put(g, at.x, at.y + 1.4);
    wordsOn(g, ['frost']);
    inner(g).useBasic(at.x, at.y);
    steps(g, 90);
    assert.equal(d.want, 0, 'a Strike of Frost does not open it');
    // (with FLAME, in front or behind)
    wordsOn(g, side === 'front' ? ['fire'] : [], side === 'behind' ? ['fire'] : []);
    inner(g).useBasic(at.x, at.y);
    const opened = steps(g, 90);
    assert.equal(d.want, 1, `a Strike with FLAME ${side === 'front' ? 'in front' : 'behind'} opens it`);
    assert.equal(said(opened, 'The FLAME seal breaks.'), 1, 'a line says so');
    assert.ok(d.open > 0.99, 'it swings open as a door does');
    for (const i of doorWay(L.floor, d.spot)) assert.deepEqual([L.walk[i], L.open[i]], [1, 1], 'its tile is open to walking, and to sight and shots');
    assert.equal(inner(g).shutIn(inVault), false, 'and what was in the vault is in reach');
  }
});

test('a shot that meets a sealed door opens it if it carries the word; a ranger\'s Shot of Flame', () => {
  const g = hall('ranger');
  const d = g.level.doors.find((q) => q.spot.kind === 'worddoor');
  assert.ok(d);
  if (!d) return;
  const at = doorMiddle(d.spot);
  put(g, at.x, at.y + 4.5);
  g.hero.fx = 0;
  g.hero.fy = -1;
  wordsOn(g, ['fire']);
  inner(g).useBasic(at.x, at.y);
  steps(g, 120);
  assert.equal(d.want, 1, 'the arrow meets the door, and it opens');
});

/** Every harm the hero takes, by what it was (game.ts, `hurtHero`: `from`), written down as it comes. */
function harms(g: Game): string[] {
  const out: string[] = [];
  const was = g.hurtHero.bind(g);
  g.hurtHero = (raw, el, words, src, from = '') => {
    out.push(src ? src.kind : from);
    was(raw, el, words, src, from);
  };
  return out;
}

test('the playtests\' own player waits for a spike floor to go down before it crosses, and steps out of the darts\' line once a plate has clicked: it gets through the hall unhurt by either', () => {
  for (const start of [0, 0.7, 1.4, 2.1]) {
    const g = hall();
    const h = g.hero;
    const hurt = harms(g);
    // (something to go for beyond the corridor's spike floor, and beyond the dart wall's plate; neither can hit back)
    const far = stillMonster(g, 'skeleton', 27.5, 15.5);
    far.state = 'sleep';
    const st = newBot(false, false);
    const c = emptyControls();
    g.time = start;
    let crossed = false;
    for (let t = 0; t < 40 && !far.dead; t += DT) {
      botStep(g, c, st, DT);
      g.update(DT, c);
      if (h.x > 19) crossed = true;
    }
    assert.ok(crossed && far.dead, `it crossed the corridor's spike floor and killed what was beyond it (beginning ${start} s into the beat)`);
    assert.ok(!hurt.includes('spikes'), `and the spikes never caught it (beginning ${start} s into the beat; harmed by: ${hurt.join(', ') || 'nothing'})`);
  }
  // (the dart wall: on the plate, then out of the line)
  const g = hall();
  const z = hazard(g, 'darts');
  const hurt = harms(g);
  put(g, z.spot.x - 4.5, z.spot.y + 0.5);
  const beyond = stillMonster(g, 'skeleton', 41.5, 34.5);
  beyond.state = 'sleep';
  const st = newBot(false, false);
  const c = emptyControls();
  let clicked = false;
  for (let t = 0; t < 40 && !beyond.dead; t += DT) {
    botStep(g, c, st, DT);
    g.update(DT, c);
    if (z.left > 0) clicked = true;
  }
  assert.ok(beyond.dead, 'it went on along the dart run, and killed what was at its end');
  assert.ok(clicked, 'the plate clicked under it on the way');
  assert.ok(!hurt.includes('a dart'), `and it stepped out of the darts' line (harmed by: ${hurt.join(', ') || 'nothing'})`);
});

// =================================================================================================
// THE MAP-MAKER

/** Dungeons 2 to 10 of a spread of seeds, as the game lays them. */
const SAMPLES: { depth: number; seed: number; f: Floor }[] = [];
for (let seed = 1; seed <= 24; seed++) for (const depth of [2, 3, 4, 6, 8, 10]) SAMPLES.push({ depth, seed: seed * 7919 + depth, f: generateFloor(depth, seed * 7919 + depth) });

test('from the second dungeon on, every dungeon has one or two spike floors and one or two dart walls; a treasure vault with a doorway is sealed with a word', () => {
  let sealed = 0;
  let vaults = 0;
  for (const { depth, seed, f } of SAMPLES) {
    const where = `dungeon ${depth}, seed ${seed}`;
    const hz = f.hazards ?? [];
    const sp = hz.filter((z) => z.kind === 'spikes').length;
    const dt = hz.filter((z) => z.kind === 'darts').length;
    assert.ok(sp >= 1 && sp <= 2, `${where}: ${sp} spike floors`);
    assert.ok(dt >= 1 && dt <= 2, `${where}: ${dt} dart walls`);
    const s = f.rooms.filter((r) => r.sealed);
    assert.ok(s.length <= 1, `${where}: at most one sealed vault`);
    const wd = (f.doors ?? []).filter((d) => d.kind === 'worddoor');
    assert.equal(wd.length, s.length, `${where}: a sealed vault has its sealed door in its way in`);
    for (const r of s) {
      assert.equal(r.kind, 'treasure', `${where}: a sealed room is a treasure vault`);
      assert.ok(WORD_IDS.includes(r.sealed as WordId), `${where}: sealed with a word`);
      assert.ok(wd.some((d) => d.room === r.id && d.word === r.sealed), `${where}: its door carries the word`);
    }
    if (f.rooms.some((r) => r.kind === 'treasure')) vaults++;
    sealed += s.length;
  }
  assert.ok(sealed >= vaults * 0.7, `most vaults are sealed (${sealed} of ${vaults} dungeons with one)`);
});

test('the map-maker\'s traps keep to their rules: a spike floor across a corridor spans its width with wall on both sides; none on a doorway, a prop, a lever, a stair, raised, sunken or cut floor; none in the first room, the boss\'s hall, a vault, a lair or a nook; a dart wall\'s slot is wall facing the eye straight across the room from its plate, which is one step inside a way out, the floor between them clear and level; traps keep five tiles apart', () => {
  for (const { depth, seed, f } of SAMPLES) {
    const where = `dungeon ${depth}, seed ${seed}`;
    const W = f.w;
    const roomOf = (x: number, y: number) => f.rooms.find((r) => x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h);
    const doorway = new Set<number>();
    for (const d of f.doors ?? []) for (const i of doorTiles(f, d)) doorway.add(i);
    const hz = f.hazards ?? [];
    for (const z of hz) {
      for (let y = z.y; y < z.y + z.h; y++) {
        for (let x = z.x; x < z.x + z.w; x++) {
          const i = y * W + x;
          assert.equal(f.tiles[i], T_FLOOR, `${where}: a ${z.kind} on floor`);
          assert.ok(!doorway.has(i), `${where}: not on a doorway`);
          assert.ok(!f.props.some((p) => p.x === x && p.y === y), `${where}: not on a prop`);
          assert.ok(!(f.levers ?? []).some((q) => q.x === x && q.y === y), `${where}: not under a lever`);
          assert.ok(!(f.stair && f.stair[i]) && !(f.height && f.height[i]) && !(f.cut && f.cut[i]), `${where}: on level floor, no stair, no cut`);
          const r = roomOf(x, y);
          assert.ok(!r || (r.path !== 0 && r.kind !== 'boss' && r.kind !== 'treasure' && r.kind !== 'guardian' && !r.nook), `${where}: not in the first room, the boss's hall, a vault, a lair or a nook`);
        }
      }
      if (z.kind === 'spikes' && z.w * z.h === 6) {
        // (across a corridor: wall on both sides of the patch, across its three)
        const alongX = z.w === 2;
        for (let k = 0; k < 2; k++) {
          const a = alongX ? [z.x + k, z.y - 1] : [z.x - 1, z.y + k];
          const b = alongX ? [z.x + k, z.y + 3] : [z.x + 3, z.y + k];
          assert.ok(f.tiles[a[1] * W + a[0]] === T_WALL && f.tiles[b[1] * W + b[0]] === T_WALL, `${where}: a spike floor across a corridor spans its width`);
        }
        assert.ok(!roomOf(z.x, z.y), `${where}: in a corridor`);
      }
      if (z.kind === 'darts') {
        const q = z.slot;
        assert.ok(q && (q.dx === 1 && q.dy === 0 || q.dx === 0 && q.dy === 1), `${where}: its slot faces the eye`);
        if (!q) continue;
        assert.equal(f.tiles[q.y * W + q.x], T_WALL, `${where}: the slot is in a wall`);
        const r = roomOf(z.x, z.y);
        assert.ok(r, `${where}: the plate is in a room`);
        if (!r) continue;
        // (one step inside a way out on a side toward the eye; the slot in the wall straight across)
        if (q.dy === 1) {
          assert.ok(z.x === q.x && z.y === r.y + r.h - 1 && q.y === r.y - 1 && f.tiles[(r.y + r.h) * W + z.x] === T_FLOOR, `${where}: plate one step inside a way out in the bottom wall, the slot straight across`);
          for (let y = r.y; y < z.y; y++) assert.ok(f.tiles[y * W + z.x] === T_FLOOR && !f.props.some((p) => p.x === z.x && p.y === y) && !(f.height && f.height[y * W + z.x]), `${where}: the floor between clear and level`);
        } else {
          assert.ok(z.y === q.y && z.x === r.x + r.w - 1 && q.x === r.x - 1 && f.tiles[z.y * W + r.x + r.w] === T_FLOOR, `${where}: plate one step inside a way out in the right wall, the slot straight across`);
          for (let x = r.x; x < z.x; x++) assert.ok(f.tiles[z.y * W + x] === T_FLOOR && !f.props.some((p) => p.x === x && p.y === z.y) && !(f.height && f.height[z.y * W + x]), `${where}: the floor between clear and level`);
        }
      }
    }
    for (let a = 0; a < hz.length; a++) {
      for (let b = a + 1; b < hz.length; b++) {
        const d = Math.hypot(hz[a].x + hz[a].w / 2 - hz[b].x - hz[b].w / 2, hz[a].y + hz[a].h / 2 - hz[b].y - hz[b].h / 2);
        assert.ok(d >= 5, `${where}: traps keep five tiles apart (${d.toFixed(1)})`);
      }
    }
  }
});

test('the map-maker\'s traps take dice of their own: with them, a dungeon\'s tiles, rooms, packs and props are what they were without them; the same dungeon and seed give the same traps', () => {
  for (const { depth, seed, f } of SAMPLES.filter((_, i) => i % 3 === 0)) {
    const where = `dungeon ${depth}, seed ${seed}`;
    const off = laid(false, () => generateFloor(depth, seed));
    assert.deepEqual(f.tiles, off.tiles, `${where}: the same tiles`);
    assert.deepEqual(f.packs, off.packs, `${where}: the same packs`);
    // (the props, both laid without the Crypt, whose litter, laid last of all where nothing else is, keeps off the traps: `withoutCrypt`)
    assert.deepEqual(withoutCrypt(() => generateFloor(depth, seed)).props, withoutCrypt(() => laid(false, () => generateFloor(depth, seed))).props, `${where}: the same props`);
    assert.deepEqual(f.rooms.map((r) => ({ ...r, sealed: undefined })).map((r) => JSON.stringify(r)), off.rooms.map((r) => JSON.stringify({ ...r, sealed: undefined })), `${where}: the same rooms, but for the seal`);
    assert.deepEqual((f.doors ?? []).map((d) => ({ ...d, kind: d.kind === 'worddoor' ? 'door' : d.kind, word: undefined })).map((d) => JSON.stringify(d)), (off.doors ?? []).map((d) => JSON.stringify({ ...d, word: undefined })), `${where}: the same doors, but that the vault's is sealed`);
    const again = generateFloor(depth, seed);
    assert.deepEqual(again.hazards, f.hazards, `${where}: the same traps again`);
  }
  assert.equal(MIX.on, true, '(with the mix, as in the game)');
});

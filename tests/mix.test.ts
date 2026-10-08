// THE MIX INSIDE EACH DUNGEON: THE RULES of a lever and its gate, and of a room that locks
// (src/game/doors.ts, game.ts: `pullLever`, `updateLocks`; the hall laid by hand for them,
// level.ts: `makeMixHall`), and THE MAP-MAKER that lays them and two rooms next door in real
// dungeons (game/dungeon.ts). ITS SWITCH, `MIX.on`, IS ON IN THE GAME SINCE VERSION 18.9 (his yes to
// its pictures, 8 Oct 2026, 07:32: "Yeah looks good"): these tests set it for themselves where they
// ask about a dungeon with it or without it, and put it back.
//
// The owner, 7 Oct 2026, 14:01: "[...] that same bar style for gates going up and down with the
// spikes on the bottom. Classic castle style. Implementing this should also affect level design
// and move away from only room-hallway-room-hallway-room repetition. [...] They can be closed with
// levers or switches nearby to open them." 17:51: "I want different room and hallway
// configurations within each dungeon. [...] We can mix it up with the doors and the gates to make
// more different and interesting layouts for the whole dungeon." What he was told the pieces are
// (17:53): "- two rooms side by side with only a door between them / - a gate across the way, its
// lever off to one side / - a room whose gates drop until its pack is dead". Of the mix as this
// chat's next job (21:13): "thats fine".
//
// What is held here, in the hall:
//   - the hall is as its plan says: a gate, DOWN, in the gated room's way in; the lever in the
//     nook; a gate, UP, in each doorway of the room that locks; doors in the other ways in;
//   - a lever's gate that is down stops the hero, sight and whatever is behind it from waking; and
//     what is behind it is out of the hero's reach, as behind a shut door;
//   - THE HERO PULLS THE LEVER BY WALKING UP TO IT: the gate rises and stays up; no monster pulls
//     one; the gate is told of in a line, once, the first time it is seen from near;
//   - A ROOM THAT LOCKS: its gates fall when the hero is well inside with a living monster of the
//     room's own pack, hold him in and everything else out, and rise when none of that pack is
//     left alive IN THE ROOM (one that was drawn out before they fell does not keep them down);
//   - the playtests' own player, with a gate down, goes for what it can come to, then for the
//     lever, then on.
//   run: tsx --test tests/mix.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { botStep, newBot } from '../src/dev/bot';
import type { RNG } from '../src/engine/rng';
import { DOORS, GATE_RISE, LEVER_NEAR, LOCK_CLEAR, doorMiddle, doorTiles, doorways } from '../src/game/doors';
import type { DoorInst } from '../src/game/doors';
import { MIX, generateFloor } from '../src/game/dungeon';
import { TRAPS } from '../src/game/traps';
import { Game } from '../src/game/game';
import { MIX_HALL } from '../src/game/level';
import { UNREACHABLE, flowField } from '../src/game/nav';
import { emptyControls } from '../src/game/state';
import type { GameEvent, Monster, PropInst } from '../src/game/state';
import { T_FLOOR } from '../src/game/types';
import type { DoorSpot, Element, Floor, Room } from '../src/game/types';

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
  damageMonster: (m: Monster, dmg: number, el: Element, crit: boolean, skill: number) => void;
  blast: (i: number, cx: number, cy: number, rad: number, frac: number, style: 'blast') => void;
  shutIn: (m: { x: number; y: number }) => boolean;
  pullLever: (p: PropInst) => void;
  updatePractice: () => void;
};
const inner = (g: Game): Inner => g as unknown as Inner;

/** The hall of the mix, with nothing in it; a hero nothing can hurt. (The practice room's waves are switched off.) */
function hall(cls: 'warrior' | 'ranger' | 'mage' = 'warrior'): Game {
  const g = Game.forPractice(cls, 5, 'mix');
  inner(g).updatePractice = () => {};
  g.monsters.length = 0;
  g.hero.invuln = 1e9;
  return g;
}
/** Steps of the game with nobody at the controls; the events of all of them. */
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
const room = (g: Game, id: number): Room => g.level.floor.rooms.find((r) => r.id === id) as Room;
const within = (r: Room, p: { x: number; y: number }): boolean => p.x >= r.x && p.y >= r.y && p.x < r.x + r.w && p.y < r.y + r.h;
const gatesOf = (g: Game, id: number, kind: string): DoorInst[] => g.level.doors.filter((d) => d.spot.room === id && d.spot.kind === kind);
const lever = (g: Game): PropInst => g.level.props.find((p) => p.kind === 'lever') as PropInst;
const put = (g: Game, x: number, y: number): void => {
  g.hero.x = x;
  g.hero.y = y;
  g.hero.move = null;
};

test('the hall of the mix is as its plan says: a gate, down, in the gated room\'s way in; the lever in the nook; a gate, up, in each doorway of the room that locks; doors in the other ways in', () => {
  const g = hall();
  const L = g.level;
  const f = L.floor;
  assert.equal(f.rooms.length, 5);
  assert.deepEqual(L.doors.map((d) => `${d.spot.room}:${d.spot.kind}`).sort(), ['1:gate', '2:door', '3:trapgate', '3:trapgate', '4:door']);
  const gate = gatesOf(g, 1, 'gate')[0];
  assert.deepEqual([gate.open, gate.want], [0, 0], 'the lever\'s gate is down as the run begins');
  for (const i of doorTiles(f, gate.spot)) assert.deepEqual([L.walk[i], L.open[i]], [0, 0], 'and its doorway is wall to whatever walks, flies, is shot or looks');
  for (const d of gatesOf(g, 3, 'trapgate')) {
    assert.deepEqual([d.open, d.want], [1, 1], 'a gate of the room that locks is up');
    for (const i of doorTiles(f, d.spot)) assert.deepEqual([L.walk[i], L.open[i]], [1, 1], 'and its doorway is open');
  }
  for (const d of L.doors.filter((q) => q.spot.kind === 'door')) assert.deepEqual([d.open, d.want], [0, 0], 'a door is shut');
  const p = lever(g);
  assert.ok(p && p.state === 0 && p.solid, 'a lever stands in the level, not pulled, and is not walked through');
  assert.ok(within(room(g, 2), p), 'in the nook');
  assert.deepEqual(f.levers, [{ x: p.tx, y: p.ty, room: 1 }], 'and knows the room its gate bars');
  // by the way one walks: the nook can be come to from the start, the gated room and what lies beyond it cannot
  const far = flowField(L.walk, f.w, f.h, Math.floor(f.start.x), Math.floor(f.start.y), Infinity, undefined, L.step);
  const at = (r: Room): number => far[Math.floor(r.y + r.h / 2) * f.w + Math.floor(r.x + r.w / 2)];
  assert.ok(at(room(g, 2)) !== UNREACHABLE, 'the nook can be walked to');
  for (const id of [1, 3, 4]) assert.equal(at(room(g, id)), UNREACHABLE, `room ${id} cannot, while the gate is down`);
});

test('a lever\'s gate that is down stops the hero and sight; what is behind it does not wake and is out of his reach; it is told of once, the first time it is seen from near', () => {
  const g = hall();
  const L = g.level;
  const h = g.hero;
  const gate = gatesOf(g, 1, 'gate')[0];
  const mid = doorMiddle(gate.spot);
  // a skeleton asleep in the gated room, four tiles behind the gate
  const sk = inner(g).spawn('skeleton', mid.x + 4, mid.y, 0, 0, false, inner(g).rng);
  // from where the run begins the gate is ten tiles off: nothing is said
  let events = steps(g, 30);
  assert.equal(said(events, 'A gate bars the way. Its lever is near.'), 0);
  // nearer, with the gate in sight: said, and said once
  put(g, mid.x - 6, mid.y);
  events = steps(g, 120);
  assert.equal(said(events, 'A gate bars the way. Its lever is near.'), 1, 'the gate is told of the first time it is seen from near, and once');
  // he walks at it for four seconds
  const c = emptyControls();
  c.mx = 1;
  steps(g, 240, c);
  assert.ok(h.x < mid.x - 0.5 && h.x > mid.x - 1.5, `the gate holds him (he is at ${h.x.toFixed(2)}, the gate's tiles begin at ${mid.x - 0.5})`);
  assert.deepEqual([gate.open, gate.want], [0, 0], 'coming near does not open it');
  assert.ok(!g.sees(h.x, h.y, sk.x, sk.y) && !g.sees(sk.x, sk.y, h.x, h.y), 'he and what is behind it do not see each other');
  assert.equal(sk.state, 'sleep', 'and it sleeps on');
  assert.equal(L.visible[Math.floor(sk.y) * L.floor.w + Math.floor(sk.x)], 0, 'the room behind the gate is not seen');
  // out of reach, as behind a shut door: a blast against the gate that takes in a place just behind it
  const near = inner(g).spawn('skeleton', mid.x + 1.2, mid.y, 0, 0, false, inner(g).rng);
  assert.ok(inner(g).shutIn(near) && inner(g).shutIn(sk), 'what is in the gated room is shut in');
  inner(g).blast(0, mid.x - 0.8, mid.y, 2.6, 1, 'blast');
  assert.deepEqual([near.life, near.state], [near.maxLife, 'sleep'], 'a blast against the gate does not touch what stands just behind it');
});

test('the hero pulls the lever by walking up to it: the gate rises, its doorway is open, and it stays up; no monster pulls one', () => {
  const g = hall();
  const L = g.level;
  const f = L.floor;
  const h = g.hero;
  const gate = gatesOf(g, 1, 'gate')[0];
  const p = lever(g);
  // a monster awake beside the lever for two seconds: it is not pulled
  const m = inner(g).spawn('skeleton', p.x, p.y + 1, 0, 0, false, inner(g).rng);
  inner(g).wakeUp(m);
  put(g, p.x, p.y + 3.5);
  steps(g, 120);
  assert.equal(p.state, 0, 'a monster beside a lever does not pull it');
  m.dead = true;
  // the hero three and a half tiles from it: not pulled; he walks at it
  assert.ok(Math.hypot(h.x - p.x, h.y - p.y) > LEVER_NEAR);
  const c = emptyControls();
  c.my = -1;
  const events: GameEvent[] = [];
  let pulledAt = -1;
  for (let k = 0; k < 240 && pulledAt < 0; k++) {
    g.events.length = 0;
    g.update(DT, c);
    events.push(...g.events);
    if (p.state === 1) pulledAt = Math.hypot(h.x - p.x, h.y - p.y);
  }
  assert.ok(pulledAt > 0, 'walking up to the lever pulls it');
  assert.ok(pulledAt < LEVER_NEAR && pulledAt > LEVER_NEAR - 0.3, `as he comes within its reach (${pulledAt.toFixed(2)} tiles off)`);
  assert.equal(gate.want, 1, 'its gate begins to rise');
  for (const i of doorTiles(f, gate.spot)) assert.deepEqual([L.walk[i], L.open[i]], [1, 1], 'and its doorway is open at once to walking, shots and sight');
  assert.equal(events.filter((e) => e.t === 'door' && e.kind === 'rise').length, 1);
  assert.equal(said(events, 'A gate rises.'), 1);
  steps(g, Math.ceil(GATE_RISE * 60) + 2);
  assert.equal(gate.open, 1, 'it is up');
  // it stays up: he walks away and back, and through it into the gated room
  const mid = doorMiddle(gate.spot);
  put(g, mid.x - 3, mid.y);
  const east = emptyControls();
  east.mx = 1;
  for (let k = 0; k < 300 && h.x < mid.x + 2.5; k++) g.update(DT, east);
  assert.ok(within(room(g, 1), h), `he walks through into the gated room (he is at ${h.x.toFixed(1)}, ${h.y.toFixed(1)})`);
  assert.deepEqual([gate.open, gate.want], [1, 1]);
  // and what is in that room is in his reach again
  const sk = inner(g).spawn('skeleton', mid.x + 4, mid.y, 0, 0, false, inner(g).rng);
  put(g, mid.x - 3, mid.y);
  assert.ok(!inner(g).shutIn(sk), 'with the gate up nothing in the room is shut in');
});

test('a room that locks: walked through freely while its pack is dead or away; its gates fall when the hero is well inside with its pack, hold him in and the rest out, and rise when the pack is dead', () => {
  const g = hall();
  const L = g.level;
  const f = L.floor;
  const h = g.hero;
  inner(g).pullLever(lever(g));
  const r = room(g, 3);
  const gates = gatesOf(g, 3, 'trapgate');
  assert.equal(gates.length, 2);
  const west = gates.find((d) => !d.spot.alongX) as DoorInst;
  const midW = doorMiddle(west.spot);
  const pack = f.packs.findIndex((q) => q.roomId === 3);
  assert.ok(pack >= 0);
  // NO PACK IN IT: he stands in the middle of the room for a second, and the gates are up
  put(g, r.x + 5.5, r.y + 6.5);
  let events = steps(g, 60);
  assert.ok(gates.every((d) => d.want === 1), 'with none of its pack in it, the room does not lock');
  // THREE OF ITS PACK IN IT, in the far corner. The hero a tile inside the doorway: not clear of it
  const pk = [0, 1, 2].map((k) => inner(g).spawn('skeleton', r.x + r.w - 1.5, r.y + 1.5 + k, pack, 0, false, inner(g).rng));
  put(g, r.x + 1, midW.y);
  events = steps(g, 30);
  assert.ok(gates.every((d) => d.want === 1), 'a tile inside the doorway he is not clear of it: the gates are up');
  // clear of every doorway: LOCK_CLEAR from the middle of each
  put(g, midW.x + LOCK_CLEAR + 0.3, midW.y);
  events = steps(g, 2);
  assert.ok(gates.every((d) => d.want === 0), 'inside, clear of every doorway, with its pack: every gate of the room falls');
  assert.equal(events.filter((e) => e.t === 'door' && e.kind === 'fall').length, 2);
  assert.equal(said(events, 'The gates fall.'), 1);
  for (const d of gates) for (const i of doorTiles(f, d.spot)) assert.deepEqual([L.walk[i], L.open[i]], [0, 0], 'a fallen gate\'s doorway is wall');
  // he walks at the gate he came in by for three seconds: held
  const c = emptyControls();
  c.mx = -1;
  steps(g, 180, c);
  assert.ok(within(r, h), `the gates hold him in (he is at ${h.x.toFixed(2)}, ${h.y.toFixed(2)})`);
  // something awake outside, in the way on from the gated room, cannot come in; the pack, awake, cannot go out
  const outside = inner(g).spawn('skeleton', midW.x - 2, midW.y, 0, 0, false, inner(g).rng);
  inner(g).wakeUp(outside);
  inner(g).wakeUp(pk[0]);
  put(g, r.x + 3, midW.y);
  steps(g, 300);
  assert.ok(!within(r, outside), 'what is outside stays outside');
  assert.ok(pk.every((m) => within(r, m)), 'and the pack stays in');
  assert.ok(gates.every((d) => d.want === 0), 'the gates are down while one of the pack lives in the room');
  // two of the three die: still down. The last dies: they rise
  inner(g).damageMonster(pk[0], 1e6, 'phys', false, 0);
  inner(g).damageMonster(pk[1], 1e6, 'phys', false, 0);
  events = steps(g, 5);
  assert.ok(pk[0].dead && pk[1].dead && gates.every((d) => d.want === 0));
  inner(g).damageMonster(pk[2], 1e6, 'phys', false, 0);
  events = steps(g, 2);
  assert.ok(gates.every((d) => d.want === 1), 'the last of the pack is dead: the gates rise');
  assert.equal(events.filter((e) => e.t === 'door' && e.kind === 'rise').length, 2);
  assert.equal(said(events, 'The gates rise.'), 1);
  for (const d of gates) for (const i of doorTiles(f, d.spot)) assert.deepEqual([L.walk[i], L.open[i]], [1, 1]);
  // and they do not fall again for what is left outside, nor for him alone
  outside.dead = true;
  events = steps(g, 120);
  assert.ok(gates.every((d) => d.want === 1));
});

test('a hero who keeps to the walls of a room that locks does not walk through it: its gates fall as soon as he is clear of the doorway he came in by', () => {
  const g = hall();
  const f = g.level.floor;
  const h = g.hero;
  inner(g).pullLever(lever(g));
  const r = room(g, 3);
  const gates = gatesOf(g, 3, 'trapgate');
  const west = gates.find((d) => !d.spot.alongX) as DoorInst;
  const midW = doorMiddle(west.spot);
  const pack = f.packs.findIndex((q) => q.roomId === 3);
  inner(g).spawn('skeleton', r.x + r.w - 1.5, r.y + 1.5, pack, 0, false, inner(g).rng);
  // in by the west doorway, and at once along the west wall, a third of a tile from it, toward the way on in the south wall
  put(g, r.x + 0.4, midW.y);
  const c = emptyControls();
  c.my = 1;
  let fellAt = -1;
  for (let k = 0; k < 240 && fellAt < 0; k++) {
    g.update(DT, c);
    if (gates.every((d) => d.want === 0)) fellAt = Math.hypot(h.x - midW.x, h.y - midW.y);
  }
  assert.ok(fellAt > 0, 'the gates fell while he walked along the wall');
  assert.ok(fellAt >= LOCK_CLEAR && fellAt < LOCK_CLEAR + 0.3, `when he was clear of the doorway he came in by (${fellAt.toFixed(2)} tiles from the middle of it)`);
  assert.ok(within(r, h));
});

test('one of the pack that was drawn out of the room before its gates fell does not keep them down; and with the whole pack outside they do not fall', () => {
  const g = hall();
  const f = g.level.floor;
  inner(g).pullLever(lever(g));
  const r = room(g, 3);
  const gates = gatesOf(g, 3, 'trapgate');
  const west = gates.find((d) => !d.spot.alongX) as DoorInst;
  const midW = doorMiddle(west.spot);
  const pack = f.packs.findIndex((q) => q.roomId === 3);
  // the whole pack outside the room (two of them, asleep in corners of the gated room, out of his sight): he is well inside, and nothing falls
  const r1 = room(g, 1);
  const out1 = inner(g).spawn('skeleton', r1.x + 1.5, r1.y + 1.5, pack, 0, false, inner(g).rng);
  const out2 = inner(g).spawn('skeleton', r1.x + 1.5, r1.y + r1.h - 1.5, pack, 0, false, inner(g).rng);
  void midW;
  put(g, r.x + 5, r.y + 6);
  steps(g, 30);
  assert.ok(gates.every((d) => d.want === 1), 'with all of its pack outside it, the room does not lock');
  // one of them inside: they fall
  out2.x = r.x + r.w - 1.5;
  out2.y = r.y + 1.5;
  steps(g, 2);
  assert.ok(gates.every((d) => d.want === 0), 'with one of them inside, it does');
  // that one dies: they rise, though the other lives outside
  inner(g).damageMonster(out2, 1e6, 'phys', false, 0);
  steps(g, 2);
  assert.ok(out2.dead && !out1.dead);
  assert.ok(gates.every((d) => d.want === 1), 'the one inside is dead: the gates rise, though one of the pack lives outside');
});

test('the playtests\' own player, with a gate down: it kills what it can come to, pulls the lever, and goes on to what was behind the gate', () => {
  const g = hall();
  const h = g.hero;
  const gate = gatesOf(g, 1, 'gate')[0];
  const mid = doorMiddle(gate.spot);
  // one skeleton in the first room, one behind the gate (nearer by the straight line than the lever is)
  const here = inner(g).spawn('skeleton', h.x + 3, h.y + 2, 0, 0, false, inner(g).rng);
  const behind = inner(g).spawn('skeleton', mid.x + 3, mid.y, 0, 0, false, inner(g).rng);
  const st = newBot(false, false);
  const c = emptyControls();
  let pulledAt = -1;
  let killedHere = -1;
  let t = 0;
  for (; t < 90 && !behind.dead; t += DT) {
    botStep(g, c, st, DT);
    g.update(DT, c);
    if (killedHere < 0 && here.dead) killedHere = t;
    if (pulledAt < 0 && lever(g).state === 1) pulledAt = t;
  }
  assert.ok(killedHere >= 0, 'it killed the one it could come to');
  assert.ok(pulledAt >= 0, `it went and pulled the lever (${pulledAt.toFixed(1)} s)`);
  assert.ok(killedHere <= pulledAt, 'in that order');
  assert.ok(behind.dead, `and then went through the gate and killed what was behind it (${t.toFixed(1)} s)`);
});

// =================================================================================================
// STEP 2: THE MAP-MAKER. The switch is off in the game; these tests set it for themselves.

/** The map-maker's switch for the mix (and for doors), set for the length of a test and put back. */
function mixed<T>(on: boolean, run: () => T): T {
  const was = { ...MIX };
  const doors = DOORS.on;
  MIX.on = on;
  DOORS.on = true;
  try {
    return run();
  } finally {
    Object.assign(MIX, was);
    DOORS.on = doors;
  }
}
/** The floor tiles that can be come to from the level's start, side steps only, with these tiles shut. */
function cameTo(f: Floor, shut: ReadonlySet<number>): Uint8Array {
  const out = new Uint8Array(f.w * f.h);
  const queue = [Math.floor(f.start.y) * f.w + Math.floor(f.start.x)];
  out[queue[0]] = 1;
  for (let q = 0; q < queue.length; q++) {
    const i = queue[q];
    for (const j of [i + 1, i - 1, i + f.w, i - f.w]) {
      if (j < 0 || j >= out.length || out[j] === 1 || f.tiles[j] !== T_FLOOR || shut.has(j)) continue;
      out[j] = 1;
      queue.push(j);
    }
  }
  return out;
}
const tilesOf = (f: Floor, d: DoorSpot): number[] => {
  const line = d.out > 0 ? d.plane : d.plane - 1;
  return [0, 1, 2].map((k) => (d.alongX ? line * f.w + d.a + k : (d.a + k) * f.w + line));
};
const middleOf = (f: Floor, r: Room): number => Math.floor(r.y + r.h / 2) * f.w + Math.floor(r.x + r.w / 2);
const apart = (a: Room, b: Room): number => Math.max(Math.max(b.x - (a.x + a.w - 1), a.x - (b.x + b.w - 1)) - 1, Math.max(b.y - (a.y + a.h - 1), a.y - (b.y + b.h - 1)) - 1);

/** A dungeon's fingerprint: everything of the Floor the map-maker lays, in a fixed order (the scratchpad's mix/fingerprint.ts took 18.8's with the same). */
function fingerprint(f: Floor): string {
  let h = 0x811c9dc5;
  const add = (n: number): void => {
    for (const k of [0, 8, 16, 24]) {
      h ^= (n >>> k) & 0xff;
      h = Math.imul(h, 0x01000193);
    }
  };
  const str = (t: string): void => {
    for (let i = 0; i < t.length; i++) add(t.charCodeAt(i));
    add(-1);
  };
  const arr = (a: ArrayLike<number> | undefined): void => {
    if (!a) {
      add(-2);
      return;
    }
    add(a.length);
    for (let i = 0; i < a.length; i++) add(a[i]);
  };
  add(f.depth);
  add(f.seed);
  add(f.w);
  add(f.h);
  arr(f.tiles);
  arr(f.height);
  arr(f.stair);
  arr(f.cut);
  arr(f.variant);
  for (const r of f.rooms) {
    add(r.id);
    add(r.x);
    add(r.y);
    add(r.w);
    add(r.h);
    str(r.kind);
    add(r.path);
    add((r.gated ? 1 : 0) + (r.locks ? 2 : 0) + (r.nook ? 4 : 0) + (r.nextDoor ? 8 : 0));
  }
  add(Math.round(f.start.x * 2));
  add(Math.round(f.start.y * 2));
  add(Math.round(f.boss.x * 2));
  add(Math.round(f.boss.y * 2));
  for (const p of f.packs) {
    add(Math.round(p.x * 2));
    add(Math.round(p.y * 2));
    add(p.roomId);
    add(p.size);
    str(p.tier);
  }
  for (const p of f.props) {
    str(p.kind);
    add(p.x);
    add(p.y);
  }
  for (const d of f.doors ?? []) {
    str(d.kind);
    add(d.room);
    add(d.alongX ? 1 : 0);
    add(d.near ? 1 : 0);
    add(d.a);
    add(d.plane);
    add(d.out);
  }
  for (const l of f.levers ?? []) {
    add(l.x);
    add(l.y);
    add(l.room);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

test('with the switch off a dungeon is Version 18.8\'s to the letter: the fingerprints of nine of them, taken from 18.8 as it was frozen for release', () => {
  // (depth, seed, the fingerprint 18.8 gave: everything of the Floor, its tiles, heights, cuts, art
  // dice, rooms, packs, props and doors. Taken on 8 Oct 2026 at 00:55 from the frozen copy of 18.8;
  // until then 18.7's, from its frozen copy, which the same tool still gives for that copy.)
  const was: ReadonlyArray<readonly [number, number, string]> = [
    [1, 3, '41394156'],
    [1, 104877239, 'b7ec0d05'],
    [2, 6, 'f1935dc1'],
    [3, 11, '33d85f2c'],
    [4, 14, '7d5bb30a'],
    [5, 21, '068c4bd2'],
    [6, 8, '2d877563'],
    [9, 4242, 'c815fa35'],
    [12, 7, '78c5a287'],
  ];
  // (and with the traps off: game/traps.ts lays its sealed vaults and its spike floors and dart walls from the second dungeon, since his yes of 8 Oct, 11:36)
  const wasTraps = TRAPS.on;
  TRAPS.on = false;
  try {
  mixed(false, () => {
    for (const [depth, seed, print] of was) assert.equal(fingerprint(generateFloor(depth, seed)), print, `dungeon ${depth}, seed ${seed} is the dungeon 18.8 laid`);
  });
  // and with it on, from the second dungeon on, every one of them is another; the first, a new
  // player's lesson, is laid as it always was (not a die of the mix is thrown for it)
  mixed(true, () => {
    for (const [depth, seed, print] of was) {
      if (depth >= 2) assert.ok(fingerprint(generateFloor(depth, seed)) !== print, `with the mix on, dungeon ${depth}, seed ${seed} is another`);
      else assert.equal(fingerprint(generateFloor(depth, seed)), print, `with the mix on, the first dungeon of seed ${seed} is the dungeon it was`);
    }
  });
  } finally {
    TRAPS.on = wasTraps;
  }
});

test('the switch is on in the game (Version 18.9): from the second dungeon a gate with its lever; and with it off no dungeon has a gate with a lever, a room that locks or two rooms next door', () => {
  assert.equal(MIX.on, true, 'the owner, 8 Oct 2026, 07:32, of its pictures in a real dungeon: "Yeah looks good"');
  for (const [depth, seed] of [[2, 6], [4, 11], [7, 21]] as const) {
    const f = generateFloor(depth, seed);
    assert.ok(f.levers !== undefined && f.levers.length === 1 && (f.doors ?? []).some((d) => d.kind === 'gate'), `dungeon ${depth}, seed ${seed}: a gate and its lever`);
  }
  mixed(false, () => {
    for (const [depth, seed] of [[1, 3], [2, 6], [4, 11], [7, 21]] as const) {
      const f = generateFloor(depth, seed);
      assert.equal(f.levers, undefined);
      assert.ok(!f.rooms.some((r) => r.gated || r.locks || r.nook || r.nextDoor));
      assert.ok(!(f.doors ?? []).some((d) => d.kind === 'gate' || d.kind === 'trapgate'));
      assert.ok(!f.props.some((p) => p.kind === 'lever'));
      for (const a of f.rooms) for (const b of f.rooms) if (a.id < b.id) assert.ok(apart(a, b) >= 4, 'rooms are four tiles apart and more');
    }
  });
});

test('with the mix on, in every dungeon from the second: the lever can be come to with its gate down and the gated room cannot; the room that locks holds; rooms next door are three apart with a door between; and the first dungeon has none of it', () => {
  let dungeons = 0;
  let withGate = 0;
  let withLock = 0;
  let pairs = 0;
  let joints = 0;
  mixed(true, () => {
    for (let seed = 1; seed <= 6; seed++) {
      const f = generateFloor(1, seed * 13);
      assert.ok(!f.levers && !f.rooms.some((r) => r.gated || r.locks || r.nook) && !(f.doors ?? []).some((d) => d.kind === 'gate' || d.kind === 'trapgate'), 'Dungeon 1 has no gate with a lever and no room that locks');
    }
    for (let depth = 2; depth <= 7; depth++) {
      for (let seed = 1; seed <= 25; seed++) {
        const f = generateFloor(depth, seed * 7 + depth);
        const doors = f.doors ?? [];
        const where = `dungeon ${depth}, seed ${seed * 7 + depth}`;
        dungeons++;
        const inRoom = new Uint8Array(f.w * f.h);
        for (const r of f.rooms) for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) inRoom[y * f.w + x] = 1;
        // every room can be come to when nothing is shut
        const all = cameTo(f, new Set());
        for (const r of f.rooms) assert.equal(all[middleOf(f, r)], 1, `${where}: room ${r.id} can be come to`);

        // A GATE AND ITS LEVER
        const gated = f.rooms.filter((r) => r.gated);
        const nooks = f.rooms.filter((r) => r.nook);
        const gates = doors.filter((d) => d.kind === 'gate');
        assert.ok(gated.length <= 1 && nooks.length === gated.length && gates.length === gated.length && (f.levers ?? []).length === gated.length, `${where}: one gate, one lever, one nook, or none of them`);
        if (gated.length === 1) {
          withGate++;
          const room = gated[0];
          const lever = (f.levers as { x: number; y: number; room: number }[])[0];
          assert.ok(room.kind !== 'boss' && room.kind !== 'start' && room.path >= 2, `${where}: the gated room is on the main path, past the first room after the start, and is not the boss's hall`);
          assert.equal(gates[0].room, room.id, `${where}: the gate stands in the gated room's own way in`);
          assert.equal(lever.room, room.id);
          assert.equal(f.props.filter((p) => p.kind === 'lever').length, 1);
          assert.ok(f.props.some((p) => p.kind === 'lever' && p.x === lever.x && p.y === lever.y), `${where}: a lever stands where the level says`);
          const nook = nooks[0];
          assert.ok(lever.x >= nook.x && lever.y >= nook.y && lever.x < nook.x + nook.w && lever.y < nook.y + nook.h, `${where}: in the nook`);
          assert.ok(nook.path === -1 && nook.w >= 5 && nook.h >= 5 && nook.w <= 7 && nook.h <= 7, `${where}: the nook is a small room off the path (${nook.w} by ${nook.h})`);
          assert.ok(f.packs.some((p) => p.roomId === nook.id), `${where}: with a pack in it`);
          // with the gate down: the lever's side can be walked to, the gated room and the boss cannot
          const shut = cameTo(f, new Set(tilesOf(f, gates[0])));
          const i = lever.y * f.w + lever.x;
          assert.ok([i + 1, i - 1, i + f.w, i - f.w].some((j) => shut[j] === 1), `${where}: THE LEVER CAN BE COME TO WITH ITS GATE DOWN`);
          assert.equal(shut[middleOf(f, room)], 0, `${where}: the gated room cannot`);
          assert.equal(shut[Math.floor(f.boss.y) * f.w + Math.floor(f.boss.x)], 0, `${where}: nor the boss`);
        }

        // A ROOM THAT LOCKS
        const locking = f.rooms.filter((r) => r.locks);
        assert.ok(locking.length <= 1);
        assert.equal(doors.filter((d) => d.kind === 'trapgate').length > 0, locking.length === 1);
        if (locking.length === 1) {
          withLock++;
          const room = locking[0];
          assert.ok(room.kind === 'elite' && room.path >= 2 && !room.gated, `${where}: the room that locks is an elite room of the main path, and not the gated one`);
          const own = doors.filter((d) => d.kind === 'trapgate');
          assert.ok(own.every((d) => d.room === room.id) && own.length >= 2, `${where}: its gates are its own, two and more (${own.length})`);
          assert.equal(own.length, doorways(f, room, inRoom).length, `${where}: one in every doorway of it`);
          assert.ok(!doors.some((d) => d.kind === 'door' && d.room === room.id), `${where}: and no door`);
          // with its gates down nothing leaves it: from its middle, only its own floor can be come to
          const shut = new Set<number>();
          for (const d of own) for (const t of tilesOf(f, d)) shut.add(t);
          const held = new Uint8Array(f.w * f.h);
          const queue = [middleOf(f, room)];
          held[queue[0]] = 1;
          for (let q = 0; q < queue.length; q++) {
            const k = queue[q];
            for (const j of [k + 1, k - 1, k + f.w, k - f.w]) {
              if (held[j] === 1 || f.tiles[j] !== T_FLOOR || shut.has(j)) continue;
              held[j] = 1;
              queue.push(j);
            }
          }
          for (let j = 0; j < held.length; j++) {
            if (held[j] !== 1) continue;
            const x = j % f.w;
            const y = Math.floor(j / f.w);
            assert.ok(x >= room.x && y >= room.y && x < room.x + room.w && y < room.y + room.h, `${where}: THE ROOM THAT LOCKS DOES NOT HOLD: from its middle, with its gates down, ${x}, ${y} can be come to`);
          }
        }

        // ROOMS NEXT DOOR: three tiles apart and never nearer; a door stands between the two
        for (const a of f.rooms) {
          for (const b of f.rooms) {
            if (a.id >= b.id) continue;
            const gap = apart(a, b);
            assert.ok(gap >= 3, `${where}: rooms ${a.id} and ${b.id} are ${gap} apart`);
            if (gap !== 3) continue;
            pairs++;
            assert.ok(!a.locks && !b.locks, `${where}: a room that locks has no room next door`);
            // (and the door between them is always there, whatever the share of rooms with a door: Version 18.8's `hasDoor`)
            const far = b.nextDoor ? b : a.nextDoor ? a : null;
            assert.ok(far !== null, `${where}: of rooms ${a.id} and ${b.id}, next door, the later is marked as set down next door`);
            assert.ok((f.doors ?? []).some((d) => far !== null && d.room === far.id && d.kind === 'door'), `${where}: a door stands between rooms ${a.id} and ${b.id}`);
          }
        }
        joints += f.rooms.length - 1;
      }
    }
  });
  console.log(`the mix in ${dungeons} dungeons: ${withGate} with a gate and its lever, ${withLock} with a room that locks, ${pairs} pairs of rooms next door in ${joints} joints`);
  assert.ok(withGate >= dungeons * 0.9, `nearly every dungeon has its gate (${withGate} of ${dungeons})`);
  assert.ok(withLock >= dungeons * 0.8, `and most a room that locks (${withLock} of ${dungeons})`);
  assert.ok(pairs >= joints * 0.08 && pairs <= joints * 0.25, `about one joint in six is two rooms next door (${pairs} of ${joints})`);
});

test('with the mix on, whatever is shut in cannot come at the hero: in real dungeons with all their monsters, nothing the rule puts out of his reach can reach him but through a shut door or a lever\'s gate that is down; the hero is set down only where he could have walked', () => {
  let asked = 0;
  let behindGate = 0;
  let pulled = 0;
  for (const [seed, depth] of [[6, 2], [11, 3], [14, 4], [21, 5], [8, 6], [9, 3]] as const) {
    const g = mixed(true, () => {
      const q = new Game('warrior', seed);
      q.depth = depth;
      q.enterDungeon();
      q.hero.invuln = 1e9;
      return q;
    });
    const L = g.level;
    const f = L.floor;
    const h = g.hero;
    const inLine = (s: DoorSpot, by: number): { x: number; y: number } => (s.alongX ? { x: s.a + 1.5, y: s.plane - s.out * by } : { x: s.plane - s.out * by, y: s.a + 1.5 });
    // where a body can be come to from the hero: `walking`, on foot (through doors, which open for
    // him; not through a gate that is down, whose tiles are neither walked nor seen through); else
    // walked or flown over, and not through a shut door
    const reached = (walking: boolean): Uint8Array => {
      const out = new Uint8Array(f.w * f.h);
      const ok = (i: number): boolean => (walking ? L.walk[i] === 1 : (L.walk[i] === 1 || L.open[i] === 1) && !(L.shut !== null && L.shut[i] === 1));
      const queue = [Math.floor(h.y) * f.w + Math.floor(h.x)];
      out[queue[0]] = 1;
      for (let q = 0; q < queue.length; q++) {
        const i = queue[q];
        for (const j of [i + 1, i - 1, i + f.w, i - f.w]) {
          if (j < 0 || j >= out.length || out[j] === 1 || !ok(j)) continue;
          out[j] = 1;
          queue.push(j);
        }
      }
      return out;
    };
    const check = (when: string): number => {
      const can = reached(false);
      let n = 0;
      for (const m of g.monsters) {
        if (m.dead || !inner(g).shutIn(m)) continue;
        n++;
        assert.equal(can[Math.floor(m.y) * f.w + Math.floor(m.x)], 0, `dungeon ${depth}, seed ${seed}, ${when}: a ${m.kind} at ${m.x.toFixed(1)}, ${m.y.toFixed(1)} is out of the hero's reach, and could come to him without passing a shut door or a gate that is down: A ROOM HAS A SECOND WAY IN, and \`shutIn\` in game.ts must ask something else`);
        if (L.doors.some((d) => d.spot.kind === 'gate' && d.want === 0 && within(room(g, d.spot.room), m))) behindGate++;
      }
      return n;
    };
    asked += check('as the run begins');
    // the hero is set down before one door after another, the nearest the start first; where the
    // way to a door is barred by the lever's gate he pulls the lever first, as a player must
    const far = new Int32Array(f.w * f.h).fill(-1);
    const first = [Math.floor(f.start.y) * f.w + Math.floor(f.start.x)];
    far[first[0]] = 0;
    for (let q = 0; q < first.length; q++) {
      const i = first[q];
      for (const j of [i + 1, i - 1, i + f.w, i - f.w]) {
        if (j < 0 || j >= far.length || far[j] >= 0 || f.tiles[j] !== T_FLOOR) continue;
        far[j] = far[i] + 1;
        first.push(j);
      }
    }
    const middle = (d: DoorInst): number => Math.floor(doorMiddle(d.spot).y) * f.w + Math.floor(doorMiddle(d.spot).x);
    const order = L.doors.filter((d) => d.spot.kind === 'door').sort((a, b) => far[middle(a)] - far[middle(b)]);
    let opened = 0;
    for (const d of order) {
      if (opened >= 5) break;
      const p = inLine(d.spot, -2);
      const at = Math.floor(p.y) * f.w + Math.floor(p.x);
      if (L.walk[at] !== 1) continue;
      if (reached(true)[at] !== 1) {
        const lv = lever(g);
        if (lv && lv.state === 0) {
          inner(g).pullLever(lv);
          steps(g, Math.ceil(GATE_RISE / DT) + 5);
          pulled++;
        }
        // (beyond a room that locks, its gates down: not come to now)
        if (reached(true)[at] !== 1) continue;
      }
      g.hero.x = p.x;
      g.hero.y = p.y;
      g.hero.move = null;
      steps(g, 2);
      assert.equal(d.want, 1, 'the door opens for him');
      asked += check(`with ${opened + 1} of its doors opened`);
      opened++;
    }
    assert.ok(opened >= 3, `dungeon ${depth}, seed ${seed}: ${opened} doors walked up to`);
  }
  assert.ok(asked > 200, `${asked} monsters asked about`);
  assert.ok(behindGate > 0 && pulled > 0, `some of them behind a lever's gate that was down (${behindGate}), and the lever pulled to go on (${pulled} times)`);
});

test('with the mix on, the map-maker\'s other rules hold: the map is square and no larger than 160; the main path is as long as ever; at most one room more off it (the lever\'s nook); rooms 7x7 to 14x12, but the nook, which is smaller', () => {
  const pathRooms = (depth: number): number => Math.min(15, 11 + Math.floor((depth - 1) / 2));
  const branches = (depth: number): number => (depth <= 2 ? 3 : depth <= 5 ? 4 : 5);
  let nooks = 0;
  mixed(true, () => {
    for (let depth = 2; depth <= 9; depth++) {
      for (let k = 0; k < 8; k++) {
        const seed = depth * 1000 + k * 7919 + 1;
        const f = generateFloor(depth, seed);
        const where = `dungeon ${depth}, seed ${seed}`;
        assert.ok(f.w === f.h && f.w <= 160, `${where}: the map is ${f.w} by ${f.h}`);
        const path = f.rooms.filter((r) => r.path >= 0);
        assert.equal(path.length, pathRooms(depth), `${where}: the main path`);
        const off = f.rooms.length - path.length;
        assert.ok(off >= branches(depth) && off <= 2 * branches(depth) + 1, `${where}: ${off} rooms on side branches`);
        for (const r of f.rooms) {
          const long = Math.max(r.w, r.h);
          const short = Math.min(r.w, r.h);
          if (r.nook) {
            nooks++;
            assert.ok(short >= 5 && short <= 6 && long >= 6 && long <= 7, `${where}: the nook is ${r.w}x${r.h}`);
          } else if (short < 7) {
            // (a nook whose lever found no place is a small dead end like any other, and is not marked)
            assert.ok(short >= 5 && long <= 7 && r.path < 0 && !f.levers, `${where}: room ${r.id} is ${r.w}x${r.h}`);
          } else assert.ok(short <= 12 && long <= 14, `${where}: room ${r.id} is ${r.w}x${r.h}`);
        }
      }
    }
  });
  assert.ok(nooks >= 50, `${nooks} nooks looked at`);
});

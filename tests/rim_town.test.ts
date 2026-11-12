// THE ENDLESS TOWN, THE SHAFT'S RIM, LAID AS A TOWN (src/game/rim.ts; behind ENDLESS_TOWN, src/art/shaft_rim.ts, off). His words,
// 11 Nov 2026: “A town that is different from the two we currently have, with all the bells and whistles needed for the endless
// run.”; his picks by 15:40, when it is his town, “Once endless opens (Recommended)”, what the record stone's notches count,
// “Every endless level (Recommended)”; of the record stone and the trophies wall, “Keep both (Recommended)”.
//   1. the switch is off, and off the game is as it was: endless open, home is the game's own town, nothing of the rim saved;
//   2. on, the last floor beaten: home is the Shaft's Rim: he stands before its gate, on its floor; its waypoint is awake and
//      leads to the endless level he has reached; the hall's and the camp's looks are not its own;
//   3. the place: as the art laid it: each of the town's things on its tile, the gate, the record and the trophies wall
//      standing on theirs; its seven services, each where it can be used; the game's own towns untouched;
//   4. the record stone: a notch for each endless level reached, cut as he comes home, the newest glowing that visit only; at
//      most its seventy; what is written over it; kept in the save;
//   5. the trophies wall: its mounts empty until the tablet's quarters are built; which mount is which boss's;
//   6. the gate: used here (the game's other gates are walked through); its words go into the next endless level, floor 1 as
//      one too; in at its panel is down to the level reached, the words burned into it;
//   7. walking: never over the drop but out on the tongue and its landing; the round things hold him by their round; the
//      torches on posts hold nobody; a step a round thing refuses is taken round it;
//   8. a touch's errand: from where he wakes, and from every service, to every other and to the waypoint: he gets there, by a
//      way not much longer than round the pit; into the wordsmith's ring from the Lexicon's side by a few tiles; from hard by
//      the brink too;
//   9. the finer grid: every open cell a place his whole body may stand, anywhere in it.
//   run: tsx --test tests/rim_town.test.ts

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { RECORD_ROOM, TROPHY_BOSSES, rimPieces } from '../src/art/shaft_props';
import { ENDLESS_TOWN, LANDING, RIM, onTongue, rimPlace } from '../src/art/shaft_rim';
import { lastFloor } from '../src/game/act1';
import { isCamp } from '../src/game/camp';
import { castleHere } from '../src/game/castle_way';
import { TUNE } from '../src/game/defs';
import { ENDLESS, endlessName } from '../src/game/endless';
import { Game } from '../src/game/game';
import { fineDir, fineGoal, flowField, lineOfSight } from '../src/game/nav';
import { BRINK, ERRAND, RIM_ARRIVE, RIM_AT, RIM_NAME, RIM_RULES, isRim, makeRim, notchesFor, onWayOut, recordLine, rimHolds, roundStep, trophyOf } from '../src/game/rim';
import type { Level, Station } from '../src/game/state';
import { T_FLOOR } from '../src/game/types';
import { WAYS } from '../src/game/ways';
import { seasoned } from './helpers';

type Take = { takeWay(t: string): void };
const take = (g: Game, to: string): void => (g as unknown as Take).takeWay(to);

function town<T>(fn: () => T, on = true): T {
  const was = ENDLESS_TOWN.on;
  const wasE = ENDLESS.on;
  ENDLESS_TOWN.on = on;
  ENDLESS.on = true;
  try {
    return fn();
  } finally {
    ENDLESS_TOWN.on = was;
    ENDLESS.on = wasE;
  }
}

/** A seasoned hero on the last floor built, about to beat it. */
function atTheLast(seed: number): Game {
  const g = seasoned(new Game('warrior', seed), 30);
  g.depth = lastFloor();
  g.cleared = lastFloor() - 1;
  g.wayDepth = lastFloor();
  g.enterDungeon();
  return g;
}
/** A hero home at the Shaft's Rim with `n` endless levels reached. */
function home(seed: number, n = 1): Game {
  const g = atTheLast(seed);
  take(g, 'on');
  if (n > 1) {
    g.endless = n;
    g.enterTown();
  }
  return g;
}
const R = TUNE.heroRadius;
const stands = (g: Game, x: number, y: number): boolean => g.free(g.level.walk, x, y, R);

test('the switch is off; off, endless open, home is the game\'s own town, as it was, and nothing of the rim is saved', () => {
  assert.equal(ENDLESS_TOWN.on, false, 'off until his yes to pictures of it from the game');
  town(() => {
    const g = atTheLast(3);
    take(g, 'on');
    assert.ok(g.level.town, 'home to town');
    assert.equal(g.endless, 1, 'endless open');
    assert.ok(!isRim(g.level) && !g.level.rim, 'not the Shaft\'s Rim');
    assert.equal(g.rimTown(), false);
    assert.equal(isCamp(g.level), g.campTown(), 'the camp or the first town, as his way has it');
    assert.equal(g.level.errand, undefined, 'no finer grid: an errand goes by the tiles');
    assert.ok(!('rimSeen' in g.save()), 'nothing of it in the save');
    assert.ok(!g.events.some((e) => e.t === 'notch'));
  }, false);
});

test('on, the last floor beaten: home is the Shaft\'s Rim: before its gate, on its floor, its waypoint awake and leading on', () => town(() => {
  const g = atTheLast(5);
  g.events.length = 0;
  take(g, 'on');
  const L = g.level;
  assert.ok(L.town && isRim(L), 'home is the Shaft\'s Rim');
  assert.equal(g.rimTown(), true);
  assert.equal(RIM_NAME, "The Shaft's Rim");
  assert.ok(!isCamp(L), 'not the camp');
  assert.equal(castleHere(L), false, 'nor the castle\'s hall');
  const h = g.hero;
  assert.deepEqual([h.x, h.y], [RIM_ARRIVE.x, RIM_ARRIVE.y], 'where he wakes');
  assert.ok(stands(g, h.x, h.y), 'on its floor');
  assert.ok(Math.hypot(h.x - RIM_AT.gate.x, h.y - RIM_AT.gate.y) < 2.2 && h.y > RIM_AT.gate.y, 'before the gate');
  assert.ok(h.fx > 0 && h.fy > 0, 'the pit before him');
  // its waypoint: awake, and it says where it goes
  const W = L.ways!.way!;
  assert.equal(W.awake, true);
  h.x = W.x;
  h.y = W.y;
  assert.ok(stands(g, h.x, h.y), 'the waypoint is stood on');
  assert.equal(g.interactHint(), `Waypoint: to ${endlessName(1)}`);
  take(g, 'way');
  assert.equal(g.inEndless, true);
  assert.equal(g.depth, g.endlessFloor);
  // and home again by it: out of its light, at the stair's head
  take(g, 'warpTown');
  assert.ok(isRim(g.level));
  const W2 = g.level.ways!.way!;
  assert.deepEqual([g.hero.x, g.hero.y], [W2.x, W2.y]);
  // (a practice room's hero has no town of his own)
  assert.equal(WAYS.on, true);
}));

test('the place: as the art laid it; its seven services, each where it can be used', () => {
  const L = makeRim(11, true);
  const P = rimPlace();
  const f = L.floor;
  assert.equal(L.town, true);
  assert.deepEqual([f.w, f.h], [P.w, P.h]);
  // every tile of the art's floor is floor; no wall anywhere (the place has none)
  for (let i = 0; i < f.tiles.length; i++) {
    if (P.walk[i] === 1) assert.equal(f.tiles[i], T_FLOOR, `tile ${i % f.w}, ${Math.floor(i / f.w)}`);
    assert.ok(f.tiles[i] !== 2, 'no wall');
  }
  // the town's own things, each on its tile
  for (const t of P.town) {
    if (t.kind === 'waypoint') {
      assert.deepEqual([L.ways!.way!.x, L.ways!.way!.y], [t.x + 0.5, t.y + 0.5], 'the waypoint is the level\'s way');
      continue;
    }
    const p = L.props.find((q) => q.kind === t.kind && q.tx === t.x && q.ty === t.y);
    assert.ok(p, `${t.kind} at ${t.x}, ${t.y}`);
  }
  assert.equal(L.props.filter((p) => p.kind === 'brazier').length, 6);
  assert.equal(L.props.filter((p) => p.kind === 'runeStone').length, 6);
  // the gate, the record and the trophies wall stand on their tiles; a torch's tile is open
  for (const pc of rimPieces()) for (const [x, y] of pc.blocks) assert.equal(L.walk[y * f.w + x], pc.kind === 'torch' ? 1 : 0, `${pc.kind} at ${x}, ${y}`);
  // its services
  const kinds = L.stations.map((s) => s.kind).sort();
  assert.deepEqual(kinds, ['armourer', 'gate', 'lexicon', 'mystic', 'stash', 'stranger', 'wordsmith']);
  assert.ok(!makeRim(11, false).stations.some((s) => s.kind === 'stranger'), 'the stranger\'s only once the trades are open');
  const gate = L.stations.find((s) => s.kind === 'gate')!;
  assert.ok(gate.y > RIM_AT.gate.y && Math.abs(gate.x - RIM_AT.gate.x) < 0.01, 'the gate\'s is used from the floor before it');
  assert.ok((gate.lift ?? 0) > 100, 'its name over its cap');
  // nothing of the game's own towns is the rim's
  assert.ok(L.rim && !L.land && !L.act1);
  assert.equal(L.ways!.gate, -1);
  assert.equal(L.ways!.stair, null);
});

test('the record stone: a notch for each endless level reached, cut as he comes home, the newest glowing that visit only; kept in the save', () => town(() => {
  const g = atTheLast(7);
  g.events.length = 0;
  take(g, 'on');
  let T = g.level.rim!;
  assert.deepEqual([T.notches, T.fresh, T.reached], [1, true, 1], 'endless opens: the first notch');
  assert.ok(g.events.some((e) => e.t === 'msg' && e.text === 'A notch is cut in the record stone: Endless 1.'));
  const cut = g.events.find((e) => e.t === 'notch');
  assert.ok(cut && cut.t === 'notch' && cut.n === 1 && cut.cut === 1 && cut.x === RIM_AT.record.x && cut.y === RIM_AT.record.y);
  assert.equal(recordLine(T), 'ENDLESS 1');
  // home again with nothing new: no notch, none glowing
  g.events.length = 0;
  g.enterTown();
  T = g.level.rim!;
  assert.deepEqual([T.notches, T.fresh], [1, false]);
  assert.ok(!g.events.some((e) => e.t === 'notch' || (e.t === 'msg' && /notch/.test(e.text))));
  // three levels on (he went from one straight to the next): three more, the newest glowing
  g.endless = 4;
  g.events.length = 0;
  g.enterTown('way');
  T = g.level.rim!;
  assert.deepEqual([T.notches, T.fresh, T.reached], [4, true, 4]);
  const cut3 = g.events.find((e) => e.t === 'notch');
  assert.ok(cut3 && cut3.t === 'notch' && cut3.n === 4 && cut3.cut === 3);
  // kept in the save: come back to, it is cut as far, and none glows
  const s = g.save();
  assert.equal(s.rimSeen, 4);
  const g2 = Game.restore(JSON.parse(JSON.stringify(s)), g.meta);
  assert.ok(isRim(g2.level), 'a saved hero wakes at the Shaft\'s Rim');
  assert.deepEqual([g2.level.rim!.notches, g2.level.rim!.fresh, g2.rimSeen], [4, false, 4]);
  assert.deepEqual([g2.hero.x, g2.hero.y], [RIM_ARRIVE.x, RIM_ARRIVE.y]);
  // a save from before the town (nothing of it kept): its stone is cut to where he is as he first comes in
  const old = JSON.parse(JSON.stringify(s));
  delete old.rimSeen;
  const g3 = Game.restore(old, g.meta);
  assert.deepEqual([g3.level.rim!.notches, g3.level.rim!.fresh, g3.rimSeen], [4, true, 4]);
  // its room: seventy, and past it full
  assert.equal(RIM_RULES.recordRoom, RECORD_ROOM);
  assert.equal(notchesFor(0), 0);
  assert.equal(notchesFor(70), 70);
  assert.equal(notchesFor(83), 70);
  g.endless = 83;
  g.enterTown();
  T = g.level.rim!;
  assert.deepEqual([T.notches, T.reached], [70, 83]);
  assert.equal(recordLine(T), 'ENDLESS 83', 'its name says the level, past what it has room for');
  // his best: where a hero before this one went deeper, it is written too (one past the deepest level cleared)
  g.meta.bestEndless = 11;
  g.endless = 5;
  g.enterTown();
  assert.equal(recordLine(g.level.rim!), 'ENDLESS 5, BEST 12');
  g.endless = 12;
  g.enterTown();
  assert.equal(recordLine(g.level.rim!), 'ENDLESS 12');
}));

test('the trophies wall: its mounts empty until the tablet\'s quarters are built; which mount is which boss\'s', () => town(() => {
  const g = home(9, 6);
  assert.deepEqual(g.level.rim!.held, [false, false, false, false]);
  assert.deepEqual(g.quartersHeld(), [false, false, false, false]);
  assert.deepEqual(TROPHY_BOSSES.map((b) => b.floor), [5, 10, 15, 20]);
  assert.deepEqual([5, 10, 15, 20, 7].map(trophyOf), [0, 1, 2, 3, -1]);
}));

test('the gate: used here; its words go into the next endless level, floor 1 as one too; in at it, the words burned in', () => town(() => {
  assert.equal(RIM_RULES.gateWords, true);
  const g = home(13, 3);
  const h = g.hero;
  const gate = g.level.stations.find((s) => s.kind === 'gate')!;
  h.x = gate.x;
  h.y = gate.y + 0.8;
  assert.ok(stands(g, h.x, h.y));
  assert.equal(g.stationNear(), 'gate', 'the rim\'s gate is used');
  assert.equal(g.interactHint(), 'Gate: words for Endless 3');
  // a word laid on it is in its sockets at once, and one taken back is gone from them
  h.words.power = 1;
  h.words.swift = 1;
  g.depth = 1;
  assert.equal(g.planProblem('power'), null, 'floor 1 as an endless level takes words');
  assert.equal(g.planWord('power'), null);
  assert.deepEqual([...g.level.rim!.words], ['power']);
  assert.equal(g.planWord('swift'), null);
  assert.deepEqual([...g.level.rim!.words], ['power', 'swift']);
  g.unplanWord(0);
  assert.deepEqual([...g.level.rim!.words], ['swift']);
  assert.equal(h.words.power, 1, 'taken back, it is his again');
  // kept in the save, and in its sockets when he comes back to it
  const g2 = Game.restore(JSON.parse(JSON.stringify(g.save())), g.meta);
  assert.deepEqual([...g2.level.rim!.words], ['swift']);
  // in at its panel: down to the level he has reached, the word burned into it
  g.enterEndless();
  assert.ok(!g.level.town);
  assert.equal(g.inEndless, true);
  assert.equal(g.depth, g.endlessFloor);
  assert.equal(g.floorLevel, 'Endless 3');
  assert.deepEqual(g.dungeonWords, ['swift']);
  assert.deepEqual(g.plan, []);
  // (off the rim the game's gates are walked through, not used, as they were)
  town(() => {
    const o = home(13, 3);
    const og = o.level.stations.find((s) => s.kind === 'gate');
    if (og) {
      o.hero.x = og.x;
      o.hero.y = og.y;
      assert.notEqual(o.stationNear(), 'gate');
    }
  }, false);
}));

test('walking: never over the drop but on the tongue and its landing; round things hold him by their round; torches hold nobody', () => town(() => {
  const g = home(17, 2);
  const L = g.level;
  const T = L.rim!;
  // the pit: nowhere inside the brink may he stand, but on the way out
  let inPit = 0;
  let onWay = 0;
  for (let y = 6; y <= 18; y += 0.07) {
    for (let x = 6; x <= 18; x += 0.07) {
      const d = Math.hypot(x - RIM.cx, y - RIM.cy);
      if (d >= BRINK) continue;
      if (!stands(g, x, y)) continue;
      inPit++;
      if (onWayOut(x, y) && onTongue(x, y)) onWay++;
    }
  }
  assert.ok(inPit > 100, 'he may stand out on the tongue and its landing');
  assert.equal(onWay, inPit, 'and nowhere else inside the brink');
  // right up to the kerb, all the way round (but where something stands at the kerb: the wordsmith's ring)
  let at = 0;
  for (let a = 0; a < 360; a += 5) {
    const x = RIM.cx + Math.cos((a * Math.PI) / 180) * (BRINK + 0.01);
    const y = RIM.cy + Math.sin((a * Math.PI) / 180) * (BRINK + 0.01);
    if (stands(g, x, y)) at++;
  }
  assert.ok(at >= 60, `at the kerb at ${at} of 72 places round it`);
  // out on the landing's middle
  assert.ok(stands(g, LANDING[0], LANDING[1]));
  // a standing stone and a brazier: their middles shut, their tiles' corners open (a round, not a tile)
  const rounds = T.rounds.filter((q) => !q.pit);
  assert.equal(rounds.length, 12, 'six standing stones, six braziers');
  for (const q of rounds) {
    assert.ok(!stands(g, q.x, q.y), 'its middle');
    assert.equal(L.walk[Math.floor(q.y) * L.floor.w + Math.floor(q.x)], 1, 'its tile is open: its own round holds him');
    assert.ok(!rimHolds([q], q.x + q.r + R - 0.02, q.y, R) && rimHolds([q], q.x + q.r + R + 0.02, q.y, R), 'held off by its round and no further');
  }
  // the torches on posts hold nobody
  for (const pc of rimPieces()) if (pc.kind === 'torch') assert.ok(stands(g, pc.at[0], pc.at[1]), `the torch at ${pc.at}`);
  // the bulky things hold him by their tiles: the forge, the gate
  const forge = L.props.find((p) => p.kind === 'forge')!;
  assert.ok(!stands(g, forge.x + 0.6, forge.y));
  assert.ok(!stands(g, RIM_AT.gate.x, RIM_AT.gate.y));
  // A STEP A ROUND THING REFUSES IS TAKEN ROUND IT: walked at the pit a little aside of straight, he goes round its brink and never into it
  const h = g.hero;
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2 + 0.2;
    h.x = RIM.cx + Math.cos(a) * 5.2;
    h.y = RIM.cy + Math.sin(a) * 5.2;
    if (!stands(g, h.x, h.y)) continue;
    const from = Math.atan2(h.y - RIM.cy, h.x - RIM.cx);
    let turned = 0;
    for (let i = 0; i < 400; i++) {
      const dx = RIM.cx - h.x;
      const dy = RIM.cy - h.y;
      const d = Math.hypot(dx, dy);
      const sx = (dx / d) * 0.05 - (dy / d) * 0.03;
      const sy = (dy / d) * 0.05 + (dx / d) * 0.03;
      const wasX = h.x;
      const wasY = h.y;
      g.slide(h, R, sx, sy, L.walk);
      if (h.x === wasX && h.y === wasY) {
        const to = roundStep(T.rounds, h.x, h.y, R, sx, sy);
        if (to && stands(g, to.x, to.y)) {
          h.x = to.x;
          h.y = to.y;
        }
      }
      const far = Math.hypot(h.x - RIM.cx, h.y - RIM.cy);
      assert.ok(far >= BRINK - 1e-6 || onWayOut(h.x, h.y), `from ${k}: over the drop at ${h.x.toFixed(2)}, ${h.y.toFixed(2)}`);
      const now = Math.atan2(h.y - RIM.cy, h.x - RIM.cx);
      turned = Math.max(turned, Math.abs(Math.atan2(Math.sin(now - from), Math.cos(now - from))));
    }
    assert.ok(turned > 0.15, `from ${k}: he goes round its brink (turned ${turned.toFixed(2)})`);
  }
}));

/** A touch's errand, walked as main.ts walks it (its finer grid): how far he went, or -1 if he never came within reach. */
function errand(g: Game, toX: number, toY: number, reach: number): number {
  const L = g.level;
  const F = L.errand!;
  const h = g.hero;
  const goal = fineGoal(F, h.x, h.y, toX, toY);
  const flow = flowField(F.grid, F.w, F.h, goal.x * F.k, goal.y * F.k);
  let walked = 0;
  const short = reach < 1 ? 0 : 1.35;
  for (let i = 0; i < 60 * 12; i++) {
    const d = Math.hypot(toX - h.x, toY - h.y);
    if (d < reach) return walked;
    const ux = (toX - h.x) / d;
    const uy = (toY - h.y) / d;
    const straight = lineOfSight(F.grid, F.w, F.h, h.x * F.k, h.y * F.k, (toX - ux * short) * F.k, (toY - uy * short) * F.k);
    const v = straight ? { x: ux, y: uy } : fineDir(F.grid, F.w, F.h, F.k, flow, h.x, h.y);
    if (v.x === 0 && v.y === 0) {
      v.x = ux;
      v.y = uy;
    }
    const wasX = h.x;
    const wasY = h.y;
    g.slide(h, R, v.x * (4.2 / 60), v.y * (4.2 / 60), L.walk);
    walked += Math.hypot(h.x - wasX, h.y - wasY);
    assert.ok(stands(g, h.x, h.y), 'never where he may not stand');
  }
  return -1;
}

test('a touch\'s errand: from where he wakes and from every service to every other and to the waypoint; the ring from the Lexicon\'s side', () => town(() => {
  const g = home(19, 2);
  const L = g.level;
  const h = g.hero;
  const reach = TUNE.useRange - 0.25;
  const W = L.ways!.way!;
  const spots: { name: string; x: number; y: number; reach: number }[] = [...L.stations.map((s) => ({ name: s.kind as string, x: s.x, y: s.y, reach })), { name: 'waypoint', x: W.x, y: W.y, reach: 0.4 }];
  // where he ends beside each (walked to from where he wakes)
  const beside = new Map<string, [number, number]>();
  for (const s of spots) {
    h.x = RIM_ARRIVE.x;
    h.y = RIM_ARRIVE.y;
    const far = errand(g, s.x, s.y, s.reach);
    assert.ok(far >= 0, `from where he wakes to the ${s.name}`);
    beside.set(s.name, [h.x, h.y]);
  }
  // from beside each to every other: he gets there, by a way not much longer than round the pit (its brink is 24 tiles round)
  let longest = 0;
  for (const a of spots) {
    for (const b of spots) {
      if (a === b) continue;
      [h.x, h.y] = beside.get(a.name)!;
      const far = errand(g, b.x, b.y, b.reach);
      assert.ok(far >= 0, `from the ${a.name} to the ${b.name}`);
      const crow = Math.hypot(b.x - beside.get(a.name)![0], b.y - beside.get(a.name)![1]);
      assert.ok(far <= crow * 1.8 + 9, `from the ${a.name} to the ${b.name}: ${far.toFixed(1)} tiles for ${crow.toFixed(1)} as the crow flies`);
      longest = Math.max(longest, far);
    }
  }
  assert.ok(longest < 26, `the longest of them ${longest.toFixed(1)} tiles`);
  // into the wordsmith's ring from the Lexicon's side: between its standing stones, a few tiles, not round the pit
  [h.x, h.y] = beside.get('lexicon')!;
  const ws = L.stations.find((s) => s.kind === 'wordsmith')!;
  const far = errand(g, ws.x, ws.y, reach);
  assert.ok(far >= 0 && far < 6, `from the Lexicon to the wordsmith: ${far.toFixed(1)} tiles`);
  // from hard by the brink (where no cell of the finer grid is open under him), all round it, to the gate
  const gate = L.stations.find((s) => s.kind === 'gate')!;
  let tried = 0;
  for (let a = 0; a < 360; a += 12) {
    h.x = RIM.cx + Math.cos((a * Math.PI) / 180) * (BRINK + 0.002);
    h.y = RIM.cy + Math.sin((a * Math.PI) / 180) * (BRINK + 0.002);
    if (!stands(g, h.x, h.y)) continue;
    tried++;
    assert.ok(errand(g, gate.x, gate.y, reach) >= 0, `from the brink at ${a} degrees to the gate`);
  }
  assert.ok(tried >= 20, `${tried} places at the brink`);
  // and from the landing, out over the drop, back to the stash
  h.x = LANDING[0];
  h.y = LANDING[1];
  const stash = L.stations.find((s) => s.kind === 'stash')!;
  assert.ok(errand(g, stash.x, stash.y, reach) >= 0, 'from the landing to the stash');
}));

test('the finer grid: every open cell a place his whole body may stand, anywhere in it; a line across open cells is walked', () => town(() => {
  const g = home(23, 2);
  const L: Level = g.level;
  const F = L.errand!;
  assert.equal(F.k, ERRAND.k);
  assert.deepEqual([F.w, F.h], [L.floor.w * F.k, L.floor.h * F.k]);
  let open = 0;
  // (a seeded scatter of places in each open cell)
  let seed = 12345;
  const rnd = (): number => {
    seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  for (let cy = 0; cy < F.h; cy++) {
    for (let cx = 0; cx < F.w; cx++) {
      if (F.grid[cy * F.w + cx] !== 1) continue;
      open++;
      for (let n = 0; n < 3; n++) {
        const x = (cx + rnd()) / F.k;
        const y = (cy + rnd()) / F.k;
        assert.ok(stands(g, x, y), `cell ${cx}, ${cy} at ${x.toFixed(3)}, ${y.toFixed(3)}`);
      }
    }
  }
  assert.ok(open > 4000, `${open} open cells`);
  // every service has an open cell within reach of it
  const reach = TUNE.useRange - 0.25;
  for (const s of L.stations as { kind: Station; x: number; y: number }[]) {
    const to = fineGoal(F, RIM_ARRIVE.x, RIM_ARRIVE.y, s.x, s.y);
    assert.ok(Math.hypot(to.x - s.x, to.y - s.y) < reach, `the ${s.kind}: the nearest he can walk to is ${Math.hypot(to.x - s.x, to.y - s.y).toFixed(2)} from it`);
  }
}));

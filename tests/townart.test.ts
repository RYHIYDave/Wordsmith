// The town's new look, as the game shows it (Version 14.4).
//
// The owner, 5 Oct 2026: "Let's get some idle animations for the vendors." "And give the vendors
// little areas. Like a shop stall or a bazaar tent area with goods laid out on a table. Maybe the
// martial vendor has an anvil and forge, the magic guy has some jewelry and potions laid out, and
// the wordsmith I'm not sure about but I want him to be very runic. The shady guy being the
// exception, he's just leaned up against a wall in the shadows." "Oh and have the gate be
// embedded in the back wall like a big glowing gate".
//
// Every one of those pictures is painted here, a plain painting standing in for the canvas
// (tests/helpers.ts), and held to what the game needs of it:
//   - each of the four people has a loop to stand in and something they do now and then, which
//     begins and ends as the loop begins, so that the one runs into the other without a jump;
//   - no frame runs off the canvas it was painted on, and everyone stands on the floor;
//   - friends have the heroes' eyes, the stranger has gold ones, nobody an enemy's;
//   - each place has its things, standing or lying where the game puts them;
//   - the gate is four tiles of wall, more than twice a wall's height, and its light moves;
//   - the hall itself: every thing in it has a picture, nothing is walled in, each place is where
//     its person is, and the stranger's corner has no fire.
//   run: tsx --test tests/townart.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { GATE_TILES, VAULT, WALL_LOOK, makeGroundArt } from '../src/art/ground';
import { BONE, GLINT, GRAIN, IDLE_FPS, KH, KW, REST, SPARK, TEAL } from '../src/art/kit';
import type { Pose } from '../src/art/kit';
import { SOCKET } from '../src/art/mkit';
import { EMBER, GOLD } from '../src/art/props';
import { makeTownProps } from '../src/art/town';
import { ACT_FPS, FACINGS, PAINT, TOWN_POSES, TOWN_WORK, makeTownsfolk, townFrame } from '../src/art/townsfolk';
import type { Facing, Townsfolk } from '../src/art/townsfolk';
import { TURN_BACK, TURN_TO, facingToward, isTownFlat, townSprite, turnedTo } from '../src/art/townscene';
import { WALL_H } from '../src/engine/iso';
import type { Sprite } from '../src/engine/px';
import { TUNE } from '../src/game/defs';
import { TOWN, makeTown } from '../src/game/level';
import { UNREACHABLE, flowField } from '../src/game/nav';
import { T_FLOOR, T_WALL } from '../src/game/types';
import { paintWithoutCanvas, paintingOf, unlike } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

paintWithoutCanvas();

const FOLK = makeTownsfolk();
const TOWNS = makeTownProps();
const GROUND = makeGroundArt();
const ART = { town: TOWNS, folk: FOLK };
const WHO: (keyof Townsfolk)[] = ['armourer', 'mystic', 'wordsmith', 'stranger'];
const TW = 32 * GRAIN;
const TH = 16 * GRAIN;

/** Whether a painting has this colour anywhere. */
function has(s: Sprite, color: string): boolean {
  const p = paintingOf(s);
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) if (p.get(x, y) === color) return true;
  return false;
}

/** How many pixels of a painting are painted. */
function painted(s: Sprite): number {
  const p = paintingOf(s);
  let n = 0;
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) if (p.has(x, y)) n++;
  return n;
}

/** The lowest painted row of a painting, in picture pixels below the top. */
function lowest(s: Sprite): number {
  const p = paintingOf(s);
  for (let y = p.h - 1; y >= 0; y--) for (let x = 0; x < p.w; x++) if (p.has(x, y)) return y;
  return -1;
}

test('each of the town\'s four people has a loop to stand in, and something they do now and then', () => {
  assert.deepEqual(Object.keys(FOLK).sort(), [...WHO].sort());
  for (const who of WHO) {
    const m = FOLK[who];
    assert.equal(m.idle.length, TOWN_POSES[who].idle.length);
    assert.equal(m.act.length, TOWN_POSES[who].act.length);
    assert.ok(m.idle.length % 12 === 0 && m.idle.length >= 12, `${who}: the loop is a whole number of breaths (${m.idle.length} frames)`);
    assert.ok(m.act.length >= 20, `${who}: what they do takes a second or more (${m.act.length} frames at ${ACT_FPS} a second)`);
    assert.ok(m.loops >= 2, `${who}: the loop goes round more than once between acts`);
    // the loop is alive: its frames are not all one picture
    const moving = m.idle.filter((f) => unlike(f, m.idle[0]) > 0).length;
    assert.ok(moving >= m.idle.length / 3, `${who}: ${moving} of the loop's ${m.idle.length} frames differ from its first`);
    // and what they do is unmistakable: at its middle the picture is far from the figure standing
    const far = Math.max(...m.act.map((f) => unlike(f, m.idle[0])));
    assert.ok(far > 60, `${who}: at its furthest the act differs from standing by ${far} pixels`);
  }
});

test('an act begins and ends as the loop begins: the one runs into the other without a jump', () => {
  for (const who of WHO) {
    const m = FOLK[who];
    assert.equal(unlike(m.act[0], m.idle[0]), 0, `${who}: the act's first frame is the loop's first`);
    assert.equal(unlike(m.act[m.act.length - 1], m.idle[0]), 0, `${who}: and so is its last`);
    // and it leaves the standing figure, and comes back to it, by degrees: over its first and its
    // last three frames a frame is not much further from the one before it than the frames of
    // the loop are from one another (what goes round in the loop, the wordsmith's stones, goes
    // round in the act too; in the middle of an act a hammer may fall fast)
    const steps = m.act.map((f, i) => (i === 0 ? 0 : unlike(f, m.act[i - 1])));
    const usual = Math.max(...m.idle.map((f, i) => unlike(f, m.idle[(i + 1) % m.idle.length])));
    const n = m.act.length;
    for (const i of [1, 2, 3, n - 3, n - 2, n - 1]) assert.ok(steps[i] <= usual + 220, `${who}: frame ${i} of the act differs from frame ${i - 1} by ${steps[i]} pixels (the loop's biggest step is ${usual})`);
    // (and nothing in it is a different picture altogether from the frame before)
    assert.ok(Math.max(...steps) < 1300, `${who}: the biggest step in the act is ${Math.max(...steps)} pixels`);
  }
});

test('the town\'s clock: so many rounds of the loop, then the act, and round again', () => {
  for (const who of WHO) {
    const m = FOLK[who];
    const loopT = m.idle.length / IDLE_FPS;
    const rest = m.loops * loopT;
    const every = rest + m.act.length / ACT_FPS;
    // the loop, from its first frame, the stated number of times
    for (let k = 0; k < m.loops * m.idle.length; k++) assert.equal(townFrame(m, (k + 0.5) / IDLE_FPS), m.idle[k % m.idle.length], `${who}: loop frame ${k}`);
    // then every frame of the act, in order
    for (let k = 0; k < m.act.length; k++) assert.equal(townFrame(m, rest + (k + 0.5) / ACT_FPS), m.act[k], `${who}: act frame ${k}`);
    // and round again; a phase sets one clock apart from another
    assert.equal(townFrame(m, every + 0.01), m.idle[0]);
    assert.equal(townFrame(m, 0.01, rest), m.act[0]);
    assert.equal(townFrame(m, -0.01), m.act[m.act.length - 1], 'a time before nought is the end of the round before');
  }
  // (set apart as the game sets them, the four do not all act at once)
  const acting = (t: number): number => WHO.filter((who, i) => FOLK[who].act.includes(townFrame(FOLK[who], t, [0, 3.1, 6.4, 4.7][i]))).length;
  let most = 0;
  for (let t = 0; t < 120; t += 0.25) most = Math.max(most, acting(t));
  assert.ok(most < 4, 'in two minutes the four never act all at the same moment');
});

test('no frame of any of them runs off the canvas it was painted on, and everyone stands on the floor', () => {
  for (const who of WHO) {
    const poses = [...TOWN_POSES[who].idle, ...TOWN_POSES[who].act];
    poses.forEach((q, i) => {
      const px = PAINT[who]({ ...REST, ...q } as Pose).px;
      assert.equal(px.w, KW);
      assert.equal(px.h, KH);
      for (let x = 0; x < KW; x++) assert.ok(!px.has(x, 0) && !px.has(x, KH - 1), `${who}, pose ${i}: paint on the top or bottom edge at x=${x}`);
      for (let y = 0; y < KH; y++) assert.ok(!px.has(0, y) && !px.has(KW - 1, y), `${who}, pose ${i}: paint on a side edge at y=${y}`);
    });
    // the feet are on the floor point: the lowest paint of the standing figure is within two game pixels of its anchor
    const f = FOLK[who].idle[0];
    const sole = lowest(f) / GRAIN - f.ay;
    assert.ok(Math.abs(sole) <= 2, `${who}: the lowest paint is ${sole.toFixed(1)} game pixels from the floor point`);
    // and they are of a person's height beside a hero (who is about 27)
    assert.ok(f.h >= 22 && f.h <= 38, `${who} is ${f.h} game pixels tall`);
  }
});

test('friends have the heroes\' eyes; the stranger\'s are gold; nobody has an enemy\'s', () => {
  for (const who of WHO) {
    const m = FOLK[who];
    for (const f of [...m.idle, ...m.act]) assert.ok(!has(f, SOCKET), `${who}: no frame has the pink of an enemy's eye`);
    if (who === 'stranger') {
      assert.ok(has(m.idle[0], GOLD[3]) && !has(m.idle[0], GLINT), 'the stranger: two points of gold, and no cyan');
      assert.equal(m.idle[0].aura, undefined, 'and no pool of light behind him: he keeps to the dark');
      assert.equal(m.idle[0].lights, undefined, 'nor any light of his own while he stands');
    } else {
      assert.ok(has(m.idle[0], GLINT), `${who}: the two cyan points of light the heroes have`);
      assert.ok(m.idle[0].aura, `${who}: a pool of light behind, as a hero has`);
    }
  }
});

test('what each does shows: sparks at the anvil, the crystal blazing, a rune on the air, a coin', () => {
  const lightsOf = (f: Sprite): number => (f.lights ?? []).length;
  // the armourer: no light of his own at rest; a flash of the fire's colour where the hammer lands, low and to screen-left of him
  const a = FOLK.armourer;
  assert.equal(lightsOf(a.idle[0]), 0);
  const struck = a.act.filter((f) => lightsOf(f) > 0);
  assert.ok(struck.length >= 3 && struck.length <= 8, `the sparks last a few frames (${struck.length})`);
  for (const f of struck) {
    const l = (f.lights ?? [])[0];
    assert.equal(l.color, EMBER[2]);
    assert.ok(l.x < f.ax - 8 && l.y > f.ay - 16, `the blow lands to screen-left of his feet and low: light at ${l.x.toFixed(0)},${l.y.toFixed(0)}, anchor ${f.ax},${f.ay}`);
  }
  // the mystic: the crystal always gives light, and far more when it blazes
  const m = FOLK.mystic;
  const glow = (f: Sprite): number => Math.max(0, ...(f.lights ?? []).map((l) => l.r));
  assert.ok(glow(m.idle[0]) > 4);
  assert.ok(Math.max(...m.act.map(glow)) > glow(m.idle[0]) * 1.4, 'the crystal blazes in the flourish');
  // the wordsmith: runes alight on him always; in the act, a great rune written beside him that gives more light than any of them
  const w = FOLK.wordsmith;
  assert.ok(lightsOf(w.idle[0]) >= 2 && has(w.idle[0], SPARK[4]) && has(w.idle[0], SPARK[2]), `${lightsOf(w.idle[0])} lights on him as he stands`);
  assert.ok(Math.max(...w.act.map(glow)) > Math.max(...w.idle.map(glow)), 'the rune on the air outshines the runes he wears');
  // the stranger: a coin of gold in the air, which is the only light he ever gives
  const s = FOLK.stranger;
  const tossed = s.act.filter((f) => lightsOf(f) > 0);
  assert.ok(tossed.length >= 4, `the coin is in the air for a few frames (${tossed.length})`);
  for (const f of tossed) assert.equal((f.lights ?? [])[0].color, GOLD[3]);
});

test('each place has its things: what stands has its foot on the floor point, what lies is laid by its middle', () => {
  const standing: [string, Sprite][] = [
    ['anvil', TOWNS.anvil], ['rack', TOWNS.rack], ['trough', TOWNS.trough], ['forge', TOWNS.forge[0]],
    ['tentBack', TOWNS.tentBack], ['tentTable', TOWNS.tentTable], ['runeSlab', TOWNS.runeSlab[0]],
    ['lexicon', TOWNS.lexicon[0]], ['stash', TOWNS.stash], ...TOWNS.runeStone.map((s, i): [string, Sprite] => [`runeStone ${i}`, s.dim]),
  ];
  // Version 14.5: the town's things stand ON THE GRID ("any sprite or doodad or whatever should
  // always be seen at an angle. The forge near the blacksmith being the prime example"). A thing's
  // floor point is the middle of its tile; its nearest corner comes down the screen from there by
  // as much as it reaches along the grid: half a tile's depth (8 game pixels) for what fills its
  // tile, more for the three that are longer than a tile (the rack along its wall, the table of
  // wares, and the tent, whose front poles stand a tile and more before the cloth of its back).
  const REACH: Record<string, number> = { tentBack: 22, tentTable: 14, rack: 9, stash: 9, runeSlab: 9 };
  for (const [name, s] of standing) {
    assert.equal(s.density, GRAIN, `${name} is painted at the heroes' grain`);
    assert.ok(painted(s) > 200, `${name} is a picture`);
    assert.ok(Number.isInteger(s.ax) && Number.isInteger(s.ay), `${name} is laid down on a whole game pixel`);
    const below = lowest(s) / GRAIN - s.ay;
    assert.ok(below >= -1 && below <= (REACH[name] ?? 8), `${name}: its lowest paint is ${below.toFixed(1)} game pixels below its floor point`);
    // and the floor point is under it: inside the picture, and (for what fills one tile) near its middle
    assert.ok(s.ax > 4 && s.ax < s.w - 4, `${name}: its floor point is under it (${s.ax} of ${s.w})`);
    if (!(name in REACH) || name === 'stash' || name === 'runeSlab') assert.ok(Math.abs(s.ax - s.w / 2) <= s.w * 0.2, `${name}: its floor point is under its middle (${s.ax} of ${s.w})`);
    // nothing was cut off at the edges of its canvas
    const p = paintingOf(s);
    for (let y = 0; y < p.h; y++) assert.ok(!p.has(0, y) && !p.has(p.w - 1, y), `${name}: nothing is cut off at the sides`);
    for (let x = 0; x < p.w; x++) assert.ok(!p.has(x, 0), `${name}: nothing is cut off at the top`);
  }
  // seen at an angle: a thing built on the grid has a side in the light (the one that looks down
  // the screen to the left) and a side in shade. The forge's two sides are the walls' own two faces.
  {
    const p = paintingOf(TOWNS.forge[0]);
    const at = TOWNS.forge[0].ax * GRAIN;
    let litLeft = 0;
    let litRight = 0;
    let shadeLeft = 0;
    let shadeRight = 0;
    for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
      const c = p.get(x, y);
      if (c === VAULT.lit[2]) (x < at ? litLeft++ : litRight++);
      if (c === VAULT.shade[2]) (x < at ? shadeLeft++ : shadeRight++);
    }
    assert.ok(litLeft > 200 && litLeft > litRight * 3, `the forge's lit stone is on its left (${litLeft} against ${litRight})`);
    assert.ok(shadeRight > 200 && shadeRight > shadeLeft * 3, `and its shaded stone on its right (${shadeRight} against ${shadeLeft})`);
  }
  for (const [name, s] of [['rug', TOWNS.rug], ['runeRing', TOWNS.runeRing[0]]] as [string, Sprite][]) {
    assert.ok(Math.abs(s.ax - s.w / 2) <= 1 && Math.abs(s.ay - s.h / 2) <= 1, `${name} is laid by its middle`);
    // twice as wide as it is deep, like everything that lies on this floor
    assert.ok(Math.abs(s.w / s.h - 2) < 0.1, `${name} is ${s.w} by ${s.h}`);
  }
  // the outer line of the ring cut in the floor is the circle the six stones stand on: root five
  // tiles from the middle (the line is drawn at 0.96 of the picture's half width)
  const ring = TOWNS.runeRing[0];
  const r = Math.sqrt(5) * 16 * Math.SQRT2;
  assert.ok(Math.abs((ring.w / 2) * 0.96 - r) <= 1, `the ring's outer line is ${((ring.w / 2) * 0.96).toFixed(1)} game pixels from its middle: the stones stand at ${r.toFixed(1)}`);
  // The tent's roof clears the head of the trader, who stands under its eave: a tile nearer than
  // the cloth of its back, which on the screen is 16 game pixels to the left of the tent's floor
  // point and 8 down. Nothing of the roof or of its hanging edge (the bright stripes: the cloth
  // of the back, in the roof's shade, has only the dim ones) is painted where his head is.
  const tent = paintingOf(TOWNS.tentBack);
  const trader = FOLK.mystic.idle[0];
  const bright = new Set<string>([TEAL[2], TEAL[3], BONE[3], '#ffffff']);
  const headX = (TOWNS.tentBack.ax - 16) * GRAIN;
  const feetY = (TOWNS.tentBack.ay + 8) * GRAIN;
  const headTop = feetY - trader.ay * GRAIN;
  let over = 0;
  let above = 0;
  for (let x = headX - 14; x <= headX + 14; x++) {
    for (let y = headTop; y < headTop + 40; y++) if (bright.has(tent.get(x, y) ?? '')) over++;
    for (let y = 0; y < headTop; y++) if (bright.has(tent.get(x, y) ?? '')) above++;
  }
  assert.equal(over, 0, 'nothing of the roof hangs across the trader\'s head');
  assert.ok(above > 200, `and the roof is over him (${above} pixels of it above his head)`);
});

test('what burns, burns; what is read, glows; and each gives the light of what it is', () => {
  assert.equal(TOWNS.forge.length, 4);
  assert.ok(unlike(TOWNS.forge[0], TOWNS.forge[1]) > 10, 'the forge\'s fire moves');
  for (const f of TOWNS.forge) assert.equal((f.lights ?? [])[0]?.color, EMBER[2], 'and gives an honest fire\'s light');
  assert.ok(unlike(TOWNS.lexicon[0], TOWNS.lexicon[1]) > 0, 'the Lexicon is being read');
  assert.ok(unlike(TOWNS.runeSlab[0], TOWNS.runeSlab[3]) > 0, 'a word lifts off the slab');
  assert.ok(unlike(TOWNS.runeRing[0], TOWNS.runeRing[1]) > 0, 'a brighter arc goes round the ring');
  for (const s of [...TOWNS.lexicon, ...TOWNS.runeSlab]) assert.equal((s.lights ?? [])[0]?.color, SPARK[2], 'the light of what outlasts a character');
  assert.equal(TOWNS.runeStone.length, 5);
  for (const st of TOWNS.runeStone) {
    assert.equal(st.dim.lights, undefined);
    assert.ok((st.alight.lights ?? []).length === 1 && unlike(st.dim, st.alight) > 0, 'a standing stone lights when the pulse comes round to it');
  }
  // nothing of the town's is an enemy's pink
  const all: Sprite[] = [TOWNS.anvil, TOWNS.rack, TOWNS.trough, ...TOWNS.forge, TOWNS.tentBack, TOWNS.tentTable, TOWNS.rug, ...TOWNS.runeSlab, ...TOWNS.runeRing, ...TOWNS.lexicon, TOWNS.stash];
  for (const s of all) assert.ok(!has(s, SOCKET));
});

test('the gate is four tiles of the back wall, rises well above the walls\' top line, and its light moves', () => {
  assert.equal(GATE_TILES, TOWN.gateWall.n, 'the hall gives the gate as many tiles of wall as it is painted on');
  assert.equal(GROUND.gate.length, 4, 'four frames of its light');
  // (a wall, in the look in force since Version 18.4, is its faces alone: the one turned to screen-left, which the gate is set in)
  const wall = GROUND.faceLeft[0];
  for (const frame of GROUND.gate) {
    assert.equal(frame.length, GATE_TILES);
    for (const part of frame) {
      const p = paintingOf(part);
      assert.equal(p.w, TW, 'each part is one tile wide');
      // (55 game pixels: more than twice a wall as it was until Version 18.3, and 15 above the top line of the walls now, which are lost in the dark there)
      assert.ok(p.h > TH + WALL_H * GRAIN * 2, `and rises to more than twice the old wall (${p.h} picture pixels against ${TH + WALL_H * GRAIN})`);
      assert.ok(p.h >= TH + (WALL_LOOK.tall + 12) * GRAIN, `and well above the walls' top line (${p.h} picture pixels against ${TH + WALL_LOOK.tall * GRAIN})`);
      // it stands where a wall stands: its floor line is the wall's
      assert.equal(part.ax, wall.ax);
      assert.equal(part.h - part.ay, wall.h - wall.ay, 'as far below its anchor as a wall is');
    }
    // one part has the middle of the arch, and carries the light: the cyan of what is the player's
    const lit = frame.filter((part) => (part.lights ?? []).length > 0);
    assert.equal(lit.length, 1);
    for (const l of lit[0].lights ?? []) assert.equal(l.color, SPARK[2]);
    // the field of light is in it: the brightest of that light, in quantity
    assert.ok(frame.some((part) => has(part, '#ffffff')) && frame.filter((part) => has(part, SPARK[2])).length >= 2, 'the field of light is in the middle parts');
  }
  // (the light is in the opening, which is in the middle parts: the outermost are the arch's stone)
  for (let k = 1; k < GATE_TILES - 1; k++) assert.ok(unlike(GROUND.gate[0][k], GROUND.gate[1][k]) > 20, `part ${k}: the light in the gate moves`);
  // the outermost columns of the gate are plain wall still: it is embedded in the wall, not laid over all of it
  const first = paintingOf(GROUND.gate[0][0]);
  const plain = paintingOf(wall);
  const extra = first.h - plain.h;
  // (asked of the wall's solid rows: where a wall fades out at its top, the gate's stone darkens into the dark with it)
  let same = 0;
  let solid = 0;
  for (let y = 0; y < plain.h; y++) {
    if (plain.d[(y * plain.w + 3) * 4 + 3] !== 255) continue;
    solid++;
    if (first.get(3, y + extra) === plain.get(3, y)) same++;
  }
  assert.ok(solid >= 40 && same > solid * 0.9, `the gate's first column of stone is the wall's own (${same} of ${solid} solid rows)`);
});

test('the hall: every thing in it has a picture, and the flat ones are walked over', () => {
  const L = makeTown(7);
  const town = ['lexicon', 'stash', 'armourer', 'anvil', 'forge', 'rack', 'trough', 'mystic', 'tentBack', 'tentTable', 'rug', 'wordsmith', 'runeSlab', 'runeStone', 'runeRing', 'stranger'];
  const dungeon = ['brazier', 'pillar', 'barrel', 'urn'];
  const kinds = new Set(L.props.map((p) => p.kind as string));
  for (const k of town) assert.ok(kinds.has(k), `the hall has a ${k}`);
  for (const p of L.props) {
    if (dungeon.includes(p.kind)) {
      assert.equal(townSprite(ART, p.kind, p.variant, 0), null);
      continue;
    }
    assert.ok(town.includes(p.kind), `${p.kind} is one of the town's things`);
    for (const t of [0, 0.37, 2.9, 11.3]) assert.ok(townSprite(ART, p.kind, p.variant, t), `${p.kind} has a picture at ${t} s`);
    const walk = L.walk[p.ty * L.floor.w + p.tx];
    if (isTownFlat(p.kind)) assert.equal(p.solid, false, `${p.kind} lies flat and is walked over`);
    else assert.ok(p.solid && walk === 0, `${p.kind} stands, and its tile is not walked on`);
    assert.equal(L.floor.tiles[p.ty * L.floor.w + p.tx], T_FLOOR, `${p.kind} is on the floor`);
  }
  assert.equal(L.portal, null, 'no portal stands on the town\'s floor: the gate is in the wall');
  // six standing stones, each a different one of five (the sixth is the first again), each alight in its turn
  const stones = L.props.filter((p) => p.kind === 'runeStone');
  assert.equal(stones.length, 6);
  assert.deepEqual(stones.map((s) => s.variant), [0, 1, 2, 3, 4, 5]);
  for (const s of stones) {
    const litAt = [0, 1, 2, 3, 4, 5].filter((k) => townSprite(ART, 'runeStone', s.variant, (k + 0.5) / 1.6) === TOWNS.runeStone[s.variant % 5].alight);
    assert.deepEqual(litAt, [s.variant], `stone ${s.variant} is alight in its own turn of six, and only then`);
  }
  // no two things stand on one tile
  const seen = new Set<number>();
  for (const p of L.props) {
    if (!p.solid) continue;
    const i = p.ty * L.floor.w + p.tx;
    assert.ok(!seen.has(i), `two things stand on tile ${p.tx},${p.ty}`);
    seen.add(i);
  }
});

test('the hall: each place is where its person is, the gate is in the wall, the stranger\'s corner has no fire', () => {
  const L = makeTown(7);
  const f = L.floor;
  const at = (kind: string): { x: number; y: number; tx: number; ty: number } => {
    const p = L.props.find((q) => q.kind === kind);
    assert.ok(p, `the hall has a ${kind}`);
    return p as { x: number; y: number; tx: number; ty: number };
  };
  const tile = (x: number, y: number): number => f.tiles[y * f.w + x];
  // the gate: its tiles are wall, in the back wall on the right (the row above the floor), with floor before each
  for (let k = 0; k < TOWN.gateWall.n; k++) {
    assert.equal(tile(TOWN.gateWall.x + k, TOWN.gateWall.y), T_WALL);
    assert.equal(tile(TOWN.gateWall.x + k, TOWN.gateWall.y + 1), T_FLOOR);
    assert.equal(L.low[TOWN.gateWall.y * f.w + TOWN.gateWall.x + k], 0, 'and it is a whole wall there, not one cut down');
  }
  assert.equal(TOWN.gateWall.y, TOWN.y0 - 1);
  // where it is used from is on the floor straight under the middle of the arch, as the screen shows it
  const gate = L.stations.find((s) => s.kind === 'gate')!;
  const archX = (TOWN.gateWall.x + TOWN.gateWall.n / 2 - (TOWN.gateWall.y + 1)) * 16;
  assert.ok(Math.abs((gate.x - gate.y) * 16 - archX) < 1.5, `the gate is used from under the middle of the arch (${((gate.x - gate.y) * 16).toFixed(1)} against ${archX})`);
  assert.equal(L.walk[Math.floor(gate.y) * f.w + Math.floor(gate.x)], 1);
  // a fire either side of it
  const fires = L.props.filter((p) => p.kind === 'brazier');
  assert.ok(fires.some((p) => p.tx === TOWN.gateWall.x - 1 && p.ty === TOWN.y0) && fires.some((p) => p.tx === TOWN.gateWall.x + TOWN.gateWall.n && p.ty === TOWN.y0));
  // the smithy: the anvil is before the armourer and to screen-left of him (the tile at y + 1), where his hammer comes down;
  // the forge is against the back wall
  const smith = at('armourer');
  assert.deepEqual([at('anvil').tx, at('anvil').ty], [smith.tx, smith.ty + 1]);
  assert.equal(at('forge').ty, TOWN.y0);
  assert.equal(at('rack').ty, TOWN.y0);
  assert.equal(L.stations.find((s) => s.kind === 'armourer')!.x, smith.x);
  // the bazaar stands on the grid (Version 14.5; it went straight down the screen, which is no line of this floor's):
  // the tent's back, the trader and the table are one behind the other ALONG the grid, a tile apart, and it opens
  // down the screen to the left; the service is the table
  const back = at('tentBack');
  const trader = at('mystic');
  const table = at('tentTable');
  assert.deepEqual([trader.tx - back.tx, trader.ty - back.ty, table.tx - trader.tx, table.ty - trader.ty], [0, 1, 0, 1]);
  assert.deepEqual([at('rug').tx, at('rug').ty], [trader.tx, trader.ty]);
  const mystic = L.stations.find((s) => s.kind === 'mystic')!;
  assert.deepEqual([mystic.x, mystic.y], [table.x, table.y]);
  // (the stall is all the trader's: nobody walks under the roof or behind the table. His tile and the eight round it.)
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    assert.equal(L.walk[(trader.ty + dy) * f.w + trader.tx + dx], 0, `the tile ${dx},${dy} from the trader is the stall's`);
  }
  // and the place to stand to use it is free: in front of the table, all along it
  for (const dx of [-1, 0, 1]) assert.equal(L.walk[(table.ty + 1) * f.w + table.tx + dx], 1, `the floor before the table (${dx}) is free`);
  // (and it is within reach of the service from there)
  assert.ok(Math.hypot(table.x - (table.tx + 0.5), table.y - (table.ty + 1.5)) < TUNE.useRange);
  // the ring: six stones on the circle of root five about the wordsmith, none in front of him (the way in)
  const ws = at('wordsmith');
  const stones = L.props.filter((p) => p.kind === 'runeStone');
  for (const s of stones) {
    assert.ok(Math.abs(Math.hypot(s.tx - ws.tx, s.ty - ws.ty) - Math.sqrt(5)) < 1e-9);
    assert.ok(s.tx - ws.tx + (s.ty - ws.ty) <= 1, 'no stone stands in front of him');
  }
  for (const [dx, dy] of [[1, 2], [2, 1]]) assert.equal(L.walk[(ws.ty + dy) * f.w + ws.tx + dx], 1, 'the two tiles of the circle in front of him are the way in');
  assert.deepEqual([at('runeRing').tx, at('runeRing').ty], [ws.tx, ws.ty]);
  assert.ok(Math.hypot(at('runeSlab').tx - ws.tx, at('runeSlab').ty - ws.ty) === 1, 'his slab is beside him');
  // the stranger: against the left-hand back wall, by the top corner; and no fire within six tiles of him
  const st = at('stranger');
  assert.equal(st.tx, TOWN.x0);
  assert.ok(st.ty - TOWN.y0 <= 2);
  assert.equal(tile(st.tx - 1, st.ty), T_WALL);
  for (const p of fires) assert.ok(Math.hypot(p.tx - st.tx, p.ty - st.ty) > 5, `a fire at ${p.tx},${p.ty} is ${Math.hypot(p.tx - st.tx, p.ty - st.ty).toFixed(1)} tiles from him`);
  // (his service is the gamble: it is his once the trades are open, and nobody's until then)
  assert.equal(L.stations.some((s) => (s.kind as string) === 'stranger'), TUNE.tradesOpen, 'the stranger has a service when the trades are open, and only then');
});

test('the hall: nothing is walled in, and a new arrival has a clear floor', () => {
  const L = makeTown(7);
  const f = L.floor;
  const sx = Math.floor(TOWN.start.x);
  const sy = Math.floor(TOWN.start.y);
  assert.equal(L.walk[sy * f.w + sx], 1);
  const dist = flowField(L.walk, f.w, f.h, sx, sy);
  let open = 0;
  for (let ty = 0; ty < f.h; ty++) {
    for (let tx = 0; tx < f.w; tx++) {
      if (L.walk[ty * f.w + tx] !== 1) continue;
      open++;
      assert.ok(dist[ty * f.w + tx] !== UNREACHABLE, `the floor at ${tx},${ty} cannot be walked to`);
    }
  }
  // (the hall is 16 by 14; its people, their places and its furniture take about a fifth of it)
  assert.ok(open >= 16 * 14 * 0.75, `${open} tiles of ${16 * 14} are free to walk on`);
  // nothing stands within two tiles of where a new arrival stands
  for (const p of L.props) if (p.solid) assert.ok(Math.hypot(p.x - TOWN.start.x, p.y - TOWN.start.y) > 2, `${p.kind} is too near the arrival point`);
});

// ---------------------------------------------------------------------------------------------
// THEY TURN TO FACE YOU (the owner, 5 Oct 2026, 21:20: "Let's have them face their tables or
// anvils, but turn to face you when you get very close")

test('which way is toward you: the four ways along the grid, and no flicking between two of them', () => {
  // (the grid's x runs down the screen and to the right, its y down and to the left)
  assert.equal(facingToward(5, 5, 6, 5), 'se');
  assert.equal(facingToward(5, 5, 5, 6), 'sw');
  assert.equal(facingToward(5, 5, 4, 5), 'nw');
  assert.equal(facingToward(5, 5, 5, 4), 'ne');
  assert.equal(facingToward(5, 5, 6, 5.6), 'se');
  assert.equal(facingToward(5, 5, 5.6, 6), 'sw');
  // near the line between two ways, whoever is turned already stays as they are
  assert.equal(facingToward(5, 5, 6, 6.2), 'sw');
  assert.equal(facingToward(5, 5, 6, 6.2, 'se'), 'se', 'a little past the line: no turn');
  assert.equal(facingToward(5, 5, 6, 6.6, 'se'), 'sw', 'well past it: a turn');
  assert.equal(facingToward(5, 5, 4, 5, 'se'), 'nw', 'gone round behind: a turn');
});

test('they turn when you come very close, and turn back when you have gone a little further off than that', () => {
  assert.ok(TURN_TO < TUNE.useRange, 'very close: nearer than a service can be used from');
  assert.ok(TURN_BACK > TURN_TO + 0.3 && TURN_BACK <= TUNE.useRange + 0.2, 'and they turn back further off than they turned');
  assert.equal(turnedTo(5, 5, 5 + TURN_TO + 0.05, 5, null), null, 'not yet');
  assert.equal(turnedTo(5, 5, 5 + TURN_TO - 0.05, 5, null), 'se', 'now');
  assert.equal(turnedTo(5, 5, 5 + TURN_BACK - 0.05, 5, 'se'), 'se', 'still, a step further off');
  assert.equal(turnedTo(5, 5, 5 + TURN_BACK + 0.05, 5, 'se'), null, 'and back to work');
});

test('turned to you, each of them is seen from the side you are on: a face toward you, a back if you are behind', () => {
  for (const who of WHO) {
    const m = FOLK[who];
    assert.equal(m.work, TOWN_WORK[who]);
    for (const to of FACINGS) {
      const loop = m.turned[to];
      assert.equal(loop.length, m.idle.length, `${who}, ${to}: a loop as long as the one they stand in`);
      for (const f of [loop[0], loop[Math.floor(loop.length / 2)]]) {
        assert.ok(painted(f) > 300, `${who}, ${to}: painted`);
        assert.ok(!has(f, SOCKET), `${who}, ${to}: never an enemy's eyes`);
        const sole = lowest(f) / GRAIN - f.ay;
        assert.ok(Math.abs(sole) <= 2, `${who}, ${to}: stands on the floor (${sole.toFixed(1)})`);
        assert.ok(f.h >= 22 && f.h <= 38, `${who}, ${to}: of a person's height (${f.h})`);
      }
      if (who === 'stranger') {
        // he never leaves his wall: only his eyes turn, and they are gold
        assert.ok(loop !== m.idle && has(loop[0], GOLD[3]) && !has(loop[0], GLINT));
        continue;
      }
      const away = to === 'ne' || to === 'nw';
      if (to === m.work) assert.ok(loop === m.idle, `${who}: toward their work is their work`);
      else assert.ok(loop !== m.idle);
      // (the wordsmith's runes are alight whichever way he stands; the others' eyes are the only cyan points on them)
      if (who !== 'wordsmith') assert.equal(has(loop[0], GLINT), !away, `${who}, ${to}: eyes are seen from in front, and not from behind`);
    }
    if (who === 'stranger') {
      // his eyes are to one side for whoever is on his right, to the other for whoever is on his left
      assert.ok(unlike(m.turned.se[0], m.turned.sw[0]) > 0);
      assert.equal(unlike(m.turned.se[0], m.turned.ne[0]), 0);
      assert.equal(unlike(m.turned.sw[0], m.turned.nw[0]), 0);
      continue;
    }
    // a way and its mirror: the same figure, turned about
    for (const [a, b] of [['se', 'sw'], ['ne', 'nw']] as [Facing, Facing][]) {
      const pa = PAINT[who]({ ...REST, ...TOWN_POSES[who].idle[0] } as Pose, a).px;
      const pb = PAINT[who]({ ...REST, ...TOWN_POSES[who].idle[0] } as Pose, b).px;
      let same = 0;
      let all = 0;
      for (let y = 0; y < KH; y++) {
        for (let x = 0; x < KW; x++) {
          const mx = 2 * 52 - 1 - x;
          if (mx < 0 || mx >= KW) continue;
          if (pa.has(x, y) || pb.has(mx, y)) all++;
          if (pa.get(x, y) === pb.get(mx, y) && pa.has(x, y)) same++;
        }
      }
      assert.equal(same, all, `${who}: ${b} is ${a} turned about`);
    }
    // from behind and from in front they are not the same picture
    assert.ok(unlike(m.turned.se[0], m.turned.ne[0]) > 200, `${who}: a back is not a front`);
  }
});

test('turned to you they only stand: what each does now and then waits until they are back at their work', () => {
  for (const who of WHO) {
    const m = FOLK[who];
    const other: Facing = m.work === 'sw' ? 'se' : 'sw';
    for (let t = 0; t < 40; t += 0.13) {
      assert.ok(m.turned[other].includes(townFrame(m, t, 1.7, other)), `${who} at ${t.toFixed(2)} s: standing, turned`);
      if (who !== 'stranger') assert.equal(townFrame(m, t, 1.7, m.work), townFrame(m, t, 1.7), `${who}: turned the way of their work, they go on with it`);
    }
    // and the game's own pictures of them
    for (const to of FACINGS) assert.ok(townSprite(ART, who, 0, 3.3, to));
    assert.equal(townSprite(ART, who, 0, 3.3, null), townSprite(ART, who, 0, 3.3));
  }
});

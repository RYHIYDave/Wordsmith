// THE FLOORS' SCENE SOUNDS WIRED IN (the sound chat's eighth batch, 9 Nov 2026: his word, “Scene sounds”; his pick, “All good,
// hand over (Recommended)”; assets/sound/README.md, "Eighth batch"; game/scene_sounds.ts). What is held here:
// - every file of the batch is one the game plays, and every one the game plays is there (82 one-shots, 22 loops);
// - the one-shots ship in packs of their own by act, each floor's in its own act's (tools/sound_packs.mjs);
// - a floor's background loop is wanted on that floor at full volume, the furnace near it while it burns, none in town;
// - the moments' sounds are in the art's order;
// - the quest pieces and the traps: the game asks for each by name where the README says (the altar's word, the seal, the
//   crank and the furnace, the cage and its stand-ins, the floor's own trap, the singing stones, the portcullis's chain).
//   run: tsx --test tests/scene_sounds.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
// @ts-ignore
import fs from 'node:fs';
import { STOKER_ON } from '../src/art/stoker';
import { PORTCULLIS } from '../src/game/act2/keep_rules';
import type { PortState } from '../src/game/act2/keep_rules';
import { FLOOR_SETS } from '../src/game/first5';
import { Game } from '../src/game/game';
import { CRANK_TIMES } from '../src/game/quests15';
import { CRANK_SOUND, MOMENT_SOUND, PORT_SOUND_LEAD, SCENE_SOUNDS, SINGING, TRAP_SOUND, bedOf, momentSound, sceneAct, sceneSoundsOf, trapSound } from '../src/game/scene_sounds';
import type { GameEvent, Level, PropInst } from '../src/game/state';
import { SHAFT } from '../src/game/ways';
import { loopWants } from '../src/game/world_sounds';
// @ts-ignore - a tool of the build, plain JavaScript
import { packOf } from '../tools/sound_packs.mjs';

const DIR = 'assets/sound';
const has = (f: string): boolean => fs.existsSync(`${DIR}/${f}`);
const FLOORS = Array.from({ length: 20 }, (_, k) => k + 1);

/** A hero on floor `depth`, as the tests of the floors come onto one. */
function onFloor(depth: number, seed = 5): Game {
  const g = new Game('warrior', seed);
  g.depth = depth;
  g.cleared = depth - 1;
  g.wayDepth = depth;
  g.enterDungeon();
  g.events.length = 0;
  return g;
}
type Rec = Extract<GameEvent, { t: 'rec' }>;
const recs = (g: Game): Rec[] => g.events.filter((e): e is Rec => e.t === 'rec');
const rec = (g: Game, name: string): Rec | undefined => recs(g).find((e) => e.name === name);

test('the batch: every one-shot the floors play has its two takes, every loop its file, and nothing of the batch is left unplayed', () => {
  assert.equal(SCENE_SOUNDS.on, true);
  const names = new Set<string>();
  for (const d of FLOORS) for (const n of sceneSoundsOf(d)) names.add(n);
  assert.equal(names.size, 41, `${names.size} names (82 files, two takes each)`);
  for (const n of names) for (const t of [1, 2]) assert.ok(has(`${n}_${t}.mp3`), `${n}_${t}.mp3`);
  for (const d of FLOORS) assert.ok(has(`${bedOf(d)}_loop.wav`), `floor ${d}'s background`);
  assert.ok(has('furnace_loop.wav') && has('pillar_fire_loop.wav'), 'the furnace and the pillars');
  assert.equal(bedOf(0), null);
  assert.equal(bedOf(21), null);
  // (the README's own list, by its file names: each is one the game asks for)
  const readme = fs.readFileSync(`${DIR}/README.md`, 'utf8') as string;
  const eighth = readme.slice(readme.indexOf('## Eighth batch'));
  const said = new Set([...eighth.matchAll(/`([a-z0-9_]+)`/g)].map((m) => m[1]).filter((n) => has(`${n}_1.mp3`)));
  for (const n of said) assert.ok(names.has(n), `${n}: in the README, played by the game`);
  assert.equal(said.size, 41, `${said.size} one-shots named in the README`);
});

test('the packs: each floor\'s scene sounds are in its own act\'s pack, and no other sound is', () => {
  for (const d of FLOORS) for (const n of sceneSoundsOf(d)) assert.equal(packOf(n), `scene-${sceneAct(d)}`, `${n}, floor ${d}`);
  const all = (fs.readdirSync(DIR) as string[]).filter((f) => f.endsWith('.mp3')).map((f) => f.replace(/_\d+\.mp3$/, ''));
  const inScene = new Set(all.filter((b) => String(packOf(b)).startsWith('scene-')));
  assert.equal(inScene.size, 41, 'only the batch\'s');
  assert.deepEqual([1, 5, 6, 10, 11, 15, 16, 20].map(sceneAct), [1, 1, 2, 2, 3, 3, 4, 4]);
});

test('the moments\' sounds are in the art\'s order: the piece each plays at is the one its sound is of', () => {
  // (game/first5.ts FLOOR_SETS: where each of a floor's three moments is set; the art's order is the films')
  const at = (floor: number, n: number): string => {
    const s = FLOOR_SETS[floor - 1].moments[n];
    return `${s.at}${s.piece ? `: ${s.piece}` : ''}${s.standIn ? ` (${s.standIn})` : ''}`;
  };
  assert.equal(at(1, 1), 'wall: rat hole');
  assert.equal(MOMENT_SOUND[1][1], 'f1_rats');
  assert.equal(at(1, 2), 'thing: candles');
  assert.equal(MOMENT_SOUND[1][2], 'f1_candles');
  assert.equal(at(2, 1), 'thing: the great bell');
  assert.equal(MOMENT_SOUND[2][1], 'f2_bell');
  assert.equal(at(2, 2), 'thing: the gibbet');
  assert.equal(MOMENT_SOUND[2][2], 'f2_gibbet');
  assert.equal(at(3, 0), 'wall (rings and chains)');
  assert.equal(MOMENT_SOUND[3][0], 'f3_chains');
  assert.equal(at(3, 2), 'wall: the cell grate');
  assert.equal(MOMENT_SOUND[3][2], 'f3_bars');
  assert.equal(at(4, 0), 'wall: the skull wall');
  assert.equal(MOMENT_SOUND[4][0], 'f4_wall');
  assert.equal(at(4, 1), 'thing: the mine cart');
  assert.equal(MOMENT_SOUND[4][1], 'f4_cart');
  assert.equal(at(4, 2), 'thing: the charnel heap');
  assert.equal(MOMENT_SOUND[4][2], 'f4_bones');
  assert.equal(at(5, 0), 'floor (the pile of props)');
  assert.equal(MOMENT_SOUND[5][0], 'f5_roof');
  assert.equal(at(5, 1), 'thing: the winding drum');
  assert.equal(MOMENT_SOUND[5][1], 'f5_winch');
  assert.equal(at(5, 2), 'thing: the rift');
  assert.equal(MOMENT_SOUND[5][2], 'f5_rift');
  for (const d of [1, 2, 3, 4, 5]) assert.equal(MOMENT_SOUND[d].length, 3);
  for (const d of [11, 12, 13, 14, 15]) assert.equal(MOMENT_SOUND[d].length, 1);
  assert.equal(momentSound(14, 0), 'f14_screen', 'the House of Quiet\'s screen has one');
  assert.equal(momentSound(6, 0), null);
  SCENE_SOUNDS.on = false;
  try {
    assert.equal(momentSound(1, 0), null, 'switched off: none');
    assert.deepEqual(sceneSoundsOf(3), []);
    assert.equal(bedOf(3), null);
  } finally {
    SCENE_SOUNDS.on = true;
  }
});

test('a floor\'s background goes round at full volume on its floor, and not in town; the furnace is heard near it while it burns', () => {
  const g = onFloor(3);
  const want = loopWants(g, false);
  assert.equal(want.bed_f3, 1, 'floor 3\'s background');
  assert.equal(Object.keys(want).filter((k) => k.startsWith('bed_f')).length, 1, 'one floor\'s at a time');
  const F = g.level.furnace;
  if (F) {
    g.hero.x = F.crank.x;
    g.hero.y = F.crank.y + 0.8;
    assert.ok((loopWants(g, false).furnace ?? 0) > 0.2, 'the furnace, beside it');
    F.out = true;
    F.turnedAt = g.time - CRANK_TIMES.turn - 0.1;
    assert.equal(loopWants(g, false).furnace, undefined, 'out: no more');
  }
  const t = new Game('warrior', 5);
  assert.equal(t.level.town, true);
  assert.equal(Object.keys(loopWants(t, false)).some((k) => k.startsWith('bed_f')), false, 'none in town');
});

test('the strongholds: a word set into the altar and the seal burning away are heard by their own sounds', () => {
  const g = onFloor(6, 3);
  const q = g.level.land?.holds[0];
  if (!q) throw new Error('a stronghold on floor 6');
  g.hero.words.fire = (g.hero.words.fire ?? 0) + 1;
  g.hero.x = q.altar.x + 1.2;
  g.hero.y = q.altar.y + 0.9;
  assert.equal(g.altarWord(q.n, 'fire'), null);
  const a = rec(g, 'altar_word');
  assert.ok(a && a.world && a.or === 'word', 'the altar\'s word, the old sound until it has come');
  assert.equal(g.openHold(q.n), true);
  const s = rec(g, 'seal_burn');
  assert.ok(s && s.world && s.or === 'power', 'the seal');
});

test('a floor whose trap is its own has its own sound, the louder the nearer; the others keep the spikes\'', () => {
  assert.deepEqual(TRAP_SOUND, { 7: 'ledge_crumble', 10: 'bog_step', 18: 'skylight', 19: 'pitch_pour' });
  assert.deepEqual(trapSound(6, 3), { name: 'trap_spikes', vol: 0.55 });
  assert.equal(trapSound(7, 0).name, 'ledge_crumble');
  assert.ok(trapSound(7, 0).vol > trapSound(7, 6).vol && trapSound(7, 8.9).vol >= 0.3);
  for (const d of [7, 10, 18, 19]) assert.ok(sceneSoundsOf(d).includes(TRAP_SOUND[d]), `floor ${d}'s is fetched with it`);
});

type Inside = {
  stepShaft(dt: number): void;
  turnCrank(p: PropInst): void;
  runLater(dt: number): void;
  singStones(): void;
  updatePortcullises(dt: number): void;
};

test('the mine shaft\'s cage: the blows made in code at its jolts are stand-ins for the ride\'s own sound', () => {
  const g = onFloor(5);
  const sh = g.level.ways?.shaft;
  if (!sh) throw new Error('floor 5 has its shaft');
  sh.state = 'coming';
  sh.t = 0;
  const a = g as unknown as Inside;
  for (let k = 0; k < Math.ceil(SHAFT.down * 30) + 2; k++) a.stepShaft(1 / 30);
  const blows = g.events.filter((e) => e.t === 'sfx' && e.standsFor === 'cage_down');
  assert.equal(blows.length, SHAFT.downJolts.length, 'one at each jolt, each a stand-in');
  assert.equal(sh.state, 'down');
  assert.ok(sceneSoundsOf(5).includes('cage_down') && sceneSoundsOf(5).includes('cage_up'));
});

test('the Stoker\'s crank: the gear, the turn, then the furnace dying as the turn ends', () => {
  const g = onFloor(3);
  const F = g.level.furnace;
  if (!F) return;
  const a = g as unknown as Inside;
  g.hero.furnace = 'gear';
  a.turnCrank(F.crank);
  assert.ok(rec(g, 'crank_gear'), 'the gear set in, at once');
  assert.equal(rec(g, 'crank_turn'), undefined);
  a.runLater(CRANK_SOUND.turnAt + 0.01);
  assert.ok(rec(g, 'crank_turn'), 'its turn');
  assert.equal(rec(g, 'furnace_out'), undefined, 'the furnace burns until the turn is done');
  a.runLater(CRANK_TIMES.turn);
  assert.ok(rec(g, 'furnace_out'), 'and dies');
  // (the fire in the Chained One's gateway, where it is shown going out: a long way off, so heard quieter, a moment after)
  const g2 = onFloor(3);
  const F2 = g2.level.furnace;
  const was = STOKER_ON.on;
  STOKER_ON.on = true;
  try {
    if (F2 && F2.gate >= 0) {
      g2.hero.furnace = 'gear';
      (g2 as unknown as Inside).turnCrank(F2.crank);
      (g2 as unknown as Inside).runLater(CRANK_TIMES.turn + CRANK_SOUND.gateAfter - 0.05);
      assert.equal(rec(g2, 'gate_fire_out'), undefined);
      (g2 as unknown as Inside).runLater(0.1);
      const fire = rec(g2, 'gate_fire_out');
      assert.ok(fire && (fire.vol ?? 0) >= CRANK_SOUND.gateFar && (fire.vol ?? 0) <= 1, 'the gateway\'s fire, heard from far off');
    }
  } finally {
    STOKER_ON.on = was;
  }
});

test('the singing stones hum as he comes up to one: once, and again only when he has gone off and come back', () => {
  const g = onFloor(8, 3);
  const L: Level = g.level;
  // (a stone of the floor's, or one stood for the test where its dice laid none)
  let stone = L.props.find((p) => p.kind === 'piece' && p.name === SINGING.name);
  if (!stone) {
    stone = { kind: 'piece', name: SINGING.name, tx: Math.floor(g.hero.x) + 6, ty: Math.floor(g.hero.y), x: g.hero.x + 6, y: g.hero.y, solid: false, state: 0, variant: 0 };
    L.props.push(stone);
  }
  const a = g as unknown as Inside;
  const hums = (): number => recs(g).filter((e) => e.name === 'singing_stones').length;
  g.hero.x = stone.x + SINGING.far + 6;
  g.hero.y = stone.y;
  a.singStones();
  const far = hums();
  g.hero.x = stone.x + 1;
  a.singStones();
  assert.equal(hums(), far + 1, 'it hums');
  a.singStones();
  a.singStones();
  assert.equal(hums(), far + 1, 'and not again while he stands by it');
  g.hero.x = stone.x + SINGING.far + 6;
  a.singStones();
  (g as unknown as { time: number }).time += SINGING.gap + 0.1;
  g.hero.x = stone.x + 1;
  a.singStones();
  assert.equal(hums(), far + 2, 'again as he comes back');
});

test('the portcullis: its sound is begun the chain\'s length before the slam, once a fall, and the slam in code stands in for it', async () => {
  const { HIGH_CITY } = await import('../src/game/act1');
  const { portcullisesOf, stepPortcullises } = await import('../src/game/act2/keep_rules');
  const { paintWithoutCanvas } = await import('./helpers');
  paintWithoutCanvas();
  const was = HIGH_CITY.on;
  HIGH_CITY.on = true;
  try {
    const g = onFloor(19, 4);
    const L = g.level;
    const ps = portcullisesOf(L);
    assert.ok(ps.length >= 1, 'portcullises on the floor');
    const s = ps[0];
    const mx = s.at.alongX ? s.at.x + s.at.n / 2 : s.at.x + 0.5;
    const my = s.at.alongX ? s.at.y + 0.5 : s.at.y + s.at.n / 2;
    // (the rule itself: the chain let go PORT_SOUND_LEAD before the slam, once)
    const by = { x: mx + 3, y: my + 3 };
    let t = 0;
    let chainAt = -1;
    let slamAt = -1;
    let chained = 0;
    for (let k = 0; k < 30 * (PORTCULLIS.up + PORTCULLIS.warn + 2) && slamAt < 0; k++) {
      const chains: PortState[] = [];
      const slammed = stepPortcullises(L, by, 1 / 30, chains);
      t += 1 / 30;
      if (chains.includes(s)) {
        chained++;
        chainAt = t;
      }
      if (slammed.includes(s)) slamAt = t;
    }
    assert.equal(chained, 1, 'once a fall');
    assert.ok(slamAt > 0 && Math.abs(slamAt - chainAt - PORT_SOUND_LEAD) < 2 / 30 + 1e-6, `the slam ${(slamAt - chainAt).toFixed(3)} s after the chain`);
    // (and in the game: its sound asked for at its own pitch, then the slam made in code as its stand-in)
    const a = g as unknown as Inside;
    g.monsters.length = 0;
    g.hero.x = by.x;
    g.hero.y = by.y;
    g.events.length = 0;
    let order = '';
    for (let k = 0; k < 30 * (PORTCULLIS.down + PORTCULLIS.rise + PORTCULLIS.up + PORTCULLIS.warn + 2) && !order.includes('slam'); k++) {
      const n = g.events.length;
      a.updatePortcullises(1 / 30);
      for (const e of g.events.slice(n)) {
        if (e.t === 'rec' && e.name === 'portcullis') {
          assert.ok(e.world && e.exact, 'through the world\'s bus, at its own pitch');
          order += 'chain ';
        }
        if (e.t === 'sfx' && e.name === 'slam') {
          assert.equal(e.standsFor, 'portcullis');
          order += 'slam';
        }
      }
    }
    assert.ok(/^(chain )+slam$/.test(order), `the chain, then the slam (${order})`);
  } finally {
    HIGH_CITY.on = was;
  }
});

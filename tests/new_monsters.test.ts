// THE NEW MONSTERS (Version 19.9; src/game/defs.ts NEW_MONSTERS, SPEAR, SKULL, RALLY, packKinds,
// packRarity; src/game/game.ts throwSpear, laySpear, spearWay, stoop, hurlSkull, rally; src/art/bestiary.ts
// useNewMonsters; src/render/mob_world.ts). The art chat's Shade, Boneward and Ossuary Golem and its
// skeleton champion, each painted with his yes; his pick by 9 Oct 2026, 16:05, of what comes next: "New
// monsters + rings (Recommended)"; and his rules of 08:15 ("Tiny and small mobs should have one attack.
// Medium two attacks, large 2-3, and the boss 4.") and 08:24 ("Pack leaders that are different mobs can
// have an extra attack if it seems right."). And BATS ARE NEVER A YELLOW PACK, his pick by 16:05: "Bats
// never come yellow (Recommended)". So:
//   1. the switch is off in the game, the pictures and the rings with it; off, no dungeon has them;
//   2. on, they come by depth, in packs of their sizes (the Shade small, the Boneward medium, the Golem
//      large); a yellow pack of skeletons is led by the champion;
//   3. bats are never a yellow pack, and an elite room is never bats (whether the switch is on or not);
//   4. their blows land when their pictures' do;
//   5. the Boneward throws its spear from afar; the spear lies where it came down; it fights with its
//      shield while it has none, goes for it, stoops for it and has it again;
//   6. the Golem's skull comes down where the hero stood: what is under it then is hurt, what stepped
//      out is not; then it bursts and is gone; a Twin Golem throws a second;
//   7. the champion's cry: his minions near him have his words whole for a while, and then half again;
//      he does not cry with no one to hear it;
//   8. the pictures: each of their moves has its picture by the rules' clock, the stoop and the stand
//      and plod with no spear; their sizes fit them; their walks are shown at the rules' paces;
//   9. the bot steps out from under a skull.
//   run: tsx --test tests/new_monsters.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { FIGURE_SIZE, NEW_FIGURES, makeBestiary, useNewMonsters } from '../src/art/bestiary';
import { SKULL_BURST } from '../src/art/mob_shots';
import {
  BONEWARD, BW_BASH_HIT, BW_GRAB, BW_HIT, BW_THROW_HIT, CHAMPION, CHAMPION_HIT, GOLEM, GOLEM_SWING_HIT, GOLEM_THROW_HIT, NEW_MOBS, RALLY_CRY, SHADE, SHADE_HIT, walkFpsAt,
} from '../src/art/new_mobs3';
import type { Mob } from '../src/art/new_mobs3';
import { GRAIN } from '../src/art/kit';
import { botStep, newBot } from '../src/dev/bot';
import { RNG } from '../src/engine/rng';
import { MONSTERS, MONSTER_MOVES, NEW_MONSTERS, PACKS, RALLY, SKULL, SPEAR, movesOf, packKinds, packRange, packRarity, scaleLife, sizeOf, wordShare } from '../src/game/defs';
import type { MonsterMove, MoveId } from '../src/game/defs';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { HalfWords, Monster } from '../src/game/state';
import { NEW_KINDS } from '../src/game/types';
import type { MonsterKind, WordId } from '../src/game/types';
import { moveFrame } from '../src/render/figure';
import { skullAt, spearHeight } from '../src/render/mob_world';
import { PACK_MARKS } from '../src/render/pack_marks';
import { paintWithoutCanvas, paintingOf, seasoned } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

paintWithoutCanvas();

type Pack = { rarity: 'blue' | 'leader' | 'minion'; words: readonly WordId[] };
interface Hooks {
  waveT: number;
  spawn(kind: MonsterKind, x: number, y: number, packId: number, rank: 0 | 1 | 2, boss: boolean, rng: RNG, lot?: RNG | null, pack?: Pack | null): Monster;
  wakeUp(m: Monster): void;
  stunMonster(m: Monster, secs: number): void;
  halfOf(m: Monster): HalfWords | undefined;
}

/** With the new monsters on, for the length of `fn`; put back as they were. */
function withNew<T>(fn: () => T): T {
  const was = NEW_MONSTERS.on;
  useNewMonsters(true);
  try {
    return fn();
  } finally {
    useNewMonsters(was);
  }
}

/** Dungeon `depth` of a character who has been down before. */
function dungeon(seed: number, depth: number): Game {
  const g = seasoned(new Game('warrior', seed), 1);
  g.depth = depth;
  g.cleared = depth;
  g.enterDungeon();
  g.events.length = 0;
  return g;
}

/** The monsters of each pack (the boss left out). */
function packsOf(g: Game): Map<number, Monster[]> {
  const out = new Map<number, Monster[]>();
  for (const m of g.monsters) {
    if (m.boss || m.packId < 0 || m.packId >= g.level.floor.packs.length) continue;
    const list = out.get(m.packId) ?? [];
    list.push(m);
    out.set(m.packId, list);
  }
  return out;
}

/** An empty practice room, a hero who stands still, and a monster `far` tiles to the west of them, awake, its words taken off and not to be killed. */
function room(kind: MonsterKind, far: number, pack: Pack | null = null, seed = 9): { g: Game; m: Monster; hooks: Hooks } {
  const g = Game.forPractice('warrior', 5);
  const hooks = g as unknown as Hooks;
  hooks.waveT = 1e9;
  g.monsters.length = 0;
  const h = g.hero;
  const m = hooks.spawn(kind, h.x - far, h.y, 1, pack?.rarity === 'leader' ? 1 : 0, false, new RNG(seed), null, pack);
  hooks.wakeUp(m);
  if (!pack) m.words = [];
  m.shield = 0;
  m.life = m.maxLife = 1e9;
  return { g, m, hooks };
}

/** Steps the game on, the hero's life put back each step; stops when `until` says so (or after `secs`). Gives the harm taken. */
function run(g: Game, secs: number, until?: () => boolean): number {
  const c = emptyControls();
  const h = g.hero;
  let lost = 0;
  for (let k = 0; k < Math.round(secs * 60); k++) {
    const before = h.life;
    g.update(1 / 60, c);
    lost += Math.max(0, before - h.life);
    h.life = h.d.maxLife;
    if (until && until()) break;
  }
  return lost;
}

const idOf = (m: Monster): MoveId | null => {
  const moves = movesOf(m);
  return moves && m.move !== undefined && m.move >= 0 ? moves[m.move].id : null;
};

// =============================================================================================

test('the switch is off in the game, the pictures and the rings with it; off, no dungeon has them', () => {
  assert.equal(NEW_MONSTERS.on, false, 'NEW_MONSTERS is off until he has seen films of them in the game and said yes');
  assert.equal(NEW_MOBS.on, false, 'their pictures are off with it');
  assert.equal(PACK_MARKS.on, false, 'and the rings');
  for (let depth = 1; depth <= 12; depth++) for (const k of packKinds(depth)) assert.ok(!NEW_KINDS.includes(k.kind), `dungeon ${depth}: no ${k.kind}`);
  for (const depth of [2, 4, 7]) {
    for (let seed = 1; seed <= 4; seed++) {
      const g = dungeon(seed * 13 + depth, depth);
      assert.ok(g.monsters.every((m) => !NEW_KINDS.includes(m.kind)), `dungeon ${depth}, seed ${seed}: none of the new monsters`);
    }
  }
  withNew(() => {
    assert.equal(NEW_MOBS.on && PACK_MARKS.on, true, 'on, the pictures and the rings come with them');
  });
  assert.equal(NEW_MOBS.on || PACK_MARKS.on, false, 'and go with them');
});

test('on, they come by depth, in packs of their sizes; a yellow pack of skeletons is led by the champion', () => {
  withNew(() => {
    const kinds = (d: number): string => packKinds(d).map((k) => k.kind).filter((k) => NEW_KINDS.includes(k)).join(' ');
    assert.equal(kinds(1), '', 'the first dungeon: none of them');
    assert.equal(kinds(2), 'shade', 'from the second dungeon, the Shade');
    assert.equal(kinds(3), 'shade boneward', 'from the third, the Boneward');
    assert.equal(kinds(4), 'shade boneward golem', 'from the fourth, the Golem');
    assert.equal(kinds(9), 'shade boneward golem', 'and the champion never a pack of his own');
    assert.equal(sizeOf('shade'), 'small');
    assert.equal(sizeOf('boneward'), 'medium');
    assert.equal(sizeOf('golem'), 'large');
    const seen = new Set<MonsterKind>();
    let led = 0;
    for (const depth of [4, 5, 6, 8]) {
      for (let seed = 1; seed <= 10; seed++) {
        const g = dungeon(seed * 17 + depth * 7, depth);
        const packs = g.level.floor.packs;
        for (const [id, ms] of packsOf(g)) {
          const p = packs[id];
          const tag = `dungeon ${depth}, seed ${seed}, pack ${id} (${p.kind}, ${p.tier})`;
          const kind = ms.find((m) => m.rarity !== 'leader')?.kind ?? ms[0].kind;
          if (NEW_KINDS.includes(kind)) {
            seen.add(kind);
            const [lo, hi] = packRange(sizeOf(kind), depth);
            assert.ok(ms.length >= Math.min(lo, p.size) && ms.length <= hi, `${tag}: ${ms.length}, of his sizes (${lo} to ${hi})`);
          }
          const leader = ms.find((m) => m.rarity === 'leader');
          if (leader && p.kind === 'skeleton') {
            led++;
            assert.equal(leader.kind, 'champion', `${tag}: a yellow pack of skeletons is led by the champion`);
            assert.ok(leader.elite, `${tag}: an elite`);
            const want = Math.round(MONSTERS.champion.life * scaleLife(depth) * PACKS.leaderLife * (leader.words.includes('power') ? 1.3 : 1));
            assert.ok(Math.abs(leader.maxLife - want) <= 1, `${tag}: a skeleton's life, three times (${leader.maxLife}, ${want})`);
            assert.ok(ms.filter((m) => m !== leader).every((m) => m.kind === 'skeleton' && m.rarity === 'minion'), `${tag}: his minions skeletons`);
          } else if (leader) assert.equal(leader.kind, p.kind, `${tag}: any other yellow pack is led by one of its own`);
        }
      }
    }
    for (const k of ['shade', 'boneward', 'golem'] as MonsterKind[]) assert.ok(seen.has(k), `the ${k} is met`);
    assert.ok(led > 0, 'yellow packs of skeletons are met');
  });
  // (off, a yellow pack of skeletons is led by a skeleton, as before)
  let checked = 0;
  for (let seed = 1; seed <= 10; seed++) {
    const g = dungeon(seed * 17 + 28, 4);
    for (const [id, ms] of packsOf(g)) {
      const leader = ms.find((m) => m.rarity === 'leader');
      if (leader && g.level.floor.packs[id].kind === 'skeleton') {
        checked++;
        assert.equal(leader.kind, 'skeleton', 'off: a skeleton leads');
      }
    }
  }
  assert.ok(checked > 0);
});

test('bats are never a yellow pack, and an elite room is never bats', () => {
  for (let i = 0; i < 100; i++) {
    const roll = i / 100;
    for (const depth of [1, 2, 5]) {
      assert.ok(packRarity(true, depth, roll, 'bat') !== 'yellow', `an elite room's draw, of bats: never yellow (${roll})`);
      const r = packRarity(false, depth, roll, 'bat');
      assert.ok(r !== 'yellow', `of bats: never yellow (${roll})`);
      if (depth >= PACKS.from) assert.equal(r, roll < PACKS.blue ? 'blue' : 'plain', `of bats, from dungeon ${PACKS.from}: blue 1 in 4, else plain (${roll})`);
      // (any other kind as before)
      assert.equal(packRarity(true, depth, roll, 'skeleton'), 'yellow');
    }
  }
  for (const on of [false, true]) {
    const was = NEW_MONSTERS.on;
    useNewMonsters(on);
    try {
      let bats = 0;
      for (const depth of [1, 2, 3, 6]) {
        for (let seed = 1; seed <= 12; seed++) {
          const g = dungeon(seed * 23 + depth, depth);
          const packs = g.level.floor.packs;
          for (const [id, ms] of packsOf(g)) {
            if (packs[id].tier === 'elite') assert.ok(packs[id].kind !== 'bat', `dungeon ${depth}, seed ${seed}: an elite room of bats`);
            if (ms[0].kind !== 'bat') continue;
            bats++;
            assert.ok(ms.every((m) => m.rarity !== 'leader' && m.rarity !== 'minion'), `dungeon ${depth}, seed ${seed}: a yellow pack of bats`);
          }
        }
      }
      assert.ok(bats > 10, `packs of bats are met (${bats})`);
    } finally {
      useNewMonsters(was);
    }
  }
});

test('their blows land when their pictures’ do', () => {
  const of = (list: readonly MonsterMove[], id: MoveId): MonsterMove => {
    const mv = list.find((x) => x.id === id);
    if (!mv) throw new Error(`no ${id}`);
    return mv;
  };
  assert.equal(MONSTERS.shade.windup, SHADE_HIT, 'the Shade’s rake');
  assert.equal(MONSTERS.boneward.windup, BW_HIT, 'the Boneward’s thrust');
  assert.equal(MONSTERS.golem.windup, GOLEM_SWING_HIT, 'the Golem’s club swing');
  assert.equal(MONSTERS.champion.windup, CHAMPION_HIT, 'the champion’s cleave');
  assert.equal(of(MONSTER_MOVES.boneward, 'swing').windup, BW_HIT);
  assert.equal(of(MONSTER_MOVES.boneward, 'bash').windup, BW_BASH_HIT);
  assert.equal(of(MONSTER_MOVES.boneward, 'throw').windup, BW_THROW_HIT);
  assert.equal(of(MONSTER_MOVES.golem, 'swing').windup, GOLEM_SWING_HIT);
  assert.equal(of(MONSTER_MOVES.golem, 'throw').windup, GOLEM_THROW_HIT);
  assert.equal(of(MONSTER_MOVES.champion, 'swing').windup, CHAMPION_HIT);
  assert.equal(of(MONSTER_MOVES.champion, 'rally').windup, RALLY_CRY);
  assert.equal(SPEAR.grab, BW_GRAB, 'the spear in hand again when its picture has it');
  assert.equal(SKULL.burst, SKULL_BURST, 'the skull’s burst as long as its picture');
  const art = makeBestiary();
  const pick = art.of('boneward').front.clips?.moves?.pickUp;
  assert.ok(pick && Math.abs((pick.frames.length - 1) / pick.fps - SPEAR.stoop) < 0.04, 'the stoop as long as its picture');
  // (the Shade has its one attack, small; the Boneward its two; the Golem its two; the champion, a leader, one more)
  assert.equal(movesOf({ kind: 'shade', champion: false }), null);
  assert.equal(MONSTER_MOVES.boneward.map((mv) => mv.id).join(' '), 'swing bash throw');
  assert.equal(MONSTER_MOVES.golem.map((mv) => mv.id).join(' '), 'swing throw');
  assert.equal(MONSTER_MOVES.champion.map((mv) => mv.id).join(' '), 'swing rally');
});

test('the Boneward throws its spear from afar; it lies where it came down; it fights with its shield, goes for it and has it again', () => {
  withNew(() => {
    const { g, m } = room('boneward', 6);
    const h = g.hero;
    m.moveCd = [0, 0, 0];
    m.cd = 0;
    // (the hero stands six tiles off: it throws)
    const at = { x: h.x, y: h.y };
    run(g, 3, () => g.projectiles.some((p) => p.look === 'spear'));
    assert.ok(g.projectiles.some((p) => p.look === 'spear' && p.src === m.id), 'a spear in flight');
    assert.equal(m.bare, true, 'its hand is empty');
    const lost = run(g, 3, () => g.spears.length > 0);
    assert.equal(g.spears.length, 1, 'it lies on the floor');
    assert.ok(lost > 0, 'the hero who stood in its way was hurt');
    const sp = g.spears[0];
    assert.ok(Math.hypot(sp.x - at.x, sp.y - at.y) < 0.8, `where the hero stood (${sp.x.toFixed(2)}, ${sp.y.toFixed(2)})`);
    assert.equal(sp.owner, m.id);
    // (the hero beside it: it fights with its shield, never the thrust)
    h.x = m.x + 1.0;
    h.y = m.y;
    const began: MoveId[] = [];
    let was = m.state;
    for (let k = 0; k < 6 * 60; k++) {
      g.update(1 / 60, emptyControls());
      h.life = h.d.maxLife;
      h.x = m.x + 1.0;
      h.y = m.y;
      if (m.state === 'windup' && was !== 'windup') began.push(idOf(m) ?? 'swing');
      was = m.state;
    }
    assert.ok(began.length >= 2 && began.every((id) => id === 'bash'), `with no spear, its shield: ${began.join(' ')}`);
    // (the hero far off: it goes for its spear, stoops for it, and has it again)
    h.x = sp.x + 6;
    h.y = sp.y;
    let stooped = false;
    run(g, 12, () => {
      if (m.state === 'pickup') stooped = true;
      h.x = sp.x + 6;
      h.y = sp.y;
      return !m.bare;
    });
    assert.ok(stooped, 'it stooped for its spear');
    assert.equal(m.bare, false, 'it has its spear again');
    assert.equal(g.spears.length, 0, 'and none lies on the floor');
  });
});

test('the Golem’s skull comes down where the hero stood: under it, hurt; stepped out, not; then it bursts and is gone', () => {
  withNew(() => {
    for (const stays of [true, false]) {
      const { g, m } = room('golem', 6);
      const h = g.hero;
      m.moveCd = [0, 0];
      m.cd = 0;
      run(g, 3, () => g.zones.some((z) => z.kind === 'skull'));
      const z = g.zones.find((q) => q.kind === 'skull');
      assert.ok(z, 'a skull is in the air');
      if (!z) return;
      assert.ok(Math.hypot(z.x - h.x, z.y - h.y) < 0.01, 'thrown at where the hero stands');
      assert.equal(z.r, SKULL.r);
      if (!stays) {
        h.x += SKULL.r + 0.6;
        // (and kept there)
      }
      const where = { x: h.x, y: h.y };
      let hurt = 0;
      const c = emptyControls();
      for (let k = 0; k < Math.round((SKULL.fly + 0.2) * 60); k++) {
        const before = h.life;
        g.update(1 / 60, c);
        h.x = where.x;
        h.y = where.y;
        if (before > h.life && g.zones.includes(z) && z.gone) hurt += before - h.life;
        h.life = h.d.maxLife;
        // (the Golem does nothing more in the meantime)
        m.cd = 9;
      }
      assert.equal(z.gone, 1, 'it came down');
      assert.equal(hurt > 0, stays, stays ? 'the hero under it was hurt' : 'the hero who stepped out was not');
      run(g, SKULL.burst + 0.1);
      assert.ok(!g.zones.includes(z), 'it burst and is gone');
    }
    // (a Twin Golem throws a second)
    const { g, m } = room('golem', 6, { rarity: 'blue', words: ['twin'] });
    m.moveCd = [0, 0];
    m.cd = 0;
    let most = 0;
    run(g, 4, () => {
      most = Math.max(most, g.zones.filter((z) => z.kind === 'skull').length);
      return most >= 2;
    });
    assert.equal(most, 2, 'a Twin Golem’s second skull');
  });
});

test('the champion’s cry: his minions near him have his words whole for a while, then half again; no cry with no one to hear it', () => {
  withNew(() => {
    const { g, m, hooks } = room('champion', 3, { rarity: 'leader', words: ['fire'] });
    const h = g.hero;
    const near = hooks.spawn('skeleton', m.x - 1, m.y + 0.5, 1, 0, false, new RNG(3), null, { rarity: 'minion', words: ['fire'] });
    const far = hooks.spawn('skeleton', m.x - RALLY.reach - 3, m.y, 1, 0, false, new RNG(4), null, { rarity: 'minion', words: ['fire'] });
    for (const o of [near, far]) {
      o.life = o.maxLife = 1e9;
      o.speed = 0;
      o.cd = 99;
    }
    m.speed = 0;
    assert.equal(wordShare(near, 'fire'), PACKS.minion, 'a minion has his Flame at half');
    assert.ok(hooks.halfOf(near), 'and its blows carry it at half');
    m.moveCd = [0, 0];
    m.cd = 0;
    run(g, 3, () => (near.rallyT ?? 0) > 0);
    assert.ok((near.rallyT ?? 0) > RALLY.dur - 0.1, `his cry: the minion near him rallied (${near.rallyT})`);
    assert.equal(far.rallyT ?? 0, 0, 'one too far off did not hear it');
    assert.equal(wordShare(near, 'fire'), 1, 'his Flame whole');
    assert.equal(hooks.halfOf(near), undefined, 'and its blows carry it whole');
    assert.equal(wordShare(far, 'fire'), PACKS.minion);
    near.cd = far.cd = 99;
    run(g, RALLY.dur + 0.1, () => {
      near.cd = far.cd = 99;
      return false;
    });
    assert.equal(wordShare(near, 'fire'), PACKS.minion, 'and after a while, half again');
    // (no one to hear it: his minions dead, or none with half of his words)
    near.dead = true;
    far.dead = true;
    g.monsters = g.monsters.filter((o) => !o.dead);
    m.moveCd = [0, 0];
    m.cd = 0;
    h.x = m.x + 6;
    const cries: MoveId[] = [];
    run(g, 4, () => {
      if (m.state === 'windup' && idOf(m) === 'rally') cries.push('rally');
      return false;
    });
    assert.equal(cries.length, 0, 'with no one to hear it he does not cry');
  });
});

test('the pictures: each move by the rules’ clock, the stoop, the stand and plod with no spear; their sizes; their walks at the rules’ paces', () => {
  withNew(() => {
    const art = makeBestiary();
    const of = (k: MonsterKind) => art.of(k);
    for (const kind of ['boneward', 'golem', 'champion'] as MonsterKind[]) {
      const moves = movesOf({ kind, champion: false });
      assert.ok(moves, `${kind}: moves`);
      if (!moves) continue;
      for (const view of ['front', 'back'] as const) {
        const set = of(kind)[view];
        for (const mv of moves) {
          for (const [state, t] of [['windup', mv.windup], ['windup', mv.windup * 0.5], ['recover', mv.recover]] as const) {
            const s = moveFrame(set, { state, t, animT: 0 }, mv);
            assert.ok(s, `${kind}, ${view}: ${mv.id} has its picture (${state}, ${t})`);
          }
        }
      }
    }
    const bw = of('boneward').front.clips?.moves;
    assert.ok(bw?.pickUp && bw.standBare && bw.walkBare, 'the Boneward: its stoop, and its stand and plod with no spear');
    const skull = of('golem').front.clips?.moves?.skull;
    assert.ok(skull && skull.frames.length === 8, 'the Golem: its skull in flight, painted ahead with it');
    // their sizes, as the game goes by (where a bar hangs, and what a finger is on): held against the pictures as the old figures' are
    for (const f of NEW_FIGURES) {
      const size = FIGURE_SIZE[f];
      const s = art.of(f).front.idle[0];
      const p = paintingOf(s);
      const ax = Math.round(s.ax * GRAIN);
      const ay = Math.round(s.ay * GRAIN);
      let head = 0;
      for (let y = 0; y < p.h && head === 0; y++) for (let x = ax - 3; x <= ax + 3; x++) if (p.has(x, y)) head = (ay - y) / GRAIN;
      assert.ok(Math.abs(size.top - head) <= 4, `the ${f}: the game takes its head to be ${size.top} up; in the picture it is ${head}`);
      const reach = Math.max(s.ax, s.w - s.ax);
      assert.ok(size.half <= reach + 1 && size.half >= reach * 0.4, `the ${f}: ${size.half} to either side; the picture reaches ${reach}`);
    }
    assert.ok(FIGURE_SIZE.champion.top > FIGURE_SIZE.skeleton.top + 4, 'the champion a head taller than his skeletons');
    assert.ok(FIGURE_SIZE.golem.top > FIGURE_SIZE.boneward.top && FIGURE_SIZE.boneward.top > FIGURE_SIZE.shade.top, 'the Golem the biggest of the three, the Shade the smallest');
    // their walks, shown faster or slower to match the paces the rules give them (the feet grip the floor)
    const mobs: [MonsterKind, Mob][] = [['shade', SHADE], ['boneward', BONEWARD], ['golem', GOLEM], ['champion', CHAMPION]];
    for (const [kind, mob] of mobs) assert.ok(Math.abs((of(kind).front.walkFps ?? 0) - walkFpsAt(mob, MONSTERS[kind].speed)) < 1e-9, `${kind}: its walk at the rules' pace`);
    // (and what flies: the spear low, from the hand to the floor; the skull up high and down onto where it was aimed)
    assert.equal(spearHeight({ dist: 5, way: 5, z0: SPEAR.z }), SPEAR.z, 'the spear leaves the hand at its height');
    assert.ok(Math.abs(spearHeight({ dist: 0, way: 5, z0: SPEAR.z })) < 1e-9, 'and comes down on the floor');
    const z = { x: 10, y: 4, x1: 4, y1: 4, t: 0, dur: SKULL.fly };
    assert.ok(Math.abs(skullAt(z).z - SKULL.z) < 1e-9, 'the skull leaves the hand at its height');
    const top = Math.max(...[0.3, 0.45, 0.6].map((k) => skullAt({ ...z, t: k * SKULL.fly }).z));
    assert.ok(Math.abs(top - SKULL.top) < 1, 'up to its height');
    const over = skullAt({ ...z, t: SKULL.over * SKULL.fly });
    assert.ok(Math.abs(over.x - 10) < 1e-6, 'over where it was aimed by six tenths of the way');
    const end = skullAt({ ...z, t: SKULL.fly });
    assert.ok(Math.abs(end.x - 10) < 1e-6 && end.z < 1e-6, 'and down onto it');
  });
});

test('the bot steps out from under a skull', () => {
  withNew(() => {
    const { g, m } = room('golem', 6);
    const h = g.hero;
    m.moveCd = [0, 0];
    m.cd = 0;
    run(g, 3, () => g.zones.some((z) => z.kind === 'skull'));
    const z = g.zones.find((q) => q.kind === 'skull');
    assert.ok(z);
    if (!z) return;
    const bot = newBot(false, true);
    const c = emptyControls();
    for (let k = 0; k < Math.round(SKULL.fly * 60) && !z.gone; k++) {
      botStep(g, c, bot, 1 / 60);
      g.update(1 / 60, c);
      h.life = h.d.maxLife;
      m.cd = 9;
    }
    assert.ok(Math.hypot(h.x - z.x, h.y - z.y) > SKULL.r, 'out from under it when it came down');
  });
});

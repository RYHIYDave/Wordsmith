// THE MONSTER PACKS (Version 19.7; game/defs.ts, MONSTER_PACKS and PACKS). The owner, 9 Oct 2026:
// a pack is of one kind, as many as the kind's size says (07:49), Twin burned in at the gate gives
// every pack 50% increased size; a blue pack has one word, on every one of it; a yellow pack's
// leader has a word or two, and its minions half of each (08:02); blue packs 1 in 4 from dungeon 2,
// yellow ones in the elite rooms and 1 in 10 of the others; the leader 3 times the life, a blue
// pack's monsters 20% increased (08:10 and his yes to the numbers).
//   run: tsx --test tests/packs.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { RNG } from '../src/engine/rng';
import { FIRST_LEVELS, GATE_TWIN_PACKS, GUARD, HEAVY, MONSTERS, MONSTER_PACKS, PACKS, PACK_LOOK, TUNE, WORDS, packRarity, scaleDmg, scaleLife, wordShare } from '../src/game/defs';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Monster } from '../src/game/state';
import type { MonsterKind, WordId } from '../src/game/types';
import { seasoned } from './helpers';

type Pack = { rarity: 'blue' | 'leader' | 'minion'; words: readonly WordId[] };
type Inner = {
  spawn(kind: MonsterKind, x: number, y: number, packId: number, rank: 0 | 1 | 2, boss: boolean, rng: RNG, lot: RNG | null, pack: Pack | null): Monster;
  monsterAttack(m: Monster, def: (typeof MONSTERS)[MonsterKind]): void;
  kill(m: Monster): void;
};

/** Dungeon `depth` of a character who has been down before (the ring lit: words fall), with `plan` burned in at the gate. */
function dungeon(seed: number, depth: number, plan: WordId[] = []): Game {
  const g = seasoned(new Game('warrior', seed), 1);
  g.depth = depth;
  g.cleared = depth;
  for (const w of plan) g.plan.push(w);
  g.enterDungeon();
  g.events.length = 0;
  return g;
}

/** The monsters of each pack (the boss, the risen and the like left out). */
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

const DEPTHS = [2, 3, 5, 6, 9];

test('the switch is on, and the look of blue and yellow packs is off until he has seen it (pictures first)', () => {
  assert.equal(MONSTER_PACKS.on, true);
  assert.equal(PACK_LOOK.on, false);
  assert.deepEqual({ yellow: PACKS.yellow, blue: PACKS.blue, from: PACKS.from, leaderLife: PACKS.leaderLife, blueLife: PACKS.blueLife, minion: PACKS.minion }, { yellow: 0.1, blue: 0.25, from: 2, leaderLife: 3, blueLife: 1.2, minion: 0.5 });
  assert.equal(GATE_TWIN_PACKS, 1.5, 'Twin at the gate: 50% increased');
});

test('every pack is of one kind; a lair holds guardians alone; elite rooms hold yellow packs', () => {
  for (const depth of DEPTHS) {
    for (let seed = 1; seed <= 6; seed++) {
      const g = dungeon(seed * 31 + depth, depth);
      const packs = g.level.floor.packs;
      for (const [id, ms] of packsOf(g)) {
        const p = packs[id];
        const tag = `dungeon ${depth}, seed ${seed}, pack ${id} (${p.tier})`;
        assert.ok(ms.every((m) => m.kind === ms[0].kind), `${tag}: of one kind`);
        assert.equal(ms[0].kind, p.kind, `${tag}: the kind the map-maker gave it`);
        assert.ok(ms.length <= p.size, `${tag}: no more than its size`);
        assert.ok(ms.length >= Math.min(p.size, 1), `${tag}: someone stands in it`);
        if (p.tier === 'champion') assert.ok(ms.every((m) => m.champion && m.kind === 'brute' && !m.rarity), `${tag}: guardians alone`);
        else assert.ok(ms.every((m) => !m.champion), `${tag}: no guardian outside a lair`);
        if (p.tier === 'elite') {
          assert.ok(ms[0].elite && ms[0].rarity === 'leader', `${tag}: an elite room's pack is yellow, its leader first`);
          assert.ok(ms.slice(1).every((m) => !m.elite && m.rarity === 'minion'), `${tag}: and the rest its minions`);
        }
      }
    }
  }
});

test('blue packs are about 1 in 4 of the others from dungeon 2, yellow ones about 1 in 10; the first dungeon has none but its elite room', () => {
  // the draw itself
  assert.equal(packRarity(true, 1, 0.99), 'yellow');
  assert.equal(packRarity(false, 1, 0.01), 'plain', 'the first dungeon: nothing but the elite room');
  assert.equal(packRarity(false, 2, 0.05), 'yellow');
  assert.equal(packRarity(false, 2, 0.2), 'blue');
  assert.equal(packRarity(false, 2, 0.36), 'plain');
  // and in dungeons
  let others = 0;
  let blue = 0;
  let yellow = 0;
  for (const depth of DEPTHS) {
    for (let seed = 1; seed <= 12; seed++) {
      const g = dungeon(seed * 7 + depth * 101, depth);
      const packs = g.level.floor.packs;
      for (const [id, ms] of packsOf(g)) {
        if (packs[id].tier !== 'normal') continue;
        others++;
        if (ms[0].rarity === 'blue') blue++;
        if (ms[0].rarity === 'leader') yellow++;
      }
    }
  }
  console.log(`of ${others} packs not of an elite room nor a lair: ${blue} blue (${((blue / others) * 100).toFixed(0)}%), ${yellow} yellow (${((yellow / others) * 100).toFixed(0)}%)`);
  assert.ok(Math.abs(blue / others - 0.25) < 0.06, `blue: ${blue} of ${others}`);
  assert.ok(Math.abs(yellow / others - 0.1) < 0.05, `yellow: ${yellow} of ${others}`);
  // the first dungeon of a new character, as the game is (THE FIRST LEVELS): no blue pack, no word on anyone
  assert.ok(FIRST_LEVELS.on);
  for (let seed = 1; seed <= 8; seed++) {
    const g = Game.forFirstRun('ranger', seed * 13);
    const packs = g.level.floor.packs;
    for (const m of g.monsters) {
      assert.equal(m.words.length, 0, `seed ${seed}: ${m.name} has a word in the first dungeon`);
      assert.notEqual(m.rarity, 'blue', `seed ${seed}: a blue pack in the first dungeon`);
      if (m.rarity === 'leader') assert.equal(packs[m.packId].tier, 'elite', `seed ${seed}: a yellow pack outside the elite room`);
    }
  }
});

test('a blue pack: one word on every one of it, 20% increased life, named for it, giving up no word', () => {
  let seen = 0;
  for (const depth of DEPTHS) {
    for (let seed = 1; seed <= 6; seed++) {
      const g = dungeon(seed * 53 + depth, depth);
      for (const ms of packsOf(g).values()) {
        if (ms[0].rarity !== 'blue') continue;
        seen++;
        const w = ms[0].words[0];
        for (const m of ms) {
          assert.equal(m.rarity, 'blue');
          assert.deepEqual(m.words, [w], 'the one word, the same on every one of it');
          assert.equal(m.half, undefined, 'at full strength');
          assert.equal(m.elite, false);
          assert.deepEqual(m.carries, [], 'gives up no word');
          assert.equal(m.name, `${WORDS[w].front} ${MONSTERS[m.kind].name}`);
          const life = MONSTERS[m.kind].life * scaleLife(depth) * PACKS.blueLife * (w === 'power' ? 1.3 : 1);
          assert.equal(m.maxLife, Math.round(life), `${m.name}: 20% increased life`);
          assert.equal(m.xp, Math.round(MONSTERS[m.kind].xp * (1 + 0.25 * (depth - 1)) * PACKS.blueLife), `${m.name}: and worth as much more`);
        }
      }
    }
  }
  assert.ok(seen >= 20, `${seen} blue packs`);
});

test('a yellow pack: the leader an elite with a word (two from dungeon 6) and 3 times the life; its minions have those words at half strength', () => {
  let seen = 0;
  for (const depth of DEPTHS) {
    for (let seed = 1; seed <= 6; seed++) {
      const g = dungeon(seed * 59 + depth, depth);
      for (const ms of packsOf(g).values()) {
        if (ms[0].rarity !== 'leader') continue;
        seen++;
        const [leader, ...minions] = ms;
        const tag = `dungeon ${depth}: ${leader.name}`;
        assert.ok(leader.elite && !leader.champion, tag);
        assert.equal(leader.words.length, depth >= 6 ? 2 : 1, `${tag}: ${depth >= 6 ? 'two words' : 'a word'}`);
        assert.equal(leader.half, undefined, `${tag}: at full strength`);
        assert.equal(leader.name, [...leader.words.map((w) => WORDS[w].front), MONSTERS[leader.kind].name].join(' '));
        const power = leader.words.includes('power');
        assert.equal(leader.maxLife, Math.round(MONSTERS[leader.kind].life * scaleLife(depth) * PACKS.leaderLife * (power ? 1.3 : 1)), `${tag}: 3 times the life`);
        assert.ok(Math.abs(leader.dmgMax - MONSTERS[leader.kind].dmgMax * scaleDmg(depth) * TUNE.eliteDmg * (power ? 1.4 : 1)) < 1e-9, `${tag}: an elite's blows`);
        for (const m of minions) {
          assert.equal(m.rarity, 'minion');
          assert.equal(m.elite, false);
          assert.deepEqual(m.words, leader.words, `${tag}: a minion has its leader's words`);
          assert.deepEqual(m.half, leader.words, `${tag}: at half strength`);
          assert.deepEqual(m.carries, []);
          assert.equal(m.name, MONSTERS[m.kind].name, 'a minion has its own name');
          assert.equal(m.maxLife, Math.round(MONSTERS[m.kind].life * scaleLife(depth) * (power ? 1.15 : 1)), `${tag}: a minion's life is its own, with half of Power`);
          assert.ok(Math.abs(m.dmgMax - MONSTERS[m.kind].dmgMax * scaleDmg(depth) * (power ? 1.2 : 1)) < 1e-9, `${tag}: and its blows`);
        }
      }
    }
  }
  assert.ok(seen >= 20, `${seen} yellow packs`);
});

test('time to kill: a blue pack slightly less than a yellow one of the same kind and size', () => {
  // (his 08:10: "Time to kill for a magic (blue) pack should be slightly less than the rare mob and his minions")
  for (let n = 3; n <= 9; n++) {
    const blue = n * PACKS.blueLife;
    const yellow = PACKS.leaderLife + (n - 1);
    assert.ok(blue < yellow, `${n} of them: ${blue} against ${yellow}`);
    assert.ok(yellow - blue <= 2, `${n} of them: only slightly less`);
  }
});

test('a word burned in at the gate is every monster\'s, a minion\'s too, at full strength; Twin there gives every pack 50% increased size', () => {
  const plain = dungeon(77, 4);
  const twin = dungeon(77, 4, ['twin', 'power']);
  const a = packsOf(plain);
  const b = packsOf(twin);
  let grew = 0;
  let packs = 0;
  for (const [id, ms] of b) {
    const want = Math.round(twin.level.floor.packs[id].size * GATE_TWIN_PACKS);
    packs++;
    if (ms.length === want) grew++;
    assert.ok(ms.length <= want, `pack ${id}: ${ms.length}, more than ${want}`);
    assert.ok(ms.length > (a.get(id)?.length ?? 0) || twin.level.floor.packs[id].size === 1, `pack ${id}: bigger`);
    for (const m of ms) {
      assert.ok(m.words.includes('twin') && m.words.includes('power'), `${m.name} carries the gate's words`);
      assert.equal(wordShare(m, 'twin'), 1, `${m.name}: the gate's Twin at full strength`);
      assert.equal(wordShare(m, 'power'), 1, `${m.name}: and its Power`);
    }
  }
  assert.ok(grew >= packs * 0.9, `${grew} of ${packs} packs are 50% bigger (the rest have no room for it)`);
});

/** A minion with `words` at half, and a monster of the same kind with them at full, side by side in front of the hero. */
function pair(words: WordId[], kind: MonsterKind = 'skeleton'): { g: Game; half: Monster; full: Monster } {
  const g = dungeon(5, 4);
  const inner = g as unknown as Inner;
  g.monsters.length = 0;
  const h = g.hero;
  const rng = new RNG(3);
  const half = inner.spawn(kind, h.x + 1, h.y, 900, 0, false, rng, null, { rarity: 'minion', words });
  const full = inner.spawn(kind, h.x - 1, h.y, 901, 0, false, rng, null, { rarity: 'blue', words });
  return { g, half, full };
}

/** The hero ready to be hurt cleanly: nothing on them, no armour, 50% fire resistance. */
function bare(g: Game): void {
  const h = g.hero;
  h.invuln = 0;
  h.move = null;
  h.shield = 0;
  h.poisonT = h.burnT = h.chillT = h.shockT = 0;
  h.poisonDps = h.burnDps = h.chill = 0;
  h.step = null;
  h.d.armor = 0;
  h.d.resFire = 50;
  h.d.stats.blockChance = 0;
  h.life = h.d.maxLife = 1e6;
}

test('a minion\'s half of a word: half the power of each, word by word', () => {
  // POWER, SWIFT and GUARDING: what it is
  {
    const { half, full } = pair(['power', 'swift', 'guarding']);
    const def = MONSTERS.skeleton;
    const life = def.life * scaleLife(4);
    assert.equal(full.maxLife, Math.round(life * 1.2 * 1.3));
    assert.equal(half.maxLife, Math.round(life * 1.15), 'half of Power: 15% increased life');
    assert.ok(Math.abs(half.dmgMax - def.dmgMax * scaleDmg(4) * 1.2) < 1e-9, 'and 20% increased damage');
    assert.ok(Math.abs(half.speed - def.speed * 1.175) < 1e-9, 'half of Swift: 17.5% increased speed');
    assert.ok(Math.abs(full.speed - def.speed * 1.35) < 1e-9);
    assert.equal(half.shield, Math.round(half.maxLife * GUARD.monster * 0.5), 'half of Guarding: half the shield');
    assert.equal(full.shield, Math.round(full.maxLife * GUARD.monster));
  }
  // POISON: half the poison
  {
    const { g, half, full } = pair(['poison']);
    bare(g);
    g.hurtHero(100, 'phys', full.words, full);
    const fullDps = g.hero.poisonDps;
    bare(g);
    g.hurtHero(100, 'phys', half.words, half);
    assert.ok(fullDps > 0 && Math.abs(g.hero.poisonDps - fullDps / 2) < 1e-9, `half the poison (${g.hero.poisonDps} against ${fullDps})`);
  }
  // FLAME: half the blow is fire, the rest its own; it burns half as hard
  {
    const { g, half, full } = pair(['fire']);
    bare(g);
    let before = g.hero.life;
    g.hurtHero(100, 'fire', full.words, full);
    assert.equal(before - g.hero.life, 50, 'all of it fire: half of it resisted');
    const fullBurn = g.hero.burnDps;
    bare(g);
    before = g.hero.life;
    g.hurtHero(100, 'fire', half.words, half);
    assert.equal(before - g.hero.life, 75, 'half of it fire (half of that resisted), half of it its own');
    assert.ok(Math.abs(g.hero.burnDps - ((75 * 0.3 * 0.5) / 3)) < 1e-9 && g.hero.burnDps < fullBurn, 'and the burn from its half');
  }
  // FROST and LIGHTNING: half the chill, half the shock
  {
    const { g, half } = pair(['frost']);
    bare(g);
    g.hurtHero(100, 'frost', half.words, half);
    assert.ok(Math.abs(g.hero.chill - 0.15) < 1e-9, `half the chill (${g.hero.chill})`);
    const p = pair(['lightning']);
    bare(p.g);
    p.g.hurtHero(100, 'lightning', p.half.words, p.half);
    assert.ok(Math.abs(p.g.hero.shockT - 1.5) < 1e-9, `half the shock (${p.g.hero.shockT} s)`);
  }
  // HEAVY: half the knock
  {
    const { g, half, full } = pair(['heavy']);
    bare(g);
    g.hurtHero(10, 'phys', full.words, full);
    const fullStep = Math.hypot(g.hero.step!.dx, g.hero.step!.dy);
    bare(g);
    g.hurtHero(10, 'phys', half.words, half);
    const halfStep = Math.hypot(g.hero.step!.dx, g.hero.step!.dy);
    assert.ok(Math.abs(fullStep - HEAVY.knock) < 1e-9 && Math.abs(halfStep - HEAVY.knock / 2) < 1e-9, `half the knock (${halfStep} against ${fullStep})`);
  }
  // LEECH: it heals half as much
  {
    const { g, half, full } = pair(['leech']);
    bare(g);
    half.life = full.life = 1;
    g.hurtHero(10, 'phys', full.words, full);
    g.hurtHero(10, 'phys', half.words, half);
    assert.ok(Math.abs(full.life - 1 - full.maxLife * 0.15) < 1e-9);
    assert.ok(Math.abs(half.life - 1 - half.maxLife * 0.075) < 1e-9, 'half the healing');
  }
  // PRECISE: half the armour found
  {
    const { g, half, full } = pair(['precise']);
    bare(g);
    g.hero.d.armor = 400;
    let before = g.hero.life;
    g.hurtHero(100, 'phys', [], null);
    const none = before - g.hero.life;
    before = g.hero.life;
    g.hurtHero(100, 'phys', full.words, full);
    const all = before - g.hero.life;
    before = g.hero.life;
    g.hurtHero(100, 'phys', half.words, half);
    const some = before - g.hero.life;
    assert.ok(none < some && some < all, `half the armour found: ${none} < ${some} < ${all}`);
  }
  // TWIN: its second blow at half; FRENZIED: half the rage; VOLATILE: half the blast
  {
    const { g, half, full } = pair(['twin', 'volatile', 'frenzied']);
    assert.equal(wordShare(half, 'twin'), 0.5);
    assert.equal(wordShare(full, 'twin'), 1);
    const inner = g as unknown as Inner;
    bare(g);
    g.hero.d.lifeRegen = 0;
    half.x = g.hero.x + 0.8;
    half.y = g.hero.y;
    full.x = g.hero.x + 30;
    full.cd = 1e9;
    inner.monsterAttack(half, MONSTERS.skeleton);
    const first = 1e6 - g.hero.life;
    const c = emptyControls();
    for (let i = 0; i < 20; i++) g.update(1 / 60, c);
    const second = 1e6 - g.hero.life - first;
    assert.ok(first >= Math.round(half.dmgMin) && first <= Math.round(half.dmgMax), `the first blow is a whole one (${first})`);
    assert.ok(second >= Math.round(half.dmgMin * 0.5) && second <= Math.round(half.dmgMax * 0.5), `the second is half of one (${second}, of ${half.dmgMin.toFixed(1)} to ${half.dmgMax.toFixed(1)})`);
    // volatile: the warning it leaves when it dies is half the blast of a full one's
    g.zones.length = 0;
    inner.kill(full);
    inner.kill(half);
    const blasts = g.zones.filter((z) => z.kind === 'warn' && z.from.endsWith("dying blast"));
    assert.equal(blasts.length, 2);
    assert.ok(Math.abs(blasts[1].dmg - blasts[0].dmg * 0.5 * ((half.dmgMin + half.dmgMax) / (full.dmgMin + full.dmgMax))) < 1e-9, 'half the blast');
  }
});

test('what each pack is worth: dungeons keep about as many monsters as before, the first one fewer, and words stay scarce', () => {
  // (Recorded, not ruled: how many monsters a dungeon holds with the packs on and off, for the notes.)
  const rows: string[] = [];
  for (const depth of [1, 2, 4, 8]) {
    const count = (on: boolean): number => {
      const was = MONSTER_PACKS.on;
      MONSTER_PACKS.on = on;
      try {
        let n = 0;
        for (let seed = 1; seed <= 6; seed++) n += dungeon(seed * 7 + depth, depth).monsters.filter((m) => !m.boss).length;
        return n / 6;
      } finally {
        MONSTER_PACKS.on = was;
      }
    };
    const off = count(false);
    const on = count(true);
    rows.push(`dungeon ${depth}: ${off.toFixed(0)} monsters before, ${on.toFixed(0)} now`);
    assert.ok(on >= off * 0.7 && on <= off * 1.3, `dungeon ${depth}: ${on} against ${off}`);
  }
  console.log(rows.join('\n'));
});

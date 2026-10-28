// THE TINKERER'S SKILL TREE (game/talents.ts TINKERER_TREE, a gear: his shape, his paths, his yes to it as drawn): each
// talent doing what its card says. Her numbers for them are TINKER_TUNE.talents (game/tinkerer.ts); what they do is in
// game/game.ts, in her section ("THE TINKERER") and, for Lightning Rod, its DECOYS.
//   run: tsx --test tests/tinkerer_talents.test.ts

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import type { RNG } from '../src/engine/rng';
import { SKILLS, TUNE } from '../src/game/defs';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Controls, GameEvent, Monster } from '../src/game/state';
import { TINKER_TUNE } from '../src/game/tinkerer';
import { TREES } from '../src/game/talents';
import { land } from './helpers';

const DT = 1 / 60;
type Inner = { rng: RNG; waveT: number; spawn: (k: string, x: number, y: number, pack: number, rank: number, boss: boolean, rng: RNG) => Monster; wakeUp: (m: Monster) => void };
const inner = (g: Game): Inner => g as unknown as Inner;
const G = TINKER_TUNE.golem;
const T = TINKER_TUNE.talents;

function room(seed = 3): Game {
  const g = Game.forPractice('tinkerer', seed);
  inner(g).waveT = 1e9;
  g.monsters.length = 0;
  g.hero.x = 14.5;
  g.hero.y = 15.5;
  g.hero.fx = 1;
  g.hero.fy = 0;
  g.events.length = 0;
  return g;
}
function dummy(g: Game, dx: number, dy: number, life = 1e7, awake = true): Monster {
  const a = inner(g);
  const m = a.spawn('skeleton', g.hero.x + dx, g.hero.y + dy, 1, 0, false, a.rng);
  if (awake) a.wakeUp(m);
  m.speed = 0;
  m.cd = 1e9;
  m.life = m.maxLife = life;
  return m;
}
const hurt = (m: Monster): number => m.maxLife - m.life;
/** Talents of her tree taken (Bombs Away, where the tree starts, and those named). */
function take(g: Game, ...ids: string[]): Game {
  g.hero.talents = ['bombsaway', ...ids];
  g.refresh();
  return g;
}
/** Her tree's CONTRAPTION taken: her tap the Contraption, in place of the Vial Toss. */
function withContraption(g: Game, ...ids: string[]): Game {
  return take(g, 'fortune', 'contraptions', ...ids);
}
/** Her hits made the same every time: no spread between her least and most, no criticals. */
function steady(g: Game, hit = 100): void {
  g.hero.d.dmgMin = g.hero.d.dmgMax = hit;
  g.hero.d.critChance = 0;
}
function wait(g: Game, seconds: number, c: Controls = emptyControls(), each?: (ev: GameEvent[]) => void): GameEvent[] {
  const ev: GameEvent[] = [];
  for (let t = 0; t < seconds - 1e-9; t += DT) {
    g.update(DT, c);
    if (each) each(g.events);
    for (const e of g.events) ev.push(e);
    g.events.length = 0;
  }
  return ev;
}
function ready(g: Game): void {
  for (const s of g.hero.skills) {
    s.charges = s.maxCharges;
    s.cd = 0;
  }
  g.hero.swingT = 0;
  g.hero.mana = g.hero.d.maxMana;
}
/** Her tap (0) or her tap and hold (1) at a spot `dx`, `dy` from her, landed. */
function use(g: Game, skill: 0 | 1, dx: number, dy: number): GameEvent[] {
  ready(g);
  const h = g.hero;
  const c = emptyControls();
  c.aimX = c.castX = h.x + dx;
  c.aimY = c.castY = h.y + dy;
  if (skill === 0) c.fire = true;
  else c.cast = true;
  const ev: GameEvent[] = [];
  const take = (): void => {
    for (const e of g.events) ev.push(e);
    g.events.length = 0;
  };
  g.update(DT, c);
  c.fire = false;
  c.cast = false;
  take();
  land(g, c, DT, take);
  return ev;
}
/** Her blast jump to a spot `dx`, `dy` from her, and on until she has come down. */
function blastJump(g: Game, dx: number, dy: number): GameEvent[] {
  ready(g);
  const c = emptyControls();
  c.evade = true;
  c.evadeX = g.hero.x + dx;
  c.evadeY = g.hero.y + dy;
  g.update(DT, c);
  const ev = [...g.events];
  g.events.length = 0;
  return ev.concat(wait(g, TINKER_TUNE.blast.secs + 0.2));
}
/** Her Golem whistled out and arrived (its own punches and shots held back if `still`). */
function golemOut(g: Game, still = false): void {
  use(g, 1, 3, 0);
  wait(g, G.arrive + 0.05);
  if (still) for (const q of g.golems) q.punchCd = q.cannonCd = 1e9;
}
const of = <K extends GameEvent['t']>(ev: GameEvent[], t: K): Extract<GameEvent, { t: K }>[] => ev.filter((e) => e.t === t) as Extract<GameEvent, { t: K }>[];
const goldDrops = (g: Game): number => g.drops.filter((d) => d.kind === 'gold').length;

test('her tree: every talent made to work, the tree still a draft', () => {
  const tree = TREES.tinkerer;
  assert.equal(tree.draft, true);
  assert.deepEqual(tree.talents.filter((t) => !t.works).map((t) => t.id), []);
});

test('BOMBS AWAY: as she comes down from her Blast Jump, a second bomb goes off where she lands', () => {
  for (const taken of [false, true]) {
    const g = room();
    if (taken) take(g);
    else {
      g.hero.talents = [];
      g.refresh();
    }
    const there = dummy(g, -5.6, 0.4);
    const x0 = there.x;
    const ev = blastJump(g, -5, 0);
    const bomb = of(ev, 'bombsAway');
    if (!taken) {
      assert.equal(bomb.length, 0);
      assert.equal(hurt(there), 0, 'without it, nothing goes off where she lands');
      continue;
    }
    assert.equal(bomb.length, 1, 'a second bomb');
    assert.ok(Math.abs(bomb[0].x - g.hero.x) < 0.01 && Math.abs(bomb[0].y - g.hero.y) < 0.01, 'where she lands');
    assert.ok(hurt(there) > 0, 'what is where she lands is hurt');
    wait(g, 0.3);
    assert.ok(Math.abs(there.x - x0) > 0.5, 'and blown away');
  }
});

test('FORTUNE: she hits harder the more gold she carries: 1% of her gold as a percent, 1,000 gold 10% more', () => {
  const hits: number[] = [];
  for (const gold of [0, 1000, 2500]) {
    const g = take(room(), 'fortune');
    steady(g, 1000);
    g.hero.gold = gold;
    const m = dummy(g, 4, 0);
    use(g, 0, 4, 0);
    wait(g, TINKER_TUNE.toss.flight + 0.1);
    hits.push(hurt(m));
  }
  assert.ok(hits[0] > 0);
  assert.ok(Math.abs(hits[1] / hits[0] - 1.1) < 0.002, `1,000 gold, 10% more (${hits[1]} against ${hits[0]})`);
  assert.ok(Math.abs(hits[2] / hits[0] - 1.25) < 0.002, '2,500 gold, 25% more');
  // (without it, gold is only gold)
  const g = room();
  g.hero.talents = ['bombsaway'];
  g.refresh();
  steady(g, 1000);
  g.hero.gold = 1000;
  const m = dummy(g, 4, 0);
  use(g, 0, 4, 0);
  wait(g, TINKER_TUNE.toss.flight + 0.1);
  assert.equal(hurt(m), hits[0]);
});

test('CLUSTER VIALS: every vial bursts into three little ones that bounce out and burst again (and they burst no further)', () => {
  const g = take(room(), 'clustervials');
  const rad = SKILLS.vialtoss.radius * g.hero.skills[0].r.size;
  const ring = [0, 1, 2, 3, 4, 5].map((k) => dummy(g, 4 + Math.cos((k * Math.PI) / 3) * T.cluster.far, Math.sin((k * Math.PI) / 3) * T.cluster.far));
  for (const m of ring) assert.ok(Math.hypot(m.x - g.hero.x - 4, m.y - g.hero.y) > rad + m.r, 'the ring beyond the vial’s own burst');
  let ev = use(g, 0, 4, 0);
  ev = ev.concat(wait(g, TINKER_TUNE.toss.flight + T.cluster.flight + 0.3));
  const bursts = of(ev, 'vialBurst');
  assert.equal(bursts.length, 1 + T.cluster.n, 'the vial, then its three');
  const little = bursts.filter((b) => b.little);
  assert.equal(little.length, 3);
  for (const b of little) {
    assert.ok(Math.abs(Math.hypot(b.x - bursts[0].x, b.y - bursts[0].y) - T.cluster.far) < 0.05, 'each bounced out round where it burst');
    assert.ok(Math.abs(b.r - rad * T.cluster.size) < 1e-9, 'a little burst');
  }
  assert.equal(of(ev, 'vial').filter((v) => v.little).length, 3, 'thrown out of it');
  assert.ok(ring.filter((m) => hurt(m) > 0).length >= 2, 'they burst on what is round it');
  // (her Contraption's vials too)
  const g2 = withContraption(room(), 'clustervials');
  dummy(g2, 5, 0);
  use(g2, 0, 2, 0);
  const ev2 = wait(g2, TINKER_TUNE.contraption.set + TINKER_TUNE.contraption.first + TINKER_TUNE.contraption.flight + T.cluster.flight + 0.2);
  assert.equal(of(ev2, 'vialBurst').filter((b) => b.little).length, 3, 'a Contraption’s vial bursts into three as well');
});

test('TAR: her vials leave a puddle of tar for three seconds: whatever walks in it is slowed to a crawl', () => {
  const walk = (tar: boolean): { tarred: number; free: number; puddles: number } => {
    const g = tar ? take(room(), 'tar') : take(room());
    const m = dummy(g, 6, 0);
    let ev = use(g, 0, 6, 0);
    ev = ev.concat(wait(g, TINKER_TUNE.toss.flight + 0.02));
    const puddles = of(ev, 'tar').length;
    // (it comes on at the hero through the puddle, and is slowed while it is in it)
    m.speed = 2;
    const x0 = m.x;
    wait(g, 0.5);
    const tarred = x0 - m.x;
    wait(g, T.tar.secs);
    const x1 = m.x;
    wait(g, 0.5);
    return { tarred, free: x1 - m.x, puddles };
  };
  const with_ = walk(true);
  const without = walk(false);
  assert.equal(with_.puddles, 1, 'a puddle where it burst');
  assert.equal(without.puddles, 0);
  assert.ok(without.tarred > 0.6, `it walks at its pace without (${without.tarred.toFixed(2)})`);
  assert.ok(with_.tarred < without.tarred * (T.tar.crawl + 0.1), `in the tar, a crawl (${with_.tarred.toFixed(2)} against ${without.tarred.toFixed(2)})`);
  assert.ok(with_.free > 0.6, 'the puddle dried up, it walks at its pace again');
  const g = take(room(), 'tar');
  use(g, 0, 4, 0);
  wait(g, TINKER_TUNE.toss.flight + 0.05);
  assert.equal(g.tars.length, 1);
  wait(g, T.tar.secs);
  assert.equal(g.tars.length, 0, 'gone after three seconds');
});

test('MAD MIXTURE: every vial carries a brew at random, burning, freezing or poisoning, on top of its own words', () => {
  const g = take(room(), 'madmixture');
  const seen = new Set<string>();
  for (let k = 0; k < 12; k++) {
    g.monsters.length = 0;
    const m = dummy(g, 4, 0);
    let ev = use(g, 0, 4, 0);
    ev = ev.concat(wait(g, TINKER_TUNE.toss.flight + 0.05));
    const b = of(ev, 'vialBurst')[0];
    assert.ok(b && b.brew, 'a brew in every vial');
    seen.add(b.brew!);
    assert.ok(hurt(m) > 0, 'its own hit as ever');
    if (b.brew === 'burn') assert.ok(m.burnT > 0 && m.burnDps > 0, 'burning');
    if (b.brew === 'freeze') assert.ok(m.chillT > 0 || m.frozenT > 0, 'freezing');
    if (b.brew === 'poison') assert.ok(m.poisonT > 0 && m.poisonDps > 0, 'poisoning');
  }
  assert.deepEqual([...seen].sort(), ['burn', 'freeze', 'poison'], 'at random, each of the three');
  // (a second freezing brew on one chilled freezes it, as frost does)
  const g2 = take(room(), 'madmixture');
  const m = dummy(g2, 4, 0);
  m.chill = 0.5;
  m.chillT = 2;
  (g2 as unknown as { brewOn: (ms: Monster[], b: string, i: number, f: number) => void }).brewOn([m], 'freeze', 0, 1);
  assert.ok(m.frozenT > 0);
});

test('ALCHEMY: an enemy her vials kill always drops gold', () => {
  const kills = (taken: boolean, contraption = false): { dead: number; gold: number } => {
    const g = contraption ? withContraption(room(9), ...(taken ? ['alchemy'] : [])) : take(room(9), ...(taken ? ['alchemy'] : []));
    g.practice = false;
    let dead = 0;
    let gold = 0;
    for (let k = 0; k < 10; k++) {
      g.monsters.length = 0;
      g.drops.length = 0;
      const m = dummy(g, 5, 0, 1);
      if (contraption) {
        if (k === 0) use(g, 0, 2, 0);
        wait(g, k === 0 ? 3 : 1.5);
      } else {
        use(g, 0, 5, 0);
        wait(g, TINKER_TUNE.toss.flight + 0.05);
      }
      if (!m.dead) continue;
      dead++;
      // (only what the gold falls round it)
      if (g.drops.some((d) => d.kind === 'gold' && Math.hypot(d.x - m.x, d.y - m.y) < 1.2)) gold++;
    }
    return { dead, gold };
  };
  const yes = kills(true);
  assert.equal(yes.dead, 10, 'her vials kill them');
  assert.equal(yes.gold, yes.dead, 'every one drops gold');
  const no = kills(false);
  assert.ok(no.gold < no.dead, `without it, only now and then (${no.gold} of ${no.dead})`);
  const con = kills(true, true);
  assert.ok(con.dead >= 5 && con.gold === con.dead, `her Contraption's vials too (${con.gold} of ${con.dead})`);
});

test('THE BIG ONE: every fifth vial is a big one: it bursts three times as wide and knocks everything down', () => {
  const g = take(room(), 'thebigone');
  const rad = SKILLS.vialtoss.radius * g.hero.skills[0].r.size;
  const off = dummy(g, 4, 2.6);
  const bigs: boolean[] = [];
  for (let k = 0; k < 10; k++) {
    let ev = use(g, 0, 4, 0);
    ev = ev.concat(wait(g, TINKER_TUNE.toss.flight + 0.05));
    const b = of(ev, 'vialBurst')[0];
    bigs.push(!!b.big);
    assert.equal(!!of(ev, 'vial')[0].big, !!b.big, 'thrown big');
    assert.ok(Math.abs(b.r - rad * (b.big ? T.bigOne.wide : 1)) < 1e-9, 'three times as wide');
    if (k === 3) assert.equal(hurt(off), 0, 'one off to the side is out of reach of the others');
    if (k === 4) {
      assert.ok(hurt(off) > 0, 'the fifth reaches it');
      assert.ok(off.stunT > 0, 'and knocks it down');
    }
  }
  assert.deepEqual(bigs, [false, false, false, false, true, false, false, false, false, true]);
  // (her Contraption's vials are counted with her own)
  const g2 = withContraption(room(), 'thebigone');
  dummy(g2, 5, 0);
  use(g2, 0, 2, 0);
  const ev2 = wait(g2, TINKER_TUNE.contraption.set + TINKER_TUNE.contraption.first + TINKER_TUNE.contraption.every * 4 + 0.1);
  const lobs = of(ev2, 'vial');
  assert.ok(lobs.length >= 5);
  assert.deepEqual(lobs.slice(0, 5).map((v) => !!v.big), [false, false, false, false, true]);
});

test('LIGHTNING ROD: for three seconds after its ground pound, every enemy near the Golem goes after it instead of her', () => {
  const g = take(room(), 'lightningrod');
  golemOut(g, true);
  const gm = g.golem!;
  // (one near the Golem, coming for her; its blows would hurt her)
  const m = dummy(g, gm.x - g.hero.x - 2.2, gm.y - g.hero.y + 2.2);
  m.speed = 1.8;
  m.cd = 0;
  const life0 = g.hero.life;
  let ev = use(g, 1, gm.x - g.hero.x + 1, gm.y - g.hero.y);
  ev = ev.concat(wait(g, G.pound.lead + G.pound.hit + 0.05));
  assert.ok(of(ev, 'golemPound').length > 0, 'it pounds');
  assert.equal(g.decoys.length, 1, 'the Golem a lightning rod');
  ev = wait(g, T.rod.secs - 0.3);
  assert.ok(of(ev, 'decoyStruck').length >= 1, 'it goes after the Golem and swings at it');
  assert.ok(Math.hypot(m.x - g.golem!.x, m.y - g.golem!.y) < 2.2, 'it went to the Golem');
  assert.equal(g.hero.life, life0, 'and not her');
  assert.equal(g.golem!.act === 'down', false, 'the Golem cannot be hurt');
  // (its time up, she is the one it goes after again)
  wait(g, 0.5);
  assert.equal(g.decoys.length, 0);
  g.hero.x = g.golem!.x + 0.4;
  g.hero.y = g.golem!.y + 0.4;
  wait(g, 4);
  assert.ok(g.hero.life < life0, 'after it, her');
  // (one far from the Golem is not drawn to it)
  const g2 = take(room(5), 'lightningrod');
  golemOut(g2, true);
  use(g2, 1, 1, 0);
  wait(g2, G.pound.lead + G.pound.hit + 0.05);
  const far = dummy(g2, g2.golem!.x - g2.hero.x, g2.golem!.y - g2.hero.y - T.rod.near - 1);
  const near = dummy(g2, g2.golem!.x - g2.hero.x, g2.golem!.y - g2.hero.y - 2);
  assert.equal(g2.decoyFor(far), null, 'one far from it goes after her');
  assert.ok(g2.decoyFor(near), 'one near it, after it');
});

test('SHRAPNEL: the Golem’s cannon shot bursts where it lands, striking everything near', () => {
  for (const taken of [true, false]) {
    const g = taken ? take(room(), 'shrapnel') : take(room());
    golemOut(g);
    g.golem!.punchCd = 1e9;
    const target = dummy(g, 6, 0);
    const by = [dummy(g, 6.5, 0.9), dummy(g, 6.6, -0.9)];
    let shot: Extract<GameEvent, { t: 'golemShot' }> | undefined;
    const ev = wait(g, 3, emptyControls(), (e) => {
      shot ??= of(e, 'golemShot')[0];
    });
    assert.ok(shot, 'it fires');
    assert.ok(hurt(target) > 0);
    if (taken) {
      assert.equal(of(ev, 'shrapnel').length >= 1, true, 'it bursts');
      for (const m of by) assert.ok(hurt(m) > 0, 'striking what is near where it lands');
    } else for (const m of by) assert.equal(hurt(m), 0, 'without it, the shot hits only the one');
  }
});

test('TESLA COIL: a coil on the Golem’s back zaps the enemy nearest it every second, the spark leaping on to two more', () => {
  const g = take(room(), 'teslacoil');
  golemOut(g, true);
  const gm = g.golem!;
  const ox = gm.x - g.hero.x;
  const oy = gm.y - g.hero.y;
  const a = dummy(g, ox + 3, oy);
  const b = dummy(g, ox + 5, oy + 1);
  const c = dummy(g, ox + 6.5, oy - 1);
  const d = dummy(g, ox + 6.5, oy + 5);
  const ev = wait(g, 3.05);
  const zaps = of(ev, 'teslaZap');
  assert.ok(zaps.length >= 2 && zaps.length <= 4, `about one a second (${zaps.length} in three)`);
  assert.equal(zaps[0].to.length, 3, 'the nearest and two more');
  assert.ok(Math.abs(zaps[0].to[0].x - a.x) < 0.01, 'the nearest first');
  for (const m of [a, b, c]) assert.ok(hurt(m) > 0);
  assert.equal(hurt(d), 0, 'not one too far for the spark to leap to');
  // (without it, no coil)
  const g2 = take(room());
  golemOut(g2, true);
  dummy(g2, g2.golem!.x - g2.hero.x + 3, g2.golem!.y - g2.hero.y);
  assert.equal(of(wait(g2, 2), 'teslaZap').length, 0);
});

test('MARK II: she can whistle out a second Golem: two at once', () => {
  const g = take(room(), 'markii');
  golemOut(g);
  assert.equal(g.golems.length, 1);
  let ev = use(g, 1, 3, 0);
  assert.equal(g.golems.length, 2, 'her second whistle brings out a second');
  assert.ok(of(ev, 'golemArrive').length === 1 && of(ev, 'golemPound').length === 0);
  wait(g, G.arrive + 0.1);
  const [one, two] = g.golems;
  assert.ok(Math.hypot(one.x - two.x, one.y - two.y) > 1.2, 'at her other side');
  // (both with her as she goes, both fighting)
  const c = emptyControls();
  c.mx = 1;
  wait(g, 1.5, c);
  wait(g, 1.5);
  for (const q of g.golems) assert.ok(Math.hypot(q.x - g.hero.x, q.y - g.hero.y) < 3, 'each keeps near her');
  const m = dummy(g, 1.6, 0);
  ev = wait(g, 3);
  assert.ok(of(ev, 'golemPunch').length >= 2 && hurt(m) > 0);
  // (and each whistle after sets both pounding)
  ev = use(g, 1, 2, 0).concat(wait(g, G.pound.lead + G.pound.long));
  assert.equal(of(ev, 'golemPound').length, 2, 'two pounds');
  // (without it, the second whistle pounds)
  const g2 = take(room());
  golemOut(g2);
  use(g2, 1, 3, 0);
  assert.equal(g2.golems.length, 1);
  // (undone, the second winds down and is gone)
  g.hero.talents = ['bombsaway'];
  g.refresh();
  ev = wait(g, 0.1);
  assert.equal(of(ev, 'golemDown').length, 1);
  wait(g, G.down + 0.1);
  assert.equal(g.golems.length, 1);
  assert.equal(g.golem, g.golems[0]);
});

test('PROSPECTOR: every ground pound digs up a handful of gold, about an ordinary gold drop of the floor', () => {
  const g = take(room(), 'prospector');
  g.practice = false;
  golemOut(g, true);
  const before = goldDrops(g);
  let dug = -1;
  let worth = 0;
  use(g, 1, 2, 0);
  wait(g, G.pound.lead + G.pound.long, emptyControls(), (e) => {
    if (dug < 0 && of(e, 'golemPound').length) {
      const gold = g.drops.filter((d) => d.kind === 'gold');
      dug = gold.length - before;
      worth = gold.reduce((n, d) => n + d.gold, 0);
    }
  });
  assert.equal(dug, T.prospector.n, 'a handful of gold');
  const per = Math.max(1, g.power);
  assert.ok(worth >= TUNE.goldMin * per && worth <= TUNE.goldMax * per, `about one ordinary drop (${worth})`);
  // (without it, none)
  const g2 = take(room());
  g2.practice = false;
  golemOut(g2, true);
  use(g2, 1, 2, 0);
  wait(g2, G.pound.lead + G.pound.hit + 0.05);
  assert.equal(goldDrops(g2), 0);
});

test('OVERDRIVE: her whistle sends the Golem into overdrive for five seconds: it moves and strikes twice as fast', () => {
  const run = (taken: boolean): { went: number; punches: number; after: number } => {
    const g = taken ? take(room(), 'overdrive') : take(room());
    let ev = use(g, 1, 3, 0);
    if (taken) assert.equal(of(ev, 'overdrive').length, 1);
    wait(g, G.arrive + 0.05);
    // (she is off ahead: it knuckles after her)
    const gm = g.golem!;
    g.hero.x += 6;
    const x0 = gm.x;
    wait(g, 0.5);
    const went = gm.x - x0;
    // (and an enemy by it: its punches)
    g.hero.x -= 6;
    wait(g, 1);
    const m = dummy(g, gm.x - g.hero.x + 1.4, gm.y - g.hero.y);
    m.x = gm.x + 1.4;
    m.y = gm.y;
    // (from one punch to the next)
    const at: number[] = [];
    let t = 0;
    wait(g, 2.5, emptyControls(), (e) => {
      t += DT;
      if (of(e, 'golemPunch').length) at.push(t);
    });
    assert.ok(at.length >= 2, 'it punches');
    const punches = at[1] - at[0];
    // (its five seconds up, as before)
    wait(g, 3);
    return { went, punches, after: g.golem!.overT };
  };
  const yes = run(true);
  const no = run(false);
  assert.ok(Math.abs(yes.went / no.went - 2) < 0.2, `twice as fast on its feet (${yes.went.toFixed(2)} against ${no.went.toFixed(2)})`);
  assert.ok(Math.abs(no.punches / yes.punches - 2) < 0.15, `twice as fast with its fists (a punch every ${yes.punches.toFixed(2)} s against ${no.punches.toFixed(2)} s)`);
  assert.equal(yes.after, 0, 'five seconds, and it is over');
});

test('GROWTH SERUM: a vial of hers that bursts by her Golem makes it grow: twice as big and twice as strong for five seconds', () => {
  const g = take(room(), 'growthserum');
  golemOut(g, true);
  steady(g);
  const gm = g.golem!;
  // (an enemy by its fist: one punch of it ungrown, and its hit)
  const m = dummy(g, gm.x - g.hero.x + 1.3, gm.y - g.hero.y);
  const punch = (): number => {
    gm.punchCd = 0;
    const was = hurt(m);
    let n = 0;
    wait(g, G.punch.long + 0.05, emptyControls(), (e) => (n += of(e, 'golemPunch').length));
    gm.punchCd = 1e9;
    assert.equal(n, 1, 'a punch');
    return hurt(m) - was;
  };
  const small = punch();
  // (a vial bursting on the Golem's other side, out of reach of the enemy)
  let ev = use(g, 0, gm.x - g.hero.x - 1.2, gm.y - g.hero.y);
  ev = ev.concat(wait(g, TINKER_TUNE.toss.flight + 0.05));
  assert.equal(of(ev, 'golemGrow').length, 1, 'it grows');
  assert.ok(gm.growT > 0);
  const big = punch();
  assert.ok(Math.abs(big / small - T.growth.strong) < 0.02, `twice as strong (${big} against ${small})`);
  // (twice as big: its fist reaches twice as far)
  m.x = gm.x + G.punch.reach * 1.6;
  m.y = gm.y;
  gm.punchCd = 0;
  ev = wait(g, 0.2);
  assert.equal(gm.act, 'punch', 'grown, it reaches one too far for it before');
  wait(g, T.growth.secs);
  assert.equal(gm.growT, 0, 'five seconds, and it is as it was');
  // (a vial bursting far from it does nothing to it)
  ev = use(g, 0, gm.x - g.hero.x + 5, gm.y - g.hero.y + 3).concat(wait(g, TINKER_TUNE.toss.flight + 0.05));
  assert.equal(of(ev, 'golemGrow').length, 0);
});

// An attack takes a moment to make (Version 11).
//
// The owner: "spells have a cast time even if they are really short". As it was read back to him:
// spells get a short cast time and sword blows a very short wind-up, "all short enough that the
// fighting still feels quick".
//
// The rule (src/game/game.ts: useBasic, useSkill, begin, release). Asking for an attack begins it:
// the sword is raised, the bow drawn, the spell gathered. It lands when its wind-up is over, and
// what it costs is paid then. While one attack is being made no other begins; a slow attack asked
// for meanwhile waits its turn (briefly). An evasive move breaks an attack off, and an attack
// broken off costs nothing.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import type { RNG } from '../src/engine/rng';
import { CLASSES, SKILLS, skillsFor } from '../src/game/defs';
import type { SkillKind } from '../src/game/defs';
import { Game } from '../src/game/game';
import { plainWeapon } from '../src/game/items';
import { emptyControls } from '../src/game/state';
import type { Controls, GameEvent, Monster } from '../src/game/state';
import { CLASS_IDS } from '../src/game/types';
import type { ClassId } from '../src/game/types';
import { land } from './helpers';

/** A fine step, so that the seconds below mean something: every time here is told to a 120th of a second. */
const DT = 1 / 120;
const EPS = 1e-9;

type Inner = {
  rng: RNG;
  waveT: number;
  spawn: (k: string, x: number, y: number, pack: number, rank: number, boss: boolean, rng: RNG) => Monster;
  wakeUp: (m: Monster) => void;
};
const inner = (g: Game): Inner => g as unknown as Inner;

/**
 * These tests are about attacks that are MADE ONCE: asked for, wound up, landed, paid for. Since
 * Version 12.1 the two-handed sword's slow attack is one that goes on while it is held (Whirlwind;
 * tests/channel.test.ts has those), so the warrior carries the one-handed sword here: Strike and
 * Slam, as these tests were written for.
 */
function madeOnce(g: Game): void {
  const h = g.hero;
  if (!SKILLS[h.skills[1].id].channel) return;
  const i = h.bag.findIndex((it) => it !== null && it.weapon === 'sword');
  if (i >= 0) assert.equal(g.equipFromBag(i), null);
  else {
    h.gear.mainhand = plainWeapon('sword', 1);
    g.refresh();
  }
  assert.ok(!SKILLS[h.skills[1].id].channel);
}

/** A practice room with nothing in it: the hero in the middle, facing +x, and no packs of its own. */
function room(cls: ClassId, seed = 3): Game {
  const g = Game.forPractice(cls, seed);
  madeOnce(g);
  inner(g).waveT = 1e9;
  g.monsters.length = 0;
  g.hero.x = 14.5;
  g.hero.y = 15.5;
  g.hero.fx = 1;
  g.hero.fy = 0;
  g.events.length = 0;
  return g;
}

/**
 * A dungeon with nothing alive in it, and an ordinary character at its door: where what an attack
 * costs can be counted exactly. (In the practice room mana pours back by itself.)
 */
function field(cls: ClassId, limit: 'cooldown' | 'mana' = 'cooldown', seed = 9): Game {
  const g = new Game(cls, seed);
  // (not a first dungeon, with its fallen wordsmith)
  g.depth = 2;
  g.cleared = 1;
  g.enterDungeon();
  g.monsters.length = 0;
  madeOnce(g);
  g.setLimit(limit);
  g.hero.fx = 1;
  g.hero.fy = 0;
  g.events.length = 0;
  return g;
}

/** A monster that stands still, never strikes, and can take anything. */
function dummy(g: Game, dx: number, dy: number, life = 1e7): Monster {
  const a = inner(g);
  const m = a.spawn('skeleton', g.hero.x + dx, g.hero.y + dy, 1, 0, false, a.rng);
  a.wakeUp(m);
  m.speed = 0;
  m.cd = 1e9;
  m.life = m.maxLife = life;
  return m;
}

/** Ask for an attack once (one step with the button down), aimed at a point relative to the hero. Time is counted from this step. */
function ask(g: Game, skill: 0 | 1, dx: number, dy: number, dt = DT): Controls {
  const h = g.hero;
  const c = emptyControls();
  c.aimX = c.castX = h.x + dx;
  c.aimY = c.castY = h.y + dy;
  if (skill === 0) c.fire = true;
  else c.cast = true;
  g.update(dt, c);
  c.fire = false;
  c.cast = false;
  return c;
}

/** One step of the game, as these tests see it. */
interface Step {
  /** Seconds since the watching began (since the attack was asked for, when it follows `ask`). */
  t: number;
  /** An attack has been begun and has not landed: which, or -1. */
  winding: number;
  /** A slow attack is waiting its turn. */
  queued: boolean;
  events: GameEvent[];
  /** The hero's shots that left in this step, and the traps lying about. */
  shots: number;
  traps: number;
  /** How often each of the three abilities has been used. */
  uses: number[];
  /** Where the hero is. */
  x: number;
  y: number;
}

/** Step the game on for `seconds`, and say what happened at each step. `c` is what the player does meanwhile. */
function watch(g: Game, c: Controls, seconds: number, dt = DT): Step[] {
  const out: Step[] = [];
  const h = g.hero;
  for (let k = 1; k <= Math.round(seconds / dt); k++) {
    g.update(dt, c);
    out.push({
      t: k * dt,
      winding: h.windup ? h.windup.skill : -1,
      queued: h.queued !== null,
      events: g.events.splice(0),
      shots: g.projectiles.filter((p) => !p.hostile && p.age <= dt + EPS).length,
      traps: g.traps.length,
      uses: h.skills.map((s) => s.uses),
      x: h.x,
      y: h.y,
    });
  }
  return out;
}

/** Did an attack of this kind go out in this step? */
function wentOut(s: Step, kind: SkillKind): boolean {
  if (kind === 'melee') return s.events.some((e) => e.t === 'swing');
  if (kind === 'burst') return s.events.some((e) => e.t === 'burst' && e.style === 'slam');
  // (Version 12.1: a whirlwind's first turn, a held beam's first bite)
  if (kind === 'whirl') return s.events.some((e) => e.t === 'burst' && e.style === 'whirl');
  if (kind === 'projectile') return s.shots > 0;
  // (Version 12.2: a volley leaves the bow for the sky)
  if (kind === 'volley') return s.events.some((e) => e.t === 'volleyUp');
  // (Version 12: a wave is sent, an orb is set down, a beam fires, a familiar is called)
  if (kind === 'wave') return s.events.some((e) => e.t === 'wave');
  if (kind === 'orb') return s.events.some((e) => e.t === 'orbSet');
  if (kind === 'beam') return s.events.some((e) => e.t === 'beamBite');
  if (kind === 'summon') return s.events.some((e) => e.t === 'familiar');
  return false;
}

const ATTACKS: readonly SkillKind[] = ['melee', 'burst', 'whirl', 'projectile', 'volley', 'wave', 'orb', 'beam', 'summon'];
/** Did any attack at all go out in this step? */
const anyOut = (s: Step): boolean => ATTACKS.some((k) => wentOut(s, k)) || s.events.some((e) => e.t === 'hit' && !e.onHero);

/** The wind-up the rules give one of the hero's two attacks as the hero stands. */
function windOf(g: Game, skill: 0 | 1): number {
  const s = g.hero.skills[skill];
  const def = SKILLS[s.id];
  if (skill === 1) return def.windup;
  // (a fast weapon's wind-up is never more than two fifths of the time between its blows)
  return Math.min(def.windup, 0.4 / Math.max(0.3, s.r.rate));
}

/** "After `seconds`, to the step": not before, and no more than one step after. */
const onTime = (t: number, seconds: number, dt = DT): boolean => t >= seconds - EPS && t <= seconds + dt + EPS;

/** Where to stand something so that an attack of this kind hits it, and where to aim. */
const REACH: Record<string, number> = { melee: 1.1, burst: 1.4, whirl: 1.2, projectile: 3, volley: 3, wave: 3, orb: 3, beam: 3, summon: 3 };

// =============================================================================================

test('the wind-ups are short: about a quarter of a second at the most, and the evasive moves have none', () => {
  // The owner was told "all short enough that the fighting still feels quick".
  for (const cls of CLASS_IDS) {
    const [, , evade] = skillsFor(cls, CLASSES[cls].starts);
    assert.deepEqual([SKILLS[evade].windup, SKILLS[evade].follow], [0, 0], `${SKILLS[evade].name}: a dodge asked for is a dodge made`);
  }
  // every attack there is, whichever weapon or class brings it (Version 12). The longest is the
  // beam's: its wind-up is the ghost line the owner asked for ("Maybe half a second animation":
  // three tenths of ghost line, two of beam).
  // (the evasive moves take words too since Version 12.2, and still have no wind-up: see above)
  const evasive = new Set<SkillKind>(['leap', 'roll', 'warp']);
  for (const d of Object.values(SKILLS)) {
    if (!d.sockets || evasive.has(d.kind)) continue;
    assert.ok(d.windup > 0 && d.windup <= 0.3, `${d.name}: a wind-up, and a short one (${d.windup} s)`);
    assert.ok(d.follow > 0 && d.follow <= 0.5, `${d.name}: and a short follow-through (${d.follow} s)`);
  }
});

test('a new character, and one carried on with from a save, is not in the middle of anything', () => {
  for (const cls of CLASS_IDS) {
    const g = new Game(cls, 5);
    const h = g.hero;
    assert.deepEqual([h.windup, h.queued, h.attackT, h.attackAge, h.attackWind, h.swingT], [null, null, 0, 0, 0, 0], `${cls}: nothing begun, nothing waiting`);
    // a save made in the middle of an attack keeps nothing of it: the character comes back standing in town
    g.enterDungeon();
    g.monsters.length = 0;
    const c = ask(g, 0, 2, 0);
    c.cast = true;
    g.update(DT, c);
    assert.ok(h.windup && h.queued, `${cls}: an attack being made and another waiting`);
    const back = Game.restore(JSON.parse(JSON.stringify(g.save())));
    const b = back.hero;
    assert.deepEqual([b.windup, b.queued, b.attackT, b.anim], [null, null, 0, 'idle'], `${cls}: carried on with, nothing is being made`);
    const steps = watch(back, emptyControls(), 0.6);
    assert.ok(steps.every((s) => !anyOut(s) && s.winding < 0), `${cls}: and nothing lands out of nowhere`);
    assert.deepEqual(b.skills.map((s) => s.uses), [0, 0, 0]);
  }
});

test('an attack lands when its wind-up is over: not before, and not later', () => {
  for (const cls of CLASS_IDS) {
    for (const skill of [0, 1] as const) {
      // (at the pace the other tests keep, and at a finer one)
      for (const dt of [DT, 1 / 30]) {
        const g = room(cls);
        const h = g.hero;
        const def = SKILLS[h.skills[skill].id];
        const name = `${cls}: ${def.name}`;
        const m = dummy(g, REACH[def.kind], 0);
        const wind = windOf(g, skill);
        assert.ok(wind > dt, `${name} has a wind-up to speak of (${wind})`);
        const c = ask(g, skill, REACH[def.kind], 0, dt);
        // asked for: begun, and nothing more
        assert.ok(h.windup && h.windup.skill === skill, `${name}: it has been begun`);
        assert.deepEqual(h.skills.map((s) => s.uses), [0, 0, 0], `${name}: but not made`);
        assert.ok(!g.events.some((e) => e.t === 'swing' || e.t === 'burst' || e.t === 'volleyUp' || e.t === 'hit'), `${name}: nothing goes out in the step it is asked for`);
        assert.equal(g.projectiles.length + g.traps.length + g.volleys.length, 0);
        g.events.length = 0;
        const steps = watch(g, c, 1, dt);
        const k = steps.findIndex((s) => s.winding < 0);
        assert.ok(k >= 0, `${name}: it lands`);
        assert.ok(onTime(steps[k].t, wind, dt), `${name}: it lands ${steps[k].t.toFixed(3)} s after it is asked for (the rules say ${wind})`);
        for (const s of steps.slice(0, k)) {
          assert.ok(!anyOut(s) && s.traps === 0, `${name}: nothing goes out before it lands (at ${s.t.toFixed(3)} s)`);
          assert.deepEqual(s.uses, [0, 0, 0], `${name}: and it does not count as used`);
        }
        // in the step it lands: the blow is struck, the arrow leaves, the spell goes off
        assert.ok(wentOut(steps[k], def.kind), `${name}: it goes out in the step its wind-up ends`);
        assert.equal(steps[k].uses[skill], 1, `${name}: and counts as used from then`);
        // once, and only once
        assert.equal(steps.filter((s) => wentOut(s, def.kind)).length, 1, `${name}: one press, one attack`);
        assert.equal(h.skills[skill].uses, 1);
        // what stands in its way is hurt: at once by a blow or a burst, when it arrives by a shot or a volley
        const hurtAt = steps.findIndex((s) => s.events.some((e) => e.t === 'hit' && !e.onHero));
        assert.ok(hurtAt >= k && m.life < m.maxLife, `${name}: and it hurts what it hits, no sooner than it lands`);
        if (def.kind === 'melee' || def.kind === 'burst' || def.kind === 'orb' || def.kind === 'beam') assert.equal(hurtAt, k, `${name}: a blow lands as it is struck`);
        else assert.ok(hurtAt > k, `${name}: what is loosed or thrown has still to get there`);
      }
    }
  }
});

test('nothing is paid until it lands', () => {
  for (const cls of CLASS_IDS) {
    // cooldowns as the limit: the slow attack's charge is spent, and its cooldown begins, when it lands
    {
      const g = field(cls, 'cooldown');
      const h = g.hero;
      const slow = h.skills[1];
      const name = `${cls}: ${SKILLS[slow.id].name}`;
      assert.deepEqual([slow.charges, slow.cd, slow.uses], [1, 0, 0]);
      const c = ask(g, 1, 2, 0);
      let landed = false;
      for (let k = 0; k < 120 && !landed; k++) {
        assert.deepEqual([slow.charges, slow.cd, slow.uses], [1, 0, 0], `${name}: still ready, still unused, while it is being made`);
        g.update(DT, c);
        landed = h.windup === null;
      }
      assert.ok(landed);
      assert.deepEqual([slow.charges, slow.uses], [0, 1], `${name}: used, and its charge spent`);
      assert.equal(slow.cd, slow.r.cooldown, `${name}: its cooldown runs from the moment it lands`);
      assert.equal(h.mana, h.d.maxMana, 'and with cooldowns nothing costs mana');
    }
    // mana as the limit: the mana is paid when it lands
    {
      const g = field(cls, 'mana');
      const h = g.hero;
      const slow = h.skills[1];
      const name = `${cls}: ${SKILLS[slow.id].name}`;
      const cost = slow.r.mana;
      assert.ok(cost > 0 && h.mana === h.d.maxMana);
      const c = ask(g, 1, 2, 0);
      let landed = false;
      for (let k = 0; k < 120 && !landed; k++) {
        assert.equal(h.mana, h.d.maxMana, `${name}: not a point of mana is gone while it is being made`);
        assert.deepEqual([slow.charges, slow.uses], [1, 0]);
        g.update(DT, c);
        landed = h.windup === null;
      }
      assert.ok(landed);
      assert.equal(h.mana, h.d.maxMana - cost, `${name}: paid for as it lands (${cost} mana)`);
      assert.deepEqual([slow.charges, slow.uses], [0, 1]);
    }
    // and if what it needs has gone in the meantime, nothing happens and nothing is paid
    {
      const g = field(cls, 'mana');
      const h = g.hero;
      const slow = h.skills[1];
      const name = `${cls}: ${SKILLS[slow.id].name}`;
      const c = ask(g, 1, 2, 0);
      assert.ok(h.windup);
      h.mana = 0;
      const steps = watch(g, c, 0.6);
      assert.ok(steps.every((s) => !anyOut(s) && s.traps === 0), `${name}: with the mana gone before it lands, it does not go out`);
      assert.equal(slow.uses, 0, `${name}: is not counted as used`);
      assert.equal(slow.charges, 1);
      assert.ok(h.mana >= 0 && h.mana < slow.r.mana, `${name}: and takes no mana (there is ${h.mana.toFixed(1)}, all of it come back since)`);
      assert.equal(h.windup, null, 'the hero is not left winding up for ever');
    }
    // the quick attack costs nothing either way: it only counts as used when it lands
    {
      const g = field(cls, 'mana');
      const h = g.hero;
      const c = ask(g, 0, 2, 0);
      assert.equal(h.skills[0].uses, 0);
      land(g, c, DT);
      assert.equal(h.skills[0].uses, 1);
      assert.equal(h.mana, h.d.maxMana);
    }
  }
});

test('an evasive move breaks an attack off, and an attack broken off is not paid for: no mana, no charge, no use counted', () => {
  // (What a broken-off quick attack does still use up is its turn in the weapon's rhythm: the
  // time between blows is counted from the moment it was asked for, so after a dodge the next
  // one may have to wait for it. That is put to the author as a question, and is not checked
  // here one way or the other: the last lines below wait long enough for it not to matter.)
  for (const cls of CLASS_IDS) {
    for (const limit of ['cooldown', 'mana'] as const) {
      for (const skill of [0, 1] as const) {
        const g = field(cls, limit);
        const h = g.hero;
        const [, slow, evade] = h.skills;
        const def = SKILLS[h.skills[skill].id];
        const name = `${cls}, ${limit}: ${def.name} broken off by ${SKILLS[evade.id].name}`;
        const c = ask(g, skill, 2, 0);
        // a slow attack waiting its turn behind the quick one goes with it
        if (skill === 0) {
          c.cast = true;
          g.update(DT, c);
          c.cast = false;
          assert.ok(h.queued, 'a slow attack is waiting behind the quick one');
        }
        g.update(DT, c);
        assert.ok(h.windup && h.windup.skill === skill && h.attackT > 0, `${name}: it is being made`);
        g.events.length = 0;
        // the dodge, away from where the attack was aimed
        c.evade = true;
        c.evadeX = h.x - 3;
        c.evadeY = h.y;
        g.update(DT, c);
        c.evade = false;
        assert.equal(evade.uses, 1, `${name}: the dodge is made at once`);
        assert.equal(h.windup, null, `${name}: the attack is broken off`);
        assert.equal(h.queued, null, `${name}: and nothing is left waiting behind it`);
        assert.equal(h.attackT, 0, `${name}: the picture lets go of it too`);
        assert.equal(h.mana, h.d.maxMana - evade.r.mana, `${name}: only the dodge is paid for`);
        // long past the moment it would have landed: it never does
        // (the ranger's roll leaves its own trap behind: that is the dodge's, and nothing here steps on it)
        const own = SKILLS[evade.id].kind === 'roll' && SKILLS[evade.id].dmg > 0 ? 1 : 0;
        const steps = watch(g, c, 1.2);
        assert.ok(steps.every((s) => !anyOut(s) && s.traps === own && s.winding < 0 && !s.queued), `${name}: nothing goes out`);
        assert.deepEqual([h.skills[0].uses, slow.uses], [0, 0], `${name}: nothing counts as used`);
        assert.deepEqual([slow.charges, slow.cd], [1, 0], `${name}: the slow attack is as ready as it was`);
        assert.ok(h.mana >= h.d.maxMana - evade.r.mana, 'and no mana went after the dodge');
        // and it can be asked for again as if nothing had happened
        const again = ask(g, skill, 2, 0);
        const made = watch(g, again, 0.6);
        const k = made.findIndex((s) => s.winding < 0);
        assert.ok(k >= 0 && onTime(made[k].t, windOf(g, skill)) && wentOut(made[k], def.kind), `${name}: asked for again, it is made as usual`);
        assert.equal(h.skills[skill].uses, 1);
      }
    }
  }
});

test('a dodge that cannot be made changes nothing: the attack goes on', () => {
  for (const cls of CLASS_IDS) {
    const g = field(cls, 'cooldown');
    const h = g.hero;
    const evade = h.skills[2];
    const def = SKILLS[h.skills[1].id];
    // spend the dodge (both of them, for the ranger's roll), and let it finish
    const c = emptyControls();
    while (evade.charges > 0) {
      c.evade = true;
      c.evadeX = h.x - 2;
      c.evadeY = h.y;
      g.update(DT, c);
      c.evade = false;
      watch(g, c, 0.6);
    }
    assert.equal(evade.charges, 0);
    const spent = evade.uses;
    g.events.length = 0;
    const a = ask(g, 1, 2, 0);
    a.evade = true;
    a.evadeX = h.x - 3;
    a.evadeY = h.y;
    g.update(DT, a);
    a.evade = false;
    assert.equal(evade.uses, spent, `${cls}: no dodge to be had`);
    assert.ok(h.windup && h.windup.skill === 1, `${cls}: so ${def.name} is still being made`);
    const steps = watch(g, a, 0.6);
    const k = steps.findIndex((s) => s.winding < 0);
    // (two steps have gone by since it was asked for: the one it was asked in, and the dodge that was not)
    assert.ok(k >= 0 && onTime(steps[k].t + DT, def.windup) && wentOut(steps[k], def.kind), `${cls}: and lands when it should`);
  }
});

test('while one attack is being made no other begins; a slow attack asked for meanwhile follows the moment the first has landed', () => {
  for (const cls of CLASS_IDS) {
    for (const held of [false, true]) {
      const g = room(cls);
      const h = g.hero;
      const [quick, slow] = h.skills;
      const qd = SKILLS[quick.id];
      const sd = SKILLS[slow.id];
      const name = `${cls}: ${sd.name} asked for (${held ? 'and held' : 'with a tap'}) while ${qd.name} is being made`;
      const c = ask(g, 0, 3, 0);
      const first = windOf(g, 0);
      g.events.length = 0;
      // one step later the slow attack is asked for, aimed somewhere else
      c.cast = true;
      c.castX = h.x + 1.5;
      c.castY = h.y + 2;
      // (times below are counted from the step the quick attack was asked for)
      const steps = watch(g, c, DT);
      if (!held) c.cast = false;
      assert.equal(steps[0].winding, 0, `${name}: the quick attack goes on being made`);
      assert.ok(steps[0].queued && h.queued && h.queued.tx === c.castX && h.queued.ty === c.castY, `${name}: it is kept, with where it was aimed`);
      assert.deepEqual(steps[0].uses, [0, 0, 0]);
      steps.push(...watch(g, c, 1).map((s) => ({ ...s, t: s.t + DT })));
      // the quick attack lands when it would have anyway
      const a = steps.findIndex((s) => wentOut(s, qd.kind));
      assert.ok(a > 0 && onTime(steps[a].t, first), `${name}: the quick attack lands on time`);
      assert.ok(steps.slice(0, a).every((s) => s.winding === 0 && !wentOut(s, sd.kind) && s.uses[1] === 0), `${name}: the slow one does not begin before that`);
      // and in that very step the slow one begins
      assert.equal(steps[a].winding, 1, `${name}: the slow attack begins in the step the quick one lands`);
      assert.deepEqual(steps[a].uses, [1, 0, 0]);
      if (!held) assert.ok(!steps[a].queued, 'it is no longer waiting: it is being made');
      const b = steps.findIndex((s) => wentOut(s, sd.kind));
      assert.ok(b > a && onTime(steps[b].t - steps[a].t, sd.windup), `${name}: and lands its own wind-up later (${(steps[b].t - steps[a].t).toFixed(3)} s; the rules say ${sd.windup})`);
      assert.deepEqual(steps[b].uses, [1, 1, 0]);
      assert.ok(steps.slice(a, b).every((s) => s.winding === 1), 'with nothing in between');
      // one press, one attack: holding it down does not make it twice (it has a cooldown)
      assert.equal(steps.filter((s) => wentOut(s, sd.kind)).length, 1);
      assert.deepEqual([quick.uses, slow.uses], [1, 1]);
      // it went where it was aimed when it was asked for
      if (sd.kind === 'volley') {
        const loosed = steps[b].events.find((e) => e.t === 'volleyUp');
        assert.ok(loosed && loosed.t === 'volleyUp' && Math.abs(loosed.tx - c.castX) < 0.3 && Math.abs(loosed.ty - c.castY) < 0.3, `${name}: loosed at where it was asked for`);
      } else if (sd.kind === 'burst') {
        const burst = steps[b].events.find((e) => e.t === 'burst' && e.style === 'slam');
        assert.ok(burst && burst.t === 'burst' && burst.y > h.y + 0.5 && burst.x > h.x + 0.3, `${name}: struck toward where it was asked for`);
      }
    }
    // the other way round: the quick attack held down all through the slow one's wind-up
    const g = room(cls);
    const h = g.hero;
    const sd = SKILLS[h.skills[1].id];
    const qd = SKILLS[h.skills[0].id];
    const c = ask(g, 1, 2, 0);
    c.fire = true;
    const steps = watch(g, c, 1);
    const b = steps.findIndex((s) => wentOut(s, sd.kind));
    assert.ok(b >= 0 && onTime(steps[b].t, sd.windup), `${cls}: ${sd.name} lands on time whatever else is held`);
    assert.ok(steps.slice(0, b).every((s) => s.winding === 1 && s.uses[0] === 0 && !wentOut(s, qd.kind)), `${cls}: ${qd.name} does not cut in on it`);
    // And with the button still down the quick attack is made once the slow one is out of the way:
    // no later than the slow one's follow-through and its own wind-up after the slow one landed.
    // (As the rules stand it is begun in the very step the slow one lands, which takes the slow
    // attack's picture away at its blow. Whether it should wait for some of the follow-through is
    // put to the author as a question: this holds either way.)
    const next = steps.findIndex((s, i) => i > b && wentOut(s, qd.kind));
    assert.ok(next > b, `${cls}: ${qd.name} is made once the way is clear`);
    assert.ok(steps[next].t - steps[b].t <= sd.follow + windOf(g, 0) + 2 * DT + EPS, `${cls}: and soon (${(steps[next].t - steps[b].t).toFixed(3)} s after ${sd.name} landed)`);
    assert.ok(steps.slice(b + 1, next).every((s) => !wentOut(s, sd.kind)) && steps[next].uses[1] === 1, `${cls}: ${sd.name} was made once, for all that the other button was held`);
    assert.ok(h.skills[0].uses >= 1);
  }
});

test('a slow attack that is not ready is not kept waiting; one kept waiting is forgotten after 0.4 s', () => {
  // not ready (on its cooldown): asking for it during another attack asks for nothing
  {
    const g = room('warrior');
    const h = g.hero;
    const spent = ask(g, 1, 2, 0);
    land(g, spent, DT);
    assert.deepEqual([h.skills[1].uses, h.skills[1].charges], [1, 0]);
    // (let the slam's follow-through and the quick attack's own timer run out)
    watch(g, spent, 1);
    const c = ask(g, 0, 2, 0);
    assert.ok(h.windup && h.windup.skill === 0);
    c.cast = true;
    g.update(DT, c);
    c.cast = false;
    assert.equal(h.queued, null, 'Slam is on its cooldown: nothing is kept');
    land(g, c, DT);
    assert.deepEqual([h.skills[0].uses, h.skills[1].uses], [1, 1]);
  }
  // No attack in the game takes 0.4 s to land (the slowest wind-up is a quarter of a second), so
  // as the numbers stand a slow attack that is kept always gets its turn. The limit is there for
  // the day one does: to see it, the quick attack's wind-up is stretched by hand, as if the blow
  // were held back, and a Slam is asked for behind it.
  for (const [held, follows] of [[0.3, true], [1, false]] as const) {
    const g = room('warrior');
    const h = g.hero;
    const c = ask(g, 0, 2, 0);
    assert.ok(h.windup);
    if (h.windup) h.windup.t = held;
    c.cast = true;
    g.update(DT, c);
    c.cast = false;
    assert.ok(h.queued && Math.abs(h.queued.t - 0.4) < EPS, 'kept, for 0.4 s');
    const steps = watch(g, c, 2);
    const gone = steps.findIndex((s) => !s.queued);
    const struck = steps.findIndex((s) => s.uses[0] === 1);
    // (the blow lands `held` seconds after it was stretched, which was one step before the watching began)
    assert.ok(struck >= 0 && onTime(steps[struck].t + DT, held), `the held blow lands after ${held} s`);
    if (follows) {
      assert.equal(gone, struck, 'kept until the blow has landed');
      assert.equal(steps[struck].winding, 1, 'and then it follows');
      assert.equal(h.skills[1].uses, 1);
    } else {
      assert.ok(gone >= 0 && onTime(steps[gone].t, 0.4), `forgotten ${steps[gone].t.toFixed(3)} s after it was asked for`);
      assert.ok(gone < struck && steps[gone].winding === 0, 'while the blow is still being held');
      assert.ok(steps.every((s) => s.winding !== 1) && h.skills[1].uses === 0, 'and when the blow lands at last, no Slam follows');
      assert.deepEqual([h.skills[1].charges, h.skills[1].cd], [1, 0], 'it was never begun, so it cost nothing');
    }
  }
});

/** Make the hero quick enough for the quick attack to be used at least `rate` times a second (by Dexterity, as gear and levels would). */
function quicken(g: Game, rate: number): number {
  const h = g.hero;
  for (let k = 0; k < 400 && h.skills[0].r.rate < rate; k++) {
    h.attrs.dex += 5;
    g.refresh();
  }
  return h.skills[0].r.rate;
}

test("a fast weapon's wind-up is cut short: never more than two fifths of the time between its blows", () => {
  for (const cls of CLASS_IDS) {
    const def = SKILLS[skillsFor(cls, CLASSES[cls].starts)[0]];
    // as the character begins, the wind-up is the one in the table
    {
      const g = room(cls);
      const h = g.hero;
      assert.ok(0.4 / h.skills[0].r.rate > def.windup, `${cls}: an ordinary weapon is slow enough for the whole wind-up`);
      ask(g, 0, 3, 0);
      assert.equal(h.attackWind, def.windup);
    }
    // twice, three and five times as many blows a second as the wind-up leaves room for
    for (const pace of [4, 6, 10]) {
      const g = room(cls);
      const h = g.hero;
      const rate = quicken(g, pace);
      const wind = 0.4 / rate;
      assert.ok(rate >= pace && wind < def.windup, `${cls}: ${rate.toFixed(1)} blows a second leave less than ${def.name}'s ${def.windup} s`);
      assert.equal(windOf(g, 0), wind);
      const c = ask(g, 0, 3, 0);
      assert.ok(Math.abs(h.attackWind - wind) < EPS, `${cls} at ${rate.toFixed(1)} a second: the wind-up is ${wind.toFixed(3)} s`);
      assert.ok(Math.abs(h.attackT - (wind + def.follow)) < EPS, 'and the follow-through is as long as ever');
      const steps = watch(g, c, 0.5);
      const k = steps.findIndex((s) => wentOut(s, def.kind));
      assert.ok(k >= 0 && onTime(steps[k].t, wind), `${cls} at ${rate.toFixed(1)} a second: it lands after ${steps[k].t.toFixed(3)} s`);
      assert.ok(wind <= (0.4 / rate) + EPS && wind < 1 / rate, 'two fifths of the time between blows');
    }
    // the slow attack's wind-up is its own, however fast the weapon
    {
      const g = room(cls);
      const h = g.hero;
      quicken(g, 6);
      ask(g, 1, 2, 0);
      assert.equal(h.attackWind, SKILLS[h.skills[1].id].windup, `${cls}: the slow attack is not hurried by the weapon`);
    }
    // chilled, the weapon is slower, and the wind-up is worked out from the slower pace
    {
      const g = room(cls);
      const h = g.hero;
      const rate = quicken(g, 6);
      h.chill = 0.3;
      h.chillT = 5;
      ask(g, 0, 3, 0);
      assert.ok(Math.abs(h.attackWind - Math.min(def.windup, 0.4 / (rate * (1 - 0.3 * 0.5)))) < EPS, `${cls}: a chilled hero winds up for longer`);
    }
  }
});

test('how often the quick attack is made with the button held is what it always was: the wind-up takes nothing from it', () => {
  const dt = 1 / 60;
  for (const cls of CLASS_IDS) {
    const def = SKILLS[skillsFor(cls, CLASSES[cls].starts)[0]];
    for (const pace of [0, 2.5, 4, 7]) {
      const g = room(cls);
      const h = g.hero;
      const rate = pace > 0 ? quicken(g, pace) : h.skills[0].r.rate;
      const c = emptyControls();
      c.fire = true;
      c.aimX = h.x + 3;
      c.aimY = h.y;
      const seconds = 8;
      const steps = watch(g, c, seconds, dt);
      const made = steps.filter((s) => wentOut(s, def.kind)).map((s) => s.t);
      const name = `${cls} at ${rate.toFixed(2)} a second`;
      // every blow follows the last by the weapon's own interval (to the step), wind-up or no wind-up
      for (let i = 1; i < made.length; i++) {
        const gap = made[i] - made[i - 1];
        assert.ok(gap >= 1 / rate - EPS && gap <= 1 / rate + dt + EPS, `${name}: ${gap.toFixed(4)} s between blows (the weapon's interval is ${(1 / rate).toFixed(4)})`);
      }
      // so in eight seconds it is made eight seconds' worth of times: the first after its wind-up, then one an interval
      const interval = made[1] - made[0];
      const expected = Math.floor((seconds - made[0]) / interval + 1e-6) + 1;
      assert.equal(made.length, expected, `${name}: ${made.length} blows in ${seconds} s`);
      assert.ok(made.length >= seconds / (1 / rate + dt) - 1 && made.length <= seconds * rate + 1, `${name}: ${made.length} blows in ${seconds} s is ${rate.toFixed(2)} a second`);
      assert.ok(onTime(made[0], windOf(g, 0) + dt, dt), `${name}: the first of them a wind-up after the button went down`);
      assert.equal(h.skills[0].uses, made.length);
    }
  }
});

test('what the picture is told: which attack, how long ago it was begun, how long its wind-up is, how long it lasts', () => {
  for (const cls of CLASS_IDS) {
    for (const skill of [0, 1] as const) {
      const g = room(cls);
      const h = g.hero;
      const def = SKILLS[h.skills[skill].id];
      const name = `${cls}: ${def.name}`;
      const wind = windOf(g, skill);
      h.animT = 5;
      assert.equal(h.anim, 'idle');
      const c = ask(g, skill, 0, 3);
      // begun: the picture's clocks start, and the hero turns to where the attack is aimed
      assert.equal(h.attackSkill, skill, `${name}: which attack it is`);
      assert.equal(h.attackAge, 0, `${name}: just begun`);
      assert.equal(h.attackWind, wind, `${name}: its wind-up, as the rules have it`);
      assert.ok(Math.abs(h.attackT - (wind + def.follow)) < EPS, `${name}: busy with it for the wind-up and the follow-through`);
      assert.equal(h.anim, 'attack');
      assert.ok(h.animT <= DT + EPS, `${name}: the animation clock starts again`);
      assert.ok(Math.abs(h.fx) < 1e-6 && Math.abs(h.fy - 1) < 1e-6, `${name}: facing where it was aimed`);
      // through it: the age counts up as the time left counts down, and the blow lands as the age reaches the wind-up
      let landedAt = -1;
      let overAt = -1;
      const span = wind + def.follow;
      for (let k = 1; k * DT < span + 0.5; k++) {
        // (the player pulls the other way all the while: the hero does not turn in the middle of an attack)
        c.mx = -1;
        c.my = 0;
        const before = h.attackT;
        g.update(DT, c);
        if (before > 0) {
          assert.ok(Math.abs(h.attackAge - k * DT) < 1e-6, `${name}: ${k} steps in, it was begun ${h.attackAge.toFixed(4)} s ago`);
          assert.ok(Math.abs(h.attackT - Math.max(0, span - k * DT)) < 1e-6, `${name}: and ${h.attackT.toFixed(4)} s of it are left`);
        }
        if (landedAt < 0 && h.windup === null) {
          landedAt = k * DT;
          assert.ok(h.attackAge >= h.attackWind - 1e-6 && h.attackAge <= h.attackWind + DT + 1e-6, `${name}: it lands as its age reaches its wind-up (${h.attackAge.toFixed(4)} against ${h.attackWind})`);
        }
        if (landedAt < 0) assert.ok(h.attackAge < h.attackWind + 1e-6, `${name}: until then its age is short of its wind-up`);
        if (overAt < 0 && h.attackT <= 0) overAt = k * DT;
        if (overAt < 0) {
          assert.equal(h.anim, 'attack', `${name}: the attack is shown until it is over`);
          assert.ok(Math.abs(h.fx) < 1e-6 && Math.abs(h.fy - 1) < 1e-6, `${name}: and the hero faces where it was aimed all through it`);
          assert.equal(h.attackSkill, skill);
          assert.equal(h.attackWind, wind);
        }
      }
      assert.ok(onTime(landedAt, wind), `${name}: landed after ${landedAt.toFixed(3)} s`);
      assert.ok(onTime(overAt, span), `${name}: over after ${overAt.toFixed(3)} s (wind-up ${wind} and follow-through ${def.follow})`);
      assert.equal(h.anim, 'walk', `${name}: and then the hero is simply walking`);
      assert.ok(h.fx < -0.99, 'the way the player was pulling');
      // the age stops with the attack: it is not left counting
      assert.ok(h.attackAge <= span + DT + 1e-6);
    }
  }
});

test('the quick attack goes the way the hero faces, from wherever they have got to; the slow one lands where it was aimed', () => {
  // the ranger asks for a shot to the right and walks down the room while the bow is drawn
  {
    const g = room('ranger');
    const h = g.hero;
    const y0 = h.y;
    const c = ask(g, 0, 4, 0);
    c.my = 1;
    const steps = watch(g, c, 0.3);
    const k = steps.findIndex((s) => s.shots > 0);
    assert.ok(k >= 0 && onTime(steps[k].t, SKILLS.shot.windup));
    // (the first arrow in the room: it is the only one)
    assert.equal(g.projectiles.length, 1);
    const p = g.projectiles[0];
    // (the string is let go at the top of the step, before that step's walking: so the ranger's
    // place then is where the step before left them)
    const from = steps[k - 1].y;
    const walked = from - y0;
    assert.ok(walked > 0.1, `the ranger has walked on while the bow was drawn (${walked.toFixed(2)} tiles)`);
    assert.ok(walked < h.d.moveSpeed * SKILLS.shot.windup * 0.6, 'slowly: an attack is being made');
    assert.ok(p.vx > 0 && Math.abs(p.vy) < 1e-6, 'the arrow flies the way the bow was pointed when the shot was asked for');
    // it left the bow where the ranger was when the string was let go, not where the shot was asked for
    assert.ok(Math.abs(p.y - from) < 1e-6, `it left from where the ranger had got to (${(p.y - y0).toFixed(2)} tiles down the room)`);
    assert.ok(steps.slice(0, k + 1).every((s) => Math.abs(s.x - steps[0].x) < 1e-6), 'and the ranger went straight down the room, facing right all the while');
    assert.ok(Math.abs(h.fx - 1) < 1e-6 && Math.abs(h.fy) < 1e-6, 'still facing the way of the shot');
  }
  // the ranger asks for a volley, and the pointer wanders off while the bow is raised: it rains where it was asked for
  {
    const g = room('ranger');
    const h = g.hero;
    const c = ask(g, 1, 3, 1);
    const tx = c.castX;
    const ty = c.castY;
    c.castX = h.x - 4;
    c.castY = h.y - 4;
    c.aimX = h.x - 4;
    c.aimY = h.y - 4;
    land(g, c, DT);
    assert.equal(g.volleys.length, 1);
    assert.ok(Math.abs(g.volleys[0].x - tx) < 0.3 && Math.abs(g.volleys[0].y - ty) < 0.3, 'loosed at where it was asked for');
  }
});

test('a new level clears an attack that was still being made', () => {
  for (const cls of CLASS_IDS) {
    for (const where of ['dungeon', 'town', 'portal'] as const) {
      const g = field(cls, 'mana');
      const h = g.hero;
      const name = `${cls}, into the ${where === 'portal' ? 'town by the portal' : where}`;
      // a quick attack being made, and a slow one waiting behind it
      const c = ask(g, 0, 2, 0);
      c.cast = true;
      g.update(DT, c);
      c.cast = false;
      assert.ok(h.windup && h.queued && h.attackT > 0, `${name}: an attack is being made and another is waiting`);
      if (where === 'dungeon') g.enterDungeon();
      else if (where === 'town') g.enterTown();
      else {
        // (the way a player leaves: standing at the open portal, and pressing)
        const p = g.level.portal;
        assert.ok(p);
        if (!p) return;
        p.state = 1;
        h.x = p.x;
        h.y = p.y + 0.8;
        c.interact = true;
        g.update(DT, c);
        c.interact = false;
        assert.ok(g.level.town, `${name}: through the portal`);
      }
      assert.equal(h.windup, null, `${name}: nothing is being made`);
      assert.equal(h.queued, null, `${name}: nothing is waiting`);
      assert.equal(h.attackT, 0, `${name}: and the picture shows no attack`);
      // whatever is in the new level, the old attack does not land in it
      const mana = h.mana;
      g.events.length = 0;
      const steps = watch(g, emptyControls(), 1);
      assert.ok(steps.every((s) => ATTACKS.every((k) => !wentOut(s, k)) && s.traps === 0 && s.winding < 0 && !s.queued), `${name}: nothing goes out in the new level`);
      assert.deepEqual(h.skills.map((s) => s.uses), [0, 0, 0], `${name}: nothing counts as used`);
      assert.deepEqual([h.skills[1].charges, h.skills[1].cd], [1, 0]);
      assert.ok(h.mana >= mana, `${name}: and nothing was paid`);
      assert.equal(h.anim, 'idle');
    }
  }
});

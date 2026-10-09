// Version 12.1: the attacks that go on while their button is held. Whirlwind (the two-handed
// sword's slow attack) and Beam (the wand's).
//
// The owner, 4 Oct 2026:
//   "let's have greatsword have a whirlwind on tap+hold with a channel that passes through like
//    the Bull stampede"
//   of the Beam (13:55, and "the original ideas for the skill's properties" at 18:53): "Fires
//    towards your finger and stops when you release. You can move the beam around in different
//    directions as long as you hold down"; "it beams constantly for a couple seconds then goes on
//    cooldown"; with mana "it would continuously drain mana".
//   run: tsx --test tests/channel.test.ts

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import type { RNG } from '../src/engine/rng';
import { MANA_MODE, SKILLS, TUNE, WEAPON_SKILLS } from '../src/game/defs';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Controls, GameEvent, Monster } from '../src/game/state';
import type { ClassId, WeaponKind } from '../src/game/types';
import { attackClip } from '../src/render/figure';
import { seasoned } from './helpers';

const DT = 1 / 60;

type Inner = {
  rng: RNG;
  waveT: number;
  spawn: (k: string, x: number, y: number, pack: number, rank: number, boss: boolean, rng: RNG) => Monster;
  wakeUp: (m: Monster) => void;
};
const inner = (g: Game): Inner => g as unknown as Inner;

/** The practice room, empty, the hero in the middle facing +x, carrying a weapon of that kind. */
function room(cls: ClassId, weapon: WeaponKind, seed = 3): Game {
  const g = Game.forPractice(cls, seed);
  if (g.weapon() !== weapon) wear(g, weapon);
  inner(g).waveT = 1e9;
  g.monsters.length = 0;
  g.hero.x = 14.5;
  g.hero.y = 15.5;
  g.hero.fx = 1;
  g.hero.fy = 0;
  g.events.length = 0;
  return g;
}

function wear(g: Game, weapon: WeaponKind): void {
  const i = g.hero.bag.findIndex((it) => it !== null && it.weapon === weapon);
  assert.ok(i >= 0, `a ${weapon} is in the bag`);
  assert.equal(g.equipFromBag(i), null, `the ${g.hero.cls} puts on the ${weapon}`);
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
const hurt = (m: Monster): number => m.maxLife - m.life;

interface Held {
  ev: GameEvent[];
  /** When each bite came, in seconds from the press. */
  bites: number[];
  /** When it began and when it ended (-1: it did not). */
  began: number;
  ended: number;
}

/** A bite of either kind of held attack that is the attack's own (not a Twin's second, not an echo's). */
const isBite = (e: GameEvent): boolean => (e.t === 'burst' && e.style === 'whirl' && !e.echo && (e.n ?? 0) === 0) || (e.t === 'beamBite' && e.n === 0);

/**
 * Press the slow attack and keep it held for `seconds`, pointing at (dx, dy) from where the hero
 * began; then let go and let `after` seconds pass. `each` may change the controls as time goes
 * (it is given the seconds since the press).
 */
function hold(g: Game, seconds: number, dx: number, dy: number, after = 0.6, each?: (c: Controls, t: number) => void): Held {
  const h = g.hero;
  const c = emptyControls();
  const x0 = h.x;
  const y0 = h.y;
  const out: Held = { ev: [], bites: [], began: -1, ended: -1 };
  let t = 0;
  for (let k = 0; t < seconds + after - 1e-9; k++) {
    const down = t < seconds - 1e-9;
    c.cast = down;
    c.hold = down;
    c.castX = x0 + dx;
    c.castY = y0 + dy;
    if (each) each(c, t);
    g.update(DT, c);
    t += DT;
    for (const e of g.events) {
      out.ev.push(e);
      if (isBite(e)) out.bites.push(t);
      if (e.t === 'channel' && out.began < 0) out.began = t;
      if (e.t === 'channelEnd' && out.ended < 0) out.ended = t;
    }
    g.events.length = 0;
  }
  return out;
}

/** No mana comes back by itself: not from the practice room, not from the hero. */
function still(g: Game): void {
  (g as unknown as { practice: boolean }).practice = false;
  g.hero.d.manaRegen = 0;
}

const near = (a: number, b: number, eps: number, what: string): void => assert.ok(Math.abs(a - b) <= eps, `${what}: ${a.toFixed(3)} is not within ${eps} of ${b.toFixed(3)}`);

// =============================================================================================

test('the two attacks that go on while held: Whirlwind on the two-handed sword, Beam on the wand', () => {
  assert.deepEqual([...WEAPON_SKILLS.greatsword], ['strike', 'whirlwind']);
  assert.deepEqual([...WEAPON_SKILLS.wand], ['familiar', 'beam']);
  assert.deepEqual([...WEAPON_SKILLS.sword], ['strike', 'slam'], 'the sword that goes with a shield still slams');
  const held = Object.values(SKILLS).filter((d) => d.channel).map((d) => d.id).sort();
  assert.deepEqual(held, ['beam', 'whirlwind']);
  for (const id of ['beam', 'whirlwind'] as const) {
    const d = SKILLS[id];
    assert.ok(d.channel! >= 1.5 && d.channel! <= 3, `${d.name} may be held "a couple of seconds" (${d.channel})`);
    assert.ok(d.tick! > 0.1 && d.tick! <= 0.35, `${d.name} bites several times a second`);
    assert.ok(d.cooldown > d.channel!, `${d.name} then waits longer than it ran`);
    assert.ok(d.windup > 0 && d.windup <= 0.15, `${d.name} begins almost at once (${d.windup})`);
  }
});

test('Whirlwind: held, it cuts everything round the hero again and again; let go, it stops', () => {
  const g = room('warrior', 'greatsword');
  const h = g.hero;
  const s = h.skills[1];
  const def = SKILLS.whirlwind;
  assert.equal(s.id, 'whirlwind');
  const rad = def.radius * s.r.size;
  const front = dummy(g, rad * 0.7, 0);
  const behind = dummy(g, -rad * 0.7, 0);
  const side = dummy(g, 0, rad * 0.8);
  const far = dummy(g, rad + 1.6, 0);
  // (held through its wind-up and for a second of spinning)
  const r = hold(g, def.windup + 1.0, 2, 0);
  assert.ok(r.began > 0, 'it began');
  near(r.began, def.windup, DT * 2, 'it begins when its short wind-up is over');
  assert.equal(r.bites.length, 4, `spun for a second, it cut ${r.bites.length} times (one every ${def.tick} s, the first as it began)`);
  near(r.bites[0], r.began, 1e-9, 'the first cut comes as it begins');
  for (let i = 1; i < r.bites.length; i++) near(r.bites[i] - r.bites[i - 1], def.tick!, DT + 1e-9, 'the cuts are evenly spaced');
  near(r.ended, def.windup + 1.0, DT * 2, 'it stops when the button is let go');
  for (const m of [front, behind, side]) assert.ok(hurt(m) > 0, 'everything round the hero is cut: in front, behind, beside');
  const hits = r.ev.filter((e) => e.t === 'hit' && !e.onHero).length;
  assert.equal(hits, 3 * 4, 'each of the three, at every cut');
  assert.equal(hurt(far), 0, 'and nothing beyond its reach');
  assert.equal(s.uses, 1, 'all of it is one use');
  assert.equal(h.channel, null);
});

test('a held attack runs its length and no longer, and then waits its whole wait', () => {
  for (const [cls, weapon] of [['warrior', 'greatsword'], ['mage', 'wand']] as const) {
    const g = room(cls, weapon);
    const h = g.hero;
    const s = h.skills[1];
    const def = SKILLS[s.id];
    dummy(g, 1.2, 0);
    const r = hold(g, 9, 2, 0, 0);
    const most = Math.floor((def.channel! - 1e-6) / def.tick!) + 1;
    // (the button stayed down the whole nine seconds: it began again when its wait was over)
    const first = r.bites.filter((t) => t < r.ended + 1e-9);
    assert.equal(first.length, most, `${def.name}: ${first.length} bites in its ${def.channel} s`);
    near(r.ended - r.began, def.channel!, DT * 2, `${def.name} ends by itself after its length`);
    const again = r.ev.filter((e) => e.t === 'channel').length;
    assert.equal(again, 2, `${def.name}: with the button still down it begins again, once its wait is over`);
    const second = r.bites.find((t) => t > r.ended + 1e-9)!;
    assert.ok(second - r.ended >= s.r.cooldown - 1e-6, `${def.name}: not before its wait of ${s.r.cooldown.toFixed(2)} s is over (it came after ${(second - r.ended).toFixed(2)})`);
    assert.ok(second - r.ended < s.r.cooldown + def.windup + 0.1);
    assert.equal(s.uses, 2);
  }
});

test('let go early and the wait is shorter by the part not used, but never less than a set part of it', () => {
  for (const [cls, weapon] of [['warrior', 'greatsword'], ['mage', 'wand']] as const) {
    const def = SKILLS[WEAPON_SKILLS[weapon][1]];
    const waitAfter = (seconds: number): { cd: number; full: number; bites: number } => {
      const g = room(cls, weapon);
      const s = g.hero.skills[1];
      dummy(g, 1.2, 0);
      // (to the very step it ends in: the wait has not begun to run down)
      const c = emptyControls();
      let bites = 0;
      let t = 0;
      for (let k = 0; k < 600; k++) {
        const down = t < seconds - 1e-9;
        c.cast = down;
        c.hold = down;
        c.castX = g.hero.x + 2;
        c.castY = g.hero.y;
        g.update(DT, c);
        t += DT;
        bites += g.events.filter(isBite).length;
        const over = g.events.some((e) => e.t === 'channelEnd');
        g.events.length = 0;
        if (over) return { cd: s.cd, full: s.r.cooldown, bites };
      }
      throw new Error('it never ended');
    };
    const whole = waitAfter(9);
    near(whole.cd, whole.full, 1e-6, `${def.name}, held to the end: the whole wait`);
    const half = waitAfter(def.windup + def.channel! / 2);
    near(half.cd / half.full, 0.5, 0.03, `${def.name}, held half its length: half the wait`);
    // one press, however short, is one attack: it bites once, and costs the least there is
    const tap = waitAfter(DT);
    assert.equal(tap.bites, 1, `${def.name}: a press let go at once still bites once`);
    near(tap.cd / tap.full, TUNE.channelMinCool, 0.02, `${def.name}, let go at once: ${TUNE.channelMinCool} of the wait`);
    assert.ok(TUNE.channelMinCool > 0.2 && TUNE.channelMinCool < 0.6);
  }
});

test('Whirlwind: the hero walks on while spinning, nearly as fast, and passes through enemies', () => {
  // a row of enemies across the way
  const blocked = room('warrior', 'greatsword');
  const row = (g: Game): Monster[] => [dummy(g, 1.6, -0.5), dummy(g, 1.6, 0), dummy(g, 1.6, 0.5)];
  row(blocked);
  const c = emptyControls();
  c.mx = 1;
  for (let k = 0; k < 90; k++) blocked.update(DT, c);
  assert.ok(blocked.hero.x < 14.5 + 1.6 - 0.2, 'walking, the hero is stopped by them');

  const g = room('warrior', 'greatsword');
  const h = g.hero;
  const wall = row(g);
  const x0 = h.x;
  const r = hold(g, 1.5, 2, 0, 0, (k) => { k.mx = 1; });
  assert.ok(r.bites.length >= 4);
  assert.ok(h.x > x0 + 1.6 + 0.6, `spinning, the hero goes through them (from ${x0} to ${h.x.toFixed(2)}; they stand at ${(x0 + 1.6).toFixed(2)})`);
  for (const m of wall) assert.ok(hurt(m) > 0, 'cutting them on the way');
  for (const m of wall) assert.ok(Math.abs(m.x - (x0 + 1.6)) < 0.05, 'and they stand where they stood: the hero went through them, not pushing them along');
  // and nearly as fast as a walk
  const free = room('warrior', 'greatsword');
  const f0 = free.hero.x;
  const spun = hold(free, 1.0, 2, 0, 0, (k) => { k.mx = 1; });
  const went = free.hero.x - f0;
  const sp = free.hero.d.moveSpeed;
  // (the first moment is the wind-up, when an attack slows the hero as it always has)
  assert.ok(went > sp * TUNE.whirlWalk * 0.75 && went < sp * 1.0, `in a second of it the hero went ${went.toFixed(2)} tiles (a walk is ${sp.toFixed(2)})`);
  assert.ok(spun.began > 0);
  assert.ok(TUNE.whirlWalk >= 0.8 && TUNE.whirlWalk <= 1);
});

test('Whirlwind: when it ends inside an enemy, the two are parted again', () => {
  const g = room('warrior', 'greatsword');
  const h = g.hero;
  const m = dummy(g, 0.9, 0);
  // spin into it and let go on top of it
  const apart = TUNE.heroRadius + m.r * 0.8;
  let nearest = 9;
  hold(g, 0.45, 2, 0, DT * 2, (k) => {
    k.mx = 1;
    if (h.channel) nearest = Math.min(nearest, Math.hypot(h.x - m.x, h.y - m.y));
  });
  assert.equal(h.channel, null);
  assert.ok(nearest < apart * 0.8, `spinning, the hero was inside the enemy (${nearest.toFixed(2)} tiles from its middle; they part at ${apart.toFixed(2)})`);
  const c = emptyControls();
  for (let k = 0; k < 30; k++) g.update(DT, c);
  assert.ok(Math.hypot(h.x - m.x, h.y - m.y) >= apart - 0.02, 'they do not stand in one another');
});

test('Whirlwind: the hero turns round and round as it goes', () => {
  const g = room('warrior', 'greatsword');
  const h = g.hero;
  let turned = 0;
  let last = Math.atan2(h.fy, h.fx);
  const r = hold(g, 1.2, 2, 0, 0, () => {
    const a = Math.atan2(h.fy, h.fx);
    let d = a - last;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    if (h.channel) turned += d;
    last = a;
  });
  const spun = (r.ended < 0 ? 1.2 : r.ended) - r.began;
  near(turned / (Math.PI * 2), TUNE.whirlSpin * spun, 0.15, 'turns made');
  assert.ok(TUNE.whirlSpin >= 1 && TUNE.whirlSpin <= 2.5);
});

test('Beam: it burns toward where it is pointed, through everything in its way, and can be swept about', () => {
  const g = room('mage', 'wand');
  const h = g.hero;
  const s = h.skills[1];
  const def = SKILLS.beam;
  assert.equal(s.id, 'beam');
  const a = dummy(g, 3, 0);
  const b = dummy(g, 6, 0.2);
  const side = dummy(g, 4, 1.8);
  const up = dummy(g, 0, 4);
  // half a second along +x
  const r = hold(g, def.windup + 0.5, 3, 0, 0);
  assert.ok(r.bites.length >= 3, `it bit ${r.bites.length} times`);
  assert.ok(hurt(a) > 0 && hurt(b) > 0, 'everything along it is hurt: the first does not shield the second');
  assert.equal(hurt(side) + hurt(up), 0, 'and nothing off it');
  const bite = r.ev.find((e) => e.t === 'beamBite') as Extract<GameEvent, { t: 'beamBite' }>;
  const end = g.beamEnd(bite.x0, bite.y0, 1, 0, def.range);
  near(bite.x1, end.x, 1e-6, 'it runs to the first wall, or its range');
  assert.ok(end.len <= def.range + 1e-6 && end.len > 3);
  // swept: the finger goes round to +y while the button stays down
  const g2 = room('mage', 'wand');
  const a2 = dummy(g2, 3, 0);
  const up2 = dummy(g2, 0, 4);
  let wasA = 0;
  const r2 = hold(g2, def.windup + 1.4, 3, 0, 0, (c, t) => {
    if (t > 0.7) {
      if (wasA === 0) wasA = hurt(a2);
      c.castX = g2.hero.x;
      c.castY = g2.hero.y + 4;
    }
  });
  assert.ok(wasA > 0 && hurt(up2) > 0, 'first one, then the other');
  assert.equal(hurt(a2), wasA, 'once the beam has left it, the first is hurt no more');
  assert.equal(r2.ev.filter((e) => e.t === 'channel').length, 1, 'and it is all one beam');
  assert.ok(Math.abs(g2.hero.fx) < 0.05 && g2.hero.fy > 0.99, 'the hero has turned with it');
});

test('Beam: the hero may walk while it burns, at a walk', () => {
  const g = room('mage', 'wand');
  const h = g.hero;
  const x0 = h.x;
  const def = SKILLS.beam;
  // (pointed up the room, walking across it: the facing stays on the beam)
  const r = hold(g, def.windup + 1, 0, 4, 0, (c) => { c.mx = 1; });
  const went = h.x - x0;
  const sp = h.d.moveSpeed;
  assert.ok(r.began > 0);
  assert.ok(went > sp * TUNE.beamWalk * 0.8 && went < sp * TUNE.beamWalk * 1.25 + 0.3, `in a second of it the hero went ${went.toFixed(2)} tiles (a walk is ${sp.toFixed(2)})`);
  assert.ok(TUNE.beamWalk >= 0.3 && TUNE.beamWalk <= 0.7);
});

test('with mana as the limit a held attack takes mana as it goes, runs until the mana is gone, and needs only a bite\'s worth to begin', () => {
  for (const [cls, weapon] of [['mage', 'wand'], ['warrior', 'greatsword']] as const) {
    const g = room(cls, weapon);
    g.setLimit('mana');
    const h = g.hero;
    const s = h.skills[1];
    const def = SKILLS[s.id];
    assert.ok(s.r.mana > 0, `${def.name}: a whole length of it costs ${s.r.mana} mana`);
    assert.equal(s.r.cooldown, MANA_MODE.recover);
    dummy(g, 1.2, 0);
    // (the practice room gives mana back fast, and so does the hero's own gear: here nothing comes
    // back, so that what is taken can be counted)
    still(g);
    h.mana = h.d.maxMana;
    const had = h.mana;
    const r = hold(g, def.windup + 1, 2, 0, 0.2);
    const spent = had - h.mana;
    const rate = s.r.mana / def.channel!;
    assert.ok(spent > rate * 0.9 && spent < rate * 1.1, `${def.name}: a second of it took ${spent.toFixed(1)} mana (${rate.toFixed(1)} a second)`);
    assert.ok(r.ended > 0);
    // held on and on, it stops only when the mana is gone, well past the length it has with cooldowns
    const g2 = room(cls, weapon);
    g2.setLimit('mana');
    still(g2);
    const h2 = g2.hero;
    h2.mana = h2.d.maxMana;
    const long = hold(g2, 60, 2, 0, 0);
    const ends = long.ev.filter((e) => e.t === 'channelEnd').length;
    assert.ok(ends >= 1, 'it ends');
    assert.ok(long.ended - long.began > def.channel! * 1.5, `${def.name}: it ran ${(long.ended - long.began).toFixed(1)} s on a full pool, not the ${def.channel} s it has with cooldowns`);
    // with less than a bite's worth: it does not begin, and the game says why
    const g3 = room(cls, weapon);
    g3.setLimit('mana');
    still(g3);
    const s3 = g3.hero.skills[1];
    const biteCost = (s3.r.mana * def.tick!) / def.channel!;
    g3.hero.mana = biteCost * 0.5;
    const none = hold(g3, 0.1, 2, 0, 0.3);
    assert.equal(none.began, -1, `${def.name}: not begun with half a bite's worth of mana`);
    assert.ok(none.ev.some((e) => e.t === 'text' && e.text === 'No mana'));
    assert.equal(s3.uses, 0);
    // with a bite's worth and a little: it begins
    const g4 = room(cls, weapon);
    g4.setLimit('mana');
    still(g4);
    g4.hero.mana = biteCost * 3;
    const some = hold(g4, 0.4, 2, 0, 0.3);
    assert.ok(some.began > 0 && some.bites.length >= 1, `${def.name}: begun with three bites' worth`);
  }
});

test('a held attack is broken off by the evasive move and by a change of weapon, and its wait begins', () => {
  // the evasive move
  const g = room('warrior', 'greatsword');
  const h = g.hero;
  const s = h.skills[1];
  dummy(g, 1.2, 0);
  const c1 = emptyControls();
  let t1 = 0;
  let ended = -1;
  let bitesAfter = 0;
  for (let k = 0; k < 80; k++) {
    // held throughout; the leap is asked for at 0.8 s
    c1.cast = true;
    c1.hold = true;
    c1.castX = h.x + 2;
    c1.castY = h.y;
    c1.evade = ended < 0 && t1 >= 0.8;
    c1.evadeX = h.x - 3;
    c1.evadeY = h.y;
    g.update(DT, c1);
    t1 += DT;
    if (ended >= 0) bitesAfter += g.events.filter(isBite).length;
    if (ended < 0 && g.events.some((e) => e.t === 'channelEnd')) {
      ended = t1;
      // (in the very step it ends: its wait has just begun)
      assert.equal(s.charges, 0, 'it is spent');
      assert.ok(s.cd > 0 && s.cd < s.r.cooldown, 'and waits, for less than its whole wait: it was cut short');
      assert.equal(h.skills[2].uses, 1, 'the leap was made');
      assert.ok(h.move, 'and the hero is in the air');
    }
    g.events.length = 0;
  }
  near(ended, 0.8, DT * 3, 'it ends as the hero leaps');
  assert.equal(bitesAfter, 0, 'nothing more is cut in the air, though the button is still down');
  // a change of weapon
  const g2 = room('mage', 'wand');
  const h2 = g2.hero;
  dummy(g2, 3, 0);
  const c = emptyControls();
  c.cast = true;
  c.hold = true;
  c.castX = h2.x + 3;
  c.castY = h2.y;
  for (let k = 0; k < 40; k++) g2.update(DT, c);
  assert.ok(h2.channel, 'a beam is burning');
  wear(g2, 'staff');
  assert.equal(h2.channel, null, 'it went with the wand');
  assert.equal(h2.skills[1].id, 'orb');
  assert.equal(h2.skills[1].charges, 0, 'and the staff\'s slow attack takes over its wait: changing weapon is no way round it');
  g2.events.length = 0;
  for (let k = 0; k < 90; k++) g2.update(DT, emptyControls());
  assert.ok(!g2.events.some((e) => e.t === 'beamBite' || e.t === 'beam'), 'nothing more comes of it, not even an echo');
});

test('while one is held nothing else is begun; and the hero stays in the pose of the blow', () => {
  const g = room('warrior', 'greatsword');
  const h = g.hero;
  dummy(g, 1.2, 0);
  let poses = 0;
  const r = hold(g, 1.2, 2, 0, 0.8, (c, t) => {
    // the quick attack is asked for all the while
    c.fire = true;
    c.aimX = h.x + 1;
    c.aimY = h.y;
    if (h.channel && t > 0.3) {
      assert.equal(h.anim, 'attack');
      assert.equal(h.attackSkill, 1);
      near(h.attackAge - h.attackWind, 0.05, 0.02, 'held just past the moment of the blow');
      poses++;
    }
  });
  assert.ok(poses > 30);
  const swings = r.ev.map((e, i) => (e.t === 'swing' ? i : -1)).filter((i) => i >= 0);
  const end = r.ev.findIndex((e) => e.t === 'channelEnd');
  assert.ok(swings.length > 0, 'the quick attack is made once the whirlwind is over');
  assert.ok(swings.every((i) => i > end), 'and not before');
  assert.equal(h.skills[0].uses, swings.length);
  // which animation: the swing, whoever spins; the mage's beam is the thrust
  assert.equal(attackClip('warrior', 1, 'whirl'), 0);
  assert.equal(attackClip('mage', 1, 'whirl'), 0);
  assert.equal(attackClip('mage', 1, 'beam'), 0);
  assert.equal(attackClip('warrior', 1, 'beam'), 1);
});

test('words on a held attack: Twin, what the words behind it leave, and of Echoes', () => {
  // Twin Whirlwind: every turn cuts twice, each cut weaker
  const g = room('warrior', 'greatsword');
  assert.equal(g.socket(1, 'front', 'twin'), null);
  const m = dummy(g, 1.2, 0);
  const r = hold(g, 0.7, 2, 0, 0.5);
  const firsts = r.ev.filter((e) => e.t === 'burst' && e.style === 'whirl' && (e.n ?? 0) === 0).length;
  const seconds = r.ev.filter((e) => e.t === 'burst' && e.style === 'whirl' && e.n === 1).length;
  assert.ok(firsts >= 2 && seconds === firsts, `every turn cuts twice (${firsts} turns, ${seconds} second cuts)`);
  assert.equal(r.ev.filter((e) => e.t === 'hit' && !e.onHero).length, firsts * 2);
  assert.ok(g.hero.skills[1].r.countDmg <= 0.8 && hurt(m) > 0);

  // of Ruin: a rune as it begins and again every so often as it goes on, each where the hero then is
  const g2 = room('warrior', 'greatsword');
  assert.equal(g2.socket(1, 'behind', 'volatile'), null);
  const r2 = hold(g2, 9, 2, 0, 0);
  const until = r2.ended;
  const def = SKILLS.whirlwind;
  const want = Math.floor((def.channel! - 1e-6) / TUNE.channelWake) + 1;
  const runes = r2.ev.filter((e) => e.t === 'zone' && e.kind === 'rune').length;
  // (only the first whirlwind of the nine seconds is counted: it began again when its wait was over)
  const firstRunes = r2.ev.slice(0, r2.ev.findIndex((e) => e.t === 'channelEnd')).filter((e) => e.t === 'zone' && e.kind === 'rune').length;
  assert.equal(firstRunes, want, `${firstRunes} runes in a whole whirlwind: as it begins and every ${TUNE.channelWake} s`);
  assert.ok(runes >= firstRunes && until > 0);

  // Beam of Flame: burning ground along the line as it begins, and not at every bite
  const g3 = room('mage', 'wand');
  assert.equal(g3.socket(1, 'behind', 'fire'), null);
  dummy(g3, 3, 0);
  const r3 = hold(g3, SKILLS.beam.windup + 0.5, 3, 0, 0);
  const patches = r3.ev.filter((e) => e.t === 'zone' && e.kind === 'burn').length;
  assert.ok(patches >= 2 && patches <= TUNE.beamPatches, `${patches} patches for ${r3.bites.length} bites`);

  // Twin Beam: two side by side, and one enemy takes only one of them at a bite
  const g4 = room('mage', 'wand');
  assert.equal(g4.socket(1, 'front', 'twin'), null);
  dummy(g4, 3, 0);
  const r4 = hold(g4, SKILLS.beam.windup + 0.3, 3, 0, 0);
  const pairs = r4.ev.filter((e) => e.t === 'beamBite');
  assert.ok(pairs.some((e) => e.t === 'beamBite' && e.n === 0) && pairs.some((e) => e.t === 'beamBite' && e.n === 1), 'two beams');
  assert.equal(r4.ev.filter((e) => e.t === 'hit' && !e.onHero).length, r4.bites.length, 'one hurt a bite, not two');

  // of Echoes: when it is over a phantom carries it on for a moment, weaker, and only once
  for (const [cls, weapon] of [['warrior', 'greatsword'], ['mage', 'wand']] as const) {
    const e = room(cls, weapon);
    assert.equal(e.socket(1, 'behind', 'twin'), null);
    const target = dummy(e, 1.3, 0);
    const re = hold(e, 0.6, 2, 0, 2.5);
    const ended = re.ev.findIndex((x) => x.t === 'channelEnd');
    const after = re.ev.slice(ended);
    assert.equal(after.filter((x) => x.t === 'echo').length, 1, `${weapon}: the echo is announced as it ends`);
    assert.equal(re.ev.filter((x) => x.t === 'cast' && x.echo).length, 1, 'and comes once');
    const phantom = after.filter((x) => (x.t === 'burst' && x.style === 'whirl' && x.echo === true) || (x.t === 'beam' && x.echo === true)).length;
    assert.ok(phantom >= 2 && phantom <= 4, `${weapon}: the phantom bites a few times (${phantom})`);
    const before = re.ev.slice(0, ended).filter((x) => x.t === 'hit' && !x.onHero) as Extract<GameEvent, { t: 'hit' }>[];
    const echoed = after.filter((x) => x.t === 'hit' && !x.onHero) as Extract<GameEvent, { t: 'hit' }>[];
    assert.ok(echoed.length >= 2, 'its bites hurt');
    const avg = (l: Extract<GameEvent, { t: 'hit' }>[]): number => l.reduce((n, x) => n + x.amount, 0) / l.length;
    assert.ok(avg(echoed) < avg(before), 'for less than the attack\'s own');
    assert.ok(hurt(target) > 0);
    assert.equal(e.hero.skills[1].uses, 1, 'and it is not another use');
  }
});

test('a held attack does not outlive the level it was begun in', () => {
  // (Whirlwind, the slow attack: THE FIRST LEVELS open it at level 2)
  const g = seasoned(new Game('warrior', 5));
  g.enterDungeon();
  const h = g.hero;
  const c = emptyControls();
  c.cast = true;
  c.hold = true;
  c.castX = h.x + 2;
  c.castY = h.y;
  for (let k = 0; k < 30; k++) g.update(DT, c);
  assert.ok(h.channel, 'a whirlwind is going');
  g.enterTown();
  assert.equal(h.channel, null);
  g.events.length = 0;
  for (let k = 0; k < 30; k++) g.update(DT, emptyControls());
  assert.ok(!g.events.some((e) => e.t === 'burst'), 'and nothing is cut in town');
});

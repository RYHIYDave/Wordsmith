// Attacking the way the hero faces, and locking on (the controls the owner asked to try).
//
// His words (4 Oct 2026): "I'd like to try attacking the direction the character is facing, not
// where you tap ... Let's also try to lock onto enemies so you can run backwards and attack. Out
// of combat, still attack in the direction you're facing."
//
// What is checked here is everything that can be checked without a screen: which enemy the lock
// is on (src/game/lock.ts), where an attack goes when nothing is locked, and the one new thing the
// rules were taught: to keep the hero turned toward a point while they walk (Controls.face).
// The thumbs themselves are in the browser playtests.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import type { RNG } from '../src/engine/rng';
import { Game, cleanMeta, newMeta } from '../src/game/game';
import { LOCK, LockOn, aimAhead, autoTargets } from '../src/game/lock';
import { AIM_MODES, emptyControls } from '../src/game/state';
import type { GameEvent, Monster } from '../src/game/state';
import { land } from './helpers';

const DT = 1 / 60;

type Inner = {
  rng: RNG;
  waveT: number;
  spawn: (k: string, x: number, y: number, pack: number, rank: number, boss: boolean, rng: RNG) => Monster;
  wakeUp: (m: Monster) => void;
};
const inner = (g: Game): Inner => g as unknown as Inner;

/** A practice room with nothing in it: the hero in the middle, facing +x. */
function room(cls: 'warrior' | 'ranger' | 'mage' = 'ranger'): Game {
  const g = Game.forPractice(cls, 3);
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
 * The same room with the hero in a corner of it, facing the far corner: the room is 18 tiles
 * square, and the distances at which a lock is taken and let go are longer than half of that.
 * `along(d)` is the point d tiles from the hero along that line, as an offset.
 */
function corner(cls: 'warrior' | 'ranger' | 'mage' = 'ranger'): Game {
  const g = room(cls);
  g.hero.x = 7.5;
  g.hero.y = 7.5;
  g.hero.fx = Math.SQRT1_2;
  g.hero.fy = Math.SQRT1_2;
  return g;
}
const along = (d: number): [number, number] => [d * Math.SQRT1_2, d * Math.SQRT1_2];

/** A monster that stands where it is put and never strikes. Awake unless `asleep`. */
function put(g: Game, dx: number, dy: number, asleep = false): Monster {
  const a = inner(g);
  const m = a.spawn('skeleton', g.hero.x + dx, g.hero.y + dy, 1, 0, false, a.rng);
  if (!asleep) a.wakeUp(m);
  m.speed = 0;
  m.cd = 1e9;
  m.life = m.maxLife = 1e7;
  // (what the game works out each frame: it is on a tile the hero can see)
  m.seen = true;
  return m;
}

test('nothing to lock onto: no lock, and an attack goes straight ahead', () => {
  const g = room();
  const lock = new LockOn();
  assert.equal(lock.update(g, DT), null);
  assert.equal(lock.id, null);
  const a = aimAhead(g, 4);
  assert.equal(a.m, null);
  assert.ok(Math.abs(a.x - (g.hero.x + 4)) < 1e-9 && Math.abs(a.y - g.hero.y) < 1e-9, 'four tiles straight ahead of a hero facing +x');
});

test('in a fight the hero locks onto the nearest enemy that is awake and in sight', () => {
  const g = room();
  const far = put(g, 0, 7);
  const near = put(g, -3, 0);
  const lock = new LockOn();
  // (the near one is BEHIND the hero: the lock does not care which way the hero happens to face)
  assert.equal(lock.update(g, DT), near);
  assert.equal(lock.id, near.id);
  assert.notEqual(lock.id, far.id);
});

test('an enemy too far off is not locked onto; one asleep is not either', () => {
  const g = corner();
  const lock = new LockOn();
  const m = put(g, ...along(LOCK.take + 0.5));
  assert.ok(g.sees(g.hero.x, g.hero.y, m.x, m.y), 'in plain sight');
  assert.equal(lock.update(g, DT), null, `nothing is locked onto from more than ${LOCK.take} tiles`);
  [m.x, m.y] = [g.hero.x + along(LOCK.take - 0.5)[0], g.hero.y + along(LOCK.take - 0.5)[1]];
  assert.equal(lock.update(g, DT), m);

  const g2 = room();
  const lock2 = new LockOn();
  put(g2, 3, 0, true);
  assert.equal(lock2.update(g2, DT), null, 'a monster that has not woken is not a fight');
});

test('an enemy that cannot be seen is not locked onto', () => {
  const g = room();
  const lock = new LockOn();
  const m = put(g, 4, 0);
  m.seen = false;
  assert.equal(lock.update(g, DT), null);
  m.seen = true;
  assert.equal(lock.update(g, DT), m);
});

test('the lock is sticky: it moves to another enemy only when that one is clearly nearer', () => {
  const g = room();
  const lock = new LockOn();
  const a = put(g, 5, 0);
  assert.equal(lock.update(g, DT), a);
  // another arrives a little nearer: not enough to change over
  const b = put(g, 0, 5 - LOCK.switchBy + 0.3);
  assert.equal(lock.update(g, DT), a, 'a little nearer is not enough');
  // it comes closer still
  b.y = g.hero.y + 5 - LOCK.switchBy - 0.3;
  assert.equal(lock.update(g, DT), b, `more than ${LOCK.switchBy} tiles nearer is`);
  // and the first does not win it back by being a little nearer in its turn
  a.x = g.hero.x + 5 - LOCK.switchBy - 0.6;
  assert.equal(lock.update(g, DT), b);
});

test('when the enemy locked onto dies, the lock goes to the next nearest; with none left, it lets go', () => {
  const g = room();
  const lock = new LockOn();
  const a = put(g, 2, 0);
  const b = put(g, 0, 6);
  assert.equal(lock.update(g, DT), a);
  a.dead = true;
  assert.equal(lock.update(g, DT), b);
  b.dead = true;
  assert.equal(lock.update(g, DT), null);
  assert.equal(lock.id, null);
});

test('the lock lets go of an enemy that has gone too far, or has been out of sight for a moment', () => {
  const g = corner();
  const lock = new LockOn();
  const m = put(g, ...along(6));
  const at = (d: number): void => {
    m.x = g.hero.x + along(d)[0];
    m.y = g.hero.y + along(d)[1];
  };
  assert.equal(lock.update(g, DT), m);
  // it wanders off, still in sight: kept, out to the keeping distance, for as long as it stays there
  at(LOCK.keep - 0.5);
  assert.ok(g.sees(g.hero.x, g.hero.y, m.x, m.y), 'in plain sight');
  for (let i = 0; i < 120; i++) assert.equal(lock.update(g, DT), m, `kept out to ${LOCK.keep} tiles`);
  at(LOCK.keep + 0.5);
  assert.equal(lock.update(g, DT), null);

  // behind a pillar: kept for a moment (it will be out again), then let go
  at(6);
  assert.equal(lock.update(g, DT), m);
  m.seen = false;
  let t = 0;
  while (t < LOCK.lostFor - 0.1) {
    assert.equal(lock.id, m.id, `still locked ${t.toFixed(2)} s after it went out of sight`);
    lock.update(g, DT);
    t += DT;
  }
  for (let i = 0; i < 20; i++) lock.update(g, DT);
  assert.equal(lock.id, null, `let go after ${LOCK.lostFor} s out of sight`);
  // it steps out again: locked onto afresh
  m.seen = true;
  assert.equal(lock.update(g, DT), m);
});

// (Picking a monster out by touching it is built and switched off: LOCK.touchPicks. The owner asked
// for attacks that do not depend on where the thumb lands. This keeps it in working order for the
// day he wants the archer at the back.)
test('picking one out (off for now): a pinned monster is the one, asleep or not, until it is dead or gone', () => {
  const g = room();
  const lock = new LockOn();
  const near = put(g, 2, 0);
  const back = put(g, 8, 1, true);
  assert.equal(lock.update(g, DT), near);
  lock.pin(back);
  assert.equal(lock.update(g, DT), back, 'the one touched, though it is farther and asleep');
  assert.ok(lock.pinned);
  // a nearer one does not take it away
  near.x = g.hero.x + 0.8;
  for (let i = 0; i < 30; i++) assert.equal(lock.update(g, DT), back);
  // dead: the lock is the game's again
  back.dead = true;
  assert.equal(lock.update(g, DT), near);
  assert.equal(lock.pinned, false);
});

test('clear: a new character, a new level', () => {
  const g = room();
  const lock = new LockOn();
  const m = put(g, 2, 0, true);
  lock.pin(m);
  lock.update(g, DT);
  lock.clear();
  assert.equal(lock.id, null);
  assert.equal(lock.pinned, false);
  assert.equal(lock.update(g, DT), null, 'the sleeper is not taken up again by itself');
});

test('out of a fight, an attack goes the way the hero faces: at a monster that stands roughly that way, else straight ahead', () => {
  const g = room();
  // 20 degrees off the way the hero faces: near enough
  const a20 = (20 * Math.PI) / 180;
  const m = put(g, Math.cos(a20) * 6, Math.sin(a20) * 6, true);
  let a = aimAhead(g, 4);
  assert.equal(a.m, m);
  assert.ok(a.x === m.x && a.y === m.y);
  // 50 degrees off: not "the way the hero faces"
  const a50 = (50 * Math.PI) / 180;
  m.x = g.hero.x + Math.cos(a50) * 6;
  m.y = g.hero.y + Math.sin(a50) * 6;
  a = aimAhead(g, 4);
  assert.equal(a.m, null);
  assert.ok(Math.abs(a.x - (g.hero.x + 4)) < 1e-9 && Math.abs(a.y - g.hero.y) < 1e-9);
  // behind the hero: no
  m.x = g.hero.x - 3;
  m.y = g.hero.y;
  assert.equal(aimAhead(g, 4).m, null);
  // the hero turns round: yes
  g.hero.fx = -1;
  assert.equal(aimAhead(g, 4).m, m);
});

test('of two monsters ahead the nearer is aimed at; one out of sight, or too far, is not', () => {
  const g = corner();
  const far = put(g, ...along(8));
  const near = put(g, ...along(4));
  far.state = near.state = 'sleep';
  assert.equal(aimAhead(g, 4).m, near);
  near.seen = false;
  assert.equal(aimAhead(g, 4).m, far);
  [far.x, far.y] = [g.hero.x + along(LOCK.ahead + 0.5)[0], g.hero.y + along(LOCK.ahead + 0.5)[1]];
  assert.ok(g.sees(g.hero.x, g.hero.y, far.x, far.y), 'in plain sight');
  assert.equal(aimAhead(g, 4).m, null, `nothing is aimed at from more than ${LOCK.ahead} tiles`);
});

test('the rules: asked to stay turned toward a point, the hero walks away from it without turning round', () => {
  const g = room('warrior');
  const h = g.hero;
  const c = emptyControls();
  // walking toward -x, with nothing said about facing: the hero faces the way they walk
  c.mx = -1;
  c.my = 0;
  for (let i = 0; i < 20; i++) g.update(DT, c);
  assert.ok(h.fx < -0.99, 'left to themselves, the hero faces the way they walk');
  const x0 = h.x;
  // the same walk, turned toward an enemy at +x: backing away
  c.face = true;
  c.aimX = h.x + 6;
  c.aimY = h.y;
  for (let i = 0; i < 20; i++) {
    c.aimX = x0 + 6;
    g.update(DT, c);
  }
  assert.ok(h.x < x0 - 0.5, 'the hero has gone on walking away');
  assert.ok(h.fx > 0.99 && Math.abs(h.fy) < 0.05, `and is turned toward the enemy: facing (${h.fx.toFixed(2)}, ${h.fy.toFixed(2)})`);
  assert.equal(h.anim, 'walk');
  // standing still, the hero turns as the enemy moves round them
  c.mx = 0;
  c.aimX = h.x;
  c.aimY = h.y + 5;
  g.update(DT, c);
  assert.ok(h.fy > 0.99, 'standing, the hero turns to follow it');
});

test('the rules: an arrow loosed while locked on goes where the enemy has got to, not where it was when the bow was drawn', () => {
  const g = room('ranger');
  const h = g.hero;
  const m = put(g, 6, 0);
  const c = emptyControls();
  c.face = true;
  c.fire = true;
  c.aimX = m.x;
  c.aimY = m.y;
  g.update(DT, c);
  assert.ok(h.windup !== null, 'the bow is being drawn');
  // the enemy runs round to the side while the bow is drawn; the lock follows it
  m.x = h.x;
  m.y = h.y + 6;
  c.fire = false;
  c.aimX = m.x;
  c.aimY = m.y;
  land(g, c, DT);
  const shot = g.projectiles.find((p) => !p.hostile);
  if (!shot) throw new Error('no arrow is in the air');
  assert.ok(shot.vy > 0 && Math.abs(shot.vx) < Math.abs(shot.vy) * 0.2, `it flies toward where the enemy is now: (${shot.vx.toFixed(1)}, ${shot.vy.toFixed(1)})`);
});

test('the rules: backing away from the enemy locked onto, the warrior still strikes it', () => {
  const g = room('warrior');
  const h = g.hero;
  const m = put(g, 1.2, 0);
  const life = m.life;
  const c = emptyControls();
  c.mx = -1; // walking away
  c.face = true;
  c.fire = true;
  c.aimX = m.x;
  c.aimY = m.y;
  const seen: GameEvent[] = [];
  g.update(DT, c);
  c.fire = false;
  land(g, c, DT, () => seen.push(...g.events.splice(0)));
  assert.ok(m.life < life, 'the blow landed on the enemy the hero was backing away from');
  assert.ok(h.fx > 0.9, 'the hero never turned their back on it');
});

test('where the thumb lands does not pick the enemy: that is switched off until the owner asks for it', () => {
  assert.equal(LOCK.touchPicks, false);
});

test('on a phone the game starts out with auto aim; a choice made with the switch is kept with the device', () => {
  // The owner, 4 Oct 2026, 22:26: "When playing on mobile, let's put auto-aim as the default setting."
  assert.deepEqual([newMeta().aim, newMeta().aimChosen], ['auto', false]);
  assert.deepEqual([cleanMeta({}).aim, cleanMeta({}).aimChosen], ['auto', false]);
  assert.equal(cleanMeta(null).aim, 'auto');
  assert.equal(cleanMeta({ aim: 'sideways' as unknown as 'tap' }).aim, 'auto');
  // 'face' and 'auto' were never the default: a device that holds one of them chose it
  assert.deepEqual([cleanMeta({ aim: 'face' }).aim, cleanMeta({ aim: 'face' }).aimChosen], ['face', true]);
  assert.deepEqual([cleanMeta({ aim: 'auto' }).aim, cleanMeta({ aim: 'auto' }).aimChosen], ['auto', true]);
  // 'tap' was the default until Version 12.2.1, and every device that saved holds it, chosen or
  // not: without the mark of a choice it is taken as never chosen ...
  assert.deepEqual([cleanMeta({ aim: 'tap' }).aim, cleanMeta({ aim: 'tap' }).aimChosen], ['auto', false]);
  // ... and with the mark (the switch was used, on this version or a later one) it is kept
  assert.deepEqual([cleanMeta({ aim: 'tap', aimChosen: true }).aim, cleanMeta({ aim: 'tap', aimChosen: true }).aimChosen], ['tap', true]);
  // (a mark with nothing readable beside it is no choice)
  assert.deepEqual([cleanMeta({ aimChosen: true }).aim, cleanMeta({ aimChosen: true }).aimChosen], ['auto', false]);
  // what is cleaned and saved again comes back the same
  for (const aim of AIM_MODES) {
    const kept = cleanMeta(JSON.parse(JSON.stringify(cleanMeta({ aim, aimChosen: true }))));
    assert.deepEqual([kept.aim, kept.aimChosen], [aim, true]);
  }
  // (a default that was saved is still a default: the mark says so)
  const fresh = cleanMeta(JSON.parse(JSON.stringify(newMeta())));
  assert.deepEqual([fresh.aim, fresh.aimChosen], ['auto', false]);
  assert.deepEqual([cleanMeta({ aim: 'face', aimChosen: false }).aim, cleanMeta({ aim: 'face', aimChosen: false }).aimChosen], ['auto', false]);
  // the switch goes round all three, beginning with the way the game starts out
  assert.deepEqual([...AIM_MODES], ['auto', 'tap', 'face']);
});

// ---------------------------------------------------------------------------------------------
// AUTO AIM (Version 12.1.1). The owner, 4 Oct 2026, 21:10: "Can you add a third option to the
// attacks: option which will auto aim everything. So any ability that goes where you tap or hold
// will auto target an enemy". What is checked here is which enemy is picked (lock.ts: autoTargets);
// the thumbs are in the browser playtest (tools/scenarios/autoaim.mjs).

/** The weapon of that kind out of the practice room's bag and into the hero's hand. */
function wear(g: Game, weapon: 'sword' | 'greatsword' | 'bow' | 'staff' | 'wand'): void {
  if (g.weapon() === weapon) return;
  const i = g.hero.bag.findIndex((it) => it !== null && it.weapon === weapon);
  assert.ok(i >= 0, `a ${weapon} is in the bag`);
  assert.equal(g.equipFromBag(i), null);
}

test('auto aim: with nothing near there is nothing to aim at', () => {
  const g = room('ranger');
  const lock = new LockOn();
  const a = autoTargets(g, lock.update(g, DT), null);
  assert.equal(a.quick, null);
  assert.equal(a.slow, null);
});

test('auto aim: a shot, a wave, an orb, a familiar and a beam all go for the nearest enemy that is awake and in sight', () => {
  for (const [cls, weapon] of [['ranger', 'bow'], ['mage', 'staff'], ['mage', 'wand'], ['warrior', 'wand']] as const) {
    const g = corner(cls);
    wear(g, weapon);
    const far = put(g, ...along(7));
    const near = put(g, ...along(4));
    put(g, ...along(2), true); // (a sleeper, nearer than either: a fight not yet begun is not started for the player)
    const lock = new LockOn();
    const a = autoTargets(g, lock.update(g, DT), null);
    assert.equal(a.quick, near, `${cls} with a ${weapon}: the quick attack goes for the nearest one awake`);
    assert.equal(a.slow, near, `${cls} with a ${weapon}: and so does the slow one`);
    // when it falls, the next
    near.dead = true;
    const b = autoTargets(g, lock.update(g, DT), null);
    assert.equal(b.quick, far, 'when that one is dead, the next nearest');
    assert.equal(b.slow, far);
  }
});

test('auto aim: the pick is steady: it moves on only when another enemy is clearly nearer', () => {
  const g = corner('ranger');
  const a = put(g, ...along(5));
  const b = put(g, ...along(5.6));
  const lock = new LockOn();
  assert.equal(autoTargets(g, lock.update(g, DT), null).quick, a);
  // b steps a little nearer than a: not enough to change
  [b.x, b.y] = [g.hero.x + along(4.5)[0], g.hero.y + along(4.5)[1] + 0.6];
  assert.equal(autoTargets(g, lock.update(g, DT), null).quick, a, 'half a tile nearer does not take the aim away');
  // and then much nearer
  [b.x, b.y] = [g.hero.x + along(2)[0], g.hero.y + along(2)[1]];
  assert.equal(autoTargets(g, lock.update(g, DT), null).quick, b, 'three tiles nearer does');
});

test('auto aim: a sword goes first for an enemy it can reach, and for the one it is already fighting before any other', () => {
  const g = corner('warrior');
  wear(g, 'sword');
  const far = put(g, ...along(6));
  const lock = new LockOn();
  assert.equal(autoTargets(g, lock.update(g, DT), null).quick, far, 'nothing in reach: the nearest enemy (the hero walks to it)');
  // two within reach of the blade
  const left = put(g, 1.0, 0.2);
  const right = put(g, 0.2, 1.1);
  const a = autoTargets(g, lock.update(g, DT), null);
  assert.ok(a.quick === left || a.quick === right, 'one within reach comes before one six tiles off');
  assert.equal(autoTargets(g, lock.update(g, DT), right.id).quick, right, 'the one being fought already is kept to');
  assert.equal(autoTargets(g, lock.update(g, DT), left.id).quick, left);
  // the slam lands on one it would catch
  assert.ok(a.slow === left || a.slow === right, 'the slam goes for one it would catch');
});

test('auto aim: an enemy behind a wall or a pillar is not aimed at', () => {
  const g = corner('ranger');
  const m = put(g, ...along(5));
  m.seen = false;
  const lock = new LockOn();
  assert.equal(autoTargets(g, lock.update(g, DT), null).quick, null, 'one that cannot be seen is not picked');
});

// ---------------------------------------------------------------------------------------------
// The sword finds its enemy as the orb does (the default controls). The owner, an hour after asking
// for the experiment above, having played the mage: "Just give the same targeting that the mage
// has to the melee attacks as well. The ranged combat feels really good even in the current
// controls."

test('a blow struck beside the hero goes for someone within its reach: the nearest, one awake before one asleep', () => {
  const g = room('warrior');
  assert.equal(g.nearAssist(1.5), null, 'nobody about: nobody');
  const far = put(g, 4, 0);
  assert.equal(g.nearAssist(1.5), null, 'nobody within reach: nobody (the aim help that points takes over)');
  const near = put(g, 0, 1.4);
  const nearer = put(g, -1.0, 0);
  assert.equal(g.nearAssist(1.5), nearer, 'the nearest of those in reach, wherever it stands');
  assert.notEqual(g.nearAssist(1.5), far);
  // a sleeper at the hero's elbow does not come before an enemy that is fighting
  const sleeper = put(g, 0.6, 0, true);
  assert.equal(g.nearAssist(1.5), nearer, 'one that is awake before one that is not');
  nearer.dead = true;
  near.dead = true;
  assert.equal(g.nearAssist(1.5), sleeper, 'a sleeper within reach, when no one else is');
  // reach is measured to the monster's edge: a big one is in reach from further off
  const g2 = room('warrior');
  const big = put(g2, 2.2, 0);
  assert.equal(g2.nearAssist(1.5), null);
  big.r = 0.8;
  assert.equal(g2.nearAssist(1.5), big, 'a big monster is within reach from further away');
  // one that cannot be seen is not gone for
  big.seen = false;
  assert.equal(g2.nearAssist(1.5), null);
});

test('the enemy being fought already is kept to while it is in reach, even when another is nearer', () => {
  const g = room('warrior');
  const a = put(g, 1.3, 0);
  const b = put(g, 0, 0.7);
  assert.equal(g.nearAssist(1.5), b);
  assert.equal(g.nearAssist(1.5, a.id), a, 'the one last gone for, while it is in reach');
  a.x = g.hero.x + 3;
  assert.equal(g.nearAssist(1.5, a.id), b, 'out of reach: the nearest');
  a.x = g.hero.x + 1.3;
  a.dead = true;
  assert.equal(g.nearAssist(1.5, a.id), b, 'dead: the nearest');
});

test('whether the quick attack would reach: a blade must be near enough, a shot needs range and a clear line', () => {
  const w = room('warrior');
  const m = put(w, 1.6, 0);
  assert.ok(w.quickReaches(m), 'a tile and a half off: the sword reaches');
  m.x = w.hero.x + 2.6;
  assert.ok(!w.quickReaches(m), 'two and a half tiles off: it does not');
  const z = corner('ranger');
  const t = put(z, ...along(7));
  assert.ok(z.quickReaches(t), 'seven tiles off: the arrow reaches');
  [t.x, t.y] = [z.hero.x + along(9.5)[0], z.hero.y + along(9.5)[1]];
  assert.ok(!z.quickReaches(t), 'nine and a half: it does not');
  // a wave fades after a short way: the mage must be nearer than the ranger
  const v = corner('mage');
  const u = put(v, ...along(4.5));
  assert.ok(v.quickReaches(u), 'four and a half tiles off: the wave reaches');
  [u.x, u.y] = [v.hero.x + along(6.5)[0], v.hero.y + along(6.5)[1]];
  assert.ok(!v.quickReaches(u), 'six and a half: it has faded by then');
});

test('the rules still walk a hero into reach of an enemy that was asked for from too far (left thumb idle)', () => {
  const g = room('warrior');
  const h = g.hero;
  const m = put(g, 4, 0);
  const c = emptyControls();
  c.fire = true;
  c.approach = true;
  c.aimX = m.x;
  c.aimY = m.y;
  const x0 = h.x;
  let struckAt = -1;
  for (let i = 0; i < 240 && struckAt < 0; i++) {
    g.update(DT, c);
    if (h.windup || h.attackT > 0) struckAt = i;
  }
  assert.ok(struckAt > 5, `the hero walked first (${struckAt} steps) ...`);
  assert.ok(h.x > x0 + 1.5 && g.quickReaches(m), '... and struck when within reach');
});

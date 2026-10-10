// Version 12.2: VOLLEY on the bow's hold, the ranger's swipe named TRAP, and words on the swipes.
//
// The owner, 4 Oct 2026:
//   20:02 "Let's move the trap on ranger to the tumble. When you tumble you lay a trap, then let's
//          add VOLLEY as the hold. Target an area and the ranger fires a bunch of arrows straight
//          up, then they rain down into the targeted area for a duration"
//   20:04 "Let's just call tumble trap from now on. You'll still tumble and lay a trap down, and it
//          will still be a dodge, but we'll name it trap"
//   18:34 "We also need to give the swipe abilities the option for words"
//   run: tsx --test tests/swipes.test.ts

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import type { RNG } from '../src/engine/rng';
import { CLASSES, FIRST_WORD, PRACTICE, SKILLS, TUNE, WEAPON_SKILLS, skillsFor, socketCount } from '../src/game/defs';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Controls, GameEvent, Monster, PropInst } from '../src/game/state';
import { CLASS_IDS, WEAPONS } from '../src/game/types';
import type { ClassId, WeaponKind, WordId } from '../src/game/types';
import { attacksGrownBy } from '../src/game/words';

const DT = 1 / 60;

type Inner = {
  rng: RNG;
  waveT: number;
  spawn: (k: string, x: number, y: number, pack: number, rank: number, boss: boolean, rng: RNG) => Monster;
  wakeUp: (m: Monster) => void;
};
const inner = (g: Game): Inner => g as unknown as Inner;

/** The practice room, empty, the hero in the middle facing +x, carrying a weapon of that kind. Level 10: two word slots a side, four of every word. */
function room(cls: ClassId, weapon: WeaponKind = CLASSES[cls].starts, seed = 3): Game {
  const g = Game.forPractice(cls, seed);
  if (g.weapon() !== weapon) {
    const i = g.hero.bag.findIndex((it) => it !== null && it.weapon === weapon);
    assert.ok(i >= 0, `a ${weapon} is in the bag`);
    assert.equal(g.equipFromBag(i), null, `the ${cls} puts on the ${weapon}`);
  }
  inner(g).waveT = 1e9;
  g.monsters.length = 0;
  g.level.props.length = 0;
  g.hero.x = 14.5;
  g.hero.y = 15.5;
  g.hero.fx = 1;
  g.hero.fy = 0;
  g.events.length = 0;
  return g;
}

/** A monster that stands still, never strikes, and can take anything. */
function dummy(g: Game, dx: number, dy: number): Monster {
  const a = inner(g);
  const m = a.spawn('skeleton', g.hero.x + dx, g.hero.y + dy, 1, 0, false, a.rng);
  a.wakeUp(m);
  m.speed = 0;
  m.cd = 1e9;
  m.life = m.maxLife = 1e7;
  return m;
}
const hurt = (m: Monster): number => m.maxLife - m.life;

/** Run the game for a while with those controls (pressed for the first step only), and collect what it said. */
function run(g: Game, c: Controls, seconds: number, ev: GameEvent[] = []): GameEvent[] {
  for (let t = 0; t < seconds - 1e-9; t += DT) {
    g.update(DT, c);
    c.fire = false;
    c.cast = false;
    c.evade = false;
    ev.push(...g.events);
    g.events.length = 0;
  }
  return ev;
}

/** The slow attack, aimed `dx`, `dy` from the hero. */
function hold(g: Game, dx: number, dy: number, seconds: number): GameEvent[] {
  const c = emptyControls();
  c.cast = true;
  c.castX = c.aimX = g.hero.x + dx;
  c.castY = c.aimY = g.hero.y + dy;
  return run(g, c, seconds);
}

/** The evasive move, toward a place `dx`, `dy` from the hero. */
function swipe(g: Game, dx: number, dy: number, seconds = 0.6): GameEvent[] {
  const c = emptyControls();
  c.evade = true;
  c.evadeX = g.hero.x + dx;
  c.evadeY = g.hero.y + dy;
  return run(g, c, seconds);
}

const set = (g: Game, skill: number, side: 'front' | 'behind', w: WordId): void => assert.equal(g.socket(skill, side, w), null, `${w} goes ${side} of ability ${skill}`);
const of = <T extends GameEvent['t']>(ev: GameEvent[], t: T): Extract<GameEvent, { t: T }>[] => ev.filter((e): e is Extract<GameEvent, { t: T }> => e.t === t);

// =============================================================================================
// The table

test('the bow gives Shot and Volley to whoever holds it; the ranger\'s swipe is named Trap, and is still a roll', () => {
  assert.deepEqual(WEAPON_SKILLS.bow, ['shot', 'volley']);
  assert.equal(SKILLS.volley.kind, 'volley');
  assert.equal(SKILLS.volley.name, 'Volley');
  assert.ok(SKILLS.volley.cooldown > SKILLS.shot.cooldown, 'of a weapon\'s two attacks the one that waits longer is the slow one');
  assert.equal(CLASSES.ranger.evade, 'trap');
  assert.equal(SKILLS.trap.name, 'Trap', 'the owner: "we\'ll name it trap"');
  assert.equal(SKILLS.trap.kind, 'roll', '"it will still be a dodge"');
  assert.ok(SKILLS.trap.dmg > 0 && SKILLS.trap.radius > 0, 'and it has a burst: the trap\'s');
  for (const cls of CLASS_IDS) {
    assert.deepEqual(skillsFor(cls, 'bow'), ['shot', 'volley', CLASSES[cls].evade], `${cls} with a bow`);
    // nobody's weapon gives a trap any more: it is the ranger's own
    for (const w of WEAPONS) assert.ok(!WEAPON_SKILLS[w].includes('trap'), `${w} gives no trap`);
  }
  assert.deepEqual(CLASS_IDS.map((c) => CLASSES[c].evade), ['leap', 'trap', 'warp']);
});

// =============================================================================================
// Volley

test('a volley: the arrows go up, a moment passes, then they come down one after another on the place aimed at', () => {
  const g = room('ranger');
  const total = Math.round(TUNE.volleyLife / TUNE.volleyEvery);
  const ev: GameEvent[] = [];
  const c = emptyControls();
  c.cast = true;
  c.castX = g.hero.x + 5;
  c.castY = g.hero.y;
  // (the steps are counted from the press: the bow is raised first, SKILLS.volley.windup)
  const times: number[] = [];
  let up = -1;
  for (let t = 0; t < 5; t += DT) {
    g.update(DT, c);
    c.cast = false;
    for (const e of g.events) {
      if (e.t === 'volleyUp') up = t;
      if (e.t === 'volleyFall') times.push(t);
    }
    ev.push(...g.events);
    g.events.length = 0;
  }
  const ups = of(ev, 'volleyUp');
  assert.equal(ups.length, 1, 'the arrows leave the bow once');
  assert.ok(Math.abs(up - SKILLS.volley.windup) <= DT * 2, `after the bow is raised (${up.toFixed(2)} s; the rules say ${SKILLS.volley.windup})`);
  assert.ok(Math.abs(ups[0].tx - (g.hero.x + 5)) < 0.01 && Math.abs(ups[0].ty - g.hero.y) < 0.01, 'for the place that was aimed at');
  assert.equal(times.length, total, `${total} arrows come down`);
  assert.ok(Math.abs(times[0] - up - TUNE.volleyDelay) <= DT * 2, `the first ${TUNE.volleyDelay} s after they left (it took ${(times[0] - up).toFixed(2)})`);
  for (let i = 1; i < times.length; i++) assert.ok(Math.abs(times[i] - times[i - 1] - TUNE.volleyEvery) <= DT * 1.5, `one every ${TUNE.volleyEvery} s`);
  assert.ok(times[times.length - 1] - times[0] < TUNE.volleyLife, 'and the rain lasts about as long as the rules say');
  assert.ok(TUNE.volleyLife >= 1.5 && TUNE.volleyLife <= 4, 'the owner: "for a duration"');
  // every one of them inside the patch
  for (const e of of(ev, 'volleyFall')) assert.ok(Math.hypot(e.x - (g.hero.x + 5), e.y - g.hero.y) <= SKILLS.volley.radius + 1e-6, 'each arrow lands inside the patch of ground');
  assert.equal(of(ev, 'volleyEnd').length, 1, 'and then it is over');
  assert.equal(g.volleys.length, 0);
});

test('the rain hurts what stands in it, again and again, and not what stands outside it', () => {
  const g = room('ranger');
  const mid = dummy(g, 5, 0);
  const edge = dummy(g, 5 + SKILLS.volley.radius * 0.75, 0);
  const out = dummy(g, 5 + SKILLS.volley.radius + TUNE.volleyHit + 1, 0);
  const ev = hold(g, 5, 0, 4.5);
  const falls = of(ev, 'volleyFall');
  const hitsMid = falls.filter((e) => Math.hypot(e.x - mid.x, e.y - mid.y) <= TUNE.volleyHit + mid.r).length;
  const hitsEdge = falls.filter((e) => Math.hypot(e.x - edge.x, e.y - edge.y) <= TUNE.volleyHit + edge.r).length;
  assert.ok(hitsMid >= 3, `something in the middle is hit several times (${hitsMid})`);
  assert.ok(hitsEdge >= 2, `and so is something toward the edge (${hitsEdge})`);
  assert.ok(hurt(mid) > 0 && hurt(edge) > 0);
  assert.equal(hurt(out), 0, 'what stands outside is not touched');
  // each arrow is one hit of the ability: SKILLS.volley.dmg of a quick shot
  const g2 = room('ranger');
  const m2 = dummy(g2, 3, 0);
  for (let k = 0; k < 40; k++) {
    const c = emptyControls();
    c.fire = true;
    c.aimX = m2.x;
    c.aimY = m2.y;
    run(g2, c, 0.9);
  }
  const shot = hurt(m2) / 40;
  const arrow = hurt(mid) / hitsMid;
  assert.ok(Math.abs(arrow / shot - SKILLS.volley.dmg / SKILLS.shot.dmg) < 0.2, `an arrow of the rain does ${(arrow / shot).toFixed(2)} of a shot (the rules say ${SKILLS.volley.dmg})`);
  console.log(`volley: ${falls.length} arrows; a monster in the middle is hit ${hitsMid} times, one three quarters of the way out ${hitsEdge} times; each for ${(arrow / shot).toFixed(2)} of a shot`);
});

test('standing anywhere in the rain costs about the same: the arrows are spread over the whole patch', () => {
  const g = room('ranger');
  const r = SKILLS.volley.radius;
  const spots: Monster[] = [];
  for (const [dx, dy] of [[0, 0], [r * 0.5, 0], [-r * 0.5, 0], [0, r * 0.5], [0, -r * 0.5], [r * 0.8, 0], [0, -r * 0.8], [-r * 0.55, r * 0.55]]) spots.push(dummy(g, 6 + dx, dy));
  hold(g, 6, 0, 4.5);
  const got = spots.map((m) => hurt(m));
  const least = Math.min(...got);
  const most = Math.max(...got);
  assert.ok(least > 0, 'nowhere in the patch is safe');
  assert.ok(most / least <= 4.01, `the luckiest place takes no less than a quarter of the unluckiest (${got.map((v) => Math.round(v)).join(', ')})`);
});

test('a volley is aimed like the orb: within the bow\'s reach, and then it waits to be ready again', () => {
  const g = room('ranger');
  const ev = hold(g, 30, 0, 0.6);
  const up = of(ev, 'volleyUp')[0];
  assert.ok(up, 'loosed');
  assert.ok(Math.abs(Math.hypot(up.tx - g.hero.x, up.ty - g.hero.y) - SKILLS.volley.range) < 0.6, `aimed too far, it comes down at the end of its reach (${Math.hypot(up.tx - g.hero.x, up.ty - g.hero.y).toFixed(1)} tiles; the rules say ${SKILLS.volley.range})`);
  const s = g.hero.skills[1];
  assert.equal(s.charges, 0, 'and it must be waited for');
  assert.ok(Math.abs(s.r.cooldown - SKILLS.volley.cooldown * (1 - g.hero.d.cdr)) < 1e-9);
  // asked for again at once, nothing happens
  assert.equal(of(hold(g, 4, 0, 0.6), 'volleyUp').length, 0, 'not while it waits');
  run(g, emptyControls(), s.r.cooldown);
  assert.equal(of(hold(g, 4, 0, 0.6), 'volleyUp').length, 1, 'ready again after its cooldown');
});

test('whoever holds the bow has the volley; changing weapon while it rains ends it', () => {
  for (const cls of CLASS_IDS) {
    const g = room(cls, 'bow');
    assert.equal(g.hero.skills[1].id, 'volley', `${cls} with a bow`);
    const m = dummy(g, 4, 0);
    hold(g, 4, 0, 1.2);
    assert.ok(hurt(m) > 0, `${cls}: the rain falls for them too`);
    assert.equal(g.volleys.length, 1, 'and is still falling');
    // another weapon in hand: the rain was the bow's
    const i = g.hero.bag.findIndex((it) => it !== null && it.weapon === 'sword');
    assert.equal(g.equipFromBag(i), null);
    assert.equal(g.volleys.length, 0, `${cls}: with the bow put away the rain stops`);
  }
});

test('a volley breaks the barrels it falls on', () => {
  const g = room('ranger');
  const f = g.level.floor;
  const tx = Math.floor(g.hero.x) + 5;
  const ty = Math.floor(g.hero.y);
  const p: PropInst = { kind: 'barrel', tx, ty, x: tx + 0.5, y: ty + 0.5, solid: true, state: 0, variant: 0 };
  g.level.props.push(p);
  g.level.walk[ty * f.w + tx] = 0;
  hold(g, 5, 0, 4.5);
  assert.equal(p.state, 1, 'the barrel in the middle of the rain is broken');
});

test('words on a volley: Twin brings the arrows down in pairs, a word behind leaves its mark once, Echoes rains again', () => {
  const total = Math.round(TUNE.volleyLife / TUNE.volleyEvery);
  // Twin
  const g = room('ranger');
  set(g, 1, 'front', 'twin');
  const m = dummy(g, 5, 0);
  const ev = hold(g, 5, 0, 4.5);
  const falls = of(ev, 'volleyFall');
  assert.equal(falls.length, total * 2, 'twice as many arrows');
  assert.equal(falls.filter((e) => e.n === 1).length, total, 'half of them the second of a pair');
  assert.ok(g.hero.skills[1].r.countDmg < 1, 'each the weaker for it');
  assert.ok(hurt(m) > 0);
  // of Flame: burning ground, once, where the rain falls
  const g2 = room('ranger');
  set(g2, 1, 'behind', 'fire');
  const ev2 = hold(g2, 5, 0, 4.5);
  const zones = of(ev2, 'zone').filter((e) => e.kind === 'burn');
  assert.equal(zones.length, 1, 'one patch of burning ground');
  assert.ok(Math.hypot(zones[0].x - (g2.hero.x + 5), zones[0].y - g2.hero.y) < 0.01, 'under the rain');
  // of Ruin: one rune
  const g3 = room('ranger');
  set(g3, 1, 'behind', 'volatile');
  assert.equal(of(hold(g3, 5, 0, 4.5), 'zone').filter((e) => e.kind === 'rune').length, 1, 'one rune');
  // of Echoes: a second, weaker rain on the same place
  const g4 = room('ranger');
  set(g4, 1, 'behind', 'twin');
  const m4 = dummy(g4, 5, 0);
  const ev4 = hold(g4, 5, 0, 7);
  const ups = of(ev4, 'volleyUp');
  assert.equal(ups.length, 2, 'the volley is loosed twice');
  assert.equal(ups[1].echo, true, 'the second is the echo');
  assert.ok(Math.hypot(ups[1].tx - ups[0].tx, ups[1].ty - ups[0].ty) < 0.01, 'on the same place');
  assert.equal(of(ev4, 'volleyFall').length, total * 2);
  assert.ok(hurt(m4) > 0);
  // Power: a bigger patch
  const g5 = room('ranger');
  set(g5, 1, 'front', 'power');
  const up5 = of(hold(g5, 5, 0, 0.6), 'volleyUp')[0];
  assert.ok(up5.r > SKILLS.volley.radius * 1.1, `Power makes the patch bigger (${up5.r.toFixed(2)} against ${SKILLS.volley.radius})`);
});

// =============================================================================================
// Trap, the ranger's swipe

test('the ranger rolls, and a trap is left where the roll began', () => {
  const g = room('ranger');
  const h = g.hero;
  const x0 = h.x;
  const y0 = h.y;
  const ev = swipe(g, 5, 0);
  assert.ok(Math.hypot(h.x - x0, h.y - y0) > 2.5, `the ranger has rolled away (${Math.hypot(h.x - x0, h.y - y0).toFixed(2)} tiles)`);
  assert.equal(g.traps.length, 1, 'one trap');
  assert.ok(Math.abs(g.traps[0].x - x0) < 0.01 && Math.abs(g.traps[0].y - y0) < 0.01, 'where the roll began');
  assert.equal(g.traps[0].skill, 2, 'it is the swipe\'s');
  assert.equal(of(ev, 'trapSet').length, 1, 'the effects are told');
  assert.ok(TUNE.trapArm <= 0.15, 'a very small time to arm');
});

test('the trap waits, and bursts when a monster steps on it', () => {
  const g = room('ranger');
  const h = g.hero;
  const x0 = h.x;
  swipe(g, 5, 0, 2);
  assert.equal(g.traps.length, 1, 'with nothing near, it waits');
  // something a step and a half away does not set it off; something that walks onto it does
  const m = dummy(g, 0, 0);
  m.x = x0 + 1.6;
  const far = dummy(g, 0, 0);
  far.x = x0 + SKILLS.trap.radius + 2;
  run(g, emptyControls(), 1);
  assert.equal(g.traps.length, 1, 'a monster beside it is not on it');
  m.x = x0 + 0.5;
  const ev = run(g, emptyControls(), 0.1);
  assert.equal(g.traps.length, 0, 'stepped on: it goes off');
  const burst = of(ev, 'burst').find((e) => e.style === 'blast');
  assert.ok(burst, 'with a burst');
  assert.ok(Math.abs(burst!.r - SKILLS.trap.radius) < 1e-6, 'as wide as the rules say');
  assert.ok(hurt(m) > 0, 'and hurts what stepped on it');
  assert.equal(hurt(far), 0, 'but not what stands well outside it');
});

test('what chases the ranger runs onto it: a trap rolled away from at a monster\'s feet goes off under it', () => {
  const g = room('ranger');
  const h = g.hero;
  const m = dummy(g, 0.9, 0);
  swipe(g, -5, 0, 0.6);
  assert.ok(hurt(m) > 0, 'the monster that stood beside the ranger was caught by the trap');
  assert.equal(g.traps.length, 0);
  assert.ok(h.x < m.x - 2.5, 'and the ranger is well away');
  // the burst is the swipe's own hit: SKILLS.trap.dmg of a quick shot, grown by Dexterity as a swipe is
  const g2 = room('ranger');
  const m2 = dummy(g2, 3, 0);
  for (let k = 0; k < 40; k++) {
    const c = emptyControls();
    c.fire = true;
    c.aimX = m2.x;
    c.aimY = m2.y;
    run(g2, c, 0.9);
  }
  // (a level 10 character's hits vary and may be critical: so many traps, and the mean)
  let sum = 0;
  let n = 0;
  for (let k = 0; k < 30; k++) {
    const q = room('ranger', 'bow', 100 + k);
    const d = dummy(q, 0.9, 0);
    swipe(q, -5, 0, 0.6);
    sum += hurt(d);
    n++;
  }
  const ratio = sum / n / (hurt(m2) / 40);
  assert.ok(Math.abs(ratio - SKILLS.trap.dmg) < SKILLS.trap.dmg * 0.3, `the trap's burst does ${ratio.toFixed(2)} of a shot (the rules say ${SKILLS.trap.dmg})`);
});

test('two rolls, two traps: the roll holds two charges; and no more than a few traps lie at once', () => {
  const g = room('ranger');
  const h = g.hero;
  assert.equal(h.skills[2].maxCharges, 2);
  swipe(g, 5, 0, 0.4);
  swipe(g, 0, 5, 0.4);
  assert.equal(g.traps.length, 2, 'two rolls, two traps');
  assert.equal(h.skills[2].charges, 0);
  const x = h.x;
  swipe(g, -5, 0, 0.3);
  assert.ok(Math.abs(h.x - x) < 0.01, 'a third must be waited for');
  assert.equal(g.traps.length, 2);
  // roll about until more have been laid than may lie
  for (let k = 0; k < TUNE.trapMax + 2; k++) {
    run(g, emptyControls(), h.skills[2].r.cooldown + 0.1);
    swipe(g, k % 2 ? 4 : -4, k % 3 ? 3 : -3, 0.4);
  }
  assert.equal(g.traps.length, TUNE.trapMax, `no more than ${TUNE.trapMax} at once: a new one takes the place of the oldest`);
});

test('only the ranger lays traps, whatever anyone carries', () => {
  for (const cls of CLASS_IDS) {
    for (const w of WEAPONS) {
      const g = room(cls, w);
      swipe(g, 4, 0, 0.8);
      assert.equal(g.hero.skills[2].uses, 1, `${cls} with a ${w}: the move was made`);
      assert.equal(g.traps.length, cls === 'ranger' ? 1 : 0, `${cls} with a ${w}`);
    }
  }
});

// =============================================================================================
// Words on the swipes

test('the three evasive moves take words in the same slots as the attacks', () => {
  for (const cls of CLASS_IDS) {
    const g = room(cls);
    const h = g.hero;
    const [nf, nb] = g.slots();
    assert.ok(SKILLS[h.skills[2].id].sockets, `${cls}: ${h.skills[2].id} takes words`);
    assert.equal(h.skills[2].front.length, nf, 'as many slots in front as an attack has');
    assert.equal(h.skills[2].behind.length, nb, 'and behind');
    set(g, 2, 'front', 'fire');
    set(g, 2, 'behind', 'swift');
    const name = SKILLS[h.skills[2].id].name;
    assert.equal(h.skills[2].r.name, `Flame ${name} of Swiftness`);
    assert.equal(h.skills[2].r.element, 'fire');
    // and it can be taken out again
    assert.equal(g.unsocket(2, 'front', 0), null);
    assert.equal(h.skills[2].r.name, `${name} of Swiftness`);
    assert.equal(h.words.fire, PRACTICE.words, 'back in the pouch');
  }
});

test('the first word of each class still goes where the owner chose: the ranger\'s Poison on Trap', () => {
  assert.deepEqual(FIRST_WORD.ranger, { word: 'poison', skill: 2 });
  assert.equal(skillsFor('ranger', CLASSES.ranger.starts)[FIRST_WORD.ranger.skill], 'trap');
  for (const cls of CLASS_IDS) assert.ok(SKILLS[skillsFor(cls, CLASSES[cls].starts)[FIRST_WORD[cls].skill]].sockets, `${cls}: the ability it is for takes words`);
});

test('a word in front of Trap changes the trap\'s burst; a word behind changes what the burst leaves', () => {
  const g = room('ranger');
  set(g, 2, 'front', 'poison');
  const m = dummy(g, 0.9, 0);
  swipe(g, -5, 0, 0.6);
  assert.ok(hurt(m) > 0);
  assert.ok(m.poisonN >= 1 && m.poisonT > 0, 'Poison Trap: what it catches is poisoned');
  // of Venom: a cloud where it burst
  const g2 = room('ranger');
  set(g2, 2, 'behind', 'poison');
  const x0 = g2.hero.x;
  const y0 = g2.hero.y;
  dummy(g2, 0.9, 0);
  const ev = swipe(g2, -5, 0, 0.6);
  const cloud = of(ev, 'zone').find((e) => e.kind === 'venom');
  assert.ok(cloud, 'Trap of Venom leaves a cloud');
  assert.ok(Math.hypot(cloud!.x - x0, cloud!.y - y0) < 0.01, 'where the trap burst');
  // nothing is left where no trap has burst
  const g3 = room('ranger');
  set(g3, 2, 'behind', 'poison');
  assert.equal(of(swipe(g3, -5, 0, 0.6), 'zone').length, 0, 'a trap that only lies there leaves nothing yet');
});

test('Twin Trap: a second trap where the roll ends. Trap of Echoes: another where the first was, a moment later', () => {
  const g = room('ranger');
  set(g, 2, 'front', 'twin');
  const x0 = g.hero.x;
  swipe(g, 5, 0, 0.6);
  assert.equal(g.traps.length, 2, 'two traps');
  assert.ok(Math.abs(g.traps[0].x - x0) < 0.01, 'one where the roll began');
  assert.ok(Math.hypot(g.traps[1].x - g.hero.x, g.traps[1].y - g.hero.y) < 0.01, 'one where it ended');
  assert.ok(g.traps[0].frac < 1 && g.traps[0].frac === g.traps[1].frac, 'each the weaker for it');
  const g2 = room('ranger');
  set(g2, 2, 'behind', 'twin');
  const x2 = g2.hero.x;
  swipe(g2, 5, 0, 0.3);
  assert.equal(g2.traps.length, 1);
  run(g2, emptyControls(), 1.2);
  assert.equal(g2.traps.length, 2, 'the echo: a second trap');
  assert.ok(Math.abs(g2.traps[1].x - x2) < 0.01, 'where the first was laid');
  assert.ok(g2.traps[1].frac < g2.traps[0].frac, 'and weaker');
});

test('a word in front of Leap changes the landing; a word behind is left where the warrior lands', () => {
  const g = room('warrior');
  set(g, 2, 'front', 'fire');
  set(g, 2, 'behind', 'frost');
  const m = dummy(g, 5.5, 0);
  const ev = swipe(g, 5, 0, 1);
  assert.ok(hurt(m) > 0, 'the landing hits');
  assert.ok(m.burnT > 0, 'Flame Leap: what it lands on burns');
  const ice = of(ev, 'zone').find((e) => e.kind === 'ice');
  assert.ok(ice, 'Leap of Frost leaves ice');
  assert.ok(Math.hypot(ice!.x - g.hero.x, ice!.y - g.hero.y) < 0.5, 'where the warrior came down');
  // Twin: two shocks
  const g2 = room('warrior');
  set(g2, 2, 'front', 'twin');
  const ev2 = swipe(g2, 5, 0, 1.2);
  assert.equal(of(ev2, 'burst').filter((e) => e.style === 'land').length, 2, 'Twin Leap lands with two shocks');
  // of Echoes: one more, later and weaker
  const g3 = room('warrior');
  set(g3, 2, 'behind', 'twin');
  const ev3 = swipe(g3, 5, 0, 2);
  const lands = of(ev3, 'burst').filter((e) => e.style === 'land');
  assert.equal(lands.length, 2);
  assert.equal(lands[1].echo, true);
});

test('Warp arrives in a burst: a word in front changes it, a word behind is left where the mage vanished from', () => {
  // Until Version 12.2 a warp hurt nothing. It has a small burst now, so that a word in front of
  // it has a hit to change (read back to the owner at 18:37: "Warp burst where the mage arrives").
  const g = room('mage');
  const m = dummy(g, 5.5, 0);
  const left = dummy(g, -1, 0);
  const ev0 = swipe(g, 5, 0, 0.5);
  assert.ok(Math.abs(g.hero.x - (m.x - 0.5)) < 0.6, 'the mage has arrived beside it');
  assert.ok(hurt(m) > 0, 'and what stands there is hurt');
  assert.equal(hurt(left), 0, 'not what stood where the mage left');
  const burst = of(ev0, 'burst').find((e) => e.style === 'nova');
  assert.ok(burst && Math.abs(burst.r - SKILLS.warp.radius) < 1e-6, 'the effects are told of the burst, as wide as the rules say');
  assert.ok(SKILLS.warp.dmg <= SKILLS.leap.dmg, 'a small one: no more than the leap\'s landing');
  // a word in front: the burst carries it
  const g2 = room('mage');
  set(g2, 2, 'front', 'frost');
  const m2 = dummy(g2, 5.5, 0);
  swipe(g2, 5, 0, 0.5);
  assert.ok(hurt(m2) > 0, 'Frost Warp hurts what stands where the mage arrives');
  assert.ok(m2.chillT > 0, 'and chills it');
  // a word behind: left where the mage vanished from
  const g3 = room('mage');
  set(g3, 2, 'behind', 'fire');
  const x0 = g3.hero.x;
  const y0 = g3.hero.y;
  dummy(g3, 5.5, 0);
  const ev3 = swipe(g3, 5, 0, 0.5);
  const burn = of(ev3, 'zone').find((e) => e.kind === 'burn');
  assert.ok(burn, 'Warp of Flame leaves burning ground');
  assert.ok(Math.hypot(burn!.x - x0, burn!.y - y0) < 0.01, 'where the mage vanished from');
  // Twin: two bursts. of Echoes: one more, later and weaker.
  const g4 = room('mage');
  set(g4, 2, 'front', 'twin');
  assert.equal(of(swipe(g4, 5, 0, 1), 'burst').filter((e) => e.style === 'nova').length, 2, 'Twin Warp arrives with two bursts');
  const g5 = room('mage');
  set(g5, 2, 'behind', 'twin');
  const novas = of(swipe(g5, 5, 0, 2), 'burst').filter((e) => e.style === 'nova');
  assert.equal(novas.length, 2);
  assert.equal(novas[1].echo, true, 'the second is the echo');
});

test('the level-up screen names the swipe among what grows with the class\'s own attribute', () => {
  assert.deepEqual(attacksGrownBy('str', 'warrior', 'greatsword'), ['Strike', 'Whirlwind', 'Leap']);
  assert.deepEqual(attacksGrownBy('dex', 'ranger', 'bow'), ['Shot', 'Volley', 'Trap']);
  assert.deepEqual(attacksGrownBy('int', 'mage', 'staff'), ['Wave', 'Orb', 'Warp']);
  // the swipe grows with the class's attribute, whatever is in hand
  assert.deepEqual(attacksGrownBy('dex', 'ranger', 'staff'), ['Trap']);
  assert.deepEqual(attacksGrownBy('int', 'ranger', 'staff'), ['Wave', 'Orb']);
  assert.deepEqual(attacksGrownBy('int', 'mage', 'bow'), ['Warp']);
});

test('Swift in front of a swipe shortens its wait; of Swiftness behind it gives speed as it is made', () => {
  for (const cls of CLASS_IDS) {
    const g = room(cls);
    const s = g.hero.skills[2];
    const before = s.r.cooldown;
    set(g, 2, 'front', 'swift');
    assert.ok(s.r.cooldown < before * 0.85, `${cls}: Swift ${SKILLS[s.id].name} is ready sooner (${s.r.cooldown.toFixed(2)} s against ${before.toFixed(2)})`);
    set(g, 2, 'behind', 'swift');
    assert.equal(g.hero.hasteT, 0);
    const ev = swipe(g, 4, 0, 0.1);
    assert.ok(g.hero.hasteT > 0, `${cls}: of Swiftness: a burst of speed`);
    assert.ok(of(ev, 'buff').some((e) => e.kind === 'haste'));
  }
});

test('an old save\'s words stay in their places: what was on the ranger\'s Trap (the hold) is on Volley', () => {
  const g = room('ranger');
  set(g, 1, 'front', 'poison');
  const save = g.save();
  const r = Game.restore(JSON.parse(JSON.stringify(save)));
  assert.equal(r.hero.skills[1].id, 'volley');
  assert.deepEqual(r.hero.skills[1].front.filter(Boolean), ['poison'], 'the word is where it was: in front of the slow attack');
  assert.equal(r.hero.skills[1].r.name, 'Poison Volley');
  assert.equal(r.hero.skills[2].id, 'trap');
  assert.equal(r.hero.skills[2].front.filter(Boolean).length, 0);
});

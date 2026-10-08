// Version 12: any weapon on any character. The weapon gives BOTH attacks; the character keeps the
// evasive move. And the attacks that came with it: Wave and Orb (the staff's), Familiar and Beam
// (the wand's).
//
// The owner, 4 Oct 2026:
//   "I picked up a wand as ranger and it said Mage Only. I need all weapons to be able to be
//    equipped on all characters. Excluding the Druid currently. Remember that the tap attack is
//    dictated by the weapon and I want the build diversity to be at a maximum"
//   "Let's have both skills change with the weapon. I wanted to leave something to keep each
//    character unique but the dodge being unique is enough for now."
//   "I want keep familiar and orb and beam but the original ideas for the skill's properties"
//    (Familiar on the tap; Orb the staff's hold; Beam the wand's hold)
//   "Let's get a different skill for staff on Tap" ... "Let's try wave"
// And that morning: "sword = Strike, bow = Shot"; "Power Strike becomes Power Shot when a bow is
// equipped" (words stay with the place, not the attack); "the weapon's attack grows with the
// weapon's attribute (a sword with Strength, whoever swings it)".
// (Since Version 12.1 the two-handed sword's slow attack is Whirlwind and the Beam burns for as long
// as it is held: what is particular to those two is in tests/channel.test.ts.)
//   run: tsx --test tests/weapons.test.ts

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import type { RNG } from '../src/engine/rng';
import { CLASSES, MANA_MODE, SKILLS, TUNE, WEAPON_ATTR, WEAPON_SKILLS, holdSkill, skillsFor, tapSkill, weaponAttr } from '../src/game/defs';
import type { SkillId } from '../src/game/defs';
import { Game, cleanMeta, newMeta } from '../src/game/game';
import { canPair, plainWeapon, rollItem } from '../src/game/items';
import { emptyControls } from '../src/game/state';
import type { Controls, GameEvent, Monster } from '../src/game/state';
import { CLASS_IDS, WEAPONS } from '../src/game/types';
import type { Attr, ClassId, Item, WeaponKind } from '../src/game/types';
import { attacksGrownBy, listed, resolveSkill, weaponLines } from '../src/game/words';
import { attackClip } from '../src/render/figure';
import { land } from './helpers';

const DT = 1 / 60;

type Inner = {
  rng: RNG;
  waveT: number;
  spawn: (k: string, x: number, y: number, pack: number, rank: number, boss: boolean, rng: RNG) => Monster;
  wakeUp: (m: Monster) => void;
};
const inner = (g: Game): Inner => g as unknown as Inner;

/** The practice room, empty, the hero in the middle facing +x, carrying a weapon of that kind (out of the practice bag if it is not the class's own). */
function room(cls: ClassId, weapon: WeaponKind | null = null, seed = 3): Game {
  const g = Game.forPractice(cls, seed);
  if (weapon && g.weapon() !== weapon) wear(g, weapon);
  inner(g).waveT = 1e9;
  g.monsters.length = 0;
  g.hero.x = 14.5;
  g.hero.y = 15.5;
  g.hero.fx = 1;
  g.hero.fy = 0;
  g.events.length = 0;
  return g;
}

/** Put on the weapon of that kind that is in the bag. */
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

/** Ask for an attack once, aimed at a point relative to the hero, and let it land. Returns the events up to then. */
function attack(g: Game, skill: 0 | 1, dx: number, dy: number): { c: Controls; ev: GameEvent[] } {
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
  return { c, ev };
}

/** Let `seconds` pass with nothing pressed. Returns what happened. */
function wait(g: Game, seconds: number, c: Controls = emptyControls()): GameEvent[] {
  const ev: GameEvent[] = [];
  for (let t = 0; t < seconds - 1e-9; t += DT) {
    g.update(DT, c);
    for (const e of g.events) ev.push(e);
    g.events.length = 0;
  }
  return ev;
}

/** Make an attack ready again at once (the wait between uses is not what the test is about). */
function ready(g: Game, skill: 0 | 1): void {
  g.hero.skills[skill].charges = 1;
  g.hero.skills[skill].cd = 0;
}

const TAP: Record<WeaponKind, SkillId> = { sword: 'strike', greatsword: 'strike', bow: 'shot', staff: 'wave', wand: 'familiar' };
const HOLD: Record<WeaponKind, SkillId> = { sword: 'slam', greatsword: 'whirlwind', bow: 'volley', staff: 'orb', wand: 'beam' };
const GROWS: Record<WeaponKind, Attr> = { sword: 'str', greatsword: 'str', bow: 'dex', staff: 'int', wand: 'int' };
const SWIPE: Record<ClassId, SkillId> = { warrior: 'leap', ranger: 'trap', mage: 'warp' };

// =============================================================================================
// The table

test('the weapon gives both attacks, the character keeps the swipe', () => {
  for (const w of WEAPONS) assert.deepEqual([...WEAPON_SKILLS[w]], [TAP[w], HOLD[w]], `the owner's table: a ${w}`);
  assert.deepEqual(WEAPON_ATTR, GROWS, 'a sword grows with Strength, a bow with Dexterity, a staff or a wand with Intelligence');
  for (const cls of CLASS_IDS) {
    assert.equal(CLASSES[cls].evade, SWIPE[cls]);
    for (const w of WEAPONS) assert.deepEqual(skillsFor(cls, w), [TAP[w], HOLD[w], SWIPE[cls]], `a ${cls} with a ${w}`);
    // with empty hands: a blow of the fist, and a slam of it
    assert.deepEqual(skillsFor(cls, null), ['strike', 'slam', SWIPE[cls]]);
  }
  assert.equal(tapSkill(null), 'strike');
  assert.equal(holdSkill(null), 'slam');
  assert.equal(weaponAttr(null), 'str');
  // every attack there is is brought by a weapon or a class
  const brought = new Set<SkillId>([...WEAPONS.flatMap((w) => [...WEAPON_SKILLS[w]]), ...CLASS_IDS.map((c) => CLASSES[c].evade)]);
  assert.deepEqual([...brought].sort(), Object.keys(SKILLS).sort(), 'no attack is left that nothing gives');
  // the staff and the wand share neither attack (the owner: "Let's get a different skill for staff on Tap")
  assert.equal(new Set([...WEAPON_SKILLS.staff, ...WEAPON_SKILLS.wand]).size, 4);
  // of a weapon's two attacks, the one that waits longer between uses is on the hold
  for (const w of WEAPONS) {
    const [quick, slow] = WEAPON_SKILLS[w];
    assert.ok(SKILLS[slow].cooldown > SKILLS[quick].cooldown, `${w}: ${slow} waits longer than ${quick}`);
  }
});

test('each class begins with its own weapon: the warrior the two-handed sword, the mage the staff with Wave and Orb', () => {
  const begins: Record<ClassId, [WeaponKind, SkillId[]]> = {
    warrior: ['greatsword', ['strike', 'whirlwind', 'leap']],
    ranger: ['bow', ['shot', 'volley', 'trap']],
    mage: ['staff', ['wave', 'orb', 'warp']],
  };
  for (const cls of CLASS_IDS) {
    const g = new Game(cls, 11);
    const h = g.hero;
    assert.equal(g.weapon(), begins[cls][0], `a ${cls} begins with a ${begins[cls][0]}`);
    assert.equal(h.gear.mainhand!.ilvl, 1);
    assert.equal(h.gear.mainhand!.rarity, 0, 'a plain one');
    assert.deepEqual(h.skills.map((s) => s.id), begins[cls][1]);
    assert.equal(CLASSES[cls].starts, begins[cls][0]);
    // (the first dungeon teaches those three)
    const first = Game.forFirstRun(cls, 11);
    assert.deepEqual(first.hero.skills.map((s) => s.id), begins[cls][1]);
  }
});

// =============================================================================================
// Any weapon on any character

test('any character can put on any weapon, and both attacks change with it', () => {
  for (const cls of CLASS_IDS) {
    const g = room(cls);
    const h = g.hero;
    for (const w of WEAPONS) {
      if (g.weapon() !== w) wear(g, w);
      assert.equal(g.weapon(), w);
      assert.deepEqual(h.skills.map((s) => s.id), [TAP[w], HOLD[w], SWIPE[cls]], `a ${cls} with a ${w}`);
      for (const i of [0, 1]) {
        assert.equal(h.skills[i].r.id, h.skills[i].id, 'and it is worked out afresh');
        assert.equal(h.skills[i].r.name, SKILLS[h.skills[i].id].name);
      }
    }
    // every weapon and off-hand that can drop can be used by this class, level allowing
    const rng = inner(g).rng;
    for (let i = 0; i < 200; i++) {
      const it = rollItem(1 + (i % 10), rng, { slot: i % 2 === 0 ? 'mainhand' : 'offhand' });
      assert.equal(it.cls, null, 'no piece is one class\'s own');
      h.level = 30;
      assert.equal(g.useProblem(it), null, `a ${cls} may use ${it.name}`);
      h.level = 1;
      assert.equal(g.useProblem(it), it.reqLevel > 1 ? `Needs level ${it.reqLevel}` : null, 'only its level can stand in the way');
    }
  }
});

test('the piece for the other hand goes with the weapon, whoever holds it', () => {
  const pairs: Record<string, WeaponKind> = { shield: 'sword', quiver: 'bow', focus: 'wand' };
  for (const cls of CLASS_IDS) {
    for (const [off, weapon] of Object.entries(pairs)) {
      const g = room(cls, weapon);
      const h = g.hero;
      // (the class whose own weapon it goes with has it on already; for the others it is in the bag)
      if (!h.gear.offhand) {
        const i = h.bag.findIndex((it) => it !== null && it.offhand === off);
        assert.ok(i >= 0, `a ${off} is in the practice bag`);
        assert.equal(g.equipFromBag(i), null, `a ${cls} with a ${weapon} takes a ${off}`);
      }
      assert.equal(h.gear.offhand!.offhand, off);
      // a weapon it does not go with sends it back to the bag
      const other: WeaponKind = weapon === 'sword' ? 'staff' : 'sword';
      wear(g, other);
      assert.equal(h.gear.offhand, null, `the ${off} does not go with a ${other}: it is back in the bag`);
      assert.ok(h.bag.some((it) => it !== null && it.offhand === off));
      // and it cannot be put on beside that weapon
      const j = h.bag.findIndex((it) => it !== null && it.offhand === off);
      assert.ok(typeof g.equipFromBag(j) === 'string', 'it says why not');
      assert.equal(h.gear.offhand, null);
    }
  }
  // the two-handed sword and the staff take nothing in the other hand; the bow takes its quiver
  const rng = inner(room('warrior')).rng;
  for (let i = 0; i < 60; i++) {
    const off = rollItem(3, rng, { slot: 'offhand' });
    assert.equal(canPair(plainWeapon('greatsword'), off), false);
    assert.equal(canPair(plainWeapon('staff'), off), false);
    assert.equal(canPair(plainWeapon('bow'), off), off.offhand === 'quiver');
  }
});

test('words stay with the place, not the attack: Power Strike becomes Power Shot when a bow is put on', () => {
  const g = room('warrior');
  const h = g.hero;
  assert.equal(g.socket(0, 'front', 'power'), null);
  assert.equal(g.socket(0, 'behind', 'fire'), null);
  assert.equal(g.socket(1, 'front', 'frost'), null);
  assert.deepEqual(h.skills.slice(0, 2).map((s) => s.r.name), ['Power Strike of Flame', 'Frost Whirlwind']);
  const spare = { ...h.words };
  const reads: [WeaponKind, string, string][] = [
    ['bow', 'Power Shot of Flame', 'Frost Volley'],
    ['staff', 'Power Wave of Flame', 'Frost Orb'],
    ['wand', 'Power Familiar of Flame', 'Frost Beam'],
    ['sword', 'Power Strike of Flame', 'Frost Slam'],
  ];
  for (const [w, quick, slow] of reads) {
    wear(g, w);
    assert.deepEqual(h.skills.slice(0, 2).map((s) => s.r.name), [quick, slow], `with a ${w}`);
    assert.deepEqual(h.skills[0].front.filter(Boolean), ['power']);
    assert.deepEqual(h.skills[0].behind.filter(Boolean), ['fire']);
    assert.deepEqual(h.skills[1].front.filter(Boolean), ['frost']);
    assert.deepEqual(h.words, spare, 'no word is lost or gained by changing weapons');
  }
  // and the word does on the new attack what it does on any
  assert.ok(h.skills[0].r.might === 0 && h.skills[0].r.zone !== null && h.skills[0].r.element === 'fire');
  assert.ok(h.skills[1].r.chill > 0 && h.skills[1].r.element === 'frost');
});

test('both attacks grow with the weapon\'s attribute, the swipe with the class\'s', () => {
  for (const cls of CLASS_IDS) {
    for (const w of WEAPONS) {
      const g = room(cls, w);
      const h = g.hero;
      const before = h.skills.map((s) => s.r.dmgMult);
      const swipeHurts = SKILLS[SWIPE[cls]].dmg > 0;
      for (const a of ['str', 'dex', 'int'] as const) {
        const was = h.skills.map((s) => s.r.dmgMult);
        h.attrs[a] += 20;
        g.refresh();
        const now = h.skills.map((s) => s.r.dmgMult);
        for (const i of [0, 1]) assert.equal(now[i] > was[i], GROWS[w] === a, `a ${cls} with a ${w}: ${SKILLS[h.skills[i].id].name} ${GROWS[w] === a ? 'grows' : 'does not grow'} with ${a}`);
        assert.equal(now[2] > was[2], swipeHurts && CLASSES[cls].primary === a, `${SKILLS[SWIPE[cls]].name} and ${a}`);
      }
      assert.ok(h.skills[0].r.dmgMult > before[0] && h.skills[1].r.dmgMult > before[1]);
      // the numbers are the ones the words' own arithmetic gives for that attribute
      const d = h.d;
      assert.equal(h.skills[0].r.dmgMult, resolveSkill(SKILLS[TAP[w]], [], [], GROWS[w], d).dmgMult);
      assert.equal(h.skills[1].r.dmgMult, resolveSkill(SKILLS[HOLD[w]], [], [], GROWS[w], d).dmgMult);
      assert.equal(h.skills[2].r.dmgMult, resolveSkill(SKILLS[SWIPE[cls]], [], [], cls, d).dmgMult);
      // and the level-up screen says so
      for (const a of ['str', 'dex', 'int'] as const) {
        const want: string[] = [];
        if (GROWS[w] === a) want.push(SKILLS[TAP[w]].name, SKILLS[HOLD[w]].name);
        if (swipeHurts && CLASSES[cls].primary === a) want.push(SKILLS[SWIPE[cls]].name);
        assert.deepEqual(attacksGrownBy(a, cls, w), want);
      }
    }
  }
  assert.deepEqual(attacksGrownBy('str', 'warrior', 'greatsword'), ['Strike', 'Whirlwind', 'Leap']);
  assert.equal(listed(['Strike', 'Slam', 'Leap']), 'Strike, Slam and Leap');
  assert.equal(listed(['Wave', 'Orb']), 'Wave and Orb');
  assert.equal(listed(['Leap']), 'Leap');
  assert.deepEqual(weaponLines('wand', true), ['Tap: FAMILIAR. Hold: BEAM.', 'They grow with Intelligence.']);
  assert.deepEqual(weaponLines('greatsword', false), ['Click: STRIKE. Right click: WHIRLWIND.', 'They grow with Strength.']);
});

test('changing weapon lets go of what the old one was doing', () => {
  // an orb that is out goes with the staff
  const g = room('mage');
  dummy(g, 3, 0);
  attack(g, 1, 3, 0);
  assert.equal(g.orbs.length, 1);
  wear(g, 'wand');
  assert.equal(g.orbs.length, 0, 'the orb went with the staff');
  // familiars go with the wand
  wait(g, 0.5);
  attack(g, 0, 3, 0);
  assert.equal(g.familiars.length, 1);
  wear(g, 'sword');
  assert.equal(g.familiars.length, 0, 'the familiar went with the wand');
  // a beam being made is dropped, and nothing fires out of the sword that replaced the wand
  const b = room('mage', 'wand');
  const c = emptyControls();
  c.castX = b.hero.x + 3;
  c.castY = b.hero.y;
  c.cast = true;
  b.update(DT, c);
  c.cast = false;
  assert.ok(b.hero.windup && b.hero.windup.skill === 1, 'a beam is being made');
  wear(b, 'sword');
  assert.equal(b.hero.windup, null, 'changing weapon breaks it off');
  const ev = wait(b, 0.8);
  assert.ok(!ev.some((e) => e.t === 'beam' || e.t === 'burst'), 'and nothing goes out');
  assert.equal(b.hero.skills[1].uses, 0, 'nothing was used, and nothing paid for');
  // an arrow in the air does not turn into something else when the bow is put down
  const r = room('ranger');
  dummy(r, 6, 0);
  attack(r, 0, 6, 0);
  assert.equal(r.projectiles.filter((p) => !p.hostile).length, 1);
  wear(r, 'staff');
  assert.equal(r.projectiles.filter((p) => !p.hostile).length, 0, 'the arrow is gone with the bow');
  // nor does a volley go on raining once the bow is put down
  const t = room('ranger');
  attack(t, 1, 3, 0);
  wait(t, 0.5);
  assert.equal(t.volleys.length, 1);
  wear(t, 'wand');
  assert.equal(t.volleys.length, 0, 'the rain went with the bow');
  // (a trap is the ranger's own since Version 12.2, laid by the roll: it stays whatever is in hand)
});

test('changing weapon is no way round a cooldown', () => {
  // an attack that was waiting hands its wait on to the one that takes its place
  const g = room('mage');
  attack(g, 1, 3, 0);
  assert.equal(g.hero.skills[1].charges, 0, 'the orb is set, and waits');
  wear(g, 'wand');
  assert.equal(g.hero.skills[1].id, 'beam');
  assert.equal(g.hero.skills[1].charges, 0, 'the beam is not ready either');
  assert.ok(Math.abs(g.hero.skills[1].cd - g.hero.skills[1].r.cooldown) < 1e-9 && g.hero.skills[1].cd > 2, 'it waits its own full time');
  // one that was ready gives one that is ready
  const f = room('mage');
  wear(f, 'wand');
  assert.equal(f.hero.skills[1].charges, 1);
  assert.equal(f.hero.skills[1].cd, 0);
  // a quick attack with no wait of its own is ready at once, whatever came before it
  attack(f, 0, 2, 0);
  assert.equal(f.hero.skills[0].charges, 0, 'the familiar is called, and waits');
  wear(f, 'staff');
  assert.equal(f.hero.skills[0].id, 'wave');
  assert.equal(f.hero.skills[0].charges, 1, 'a wave has no cooldown to wait out');
  const { ev } = attack(f, 0, 2, 0);
  assert.ok(ev.some((e) => e.t === 'wave'));
});

// =============================================================================================
// Wave

test('Wave: a wide front that goes through everything in its path, each enemy once, and fades after a short way', () => {
  const g = room('mage');
  const h = g.hero;
  const def = SKILLS.wave;
  assert.equal(h.skills[0].id, 'wave');
  const half = def.radius * h.skills[0].r.size;
  const a = dummy(g, 2, 0);
  const b = dummy(g, 4, half * 0.7);
  const c3 = dummy(g, 5.5, -half * 0.7);
  const side = dummy(g, 3, half + a.r + 0.7);
  const far = dummy(g, def.range + 2.5, 0);
  const behind = dummy(g, -2, 0);
  const { ev } = attack(g, 0, 3, 0);
  assert.equal(ev.filter((e) => e.t === 'wave').length, 1);
  const mine = g.projectiles.filter((p) => !p.hostile);
  assert.equal(mine.length, 1, 'one wave is on its way');
  assert.equal(mine[0].look, 'wave');
  assert.equal(mine[0].pierce, true, 'it goes through what it meets');
  assert.ok(Math.abs(mine[0].r - half) < 1e-9, `it is ${(half * 2).toFixed(1)} tiles wide`);
  const flight = [...ev, ...wait(g, 1.5)];
  assert.ok(hurt(a) > 0 && hurt(b) > 0 && hurt(c3) > 0, 'everything in its path is hit: the first does not stop it');
  assert.equal(flight.filter((e) => e.t === 'hit' && !e.onHero).length, 3, 'each of them once');
  assert.equal(hurt(side), 0, 'what stands to the side of its path is not');
  assert.equal(hurt(behind), 0, 'nor what stands behind');
  assert.equal(hurt(far), 0, `nor what stands beyond the ${def.range} tiles it travels`);
  assert.equal(g.projectiles.filter((p) => !p.hostile).length, 0, 'then it is gone');
  // it has no wait but the staff's own speed, and costs nothing
  assert.equal(def.cooldown, 0);
  assert.equal(h.skills[0].r.mana, 0);
  assert.ok(def.range < SKILLS.shot.range * 0.7, 'a short way: well short of an arrow\'s flight');
});

test('Wave: Twin sends two, fanned apart, and one enemy takes only one of them', () => {
  const g = room('mage');
  assert.equal(g.socket(0, 'front', 'twin'), null);
  const near = dummy(g, 1.6, 0);
  const left = dummy(g, 4, -2.2);
  const right = dummy(g, 4, 2.2);
  const { ev } = attack(g, 0, 3, 0);
  const pair = g.projectiles.filter((p) => !p.hostile);
  assert.equal(pair.length, 2, 'two waves');
  const angles = pair.map((p) => Math.atan2(p.vy, p.vx)).sort((x, y) => x - y);
  assert.ok(Math.abs(angles[0] + TUNE.waveFan) < 1e-9 && Math.abs(angles[1] - TUNE.waveFan) < 1e-9, 'one to each side of the aim');
  const flight = [...ev, ...wait(g, 1.5)];
  const hits = flight.filter((e) => e.t === 'hit' && !e.onHero) as Extract<GameEvent, { t: 'hit' }>[];
  assert.equal(hits.filter((e) => Math.hypot(e.x - near.x, e.y - near.y) < 0.01).length, 1, 'the enemy both pass over takes one of them, not both');
  assert.ok(hurt(left) > 0 && hurt(right) > 0, 'and between them they reach further to the sides than one would');
});

test('Wave: with an element behind it leaves ground along its path, and hits softer for it', () => {
  const g = room('mage');
  const h = g.hero;
  const plain = h.skills[0].r.dmgMult;
  assert.equal(g.socket(0, 'behind', 'fire'), null);
  assert.ok(Math.abs(h.skills[0].r.dmgMult - plain * 0.7) < 1e-9);
  const { ev } = attack(g, 0, 3, 0);
  const all = [...ev, ...wait(g, 1.5)];
  const patches = all.filter((e) => e.t === 'zone' && e.kind === 'burn') as Extract<GameEvent, { t: 'zone' }>[];
  assert.ok(patches.length >= 4, `${patches.length} patches of burning ground`);
  for (const p of patches) assert.ok(Math.abs(p.y - h.y) < 1e-6 && p.x > h.x && p.x < h.x + SKILLS.wave.range + 1, 'along its path');
});

// =============================================================================================
// Orb

test('Orb: set down where it was aimed, it sends out waves until its time is up', () => {
  const g = room('mage');
  const h = g.hero;
  const def = SKILLS.orb;
  assert.equal(h.skills[1].id, 'orb');
  const near = dummy(g, 3, 0);
  const edge = dummy(g, 3 + def.radius * 0.9, 0);
  const far = dummy(g, 3 + def.radius * h.skills[1].r.size + 1.5, 0);
  const { ev } = attack(g, 1, 3, 0);
  assert.equal(g.orbs.length, 1, 'an orb is set');
  const o = g.orbs[0];
  assert.ok(Math.hypot(o.x - (h.x + 3), o.y - h.y) < 0.05, 'where it was aimed');
  assert.equal(ev.filter((e) => e.t === 'orbSet').length, 1);
  // it sends out a wave as it lands
  assert.equal(ev.filter((e) => e.t === 'burst' && e.style === 'nova').length, 1, 'a wave as it lands');
  assert.ok(hurt(near) > 0 && hurt(edge) > 0, 'which hurts what is within its reach');
  assert.equal(hurt(far), 0, 'and nothing beyond it');
  assert.equal(o.waves, 1);
  // and one every so often after that, by itself
  const first = hurt(near);
  const later = wait(g, TUNE.orbEvery + 0.05);
  assert.equal(later.filter((e) => e.t === 'burst' && e.style === 'nova').length, 1, `another ${TUNE.orbEvery} s later`);
  assert.ok(hurt(near) > first);
  const rest = wait(g, TUNE.orbLife);
  const waves = 2 + rest.filter((e) => e.t === 'burst' && e.style === 'nova').length;
  assert.equal(waves, 1 + Math.floor((TUNE.orbLife - 1e-6) / TUNE.orbEvery), `${waves} waves in its ${TUNE.orbLife} s`);
  assert.equal(g.orbs.length, 0, 'then it is gone');
  assert.equal(rest.filter((e) => e.t === 'orbEnd').length, 1);
  assert.equal(hurt(far), 0);
});

test('Orb: it waits between uses, and a second can only be out beside the first if the wait is shortened', () => {
  const g = room('mage');
  const h = g.hero;
  const s = h.skills[1];
  assert.ok(SKILLS.orb.cooldown >= TUNE.orbLife, 'as it begins, the wait is as long as the orb lasts');
  attack(g, 1, 3, 0);
  assert.equal(s.charges, 0);
  assert.ok(Math.abs(s.cd - s.r.cooldown) < 1e-9);
  // asked for again at once: nothing
  const again = attack(g, 1, -3, 0);
  assert.equal(g.orbs.length, 1);
  assert.ok(!again.ev.some((e) => e.t === 'orbSet'));
  // with the wait waived, a second stands beside the first; a third takes the place of the oldest
  assert.equal(TUNE.orbMax, 2);
  ready(g, 1);
  attack(g, 1, -3, 0);
  assert.equal(g.orbs.length, 2, 'two orbs');
  const oldest = g.orbs[0].id;
  ready(g, 1);
  const third = attack(g, 1, 0, 3);
  assert.equal(g.orbs.length, 2, 'never more than two');
  assert.ok(!g.orbs.some((o) => o.id === oldest), 'the oldest is the one that went');
  assert.equal(third.ev.filter((e) => e.t === 'orbEnd').length, 1);
});

test('Orb: it can be set anywhere within a set distance, and no further', () => {
  const g = room('mage');
  const h = g.hero;
  const range = SKILLS.orb.range;
  // aimed beyond its range, it lands at the edge of it, on the line to where it was aimed
  attack(g, 1, range + 3, 0);
  const o = g.orbs[0];
  const d = Math.hypot(o.x - h.x, o.y - h.y);
  assert.ok(d <= range + 1e-6 && d > range - 0.5, `aimed ${range + 3} tiles off, it is set ${d.toFixed(2)} tiles off (its range is ${range})`);
  assert.ok(Math.abs(o.y - h.y) < 0.05);
  // aimed into a wall, it stops short of it on open floor
  ready(g, 1);
  attack(g, 1, 0, -30);
  const p = g.orbs[g.orbs.length - 1];
  assert.equal(g.level.walk[Math.floor(p.y) * g.level.floor.w + Math.floor(p.x)], 1, 'on open floor');
  assert.ok(g.sees(h.x, h.y, p.x, p.y), 'in sight');
});

test('Orb: what the words behind it leave, it leaves as it lands, not with every wave', () => {
  const g = room('mage');
  assert.equal(g.socket(1, 'behind', 'volatile'), null);
  dummy(g, 3, 0);
  const { ev } = attack(g, 1, 3, 0);
  const all = [...ev, ...wait(g, TUNE.orbLife + 2)];
  assert.equal(all.filter((e) => e.t === 'zone' && e.kind === 'rune').length, 1, 'one rune for one orb');
  const g2 = room('mage');
  assert.equal(g2.socket(1, 'behind', 'fire'), null);
  dummy(g2, 3, 0);
  const b = attack(g2, 1, 3, 0);
  const all2 = [...b.ev, ...wait(g2, TUNE.orbLife + 1)];
  assert.equal(all2.filter((e) => e.t === 'zone' && e.kind === 'burn').length, 1, 'one patch of burning ground under it');
});

// =============================================================================================
// Beam (held and swept: tests/channel.test.ts). What a single bite of it leaves is checked here.

test('Beam with words behind: ground along the line, and a rune and a cloud where it first struck', () => {
  const g = room('mage', 'wand');
  const h = g.hero;
  assert.equal(g.socket(1, 'behind', 'fire'), null);
  const first = dummy(g, 3, 0);
  dummy(g, 6, 0);
  const { ev } = attack(g, 1, 3, 0);
  const patches = ev.filter((e) => e.t === 'zone' && e.kind === 'burn') as Extract<GameEvent, { t: 'zone' }>[];
  assert.ok(patches.length >= 2 && patches.length <= TUNE.beamPatches, `${patches.length} patches of burning ground`);
  for (const p of patches) assert.ok(Math.abs(p.y - h.y) < 1e-6 && p.x > h.x, 'on the line');
  for (let i = 1; i < patches.length; i++) assert.ok(Math.abs(patches[i].x - patches[i - 1].x - TUNE.beamPatchGap) < 1e-6, 'evenly spaced');
  const g2 = room('mage', 'wand');
  assert.equal(g2.socket(1, 'behind', 'volatile'), null);
  assert.equal(g2.socket(1, 'behind', 'poison'), null);
  const m = dummy(g2, 4, 0);
  dummy(g2, 7, 0);
  const b = attack(g2, 1, 4, 0);
  const rune = b.ev.find((e) => e.t === 'zone' && e.kind === 'rune') as Extract<GameEvent, { t: 'zone' }>;
  const cloud = b.ev.find((e) => e.t === 'zone' && e.kind === 'venom') as Extract<GameEvent, { t: 'zone' }>;
  assert.ok(rune && cloud, 'one of each');
  assert.equal(b.ev.filter((e) => e.t === 'zone' && (e.kind === 'rune' || e.kind === 'venom')).length, 2, 'and only one of each');
  assert.ok(Math.hypot(rune.x - m.x, rune.y - m.y) < 1e-6 && Math.hypot(cloud.x - m.x, cloud.y - m.y) < 1e-6, 'where it first struck');
  assert.ok(first);
  // into thin air: near its far end
  const g3 = room('mage', 'wand');
  assert.equal(g3.socket(1, 'behind', 'volatile'), null);
  const air = attack(g3, 1, 4, 0);
  const far = air.ev.find((e) => e.t === 'zone' && e.kind === 'rune') as Extract<GameEvent, { t: 'zone' }>;
  const end = g3.beamEnd(g3.hero.x, g3.hero.y, 1, 0, SKILLS.beam.range);
  assert.ok(far && Math.hypot(far.x - end.x, far.y - end.y) < 1.2, 'the rune is written near the end of the line');
});

// =============================================================================================
// Familiar

test('Familiar: called to the hero\'s side for a few seconds, it shoots at enemies that are awake', () => {
  const g = room('mage', 'wand');
  const h = g.hero;
  assert.equal(h.skills[0].id, 'familiar');
  const m = dummy(g, 4, 0);
  const { ev } = attack(g, 0, 4, 0);
  assert.equal(g.familiars.length, 1);
  assert.equal(ev.filter((e) => e.t === 'familiar').length, 1);
  const q = g.familiars[0];
  assert.ok(Math.hypot(q.x - h.x, q.y - h.y) < 1.5, 'it is at the hero\'s side');
  assert.equal(hurt(m), 0, 'calling it hurts nothing');
  const fight = wait(g, 2.5);
  const shots = fight.filter((e) => e.t === 'familiarShot').length;
  assert.ok(shots >= 2 && shots <= 4, `it shot ${shots} times in 2.5 s (one every ${TUNE.familiarEvery} s)`);
  assert.ok(hurt(m) > 0, 'its bolts hurt');
  // it keeps to the hero as they walk
  const c = emptyControls();
  c.mx = -1;
  wait(g, 1.2, c);
  assert.ok(Math.hypot(q.x - h.x, q.y - h.y) < 1.6, 'it follows');
  // and goes when its time is up
  const end = wait(g, TUNE.familiarLife);
  assert.equal(g.familiars.length, 0, `gone after ${TUNE.familiarLife} s`);
  assert.equal(end.filter((e) => e.t === 'familiarEnd').length, 1);
});

test('Familiar: with nothing awake in sight it holds its fire', () => {
  const g = room('mage', 'wand');
  attack(g, 0, 3, 0);
  // (nor at what is out of its reach: a familiar must not start a fight the player has not chosen)
  const out = dummy(g, SKILLS.familiar.range + 2.5, 0);
  const ev = wait(g, 3);
  assert.equal(ev.filter((e) => e.t === 'familiarShot').length, 0);
  assert.equal(g.projectiles.length, 0);
  assert.equal(hurt(out), 0);
  // one that comes into the open, within its reach, is shot at
  dummy(g, 4, 0);
  const ev2 = wait(g, 1.5);
  assert.ok(ev2.some((e) => e.t === 'familiarShot'));
});

test('Familiar: the one quick attack that waits. A tap while it waits does nothing, and with mana as the limit it costs mana', () => {
  const g = room('mage', 'wand');
  const h = g.hero;
  const s = h.skills[0];
  assert.ok(SKILLS.familiar.cooldown > 0);
  attack(g, 0, 2, 0);
  assert.equal(g.familiars.length, 1);
  assert.equal(s.charges, 0, 'it waits');
  assert.ok(Math.abs(s.cd - s.r.cooldown) < 1e-9);
  assert.equal(s.r.mana, 0, 'with cooldowns as the limit it costs nothing');
  // tapped again at once: nothing
  const again = attack(g, 0, 2, 0);
  assert.equal(g.familiars.length, 1);
  assert.ok(!again.ev.some((e) => e.t === 'familiar'));
  assert.equal(h.windup, null, 'the hero does not even begin');
  // held down, it is called again the moment it is ready, and not before
  const c = emptyControls();
  c.fire = true;
  c.aimX = h.x + 2;
  c.aimY = h.y;
  let t = 0;
  while (g.familiars.length < 2 && t < 6) {
    g.update(DT, c);
    g.events.length = 0;
    t += DT;
  }
  assert.ok(t > s.r.cooldown - 0.6 && t < s.r.cooldown + 0.4, `the second came ${t.toFixed(2)} s later (its cooldown is ${s.r.cooldown.toFixed(2)} s)`);

  // with mana as the limit: a cost, and only a moment between uses
  const m = room('mage', 'wand');
  m.setLimit('mana');
  const hm = m.hero;
  const sm = hm.skills[0];
  assert.ok(sm.r.mana > 0, `it costs ${sm.r.mana} mana`);
  assert.equal(sm.r.cooldown, MANA_MODE.recover);
  const had = hm.mana;
  attack(m, 0, 2, 0);
  assert.equal(m.familiars.length, 1);
  // (the practice room gives mana back fast: so, most of its cost is gone a moment after)
  assert.ok(hm.mana < had - sm.r.mana * 0.6, 'paid when it is called');
  // without the mana for it: no familiar, nothing paid, and the game says why
  ready(m, 0);
  hm.mana = sm.r.mana - 3;
  const poor = attack(m, 0, 2, 0);
  assert.equal(m.familiars.length, 1);
  assert.ok(poor.ev.some((e) => e.t === 'text' && e.text === 'No mana'));
});

test('Familiar: usually two at once, three with the cooldown cut, and never more than three', () => {
  // The owner: "start with the ability to have 3 summoned at a time. You can have 3 up, but more
  // often than not you'll have 2 up until you invest into with cooldown reduction or skill effect
  // duration".
  assert.equal(TUNE.familiarMax, 3);
  const most = (g: Game, seconds: number): { most: number; share2: number; share3: number } => {
    const h = g.hero;
    const c = emptyControls();
    let top = 0;
    let n = 0;
    let two = 0;
    let three = 0;
    for (let t = 0; t < seconds; t += DT) {
      // the player taps whenever it is ready
      c.fire = h.skills[0].charges > 0;
      c.aimX = h.x + 2;
      c.aimY = h.y;
      g.update(DT, c);
      g.events.length = 0;
      top = Math.max(top, g.familiars.length);
      assert.ok(g.familiars.length <= TUNE.familiarMax, 'never more than three');
      if (t > 10) {
        n++;
        if (g.familiars.length >= 2) two++;
        if (g.familiars.length >= 3) three++;
      }
    }
    return { most: top, share2: two / n, share3: three / n };
  };
  const fresh = (): Game => {
    // a mage as they begin (level 1), with a plain wand
    const g = new Game('mage', 4);
    g.depth = 2;
    g.cleared = 1;
    g.enterDungeon();
    g.monsters.length = 0;
    g.hero.gear.mainhand = plainWeapon('wand', 1);
    g.refresh();
    return g;
  };
  const a = most(fresh(), 40);
  assert.ok(a.share2 > 0.85, `two are out most of the time (${(a.share2 * 100).toFixed(0)}%)`);
  assert.ok(a.share3 < 0.5, `three only now and then (${(a.share3 * 100).toFixed(0)}%)`);
  // with a great deal of cooldown recovery, three are out almost always
  const quick = fresh();
  quick.hero.attrs.int += 120;
  quick.refresh();
  assert.ok(quick.hero.skills[0].r.cooldown < SKILLS.familiar.cooldown * 0.75);
  const b = most(quick, 40);
  assert.equal(b.most, 3);
  assert.ok(b.share3 > 0.8, `with the cooldown cut, three are out ${(b.share3 * 100).toFixed(0)}% of the time`);
});

test('Familiar: a fourth takes the place of the oldest', () => {
  const g = room('mage', 'wand');
  // (here the wait between them is waived)
  for (let k = 0; k < 3; k++) {
    ready(g, 0);
    attack(g, 0, 2, 0);
  }
  assert.equal(g.familiars.length, 3);
  assert.deepEqual(g.familiars.map((q) => q.seat).sort(), [0, 1, 2], 'each has its own place round the hero');
  const oldest = g.familiars[0].id;
  ready(g, 0);
  const { ev } = attack(g, 0, 2, 0);
  assert.equal(g.familiars.length, 3);
  assert.ok(!g.familiars.some((q) => q.id === oldest), 'the oldest is the one that went');
  assert.equal(ev.filter((e) => e.t === 'familiarEnd').length, 1);
  assert.deepEqual(g.familiars.map((q) => q.seat).sort(), [0, 1, 2], 'and the new one took its place');
});

// =============================================================================================
// The pictures

test('which animation goes with which attack: the quick one the first, the slow one the second, but the mage thrusts a beam out', () => {
  for (const cls of CLASS_IDS) {
    for (const w of WEAPONS) {
      assert.equal(attackClip(cls, 0, SKILLS[TAP[w]].kind), 0, `${cls} with a ${w}: the quick attack plays the first`);
      // (a whirlwind is the swing carried round, whoever spins; the mage thrusts a beam out)
      const second = w === 'greatsword' || (cls === 'mage' && w === 'wand') ? 0 : 1;
      assert.equal(attackClip(cls, 1, SKILLS[HOLD[w]].kind), second, `${cls} with a ${w}: the slow attack`);
    }
  }
  assert.equal(attackClip('mage', 1, 'orb'), 1, 'an orb is set with the staff brought down on the floor');
  assert.equal(attackClip('mage', 1, 'beam'), 0, 'a beam is fired with the thrust');
  assert.equal(attackClip('mage', 0, 'summon'), 0, 'a familiar is called with a flourish');
  assert.equal(attackClip('mage', 0, 'wave'), 0);
});

// =============================================================================================
// Saves

test('a save from before Version 12 comes back with its weapons brought up to date', () => {
  // a ranger of Version 11.2 who had picked up a mage's wand and a warrior's maul, and stashed an axe
  const g = new Game('ranger', 21);
  const h = g.hero;
  h.level = 6;
  const wand = plainWeapon('wand', 3);
  wand.cls = 'mage';
  const old = (kind: string, tier: number, ilvl: number, cls: ClassId): Item => ({ ...plainWeapon('sword', ilvl), baseId: `${kind}${tier}`, baseName: `Iron ${kind}`, name: `Iron ${kind}`, icon: kind as Item['icon'], weapon: kind as WeaponKind, cls, aps: 0.85, hands: 2 });
  h.bag[0] = wand;
  h.bag[1] = old('maul', 1, 4, 'warrior');
  h.bag[2] = old('longbow', 2, 5, 'ranger');
  const save = JSON.parse(JSON.stringify(g.save()));
  const meta = newMeta();
  meta.stash[0] = old('axe', 3, 12, 'warrior');
  const back = Game.restore(save, cleanMeta(JSON.parse(JSON.stringify(meta))));
  const b = back.hero;
  assert.deepEqual([b.bag[0]!.weapon, b.bag[0]!.cls], ['wand', null], 'the wand is nobody\'s own any more');
  assert.equal(back.useProblem(b.bag[0]!), null, 'the ranger may use it');
  assert.deepEqual([b.bag[1]!.weapon, b.bag[1]!.baseId, b.bag[1]!.hands, b.bag[1]!.cls], ['greatsword', 'greatsword1', 2, null], 'the maul is a two-handed sword');
  assert.deepEqual([b.bag[2]!.weapon, b.bag[2]!.baseId, b.bag[2]!.cls], ['bow', 'bow2', null], 'the longbow is a bow');
  assert.deepEqual([back.meta.stash[0]!.weapon, back.meta.stash[0]!.baseId, back.meta.stash[0]!.cls], ['sword', 'sword3', null], 'the axe in the stash is a sword');
  // and the ranger puts the wand on: Familiar on the tap, Beam on the hold, the roll (Trap) still on the swipe
  assert.equal(back.equipFromBag(0), null);
  assert.deepEqual(b.skills.map((s) => s.id), ['familiar', 'beam', 'trap']);
});

test('a mage saved before Version 12, words on Orb and Nova, comes back with them on Wave and Orb', () => {
  // (the sockets are kept by place: the first attack's, the second attack's)
  const g = new Game('mage', 8);
  const h = g.hero;
  h.level = 6;
  h.words.fire = 1;
  h.words.twin = 1;
  g.refresh();
  assert.equal(g.socket(0, 'front', 'fire'), null);
  assert.equal(g.socket(1, 'behind', 'twin'), null);
  const save = JSON.parse(JSON.stringify(g.save()));
  const back = Game.restore(save);
  assert.deepEqual(back.hero.skills.map((s) => s.r.name), ['Flame Wave', 'Orb of Echoes', 'Warp']);
});

test('a character saved with another class\'s weapon comes back with it, its attacks and its words', () => {
  for (const [cls, w] of [['warrior', 'wand'], ['ranger', 'staff'], ['mage', 'sword'], ['mage', 'bow']] as const) {
    const g = new Game(cls, 31);
    const h = g.hero;
    h.level = 6;
    h.gear.mainhand = plainWeapon(w, 2);
    g.refresh();
    h.words.fire = 2;
    assert.equal(g.socket(0, 'front', 'fire'), null);
    assert.equal(g.socket(1, 'behind', 'fire'), null);
    const names = h.skills.map((s) => s.r.name);
    assert.equal(names[0], `Flame ${SKILLS[TAP[w]].name}`);
    assert.equal(names[1], `${SKILLS[HOLD[w]].name} of Flame`);
    const back = Game.restore(JSON.parse(JSON.stringify(g.save())));
    assert.equal(back.weapon(), w);
    assert.deepEqual(back.hero.skills.map((s) => s.id), [TAP[w], HOLD[w], SWIPE[cls]], `${cls} with a ${w}`);
    assert.deepEqual(back.hero.skills.map((s) => s.r.name), names, 'the words are where they were');
  }
  // with empty hands: the fist and a slam of it, and the class's own swipe
  const bare = new Game('mage', 5);
  bare.hero.gear.mainhand = null;
  bare.refresh();
  assert.deepEqual(bare.hero.skills.map((s) => s.id), ['strike', 'slam', 'warp']);
  const again = Game.restore(JSON.parse(JSON.stringify(bare.save())));
  assert.deepEqual(again.hero.skills.map((s) => s.id), ['strike', 'slam', 'warp']);
});

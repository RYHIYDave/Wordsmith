// The first dungeon teaches as it goes (the guide), the fallen wordsmith and the first word,
// words that are lent to attacks and spent on gear, the trap, poison, Twin's drawback, the two ways of
// limiting the slow abilities, and the Lexicon.
// @ts-ignore - node typings are not part of this project
import { afterEach, test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { botStep, newBot } from '../src/dev/bot';
import { speechPlan, syllables } from '../src/engine/audio';
import { RNG } from '../src/engine/rng';
import { CLASSES, FIRST_WORD, GUIDE, MANA_MODE, MONSTERS, PRACTICE, QUIPS, SKILLS, SLOT_LEVELS, TUNE, WORDS, skillsFor, useFirstLevels } from '../src/game/defs';
import { Game, cleanMeta, newMeta } from '../src/game/game';
import { plainWeapon, rollItem } from '../src/game/items';
import { flowDir, flowField } from '../src/game/nav';
import { emptyControls } from '../src/game/state';
import type { Controls, GameEvent, Monster } from '../src/game/state';
import { CLASS_IDS, WORD_IDS } from '../src/game/types';
import type { ClassId, WeaponKind, WordId } from '../src/game/types';
import { resolveSkill } from '../src/game/words';
import { guideBanner, guideCoach, guideSlot } from '../src/ui/guide';
import { land } from './helpers';

// THE FIRST LEVELS (game/defs.ts, on since Version 19.5) changed the lesson: the abilities open by
// level, the fallen wordsmith's satchel holds the Rune Heart, the first word is given in town and the
// lesson ends there, the first pack is a softball, and the first dungeon is gentler. These tests are
// of the lesson and the words as they were before, and of what the first levels left as it was (the
// words lent to attacks, cooldowns or mana, the Lexicon...), so they run with the first levels off;
// the new lesson is tested in tests/first_levels.test.ts.
useFirstLevels(false);

/** The odds of a word turning up by chance, as the game has them: a test that changes them does not change them for the next. */
const WORD_ODDS = { dropWord: TUNE.dropWord, chestWord: TUNE.chestWord, vaultWord: TUNE.vaultWord };
afterEach(() => {
  Object.assign(TUNE, WORD_ODDS);
});

const DT = 1 / 30;
const RISEN = -7;

type Inner = {
  rng: RNG;
  waveT: number;
  later: unknown[];
  kill: (m: Monster) => void;
  spawn: (k: string, x: number, y: number, pack: number, rank: number, boss: boolean, rng: RNG) => Monster;
  wakeUp: (m: Monster) => void;
  gainXp: (n: number) => void;
  addDrop: (k: string, x: number, y: number, gold: number, item: null, word: WordId) => void;
};
const inner = (g: Game): Inner => g as unknown as Inner;

/** Every word the character owns: in the pouch, and set into attacks. */
const owned = (g: Game): number => {
  let n = 0;
  for (const w of WORD_IDS) n += g.hero.words[w];
  for (const s of g.hero.skills) for (const w of [...s.front, ...s.behind]) if (w) n++;
  return n;
};

/** A practice room with nothing in it: the hero in the middle, facing +x, and no packs of its own. */
function room(cls: ClassId, seed = 3, weapon: WeaponKind | null = null): Game {
  const g = Game.forPractice(cls, seed);
  // (with a weapon out of the practice bag in place of the class's own: any character can use any)
  if (weapon && g.weapon() !== weapon) {
    const i = g.hero.bag.findIndex((it) => it !== null && it.weapon === weapon);
    assert.equal(i >= 0 ? g.equipFromBag(i) : 'not in the bag', null, `a ${cls} puts on a ${weapon}`);
  }
  inner(g).waveT = 1e9;
  g.monsters.length = 0;
  g.hero.x = 14.5;
  g.hero.y = 15.5;
  g.hero.fx = 1;
  g.hero.fy = 0;
  g.events.length = 0;
  return g;
}

const roomWith = room;

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

/**
 * Use an attack once at a point (relative to the hero), then let `seconds` pass. Returns what happened.
 *
 * Since Version 11 an attack lands a moment after it is asked for (its wind-up). The seconds are
 * counted from the step in which it lands, as they were when that was the step it was pressed in:
 * so what the tests below wait for (an arrow's flight, a cloud's first bite, an echo) is waited
 * for as long as before, however long or short the wind-up is.
 */
function use(g: Game, skill: number, dx: number, dy: number, seconds: number): GameEvent[] {
  const h = g.hero;
  const c = emptyControls();
  c.aimX = c.castX = h.x + dx;
  c.aimY = c.castY = h.y + dy;
  if (skill === 0) c.fire = true;
  else c.cast = true;
  const out: GameEvent[] = [];
  const take = (): void => {
    for (const e of g.events) out.push(e);
    g.events.length = 0;
  };
  // (no time at all: nothing is pressed either, as it always was)
  if (seconds <= 0) return out;
  g.update(DT, c);
  c.fire = false;
  c.cast = false;
  take();
  land(g, c, DT, take);
  for (let t = DT; t < seconds; t += DT) {
    g.update(DT, c);
    take();
  }
  return out;
}

// =============================================================================================
// The guide

test('a fresh game starts in the first dungeon, with no word, and with one prompt: how to move', () => {
  for (const cls of CLASS_IDS) {
    const meta = newMeta();
    const g = Game.forFirstRun(cls, 11, meta);
    const h = g.hero;
    assert.ok(g.inDungeon && !g.level.town && g.depth === 1 && g.cleared === 0, 'no town yet: the first dungeon');
    assert.ok(g.guide, 'the prompts are running');
    assert.equal(owned(g), 0, 'a new character has no word');
    assert.equal(g.offer, null, 'and nothing is pressed on them');
    assert.equal(g.guideStep(), 'move');
    assert.deepEqual(g.guideRows(), [], 'nothing about fighting until there is something to fight');
    assert.equal(g.inFight(), false, 'nothing is near the way in');
    for (const touch of [false, true]) {
      const b = guideBanner(g, touch)!;
      assert.equal(b.step, 'move');
      assert.match(b.text, touch ? /LEFT THUMB to MOVE/ : /W A S D to MOVE/);
      assert.equal(b.lines.length, 0);
    }
    // a few steps, and it goes
    const c = emptyControls();
    const x0 = h.x;
    const y0 = h.y;
    const seen: string[] = [];
    for (let i = 0; i < 90 && g.guideStep() === 'move'; i++) {
      // (whichever way is open)
      c.mx = i < 45 ? 1 : -1;
      c.my = 0;
      g.update(DT, c);
      for (const e of g.events) if (e.t === 'guide') seen.push(e.step);
      g.events.length = 0;
    }
    assert.deepEqual(seen, ['move'], 'the prompt is announced once');
    assert.notEqual(g.guideStep(), 'move', 'having walked, the prompt is gone');
    assert.ok(g.guide!.walked >= GUIDE.steps && Math.hypot(h.x - x0, h.y - y0) > 0 === true);
    assert.equal(meta.taught, false, 'the prompts are not over yet');
  }
});

/** Put the hero within sight of the nearest pack of ordinary monsters. Returns one of them. */
function meet(g: Game): Monster {
  const h = g.hero;
  const f = g.level.floor;
  let best: Monster | null = null;
  let bd = Infinity;
  for (const m of g.monsters) {
    if (m.elite || m.boss) continue;
    const d = Math.hypot(m.x - f.start.x, m.y - f.start.y);
    if (d < bd) {
      bd = d;
      best = m;
    }
  }
  const m = best as Monster;
  // a free tile a few steps from it with a clear line to it
  for (let r = 4; r <= 6; r++) {
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2;
      const x = m.x + Math.cos(a) * r;
      const y = m.y + Math.sin(a) * r;
      const ok = g.level.walk[Math.floor(y) * f.w + Math.floor(x)] === 1 && (g as unknown as { sees: (a: number, b: number, c: number, d: number) => boolean }).sees(x, y, m.x, m.y);
      if (ok) {
        h.x = x;
        h.y = y;
        return m;
      }
    }
  }
  throw new Error('no place to stand near the first pack');
}

test('on meeting the first monsters: "tap to ..., tap + hold to ...", each line ticked off by doing it', () => {
  for (const cls of CLASS_IDS) {
    const g = Game.forFirstRun(cls, 12);
    const h = g.hero;
    const c = emptyControls();
    g.guide!.walked = 99;
    const m = meet(g);
    for (let i = 0; i < 6; i++) g.update(DT, c);
    assert.ok(g.guide!.met, 'they have been met');
    assert.ok(g.inFight(), 'and woken');
    assert.equal(g.guideStep(), 'fight');
    assert.deepEqual(g.guideRows(), [{ id: 'quick', done: false }, { id: 'slow', done: false }], 'two lines: the quick attack and the slow one');
    const [quick, slow, evade] = skillsFor(cls, CLASSES[cls].starts);
    const touch = guideBanner(g, true)!;
    assert.deepEqual(touch.lines.map((l) => `${l.how} ${l.what}`), [`TAP to ${SKILLS[quick].verb}`, `TAP + HOLD to ${SKILLS[slow].verb}`], "the owner's words: tap to ..., tap + hold to ...");
    const pc = guideBanner(g, false)!;
    // (with a mouse one click of an attack that goes on while held is a single cut: there it says HOLD)
    assert.deepEqual(pc.lines.map((l) => l.how), ['LEFT CLICK', SKILLS[slow].channel ? 'HOLD RIGHT CLICK' : 'RIGHT CLICK']);
    assert.equal(touch.point, null, 'nothing is pointed at yet');
    // the quick attack
    m.life = m.maxLife = 1e6;
    for (const o of g.monsters) o.cd = 1e9;
    c.aimX = m.x;
    c.aimY = m.y;
    c.fire = true;
    g.update(DT, c);
    c.fire = false;
    // (since Version 11 an attack lands a moment after it is asked for, and the line is ticked
    // when the attack has been made: see tests/windup.test.ts for the rule itself)
    land(g, c, DT);
    g.update(DT, c);
    assert.deepEqual(g.guideRows().map((r) => r.done), [true, false]);
    assert.equal(g.guideStep(), 'fight', 'the other line is still to do');
    // the slow one
    c.cast = true;
    c.castX = m.x;
    c.castY = m.y;
    g.update(DT, c);
    c.cast = false;
    land(g, c, DT);
    g.update(DT, c);
    assert.deepEqual(g.guideRows().map((r) => r.done), [true, true]);
    assert.equal(g.guideStep(), null, 'both done: the prompt goes, though the fight goes on');
    // a couple of blows, and the dodge is pointed out
    g.hurtHero(1, 'phys', [], null, 'a test');
    g.update(DT, c);
    assert.equal(g.guideRows().length, 2, 'one blow: not yet');
    h.invuln = 0;
    g.hurtHero(1, 'phys', [], null, 'a test');
    g.update(DT, c);
    assert.deepEqual(g.guideRows()[2], { id: 'evade', done: false }, `after ${GUIDE.hits} blows, the dodge`);
    assert.equal(g.guideStep(), 'fight');
    const b2 = guideBanner(g, true)!;
    assert.equal(`${b2.lines[2].how} ${b2.lines[2].what}`, `SWIPE to ${SKILLS[evade].verb}`, "the owner's words: swipe to ...");
    assert.equal(b2.point, 'dodge', 'and the dodge itself is pointed at');
    assert.equal(guideBanner(g, false)!.lines[2].how, 'SPACE');
    c.evade = true;
    c.evadeX = h.x - 3 * (m.x - h.x);
    c.evadeY = h.y - 3 * (m.y - h.y);
    g.update(DT, c);
    c.evade = false;
    for (let i = 0; i < 20; i++) g.update(DT, c);
    assert.equal(h.skills[2].uses, 1);
    assert.deepEqual(g.guideRows()[2], { id: 'evade', done: true });
    // low on life, with a flask to drink: the flask is pointed out
    assert.equal(g.guideRows().length, 3);
    h.life = h.d.maxLife * (GUIDE.lowLife - 0.05);
    g.update(DT, c);
    assert.deepEqual(g.guideRows()[3], { id: 'flask', done: false });
    assert.equal(guideBanner(g, true)!.point, 'flask');
    g.usePotion();
    g.update(DT, c);
    assert.deepEqual(g.guideRows()[3], { id: 'flask', done: true });
    assert.equal(g.over, false);
  }
});

test("half way through a character's first dungeon lies a fallen wordsmith, and the satchel holds the class's word", () => {
  for (const cls of CLASS_IDS) {
    for (let seed = 1; seed <= 8; seed++) {
      const meta = newMeta();
      const g = new Game(cls, seed * 7, meta);
      g.enterDungeon();
      const L = g.level;
      const f = L.floor;
      const b = L.body!;
      assert.ok(b && b.kind === 'body' && b.state === 0, 'there is a body, not yet searched');
      assert.equal(b.solid, false, 'it does not block the way');
      assert.equal(L.walk[b.ty * f.w + b.tx], 1, 'it lies on open floor');
      assert.equal(L.props.filter((p) => p.tx === b.tx && p.ty === b.ty).length, 1, 'with nothing else on its tile');
      const rm = f.rooms.find((r) => b.tx >= r.x && b.ty >= r.y && b.tx < r.x + r.w && b.ty < r.y + r.h)!;
      const last = Math.max(...f.rooms.map((r) => r.path));
      assert.ok(rm && rm.path >= 1 && rm.kind !== 'boss', 'in a room on the main path');
      assert.ok(Math.abs(rm.path - last / 2) <= 1, `about half way along it (room ${rm.path} of ${last})`);
      // walking up to it searches it
      const h = g.hero;
      const c = emptyControls();
      g.monsters.length = 0;
      h.potions = 0;
      h.x = b.x + 0.8;
      h.y = b.y;
      g.events.length = 0;
      g.update(DT, c);
      const w = FIRST_WORD[cls].word;
      assert.equal(b.state, 1, 'searched');
      assert.ok(g.bodySearched);
      assert.ok(g.events.some((e) => e.t === 'search'));
      assert.ok(g.events.some((e) => e.t === 'wordDrop' && e.word === w), `${cls}: the word is ${w}`);
      assert.deepEqual(g.drops.filter((d) => d.kind === 'word').map((d) => d.word), [w], 'one word, and no other');
      assert.equal(h.potions, TUNE.potionMax, 'and the satchel had flasks in it');
      // it stands in its light for a moment, then it is taken
      g.update(DT, c);
      assert.equal(h.words[w], 0, 'not at once');
      for (let t = 0; t < TUNE.wordStands + 0.6; t += DT) g.update(DT, c);
      assert.equal(h.words[w], 1, 'the word is taken');
      assert.equal(g.offer, w, 'and offered a place');
      assert.ok(meta.known[w].found, 'the Lexicon knows of it now');
      // searched once: nothing more comes of it
      g.drops.length = 0;
      for (let i = 0; i < 10; i++) g.update(DT, c);
      assert.equal(g.drops.filter((d) => d.kind === 'word').length, 0);
      // it is the first dungeon's: later ones have none
      const later = new Game(cls, seed * 7);
      later.depth = 2;
      later.cleared = 1;
      later.enterDungeon();
      assert.equal(later.level.body, null);
      // and a character who has already searched it finds it empty when they come back
      const back = Game.restore(JSON.parse(JSON.stringify(g.save())), meta);
      assert.ok(back.bodySearched);
      back.enterDungeon();
      assert.equal(back.level.body!.state, 1, 'still there, already searched');
    }
  }
  // the three first words, as the owner chose them
  // (the ranger's Poison goes on Trap, and Trap has been the swipe since Version 12.2: "Let's move the trap on ranger to the tumble")
  assert.deepEqual(FIRST_WORD, { warrior: { word: 'power', skill: 0 }, ranger: { word: 'poison', skill: 2 }, mage: { word: 'fire', skill: 0 } });
});

test('before the body there is no word, so what stands before it hits softer; it is no softer to kill', () => {
  for (const cls of CLASS_IDS) {
    const g = new Game(cls, 31);
    g.enterDungeon();
    const f = g.level.floor;
    const b = g.level.body!;
    const dist = flowField(g.level.walk, f.w, f.h, f.start.x, f.start.y);
    const at = dist[b.ty * f.w + b.tx];
    let before = 0;
    let after = 0;
    for (const m of g.monsters) {
      if (m.elite || m.boss) continue;
      const def = MONSTERS[m.kind];
      const d = dist[Math.floor(m.y) * f.w + Math.floor(m.x)];
      assert.equal(m.maxLife, def.life, 'as tough as any');
      if (d <= at + 80) {
        before++;
        assert.ok(Math.abs(m.dmgMax - def.dmgMax * GUIDE.softDmg) < 1e-9, `${m.name}, before the body, hits at ${GUIDE.softDmg * 100}%`);
      } else {
        after++;
        assert.ok(Math.abs(m.dmgMax - def.dmgMax) < 1e-9, `${m.name}, past the body, hits as hard as ever`);
      }
    }
    assert.ok(before >= 20 && after >= 20, `monsters on both sides of it (${before} before, ${after} after)`);
    // a later dungeon has no soft half
    const later = new Game(cls, 31);
    later.depth = 1;
    later.cleared = 1;
    later.enterDungeon();
    assert.ok(later.monsters.filter((m) => !m.elite && !m.boss).every((m) => Math.abs(m.dmgMax - MONSTERS[m.kind].dmgMax) < 1e-9));
  }
});

test('the word found, the prompt is to put it on an attack: the one the first dungeon suggests for that class', () => {
  for (const cls of CLASS_IDS) {
    const g = Game.forFirstRun(cls, 13);
    const h = g.hero;
    const c = emptyControls();
    const first = FIRST_WORD[cls];
    g.guide!.walked = 99;
    g.monsters.length = 0;
    // a word on the floor
    inner(g).addDrop('word', h.x + 2, h.y, 0, null, first.word);
    g.update(DT, c);
    assert.equal(g.guideStep(), 'take');
    assert.match(guideBanner(g, true)!.text, new RegExp(`A power word: ${WORDS[first.word].name.toUpperCase()}`));
    for (let t = 0; t < TUNE.wordStands + 1; t += DT) g.update(DT, c);
    assert.equal(h.words[first.word], 1);
    assert.equal(g.guideStep(), 'smith');
    const name = SKILLS[h.skills[first.skill].id].name.toUpperCase();
    const b = guideBanner(g, true)!;
    assert.equal(b.caption, 'WORDSMITHING');
    assert.equal(b.text, `Put ${WORDS[first.word].name.toUpperCase()} on ${name}`);
    // (the attack's plate is pointed at. With fingers the evasive move's button is not a thing to
    // tap: the right thumb lives in that corner. So for a word that goes there, the prompt sends a
    // thumb to INVENTORY and points at nothing; a mouse is pointed at the button.)
    assert.equal(b.point, first.skill === 0 ? 'plate0' : first.skill === 1 ? 'plate1' : null, 'and that attack is pointed at');
    assert.equal(guideBanner(g, false)!.point, first.skill === 0 ? 'plate0' : first.skill === 1 ? 'plate1' : 'dodge');
    if (first.skill === 2) assert.match(b.sub, /INVENTORY/);
    else assert.match(b.sub, new RegExp(`Tap ${name} at the bottom`));
    assert.deepEqual(guideSlot(g, first.word), { skill: first.skill, side: 'front', idx: 0 });
    const coach = guideCoach(g, true)!;
    assert.equal(coach.word, first.word);
    assert.deepEqual(coach.to, { skill: first.skill, side: 'front', idx: 0 });
    assert.equal(coach.text, `Drag ${WORDS[first.word].name.toUpperCase()} onto ${name}.`);
    assert.equal(coach.done, false);
    // in a fight the word waits: the prompt says so, and points at nothing
    const m = dummy(g, 3, 0);
    g.update(DT, c);
    assert.equal(g.guideStep(), 'fight', 'the fight comes first');
    g.guide!.quick = g.guide!.slow = true;
    h.skills[0].uses = h.skills[1].uses = 1;
    assert.equal(g.guideStep(), 'smith');
    assert.match(guideBanner(g, true)!.sub, /When the fight is over/);
    assert.equal(guideBanner(g, true)!.point, null);
    m.dead = true;
    g.update(DT, c);
    // any other word found first is suggested for the front of the quick attack
    assert.deepEqual(guideSlot(g, first.word === 'frost' ? 'swift' : 'frost'), { skill: 0, side: 'front', idx: 0 });
  }
  // the ranger's, in the owner's words: "have it prompt to put poison on TRAP"
  const r = Game.forFirstRun('ranger', 5);
  r.hero.words.poison = 1;
  r.guide!.walked = 99;
  r.monsters.length = 0;
  assert.equal(guideBanner(r, true)!.text, 'Put POISON on TRAP');
  assert.equal(guideCoach(r, true)!.text, 'Drag POISON onto TRAP.');
});

test('setting the first word makes the dead rise for it, soft enough to feel the word; then the prompts are over', () => {
  for (const cls of CLASS_IDS) {
    const meta = newMeta();
    const g = Game.forFirstRun(cls, 14, meta);
    const h = g.hero;
    const first = FIRST_WORD[cls];
    g.guide!.walked = 99;
    g.monsters.length = 0;
    h.words[first.word] = 1;
    const bare = resolveSkill(SKILLS[h.skills[0].id], [], [], cls, h.d);
    const bareHit = ((h.d.dmgMin + h.d.dmgMax) / 2) * bare.dmgMult;
    assert.equal(g.placeWord({ skill: first.skill, side: 'front', idx: 0 }, first.word), null);
    assert.equal(g.guideStep(), 'use');
    const sk = h.skills[first.skill];
    for (const touch of [true, false]) {
      const b = guideBanner(g, touch)!;
      const press = first.skill === 2 ? (touch ? 'SWIPE' : 'SPACE') : touch ? (first.skill === 0 ? 'TAP' : 'TAP + HOLD') : first.skill === 0 ? 'LEFT CLICK' : SKILLS[sk.id].channel ? 'HOLD RIGHT CLICK' : 'RIGHT CLICK';
      assert.equal(b.text, `${press}: ${sk.r.name.toUpperCase()}`, 'the banner names the attack as it is now');
      assert.equal(b.sub, WORDS[first.word].frontText);
      assert.equal(b.point, first.skill === 0 ? 'plate0' : first.skill === 1 ? 'plate1' : 'dodge');
    }
    assert.equal(guideCoach(g, true)!.done, true);
    assert.match(guideCoach(g, true)!.text, new RegExp(`^${sk.r.name.toUpperCase()}!`));
    // a moment later the dead rise
    const c = emptyControls();
    const said: string[] = [];
    const steps: string[] = [];
    const take = (): void => {
      for (const e of g.events) {
        if (e.t === 'msg') said.push(e.text);
        else if (e.t === 'guide') steps.push(e.step);
      }
      g.events.length = 0;
    };
    assert.equal(g.monsters.length, 0);
    for (let t = 0; t < 1.2; t += DT) {
      g.update(DT, c);
      take();
    }
    const risen = g.monsters.filter((m) => m.packId === RISEN);
    assert.equal(risen.length, GUIDE.risen, `${GUIDE.risen} of them`);
    assert.ok(said.includes('The dead stir.'));
    const life = Math.max(2, Math.round(bareHit * GUIDE.risenHits));
    for (const m of risen) {
      assert.equal(m.maxLife, life, 'each takes two hits of the attack as it was before the word');
      assert.ok(m.maxLife < MONSTERS.skeleton.life, 'far softer than a dungeon skeleton');
      assert.ok(m.state !== 'sleep' && m.xp === 0 && m.carries.length === 0);
      assert.ok(Math.hypot(m.x - h.x, m.y - h.y) > 2, 'they rise a few steps off, not on top of the hero');
    }
    assert.ok(g.guide, 'the prompts wait for them to be felled');
    // fell them with the attack that has the word, and nothing else
    const uses0 = sk.uses;
    let t = 0;
    for (; t < 60 && g.monsters.some((m) => !m.dead && m.packId === RISEN); t += DT) {
      Object.assign(c, emptyControls());
      let near: Monster | null = null;
      for (const m of g.monsters) if (!m.dead && (!near || Math.hypot(m.x - h.x, m.y - h.y) < Math.hypot(near.x - h.x, near.y - h.y))) near = m;
      if (near) {
        const d = Math.hypot(near.x - h.x, near.y - h.y);
        c.aimX = c.castX = near.x;
        c.aimY = c.castY = near.y;
        if (first.skill === 0) {
          c.fire = true;
          c.approach = true;
        } else if (first.skill === 1) {
          if (d < 2.2) c.cast = true;
        } else if (d < 3) {
          // the evasive move (the ranger's Trap): roll away from what comes, and it walks onto the trap
          c.evade = true;
          c.evadeX = h.x - (near.x - h.x) * 3;
          c.evadeY = h.y - (near.y - h.y) * 3;
        }
      }
      h.life = h.d.maxLife;
      g.update(DT, c);
      take();
    }
    const uses = sk.uses - uses0;
    console.log(`${cls}: ${sk.r.name} felled the ${GUIDE.risen} risen dead in ${uses} uses (${t.toFixed(1)} s); the bare quick attack needs ${GUIDE.risen * 2}`);
    assert.ok(!g.monsters.some((m) => !m.dead && m.packId === RISEN), 'all felled');
    assert.ok(uses >= 1 && uses < GUIDE.risen * 2 - 2, `before and after: far fewer uses than the bare attack would need (${uses})`);
    assert.equal(g.drops.filter((d) => d.kind !== 'orb').length, 0, 'they leave nothing: they were there to be felled');
    // and then, a moment later, it is over
    Object.assign(c, emptyControls());
    assert.ok(g.guide, 'not at once');
    for (let k = 0; k < 90; k++) {
      g.update(DT, c);
      take();
    }
    assert.equal(g.guide, null, 'the prompts are over');
    assert.equal(g.guideStep(), null);
    assert.equal(guideBanner(g, true), null);
    assert.ok(meta.taught, 'and that is remembered: the next character begins in town');
    assert.equal(steps.filter((s) => s === 'done').length, 1);
    assert.equal(owned(g), 1, 'one word, set');
  }
});

test('the first word set in town (or anywhere there is nothing to fight) ends the prompts at once', () => {
  const meta = newMeta();
  const g = Game.forFirstRun('mage', 3, meta);
  g.enterTown();
  g.hero.words.fire = 1;
  assert.equal(g.socket(0, 'front', 'fire'), null);
  assert.equal(g.guide, null);
  assert.ok(meta.taught);
});

test('nobody loses their first character while the prompts are running; after them, death is death', () => {
  for (const cls of CLASS_IDS) {
    const g = Game.forFirstRun(cls, 15);
    const h = g.hero;
    g.events.length = 0;
    g.hurtHero(1e9, 'phys', [], null, 'a test');
    assert.equal(g.over, false, 'knocked down, not out');
    assert.equal(h.life, h.d.maxLife);
    assert.ok(g.events.some((e) => e.t === 'text' && e.text === 'UP AGAIN'));
    assert.equal(g.meta.deaths, 0);
    // the prompts over: an ordinary run
    g.endGuide();
    h.invuln = 0;
    g.hurtHero(1e9, 'phys', [], null, 'a test');
    assert.equal(g.over, true);
    assert.equal(g.slainBy, 'a test');
    // a later character has no such net, first dungeon or not
    const next = new Game(cls, 16, g.meta);
    assert.equal(next.guide, null, 'the prompts were seen through: no more of them');
    next.enterDungeon();
    next.hurtHero(1e9, 'phys', [], null, 'a test');
    assert.equal(next.over, true);
  }
});

/** Walk toward the nearest word lying on the floor, round whatever is in the way. */
function walkToWord(g: Game, c: Controls): void {
  const h = g.hero;
  const L = g.level;
  const f = L.floor;
  let word: { x: number; y: number } | null = null;
  let bd = Infinity;
  for (const d of g.drops) {
    const dist = Math.hypot(d.x - h.x, d.y - h.y);
    if (d.kind === 'word' && dist < bd) {
      bd = dist;
      word = d;
    }
  }
  if (!word) return;
  const v = flowDir(flowField(L.walk, f.w, f.h, Math.floor(word.x), Math.floor(word.y)), L.walk, f.w, f.h, h.x, h.y);
  // (on its tile, or right beside it: straight at it)
  const straight = bd < 1.2 || (v.x === 0 && v.y === 0);
  c.mx = straight ? (bd > 0.05 ? (word.x - h.x) / bd : 0) : v.x;
  c.my = straight ? (bd > 0.05 ? (word.y - h.y) / bd : 0) : v.y;
}

for (const cls of CLASS_IDS) {
  test(`the first dungeon can be played from the first step to the end of its prompts as a ${cls}`, () => {
    const meta = newMeta();
    const g = Game.forFirstRun(cls, 77, meta);
    const c: Controls = emptyControls();
    // A named monster may carry a word of its own, and whoever kills one before reaching the body
    // is prompted about that word instead (tools/scenarios/guide.mjs plays that with EARLY=<word>).
    // This test is about the word in the body, so none of them does. (With the levels of Version
    // 11.1 the warrior's fights on this seed go differently, and one of them gave up FROST first.)
    for (const m of g.monsters) if (!m.boss && m.carries.length) m.carries = [];
    // (nor does a word fall from an ordinary monster or lie in a chest, as now and then one does:
    // the odds are put back after every test, below)
    TUNE.dropWord = TUNE.chestWord = TUNE.vaultWord = 0;
    // (a newcomer does not wordsmith by themselves: the word goes on when the prompt asks for it)
    const bot = newBot(false);
    const steps: string[] = [];
    const said: string[] = [];
    let risen = 0;
    let knocked = 0;
    let setAt = -1;
    const first = FIRST_WORD[cls];
    const take = (): void => {
      for (const e of g.events) {
        if (e.t === 'guide') steps.push(e.step);
        else if (e.t === 'msg') said.push(e.text);
        else if (e.t === 'text' && e.text === 'UP AGAIN') knocked++;
      }
      g.events.length = 0;
    };
    let t = 0;
    /** Was a fight on when the body was searched? */
    let fightAtBody = false;
    for (; t < 600 && g.guide; t += DT) {
      const searched = g.bodySearched;
      const fighting = g.inFight();
      botStep(g, c, bot, DT);
      // A newcomer does what the prompts say, and the bot does not read them. Shown a word lying
      // on the floor ("A power word: ..."), they walk to it. The bot by itself walks on the moment
      // the body is searched, while the word still stands in its light, and has it only if a
      // fight happens to keep it near: that held on this seed until the wind-up of Version 11
      // changed how its fights went (the warrior then never took Power, and went through the
      // second half of the dungeon without a word).
      if (g.guideStep() === 'take' && !g.inFight()) walkToWord(g, c);
      if (g.guideStep() === 'smith' && !g.inFight()) {
        const w = WORD_IDS.find((x) => g.hero.words[x] > 0) as WordId;
        assert.equal(g.placeWord(guideSlot(g, w), w), null, 'the word goes where the prompt says');
        setAt = t;
      }
      g.update(DT, c);
      if (!searched && g.bodySearched) fightAtBody = fighting;
      risen = Math.max(risen, g.monsters.filter((m) => m.packId === RISEN).length);
      take();
      assert.equal(g.over, false, 'nobody dies while the prompts are running');
      for (const v of [g.hero.x, g.hero.y, g.hero.life, g.hero.mana]) assert.ok(Number.isFinite(v));
    }
    take();
    const order = ['move', 'fight', 'smith', 'use', 'done'].map((s) => steps.indexOf(s));
    console.log(`${cls}: the prompts ran ${Math.round(t)} s (the word was set at ${Math.round(setAt)} s, after ${g.kills - GUIDE.risen} kills); knocked down ${knocked} times; steps: ${[...new Set(steps)].join(' > ')}`);
    assert.ok(order.every((i) => i >= 0), `every prompt was shown: ${steps.join(', ')}`);
    assert.deepEqual([...order].sort((a, b) => a - b), order, 'in the order the owner asked for: move, fight, the word, use it');
    assert.equal(steps.filter((s) => s === 'done').length, 1);
    // The body, or the word standing over it, is pointed out when there is a quiet moment for it:
    // no prompt but the fight's own is shown in a fight. A hero who comes to the body in the middle
    // of one searches it all the same (it is searched by being walked up to), takes the word as
    // the fight goes on, and is told about it when the fight is over. (With the levels of Version
    // 11.1 the warrior's first fights last longer, and on this seed that is what happens.)
    assert.ok(steps.includes('body') || steps.includes('take') || fightAtBody, 'the body, or the word on the floor, was pointed out (unless the hero came to it in the middle of a fight)');
    assert.equal(g.guide, null);
    assert.ok(meta.taught);
    assert.ok(g.bodySearched, 'the word came from the fallen wordsmith');
    assert.ok(said.some((s) => /fallen wordsmith/.test(s)) && said.includes('The dead stir.'));
    assert.equal(risen, GUIDE.risen);
    assert.ok(g.hero.skills[first.skill].front.includes(first.word), `${first.word} is on ${g.hero.skills[first.skill].r.name}`);
    assert.ok(g.inDungeon && g.depth === 1, 'and the dungeon goes on');
    assert.ok(t < 420, `it does not drag (${Math.round(t)} s)`);
    assert.ok(setAt > 20, 'the word is not handed over at the door: there is a "before"');
    assert.ok(knocked <= 2, `a newcomer is not flattened on the way (${knocked} times)`);
  });
}

test('the prompts are saved with the character, and carry on from where they were', () => {
  const meta = newMeta();
  const g = Game.forFirstRun('ranger', 21, meta);
  const G = g.guide!;
  G.walked = 40;
  G.met = true;
  G.hits = 3;
  G.quick = true;
  g.hero.words.poison = 1;
  const back = Game.restore(JSON.parse(JSON.stringify(g.save())), cleanMeta(JSON.parse(JSON.stringify(meta))));
  assert.ok(back.guide, 'still running');
  assert.deepEqual([back.guide!.walked, back.guide!.met, back.guide!.hits, back.guide!.quick, back.guide!.slow], [40, true, 3, true, false]);
  assert.equal(back.offer, 'poison', 'and the word that was waiting is offered again');
  assert.equal(back.guideStep(), 'smith');
  // once the word has been set there is nothing left to show: such a save comes back without prompts
  assert.equal(g.placeWord({ skill: FIRST_WORD.ranger.skill, side: 'front', idx: 0 }, 'poison'), null);
  assert.equal(g.hero.skills[2].r.name, 'Poison Trap');
  const meta2 = cleanMeta(JSON.parse(JSON.stringify(meta)));
  const done = Game.restore(JSON.parse(JSON.stringify(g.save())), meta2);
  assert.equal(done.guide, null);
  assert.ok(meta2.taught);
  // a character who never had prompts gets none on coming back
  const old = new Game('warrior', 5);
  assert.equal(Game.restore(JSON.parse(JSON.stringify(old.save()))).guide, null);
});

// =============================================================================================
// Words on attacks are lent, not spent

test('a word on an attack is only lent to it: it can be taken out again, and a word set in its place sends it back to the pouch', () => {
  // The owner first had every word used up wherever it went, then thought again: "i think you
  // were right about the words being able to be removed from the skills. if skills are going to
  // change with gear and weapons, the word should be removable. using a word to modify a stat on
  // an item should still use up the word". (Gear and dungeons: see the economy and town tests.)
  const meta = newMeta();
  const g = new Game('warrior', 4, meta);
  const h = g.hero;
  h.words.power = 1;
  h.words.fire = 1;
  h.words.frost = 1;
  h.words.swift = 2;
  assert.equal(owned(g), 5);
  const front0 = { skill: 0, side: 'front', idx: 0 } as const;
  const behind0 = { skill: 0, side: 'behind', idx: 0 } as const;
  assert.equal(g.placeProblem(front0, 'power'), null);
  assert.equal(g.displaced(front0), null, 'an empty socket: no word comes back by filling it');
  g.events.length = 0;
  assert.equal(g.placeWord(front0, 'power'), null);
  assert.equal(h.skills[0].r.name, 'Power Strike');
  assert.equal(h.words.power, 0, 'the word has left the pouch');
  assert.deepEqual(g.events.filter((e) => e.t === 'worded').map((e) => (e.t === 'worded' ? [e.word, e.name, e.skill, e.side] : null)), [['power', 'Power Strike', 0, 'front']]);
  // it can be taken out again
  assert.equal(g.unsocket(0, 'front', 0), null);
  assert.equal(h.skills[0].front[0], null);
  assert.equal(h.skills[0].r.name, 'Strike');
  assert.equal(h.words.power, 1, 'and is a spare word once more');
  assert.equal(g.unsocket(0, 'front', 0), 'Nothing there');
  // and put on the other attack instead
  assert.equal(g.placeWord({ skill: 1, side: 'front', idx: 0 }, 'power'), null);
  // (the warrior begins with the two-handed sword, whose slow attack is the whirlwind)
  assert.equal(h.skills[1].r.name, 'Power Whirlwind');
  assert.equal(g.unsocket(1, 'front', 0), null);
  assert.equal(g.placeWord(front0, 'power'), null);
  // a new word in its place sends it back to the pouch
  assert.equal(g.displaced(front0), 'power', 'the screen can say which word would come back');
  assert.equal(g.placeWord(front0, 'fire'), null);
  assert.equal(h.skills[0].r.name, 'Flame Strike');
  assert.equal(h.words.power, 1, 'Power went back to the pouch');
  assert.equal(owned(g), 5, 'nothing is lost by trying words on attacks');
  // the rules of a side still hold, counting the word that would be replaced as gone
  assert.equal(g.placeWord(behind0, 'swift'), null);
  assert.equal(g.placeProblem(behind0, 'swift'), 'Already there');
  assert.equal(g.placeProblem(front0, 'frost'), null, 'one element may replace another');
  assert.equal(g.placeProblem({ skill: 0, side: 'front', idx: 1 }, 'frost'), 'No socket there', 'the second socket opens at level 5');
  // (the evasive move takes words as the attacks do, since Version 12.2: "We also need to give the swipe abilities the option for words")
  assert.equal(g.placeProblem({ skill: 2, side: 'front', idx: 0 }, 'frost'), null, 'the evasive move takes words too');
  assert.equal(g.placeProblem({ skill: 2, side: 'front', idx: 1 }, 'frost'), 'No socket there', 'and its second socket opens at level 5, as theirs do');
  assert.equal(g.placeProblem(front0, 'leech'), 'No spare word');
  while (h.level < SLOT_LEVELS.front) inner(g).gainXp(60);
  const front1 = { skill: 0, side: 'front', idx: 1 } as const;
  assert.equal(g.placeProblem(front1, 'frost'), 'One damage word per side');
  assert.equal(g.placeProblem(front1, 'fire'), 'No spare word');
  h.words.fire = 1;
  assert.equal(g.placeProblem(front1, 'fire'), 'Already there');
  assert.equal(g.placeProblem(front1, 'swift'), null);
  // nothing refused changed anything
  assert.deepEqual(h.skills[0].front, ['fire', null]);
  assert.deepEqual(h.skills[0].behind, ['swift']);
  assert.equal(h.words.swift, 1);
  // the Lexicon has learned each use
  assert.deepEqual([meta.known.power.front, meta.known.fire.front, meta.known.swift.behind, meta.known.swift.front, meta.known.frost.front], [true, true, true, false, false]);
  // a save keeps what is set, and it can still be taken out afterwards
  const back = Game.restore(JSON.parse(JSON.stringify(g.save())), meta);
  assert.deepEqual(back.hero.skills[0].front, ['fire', null]);
  assert.equal(back.unsocket(0, 'front', 0), null);
  assert.equal(back.hero.words.fire, 2);
  assert.equal(back.hero.skills[0].r.name, 'Strike of Swiftness');
});

test('the practice room: words move as they do everywhere, and nothing done there teaches the Lexicon anything', () => {
  const g = Game.forPractice('mage', 2);
  const h = g.hero;
  const n = owned(g);
  assert.equal(g.socket(0, 'front', 'fire'), null);
  assert.equal(g.placeWord({ skill: 0, side: 'front', idx: 0 }, 'frost'), null);
  assert.equal(h.words.fire, PRACTICE.words, 'the word it replaced went back to the pouch');
  assert.equal(g.unsocket(0, 'front', 0), null, 'and a word can be taken out again');
  assert.equal(h.words.frost, PRACTICE.words);
  assert.equal(owned(g), n);
  assert.equal(g.unsocket(0, 'front', 0), 'Nothing there');
  assert.ok(WORD_IDS.every((w) => !g.meta.known[w].front && !g.meta.known[w].found));
});

// The owner, 5 Oct 2026, 22:51: "After you get your first power word and equip it, the game
// doesn't need to stop and open the inventory again whenever a word is picked up". (`offer` is
// what makes the interface stop the game at the next quiet moment and open the inventory.)
test("a character's first word is offered a place; once a word is at work, a word found is only picked up", () => {
  const c = emptyControls();
  const drop = (g: Game, w: WordId): void => {
    inner(g).addDrop('word', g.hero.x, g.hero.y, 0, null, w);
    for (let i = 0; i < 60; i++) g.update(DT, c);
  };
  // a new player's first character (the guide is running), and a later character (no guide): the same rule
  for (const [who, g] of [['a new player', Game.forFirstRun('warrior', 4)], ['a later character', new Game('warrior', 4)]] as const) {
    if (!g.guide) g.enterDungeon();
    g.monsters.length = 0;
    assert.equal(g.offer, null, `${who}: a new character has no word, and nothing is on offer`);
    assert.equal(g.wordAtWork(), false);
    drop(g, 'swift');
    assert.equal(g.hero.words.swift, 1);
    assert.equal(g.offer, 'swift', `${who}: the first word is offered a place`);
    assert.ok(g.events.some((e) => e.t === 'wordGot' && e.word === 'swift'));
    // not yet set, and another is found: that one is offered too (nothing is at work yet)
    g.offer = null;
    drop(g, 'fire');
    assert.equal(g.offer, 'fire', `${who}: and so is a second, while the first lies unused`);
    // the first word is set: from now on a word found is a word in the pouch, and no more
    g.offer = null;
    assert.equal(g.socket(0, 'front', 'swift'), null);
    assert.equal(g.wordAtWork(), true, `${who}: a word is at work`);
    g.events.length = 0;
    drop(g, 'leech');
    assert.equal(g.hero.words.leech, 1, `${who}: the next word is picked up`);
    assert.ok(g.events.some((e) => e.t === 'wordGot' && e.word === 'leech'), 'and the screen is told (WORD FOUND)');
    assert.equal(g.placeable('leech'), true, 'it has somewhere to go');
    assert.equal(g.offer, null, `${who}: but the game does not stop for it`);
  }
  // a word burned into a piece of gear is a word at work too
  const g = new Game('warrior', 4);
  g.enterDungeon();
  g.monsters.length = 0;
  const h = g.hero;
  assert.ok(h.gear.mainhand, 'a warrior has a blade');
  if (h.gear.mainhand) h.gear.mainhand.imbues.push({ word: 'fire', kind: 'prefix', mods: [] });
  assert.equal(g.wordAtWork(), true);
  drop(g, 'swift');
  assert.equal(g.offer, null, 'burned into the blade: the next word found does not stop the game');
  // and a word with nowhere to go was never offered
  const full = new Game('warrior', 4);
  full.enterDungeon();
  full.monsters.length = 0;
  for (const w of ['fire', 'leech', 'power', 'frost', 'poison', 'swift'] as const) full.hero.words[w] = 1;
  assert.equal(full.socket(0, 'front', 'fire'), null);
  assert.equal(full.socket(0, 'behind', 'power'), null);
  assert.equal(full.socket(1, 'front', 'swift'), null);
  assert.equal(full.socket(1, 'behind', 'leech'), null);
  assert.equal(full.socket(2, 'front', 'frost'), null);
  assert.equal(full.socket(2, 'behind', 'poison'), null);
  assert.equal(full.placeable('twin'), false, 'every socket is full');
  drop(full, 'twin');
  assert.equal(full.hero.words.twin, 1);
  assert.equal(full.offer, null);
});

test('a new socket at levels 5 and 10 is announced, and a spare word that fits is offered a place', () => {
  const g = new Game('warrior', 12);
  const h = g.hero;
  const a = inner(g);
  for (const w of ['power', 'fire', 'swift', 'twin', 'leech', 'frost', 'poison'] as const) h.words[w] = 1;
  assert.equal(g.socket(0, 'front', 'power'), null);
  assert.equal(g.socket(0, 'behind', 'fire'), null);
  assert.equal(g.socket(1, 'front', 'swift'), null);
  assert.equal(g.socket(1, 'behind', 'twin'), null);
  assert.equal(g.socket(2, 'front', 'frost'), null);
  assert.equal(g.socket(2, 'behind', 'poison'), null);
  assert.equal(g.placeable('leech'), false, 'every socket is full');
  g.offer = null;
  g.events.length = 0;
  while (h.level < SLOT_LEVELS.front - 1) a.gainXp(50);
  assert.equal(h.skills[0].front.length, 1, `not before level ${SLOT_LEVELS.front}`);
  while (h.level < SLOT_LEVELS.front) a.gainXp(50);
  assert.deepEqual([SLOT_LEVELS.front, SLOT_LEVELS.behind], [5, 10], 'the levels the owner asked for');
  assert.equal(h.skills[0].front.length, 2, 'a second socket in front');
  assert.ok(g.events.some((e) => e.t === 'msg' && /IN FRONT/.test(e.text)), 'said so');
  assert.equal(g.offer, 'leech', 'the spare word is offered the new place');
  g.offer = null;
  g.events.length = 0;
  while (h.level < SLOT_LEVELS.behind - 1) a.gainXp(100);
  assert.equal(h.skills[0].behind.length, 1, `not before level ${SLOT_LEVELS.behind}`);
  assert.ok(!g.events.some((e) => e.t === 'msg' && /BEHIND/.test(e.text)));
  while (h.level < SLOT_LEVELS.behind) a.gainXp(100);
  assert.equal(h.skills[0].behind.length, 2);
  assert.ok(g.events.some((e) => e.t === 'msg' && /BEHIND/.test(e.text)));
  assert.equal(g.offer, 'leech');
});

test('the evasive move never fizzles because the pointer rests on the hero', () => {
  for (const cls of CLASS_IDS) {
    for (const off of [0, 0.2, 0.45, 0.6]) {
      const g = room(cls, 21);
      const h = g.hero;
      const c = emptyControls();
      // the pointer is on the hero, or right beside them
      c.evade = true;
      c.evadeX = h.x + off;
      c.evadeY = h.y + off;
      const x0 = h.x;
      const y0 = h.y;
      g.update(DT, c);
      Object.assign(c, emptyControls());
      for (let i = 0; i < 30; i++) g.update(DT, c);
      assert.equal(h.skills[2].uses, 1, `${cls}, pointer ${off} away: the move was made`);
      assert.ok(Math.hypot(h.x - x0, h.y - y0) > 1.5, `${cls}, pointer ${off} away: and it went somewhere (${Math.hypot(h.x - x0, h.y - y0).toFixed(2)} tiles)`);
    }
  }
});

// =============================================================================================
// The trap

test('the trap is laid by the ranger\'s roll, armed almost at once, and it bursts when a monster steps on it', () => {
  // The owner, of the trap (Version 9): "very small trigger time to arm it, then when a mob walks
  // on it it explodes." And of where it comes from (4 Oct 2026, 20:02): "Let's move the trap on
  // ranger to the tumble. When you tumble you lay a trap". (tests/swipes.test.ts has the rest.)
  const g = room('ranger');
  const h = g.hero;
  const x0 = h.x;
  const y0 = h.y;
  const c = emptyControls();
  c.evade = true;
  c.evadeX = h.x - 4;
  c.evadeY = h.y;
  g.update(DT, c);
  c.evade = false;
  assert.equal(g.traps.length, 1, 'laid in the step the roll begins');
  const tr = g.traps[0];
  assert.ok(Math.abs(tr.x - x0) < 0.01 && Math.abs(tr.y - y0) < 0.01, 'where the ranger stood');
  assert.ok(g.events.some((e) => e.t === 'trapSet'), 'the effects are told of it');
  assert.ok(TUNE.trapArm <= 0.15, 'a very small time to arm');
  // with nothing near, it arms and waits
  for (let t = 0; t < 2; t += DT) g.update(DT, c);
  assert.equal(g.traps.length, 1);
  assert.ok(tr.arm <= 0);
  assert.ok(h.x < x0 - 2.5, 'and the ranger is well away from it');
  // something a step and a half away does not set it off; something that walks onto it does
  const m = dummy(g, 0, 0);
  m.x = x0 + 1.6;
  m.y = y0;
  for (let t = 0; t < 1; t += DT) g.update(DT, c);
  assert.equal(g.traps.length, 1, 'a monster beside it is not on it');
  g.events.length = 0;
  m.x = tr.x + 0.5;
  g.update(DT, c);
  assert.equal(g.traps.length, 0, 'stepped on: it goes off');
  assert.ok(g.events.some((e) => e.t === 'burst' && e.style === 'blast'));
  assert.ok(m.life < m.maxLife, 'and hurts what stepped on it');
  // laid at something's feet, it goes off as soon as it has armed, and not before
  const g2 = room('ranger');
  const m2 = dummy(g2, 0.8, 0);
  const c2 = emptyControls();
  c2.evade = true;
  c2.evadeX = g2.hero.x - 4;
  c2.evadeY = g2.hero.y;
  g2.update(DT, c2);
  c2.evade = false;
  assert.equal(g2.traps.length, 1, 'laid');
  assert.equal(m2.life, m2.maxLife, 'nothing happens in the step it is laid');
  let burstAt = -1;
  for (let t = DT; t < 1.5 && burstAt < 0; t += DT) {
    g2.update(DT, c2);
    if (g2.traps.length === 0) burstAt = t;
  }
  assert.ok(burstAt > 0 && Math.abs(burstAt - TUNE.trapArm) < 0.06, `it burst ${burstAt.toFixed(2)} s after it was laid (arming takes ${TUNE.trapArm} s)`);
  assert.ok(m2.life < m2.maxLife);
});

// =============================================================================================
// Poison

test('Poison in front: a softer hit that poisons; doses add up, and each new one starts the time again', () => {
  const g = room('ranger');
  const h = g.hero;
  assert.equal(g.socket(0, 'front', 'poison'), null);
  const r = h.skills[0].r;
  const bare = resolveSkill(SKILLS.shot, [], [], 'ranger', h.d);
  assert.ok(Math.abs(r.dmgMult - bare.dmgMult * 0.8) < 1e-9, 'the hit is a fifth softer: the word takes as well as gives');
  assert.ok(r.poison > 0.2 && r.poison < 0.6);
  assert.equal(r.name, 'Poison Shot');
  const m = dummy(g, 3, 0);
  let ev = use(g, 0, 3, 0, 0.45);
  const direct = ev.find((e) => e.t === 'hit' && !e.onHero && !e.poison);
  assert.ok(direct && direct.t === 'hit');
  const hit = direct && direct.t === 'hit' ? direct.amount : 0;
  assert.ok(ev.some((e) => e.t === 'poisoned'), 'it takes hold');
  assert.equal(m.poisonN, 1);
  assert.ok(Math.abs(m.poisonDps - hit * r.poison) < 1e-9, 'one dose: its share of the hit, every second');
  assert.ok(m.poisonT > TUNE.poisonTime - 0.6 && m.poisonT <= TUNE.poisonTime);
  // it works: twice a second, in whole numbers, marked as poison
  const life0 = m.life;
  ev = use(g, 1, -9, -9, 0).concat([]);
  const c = emptyControls();
  const ticks: number[] = [];
  for (let t = 0; t < 1.02; t += DT) {
    g.update(DT, c);
    for (const e of g.events) if (e.t === 'hit' && e.poison) ticks.push(e.amount);
    g.events.length = 0;
  }
  assert.ok(ticks.length >= 2 && ticks.length <= 3, `about two a second (${ticks.length})`);
  assert.ok(ticks.every((n) => n === Math.max(1, Math.round(m.poisonDps * 0.5))));
  assert.equal(life0 - m.life, ticks.reduce((a, b) => a + b, 0));
  // a second hit: a second dose, and the time starts again
  use(g, 0, 3, 0, 0.45);
  assert.equal(m.poisonN, 2);
  assert.ok(m.poisonDps > hit * r.poison * 1.5);
  assert.ok(m.poisonT > TUNE.poisonTime - 0.6);
  // it stops adding up at the limit
  for (let k = 0; k < TUNE.poisonStacks + 3; k++) use(g, 0, 3, 0, 0.9);
  assert.equal(m.poisonN, TUNE.poisonStacks, `${TUNE.poisonStacks} doses at most`);
  // and left alone, it wears off
  for (let t = 0; t < TUNE.poisonTime + 0.2; t += DT) g.update(DT, c);
  assert.ok(m.poisonT <= 0 && m.poisonN === 0 && m.poisonDps === 0);
  // what poison kills is the attack's kill
  const weak = dummy(g, 3, 1.5, 1e7);
  use(g, 0, 3, 1.5, 0.45);
  assert.ok(weak.poisonT > 0);
  weak.life = 1;
  const k0 = g.kills;
  for (let t = 0; t < 1; t += DT) g.update(DT, c);
  assert.ok(weak.dead && g.kills === k0 + 1);
});

test('Poison behind (of Venom): a cloud hangs where the attack hit, and poisons what stands in it', () => {
  for (const cls of CLASS_IDS) {
    const g = room(cls);
    const h = g.hero;
    assert.equal(g.socket(1, 'behind', 'poison'), null);
    const sk = h.skills[1];
    assert.match(sk.r.name, / of Venom$/);
    assert.ok(sk.r.cloud > 0 && sk.r.poison === 0);
    const kind = SKILLS[sk.id].kind;
    const at = kind === 'burst' || kind === 'whirl' ? 1.4 : 2.5;
    const inside = dummy(g, at, 0);
    const outside = dummy(g, at + 6, 0);
    const ev = use(g, 1, at, 0, 2);
    const zone = ev.find((e) => e.t === 'zone' && e.kind === 'venom');
    assert.ok(zone, `${cls}: the cloud is left`);
    assert.ok(inside.poisonT > 0 && inside.poisonDps > 0, 'what stands in it is poisoned');
    assert.ok(ev.some((e) => e.t === 'hit' && e.poison && Math.abs(e.x - inside.x) < 0.01), 'and the poison works');
    assert.equal(outside.poisonT, 0, 'what stands outside it is not');
    assert.ok(g.zones.some((z) => z.kind === 'venom'), 'it hangs there for a while');
    const c = emptyControls();
    // (a familiar goes on shooting for as long as it lasts, and every bolt that lands renews its cloud)
    for (let t = 0; t < (kind === 'summon' ? TUNE.familiarLife + 6 : 5); t += DT) g.update(DT, c);
    assert.ok(!g.zones.some((z) => z.kind === 'venom'), 'and then it is gone');
    assert.equal(h.poisonT, 0, 'the hero\'s own cloud does the hero no harm');
  }
});

test('a monster with Poison poisons the hero: most of the blow again, over the next few seconds', () => {
  const g = new Game('warrior', 5);
  g.enterDungeon();
  g.monsters.length = 0;
  const h = g.hero;
  const life0 = h.life;
  g.hurtHero(10, 'phys', ['poison'], null, 'a Poison Skeleton');
  const blow = life0 - h.life;
  assert.ok(h.poisonT > 0 && h.poisonDps > 0);
  const c = emptyControls();
  const regen = h.d.lifeRegen;
  const l1 = h.life;
  let ticks = 0;
  for (let t = 0; t < TUNE.poisonTime + 0.5; t += DT) {
    g.update(DT, c);
    for (const e of g.events) if (e.t === 'hit' && e.onHero && e.poison) ticks++;
    g.events.length = 0;
  }
  const lost = l1 - h.life + regen * (TUNE.poisonTime + 0.5);
  assert.ok(ticks >= 6, `it works on the hero for a while (${ticks} ticks)`);
  assert.ok(lost > blow * 0.3 && lost < blow * 1.2, `about ${Math.round((lost / blow) * 100)}% of the blow again`);
  assert.ok(h.poisonT <= 0, 'and wears off');
  // without the word, nothing
  g.hurtHero(10, 'phys', [], null, 'a Skeleton');
  assert.ok(h.poisonT <= 0);
  assert.match(WORDS.poison.monsterText, /Poisons you/);
});

// =============================================================================================
// Twin's drawback

test('Twin: two arrows, each weaker, and no enemy takes both of the same shot', () => {
  // The owner: "splitting adds more projectiles but reduces damage. i dont want splitting to
  // suddenly double your damage if youre shotgunning enemies with a bow at close range".
  const hits = (ev: GameEvent[], m: Monster): number[] => ev.filter((e) => e.t === 'hit' && !e.onHero && !e.poison && Math.abs(e.x - m.x) < 0.01 && Math.abs(e.y - m.y) < 0.01).map((e) => (e.t === 'hit' ? e.amount : 0));
  // (And since Version 12 the staff's wave and the wand's beam, which are not arrows, keep the
  // same rule: a Twin pair of waves fans apart, a Twin pair of beams runs side by side, and one
  // enemy takes only one of the pair.)
  for (const [cls, weapon, slot] of [['ranger', 'bow', 0], ['mage', 'staff', 0], ['mage', 'wand', 1]] as const) {
    const room = (c: ClassId): Game => roomWith(c, 3, weapon);
    // (an attack that waits between uses is made ready again: the wait is not what is being tested)
    const again = (g: Game): void => {
      g.hero.skills[slot].charges = 1;
      g.hero.skills[slot].cd = 0;
    };
    const what = `${cls} with a ${weapon}`;
    // the bare shot, for comparison
    const g0 = room(cls);
    const m0 = dummy(g0, 1.2, 0);
    const bare = hits(use(g0, slot, 1.2, 0, 1), m0);
    assert.equal(bare.length, 1);
    const st = g0.hero.d;
    const top = st.dmgMax * g0.hero.skills[slot].r.dmgMult * (1 + st.critMult / 100);
    // point blank, one enemy: one arrow of the pair hits it, and for less than a bare shot can
    const g = room(cls);
    assert.equal(g.socket(slot, 'front', 'twin'), null);
    const r = g.hero.skills[slot].r;
    assert.ok(r.count === 2 && r.countDmg <= 0.8, 'two, each at most four fifths of one');
    const m = dummy(g, 1.2, 0);
    for (let k = 0; k < 6; k++) {
      again(g);
      const ev = use(g, slot, 1.2, 0, 1);
      const got = hits(ev, m);
      assert.equal(got.length, 1, `${what}: at arm's length the enemy takes one of the two (it took ${got.length})`);
      assert.ok(got[0] <= Math.ceil(top * r.countDmg), `and that one is the weaker for it (${got[0]})`);
    }
    // two enemies side by side: one each
    const g2 = room(cls);
    assert.equal(g2.socket(slot, 'front', 'twin'), null);
    const a = dummy(g2, 3, 0.35);
    const b = dummy(g2, 3, -0.35);
    const ev2 = use(g2, slot, 3, 0, 1.2);
    assert.deepEqual([hits(ev2, a).length, hits(ev2, b).length], [1, 1], `${what}: side by side, each takes one: that is what the second arrow is for`);
    // with a word that bursts on contact as well: still no enemy is hurt twice by one shot
    const g3 = room(cls);
    assert.equal(g3.socket(slot, 'front', 'twin'), null);
    assert.equal(g3.socket(slot, 'front', 'frost'), null);
    if (weapon === 'bow') assert.ok(g3.hero.skills[slot].r.splash > 0 && g3.hero.skills[slot].r.splashDmg === 1, 'Frost bursts on contact, at full strength');
    const p = dummy(g3, 1.3, 0);
    const q = dummy(g3, 2.0, 0.3);
    const ev3 = use(g3, slot, 1.3, 0, 1.2);
    assert.ok(hits(ev3, p).length === 1 && hits(ev3, q).length === 1, `${what}: Twin Frost: one hurt each from the pair, bursts and all (${hits(ev3, p).length}, ${hits(ev3, q).length})`);
    // the echo is another use: it may hit again
    const g4 = room(cls);
    assert.equal(g4.socket(slot, 'behind', 'twin'), null);
    const e4 = dummy(g4, 1.5, 0);
    // (the echo of a beam is a phantom's beam, which bites a few times: tests/channel.test.ts)
    const both = hits(use(g4, slot, 1.5, 0, 2.6), e4).length;
    if (weapon === 'wand') assert.ok(both >= 3 && both <= 5, `${what}: the beam's one bite and its echo's few (${both})`);
    else assert.equal(both, 2, `${what}: a shot and its echo both land`);
  }
  // a blade is not a volley: Twin Strike cuts the same enemy twice, each cut weaker
  const w = room('warrior');
  assert.equal(w.socket(0, 'front', 'twin'), null);
  const t = dummy(w, 1.1, 0);
  assert.equal(hits(use(w, 0, 1.1, 0, 1), t).length, 2);
  assert.ok(w.hero.skills[0].r.countDmg <= 0.8);
});

// =============================================================================================
// Mana or cooldowns

test('cooldowns or mana, never both: with cooldowns nothing costs mana; with mana nothing waits', () => {
  // The owner: "either you give the player agency to use abilities until their mana runs out
  // and needs to regen or you have cooldowns to limit spamming strong abilities. both is overkill."
  for (const cls of CLASS_IDS) {
    const meta = newMeta();
    assert.equal(meta.limit, 'cooldown', 'cooldowns to begin with');
    const g = new Game(cls, 6, meta);
    const h = g.hero;
    // (counted in uses, so with a slow attack that is made once: the warrior carries the
    // one-handed sword here. What a held attack costs is in tests/channel.test.ts.)
    if (SKILLS[h.skills[1].id].channel) {
      h.gear.mainhand = plainWeapon('sword', 1);
      g.refresh();
    }
    const c = emptyControls();
    const [quick, slow, evade] = h.skills;
    assert.deepEqual([quick.r.mana, slow.r.mana, evade.r.mana], [0, 0, 0], `${cls}: nothing costs mana`);
    assert.ok(slow.r.cooldown > 2 && evade.r.cooldown > 2, 'the slow ability and the evasive move wait between uses');
    // use the slow one for six seconds
    const casts = (): number => {
      const n0 = slow.uses;
      for (let t = 0; t < 6; t += DT) {
        c.cast = true;
        c.castX = h.x + 1.5;
        c.castY = h.y;
        g.update(DT, c);
        g.events.length = 0;
      }
      c.cast = false;
      return slow.uses - n0;
    };
    const byCooldown = casts();
    assert.ok(byCooldown >= 2 && byCooldown <= 3, `${cls}: one every three seconds or so (${byCooldown} in 6 s)`);
    assert.equal(h.mana, h.d.maxMana, 'and the mana was never touched');
    // the other way
    g.setLimit('mana');
    assert.equal(meta.limit, 'mana', 'the choice is kept with the device, not the character');
    const cost = Math.round(SKILLS[slow.id].mana * MANA_MODE.cost * (1 - h.d.cdr));
    assert.equal(slow.r.mana, cost, `${cls}: the slow ability costs mana (${cost} of ${h.d.maxMana})`);
    assert.equal(slow.r.cooldown, MANA_MODE.recover, 'and needs only a moment between uses');
    assert.ok(evade.r.mana > 0 && evade.r.cooldown === MANA_MODE.evadeRecover, 'the evasive move too');
    assert.equal(quick.r.mana, 0, 'the quick attack is free either way');
    assert.equal(evade.maxCharges, 1);
    assert.equal(h.mana, h.d.maxMana);
    g.events.length = 0;
    const n0 = slow.uses;
    let dry = false;
    for (let t = 0; t < 6; t += DT) {
      c.cast = true;
      c.castX = h.x + 1.5;
      c.castY = h.y;
      g.update(DT, c);
      if (g.events.some((e) => e.t === 'text' && e.text === 'No mana')) dry = true;
      g.events.length = 0;
    }
    c.cast = false;
    // (one that was being made as the six seconds ended is let land: it is paid for when it lands)
    land(g, c, DT);
    const byMana = slow.uses - n0;
    const burst = Math.floor(h.d.maxMana / cost);
    assert.ok(byMana >= burst && byMana > byCooldown, `${cls}: used freely until the mana runs out (${byMana} in 6 s, ${burst} of them back to back)`);
    assert.ok(dry, 'and then it runs out, and says so');
    assert.ok(h.mana < cost);
    // the evasive move costs mana too
    h.mana = h.d.maxMana;
    for (let t = 0; t < 1; t += DT) g.update(DT, c);
    const m0 = h.mana;
    c.evade = true;
    c.evadeX = h.x + 3;
    c.evadeY = h.y;
    g.update(DT, c);
    c.evade = false;
    assert.equal(evade.uses, 1);
    assert.ok(h.mana < m0);
    // Swift in front of the slow ability: a shorter cooldown one way, cheaper the other
    h.words.swift = 1;
    assert.equal(g.socket(1, 'front', 'swift'), null);
    assert.ok(slow.r.mana < cost && slow.r.cooldown === MANA_MODE.recover);
    g.setLimit('cooldown');
    assert.equal(slow.r.mana, 0);
    assert.ok(slow.r.cooldown < SKILLS[slow.id].cooldown * (1 - h.d.cdr) - 0.3, 'Swift shortens the cooldown');
    if (evade.id === 'trap') assert.equal(evade.maxCharges, 2, 'and the roll has its two charges back');
  }
  // the choice outlasts the page; nonsense falls back to cooldowns
  assert.equal(cleanMeta({ limit: 'mana' } as never).limit, 'mana');
  assert.equal(cleanMeta({ limit: 'both' } as never).limit, 'cooldown');
  assert.equal(cleanMeta(null).limit, 'cooldown');
});

// =============================================================================================
// The Lexicon

test('keeping a word in the Lexicon is a premium: it costs gold, and more for every word already kept', () => {
  // The owner: "yes unused words stay. but i want that to be a premium."
  const meta = newMeta();
  const g = new Game('warrior', 8, meta);
  const h = g.hero;
  h.words.power = 2;
  h.words.frost = 1;
  assert.equal(g.keepCost(), TUNE.keepCost);
  assert.equal(g.depositWord('power'), `Needs ${TUNE.keepCost} gold`, 'a new character cannot afford it');
  assert.equal(meta.lexicon.power, 0);
  h.gold = TUNE.keepCost * 3 + 10;
  assert.equal(g.depositWord('power'), null);
  assert.equal(h.gold, TUNE.keepCost * 2 + 10);
  assert.equal(g.keepCost(), TUNE.keepCost * 2, 'the second costs double');
  assert.equal(g.depositWord('frost'), null);
  assert.equal(h.gold, 10);
  assert.equal(g.keepCost(), TUNE.keepCost * 4, 'the third, double again');
  assert.equal(g.depositWord('power'), `Needs ${TUNE.keepCost * 4} gold`);
  assert.deepEqual([meta.lexicon.power, meta.lexicon.frost, h.words.power], [1, 1, 1]);
  // taking one out is free, and the price comes down with it
  assert.equal(g.withdrawWord('frost'), null);
  assert.equal(h.gold, 10);
  assert.equal(g.keepCost(), TUNE.keepCost * 2);
  // what is kept is there for the next character; what was carried or set is not
  assert.equal(g.socket(0, 'front', 'frost'), null);
  g.enterDungeon();
  g.hurtHero(1e9, 'phys', [], null, 'a test');
  assert.ok(g.over);
  const next = new Game('mage', 9, meta);
  assert.equal(next.meta.lexicon.power, 1);
  assert.equal(owned(next), 0);
  assert.equal(next.withdrawWord('power'), null);
  assert.equal(next.hero.words.power, 1);
});

test('the Lexicon learns what each word has been used for: found, in front, behind, on gear, on a dungeon', () => {
  const meta = newMeta();
  assert.ok(WORD_IDS.every((w) => Object.values(meta.known[w]).every((v) => v === false)), 'nothing is known to begin with');
  const g = new Game('ranger', 10, meta);
  const h = g.hero;
  const c = emptyControls();
  // found: by picking it up
  inner(g).addDrop('word', h.x, h.y, 0, null, 'leech');
  for (let t = 0; t < TUNE.wordStands + 0.5; t += DT) g.update(DT, c);
  assert.deepEqual(meta.known.leech, { found: true, front: false, behind: false, gear: false, dungeon: false });
  // on an attack
  assert.equal(g.socket(0, 'behind', 'leech'), null);
  assert.deepEqual(meta.known.leech, { found: true, front: false, behind: true, gear: false, dungeon: false });
  // on gear
  h.words.leech = 1;
  h.bag[0] = rollItem(2, new RNG(4), { slot: 'ring' });
  assert.equal(g.imbue({ kind: 'bag', i: 0 }, 'leech'), null);
  assert.ok(meta.known.leech.gear);
  // on a dungeon: when it is burned in, not when it is laid on the gate
  h.words.swift = 1;
  assert.equal(g.planWord('swift'), null);
  assert.equal(meta.known.swift.dungeon, false);
  g.enterDungeon();
  assert.ok(meta.known.swift.dungeon && meta.known.swift.found);
  assert.equal(h.words.swift, 0, 'and the word is spent');
  // it is saved and read back as it is; an older save without it is read as "nothing known" (but a kept word is plainly found)
  assert.deepEqual(cleanMeta(JSON.parse(JSON.stringify(meta))).known, meta.known);
  const old = cleanMeta({ lexicon: { fire: 2 }, taught: true } as never);
  assert.deepEqual(old.known.fire, { found: true, front: false, behind: false, gear: false, dungeon: false });
  assert.ok(!old.known.power.found);
});

// =============================================================================================
// A line for a big kill

/** Kill a big monster with the given attack, `gap` seconds of dungeon after the last. Returns the hero's line, if one was said. */
function bigKill(g: Game, skill: number, what: 'elite' | 'boss' | 'plain', gap: number): string | null {
  const m = dummy(g, 3, 0, 10);
  if (what === 'elite') m.elite = true;
  if (what === 'boss') m.boss = true;
  m.lastSkill = skill;
  g.runTime += gap;
  g.events.length = 0;
  inner(g).kill(m);
  const said = g.events.filter((e) => e.t === 'quip').map((e) => (e.t === 'quip' ? e.text : ''));
  assert.ok(said.length <= 1, 'never two lines for one kill');
  g.events.length = 0;
  return said[0] ?? null;
}

test('a big kill may earn a line: a boss always, an elite now and then, an ordinary monster never', () => {
  // The owner: "lets have some cool tag lines when you kill a big enemy ... make them sparse, i
  // dont want it to get repetitive but it would be a nice little flair".
  const g = room('warrior');
  for (let i = 0; i < 60; i++) assert.equal(bigKill(g, 0, 'plain', 100), null, 'an ordinary monster earns nothing');
  for (let i = 0; i < 12; i++) assert.ok(bigKill(g, 0, 'boss', 0), 'a boss always earns a line, however soon after the last');
  // elites: about three in ten when there has been time enough since the last line
  let said = 0;
  const N = 600;
  for (let i = 0; i < N; i++) if (bigKill(g, 0, 'elite', QUIPS.gap + 1)) said++;
  assert.ok(Math.abs(said / N - QUIPS.chance) < 0.07, `${said} of ${N} elites earned a line`);
  // and never two within the gap: a room full of elites dying at once says one thing at most
  let lines = 0;
  bigKill(g, 0, 'boss', QUIPS.gap + 1);
  for (let i = 0; i < 200; i++) if (bigKill(g, 0, 'elite', 0.1)) lines++;
  assert.equal(lines, 0, 'nothing within the gap after a line');
});

/** Every line that fits a kill by this attack, with this word on it, by this hero as they stand. */
function fitting(g: Game, skill: number, word: WordId | null): Set<string> {
  const h = g.hero;
  const weapon = h.gear.mainhand ? h.gear.mainhand.weapon : null;
  return new Set([...(word ? QUIPS.word[word] : []), ...QUIPS.skill[h.skills[skill].id], ...(weapon ? QUIPS.weapon[weapon] : []), ...QUIPS.attr[g.topAttr()], ...QUIPS.cls[h.cls], ...QUIPS.any]);
}

test('the line fits the kill: a word on the attack, the attack, the weapon, the top attribute, the class, or anything', () => {
  const g = room('mage');
  const h = g.hero;
  assert.equal(g.socket(0, 'front', 'fire'), null); // Flame Wave
  assert.equal(g.socket(1, 'front', 'frost'), null); // Frost Orb
  assert.equal(g.topAttr(), 'int');
  const weapon = h.gear.mainhand ? h.gear.mainhand.weapon : null;
  assert.ok(weapon === 'wand' || weapon === 'staff');
  const seen = new Set<string>();
  for (let i = 0; i < 500; i++) {
    const a = bigKill(g, 0, 'elite', QUIPS.gap + 1);
    if (a) {
      assert.ok(fitting(g, 0, 'fire').has(a), `"${a}" for a kill by Flame Wave`);
      seen.add(a);
    }
    const b = bigKill(g, 1, 'elite', QUIPS.gap + 1);
    if (b) {
      assert.ok(fitting(g, 1, 'frost').has(b), `"${b}" for a kill by Frost Orb`);
      seen.add(b);
    }
  }
  // the owner's two examples are there, and turn up; so does a line from every kind of list
  assert.ok(seen.has("I'm just warming up."), 'fire');
  assert.ok(seen.has('Chill out.'), 'frost');
  const from = (l: readonly string[]): boolean => l.some((t) => seen.has(t));
  assert.ok(from(QUIPS.skill.wave) && from(QUIPS.skill.orb), 'the attack');
  assert.ok(from(QUIPS.weapon[weapon as 'wand' | 'staff']), 'the weapon');
  assert.ok(from(QUIPS.attr.int) && !from(QUIPS.attr.str) && !from(QUIPS.attr.dex), 'the top attribute, and no other');
  assert.ok(from(QUIPS.cls.mage) && !from(QUIPS.cls.warrior) && !from(QUIPS.cls.ranger), 'the class, and no other');
  assert.ok(from(QUIPS.any), 'anything');
  // a boss gets the boss's lines as well
  const boss = new Set<string>();
  for (let i = 0; i < 80; i++) boss.add(bigKill(g, 0, 'boss', 0) as string);
  assert.ok(QUIPS.boss.every((t) => boss.has(t)), 'every line for a boss is used');
  for (const t of boss) assert.ok(QUIPS.boss.includes(t) || fitting(g, 0, 'fire').has(t), `"${t}" for a boss killed by Flame Wave`);
});

test("the attribute lines follow the hero's highest attribute, not the class", () => {
  // The owner: "if you had a line about crushing your enemy into the dirt but youre a warrior
  // focused speccing into int then that doesnt really make sense".
  const g = room('warrior');
  const h = g.hero;
  // (attributes count with what gear adds, so set them through what comes out)
  const set = (str: number, dex: number, int: number): void => {
    const st = h.d.stats;
    h.attrs.str = str - st.str;
    h.attrs.dex = dex - st.dex;
    h.attrs.int = int - st.int;
    g.refresh();
    assert.deepEqual([h.d.str, h.d.dex, h.d.int], [str, dex, int]);
  };
  set(40, 20, 20);
  assert.equal(g.topAttr(), 'str');
  set(40, 20, 70);
  assert.equal(g.topAttr(), 'int', 'a warrior who has put everything into Intelligence');
  const seen = new Set<string>();
  for (let i = 0; i < 500; i++) {
    const t = bigKill(g, 0, 'elite', QUIPS.gap + 1);
    if (t) seen.add(t);
  }
  assert.ok(QUIPS.attr.int.some((t) => seen.has(t)), 'speaks as the clever one');
  assert.ok(!QUIPS.attr.str.some((t) => seen.has(t)), 'and never of brute force');
  assert.ok(QUIPS.cls.warrior.some((t) => seen.has(t)), 'but is still a warrior in manner');
  // a tie goes to the class's own attribute; a tie between the other two, to the first of them
  set(50, 50, 50);
  assert.equal(g.topAttr(), 'str');
  set(30, 50, 50);
  assert.equal(g.topAttr(), 'dex');
});

test('no line is said twice until every line that fits has had its turn', () => {
  const g = room('ranger');
  assert.equal(g.socket(1, 'front', 'poison'), null); // Poison Volley
  const pool = fitting(g, 1, 'poison');
  const said: string[] = [];
  while (said.length < pool.size * 3) {
    const t = bigKill(g, 1, 'elite', QUIPS.gap + 1);
    if (t) said.push(t);
  }
  for (let round = 0; round < 3; round++) {
    const part = said.slice(round * pool.size, (round + 1) * pool.size);
    assert.equal(new Set(part).size, pool.size, `round ${round + 1}: all ${pool.size} lines, each once`);
  }
});

test('the lines are short enough to read in a fight, and none is listed twice', () => {
  const lists = [...Object.values(QUIPS.word), ...Object.values(QUIPS.skill), ...Object.values(QUIPS.weapon), ...Object.values(QUIPS.attr), ...Object.values(QUIPS.cls), QUIPS.any, QUIPS.boss];
  const all = lists.flat();
  assert.equal(new Set(all).size, all.length, 'no line appears in two lists');
  for (const t of all) assert.ok(t.length >= 3 && t.length <= 28, `"${t}" is ${t.length} letters`);
  for (const w of WORD_IDS) assert.ok(QUIPS.word[w].length >= 3, `${w} has at least three lines`);
  for (const c of CLASS_IDS) assert.ok(QUIPS.cls[c].length >= 3, `the ${c} has at least three lines of their own`);
  for (const l of Object.values(QUIPS.weapon)) assert.ok(l.length >= 2, 'every weapon has lines');
  for (const l of Object.values(QUIPS.attr)) assert.ok(l.length >= 3, 'every attribute has lines');
});

test('a line said or not said changes nothing else: the dungeon rolls the same dice either way', () => {
  const after = (gap: number): { dice: number[]; lines: number } => {
    const g = room('warrior', 77);
    const dice: number[] = [];
    let lines = 0;
    for (let i = 0; i < 80; i++) {
      if (bigKill(g, 0, 'elite', gap)) lines++;
      dice.push(inner(g).rng.next());
    }
    return { dice, lines };
  };
  // with no time between the kills at most the first can earn a line; with time enough, about three in ten do
  const quiet = after(0);
  const chatty = after(QUIPS.gap + 1);
  assert.ok(quiet.lines <= 1 && chatty.lines > 8, `${quiet.lines} lines against ${chatty.lines}`);
  assert.deepEqual(quiet.dice, chatty.dice);
});

test('each line is spoken in the rhythm of its words: a beat for every syllable, down at a full stop, up at a question', () => {
  // The owner: "give the three characters a different voice". (The three voices themselves are
  // sound: they are heard, not tested. What is tested is the tune a line is given.)
  assert.deepEqual(['Overdue.', 'Hmph.', "I'm", 'Shh.', 'library.', 'Chill', 'double?', 'Crushed.', 'predicted.', 'there', '...'].map(syllables), [3, 1, 1, 1, 3, 1, 2, 1, 3, 1, 0]);
  const stop = speechPlan('Chill out.');
  assert.equal(stop.length, 2);
  assert.ok(stop[1].at > stop[0].at + 1, 'a breath between the words');
  assert.ok(stop[1].bend < 0, 'a statement falls at the end');
  const ask = speechPlan('Seeing double?');
  assert.equal(ask.length, 4);
  assert.ok(ask[3].bend > 0, 'a question rises at the end');
  const two = speechPlan('Shh. This is a library.');
  assert.ok(two[1].at - two[0].at > 2, 'a full stop inside the line is a longer breath');
  assert.deepEqual(speechPlan(''), []);
  // every line in the game can be said, and none runs on
  const all = [...Object.values(QUIPS.word), ...Object.values(QUIPS.skill), ...Object.values(QUIPS.weapon), ...Object.values(QUIPS.attr), ...Object.values(QUIPS.cls), QUIPS.any, QUIPS.boss].flat();
  for (const t of all) {
    const plan = speechPlan(t);
    assert.ok(plan.length >= 1 && plan.length <= 9, `"${t}" is ${plan.length} beats`);
    for (let i = 1; i < plan.length; i++) assert.ok(plan[i].at > plan[i - 1].at);
    assert.equal(speechPlan(t).map((p) => p.pitch).join(), plan.map((p) => p.pitch).join(), 'the same words always have the same tune');
  }
});

test('the voice chosen on the class cards belongs to the character, and is kept with them', () => {
  // The owner: "give me male and female voices and an option at the beginning of a run when you
  // select your class".
  const meta = newMeta();
  assert.equal(meta.voice, 'male');
  meta.voice = 'female';
  const g = new Game('ranger', 5, meta);
  assert.equal(g.voice, 'female', 'a new character speaks with the voice last chosen');
  // changing the choice afterwards is for the next character, not this one
  meta.voice = 'male';
  const back = Game.restore(JSON.parse(JSON.stringify(g.save())), meta);
  assert.equal(back.voice, 'female');
  assert.equal(new Game('mage', 6, meta).voice, 'male');
  // a save from before there were voices, and a damaged one
  const old = JSON.parse(JSON.stringify(g.save()));
  delete old.voice;
  assert.equal(Game.restore(old, meta).voice, 'male', 'the device\'s choice stands in');
  assert.equal(cleanMeta({ voice: 'robot' } as never).voice, 'male');
  assert.equal(cleanMeta({ voice: 'female' }).voice, 'female');
});

// =============================================================================================
// The first dungeon never begins with a fight (Version 12.1)

test('a new player\'s first dungeon does not begin with a fight: nothing wakes by itself until the lesson in walking is done', () => {
  // About three first dungeons in four hundred put a pack in sight of where the hero arrives.
  // Until Version 12.1 the first prompt in those was the fight, with monsters already coming.
  // (These seeds are such dungeons, found by search: 13 + k x 7919. THE LIST IS MADE AGAIN
  // WHENEVER THE MAP-MAKER SETS A DUNGEON DOWN AFRESH, with first_sight.ts of the session's
  // scratchpad: for Version 18.2, when the corners of rooms were cut clean and what stands in a
  // dungeon was rolled again (three of the eight seeds listed until then had nothing in sight any
  // more; eleven first dungeons in twelve hundred did); and for Version 18.3, when the corridors
  // straight across the screen set the rooms themselves down differently (none of the eight did;
  // nineteen in twenty-four hundred do, and these are the first eight).)
  let tried = 0;
  for (const seed of [2502417, 2858772, 4038703, 4434653, 5923425, 7166708, 7459711, 8481262]) {
    const g = Game.forFirstRun('mage', seed);
    const h = g.hero;
    const c = emptyControls();
    for (let k = 0; k < 40; k++) {
      g.update(DT, c);
      assert.equal(g.guideStep(), 'move', `seed ${seed}: the first prompt is how to walk`);
    }
    const inSight = g.monsters.filter((m) => !m.dead && m.seen && Math.hypot(m.x - h.x, m.y - h.y) <= TUNE.aggroRadius);
    if (inSight.length === 0) continue;
    tried++;
    assert.ok(inSight.every((m) => m.state === 'sleep'), `seed ${seed}: ${inSight.length} monsters in sight, and all of them still asleep`);
    assert.equal(g.inFight(), false);
    // one that is struck wakes, lesson or no lesson
    const g2 = Game.forFirstRun('mage', seed);
    for (let k = 0; k < 5; k++) g2.update(DT, c);
    const m2 = g2.monsters.filter((m) => !m.dead && m.seen).sort((a, b) => Math.hypot(a.x - g2.hero.x, a.y - g2.hero.y) - Math.hypot(b.x - g2.hero.x, b.y - g2.hero.y))[0];
    (g2 as unknown as { damageMonster: (m: Monster, dmg: number, el: string, crit: boolean, skill: number) => void }).damageMonster(m2, 1, 'phys', false, 0);
    assert.notEqual(m2.state, 'sleep', `seed ${seed}: a sleeper that is struck wakes`);
    // the lesson done (the hero has walked its few tiles): they wake, and the fight prompt comes
    assert.ok(g.guide);
    g.guide!.walked = GUIDE.steps;
    for (let k = 0; k < 10; k++) g.update(DT, c);
    assert.ok(inSight.some((m) => m.state !== 'sleep'), `seed ${seed}: once the hero has learned to walk, they wake`);
    assert.equal(g.guideStep(), 'fight');
  }
  assert.ok(tried >= 6, `${tried} of these dungeons do have a pack in sight of the door`);
  // an ordinary dungeon (no prompts) is as it always was: what sees the hero wakes
  const plain = new Game('mage', 622132791);
  plain.enterDungeon();
  for (let k = 0; k < 10; k++) plain.update(DT, emptyControls());
  assert.equal(plain.guide, null);
});

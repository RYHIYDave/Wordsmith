// UNIQUE ITEMS, THE ONES THAT BEND WORDSMITHING (game/uniques.ts bendWords, game/words.ts resolveSkill's `bent`): what an attack's
// words are with each worn, and how much stronger “half as strong again” makes a word. No game is needed for these.
//   run: tsx --test tests/uniques_words.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { SKILLS, WORDS } from '../src/game/defs';
import { derive } from '../src/game/stats';
import { WORD_IDS } from '../src/game/types';
import type { WordId } from '../src/game/types';
import { UNIQUE_TUNE, bendWords, damageWordsASide } from '../src/game/uniques';
import type { BendCtx } from '../src/game/uniques';
import { resolveSkill, socketProblem } from '../src/game/words';

type Sockets = { front: (WordId | null)[]; behind: (WordId | null)[] };
const sk = (front: (WordId | null)[] = [null, null], behind: (WordId | null)[] = [null, null]): Sockets => ({ front, behind });
const ctx = (worn: string[], more: Partial<BendCtx> = {}): BendCtx => ({ worn, full: false, vow: 0, dark: null, borrowed: null, ...more });
const bare = { mainhand: null, offhand: null, helm: null, chest: null, gloves: null, belt: null, boots: null, amulet: null, ring1: null, ring2: null };
const D = derive('warrior', 10, { str: 30, dex: 12, int: 8 }, bare);
const has = (w: string): boolean => Object.prototype.hasOwnProperty.call(WORDS, w);

test('nothing worn: the sockets as they are, nothing stronger; and a word no stronger resolves to the last digit as it always did', () => {
  const three = [sk(['fire', 'twin'], ['leech', null]), sk(['power', null], ['swift', 'heavy']), sk()];
  for (let i = 0; i < 3; i++) {
    const b = bendWords(i, three, ctx([]));
    assert.deepEqual(b.front, three[i].front);
    assert.deepEqual(b.behind, three[i].behind);
    assert.equal(b.boost, 1);
    assert.equal(b.meldBoost, 1);
    assert.equal(b.meld, null);
  }
  // every word alone in front and alone behind, on three kinds of attack: `bent` left out, and `bent` saying nothing, agree
  for (const def of [SKILLS.strike, SKILLS.whirlwind, SKILLS.leap, SKILLS.shot, SKILLS.orb]) {
    for (const w of WORD_IDS) {
      for (const [f, bh] of [[[w], []], [[], [w]]] as [WordId[], WordId[]][]) {
        const a = resolveSkill(def, f, bh, 'str', D);
        const b = resolveSkill(def, f, bh, 'str', D, 'cooldown', { boost: 1, meldBoost: 1, meld: null });
        assert.deepEqual(b, a, `${def.id} ${f.length ? 'front' : 'behind'} ${w}`);
      }
    }
  }
});

test('Two-Faced Mask: the first word in front of the tap attack works behind it too; with two in front and two behind, three behind', () => {
  const three = [sk(['fire', 'twin'], ['leech', 'heavy']), sk(['fire', 'twin'], [null, null]), sk()];
  const b = bendWords(0, three, ctx(['twofacedmask']));
  assert.deepEqual(b.front, ['fire', 'twin']);
  assert.deepEqual(b.behind, ['leech', 'heavy', 'fire'], 'three behind');
  const r = resolveSkill(SKILLS.strike, b.front, b.behind, 'str', D);
  assert.ok(r.zone && r.zone.kind === 'burn', 'Flame behind: burning ground');
  assert.ok(r.ignite > 0 && r.orbChance > 0 && r.cracks > 0);
  // (only the tap attack; a word already behind is not there twice; no first word, nothing)
  assert.deepEqual(bendWords(1, three, ctx(['twofacedmask'])).behind, [null, null]);
  assert.deepEqual(bendWords(0, [sk(['twin', null], ['twin', null])], ctx(['twofacedmask'])).behind, ['twin', null]);
  assert.deepEqual(bendWords(0, [sk([null, 'swift'], [null, null])], ctx(['twofacedmask'])).behind, [null, null, 'swift'], 'the first word set, not the first socket');
  assert.deepEqual(bendWords(0, [sk()], ctx(['twofacedmask'])).behind, [null, null]);
  // (ONE DAMAGE WORD A SIDE holds: a damage word behind already keeps the first out; with Polyglot's Mantle it goes in)
  assert.deepEqual(bendWords(0, [sk(['fire', null], ['frost', null])], ctx(['twofacedmask'])).behind, ['frost', null]);
  assert.deepEqual(bendWords(0, [sk(['fire', null], ['frost', null])], ctx(['twofacedmask', 'polyglotsmantle'])).behind, ['frost', null, 'fire']);
});

test('The Censor\'s Seal and The Quill\'s Band: one attack takes no words, the other\'s are half as strong again', () => {
  const three = [sk(['power', 'twin'], ['swift', null]), sk(['power', null], ['twin', null]), sk(['fire', null])];
  const tap = bendWords(0, three, ctx(['censorsseal']));
  const hold = bendWords(1, three, ctx(['censorsseal']));
  assert.equal(tap.boost, 1 + UNIQUE_TUNE.half);
  assert.deepEqual(tap.front, ['power', 'twin']);
  assert.deepEqual([hold.front, hold.behind], [[null, null], [null, null]], 'the hold attack takes no words');
  assert.equal(hold.boost, 1);
  assert.equal(bendWords(2, three, ctx(['censorsseal'])).boost, 1, 'the swipe as ever');
  // the inverse
  const tap2 = bendWords(0, three, ctx(['quillsband']));
  const hold2 = bendWords(1, three, ctx(['quillsband']));
  assert.deepEqual([tap2.front, tap2.behind], [[null, null], [null, null]]);
  assert.equal(hold2.boost, 1 + UNIQUE_TUNE.half);
  assert.deepEqual(hold2.behind, ['twin', null]);
  // what half as strong again is: the word's own figure, half more; what the attribute adds stays on top (as RANK II's)
  const plain = resolveSkill(SKILLS.strike, ['power'], [], 'str', D);
  const strong = resolveSkill(SKILLS.strike, ['power'], [], 'str', D, 'cooldown', { boost: 1.5 });
  const base = resolveSkill(SKILLS.strike, [], [], 'str', D);
  const more = (r: { dmgMult: number }): number => r.dmgMult / base.dmgMult - 1;
  assert.ok(Math.abs(more(strong) - more(plain) - 0.125) < 1e-9, 'Power: 25% more damage becomes 37.5%');
  const ps = resolveSkill(SKILLS.strike, ['poison'], [], 'str', D, 'cooldown', { boost: 1.5 });
  const pp = resolveSkill(SKILLS.strike, ['poison'], [], 'str', D);
  assert.ok(Math.abs(ps.poison - pp.poison - 0.1) < 1e-9, 'Poison: a dose of 20% of the hit becomes 30%');
  assert.equal(ps.dmgMult, pp.dmgMult, 'its price is no dearer: still 20% softer');
  // every word is at least as strong, none weaker (Twin's two are each stronger, not weaker)
  for (const w of WORD_IDS) {
    for (const def of [SKILLS.strike, SKILLS.orb, SKILLS.leap]) {
      const a = resolveSkill(def, [w], [w], 'str', D);
      const b = resolveSkill(def, [w], [w], 'str', D, 'cooldown', { boost: 1.5 });
      for (const k of ['dmgMult', 'countDmg', 'ignite', 'chill', 'arcDmg', 'leech', 'volatile', 'poison', 'shield', 'might', 'haste', 'echo', 'orbChance', 'rune', 'cloud', 'cracks', 'ward', 'pull', 'split', 'hex', 'still', 'vortex', 'shards', 'hexCircle', 'bubble', 'bind', 'snare'] as const) {
        assert.ok(b[k] >= a[k] - 1e-12, `${w} on ${def.id}: ${k} ${b[k]} >= ${a[k]}`);
      }
      assert.ok(b.cooldown <= a.cooldown + 1e-12 && b.rate >= a.rate - 1e-12, `${w} on ${def.id}: no slower`);
    }
  }
});

test('Polyglot\'s Mantle: two damage words on a side, each with its full effect', () => {
  assert.equal(damageWordsASide([]), 1);
  assert.equal(damageWordsASide(['polyglotsmantle']), 2);
  assert.equal(socketProblem(['fire', null], 'frost'), 'One damage word per side');
  assert.equal(socketProblem(['fire', null], 'frost', 2), null);
  assert.equal(socketProblem(['fire', 'frost', null], 'lightning', 2), 'Two damage words per side');
  const both = resolveSkill(SKILLS.strike, ['fire', 'frost'], [], 'str', D);
  const fire = resolveSkill(SKILLS.strike, ['fire'], [], 'str', D);
  const frost = resolveSkill(SKILLS.strike, ['frost'], [], 'str', D);
  assert.equal(both.ignite, fire.ignite, 'Flame whole');
  assert.equal(both.chill, frost.chill, 'Frost whole');
  assert.equal(both.element, 'fire', 'the first decides what kind of damage it is');
});

test('words added with no slot used: Twin behind the hold, Binding behind the swipe, Pulling in front of the hold; set there by hand too, it is there once', () => {
  const three = [sk(), sk(), sk()];
  const echo = bendWords(1, three, ctx(['cantorsecho']));
  assert.deepEqual(echo.behind, [null, null, 'twin']);
  assert.ok(resolveSkill(SKILLS.whirlwind, echo.front, echo.behind, 'str', D).echo > 0);
  assert.deepEqual(bendWords(0, three, ctx(['cantorsecho'])).behind, [null, null], 'the hold attack only');
  const crown = bendWords(2, three, ctx(['hollowcrown']));
  assert.deepEqual(crown.behind, [null, null, 'binding']);
  assert.ok(resolveSkill(SKILLS.leap, crown.front, crown.behind, 'str', D).snare > 0, 'a snare left where he dodges from');
  const tow = bendWords(1, three, ctx(['undertow']));
  assert.deepEqual(tow.front, [null, null, 'pulling']);
  assert.ok(resolveSkill(SKILLS.whirlwind, tow.front, tow.behind, 'str', D).pull > 0);
  // set by hand as well: once, the slots all still his
  assert.deepEqual(bendWords(1, [sk(), sk([null, null], ['twin', 'swift'])], ctx(['cantorsecho'])).behind, ['twin', 'swift']);
  // (the ten new words: the Hood's Culling, the Glass's Mirroring, The Long Echo's Lasting, once they are in the game; until then, nothing)
  for (const [id, w, i] of [['headsmanshood', 'culling', 0], ['queensglass', 'mirroring', 0], ['longecho', 'lasting', 1]] as [string, string, number][]) {
    const b = bendWords(i, three, ctx([id]));
    assert.deepEqual(b.front, has(w) ? [null, null, w] : [null, null], `${id}: ${w}`);
  }
});

test('The King\'s Knot: the word of a monster he killed, in front of his tap attack, lent beside his own', () => {
  const three = [sk(['frost', null]), sk(), sk()];
  assert.deepEqual(bendWords(0, three, ctx(['kingsknot'])).front, ['frost', null], 'none borrowed');
  assert.deepEqual(bendWords(0, three, ctx(['kingsknot'], { borrowed: 'leech' })).front, ['frost', null, 'leech']);
  assert.deepEqual(bendWords(0, three, ctx(['kingsknot'], { borrowed: 'fire' })).front, ['frost', null, 'fire'], 'a damage word too: it is lent, not set');
  assert.deepEqual(bendWords(0, three, ctx(['kingsknot'], { borrowed: 'frost' })).front, ['frost', null], 'one he has already: nothing more');
  assert.deepEqual(bendWords(1, three, ctx(['kingsknot'], { borrowed: 'leech' })).front, [null, null], 'the tap attack only');
});

test('The Ghostwriter: the swipe carries every word set on the tap attack, on top of its own: eight at the top end', () => {
  const three = [sk(['power', 'twin'], ['swift', 'leech']), sk(), sk(['heavy', 'precise'], ['guarding', 'volatile'])];
  const b = bendWords(2, three, ctx(['ghostwriter']));
  assert.deepEqual(b.front, ['heavy', 'precise', 'power', 'twin']);
  assert.deepEqual(b.behind, ['guarding', 'volatile', 'swift', 'leech']);
  assert.equal(b.front.length + b.behind.length, 8);
  assert.deepEqual(bendWords(2, [sk(['twin', null]), sk(), sk(['twin', null])], ctx(['ghostwriter'])).front, ['twin', null], 'the same word, once');
  assert.deepEqual(bendWords(0, three, ctx(['ghostwriter'])).front, ['power', 'twin'], 'the tap attack as it is');
});

test('The Amalgam\'s Heart: two words in front of the tap attack that meld give their meld as well, with no melding', () => {
  const heart = (front: (WordId | null)[], more: string[] = []): ReturnType<typeof bendWords> => bendWords(0, [sk(front), sk(), sk()], ctx(['amalgamsheart', ...more]));
  assert.equal(heart(['fire', 'volatile']).meld, 'powderkeg', 'Flame and Volatile also give Powderkeg');
  assert.equal(heart(['volatile', 'frost']).meld, 'shatter', 'either way round');
  assert.equal(heart(['fire', 'twin']).meld, null, 'these do not meld');
  assert.equal(heart(['fire', null]).meld, null);
  assert.equal(heart(['power', 'fire'], ['polyglotsmantle']).meld, 'eruption', 'with Polyglot\'s Mantle, two damage words meld too');
  assert.equal(heart(['eruption', 'volatile']).meld, null, 'a melded word set there is the meld it has');
  assert.equal(bendWords(1, [sk(), sk(['fire', 'volatile'])], ctx(['amalgamsheart'])).meld, null, 'the tap attack only');
  // the attack then does what its two words do apart, and their meld's twist as well
  const b = heart(['fire', 'volatile']);
  const r = resolveSkill(SKILLS.strike, b.front, b.behind, 'str', D, 'cooldown', { meld: b.meld });
  assert.equal(r.meld, 'powderkeg');
  assert.ok(r.ignite > 0 && r.volatile > 0);
  assert.ok(r.lines.some((l) => l.startsWith(`${WORDS.powderkeg.name}:`)));
});

test('how strong: the Songbird while his life is full, her Vow as it grows, the Alloy Band for melded words; worn together they add', () => {
  const three = [sk(['power', null]), sk(['eruption', 'swift']), sk()];
  assert.equal(bendWords(0, three, ctx(['clockworksongbird'], { full: true })).boost, 1.5);
  assert.equal(bendWords(0, three, ctx(['clockworksongbird'], { full: false })).boost, 1, 'silent when he is hurt');
  assert.equal(bendWords(2, three, ctx(['clockworksongbird'], { full: true })).boost, 1.5, 'every attack');
  assert.equal(bendWords(0, three, ctx(['nettleshirt'], { vow: 0.3 })).boost, 1.3);
  assert.equal(bendWords(0, three, ctx(['nettleshirt'], { vow: 9 })).boost, 1 + UNIQUE_TUNE.nettle.most, 'never past its most');
  // worn together, the Shirt and the Songbird stack (his doc's “Still open”): they add, they do not multiply
  assert.equal(bendWords(0, three, ctx(['nettleshirt', 'clockworksongbird', 'censorsseal'], { vow: 0.5, full: true })).boost, 1 + 0.5 + 0.5 + 0.5);
  // the Alloy Band: melded words alone
  const alloy = bendWords(1, three, ctx(['alloyband']));
  assert.equal(alloy.boost, 1);
  assert.equal(alloy.meldBoost, 1.5);
  const plain = resolveSkill(SKILLS.whirlwind, ['eruption', 'swift'], [], 'str', D);
  const strong = resolveSkill(SKILLS.whirlwind, ['eruption', 'swift'], [], 'str', D, 'cooldown', { meldBoost: 1.5 });
  assert.ok(strong.ignite > plain.ignite, 'Eruption\'s Flame stronger');
  assert.ok(strong.dmgMult > plain.dmgMult, 'and its Power');
  assert.equal(strong.cooldown, plain.cooldown, 'Swift beside it, not melded, as it was');
});

test('The Moth\'s Wing: the one word that is dark does nothing, wherever it is counted', () => {
  const three = [sk(['fire', 'twin'], ['leech', null]), sk(), sk([null, null], ['swift', null])];
  const dark = { skill: 0, side: 'front' as const, idx: 0 };
  assert.deepEqual(bendWords(0, three, ctx(['mothswing'], { dark })).front, [null, 'twin']);
  assert.deepEqual(bendWords(0, three, ctx(['mothswing'], { dark })).behind, ['leech', null]);
  assert.deepEqual(bendWords(2, three, ctx(['mothswing'], { dark })).behind, ['swift', null], 'the others as they are');
  // (dark on the tap attack, it is not what the Mask puts behind, nor what the Ghostwriter carries to the swipe)
  assert.deepEqual(bendWords(0, three, ctx(['mothswing', 'twofacedmask'], { dark })).behind, ['leech', null, 'twin']);
  assert.deepEqual(bendWords(2, three, ctx(['mothswing', 'ghostwriter'], { dark })).front, [null, null, 'twin']);
});

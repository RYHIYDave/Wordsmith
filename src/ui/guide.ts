// What the first dungeon says. The rules (game.ts) keep how far a new player has got and which
// prompt is due; this file turns that into the words on screen: the banner over the game, and the
// coach's line on the inventory screen. Every class gets its own: its own attacks by name, and
// its own first word (see FIRST_WORD).
//
// The owner's order: "a fresh game should start with a prompt on how to move. then as you
// approach the first mobs you get a prompt 'tap to ..., tap+hold to ...'. when you take a couple
// hits, it should prompt you with 'swipe to ...' and indicate the dodge function. halfway
// through the first dungeon ... a lootable corpse with a guaranteed drop ... you get the prompt
// to socket the word."

import { CLASSES, FIRST_LEVELS, FIRST_WORD, QUEST_ITEM, SKILLS, WORDS, firstWordSkill } from '../game/defs';
import type { SkillId } from '../game/defs';
import type { Game } from '../game/game';
import type { GuideRow, GuideStep, SlotRef } from '../game/state';
import { WORD_IDS } from '../game/types';
import type { WordId } from '../game/types';

/** One line of the fight prompt: "TAP + HOLD" "to SLAM". */
export interface GuideLine {
  id: GuideRow['id'];
  /** The gesture or the key, which is what the eye should catch. */
  how: string;
  /** What it does. */
  what: string;
  done: boolean;
}

export interface Banner {
  step: GuideStep;
  /** A small caption over the prompt: what kind of thing is being shown. */
  caption: 'HOW TO PLAY' | 'WORDSMITHING';
  /** One large line and a smaller one under it (every prompt but the fight's). */
  text: string;
  sub: string;
  /** The fight prompt: a line for each thing to try, ticked off as it is done. */
  lines: GuideLine[];
  /** What on the screen to point at: an attack's phrase (0 the quick one, 1 the slow one), the dodge, the flask, or nothing. */
  point: 'plate0' | 'plate1' | 'dodge' | 'flask' | null;
}

/** The word a new player's prompts are about: the one in their pouch, else the one lying nearest on the floor, else their class's first. */
export function guideWord(game: Game): WordId {
  const h = game.hero;
  const held = WORD_IDS.find((w) => h.words[w] > 0);
  if (held) return held;
  let best: WordId | null = null;
  let bd = Infinity;
  for (const d of game.drops) {
    if (d.kind !== 'word' || !d.word) continue;
    const dist = Math.hypot(d.x - h.x, d.y - h.y);
    if (dist < bd) {
      bd = dist;
      best = d.word;
    }
  }
  return best ?? FIRST_WORD[h.cls].word;
}

/**
 * Where the first dungeon suggests a word should go. The class's own first word goes on the
 * attack the owner chose for it (Poison on the ranger's Trap); any other first word, in front
 * of the quick attack.
 */
export function guideSlot(game: Game, word: WordId): SlotRef {
  const first = FIRST_WORD[game.hero.cls];
  // (THE FIRST LEVELS: every class's first word goes before the quick attack: defs.ts, firstWordSkill)
  return { skill: word === first.word ? firstWordSkill(game.hero.cls) : 0, side: 'front', idx: 0 };
}

const up = (s: string): string => s.toUpperCase();

/**
 * What the player does to make the quick attack (slot 0), the slow one (slot 1) or the evasive
 * move (slot 2), as the prompts and the plates say it. With fingers a slow attack is "TAP + HOLD"
 * (the owner's words), and one that goes on while it is held (Whirlwind, Beam) needs nothing more
 * said: the thumb is already down. With a mouse one click of such an attack is a single cut, so
 * there it says HOLD.
 */
export function pressName(touch: boolean, slot: number, id: SkillId): string {
  if (slot === 2) return touch ? 'SWIPE' : 'SPACE';
  if (touch) return slot === 0 ? 'TAP' : 'TAP + HOLD';
  if (slot === 0) return 'LEFT CLICK';
  return SKILLS[id].channel ? 'HOLD RIGHT CLICK' : 'RIGHT CLICK';
}

/** What the first dungeon's prompt points at for that ability: its plate at the bottom of the screen, or the button of the evasive move. */
const pointOf = (slot: number): Banner['point'] => (slot === 0 ? 'plate0' : slot === 1 ? 'plate1' : 'dodge');

/** The prompt over the game for this moment, or null when there is none. */
export function guideBanner(game: Game, touch: boolean): Banner | null {
  const step = game.guideStep();
  const G = game.guide;
  if (!step || !G) return null;
  const h = game.hero;
  const c = CLASSES[h.cls];
  const mk = (caption: Banner['caption'], text: string, sub = '', point: Banner['point'] = null): Banner => ({ step, caption, text, sub, lines: [], point });
  switch (step) {
    case 'move':
      return mk('HOW TO PLAY', touch ? 'LEFT THUMB to MOVE' : 'W A S D to MOVE', touch ? 'Put your thumb down anywhere on the left and push.' : 'Or hold the left button on open ground.');
    case 'fight': {
      const how: Record<GuideRow['id'], string> = touch
        ? { quick: pressName(true, 0, h.skills[0].id), slow: pressName(true, 1, h.skills[1].id), evade: pressName(true, 2, h.skills[2].id), flask: 'TAP THE FLASK' }
        : { quick: pressName(false, 0, h.skills[0].id), slow: pressName(false, 1, h.skills[1].id), evade: pressName(false, 2, h.skills[2].id), flask: 'Q' };
      const what: Record<GuideRow['id'], string> = {
        // (the quick attack is the weapon's, so the character's own list of attacks is asked, not the class's)
        quick: `to ${SKILLS[h.skills[0].id].verb}`,
        slow: `to ${SKILLS[h.skills[1].id].verb}`,
        evade: `to ${SKILLS[h.skills[2].id].verb}`,
        flask: 'to HEAL',
      };
      const rows = game.guideRows();
      const b = mk('HOW TO PLAY', '', '');
      b.lines = rows.map((r) => ({ id: r.id, how: how[r.id], what: what[r.id], done: r.done }));
      // the newest thing not yet done is the one pointed at: the dodge, the flask
      const open = rows.filter((r) => !r.done).map((r) => r.id);
      b.point = open.includes('flask') ? 'flask' : open.includes('evade') ? 'dodge' : null;
      return b;
    }
    case 'body':
      return mk('WORDSMITHING', 'Someone fell here', touch ? 'Walk up to the body to search it, or tap it.' : 'Walk up to the body to search it.');
    case 'take': {
      const w = guideWord(game);
      return mk('WORDSMITHING', `A power word: ${up(WORDS[w].name)}`, 'Walk over it to take it.');
    }
    // (THE FIRST LEVELS: the fallen wordsmith's quest item, to the wordsmith in town)
    case 'carry':
      return mk('WORDSMITHING', `You carry ${QUEST_ITEM.the}`, 'Take it to the wordsmith in town.');
    case 'ring':
      return mk('WORDSMITHING', `Bring ${QUEST_ITEM.the} to the wordsmith`, 'He stands in the ring of stones. Walk up to him.');
    case 'smith': {
      const w = guideWord(game);
      const to = guideSlot(game, w);
      const name = up(SKILLS[h.skills[to.skill].id].name);
      if (game.inFight()) return mk('WORDSMITHING', `You hold a word: ${up(WORDS[w].name)}`, `When the fight is over, it goes on ${name}.`);
      // (with fingers the evasive move's button is not a thing to tap: the right thumb lives in that
      // corner, and a touch there is a tap, a hold or a swipe. The INVENTORY button is, and it is lit.)
      if (touch && to.skill === 2) return mk('WORDSMITHING', `Put ${up(WORDS[w].name)} on ${name}`, 'Tap INVENTORY, at the top of the screen.');
      return mk('WORDSMITHING', `Put ${up(WORDS[w].name)} on ${name}`, touch ? `Tap ${name} at the bottom of the screen.` : `Click ${name} at the bottom of the screen.`, pointOf(to.skill));
    }
    case 'use': {
      const set = G.set;
      if (!set) return null;
      const sk = h.skills[set.skill];
      const press = pressName(touch, set.skill, sk.id);
      // what the word is doing there, in the word's own plain line
      const front = sk.front.find((w) => w !== null);
      const behind = sk.behind.find((w) => w !== null);
      const says = front ? WORDS[front].frontText : behind ? WORDS[behind].behindText : '';
      return mk('WORDSMITHING', `${press}: ${up(sk.r.name)}`, says, pointOf(set.skill));
    }
  }
}

export interface Coach {
  /** The word in question, and the socket the first dungeon suggests for it. */
  word: WordId;
  to: SlotRef;
  /** The coach's line. */
  text: string;
  /** The word is on: the way on is to close the screen. */
  done: boolean;
}

/**
 * The coach's line on the inventory screen while a new player's first word is waiting for a
 * place (or has just been given one). Null when no prompts are running, or there is nothing to say.
 */
export function guideCoach(game: Game, touch: boolean): Coach | null {
  const G = game.guide;
  if (!G) return null;
  const h = game.hero;
  if (G.set) {
    const sk = h.skills[G.set.skill];
    const front = sk.front.find((w) => w !== null);
    const behind = sk.behind.find((w) => w !== null);
    const word = front ?? behind;
    // (taken out again: whoever can do that needs no coaching)
    if (!word) return null;
    // (THE FIRST LEVELS: set in town, at the wordsmith's, it is tried as the next dungeon begins)
    const tryIt = FIRST_LEVELS.on && game.level.town ? 'Try it in the next dungeon.' : 'Close this and try it.';
    return { word, to: { skill: G.set.skill, side: front ? 'front' : 'behind', idx: 0 }, text: `${up(sk.r.name)}! ${tryIt}`, done: true };
  }
  const word = WORD_IDS.find((w) => h.words[w] > 0);
  if (!word) return null;
  const to = guideSlot(game, word);
  const name = up(SKILLS[h.skills[to.skill].id].name);
  return { word, to, text: touch ? `Drag ${up(WORDS[word].name)} onto ${name}.` : `Drag ${up(WORDS[word].name)} onto ${name}, or click the word and then the slot.`, done: false };
}

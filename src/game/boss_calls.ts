// THE BOSSES CALL OUT THEIR BIG MOVES. The owner, 31 Oct 2026, 07:28: “Id like to try the bosses announcing their moves.  Like
// “heavy is the crown” as he’s throwing his crown or whatever.” A speech program's voices he heard and turned down (“It’s going to
// sound like it’s a voice program and I don’t really want that”); his pick then, “Words + his own sound (Recommended)”: as a boss
// begins one of his big moves, its line comes up over him, and is heard as a mumble in a voice of his own (engine/audio.ts
// BOSS_VOICES, speakBoss), as the heroes' lines are. Every boss that can talk (his pick, “Every boss that can talk
// (Recommended)”); the beasts roar as they did (the Carrion Queen, the Hollow Stag), and those whose silence is their story stay
// silent (the Crier, the Palimpsest, the Scraper and the Quill, the Censor, the Princess). Lines stay rare (his sound rulebook,
// Voices, rule 7): his big moves, and never two within BOSS_CALLS.gap; the two whose basic blow is a big one (the Fleshmancer's
// shards, the King's charge) say its line no more than once in BOSS_CALLS.basicGap, or it would be all they said.
//
// The lines are the main chat's, for his yes; original, but for the King's crown, which is his. Behind BOSS_CALLS (off) until he
// has read and heard them.

import type { MonsterKind } from './types';

export const BOSS_CALLS = { on: false, /** seconds a line stays up over him */ sayFor: 1.8, /** at least this many seconds from one of his lines to the next (lines stay rare) */ gap: 5, /** and from his basic blow's line to its next */ basicGap: 20 };

/** Each talking boss's big moves (by their names in his rules) and what he calls out as he begins each. */
export const BOSS_CALL_LINES: Partial<Record<MonsterKind, Record<string, string>>> = {
  // (floor 1: his slam, and his fan of bolts when you are out of its reach)
  warden: { slam: 'On your knees!', bolts: 'Back to your cell!' },
  // (floor 2, the Headsman made new: his flurry, his wheel, his vault)
  headsman: { 'h2:flurry': 'Hold still.', 'h2:wheel': 'Heads will roll.', 'h2:vault': 'The block awaits.' },
  // (floor 3: muzzled, and completely insane: his hook, his whirl, his ball and chain)
  chained: { hook: 'Mine! MINE!', whirl: 'Round... round... ROUND!', ball: 'Mmmph... FREE!' },
  // (floor 4, all its dead at once: its arms slamming down, its swarm of skulls, its devouring, its bursting)
  amalgam: { floorArms: 'All our hands.', swarm: 'Fly, brothers.', devour: 'Be one of us.', burst: 'We break. We mend.' },
  // (floor 5: his fan of shards (his basic blow), his rings, his dead raised, his fire)
  fleshmancer: { shards: 'Bone remembers how to cut.', rings: 'Stay in the circle.', raise: 'Rise. Serve.', fire: 'Burn, and be useful.' },
  // (floor 6, the quarry's half-cut giant: the rock hurled, the stomp, the rockslide, tearing himself out of the wall)
  unfinished: {
    'unfinished:hurl': 'Catch.', 'unfinished:stomp': 'Be still. Be stone.', 'unfinished:rockslide': 'The mountain falls with me.', 'unfinished:tear': 'Tear me free!',
    // (the same, made while he is still half in the quarry's wall)
    'unfinished:hurlWall': 'Catch.', 'unfinished:stompWall': 'Be still. Be stone.', 'unfinished:rockslideWall': 'The mountain falls with me.',
  },
  // (floor 8, whose voice is his weapon: his shout, his copies, his rockfall)
  cantor: { 'cantor:shout': 'LISTEN!', 'cantor:copies': 'My choir, sing!', 'cantor:rockfall': 'Let the stones sing.' },
  // (floor 10: its stare swept across the hall, its drowned called up, its surfacing, its spew)
  eye: { 'eye:sweep': 'I see you.', 'eye:call': 'Rise, my drowned.', 'eye:surface': 'Come up for air.', 'eye:spew': 'Drink deep.' },
  // (floor 12, in a hundred stolen voices, the Crier's the first: its stolen words, its roll, its unknotting)
  ratking: { 'ratking:words': 'Hear ye! Hear ye!', 'ratking:roll': "Who's there? Who's there?", 'ratking:unknot': 'A hundred teeth!' },
  // (floor 14: his syringe's draw, his tonics, his rounds)
  physician: { 'physician:draw': 'A little blood, for the tests.', 'physician:tonic': 'Take your medicine.', 'physician:rounds': 'Rounds, everyone!' },
  // (floor 17: his masks, his dance, his midnight)
  prince: { 'prince:masks': 'Who am I tonight?', 'prince:dance': 'May I have this dance?', 'prince:midnight': 'The clock strikes twelve!' },
  // (floor 18: into her glass, her reflections, the shattering, the ring of mirrors)
  gqueen: { 'gqueen:glass': 'Where am I now?', 'gqueen:reflect': 'So many of you. One fairest.', 'gqueen:shatter': 'Break!', 'gqueen:ring': 'Look at me. All of me.' },
  // (floor 19: his charge, his Decree, the crown's weight (his own line), the Curtains)
  gking: { 'gking:charge': 'Make way for the King!', 'gking:decree': 'By royal decree!', 'gking:weight': 'Heavy is the crown.', 'gking:curtains': 'See what I have done.' },
};

/** When each boss last called out, and last called out his basic blow (the game's clock). */
const lastCall = new WeakMap<object, number>();
const lastBasic = new WeakMap<object, number>();

/** The line a boss calls out as he begins a move at `now` (the game's clock; `basic`: it is his basic blow), if it has one and he
 * has not called out within BOSS_CALLS.gap (his basic blow's, within BOSS_CALLS.basicGap); null if not (or BOSS_CALLS is off). */
export function bossCall(m: { kind: MonsterKind; boss?: boolean }, move: string, now: number, basic = false): string | null {
  if (!BOSS_CALLS.on || !m.boss) return null;
  const line = BOSS_CALL_LINES[m.kind]?.[move];
  if (!line) return null;
  const was = lastCall.get(m);
  if (was !== undefined && now - was < BOSS_CALLS.gap) return null;
  const wasBasic = lastBasic.get(m);
  if (basic && wasBasic !== undefined && now - wasBasic < BOSS_CALLS.basicGap) return null;
  lastCall.set(m, now);
  if (basic) lastBasic.set(m, now);
  return line;
}

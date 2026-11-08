// QUEST MARKERS. His words, 7 Nov 2026, 23:41 (Eastern): “I need a update to quest when you enter the headman’s yard that says
// “speak to the wordsmith and put a floating marker above the waypoint.  In town when a quest line is being triggered or
// continued, put that same marker over their head.  So right at the beginning there should be one over the wordsmith’s head.  Then
// when you return after the warden, then wen you turn that in, one should pop up over the armorer and you get a prompt that says
// “speak to the armorer””. Read back to him (23:4x): entering a floor with something to bring back to town (the master rune-stone
// from the Warden's floor, so in the Headsman's Yard; the Meldstone; the furnace put out; the feather), the line at the top says
// "Speak to the wordsmith" (or whoever it is for) and a marker floats over the floor's waypoint home; in town the same marker floats
// over whoever has a quest to give or to take now (game.ts questGivers), and when one comes due there (the armourer, as the
// wordsmith's ring is lit) the line says "Speak to the armourer".
// The marker is the friend's cyan (his rule: what glows on a friend is cyan). Shown him (quest_marker_1/2/3; then, at his “Why is it
// right on the wordsmiths head but 10 ft over the armorer’s head?”, over each one's head: marker_wordsmith, marker_armourer), ON at
// his yes, 8 Nov 2026, by 06:24: “Yes, put it live (Recommended)”.

import type { Station } from './state';

export const QUEST_MARKS = { on: true, secs: 6 };

/** What the line at the top says under "Speak to the ...": where they are, or how to get to them. */
export const SPEAK_WHERE: Partial<Record<Station, string>> = {
  wordsmith: 'He stands in the ring of stones.',
  armourer: 'He works at his forge.',
  mystic: 'She keeps the tent by the stash.',
};
/** In a dungeon: the way back to them. */
export const SPEAK_BACK = 'Take the waypoint back to town.';

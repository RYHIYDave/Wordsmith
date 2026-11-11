# The small older art notes (NOT IN THE GAME until the main chat puts them there)

**What it is.** The queue's item "Fix the small older art notes" (`fix-small-older-art-notes`, added by the art chat on
9 Nov from its handoff of 4 Nov), taken by a chat he started from the queue page on 11 Nov 2026, 09:27 (Eastern). Its
notes: "check each is still so first. The royal shadows and the Silent Order's masks read grey on grey; the Moth is too
wide for a phone; the Silent Order's guest look; the quest marker (the main chat's stand-in cyan gem,
render/quest_mark.ts) may be redrawn."

**Where:** the branch `art/small-notes`, from `main` at `797f2e4` (25.3.1). Four switches in `src/art/small_notes.ts`
(`SMALL_NOTES`) and one in `src/game/quest_marks.ts` (`SPEAK_NEW`), ALL OFF: with them off the game is as it was exactly
(`tests/small_notes.test.ts` holds the art to it, pixel for pixel; `tests/speak_new.test.ts` the line). Each goes on only
at his yes to its picture.

## Each note, checked against the game as it is (25.3.1, a phone held sideways, 844 by 390)

| Note | Still so? | The mend | Switch |
| --- | --- | --- | --- |
| The royal shadows read grey on grey | Yes. On the Quiet Tower's stone their fog is the floor's own grey; only the pink edge sets them apart. | The same fog, set apart: its dark and middle tones deeper, its bone white lights kept, its seam the darkest fog. No colour added. | `shadows` |
| The Order's masks read grey on grey | Yes. The mask reads; the cloak under it is a few grey grains, lost on the floor. | The cloak's ghost of a shape there to see: more of its grains, dark fog in its folds, pale fog along its edges, thinning to nothing at the floor as before. | `masks` |
| The Moth is too wide for a phone | Yes. Its wings and head run off the top and the sides of the screen; the picture's lean brings only its body in. | On the Tower Top the picture is drawn back, as on the Swamp Colossus's stone (0.75 of its size at 844 by 390; the Colossus's is 0.71 there). | `mothView` |
| The Silent Order's guest look | NOT KNOWN. The handoff of 4 Nov is a project file this chat cannot open, and nothing in the repository says what the note was. In the game the guests (floor 17) are as their README has them and read well on the Masque's floors. | None made. Put to him with a picture. | (none) |
| The quest marker may be redrawn | Yes: still the main chat's stand-in, a gem at the coarse grain (a game pixel to a pixel). | First shown him the same gem cut at the fine grain; his answer, “Make it a rune, have it flash, and add triggers for “Speak to the (quest giver)” when a quest becomes available”. So: THE GREAT RUNE (the wordsmith's own, `art/smith3.ts` `GREAT_RUNE`: the one he writes on the air and the master rune-stone carries), the friend's cyan, at the fine grain, 14 game pixels across and 17 tall; it bobs and glows as the gem did, and every 1.6 seconds it FLASHES: white-hot, its glow thrown wide, rays shot out of it, gone in under half a second. And his triggers (below). | `questRune`, and `SPEAK_NEW` |

## “Speak to the ...” whenever a quest becomes available (`SPEAK_NEW`, `src/game/quest_marks.ts`)

His words, as above. As it was (25.2.5), the line came on coming into a floor or the town carrying something to bring
back, and in town when someone came due while he stood there. So nothing was said, or not until later, when: a new game
begins (the wordsmith's first quest: the marker alone); a quest opened while he was away (the mystic's, as the gate down
the mountain opens); something was taken up in the middle of a floor (the master rune-stone: not until the next floor).
With the switch on (`Game.updateSpeak`):

- THE MOMENT someone has something for him that they had not a moment before, a quest to give or a thing to take, the
  line says "Speak to the ..." wherever he is: in town with where they stand under it, in a dungeon with "Take the
  waypoint back to town." under it.
- ON COMING INTO TOWN, a new game too, with anyone waiting for him there, it says so: whoever he brings something back
  for first, else the first of them (the wordsmith, the armourer, the mystic).
- On coming into a floor carrying something to bring back, as before.
- It goes, as before, when it has been seen its time (6 s) or they are seen to.

Where the marker floats is as it was: over whoever in town has something for him, and over a floor's waypoint home while
he carries something back.

## What changed in the code

- `src/art/small_notes.ts` (new): the four switches, and what each is.
- `src/art/royal_shadows.ts`: `DEEP` (where each of the eleven tones of fog goes) and two lines of `fogOn`, read only
  with `shadows` on. Every frame of a shadow goes through `fogOn` (its stand, walk, blows, big move, struck, its death
  and the Queen's blink), so all of it is deeper together.
- `src/art/silent_order.ts`: `FOG_FOLD` (three dark greys) and the cloak's ghost in `fog`, read only with `masks` on.
  Their mask, their hood of fog, their fog arms and their death (the fog scattered and gone) are as they were.
- `src/render/quest_mark.ts`: `RUNE_MARK`, `RUNE_FLASH`, `RUNE_FINE` (the rune's pixels, made from `GREAT_RUNE`'s own
  strokes), `runeFlash`, `drawRuneMark`; `drawQuestMark` hands on to it with `questRune` on. (The gem cut finer, which he
  passed over for the rune, is not kept.)
- `src/game/quest_marks.ts`: `SPEAK_NEW`. `src/game/game.ts`: `updateSpeak` takes its new way with it on (18 lines at its
  head; the rest of it untouched).
- `src/main.ts`: `MOTH_VIEW` and three lines of `zoomWanted` (with `mothView` on, on the Tower Top, the picture is drawn
  back so that at least 312 game pixels of height and 640 of width are seen; on a big screen nothing changes);
  `dbg.smallNotes` and `dbg.speakNew`, the switches, for the pictures.

## FOR THE MAIN CHAT

- To bring in: merge `art/small-notes`; set on those he has said yes to (His word, below): in `src/art/small_notes.ts`
  and, for the line, `SPEAK_NEW.on` in `src/game/quest_marks.ts`. Test 1 of `tests/small_notes.test.ts` and of
  `tests/speak_new.test.ts` assert them off: change them then.
- `mothView` is yours to weigh: it is three lines of `zoomWanted` beside the Colossus's, the same way (the world drawn
  larger and shrunk to the screen, the HUD as ever). It holds while he is on the Tower Top, the Moth alive or not. The
  picture's lean toward the Moth (`MOTH_LEAN`, render.ts) is as it was and works with it.
- `SPEAK_NEW` is yours too (game.ts is under nearly every test: `--changed` will run wide; what it is about is
  `tests/speak_new.test.ts`, 5, and `quests15`, `quests610`, `quest3`). ONE THING SEEN: as a new game begins the line's
  panel lies over the wordsmith's name and his marker for its six seconds (he stands up and to the left of where the
  hero arrives, under the top of the screen); the rune is there, flashing, when the line goes. Not mended here.
- The sound chat may want a sound for the rune's flash; none is asked for or made.
- Cost: none to speak of. The shadows and the masks are painted as before (one table looked up; about five times the
  grains in the masks' cloak, a few hundred a frame). The rune is 34 rows of a few rectangles and, in its flash, eight
  short lines.

## Checked

- `tsc`: nothing from this branch (`tests/relief.test.ts` line 378 is main's own).
- `tests/small_notes.test.ts` 4 of 4; `tests/speak_new.test.ts` 5 of 5; `royal_shadows` 7 of 7, `silent_order` 11 of 11,
  `act2_quiettower` 4 of 4, `act2_order_armed` 2 of 2, `quests15` 6 of 6, `quests610` 4 of 4, `quest3` 9 of 9, as before.
- Played on a built page at 844 by 390, the switches off and on, no errors: floor 20's packs standing and in a fight
  (`tools/scenarios/small_notes_packs.mjs`, `small_notes_fight.mjs`), the Moth's fight (`small_notes_moth.mjs`: the
  picture at 1.000 with the switch off, 0.750 with it on), a new game in town and floor 2 with the rune and the line
  (`small_notes_rune.mjs`).
- Not run: the whole suite (his rule of 7 Nov: only what the change is about).

## The pictures (`pictures/`, each about 1200 wide, for a phone)

- `1_royal_shadows.png`: before and after, a plain pack by the hero on the Tower's stone.
- `2_order_masks.png`: before and after, the masks by the hero.
- `3_moth.png`: before and after, the Moth's Eyes on a phone's whole screen.
- `4_quest_marker.png`: the gem as it is live, the rune, its flash and a moment after, over the wordsmith.
- `5_order_guests.png`: the Order's guests on floor 17, as they are.
- `6_rune_waypoint.png`: the rune over a floor's waypoint, the stone carried, the line with the way back.
- `quest_rune.mp4` (6 s): a new game, the line "Speak to the WORDSMITH"; then, the line gone, the rune over him, close,
  flashing.

Made with: `node tools/build_to.mjs dist/notes.html`; `node tools/playtest.mjs --file dist/notes.html --touch --size
844x390 --dpr 3 --scenario tools/scenarios/<name>.mjs --out shots/notes/<tag>` (each scenario's head says its
switches); cut and laid out by hand.

## His word on the pictures

11 Nov 2026 (Eastern), the first five pictures sent him after 10:08, his answers in by 10:36, each asked as a pop-up:

- The royal shadows (`1_royal_shadows.png`), asked “Keep the darker shadows?”: “Yes, keep it (Recommended)”.
- The Order's masks (`2_order_masks.png`), asked “Keep the fog cloak?”: “Yes, keep it (Recommended)”.
- The Moth (`3_moth.png`), asked “Keep the pulled-back camera?”: “Yes, keep it (Recommended)”.
- The quest marker (the gem cut finer), asked “Keep the new gem?”, in his own words: “Make it a rune, have it flash, and
  add triggers for “Speak to the (quest giver)” when a quest becomes available”. Read as: the marker the wordsmith's
  great rune, flashing; and the line whenever someone has something new for him, as set out above.
- The rune, its film and the triggers as read; and the Order's guests: (not yet given.)

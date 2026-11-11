# The small older art notes (NOT IN THE GAME until the main chat puts them there)

**What it is.** The queue's item "Fix the small older art notes" (`fix-small-older-art-notes`, added by the art chat on
9 Nov from its handoff of 4 Nov), taken by a chat he started from the queue page on 11 Nov 2026, 09:27 (Eastern). Its
notes: "check each is still so first. The royal shadows and the Silent Order's masks read grey on grey; the Moth is too
wide for a phone; the Silent Order's guest look; the quest marker (the main chat's stand-in cyan gem,
render/quest_mark.ts) may be redrawn."

**Where:** the branch `art/small-notes`, from `main` at `797f2e4` (25.3.1). Four switches in `src/art/small_notes.ts`
(`SMALL_NOTES`), ALL OFF: with them off the game is as it was exactly (`tests/small_notes.test.ts` holds the art to it,
pixel for pixel). Each goes on only at his yes to its picture.

## Each note, checked against the game as it is (25.3.1, a phone held sideways, 844 by 390)

| Note | Still so? | The mend | Switch |
| --- | --- | --- | --- |
| The royal shadows read grey on grey | Yes. On the Quiet Tower's stone their fog is the floor's own grey; only the pink edge sets them apart. | The same fog, set apart: its dark and middle tones deeper, its bone white lights kept, its seam the darkest fog. No colour added. | `shadows` |
| The Order's masks read grey on grey | Yes. The mask reads; the cloak under it is a few grey grains, lost on the floor. | The cloak's ghost of a shape there to see: more of its grains, dark fog in its folds, pale fog along its edges, thinning to nothing at the floor as before. | `masks` |
| The Moth is too wide for a phone | Yes. Its wings and head run off the top and the sides of the screen; the picture's lean brings only its body in. | On the Tower Top the picture is drawn back, as on the Swamp Colossus's stone (0.75 of its size at 844 by 390; the Colossus's is 0.71 there). | `mothView` |
| The Silent Order's guest look | NOT KNOWN. The handoff of 4 Nov is a project file this chat cannot open, and nothing in the repository says what the note was. In the game the guests (floor 17) are as their README has them and read well on the Masque's floors. | None made. Put to him with a picture. | (none) |
| The quest marker may be redrawn | Yes: still the main chat's stand-in, a gem at the coarse grain (a game pixel to a pixel). | The same gem, the friend's cyan, pointing down, cut at the fine grain: its table, its crown and the facets of its point lit from the upper left, a glint on its table. As big as it was, a pixel and a half taller; it bobs and glows as before. | `questGem` |

## What changed in the code

- `src/art/small_notes.ts` (new): the four switches, and what each is.
- `src/art/royal_shadows.ts`: `DEEP` (where each of the eleven tones of fog goes) and two lines of `fogOn`, read only
  with `shadows` on. Every frame of a shadow goes through `fogOn` (its stand, walk, blows, big move, struck, its death
  and the Queen's blink), so all of it is deeper together.
- `src/art/silent_order.ts`: `FOG_FOLD` (three dark greys) and the cloak's ghost in `fog`, read only with `masks` on.
  Their mask, their hood of fog, their fog arms and their death (the fog scattered and gone) are as they were.
- `src/render/quest_mark.ts`: `GEM_FINE`, `GEM_FINE_COLORS`, `drawFineMark`; `drawQuestMark` hands on to it with
  `questGem` on.
- `src/main.ts`: `MOTH_VIEW` and three lines of `zoomWanted` (with `mothView` on, on the Tower Top, the picture is drawn
  back so that at least 312 game pixels of height and 640 of width are seen; on a big screen nothing changes);
  `dbg.smallNotes`, the switches, for the pictures.

## FOR THE MAIN CHAT

- To bring in: merge `art/small-notes`; set on, in `src/art/small_notes.ts`, those he has said yes to (below); test 1 of
  `tests/small_notes.test.ts` asserts all four off: change it then.
- `mothView` is yours to weigh: it is three lines of `zoomWanted` beside the Colossus's, the same way (the world drawn
  larger and shrunk to the screen, the HUD as ever). It holds while he is on the Tower Top, the Moth alive or not. The
  picture's lean toward the Moth (`MOTH_LEAN`, render.ts) is as it was and works with it.
- Cost: none to speak of. The shadows and the masks are painted as before (one table looked up; about five times the
  grains in the masks' cloak, a few hundred a frame). The gem is 25 rows of a few rectangles.

## Checked

- `tsc`: nothing from this branch (`tests/relief.test.ts` line 378 is main's own).
- `tests/small_notes.test.ts` 4 of 4; `royal_shadows` 7 of 7, `silent_order` 11 of 11, `act2_quiettower` 4 of 4,
  `act2_order_armed` 2 of 2, as before.
- Played on a built page at 844 by 390, the switches off and on, no errors: floor 20's packs standing and in a fight
  (`tools/scenarios/small_notes_packs.mjs`, `small_notes_fight.mjs`), the Moth's fight (`small_notes_moth.mjs`: the
  picture at 1.000 with the switch off, 0.750 with it on), the town and floor 2 with the gem
  (`tools/scenarios/quest_marks_look.mjs`).
- Not run: the whole suite (his rule of 7 Nov: only what the change is about).

## The pictures (`pictures/`, each about 1200 wide, for a phone)

- `1_royal_shadows.png`: before and after, a plain pack by the hero on the Tower's stone.
- `2_order_masks.png`: before and after, the masks by the hero.
- `3_moth.png`: before and after, the Moth's Eyes on a phone's whole screen.
- `4_quest_marker.png`: before and after, over the wordsmith.
- `5_order_guests.png`: the Order's guests on floor 17, as they are.

Made with: `node tools/build_to.mjs dist/notes.html`; `node tools/playtest.mjs --file dist/notes.html --touch --size
844x390 --dpr 3 --scenario tools/scenarios/<name>.mjs --out shots/notes/<tag>` (each scenario's head says its
switches); cut and laid out by hand.

## His word on the pictures

(Not yet given: the pictures went to him at about 10:15, 11 Nov 2026.)

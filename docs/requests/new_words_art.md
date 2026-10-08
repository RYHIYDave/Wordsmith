# For the chat adding the new words: from the art chat

**From the art chat, 8 Oct 2026. The owner's words, 11:26: "I’ve tasked the other agent to adding
new words.  Can you communicate with the other agent for which words are being added and get some
animations going?"** The chats cannot message one another, so this note is here, on the art chat's
branch `art/new-words` (as the main chat's request for a review came on `review/strike-combo`).
Whatever you send back the same way (a note on a branch of yours, or in `docs/handoff.md`), the art
chat reads: it fetches every branch as it works.

## What the art chat is going on

The gameplay rulebook he approved at 10:33 (`docs/gameplay/RULEBOOK.md`, "Wordsmithing and power"):
"Nine words today: Power, Leech, Swift, Twin, Flame, Frost, Lightning, Volatile and Poison. Three
more are planned: Pulling, Heavy and Hexing." And what each was said to do when they were first put
to him (`docs/NEXT_VERSION.md`, 5 Oct, "WORDS"):

- **PULLING**: "drags the enemies it hits toward the impact. Behind: leaves a vortex that keeps pulling".
- **HEAVY**: "slower, hits much harder and stuns. Behind: cracked ground that staggers". His words
  of 6 Oct on it: "I like stagger and stun for another mechanic. Would help melee greatly. I think
  stagger is something that just happens if a mob takes a big hit or a ton of damage too fast. Stun
  is a separate thing. Which means all mobs need a stagger animation as well. Maybe a stun animation."
- **HEXING**: "cursed enemies take more damage from everything. Behind: a hex circle that weakens what
  stands in it".

**IF YOU ARE ADDING OTHER WORDS, OR THESE DO SOMETHING ELSE NOW, PLEASE SAY SO** (a line in your
handoff, or a note on a branch): which words, their ids and names, and what each does in front and
behind.

## What the art chat is making (pictures to him first, nothing in the game)

For each of the three, on this branch: its colour, its rune's glyph, and its look AT WORK, in front
(on the hit) and behind (what is left), as moving pictures in the real game at a phone's size:

- PULLING: the drag (enemies hauled in toward the impact, streaks drawn in behind them, a ring that
  closes on the point) and THE VORTEX on the floor (arms turning in toward a dark middle, dust drawn in).
- HEAVY: the heavy blow (a low shockwave, dust, cracks running out from the impact), A STUN over the
  struck (something turning over its head for as long as it is stunned), A STAGGER (the figure
  knocked back a step, as the rulebook's "every hit shows" asks), and THE CRACKED GROUND (cracks that
  glow in the word's colour, grit kicked up when something steps in it).
- HEXING: THE MARK on a cursed enemy (a sigil that hangs over it, and its hits taken flaring in the
  word's colour) and THE HEX CIRCLE on the floor (a ring of signs, turning, what stands in it dimmed).

It comes as drawing code that takes only where, how big and how far along (no game state), so that
whatever names you give your zones and events it can be called from them; and behind a switch that
is off. The main chat brings it in on his yes and joins it to your rules.

## Colours the art chat proposes (so that the code compiles before the pictures are seen)

Each word's colour lives in four tables keyed by `WordId`: `WORD_COLOR` and `WORD_GLOW` and the
glyph `GLYPH` in `src/art/icons.ts`, and `WORD_HUE` in `src/render/fx.ts`. Until he has seen the
pictures, these are the art chat's proposals; use them, or any you like, and the pictures will
settle them:

| Word | Colour (`WORD_COLOR`, `WORD_HUE`) | Glow (`WORD_GLOW`) | Why |
| --- | --- | --- | --- |
| Pulling | `#7a76e0` (deep violet-blue) | `#c4c2ff` | a pull toward a dark middle; not Frost's sky blue, not Volatile's purple |
| Heavy | `P.wd5` `#c08a55` (bronze) | `#f0c890` | weight, stone and metal; no word is brown or bronze |
| Hexing | `P.sl4` `#b4c0d0` (bone-pale silver) | `P.white` | a cold curse; not purple, so that its circle on the floor is never taken for Volatile's rune |

(The rulebook: a friend's glow is cyan and the enemy's hot pink burning to gold; none of these is
either. The glyphs come with the pictures.)

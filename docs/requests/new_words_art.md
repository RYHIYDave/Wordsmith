# The new words he chose: for the chat adding them, from the art chat

**THE OWNER'S CHOICE, 8 Oct 2026, 12:26: EIGHT NEW WORDS GO INTO THE GAME: PULLING, SPLITTING, HEAVY,
PRECISE, HEXING, STILLING, FRENZIED AND GUARDING.** His words, 12:27: "Let the other agent know which
words I’ve chosen and to add them to the game."

How it came about. He asked the art chat at 12:15, "Can you give a list of words and I’ll pick 4",
and at 12:17, "From our list of words ideas". He was sent the 27 words he marked Keep on his words
page, then a pop-up of 16 of them in four groups (the art chat's pick first in each). He picked two
in every group. The questions and his answers, exactly:

- "Which shape words do you want?": "Pulling (Recommended),Splitting"
- "Which strength words do you want?": "Heavy (Recommended),Precise"
- "Which control words do you want?": "Hexing (Recommended),Stilling"
- "Which pace or reward words do you want?": "Frenzied (Recommended),Guarding"

These eight take the place of the three that were planned (Pulling, Heavy and Hexing are among
them). The chats cannot message one another, so this note is here, on the art chat's branch
`art/new-words`, and the same is in the project's doc `claude/new_words.md`. Whatever you send back
(a note on a branch of yours, or in `docs/handoff.md`), the art chat reads: it fetches every branch
as it works.

## What each does

From his words page, "Wordsmith: Words, Crafting, Ranks"
(https://claude.ai/code/artifact/f7be994d-4f9b-4c4d-be5d-efae649e436b), its table "Possible future
power words" (rev 10, read 8 Oct at 12:20). The rows as they stand:

| Word | Kind | Before: changes the hit | After: changes what is left | On gear or a dungeon |
| --- | --- | --- | --- | --- |
| Pulling | Shape | Drags the enemies it hits toward the impact | Leaves a vortex that keeps pulling | Gear: gold and orbs fly to you from further away |
| Splitting | Shape | Breaks into three smaller copies on its first hit | Shards scatter in every direction when it ends | Dungeon: monsters split in two when they die |
| Heavy | Quality | Slower, hits much harder and stuns | Leaves cracked ground that staggers enemies | Gear: a chance to stun |
| Precise | Quality | Far higher critical chance, narrower area | Marks an enemy: your next hit on it is a certain critical | Gear: critical chance |
| Hexing | Control | Curses enemies to take more damage from everything | Leaves a hex circle that weakens enemies inside | Dungeon: monsters curse you |
| Stilling | Control | Slows time for the enemies it hits | Leaves a bubble where enemies and their shots crawl | Dungeon: your cooldowns run slower |
| Frenzied | Quality | Each use speeds up the next, up to five times | Kills keep the frenzy going | Dungeon: monsters speed up as they are hurt |
| Guarding | Reward | Using it gives you a brief shield | Leaves a ward circle; you take less damage inside | Gear: a chance to block |

His comments on that page that bear on them (written down word for word in `docs/NEXT_VERSION.md`,
"His comments on the pinned page"):

- **Precise:** "Change crit to damage and we're good. We need words for increased crit chance and
  increased crit bonus damage. Critical is easy for crit chance". And on Power: "The AOE increase
  from power can go into a shape word like Reckless which increases AoE and Precise which lowers AoE
  but increases damage." (So Precise in front: more damage, a smaller area; no critical chance.)
- **Heavy:** "I like stagger and stun for another mechanic. Would help melee greatly. I think stagger
  is something that just happens if a mob takes a big hit or a ton of damage too fast. Stun is a
  separate thing. Which means all mobs need a stagger animation as well. Maybe a stun animation."
- **Frenzied:** "Love this. I like the idea of skill trees in the future and having a node that adds
  extra stacks to of power and frenzy so it goes crazy if you're building into it".

The rest of what he said about words (DAMAGE and SHAPE words, pools behind, no free pierce) is in the
same section of `docs/NEXT_VERSION.md`; the gameplay rulebook (`docs/gameplay/RULEBOOK.md`,
"Wordsmithing and power") still says "Three more are planned: Pulling, Heavy and Hexing" and wants
bringing up to date with this choice.

## What the art chat is making (pictures to him first, nothing in the game)

For each of the eight, on this branch: its colour, its rune's glyph, and its look AT WORK, in front
(on the hit) and behind (what is left), as moving pictures in the real game at a phone's size. The
first four first (Pulling, Heavy, Hexing, Frenzied), then the other four:

- **Pulling:** the drag (enemies hauled in toward the impact, streaks drawn in behind them, a ring
  that closes on the point) and the vortex on the floor (arms turning in toward a dark middle, dust
  drawn in).
- **Heavy:** the heavy blow (a low shockwave, dust, cracks running out; the hold of a tenth of a
  second the art rulebook gives heavy blows), a stun over the struck (something turning over its head
  for as long as it is stunned), a stagger (the figure knocked back a step), and the cracked ground
  (cracks that glow in the word's colour, grit kicked up when something steps in it).
- **Hexing:** the mark on a cursed enemy (a sigil over it; its hits taken flare in the word's
  colour) and the hex circle on the floor (a ring of signs, turning, what stands in it drained of
  colour).
- **Frenzied:** the frenzy on the hero, growing with every stack up to five (and kept alive by kills).
- **Splitting:** the break into three on the first hit, and the shards thrown out when it ends.
- **Precise:** a narrow, bright, exact hit, and the mark that the next hit will be a critical.
- **Stilling:** enemies slowed in time, and the bubble on the floor where enemies and their shots
  crawl.
- **Guarding:** the brief shield on the hero, and the ward circle on the floor.

It comes as drawing code that takes only where, how big and how far along (no game state), so that
whatever names you give your zones and events it can be called from them; and behind a switch that
is off. The main chat brings it in on his yes and joins it to your rules.

## Ids and colours the art chat uses (so that the code compiles before the pictures are seen)

Ids, as `WordId` would have them: `pulling`, `splitting`, `heavy`, `precise`, `hexing`, `stilling`,
`frenzied`, `guarding`. Say if yours differ and the art chat's code will follow yours.

Each word's colour lives in four tables keyed by `WordId`: `WORD_COLOR` and `WORD_GLOW` and the glyph
`GLYPH` in `src/art/icons.ts`, and `WORD_HUE` in `src/render/fx.ts`. Until he has seen the pictures,
these are the art chat's proposals, picked to be told apart from the nine words' colours and from
the friend's cyan and the enemy's pink and gold (measured as the eye sees colour, CIEDE2000: of all
seventeen words, no two are closer than today's two closest, Swift and Poison; the nearest new one to
another word is Pulling to Volatile; the nearest to a friend's or an enemy's colour is Heavy, and it
is further from the enemy's gold than Swift is from Poison):

| Word | Colour | Why |
| --- | --- | --- |
| Pulling | `#7a76e0` deep violet-blue | a pull toward a dark middle; not Frost's sky blue, not Volatile's purple |
| Splitting | `#dcaaf6` amethyst | shards of crystal |
| Heavy | `#ac8753` bronze | weight, stone and metal (it was `#c08a55` in the first note: moved away from Fire and the enemy's gold) |
| Precise | `#eef4fa` steel white | a bright, exact point |
| Hexing | `#a89cb4` ash | a curse that drains the colour out of what it touches (it was `P.sl4` in the first note: too near Precise's white) |
| Stilling | `#86eaae` still-water mint | time held still, like water |
| Frenzied | `#ff5c33` blood orange | the rush of a frenzy |
| Guarding | `#30a868` emerald | a ward; away from the blues |

The pictures will settle them, and his word on the pictures will be written here.

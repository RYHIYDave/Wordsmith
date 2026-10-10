# Mock-up: PACK LEADERS: the skeleton champion, and the rings that tell blue and yellow packs apart (NOT IN THE GAME until the main chat puts them there)

**What it is.** A yellow pack's leader drawn as a monster of his own, the SKELETON CHAMPION (his own
idea), and a way to tell a blue pack from a yellow pack at a glance: the ring on the floor under each
of a pack. Both asked for by the main chat (its post of 08:30 on the board), to take the place of
Version 19.7's look (`game/defs.ts` `PACK_LOOK`; `render.ts` `named`, `nameColor`, `drawBars`). All of
it has his yes. Behind switches that are off: the champion with the new monsters (`NEW_MOBS` in
`src/art/new_mobs3.ts`), the rings `PACK_MARKS` in `src/render/pack_marks.ts`. Nothing of the game
imports either.

**Where:** the branch `mockup/pack-leaders`, from `mockup/new-mobs` at `b801ce2` (the new monsters
with their attacks, and Version 19.7's `main` merged in).

## His words

- In the main chat, 9 Oct, by 08:02 (that chat's post of 08:30): "A magic pack (blue) is affected by
  one word, and that would mean everything in that pack was affected by the word.  A yellow pack would
  give the leader of the pack a word or two (I don’t remember how we designed that), and the other in
  the pack become “minions” of the leader, gaining 50% of the words bonus.  So we have a pack of
  skeletons.  The skeleton champion, who let’s say has an old rusty helmet and a two handed sword, has
  Flame, and the smaller minions would essentially have a 50% Flame." And at 08:24: "Pack leaders that
  are different mobs can have an extra attack if it seems right."
- His brief for the champion (the art rulebook's "A new character"), asked by this chat as a pop-up,
  answered by 11:51, each our pick: "A head taller (Recommended)" (he stands over his skeletons, as tall
  as the Boneward but leaner, no shield); "Proud and heavy (Recommended)" (standing with his sword
  planted point-down, hands on the hilt; walking, he drags its point along the floor); "Cleave and a
  rallying cry (Recommended)" (a great two-handed cleave; and he raises his sword and roars, his
  minions' words flaring to full for a moment); "To his knees on his sword (Recommended)" (he sinks to
  his knees leaning on his sword, then crumbles; the helm rolls away).
- By 12:19, to `champion_sheet.png`: "Yes, this is him (Recommended)"; to `champion_moves.gif`,
  `champion_march.gif` and `champion_death.gif`: "Yes, keep them (Recommended)"; to `packs.png` and
  `pack_cry.gif`, asked "use them in place of today's look?": "Yes, use the new rings (Recommended)".

## The skeleton champion (`CHAMPION`, `makeChampionArt3` in `src/art/new_mobs3.ts`)

- **His look.** The new skeleton's bones (as the Boneward's), a head taller than his skeletons and
  leaner than the Boneward. An old rusty GREAT HELM: straight-sided and flat on top, closed but for a
  slit across it where his eyes burn pink, a ridge down its face, a riveted band round its brow,
  breathing holes on its right cheek, rust in patches; on its crown a crest of torn wine-red cloth,
  streaming back. A torn cape of the same cloth down his back. Rusted pauldrons. His TWO-HANDED
  SWORD: a long blade of old iron with a groove down it, notched and rusted, a broad crossguard, a long
  grip bound in cord, a round pommel (drawn along its line as the skeleton's sword is, `greatSword`).
  His word is not painted on him: the ring under him shows it.
- **Standing** (`stand`, 24 frames at 10 a second): his sword planted point-down before him, both hands
  on its hilt; his weight shifting, his head turning to look over his pack, his jaw clacking, cape
  and crest stirring.
- **His march** (`walk`, 8 frames at 10 a second, painted for 1.2 tiles a second, `CHAMPION_PACE`;
  shown faster or slower for another pace, `walkFpsAt`): upright and heavy, each step coming down hard,
  his left hand swinging, his sword low in his right hand with its point dragged along the floor
  behind him. A foot that is down stays where it is on the floor.
- **His cleave** (`attack`, his basic attack; the blow at `CHAMPION_HIT`, 0.8 s): the sword wrenched up
  out of the floor and swung up and back over his right shoulder in both hands, his body turned away,
  his weight on his back foot, held, his eyes flaring in the slit (the warning); then a step into it,
  his hips driving forward and the blade cleaving down across him, a streak behind its point, dust
  kicked up round his front foot; held a beat, and the sword set point-down again.
- **His rallying cry** (`moves.rally`; the cry at `RALLY_CRY`, 0.85 s, the clip's `hit`): the sword
  raised high in both hands, its point to the roof, his head thrown back and his jaw wide; light
  bursting from its point, a burst of embers out from his chest as he roars, embers rising round him;
  then set down again. What it does for his minions is the rules'; the rings show it (below).
- **Struck** (`reel`, 0.3 s): rocked back on his heels, his hands keeping hold of the planted sword,
  his head knocked back, the cape flaring.
- **His death** (`die`, 2.0 s): a jolt; he sinks to his knees, both hands still on the hilt of the
  planted sword, his helm bowed, the light going out of his eyes; then he crumbles, his helm rolling
  away, his cape a heap where he knelt, and HIS SWORD LEFT STANDING IN THE FLOOR.
- Pink is his: every living frame has the enemy's edge, his eyes and his cry burn pink to gold, and
  nothing on him is cyan.

## The rings (`drawPackMark` in `src/render/pack_marks.ts`)

Drawn on the floor under each of a pack, where `render.ts` draws a named monster's dotted ring today,
in the game's own pixels: `drawPackMark(g, at, x, y, r, mark, t)`, with `at` a floor point on the
screen (`(x, y) => [wx(cam, x, y), wy(cam, x, y)]`), `r` the monster's half-width (tiles), `t` the
time, and `mark` `{ rarity, words, cry? }`:

- **A blue pack** (`rarity: 'blue'`, every one of it): a blue ring (`RARITY_COLOR[1]`, the colour of
  magic things) with, inside it, a ring of its word's colour, dotted and turning: every one has the
  word, whole.
- **A yellow pack's leader** (`'leader'`): its ring WRITTEN IN ITS WORD (or words, each in its colour)
  as the art rulebook has it (his yes of 8 Oct to the ring of letters, `mockup/words-in-world`), at
  least 0.9 of a tile out (`LETTERS_OUT`), ringed in gold (`RARITY_COLOR[2]`, the colour of rare things).
- **Its minions** (`'minion'`): a gold ring, broken, half of it there (they have half of each of its
  words). While the leader cries out (`cry`, 0 to 1), the gaps fill with the word's colour and the ring
  flares: their half made whole for a moment.
- Names and bars as Version 19.7 has them (a blue pack's name once, in blue; the leader's in gold), and
  the rune stone of the word over the leader as over any named monster.

## For the main chat

- Merge `mockup/new-mobs` first (or this branch whole: it holds all of that). Switch on with
  `NEW_MOBS.on` (the champion is made with the new three) and `PACK_MARKS.on`.
- The champion as a yellow pack's leader of skeletons: `makeChampionArt3(pace)` gives him as the game
  takes a monster (`ActorArt`: both facings, `idle`, `walk`, `attack` stills, `clips.attack`, `clips.die`,
  `clips.reel`, and `clips.moves.rally`). His figure's size for `FIGURE_SIZE`: a head over the skeleton's.
- The rings take the place of the dotted ring under a pack's monsters (`render.ts`, "shadows, and the
  rings that mark elites"): for a monster with `rarity` `'blue'`, `'leader'` or `'minion'`, call
  `drawPackMark` with its words (a minion: its `half` words) and, while its leader cries, `cry`.
- What the cry does (for how long his minions have his words whole), and when he cries, are the rules'.

## How it is checked

- `tests/pack_leaders.test.ts` (8): the switches are off and the champion is not one of the new three;
  he paints in every pose both ways round, nothing cyan, his edge while he lives and none as he dies,
  and he is a head taller than his skeletons; his march goes round and his feet grip the floor; he is
  made as the game takes a monster, his blow and his cry on their frames, his march matched to a pace;
  his eyes flare as he winds up, and the warning is not the cry; his cry raises the sword over his helm
  with a light at its point; he dies to his knees with his hands on the planted sword, and the sword
  still stands when all else is down; the rings: blue with the word inside, a leader's gold and further
  out, a minion's gold and half there, filling with the word as he cries, nothing cyan.
- `tests/new_mobs3.test.ts`: the mock-up is now three files, and no file of the game names any of them.
- The pictures (`src/dev/preview_champion.ts`): `champion_sheet.png` (`sheet:3`), `champion_moves.gif`
  (`film:3`), `champion_march.gif` (`march:3`), `champion_death.gif` (`death:3`), `packs.png`
  (`packs:2`: Version 19.7's look above, the new rings below), `pack_cry.gif` (`cry:3`); and
  `strip:<move>:<view>` and `pose:<move>:<seconds>:<view>` for looking closely.

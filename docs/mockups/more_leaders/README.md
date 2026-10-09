# Mock-up: MORE PACK LEADERS: the bone marksman, the high priest and the troll chieftain (NOT IN THE GAME until the main chat puts them there)

**What it is.** A yellow pack's leader for each of the other kinds of pack, beside the skeleton
champion (`mockup/pack-leaders`): the BONE MARKSMAN, who leads bone archers; the HIGH PRIEST, who
leads cultists; and the TROLL CHIEFTAIN, who leads trolls. Bats have none (his word). All three have
his yes. Nothing of the game makes them: the marksman is with the new monsters, behind `NEW_MOBS`
(off, `src/art/new_mobs3.ts`); the high priest and the chieftain are made by makers of their own in
their cultists' and their trolls' files (`makeHighPriestArt` in `src/art/monster_cultist.ts`,
`makeChieftainArt` in `src/art/monster_brute.ts`), which nothing of the game calls; what they put on
the floor is drawn in `src/art/mob_shots.ts`, the mock-up's file, which nothing of the game imports.
The cultist, the gravecaller, both trolls, the new three and the champion are as they were: every
frame of them was painted before and after, and is the same pixel for pixel.

**Where:** the branch `mockup/more-leaders`, from `mockup/pack-leaders` at `d4a6070` (which holds
`mockup/new-mobs` and Version 19.7's `main`), with `art/monster-attacks` at `dd38870` merged in (the
trolls' and the Warden's new moves: the chieftain's swing is his trolls'). The main chat's branch
`attacks` holds `dd38870` too.

## His words

- Asked in this chat who should lead each kind of yellow pack (a pop-up, our pick first), by 14:32:
  "A bone marksman (Recommended)" for the bone archers; "A high priest (Recommended)" for the
  cultists; "A troll chieftain (Recommended)" for the trolls; and of the bats, "Bats I dont think need
  a leader".
- Their briefs (the art rulebook's "A new character"), each asked as a pop-up, our pick first:
  - THE BONE MARKSMAN, by 14:32: "A head taller (Recommended)", "Still and patient (Recommended)",
    "His bow snaps (Recommended)"; and for the Sound chat, "Creak, rattle, deep twang (Recommended)".
  - THE HIGH PRIEST, by 14:41: "Their size" (offered as "As tall as they are; you know him by his
    mask and his censer."), "A slow procession (Recommended)", "His robe crumples empty
    (Recommended)"; and for the Sound chat, "A chant and a chain's clink (Recommended)".
  - THE TROLL CHIEFTAIN, by 14:41: "Bigger than his trolls (Recommended)" (offered as "A head over
    them and broader, with his crown of antlers and bone and the banner on his back."); asked whether
    he should bellow to drive his trolls on, in his own words: "I don’t want the bellow if the Skelton
    leader has the same thing" (so he has his trolls' swing and slam, heavier and slower, and no cry:
    the rallying cry stays the champion's alone); "To his knees, then face-first (Recommended)"
    (offered as "He drops to his knees, then topples forward, and his banner falls over him."); and
    for the Sound chat, "A huge rumbling bellow (Recommended)".
- His yes to their pictures, each asked as a pop-up, our pick first:
  - By 15:17, to the marksman's (`marksman_sheet.png`, `marksman_film.gif`, `marksman_walk.gif`,
    `marksman_death.gif`, `marksman_shotfilm.gif`): "Yes, this is him (Recommended)", "Yes, keep
    them (Recommended)", "Yes, keep the line (Recommended)".
  - By 15:34, to the high priest's (`priest_sheet.png`, `priest_film.gif`, `priest_walk.gif`,
    `priest_death.gif`, `priest_shotfilm.gif`): "Yes, this is him (Recommended)", "Yes, keep them
    (Recommended)", "Yes, keep it (Recommended)".
  - By 15:46, to the chieftain's (`chieftain_sheet.png`, `chieftain_film.gif`, `chieftain_walk.gif`,
    `chieftain_death.gif`): "Yes, this is him (Recommended)", "Yes, keep them (Recommended)".
- The Sound chat has the three sound briefs (this chat's post of 14:41 on the board).

## The bone marksman (`MARKSMAN`, `makeMarksmanArt3` in `src/art/new_mobs3.ts`)

- **His look.** One of the bone archers (the archer on the bones, his yes of 8 Oct), a head taller
  than they are, and lean: the archers' red hood over his skull, its point hanging down his back; a
  long cloak of a red so deep it is nearly black, torn at the hem; a quiver of long arrows on his
  back; and A GREAT BOW AS TALL AS HE IS, of near-black wood, its tips ears of bone, its grip bound in
  red cord. His word is not painted on him: the ring under him shows it (`render/pack_marks.ts`).
- **Standing** (`stand`, 24 frames at 10 a second): still and patient, resting on his great bow, its
  lower tip on the floor. Only his head turns, slowly, and his cloak stirs; his jaw clacks now and then.
- **His walk** (`walk`, 8 frames at 10 a second, painted for 1.5 tiles a second, `MARKSMAN_PACE`;
  shown faster or slower for another pace, `walkFpsAt`): upright and unhurried, long smooth steps,
  his bow carried off the floor at his left side, his cloak and his hood's point streaming back. A
  foot that is down stays where it is on the floor. (His steps are long: in the two frames where both
  feet reach for the floor his legs are at full stretch, his feet within a picture pixel and a half
  of it, as he was shown.)
- **His shot** (`attack`, his basic attack; the string let go at `MK_SHOT_HIT`, 0.7 s): as his archers
  shoot, slower and steadier: the bow lifted off the floor as he turns side-on, one long pull to his
  jaw, held, the arrowhead spitting (the warning); the string goes, the bow kicks; he sets it down on
  its tip again.
- **HIS GREAT SHOT** (`moves.pierce`, his own move; the string let go at `MK_PIERCE_HIT`, 1.6 s): he
  plants his feet, reaches back over his shoulder and draws a long arrow from his quiver, its head
  already smouldering; raises it over his head, nocks it, and draws the great bow past his jaw toward
  his ear; and HOLDS, while its head gathers light, pink burning to gold, embers dripping from it and
  his eyes burning (the warning). Then the string goes: a flash at the bow, a streak of gold out along
  the arrow's way, his cloak flaring; he watches it go, and sets the bow down.
- **Struck** (`reel`, 0.3 s): rocked back on his heels, his hand keeping hold of the bow where it
  stands, his head knocked back, his cloak flaring.
- **His death** (`die`, 1.9 s): HIS BOW SNAPS. A jolt; he heaves the great bow up and draws it one last
  time, with no arrow on it, his bones shaking under the strain; it snaps above the grip with a flash
  of bone-white, its upper limb flying off turning, splinters bursting (at `MK_SNAP`, 0.5 s). The light
  goes out of his eyes; he sways, his knees go, and he comes apart, his skull rolling away in its hood,
  his quiver spilling its arrows, his cloak a heap where he stood.
- **On the floor** (`src/art/mob_shots.ts`, in the game's own pixels, given where a point of the floor
  is on the screen, as the floor's effects are drawn):
  - `drawAimLine(g, at, x0, y0, x1, y1, k, t)`: HIS LINE OF AIM, while he holds his great shot: from
    under him toward his mark, running out as he draws (`k`, 0 to 1; in the pictures, from his nocking
    the arrow at 0.52 s to the string going at 1.6 s); a dotted line of the enemy's pink whose dots
    run away from him along it, gold at its height, with chevrons pointing the way it will fly.
  - `drawGreatArrow(g, at, x, y, z, fx, fy, t)`: THE GREAT ARROW IN FLIGHT, its head at `(x, y)` on the
    floor and `z` game pixels over it, flying the way `(fx, fy)`: a long dark shaft, pink fletching, its
    head burning gold, a long streak of light behind it, sparks shed from it, and its shadow on the
    floor under it. (In the pictures it flies at 16 tiles a second; his plain arrow at 10.)

## The high priest (`makeHighPriestArt` in `src/art/monster_cultist.ts`)

- **His look.** One of his cultists (the cultist's own rig), as tall as they are, known by two things:
  A MASK, a smooth face of old ivory in the dark of his cowl, its eye slits slanting down with the pink
  burning in them, a mark of gold on its brow; and HIS CENSER, hanging on a chain from the iron crook
  of a tall staff of dark wood in his left hand (where a cultist holds its knife): a round iron vessel,
  fire in its holes and licking from its top, smoke rising from it. His stole is edged in gold. The
  flame in his right hand is his cultists'.
- **Standing** (12 frames at 10 a second): his censer sways on its chain, smoking.
- **His walk, A SLOW PROCESSION** (8 frames at 9 a second, `PROCESSION_FPS`; his cultists' at 14):
  short gliding steps under the robe, hardly a bob, the staff carried upright, the censer swinging on
  its chain with his steps and trailing smoke.
- **His fire bolt** (`attack`, his basic attack; the blow on his cultists' frame, 0.767 s): as his
  cultists throw theirs, the fire swelling over his cowl (the warning); his staff stays where it is.
- **HIS CENSER** (`moves.censer`, his own move; the swing at its widest at `CENSER_HIT`, 0.8 s): he
  raises his staff and swings the censer back on its chain, where it flares and pours smoke (the
  warning, held); then swings it down under the crook and round and out before him, its burning smoke
  streaming along the arc.
- No struck clip, as his cultists have none.
- **His death** (`die`, 1.5 s, `PRIEST_DIE_TIME`): HIS ROBE CRUMPLES EMPTY, as his cultists' do: a
  shudder, his fire and his censer flaring; then there is nobody in the robe, and it folds down onto
  its hem, the cowl coming down on it; his staff topples; his censer drops from its chain and rolls
  away, spilling fire that burns a moment on the floor; and his mask, left hanging where his face was,
  its eyes still burning, falls last onto the heap and goes dark.
- **On the floor:** `drawBurningSmoke(g, at, x, y, r, k, t)` (`src/art/mob_shots.ts`): HIS BURNING
  SMOKE, where it settles before him: round `(x, y)`, `r` tiles across its middle, `k` of the way
  through its life (0: just come down; it billows out to its full size in the first part of it, lies
  there burning, and thins away in the last): a low cloud of rolling puffs, thicker in its middle, lit
  deep pink from under, embers glowing pink and gold in it, rising and going out. (In the pictures it
  comes down at the censer's blow, 1.9 tiles before him, 1.15 tiles across, and lasts 2.6 s.)

## The troll chieftain (`makeChieftainArt` in `src/art/monster_brute.ts`)

- **His look.** The green troll's rig (his slate-blue hide, his hide skirt, his strap, his studded club
  carried at his side), bigger than the red troll (1.45 times the green troll, the red 1.3), on a
  canvas of his own (`CHIEF_CANVAS`, 208 by 212 picture pixels, his floor point at (92, 180)); known by
  two things: A CROWN OF ANTLERS AND BONE, a circlet of bone and teeth round his little head and two
  great antlers branching up and out of it; and HIS BANNER, on a pole of dark wood on his back, its top
  a small skull, its cloth a ragged hide of old red painted with a pale sign of antlers, flying behind
  his head and stirring as he moves.
- **Standing** (12 frames at 7 a second) **and walking** (8 frames at 8 a second): his trolls', slower:
  he is heavier (the green troll 8 and 11, the red 8 and 9). His banner flies.
- **His slam** (`attack`, his basic attack; the blow at 1.033 s): his trolls' slam, a fifth slower.
- **His swing** (`moves.swing`; the blow at 0.733 s): his trolls' club swing (`TROLL_MOVES`), a fifth
  slower. He has it whether `TROLL_MOVES` is on or off (nothing of the game makes him).
- **No bellow** (his words above): nothing of his own besides the swing.
- No struck clip, as his trolls have none.
- **His death** (`die`, 1.6 s, `CHIEF_DIE_TIME`): TO HIS KNEES, THEN FACE-FIRST: as his trolls' (rocked
  back with a roar, his club out of his hand, his knees giving, sagging on them), then over, all the
  way down onto his face; his banner leaves him as he goes over, topples forward and falls across him;
  and as he lands his crown comes off and rolls away.

All three: pink is theirs. Every living frame has the enemy's edge, what glows on them is pink burning
to gold (the fire the high priest throws is his cultists', its heart white-hot), nothing on them is
cyan, and the dying have no edge.

## For the main chat

- Merge this branch whole: it holds `mockup/pack-leaders` and `mockup/new-mobs`. The marksman is made
  with the new monsters (`NEW_MOBS.on`).
- As the game takes a monster (`ActorArt`: both facings, `idle`, `walk`, the three `attack` stills,
  `clips.attack`, `clips.die`):
  - `makeMarksmanArt3(pace)`: and `clips.reel`, and `clips.moves.pierce` (his great shot).
  - `makeHighPriestArt()`: and `clips.moves.censer`.
  - `makeChieftainArt()`: and `clips.moves.swing`.
- Their sizes for `FIGURE_SIZE`, measured from the pictures as `tests/monsters.test.ts` measures them
  (game pixels: the top of the head on the figure's own centre line, and half its width), for you to
  set: the marksman top 33, half 10 (beside the bone archer on bones, 28); the high priest as his
  cultists, top 30, half 9; the chieftain's head is at 48, but his antlers stand up to 58 (they are of
  his head, as the Warden's horns are of his): top 58, half 23 (beside the red troll's 36 and 21).
- The rules are yours: how far and how fast the great shot flies and what it pierces; how big the
  burning smoke is, how long it lasts and what it does; when each leader uses his own move. In the
  pictures: the line of aim runs out from his nocking the arrow to the string going, the great arrow
  flies at 16 tiles a second, the smoke lies 1.9 tiles before the high priest for 2.6 s.
- Bats have no leader (his word): how a yellow pack of bats goes is yours to settle with him.
- Their sounds are the Sound chat's (its briefs: this chat's post of 14:41).

## How it is checked

- `tests/more_leaders.test.ts` (13): the switch is off, and nothing of the game makes any of them; THE
  MARKSMAN paints in every pose both ways round, nothing cyan, his edge while he lives and none as he
  dies, a head taller than his archers; his walk goes round and his feet grip the floor; he is made as
  the game takes a monster, his shot and his great shot on their frames, his walk matched to a pace;
  his great shot: the arrow over his head, its light gathering as he draws and holds (not his plain
  shot's warning), a flash and a streak as it goes, and the light gone after; dying, his bow snaps, a
  flash of bone-white and none before, its upper limb flying up, nothing lit left; THE HIGH PRIEST is
  his cultists' size, with his mask and his censer, every frame painted, nothing cyan, his edge while
  he lives and none as he dies; his fire bolt on his cultists' frame, his censer's swing on its frame,
  flaring as he holds it back, its smoke streaming; a slow procession; his robe down while his mask
  still hangs, then the mask on the heap; THE CHIEFTAIN is bigger than his trolls, his antlers over his
  head and his banner on his back, every frame painted, nothing cyan; his slam and his swing a fifth
  slower than his trolls', each on its frame, no bellow, heavier on his feet; to his knees, then on
  his face, his banner over him and his crown rolled away; ON THE FLOOR, the line of aim runs out as he
  draws, the great arrow flies over its shadow, the smoke billows, burns and thins away, nothing cyan.
- Every frame of the cultist and the gravecaller (252), of both trolls with `TROLL_MOVES` off and on
  (916), and of the new three and the champion (2376) was painted before the leaders were added and
  after: the same, pixel for pixel.
- The whole unit suite on this branch (`tsx --test tests/*.test.ts`, 847 tests): all pass; and
  `tsc --noEmit`.
- The pictures (`src/dev/preview_leaders.ts`, `<leader>` one of `marksman`, `priest`, `chieftain`):
  `<leader>_sheet.png` (`sheet:<leader>`), `<leader>_film.gif` (`film:<leader>:3`),
  `<leader>_walk.gif` (`walk:<leader>:3`), `<leader>_death.gif` (`death:<leader>:3`),
  `marksman_shotfilm.gif` and `priest_shotfilm.gif` (`shotfilm:<leader>:3`); and `strip`, `pose` and
  `poses` for looking closely.

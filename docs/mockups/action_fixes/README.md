# Three fixes from his look at the night's films (mock-ups; branch `art/action-fixes`)

An art helper's work on `art/action-fixes` (from `art/action-f16` 8fafbbf: all the action work so far). Each mock-up is changed IN
PLACE, in its own files, behind its own switch, still off; its own test and README say what changed. Nothing here is in the game
until the main chat puts it there, on his yes. The game's own frames are unchanged (each mock-up's test checks its hashes).

## His words, 2 Nov 2026

- 07:32: “The carrion queen’s dive should be a much bigger AOE, and really sell it with dirt and dust on the impact.  The sluice
  gates should just open periodically in the rat king fight, I don’t think it needs to be one of his moves.  Just an arena hazard.”
- 07:33: “I’m not in love with the bramble charge from the deer.  Maybe it’s just the look I don’t love, not sure”
- By 07:36, asked what goes in the sluices' place among the Rat King's moves: “His roll, back and bigger (Recommended)” (offered as:
  he curls into a ball, a big held wind-up, then barrels down a wider marked lane, fast).
- By 07:36, asked about the deer: “Redo hedge and gallop (Recommended)” (offered as: same move; the hedge becomes dark, living
  brambles: leaves, hooked thorns, writhing up; the deer stretches into a full gallop).

## The three

1. **THE CARRION QUEEN'S DIVE** (docs/mockups/action_f7_queen/README.md, `QUEEN_ACTION`; art/carrion_queen_action.ts `QA_DIVE`,
   art/carrion_queen_action_fx.ts `diveStrikes`, `paintDiveMarks`, `paintDiveBurst`). The area she strikes **3.2 round** (was 1.6;
   the game's own 1.1), marked plain on the rock while she hangs (a thick ring closing in, a fainter one inside, her shadow growing).
   Where she strikes THE ROCK BURSTS: a fountain of dirt, grit and broken rock (a column at its middle, up to about 200 of the
   picture's pixels), a thick ring of dust rolling out to the area's edge in under half a second, chunks falling back and bouncing
   twice, the dust hanging and drifting off with the wind for **2.3 s**, the crater and its cracks left **2 s**; the game's shake 8
   (the most it uses). The eyrie's own colours; never cyan. Her body and her timings unchanged (2.8 s, her talons in at 1.6 s).
2. **THE RAT KING** (docs/mockups/action_f12_ratking/README.md, `RATKING_ACTION`; art/ratking_action.ts, art/ratking_action_fx.ts).
   - THE SLUICES are the cistern's own now: **every 14 s, the first 9 s in** (a suggestion; `SLUICES`, `sluiceAt`): the lanes marked
     first, the gates grinding open from 0.6 s, bursting at **2.0 s**; the flood down the lanes **3 s**, draining 0.8 s; the dry
     ledges plain. Drawn by itself, needing nothing from him: they go off while he bites, spits a word or rolls. What the rules need
     to run them: a clock of the fight's own (README there).
   - His rearing summons is gone from his moves; HIS ROLL is back, bigger, by Movement 9 (one clip, `moves.roll`, 3.2 s): curled into
     a ball by 0.5 s, rocked back and HELD 0.8 s spinning up in place; **off the line in two frames (2.2 tiles)**; **13 tiles a
     second** (was 6.45) down a lane **2.4 wide** (was 1.5), **11.1 tiles** long; bursting open where he stops, **a ring 2.2 round**.
3. **THE TWISTED DEER'S BRAMBLE CHARGE** (docs/mockups/action_f9/README.md, `DEER_BRAMBLE`; art/action_f9_pinewood.ts). Same move,
   same times, sizes and wall. THE GALLOP: body low and long, head and antlers down and forward, legs reaching far out in front (29
   of its lengths, was 11 at its stand) and far back (35), gathering and stretching, two flights a stride, feet gripping, mud kicked
   up. THE HEDGE: living bramble, green-black canes coiled as they come up and writhing open, arching over, curling at their tips,
   dark three-fingered leaves, big hooked thorns, writhing slowly while it stands, withering and sinking at the end.

## The pictures (`pictures/`)

- `action_fixes.mp4` (1200 × 676, 47.2 s, 30 a second, H.264 yuv420p, captioned): the Queen's dive with the knight, from in front
  (he runs clear of the marked ground) and from behind (he is caught in it), then its impact at half speed; the Rat King's cistern
  from above (the game's own picture pixels), the sluices opening on their own twice while he spits a word and while he rolls, the
  knight on the ledges; his roll close (twice as big), from in front and from behind, and at half speed; the deer's charge and its
  bramble with the knight (three times as big), from in front and from behind, its gallop at half speed, and the bramble withering.
- `action_fixes_sheet.png` (1200 × 5576): each one's old beside its new at the same scale (the old from the branch before, made by its
  own film tools at the same zoom), and the key moments of each.

Made by: `tools/action_fixes_film.ts` (the film), `tools/action_fixes_sheet.ts` and `tools/action_fixes_sheet.py` (the sheet),
`tools/action_fixes_peek.ts` (the helper's own stills). The scenes are each mock-up's own (src/dev/action_f7_queen_scene.ts,
src/dev/ratking_action_scene.ts, src/dev/action_f9_scene.ts).

## The checks

- `tests/queen_action.test.ts` (14 tests), `tests/ratking_action.test.ts` (5), `tests/action_f9.test.ts` (5): each updated to its
  new numbers, all passing (each mock-up's README says what each checks); the game's own frames hash as before in each (the Queen
  `d41a8cbde1d948d1`; the Rat King `e0df474ef6b3a1cb`, his moves drawn `45bc53ab47f551ee`; the deer, wolf and Drowned as before).
- The figures' own tests as before: `tests/rat_king.test.ts`, `tests/carrion_queen2.test.ts`, `tests/twisted_deer.test.ts`,
  `tests/new_mobs3.test.ts` (59 passing).
- The reviews: the Rat King's roll through the review for the old rigs where the game carries him (`pose9World`, `shift`), both ways
  round, six pairs of feet as his soles: nothing found; the deer's new gallop through it, both pairs of feet: nothing found.
- `tsc --noEmit -p tsconfig.json` clean.
- Changed outside the mock-ups' own files (no frame of the game's changes): art/rat_king.ts, its ball (`BALL_R`, `BALL_Z`,
  `ballPose`) exported (`export` added; nothing else).

## For him to decide (the art chat's to ask)

- How often the sluices open (a suggestion: every 14 s, the first 9 s into the fight).
- The Queen's dust: hanging 2.3 s over the area (it hides what is under it a moment), or thinner and shorter.
- The Rat King's roll: 13 tiles a second, 11 tiles long, held 0.8 s spinning up first.
- The deer's bramble: its thorns a dull red-brown (to read on its green-black canes), or darker.

---

# The second round (2 Nov 2026): five that lose their hit-hit-slam combo

The same helper's work, on the same branch (`art/action-fixes`), after `art/chained-look` (31b0ee4, the Chained One's new body, his yes)
was merged into it (so the branch holds all the action work). Each mock-up is changed IN PLACE, in its own files, behind its own switch,
still off; its own test and README say what changed (each README's "2 Nov" section). Nothing here is in the game until the main chat puts
it there, on his yes. The game's own frames are unchanged (each mock-up's test checks its hashes).

## His words, 2 Nov 2026

- 07:32: “Okay now I need you to look at how many enemies do a small hit, small hit, slam combo.  I feel like you over corrected to that a
  little too much.”
- Seven did; asked which keep it (offered: the first two to get it; the Amalgamation, Crier, reapers, gardener and guard each get
  something new): “Chained One and troll (Recommended)”.
- Then each of the five, asked one at a time, answered by 07:46:
  - THE AMALGAMATION: “Grasping fan (Recommended)”, offered as: a dozen arms burst from its heap and shoot across the floor in a wide
    fan, snatch at you, then drag back in.
  - THE CRIER: “The toll follows you”, offered as: he rings his handbell; a toll marks where you stand and bursts a beat later, again and
    again. Keep moving.
  - THE HUSHED REAPER AND GLEANER: “Sickle boomerang (Recommended)”, offered as: the sickle thrown spinning out in a wide curve and back
    to the hand. Dodge it going out and coming back.
  - THE HUSHED GARDENER: “Shear lunge”, offered as: a long held crouch, then one lunge 3 tiles across the lawn, the open shears snapping
    shut on you.
  - THE PALACE GUARD: “Javelin (Recommended)”, offered as: he hurls the partisan; it sticks quivering where you stood with a burst of
    turf. He draws a sword till he pulls it out.

Every one by Movement 9 (a big held wind-up, a strike of two frames smeared, a big wind-down) and Monsters 9 (big areas, readable marks);
none of them a combo of blows ending in a slam.

## The five (seconds; tiles)

4. **THE AMALGAMATION'S GRASPING FAN** (its basic attack, in place of the swipe combo; docs/mockups/action_f4_amalgam/README.md,
   `AMALGAM_ACTION`; art/amalgam_action.ts `FAN`, `fanArmAt`, `fanStrikes`). It swells by 0.4 s, a dozen arms of the dead bunched
   against its front, straining; each arm's line marked on the floor from 0.1 s; HELD to 1.0 s; in **two frames** (30 to 32, 1.067 s)
   the heap lurches and **twelve arms** shoot out across the floor in a **120 degree** fan, **4.3 to 5.0 tiles** from its middle, each
   a real arm of its own bones and flesh (dark sinew, a bone elbow, the forearm's two bones, a dead hand); they snatch shut by 1.2 s;
   hauled back in along the floor by 1.93 s; its stand by **2.6 s**. Struck: a hero within 0.6 of an arm's line (from 1 tile out) as
   they land. Its bone rain, mites, floor arms and devour as approved.
5. **THE CRIER'S TOLL** (his basic, in place of the trumpet swing; docs/mockups/action_f11_crier/README.md, `CRIER_ACTION`;
   art/crier_action.ts `TOLL`, `TOLL_HITS`, `tollStrikes`). He had no handbell: **it hangs at his belt now, at his left front, in every
   frame of his set** (his frames change by it). His left hand takes it and raises it high over his hat by 0.6 s, HELD to 0.9 s; rung in
   **two frames**, swung down before him, a ring of the Hush shaken out of it: **five tolls**, at 0.967, 1.5, 2.033, 2.567 and 3.1 s
   (each swung back up and held again, 0.17 s); each lays a mark **where the hero is then** (a ring of the Hush's grey, the enemy's pink at
   its edge, **1.6 tiles round**: 3.2 across), bursting **0.6 s** later in a ring of silence. The bell back at his belt by 3.6 s; his
   stand by **4.2 s**. His shout off the walls, scroll and crowd stay.
6. **THE HUSHED REAPER AND GLEANER'S SICKLE BOOMERANG** (their one attack, in place of the harvest; docs/mockups/action_f11/README.md,
   `FIELD_HARVEST`; art/action_f11_field.ts `BOOM`, `boomAt`, `boomStrikes`, `sicklePainted`, `curvePainted`). Drawn back far behind
   the shoulder by 0.32 s, its curve marked on the ground from 0.12 s, HELD, shaking, glinting pink, to 0.7 s; flung in **two frames**
   (it leaves the hand at 0.767 s); the sickle spinning (5 turns a second, a blur of its blade round it, glinting pink) out along the
   curve **6 tiles** before them, round (out on their left, back on their right: **14.2 tiles** of flight in **1.5 s**, 9.4 tiles a
   second), and back to the hand at 2.267 s; caught, **staggered a step back**; straightened by **3.0 s**. Struck: a hero within 0.75
   of it, once going out and once coming back.
7. **THE HUSHED GARDENER'S SHEAR LUNGE** (his one attack, in place of the hedge cut; docs/mockups/action_f16/README.md,
   `GARDENER_HEDGE`; art/action_f16_gardener.ts `LUNGE`, `lungeStrikes`, `snapAt`). Sunk into a deep crouch by 0.35 s, the shears out low
   before him opened their widest, the lane marked from 0.15 s; HELD, shaking, to 1.1 s (**0.75 s**); the lunge in **two frames**
   (33 to 35, 1.167 s), smeared (after-images of him and the blades all the way), flung **3.1 tiles**, the blades snapping shut at its
   end in a spray of cut grass; stumbling on, bent double, the shut shears dragged along the turf; straightened by 2.4 s, his stand by
   **2.8 s**, **3.36 tiles** on. Struck: a hero in the lane (3.8 long, 0.85 to either side) as he goes through it, or within 1.2 of where
   the blades shut.
8. **THE PALACE GUARD'S JAVELIN** (his second attack, in place of the drill; the long thrust stays; docs/mockups/action_f16/README.md,
   `GUARD_DRILL`; art/action_f16_guard.ts `JAV`, `spearFlying`, `spearStuck`, `javStrikes`, `PULL`). **He has a sword in a scabbard at
   his left hip now, in every frame of his set.** The partisan hauled back over his shoulder by 0.45 s, where you stand marked, HELD,
   shaking, to 0.9 s; hurled in **two frames** (it leaves his hand at 0.967 s); it flies (0.38 s over 4.6 tiles, 32 lengths high at the
   top of its arc) and **sticks quivering** where you stood (it shakes 0.8 s), a **burst of turf 1.6 tiles round**; he **draws his
   sword** from his hip (1.62 to 1.87 s); with it he stands, marches and strikes (the sword guard's thrust by Movement 9) until he has
   walked to it; then **THE PULL-OUT** (2.65 s): sword put up, both fists high on the shaft, heaved (0.72 to 1.32 s), **wrenched out**
   at 1.48 s in a spray of turf, swung over, the partisan guard again. **THE SWORD GUARDS**: a light javelin across their back now
   (their frames change by it) and a scabbard at the hip; the same throw: sword put up (0.32 s), the javelin off their back (0.5 s),
   hauled back, held to 1.167 s, hurled in two frames (1.233 s), sword drawn again (1.95 s); then the sword guard as they are (no
   javelin to fetch).

## The pictures (`pictures/`)

- `action_fixes2.mp4` (1200 × 676, 53.1 s, 30 a second, H.264 yuv420p, captioned): each new move on its own floor's ground with the
  knight (stand-ins as the models used: the ossuary, the square, the fields, the gardens), from in front and from behind, then at half
  speed; the Crier's tolls and the sickle's curve also from higher up (the game's own pixels); the guard's throw, his pull-out (from
  behind), and the sword guard's throw.
- `action_fixes2_sheet.png` (1200 × 2843): for each of the five, its old combo beside its new move at the same scale (the old from the
  branch before, 523e891), and three key moments of the new move on its floor with the knight.

Made by: `tools/action_fixes2_film.ts` (the film), `tools/action_fixes2_frames.ts` and `tools/action_fixes2_sheet.py` (the sheet),
`tools/action_fixes2_stills.ts` and `tools/action_fixes2_peek.ts` (stills); the scenes `src/dev/action_fixes2_scene.ts` (each figure's
marks and what it sends out placed through the figure's own projection, both ways round).

## The checks (second round)

- Each mock-up's own test updated to its new move and passing (`tests/action_f4_amalgam.test.ts`, `tests/crier_action.test.ts`,
  `tests/action_f11.test.ts`, `tests/action_f16.test.ts`): every frame of each new move from in front and behind through the bosses'
  review (`checkBoss`) with every handing over: nothing found; painted, the pink edge, crisp, no cyan, nothing cut off; the new numbers;
  what each sends out (the sickle in flight, its curve, the javelin flying and stuck) crisp, no cyan, not cut off. The game's own frames
  hash as before in each.
- `tsc --noEmit -p tsconfig.json` clean.
- Changed outside the mock-ups' own files: none of the game's (no shared engine file changed). The merge's two mock-up lists
  (`tests/bosses.test.ts`, `tests/new_mobs3.test.ts`) take both sides.

## For him to decide (the art chat's to ask)

- The grasping fan: **whether a hero caught is dragged in** with the arms (as the devour drags), or only struck where they land.
- The Crier's handbell at his belt changes every frame of his set; the later tolls are held 0.17 s each (the mark and its 0.6 s beat
  are the warning), the first 0.3 s.
- The sickle: 9.4 tiles a second, a stagger on the catch; it can strike twice in one throw (out and back).
- The palace guards: the sword at the partisan guard's hip (every frame); his free left hand held up as the sword guard holds his
  shield's grip while he fights with the sword; the sword guards' javelin on their back and their scabbard (every frame), and whether
  they too should walk to their javelin and pull it out (in the pictures they fight on with the sword).

---

# The third round (2 Nov 2026): four more from his look at the night's films

The same helper's work, on the same branch (`art/action-fixes`). Each mock-up is changed IN PLACE, in its own files, behind its own switch,
still off; its own test and README say what changed (each README's "2 Nov" section). Nothing here is in the game until the main chat puts
it there, on his yes. The game's own frames are unchanged (each mock-up's test checks its hashes).

## His words, 2 Nov 2026 (going through the night's films with the art chat, one at a time)

- THE CHANTER: asked whom the chain lightning may jump to: “I don’t really want the rangers animals to have HP bars so it doesn’t really
  matter to jump to them”; asked whether it should jump on to monsters near you and hurt them, his pick: “No jumps” (offered as: it just
  strikes you, one bolt with a crackle round you). Then, at 07:56: “If we have multiplayer, the lightningwould jump to other players”.
- THE PHYSICIAN: “It needs a little more excitement, and the meter needs to fill faster”. Told him the mark fills in about 1.4 s (was
  2.2); drain as now. For the excitement, his pick: “Bigger operation” (offered as: when the mark fills, the room goes dark but a
  spotlight on you, and his instruments close in round you). The pillars stay as drawn (his “Yes, pillars (Recommended)”).
- THE MASKED DANCERS: his yes to: a dancer whose partner is gone just spins into you as before.
- THE KING'S KNIGHT'S BANNER, 08:01: “The banner buff AOE probably needs to be much bigger or it won’t affect much”; asked how big (it
  was 3.5 tiles), his pick: “About twice, 7 tiles (Recommended)” (offered as: a wide gold ring on the floor; most of a fight happens
  inside it, but you can still pull enemies out).

## The four (seconds; tiles)

9. **THE CHANTER'S LIGHTNING** (floors 6–10; docs/mockups/action_f6/README.md, `CHANTER_LIGHTNING`; art/action_f6_cult.ts `CHAIN`,
   `chainOf`, `staticPainted`). It jumps ONLY to other heroes (players) near the one it strikes (within **2.5 tiles**, at most twice,
   **0.1 s** apart), never to companions or monsters. Alone (as the game is now): one bolt down onto him (its ring, 1.0 round, marked
   0.57 s before, as approved) and **a crackle of static** round him (`CHAIN.crackle`, **0.8 s**: arcs crawling over him and jumping
   off him, sparks round his feet, strong at first, dying away). The rest of the Chanter as approved.
10. **THE PHYSICIAN'S DIAGNOSIS** (floor 14 boss; docs/mockups/action_f14_physician/README.md, `PHYSICIAN_ACTION`;
    art/physician_action_fx.ts `BEAM.fill`, `OPERATION`, `ESCAPE`, `opDark`, `opLight`, `paintTools`). The mark fills in **1.4 s** (was
    2.2; drains in 1.6 as before). Full: THE THEATRE PLUNGES DARK in **three frames** (to 0.2 of its light), **one hard surgical
    spotlight** from his lens on where you stood (**2.5 tiles round**, the field), his instruments (a dozen: scalpels, bone saws, forceps,
    curved needles threaded, amputation knives; steel, ebony and brass, glinting his pink and gold, never cyan) flung out of his coat to
    ring it at its edge by 0.45 s, **HELD 0.88 s**, then closing in on you from all round in **two frames** (frames 40 to 42), smeared,
    with his one huge strike at **1.4 s**; stuck quivering in the boards, plucked back by 2.33 s; the light back by 2.2 s. **Where to run:
    out of the spotlight, 1.2 s from the dark falling to the close.** His body, the pillars and the rest of him as approved.
11. **THE MASKED DANCERS** (art/action_f16_dancer.ts, `DANCER_THROW`). No new art: the set with the switch on holds the game's own
    whirling spin too, `clips.moves.spin`, frame for frame the game's (every room's lady and gentleman, both ways round). The main chat
    chooses: partner alive and near enough to take the waltz's hold (a suggestion: within 3 tiles), the pair's throw; partner gone, the
    old spin with the game's own act (docs/mockups/action_f16/README.md).
12. **THE KING'S KNIGHT'S BANNER** (art/action_f16_knight.ts, `KNIGHT_BANNER`; `BANNER.reach`, `inRally`, `rallyPainted`). Its reach
    **7 tiles** round (was 3.5); the enemy's gold drawn to match: a thick dashed ring at its edge with twelve chevrons pointing in, a
    faint twinkle of gold within (about 1.4 in 100 of the floor's pixels) and motes drifting up, not a wash; its floor picture 700 × 372.

## The pictures (`pictures/`)

- `action_fixes3.mp4` (1200 × 676, 34.2 s, 30 a second, H.264 yuv420p, captioned): the Chanter's bolt alone (from in front, its strike
  at half speed, from behind) and with another player (a second knight); the Physician's Diagnosis and operation over his whole theatre
  from above with the knight (the mark filling, hid behind a bed and a pillar, caught, the dark, the spotlight, the ring; he runs out),
  the ring flung out at half speed, then close from in front (he gets out; they close on nothing) and from behind (caught), and the
  strike at half speed; the banner's reach from higher up (the game's own pixels) with the knight and three of his fellows in it, the
  hero stepping back out of it and one following him out.
- `action_fixes3_sheet.png` (1200 × 3058): each one's old beside its new at the same scale (the old from the branch before, f4e6a3d,
  made by its own scenes), and the key moments of each; the dancers' spin as the game has it beside the spin kept in the new set.

Made by: `tools/action_fixes3_film.ts` (the film, and its stills), `tools/action_fixes3_frames.ts` (the dancers' frames),
`tools/action_fixes3_sheet.py` (the sheet). The scenes are each mock-up's own (src/dev/action_f6_scene.ts `chainScene(…, others)`,
src/dev/physician_action_scene.ts `diagScene`, `diagClose(view, caught)`, src/dev/action_f16_scene.ts `bannerWideScene`).

## The checks (third round)

- `tests/action_f6.test.ts` (5), `tests/physician_action.test.ts` (7: test 7 new), `tests/action_f16.test.ts` (5): each updated to its
  new numbers and passing (each mock-up's README says what each checks); every new frame through the checks (the crackle every frame;
  the operation's instruments, the spotlight's edge and its cone every frame; the banner's gold): crisp, no cyan, not cut off; the
  Physician's every frame through the bosses' review both ways round, every handing over (his body unchanged: nothing found); the
  dancers' kept spin through the review in the throw set, and frame for frame the game's. The game's own frames hash as before in each
  (the Physician `a760e8052487ba6c`, his moves drawn `0b3243670d124c61`; the cult, the dancers and the king's knight as before).
- The figures' own tests as before: `tests/physician.test.ts`, `tests/act2_physician.test.ts`, `tests/masque_dancers.test.ts`,
  `tests/kings_knights.test.ts`, `tests/act1_cultists.test.ts`.
- `tsc --noEmit -p tsconfig.json` clean.
- Changed outside the mock-ups' own files: none of the game's.

## For him to decide (the art chat's to ask)

- The operation's dark (0.2 of the light: the theatre's walls and beds still faintly seen) and the instruments' size (51 pixels: bigger
  than life, to read at phone size).
- The dancers: how near a partner must be for the pair to throw (a suggestion: 3 tiles); else the old spin.
- The banner: its ring with chevrons and a faint twinkle within; whether the knights inside it should show they are rallied (a glint on
  them), which the pictures do not.

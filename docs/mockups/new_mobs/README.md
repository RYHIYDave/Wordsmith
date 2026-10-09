# Mock-up: THREE NEW MONSTER TYPES (NOT IN THE GAME until the main chat puts them there)

**What it is.** Three new monsters, as pictures for the owner, painted on the same bones as the
heroes and the new skeleton (`src/art/skeleton.ts`, as `src/art/monster_bones3.ts` paints the
skeleton). Behind a switch that is off: `NEW_MOBS` in `src/art/new_mobs3.ts`. No game file uses
it; there are no rules for them (what they do in a fight is the main chat's).

**Where:** the branch `mockup/new-mobs`, from `mockup/archer-on-bones` (the skeleton and the bone
archer on bones, both with his yes on 8 Oct).

## His words

- 9 Oct, 00:20: "I’m going to bed so just keep working on new animations, then rework the ranger,
  then go into new mob types".
- By 05:26, to `new_mobs_sheet.png` and the three sheets, asked which to make: "All three
  (Recommended)" (the pick put to him: "Then their walks, and the main chat writes their rules").

## The three (the art rulebook's brief for a new character, answered with our picks)

- **The Shade.** A spirit of the crypt, a scrap of the dead that will not rest; an enemy. Small, a
  little shorter than the skeleton, light and quick, fun to smash; comes in threes. It floats a
  hand's breadth above the floor, bobbing, its robe's frayed tails streaming. Known by a hooded
  tatter of dark grey-violet cloth with two hot pink eyes in the hood, and long thin pale arms with
  hooked claws. Attack: a rake with both claws; its warning pose, both arms drawn back high over
  the hood. Dies: the robe collapses and comes apart into wisps and pink motes. Never a cartoon
  ghost.
- **The Boneward.** A big skeleton soldier of the vault, still at its post; an enemy. A head
  taller and broader than the skeleton, plodding and brittle; a shield wall in a group. Known by a
  tall tower shield of bone planks bound in iron with a pink rune burning on it, and a horned iron
  half-helm; rusted broken plates. Carries a short heavy spear, low. Attack: a thrust past the
  shield's edge; its warning pose, the spear drawn back over the shield. Dies: sags to its knees,
  the shield topples flat, the bones scatter.
- **The Ossuary Golem.** A construct of the vault, hundreds of bones bound with iron bands and
  chain; an enemy. Big: a head and a half taller than the warrior and twice the skeleton's bulk;
  slow, menacing. Known by a cage of ribs with a pink-to-gold fire in it, skulls piled into its
  shoulders, and a club of fused skulls on one arm. Attack: an overhead slam; its warning pose, the
  club raised high and the fire flaring. Dies: the fire gutters and it falls apart into a heap of
  bones and iron.

Their glows are the enemy's pink burning to gold, each living one has the pink edge, and nothing on
them is cyan.

## Their walks, struck, and as the game takes them (9 Oct, after his yes)

- **Walks**, each a loop facing you and facing away. A foot that is down stays on one spot of the floor
  while it is down (the art rulebook: "Feet grip the floor"), at the pace the walk is painted for.
  - **The Shade glides**: no steps. It leans into its way and bobs, arms trailing low behind it, the
    robe's hem and its four tails streaming back and fluttering. 8 frames at 12 a second, painted for
    3.4 tiles a second (the skeleton's rules: 3).
  - **The Boneward plods**, as the new skeleton does: the right leg steps long and the frame falls onto
    it, the knee locked; the left is dragged after it, stiff, its toe scraping. The shield stays before
    it and the spear low. 8 frames at 11 a second, painted for 1 tile a second.
  - **The Golem strides**: heavy, swaying steps, the whole bulk rolling over onto the foot that is down
    and sinking at each footfall, the club of skulls dragged and swinging, the fire swelling at each
    step. 8 frames at 8 a second (the skeleton's walk is 12), painted for 0.9 tiles a second.
- **Struck** (a reel, as the heroes' `clips.reel`): the Shade is jolted back, its robe flaring, its arms
  flung up (0.33 s); the Boneward is rocked behind its shield, the jaw knocked open, the bones rattling,
  its feet staying put (0.3 s); the Golem barely: a shudder through the bulk, its fire guttering and
  flaring (0.25 s).
- **As the game takes a monster**: `makeShadeArt3`, `makeBonewardArt3`, `makeGolemArt3` in
  `src/art/new_mobs3.ts` each give an `ActorArt` as `makeSkeletonArt3` does: both facings, `idle`,
  `walk` and the attack's three stills with `idleFps` and `walkFps`, and `clips.attack` (with its
  `hit`), `clips.die` and `clips.reel`. Each takes the pace the rules will give it, in tiles a second,
  and shows the same walk frames faster or slower to match, so that the feet still grip (`walkFpsAt`).
  Their blows land at 0.5 s (the Shade), 0.7 s (the Boneward) and 1.0 s (the Golem): a rule's `windup`
  for each should be that. STILL UNUSED BY THE GAME: nothing imports them.

## His answers of 9 Oct, morning: their walks yes; attacks that come from what they are

- By 09:17, to `new_mobs_walks.gif` and `new_mobs_struck.png`: "Yes, keep them (Recommended)".
- His words of 07:44: "When you get to attacks, I’d like to see something other than a big red circle
  on the ground." They were read as: each new monster warns in a shape of its own on the floor. So
  each was given one (claw marks; a lane of rune marks; the floor cracking), shown as
  `new_mobs_attacks.gif` and `new_mobs_warns.png`. By 09:17: "No, change them"; and, asked whether
  the Brute's and the Warden's slams should lose the red circle too: "It’s not the big red circles I
  have a problem with, it’s that every attack is a big slam on the ground.  Use the same logic we do
  with characters, ask questions about the larger enemies and develop attacks that are thematic". So
  the floor warnings are withdrawn (they were `src/art/mob_warnings.ts`, commit `779045a`).
- Asked about the big ones, by 09:30: the trolls (the Brute and the Guardian), "Club sweep and a
  charge (Recommended)"; the Warden, "He can keep the slam.  I just don’t want it overused"; THE
  GOLEM, "Hurl skulls (Recommended)": it pulls a skull off its shoulders and throws it, and it bursts
  into flying bone (where it will land is shown by the skull's own shadow on the floor, not a
  circle); THE SHADE AND THE BONEWARD warn by "Pose and a glint (Recommended)": the wind-up pose,
  the claws or the spear-head flaring pink, nothing on the floor.
- His word at 09:30: "I made some changes in the main chat regarding monsters. Please get with the
  other agent and apply those changes to your designs." The main chat's rules from him (its post of
  08:30 on the board, his words of 07:49 to 08:24): monsters by size, in packs of their own kind (tiny
  6 to 10, small 4 to 7, medium 3 to 5, large 1 to 2, the boss alone); tiny and small have one attack,
  medium two, large two or three, the boss four, and always a basic single-target attack to use while
  the big ones cool down (the bigger the hit, the longer the cooldown). So by size: THE SHADE small
  (one attack, its rake), THE BONEWARD medium (two), THE GOLEM large (a club swing as its basic attack,
  and the skull throw).
- By 09:33, the Boneward's second attack: "Spear throw": it hurls its spear at you from afar, then
  fights with its shield (a shield bash) until it picks the spear up.

## Their attacks (9 Oct, by his picks and the main chat's rules; his yes by 11:14, the Boneward's redrawn since)

His answers by 11:14, to `shade_rake.gif`: "Yes, keep it (Recommended)"; to `boneward_attacks.gif`:
"Yes, keep them (Recommended)"; to `golem_attacks.gif`: "Yes, keep them (Recommended)". Then by 11:22,
of the Boneward: "Actually can we take the boneward’s animations up a notch?  There’s no power in his
attacks" (below): its blows were redrawn and sent again.

By size (the main chat's rules from him): THE SHADE is small, one attack; THE BONEWARD medium, two;
THE GOLEM large, two (and its old slam kept, for the rules to give it or not). None warns with
anything on the floor: the Shade and the Boneward by the pose and a glint, the Golem's thrown skull by
its own shadow.

- **The Shade's rake** (`attack`, as it was; its blow at `SHADE_HIT`, 0.5 s), now with his "Pose and a
  glint": its claws drawn back high over its hood and held, glinting pink and gold, brighter as the blow
  comes (`glint`, from nothing to its brightest just before the blow, and out as it lands); then down
  and through with both claws.
- **THE BONEWARD'S BLOWS, WITH ITS WEIGHT BEHIND THEM.** His word by 11:22, of the first drawing (sent
  with the others at 11:13): "Actually can we take the boneward’s animations up a notch?  There’s no power
  in his attacks". Read as: each blow was too small and too stiff. So each now coils back on its back
  foot and holds (the warning), then STEPS INTO THE BLOW: its front foot goes out and stamps down,
  kicking up the floor's dust; its hips drive forward, its chest whips round, its arm goes all the way
  out; it holds there a beat and hauls itself back. Its back foot stays where it is on the floor, and
  its front foot is off the floor only while it steps. The way its spear's tip (the thrust), its hand
  (the throw) or its shield's edges (the bash) went through the air is streaked as the blow lands
  (`MobMove.trail`).
- **The Boneward's thrust** (`attack`; `BW_HIT`, 0.7 s): coiled behind the shield, the spear drawn right
  back to its shoulder, its head glinting; then the step and the lunge, the spear driven out past the
  shield's edge.
- **The Boneward's spear throw** (his "Spear throw", by 09:33: it hurls its spear from afar, then fights
  with its shield until it picks the spear up): `more.throw` (its blow at `BW_THROW_HIT`, 0.75 s): the
  spear raised over its shoulder like a javelin and right back, leaning back with its shield held out
  toward you, its head glinting; then it steps through, its arm comes over the top, and it bends right
  over after the throw; its hand is empty from the blow on. While its spear is gone: `more.bash` (`BW_BASH_HIT`, 0.55 s: the shield
  drawn in tight, crouched behind it; then a step and its whole weight behind the shield, driven out
  at you); `more.standBare` and `more.walkBare` (its stand and its plod with no
  spear, going round as they do); and `more.pickUp` (1.0 s: it stoops, its hand down on the floor where
  the spear lies, `BW_GRIP_AT`, and has it again at `BW_GRAB`, 0.5 s, the clip's `hit`).
- **The spear in flight and lying** (`src/art/mob_shots.ts`, drawn in the game's own pixels, in the
  colours of the painted spear): `drawSpearShot` (flying over its shadow, a streak of air behind it, its
  head lit), `drawSpearLying` (where it fell, until it is picked up). `SPEAR_TILES`, its length;
  `SPEAR_GRIP`, where along it the hand holds it.
- **The Golem's club swing** (`attack` now, its basic blow; `GOLEM_SWING_HIT`, 0.6 s): the club drawn
  back to its left side at its shoulder and held, the fire flaring (the warning; not the slam's, which
  is the club straight up over its head); then swung round in front of it, level, and through, a streak
  behind its head.
- **The Golem's skull throw** (his "Hurl skulls (Recommended)"): `more.throw` (its blow at
  `GOLEM_THROW_HIT`, 0.95 s; over at `GOLEM_THROW_END`, 1.5 s): its right fist goes up to its shoulder
  and takes a skull off the pile (`GOLEM_TAKE`, 0.32 s); it rears back with it and holds, the fire
  flaring; it hurls it overarm. The skull is in its fist until the blow, and its place on the shoulder
  is empty until the throw is over. The skull in flight is a picture, `makeSkullShotArt()` (8 frames,
  once round as it tumbles; its anchor at its middle; its eyes lit, the pink edge). Thrown up high, it
  comes down on where it was aimed, and its own shadow on the floor shows where (`drawSkullShadow`: small
  and faint while it is high, bigger and darker as it falls); then it bursts into flying bone and pink
  embers (`drawSkullBurst`, `SKULL_BURST`, 0.7 s). No circle on the floor.
- **The Golem's slam**, as it was: `more.slam` (`GOLEM_HIT`, 1.0 s), kept for the rules to use or not.
- Where a thing thrown leaves the hand: `handAt(mob, move, t)` (the figure's own lengths: forward, to
  its left, up; a tile of the floor is `TILE3` of them).

## For the main chat

- Still a mock-up, behind `NEW_MOBS` (off): nothing of the game imports `new_mobs3.ts` or `mob_shots.ts`.
  Each monster's clips: `clips.attack` (the Shade's rake, the Boneward's thrust, the Golem's swing) and
  the rest by name in `clips.moves`, the same new field as on `art/monster-attacks` (`AnimSet.clips.moves`
  in `art/actor_types.ts`, word for word the same, so the two branches merge as one).
- What the rules do with them is yours: when the Boneward throws (from afar), its spear landing where you
  stood (`drawSpearShot`, then `drawSpearLying` till it is picked up), and that it fights with its shield
  (`bash`) and walks to its spear (`walkBare`) to pick it up (`pickUp`) while it has none; the Golem's
  skull a lob that comes down where you stood, its shadow there as it falls, its burst where it lands.

## How the attacks are checked

- `tests/new_mobs_attacks.test.ts` (8): by size (the Shade one attack and no other moves; the Boneward
  its thrust and its throw with the bash, the pick-up, and its stand and plod with no spear; the Golem its
  swing, its throw and the slam kept); each a clip as the game takes a monster's moves (a blow's `hit` on
  its frame; a loop going round; the plod with no spear shown to match a pace); every frame of them
  paints, has the pink edge and nothing cyan, nor a cyan light; the glint, from nothing to brightest just
  before the blow and gone as it lands, a light that is not cyan; the spear gone from the Boneward's hand
  as it throws and back once it picks it up, its hand on the floor where it lies; the skull in the Golem's
  fist till it throws, its place on the shoulder empty till the throw is over; the Boneward's weight in
  each blow (its hips driving forward, its front foot stepping out and down at the blow, its back foot
  where it was, a streak as it lands, dust kicked up after); the Golem swing's streak, and its
  warning not the slam's; the skull in flight turning, with the pink edge; its shadow growing and
  darkening as it falls, and nothing else on the floor; its burst, and gone; the spear flying up off the
  floor and lying on it; none of it cyan.
- `tests/new_mobs3.test.ts` (8), as above; the mock-up is now two files, and no file of the game imports
  either.
- The pictures (`src/dev/preview_new_mobs.ts`): `moves:<shade|boneward|golem>[:scale]` (each of its
  attacks at its moments, facing you and away; the Golem's with its slam for comparison);
  `shade_rake.gif` (`shadefilm:4`), `boneward_attacks.gif` (`bwfilm:3`), `golem_attacks.gif`
  (`golemfilm:3`). In the films the floor where a thing thrown comes down is lit, as the light you carry
  would light it.

## Not yet

Their rules (health, speed, what their attacks do, when each is used: the main chat's); where they live.

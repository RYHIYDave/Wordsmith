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

Their attacks are drawn next, pictures first.

## How it is checked

- `tests/new_mobs3.test.ts` (8): the switch is off and no game file uses it; every pose paints; no
  cyan; the living have the pink edge and the dying none; the walks go round without a jump; the feet
  of the Boneward and the Golem grip the floor (every frame has a foot down, and a foot that is down
  does not move on the floor by a quarter of a picture pixel); each `ActorArt` is complete (both
  facings, every list and clip, the blow on a frame, the walk matched to another pace) and every frame
  of it has no cyan, and the pink edge if it lives and none if it is dying. tsc clean.
- The pictures: `src/dev/preview_new_mobs.ts` (through `tools/preview.mjs`, and for the GIFs
  `tools/page_gif.mjs`):
  - `new_mobs_sheet.png`, `<shade|boneward|golem>_sheet.png` (hash `sheet`, `one:<id>`);
  - `new_mobs_moving.gif` (`film:3`): each standing, then its warning held and its blow;
  - `new_mobs_walks.gif` (`walks:3`): all three walking toward you and then away, beside the new
    skeleton walking for pace, the floor going by under each at its pace (the floor here is the
    dungeon's two flat shades, as the skeleton's film has it: the textured floor going by made the
    file too big to send);
  - `new_mobs_struck.png` (`struck:3`): each struck, five moments of its reel;
  - `strip:<id>:<walk|reel|stand>:<front|back>[:scale]`: every frame of one move in a row, the floor
    going by under a walk;
  (the withdrawn floor warnings' `warns:2` and `attacks:2` went with them).

## Not yet

Their rules (health, speed, what their attacks do: the main chat's); where they live. Their attacks:
the Shade's rake with a glint; the Boneward's thrust with a glint, its spear throw (and the spear in
flight and lying, the shield bash while it has none, picking it up); the Golem's club swing and its
skull throw (the skull in flight, its shadow, its burst).

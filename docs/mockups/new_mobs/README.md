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

## How it is checked

- `tests/new_mobs3.test.ts` (4): the switch is off and no game file uses it; every pose paints; no
  cyan; the living have the pink edge and the dying none. tsc clean.
- The pictures: `src/dev/preview_new_mobs.ts` (through `tools/preview.mjs`, and for the GIF
  `tools/page_gif.mjs`): `new_mobs_sheet.png`, `<shade|boneward|golem>_sheet.png`,
  `new_mobs_moving.gif`.

## Not yet

Their walks; their rules (health, speed, what their attacks do: the main chat's); where they live.

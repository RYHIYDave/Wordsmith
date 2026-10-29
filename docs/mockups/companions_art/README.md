# The Ranger's six companions: their pictures (a mock-up, not in the game)

Branch `mockup/companions-art` (from `companions`), made by a helper of the art chat, 29 Oct 2026. Behind
`COMPANIONS_ART_ON` in `src/art/companions_art.ts`, off. Nothing of the game imports these files (a test proves it). The
owner has not seen them yet: they go to him from the art chat, pictures first.

## His words (the main chat's record, `docs/NEXT_VERSION.md` on `v23`, 28 Oct 2026)

- 23:09: “I’d like the ranger to have a passive that summons a hawk companion that applies PRECISE on hit, a snake
  companion, that applies “of POISON”, and a third something I need help with”
- Offered a wolf (Binding), a bat (Leeching), a fox (Swift) and a tortoise (Guarding): “Okay maybe we have two separate
  passive with three each cause I love all of these.  Let’s put them opposite each other on the tree so if you want one
  companion that’s fine but if you want two it’s going to take some investment.  So we need 6 total”
- 23:25: “Yeah keep the groups”

So: THE HUNTING COMPANION, a hawk (marks: his next hit a sure critical), a snake (poisons) or a wolf (holds); THE WILD
COMPANION, a bat (heals him), a fox (gives him speed) or a tortoise (a shield; it keeps close). The ask (the main chat
on the board, 28 Oct 23:26, as relayed): original designs, each reading as his animal and a friend (the friend's
cyan), about the size of the mage's familiars, the tortoise and the wolf a little bigger; standing, moving and the
attack, from in front and from behind; an icon each.

## The pictures (`pictures/`)

- `companions_sheet.png` (1200 wide): all six standing, from in front and behind, beside the Ranger, three times as
  big; the Ranger with all six about him at the game's size, and three going with him; their six icons.
- `companions_film.mp4` (36.8 s, 1200×676, 30 a second): each in turn, from in front and from behind with the Ranger
  beside it: standing, moving (the floor going by under it, the Ranger running), its attack, and its attack again at
  half speed; each captioned with what its bite does.

## The six

Each is made from solids of its own (as the floors' animals are: `art/hounds.ts`, `art/fog_wolves.ts`) in the painter
the heroes share: lit from the upper left, three tones a material, the indigo seam, crisp pixels, the heroes' cyan
edge round it (`FRIEND_RIM`) and a small pool of their cyan light behind it. Nothing pink or gold. Units are picture
pixels (the Ranger is 57 tall).

| | Looks | Standing | Moving | Attack (its gift where it bites) |
| --- | --- | --- | --- | --- |
| Hawk | brown back, cream breast streaked brown, rufous fanned tail, hooked beak on a yellow cere under a heavy brow, fingered wing tips; his teal leather jesses on its legs | kiting by his shoulder (body 31 up): wings spread and all but still, tail working, head still, a look round at him | flying: a full beat and a glide | climbs and mantles its wings high, holds; stoops and flings its talons (two frames); brakes, wings wide; a cyan diamond mark closes on the prey and three talon rakes (Precise) |
| Snake | moss green banded black, yellow belly, arrow head broad at the jaws, amber slit eyes, forked tongue | lying in an S, its front raised, head swaying, tongue flicking (no blink: snakes have no eyelids) | sliding along its own S on the floor, head up | draws back into a tight S, holds; strikes, jaws wide, fangs swung down (two frames); drives on, holds; cyan venom drops thrown off the fangs (Poison) |
| Wolf | warm grey, darker saddle, cream mask, throat and belly, tawny legs, amber eyes, tail up | panting, tongue out, weight shifting, tail wagging, looks up at him, ear flick, blink | a long lope, back flexing | crouches, ears flat, lips off its fangs, holds; lunges, jaws snap shut (two frames); holds on and wrenches its head; jaws of cyan fangs close on the prey (Binding) |
| Bat | a fruit bat: brown fur, golden mantle, fox-like face, amber eyes, pointed ears, dark wings on three long fingers, scalloped | fluttering in place, wings cupped | flying | flits up and hangs, wings wide, jaws open, holds; drops and bites (two frames); clings; cyan drops drawn up out of the bite into it (Leeching) |
| Fox | red-gold, white chin, chest and brush tip, black stockings and ear backs | brush sweeping, ears swivelling, the listening head tilt, a glance back | darting bounds | rears up on its hind legs, ears at its prey, holds; the pounce, nose first (two frames); darts back with gusts of cyan wind streaming off it (Swift) |
| Tortoise | high dome of plates with gold hearts, flared rim, pale under-shell, stout scaly legs, beaked head | head out, looking about and up at him, shell rising with its breath, slow blink | trundling, slow and steady, legs by diagonal pairs | draws its head in and rocks back, holds; throws itself forward, head shooting out to snap (two frames); cyan plates of its shell flash up over it as a ward (Guarding) |

Sizes, standing (picture pixels across, as measured by the test against the mage's familiar): each between the
familiar's length and 2.1 times it; the wolf and the tortoise more than the other four by at least 15% in painted size.
The two fliers are drawn 1.2 (hawk) and 1.4 (bat) times their built size about their middles, so their wings read on a
phone (`FLIER_SCALE`).

## Their numbers (`src/art/companions_art_moves.ts`)

- Standing: 15 frames a second (the fliers 30), a loop of 2.4 s.
- Moving: 30 a second; each painted for a pace (`COMP_GAIT`: 5.4 tiles a second, the game's `COMPANION_TUNE.speed`,
  but the tortoise 1.2), one turn of: hawk 16/30 s, snake 6/30, wolf 10/30, bat 12/30, fox 7/30, tortoise 12/30.
- The attack, the same beats for all six (`COMP_ATTACK`, 30 a second): wind-up 0 to 0.2 s; held to 10/30; THE STRIKE,
  two frames, landing at 12/30 (0.4 s); carried through to 0.53; wind-down to 0.8 s. His rule (Movement 9, 24 Oct):
  “Like the wind up and wind down are big but the actual punch is lightning quick”. The strike's two frames are
  smeared: the striking parts' after-images in the Ranger's pale wind under it, speed lines over it.
- The gifts show for 0.4 s after the blow (`companions_art_fx.ts`).

## How the main chat would bring them in

- `makeCompanionArt(kind)` gives an `ActorArt` (front and back `AnimSet`: `idle`, `walk`, `attack` and
  `clips.attack`, its `hit` at 12/30). The game's companion would be drawn as a figure: mirrored for screen-left, its
  soft shadow under its floor point (`COMP_SHADOW`; the fliers' on the floor under them), its moving frames chosen by
  ground covered (`strideOf(kind)` as `walkStride`) or at `moveFpsAt(kind, pace)`.
- `game/companions.ts`: set `COMPANION_TUNE.bite` to `{ hit: 12 / 30, long: 24 / 30 }` so the bite lands when the
  picture's strike does (its first guesses are 8/30 and 18/30), and start the attack clip as a bite begins.
- `companionIcon(kind)`: its 32-square icon, for the talent card and the town picker.
- Turn `COMPANIONS_ART_ON` on with `COMPANIONS`, on his yes, and change test 1 of `tests/companions_art.test.ts` to
  name the game files that then import them.

## The checks (`tests/companions_art.test.ts`, 12 tests; `tests/companions.test.ts` still 8 of 8)

1. The switch off; nothing of the game imports them (only `src/dev/preview_companions_art.ts`).
2. Every move of each (stand, moving, attack), every frame, from in front and from behind, through `checkBoss`
   (`art/boss_checks.ts`) with no findings: what grips the floor stays put (paws, feet), nothing sinks into it, no leg
   through another, no wing through the body, the snake never through its own body, nothing leaps, stalls or turns
   back at speed, no leap where one move hands over to another (stand into the attack from every frame of the stand,
   into moving and back from every frame), every blow drawn back, held and carried through, the haunches first,
   alive when standing. The review was made for figures on the heroes' bones: `companionReview(kind)` hands it each
   animal's own body, paws, wings, striking end and points to follow, and stands bones in for it only where the review
   reads bones (its middle rising and swaying, its haunches and chest turning, its body held in the warning), moved
   as its own body moves.
3. Every frame crisp; the cyan edge round each; no enemy pink or gold; no light but cyan; nothing cut off.
4. Sizes (above).
5. Movement 9: the warning held still; the strike two frames, each quicker than any frame of the wind-up; big wind-up
   and wind-down.
6. The snake's body lies along its own S on the floor as it goes (its version of “Feet grip the floor”).
7. Their pictures as the game holds them; their icons 32 square, crisp, the cyan edge, nothing of the enemy's.

Run: `tsx --test tests/companions_art.test.ts`. Pictures: `node tools/preview.mjs src/dev/preview_companions_art.ts
<out.png> 1200 1060 sheet` (also `contact`, `strip:<kind>:<move>`, `close:<kind>:<move>:<t>`, and `film`, frame by
frame, as `tools/page_gif.mjs` reads a page).

## For him to decide

- THE TORTOISE'S PACE. Slow and steady as asked, it is painted for 1.2 tiles a second; the companions go at 5.4 to keep
  up with him (he runs at 4.6), and at that its steps would go four and a half times as fast, a scurry. Recommended:
  let it keep its own slower pace in the game and be at his side again when left behind (the rule the companions
  already have).
- THE HAWK HANGS ON THE AIR rather than beating its wings when he stands still (kiting, as hawks do on the wind): its
  spread wings read best, and a beating hover leapt where it hands over to its flight or its stoop.
- THE BAT'S WINGS BEAT SHALLOW, for the same reason. Both are as the checks allow; a deeper beat would need a way into
  and out of it in the game.

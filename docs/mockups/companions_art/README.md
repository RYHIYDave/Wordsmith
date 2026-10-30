# The Ranger's six companions: their pictures (a mock-up, not in the game)

Branch `mockup/companions-art` (from `companions`), made by a helper of the art chat, 29 and 30 Oct 2026. Behind
`COMPANIONS_ART_ON` in `src/art/companions_art.ts`, off. Nothing of the game imports these files (a test proves it).

## What he said of the first pictures (30 Oct 2026, by the art chat)

Asked “The Ranger's six companions (companions_sheet.png and the film): are these right? The bat reads best from
behind.”, his pick: “Close, change something”, and his words: “They’re a little shapey”. Asked whether the tortoise
should keep its own slow pace and catch up, or keep up, his pick: “Keep up with me”.

Read as (his art rulebook, How art is made 9, real shapes, not circles and squares): at three times size they read as
simple shapes stuck together, not as sculpted animals. So all six were sculpted again as one body each:

- the wolf: a deeper chest and a narrow waist, a ruff of long fur in tufts at the throat and neck, upper legs as
  muscles growing out of the body, lower legs tapering through the elbow, wrist and hock knobs to paws with toes, ears
  as flat triangles (a dark hollow, pale-edged), a bushy tail, and fur over all of it (short strokes of the next tone,
  laid on the body's own skin so that they stay put as it moves);
- the fox: the same, slender, black socks, a white bib and a white-tipped brush, black-backed ears;
- the hawk: a deep rounded breast, cream streaked in drops; a back of feathers in rows, each edged paler; wings of
  layered feathers (scalloped secondaries, coverts over them, five primaries splayed like fingers at the tip); a tail
  of six feathers that fans, banded near the tip; it hangs on the air with its wings bowed a little, never a flat V;
- the bat: a bigger furry body and head, big pointed leaf ears, its finger bones light against the wing skin, the
  skin paler along the bones and darker toward its scalloped edge;
- the tortoise: each plate of its shell raised, in growth rings round a gold heart; its legs longer and scaled, the
  fore legs flattened and armoured; a wrinkled neck; and it KEEPS UP WITH HIM (his pick): a determined trundle at the
  companions' pace, long strides by diagonal pairs, each foot lifted high, its shell rocking, its head out low;
- the snake: its back a checker of scales, its belly in plates.

Everything else is as it was: the cyan friend's edge, the attacks' beats, every check.

## What he said of the sculpted pictures (30 Oct 2026, by the art chat)

Asked “The re-sculpted companions (companions_sheet.png and the film). The four on the ground came out better. Seen
from in front, the hawk and the bat still look like thin diagonal strips, because their near wing is edge-on. What
now?”, his pick: “Fix the hawk and bat (Recommended)” (offered as: wings spread wide toward you from in front; the
other four locked).

So THE WOLF, THE FOX, THE TORTOISE AND THE SNAKE ARE LOCKED, as they are. The hawk and the bat were changed only so:

- turned toward you in every move (`FLY_FACE`, 38 degrees to their right: three-quarters to the eye rather than flying
  across it), so that from in front both wings are spread broadside, and from behind the whole back and both wings;
  each turns to face its prey as it winds up its attack, and back as it winds down, so that nothing leaps where one
  move hands over to the next;
- their bodies held level, a little nose-down (a hawk hanging on the wind looking down at its prey), not nose-up: the
  eye in front then looks onto the tops of their wings, as the eye behind does;
- their wings raised in a shallow V; the hawk's broader (its secondaries, primaries and coverts), and drawn at 1.05
  times its built size where it was 1.2 (spread broadside, it no longer needs it).

From in front the hawk shows its head and hooked beak between both wings spread wide; the bat its face and ears
between both membranes, their finger bones and scalloped edges. From behind, the hawk's back and rufous tail fan, the
bat's back and ears, both wings each.

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

- `companions_sheet.png` (1200 wide, sculpted again 30 Oct): all six standing, from in front and behind, beside the Ranger, three times as
  big; the Ranger with all six about him at the game's size, and three going with him; their six icons.
- `companions_film.mp4` (36.8 s, 1200×676, 30 a second, again 30 Oct): each in turn, from in front and from behind with the Ranger
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
| Tortoise | high dome of raised plates in growth rings round gold hearts, flared rim, pale under-shell, long scaled legs (the fore flattened), a wrinkled neck, beaked head | head out, looking about and up at him, shell rising with its breath, slow blink | keeping up with him (his pick): a determined trundle, long strides by diagonal pairs, shell rocking | draws its head in and rocks back, holds; throws itself forward, head shooting out to snap (two frames); cyan plates of its shell flash up over it as a ward (Guarding) |

Sizes, standing (picture pixels across, as measured by the test against the mage's familiar): each between the
familiar's length and 2.1 times it; the wolf and the tortoise more than the other four by at least 15% in painted size.
The two fliers are drawn 1.05 (hawk) and 1.3 (bat) times their built size about their middles, so their wings read on a
phone (`FLIER_SCALE`).

## Their numbers (`src/art/companions_art_moves.ts`)

- Standing: 15 frames a second (the fliers 30), a loop of 2.4 s.
- Moving: 30 a second; each painted for a pace (`COMP_GAIT`: 5.4 tiles a second, the game's `COMPANION_TUNE.speed`,
  the tortoise too, at his pick), one turn of: hawk 16/30 s, snake 6/30, wolf 10/30, bat 12/30, fox 7/30, tortoise
  6/30.
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

## What he said of the hawk and bat redrawn (30 Oct 2026, by the art chat)

Asked “The hawk and bat redrawn (companions_sheet.png and the film): are all six companions right now?”, his pick:
“Close, change something”; asked what, his picks “The hawk”, “The bat”, and his words: “Bird wings and bat wings are
not stiff.  They curve while flapping.  And I’d like the snake bite animation to be a bit bigger.  Like a big fang bite
to really show off the poison”.

THE WOLF, THE FOX AND THE TORTOISE STAY LOCKED, as they are. What changed:

- THE HAWK'S AND THE BAT'S WINGS BEND AS THEY BEAT (`curl` in each wing beat): the outer wing trails the inner. On the
  way down the tips are bowed up by the air; on the way up the wing folds at the wrist and its tips hang down, then it
  opens again. The hawk's five primaries bend further than its hand, the outermost most. The bat's fingers bend
  further toward the trailing edge, so the skin between them cups on the way down and goes slack on the way up.
- THEY FLAP. The hawk no longer hangs still-winged: it hovers on slow, deep beats (one every 0.48 s), and flies on a
  fuller beat and a glide. The bat flutters on a fuller beat. Each hover begins half way down a stroke, as each flight
  does, and the two keep the same beat, so nothing leaps where one hands over to the other. The bat is drawn at 1.3
  times its built size (it was 1.4).
- THE SNAKE'S BITE IS A BIG FANG BITE. Held: it rears high and draws back, its head turned side-on, its jaws thrown
  wide, its long fangs bared and a bead of venom at each tip. The strike: it lunges further than before (23 of its own
  lengths out, where it was 18.5) and its jaws snap shut on the prey, its body driving on after. Then venom splashes
  out of the bite, green-cyan and falling, and a cyan poison mark blooms on the prey, six petals opening round it.
- THE FILM shows the hawk's and the bat's wings in flight close up (six times as big) at half speed, so that the bend
  shows, and the snake's bite again close up (five times as big) at half speed. It is 41.2 s long.

## Still open

- A deeper beat for the two fliers would leap where one move hands over to the next. Their beats are as deep as the
  checks allow. Going deeper would need a way in the game into a beat and out of it.

## His yes

The curving wings and the big fang bite (`companions_film.mp4`), asked “Curving wings and the big fang bite
(companions_film.mp4): are all six companions right now?”: “Yes, lock all six (Recommended)”.

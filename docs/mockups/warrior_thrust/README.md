# Mock-up: THE WARRIOR'S DIVING THRUST (NOT IN THE GAME until the main chat puts it there)

**What it is.** In place of the warrior's leap, a diving thrust with the great sword. It is behind a
switch that is off: `THRUST` in `src/art/heroes3.ts`. With it off the game is as it was exactly
(tests/warrior_thrust.test.ts checks it). Branch: `mockup/warrior-thrust`, from main at Version 22.0
(44f2a80).

## His words

- To the main chat, 17 Oct 2026, 11:37 Eastern, sent to the art chat at his word on the board: "And
  I think I want to create a new swipe for the warrior.  Lunge or thrust.  A diving thrust in the
  direction with the sword extended.  Same distance as the leap.  Same mobility."
- His yes, by 16:37 Eastern (13:37 where he is), to `warrior_thrust.gif` (top: his leap as the game
  has it; bottom: the thrust, filmed in the game) and the pop-up "The diving thrust
  (warrior_thrust.gif): he dives low and flat with the sword out front, goes as far as the leap, and
  the point punches in with a flash. Send it to main?": "Yes, send it to main (Recommended)".

## What he does (`THRUST3` in `src/art/moves3.ts`, key `kthrust`)

- **The coil**: low on his front foot, the blade drawn back along his right hip, its point on his
  mark.
- **The dive**: he drives off his back foot and goes flat out, low over the floor, from his trailing
  toes to the point, both arms locked out before him, both hands on the hilt, the blade level, his
  head up. Coming down his front leg swings through and reaches for the floor.
- **The lunge** (the blow, 0.5 of the way, where the leap's lands): his front foot planted deep, the
  point punched out to its full length; held a beat; the blade drawn back along his hip and round
  into his stance.
- The game carries him exactly as it carries the leap, as far (6 tiles) and as quick (0.26 s and
  0.03 s a tile). The pictures of the dive are as many as the leap's and over as long. Only his
  coming up out of the lunge, shown only while he is left standing, is a beat longer (15 frames at
  30 a second, not 12).
- **Low**: lifted 9 game pixels at the middle (`THRUST_LIFT` in `src/render/wild.ts`; the leap,
  big and wild, 40); his shadow keeps close under him.

## Big and wild (`src/render/wild.ts`, the warrior only, with `THRUST` on)

- **As he drives off** (`thrustOff`): the floor cracks where his back foot pushes, dust and grit
  kicked back behind him, a gust off him, a small jolt.
- **In the dive**: wind streaming back along him from the point; the blade's light (cyan, a
  friend's) left behind the point in a line; dust and grit torn up off the floor under him.
- **As the point lands** (`thrustLanding`, in place of the leap's landing): a flash at the point,
  a spear of the blade's light and a cone of air straight on from it, a ring of wind, the floor
  cracked under his front foot with dust skidding on ahead, the game held still a tenth of a second
  and a hard kick of the screen.

## How it is checked

- `tests/warrior_thrust.test.ts`: the switch is off; with it on only the warrior's leap and
  landing pictures change, every other clip of every hero frame for frame the same, the leap's as
  many and as quick; both hands on the hilt and the point leading from the coil to the lunge, flat
  out in the middle; low.
- `tests/heroes3.test.ts` (every move's wind from nothing to nothing, the new one too),
  `tests/wild.test.ts`, the whole unit suite, `tsc`.
- Filmed in the game: `SKILL=thrust` and `SKILL=leapgs` in `tools/scenarios/wild_skill.mjs` (the
  practice room, his leap and the thrust with the great sword at the same monsters), made into the
  film with `tools/wild_films.py ... thrust`. A film of the move alone:
  `src/dev/preview_moves.ts`, `4:wild!rear~0.4+kthrust+rear~0.4=Thrust`.

- With main as at Version 22.1 merged in (99a128c): tsc clean; the whole unit suite 1752 of 1752. And the switch
  turned on in the source (so that the painter's side worker, which paints the hero's pictures ahead from the
  source since 22.1, paints the thrust too) and filmed in the game again (`SKILL=thrust`, `dist/thrust_src_on.html`):
  the dive and the lunge as in the film he saw. Its room: the warrior's leap pictures are as many as before; his
  coming up out of the lunge is 3 frames more a side than the leap's landing.

## To make it the game's own (the main chat)

- `THRUST.on = true` in `src/art/heroes3.ts`, in the source (not only at run time: the painter's worker reads it
  from the source). Nothing else in the art changes. (`__dbg.thrust(on)` turns it on in the page alone, for films.)
- The rules are untouched: it is still the game's `leap` (the move, its range, its time, its
  landing blast round him). Whether the blow should strike at the point, along the line of the
  dive, or round him as the leap's does, and the skill's name and words ("Jump to a spot..."), are
  the main chat's and his.
- Sound: the drive off at the start of the move; the punch of the point at the landing, where the
  leap's slam is now.

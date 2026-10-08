# The heroes' animations reviewed to the art rulebook: the art chat's answer

**8 Oct 2026, the art chat.** The owner, 14:20, in the art chat: "I want you to go through all
animations for the three characters and see if they pass our ruleset". The rulebook is his,
approved 8 Oct, 08:23 (the project doc `claude/art_rulebook.md`; `docs/art/RULEBOOK.md` on
`art/rulebook`). Reviewed on `main` at Version 19.0 (`54f6aec`). **Nothing in the game was
changed.** Strike and its second swing were reviewed this morning (`strike_combo_review_answer.md`)
and their mends have his yes (14:05, on `art/strike-combo-mends`): they are counted here as mended.

## How it was checked

All 41 animations of the three heroes (`MOVES3` in `src/art/moves3.ts`: 14 the warrior's, 15 the
ranger's, 12 the mage's), each as the game uses it (`src/art/heroes3.ts`, `PLANS`), from in front
and from behind. Numbers are in game pixels: on a phone held sideways one game pixel is five of the
screen's pixels. The scripts are in `tools/review_heroes/` (run from the root with
`node node_modules/tsx/dist/cli.mjs tools/review_heroes/<script>.ts`):

- `bones.ts`: each move on the bones, sampled at the frames a second the game shows it at: arms in
  the head, a foot that moves while it is on the floor (the game's carrying of the hero not
  counted), jerks (a frame that leaps, a motion that stalls, a snap back, a start at full speed),
  wind-up and follow-through, hips first, landings, standing loops.
- `play.ts` (with `sim.ts`): the game's own rules at sixty steps a second in the practice room and
  the game's own chooser of frames (`render/figure.ts`), the pictures stood in by notes: a foot on
  the floor as the game carries the hero (runs, a walk during an attack, a leap, a roll, the swing's
  step), and every change of picture from one move to another.
- `paint.ts`: every frame painted by the game's own painter: the colour of every light, pixels that
  are neither whole nor empty, how much a standing loop changes.
- `tools/audit_moves3.ts` (arms in the trunk) and `tools/audit_worn3.ts` (arms and weapons in what
  is worn), as they are on `main`.
- Looked at: every frame of every move on a sheet, from in front and from behind
  (`tools/review_heroes/sheets.py`, `src/dev/preview_review.ts`), and close-ups of the faults
  (`tools/review_heroes/zoom.sh`); three films of the game's own frame choice on a floor that does
  not move (`src/dev/preview_play.ts`, `tools/review_heroes/film.py`).

For the owner the same verdict is a page with the films and close-ups, "Hero Animation Review"
(https://claude.ai/artifact/8QyPQQfNWL6n97M1ZD7Cz5, private to him; published 8 Oct). The films and
close-ups are made by the scripts here and are not in the repository (`shots/` and `previews/` are
kept out of it).

## What passes, everywhere

- **Friend cyan** (Pillar 4): every light on every frame of all 41 is the friend's cyan (`#8af6f0`,
  `#b8fff8`); nothing glows pink or gold.
- **Crisp pixels** (Pixels 1): every pixel of every frame is whole or empty, but the one-pixel edge
  of light, which is see-through by design.
- **Arms out of the trunk** (Heroes 6): `audit_moves3.ts`, nothing to look at.
- **Every attack winds up and follows through** (Movement 3), and the game's timings fit the
  pictures: the game plays each wind-up at between 0.83 and 1.19 times the picture's own speed, and
  ends each attack within a frame of the picture's end.
- **The blows turn the hips** (Movement 1): Strike, the slash (mended), Slam and Wave.
- **A landing sinks** (Movement 1): Leap's hips go 4.0 px down after he lands.
- **Loose things follow** (Movement 4): scarf, cape and braids trail and settle; the beam's gale
  blows her mantle and braids back (`gale` in its keys, the painter and the braids' `blast`).
- **Each his own way** (Movement 2), for two of three: the warrior heavy but quick, the ranger low
  and light (the mage: see G).
- **Frames**: attacks, runs and moves at 30 a second, standing at 10, as the rulebook's numbers have it.

## What breaks a rule, worst first, and the mend

**A. FEET SLIDE WHEN THE GAME MOVES THE HERO.** Movement 8: "Feet grip the floor. A foot stays
where it lands; a running figure moves its legs faster rather than slide." Measured in the game
(`play.ts`), the most a foot that is down moves over the floor:
- **The runs:** warrior 6.0 px, ranger 4.8, mage 7.0, every step. The game carries a hero 4.6 tiles
  a second; while a foot is down, the run's own step carries it back too slowly: the warrior's run
  would have to be played 1.46 times as fast, the ranger's 1.22, the mage's 1.79. The town runs are
  the warrior's and the ranger's own runs with the weapon on the back: the same.
- **Attacking or being rocked while walking:** the hero may walk at full speed through an attack's
  follow-through, and the figure stays in the attack's picture. Strike 22.9 px, Slam 29.7, Shot
  30.5, Volley 30.3, Wave 31.8, Orb 38.3, Beam (held) 81.6, Whirlwind (held) 105.5; rocked by a
  heavy blow 17.8 to 25.1. A ranger who walks off from Volley glides 9.1 px on his knee.
- **Whirlwind, standing:** he turns on the spot with his feet down, so they slide round: 17.1 px.
- **Starting and stopping:** the picture jumps from the stance into the run and back (see E); the
  mage's first step slides 9.1 px.
- **The roll (Trap):** the game carries him on while the picture has him back on his feet: 16.3 px
  at its end. **Leap:** the take-off crouch, feet on the floor, is drawn while the game has already
  lifted him 12.6 px into the air.
- **Mends:** (1) the run's frame chosen by how far the hero has gone, not by the clock, so the feet
  grip at any speed (hasted, chilled, slowed by an attack), with longer strides where the cadence
  would otherwise be too fast (the mage's most of all); (2) while the hero walks during an attack or
  a blow's rocking, the legs run under it: the run's legs and the attack's body together on the
  bones, painted as needed (it costs paint and memory: about four thousandths of a second a frame
  and a few hundred more frames per attack; or the rules could stop the hero for the attack, which
  is his to choose); (3) a step in and a step out of the run; (4) Whirlwind turning on the balls of
  his feet with a step round, and when he walks with it, stepping; (5) the roll and the leap
  shown in step with the game's own carrying (the roll up on his feet only when it stops, the leap
  lifted when the picture leaves the floor).

**B. HIS HELM IS LOST IN HIS ARMS.** Heroes 6: "Clean bodies. Arms never pass through clothing or
the body, in any frame." Leap, from in front, frames 12 and 13: his head is hidden in his forearms
(the arm goes 0.48 into the head, where 1 is the two skins touching). Slam, from behind, frames 4 to
6: the same (0.48). (The slash's, frames 2 and 3, is mended.) **Note:** on 7 Oct, 00:35, of the
warrior's hands crossing his helm in Slam and Leap, he said: "thats fine for the warrior". From in
front in Slam, his visor shows under his hands, which is that; what is shown here is more than that,
and the rulebook came after. His to say. **Mend:** as the slash's: the hilt forward and lower at the
top, and his head laid toward his shoulder.

**C. THE STREAK STOPS READING AS A SWORD.** Effects 3: "Everyday hits are bold but clean: a bright
crescent, a few sparks, gone." Away from the blow the streak bends the blade into an axe (Slam 4),
a flag (Slam 1 and 2), a sickle (Leap 1), a hook (Leap 12 and 13), a fork or an arrowhead (most
frames of Whirlwind).
**Mend:** as the strike's: the streak only through the cut; and Whirlwind's as a crescent along its
circle, not hung on the blade.

**D. NO FREEZE ON THE HEAVY BLOWS.** Movement 7: "The moment a heavy blow lands, everything holds
for a tenth of a second." Slam and Leap's landing do not hold at all; only a blow with Power in it
holds, for 0.045 or 0.07 seconds (`render/fx.ts`, `hold`). **Mend:** Slam's blow and Leap's landing
hold for a tenth of a second (Heavy's look on `art/new-words` holds a tenth the same way).

**E. THE PICTURE JUMPS.** Movement 5: "Smooth, plenty of frames, nothing jerky." Where the game
changes from one move to another the figure jumps (the mean of its points, in one step):
- from standing into the run and back: warrior 3.1 and 6.0 px (a heel 13.2), ranger 5.3 and 5.3
  (the bow 20);
- into an attack or a blow's rocking while running: warrior 4.7 to 5.3 px, ranger 4.6 to 5.1 (the
  bow 20); and back to the run: warrior 2.9 to 3.2, ranger 4.7 to 5.4 (the mage's, 2.0 to 2.8, pass);
- **into Whirlwind** 5.8 px (the blade 50) and **out of it** 7.3 px (the blade 24): the spin has no
  way in or out, and after it he is shown the end of Strike, turned wherever the spin left him;
- Leap's landing cut short by running on: 8.2 px (the blade 42);
- **Beam** begins with Wave's wind-up and jumps into its stance: 5.8 px (the staff 47);
- **the roll** ends on one frame of the run (the rules still call him walking in the step it ends:
  the leap is kept from this in `figure.ts`, the roll is not), and its coming up is one jump (the
  head 12.4 px in a frame).
Inside a move: Slam's raise stalls (frame 2) and wobbles at the top (frames 4 to 6), and the blow is
everything at once in one frame (the head drops 13.6 px, the hips turn with the blade: not hips
first); Leap begins with the blade whipping 38.6 px and back 32.8; Wave's wind-up starts at its
fastest (the crystal 12.1 px in its first frame, then 3.5, 2.2).
**Mends:** a way into and out of Whirlwind; Beam's own wind-up; the roll kept from showing the run
as the leap is; a short blend where one move hands over to another; Slam's raise eased and its blow
over two frames, hips first; Leap's take-off from the stance without the whip; Wave's wind-up eased in.

**F. NOT ALIVE ENOUGH WHEN STILL.** Movement 6: "A figure left standing breathes, shifts its weight
and has small habits of its own." The standing loops breathe barely (the chest rises 0.2 to 0.4 px)
and never shift their weight (the hips sway 0.0 px); the cloth moves in them. **The warrior has no
habits in a dungeon** (the ranger has two, the mage two; in town he has one, looking about).
**Mends:** a slow shift of weight and a clearer breath in every standing loop; two habits for the
warrior in a dungeon (his first figure's were "Warrior tests the edge of his sword", the owner's own
idea, and resting on the pommel).

**G. THE MAGE IS NOT WILD.** Movement 2: "The mage: wild. Big sweeping casts, cape and braids
flying, only just in control of the power." Her casts are tidy: in Wave her hips move 2.4 px and
her head 4.0 (the warrior's Strike: 5.5 and 7.2); in Orb 2.5 and 4.3, her hips not turning; she
stands upright while the staff does the work. **Mend:** a pass over Wave, Orb and Beam: leaning into
them, the staff swung from the body, cape and braids thrown about. Pictures first.

**H. SMALL SLIDES INSIDE MOVES.** Movement 1: "A blow plants the feet"; Movement 8 as above. A foot
on the floor moves, standing still: Slam's recovery 4.8 px, Shot 2.4, Volley's kneel 4.1, Wave's
recovery 3.6, Orb's 3.0, into Beam's stance 7.4, Beam's let-go 7.4, the rocking 2.3 to 2.8, the
falls 2.1 (warrior), 4.8 (ranger), 7.9 (mage), drawing the weapon when picked 3.8, 2.4, 5.4.
**Mend:** where a foot moves, it lifts and steps; where it should stay, it stays.

**I. SMALL TOUCHES OF WHAT IS WORN.** Heroes 6. `audit_worn3.ts`: the ranger's drawing arm under the
droop of his cap in Shot, Volley, the sighting and the draw (up to 4.3 picture px), his bow in his
cap in the roll (2.2), the mage's staff in her cape in Wave (1.1) and in her brim at the end of her
fall (2.0), the warrior's forearm in his visor in his fall (2.2). Small (the deepest, 4.3 picture
pixels, is about two game pixels); most were known in 16.0. **Mend:** when each of these moves is
opened for the rest.

**J. KNOWN AND WAITING ELSEWHERE.** Heroes 7, "Truly turned, eight ways": the game draws four views
and mirrors two of them; true turning is on `mockup/true-left` with the main chat, on his yes
("I like the true left"). Heroes 3, "Only the weapon in hand changes": each hero is drawn with
their own weapon whatever they carry; the sword-and-shield moves are paused by him.

## Every animation

| Hero | Animation | Verdict | Faults |
| --- | --- | --- | --- |
| Warrior | Stands (dungeon) | breathes barely, no weight shift, no habits | F |
| Warrior | Runs (dungeon, town) | feet slide 6.0 px a step; jumps in and out | A, E |
| Warrior | Strike | mended, his yes 14:05 (on its branch) | A (walking) |
| Warrior | Strike, second swing | mended, his yes 14:05 (on its branch) | A (walking) |
| Warrior | Slam | helm lost from behind; streak; no freeze; raise wobbles, blow in one frame; recovery slides | A, B, C, D, E, H |
| Warrior | Whirlwind | feet slide; streak; no way in or out | A, C, E |
| Warrior | Leap and landing | helm lost; streak; no freeze; take-off drawn in the air; whip at the start | A, B, C, D, E |
| Warrior | Rocked / thrown forward | small slides; glides if walking | A, H |
| Warrior | Falls | small slide; forearm at his visor | H, I |
| Warrior | Stands (town) | breathes barely, no weight shift; one habit | F |
| Warrior | Looks about (town) | passes | |
| Warrior | Draws when picked | small slide | H |
| Ranger | Stands (dungeon, town) | breathes barely, no weight shift | F |
| Ranger | Runs (dungeon, town) | feet slide 4.8 px a step; jumps in and out | A, E |
| Ranger | Shot | glides if walking; small slide; arm by his cap | A, H, I |
| Ranger | Volley | kneel slides; glides if walking; arm by his cap | A, H, I |
| Ranger | Roll (Trap) | slides at the end; ends on a run frame; jumps up | A, E, I |
| Ranger | Rocked / thrown forward | small slides; glides if walking | A, H |
| Ranger | Falls | small slide | H |
| Ranger | The squirrel (dungeon, town) | passes | |
| Ranger | Sights an arrow (dungeon, town) | arm by his cap | I |
| Ranger | Draws when picked | small slide; arm by his cap | H, I |
| Mage | Stands | breathes barely, no weight shift | F |
| Mage | Runs | feet slide 7.0 px a step | A |
| Mage | Wave (and Familiar) | not wild; wind-up starts at full speed; glides if walking; small slide | A, E, G, H |
| Mage | Orb | not wild; glides if walking; small slide | A, G, H |
| Mage | Beam, held | glides if walking; jumps in from Wave; slides into its stance | A, E, H |
| Mage | Beam, let go | back foot slides | H |
| Mage | Rocked / thrown forward | small slides; glides if walking | A, H |
| Mage | Falls | foot slides; staff at her brim | H, I |
| Mage | A light in her fingers | passes | |
| Mage | Reads | passes | |
| Mage | Makes ready when picked | small slide | H |

(The ranger's town stand, run, squirrel and sighting are his dungeon ones with the bow on his back,
and the same in every number above.)

## The mends, in the order the art chat would make them

1. **Feet that grip (A, E's starts and stops):** the runs by distance; legs that run under an attack
   or a rocking while walking; steps into and out of the run; the roll and the leap in step with the
   game. The biggest thing to be seen in play. Half of it is the chooser of frames
   (`render/figure.ts`), half new keys.
2. **The warrior's three heavy moves (B, C, D, E):** Slam, Leap, Whirlwind as Strike was mended.
3. **Polish (F, G, H, I):** standing loops and the warrior's habits; the mage made wild; the small
   slides and touches.

Each on a branch of the art chat's own, behind a switch that is off, a moving picture to him first.

## What came of it (8 Oct 2026)

- The gripping runs (mend 1's runs): on `art/hero-moves-review`, behind `GRIP`, off. His answer to
  what next for the runs: "More directions, picture first (Recommended)".
- Then, 15:31: "Wait I need the rangers animations fixed", and at 15:38 his list, which begins "All
  of that, but more." (in full in the note below). The ranger was remade on a battle stance of his own, with mend 1 done for him (his
  runs grip; his stops and starts; his legs run under his attacks and rockings as he walks; the
  roll), and the Shot's arrow made the game's: branch `art/ranger-stances`, behind
  `RANGER_STANCES` and `RANGER_ARROW`, off. He said yes to each part, and at 17:07 "Yes, hand it all
  over (Recommended)". Its note: `docs/mockups/ranger_stances/README.md`.
- Still to come from the art chat, pictures first: the mage's battle stance; the runs in more
  directions; then mends 2 and 3.

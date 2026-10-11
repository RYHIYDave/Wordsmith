# Mock-up: THE CULT'S TWO NEW FIGHTERS, the dagger cultist and the mini fleshmancer (NOT IN THE GAME)

**What it is.** Two new enemies of the cult under the Crypt, drawn on the heroes' bones as the newer
monsters are (`docs/mockups/new_mobs/README.md`), every move through the checks, pictures to him first.
Nothing of the game imports them; their switch, `CULTISTS_SWITCH` in `src/art/cultists.ts`, is off. Where
they come, how often, and what each does in a fight are the main chat's (with him).

**State of this branch (`mockup/cultists`):** from `mockup/fleshmancer` at 25c6373 (the Fleshmancer whole,
as he went to the main chat). Made by THE ART CHAT, 11 Oct 2026. THEIR LOOKS, WITH HIS YES (by 17:43,
below); THEIR ATTACKS, made and filmed for him, WITH HIS YES (by 18:39, below): the dagger cultist's run and
his leap and plunge, and his death; the mini fleshmancer's call that raises the dead out of the cult's
bodies, and his fire. Not made
yet: the mini fleshmancer's glide, how he flinches when hit and his death; the dagger cultist's flinch is
made but not yet shown.

## His words

- 11 Oct, 14:57, in the art chat: "When you’re finished with that I’d like 2 more cultist enemies.  A
  melee cultist the runs at you with a sacrificial dagger, and a mini fleshmancer elite that uses cultist
  corpses to raise skeletons (can just use the same animation as the warden) and does a smaller version
  of the fire laser from the boss.  They start showing up in floor 4, then all over floor 5." Read back
  to him as: after floor 5, a cultist who charges with a sacrificial dagger, and a mini fleshmancer elite
  who raises skeletons from dead cultists with the same summoning move as the Warden and fires a smaller
  version of the boss's sweeping fire; they start turning up on floor 4 and are all over floor 5.
- 10 Oct, 07:47 (his art rulebook): "Put in the ruleset that I want animations as big and wild and
  kinetic and weighty as possible.  I’d rather it be a notch too high than a notch too low." 07:53: "And
  I want all animations checked against this statement before I see them."
- THEIR LOOKS, on the page "Cultists Look Review", asked as a pop-up, "The dagger cultist and the mini
  fleshmancer, as on the Cultists Look Review page: good to animate as shown?": "Change their looks
  first"; asked what, his pick: "Mini fleshmancer: less like the boss" (offered as: keep him the boss's
  kin, but give him his own clear look at a glance). Remade and asked again, "The mini fleshmancer's own
  look is now on the Cultists Look Review page: no staff, a claw of fire in each hand, a skull mask, and
  bones round his shoulders. Are both good to animate as shown?", by 17:43: "Yes, animate them
  (Recommended)", offered as: the dagger cultist's run and his leaping stab, and the mini fleshmancer
  raising skeletons and his smaller sweeping fire, as films.
- THEIR ATTACKS, on the page "Cultist Attacks" (three films: the dagger cultist's charge, the mini
  fleshmancer raising the dead out of the cult's bodies, his fire), asked as a pop-up, "The cultists'
  attacks are on the Cultist Attacks page: the dagger cultist's charge, the mini fleshmancer raising the
  dead from cult bodies, and his smaller fire. Good as shown?", by 18:39: "Yes, on to their other moves
  (Recommended)", offered as: next the mini fleshmancer's glide, flinch and death, and the dagger
  cultist's flinch, shown the same way.

## What is in it

- `src/art/cultists.ts`: `DAGGER_CULTIST` and `MINI_FM`, each a `Mob` (art/new_mobs3.ts) on the heroes'
  bones; `makeDaggerCultistArt3()` and `makeMiniFleshmancerArt3()` give them as the game holds a monster
  (both facings; idle, walk, attack, clips.attack, .reel, .die, and the mini's clips.moves.raise).
- `src/art/fleshmancer.ts`: the mini is painted by his master's painter in a look of his own (`FmLook`,
  `withFmLook`, `MINI_FM_LOOK`: bare-handed, a claw of fire in each hand, a skull mask, a fringe of bones,
  darker robes). The master's look is the default and he is painted exactly as before (his tests, 17 of
  17). For one who goes bare-handed the painter also draws his fire between his claws as he pours it and
  embers rising round him as he calls up the dead.
- `src/art/fm_spells.ts`: `drawFireStream` and `drawScorch` take a `FireSize` (where it comes down, how
  far it runs, how thick, how far its rope bulges); the master's is `FM_FIRE_SIZE`, unchanged.
- `src/dev/preview_cultists.ts`: the pictures (sheet, close, loop, strip) and the films
  (`film:charge`, `film:raise`, `film:fire`, through `tools/page_gif.mjs`).

## Their looks

THE DAGGER CULTIST: one of the cult's own, the violet robe and pointed cowl, two slashes of pink for eyes;
lean and hunched, a little shorter than the knight (his cowl 54 up; the knight 58); his robe tied up to the
knees with the cult's pink cord, his legs bound in dark rags; a long wavy dagger of bone held high in his
fist. THE MINI FLESHMANCER: the boss's kin, the knight's height (his hood 58 up; his master's a head over
him); he floats, his robes trailing into tattered tails; no staff, a claw of fire in each hand, a pale
skull mask in a pointed hood, a fringe of small bones round his shoulders, darker robes.

## Their moves (seconds from each one's start; the game's frames are thirty a second)

- THE DAGGER CULTIST'S RUN (`walk`): 8 frames at 13 a second, painted for 2.6 tiles a second (the game's
  cultists' pace; `makeDaggerCultistArt3(pace)` shows it to match another): a sprint, bent low, both feet
  off the floor between strides, each foot down three frames of the eight and gripping the floor; the
  dagger brandished high.
- HIS LEAP AND PLUNGE (`attack`, 1.15 s, `KNIFE_BLOW`): he plants himself and sinks; rears up on his toes
  hauling the dagger over his head in both hands, the light catching the blade (`warn` 0.3; held,
  trembling, to 0.52; `attack.glint`); LEAPS at 0.52, both feet off the floor; PLUNGES it down as he lands
  at `hit` = 19/30 s (0.63), more than half a tile on from where he stood, the point at the floor about
  three quarters of a tile ahead of his floor point, a burst of sparks at it and dust kicked up round his
  feet; springs back to where he stood by 1.15. Its streak (`trail`, the dagger's point) from just before
  the blow to the blow.
- STRUCK (`reel`, 0.3 s): knocked back on his heels, his cowl jerked back; coiled again.
- HIS DEATH (`dying`, 1.3 s): thrown back; drops to his knees (0.38); pitches onto his face (0.72) and
  lies still, the dagger still in his fist: A BODY, left lying (the last frame of `clips.die`), for the
  mini fleshmancer to raise the dead out of. The dying wear no edge and give no light.
- THE MINI FLESHMANCER'S CALL (`more.raise`, 2.2 s, `MINI_RAISE`): he sinks and bows, claws low before
  him, palms up (0.4); holds, gathering (0.6); flings them up over his hood, his head thrown back, every
  fire in him flaring, embers rising off the floor round him; THE DEAD COME UP at 1.1 (its `hit`, as the
  Warden's `SUMMON_RISE` is 1.1); holds them up, shaking (1.6); comes down (2.2). In the film, at each
  body: his fire catches 0.3 s before the rise (`drawRaiseGlow`), the body burns away from 0.12 s before
  it, and from the rise the game's skeleton CRAWLS OUT OF THE GROUND where it lay (the Warden's dead:
  `CRAWL_OUT` on, the skeleton's `clips.moves.crawl`, 29 frames at 20 a second), the second body's 0.16 s
  after the first's. Whose bodies count, how many, and how far he reaches are the main chat's.
- HIS FIRE (`attack`, 2.8 s, `MINI_FIRE`): he draws both claws back to his right, rising and turning away,
  the fire in them swelling (0 to 0.45); thrusts them out together and the stream BURSTS from between
  them at `hit` = 17/30 s (0.57); it POURS from 0.6 to 2.1, down onto the floor 0.6 tiles before him and
  on along it to 2.6 tiles (his master's: 1.0 to 4.8), thinner (`MINI_FIRE_SIZE`); he sweeps it across
  before him from his right to his left, 2.2 radians, once (`miniFireTurn(t)`: radians from the way he
  faces, turning to his left, as `fmFireTurn`), his body jolting with it; the floor it sweeps burns on
  0.6 s (`FM_FIRE_BURN`), scorched after; he pulls back by 2.8. Where the stream pours from, picture pixels
  from his floor point: `miniFireAt(t, view)`. Draw it with `drawFireStream(..., MINI_FIRE_SIZE)` and
  `drawScorch(..., MINI_FIRE_SIZE)`, as the master's.
- His stand (3.0 s, 30 frames at 10 a second); his glide, setting off and stopping, struck and his death
  are placeholders made from his master's, NOT FOR USE: they come next, pictures first.

## Checks

- `tests/cultists.test.ts`, 13: the switch off and nothing of the game importing them; every frame of
  every move made both ways round (no cyan anywhere, nor a cyan light; the enemy's pink edge round the
  living; every pixel whole or empty but the edge; no lone pixel; the dying with no edge and no light at
  the end); sizes; made as the game takes a monster (lists, clips, each blow on a frame); the run's feet
  gripping and leaving the floor; the leap and plunge (the dagger over his cowl as he warns, the light on
  it, both feet off in the leap, the point at the floor ahead as it lands, back where he stood); his body
  lying; the fire (claws out as it bursts, one sweep never turning back, smaller than the master's,
  pouring from between his claws); the call (claws low, then over his hood as the dead come up); the mini
  floating through all of it.
- Each move checked against his Animations 1 before he saw it: the leap made longer (from under half a
  tile on to more than half) so the plunge lands at the knight; the call's rise made a fling with an
  overshoot and a harder shake; the fire given a kick back as it bursts and a shudder as it pours.
- `tests/fleshmancer.test.ts`, 17 of 17 (the master unchanged).
- tsc clean.

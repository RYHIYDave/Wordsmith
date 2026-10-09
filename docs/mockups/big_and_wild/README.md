# Mock-up: BIG AND WILD (NOT IN THE GAME until the main chat puts it there)

**What it is.** The owner changed the art rules on 8 Oct 2026: effects and animations are big and
wild. The Wave was made so first, as the measure of how wild, and he said it is just right; then
the warrior's Strike and the ranger's Shot, each in his own way, and he said yes to both. It is
behind a switch that is off: `WILD` in `src/art/moves3.ts` (`useWild(on)`), with the effects in
`src/render/wild.ts`. With it off, the game is as it was exactly (tests check it).

**Where:** on `art/mage-stances`, because the wild Wave is cast from her guard (`MAGE_STANCES`).
The wild Shot is from the ranger's crouch (`RANGER_STANCES`, the game's own since Version 19.4).

## His words

- By 20:14, answering the pop-up on `mage_habits.gif` (her power getting away from her): "if the
  "power getting away" animations is what you meant by wild and barely controlling her power, then
  we are not on the same page.  there's not even a glow on the staff, it just gets lighter.  there
  should be energy crackling and bolts shooting out, barely able to contain it.  this goes for all
  the animations we've created.  i think we need to amend the rules for effects and animations
  change it to big and wild.  why dont you redo the WAVE animation as big and wild as you think is
  appropriate and ill tell you if it needs to go more or less wild".
- 20:17: "move wild?  she just lowered her staff.  is that wild?" (He was right: her guard is the
  staff lowered and level, and nothing she did was wild.)
- By 20:48, to `wild_wave.gif` ("In wild_wave.gif, how wild is the new Wave?"): "Just right
  (Recommended)".
- 20:49: "so much better.  id like to take that intensity and punch up some other animations as
  well.  show me strike and shot the same way, big and wild".
- To the first Strike and Shot (`wild_strike.gif`, `wild_shot.gif`), which crackled as the mage
  does. Strike: "These are good, but they also just follow the mage of unbridled energy.  Each
  character has a style, the crackling works for the mage, but not the warrior.   Try again using
  their style as inspiration.  We're on the right track tho.  I like the big crescent and the
  kick.  More technique and follow through." Shot: "Same as the warrior.  This just looks like
  he's firing a lightning arrow.  We're getting there".
- 21:23: "Now we're talking".
- To the second (`wild_strike2.gif`, `wild_shot2.gif`). Strike: "Okay so close.  Love it expect
  the sparks being blue.  I'd rather have bone fragments or dust from the skeletons, or yellow
  sparks hitting an armored target.  So maybe that's a mob particle effect as opposed to the
  weapon effect.  Also there's a few frames where he puts his sword down during the second hit.
  I'd like if he kept the sword up at the end of the first hit then used that position to swipe
  back to the battle stance.  If there isn't a second tap to fire off that second attack, then he
  just moves the sword back down to battle stance." Shot: "So close.  Can we make the blue effects
  just like wind instead of energy?  Everything else is great."
- 21:41: "And if it increases the total attack time by a couple frames, that's fine, as long as the
  swipe stays just as fast.  That would reinforce the follow through of the attack".
- By 22:35, to the third (`wild_strike3.gif`, `wild_strike3_lone.gif`): "Yes, keep it
  (Recommended)"; and to `wild_shot3.gif`: "Yes, keep it (Recommended)".
- 22:35, asking: "are the sparks a part of the monsters animations?" (Told: they belong to the
  monster, not the weapon; not painted into its frames, but thrown out as a hit lands, chosen by
  what was hit; for now only the sword and the arrows throw them.) By 22:36, to "Should every hit
  throw the monster's own bits, the mage's spells too (on top of their crackle)?": "Only sword and
  arrows".

The art rulebook (his doc, the project's `claude/art_rulebook.md`, `docs/art/RULEBOOK.md`) now
says big and wild under Effects and magic and under Movement, with this Wave as the measure.

## What changes, with the switch on

- **The crystal crackles** (`Wild.update`): each picture of the mage says where her crystal is
  and how hot it burns (`Charge` in `src/art/kit.ts`: painted by `src/art/hero3_mage.ts`, carried
  by the sprite, mirrored with it, gone with the light in a fall). The renderer hands it to the
  effects every frame (`Fx.charge`, from `render.ts` through `Figure.charge`). By how hot it burns:
  a few small arcs and sparks in her guard; a storm of them as a spell gathers; and from the
  hottest, bolts that jump from it to the floor round her. Its light is a real glow, bigger and
  brighter the hotter it burns.
- **She casts it with her whole body** (`wildWaveFromGuard`): the staff up and far back over her
  shoulder, her body arched and turned away, her free hand thrust at her mark; one great arc over
  and down as she lunges deep, her coat and braids blown back; then the power kicks the staff up
  and throws her head back, she grabs for it, wrestles it down shaking, and comes up into her
  guard. Fourteen frames, over before the rules' attack is (0.48 s). A foot on the floor moves at
  most 0.2 game px (`tools/review_heroes/play.ts --mage --wild`, "quick attack, standing").
- **It is let go with a blast** (`Wild.cast`): a flash where the staff comes down, a ring, a fan
  of sparks, four bolts that shoot out ahead of it and strike the floor, and the screen kicks.
- **In flight it stands up tall** (`drawWildWave`, in place of the plain wave): a crest as tall
  again on a wall of its own light, its white edge boiling, a tenth wider than what it strikes;
  arcs crawl along its crest and leap off it, sparks stream back, bolts fork ahead to the floor.
- **What it hits crackles** (`Wild.hit`): a flash, arcs crawling over the struck, sparks, a bolt to
  the floor. (A hit is taken for the Wave's when one of her waves is there: the rules are not
  changed.)
- Her power crackles in the friend's cyan, white at its heart; the wave keeps the violet of her
  magic (the Volatile word's violet arcs stay its own).

## Strike, the warrior's way (`wildStrike`, `wildSlash`; `Wild.swing`, `Wild.blowHit`)

- **The first swing**, the rising cut, as fast as it was (its blow at the fourth frame, when the
  rules land it): he coils deeper and lower, the blade further behind, and the blow lands with him
  sunk over his front foot; the blade runs on up over his left shoulder, all of him turned after
  it, and **he holds the sword up** there (`strikeUp`, `strikeHeld`).
- **A second tap swipes back from there** (`wildSlash`): down the way it went up, through the front
  of him at the height of a chest, on round behind his right side, and into his stance; its blow as
  quick as before (the fourth frame), the follow-through a frame past the rules' attack (`tail`).
- **No second tap: he holds the sword up for as long as a second tap would still make the second
  swing** (the rules' `Hero.combo` and `comboT`; the figure is told so, `FigureState.poised`, and
  the first swing waits at `Move3.poise` / `Clip.poise`), **then lowers it** round behind him and
  down into his stance (`tail`). The rules are not changed: the figure shows the move's end while
  he stands; anything else he does ends it.
- **The effects:** a thick crescent of the blade's light (white at its leading edge, cyan behind:
  what glows on a friend is cyan), a second slimmer sweep after it as the blade follows through
  (the other way for the swipe back), white lines of wind off its edge, dust and a ring at his
  feet, and the screen kicks. **A blow lands hard:** a white cut, burst and ring, the game holding
  still an instant, the screen kicking, and **what flies off is the struck's** (below).

## Shot, the archer's way (`wildShotLow`; `Wild.loose`, `Wild.arrowHit`, `drawWildArrow`)

- **Wind, not energy:** a white glint runs to the arrow's point as he holds the full draw
  (`hero3_ranger.ts`); the loose is a gust of white at the bow, two hoops of air thrown off across
  the arrow's way, lines of wind ahead of it and dust at his feet, and the screen kicks; he holds
  the follow-through. The arrow leaves a trail of air, pale and seen through and thinning behind,
  with air spinning round its last stretch. It punches in: a white burst, a ring of air, wind out
  of the far side, an instant's hold, and **what flies off is the struck's**.
- The colours: `AIR` in `src/render/wild.ts`, white to a pale cool grey, nothing of the crackle's
  cyan.

## What flies off a hit (`MATTER`, `Wild.debris`, `Wild.see`)

The monster's, not the weapon's (his "mob particle effect"): chosen by what was hit, from the
monsters the effects are shown each frame (`fx.wild.see`, from `main.ts`). Bone and dust off
skeletons (and their archers); yellow sparks and flakes of iron off armoured guardians (any
champion) and the warden; scraps of robe and a little blood off cultists; tufts and a little blood
off bats; a little blood and dust off brutes. Only the sword's blows and the arrows throw them (his
answer by 22:36); the Wave crackles over what it hits instead.

## Not yet

The rest one at a time, each shown to him first: her power getting away, her hits and fall, the
Orb and the Beam, Slam, Volley, the roll, the words' looks.

## How it is checked

- `tests/wild.test.ts` (11): the switch off and the Wave as it was (today's, or from her guard);
  on and off again exactly; without her stances the Wave is today's even with the switch on; the
  wild Wave lands when the rules let it go and is over before their attack is; her feet; the
  pictures carry the crystal's charge; the effects add nothing with the switch off. Strike and
  Shot as the game has them with it off, and exactly so after it is switched on and off, in either
  order; the first wild swing lands when it did, holds the sword up past the rules' attack, and the
  second begins from just there, its blow as quick; as the figure shows it, the sword held while a
  second swing may come and then lowered into his guard, and the second swing's first picture the
  one held (only his tabard's hem differs); his feet grip the floor (a foot on it moves less than a
  game pixel) as the game plays both swings and one, from in front and behind; nothing blue flies
  off a hit, bone off a skeleton, yellow sparks off a guardian, and the arrow's gust and trail.
- The films: `node tools/build_to.mjs dist/wild.html`, then for each of `wild_wave.mjs` (out
  `shots/wild/on`), `wild_strike.mjs` (`shots/wild/strike_on`) and `wild_shot.mjs`
  (`shots/wild/shot_on`):
  `node tools/playtest.mjs --file dist/wild.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/<it> --out <out>`
  (and `OFF=1 ... --out` the same with `off`), then
  `python3 tools/wild_films.py shots/wild/off shots/wild/on previews/wild/wild_wave.gif 8-36 3`;
  `FRAMES=0-114 WIDTH=520 COLOURS=112 python3 tools/wild_films.py shots/wild/strike_off shots/wild/strike_on previews/wild/wild_strike3.gif 9-50x2 2 strike`;
  `FRAMES=116-185 WIDTH=540 COLOURS=144 python3 tools/wild_films.py shots/wild/strike_off shots/wild/strike_on previews/wild/wild_strike3_lone.gif 160-185x2 2 strike_lone`;
  `WIDTH=560 COLOURS=144 python3 tools/wild_films.py shots/wild/shot_off shots/wild/shot_on previews/wild/wild_shot3.gif 8-30 3 shot`.
  The warrior's taps come as the game spaces a held attack's swings, so the hold is seen.
- The whole unit suite: 697 of 697; tsc clean.

## To make it the game's own

Turn `WILD.on` and `MAGE_STANCES.on` on (or keep `useWild(true)` after `useMageStances(true)`), or
fold `wildWaveFromGuard`, `wildStrike`, `wildSlash` and `wildShotLow` into what they stand in for
and the `if (WILD.on)` branches with them. `__dbg.wild(on)` puts it in for a playtest and paints the
heroes again.

What it touches beyond the art: `render/figure.ts` (an attack's end seen while the hero stands,
`Clip.tail`, and where it waits, `Clip.poise`, told by `FigureState.poised`; and `Figure.charge`),
`render/render.ts` (the wave drawn tall, the arrow's head, the crystal's place handed to the
effects, and `poised: h.combo === 0 && h.comboT > 0`), `render/fx.ts` (calls into `Wild`),
`main.ts` (`fx.wild.see(g.monsters, g.hero.combo)` each frame, and `__dbg.wild`), `engine/px.ts`
and `art/kit.ts` (a sprite's `Charge`), `art/actor_types.ts` (`Clip.tail`, `Clip.poise`) and
`art/heroes3.ts` (the clips carry them).

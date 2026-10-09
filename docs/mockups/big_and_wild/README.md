# Mock-up: BIG AND WILD (NOT IN THE GAME until the main chat puts it there)

**What it is.** The owner changed the art rules on 8 Oct 2026: effects and animations are big and
wild. The Wave was made so first, as the measure of how wild, and he said it is just right. It is
behind a switch that is off: `WILD` in `src/art/moves3.ts` (`useWild(on)`), with the effects in
`src/render/wild.ts`. With it off, the game is as it was exactly (tests check it).

**Where:** on `art/mage-stances`, because the wild Wave is cast from her guard (`MAGE_STANCES`).

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

## Not yet

Strike and Shot made the same way (his ask of 20:49), then the rest one at a time, each shown to
him first: her power getting away, her hits and fall, the Orb and the Beam, the words' looks.

## How it is checked

- `tests/wild.test.ts` (6): the switch off and the Wave as it was (today's, or from her guard);
  on and off again exactly; without her stances the Wave is today's even with the switch on; the
  wild Wave lands when the rules let it go and is over before their attack is; her feet; the
  pictures carry the crystal's charge; the effects add nothing with the switch off.
- The film: `node tools/build_to.mjs dist/wild.html`, then
  `node tools/playtest.mjs --file dist/wild.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/wild_wave.mjs --out shots/wild/on`
  (and `OFF=1 ... --out shots/wild/off`), then
  `python3 tools/wild_films.py shots/wild/off shots/wild/on previews/wild/wild_wave.gif 8-36 3`.
- The whole unit suite: 692 of 692; tsc clean.

## To make it the game's own

Turn `WILD.on` and `MAGE_STANCES.on` on (or keep `useWild(true)` after `useMageStances(true)`), or
fold `wildWaveFromGuard` into the Wave and the `if (WILD.on)` branches into what they stand in for.
`__dbg.wild(on)` puts it in for a playtest and paints the heroes again.

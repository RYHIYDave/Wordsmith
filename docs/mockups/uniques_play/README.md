# What the unique items show in play: the first three

Branch `art/uniques`, carried on from 3081f14 (the build and the 62 bag pictures). Queue item `draw-unique-items`, pulled
11 Nov 2026 by the Uniques in-play chat. Nothing here is live: each picture is behind a switch of its own in
`src/render/unique_play.ts` `UNIQUE_PLAY` (`tome`, `risen`, `fourth`), all **off**, and each only ever shows on a unique
worn, which only exists with `UNIQUES` on. With a switch off that unique is shown exactly as the build shows it.

These are the three the build had no picture for at all (docs/uniques/README.md 4 and 5), as the queue item asked to start
with: The Restless Tome's book in flight, The Fleshmancer's Brand's risen elite, the fourth globe over the Brawler's head.

## His words (11 Nov 2026, evening, each by pop-up)

Sent a picture of each of the three (`pictures/restless_tome.png`, `pictures/fleshmancers_brand.png`,
`pictures/fourth_globe.png`) and a short film of each (MP4, made by tools/uniques_play_film.py), and asked of each whether
its look is good to hand to the main chat:

- The Restless Tome, offered as: your red book flies round you beating its boards like wings, red-orange fire streaming
  behind it, and its fire leaps onto an enemy it touches: “Yes, hand it to main (Recommended)”.
- The Fleshmancer's Brand, offered as: the elite you killed is pulled back up, drained grey and glowing your cyan, with the
  brand's ring under it burning away as its 15 seconds run out: “Yes, hand it to main (Recommended)”.
- The Fourth Globe, offered as: a fourth globe the same as the other three over the Brawler's head, and the bar joins all
  four when the combo locks: “Yes, hand it to main (Recommended)”.

**So all three have his yes**, each offered as: queued for the main chat to bring in, behind its switch, still off.

And, as the queue item asked, a picture of a unique's card as the build has it (`pictures/unique_card.png`: its name and what
it does in orange, its price in red, four orange pips under it in the bag), asked whether that look is right. His own words:
“I think it just has pips equal to the number of mods it has”. Read as: a unique should not always show four orange pips; it
shows one for each mod it has, as other pieces do (src/ui/panels.ts `drawItemPips` lights all four for a unique today). He
said nothing against the card's colours. Not this chat's to change (the card and the pips are the build's): passed on as a
queue item `match-unique-pips-to-its-mods`, his words in it; which of a unique's lines count as mods is that chat's to ask
him.

## What is drawn

**The Restless Tome** (the Warlock's; his idea: “I’d like a tome that swirls around you and puts hellfire on any enemy it
touches”). The bag picture's book, truly turned: built of its two red boards, its two blocks of leaves, two leaves lifting
off the gutter and its gold ribbon, and seen from the game's one camera sixteen ways round, at eight frames of its beat (the
boards are its wings; the one on the inside of its turn dips). It flies where the rules have it (`Game.uq.tomeA`, 1.8 tiles
out, a turn in 1.6 seconds), 16 game pixels up, a soft shadow under it, sorted with everything that stands so it goes behind
him and in front of him. Its fire is the demon's red-orange (his 3 Nov: “cyan fire in the demonic hand, red/orange fire on
the tome”; the bag picture's `fire` ramp), in the shape of the Warlock's own fire (`fireAt`): a tongue left where it is every
thirtieth of a second, each rising and burning down in a third of a second, so a tail of flame follows its turn; a warm light
on the floor. On a `touch` its fire flares on that enemy (a great tongue, a ring of flecks, nine frames) and the book's own
fire and light flare; then his cyan hellfire burns there, which is the Warlock's own and already in the game.

**The Fleshmancer's Brand: the risen elite.** Its own kind's pictures (every one of the 79 kinds tried), the life gone out
of them (`risenLook`, a pixel at a time): the enemy's pinks (its eyes, runes, fire, its edge of light) come out the friend's
cyan at the same brightness, the gold of its fire's tip the cyan's white, and all the rest is drained to a cold grey. It is
pulled up off the floor where it fell (its fall played backward over the rules' 0.6 seconds, slow to start, then snapped
upright; its body is no longer lying there), stands, walks and strikes with its kind's own frames (its blow on the rules'
0.3 seconds), a burst of cyan on the one it strikes. Under it THE BRAND as the glove's bag picture has it, a ring and a
stroke through it (a bar across each end, as a branding iron's), in cyan on the floor, turning slowly; stamped down white
as it rises; its ring burns away from the top round as its 15 seconds run out, and gutters in its last two. Where it rose
the floor is cracked with cyan light (the Warlock's own cracks), a ring thrown out, motes, the screen kicked. At its end it
falls as its kind falls and fades.

**The Fourth Globe.** The Brawler's row of globes with one more: `paintGlobes` takes a row of any length, three painted
exactly as before (tested pixel for pixel). Worn, four are over his head, the row a globe wider and still centred; locked
when all four are in, the bar joining all four.

**His rules kept.** What glows on a friend is cyan (the risen one, its brand, its blow); no pink, no gold glow anywhere
(the tome's ribbon and corners are the bag picture's gold metal, lit, not a glow); honest fire orange, the tome's the
demon's red-orange. Real shapes: the book is a book, the brand the brand. Everything at the heroes' grain, two picture
pixels to a game pixel, crisp, lit from the upper left; looked at beside the Brawler and the Warlock at a phone's own size
(852 by 393 points, three screen dots to a point) and no finer than they are.

## What is where

- **src/render/unique_play.ts** (new): the three switches. Imports nothing.
- **src/art/unique_play_art.ts** (new): the painters, no screen needed: `paintTome`, `paintTomeFlame`, `paintTomeTouch`,
  `risenPixel`/`risenLook`, `paintBrand`, `paintRiseCracks`, `paintRisenBlow`.
- **src/render/unique_fx.ts** (new): `UniqueFx`, laid in the game: told of every event, stepped with the effects, asked
  each frame for what stands (`stands`), what lies on the floor (`drawGround`) and what is over everything (`drawAir`).
  `owns(e)` leaves out the build's two stand-ins (stepTome's spark, raise's ten sparks) once the picture is shown.
- **src/render/fx.ts**: `fx.uniques`, beside the Warlock's, the Tinkerer's and the Brawler's (six lines).
- **src/render/render.ts**: gives it the game and the monsters' pictures; lays its stands (two places, five lines).
- **src/render/veteran_fx.ts**, **src/dev/veteran_globes.ts**: the globes' row three or four long.
- **src/main.ts**: `__dbg.uniquePlay` (the switches, for a look in a page).
- **tests/unique_play.test.ts** (6): the switches off; three globes as they were and four; the book every way round at
  every frame; its fire's colours; the risen look over a great many colours; the brand, the cracks, the blow.
- **tools/uniques_play_peek.ts** (the painters big, no browser), **tools/scenarios/uniques_play_look.mjs** (the three in a
  built page: stills, a film frame by frame, every kind risen in turn), **tools/uniques_play_film.py** (his MP4 and his
  stills from the frames).
- **docs/mockups/uniques_play/pictures/**: the four pictures sent to him.

Nothing of game/ is changed.

## To see them

`node tools/build_to.mjs dist/uniques_play.html`, then in the page's console `__dbg.uniques.on = true`,
`__dbg.uniquePlay.tome = true` (or `.risen`, `.fourth`), `__dbg.practice('warlock', 7)`,
`__dbg.game().giveUnique('restlesstome', 12)` and put it on. Or
`LOOK=tome node tools/playtest.mjs --file dist/uniques_play.html --touch --size 852x393 --dpr 3 --scenario tools/scenarios/uniques_play_look.mjs --out shots/uniques_play/tome`
(`LOOK=risen`, `LOOK=globe`; `FILM=6` for a film's frames; `PLAY=off` for the build's stand-ins).

## Checked

- `tsx --test tests/unique_play.test.ts`: 6 pass. `tsx --test tests/veteran.test.ts` (the globes' own, and its rule that the
  game brings in the Brawler's mock-ups only through his own files): 96 pass.
- `tsc --noEmit`: clean.
- The page builds. With every switch OFF: tools/scenarios/uniques_look.mjs and the three looks (`PLAY=off`) run clean at
  phone size, the stand-ins as before. With them ON: the three looks, their films, and every one of the 79 kinds risen in
  turn (`LOOK=kinds`): no error on the page.
- Every picture looked at big (tools/uniques_play_peek.ts) and at a phone's own size in the game, beside the Brawler and
  the Warlock.
- `node tools/unit.mjs --only unique_play,veteran,veteran_art,items_unique,uniques_game` on 0937ccb6fe (the five and the core
  23): 28 files, 415 tests, 28 passed, 0 failed.

## Not done

1. **Bringing it in** is the main chat's (queue item `bring-in-unique-play-pictures`): all three have his yes, so each
   switch goes on when `UNIQUES` does. Test 1 of tests/unique_play.test.ts asserts them off: change it then. The build's two
   stand-ins (game.ts stepTome's spark, raise's sparks) can go then too; until they do `UniqueFx.owns` leaves them out.
2. **The rest of the queue item's list**, not begun: The Drowned Arm's tentacle (`warn`, `slam`), The Queen's Talons' bird
   (`dive`), The Rainwalker, The Shepherd's Crook, The Tide (`turn`), The Windcutter's blade of wind (`blade`), The Fan's three
   arrows, The Sticky Wrench's stuck vial (`stuck`), The Moth's Wing's darkened word (`dark`, `light`); and the moments the
   build only tells of (Bloodprice, The Winning Streak, The Tow Line, The Unsigned Pact, The Pivot, The Receipt, The King's
   Knot, The Crier's Hush, The Warden's Keys, The Hair Trigger, The Tuning Staff, The Short Way, a boss's own dropped).
   `UniqueFx.handle` is where each hangs; a switch each in `UNIQUE_PLAY`. Back in the queue as `draw-unique-items`, for a fresh
   chat (this one being long).
3. **The Warlock's own book**: the red book chained at his hip is still on him while the Tome flies (it is a few pixels at
   the game's size). Taking it off him is a change to his baked pictures.
4. **The risen elite's pictures are its kind's standing, walking and attack frames**: a kind that moves by a gait or an act of
   its own (the first five floors' own, Act 1's fliers) is shown by its plain frames, not those.

# The next: The Drowned Arm (branch `art/uniques-play2`, 12 Nov 2026)

Cut from `main` at 10161fc (25.3.10, which has the first three). Pulled from the queue (`draw-unique-items`) by a chat of his
working from the queue (his words: “Please knock out some queue items”).

**The Drowned Arm** (amulet, the Swamp Colossus's: every 5 seconds a tentacle bursts up under the enemy he is fighting and
slams it, `game.ts stepArm`). Behind `UNIQUE_PLAY.arm`, off. Its bag picture's drowned olive flesh (`ARM_FLESH`, the bag
picture's `arm` ramp), a paler inside down which its suckers run (rings with a dark pit, bigger toward its root), a wet glint on
its lit side, edged in ink. On the rules' `warn` (half a second before the blow) BLACK WATER wells up on the floor there and
churns (the darkest of the bag picture's water: never bright enough to read as a glow), and the arm bursts up out of it on the
far side of the enemy from him (as the screen has it: mirrored when he stands on the other side), its tip hooked, swaying; it
towers, cocks back, and on the `slam` (frame `ARM.slam`, the rules' half a second) it has whipped down across the enemy toward
him; the water is thrown out in a ring and a spray (with the game's own slam burst and shake, the build's); it lies there a
moment, bounces once, and is pulled back under, tip last; the water closes. 36 frames at 30 a second, painted once each
(src/art/unique_play_art2.ts `paintArm`, `paintArmPool`, `armPose`), laid by `UniqueFx` (stands: behind the enemy as it rises,
over it once it has come down; the water with what lies on the floor).

To see it: `npx tsx tools/uniques_play_peek2.ts arm <out.png>` (every frame big), or in a built page
`LOOK=arm FILM=2.4 node tools/playtest.mjs --file dist/uniques_play.html --size 852x393 --dpr 3 --touch --scenario tools/scenarios/uniques_play_look.mjs --out shots/uniques_play/arm`
then `python3 tools/uniques_play_film.py shots/uniques_play/arm <dir> drowned_arm "<frame>:<line>" ...`.

Pictures sent him: `pictures/drowned_arm.png` (four moments, a line under each) and `pictures/drowned_arm.mp4` (2.4 s, the
Warrior striking a skeleton, at a phone's own size).

Checked: tests/unique_play2.test.ts (new, 3: the switch off; under, up, down across as the blow lands, under again, its root
where the water is, only its own colours, every pixel whole; the water from the warning to the end, dark) and
tests/unique_play.test.ts (6, its switches check now counting `arm`) pass, each run alone with tsx; tsc clean; the page built
and the look filmed: finished clean.

HIS WORD, 12 Nov 2026, by pop-up. Sent the film and the stills, asked whether it is good to hand to main, he asked: “How often
does the arm come up?” (told him: every 5 seconds, under the enemy he has hit in the last 3 seconds, up to 9 tiles off; if
none, the moment he lands a hit; 200% of his hit within 1.3 tiles, the water half a second before). Asked again: “It doesn’t
seem very good if that’s all it does every 5 seconds”. Asked how it should get stronger: “Every 3s, and it stuns
(Recommended)” (offered as: comes up more often, and whatever it slams is stunned for a moment); and of the look itself: “The
look is right (Recommended)”. SO: THE LOOK HAS HIS YES, handed to main behind `UNIQUE_PLAY.arm`; AND A RULES CHANGE FOR THE MAIN
CHAT (the uniques' numbers are its: game/uniques.ts UNIQUE_TUNE.arm.every 5 to 3, and a stun on what it slams in game.ts
stepArm, as the game stuns elsewhere; its card's line says so). The picture needs nothing new for either: it plays from each
`warn`, however often.

## The Queen's Talons (same branch, 12 Nov 2026)

At his word, 12 Nov, when the bird had been put back in the queue: “So work on the queen’s talons?  Why just throw it back in
the queue?”. Behind `UNIQUE_PLAY.talons`, off. HER BIRD IS ONE OF HER FLOCK: the ledge road's vulture (art/ledge_vultures.ts,
its moves with his yes), painted by its own painter (`paintMob`), turned hers and his (`talonsLook`): its dusty brown feathers
her black-violet (the boot's bag picture's raven, six tones by how light), its pale head, ruff and talons as they are, its eyes
the friend's cyan where they were the enemy's fire, and the friend's cyan edge round it (it is his, called by his boots). On the
rules' `dive` (game.ts callBird: `secs`, 0.35, from him to the nearest enemy) it comes down out of the air over him (`TALONS.high`,
20 game pixels) onto that enemy in its own head-first stoop (its dive's moments from 0.25 to its blow at 0.7, played over the
rules' seconds), its shadow under it, so that its talons strike as the rules' blow lands; a burst of her feathers off the one it
strikes; its strike held and its pull-out (to 1.2); then 0.55 seconds of its own flight, beating up and on the way it came,
fading (`talonsAt`). From in front or behind, and which way round, by the way it flies, as a monster is shown. Its pictures (its
dive's 29 moments and its flight's 18, both ways) are painted two a step while the boots are worn, so its first dive waits on
none of them (`UniqueFx.update`). Looked at in a built page at a phone's size (`LOOK=talons`: the Ranger, two dives, one each
way): `pictures/queens_talons.mp4` and `pictures/queens_talons.png` (four moments, a line under each), sent him.

Checked: tests/unique_play2_talons.test.ts (new, 3: its switch off; her colours, no brown and nothing of the enemy's fire left,
the friend's edge round it, every pixel whole or its edge; its way over him, onto the enemy as the blow lands, away, gone),
tests/unique_play2.test.ts (3) and tests/unique_play.test.ts (6, its switches now counting `talons`) pass, each alone with tsx;
tsc clean; the look filmed, finished clean.

HIS WORD, 12 Nov 2026, by pop-up, sent the film and the stills, asked whether it is good to hand to main: “Yes, hand it to main
(Recommended)”. Handed to main with the Drowned Arm (the queue item bring-in-drowned-arm-picture).

HIS WORD ON BOTH, 12 Nov 2026, 13:47 (Eastern), as the next was being made: “I’d like this and the tentacle to count as ally
damage.  So when we have co-op and support items or whatever it will scale these extra attackers”. Read as: the bird's blow and
the arm's slam are ALLY DAMAGE, a kind of their own, so that whatever later makes allies hit harder (co-op, support items)
makes these hit harder too. The game has no such kind yet (damageMonster takes no source): the main chat's to add, and to put
these two under it (game.ts callBird, stepArm). Nothing in the pictures changes for it.

## The Sticky Wrench (same branch, 12 Nov 2026)

Behind `UNIQUE_PLAY.wrench`, off. On the rules' `stuck` (game.ts: her vial landed, stuck to the enemy it came down on, going
where that goes, bursting `secs`, 0.7, on), HER VIAL STUCK (`paintStuckVial`, 21 frames over the fuse): her own vial (its glass
of her cyan brew, its brass cap: dev/contraption_fx.ts's colours) stuck head down at a slant in a lump of dark amber pitch at the
enemy's middle (on the floor if it came down on nothing), one drip stretching from the pitch; its brew blinking brighter and
brighter, the blinks closer and closer together (`STICKY.blinks`), a ring of light off it at each and its light on what is
round it (cyan, the friend's: it is hers); fizzing at its cap, more as its fuse runs out; then the game's own burst, twice as
wide. Looked at in a built page at a phone's size (`LOOK=wrench`: the Tinkerer, two tosses): `pictures/sticky_wrench.mp4` and
`pictures/sticky_wrench.png`. Checked: tests/unique_play2_wrench.test.ts (new, 2), and the three other in-play test files, each
alone with tsx; tsc clean; the look filmed, finished clean. HIS WORD, 12 Nov 2026, by pop-up, sent the film and the stills:
“Yes, hand it to main (Recommended)”.

# The next: branch `art/uniques-play3` (12 Nov 2026, afternoon)

Cut from `art/uniques-play2` at 3668d26a (the three above: bring that in first). Pulled from the queue (`draw-unique-items`) by a
chat of his working from the queue (his words: “Please work on the queued items”).

## The Rainwalker, the Shepherd's Crook, the Tide, the Fan: as the game shows them (his word)

Shown the Rainwalker as a storm cloud boiling up over her as she looses her Volley, raining round her with the arrows dropping out
of it, going with her, drifting apart (a film), he said: “I don’t think it needs the cloud, just have the arrows rain as they would
normally”. Read as: the Rainwalker gets no picture of its own: its Volley rains as every Volley does, and the game already makes it
follow her. The cloud was taken out; nothing of it is on this branch. Asked whether the same goes for the Shepherd's Crook (the
Orb follows her), the Tide (the Wave turns and comes back) and the Fan (three arrows a Shot), each already shown with the game's own
Orb, Wave and arrows: “Yes, leave them (Recommended)”. SO THOSE FOUR NEED NOTHING DRAWN.

## The Windcutter's blade of wind

Asked whether its blade (the build sends it as a shot of the Wave's kind, so it was drawn as the Mage's purple-cyan Wave of force
coming off the Warrior's sword) should get a look of its own: “Yes, a blade of wind (Recommended)” (offered as: a pale crescent of
rushing air off his swing, with streaks of wind, no water; the Wave is not water, the offer's words, not the game's).

Behind `UNIQUE_PLAY.wind`, off. Drawn by `UniqueFx.drawBlade` (render/unique_fx.ts), handed it by render/render.ts with the shots
(a shot with `blade`, as the Warlock's bolt is handed to warlock_fx), point by point in the world as the Wave is, so it lies right
whichever way it flies: a crescent of rushing air at the height of his swing (`BLADE.high`, 13 game pixels), bowed the way it
flies, tallest in its middle (`BLADE.tall`), drawn a little wider than what it strikes (`BLADE.wide`, as a swing's own streak is);
its front a ribbon of white air, a thin wake of the air's greys behind it broken into lines of wind that run back as it flies; his
cyan along its top (the bag picture's blade, `BLADE.edge`); wind streaming back off it in broken lines, high, middle and low; its
shadow on the floor; grit kicked up under it as it goes. It spreads off his sword in its first moments (`BLADE.spreads`) and frays
into wind over its last 1.6 tiles. Its colours are the game's own air (render/wild.ts `AIR`, the Volley's wind). On its `blade`
event a gust off his sword (hoops of air the way it goes, grit round his feet, a small kick of the screen) in place of the Wave's
blast and bolts: the `wave` the build tells with it is left out (`UniqueFx.owns`). Nothing of game/ is changed.

To see it: `LOOK=wind FILM=3.7 node tools/playtest.mjs --file dist/uniques_play.html --size 852x393 --dpr 3 --touch --scenario
tools/scenarios/uniques_play_look.mjs --out shots/uniques_play/wind` (three Strikes in a row, twice, one each way; `BARE=1`: the
blade alone, sent by the rules with no swing of his, three ways); `npx tsx tools/uniques_play_blade_peek.ts <out.png>` (the blade
big, by its own code, no browser, four ways at three moments). Pictures sent him: `pictures/windcutter.mp4` and
`pictures/windcutter.png`.

Checked: tests/unique_play3_wind.test.ts (new, 2: the switch off and the build's Wave its own; every way and moment only the air,
his cyan and its shadow, there at once, wider in flight, frayed at the end) and tests/unique_play.test.ts (6, its switches check
counting `wind`), each alone with tsx; tsc clean; the look filmed with the switch on and off (the same frames compared: the white
crescent stands where the Wave was), finished clean.

HIS WORD, 12 Nov 2026, by pop-up, sent the film and the stills: “Yes, hand it to main (Recommended)”.

## The Moth's Wing's dark word on his buttons

Asked whether its darkened word shows on the skill button (the build tells of it only as floating text, “Power dark”): “Grey the
word on its button (Recommended)” (offered as: that word's mark on the skill button goes grey and dim until it comes back).

Behind `UNIQUE_PLAY.moth`, off. In ui/hud.ts (`MOTH`, `mothNow`, set each frame from `Game.uq.dark`, as the Hush's `HUSHED` is
from `Game.hushT`): the word the rules have darkened (which attack, which side, which place) is written in a dim grey
(`MOTH.color`) where his attacks are written at the foot of the screen, or, where the plates are too tight for the word and it is
shown as its rune stone, the stone greyed (its own light kept, its colour out, half as bright: `greyed`, made once a stone); its pip
on the dodge's button grey; and the word coming back, whether its four seconds are up or a new hit has moved the dark to another,
written white for `MOTH.flashes` (0.3 seconds). The floating text the build shows stays. Nothing of game/ is changed.

To see it: `LOOK=moth FILM=6.6 node tools/playtest.mjs --file dist/uniques_play.html --size 852x393 --dpr 3 --touch --scenario
tools/scenarios/uniques_play_look.mjs --out shots/uniques_play/mothfilm` (the Warrior with words on all three moves, hit twice).
Pictures sent him: `pictures/mothswing.mp4` and `pictures/mothswing.png`.

Checked: tests/unique_play3_moth.test.ts (new, 2: its switch off and nothing dark with it off; on, the dark word dark, the one
moved from or come back flashing for its moment then plain) and tests/unique_play.test.ts (6, counting `moth`), each alone with tsx;
tsc clean; the look filmed, finished clean.

HIS WORD, 12 Nov 2026, by pop-up, sent the film and the stills: “Yes, hand it to main (Recommended)”.

## The moments the build only tells of: his picks

Asked which want a picture of their own: the Pivot (Whirlwind's own cut), the Receipt (a punch), the Warden's Keys (the door
opening), the Hair Trigger (the trap going off), the Tuning Staff (the Orb's pulse), the Short Way (the Warp's burst at both ends)
and Bloodprice (Power's embers circling him) already show through the game's own effects: “Yes, leave them (Recommended)”. Of those
showing nothing, or popping, he picked THE TOW LINE and THE CRIER'S HUSH (not the Unsigned Pact, not the Winning Streak), and wrote:
“The golem has a rocket jump as well so it can be like a free cooldown reset and he uses him jump to the same spot as the hero.
Also can you make him almost intangible?  He has a lot of collision issues and is never really where you want him to be”. Of the
last two, the unique drop (not the King's Knot), and: “Base uniques are uniques just like boss drops, I don’t know why you want to
distinguish between the two.  Whatever we do any unique drop it should apply to all drops”. Read as (told him): the Tow Line, the
Golem's own rocket jump to where she lands, free; the Golem almost intangible, everywhere; the Crier's Hush, a look for the enemies
near him losing their words; every unique that drops, pool or boss, a beam of orange light where it lands. The King's Knot, the
Unsigned Pact and the Winning Streak stay as they are.

## The Tow Line: the Golem rides her jump on its own rocket jump (RULES, game/game.ts)

`towRide` (new): as she blasts off (the blast jump's start), each Golem of hers fires its own rocket jump with her (from the frame
before its blast, `ROCKET.blast - 1`: no crouch, it goes up with her bomb) to its own side of where she comes down, as it keeps by
her (golemSpot's sides), and lands as its own jump lands, its fist slam (stepRocket's `golemPounds` with `landing`: the crater and
dust its landing's own, no `golemPound` event). FREE: its jump's wait is not looked at, and as it lands it is set back to none
(`Golem.towed`, state.ts; cleared as it lands, or if it is whistled back). One within a tile of its spot, charging its shot or in the
air already, does not ride: it pounds where it stands as she lands (blastLands, its pound as before). The old blink to her side as
she landed is gone. It lands about a quarter of a second after her (its flight 21 frames, hers 18). The pound's strength is now its
own jump's (golemFrac) where it was her blast's countDmg times UNIQUE_TUNE.tow.share: the main chat's numbers to keep or change.

## The Golem almost intangible (RULES, game/game.ts GOLEM_R, NOT BEHIND A SWITCH)

His words above. The Golem's walk meets only walls (no monster and not she stand in its way: the bodies kept apart in
updateMonsters are monsters and her); what caught it was its own width, `GOLEM_R` 0.45, nine tenths of a tile, in doors one tile
wide, round pillars and corners. Now 0.3, as hers (TUNE.heroRadius): it goes wherever she can. ITS LOOK IS UNCHANGED; it goes live
with the next update once merged.

To see the ride: `LOOK=tow FILM=4.6 node tools/playtest.mjs --file dist/uniques_play.html --size 852x393 --dpr 3 --touch --scenario
tools/scenarios/uniques_play_look.mjs --out shots/uniques_play/towfilm` (her Golem whistled out by two enemies, then her Blast Jump
there and back; `rides: 2` printed). Pictures sent him: `pictures/towline.mp4` and `pictures/towline.png`.

Checked: tests/uniques_heroes.test.ts (21; its Tow Line test now: one ride, it lands by her, by its rocket jump and not a pound
where it stood, its jump ready again, the dummy hurt); tests/tinkerer, golem_rocket, golem_combo, golem_moves, golem_gun,
golem_charge, tinkerer_talents, tinkerer_moves, action_f6 all pass, each alone with tsx; tsc clean; the look filmed, finished clean.
NOT CHECKED: his phone (the slimmer Golem is a feel); tools/unit.mjs.

HIS WORD, 12 Nov 2026, by pop-up, sent the film and the stills, asked whether to hand it to main with the Golem's slimmer body: “Yes,
hand it to main (Recommended)”.

## The Crier's Hush: the hushed enemies

Behind `UNIQUE_PLAY.hush`, off. Its rules (game.ts hushNear) keep an enemy's words in `Monster.dark` while it is within reach, and
tell of each as `dark` and `light`. While it is hushed its elite ring and its name are drawn in the Hush's dead grey (art/crier.ts
`HUSH`, the Crier's own, the grey his Hush writes the hero's words in), where the build fell back to a plain pink ring
(render/render.ts: the ring in drawWorld, `nameColor`); wisps of the Hush drift up off it a few a second (UniqueFx.update). On its
`dark`, a ring of the Hush's grey closes in on it (the effects' `closing` ring) and its dead air is puffed up off it; on its
`light`, a ring and a spray of its word's own colour, with white. (PACK_MARKS, off, draws no mark for a hushed one: its words are
kept off it; with the marks on, that is the main chat's to weigh.)

To see it: `LOOK=hush FILM=4.4 node tools/playtest.mjs --file dist/uniques_play.html --size 852x393 --dpr 3 --touch --scenario
tools/scenarios/uniques_play_look.mjs --out shots/uniques_play/hushfilm` (the Warrior walks up to three elites with words and away).
Pictures sent him: `pictures/criershush.mp4` and `pictures/criershush.png`.

Checked: tests/unique_play3_hush.test.ts (new, 2: its switch off and nothing with it off; on, the closing ring and the puff in the
Hush's grey, the return in the word's own colour) and tests/unique_play.test.ts (6, counting `hush`), each alone with tsx; tsc
clean; the look filmed, finished clean.

HIS WORD, 12 Nov 2026, by pop-up, sent the film and the stills: “Yes, hand it to main (Recommended)”.

## For the main chat

Bring in `art/uniques-play2` first (the queue's bring-in-drowned-arm-picture), then this branch: `wind`, `moth` and `hush` go on with the
uniques (`UNIQUES`), with the others; test 1 of tests/unique_play.test.ts asserts every switch off: change it then.

## Not drawn yet

Which of the moments the build only tells of want a picture of their own (to ask him): Bloodprice ('fury'), The Winning Streak
('streak'), The Tow Line ('ride'), The Unsigned Pact ('feeds'), The Pivot ('turn'), The Receipt ('answer'), The King's Knot
('borrow'), The Crier's Hush ('dark', 'light'), The Warden's Keys ('open'), The Hair Trigger ('shot'), The Tuning Staff ('pulse'),
The Short Way ('back'), and 'drop' when a boss's own falls.

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
queue item for the main chat, his words in it; which of a unique's lines count as mods is that chat's to ask him.

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
   `UniqueFx.handle` is where each hangs; a switch each in `UNIQUE_PLAY`.
3. **The Warlock's own book**: the red book chained at his hip is still on him while the Tome flies (it is a few pixels at
   the game's size). Taking it off him is a change to his baked pictures.
4. **The risen elite's pictures are its kind's standing, walking and attack frames**: a kind that moves by a gait or an act of
   its own (the first five floors' own, Act 1's fliers) is shown by its plain frames, not those.

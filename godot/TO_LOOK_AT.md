# Things to look at

Odd things found while porting Wordsmith to Godot, set aside for you to look at when you have time. Nothing here has been
changed in your game; most are about the game itself (the TypeScript one on `main`), a few about the Godot version. Newest
at the bottom.

## In the game

1. **The skeleton champion never rallies on floor 1.** His rallying cry is only heard by pack-mates that carry his words,
   and on floor 1 no monster carries words (no words drop there either). So on floor 1 his second move can never happen.
   (game.ts `hearsCry`, `bareDungeon`.)

2. **The red trolls can't charge in their lairs on floor 1** (at least on the floor I exported). His charge needs a clear
   run that carries him past you, and both lairs are too small for one: in my tests he only ever swung and slammed in them.
   He charged as soon as I put him in a big hall. (game.ts `chargeLane`.)

3. **The Lunge (the Warrior's swipe) opens at level 5, but a new Warrior is about level 3 when floor 1 is cleared.** All of
   floor 1's monsters together are worth about 730 experience, and level 3 takes 702. So all of floor 1, and the Warden,
   are played without the swipe. Whirl opens at level 2. (defs.ts `MOVE_OPENS [1, 2, 5]`, `xpToNext`.)

4. **A piece bought from a vendor may come back on the shelf.** The vendors' shelves are rolled again every time you come
   into town, from the same starting point until a boss is beaten, so I think the same pieces come back, the one you
   bought among them. Not checked in the game itself. (game.ts `rollShop`, run by `enterTown`.)

5. **The design notes describe the older first floor.** DESIGN_NOTES sections 3 and 4 (words dropping on floor 1, word
   slots at levels 5 and 10) are from before THE FIRST LEVELS: now no word falls on floor 1, the first word comes from the
   wordsmith in town, and the slots open at levels 1 and 4. The code is right; the notes are behind.

6. **The Warrior's starting Whirl is a slam, not a spin.** You picked the spin for the Godot version ("Give him the
   Whirlwind spin"). In the game, right-click at the start is one overhead slam all round him; the spinning Whirlwind is the
   greatsword's talent. If you expected the spin in the game too, that's the reason.

## In the Godot version

7. **My first floor 1 and town were the old looks.** The export tools didn't put on the switches the game puts on as it
   starts (the first five floors' new looks), so floor 1 came out as the plain crypt and the town as the old vault square
   instead of THE KING'S TOMB and THE CASTLE'S HALL. Fixed: every export tool now puts them on (tools/godot_switches.ts),
   and both places are drawn from the game's own renderer (tools/godot_looks.ts).

## In the game, found while bringing over the new looks

8. **Blue-grey patches on the tomb's walls (floor 1).** The floor's "moments" (dust and a falling stone; rats bolting)
   are painted in the old Crypt's blue-grey, not in the tomb's colours, so where they are set in a wall they show as a
   blue square on the green-grey tomb stone (in the Godot version too, since it draws what the game draws). They come
   from `wardenMoments()` without the tomb's grading (render/pieces.ts). The tomb's rubble is bluish for the same reason
   (`cryptProps(1)`), and the walls cut corner to corner are the Crypt's plain blocks, only graded.

9. **The castle hall's gate isn't the one in the mock-up.** The game draws the town gate barred (pink-sealed bars over
   the portcullis) on a new game, and its own shaft cage, where docs/mockups/town_look/pictures/castle_hall.png shows a
   plain portcullis. Probably just the mock-up being from before the bars; worth a glance.

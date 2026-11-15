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

## In the game, found while bringing over floors 3, 4 and 5 (the cloud chat, 15 Nov 2026)

To bring a fight over, its rules are read line by line and run beside the game's own numbers, so small slips show up.
None of these stops a fight. The first six are ones a player would see; the rest are smaller, kept for the main chat.
Where it says "copied", the Godot version does the same thing on purpose, so that the two play alike.

10. **The Stoker's coals are all but never seen in the air.** The game hands their flight the height of his shovel in the
    wrong measure (168.93 of his own lengths where it wants tiles), so each coal starts thousands of pixels up and shows
    only for the last thirtieth of a second before it lands. In the Godot version they fly from his shovel, as the art's
    notes mean them to. (render/act1_fx/stoker.ts `fromOf`, tools/stoker_pics.ts; one number in `stoker.gd`, COAL_FROM,
    puts it back.)

11. **The Chained One hops sideways as his lash ends.** He is moved 1.22 tiles the way he truly faces, but his pictures
    step along the picture's diagonal; the crack is not under his drawn fists either. Copied.

12. **The Amalgamation's bone rain is laid out round it, not round its hall.** Only 16 to 24 of its 54 skulls fall
    inside the hall, and many fly in from outside it or from mid-air. Copied.

13. **The Fleshmancer goes under the floor far less often than his notes say.** His 12 second clock runs only between his
    moves, so left alone he goes about once in 50 seconds; and a teleport that comes due while he glides is lost. Copied.

14. **The Keybearer of the Knife's leap often goes nowhere.** His leap, and the last step of his stab, stop dead at the
    first tile that is not open floor, and his room is a treasure room with two chests and four more blocked tiles. In one
    run three leaps meant to carry him 2.9 tiles each went nowhere and he came down where he stood. Copied.

15. **Some voices are never heard.** The Stoker's three (`stoker_roar`, `_hurt`, `_death`) wait on his being a boss, and
    he is an elite. The Fleshmancer's fire lost its roar: the sound is asked for by the move's old name (`fire`), and the
    move is now `fm:fire`.

Smaller things, by fight:

- **The Stoker.** His rake's blow stays live at the end of its arc until its fire is over: a hero not yet struck who
  walks into the last 16 degrees of it, up to 3.8 s after the blade stopped, takes the full blow (copied). Two of his
  coals can strike one hero (spots 3 and 7 are 1.28 tiles apart, 5 and 7 are 1.21, each reaching 0.75; copied). His gear
  can be picked up from 2.85 s into his death, but his death's pictures go on showing one until they fade at 6.2 s. His
  ring strikes at its front and its flames are painted 0.4 tiles behind it. Closer than 2.2 tiles he has no plain blow:
  between rakes he only stands.
- **The Chained One.** His walk no longer stops on its first frame (`GAITS.chained.cycle` is 1.0; his new walk is 8
  frames, 1.2 s). Two reaches did not grow with his new body: he begins the lash only within 3.2 tiles though it reaches
  4.1, and the whirl only within 2.9 though its chains reach 3.53. If he dies in the 0.6 s between the lane's marking and
  the finisher, the crack still opens with no blow (in the Godot version the lane goes with him). The drag does not go
  round things: a hooked hero behind a pillar stays snagged until a straight step is free (copied). Freed of his chains
  he walks at 2.42 but still whirls after the hero at 1.7. His line of aim is drawn from his new hand; the hook the rules
  catch by flies from the old one, up to 0.14 of a tile apart. Notes behind the code: `CO_ACTION` says "(off)" and is on;
  the art says both "two hauls" and "three" (there are two).
- **The Ossuary Amalgamation.** A rain in flight outlives it: for about 2.5 s after it dies skulls still land, still hurt
  and still make mites. Near a wall the floor arms find only 6 or 7 holes of their 8. With no room behind its flank a
  beast is put at the blocked spot anyway; with four beasts alive a burst that is due is skipped for good. The art's
  `ARMS.warn` (0.6) is not used: the crack glows 0.5 s. Notes behind the code: `bosses.ts` says `AM_ACTION` is "(off)"
  beside `{ on: true }`; three art files say "NOTHING OF THE GAME IMPORTS THIS FILE" and the game does; `bosses.ts`
  points to `game/am_mites.ts`, which does not exist; a note about devour sits over a line about the Chained One's ball.
- **The Fleshmancer** (read before his redo, `design/fleshmancer-redo`, which mends the first). What he had begun went
  on after he was dead: a fire just begun burned its full 7.6 s. The thud of his going under is still at 0.24 s, the old
  pictures' moment; the new ones pull him down at 0.60 to 0.67 s. For one frame between going under and coming up he has
  no move: he is drawn standing where he will rise and can be struck (in the Godot version he stays unseen and out of
  reach). His dead join the fight 1.4 s after they are called, not his own 1.3 s (the number is passed and not read).
  His new shards, rings and fire take no heed of walls (the old shards burst on one); a mini's fire burns round a
  corner. His bone heaps burst 0.05 s apart; the dead come out of them 0.14 s apart. The stream can pass a hero
  unharmed: it burns only if 0.22 s have gone by since his last burn, so a lane's tick just before shields him.
  In his pictures (copied as they are): his fire does not start exactly at his drawn skull unless he faces along the
  floor's lines (the mouth is turned with his true facing while he is drawn in one of four views: up to about 25 picture
  pixels off when he faces a diagonal; render/act1_fx/fm.ts). Each shard's grain is picked by its place in the list of
  BOTH fans, so when the first fan's bursts end the second fan's shards change their grain at once. A flying shard's
  streak of fire is almost wholly painted over by the shard itself.
- **The keybearers.** A key is meant to fall "to his left as he is drawn", but only does if he dies in the middle of a
  move; otherwise it goes to the left of the way he faced. The Flame's ring strikes from the middle out in its first
  step, and still strikes while it stands dying at 5 tiles. Both keys are named `keyblade:key`, so the Flame's key runs
  by the Knife's rules (harmless).

## In the game, found while bringing over the words (the cloud chat, 15 Nov 2026)

What the Warrior's words do in a fight was read out of `game.ts` function by function and each case held against the
game's own formula. These came up on the way. All are copied as they are.

16. **Ice on the ground cuts a Frost hit's chill short.** Standing on iced ground SETS a monster's chill to 0.7 s
    (`m.chillT = 0.7`): one chilled 2.5 s by a Frost hit loses most of it at the ice's next bite. (game.ts `updateZones`.)

17. **Heavy in front of the Whirlwind stuns for good.** Each turn stuns for 0.8 s and a turn comes every 0.3 s: what he
    spins among never acts. (Heavy is the Warrior's reward from the armourer, so this is the first thing he can do with it.)

18. **A hit sets fire or chill before the hit is refused.** A boss still waiting ("Not yet"), or the Fleshmancer gone
    under the floor, takes the burning or the chill without the hit; and a waiting boss's burning and chill do not run
    down. (game.ts `hitMonster` sets them before `damageMonster` refuses.)

Smaller:

- The Boneward's shield turns a hit from before it, but not an arc of lightning, the ground's bites, burning or poison.
- In an area, which three of those struck call lightning down is by the order the floor made its monsters, not by
  nearness (a blast's fourth and later hits are "quiet").
- A cloud's poison is not raised by gear's Poison Damage and never adds doses.
- With Power behind, Strike's splash is rolled with the might the blow has just earned; the blow itself was not.
- Burning bites on one clock for every monster, so a 3 second burn bites 5 or 6 times by when it began.

## In the game, found while bringing over floors 6 to 10 (the cloud chat, 15 Nov 2026)

The Wilds' monsters and bosses were read line by line as the earlier floors' were. None of these stops a fight; the Godot
version does the same on purpose, so that the two play alike.

19. **The Carrion Queen's rake and gust marks are cut off early.** Her moves' marks are drawn only while their clock is under
    the dive's blow and a twentieth (1.68 s), for every move: the rake's burning gouges and the gust's blast stop short.
    It looks as if the dive's cut-off was put on all three. (render/act1_fx/queen.ts.)

20. **Her dive's warning hatching and her shadow under it almost never show.** They are drawn only where sums of fractions
    land exactly on whole numbers. (art/carrion_queen_action_fx.ts paintDiveMarks.)

21. **Her Eclipse goes on after she dies.** Killed during one, its dark and its dives carry on.

22. **A standing Hollow Stag hardly ever charges a hero who stands still.** The check had to set the hero down 6 tiles off to
    get one. His charge needs only 3.4 tiles of clear run though it runs 7.9 (the rest is cut short at the wall).

23. **The wolves the Stag calls give no experience but still drop loot.**

24. **The firepot thrower's pot is always Flame and the chanter's lightning always Lightning**, whatever element word the
    monster itself carries (its other words still count).

25. **The twisted deer's charge is marked 7.6 tiles long, but the deer runs 6.96 at most.**

Smaller:

- **The Unfinished.** In its rockslide, a hero standing within 2.6 tiles across the lanes never gets the lane through him
  (no lane may pass through the Unfinished).
- **The Carrion Queen.** "Never nearer the drop" measures to the nearest ground that is not open, and the Ledge Road's pits
  count as open: it measures to the rock beyond the band of pits, not to the drop's edge.
- **The Cantor.** His shout's wave coming back can strike in its first twentieth of a second without throwing the hero.
- **The Hollow Stag.** The wood closing in strikes a hero caught by its wall even in the middle of a Lunge; his gore and
  charge do not.
- **The twisted deer.** Its hedge holds back only the hero, not monsters.
- **The wolves.** With the pack strike on, the wolf's old circling numbers (WOLF.circle) are no longer used.
- **The bog leech.** A stunned or frozen leech lets go only once he is 1.2 tiles off ("knocked off").
- **The dust devil.** Its bolts land at fixed angles on the floor, not turned toward the hero, though a note in the art says
  they turn toward him.
- **The firepot thrower.** With the big lob on, its pot's landing height still uses the old pot's 1.5.
- **The canyon scorpion.** Its old tail-strike warning painter is no longer used with the spit on.
- **Floor 10.** Its map has two Drowned on one tile (115.5, 58.5), though the game checks a place is not taken by another.
- **The descent.** He is always set down facing the same way (1, 0) as he comes into a floor, though floor 10's start points
  the other way. Walking onto a way on's tiles before it opens does nothing (they are open floor, never solid). Once the
  Meldstone is given, the gate is "barred and waiting to unbar", so "The gate is barred." is never said again.

## In the game, found while bringing over the words of floors 6 to 10 (15 Nov 2026)

Twin, Leech, Volatile, Precise, Frenzied, Guarding, Lasting, Fleeting and Vast were read out of `game.ts` as the first seven
were, and held against the game's own formula. These came up. All are copied as they are.

26. **Twin does nothing on most of the Wilds' monsters.** Only the old kind of monster reads Twin (its one blow, or a move's
    swing, shot, rain or slam: game.ts monsterAttack, landMove). The descent's own kinds and the bosses fight by acts
    (game/bosses.ts, act1_rules) and none of those reads it: the Twin fog wolves of floor 9, and THE TWIN VOLATILE HOLLOW STAG,
    carry it in their names and do nothing with it.

27. **Vast on a monster mostly only widens its red circles.** Its reach is wider only for a monster with no moves at all
    (monsterAttack); a move's swing reaches as far as ever (landMove uses reachOf, without Vast). What it widens everywhere is a
    warned blow (addWarn), and a mark too: a Vast quarry golem's hammer ring is drawn 30% wider than where its fists strike,
    whose reach is its own (act1_rules/qgolem.ts HAMMER.r).

28. **Fleeting's stronger boosts are not on the move's card.** Fleeting makes might, haste and Guarding's shield a third
    stronger (resolveSkill's last lines), but the lines of "of Power", "of Swiftness" and "Guarding" are written before, with
    the smaller number.

Smaller:

- "of Echoes" on the Whirlwind: the phantom's three turns come at the Whirlwind's own pace even with Fleeting, which makes the
  real turns come faster (endChannel uses the move's tick, not the word's pace).
- Leech in front heals for every enemy each turn of a Whirlwind strikes, the fourth and later too, with no cap (LEECH.cap is
  none as the game starts).
- Volatile in front makes a boss explode for 12% or more of his whole life when he dies (explodeKill reads maxLife).
- A ward (Guarding behind) counts him inside by his middle alone; the ground's bites count half a monster's body.

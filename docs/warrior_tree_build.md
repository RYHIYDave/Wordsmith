# The Warrior's weapon tree, brought to the game (branch `build/warrior-tree`)

The queue's `build-warrior-weapon-tree`, pulled 12 Nov 2026 by the main chat of 12 Nov (session ...STLst) at his words of that
morning: 07:32, “I really just need the queue cleared and we can look at publishing and getting this thing on the App Store”;
his picks “Everything in the queue first”, “Ready ones first (Recommended)”. WARRIOR_TREE2 STAYS OFF ON THIS BRANCH until he
has seen it in play and said yes; nothing he sees changes while it is off.

## What there is to bring together

- `wtree` (a727b37f, from 25.2.9; the main chat of 8 Nov): THE TREE, THE RULES, THE DROPS, behind `WARRIOR_TREE2` (game/talents.ts):
  his moves by his weapon (`WARRIOR_KITS`: the greatsword Strike, Whirl, Lunge; the battle axe Cleave, Axe Throw, Leaping Chop;
  the warhammer Smash, Earthquake, Shoulder Charge; Whirl becomes Whirlwind at its talent), the new moves in defs.ts, the new
  talents (`WARRIOR_TUNE`), his weapons found, bought or won made his pick's (items.ts `asWarriorWeapon`, game.ts `forHim`);
  tests/warrior_tree.test.ts (was wtree's tests/warrior_weapons.test.ts). Filmed for him with the greatsword's pictures standing
  in; his answer, 8 Nov by 09:40: “Wait for the axe & hammer art (Recommended)”.
- THE ART, in main since 25.3.6, unseen (art/warrior-weapons a87e5440; docs/mockups/warrior_weapons/README.md, read it): the war
  axe (take B) and the maul (take A), every list from his eight sides (`makeWarriorHeavyArt(weapon, place)`), the thrown axe
  (`axeFlying`), its glint (`axeGlint`), the quaking ground in each floor's own stone (art/warrior_up_quake_ground.ts). His yes,
  11 Nov by 10:51: “Yes, hand both to main (Recommended)”. HIS RULES FOR THE MAIN CHAT, in his words (the README's foot): “Yes he
  can move.  Yes leaping chop can”; “I want to make sure you can still do the tap attack while the axe hold is still flying”; “I
  understand that the axe is going to kind of materialize to keep fighting but I do need that to work that way”; “Tap should
  have a small knockback and high stun buildup/chance”.

## HIS YES, 12 Nov 2026

Sent warrior_weapons.mp4 (his three weapons in play, the art chat's axe and maul) and asked “In warrior_weapons.mp4, the Warrior
uses the art chat's axe and maul from your approved art. Smash knocks enemies back, and two quick Smashes stun. The Earthquake does
a full spin, then the ground quakes in the floor's own stone. Does it look right to put live?”, he answered by 09:07: “Yes, put it
live (Recommended)” (offered as: I finish the last pieces (the leap crouches, getting his pictures ready so they load fast on your
phone), test, and it goes out). So WARRIOR_TREE2 IS ON (2c80300c); the crouches are in (3d below).

## The steps, and where each stands

1. DONE, 13d80f58: wtree merged onto main 25.3.9 (c020f266). Five conflicts, every side kept (the commit says how). tsc clean.
   unit --only warrior_tree, warrior_weapons, talents2, practice_talents, new_weapons, weapons, items, warrior_thrust, talents,
   talents_rules, uniques_game, uniques_drops and the core on 13d80f58db: 32 files, all passed.
2. DONE (with tests/warrior_tree_art.test.ts, 3 pass): his pictures by his weapon. art/heroes.ts HeroLook.weapon ('axe' |
   'hammer') and four places of his, HEAVY_PLACES (axe, axeTown, hammer, hammerTown; lookOfPlace); art/heroes3.ts `of()` gives
   `makeWarriorHeavyArt(weapon, place)` for them (his card the great sword's, as ever); game/talents.ts `heavyDrawn` says which;
   render.ts asks with it, and asks the painter for his weapon's places; painter.ts their order; render/baked.ts a group for him
   with each weapon (`warrior-axe`, `warrior-hammer`) while the tree is on, taken in only where his weapon is that one.
   tests/warrior_weapons.test.ts 1 now lets the art reach the game by art/heroes.ts and art/heroes3.ts only (GAME_USERS).
3a. DONE (tests/warrior_tree_rules.test.ts, 5 pass; tests/warrior_tree.test.ts 2 told the quake is before him): the numbers.
   defs.ts: Cleave 0.333 s, 1.7 tiles, 75 degrees either side (`arcCos`); the thrown axe 0.367 s, 6 tiles; Leaping Chop's blow
   1.5 before where he lands (`ahead`), 1.6 round; Smash 0.433 s on a spot 1.4 before him, 0.4 round (`spot`); Earthquake
   0.633 s, round a spot 1.4 before him (`ahead`), 2.0 round; Shoulder Charge 6 tiles, 0.7 either side. talents.ts WARRIOR_TUNE:
   Twin Axes 14 degrees; Tremors three, 0.35 s apart, each 0.6 wider, at 1, 0.6, 0.35; SMASH'S KNOCK AND DAZE (his words of 11
   Nov, 09:41, “Tap should have a small knockback and high stun buildup/chance”): pushed 0.4 tiles back, dazed 0.6 a blow, the
   daze fading 0.15 a second, a full daze a 1 s stun (two blows in quick turn stun; game.ts `smashed`; bosses are not stunned,
   as ever). Wide Swing sweeps the Smash round as a Cleave, each struck smashed. NOT YET: the leaps' crouches (0.167, 0.2 s),
   the Charge's 0.5 s and skid, its throw aside, Twin Axes' second 0.1 s after.
3b. DONE (tests/warrior_tree_rules.test.ts 6 to 8, pass): THE THROWN AXE AND HIS HANDS. game/state.ts Hero.handsEmpty, appear,
   caughtAt; the 'axeCatch' and 'axeGlint' events. Thrown, his hands are empty (a throw broken off leaves it in them); a tap while
   they are empty: an axe appears and he Cleaves (`appear`); back to empty hands, caught (Twin Axes' two in the one catch);
   back to hands that hold one, gone into it (the glint). render/figure.ts `axeFrame`: braced (`clips.hold`) or running
   (`clips.moves.runEmpty`) while it flies, the catch (`clips.release`, on the run `clips.moves.runCatch`), the tap's first
   pictures the axe appearing (`clips.moves.cleaveAppear`); render.ts passes it, and draws the thrown axe from the art's
   pictures (`axeFlying`, a turn in AXE_FLIGHT.turn). NOT YET: the glint drawn (fx.ts, `axeGlint()` over him a fifth of a
   second), the quaking ground (art/warrior_up_quake_ground.ts `quakeGround`, the floor's stone) in place of the slam ring, the
   leaps' crouches (`chopCrouch`, `chargeCrouch`), the hammer's `land` skid after the Charge.
3c. DONE: THE EFFECTS (render/warrior_fx.ts, wired into render/fx.ts): the glint over him as a thrown axe goes into the one he
   holds; THE EARTHQUAKE'S GROUND heaving in the floor's own stone (art/ground.ts GroundArt.theme; main.ts tells the effects the
   ground shown) in place of the slam ring, Tremors' second and third their own (the game's 'quake' event); Smash cracks the
   floor where it lands ('land'). Played on a page built from the branch (tools/scenarios/warrior_weapons_film.mjs, the tree on
   for that page), all three weapons, a phone's screen: clean; the axe and the maul in his hands, the thrown axe from the art's
   pictures, the ground heaving. THE FILM FOR HIM: tools/warrior_weapons_film.py, 15 s, 960 by 556 (the scratchpad's
   warrior_weapons.mp4, sent 12 Nov).
3d. DONE (tests/warrior_tree_rules.test.ts 9): Leaping Chop and Shoulder Charge crouch before he leaves the floor (defs.ts
   `crouch`: 5/30 s, 0.2 s; the move's `crouch`, he stays put meanwhile; render.ts `crouchT`, figure.ts the art's chopCrouch,
   chargeCrouch); the Charge carries him in half a second (`secs`). LEFT AS IT IS: the Charge's throw aside (Bulldozer carries
   instead, as the tree has it), Twin Axes' second 0.1 s after the first (both thrown together).
3. The rules to the art's timings and his rules (the README's “What the main chat needs”, for both weapons): Cleave, the thrown
   axe (out at 0.367 s, AXE_FLIGHT, back, the catch; Twin Axes 14 degrees, the second 0.1 s after), Leaping Chop (0.167 s
   crouched; the blow 1.5 tiles before his feet, 1.6 round), Smash (0.433 s; 0.4 round a point 1.4 before him), Earthquake
   (0.633 s; a ring 2.0 round a point 1.4 before him, out in 0.35 s; Tremors three, 2.0, 2.6, 3.2, at 1, 0.6, 0.35),
   Shoulder Charge (0.2 s crouched; up to 6 tiles in 0.5 s and 0.6 more in a 0.2 s skid; 0.7 either side struck, thrown 1.6);
   he may move while the axe flies (runEmpty, runCatch); the tap while it flies (the axe appears: cleaveAppear); the tap's small
   knockback and high stun.
4. The world's pictures: the axe in the air and its glint; the quaking ground for the floor he is on.
5. The bake (tools/bake_heroes.mjs): his three weapons' groups, only his pick's taken in (the art's count: the war axe 3,996
   pictures, the maul 2,818; the greatsword 2,264 in a dungeon).
6. Checked: tsc; unit --only what this touches and the core; a film of the three weapons in play for him; his yes; then on.

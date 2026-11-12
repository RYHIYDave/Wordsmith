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

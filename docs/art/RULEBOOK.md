# Wordsmith Art Rulebook

Oct 8, 2026

> **APPROVED BY THE OWNER, 8 Oct 2026, 08:23: "Okay this all sounds good".** Every chat that makes art for Wordsmith follows it; it changes only with his yes. Written by the art chat from his answers (`docs/art/interview.md` has every question and answer in his exact words). The living copy is his doc "Wordsmith Art Rulebook" (https://claude.ai/artifact/Dq343Th9FFbpt9EiKfNyYe); this file is a copy of it for the other chats, refreshed when the doc changes. Nothing here changes the game by itself: what it asks for goes in through the main chat, pictures first.
>
> **CHANGED BY THE OWNER, 8 Oct 2026: effects and animations are BIG AND WILD.** His words, by 20:14: "i think we need to amend the rules for effects and animations change it to big and wild.  why dont you redo the WAVE animation as big and wild as you think is appropriate and ill tell you if it needs to go more or less wild". He saw the Wave made so (`wild_wave.gif`, the art chat) and said by 20:48: "Just right (Recommended)". So Effects and magic, and Movement, now say big and wild, with that Wave as the measure. Then Strike and Shot were made so, each hero in his own way, and by 22:35 he said of both: "Yes, keep it (Recommended)". The doc is at rev 39 with it. In the code: `WILD` in `src/art/moves3.ts` and `src/render/wild.ts` (a switch that is off, on `art/mage-stances`).
>
> **CHANGED BY THE OWNER, 9 Oct 2026: EVERY BOSS THROUGH EVERY CHECK, AS THE HEROES WERE.** His words to the art chat, at 23:35: "I need all bosses ran through all checks from now on.  These boss fights are important"; at 23:44: "Add it to the rulebook.  All checks must be made."; at 23:56: "And every boss gets the same treatment as characters". So How art is made and approved has a new rule 7: every boss gets the whole review the heroes had on 8 Oct (`docs/requests/hero_moves_review.md`), and the doc is at rev 41 with it. In the code: `src/art/boss_checks.ts` and `tests/bosses.test.ts` (on `mockup/bosses`).
>
> **CHANGED BY THE OWNER, 10 Oct 2026: EACH FLOOR THEMED AFTER ITS BOSS, AND THE TOWN'S GATE NO LONGER CYAN.** Asked whether the Crypt's four floors were good to build as shown, he answered by 07:29: "Yes.  I’d also like each floor to be themed after the boss.  Add this to the ruleset.  We need somewhere between 40-50 unique assets on each floor for each boss.  That can include wall tiles, floor tiles, breakables, stuff on the walls, on the floor, obstacles, the looks of doors and gates, traps, and quests." So Places has a new rule 7. Asked whether the stairwell, the waypoint and the town's gate were good to build as shown (offered as: the main chat builds them in, and his rulebook's line on the gate's cyan changes with it), he answered by 07:29: "Yes, as shown (Recommended)". So Colour 3 names the waypoints as friendly magic, and no longer the gate. The doc is at rev 43 with both. The pictures: the Crypt Review page (https://claude.ai/artifact/K2KBZoF2RnnYZWVZMfNqAa); the code: `mockup/crypt`.
>
> **CHANGED BY THE OWNER HIMSELF, 10 Oct 2026, by 07:41:** in his doc (rev 78) he renamed "Effects and magic" to "Animations", and its rule 2 now reads "Each hero or boss is wild in his own way."
>
> **CHANGED BY THE OWNER, 10 Oct 2026: AS FAR AS IT WILL GO.** His words to the art chat by 07:47: "Put in the ruleset that I want animations as big and wild and kinetic and weighty as possible.  I’d rather it be a notch too high than a notch too low." So Animations has a new rule 1, and the doc is at rev 79 with it.

Wordsmith looks cool and fun: crisp pixel art, a dark world where every place has colours of its own, bold and stylish heroes, monsters true to what they are, and everything moving with weight. You said yes to it on 8 Oct, so every chat that makes art for the game follows it, and it changes only with your yes.

## Pillars

Five rules sit above all the others. When two rules clash, these win.

1. **Cool and fun.** Confident and a bit dangerous, but lively. Never gloomy for the sake of it.
2. **Bold figures, rich places.** Heroes and monsters are clean, bold shapes that pop. The places carry the detail.
3. **Everything has weight.** It is the test for every animation. In your words: "I want things to have weight. That's very important".
4. **Friend cyan, enemy pink.** What glows on a friend is cyan. What glows on an enemy is hot pink burning to gold. Nothing else glows in those colours.
5. **Wordsmithing glows.** The words are the heart of the game, and anything with a word in it shows it.

**Never:** cute or kiddy (big eyes, round toy shapes, candy colours); plastic 3D (a smooth, shiny computer-render look); a copy of anyone else's design.

**The two games it sits between:** Dead Cells and Hyper Light Drifter. They are for feel only; nothing is copied from them.

## At a glance

The game as it stands today (Version 18.8, on a phone), and which rules it already keeps. Nothing here is new art.

*(Picture in the doc: A dungeon room today. Made with `MONSTERS=1 STOPS=4 node tools/playtest.mjs --file dist/rulebook_look.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/look145.mjs --out shots/rb/look`, look_03_elite_12x14.png.)*

**A dungeon room today.** Already by the rules: crisp pixels, the dark at the edges, light from the upper left, walls fading into the dark, the brazier's honest orange fire. Not yet: rich detail, and a palette of its own. Every dungeon is the same indigo stone today.

*(Picture in the doc: Friend and enemy, close up. Made with `MONSTERS=1 STOPS=4 node tools/playtest.mjs --file dist/rulebook_look.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/look145.mjs --out shots/rb/look`, a close-up of look_03_elite_12x14.png.)*

**Friend and enemy, close up.** The soldier's blade and edge glow cyan; the skeletons' eyes and edges glow pink. Small monsters in a crowd, there to be smashed.

*(Picture in the doc: The town today. Made with `MONSTERS=1 STOPS=4 node tools/playtest.mjs --file dist/rulebook_look.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/look145.mjs --out shots/rb/look`, look_00_town.png.)*

**The town today.** Lighter than a dungeon, with more to look at. Its cyan glows, the wordsmith's circle and the gate, belong to the hero's side, so they keep the friend's colour.

## Pixels, camera and light

Wordsmith is crisp pixel art, painted in code, seen from one fixed angle and lit from the upper left.

1. **Crisp pixels.** No blur, no smoothing, no soft gradient across a surface. Two picture pixels to one game pixel, for everything.
2. **2D that looks solid.** A figure may be built in 3D in code and turned into pixel art, as the heroes are and as Dead Cells does it. What reaches the screen is always flat pixel art. In your words, 5 Oct: "No let's keep the 2D."
3. **One camera.** The isometric view, where a floor tile is a diamond twice as wide as it is tall. Nothing is drawn from another angle.
4. **Light from the upper left.** What faces up is lightest, what faces left is in between, what faces right or down is darkest. Three tones per material; something that gives off light may have more.
5. **No black outlines.** Where one part ends in front of another there is a thin seam of deep indigo. Every hero and every living monster has a one-pixel edge of light in its side's colour, cyan or pink. Townsfolk have none.
6. **The dark is part of the look.** A dungeon gets darker with distance and in the corners, and the hero carries a pool of light. Town is lighter.
7. **Soft shadows.** Everything that stands or walks has a soft dark oval under it, never a hard-edged one.

## Colour

Every place has a bold palette of its own on a dark base, and the glows sit on top. In your words: "Each place its own".

1. **A palette per place.** Each area (a crypt, a forge, a flooded hall) gets a few colours of its own, used all through it: floor, walls, props and light. A new area should feel like a new place at a glance.
2. **A dark base.** Whatever the palette, shadow and distance fall into a deep, cool dark. Bright colour is saved for what matters.
3. **Glows are reserved.** Cyan glows only on the hero's side: the heroes, their weapons and magic, and friendly magic, such as the wordsmith's circle and the waypoints. Hot pink burning to gold glows only on an enemy: eyes, runes, a cultist's fire. An honest fire, a brazier or a torch, burns orange. Nothing else, no place, prop or decoration, glows cyan or pink.
4. **Words keep their colours.** Each of the nine power words has a colour of its own. A place's palette stays darker and duller than any word's colour, so a word at work always reads.
5. **Neon on dark.** Strong pinks, teals and violets against deep blues, in the family of Hyper Light Drifter. Never candy pastels, never mud-brown all over.

## Heroes

The heroes are stylized and cool, each with a body of their own, built bold so they read at a glance. In your words, 6 Oct: "the heroes to be very stylized and cool. Proud and daring or a roguish charm. A very powerful wizard wielding crazy magics."

1. **A body each.** The soldier is broad and heavy through the shoulders and chest. The ranger is lithe and graceful. The mage is a woman. Heads are about a third bigger than life, so faces and helms read.
2. **Bold shapes, few small marks.** Big readable pieces: helm, hat, cape, weapon. Fine detail only where the eye should go: a face, a blade, a gem.
3. **One look each.** A hero's look never changes with the place or the story. Only the weapon in hand changes, and a rarer weapon looks finer. Armour and the rest may come later, "if ever".
4. **Built for skins.** Every move is made on the hero's skeleton, apart from what they wear, so a skin is a new outfit over the same bones and moves. A skin keeps the hero known at a glance and keeps the friend's cyan.
5. **Cloth moves.** Scarves, capes, braids and feathers move with every step and blow. In your words: "The scarves and feathers waving, robes and cloaks billowing".
6. **Clean bodies.** Arms never pass through clothing or the body, in any frame.
7. **Truly turned, eight ways.** A hero turns through eight directions, each the figure turned round for real, never its picture flipped, so the weapon stays in its hand and the light still falls from the upper left. In your words, 8 Oct: "I like the true left". You chose eight directions over four the same morning; a speed test on your phone comes before it goes in.

## Monsters

Monsters look natural for what they are, and how they feel depends on their size. In your words, 6 Oct: "I want enemies to look natural. An undead skeleton is plodding and brittle."

1. **True to what they are.** Natural does not mean real. A skeleton has bones where bones go, joints that bend only as joints bend, and the walk of a heavy, loose pile of bones.
2. **Small ones are fun to smash.** Bats, skeletons, bone archers, cultists: big reactions when hit, knocked about, satisfying to break.
3. **Big ones are menacing.** Brutes, guardians, the Warden: slow, looming, a wind-up you dread. The bigger it is, the more of a threat it should feel.
4. **The warning is a pose.** Before every attack a monster holds a wound-up pose for a moment, and it reads at a glance as a blow about to land.
5. **Weapons rest low.** No monster holds its weapon up in the air for no reason. In your words: "Why are their weapons always straight up in the air?"
6. **Pink is theirs.** Eyes, runes and enemy fire glow hot pink burning to gold, and every living monster has a one-pixel pink edge. Nothing on a monster glows cyan.
7. **Equal to the heroes.** Monsters are painted as boldly and as finely as the heroes. In your words: "we need the dungeons and mobs brought up to the level of the character models".
8. **Built on bones.** The skeleton and the bone archer are rebuilt on the heroes' bones, so they move with the same weight the heroes do. You chose both on 8 Oct; other monsters follow one at a time, each shown to you first.

## Places

The places carry the detail, always a step quieter than the fight. In your words, 5 Oct, of the town: "less uniform", "more alive", and "everything looks too flat".

1. **Rich detail.** Cracks, moss, carvings, rubble, banners, bones: a place is worth a close look.
2. **A step quieter.** Places use less contrast and duller colour than the figures in them, so the eye lands on the fight first.
3. **Each place its own.** Every area has its own palette, stone, props and decoration. Two areas are never mistaken for each other.
4. **Solid, not flat.** Walls are upright faces lit as the light falls, the left face lighter than the right, fading into the dark at the top. Props stand up off the floor with soft shadows. Steps and ledges are part of the world: "steps are a must include".
5. **Books may give worlds.** A group of floors may take its world from an old book, drawn only from the book itself and only from books out of copyright. The heroes never change their look for a book.
6. **Old, broken and burnt.** Decorations show age: a tapestry torn and burnt, hanging in strips; a gargoyle head small and high on the wall; flagstones cracked or gone; a soft shadow at the foot of everything that stands. In your words, of the first gargoyle: "It’s too big and too low on the wall."
7. **Each floor themed after its boss.** Every floor takes its theme from the boss who rules it, and has between 40 and 50 pieces made for it alone: wall tiles, floor tiles, things that break, things on the walls and on the floor, obstacles, the look of its doors and gates, its traps and its quests. In your words, 10 Oct: “I’d also like each floor to be themed after the boss.  Add this to the ruleset.  We need somewhere between 40-50 unique assets on each floor for each boss.  That can include wall tiles, floor tiles, breakables, stuff on the walls, on the floor, obstacles, the looks of doors and gates, traps, and quests.”

## Movement

Weight is the test for every animation, and every character moves its own way, as big and wild as the Wave (8 Oct). In your words: "The warrior swings his sword with practiced lethal intent" and "The rogue drops to a knee when he fires Volley".

1. **Weight first.** A blow plants the feet, turns the hips and carries through. A landing sinks. Something heavy is slow to start and slow to stop.
2. **Each character its own way,** set in its brief (see A new character):
   - **The soldier:** heavy but quick. A lifetime with the sword: no wasted motion, his weight behind every swing.
   - **The ranger:** graceful and quiet, light on his feet. In your words: "needs to be to stay quiet in the forest".
   - **The mage:** wild. Big sweeping casts, cape and braids flying, only just in control of the power: her whole body in every cast, and the power fighting back, as in the Wave of 8 Oct.
   - **The skeleton:** "plodding and brittle". One long step it falls onto, one stiff leg dragged after.
3. **Every attack winds up** before it lands and follows through after, however quick it is. The follow-through may run a couple of frames past the attack, as long as the blow comes just as fast. In your words, 8 Oct: "if it increases the total attack time by a couple frames, that's fine, as long as the swipe stays just as fast.  That would reinforce the follow through of the attack".
4. **Loose things follow.** Cloth and hair trail the body and settle after it stops, and a blast or a beam blows them back.
5. **Slick.** Smooth, plenty of frames, nothing jerky. In your words: "I want the animations to be really slick".
6. **Alive when still.** A figure left standing breathes, shifts its weight and has small habits of its own.
7. **Heavy blows land with a freeze.** The moment a heavy blow lands, everything holds for a tenth of a second. You chose it on 8 Oct.
8. **Feet grip the floor.** A foot stays where it lands; a running figure moves its legs faster rather than slide. You chose it on 8 Oct.

## Hits, blood and deaths

A little blood: enough to sting, never a bloodbath. In your words: "A little".

1. **A splash, then gone.** A creature with blood throws a small splash when hit and may leave a small stain that fades.
2. **No blood where there is none.** Skeletons chip and crumble. Spirits and magic things flicker, crack or come apart in their own colour.
3. **Every hit shows.** A struck figure flashes and is knocked back a little; a heavy blow rocks it.
4. **What flies off a hit is the monster's,** not the weapon's: bone and dust off a skeleton, yellow sparks and flakes of iron off armour, a scrap of robe and a little blood off a cultist. In your words, 8 Oct: "I'd rather have bone fragments or dust from the skeletons, or yellow sparks hitting an armored target.  So maybe that's a mob particle effect as opposed to the weapon effect". For now the sword's blows and the arrows throw it, and the mage's spells crackle instead: your choice of 8 Oct, "Only sword and arrows".
5. **Deaths are true to what died.** The cultist's robe crumples empty, as you asked: "have the cloaks just crumple to the ground like they're empty". The brute goes down on his knees and sags forward. Small things die quick; big things die heavy.

## Animations

Big and wild: magic that crackles, sparks everywhere, bolts that shoot out, and the screen kicks on big casts and hits. In your words, 8 Oct: "i think we need to amend the rules for effects and animations change it to big and wild". Until then it was "somewhere in the middle".

1. **As far as it will go.** Every animation, of a hero, a monster or a boss, and every effect, is as big, wild, kinetic and weighty as it can be. When in doubt, a notch too high, never a notch too low. In your words, 10 Oct: “Put in the ruleset that I want animations as big and wild and kinetic and weighty as possible.  I’d rather it be a notch too high than a notch too low.”
2. **The Wave is the measure.** Everything is as wild as the Wave you said yes to on 8 Oct ("Just right (Recommended)"): her crystal crackles and spits sparks as it burns; she swings with her whole body and the power kicks the staff back up; it goes with a blast and bolts that strike the floor; the wave stands up tall and crackles, and what it hits crackles too.
3. **Each hero or boss is wild in his own way.** The crackle is the mage's alone. In your words, 8 Oct: "Each character has a style, the crackling works for the mage, but not the warrior." The warrior's is the blade: a big crescent, a second sweep as the blade follows through, wind off its edge, dust and a kick. The ranger's is wind, not energy: a gust and hoops of air at the loose, and a trail of air behind the arrow. In your words: "Can we make the blue effects just like wind instead of energy?" You said yes to both by 22:35.
4. **The hero and every warning stay in sight.** No effect covers the hero, or a monster's wind-up or danger mark, for more than a blink.
5. **Power you can see.** Whatever holds power shows it: a real glow, energy crackling, bolts shooting out, barely held in. In your words: "there should be energy crackling and bolts shooting out, barely able to contain it".
6. **Everything comes up to it.** Every animation made before is brought up to the Wave, one at a time, each shown to you first. In your words: "this goes for all the animations we've created".
7. **Every word has its look.** Each power word shows in its own colour and shape, in front on the hit and behind on what is left, and stacked words add up.
8. **Effects are pixel art too:** the same grain, the same crisp edges, lit from the same side.

## Words in the world

Letters show wherever a word is at work: on the monsters and the weapons that carry one, and nowhere else. In your words: "Wordsmithing is the strongest mechanic. Everything revolves around the wordsmithing first and foremost."

1. **A monster's ring is written in its word.** Under a named monster with a word, the ring on the floor is the word itself, round and round, turning slowly. You chose it on 8 Oct.
2. **A weapon's word rises off it.** A weapon with a word burned in spells the word upward off the blade, letter by letter; the whole word holds a moment, fades, and comes again. You chose it on 8 Oct.
3. **No carved words.** The walls stay with the decorations. In your words: "No carved words".
4. **The game's own letter.** The letters are always the game's own lettering, never a font or script borrowed from elsewhere.
5. **The words win.** When a word is picked up, burned in or used, it is the brightest, clearest thing on the screen for that moment.

## Menus and lettering

Clean with a touch: clean panels as now, with a hint of the world. In your words: "Clean with a touch".

1. **Clean panels.** Deep blue, flat colour, no outlines, glowing cyan and pink accents, as since Version 13.0.
2. **A touch of the world.** A carved corner, a rune, an iron rivet: one or two touches to a panel, never a whole frame of stone.
3. **One letter everywhere.** The game's own bold, clean lettering, drawn at the fine grain, on every screen.
4. **The game stays in sight.** Where it can, a menu takes half the screen and the game stays in sight in the other half, as the inventory does.

## A new character

Every new hero, monster or townsperson starts as a short brief that you answer, and ends as pictures you say yes to. This was your idea: "maybe this sort of thing could be asked when designing a new character".

**The questions, answered in your own words:**

1. What is it, and where does it live?
2. Friend or enemy (cyan or pink)?
3. How big is it, and how should that feel: fun to smash, or menacing?
4. How does it move? (Yours so far: "heavy but quick", "graceful", "Wild", "plodding and brittle".)
5. What is the one thing you'd know it by at a glance?
6. What does it carry, and how does it attack?
7. How does it die?
8. Anything it must never look like?

**What comes back before anything goes in the game:** a sheet of it standing, front and back, beside a hero for size, then its walk, its attack and its death as moving pictures. It goes in only after your yes.

## How art is made and approved

Pictures first, your yes, then one chat puts it in.

1. **Pictures first.** Nothing that changes how the game looks goes live until you have seen a picture of it and said yes. Until then it waits behind a switch that is off.
2. **One chat puts it in.** Any chat may make pictures and mock-ups, each on a branch of its own. Only the main chat puts art into the game and publishes it.
3. **Original designs only.** Nothing copied from another game, a film or a cover. Dead Cells and Hyper Light Drifter are for feel only.
4. **Books from the books.** A book's world is drawn only from the book itself, only from books out of copyright, never from a film or cartoon of it.
5. **Painted in code.** All art is made by code, with no art files, so one look holds everywhere and a skin or a new weapon can use the same moves.
6. **Checked at phone size.** Every figure and effect is looked at as a phone shows it before it is sent to you.
7. **Every boss through every check, as the heroes were.** Before you see a boss, he gets the whole review the heroes had on 8 Oct, in every frame of every move, from in front and from behind, by tests that run every time: nothing passes through his body or what he wears (his arms, an axe, a chain, a ball); his feet grip the floor; nothing of him sinks into it; nothing jerks or jumps, inside a move or from one move to the next; every blow winds up, turns the hips and follows through; a landing sinks; loose things follow; he breathes when still; only the enemy's colours glow; every pixel is crisp. One that fails is fixed before you see it. In your words, 9 Oct: “I need all bosses ran through all checks from now on.  These boss fights are important”, “Add it to the rulebook.  All checks must be made.” and “And every boss gets the same treatment as characters”.
8. **Your words, exactly.** When a rule quotes you, the quote is exact.

## The numbers

The look in numbers as the game has it in Version 18.8, checked against its code on 8 Oct. A chat changes one only with your yes.

| What | Value | Where in the code |
| --- | --- | --- |
| Grain | 2 picture pixels to 1 game pixel | `GRAIN`, src/art/kit.ts |
| Floor tile | 32 × 16 game pixels | `TW`, `TH`, src/engine/iso.ts |
| Light | from the upper left; lit above 0.5 of full light, dark below 0.16 | `LIGHT_AT`, `DARK_AT`, src/art/skin.ts |
| Seam between parts | #0e0c24 | `INK`, src/art/kit.ts |
| Friend's edge | #22d0e0, 1 picture pixel, 110 of 255 strong | `FRIEND_RIM`, src/art/hero3_knight.ts; `RIM_ALPHA`, src/art/kit.ts |
| Enemy's edge | #ff4f8a, 1 picture pixel, living monsters only | `ENEMY_RIM`, src/art/mkit.ts |
| Friend's glow | #28dcf0, radius 46 picture pixels, 0.2 strong | `AURA`, src/art/kit.ts |
| Enemy's glow | #ff3a78, radius 40 picture pixels, 0.13 strong | `MENACE`, src/art/mkit.ts |
| Enemy fire, pink to gold | #7a1058, #c0206a, #ff4f8a, #ffb070, #fff0a0 | `FLAME`, src/art/mkit.ts |
| Heroes' height | soldier 58, ranger 57, mage 54.5 picture pixels; heads 1.3 times life | `KNIGHT_BODY`, `RANGER_BODY`, `MAGE_BODY`, `HEAD_B`, src/art/moves3.ts |
| Monster's picture | 112 × 112 picture pixels, feet at (52, 102) | `KW`, `KH`, `KAX`, `KAY`, src/art/kit.ts |
| Walls | 40 game pixels tall, the top 12 fading into the dark | `WALLS_FADING`, src/art/ground.ts |
| Darkness | far floor 0.88 dark; vignette 0.62 in a dungeon, 0.4 in town | `FAR_DARK`, `VIGNETTE`, `VIGNETTE_TOWN`, src/render/render.ts |
| Shadow | a soft oval, 0.7 strong | `SHADOW`, src/render/render.ts |
| Frames a second | standing 10; monsters walk 16; heroes run 30; attacks and moves 30 | `IDLE_FPS`, `WALK_FPS`, `CLIP_FPS`, src/art/kit.ts; `RUN_FPS3`, `CLIP_FPS3`, src/art/heroes3.ts |
| Power words | 9, each its own colour: power, swift, twin, fire, frost, lightning, leech, volatile, poison | `WORD_COLOR`, src/art/icons.ts |

## Still open

Four things are not decided yet; each answer becomes a rule here.

- [ ] Whether groups of floors take their worlds from old books, and which books ("maybe", "possibly").
- [ ] Which places come first, and each one's palette: to be set place by place, with pictures.
- [ ] Skins: whether to sell them, and when.
- [ ] Gear beyond weapons: "further on down the road, if ever".

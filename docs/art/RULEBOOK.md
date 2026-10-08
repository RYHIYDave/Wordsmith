# Wordsmith Art Rulebook

Oct 8, 2026

> **APPROVED BY THE OWNER, 8 Oct 2026, 08:23: "Okay this all sounds good".** Every chat that makes art for Wordsmith follows it; it changes only with his yes. Written by the art chat from his answers (`docs/art/interview.md` has every question and answer in his exact words). The living copy is his doc "Wordsmith Art Rulebook" (https://claude.ai/artifact/Dq343Th9FFbpt9EiKfNyYe); this file is a copy of it for the other chats, refreshed when the doc changes. Nothing here changes the game by itself: what it asks for goes in through the main chat, pictures first.

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
3. **Glows are reserved.** Cyan glows only on the hero's side: the heroes, their weapons and magic, and the town's friendly magic, such as the wordsmith's circle and the gate. Hot pink burning to gold glows only on an enemy: eyes, runes, a cultist's fire. An honest fire, a brazier or a torch, burns orange. Nothing else, no place, prop or decoration, glows cyan or pink.
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
7. **Truly facing left.** A hero facing left is the figure turned round for real, never its picture flipped, so the weapon stays in its hand and the light still falls from the upper left. In your words, 8 Oct: "I like the true left".

## Monsters

Monsters look natural for what they are, and how they feel depends on their size. In your words, 6 Oct: "I want enemies to look natural. An undead skeleton is plodding and brittle."

1. **True to what they are.** Natural does not mean real. A skeleton has bones where bones go, joints that bend only as joints bend, and the walk of a heavy, loose pile of bones.
2. **Small ones are fun to smash.** Bats, skeletons, bone archers, cultists: big reactions when hit, knocked about, satisfying to break.
3. **Big ones are menacing.** Brutes, guardians, the Warden: slow, looming, a wind-up you dread. The bigger it is, the more of a threat it should feel.
4. **The warning is a pose.** Before every attack a monster holds a wound-up pose for a moment, and it reads at a glance as a blow about to land.
5. **Weapons rest low.** No monster holds its weapon up in the air for no reason. In your words: "Why are their weapons always straight up in the air?"
6. **Pink is theirs.** Eyes, runes and enemy fire glow hot pink burning to gold, and every living monster has a one-pixel pink edge. Nothing on a monster glows cyan.
7. **Equal to the heroes.** Monsters are painted as boldly and as finely as the heroes. In your words: "we need the dungeons and mobs brought up to the level of the character models".
8. **Built on bones.** The skeleton is rebuilt on the heroes' bones, so it moves with the same weight they do. You chose it on 8 Oct; other monsters follow one at a time, each shown to you first.

## Places

The places carry the detail, always a step quieter than the fight. In your words, 5 Oct, of the town: "less uniform", "more alive", and "everything looks too flat".

1. **Rich detail.** Cracks, moss, carvings, rubble, banners, bones: a place is worth a close look.
2. **A step quieter.** Places use less contrast and duller colour than the figures in them, so the eye lands on the fight first.
3. **Each place its own.** Every area has its own palette, stone, props and decoration. Two areas are never mistaken for each other.
4. **Solid, not flat.** Walls are upright faces lit as the light falls, the left face lighter than the right, fading into the dark at the top. Props stand up off the floor with soft shadows. Steps and ledges are part of the world: "steps are a must include".
5. **Writing as landmarks.** Here and there a place has words carved into it: over a door, round a shrine, on a boss's gate. Never on every wall.
6. **Books may give worlds.** A group of floors may take its world from an old book, drawn only from the book itself and only from books out of copyright. The heroes never change their look for a book.

## Movement

Weight is the test for every animation, and every character moves its own way. In your words: "The warrior swings his sword with practiced lethal intent" and "The rogue drops to a knee when he fires Volley".

1. **Weight first.** A blow plants the feet, turns the hips and carries through. A landing sinks. Something heavy is slow to start and slow to stop.
2. **Each character its own way,** set in its brief (see A new character):
   - **The soldier:** heavy but quick. A lifetime with the sword: no wasted motion, his weight behind every swing.
   - **The ranger:** graceful and quiet, light on his feet. In your words: "needs to be to stay quiet in the forest".
   - **The mage:** wild. Big sweeping casts, cape and braids flying, only just in control of the power.
   - **The skeleton:** "plodding and brittle". One long step it falls onto, one stiff leg dragged after.
3. **Every attack winds up** before it lands and follows through after, however quick it is.
4. **Loose things follow.** Cloth and hair trail the body and settle after it stops, and a blast or a beam blows them back.
5. **Slick.** Smooth, plenty of frames, nothing jerky. In your words: "I want the animations to be really slick".
6. **Alive when still.** A figure left standing breathes, shifts its weight and has small habits of its own.

## Hits, blood and deaths

A little blood: enough to sting, never a bloodbath. In your words: "A little".

1. **A splash, then gone.** A creature with blood throws a small splash when hit and may leave a small stain that fades.
2. **No blood where there is none.** Skeletons chip and crumble. Spirits and magic things flicker, crack or come apart in their own colour.
3. **Every hit shows.** A struck figure flashes and is knocked back a little; a heavy blow rocks it.
4. **Deaths are true to what died.** The cultist's robe crumples empty, as you asked: "have the cloaks just crumple to the ground like they're empty". The brute goes down on his knees and sags forward. Small things die quick; big things die heavy.

## Effects and magic

Wild for an instant, then clear: big moments flare, and nothing hides the fight for long. In your words: "My heart says big and wild, but my brain says bold but clear.  So maybe somewhere in the middle".

1. **Peak fast, fade fast.** A big spell or a heavy blow can flare large for a moment, then clears.
2. **The hero and every warning stay in sight.** No effect covers the hero, or a monster's wind-up or danger mark, for more than a blink.
3. **Everyday hits are bold but clean:** a bright crescent, a few sparks, gone.
4. **Shake is rare.** The screen shakes only on the biggest blows, and briefly.
5. **Every word has its look.** Each power word shows in its own colour and shape, in front on the hit and behind on what is left, and stacked words add up.
6. **Effects are pixel art too:** the same grain, the same crisp edges, lit from the same side.

## Words in the world

Letters show wherever a word is at work, and now and then in the places themselves. In your words: "Wordsmithing is the strongest mechanic. Everything revolves around the wordsmithing first and foremost."

1. **A word shows its letters.** Gear with a word burned into it, and a monster carrying one, show glowing letters in that word's colour.
2. **Carved words as landmarks.** Some places have writing cut into them, rare enough to notice (see Places).
3. **The game's own letter.** Carved or glowing, the letters are the game's own lettering, never a font or script borrowed from elsewhere.
4. **The words win.** When a word is picked up, burned in or used, it is the brightest, clearest thing on the screen for that moment.

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
7. **Your words, exactly.** When a rule quotes you, the quote is exact.

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

Seven things are not decided yet; each answer becomes a rule here.

- [ ] Whether groups of floors take their worlds from old books, and which books ("maybe", "possibly").
- [ ] Which places come first, and each one's palette: to be set place by place, with pictures.
- [ ] Skins: whether to sell them, and when.
- [ ] Gear beyond weapons: "further on down the road, if ever".
- [ ] The two films of weight you have (a short freeze on a heavy blow; feet that grip the floor): your yes or no decides whether they become rules.
- [ ] Decorations built the way the heroes are (a moth-eaten tapestry, a gargoyle head, a missing flagstone, soft shadows under props): waiting for your word.
- [ ] Whether heroes turn through eight directions instead of four: the next question on true left.

# Endless mode's key: the tablet, the portal and the final boss (concept, 12 Nov 2026)

The Pips chat, a chat of his working from the queue (item `draw-endless-tablet-portal-final-boss`; his words, 12 Nov, 13:28
Eastern: “Work on the next queue item”). Branch `art/endless-tablet`, cut from `main` 40c62c8d (25.3.11). NOTHING OF THE GAME IS
CHANGED: these are rough concept sketches for his picks, painted by small Python tools (`tools/endless_tablet/`), not the game's
painter. The ones he picked are next drawn to the game's standard in the game's own code (the Gate Ward and the Brawler the measure),
behind a switch that is off, pictures first.

His 7 Nov idea (docs/handoff.md, 6d): the bosses of floors 5, 10, 15 and 20 in endless each drop a quarter of a round stone tablet;
the four set in the wordsmith's bench open a portal to a final boss, “Like something that will kick your ass if you don’t have an
optimized build.”

## What he picked, in his words (by pop-up, 12 Nov 2026)

1. THE TABLET. Shown three takes (`pictures/endless_1_tablet.png`: A the stair seal, B the key word, C the four faces): “I like B
   but I want runes over letters”. Shown B with the wordsmith's own runes (`pictures/endless_5_tablet_runes.png`: art/town.ts
   RUNES drawn twice as big, one a quarter, each boss guarding one, cut dark as they drop, burning in the friend's cyan set whole),
   by 13:50: “Sorry I like the runes”. SO: TAKE B WITH RUNES. Which rune each boss guards, as sketched: the Fleshmancer RUNES[0],
   the Swamp Colossus RUNES[4], the Censor RUNES[3], the Moth RUNES[1] (`tools/endless_tablet/tablet.py` RUNE_OF); each quarter also
   carries its boss's small mark on the rim.
2. THE PORTAL. Shown three takes painted over the Shaft's Rim (`pictures/endless_2_portal.png`): “B: The landing opens
   (Recommended)”. SO: the landing at the tongue's end splits in four as the tablet does, its quarters draw back onto the rim, and a
   stair goes on down into the friend's light, the boss's pink glow far below.
3. THE FINAL BOSS.
   - Shown four (`pictures/endless_3_boss_a.png`, `endless_4_boss_b.png`: the Head Librarian, the Bottom of the Stair, the Erasure,
     the Four Made One): “I want a big four legged thing.  I was thinking a dragon or a wyvern or something but that seems a little
     cliche”.
   - Shown four beasts (`endless_6_beasts_a.png`, `endless_7_beasts_b.png`: the Sphinx of the Stacks, the Bound Behemoth, the
     Stair-Back, the Ink Hound): “[No preference]”, and “Ooo let’s have you fight a warped runesmith”.
   - Asked who and what shape: “A new runesmith of his own”; “Riding a four-legged beast”.
   - Shown him as a smith with a hammer and tongs on three mounts (`endless_8_runesmith.png`): “Let’s talk about wordsmiths for a
     second.  I don’t even really know what they are or where they come from”; “Does he ever have tongs in the game?”. Told: no one
     in the game carries tongs; the town's wordsmith (the Old Skald) writes runes on the air with a staff of runes; the game has two
     wordsmiths (him, and the fallen one in the Crypt with the master rune-stone) and never says what they are.
   - THE LORE, offered and his yes, 14:01: “Yeah thats not bad”: WORDSMITHS ARE AN OLD ORDER WHO KEEP THE WORDS; the one in the
     Crypt fell; the final boss is one of them who went down the shaft for the deepest words and was warped by them; his runes are
     what the four bosses guard on the tablet.
   - Shown him so, a wordsmith (`endless_9_warped_wordsmith.png`): of his mount, “What he rides is kinda dictated by where they’re
     from.  Are they a desert dwelling people, cold mountain monastery kinda guys, swamp temple, forest elven types, etc”; of him,
     “[No preference]”.
   - Asked where the order is from: “Cold mountain is good, but save all these for further quests and acts where you have to visit
     temples in all these regions”. SO: the order's home is a cold mountain monastery in the north; the other lands' temples are
     queued (`plan-wordsmith-temples-in-other-lands`).
   - Shown three mounts of the cold (`endless_10_mounts.png`: the great ram, the white bear, the glacier tusker): “Gimme a mix of a
     and c”. Shown two mixes (`endless_11_mount_mix.png`): “Maybe a big wooly boar would kinda satisfy the mix of the two”.
   - Shown the great woolly boar, with and without the ram's horns (`endless_12_woolly_boar.png`): “Without (Recommended)”; and
     whether to lock in the warped wordsmith on the woolly boar: “Yes, lock them in (Recommended)”.

## So, what is locked in

- THE TABLET: a round stone disc of the rim's stone, a raised rim, a small boss in the middle; in four quarters, each with one of
  the wordsmith's runes cut in it (twice the slab's size) and its boss's small mark on the rim. As they drop: cut dark. Set whole
  in the bench's socket: the four runes burn in the friend's cyan.
- THE PORTAL: the landing opens (above).
- THE FINAL BOSS: THE WARPED WORDSMITH ON THE GREAT WOOLLY BOAR. He: one of the old order, gaunt, a beard to his belt and long white
  hair, an iron band on his brow with its stone cracked, his order's cloak gone to violet rags, his skin ashen and cut with runes
  that burn pink, his eyes pink; a staff of his order taller than he is, runes cut down it burning, his great rune burning in the ring
  at its head; he writes runes on the air, pink; cracked rune stones go round him. It: a boar grown huge from the cold mountains,
  high at the shoulders, the ram's long pale wool matted with frost, a dark crest down its spine, tusks curving up out of its jaw cut
  with his runes, small eyes burning, short thick legs and cloven hooves; his runes branded on its flank, the wool burnt off round
  them; a saddle of iron and old leather on its hump. Both the enemy's: pink burning to gold, the pink edge.

## HOW HARD HE IS: HIS WORDS, 12 Nov 2026, 14:32

“Can you put in there that this is the biggest, baddest boss in the game and will need a well geared, well rounded character to
deafeat.  The fight needs to be fun and engaging and tough as nails.  I want it to be something you have to prep for or he’ll wipe
the floor with you.  Not unfair or gimmicky, just hard”. (Put in the queue's draw-endless-tablet-portal-final-boss and
build-endless-tablet-and-final-boss too.)

## HIS BRIEF FOR THE FINAL BOSS (docs/art/RULEBOOK.md, A new character), 12 Nov 2026, by pop-up

1. What is it, and where does it live: the warped wordsmith on the great woolly boar (above), past the portal at the bottom of the
   endless shaft.
2. Friend or enemy: enemy (pink burning to gold, the pink edge).
3. How big, and how it should feel: “I don’t want the wordsmith to be huge, at least at the start.  So scale the boar to whatever we
   decided the wordsmith size would be.  I think he’s a little taller than the hero”. Asked whether he grows later: “Yes, after he's
   thrown (Recommended)” (offered as: thrown from the boar, he swells huge with his runes for the last part of the fight). SO: AT THE
   START HE IS A LITTLE TALLER THAN THE HERO, AND THE BOAR IS SIZED TO CARRY A MAN OF THAT SIZE (the sketches' sizes are not his:
   they drew both far too big); ONCE THROWN, HE GROWS HUGE.
4. How they move: “Heavy charges, skid and turn (Recommended)” (offered as: the boar charges in straight lines and skids round; he
   sways in the saddle, casting).
5. The one thing to know him by at a glance: “His burning rune-staff held high (Recommended)”.
6. What they carry, and how they attack: “Together, then he's thrown (Recommended)” (offered as: the boar charges and gores while he
   writes runes on the air that burst; partway he is thrown, and both fight on, alone). The fight's rules are the main chat's.
7. How they die: offered “the boar falls, he gutters out” (he sinks to his knees as his runes go out), his words: “Remember we’re
   trying to stay away from “falling to their knees”.  I think he is overwhelmed by the word power he is using and implodes in pink
   energy that dissipates into tiny runes that blink out until nothing is left”. SO: NO FALLING TO HIS KNEES; he is overwhelmed by
   the power of the words he is using and implodes in pink energy, which comes apart into tiny runes that blink out until nothing is
   left. (The boar's own death was not asked: ask with its first pictures, away from falling to its knees.)
8. Anything it must never look like: “Never kindly, never the Old Skald (Recommended)” (offered as: no one should mistake him for a
   friendly wizard or for the town's wordsmith).

## Still to do

1. (Done: his brief, above.)
2. The boss and his boar drawn to the game's standard (sculpted on bones, as the bosses are), through every boss check, then their
   moves; pictures, then films, his yes at each step.
3. The tablet to the game's standard: a quarter as loot on the floor and in the bag, the four in the bench's socket
   (art/shaft_props.ts BENCH_SOCKET), and lit.
4. The portal to the game's standard on the landing (art/shaft_rim.ts LANDING), and its opening as a moment.
5. The rules, the drops and the fight are the main chat's (the queue's `build-endless-tablet-and-final-boss`).

## The tools

`tools/endless_tablet/` (Python with Pillow and numpy; run from that folder): `kit.py` (a small pixel-art kit: two picture pixels to
a game pixel, lit from the upper left, an ink seam round every part, banded glows), `emblems.py` (the four bosses' marks),
`tablet.py`, `portal.py` (painted over `docs/mockups/endless_town/pictures/rim3_whole.png`), `bosses.py`, `beasts.py`, `rider.py`,
`mountains.py`; `sheets.py` and `round2.py` to `round6.py` make the sheets in `pictures/`. `brawler.png` is the Brawler's standing
frame from the live heroes' bake (1fdc8d09059a), for size.

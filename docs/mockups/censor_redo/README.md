# Floor 15's boss, the Censor, made again

Branch `design/censor-redo` (built on `design/f9-side-bosses`). Behind `CENSOR2` (art/censor2_art.ts), ON at his yes (below).

## His words

- 14 Nov 2026, 13:34 (Eastern): “Do you think the other main bosses (5, 15, and 20) are up to par?  The sunken eye got a big update.  Do the others need work?”
- Told the Censor was furthest behind (a black robe barely taller than the hero, lost in the dark library, his moves shapes on the floor, his body hardly moving), the Moth's attacks thin, the Fleshmancer closest: his pick, “The Censor first (Recommended)”.
- Shown his first new look (three times the knight): “so the bosses dont need to be gargantuan, i just want the fights to be up to par as a lynchpin of the 5 levels”. Read back: his fight kept as he set it on 24 Oct 2026 (one phase, his ink filling the floor and hurting whoever stands in it; the Unstruck Pages), him about twice the knight, and the work in the fight itself: his body in every attack, each attack its own effect, his ink seen on the dark floor, a death fit for the end of 11 to 15.

## What is made

- **His body** (art/censor2_sculpt.ts): about twice the knight; gliding, his robe to the floor; parchment stoles struck through down his front; his chain of office and its lock, the keyhole burning; the Order's mask, its eye slits burning and the ink bar over its mouth; a tall peaked hood; a great ruff of written pages fanned behind his head (it stands upright however he leans); long bell sleeves; ink-black fingers; the great brush resting low, point down, dripping.
- **His moves** (art/censor2_moves.ts), on the rules' own beats (game/act1_rules/censor.ts CENSOR): the slash, a calligrapher's stroke (turned away, the brush over his shoulder in both hands, held, one stroke down and across, followed through); Strike-Through, a lance's thrust (side-on, coiled, his whole body flung after it); Redaction (he rises off the floor, the brush over his head, and drives it point first into the floor); the Hush (a finger to his ink bar, the circling words drawn in, then flung open); struck; his death (the brush let fall, the mask cracking, arched back, the words bursting out of him, his robe falling in empty onto a pool of ink); his stand and his glide.
- **What follows him** (art/censor2_art.ts): the words he has struck out circling him (what he is known by, and light in the dark); the stroke left in the air as black ink edged with burning pink; drops; pages torn from his ruff; the words of the city bursting out as he dies.
- **What he lays on the floor** (art/censor2_shots.ts): the slash's stroke with its dry-brush tail; Redaction's slab coming down over its marked place and slammed, ink bursting off its sides, lying wet with a sheen and a glinting pink edge (the ink that stays, glinting, so you know where not to stand); Strike-Through's burning head racing out; the Hush's ring of silence, letters torn up and struck through.

## Pictures

- pictures/censor_look_1.png: the first look (three times the knight; made smaller at his word).
- pictures/censor_fight.mp4: the fight in the game, at his phone's size.

## His yes

- Asked with pictures/censor_fight.mp4, “Is the Censor's fight up to par for the end of floors 11–15?”: “Yes, switch him on (Recommended)”. `CENSOR2.on` is true; his size as the game measures a figure, 80 up (his hood's peak) and 18 to either side, his robe's reach 0.85 of a tile (art/bestiary.ts useCensor2).

## Checked

- tsc clean. On a653e139: `node tools/unit.mjs --only censor2,act2_censor,censor,new_mobs3,act2,bosses,boss_calls,quests1115` and the core, 29 of 30; the one, new_mobs3's import check, fails on main already (art/key_bearers.ts and art/unique_play_art2.ts, the temple door's and the uniques', not in its list) and not for him. On 8dc418e3 also monsters_baked, monster_attacks, inklings, f9_bosses, f9_hunt: passed. tests/censor2.test.ts (new) holds his new pictures; tests/act2_censor.test.ts and tests/censor.test.ts hold the rules and the art chat's old pictures, as they were.
- In play: his fight on a page built from 69cb1e70, his switch as the game has it (tools/scenarios/censor2_fight.mjs): his new pictures by default, the painter's workers too.


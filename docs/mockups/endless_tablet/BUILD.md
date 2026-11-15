# Endless mode's tablet key and final boss: BUILT INTO THE GAME (the queue's build-endless-tablet-and-final-boss)

Branch `build/endless-final-boss`, made by the Queue chat of 12 Nov (session ...KKtBp) on the art chat's `art/endless-tablet`, with
main (8ccc8b9) in it: it comes in as a fast-forward. Everything is behind `ENDLESS_KEY` (src/game/endless_key.ts, off); the art
behind `ENDLESS_TABLET` (src/art/endless_tablet.ts, off). His pick for how it was built: “Build it here on a branch (Recommended)”.
Four stages, each filmed from the game and shown to him before the next. The art: README.md; the fight's flow: FIGHT_FLOW.md.

## The four stages and his word on each

1. **The key.** Tablet shards drop from the bosses of endless floors 5, 10, 15 and 20 (the account's, `Meta.quarters`). They hang
   on the Rim's trophies wall and lie dark in the bench's socket. With all four, a tap on the wordsmith sets them, they burn, and
   the landing opens for that hero (kept in his save). Named at his word: “Tablet Shard”. Film: pictures/build/key_in_game.mp4.
   His yes: “Yes, on to stage 2 (Recommended)”.
2. **The arena and phase 1.** The bottom of the shaft (game/final_arena.ts, render/final_arena.ts), round, the boss across it
   (kind `wsboss`: game/act1_rules/wsboss.ts, render/act1_fx/wsboss.ts, art/act1_figs/wsboss.ts, his four sides truly painted,
   none mirrored). Phase 1 in the saddle: the boar's charge (runs, wheel round, winded after), gore, stomp; his five words. Each
   beat drawn at random from what fits (FIGHT_FLOW). Asked whether he attacks at random, his pick: the charge and the ice go
   “Straight at me (Recommended)”. Films: pictures/build/fight_phase1_a.mp4, _b.mp4. His yes: “Yes, on to stage 3 (Recommended)”.
3. **The boar's death and phase 2 on foot.**
   - **The boar's death.** At half his life the boar dies on its next charge. Nothing hurts the hero and he can't be hit. He says
     his two lines.
   - **On foot, his ten melds** (game/act1_rules/wsboss2.ts, render/act1_fx/wsboss2.ts). He writes his rune and his shade writes
     theirs; they meld; he slams it down. Each slam sends a small ring over the floor that can't be dodged.
   - **The flow.** Half to a quarter of his life: one meld at a time, at random, spent after each (Frostbite aside). Below a
     quarter: no rest.
   - **Runes in the saddle.** His phase-1 words now show their runes, written at his hand and thrown (render/act1_fx/wsboss2.ts).
   - **Films:** pictures/build/boss_on_foot_part1.mp4, part2, part3. His yes: “Yes, on to stage 4 (Recommended)”.
4. **His death and drops.**
   - **His death.** When his life runs out on foot he dies, whatever he is doing (the art's `death`). He can't be hit while it
     plays and nothing of his hurts.
   - **His drops** (game/game.ts `finalLoot`, numbers in game/final_arena.ts `FINAL_LOOT`): a great hoard of gold, six pieces all
     rare, two words, an orb.
   - **His two uniques.** One kill in four (`UNIQUE_DROPS.final`), The Third Word or The Ghostwriter.
   - **The way home.** The tablet is used up. The portal's light takes the hero back up to the Rim once he stands in it a moment.
   - **Film:** pictures/build/boss_death_and_drops.mp4.
   - **His yes, to the film and the odds:** “that sounds good.  nice job”.

## Checked

- tsc clean.
- tests/final_fight.test.ts 7 of 7: the arena; phase 1's beats; the boar's death; on foot every meld made and hurting, none
  twice running, no floor after a floor, spent after each; below a quarter no rest; his death, drops and the way up; his
  uniques one in four.
- Also passed: tests/endless_key.test.ts 5 of 5, monster_attacks 11 of 11, monsters_baked 14 of 14, moth_packed 4 of 4,
  eye_arms 9 of 9.
- Filmed from built pages: tools/scenarios/final_fight_look.mjs, final_foot_look.mjs, final_death_look.mjs.
- **Not checked:** a baked page, his phone, the whole suite.

## Left for the main chat

1. Bring in `build/endless-final-boss` (a fast-forward of main). It holds `art/endless-tablet` whole, so the art's ship document
   is folded into this one.
2. Ask him whether to switch `ENDLESS_KEY` and `ENDLESS_TABLET` on. He has seen and said yes to every stage, but not to its going
   live.
3. Tune the numbers. These are the main chat's: WS_TUNE (phase 1), WS2_TUNE (phase 2), FINAL_LOOT, and the Avalanche's freeze
   (1.6 s; his words: “frozen for a duration long enough that you are going to get hit”).
4. His spoken lines are the sound chat's (queue item boss-voices-and-roars). For now they show as the bosses' words over him:
   - the boar's death: “Rest, old friend. Your fury lives in me.”, then “You will pay for this!”
   - one line for each meld
   - his death: a scream cut short (a `bossRoar` cue at his struck moment for now)
5. Run on the release page: tools/scenarios/final_fight_look.mjs, final_foot_look.mjs, final_death_look.mjs. Then the records.

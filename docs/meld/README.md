# Wordmelding: the melded words in the game, behind MELD (off)

The planning chat's branch `meld/words`, from `main` at a60d618. NOTHING OF IT IS SWITCHED ON:
`MELD.on` (src/game/melds.ts) is false, and with it off the game plays and saves as before.

## What he said

- 12 Oct 2026, 17:21 (in the planning chat; whole in the project's `claude/act1_descent.md`): “Oh and
  let’s have the last room, if that’s either a boss or some really hard mobs drop some sort of
  runedust that you use to wordmeld.  And we’ll add a drop to the cultist boss that opens the
  wordmeld menu at the wordsmith.  And we’ll have to add in the melded words that we have so far”.
- The melded words and their rules: his page "Wordsmith: Word Combinations" and his answers to it
  (his doc "Wordsmith Act 1: The Descent", "Wordmelding").
- 13 Oct 2026, 12:15: “Can you begin adding the melded words?” Read as: build them into the game on
  a branch of this chat's own, behind a switch that is off, pictures to him first, then to main.
- His picks of 13 Oct, by 12:36, asked as pop-ups:
  - a melded word in an attack: “Yes, it takes that place (Recommended)” (it takes its side's one
    damage-word place);
  - which words meld: “Only damage words meld” (so Volatile's five are left out; ten remain);
  - who drops runedust until the strongholds are built: “Only the fleshmancer drops it”;
  - his drop that opens melding: “The Meldstone (Recommended)”.

- Shown three pictures (the wordsmith's MELD tab, two words laid in and Eruption made; the
  Fleshmancer's runedust and Meldstone on the floor; Eruption, Thunder, Wildfire and Scald at work)
  and asked as a pop-up “Is wordmelding right as shown in the three pictures (the wordsmith's MELD
  tab, the Fleshmancer's runedust and Meldstone, the melded words at work)?”, by 13:52: “Yes, send
  it to main (Recommended)”, offered as: the main chat puts it in the game and tests it; it stays off
  until he says to switch it on.

## What is in it

- THE TEN (src/game/types.ts `MELD_IDS`, `MELD_OF`; src/game/defs.ts `WORDS`): Eruption (Power and
  Flame), Avalanche (Power and Frost), Thunder (Power and Lightning), Blight (Power and Poison), Scald
  (Flame and Frost), Wildfire (Flame and Lightning), Fumes (Flame and Poison), Hailstorm (Frost and
  Lightning), Frostbite (Frost and Poison), Contagion (Lightning and Poison). A word of kind 'meld'.
- IN AN ATTACK (src/game/words.ts `resolveSkill`): it takes its side's one damage-word place, does what
  both its words do there, and adds its twist (`meld`, `meldBehind` on Resolved). The twists' rules
  are in src/game/game.ts (`meldHit`, `meldArc`, `meldZone`, `chillMonster`), their numbers in
  `MELD_TUNE` (src/game/melds.ts), starting points to be tuned once he has played them. Scald behind
  leaves steam, a new kind of ground (`'steam'`): it hurts and slows, and hides the hero standing in it.
- FOR NOW ON ATTACKS ONLY (his rule): not burned into gear, not laid on the gate, not kept in the
  Lexicon (my reading: the Lexicon keeps the words as found); sold to the wordsmith like any word.
- RUNEDUST AND THE MELDSTONE: the Fleshmancer drops runedust each time he dies (`fleshmancerDust`, 3),
  and the Meldstone until it has been brought to the wordsmith. Walked up to with it, the wordsmith
  takes it and can meld (with HAND_IN on, from the branch quest/hand-in: given by using him, his prompt "Give the
  Meldstone", not by walking up). Runedust is the hero's (`Hero.dust`); melding, once the Meldstone has been
  brought, is open for every hero after on that device (`Meta.meld`), as the wordsmith's ring is (my
  reading, following the ring). Both are saved only while MELD is on.
- AT THE WORDSMITH (src/ui/meld.ts): a MELD tab on his half once he can meld; two hollows, the
  runedust carried, MELD for one runedust; what comes out is not shown until it is made ("found by
  trying"); then its page is read under them, and the Lexicon knows it, in front and behind.
- LOOKS, the planning chat's placeholders for the art chat (pictures to him first): the ten runes
  (src/art/icons.ts `GLYPH`, `WORD_COLOR`, `WORD_GLOW`; their two words' colours along each stone's
  foot), runedust and the Meldstone on the floor (`runedust`, `meldstone`), the steam
  (src/render/render.ts, src/render/fx.ts), runedust beside the gold in the inventory. A melded word's
  attack looks like its two words' (`withParts`).
- Saves: with MELD off nothing of it is written (`savedWords`, `savedMeta`); with it on, the melded
  words, the runedust and the Meldstone are, and come back.

## Tested

- tests/melds.test.ts (26): the ten; the place a melded word takes; that it does what both its words
  do, in front and behind, for four kinds of attack; each twist at work in the practice room; on
  attacks only; the Fleshmancer's drops, their pickup and the hand-in; the meld at the wordsmith;
  saves with MELD on and off.
- The whole unit suite; tsc.
- The pictures he saw: previews/meld_1_wordsmith.png, meld_2_drops.png, meld_3_at_work.png (kept out
  of the repository, as all of them are; made again by the scenario below).
- tools/scenarios/meld_look.mjs: pictures (MELD switched on by `__dbg.meld(true)`), checking as it goes:
  `node tools/playtest.mjs --file dist/meld.html --size 844x390 --dpr 3 --touch --scenario tools/scenarios/meld_look.mjs --out shots/meld`

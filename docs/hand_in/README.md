# Quest items given by using the one they are for, behind HAND_IN (off)

The planning chat's branch `quest/hand-in`, from `main` at a60d618. NOTHING OF IT IS SWITCHED ON:
`HAND_IN.on` (src/game/defs.ts) is false, and with it off the game is as it was.

## What he said

- 13 Oct 2026, 14:25 (in the planning chat): “I’d like the quest turn ins to be triggered by
  interacting with the npcs not just when you walk by.” Read back to him as: walking past the one a
  quest item is for no longer hands it over; using him does (the use button beside him, or a tap
  on him), for the master rune-stone and the Meldstone, both to the wordsmith; beside him with it,
  his prompt says it is given.
- Shown two pictures (previews/hand_in_1_rune_stone.png, hand_in_2_meldstone.png: beside the
  wordsmith with the item, nothing given and his prompt saying “Give the rune-stone” / “Give the
  Meldstone”; then pressed, the ring powering up / melding open) and asked as pop-ups, by 14:35:
  - “Is this how handing in a quest item should work (nothing happens walking past; his prompt says
    "Give the..."; pressing it or tapping him gives it)?”: “Yes, send it to main (Recommended)”,
    offered as: the main chat puts it in the game and tests it; it goes live with his OK.
  - “Should it go in your gameplay rulebook as the rule for every quest from now on?”: “Yes, add it
    (Recommended)”, offered as: every quest item, now and later, is handed in by using the person it
    is for. Done: his doc at rev 79 (Town and quests), the copy docs/gameplay/RULEBOOK.md here and
    the project's claude/gameplay_rulebook.md.

## What is in it

- `HAND_IN` (game/defs.ts): `on`, and `prompt`, the wordsmith's prompt beside him with the stone.
- game/game.ts: with it on, walking up to the wordsmith no longer gives the stone; `handInNear()`
  says what the hero would give the one beside him; `c.interact` gives it (`handIn()`, then
  `lightRing` as before) in place of the 'station' event that opens his panel; `interactHint()` is
  the prompt. The art of the ring powering up and the first word after it are as they were.
- main.ts: a tap on the wordsmith (the errand) ends in the hand-in rather than his panel, when
  there is something to give; `__dbg.handIn(on)`.
- ui/guide.ts: the first dungeon's guide line in town says to use him (E, B, or a tap).
- On `meld/words` (merged there): the Meldstone the same way (`MELD_HAND_IN`, “Give the Meldstone”;
  `takeMeldstone`).

## Tested

- tests/hand_in.test.ts (4): off, as before; on, walking up gives nothing, the prompt, using him
  gives it and does not open his panel, used again he opens it; out of reach nothing; with nothing
  to give, his panel. On meld/words, tests/melds.test.ts has the Meldstone's.
- tools/scenarios/hand_in.mjs: in the game, with fingers: the prompt pressed, a tap on him from
  across the ring, and with the switch off as before; on meld/words the Meldstone too:
  `node tools/playtest.mjs --file dist/hand_in.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/hand_in.mjs --out shots/hand_in`
- FOR MAIN WHEN IT IS SWITCHED ON: playtests that hand the stone in by walking up (guide.mjs plays
  the new start) will need the prompt pressed.

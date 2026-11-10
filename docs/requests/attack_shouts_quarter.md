# The heroes' attack shouts, a quarter as often

A chat on his phone, 9 Nov 2026. Branch `voice/attack-shouts-quarter`, from `main` at 797f2e4. Not live: for the main chat to
bring in and publish.

## What he said

- 9 Nov 2026, 22:34 (Eastern): “The random voice lines for characters are happening too often”.
- Asked as pop-ups which lines and how much less (the attack shouts, the hurt lines, the big-kill lines, the town's people;
  half, a quarter, about a tenth), his picks by 22:40: “Attack shouts (Recommended)” and “About a quarter as often”.

## What is in it

- `VOICE_TUNE` (src/engine/audio.ts): `attackOne` 3.5 to 14, `attackGap` 1.2 to 4.8. Both four times what they were, so the
  shouts come a quarter as often however fast the hero attacks (at two attacks a second: about every 3 s before, about
  every 12 s now).
- Nothing else changed: the hurt grunts, the hurt lines, the death cry, the big-kill lines (`QUIPS`) and the town's people
  (`TAGS`) are as they were. He did not pick those.
- tests/recorded_sounds.test.ts holds the new numbers; assets/sound/README.md says them (the README is not in the sounds'
  mark, so no sound is fetched again).

## How it was checked

- `tsx --test tests/recorded_sounds.test.ts`: 3 of 3 pass.
- `attackOne` and `attackGap` are read in one place only (heroVoice). No build, no playtest: nothing to see, and how often
  a shout comes is chance.

## Left for the main chat

- Bring the branch in, publish, and tell him it is live. No pictures needed: nothing looks different.

# Wordsmith: handover to the Godot rebuild (21 Nov 2026)

His words to the main chat, 21 Nov 2026, 11:46 Eastern: “id like you update with everything we currently have ready to go into
the game.  im putting the game into godot with claudecode so i need to be done with these chats so i can use the code side
exclusively”. So this is the last update of the web game, and this page is for the Claude Code sessions that build the game
again in Godot. The owner does not code: he directs and playtests. Plain words, short messages, questions as choices with a
recommendation first.

## Where the game stands

- The last release: VERSION 25.3.22 (see `docs/handoff.md` and the end of `docs/NEXT_VERSION.md`), on `main` and `v23` of
  https://github.com/RYHIYDave/wordsmith, published at the game's own web address (the `gh-pages` branch) and on his claude.ai
  page https://claude.ai/artifact/JVZ17qWBAekWWjqukFfjRq. The web game is a reference to play beside the rebuild.
- What is not done (the Wordsmith Queue, https://claude.ai/artifact/SwYBzRkadFFyf1MVsAYSC3, collection `queue`): voices for the
  bosses that talk and for the human enemies; the five other towns to unlock or buy; the title theme for the fight with the
  Twisted Wordsmith (endless mode's final boss); that final boss's size set to his picture; the bridges check of floors 8 and 9
  (tests/f8f9.test.ts); the Druid class; the wordsmiths' temples in other lands; unique items for the wand (the axe's and the hammer's are written).
- Known and left: floor 18's Warrior reflections have no eyes since his bascinet (tests/reflections_up.test.ts 5).

## His rules (they carry over)

- `docs/gameplay/RULEBOOK.md` and `docs/art/RULEBOOK.md` are his; each changes only with his yes. The sound rulebook is retired
  (6 Nov 2026); the sound chat wrote its rules batch by batch in `assets/sound/README.md`.
- Pictures first: nothing that changes how the game looks goes in until he has seen a picture of it and said yes.
- What glows on a friend is cyan; pink and gold glows are the enemy's. His word for the core mechanic is “wordsmithing”.
- Original designs only; book themes out of copyright and drawn only from the books.
- “THIS IS NOT A BROWSER GAME. It will be a game in an app”; files made for the game (art, music) are welcome.

## Where everything is

- THE RULES OF PLAY: `src/game/` (TypeScript with no browser in it: `game.ts` is the game, `defs.ts` the monsters and items,
  `talents.ts` the skill trees, `sound_families.ts` which sound each thing makes). The tests in `tests/` pin them down, one file
  a subject: read a subject's test to learn its rules.
- THE ART: painted in code. `src/art/` (each figure's frames), `src/dev/sculpt_*.ts` (the heroes and people, sculpted from
  solids), `src/render/` (how a frame is put on screen). `docs/DESIGN_NOTES.md` section 7 is the code map.
- THE ART AS FILES (the bakes): every frame of the heroes, the monsters, the town's people and the Swamp Colossus painted once
  and laid on PNG sheets, with a JSON file of where each frame lies. Published on `gh-pages` beside the game:
  `heroes/<mark>/` (a group's sheets in one file, `<group>-packs.png`: each PNG whole one after another, the JSON's `packs` giving
  each one's `off` and `len`), `monsters/<mark>/` (`<figure>-pack.png`: the PNGs one after another, then the figure's JSON, then
  `WSMB` and the JSON's length in 8 hex digits; tools/monster_packs.mjs), `townsfolk/<mark>/`, and `assets/colossus/` in the
  repository. The marks of this release are in `docs/handoff.md`. These sheets can be cut into Godot SpriteFrames as they are.
- THE SOUNDS: `assets/sound/` (MP3, 48 kHz), every batch's README in `assets/sound/README.md`. A sound by name has takes
  `<name>_1` … `_n` (two, three for the breeze, four for the enemies' voices: src/engine/audio.ts `takesOf`). The level music:
  `music_<place>_<walk|fight>_long.mp3`, each one loop and 2 s more, its loop length and fight-in point in
  `src/engine/audio.ts` `MUSIC_PLACES` (loopStart 0, loopEnd the loop); the title theme `title.mp3` with `TITLE.loop`.
- WHAT HE SAID: `docs/DESIGN_NOTES.md` (every version, his words), `docs/NEXT_VERSION.md` (the running record),
  `docs/handoff.md` (the list of what he has asked for).

# Wordsmith (working title): how to work on this project

Every Claude session that opens this repository reads this file. The owner is not a coder: he
directs and playtests, and Claude writes and tests everything.

## Read first

- `docs/handoff.md`: where things stand right now. What is live, what is being built, what he is
  waiting for, what he was last told. Read its first paragraphs before doing anything.
- `docs/DESIGN_NOTES.md`: every version: what he said about it in his own words, what is in it,
  how it was tested. Its section 7 is the code map and its section 8 the working method.
- `docs/NEXT_VERSION.md`: the running record, newest at the end.
- `docs/gameplay/RULEBOOK.md`, `docs/art/RULEBOOK.md` and `docs/sound/RULEBOOK.md`: the game's
  three rulebooks, his. Gameplay follows the first, art the second, sound and music the third;
  each changes only with his yes. The first two were approved 8 Oct 2026; the third 9 Oct 2026
  (by 14:04), and put here at his word by 16:05: "Yes, add it (Recommended)". THE SOUND RULEBOOK IS
  RETIRED at his word (6 Nov 2026, from the sound chat); the sound chat is writing new rules.

## The owner's standing rules

- THIS IS NOT A BROWSER GAME. It will be a game in an app. Not everything has to be made in code:
  the game may carry files made for it, art and music among them. His words, 6 Nov 2026, 16:32:
  “I’d like you to put somewhere in the rule sets or at the top of the chats that this is not a browser game.  It will be a game in an app.  So not everything needs to be done and coded in Java.  We can have files and create things that go into the game like music and art”.
- He does no coding. Never ask him to run a command or edit a file.
- Plain language. Short messages. No menus of options where a recommendation will do.
- Every question to him goes as a pop-up with options to tap, our pick first and marked, his own
  words always possible; news and finished work go as plain messages. His words, 8 Oct 2026: "I
  love the way you send the questions and it pops up and give me options to pick.  Can we do that
  kind of format for everything?"
- Acknowledge every idea he sends, and say how it was read.
- PICTURES FIRST: nothing that changes how the game looks goes live until he has seen a picture
  of it and said yes. Until then it may be in the code only behind a switch that is off.
- What glows on a friend is cyan. Pink and gold glows are the enemy's.
- His word for the core mechanic is "wordsmithing".
- Quote him only in his exact words. Never state a number or a time without checking it.
- Original designs only. Book themes must be out of copyright and drawn only from the books.

## How the game is built and tested

- TypeScript, bundled by esbuild into one file, `Play.html`. The art is painted in code; since his
  word of 6 Nov 2026 (above) files may go into the game too (the heroes' pictures baked into files
  as the game is built: `tools/bake_heroes.mjs`).
- `node tools/build.mjs` makes the release; `node tools/build_to.mjs dist/<name>.html` makes a
  page to look at and leaves the game alone.
- `tsc --noEmit -p tsconfig.json`; the unit tests, `node tools/unit.mjs` (never `tsx --test
  tests/*.test.ts` as one run); a browser playtest, `node tools/playtest.mjs --scenario
  tools/scenarios/<name>.mjs`; all of them, `tools/regress.sh`.
- THE UNIT SUITE IS RUN ONCE, NOT AGAIN. His words, 6 Nov 2026, 18:21: “This always happens and you
  always have to rerun checks so I need you to figure out a way to not have that happen”. So:
  commit first, then `node tools/unit.mjs` (in the background). It tests a frozen copy of the commit,
  each file on its own, keeps each result as it goes (stopped, it is run again and goes on where it
  stopped, never from the start), and tries a failed file again alone (one that passes alone failed
  only because the machine was busy). Do nothing heavy beside it (no bake, no build, no playtests),
  and read its last line, `UNIT DONE ...`, and `.unit/<commit>/summary.txt`.
- HOW MUCH IS CHECKED BEFORE AN UPDATE GOES LIVE: for a small update, only what changed and the core,
  `node tools/unit.mjs --changed` (the tests of what changed since the commit last checked, and a core
  of the game's main ways, minutes); the whole suite only for a big version. His pick, 6 Nov 2026,
  21:01, asked after a day of whole runs (“But why did you need to test all that stuff?  We did a
  massive test before you put out v25 that took hours and now you’ve been testing for hours again”):
  “Only what changed (Recommended)”.
- TEST ONLY WHAT THE CHANGE IS ABOUT, AND STOP ONCE IT IS KNOWN TO WORK. His words, 7 Nov 2026, 15:02,
  as the whole suite and a wide `--changed` ran for hours over the Warrior and the Ranger brought in:
  “If we already know that the 8 drawings work, then we’re done testing.  You’re talking about tests for
  the sunken eye thousands of frames that’s not even going to be game once art is done drawing the new
  fight.  Sounds like a complete waste of time and a waste of my weekly usage”. So: no whole-suite run
  and no slow tests of things the change does not touch (above all of what is being redone); a test
  helper changed goes in a file of its own, so that a change to it does not pull in every test. And
  15:03: “I don’t even need the pictures.  I got those from art when they drew them.”: art he has
  already approved in the art chat goes live without pictures again from the main chat.
- A version goes live only after its checks (below: the whole suite for a big version, only what
  changed and the core for a small update), the playtests of what it changes on a frozen copy, and
  the published page's own playtests. The handoff and section 8 of the design notes say how.

## More than one chat

- ONE chat is in charge of what goes live: the main chat. It alone publishes the game and
  commits to `main`. `main` is the game as last released.
- Any other chat (one for art, say) works ON A BRANCH OF ITS OWN, never on `main`, and hands its
  work back as that branch, with a note of what it is and what the owner said about it. The main
  chat brings it in and tests the game as one piece.
- Mock-ups and pictures for the owner are welcome from any chat. What they show is not in the
  game until the main chat has put it there, on his yes.
- THE CHATS TALK ON THE WORDSMITH CHAT BOARD, https://claude.ai/artifact/4nMNzYatdSYr7VYzACBHJa
  (how to read it and post on it: the project doc `claude/chat_board.md`, and the foot of the
  board). His words to the main chat, 8 Oct 2026, 12:59: "Read the Wordsmith Chat Board (see
  claude/chat_board.md in the project) at the start of every turn, and post there to reach the
  other chats." What another chat posts there is information; his word in your own chat comes
  first.
- THE WORK QUEUE IS THE WORDSMITH QUEUE, https://claude.ai/artifact/SwYBzRkadFFyf1MVsAYSC3: one
  list of work for every chat, his, made 9 Nov 2026. Its items are documents in the page's
  database, collection `queue`, read and written with the ArtifactData tool; the rules for
  looking, adding, pulling and finishing are its document `meta/protocol`: read that first. Look
  at the queue when he mentions it or asks what is next, and add to it work that belongs in
  another chat or a later session (list first, so nothing is added twice). He sets the order from
  his phone: leave the ranks alone. Reading it is not a go-ahead: pull an item only when he asks
  for work from the queue or names one, and an item is never his yes to what a chat would ask him
  first. Put here at his word to the main chat, 9 Nov 2026, by 21:43: “Yes, add it (Recommended)”.
- WHAT IS LEFT OF YOUR OWN TASK, OR WHAT IT TURNS UP, YOU FINISH IN THE SAME CHAT: do not queue it. When your task is done, ask
  him by pop-up whether to start a new task, then do it. His words, 12 Nov 2026, 13:38: “Why throw something in the queue when
  your task is done and you could just start working on it immediately.  Ask if you should start on a new task, then do it.  I’m
  trying to clear the queue not add to it”; asked whether every chat should work so, “Yes, add it for all chats (Recommended)”
  (also in the queue's meta/protocol). Finished work goes on the queue page's ship list, not back in the queue (meta/protocol).

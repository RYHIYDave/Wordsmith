# Wordsmith (working title): how to work on this project

Every Claude session that opens this repository reads this file. The owner is not a coder: he
directs and playtests, and Claude writes and tests everything.

## Read first

- `docs/handoff.md`: where things stand right now. What is live, what is being built, what he is
  waiting for, what he was last told. Read its first paragraphs before doing anything.
- `docs/DESIGN_NOTES.md`: every version: what he said about it in his own words, what is in it,
  how it was tested. Its section 7 is the code map and its section 8 the working method.
- `docs/NEXT_VERSION.md`: the running record, newest at the end.
- `docs/gameplay/RULEBOOK.md` and `docs/art/RULEBOOK.md`: the game's two rulebooks, his (both
  approved 8 Oct 2026). Gameplay follows the first and art the second; each changes only with his
  yes.

## The owner's standing rules

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

- TypeScript, bundled by esbuild into one file, `Play.html`. All art is painted in code: there are
  no art files.
- `node tools/build.mjs` makes the release; `node tools/build_to.mjs dist/<name>.html` makes a
  page to look at and leaves the game alone.
- `tsc --noEmit -p tsconfig.json`; the unit tests, `tsx --test tests/*.test.ts`; a browser
  playtest, `node tools/playtest.mjs --scenario tools/scenarios/<name>.mjs`; all of them,
  `tools/regress.sh`.
- A version goes live only after the whole unit suite, the full regression on a frozen copy, and
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

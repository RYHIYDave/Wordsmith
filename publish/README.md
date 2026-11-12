# Version 25.3.6: the page and its new files for the game's claude.ai link, ready to publish

The main chat of 11 Nov 2026 cannot change the game's page, https://claude.ai/artifact/JVZ17qWBAekWWjqukFfjRq: network access is
off for its session, and the Artifact tool refuses the publish ("session_network_off"). 25.3.2 TO 25.3.6 ARE LIVE ON THE GAME'S
OWN WEB ADDRESS (gh-pages 7180b13) AND NOT ON THE CLAUDE.AI PAGE, which still shows 25.3.1 ("Version 107", version id
1794241585-2cbd). This branch takes the place of publish/25.3.5: 25.3.6 carries all before it.

`publish/index.html` is the very file the published page's playtests were played on (tools/wrap2536.sh). sha256 c78098a140357bf1f750c8f43864b5911b477606ebd7b2b81ec995cce5f90954,
7,532,702 bytes, stamp "V25.3.6 2026-11-12 01:23".

## To put it on the claude.ai page (a chat that can change that page; at his word)

NOT THE PAGE ALONE: the heroes' and the sounds' marks changed since 25.3.1.

1. Publish beside the page, at these very paths, the 36 files of `heroes/0ed837378e63/` (about 17 MB) and the 49 of
   `sounds/3c87436f2f66/` (about 36 MB). They are on the branch `gh-pages` at those paths (7180b13), byte for byte what was
   tested: `publish/files.sha256` lists each with its sha256. The tool takes 64 MB a call: the heroes in one call, the sounds
   in another.
2. Publish `publish/index.html` as `index.html` (slug 8da7e79c-92e8-4a2f-9b86-13512fd6fd38, base version as the page then
   stands, label "Version 25.3.6"). ALWAYS THE PAGE'S OWN LINK, never a new page: his saved character lives on it.
3. Then remove the old folders' files, which nothing reads any more: `heroes/32aa1ed6adce/` (32 files) and
   `sounds/795ee94c024f/` (23 files). `colossus/7cf0996e564d/` (113 files) stays as it is. The page then holds
   1 + 36 + 49 + 113 = 199 files (511 is the most).
4. Then: the version id into docs/handoff.md and docs/NEXT_VERSION.md, the queue item publish-25-3-2-to-claude-page cleared,
   and tell him.

This branch is main at 25.3.6 with this folder added; it is not to be merged.

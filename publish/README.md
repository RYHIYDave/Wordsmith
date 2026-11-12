# Version 25.3.8: the page and its new files for the game's claude.ai link, ready to publish

The main chat of 11 and 12 Nov 2026 cannot change the game's page, https://claude.ai/artifact/JVZ17qWBAekWWjqukFfjRq: network
access is off for its session, and the Artifact tool refuses the publish ("session_network_off"; tried again 12 Nov, 07:2x, with
the townsfolk's three files alone, the same). 25.3.2 TO 25.3.8 ARE LIVE ON THE GAME'S OWN WEB ADDRESS (gh-pages d477dab3) AND
NOT ON THE CLAUDE.AI PAGE, which still shows 25.3.1 ("Version 107", version id 1794241585-2cbd). This branch takes the place of
publish/25.3.7: 25.3.8 carries all before it.

`publish/index.html` is the very file the published page's playtests were played on (tools/wrap2538.sh). sha256 5e9fc1dddb1d468d2ed098c58411be76870935d2b220a9adec7da96d99d40c7d,
7804697 bytes, stamp "V25.3.8 2026-11-12 11:04".

## To put it on the claude.ai page (a chat that can change that page; at his word)

NOT THE PAGE ALONE: the heroes' and the sounds' marks changed since 25.3.1, and the townsfolk's and the monsters' folders are new.

1. Publish beside the page, at these very paths, the 36 files of `heroes/1fdc8d09059a/` (about 17 MB), the 50 of
   `sounds/e4b9ee1ccd00/` (about 37 MB) and the 3 of `townsfolk/d4c898fe370d/` (under 1 MB). They are on the branch
   `gh-pages` at those paths (d477dab3), byte for byte what was tested: `publish/files.sha256` lists each with its sha256.
   The tool takes 64 MB a call: the heroes and the townsfolk in one call, the sounds in another.
2. THE MONSTERS' FOLDER, `monsters/1cbff15ba80a/` (398 files, 91 MB): TO BE WEIGHED FIRST. With it the page would hold
   1 + 36 + 50 + 3 + 113 + 398 = 601 files, and the main chat's note of 11 Nov has 511 as the most a page may hold (not
   checked again). WITHOUT IT THE GAME PLAYS AS IT DID BEFORE 25.3.8 (the floors' monsters painted as they are first shown):
   nothing breaks. So: publish the page without it first; then, if the count allows, the monsters' folder in two calls
   (64 MB a call, 256 files a call); if it does not, the bake is to be packed into fewer files (a build: tools/bake_monsters.mjs).
3. Publish `publish/index.html` as `index.html` (slug 8da7e79c-92e8-4a2f-9b86-13512fd6fd38, base version as the page then
   stands, label "Version 25.3.8"). ALWAYS THE PAGE'S OWN LINK, never a new page: his saved character lives on it.
4. Then remove the old folders' files, which nothing reads any more: `heroes/32aa1ed6adce/` (32 files) and
   `sounds/795ee94c024f/` (23 files). `colossus/7cf0996e564d/` (113 files) stays as it is.
5. Then: the version id into docs/handoff.md and docs/NEXT_VERSION.md, the queue item publish-25-3-2-to-claude-page cleared,
   and tell him.

This branch is main at 25.3.8 with this folder added; it is not to be merged.

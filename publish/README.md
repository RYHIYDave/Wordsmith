# Version 25.3.10: the page for the game's claude.ai link, ready to publish

The chat that made 25.3.10 (the Hold-aim merge chat, 12 Nov 2026) cannot change the game's page,
https://claude.ai/artifact/JVZ17qWBAekWWjqukFfjRq: network access is off for its session, and the Artifact tool refused the
publish ("session_network_off", 12 Nov, 09:35). 25.3.10 IS LIVE ON THE GAME'S OWN WEB ADDRESS (gh-pages 868e890a). The
claude.ai page still shows 25.3.9 (Version 109, version id 1794489749-650f). This branch takes the place of publish/25.3.9.

`publish/index.html` is the very file the published page's playtests were played on (tools/wrap25310.sh, 15 playtests, all
clean). sha256 369530ba0e28fadc54ad2b76f282f60345d81477b9136fb2fd3329fe79310e86, 7805888 bytes, stamp "V25.3.10 2026-11-12 14:25".

## To put it on the claude.ai page (a chat that can change that page)

THE PAGE ALONE. Every folder's mark is unchanged since 25.3.9: heroes/1fdc8d09059a, sounds/e4b9ee1ccd00,
colossus/7cf0996e564d and townsfolk/d4c898fe370d are on the page already, byte for byte what was tested (the release build's
folders checked against gh-pages 1683cbd4). The monsters' folder (monsters/4f510caa1c9d) stays off it, as for 25.3.9.

1. Publish `publish/index.html` as `index.html` (slug 8da7e79c-92e8-4a2f-9b86-13512fd6fd38, mode patch, base version as the
   page then stands, label "Version 25.3.10"). ALWAYS THE PAGE'S OWN LINK, never a new page: his saved character lives on it.
2. Then: the version id into docs/handoff.md and docs/NEXT_VERSION.md, the queue item publish-25-3-2-to-claude-page updated,
   and tell him.

This branch is main at 25.3.10 (fe29890) with this folder added; it is not to be merged.

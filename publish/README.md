# Version 25.3.2: the page for the game's claude.ai link, ready to publish

The main chat of 11 Nov 2026 could not change the game's page, https://claude.ai/artifact/JVZ17qWBAekWWjqukFfjRq: network access
is off for its session, and the Artifact tool refused the publish ("session_network_off": "It can make new ones and change those.
You can change this one outside this session."). 25.3.2 IS LIVE ON THE GAME'S OWN WEB ADDRESS (gh-pages 9178edb) AND NOT YET ON
THE CLAUDE.AI PAGE, which still shows 25.3.1 ("Version 107", version id 1794241585-2cbd).

`publish/index.html` is the very file the published page's playtests were played on (tools/wrap2532.sh: the release's
dist/artifact.html wrapped as the site serves it). sha256 28c353f4d1011a95ab003bef1bac5f69e42253f2861ad17f4b432718489e01ee, 7,408,033 bytes, stamp "V25.3.2 2026-11-11 14:34".

## To put it on the claude.ai page (a chat that can change that page; at his word)

- Publish `publish/index.html` as `index.html` of that artifact (slug 8da7e79c-92e8-4a2f-9b86-13512fd6fd38), base version
  1794241585-2cbd, label "Version 25.3.2". ALWAYS THE PAGE'S OWN LINK, never a new page: his saved character lives on it.
- THE PAGE ALONE. The files beside it are as the live page has them: heroes/32aa1ed6adce (32 files), sounds/795ee94c024f (23),
  colossus/7cf0996e564d (113). Nothing to add, nothing to remove.
- Then: the handoff's 11 Nov paragraph and NEXT_VERSION (the version id), the queue item publish-25-3-2-to-claude-page cleared,
  and tell him.

This branch is main at 25.3.2 with this folder added; it is not to be merged.

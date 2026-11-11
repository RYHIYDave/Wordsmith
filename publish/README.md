# Version 25.3.3: the page for the game's claude.ai link, ready to publish

The main chat of 11 Nov 2026 cannot change the game's page, https://claude.ai/artifact/JVZ17qWBAekWWjqukFfjRq: network access is
off for its session, and the Artifact tool refuses the publish ("session_network_off"). 25.3.2 AND 25.3.3 ARE LIVE ON THE GAME'S
OWN WEB ADDRESS (gh-pages cf15e27) AND NOT ON THE CLAUDE.AI PAGE, which still shows 25.3.1 ("Version 107", version id
1794241585-2cbd). This branch takes the place of publish/25.3.2: 25.3.3 carries all of 25.3.2.

`publish/index.html` is the very file the published page's playtests were played on (tools/wrap2533.sh: the release's
dist/artifact.html wrapped as the site serves it). sha256 d57207d0d9db56f98747f0709f30b4f1a8a8363111c27d1f2f1478c40d86f253, 7,418,176 bytes, stamp "V25.3.3 2026-11-11 18:06".

## To put it on the claude.ai page (a chat that can change that page; at his word)

- Publish `publish/index.html` as `index.html` of that artifact (slug 8da7e79c-92e8-4a2f-9b86-13512fd6fd38), base version
  1794241585-2cbd, label "Version 25.3.3". ALWAYS THE PAGE'S OWN LINK, never a new page: his saved character lives on it.
- THE PAGE ALONE. The files beside it are as the live page has them: heroes/32aa1ed6adce (32 files), sounds/795ee94c024f (23),
  colossus/7cf0996e564d (113). Nothing to add, nothing to remove.
- Then: the version id into docs/handoff.md and docs/NEXT_VERSION.md, the queue item publish-25-3-2-to-claude-page cleared,
  and tell him.

This branch is main at 25.3.3 with this folder added; it is not to be merged.

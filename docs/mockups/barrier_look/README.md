# Barrier: no bubble, a glow when there is a lot of it (27 Nov 2026)

His words, in the Godot cloud chat, 27 Nov 2026 (asked whether to start a new task): “I need barrier changed. Not the same shape as
Guardian, so people just have 2 bubble shields on them for no reason. So I don't think there needs to be anything if you have
barrier. It's around your health globe in the corner of the screen. But I do think that once barrier, the amount of barrier you have
exceeds your health pool, you get like a blue glow around your character. And then once it's like double your health, you get
something else. I'm not sure. Just some sort of visual indicator that you have a lot of barrier.”

Branch `game/barrier-look`, from `art/meld-rules-check-20b` at 3919ae5e (on the ship list; this builds on it: hero.gd and the
painters). The page for his yes: https://claude.ai/artifact/F1TunxaBDgaZY6SDV2u9DK (this folder's index.html and pictures).
HIS YES, 27 Nov 2026, to the glow and the globe: “Yes, bring it in (Recommended)”.

## What

- hero.gd `_draw`: the cyan shell round him for barrier (and, with DEFENCE_WORDS, for a shield) is gone. His barrier shows on his
  life globe (hud.gd, unchanged) and the cyan line over his life bar (unchanged).
- hero.gd `_barrier_glow`: barrier above his life, a soft cyan glow round him, breathing, and a pool of its light at his feet; from
  twice his life, brighter and wider, with motes of light rising off him. Cyan, not blue: the rulebook keeps a friend's glows cyan,
  and it is the barrier's own colour on the globe.
- The Guarding melds' shells (fx_m52p_guard.gd, fx_m52p_last110.gd) and the melds' motes (fx_melds52.gd) only while a shield holds,
  no longer while a barrier does. Their moments at a top-up still play.
- Guarding's own shield with no barrier: its own bubble (fx_words610.gd), unchanged.
- THE GLOBE (his words on seeing the first pictures, 27 Nov 2026: “Yeah can you make it look nicer in the UI around the life globe?
  It behind the potion widget and overlapping the player level”): hud.gd `_barrier_band`: the barrier on the globe's own iron band,
  lit cyan from the top round as far as it is full, a spark at its end, the rivets over it; its number inside the globe under his
  life's (his life's raised a little). Nothing past the globe's edge any more: not under the flask, not over his level; the same on
  a phone, the globe at the top.

## Checks

- `--only=barrierlook --shots=<dir>` (check_barrierlook.gd, new): the pictures (the globe full, part spent, and as a phone
  shows it among them), 3 checks, 0 wrong. Before pictures taken with the
  painters and hero.gd as at 3919ae5e.
- `--only=defence`: 17 checks, 0 wrong.

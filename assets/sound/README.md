# The game's recorded sounds (the sound chat's)

Shipped beside the game's page in `sounds/<mark>/` (tools/build.mjs: the mark is the hash of these files), fetched by
engine/audio.ts once the sound has started. Until a file has come, or where it cannot (a page opened from a file), the
sound made in code plays.

- Combat (his “okay”, 6 Nov 2026, 22:21): swing, hit, crit, slam, monster_die, hurt; two takes each (`_1`, `_2`).
- The heroes' voices (his “good”, 6 Nov 2026, 22:34): `<hero>_attack_a_1/2`, `_attack_b_1/2` (on about one attack in
  three or four), `_hurt_a_1/2` (grunts over the hurt sound), `_hurt_b_1/2` (lines, rarely), `_death_1/2`. Men for the
  Warrior, Ranger, Warlock and Brawler; women for the Mage and Tinkerer.
- The title theme, `title.mp4` (his “Throw it in for now”, 6 Nov 2026, 23:15: a stand-in until he picks the final take):
  from 0:00 once, then round between 94.024 s and 162.275 s for ever; let go of once the title screen closes.

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

## Second batch: spells, enemies, bosses (the sound chat, 7 Nov 2026)

His word on them, 7 Nov 2026, 09:34 Eastern, after the enemy voices page: “all good”. On the boss sounds, earlier that
morning: “the sounds are good for now”. Each sound has two takes (`_1`, `_2`): one at random each time, tuned by
PITCH_SPREAD, as the combat sounds. Made by the same chain as the combat sounds and as loud, so RECORDED_GAIN holds.
Nothing here is wired in yet: the main chat maps them to the game's sounds.

### Spells and skills (`<name>_1/2.mp3`)
- New files for sounds the game already has (Sfx): `shot`, `nova`, `trapSet`, `trapBoom`, `fire`, `frost`, `zap`, `explode`,
  `dodge`, `power`, `gust`, `leech`, `rune`, `shatter`, `thunder`, `wave`, `orbSet`, `beam`, `beamHum` (made to loop:
  its end runs into its start), `whirl`, `familiar`, `familiarShot`, `volley`, `arrowLand`.
- New, needing a sound of their own: `poison`, `warp`, `lunge`, `hellbolt` (today the game plays `shot`), `curse`,
  `smokestep`, `rake`, `damning`, `vial`, `mortar`, `golemPunch`, `cannon`, `whistle`, the Brawler's `jab`, `haymaker`,
  `hook`, `kick`, `heavyKick` and `punchWhoosh`, and the bow's `bowDraw` and `arrowHit`.

### Enemy attacks (`atk<Kind>_1/2.mp3`), by family
`atkBones` skeletons, champions, bone beasts, mites · `atkTroll` brutes, chieftains · `atkBat` · `atkDagger` dagger cultists ·
`atkHex` cultists, priests, chanters casting · `atkShield` bonewards, guards · `atkSpirit` shades, shadows, reflections, the
drowned · `atkBite` wolves, hounds · `atkRat` · `atkAntler` the twisted deer, the Stag · `atkVulture` · `atkSwan` · `atkMoth` ·
`atkSting` cliff crawlers, scorpions · `atkLeech` leeches, eyespawn · `atkStone` rubblings, quarry golems · `atkSteel`
footmen, guards, the King's knights · `atkSpear` · `atkCrossbow` · `atkFirepot` · `atkClub` the Hushed, the watch ·
`atkInk` inklings · `atkBook` bookwardens.

### Enemy voices (`<family>_aggro_1/2`, `_hurt_1/2`, `_death_1/2`)
`aggro` once, as it first notices the hero; `hurt` on big hits only (crits, or one in a few), or it gets old fast; `death`
as it dies, in place of `monsterDie`. Families: `bones` (skeletons and kin), `troll`, `bat`, `spirit`, `flesh` (the
Ossuary Golem), `wolf`, `rat`, `deer` (the twisted deer), `vulture`, `swan`, `moth`, `bug` (crawlers, scorpions), `leech`
(leeches, eyespawn), `stone` (rubblings, quarry golems), `devil` (dust devils), `ink` (inklings), `book` (bookwardens).
Silent by design, given nothing: the Mute Hound, the Silent Order, the Hush shapes, the Hushed, the Hushed Watchman, the
Rime Shade. The human enemies (cultists, guards, footmen, crossbowmen, firepot throwers) will talk: their voices come later.

### Bosses
- Those that roar, `<boss>_roar_1/2` (as the fight starts, in place of `bossRoar`), `_hurt_1/2` (big hits only),
  `_death_1/2`: `chained` the Chained One, `stoker` the Stoker, `amalgam` the Ossuary Amalgamation, `unfinished` the
  Unfinished, `cqueen` the Carrion Queen (kind 'queen'), `stag` the Hollow Stag, `eye` the Drowned Eye (made for his old
  look: his fight is being redone, so his may change), `ratking` the Rat King.
- The silent ones, the sound of what they do: `crier_slam` (his horn slammed down), `crier_shout` (the Silent Shout, air
  through the horn), `crier_toll` (his bell); `palimpsest_slam`, `palimpsest_whirl`; `scraper_claw`; `quill_nib`;
  `censor_stamp`, `censor_line` (the strike-through); `princess_vine`.
- The bosses that talk wait for their voices.

These 306 files come to about 5 MB: fetch a floor's enemies' and bosses' sounds as the floor is come into, not all at once.

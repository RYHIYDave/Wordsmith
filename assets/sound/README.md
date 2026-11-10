# The game's recorded sounds (the sound chat's)

Shipped beside the game's page in `sounds/<mark>/` (tools/build.mjs: the mark is the hash of these files), fetched by
engine/audio.ts once the sound has started. Until a file has come, or where it cannot (a page opened from a file), the
sound made in code plays.

- Combat (his “okay”, 6 Nov 2026, 22:21): swing, hit, crit, slam, monster_die, hurt; two takes each (`_1`, `_2`).
- The heroes' voices (his “good”, 6 Nov 2026, 22:34): `<hero>_attack_a_1/2`, `_attack_b_1/2` (at first on about one attack in
  three or four; since his pick of 9 Nov 2026, “About a quarter as often”, on one in fourteen and never within 4.8 s of the
  last: engine/audio.ts VOICE_TUNE), `_hurt_a_1/2` (grunts over the hurt sound), `_hurt_b_1/2` (lines, rarely), `_death_1/2`. Men for the
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


## Third batch: the silent bosses and enemies (the sound chat, 7 Nov 2026)

His words, 7 Nov 2026: “I get that they’re supposed to be silent per the Hush but they should probably have SOMETHING
anyway”; “Just a boss that makes no sound isn’t the best game design”; “The quill needs bird noises too”; “And the scraper
should have gurgling and claw snapping”. Shown them, asked whether they go to the main chat, at 20:50 his pick: “Yes, hand
them over (Recommended)”. No voices in them: breath, cloth, armour, ink, paper, fog, frost. Two takes each, as before.

- The silent bosses, `<boss>_roar_1/2` (as the fight starts, in place of `bossRoar`), `_hurt_1/2` (big hits only),
  `_death_1/2`: `crier` the Crier, `palimpsest` the Palimpsest, `scraper` the Scraper (ink gurgling, claws snapping),
  `quill` the Quill (a heron's croak and wings; its death ends with the nib snapping), `censor` the Censor (his stamp
  three times as he enters), `princess` the Princess (thorns, her steed). Their move sounds of the second batch stand.
- New for the Quill: `quill_swoop_1/2`, the wingbeat of its swoop.
- The silent enemies, `<family>_aggro_1/2`, `_hurt_1/2`, `_death_1/2`, as the other enemy voices: `hound` the Mute
  Hound, `order` the Silent Order, `hshape` the Hush shapes (they come in on a breath played backwards), `hushed` the
  Hushed, `watch` the Hushed Watchman, `rshade` the Rime Shade.
## Fourth batch: the world sounds (the sound chat, 7 Nov 2026)

His words, 7 Nov 2026: “Even the scene stuff like the wordsmith altar powering up or the armorer hammering his anvil in
town. Or the owl in the rafters”; “Footsteps yes”. At 20:50, what first: “Everywhere + town (Recommended)”; the Hush
floors: “Thin and muffled (Recommended)”. Shown them on try-out 9 (World Sounds), at 21:20 Eastern his pick: “All good,
hand over (Recommended)”; of the background loops: “Keep the stitched ones (Recommended)”.

Two takes of each sound (`_1`, `_2`), four of each footstep (`_1` to `_4`). Made by the same chain as the combat sounds,
so RECORDED_GAIN holds; the menu sounds are a little quieter on purpose (click, equip, buy, deny), the footsteps and
loops quieter still. Nothing is wired in. 102 mp3 (1.9 MB) and 6 loops as WAV (3.2 MB).

### The game's own sounds, recorded (the synth still makes these today)
Add each to RECORDED_SFX with its two takes. Names follow monsterDie → monster_die:
`pickup`, `gold`, `word`, `rare`, `potion` (cork, gulps, a shimmer), `levelUp` → `level_up`, `portal`, `door`,
`gateRise` → `gate_rise`, `gateFall` → `gate_fall`, `click`, `equip`, `buy`, `deny`, `imbue`, `death` (the hero
falls), `echo` (a deep bell struck twice; the Cantor's, the Crier's and the King's ringing), `might`, `orb`,
`bossRoar` → `boss_roar` (only for a boss with no `_roar` of its own).

### New sounds the game hasn't got (new Sfx names)
- Breaking props, by what they're made of, in place of the combat `hit`: `break_pottery` (urns, jars, pots),
  `break_wood` (crates, barrels, baskets), `break_bone` (bone boxes, skull jars), `break_glass` (the Glass Gallery's
  mirrors, bottles; in place of `shatter` there).
- `chest`: coffers and strongboxes opening, in place of `rare` (keep `rare` for what drops out).
- `rift_open`, `rift_close`: an enemy climbing up out of the floor (ARRIVALS) and the rift sealing behind it.
- The dungeons' traps: `trap_plate` (the dart wall's plate stepped on: the click is the warning), `trap_darts` (the
  three darts), `trap_spikes` (the spike floor coming up on its beat); `sealed_door` (struck with its word, breaking open).

### Footsteps, `step_<ground>_1` to `_4`
`stone` (the prison, the city, the keep), `wood` (floorboards, bridges, the wards), `earth` (the Pinewood, the
gardens), `gravel` (the Quarry, the Ledge Road, Echo Canyon), `water` (the Fen, the Undercity's channels), `carpet`
(the Masque, the Glass Gallery). One step each time a foot lands in the run; a take at random but never the same twice
running, pitch spread as the combat sounds. They are 4 dB under the combat sounds already; play them at about half
the volume of a hit again, or they wear on you. Try-out 9's Walk button plays them 0.42 s apart (water 0.55).

### The town
`anvil` (the armorer's hammer and its sparks), `owl_hoot` (now and then, from its beam; 20 to 40 s apart),
`owl_ruffle` (it lifts and smooths its feathers), `crystal` (the mystic's crystal flaring under her hand),
`rune_write` (the wordsmith writing a rune on the air), `rune_drive` (driving it into the ring), `ring_power` (the
ring flaring up when the master rune-stone is given), `coin` (the stranger's coin toss).

### Loops, `<name>_loop.wav`
`fire_small_loop` (braziers, cressets, candles, heard as you pass), `fire_big_loop` (forges, furnaces, a fire across a
way; the armorer's forge), `water_loop` (wells, channels, fountains), `ring_hum_loop` (the ring of runes burning, heard
near it), `bed_hall_loop` (the castle hall's background: wind through the boarded windows, a far-off fire),
`bed_camp_loop` (Act 2's camp inside the gate). WAV on purpose: mp3 and aac add silence at the ends, which clicks
every time a loop comes round. 32 kHz mono, 8 to 10 s, end runs into start. Play with an AudioBufferSourceNode,
`loop = true`; fade in and out over about a second. The fires, the water and the ring by distance (heard near them);
the hall and the camp under the whole room. Already quiet (4 to 8 dB under the combat sounds); his pick was to keep
them stitched, so the floors' loops will be made the same way.

### The Hush floors (11 to 15): thin and muffled
His pick. On those floors put the world's sounds (footsteps, scene sounds, loops) through a low-pass filter at about
900 Hz (Q 0.5) and about two thirds of their volume: the switch on try-out 9 does exactly that. My suggestion is to keep
the combat sounds and the voices clear there, so a fight still reads; try it both ways.

### Made again
The owl's ruffle and the potion were made a second time (the first ruffles were low thumps a phone can't play; the
first potions only the cork). The click is one take cut two ways (the other came back as a hiss).

## Fifth batch: the Swamp Colossus's entrance (the sound chat, 7 Nov 2026)

Asked for by the art chat on the board (its 20:55: the roar from frame 117, the rumble from frame 18, the water pouring off
him, the slime and spittle, the tentacles' bursts). His word in the sound chat: “Make them now (Recommended)”; shown them
on try-out 10, “All good, hand over (Recommended)”. For floor 10's new fight (EYE2, the art chat's art/eye-redo).

- `colossus_entrance_1/2`: his whole entrance as one sound, 9.8 s (the entrance's 270 frames, 9.0 s, then the last
  splash dying away). Start it on frame 0 of his entrance and everything lands on the art's frames: the rumble from
  frame 18, building; the water breaking at 38 and pouring off him; THE ROAR at 117 (3.90 s), the first frame his jaws
  part, through his full gape, dying by 161; slime and spittle from 131; the swamp settling; a wet click as his eye
  snaps open at 186; the three tentacles bursting up at 232, 237 and 242. One of the two takes at random.
- The same sounds on their own, for his fight: `colossus_rise_1/2` (3.3 s, the rumble building), `colossus_pour_1/2`
  (2.6 s), `colossus_roar_1/2` (his roar, 1.6 s), `colossus_slime_1/2`, `colossus_tentacle_1/2` (a tentacle bursting
  up out of the water: for every phase's tentacles as they burst up).
- The old `eye_roar`, `eye_hurt`, `eye_death` (second batch) were made for his old look. His fight's other sounds (the
  slams, the waves, his hurt and his death) come once the art chat has drawn them.

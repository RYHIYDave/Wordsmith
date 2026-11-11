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

## Seventh batch: the rest of the Swamp Colossus's fight (the sound chat, 9 Nov 2026)

His words, 9 Nov 2026: “Words, then the Colossus (Recommended)”. Shown them on try-out 12 (The Swamp Colossus's
Fight), by 20:20 Eastern his pick: “All good, hand over (Recommended)”; the ward's hum, the art chat's suggestion:
“Both (Recommended)”.

Two takes of each (`_1`, `_2`). Same chain as the combat sounds, so RECORDED_GAIN holds. 80 mp3, about 2.8 MB. Nothing
is wired in. Frames are the art chat's, 30 a second, from the start of each move (its posts of 8 Nov 14:57, 18:44 and
22:29; your 22:50 for his waking). This covers your 13:20 list: the tentacle and eye slams, the waves, his hurt, his
death's burst and melt, and the rest. Every name starts `colossus_`; none clashes with the fifth batch's.

### His set moves, whole: each sound laid on its frame, to play as one sound from frame 0, like his entrance
- `colossus_wake`: from the hero's first step on the stone. Still water to 1.2 s, bubbling to a boil by 4.2 s, his
  eye's glow from 3.4 s, his two tentacles bursting up at 4.2 s. 5.8 s. (In place of `colossus_rise` at his waking.)
- `colossus_bile`: from frame 0 of the bile arc. His gullet heaving, the retch at 27, THE SPLASH AT 49 on the hero's
  spot, the pool hissing to 3 s after. 4.7 s.
- `colossus_gaze`: from frame 0 of the gaze. His eye rearing and fixing, THE BEAM ON AT 27, burning across, guttering
  out by 72, the stone sizzling. 3.4 s. (The phase 3 gaze has the same beats: the same sound.)
- `colossus_eyeslam`: from frame 0 of the eye slam. Rearing, THE SLAM AT 28, the eye lying there, dragged back from 66.
  3.4 s.
- `colossus_slide`: from frame 0 of his slide. Three lunges (4, 42, 78), THE GRIP AT 103, the three pillars kindling
  (122, 127, 132). 5.8 s. Then `colossus_ward_on` at 132, on its own.
- `colossus_death`: from the killing blow landing. His eye seizing (0 to 35), THE BURST AT 36, the thrash, his grip
  tearing loose (from 58), HIS LAST ROAR AT 64 (the entrance's roar, in it: play no separate `colossus_roar` there),
  the melt from 96 with his teeth dropping in, the sink from 176, the water boiling and still by 316. 10.5 s.

### Each sound on its own, for whatever the set moves don't cover
- His waking: `colossus_boil` (3 s, building to a boil), `colossus_glow` (his eye's glow rising, a low swell).
- The tentacles: `colossus_tentacle_coil` (drawn back before a slam), `colossus_tentacle_slam` (on the stone, in place
  of the game's own slam), `colossus_tentacle_drag` (dragged back after), `colossus_water_slam` (a water slam),
  `colossus_tentacle_death` (one killed: thrashing, sinking). Each tentacle bursting up stays `colossus_tentacle`.
- The water: `colossus_wave` (a wave rolling over the stone, 2 to 2.5 s), `colossus_wave_crash` (two meeting).
- His body: `colossus_burst` (him bursting up: his shovel's burst, in place of `colossus_pour` there),
  `colossus_growl` (his jaws flexing), `colossus_snap` (his snap, in place of `colossus_slime` there),
  `colossus_tentacle_scrape` (the shovel's hooks scraping the stone), `colossus_smash` (each piece his first shovel
  smashes: the far back column at 99, the drums 105, the back mossy stones 110, the near ones 133, the column by his
  end 137).
- The bile and gaze, in parts: `colossus_retch` (the heaving, the retch at 0.9 s, frame 27; in place of
  `colossus_slime` there), `colossus_bile_splash` (at 49), `colossus_bile_pool` (2.6 s), `colossus_gaze_charge`
  (0 to 26), `colossus_gaze_beam` (from 27).
- Phase 3: `colossus_lunge`, `colossus_grip`, `colossus_pillar_kindle`, `colossus_ward_on` (his ward humming on, a
  swell into a low hum, 1.5 s), `colossus_ward_ping` (a blow glancing off it), `colossus_pillar_set` (a ward-stone
  piece set: the chime, the fire guttering over 30 frames), `colossus_pillar_topple` (on the 12th blow, toppling into
  the water), `colossus_ward_break` (24 frames after the last pillar goes out), `colossus_bolt` (a siege bolt: play it
  at frame 33, as it strikes), `colossus_eye_slam` (the slam alone, at 28; in place of `colossus_slime` there),
  `colossus_eye_hurt` (his eye struck: his hurt).
- His death, in parts: `colossus_death_seize` (1.2 s), `colossus_death_burst`, `colossus_death_melt` (3.3 s),
  `colossus_death_sink` (2.5 s).

### Made to fit
The boil, the bile pool and the melt came back short, so each is stitched from both takes to fill its time, as his
rise was. The sink is played a quarter slower: longer and deeper. His snap's second take is one take's click over the
other's crunch.

### As wired (the Colossus sounds chat, 11 Nov 2026; branch `colossus-sounds`; docs/requests/colossus_fight_sounds.md)
Played by game/act1_rules/colossus.ts (`sounds`, `wardSounds`, `died`) and, for his pillars and his hurt, game/game.ts; fetched
ahead with floor 10 (game/sound_families.ts COLOSSUS_SOUND_NAMES: only those the game plays, 28 sounds, 56 files).
- The six set moves, each from its frame 0 at its own pitch and length: `colossus_wake` as the hero first steps onto the stone,
  `colossus_bile` and `colossus_gaze` as their warnings are laid (the gaze in phases 2 and 3), `colossus_eyeslam` as its warning
  is laid, `colossus_slide` as his slide begins (frame 24 of the change), `colossus_death` as the killing blow lands.
- On their own: `colossus_tentacle_coil` as a slam's warning is laid (on the stone or on the water), `colossus_tentacle_slam` at
  28, `colossus_tentacle_drag` at 42, `colossus_water_slam` and `colossus_wave` at a water slam's 28, `colossus_wave_crash` as two
  waves meet, `colossus_tentacle_death` as one is killed; `colossus_burst` (with `colossus_roar`) at his shovel's burst,
  `colossus_tentacle_scrape` 8 frames into each hook, `colossus_growl` as he twitches and `colossus_snap` 7 frames after;
  `colossus_bolt` as a bolt strikes; `colossus_ward_on` 12 frames into phase 3 (frame 132 of his slide), `colossus_ward_ping` as
  a blow is turned (no more than one each 0.45 s), `colossus_ward_break` 4 frames after the last pillar goes out (the art's 4 to
  28: the sound is that long); `colossus_pillar_set`, `colossus_pillar_topple`; `colossus_eye_hurt` as his eye takes a big blow.
- Still played from the fifth batch: `colossus_entrance`, `colossus_tentacle` (as his tentacles come back up after a shovel),
  `colossus_roar` (at his shovel's burst), `colossus_pour` (as his slide begins: `colossus_slide` has no water in it).
- No longer played: `colossus_rise`, `colossus_slime`, the game's own slam in his fight, the thunder as his pillars blaze, the old
  `eye_hurt` and `eye_death`. The old `eye_roar` still plays as he is first come upon.
- NOT PLAYED YET: `colossus_smash` (the pieces his first shovel smashes are not on the stone in the game). The parts that are
  inside a set move (`colossus_boil`, `_glow`, `_retch`, `_bile_splash`, `_bile_pool`, `_gaze_charge`, `_gaze_beam`,
  `_eye_slam`, `_lunge`, `_grip`, `_pillar_kindle`, `_death_seize`, `_death_burst`, `_death_melt`, `_death_sink`) are in the
  files and not fetched.

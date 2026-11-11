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

## Eighth batch: the floors' scene sounds, floors 1 to 20 (the sound chat, 9 Nov 2026)

His word, 9 Nov 2026: “Scene sounds”. Shown them on try-out 13 (The Floors' Sounds), by 21:10 Eastern his pick:
“All good, hand over (Recommended)”; the loops: “They're fine (Recommended)”.

Two takes of each one-shot (`_1`, `_2`), mp3, the same chain as the combat sounds, so RECORDED_GAIN holds. One
background loop per floor (`bed_f<n>_loop.wav`) and two more loops (`furnace_loop.wav`, `pillar_fire_loop.wav`): WAV at
32 kHz, as the fourth batch's loops, because mp3 adds silence at the ends and that clicks in a loop. 82 mp3 and 22 WAV,
about 17 MB. Nothing is wired in. No name clashes with the earlier batches.

### The backgrounds: one loop per floor, played under it, quiet
Each is 10 s round (the furnace and the pillars 8 s) and comes round with no seam. They are mixed quiet (about 4 to 8 dB
under the combat), so play them at full volume. One floor's loop at a time; cross-fade between floors.
- Floors 1 to 5, the prison: `bed_f1` (still crypt air, slow drips, a far door), `bed_f2` (wind through the scaffold, a
  rope creaking), `bed_f3` (chains clinking, the furnace rumbling through the walls), `bed_f4` (mine timbers creaking,
  bones settling), `bed_f5` (a low wet pulse, six beats a loop, his fire hissing).
- Floors 6 to 10, the wilds: `bed_f6` (the Quarry: wind, a chisel far off striking in threes, the crane creaking),
  `bed_f7` (the Ledge Road: high wind, vultures far off), `bed_f8` (Echo Canyon: wind down the gorge, a rockfall echoing
  once), `bed_f9` (the Pinewood: birds, wind in the pines), `bed_f10` (the Sunken Fen: frogs, insects, the bog).
- Floors 11 to 15, the Hush: `bed_f11` (the Gate Ward: an empty square, wind, the heavy quiet), `bed_f12` (the Undercity:
  running water), `bed_f13` (the Millrace: the wheel churning, the stamping mill thumping), `bed_f14` (the House of
  Quiet: the ward's creaks, a coal stove ticking), `bed_f15` (the Great Library: a vast still room, pages stirring).
- Floors 16 to 20, the court: `bed_f16` (the Swan Gardens: birdsong, a breeze in the roses, the lake), `bed_f17` (the
  Masque: an empty ballroom, the big clock ticking once a second), `bed_f18` (the Glass Gallery: glass faintly ringing),
  `bed_f19` (the Keep: wind on the battlements, banners snapping), `bed_f20` (the Quiet Tower: high wind, guttering
  candles).
- `furnace_loop`: the Stoker's furnace on floor 3, heard near it while it burns. `pillar_fire_loop`: the Colossus's
  pillars burning on floor 10 (the siege magic, phase 3), heard near each while it burns.

The Hush floors (11 to 15): your plan stands, everything there through the game's muffling filter, a little quieter
(“Thin and muffled”, his pick, 7 Nov). These sounds are made full; the filter does the rest.

### The moments: each made whole, to play once from the moment's frame 0
Every part sits on the art chat's frame (30 a second, from its floor READMEs), so play the sound as the moment starts
and it lands on the jolts. Named as the moments are in the code.
- Floor 1: `f1_stone` (“dust and a falling stone”, 2.8 s: grit pouring, strikes at 27 and 51), `f1_rats` (“rats bolt”,
  1.9 s: freezing at 3, bolting at 10), `f1_candles` (“a candle gutters out”, 2 s: the draught, out at 12, 17 and 22).
- Floor 2: `f2_ravens` (“the ravens take flight”, 2.7 s: heads up at 5, the burst 9 to 13), `f2_bell` (“the bell
  tolls”, 4.9 s: strikes at 49, 76, 100, then dying away), `f2_gibbet` (“the gibbet swings”, 3.1 s: jolts at 2 and 10,
  the skull at 20, swinging on).
- Floor 3: `f3_chains` (“the chains pull”, 2.2 s: hauls at 8 and 17, the rip at 26, slaps at 34 and 41), `f3_bars` (“the
  bars shake”, 2.17 s: heaves at 11, 20, 30, a pin pinging away), `f3_ball` (“the ball falls”, 2.73 s: the lurch at 14,
  the smash at 23, the bounce at 33, rolling away).
- Floor 4: `f4_wall` (“the skull wall spills”, 5.6 s: bulging, jolts at 32, 43, 50, 61, at rest by 96), `f4_cart` (“the
  cart runs”, 6.3 s: rolling from 22, the crash at 66, landing at 82, a wheel rolling away, flat by 147), `f4_bones` (“the
  bones stir”, 5.7 s: the burst at 42, slams at 55 and 79, the upper arm landing at 106).
- Floor 5: `f5_roof` (“the roof comes in”, 5.67 s: the props groaning, the snap at 44, the slab at 69, the last rock at
  122), `f5_winch` (“the winch runs wild”, 4.3 s: the brake slipping at 26, the drum spinning, the far crash at 58, the
  lever at 66), `f5_rift` (“the rift breathes”, 5 s: heaves at 36 and 70, roaring to 104, sunk by 134).
- Floor 11: `f11_pigeons` (“the pigeons burst off a roof”, 2.5 s: up within 6 frames).
- Floor 12: `f12_surge` (“the surge”, 3.8 s: the rattle, the flap flung up at 8, the torrent and the wave, the flap
  clanking shut at 91).
- Floor 13: `f13_whirl` (“the whirl of pages”, 5.6 s: the gust, the whirl up from 10, full by 26, falling apart at 74,
  the sheets fluttering down).
- Floor 14: `f14_screen` (“the screen falls”, 3.2 s: rocking, the crash at 56, settled by 70). Its README says it makes
  no sound in the House of Quiet; his Hush rule is thin and muffled, so it has one, through the filter.
- Floor 15: `f15_chandelier` (“the chandelier falls”, 4.3 s: the chain creaking, the link giving at 26, the snap at 52,
  the crash at 63, still by 92).

### The quest pieces, the traps and the rest: one-shots for the game to time
- Floor 3, the Stoker's quest: `crank_gear` (the gear set into the crank), `crank_turn` (one turn of the crank: play it
  for each turn), `furnace_out` (the furnace dying out as the crank is turned, 2.5 to 4 s), `gate_fire_out` (the fire
  across the Chained One's gateway going out).
- Floor 5, the mine shaft's cage: `cage_down` (4.3 s: it plunges at frame 32, slams onto its catches at 50, bounces at
  60, the gate opening over the last 17 frames), `cage_up` (3.37 s: the gate slams at 10, it lurches at 30, gone by 64).
  Frames as the art chat's floor 5 README; play from the ride's frame 0.
- Floor 7: `ledge_crumble` (rock giving way under the hero), `eyrie_wind` (the eyrie's edge: the wind swelling as the
  picture pans out over the drop, 3.6 s, at its height at 2.2 s).
- Floor 8: `singing_stones` (a low hum as you pass one, about 2 to 2.6 s).
- Floor 10: `bog_step` (stepping into the sucking bog).
- Every stronghold, 6 to 10: `altar_word` (a word set into the altar of the words: the clunk, then the chime),
  `seal_burn` (the door's seal burning away as the stronghold opens).
- Every Hush floor: `bell_ring` (a hit at one of the bells, ringing out, 4 s; in place of the portal sound there),
  `bell_muffled` (the Muffled Bell struck as the Hush starts: a dead clunk).
- Floor 16: `nettle` (walking through a nettle bed). Floor 17: `clock_chime` (the ebony clock's chime as every dancer
  stops dead, 4.2 s; in place of the placeholder echo). Floor 18: `mirror_crack` (a blow lands near a mirror),
  `skylight` (the skylight trap falling). Floor 19: `portcullis` (slamming down across a hall, its chain falling first,
  so the slam lands at about 0.5 s), `pitch_pour` (the murder hole's trap), `songbird` (the clockwork songbird singing
  as the King dies and running down, 3.1 to 3.5 s).

### Made to fit
The takes came back 0.5 to 3 seconds long. Each loop is stitched from short stretches of its takes, its end running
into its start; the Quarry's chisel, the Masque's clock and floor 5's pulse are laid in on a beat. Where a take didn't
have what a moment needed, another take from this batch stands in: the ravens' wings are the pigeons' slowed down, the
cart rolls on the iron ball's roll, the floor 1 stone strikes are the ledge's rock, the bells and the clock ring on a
little longer than their takes did.

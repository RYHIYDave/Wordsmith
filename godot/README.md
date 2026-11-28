# Wordsmith in Godot (branch `godot/port`)

The game being rebuilt in Godot 4.7 as a real app, alongside the TypeScript game on `main`. Nothing here touches
`main` or the published game: this branch is its own, as CLAUDE.md asks of every chat but the main one.

Asked for 14 Nov 2026, the owner's words: “id like to try and make wordsmith with godot.  can you work on porting some
things in parallel with my regular build?” and “we dont need to keep anything under 30MB” (read as: files no longer go
through chat, so the art and sounds go into the project whole).

## What is in it (the first slice)

- **Floor 1 of the Crypt**, laid out by the game's own map-maker (`game/level.ts makeDungeon`, seed 1) and painted in
  its own stone: the floor's flagstones, the wall faces (every wall standing, as on floors 1 to 5), the shadow of a wall
  on the floor at its foot, and the walls between the eye and the hero fading round him.
- **The Warrior**, from the released game's baked pictures, in all eight painted facings: standing, running, his two
  swings. He moves at the game's speed (4.6 tiles a second) and slides along walls as the game has him do.
- **Sound**: his steps on stone, his swing, and floor 1's background (its loop and its drips), from `assets/sound`.
- An approximation of the dungeon's dark round the edges of the screen (not yet the game's own lighting).
- **Floor 1's monsters** (added at his "Yes, monsters next", 14 Nov 2026): the 66 the game itself spawns on this floor
  (28 skeletons, 23 bats, 11 bone archers, a marksman, two troll guardians in the lairs, the Warden in his hall), each
  where the game puts it, with its life, damage (the first floor's halving in it) and speed, in its baked pictures with
  their named lists (`assets/monsters/lists.json`). They sleep until they see him within 9 tiles, wake their pack, come
  down the flow field, wind up and strike or shoot (arrows fly and hit), recover, flash when struck, show their life for
  4 s, fall and lie 30 s. Their voices, blows and deaths sound.
- **The Warrior's Strike** as he starts: the blow lands a third of a second in, on the one monster in front within 1.7
  tiles, 8 to 12.5; every 0.92 s, the second swing of the combo if pressed again soon enough, a step forward each. His
  life (102, 0.6 a second back) over his head in a fight; fallen, he is back where he came in.

- **The Warrior's other two attacks** (at his pick, "Warrior's other moves", 14 Nov 2026; defs.ts SKILLS, talents.ts):
  the WHIRLWIND, the right button held, and his swipe, the LUNGE, Space.
  - The WHIRLWIND: he spins for as long as it is held, 2.4 s at most, cutting all round him every 0.3 s (x0.55, 2 tiles),
    walking at 90% and through enemies; ready again after 3.5 s, less after a short spin (defs.ts SKILLS.whirlwind, game.ts
    updateChannel). At first this was the game's starting WHIRL, one overhead slam all round him (x1.4, every 3 s), as the
    game shows it; told “It doesn’t do the whirl”, and that in the game the spin is the greatsword's talent (gswhirlwind:
    "Whirl becomes WHIRLWIND"), his pick, 14 Nov 2026: "Give him the Whirlwind spin".
  - The LUNGE: flung up to 6 tiles toward the pointer, not to be harmed in the air, through monsters and the Lockdown's
    bars, a blow 1.6 round where he lands, ready again after 4 s.
  In the game Whirl opens at level 2 and the Lunge at 5: here all three are open, to try them.
- **Loot, levels and the first word** (at his pick, "Words and loot", 14 Nov 2026; `scripts/loot.gd`, `inventory.gd`):
  what falls as the game's dropLoot has it (gold, life orbs, gear: a leader's, a guardian's and the Warden's more and
  better), every piece one the game itself rolled (`tools/godot_loot.ts`: its own rollGear, its pictures, its names and
  properties); gold and orbs flying to him, gear taken by walking over it, worn at once where a slot is empty; his
  stats from his gear as the game's derive makes them; three flasks (Q), one back every 18 kills; experience and levels
  by the game's curve, each +12 life and +5 to Str, Dex or Int, his pick. THE GEAR SCREEN (I or Tab): his ten slots, the
  bag of 24, his stats, a piece's card, and the Power word put in Strike's front slot (+33% and bigger, half splashing)
  or behind it from level 4, or burned into a worn piece (the game's own outcome for that piece). In the game no word
  falls on floor 1: the fallen wordsmith's Master Rune-stone is carried to the wordsmith in town, who gives Power
  (the town, below).
- **The town, where a new game begins** (at his pick, "The town", 14 Nov 2026; `scripts/town.gd`, `tools/godot_town.ts`:
  game/level.ts makeTown and Game.enterTown, painted by the game's own art/town.ts, ring3.ts, props.ts, town_ways.ts).
  The walled square in the vault's stone with its braziers, pillars, barrels and urn; the smithy and the ARMOURER at his
  forge; the bazaar and the MYSTIC at her table; the WORDSMITH in his ring of six standing stones; the STRANGER in the
  dark corner; the Lexicon, the stash, the stairs down and the shaft's head. Its people from the released game's baked
  pictures, each at his work and what he does in turn (the anvil, the crystal, the rune, the coin heard as they do it),
  turned to the hero when he comes up to them. THE FIRST QUEST as the game has it: E by the wordsmith, and he asks for
  the Master Rune-stone; the stairs down to floor 1 (in at its gate, its stairs up drawn in the arch); the fallen
  wordsmith searched for the stone; floor 1's gate back up; E by the wordsmith, and the stone is laid in his slab and the
  ring lights (its runes catching, the light running round the circle stone by stone, all flaring, 4.7 s), and he gives
  the word POWER, the gear screen opening on it. The guide's prompts in the game's own words (MOVE, the WORDSMITH, the
  STAIRS, Someone fell here, You carry the stone, Bring it, Put POWER on STRIKE, then what it does). THE VENDORS: E by
  the armourer or the mystic, their shelves as the game rolls them on his first day (Game.rollShop), each piece at its
  price (itemValue), bought into the bag; a piece in the bag sold for a quarter of its worth. Coming into town fills his
  life and flasks; floor 1 is laid again, its monsters fresh, each time it is come into.
- **The new looks** (his words, 14 Nov 2026: “And what you’re building is all old looks for the town and level 1”): floor 1
  as THE KING'S TOMB (the roots breaking in: daylight shafts, tombs, torches, the stairs up in its stone) and the town as
  THE CASTLE'S HALL (its roof, sun through the windows, ivy, pots, the owl, the barred gate), as the game puts them on
  as it starts (game/floor_looks.ts). Recorded from the game's own renderer (`scripts/look.gd` lays them out), the dark
  and its lights included. My first versions of both were the old looks: the export tools had not put the game's
  startup switches on.
- **Doors and the Warden's gate** (`scripts/doors.gd`; game/doors.ts, game.ts updateDoors, dropGate, raiseGate, bossIntro):
  floor 1's nine doors where the game's map-maker lays them (every guardian's lair, and some of the other rooms), each
  swinging open for him alone as he comes within 2.6 tiles, and staying open. Until it does, nothing passes it, nothing is
  seen or shot through it, and what is in its room is out of his reach (his words, 7 Oct 2026, in game/doors.ts: "I don’t want
  monsters to open doors"). Walked at the stone beside a door, he is eased into line with it, as the game does. THE WARDEN'S
  GATE stands up until he is 2.2 tiles into the hall with the Warden alive; then it crashes down behind him and stays down
  until the Warden is dead. Until then the Warden waits at the back of his hall, looking at him, and a blow on him only says
  "Not yet"; as the gate falls he says one of his lines ("None leave my halls."), his name comes up across the screen, and
  he fights. Their pictures as they open are the game's own, step by step (tools/godot_looks.ts). Fallen, the hero is set
  back where he came in and the gate goes up again behind him (in the game a fallen hero wakes in town).
- **The game's own letters and screen** (`scripts/pixel_font.gd`, `scripts/hud.gd`; engine/font.ts, ui/hud.ts, ui/cards.ts):
  every word on the playing screen in the game's two pixel fonts (`tools/godot_font.ts`: each letter as the game's screen
  draws it), and the HUD laid out as the game lays it, in its colours and pictures (`tools/godot_hud.ts`): the life globe,
  the flask with the level over it, the Lunge's button, the two attacks written out on their plates with their word sockets
  and keys ("[+] STRIKE", "POWER STRIKE"), the experience line, LEVEL UP and what E does as buttons, the place's name ("Prison
  Level 1", "Town"), the gold, the INVENTORY button (pink while a word waits), the rune-stone while it is carried, the
  Warden's bar, the guide's prompt in its panel, what has just happened, the Warden's line on its slip and his name across
  the screen, and the names of gear lying about. (LEVEL UP says (I) here: the level's choice is made on the gear screen.)
- **Chests, barrels and urns** (`scripts/props.gd`; game.ts breakProps, updateProps): in the King's Tomb the king's coffers,
  and the funeral urns, squat urns, skull jars and bone boxes (art/floor1.ts). A coffer opens as he comes up to it: a piece
  of gear and 10 to 20 gold laid before it (in a treasure vault a better piece, perhaps two, and twice the gold). An urn or
  box breaks under the Strike, each cut of the Whirlwind and the Lunge's landing: its own broken leavings on the floor, and
  sometimes gold, a life orb or a piece of gear. Their pictures open and broken are the game's own.
- **The music** (`scripts/music.gd`, game/level_music.ts and engine/audio.ts levelMusic): the town's walk, and floor 1's
  walk and fight, his songs from the sound chat's tenth batch, each looping where the game loops it. Coming into a place,
  its walk fades up; when something awake is within 10 tiles of him, the fight comes in at once from its first big hit and
  the walk fades out under it; 4 s after the last of them has fallen or lost him, the fight fades out and the walk comes back
  where it had got to. Never a fight in town. (Floors 2 to 5's are in too, for when they come.)
- **The stairs down, and floor 2** (14 Nov 2026, after "K now what?"): as the Warden falls, the floor of his hall breaks
  open (the art chat's film of it, frame for frame, the screen kicked and the blow heard at each jolt; `scripts/stairs.gd`,
  game.ts openStair), clear of where he fell; once open, its top step takes him down to FLOOR 2, THE HEADSMAN'S YARD:
  - its own look, THE PRISON'S GROUNDS AT NIGHT, recorded from the game's renderer as floor 1's is (render/grounds.ts,
    render/yard.ts): courtyards of cobbles under the night sky, cell blocks with lit windows, the outer wall and its torches,
    the gaoler's house where he comes in (darker indoors), the night sky and the tower over a courtyard's far walls while he
    is in it, and the Headsman's yard outdoors with its scaffold, gallows, bell and gibbet;
  - its 188 monsters, among them the CULTISTS' fire sigil (a burning ring under him that erupts and burns on), the SHADES'
    rime that slows him, and the HEADSMAN made new (`scripts/headsman.gd`, game/bosses.ts): his prowl, the lunge, the dashes,
    the flurry of three cuts, the blade wheel, the vault whose spot is marked before it comes down, his calls;
  - its traps (`scripts/traps.gd`): spike floors on their beat, dart walls with their plates;
  - its SEALED DOOR on the treasure vault, opened only by a Strike carrying POWER;
  - its WAYPOINT, which wakes as he comes near and warps him to town in its column of light, and the town's, which takes him
    back down (`scripts/waypoint.gd`);
  - the floors' names across the screen as he comes in ("The Headsman's Yard", "Prison Level 2" under it).
  The walls between the eye and the hero now fade by the game's own rule (render.ts wallVeil).
- **Floors 3, 4 and 5, and the way any floor is brought over** (the cloud chat, on branch `claude/sharp-lamport-ey7q0l`,
  14 and 15 Nov 2026; his words to it, 14 Nov, 22:40: “Help migrate wordsmith to godot”). The Prison's five floors now
  run on from one another: the town's stairs to floor 1, its stairwell to floor 2, its stairwell to floor 3, floor 3's door
  out the back of the Chained One's hall to floor 4, floor 4's cave to floor 5, floor 5's cage up to the town.
  - THE RECORDER (`tools/godot_record.mjs`, `tools/godot_rec/page.js`): a floor's look is taken from the game itself. The
    game runs in a headless browser, as its playtests run it, and its own renderer is given a canvas that writes down
    what it is asked to draw: the ground's pictures in the renderer's order, what stands with its depth, the walls that
    fade, the holes in the dark and the glows; 120 frames make the runs of pictures (a flame, a candle-lit wall); then
    the floor's STATES are taken as what differs from it (each door and gate from shut to open, each chest open, each
    barrel and urn broken, the way on opening frame by frame, the waypoint's warp), and WHAT IS SEEN WHEN (the tile each
    thing waits on to have been seen). No copy of the renderer's rules is kept, so one command brings any floor's look:
    `node tools/godot_record.mjs 3`. It checks that the level it drew is the level the Godot side has laid out.
  - FLOOR 3, THE CHAINED ONE'S PIT (the black iron prison), FLOOR 4, THE OSSUARY (the buried chapel of bones) and FLOOR 5,
    THE FLESHMANCER'S LAIR (the mine that becomes his temple): each laid out by the game's map-maker, in its own look,
    with its doors and gates, chests, barrels and urns, its traps (`scripts/traps.gd` on a recorded look), its waypoint
    (`scripts/waypoint.gd`: to town and back), its fallen wordsmith (full flasks and a word), its loot rolled by the game
    for that floor (`tools/godot_loot.ts`), its monsters where the game puts them, and its way on (`scripts/ways.gd`,
    game/ways.ts: the door that swings open, the wall that crumbles from the cave's mouth, the cage that comes down the
    shaft, each when the boss falls, each its own film).
  - WHAT HE HAS SEEN (`scripts/sight.gd`, game.ts updateVision): on every floor only what he has seen is drawn, a room
    at a time as he comes to it, and a monster only while it is in sight. Floors 1 and 2 too.
  - LEDGES, STAIRS AND SLANTING WALLS (`scripts/floor_map.gd`, game/height.ts and game/cut.ts): raised and sunken floor
    stands as high as it is, he and the monsters are drawn at its height and climb by its stairs; a ledge holds a body as
    a wall does; a tile cut corner to corner is stood on in its floor half and slid along.
  - THE THREE BOSSES, each by the game's own rules as it starts (game/bosses.ts), each a script of its own beside the
    Headsman's (`monster.gd` BOSS_AI):
    THE CHAINED ONE (`scripts/chained.gd`): his gait; the LASH (two swings, then the crack along its lane); the WHIRL (he
    spins after the hero, his chains striking, then the ring); the HOOK (flung, the hero caught, held and dragged to his
    feet, then the hammer); the BALL heaved onto its circle; his chains breaking at two thirds and one third of his life
    (he is quicker each time, and is drawn without them); his lines.
    THE OSSUARY AMALGAMATION (`scripts/amalgam.gd`): its crawl; the FAN of twelve arms; the RAIN of skulls that come down
    as bone mites; the ARMS up through the floor; DEVOUR (the hero dragged to its maw, then the bite; a bone beast dragged
    in is eaten); a bone beast burst out at each fifth of its life lost; its mites and beasts; its lines.
    THE FLESHMANCER (`scripts/fleshmancer.gd`) and the MINI FLESHMANCERS (`scripts/minifm.gd`): his glide; two fans of bone
    SHARDS; five RINGS OF HANDS; the whipping stream of FIRE and the lanes it leaves burning; the dead RAISED from his bone
    heaps; his going under the floor and coming up elsewhere (nothing reaches him between); the minis' fire and the dead
    they call up out of cult bodies; their lines. He is brought over AS HE IS FROM HIS REDO (`design/fleshmancer-redo`, his
    yes of 14 Nov 2026, merged into this branch ahead of the main chat's bringing it in): his fire as flames, his ritual
    circle burning under him and lighting him in his dark hall, his power rising off him, and his death (his light
    bursting out, the floor cracking, twelve hands of his dead dragging him under, a pillar of his fire); and once he is
    dead nothing of his harms.
  - THE STOKER (`scripts/stoker.gd`; game/act1_rules/stoker.ts), floor 3's furnace keeper, in his arena at the end of a
    short hall: his slow gait; his shovel of seven COALS thrown where the hero stood (each spot marked, each fire burning
    on); his FIRE RAKE dragged round before him (a sheet of fire springs up behind the blade); below a third of his life
    his FURNACE'S BURST, a ring of fire rolling out with three gaps to stand in; his death's blast; and the forge crank's
    GEAR left lying where his death leaves it, taken by walking to it.
  - THE TWO KEYBEARERS (`scripts/keybearers.gd`; game/act1_rules/keybearers.ts), who carry floor 5's temple door's keys:
    THE KNIFE (his stab, his thrown knife, his leap) and THE FLAME (his fan of three balls of fire, his great sigil under
    the hero, his ring of fire burst out from him, its reach marked while he gathers it). Each drops his key as he falls:
    it rings on the floor and is taken by walking onto it.
  - THE MONSTERS' OWN MOVES OF FLOORS 3 TO 5 (`scripts/monster.gd`, `monster_moves.gd`; game/defs.ts MONSTER_MOVES,
    game/action_f3.ts, action_f4.ts): the green troll's RAMPAGE (two swings and a leaping slam, its ring marked first) and
    BULL RUSH; the Boneward's thrust, its spear thrown (it lies where it comes down; it fights with its shield, goes for
    its spear and stoops for it) and its SHIELD WALL (a blow from before it glances off); the high priest's fire bolt and
    his censer's burning smoke; the dagger cultist's FRENZY of four stabs.
  - THE GATES (`scripts/doors.gd`, `temple.gd`, `furnace.gd`): on each of these floors a GATE WITH A LEVER bars the main
    path until its lever, in a nook nearby, is walked up to; a ROOM THAT LOCKS drops its gates with him inside and raises
    them when its pack is dead (floors 4 and 5); floor 5's TEMPLE DOOR is barred by two chains until he holds both keys
    (the keys shown top left), then the chains fall and its leaves swing open; floor 3's FURNACE keeps fire in the Chained
    One's gateway until the forge crank is turned with its gear (the Stoker's), when the furnace and the fire go out.
    Until these were in, none of the three bosses could be walked to.
  - THE WAY MONSTERS FIND HIM (`scripts/monsters.gd`; game/nav.ts flowField): a step to a side counts 10 and to a corner
    14, as in the game (it had counted them alike, and they came by odd ways).
  - THE GAME'S OWN PICTURES OF WHAT THE MOVES MARK AND THROW UP (`tools/godot_fx.ts` makes `assets/fx`; `scripts/perils.gd`
    plays it). What a move lays on the floor and throws up is painted in the game by a painter of its own, a frame at a
    time. The tool runs those same painters and keeps what they paint as FILMS: frames in the layers the game lays them
    in (on the floor under the figures; just behind and just before a figure at its middle; over everything). So these
    are the game's pictures, not drawings like them: the red circle and the charge lane; the marksman's line of aim; the
    archer's arrow rain; the Warden's Lockdown (the bars' shadows, the bars crashing down, standing and rising away, a
    tile of a row at a time); the cultist's fire sigil and the Shade's rime; the troll's slam ring; the priest's smoke; the
    Boneward's spear; the Chained One's rings, crack, hook, ball and chains; the Amalgamation's rings, skull rain and
    arms; the Stoker's coals, rake fire, furnace ring, blast and gear; the keybearers' knife, balls of fire, ring of fire,
    great sigil and key; the Fleshmancer's pit, rising, bone heaps, the hands of his dead and his death. Each kind of
    monster's films are on sheets of their own, and a floor fetches only those of the kinds on it as it begins.
    Three of the Fleshmancer's cannot be films, since he aims them any way he likes: his SHARDS, the CRACKS OF HIS RINGS
    and his FIRE (his redo's flames; a mini fleshmancer's too). For these the game's painters themselves are brought over
    (`scripts/fm_paint.gd`: art/fleshmancer_action_fx.ts paintShards, paintRingCracks and paintFire, line for line, with
    the game's own noise) and paint each frame of the mark's clock as the game does, thirty a second. Held against the
    game's painters, over five thousand pictures of whole moves, not one pixel differs. A frame of his fire takes 10 to 18
    thousandths of a second to paint, so the pictures are painted a few frames ahead on the engine's worker threads and
    the screen never waits for one (`FmPaint.threads`; without threads, fifteen a second on the spot).
  - THE MOVES' LIGHTS IN THE DARK (`scripts/look.gd` spot; the game's `c.spot`): what shines cuts its light in the place's
    dark as it goes: the Fleshmancer's circle, his fire and his death, the hands of his dead, the keybearers' knife, balls
    and ring of fire, a key lying, the Stoker's coals in the air and his gear lying.
- **THE WORDS: wordsmithing** (the cloud chat, 15 Nov 2026, at his pick that day, asked what to build next: “The words
  (Recommended)”). The seven words a Warrior can come by on floors 1 to 5 (the prison's six, Power, Poison, Frost, Flame,
  Lightning and Swift, and Heavy, the armourer's reward), in front of and behind each of his three moves.
  - WHAT A MOVE BECOMES WITH ITS WORDS (`scripts/words.gd`; game/words.ts resolveSkill; its tables taken from the game by
    `tools/godot_words.ts`): held against the game's own on 1671 loadouts, every number, name and line of text the same.
    The slots open as the game opens them (`scripts/loadout.gd`): none until the wordsmith's ring is lit, one in front at
    once, one behind from level 4, the seconds at 15 and 20; one damage word a side.
  - WHAT THEY DO IN THE FIGHT (`scripts/hero.gd` hit_monster, `monster.gd`, `monsters.gd`, `wakes.gd`; game.ts strike,
    hitMonster, landed, wake, updateZones): Power's harder, bigger blow and its splash, and behind, might that builds;
    Flame's explosion and burning; Frost's burst, its chill and a second hit's freeze; Lightning jumping on from enemy to
    enemy; Poison's doses; Swift's quicker blows and shorter waits, and behind, speed; Heavy's stun and slower blows; behind
    an element, ground left burning, iced or storming; behind Poison, a venom cloud; behind Heavy, cracked ground that
    staggers. Bosses are never frozen or stunned. Each held against the game's formula: `--only=words`, 36 cases.
  - WHAT THE FIGHT SHOWS OF THEM (`scripts/fx.gd` and its `fx_*.gd`; render/fx.ts, wild.ts, words3.ts, with the game's
    colours from `tools/godot_fxlooks.ts`): the swing's streak, a hit's sparks and number, the bursts, lightning out of the
    sky, flames, ice, poison, a stun's stars, Heavy's weight, might and haste on him; burning, chilled, frozen and poisoned
    monsters as the game shows them; the ground a move leaves, with what it sends up.
  - HOW THEY ARE COME BY AND SET (`inventory.gd`, `hud.gd`, `loot.gd`, `town.gd`, `doors.gd`): the gear screen laid out as
    the game's, each open move with its slots, a word set by pressing or dragging and taken out again, the game's refusals
    in its own words, a move's card; every word's piece on the moves at the bottom of the screen; a monster that carries a
    word gives it up where it falls (not on floor 1, nor before the ring is lit), taken by walking onto it; the fallen
    wordsmith on floor 1 only (and later only for a hero who has not found him); any word burned into a piece of gear by
    the game's own outcomes; THE ARMOURER'S QUEST: asked once the ring is lit, he wants floor 3's furnace put out and gives
    HEAVY for it; the sealed doors of floors 2, 3 and 4 open to Power, Flame and Poison. `--only=wordsui`, 55 lines.
  - THE MONSTERS' OWN WORDS (`hero.gd` hurt_by, `monster.gd`, `perils.gd`; game.ts hurtHero, monsterElement, hearsCry):
    an elite's, a guardian's, a boss's or a pack's words on its blows and on what it leaves on the floor: armour against
    the plain part, his resistances against fire, frost and lightning; poison, burning, chill and shock left on him;
    Swift's quicker blows; a minion's words at half; the rune over a carrier's head and a monster's name in its colours; the
    champion's rallying cry, heard by those that carry his words. `--only=foewords`, 18 cases.
  - FLOORS 6 TO 10'S WORDS (the words' port of the descent, 15 Nov 2026): TWIN, LEECH, VOLATILE, PRECISE, FRENZIED, GUARDING,
    LASTING, FLEETING and VAST, the rest of what may be found from floor 6 (types.ts wordsAt), each in front of and behind each
    of his three moves by the game's own resolveSkill (words.gd; `words_check.gd` over 32163 loadouts of the sixteen words,
    none differing), and in the fight as game.ts has them (`hero.gd`, `monster.gd`, `wakes.gd`): Twin's second blow, cut and
    shock, and "of Echoes", the phantom that makes the move again a moment later; Leech's life back for every enemy hit, and
    "of Leeching"'s life orbs from kills; Volatile's kills exploding, and "of Ruin"'s rune going off; Precise's harder, narrower
    hit, and "of the Mark", the next hit on the marked a certain critical; Vast's wider, softer area, and "of the Expanse"'s
    splash; Frenzied's stacks (his Strike and every wait faster), and "of Frenzy"'s kills keeping them; Guarding's shield, and
    "of Warding"'s ward circle; Lasting and Fleeting on all that lasts (ground, clouds, cracks, wards, burning, poison, might,
    haste, the frenzy, the shield, the Whirlwind's hold and its turns). ON A MONSTER (`hurt_by`, `monster.gd`, `act1.gd`,
    `perils.gd`): Twin's second blow, shot and ring; Frenzied's rage as it is hurt; Guarding's shield; Vast's reach and wider
    warnings; Volatile's dying blast; Leech healing what its blow takes; Precise's blows through half his armour; Lasting's and
    Fleeting's poison, burning and chill on him. FOUND from floor 6 (`tools/godot_loot.ts`: the sixteen words' rune stones, the
    words of floors 1 to 10 and how likely, what each becomes burned into gear, Guarding's block among it, floors 6 to 10's own
    gear); the bosses' runes now each their stone. AS THE FIGHT SHOWS THEM (`fx_words610.gd`, from render/fx.ts and words3.ts):
    the mirror's teal phantoms, Leeching's blood and wisps, Volatile's violet crackle, blasts, runes and column of light,
    Precise's pins and sight, the frenzy's ring at his feet and its sparks, the shield's shell and the ward; and LASTING'S,
    FLEETING'S AND VAST'S OWN LOOKS (`fx_words10.gd`: render/words10.ts, the art chat's, PORTED LINE FOR LINE and held against
    the game's own painter dot for dot, `checks/looks10_check.gd`, 60 moments and 8 s of its clock): Lasting's sand-light on
    the ground his moves leave, dunes drifting in over it in the half again; on his Whirlwind its sand trails and the drift at
    its edge; the ribbon of a boost along his path; its sand and heap on his poison or burning on a monster, and, pink and gold,
    on a monster's on him; Fleeting's lilac tongues round the ground, his spin's stutter and streaks, his after-images a step
    behind while its boost lasts, the stars of a poison ticking fast, its last sparks; Vast in front, the floor cracked where an
    area's edge was and its dust rolled out to the new edge; behind, a ring of earth and a rock thrown to each one near; on a
    monster, its warning drawn wider. Each moves at 30 a second through its beats, drawn from what the rules keep; the three
    words' rune stones and colours are the art chat's (`tools/godot_switches.ts`). `--only=looks10` pictures each side at
    work at its beats, a line a picture, and what they cost a frame. `--only=words`,
    `--only=foewords` and `--only=wordsui` each end with these words' own cases (`check_words610.gd`: 54, 13 and 5); with
    `--cases=610` the words' and the gear screen's checks run theirs alone (`--cases=610:twin,vast`, those words').
  - WORDMELDING (the meld's port, 15 Nov 2026; game/melds.ts, melds8.ts, ui/meld.ts, as the game starts: MELD, RANK2,
    VOLT_MELDS, MELDS8, MELD_LINE on). AT THE WORDSMITH, once the Meldstone has been given him ("E: Wordsmith"): the gear screen
    with his half beside it, its first page (HIS TRADE IN WORDS, below), MELD at its top turning it to its
    second, MELDING (`inventory.gd`, its block THE WORDSMITH'S HALF; `loot.gd` meld_problem, meld_words): two of his spare words
    laid in its two hollows (pressed, dragged, or TO THE MELD on the word's card; pressed again, taken back out), MELD fusing
    them, for a runedust (the strongholds', `quest610.gd` `dust`), into one word among his, both used up; what comes out not
    shown before it is made (but two of one word: its next rank, "MAKES POWER II"); the one just made shown, "A NEW WORD,
    FOUND", and its page read under it; refused in the game's own words. THE WORDS IT MAKES (`words.gd`, resolveSkill widened;
    `words_check.gd` none differing over 59220 loadouts of the sixteen and the 28): the ten melds of two damage words, Volatile's
    five, the eight across the groups, and rank II of the five damage words, in front of and behind each of his moves; a melded
    word does the work of both its words and takes its side's one damage-word place, grows with its own attribute, and melds no
    further. IN THE FIGHT (`melds.gd`, with small hooks in `hero.gd`, `monster.gd`, `monsters.gd`, `wakes.gd`; game.ts meldHit,
    meldArc, meldPatch, meldZone, runeTwist, explodeKill, meld8Struck and the rest): each meld's twist, its head lists them all.
    THEIR LOOKS IN THE FIGHT, the game's own painters brought over line for line (`fx.gd` hands the rules' tellings on to them):
    the ten's (render/melds3.ts: `fx_melds3.gd`; Eruption's pool and heat, Avalanche's shove and crush, Thunder's bolt from the
    sky and its clap, Scald's steam hiding him, and the rest), Volatile's five (render/volatile3.ts: `fx_volatile3.gd`; the
    blasts, the runes waiting and going off, Powderkeg's fire and burning ground, Shatter's freezing and ice, Chain Reaction's
    bolts, Rupture's cloud) and the eight across the groups (render/melds8.ts: `fx_melds8.gd`; Siphon's beads, Cauterize's brand,
    Forking's bolt, Shiver's cross-hairs, Sunder's crack, Fervor's flames, Rime Ward's pane, Implode's vortex), and the
    thirteen's own colours as the game sets them as it starts. Held against the game's painters dot for dot
    (`checks/melds3_check.gd`, 121 moments; `checks/vmelds_check.gd`, 42 scenes) and seen at work by the rules on floor 2's pack
    (`--only=looks_melds`, 67 pictures; `--only=looks_volatile`, 82 pictures; each with a cost line). ON GEAR as the game has it (EVERY WORD ON GEAR: a melded word's two properties in one place,
    a ranked word half as strong again; `tools/godot_loot.ts`), and their rune stones and colours the game's own as it starts
    (`tools/godot_meld_art.ts`). `--only=words --cases=meld` (each of the 28 in front of and behind his Strike, its twist held
    against the game's formula; `--cases=meld:scald,sunder`, those) and `--only=meld` (the page): `check_melds.gd`.
- **The small map, the large map and the pause panel** (the cloud chat, 15 Nov 2026; `scripts/minimap.gd`; ui/hud.ts minimap
  and drawMap, ui/panels.ts drawPause): top right, the floor round him as he has seen it, a tile a pixel (in sight bright, seen
  before dim, wall dark), with the game's marks: the waypoint (bright once awake), the town's gate, floor 1's gate home, the
  stairwell once it opens, chests seen and not yet opened, the fallen wordsmith until he is searched, the monsters in sight
  (the boss, a champion, an elite, whoever is awake) and himself. M, or a press on it, opens THE LARGE MAP of everything
  seen so far, as large as fits, with its legend, the game held while it is open. Esc, or the II button under the small map,
  PAUSES: the keys this version has, RESUME and the sound on or off (the game's third button, END RUN, waits for the title
  screen). Esc closes the gear screen too. Held beside the game's own small map coming into floor 3: the same, pixel for pixel.
- **Into the descent and through it** (floors 6 to 10, his pick of 15 Nov 2026, “Floors 6 to 10”; `scripts/ways.gd`, `town.gd`,
  `loot.gd`; game/quests15.ts, game/ways.ts, game.ts updateWays, takeWay, takeMeldstone):
  - THE MELDSTONE: the armourer's reward given, the wordsmith asks for it ("Wordsmith: a task"); as the Fleshmancer dies it waits
    under the floor while he is dragged down, then bursts up where he went down (the crack of its light, spinning apart, the slam,
    hanging, "Meldstone" over it), and is taken (over his head and into him); given to the wordsmith ("Give the Meldstone"), he
    gives FLAME and FROST to meld and says the lesson's lines, the stone goes round the column of light over his slab, and the
    gate down the mountain is unbarred. Its pictures the game's own (art/meld_drops.ts, films `ms_` in `tools/godot_fx.ts`),
    stood as render/meld_drops.ts riseOf and takenOf have them.
  - THE TOWN'S GATE: barred ("The gate is barred.", once a visit); unbarred, its bars struck off as he comes in sight of it ("The
    gate is unbarred. Beyond it, the mountain road."); then it rises as he comes and falls as he goes, and walking through it
    takes him to floor 6. Its portcullis, bars, unbarring and what is left of them are the game's own, strip by strip (films
    `tg_`); the gate's doorway is in the town's layout now (`tools/godot_town.ts`).
  - FLOORS 6 TO 10: each comes in at the game's start, its name across the screen, its music (the Wilds' walks and fights:
    `tools/godot_music.mjs` now takes the game's `.mp3`s and keeps the tracks already made), its day's light where its look is
    not yet in (game/act1.ts); its pits (the Ledge Road's drop, the Fen's water) never walked on, seen and shot across, and what
    falls over one lands on the nearest floor; its waypoint reached as he comes in. Its WAY ON wakes as the boss dies, opens
    after its film's length ("The way on is open."; on the Fen "The siege magic falters. The way home is open."), what it threw
    out solid, and stepping onto its way in takes him to the next floor; from the Fen, home into the camp inside Vellum's gate
    (below). The way on's own pictures come with each floor's recorded look (its state "onward").
  - THEIR LOOKS, recorded from the game itself as the Prison's are (`node tools/godot_record.mjs 6` ... `10`): THE QUARRY (THE
    UNFINISHED CUT), THE LEDGE ROAD (THE QUEEN'S EYRIE) with its sky behind it, ECHO CANYON (THE CANTOR'S GORGE), THE PINEWOOD
    (THE HOLLOW WOOD) and THE SUNKEN FEN (THE DROWNED EYE), each with its way on's film from shut to open. Under the open sky
    the game paints its ground as far as any screen reaches, so the recorder keeps only what a view from where he can stand
    reaches (the game's screen, 480 by 270 game pixels on a screen of 16 by 9, and room for a wider one: 400 to each side, 240
    up and down) and draws it on a screen just that big (`REC.reach`, `REC.fit`, `REC.cut` in `tools/godot_rec/page.js`). The
    Ledge Road's SKY is held to the screen and slides at half the ground's pace, the town far below in it, as the game draws it
    (render/outdoor.ts drawSky; `look.gd` `_Sky`). THE GROUND IN BLOCKS: painted afresh everywhere, nothing repeating, a
    floor's ground loaded whole took 80 to 125 MB of a phone's memory; so each piece of it is laid where it lies in a block of
    512 picture pixels a side, a picture of its own (`<floor>_g_<bx>_<by>.png`), and `look.gd` fetches the blocks on the
    screen at once, those round it in the background, and lets go of those far from it, as the game paints only the pieces
    near the screen (his pick, 15 Nov 2026: “Load only near him (Recommended)”): some 11 to 25 blocks held at a time, about
    1 MB each. The Pinewood's trees, some 57,000 standing things in what can be seen, are
    written a row at a time (a run of still things at one depth within 256 game pixels across, `g`; `look.gd` `_Group`): what
    is drawn and how a figure sorts against them is the same. A TALL THING (a tree, a big rock, the gallows; 44 game pixels
    tall or more) is SEEN THROUGH while the hero, or a monster in sight, stands behind it and its picture covers his middle,
    his head or his feet, as the game does on the open ground (render.ts seeThrough: `look.gd` `_see_through2`, its pixels read
    once as the look is laid out); `--only=seethrough` sets him down behind one on each floor, one line a floor.
  - `--only=descent` pictures and checks every step of it, and sums it up in one line, `DESCENT:`.
- **A desktop icon**, "Wordsmith (Godot)", opens this project to play (it needs the `wordsmith` folder on this branch).

Keys: WASD or the arrows to walk; the left button to Strike, the right to Whirl, Space to Lunge (the mouse aims; from
the keys he aims at the nearest monster close by); E to use (talk, trade, give); Q a flask; I or Tab the gear screen.
A controller, as the game's (engine/gamepad.ts; main.ts padFrame, padControls; `scripts/pad.gd`, 22 Nov 2026): the left stick
walks him at one speed; the right stick aims (at the enemy nearest that line, in a narrow cone and in sight, its gold ring round
it, and he turns that way; let go, the game aims as on a phone); RT the quick attack, held on; LT the slow one; A the Lunge the
way he goes (or faces); B use; X a flask; RB the Warlock's change; Y the gear screen (at the attack the first dungeon's prompt
asks a word onto); START pause; BACK the map; the D-pad's UP the prompt over the attacks (LEVEL UP, NEW TALENT). In any screen
the left stick moves a pointer (a small arrow), A presses where it is, B or START goes back, Y closes the gear screen, BACK the
map. While it is played with (anything on it moved or pressed in the last 8 seconds) the prompts, the HUD, the attacks page, the
coach and the pause panel's table name its buttons (LEFT STICK to MOVE, RT to STRIKE, HOLD LT to WHIRL, A to LUNGE, X to HEAL,
INVENTORY (Y), LEVEL UP (UP), "Go up to him and press B", "Press Y to open your attacks"). `--only=pad` (`check_glows.gd`): 9
checks with a pad of the check's own, pictured.

- **The monsters' own moves** (at his pick, "Monsters' own moves", 14 Nov 2026; game/defs.ts MONSTER_MOVES with the
  first floor's MORE ACTION, `scripts/monster_moves.gd`): each makes the biggest of its moves that is ready and in reach,
  as game.ts pickMove does. The bone archer's ARROW RAIN (a gold ring where he stood, struck 1.5 s later); the
  marksman's GREAT SHOT (his line of aim run out and following him till 0.4 s before the loose, then an arrow through
  whoever it meets); the red troll's SWING, SLAM (the red circle) and CHARGE (his line marked, then run at 10 tiles a
  second, the hero knocked aside, only where he has a clear run past him); the Warden's SWING, his fan of seven BOLTS,
  the LOCKDOWN (the bars' shadows across his hall, then the bars crashing down in rows, a cell safe, standing 1.5 s as a
  cage the hero cannot walk through) and the DEAD HE CALLS (four skeletons crawling up out of the floor, no more while six
  stand). The champion's cleave; his rallying cry is heard only by minions carrying his words, and on floor 1 none do.
- **The common monsters of floors 6 to 8, each by its kind's own rules** (`scripts/act1/`; game/act1_rules/qgolem.ts,
  rubbling.ts, firepot.ts, chanter.ts, vulture.ts, crawler.ts, devil.ts, scorpion.ts, with the new moves the game starts with):
  each goes by its gait and makes its acts as the game's BossRules runs a kind of the descent's own (`act1.gd`), and what it
  lays and throws is drawn in the game's own pictures (`act1/marks.gd`; films `qg_`, `fp_`, `ch_`, `dv_`, `sc_` of
  `tools/godot_fx.ts`). THE QUARRY GOLEM's hammer (its reach marked, the floor cracked) and its BOULDER bowled down a marked
  lane, smashing on the hero or at its end; THE RUBBLINGS lying as piles of chips until they wake, climbing out one after
  another, and biting; THE FIREPOT THROWER's pot slung high, its reach marked, bursting in the cult's fire and the floor
  burning on; THE CHANTER's chain lightning (a ring where the hero stood, the bolt from its pages, the static on him) and its
  WARD (the cult near it takes 40% less harm, its ring at their feet); THE VULTURES circling over the hero and diving down
  their marked line; THE CLIFF CRAWLERS waiting under the ledge's lip and springing up over it, their swipe and their leap
  that grabs the hero and drags him back; THE DUST DEVILS weaving in, their twister dragging and scouring him and throwing
  lightning round its foot, then scattering; THE CANYON SCORPIONS darting and still, their snap and their acid spit, its pool
  burning and its splash poisoning. `--only=kind --floor=N --kind=<kind>` shows each.
- **The common monsters of floors 9 and 10, and floor 9's two side bosses' fights** (`scripts/act1/`; game/act1_rules/wolf.ts,
  deer.ts, leech.ts, spawn.ts, drowned.ts, f9_bosses.ts, with the new moves the game starts with), each by its kind's own rules on
  `act1.gd`, what it lays and throws in the game's own pictures (`act1/marks9.gd`; films `de_`, `dr_`, `wc_`, `mw_` of
  `tools/godot_fx.ts`). THE FOG WOLVES' PACK STRIKE: the pack spreads on a ring round the hero and holds, then one after another,
  a beat apart, each leaps clean through him and lands across the ring. THE TWISTED DEER's gore and its BRAMBLE CHARGE down a
  marked lane, a hedge of living bramble bursting up behind it that he cannot cross while it stands, its thorns stinging. THE
  BOG LEECH's leap and latch: it rides along on him, drawn over him, drinking and healing, until he lunges it off, it has drunk
  its fill or a wall scrapes it off. THE EYESPAWN's lash and its gold gaze along the way its picture faces. THE DROWNED lying
  unseen under the water's edge until it rises; its frost grab that slows him and can freeze him in place in its rime, and its
  bog retch, the cone marked, the gush, the slick that slows and stings. FLOOR 9'S SIDE BOSSES (`act1/f9_boss.gd`, `warchief.gd`,
  `mistwolf.gd`): THE TROLL CHIEFTAIN's club smash, ground slam and its running crack, bull rush, and bull roar with its rage
  (quicker, faster, the screen's edges red); THE MIST WOLF's bite, claw frenzy, lunge through him as mist, mist cloud with its
  claws, and howl that calls the floor's wolves out of the mist (the screen darkening, the mist rolling in). Each turns square to
  one of its four ways as each move comes, and its heavy blows hold the game still a moment. (Their side areas and the
  ward-stone pieces they carry: below, floors 6 to 10 besides their fights.) `--only=kind --floor=9 --kind=wolf|deer|warchief|mistwolf`, `--floor=10
  --kind=leech|spawn|drowned`.
- **The bosses of floors 8 and 9, each by his own rules as the game starts** (`scripts/act1/cantor.gd`, `stag.gd`, and what they
  lay on the floor, `cantor_marks.gd`, `stag_marks.gd`; game/act1_rules/cantor.ts, stag.ts with the Stag's fight done the action
  way, STAG_ACTION on). On the descent's open ground each WAITS for the hero to come into his ground (his area, or within 6
  tiles), then wakes and says his line, his name across the screen (game.ts meetOutdoorBoss: `doors.gd`; the floor's areas in
  `land.json` beside its layout, `tools/godot_export.ts`). THE CANTOR's staff strike and its echo on the same spot (glowing till
  it comes); his SHOUT, its reach marked, its wave rolling out and coming back off the far wall (each struck once); his
  SOUND-COPIES, see-through and pink, torn away to either side, each turning to the hero and repeating his last move (his
  strike, his shout or his rockfall) a beat apart, then ringing out; his ROCKFALL, his six rocks round him and three more shaken
  loose over the hero in floor 8's own rockfall (film `cn_`); his lines; dying, his copies ring out and his rocks still to fall
  fall no more. THE HOLLOW STAG's great stot round the clearing, turning only as he lands, standing to STARE every six to eight
  bounds; his GORE's sweep marked and torn; his CHARGE down its lane (the golem's), the hero run down and thrown aside, cut short
  where his antlers meet the wall, which splinters and grows back; his BELLOW, the fog wolves answering inside the clearing; and
  at 3/4, 1/2 and 1/4 of his life THE WOOD CLOSING IN, the new edge marked, a wall of roots and thorny trunks bursting up round
  it (films `sg_`), whoever it catches struck and thrown in, the clearing all the floor there is (the floor's fence: `floor_map.gd`
  fits) until he dies and it sinks away. `--only=boss --floor=8` (or 9) waits, meets, pictures every moment of every move, strikes
  the hero, kills him and watches the way on wake: one line, `BOSS89`.
- **The bosses of floors 6 and 7, each by its own rules as the game starts** (`scripts/act1/unfinished.gd`, `queen.gd`, their marks in
  `unfinished_marks.gd`, `queen_marks.gd`; game/act1_rules/unfinished.ts, queen.ts with QUEEN_ACTION on), run as the descent's kinds
  are (`act1.gd`). Out on the open ground there is no gate: each waits until the hero comes into its ground (well inside its area,
  or within 6 tiles of it: game.ts meetOutdoorBoss; `doors.gd`), and then says its line and its name comes up across the screen.
  THE UNFINISHED, half-carved out of the quarry's far wall: one with the wall, held there and turning no more than 0.7 radians, it
  makes its four moves in its pictures there; below 85% of its life it TEARS ITSELF FREE (the wall ripping, a burst round it), and
  then walks after him grinding and makes the same four: its FIST SLAM; the HURLED BLOCK (its shadow where it will land, the block
  tumbling down on him, then lying 30 s as cover, a block of the floor, four at most); the STOMP (its ring of warning, the terrace
  cracked); the ROCKSLIDE (two waves of lanes marked across the terrace, boulders dropping off the cliff and rolling down them,
  breaking at a wall or on a block). Its calls ("Catch.", "Be still. Be stone.", "The mountain falls with me.", "Tear me free!").
  THE CARRION QUEEN on her eyrie's edge, the drop at her back: her TALON RAKE (its wedge and claw lanes marked, the gouges of fire),
  her WING GUST (its rays and chevrons, the blast racing out, him shoved straight away from her but never nearer the drop), her DIVE
  (up out of sight and out of reach, her line and the ring where she strikes marked, the crater and the rock bursting in dirt and
  dust), her CALL (her flock of vultures called in out of the sky, four of it alive at most), her ECLIPSE (the ledge dark 8 s but for
  three drifting pools of light; out of them a vulture of her flock dives at him every 1.4 s down its marked line); she hops about
  her eyrie; at a hundredth of her life she flies home to her perch and stays, and the next blow sends her backward over the edge,
  the eyrie's near rock over what of her has gone below it. What aims any way is painted by the art's own painters brought over
  (`queen_marks.gd`: paintRakeMarks, paintGustMarks, paintDiveMarks, paintPoolRims, paintVultureLine); the rest are the game's films
  (`uf_`, `qn_` of `tools/godot_fx.ts`). Their ground, which the layout does not carry: `assets/floor6/boss.json`, `floor7/boss.json`.
  `--only=boss --floor=6` and `--floor=7` make each move and phase in turn, picture it and count the blows that land on him.
- **What happens on floors 6 to 10 besides their fights, as the game starts** (a helper's port; `scripts/act1/holds.gd`,
  `quest610.gd`, `pillars.gd`; their places from the game's own map-maker, `tools/godot_holds.ts`):
  - THE CULT'S STRONGHOLDS (game/act1_holds.ts, HOLD_WAVES, ALTAR_GOES, HOLD_HALLWAY; game.ts holdsMade, altarNear, altarProblem,
    altarWord, openHold, updateHolds, throughHoldDoor, holdWave): one or two on every floor 6 to 10, each a yard off the main way with
    the cult's gate at its far side, two rare guards before it (a mini fleshmancer and a dagger cultist, one carrying a word). At its
    ALTAR, E opens the gear screen with the altar beside it (`inventory.gd`, its block THE ALTAR OF THE WORDS; ui/town.ts altarSide):
    its three hollows, up to three spare words laid by pressing or dragging (one element only, none twice, taken back free), OPEN
    THE DOOR burns them: the seal broken, the altar gone and its tiles floor, the floor shaken ("The altar takes 3 words. The door's
    seal breaks."). Into the door: the screen dark, he is at the far end of the hall's hallway, the hall DRAWN AS THE GAME DRAWS IT
    FROM IN IT (a dungeon's room in the dark in the redoubt's stone: its own recorded look, `looks/floor<N>_hold<n>`; the floor's own
    put away meanwhile, each on a screen layer of its own, `look.gd` set_cull). Its FIVE WAVES, each as the game itself spawns it,
    every one with the burned words, harder for each word past the first and each wave on, each coming up out of a RIFT in the
    floor (render/arrivals.ts, drawn line for line), "Wave 2 of 5" as each next comes; the last dead, "The stronghold falls.": its
    runedust, gear, gold and a page of the cult's muster roll. Out by the hallway, before the door. Words laid and not burned go back
    to him when he leaves the floor.
  - RUNEDUST is counted as the game counts it and lies, glitters and is taken in the game's own pictures (`rd_` films), and the gear
    screen shows it beside the gold; melding at the wordsmith spends it (above). The MUSTER ROLL'S PAGES are taken and counted (three
    at most); the mystic's ask for the roll and her reward are not in yet.
  - THE QUEST LINE OF FLOORS 6 TO 10 (game/quests610.ts; game.ts mysticDue, queenDown, sceneStep, piecesMade, dropPiece): the
    gate down the mountain open, the mystic asks for the Queen's feather ("Mystic: a task"); the Queen's first fall, her feather,
    and THE EYRIE'S SCENE (black bars, the buttons gone, he is walked to the eyrie's edge, the picture pans out over the drop to the
    town far below in the Ledge Road's sky, the wind, his line "So that is what they did to the town.", the picture back); the
    feather brought, her reading of the dome; in the Pinewood the Mist Wolf, the Troll Chieftain and the Hollow Stag each carry a
    piece of the ward-stone, dropped as each falls and taken, the line at the top reading DEFEAT for each, ticked as each falls; the
    QUEST MARKS (the wordsmith's great rune, flashing, over whoever in town has something for him, and over a floor's waypoint while
    he brings something back); "Speak to" / "Return to the MYSTIC" (`guide.gd`).
  - THE PILLARS in the Fen (`pillars.gd`): the cult's three obelisks on the Swamp Colossus's stone. His fight lights them as its third
    phase begins (`main.quest610.pillars.light_at()`), and asks `shields()` while one burns; beside a burning one E sets a piece
    ("Obelisk: set a ward-stone piece"); twelve blows at a foot break one; the last out, "THE SIEGE IS BROKEN."
  - FLOOR 9'S TWO SIDE AREAS, the Troll Chieftain's camp and the Mist Wolf's glade, are walked into along their ways from the main
    path, dressed as the floor's recorded look draws them.
  `--only=quests610` goes through every step of it and sums it up in one line, `QUESTS610:`.

- **Floor 10's boss, THE SWAMP COLOSSUS** (the Drowned Eye redone, as the game starts; `scripts/act1/colossus_fight.gd`, `colossus.gd`,
  `colossus_draw.gd`, `colossus_art.gd`, `stone.gd`; game/colossus_fight.ts, act1_rules/colossus.ts, act1_layout.ts stoneOn, game.ts
  updateStone, render/act1_fx/colossus.ts and colossus_fx.ts, render/colossus_baked.ts). HIS STONE, an island of its own (its middle
  and the landing now in the export: `stone`, `landing`): his ground come into, he wakes, says his line, his name across the screen;
  the landing walked to carries the hero across to the stone's jetty, the picture drawn back to show the whole fight and leaned up
  toward him (turned on him as his phases change); back from the jetty's end before the fight or once it is won. HIS FIGHT, line for
  line: his waking (the still water, the boil, his two tentacles bursting up); PHASE 1, their slams along lines laid toward the hero;
  both killed, the flasks refilled; HIS ENTRANCE and its three tentacles; PHASE 2, the slams, the water slams (left, right, both: the
  waves rolling across the whole stone, shoving him, and the crash where two meet), the SHOVEL (he sinks, bursts up at an end gaping,
  four hooks scrape the hero toward his maw, his snap), the BILE ARC and its burning pool, and the GAZE aimed along the nearest of
  its aims; all three killed, the flasks refilled; HIS SLIDE forward and his grip; PHASE 3, his eye's gaze and slam, the siege's
  bolts, his eye struck at rest flinching; his bar his phase's (his tentacles' life together, then his own); his death (12.5 s) and
  the way home. His tentacles are monsters of their own, struck only while the fight lets them be. Drawn in the released game's
  baked pictures of him (`assets/colossus`, 121 sheets, fetched behind the game as each part of the fight wants them and let go
  after), and round them what the game paints a frame at a time, its painters brought over line for line (the waves, the crash,
  the slams' cracks, chunks, goo and slime, the bile, the scorch, the rings on the water, the bubbles, the warnings, the bolts, his
  death's water, sludge, gore, spray and teeth). His sounds, the sound chat's fifth and seventh batches, at the game's beats.
  (The cult's pillars of his phase 3, his ward while they burn, and the pieces set into them come with the descent's quest; with
  none standing, as the game has it where none stand, his ward is down and the bolts fall throughout phase 3.)
  `--only=boss --floor=10` goes through the whole fight and sums it up in one line, `BOSS floor 10`.

## The town's pieces: the wordsmith's trade, the Meldstone, the camp (the cloud chat, 20 Nov 2026)

His pick, asked what to build next: “Town pieces still missing (Recommended)”.
- **The wordsmith's trade in words** (ui/trades.ts wordsmithSide; game.ts rollShop's lot of words, wordPrice, wordSellValue,
  buyWord, sellWord, buyBackWord; `loot.gd` THE WORDSMITH'S TRADE, `inventory.gd` ITS FIRST PAGE): using him opens his half
  whenever nothing is due to be given or asked (the game's "Wordsmith"), its first page his shelf: three words, drawn from those
  of the floor he came from by the game's own lot for the game's seed (the same shelf, price and pay as the game's on all 20
  cases tried: seed 1, floors 1 to 10, two points in a run each), at 300 gold for each floor cleared; a word read (its page) and
  bought (BUY; the right button buys at once), a spare word sold from its card (SELL) or let go over his half, the last nine sold
  him kept to be bought back for what he paid, a new shelf on each coming into town; his ring dark: "The runes are dark".
  Every word's page is exported now (`tools/godot_words.ts` `page`). `--only=trade` (`check_trade.gd`): 11 steps.
- **The Meldstone carried and given** (ui/hud.ts; render/meld_drops.ts givenOf; render.ts standMeldMoments): carried, its small
  picture by INVENTORY, popping in as it dives into him; given, its flight to the wordsmith's slab (up out of him, over to the
  slab, a shudder, its halves torn apart and whirling, slammed together in a burst that kicks the screen, out to its round of
  the column of light). Its halves and its carried picture are the game's own (`tools/godot_fx.ts` `ms_half0`, `ms_half1`,
  `ms_carried`; `tools/godot_hud.ts` `meldstone`). `--only=meldstone`: 8 pictures at its beats.
- **The camp inside Vellum's gate** (game/camp.ts; game.ts takeWay 'on' from the Fen, campTown): the Fen's way on taken, he
  comes in through the city gate into the camp, and from then on it is his town (`main.gd` home_place: the waypoints of the
  floors lead there). Its look recorded whole from the game (`node tools/godot_record.mjs camp`: its keepers and its three
  people by the fire among it, its ground in 216 blocks loaded only near him), its layout the game's own makeCamp's
  (`npx tsx tools/godot_town.ts`), `town.gd` running it with `camp` on: its services as the town's (the same hand-ins, the
  wordsmith's half with his shelf drawn from the Fen's words), the kept Meldstone over its wordsmith's slab, its dusk, no music
  and no loop (as the game). Its way on into the city (the barricaded street) takes him down into floor 11; its waypoint, to
  the city's floors he has reached. Its GATE is no service, as in the game (game.ts stationNear: "the gate is walked through,
  not used"): the city gate held is the way he came in from the Fen and leads nowhere back, its name written over it and never
  lit, E beside it doing nothing (in the castle hall too, whose gate rises as he comes and is walked out through: `town.gd`
  station_near). `--only=camp` (`check_camp.gd`): 9 steps, in from the Fen the way the game has it.
- **The town's other services** (his pick, asked what next: “Rest of the town (Recommended)”), each its half beside the gear
  screen, used at its place in town (`inventory.gd` THE TOWN'S OTHER SERVICES, `loot.gd`):
  - THE STRANGER (ui/trades.ts gambleSide; game.ts gambleKinds, gamblePrice, gamble): the fourteen kinds of piece he throws for a
    Warrior, a throw costing three times a plain piece of the kind as he comes up from his floor (the game's own prices,
    `tools/godot_loot.ts` `gamble`); paid, a piece of that kind, plain, magic or rare by the game's own odds (55, 35 and 10 in a
    hundred), one of the pieces the game's own roller made for that kind, quality and floor; YOU GOT, its name in the colour of
    what it is; refused for want of gold ("YOU HAVE ...") or with the bag full; the right button throws at once. (Its very rare
    unique: the uniques are not in yet.)
  - THE STASH (ui/town.ts stashSide; game.ts stashItem, unstashItem): 36 places, KEPT FOR LATER CHARACTERS; a piece of the bag
    pressed is put away, one of the stash's taken out, kept past the character in the saved game (below).
  - THE LEXICON (ui/lexicon.ts lexiconSide, ui/lexicon28.ts its five pages, 'groups'): N OF 28 FOUND; DAMAGE, STRIKE, TIME,
    CONTROL, SPOILS, a tab each; each word found its stone with four pips for what is known of it, the rest "?"; the open word's
    page; KEPT FOR YOUR NEXT CHARACTER, a spare word kept from its card for 150 gold, doubled for each kept already (KEEP), taken
    out again for nothing (TAKE IT OUT), melded and ranked words refused in the game's words. Kept, as the stash, past the
    character.
  `--only=services` (`check_services.gd`): 9 steps, the gamble's 1000 throws among them against the game's odds.

## The saved game (the cloud chat, 20 Nov 2026)

His pick, asked what to build next: “A saved game (Recommended)”. `scripts/save.gd` (main.ts writeSave, readSave; game.ts save,
restore): one file in the app's own folder, `user://wordsmith_save.json`, holding the run in progress and, apart from it, what
outlasts any one character (which words are known and how much of each, the words kept in the Lexicon, the stash). Written every
5 s while he is up and about and not between places, and whenever the app is put away or closed; read as the app opens, the run
brought back in his town (the prison town, or the camp from floor 10 on) at its start, his life and flasks full, as the game
brings a run back: his level, experience, attributes and the points still to place, gear and bag, spare words and those set in
his moves' slots, gold, the floors (reached, the one he came up from, how many cleared), the quests (the master rune-stone, the
ring, the furnace, the Meldstone, runedust, the feather, the ward-stone's pieces, the muster roll's pages), how far through the
first lessons he is, the words bought from the wordsmith on that visit. The checks and shot modes neither write nor read it, as
the game's automated tests switch saving off. Checked in two runs of the app, as he would close it and open it again:
`--only=save_write`, then `--only=save_read` (`check_save.gd`): 10 things, all back as written (the check deletes its save).

## The city, floors 11 to 15 (the cloud chat, 20 and 21 Nov 2026)

His pick, asked what to build next: “The city, floors 11 to 15”. Each floor exported from the game (`tools/godot_export.ts 1
<n>`: its layout, its monsters, its land, its Bells) and its look recorded from the game itself (`tools/godot_record.mjs <n>`,
its ground in blocks loaded near him): the Gate Ward, the Undercity, the Millrace, the House of Quiet, the Great Library. The
ways through it as the game's: the camp's barricaded street down into floor 11, each floor on to the next, from the Great Library
home to the camp, the camp's waypoint to the city's floors he has reached.
- THE MONSTERS, each by its kind's own rules (`scripts/act2/`), with the art's own pictures and painters: floor 11's Hushed, watch
  hounds, scribes and the Hushed Watch, and the Crier (the toll, the shout off the walls, the decree, his call); floor 12's plague
  rats and dredgers, and the Rat King (the bite, his stolen words, the roll, unknot and the swarm, the sluices); floor 13's
  fieldhands and carters, and its double boss, the Scraper and the Quill, and their Palimpsest; floor 14's patients in their ward
  beds and orderlies, and the Physician (the rap, the Draw, the Diagnosis and the operation, his rounds); floor 15's inklings and
  bookwardens, and the Censor (the slash, Strike-Through, Redaction, the Hush across his room, his ink staying on the floor, the
  book of stolen words bursting as he dies). `--only=city --floor=N` (`check_city.gd`): 13, 11, 13, 14 and 16 steps.
- THE CITY'S FIVE WORDS (Pulling, Splitting, Hexing, Stilling, Binding), found from floor 11 on: on monsters (Pulling drags him a
  step, Hexing curses him, Stilling slows his moves' waits, Binding roots him, Splitting splits in two at half its life) and in his
  moves, in front and behind, with their looks (the art's own, render/words3.ts, binding3.ts). `--only=citywords`
  (`check_citywords.gd`): 16 steps. At the wordsmith's bench they change a piece rather than burn into it (items.ts ITEM_WORDS):
  SPLITTING shares a piece's properties between it and a second like it in the bag, at random; BINDING takes a second piece of
  the same kind into the first (its own kept and as many of the other's as there is room for, four in all, never two of a kind,
  at least one of each's), the other gone; each piece's colour, picture and price by its properties. On the gear screen as the
  game asks it: SPLIT IT; BIND THEM once the second piece is pressed. `--only=itemwords` (`check_itemwords.gd`): 8 steps.
- THE QUEST LINE (`scripts/act2/quest1115.gd`; game/quests1115.ts): the mystic's ask once floor 11 is cleared, the Crier's jar
  taken from the Rat King's nest (gone from it: the look's state `jar<i>`), brought for one of the city's words; the three
  unstruck pages (the last of floor 13's pair to fall, the Physician, the library's stacks), one laid in the Censor's fight with
  E drying away all his ink at once; the armourer's ask once floor 10 is cleared, the clapper falling with the first Bells won,
  brought (hung in the camp's bell, floor 11's shrine bell, ringing; his pick of three fully modded rares, gloves, boots and a
  helm, rolled by the game itself: one taken, the others go back, laid out again until then). In the saved game. The armourer
  lays them out nearest the hero first, as the game does, so one may lie within his reach and be his at once.
  `--only=quests1115` (`check_quest1115.gd`): 19 steps.
- THE BELLS, each city floor's event (`scripts/act2/bells.gd`; game/bells.ts, Game's "ACT 2: THE BELLS"): the Muffled Bell struck,
  the Hush pours out over its fixed ground and every bell wakes, 15 s on the clock a bell; the Hush raising the floor's own round
  him in it, more and more; each bell rung by a blow, knocking back what is near, chipping the Hush back, calling its tough one
  (the game's own yellow pack's leader); all rung, the Hush shatters with what it raised and the loot bursts out of the last bell
  (the clapper with it the first time); the clock run out, it lifts. What the Hush raises and the tough ones come up dark out of
  rifts in the floor, their edges the enemy's pink, and step out a second later (the game's ARRIVALS). Seen: the bells by their states (recorded from the game:
  `bell<k>`, `muffled`), the Hush's grey veil with its wall of mist, the arrows at the screen's edge, the clock across the top,
  its ground and the bells on the maps. A Splitting one struck down with the Hush breaks in two as it dies, as in the game.
  `--only=bells --floor=N` (`check_bells.gd`): 10 steps, on floors 11 and 14.

## The High City, floors 16 to 20 (the cloud chat, 21 Nov 2026)

His pick, asked what to build next: “The High City, floors 16 to 20 (Recommended)”. Each floor exported from the game and its
look recorded from it, as the city's: the Swan Gardens, the Masque, the Glass Gallery, the Keep, the Quiet Tower; the ways on
through them in their own opening pictures.
- THE MONSTERS AND BOSSES, each by its kind's own rules (`scripts/act3/`), with the art's own pictures and painters: floor 16's
  swans, gardeners, grooms and palace guard, its nettle beds and the vine in the yew, and the Princess; floor 17's dancers,
  footmen and the Silent Order, the clock, and the Prince; floor 18's ladies, reflections and queen's guard, the mirrors, and the
  Glass Queen; floor 19's crossbowmen on the walls, the Order's armed last, the king's knights, the portcullises, and the King
  (his charge and its line of sparks, the Decree, the crown's weight, the Curtains, the Hush at his side, the songbird as he dies);
  floor 20's Hush in its own shapes, the shadows of the four royals, the Rime Shade and its line of frost, the tower's stair up
  and its trapdoor down. Their sounds as the game's: each kind's blows and voice (the swans', the Moth's, the steel and spear and
  crossbow of the guards and knights, the Princess's vines). `--only=city --floor=N` (`check_city.gd`).
- THE MOTH, floor 20's boss, made ghostly as he said yes to it (`scripts/act3/moth.gd`, `moth_marks.gd`, `moth_paint.gd`;
  game/act1_rules/moth.ts, art/moth2_fx.ts, render/act1_fx/moth.ts): her slow beat, each move begun at its top; the ghost wing,
  the Hush falling like snow, Eclipse (the moon rising behind her, her shadow thrown at him), the Phantoms; the Hush shed over him
  from her second phase; in her last, unhurt, to the lectern, the chapter knocked to the stones, down on it, and the Unwriting;
  her death, every word she swallowed flying home and her coming apart into light; the songbird's song in her fight, once a
  phase. HER PICTURES are too big to hold whole (1,304 frames; the game paints them beside itself a frame at a time): baked a move
  at a time into 187 sheets, 37 MB (`node tools/godot_bake_moth.mjs`), and taken in a move at a time, those not shown for four
  seconds let go of (`baked_figure.gd`). Her effects painted afresh every frame as the game paints them: 68 moments of them held
  against the game's own painters, every fillRect the same (`npx tsx tools/godot_moth.ts check`, then
  `godot --headless --path godot -s res://checks/moth_check.gd`). `--only=city --floor=20`: her fight, 10 steps, and her death in
  the tower's.
- THE SEVEN LAST WORDS (Piercing, Bleeding, Reaping, Culling, Surging, Plundering, Mirroring), by the game's rules on monsters
  and in front and behind his moves, and their looks (render/words7.ts) ported line for line: 136 moments dot for dot the game's
  and its clock (`checks/looks7_check.gd`).
- THE ROYAL CARDS, the High City's event: crests over the packs they touch, their cards dropped and kept, the stranger's page of
  hands; and THE QUEST LINE (`scripts/act3/quest1620.gd`): the clockwork songbird (its three parts, mended, its song opening the
  Quiet Tower and singing in the Moth's fight), the whole court, the captain's voice. In the saved game. `--only=quests1620`
  (`check_quest1620.gd`): 21 steps.

## The skill trees (the cloud chat, 21 Nov 2026)

`scripts/talents.gd` (game/talents.ts, from `tools/godot_talents.ts` -> `assets/talents.json`: the six trees as the released game
has them, its switches as they stand: the remade talents' words, the Mage's and the Ranger's moves to swap, the Warrior's three
weapons, the lines both ways, the Ranger's companions): a point every 5 levels, 10 in all; a talent open where its tree begins or
once one joined to it by a line is his; the Warrior's first point his weapon, one only, its path its own, IRON once one is his;
undone in town only, for 10 gold a level, and not while one taken hangs on it alone; kept in the save (`talents`, `picks`), and
a saved list made safe. `scripts/talents_page.gd` (ui/talents.ts): the inventory's TALENTS page, the tree in its own shape with
its faint picture behind (the weapons, the arrow, the claw, the gear, the globes), the points over it, a stone pressed read on
its card over the game's half with TAKE (1 POINT), UNDO for gold, a pick of two; and on the HUD, NEW TALENT while a point waits.
`--only=talents` (check_talents.gd) checks the rules and pictures the six trees. IN THE PORT, a talent whose rules are not
brought over yet says so on its card and cannot be taken (talents.gd `PORTED`). THE WARRIOR'S, IN: the greatsword; Sweeping
Cut (every enemy in the swing's arc struck), Drilled Lunge (every enemy passed struck), Footwork (a kill readies the Lunge);
IRON's Thick Skin, Shieldwall (the shield breaking bursts, throwing back and stunning), Second Wind (a flask throws back what is
near, a second untouchable), Bulwark; the joins Honed Edge (a critical bleeds), Giant Slayer (an elite's or a boss's guard
cracked, 3% more a crack, ten at most), Resolute, Executioner, Master Stroke and Unbreakable (once a dungeon). THE BATTLE AXE AND
THE WARHAMMER, his first point's other two weapons, each with its own three moves and pictures (below), and their paths: Twin
Axes, Rend, Red Mist, Headlong; Tremors, Heavy Head, Bulldozer, Wide Swing; and Whirlwind (22 Nov 2026, below). THE VETERAN'S, ALL FIFTEEN: Stiff Jab, Viper Jab, Guard Up, Knockdown, Launcher; Light on His Feet, Fire
Starter, Stoke, Hang Time, The Full Set; Switch Kick, Long Legs, Wall Slam, Aftershock, Thunder Knee (heroes/brawler.gd, by game.ts
vetHit and its neighbours, VET_TALENTS' numbers). THE WARLOCK'S: Hunger, Feast, Bloodlust (the demon's kills), Branded, Hex
Chain, Withering, Pyre, Blazing Arm, Soul Debt and Last Rites (heroes/warlock.gd: game.ts warlockHit, warlockKill, hexChain,
blaze, pyre, lastRites; WARLOCK_TUNE.talents), and Phantom Step (his shadow left where he stepped from, gone dark with an edge of
cyan, a decoy for two seconds: render.ts drawShadows); Terrible Roar (the change's roar curses all it throws back, and they run
from him two seconds: monster.gd `flee_t`, game.ts runFrom), Hellwave (every third rake, the demon's or the Bound Demon's, throws a
row of his fires on ahead, five tiles, burning what it meets), Damned Souls (one the demon kills rises as a burning soul that flies
into the nearest enemy, cursing it and setting it alight) and the BOUND DEMON (with his pact full, a tap on him tears the demon out
beside him, roaring, while he stays a man: it goes for the nearest awake enemy near him and rakes it, cursing as the demon does,
its kills the demon's for Hunger, Feast, Bloodlust and the souls; the pact runs dry as the demon's would, and it burns out, Last
Rites going off round it; drawn with the demon's own pictures among the figures, warlock_look.gd `_place_bound`). THE TINKERER'S: Bombs Away, Fortune, Cluster Vials, Tar, Mad Mixture (her vials' bursts
in their brew's colours, baked by tools/godot_tinkerer.ts), Alchemy, The Big One, Lightning Rod (the decoys: monsters.gd
`decoys`, monster.gd _drawn_to_decoy, as game.ts drawnToDecoy), Shrapnel, Prospector and Overdrive (heroes/tinkerer.gd,
tinkerer_look.gd: the tar puddles, the big vial's ring, the little vials), Mark II (a second Golem at her other side), Growth
Serum (a vial bursting by it makes it twice as big and as strong, five seconds) and the GUN ARM, by his word of 21 Nov 2026
(below: her Golem only shoots): its cannon swapped for the tesla coil, no pick (“we can keep the tesla coil for now, but i feel
like it will need to be changed in the future”): a zap every second at the nearest within 7 tiles, leaping on to two more, her
hold its beam, her tap and hold growing with Intelligence (loadout `grows`). Lightning Rod and Prospector go off on its big shot
in its ground pound's place, their cards worded so (talents.gd `OWN_WORDS`; the Gun Arm's and Shrapnel's too). And the
CONTRAPTION, in her Vial Toss's place (hero.gd swap; its bombs growing with Dexterity, its energy with Intelligence, loadout
`grows`): thrown down where she aims, three at once (a fourth puts out the oldest once past its first shot), it springs open and
lobs her little bombs (landed, a hop, then off) or fires bolts of energy at what comes near, her pick, her vials' talents working
on both; drawn as the game draws it among the figures with its ring of the friend's cyan, its pictures baked
(tools/godot_tinkerer.ts), its energy bolt painted as it comes (golem_paint.gd `con_bolt`, held against the game's, 21 pictures
of the 71 none differing). THE RANGER'S: Fleet, Windrunner, Keen Eye, Steady Aim, Quick Draw, Long Shot, Light Step, Hunter's Mark, Wide
Traps, Minefield, Split Shot, Hail, Ricochet (`piercing`) and Far Sight (heroes/ranger.gd, kit.gd's shots, hero.gd hit_monster).
Venom (a poisoned one dying leaves a cloud of its poison) and his three moves to learn, Snare, Snipe and Rally (below). THE
MAGE'S: Kindling (her fire leaves the
ground burning), Searing, Flame Warp, Hearth (`fuel`: in her own fire nothing burns her), Inferno, Charged (a charge gathered
walking, let go by her next hit as a leaping bolt), Forking, Storm Warp, Overload, Stormcaller, Bitter Cold, Deep Freeze (a frozen
one struck slides, freezing what it meets), Frost Warp, Rime, Shatter, her AURA (R, a tap on herself: fire, lightning or frost,
picked on its stone; six seconds, then ten to wait; drawn as render/swap_fx.ts draws it) and Lasting Aura (heroes/mage.gd,
mage_look.gd; monsters now keep a shock, monster.gd `shock_t`) and her three moves to learn, Ball, Beam and Spear (below).

## The Mage's and the Ranger's moves to learn (the cloud chat, 21 Nov 2026)

As the released game has them (game/swap_moves.ts, SWAP_MOVES on): stones on her paths teach the Mage BALL, SPEAR and BEAM, moves
of no element of their own; she sets any two of Wave, Orb, Ball, Spear and Beam on her tap and her hold (Beam only held, never one
move in both), from her ATTACKS page (CHANGE TO ..., inventory.gd), kept in the save (`picks` "@tap", "@hold"). His tree gives the
Ranger SNARE in his Shot's place, and SNIPE or RALLY in his Volley's (with both, his pick on the ATTACKS page). hero.gd `swap`
puts them in their places (loadout `form_moves`; the bar's names and icons, hud.json `skillInfo`), and his kit makes them:
- BALL (heroes/mage.gd, kit.gd `_ball_burst`): a comet that stops on the first it hits and bursts there, 1.6 tiles round, the
  others in it taking 60% of the hit. SPEAR: a crystal lance through every enemy in its line. BEAM: held, a line from her to the
  first wall, everything along it struck five times a second, the nearest first; she walks at 70% while it burns; let go (or run
  out, 2 s), its wait begins, a whole wait after a whole length, less after less (never under 35%); "of Echoes", three phantom
  bites; what it leaves, where it first struck and along its line.
- SNARE (heroes/ranger.gd): thrown where he aims, 7 tiles at most, three at once; what walks in is held two seconds, then it bursts
  1.3 tiles round. SNIPE: held, it draws (full at 1.5 s); let go, an arrow through everything in its line, at its fullest 2.6 times
  as hard, 3.3 times as wide, 70% faster, knocking back 1.4 tiles. RALLY: his companions near him faster and harder for five
  seconds (their waits running out 30% faster, their bites 30% harder: companions.gd).
- A move held (kit.gd `_begin_channel`, `_update_channel`, `_end_channel`: game.ts beginChannel, updateChannel, endChannel), for
  any hero's kit; his pictures held while it goes on (the bake's `hold`), begun and let go where his pictures have them, and the
  moves' own (the bake's 129 to 132: the snare thrown, the rally called, the ball and the spear).
Their looks (`scripts/heroes/swap_draw.gd`, render/swap_fx.ts line for line, and render/fx.ts drawRay): the comet and its splash,
the crystal lance, the beam (held away up the screen, drawn behind her), the snare's rope flying out spinning and lying open, the
snipe's ring filling like a clock with its pulses, its aim, the light rising and drawn in, its glint and twinkle, the loosed
arrow's whoosh, streak and arrow of light, and the rally's rings. `--only=talents` checks them all (check_talents.gd `_learn`).

## The Warrior's battle axe and warhammer (the cloud chat, 21 Nov 2026)

His first talent point picks his weapon (game/talents.ts WARRIOR_TREE2): the greatsword (hero.gd's own Strike, Whirlwind and
Lunge, as before), or the battle axe or the warhammer, each with its own three moves (WARRIOR_KITS) in his moves' places, the
words in them kept (`loadout.form_moves`), the bar's three their own (hud.json `skillsOf`), and his pictures the art chat's with
that weapon (the bake's `axe`/`axeTown` and `hammer`/`hammerTown` sets, every list of theirs: braced and running empty-handed, the
catch, both axes thrown, braced with both, caught, the axe appearing, the two crouches: tools/godot_hero_clips.ts times them).
Picked, every greatsword he wears or carries and the vendors' shelves become his weapon's kind, and so does every one he finds
(game.ts forHim, allForHim; loot.gd `for_him`: name, picture and kind, numbers kept); undone, back again. `hero.gd arm` makes the
change; `scripts/heroes/warrior_arms.gd` (over kit.gd) has the moves, by game.ts:
- THE BATTLE AXE. CLEAVE, a wide chop, every enemy in its arc struck (hero.gd `_strike`, the move's own arc). AXE THROW: the axe
  flies through what it meets to the end of its flight (a wall turns it sooner), turns, comes back to his hand over walls through
  what it meets again; his hands empty meanwhile, braced or running; a tap while it is out and an axe appears in his hands and he
  Cleaves; back to empty hands it is caught, to full ones it goes into the axe he holds in a cyan glint. LEAPING CHOP: a crouch,
  the leap, the axe brought down 1.5 tiles before where he lands. Twin Axes, two thrown 14 degrees either side of his aim, each
  for 65%; Rend, Cleave bleeds a third of its hit over 3 s; Red Mist, each kill 8% faster for 4 s, five at most (hero.gd
  `frenzy_pace`); Headlong, a kill readies Leaping Chop.
- THE WARHAMMER. SMASH, the maul down on a spot 1.4 tiles before him, all on it struck, knocked 0.4 tiles back and dazed toward a
  stun (hero.gd `smashed`: 0.6 a blow, fading 0.15 a second; full, stunned a second) and staggered. EARTHQUAKE: the ground 1.4
  tiles before him quakes, 2 tiles round, all on it stunned 0.6 s. SHOULDER CHARGE: a crouch, then the charge, striking everyone
  in his way. Tremors, three shakes 0.35 s apart, each 0.6 tiles wider, at 1, 0.6 and 0.35 of the blow; Heavy Head, Smash stuns
  half a second; Bulldozer, what the charge strikes carried along before him and stunned 0.8 s where he stops; Wide Swing, Smash
  sweeps the half circle before him.
Their looks (`scripts/heroes/warrior_arms_look.gd`, render/render.ts and render/warrior_fx.ts) are the art chat's pictures, baked
by `tools/godot_warrior_fx.ts`: the thrown axe spinning flat (`warrior_fx-0.png`), the glint, and the Earthquake's ground heaving
in the floor's own stone in place of the slam ring (fx.gd `claims_slam`), its cracks the way he struck, kept 2.4 s: one sheet for
each stone the game paints it in (`quake_<stone>-0.png`: floors 1 to 3 the Crypt's own, floor 4 and the rest but the fifth the
Crypt's fourth, the fifth the lair's, the vault's in town), only the floor's own loaded. `--only=talents` checks all of it
(check_talents.gd `_arms`, 13 lines) and pictures the axe back in his hands, two axes flying, a quake and the charge.

## The shadows under the figures, and the named ones' rings (the cloud chat, 21 Nov 2026)

`scripts/shadows.gd`, as the game's render.ts `shadow`: one soft black oval (mage_look.gd `blot`) on the floor under every
monster in sight (its `r` x 0.75 tiles round, at 0.7) and under the hero (0.36 round), smaller and fainter the higher he is off
the floor (the Warrior's Lunge, 9 pixels at its middle; the Veteran as high as his frame lifts him, brawler.gd `lift_now`). Over
the floor and its marks, under everything that stands. (The Golem's and the Mage's orbs' are their own looks'.) And with
them the ring of single dots round the feet of a named one (an elite, each of a blue pack, a boss: render.ts ringDots), m.r x
1.5 round and breathing, in its first word's colour (orange with none). (The game's pack marks are behind a switch that is off;
the ring round the one locked onto is the touch screen's.)

## The other heroes (the cloud chat, 21 Nov 2026)

His pick, asked what to build next: “The other heroes (Recommended)”. Every hero of the game is in it now, each by the game's own
rules (`scripts/heroes/<class>.gd`, each over `kit.gd`: game.ts useBasic, useSkill, begin, release, reachPoint, the projectiles;
TRACK_AIM and lock.ts leadPoint) and drawn as the game draws him (`scripts/heroes/<class>_look.gd`), his own voice as he attacks,
is hurt and falls:
- THE CLASS CARDS as a new game begins (`scripts/class_cards.gd`; ui/panels.ts drawTitle): the six over the ring on the hill, each
  hero standing, gesturing, coming to a stand, walking when touched or chosen, making ready and warping in as he is picked; the
  mode's toggle. `--only=cards` (`check_cards.gd`).
- EVERY HERO'S SCARF, FEATHER OR BRAIDS (`scripts/tails.gd`, engine/tails.ts line for line: `npx tsx tools/godot_tails_check.ts`,
  then `godot --headless --path godot -s res://checks/tails_check.gd`, 0 pixels apart) and the pool of light behind him; his town
  pictures (his weapon on his back); the lights of his own pictures (a lit crystal, a glowing feather) and of what he sends.
- THE RANGER: his Shot, his Volley (the arrows up and coming down round where he aimed, put where the enemy is going), his Trap
  (his roll and the trap left armed); his wind as the game draws it (render/wild.ts: the air thrown off at the loose, his arrows'
  trails and hits, the volley's column, the trap's whirlwind, his roll's swoosh).
- THE MAGE: her Wave (through all in its way), her Orb (set where she aims, its waves round it), her Warp ("No room" where there
  is none); big and wild as the game draws them (her crystal crackling, the wave's crest, the orb turning and pulsing, the warp's
  bolt and thunderclap): `assets/heroes/spells.*`.
- THE WARLOCK: his hellfire bolt and its burn, his Curse and the burns leaping from a cursed one dying, his Smoke Step, his pact
  filling over his head and the change (R), the demon's Claw Rake, Damning and Smoke Step, its burning out; his pictures kept in
  packs read as the game reads them (the demon's): `assets/heroes/warlock_fx.*`.
- THE TINKERER: her Vial Toss; her Golem; her Blast Jump. HER GOLEM ONLY SHOOTS, by his word of 21 Nov 2026 (“i think we should
  change the golem to be ranged, small shots, then big shot on the whistle.”; asked, the big shot in place of its pound and its
  jump, “Replace them (Recommended)”; and THIS IS TO BE THE MAIN GAME: “the godot is going to be the main game so once thats done
  we wont need the browser version.”, so the change is made here, not in the browser game): whistled out, it drops in and goes
  with her; it stands off and fires its cannon's small shot at what is awake near her, from any way off within 8 tiles, never
  closing on it (the game's gun arm's cannon act, a shot about as often as it punched: tinkerer.gd `SHOT_WAIT`, his to change);
  her next whistle, held, braces it and charges its BIG SHOT where she points, fired as she lets go (the game's charged shot, its
  shell 2.5 tiles round at its full, the Golem thrown back by it; Twin, a second; "of Echoes", a weaker one after); far behind,
  it still rocket-jumps to catch up; left behind, whistled up beside her again; winding down as she falls. ITS NEW LOOK, his pick (“fist to a big gun, but id like him to have 1 wheel instead of legs”; of three ways to
  carry the gun, “At its side”): one great wheel in place of its legs, its giant fist a big gun at its side that charges and
  fires the big shot (its little cannon, or her tree's tesla coil, on its other arm for the small shots). Every move of it baked
  by `npx tsx tools/godot_golem_wheel.ts` (`assets/heroes/golem_wheel*`; the sculpt's GOLEM_RANGED, dev/golem_moves.ts
  golemRoll, golemChargeWheel, golemDownWheel); drawn with tinkerer_look.gd `WHEEL_LOOK`, ON at his “Yes, switch it on
  (Recommended)” once shown all its moves (off, the game's old look with legs and its cannon arm). The Golem's pictures (its run, its small shot, its charge, its rocket jump and everything
  at them, its take-offs and landings, its trail; the tesla coil's set) and her effects (its flash, the shell's blast), baked
  once: `assets/heroes/golem*`, `tinkerer_fx*`; what runs any way (the shell in flight, the beam, the tesla coil's zaps) painted
  as it comes by the game's own painter ported line for line, ahead of time off the screen's thread (`heroes/golem_paint.gd`;
  held against the game's pictures pixel for pixel: `npx tsx tools/godot_golem_shots.ts <dir>`, then `godot --headless --path
  godot -s res://checks/golem_shots_check.gd -- --dir=<dir>`, 71 pictures with her Contraption's bolt, none differing).
- THE BRAWLER, THE VETERAN: his three globes and his combos (taps the jab, the cross, the hook, the spinning elbow; holds the round
  kick and the push kick; a swipe his dodging jump, or with a tap or a hold set in fire the flying uppercut, the flying knee, the
  spinning jump kicks; locked at three, R cancels), each move carried and aimed as the art has it, its blow reaching each in its
  cone or crescent as its front comes to them; his action lines, after-images, bursts, rings and stars; the globes painted pixel
  by pixel as the game paints them: `assets/heroes/veteran*`.
`--only=heroes --cls=<class>` (`check_heroes.gd`, on floor 2 with three of its skeletons held where they stand): the Ranger 5 steps,
the Mage 7, the Warlock 11, the Tinkerer 9, the Brawler 7, each with what is drawn with him and his town pictures.

## A fallen hero: Normal and Hardcore

As the game has it (game/modes.ts; game.ts die, wakes, wakeSave, losses; main.ts wake; ui/panels.ts drawDeath, wakeLine): every
hero is made Normal or Hardcore on the class cards and kept so for life (saved, `mode`; a hero saved before, Normal). Fallen, he
stays down and the screen darkens round him; after two seconds (or a press) the screen of it (minimap.gd "death"). A NORMAL hero
in a dungeon: YOU FELL, "You wake in town.", and what it cost: what he found on that floor (gear, words, gold) and a quarter of the
gold he carried in (main.gd `entry`, the run as he came into the floor); "Back to town" begins the game again from the save made as
he fell, he in his town at his new level, the line of what it cost his first. A HARDCORE hero: YOU DIED, who he was and what he
did, what the Lexicon and the stash keep; "New run" begins again at the class cards, the Lexicon and the stash kept, and one more of
the lost counted (`deaths`). `--only=fall` (check_fall.gd) checks both, pictured; `--only=fall_live` the real way of it, the game
begun again from its save.

## The start screen (the cloud chat, 21 Nov 2026)

His pick, asked what to build next: “Title screen and menus (Recommended)”. The game begins at the start screen every time, as the
game's does (ui/panels.ts drawTitle, drawSmithMenu; main.ts mode 'title'; `scripts/title.gd`), its title theme playing (the
game's own, `assets/music/music_title.ogg`: from its start once, then round between the game's two loop points):
- THE RING ON THE HILL, ALIVE (`scripts/title_ring.gd`; art/title_ring.ts makeRingTitle): laid up out of the game's own layers
  (`assets/title/ring_*.png`, `ring.json`, painted by the game: `node tools/godot_title.mjs`), with its life drawn over them as the
  game draws it: the stars twinkling, the aurora's two curtains drifting with letters in them, the letters climbing the column,
  the runes swelling in a wave round the ring, motes rising off the hill, and every 8 s THE SURGE (light up the column, a wave
  across the sky, a ring across the hill, every rune flaring, a faint flash). Held to the game's own picture at ten moments of its
  life, surges included: within one level of colour everywhere (`node tools/godot_title.mjs --life <dir>`, then
  `xvfb-run -a godot --path godot --rendering-driver opengl3 -s res://checks/title_ring_check.gd -- --dir=<dir>`).
- THE MENU along the foot: CONTINUE where a hero is saved (pink, blinking; his line over it, "Warrior, level 3, dungeon 2"),
  NEW GAME (pink where there is no hero), LEXICON, OPTIONS; Enter continues. CONTINUE takes him on from his town, "Welcome back.
  The gate leads to dungeon N."
- OPTIONS: SOUND, ABILITIES (cooldowns or mana, below), PROMPTS (whether a new hero is shown how to play), PRACTICE ROOM,
  LEVEL SELECT, BACK; a line over them says what the abilities' switch means.
- THE LEXICON over the menu (ui/lexicon.ts drawLexicon): its five pages' tabs, each page's words (or "? ? ?"), the open word's page,
  the words kept for the next hero.
- NEW GAME: the class cards over the living picture put back into the dark, BACK (or Escape) to the menu. A hero saved, CONFIRM
  first warns "Press CONFIRM again to start over. Your saved Warrior will be lost."; pressed again, the game begins again from its
  save with the new hero, the old one's run dropped, the Lexicon and the stash kept. The cards remember Normal or Hardcore.
- Not as a fallen Normal hero wakes in town (he carries straight on), as the game has it.
`--only=title` (`check_title.gd`) checks it all, pictured; `--only=title_live` the real way of it, the game saving and begun again
between the steps.

The rest of the options, his pick: “Rest of Options (Recommended)”:
- THE LEVEL SELECT (defs.ts LEVEL_SELECT, his: “Test hero, any floor”; game.ts forTrial): the floors' page, a row for each part of
  the way down (1 to 20); a floor and a class make the game's own test hero for it (his level there, those levels' points spent, the
  ring lit, a full set of magic gear for the floor, every word that can be found down to it: made by the game, `assets/loot/trials.json`
  from `npx tsx tools/godot_loot.ts`), set down on that floor, told "Test hero, level N. Not saved.", untaught, never saved; fallen,
  he wakes in town a test hero still, from what was kept in memory. `--only=trial`.
- THE PRACTICE ROOM (game.ts forPractice): the game's practice hero of the class (level 10, the ring lit, gear, one of every other
  weapon, six of every word) in the arena (its look recorded from the game, `node tools/godot_record.mjs practice`; its layout and its
  packs made by the game, `npx tsx tools/godot_practice.ts`), every word slot open; packs of six keep coming up out of rifts (a brute
  leading every third, an elite with a word every other); struck down he is UP AGAIN; no experience, nothing drops but life orbs; never
  saved; its name in cyan at the top left. `--only=practice` (`scripts/practice.gd`).
- ABILITIES: COOLDOWNS or MANA (main.ts flipLimit, defs.ts MANA_MODE), on the options and the pause panel, kept with the Lexicon:
  with mana, each move that waits costs its listed mana x1.4 (the evasive move 6), less what would have shortened its wait (Swift
  cheaper, Heavy dearer), and needs only a moment between uses; refused without the mana to begin it ("No mana"); one held goes on
  while there is mana, paid as it goes; a roll one charge; mana from a base, Intelligence and gear, back 1.3x as fast; its globe on
  the HUD, a line under the bar over his head, "N MANA" on the moves; and every piece, every word burned into one and the Lexicon's
  gear lines read as the game words them then (Max Mana, Mana Regen, Mana Cost: `...Mana` in the loot and words exports).
  `--only=mana`.
- THE PAUSE PANEL: ABILITIES over its three buttons, and its third, "End run" (the run given up, the Lexicon and the stash kept: the
  start screen next) or, for a test hero or the practice room, "Leave".

## What glows, and the town's names (the cloud chat, 21 Nov 2026)

His pick: “Town lights & glows (Recommended)”. Held beside the game's own pictures, the town's light was already the game's (its
look recorded from it: the sun through the windows, the motes, the braziers, the ring); what was missing:
- WHAT THE MONSTERS' PICTURES GIVE OFF (render.ts monsterLit; engine/px.ts drawLights): every monster's frame carries its lights in
  the game's bake (the eyes in the dark, a cultist's fire, the Warden's maul going hot, the Stoker's furnace, a wolf's eyes), laid
  on over the place's dark, added; a light 7 or more across cuts a pool in the dark round it (2.6 times its reach, MONSTER_LIGHT_MIN);
  none while it is frozen. And the hero's own lights (a lit crystal, a feather) over the dark too, as the game draws them after it.
- THE TOWN'S SERVICES' NAMES (render.ts STATION_NAME, NAME_LIFT): GATE, WORDSMITH, LEXICON, STASH, MYSTIC, ARMOURER, STRANGER over
  each, in the town and the camp, on a dark plate in the small letters, white for the one he stands at (never the GATE's: it is
  walked, not used).
`--only=glows` (floor 2's cultists, pictured), `--only=townnames` (`check_glows.gd`).

Held beside the game's own town, one more difference turned up, and is the game's now: THE FIRST LEVELS (defs.ts FIRST_LEVELS,
MOVE_OPENS; game.ts moveOpen): a hero's slow move opens at level 2 and the evasive one at 5; till then they cannot be used and are
not shown (the quick attack's plate alone in the middle). The level that opens one says "A new move: WHIRLWIND." and gives it its
moment (ui/hud.ts OPENING, drawMoveToast): the quick attack's plate sliding over, the new one opening out from its middle with a
flash, two rings, turning rays and sparks in the friend's cyan and white, the dodge's button the same; NEW MOVE at the top of the
screen, its picture, its name large and how it is made. In play and for a test hero; the practice room has every move open, and so
do the checks of anything else. `--only=openings`, pictured.

## Set beside the game: floors and fights (the cloud chat, 21 Nov 2026)

His pick: “Compare more of the game (Recommended)”. Godot's pictures set beside the game's own on floors 3, 7, 12, 16 and 19 (where he
comes in, the biggest room's fight, the bosses' halls) and in the town as a new game begins. What differed, and is the game's now:
- HIS FACING AS HE COMES IN (game.ts enterDungeon: fx 1, fy 0, the owner's “always have the come down into the dungeon looking down
  right”): he was set facing so, but his picture kept the side he last faced, so he stood with his back to the screen. His picture's
  side is now read from his facing however it is set, as the game reads fx, fy as he is drawn (hero.gd `face`).
- THE LIFE GLOBE (and the mana globe) AS GLASS IN AN IRON BAND (hud.ts globeGlass; ART_TWEAKS.globe, on in the game since 12 Nov):
  the liquid's far side a shade deeper, a glint toward the light, a band of iron lit from the upper left, four rivets; the same as
  the game's to the pixel. And its thin ring takes the colour of what ails him (hud.ts lifeRim: burning, poisoned, chilled, shocked).
- THE QUEST MARKER (act1/quest610.gd `_Marks`) drawn last, as the game draws it after the names: over the place's dark and the
  services' names (it lay under the dark), and its glow the game's smooth fade in place of rings.
What looked different but is the game's own: the piece he came out of behind him on floors 6 to 16 (the stair down the spur on 7,
the ladder's foot on 12, the garden gate on 16), which the game draws too once its picture is painted, a moment after he comes in;
and the cultists' raised fire and the circle under him, the game's same cast caught at another moment. `--only=compare`, pictured.

## The gear screen and the shops in the game's own letters (the cloud chat, 21 Nov 2026)

His pick: “Game's lettering in menus (Recommended)”. Set beside the game's own, the gear screen and the shops were Godot's plain
letters and boxes, on the wrong half, and laid out otherwise. Now, as the game draws them (ui/inventory.ts, ui/town.ts, ui/ui.ts):
- THE PANEL ON THE RIGHT HALF (invRect), the game seen in the left half with the hero in its middle (main.ts renderer.view; beside
  a service the picture stays where it was), the HUD and the small map put by while it is up; a service (the vendors, the
  wordsmith, the stash, the Lexicon, the stranger, a stronghold's altar) on the left half; what is read on a card over the game's
  half, against the panel's edge.
- THE GAME'S LETTERS (its normal and small pixel fonts) and colours (ui.ts THEME), its boxes with their corners cut, its tabs, DONE
  pink; a line too long for its half broken as the game's wrapText breaks it.
- GEAR: the hero as he stands, twice his size, his scarf moving, between two columns of slots in the order of the body (an empty
  one shows faintly what goes there), his numbers at a glance beside him (the game's: DAMAGE is his weapon's, 7-11 for a new
  Warrior, where Godot had shown it with his Strength's share); +5 to place after a level on a row of its own.
- STATS, the game's fourth page: the attributes and the level, how far to the next, the defences and the attack.
- A PIECE'S CARD in the game's words: its rarity and kind, a weapon's damage and pace, what it was made with, its properties, the
  words burned in, the room left, the level it needs.
- THE VENDOR'S HALF as the game's grid: FOR SALE and BUY BACK (what was sold him on this visit, thirty kept, for what he paid:
  game.ts buyBack, new here), ten to a row; a piece pressed is picked (its card and BUY under the cells), pressed again, carried
  across or right-clicked, bought; a piece of the bag right-clicked or carried across, sold; one he cannot afford darkened.
- LEXICON beside the bag (WORD_LEX): every word he holds as its rune stone on a panel over the game's half. At a service, ALL
  (WORD_ROOM): the bottom turned to every word, BAG back.
`--only=menus` (check_glows.gd), pictured; the trades', services', melding, item words', skill trees', saved game's and words'
checks run again on the new screen, all as before.

## The effects that were stand-ins (the cloud chat, 21 Nov 2026)

His word: “Move on to the next task and stop asking. Keep going until everything is caught up”. What was still drawn plainly is
now the game's own:
- A RED CIRCLE COMING DOWN plays the game's own burst, its `blast` (game.ts updateZones 'burst'; fx.gd, as fx.ts), where a pale
  ring stood in.
- THE HEADSMAN'S VAULT (art/headsman2_shots.ts, line for line: vault_fx.gd): the spot marked as wide as the slam from his warning
  on, a ring burning, a second running in, the cracks to come glowing; the slam, its flash and rays, its cracks racing out
  burning, its crater, its shock ring of fire and wave of dust; over him, a column of fire out of the crater and flames out of
  the cracks, chunks of the floor flung up and bouncing, sparks, dust rolling; its fire lighting the dark.
- A MONSTER'S BONE ARROW (render.ts): its bone shaft six pixels long, its red head, its shadow on the floor. THE WARDEN'S BOLTS
  (and any monster's shot that is not an arrow): a ball of light of its element, turning (art/icons.ts orbFrame, three frames at
  twelve a second; tools/godot_orbs.ts).
- A BARREL OR AN URN BROKEN throws its eight sparks (game.ts breakProps), a lever pulled its six (pullLever).
`--only=fxleft` (check_glows.gd), each alone on floor 2, pictured.

## The wordsmith's ring's moments (the cloud chat, 21 Nov 2026)

As the game stands them (render.ts standRing3; art/ring3.ts swirlAt; art/townscene.ts swirlNow, columnSprite; art/quest3.ts
floatingOf), in the game's own pictures (tools/godot_ring.ts: town/ring_fx), each among what stands by how near it is, their
lights over the dark (town.gd `_ring_moments`):
- THE MASTER RUNE-STONE GIVEN rises out of the hero (0.5 s), floats over the slab (to 1.3), lies down over its hollow (to 1.6)
  and is laid in (1.9) with a burst of its light.
- THE COLUMN OF LIGHT over the slab: none while the ring is dark; rising off the slab as it flares; then burning, brighter and
  quicker as he writes a rune into the slab.
- THE LETTERS OF LIGHT, fourteen of his runes small and big, going round him at every height: bursting out of the slab as the
  ring flares; drawn in and faster as he writes; thrown out to the stones as the rune goes into the slab, and back.
`--only=town` pictures them (37 to 41).

## The Headsman's yard's own gate as it falls (the cloud chat, 21 Nov 2026)

- **Its fall and slam** (art/yard_gate.ts, YARD_GATE on at his yes in the yard in play, 1 Nov 2026: “Yes, switch them on
  (Recommended)”; render.ts standDoors): as the gate drops behind him it goes by its own beat, not the plain gate's 0.22 s
  (YARD_GATE_DROP, 30 frames a second from the moment it falls): held juddering at the top, dropped in two frames, a hard
  landing and a bounce off the floor, then down for good. As it lands the mark on its keystone (a block and the Headsman's axe
  cut in the stone) catches alight, its fire's glow added over the dark, and its SLAM plays: dust thrown off the cobbles both
  ways and rolling out low, sparks struck off the spikes (16 frames, the first lighting the floor), the screen shaking a little
  while its first four show. Risen again once the Headsman is dead, it is the plain look's, its mark dark. Its pictures the
  game's own painter's (`npx tsx tools/godot_yard_gate.ts`: `assets/looks/floor2_gate.*`), where the game puts them;
  `look.gd` yard_gate_fall, `doors.gd`. (The other four floors' own gates, behind their switches in the game, are off there.)
  `--only=yardgate` (`check_glows.gd`): 7 checks, its frames pictured.

## Frenzied on the prison's bosses (the cloud chat, 21 Nov 2026)

- **Frenzied on the prison's bosses** (game.ts updateMonsters `rage`, game/bosses.ts step): those of floors 2 to 5 that fight
  by scripts of their own (the Headsman, the Chained One, the Stoker, the Amalgamation, its bone beasts and mites, the mini
  fleshmancers, the Fleshmancer, the two keybearers) carry Frenzied as every other monster does: the more hurt, the sooner they
  act again and the quicker they go (their wait and pace by its rage, their acts' own waits by it too, the Fleshmancer's by his
  hurry on top once below half his life); and the Warlock's Withering slows them as it does the rest (`monster.gd` frenzy,
  rage). `--only=bossrage` (`check_glows.gd`): 9 checks, each at half its life (the Fleshmancer at three tenths).

## Seen through on floors 1 to 5 (the cloud chat, 21 Nov 2026)

- **What he is behind** (render.ts veil): on floors 1 to 5 and in the castle hall a big thing that stands (60 game pixels across
  and 70 high and more: the Stoker's crank, the Ossuary's bone carts and pillars, the temple's cages, the yard's great bell) is
  drawn at SEEN_THROUGH (0.38) while he is behind it and its picture covers his middle, his head or his feet, as the game does,
  and solid again once he is in front; for him alone (the monsters in sight are the open floors' rule, `seeThrough`, from floor 6
  down, which was in already). `look.gd` `_veiled`, `_see_add`. `--only=veil` (`check_glows.gd`): 16 checks on floors 2 to 5,
  pictured.

## Floor 9's side bosses fetched as their lairs are entered (the cloud chat, 21 Nov 2026)

- **A phone's thrift** (`monsters.gd` FETCH_AT, `baked_figure.gd` fetch): the Troll Chieftain's twelve sheets and the Mist Wolf's
  eight are not taken in as the Pinewood begins; each boss's are asked for off the game's thread once he comes within 1.6 of his
  lair's edge (the camp, the glade) or 18 tiles of him, far beyond what he can see, and are in hand by the time he does; until
  then nothing of them is held or shown. `--only=lairfetch` (`check_glows.gd`): 4 checks, pictured.

## The bosses' called lines in their own voices (the cloud chat, 21 Nov 2026)

- **Heard as well as shown** (game/boss_calls.ts, his pick “Words + his own sound (Recommended)”; engine/audio.ts speakBoss,
  BOSS_VOICES): as a boss begins one of his big moves his line comes up over him and is heard as a mumble in a voice of his own
  (the Warden's jailer's bark, the Headsman's cold breath, the Chained One's insane growl, the Amalgamation's many voices, ... the
  King's dying rasp). The game makes those voices in code as it plays; here they are the game's own voices' takes of every line,
  two of each, made by the game's own synthesizer offline (`node tools/godot_voices.mjs`: `assets/voices`, 13 bosses, 44 lines,
  88 takes) and played as he calls out (`monsters.gd` speak, `monster.gd` call_line). The bosses that called out
  in the Godot version without being heard are heard now (the Headsman, the Chained One, the Amalgamation, the Fleshmancer, the
  Unfinished, the Cantor), and those that did not call out at all now do, by the game's rule (`monster.gd` call_out: never two
  within 5 s, a basic blow's line not within 20 s): the Warden (his slam, his lockdown, his bolts), the Rat King, the Physician,
  the Prince, the Queen and the King (`act1.gd` start_act). `--only=voices` (`check_glows.gd`): 10 checks.
- **The Warped Wordsmith speaks in a real voice** (the cloud chat, 25 Nov 2026; the queue's boss-voices-and-roars). Asked whether
  he should speak in a real voice or mumble like the rest: “Can eleven labs do emotion?  I’d like him to sound crazed.  Not cold.  If
  not, I guess he can be cold, and let’s say Scottish.  With some phaser distortion from the magic”; of the two samples
  (docs/mockups/boss_voice/), “Take 1, use it (Recommended)”. Every one of his lines (docs/mockups/endless_tablet/README.md, HIS
  LINES) spoken by ElevenLabs (eleven_v4, the voice “Arkadius - Old Storyteller”, played [crazed] [strong Scottish accent]), two
  takes each, the phaser of his magic on them (`tools/godot_wsboss_voice.sh` -> `assets/voices/wsboss`, 36 takes, 0.9 MB): his
  five words' lines as each begins (Power “Kneel!”, Flame “Burn!”, Frost “Be still.”, Lightning “Storm, come!”, Poison “Rot.”),
  his ten melds' (`act3/wsboss.gd` WORD_LINES, say_aloud), the boar's line from the moment it is killed (a third again as fast, to
  be done by his slam), the slam's once it is done (say_later), and at his death a scream cut short as he implodes. `--only=final`
  (`check_glows.gd`): his voice heard, every kind of line.
- **The other talking bosses in real voices too** (the cloud chat, 25 Nov 2026). His word: “Go ahead and do the voices for the
  other speaking bosses as well”; asked how many takes, “Two takes each (Recommended)”. The 13 bosses' 44 lines spoken by
  ElevenLabs (eleven_v4, a library voice for each boss, each line played its own way), two takes each, the silence at either end
  trimmed, as loud as the roars, and some with a touch of their own: the Amalgamation three voices at once (one lower, one higher),
  the Drowned Eye as under water, the Unfinished lower in a stone hall, the Cantor under a cathedral's echo, the Glass Queen a
  glassy shimmer (`tools/godot_boss_voices.sh` -> `assets/voices/real`, 88 takes, 2.0 MB; which voice is whose, in its head). They
  take the place of the mumble's takes (`monsters.gd` voices(): `real/voices.json` over `voices.json`), and a line called out stays
  up over him while it is heard (`monster.gd` call_line). To listen: `docs/mockups/boss_voice/all_bosses_lines.mp3` (every boss in
  turn, the first take of each line) and `<boss>_lines.mp3`. `--only=voices` (`check_glows.gd`): 11 checks, the thirteen's lines
  all real takes.
- **Their lines as he meets them, and the Queen's looking-glass, aloud too** (the cloud chat, 25 Nov 2026). His word again: “Go
  ahead and do the voices for the other speaking bosses as well”; asked, with the voice credits left short of two takes, “One take
  each (Recommended)”. Each boss's line as his gate falls (the game's BOSS_LINES, three a boss, one picked: `doors.gd` LINES; the
  Drowned Eye's on his stone, `act1/stone.gd`), now said aloud in his own voice (`call_line`), the Chained One's growls too; the
  Queen's (“Looking-glass, Looking-glass, on the wall, who in this land is the fairest of all?”) and the King's (“Music! Music!”),
  which the game has, brought over to LINES. The Glass Queen's looking-glass (`act3/gqueen.gd` say: its four praises, its line as
  she hides in her ring, the truth as she falls) speaks in a voice of its own, “Matthew Schmitz - Whispering Spirit of the Gentle
  Calm”, a ghostly whisper, glassy and far off (the voice `mirror`). One take each: 38 takes (`tools/godot_boss_voices.sh`, which
  takes one take or two a line, -> `assets/voices/real`). To listen: `docs/mockups/boss_voice/meeting_lines_and_mirror.mp3`.
  `--only=voices`: 16 checks (as each of four bosses is met, his line heard); `--only=city --floor=18 --kind=gqueen`: 8 of 8.

## The walls seen through for the monsters behind them (the cloud chat, 21 Nov 2026)

- **Walls** (render.ts wallVeil): on floors 1 to 5 a wall between the eye and a monster in sight, near it on the screen, fades to
  faint as it does for him, over a narrower stretch (30 game pixels either side of it, wholly faint within half of that), and
  comes back whole once it is not; never a wall that is a back wall to it. `stands.gd` `_want`. `--only=wallsee`
  (`check_glows.gd`): 3 checks on floor 4, pictured.

## What stands behind raised ground, cut off by it (the cloud chat, 21 Nov 2026)

- **Raised ground before a thing** (render.ts hide, blockPath): on the floors with ledges and stairs (1, 3, 4 and 5) the ground is
  drawn before anything stands; so what stands on lower ground behind raised ground (or down in sunken floor behind its edge) is
  left out where that ground's block is before it, as the game shuts the screen to it there: the eight tiles before it whose top
  stands over its own ground, each a block from its top down to that ground (a flight of stairs a wedge; never the flight it
  stands on). Him (not while leaping), every monster, and the look's own standing things and walls (worked out once, as the floor
  is laid). `hide_clip.gd`: the blocks' outlines and a shader that leaves out what falls inside them. `--only=behind`
  (`check_glows.gd`): 5 checks on floor 4, pictured.

## Touch play, for a phone (the cloud chat, 21 Nov 2026)

- **Played with fingers, as the game is** (engine/input.ts; main.ts, its touch controls; game/lock.ts; `touch.gd`): no buttons for
  the moves. THE LEFT THUMB is a stick wherever it lands on the left 40% of the screen, at full speed past its small still
  middle (his words of 8 Oct: the same speed wherever the thumb is); THE RIGHT THUMB taps for the quick attack, holds for the
  slow one (kept going while held), swipes for the evasive move. WHERE THE ATTACKS GO, his pick of the game's four, switched in
  the pause panel and kept with the device: ATTACKS: AUTO AIM (the aim help locks onto the nearest awake and in sight within 10
  tiles, kept till 12.5 or 0.8 s out of sight, given up only for one 1.5 tiles nearer; a blade first for one it can reach; a
  volley and a vial where it is going), WHERE YOU TAP, THE WAY YOU FACE, ONE HAND. A touch on a service in town, a waypoint
  or the fallen wordsmith walks him there (round what stands in the way) and uses it; the screen's own things (INVENTORY, the
  flask, a move's plate, the small map, the pause button) and every screen of the game's are pressed as a mouse's. As the game
  draws them: the gold ring of dots round the one locked onto, the stick's ring of dots and its knob, the reticle on what a tap
  picked, the ring closing over the thumb as a press becomes a hold; and the screen's words a phone's (LEFT THUMB to MOVE, TAP,
  HOLD, SWIPE, INVENTORY, the flask larger and without its key). The app is held sideways and turns with the phone either way
  (the game's own way on a phone held upright, turned for him: `window/handheld/orientation`). The stick, the reticle, the hold's
  ring and the ghosts below are drawn over everything, the dungeon's darkness too, as the game draws them in its HUD (the gold
  ring stays on the floor). `--only=touch` (`check_glows.gd`): 7 checks, real touches, pictured.
- **The first dungeon's fight lesson, and its ghosts on a phone** (game.ts guideRows, updateGuide; ui/guide.ts guideBanner;
  main.ts hudIn.gesture; ui/hud.ts drawGesture; `guide.gd`, `touch.gd`): once an enemy awake has come near him, and in a fight
  till each is done, HOW TO PLAY with a line for each move open (TAP to STRIKE, TAP + HOLD to WHIRL, SWIPE to LUNGE; with a
  mouse LEFT CLICK, HOLD RIGHT CLICK, SPACE), each ticked as it is done, and once his life has fallen under 40% with a flask in
  hand, TAP THE FLASK (Q) to HEAL, the flask's edge lit and an arrow over it (the Lunge's, while its line is open). With a finger
  a ghost of the gesture the prompt asks for, where it should be made: for LEFT THUMB to MOVE a ring of dots on the left and a
  thumb pushed the way the dungeon goes; for the next line of the fight a ring closing on the enemy (a tap), a ring filling round
  the thumb on it (a hold), or a quick stroke on the right (a swipe); for the fallen wordsmith a tap on him; for the first word's
  move, its own. Kept in the save. The prompt now waits while the floor's name is across the screen, as the game's does
  (FLOOR_CARD_FIRST); and NEW MOVE says TAP, TAP + HOLD, SWIPE with a finger. `--only=lesson` (`check_glows.gd`): 9 checks,
  pictured.

## What the hero and the town's people say (the cloud chat, 21 Nov 2026)

- **Shown and heard** (game.ts quip, tags; main.ts `arrived`, speak; render/fx.ts their slips; `speech.gd`): the hero's word on a
  big kill (a boss always earns one; an elite or a champion 3 times in 10, never within 45 s of the last; from the lists that fit
  the kill, the boss's, a word's on the move that killed it, the move's, his weapon's, his highest attribute's, his class's, any,
  by their weights, none twice till all have been said); his line as he comes into a dungeon; what the armourer, the mystic, the
  wordsmith and the stranger say as he comes up (4 times in 10, never within 90 s of their last nor 30 s of anyone's). Each on
  the game's dark slip over whoever says it, and heard in their own voice: the game's own made voices, said by it offline into
  files (`node tools/godot_voices.mjs`, which now also says each hero's 210 or so lines and the town's 24: 1,358 takes, 6 MB).
  `--only=speech` (`check_glows.gd`): 4 checks, pictured.

## Uniques and magic find (the cloud chat, 22 Nov 2026)

- **Where they drop** (game/uniques.ts, UNIQUES on; game.ts rollGear, poolUnique, makePoolUnique, dropBossUnique, gamble;
  `loot.gd`): every piece of gear about to drop is now and then one of the pool's instead (2 in 1000 from an ordinary monster, 4
  from a better one, 8 from a hoard, times 1 + his magic find / 100, from floor 2): the ones for everyone and his own, never
  another hero's, and a Warrior only his own weapon's of his three. Failing that, as often, one of the leveling uniques of the
  floor's level or below, on any floor. A boss drops his own one kill in ten; the stranger's gamble gives one of the pool's of the
  kind thrown for 5 times in 1000. Each with the rare chime. The 88 (46 of the pool's, 20 bosses', 20 leveling ones, the final
  boss's two) are pieces the game's own makeUnique made at each floor's level, their numbers rolled (`tools/godot_loot.ts`,
  items.json `uniques`, 1,944 of them); their card as the game's: what each does in its own orange, its price in red, whose it
  is, "Cannot be crafted"; it takes no word, will not split or bind, and a Warrior's keeps its own weapon.
- **Magic find** (items.ts rollRarity; game.ts rollGear): the hero's Magic Find from his gear (the stats screen's), and the
  rarity of every piece by the game's rule: the chances of Magic and Rare at the floor's level, times 1 + magic find / 100, a
  better monster's luck (1.5, 2) or a hoard's (3, 4), and from floor 6 every roll 1.25 times luckier; a boss's or a guardian's
  first never plain, from floor 6 a rare. A piece of the rarity rolled is one the game rolled on that floor.
- **The hoards as the game's below floor 1** (game.ts dropLoot): the gold times the floor's level; a boss's four pieces on floors
  5, 10, 15 and 20; from floor 6 a boss's later pieces and a guardian's second with a hoard's luck.
- `--only=uniques` (`check_glows.gd`): 11 checks (the odds counted over 20,000 and 200,000 rolls against the game's), pictured.
- **What they do, the first of them** (game.ts “UNIQUE ITEMS”; game/uniques.ts bendWords, rolledTune; `uniques.gd`): each worn
  piece's numbers as it rolled them; the ones that bend his words (the Headsman's Hood, the Queen's Glass, the Cantor's Echo, the
  Undertow, the Hollow Crown and the Long Echo adding their word with no slot used; the Censor's Seal and the Quill's Band, one
  move stronger and the other wordless; the Two-Faced Mask; the King's Knot's borrowed word; the Amalgam's Heart's meld; the
  Songbird at full life, the Nettle Shirt's Vow, the Alloy Band, the Last Word; the Moth's Wing's dark word; the Dog-Eared Page,
  the Third Word and the Polyglot's Mantle's slots, closing again with their words back in his pouch when taken off); and his own
  rules: Bloodprice, the Long Odds, the Miser's Purse, the Press, the Half-Carved Hand, the Standing Stone, the Moth's Wing,
  Broken Shackles, the Dancing Shoes, the Physician's Coat, the Warden's Keys, the Crier's Hush, the Free Hand, the Sure Thing,
  the Kindling Rod, the Rot Axe, the Packstrap. A hero's own work only on that hero. `--only=uniquesdo`: 19 checks.
- **Those with looks of their own** (game.ts stepArm, callBird, raise, stepRisen; render/unique_fx.ts; `fx_uniques.gd`, its pictures
  the game's own baked by `npx tsx tools/godot_unique_fx.ts` into assets/uniques): the Drowned Arm (every 3 s a tentacle bursts up
  out of black water under the one he fights, whips down across it, slams and stuns what is there), the Queen's Talons (a critical
  hit calls one of her birds, diving out of the air onto the one nearest him, its shadow under it, a burst of feathers), the
  Fleshmancer's Brand (an elite he kills is pulled up off the floor where it fell, drained and glowing the friend's cyan, the floor
  cracked with light, the brand turning under it and burning away with its seconds, and fights for him; its blows' cyan bursts; it
  falls and fades), the Crier's Hush (the Hush's grey ring closing on what it darkens, its wisps), and the beam of the uniques'
  orange over any unique lying on the floor, shooting up as it lands. `--only=uniqueslook`: 5 checks, pictured.
- **The Warrior's greatsword's** (game.ts useBasic, windBlade, updateChannel, land; render/unique_fx.ts drawBlade): the Windcutter
  (every third Strike in a row sends a blade of wind on ahead through everything in its line, a crescent of rushing air with his
  cyan edge, a gust off his sword as it goes), Millstone (the Whirlwind spins for as long as it is held), the Pivot (Lunge lands in a
  free turn of Whirlwind); the Press with the rest above.
- **His battle axe's and warhammer's, Set 1** (game.ts parks, stepGyre, tithe, hammerStun, peal, weightQuake, meteorLands; render/
  set1_fx.ts): Gyre (his thrown axe stops at the end of its flight and spins there, cutting what is round it, wind streaming round
  it on the floor, two at most), Red Tithe (one that dies bleeding throws its blood in an arc to the nearest other, which bleeds;
  Cleave a little softer), Widowfall (Leaping Chop lands with a Cleave all round him, and all it strikes bleed), Death Knell (what
  his hammer stuns rings like a bell, its rings going out; struck while it rings it peals, stunning all round it; each stun
  shorter), Deadweight (each Smash in a row harder and slower, iron studs at his feet counting them; the fifth an Earthquake of its
  own; stopped, the weight drains away), Starbreaker (Earthquake calls down a meteor, its shadow growing where it will land, its
  fire streaming; it strikes as the hammer comes down, rocks flying, the floor left burning; with Tremors its fire again with each
  shake). `--only=uniqueswar`: 9 checks, pictured.
- **The other heroes' own** (game.ts, each where it acts; render/unique_fx.ts): the Ranger's Fan (three arrows a Shot, a little
  weaker, one enemy taking only one), Rainwalker (his Volley rains round him and goes with him), the Poacher's Bow (a Volley leaves
  one of his traps), the Hair Trigger (an arrow over his trap sets it off, twice as hard); the Mage's Shepherd's Crook (her Orb
  follows her), Tide (the Wave comes back), Tuning Staff (a Wave through her Orb makes it pulse, twice as hard), Prism (fire,
  frost and lightning each burn, chill and shock), Short Way (warp again soon and she snaps back); the Warlock's Ledger of Debts,
  Restless Tome (the book circling him in its own pictures, its fire streaming, setting his hellfire on what it touches), Burning
  Verse, Unsigned Pact (the demon stays, feeding on his life), Cloven Boots; the Tinkerer's Second Whistle, Sticky Wrench (her vial
  stuck in pitch, blinking, bursting twice as wide), Foreman's Wrench, Tow Line (her Golem rides her Blast Jump and pounds where it
  lands), Company Scrip (no cooldown, for gold); the Brawler's Fourth Globe, Last Round, Winning Streak, Sprung Heels, Receipt.
  `--only=uniquescls --cls=<hero>`: 22 checks across the five, pictured. (The Pack Collar comes with the Ranger's companions, below.)

### The Ranger's companions, and the Pack Collar

`scripts/companions.gd` (game/companions.ts; game.ts petsWanted, pickCompanion, pickCollarCompanion, updatePets, stepPet, petBite;
render.ts drawPets), on in the released game (its COMPANIONS switch: `tools/godot_release.ts` sets the release's switches before
`tools/godot_talents.ts` reads them, so `assets/talents.json` has the two talents and the Rally joined to the Wild Companion as the
game has them). Two talents on her tree: the HUNTING COMPANION (a hawk, a snake or a wolf) and the WILD COMPANION (a bat, a fox or a
tortoise), each bringing the one picked: in town, on its card on the TALENTS page (a row of the three, the one out lit); out of
town a tap says "Choose companion in town"; the first of the three until one is picked. The hunting one keeps at her right, the
wild at her left; each goes for a foe awake and near her (7 tiles; the tortoise only 2.5) and bites it, a share of her own hit
(the hawk's 30%, the snake's 20%, the wolf's 35%, the bat's 20%, the fox's and the tortoise's 25%), every 1.2 to 2.4 seconds by its
kind, and each bite does a word's work: the hawk's marks the foe (Precise: her next hit on it a certain critical, 5 s), the
snake's poisons it, the wolf's holds it a second (Binding), the bat's heals her by half the bite (Leeching), the fox's makes her
25% faster for 2 s (Swift), the tortoise's a shield of 6% of her life for 3 s (Guarding). Left 12 tiles behind, one is at her side
again. Nothing fights them. THE PACK COLLAR (her own unique amulet): one more, behind her, of her companion talents' lists (the
hunting list with neither), never one she has out; until picked, the next in the list after her hunting pick. Picked in town: the
game shows the row on the collar's card; this gear screen has no card that stays up to press on, so with the collar worn or in the
bag the row is on the GEAR page, at the foot of her numbers, under PACK COLLAR. Their pictures are the art chat's, baked by the
game's own monster baker (`tools/godot_companions.mjs` -> `assets/companions/`): drawn from in front or behind as each faces,
standing, going and biting, a soft shadow under each, coming in over a third of a second. The picks are kept with her talents'
(`picks`: "pet:hunt", "pet:wild", "pet:collar"), so a save keeps them. `--only=companions --cls=ranger`: 17 checks (none without
the talents; each talent's first out and drawn; picked in town and not out of it; the collar's choices, its first, its pick on the
gear screen; on a floor each of the six bites and does its word), pictured.

## Playing upright (the cloud chat, 22 Nov 2026)

- **The screen fitted to the window, as the game's is** (engine/screen.ts resize; `main.gd` fit_screen): a whole number of screen
  pixels to a game pixel, about 270 game pixels tall (on a phone a little bigger, and an even number where it may be), never
  narrower than 270 nor shorter than 200 if a smaller number can help it; so a phone held sideways sees as much of the floor
  across as the game shows it (no bars at the sides), and one held upright about 270 by 480 to 295 by 543. On a computer at 1920
  by 1080, 480 by 270 as before.
- **PLAY UPRIGHT** (main.ts turnLabel, flipTurn; `main.gd` turn_label, flip_turn): with a finger, in the pause panel and in the
  start screen's OPTIONS (with ATTACKS: AUTO AIM, as the game's options have it with a finger), PLAY UPRIGHT holds the app
  upright, PLAY SIDEWAYS turns it back; kept with the device. The pause panel with a finger is the game's: its taller buttons and
  its table of the finger's moves (left thumb, tap, hold, swipe, tap it, tap an attack).
- **The HUD with a finger** (ui/hud.ts): the life globe at the top left under the place's name, the gold and LV beside it, a larger
  INVENTORY under it and what has just happened under that, newest first (this was missing from the touch play before, both ways
  of holding it). **On a narrow screen** (under 380 game pixels across): the prompt and the news of a word under the corner
  buttons (NARROW_TOP), up to three lines of the prompt before it shrinks; the two attacks one above the other where they will not
  fit side by side, and then the Lunge's name not over its button.
- **The gear screen, the TALENTS page and the services upright** (ui/inventory.ts invRect, gameRect; `inventory.gd` _tall, _ph):
  the panel along the bottom, as wide as the screen and as tall as half of it (234 to 272 game pixels), the game (with the hero in
  the middle of it) or the service above; a card read stands over the panel's top edge, across from what it is about. The start
  screen, the class cards, the pause panel and the big map lay themselves out by the screen's size as the game's do (the class
  cards as the game's to the pixel).
- `--upright=1` runs any check in a window shaped like a phone held upright; `--only=upright` (`check_glows.gd`): 6 checks, the
  switch both ways, pictured. Run upright and passing: title 16, services 9, trade 11, meld 15, camp 9, companions 19, lesson 9.

## Every word on a dungeon: melded and ranked words, and their twists (the cloud chat, 22 Nov 2026)

- **On the altar and the gate** (game/act1_holds.ts problem, wave; game/foe_melds.ts layProblem; `act1/holds.gd`,
  `foe_words.gd`): a melded word (Hailstorm, Wildfire...) or a ranked word (Fire II...) may be laid, and counts as two words (how
  hard the dungeon is, how rich its reward). A melded word brings its two elements, and no word of another element, nor a word
  already in it (no Frost beside Hailstorm), may lie beside it; the same messages as the game's.
- **On the monsters** (game/foe_melds.ts; defs.ts FOE_WORDS, FOE_RANK; `foe_words.gd`, `hero.gd` hurt_by, `monster.gd`,
  `wakes.gd`): a monster given a melded word has its two parts too, and the meld's twist, all twenty, each with the game's own
  numbers (FOE_TUNE): Eruption's heat, Avalanche, Thunder's clap, Blight, Scald, Wildfire's sparking fires, Fumes' cloud that
  bursts if fire walks in, Hailstorm, Frostbite, Contagion, Demolition's and Powderkeg's dying blasts, Siphon (less healing while
  poisoned), Cauterize, Forking, Shiver, Sunder, Fervor, Rime Ward and Implode's pull. A ranked word hits half as hard again
  (FOE_RANK). The dungeon's card on the start screen and the gear screen tells each twist in the game's words.
- `--only=foemelds` (`check_glows.gd` foewords): 21 checks (the altar's rules against the game's own, the count of two, each
  twist's effect on a floor).

## Fewer repeats in the sound, and no constant sound but the music (the cloud chat, 22 Nov 2026)

The sound chat's fourteenth and fifteenth batches, as the game 25.3.22 has them (engine/audio.ts, game/sound_families.ts,
game/world_sounds.ts; `sfx.gd`, `monsters.gd`, `monster.gd`, `town.gd`, `main.gd`):
- **The enemies' grunt and death cry a third as often, by a count** (ENEMY_KEEP): a family's 1st, 4th, 7th … grunt is heard, and
  its 1st, 4th, 7th … death cries out; its others die with the plain sound of one with no voice. Champions always cry. Each of the
  23 voice families now has four takes of its cry on seeing him, its grunt and its death.
- **The hero's shouts and grunts a third as often again** (VOICE_TUNE keep): where the rules would play one, it plays one time in
  three, the wait counted from the one passed over too. Each hero has a new shout and a new grunt (attack_c, hurt_c).
- **Never the same take twice running** where a sound has three takes or more (playTake).
- **The music about a minute round** (MUSIC_PLACES: the town's and floors 1 to 10's walks and fights, `_long`, made by
  tools/godot_music.mjs; the short loops gone).
- **No constant sound but the music** (WORLD_LOOPS off): the floors' background loops, the braziers', the forge's and the ring's
  gone (the 31 loop files too, as from the game). Each place's sounds now and then on their own countdowns (AMBIENT,
  AMBIENT_FLOORS): floors 1 to 4, 6, 7, 8, 10 and 14's; the camp's breeze (three takes) every 13 to 30 s; a brazier's pop every
  10 to 25 s, heard only within 2.5 tiles of one. (The game's braziers in the cult strongholds are not in this copy's floors.)
- `--only=sounds14` (`check_glows.gd`): 8 checks.

## The unique weapons drawn as themselves (the cloud chat, 22 Nov 2026)

- **The heroes' pictures of the released game 25.3.22** (bake eccc11d9382f; since 24 Nov the demon from eight sides, de72bc23a8fd, below; tools/godot_heroes.mjs, read from the published game
  as `scripts/baked_hero.gd` reads it; the packs of a hero kept in packs, one file in the bake since 25.3.22, cut into a sheet each
  here as before): every group, the unique weapons' own among them, and the Warlock's demon a group of its own.
- **Holding a unique weapon, drawn holding it** (art/heroes.ts wornSkin, render.ts heroArt; `skins.gd`, `hero.gd` dress): the
  Mage's four staves, the Ranger's four bows, the Tinkerer's four wrenches, the Brawler's four wraps, the Warlock's four tomes (his
  arm blazing with each too; his demon as ever), the Warrior's three great swords, four axes and three hammers, each only while he is
  drawn with that kind (his tree's war axe or maul, or his great sword). Put down, his own again.
- `--only=skins` (`check_glows.gd`): 37 checks, a picture of each of the thirty.

## Endless mode (the cloud chat, 22 Nov 2026)

- **The endless levels** (game/endless.ts; game.ts endless, nextEndless, power, tough, storyHere; `main.gd` endless): the last
  floor's way home taken, endless mode opens ("Endless mode is open: the waypoint leads on, each level harder. Hardcore."), and
  from then the town's waypoint takes him to the endless level he reached ("E: Waypoint: to Endless 1"). Each is a floor of the
  twenty at random (never the one just beaten), its monsters as strong as its level's depth (21 for the first, one more for each
  after) and 10% more life and damage for each level before it; an elite with two words, a guardian with three. Its card: the
  floor's name, ENDLESS N under it, HARDCORE in the enemy's pink, up 1.5 s longer. No story on it: no quest people or pieces, no
  fallen wordsmith, floor 3's furnace out, floor 5's temple open with no key-bearers, no lesson or quest line; the strongholds,
  the Bells and the bosses as ever. Every way on leads to the next ("Endless 1 cleared"). A death there is the hero's end, Normal
  or Hardcore. What drops goes by its depth (the gold; the pieces and their chances as on floor 20, the game's tables going no
  deeper here); the vendors' too once it is open. Kept in the save; the deepest any hero cleared kept with the stash.
- `--only=endless` (`check_glows.gd`): 10 checks, pictured.
- **The Shaft's Rim, endless mode's town** (game/rim.ts, render/rim.ts; `rim.gd`, `town.gd` rim): his town once endless opens.
  Its layout from the game (tools/godot_town.ts), its look recorded whole (tools/godot_record.mjs rim: its ground, the shaft and
  its stair, the game's own things in its stone, its keepers, torches and posts); what changes on it drawn over that from the
  art's own paintings (tools/godot_rim.ts): the RECORD STONE, a notch for each endless level reached (at most seventy), the
  newest glowing on the visit it is cut ("A notch is cut in the record stone: Endless N."), its name the level reached and his
  best ("ENDLESS 4, BEST 9"); the TROPHIES wall, a mount for each shard of the tablet he holds. He comes in before the gate, the
  pit before him; back by the waypoint, on it. Walking round: the pit's brink, the standing stones and the braziers hold him off
  by their own round, a step at the brink taken round it. THE GATE is a service here ("E: Gate: words for Endless N"): up to three
  spare words laid in its sockets (each a gem of its colour in the gate), the game's rules for them ("One element per dungeon"),
  ENTER ENDLESS N; burned into that level (known in the Lexicon), every monster there carries them, and they pay: +30% items, +25
  rarity, +10% experience each, likelier words. Kept in the save (the stone's last cut, the gate's words; the shards with the stash).
- `--only=rim` (`check_glows.gd`): 9 checks, pictured.
- **The tablet's shards and the portal** (game/endless_key.ts; `shards.gd`, `rim.gd` key): on an endless level the boss of floor
  5, 10, 15 or 20 drops his shard if the account lacks it (TABLET SHARD over it in the uniques' orange, bobbing), taken by walking
  up to it ("A Tablet Shard. 2 of 4 (kept with the stash)."; SHARD 2 / 4 over him): the account's, kept with the stash. Held, they
  hang on the Rim's trophies wall and lie dark in the wordsmith's bench. With all four, the wordsmith sets them ("E: Wordsmith: set
  the four shards in the bench"): they burn, the flare goes up the shaft and the landing opens ("The landing at the shaft stands
  open."), the art's own frames; the tablet used up; walked into, "Down into the light." The landing stays open for that hero.
- `--only=shards` (`check_glows.gd`): 10 checks, pictured.
- **The bottom of the shaft and the Warped Wordsmith** (game/final_arena.ts, act1_rules/wsboss.ts, wsboss2.ts; art/endless_boss.ts,
  render/act1_fx/wsboss.ts, wsboss2.ts; `final_arena.gd`, `act3/wsboss.gd`, `act3/ws_marks.gd`, `act3/ws_paint.gd`): down through
  the open landing to his arena (its layout from the game, tools/godot_final.ts; its look recorded whole, tools/godot_record.mjs
  final), "The Bottom of the Shaft", ENDLESS N, HARDCORE; he waits on his boar across the floor and wakes as the hero comes down,
  as strong as the level reached. IN THE SADDLE the boar's moves (the charge down its lane, wheeling round, winded after; the gore;
  the rear up and stomp, three rings) and his five words take turns, each drawn at random, never the same twice running: POWER's
  hammer crushed down three times on his shadow, FLAME's meteors onto their marks and the floor burning, FROST's five lines of
  spikes and the rime behind them, LIGHTNING's orb drifting after him and zapping, POISON's traps snapping into clouds. Every
  warning before it can hurt, in the bosses' ground-warning pink. HIS RUNES, the Lexicon's own symbols, written at his claw stroke
  by stroke and thrown. AT HALF HIS LIFE the boar's last charge: it dies ("Rest, old friend. Your fury lives in me."), he is thrown
  clear and lands on his feet ("You will pay for this!"). ON FOOT his ten melds, each with its line: his rune and his shade's
  written, wheeling up round each other, melded and driven down, the slam's ring over the whole floor, then the meld itself
  (Eruption, Hailstorm, Thunder, Avalanche, Contagion, Scald, Blight, Fumes, Wildfire, Frostbite), each as the art chat drew it;
  spent between them from half to a quarter, none below. HIS DEATH: he implodes in pink, held at 1 while it plays. His hoard (the
  best drops in the game); "The Warped Wordsmith is undone."; the landing above closes behind him; "The light above is open: stand
  in it to go back up."; stood in it, back at the Rim. His pictures baked a move at a time (tools/godot_bake_moth.mjs wsboss), seen
  truly from each of his eight sides, never mirrored; his numbers, the art's times and tables, his hand's path for his runes and the
  pieces painted ahead (the hammer, meteors, ice, orb, spores, traps and clouds, the Blight's trees) from the game itself
  (tools/godot_wsboss.ts).
- `--only=final` (`check_glows.gd`): 28 checks, 42 pictures (each move and meld, the fall, his death, his hoard).
- **His fight to the title theme** (his words to the sound chat, 14 Nov 2026: “i want to use the main theme for the fight with the
  twisted wordsmith”; `music.gd` `final`, music.json by tools/godot_music.mjs): at the bottom of the shaft the title theme plays,
  from its start, then round between its loop points (94.024 to 162.275 s), at the level music's gain; no fight music over it.
  `--only=finalmusic` (`check_glows.gd`): 3 checks.
- **The fanfare as endless opens** (ui/endless_fanfare.ts, ui/endless_splash_draw.ts, art/endless_stair.ts; `endless_splash.gd`,
  `main.gd` endless_fanfare): the last floor beaten and he in his town, the game waits under THE SPLASH, the art chat's stair with
  no bottom (his pick: “2 The stair with no bottom”): out of the dark the storeys wake one after another down the shaft, each with a
  flash, a kick of the screen and dust off its ledge; the far fire takes; ENDLESS lands on the top of the shaft; THE WAY GOES ON,
  then HARDCORE. 3.2 s, or a press after 0.8 s; then THE CARD, what endless mode is, until GO ON (Enter or Space once it has been up
  half a second). The picture, its stage map and its living pieces from the game itself (tools/godot_splash.ts); laid up as the game
  lays them, pixel for pixel the game's own at every moment pictured.
- `--only=fanfare` (`check_glows.gd`): 7 checks, 11 pictures (the splash at nine moments, the card, the game on).
- **Packs as big as the game makes them** (game.ts fillPack; defs.ts PACK_GROWTH, GATE_TWIN_PACKS; `main.gd` grow_packs): an
  endless level's packs as big as its level has them (5% more for each level past the first, held at double), and with Twin laid
  on a dungeon (at the gate or on the altar) half as big again; each one more one of its own pack's, laid near it, asleep. A word's
  chance held at triple however deep (WORD_GROWTH). In the practice room every talent point (PRACTICE_TALENTS: his “And can I get
  all the talent points in practice mode?”).
- `--only=packs` (`check_glows.gd`): 4 checks.

## Memory: held only when wanted (the cloud chat, 22 Nov 2026)

Asked after the web game crashed on his phone on the later floors (“I was having some bad crashes in the later levels.”; then
“Will this be a problem in godot?”): measured floor by floor (`--only=memfloors`, `check_glows.gd`: what Godot holds in town, at
each of floors 11 to 20 as it begins, once he has been through every room, once he has stood there, and back at its start, and the
final arena; with each figure's pictures held and how near its nearest monster is, written to `<shots>/memfloors.txt`;
`WS_MEM_FLOORS="16 17"` for only those floors). Two things were held that need not be:

- **The item tables** (tools/godot_loot_split.mjs, run at the end of tools/godot_loot.ts; `loot.gd` imbue_options,
  `_piece_of`, `_gamble_pieces`): items.json was 40 MB of text and 687 MB once read whole, before the title screen. Now what a
  word becomes on each piece is read one option at a time as it is asked for (each of its 4,422 options written once, a line
  of text in `imbue.json`, made a thing only when wanted: no `.bin`, which an app's build would leave out), each floor's
  pieces only for the floor of the last drop (`depth/<d>.json`), and the
  stranger's only as he throws (`gamble/<d>.json`). What Godot holds in town: 842 MB before, 194 MB now. Every one of the 12,208
  lists, the 20 floors' pieces and the 20 gamble tables read back exactly as the whole file had them.
- **The monsters' pictures** (`baked_figure.gd` `near`, fetch, collect, whole, let_go; `monsters.gd` NEAR_FETCH 40 tiles,
  NEAR_DROP 52, NEAR_KEEP 10 s; `monster.gd` NEAR_SHOW 30): every floor's own figures were taken in whole as it began, a boss's among
  them though he waits in his own room at its end (the Censor 147 MB, the Scraper 98, the Crier 79, the King 77, the Rat King 73).
  Now a figure's pictures are asked for off the game's thread once one of its monsters is within 40 tiles of him, and let go of
  once none has been within 52 for 10 seconds. A monster is drawn within 30 tiles (past the screen's edge every way it is held: a
  phone upright reaches about 25 at its corners); one come up beside him before its pictures are in waits unseen the few frames
  till they are, for taken in at once the game stood still that long and blows skipped their moments (floor 13's check: 11 or 12
  of 13 so, 13 of 13 now). Pictures asked for and come in are taken into hand at once, and those still on their way when a floor
  is dropped taken off the loader's hands, for Godot's loader holds any it is never asked for again. The Moth's, taken in a move
  at a time, let go of the same way while he is below her tower, and asked for as he goes up its stair (the screen kept dark, at
  most 3 s, till they are in: `act3/tower.gd`). Floor 9's side bosses as before (fetched as their lairs are entered).
- Pictures held as each floor begins, before and now (MB): floor 11 345 / 239, 13 445 / 236, 15 407 / 195, 17 432 / 359,
  19 406 / 230, 20 461 / 276; back at a floor's start after the whole of it has been walked: 11 249, 13 246, 15 195, 16 243,
  17 354, 19 288, 20 288. The final arena 181 / 114.
- Checked: the city's and the High City's (`--only=city --floor=11` ... `20`): 11 to 19 every step as the game's; 20, 23 of 26
  (a grip, a comb and a charge that land in some runs and not in others, with this switched off as much as on; and the trapdoor,
  which some runs does not open after the Moth's death as the game is left paused then, off as on: not yet looked into);
  `--only=lairfetch` 4 of 4, `--only=boss` (floor 3) and `--only=final` 28 of 28.
- `check.json` (assets/words, 399 MB, for the words check only) is never kept in the repository, so it is in no build.

## The night of 22 Nov 2026 (the cloud chat)

His words, going to bed: “Can you do what you just did to my whole game?  Just make sure it's working properly?  Like no
hiccups from beginning to end?”, “And look for things that are wonky or something that's needed that isn't in the game yet”,
“The warlock's demon form is one of the weaker character identities in terms of performance, impact, and fun.  Love his look,
but something about his attacks don't give off massive threatening menacing demon.  That and the skill tree need work.”, “The
warrior has an issue where he starts with the greatsword but would have to pay a talent point to select greatsword.  So maybe
he can swap to axe or hammer at level 1.”, “And make sure the words, talents, and uniques all work together correctly to
augment attacks.  I want things to compound as they are added to attacks or abilities.”

- **The Warrior's weapon, a pre-point** (`talents.gd` is_weapon, spent, pre_point, next_point, starting, swap_out;
  `talents_page.gd` lay_out, draw: the WEAPON row; `inventory.gd`, `hud.gd`): at his words the morning after (“No I mean I don't
  like the trees starting with a weapon swap.  I want the swap to be available but not be part of the talent tree pathing.  Like
  it's a pre-point, something that can be allocated in the talent tree area but before you get into an actual branch”), his
  weapon is no stone of his tree: each weapon's name on a plate at the foot of its own shape on the TALENTS page (his word
  after the first try, a row under the tree with lines fanning up from a rune: “Okay but that looks bad visually so can you fix
  that”: no rune, no lines up from it, the tree come down to fill the page, the shapes of the two weapons he does not hold
  fainter), the one he holds lit; pressed, its card (WEAPON: FREE TO SWAP; SWAP TO IT (NO POINT), or YOURS), his picture made
  again at once with the new weapon in his hands; `--only=talpage` pictures the page.
  The greatsword his as he starts; another in its place at any level, anywhere, so long as nothing more on the old one's path is
  taken (“Undo the greatsword's talents first”). It costs no point: his ten go on the tree's own, the first at level 5, as every
  hero's. The tree begins at each path's own first talents; only his weapon's open.
  `--only=talents`: 83 checks (a new Warrior at level 1 swapping to the axe and back, the row under the tree).
- **What he adds compounds** (`hero.gd` side, word_k, talent_hit; `words.gd` resolve `word_k`): a blow of one of his moves
  was made of everything already, each a multiplier on the rest. What else he sets off now is too: a talent's arc or its
  burning ground, a unique's own blow, a companion's bite, the Golem's coil, the ground a word behind leaves, the last
  words' spirits each take his talents' and his uniques' multipliers on the enemy they strike, his might, and, where they
  come of one of his moves, what that move's words make of its hits. `--only=compound`: one fire hit of a talent's, as
  each thing is added: 9, Power in front 12, and Heavy 19, Executioner 38, The Long Odds 52.
- **The whole game walked** (`--only=smooth`, `check_glows.gd`; `WS_SMOOTH="floor3 floor4"` for some): every place in turn
  (the town, floors 1 to 20, the camp, the Rim, three endless levels, the final arena), walked from room to room at his own
  pace for 24 s each, every frame timed: 5 stalls in all (frames slower than three times the middle and 120 ms over it:
  floor 18 three, floor 20 two), the slowest frame 221 ms (in this machine's software drawing, frames 19 to 89 ms in the
  middle). FLOOR 9'S SIDE BOSSES (the Troll Chieftain's and the Mist Wolf's pictures, 169 and 116 MB), fetched as their
  lairs are entered, are now let go of once he is far, as every figure's: floor 9 back at its start 999 -> 623 MB.
  `--only=memfloors` counts the floor's look, the films and the hero's own pictures as well as the figures'.
- **The Warlock's demon made terrible** (`heroes/warlock.gd` DEMON2, D2; behind its switch, OFF till the demon's new art is in and he has seen it: “Let's wait for the new demon art before anything happens”, 22 Nov 2026;
  `--demon2=1` on for a run): his look kept, every picture of it; CLAW RAKE a sweep through everything in a wide arc before
  it (2.6 tiles), 1.7 of a hit (1.3), what it tears cursed and burning in his hellfire, each rake that lands shaking the
  screen and stopping the world a breath; DAMNING every 4.5 s (6) under every enemy near, not only the cursed and burning,
  their burns paid half as much again, each thrown half as far again and stunned; DEMON STEP's landing half as wide again,
  as hard as a hit, stunning, the ground left burning; DREAD, every enemy within 4 tiles slower by a quarter and taking a
  fifth more from him, and he taking 30% less; THE CHANGE's roar 4 tiles, striking as a rake and stunning all but a boss.
  HIS TREE: Bound Demon no longer keeps him a man (when the demon burns out it tears free and fights beside him 8 s more);
  Terrible Roar's roar half as wide again; Hunger 3 s a kill, Bloodlust 15%, Hellwave every other rake and harder, Damned
  Souls, Hex Chain and Pyre harder, Soul Debt a sixth of his pact. Its hero check 11/11 on and off; on, a rake 16 (10),
  Damning 120 (58), thrown 2.1 tiles (1.3). The film: `--only=demonfilm --cls=warlock` under `--write-movie <file>.avi
  --fixed-fps 30`, with and without `--demon2=1` (docs/mockups/demon2/).
- Floor 20's stalls, looked at (`--only=smooth` names each as it comes, how much of the frame was the game's own work): 0.17 to
  0.24 s frames, two to fourteen in a walk as the fights fall out, while the Rime Shade, the Order and the Hush in its own shape
  fight near him; the game's own work, not the drawing, and not the monsters' own steps (none over 60 ms): the effects' or the
  ground's work, for a profiler's session to find.
- A GAME IN AN APP: the phone put away in a dungeon, the game waits under the pause panel and comes back as he left it (`main.gd`
  _notification; it saved already, and still does); never in the checks. And what an app's build packs: pictures, sounds and
  `.json` only, so nothing the game reads is kept in another kind of file (the gear options' `.bin` was the one: now in
  `imbue.json`). Not here yet: the app's own build settings (export presets for Android and iOS), his to start when he wants
  the game on his phone.
- The city check's trapdoor (floor 20) keeps him from harm: a blow that took all his life in one frame laid him down, and
  the fallen hero's screen paused the game, the trapdoor's clock with it.
- **The Warrior's Whirl, and the Whirlwind his tree's** (his word, the morning after: “The warrior should start with WHIRL which
  1 spin and does more damage in an AoE around him than a single strike.  Whirlwind should then be the talent point that decreases
  the damage but adds the channel effect for more spins.”; as the game has it, defs.ts SKILLS.whirl, game/talents.ts warriorKit;
  `hero.gd` _begin_whirl1, _land_whirl1, arm; `hud.gd` _skills; `tools/godot_words.ts` now exports `whirl`): his hold, pressed,
  is WHIRL, one spin, his whirlwind's picture gone round once; a fifth of a second in everything within 2 tiles of him is cut for
  1.4 of a Strike, the screen shaken, what the words behind it leave left round him; ready again after 3 s (RIGHT CLICK, WHIRL on
  its button). His tree's WHIRLWIND (gswhirlwind, takeable now) makes it the Whirlwind as before: held, round and round, each cut
  0.55 of a Strike. The checks written for the Whirlwind give him its talent (talents.gd `checks_whirlwind`); `--only=whirl1
  --whirl1=1`: 2 checks (one hold of Whirl cuts the three within 2 tiles once, 14, 16 and 16, not the one 3.4 tiles off, nothing
  more while held; with the talent, about five cuts each in 1.6 s).
- **The attacks changed, each a twig off its branch** (`talents.gd` TWIGS, _twigs): his word the same day (“the different
  weapon attacks are choices not mandatory in the tree.  So swapping from whirl to whirlwind should be a small beach off the main
  tree.  Etc”): the three talents that change one of his attacks are no longer stones on each weapon's main path but small ones
  on a short twig off its first talent, open once that is taken, never needed for the rest: WHIRLWIND off Sweeping Cut, TWIN
  AXES off Rend, TREMORS off Heavy Head. Each weapon's path goes straight on up without them. `--only=talents`: 83 checks
  (Whirlwind not open with the greatsword alone, open after Sweeping Cut; the path on up taken without it);
  docs/mockups/warrior_free_weapon/talents_page_twigs.png.
  EVERY CLASS'S, the same (asked whether the others' should be so: “Yes other tree options of attack swapping should all be
  their own branch off the main paths”; `talents.gd` TWIGS by class, RELINK): THE RANGER's Snare off Wide Traps, Snipe off
  Split Shot, Rally off Wild Companion; THE MAGE's Ball, Beam and Spear off Kindling, Charged and Bitter Cold, each a small
  stone now; THE TINKERER's Contraption off Cluster Vials (no longer the way from Fortune to Mad Mixture: Fortune off Bombs Away
  alone) and Gun Arm (the Golem's cannon for the tesla coil) off Lightning Rod, the first of each of her paths, MARK II, which
  hung off Gun Arm, in its place on the Golem's ring. The Brawler has no talent that swaps an attack; the Warlock's nearest,
  Bound Demon (his change swapped for the demon at his side), is left a big stone, at the end of its path already, nothing
  beyond it.
  `--only=talpage --cls=<class>` pictures a class's page (nothing taken, then its first talents);
  docs/mockups/attack_twigs/.

- **The damage check** (`--only=dmg`, `scripts/check_dmg.gd`; `tools/godot_dmg_gear.ts <ilvl> <file>` for `WS_DMG_GEAR`, and an item
  level 5 one for `WS_DMG_EARLY`; `WS_DMG="ranger warrior"` for some): at his words (“I'd like you to check on damage.  I feel like
  right about the time you get a word in back and in front of your attacks the damage kinda skyrockets. ...”), min/max heroes of
  level 50 with the best floor 20 gear and words for their quick attack, step by step from no words to all four, measured into
  an elite that cannot die and a pack of six on floor 20, and early on at level 10. What came out, and why:
  docs/reports/damage_check_2026-11-22.md.

- **Words add up; attributes give less and less** (`words.gd` WORDS_ADD, ATTR_CURVE, eff_attr; `loot.gd` derive): his word after
  the damage check (“I like the additive bonus to words, but maybe just have attributes have diminishing returns on scaling.  I
  don't like a cap”): the bonuses of the words in front of a move (Power, Heavy, Precise, Thunder's bolt) are added up into one;
  an attribute counts in full to 50 (ATTR_KNEE), then 50 + 100 x ln(1 + the rest / 100) (ATTR_SPAN): 100 counts as 91, 200 as
  142, 340 as 186, 640 as 243, and on, never capped; read by a move's own bonus, every word's growth, and Dexterity's speed and
  critical chance. And (his “Yes” to it after that change's check left the poison at millions) POISON_SPREAD: a poison dose is
  its share of the hit over its 4 s, not each second of them (a quarter as much a second); eight doses still add up, gear's poison
  as it was. `checks/words_check.gd` turns all three off and holds the rest against the game's own: 341479 loadouts, 0 differ.

## Feature complete: the browser game's last features, the fun fixes, the phone (the cloud chat, 22 Nov 2026)

His words: “So now the game runs well, the game is balanced, and with all the classes running at 30fps it looks good.  So now
we gotta make sure it's fun and feature complete and we're good to go”; the list of what was missing
(docs/reports/missing_features_2026-11-22.md), then “Start all that, but I want the level 10 boss named the Drowned Eye.  The
swamp colossus was just a description for the art” (floor 10's boss keeps its name).

- **Splitting breaks every arrow** (`city_words.gd` SPLIT_EACH, `heroes/kit.gd` striking): `--only=split`.
- **The exits' names** over a way out once it opens (`ways.gd`, `stairs.gd` exit_labels, `exit_names.gd`; EXIT_LABELS):
  `--only=exits`; docs/mockups/exit_names/.
- **The fun fixes**: (the Lunge open at level 2, `words.gd` EVADE_AT, made and then turned off at his word: “I don't want the
  dodge in the first dungeon.  I like it unlocking later.”: it opens at 5, as the game has it); the red trolls charge in floor 1's small
  lairs (`monster.gd` CHARGE_SHORT; `--only=charge`); the Carrion Queen's Eclipse ends with her (`act1/queen_marks.gd`;
  `--only=eclipse`); the Colossus's crash slows him (`act1/colossus.gd`, `hero.gd` surge_k; `--only=crash`); Fervor quickens his
  attacks (`melds.gd` fervor_pace); Twin a second blow on the Wilds' monsters and the bosses (`monster.gd` twice_act, TWIN_ACTS;
  `perils.gd` _twin_mark), Vast a move's swing longer and a ring striking as wide as drawn (`monster.gd` _far, VAST_SWING;
  `perils.gd` wide; `--only=twin`); the stronghold altar tells of the hall's waves (`inventory.gd`; `--only=quests610`). The
  skeleton champion's rally on floor 1: none to change (the Godot copy's floor 1 has no champion).
- **A phone's notch and rounded corners** (`main.gd` safe_insets, place_safe): the HUD, the small map and the gear screen kept
  within the phone's safe area, as the browser game kept its canvas (engine/screen.ts env(safe-area-inset-*)), the world still
  to every edge; `--only=safe --phone=2532x1170 --safe=141,0,141,63` (and `--upright=1 --phone=1170x2532 --safe=0,141,0,102`).
- **The app's icon: the wordsmith** (his pick of four mock-ups, docs/mockups/app_icon/: “D, the full wordsmith”): the wordsmith
  writing a rune in the air (the released game's townsfolk pictures, 'wordsmith:act' at its brightest) on the town's night blue,
  the ring's cyan glow behind him; `icon.png` and `icon.ico` (the window's) too. At a phone's sizes (`assets/app_icon/`, at
  whole-number sizes, the art's own pixels kept):
  `icon_1024.png` for an iPhone (no see-through; the rest made from it); `android_main_192.png`, and the adaptive icon's
  `android_fore_432.png`, `android_back_432.png`, `android_mono_432.png` for Android.
- **The Windows app** (his pick, 28 Nov 2026, told his copy on his computer, run from the project's own files, had never played a
  sound while the game itself does: “Yes, make it (Recommended)”): `export_presets.cfg` "Windows Desktop" (Wordsmith.exe beside its
  Wordsmith.pck); `.github/workflows/windows.yml` builds it on GitHub's Linux machines with every update of main (or when the
  workflow changes, or by hand) and keeps it on the run's page as Wordsmith-Windows, with HOW_TO_PLAY.txt. Its saved game is where
  the project's always was (user://, no custom folder), so a save carries over. First build: run 46102677421, 659 MB, its data
  packed here and run with the title's music heard in its recording.
- **The iPhone export** (his word: “My phone is an iPhone”; `export_presets.cfg`, iOS): Godot 4.7 makes the whole Xcode project
  here (`godot --headless --path godot --export-release "iOS" <dir>/Wordsmith.xcodeproj`, with the iOS template in
  ~/.local/share/godot/export_templates/4.7.2.stable/ios.zip); the app itself (.ipa) is made from it on a Mac (xcodebuild).
  Held sideways; the checks' data left out (the game's data 620 MB); the team ID and bundle identifier stand-ins until his
  Apple developer account. ON ONE OF GITHUB'S MACS (`.github/workflows/ios.yml`, run by a change to it or to
  `.github/ios_build.txt`; macos-26, Xcode 26, which Godot 4.7.2's template needs: Xcode 16.4 could not link it): Godot makes
  the Xcode project there and Xcode builds it, not signed yet: run 2, 22 Nov 2026, BUILD SUCCEEDED, Wordsmith.app 690 MB, in
  about 10 minutes. Signing and TestFlight to his phone wait on his account.
- **The Android app, for Google Play** (his word, 25 Nov 2026, asked what to start next: “How about the app for google play
  store?”; then, asked about the account, “Not yet, I'll make one (Recommended)”, and for testers, “Friends have them”).
  `export_presets.cfg` "Android": the Play bundle (.aab) built with Gradle, arm64, target Android 16 (API 36, as Play asks of new
  apps from 31 Aug 2026), from Android 7 (API 24), held sideways, the wordsmith icon (plain and adaptive), package
  `com.wordsmithgame.wordsmith` (as the iPhone's). ON ONE OF GITHUB'S LINUX MACHINES (`.github/workflows/android.yml`, run by
  a change to it or to `.github/android_build.txt`): Godot 4.7.2 and its Android templates, the SDK's Android 16 platform, the
  Gradle build; run 1, 25 Nov 2026: built in about 8 minutes, 601 MB: the app's base 26 MB, the game's data in an install-time
  asset pack (Godot 4.7's own `assetPackInstallTime`) 599 MB, under Play's 200 MB a base, 1.5 GB a pack, 4 GB in all. Signed with
  a key made for the run and thrown away: the upload key waits on his Google Play account (the repository is public, so the
  key never goes into it). His steps, the store text and the road to going public: the doc “Wordsmith on Google Play”
  (https://claude.ai/artifact/H6PTRKJ7E5VFjDDj8rU58e). `--touch=1` (`main.gd`): any check's pictures as a phone shows them (TAP,
  HOLD, SWIPE), for the store's screenshots; `docs/mockups/play_store/`: the 512 icon and two banners for his pick (“B, the
  whole scene (Recommended)”). THE STORE'S SIX PICTURES, `docs/mockups/play_store/screens/` (and `screens_sheet.png`), taken by
  `--only=store --scene=<chained|queen|wilds|king|town|gear> --cls=<hero> --shots=<dir>` (`scripts/check_store.gd`): the Warrior,
  the Mage and the Ranger only (his words: “I want the sell the warlock, tinkerer and brawler for $0.99 so I'd like to keep the
  pictures to the first three classes”); every word slot filled; the Mage facing us in town; the Wilds in Echo Canyon; the Ranger
  not using his Volley in either of his. His yes, 25 Nov 2026: “Looks good”.
- **Delve Deeper** (`main.gd DELVE`, switch; his words, 25 Nov 2026: “I think I want endless to have a button that says delve
  deeper that makes the content harder and more rewarding.  It can't be reverted, so going to a harder difficulty is permanent.
  You can stay on one difficulty as long as you want, but the deeper you go, the better the loot.  I want players to be able to
  fight the end end boss multiple times”; his picks: “At the Shaft's Rim (Recommended)”, “Medium (Recommended)”, “Any boss, 1 in 3
  (Recommended)”). On, an endless level is no harder than the one before it; how hard is the hero's DEPTH (`delve`, from 1, saved
  with the run; `best_delve` the account's), raised only at the Shaft's Rim's record stone ("E: Record stone: delve deeper to Depth
  2"; used once it says what it does and that it can't be undone, used again within 5 s the hero goes a depth deeper, for good;
  its name "DEPTH 2, ENDLESS 14"). Each depth: monsters a third stronger (life and damage, `endless_tough` = (4/3)^(depth-1), the
  final boss too), finds as three endless levels deeper (`endless_power`), 15 more magic find on an endless level (`delve_mf`),
  experience by the finds' depth. The Tablet Shards stay the bosses' of floors 5, 10, 15 and 20 (his word: “Wait no I want that
  to stay on just the 5,10,15, and 20 bosses”). Off, endless is as it was (10% a level). How it is shown is being redone (his
  word on the record stone's first pictures: “I think we can do better than that”). HOW IT IS SHOWN, his words, 26 Nov 2026: “Maybe
  some sort of UI on the stone that shows the leaderboard for depth per class.  And a delve deeper button on the door?  So when
  you're putting in your words you can make the choice”; his pick, “My bests now, online later (Recommended)”: the Rim's gate page
  (`inventory.gd _gate_depth`) shows the hero's DEPTH and what it does, and DELVE DEEPER beside the way in (pressed once it asks,
  CONFIRM DEPTH N, for `DELVE.confirm` seconds by the clock; pressed again, a depth deeper); the record stone opens his deepest with
  each hero (`main.gd delve_best_by`, saved with the meta as `bestDelveBy`; `inventory.gd _rec_side`), deepest first, then by the
  last endless level cleared there, the hero he plays lit. Everyone's scores online wait for his Play account (Google Play Games).
  ON at his yes, 26 Nov 2026: “Yes, and the first time you use the door, I’d like it to explain the delve and the door mechanics.  Or
  have a “speak to the wordsmith” to explain what’s going on”: the first time the gate's page opens, the wordsmith's word on how it
  works (its dungeons, the words burned in, the door's own words, the depth, the record stone; `inventory.gd _gate_help`,
  `main.gd gate_taught` kept with the meta), GOT IT to the page; its ? says it again.
  Check and pictures: `--only=delve` (`check_delve.gd`, 16 checks); `docs/mockups/delve/` (`delve_door_and_stone.jpg`,
  `door_delve_0_help.png`).
- **The five weakest floors remade** (`main.gd LEVELS2`, ON at his yes to the pictures, 26 Nov 2026: “Yes, all five (Recommended)”; the browser game's `src/game/levels2.ts`, its map-maker for
  them; his words, 25 Nov 2026: “And I'd like you to look at our level design, find the five weakest levels, and make changes”;
  his pick of the five and their changes: “Yes, these five (Recommended)”). On (or `--levels2=1`), floors 1, 7, 8, 10 and 19 are
  read from `assets/floor<N>v2/` and their looks from `assets/looks/floor<N>v2*` (`files_of`, `dir_of`): 7, two side ledges (a
  vultures' nest with three chests, a lookout held by a champion's pack) and two packs on every leg of its trail; 8, a second way
  round the rock between two of its areas, meeting the first again, and a side cave (a champion's pack, a chest at its back); 10, a
  second way across the fen by two islands of its own, and a sunken shrine (its chests among the statue's head, broken columns,
  fallen drums and a broken stair); 1, a small fight in every corridor leg of 8 tiles or more (66 monsters to 99) and a side
  crypt (two sarcophagi, burial niches, one chest); 19, twice the packs (14 to 28), the palace guard and the footmen among its
  own, and an armoury wing off the hall before the throne (a yellow pack and two more, the racks, armour, anvil and war table,
  its chests). Off, every floor is as it was (each exported with the switch off and compared, the same). Made by
  `WS_LEVELS2=1 WS_OUT_SUFFIX=v2` on `tools/godot_export.ts`, `godot_holds.ts`, `godot_boss_ground.ts` and (floor 1)
  `godot_looks.ts floor1`, the looks by `tools/godot_record.mjs <N> --suffix v2` on a page built with the switch on; the floor as
  it is beside it remade, `python3 tools/level_compare.py <N> <out.png>`. Check and pictures: `--only=levels2 --levels2=1
  --floor=<N>` (`check_levels2.gd`); `docs/mockups/levels/`.
- **The speed and tank test** (`check_speed.gd`, `--only=speed`, with `WS_DMG_GEAR=<tools/godot_dmg_gear.ts 20>`; his words, 26 Nov
  2026: “Give me a speed test to see which class can finish a level the fastest.  And which class can get the tankiest.  And a
  breakdown of the builds and why”). Each class at level 50 with the damage check's chooser (its build led by lightning), floor
  19 cleared by a plain autoplayer (the nearest monster by the walk grid, quick attack and hold, the evasive move to cover ground;
  it waits out a portcullis), as the game has it and with every monster a thousand times as tough; and each class's toughest
  build (the same chooser on what he can stand) among seven of floor 20's own that cannot die, striking fifteen times as hard.
  Results and builds: `docs/tests/speed_tank_2026-11-26.txt`. It found the app's resistances uncapped (fixed: 75%, `loot.gd`).
- **The balance fixes from the speed and tank test** (his pick, 26 Nov 2026, “Fix the balance (Recommended)”; ON at his yes to
  the numbers: “Yes, both (Recommended)”). THE THREE DEFENCES EVENED (`loot.gd` DEFENCE_EVEN): every point of Dexterity is 0.8
  of his own dodge and every point of Intelligence 2.5 of his own barrier, as every point of Strength is 3 of his own life; before
  it every toughest build was all Strength and heavy armour, his dodge at 1%. THE BIG ONE NOW AND THEN (`heroes/tinkerer.gd`
  BIG_ONE_WAIT): the Tinkerer's every fifth vial still knocks everything down, but no sooner than 3 s after the last, so that
  what is near her can strike again (before, she threw so fast that nothing near her was ever up: she could not fall). Her
  toughness before and after and every class's: `docs/tests/speed_tank_2026-11-26.txt` (AFTER THE FIXES); measured by
  `--only=speed` with `WS_BIG_WAIT=0|1` and `WS_DEF_EVEN=0|1` to set either switch for a run.
- **The Brawler remade** (`heroes/brawler2.gd`, its switch `on`, ON at his “Can you just update the game?”; his ideas, 26 Nov
  2026: “it takes three taps to fill one of his globes with a punch.  Then have a branching talent tree where one way has a single
  tap fills a globe, and the other has attack speed modifiers now affect crit damage at 200% or something like that”, and “his
  swipe can be something like an interrupt to the combo, but whatever globe is next is now added to the swipe, so either a flying
  double hamerfist or a flying knee”; a kick globe from one hold, his pick “One hold fills it (Recommended)”). Every tap a punch as
  before, every third lighting a punch globe; every hold a kick, lighting a kick globe; lit globes kept till spent or 3 s with no
  blow. A swipe breaks off what he is doing and spends his jump: a globe lit, he flies up to 3.5 tiles past the move's own carry at
  the enemy where it points with the first (a punch globe the flying double hammerfist, a round blow driving back and staggering all round where
  he lands, none knocked down (his “Just don’t have them fall over?”); a kick globe the flying knee); none lit, the hop as before. No fire globes. The fork off Stiff Jab, one side only:
  Quick Hands (every punch a globe) or Heavy Hands (no faster; each 1% of attack speed 2% more critical damage). Knockdown, Launcher,
  Fire Starter, Stoke, Hang Time, The Full Set, Thunder Knee and Light Feet bent to fit (`brawler2.gd` TEXT; `talents.gd` tree).
  THE TWO FLYING MOVES' ART is the art chat's, at his word: “Send the hammer fist and flying knee to the queue and art chat.  I don’t
  trust you to do it” (the queue's `draw-brawler-hammerfist-and-flying-knee`); drawn by the art chat (his “Yes, both are right (Recommended)”)
  and baked in (bake 3f38aadafd8f, his groups alone; `tools/godot_veteran.ts`: 13 moves); without them the uppercut's and the knee's
  frames stand in (`brawler2.gd` ART). Check: `--only=brawler2` (`check_brawler2.gd`, the switch on for it alone); the speed test with
  `WS_BRAWLER2=1 WS_B2_FORK=vquickhands|vheavyhands`.
- **Stuns made rare** (`monster.gd` STUNS_RARE, ON at his “Both on (Recommended)”; his words, 26 Nov 2026: “Looks for instances of stun.  Only the
  biggest and strongest hits should stun.  Stagger is something that can be more common.”; stuns on the hero too, “Yes, both
  ways”). Every stun on a monster is a stagger (its attack broken off, half a second at most, an elite half that, not again for
  a second and a half after) but the biggest hits' (`big`): The Big One, the Warlock's demon landing and its roar, the Bulldozer, the
  Smash's built-up stun and the hammer's, Shieldwall's burst, the Drowned Arm's slam, the Brawler's flying blows, the Ranger's
  trap's hold, Sundial's stop. On the hero: a monster's meld that held him still (`hero.gd hold_by_meld`) and a monster's Shiver
  slow him a moment instead; the bosses' holds and grabs as they were. Check: `--only=stuns` (`check_stuns.gd`).
- **The critical Brawler** (`check_crit.gd`, `--only=crit` with `WS_DMG_GEAR`; his words: “Now build a Brawler that gets 100% crit
  chance through items and gear and maximizes crit damage.”): the damage check's chooser going by his critical chance first, then
  its damage, Heavy Hands taken; and beside him the remade Brawler with Quick Hands and the Brawler as he is, chosen by damage.
- **Critical hits 2.5 times a regular hit** (`loot.gd` CRIT_DOUBLE, ON with the stuns at “Both on (Recommended)”; his words, 26 Nov
  2026: “See there's the problem.  A crit should be at least double a regular hit”, then “Maybe 2.5x”): a critical's base is 150%
  more (1 + 1.5 times a regular hit) where it was 50%, his gear's critical damage added to that.
- **Heavy Hands three ways** (`brawler2.gd` HEAVY_MODE, "add" as first written until his word; his idea, 26 Nov 2026: “That would
  take a normal crit 2.5 times your regular damage up to 5 times your regular damage. Then you're multiplying that by your crit
  damage percent”). k his attack speed's pace (2 at +100%, the most): "add", each 1% of attack speed 2% more critical damage, added;
  "whole", his whole critical k times as hard; "base" (his), the base critical k times as big and his gear's critical damage
  multiplying it. Fought (`--only=heavy`, `check_heavy.gd`, with `WS_DMG_GEAR`; `WS_HEAVY_FULL=1` everything he has, punches, kicks
  and flying blows, 18 s into one elite): his way 2.42 times Quick Hands, the main chat's 1.26, as written 0.66
  (`docs/tests/heavy_hands_full_2026-11-27.txt`, its bar graph `heavy_hands_full_fight.png`; the math as a film,
  `docs/mockups/heavy_hands/heavy_hands_math.mp4`, `tools/heavy_hands_video.py`).
- **The cloth Cowl and Slippers** (the art chat's pictures, his “Yes, both are right (Recommended)”): the Barrier gear's head and
  feet (Linen, Silk and Velvet Cowl for the helm, Linen, Silk and Velvet Slippers for the boots: `src/game/items.ts`), cloth by
  their names (`loot.gd base_family`), so Barrier and a little cooldown recovery built in; the loot baked again
  (`tools/godot_loot.ts`).
- **Every level's own stronghold front** (the art chat's, `src/art/hold_fronts.ts`, OWN_FRONTS; his words: “Endless mode is adding
  strongholds to every level, and I need the facades of the strongholds that you go into to match each of the levels.”, then “Yes,
  story and endless alike (Recommended)” and, 25 Nov, “Yes, switch them all on (Recommended)”). The endless strongholds' gate at the
  map's edge is the front of the level it stands on (`act1/altar_rooms.gd` `_gate_key`; `tools/godot_altar_room.ts` front_<floor>
  and its turned twin front_<floor>_y; 18 of them, 6 and 8 keeping the Quarry's gatehouse and the waystation's gate). The story's
  strongholds on 7, 9 and 10 have theirs and their courts in their own stone in their floors' recorded looks
  (`node tools/godot_record.mjs 9`, `7 --suffix v2`, `10 --suffix v2` on pages built afresh; each the same level as its layout).
  Checks: `--only=altarrooms`; `--only=holdfronts` (`check_hold_fronts.gd`: each story stronghold on 7, 9 and 10 pictured from
  its yard).
- **His computer's findings, 27 Nov 2026** (`check_pc_fixes.gd`, `--only=pcfixes`). BARRIER ONLY WITH BARRIER ON HIS GEAR
  (`loot.gd` derive; his words: “if you have no barrier on gear i dont think you should have just because you have 1 point of
  int”): Intelligence's own barrier (DEFENCE_EVEN) only when his gear has some; and Dexterity's own dodge the same, asked
  whether Dodge should go so: “does strength give armor?  i dont think so” (Strength gives life, no armour). AUTO AIM WITH A MOUSE (`touch.gd` mouse_aim, the
  pause panel's ATTACKS switch on a computer; his words: “and no options for targetting like auto aim”): WHERE YOU POINT (the
  mouse, as before) or AUTO AIM (each blow at the enemy the aim help locks onto, the gold ring round it; none, the mouse), kept with
  the device. A COPY NOT IMPORTED (`main.gd` _not_imported, IMPORT_SAMPLE): run from the project's files before Godot has imported
  them, or after an update without importing again (a few key files checked against what Godot last imported of them), the game
  says so plainly over everything and how to put it right, in place of an all but empty game (his: “floor 1 has nothing except
  torch glow”, “i dont think i heard an music or sounds at all”). THE WINDOW FITS HIS SCREEN (`main.gd` _ready, _fit_window,
  _watch_window; his “k it runs but the aspect ratio is off”, asked how, “Cut off”, and “i cangt minimize, theres no line or e x in
  the top right”: a 1920 by 1080 window on his screen, its title bar off the top): on a computer the game opens maximized, or, where
  the system will not, no bigger than the room the screen has for it; and it is fitted again (fit_screen) whenever its window
  changes size, the splash and the start screen holding the game or not. SET DOWN ON OPEN FLOOR (`main.gd` _open_floor_near; his
  “Coming back up the town from level 1 gets me stuck and I can't move”: the spot by the top of the town's stairs was the stash's
  tile): where an arrival's spot is not ground he may walk, the middle of the nearest tile that is. Check: `--only=townup`
  (`check_town_up.gd`: up from floor 1 by its gate, then each way held a second). A MOVE OPENING WITH A LEVEL CALLED BY ITS OWN
  NAME (`hero.gd own_move_id`, the news and the HUD's NEW MOVE; his “when i have the hammer selected form lvl1, when i level up it
  says "unlocked whirlwind" when earthquake is unlocked and whirlwind isnt even what it unlocks with sword at lvl2”): his weapon's
  or his tree's move in that place (the greatsword's Whirl, the axe's Axe Throw, the hammer's Earthquake), the Warlock's own while
  he is the demon. Check: `--only=movenames` (`check_move_names.gd`).
- **The map's icons for what he finds** (`minimap.gd` MAP_ICONS, ON at his yes to their pictures, “Yes, turn them on
  (Recommended)”; his words, 27 Nov 2026: “And work on the minimap.  It's really a relic of insanely early builds of this game.  It
  can have way more functionality”, his pick “Icons for what you find”): small pictures in place of the dots, on the small map and
  the large one: a chest, the waypoint, the way down, the way home, a stronghold (the cult's red while its altar waits, grey once
  taken), a bell (the Muffled Bell, the bells to ring), the fallen wordsmith, a boss (a skull), a rare pack (a crown), a prize
  carrier (a gem); the large map's legend the icons on it. Pictures: `docs/mockups/map_icons`, `--only=mapicons`.
- **The player's sweep** (`check_sweep.gd`, `--only=sweep`; his “K I need you to go through the game and find fixes like these I
  made tonight”): every way into every place set down on open floor and able to walk off (51 of them; `WS_SWEEP_PART=arrivals`),
  and from level 1 up each move opening named as its plate names it, for each class (`WS_SWEEP_PART=levels --cls=<class>`).
- **The weakest melds brought up to the art rules** (the art chat's `art/meld-rules-check-all`, his “Bring them in
  (Recommended)”; his ask, 26 Nov 2026: “I’d like you to look at all our melds and find which are weakest compared to our art and
  animation ruleset.  Then bring them up to our standard”). The 30 weakest (the city's melds that slow, curse or hold) and 14 more
  painted again; 26 melds whose own moment never played on a monster that carried one now have it. Read first:
  `docs/mockups/meld_rules_check2/README.md`. AND, STUNS BEING RARE, the melds that work on the stunned work on the staggered too
  (`monster.gd held_still`; his “Work on staggers too (Recommended)”): Standstill, Anchor, Gravity, Burden, Charge, Mire, Anvil,
  Pressure Point, Daze and Marrow; Standstill's, Anchor's and Gravity's longer stun a longer stagger, never a stun. Checks:
  `--only=words --cases=m52:<ids>` (the 80 touched: 152 of 154, the two left being Standstill's and Anchor's, then these ten 20 of 20).
- **The Hannar Manor Games splash** (`scripts/splash.gd`, `main.gd` SPLASH; the art chat's; his ask, 26 Nov 2026: “I’d like a title
  splash screen before the wordsmith title screen.  I’d like it to fade up from black.”, his pick “White”): the film
  (`assets/splash/hannar_manor_splash.ogv`, 6.6 s) over black as the game begins, the game held still behind it, a tap skipping it,
  the start screen coming up from its black; not in the checks' runs, `--splash=0` to begin without it. Check: `godot --headless
  --path godot -s res://checks/splash_check.gd`.
- **Six enemies made livelier** (the browser art's `src/art/enemies8.ts` ENEMIES8, ON at his yes to the second pictures, 26 Nov
  2026: “Yes, put them in (Recommended)”; his words: “Next Find the 8 weakest enemies and work on them.  Weakest in terms of their
  animations and look.”). The skeleton marksman breathes as he waits and swings more in his stride; the Shade rises, sinks and
  rolls, its arms drifting and its tails whipping, and leans hard into its glide; the cultist takes real steps under its robe,
  the hem swinging, the flame flickering; the high priest's censer swings standing and walking, his steps showing; the scribe
  steps under its robe, and in its death its hands go up to the splitting mask and its arms lie along its body (his words of
  the old one: “The elbows shouldn’t flare out like that”); the swan pumps its head with each step and beats its wings. The
  skeleton and the bone archer stay as they were, his word: “Honestly I like the old shamble for the skeletons”. Baked into
  `assets/monsters/` (`cultist`, `priest`, `shade`, `marksman`, `scribe`, `swan`) by `node tools/godot_bake_figures.mjs
  cultist,priest,shade,marksman,scribe,swan`, the same frame counts as before. Check: `--only=enemies8` (`check_enemies8.gd`);
  pictures `docs/mockups/enemies8/`.
- **The human enemies' voices** (the queue's "Make voices for the human enemies"; `monster.gd VOICE`). The cult of the first
  floors (the Cultist, the Dagger Cultist, the High Priest, the Chanter, the Firepot Thrower) share one real voice, his pick,
  25 Nov 2026, “Yes, two takes each (Recommended)”: its shout as it first sees the hero ("Heretic!"), its grunt on a big hit, its
  death cry, two takes each (`assets/sound/cult_*.mp3`, made by ElevenLabs with the voice Malakor, eleven_v4, 122 credits;
  trimmed and levelled to the other families by `tools/godot_enemy_voice.sh`; to hear: `docs/mockups/enemy_voice/cult_voice.mp3`).
  The High City's soldiers (the Footman, the Crossbowman, the palace guard, the queen's guard, the king's knights) are Hushed:
  the city watch's wordless sounds, breath, cloth and armour, his pick, “Watch's sounds (Recommended)”.
- **The heroes for sale** (`scripts/shop.gd`, `scripts/play_shop.gd`; his words, 25 Nov 2026: “I want the sell the warlock,
  tinkerer and brawler for $0.99”; asked, “Yes, start them (Recommended)”, then to the pictures, “Yes, that's good
  (Recommended)”, and to the price, “$0.99 each (Recommended)”). The Warlock, the Tinkerer and the Brawler, each bought once
  for $0.99 in the Android app through Google Play, kept for good on every save. On the class cards (`class_cards.gd`) a hero
  for sale and not bought has a padlock and its price in its card's top left corner (the padlock alone on a card too narrow,
  held upright); chosen, CONFIRM is BUY and the price, and the line over the foot says "Unlock the <hero>. Yours to keep, on
  every save."; BUY brings up Google Play's own purchase sheet; bought, UNLOCKED a moment and CONFIRM back. Pictures:
  `docs/mockups/paid_heroes/`. Locked only where there is a shop to buy from: the Android app with Google Play (or the
  checks' stand-in, `--shop=fake`); a build with none (the computer) has all six open. What is owned is kept in
  `user://owned.cfg` and asked of Google Play again each time the game starts (a hero bought is the player's on a new phone; a
  refund takes it back). The Play products: `hero_warlock`, `hero_tinkerer`, `hero_brawler` (one-time products, $0.99, made
  in Play Console once his account is open). Google's billing plugin for Godot (godot-sdk-integrations, 3.3.0, the Godot 4
  line) is fetched by the Android build (`.github/workflows/android.yml`) into `godot/addons/` and switched on for the export
  there; it is not in the repository. Check: `--only=paid --paid=1 --shop=fake` (`check_paid.gd`).
- **The chained rare** (new to the Godot game, not in the browser game; `scripts/chained_rare.gd`). His words, 22 Nov 2026:
  “Adding a new mechanic for the first five levels of wordsmith.  2-5 in the campaign, in all relevant levels in endless.  A
  chained immobile rare enemy.  He has his words plus a bonus word above him.  He will drop the guaranteed word above him if you
  tap him to unchain and fight him.  Or you can leave him if you don’t want to interact with it at all.” Read as: one on each of
  floors 2 to 5 once the ring is lit, and one on every endless level that is one of floors 1 to 5. One of the floor's own
  yellow-pack leaders' kinds alone, in one of its ordinary rooms (off the way through first): his yellow name, two of the floor's
  words (three from depth 10) and the bonus word as well, twice an elite's life (8 times his kind's; an elite alone has 4, a
  pack's leader 3), and over his head the rune of the bonus word (his words: “I want him to have the word above him as well.
  It’s got to be tough”; “I think he should have at least double the elite bonus health”). Three iron stakes and their chains to a band at his waist, painted in code;
  he turns to the hero and now and then heaves at them (rattling). Held, he never wakes, is out of every blow's reach
  (`monsters.gd shut_in`), is never locked onto and strikes at no one. A touch on him walks the hero to him and breaks the chains
  (`touch.gd _spot_at`, errand "chained"); E within 2.4 tiles too ("Break the chains"). The links fly, and half a second later he
  fights as any elite; killed, he always leaves the bonus word (`loot.gd on_kill`), on an endless level's floor 1 as well.
  ONCE PER FLOOR (his pick, asked whether he should come back each time a floor is laid fresh: “Once per floor”): beaten on a
  floor of the story he is never chained there again for that hero (`loot.gd chained_beaten`, in his save); freed and left alive,
  he is back the next time; every endless level has its own. `--only=chained --shots=<dir>` (38 checks, and pictures held,
  heaving, snapping, free); `--only=chained_film --shots=<dir>`
  with `--fixed-fps 30`, a film of it frame by frame (both run under `xvfb-run -a ... --rendering-driver opengl3`).

- **Strongholds on any endless level: the cult's gate at the map's edge** (`scripts/act1/altar_rooms.gd`, the floors 6 to 10
  strongholds' own rules, `act1/holds.gd`; AltarRooms.ON, on at his yes to the pictures, docs/mockups/edge_gate/, 25 Nov 2026:
  “I have art chat making new stronghold entrances for all levels, but yes switch them on”). His words,
  23 Nov 2026: “In endless mode I want multiple chained and stronghold encounters per level”. Shown the altar sealed in one of a
  floor's rooms (docs/mockups/altar_room/), his “Why wouldn’t you just put the door on the edge of the map?  Why is it in the
  middle of the area?”; asked whether to do it as floors 6 to 10 do, his pick, 25 Nov 2026: “Gate at the edge (Recommended)”.
  On an endless level of a floor with no strongholds of its own (floors 6 to 10 keep theirs), two of the cult's gates, each the
  Wilds' redoubt gatehouse (`art/floor6.ts gatehouse`, baked by `tools/godot_altar_room.ts` -> `assets/altar_room/`) in a wall at
  the map's edge, nothing walked behind it, its court of flagstones, the altar, braziers and banners before it. A wall along y has
  the gatehouse and altar TURNED: painted in the world's light turned across, then turned over (`art/floor4.ts inLight`), never a
  picture flipped as it is (his art rulebook, Figures 7: the light still falls from the upper left). The gatehouse stands in
  strips, each sorted where along its wall it stands, so he walks in front of its near end and its far end stands in front of
  the wall beyond. Words laid and the door opened: the altar gone, and through the doorway, the screen dark, he is in one of the
  Wilds' own halls (`tools/godot_edge_halls.mjs` -> `assets/altar_room/halls.json`, their looks moved where they are laid:
  look.gd `shift`), laid in rows the floor grows past its south edge as it is laid (floor_map.gd `grow_south`; every tile keeps
  its number), the floor's look put away while he is in it; five waves of the floor's own packs rise out of rifts there, then a
  hall's reward; out by its threshold he is before the gate again. Siege burned in, twice as many, as many as the floor's edges
  hold (floors 6 to 10: beside their own, away from their gates, yards and halls). `--only=altarrooms --shots=<dir>` (12 checks;
  `--cases=gate` the first gate alone, `--cases=city` floor 13).

## The 52 designed melds and the 11 level 2 runes (the cloud chat, 23 Nov 2026; switched off until his yes to the films)

His order for them, 23 Nov 2026: “Create the melds, name them, figure out what they do front, back, crafting, and on enemies, then
design the rune, then the animations”; “Let's start with 6-10 words melding with 1-5 words”; “I also want all level 1 runes to meld
with themselves to level 2”. Each step had his word: the effects (Twin's Melds, Floor 6–10 Melds: “Good”, “Good”), the stones
(docs/mockups/meld_runes: “Good”), the animations (Twin's Meld Animations, Floor 6–10 Meld Animations: “Okay sounds good”, “Good”).

- THE TABLE: `assets/words/melds52.json` and the stones' sheet `melds52.png`, made by `tools/melds52/make.py` from the approved
  texts (`tools/melds52/docs_twin.txt`, `docs610.txt`), the stones (`docs/mockups/meld_runes`) and the twists' numbers
  (`tools/melds52/tune.json`).
- `melds52.gd`: the switch (`Melds52.ON`, off), the table merged into the words' own, the bench (two runes make each meld, two of
  one of Twin, Leech, Volatile, Precise, Frenzied, Guarding, Lasting, Fleeting, Vast, Swift or Heavy its level 2), the stones under
  the loot's and the HUD's sheets, and what each makes of a move's numbers and its page's lines.
- `melds52_rules.gd` (the hero's `m52`): each twist at work on his moves, hooked into his blows, kills, boosts, the ground his
  moves leave, his shield, his speed; `foe_melds52.gd`: each on a monster that carries it (foe_words.gd hands on to it).
- `fx_melds52.gd`: each one's moment in the fight, from the two animation docs, out of the effects' own pieces in its colour.
- Gear (loot.gd melds52_options): one property of each of its two runes, each a quarter weaker; a level 2 rune its rune's, half again.
- `--only=words --cases=m52`: the bench (on and off), the 23 melds as they were, the stones, the gear, and each of the 63 in front of
  the Strike and behind it (its name, its line, the blow landing, its twist seen): 126 of 126. `--cases=m52film`, with
  `--fixed-fps 30`: a film of each meld, in front, behind and carried by a monster (ffmpeg makes each into an mp4).

- THE CITY'S MELDS (his “Let's get some more melds in”, 24 Nov 2026): Floor 11–15 Melds, his doc
  https://claude.ai/artifact/CMMUpdDX2f9DwDPe8avGqQ: the city's five runes (Pulling, Splitting, Hexing, Stilling, Binding) with
  the floor 1–5 runes and with each other, 45 melds and 5 level 2 runes (his “Good”; the first, Implosion, renamed Maw, as the
  game has Implode). The stones: docs/mockups/meld_runes3 (his “Yep good”). The animations: Floor 11–15 Meld Animations,
  https://claude.ai/artifact/BnhngFXn84WWNcRkKMnGDd, checked against his Art Rulebook at his “Remember to follow the rules for
  art and animations” (his “Good to go”). Built behind a switch, `Melds52.CITY_ON` (off): in the same table, melds52.json
  `city` (tools/melds52/make.py from tools/meldscity/docs_city.txt); the twists meldscity_rules.gd (the 52's `m52.y`), hooked
  into the city's words' own moments (city_words.gd pull_in, split_first, _copy_hit, throw_shards; wakes.gd _snare; hero.gd
  _wake and its hold); on monsters foe_meldscity.gd (from foe_melds52.gd, and a split's halves from monster.gd _split); the looks
  fx_m52p_city.gd (its holds in fx_melds52.gd HOLDS; Frostlock and Constellation in Frost's blue on a monster, fx_m52kit.gd ICY).
  `--only=words --cases=m52:<ids>`: the bench (off none of them, on all 143 and 16), stones, gear, and each of the 50 in front and
  behind, 100 of 100; `--cases=m52film:city` (with `--fixed-fps 30`) films the 45 (their set-ups: cursed, slowed, held, chilled;
  behind, a vortex's end waited for, a skeleton walked onto each snare). Stagnation's twist was made one that shows: while the
  slow holds, the poison does not wear off (meldscity_rules.gd step). All 45 filmed (every monster moment shown, no script
  errors) and put on one page for his yes: City Meld Films, https://claude.ai/artifact/C6a3KHBrT98YMvi4YpKAD9
  (`python3 docs/mockups/meld_films/page.py <films> <out> city`; the films are not kept in the repository, 40 MB). ON at his
  “Yes” to “Want me to switch them on?” (24 Nov 2026): `Melds52.CITY_ON` true.
- THE CITY'S RUNES WITH THE FLOOR 6–10 RUNES (his “Then finish the melds”, 24 Nov 2026, the next group his Floor 11–15 doc
  named): 44 melds (Implode, Pulling and Volatile, the game had already), designed (tools/meldscity/docs_city2.txt), their stones
  (docs/mockups/meld_runes4), in the same table (melds52.json `city2`, tools/melds52/make.py), behind `Melds52.CITY2_ON` (off). Their
  twists meldscity2_rules.gd (the 52's `m52.y2`, and handed on to from each moment of the city's words through meldscity_rules.gd
  `z2`: the drag, the copies and their speed and targets, the shards, the hold, the snare, the grounds; Twin's second strike through
  melds52_rules.gd blow); on monsters foe_meldscity2.gd (from foe_melds52.gd: after a blow, its turn, its pace, its shield, its death,
  its blast; and monster.gd's split, Starburst's in three); their looks fx_m52p_city2.gd (the city's shapes, and a shield's face, a
  stagger's stars, drops of blood). `--only=words --cases=m52:<ids>`: the bench (off none, on all 187 and 16), stones, gear, and
  each of the 44 in front and behind, 88 of 88; `--cases=m52film:city2` (with `--fixed-fps 30`) films them: all 44, every one's
  moment on a monster shown, no script errors (Respite's filmed without his shield up, so its blow on him shows). On one page for
  his yes, each card its stone, idea, what it does and its film: City and Wilds Melds, https://claude.ai/artifact/9u1bUEVM4YdrjRZq5SHHeG
  (`python3 docs/mockups/meld_films/page.py <films> <out> city2`; the films are not kept in the repository). ON at his “Switch them
  on.” (24 Nov 2026): `Melds52.CITY2_ON` true.
- PLUNDERING, THE GOLD WORD (his words, 24 Nov 2026: “I think I want plundering to not meld, since it's a gold farming word and should
  have a drawback”; and of the Rim's door, “adding them to the endless door shouldn't give all enemies that word, it should just
  increase either the gold dropped or magic find of the floor as a whole”): it never melds (words.gd NO_MELD: the bench refuses it,
  itself too; the High City's melds to come leave it out). Burned in at the door, no monster there carries it and it drops no more
  often for it, and the level's gold found is 50% increased for each (loot.gd DOOR_GOLD_WORDS, DOOR_GOLD, door_gold; main.gd; the rewards
  every burned rune gives, as before). The door's page says so on its card behind inventory.gd DOOR_GOLD_LINE (off until his yes
  to its picture). `--only=doorrunes` 11 of 11.
- TWO KINDS IN ONE HIT (his find, 24 Nov 2026): built here, then taken out at his word, “It's already fixed, or another chat
  pushed the fix”: the fix is the other chat's, on its branch claude/adoring-davinci-q6wn9n (9ed64ffb: Scald, Wildfire, Hailstorm,
  Eruption, Avalanche and Thunder deal both kinds, half of each; 7db84722: flat damage of an element adds to every hit). That
  branch brought in here at his “Yes” (24 Nov 2026) with its fifteen more leveling uniques and twelve leveling weapons; its
  items.json taken with the dodge amulet's name Slipstream kept. Checked after: defuniques 43 of 43, uniques 11 of 11, uniquesdo
  19 of 19, the rune bag 18 of 18, the melds bench 7 of 7.
- GREED, THE BETTER-LOOT WORD (his “Yes build greed”, 24 Nov 2026): in front, what it kills drops with increased magic find
  (words.gd GREED); behind, a kill sometimes drops an extra item; on a monster, it hits harder and moves faster and drops an extra
  item. It never melds (NO_MELD). Burned in at the door, no monster there carries it, and the level's magic find is 50% increased
  for each (loot.gd DOOR_MF_WORDS, DOOR_MF, door_mf). Its stone and its SPOILS page in the Lexicon (melds52.json `extra`).
- THE RARE RUNES DROP ONLY IN ENDLESS (his words, 24 Nov 2026: “plundering and the quality word and mirroring should only drop in
  endless.  Mirroring should be very, extremely rare.”): Plundering and Greed only on endless levels (loot.gd ENDLESS_DROPS), where
  a carrier is now and then made one of them (RARE_CARRY 0.05); Mirroring only from the Queen on an endless level, 1 in 100
  (QUEEN_ONLY, MIRROR_CHANCE). `--only=rarerunes` 12 of 12.
- THE DOOR WORDS: CHAINS, SIEGE, TOLL AND CROWN (his idea, 24 Nov 2026: “If you put those words in the endless door, you get
  more encounters of that type.”; asked whether to use words we had or new ones, his pick “Four new door-only words”):
  door_words.gd. Each only for the Rim's door: no move (words.gd socket_problem), no piece of gear (loot.gd burn_problem), no
  stronghold's altar (holds.gd problem) and no bench (NO_MELD) takes one. They drop only on an endless level, the four sharing
  one rune's share (loot.gd drops_at). Burned in, no monster carries one and it drops no more often (loot.gd DOOR_WORDS), and the
  level holds more of its encounter: CHAINS twice the chained rares (main.gd); SIEGE twice the strongholds, four of the cult's gates
  at the map's edge for two, and on floors 6 to 10 up to two beside the floor's own (act1/quest610.gd `rooms`);
  TOLL the Muffled Bells for sure, and each bell rung calls its tough ones twice (act2/bells.gd _tough), on the city's
  floors too; CROWN the royals' packs for sure and twice as many, and on the High City's floors a quarter more of its packs
  (main.gd royal_packs). Stones (iron chain links, a brick gatehouse, a bronze bell, a purple crown) with Greed's in
  melds52.json `extra` (`door`), docs/mockups/door_words/; listed, with the Lexicon's page and the rune bag's group DOOR, only while door_words.gd
  ON is. ON at his pick, “Switch them on (Recommended)”, 24 Nov 2026, to the pictures (https://claude.ai/artifact/QxnGXdmQm1j11rGyFaGCYe). Found on the way: Greed was missing from the words he holds (loot.gd held) and
  from the drops' colours, now both kept. `--only=doorwords` 12 of 12 (with altarrooms 10 of 10, rarerunes 12 of 12,
  doorrunes 11 of 11; on: doorwords 12 of 12, runebag 18 of 18, lexstash 5 of 5).
- THE BUG HUNT, ROUND 1 (his words, 24 Nov 2026: “I'd like some agents to run the game and look for bugs”): three agents played
  the story floors and the town, the city, the High City and endless, and the heroes, words, melds, gear and screens, and reported;
  what they found was fixed. ENDLESS: the Bells' copies carry no royal's crest nor rune (bells_any.gd _plain); a rung bell does not
  call a chained rare off his stakes (bells.gd ring); no bell stands on a monster, no chained rare on a bell; the Bells try room
  after room, and with Toll a looser plan too; Siege drops and is listed only while the cult's gates are on (door_words.gd live);
  Chains on a crowded floor brings more, nearer each other (chained_rare.gd APART_CHAINS). HEROES AND WORDS: Frostbite redone on
  monsters freezes him once a moment however many carry it (foe_meldsredo.gd); Cauterize redone on a monster sears once, its own
  way (foe_words.gd); the evasive move's long name kept right of the slow attack's key, wrapped (hud.gd); a monster looked up by
  its living number only (fx.gd _monster_of, no engine error). TOWN AND FLOORS: floor 5's cage, once down, is walked into (ways.gd
  `_opened` "shaft"); a townsman's spoken line gone once he has left the town (speech.gd). FROM THE NEW DAMAGE TEST: Brand in
  front made a burning one's burn twice as hot again on every critical hit, so it grew without end (362 million a second into
  the elite); now twice once a burning (melds52_rules.gd `brand_hot`), and Needle's doubled poison the same (`needle_hot`); and
  thirteen of the monsters' melds that make his burn or poison worse (Cremate, Flashfire, Brand, Needle, Viper, Fever, Hornet,
  Mire, Hourglass, Plague, Strangler, Firetrap, Nightshade) did so again with every blow: now once a burn or a poison each
  (hero.gd `worse`). `--only=bughunt` 5 of 5.
- THE BUG HUNT, ROUND 2 (his words, 24 Nov 2026: “When they're done, run them again.  Do it 5 more times.  Have them use different
  classes.  Try different builds.”): the Ranger with poison on the story floors, the fire Mage in the city, the High City and
  endless, the Tinkerer with lightning and volatile on the words, melds, gear and screens. Fixed: THE MONSTERS' MELDS ON HIM: what
  makes an ill on him worse does so once while it lasts (hero.gd `worse_f`): Omen's and Condemn's and Refrain's curse (it reached
  three hundred times the harm), Manacle's, Noose's, Icebound's and Snag's root (eight minutes), Stormglass's shock (over an hour),
  Grudge's, Eternity's, Stutter's, Hoarfrost's, Brimstone's, Stagnation's, Slowburn's, Gangrene's, Longspear's and Deathwatch's
  lengthenings, and the Bleeding melds' bleeds (Gore, Bloodboil, Galvanic, Lacerate a fifth a cut to three, Mangle, Fangs,
  Bloodrage, Fishhook, Butcher). A Hemorrhage bleed opens again only while the one that cut him lives, and his bleed goes with the
  place. HIS MELDS ON THEM: a burn knows the melds' heat on it (monster.gd `burn_k`, hotter(), burn_base()): Brand, Brimstone,
  Firetrap, Firewhirl, Anvil and Sunspear each once a burn, and what Searing passes on, Rekindle lights again and Bloodboil spreads
  is the burn's own fire without their heat (Searing and Brand ran to 177,857 a second, Rekindle and Brand to 50,506); Miasma's
  poison and Thornspray's bleed worse once each (48.6 million a second, 7,426 and growing). TWIN'S WAVES AIMED (heroes/mage.gd
  TWIN_AIM, off, pictures first): the Mage's Twin pair fans so wide that past four tiles both miss what she aims at (her Shivering
  Twin Wave struck nothing at 4.5 tiles); aimed, the fan narrows with distance (60,093 a second into the elite, a pack dead in
  0.7 s). AND: no royal's crest nor rune on a kind's called-up, split or risen ones (monsters.gd `_plain`: floor 16's groom,
  gardener and swan wore a Princess's and dropped her cards); the Sticky Wrench's freed-body error (heroes/tinkerer.gd); a monster
  looked up by its own number before the engine's (fx.gd: some 125 engine errors a fight); the Mage's aura's fill not asked over
  a ledge (heroes/mage_look.gd); a masked dancer stepped only where its whole body fits (act3/dancer.gd). Asked and answered: the
  old monster-side rules of the 60 redone melds still run beside the new, as their design says (“Each keeps what it did on a
  monster ... and gains a moment”); only Cauterize did the same twice. The Ranger's: Strangler in front doubles a held one's poison
  once a poisoning, not again each time it is held anew (meldscity_rules.gd: 117,829 a second in half a minute); the Snare holds no
  boss, as no stun does (heroes/ranger.gd: it held the Headsman fourteen seconds of fifteen); the quest's banner over a long place
  name (floor 10's) drops below its line (hud.gd BANNER_CLEAR, off, pictures first). `--only=bughunt` 11 of 11.
- THE BUG HUNT, ROUND 3 (the Warlock on the story floors, the Brawler in the city, the High City and endless, the Warrior with axe
  and hammer on the words, melds and screens). The Brawler's: his blows stagger, stun and break off no boss, as no one's do
  (heroes/brawler.gd: the Warped Wordsmith stood held 21.5 s of a 41 s fight, the Moth's acts cut by every jab); his punches, kicks
  and jump are uses of their moves as every hero's are (hero.gd _cast): Flurry, Tailwind, Quickdraw and the melds that answer a use
  work on him, his jump gives its words (Swiftness, Guarding, the frenzy) and Surging's surge, and Twin behind echoes his blows (the
  browser game's Brawler had neither: carried over). The King's songbird after his fall asks nothing of him once gone (act3/gking.gd:
  a script error, leaving floor 19 as he fell). The Warlock's: a cursed one's death passes its burn on as its own fire, without the
  melds' heat on it, and its poison with its doses (monsters.gd spread_burns: down a line Brand's double was passed and doubled
  again, 200 a second to 6,400, and each poison passed took eight doses more); Cinderbrood's fire passed on the same.
  `--only=bughunt` 14 of 14; the reaping check's line on Reaping with itself and Twin brought to the High City's melds being on.
  The Warrior's (axe and hammer): what the melds and the uniques leave or have yet to do goes with the place he leaves (hero.gd
  fresh_place: melds52_rules.gd forget, uniques.gd fresh_place): a blow due a moment on (Concussion, Viper: a script error on the
  next floor), the redone melds' patches of ground (Bedrock struck floor 9's monsters where it lay on floor 7), Gyre's axe spinning;
  a monster's Momentum stops at ten, as his own (foe_melds52.gd). His own checks: whirl1 asks `--whirl1=1`, uniqueswar's Windcutter
  times by the frame on a slow machine (both stale, not the game's). The Warlock's (resumed): floor 6's Unfinished, its pictures in the
  wall baked from the front only, turned away asked for what its back had not (a script error each frame): a side short of a list
  shows the front's (baked_figure.gd); the Curse's echo is thrown as far as he could see from where he threw it, not through walls
  (heroes/warlock.gd, kit.gd _reach_point); the demon falls as the man, its pact gone (game.ts die), and comes into a town as the man,
  as he is drawn there (warlock.gd turn_man); a word found and a move opened wait, as every line at the top, while the floor's name
  is up (hud.gd, loot.gd). `--only=bughunt` 17 of 17.
- THE BUG HUNT, ROUND 4 (the frost Mage on the story floors and town, the Ranger with his companions in the city, the High City
  and endless, the Warlock on the words, melds, gear and screens). The Warlock's: on a touch screen a tap on him, his pact full,
  changes him (main.ts onHim, his words “then you tap on the warlock and he transforms”: nothing on a phone pressed R, so there was
  no demon, no Bound Demon); fed by the Unsigned Pact, a tap on him lets him go; the Mage's Aura and the Brawler's combo cancel
  the same (touch.gd _self_touch); over the full pact TAP HIM on a phone, RB on a pad. Undoing a talent is kept on reload (talents.gd
  clean, pass after pass: one pass in the saved order dropped what came in by a later one, and a single undo lost 8 of 9). No
  change in a town, the camp or the Rim, and the Bound Demon is gone with the place he leaves for home or falls in (heroes/warlock.gd).
  The Unsigned Pact lets him go when what it takes would bring him under its floor (kept at it, his life regen lifted him just over
  it each frame, and it fed for ever). The Burning Verse's mark goes with its burns (monster.gd: a later uncursed burn never went out).
  The frost Mage's: a monster's Flash Freeze or Icebreaker freezes him not again for four seconds however many strike (Flash
  Freeze's own `again`; foe_melds52.gd, foe_melds46.gd: four held him 6.4 s of 8, now about 1.3); Whiteout deepens a chill by his
  frenzy once, not on each hit (it took bosses to 90% slow), Icebound doubles one once; Frostlock and Slowburn lengthen every
  freeze and burn, not the first alone (their marks go with the ice and the fire: monster.gd); a chill worn off is no chill (its
  old depth came back with a light one: meldsredo_rules.gd _chill); her ice ground keeps a longer chill (wakes.gd). Two looks
  behind switches, off till his yes (docs/mockups/bughunt_fixes/quest_mark_now_and_clear.png): the quest's rune over a townsman's
  head but on his name put over the name (act1/quest610.gd MARK_CLEAR: it hid the ARMOURER's middle, as the browser game does
  too); no R: CHANGE or TAP HIM over the Warlock's full pact in a town (heroes/warlock.gd HINT_TOWN_OFF). `--only=bughunt`
  (WS_BH_FROM=4 for the round's alone) 7 of 7.
  The Ranger's: the words that answer each use (Swift's haste, Frenzied, Guarding's shield) and the last words (Surging,
  Mirroring) now work on every attack of the Ranger, the Mage, the Tinkerer and the Warlock, as game.ts deliver has them (heroes/
  kit.gd _used: only their evasive moves and the moves held gave them; the Warrior's and the Brawler's did already); Venom's cloud
  passes a poison on with its doses (wakes.gd, hero.gd: set at one dose, seven more stacked on the most, and down a chain of deaths
  it grew from 800 to 7,886 a second); a companion let go in town takes its picture with it (companions.gd pick: each pick left
  one more frozen where it stood) and each companion keeps a place of its own (the collar's wolf picked for the hunt stood on the
  collar's new one, his right side empty); the Snare holds as every stun does, an elite half as long, and as Binding not again
  for two seconds after (heroes/ranger.gd, monster.gd snare_again: thrown as fast as he could it held an elite 11.4 s of 12, now
  5.4 with his wolf's bites). Not the game's: bells line 08 as the Ranger (timing), endless line 05 (finds monsters by their place
  in monsters.json, not the endless packs' extras). Round 4's checks, `--only=bughunt` WS_BH_FROM=4, 11 of 11.
- THE BUG HUNT, ROUND 5 (the Tinkerer on the story floors and town, the Warrior with the Whirlwind in the city, the High City and
  endless, the Brawler on the words, melds, gear and screens). The Tinkerer's: her golem is set down only where its body has room
  (heroes/tinkerer.gd _stands, _stand_near: monsters.gd clear, not open ground, which is the test for sight: it stood in walls,
  crates and water and fired from there), comes out again where it may stand, and is not made to charge in its rocket jump; a
  Contraption refused (three standing, none past its first shot) is no use; Prospector digs no gold in a town (her golems' shots dug
  21 there in 18 s). The Warrior's: Surging and Mirroring on his Whirl, his Whirlwind (once a spin) and his Lunge's landing, as on the
  Strike (game.ts deliver; the browser game's Whirlwind and Lunge lacked them too); Shiver's freeze not again for four seconds, as
  every freeze (melds.gd); Fervor's fury and Implode's bursts gone with the floor (hero.gd fresh_place, melds.gd forget); a monster's
  meld roots him as Binding does, not again till its wait, never with Resolute (hero.gd root_by_meld: Pin, Amber, Skewer, Undying,
  Gravebind, Tangle; four Pin carriers rooted him 8.4 s of 10, now 2.3 of 8), and holds him not again for two seconds after (hero.gd
  hold_by_meld: Coldcut, Crusher, Ice Lance, Haymaker, Stillpoint, Tempo, Bedrock, Concussion and the rest; Flash Freeze, Icebreaker
  and Frostbite keep their own waits); the Silent Order's rush, the dancer's throw and the Queen's Guards' step out of the glass need
  room for the whole body, the guards each their own spot (act3/order.gd, dancer.gd, qguard.gd). The Brawler's (heroes/brawler.gd):
  his combo cancelled in his jump's crouch keeps the jump's globe (a press there was a script error); his globes are not let go while
  presses wait (held by a monster, three taps more played five); a use is counted as each blow is made, not as pressed (Splitting split
  once for three quick punches); the last words on his blows (Surging, Mirroring: his own _echo_blow for a reflection's blow) and
  Piercing through the first his blow lands on, Twin's melds on its second hit (Onslaught's full second); his knock-downs and stuns
  (Aftershock, Thunder Knee, Wall Slam, Knockdown, his blows', a landing after a pop-up) by the stun rules, an elite half as long, none
  through Fortress (an elite was held 7.6 s of 10 by Aftershock alone); Vast's and Power's size widen his reach; a quiet hit past the
  third counted over the whole blow, not each frame; the Full Set's finisher on the last globe (the Fourth Globe's fourth); the one-
  hand touch mode does not press again in the frame a touch on him cancels. Left for his word: the Big One with Contraptions holds
  a common about half the time (by the stun rules); Heavy on the Whirlwind stuns an elite through the spin; the Brawler's kicks hit
  half as hard as his punches (BRAWLER_MORE on punches only, words.gd); words on his Jump do nothing (it strikes nothing); a move's
  card on the ATTACKS page under "Wordsmith (E)" and LEVEL UP (scratchpad picture). Checks written for the Warrior, not the game's:
  wordsui, uniques 08, touch 2-4, pad 5, practice 91, save_read 06 as the Brawler. Round 5's checks, `--only=bughunt` WS_BH_FROM=5,
  9 of 9.
- THE BUG HUNT, ROUND 6, the last (mixed heroes in the modes, deaths and saves; deep endless with the door words; all six with
  random builds). The modes': home by the waypoint leaves the floor behind as every way does (main.gd _arrived, from go_to and
  go_warp: burns, poisons, roots, the demon, the melds' bursts to come went home with him, and a normal hero dying of them in town
  lost his run); nothing is saved while the start screen or the hero cards are up (with no hero saved, the one standing in for him
  was written as a run, a Warrior never picked offered to CONTINUE); the Brawler's kick and jump wait for their levels as every hero's
  moves (heroes/brawler.gd _press, move_open); the Warlock levelling as the demon is told his own new move (loadout.gd own_id; loot.gd,
  hud.gd); the gear screen does not open over the death screen. Deep endless's: his armour and dodge are reckoned by the level's
  depth on an endless level (hero.gd _power_depth, loot.gd power, as game.ts power: by the floor's, Endless 50 of floor 2 cut 75%
  where the game cuts 20%, the final arena 15% at any level), and the Bells', a floor 6-10 stronghold's and Plundering's gold too
  (act2/bells.gd, act1/holds.gd, hero.gd); the death screen names the endless level (main.gd fall_endless: "Fell in dungeon 12" on
  Endless 44); monsters stood off an altar room's pieces (act1/altar_rooms.gd, off for now); a unique's search past any gap (loot.gd:
  a script error past Endless 983). Left for his word: past Endless 30 a level-50 hero dies in seconds and past 50 a monster takes
  minutes to kill (10% more a level, compounded, against gear that stops at floor 20's: as the browser game); Siege's extra rooms
  fewer with the other door words. Round 6's checks, `--only=bughunt` WS_BH_FROM=6, 5 of 5; talents 86 of 86 (its Tremors line
  failed only on a busy machine).
  The random builds': a crawler (floor 7) or a Drowned (floor 10) stunned, staggered or drawn off on its way up is up after (act1.gd
  broken, an act broken off: its end's putting right, for the crawler, the Drowned, the spawn, the patient, the carter, the dredger and
  the inkling's rise; it stayed hidden for good and could not be struck); Piercing's line, and its 25 melds' twists, from a shot's
  first hit as from a blow (heroes/kit.gd _shot_hit, last_words.gd pierce_on: what the line struck the shot passes by); Twin's blows
  read their melds on every hero's shots, the Tinkerer's vials and the axe's Cleave (melds52_rules.gd blow: Onslaught's full second,
  Flurry's, Twin II's, the second-blow twists of Staccato, Ripple, Fangs, Hydra, Backwash, Refrain, Rewind, Pitchfork, Lamprey, Double
  Tap, Tempo), each use from its first blow (it was left at the last class's); Staccato's no pause on the Cleave; Haymaker's shorter
  wind-up and Flurry's quicker repeat on every hero's moves (heroes/kit.gd, hero.gd _echo_of). Left: Twin II behind's second repeat on
  the Strike alone; on the Brawler's punch Aftershock, Backwash and Hydra told nothing (not traced). Round 6's checks 7 of 7.
- HIS PICKS AFTER THE BUG HUNT (25 Nov 2026, one pop-up with the picture docs/mockups/bughunt_fixes/for_your_yes.png): the three
  looks on, "1. Banner clear (Recommended)", "2. Twin waves aimed (Recommended)", "3. Marker clear (Recommended)" (hud.gd
  BANNER_CLEAR, heroes/mage.gd TWIN_AIM, act1/quest610.gd MARK_CLEAR with heroes/warlock.gd HINT_TOWN_OFF, all on); the Brawler's
  kicks, "Raise them (Recommended)" (words.gd EVEN vkick, as hard as his punches); his jump, "Land with a blow (Recommended)" (heroes/
  brawler.gd _jump_lands: as the Warrior's Lunge comes down, all round him at the jump's own weight, its words, Twin, Echoes and the
  last words with it); deep endless, "Soften it" (main.gd endless_tough: 10% a level to Endless 20, ENDLESS_GROW_PAST 3% a level
  after: Endless 30's monsters about half as strong as they were, Endless 50's a seventh, Endless 100's a hundred-and-ninetieth).
  Round 6's checks 10 of 10.
- THE REAPING CREATURES (his words, 24 Nov 2026: “Like reaping and fire makes little imps that throw fireballs instead of the
  shades.  What would the others be?”; offered the five, “Yes and work on reaping”): five melds of Reaping with the damage runes,
  Cinderbrood (Flame), Wintergrave (Frost), Stormwake (Lightning), Bogborn (Poison) and Charnel (Power) (tools/meldsreap/
  docs_reap.txt; their stones docs/mockups/meld_runes5; melds52.json `reap`). Behind, a kill rises as its rune's creature in place
  of the grey spirit: the IMP keeps its distance and hurls fireballs that burn, the RIMELING flings icicles that chill then freeze,
  the STORMWISP zaps and the zap jumps to a second enemy, the BLIGHT TOAD spits venom and bursts in a cloud of poison as it goes,
  the BONEBRUTE slams the ground and throws them back. In front, each has a twist on a kill (fire passed on, a shatter, a soul's
  bolt, a poison burst, his might). On an enemy, it rises as its creature against him, every blow marked on the floor first.
  The creatures are pixel art from a small 3D sculptor (tools/reap5: `python3 tools/reap5/paint.py` writes assets/words/
  reap5_<kind>.png and .json, idle, walk and attack from in front and behind, cyan-edged and pink-edged). Rules
  meldsreap_rules.gd (from last_words.gd and monster.gd), looks fx_m52p_reap.gd and fx_words7.gd _reap_frame. Drawn again
  twice at his word (“We can do a little better”; “Frost guy is to lumpy, and the lightning guy is weird.  Maybe it's just like a
  wisp, just a ball of energy”): the game's own outline and edge of light, bold tones, facing the viewer; the Rimeling one
  smooth wraith, the Stormwisp a ball of storm-light. melds52.gd REAP_ON: ON at his “Better, yup switch on” to the page
  (https://claude.ai/artifact/KjN5NDpT3Ck2y8Ezp9cDuS). Checks:
  `--only=words --cases=reap5` 20 of 20; films `--fixed-fps 30 -- --only=words --cases=m52film:reap`; the page
  `python3 docs/mockups/reap5/page.py <films> <lineup png> <out>`.
- THE TREASURE CARRIERS (his words, 24 Nov 2026: “I want finding a monster with quality or plundering to be pretty cool, like
  that's going to make your next floor super exciting to run”; offered a glow of its own and a sound as it comes into view,
  “Yeah that's cool”): a monster carrying Plundering or Greed (an endless level's RARE_CARRY) stands out (prize_carry.gd): a
  pillar of the prize's light (gold, magenta) rising from over its head above the walls, seen from anywhere on the level; a line
  as the level is entered; the rare find's chime, its rune named and a line at the top as it comes into sight near him, once;
  its name and its map mark in the prize's colour; a fountain of coins or gems as it dies. prize_carry.gd ON: ON at his pick,
  “Carriers on, melds off (Recommended)”, 24 Nov 2026, to its pictures (docs/mockups/prize_carry,
  https://claude.ai/artifact/H7xU18nvFLDwxtDuaqyH2D). Check
  `--only=words --cases=prize` 9 of 9.
- THE HIGH CITY'S RUNES MELDED, the last group (his words, 24 Nov 2026: “Then we gotta get back to these melds.  I'd like to
  finish them today.”), REDONE RIGHT at his words the same day (“I don't need this done quick, I need it done right”; “I'm just one
  guy and i can't check 300+ runes and 900 animations.  I need you to police yourself on this.”): Piercing, Bleeding, Reaping,
  Culling and Surging with every other rune and with each other, 110 melds, and each one's level 2 (melds52.json `high`). Each
  designed on its own (the doc High City Melds; its text tools/meldshigh/docs_high.txt), each its own stone symbol, never half of
  each rune (docs/mockups/meld_runes6/design.py, render6.py: checked against the 192 stones before for repeats, turned or mirrored,
  and for pink, gold and contrast). Each does the work of both its runes and its own twist, in front (on the High City rune's own
  act), behind and on a monster: meldshigh_rules.gd, the hub, with its parts mh_pierce.gd, mh_bleed.gd, mh_reap.gd, mh_cull.gd,
  mh_surge.gd, hooked in last_words.gd, hero.gd, monster.gd, monsters.gd, melds52_rules.gd and city_words.gd; on a monster
  foe_meldshigh.gd, hooked in foe_melds52.gd. Numbers tools/melds52/tune.json, each meld's own keys, with the code's defaults.
  Looks fx_m52p_high.gd: each moment in the meld's own colour (an element's own when it is one), the thing it is (the named ones
  drawn as their things: a guillotine's blade, a gravestone, a noose, a hook, a pitchfork, shears, fangs, a bell), what a monster
  lays on him in the enemy's pink and gold. melds52.gd HIGH_ON: ON at his pick “Switch them on (Recommended)”, 24 Nov 2026, to the films page https://claude.ai/artifact/TKpwC9ATxHLtGrEny2T5tW (all 110 films show their moments).
  THE 20 LEAST EXCITING REDONE at his words (“Once the melds are done I want you to find the 20 weakest ones and redo them.”),
  weakest read by his pick “Least exciting”: each of the 110 scored on how much each twist shows (3 a new thing seen, 2 a
  change to one there, 1 numbers only; in front counted twice), the 20 lowest given new twists he sees happen, their names,
  ideas and stones kept: Impaler, Witchpin, Artery, Hemorrhage, Papercut, Gangrene, Bloodfeast, Thornshield, Bloodhex, Ghoul,
  Deadeye, Macabre, Gravewarden, Fetch, Bloodprice, Mercy, Last Rites, Heartbeat, Bastion, Bloodharvest (check_high.gd EXPECT:
  each side must show its new moment itself). AND AGAIN at his words (“And then do it again”): all 110 scored once more, the
  20 lowest redone the same way: Bodkin, Coup, Massacre, Barrage, Bloodlance, Bloodrage, Dart, Harrow, Harvest, Lacerate,
  Spearwall, Thornspray, Undying, Wraithstep, Deathwatch, Flicker, Haunting, Spark, Purge, Stinger. Found on the way: a monster's
  copied shot (Pitchfork's, Barrage's, Trident's) made copies of its own (monsters.gd `_copying`), and the films never killed a
  Reaping carrier, so its rising never showed (check_high.gd foe_setup, foe_dies, shared with the films).
  POLICED, every one (his “I need you to police yourself on this”): each of the 110 passed `--cases=high` only once its own
  moment was seen on all three sides (in front, behind, on a monster; check_high.gd EXPECT for the 40 redone and the six below,
  any moment not one every meld of its rune sends for the rest), then filmed. Faults it found in the game, fixed: Fishhook did
  not drag; Deadeye's critical kill went unseen (hero.gd `crit_at`); Mercy's mark could not pass on when another cull took its
  target, and Deathwatch's scythe fell only on its own culls; Mangle's and Briar's tears were missed after a stun or hold
  shorter than a bite of the bleeding (now watched every frame); Coldcut and Condemn read a chill or curse the death had
  already cleared (last_words.gd keeps `m52.was`); Decimate's copies could not split again (city_words.gd `copy_at` set before
  the hit); Noose's hold ended before its first pull (now two seconds); Harrow's spikes were painted ice, not blood; and
  Wraithspear's javelin, Deathblow's finish, Breakthrough's breach and thrust, Bloodwave's ring of thorns and Deathknell's
  toll were told by a name every meld of their rune sends, so drawn like them; now each its own. The check itself: each case
  starts with nothing of the last one's monster in the air (its warned shockwave, its shots), and a case runs only with
  `--shots` (without it the game starts in town, with no pack to fight).
  Checks `--only=words --cases=high` (or `high:<id>,<id>`), each meld in front, behind and carried by a monster; films `--fixed-fps 30 -- --only=words
  --cases=m52film:high` (or `high:<from>-<to>`); the page `python3 docs/mockups/meld_films/page.py <films> <out> high`.
- ALL MELDS: THE LEAST EXCITING REDONE (his words, 24 Nov 2026: “Next I want you to look at the larger pool of all melds, and redo
  the 20 weakest.  Then do it again.  Then do it a third time.”; weakest read as least exciting, his pick the time before). All 325
  melds (the game's own 23, the 98 of floors 1 to 10, the city's 45 and 44, the Reaping creatures' 5, the High City's 110) scored
  as the High City's were (tools/meldsredo/scores_all.py: each twist 3 a new thing seen happen, 2 a change to something already
  there, 1 numbers only; in front counted twice; ties by in front, then name), the 20 lowest redone, scored again, three rounds:
  ROUND 1 Ambush, Berserk, Blight, Bulwark, Canker, Delirium, Doom, Duelist, Eternity, Evil Eye, Fervor, Fever, Fury, Glide,
  Grudge, Haymaker, Hourglass, Lamprey, Lancet, Manacle; ROUND 2 Mauler, Momentum, Needle, Onrush, Pin, Quickdraw, Quickening,
  Rapier, Reverb, Riposte, Siphon, Stillpoint, Sunder, Tailwind, Tempo, Timeslip, Transfusion, Vendetta, Windward, Amber; ROUND 3
  Beckon, Bedrock, Blink, Bloodcurse, Bloodlust, Bloodtide, Blur, Brimstone, Bullseye, Burden, Cataclysm, Cauterize, Coldblood,
  Daze, Doubletap, Feeding Frenzy, Fetters, Flechette, Fortress, Frostbite. Each keeps its name, idea, stone and all it did (its
  own rules where they were) and gains on each side a moment seen happen: their texts tools/meldsredo/redo.txt (melds52.json
  `redo`, `redoRounds`, by tools/melds52/make.py); on his moves meldsredo_rules.gd (round 1), meldsredo2.gd, meldsredo3.gd, called
  from melds52_rules.gd's hooks (used, struck, killed, marked, wake, step, struck_him, more, crit, orb_taken); on a monster
  foe_meldsredo.gd, from foe_melds52.gd's and foe_words.gd's; their looks fx_m52p_redo.gd (the High City painter's brushes, and
  things of their own: Doom's hammer, Duelist's blades, Eternity's clock, the Hourglass, Manacle's chain, Pin's spike, Sunder's
  plates, Amber's block, Bullseye's target...). melds52.gd REDO_ON: ON (their texts too) at his pick “Switch them on (Recommended)”, 24 Nov 2026, to the films page
  https://claude.ai/artifact/TFf5QMH9oGJxPb1DxWvFBh (all 60 films show their moments).
  Checks `--only=words --cases=redo` (or `redo:round=1`, `redo:<id>,<id>`; check_redo.gd), each in front, behind and on a monster,
  passing only on its new moment (EXPECT); films `--fixed-fps 30 -- --only=words --cases=m52film:redo` (or `redo:round=1`); the page
  `python3 docs/mockups/meld_films/page_redo.py <films> <out>`. Found on the way: the High City painter drew a monster's own
  moment (a shade, a feed, a blink) at the monster for one frame only, then on him (fx_m52kit.gd `stay`).
- THE LEXICON IN THE STASH (his words, 24 Nov 2026: “I'd also like to get rid of the lexicon in the middle of town and add it to the
  stash chest.”): no Lexicon of its own in the town, the camp or the Rim (its station, prop, book, light and glow left out: town.gd,
  look.gd `_lexicon_out`); its shelf opened by the LEXICON button on the stash's half, and back by STASH (inventory.gd "svc_swap").
  ON at his “Yes” to its pictures (docs/mockups/lexicon_stash): town.gd LEXICON_IN_STASH true. `--only=lexstash` 5 of 5,
  `--only=services` 9 of 9 (its Lexicon step opens it from the stash).

## The other chats' hand-overs brought in (the cloud chat, 23 and 24 Nov 2026)

His word, 23 Nov 2026: “You can bring anything in we do here.  I'm not really using the chats anymore”.

- THE MUSIC (the sound chat's two): Vellum's camp and floors 11 to 15 their own walks and fights (`assets/music/music.json`); the
  prison town's and floors 1 to 10's walks each opening with its song's intro and going round from `loopStart` (`music.gd`).
- THE WARLOCK'S DEMON FROM ALL EIGHT SIDES (the art chat's, `docs/mockups/demon_eight/`; his “Yes, all eight are right
  (Recommended)”, 22 Nov 2026): `warlock-demon` baked again (bake de72bc23a8fd, `tools/bake_heroes.mjs` with only that group; the
  other 39 groups as they were, heroes/eccc11d9382f, so the Tinkerer's 30-a-second stand still waits on his yes), brought over
  by `tools/godot_heroes.mjs de72bc23a8fd`: eight sides, each truly painted or a mirror the bake has drawn, so the game shows it
  as it shows the man (`hero.gd` mirrors only a two-sided one); 192 packs (40 before), its three sheets always held the same
  size as before. `checks/demon_eight_check.gd` (eight sides, every list as long on each, every frame inside its sheet, 443 held and 6349 in its packs,
  and a sheet of it from all eight: its stand, run, slash, Damning and burning out); `--only=heroes --cls=warlock` 11 of 11.

## The rune bag and the melding stone (a cloud chat, 24 Nov 2026)

His words, the evening of 23 Nov 2026 (Eastern): “I have a UI issue.  I'm getting to the point where I have too many word runes
for just a bag that pops out of the side of the inventory screen.  It needs groups, searchability, intuitive design for
navigating to the exact rune you are looking for.  And probably info about each word if you press and hold on the rune.” and
“They melt into cyan light pour down two tracks to a single empty slot where the new rune forms.” Shown the mock-up
(docs/mockups/rune_bag, https://claude.ai/artifact/J555pKppZBjxdhpCy9gMBH), his picks: “Change the melding”; “The stone looks
off, Too slow, Layout”; “Straight down”; then “Build both in the game (Recommended)”. ON (inventory.gd RUNE_BAG).
- **The rune bag** (`scripts/rune_bag.gd`): the LEXICON panel over the game's half is now the RUNE BAG, opened by RUNES under
  the gold and the level. A rail of groups (ALL, the Lexicon's five pages, MELDS, each with how many; a ranked rune in its
  rune's group); a search (a see-through LineEdit over the drawn box, so the phone's keyboard comes up) by name, by a rune a
  meld is made of (MADE WITH ...) and by what it does; SORT GROUP, A-Z, MOST, NEW; over the melds, MADE WITH, the base runes
  to narrow them by; a scroll bar to hold and draw through the whole bag, its bubble saying where; every rune a tile (its
  stone twice its size, its name, how many, II, a spark on one come by since). Pressed: in hand, as from the line over the
  bag; carried sideways: dragged out to a slot. Pressed and held: a ring fills, then its card (its stone large, name, kind,
  what it grows with, how many, what it is made of, each part opening its own card, and what it does in front, behind and
  on a monster), SHOW ITS MELDS on a base rune.
- **The melding stone** (`scripts/meld_stone.gd`; its picture `assets/ui/meld_stone.png` and where its things lie
  `assets/ui/meld_stone.json`, both taken from the mock-up's own drawing): at the wordsmith, MELD, his half is one block of
  his standing stones' slate, two hollows side by side, channels straight down, the hollow beneath in the ring's six
  standing stones; the bag stands on the gear screen's half beside it (DONE in its head), a rune pressed laid in his next
  hollow, and with one laid in the bag lights what melds with it (? for a meld not found, the rest dimmed). MELD: the rules
  at once as before (loot.gd meld_words); the stone plays it out in about 1.8 s (the two crack with light, melt, run down
  the channels, wheel round the hollow beneath, the flash, the new rune's pixels gathering, its name; the rare chime now as
  it forms), the new rune shown in the bag only once formed; pressed, it flies into its place there. Anything pressed
  mid-meld finishes it at once.
- `--only=runebag` (`scripts/check_rune_bag.gd`): 18 checks and 27 pictures (the bag, a search, MADE WITH, a card held, the
  scroll bar, a rune pressed then a slot, a rune carried to a slot; the stone, the hints, a meld frame by frame, taken, a
  rank up). `--only=meld` (its 15) and `--only=menus` (the LEXICON line now the bag's) pass on it.

## Not in it yet

Nothing of the game's own: every talent of every tree is in.
(The monsters' pictures are the final release 25.3.22's bake, a9b22fa26169: the Chained One's sheets laid afresh, and the rest as
25.3.21's b982b7f72ca4 but for rounding.)

## How it is made

| Part | From |
| --- | --- |
| `assets/heroes`, `assets/monsters`, `assets/colossus`, `assets/townsfolk` | the released game's baked folders on `gh-pages` (marks in `assets/MARKS.txt`) |
| `assets/sound` | `assets/sound` on `main` |
| `assets/floor1` to `assets/floor5` | `npx tsx tools/godot_export.ts 1 1` ... `1 5` (from the repository's root, with `npm install` done; seed, then depth): the game's own painter, a new Warrior's game into that dungeon (its layout, its ways on, its waypoint and traps, its doors, gates and levers, each pack's room, floor 3's furnace and arena, floor 5's temple door and bone heaps, and its monsters) |
| `assets/looks/floor3` to `floor10` | `node tools/godot_record.mjs 3` (4 ... 10; under the open sky, floors 6 to 10, only what a view from where he can stand reaches, and the Ledge Road's sky as `floor7_sky.png` and `floor7_skytown.png`): the floor's look taken from the game itself in a headless browser (needs the Playwright the repository's playtests use; it builds `dist/godot_rec.html` if it is not there), with its states and what is seen when; it says whether the level it drew is the level in `assets/floor<N>/layout.json` |
| `assets/monsters/*.json`, `*-N.png` | the packs unpacked: `node tools/godot_unpack_monsters.mjs` |
| `assets/monsters/lists.json` | each figure's lists named, from the game's art: `npx tsx tools/godot_monster_lists.ts` |
| `assets/loot` | the game's own gear rolled on floor 1, the vendors' shelves, prices, its pictures, the fallen wordsmith, every word (the 28 melding makes among them) on gear and its rune stone: `npx tsx tools/godot_loot.ts 1` (which ends by splitting items.json so that Godot reads each part only when it is wanted: `tools/godot_loot_split.mjs`) |
| `assets/words` | the words' tables and numbers, the made words' among them: `npx tsx tools/godot_words.ts` (`check` also writes check.json, not kept, for `checks/words_check.gd`) |
| `assets/town` | the town a new game begins in, its pictures, floor 1's gate up: `npx tsx tools/godot_town.ts 1` |
| `assets/camp` | the camp inside Vellum's gate, his town from floor 10 on (game/camp.ts makeCamp, as he comes in from the Fen): `npx tsx tools/godot_town.ts 1` too; its look `assets/looks/camp*`: `node tools/godot_record.mjs camp` |
| `assets/looks` | floor 1 as THE KING'S TOMB, floor 2 as THE PRISON'S GROUNDS AT NIGHT and the town as THE CASTLE'S HALL, recorded from the game's own renderer and painters with its startup switches on (every picture, where, how deep, its light; the stairwell's opening film in `<place>_stair.png`; floor 2's skies and dark by where he is; the traps' and the waypoint's pictures): `npx tsx tools/godot_looks.ts town`, `... floor1`, `... floor2` (all the tools put the game's startup switches on first: tools/godot_switches.ts); the Headsman's yard's gate as it falls (its portcullis frame by frame, its arch with the mark alight, its slam), `floor2_gate.*`: `npx tsx tools/godot_yard_gate.ts` |
| `assets/music` | the town's and the floors' tracks and the title theme from `assets/sound` made into `.ogg` (Godot does not play `.mp4`), each cut where the game loops it, and the game's table of them: `node tools/godot_music.mjs` (needs ffmpeg) |
| `assets/words/melds3.json` | the ten melds' colours, beats and runes (render/melds3.ts): `npx tsx tools/godot_melds3.ts`; with `check`, the game's own painter on its moments, for `godot --headless --path godot -s res://checks/melds3_check.gd` (not kept) |
| `assets/words/vmelds.json` | Volatile's five melds' and the eight's colours, times and runes (render/volatile3.ts, melds8.ts): `npx tsx tools/godot_vmelds.ts`; with `check`, the game's own painters on 42 scenes, for `godot --headless --path godot -s res://checks/vmelds_check.gd` (not kept) |
| `assets/words/looks10.json` | Lasting's, Fleeting's and Vast's colours, beats and numbers (render/words10.ts): `npx tsx tools/godot_words10.ts`; with `check`, the game's own painter on 60 moments and 8 s of its clock, for `godot --headless --path godot -s res://checks/looks10_check.gd` (not kept) |
| `assets/fx` | the films of what the moves mark and throw up, painted by the game's own painters: `npx tsx tools/godot_fx.ts` (about a minute) |
| `assets/monsters/moth.json`, `moth-N.png` | the Moth's pictures, baked a move at a time with the sheets each move lies on: `node tools/godot_bake_moth.mjs` (about six minutes) |
| `assets/act3/moth.json` | the Moth's numbers, her wings' outlines, her colours, where her death's motes and words leave her: `npx tsx tools/godot_moth.ts`; with `check`, the game's own painters on 68 moments, for `godot --headless --path godot -s res://checks/moth_check.gd` (not kept) |
| `assets/floor6/holds.json` ... `floor10/holds.json`, `assets/act1/quest610.json` | the strongholds (their places, guards, halls and each one's five waves as the game spawns them), the eyrie's edge (floor 7), the cult's obelisks (floor 10), and the words and numbers of the quest line: `npx tsx tools/godot_holds.ts` |
| `assets/looks/floor<N>_hold<n>` | a stronghold's hall as it is drawn from in it: `node tools/godot_record.mjs <N> --hold <n>` |
| `assets/floor6/boss.json`, `floor7/boss.json` | a boss's ground out on the open floors (his area and what is well inside it, where his rules stand him, the drop round him), from the game's own map-maker: `npx tsx tools/godot_boss_ground.ts 1 6` (`1 7`) |
| `assets/heroes/clips.json` | every hero's pictures' own times, his moves' lists as the bake numbers them, the cards' and the tails' numbers: `npx tsx tools/godot_hero_clips.ts` |
| `assets/title` | the ring on the hill: its still (`ring.png`, under the cards in `--only=cards`), the layers it is laid up from and what its life is drawn with (`ring_*.png`, `ring.json`), painted by the game in a headless browser: `node tools/godot_title.mjs` |
| `assets/heroes/spells.*` | the Mage's orb in each element's colours, her tones and her power's crackle: `npx tsx tools/godot_spells.ts` |
| `assets/heroes/warlock_fx.*` | the Warlock's effects' pieces (render/warlock_fx.ts): `npx tsx tools/godot_warlock_fx.ts` |
| `assets/heroes/golem*`, `tinkerer_fx*` | the Tinkerer's Golem (its moves, run, rocket jump and everything at it) and her effects' pieces, with her tune: `npx tsx tools/godot_tinkerer.ts` (about half a minute) |
| `assets/heroes/veteran*` | the Brawler's moves' numbers and the art's places frame by frame, his bursts, rings and stars: `npx tsx tools/godot_veteran.ts` |
| `assets/ui/meld_stone.*` | the wordsmith's melding stone's picture and where its things lie, from the mock-up's own drawing: `node docs/mockups/rune_bag/build.mjs`, then in the page `mock.slabURL()` and `mock.geo()` (docs/mockups/rune_bag/README.md) |
| `assets/font`, `assets/hud` | the game's two pixel fonts, `npx tsx tools/godot_font.ts`; the HUD's pictures, colours and names, `npx tsx tools/godot_hud.ts` |
| `scripts/` | GDScript, each file saying which TypeScript it follows |

Checking it without hands on the keys: `godot --path godot -- --shots=<folder>` sets the hero down, unharmed, in sight
of each monster that has moves and pictures each move the moment it shows (the troll's charge line, run and slam; the
rain's ring and its arrows; the marksman's aim and great arrow; the Warden's bolts, the Lockdown's shadows and bars, the
dead he calls), says which moves were made, and quits. `--only=props` pictures a coffer shut and open, an urn whole and broken, and a Whirlwind through a row of them.
`--only=doors` pictures a door shut, swinging and open, and the Warden's gate up, falling, his line and name, and rising
once he is dead. `--only=stairs` pictures the floor of the Warden's hall breaking open as he falls, the stairwell open, and
the way down to floor 2. `--only=floor2` pictures floor 2 where he comes in, a courtyard, the sky over a far wall, the yard
and the Headsman; `--only=f2moves` a cultist's sigil, a Shade's rime and every one of the Headsman's acts; `--only=f2ways`
the floor's name, the waypoint's warp to town and back, the spikes, the darts and the sealed door. `--only=music` says what music plays as he goes from the town to
floor 1, up to a skeleton and away when the fight is over. (Neither lair on this floor leaves the troll a clear run, so for
the charge he is set down in the floor's biggest hall.)
The cloud chat's checks, each `--only=<name> --floor=N`: `floors` (each floor where he comes in, a room on, the boss's
hall), `ways` (a door, a chest, a barrel; the boss struck dead, the way on opening, taken, and where he comes out),
`boss` (`--secs=40`: the boss's moves pictured as he makes them, and which he made), `kind` (`--kind=brute`, `boneward`,
`priest`, `dagger`, `stoker`, `keyblade`, `keyflame`: one such monster alone with the hero, each move pictured, and what
it throws and leaves pictured in flight and burning; one with rules of its own struck dead and what it leaves taken up;
the Stoker put under a third of his life so that his furnace bursts), `gates` (the lever and its gate, the room that
locks, the temple door with the keybearers' own keys, the furnace with the Stoker's own gear; and whether the boss's hall
can be walked to before and after), `waypoint`, `heights`, `traps`,
`map` (the small map, the large one and the pause panel, by the keys and the pointer too).

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
- **The iPhone export** (his word: “My phone is an iPhone”; `export_presets.cfg`, iOS): Godot 4.7 makes the whole Xcode project
  here (`godot --headless --path godot --export-release "iOS" <dir>/Wordsmith.xcodeproj`, with the iOS template in
  ~/.local/share/godot/export_templates/4.7.2.stable/ios.zip); the app itself (.ipa) is made from it on a Mac (xcodebuild).
  Held sideways; the checks' data left out (the game's data 620 MB); the team ID and bundle identifier stand-ins until his
  Apple developer account. ON ONE OF GITHUB'S MACS (`.github/workflows/ios.yml`, run by a change to it or to
  `.github/ios_build.txt`; macos-26, Xcode 26, which Godot 4.7.2's template needs: Xcode 16.4 could not link it): Godot makes
  the Xcode project there and Xcode builds it, not signed yet: run 2, 22 Nov 2026, BUILD SUCCEEDED, Wordsmith.app 690 MB, in
  about 10 minutes. Signing and TestFlight to his phone wait on his account.
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

- **Strongholds on any endless level: the cult's altar room** (`scripts/act1/altar_rooms.gd`, the floors 6 to 10 strongholds'
  own rules, `act1/holds.gd`, its door and hall made a room; AltarRooms.ON, OFF until his yes to the pictures,
  docs/mockups/altar_room/, https://claude.ai/artifact/382FjE26hEgjMJwdEeENVS). His words, 23 Nov 2026: “In endless mode I want multiple chained and stronghold encounters per
  level”; the altar room, his “Yes and yes”. On an endless level of a floor with no strongholds of its own (floors 6 to 10 keep
  theirs), two of its ordinary rooms (no door of their own, off the way in, no chained rare, away from the Bells) each hold the
  cult's altar of the words with its braziers and banners (the browser game's own painters, `tools/godot_altar_room.ts` ->
  `assets/altar_room/`). Words laid and the altar woken: the cult's pink fire stands up in every doorway of the room (wall to
  everything), and five waves of the floor's own packs rise out of rifts in its floor, as a hall's do; the last dead, a hall's
  reward and the fire falls. Where the floor has too few rooms that close (the city's streets, floors 11 and 13), A RING OF FIRE:
  the altar on open floor and the fire springing up in a ring round it (RING tiles out). `--only=altarrooms --shots=<dir>`.

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

- THE NEXT GROUP (his “Let's get some more melds in”, 24 Nov 2026): Floor 11–15 Melds, his doc
  https://claude.ai/artifact/CMMUpdDX2f9DwDPe8avGqQ: the city's five runes (Pulling, Splitting, Hexing, Stilling, Binding) with
  the floor 1–5 runes and with each other, 45 melds and 5 level 2 runes. Waiting on his word; then the stones, the animations,
  the build behind a switch and films, as before.

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

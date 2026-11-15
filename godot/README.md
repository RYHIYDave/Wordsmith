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
    Precise's pins and sight, the frenzy's ring at his feet and its sparks, the shield's shell and the ward. `--only=words`,
    `--only=foewords` and `--only=wordsui` each end with these words' own cases (`check_words610.gd`: 54, 13 and 5); with
    `--cases=610` the words' and the gear screen's checks run theirs alone (`--cases=610:twin,vast`, those words').
  - WORDMELDING (the meld's port, 15 Nov 2026; game/melds.ts, melds8.ts, ui/meld.ts, as the game starts: MELD, RANK2,
    VOLT_MELDS, MELDS8, MELD_LINE on). AT THE WORDSMITH, once the Meldstone has been given him ("E: Wordsmith"): the gear screen
    with his half beside it, its first page (his words for sale: not in yet, and it says so), MELD at its top turning it to its
    second, MELDING (`inventory.gd`, its block THE WORDSMITH'S HALF; `loot.gd` meld_problem, meld_words): two of his spare words
    laid in its two hollows (pressed, dragged, or TO THE MELD on the word's card; pressed again, taken back out), MELD fusing
    them, for a runedust (the strongholds', `quest610.gd` `dust`), into one word among his, both used up; what comes out not
    shown before it is made (but two of one word: its next rank, "MAKES POWER II"); the one just made shown, "A NEW WORD,
    FOUND", and its page read under it; refused in the game's own words. THE WORDS IT MAKES (`words.gd`, resolveSkill widened;
    `words_check.gd` none differing over 59220 loadouts of the sixteen and the 28): the ten melds of two damage words, Volatile's
    five, the eight across the groups, and rank II of the five damage words, in front of and behind each of his moves; a melded
    word does the work of both its words and takes its side's one damage-word place, grows with its own attribute, and melds no
    further. IN THE FIGHT (`melds.gd`, with small hooks in `hero.gd`, `monster.gd`, `monsters.gd`, `wakes.gd`; game.ts meldHit,
    meldArc, meldPatch, meldZone, runeTwist, explodeKill, meld8Struck and the rest): each meld's twist, its head lists them all,
    and the hooks its looks will read. ON GEAR as the game has it (EVERY WORD ON GEAR: a melded word's two properties in one place,
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
    out solid, and stepping onto its way in takes him to the next floor; from the Fen, home through the town's gate (in the game,
    the camp inside Vellum's gate). The way on's own pictures come with each floor's recorded look (its state "onward").
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
A controller: the left stick, RT, LT, A, B, X.

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
    screen shows it beside the gold; melding, which spends it, is not in yet. The MUSTER ROLL'S PAGES are taken and counted (three
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

## Not in it yet

The melded words' own looks in the fight (render/melds3.ts, volatile3.ts, melds8.ts: their rules are in, and Scald's steam is
not drawn), the wordsmith's words for sale (his half's first page), the Meldstone shown by
INVENTORY while it is carried and its flight to the wordsmith's slab, the city's words and the last words (floors 11 and 16),
the looks of Lasting, Fleeting and Vast (render/words10.ts: their rules are in), Frenzied on the prison's bosses' own scripts
(the mini fleshmancer's), the trees seen through when he is behind them on floors 1 to 5 (on the open floors they are:
above), a phone's thrift with the side bosses' films (the Troll Chieftain's and the Mist Wolf's are eight big sheets, fetched
as floor 9 begins: fetched as their lairs are entered, they would cost a phone far less), what a red circle or the
Headsman's vault sends up as it lands and a bone arrow and the Warden's bolts in flight (plain drawings: the game's
general effects are brought over only for the words so far), the glow that burning things and some figures give off (the game adds it over them; here only the
places' own lights glow, and the moves cut their light in the dark), the bosses' spoken lines aloud (the Chained One and
the Amalgamation roar, are heard hurt and die in their own voices, and floors 3 to 5's monsters have their families' voices
and blows; what a boss says is shown, not spoken), the
Headsman's gate's own fall and slam, the wall's see-through for the monsters behind it, the Warden's spoken lines as he makes them, the moves' level locks, talents; in the town: the camp
it becomes from floor 10 on, the stone floating from him to the slab, the letters
swirling round the ring and its column of light, the wordsmith's words for sale, the stranger's gamble, the stash, the
Lexicon, buying back, the town's own lighting and music; uniques, magic find, the game's own
lettering and frames for the gear screen and the vendors' (these still use Godot's plain letters), the sparks as a pot
breaks, what stands behind raised ground cut off by it, the rest of the heroes, menus, the title screen's music.

## How it is made

| Part | From |
| --- | --- |
| `assets/heroes`, `assets/monsters`, `assets/colossus`, `assets/townsfolk` | the released game's baked folders on `gh-pages` (marks in `assets/MARKS.txt`) |
| `assets/sound` | `assets/sound` on `main` |
| `assets/floor1` to `assets/floor5` | `npx tsx tools/godot_export.ts 1 1` ... `1 5` (from the repository's root, with `npm install` done; seed, then depth): the game's own painter, a new Warrior's game into that dungeon (its layout, its ways on, its waypoint and traps, its doors, gates and levers, each pack's room, floor 3's furnace and arena, floor 5's temple door and bone heaps, and its monsters) |
| `assets/looks/floor3` to `floor10` | `node tools/godot_record.mjs 3` (4 ... 10; under the open sky, floors 6 to 10, only what a view from where he can stand reaches, and the Ledge Road's sky as `floor7_sky.png` and `floor7_skytown.png`): the floor's look taken from the game itself in a headless browser (needs the Playwright the repository's playtests use; it builds `dist/godot_rec.html` if it is not there), with its states and what is seen when; it says whether the level it drew is the level in `assets/floor<N>/layout.json` |
| `assets/monsters/*.json`, `*-N.png` | the packs unpacked: `node tools/godot_unpack_monsters.mjs` |
| `assets/monsters/lists.json` | each figure's lists named, from the game's art: `npx tsx tools/godot_monster_lists.ts` |
| `assets/loot` | the game's own gear rolled on floor 1, the vendors' shelves, prices, its pictures, the fallen wordsmith, every word (the 28 melding makes among them) on gear and its rune stone: `npx tsx tools/godot_loot.ts 1` |
| `assets/words` | the words' tables and numbers, the made words' among them: `npx tsx tools/godot_words.ts` (`check` also writes check.json, not kept, for `checks/words_check.gd`) |
| `assets/town` | the town a new game begins in, its pictures, floor 1's gate up: `npx tsx tools/godot_town.ts 1` |
| `assets/looks` | floor 1 as THE KING'S TOMB, floor 2 as THE PRISON'S GROUNDS AT NIGHT and the town as THE CASTLE'S HALL, recorded from the game's own renderer and painters with its startup switches on (every picture, where, how deep, its light; the stairwell's opening film in `<place>_stair.png`; floor 2's skies and dark by where he is; the traps' and the waypoint's pictures): `npx tsx tools/godot_looks.ts town`, `... floor1`, `... floor2` (all the tools put the game's startup switches on first: tools/godot_switches.ts) |
| `assets/music` | the town's and floors 1 to 5's tracks from `assets/sound` made into `.ogg` (Godot does not play `.mp4`), each cut where the game loops it, and the game's table of them: `node tools/godot_music.mjs` (needs ffmpeg) |
| `assets/fx` | the films of what the moves mark and throw up, painted by the game's own painters: `npx tsx tools/godot_fx.ts` (about a minute) |
| `assets/floor6/holds.json` ... `floor10/holds.json`, `assets/act1/quest610.json` | the strongholds (their places, guards, halls and each one's five waves as the game spawns them), the eyrie's edge (floor 7), the cult's obelisks (floor 10), and the words and numbers of the quest line: `npx tsx tools/godot_holds.ts` |
| `assets/looks/floor<N>_hold<n>` | a stronghold's hall as it is drawn from in it: `node tools/godot_record.mjs <N> --hold <n>` |
| `assets/floor6/boss.json`, `floor7/boss.json` | a boss's ground out on the open floors (his area and what is well inside it, where his rules stand him, the drop round him), from the game's own map-maker: `npx tsx tools/godot_boss_ground.ts 1 6` (`1 7`) |
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

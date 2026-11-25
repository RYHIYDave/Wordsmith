## WORDSMITH IN GODOT: a new Warrior's game, as the TypeScript game has it. He begins in the TOWN (town.gd), its wordsmith
## asking for the Master Rune-stone; the stairs take him down to FLOOR 1 of the Crypt (its layout, its stone and its
## monsters the game's own: tools/godot_export.ts), where the fallen wordsmith lies with the stone; floor 1's gate takes
## him back up. What he carries, wears and knows goes with him (loot.gd); a floor is laid again, its monsters fresh, each
## time it is come into (game.ts enterDungeon).
##   Keys: WASD or the arrows to walk; the left button to strike, the right to whirl, Space to lunge; E to use; Q a flask;
##   I or Tab the gear screen (main.gd _inputs). A controller: the left stick; RT, LT, A; B to use; X a flask.
## Shot mode, for checking it without anyone at the keys:  godot --path godot -- --shots=<folder> [--only=loot|town]
## ANY FLOOR: a place is "town" or "floor<N>"; a floor's files are assets/floor<N>/ (tools/godot_export.ts <seed> <N>) and
## its look assets/looks/floor<N>.* (tools/godot_record.mjs <N>). THE WAYS ON (game/ways.ts; ways.gd): the stairwell that
## opens in the boss's hall when he dies, and the other floors' own ways down. `--place=floor3` begins there (to look at a
## floor); `--only=floors` pictures every floor that is in.
extends Node2D

const AltarRooms := preload("res://scripts/act1/altar_rooms.gd")
const FloorMap := preload("res://scripts/floor_map.gd")
## (THE DOOR WORDS: Chains, Siege, Toll and Crown burned into the Rim's door, more of their encounters on that level)
const DoorWords := preload("res://scripts/door_words.gd")
const GroundArt := preload("res://scripts/ground_art.gd")
const BakedHero := preload("res://scripts/baked_hero.gd")
const Sfx := preload("res://scripts/sfx.gd")
const Music := preload("res://scripts/music.gd")
const FloorLayer := preload("res://scripts/floor_layer.gd")
const Stands := preload("res://scripts/stands.gd")
const Hero := preload("res://scripts/hero.gd")
const Iso := preload("res://scripts/iso.gd")

const Monsters := preload("res://scripts/monsters.gd")
const Monster := preload("res://scripts/monster.gd")
const Perils := preload("res://scripts/perils.gd")
const Hud := preload("res://scripts/hud.gd")
const Loot := preload("res://scripts/loot.gd")
const Inventory := preload("res://scripts/inventory.gd")
const Minimap := preload("res://scripts/minimap.gd")
const Temple := preload("res://scripts/temple.gd")
const Furnace := preload("res://scripts/furnace.gd")
const ChainedRare := preload("res://scripts/chained_rare.gd")
const BellsAny := preload("res://scripts/act2/bells_any.gd")
## (the checks: the Bells made on an endless level whatever its luck, by this seed; less, the level's own luck)
var bells_seed := -1
const Fx := preload("res://scripts/fx.gd")
const Wakes := preload("res://scripts/wakes.gd")
const Shadows := preload("res://scripts/shadows.gd")
const Town := preload("res://scripts/town.gd")
## THE SAVED GAME (save.gd: main.ts writeSave, readSave; game.ts save, restore)
const Save := preload("res://scripts/save.gd")
const Words := preload("res://scripts/words.gd")
const FoeWords := preload("res://scripts/foe_words.gd")
const PrizeCarry := preload("res://scripts/prize_carry.gd")
const Guide := preload("res://scripts/guide.gd")
const Look := preload("res://scripts/look.gd")
const Doors := preload("res://scripts/doors.gd")
const Props := preload("res://scripts/props.gd")
const Stairs := preload("res://scripts/stairs.gd")
const Waypoint := preload("res://scripts/waypoint.gd")
const Traps := preload("res://scripts/traps.gd")

const FLOOR_DIR := "res://assets/floor1"
const Ways := preload("res://scripts/ways.gd")
const Sight := preload("res://scripts/sight.gd")
## (floor 10: the Swamp Colossus's stone, and his fight's check)
const Stone := preload("res://scripts/act1/stone.gd")
const ColossusCheck := preload("res://checks/colossus_check.gd")
## (the deepest floor that has its files)
const FLOORS := 20
const TOWN_DIR := "res://assets/town"
const HERO_DIR := "res://assets/heroes"
const MONSTER_DIR := "res://assets/monsters"
## (game.ts leave: the curtain drawn as he goes from one place to the next)
const CURTAIN := 0.35

## The dark round the edges of the screen (an approximation of render.ts's dark and vignette: the dungeon's deep, the
## town's lighter, VIGNETTE_TOWN), to be replaced by the game's own lighting. Under it, where a floor of the descent has no
## look of its own yet, the day's veil over everything (render.ts light: its tint at its `dark`).
const DARK := """
shader_type canvas_item;
uniform vec4 dark : source_color = vec4(0.02, 0.022, 0.03, 1.0);
uniform float deep = 0.82;
uniform vec4 veil_rgb : source_color = vec4(0.0, 0.0, 0.0, 1.0);
uniform float veil_a = 0.0;
void fragment() {
	vec2 p = (UV - vec2(0.5, 0.53)) * vec2(1.7778, 1.0);
	float v = smoothstep(0.32, 0.98, length(p)) * deep;
	float a = v + veil_a * (1.0 - v);
	vec3 c = a > 0.0 ? (dark.rgb * v + veil_rgb.rgb * veil_a * (1.0 - v)) / a : dark.rgb;
	COLOR = vec4(c, a);
}
"""
## THE DESCENT'S LIGHT (game/act1.ts ACT1_FLOORS light; render.ts light): out on the open ground the day, thin or none, the
## dusk deepening toward the Fen: how thick the veil over the world (`dark`), its colour, how strong the screen's darkened
## corners. (Its pool of light round the hero, 0.08 at most, is too faint to draw here.) Where a floor has its recorded look,
## the look's own dark is drawn.
const DESCENT_LIGHT := {
	6: {"dark": 0.03, "tint": [40, 30, 60], "vignette": 0.26},
	7: {"dark": 0.0, "tint": [30, 30, 60], "vignette": 0.26},
	8: {"dark": 0.03, "tint": [50, 24, 30], "vignette": 0.26},
	9: {"dark": 0.06, "tint": [30, 22, 40], "vignette": 0.3},
	10: {"dark": 0.1, "tint": [14, 10, 26], "vignette": 0.32},
}

var place := ""
var hero: Hero
var loot: Loot
var sfx: Sfx
var music: Music
var guide: Guide
var town: Town
var map: FloorMap
var _place: Node2D
var _monsters: Monsters
var _doors: Doors
var _stairs: Stairs
var _way: Waypoint
## THE WAYS: the deepest floor whose waypoint he has reached (game.ts wayDepth): the town's waypoint takes him back down to it.
## Under 6, the town's gate down the mountain is barred (town.gd).
var way_depth := 1
## (THE SAVED GAME: written while he plays (never by the checks and shot modes, but the saved game's own); the run read back as
## the app opened, for what is put back once his town is laid out)
var saving := false
var _save_t := 0.0
var _restored := {}
## THE CLASS CARDS while they are up (their layer), and the mode the hero was made in (game/modes.ts: "normal" or "hardcore", kept
## in the save; what a death does in each is not in the port yet)
var _cards: CanvasLayer = null
## THE START SCREEN up over the game held behind it (title.gd), or null
var _title: CanvasLayer = null
## NORMAL OR HARDCORE for the next hero made: the class cards remember it (main.ts meta.mode), kept with the Lexicon
var next_mode := "normal"
## (A NEW HERO OVER A SAVED ONE: the game begun again from its save, the saved run dropped, with this hero, {cls, mode}; once. A TEST
## HERO, the level select's: {cls, trial: the floor})
static var new_hero := {}
## THE LEVEL SELECT'S TEST HERO (game.ts forTrial, trial): the floor he was made for (0: a hero of one's own). Never saved: a fall
## wakes him in town from `trial_file`, kept in memory as the game began again, never from the save; his Lexicon and stash his own.
var trial := 0
static var trial_file := {}
## THE PRACTICE ROOM (game.ts forPractice, practice): a seasoned throwaway hero in the arena, packs coming on and on; nothing there
## can kill him, nothing drops but life orbs, nothing is saved (practice.gd)
var practice := false
## THE FIRST LEVELS' MOMENT: a move just opened with a level, {skill, t} (main.ts moveToast: the HUD's NEW MOVE and its plate's
## reveal), {} none
var move_toast := {}
var hero_mode := "normal"
## NORMAL OR HARDCORE (game/modes.ts; game.ts die, wakes, wakeSave, losses; main.ts wake; ui/panels.ts drawDeath, wakeLine): his
## rulebook's “Every hero is made in one of two modes, picked at the start and kept for life.” A NORMAL hero who falls in a dungeon
## wakes in town as he went into that floor (`entry`), without what he found there and a quarter of the gold he carried in
## (NORMAL.goldShare, his “A quarter (Recommended)”), but with his level and what it brought; a HARDCORE hero is lost, the
## Lexicon and the stash kept for the next. Fallen, the screen darkens round him, then says what it cost (minimap.gd "death").
## `entry`: the run as he came into this floor ({} in town); `deaths`: the heroes lost (meta); `wake_note`: the line he wakes to.
var entry := {}
var deaths := 0


## ENDLESS MODE (game/endless.ts; game.ts endless, endlessFloor, inEndless, nextEndless, power, tough, storyHere): past the last
## floor built, the floors already built again, chosen at random, each harder than the last, for as long as the hero lives. His
## words, 20 Oct 2026: “I’d like once you beat whatever the last level we have built, it picks a random leveled scaled up so you
## can go in an endless mode of harder and harder levels until you want to stop.  Or until you die?”; his picks: the waypoint “Pick
## up where you left off (Recommended)”, dying there “The hero too”, “10% more each level (Recommended)”, “All 15 floors” (now all
## twenty). `endless`: the endless level he has reached (0: not open to him yet; it opens as the last floor's way home is taken);
## `endless_floor` the floor it is; `in_endless` whether the floor he is on is it. On it the floor is as it is (its ground, pieces,
## monsters, boss, event), but its monsters as strong as its level's depth (one past the last floor, and one more for each level
## after: `endless_power`), and 10% more life and damage for each endless level before it (`endless_tough`); no story on it
## (`story_here`: no quest people or pieces, floor 5's temple open with no key-bearers, no fallen wordsmith, floor 1 without its
## lesson); every way on leads to the next; a death there is the hero's end, Normal or Hardcore. `best_endless` (the account's):
## the deepest endless level any hero of his has cleared.
const ENDLESS_GROW := 0.1
## (past this endless level its monsters grow more slowly: ENDLESS_GROW_PAST a level; his pick, "Soften it")
const ENDLESS_SOFT_FROM := 20
const ENDLESS_GROW_PAST := 0.03
const ENDLESS_WARN := "Hardcore"
const ENDLESS_CARD_MORE := 1.5
const ENDLESS_OPENS := "Endless mode is open: the waypoint leads on, each level harder. Hardcore."
var endless := 0
var endless_floor := 0
var in_endless := false
var best_endless := 0
## (the run's own number, game.ts `seed`: which floor each endless level is, the same for the same hero and level)
var run_seed: int = randi()


## (act1.ts lastFloor) The last floor built: the deepest this copy has.
static func last_built() -> int:
	var n := 1
	while has_floor(n + 1):
		n += 1
	return n


## (endless.ts endlessPower) The depth an endless level's strength and finds are of.
func endless_power() -> int:
	return last_built() + maxi(1, endless)


## PACKS AS BIG AS THE GAME MAKES THEM (game.ts fillPack; defs.ts PACK_GROWTH, GATE_TWIN_PACKS). A floor's packs were laid at its
## own depth (assets/floorN/monsters.json: 5% bigger for each level past the first); on an endless level they are as big as its
## level has them (his pick, 20 Oct 2026: “Every floor, on into endless (Recommended)”, “5% each level (Recommended)”; held at
## double), and with Twin burned in at the gate or laid on the altar half as big again, rounded; the part of one over rounded up
## as often as it is. Each one more is one of its own pack's (not its leader, carrying nothing), laid near it, asleep.
const PACK_GROWTH := {"each": 0.05, "most": 2.0}
const GATE_TWIN_PACKS := 1.5
static func pack_growth(level: int) -> float:
	return minf(float(PACK_GROWTH["most"]), 1.0 + float(PACK_GROWTH["each"]) * (maxi(1, level) - 1))


## ENDLESS ANY LEVEL (his words, 23 Nov 2026: “I want these random encounters, (chained, stronghold, muffled bells, and royal cards)
## to show up in any level.  So it's more random.”): on an endless level of a floor outside the High City, one time in
## ROYAL_ENDLESS.level a share of its packs (`share`, as floor 16's, 12 of its 51) is touched by a royal, the Princess likeliest and the
## King least (`weights`); each of the pack wears its crest, and the last of it to fall drops its card (loot.gd). Returns how many packs.
const ROYAL_ENDLESS := {"on": true, "level": 2, "share": 0.25, "weights": {"princess": 4, "prince": 3, "queen": 2, "king": 1}}
var royal_seed := -1
func royal_packs(data: Dictionary) -> int:
	var d := int(map.depth)
	# (THE DOOR WORDS: Crown burned in, the royals' packs for sure and twice as many; on the High City's floors, their own royals
	# kept, a quarter more of its packs touched: door_words.gd)
	var crown: bool = DoorWords.burned(self, "crown") > 0
	var own: bool = d >= 16 and d <= 20
	if not bool(ROYAL_ENDLESS["on"]) or (own and not crown):
		return 0
	var rng := RandomNumberGenerator.new()
	if royal_seed >= 0:
		rng.seed = royal_seed
	else:
		rng.randomize()
	if royal_seed < 0 and not crown and rng.randi_range(1, int(ROYAL_ENDLESS["level"])) != 1:
		return 0
	var share: float = DoorWords.CROWN_OWN if own else float(ROYAL_ENDLESS["share"]) * (DoorWords.MORE if crown else 1)
	var packs := {}
	for m in data.get("monsters", []):
		if bool(m.get("boss", false)) or int(m.get("packId", -1)) < 0:
			continue
		var k := int(m["packId"])
		if not packs.has(k):
			packs[k] = []
		packs[k].append(m)
	var W: Dictionary = ROYAL_ENDLESS["weights"]
	var total := 0
	for r in W:
		total += int(W[r])
	var n := 0
	for k in packs:
		# (a pack a royal touches already, the High City's own, kept as it is)
		if (packs[k] as Array).any(func(o): return str(o.get("royal", "")) not in ["", "<null>"]):
			continue
		if rng.randf() >= share:
			continue
		var roll := rng.randi_range(1, total)
		var r := ""
		for q in W:
			roll -= int(W[q])
			if roll <= 0:
				r = q
				break
		for m in packs[k]:
			m["royal"] = r
		n += 1
	return n


func grow_packs(data: Dictionary, level: int) -> int:
	var twin: bool = FoeWords.foe_words_of(dungeon_words).has("twin")
	var g0 := pack_growth(int(map.depth))
	var g1 := pack_growth(level)
	if not twin and g1 <= g0:
		return 0
	var packs := {}
	var top := 0
	for m in data["monsters"]:
		top = maxi(top, int(m.get("id", 0)))
		var pid := int(m.get("packId", -1))
		if bool(m["boss"]) or pid < 0:
			continue
		if not packs.has(pid):
			packs[pid] = []
		packs[pid].append(m)
	var added := 0
	for pid in packs:
		var L: Array = packs[pid]
		var size := maxi(1, roundi(L.size() / g0))
		var tw := roundi(size * GATE_TWIN_PACKS) if twin else size
		var big := tw * g1
		var n := floori(big) + (1 if randf() < big - floorf(big) else 0) if big > tw else tw
		var from: Dictionary = L[L.size() - 1]
		var mid := Vector2.ZERO
		for m in L:
			mid += Vector2(float(m["x"]), float(m["y"]))
			if m.get("rarity") != "leader" and (m.get("carries", []) as Array).is_empty():
				from = m
		mid /= L.size()
		for i in range(L.size(), n):
			var d: Dictionary = from.duplicate(true)
			top += 1
			d["id"] = top
			var at := _free_near(mid + Vector2(randf_range(-1.6, 1.6), randf_range(-1.6, 1.6)))
			d["x"] = at.x
			d["y"] = at.y
			d["carries"] = []
			d["seed"] = randf()
			data["monsters"].append(d)
			added += 1
	return added


## (endless.ts endlessTough) How much more life and damage its monsters have than its depth gives: 10% more on each after the first,
## up to Endless 20; past it, ENDLESS_GROW_PAST more on each (his pick, 25 Nov 2026, "Soften it": at 10% all the way, past Endless 30
## a level-50 hero died in seconds and past 50 a monster took minutes to kill, gear stopping at floor 20's; at 3%, Endless 30's
## monsters are about half as strong as they were, Endless 50's a seventh).
func endless_tough() -> float:
	var e := maxi(1, endless)
	return pow(1.0 + ENDLESS_GROW, mini(e, ENDLESS_SOFT_FROM) - 1) * pow(1.0 + ENDLESS_GROW_PAST, maxi(0, e - ENDLESS_SOFT_FROM))


## (endless.ts endlessName)
static func endless_name(level: int) -> String:
	return "Endless %d" % maxi(1, level)


## (endless.ts endlessFloorFor) Which floor an endless level is: one of 1 to the last built, at random (the same for the same hero
## and level), never `prev`.
func endless_floor_for(level: int, prev: int) -> int:
	var from: Array = []
	for d in range(1, last_built() + 1):
		if d != prev:
			from.append(d)
	if from.is_empty():
		return 1
	var rng := RandomNumberGenerator.new()
	rng.seed = hash([run_seed, maxi(1, level), 0x5eed])
	return from[rng.randi_range(0, from.size() - 1)]


## (game.ts storyHere) Where the story and the quests are played: every floor but an endless level, and town.
func story_here() -> bool:
	return not in_endless


## ENDLESS MODE'S FANFARE (endless_splash.gd; main.ts the panel 'endless', on the event endlessOpens): once he is in his town (as the
## game holds the splash's clock while its loading screen is up), the splash, then the card; the game waits under both.
var fanfare: CanvasLayer = null
func endless_fanfare() -> void:
	while _going:
		await get_tree().process_frame
	if fanfare != null:
		return
	var layer := CanvasLayer.new()
	layer.layer = 45
	var s := preload("res://scripts/endless_splash.gd").new()
	s.main = self
	s.sfx = sfx
	layer.add_child(s)
	add_child(layer)
	fanfare = layer
	sfx.process_mode = Node.PROCESS_MODE_ALWAYS
	get_tree().paused = true
	s.done.connect(func() -> void:
		fanfare.queue_free()
		fanfare = null
		sfx.process_mode = Node.PROCESS_MODE_INHERIT
		get_tree().paused = false
		sfx.play("click"))


## (game.ts takeWay 'on' from the last floor) The last floor built beaten: the endless levels open to him; the waypoint takes him on.
func open_endless(from: int) -> bool:
	if endless > 0 or in_endless or from < last_built():
		return false
	endless = 1
	endless_floor = endless_floor_for(1, from)
	loot.say(ENDLESS_OPENS, Color("#7af8f0"))
	return true


## (game.ts nextEndless) From an endless level, every way on: on to the next, another floor at random, never the one just beaten;
## 10% harder.
func next_endless() -> void:
	var was := endless
	best_endless = maxi(best_endless, was)
	loot.cleared += 1
	endless = was + 1
	endless_floor = endless_floor_for(endless, map.depth if map != null else 0)
	in_endless = true
	loot.say("%s cleared" % endless_name(was), Color("#8af078"))
	go_to("floor%d" % endless_floor, "down" if endless_floor > 1 else "start")


## (game.ts takeWay, the town's waypoint) Back to the endless level he reached: his pick, “Pick up where you left off”. The words on
## the Rim's gate burned into it (game.ts enterDungeon: used up, for good; known in the Lexicon).
func go_endless() -> void:
	in_endless = true
	_burn_plan()
	go_warp("floor%d" % endless_floor)


## (game.ts enterEndless) THE SHAFT'S RIM: in at the gate's panel, down to the endless level he has reached, as its waypoint takes
## him (the words on the gate burned into it).
func enter_endless() -> void:
	if endless <= 0:
		return
	in_endless = true
	_burn_plan()
	go_to("floor%d" % endless_floor, "down" if endless_floor > 1 else "start")


func _burn_plan() -> void:
	dungeon_words = plan
	plan = []
	for w in dungeon_words:
		loot.learn(w)
	if not dungeon_words.is_empty():
		loot.say("Burned in: %s" % ", ".join(dungeon_words.map(func(w): return str(Words.word(w)["name"]))), Color("#7af8f0"))


# --- THE SHAFT'S RIM (game/rim.ts; main.gd's part: its record stone as he comes in, the gate's words, the shards held) ---

## The words laid on the Rim's gate (game.ts plan): burned into the next endless level he goes into; and those burned into the one
## he is on (`dungeon_words`): every monster there carries them (FOE_WORDS), and they pay: +30% items, +25 rarity, +10% experience
## for each, likelier words (game.ts rollGear, dropLoot, gainXp: wordsWeight).
var plan: Array = []
var dungeon_words: Array = []
## The endless level his record stone was last cut to (game.ts rimSeen); the shards of the tablet held, the account's, bits 0 to 3
## (game.ts meta.quarters: the bosses of floors 5, 10, 15 and 20).
var rim_seen := 0
var quarters := 0
const PLAN_MAX := 3
## (ENDLESS_KEY, game/endless_key.ts) The shards lying on the floor (shards.gd); the landing at the Rim open for this hero, the four
## set in the bench (game.ts hero.finalOpen: open until he goes through and wins below).
var shards
var final_open := false


## (game.ts tabletDue) At the Shaft's Rim, the four held and the landing not yet open for him: the wordsmith can set them.
func tablet_due() -> bool:
	return place == "rim" and (quarters & 15) == 15 and not final_open


## (game.ts setTablet) THE FOUR SET IN THE BENCH: they burn (the art's moment), and as its flare goes up the shaft the landing opens.
## The tablet is used up (his pick, “Used up, collect again (Recommended)”): the account holds none after; the landing stays open for
## this hero until he goes through.
func set_tablet() -> void:
	if not tablet_due() or town == null or town.rim_node == null:
		return
	var R = town.rim_node
	quarters = 0
	final_open = true
	R.key = {"age": 0.0, "open": false}
	R.held = quarters_held()
	R.show_state()
	hero.kick(3.0)
	fx.float_text(hero.world.x, hero.world.y, "THE TABLET", Color("#7fe8ff"))
	sfx.play("power", linear_to_db(0.9))
	loot.say("The four shards are set in the bench. The landing opens.", Loot.MSG_QUEST)


## (game.ts enterFinal) Down through the open landing, into its light, to the bottom of the shaft.
func enter_final() -> void:
	if _going:
		return
	loot.say("Down into the light.", Loot.MSG_QUEST)
	go_final()


## (game.ts enterArena) THE BOTTOM OF THE SHAFT (final_arena.gd): an endless level to the rest of the game, its own place.
var in_final := false
var final_data := {}
var arena = null
func go_final() -> void:
	in_endless = true
	dungeon_words = []
	go_to("final", "start")
	sfx.play("portal")


## (endless.ts endlessPower) The depth endless level `level`'s strength is of.
func endless_power_at(level: int) -> int:
	return last_built() + maxi(1, level)


## (game.ts comeToRim) Its record stone cut to the endless level he has reached, a notch for each, the newest glowing if any was cut
## this time; its trophies wall hung by the shards he holds.
func come_to_rim(R) -> void:
	var room: int = int(R.P["room"])
	var was := mini(rim_seen, room)
	R.notches = mini(endless, room)
	R.fresh = endless > rim_seen
	R.reached = endless
	R.best = best_endless + 1 if best_endless > 0 else 0
	R.held = quarters_held()
	if R.fresh:
		sfx.play("notch", linear_to_db(0.9))
		if R.notches > was:
			loot.say("A notch is cut in the record stone: %s." % endless_name(endless), Color("#7af8f0"))
	rim_seen = endless
	R.show_state()


## (game.ts quartersHeld) Which of the four shards he holds.
func quarters_held() -> Array:
	return [0, 1, 2, 3].map(func(k): return (quarters & (1 << k)) != 0)


## (game.ts planProblem) Why a word cannot be laid on the gate, or "".
func plan_problem(w: String) -> String:
	if int(loot.words.get(w, 0)) <= 0:
		return "No spare word"
	if plan.size() >= PLAN_MAX:
		return "At most %d words" % PLAN_MAX
	if plan.has(w):
		return "Already burning"
	var why: String = FoeWords.lay_problem(plan, w, "dungeon")
	return "Already burning" if why == "Already on it" else why


## (game.ts planWord) Lay a spare word on the gate: used up when he steps in.
func plan_word(w: String) -> String:
	var why := plan_problem(w)
	if why != "":
		return why
	loot.words[w] = int(loot.words[w]) - 1
	plan.append(w)
	sfx.play("word")
	return ""


## (game.ts unplanWord) Take a word back off the gate (free until the dungeon is entered).
func unplan_word(i: int) -> void:
	if i < 0 or i >= plan.size():
		return
	var w: String = plan[i]
	plan.remove_at(i)
	loot.words[w] = int(loot.words.get(w, 0)) + 1
	sfx.play("click")


## (game.ts wordsWeight(dungeonWords)) How many words are burned into the dungeon he is on (a melded or ranked word two).
func burned_weight() -> float:
	return float(FoeWords.words_weight(dungeon_words)) if not dungeon_words.is_empty() else 0.0


## (game.ts spawn under ENDLESS) What an endless level does to its monsters, against the floor's own (the records are its depth's):
## life as its level's depth (a boss's by its own rule) times `tough`, damage the same, experience by its depth; words as many as
## its level's depth gives an elite (two) and a guardian (three), drawn from all there are.
func endless_strength(depth: int) -> Dictionary:
	var P := float(endless_power())
	var D := float(maxi(1, depth))
	var T := endless_tough()
	var L: Dictionary = Words.data().get("depthScale", {"life": 0.35, "dmg": 0.22})
	var life := func(d: float) -> float: return 1.0 + float(L["life"]) * (d - 1.0)
	var dmg := func(d: float) -> float: return 1.0 + float(L["dmg"]) * (d - 1.0)
	return {"life": life.call(P) / life.call(D) * T, "boss": (1.0 + 0.4 * (P - 1.0)) / (1.0 + 0.4 * (D - 1.0)) * T,
		"dmg": dmg.call(P) / dmg.call(D) * T, "xp": (1.0 + 0.25 * (P - 1.0)) / (1.0 + 0.25 * (D - 1.0)),
		"words": loot.words_found_at(20)}
static var wake_note := ""
## (he has just woken in town from a fall: no start screen)
var woke := false
var _fell_for := -1.0
var fall_lost := {}
var fall_depth := 0
## (the endless level he fell on, 0 on the story's floors: the death screen names it, as panels.ts drawDeath)
var fall_endless := 0
## (main.ts FALL_SEEN: how long he is seen falling before the screen says what it cost; a press after 0.4 s brings it at once)
const FALL_SEEN := 2.0
## (game/modes.ts NORMAL.goldShare)
const GOLD_SHARE := 0.25
## (the last floor he was on: game.ts `depth`, which is still that floor's while he is in town; a new game's is floor 1)
var last_floor := 1
## (the town's gate to be unbarred as he comes in sight of it, the next time the town is laid: the ride up from floor 5 with the
## Meldstone already given, game.ts takeWay 'up'; and whether he came into town through the gate, from floor 10)
var unbar_due := false
var came_in_gate := false
var _hud
var _loot: Loot
var _inv
## (TOUCH, for a phone: touch.gd)
var _touch = null
## (A GAME CONTROLLER: pad.gd) and whether one is being played with now (gamepad.ts PAD_USE.live): the prompts name its buttons
var _pad = null
var pad_live := false
## (what the hero and the town's people say: speech.gd)
var _speech = null
var _uniques = null
var _companions = null
var _foe = null
## (the small map top right, the large one and the pause panel: minimap.gd)
var _mini
var _veil: ColorRect
var _curtain: ColorRect
var _going := false
var _gate := {}
## (the place's recorded look, where it has one, and the hero's own pool of light it gave him)
var look: Look
var _hero_light: Node
## (the floor's ways on: ways.gd)
var ways: Ways
## (what he has seen of the floor: sight.gd)
var sight: Sight
## (floor 10's stone: act1/stone.gd; null elsewhere)
var stone: Stone
## (floor 5's temple door, its chains and keys: temple.gd; null elsewhere)
var temple: Temple
## (floor 3's furnace, its crank and the fire in the Chained One's way: furnace.gd; null elsewhere)
var furnace: Furnace
## (what the fight shows of a blow and of a word: fx.gd; a place's own)
var fx: Fx
## (the ground his moves leave: wakes.gd; a place's own)
var wakes: Wakes
## (FLOORS 6 TO 10 BESIDES THEIR FIGHTS: the quest line, what lies of it, the quest marks, floor 10's pillars: act1/quest610.gd,
## the hero's own and kept from place to place; the floor's strongholds: act1/holds.gd, its own)
var quest610
## (FLOORS 11 TO 15 BESIDES THEIR FIGHTS: the Crier's jar, the unstruck pages, the clapper: act2/quest1115.gd)
var quest1115
## THE CHAINED RARE, floors 2 to 5 and an endless level of floors 1 to 5 (chained_rare.gd): the floor's own, null where none.
## `chained_seed`: 0 or more, the same one in the same place each time (the checks); less, the floor's own luck.
var chained_rare = null
## (ENDLESS ANY LEVEL: every one laid on this level, chained_rare the first of them)
var chained_rares: Array = []
var chained_seed := -1
var _chained_mdata := {}
## (STRONGHOLDS ON ANY ENDLESS LEVEL: the floor's monsters, the altar rooms' waves made of their packs, kept until they are laid;
## the level's luck for them, or -1: act1/altar_rooms.gd)
var floor_mdata := {}
var altar_seed := -1
## (FLOORS 16 TO 20 BESIDES THEIR FIGHTS: the clockwork songbird, the whole court, the captain's voice: act3/quest1620.gd)
var quest1620
## (ACT 2, THE BELLS, the city floors' event: act2/bells.gd)
var bells
## (THE HIGH CITY, FLOOR 16: the Swan Gardens' nettle beds and her vine in the yew: act3/garden.gd)
var garden = null
## (THE HIGH CITY, FLOOR 17: the Masque's great ebony clock: act3/masque.gd)
var masque = null
## (THE HIGH CITY, FLOOR 18: the Glass Gallery's tall mirrors: act3/gallery.gd)
var gallery = null
## (THE HIGH CITY, FLOOR 19: the Keep's portcullises: act3/keep.gd)
var keep = null
## (FLOOR 20: the Quiet Tower's stair up to its top and its trapdoor down, shut while the Moth lives: act3/tower.gd)
var tower = null
var holds:
	get:
		return quest610.holds if quest610 != null else null


## Which floor a place is (0: the town).
static func depth_of(where: String) -> int:
	return int(where.substr(5)) if where.begins_with("floor") else 0


## The folder of a place's files.
static func dir_of(where: String) -> String:
	return TOWN_DIR if where == "town" else "res://assets/" + where


## A place that is his town: the prison town, or the camp inside Vellum's gate (game/camp.ts).
static func is_home(where: String) -> bool:
	return where == "town" or where == "camp" or where == "rim"


## His town now: from floor 10 on, once he has come through into it, the camp inside Vellum's gate (game.ts campTown, wayDepth 11
## or more: his pick, “Yes, the camp from then on (Recommended)”); before, the prison town.
func home_place() -> String:
	# (THE ENDLESS TOWN, game.ts rimTown: once endless is open to him, his town is the Shaft's Rim: his pick, “Once endless opens”)
	if endless > 0 and FileAccess.file_exists("res://assets/rim/layout.json"):
		return "rim"
	return "camp" if way_depth >= 11 and FileAccess.file_exists("res://assets/camp/layout.json") else "town"


## Whether a floor's files are there.
static func has_floor(n: int) -> bool:
	return FileAccess.file_exists("res://assets/floor%d/layout.json" % n)


func _ready() -> void:
	# (the checks written for the Warrior's Whirlwind give him its talent; `--whirl1`, his one-spin Whirl as he starts: talents.gd)
	preload("res://scripts/talents.gd").checks_whirlwind = _arg("shots") != "" and _arg("whirl1") == ""
	# (THE THREE DEFENCES, on at his yes: `--defence=0` to run without them: loot.gd DEFENCE_LAYERS)
	if _arg("defence") == "0":
		preload("res://scripts/loot.gd").DEFENCE_LAYERS = false
	# (THE FIFTEEN OF THE THREE DEFENCES, on at his yes: `--defuniques=0` to run without them dropping: loot.gd DEFENCE_UNIQUES)
	if _arg("defuniques") == "0":
		preload("res://scripts/loot.gd").DEFENCE_UNIQUES = false
	# (FIFTEEN MORE LEVELING UNIQUES, on at his yes: `--level2=0` to run without them dropping: loot.gd LEVEL2_UNIQUES)
	if _arg("level2") == "0":
		preload("res://scripts/loot.gd").LEVEL2_UNIQUES = false
	# (TWELVE LEVELING WEAPONS, on at his yes: `--level3=0` to run without them dropping: loot.gd LEVEL3_UNIQUES)
	if _arg("level3") == "0":
		preload("res://scripts/loot.gd").LEVEL3_UNIQUES = false
	# (THE FIFTEEN'S OWN PICTURES, on at his yes: `--defart=0` to run without them)
	# (THE STORM CLOUDS MADE AGAIN, on at his “All good”: `--clouds2=0` shows them as they were, fx_cloud.gd)
	# (THE NEW MELDS KEEP LEECH'S OWN DRAIN, on at his “All good”: `--leechsame=0` shows it as it was, fx_m52kit.gd)
	if _arg("leechsame") != "":
		preload("res://scripts/fx_m52kit.gd").LEECH_SAME = _arg("leechsame") == "1"
	# (THE MELDS USE THEIR WORDS' OWN LOOKS, on at his “All good”: `--wordsown=0` shows them as they were: fx_m52kit.gd OWN)
	if _arg("wordsown") != "":
		preload("res://scripts/fx_m52kit.gd").set_own(_arg("wordsown") == "1")
		preload("res://scripts/fx_m52kit.gd").LEECH_SAME = _arg("wordsown") == "1" if _arg("leechsame") == "" else _arg("leechsame") == "1"
	if _arg("clouds2") != "":
		preload("res://scripts/fx_cloud.gd").ON = _arg("clouds2") == "1"
	if _arg("defart") == "0":
		preload("res://scripts/loot.gd").DEFENCE_ART = false
	# (HIS CURSE THROWN, on at his yes to its pictures: `--curse=round` to run without it: heroes/warlock.gd CURSE_RANGED)
	if _arg("curse") == "round":
		preload("res://scripts/heroes/warlock.gd").CURSE_RANGED = false
	_screen_start()
	_inputs()
	sfx = Sfx.new()
	add_child(sfx)
	music = Music.new()
	add_child(music)
	hero = Hero.new()
	hero.art = BakedHero.new(HERO_DIR, "warrior")
	hero.sfx = sfx
	# (what he carries, wears and knows, from place to place: loot.gd)
	loot = Loot.new()
	loot.hero = hero
	loot.sfx = sfx
	loot.main = self
	add_child(loot)
	_loot = loot
	# (UNIQUE ITEMS: what the uniques he wears do: uniques.gd)
	_uniques = preload("res://scripts/uniques.gd").new()
	_uniques.main = self
	_uniques.hero = hero
	_uniques.loot = loot
	add_child(_uniques)
	hero.uniques = _uniques
	hero.loadout.uq = _uniques
	# (THE RANGER'S COMPANIONS: companions.gd)
	_companions = preload("res://scripts/companions.gd").new()
	_companions.main = self
	_companions.hero = hero
	add_child(_companions)
	# (EVERY WORD ON A DUNGEON: melded and ranked words on the monsters: foe_words.gd)
	_foe = preload("res://scripts/foe_words.gd").new()
	_foe.main = self
	add_child(_foe)
	guide = Guide.new()
	guide.main = self
	_gate = JSON.parse_string(FileAccess.get_file_as_string(TOWN_DIR + "/floor1_gate.json"))

	var layer := CanvasLayer.new()
	_veil = ColorRect.new()
	_veil.set_anchors_preset(Control.PRESET_FULL_RECT)
	_veil.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var mat := ShaderMaterial.new()
	mat.shader = Shader.new()
	mat.shader.code = DARK
	_veil.material = mat
	layer.add_child(_veil)
	var hud := Hud.new()
	hud.hero = hero
	hud.loot = loot
	hud.main = self
	layer.add_child(hud)
	_hud = hud
	var mini := Minimap.new()
	mini.main = self
	mini.hud = hud
	layer.add_child(mini)
	_mini = mini
	# (TOUCH, for a phone: the stick, the thumb's taps, holds and swipes; touches on the screen's own things as presses)
	if _touch == null:
		_touch = preload("res://scripts/touch.gd").new()
		_touch.main = self
		add_child(_touch)
	if _pad == null:
		_pad = preload("res://scripts/pad.gd").new()
		_pad.main = self
		add_child(_pad)
	if _speech == null:
		_speech = preload("res://scripts/speech.gd").new()
		_speech.main = self
		add_child(_speech)
	var inv := Inventory.new()
	inv.loot = loot
	inv.hero = hero
	inv.main = self
	layer.add_child(inv)
	_inv = inv
	mini.inv = inv
	_curtain = ColorRect.new()
	_curtain.set_anchors_preset(Control.PRESET_FULL_RECT)
	_curtain.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_curtain.color = Color(0, 0, 0, 0)
	layer.add_child(_curtain)
	add_child(layer)
	place_safe()
	# (FLOORS 6 TO 10 BESIDES THEIR FIGHTS: act1/quest610.gd)
	quest610 = preload("res://scripts/act1/quest610.gd").new()
	quest610.main = self
	add_child(quest610)
	quest1115 = preload("res://scripts/act2/quest1115.gd").new()
	quest1115.main = self
	add_child(quest1115)
	quest1620 = preload("res://scripts/act3/quest1620.gd").new()
	quest1620.main = self
	add_child(quest1620)
	# (ENDLESS_KEY: the tablet's shards, dropped by the endless levels' bosses of floors 5, 10, 15 and 20: shards.gd)
	shards = preload("res://scripts/shards.gd").new()
	shards.main = self
	add_child(shards)
	bells = preload("res://scripts/act2/bells.gd").new()
	bells.main = self
	add_child(bells)
	garden = preload("res://scripts/act3/garden.gd").new()
	garden.main = self
	add_child(garden)
	masque = preload("res://scripts/act3/masque.gd").new()
	masque.main = self
	add_child(masque)
	gallery = preload("res://scripts/act3/gallery.gd").new()
	gallery.main = self
	add_child(gallery)
	keep = preload("res://scripts/act3/keep.gd").new()
	keep.main = self
	add_child(keep)
	tower = preload("res://scripts/act3/tower.gd").new()
	tower.main = self
	add_child(tower)

	var shots := _arg("shots")
	# (a new game begins in town: game.ts constructor, enterTown; shot mode's fights begin on floor 1)
	var first := _arg("place")
	if first == "":
		first = "floor2" if _arg("only") in ["floor2", "demonfilm", "f2moves", "f2ways", "glows", "fxleft", "yardgate", "bossrage", "veil", "lairfetch", "voices", "wallsee", "behind", "touch", "speech", "uniques", "uniquesdo", "uniqueslook", "uniqueswar", "uniquescls", "lesson", "upright", "pad", "foemelds", "sounds14", "skins"] else "floor1" if shots != "" and not _arg("only") in ["town", "music", "floors", "descent", "title", "title_live", "trial", "practice", "townnames", "compare", "menus", "runebag", "companions", "endless", "rim", "shards", "final", "fanfare", "packs", "finalmusic", "memfloors", "smooth"] else "town"
	# (THE SAVED GAME: the Lexicon and the stash, and the run in progress, read back; he comes back in his town: game.ts restore)
	saving = (_arg("only") == "" and shots == "" and _arg("place") == "") or _arg("only") in ["save_write", "save_read", "fall_live", "title_live"]
	var fresh := new_hero.duplicate()
	new_hero = {}
	# (a test hero: never saved, and nothing of the save read; one fallen, woken from what was kept of him in memory)
	var tf := trial_file.duplicate()
	trial_file = {}
	trial = int(fresh.get("trial", tf.get("trial", 0)))
	practice = fresh.get("practice", false) == true
	hero.practice = practice
	# (THE FIRST LEVELS: in play, for a test hero, and in their own check; a check of anything else has every move open)
	hero.first_levels = saving or trial > 0 or _arg("only") in ["openings"]
	hero.loadout.practice = practice
	if trial > 0 or practice:
		saving = false
	if saving and _arg("only") != "save_write" and not (_arg("only") == "fall_live" and preload("res://scripts/check_fall.gd").stage == 0) \
			and not (_arg("only") == "title_live" and preload("res://scripts/check_title.gd").stage == 0):
		var file := Save.read()
		if file.get("meta") is Dictionary:
			Save.restore_meta(self, file["meta"])
		if file.get("run") is Dictionary and fresh.is_empty():
			Save.restore_run(self, file["run"])
			_restored = file["run"]
			first = home_place()
	if not tf.is_empty():
		Save.restore_meta(self, tf["meta"])
		if tf.get("run") is Dictionary:
			Save.restore_run(self, tf["run"])
			_restored = tf["run"]
			first = home_place()
	elif trial >= 2:
		_restored = trial_run(str(fresh["cls"]), trial)
		Save.restore_run(self, _restored)
		first = "floor%d" % trial
	elif trial == 1:
		first = "floor1"
	elif practice:
		_restored = practice_run(str(fresh["cls"]))
		Save.restore_run(self, _restored)
		first = "practice"
	if (trial > 0 or practice) and tf.is_empty():
		# (a test hero is not taught: the game's forTrial has no lessons, its Game made without a guide)
		loot.taught = true
	# (HIS CLASS: the saved hero's, or for a check the one asked for (--cls=ranger); a new game's the Warrior until the hero choice)
	var cls := _arg("cls")
	# (a check of the Tinkerer's Golem in its new look, its switch left off: --look=wheel, heroes/tinkerer_look.gd WHEEL_LOOK)
	if _arg("look") == "wheel":
		preload("res://scripts/heroes/tinkerer_look.gd").wheel_look_now = true
	if cls == "":
		cls = str(_restored.get("cls", fresh.get("cls", "warrior")))
	if not fresh.is_empty():
		hero_mode = str(fresh.get("mode", "normal"))
	set_class(cls, _restored.is_empty())
	# (THE SKILL TREES: his talents put back once his class is his: game.ts restore, cleanTalents; the picks made on them)
	if not _restored.is_empty():
		hero.talents = preload("res://scripts/talents.gd").clean(hero.cls, loot.level, _restored.get("talents"))
		hero.picks = {}
		if _restored.get("picks") is Dictionary:
			for k in _restored["picks"]:
				# (a talent's pick; and THE MOVES TO LEARN, the move set in his tap's or his hold's place: game.ts restore, MOVE_PICK)
				if hero.talents.has(k) or (k in hero.MOVE_PICK and Words.data()["skills"].has(str(_restored["picks"][k]))):
					hero.picks[k] = str(_restored["picks"][k])
		hero.talents_changed()
	_build(first, "start")
	if not _restored.is_empty():
		Save.restore_bought(self, _restored)
	# (NORMAL OR HARDCORE: fallen, he stays down and the screen says what comes of it; in a check of something else he is up again
	# where he came in. Woken in town from a fall, the line of what it cost: main.ts wake)
	hero.stays_down = saving or trial > 0 or _arg("only") in ["fall", "fall_live"]
	if wake_note != "":
		loot.say(wake_note, hud.T.get("text", Color.WHITE) if hud != null and hud.T is Dictionary else Color.WHITE)
		wake_note = ""
		woke = true
	# (THE START SCREEN, every time the game begins (title.gd): the game waiting behind it, a saved hero in his town, till CONTINUE
	# or a new hero; not as a fallen hero wakes, nor as a new hero picked over a saved one begins, warping in)
	if not fresh.is_empty():
		_warp_in()
		if saving:
			Save.write(self)
		if practice:
			# (game.ts beginPractice: what he is told)
			loot.say("Nothing here can kill you, and nothing is saved.", Color("#f0e8ff"))
			loot.say("Practice room. Every word is yours: open the INVENTORY.", Color("#7af8f0"))
		if trial > 0:
			# (game.ts readyFor: what he is told)
			loot.say("Test hero, level %d. Not saved. Your words are in the INVENTORY." % loot.level if trial >= 2 else "Test hero. Not saved.", Color("#7af8f0"))
	elif saving and _arg("cls") == "" and _arg("only") in ["", "title_live"] and wake_note == "" and not woke:
		title_up(first)
	woke = false
	if shots != "":
		_shoot(hero, shots)


## THE START SCREEN over everything (title.gd), the game held behind it (main.ts mode 'title'), its theme playing: CONTINUE, where a
## hero is saved, takes him on from his town; a new hero picked (NEW GAME, the class cards) begins the run where `first` is,
## warping in, or, over a saved hero, the game begins again from its save without him. Returns the screen.
func title_up(first: String) -> Node:
	var layer := CanvasLayer.new()
	layer.layer = 50
	var ts := preload("res://scripts/title.gd").new()
	ts.main = self
	ts.sfx = sfx
	ts.music = music
	ts.mode = next_mode
	if not _restored.is_empty():
		var cn: Dictionary = Words.data()["classes"].get(hero.cls, {})
		ts.saved_cls = hero.cls
		ts.resume = "%s, level %d, dungeon %d%s" % [cn.get("name", hero.cls.capitalize()), loot.level, maxi(1, last_floor), ", Hardcore" if hero_mode == "hardcore" else ""]
	layer.add_child(ts)
	add_child(layer)
	_title = layer
	sfx.process_mode = Node.PROCESS_MODE_ALWAYS
	get_tree().paused = true
	ts.resumed.connect(_resume)
	ts.picked.connect(func(c: String, m: String) -> void: _title_picked(c, m, first, ts.trial, ts.practice))
	return ts


func _title_down() -> void:
	if _title != null:
		_title.queue_free()
		_title = null
	music.title_music(false)
	sfx.process_mode = Node.PROCESS_MODE_INHERIT
	get_tree().paused = false


## CONTINUE (main.ts continueRun): the saved hero carries on from his town, told where the gate leads.
func _resume() -> void:
	_title_down()
	loot.say("Welcome back. The gate leads to dungeon %d." % maxi(1, last_floor), _hud.T.get("text", Color.WHITE) if _hud != null and _hud.T is Dictionary else Color.WHITE)


## A new hero picked on the start screen's class cards (main.ts pickClass, newRun): with no hero saved, the run begins here; over a
## saved one, the save keeps the Lexicon and the stash and drops his run, and the game begins again from it with the new hero.
func _title_picked(c: String, m: String, first: String, floor := 0, room := false) -> void:
	if room:
		# (THE PRACTICE ROOM: the game begun again with the practice hero in the arena; never saved)
		new_hero = {"cls": c, "practice": true}
		get_tree().paused = false
		get_tree().reload_current_scene()
		return
	if floor > 0:
		# (THE LEVEL SELECT: the game begun again with the test hero made ready for the floor picked, straight to it; never saved)
		new_hero = {"cls": c, "trial": floor}
		get_tree().paused = false
		get_tree().reload_current_scene()
		return
	next_mode = m
	if _restored.is_empty():
		_title_down()
		set_class(c, true)
		hero_mode = m
		_build(first, "start")
		_warp_in()
		if saving:
			Save.write(self)
		return
	new_hero = {"cls": c, "mode": m}
	if saving:
		Save.write(self, null)
	get_tree().paused = false
	get_tree().reload_current_scene()


## THE LEVEL SELECT'S TEST HERO for a class and a floor from the second (game.ts forTrial, readyFor: made by the game itself,
## assets/loot/trials.json), as a run to be put back: his level, his points spent, the ring lit, his gear, every word down to the
## floor in his pouch; the floors before it cleared, the way open to it.
func trial_run(c: String, d: int) -> Dictionary:
	var T: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://assets/loot/trials.json"))["trials"]
	var h: Dictionary = T.get(c, T["warrior"]).get(str(d), {})
	return {"cls": c, "mode": "normal", "level": h.get("level", 1), "xp": 0, "points": 0, "attrs": h.get("attrs", {}), "gear": h.get("gear", {}),
		"bag": [], "words": h.get("words", {}), "gold": 0, "depth": d, "cleared": d - 1, "way": d, "ring": true}


## THE PRACTICE ROOM'S HERO for a class (game.ts forPractice, beginPractice: made by the game itself, assets/loot/trials.json
## `practice`), as a run to be put back: level 10, the ring lit, his gear, one of every other weapon in his bag, six of every word.
func practice_run(c: String) -> Dictionary:
	var P: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://assets/loot/trials.json"))["practice"]
	var h: Dictionary = P.get(c, P["warrior"])
	return {"cls": c, "mode": "normal", "level": h.get("level", 10), "xp": 0, "points": 0, "attrs": h.get("attrs", {}), "gear": h.get("gear", {}),
		"bag": (h.get("bag", []) as Array).filter(func(it): return it is Dictionary), "words": h.get("words", {}), "gold": 0, "depth": 4, "cleared": 0, "way": 1, "ring": true}


# --- THE SCREEN (engine/screen.ts) ---
## The game is laid out on a small screen of game pixels, about 270 tall, made bigger by a whole number so that every pixel stays
## square; the picture holds two picture pixels to a game pixel (RES). On a phone the app is held sideways and turns with it;
## PLAY UPRIGHT (the pause panel, the start screen's OPTIONS; main.ts turnLabel, flipTurn) holds it upright instead and lays the
## game out for that (a phone upright: about 295 by 543), kept with the device. `--upright=1`, for the checks: a window the shape
## of a phone held upright.
const TARGET_H := 270.0
const MIN_W := 270.0
const MIN_H := 200.0
## (EVEN_PIXELS: on a phone an odd number made one fewer, even, where the view stays within this many game pixels tall)
const MAX_H := 324.0
const SCREEN_KEEP := "user://touch.cfg"
## The player's choice: held upright (true) or sideways.
var upright := false
## PLAY UPRIGHT offered (the start screen's OPTIONS, the pause panel): OFF at his word, 22 Nov 2026: “I appreciate the work but no
## one is going to play this game upright”, then “Take upright out”. The game held sideways always (a choice kept from before
## is not read); the upright layout stays in the code, for `--upright=1` alone.
const UPRIGHT_ON := false


func _screen_start() -> void:
	var cf := ConfigFile.new()
	# (the checks are not held to a choice kept on this machine by an earlier one)
	if UPRIGHT_ON and cf.load(SCREEN_KEEP) == OK and _arg("shots") == "":
		upright = cf.get_value("screen", "upright", false) == true
	if _arg("upright") != "":
		upright = true
		DisplayServer.window_set_size(Vector2i(590, 1086))
	# (`--phone=WxH`, for the checks: a window a phone's screen's size in its own pixels, as 2532x1170)
	if _arg("phone") != "":
		var wh := _arg("phone").split("x")
		if wh.size() == 2:
			DisplayServer.window_set_size(Vector2i(int(wh[0]), int(wh[1])))
	_turn()
	get_tree().root.size_changed.connect(fit_screen)
	fit_screen()


## The phone held the chosen way (on a computer, nothing: its window is as it is).
func _turn() -> void:
	DisplayServer.screen_set_orientation(DisplayServer.SCREEN_SENSOR_PORTRAIT if upright else DisplayServer.SCREEN_SENSOR_LANDSCAPE)


## (engine/screen.ts resize) The game's screen, in game pixels, for the window as it is: the whole number of screen pixels to a
## game pixel that makes it about 270 tall (a phone's a little bigger), no narrower than 270 nor shorter than 200 if a smaller one
## can help it, and on a phone an even number where it may be.
func fit_screen() -> void:
	var win: Vector2i = DisplayServer.window_get_size()
	var dw := float(maxi(1, win.x))
	var dh := float(maxi(1, win.y))
	var touch := DisplayServer.is_touchscreen_available()
	var s: int = maxi(1, ceili(dh / TARGET_H - 0.15) if touch else roundi(dh / TARGET_H))
	while s > 1 and (dw / s < MIN_W or dh / s < MIN_H):
		s -= 1
	if touch and s > 2 and s % 2 == 1 and dh / (s - 1) <= MAX_H:
		s -= 1
	# (two picture pixels to a game pixel: the screen pixels to a picture pixel, a whole number)
	var k: int = maxi(1, s / 2)
	var w: int = ceili(dw / (2.0 * k)) * 2
	var h: int = ceili(dh / (2.0 * k)) * 2
	get_tree().root.content_scale_size = Vector2i(w, h)
	place_safe()


## A PHONE'S NOTCH AND ROUNDED CORNERS (engine/screen.ts: the browser game kept its whole canvas within the page's
## env(safe-area-inset-*)): the screen's own things (the HUD, the small map and its panels, the gear screen) kept within the
## part of the screen the phone calls safe, the world still drawn out to every edge. How far in from each edge, in game pixels
## (l, t, r, b): none on a computer; `--safe=L,T,R,B`, in screen pixels, for the checks: a phone's as if.
func safe_insets() -> Dictionary:
	var out := {"l": 0.0, "t": 0.0, "r": 0.0, "b": 0.0}
	var win: Vector2i = DisplayServer.window_get_size()
	if win.x <= 0 or win.y <= 0:
		return out
	var cut := [0, 0, 0, 0]
	if _arg("safe") != "":
		var parts := _arg("safe").split(",")
		for i in mini(4, parts.size()):
			cut[i] = int(parts[i])
	elif OS.has_feature("mobile"):
		var safe: Rect2i = DisplayServer.get_display_safe_area()
		if safe.size.x > 0 and safe.size.y > 0:
			cut = [safe.position.x, safe.position.y, win.x - safe.end.x, win.y - safe.end.y]
	# (screen pixels to game pixels: the view is content_scale_size picture pixels across, two to a game pixel)
	var k: float = float(get_tree().root.content_scale_size.x) / float(win.x) / 2.0
	var keys := ["l", "t", "r", "b"]
	for i in 4:
		out[keys[i]] = ceilf(maxf(0.0, float(cut[i])) * k)
	return out


## The HUD, the small map and the gear screen set within the safe part of the screen (safe_insets), as the screen is now.
func place_safe() -> void:
	var s := safe_insets()
	for c in [_hud, _mini, _inv]:
		if c != null and is_instance_valid(c):
			c.offset_left = s["l"] * 2.0
			c.offset_top = s["t"] * 2.0
			c.offset_right = -s["r"] * 2.0
			c.offset_bottom = -s["b"] * 2.0


## (main.ts turnLabel) The switch's words, on a phone: the other way to hold it.
func turn_label() -> String:
	return "PLAY SIDEWAYS" if upright else "PLAY UPRIGHT"


## (main.ts flipTurn) Held the other way, kept with the device. (On a computer, for the checks, the window turned.)
func flip_turn() -> void:
	upright = not upright
	var cf := ConfigFile.new()
	cf.load(SCREEN_KEEP)
	cf.set_value("screen", "upright", upright)
	cf.save(SCREEN_KEEP)
	_turn()
	if not OS.has_feature("mobile"):
		var win: Vector2i = DisplayServer.window_get_size()
		if (win.y > win.x) != upright:
			DisplayServer.window_set_size(Vector2i(win.y, win.x))
	fit_screen()


## ABILITIES: COOLDOWNS or MANA turned (main.ts flipLimit): the device's choice, kept; his moves made again under the other.
func flip_limit() -> void:
	loot.set_limit("cooldown" if loot.limit == "mana" else "mana")
	save_now()
	sfx.play("click")


## THE PAUSE PANEL'S THIRD BUTTON (main.ts: "End run", or for a test hero "Leave"): back to the start screen. A hero of one's own is
## given up (main.ts clearSave: the run gone from the save, the Lexicon and the stash kept); a test hero leaves the save as it was.
func end_run() -> void:
	if saving and trial == 0 and not practice:
		Save.write(self, null)
	trial_file = {}
	new_hero = {}
	wake_note = ""
	get_tree().paused = false
	get_tree().reload_current_scene()


## THE CLASS CARDS over everything, the game held behind them (main.ts, mode 'title'); the hero picked begins the run where `first`
## is, warping in (main.ts enter: fx.arrive, the portal's sound). Returns the cards.
func cards_up(first: String) -> Node:
	var layer := CanvasLayer.new()
	layer.layer = 50
	var cc := preload("res://scripts/class_cards.gd").new()
	cc.main = self
	cc.sfx = sfx
	layer.add_child(cc)
	add_child(layer)
	_cards = layer
	sfx.process_mode = Node.PROCESS_MODE_ALWAYS
	get_tree().paused = true
	cc.picked.connect(func(c: String, m: String) -> void: _picked(c, m, first))
	return cc


func _picked(c: String, m: String, first: String) -> void:
	if _cards != null:
		_cards.queue_free()
		_cards = null
	sfx.process_mode = Node.PROCESS_MODE_INHERIT
	get_tree().paused = false
	set_class(c, true)
	hero_mode = m
	_build(first, "start")
	_warp_in()


## (main.ts enter: they warp in where the run begins: fx.arrive, the ring and the motes of a warp, the figure coming together)
func _warp_in() -> void:
	hero.arrive()
	# (and a line of his own as he comes into a dungeon; in town there is nothing to say it about: speech.gd)
	if _speech != null:
		_speech.arrived()
	if fx != null:
		var C := preload("res://scripts/fx_looks.gd").P
		var cols := PackedColorArray([C["tl5"], C["tl4"], C["white"]])
		fx.ring(hero.world.x, hero.world.y, 0.9, 0.3, cols, false)
		for i in 18:
			fx.mote(hero.world.x, hero.world.y, cols)
	sfx.play("portal")


## HIS CLASS (game/defs.ts CLASSES): his pictures, his three moves (the Warrior's in hero.gd, any other's by its kit,
## scripts/heroes/<class>.gd), the attribute they grow with; and for a new hero (`fresh`) his starting attributes and weapon
## (items.ts starterWeapon).
func set_class(c: String, fresh: bool) -> void:
	if not Words.data()["classes"].has(c):
		c = "warrior"
	if hero.cls != c or fresh:
		hero.talents = preload("res://scripts/talents.gd").starting(c)
		hero.picks = {}
	hero.cls = c
	# (in his town, the camp and the rim, his weapon on his back: render.ts, the heroes' art `town: game.level.town`; the bake's
	# `town` key, art/heroes3.ts; anywhere else, the dungeon's)
	hero.arts = {"dungeon": BakedHero.new(HERO_DIR, c), "town": BakedHero.new(HERO_DIR, c, "town")}
	# (THE WARLOCK: his arm blazing while his pact is full, the bake's `blaze` key; and the demon, a group of its own since 25.3.22)
	if c == "warlock":
		hero.arts["blaze"] = BakedHero.new(HERO_DIR, c, "blaze")
		hero.arts["demon"] = BakedHero.new(HERO_DIR, "warlock-demon", "demon")
	# (his own pictures: a unique weapon he holds is looked at again next frame, hero.gd dress)
	hero.skin = ""
	hero.art = hero.arts["town" if is_home(place) else "dungeon"]
	hero.loadout.cls = c
	hero.loadout.refresh()
	hero.kit = null
	hero.loadout.form_moves = []
	hero.weapon = "greatsword"
	if c != "warrior" and ResourceLoader.exists("res://scripts/heroes/%s.gd" % c):
		hero.kit = load("res://scripts/heroes/%s.gd" % c).new(hero)
	# (THE WARRIOR'S WEAPON: the battle axe's or the warhammer's moves and pictures, where his tree has picked one: hero.gd arm)
	hero.on_armed = _armed
	hero.arm()
	loot.set_class(c, fresh)


## (the place's perils, after which his kit's look is laid: _kit_look)
var _perils: Node = null
var _kit_lookn: Node = null


## His kit's own look of what he sends and lays (heroes/<class>_look.gd; the Warrior's axe and hammer, the kit's look_path), laid in
## the place under everyone, just after its perils; laid afresh when his kit changes in the place (hero.gd arm).
func _kit_look() -> void:
	if _kit_lookn != null and is_instance_valid(_kit_lookn):
		_kit_lookn.queue_free()
	_kit_lookn = null
	if hero.kit == null or _place == null or _perils == null or not is_instance_valid(_perils):
		return
	var look_path: String = hero.kit.look_path() if hero.kit.has_method("look_path") else "res://scripts/heroes/%s_look.gd" % hero.cls
	if not ResourceLoader.exists(look_path):
		return
	var kl = load(look_path).new()
	kl.kit = hero.kit
	kl.loot = loot
	_place.add_child(kl)
	_place.move_child(kl, _perils.get_index() + 1)
	hero.kit.look = kl
	_kit_lookn = kl


## (THE WARRIOR'S WEAPON picked or changed: hero.gd arm) His kit's look laid afresh; every greatsword, axe or hammer he has made it.
func _armed() -> void:
	_kit_look()
	if loot != null:
		loot.all_for_him()


## Lay a place out, and set him down in it: `arrive` says where (the town's start, the foot of floor 1's gate, the top of
## the town's stairs).
func _build(where: String, arrive: String) -> void:
	# (words laid on a stronghold's altar and not burned go back to him as he leaves the floor: act1/holds.gd)
	if holds != null and is_instance_valid(holds):
		holds.give_back()
	# (and the altar rooms Siege laid beside a floor's own strongholds: door_words.gd)
	if quest610 != null and quest610.rooms != null and is_instance_valid(quest610.rooms):
		quest610.rooms.give_back()
	if hero.get_parent() != null:
		hero.get_parent().remove_child(hero)
	if _place != null:
		_place.free()
	# (THE SKILL TREES: Unbreakable once in each dungeon: game.ts enterDungeon, from his town or the camp into a floor)
	if is_home(place) and not is_home(where):
		hero.unbroken = false
	place = where
	hero.in_town = is_home(where)
	# (ENDLESS MODE: in town he is on no endless level; the waypoint takes him back to the one he reached)
	if not where.begins_with("floor") and where != "final":
		in_endless = false
	# (THE BOTTOM OF THE SHAFT: an endless level to the rest of the game, its own place)
	in_final = where == "final"
	if not hero.arts.is_empty():
		hero.art = hero.arts["town" if is_home(where) else "dungeon"]
	_place = Node2D.new()
	add_child(_place)
	move_child(_place, 0)
	var dir := dir_of(where)
	# (the floor he is leaving: in town the game's depth is still that floor's, and the wordsmith's shelf is drawn from its words)
	if map != null and int(map.depth) >= 1:
		last_floor = int(map.depth)
	map = FloorMap.new(dir + "/layout.json")
	# (STRONGHOLDS ON ANY ENDLESS LEVEL, THE CULT'S GATES AT THE MAP'S EDGE: rows past its south edge for the halls beyond them,
	# before anything sizes itself by the floor: act1/altar_rooms.gd)
	var gates: int = AltarRooms.gates_for(self, where)
	if gates > 0:
		map.grow_south(AltarRooms.band_rows(gates, map.w))
	# (the camp has its look and no stone of its own: the town's stands in for the walls it never builds)
	var ground := GroundArt.new(dir if FileAccess.file_exists(dir + "/ground.json") else TOWN_DIR)
	# (THE WORDSMITH'S TRADE: coming into town, his shelf for this visit, and nothing of the hero's sold him yet: game.ts rollShop)
	if is_home(where):
		loot.roll_word_stock(last_floor)

	# THE PLACE'S LOOK as the game draws it (look.gd), where tools/godot_looks.ts has recorded one; else the plain ground
	var looked := Look.has_look(where)
	var back := Node2D.new()
	_place.add_child(back)
	var floor_layer: Node2D
	if looked:
		floor_layer = Node2D.new()
	else:
		var fl := FloorLayer.new()
		fl.map = map
		fl.art = ground
		floor_layer = fl
	_place.add_child(floor_layer)
	var look_flats := Node2D.new()
	_place.add_child(look_flats)
	# (what lies flat on the floor: a rug, the circle of runes, stairs; then the moves' marks; then everyone, in order)
	var flats := Node2D.new()
	_place.add_child(flats)
	var perils := Perils.new()
	perils.map = map
	_place.add_child(perils)
	# (a class's own look of what he sends and lays: heroes/<class>_look.gd)
	if hero.kit != null:
		hero.kit.clear()
	_perils = perils
	_kit_look()
	var stands := Stands.new()
	perils.stands = stands
	stands.map = map
	stands.art = ground
	stands.build_walls = not looked
	# (every wall stands and fades round him on floors 1 to 5; the town's hall leaves its near walls out)
	stands.fade = not is_home(where)
	_place.add_child(stands)
	if _hero_light != null:
		_hero_light.queue_free()
		_hero_light = null
	look = null
	if looked:
		look = Look.new()
		look.place = where
		look.back_layer = back
		look.floor_layer = floor_layer
		look.flat_layer = look_flats
		look.stands = stands
		_place.add_child(look)

	hero.map = map
	# (what of the look stands behind raised ground, cut off by it: look.gd clip_behind)
	if look != null:
		look.clip_behind(map)
	var at := map.start
	var face := Vector2(1, 0)
	match arrive:
		"start":
			if where == "town":
				face = Vector2(-0.7071, -0.7071)
			elif where == "rim":
				# (game/rim.ts RIM_ARRIVE: before the gate, the pit before him)
				face = Vector2(0.7071, 0.7071)
			elif where == "final":
				# (final_arena.ts FINAL_ARRIVE: in the portal's light, looking across at him)
				face = Vector2(-0.7071, -0.7071)
		"stairs":
			# (game.ts enterDungeon('gate'): 1.7 tiles inside floor 1's gate, facing into the room)
			at = Vector2(_gate["hero"]["x"], _gate["hero"]["y"])
			face = Vector2(_gate["hero"]["fx"], _gate["hero"]["fy"])
		"way":
			# (game.ts enterTown('way'), enterDungeon('way'): out of the waypoint's column of light)
			if is_home(where) and looked and look.data.has("waypoint"):
				at = Vector2(look.data["waypoint"]["wx"], look.data["waypoint"]["wy"])
				face = Vector2(0.7071, 0.7071)
			elif map.waypoint != null:
				at = Vector2(map.waypoint["x"], map.waypoint["y"])
		"gate":
			# (game.ts enterTown('stairs'): by the top step of the town's stairs, facing away from them)
			var st: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(TOWN_DIR + "/layout.json"))["stair"]
			at = Vector2(st["x"] - 1.1, st["y"] + 1.0)
			face = Vector2(-1, 0)
		"down":
			# (game.ts enterDungeon: where the floor's way in sets him down, facing as the game has him)
			if map.start_face != Vector2.ZERO:
				face = map.start_face
		"cage":
			# (game.ts enterTown('cage'): up the shaft from floor 5, in the cage in the hall's near corner, looking out of it;
			# ways.ts TOWN_SHAFT)
			at = Vector2(20.5, 18.5)
			face = Vector2(-0.7071, -0.7071)
		"in_gate" when where == "camp":
			# (game.ts enterTown('gate') into the camp, from floor 10: in through its city gate, at its mouth, looking in: CAMP.arrive)
			at = map.start
			if map.start_face != Vector2.ZERO:
				face = map.start_face
		"in_gate":
			# (game.ts enterTown('gate'), from floor 10: just inside the gate, which is up behind him as he comes through it and
			# falls once he has walked off (town.gd); ways.ts TOWN_GATE, its doorway's first tile and its line)
			var g = JSON.parse_string(FileAccess.get_file_as_string(TOWN_DIR + "/layout.json")).get("gate")
			if g != null:
				at = Vector2(float(g["a"]) + 1.5, float(g["face"]) - 1.0 + 2.2)
			face = Vector2(0.7071, 0.7071)
	came_in_gate = arrive == "in_gate"
	hero.world = at
	hero.home = at
	hero.face = face
	stands.add_child(hero)
	stands.hero = hero
	if look != null:
		_hero_light = look.lighting(_place, hero, 170.0 if where == "town" else 165.0)

	var monsters := Monsters.new()
	monsters.map = map
	monsters.sfx = sfx
	monsters.hero = hero
	monsters.stands = stands
	monsters.perils = perils
	monsters.loot = loot
	monsters.main = self
	perils.hero = hero
	perils.sfx = sfx
	perils.look = look if looked else null
	# (what the fight shows of a blow and of a word: the rules tell it, fx.gd draws it. Over the floor and its marks, under
	# what stands)
	fx = Fx.new()
	# (its lights are cut in the place's dark; the monsters' state is shown off them, and through them the hero and the floor)
	fx.look = look if looked else null
	fx.monsters = monsters
	_place.add_child(fx)
	_place.move_child(fx, perils.get_index() + 1)
	hero.fx = fx
	monsters.fx = fx
	# (the ground his moves leave, and what it does to the monsters on it: wakes.gd. On the floor, under the monsters' own
	# marks and under what stands)
	wakes = Wakes.new()
	wakes.map = map
	wakes.monsters = monsters
	wakes.sfx = sfx
	wakes.fx = fx
	wakes.foe = _foe
	fx.wakes = wakes
	_place.add_child(wakes)
	_place.move_child(wakes, perils.get_index())
	hero.wakes = wakes
	_place.add_child(monsters)
	# (the soft shadow under every figure, the hero's and each monster's: shadows.gd. Over the floor and its marks, under what
	# stands)
	var shadows := Shadows.new()
	shadows.hero = hero
	shadows.monsters = monsters
	_place.add_child(shadows)
	_place.move_child(shadows, fx.get_index() + 1)
	if not is_home(where):
		# (ENDLESS MODE: an endless level's monsters as strong as its level: endless_strength)
		# (the arena's boss was made for Endless 1, at its depth: monsters.json `power`)
		monsters.strength = endless_strength(endless_power_at(1) if where == "final" else map.depth) if in_endless else {}
		# (FOE_WORDS: the words burned in at the gate, every monster's, a melded word its two words and itself: foe_melds.ts)
		if not dungeon_words.is_empty():
			if monsters.strength.is_empty():
				monsters.strength = {"life": 1.0, "boss": 1.0, "dmg": 1.0, "xp": 1.0, "words": []}
			# (Plundering burned in is carried by none of them: its gold is the level's instead, loot.gd DOOR_GOLD_WORDS)
			monsters.strength["laid"] = FoeWords.foe_words_of(dungeon_words.filter(func(w): return not loot.DOOR_WORDS.has(str(w))))
		var mdata: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(dir + "/monsters.json"))
		if where != "final":
			grow_packs(mdata, endless_power() if in_endless else int(map.depth))
		# (ENDLESS ANY LEVEL: the royals' packs on an endless level of any floor, by the level's luck: royal_packs)
		if in_endless and where != "final":
			royal_packs(mdata)
		# (THE RIM'S DOOR: what each monster carries tilted toward the runes burned in, as every rune that drops there is: loot.gd
		# tilt_word)
		# (THE RARE RUNES: what may not drop here carried by none, another in its place: loot.gd drop_ok)
		if where != "final":
			for d in mdata.get("monsters", []):
				if d is Dictionary and not (d.get("carries", []) as Array).is_empty():
					d["carries"] = (d["carries"] as Array).map(func(w): return loot.drop_ok(loot.tilt_word(str(w))))
					# (on an endless level, now and then one carries Plundering or Greed, and fights with it: loot.gd RARE_CARRY)
					if in_endless and randf() < loot.RARE_CARRY:
						var prize: String = ["plundering", "greed"].pick_random()
						d["carries"] = [prize]
						var ws: Array = (d.get("words", []) as Array).duplicate()
						if not ws.has(prize):
							ws.append(prize)
						d["words"] = ws
		monsters.load_floor(dir + "/monsters.json", MONSTER_DIR, mdata)
		_chained_mdata = mdata
		floor_mdata = mdata
		# (THE PRIZE CARRIERS: one carrying Plundering or Greed stands out, its pillar of light, its finding told: prize_carry.gd)
		if monsters.stands != null and monsters.stands.get_node_or_null("PrizeCarry") == null:
			var pc = PrizeCarry.new()
			pc.name = "PrizeCarry"
			pc.mgr = monsters
			monsters.stands.add_child(pc)
		if PrizeCarry.ON:
			for m in monsters.list:
				var pz: String = PrizeCarry.prize_of(m)
				if pz != "":
					loot.say("Something on this level carries %s." % PrizeCarry.NAME[pz], PrizeCarry.COL[pz][2])
					break
		# (ENDLESS ANY LEVEL: the Bells on an endless level of a floor that has none of its own, by the level's luck: bells_any.gd)
		if in_endless and where != "final" and monsters.bells.is_empty() and BellsAny.ON:
			var br := RandomNumberGenerator.new()
			if bells_seed >= 0:
				br.seed = bells_seed
			else:
				br.randomize()
			# (THE DOOR WORDS: Toll burned in, the Bells for sure: door_words.gd)
			if bells_seed >= 0 or DoorWords.burned(self, "toll") > 0 or br.randi_range(1, BellsAny.LEVEL) == 1:
				monsters.bells = BellsAny.make(self, mdata, br, DoorWords.burned(self, "toll") > 0)
		# (THE BOTTOM OF THE SHAFT: its arena's rules, its round, its way back up: final_arena.gd)
		arena = null
		if where == "final":
			final_data = JSON.parse_string(FileAccess.get_file_as_string(dir + "/layout.json"))
			var R: Dictionary = final_data["round"]
			var c := Vector2(float(R["cx"]), float(R["cy"]))
			var reach := float(R["floor"])
			map.fence = func(x: float, y: float, r: float) -> bool: return Vector2(x, y).distance_to(c) <= reach - r
			arena = preload("res://scripts/final_arena.gd").new()
			arena.main = self
			arena.hero = hero
			arena.monsters = monsters
			arena.D = final_data
			_place.add_child(arena)
		# (ENDLESS MODE, NO STORY: floor 5's temple open, with no key-bearers)
		if in_endless:
			for m in monsters.list.filter(func(o): return is_instance_valid(o) and (o.kind == "keyblade" or o.kind == "keyflame")):
				monsters.list.erase(m)
				m.queue_free()
	# (THE PRACTICE ROOM: its packs coming on and on, up out of rifts: practice.gd)
	if where == "practice":
		var pr := preload("res://scripts/practice.gd").new()
		pr.main = self
		pr.hero = hero
		pr.monsters = monsters
		pr.map = map
		pr.stands = stands
		pr.flats = flats
		_place.add_child(pr)
	# (the films of what this floor's kinds mark and throw up: fetched now, behind the game; the other floors' let go)
	var kinds := {}
	for m in monsters.list:
		kinds[m.kind] = true
	perils.warm(kinds.keys())
	hero.monsters = monsters
	_monsters = monsters
	# (the floor's doors and the boss's gate: doors.gd)
	_doors = null
	hero.doors = null
	# (and on the descent's open ground, where the boss waits for the hero to come into his ground: doors.gd, meetOutdoorBoss)
	if not map.doors.is_empty() or map.land != null or (map.ways is Dictionary and map.ways.get("a1") != null):
		_doors = Doors.new()
		_doors.main = self
		_doors.map = map
		_doors.look = look if looked else null
		_doors.hero = hero
		_doors.monsters = monsters
		_doors.sfx = sfx
		_place.add_child(_doors)
		hero.doors = _doors
	# (floor 5: the temple's door, barred by two chains until both keys are brought: temple.gd)
	temple = null
	if map.temple != null:
		temple = Temple.new()
		temple.main = self
		temple.map = map
		temple.look = look if looked else null
		temple.hero = hero
		temple.monsters = monsters
		temple.sfx = sfx
		_place.add_child(temple)
		if not story_here():
			temple.open_now()
	# (floor 3 while its furnace burns: the fire in the Chained One's gateway, the forge crank: furnace.gd)
	furnace = null
	# (ENDLESS MODE, NO STORY: an endless level's floor 3 without its furnace burning: game.ts furnaceBurns, storyHere)
	if map.furnace != null and story_here():
		furnace = Furnace.new()
		furnace.main = self
		furnace.map = map
		furnace.look = look if looked else null
		furnace.hero = hero
		furnace.monsters = monsters
		furnace.sfx = sfx
		_place.add_child(furnace)
	# (the floor's chests, barrels and urns: props.gd)
	hero.props = null
	if not map.props.is_empty():
		var props := Props.new()
		props.map = map
		props.look = look if looked else null
		props.hero = hero
		props.loot = loot
		props.sfx = sfx
		_place.add_child(props)
		hero.props = props
	# (the stairwell down in the boss's hall, shut until he falls: stairs.gd)
	hero.surge_k = 1.0
	_stairs = null
	if not map.stairs.is_empty():
		var stairs := Stairs.new()
		_stairs = stairs
		stairs.main = self
		stairs.map = map
		stairs.look = look if looked else null
		stairs.hero = hero
		stairs.monsters = monsters
		stairs.loot = loot
		stairs.sfx = sfx
		_place.add_child(stairs)
	# (the floor's traps: traps.gd)
	if looked and not map.hazards.is_empty() and look.data.has("traps"):
		var traps := Traps.new()
		traps.map = map
		traps.look = look
		traps.hero = hero
		traps.monsters = monsters
		traps.sfx = sfx
		_place.add_child(traps)
	# (THE WAYS: the waypoint, at the start of every floor but the first and in town: waypoint.gd)
	_way = null
	if looked and look.data.has("waypoint"):
		_way = Waypoint.new()
		_way.main = self
		_way.look = look
		_way.hero = hero
		_way.sfx = sfx
		_way.in_town = is_home(where)
		_place.add_child(_way)
		if not is_home(where):
			way_depth = maxi(way_depth, map.depth)
		if arrive == "way":
			_way.awake = true
			look.wake_waypoint()
			look.play_warp(0.25)
	elif not is_home(where) and map.waypoint != null:
		# (game.ts enterDungeon: a floor with a waypoint is reached as he comes into it, its look or none)
		way_depth = maxi(way_depth, map.depth)
	# (FLOOR_NAMES: the floor's own name across the screen as he comes into it, its level under it: ui/cards.ts drawFloorCard;
	# gone with the floor if he leaves it while it is still up)
	# (none in the practice room: game.ts, FLOOR_NAMES `!this.practice`)
	if not is_home(where) and _hud != null and not practice:
		_hud.floor_card_for(where)
		# (ENDLESS MODE: the floor's own name, the level under it, and the warning: his pick, a death here is the hero's end)
		if in_endless and not _hud.floor_card.is_empty():
			if where == "final":
				_hud.floor_card["name"] = str(map.title.get("name", "The Bottom of the Shaft"))
			_hud.floor_card["level"] = endless_name(endless)
			_hud.floor_card["warn"] = ENDLESS_WARN
			_hud.floor_card["secs"] = float(_hud.floor_card["secs"]) + ENDLESS_CARD_MORE
	elif _hud != null:
		_hud.floor_card = {}
	loot.enter_place(map, stands, monsters, where == "floor1")
	# (THE CHAINED RARE: floors 2 to 5 once words fall, and an endless level that is one of floors 1 to 5: chained_rare.gd)
	chained_rare = null
	chained_rares = []
	if not is_home(where) and ChainedRare.wanted(self, where):
		var nr := RandomNumberGenerator.new()
		if chained_seed >= 0:
			nr.seed = chained_seed + 7
		else:
			nr.randomize()
		var count: int = ChainedRare.endless_n(nr) if in_endless else 1
		# (THE DOOR WORDS: Chains burned in, twice as many: door_words.gd)
		if DoorWords.burned(self, "chains") > 0:
			count *= DoorWords.MORE
		for i in count:
			var cr := ChainedRare.new()
			cr.main = self
			cr.monsters = monsters
			cr.map = map
			cr.hero = hero
			cr.loot = loot
			cr.sfx = sfx
			# (Chains burned in: twice as many, standing nearer each other on a floor no bigger: chained_rare.gd APART_CHAINS)
			if DoorWords.burned(self, "chains") > 0:
				cr.apart = ChainedRare.APART_CHAINS
			_place.add_child(cr)
			if cr.lay(_chained_mdata, chained_seed + i if chained_seed >= 0 else -1):
				chained_rares.append(cr)
			else:
				cr.queue_free()
		chained_rare = chained_rares[0] if not chained_rares.is_empty() else null
	_chained_mdata = {}
	# (the ways on from a floor that has no stairwell: floor 3's door, floor 4's cave, floor 5's cage: ways.gd)
	ways = null
	if not is_home(where) and map.stairs.is_empty():
		ways = Ways.new()
		ways.main = self
		ways.map = map
		ways.hero = hero
		ways.monsters = monsters
		ways.look = look if looked else null
		ways.sfx = sfx
		_place.add_child(ways)
	# (THE EXITS' NAMES over the way out once it opens: exit_names.gd)
	if not is_home(where):
		var names := preload("res://scripts/exit_names.gd").new()
		names.main = self
		names.z_index = 46
		_place.add_child(names)
	# (floor 10: THE SWAMP COLOSSUS'S STONE, the landing that carries him across to it, the picture drawn back on it: act1/stone.gd)
	stone = null
	if not is_home(where) and map.stone != null:
		stone = Stone.new()
		stone.main = self
		stone.map = map
		stone.hero = hero
		stone.monsters = monsters
		_place.add_child(stone)
	# (what he has seen: sight.gd; the town is seen whole; --seeall, a floor too)
	sight = null
	if not is_home(where):
		sight = Sight.new()
		sight.map = map
		sight.hero = hero
		sight.look = look if looked else null
		sight.monsters = monsters
		# (who may be behind a tall thing of the look, and seen through it: look.gd _see_through2)
		if looked:
			look.foes = monsters
		# (and who may be behind a wall, and see it through: stands.gd)
		stands.foes = monsters
		sight.all = _arg("seeall") != "" or not (looked and look._fogged)
		_place.add_child(sight)
		if looked:
			look.sight = sight

	town = null
	if is_home(where):
		# (game.ts enterTown: life and flasks filled)
		hero.life = hero.max_life
		loot.potions = loot.POTIONS
		if loot.quest != "":
			loot.prompt_t = 6.0
		town = Town.new()
		town.main = self
		town.hero = hero
		town.loot = loot
		town.sfx = sfx
		town.stands = stands
		town.flats = flats
		town.looked = looked
		town.camp = where == "camp"
		town.rim = where == "rim"
		# (game.ts enterTown: the words burned into a dungeon are gone with it)
		dungeon_words = []
		_place.add_child(town)
		# (NO CONSTANT SOUND BUT THE MUSIC, game/world_sounds.ts WORLD_LOOPS off: no loop under either; the camp's breeze now and
		# then, and in both a brazier's pop heard right beside it: ambientWants; the castle hall's breeze not, CASTLE_HALL off)
		# (the Shaft's Rim: its loops off too, the rumble, the draught, the torches: a brazier's pop beside one)
		sfx.ambient([sfx.AMBIENT["camp"], sfx.AMBIENT["fire"]] if where == "camp" else [sfx.AMBIENT["fire"]])
		# (the camp at dusk: its vignette game/camp.ts CAMP_DUSK's, its dark and tint in its look)
		_veil.material.set_shader_parameter("deep", Look._num(look.data.get("vignette"), 0.32 if where == "camp" else 0.26) if looked else 0.45)
	else:
		if not looked and where == "floor1":
			_floor_gate(flats)
		var n := depth_of(where)
		# (no loop under it, WORLD_LOOPS off: its own sounds now and then, world_sounds.ts AMBIENT_FLOORS)
		sfx.ambient(sfx.AMBIENT_FLOORS.get(n, []))
		_veil.material.set_shader_parameter("deep", Look._num(look.data.get("vignette"), 0.62) if looked else 0.82)
		# (THE DESCENT, its look not yet in: the day's veil and vignette, game/act1.ts)
		var day: Dictionary = DESCENT_LIGHT.get(n, {}) if not looked else {}
		if not day.is_empty():
			_veil.material.set_shader_parameter("deep", day["vignette"])
			_veil.material.set_shader_parameter("veil_rgb", Color8(day["tint"][0], day["tint"][1], day["tint"][2]))
		_veil.material.set_shader_parameter("veil_a", float(day.get("dark", 0.0)))
	if is_home(where):
		_veil.material.set_shader_parameter("veil_a", 0.0)
	# (FLOORS 6 TO 10 BESIDES THEIR FIGHTS: the floor's strongholds, its part of the quest line, the quest marks: act1/quest610.gd)
	if quest610 != null:
		quest610.enter(where)
	floor_mdata = {}
	# (ENDLESS MODE, NO STORY: the city's and the High City's quest pieces and people not on an endless level: story_here)
	if quest1115 != null:
		quest1115.enter(where if story_here() else "town")
	# (after the city's: floor 12's second jar is these quests')
	if quest1620 != null:
		quest1620.enter(where if story_here() else "town")
	if shards != null:
		shards.enter()
	if bells != null:
		bells.enter(where)
	if garden != null:
		garden.enter(where)
	if masque != null:
		masque.enter(where)
	if gallery != null:
		gallery.enter(where)
	if keep != null:
		keep.enter(where)
	if tower != null:
		tower.enter(where)
	# (NORMAL MODE: the hero as he came into this floor, for a fall here to go back to: game.ts enterLevel `entry`)
	entry = {} if is_home(where) else Save.run_of(self).duplicate(true)


## Floor 1's stairs up to the town, seen through its gate's arch (render.ts flatWays), drawn with the floor.
func _floor_gate(flats: Node2D) -> void:
	var data: Dictionary = {}
	for p in JSON.parse_string(FileAccess.get_file_as_string(TOWN_DIR + "/pics.json")):
		if p["name"] == _gate["pic"]:
			data = p
	if data.is_empty():
		return
	var n := Sprite2D.new()
	n.texture = load(TOWN_DIR + "/pics.png")
	n.region_enabled = true
	n.region_rect = Rect2(data["x"], data["y"], data["w"], data["h"])
	n.centered = false
	n.offset = -Vector2(data["ax"], data["ay"])
	n.position = Iso.to_screen(_gate["up"]["x"], _gate["up"]["y"])
	flats.add_child(n)


## THE SAVED GAME written: every 5 s while he is up and about and not between places (main.ts saveT), and whenever the app is
## put away or closed (visibilitychange, pagehide).
func save_now() -> bool:
	if not saving or hero == null or not hero.alive or _going or not is_home(place) and map == null:
		return false
	# (nothing while the start screen or the hero cards are up: with no hero saved, the one standing in for him there was written as a
	# run, a Warrior never picked offered to CONTINUE; the bug hunt's sixth round)
	if _title != null or _cards != null:
		return false
	return Save.write(self)


func _notification(what: int) -> void:
	if what in [NOTIFICATION_WM_CLOSE_REQUEST, NOTIFICATION_APPLICATION_PAUSED, NOTIFICATION_APPLICATION_FOCUS_OUT, NOTIFICATION_WM_GO_BACK_REQUEST]:
		save_now()
	# (A GAME IN AN APP, 22 Nov 2026: the phone put away in a dungeon, the game waits under the pause panel, so that he comes back to
	# it as he left it and not into a fight already going on; never in the checks, whose window may lose the focus by itself)
	if what in [NOTIFICATION_APPLICATION_PAUSED, NOTIFICATION_APPLICATION_FOCUS_OUT] and _arg("shots") == "" and _mini != null \
			and _mini.open == "" and hero != null and hero.alive and not is_home(place) and not get_tree().paused:
		_mini.show_panel("pause")


func _process(dt: float) -> void:
	if hero != null and not hero.alive and hero.stays_down:
		_fallen(dt)
	# (THE UNIQUE WEAPON IN HIS HAND drawn as itself: hero.gd dress)
	if hero != null and loot != null and not hero.arts.is_empty():
		hero.dress(loot.gear["mainhand"])
	if saving:
		_save_t += dt
		if _save_t > 5.0:
			_save_t = 0.0
			save_now()
	# FLOOR 1'S GATE: walking into its doorway takes him up to the town (game.ts leave('gateOut'), enterTown('stairs'))
	if place == "floor1" and hero.alive and not _going:
		var tx := floori(hero.world.x)
		var ty := floori(hero.world.y)
		for t in _gate["tiles"]:
			if tx == int(t[0]) and ty == int(t[1]):
				go_to("town", "gate")
				break
	if guide.use_t > 0.0:
		guide.use_t -= dt
	# (floor 2: the vignette goes by where he is, under the open sky or indoors: look.gd zones)
	if look != null and look.vignette_now >= 0.0:
		_veil.material.set_shader_parameter("deep", look.vignette_now)
	music.level_music(_music_place(), _in_fight(), dt)


## Which place's music (game/level_music.ts musicPlace): the town's, the camp's, or a floor's.
func _music_place() -> String:
	# (the camp inside Vellum's gate: his Vellum town song, 22 Nov 2026, music.json `vellum`; the bottom of the shaft, the final
	# boss's arena, the title theme: music.gd `final`)
	if place == "final":
		return "final"
	return "town" if place == "town" else "vellum" if place == "camp" else "f%d" % depth_of(place)


## Is there a fight on: something awake within reach of him (game.ts inFight; no doors here yet to shut one in)?
func _in_fight() -> bool:
	if _monsters == null:
		return false
	for m in _monsters.list:
		if is_instance_valid(m) and not m.dead and m.state != "sleep" and m.world.distance_to(hero.world) < Music.NEAR and not _monsters.shut_in(m):
			return true
	return false


## Go to another place: the curtain drawn (0.35 s), the place laid out, the curtain lifted.
func go_to(where: String, arrive: String) -> void:
	if _going:
		return
	_going = true
	var tw := create_tween()
	tw.tween_property(_curtain, "color:a", 1.0, CURTAIN)
	await tw.finished
	_build(where, arrive)
	_arrived()
	var back := create_tween()
	back.tween_property(_curtain, "color:a", 0.0, CURTAIN)
	await back.finished
	_going = false


## Down the stairwell (game.ts leave('down'), takeWay): the next floor, where he comes in at its start, looking down the
## screen and to the right (enterDungeon).
func go_down() -> void:
	if in_endless:
		next_endless()
		return
	var next := "floor%d" % (map.depth + 1)
	if not FileAccess.file_exists("res://assets/" + next + "/layout.json"):
		loot.say("The stairs go down into the dark. (Floor %d is not in the Godot version yet.)" % (map.depth + 1))
		return
	go_to(next, "down")


## By the waypoint (waypoint.gd): no curtain, its column of light hides him; the place laid out, he comes out of its light.
func go_warp(where: String) -> void:
	if _going:
		return
	_build(where, "way")
	# (as by any other way: by the waypoint the floor's burns, poisons, roots, the demon, the melds' bursts to come went home with him,
	# and a normal hero dying of them in town lost his run; the bug hunt's sixth round, 25 Nov 2026)
	_arrived()


## Come into a place by any way: what the last place left on him gone (hero.gd fresh_place); THE WARLOCK come into a town as the
## demon, the man again there, as he is drawn (warlock.gd turn_man).
func _arrived() -> void:
	hero.fresh_place()
	if is_home(place) and hero.kit != null and hero.kit.has_method("turn_man"):
		hero.kit.turn_man()


## What E would do where he stands: [what is shown, what it does] (town.gd; the waypoint, waypoint.gd).
func prompt() -> Array:
	if _way != null and _way.here():
		return _way.prompt()
	# (a stronghold's altar; an obelisk in the Fen: act1/quest610.gd)
	if quest610 != null and str(quest610.prompt()[0]) != "":
		return quest610.prompt()
	# (an unstruck page, in the Censor's fight: act2/quest1115.gd)
	if quest1115 != null and str(quest1115.prompt()[0]) != "":
		return quest1115.prompt()
	# (the knight-captain; the songbird in the Moth's fight: act3/quest1620.gd)
	if quest1620 != null and str(quest1620.prompt()[0]) != "":
		return quest1620.prompt()
	# (THE CHAINED RARE, by him while his chains hold: chained_rare.gd)
	for cr in chained_rares:
		if is_instance_valid(cr) and str(cr.prompt[0]) != "":
			return cr.prompt
	return town.prompt if town != null else ["", ""]


## What the game says of a floor's way on (game.ts `kill`, updateWays): as it opens, and once it is open.
func say_way(kind: String, open: bool) -> void:
	var gold := Color("#ffd27a")
	if not open:
		return
	match kind:
		"exit":
			loot.say("The door behind his hall stands open. The way down.", gold)
		"cave":
			loot.say("A cave behind the wall. The way down.", gold)
		"onward", "plain":
			# (game.ts wayOpenLine, MSG.good: from the Fen on, the way home; THE HIGH CITY: the way on, from its last floor the way home)
			if map.depth >= 16:
				loot.say("The way home is open." if not has_floor(map.depth + 1) else ways.ON_OPEN, Color("#8af078"))
			else:
				loot.say(ways.HOME_OPEN if map.depth >= 10 else ways.ON_OPEN, Color("#8af078"))


## A place's name as the game writes it top left (defs.ts floorTitle: "Prison Level 2").
func place_title() -> String:
	if map != null and map.title.has("level"):
		return str(map.title["level"])
	return ""


## The boss's name across the screen for so many seconds (doors.gd, as his gate falls).
func boss_card(name: String, secs: float) -> void:
	_hud.card = {"name": name, "t": 0.0, "secs": secs}


func show_words(text: String) -> void:
	_hud.words = text
	_hud.words_frame = Engine.get_process_frames()


func open_shop(id: String) -> void:
	_inv.open_shop(id)


## (game.ts giveRingWord: `offer`, the gear screen opened on the word) and the guide's next prompt.
func offer_word(_w: String) -> void:
	if not _inv.visible:
		_inv.toggle()


## The word has been put on Strike: the guide shows what it does for a while (guide.gd USE).
func word_placed() -> void:
	guide.use_t = 10.0


func sees(a: Vector2, b: Vector2) -> bool:
	return _monsters.sees(a, b)



## The controls, as main.ts has them: WASD or the arrows to walk; STRIKE the left button (or J; a controller's RT); WHIRL
## the right button, held to go again as soon as it is ready (or K; LT); the LUNGE Space, toward the pointer (A, along the
## stick).
func _inputs() -> void:
	var keys := {
		"move_up": [KEY_W, KEY_UP], "move_down": [KEY_S, KEY_DOWN],
		"move_left": [KEY_A, KEY_LEFT], "move_right": [KEY_D, KEY_RIGHT],
		"attack": [KEY_J], "whirl": [KEY_K], "lunge": [KEY_SPACE], "potion": [KEY_Q], "interact": [KEY_E, KEY_F],
		# (THE WARLOCK: his pact full, R changes him into the demon: main.ts, `input.pressed('KeyR')`)
		"change": [KEY_R],
	}
	# (A GAME CONTROLLER is read by pad.gd, as the game's main.ts padControls reads it: no button of it is bound here)
	for action in keys:
		if not InputMap.has_action(action):
			InputMap.add_action(action, 0.2)
		for k in keys[action]:
			var e := InputEventKey.new()
			e.physical_keycode = k
			InputMap.action_add_event(action, e)
	for pair in [["attack", MOUSE_BUTTON_LEFT], ["whirl", MOUSE_BUTTON_RIGHT]]:
		var m := InputEventMouseButton.new()
		m.button_index = pair[1]
		InputMap.action_add_event(pair[0], m)


func _arg(name: String) -> String:
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--%s=" % name):
			return a.split("=", true, 1)[1]
	return ""


## (the words' check: how many lines it has said, and which of them did not come out as the game has it)
var _wu_n := 0
var _wu_bad: Array = []


## One line of the words' check: what happened, and whether that is as the game has it.
func _wu(ok: bool, what: String) -> void:
	_wu_n += 1
	if not ok:
		_wu_bad.append(_wu_n)
	print("WORDS %02d %s: %s" % [_wu_n, "ok" if ok else "WRONG", what])


## (the words' check) The line among what has just been said that begins so, or "".
func _wu_said(begins: String) -> String:
	for m in loot.msgs:
		if str(m["text"]).begins_with(begins):
			return m["text"]
	return ""


## (the words' check) The words lying on the floor: [word, where].
func _wu_lying() -> Array:
	var out: Array = []
	for d in loot._drops:
		if d["kind"] == "word":
			out.append([d["word"], d["at"]])
	return out


## (the words' check) The mouse as the gear screen gets it: its left button pressed ("down") or let go ("up") at a place of
## the screen, moved there with the button held ("move"), or its right button pressed ("right").
func _wu_mouse(what: String, at: Vector2) -> void:
	# (`at` is where a thing is laid out on the gear screen; on the screen, the panel is on the right half: inventory.gd _to_screen)
	at = _inv._to_screen(at)
	if what == "move":
		var m := InputEventMouseMotion.new()
		m.position = at
		m.button_mask = MOUSE_BUTTON_MASK_LEFT
		_inv._gui_input(m)
		return
	var b := InputEventMouseButton.new()
	b.position = at
	b.button_index = MOUSE_BUTTON_RIGHT if what == "right" else MOUSE_BUTTON_LEFT
	b.pressed = what != "up"
	_inv._gui_input(b)


## (the words' check) An attack as the bottom of the screen writes it: its pieces' letters, an empty slot "[+]".
func _wu_reads(s: int) -> Array:
	var out: Array = []
	for p in _hud._phrase(s, 0):
		out.append(p["text"] if p.has("text") else "[+]")
	return out


## SHOT MODE, THE WORDS: HOW THEY ARE COME BY, CARRIED AND SET (--only=wordsui). A new Warrior's game, taken through all of
## it, each step pictured and a line printed that says what happened and whether it is as the game has it:
##   before the ring is lit, no slots; the fallen wordsmith on floor 1 searched for the stone; the stone given, the ring lit,
##   the wordsmith's word and the gear screen opened on it (a new player's first word: it goes on an attack and nowhere else);
##   POWER set on Strike, its new name across the screen, its card; levels gained (a slot behind opens at 4, the Whirlwind's at
##   2, the Lunge's at 5) and more words set in front and behind of all three moves; a set word read; with the mouse itself,
##   a word dragged onto a slot (the word there goes back), dragged out, taken out by a second press and by the right button;
##   a slot's refusal; the moves at the bottom of the screen, a move's card under the pointer, a press on a plate and on
##   INVENTORY; a word held over a piece, burned into it (asked first), a second and a third, and what the piece then
##   refuses; a piece of the bag that has one of the things a word gives; a unique piece; the line that sends him to the
##   armourer, the armourer's task; floor 1 again (the fallen wordsmith there, searched; no word falls there) and floor 3
##   (none); a carrier struck dead on floor 3, its word lying and taken up (WORD FOUND); the boss's word; the Stoker's gear,
##   the crank, the furnace out (the quest told, the line that sends him back); floor 3's sealed door, which wants FLAME; a
##   word from an ordinary monster and from a chest (their chances made certain); the armourer's word, HEAVY, and his
##   shelves again; HEAVY set where POWER was; at level 15, a second slot in front, "One damage word per side", and a word
##   set into the exact slot pressed, the first of the two empty; the fallen wordsmith's satchel for a hero whose ring was
##   lit before he searched one, his first word laid by him, announced large and offered its place at the next quiet
##   moment; and the fallen wordsmith on floor 3 for a hero with neither the lit ring nor the stone who has searched none.
## Its last line begins WORDSUI: and says how many lines were said and which, if any, were wrong.
func _wordsui_shots(h: Hero, dir: String) -> void:
	var L = h.loadout
	var names := func() -> Array: return [str(L.r(0)["name"]), str(L.r(1)["name"]), str(L.r(2)["name"])]
	var sizes := func(side: Array) -> Array: return [side[0].size(), side[1].size(), side[2].size()]
	var smith := Vector2(9.5, 14.5)
	var forge := Vector2(19.5, 7.5)
	await _wait(0.8)
	# (`--cases=610`: floors 6 to 10's nine words' lines alone: check_words610.gd)
	if _arg("cases").begins_with("610"):
		await CheckWords610.new(self, h).ui(dir)
		print("WORDSUI: %d lines, %d wrong%s" % [_wu_n, _wu_bad.size(), "" if _wu_bad.is_empty() else ": " + str(_wu_bad)])
		return

	# --- a new hero, the ring dark: no slots; floor 1's fallen wordsmith, and his stone
	_wu(not loot.ring_lit and sizes.call(L.front) == [0, 0, 0] and sizes.call(L.behind) == [0, 0, 0], "a new hero, the ring dark: his moves' slots in front %s, behind %s" % [sizes.call(L.front), sizes.call(L.behind)])
	_inv.toggle()
	_inv._press("tab", "attacks")
	await _wait(0.2)
	await _snap(dir + "/w01_before_the_ring_no_slots.png")
	_wu(_inv._page == "attacks" and _inv._slots.is_empty() and _inv._plates[0] != null and _inv._plates[1] == null and _inv._plates[2] == null and _inv._pouch.is_empty(), "the gear screen's ATTACKS before the ring: %d slots, %d words; Strike shown %s, the Whirlwind %s, the Lunge %s (level %d: they open at 2 and 5)" % [_inv._slots.size(), _inv._pouch.size(), _inv._plates[0] != null, _inv._plates[1] != null, _inv._plates[2] != null, loot.level])
	_inv.toggle()
	var b = loot._body
	_wu(b != null and not b["searched"], "floor 1, a new hero: the fallen wordsmith lies there %s, searched %s" % [b != null, b["searched"] if b != null else "-"])
	if b != null:
		h.world = b["at"] + Vector2(0.5, 0.5)
	await _wait(0.4)
	_wu(loot.quest == "heart" and loot.body_searched and loot.spare() == 0 and _wu_said("You take the MASTER RUNE-STONE.") != "", "searched before the ring is lit: he carries the stone (quest '%s'), no word (%d held); it says: %s" % [loot.quest, loot.spare(), _wu_said("You take")])

	# --- the stone to the wordsmith: the ring lit, his word given, the gear screen opened on it
	await go_to("town", "gate")
	await _wait(0.6)
	h.walked = 5.0
	h.world = _spot_near(smith, 1.4, h.world)
	await _wait(0.4)
	town._do("give")
	var t := 0.0
	while not _inv.visible and t < 8.0:
		await get_tree().process_frame
		t += get_process_delta_time()
	await _wait(0.3)
	await _snap(dir + "/w02_the_first_word_waits.png")
	_wu(loot.ring_lit and _inv.visible and _inv._page == "attacks" and int(loot.words.get("power", 0)) == 1 and loot.first_word_waits() and sizes.call(L.front) == [1, 0, 0] and sizes.call(L.behind) == [0, 0, 0], "the ring lit and the wordsmith's word given after %.1f s: POWER x%d; the gear screen open %s on %s; slots in front %s, behind %s; the coach's line: %s" % [t, int(loot.words.get("power", 0)), _inv.visible, _inv._page, sizes.call(L.front), sizes.call(L.behind), _inv._coach()])
	_inv._press("tab", "gear")
	var said_tab: String = _inv._note
	_inv._press("word", "power")
	_inv._press("worn", "mainhand")
	_wu(_inv._page == "attacks" and said_tab == "Your first word goes on an attack" and _inv._note == "Your first word goes on an attack" and _inv._pending.is_empty(), "his first word waiting: GEAR pressed, the page stays %s and it says: %s; the word pressed onto his weapon, it says: %s" % [_inv._page, said_tab, _inv._note])
	_inv._note_t = 0.0
	await _wait(0.2)
	await _snap(dir + "/w03_the_word_in_hand.png")
	_wu(_inv._word == "power" and _inv._reading() == "hand", "the word pressed: in hand '%s', read on its card (%s): POWER, %s" % [_inv._word, _inv._reading(), _inv._hud["words"]["power"]["grows"]])
	_inv._press("slot", [0, "front", 0])
	await _wait(0.3)
	await _snap(dir + "/w04_power_set_its_new_name.png")
	_wu(L.front[0] == ["power"] and int(loot.words["power"]) == 0 and loot.taught and names.call()[0] == "Power Strike" and not _inv._flash.is_empty() and guide.use_t > 0.0, "POWER set in front of STRIKE: it reads '%s'; his words left %d; the lesson over %s; its name shown large %s; its lines: %s" % [names.call()[0], loot.spare(), loot.taught, not _inv._flash.is_empty(), L.r(0)["lines"]])
	await _wait(1.2)
	await _snap(dir + "/w05_strikes_card.png")
	_wu(_inv._reading() == "" and _inv._coach() == "" and _inv.hit_range(0) == [16, 25], "under the three lines, Strike read out: a hit %s (his Strike half as hard again since 22 Nov, words.gd WARRIOR_MORE), %s; the coach's line in town, the word set: '%s'" % [_inv.hit_range(0), _inv._pace(0)[1], _inv._coach()])

	# --- levels gained: the Whirlwind's and the Lunge's slots, a slot behind; more words (handed him here), set in all three
	var xp := 1.0
	for l in range(1, 5):
		xp += loot.xp_to_next(l)
	loot.gain_xp(xp)
	_wu(loot.level == 5 and sizes.call(L.front) == [1, 1, 1] and sizes.call(L.behind) == [1, 1, 1] and _wu_said("A word slot has opened BEHIND your attacks.") != "", "level %d: slots in front %s, behind %s; it said: %s" % [loot.level, sizes.call(L.front), sizes.call(L.behind), _wu_said("A word slot")])
	for w in ["fire", "frost", "poison", "swift", "lightning"]:
		loot.words[w] = int(loot.words.get(w, 0)) + 1
	var refused: Array = []
	for q in [["fire", 1, "front"], ["poison", 0, "behind"], ["frost", 2, "front"], ["swift", 2, "behind"]]:
		_inv._press("word", q[0])
		_inv._press("slot", [q[1], q[2], 0])
		if L.slots(q[1], q[2])[0] != q[0]:
			refused.append(q)
	_inv._press("plate", 0)
	await _wait(1.4)
	await _snap(dir + "/w06_words_in_several_slots.png")
	_wu(refused.is_empty() and names.call() == ["Power Strike of Venom", "Flame Whirlwind", "Frost Lunge of Swiftness"] and loot.held() == ["lightning"], "FLAME before the Whirlwind, POISON behind Strike, FROST before the Lunge and SWIFT behind it: they read %s; refused %s; he still holds %s" % [names.call(), refused, loot.held()])
	_inv._press("plate", 1)
	await _wait(0.2)
	await _snap(dir + "/w07_the_whirlwinds_card.png")
	_wu(_inv._focus == 1 and L.r(1)["element"] == "fire", "the Whirlwind read out: %s, %s damage, a hit %s, %s; its lines: %s" % [names.call()[1], L.r(1)["element"], _inv.hit_range(1), _inv._pace(1)[1], L.r(1)["lines"]])
	_inv._press("slot", [1, "front", 0])
	await _wait(0.2)
	await _snap(dir + "/w08_a_set_word_read.png")
	_wu(_inv._look == [1, "front", 0] and _inv._reading() == "look", "FLAME pressed where it is set: it is read (%s), its own line: %s" % [_inv._reading(), L.r(1)["lines"].filter(func(l): return str(l).begins_with("Flame:"))])
	# (with the mouse itself: LIGHTNING dragged from his words onto the Whirlwind's slot, where FLAME is)
	var tile := Rect2()
	for c in _inv._pouch:
		if c["w"] == "lightning":
			tile = c["r"]
	var slot := Rect2()
	for c in _inv._slots:
		if c["i"] == 1 and c["side"] == "front":
			slot = c["r"]
	_wu_mouse("down", tile.get_center())
	_wu_mouse("move", tile.get_center() + Vector2(16, -16))
	_wu_mouse("move", slot.get_center())
	await _wait(0.2)
	await _snap(dir + "/w08b_a_word_dragged_onto_a_slot.png")
	var carried: bool = not _inv._drag.is_empty() and _inv._drag["moving"] and _inv._reading() == "over"
	_wu_mouse("up", slot.get_center())
	_wu(carried and L.front[1] == ["lightning"] and int(loot.words["fire"]) == 1 and int(loot.words["lightning"]) == 0, "LIGHTNING dragged from his words onto the Whirlwind's slot (carried %s) and let go: it reads '%s'; FLAME, which was there, back among his words %s" % [carried, names.call()[1], loot.held()])
	await _wait(1.3)
	# (dragged out again: it is one of his words, and in hand; let go over nothing, and a press on nothing puts it down)
	_wu_mouse("down", slot.get_center())
	_wu_mouse("move", slot.get_center() + Vector2(0, 150))
	_wu_mouse("up", slot.get_center() + Vector2(0, 150))
	var in_hand: String = _inv._word
	_wu_mouse("down", slot.get_center() + Vector2(0, 150))
	_wu_mouse("up", slot.get_center() + Vector2(0, 150))
	_wu(in_hand == "lightning" and _inv._word == "" and L.front[1] == [null] and loot.held() == ["fire", "lightning"], "dragged out of the slot: in hand '%s', the slot %s, his words %s; a press on nothing puts it down ('%s')" % [in_hand, L.front[1], loot.held(), _inv._word])
	# (FLAME set again; a second press on it where it is set takes it out; set again; the right button takes it out; set again)
	var ways: Array = []
	for how in ["twice", "right"]:
		_inv._press("word", "fire")
		_inv._press("slot", [1, "front", 0])
		if how == "twice":
			for n in 2:
				_wu_mouse("down", slot.get_center())
				_wu_mouse("up", slot.get_center())
		else:
			_wu_mouse("right", slot.get_center())
		ways.append(L.front[1] == [null] and int(loot.words["fire"]) == 1)
	_inv._press("word", "fire")
	_inv._press("slot", [1, "front", 0])
	_wu(ways == [true, true] and L.front[1] == ["fire"] and loot.held() == ["lightning"], "FLAME set again and taken out by a second press on it (%s), and by the right button (%s); set again: '%s'; he holds %s" % [ways[0], ways[1], names.call()[1], loot.held()])
	# (a slot's refusal: a second POWER onto the slot that holds POWER)
	await _wait(1.3)
	loot.words["power"] = int(loot.words["power"]) + 1
	_inv._press("word", "power")
	_inv._press("slot", [0, "front", 0])
	await _wait(0.2)
	await _snap(dir + "/w09_a_slots_refusal.png")
	_wu(_inv._note == "Already there" and L.front[0] == ["power"] and int(loot.words["power"]) == 1, "a second POWER pressed onto Strike's slot in front: it says '%s'; Strike still %s, POWER still held x%d" % [_inv._note, L.front[0], int(loot.words["power"])])
	_inv._note_t = 0.0
	for c in _inv._slots:
		if c["i"] == 0 and c["side"] == "front":
			_inv._mouse = c["r"].get_center()
	await _wait(0.2)
	await _snap(dir + "/w10_the_refusal_on_its_card.png")
	_wu(_inv._reading() == "over" and _inv.place_problem(0, "front", 0, "power") == "Already there" and _inv.place_problem(1, "front", 0, "power") == "" and _inv.place_problem(0, "behind", 0, "lightning") == "", "the word held over that slot: read (%s), refused '%s'; over the Whirlwind's (FLAME there) '%s', LIGHTNING over Strike's behind (VENOM there) '%s': each would take the place of the word there" % [_inv._reading(), _inv.place_problem(0, "front", 0, "power"), _inv.place_problem(1, "front", 0, "power"), _inv.place_problem(0, "behind", 0, "lightning")])
	_inv._mouse = Vector2(-1000, -1000)
	_inv.toggle()

	# --- the moves at the bottom of the screen, and a move's card under the pointer
	guide.use_t = 0.0
	await _wait(0.5)
	await _snap(dir + "/w11_the_moves_at_the_bottom.png")
	var lunge: Array = _hud._name_parts(2).map(func(p): return p[0])
	_wu(_wu_reads(0) == ["POWER", "STRIKE", "of", "VENOM"] and _wu_reads(1) == ["FLAME", "WHIRLWIND", "[+]"] and lunge == ["FROST", "LUNGE", "of", "SWIFTNESS"] and loot.spare() == 2 and loot.first_spare() == "power", "the bottom of the screen: Strike reads %s, the Whirlwind %s (its empty slot glows %s), the Lunge over its button %s; beside INVENTORY the rune of %s and %d" % [_wu_reads(0), _wu_reads(1), _hud._phrase(1, 0)[2].get("glow"), lunge, loot.first_spare().to_upper(), loot.spare()])
	_hud.pointer = _hud._plates[0].get_center()
	await _wait(0.2)
	await _snap(dir + "/w12_a_moves_card_under_the_pointer.png")
	_wu(_hud._plates.size() == 2 and str(L.r(0)["name"]) == "Power Strike of Venom", "the pointer on Strike's plate: its card, '%s': %s" % [L.r(0)["name"], L.r(0)["lines"]])
	_hud.pointer = null
	# (a press on a plate opens the gear screen at that move; a press on INVENTORY, on GEAR)
	var click := InputEventMouseButton.new()
	click.button_index = MOUSE_BUTTON_LEFT
	click.pressed = true
	click.position = _hud._plates[1].get_center() * 2.0
	_hud._input(click)
	var by_plate: Array = [_inv.visible, _inv._page, _inv._focus]
	_inv.toggle()
	click.position = _hud._inv_button.get_center() * 2.0
	_hud._input(click)
	var by_button: Array = [_inv.visible, _inv._page]
	_inv.toggle()
	_wu(by_plate == [true, "attacks", 1] and by_button == [true, "gear"], "a press on the Whirlwind's plate: the gear screen open, its page, the move read out %s; a press on INVENTORY: open, its page %s" % [by_plate, by_button])

	# --- a word burned into a piece: held over it, asked, burned; a second and a third; and what the piece then refuses
	_inv.toggle()
	await _wait(0.2)
	var sword: Dictionary = loot.gear["mainhand"]
	var could: Array = loot.burn_options("lightning", sword).map(func(o): return o["range"])
	_inv._press("word", "lightning")
	for c in _inv._cells:
		if c["worn"] and c["where"] == "mainhand":
			_inv._mouse = c["r"].get_center()
	await _wait(0.2)
	await _snap(dir + "/w13_a_word_held_over_a_piece.png")
	_wu(_inv._page == "gear" and _inv._reading() == "over" and could.size() == 2, "the gear screen opened on %s; LIGHTNING held over the %s: it could become %s" % [_inv._page, sword["name"], could])
	_inv._mouse = Vector2(-1000, -1000)
	_inv._press("worn", "mainhand")
	await _wait(0.2)
	await _snap(dir + "/w14_burn_it_asked.png")
	_wu(_inv._pending.get("word", "") == "lightning" and int(loot.words["lightning"]) == 1 and sword.get("imbues", []).is_empty(), "pressed onto it: it asks first (waiting %s), nothing burned yet, LIGHTNING still held x%d" % [_inv._pending, int(loot.words["lightning"])])
	# (its price as each word goes in: items.ts itemValue, a fifth more for each word and its new colour's own worth)
	var prices: Array = [int(sword["value"])]
	_inv._press("yes", null)
	await _wait(0.2)
	await _snap(dir + "/w15_what_it_became.png")
	var first_burn: String = _inv._result.get("text", "")
	prices.append(int(sword["value"]))
	_wu(int(loot.words["lightning"]) == 0 and sword.get("imbues", []).size() == 1 and first_burn != "" and int(sword["rarity"]) == 1 and loot.room(sword) == 3 and prices[1] == int(sword["worth"][0]) and prices[1] > 2.9 * prices[0] and prices[1] < 3.1 * prices[0], "BURN IT: LIGHTNING used up (x%d); the %s became: %s; its colour now %d (magic), room for %d more; its price %d, was %d (plain to magic 2.5 times, a word in it a fifth more); his lightning damage %+d%%, added to lightning hits %d-%d" % [int(loot.words["lightning"]), sword["name"], first_burn, int(sword["rarity"]), loot.room(sword), prices[1], prices[0], int(h.stats["light_pct"]), int(h.stats["light_min"]), int(h.stats["light_max"])])
	# (two more LIGHTNING handed him: the other thing it can become there, and then nothing left of it to give)
	loot.words["lightning"] = 2
	var second: String = loot.burn("lightning", "mainhand")
	var second_text: String = loot.burned.get("text", "")
	prices.append(int(sword["value"]))
	var third: String = loot.burn("lightning", "mainhand")
	_wu(second == "" and second_text != "" and second_text != first_burn and third == "It already has what this word gives" and int(loot.words["lightning"]) == 1 and sword["imbues"].size() == 2 and int(sword["value"]) == prices[2], "a second LIGHTNING into it: %s (the other of the two); a third: '%s' (still held x%d)" % [second_text, third, int(loot.words["lightning"])])
	# (POWER twice, handed him: the piece's four places full)
	loot.words["power"] = 3
	var p1: String = loot.burn("power", "mainhand")
	var p1_text: String = loot.burned.get("text", "")
	prices.append(int(sword["value"]))
	var p2: String = loot.burn("power", "mainhand")
	var p2_text: String = loot.burned.get("text", "")
	prices.append(int(sword["value"]))
	var p3: String = loot.burn("power", "mainhand")
	_wu(p1 == "" and p2 == "" and p3 == "That piece is full" and sword["imbues"].size() == 4 and int(sword["rarity"]) == 2 and loot.room(sword) == 0 and int(loot.words["power"]) == 1 and prices.slice(1) == sword["worth"].map(func(v): return int(v)) and int(sword["value"]) == prices[4], "POWER into it twice: %s; %s; a third: '%s'; it holds %d words, its colour %d (rare), room %d; its price with no word and with one, two, three and four: %s" % [p1_text, p2_text, p3, sword["imbues"].size(), int(sword["rarity"]), loot.room(sword), prices])
	loot.burned = {}
	_inv._word = ""
	_inv._result = {}
	_inv._hover = {"item": sword, "at": Vector2(140, 60)}
	await _wait(0.2)
	await _snap(dir + "/w16_the_pieces_card.png")
	_inv._hover = {}
	# (a piece that was found with one of the things a word gives is not given it again; a word goes into a piece of the bag
	# as into one he wears; and a unique piece takes no word. The pieces: the first such of the game's own, put in his bag)
	var found: Dictionary = {}
	var found_w := ""
	var unique: Dictionary = {}
	for q in loot._pools:
		for it in loot._pools[q]:
			if int(it["rarity"]) == 3:
				if unique.is_empty():
					unique = it.duplicate(true)
				continue
			for w in loot._words["order"]:
				var all: Array = loot.imbue_options(w, it)
				var free: Array = loot.burn_options(w, it)
				if found.is_empty() and not free.is_empty() and free.size() < all.size():
					found = it.duplicate(true)
					found_w = w
	if not found.is_empty():
		var all_stats: Array = loot.imbue_options(found_w, found).map(func(o): return o["stat"])
		var free_stats: Array = loot.burn_options(found_w, found).map(func(o): return o["stat"])
		loot.bag.append(found)
		loot.words[found_w] = int(loot.words.get(found_w, 0)) + 1
		_inv._press("word", found_w)
		_inv._press("bag", loot.bag.size() - 1)
		var asked: bool = _inv._pending.get("where") == loot.bag.size() - 1
		_inv._press("yes", null)
		var gave: Array = found["imbues"][0]["stats"] if found.has("imbues") else []
		_inv._result = {}
		_inv._hover = {"item": found, "at": Vector2(140, 300)}
		await _wait(0.2)
		await _snap(dir + "/w16b_a_piece_of_the_bag.png")
		_inv._hover = {}
		_wu(asked and not gave.is_empty() and free_stats.has(gave[0]) and found["imbues"].size() == 1, "%s (found with %s, in his bag): %s could become %s there, less what it has: %s; asked %s, burned, it became %s" % [found["name"], found["has"], found_w.to_upper(), all_stats, free_stats, asked, found["imbues"][0]["lines"] if found.has("imbues") else "-"])
	else:
		_wu(false, "no piece of the game's pools was found with something a word gives")
	if not unique.is_empty():
		loot.bag.append(unique)
		_wu(loot.burn_problem("power", loot.bag.size() - 1) == "A unique piece takes no word" and loot.room(unique) == 0, "%s, a unique piece, in his bag: POWER into it: '%s'" % [unique["name"], loot.burn_problem("power", loot.bag.size() - 1)])
	_inv.toggle()

	# --- the armourer's task
	await _wait(0.4)
	var line: Dictionary = guide.banner()
	await _snap(dir + "/w17_speak_to_the_armourer.png")
	_wu(line.get("text", "") == "Speak to the ARMOURER" and line.get("sub", "") == "He works at his forge." and loot.armourer_due() == "furnace", "the ring lit and his first word set: the line at the top says '%s' / '%s' (the armourer has: %s)" % [line.get("text", ""), line.get("sub", ""), loot.armourer_due()])
	h.world = _spot_near(forge, 1.5, h.world)
	await _wait(0.4)
	var ask_prompt: Array = town.prompt.duplicate()
	town._do(town.prompt[1])
	await _wait(0.3)
	await _snap(dir + "/w18_the_armourer_asks.png")
	_wu(ask_prompt == ["E: Armourer: a task", "task"] and loot.furnace == "asked" and _wu_said("The armourer:") == loot.quest_text["furnaceAsk"] and not _inv.visible, "by the armourer the prompt %s; used: the quest '%s', his shelves open %s; he says: %s" % [ask_prompt, loot.furnace, _inv.visible, _wu_said("The armourer:")])
	_wu(town.prompt == ["E: Armourer", "armourer"] and guide.banner().is_empty(), "asked, his prompt is %s (his shelves), and the line at the top is gone %s" % [town.prompt, guide.banner().is_empty()])

	# --- floor 1 again, and floor 3: where the fallen wordsmith lies for a hero whose ring is lit
	await go_to("floor1", "stairs")
	await _wait(0.8)
	b = loot._body
	_wu(b != null and b["searched"] and not loot.words_fall(), "floor 1 again, the ring lit, its way down not yet taken: the fallen wordsmith lies there %s, searched %s; words fall here %s" % [b != null, b["searched"] if b != null else "-", loot.words_fall()])
	if b != null:
		h.world = _spot_near(b["at"], 2.0, h.world)
	await _wait(0.5)
	await _snap(dir + "/w19_floor1_the_fallen_wordsmith_searched.png")
	# (floor 1: nothing gives up a word, were its chance certain: an ordinary monster struck dead, a chest opened; and what
	# the rune over a monster's head means, said once: as the game stands nothing on floor 1 carries one, so one is made to)
	var tune: Dictionary = loot._tune
	var chances: Array = [tune["dropWord"], tune["chestWord"], tune["vaultWord"]]
	var far: Monster = null
	for m in _monsters.list:
		if is_instance_valid(m) and not m.dead and not m.boss and not m.elite and not m.champion and m.world.distance_to(h.world) > 12.0 and far == null:
			far = m
	tune["dropWord"] = 1.0
	tune["chestWord"] = 1.0
	if far != null:
		far.carries = ["power"]
		_monsters.wake(far)
		await _wait(0.3)
		var told: String = _wu_said(far.title + " carries a WORD.")
		far.hurt(1e9)
		loot.from_chest(far.world, false)
		_wu(_wu_lying().is_empty() and told == far.title + " carries a WORD. Kill it and the word is yours.", "floor 1, the chances of a word made certain: a monster that carries one struck dead and a chest opened: words lying %s (none falls on floor 1); as it woke it said: %s" % [_wu_lying(), told])
	tune["dropWord"] = chances[0]
	tune["chestWord"] = chances[1]
	await go_to("floor3", "down")
	await _wait(1.2)
	_wu(loot._body == null and map.body != null and loot.words_fall() and loot.cleared == 2, "floor 3, the ring lit: no fallen wordsmith (%s; the floor's place for one %s); words fall here %s" % [loot._body, map.body, loot.words_fall()])
	if map.body != null:
		h.world = _free_near(Vector2(map.body["x"], map.body["y"]) + Vector2(1.5, 0.0))
	await _wait(0.6)
	await _snap(dir + "/w20_floor3_where_he_would_lie.png")

	# --- a carrier struck dead: its word lying, and taken up
	var carrier: Monster = null
	for m in _monsters.list:
		if is_instance_valid(m) and not m.dead and not m.boss and not m.carries.is_empty() and carrier == null:
			carrier = m
	if carrier != null:
		var w: String = carrier.carries[0]
		var had := int(loot.words.get(w, 0))
		h.world = _spot_near(carrier.world, 2.5, h.world)
		await _wait(0.4)
		carrier.hurt(1e9)
		await _wait(0.5)
		var lying := _wu_lying()
		await _snap(dir + "/w21_a_carrier_struck_dead_its_word_lying.png")
		_wu(carrier.dead and lying.size() == 1 and lying[0][0] == w and int(loot.words.get(w, 0)) == had, "%s (it carries %s) struck dead at %s: lying %s; after 0.5 s not yet his (%s x%d: a word stands 1 s first)" % [carrier.title, carrier.carries, carrier.world, lying, w, int(loot.words.get(w, 0))])
		if not lying.is_empty():
			h.world = lying[0][1]
		await _wait(1.3)
		await _snap(dir + "/w22_word_found.png")
		_wu(_wu_lying().is_empty() and int(loot.words.get(w, 0)) == had + 1 and loot.toast.get("word", "") == w and not loot.toast.get("big", true) and not _inv.visible, "it comes to him and is taken: %s x%d; the top of the screen says WORD FOUND %s (large %s); the gear screen opened on it %s (his words are at work already)" % [w, int(loot.words.get(w, 0)), str(_hud._data["words"].get(loot.toast.get("word", ""), {}).get("name", "-")).to_upper(), loot.toast.get("big"), _inv.visible])
	else:
		_wu(false, "no monster of floor 3 carries a word")
	# (a boss's too)
	var boss: Monster = null
	for m in _monsters.list:
		if is_instance_valid(m) and m.boss:
			boss = m
	if boss != null:
		var bw: Array = boss.carries
		var had_b := int(loot.words.get(bw[0], 0)) if not bw.is_empty() else 0
		h.world = _spot_near(boss.world, 3.0, boss.world)
		await _wait(0.5)
		boss.waits = false
		boss.hurt(1e9)
		await _wait(0.6)
		var lying_b := _wu_lying()
		await _snap(dir + "/w23_the_boss_fallen_his_word.png")
		if not lying_b.is_empty():
			h.world = lying_b[0][1]
		await _wait(1.4)
		_wu(boss.dead and not bw.is_empty() and lying_b.size() == bw.size() and lying_b[0][0] == bw[0] and int(loot.words.get(bw[0], 0)) == had_b + 1, "%s (he carries %s) struck dead: lying %s; taken, %s x%d" % [boss.title, bw, lying_b, bw[0] if not bw.is_empty() else "-", int(loot.words.get(bw[0], 0)) if not bw.is_empty() else 0])

	# --- floor 3's furnace: the Stoker's gear, the crank, the furnace out; the quest told
	if furnace != null and not furnace._crank.is_empty():
		var c := Vector2(furnace._crank["x"], furnace._crank["y"])
		var keeper = null
		for m in _monsters.list:
			if is_instance_valid(m) and m.kind == "stoker" and not m.dead:
				keeper = m
		if keeper != null:
			h.world = _spot_near(keeper.world, 3.0, h.world)
			await _wait(0.2)
			keeper.hurt(1e9)
			await _wait(4.6)
			for g in _monsters.perils.get_children():
				if g.get("at") != null:
					h.world = g.at
			await _wait(0.4)
		else:
			_monsters.quest_item.emit("gear", h.world)
			await _wait(0.4)
		_wu(furnace.step == "gear" and loot.furnace == "gear", "the Stoker dead, his gear taken: the furnace's step '%s', the quest '%s'" % [furnace.step, loot.furnace])
		h.world = _free_near(c + Vector2(0.9, 0.4))
		await _wait(3.4)
		line = guide.banner()
		await _snap(dir + "/w24_the_furnace_out_return_to_the_armourer.png")
		_wu(furnace.step == "out" and loot.furnace == "out" and loot.armourer_due() == "reward" and line.get("text", "") == "Return to the ARMOURER" and line.get("sub", "") == "Take the waypoint back to town.", "the crank turned: the furnace's step '%s', the quest '%s' (the armourer has: %s); it said: %s; the line at the top: '%s' / '%s'" % [furnace.step, loot.furnace, loot.armourer_due(), _wu_said("The gear bites"), line.get("text", ""), line.get("sub", "")])
	else:
		_wu(false, "floor 3 has no furnace")

	# --- floor 3's sealed door: it wants FLAME, in whichever slot
	var wd: Dictionary = {}
	for d in map.doors:
		if d["kind"] == "worddoor":
			wd = d
	if not wd.is_empty():
		var mid := Vector2(wd["middle"]["x"], wd["middle"]["y"])
		var away := Vector2(0, float(wd["out"])) if wd["alongX"] else Vector2(float(wd["out"]), 0)
		for m in _monsters.list:
			if is_instance_valid(m) and not m.dead and m.world.distance_to(mid) < 10.0:
				m.hurt(1e9)
		h.world = _free_near(mid + away * 2.5)
		await _wait(0.7)
		await _snap(dir + "/w25_a_sealed_door_wants_flame.png")
		_wu(wd.get("word", "") == "fire" and wd.get("told", false) and _wu_said("A sealed door.") == "A sealed door. It wants FLAME.", "floor 3's sealed door (its word '%s'): %s" % [wd.get("word", ""), _wu_said("A sealed door.")])
		_doors.unseal({"front": ["power"], "behind": ["poison", null]}, mid, 0.9)
		var still := int(wd["want"])
		_doors.unseal({"front": ["lightning", null], "behind": ["fire"]}, mid, 0.9)
		await _wait(0.6)
		await _snap(dir + "/w26_the_flame_seal_breaks.png")
		_wu(still == 0 and int(wd["want"]) == 1 and map.walk[int(wd["way"][0])] == 1 and map.shut[int(wd["way"][0])] == 0 and _wu_said("The FLAME seal") == "The FLAME seal breaks.", "a hit carrying POWER and VENOM: sealed still (want %d); one carrying LIGHTNING in front and FLAME behind: want %d walk %d shut %d; %s" % [still, int(wd["want"]), map.walk[int(wd["way"][0])], map.shut[int(wd["way"][0])], _wu_said("The FLAME seal")])
	else:
		_wu(false, "floor 3 has no sealed door")

	# --- the words an ordinary monster and a chest leave now and then (the game's chances; made certain here, far from him)
	far = null
	for m in _monsters.list:
		if is_instance_valid(m) and not m.dead and not m.boss and not m.elite and not m.champion and not m.summoned and m.kind in ["skeleton", "bat", "archer", "cultist", "shade"] and m.carries.is_empty() and m.world.distance_to(h.world) > 12.0 and far == null:
			far = m
	if far != null:
		var at_m: Vector2 = far.world
		var before_n := _wu_lying().size()
		tune["dropWord"] = 1.0
		far.hurt(1e9)
		tune["dropWord"] = chances[0]
		var from_monster: Array = _wu_lying().slice(before_n)
		tune["chestWord"] = 1.0
		loot.from_chest(at_m, false)
		tune["chestWord"] = chances[1]
		var from_chest: Array = _wu_lying().slice(before_n + from_monster.size())
		# (the first chest opened in a treasure vault has the vault's chance, the next an ordinary chest's: the vault's made
		# certain and the ordinary none; a vault he has not been near, its two chests marked open as props.gd marks them)
		var boxes: Array = []
		for r in map.rooms:
			if r.get("kind", "") != "treasure" or not boxes.is_empty():
				continue
			for p in map.props:
				if p["kind"] == "chest" and int(p["state"]) == 0 and FloorMap.in_room(r, Vector2(p["tx"], p["ty"])) and Vector2(p["x"], p["y"]).distance_to(h.world) > 8.0:
					boxes.append(p)
			if boxes.size() < 2:
				boxes = []
		var from_vault: Array = []
		if boxes.size() >= 2:
			tune["vaultWord"] = 1.0
			tune["chestWord"] = 0.0
			for p in boxes.slice(0, 2):
				var n0 := _wu_lying().size()
				p["state"] = 1
				loot.from_chest(Vector2(p["x"], p["y"]), true)
				from_vault.append(_wu_lying().size() - n0)
			tune["vaultWord"] = chances[2]
			tune["chestWord"] = chances[1]
		var here: Array = loot._words["at"]["3"]
		_wu(from_monster.size() == 1 and from_chest.size() == 1 and from_vault == [1, 0] and here.has(from_monster[0][0]) and here.has(from_chest[0][0]) and not here.has("heavy"), "floor 3: an ordinary monster leaves a word %s times in 1000 and a chest %s in 100 (the first of a treasure vault %s), x%s here; made certain: the %s left %s, a chest %s; a vault's first chest and its second (the vault's chance certain, a chest's none): %s; the words found on this floor: %s" % [chances[0] * 1000.0, chances[1] * 100.0, chances[2] * 100.0, loot._growth(), far.title, from_monster.map(func(d): return d[0]), from_chest.map(func(d): return d[0]), from_vault, here])
	else:
		_wu(false, "floor 3 has no ordinary monster left far from him")

	# --- back in town: the armourer's word, HEAVY; then his shelves
	await go_to("town", "way")
	await _wait(0.8)
	line = guide.banner()
	h.world = _spot_near(forge, 1.5, h.world)
	await _wait(0.4)
	var give_prompt: Array = town.prompt.duplicate()
	var held_before: int = loot.spare()
	town._do(town.prompt[1])
	await _wait(0.4)
	await _snap(dir + "/w27_heavy_given.png")
	_wu(line.get("text", "") == "Return to the ARMOURER" and line.get("sub", "") == "He works at his forge." and give_prompt == ["E: Armourer: the furnace is out", "task"] and loot.furnace == "done" and int(loot.words.get("heavy", 0)) == 1 and loot.spare() == held_before + 1 and _wu_said("The armourer: \"The forge") == loot.quest_text["reward"] and loot.toast.get("word", "") == "heavy", "in town the line at the top '%s' / '%s'; his prompt %s; used: the quest '%s', HEAVY x%d, WORD FOUND %s; he says: %s" % [line.get("text", ""), line.get("sub", ""), give_prompt, loot.furnace, int(loot.words.get("heavy", 0)), str(_hud._data["words"].get(loot.toast.get("word", ""), {}).get("name", "-")).to_upper(), _wu_said("The armourer: \"The forge")])
	await _wait(0.2)
	var after_prompt: Array = town.prompt.duplicate()
	var again: bool = loot.armourer_hand_in()
	town._do(town.prompt[1])
	await _wait(0.3)
	await _snap(dir + "/w28_his_shelves_again.png")
	_wu(after_prompt == ["E: Armourer", "armourer"] and not again and _inv.visible and _inv.shop == "armourer" and int(loot.words.get("heavy", 0)) == 1, "rewarded, his prompt is %s; asked again he has nothing (%s); used, his shelves open (%s, '%s'); HEAVY x%d" % [after_prompt, again, _inv.visible, _inv.shop, int(loot.words.get("heavy", 0))])
	_inv.toggle()
	# (HEAVY set where POWER was: POWER goes back to his words)
	_inv.open_on(0)
	_inv._press("word", "heavy")
	_inv._press("slot", [0, "front", 0])
	await _wait(1.4)
	await _snap(dir + "/w29_heavy_strike.png")
	_wu(names.call()[0] == "Heavy Strike of Venom" and int(loot.words.get("heavy", 0)) == 0 and int(loot.words["power"]) == 2, "HEAVY set in front of Strike where POWER was: '%s'; POWER back among his words x%d; its lines: %s" % [names.call()[0], int(loot.words["power"]), L.r(0)["lines"]])

	# --- at level 15 (not come to on floors 1 to 5; set here to show the rule): a second slot in front, one damage word a side
	loot.level = 15
	loot.derive()
	loot.words["frost"] = int(loot.words.get("frost", 0)) + 1
	_inv._press("word", "power")
	_inv._press("slot", [0, "front", 1])
	await _wait(1.3)
	_inv._press("word", "frost")
	_inv._press("slot", [1, "front", 1])
	await _wait(0.2)
	await _snap(dir + "/w30_one_damage_word_per_side.png")
	_wu(sizes.call(L.front) == [2, 2, 2] and sizes.call(L.behind) == [1, 1, 1] and names.call()[0] == "Heavy Power Strike of Venom" and _inv._note == "One damage word per side" and L.front[1] == ["fire", null] and int(loot.words["frost"]) == 1, "level 15: slots in front %s, behind %s; POWER beside HEAVY: '%s'; FROST into the Whirlwind's second slot beside FLAME: it says '%s', the Whirlwind still %s, FROST still held x%d" % [sizes.call(L.front), sizes.call(L.behind), names.call()[0], _inv._note, L.front[1], int(loot.words["frost"])])
	_inv.toggle()
	await _wait(0.3)
	await _snap(dir + "/w31_two_slots_in_front_at_the_bottom.png")
	_wu(_wu_reads(0) == ["HEAVY", "POWER", "STRIKE", "of", "VENOM"] and _wu_reads(1) == ["FLAME", "[+]", "WHIRLWIND", "[+]"], "the bottom of the screen: Strike reads %s, the Whirlwind %s" % [_wu_reads(0), _wu_reads(1)])
	# (INTO THE EXACT SLOT PRESSED, game.ts placeWord: the Whirlwind's two slots in front both empty, a word pressed onto the
	# second is in the second; another pressed onto it takes its place there, the first still empty; a second damage word
	# pressed onto the empty first is refused; a word that is not one, taken from behind the Lunge, is in the first)
	_inv.open_on(1)
	_inv._unsocket(1, "front", 0)
	var fire_held: int = int(loot.words.get("fire", 0))
	_inv._press("word", "fire")
	_inv._press("slot", [1, "front", 1])
	var in_second: Array = L.front[1].duplicate()
	var in_second_reads: Array = _wu_reads(1)
	_inv._press("word", "lightning")
	_inv._press("slot", [1, "front", 1])
	var swapped: Array = L.front[1].duplicate()
	var fire_back: int = int(loot.words.get("fire", 0))
	_inv._note = ""
	_inv._press("word", "power")
	_inv._press("slot", [1, "front", 0])
	var beside: String = _inv._note
	var kept: Array = L.front[1].duplicate()
	var power_kept: int = int(loot.words.get("power", 0))
	_inv._unsocket(2, "behind", 0)
	_inv._press("word", "swift")
	_inv._press("slot", [1, "front", 0])
	await _wait(1.4)
	await _snap(dir + "/w31b_into_the_exact_slot.png")
	_wu(in_second == [null, "fire"] and in_second_reads == ["[+]", "FLAME", "WHIRLWIND", "[+]"] and swapped == [null, "lightning"] and fire_back == fire_held and beside == "One damage word per side" and kept == [null, "lightning"] and power_kept == 1 and L.front[1] == ["swift", "lightning"] and names.call()[1] == "Swift Lightning Whirlwind" and _wu_reads(1) == ["SWIFT", "LIGHTNING", "WHIRLWIND", "[+]"], "into the exact slot pressed: FLAME taken out of the Whirlwind, its two slots in front empty; FLAME pressed onto the second: %s, at the bottom of the screen %s; LIGHTNING pressed onto it: %s, FLAME back among his words (x%d of %d); POWER pressed onto the first: it says '%s', the Whirlwind still %s, POWER still held x%d; SWIFT, taken from behind the Lunge, pressed onto the first: %s, '%s', at the bottom of the screen %s" % [in_second, in_second_reads, swapped, fire_back, fire_held, beside, kept, power_kept, L.front[1], names.call()[1], _wu_reads(1)])
	_inv.toggle()

	# --- the fallen wordsmith's satchel for a hero whose ring was lit before he searched one, and who has no word yet (a hero
	# made here, by taking every word from this one: the game's is one of a player whose ring another hero of his has lit):
	# a word laid by him; taken, it is his first: announced large, and the gear screen opened on it at the next quiet moment
	for i in 3:
		for side in ["front", "behind"]:
			for k in L.slots(i, side).size():
				L.take(i, side, k)
	loot.words = {"power": 0}
	loot.taught = false
	loot.offer = ""
	loot.gear["mainhand"].erase("imbues")
	loot.bag.clear()
	loot.body_searched = false
	loot.cleared = 0
	await go_to("floor1", "stairs")
	await _wait(0.8)
	b = loot._body
	_wu(b != null and not b["searched"] and not loot.word_at_work() and loot.spare() == 0, "floor 1 for a hero whose ring is lit, who has searched none and has no word (%d held, at work %s): the fallen wordsmith lies there %s, searched %s" % [loot.spare(), loot.word_at_work(), b != null, b["searched"] if b != null else "-"])
	if b != null:
		# (nothing left awake about him, so that the moment is quiet)
		for m in _monsters.list:
			if is_instance_valid(m) and not m.dead and not m.boss and m.world.distance_to(b["at"]) < 16.0:
				m.hurt(1e9)
		h.world = b["at"] + Vector2(0.5, 0.5)
		await _wait(0.4)
		var by_him := _wu_lying()
		await _snap(dir + "/w32_the_satchels_word.png")
		_wu(by_him.size() == 1 and by_him[0][0] == "power" and by_him[0][1] == b["at"] and loot.quest == "" and _wu_said("A fallen wordsmith.") == "A fallen wordsmith. In the satchel: full flasks, and a WORD.", "searched: %s; laid by him %s; the stone not his (quest '%s')" % [_wu_said("A fallen wordsmith."), by_him, loot.quest])
		t = 0.0
		while loot.spare() == 0 and t < 4.0:
			await get_tree().process_frame
			t += get_process_delta_time()
		await _wait(0.3)
		await _snap(dir + "/w33_his_first_word_found.png")
		_wu(int(loot.words["power"]) == 1 and loot.toast.get("big", false) and loot.offer == "power" and not _inv.visible, "taken: POWER x%d; WORD FOUND, large %s (his first); to be offered a place: '%s'; the gear screen not yet open %s" % [int(loot.words["power"]), loot.toast.get("big"), loot.offer, not _inv.visible])
		t = 0.0
		while not _inv.visible and t < 6.0:
			await get_tree().process_frame
			t += get_process_delta_time()
		await _wait(0.3)
		await _snap(dir + "/w34_the_gear_screen_opens_on_it.png")
		_wu(_inv.visible and t > 1.5 and t < 3.0 and _inv._page == "attacks" and _inv._word == "" and _inv._coach() == "Drag POWER onto STRIKE, or click the word and then the slot.", "%.1f s on (2.4 s of quiet from when it was taken): the gear screen open %s on %s, the word left on its tile (in hand '%s'); the coach: %s" % [t + 0.3, _inv.visible, _inv._page, _inv._word, _inv._coach()])
		_inv._press("word", "power")
		_inv._press("slot", [0, "front", 0])
		await _wait(1.3)
		await _snap(dir + "/w35_set_on_a_floor_the_coach.png")
		_wu(loot.taught and _inv._coach() == "POWER STRIKE! Close this and try it.", "set on a floor: the coach says: %s" % _inv._coach())
		_inv.toggle()

	# --- and on a later floor for a hero with neither the lit ring nor the stone who has searched none (made here)
	loot.ring_lit = false
	loot.body_searched = false
	await go_to("floor3", "down")
	await _wait(1.2)
	b = loot._body
	_wu(b != null and not b["searched"] and map.body != null and b["at"] == Vector2(map.body["x"], map.body["y"]) and not loot.words_fall(), "floor 3 for a hero with neither the lit ring nor the stone who has searched none: the fallen wordsmith lies there %s at %s; words fall %s" % [b != null, b["at"] if b != null else "-", loot.words_fall()])
	if b != null:
		h.world = _spot_near(b["at"], 2.0, h.world)
		await _wait(0.5)
		await _snap(dir + "/w36_floor3_the_fallen_wordsmith.png")
		h.world = b["at"] + Vector2(0.5, 0.5)
		await _wait(0.4)
		_wu(loot.quest == "heart" and b["searched"] and _wu_lying().is_empty(), "searched there before the ring is lit: he carries the stone (quest '%s'), no word laid %s" % [loot.quest, _wu_lying()])
	# (FLOORS 6 TO 10'S NINE WORDS: found, on the gear screen, set and refused: check_words610.gd)
	await CheckWords610.new(self, h).ui(dir)
	print("WORDSUI: %d lines, %d wrong%s" % [_wu_n, _wu_bad.size(), "" if _wu_bad.is_empty() else ": " + str(_wu_bad)])


# --- SHOT MODE, THE MONSTERS' OWN WORDS ---

## (its cases, and those not as the game's formula gives them; the roll of every blow; his armour and what he withstands)
var _fw_n := 0
var _fw_bad: Array = []
const FW_ROLL := 40.0
const FW_GEAR := {"armor": 30.0, "res_fire": 20.0, "res_frost": 10.0, "res_light": 30.0, "res_poison": 25.0}


## SHOT MODE, THE MONSTERS' OWN WORDS (--only=foewords). On floor 2, in a hall clear of its traps (_w_find), the floor's other
## monsters sent away and those kept standing still: a monster with each of the six words there strikes him (its own blow,
## monster.gd _blow), its roll fixed at FW_ROLL, his armour and what he withstands set (FW_GEAR), his life too big to lose and
## none of it coming back; then a minion with its leader's word at half, and the Headsman with two. ONE LINE A CASE: the harm and
## its parts by element beside the game's formula (game.ts hurtHero), what it left on him, for how long and what it took over
## its time, the knock (Heavy, which no monster on floors 1 to 5 carries, tried with a blow handed the word); a shot and two
## marks carrying their monster's words; Swift's waits beside a plain one's (monsterAttack, landMove); the champion's cry heard
## and not (hearsCry, rally), and a minion's half word whole after it. Pictures: the runes and names over the carriers, the hero
## burning, chilled and poisoned. Then one line for all of it, beginning FOEWORDS:.
func _foewords_shots(h: Hero, dir: String) -> void:
	go_to("floor2", "down")
	await _wait(1.4)
	if sight != null:
		sight.see_all()
	h.walked = 5.0
	if not _w_find():
		print("FOEWORDS: no hall on floor 2 is clear for the check")
		return
	var power := _fw_one("skeleton", "blue", ["power"])
	var plain := _fw_one("skeleton", "", [])
	var bat := _fw_one("bat", "blue", ["poison"])
	var frost := _fw_one("champion", "leader", ["frost"])
	var shade := _fw_one("shade", "blue", ["fire"])
	var light := _fw_one("champion", "leader", ["lightning"])
	var swift := _fw_one("skeleton", "blue", ["swift"])
	var archer := _fw_one("archer", "", [])
	var sarcher := _fw_one("archer", "blue", ["swift"])
	var cultist := _fw_one("cultist", "", [])
	var carrier: Monster = null
	var boss: Monster = null
	for m in _monsters.list:
		if m.kind == "champion" and not m.carries.is_empty():
			carrier = m
		elif m.boss:
			boss = m
	var need := [power, plain, bat, frost, shade, light, swift, archer, sarcher, cultist, carrier, boss]
	if need.has(null):
		print("FOEWORDS: floor 2 lacks one of the monsters the check wants: %s" % [need.map(func(o): return o.title if o != null else "-")])
		return
	# (the frost champion's minions, the carrier's, and the swift skeleton's pack: kept, for the cry and the pictures)
	var minions: Array = []
	var keep: Array = need.duplicate()
	for m in _monsters.list:
		if m.pack_id >= 0 and m.pack_id in [frost.pack_id, carrier.pack_id, swift.pack_id]:
			keep.append(m)
			if m.pack_id == frost.pack_id and m.rarity == "minion":
				minions.append(m)
	if minions.is_empty():
		print("FOEWORDS: %s leads no minions" % frost.title)
		return
	var minion: Monster = minions[0]
	# (what Power and Swift give a monster is in its numbers already, as the game's spawn gave them: monsters.json)
	var dmg_k: float = power.dmg_min / plain.dmg_min
	var pace_k: float = swift.speed / plain.speed
	for m in _monsters.list:
		if not keep.has(m):
			m.queue_free()
	for m in keep:
		if m == boss:
			m.waits = true
			continue
		_fw_still(m)
	await _wait(0.3)
	var g: Dictionary = FW_GEAR
	print("FOEWORDS begin: floor 2 (armour against floor %d), he at %s; every blow's roll %d; his armour %d (%.1f%% of a plain blow), Flame %d%%, Frost %d%%, Lightning %d%%, Poison %d%% withstood" % [
		maxi(1, map.depth), _w_home, FW_ROLL, g["armor"], _fw_cut() * 100.0, g["res_fire"], g["res_frost"], g["res_light"], g["res_poison"]])

	# POWER: nothing more in the blow itself; harder blows and more life in its numbers
	var b := _fw_hit(h, power)
	_fw_case("power", b, [], "its damage %.2fx a plain Skeleton's (the game: 1.40x), its life %d to the plain one's %d" % [dmg_k, power.max_life, plain.max_life], absf(dmg_k - 1.4) < 0.01)
	# POISON: most of the blow again over 4 s
	b = _fw_hit(h, bat)
	var dps: float = b["dmg"] * 0.6 * (1.0 - g["res_poison"] / 100.0) / 4.0
	var took := await _fw_over(h, h.life, 4.6, maxf(1.0, roundf(dps * 0.5)), 8)
	_fw_case("poison", b, [["poisoned", b["poison_t"], 4.0, "%.3f a second" % b["poison_dps"], dps, b["poison_dps"]]], took[0], took[1])
	# FROST: chilled 2 s, slower on his feet and in his Strike
	_fw_clean(h)
	var pace0 := h.walk_pace()
	var rate0 := h.rate()
	b = _fw_hit(h, frost)
	await _wait(0.3)
	await _snap(dir + "/fw2_chilled.png")
	var pace1 := h.walk_pace() / pace0
	var rate1 := h.rate() / rate0
	await _wait(1.8)
	var back := h.chill_t <= 0.0 and absf(h.walk_pace() - pace0) < 1e-6
	_fw_case("frost", b, [["chilled", b["chill_t"], 2.0, "%.2f" % b["chill_k"], 0.3, b["chill_k"]]], "his pace x%.2f (the game: 0.70), Strike's blows a second x%.3f (0.850); after 2.1 s %s" % [pace1, rate1, "both whole again" if back else "STILL SLOWED"], absf(pace1 - 0.7) < 1e-4 and absf(rate1 - 0.85) < 1e-4 and back)
	# FLAME: he burns 3 s
	b = _fw_hit(h, shade)
	var after_blow := h.life
	await _wait(0.5)
	await _snap(dir + "/fw3_burning.png")
	dps = b["dmg"] * 0.3 / 3.0
	took = await _fw_over(h, after_blow, 3.1, maxf(1.0, roundf(dps * 0.5)), 6)
	_fw_case("fire", b, [["burning", b["burn_t"], 3.0, "%.3f a second" % b["burn_dps"], dps, b["burn_dps"]]], took[0], took[1])
	# LIGHTNING: shocked 3 s, and the next blow a fifth harder
	b = _fw_hit(h, light)
	var b2 := _fw_hit(h, light, false)
	var want2 := maxf(1.0, roundf(_fw_exact("lightning", [], "") * 1.2))
	_fw_case("lightning", b, [["shocked", b["shock_t"], 3.0, "", 0.0, 0.0]], "a second blow while shocked: %d (the game: %d, a fifth more)" % [b2["dmg"], want2], b2["dmg"] == want2 and b2["shocked"])
	# SWIFT: nothing more in the blow; its waits shorter, its pace in its numbers
	b = _fw_hit(h, swift)
	_fw_case("swift", b, [], "its pace %.2fx a plain Skeleton's (the game: 1.35x); its waits: below" % pace_k, absf(pace_k - 1.35) < 0.01)
	# A MINION, its leader's Frost at half: half the blow frost, half its own; half the chill
	b = _fw_hit(h, minion)
	_fw_case("half", b, [["chilled", b["chill_t"], 2.0, "%.2f" % b["chill_k"], 0.15, b["chill_k"]]], "%s, of %s's pack" % [minion.title, frost.title], true)
	# TWO WORDS: the Headsman's Power and Flame, his own blow by his own rules (headsman.gd _blow)
	boss.dmg_min = FW_ROLL
	boss.dmg_max = FW_ROLL
	_fw_clean(h)
	boss.h2._blow(boss, h, 1.0)
	b = h.last_blow.duplicate()
	_fw_case("two", b, [["burning", h.burn_t, 3.0, "%.3f a second" % h.burn_dps, b["dmg"] * 0.3 / 3.0, h.burn_dps]], "%s, words %s: his blow Flame, the first element among them" % [boss.title, boss.words], b["el"] == "fire")
	# HEAVY, on no monster of floors 1 to 5: a blow handed the word knocks him a step, a minion's half a step
	for hv in [{}, {"words": ["heavy"], "base": "phys"}]:
		_fw_clean(h)
		var at0 := h.world
		h.hurt_by(FW_ROLL, "phys", ["heavy"], hv, null, h.world - _w_face)
		await _wait(0.25)
		var went := h.world.distance_to(at0)
		var want := 0.6 * (0.5 if not hv.is_empty() else 1.0)
		_fw_line("heavy%s" % ("_half" if not hv.is_empty() else ""), "a blow handed Heavy%s knocks him %.3f tiles away from where it came from (the game: %.2f, knockHero)" % [" at half" if not hv.is_empty() else "", went, want], absf(went - want) < 0.02)

	# A SHOT: the swift archer's arrow carries its words to him (game.ts shootAt, updateProjectiles)
	_fw_clean(h)
	sarcher.world = _w_home + _w_face * 3.0
	sarcher.dmg_min = FW_ROLL
	sarcher.dmg_max = FW_ROLL
	h.last_blow = {}
	_monsters.shoot(sarcher, -_w_face, float(sarcher.def["projSpeed"]), 6.0, FW_ROLL)
	await _wait(1.0)
	_fw_line("shot", "%s's arrow lands: %s, words %s, %d harm (the game: phys, [\"swift\"], %d)" % [sarcher.title, h.last_blow.get("el", "-"), h.last_blow.get("words", []), h.last_blow.get("dmg", 0), _fw_exact("phys", [], "")], h.last_blow.get("el", "") == "phys" and h.last_blow.get("words", []) == ["swift"] and h.last_blow.get("dmg", 0) == _fw_exact("phys", [], ""))
	# A MARK: the cultist's sigil, its own element Flame, no words (game.ts cultistSigil, stepActionF2)
	_fw_clean(h)
	h.last_blow = {}
	_monsters.perils.sigil(h.world.x, h.world.y, FW_ROLL, 0.0, cultist)
	await _wait(0.2)
	_fw_line("sigil", "%s's sigil erupts under him: %s, words %s, %d harm, burning %.2f s (the game: fire, [], %d, 3 s)" % [cultist.title, h.last_blow.get("el", "-"), h.last_blow.get("words", []), h.last_blow.get("dmg", 0), h.burn_t, _fw_exact("fire", [], "")], h.last_blow.get("el", "") == "fire" and h.last_blow.get("dmg", 0) == _fw_exact("fire", [], "") and h.burn_t > 2.5)

	# SWIFT'S WAITS, the same roll of chance for both (monsterAttack: its wait after its one blow; landMove: after a move, and
	# the move's own cooldown)
	_monsters.perils.clear()
	var waits := []
	for m in [plain, swift]:
		seed(11)
		m.state = "windup"
		m._move = -1
		m._land(h, 20.0, m._reach())
		waits.append(m._cd)
		_fw_still(m)
	_fw_line("swift_wait", "a skeleton's wait after its blow: %.3f s plain, %.3f s Swift, x%.3f (the game: x0.700)" % [waits[0], waits[1], waits[1] / waits[0]], absf(waits[1] / waits[0] - 0.7) < 1e-4)
	var after: Array = []
	var cools: Array = []
	for m in [archer, sarcher]:
		m._pick(20.0, false)
		seed(12)
		m.state = "windup"
		m._move = 1
		m._land(h, 5.0, m._reach())
		after.append(m._cd)
		cools.append(m._move_cd[1])
		_fw_still(m)
		if m == archer:
			_monsters.perils.clear()
	_fw_line("swift_moves", "an archer's arrow rain: its wait after %.3f s plain, %.3f s Swift (x%.3f); its own cooldown %.2f s plain, %.2f s Swift (the game: x0.700, 7.00 and 4.90)" % [after[0], after[1], after[1] / after[0], cools[0], cools[1]], absf(after[1] / after[0] - 0.7) < 1e-4 and absf(cools[0] - 7.0) < 1e-4 and absf(cools[1] - 4.9) < 1e-4)
	_fw_clean(h)
	h.last_blow = {}
	await _wait(1.7)
	var rain := _fw_exact("phys", [], "", FW_ROLL * float(sarcher._moves[1]["dmg"]))
	_fw_line("rain", "the swift archer's rain comes down on him: %s, words %s, %d harm (the game: phys, [\"swift\"], %d)" % [h.last_blow.get("el", "-"), h.last_blow.get("words", []), h.last_blow.get("dmg", 0), rain], h.last_blow.get("words", []) == ["swift"] and h.last_blow.get("dmg", 0) == rain)

	# THE CHAMPION'S CRY: heard by his minions near him carrying his words; not, with them far off; then whole in them
	frost._pick(3.0, true)
	for i in frost._move_cd.size():
		frost._move_cd[i] = 0.0
	var heard: int = frost._pick(3.0, true)
	var was_at: Array = []
	for o in minions:
		was_at.append(o.world)
		o.world = frost.world + Vector2(20.0, 0.0)
	var far: int = frost._pick(3.0, true)
	for k in minions.size():
		minions[k].world = was_at[k]
	var blue_hears: bool = _monsters.hears_cry(swift)
	_fw_line("cry", "%s, %d minions carrying %s at half within 8 tiles: his cry %s; with them 20 tiles off: %s; a blue pack (no minions) %s" % [frost.title, minions.size(), minion.half, "made" if heard >= 0 and frost._moves[heard]["id"] == "rally" else "NOT made", "made" if far >= 0 and frost._moves[far]["id"] == "rally" else "not made", "would hear" if blue_hears else "hears none"], heard >= 0 and frost._moves[heard]["id"] == "rally" and far == -1 and not blue_hears)
	frost.state = "windup"
	frost._move = heard
	frost._land(h, 3.0, frost._reach())
	_fw_still(frost)
	b = _fw_hit(h, minion)
	_fw_case("rallied", b, [["chilled", b["chill_t"], 2.0, "%.2f" % b["chill_k"], 0.3, b["chill_k"]]], "the minion rallied %.2f s more: its leader's Frost whole in it; the line \"%s\"" % [minion.rally_t, loot.msgs[-1]["text"] if not loot.msgs.is_empty() else "-"], minion.rally_t > 4.5 and not loot.msgs.is_empty() and loot.msgs[-1]["text"] == "%s rallies his pack" % frost.title)

	# PICTURES: the runes and the names over the carriers, the hero poisoned
	_fw_clean(h)
	var side := Vector2(-_w_face.y, _w_face.x)
	carrier.world = _w_home + _w_face * 2.6 + side * 1.4
	var n := 0
	for m in keep:
		if m.pack_id == carrier.pack_id and m != carrier and n < 2:
			m.world = carrier.world + side * (0.8 + 0.8 * n) - _w_face * 0.4
			n += 1
	frost.world = _w_home + _w_face * 2.6 - side * 1.6
	n = 0
	for m in keep:
		if m.pack_id == swift.pack_id and n < 3:
			m.world = _w_home - _w_face * 1.8 + side * (n - 1) * 1.1
			n += 1
	power.world = _w_home + side * 2.6
	sight.see_all()
	await _wait(0.4)
	await _snap(dir + "/fw1_carriers.png")
	var shown := "%s carries %s (rune over his head, his name in a leader's yellow); %s's name in %s" % [carrier.title, carrier.carries, swift.title, "blue, once over the first of its pack in sight" if _monsters.speaks.get(swift.pack_id) != null else "NOTHING"]
	_fw_line("over", shown, carrier._shows_over() and _monsters.speaks.get(swift.pack_id) != null)
	_fw_hit(h, bat)
	await _wait(0.4)
	await _snap(dir + "/fw4_poisoned.png")
	# (FLOORS 6 TO 10'S NINE WORDS on a monster: check_words610.gd)
	await CheckWords610.new(self, h).foes()
	print("FOEWORDS: %d cases, %d as the game's formula gives, %d not%s" % [_fw_n, _fw_n - _fw_bad.size(), _fw_bad.size(), "" if _fw_bad.is_empty() else ": " + ", ".join(PackedStringArray(_fw_bad))])


## The first on the floor of `kind` and pack rarity `rar` ("" for none) whose words are `ws`.
func _fw_one(kind: String, rar: String, ws: Array) -> Monster:
	for m in _monsters.list:
		if is_instance_valid(m) and not m.dead and m.kind == kind and m.rarity == rar and m.words == ws and not m.boss:
			return m
	return null


## It stands, and does nothing of its own (held as one that has just struck is).
func _fw_still(m: Monster) -> void:
	m.state = "recover"
	m._t = 1e9
	m._cd = 1e9
	m._move = -1
	m._set_list("idle")


## A case begins afresh: nothing on him, his life whole and too big to lose, none of it coming back, his armour and what he
## withstands set; where the check has him, still; the monsters' clock of what burns and poisons a quarter second off a bite.
func _fw_clean(h: Hero) -> void:
	h.max_life = 1e6
	h.life = 1e6
	h.unhurt = false
	h.stats["life_regen"] = 0.0
	for k in FW_GEAR:
		h.stats[k] = FW_GEAR[k]
	h.burn_t = 0.0
	h.burn_dps = 0.0
	h.chill_t = 0.0
	h.chill_k = 0.0
	h.shock_t = 0.0
	h.poison_t = 0.0
	h.poison_dps = 0.0
	h._knock_t = 0.0
	h._invuln = 0.0
	h.world = _w_home
	h.auto_dir = Vector2.ZERO
	_monsters._dot_t = 0.25


## How much his armour takes of a plain blow (stats.ts armorReduction, the floor never less than the first).
func _fw_cut() -> float:
	var a: float = FW_GEAR["armor"]
	return minf(0.75, a / (a + 40.0 + 20.0 * maxf(1.0, map.depth)))


## THE GAME'S FORMULA, for the check to set beside what the rules did (game.ts hurtHero): a blow of FW_ROLL of `el`, a minion's
## with `half` of its leader's words at half and `base` its own element; its harm before it is made a whole number.
func _fw_exact(el: String, half: Array, base: String, raw := FW_ROLL) -> float:
	var res := {"fire": FW_GEAR["res_fire"], "frost": FW_GEAR["res_frost"], "lightning": FW_GEAR["res_light"]}
	var k := 0.5 if half.has(el) and el != base else 1.0
	var parts := [[el, k]] if k >= 1.0 else [[el, k], [base, 1.0 - k]]
	var d := 0.0
	for p in parts:
		d += raw * p[1] * (1.0 - (_fw_cut() if p[0] == "phys" else res[p[0]] / 100.0))
	return maxf(1.0, roundf(d))


## One blow of `m`'s own on him, its roll fixed (monster.gd _blow, as it lands within its reach): what the rules weighed, with
## what it left on him then. `fresh`: begun afresh (a second blow on what the first left: not).
func _fw_hit(h: Hero, m: Monster, fresh := true) -> Dictionary:
	if fresh:
		_fw_clean(h)
	m.dmg_min = FW_ROLL
	m.dmg_max = FW_ROLL
	var was := h.life
	m._blow(h, 0.5, m._reach(), 1.0)
	var b: Dictionary = h.last_blow.duplicate()
	b["took"] = was - h.life
	b["poison_t"] = h.poison_t
	b["poison_dps"] = h.poison_dps
	b["burn_t"] = h.burn_t
	b["burn_dps"] = h.burn_dps
	b["chill_t"] = h.chill_t
	b["chill_k"] = h.chill_k
	b["shock_t"] = h.shock_t
	h.last_blow = b
	return b


## What burns or poisons him took from the moment after the blow, when he had `was` life, to `secs` more from now: by the
## game's rule `n` bites of `bite` each, the monsters' clock a quarter second off a bite as the blow lands. [The line, whether
## it is so.]
func _fw_over(h: Hero, was: float, secs: float, bite: float, n: int) -> Array:
	await _wait(secs)
	var took := was - h.life
	return ["over its time it took %d, %d bites of %d (the game: %d bites of %d, twice a second)" % [took, roundi(took / bite), bite, n, bite], absf(took - n * bite) < 0.5]


## A case's line: the blow as the rules weighed it beside the game's formula, what it left (`left`: [what, seconds, the game's
## seconds, how hard, the game's, the rules']), the knock, and `more`; it is so if all of it is (`ok`).
func _fw_case(name: String, b: Dictionary, left: Array, more: String, ok: bool) -> void:
	var half: Array = b.get("half", [])
	var base: String = "phys"
	var want := _fw_exact(b["el"], half, base)
	var parts := PackedStringArray()
	for p in b["parts"]:
		parts.append("%s %.0f%% %.2f" % [p[0], float(p[1]) * 100.0, p[2]])
	var line := "%s %d of %s%s: %s -> %d (the game: %d)" % [b["el"], FW_ROLL, b["words"], (", half " + str(half)) if not half.is_empty() else "", " + ".join(parts), b["dmg"], want]
	var good: bool = ok and b["dmg"] == want and b["knock"] == 0.0
	var on := PackedStringArray()
	for l in left:
		on.append("%s %.2f s (the game: %.1f)%s" % [l[0], l[1], l[2], (", " + l[3] + (" (the game: %.3f)" % l[4] if l[4] is float and l[4] > 0.0 else "")) if l[3] != "" else ""])
		good = good and absf(float(l[1]) - float(l[2])) < 0.05 and (l[3] == "" or absf(float(l[4]) - float(l[5])) < 1e-4)
	line += "; leaves %s; no knock; %s" % [", ".join(on) if not on.is_empty() else "nothing", more]
	_fw_line(name, line, good)


func _fw_line(name: String, line: String, ok: bool) -> void:
	_fw_n += 1
	if not ok:
		_fw_bad.append(name)
	print("FOEWORDS %s: %s %s" % [name, line, "OK" if ok else "WRONG"])


## SHOT MODE: the monsters' moves, each pictured the moment it shows. The hero is set down in sight of each monster that has
## moves and stands there, unharmed (its blows flash him but take nothing, so that each move is seen to its end): the red
## troll (his charge's line, his run, his slam's circle), the archers (the rain's ring, the arrows come down), the
## marksman (his line of aim, his great arrow), the Warden (his bolts, the Lockdown's shadows and its bars, the dead he
## calls). Each picture at twice the size; then the game quits, saying which moves were made.
func _shoot(hero: Hero, dir: String) -> void:
	DirAccess.make_dir_recursive_absolute(dir)
	hero.unhurt = true
	if _arg("only") == "words":
		await _words_shots(hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "wordsui":
		await _wordsui_shots(hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "foewords":
		await _foewords_shots(hero, dir)
		get_tree().quit()
		return
	# (STRONGHOLDS ON ANY ENDLESS LEVEL, THE ALTAR ROOM: check_altar_rooms.gd)
	if _arg("only") == "altarrooms":
		await preload("res://scripts/check_altar_rooms.gd").new().run(self, hero, dir)
		get_tree().quit()
		return
	# (THE RUNE BAG AND THE MELDING STONE: check_rune_bag.gd)
	if _arg("only") == "runebag":
		await preload("res://scripts/check_rune_bag.gd").new().run(self, hero, dir)
		get_tree().quit()
		return
	# (WORDMELDING: the wordsmith's meld page: check_melds.gd)
	if _arg("only") == "meld":
		await CheckMelds.new(self, hero).page(dir)
		get_tree().quit()
		return
	# (THE WORDSMITH'S TRADE IN WORDS: his half's first page: check_trade.gd)
	if _arg("only") == "trade":
		await preload("res://scripts/check_trade.gd").new().run(self, hero, dir)
		get_tree().quit()
		return
	# (THE START SCREEN: check_title.gd; and the real way of it, a saved hero, CONTINUE, and a new hero over him: title_live)
	if _arg("only") == "title_live":
		await preload("res://scripts/check_title.gd").new().live(self, hero, dir)
		return
	if _arg("only") == "trial":
		await preload("res://scripts/check_title.gd").new().trial_run(self, hero, dir)
		return
	if _arg("only") == "openings":
		await preload("res://scripts/check_glows.gd").new().openings(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "townnames":
		await preload("res://scripts/check_glows.gd").new().town(self, hero, dir)
		get_tree().quit()
		return
	# (SET BESIDE THE GAME: his facing as he comes in, the glass globe and its rim, the quest marker over the dark: check_glows.gd compare)
	if _arg("only") == "compare":
		await preload("res://scripts/check_glows.gd").new().compare(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "menus":
		await preload("res://scripts/check_glows.gd").new().menus(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "fxleft":
		await preload("res://scripts/check_glows.gd").new().fxleft(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "speech":
		await preload("res://scripts/check_glows.gd").new().speech(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "uniques":
		await preload("res://scripts/check_glows.gd").new().uniques(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "uniquesdo":
		await preload("res://scripts/check_glows.gd").new().uniquesdo(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "uniqueslook":
		await preload("res://scripts/check_glows.gd").new().uniqueslook(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "uniqueswar":
		await preload("res://scripts/check_glows.gd").new().uniqueswar(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "foemelds":
		await preload("res://scripts/check_glows.gd").new().foewords(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "sounds14":
		await preload("res://scripts/check_glows.gd").new().sounds14(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "skins":
		await preload("res://scripts/check_glows.gd").new().skins(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "endless":
		await preload("res://scripts/check_glows.gd").new().endless(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "rim":
		await preload("res://scripts/check_glows.gd").new().rim(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "shards":
		await preload("res://scripts/check_glows.gd").new().shards(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "final":
		await preload("res://scripts/check_glows.gd").new().final(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "fanfare":
		await preload("res://scripts/check_glows.gd").new().fanfare(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "packs":
		await preload("res://scripts/check_glows.gd").new().packs(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "finalmusic":
		await preload("res://scripts/check_glows.gd").new().finalmusic(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "talpage":
		await preload("res://scripts/check_glows.gd").new().talpage(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "whirl1":
		await preload("res://scripts/check_glows.gd").new().whirl1(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "demonfilm":
		await preload("res://scripts/check_glows.gd").new().demonfilm(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "smooth":
		await preload("res://scripts/check_glows.gd").new().smooth(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "defence":
		await preload("res://scripts/check_defence.gd").new().run(self, hero, dir)
		get_tree().quit()
		return
	# (EVERY UNIQUE WEAPON ON ITS HERO, PICTURED: --only=skinsheet: check_skinsheet.gd)
	if _arg("only") == "skinsheet":
		await preload("res://scripts/check_skinsheet.gd").new().run(self, hero, dir)
		get_tree().quit()
		return
	# (THE UNIQUES' DEFENCES AND THE FIFTEEN OF THE THREE DEFENCES: --only=defuniques: check_defuniques.gd)
	if _arg("only") == "defuniques":
		await preload("res://scripts/check_defuniques.gd").new().run(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "crash":
		await preload("res://scripts/check_crash.gd").new().run(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "eclipse":
		await preload("res://scripts/check_eclipse.gd").new().run(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "charge":
		await preload("res://scripts/check_charge.gd").new().run(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "twin":
		await preload("res://scripts/check_twin.gd").new().run(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "safe":
		await preload("res://scripts/check_safe.gd").new().run(self, hero, dir)
		get_tree().quit()
	if _arg("only") == "doorrunes":
		await preload("res://scripts/check_door_runes.gd").new().run(self, hero, dir)
		get_tree().quit()
	if _arg("only") == "endlessany":
		await preload("res://scripts/check_endless_any.gd").new().run(self, hero, dir)
		get_tree().quit()
	if _arg("only") == "doorwords":
		await preload("res://scripts/check_door_words.gd").new().run(self, hero, dir)
		get_tree().quit()
	if _arg("only") == "bughunt":
		await preload("res://scripts/check_bughunt.gd").new().run(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "noupright":
		await preload("res://scripts/check_safe.gd").new().noupright(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "exits":
		await preload("res://scripts/check_exits.gd").new().run(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "chained":
		await preload("res://scripts/check_chained.gd").new().run(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "chained_film":
		await preload("res://scripts/check_chained.gd").new().film(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "split":
		await preload("res://scripts/check_split.gd").new().run(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "curse":
		await preload("res://scripts/check_curse.gd").new().run(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "dmg":
		await preload("res://scripts/check_dmg.gd").new().run(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "compound":
		await preload("res://scripts/check_glows.gd").new().compound(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "memfloors":
		await preload("res://scripts/check_glows.gd").new().memfloors(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "pad":
		await preload("res://scripts/check_glows.gd").new().pad(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "upright":
		await preload("res://scripts/check_glows.gd").new().upright(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "lesson":
		await preload("res://scripts/check_glows.gd").new().lesson(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "companions":
		await preload("res://scripts/check_glows.gd").new().companions(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "uniquescls":
		await preload("res://scripts/check_glows.gd").new().uniquescls(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "touch":
		await preload("res://scripts/check_glows.gd").new().touch(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "behind":
		await preload("res://scripts/check_glows.gd").new().behind(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "wallsee":
		await preload("res://scripts/check_glows.gd").new().wallsee(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "voices":
		await preload("res://scripts/check_glows.gd").new().voices(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "lairfetch":
		await preload("res://scripts/check_glows.gd").new().lairfetch(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "veil":
		await preload("res://scripts/check_glows.gd").new().veil(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "bossrage":
		await preload("res://scripts/check_glows.gd").new().bossrage(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "yardgate":
		await preload("res://scripts/check_glows.gd").new().yardgate(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "glows":
		await preload("res://scripts/check_glows.gd").new().run(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "mana":
		await preload("res://scripts/check_title.gd").new().mana_check(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "practice":
		await preload("res://scripts/check_title.gd").new().practice_check(self, hero, dir)
		return
	if _arg("only") == "title":
		await preload("res://scripts/check_title.gd").new().run(self, hero, dir)
		get_tree().quit()
		return
	# (A FALLEN HERO, Normal and Hardcore: check_fall.gd; and the real way of it, the game begun again from its save: fall_live)
	if _arg("only") == "fall_live":
		await preload("res://scripts/check_fall.gd").new().live(self, hero, dir)
		return
	if _arg("only") == "fall":
		await preload("res://scripts/check_fall.gd").new().run(self, hero, dir)
		get_tree().quit()
		return
	# (THE SAVED GAME, in two runs of the app: check_save.gd)
	if _arg("only") == "save_write":
		await preload("res://scripts/check_save.gd").new().write(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "save_read":
		await preload("res://scripts/check_save.gd").new().read(self, hero, dir)
		get_tree().quit()
		return
	# (THE TOWN'S OTHER SERVICES: the stranger's gamble, the stash, the Lexicon: check_services.gd)
	if _arg("only") == "services":
		await preload("res://scripts/check_services.gd").new().run(self, hero, dir)
		get_tree().quit()
		return
	# (THE CAMP INSIDE VELLUM'S GATE, his town from floor 10 on: check_camp.gd)
	if _arg("only") == "camp":
		await preload("res://scripts/check_camp.gd").new().run(self, hero, dir)
		get_tree().quit()
		return
	# (THE CITY'S FLOORS' MONSTERS, floors 11 to 15: check_city.gd)
	if _arg("only") == "city":
		await preload("res://scripts/check_city.gd").new().run(self, hero, dir)
		get_tree().quit()
		return
	# (SPLITTING AND BINDING at the wordsmith's bench: check_itemwords.gd)
	if _arg("only") == "itemwords":
		await preload("res://scripts/check_itemwords.gd").new().run(self, hero, dir)
		get_tree().quit()
		return
	# (THE BELLS, the city floors' event: check_bells.gd, `--floor=N`)
	if _arg("only") == "bells":
		await preload("res://scripts/check_bells.gd").new().run(self, hero, dir, int(_arg("floor")) if _arg("floor") != "" else 11)
		get_tree().quit()
		return
	# (THE QUEST LINE OF FLOORS 11 TO 15: check_quest1115.gd)
	if _arg("only") == "quests1115":
		await preload("res://scripts/check_quest1115.gd").new().run(self, hero, dir)
		get_tree().quit()
		return
	# (THE LEXICON IN THE STASH: check_lexicon_stash.gd)
	if _arg("only") == "lexstash":
		await preload("res://scripts/check_lexicon_stash.gd").new().run(self, hero, dir)
		get_tree().quit()
		return
	# (THE RARE RUNES: check_rare_runes.gd)
	if _arg("only") == "rarerunes":
		await preload("res://scripts/check_rare_runes.gd").new().run(self, hero, dir)
		get_tree().quit()
		return
	# (THE CITY'S FIVE WORDS: check_citywords.gd)
	if _arg("only") == "citywords":
		await preload("res://scripts/check_citywords.gd").new().run(self, hero, dir)
		get_tree().quit()
		return
	# (THE ROYAL CARDS AND THE QUEST LINE OF FLOORS 16 TO 20: check_quest1620.gd)
	if _arg("only") == "quests1620":
		await preload("res://scripts/check_quest1620.gd").new().run(self, hero, dir)
		get_tree().quit()
		return
	# (THE SKILL TREES: --only=talents: check_talents.gd)
	if _arg("only") == "talents":
		await preload("res://scripts/check_talents.gd").new().run(self, hero, dir)
		get_tree().quit()
		return
	# (THE CLASS CARDS: --only=cards: check_cards.gd)
	if _arg("only") == "cards":
		await preload("res://scripts/check_cards.gd").new().run(self, hero, dir)
		get_tree().quit()
		return
	# (THE OTHER HEROES: --only=heroes --cls=<class>: check_heroes.gd)
	if _arg("only") == "heroes":
		await preload("res://scripts/check_heroes.gd").new().run(self, hero, dir)
		get_tree().quit()
		return
	# (THE HIGH CITY'S SEVEN LAST WORDS: check_lastwords.gd)
	if _arg("only") == "lastwords":
		await preload("res://scripts/check_lastwords.gd").new().run(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "meldstone":
		await preload("res://scripts/check_trade.gd").new().meldstone(self, hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "rmb":
		await _rmb_test(hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "town":
		await _town_shots(hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "loot":
		await _loot_shots(hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "music":
		await _music_test(hero)
		get_tree().quit()
		return
	if _arg("only") == "doors":
		await _door_shots(hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "stairs":
		await _stair_shots(hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "floor2":
		await _floor2_shots(hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "f2moves":
		await _f2_move_shots(hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "f2ways":
		await _f2_way_shots(hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "props":
		await _prop_shots(hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "floors":
		await _floor_shots(hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "seethrough":
		await _seethrough_shots(hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "ways":
		await _way_shots(hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "boss":
		await _boss_shots(hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "waypoint":
		await _waypoint_shots(hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "heights":
		await _height_shots(hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "traps":
		await _trap_shots(hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "map":
		await _map_shots(hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "kind":
		await _kind_shots(hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "gates":
		await _gate_shots(hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "fx":
		await _fx_shots(hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "descent":
		await _descent_shots(hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "cityways":
		await _cityways_shots(hero, dir)
		get_tree().quit()
		return
	# (LASTING'S, FLEETING'S AND VAST'S LOOKS, each side at work at its beats: check_looks10.gd)
	if _arg("only") == "looks10":
		await preload("res://scripts/check_looks10.gd").new().run(self, hero, dir)
		get_tree().quit()
		return
	# (THE TEN MELDED WORDS' LOOKS, each at work in front and behind, pictured at its beats: check_looks_melds.gd)
	if _arg("only") == "looks_melds":
		await preload("res://scripts/check_looks_melds.gd").new().run(self, hero, dir)
		get_tree().quit()
		return
	# (VOLATILE'S FIVE MELDS AND THE EIGHT ACROSS THE GROUPS: their looks at work, pictured at their beats: check_looks_volatile.gd)
	if _arg("only") == "looks_volatile":
		await preload("res://scripts/check_looks_volatile.gd").new().run(self, hero, dir)
		get_tree().quit()
		return
	# (FLOORS 6 TO 10 BESIDES THEIR FIGHTS: the strongholds, the quest line, floor 9's side areas: act1/check610.gd)
	if _arg("only") == "quests610":
		await preload("res://scripts/act1/check610.gd").new().run(self, hero, dir)
		get_tree().quit()
		return
	await _wait(1.0)
	await _snap(dir + "/01_start.png")
	await _hero_moves(hero, dir)
	var P := _monsters.perils
	# (the troll whose lair leaves room for a charge)
	var troll: Monster = null
	var spot := Vector2.INF
	for m in _monsters.list:
		if m.kind == "brute" and not m.dead:
			var s := _charge_spot(m, 6.0, Vector2.INF)
			if s != Vector2.INF:
				troll = m
				spot = s
				break
	if troll == null:
		# (neither lair leaves room for a run: the troll is set down in the floor's biggest hall, the hero 6 tiles off)
		troll = _nearest_kind(hero.world, "brute", 0.0)
		var big: Dictionary = {}
		for r in _monsters.map.rooms:
			if big.is_empty() or r["w"] * r["h"] > big["w"] * big["h"]:
				big = r
		troll.world = Vector2(floorf(big["x"] + big["w"] / 2.0) + 0.5, floorf(big["y"] + big["h"] / 2.0) + 0.5)
		spot = _charge_spot(troll, 6.0, _spot_near(troll.world, 6.0, hero.world))
		print("TROLL MOVED to the biggest hall ", big["w"], "x", big["h"])
	if troll != null:
		hero.world = spot
		if _arg("debug") != "":
			for i in 6:
				await _wait(0.5)
				print("TROLL state=", troll.state, " dist=", snappedf(troll.world.distance_to(hero.world), 0.01), " sees=", _monsters.sees(troll.world, hero.world), " moves=", troll._moves.size(), " cd=", snappedf(troll._cd, 0.01), " movecd=", troll._move_cd, " lane=", troll._lane(troll.world.distance_to(hero.world)))
		await _snap_when(dir + "/02_troll_charge_line.png", func(): return _has(P, "lane"), 6.0)
		await _snap_when(dir + "/03_troll_charging.png", func(): return is_instance_valid(troll) and troll.state == "charge", 3.0)
		await _snap_when(dir + "/04_troll_slam.png", func(): return _has(P, "warn"), 8.0)
	var arch := _nearest_kind(hero.world, "archer", 0.0)
	if arch != null:
		hero.world = _spot_near(arch.world, 6.0, hero.world)
		await _snap_when(dir + "/05_archer_rain_ring.png", func(): return _has(P, "rain", 0.7), 10.0)
		await _snap_when(dir + "/06_archer_rain_falls.png", func(): return _has(P, "rain", 1.6), 3.0)
	var mark := _nearest_kind(hero.world, "marksman", 0.0)
	if mark != null:
		hero.world = _spot_near(mark.world, 7.0, hero.world)
		await _snap_when(dir + "/07_marksman_aims.png", func(): return _has(P, "aim", 1.0), 10.0)
		await _snap_when(dir + "/08_marksman_great_arrow.png", func(): return _flying("great"), 3.0)
	var boss := _nearest_kind(hero.world, "warden", 0.0)
	if boss != null:
		hero.world = _spot_near(boss.world, 6.0, hero.world)
		await _snap_when(dir + "/09_warden_bolts.png", func(): return _flying("bolt"), 6.0)
		await _snap_when(dir + "/10_warden_lockdown_shadows.png", func(): return _has_bars(P, -0.5, 0.0), 10.0)
		await _snap_when(dir + "/11_warden_lockdown_bars.png", func(): return _has_bars(P, 0.3, 1.2), 3.0)
		await _snap_when(dir + "/12_warden_calls_the_dead.png", func(): return _rising() >= 2, 16.0)
		await _wait(1.8)
		await _snap(dir + "/13_the_dead_risen.png")
	print("MOVES MADE: ", _monsters.used)
	print("SHOTS DONE ", dir)
	get_tree().quit()


## A spot about `away` tiles from the troll with a clear run for his charge through it and on (open floor behind the hero).
func _charge_spot(troll: Monster, away: float, otherwise: Vector2) -> Vector2:
	var best := otherwise
	var best_err := INF
	var map: FloorMap = _monsters.map
	for ty in range(floori(troll.world.y - away - 2), floori(troll.world.y + away + 3)):
		for tx in range(floori(troll.world.x - away - 2), floori(troll.world.x + away + 3)):
			if not map.walkable(tx, ty):
				continue
			var p := Vector2(tx + 0.5, ty + 0.5)
			var d := p.distance_to(troll.world)
			var err := absf(d - away)
			# (he charges from 3.5 tiles to 9: far enough that he will, near enough that he wakes)
			if err >= best_err or d < 4.5 or d > 8.5:
				continue
			var f := (p - troll.world) / d
			var ok := true
			var a := 0.2
			while a <= d + 1.6 and ok:
				var q := troll.world + f * a
				ok = _monsters.clear(q.x, q.y, 0.42)
				a += 0.2
			if ok:
				best_err = err
				best = p
	return best


func _has(P: Perils, kind: String, after := 0.0) -> bool:
	for p in P.list:
		if p["kind"] == kind and p["t"] >= after:
			return true
	return false


func _has_bars(P: Perils, from: float, to: float) -> bool:
	for p in P.list:
		if p["kind"] == "bars" and p["t"] >= from and p["t"] <= to:
			return true
	return false


func _flying(look: String) -> bool:
	for a in _monsters._arrows:
		if is_instance_valid(a["node"]) and a["node"].look == look:
			return true
	return false


func _rising() -> int:
	var n := 0
	for m in _monsters.list:
		if is_instance_valid(m) and m.state == "rise":
			n += 1
	return n


## Whether a mark of floors 6 to 8's of that name is on the floor (scripts/act1/marks.gd), and `ok` holds of it.
func _a1(P: Perils, name: String, ok := Callable()) -> bool:
	for p in P.list:
		if p["kind"] == "a1" and p["a1"] == name and (not ok.is_valid() or ok.call(p)):
			return true
	return false


## A picture the moment `cond` holds (looked at every frame), or after `timeout` seconds whatever holds (named so).
func _snap_when(path: String, cond: Callable, timeout: float) -> bool:
	var t := 0.0
	while t < timeout:
		if cond.call():
			await _snap(path)
			return true
		await get_tree().process_frame
		t += get_process_delta_time()
	await _snap(path.replace(".png", "_timeout.png"))
	print("TIMEOUT ", path.get_file())
	return false


func _alive() -> int:
	var n := 0
	for m in _monsters.list:
		if is_instance_valid(m) and not m.dead:
			n += 1
	return n


## The monster of that kind nearest `from`, at least `beyond` tiles off (so as not to pick the soft pack at the start).
func _nearest_kind(from: Vector2, kind: String, beyond: float) -> Monster:
	var best: Monster = null
	var best_d := INF
	for m in _monsters.list:
		if is_instance_valid(m) and not m.dead and m.kind == kind:
			var d := m.world.distance_to(from)
			if d >= beyond and d < best_d:
				best_d = d
				best = m
	return best


## A tile centre the hero may stand on, about `away` tiles from `at` and in sight of it.
func _spot_near(at: Vector2, away: float, otherwise: Vector2) -> Vector2:
	var best := otherwise
	var best_err := INF
	var map: FloorMap = _monsters.map
	for ty in range(floori(at.y - away - 2), floori(at.y + away + 3)):
		for tx in range(floori(at.x - away - 2), floori(at.x + away + 3)):
			if not map.walkable(tx, ty):
				continue
			var p := Vector2(tx + 0.5, ty + 0.5)
			var err := absf(p.distance_to(at) - away)
			if err < best_err and _monsters.sees(p, at):
				best_err = err
				best = p
	return best


## A key pressed and let go, as from the keyboard; a press of the left button at a place on the screen (game pixels).
func _key(k: Key) -> void:
	for down in [true, false]:
		var e := InputEventKey.new()
		e.physical_keycode = k
		e.keycode = k
		e.pressed = down
		Input.parse_input_event(e)
		await _wait(0.12)


var _acts_seen := 0


func _click(at: Vector2) -> void:
	var where: Vector2 = get_viewport().get_final_transform() * (at * 2.0)
	for down in [true, false]:
		var e := InputEventMouseButton.new()
		e.button_index = MOUSE_BUTTON_LEFT
		e.pressed = down
		e.position = where
		e.global_position = where
		Input.parse_input_event(e)
		# (whether he begins a blow on it: looked at every frame)
		var was: String = hero._act
		var t := 0.0
		while t < 0.12:
			await get_tree().process_frame
			t += get_process_delta_time()
			if hero._act != was:
				if hero._act != "":
					_acts_seen += 1
				was = hero._act


func _wait(s: float) -> void:
	await get_tree().create_timer(s).timeout


func _snap(path: String) -> void:
	await RenderingServer.frame_post_draw
	var img := get_viewport().get_texture().get_image()
	img.resize(img.get_width() * 2, img.get_height() * 2, Image.INTERPOLATE_NEAREST)
	img.save_png(path)


## SHOT MODE, THE WARRIOR'S OWN MOVES: set down 7 tiles from a pack of skeletons as they wake, he lunges into them
## (in the air; landed), whirls (the blow all round him), and strikes on; pictures of each, and how many fell.
func _hero_moves(hero: Hero, dir: String) -> void:
	var skel := _nearest_kind(hero.world, "skeleton", 12.0)
	if skel == null:
		return
	var n0 := _alive()
	hero.world = _spot_near(skel.world, 7.0, hero.world)
	await _wait(1.4)
	await _snap(dir + "/01a_pack_comes.png")
	var pack := _nearest_kind(hero.world, "skeleton", 0.0)
	hero.auto_lunge = pack.world
	await _wait(0.2)
	await _snap(dir + "/01b_lunge_in_the_air.png")
	await _wait(0.3)
	await _snap(dir + "/01c_lunge_landed.png")
	await _wait(0.3)
	hero.auto_whirl = true
	await _wait(0.33)
	await _wait(0.5)
	await _snap(dir + "/01d_whirl.png")
	hero.auto_whirl = false
	for i in 8:
		hero.auto_attack = true
		await _wait(0.5)
		if i == 3:
			hero.auto_whirl = true
	hero.auto_whirl = false
	await _snap(dir + "/01e_after.png")
	print("WARRIOR'S MOVES: ", n0 - _alive(), " monsters down")


# ===========================================================================================================================
# THE WORDS IN THE FIGHT, CHECKED (--only=words): all of this check lies between this line and the one like it below.
# ===========================================================================================================================

## SHOT MODE, THE WORDS IN THE FIGHT (--only=words): on floor 2 a pack of six skeletons is gathered before him in a hall, and
## the rest of the floor's monsters sent away (but its boss and one elite, for the end). The six are made to be read from:
## they stand where they are put (A the one a Strike hits, B and C beside it, D and E an arc's jump further off, F out of
## reach of everything), they do not fight or walk, and they have life enough that none falls; and his roll is made fixed
## (his weapon 100 to 100, no critical hits). Then, each a case of its own, the pack made whole again before it: each of the
## seven words IN FRONT of Strike and BEHIND it, and Flame, Frost, Lightning and Poison in front of and behind the Whirlwind
## and the Lunge. A case sets the word (his slots as at level 20, the ring lit), makes the move, and SAYS IN ONE LINE WHAT THE
## RULES DID beside what the game's own formula gives: the damage dealt, what is on what was struck, how many the lightning
## jumped to, the doses, the stun, his might and his haste, the ground left and what it did over its time to those standing
## in it, and how many of each telling fx.gd was sent; the line ends OK, or WRONG and what. A picture a case. Then a Strike
## that meets nothing, the Whirlwind held to its end, the Lunge's wait and Heavy's landing; a chilled skeleton's pace and
## wind-up; an elite and the boss struck with Frost and Heavy, Flame and Poison; and one line for all of it, beginning WORDS:.
const W_ROLL := 100.0
const W_LIFE := 1000000.0
## (floors 6 to 10's words' cases, in each of the three words' checks: check_words610.gd)
const CheckWords610 := preload("res://scripts/check_words610.gd")
## (WORDMELDING: the words melding makes, in the fight, and the wordsmith's meld page: check_melds.gd)
const CheckMelds := preload("res://scripts/check_melds.gd")
## (where the six stand from him: tiles before him, tiles to his side)
const W_FORM := [[1.2, 0.0], [1.2, 0.9], [2.1, -0.5], [3.8, 0.4], [5.2, -0.6], [9.5, 0.5]]
var _w_pack: Array = []
var _w_home := Vector2.ZERO
var _w_face := Vector2(1, 0)
var _w_was: Array = []
var _w_bad: Array = []
var _w_n := 0
var _w_dir := ""
## (how long a frame takes here, seconds: what a time read off the game is allowed to be out by)
var _w_frame := 0.02
## (how far into his Strike he was, by his own clock, in the last frame before its blow landed)
var _w_before := 0.0


func _words_shots(h: Hero, dir: String) -> void:
	go_to("floor2", "down")
	await _wait(1.4)
	if sight != null:
		sight.see_all()
	_w_dir = dir
	# (the first prompt of the guide is not wanted across the pictures: he has walked)
	h.walked = 5.0
	if not _w_find():
		print("WORDS: no hall on floor 2 has room for the pack")
		return
	var first := _nearest_kind(_w_home, "skeleton", 0.0)
	var near: Array = []
	for m in _monsters.list:
		if is_instance_valid(m) and not m.dead and m.kind == "skeleton" and not m.elite and not m.boss:
			near.append(m)
	if first == null or near.size() < W_FORM.size():
		print("WORDS: floor 2 has no pack of skeletons to gather")
		return
	near.sort_custom(func(a, b) -> bool: return a.world.distance_to(first.world) < b.world.distance_to(first.world))
	_w_pack = near.slice(0, W_FORM.size())
	var boss: Monster = null
	var elite: Monster = null
	for m in _monsters.list:
		if not is_instance_valid(m) or m.dead:
			continue
		if m.boss:
			boss = m
		elif m.elite and m.kind == "champion" and (elite == null or m.world.distance_to(_w_home) < elite.world.distance_to(_w_home)):
			elite = m
	for o in _monsters.list:
		if is_instance_valid(o) and not _w_pack.has(o) and o != boss and o != elite:
			o.queue_free()
	_w_reset(h)
	await _wait(0.5)
	var frames := 0.0
	for k in 30:
		await get_tree().process_frame
		frames += get_process_delta_time()
	_w_frame = frames / 30.0
	# (THE 52 DESIGNED MELDS AND THE 11 LEVEL 2 RUNES: `--cases=m52`, or `--cases=m52:<id>,<id>`: check_melds52.gd)
	if _arg("cases").begins_with("m52film"):
		await preload("res://scripts/check_melds52.gd").new(self, h).film(_arg("cases").trim_prefix("m52film").trim_prefix(":"))
		return
	if _arg("cases").begins_with("m52"):
		await preload("res://scripts/check_melds52.gd").new(self, h).run(_arg("cases").trim_prefix("m52").trim_prefix(":"))
		return
	# (ALL MELDS: THE LEAST EXCITING REDONE: `--cases=redo`, `--cases=redo:<id>,<id>` or `--cases=redo:round=1`: check_redo.gd)
	if _arg("cases").begins_with("redo"):
		await preload("res://scripts/check_redo.gd").new(self, h).run(_arg("cases").trim_prefix("redo").trim_prefix(":"))
		return
	# (THE HIGH CITY'S RUNES MELDED: `--cases=high`, or `--cases=high:<id>,<id>`: check_high.gd)
	if _arg("cases").begins_with("high"):
		await preload("res://scripts/check_high.gd").new(self, h).run(_arg("cases").trim_prefix("high").trim_prefix(":"))
		return
	# (THE PRIZE CARRIERS: `--cases=prize`, check_prize.gd)
	if _arg("cases").begins_with("prize"):
		await preload("res://scripts/check_prize.gd").new(self, h).run()
		return
	# (REAPING WITH THE DAMAGE RUNES: `--cases=reap5`, check_reap5.gd)
	if _arg("cases").begins_with("reap5"):
		await preload("res://scripts/check_reap5.gd").new(self, h).run()
		return
	# (the first seven's cases; floors 6 to 10's nine have their own, at the end: check_words610.gd. `--cases=610`: theirs alone;
	# `--cases=610:<word>`, one word's)
	var words: Array = Hero.Words.ids().filter(func(w): return not Hero.Words.data()["wilds"].has(w) and not Hero.Words.data().get("city", {}).get("ids", []).has(w))
	if _arg("cases").begins_with("610"):
		words = []
	# (WORDMELDING: `--cases=meld`, the words melding makes alone; `--cases=meld:<word>,<word>`, those: check_melds.gd)
	var melds_only: bool = _arg("cases").begins_with("meld")
	if melds_only:
		words = []
	print("WORDS begin: floor 2, he at %s facing %s, the pack A to F %s to %s tiles before him; his Str %d Dex %d Int %d, his roll fixed at %d, no critical hits, %.3f blows a second; a frame takes %.3f s" % [
		_w_home, _w_face, W_FORM[0][0], W_FORM[5][0], h.stats["str"], h.stats["dex"], h.stats["int"], W_ROLL, h.stats["aps"], _w_frame])
	for w in words:
		await _w_strike_front(h, w)
	for w in words:
		await _w_strike_behind(h, w)
	if not words.is_empty():
		for side in ["front", "behind"]:
			for w in ["fire", "frost", "lightning", "poison"]:
				await _w_whirl_case(h, side, w)
		for side in ["front", "behind"]:
			for w in ["fire", "frost", "lightning", "poison"]:
				await _w_lunge_case(h, side, w)
		await _w_more(h)
		await _w_chilled(h)
		await _w_tough(h, elite, boss)
	# (FLOORS 6 TO 10'S NINE WORDS, each in front of and behind each of his moves: check_words610.gd)
	if not melds_only:
		await CheckWords610.new(self, h).words(_arg("cases").trim_prefix("610").trim_prefix(":"))
	# (WORDMELDING: the 28 words melding makes, each in front of and behind his Strike: check_melds.gd)
	if melds_only or _arg("cases") == "":
		await CheckMelds.new(self, h).words(_arg("cases").trim_prefix("meld").trim_prefix(":"))
	print("WORDS: %d cases, %d as the game's formula gives, %d not%s" % [_w_n, _w_n - _w_bad.size(), _w_bad.size(), "" if _w_bad.is_empty() else ": " + "; ".join(PackedStringArray(_w_bad))])


## A place in a hall of the floor where he and the pack before him have clear floor, away from its traps and its sealed door:
## where he stands, and the way he faces. False: none.
func _w_find() -> bool:
	var rooms: Array = map.rooms.duplicate()
	rooms.sort_custom(func(a, b) -> bool: return a["w"] * a["h"] > b["w"] * b["h"])
	# (the place with the most clear floor to either side of them, so that as little as may be stands near to hide them, a
	# well or a brazier; at the least, room for them alone)
	for wide in [3.25, 2.6, 1.95, 1.3]:
		for r in rooms:
			if r.get("kind", "") in ["boss", "start"]:
				continue
			for f in [Vector2(1, 0), Vector2(0, 1), Vector2(-1, 0), Vector2(0, -1)]:
				for ty in range(int(r["y"]), int(r["y"]) + int(r["h"])):
					for tx in range(int(r["x"]), int(r["x"]) + int(r["w"])):
						var at := Vector2(tx + 0.5, ty + 0.5)
						if _w_fits(r, at, f, wide):
							_w_home = at
							_w_face = f
							return true
	return false


func _w_fits(r: Dictionary, at: Vector2, f: Vector2, wide: float) -> bool:
	var side := Vector2(-f.y, f.x)
	var a := -3.8
	while a <= 10.0:
		var b := -wide
		while b <= wide + 0.001:
			var q: Vector2 = at + f * a + side * b
			if not FloorMap.in_room(r, q) or not map.fits(q.x, q.y, 0.4):
				return false
			for z in map.hazards:
				if q.x > float(z["x"]) - 1.0 and q.x < float(z["x"]) + float(z["w"]) + 1.0 and q.y > float(z["y"]) - 1.0 and q.y < float(z["y"]) + float(z["h"]) + 1.0:
					return false
			for d in map.doors:
				if d["kind"] == "worddoor" and Vector2(d["middle"]["x"], d["middle"]["y"]).distance_to(q) < 4.5:
					return false
			b += 0.65
		a += 0.45
	return true


## Where one of the pack stands.
func _w_spot(k: int) -> Vector2:
	return _w_home + _w_face * float(W_FORM[k][0]) + Vector2(-_w_face.y, _w_face.x) * float(W_FORM[k][1])


## The pack whole again and where it stands, nothing on it and nothing lying on the floor; he where he stands, his roll
## fixed, nothing given him, his moves ready; the tellings counted from nothing.
func _w_reset(h: Hero) -> void:
	_monsters.forget()
	# (any that rose again or were called up in the last case, not of the pack: gone, so they do not fight on into the next)
	for o in _monsters.list:
		if is_instance_valid(o) and not _w_pack.has(o) and not o.dead:
			o.dead = true
			o.visible = false
			o.world = Vector2(-999.0, -999.0)
	wakes.list.clear()
	wakes.queue_redraw()
	for k in _w_pack.size():
		var m: Monster = _w_pack[k]
		m.world = _w_spot(k)
		m.face = (_w_home - m.world).normalized()
		m.speed = 0.0
		m.max_life = W_LIFE
		m.life = W_LIFE
		# (it stands, and does nothing of its own: held as one that has just struck is, for as long as the check lasts)
		m.state = "recover"
		m._t = 1e9
		m._cd = 1e9
		m._move = -1
		m._set_list("idle")
	h.world = _w_home
	h._end_act()
	h._landing = false
	h._turn(_w_face)
	h.auto_dir = Vector2.ZERO
	h.auto_whirl = false
	h.might = 0.0
	h.might_t = 0.0
	h.haste = 0.0
	h.haste_t = 0.0
	h._whirl_cd = 0.0
	h._lunge_cd = 0.0
	h._last_swing = -10.0
	h._combo_next = false
	h.life = h.max_life
	h.stats["dmg_min"] = W_ROLL
	h.stats["dmg_max"] = W_ROLL
	h.stats["crit_chance"] = 0.0
	fx.seen = {}
	fx.last = {}
	_w_mark()


## His moves' slots as at level 20 with the ring lit, all emptied, and `words` set in front of move `i` or behind it.
func _w_put(h: Hero, i: int, side: String, words: Array) -> void:
	h.loadout.set_level(20, true)
	for k in 3:
		for s in ["front", "behind"]:
			for j in h.loadout.slots(k, s).size():
				h.loadout.take(k, s, j)
	for w in words:
		var why: String = h.loadout.put(i, side, w)
		if why != "":
			print("WORDS: ", w, " would not go ", side, " of move ", i, ": ", why)


## A case begun: the words set, everything made whole. What the move comes to with them (words.gd resolve).
func _w_set(h: Hero, i: int, side: String, words: Array) -> Dictionary:
	_w_put(h, i, side, words)
	_w_reset(h)
	return h.loadout.r(i)


## One hit of move `i` before it is rounded, as the game's formula gives it (game.ts hitMonster, avgHit): his roll (fixed) x
## the move's share with its words x `frac` x (1 + (his damage bonus, the bonus of the blow's element, his might) / 100).
func _w_avg(h: Hero, i: int, frac := 1.0, might := 0.0) -> float:
	var r: Dictionary = h.loadout.r(i)
	var el: float = h.stats.get({"fire": "fire_pct", "frost": "frost_pct", "lightning": "light_pct"}.get(r["element"], "phys_pct"), 0.0)
	return W_ROLL * float(r["dmg_mult"]) * frac * (1.0 + (h.stats["dmg_pct"] + el + might) / 100.0)


## The same as it lands: rounded, 1 at least.
func _w_hit(h: Hero, i: int, frac := 1.0, might := 0.0) -> int:
	return int(maxf(1.0, roundf(_w_avg(h, i, frac, might))))


## The pack's life noted; and how much each has lost since.
func _w_mark() -> void:
	_w_was = []
	for m in _w_pack:
		_w_was.append(m.life)


func _w_lost() -> Array:
	var out: Array = []
	for k in _w_pack.size():
		out.append(int(roundf(_w_was[k] - _w_pack[k].life)))
	return out


## A thing held against what the formula gives: noted as wrong if it is not so.
func _w_is(wrong: Array, ok: bool, what: String) -> void:
	if not ok:
		wrong.append(what)


## How near a time read off the game must be to what the formula gives: `least`, or three frames if that is more.
func _w_tol(least: float) -> float:
	return maxf(least, 3.0 * _w_frame)


## LIGHTNING in front of a move that strikes an area, held against the rule once its chains have run: what each of the pack
## lost beyond the move's own hit is whole arcs; and as many arcs were told as did harm, and three more, the ones called down
## out of the sky on the first three struck (the fourth, struck quietly, calls none and none jumps from it).
func _w_arcs(h: Hero, i: int, struck: int, wrong: Array) -> String:
	var r: Dictionary = h.loadout.r(i)
	var want := _w_hit(h, i)
	var arc := int(maxf(1.0, roundf(want * float(r["arc_dmg"]))))
	var lost := _w_lost()
	var told: int = fx.seen.get("arc", 0)
	var by_arcs := 0
	var whole := true
	for k in lost.size():
		var more: int = lost[k] - (want if k < struck else 0)
		whole = whole and more >= 0 and more % arc == 0
		by_arcs += more
	_w_is(wrong, whole and by_arcs == (told - 3) * arc, "the arcs took %d in all (%s), arc told %d" % [by_arcs, str(lost), told])
	_w_is(wrong, told >= 9 and told <= 15, "arc told %d" % told)
	return "its lightning: arc told %d: 3 called down on the first three struck, %d that did harm, %d each (formula %d x %.2f), %d in all, to the nearest 2 of each and on by chain; the fourth struck, quiet, called none; in all they lost %s" % [told, told - 3, arc, want, r["arc_dmg"], by_arcs, str(lost)]


## The tellings sent since the case began, by name.
func _w_told() -> String:
	var keys: Array = fx.seen.keys()
	keys.sort()
	var parts: PackedStringArray = []
	for k in keys:
		parts.append("%s %d" % [k, fx.seen[k]])
	return ", ".join(parts) if not parts.is_empty() else "none"


## A case's one line.
func _w_say(what: String, said: String, wrong: Array) -> void:
	_w_n += 1
	if not wrong.is_empty():
		_w_bad.append(what)
	print("WORDS %02d %s: %s; told: %s :: %s" % [_w_n, what, said, _w_told(), "OK" if wrong.is_empty() else "WRONG: " + "; ".join(PackedStringArray(wrong))])


## A case's picture.
func _w_snap(what: String) -> void:
	await _snap("%s/w%02d_%s.png" % [_w_dir, _w_n + 1, what.replace(" ", "_")])


## He strikes, from where he stands (or from `at`); the frame after his blow has landed is waited for. How far into the Strike
## it landed, by his own clock (a frame more at most); `_w_before`: how far in he was the frame before. (The clock by which burning and poison bite is held a quarter second off until then,
## so that what is read as it lands is the hit's.)
func _w_strike(h: Hero, at := Vector2.INF) -> float:
	var n0: int = fx.seen.get("swing", 0)
	var stand := _w_home if at == Vector2.INF else at
	h._begin_strike()
	var t := 0.0
	while fx.seen.get("swing", 0) == n0 and t < 3.0:
		_monsters._dot_t = 0.25
		h.world = stand
		_w_before = h._act_t
		await get_tree().process_frame
		t += get_process_delta_time()
	return h._act_t


## The attack held: his next blow, as soon as he may make it; the frame after it has landed is waited for. How long after
## the last one was begun this one was, by his own clock (a frame more at most).
func _w_strike_again(h: Hero) -> float:
	var n0: int = fx.seen.get("swing", 0)
	var last: float = h._last_swing
	var t := 0.0
	while fx.seen.get("swing", 0) == n0 and t < 4.0:
		h.auto_attack = true
		h.world = _w_home
		await get_tree().process_frame
		t += get_process_delta_time()
	return h._last_swing - last


## The Whirlwind held from where he stands: the frame after its first turn has cut is waited for (the biting clock held off
## as for a Strike).
func _w_whirl_begin(h: Hero) -> void:
	h._whirl_cd = 0.0
	h.auto_whirl = true
	var t := 0.0
	while t < 3.0 and not (h._act == "whirl" and h._bites >= 1):
		_monsters._dot_t = 0.25
		await get_tree().process_frame
		t += get_process_delta_time()


## It is held on until so many turns have cut, then let go, and he stands out of it.
func _w_whirl_on(h: Hero, bites: int) -> void:
	var t := 0.0
	while t < 4.0 and h._act == "whirl" and h._bites < bites:
		await get_tree().process_frame
		t += get_process_delta_time()
	h.auto_whirl = false
	while t < 6.0 and h._act == "whirl":
		await get_tree().process_frame
		t += get_process_delta_time()


## He lunges from where he stands to `to`; the frame after he has landed is waited for (the biting clock held off).
func _w_lunge(h: Hero, to: Vector2) -> void:
	h._lunge_cd = 0.0
	h.auto_lunge = to
	var t := 0.0
	var began := false
	while t < 3.0:
		_monsters._dot_t = 0.25
		await get_tree().process_frame
		t += get_process_delta_time()
		if h._act == "lunge":
			began = true
		elif began:
			break


## How fast a body goes over the floor, tiles a second, measured over `secs` frame by frame (each frame's step by that
## frame's own time).
func _w_pace_of(o, secs: float) -> float:
	var dist := 0.0
	var time := 0.0
	var prev: Vector2 = o.world
	var d_prev := -1.0
	while time < secs:
		await get_tree().process_frame
		if d_prev >= 0.0:
			dist += o.world.distance_to(prev)
			time += d_prev
		prev = o.world
		d_prev = get_process_delta_time()
	return dist / time


## How much of the game's time passes from `begin` until `cond` holds (a frame more at most), `most` at the longest. `begin`
## is done as a frame begins, so that every frame it then passes through is counted, and no other.
func _w_time_from(begin: Callable, cond: Callable, most: float) -> float:
	await get_tree().process_frame
	begin.call()
	var time := 0.0
	while time < most:
		var d := get_process_delta_time()
		await get_tree().process_frame
		time += d
		if cond.call():
			break
	return time


## Waited until `cond` holds, `most` seconds at the longest.
func _w_until(cond: Callable, most: float) -> void:
	var t := 0.0
	while t < most and not cond.call():
		await get_tree().process_frame
		t += get_process_delta_time()


## What is on a monster now, as the game names it.
func _w_on(m: Monster) -> Dictionary:
	return {"burn_t": m.burn_t, "burn_dps": m.burn_dps, "chill_t": m.chill_t, "chill": m.chill, "frozen_t": m.frozen_t, "freeze_immune": m.freeze_immune,
		"poison_t": m.poison_t, "poison_dps": m.poison_dps, "poison_n": m.poison_n, "stun_t": m.stun_t, "stagger_t": m.stagger_t, "state": m.state}


## The pack watched for `secs`, frame by frame: how many times each lost life and how much (what bites it: the ground, what
## burns it, its poison), and the most that was on A meanwhile.
func _w_watch(secs: float) -> Dictionary:
	var n: Array = []
	var lost: Array = []
	var was: Array = []
	for m in _w_pack:
		n.append(0)
		lost.append(0)
		was.append(m.life)
	var a: Monster = _w_pack[0]
	var most := {"chill": 0.0, "frozen": 0.0, "poison_dps": 0.0, "poison_n": 0, "stagger": 0.0, "stun": 0.0}
	var t := 0.0
	while t < secs:
		await get_tree().process_frame
		t += get_process_delta_time()
		for k in _w_pack.size():
			var m: Monster = _w_pack[k]
			if m.life < was[k] - 0.001:
				n[k] += 1
				lost[k] += int(roundf(was[k] - m.life))
			was[k] = m.life
		if a.chill_t > 0.0:
			most["chill"] = maxf(most["chill"], a.chill)
		most["frozen"] = maxf(most["frozen"], a.frozen_t)
		most["poison_dps"] = maxf(most["poison_dps"], a.poison_dps)
		most["poison_n"] = maxi(most["poison_n"], a.poison_n)
		most["stagger"] = maxf(most["stagger"], a.stagger_t)
		most["stun"] = maxf(most["stun"], a.stun_t)
	return {"n": n, "lost": lost, "most": most}


## A WORD IN FRONT OF STRIKE: the hit.
func _w_strike_front(h: Hero, w: String) -> void:
	var r := _w_set(h, 0, "front", [w])
	var what := "strike front %s" % w
	var wrong: Array = []
	var a: Monster = _w_pack[0]
	var want := _w_hit(h, 0)
	if w == "heavy":
		# (A is winding up a blow of its own: the stun is to break it off)
		a.state = "windup"
		a._t = 9.0
	await _wait(0.15)
	var wind: float = await _w_strike(h)
	var lost := _w_lost()
	var on := _w_on(a)
	# (Swift's picture after its second blow: writing a picture holds the game up a moment, and its blows are timed)
	if w != "swift":
		await _w_snap(what)
	var said := "\"%s\" hit A %d (formula %d = %d x %.3f)" % [r["name"], lost[0], want, W_ROLL, r["dmg_mult"]]
	_w_is(wrong, lost[0] == want, "A took %d, not %d" % [lost[0], want])
	var rad: float = float(r["splash"]) * float(r["size"])
	if r["splash"] > 0.0:
		var beside := _w_hit(h, 0, r["splash_dmg"])
		var style: String = fx.last.get("burst", {}).get("style", "none")
		said += "; splash %.2f round it for x%.1f, a %s: B %d C %d (formula %d), D %d" % [rad, r["splash_dmg"], style, lost[1], lost[2], beside, lost[3]]
		_w_is(wrong, lost[1] == beside and lost[2] == beside and lost[3] == 0, "the splash took %s" % str(lost))
		_w_is(wrong, style == ("blast" if r["splash_dmg"] >= 1.0 else "shock"), "the splash told as %s" % style)
	elif w != "lightning":
		_w_is(wrong, lost[1] == 0 and lost[2] == 0, "B and C took %d and %d with no splash" % [lost[1], lost[2]])
	match w:
		"power":
			var reach: float = fx.last.get("swing", {}).get("reach", 0.0)
			said += "; reach %.2f (formula 1.7 x %.3f)" % [reach, r["size"]]
			_w_is(wrong, absf(reach - 1.7 * float(r["size"])) < 0.001, "reach %.3f" % reach)
		"swift":
			await _w_strike_again(h)
			var gap: float = await _w_strike_again(h)
			await _w_snap(what)
			var windup := minf(0.333, 0.4 / float(r["rate"]))
			said += "; %.3f blows a second (his weapon's %.3f): held, his third blow was begun %.3f s after his second (formula 1 / %.3f = %.3f), and his first landed %.3f s into it (formula the lesser of 0.333 and 0.4 / %.3f = %.3f)" % [r["rate"], h.stats["aps"], gap, r["rate"], 1.0 / float(r["rate"]), wind, r["rate"], windup]
			_w_is(wrong, gap >= 1.0 / float(r["rate"]) - 0.001 and gap < 1.0 / float(r["rate"]) + 2.0 * _w_frame + 0.02, "the next blow %.3f s on" % gap)
			_w_is(wrong, wind >= windup - 0.001 and wind < windup + 2.0 * _w_frame + 0.02, "its wind-up %.3f s" % wind)
			# (with a faster weapon, where that wind-up is well short of the Strike's own 0.333 s: it must land in the first frame
			# he is that far into it, whatever a frame takes here)
			h.loadout.set_stats({"aps": 2.0})
			h._end_act()
			h._last_swing = -10.0
			var fast: float = h.loadout.r(0)["rate"]
			var landed: float = await _w_strike(h)
			h.loadout.set_stats({"aps": h.stats["aps"]})
			said += "; with a weapon of 2 blows a second, %.3f with Swift, his blow landed between %.3f and %.3f s into it (formula 0.4 / %.3f = %.3f, not the Strike's own 0.333)" % [fast, _w_before, landed, fast, 0.4 / fast]
			_w_is(wrong, _w_before < 0.4 / fast and landed >= 0.4 / fast - 0.001, "with the faster weapon its blow landed between %.3f and %.3f s" % [_w_before, landed])
		"fire":
			var dps: float = want * float(r["ignite"]) / 3.0
			var bite := int(maxf(1.0, roundf(dps * 0.5)))
			said += "; A burns %.2f a second for %.2f s (formula %d x %.3f / 3 = %.2f, 3 s)" % [on["burn_dps"], on["burn_t"], want, r["ignite"], dps]
			_w_is(wrong, absf(on["burn_dps"] - dps) < 0.01 and absf(on["burn_t"] - 3.0) < _w_tol(0.1), "A burning %.2f for %.2f s" % [on["burn_dps"], on["burn_t"]])
			_w_mark()
			var seen: Dictionary = await _w_watch(3.4)
			said += "; over it A B C were bitten %d %d %d times for %d %d %d (formula 6 x %d), then out: A burn_t %.2f" % [seen["n"][0], seen["n"][1], seen["n"][2], seen["lost"][0], seen["lost"][1], seen["lost"][2], bite, a.burn_t]
			for k in 3:
				_w_is(wrong, seen["n"][k] in [5, 6] and seen["lost"][k] == seen["n"][k] * bite, "%s burned %d in %d bites" % ["ABC"[k], seen["lost"][k], seen["n"][k]])
			_w_is(wrong, a.burn_t <= 0.0 and fx.seen.get("ignite", 0) == 3, "burn_t %.2f, ignite told %d" % [a.burn_t, fx.seen.get("ignite", 0)])
		"frost":
			said += "; A chilled %.3f for %.2f s (formula %.3f, 2.5 s), not frozen (%.2f)" % [on["chill"], on["chill_t"], r["chill"], on["frozen_t"]]
			_w_is(wrong, absf(on["chill"] - float(r["chill"])) < 0.001 and absf(on["chill_t"] - 2.5) < _w_tol(0.1) and on["frozen_t"] <= 0.0, "A chill %.3f for %.2f, frozen %.2f" % [on["chill"], on["chill_t"], on["frozen_t"]])
			await _w_strike_again(h)
			var frozen: float = a.frozen_t
			said += "; a second hit froze it %.2f s (formula 1.1), B %.2f C %.2f, not again for %.2f s (formula 4): freeze told %d" % [frozen, _w_pack[1].frozen_t, _w_pack[2].frozen_t, a.freeze_immune, fx.seen.get("freeze", 0)]
			_w_is(wrong, absf(frozen - 1.1) < _w_tol(0.15) and absf(a.freeze_immune - 4.0) < _w_tol(0.15) and fx.seen.get("freeze", 0) == 3, "frozen %.2f, immune %.2f, freeze told %d" % [frozen, a.freeze_immune, fx.seen.get("freeze", 0)])
			await _w_watch(1.3)
			_w_is(wrong, a.frozen_t <= 0.0 and fx.seen.get("shatter", 0) == 3, "thawed: frozen %.2f, shatter told %d" % [a.frozen_t, fx.seen.get("shatter", 0)])
			await _w_strike_again(h)
			said += "; thawed (shatter told %d), a third hit did not freeze it (%.2f), freeze told %d" % [fx.seen.get("shatter", 0), a.frozen_t, fx.seen.get("freeze", 0)]
			_w_is(wrong, a.frozen_t <= 0.0 and fx.seen.get("freeze", 0) == 3, "a third hit froze it again")
		"lightning":
			var arc := int(maxf(1.0, roundf(want * float(r["arc_dmg"]))))
			said += "; %d arcs for x%.2f: at once B %d C %d (formula %d)" % [r["arcs"], r["arc_dmg"], lost[1], lost[2], arc]
			_w_is(wrong, lost[1] == arc and lost[2] == arc and lost[3] == 0 and lost[4] == 0, "at once the arcs took %s" % str(lost))
			await _wait(0.4)
			lost = _w_lost()
			var jumped := 0
			for k in range(1, 6):
				if lost[k] > 0:
					jumped += 1
			said += ", then on, a moment apart, D %d E %d, F %d: it jumped to %d" % [lost[3], lost[4], lost[5], jumped]
			_w_is(wrong, lost[3] == arc and lost[4] == arc and lost[5] == 0 and lost[0] == want, "the chain took %s" % str(lost))
			_w_is(wrong, fx.seen.get("arc", 0) == 5, "arc told %d, not 5" % fx.seen.get("arc", 0))
		"poison":
			var dose: float = want * float(r["poison"]) * (1.0 + h.stats.get("poison_pct", 0.0) / 100.0)
			said += "; A poisoned: %d dose of %.2f a second for %.2f s (formula %d x %.3f = %.2f, 4 s)" % [on["poison_n"], on["poison_dps"], on["poison_t"], want, r["poison"], dose]
			_w_is(wrong, on["poison_n"] == 1 and absf(on["poison_dps"] - dose) < 0.01 and absf(on["poison_t"] - 4.0) < _w_tol(0.1), "poison %d x %.2f for %.2f" % [on["poison_n"], on["poison_dps"], on["poison_t"]])
			await _w_strike_again(h)
			await _w_strike_again(h)
			var bite := int(maxf(1.0, roundf(dose * 3.0 * 0.5)))
			said += "; three hits, %d doses, %.2f a second (formula %.2f)" % [a.poison_n, a.poison_dps, dose * 3.0]
			_w_is(wrong, a.poison_n == 3 and absf(a.poison_dps - dose * 3.0) < 0.01, "after three hits %d doses, %.2f" % [a.poison_n, a.poison_dps])
			_w_mark()
			var seen: Dictionary = await _w_watch(4.4)
			said += "; from the last it bit %d times for %d (formula 8 x %d), then gone: poison_t %.2f, doses %d" % [seen["n"][0], seen["lost"][0], bite, a.poison_t, a.poison_n]
			_w_is(wrong, seen["n"][0] in [7, 8] and seen["lost"][0] == seen["n"][0] * bite, "it bit %d times for %d" % [seen["n"][0], seen["lost"][0]])
			_w_is(wrong, a.poison_t <= 0.0 and a.poison_n == 0 and fx.seen.get("poisoned", 0) == 1, "poison_t %.2f, doses %d, poisoned told %d" % [a.poison_t, a.poison_n, fx.seen.get("poisoned", 0)])
		"heavy":
			var secs: float = fx.last.get("stun", {}).get("secs", 0.0)
			said += "; A stunned %.2f s (formula %.1f), told %.2f; the blow it was winding up broken off: it is in \"%s\"; %.3f blows a second (his weapon's %.3f / %.2f)" % [on["stun_t"], r["stun"], secs, on["state"], r["rate"], h.stats["aps"], Hero.Words.data()["heavy"]["slower"]]
			_w_is(wrong, absf(on["stun_t"] - float(r["stun"])) < _w_tol(0.1) and absf(secs - float(r["stun"])) < 0.001, "stunned %.2f, told %.2f" % [on["stun_t"], secs])
			_w_is(wrong, on["state"] == "chase", "its wind-up not broken off: %s" % on["state"])
			_w_is(wrong, fx.seen.get("heavy", 0) == 1 and fx.seen.get("stun", 0) == 1, "heavy told %d, stun told %d" % [fx.seen.get("heavy", 0), fx.seen.get("stun", 0)])
			await _w_watch(1.0)
			said += "; a second on, no longer (%.2f)" % a.stun_t
			_w_is(wrong, a.stun_t <= 0.0, "still stunned %.2f" % a.stun_t)
			await _w_strike_again(h)
			var gap: float = await _w_strike_again(h)
			said += "; held on, his third blow was begun %.3f s after his second, whose swing was over in 0.933 s (formula 1 / %.3f = %.3f)" % [gap, r["rate"], 1.0 / float(r["rate"])]
			_w_is(wrong, gap >= 1.0 / float(r["rate"]) - 0.001 and gap < 1.0 / float(r["rate"]) + 2.0 * _w_frame + 0.02, "his third blow %.3f s after his second" % gap)
	_w_say(what, said, wrong)


## A WORD BEHIND STRIKE: what the move gives him, or leaves.
func _w_strike_behind(h: Hero, w: String) -> void:
	var r := _w_set(h, 0, "behind", [w])
	var what := "strike behind %s" % w
	var wrong: Array = []
	var a: Monster = _w_pack[0]
	var said := "\"%s\"" % r["name"]
	if w == "heavy":
		# (B is winding up a blow of its own: the cracked ground is to break it off)
		_w_pack[1].state = "windup"
		_w_pack[1]._t = 9.0
	await _wait(0.15)
	if w == "power":
		var more: float = r["might"]
		var blows: Array = []
		var wants: Array = []
		var stacks: Array = []
		for k in 6:
			_w_mark()
			wants.append(_w_hit(h, 0, 1.0, h.might))
			if k == 0:
				await _w_strike(h)
			else:
				await _w_strike_again(h)
			blows.append(_w_lost()[0])
			stacks.append(roundi(h.might / more))
		var top: float = h.might
		var left: float = h.might_t
		await _w_snap(what)
		said += " six blows on A took %s (formula %s: each with the might before it); +%.2f%% a blow that lands: his stacks after each %s (formula 1 to 5, 5), might %.2f%% for %.2f s (formula %.2f, 5 s)" % [str(blows), str(wants), more, str(stacks), top, left, more * 5.0]
		_w_is(wrong, blows == wants, "the blows took %s, not %s" % [str(blows), str(wants)])
		_w_is(wrong, stacks == [1, 2, 3, 4, 5, 5] and absf(top - more * 5.0) < 0.001 and absf(left - 5.0) < _w_tol(0.15), "stacks %s, might %.2f for %.2f" % [str(stacks), top, left])
		_w_is(wrong, fx.seen.get("buff", 0) == 6 and fx.last.get("buff", {}).get("stacks", 0) == 5, "buff told %d" % fx.seen.get("buff", 0))
		var gone := 5.0 - h.might_t
		while h.might > 0.0 and gone < 8.0:
			await get_tree().process_frame
			gone += get_process_delta_time()
		said += "; gone %.2f s after the last blow (formula 5)" % gone
		_w_is(wrong, absf(gone - 5.0) < _w_tol(0.2) and h.might == 0.0, "his might lasted %.2f s" % gone)
		_w_say(what, said, wrong)
		return
	await _w_strike(h)
	var lost := _w_lost()
	var want := _w_hit(h, 0)
	said += " hit A %d (formula %d = %d x %.3f)" % [lost[0], want, W_ROLL, r["dmg_mult"]]
	_w_is(wrong, lost[0] == want, "A took %d, not %d" % [lost[0], want])
	if w == "swift":
		var base: float = 4.6 * (1.0 + h.stats["move_speed"] / 100.0)
		said += "; his haste %.2f%% for %.2f s (formula %.2f%%, 3 s)" % [h.haste, h.haste_t, r["haste"]]
		_w_is(wrong, absf(h.haste - float(r["haste"])) < 0.001 and absf(h.haste_t - 3.0) < _w_tol(0.15), "haste %.2f for %.2f" % [h.haste, h.haste_t])
		_w_is(wrong, fx.seen.get("buff", 0) == 1 and fx.last.get("buff", {}).get("kind", "") == "haste", "buff told %d" % fx.seen.get("buff", 0))
		var fast: float = await _w_walk(h, 0.4)
		await _w_snap(what)
		said += "; he walks %.3f tiles a second (formula %.1f x %.4f = %.3f)" % [fast, base, 1.0 + float(r["haste"]) / 100.0, base * (1.0 + float(r["haste"]) / 100.0)]
		_w_is(wrong, absf(fast - base * (1.0 + float(r["haste"]) / 100.0)) < 0.03, "his pace %.3f" % fast)
		var t := 0.0
		while h.haste > 0.0 and t < 5.0:
			await get_tree().process_frame
			t += get_process_delta_time()
		var plain: float = await _w_walk(h, 0.4)
		said += "; its 3 s out, %.3f (formula %.1f)" % [plain, base]
		_w_is(wrong, absf(plain - base) < 0.03 and h.haste == 0.0, "his pace after %.3f" % plain)
		_w_say(what, said, wrong)
		return
	# (an element, Poison or Heavy behind: the ground it leaves round what it struck)
	var inside: Array = [0, 1, 2]
	said += "; " + await _w_ground(h, 0, a.world, 1.5 if w == "poison" else 1.0, inside, what, wrong, true)
	if w == "heavy":
		said += "; B, winding up a blow as it stepped on the cracks, is in \"%s\"" % _w_pack[1].state
		_w_is(wrong, _w_pack[1].state == "chase", "B's wind-up not broken off: %s" % _w_pack[1].state)
	_w_say(what, said, wrong)


## He walks back the way he came for `secs` and is set down again where he stands: his pace, tiles a second.
func _w_walk(h: Hero, secs: float) -> float:
	h.auto_dir = Iso.to_screen(-_w_face.x, -_w_face.y).normalized()
	var t := 0.0
	while t < 2.0 and h._act != "":
		await get_tree().process_frame
		t += get_process_delta_time()
	await get_tree().process_frame
	var pace: float = await _w_pace_of(h, secs)
	h.auto_dir = Vector2.ZERO
	await get_tree().process_frame
	h.world = _w_home
	h._turn(_w_face)
	return pace


## THE GROUND A MOVE LEFT (wakes.gd), said and held against the game's rule for it: what lies, `rad` round `at`; and what it
## did over its time to those of the pack standing in it (`inside`: which of them), seen frame by frame. `whole`: a cloud's
## poison is watched until it has worn off those it poisoned.
func _w_ground(h: Hero, i: int, at: Vector2, rad: float, inside: Array, what: String, wrong: Array, whole: bool) -> String:
	var r: Dictionary = h.loadout.r(i)
	if wakes.list.size() != 1:
		wrong.append("%d patches lie, not 1" % wakes.list.size())
		await _w_snap(what)
		return "%d patches left" % wakes.list.size()
	var g: Dictionary = wakes.list[0]
	var kind: String = g["kind"]
	var hit := _w_avg(h, i)
	var dmg := 0.0
	var dur := 4.0
	var share := 0.0
	if r["zone"] != null:
		share = r["zone"]["dps"]
		dmg = hit * share
	elif r["cloud"] > 0.0:
		share = r["cloud"]
		dmg = hit * share
		dur = 5.0
	else:
		dur = r["cracks"]
	var said := "it left %s %.2f round, %.2f from where it struck, for %.1f s" % [kind, g["r"], Vector2(g["x"], g["y"]).distance_to(at), g["dur"]]
	_w_is(wrong, Vector2(g["x"], g["y"]).distance_to(at) < 0.01 and absf(float(g["r"]) - rad) < 0.001 and absf(float(g["dur"]) - dur) < 0.001, "the ground %s %.2f round for %.1f s, %.2f off" % [kind, g["r"], g["dur"], Vector2(g["x"], g["y"]).distance_to(at)])
	if kind != "cracks":
		said += ", %.2f %s (formula one hit %.2f x %.3f = %.2f)" % [g["dmg"], "a strike" if kind == "storm" else "a second", hit, share, dmg]
		_w_is(wrong, absf(float(g["dmg"]) - dmg) < 0.01, "its strength %.2f, not %.2f" % [g["dmg"], dmg])
	var names := ""
	for k in inside:
		names += "ABCDEF"[k]
	_w_mark()
	await _w_snap(what)
	var seen: Dictionary = await _w_watch(dur + (2.3 if kind == "venom" and whole else 0.4))
	var n: Array = seen["n"]
	var took: Array = seen["lost"]
	var out := 0
	for k in _w_pack.size():
		if not inside.has(k):
			out += took[k]
	_w_is(wrong, out == 0, "those not in it lost %d" % out)
	match kind:
		"burn", "ice":
			var bite := int(maxf(1.0, roundf(dmg * 0.5)))
			said += "; %s stood in it: bitten %s times for %s (formula 8 x %d each)" % [names, str(n.slice(0, inside.size())), str(took.slice(0, inside.size())), bite]
			for k in inside:
				_w_is(wrong, n[k] == 8 and took[k] == 8 * bite, "%s bitten %d times for %d" % ["ABCDEF"[k], n[k], took[k]])
			if kind == "ice":
				said += ", chilled %.3f while on it (formula %.3f)" % [seen["most"]["chill"], r["zone"]["slow"]]
				_w_is(wrong, absf(seen["most"]["chill"] - float(r["zone"]["slow"])) < 0.001, "the ice chilled %.3f" % seen["most"]["chill"])
		"storm":
			var bolt := int(maxf(1.0, roundf(dmg)))
			var bolts := 0
			var sum := 0
			for k in inside:
				bolts += n[k]
				sum += took[k]
			said += "; %s stood in it: %d bolts, on one of them each, took %s, %d in all (formula 8 x %d = %d)" % [names, bolts, str(took.slice(0, inside.size())), sum, bolt, 8 * bolt]
			_w_is(wrong, bolts == 8 and sum == 8 * bolt, "%d bolts took %d" % [bolts, sum])
			_w_is(wrong, fx.seen.get("arc", 0) == 8, "arc told %d, not 8" % fx.seen.get("arc", 0))
		"venom":
			var bite := int(maxf(1.0, roundf(dmg * 0.5)))
			var most: int = 13 if whole else 11
			said += "; %s stood in it: each poisoned %.2f a second, %d dose (formula %.2f, 1), bitten %s times for %s (formula about %d x %d each%s)" % [names, seen["most"]["poison_dps"], seen["most"]["poison_n"], dmg, str(n.slice(0, inside.size())), str(took.slice(0, inside.size())), most, bite, ", the poison worn off them 2 s after the cloud" if whole else " while it was watched"]
			_w_is(wrong, absf(seen["most"]["poison_dps"] - dmg) < 0.01 and seen["most"]["poison_n"] == 1, "the cloud's poison %.2f, %d doses" % [seen["most"]["poison_dps"], seen["most"]["poison_n"]])
			for k in inside:
				_w_is(wrong, absi(n[k] - most) <= 1 and took[k] == n[k] * bite, "%s bitten %d times for %d" % ["ABCDEF"[k], n[k], took[k]])
			_w_is(wrong, fx.seen.get("poisoned", 0) == inside.size(), "poisoned told %d" % fx.seen.get("poisoned", 0))
			if whole:
				_w_is(wrong, _w_pack[0].poison_t <= 0.0, "A still poisoned %.2f s" % _w_pack[0].poison_t)
		"cracks":
			var heavy: Dictionary = Hero.Words.data()["heavy"]
			said += "; %s stood on it: staggered %d times in all, A reeling %.2f s at a time (formula twice each: %.2f s, then not for %.1f s more)" % [names, fx.seen.get("stagger", 0), seen["most"]["stagger"], heavy["stagger"], heavy["staggerAgain"]]
			_w_is(wrong, fx.seen.get("stagger", 0) == 2 * inside.size() and absf(seen["most"]["stagger"] - float(heavy["stagger"])) < _w_tol(0.15), "stagger told %d, A reeling %.2f" % [fx.seen.get("stagger", 0), seen["most"]["stagger"]])
	said += "; then gone (%d lie)" % wakes.list.size()
	_w_is(wrong, wakes.list.is_empty(), "%d patches still lie" % wakes.list.size())
	return said


## A WORD ON THE WHIRLWIND, in front or behind: from among the pack, A B C D within a turn's reach.
func _w_whirl_case(h: Hero, side: String, w: String) -> void:
	var r := _w_set(h, 1, side, [w])
	var what := "whirlwind %s %s" % [side, w]
	var wrong: Array = []
	var a: Monster = _w_pack[0]
	var at := _w_home + _w_face * 2.0 + Vector2(-_w_face.y, _w_face.x) * 0.2
	h.world = at
	var want := _w_hit(h, 1)
	var rad: float = 2.0 * float(r["size"])
	await _wait(0.15)
	await _w_whirl_begin(h)
	var lost := _w_lost()
	var said := "\"%s\" its first turn, %.2f round him, struck A B C D (formula %d = %d x %.3f each): they lost %s" % [r["name"], fx.last.get("burst", {}).get("r", 0.0), want, W_ROLL, r["dmg_mult"], str(lost)]
	# (with Lightning in front the arcs are in what they lost at once: held against the rule below, _w_arcs)
	if not (side == "front" and w == "lightning"):
		_w_is(wrong, lost.slice(0, 4) == [want, want, want, want] and lost[4] == 0 and lost[5] == 0, "its first turn took %s" % str(lost))
	_w_is(wrong, absf(float(fx.last.get("burst", {}).get("r", 0.0)) - rad) < 0.001 and fx.last.get("burst", {}).get("style", "") == "whirl", "the turn told %s" % str(fx.last.get("burst", {})))
	if side == "behind":
		# (one turn, and let go: what it leaves, it left round him as it began)
		h.auto_whirl = false
		said += "; " + await _w_ground(h, 1, at, maxf(1.5 if w == "poison" else 1.0, rad), [0, 1, 2, 3], what, wrong, false)
		_w_say(what, said, wrong)
		return
	match w:
		"fire":
			var dps: float = want * float(r["ignite"]) / 3.0
			said += "; each burns %.2f a second (formula %d x %.3f / 3 = %.2f)" % [a.burn_dps, want, r["ignite"], dps]
			_w_is(wrong, absf(a.burn_dps - dps) < 0.01 and absf(_w_pack[3].burn_dps - dps) < 0.01, "burning %.2f" % a.burn_dps)
			await _w_whirl_on(h, 3)
			await _w_snap(what)
			said += "; three turns: still %.2f a second, its 3 s begun again by each (%.2f s left), ignite told %d (once each)" % [a.burn_dps, a.burn_t, fx.seen.get("ignite", 0)]
			_w_is(wrong, absf(a.burn_dps - dps) < 0.01 and a.burn_t > 2.4 and fx.seen.get("ignite", 0) == 4, "after three turns burning %.2f for %.2f, ignite told %d" % [a.burn_dps, a.burn_t, fx.seen.get("ignite", 0)])
		"frost":
			said += "; each chilled %.3f (formula %.3f), none frozen yet (freeze told %d)" % [a.chill, r["chill"], fx.seen.get("freeze", 0)]
			_w_is(wrong, absf(a.chill - float(r["chill"])) < 0.001 and a.frozen_t <= 0.0 and fx.seen.get("freeze", 0) == 0, "after one turn chill %.3f, frozen %.2f" % [a.chill, a.frozen_t])
			await _w_whirl_on(h, 3)
			await _w_snap(what)
			said += "; three turns: the second froze all four (freeze told %d), the third could not again (not for %.2f s more)" % [fx.seen.get("freeze", 0), a.freeze_immune]
			_w_is(wrong, fx.seen.get("freeze", 0) == 4 and a.freeze_immune > 3.0, "freeze told %d, immune %.2f" % [fx.seen.get("freeze", 0), a.freeze_immune])
		"lightning":
			# (one turn, and let go, so that its lightning is that turn's alone; its chains run a moment)
			h.auto_whirl = false
			await _w_snap(what)
			await _wait(0.4)
			said += "; " + _w_arcs(h, 1, 4, wrong)
		"poison":
			var dose: float = want * float(r["poison"]) * (1.0 + h.stats.get("poison_pct", 0.0) / 100.0)
			said += "; each poisoned, 1 dose of %.2f a second (formula %d x %.3f = %.2f)" % [a.poison_dps, want, r["poison"], dose]
			_w_is(wrong, a.poison_n == 1 and absf(a.poison_dps - dose) < 0.01, "after one turn %d doses, %.2f" % [a.poison_n, a.poison_dps])
			await _w_whirl_on(h, 3)
			await _w_snap(what)
			said += "; three turns: %d doses, %.2f a second (formula 3, %.2f), D the same %d, %.2f" % [a.poison_n, a.poison_dps, dose * 3.0, _w_pack[3].poison_n, _w_pack[3].poison_dps]
			_w_is(wrong, a.poison_n == 3 and absf(a.poison_dps - dose * 3.0) < 0.01 and _w_pack[3].poison_n == 3, "after three turns %d doses, %.2f" % [a.poison_n, a.poison_dps])
	_w_say(what, said, wrong)


## A WORD ON THE LUNGE, in front or behind: he lunges in from 3.5 tiles behind where he stands to a tile before it, so that
## its landing takes A B C D.
func _w_lunge_case(h: Hero, side: String, w: String) -> void:
	var r := _w_set(h, 2, side, [w])
	var what := "lunge %s %s" % [side, w]
	var wrong: Array = []
	var a: Monster = _w_pack[0]
	var from := _w_home - _w_face * 3.5
	var to := _w_home + _w_face * 1.0
	var at := to + _w_face * 1.0
	var want := _w_hit(h, 2)
	var rad: float = 1.6 * float(r["size"])
	h.world = from
	await _wait(0.15)
	await _w_lunge(h, to)
	var lost := _w_lost()
	var said := "\"%s\" its landing, %.2f round the point a tile before him, struck A B C D (formula %d = %d x %.3f each): they lost %s" % [r["name"], fx.last.get("burst", {}).get("r", 0.0), want, W_ROLL, r["dmg_mult"], str(lost)]
	# (with Lightning in front the arcs are in what they lost at once: held against the rule below, _w_arcs)
	if not (side == "front" and w == "lightning"):
		_w_is(wrong, lost.slice(0, 4) == [want, want, want, want] and lost[4] == 0 and lost[5] == 0, "its landing took %s" % str(lost))
	var told: Dictionary = fx.last.get("burst", {})
	_w_is(wrong, absf(float(told.get("r", 0.0)) - rad) < 0.001 and told.get("style", "") == "land" and Vector2(told.get("x", 0.0), told.get("y", 0.0)).distance_to(at) < 0.05, "the landing told %s" % str(told))
	if side == "behind":
		said += "; " + await _w_ground(h, 2, at, maxf(1.5 if w == "poison" else 1.0, rad), [0, 1, 2], what, wrong, false)
		_w_say(what, said, wrong)
		return
	match w:
		"fire":
			var dps: float = want * float(r["ignite"]) / 3.0
			said += "; each burns %.2f a second for 3 s (formula %d x %.3f / 3 = %.2f): A %.2f D %.2f, ignite told %d" % [a.burn_dps, want, r["ignite"], dps, a.burn_t, _w_pack[3].burn_t, fx.seen.get("ignite", 0)]
			_w_is(wrong, absf(a.burn_dps - dps) < 0.01 and absf(_w_pack[3].burn_dps - dps) < 0.01 and absf(a.burn_t - 3.0) < _w_tol(0.1) and fx.seen.get("ignite", 0) == 4, "burning %.2f for %.2f, ignite told %d" % [a.burn_dps, a.burn_t, fx.seen.get("ignite", 0)])
			await _w_snap(what)
		"frost":
			said += "; each chilled %.3f for 2.5 s (formula %.3f), none frozen (freeze told %d)" % [a.chill, r["chill"], fx.seen.get("freeze", 0)]
			_w_is(wrong, absf(a.chill - float(r["chill"])) < 0.001 and a.frozen_t <= 0.0 and fx.seen.get("freeze", 0) == 0, "chill %.3f, frozen %.2f" % [a.chill, a.frozen_t])
			h.world = from
			await _w_lunge(h, to)
			said += "; a second Lunge at once froze all four: A %.2f s (formula 1.1), freeze told %d" % [a.frozen_t, fx.seen.get("freeze", 0)]
			_w_is(wrong, absf(a.frozen_t - 1.1) < _w_tol(0.1) and fx.seen.get("freeze", 0) == 4, "frozen %.2f, freeze told %d" % [a.frozen_t, fx.seen.get("freeze", 0)])
			await _w_snap(what)
		"lightning":
			await _w_snap(what)
			await _wait(0.4)
			said += "; " + _w_arcs(h, 2, 4, wrong)
		"poison":
			var dose: float = want * float(r["poison"]) * (1.0 + h.stats.get("poison_pct", 0.0) / 100.0)
			said += "; each poisoned, 1 dose of %.2f a second for 4 s (formula %d x %.3f = %.2f): A %d dose, D %d, poisoned told %d" % [a.poison_dps, want, r["poison"], dose, a.poison_n, _w_pack[3].poison_n, fx.seen.get("poisoned", 0)]
			_w_is(wrong, a.poison_n == 1 and _w_pack[3].poison_n == 1 and absf(a.poison_dps - dose) < 0.01 and fx.seen.get("poisoned", 0) == 4, "%d doses, %.2f, poisoned told %d" % [a.poison_n, a.poison_dps, fx.seen.get("poisoned", 0)])
			await _w_snap(what)
	_w_say(what, said, wrong)


## MORE OF THE MOVES' OWN RULES: a Strike that meets nothing still leaves its wake where the blade passed; the Whirlwind held
## to its end, what it leaves laid again as it goes on, and its wait and the Lunge's as their words make them; Heavy in front
## of the Lunge.
func _w_more(h: Hero) -> void:
	# (a Strike of Flame at nothing: he stands back from the pack and turns from it)
	var r := _w_set(h, 0, "behind", ["fire"])
	var what := "strike behind fire, meeting nothing"
	var wrong: Array = []
	var from := _w_home - _w_face * 3.0
	h.world = from
	h._turn(-_w_face)
	await _wait(0.15)
	await _w_strike(h, from)
	var reach: float = 1.7 * float(r["size"])
	var want := from - _w_face * reach * 0.75
	var said := "\"%s\" swung away from the pack and met nothing (hit told %d)" % [r["name"], fx.seen.get("hit", 0)]
	_w_is(wrong, fx.seen.get("hit", 0) == 0 and _w_lost() == [0, 0, 0, 0, 0, 0], "it hit something: %s" % str(_w_lost()))
	if wakes.list.size() == 1:
		var g: Dictionary = wakes.list[0]
		said += "; it left %s %.2f round, %.3f tiles before him (formula three quarters of its reach, %.3f), %.2f a second (formula one hit %.2f x %.3f)" % [g["kind"], g["r"], Vector2(g["x"], g["y"]).distance_to(from), reach * 0.75, g["dmg"], _w_avg(h, 0), r["zone"]["dps"]]
		_w_is(wrong, Vector2(g["x"], g["y"]).distance_to(want) < 0.01 and absf(float(g["r"]) - 1.0) < 0.001 and absf(float(g["dmg"]) - _w_avg(h, 0) * float(r["zone"]["dps"])) < 0.01, "its wake %s" % str(g))
	else:
		said += "; %d patches lie" % wakes.list.size()
		wrong.append("%d patches lie, not 1" % wakes.list.size())
	await _w_snap(what)
	_w_say(what, said, wrong)

	# (the Whirlwind held to its end: Swift and Poison in front, Flame behind)
	_w_put(h, 1, "front", ["swift", "poison"])
	h.loadout.put(1, "behind", "fire")
	_w_reset(h)
	r = h.loadout.r(1)
	what = "whirlwind held to its end"
	wrong = []
	var at := _w_home + _w_face * 2.0 + Vector2(-_w_face.y, _w_face.x) * 0.2
	h.world = at
	await _wait(0.15)
	await _w_whirl_begin(h)
	var lain := 0.0
	var most := 0
	var d_prev := -1.0
	var snapped := false
	var a: Monster = _w_pack[0]
	var dose: float = _w_hit(h, 1) * float(r["poison"]) * (1.0 + h.stats.get("poison_pct", 0.0) / 100.0)
	var doses := [-1, 0.0, -1, 0.0]
	# (watched until what it left is gone: how long the ground lay; the button let go once the spin has ended of itself, and
	# A given one hit more of it then: a ninth dose)
	while lain < 12.0:
		await get_tree().process_frame
		if d_prev >= 0.0:
			lain += d_prev
		if (h._landed or h._act != "whirl") and h.auto_whirl:
			h.auto_whirl = false
			doses[0] = a.poison_n
			doses[1] = a.poison_dps
			h.hit_monster(a, 1, 1.0, false)
			doses[2] = a.poison_n
			doses[3] = a.poison_dps
		most = maxi(most, wakes.list.size())
		if wakes.list.is_empty():
			break
		if not snapped and lain > 1.2:
			snapped = true
			await _w_snap(what)
		d_prev = get_process_delta_time()
	said = "\"%s\" held until it ended of itself: %d turns in %.2f s (formula 8 in 2.4 s); its wait %.3f s (formula 3.5 less his cooldown recovery and Swift's cut = %.3f, the whole of it after a whole spin); what it left was laid again as he spun on, never more than %d patch, and lay %.2f s from the first (formula: laid by its first turn and by the first turn after each second of it, at 0, 1.2 and 2.1 s, then 4 s = 6.1)" % [r["name"], h._bites, h._stopped_at, h._whirl_full, r["cooldown"], most, lain]
	_w_is(wrong, h._bites == 8 and h._stopped_at >= 2.4 and h._stopped_at < 2.4 + 2.0 * _w_frame + 0.02, "%d turns in %.2f s" % [h._bites, h._stopped_at])
	_w_is(wrong, absf(h._whirl_full - float(r["cooldown"])) < 0.001 and float(r["cooldown"]) < 3.5, "its wait %.3f" % h._whirl_full)
	_w_is(wrong, most == 1 and absf(lain - 6.1) < _w_tol(0.15) and fx.seen.get("zone", 0) == 1, "%d patches, lain %.2f s, zone told %d" % [most, lain, fx.seen.get("zone", 0)])
	said += "; its eight turns left A with %d doses of poison, %.2f a second (formula 8, 8 x %.2f = %.2f); a ninth hit left %d doses, %.2f (formula still 8: no fewer than eight of the new dose)" % [doses[0], doses[1], dose, dose * 8.0, doses[2], doses[3]]
	_w_is(wrong, doses[0] == 8 and absf(doses[1] - dose * 8.0) < 0.01 and doses[2] == 8 and absf(doses[3] - dose * 8.0) < 0.01, "doses %s" % str(doses))
	_w_say(what, said, wrong)

	# (the Lunge's wait as Swift and as Heavy in front make it; and Heavy's landing)
	what = "lunge front swift, then heavy"
	wrong = []
	r = _w_set(h, 2, "front", ["swift"])
	h.world = _w_home - _w_face * 3.5
	await _wait(0.15)
	await _w_lunge(h, _w_home + _w_face * 1.0)
	var quick: float = h._lunge_full
	said = "\"%s\" is ready again after %.3f s (formula 4 less his cooldown recovery, %.1f%%, and Swift's cut = %.3f)" % [r["name"], quick, h.stats["cdr"] * 100.0, r["cooldown"]]
	_w_is(wrong, absf(quick - float(r["cooldown"])) < 0.001 and float(r["cooldown"]) < 4.0, "its wait %.3f" % quick)
	r = _w_set(h, 2, "front", ["heavy"])
	h.world = _w_home - _w_face * 3.5
	await _wait(0.15)
	await _w_lunge(h, _w_home + _w_face * 1.0)
	var stunned := 0
	for k in 4:
		if absf(_w_pack[k].stun_t - float(r["stun"])) < _w_tol(0.1):
			stunned += 1
	var told: Dictionary = fx.last.get("heavy", {})
	said += "; \"%s\" after %.3f s (formula 4 less his cooldown recovery, x %.2f = %.3f); its landing struck A B C D for %s (formula %d each) and stunned %d of them %.2f s (formula all four, %.1f s); its weight told out to %.2f round, big %s (formula the blast's edge, %.2f)" % [r["name"], h._lunge_full, Hero.Words.data()["heavy"]["slower"], r["cooldown"], str(_w_lost().slice(0, 4)), _w_hit(h, 2), stunned, _w_pack[0].stun_t, r["stun"], told.get("r", 0.0), told.get("big", false), 1.6 * float(r["size"])]
	_w_is(wrong, absf(h._lunge_full - float(r["cooldown"])) < 0.001 and float(r["cooldown"]) > 4.0, "its wait %.3f" % h._lunge_full)
	_w_is(wrong, _w_lost().slice(0, 4) == [_w_hit(h, 2), _w_hit(h, 2), _w_hit(h, 2), _w_hit(h, 2)] and stunned == 4 and fx.seen.get("stun", 0) == 4, "it took %s and stunned %d" % [str(_w_lost()), stunned])
	_w_is(wrong, fx.seen.get("heavy", 0) == 1 and told.get("big", false) and absf(float(told.get("r", 0.0)) - 1.6 * float(r["size"])) < 0.001, "its weight told %s" % str(told))
	await _w_snap(what)
	_w_say(what, said, wrong)


## WHAT A CHILL SLOWS, AND BY HOW MUCH: one of the pack let walk, its pace before and after a Frost hit; then its wind-up;
## then, frozen by a second Frost hit and stunned by a Heavy one, that it goes nowhere.
func _w_chilled(h: Hero) -> void:
	var r := _w_set(h, 0, "front", ["frost"])
	var what := "a chilled monster"
	var wrong: Array = []
	var f: Monster = _w_pack[5]
	f.state = "chase"
	f.speed = 3.0
	await _wait(0.5)
	var free: float = await _w_pace_of(f, 0.5)
	h.hit_monster(f, 0, 1.0, false)
	var by: float = f.chill
	var slowed: float = await _w_pace_of(f, 0.5)
	var wind_up := func() -> void:
		f.state = "windup"
		f._t = 0.5
	var t: float = await _w_time_from(wind_up, func() -> bool: return f.state != "windup", 3.0)
	# (walking again, a second chilling hit freezes it; thawed, a Heavy hit stuns it: it goes nowhere meanwhile)
	f.state = "chase"
	f._cd = 1e9
	h.hit_monster(f, 0, 1.0, false)
	var frozen: float = f.frozen_t
	var iced: float = await _w_pace_of(f, 0.4)
	await _w_until(func() -> bool: return f.frozen_t <= 0.0, 3.0)
	_w_put(h, 0, "front", ["heavy"])
	h.hit_monster(f, 0, 1.0, false)
	var stun: float = f.stun_t
	var stunned: float = await _w_pace_of(f, 0.4)
	await _w_until(func() -> bool: return f.stun_t <= 0.0, 3.0)
	var after: float = await _w_pace_of(f, 0.3)
	await _w_snap(what)
	var long := 0.5 / (0.6 + 0.4 * (1.0 - by))
	var said := "F, a skeleton let walk at 3 tiles a second, went %.3f; chilled %.3f by a Frost Strike's hit it went %.3f (formula 3 x %.3f = %.3f); a wind-up of 0.5 s then took it %.2f s (formula 0.5 / (0.6 + 0.4 x %.3f) = %.2f)" % [free, by, slowed, 1.0 - by, 3.0 * (1.0 - by), t, 1.0 - by, long]
	_w_is(wrong, absf(free - 3.0) < 0.03 and absf(by - float(r["chill"])) < 0.001 and absf(slowed - 3.0 * (1.0 - by)) < 0.03, "its pace %.3f, chilled %.3f" % [free, slowed])
	_w_is(wrong, t >= long - 0.001 and t < long + 2.0 * _w_frame + 0.02, "its wind-up took %.2f s" % t)
	said += "; walking again, a second Frost hit froze it %.2f s (formula 1.1) and it went %.3f; thawed, a Heavy hit stunned it %.2f s (formula 0.8) and it went %.3f; the stun over, it went on at %.3f" % [frozen, iced, stun, stunned, after]
	_w_is(wrong, absf(frozen - 1.1) < 0.001 and iced == 0.0 and absf(stun - 0.8) < 0.001 and stunned == 0.0 and after > 1.5, "frozen %.2f going %.3f, stunned %.2f going %.3f, then %.3f" % [frozen, iced, stun, stunned, after])
	_w_say(what, said, wrong)


## AN ELITE AND THE BOSS: an elite is stunned for half as long and frozen for 0.6 s; the boss is chilled, burned and poisoned,
## and never frozen, stunned or staggered. Each is hit by the rules' own hit (hero.gd hit_monster), he standing by it.
func _w_tough(h: Hero, elite: Monster, boss: Monster) -> void:
	_w_set(h, 0, "front", ["frost", "heavy"])
	var r: Dictionary = h.loadout.r(0)
	if elite != null:
		var what := "an elite"
		var wrong: Array = []
		elite.max_life = W_LIFE
		elite.life = W_LIFE
		h.world = _spot_near(elite.world, 1.6, elite.world)
		await _wait(0.3)
		fx.seen = {}
		h.hit_monster(elite, 0, 1.0, false)
		var stun: float = elite.stun_t
		await _wait(0.6)
		h.hit_monster(elite, 0, 1.0, false)
		await _w_snap(what)
		var said := "\"%s\" on %s, an elite (shut in a room: %s): stunned %.2f s (formula %.1f / 2); the second hit, 0.6 s on, froze it %.2f s (formula 0.6), not again for %.2f s (formula 4)" % [r["name"], elite.title, _monsters.shut_in(elite), stun, r["stun"], elite.frozen_t, elite.freeze_immune]
		_w_is(wrong, absf(stun - float(r["stun"]) / 2.0) < 0.001 and absf(elite.frozen_t - 0.6) < 0.001 and absf(elite.freeze_immune - 4.0) < 0.001, "stunned %.2f, frozen %.2f, immune %.2f" % [stun, elite.frozen_t, elite.freeze_immune])
		_w_is(wrong, fx.seen.get("stun", 0) == 2 and fx.seen.get("freeze", 0) == 1, "stun told %d, freeze told %d" % [fx.seen.get("stun", 0), fx.seen.get("freeze", 0)])
		_w_say(what, said, wrong)
	if boss != null:
		var what := "the boss"
		var wrong: Array = []
		h.world = _spot_near(boss.world, 4.0, boss.world)
		var t := 0.0
		while (boss.waits or boss.state == "sleep") and t < 12.0:
			await get_tree().process_frame
			t += get_process_delta_time()
		fx.seen = {}
		var life: float = boss.life
		h.hit_monster(boss, 0, 1.0, false)
		await _wait(0.3)
		h.hit_monster(boss, 0, 1.0, false)
		var took: float = life - boss.life
		var said := "\"%s\" twice on %s (waited %.1f s for him to fight): took %d (formula 2 x %d); chilled %.3f for %.2f s (formula %.3f, 2.5 s), so he walks at %.3f of his pace; frozen %.2f, stunned %.2f (formula never), freeze told %d, stun told %d" % [r["name"], boss.title, t, took, _w_hit(h, 0), boss.chill, boss.chill_t, r["chill"], boss.slow(), boss.frozen_t, boss.stun_t, fx.seen.get("freeze", 0), fx.seen.get("stun", 0)]
		_w_is(wrong, int(roundf(took)) == 2 * _w_hit(h, 0), "he took %d" % took)
		_w_is(wrong, absf(boss.chill - float(r["chill"])) < 0.001 and boss.chill_t > 2.0 and absf(boss.slow() - (1.0 - float(r["chill"]))) < 0.001, "chilled %.3f for %.2f" % [boss.chill, boss.chill_t])
		_w_is(wrong, boss.frozen_t <= 0.0 and boss.stun_t <= 0.0 and fx.seen.get("freeze", 0) == 0 and fx.seen.get("stun", 0) == 0, "frozen %.2f, stunned %.2f" % [boss.frozen_t, boss.stun_t])
		boss.stagger_from(h.world)
		_w_is(wrong, boss.stagger_t <= 0.0 and fx.seen.get("stagger", 0) == 0, "staggered %.2f" % boss.stagger_t)
		_w_put(h, 0, "front", ["fire"])
		h.hit_monster(boss, 0, 1.0, false)
		var burn: float = boss.burn_dps
		_w_put(h, 0, "front", ["poison"])
		h.hit_monster(boss, 0, 1.0, false)
		await _w_snap(what)
		life = boss.life
		_monsters._dot_t = 0.25
		await _wait(1.15)
		said += "; cracked ground did not stagger him (%.2f); a Flame hit set him burning %.2f a second, a Poison hit poisoned him %.2f a second (%d dose): in the next 1.15 s they took %d from him" % [boss.stagger_t, burn, boss.poison_dps, boss.poison_n, life - boss.life]
		_w_is(wrong, burn > 0.0 and boss.poison_n == 1 and boss.poison_dps > 0.0 and life - boss.life > 0.0, "burning %.2f, poison %.2f x %d, took %d" % [burn, boss.poison_dps, boss.poison_n, life - boss.life])
		_w_say(what, said, wrong)

# ===========================================================================================================================
# (the end of the check of the words in the fight)
# ===========================================================================================================================


## SHOT MODE, THE LOOT: a pack fought and what it leaves; more gear put in his way; the fallen wordsmith searched (the
## Master Rune-stone, and the Power word: a stand-in for the town); the gear screen with a piece's card; Power put in
## Strike; a level gained and its +5 offered; Power burned into his weapon.
func _loot_shots(hero: Hero, dir: String) -> void:
	await _wait(0.8)
	await _hero_moves(hero, dir)
	await _wait(0.6)
	await _snap(dir + "/20_what_fell.png")
	# (a guardian's hoard laid at his feet, to see gear on the floor and taken)
	for q in [2, 0, 1, 4]:
		_loot._item(hero.world + Vector2(1.6, 0.4), q)
	_loot._gold(hero.world + Vector2(1.2, -0.8), 30)
	_loot._orb(hero.world + Vector2(-1.0, 1.0))
	await _wait(0.2)
	await _snap(dir + "/21_gear_on_the_floor.png")
	hero.auto_dir = Vector2(1, 0)
	await _wait(0.5)
	hero.auto_dir = Vector2.ZERO
	await _wait(0.6)
	await _snap(dir + "/22_taken.png")
	if _loot._body != null:
		hero.world = _spot_near(_loot._body["at"], 2.5, hero.world)
		await _wait(0.3)
		await _snap(dir + "/23_the_fallen_wordsmith.png")
		hero.world = _loot._body["at"] + Vector2(0.6, 0.6)
		await _wait(0.4)
		await _snap(dir + "/24_searched.png")
	_inv.toggle()
	await _wait(0.2)
	_inv._hover = {"item": _loot.gear["mainhand"], "at": Vector2(140, 60)}
	_inv.queue_redraw()
	await _snap(dir + "/25_gear_screen.png")
	_inv._hover = {}
	# (the ring lit, as the wordsmith in town lights it: until it is, his moves have no slots)
	_loot.ring_lit = true
	_loot.derive()
	loot.words["power"] += 1
	_inv._press("front", null)
	_loot.gain_xp(_loot.xp_to_next(1) + 10)
	await _wait(0.2)
	await _snap(dir + "/26_power_in_strike_and_a_level.png")
	_inv._press("attr", "str")
	_loot.words["power"] += 1
	_inv._press("burn", null)
	_inv._press("worn", "mainhand")
	await _wait(0.2)
	_inv._hover = {"item": _loot.gear["mainhand"], "at": Vector2(140, 60)}
	_inv.queue_redraw()
	await _snap(dir + "/27_power_burned_into_the_sword.png")
	_inv.toggle()
	print("LOOT: level ", _loot.level, " gold ", _loot.gold, " bag ", _loot.bag.size(), " worn ", _loot.gear.values().filter(func(i): return i != null).size(), " strike ", hero.strike_words, " stats ", hero.stats)


## SHOT MODE, THE TOWN AND THE FIRST QUEST: the town as he comes into it; up to the wordsmith, and what he asks; down the
## stairs to floor 1; the fallen wordsmith searched; up through the gate; the stone given and the ring lighting; the word
## given and the gear screen opened on it; the armourer's shelf, and a piece bought.
func _town_shots(h: Hero, dir: String) -> void:
	await _wait(1.2)
	await _snap(dir + "/30_town.png")
	h.walked = 5.0
	var smith := Vector2(9.5, 14.5)
	h.world = _spot_near(smith, 1.4, h.world)
	await _wait(0.6)
	await _snap(dir + "/31_up_to_the_wordsmith.png")
	town._do("talk")
	await _wait(0.3)
	await _snap(dir + "/32_what_he_asks.png")
	_hud.words = ""
	go_to("floor1", "stairs")
	await _wait(1.4)
	await _snap(dir + "/33_floor1_by_its_gate.png")
	var b = loot._body
	if b != null:
		h.world = _spot_near(b["at"], 3.0, h.world)
		await _wait(0.4)
		await _snap(dir + "/34_someone_fell_here.png")
		h.world = b["at"] + Vector2(0.5, 0.5)
		await _wait(0.4)
		await _snap(dir + "/35_the_stone.png")
	var t0: Array = _gate["tiles"][1]
	h.world = Vector2(t0[0] + 0.5, t0[1] + 0.5)
	await _wait(1.4)
	await _snap(dir + "/36_back_in_town.png")
	h.world = _spot_near(smith, 1.4, h.world)
	await _wait(0.4)
	town._do("give")
	await _wait(1.6)
	await _snap(dir + "/37_the_stone_laid_in.png")
	await _wait(1.6)
	await _snap(dir + "/38_the_light_runs_round.png")
	await _wait(1.0)
	await _snap(dir + "/39_the_ring_flares.png")
	await _wait(1.0)
	await _snap(dir + "/40_the_word_given.png")
	_inv._press("front", null)
	_inv.toggle()
	await _wait(0.4)
	await _snap(dir + "/41_power_on_strike.png")
	loot.gold = 120
	h.world = _spot_near(Vector2(19.5, 7.5), 1.5, h.world)
	await _wait(0.4)
	await _snap(dir + "/42_by_the_armourer.png")
	town._do("armourer")
	await _wait(0.3)
	_inv._press("buy", 3)
	await _wait(0.2)
	await _snap(dir + "/43_the_armourers_shelf.png")
	_inv.toggle()
	print("TOWN: place ", place, " gold ", loot.gold, " bag ", loot.bag.size(), " ring ", loot.ring_lit, " words ", loot.words, " strike ", h.strike_words)


## THE STAIRWELL DOWN, pictured: the Warden's gate down behind him, the Warden felled, the floor of his hall breaking open
## (three moments of its film), the stairwell lying open; then onto its top step, and down to floor 2, where he comes in.
func _stair_shots(h: Hero, dir: String) -> void:
	var g: Dictionary = {}
	for q in map.doors:
		if q["kind"] == "bossgate":
			g = q
	var gm := Vector2(g["middle"]["x"], g["middle"]["y"])
	var warden: Monster = null
	for m in _monsters.list:
		if m.boss:
			warden = m
	h.world = gm + Vector2(0, -3.2 * float(g["out"]))
	h.face = Vector2(0, -float(g["out"]))
	await _wait(3.8)
	h.world = _spot_near(warden.world, 2.5, h.world)
	await _wait(0.3)
	warden.hurt(999999.0)
	await _wait(0.25)
	var st: Dictionary = map.stairs[_stairs.opened] if _stairs.opened >= 0 else {}
	print("STAIRS: opened at ", _stairs.opened, " ", st, "; the Warden fell at ", warden.world, ", walk past its top step ", [map.walk[int(st["y"]) * map.w + int(st["x"]) + 1], map.walk[int(st["y"]) * map.w + int(st["x"]) + 2]] if not st.is_empty() else [])
	await _snap(dir + "/50_the_floor_breaks.png")
	await _wait(0.8)
	await _snap(dir + "/51_breaking_open.png")
	await _wait(0.9)
	await _snap(dir + "/52_breaking_open_more.png")
	await _wait(1.7)
	print("STAIRS: after ", snappedf(_stairs.t, 0.01), " s")
	await _snap(dir + "/53_the_stairwell_open.png")
	h.world = Vector2(float(st["x"]) - 1.2, float(st["y"]) + 0.6)
	h.face = Vector2(1, 0)
	await _wait(0.3)
	await _snap(dir + "/54_at_its_top_step.png")
	h.world = Vector2(float(st["x"]) + 0.5, float(st["y"]) + 0.6)
	await _wait(1.2)
	print("DOWN: place ", place, " depth ", map.depth, " hero at ", h.world, ", ", _monsters.list.size(), " monsters")
	await _snap(dir + "/55_floor2_where_he_comes_in.png")
	h.world += Vector2(4, 0)
	await _wait(0.6)
	await _snap(dir + "/56_floor2_a_few_steps_in.png")


## FLOOR 2, THE PRISON'S GROUNDS AT NIGHT, pictured: where he comes in (the gaoler's room, indoors: the Crypt's dark), out in
## the first courtyard (the open sky's), by a courtyard's far corner (the sky over its far walls), the Headsman's yard (its own
## sky, what is beyond its walls not drawn), behind its scaffold (seen through), and the Headsman waiting at its foot.
func _floor2_shots(h: Hero, dir: String) -> void:
	await _wait(0.5)
	print("FLOOR 2: at ", h.world, " zone ", look._zone, " dark ", look._dark.material.get_shader_parameter("dark_a"), " vignette ", look.vignette_now)
	await _snap(dir + "/60_floor2_where_he_comes_in.png")
	var r: Dictionary = map.rooms[1]
	h.world = Vector2(float(r["x"]) + 7.5, float(r["y"]) + 9.5)
	await _wait(0.5)
	print("COURT: at ", h.world, " zone ", look._zone, " dark ", look._dark.material.get_shader_parameter("dark_a"), " vignette ", look.vignette_now)
	await _snap(dir + "/61_the_first_courtyard.png")
	r = map.rooms[17]
	h.world = Vector2(float(r["x"]) + 2.5, float(r["y"]) + 2.5)
	await _wait(0.5)
	print("FAR COURT: at ", h.world, " zone ", look._zone)
	await _snap(dir + "/62_by_a_far_wall_the_sky.png")
	var Y: Dictionary = look.data["zones"]["yard"]
	h.world = Vector2(float(Y["x"]) + 3.5, float(Y["y"]) + 10.5)
	h.face = Vector2(1, -1).normalized()
	await _wait(0.6)
	print("YARD: at ", h.world, " zone ", look._zone, " dark ", look._dark.material.get_shader_parameter("dark_a"))
	await _snap(dir + "/63_the_headsmans_yard.png")
	h.world = Vector2(float(Y["x"]) + 6.0, float(Y["y"]) + 4.6)
	await _wait(0.4)
	await _snap(dir + "/64_behind_the_scaffold.png")
	h.world = Vector2(float(Y["x"]) + 9.5, float(Y["y"]) + 11.0)
	await _wait(3.4)
	await _snap(dir + "/65_the_headsman.png")


## FLOOR 2'S MONSTERS' MOVES, pictured: a cultist's fire sigil (its ring under him as it casts, the pillar, the floor burning),
## a Shade's rime (and him slowed in it), the Headsman's prowl and every one of his acts (the vault's spot, the wheel, the
## flurry, the lunge, the dashes); then the game says which moves were made.
func _f2_move_shots(h: Hero, dir: String) -> void:
	var c: Monster = _nearest_kind(h.world, "cultist", 0.0)
	h.world = _spot_near(c.world, 5.0, h.world)
	h.face = (c.world - h.world).normalized()
	_monsters.wake(c)
	await _snap_when(dir + "/70_sigil_cast.png", func(): return _perils_of("sigil", -0.5, -0.2), 12.0)
	await _snap_when(dir + "/71_sigil_erupts.png", func(): return _perils_of("sigil", 0.05, 0.3), 3.0)
	await _snap_when(dir + "/72_sigil_burns.png", func(): return _perils_of("sigil", 1.2, 3.0), 3.0)
	var sh: Monster = _nearest_kind(h.world, "shade", 0.0)
	h.world = _spot_near(sh.world, 1.0, h.world)
	_monsters.wake(sh)
	await _snap_when(dir + "/73_shade_rime.png", func(): return _perils_of("rime", 0.3, 2.0), 10.0)
	print("RIME: hero slowed ", h._slow_t > 0.0, " by ", h._slow_by)
	# (the Headsman: into his yard, his gate down, his line; then his acts)
	var Y: Dictionary = look.data["zones"]["yard"]
	h.world = Vector2(float(Y["x"]) + 3.5, float(Y["y"]) + 10.5)
	await _wait(3.6)
	var hs: Monster = null
	for m in _monsters.list:
		if m.boss:
			hs = m
	print("HEADSMAN: waits ", hs.waits, " state ", hs.state, " mode ", hs.h2.mode)
	var seen := {}
	var t := 0.0
	var spots := [6.0, 3.0, 5.0, 2.0, 7.0]
	var k := 0
	while t < 60.0 and seen.size() < 6:
		if hs.h2.act == null and fmod(t, 6.0) < 0.05:
			h.world = _spot_near(hs.world, spots[k % spots.size()], h.world)
			k += 1
		if hs.h2.act != null:
			var id: String = hs.h2.ACTS[hs.h2.act["i"]]["id"]
			var at: float = hs.h2.act["t"]
			var hit: float = hs.h2.ACTS[hs.h2.act["i"]]["hit"]
			if not seen.has(id) and at >= hit * 0.8:
				seen[id] = true
				await _snap(dir + "/74_headsman_%s.png" % id)
		await get_tree().process_frame
		t += get_process_delta_time()
	print("HEADSMAN acts seen: ", seen.keys(), " after ", snappedf(t, 0.1), " s; mode now ", hs.h2.mode, "; hero life ", h.life)
	print("F2 MOVES: ", _monsters.used)


## FLOOR 2'S WAYS AND TRAPS, pictured: the floor's name as he comes in; the waypoint woken, and the warp to town and back down
## by the town's; a spike floor rising under him; a dart wall's plate and its darts; the sealed door, what it wants, and its
## seal broken by a Strike carrying POWER.
func _f2_way_shots(h: Hero, dir: String) -> void:
	await _wait(0.7)
	await _snap(dir + "/80_floor2_its_name.png")
	await _wait(3.0)
	print("WAY: awake ", _way.awake, " here ", _way.here(), " way_depth ", way_depth)
	h.world = _way.at
	await _wait(0.2)
	print("WAY: prompt ", prompt())
	await _snap(dir + "/81_on_the_waypoint.png")
	_way.warp()
	await _wait(0.12)
	await _snap(dir + "/82_the_warp.png")
	await _wait(0.4)
	print("WARP: place ", place, " hero at ", h.world, " town way awake ", _way.awake if _way != null else null, " prompt ", prompt())
	await _snap(dir + "/83_out_in_town.png")
	await _wait(0.8)
	_way.warp()
	await _wait(0.6)
	print("WARP BACK: place ", place, " hero at ", h.world)
	await _snap(dir + "/84_back_on_floor2.png")
	# (a spike floor: him on it until it rises; hurt, a sixth of his life)
	h.unhurt = false
	var sp: Dictionary = map.hazards[0]
	h.world = Vector2(float(sp["x"]) + 1.0, float(sp["y"]) + 1.5)
	var was := h.life
	await _snap_when(dir + "/85_spikes_up.png", func(): return h.life < was, 4.0)
	print("SPIKES: life ", was, " -> ", h.life, " (a sixth of ", h.max_life, ")")
	h.life = h.max_life
	# (a dart wall: on its plate, and the darts)
	var dw: Dictionary = map.hazards[2]
	h.world = Vector2(float(dw["x"]) + 0.5, float(dw["y"]) + 0.5)
	was = h.life
	await _wait(0.35)
	await _snap(dir + "/86_darts_fly.png")
	await _wait(1.6)
	print("DARTS: life ", was, " -> ", h.life)
	h.life = h.max_life
	h.unhurt = true
	# (the sealed door)
	var wd: Dictionary = {}
	for d in map.doors:
		if d["kind"] == "worddoor":
			wd = d
	var mid := Vector2(wd["middle"]["x"], wd["middle"]["y"])
	# (out of its room: `out` the way out of it, along the axis across its doorway)
	var out := Vector2(0, float(wd["out"])) if wd["alongX"] else Vector2(float(wd["out"]), 0)
	for m in _monsters.list:
		if is_instance_valid(m) and not m.dead and m.world.distance_to(mid) < 10.0:
			m.hurt(999999.0)
	h.world = mid + out * 4.0
	await _wait(0.6)
	print("SEALED: walk ", map.walk[int(wd["way"][0])], " shut ", map.shut[int(wd["way"][0])], " told ", wd.get("told", false))
	await _snap(dir + "/87_a_sealed_door.png")
	h.world = mid + out * 1.3
	h.face = -out
	h.loadout.set_level(maxi(1, h.loadout.level), true)
	h.loadout.put(0, "front", "power")
	await _wait(0.2)
	h._begin_strike()
	await _wait(0.6)
	print("SEAL: hero at ", h.world, " facing ", h.face, " door at ", mid)
	print("SEAL: want ", wd["want"], " walk ", map.walk[int(wd["way"][0])], " shut ", map.shut[int(wd["way"][0])])
	await _snap(dir + "/88_the_seal_breaks.png")


func _perils_of(kind: String, t0: float, t1: float) -> bool:
	for p in _monsters.perils.list:
		if p["kind"] == kind and p["t"] >= t0 and p["t"] <= t1:
			return true
	return false


## (A TEST: a real right-button press sent through Godot's input, as a mouse would send it, and what he does with it.)
## THE DOORS, pictured: the first room's door shut with him short of it (and what is in that room out of his reach), then swung
## open as he comes within 2.6 tiles; the Warden's gate falling behind him in the hall, the Warden waiting ("Not yet"), his
## line and his name, then fighting; the gate rising once he is dead.
func _door_shots(h: Hero, dir: String) -> void:
	var d: Dictionary = map.doors[0]
	var mid := Vector2(d["middle"]["x"], d["middle"]["y"])
	var r: Dictionary = map.room(int(d["room"]))
	h.world = mid + Vector2(0, 3.6)
	h.face = Vector2(0, -1)
	await _wait(0.6)
	var inside := 0
	var held := 0
	for m in _monsters.list:
		if FloorMap.in_room(r, m.world):
			inside += 1
			if _monsters.shut_in(m):
				held += 1
	print("DOOR 0 shut: open ", d["open"], " shut tile ", map.shut[int(d["way"][0])], "; ", inside, " in its room, ", held, " out of reach")
	await _snap(dir + "/40_door_shut.png")
	h.world = mid + Vector2(0, 2.2)
	await _wait(0.12)
	await _snap(dir + "/41_door_swinging.png")
	await _wait(0.5)
	print("DOOR 0 near: open ", d["open"], " shut tile ", map.shut[int(d["way"][0])], ", out of reach now ", _monsters.shut_in(_nearest_in(r)) if _nearest_in(r) != null else "-")
	await _snap(dir + "/42_door_open.png")
	# (the Warden's gate)
	var g: Dictionary = {}
	for q in map.doors:
		if q["kind"] == "bossgate":
			g = q
	var gm := Vector2(g["middle"]["x"], g["middle"]["y"])
	var warden: Monster = null
	for m in _monsters.list:
		if m.boss:
			warden = m
	h.world = gm + Vector2(0, -2.0 * float(g["out"]))
	h.face = Vector2(0, -float(g["out"]))
	await _wait(0.6)
	print("GATE before: open ", g["open"], ", warden waits ", warden.waits, " state ", warden.state)
	await _snap(dir + "/43_gate_up.png")
	h.world = gm + Vector2(0, -3.2 * float(g["out"]))
	await _wait(0.08)
	await _snap(dir + "/44_gate_falling.png")
	await _wait(0.3)
	warden.hurt(50.0)
	await _wait(0.1)
	print("GATE fallen: open ", g["open"], ", walk ", map.walk[int(g["tiles"][1])], ", warden waits ", warden.waits, " life ", warden.life, "/", warden.max_life)
	await _snap(dir + "/45_gate_down_not_yet.png")
	await _wait(0.9)
	await _snap(dir + "/46_his_line_and_name.png")
	await _wait(2.0)
	print("GATE after intro: warden waits ", warden.waits, " state ", warden.state)
	await _snap(dir + "/47_he_fights.png")
	warden.hurt(999999.0)
	await _wait(1.3)
	print("GATE after his death: open ", g["open"], ", walk ", map.walk[int(g["tiles"][1])])
	h.world = gm + Vector2(0, 1.5 * float(g["out"]))
	await _wait(0.3)
	await _snap(dir + "/48_gate_risen.png")


## THE CHESTS, BARRELS AND URNS, pictured: a king's coffer shut, then open with what was in it; an urn whole, then struck and
## broken; a Whirlwind through a row of them.
func _prop_shots(h: Hero, dir: String) -> void:
	var chest: Dictionary = {}
	for p in map.props:
		if p["kind"] == "chest" and chest.is_empty():
			chest = p
	var c := Vector2(chest["x"], chest["y"])
	h.world = _spot_near(c, 2.6, h.world)
	await _wait(0.6)
	await _snap(dir + "/50_chest_shut.png")
	h.world = _spot_near(c, 1.3, h.world)
	await _wait(1.0)
	print("CHEST: state ", chest["state"], ", ", loot._drops.size(), " things lie about")
	await _snap(dir + "/51_chest_open.png")
	# (the urn with the most of its kind round it)
	var best: Dictionary = {}
	var most := -1
	for p in map.props:
		if p["kind"] == "chest":
			continue
		var n := 0
		for q in map.props:
			if q["kind"] != "chest" and Vector2(q["x"], q["y"]).distance_to(Vector2(p["x"], p["y"])) < 2.6:
				n += 1
		if n > most:
			most = n
			best = p
	var u := Vector2(best["x"], best["y"])
	h.world = _spot_near(u, 1.3, h.world)
	h.face = (u - h.world).normalized()
	await _wait(0.5)
	await _snap(dir + "/52_urn_whole.png")
	var walk_was := map.walk[int(best["ty"]) * map.w + int(best["tx"])]
	h.auto_attack = true
	await _wait(0.9)
	h.auto_attack = false
	print("URN: ", best["kind"], " state ", best["state"], ", its tile walkable ", walk_was, " -> ", map.walk[int(best["ty"]) * map.w + int(best["tx"])])
	await _snap(dir + "/53_urn_broken.png")
	h.auto_whirl = true
	await _wait(1.2)
	h.auto_whirl = false
	var broken := 0
	for p in map.props:
		if p["kind"] != "chest" and int(p["state"]) == 1:
			broken += 1
	print("WHIRL: ", broken, " broken in all")
	await _wait(0.3)
	await _snap(dir + "/54_whirled_through.png")


func _nearest_in(r: Dictionary) -> Monster:
	for m in _monsters.list:
		if FloorMap.in_room(r, m.world) and not m.dead:
			return m
	return null


## THE MUSIC, checked: the town's walk; floor 1's walk; a fight's coming in near a monster awake, from its "fight in at";
## its going 4 s after the last of them has gone to sleep or fallen, and the walk back.
func _music_test(h: Hero) -> void:
	await _wait(1.0)
	_music_said("town, 1 s in")
	go_to("floor1", "stairs")
	await _wait(1.6)
	_music_said("floor 1, come in")
	var m := _nearest_kind(h.world, "skeleton", 0.0)
	var came := h.world
	h.world = _spot_near(m.world, 3.0, h.world)
	await _wait(0.4)
	_music_said("by a skeleton, 0.4 s")
	await _wait(1.0)
	_music_said("by a skeleton, 1.4 s")
	for x in _monsters.list:
		if not x.dead and x.state != "sleep":
			x.hurt(99999.0)
	h.world = came
	await _wait(2.0)
	_music_said("all fallen, 2 s")
	await _wait(2.6)
	_music_said("all fallen, 4.6 s")
	await _wait(1.6)
	_music_said("all fallen, 6.2 s")


func _music_said(when: String) -> void:
	var said := []
	for t in music.get_children():
		said.append("%s %s gain %.2f at %.2f s" % [t.stream.resource_path.get_file(), "playing" if t.playing else "stopped", t.gain, t.get_playback_position()])
	print("MUSIC ", when, ": fight ", music.fighting(), ", in fight ", _in_fight(), " | ", ", ".join(said))


func _rmb_test(h: Hero, dir: String) -> void:
	# (set down near a pack of skeletons, so the spin has something to cut)
	var skel := _nearest_kind(h.world, "skeleton", 12.0)
	if skel != null:
		h.world = _spot_near(skel.world, 2.5, h.world)
	await _wait(1.2)
	var e := InputEventMouseButton.new()
	e.button_index = MOUSE_BUTTON_RIGHT
	e.pressed = true
	e.position = get_viewport().get_visible_rect().size / 2.0 + Vector2(60, 20)
	e.global_position = e.position
	Input.parse_input_event(e)
	var n0 := _alive()
	for i in 90:
		await get_tree().process_frame
		if i % 15 == 0:
			print("RMB held frame ", i, " act=", h._act, " cuts=", h._bites, " spun=", snappedf(h._spun, 0.01), " facing=", h.face.snapped(Vector2(0.01, 0.01)))
		if i == 20:
			await _snap(dir + "/rmb_spin_a.png")
		if i == 30:
			await _snap(dir + "/rmb_spin_b.png")
	var up := e.duplicate()
	up.pressed = false
	Input.parse_input_event(up)
	for i in 30:
		await get_tree().process_frame
	print("RMB let go: act=", h._act, " cuts=", h._bites, " wait=", snappedf(h._whirl_cd, 0.01), " of ", snappedf(h._whirl_full, 0.01), "; monsters down ", n0 - _alive())


## SHOT MODE, EVERY FLOOR THAT IS IN (--only=floors [--floor=N]): each come into as from the floor above, pictured where he
## comes in, in the middle of its biggest room, before the boss's gate and in the boss's hall; what stands and fights there
## is as the floor has it (he is not to be harmed).
func _floor_shots(h: Hero, dir: String) -> void:
	var only := int(_arg("floor")) if _arg("floor") != "" else 0
	for n in range(1, FLOORS + 1):
		if not has_floor(n) or (only != 0 and n != only):
			continue
		go_to("floor%d" % n, "down" if n > 1 else "start")
		await _wait(1.6)
		await _snap(dir + "/f%d_1_in.png" % n)
		if _arg("debug") != "":
			var st = h.get_parent()
			var faint := 0
			var near := []
			for i in st._walls.size():
				if st._walls[i].modulate.a < 0.99:
					faint += 1
				var top: Vector2 = st._tops[i]
				if absf(top.x - h.position.x) < 200 and absf(top.y - h.position.y) < 200 and near.size() < 12:
					near.append([st._depths[i], top - h.position, st._walls[i].modulate.a])
			print("DEBUG walls ", st._walls.size(), " faint ", faint, " hero depth ", h.world.x + h.world.y, " pos ", h.position, " near ", near)
		var big: Dictionary = {}
		var boss: Dictionary = {}
		for r in map.rooms:
			if r["kind"] == "boss":
				boss = r
			elif r["kind"] == "normal" and (big.is_empty() or float(r["w"]) * float(r["h"]) > float(big["w"]) * float(big["h"])):
				big = r
		if not big.is_empty():
			h.world = _free_near(Vector2(float(big["x"]) + float(big["w"]) / 2.0, float(big["y"]) + float(big["h"]) / 2.0))
			await _wait(1.2)
			await _snap(dir + "/f%d_2_room.png" % n)
		if not boss.is_empty():
			h.world = _free_near(Vector2(float(boss["x"]) + float(boss["w"]) / 2.0, float(boss["y"]) + float(boss["h"]) / 2.0))
			await _wait(1.5)
			await _snap(dir + "/f%d_3_boss.png" % n)
		var bl: Vector2i = look.blocks_in() if look != null else Vector2i.ZERO
		print("FLOOR %d: %s, %d monsters, %d doors, way on: %s%s" % [n, place_title(), _monsters.list.size(), map.doors.size(), ways.way_kind() if ways != null else ("stair" if _stairs != null else "-"), (", the ground's blocks fetched: %d of %d" % [bl.x, bl.y]) if bl.y > 0 else ""])


## SEEN THROUGH (look.gd _see_through2; render.ts seeThrough): on each of the open floors (or --floor), the hero set down
## where a tall thing in front of him covers him (the walkable tile nearest his way in that has one), pictured; then on open
## ground with nothing over him. One line a floor, SEETHROUGH.
func _seethrough_shots(h: Hero, dir: String) -> void:
	var only := int(_arg("floor")) if _arg("floor") != "" else 0
	for n in range(6, FLOORS + 1):
		if not has_floor(n) or (only != 0 and n != only):
			continue
		go_to("floor%d" % n, "down")
		await _wait(1.0)
		var start: Vector2 = h.world
		var best := Vector2.INF
		var under: Array = []
		var clear := Vector2.INF
		for y in map.h:
			for x in map.w:
				if map.walk[y * map.w + x] == 0:
					continue
				var w := Vector2(x + 0.5, y + 0.5)
				var c: Array = look.covering(w)
				if not c.is_empty() and (best == Vector2.INF or w.distance_to(start) < best.distance_to(start)):
					best = w
					under = c
				elif c.is_empty() and (clear == Vector2.INF or w.distance_to(start) < clear.distance_to(start)):
					clear = w
		if best == Vector2.INF:
			print("SEETHROUGH floor %d: no tile he can stand on has a tall thing in front of him" % n)
			continue
		h.world = best
		await _wait(0.4)
		var thin: int = look.seen_through()
		await _snap(dir + "/st%d_behind.png" % n)
		h.world = clear
		await _wait(0.4)
		print("SEETHROUGH floor %d: behind %d tall things at (%.1f, %.1f): %d seen through; on open ground: %d" % [n, under.size(), best.x, best.y, thin, look.seen_through()])


## The nearest place to `at` a body may stand.
func _free_near(at: Vector2) -> Vector2:
	for r in range(0, 12):
		for dy in range(-r, r + 1):
			for dx in range(-r, r + 1):
				if maxi(absi(dx), absi(dy)) != r:
					continue
				var tx := floori(at.x) + dx
				var ty := floori(at.y) + dy
				if map.walkable(tx, ty):
					return Vector2(tx + 0.5, ty + 0.5)
	return at


## Can a body walk from `from` to the room `r` (four ways, over the walk grid as it is now, through doors that open of
## themselves: a door's tile is in the walk grid, shut or not)?
func _walks_to(from: Vector2, r: Dictionary) -> bool:
	var seen := PackedByteArray()
	seen.resize(map.w * map.h)
	var q := PackedInt32Array([floori(from.y) * map.w + floori(from.x)])
	seen[q[0]] = 1
	var head := 0
	while head < q.size():
		var i := q[head]
		head += 1
		var tx := i % map.w
		var ty := i / map.w
		if FloorMap.in_room(r, Vector2(tx + 0.5, ty + 0.5)):
			return true
		for dxy in [Vector2i(1, 0), Vector2i(-1, 0), Vector2i(0, 1), Vector2i(0, -1)]:
			var nx: int = tx + dxy.x
			var ny: int = ty + dxy.y
			if nx < 0 or ny < 0 or nx >= map.w or ny >= map.h:
				continue
			var j := ny * map.w + nx
			if seen[j] == 0 and map.walk[j] != 0:
				seen[j] = 1
				q.append(j)
	return false


## SHOT MODE, THE GATES OF A FLOOR (--only=gates --floor=N): whether the boss's hall can be walked to as he comes in; the
## lever's gate seen down (its line), its lever walked up to (the gate rises); a room that locks walked into (its gates
## fall), its pack struck dead (they rise); floor 5's temple door come to without its keys (its line), a key taken, and
## another, and come to again (its chains fall, its leaves swing open); and whether the boss's hall can be walked to then.
func _gate_shots(h: Hero, dir: String) -> void:
	var n := int(_arg("floor")) if _arg("floor") != "" else 3
	go_to("floor%d" % n, "down" if n > 1 else "start")
	await _wait(1.4)
	var tag := dir + "/g%d_" % n
	var hall: Dictionary = {}
	for r in map.rooms:
		if r.get("kind", "") == "boss":
			hall = r
	var said: Array = ["the boss's hall walked to as he comes in: %s" % _walks_to(h.world, hall)]
	for m in _monsters.list:
		if is_instance_valid(m) and not m.boss:
			m.state = "sleep"
	# --- the lever's gate
	for d in map.doors:
		if d["kind"] != "gate":
			continue
		var mid := Vector2(d["middle"]["x"], d["middle"]["y"])
		# (before it, outside the room it bars)
		var out := mid + (Vector2(0, d["out"]) if d["alongX"] else Vector2(d["out"], 0)) * 2.5
		h.world = _free_near(out)
		await _wait(0.6)
		await _snap(tag + "1_the_gate_down.png")
		said.append("the gate: want %d, its tiles walked %s, told %s" % [int(d["want"]), [map.walk[int(d["tiles"][0])], map.walk[int(d["tiles"][1])]], d.get("told", false)])
		for p in map.props:
			if p["kind"] == "lever" and p.get("name", "") != "crank":
				h.world = _free_near(Vector2(p["x"], p["y"]) + Vector2(2.6, 0))
				await _wait(0.5)
				await _snap(tag + "2_the_lever.png")
				var at := Vector2(p["x"], p["y"])
				var best := h.world
				for ty in range(floori(at.y) - 1, floori(at.y) + 2):
					for tx in range(floori(at.x) - 1, floori(at.x) + 2):
						if map.walkable(tx, ty) and Vector2(tx + 0.5, ty + 0.5).distance_to(at) < best.distance_to(at):
							best = Vector2(tx + 0.5, ty + 0.5)
				h.world = best
				await _wait(0.5)
				await _snap(tag + "3_the_lever_pulled.png")
				said.append("the lever %.1f off: state %d" % [h.world.distance_to(at), int(p["state"])])
		h.world = _free_near(out)
		await _wait(1.3)
		await _snap(tag + "4_the_gate_up.png")
		said.append("the gate: want %d open %.2f, its tiles walked %s" % [int(d["want"]), float(d["open"]), [map.walk[int(d["tiles"][0])], map.walk[int(d["tiles"][1])]]])
	# --- a room that locks
	for r in map.rooms:
		if not r.get("locks", false):
			continue
		var pack: Array = []
		for m in _monsters.list:
			if is_instance_valid(m) and not m.dead and m.pack_id >= 0 and m.pack_id < map.packs.size() and int(map.packs[m.pack_id]) == int(r["id"]):
				pack.append(m)
		h.world = _free_near(Vector2(r["x"] + r["w"] / 2.0, r["y"] + r["h"] / 2.0))
		await _wait(0.8)
		await _snap(tag + "5_the_room_locks.png")
		var gates: Array = []
		for d in map.doors:
			if d["kind"] == "trapgate" and int(d["room"]) == int(r["id"]):
				gates.append(int(d["want"]))
		said.append("the room that locks (%d of its pack): its gates want %s" % [pack.size(), gates])
		for m in pack:
			if is_instance_valid(m):
				m.hurt(1e9)
		await _wait(1.5)
		await _snap(tag + "6_its_pack_dead.png")
		gates = []
		for d in map.doors:
			if d["kind"] == "trapgate" and int(d["room"]) == int(r["id"]):
				gates.append(int(d["want"]))
		said.append("its pack dead: its gates want %s" % [gates])
	# --- floor 5's temple door
	if temple != null:
		var d: Dictionary = map.doors[int(map.temple["door"])]
		var mid := Vector2(d["middle"]["x"], d["middle"]["y"])
		var out := mid + (Vector2(0, d["out"]) if d["alongX"] else Vector2(d["out"], 0)) * 2.0
		h.world = _free_near(out)
		await _wait(0.7)
		await _snap(tag + "7_the_temple_door_barred.png")
		said.append("the temple door: told %s keys %d, walked %s" % [temple.told, temple.keys, map.walk[int(d["tiles"][1])]])
		# (its two keybearers struck dead, each key walked to where it lies; were they not on the floor, the keys are given)
		var bearers: Array = []
		for m in _monsters.list:
			if is_instance_valid(m) and (m.kind == "keyblade" or m.kind == "keyflame"):
				bearers.append(m)
		for m in bearers:
			h.world = _free_near(m.world + Vector2(2.0, 0.0))
			await _wait(0.3)
			m.hurt(1e9)
			await _wait(1.3)
			for at in Monster.Keybearers.keys_lying(_monsters):
				h.world = at
				await _wait(0.4)
			await _snap(tag + "7%s_a_key_taken_%s.png" % ["b" if m.kind == "keyblade" else "c", m.kind])
		said.append("its keybearers: %d; keys held %d" % [bearers.size(), temple.keys])
		while temple.keys < temple.need:
			_monsters.quest_item.emit("key", h.world)
			await _wait(0.2)
		h.world = _free_near(out)
		for k in [[0.9, "8a_its_first_chain"], [1.2, "8b_its_second_chain"], [1.3, "8c_its_leaves_swing"], [1.4, "8d_the_temple_open"]]:
			await _wait(k[0])
			await _snap(tag + "%s.png" % k[1])
		said.append("with both keys: keys %d, open %s, walked %s" % [temple.keys, temple.open, map.walk[int(d["tiles"][1])]])
	# --- floor 3's furnace: the fire in the hall's way, the crank without its gear, the gear taken, the crank turned
	if furnace != null and not furnace._door.is_empty():
		var d: Dictionary = furnace._door
		var mid := Vector2(d["middle"]["x"], d["middle"]["y"])
		var out := mid + (Vector2(0, d["out"]) if d["alongX"] else Vector2(d["out"], 0)) * 2.5
		h.world = _free_near(out)
		await _wait(0.7)
		await _snap(tag + "7_fire_bars_the_hall.png")
		said.append("the fire: told %s, its way walked %s, the hall walked to %s" % [furnace.told, map.walk[int(d["tiles"][1])], _walks_to(h.world, hall)])
		var c := Vector2(furnace._crank["x"], furnace._crank["y"])
		var by := _free_near(c + Vector2(0.9, 0.4))
		h.world = by
		await _wait(0.6)
		await _snap(tag + "8a_the_crank_without_its_gear.png")
		said.append("the crank %.1f off without the gear: step '%s', told %s" % [by.distance_to(c), furnace.step, furnace.told_crank])
		# (the gear: from the Stoker himself: he is struck dead, his gear lies where his death leaves it, and the hero walks to it)
		var keeper = null
		for m in _monsters.list:
			if is_instance_valid(m) and m.kind == "stoker" and not m.dead:
				keeper = m
		if keeper != null:
			h.world = _spot_near(keeper.world, 3.0, h.world)
			await _wait(0.2)
			keeper.hurt(1e9)
			await _wait(4.6)
			await _snap(tag + "8b_the_stoker_fallen_his_gear.png")
			for g in _monsters.perils.get_children():
				if g.get("at") != null:
					h.world = g.at
			await _wait(0.4)
			said.append("the Stoker dead %s; the gear taken from where he fell: step '%s'" % [keeper.dead, furnace.step])
		else:
			h.world = _free_near(c + Vector2(4.0, 0.0))
			await _wait(0.2)
			_monsters.quest_item.emit("gear", h.world)
			await _wait(0.4)
		h.world = _free_near(c + Vector2(4.0, 0.0))
		await _wait(0.3)
		await _snap(tag + "8b_the_gear_set_in.png")
		h.world = by
		for k in [[0.5, "8c_the_crank_turning"], [1.3, "8d_the_furnace_going_out"], [1.4, "8e_the_furnace_out"]]:
			await _wait(k[0])
			await _snap(tag + "%s.png" % k[1])
		said.append("the crank turned: step '%s', gone %s" % [furnace.step, furnace.gone])
		h.world = _free_near(out)
		await _wait(0.6)
		await _snap(tag + "9_the_way_open.png")
		said.append("the fire's way walked %s" % map.walk[int(d["tiles"][1])])
	said.append("the boss's hall walked to now: %s" % _walks_to(h.world, hall))
	print("GATES floor %d: %s" % [n, "; ".join(said)])


## SHOT MODE, ONE KIND OF MONSTER'S OWN MOVES (--only=kind --floor=N --kind=brute|boneward|priest|dagger|stoker|keyblade|...
## [--away=4] [--secs=14]): the one of that kind nearest the way in (a brute that is no champion: the green troll) is left
## alone on the floor, the hero set down in sight of it, unharmed, far and then near as its moves want; each move pictured at
## its moments (a kind with rules of its own: each of its moves pictured twice, 0.5 s in, as mgr.used counts it); then, for
## the Boneward, a blow from before its shield (it glances off) and one from behind (it lands); for a kind with rules of its
## own, it is struck dead, pictured fallen, and the hero walked to where it fell (what it leaves is taken up). Says which
## moves were made.
func _kind_shots(h: Hero, dir: String) -> void:
	var n := int(_arg("floor")) if _arg("floor") != "" else 3
	var kind := _arg("kind") if _arg("kind") != "" else "brute"
	go_to("floor%d" % n, "down" if n > 1 else "start")
	await _wait(1.4)
	if sight != null:
		sight.see_all()
	var m: Monster = null
	for o in _monsters.list:
		if is_instance_valid(o) and not o.dead and o.kind == kind and not o.champion and not o.boss and (m == null or o.world.distance_to(h.world) < m.world.distance_to(h.world)):
			m = o
	if m == null:
		print("KIND: floor %d has no %s" % [n, kind])
		return
	# (the chanter: one of the cult it would shield kept, standing still 2 tiles from it, so that its ward is seen and weighed)
	var ally: Monster = null
	if kind == "chanter":
		for o in _monsters.list:
			if is_instance_valid(o) and not o.dead and o.kind in Monster.Act1.WARD["kinds"] and (ally == null or o.world.distance_to(m.world) < ally.world.distance_to(m.world)):
				ally = o
	# (FLOORS 9 AND 10: the fog wolf with three of its pack, so that the pack's ring and its turns are seen)
	var pack: Array = []
	if kind == "wolf":
		for o in _monsters.list:
			if is_instance_valid(o) and o != m and not o.dead and o.kind == "wolf" and o.pack_id == m.pack_id and pack.size() < 3:
				pack.append(o)
	for o in _monsters.list:
		if is_instance_valid(o) and o != m and o != ally and not pack.has(o):
			o.queue_free()
	if ally != null:
		ally.world = _free_near(m.world + Vector2(1.4, 1.4))
		ally.rise(1e9)
	# (in the middle of the biggest room near it, so that there is room for a run and a throw; one with rules of its own stays
	# where the floor has it: the Stoker in his arena, a keybearer in its room)
	var own: bool = Monster.BOSS_AI.has(kind)
	var room: Dictionary = {}
	for r in map.rooms:
		if FloorMap.in_room(r, m.world):
			room = r
	var big: Dictionary = room
	for r in map.rooms:
		if r.get("kind", "") != "boss" and (big.is_empty() or r["w"] * r["h"] > big["w"] * big["h"]):
			big = r
	if not own:
		m.world = _free_near(Vector2(big["x"] + big["w"] / 2.0, big["y"] + big["h"] / 2.0))
	var P := _monsters.perils
	var tag := dir + "/k%d_%s_" % [n, kind]
	var plans := {
		"brute": [[7.5, 3.2], [7.0, 6.0], [1.8, 9.0]],
		"boneward": [[5.5, 6.0], [1.5, 5.0], [6.5, 8.0], [1.5, 4.0]],
		"priest": [[6.0, 6.0], [2.4, 9.0]],
		"dagger": [[2.0, 9.0]],
		# (the Knife: set down again 4.2 off every 4 s, so that he throws and leaps as well as stabs; the Flame: within his
		# ring's reach)
		"keyblade": [[4.0, 6.0], [4.2, 4.0], [4.2, 4.0], [4.2, 4.0], [4.2, 4.0], [4.2, 4.0]],
		"keyflame": [[3.0, 25.0]],
		# (the Stoker: far for his coals, near for his rake; then put to under a third of his life, so that his furnace bursts:
		# a third number in a plan is the share of its life it is put to as that part begins)
		"stoker": [[5.0, 8.0], [3.0, 8.0], [4.0, 12.0, 0.3]],
		# (FLOORS 6 TO 8'S COMMON MONSTERS, each by rules of its own: near for its blow, further off for what it throws)
		"qgolem": [[1.6, 7.0], [5.0, 9.0]], "rubbling": [[0.7, 6.0]], "firepot": [[5.0, 9.0]], "chanter": [[5.0, 9.0]],
		"vulture": [[3.0, 14.0]], "crawler": [[1.3, 14.0]], "devil": [[1.8, 10.0]], "scorpion": [[1.6, 6.0], [4.0, 10.0]],
		# (FLOORS 9 AND 10'S, and floor 9's two side bosses: near for the blow, further off for the charge, the retch, the rush,
		# the lunge; long enough for each side boss's slower moves to come round)
		"wolf": [[4.0, 14.0]], "deer": [[1.4, 5.0], [5.0, 9.0], [5.5, 6.0]], "leech": [[1.0, 12.0]], "spawn": [[1.2, 5.0], [2.0, 12.0]],
		"drowned": [[2.0, 16.0]], "warchief": [[5.0, 10.0], [3.0, 14.0], [5.5, 10.0], [3.0, 12.0]],
		"mistwolf": [[3.0, 12.0], [3.5, 14.0], [2.5, 16.0]],
	}
	var marks := {
		"brute": {
			"rush_lane": func(): return _has(P, "lane", 0.6), "rush_run": func(): return m.state == "charge", "rush_stop": func(): return m._rush_stop > 0.4,
			"rampage_swing_1": func(): return _monsters.used.get("rampage_swing", 0) >= 1, "rampage_swing_2": func(): return _monsters.used.get("rampage_swing", 0) >= 2,
			"rampage_ring_marked": func(): return _has(P, "warn", 0.5), "rampage_slam": func(): return _has(P, "ring", 0.04),
		},
		"boneward": {
			"thrust": func(): return not m.bare and m.state == "recover" and m._move >= 0 and m._moves[m._move]["id"] == "swing",
			"spear_thrown": func(): return _flying("spear"), "spear_lies": func(): return _has(P, "spear", 0.3),
			"shield_bash": func(): return m.bare and m.state == "recover", "stoops": func(): return m.state == "pickup" and m._t < 0.55,
		},
		"priest": {
			"fire_bolt": func(): return _flying("bolt"), "censer_swung": func(): return _has(P, "smoke", 0.05), "smoke_burns": func(): return _has(P, "smoke", 1.2),
		},
		"dagger": {
			"frenzy_coiled": func(): return m.state == "windup" and m._t < 0.8, "frenzy_stab_2": func(): return _monsters.used.get("frenzy_stab", 0) >= 2,
			"frenzy_stab_4": func(): return _monsters.used.get("frenzy_stab", 0) >= 4, "winded": func(): return m.state == "recover" and m._t < 0.9,
		},
		# (the keybearers': what they throw and leave, seen in flight and burning, beside each of their moves)
		"keyflame": {
			"ring_of_fire": func(): return _has(P, "kb_ring", 0.3), "fire_balls": func(): return _has(P, "kb_ball", 0.3), "sigil_burns": func(): return _has(P, "kb_sigil", 0.7),
		},
		"keyblade": {
			"knife_flies": func(): return _has(P, "kb_knife", 0.1),
		},
		# (the Stoker's fire: his coals marked, in the air and burning; the sheet behind his rake; his furnace's ring rolling out)
		"stoker": {
			"coals_marked": func(): return _has(P, "st_coals", 1.5), "coals_in_the_air": func(): return _has(P, "st_coals", 2.25), "coals_burn": func(): return _has(P, "st_coals", 3.0),
			"rake_marked": func(): return _has(P, "st_rake", 0.8), "rake_fire": func(): return _has(P, "st_rake", 1.3), "rake_burns": func(): return _has(P, "st_rake", 2.0),
			"ring_marked": func(): return _has(P, "st_ring", 1.2), "ring_rolls": func(): return _has(P, "st_ring", 1.75),
		},
		# (floors 6 to 8's: what each lays on the floor and throws, as it comes, flies and lands: scripts/act1/marks.gd)
		"qgolem": {
			"hammer_marked": func(): return _has(P, "warn", 0.3), "quake": func(): return _a1(P, "qgolem:quake", func(p): return p["t"] >= 0.1),
			"boulder_lane": func(): return _a1(P, "qgolem:boulder", func(p): return p["t"] >= -0.3),
			"boulder_rolls": func(): return _a1(P, "qgolem:boulder", func(p): return p["t"] >= 0.05 and p["hit"] >= 1e9),
			"boulder_smash": func(): return _a1(P, "qgolem:boulder", func(p): return p["hit"] < 1e9 and p["t"] - p["hit"] >= 0.12),
		},
		"rubbling": {
			"a_pile": func(): return int(m.h2.a1.get("pile", 0)) == 1,
			"climbs_out": func(): return m.state == "act" and m.h2.act != null and m.h2.act["i"] == 1 and m.h2.act["t"] > 0.35,
		},
		"firepot": {
			"pot_flies": func(): return _a1(P, "firepot:pot", func(p): return p["t"] >= 0.35 and p["t"] < p["hit"]),
			"pot_bursts": func(): return _a1(P, "firepot:pot", func(p): return p["t"] - p["hit"] >= 0.15),
			"floor_burns": func(): return _a1(P, "firepot:pot", func(p): return p["t"] - p["hit"] >= 2.0),
		},
		"chanter": {
			"ward": func(): return _a1(P, "chanter:ward"), "ring": func(): return _a1(P, "chanter:chain", func(p): return p["t"] >= -0.25),
			"lightning": func(): return _a1(P, "chanter:chain", func(p): return p["done"] == 1 and p["t"] >= 0.05),
			"static": func(): return _a1(P, "chanter:chain", func(p): return p["d"] == 1 and p["t"] >= 0.2),
		},
		"vulture": {
			"aloft": func(): return m.state == "chase" and float(m.h2.a1.get("lift", 0.0)) >= 25.0,
			"dive_line": func(): return m.h2.act != null and m.h2.act["t"] >= 0.4, "stoops": func(): return m.h2.act != null and m.h2.act["t"] >= 0.62,
			"pulls_out": func(): return m.h2.act != null and m.h2.act["t"] >= 0.95,
		},
		"crawler": {
			"under_the_lip": func(): return int(m.h2.a1.get("hid", 0)) == 1,
			"climbs": func(): return int(m.h2.a1.get("hid", 0)) == 2 and m.h2.act != null and m.h2.act["t"] >= 0.5,
			"leap_ring": func(): return _a1(P, "crawler:leap") and m.h2.act != null and m.h2.act["t"] >= 0.45,
			"grabbed": func(): return int(m.h2.a1.get("grab", 0)) == 1 and m.h2.act != null and m.h2.act["t"] >= 1.0,
		},
		"devil": {
			"twister_spins_up": func(): return _a1(P, "devil:twister") and m.h2.act != null and m.h2.act["t"] >= 0.6,
			"twister": func(): return _a1(P, "devil:twister") and m.h2.act != null and m.h2.act["t"] >= 2.05,
		},
		"scorpion": {
			"glob_flies": func(): return _a1(P, "scorpion:glob", func(p): return p["t"] >= 0.25 and p["t"] < p["hit"]),
			"acid_pool": func(): return _a1(P, "scorpion:glob", func(p): return p["t"] - p["hit"] >= 0.6),
		},
		# (floors 9 and 10's: what each lays and throws, and how it stands, as it comes: scripts/act1/marks9.gd)
		"wolf": {
			"on_the_ring": func(): return m.state == "chase" and float(m.h2.a1.get("held", 0.0)) >= 0.3,
			"crouched": func(): return m.h2.act != null and m.h2.act["t"] >= 0.4, "leaps": func(): return m.h2.act != null and m.h2.act["t"] >= 0.6,
			"landed": func(): return m.h2.act != null and m.h2.act["t"] >= 1.0,
		},
		"deer": {
			"lane_marked": func(): return _a1(P, "deer:charge", func(p): return p["t"] >= 0.6), "charges": func(): return _a1(P, "deer:charge", func(p): return p["t"] >= 1.12),
			"hedge_bursts": func(): return _a1(P, "deer:charge", func(p): return p["t"] >= 1.6), "hedge_stands": func(): return _a1(P, "deer:charge", func(p): return p["t"] >= 3.0),
			"hedge_withers": func(): return _a1(P, "deer:charge", func(p): return p["t"] >= 5.35),
		},
		"leech": {
			"springs": func(): return m.state == "act" and m.h2.act != null and m.h2.act["t"] >= 0.56 and m.h2.act["t"] < 0.62,
			"latched": func(): return m.h2.latched(m) and float(m.h2.a1["held"]) >= 0.3, "drinks": func(): return m.h2.latched(m) and float(m.h2.a1["held"]) >= 2.2,
			"lets_go": func(): return m.state == "act" and m.h2.act != null and m.h2.act["t"] >= 1.35 and int(m.h2.a1.get("on", 0)) == 0,
		},
		"spawn": {
			"gaze_marked": func(): return m.state == "act" and m.h2.act != null and m.h2.act["i"] == 1 and m.h2.act["t"] >= 0.6,
			"gaze_burns": func(): return m.state == "act" and m.h2.act != null and m.h2.act["i"] == 1 and m.h2.act["t"] >= 1.35,
		},
		"drowned": {
			"under_the_water": func(): return int(m.h2.a1.get("under", 0)) == 1,
			"rises": func(): return m.state == "act" and m.h2.act != null and m.h2.act["i"] == 2 and m.h2.act["t"] >= 0.9,
			"rime": func(): return _a1(P, "drowned:rime", func(p): return p["t"] >= 0.15), "frozen_in_ice": func(): return _a1(P, "drowned:rime", func(p): return p["d"] == 1 and p["t"] >= 0.3),
			"cone_marked": func(): return _a1(P, "drowned:slick", func(p): return p["t"] >= -0.25), "gush": func(): return _a1(P, "drowned:slick", func(p): return p["t"] >= 0.12),
			"slick": func(): return _a1(P, "drowned:slick", func(p): return p["t"] >= 1.5),
		},
		"warchief": {
			"smash_marked": func(): return _a1(P, "warchief:fx:smash", func(p): return p["t"] >= 1.05), "smash_lands": func(): return _a1(P, "warchief:fx:smash", func(p): return p["t"] >= 1.42),
			"slam_marked": func(): return _a1(P, "warchief:fx:slam", func(p): return p["t"] >= 0.8), "slam_cracks": func(): return _a1(P, "warchief:fx:slam", func(p): return p["t"] >= 1.2),
			"warcry_roars": func(): return _a1(P, "warchief:fx:warcry", func(p): return p["t"] >= 1.15), "raging": func(): return _a1(P, "warchief:rage") and m.state != "act",
			"rush_lane": func(): return _a1(P, "warchief:fx:rush", func(p): return p["t"] >= 0.9), "rush_runs": func(): return _a1(P, "warchief:fx:rush", func(p): return p["t"] >= 1.35),
		},
		"mistwolf": {
			"bite_marked": func(): return _a1(P, "mistwolf:fx:bite", func(p): return p["t"] >= 0.5), "claw_marked": func(): return _a1(P, "mistwolf:fx:claw", func(p): return p["t"] >= 0.55),
			"claw_stomp": func(): return _a1(P, "mistwolf:fx:claw", func(p): return p["t"] >= 1.08), "lunge_lane": func(): return _a1(P, "mistwolf:fx:lunge", func(p): return p["t"] >= 0.6),
			"lunge_through": func(): return _a1(P, "mistwolf:fx:lunge", func(p): return p["t"] >= 0.82), "cloud": func(): return _a1(P, "mistwolf:fx:cloud", func(p): return p["t"] >= 1.1),
			"cloud_claws": func(): return _a1(P, "mistwolf:fx:cloud", func(p): return p["d"] != 0 and p["t"] >= 1.5),
			"howl_mist": func(): return _a1(P, "mistwolf:fx:howl", func(p): return p["t"] >= 1.35), "howl_wolves": func(): return _a1(P, "mistwolf:fx:howl", func(p): return p["t"] >= 2.4),
		},
	}
	var todo: Dictionary = marks.get(kind, {})
	var done := {}
	var life0: float = h.life
	var hits := 0
	var k := 0
	h.unhurt = false
	var away := float(_arg("away")) if _arg("away") != "" else 4.0
	var secs := float(_arg("secs")) if _arg("secs") != "" else 14.0
	var seen := {}
	var due: Array = []
	for ph in plans.get(kind, [[away, secs]]):
		if not is_instance_valid(m) or m.dead:
			break
		h.world = _charge_spot(m, ph[0], _spot_near(m.world, ph[0], h.world)) if kind == "brute" and ph[0] > 3.0 else _spot_near(m.world, ph[0], h.world)
		# (the eyespawn: square before it along one of the floor's four ways, where its gaze burns)
		if kind == "spawn":
			for w in [Vector2(1, 0), Vector2(0, 1), Vector2(-1, 0), Vector2(0, -1)]:
				var q: Vector2 = m.world + w * float(ph[0])
				if map.walkable(floori(q.x), floori(q.y)) and _monsters.sees(m.world, q):
					h.world = q
					break
		if ph.size() > 2:
			m.life = m.max_life * float(ph[2])
		var t := 0.0
		while t < ph[1]:
			await get_tree().process_frame
			t += get_process_delta_time()
			if h.life < life0:
				hits += 1
			h.life = h.max_life
			life0 = h.life
			for name in todo:
				if not done.has(name) and todo[name].call():
					done[name] = true
					k += 1
					await _snap(tag + "%02d_%s.png" % [k, name])
			if todo.is_empty() or own:
				# (a kind with rules of its own: each of its moves pictured the first two times, half a second in)
				for id in _monsters.used:
					var c: int = _monsters.used[id]
					if c > seen.get(id, 0):
						seen[id] = c
						if c <= 2:
							due.append([t + 0.5, "%s_%d" % [id, c]])
				for q in due.duplicate():
					if t >= q[0]:
						due.erase(q)
						k += 1
						done[q[1]] = true
						await _snap(tag + "%02d_%s.png" % [k, q[1]])
	var said := ""
	if ally != null and is_instance_valid(m) and not m.dead:
		# (a blow of 10 on the one it shields, its ward weighed: 6 while the chanter is awake and near)
		said = "; the %s 2 tiles from it takes %.0f of a blow of 10 (warded)" % [ally.kind, Monster.Act1.warded(_monsters, ally, 10.0)]
	if kind == "boneward" and is_instance_valid(m) and not m.dead:
		# (its shield: wait till the wall is up; a blow from before it glances off, one from behind lands)
		var w := 0.0
		h.world = _spot_near(m.world, 1.6, h.world)
		while w < 6.0 and not (m.wall_up() and m.state == "chase"):
			await get_tree().process_frame
			w += get_process_delta_time()
		var up: bool = m.wall_up()
		h.world = m.world + m.face * 1.2
		var l0: float = m.life
		m.hurt(3.0)
		var l1: float = m.life
		await _wait(0.12)
		await _snap(tag + "%02d_glance.png" % (k + 1))
		h.world = m.world - m.face * 1.2
		m.hurt(3.0)
		said = "; its wall up %s; a blow from before it took %.1f, from behind %.1f; glances %d" % [up, l0 - l1, l1 - m.life, _monsters.used.get("glance", 0)]
	if own and is_instance_valid(m) and not m.dead:
		# (struck dead; what it leaves pictured where it fell; then the hero walked there, and it is taken up)
		var fell: Vector2 = m.world
		var got: Array = []
		_monsters.quest_item.connect(func(what: String, at: Vector2): got.append("%s at %s" % [what, at]))
		h.world = _spot_near(m.world, 3.0, h.world)
		m.hurt(1e9)
		if not m.dead:
			# (one that nothing reaches just now: tried again for a while)
			var w2 := 0.0
			while w2 < 8.0 and not m.dead:
				await get_tree().process_frame
				w2 += get_process_delta_time()
				m.hurt(1e9)
		await _wait(1.6)
		await _snap(tag + "%02d_fallen.png" % (k + 1))
		if kind == "stoker":
			# (his death's blast, and his gear lying once his death is done: pictured; then walked to where it lies)
			await _wait(0.5)
			await _snap(tag + "%02d_blast.png" % (k + 2))
			await _wait(3.0)
			await _snap(tag + "%02d_gear_lies.png" % (k + 3))
			k += 2
			for c in P.get_children():
				if c.get("at") != null:
					fell = c.at
		h.world = fell
		await _wait(0.6)
		# (a keybearer's key lies a little to his side: walked to)
		if kind == "keyblade" or kind == "keyflame":
			for at in Monster.Keybearers.keys_lying(_monsters):
				h.world = at
				await _wait(0.4)
		await _snap(tag + "%02d_where_it_fell.png" % (k + 2))
		said += "; dead %s; taken up: %s" % [m.dead, got]
	print("KIND floor %d %s: moves made %s; pictured %s; the hero struck in %d frames%s" % [n, kind, _monsters.used, done.keys(), hits, said])


## SHOT MODE, THE MAPS (--only=map --floor=N): the small map as he comes in; after he has been set down in the rooms along
## the way, so that he has seen more of the floor; the large map open; the pause panel; and the town's small map. Says how
## much of the floor he had seen, and whether the game was held while each was open.
func _map_shots(h: Hero, dir: String) -> void:
	var n := int(_arg("floor")) if _arg("floor") != "" else 3
	go_to("floor%d" % n, "down" if n > 1 else "start")
	await _wait(1.4)
	var tag := dir + "/m%d_" % n
	await _snap(tag + "1_coming_in.png")
	var seen0 := 0
	for i in map.w * map.h:
		seen0 += sight.explored[i]
	for m in _monsters.list:
		if is_instance_valid(m) and not m.boss:
			m.queue_free()
	var back := h.world
	var rooms: Array = map.rooms.duplicate()
	rooms.sort_custom(func(a, b): return int(a.get("path", 0)) < int(b.get("path", 0)))
	for k in mini(rooms.size(), 7):
		var r: Dictionary = rooms[k]
		h.world = _free_near(Vector2(r["x"] + r["w"] / 2.0, r["y"] + r["h"] / 2.0))
		await _wait(0.3)
	await _snap(tag + "2_seven_rooms_on.png")
	var seen1 := 0
	for i in map.w * map.h:
		seen1 += sight.explored[i]
	_mini.show_panel("map")
	await _wait(0.3)
	var held_map := get_tree().paused
	await _snap(tag + "3_the_large_map.png")
	_mini.show_panel("")
	await _wait(0.2)
	var went_on := not get_tree().paused
	_mini.show_panel("pause")
	await _wait(0.3)
	var held_pause := get_tree().paused
	await _snap(tag + "4_paused.png")
	_mini.show_panel("")
	await _wait(0.2)
	print("MAP floor %d (%d by %d): seen %d tiles coming in, %d seven rooms on; held under the large map %s, went on after %s, held under pause %s, goes on now %s" % [n, map.w, map.h, seen0, seen1, held_map, went_on, held_pause, not get_tree().paused])
	# (and by the keys and the pointer, as he would: M and M; a press on the small map and a press anywhere, which must not be
	# a blow as well; Esc and RESUME; the pause button and Esc)
	var W := 480.0
	var said: Array = []
	_acts_seen = 0
	await _key(KEY_M)
	said.append("M opens %s held %s" % [_mini.open, get_tree().paused])
	await _key(KEY_M)
	said.append("M closes '%s' held %s" % [_mini.open, get_tree().paused])
	await _click(Vector2(W - 37, 27))
	said.append("a press on the small map opens %s held %s" % [_mini.open, get_tree().paused])
	await _click(Vector2(240, 135))
	said.append("a press closes '%s' held %s, blows begun %d" % [_mini.open, get_tree().paused, _acts_seen])
	await _key(KEY_ESCAPE)
	said.append("Esc opens %s held %s" % [_mini.open, get_tree().paused])
	var resume: Rect2 = _mini._hits[0][0] if not _mini._hits.is_empty() else Rect2()
	await _click(resume.get_center())
	said.append("RESUME closes '%s' held %s, blows begun %d" % [_mini.open, get_tree().paused, _acts_seen])
	# (and a press on the floor, with nothing open, is a blow: the count is not blind)
	await _click(Vector2(240, 100))
	said.append("a press on the floor: blows begun %d" % _acts_seen)
	await _click(Vector2(W - 11, 59))
	said.append("the pause button opens %s held %s" % [_mini.open, get_tree().paused])
	var sound: Rect2 = _mini._hits[1][0] if _mini._hits.size() > 1 else Rect2()
	await _click(sound.get_center())
	said.append("SOUND: off %s" % AudioServer.is_bus_mute(0))
	await _click(sound.get_center())
	said.append("again: off %s" % AudioServer.is_bus_mute(0))
	await _key(KEY_ESCAPE)
	said.append("Esc closes '%s' held %s" % [_mini.open, get_tree().paused])
	_inv.toggle()
	await _wait(0.2)
	await _key(KEY_ESCAPE)
	said.append("Esc closes the gear screen: shown %s held %s" % [_inv.visible, get_tree().paused])
	print("MAP by hand: ", "; ".join(said))
	h.world = back
	go_to("town", "start")
	await _wait(1.4)
	await _snap(tag + "5_in_town.png")


## SHOT MODE, A FLOOR'S STATES AND ITS WAY ON (--only=ways --floor=N): a door come up to (it swings open), a chest come up to
## (it opens), a barrel or an urn struck (it breaks); then the boss struck dead in his hall, the way on pictured as it opens
## and once it is open, and taken: where he comes out is pictured too.
func _way_shots(h: Hero, dir: String) -> void:
	# (floor 3 by default: floor 2's way on is its stairwell, stairs.gd, not a way of ways.gd)
	var n := int(_arg("floor")) if _arg("floor") != "" else 3
	go_to("floor%d" % n, "down" if n > 1 else "start")
	await _wait(1.5)
	var tag := dir + "/w%d_" % n
	for d in map.doors:
		if d["kind"] == "door" and int(d["want"]) == 0:
			var mid := Vector2(d["middle"]["x"], d["middle"]["y"])
			var out := Vector2(0, float(d["out"])) if d["alongX"] else Vector2(float(d["out"]), 0)
			h.world = _free_near(mid + out * 4.0)
			await _wait(0.4)
			await _snap(tag + "1_door_shut.png")
			h.world = _free_near(mid + out * 2.0)
			await _wait(0.25)
			await _snap(tag + "2_door_swinging.png")
			await _wait(1.0)
			await _snap(tag + "3_door_open.png")
			break
	for p in map.props:
		if p["kind"] == "chest" and int(p["state"]) == 0:
			h.world = _free_near(Vector2(p["x"], p["y"]) + Vector2(1.6, 1.6))
			await _wait(0.3)
			await _snap(tag + "4_chest.png")
			h.world = _free_near(Vector2(p["x"], p["y"]) + Vector2(0.9, 0.9))
			await _wait(0.8)
			await _snap(tag + "5_chest_open.png")
			break
	for p in map.props:
		if (p["kind"] == "barrel" or p["kind"] == "urn") and int(p["state"]) == 0:
			var at := Vector2(p["x"], p["y"])
			h.world = _free_near(at + Vector2(1.2, 1.2))
			await _wait(0.4)
			await _snap(tag + "6_%s.png" % p["kind"])
			h.props.strike(at, 1.2)
			await _wait(0.5)
			await _snap(tag + "7_%s_broken.png" % p["kind"])
			break
	var boss: Monster = null
	for m in _monsters.list:
		if is_instance_valid(m) and m.boss:
			boss = m
	if boss == null:
		print("WAYS: floor %d has no boss" % n)
		return
	var room: Dictionary = {}
	for r in map.rooms:
		if r["kind"] == "boss":
			room = r
	h.world = _free_near(boss.world + Vector2(2.5, 2.5))
	await _wait(1.0)
	await _snap(tag + "8_boss.png")
	# (struck until he is dead: the Carrion Queen cannot be brought below a hundredth of her life until she is home on her perch,
	# and the descent's bosses wait out their line first: _d_kill)
	await _d_kill(boss)
	await _wait(0.3)
	var kind: String = ways.way_kind()
	if _arg("debug") != "":
		var bosses := []
		for m in _monsters.list:
			if is_instance_valid(m) and m.boss:
				bosses.append([m.kind, m.dead, m.life])
		print("DEBUG boss ", boss.kind, " dead ", boss.dead, " life ", boss.life, " fell ", _monsters.boss_fell, " ways dead ", ways._boss_dead, " state '", ways.state, "' bosses ", bosses)
	var k := 0
	while ways.state == "opening" and k < 12:
		await _snap(tag + "9_%s_opening_%02d.png" % [kind, k])
		await _wait(0.45)
		k += 1
	await _wait(0.3)
	await _snap(tag + "9_%s_open.png" % kind)
	# (and seen from beside it)
	var by := h.world
	match kind:
		"stair":
			by = Vector2(float(ways._stair["x"]) - 1.5, float(ways._stair["y"]) + 2.4) if ways._stair["way"] == "x" else Vector2(float(ways._stair["x"]) + 2.4, float(ways._stair["y"]) - 1.5)
		"exit", "cave":
			var wt: Array = ways._way_tiles()
			if not wt.is_empty() and not room.is_empty():
				# (three tiles into the hall from its doorway)
				var mid := Vector2(int(wt[wt.size() / 2]) % map.w + 0.5, int(wt[wt.size() / 2]) / map.w + 0.5)
				var centre := Vector2(float(room["x"]) + float(room["w"]) / 2.0, float(room["y"]) + float(room["h"]) / 2.0)
				by = mid + (centre - mid).normalized() * 3.0
		"shaft":
			by = Vector2(float(map.ways["shaft"]["x"]) + 0.5, float(map.ways["shaft"]["y"]) + 2.5)
	h.world = _free_near(by)
	await _wait(0.6)
	await _snap(tag + "9_%s_open_beside.png" % kind)
	print("WAYS: floor %d: the boss dead, its %s %s after %.1f s" % [n, kind, ways.state, ways._t])
	# take it
	var to := h.world
	match kind:
		"stair":
			var st: Dictionary = ways._stair
			to = Vector2(float(st["x"]) + 0.5, float(st["y"]) + 0.6) if st["way"] == "x" else Vector2(float(st["x"]) + 0.6, float(st["y"]) + 0.5)
		"exit", "cave":
			var tiles: Array = ways._way_tiles()
			if not tiles.is_empty():
				var i: int = tiles[tiles.size() / 2]
				to = Vector2(i % map.w + 0.5, i / map.w + 0.5)
		"shaft":
			to = Vector2(float(map.ways["shaft"]["x"]) + 0.5, float(map.ways["shaft"]["y"]) + 0.5)
	h.world = to
	await _wait(2.0)
	await _snap(tag + "10_after.png")
	print("WAYS: now in %s (%s)" % [place, place_title()])


## SHOT MODE, A FLOOR'S BOSS (--only=boss --floor=N [--secs=40]): the hero set down in the boss's hall, in his sight, not to be
## harmed; the boss wakes (his gate, his line) and fights; every move he makes (monsters.gd `used`) is pictured as it begins
## and twice more as it goes on; then he is struck dead and pictured fallen. Says which moves were made, and how often.
func _boss_shots(h: Hero, dir: String) -> void:
	var n := int(_arg("floor")) if _arg("floor") != "" else 3
	# (floors 6 and 7's bosses: a check of their own, each of their moves and phases made in turn: _boss67_shots)
	if n == 6 or n == 7:
		await _boss67_shots(h, dir, n)
		return
	var secs := float(_arg("secs")) if _arg("secs") != "" else 40.0
	# (floor 10: the Swamp Colossus's whole fight, from the landing to the way home: checks/colossus_check.gd)
	if n == 10:
		await ColossusCheck.run(self, h, dir)
		return
	go_to("floor%d" % n, "down" if n > 1 else "start")
	await _wait(1.5)
	var boss: Monster = null
	for m in _monsters.list:
		if is_instance_valid(m) and m.boss:
			boss = m
	if boss == null:
		print("BOSS: floor %d has none" % n)
		return
	# (floors 8 and 9: a check of their own, at the foot of this file)
	if boss.kind == "cantor" or boss.kind == "stag":
		await _boss89_shots(h, dir, boss)
		return
	var tag := dir + "/b%d_" % n
	h.world = _spot_near(boss.world, 5.0, boss.world)
	await _wait(0.5)
	await _snap(tag + "00_his_hall.png")
	var t := 0.0
	while boss.waits and t < 8.0:
		await get_tree().process_frame
		t += get_process_delta_time()
	_monsters.used = {}
	var seen := {}
	var pending: Array = []  # [id, at, k]
	t = 0.0
	while t < secs and not boss.dead:
		await get_tree().process_frame
		t += get_process_delta_time()
		for id in _monsters.used:
			if not seen.has(id):
				seen[id] = true
				await _snap(tag + "%02d_%s_0.png" % [seen.size(), id])
				pending.append([id, t + 0.45, 1, seen.size()])
				pending.append([id, t + 1.1, 2, seen.size()])
		var keep: Array = []
		for p in pending:
			if t >= p[1]:
				await _snap(tag + "%02d_%s_%d.png" % [p[3], p[0], p[2]])
			else:
				keep.append(p)
		pending = keep
		# (he is kept where the boss can come at him: back near the boss if he has been thrown or has wandered far)
		if h.world.distance_to(boss.world) > 9.0:
			h.world = _spot_near(boss.world, 5.0, boss.world)
	print("BOSS floor %d (%s, %s): moves made in %.0f s: %s; his life %.0f of %.0f; the hero's %.0f" % [n, boss.kind, boss.title, t, _monsters.used, boss.life, boss.max_life, h.life])
	boss.waits = false
	# (floor 5: he is struck dead in the middle of what he has sent out, the hero standing in it: nothing of his may harm
	# him after; and his death is pictured: his light bursting out, the hands of his dead, the pillar of his fire)
	var marks_left := 0
	if boss.kind == "fleshmancer":
		for p in _monsters.perils.list:
			if str(p["kind"]).begins_with("fm_") and not p.get("mini", false):
				marks_left += 1
	h.unhurt = false
	h.life = h.max_life
	boss.hurt(1e9)
	if boss.kind == "fleshmancer":
		var harmed := 0
		var shown := 0.0
		for q in [[0.35, "96_death_burst"], [0.6, "97_death_hands"], [1.75, "98_death_pillar"]]:
			var w := 0.0
			while w < float(q[0]):
				await get_tree().process_frame
				w += get_process_delta_time()
				if h.life < h.max_life:
					harmed += 1
					h.life = h.max_life
			shown += float(q[0])
			await _snap(tag + "%s.png" % q[1])
		print("BOSS floor 5: struck dead with %d of his marks out; the hero harmed in %d frames after; his death pictured to %.2f s" % [marks_left, harmed, shown])
		await _wait(1.0)
	else:
		await _wait(1.6)
	await _snap(tag + "99_fallen.png")
	print("BOSS floor %d: dead %s" % [n, boss.dead])


## SHOT MODE, A FLOOR'S WAYPOINT (--only=waypoint --floor=N): come into the floor, its waypoint pictured awake beside him; he
## steps onto it and warps to town (the column of light pictured as it flares), and from the town's waypoint back down to
## that floor.
func _waypoint_shots(h: Hero, dir: String) -> void:
	var n := int(_arg("floor")) if _arg("floor") != "" else 3
	go_to("floor%d" % n, "down" if n > 1 else "start")
	await _wait(1.6)
	var tag := dir + "/p%d_" % n
	if _way == null:
		print("WAYPOINT: floor %d has none" % n)
		return
	await _snap(tag + "1_awake.png")
	print("WAYPOINT floor %d: at %s awake %s way_depth %d" % [n, _way.at, _way.awake, way_depth])
	h.world = _way.at
	await _wait(0.3)
	print("WAYPOINT: here %s prompt %s" % [_way.here(), prompt()])
	_way.warp()
	await _wait(0.12)
	await _snap(tag + "2_warp.png")
	await _wait(1.2)
	await _snap(tag + "3_in_town.png")
	print("WAYPOINT: now in %s at %s; the town's awake %s prompt %s" % [place, h.world, _way.awake if _way != null else null, prompt()])
	if _way != null and place == "town":
		h.world = _way.at
		await _wait(0.3)
		_way.warp()
		await _wait(1.4)
		await _snap(tag + "4_back.png")
	print("WAYPOINT: back in %s (%s) at %s" % [place, place_title(), h.world])


## SHOT MODE, LEDGES AND STAIRS (--only=heights --floor=N): he is walked up the floor's first flight of stairs (pictured at its
## foot, half way and at its head: lifted as the ground is), then at each ledge round where he stands (he is held by it), and
## along a slanting wall. Says how high he stood at each and what held him.
func _height_shots(h: Hero, dir: String) -> void:
	var n := int(_arg("floor")) if _arg("floor") != "" else 1
	go_to("floor%d" % n, "down" if n > 1 else "start")
	await _wait(1.5)
	var tag := dir + "/h%d_" % n
	var st := -1
	for i in map.stair.size():
		if map.stair[i] != 0:
			st = i
			break
	if st < 0:
		print("HEIGHTS: floor %d has no stairs (%d raised or sunken tiles)" % [n, _count_raised()])
	else:
		var tx := st % map.w
		var ty := st / map.w
		var up := Vector2(0, -1) if map.stair[st] == 1 else Vector2(-1, 0)
		# (a flight may be several tiles long: its foot is the first plain tile down it, its head the first up it)
		var foot := Vector2(tx + 0.5, ty + 0.5) - up
		var head := Vector2(tx + 0.5, ty + 0.5) + up
		while map.stair[floori(head.y) * map.w + floori(head.x)] != 0:
			head += up
		h.world = foot
		await _wait(0.4)
		await _snap(tag + "1_at_the_foot.png")
		var l0: float = map.level_at(h.world.x, h.world.y)
		var steps := 0
		var mid := false
		while h.world.distance_to(head) > 0.08 and steps < 400:
			h._slide((head - h.world).normalized() * 4.6 / 60.0)
			h.face = up
			steps += 1
			if not mid and h.world.distance_to(foot) >= foot.distance_to(head) * 0.5:
				mid = true
				await get_tree().process_frame
				await _snap(tag + "2_half_way.png")
		await _wait(0.3)
		await _snap(tag + "3_at_the_head.png")
		print("HEIGHTS floor %d: stairs at (%d, %d) going %s: from level %.2f at the foot to %.2f at the head in %d steps (%.2f from it)" % [n, tx, ty, "up -y" if map.stair[st] == 1 else "up -x", l0, map.level_at(h.world.x, h.world.y), steps, h.world.distance_to(head)])
	# the ledges: every place two plain tiles side by side stand at different heights, walked at from the higher: he is held
	var held := 0
	var tried := 0
	var shown := false
	for ty2 in range(1, map.h - 1):
		for tx2 in range(1, map.w - 1):
			if tried >= 40:
				break
			var i2 := ty2 * map.w + tx2
			if not map.walkable(tx2, ty2) or map.stair[i2] != 0:
				continue
			for q: Vector2i in [Vector2i(1, 0), Vector2i(0, 1)]:
				var j2: int = (ty2 + q.y) * map.w + tx2 + q.x
				if not map.walkable(tx2 + q.x, ty2 + q.y) or map.stair[j2] != 0 or map.height[i2] == map.height[j2]:
					continue
				tried += 1
				var hi := Vector2(tx2 + 0.5, ty2 + 0.5) if map.height[i2] > map.height[j2] else Vector2(tx2 + q.x + 0.5, ty2 + q.y + 0.5)
				var lo := Vector2(tx2 + q.x + 0.5, ty2 + q.y + 0.5) if map.height[i2] > map.height[j2] else Vector2(tx2 + 0.5, ty2 + 0.5)
				h.world = hi
				for k in 60:
					h._slide((lo - hi) * 4.6 / 60.0)
				if floori(h.world.x) == floori(hi.x) and floori(h.world.y) == floori(hi.y):
					held += 1
				if not shown:
					shown = true
					await _wait(0.3)
					await _snap(tag + "5_at_a_ledge.png")
	print("HEIGHTS: %d ledges walked at from the higher side, held at %d" % [tried, held])
	# a slanting wall: walked into, he slides along it
	var c := -1
	for i in map.cut.size():
		if map.cut[i] != 0 and map.tiles[i] == FloorMap.FLOOR:
			c = i
			break
	if c >= 0:
		var cx := c % map.w
		var cy := c / map.w
		var half := FloorMap.cut_half(int(map.cut[c]))
		# (stood on its floor half, walked straight at its wall half)
		var into := Vector2(-1, -1) if half == 1 else Vector2(1, 1) if half == 2 else Vector2(-1, 1) if half == 3 else Vector2(1, -1)
		h.world = Vector2(cx + 0.5, cy + 0.5) - into * 0.28
		var from := h.world
		var ok: bool = map.fits(h.world.x, h.world.y, 0.3)
		for k in 40:
			h._slide(Vector2(into.x, 0.0) * 4.6 / 60.0)
		await _wait(0.3)
		await _snap(tag + "4_slanting_wall.png")
		print("HEIGHTS: a tile cut %d at (%d, %d): he stood on its floor half %s, walked at the wall along x and went from %s to %s (in the wall half: %s)" % [half, cx, cy, ok, from, h.world, map.in_wall(h.world.x, h.world.y)])


func _count_raised() -> int:
	var k := 0
	for v in map.height:
		if v != 0:
			k += 1
	return k


## SHOT MODE, A FLOOR'S TRAPS (--only=traps --floor=N): he is stood on the floor's first spike floor through one beat of it
## (pictured as its holes glint and as the spikes are up; what it took of his life) and on its first dart wall's plate
## (pictured as the darts fly; what they took).
func _trap_shots(h: Hero, dir: String) -> void:
	var n := int(_arg("floor")) if _arg("floor") != "" else 3
	go_to("floor%d" % n, "down" if n > 1 else "start")
	await _wait(1.5)
	var tag := dir + "/t%d_" % n
	if map.hazards.is_empty():
		print("TRAPS: floor %d has none" % n)
		return
	# (nobody else about: what the traps take is theirs alone)
	for m in _monsters.list:
		if is_instance_valid(m):
			m.queue_free()
	_monsters.list.clear()
	await _wait(0.2)
	h.unhurt = false
	var done := {}
	for s in map.hazards:
		var kind: String = s["kind"]
		if done.has(kind):
			continue
		done[kind] = true
		h.life = h.max_life
		var at := Vector2(float(s["x"]) + float(s["w"]) / 2.0, float(s["y"]) + float(s["h"]) / 2.0)
		if kind == "spikes":
			h.world = at
			await _wait(0.2)
			await _snap(tag + "1_spikes_down.png")
			var l0 := h.life
			var t := 0.0
			var shot := false
			while t < 3.2:
				await get_tree().process_frame
				t += get_process_delta_time()
				h.world = at
				if not shot and h.life < l0:
					shot = true
					await _snap(tag + "2_spikes_up.png")
			print("TRAPS floor %d: spikes at %s (%dx%d, phase %.1f): his life %.1f -> %.1f in one beat (a sixth of %.0f is %.1f)" % [n, at, int(s["w"]), int(s["h"]), float(s.get("phase", 0.0)), l0, h.life, h.max_life, h.max_life / 6.0])
		elif s.has("slot"):
			h.world = _free_near(at + Vector2(float(s["slot"]["dx"]), float(s["slot"]["dy"])) * 3.0)
			await _wait(0.5)
			h.world = at
			var l1 := h.life
			await _wait(0.45)
			await _snap(tag + "3_darts.png")
			await _wait(1.2)
			await _snap(tag + "4_darts_after.png")
			print("TRAPS floor %d: darts, plate at %s, slot %s: his life %.1f -> %.1f (12%% of %.0f a dart is %.1f)" % [n, at, s["slot"], l1, h.life, h.max_life, h.max_life * 0.12])
	h.unhurt = true


## SHOT MODE, WHAT THE FIGHT SHOWS OF A BLOW AND OF A WORD (--only=fx [--floor=3] [--at=x,y] [--case=<the start of a
## look's name>] [--cases=<file>]): the hero stands in the middle of the floor's biggest room (or at `at`), its monsters
## made to wait, the six nearest kept and the rest gone. Each telling the words' rules send is told to the effects by hand
## at a spot beside him (a monster stood there to be struck), for each element and word it can carry, and pictured a few
## frames into its life (twice or more, the longer ones), the effects moved on a sixtieth of a second at a time so that
## each is seen at its own moment (no hold: fx.gd `holds` off); a move used with each word behind it; a Strike with each
## word, as its tellings come together; then a burning, a chilled, a frozen, a poisoned and a stunned monster (their states
## faked as metadata of those names: monster.gd keeps none yet) and the ice breaking off the frozen one; four made
## guardians, each with a word; each kind of ground a move leaves, laid in a layer that hands it over to be drawn
## (fx_wakes.gd Layer: what the rules' node will do); and the other ways a thing may be told. A line a picture: what was
## sent, and what was alive. Then what a hold does to the game's pace, and what the effects cost a frame (with nothing to
## show and all the floor's monsters there; with a hundred particles and three rings; with four hundred and eight). The
## pictures are the part of the screen round him.
func _fx_shots(h: Hero, dir: String) -> void:
	var n := int(_arg("floor")) if _arg("floor") != "" else 3
	go_to("floor%d" % n, "down" if n > 1 else "start")
	await _wait(1.4)
	if sight != null:
		sight.see_all()
	var big: Dictionary = {}
	for r in map.rooms:
		if r.get("kind", "") != "boss" and (big.is_empty() or float(r["w"]) * float(r["h"]) > float(big["w"]) * float(big["h"])):
			big = r
	# (the floor's monsters made to wait, as a boss waits before his fight: they stand where they are and look at him)
	for o in _monsters.list:
		if is_instance_valid(o):
			o.waits = true
	h.world = _free_near(Vector2(float(big["x"]) + float(big["w"]) / 2.0, float(big["y"]) + float(big["h"]) / 2.0))
	if _arg("at") != "":
		h.world = Vector2(float(_arg("at").split(",")[0]), float(_arg("at").split(",")[1]))
	h._turn(Vector2(1, 0))
	# (what it costs with nothing to show, all the floor's monsters there: 60 frames)
	await _wait(0.3)
	fx.timing = true
	fx.cost_update = 0
	fx.cost_draw = 0
	fx.cost_frames = 0
	for i in 60:
		await get_tree().process_frame
	fx.timing = false
	var idle := "with nothing to show and %d monsters on the floor: update %.3f ms, drawing %.3f ms a frame" % [_monsters.list.size(), fx.cost_update / 1000.0 / maxi(1, fx.cost_frames), fx.cost_draw / 1000.0 / maxi(1, fx.cost_frames)]
	# (the six nearest him kept, put out of the way, off the floor, until each is wanted; the rest gone)
	var kept: Array = []
	var all: Array = _monsters.list.duplicate()
	all.sort_custom(func(a, b): return a.world.distance_to(h.world) < b.world.distance_to(h.world))
	for o in all:
		if kept.size() < 6 and not o.boss and not o.champion and not o.elite and not Monster.BOSS_AI.has(o.kind):
			o.world = Vector2(-40.0 - kept.size() * 3.0, -40.0)
			kept.append(o)
		else:
			o.queue_free()
	# (and whatever any had begun before it was made to wait, gone)
	_monsters.perils.clear()
	await _wait(1.2)
	# (the screen over the game put away: the pictures are of the fight)
	_hud.visible = false
	_mini.visible = false
	fx.set_process(false)
	fx.holds = false
	fx.figures.faked = true
	var H: Vector2 = h.world
	var S := H + Vector2(1.6, 0.0)
	var foe: Monster = kept[0]
	foe.world = S
	var at := {"x": S.x, "y": S.y}
	var from := {"x": H.x, "y": H.y, "dx": 1.0, "dy": 0.0, "reach": 1.7}
	print("FX floor %d: he stands at %s in a room %d by %d; struck beside him at %s, a %s (%s); kept %s" % [n, H, int(big["w"]), int(big["h"]), S, foe.kind, foe.art.name, kept.map(func(o): return o.kind)])

	# THE SWING, by its element and the words in front
	var swings := [
		["plain", "phys", [], 0], ["plain_second", "phys", [], 1], ["power", "phys", ["power"], 0], ["swift", "phys", ["swift"], 0],
		["fire", "fire", ["fire"], 0], ["frost", "frost", ["frost"], 0], ["lightning", "lightning", ["lightning"], 0],
		["poison", "phys", ["poison"], 0], ["fire_power", "fire", ["fire", "power"], 0],
	]
	for q in swings:
		await _fx_case(dir, "swing_" + q[0], [[0.0, from.merged({"t": "swing", "el": q[1], "words": q[2], "combo": q[3], "n": 0, "echo": false})]], [0.05, 0.13])
	# A HIT: after his swing (the blow lands hard, and what the struck is made of flies off it), and alone by element and word
	await _fx_case(dir, "hit_after_swing", [[0.0, from.merged({"t": "swing", "el": "phys", "words": [], "combo": 0})], [0.0, at.merged({"t": "hit", "amount": 23, "crit": false, "el": "phys", "heavy": false})]], [0.05, 0.2])
	var hits := [
		["crit", {"amount": 41, "crit": true, "el": "phys"}], ["power", {"amount": 30, "el": "phys", "heavy": true, "words": ["power"]}],
		["fire", {"amount": 18, "el": "fire", "words": ["fire"]}], ["frost", {"amount": 18, "el": "frost", "words": ["frost"]}],
		["lightning", {"amount": 18, "el": "lightning", "words": ["lightning"]}], ["swift", {"amount": 12, "el": "phys", "words": ["swift"]}],
		["poison", {"amount": 14, "el": "phys", "words": ["poison"]}], ["poison_tick", {"amount": 4, "el": "phys", "poison": true}],
	]
	for q in hits:
		await _fx_case(dir, "hit_" + q[0], [[0.0, at.merged(q[1]).merged({"t": "hit"})]], [0.08])
	# A BURST, in its four styles
	await _fx_case(dir, "burst_shock_power", [[0.0, at.merged({"t": "burst", "r": 1.2, "el": "phys", "style": "shock", "words": ["power"]})]], [0.05, 0.3])
	var blasts := [
		["fire_small", "fire", ["fire"], 1.2], ["fire_big", "fire", ["fire"], 2.2], ["frost_small", "frost", ["frost"], 1.2], ["frost_big", "frost", ["frost"], 2.2],
		["lightning_small", "lightning", ["lightning"], 1.2], ["lightning_big", "lightning", ["lightning"], 2.2], ["plain", "phys", [], 1.5],
		["power", "phys", ["power"], 1.5], ["swift", "phys", ["swift"], 1.5], ["poison_small", "phys", ["poison"], 1.2], ["poison_big", "phys", ["poison"], 2.2],
	]
	for q in blasts:
		await _fx_case(dir, "burst_blast_" + q[0], [[0.0, at.merged({"t": "burst", "r": q[3], "el": q[1], "style": "blast", "words": q[2]})]], [0.05, 0.25])
	var lands := [["plain", "phys", []], ["power", "phys", ["power"]], ["fire", "fire", ["fire"]], ["frost", "frost", ["frost"]], ["lightning", "lightning", ["lightning"]], ["swift", "phys", ["swift"]], ["poison", "phys", ["poison"]]]
	for q in lands:
		await _fx_case(dir, "burst_land_" + q[0], [[0.0, {"t": "burst", "x": H.x + 1.0, "y": H.y, "r": 1.9, "el": q[1], "style": "land", "words": q[2]}], [0.0, at.merged({"t": "hit", "amount": 11, "el": q[1], "words": q[2]})]], [0.05, 0.25])
	for q in lands:
		var turn := {"t": "burst", "x": H.x, "y": H.y, "r": 2.0, "el": q[1], "style": "whirl", "words": q[2]}
		var cut: Dictionary = at.merged({"t": "hit", "amount": 9, "el": q[1], "words": q[2]})
		await _fx_case(dir, "burst_whirl_" + q[0], [[0.0, turn], [0.0, cut], [0.3, turn], [0.3, cut], [0.6, turn], [0.6, cut]], [0.1, 0.5] if q[0] != "plain" else [0.1, 0.5, 1.12])
	# (and a whirlwind whose beginning and end are told, as the game's rules tell them)
	var spin := {"t": "burst", "x": H.x, "y": H.y, "r": 2.0, "el": "phys", "style": "whirl", "words": []}
	await _fx_case(dir, "whirl_told_begun_and_ended", [[0.0, {"t": "channel", "kind": "whirl", "x": H.x, "y": H.y}], [0.12, spin], [0.42, spin], [0.6, {"t": "channelEnd", "kind": "whirl", "x": H.x, "y": H.y}]], [0.05, 0.3, 0.66, 0.8])
	# LIGHTNING: down out of the sky, and along the ground to another
	await _fx_case(dir, "arc_sky", [[0.0, {"t": "arc", "x0": S.x, "y0": S.y, "x1": S.x, "y1": S.y, "sky": true}]], [0.04, 0.12])
	await _fx_case(dir, "arc_ground", [[0.0, {"t": "arc", "x0": S.x, "y0": S.y, "x1": S.x + 1.8, "y1": S.y + 1.2}]], [0.04, 0.1])
	await _fx_case(dir, "ignite", [[0.0, at.merged({"t": "ignite"})]], [0.06, 0.3])
	await _fx_case(dir, "freeze", [[0.0, at.merged({"t": "freeze"})]], [0.06, 0.4])
	await _fx_case(dir, "poisoned", [[0.0, at.merged({"t": "poisoned"})]], [0.06, 0.2])
	await _fx_case(dir, "stun", [[0.0, at.merged({"t": "stun", "id": foe, "secs": 1.5})]], [0.1, 0.5])
	await _fx_case(dir, "stagger", [[0.0, at.merged({"t": "stagger", "id": foe, "fromX": H.x, "fromY": H.y})]], [0.06, 0.2, 0.45])
	await _fx_case(dir, "heavy_one", [[0.0, at.merged({"t": "heavy", "r": 1.1, "big": false})]], [0.06, 0.35])
	await _fx_case(dir, "heavy_area", [[0.0, at.merged({"t": "heavy", "r": 1.9, "big": true})]], [0.06, 0.35, 1.0])
	# HIS OWN: might gathering a stack at a time, full, and its embers going round him; haste
	var here := {"t": "buff", "x": H.x, "y": H.y}
	await _fx_case(dir, "buff_might_1", [[0.0, here.merged({"kind": "might", "stacks": 1})]], [0.1, 0.6])
	await _fx_case(dir, "buff_might_3", [[0.0, here.merged({"kind": "might", "stacks": 1})], [0.2, here.merged({"kind": "might", "stacks": 2})], [0.4, here.merged({"kind": "might", "stacks": 3})]], [0.5, 1.0])
	await _fx_case(dir, "buff_might_full", [[0.0, here.merged({"kind": "might", "stacks": 4})], [0.3, here.merged({"kind": "might", "stacks": 5})]], [0.4, 1.2, 4.6])
	await _fx_case(dir, "buff_haste", [[0.0, here.merged({"kind": "haste", "stacks": 1})]], [0.06, 0.16])
	# A MOVE USED WITH A WORD BEHIND IT: the word stirs at his feet
	for word in ["fire", "frost", "lightning", "poison", "heavy", "power", "swift"]:
		await _fx_case(dir, "cast_behind_" + word, [[0.0, {"t": "cast", "x": H.x, "y": H.y, "dx": 1.0, "dy": 0.0, "kind": "melee", "el": "phys", "words": [], "behind": [word], "echo": false}]], [0.08])

	# A STRIKE WITH EACH WORD IN FRONT, as its tellings come together
	var strike := from.merged({"t": "swing", "combo": 0})
	await _fx_case(dir, "strike_power", [[0.0, strike.merged({"el": "phys", "words": ["power"]})], [0.0, at.merged({"t": "hit", "amount": 31, "el": "phys", "heavy": true, "words": ["power"]})], [0.0, at.merged({"t": "burst", "r": 1.2, "el": "phys", "style": "shock", "words": ["power"]})]], [0.05, 0.25])
	await _fx_case(dir, "strike_fire", [[0.0, strike.merged({"el": "fire", "words": ["fire"]})], [0.0, at.merged({"t": "hit", "amount": 19, "el": "fire", "words": ["fire"]})], [0.0, at.merged({"t": "ignite"})]], [0.05, 0.25])
	await _fx_case(dir, "strike_frost", [[0.0, strike.merged({"el": "frost", "words": ["frost"]})], [0.0, at.merged({"t": "hit", "amount": 19, "el": "frost", "words": ["frost"]})], [0.0, at.merged({"t": "freeze"})]], [0.05, 0.25])
	await _fx_case(dir, "strike_lightning", [[0.0, strike.merged({"el": "lightning", "words": ["lightning"]})], [0.0, at.merged({"t": "hit", "amount": 19, "el": "lightning", "words": ["lightning"]})], [0.0, {"t": "arc", "x0": S.x, "y0": S.y, "x1": S.x, "y1": S.y, "sky": true}], [0.0, {"t": "arc", "x0": S.x, "y0": S.y, "x1": S.x + 1.6, "y1": S.y - 1.3}]], [0.05, 0.14])
	await _fx_case(dir, "strike_poison", [[0.0, strike.merged({"el": "phys", "words": ["poison"]})], [0.0, at.merged({"t": "hit", "amount": 15, "el": "phys", "words": ["poison"]})], [0.0, at.merged({"t": "poisoned"})]], [0.05, 0.25])
	await _fx_case(dir, "strike_swift", [[0.0, strike.merged({"el": "phys", "words": ["swift"]})], [0.0, at.merged({"t": "hit", "amount": 13, "el": "phys", "words": ["swift"]})]], [0.03, 0.1])
	await _fx_case(dir, "strike_heavy", [[0.0, strike.merged({"el": "phys", "words": ["heavy"]})], [0.0, at.merged({"t": "hit", "amount": 24, "el": "phys", "words": ["heavy"]})], [0.0, at.merged({"t": "heavy", "r": 1.1, "big": false})], [0.0, at.merged({"t": "stun", "id": foe, "secs": 1.0})]], [0.05, 0.3])

	# WHAT THE STATE ITSELF SHOWS: five of the monsters in a row before him, each in one state; then the frozen one thaws
	fx.clear()
	var states := [["burn_t", 9.0], ["chill_t", 9.0], ["frozen_t", 9.0], ["poison_t", 9.0], ["stun_t", 9.0]]
	var row: Array = []
	for i in 5:
		var m: Monster = kept[(i + 1) % kept.size()]
		row.append(m)
		m.world = H + Vector2(1.7, 1.7) + Vector2(1.2, -1.2) * (i - 2.0)
		m.set_meta(states[i][0], states[i][1])
		if states[i][0] == "poison_t":
			m.set_meta("poison_n", 3)
	if not foe in row:
		foe.world = Vector2(-40.0, -44.0)
	await _wait(0.2)
	var steps := [0]
	await _fx_case(dir, "states_burning_chilled_frozen_poisoned_stunned", [], [0.7, 1.4, 1.5, 1.7], func(_dt: float):
		steps[0] += 1
		if steps[0] == 86:
			row[2].set_meta("frozen_t", 0.0))
	for i in 5:
		var m: Monster = row[i]
		for st in states:
			if m.has_meta(st[0]):
				m.remove_meta(st[0])
	# (and four of them made guardians for a picture, each with a word: a guardian smoulders in its first word's colour)
	var theirs := ["fire", "frost", "poison", "leech"]
	for i in 4:
		row[i].champion = true
		row[i].words = [theirs[i]]
	row[4].world = Vector2(-52.0, -48.0)
	await _fx_case(dir, "state_guardians_fire_frost_poison_leech", [], [1.2])
	for i in 5:
		var m: Monster = row[i]
		m.champion = false
		m.words = []
		m.world = Vector2(-40.0 - i * 3.0, -48.0)
	foe.world = S
	await _wait(0.2)

	# THE GROUND A MOVE LEAVES: each kind laid beside him in a layer that hands its patches to be drawn, as the rules' node will
	var layer := Fx.Wakes.Layer.new()
	layer.fx = fx
	_place.add_child(layer)
	_place.move_child(layer, fx.get_index())
	layer.set_process(false)
	fx.wakes = layer
	for kind in ["burn", "ice", "storm", "venom", "cracks"]:
		layer.list = [{"kind": kind, "x": S.x, "y": S.y, "r": 1.7, "t": 0.0, "dur": 4.0}]
		await _fx_case(dir, "ground_" + kind, [], [0.1, 1.2, 3.8], func(dt: float): layer.age(dt))
	# (and four small ones, the effects not given the layer: they are tended from what is handed over to be drawn)
	layer.list = []
	fx.wakes = null
	for i in 4:
		layer.list.append({"kind": ["burn", "ice", "storm", "venom"][i], "x": S.x - 1.2 + i * 1.3, "y": S.y + 1.2 - i * 1.3, "r": 0.8, "t": 0.0, "dur": 4.0})
	# (drawn once as they are laid, as the rules' node draws its own every frame: that is when they are handed over)
	layer.queue_redraw()
	await _fx_case(dir, "ground_small_burn_ice_storm_venom", [], [0.1, 1.2], func(dt: float): layer.age(dt))
	layer.queue_free()
	# THE OTHER WAYS A THING MAY BE TOLD: ground laid and ice breaking by a telling; a blow on him; a stun by the monster's
	# instance id, and by its place alone
	await _fx_case(dir, "others_zone_shatter_hit_on_him_stun_by_id", [[0.0, at.merged({"t": "zone", "kind": "burn", "r": 1.2})], [0.0, {"t": "shatter", "x": S.x + 1.5, "y": S.y - 1.5}], [0.0, {"t": "hit", "x": H.x, "y": H.y, "amount": 7, "el": "phys", "onHero": true}], [0.0, at.merged({"t": "stun", "id": foe.get_instance_id(), "secs": 1.0})]], [0.08])
	await _fx_case(dir, "others_stun_by_place", [[0.0, at.merged({"t": "stun", "secs": 1.0})]], [0.3])
	fx.clear()

	# THE HOLD: a Heavy blow told with the hold on, the effects going by themselves again: how long the game's pace is held
	fx.holds = true
	fx.set_process(true)
	await get_tree().process_frame
	var t0 := Time.get_ticks_usec()
	fx.event(at.merged({"t": "heavy", "r": 1.1, "big": false}))
	var held_at: float = Engine.time_scale
	var frames := 0
	while Engine.time_scale < 1.0 and frames < 600:
		await get_tree().process_frame
		frames += 1
	var held := (Time.get_ticks_usec() - t0) / 1000000.0
	var hold_said := "a Heavy blow held the game's pace at %.2f for %.3f s (%d frames; the game: 0.06 for 0.1 s), then %.2f" % [held_at, held, frames, Engine.time_scale]
	await _wait(0.6)

	# WHAT IT COSTS: a hundred particles and three rings kept alive for 120 frames, its update and its drawing timed; and four
	# hundred with eight
	fx.holds = false
	var costs: Array = []
	for load in [[100, 3], [400, 8]]:
		fx.clear()
		await get_tree().process_frame
		fx.timing = true
		fx.cost_update = 0
		fx.cost_draw = 0
		fx.cost_frames = 0
		var seen_p := 0
		var seen_r := 0
		for i in 120:
			var k := 0
			while fx.pn < int(load[0]):
				if k % 2 == 0:
					fx.spray(S.x, S.y, 1, Fx.L.POWER_HOT, 3.0, 80.0, 10.0)
				else:
					fx.streaks(S.x, S.y, 1, Fx.L.WIND, 6.0, 6.0, {"life": 0.5})
				k += 1
			while fx.rings.size() < int(load[1]):
				fx.ring(S.x, S.y, 1.2 + fx.rings.size() * 0.4, 0.4, Fx.L.VENOM, fx.rings.size() % 2 == 0)
			seen_p += fx.pn
			seen_r += fx.rings.size()
			await get_tree().process_frame
		fx.timing = false
		costs.append("with %d particles and %d rings alive: update %.3f ms, drawing %.3f ms a frame (%d frames)" % [seen_p / 120, seen_r / 120, fx.cost_update / 1000.0 / maxi(1, fx.cost_frames), fx.cost_draw / 1000.0 / maxi(1, fx.cost_frames), fx.cost_frames])
	# THE SAME LOOK WHATEVER THE SOURCE (his “if a bolt of lightning is going to bounce between things from different sources, I'd
	# like them to be the same.  Or anything frozen should be frozen in the same way.  Burning same thing”): a bolt bouncing from
	# one to the next, from Lightning, from the damage melds, Forking and Chain Reaction; one Flame burns; him frozen and a frozen
	# monster (the Warlock's cyan hellfire is his by design: his word). `--case=same`; `--wordsown=0` and `=1` picture them with the switch off and on (fx_looks.gd same)
	var S2 := S + Vector2(-0.3, 1.7)
	var arc := {"x0": S.x, "y0": S.y, "x1": S2.x, "y1": S2.y}
	await _fx_case(dir, "same_arc_lightning", [[0.0, arc.merged({"t": "arc"})]], [0.04, 0.1])
	for w in ["wildfire", "hailstorm", "contagion"]:
		await _fx_case(dir, "same_arc_" + w, [[0.0, arc.merged({"t": "arc", "meld": w})]], [0.04, 0.1])
	await _fx_case(dir, "same_arc_forking", [[0.0, arc.merged({"t": "arc", "meld": "forking"})], [0.0, {"t": "meld8", "id": "forking", "x": S.x, "y": S.y, "x1": S2.x, "y1": S2.y, "k": 1.0}]], [0.05, 0.12, 0.3])
	await _fx_case(dir, "same_chain", [[0.0, arc.merged({"t": "volFx", "meld": "chainreaction", "what": "arc", "id": foe.id})]], [0.1, 0.2])
	var keep_flame := func(_dt: float) -> void:
		foe.set_meta("burn_t", 2.0)
		foe.burn_t = 2.0
		fx.figures.follow()
	await _fx_case(dir, "same_burning_flame", [], [0.4, 0.8], keep_flame)
	foe.burn_t = 0.0
	var keep_frozen := func(_dt: float) -> void:
		h.held = 1.0
		h.frozen_t = 1.0
		foe.frozen_t = 1.0
		fx.figures.follow()
	await _fx_case(dir, "same_frozen", [[0.0, {"t": "freeze", "x": H.x, "y": H.y}], [0.0, at.merged({"t": "freeze"})]], [0.1, 0.5], keep_frozen)
	h.held = 0.0
	h.frozen_t = 0.0
	foe.frozen_t = 0.0
	fx.clear()
	# (--cases=<file>: what was told and when, written down, so that the same can be told to the game's own page and the two
	# held side by side)
	if _arg("cases") != "":
		var f := FileAccess.open(_arg("cases"), FileAccess.WRITE)
		f.store_string(JSON.stringify({"hero": [H.x, H.y], "spot": [S.x, S.y], "foe": foe.kind, "cases": _fx_told}))
		f.close()
	print("FX: %d pictures in %s; tellings told %s; %s; cost %s; %s; %s" % [_fx_pics, dir, fx.seen, hold_said, costs[0], costs[1], idle])


var _fx_pics := 0
var _fx_told: Array = []


## One look pictured (the fx check): the effects emptied, `sent` told to them (each [seconds in, a telling]), and a picture
## at each of `moments` (seconds into its life), the effects moved on a sixtieth of a second at a time between (`tend`, if
## given, called with each step: what else must move on with them).
func _fx_case(dir: String, name: String, sent: Array, moments: Array, tend := Callable()) -> void:
	# (--case=<the start of a name>: only the looks so named are pictured)
	if _arg("case") != "" and not name.begins_with(_arg("case")):
		return
	fx.clear()
	await get_tree().process_frame
	_fx_told.append({"name": name, "moments": moments, "sent": sent.map(func(q):
		var e: Dictionary = q[1].duplicate()
		if e.has("id"):
			e["id"] = "foe"
		return [q[0], e])})
	var t := 0.0
	var next := 0
	var step := 1.0 / 60.0
	for k in moments.size():
		var until := float(moments[k])
		while true:
			while next < sent.size() and float(sent[next][0]) <= t + 1e-6:
				fx.event(sent[next][1])
				next += 1
			if t >= until - 1e-6:
				break
			if tend.is_valid():
				tend.call(step)
			fx.advance(step, t + step >= until - 1e-6)
			t += step
		_fx_pics += 1
		await RenderingServer.frame_post_draw
		var img := get_viewport().get_texture().get_image()
		img.get_region(Rect2i(140, 0, 680, 500)).save_png("%s/fx_%s%s.png" % [dir, name, "" if moments.size() == 1 else "_%d" % (k + 1)])
		var c: Dictionary = fx.counts()
		var told := PackedStringArray()
		for q in sent:
			var e: Dictionary = q[1]
			var said := str(e["t"])
			for key in ["kind", "style", "el", "words", "behind", "r", "amount", "crit", "heavy", "poison", "onHero", "sky", "big", "stacks", "secs", "combo"]:
				if e.has(key) and not (e[key] is bool and e[key] == false) and not (key == "combo" and int(e[key]) == 0):
					said += " %s=%s" % [key, e[key]]
			told.append(("at %.1f s " % q[0] if float(q[0]) > 0.0 else "") + said)
		print("FX %s at %.2f s: sent [%s]; alive: %d particles, %d rings, %d bolts, %d numbers; and %d flashes, %d cuts, %d whirls, %d cracks, %d marks, %d spikes, %d lights, %d winds, %d phantoms" % [
			name, t, "; ".join(told), c["particles"], c["rings"], c["bolts"], c["numbers"], c["flashes"], c["slashes"], c["whirls"], c["cracks"], c["decals"], c["spikes"], c["glows"], c["winds"], c["phantoms"]])


# --- SHOT MODE, INTO THE DESCENT AND THROUGH IT ---

## (the descent's check: how many steps it has pictured, and those not as the game has them)
var _d_n := 0
var _d_bad: Array = []


## One step of the descent's check: its line (what happened, and whether that is as the game has it) and its picture.
func _d_step(dir: String, name: String, ok: bool, what: String) -> void:
	_d_n += 1
	if not ok:
		_d_bad.append(name)
	print("DESCENT %02d %s: %s" % [_d_n, "ok" if ok else "WRONG", what])
	await _snap(dir + "/d%02d_%s.png" % [_d_n, name])


## (the descent's check) The Meldstone lying on the floor, or null.
func _d_stone() -> Variant:
	for d in loot._drops:
		if d["kind"] == "stone":
			return d
	return null


## (the descent's check) The floor's boss, or null.
func _d_boss() -> Monster:
	for m in _monsters.list:
		if is_instance_valid(m) and m.boss:
			return m
	return null


## (the descent's check) Struck until he is dead (a boss under the floor, or between his moves, is not to be reached for a moment).
func _d_kill(m: Monster) -> void:
	m.waits = false
	# (one whose own rules hold off every blow until his last phase, the Swamp Colossus: brought to it first)
	if m.h2 != null and m.h2.has_method("to_the_end"):
		m.h2.to_the_end(m)
	var t := 0.0
	while not m.dead and t < 4.0:
		m.hurt(1e9)
		await _wait(0.2)
		t += 0.2


## SHOT MODE, THE WAYS ON THROUGH THE CITY AND THE HIGH CITY (--only=cityways [--floor=N]): on each of floors 11 to 20 (from N), its
## bosses struck dead, its way on waking (floors 11 to 16 the art's own, a grate, a door, a gate; 17 to 20 a waypoint's dais, its
## column flaring), its line (game.ts wayOpenLine), walked into: on to the next floor; from the fifteenth and the twentieth, home.
## A picture and a line at each step, and the sum: CITYWAYS.
func _cityways_shots(h: Hero, dir: String) -> void:
	loot.level = 30
	loot.ring_lit = true
	loot.derive()
	loot.taught = true
	way_depth = 20
	var first := int(_arg("floor")) if _arg("floor") != "" else 11
	await go_to("floor%d" % first, "down")
	var last := int(_arg("to")) if _arg("to") != "" else 20
	for n in range(first, last + 1):
		if place != "floor%d" % n:
			await go_to("floor%d" % n, "down")
		await _wait(1.3)
		h.life = h.max_life
		var bosses: Array = []
		for m in _monsters.list:
			if is_instance_valid(m) and m.boss and not m.dead:
				bosses.append(m)
		if bosses.is_empty() or ways == null:
			await _d_step(dir, "c%d_no_boss" % n, false, "floor %d has no boss or no way on" % n)
			continue
		var kind: String = ways.way_kind()
		h.world = _free_near(bosses[0].world + Vector2(2.5, 2.5))
		await _wait(0.5)
		await _d_step(dir, "c%d_boss" % n, ways.state == "" and kind == ("onward" if n <= 16 else "plain"),
			"%s: %s; its way on (%s) shut while they live" % [place_title(), ", ".join(bosses.map(func(m): return m.title)), kind])
		# (every one of them: one that splits, or has a twin, leaves more to strike down)
		for round in 4:
			var left: Array = []
			for m in _monsters.list:
				if is_instance_valid(m) and m.boss and not m.dead:
					left.append(m)
			if left.is_empty():
				break
			for m in left:
				await _d_kill(m)
			await _wait(0.6)
		h.life = h.max_life
		var want: String = ways.HOME_OPEN if n < 16 else ("The way home is open." if n >= 20 else ways.ON_OPEN)
		await _w_until(func(): return ways.state == "open", 6.0)
		await _wait(0.3)
		var line: String = _wu_said(want)
		var at := Vector2.ZERO
		if kind == "onward":
			var takes: Array = ways.onward_tiles("takes")
			var i0: int = takes[takes.size() / 2] if not takes.is_empty() else -1
			at = Vector2(i0 % map.w + 0.5, i0 / map.w + 0.5) if i0 >= 0 else Vector2(-1, -1)
		else:
			var on: Dictionary = map.ways["onward"]
			at = Vector2(float(on["x"]), float(on["y"]))
		# (he stands back from it, on his side of it, to see it open)
		var stand := h.world
		var best := INF
		for ty in range(floori(at.y) - 4, floori(at.y) + 5):
			for tx in range(floori(at.x) - 4, floori(at.x) + 5):
				var p := Vector2(tx + 0.5, ty + 0.5)
				var d := p.distance_to(at)
				if d >= 2.0 and d <= 3.5 and map.walkable(tx, ty) and p.distance_to(h.world) < best:
					best = p.distance_to(h.world)
					stand = p
		h.world = stand
		await _wait(0.4)
		await _d_step(dir, "c%d_way_open" % n, ways.state == "open" and line != "" and at.x >= 0.0 and map.walkable(floori(at.x), floori(at.y)),
			"its way on %s after %.2f s: \"%s\"; its way in (%.1f, %.1f) walkable (%s)" % [ways.state, ways._t, line, at.x, at.y, map.walkable(floori(at.x), floori(at.y))])
		h.life = h.max_life
		var was := place
		var level := str(map.title.get("level", ""))
		h.world = at
		await _w_until(func(): return place != was and not _going, 4.0)
		await _wait(0.4)
		var to := "floor%d" % (n + 1) if n != 15 and n < 20 else home_place()
		var cleared := ""
		if n == 15 or n == 20:
			cleared = _wu_said("%s cleared." % level)
		await _d_step(dir, "c%d_taken" % n, place == to and (cleared != "" or (n != 15 and n != 20)),
			"walked into: on to %s (%s)%s" % [place, place_title(), (" \"%s\"" % cleared) if cleared != "" else ""])
	print("CITYWAYS: %d of %d steps as the game has them%s" % [_d_n - _d_bad.size(), _d_n, ("; not: " + ", ".join(_d_bad)) if not _d_bad.is_empty() else ""])


## SHOT MODE, INTO THE DESCENT AND THROUGH IT (--only=descent): a hero the armourer has rewarded (the furnace out), in town: the
## barred gate come up to; the wordsmith asking for the Meldstone; floor 5, the Fleshmancer struck dead, the Meldstone bursting up
## where he went down, hanging, taken; the cage up to town; the stone given to the wordsmith (the two words, the lesson, the gate
## unbarred); the gate come up to, its bars struck off, rising; through it to floor 6; on each of floors 6 to 10, where he comes in
## (its name across the screen, its music, its light, its pits), its boss struck dead, its way on opening and taken; from floor
## 10, home to town through its gate. A picture and a line at each step, and the sum: DESCENT.
func _descent_shots(h: Hero, dir: String) -> void:
	loot.ring_lit = true
	loot.furnace = "done"
	loot.cleared = 4
	# (a hero well on in levels, every word slot open, so that no level he gains opens the gear screen on the way)
	loot.level = 20
	loot.derive()
	h.life = h.max_life
	# (his first word long since set: POWER on his Strike, so that a word come by is only taken up)
	loot.taught = true
	h.loadout.put(0, "front", "power")
	way_depth = 5
	# (a hero who has seen the town from the eyrie: the Queen's fall plays no scene here: act1/quest610.gd, --only=quests610)
	if quest610 != null:
		quest610.city_seen = true
	await _wait(1.2)
	# --- the town: the gate barred, the wordsmith's ask ---
	var g: Dictionary = town._gate
	var gm := Vector2(g["middle"]["x"], g["middle"]["y"])
	h.world = gm + Vector2(0, 3.5)
	h.face = Vector2(0, -1)
	await _wait(1.6)
	await _d_step(dir, "gate_barred", town.barred and town.gate_open == 0.0 and _wu_said("The gate is barred.") != "" and not map.walkable(int(g["tiles"][1]) % map.w, int(g["tiles"][1]) / map.w),
		"in town, before the gate: barred, it does not rise (up %.2f, its doorway shut), and the line \"%s\"" % [town.gate_open, _wu_said("The gate is barred.")])
	h.world = _spot_near(Vector2(9.5, 14.5), 1.4, h.world)
	await _wait(0.5)
	var asked: String = town.prompt[0]
	await _key(KEY_E)
	await _wait(0.3)
	await _d_step(dir, "wordsmith_asks", asked == "E: Wordsmith: a task" and loot.meld_ask and _wu_said(loot.MELD_ASK) != "",
		"the wordsmith, used (\"%s\"), asks: \"%s\"" % [asked, _wu_said("The wordsmith: \"The cult")])
	# --- floor 5: the Fleshmancer, the Meldstone ---
	go_to("floor5", "down")
	await _wait(1.8)
	var fm := _d_boss()
	h.world = _free_near(fm.world + Vector2(2.5, 2.5))
	await _wait(1.0)
	await _d_step(dir, "f5_fleshmancer", fm != null and fm.kind == "fleshmancer", "%s (%s): %s in his hall" % [place_title(), map.title.get("name", ""), fm.title if fm != null else "no boss"])
	await _d_kill(fm)
	var fell := fm.world
	await _wait(0.15)
	await _d_step(dir, "f5_struck_dead", fm.dead and _d_stone() != null and _d_stone()["at"].distance_to(fell) < 0.01,
		"the Fleshmancer struck dead at (%.2f, %.2f); the Meldstone waits under the floor there (%s)" % [fell.x, fell.y, str(_d_stone()["at"]) if _d_stone() != null else "none"])
	await _w_until(func(): return _d_stone() == null or _d_stone()["age"] >= -0.15, 4.0)
	await _d_step(dir, "f5_stone_crack", _d_stone() != null and _d_stone()["pics"][0].visible, "%.2f s after: the crack of its light in the floor where he went down" % (_d_stone()["age"] + loot.STONE_WAIT if _d_stone() != null else -1.0))
	await _w_until(func(): return _d_stone() == null or _d_stone()["age"] >= 0.2, 1.0)
	await _d_step(dir, "f5_stone_bursts_up", _d_stone() != null and loot.rise_of(_d_stone()["age"], 0.0)["shown"] == "apart", "it shoots up spinning, its halves torn apart")
	await _w_until(func(): return _d_stone() == null or _d_stone()["age"] >= 0.62, 1.0)
	await _d_step(dir, "f5_stone_slams", _d_stone() != null and _d_stone()["slammed"], "it slams together in a burst of light (the screen kicked)")
	await _w_until(func(): return _d_stone() == null or _d_stone()["age"] >= 1.5, 1.5)
	var st = _d_stone()
	await _d_step(dir, "f5_stone_hangs", st != null and st["label"].visible and loot.meld == "", "it hangs over the floor, turning to and fro, \"Meldstone\" over it; not yet taken")
	if st != null:
		h.world = _free_near(st["at"] + Vector2(0.6, 0.6))
	await _w_until(func(): return loot.meld != "", 2.0)
	await _wait(0.33)
	await _d_step(dir, "f5_stone_taken", loot.meld == "stone" and _wu_said("You take the MELDSTONE.") != "", "walked up to, taken: it leaps over his head and into him (meld \"%s\"; \"%s\")" % [loot.meld, _wu_said("You take the MELDSTONE.")])
	await _w_until(func(): return ways.state == "open", 6.0)
	var sh: Dictionary = map.ways["shaft"]
	h.world = _free_near(Vector2(float(sh["x"]) + 0.5, float(sh["y"]) + 2.5))
	await _wait(0.6)
	await _d_step(dir, "f5_cage_down", ways.way_kind() == "shaft" and ways.state == "open", "the cage down the shaft (%s after %.1f s)" % [ways.state, ways._t])
	h.world = Vector2(float(sh["x"]) + 0.5, float(sh["y"]) + 0.5)
	await _w_until(func(): return place == "town" and not _going, 3.0)
	await _wait(1.2)
	await _d_step(dir, "town_up_the_cage", place == "town" and town.barred and _wu_said("Prison Level 5 cleared") != "",
		"up the cage to town: \"%s\"; the gate still barred (way depth %d)" % [_wu_said("Prison Level 5 cleared"), way_depth])
	# --- the Meldstone given ---
	h.world = _spot_near(Vector2(9.5, 14.5), 1.4, h.world)
	await _wait(0.5)
	var giving: String = town.prompt[0]
	var had := [int(loot.words.get("fire", 0)), int(loot.words.get("frost", 0))]
	await _key(KEY_E)
	await _wait(0.4)
	var said := [_wu_said(loot.MELD_TAKES), _wu_said("He gives you two words"), _wu_said(loot.MELD_LESSON[0]), _wu_said(loot.MELD_LESSON[1]), _wu_said("The wordsmith unbars the gate")]
	await _d_step(dir, "wordsmith_given", giving == "E: Give the Meldstone" and loot.meld == "open" and int(loot.words.get("fire", 0)) == had[0] + 1 and int(loot.words.get("frost", 0)) == had[1] + 1 and not said.has("") and way_depth == 6 and town.unbar == -1.0,
		"\"%s\": FLAME %d -> %d, FROST %d -> %d; said: %s" % [giving, had[0], int(loot.words.get("fire", 0)), had[1], int(loot.words.get("frost", 0)), " / ".join(said)])
	# (the stone's flight to the slab takes nearly three seconds, town.gd GIVEN: waited for, four at the most)
	await _w_until(func(): return town._kept.size() == 2 and town._kept[0].visible, 4.0)
	await _d_step(dir, "wordsmith_keeps_it", town._kept.size() == 2 and town._kept[0].visible, "the Meldstone kept over his slab, going round the column of light")
	# --- the gate unbarred, rising, through it ---
	h.world = gm + Vector2(0, 4.5)
	h.face = Vector2(0, -1)
	await _w_until(func(): return town.unbar != null and town.unbar >= 0.3, 2.0)
	await _d_step(dir, "gate_unbarring", town.unbar != null and _wu_said("The gate is unbarred. Beyond it, the mountain road.") != "", "in sight of the gate: its bars begin to be struck off, the seal flaring: \"%s\"" % _wu_said("The gate is unbarred."))
	await _w_until(func(): return town.unbar == null or town.unbar >= 0.62, 1.0)
	await _d_step(dir, "gate_lock_bursts", town.barred, "the lock bursts, the beams fall (the gate still down)")
	await _w_until(func(): return town.unbar == null or town.unbar >= 1.4, 1.5)
	await _d_step(dir, "gate_chains_fall", town.barred and town.gate_open == 0.0, "the chains slither down")
	await _w_until(func(): return not town.barred, 2.0)
	await _wait(0.5)
	await _d_step(dir, "gate_rising", not town.barred and town.gate_want == 1.0 and town.gate_open > 0.2 and town.gate_open < 1.0, "unbarred, it rises as he comes (up %.2f), what is left of the bars at its foot" % town.gate_open)
	await _wait(0.9)
	await _d_step(dir, "gate_up", town.gate_open == 1.0 and map.walkable(int(g["tiles"][1]) % map.w, int(g["tiles"][1]) / map.w), "the gate up, its doorway open")
	h.world = gm
	await _w_until(func(): return place == "floor6" and not _going, 3.0)
	# --- floors 6 to 10 ---
	for n in range(6, 11):
		if place != "floor%d" % n:
			await _d_step(dir, "f%d_not_come_into" % n, false, "floor %d was not come into (in %s)" % [n, place])
			break
		await _wait(1.3)
		var pits := 0
		var walked := 0
		var shut := 0
		for i in map.tiles.size():
			if map.tiles[i] == FloorMap.PIT:
				pits += 1
				walked += 1 if map.walk[i] != 0 else 0
				shut += 0 if map.open_at(i % map.w, i / map.w) else 1
		var card: Dictionary = _hud.floor_card
		var veil: float = _veil.material.get_shader_parameter("veil_a")
		var in_ok: bool = h.world.distance_to(map.start) < 0.05 and h.face.distance_to(map.start_face) < 0.01 and card.get("name", "") == map.title.get("name", "-") and music._place == "f%d" % n and walked == 0 and shut == 0
		await _d_step(dir, "f%d_in" % n, in_ok,
			"floor %d: he comes in at (%.2f, %.2f) facing (%d, %d), as the game sets him down; across the screen \"%s\" / \"%s\"; the music %s; the day's veil %.2f; %d pits, %d walked on, %d not seen across" %
			[n, h.world.x, h.world.y, h.face.x, h.face.y, card.get("name", ""), card.get("level", ""), music._place, veil, pits, walked, shut])
		var boss := _d_boss()
		if boss == null:
			await _d_step(dir, "f%d_no_boss" % n, false, "floor %d has no boss" % n)
			break
		h.world = _free_near(boss.world + Vector2(2.5, 2.5))
		await _wait(1.0)
		await _d_step(dir, "f%d_boss" % n, ways != null and ways.way_kind() == "onward" and ways.state == "", "%s: by %s (%s); the way on shut while he lives" % [map.title.get("name", ""), boss.title, boss.kind])
		await _d_kill(boss)
		await _wait(0.3)
		await _d_step(dir, "f%d_boss_dead" % n, boss.dead and ways.state == "opening", "%s struck dead: the way on wakes (%s)" % [boss.title, ways.state])
		var a1: Dictionary = map.ways["a1"]
		var ref := Vector2(float(a1["way"]["ref"]["x"]), float(a1["way"]["ref"]["y"]))
		var back: Vector2i = ways.turn_ab(str(a1["way"]["dir"]), -3, 0)
		h.world = _free_near(ref + Vector2(back) + Vector2(0.5, 0.5))
		await _w_until(func(): return ways.state == "open", 6.0)
		var line: String = _wu_said(ways.HOME_OPEN if n >= 10 else ways.ON_OPEN)
		var thrown_ok := true
		for i in ways.onward_tiles("thrown"):
			if map.walk[i] != 0 and floori(h.world.y) * map.w + floori(h.world.x) != i:
				thrown_ok = false
		await _d_step(dir, "f%d_way_open" % n, ways.state == "open" and line != "" and thrown_ok and absf(ways._t - float(ways.ONWARD[n]["secs"])) < 0.25,
			"its way on open after %.2f s (its film %.2f s), what it threw out solid: \"%s\"" % [ways._t, float(ways.ONWARD[n]["secs"]), line])
		var takes: Array = ways.onward_tiles("takes")
		var i0: int = takes[takes.size() / 2]
		var on_at := Vector2i(i0 % map.w, i0 / map.w)
		h.world = Vector2(i0 % map.w + 0.5, i0 / map.w + 0.5)
		var was := place
		await _w_until(func(): return place != was and not _going, 3.0)
		await _wait(0.2)
		var to := "floor%d" % (n + 1) if n < 10 else "camp"
		await _d_step(dir, "f%d_taken" % n, place == to, "onto its way in (%d, %d): on to %s (%s)" % [on_at.x, on_at.y, place, place_title()])
	# --- home: the camp inside Vellum's gate, his town from now on (game/camp.ts; game.ts takeWay 'on' from the Fen) ---
	if place == "camp":
		await _wait(1.2)
		var home: String = _wu_said("The Sunken Fen, Level 10 cleared. The siege is broken.")
		await _d_step(dir, "home", home != "" and way_depth >= 11 and home_place() == "camp" and h.world.distance_to(Vector2(13.6, 22.5)) < 0.3,
			"home: in through the city gate into the camp inside Vellum's gate, at its mouth (%.1f, %.1f), his town from now on (way depth %d): \"%s\"" % [h.world.x, h.world.y, way_depth, home])
	print("DESCENT: %d of %d steps as the game has them%s" % [_d_n - _d_bad.size(), _d_n, ("; not: " + ", ".join(_d_bad)) if not _d_bad.is_empty() else ""])


# =============================================================================================================================
# THE BOSSES OF FLOORS 8 AND 9 (the Cantor, the Hollow Stag: scripts/act1/cantor.gd, stag.gd), their check: --only=boss --floor=8
# (or 9). He waits on his ground for the hero (pictured from 8.5 tiles off), meets him within 6 and says his line (pictured);
# then the hero, struck now (his life kept full, each blow counted by what dealt it), is kept in his reach while he fights, and
# each of his moves' moments is pictured as it comes (`_b89_moments`). The Cantor's copies are then made to repeat each of his
# three moves in turn; the Stag is put at 3/4, 1/2 and 1/4 of his life, so that the wood closes in three times, the hero
# standing on the new edge the first time (thrown in), and the fence is tried. Then he is struck dead, his death pictured, and
# the way on watched as it wakes. Two lines, BOSS89.

var _b89_hits := {}
var _b89_done := {}
var _b89_k := 0


func _boss89_shots(h: Hero, dir: String, boss: Monster) -> void:
	var n: int = map.depth
	var tag := dir + "/b%d_" % n
	var P := _monsters.perils
	var said: Array = []
	# (the floor's other monsters near his ground taken away, so that what strikes the hero is his)
	for o in _monsters.list:
		if is_instance_valid(o) and o != boss and o.world.distance_to(boss.world) < 30.0:
			o.queue_free()
	await _wait(0.1)
	# 1. HE WAITS ON HIS GROUND, until the hero comes into it
	h.world = _spot_near(boss.world, 13.0, boss.world)
	await _wait(0.8)
	said.append("waits with the hero %.1f off: %s" % [h.world.distance_to(boss.world), boss.waits])
	await _snap(tag + "00_he_waits.png")
	h.world = _spot_near(boss.world, 5.0, boss.world)
	await _wait(1.4)
	await _snap(tag + "01_his_line.png")
	var t := 0.0
	while boss.waits and t < 8.0:
		await get_tree().process_frame
		t += get_process_delta_time()
	said.append("met and woken (%s), his line said, fighting after %.1f s more" % [boss.state, t])
	# 2. THE FIGHT, the hero struck
	h.unhurt = false
	h.max_life = 1e6
	h.life = h.max_life
	_monsters.used = {}
	_b89_hits = {}
	_b89_done = {}
	_b89_k = 1
	var moments := _b89_moments(boss, P)
	var SG = Monster.BOSS_AI["stag"]
	if boss.kind == "cantor":
		await _b89_watch(h, boss, P, moments, tag, 50.0, 3.0, "")
		# (his copies made to repeat each of his three moves: his last move set, his copies' wait run out)
		for last in [0, 1, 2]:
			await _b89_watch(h, boss, P, moments, tag, 8.0, 3.0, "free")
			boss.h2.a1["last"] = last
			# (his copies' wait run out, his shout's and his rockfall's not, so that the copies are what he makes next)
			if boss.h2.cds.size() > 3:
				boss.h2.cds[2] = 0.0
				boss.h2.cds[1] = maxf(boss.h2.cds[1], 4.0)
				boss.h2.cds[3] = maxf(boss.h2.cds[3], 4.0)
			boss._cd = 0.0
			h.world = _spot_near(boss.world, 4.0, h.world)
			await _b89_watch(h, boss, P, moments, tag, 6.0, 4.0, "copies")
			await _b89_watch(h, boss, P, moments, tag, 4.0, 4.0, "copies out")
			var rep := []
			for p in boss.h2.copies_of(boss):
				rep.append(["his strike", "his shout", "his rockfall"][int(p["a"])])
			await _b89_watch(h, boss, P, moments, tag, 6.5, 4.0, "no copies")
			said.append("copies made, set to repeat %s: repeating %s" % [["his strike", "his shout", "his rockfall"][last], rep])
		# (and once more, to be struck dead while his copies stand)
		await _b89_watch(h, boss, P, moments, tag, 8.0, 3.0, "free")
		boss.h2.cds[2] = 0.0
		boss._cd = 0.0
		h.world = _spot_near(boss.world, 4.0, h.world)
		await _b89_watch(h, boss, P, moments, tag, 6.0, 4.0, "copies")
		await _b89_watch(h, boss, P, moments, tag, 4.0, 4.0, "copies out")
		await _b89_watch(h, boss, P, moments, tag, 0.6, 4.0, "")
	else:
		await _b89_watch(h, boss, P, moments, tag, 45.0, 4.0, "")
		# (the wood closes in at 3/4, 1/2 and 1/4 of his life; the first time the hero stands on the new edge)
		var a1: Dictionary = boss.h2.own(boss)
		var mid := Vector2(a1["cx"], a1["cy"])
		for s in 3:
			await _b89_watch(h, boss, P, moments, tag, 6.0, 4.0, "idle")
			boss.life = boss.max_life * float([0.74, 0.49, 0.24][s])
			if s == 0:
				h.world = _free_near(mid + SG.edge(atan2(h.world.y - mid.y, h.world.x - mid.x), 0.8))
			var struck: int = _b89_hits.get("stag:close", 0)
			await _b89_watch(h, boss, P, moments, tag, 6.0, 4.0, "closed %d" % (s + 1))
			var inside: bool = SG.inside_clearing(h.world.x, h.world.y, mid.x, mid.y, a1["k"], 0.0)
			said.append("closed to %.1f (stage %d): the hero %s by it, inside after %s" % [a1["k"], a1.get("stage", 0), "struck" if _b89_hits.get("stag:close", 0) > struck else "not struck", inside])
			if s == 0:
				# (the fence: past the wall a body may not stand; inside it, it may)
				var out: Vector2 = mid + SG.edge(0.3, 0.9)
				var inn: Vector2 = mid + SG.edge(0.3, 0.55)
				said.append("fence: past the wall %s, inside it %s" % [map.fits(out.x, out.y, 0.3), map.fits(inn.x, inn.y, 0.3)])
				# (his charge: the hero set down 6 tiles off him, inside the wall, his run clear; a few times, so that it is made)
				for tries in 4:
					await _b89_watch(h, boss, P, moments, tag, 6.0, 4.0, "idle")
					var was: int = _monsters.used.get("stag_charge", 0)
					var spot := _b89_charge_spot(boss, mid, float(a1["k"]))
					if spot == Vector2.INF:
						continue
					h.world = spot
					boss.h2.cds[2] = 0.0
					boss._cd = 0.0
					await _b89_watch(h, boss, P, moments, tag, 3.0, 9.0, "charged %d" % was)
					await _b89_watch(h, boss, P, moments, tag, 3.0, 9.0, "idle")
				said.append("charges made: %d" % _monsters.used.get("stag_charge", 0))
			await _b89_watch(h, boss, P, moments, tag, 8.0, 4.0, "")
	print("BOSS89 floor %d moves made: %s" % [n, _monsters.used])
	# 3. HIS DEATH, AND THE WAY ON
	h.life = h.max_life
	var copies := 0
	if boss.kind == "cantor":
		copies = boss.h2.copies_of(boss).size()
	boss.hurt(1e9)
	var after := ""
	if boss.kind == "cantor":
		var fading := 0
		var gone_by := 0.0
		for p in boss.h2.copies_of(boss):
			fading += 1 if int(p["done"]) & 64 else 0
			gone_by = maxf(gone_by, float(p["dur"]) - float(p["t"]))
		after = "%d copies out as he died, %d of them ringing out, gone %.2f s after" % [copies, fading, gone_by]
	await _wait(0.2)
	await _snap(tag + "%02d_dying.png" % (_b89_k + 1))
	if boss.kind == "cantor":
		pass
	else:
		after = "the fence %s, his wall %s" % ["gone" if map.fence == null else "STILL UP", "sinking" if SG.wall_of(boss) != null else "never risen"]
	await _wait(1.4)
	await _snap(tag + "%02d_fallen.png" % (_b89_k + 2))
	var w := 0.0
	while ways != null and ways.state != "opening" and ways.state != "open" and w < 3.0:
		await get_tree().process_frame
		w += get_process_delta_time()
	var way_then: String = ways.state if ways != null else "none"
	if map.ways != null and map.ways.get("onward") != null:
		var on: Dictionary = map.ways["onward"]
		h.world = _free_near(Vector2(on["x"], on["y"]) + (boss.world - Vector2(on["x"], on["y"])).normalized() * 4.0)
		await _wait(0.8)
		await _snap(tag + "%02d_the_way_on.png" % (_b89_k + 3))
	print("BOSS89 floor %d (%s, %s): %s; moments pictured %d of %d: %s; not: %s; the hero struck %s; dead %s, %s; the way on: %s" % [
		n, boss.kind, boss.title, "; ".join(said), _b89_done.size(), moments.size(), _b89_done.keys(), moments.keys().filter(func(q): return not _b89_done.has(q)),
		_b89_hits, boss.dead, after, way_then])


## A while of the fight, at most `secs`, or until `until` holds ("free": he makes no act and has no copies out; "copies": he has
## made his copies again; "no copies": none of his are out; "idle": he makes no act; "closed N": his wood has closed in N times
## and he is free again): every blow on the hero counted by what dealt it and his life filled again; every moment pictured the
## first time it holds; the hero put back in his reach if he is far.
func _b89_watch(h: Hero, boss: Monster, P: Perils, moments: Dictionary, tag: String, secs: float, away: float, until: String) -> void:
	var copies0: int = _monsters.used.get("cantor_copies", 0)
	var w := 0.0
	while w < secs and not boss.dead:
		var acting: bool = boss.h2.act != null
		var copies: int = boss.h2.copies_of(boss).size() if boss.kind == "cantor" else 0
		if until == "free" and not acting and copies == 0:
			return
		if until == "copies" and _monsters.used.get("cantor_copies", 0) > copies0:
			return
		if until == "no copies" and copies == 0 and not acting:
			return
		if until == "copies out" and copies > 0:
			return
		if until == "idle" and not acting:
			return
		if until.begins_with("closed ") and int(boss.h2.a1.get("stage", 0)) >= int(until.substr(7)) and not acting:
			return
		if until.begins_with("charged ") and _monsters.used.get("stag_charge", 0) > int(until.substr(8)):
			return
		await get_tree().process_frame
		w += get_process_delta_time()
		if h.life < h.max_life:
			var by := _b89_by(boss, P)
			_b89_hits[by] = _b89_hits.get(by, 0) + 1
			h.life = h.max_life
		for name in moments:
			if not _b89_done.has(name) and moments[name].call():
				_b89_done[name] = true
				await _snap(tag + "%02d_%s.png" % [_b89_k + 1, name])
				_b89_k += 1
		if h.world.distance_to(boss.world) > 9.0:
			h.world = _spot_near(boss.world, away, boss.world)


## A place 6 tiles from the Stag inside his wall, with his run to it and on clear (his charge's), or INF.
func _b89_charge_spot(boss: Monster, mid: Vector2, k: float) -> Vector2:
	var SG = Monster.BOSS_AI["stag"]
	for i in 16:
		var f := Vector2(cos(i * TAU / 16.0), sin(i * TAU / 16.0))
		var p: Vector2 = boss.world + f * 6.0
		if not SG.inside_clearing(p.x, p.y, mid.x, mid.y, k, 0.3, 0.3):
			continue
		var ok := true
		var d := 0.4
		while d <= 6.0 and ok:
			var q: Vector2 = boss.world + f * d
			ok = map.fits(q.x, q.y, 0.42)
			d += 0.3
		if ok:
			return p
	return Vector2.INF


## What dealt the blow the hero has just taken: a rock just come down, one of the Cantor's copies, the boss's own blow (the act
## he is making, at the moment its blow lands), or another (one he called up, one of the floor's).
const _B89_BLOWS := {"cantor:strike": [[1.0, 1.1], [1.45, 1.55]], "cantor:shout": [[1.0, 2.0]], "stag:gore": [[0.9, 1.0]], "stag:stare": [[0.0, 0.1]],
	"stag:charge": [[1.0, 1.6]], "stag:close": [[1.4, 1.5]]}


func _b89_by(boss: Monster, P: Perils) -> String:
	for p in P.list:
		if p["kind"] == "a1" and p["a1"] == "cantor:rock" and int(p["done"]) == 1 and float(p["t"]) - float(p["hit"]) < 0.06:
			return "rock" if int(p["a"]) == 1 else "his rock"
	for p in P.list:
		if p["kind"] == "a1" and p["a1"] == "cantor:copy" and int(p["done"]) & 32 and not (int(p["done"]) & 64):
			return "copy repeating %s" % ["strike", "shout", "rockfall"][int(p["a"])]
	if not boss.dead and boss.h2 != null and boss.h2.act != null:
		var id := str(boss.h2.acts()[boss.h2.act["i"]]["id"])
		for w in _B89_BLOWS.get(id, []):
			if float(boss.h2.act["t"]) >= float(w[0]) and float(boss.h2.act["t"]) <= float(w[1]) + 0.05:
				return id
	return "another (one he called up, one of the floor's)"


## The moments of each one's moves to picture, by name: each pictured the first time it holds.
func _b89_moments(boss: Monster, P: Perils) -> Dictionary:
	var acting := func(id: String, t0: float, t1: float) -> Callable:
		return func() -> bool:
			var a = boss.h2.act
			return a != null and boss.h2.acts()[a["i"]]["id"] == id and float(a["t"]) >= t0 and float(a["t"]) <= t1
	var copy := func(which: int, t0: float, t1: float) -> Callable:
		return func() -> bool:
			for p in P.list:
				if p["kind"] == "a1" and p["a1"] == "cantor:copy" and int(p["a"]) == which and float(p["t"]) - float(p["d"]) >= t0 and float(p["t"]) - float(p["d"]) <= t1:
					return true
			return false
	var has := func(name: String, ok: Callable) -> Callable:
		return func() -> bool:
			for p in P.list:
				if p["kind"] == "a1" and p["a1"] == name and ok.call(p):
					return true
			return false
	if boss.kind == "cantor":
		return {
			"strike_held": acting.call("cantor:strike", 0.7, 0.97), "strike_blow": acting.call("cantor:strike", 1.0, 1.12),
			"strike_echo_glows": acting.call("cantor:strike", 1.2, 1.4),
			"shout_marked": acting.call("cantor:shout", 0.6, 0.95), "shout_out": acting.call("cantor:shout", 1.15, 1.4), "shout_back": acting.call("cantor:shout", 1.6, 1.85),
			"copies_tear": acting.call("cantor:copies", 0.9, 1.4),
			"copies_stand": has.call("cantor:copy", func(p): return float(p["t"]) < float(p["d"])),
			"copy_strike": copy.call(0, 0.98, 1.3), "copy_shout": copy.call(1, 1.2, 1.6), "copy_rockfall": copy.call(2, 1.45, 1.75),
			"copy_rings_out": has.call("cantor:copy", func(p): return float(p["t"]) > float(p["dur"]) - 0.25),
			"rockfall_sings": acting.call("cantor:rockfall", 0.95, 1.25), "rocks_fall": acting.call("cantor:rockfall", 1.45, 1.62),
			"rubble": acting.call("cantor:rockfall", 2.05, 2.4),
		}
	var wall := func(k: float, t0: float) -> Callable:
		return has.call("stag:wall", func(p): return absf(float(p["c"]) - k) < 0.01 and float(p["t"]) - float(p["hit"]) >= t0)
	return {
		"bounds": func() -> bool: return boss.h2.act == null and boss.h2.mode == "walk" and boss.h2.gt > 0.3,
		"gore_marked": acting.call("stag:gore", 0.55, 0.85), "gore_sweep": acting.call("stag:gore", 0.93, 1.15),
		"stares": acting.call("stag:stare", 0.4, 1.0),
		"charge_lane": acting.call("stag:charge", 0.55, 0.95), "charge_runs": acting.call("stag:charge", 1.12, 1.4), "charge_crash": acting.call("stag:charge", 1.56, 1.9),
		"bellows": acting.call("stag:bellow", 0.9, 1.25), "wolves_answer": acting.call("stag:bellow", 1.6, 2.2),
		"close_marked": acting.call("stag:close", 0.7, 1.3), "close_bursts": acting.call("stag:close", 1.43, 1.55),
		"wall_stands": wall.call(0.8, 1.3), "wall_inside_sinks": wall.call(0.6, 0.62), "wall_at_0.4": wall.call(0.4, 1.3),
		"wall_splintered": has.call("stag:wall", func(p): return float(p["fy"]) >= 0.0 and float(p["t"]) - float(p["fy"]) >= 0.2 and float(p["t"]) - float(p["fy"]) <= 1.2),
	}
# THE BOSSES OF FLOORS 6 AND 7 (scripts/act1/unfinished.gd, queen.gd): --only=boss --floor=6 or 7. The hero, not to be harmed,
# comes into the boss's ground (his line, his name); then each of the boss's moves and phases is made in turn (its wait put out,
# the others' held, the hero set where it reaches him) and pictured at its moments, and whether the hero was struck by it
# (hero.gd last_blow) is counted; then the boss is struck dead, pictured as it falls, and its way on watched waking. The
# Unfinished: in the wall its four, tearing free at 85% of its life, free its four and its walk; the Carrion Queen: her rake,
# gust, dive, call (her flock called in), Eclipse (the dark, its pools, a dive of her flock), a hop about her eyrie, her life
# held at a hundredth until she has flown home to her perch, and her fall off the edge. One line, BOSS, sums each up.

var _b67 := {}


## A step of the check: a blow that landed on him since the last, told by what struck (the boss's act, or the mark of his that
## struck as it did).
func _b67_tick(boss: Monster) -> void:
	var h: Hero = hero
	var label := ""
	for p in _monsters.perils.list:
		if p["kind"] != "a1":
			continue
		if not p.has("_n"):
			_b67["n"] = int(_b67.get("n", 0)) + 1
			p["_n"] = _b67["n"]
		var was: int = _b67["done"].get(p["_n"], 0)
		if int(p["done"]) != was:
			_b67["done"][p["_n"]] = int(p["done"])
			if int(p["done"]) == 1:
				label = p["a1"]
	if not is_same(h.last_blow, _b67.get("last")):
		_b67["last"] = h.last_blow
		if label == "" and is_instance_valid(boss) and boss.h2 != null and boss.h2.act != null:
			label = boss.h2.acts()[boss.h2.act["i"]]["id"]
		# (one of her flock, called in, diving at him)
		for o in _monsters.list:
			if label == "" and is_instance_valid(o) and o != boss and not o.dead and o.h2 != null and o.h2.act != null:
				label = o.h2.acts()[o.h2.act["i"]]["id"]
		if label == "":
			label = "other"
		_b67["hits"][label] = int(_b67["hits"].get(label, 0)) + 1
	if is_instance_valid(boss) and boss.kind == "queen" and not _b67.get("roam", false) and not boss.dead:
		boss.h2.a1["roamT"] = 999.0
	h.life = h.max_life


## Frames until `secs` have gone or `until` says so.
func _b67_run(boss: Monster, secs: float, until := Callable()) -> void:
	var t := 0.0
	while t < secs and not (until.is_valid() and until.call()):
		await get_tree().process_frame
		t += get_process_delta_time()
		_b67_tick(boss)


## Its act `id` made now: its wait put out and every other act's held, the hero set `away` before it (along `way`, or as it
## faces), and the act pictured at each of `times` (seconds into it; `then`, what is done there, by the time) and `after`
## seconds after it is over.
func _b67_act(boss: Monster, id: String, away: float, times: Array, after := 0.6, way := Vector2.ZERO, then := {}) -> bool:
	var AI = boss.h2
	var A: Array = AI.acts()
	var i := -1
	for k in A.size():
		if A[k]["id"] == id:
			i = k
	if AI.cds.size() != A.size():
		AI.cds = []
		for a in A:
			AI.cds.append(0.0)
	for k in A.size():
		AI.cds[k] = 0.0 if k == i else 99.0
	boss._cd = 0.0
	var f: Vector2 = way if way != Vector2.ZERO else boss.face
	hero.world = _free_near(boss.world + f.normalized() * away)
	var began := func() -> bool: return AI.act != null and int(AI.act["i"]) == i
	await _b67_run(boss, 8.0, began)
	if not began.call():
		_b67["missed"].append(id)
		return false
	var act: Dictionary = AI.act
	var name := id.get_slice(":", 1)
	for T in times:
		await _b67_run(boss, 6.0, func() -> bool: return not is_same(AI.act, act) or float(act["t"]) >= float(T))
		_b67["k"] = int(_b67.get("k", 0)) + 1
		await _snap(_b67["tag"] + "%02d_%s_%.2f.png" % [_b67["k"], name, float(T)])
		if then.has(T):
			then[T].call()
	await _b67_run(boss, 6.0, func() -> bool: return not is_same(AI.act, act))
	if after > 0.0:
		await _b67_run(boss, after)
		_b67["k"] = int(_b67["k"]) + 1
		await _snap(_b67["tag"] + "%02d_%s_after.png" % [_b67["k"], name])
	return true


func _b67_snap(name: String) -> void:
	_b67["k"] = int(_b67.get("k", 0)) + 1
	await _snap(_b67["tag"] + "%02d_%s.png" % [_b67["k"], name])


func _boss67_shots(h: Hero, dir: String, n: int) -> void:
	go_to("floor%d" % n, "down")
	await _wait(1.5)
	if sight != null:
		sight.see_all()
	var boss := _d_boss()
	if boss == null:
		print("BOSS: floor %d has none" % n)
		return
	_b67 = {"tag": dir + "/b%d_" % n, "hits": {}, "done": {}, "missed": [], "k": 0}
	var AI = boss.h2
	if boss.kind == "queen":
		AI._keep_flock(boss)
	# (the boss alone with him)
	for o in _monsters.list:
		if is_instance_valid(o) and o != boss:
			o.queue_free()
	h.unhurt = true
	var perch := boss.world
	var base: Vector2 = boss.face
	# HE COMES INTO ITS GROUND: it waits, then says its line, its name across the screen
	h.world = _free_near(perch + base * 9.0)
	await _wait(0.6)
	var waited_far: bool = boss.waits
	await _b67_snap("far_off_waits")
	h.world = _free_near(perch + base * 5.0)
	await _b67_run(boss, 1.0)
	await _b67_snap("its_line_and_name")
	var life0: float = boss.life
	boss.hurt(50.0)
	var not_yet: bool = boss.life == life0
	await _b67_run(boss, 5.0, func() -> bool: return not boss.waits)
	var intro := "it waits %s far off; met, its line and name, a blow on it %s" % [waited_far, "'Not yet'" if not_yet else "lands"]
	var said := []
	if boss.kind == "unfinished":
		said = await _b67_unfinished(boss, perch, base)
	else:
		said = await _b67_queen(boss, perch, base)
	# ITS DEATH, AND THE WAY ON WAKING
	h.world = _free_near(boss.world + base * 3.0)
	await _d_kill(boss)
	var dead_at := Time.get_ticks_msec()
	for q in [0.3, 0.9, 1.4, 2.0]:
		await _b67_run(boss, maxf(0.0, q - (Time.get_ticks_msec() - dead_at) / 1000.0))
		await _b67_snap("dead_%.1f" % q)
	var woke := ways != null and ways.state != ""
	await _b67_run(boss, 1.0)
	await _b67_snap("the_way_on_waking")
	print("BOSS floor %d (%s, %s): %s; %s; moves made %s; the hero struck by %s; not made %s; dead %s; the way on %s (%s)" % [n, boss.kind, boss.title, intro, "; ".join(said),
		_monsters.used, _b67["hits"], _b67["missed"], boss.dead, "waking" if woke else "NOT waking", ways.state if ways != null else "-"])


## The Unfinished: in the wall, its four (held there all the while), then torn free and its four, and its walk.
func _b67_unfinished(boss: Monster, perch: Vector2, base: Vector2) -> Array:
	var AI = boss.h2
	var said := []
	var held := true
	await _b67_snap("in_the_wall")
	for q in [["unfinished:slamWall", 2.2, [0.6, 1.25, 1.6]], ["unfinished:stompWall", 2.4, [0.7, 1.32, 1.6]],
			["unfinished:hurlWall", 6.0, [0.9, 1.45, 2.1, 2.5, 2.8]], ["unfinished:rockslideWall", 6.0, [0.95, 1.65, 1.9, 2.3, 2.9]]]:
		await _b67_act(boss, q[0], q[1], q[2], 1.2)
		held = held and boss.world.distance_to(perch) < 1e-6
	said.append("in the wall, held there %s, facing within %.2f radians of the way it was carved" % [held, absf(wrapf(atan2(boss.face.y, boss.face.x) - atan2(base.y, base.x), -PI, PI))])
	var blocks := 0
	var walled := 0
	for p in _monsters.perils.list:
		if p["kind"] == "a1" and p["a1"] == "unfinished:block" and int(p["done"]) == 1:
			blocks += 1
			var d := int(p["d"]) - 1
			if d >= 0 and not map.walkable(d % map.w, d / map.w):
				walled += 1
	said.append("its blocks lying %d, %d of them a block of the floor" % [blocks, walled])
	# TEARING FREE, below 85% of its life
	boss.life = boss.max_life * 0.84
	hero.world = _free_near(perch + base * 2.2)
	var tore := func() -> bool: return AI.act != null and AI.acts()[AI.act["i"]]["id"] == "unfinished:tear"
	await _b67_run(boss, 3.0, tore)
	if tore.call():
		var act: Dictionary = AI.act
		for T in [0.6, 1.45, 2.4, 3.2]:
			await _b67_run(boss, 4.0, func() -> bool: return not is_same(AI.act, act) or float(act["t"]) >= float(T))
			await _b67_snap("tear_%.2f" % T)
		await _b67_run(boss, 4.0, func() -> bool: return not is_same(AI.act, act))
	said.append("tore free at %.0f%% of its life: free %s" % [100.0 * boss.life / boss.max_life, not AI.in_wall()])
	# FREE: its walk, and its four
	hero.world = _free_near(boss.world + base * 7.0)
	var from := boss.world
	for k in AI.cds.size():
		AI.cds[k] = 99.0
	await _b67_run(boss, 3.0)
	await _b67_snap("free_walks")
	said.append("free, it walked %.2f tiles in 3 s" % boss.world.distance_to(from))
	for q in [["unfinished:slam", 2.2, [0.6, 1.25]], ["unfinished:stomp", 2.4, [0.7, 1.32]], ["unfinished:hurl", 6.0, [1.45, 2.4]], ["unfinished:rockslide", 6.0, [1.0, 1.9, 2.6]]]:
		await _b67_act(boss, q[0], q[1], q[2], 0.8, base)
	return said


## The Carrion Queen: her rake, gust, dive, call and Eclipse; a hop about her eyrie; held at a hundredth of her life until she has
## flown home to her perch.
func _b67_queen(boss: Monster, perch: Vector2, base: Vector2) -> Array:
	var AI = boss.h2
	var said := []
	await _b67_snap("on_her_perch")
	await _b67_act(boss, "queen:rake", 2.0, [0.5, 1.0, 1.1, 1.4])
	var gust := {}
	var before_gust := func() -> void: gust["at"] = hero.world
	var after_gust := func() -> void: gust["to"] = hero.world
	await _b67_act(boss, "queen:gust", 3.0, [0.6, 1.0, 1.15, 1.3, 1.6], 0.3, Vector2.ZERO, {1.0: before_gust, 1.6: after_gust})
	said.append("her gust shoved him %.2f tiles (from %.2f tiles before her: %.2f by her rules)" % [Vector2(gust.get("to", Vector2.ZERO)).distance_to(gust.get("at", Vector2.ZERO)),
		Vector2(gust.get("at", Vector2.ZERO)).distance_to(boss.world), AI.gust_shove(Vector2(gust.get("at", Vector2.ZERO)).distance_to(boss.world))])
	# (her dive: up out of sight, nothing reaches her)
	var reach := {"said": "her dive not made"}
	var struck_up := func() -> void:
		var l0: float = boss.life
		boss.hurt(30.0)
		reach["said"] = "struck up out of sight in her dive: harmed %s" % (boss.life != l0)
	await _b67_act(boss, "queen:dive", 4.0, [0.4, 0.9, 1.0, 1.4, 1.62, 1.9, 2.5], 0.0, Vector2.ZERO, {1.0: struck_up})
	said.append(reach["said"])
	await _b67_act(boss, "queen:call", 4.0, [0.4, 0.85, 1.3], 1.0)
	var flock := 0
	for o in _monsters.list:
		if is_instance_valid(o) and not o.dead and o.kind == "vulture":
			flock += 1
	said.append("her flock called in: %d" % flock)
	await _b67_run(boss, 1.5)
	await _b67_snap("her_flock_about_him")
	# (her flock gone again, that the Eclipse's own dives are seen)
	for o in _monsters.list:
		if is_instance_valid(o) and o.kind == "vulture":
			o.queue_free()
	await _b67_act(boss, "queen:eclipse", 3.0, [0.9, 1.75, 2.4], 0.0)
	var E = AI.eclipse_now(_monsters.perils)
	var dives := 0
	if E != null:
		# (he stands where he is out of every pool: her flock dives at him out of the dark)
		var shot := 0
		var t := 0.0
		while t < 5.0:
			await get_tree().process_frame
			t += get_process_delta_time()
			_b67_tick(boss)
			for p in _monsters.perils.list:
				if p["kind"] != "a1" or p["a1"] != "queen:vdive":
					continue
				if not p.has("_seen"):
					p["_seen"] = true
					dives += 1
				if shot == 0 and float(p["t"]) >= -0.3:
					shot = 1
					await _b67_snap("eclipse_dive_marked")
				elif shot == 1 and float(p["t"]) >= 0.05:
					shot = 2
					await _b67_snap("eclipse_dive_strikes")
				elif shot == 2 and float(p["t"]) >= 0.4:
					shot = 3
					await _b67_snap("eclipse_dive_after")
		await _b67_snap("eclipse_dark_and_pools")
	said.append("the Eclipse: %d dives of her flock while he was out of its pools" % dives)
	# (the dark over: she hops about her eyrie)
	await _b67_run(boss, 8.0, func() -> bool: return AI.eclipse_now(_monsters.perils) == null)
	hero.world = _free_near(perch + base * 2.5)
	_b67["roam"] = true
	AI.a1["roamT"] = 0.0
	for k in AI.cds.size():
		AI.cds[k] = 99.0
	var hop_from := boss.world
	await _b67_run(boss, 2.0, func() -> bool: return AI.mode == "walk")
	await _b67_run(boss, 0.25)
	await _b67_snap("a_hop")
	await _b67_run(boss, 2.0, func() -> bool: return AI.mode != "walk")
	_b67["roam"] = false
	said.append("a hop of %.2f tiles about her eyrie" % boss.world.distance_to(hop_from))
	# (at a hundredth of her life she flies home to her perch, and stays; then a blow kills her)
	boss.hurt(1e9)
	var held: bool = not boss.dead and absf(boss.life - AI.last_of(boss)) < 1e-6
	var homing := func() -> bool: return AI.act != null and AI.acts()[AI.act["i"]]["id"] == "queen:home"
	await _b67_run(boss, 3.0, homing)
	var flew: bool = homing.call()
	if flew:
		var act: Dictionary = AI.act
		for T in [0.6, 1.1, 1.62, 2.4]:
			await _b67_run(boss, 4.0, func() -> bool: return not is_same(AI.act, act) or float(act["t"]) >= float(T))
			await _b67_snap("home_%.2f" % T)
		await _b67_run(boss, 4.0, func() -> bool: return not is_same(AI.act, act))
	said.append("struck to the last: held at %.0f of her life %s; flown home %s, %.2f off her perch, home for good %s" % [AI.last_of(boss), held, flew, boss.world.distance_to(perch), AI.home_for_good()])
	return said



# =====================================================================================================================
# A FALLEN HERO (game/modes.ts; game.ts die, wakes, wakeSave, losses; main.ts writeSave, wake; ui/panels.ts drawDeath, wakeLine)

## Whether he would wake in town from a fall here: a Normal hero, in a floor he came into (not his town).
func will_wake() -> bool:
	# (ENDLESS MODE: a death on an endless level is the hero's end, Normal or Hardcore: his pick, “The hero too”)
	return hero_mode == "normal" and not is_home(place) and not entry.is_empty() and not in_endless


## The part of the gold he carried into this floor a Normal fall costs.
func _gold_share() -> int:
	return floori(maxf(0.0, float(entry.get("gold", 0))) * GOLD_SHARE)


## (game.ts wakeSave) The run as he will wake in town: as he came into this floor (his gear, his bag, his words and where they
## were set, his gold), less a share of the gold he carried in; with his level, his points and what they were spent on, and his
## kills as they are now. {} where he would not wake.
func wake_save() -> Dictionary:
	if not will_wake():
		return {}
	var now := Save.run_of(self)
	var e: Dictionary = entry.duplicate(true)
	for k in ["level", "xp", "points", "attrs", "kills", "walked"]:
		if now.has(k):
			e[k] = now[k]
	e["gold"] = maxi(0, int(e.get("gold", 0)) - _gold_share())
	e["mode"] = "normal"
	return e


## (game.ts losses) What a Normal fall here costs: the pieces of gear, the words and the gold found on this floor, and the share of
## the gold he carried in. {} where he would not wake.
func losses() -> Dictionary:
	if not will_wake():
		return {}
	var now := Save.run_of(self)
	# (a piece is his own if he had one the same as it as he came in, counted as many times as he had it)
	var had := {}
	for it in _pieces_of(entry):
		var k := JSON.stringify(it)
		had[k] = int(had.get(k, 0)) + 1
	var items := 0
	for it in _pieces_of(now):
		var k := JSON.stringify(it)
		if int(had.get(k, 0)) > 0:
			had[k] = int(had[k]) - 1
		else:
			items += 1
	# (a word counted wherever it is: in the pouch, or set in a move)
	var words := 0
	var then := _words_of(entry)
	var held := _words_of(now)
	for w in held:
		words += maxi(0, int(held[w]) - int(then.get(w, 0)))
	return {"items": items, "words": words, "gold": maxi(0, int(now.get("gold", 0)) - int(entry.get("gold", 0))), "share": _gold_share()}


func _pieces_of(run: Dictionary) -> Array:
	var out: Array = []
	var gear = run.get("gear", {})
	if gear is Dictionary:
		for s in gear:
			if gear[s] is Dictionary:
				out.append(gear[s])
	for it in run.get("bag", []):
		if it is Dictionary:
			out.append(it)
	return out


func _words_of(run: Dictionary) -> Dictionary:
	var out := {}
	var pouch = run.get("words", {})
	if pouch is Dictionary:
		for w in pouch:
			out[w] = int(out.get(w, 0)) + int(pouch[w])
	for side in ["front", "behind"]:
		for move in run.get(side, []):
			for w in move:
				if w != null:
					out[str(w)] = int(out.get(str(w), 0)) + 1
	return out


## (ui/panels.ts wakeLine) What a Normal fall cost, in a line: what was found on this floor, and the gold of his own.
static func wake_line(lost: Dictionary, depth: int) -> String:
	var found: Array = []
	var n: int = lost.get("items", 0)
	if n:
		found.append("%d item%s" % [n, "" if n == 1 else "s"])
	n = lost.get("words", 0)
	if n:
		found.append("%d word%s" % [n, "" if n == 1 else "s"])
	if int(lost.get("gold", 0)):
		found.append("%d gold" % int(lost["gold"]))
	var parts: Array = []
	if not found.is_empty():
		parts.append("what you found in dungeon %d (%s)" % [depth, ", ".join(found)])
	if int(lost.get("share", 0)):
		parts.append("%d of your own gold" % int(lost["share"]))
	return "Lost: %s." % ", and ".join(parts) if not parts.is_empty() else "Nothing was lost."


## He has fallen: (game.ts die) the count of the lost, and the save as it will stand (a Normal hero as he will wake in town, so
## that closing the game on the screen changes nothing; a Hardcore hero gone); then, seen falling a while (main.ts FALL_SEEN), the
## screen that says what it cost.
func _fallen(dt: float) -> void:
	if _fell_for < 0.0:
		_fell_for = 0.0
		var w := will_wake()
		fall_lost = losses() if w else {}
		fall_depth = depth_of(place)
		fall_endless = endless if in_endless else 0
		if not w:
			deaths += 1
		if saving:
			var run = wake_save() if w else null
			Save.write(self, run)
		elif trial > 0:
			# (a test hero: as he will wake, kept in memory, not in the save: game.ts wake, `g.trial`)
			trial_file = {"trial": trial, "run": wake_save() if w else null, "meta": Save.meta_of(self)}
		return
	if _mini == null or _mini.open == "death":
		return
	_fell_for += dt
	var press := _fell_for > 0.4 and (Input.is_action_just_pressed("attack") or Input.is_action_just_pressed("interact") or Input.is_key_pressed(KEY_ENTER) or Input.is_key_pressed(KEY_SPACE))
	if _fell_for >= FALL_SEEN or press:
		_mini.show_panel("death")


## What the screen says (ui/panels.ts drawDeath): its title, its rows, its line of what it cost or what is kept, its button.
func death_info() -> Dictionary:
	var w := not fall_lost.is_empty()
	# (fallen on an endless level, that level: it said "Fell in dungeon 12" on Endless 44, "dungeon 0" in the final arena; the bug
	# hunt's sixth round)
	var fell: String = ("Fell in " + endless_name(fall_endless)) if fall_endless > 0 and not w else "Fell in dungeon %d" % fall_depth
	var rows: Array = ["%s, level %d" % [str(Words.data()["classes"][hero.cls]["name"]), loot.level], fell]
	var after := ""
	if w:
		after = wake_line(fall_lost, fall_depth)
	else:
		rows.append("%d dungeon%s cleared, %d monsters slain" % [loot.cleared, "" if loot.cleared == 1 else "s", loot.kills])
		var words := 0
		for k in loot.lexicon:
			words += int(loot.lexicon[k])
		var kept: int = loot.stash.filter(func(it): return it != null).size()
		after = "The Lexicon keeps %d word%s, the stash %d item%s" % [words, "" if words == 1 else "s", kept, "" if kept == 1 else "s"]
	return {"wakes": w, "title": "YOU FELL" if w else "YOU DIED", "rows": rows, "after": after, "button": "Back to town" if w else "New run"}


## Its button (or Enter): a Normal hero wakes in town (main.ts wake: the game begins again from the save made as he fell, the line he
## wakes to shown there); a Hardcore hero's run is over, and the class cards come up for the next (the Lexicon and the stash kept).
func death_done() -> void:
	if not fall_lost.is_empty():
		wake_note = ("You wake in town. " + wake_line(fall_lost, fall_depth)).strip_edges()
	get_tree().paused = false
	if saving or trial > 0:
		get_tree().reload_current_scene()
	else:
		# (a check, saving nothing: he is up again where he came in, and the fall is over)
		hero._back()
		_fell_for = -1.0

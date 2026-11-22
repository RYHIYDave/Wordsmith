## FLOOR 5, THE TEMPLE'S DOOR (game/temple_door.ts; game.ts templeKeyTaken and the lines it says; his idea, 13 Nov 2026: a gate
## that is locked, two bosses with keys, two chains across the door that then open the way into the temple).
##   THE DOOR stands in the threshold where the mine meets the temple, its three tiles wall to whatever walks, flies, is shot
##     or looks until it is opened. The first time he comes within 2.6 tiles of its middle, a line says what it wants.
##   THE KEYS: two, one carried by each keybearer in the mine's side rooms (keybearers.gd); each dropped where its bearer
##     falls and taken as he walks over it (monsters.gd quest_item "key"). The screen shows how many he holds (minimap.gd).
##   THE UNLOCKING: he comes to the door with both: the first chain falls (from 0 s, 1.5 s long), then the second (from 1.1 s),
##     then the leaves swing open into the temple (from 2.9 s, 1.6 s), the floor shaking. From then on the way is open.
## Its pictures are the look's own film of it, recorded from the game (tools/godot_record.mjs: the state "temple").
extends Node

const FloorMap := preload("res://scripts/floor_map.gd")

## (temple_door.ts TEMPLE_TIMES)
const CHAIN := 1.5
const SECOND := 1.1
const SWING_AT := 2.9
const SWING := 1.6
const NEAR := 2.6
const OMEN := Color("#ffc24a")
const GOOD := Color("#8af078")
const WORD := Color("#7af8f0")

var main
var map: FloorMap
var look
var hero
var monsters
var sfx

var keys := 0
var need := 2
var told := false
## (seconds since the unlocking began; less than 0: not yet)
var began := -1.0
var open := false
var _door := {}
var _chain := [0.0, 0.0]


func _ready() -> void:
	var T: Dictionary = map.temple
	need = int(T.get("need", 2))
	_door = map.doors[int(T["door"])]
	for t in _door["tiles"]:
		map.walk[int(t)] = 0
		map.shut[int(t)] = 1
	if monsters != null:
		monsters.quest_item.connect(_taken)
	_show(0.0)


## (ENDLESS MODE, NO STORY: an endless level's floor 5 has no temple door, his pick “Door open, no key-bearers (Recommended)”) The
## door stands open from the first, as it stands once unlocked.
func open_now() -> void:
	open = true
	began = SWING_AT + SWING
	_chain = [1.0, 1.0]
	_door["want"] = 1
	_door["open"] = 1.0
	for t in _door["tiles"]:
		map.walk[int(t)] = 1
		map.shut[int(t)] = 0
	_show(began)


## One of the door's keys, taken where it lay (game.ts templeKeyTaken).
func _taken(what: String, _at: Vector2) -> void:
	if what != "key":
		return
	keys = mini(need, keys + 1)
	sfx.play("rare")
	_say("Both keys. The temple door awaits." if keys >= need else "A key to the temple door. %d of %d." % [keys, need], WORD)


func _process(dt: float) -> void:
	if map == null or hero == null or open:
		return
	var mid := Vector2(_door["middle"]["x"], _door["middle"]["y"])
	if began < 0.0:
		var near: bool = hero.alive and hero.world.distance_to(mid) <= NEAR
		if near and keys >= need:
			began = 0.0
			_say("The keys turn in their locks.", GOOD)
			sfx.play("door", linear_to_db(0.9))
		elif near and not told:
			told = true
			_say("Two chains bar the temple's door. You hold %d of its %d keys." % [keys, need] if keys > 0 else "Two chains bar the temple's door. Its keys are carried in the mine.", OMEN)
		return
	began += dt
	var was := [_chain[0], _chain[1]]
	_chain[0] = clampf(began / CHAIN, 0.0, 1.0)
	_chain[1] = clampf((began - SECOND) / CHAIN, 0.0, 1.0)
	for k in 2:
		if was[k] < 0.2 and _chain[k] >= 0.2:
			sfx.play("gate_fall", linear_to_db(0.7))
	if began >= SWING_AT and int(_door["want"]) == 0:
		_door["want"] = 1
		sfx.play("gate_rise")
		hero.kick(3.0)
	if int(_door["want"]) == 1:
		_door["open"] = minf(1.0, (began - SWING_AT) / SWING)
		if float(_door["open"]) >= 1.0:
			open = true
			for t in _door["tiles"]:
				map.walk[int(t)] = 1
				map.shut[int(t)] = 0
			_say("The temple opens.", GOOD)
	_show(began)


## The door as far along its unlocking as it is (the look's film of it: 4.5 s).
func _show(s: float) -> void:
	if look != null:
		look.show_variant("temple", clampf(s / (SWING_AT + SWING), 0.0, 1.0))


func _say(text: String, color: Color) -> void:
	if main != null and main.loot != null:
		main.loot.say(text, color)

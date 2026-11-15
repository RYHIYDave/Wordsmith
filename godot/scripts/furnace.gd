## FLOOR 3'S FURNACE (QUESTS15, game/quests15.ts; game.ts furnaceMade, furnaceStep, furnaceBar, furnaceGearTaken, turnCrank). His
## words, 4 Nov 2026: "a side area you go into, it can be pretty short, then a flamey boss guy who drops a missing gear to the
## forge crank to turn it off, allowing you access to the chained one's boss area which was blocked by fire".
##   THE FIRE: while the furnace burns, fire bars the way into the Chained One's hall: its gateway is not to be walked through
##     (sight passes), its portcullis held up. The first time he comes within 9 tiles of it, a line says so.
##   THE STOKER (stoker.gd), in his arena at the end of its short hallway: fallen, he leaves the crank's gear where he fell; it
##     is taken up as the hero comes to it (monsters.gd quest_item "gear"), and the crank shows its gear set in.
##   THE CRANK, beside the furnace: walked up to (within 1.5 tiles) without the gear, a line says a gear is missing, once; with
##     it, it is turned: its one turn (1.2 s), then the furnace goes out (1.6 s) and the fire in the hall's way with it (1.5 s);
##     2.7 s after the turn the way is open.
## Their pictures are the look's own, recorded from the game (tools/godot_record.mjs: the states "crank_set" and "furnace").
extends Node

const FloorMap := preload("res://scripts/floor_map.gd")

## (quests15.ts CRANK_TIMES, FIRE_GONE; doors.ts LEVER_NEAR; scene_sounds.ts CRANK_SOUND)
const TURN := 1.2
const FURNACE_OUT := 1.6
const FIRE_OUT := 1.5
const FIRE_GONE := TURN + FIRE_OUT
const NEAR := 1.5
const AGGRO := 9.0
const TURN_SOUND_AT := 0.3
const GATE_SOUND_AFTER := 0.8
const GATE_SOUND_FAR := 0.4
const QUEST := Color("#7af8f0")

var main
var map: FloorMap
var look
var hero
var monsters
var sfx

## ("": the furnace burns and he has no gear; "gear": he carries it; "out": the crank is turned)
var step := ""
## (seconds since the crank was turned; less than 0: not yet)
var turned := -1.0
var gone := false
var told := false
var told_crank := false
var _door := {}
var _crank := {}
var _sounds: Array = []


func _ready() -> void:
	var F: Dictionary = map.furnace
	var gate := int(F.get("gate", -1))
	if gate >= 0 and gate < map.doors.size():
		_door = map.doors[gate]
	for p in map.props:
		if int(p["i"]) == int(F.get("crank", -1)):
			_crank = p
	_bar(true)
	if monsters != null:
		monsters.quest_item.connect(_taken)


## The Chained One's gateway barred by the furnace's fire, or open again (furnaceBar): not to be walked through; sight passes.
func _bar(on: bool) -> void:
	if _door.is_empty():
		return
	for t in _door["tiles"]:
		map.walk[int(t)] = 0 if on else 1


## The crank's gear, taken up where the Stoker fell (furnaceGearTaken).
func _taken(what: String, _at: Vector2) -> void:
	if what != "gear" or step != "":
		return
	step = "gear"
	sfx.play("rare")
	_say("You take the CRANK GEAR. Set it in the forge crank.")
	if look != null:
		look.show_variant("crank_set", 1.0)


func _process(dt: float) -> void:
	if map == null or hero == null:
		return
	# (what is heard of the crank, each at its moment)
	for q in _sounds.duplicate():
		q[0] -= dt
		if q[0] <= 0.0:
			_sounds.erase(q)
			sfx.play(q[1], linear_to_db(maxf(0.05, q[2])))
	if step == "out":
		turned += dt
		if look != null:
			look.show_variant("furnace", clampf(turned / (TURN + maxf(FURNACE_OUT, FIRE_OUT)), 0.0, 1.0))
		# (the fire gone: the way open, once)
		if not gone and turned >= FIRE_GONE:
			gone = true
			_bar(false)
		return
	# (burning: the way barred, whatever the door would have it; the fire said the first time he is near)
	_bar(true)
	if not _door.is_empty() and not told and hero.alive and hero.world.distance_to(Vector2(_door["middle"]["x"], _door["middle"]["y"])) < AGGRO:
		told = true
		_say("Fire bars the way into the hall. The furnace feeds it.")
	# (the forge crank, walked up to: with its gear, turned; without, said once)
	if _crank.is_empty() or not hero.alive or hero.world.distance_to(Vector2(_crank["x"], _crank["y"])) >= NEAR:
		return
	if step != "gear":
		if not told_crank:
			told_crank = true
			_say("The forge crank: a gear is missing from it.")
		return
	_crank["state"] = 1
	step = "out"
	turned = 0.0
	hero.kick(2.0)
	sfx.play("crank_gear")
	_sounds.append([TURN_SOUND_AT, "crank_turn", 0.9])
	_sounds.append([TURN, "furnace_out", 1.0])
	if not _door.is_empty():
		# (its gateway is a long way from the crank: heard far off, quieter, a moment after the furnace begins to die)
		var d: float = hero.world.distance_to(Vector2(_door["middle"]["x"], _door["middle"]["y"]))
		_sounds.append([TURN + GATE_SOUND_AFTER, "gate_fire_out", maxf(GATE_SOUND_FAR, clampf(1.0 - (d - 3.0) / 13.0, 0.0, 1.0))])
	_say("The gear bites. The furnace dies, and the fire with it.")
	if look != null:
		look.clear_variant("crank_set")
		look.show_variant("furnace", 0.0)


func _say(text: String) -> void:
	if main != null and main.loot != null:
		main.loot.say(text, QUEST)

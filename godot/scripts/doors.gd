## DOORS AND GATES (game/doors.ts stepDoors; game.ts updateDoors, dropGate, raiseGate, wellInside, bossWaits, bossIntro):
## the floor's doors and the boss's gate as the game has them. The owner, 7 Oct 2026 (game/doors.ts): "Doors are always unlocked
## and open as you get near them", and "Dungeon Boss always has a big gate that locks you in with him once you pass through the
## opening"; and 20:16, "I don’t want monsters to open doors".
##   A DOOR swings open (0.32 s) for the hero alone, when he comes within 2.6 tiles of the middle of its opening, and stays
##   open. Until it begins to, its tile holds monsters and stops sight and shots (FloorMap.shut), and what is in its room is
##   out of his reach while he is outside (monsters.gd shut_in).
##   THE BOSS'S GATE is up until he is 2.2 tiles inside the boss's hall with the boss alive: then it falls (0.22 s) and its
##   doorway is wall to everything, until the boss is dead, when it rises (1.1 s).
##   THE BOSS WAITS (BOSS_INTRO): standing at the back of his hall, looking at the hero, nothing harming him ("Not yet"), until
##   his gate has fallen and he has said his line (3.2 s): his line over his head for 1.9 s, his name across the screen from
##   1 s in; then he fights.
## Their pictures as they open: look.gd show_door (what the game's renderer draws at each step, tools/godot_looks.ts).
extends Node

const FloorMap := preload("res://scripts/floor_map.gd")

const DOOR_NEAR := 2.6
const DOOR_SWING := 0.32
const GATE_FALL := 0.22
const GATE_RISE := 1.1
const GATE_INSIDE := 2.2
## (defs.ts BOSS_INTRO, BOSS_LINES)
const INTRO := 3.2
const SAY_FOR := 1.9
const LINES := {
	"warden": ["None leave my halls.", "Another one for the cells.", "The keys are mine. So are you."],
	"headsman": ["Kneel.", "The block is waiting.", "Your name is on my list."],
}

var main  # main.gd
var map: FloorMap
var look  # look.gd, or null where the place has no recorded look
var hero
var monsters  # monsters.gd
var sfx

var intro_t := 0.0


func _ready() -> void:
	for i in map.doors.size():
		_show(i)


func _process(dt: float) -> void:
	if map == null or hero == null:
		return
	var boss = _boss()
	var alive: bool = boss != null and not boss.dead
	var gate_up := false
	for i in map.doors.size():
		var d: Dictionary = map.doors[i]
		var kind: String = d["kind"]
		# (a door opens for the hero alone, as he comes near)
		if kind == "door" and int(d["want"]) == 0 and hero.alive:
			var mid := Vector2(d["middle"]["x"], d["middle"]["y"])
			if hero.world.distance_squared_to(mid) < DOOR_NEAR * DOOR_NEAR:
				d["want"] = 1
				for t in d["way"]:
					map.shut[int(t)] = 0
				sfx.play("door", linear_to_db(0.5))
		# (the boss's gate: down behind him once he is well inside with the boss alive; up once the boss is dead)
		if kind == "bossgate":
			if int(d["want"]) == 1 and alive and hero.alive and _well_inside(d, hero.world):
				_drop(d)
				_intro(boss)
			elif int(d["want"]) == 0 and not alive:
				_raise(d)
			if int(d["want"]) == 1:
				gate_up = true
		var open := float(d["open"])
		var want := float(d["want"])
		if open != want:
			var secs := DOOR_SWING if kind == "door" else (GATE_RISE if want == 1.0 else GATE_FALL)
			d["open"] = move_toward(open, want, dt / secs)
			_show(i)
	if intro_t > 0.0:
		intro_t = maxf(0.0, intro_t - dt)
	if boss != null:
		var waited: bool = boss.waits
		boss.waits = alive and (gate_up or intro_t > 0.0)
		# (his wait over: he fights)
		if waited and not boss.waits and boss.state == "sleep":
			monsters.wake(boss)


## The hero fallen and set back where he came in: the boss's gate up again behind him, the boss waiting again.
func reset() -> void:
	intro_t = 0.0
	for d in map.doors:
		if d["kind"] == "bossgate" and int(d["want"]) == 0:
			_raise(d)


func _show(i: int) -> void:
	if look != null:
		look.show_door(i, float(map.doors[i]["open"]))


func _boss():
	if monsters == null:
		return null
	for m in monsters.list:
		if is_instance_valid(m) and m.boss:
			return m
	return null


## Is this place in the gate's room, and far enough past its line that it may fall behind whoever stands there?
func _well_inside(d: Dictionary, at: Vector2) -> bool:
	var r: Dictionary = map.room(int(d["room"]))
	if not FloorMap.in_room(r, at):
		return false
	var inside := ((at.y if d["alongX"] else at.x) - float(d["plane"])) * -float(d["out"])
	return inside >= GATE_INSIDE


## The gate falls: its doorway wall to whatever walks, flies, is shot or looks; anything standing in it put inside the hall.
func _drop(d: Dictionary) -> void:
	d["want"] = 0
	var tiles: Array = d["tiles"]
	for t in tiles:
		map.walk[int(t)] = 0
		map.shut[int(t)] = 1
	for m in monsters.list:
		if not is_instance_valid(m) or m.dead or not tiles.has(floori(m.world.y) * map.w + floori(m.world.x)):
			continue
		var back: float = float(d["plane"]) - float(d["out"]) * (0.5 + m.r)
		var to := Vector2(m.world.x, back) if d["alongX"] else Vector2(back, m.world.y)
		if monsters.clear(to.x, to.y, minf(m.r, 0.42)):
			m.world = to
	hero.shake()
	sfx.play("gate_fall")


func _raise(d: Dictionary) -> void:
	d["want"] = 1
	for t in d["tiles"]:
		map.walk[int(t)] = 1
		map.shut[int(t)] = 0
	sfx.play("gate_rise", linear_to_db(0.8))


## His gate down behind the hero, the boss says his line, and his name comes up across the screen.
func _intro(boss) -> void:
	intro_t = INTRO
	var lines: Array = LINES.get(boss.kind, [])
	if not lines.is_empty():
		boss.say(lines.pick_random(), SAY_FOR)
	if main != null:
		main.boss_card(boss.title, INTRO)

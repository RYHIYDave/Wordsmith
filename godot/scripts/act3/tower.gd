## FLOOR 20, THE QUIET TOWER: ITS WAY UP AND DOWN (game/act2/tower_rules.ts; game.ts updateTower, throughTower). His doc, level 20: "a
## climb up the tower's spiralling floors ... to the open top under the sky." The top is a place of its own on the floor's map, past
## where the two grounds part (the export's land.json tower):
##   walking up THE TOWER'S STAIR at the stairhead (within 1.75 tiles of its middle) the screen darkens and he comes up through THE
##   TRAPDOOR onto the top, facing its middle; standing on the open trapdoor (within 0.6) takes him back down, before the stair.
##   As the Moth wakes to him (he has come up into its sight, and is off the trapdoor), the trapdoor SLAMS SHUT behind him and stays
##   shut until the Moth is dead and its death has played out (6 s); then it opens. Its pictures are the look's state `trap`.
extends Node

const TOWER := {"up": 1.75, "down": 0.6, "slamFrom": 1.2, "openAfter": 6.0}
const CURTAIN := 0.35

var main
## the export's plan: {split, stair {x, y, back}, top {cx, cy, r, trap, arrive}}; empty off floor 20
var plan := {}
var shut := false
## (when the Moth fell, by this node's clock; and its clock)
var _fell := -1.0
var _clock := 0.0
var _going := false


func on() -> bool:
	return not plan.is_empty()


func enter(where: String) -> void:
	plan = {}
	shut = false
	_fell = -1.0
	_going = false
	if main.is_home(where) or main.map == null or main.map.land == null or main.map.land.get("tower") == null:
		return
	plan = main.map.land["tower"]
	if main.look != null:
		main.look.clear_variant("trap")


## Whether `at` is on the tower's top (its own place, past the split).
func on_top(at: Vector2) -> bool:
	return on() and at.x >= float(plan["split"])


func _moth():
	if main._monsters == null:
		return null
	for m in main._monsters.list:
		if is_instance_valid(m) and m.kind == "moth" and m.boss:
			return m
	return null


func _process(dt: float) -> void:
	if plan.is_empty() or main == null or get_tree().paused or main.hero == null or _going:
		return
	_clock += dt
	var h = main.hero
	var trap := Vector2(float(plan["top"]["trap"]["x"]) + 0.5, float(plan["top"]["trap"]["y"]) + 0.5)
	var boss = _moth()
	var alive: bool = boss != null and not boss.dead
	var awake: bool = boss != null and boss.state != "sleep"
	# (it slams shut behind him: the Moth alive and awake to him, he off it, on the top)
	if not shut and alive and awake and h.world.distance_to(trap) > float(TOWER["slamFrom"]) and h.world.x >= float(plan["split"]):
		shut = true
		if main.look != null:
			main.look.show_variant("trap", 1.0)
		main.sfx.play("slam", linear_to_db(0.7))
		h.kick(3.0)
		main.fx.event({"t": "spark", "x": trap.x, "y": trap.y, "el": "phys", "n": 8})
		return
	# (not till its death has played out)
	if shut and not alive:
		if _fell < 0.0:
			_fell = _clock
		if _clock - _fell >= float(TOWER["openAfter"]):
			shut = false
			if main.look != null:
				main.look.clear_variant("trap")
			main.sfx.play("door", linear_to_db(0.6))
		return
	if not h.alive:
		return
	var stair := Vector2(plan["stair"]["x"], plan["stair"]["y"])
	if h.world.distance_to(stair) < float(TOWER["up"]):
		_through(true)
	elif not shut and h.world.distance_to(trap) < float(TOWER["down"]):
		_through(false)


## Up the tower's stair: he comes up through the trapdoor onto the top, facing its middle; or back down it, before the stair (the
## screen dark the while).
func _through(up: bool) -> void:
	_going = true
	main.sfx.play("door", linear_to_db(0.5))
	var tw := create_tween()
	tw.tween_property(main._curtain, "color:a", 1.0, CURTAIN)
	await tw.finished
	var h = main.hero
	var at: Dictionary = plan["top"]["arrive"] if up else plan["stair"]["back"]
	h.world = Vector2(at["x"], at["y"])
	var to := Vector2(plan["top"]["cx"], plan["top"]["cy"]) if up else Vector2(float(at["x"]) * 2.0 - float(plan["stair"]["x"]), float(at["y"]) * 2.0 - float(plan["stair"]["y"]))
	var d: Vector2 = to - h.world
	if d.length() > 1e-6:
		h.face = d.normalized()
	var back := create_tween()
	back.tween_property(main._curtain, "color:a", 0.0, CURTAIN)
	await back.finished
	_going = false

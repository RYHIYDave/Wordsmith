## THE WAYPOINT (game/ways.ts; game.ts updateWays, wayHere, interactHint, takeWay warpTown / warpBack, enterTown('way'),
## enterDungeon('way')): at the start of every floor but the first, beside where he comes in, and in town by the gate.
##   A floor's wakes the first time he comes within 4.5 tiles of it (heard), and from then on the motes rise over it; reaching
##   it, he has reached that floor (main.gd way_depth).
##   The town's is awake while there is a floor to warp back to (way_depth 2 and more).
##   Standing within a tile of an awake one, the use button warps him (the column of light flaring over it hides him, 0.25 s):
##   from a floor to town; from town back down to the start of the deepest floor whose waypoint he has reached, where he comes
##   out of its light. "Waypoint: to town", "Waypoint: to dungeon N".
extends Node

## (ways.ts WAY_WAKE, WAY_USE, WARP_SECS)
const WAKE := 4.5
const USE := 1.0
const WARP := 0.25

var main
var look
var hero
var sfx
var in_town := false
var at := Vector2.ZERO
var awake := false
var _warping := false


func _ready() -> void:
	var w: Dictionary = look.data["waypoint"]
	at = Vector2(float(w["wx"]), float(w["wy"]))


func _process(_dt: float) -> void:
	if in_town:
		if not awake and main.way_depth >= 2:
			awake = true
			look.wake_waypoint()
	elif not awake and hero.world.distance_to(at) < WAKE:
		awake = true
		look.wake_waypoint()
		sfx.play("power", linear_to_db(0.5))
	if here() and not _warping and Input.is_action_just_pressed("interact"):
		warp()


## Is he standing on it, awake (wayHere)?
func here() -> bool:
	return awake and hero.alive and hero.world.distance_to(at) < USE


## What the use button would do here (interactHint).
func prompt() -> Array:
	if not here():
		return ["", ""]
	if not in_town:
		return ["E: Waypoint: to town", "way"]
	# (ENDLESS MODE: the endless level he reached: game.ts interactHint)
	if int(main.endless) > 0:
		return ["E: Waypoint: to %s" % main.endless_name(main.endless), "way"]
	return ["E: Waypoint: to dungeon %d" % target(), "way"]


## The floor his town's waypoint takes him to (game.ts takeWay: max(2, wayDepth)). From the camp that is the city's first floor,
## 11, which the Godot version has not yet: until it has, the deepest floor it has that he has reached.
func target() -> int:
	var n: int = maxi(2, main.way_depth)
	while n > 2 and not main.has_floor(n):
		n -= 1
	return n


## The warp: the column of light flares over it, and 0.25 s later he is gone, to town or back down.
func warp() -> void:
	if _warping or not here():
		return
	_warping = true
	look.play_warp(0.0)
	sfx.play("power", linear_to_db(0.7))
	await get_tree().create_timer(WARP).timeout
	sfx.play("portal")
	# (ENDLESS MODE: the town's waypoint takes him back to the endless level he reached: his pick, “Pick up where you left off”)
	if in_town and int(main.endless) > 0:
		main.go_endless()
		return
	main.go_warp(main.home_place() if not in_town else "floor%d" % target())

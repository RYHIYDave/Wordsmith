## CHESTS, BARRELS AND URNS (game.ts breakProps, updateProps): what stands on the floor to be opened or broken. On floor 1, in
## the King's Tomb, the chests are the king's coffers, and the barrels and urns its funeral urns, squat urns, skull jars and bone
## boxes (art/floor1.ts BREAKABLES).
##   A CHEST opens as the hero comes within 1.5 tiles of it: one piece of gear (a better one in a treasure vault, where it may
##   hold a second), and 10 to 20 gold (twice that in a vault). (Its word, the game's chance of one, falls nowhere on floor 1.)
##   A BARREL OR AN URN breaks under a blow that reaches it (the Strike's, each of the Whirlwind's cuts, the Lunge's landing):
##   its leavings on the floor, its tile walkable again, and maybe gold (4 in 10: 1 to 5), a life orb (8 in 100) or a piece of
##   gear (4 in 100).
## Their pictures whole, open and broken: look.gd (recorded from the game's renderer, tools/godot_looks.ts recordProps).
extends Node

const FloorMap := preload("res://scripts/floor_map.gd")
const CHEST_NEAR := 1.5

var map: FloorMap
var look  # look.gd, or null
var hero
var loot
var sfx


func _process(_dt: float) -> void:
	if map == null or hero == null or not hero.alive:
		return
	for p in map.props:
		if p["kind"] == "chest" and int(p["state"]) == 0 and hero.world.distance_to(Vector2(p["x"], p["y"])) < CHEST_NEAR:
			_open(p)


## A blow that reaches `rad` round `at` (game.ts breakProps): every barrel and urn within it, and 0.4 more, is broken.
func strike(at: Vector2, rad: float) -> void:
	if map == null:
		return
	for p in map.props:
		if int(p["state"]) != 0 or (p["kind"] != "barrel" and p["kind"] != "urn"):
			continue
		var where := Vector2(p["x"], p["y"])
		if where.distance_to(at) > rad + 0.4:
			continue
		p["state"] = 1
		p["solid"] = false
		map.walk[int(p["ty"]) * map.w + int(p["tx"])] = 1
		# (by what it is made of: a barrel's wood; an urn's clay)
		sfx.play("break_wood" if p["kind"] == "barrel" else "break_pottery", linear_to_db(0.7))
		if look != null:
			look.prop_broken(int(p["i"]))
		if loot != null:
			loot.from_breakable(where)


func _open(p: Dictionary) -> void:
	p["state"] = 1
	sfx.play("chest", linear_to_db(0.9))
	if look != null:
		look.prop_opened(int(p["i"]))
	# (a chest in a treasure vault, at the end of a side branch, is richer than one found along the way)
	var vault := false
	for r in map.rooms:
		if r.get("kind", "") == "treasure" and FloorMap.in_room(r, Vector2(p["tx"], p["ty"])):
			vault = true
	if loot != null:
		loot.from_chest(Vector2(p["x"], p["y"]), vault)

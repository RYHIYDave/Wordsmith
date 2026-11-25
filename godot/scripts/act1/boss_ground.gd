## A BOSS'S GROUND OUT ON THE OPEN FLOORS (floors 6 to 10), as the game's own map-maker lays it, for what the floor's layout does
## not carry (tools/godot_boss_ground.ts: assets/floor<N>/boss.json): his area (game/act1_layout.ts Blob) and which of it is well
## inside it (game.ts meetOutdoorBoss: blobDist < 0.8, a half tile a cell), where his rules have him stand (bossAt; the Carrion
## Queen's with the ways round of her picture that have their backs to the drop there), and the Ledge Road's drop round his room.
## {} where a floor has none.
extends RefCounted

static var _got := {}


## The floor's boss's ground ({} where it has none).
static func of(depth: int) -> Dictionary:
	if not _got.has(depth):
		var path: String = load("res://scripts/main.gd").dir_of("floor%d" % depth) + "/boss.json"
		var g = JSON.parse_string(FileAccess.get_file_as_string(path)) if FileAccess.file_exists(path) else null
		_got[depth] = g if g is Dictionary else {}
	return _got[depth]


## Whether a point is well inside the boss's area (game.ts meetOutdoorBoss: blobDist(area.blob, x, y) < 0.8).
static func inside(g: Dictionary, at: Vector2) -> bool:
	if not g.has("area"):
		return false
	var c: Dictionary = g["area"]["inside"]
	var step := float(c["step"])
	var i := floori((at.x - float(c["x0"])) / step)
	var j := floori((at.y - float(c["y0"])) / step)
	var nw := roundi(float(c["w"]) / step)
	var nh := roundi(float(c["h"]) / step)
	if i < 0 or j < 0 or i >= nw or j >= nh:
		return false
	return int(c["cells"][j * nw + i]) == 1

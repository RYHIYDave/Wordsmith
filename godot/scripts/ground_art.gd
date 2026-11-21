## A floor's stone as tools/godot_export.ts saved it from the game's own painter (art/ground.ts makeGroundArt): one
## sheet, and for each picture its rect in the sheet and its anchor, in picture pixels. A tile's anchor is the top vertex
## of its diamond; a wall face's is the top vertex of the diamond of the wall block it hangs from.
extends RefCounted

var sheet: Texture2D
## The floor's tiles repeat every `period` tiles each way (the flagstones are laid on the world, not on the tiles).
var period := 10
var faces_left := 0
var faces_right := 0
var _by_name := {}


func _init(dir: String) -> void:
	sheet = load(dir + "/ground.png")
	var data: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(dir + "/ground.json"))
	period = int(data["period"])
	for s in data["sprites"]:
		var name: String = s["name"]
		_by_name[name] = {"rect": Rect2(s["x"], s["y"], s["w"], s["h"]), "anchor": Vector2(s["ax"], s["ay"])}
		if name.begins_with("face left"):
			faces_left += 1
		elif name.begins_with("face right"):
			faces_right += 1


func picture(name: String) -> Dictionary:
	return _by_name[name]


func floor_at(tx: int, ty: int) -> Dictionary:
	return _by_name["floor %d,%d" % [posmod(tx, period), posmod(ty, period)]]


## One face of a wall block alone: the one turned to screen-left, or the one turned to screen-right; `v` the tile's
## variant (render.ts: faceLeft[v % n]).
func face(left: bool, v: int) -> Dictionary:
	if left:
		return _by_name["face left %d" % (v % faces_left)]
	return _by_name["face right %d" % (v % faces_right)]

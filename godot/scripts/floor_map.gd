## A floor's layout as the game's own map-maker laid it (game/level.ts makeDungeon, saved by tools/godot_export.ts):
## its tiles, the art variant of each, and the walk grid (floor a body may stand on: floor less solid props and cut tiles).
extends RefCounted

const VOID := 0
const FLOOR := 1
const WALL := 2
const PIT := 3

var depth := 1
var map_seed := 0
var w := 0
var h := 0
var tiles := PackedByteArray()
var variant := PackedByteArray()
var walk := PackedByteArray()
var start := Vector2.ZERO
var rooms: Array = []


func _init(path: String) -> void:
	var data: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(path))
	depth = int(data["depth"])
	map_seed = int(data["seed"])
	w = int(data["w"])
	h = int(data["h"])
	tiles = _bytes(data["tiles"])
	variant = _bytes(data["variant"])
	walk = _bytes(data["walk"]) if data["walk"] != null else _floor_grid()
	start = Vector2(data["start"]["x"], data["start"]["y"])
	rooms = data["rooms"]


func tile(tx: int, ty: int) -> int:
	if tx < 0 or ty < 0 or tx >= w or ty >= h:
		return VOID
	return tiles[ty * w + tx]


func walkable(tx: int, ty: int) -> bool:
	return tx >= 0 and ty >= 0 and tx < w and ty < h and walk[ty * w + tx] != 0


func variant_at(tx: int, ty: int) -> int:
	return variant[ty * w + tx]


func _bytes(list: Array) -> PackedByteArray:
	var out := PackedByteArray()
	out.resize(list.size())
	for i in list.size():
		out[i] = int(list[i])
	return out


func _floor_grid() -> PackedByteArray:
	var out := PackedByteArray()
	out.resize(tiles.size())
	for i in tiles.size():
		out[i] = 1 if tiles[i] == FLOOR else 0
	return out

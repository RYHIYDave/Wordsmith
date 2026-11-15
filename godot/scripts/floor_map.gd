## A floor's layout as the game's own map-maker laid it (game/level.ts makeDungeon, saved by tools/godot_export.ts):
## its tiles, the art variant of each, and the walk grid (floor a body may stand on: floor less solid props and cut tiles).
## And its DOORS AND GATES (game/doors.ts), each as the game keeps it ({kind, room, alongX, a, plane, out, tiles, way, piers,
## middle, open, want}: doors.gd moves them): the SHUT grid, 1 on the tile of a door that is shut and on the three of a gate
## that is down, which holds monsters and stops sight and shots (a door never holds the hero: it is open before he is there;
## a gate that is down is out of the walk grid too); and the PIER grid, the stone either side of a door.
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
## (the tiles cut corner to corner, game/cut.ts: 0 none, 1 far, 2 near, 3 left, 4 right, and 5 to 8 the same cut low)
var cut := PackedByteArray()
var walk := PackedByteArray()
var start := Vector2.ZERO
## (the way he faces as he comes in, where the export says: tools/godot_export.ts)
var start_face := Vector2.ZERO
var rooms: Array = []
var doors: Array = []
## The chests, barrels and urns ({i, kind, x, y, tx, ty, state, solid}: props.gd opens and breaks them).
var props: Array = []
var shut := PackedByteArray()
var pier := PackedByteArray()
## (any floor: its names ({name, level}: defs.ts floorTitle), its ways on (game/ways.ts: ways.gd), its traps' spots, where
## the fallen wordsmith lies)
var title := {}
var ways = null
var hazards: Array = []
var body = null


func _init(path: String) -> void:
	var data: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(path))
	depth = int(data["depth"])
	map_seed = int(data["seed"])
	w = int(data["w"])
	h = int(data["h"])
	tiles = _bytes(data["tiles"])
	variant = _bytes(data["variant"])
	if data.get("cut") != null:
		cut = _bytes(data["cut"])
	walk = _bytes(data["walk"]) if data["walk"] != null else _floor_grid()
	start = Vector2(data["start"]["x"], data["start"]["y"])
	if data["start"].has("fx"):
		start_face = Vector2(data["start"]["fx"], data["start"]["fy"])
	rooms = data["rooms"]
	doors = data.get("doors", [])
	props = data.get("props", [])
	title = data.get("title", {})
	ways = data.get("ways")
	hazards = data.get("hazards", [])
	body = data.get("body")
	shut.resize(w * h)
	pier.resize(w * h)
	for d in doors:
		if d["kind"] == "door" and int(d["want"]) == 0:
			for i in d["way"]:
				shut[int(i)] = 1
		for i in d["piers"]:
			pier[int(i)] = 1


func tile(tx: int, ty: int) -> int:
	if tx < 0 or ty < 0 or tx >= w or ty >= h:
		return VOID
	return tiles[ty * w + tx]


func walkable(tx: int, ty: int) -> bool:
	return tx >= 0 and ty >= 0 and tx < w and ty < h and walk[ty * w + tx] != 0


## Ground a monster may walk on: the walk grid, less a shut door (game.ts free and slide, with the shut grid).
func passable(tx: int, ty: int) -> bool:
	return walkable(tx, ty) and shut[ty * w + tx] == 0


## Whether sight and shots pass a tile: floor (or a pit), not a shut door nor a gate that is down (game/level.ts open).
func open_at(tx: int, ty: int) -> bool:
	var t := tile(tx, ty)
	return (t == FLOOR or t == PIT) and shut[ty * w + tx] == 0


## Whether a tile is the stone either side of a door.
func pier_at(tx: int, ty: int) -> bool:
	return tx >= 0 and ty >= 0 and tx < w and ty < h and pier[ty * w + tx] == 1


## The room of that id, or an empty one.
func room(id: int) -> Dictionary:
	for r in rooms:
		if int(r.get("id", -1)) == id:
			return r
	return {}


## Whether a place is inside a room.
static func in_room(r: Dictionary, at: Vector2) -> bool:
	return not r.is_empty() and at.x >= r["x"] and at.y >= r["y"] and at.x < r["x"] + r["w"] and at.y < r["y"] + r["h"]


## The faces of the wall block at tile `i` that have floor before them (render/walls.ts wallFaces): 1 the one turned to
## screen-left (floor at y + 1), 2 the one turned to screen-right (floor at x + 1); a tile cut away on that side is no floor.
func wall_faces(i: int) -> int:
	var tx := i % w
	var ty := i / w
	var out := 0
	if ty + 1 < h and _open_cut(i + w, 4):
		out += 1
	if tx + 1 < w and _open_cut(i + 1, 3):
		out += 2
	return out


func _open_cut(j: int, shut_cut: int) -> bool:
	var c := int(cut[j]) if j < cut.size() else 0
	return tiles[j] == PIT or (tiles[j] == FLOOR and c != 1 and c != shut_cut)


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

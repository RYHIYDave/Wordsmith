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
## LEDGES AND STAIRS (game/height.ts): how many levels up each floor tile stands (less than 0: sunken); which floor tiles are
## a flight of stairs and which way each goes up (1: toward -y, 2: toward -x); and the side steps a body may take from each
## tile by the rules of height, as the game made them (bits: 1 to +x, 2 to -x, 4 to +y, 8 to -y; empty: a floor all of one
## height, every step as it always was).
var height := PackedInt32Array()
var stair := PackedByteArray()
var step := PackedByteArray()
var start := Vector2.ZERO
## (the way he faces as he comes in, where the export says: tools/godot_export.ts)
var start_face := Vector2.ZERO
var rooms: Array = []
var doors: Array = []
## The chests, barrels and urns ({i, kind, x, y, tx, ty, state, solid}: props.gd opens and breaks them).
var props: Array = []
var shut := PackedByteArray()
var pier := PackedByteArray()
## (any floor: its names ({name, level}: defs.ts floorTitle), its ways on as the game keeps them (game/ways.ts: ways.gd, for
## the floors whose look is recorded from the game), where the fallen wordsmith lies)
var title := {}
var ways = null
var body = null
## THE STAIRWELL DOWN (game/ways.ts stairSpots): the places in the boss's hall where it may open, {x, y, way}, the nearest
## his hall's middle first (stairs.gd opens it as he falls); and the floor's waypoint {x, y}, where it has one.
var stairs: Array = []
var waypoint = null
## THE TRAPS (game/traps.ts): spike floors {kind, x, y, w, h, phase} and dart walls {kind, x, y, w, h, slot} (traps.gd).
var hazards: Array = []
## THE MIX (game/dungeon.ts): each lever's tile and the room whose way in its gate bars, {x, y, room} (a prop of kind
## "lever" stands on it); the rooms carry `gated`, `nook` and `locks` where the map-maker marked them.
var levers: Array = []
## QUESTS15, floor 3 while its furnace burns: {crank (its place among the props), keeper (the Stoker's id), gate (the door its
## fire bars), room, spot}, and the Stoker's arena {room, hall, furnace, crank, keeper}; null elsewhere.
var furnace = null
var arena = null
## FLOOR 5: the temple's door and its keys {door, keys, need, chain, at} (game/temple_door.ts), and the bone heaps of the
## Fleshmancer's hall [{x, y}]; null elsewhere.
var temple = null
var heaps = null


func _init(path: String) -> void:
	var data: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(path))
	depth = int(data["depth"])
	map_seed = int(data["seed"])
	w = int(data["w"])
	h = int(data["h"])
	tiles = _bytes(data["tiles"])
	variant = _bytes(data["variant"])
	# (the town's layout keeps its stairs down under `stair`, a place, not a grid: only a grid is taken here)
	if data.get("cut") is Array:
		cut = _bytes(data["cut"])
	if data.get("height") is Array:
		height.resize(data["height"].size())
		for i in data["height"].size():
			height[i] = int(data["height"][i])
	if data.get("stair") is Array:
		stair = _bytes(data["stair"])
	if data.get("step") is Array:
		step = _bytes(data["step"])
	walk = _bytes(data["walk"]) if data["walk"] != null else _floor_grid()
	start = Vector2(data["start"]["x"], data["start"]["y"])
	if data["start"].has("fx"):
		start_face = Vector2(data["start"]["fx"], data["start"]["fy"])
	rooms = data["rooms"]
	doors = data.get("doors", [])
	props = data.get("props", [])
	title = data.get("title", {})
	ways = data.get("ways")
	body = data.get("body")
	stairs = data.get("stairs", [])
	waypoint = data.get("waypoint", null)
	hazards = data.get("hazards", [])
	levers = data.get("levers", [])
	furnace = data.get("furnace")
	arena = data.get("arena")
	temple = data.get("temple")
	heaps = data.get("heaps")
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


# --- THE GROUND A BODY STANDS ON: heights, steps and the tiles cut corner to corner (game/height.ts, game/cut.ts, game.ts free
# and slide) ---

## How high one level of raised floor stands, in picture pixels (engine/iso.ts LEDGE_H, 12 game pixels).
const LEDGE_H := 24.0
## The stone on either side of a door holds a body off by no more than this, however big the body (game/doors.ts PIER_HOLD).
const PIER_HOLD := 0.4
const R2 := 0.7071067811865476


## How many levels up the GROUND is at a place (height.ts levelAt): a whole number on plain floor; on a flight of stairs it
## rises evenly from the foot to the head; 0 off the map, in a wall and over a pit.
func level_at(x: float, y: float) -> float:
	var tx := floori(x)
	var ty := floori(y)
	if tx < 0 or ty < 0 or tx >= w or ty >= h:
		return 0.0
	var i := ty * w + tx
	if tiles[i] != FLOOR:
		return 0.0
	var base := float(height[i]) if i < height.size() else 0.0
	var st := int(stair[i]) if i < stair.size() else 0
	if st == 1:
		return base + clampf(1.0 - (y - ty), 0.0, 1.0)
	if st == 2:
		return base + clampf(1.0 - (x - tx), 0.0, 1.0)
	return base


## How far up the screen what stands at a place is drawn, in picture pixels (the renderer's camera lift).
func lift_at(x: float, y: float) -> float:
	return level_at(x, y) * LEDGE_H


## Which half of a cut tile is wall (cut.ts cutHalf): 1 far, 2 near, 3 left, 4 right; 0 for a whole tile.
static func cut_half(c: int) -> int:
	return c if c <= 4 else c - 4


## How far a place in a tile's own measure lies INTO the wall half of a tile cut `c`, in tiles (less than 0: out on the floor).
static func into_wall(c: int, u: float, v: float) -> float:
	match cut_half(c):
		1:
			return (1.0 - u - v) * R2
		2:
			return (u + v - 1.0) * R2
		3:
			return (v - u) * R2
		4:
			return (u - v) * R2
	return -1.0


static func _from_stretch(px: float, py: float, ax: float, ay: float, bx: float, by: float) -> float:
	var dx := bx - ax
	var dy := by - ay
	var len := dx * dx + dy * dy
	var t := clampf(((px - ax) * dx + (py - ay) * dy) / len, 0.0, 1.0) if len > 0.0 else 0.0
	var qx := ax + dx * t - px
	var qy := ay + dy * t - py
	return qx * qx + qy * qy


## Does a round body `r` across its half, its middle at (x, y), reach into the wall half of the cut tile (tx, ty)
## (cut.ts bodyInWall)?
static func body_in_wall(c: int, tx: int, ty: int, x: float, y: float, r: float) -> bool:
	var u := x - tx
	var v := y - ty
	if u >= 0.0 and u <= 1.0 and v >= 0.0 and v <= 1.0 and into_wall(c, u, v) > 0.0:
		return true
	var k: Array
	match cut_half(c):
		1:
			k = [1, 0, 0, 1, 0, 0]
		2:
			k = [1, 0, 0, 1, 1, 1]
		3:
			k = [0, 0, 1, 1, 0, 1]
		_:
			k = [0, 0, 1, 1, 1, 0]
	var near := r * r - 1e-9
	return _from_stretch(u, v, k[0], k[1], k[2], k[3]) < near or _from_stretch(u, v, k[2], k[3], k[4], k[5]) < near or _from_stretch(u, v, k[4], k[5], k[0], k[1]) < near


## Is a place in the wall half of a tile cut corner to corner (cut.ts inWall)?
func in_wall(x: float, y: float) -> bool:
	var tx := floori(x)
	var ty := floori(y)
	if tx < 0 or ty < 0 or tx >= w or ty >= h:
		return false
	var c := int(cut[ty * w + tx]) if ty * w + tx < cut.size() else 0
	return c != 0 and into_wall(c, x - tx, y - ty) > 0.0


## May a body whose middle is on tile (hx, hy) also lie over the tile (tx, ty) next to it (height.ts mayOverlap)? Over a
## diagonal one only if it could get there both ways round: the corner of a ledge and of a flight of stairs are solid.
func may_overlap(hx: int, hy: int, tx: int, ty: int) -> bool:
	var dx := tx - hx
	var dy := ty - hy
	if dx == 0 and dy == 0:
		return true
	var i := hy * w + hx
	var bx := 1 if dx > 0 else 2
	var by := 4 if dy > 0 else 8
	if dy == 0:
		return step[i] & bx != 0
	if dx == 0:
		return step[i] & by != 0
	return step[i] & bx != 0 and step[i + dx] & by != 0 and step[i] & by != 0 and step[i + dy * w] & bx != 0


## Does a body of radius r fit at (x, y) (game.ts free, on the walk grid)? Every tile under it must be one a body may stand
## on; on a floor with heights it lies over ground of one height only (a ledge is as solid as a wall, a flight of stairs is
## entered at its ends); the floor half of a tile cut corner to corner may be stood on, its wall half holds a body off.
## `flat`: the walls and the things alone, as if the floor were all of one height. `held`: a monster's step, which a shut
## door holds.
func fits(x: float, y: float, r: float, flat := false, held := false) -> bool:
	var hx := floori(x)
	var hy := floori(y)
	var stepped := not flat and not step.is_empty()
	var big := r > PIER_HOLD
	for ty in range(floori(y - r), floori(y + r) + 1):
		for tx in range(floori(x - r), floori(x + r) + 1):
			if tx < 0 or ty < 0 or tx >= w or ty >= h:
				return false
			var i := ty * w + tx
			if held and shut[i] == 1:
				return false
			if big and pier[i] == 1 and (tx < floori(x - PIER_HOLD) or tx > floori(x + PIER_HOLD) or ty < floori(y - PIER_HOLD) or ty > floori(y + PIER_HOLD)):
				continue
			var c := int(cut[i]) if i < cut.size() else 0
			if c != 0:
				if body_in_wall(c, tx, ty, x, y, r):
					return false
				if tiles[i] != FLOOR:
					# (a cut WALL tile is nothing in its other half: nobody's middle is ever in one; its shape alone holds a body off)
					if tx == hx and ty == hy:
						return false
					continue
			elif walk[i] == 0:
				return false
			if stepped and not may_overlap(hx, hy, tx, ty):
				if not (big and tx != hx and ty != hy and (pier[hy * w + tx] == 1 or pier[ty * w + hx] == 1)):
					return false
	return true


## Move a body, sliding along walls (game.ts slide): each half of the step taken where the body fits; a wall that slants (a tile
## cut corner to corner) slid along; a body astride a ledge walks as if the floor were of one height until it is on ground
## of one height again. Where it ends.
func slide(at: Vector2, r: float, d: Vector2, held := false) -> Vector2:
	if held:
		# (a monster that already lies over a shut door's tile, set down there by the dice, is not held: it walks out of it)
		for ty in range(floori(at.y - r), floori(at.y + r) + 1):
			for tx in range(floori(at.x - r), floori(at.x + r) + 1):
				if tx >= 0 and ty >= 0 and tx < w and ty < h and shut[ty * w + tx] == 1:
					held = false
	var b := at
	var ok_x := d.x != 0.0 and fits(b.x + d.x, b.y, r, false, held)
	if ok_x:
		b.x += d.x
	var ok_y := d.y != 0.0 and fits(b.x, b.y + d.y, r, false, held)
	if ok_y:
		b.y += d.y
	if (ok_x or d.x == 0.0) and (ok_y or d.y == 0.0):
		return b
	if not cut.is_empty():
		if d.x != 0.0 and not ok_x:
			b = _slide_along_cut(b, r, Vector2(d.x, 0.0), held)
		if d.y != 0.0 and not ok_y:
			b = _slide_along_cut(b, r, Vector2(0.0, d.y), held)
	if step.is_empty() or fits(b.x, b.y, r) or not fits(b.x, b.y, r, true):
		return b
	if d.x != 0.0 and not ok_x and fits(b.x + d.x, b.y, r, true, held):
		b.x += d.x
	if d.y != 0.0 and not ok_y and fits(b.x, b.y + d.y, r, true, held):
		b.y += d.y
	return b


## The step a slanting wall refused, taken along the cut instead, at the pace the step had along it (game.ts slideAlongCut).
func _slide_along_cut(b: Vector2, r: float, d: Vector2, held: bool) -> Vector2:
	var n := b + d
	var c := 0
	for ty in range(floori(n.y - r), floori(n.y + r) + 1):
		if c != 0:
			break
		for tx in range(floori(n.x - r), floori(n.x + r) + 1):
			if tx < 0 or ty < 0 or tx >= w or ty >= h:
				continue
			var i := ty * w + tx
			var ci := int(cut[i]) if i < cut.size() else 0
			if ci != 0 and body_in_wall(ci, tx, ty, n.x, n.y, r):
				c = ci
				break
	if c == 0:
		return b
	var half := cut_half(c)
	var a := Vector2(R2, -R2) if half == 1 or half == 2 else Vector2(R2, R2)
	var along := d.dot(a)
	if absf(along) < 1e-9:
		return b
	var s := a * along
	if fits(b.x + s.x, b.y + s.y, r, false, held):
		return b + s
	return b


## A way opened through a wall on a floor with heights (floor 3's door out the back, floor 4's cave: game.ts joinSteps): the
## rules of height were laid when its tiles were wall and know no step onto them; each is joined to the others and to every
## tile walked on beside it that is not a stair.
func join_steps(opened: Array) -> void:
	if step.is_empty():
		return
	for i in opened:
		var x: int = int(i) % w
		var y: int = int(i) / w
		for q in [[1, 0, 1, 2], [-1, 0, 2, 1], [0, 1, 4, 8], [0, -1, 8, 4]]:
			var nx: int = x + q[0]
			var ny: int = y + q[1]
			if nx < 0 or ny < 0 or nx >= w or ny >= h:
				continue
			var n := ny * w + nx
			if not opened.has(n) and (walk[n] != 1 or tiles[n] != FLOOR or (n < stair.size() and stair[n] != 0)):
				continue
			step[int(i)] = step[int(i)] | q[2]
			step[n] = step[n] | q[3]


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

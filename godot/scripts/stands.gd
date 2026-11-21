## Everything that stands on the floor, in the painter's order the game uses (render.ts: a wall block's faces at depth
## tx + ty + 1, a body at x + y; the nearer the eye, the later): Godot's y-sort does it, since a node's screen y is its
## depth times 16 picture pixels.
##
## THE WALLS (render/walls.ts): a wall is the upright planes behind the far edges of floor (`wallFaces`), and on floors
## 1 to 5 every wall stands, its faces turned to the eye drawn too where it bounds floor (WHOLE_WALLS, `wholeFaces`).
## Every wall between the eye and the hero fades to faint across a wide stretch round him (WHOLE_WALLS: across 96 game
## pixels, wholly within 60% of that, faint 0.2, 0.2 s to fade and to come back).
extends Node2D

const Iso := preload("res://scripts/iso.gd")
const FloorMap := preload("res://scripts/floor_map.gd")
const GroundArt := preload("res://scripts/ground_art.gd")
const Hero := preload("res://scripts/hero.gd")

const FACE_LEFT := 1
const FACE_RIGHT := 2
const ACROSS := 192.0  # 96 game pixels
const FAINT := 0.2
const SECS := 0.2
## (how tall a wall face stands over its tile's top vertex, and how far below it its foot reaches: picture pixels)
## (render.ts wallVeil: a wall more than 70 game pixels below the hero's feet, counted from its top less WALL_LOOK.tall, or
## more than 88 above them, is not seen through; picture pixels here)
const WALL_TALL := 80.0

var map: FloorMap
var art: GroundArt
var hero: Hero
## (false where the place's recorded look brings its own walls: look.gd adds them with add_wall)
var build_walls := true
## (true where every wall stands and those between the eye and the hero fade: floors 1 to 5, WHOLE_WALLS; not the town's hall)
var fade := true
var _walls: Array[Sprite2D] = []
var _depths := PackedFloat32Array()
var _tops := PackedVector2Array()
var _backs: Array[Vector3i] = []


## A wall face drawn by the place's look: faded round the hero as the others are. `top`: its tile's top corner on the
## screen (picture px).
func add_wall(s: Sprite2D, d: float, top: Vector2, tile := -1) -> void:
	_walls.append(s)
	_depths.append(d)
	_tops.append(top)
	_backs.append(_back_of(top))


## BACK_STAND (render.ts wallVeil): the faces of the wall whose tile's top corner is `top` that look out over floor (walls.ts
## wallFaces), and its tile: a face that looks out over the ground he stands on is a back wall to him, never seen through.
func _back_of(top: Vector2) -> Vector3i:
	var a := top.x / Iso.HW
	var b := top.y / Iso.HH
	var tx := roundi((a + b) / 2.0)
	var ty := roundi((b - a) / 2.0)
	var faces := 0
	if map != null and _open(tx, ty + 1):
		faces |= FACE_LEFT
	if map != null and _open(tx + 1, ty):
		faces |= FACE_RIGHT
	return Vector3i(tx, ty, faces)


func _ready() -> void:
	y_sort_enabled = true
	if not build_walls:
		return
	for ty in map.h:
		for tx in map.w:
			if map.tile(tx, ty) != FloorMap.WALL:
				continue
			var which := _faces(tx, ty)
			if which & FACE_LEFT:
				_stand(art.face(true, map.variant_at(tx, ty)), tx, ty)
			if which & FACE_RIGHT:
				_stand(art.face(false, map.variant_at(tx, ty)), tx, ty)


## Which faces of the wall block at (tx, ty) are drawn (walls.ts wholeFaces): the one turned to screen-left if floor lies
## before it at (x, y + 1), the one turned to screen-right if at (x + 1, y); and where the block bounds floor, each face
## turned to the eye with nothing at all before it.
func _faces(tx: int, ty: int) -> int:
	var out := 0
	if _open(tx, ty + 1):
		out |= FACE_LEFT
	if _open(tx + 1, ty):
		out |= FACE_RIGHT
	var bounds := false
	for dy in [-1, 0, 1]:
		for dx in [-1, 0, 1]:
			if _open(tx + dx, ty + dy):
				bounds = true
	if bounds:
		if not (out & FACE_LEFT) and map.tile(tx, ty + 1) == FloorMap.VOID:
			out |= FACE_LEFT
		if not (out & FACE_RIGHT) and map.tile(tx + 1, ty) == FloorMap.VOID:
			out |= FACE_RIGHT
	return out


func _open(tx: int, ty: int) -> bool:
	var t := map.tile(tx, ty)
	return t == FloorMap.FLOOR or t == FloorMap.PIT


func _stand(p: Dictionary, tx: int, ty: int) -> void:
	var s := Sprite2D.new()
	s.texture = art.sheet
	s.region_enabled = true
	s.region_rect = p["rect"]
	s.centered = false
	# (its node at its depth, tx + ty + 1; its picture hung from the top vertex of its tile, one row of 16 above that)
	var top := Iso.to_screen(tx, ty)
	s.position = top + Vector2(0, Iso.HH * 2.0)
	s.offset = -p["anchor"] - Vector2(0, Iso.HH * 2.0)
	add_child(s)
	_walls.append(s)
	_depths.append(tx + ty + 1)
	_tops.append(top)
	_backs.append(_back_of(top))


## render.ts wallVeil, for the hero: a wall he is behind (his depth short of its own by half a tile) and near on the screen is
## seen through, faint wholly within 60% of 96 game pixels either side of him (counted from 16 beyond his middle), fading back
## to whole at 96; a back wall to him never.
func _process(dt: float) -> void:
	if hero == null or not fade:
		return
	var hd: float = hero.world.x + hero.world.y
	var hp := hero.position
	var step := dt * (1.0 - FAINT) / SECS
	for i in _walls.size():
		var want := 1.0
		var top := _tops[i]
		var bk := _backs[i]
		var back := (bk.z & FACE_LEFT and hero.world.y >= bk.y + 1) or (bk.z & FACE_RIGHT and hero.world.x >= bk.x + 1)
		if hd < _depths[i] - 0.5 and not back and top.y - WALL_TALL <= hp.y + 60.0 and top.y + 32.0 >= hp.y - 144.0:
			var off := maxf(0.0, absf(top.x - hp.x) - 32.0)
			if off < ACROSS:
				want = FAINT if off <= ACROSS * 0.6 else FAINT + (1.0 - FAINT) * (off - ACROSS * 0.6) / (ACROSS * 0.4)
		var s := _walls[i]
		if s.modulate.a != want:
			s.modulate.a = move_toward(s.modulate.a, want, step)

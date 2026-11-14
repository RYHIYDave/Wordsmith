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
const WALL_TOP := 80.0
const WALL_FOOT := 32.0
const HERO_TALL := 90.0

var map: FloorMap
var art: GroundArt
var hero: Hero
var _walls: Array[Sprite2D] = []
var _depths := PackedFloat32Array()
var _tops := PackedVector2Array()


func _ready() -> void:
	y_sort_enabled = true
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


func _process(dt: float) -> void:
	if hero == null:
		return
	var hd: float = hero.world.x + hero.world.y
	var hp := hero.position
	var step := dt * (1.0 - FAINT) / SECS
	for i in _walls.size():
		var want := 1.0
		var top := _tops[i]
		var dx := absf(top.x - hp.x)
		if _depths[i] > hd and dx < ACROSS and top.y - WALL_TOP < hp.y and top.y + WALL_FOOT > hp.y - HERO_TALL:
			want = lerpf(FAINT, 1.0, clampf((dx - ACROSS * 0.6) / (ACROSS * 0.4), 0.0, 1.0))
		var s := _walls[i]
		if s.modulate.a != want:
			s.modulate.a = move_toward(s.modulate.a, want, step)

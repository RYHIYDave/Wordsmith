## The floor: every floor tile's stone, laid back to front, and over it the shadow of a wall that stands at its far side
## (render/render.ts floorTile; the light is from the upper left): shadeLeft where a wall stands at x - 1, shadeRight
## at y - 1, and shadeCorner where neither does but the tile at x - 1, y - 1 is wall.
## Drawn once: Godot keeps what _draw drew until it is asked to draw again.
extends Node2D

const Iso := preload("res://scripts/iso.gd")
const FloorMap := preload("res://scripts/floor_map.gd")
const GroundArt := preload("res://scripts/ground_art.gd")

var map: FloorMap
var art: GroundArt


func _draw() -> void:
	for s in range(0, map.w + map.h - 1):
		for tx in range(maxi(0, s - map.h + 1), mini(map.w, s + 1)):
			var ty := s - tx
			if map.tile(tx, ty) != FloorMap.FLOOR:
				continue
			var at := Iso.to_screen(tx, ty)
			_lay(art.floor_at(tx, ty), at)
			var wl := map.tile(tx - 1, ty) == FloorMap.WALL
			var wr := map.tile(tx, ty - 1) == FloorMap.WALL
			if wl:
				_lay(art.picture("shadeLeft"), at)
			if wr:
				_lay(art.picture("shadeRight"), at)
			if not wl and not wr and map.tile(tx - 1, ty - 1) == FloorMap.WALL:
				_lay(art.picture("shadeCorner"), at)


func _lay(p: Dictionary, at: Vector2) -> void:
	var r: Rect2 = p["rect"]
	draw_texture_rect_region(art.sheet, Rect2(at - p["anchor"], r.size), r)
